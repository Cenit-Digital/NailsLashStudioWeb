import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * F-27 `catalogo_fotos` @s17-@s19 — GUARDAS DE FUENTE Y DE FICHERO: lo que ni el render (la clase del
 * módulo no es comportamiento observable) ni Stryker ven. Se leen BYTES, como `contacto-fuente.test.ts`
 * (F-12 @s15). No son mutables: que muerden se demuestra por SABOTAJE en
 * `progress/tdd_catalogo_fotos.md`. Contrato: features/catalogo_fotos.feature.
 */
const RUTA_COMPONENTE = 'src/components/Catalogo.tsx'

function ocurrencias(texto: string, sub: string): number {
  return texto.split(sub).length - 1
}

describe('@s17 en la fuente del componente, la clase del hueco la lleva la img y la foto llega por el dato', () => {
  it('@s17 "estilos.foto" aparece EXACTAMENTE una vez, DENTRO de la etiqueta <img … />', () => {
    const fuente = readFileSync(RUTA_COMPONENTE, 'utf8')

    expect(ocurrencias(fuente, 'estilos.foto')).toBe(1)

    const clase = fuente.indexOf('estilos.foto')
    const aperturaImg = fuente.lastIndexOf('<img', clase)
    const cierreImg = fuente.indexOf('/>', aperturaImg)

    expect(aperturaImg, 'no hay ningún <img antes de la clase del hueco').toBeGreaterThanOrEqual(0)
    expect(clase).toBeLessThan(cierreImg)
  })

  it('@s17 la fuente NO contiene "aria-hidden" ni ".jpg" ni "assets/": no importa fotos, las recibe del dato', () => {
    const fuente = readFileSync(RUTA_COMPONENTE, 'utf8')

    // Ancla positiva: se leyó el componente del catálogo, no un fichero vacío.
    expect(fuente).toContain('export function Catalogo')
    expect(fuente).not.toContain('aria-hidden')
    expect(fuente).not.toContain('.jpg')
    expect(fuente).not.toContain('assets/')
  })
})

const RUTA_DATOS = 'src/lib/demo/catalogo-demo.ts'

describe('@s18 los tres import de las fotos viven en el fichero de datos, estáticos y locales', () => {
  /** Las rutas de TODAS las sentencias `import` de ficheros «.jpg» de la fuente de datos. */
  function rutasImportJpg(): string[] {
    const fuente = readFileSync(RUTA_DATOS, 'utf8')

    return [...fuente.matchAll(/^\s*import\b[^'"\n]*['"]([^'"]*\.jpg)['"]/gm)].map(
      (coincidencia) => coincidencia[1],
    )
  }

  it('@s18 hay EXACTAMENTE tres, y cada ruta termina en uno de los tres ficheros de assets/servicios/', () => {
    const rutas = rutasImportJpg()
    const esperadas = [
      'assets/servicios/servicio-unas-manicura-nude.jpg',
      'assets/servicios/servicio-facial-pestanas.jpg',
      'assets/servicios/servicio-depilacion-piel-suave.jpg',
    ]

    expect(rutas).toHaveLength(3)
    for (const esperada of esperadas) {
      expect(
        rutas.filter((ruta) => ruta.endsWith(esperada)),
        esperada,
      ).toHaveLength(1)
    }
  })

  it('@s18 ninguna ruta de import empieza por "http://", "https://" ni "//"', () => {
    const rutas = rutasImportJpg()

    // Ancla positiva: hay rutas que inspeccionar.
    expect(rutas).toHaveLength(3)
    for (const ruta of rutas) {
      expect(ruta).not.toMatch(/^(?:https?:)?\/\//)
    }
  })
})

const CARPETA_FOTOS = 'src/assets/servicios'

const FICHEROS_FOTO = [
  'servicio-unas-manicura-nude.jpg',
  'servicio-facial-pestanas.jpg',
  'servicio-depilacion-piel-suave.jpg',
]

const PREFIJO_MARCADOR = 0xff
const MARCADOR_SOI = 0xd8
const MARCADOR_SOS = 0xda
const MARCADOR_APP1 = 0xe1
/** SOF0 (base), SOF1 (secuencial extendido) y SOF2 (progresivo). */
const MARCADORES_SOF = [0xc0, 0xc1, 0xc2]

interface SegmentoJpeg {
  readonly marcador: number
  readonly datos: Buffer
}

/** Los segmentos de cabecera de un JPEG, de SOI hasta SOS (lo que sigue es imagen comprimida). */
function segmentosJpeg(bytes: Buffer): SegmentoJpeg[] {
  if (bytes[0] !== PREFIJO_MARCADOR || bytes[1] !== MARCADOR_SOI) {
    throw new Error('no es un JPEG: no empieza por SOI (FF D8)')
  }

  const segmentos: SegmentoJpeg[] = []
  let posicion = 2

  while (posicion + 4 <= bytes.length) {
    if (bytes[posicion] !== PREFIJO_MARCADOR) {
      throw new Error(`se esperaba un marcador en el byte ${posicion}`)
    }

    const marcador = bytes[posicion + 1]

    if (marcador === PREFIJO_MARCADOR) {
      posicion += 1
      continue
    }

    const longitud = bytes.readUInt16BE(posicion + 2)

    segmentos.push({ marcador, datos: bytes.subarray(posicion + 4, posicion + 2 + longitud) })

    if (marcador === MARCADOR_SOS) {
      break
    }

    posicion += 2 + longitud
  }

  return segmentos
}

function segmentosDe(fichero: string): SegmentoJpeg[] {
  return segmentosJpeg(readFileSync(`${CARPETA_FOTOS}/${fichero}`))
}

describe('@s19 los tres ficheros de foto miden de verdad 800 × 1000 y no llevan metadatos EXIF', () => {
  for (const fichero of FICHEROS_FOTO) {
    it(`@s19 ${fichero}: su marcador SOF declara exactamente 800 de ancho y 1000 de alto`, () => {
      const tramas = segmentosDe(fichero).filter((segmento) =>
        MARCADORES_SOF.includes(segmento.marcador),
      )

      expect(tramas).toHaveLength(1)
      // SOF: precisión (1 byte), alto (2 bytes) y ancho (2 bytes), big-endian.
      expect(tramas[0].datos.readUInt16BE(3)).toBe(800)
      expect(tramas[0].datos.readUInt16BE(1)).toBe(1000)
    })

    it(`@s19 ${fichero}: ningún segmento APP1 empieza por "Exif"`, () => {
      const segmentos = segmentosDe(fichero)

      // Ancla positiva: se recorrió la cabecera hasta encontrar su SOF.
      expect(segmentos.some((segmento) => MARCADORES_SOF.includes(segmento.marcador))).toBe(true)

      const exif = segmentos.filter(
        (segmento) =>
          segmento.marcador === MARCADOR_APP1 &&
          segmento.datos.subarray(0, 4).toString('latin1') === 'Exif',
      )

      expect(exif).toHaveLength(0)
    })
  }
})
