import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { inflateSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

/**
 * F-28 `favicon_marca` @s1-@s7 (`features/favicon_marca.feature`) — sobre BYTES: `readFileSync` y, para
 * los raster, `node:zlib`. Sin render, sin jsdom, sin ejecutar el generador.
 *
 * 🔴 ESTE FICHERO NO IMPORTA NADA DE `src/` (FS-5) NI EL GENERADOR (FS-3: sería el generador probándose
 * a sí mismo), y NO re-rasteriza el SVG. Lo que va A MANO lo fija la sección «ANTI-TAUTOLOGÍA» del
 * contrato: rutas, "32x32", "image/svg+xml", "18", "round", las medidas 16/32/180, los tipos de color 6 y
 * 2, las cajas de @s7 y el ancla del oráculo. El `d` de la «N» sale del ORÁCULO
 * (`docs/research/favicon/aprobado-B.svg`, FS-2) y los dos colores, de `_tokens.scss` (FM-7): NINGÚN hex
 * se escribe a mano aquí.
 */

/**
 * La extracción de ELEMENTOS por atributos, escrita A MANO (la misma forma que la de F-04 @s40 en
 * `home-horneado.test.ts`, sin importarla): mira NOMBRES de atributo en minúsculas, nunca subcadenas de la
 * etiqueta. Valores entre comillas dobles, simples o sin comillas; sin valor vale ''. Ante un nombre
 * repetido gana el PRIMERO, como en el parser de HTML.
 */
const ATRIBUTO = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

type Atributos = ReadonlyMap<string, string>

function atributosDe(texto: string): Atributos {
  const atributos = new Map<string, string>()

  for (const [, nombre, dobles, simples, sinComillas] of texto.matchAll(ATRIBUTO)) {
    const clave = nombre.toLowerCase()

    if (!atributos.has(clave)) {
      atributos.set(clave, dobles ?? simples ?? sinComillas ?? '')
    }
  }

  return atributos
}

/** Los elementos `<etiqueta …>` de `texto`, sin distinguir mayúsculas en el nombre de la etiqueta. */
function elementosDe(texto: string, etiqueta: string): readonly Atributos[] {
  const apertura = new RegExp(`<${etiqueta}(?=[\\s/>])([^>]*)>`, 'gi')

  return [...texto.matchAll(apertura)].map((encontrado) => atributosDe(encontrado[1]))
}

/** Un valor enumerado de HTML (`rel`, `type`, `sizes`) se compara sin distinguir mayúsculas. */
function valorDe(elemento: Atributos, nombre: string): string | undefined {
  return elemento.get(nombre)?.toLowerCase()
}

// ── @s1 · los <link> de icono de index.html ─────────────────────────────────────────────────────────

const RELS_DE_ICONO: readonly string[] = ['icon', 'apple-touch-icon']

/** Su `rel`, partido en tokens por espacios y sin distinguir mayúsculas, contiene un rel de icono. */
function esIcono(link: Atributos): boolean {
  const tokens = (valorDe(link, 'rel') ?? '').split(/\s+/)

  return tokens.some((token) => RELS_DE_ICONO.includes(token))
}

function iconosDe(texto: string): readonly Atributos[] {
  return elementosDe(texto, 'link').filter(esIcono)
}

const APERTURA_DEL_HEAD = '<head>'
const CIERRE_DEL_HEAD = '</head>'

/** El fragmento entre el literal `<head>` (F-04 @s33) y `</head>`; vacío si falta alguno de los dos. */
function fragmentoDelHead(html: string): string {
  const inicio = html.indexOf(APERTURA_DEL_HEAD)
  const fin = html.indexOf(CIERRE_DEL_HEAD)

  return inicio < 0 || fin < inicio ? '' : html.slice(inicio + APERTURA_DEL_HEAD.length, fin)
}

function indexHtml(): string {
  return readFileSync(resolve('index.html'), 'utf8')
}

function iconosDelHead(): readonly Atributos[] {
  return iconosDe(fragmentoDelHead(indexHtml()))
}

const BASE_ESCRITA_A_MANO = '/NailsLashStudioWeb/'

/** Un `href` que trae la base escrita a mano, es relativo al protocolo o lleva un esquema. */
function hrefProhibido(href: string): boolean {
  return href.startsWith(BASE_ESCRITA_A_MANO) || href.startsWith('//') || href.includes(':')
}

describe('@s1 index.html declara en <head>, en orden, el ICO (32x32), el SVG y el apple-touch-icon — sin la base', () => {
  it('@s1 ANCLA POSITIVA: EXACTAMENTE 3 <link> de icono en <head>, y EXACTAMENTE 3 en el fichero entero', () => {
    expect(iconosDelHead()).toHaveLength(3)
    expect(iconosDe(indexHtml())).toHaveLength(3)
  })

  it('@s1 el 1.º: rel "icon", href exactamente "/favicon.ico" y sizes "32x32"', () => {
    const [ico] = iconosDelHead()

    expect(valorDe(ico, 'rel')).toBe('icon')
    expect(ico.get('href')).toBe('/favicon.ico')
    expect(valorDe(ico, 'sizes')).toBe('32x32')
  })

  it('@s1 el 2.º: rel "icon", href exactamente "/favicon.svg" y type "image/svg+xml"', () => {
    const [, svg] = iconosDelHead()

    expect(valorDe(svg, 'rel')).toBe('icon')
    expect(svg.get('href')).toBe('/favicon.svg')
    expect(valorDe(svg, 'type')).toBe('image/svg+xml')
  })

  it('@s1 el 3.º: rel "apple-touch-icon" y href exactamente "/apple-touch-icon.png"', () => {
    const [, , apple] = iconosDelHead()

    expect(valorDe(apple, 'rel')).toBe('apple-touch-icon')
    expect(apple.get('href')).toBe('/apple-touch-icon.png')
  })

  it('@s1 ningún href empieza por "/NailsLashStudioWeb/" ni por "//", ni contiene ":"', () => {
    // Misma extracción que el ancla; se listan los href culpables para que un fallo diga CUÁLES.
    const hrefs = iconosDe(indexHtml()).map((link) => link.get('href') ?? '')

    expect(hrefs).toHaveLength(3)
    expect(hrefs.filter(hrefProhibido)).toEqual([])
  })
})

// ── Lectura de ficheros ─────────────────────────────────────────────────────────────────────────────

const RUTA_SVG = 'public/favicon.svg'
const RUTA_ORACULO = 'docs/research/favicon/aprobado-B.svg'
const RUTA_ICO = 'public/favicon.ico'
const RUTA_APPLE = 'public/apple-touch-icon.png'
const RUTA_TOKENS = 'src/styles/_tokens.scss'

function texto(ruta: string): string {
  return readFileSync(resolve(ruta), 'utf8')
}

function bytes(ruta: string): Buffer {
  return readFileSync(resolve(ruta))
}

// ── @s2 · la geometría del SVG, por atributos, contra el oráculo ──────────────────────────────────

interface PiezasDelSvg {
  readonly svg: readonly Atributos[]
  readonly rect: readonly Atributos[]
  readonly path: readonly Atributos[]
}

function piezasDe(ruta: string): PiezasDelSvg {
  const contenido = texto(ruta)

  return {
    svg: elementosDe(contenido, 'svg'),
    rect: elementosDe(contenido, 'rect'),
    path: elementosDe(contenido, 'path'),
  }
}

const GEOMETRIA_DEL_RECT: readonly string[] = ['x', 'y', 'width', 'height', 'rx']

function elegidos(elemento: Atributos | undefined, nombres: readonly string[]): readonly unknown[] {
  return nombres.map((nombre) => elemento?.get(nombre))
}

describe('@s2 favicon.svg tiene la MISMA geometría que aprobado-B.svg — viewBox, rect, d y trazo de 18 redondo', () => {
  it('@s2 ANCLA POSITIVA: cada fichero tiene EXACTAMENTE un <svg>, un <rect> y un <path>', () => {
    for (const ruta of [RUTA_SVG, RUTA_ORACULO]) {
      const { svg, rect, path } = piezasDe(ruta)

      expect([svg.length, rect.length, path.length]).toEqual([1, 1, 1])
    }
  })

  it('@s2 ANCLA A MANO del oráculo: viewBox, rect y el principio y el fin de su d', () => {
    const { svg, rect, path } = piezasDe(RUTA_ORACULO)
    const d = path[0].get('d') ?? ''

    expect(svg[0].get('viewbox')).toBe('-213 -1132 1618 1618')
    expect(elegidos(rect[0], GEOMETRIA_DEL_RECT)).toEqual(['-213', '-1132', '1618', '1618', '324'])
    expect(d.startsWith('M1001 147Q')).toBe(true)
    expect(d.endsWith('Z')).toBe(true)
  })

  it('@s2 el viewBox y los x, y, width, height y rx del <rect> son IDÉNTICOS, como cadena, a los del oráculo', () => {
    const favicon = piezasDe(RUTA_SVG)
    const oraculo = piezasDe(RUTA_ORACULO)

    expect(favicon.svg[0].get('viewbox')).toBe(oraculo.svg[0].get('viewbox'))
    expect(elegidos(favicon.rect[0], GEOMETRIA_DEL_RECT)).toEqual(
      elegidos(oraculo.rect[0], GEOMETRIA_DEL_RECT),
    )
  })

  it('@s2 el d del <path> es IDÉNTICO, como cadena, al del oráculo', () => {
    expect(piezasDe(RUTA_SVG).path[0].get('d')).toBe(piezasDe(RUTA_ORACULO).path[0].get('d'))
  })

  it('@s2 el <path> lleva stroke-width "18" y stroke-linejoin "round"', () => {
    const [path] = piezasDe(RUTA_SVG).path

    expect(path.get('stroke-width')).toBe('18')
    expect(path.get('stroke-linejoin')).toBe('round')
  })
})

// ── @s3 · el SVG autocontenido ──────────────────────────────────────────────────────────────────────

/** Cuántas veces aparece `literal` en `contenido`, sin distinguir mayúsculas. */
function apariciones(contenido: string, literal: string): number {
  return contenido.toLowerCase().split(literal.toLowerCase()).length - 1
}

const XMLNS_SVG = 'xmlns="http://www.w3.org/2000/svg"'
const ETIQUETAS_VIGILADAS: readonly string[] = [
  '<text',
  '<image',
  '<use',
  '<style',
  '<script',
  '<foreignObject',
]
const REFERENCIAS_VIGILADAS: readonly string[] = ['href', 'url(', '@import']

/** Los cuerpos de los comentarios `<!-- … -->` que hay ANTES de la primera `<svg`. */
function comentariosAntesDelSvg(contenido: string): readonly string[] {
  const inicio = contenido.toLowerCase().indexOf('<svg')
  const prefijo = inicio < 0 ? '' : contenido.slice(0, inicio)

  return [...prefijo.matchAll(/<!--([\s\S]*?)-->/g)].map(([, cuerpo]) => cuerpo.toLowerCase())
}

describe('@s3 favicon.svg es AUTOCONTENIDO y declara que es generado', () => {
  it('@s3 ANCLA POSITIVA: contiene el xmlns del SVG y un "<path"', () => {
    const svg = texto(RUTA_SVG)

    expect(apariciones(svg, XMLNS_SVG)).toBeGreaterThanOrEqual(1)
    expect(apariciones(svg, '<path')).toBeGreaterThanOrEqual(1)
  })

  it('@s3 contiene 0 veces <text, <image, <use, <style, <script y <foreignObject', () => {
    const svg = texto(RUTA_SVG)

    expect(ETIQUETAS_VIGILADAS.filter((etiqueta) => apariciones(svg, etiqueta) > 0)).toEqual([])
  })

  it('@s3 contiene 0 veces "href", "url(" y "@import"', () => {
    const svg = texto(RUTA_SVG)

    expect(REFERENCIAS_VIGILADAS.filter((literal) => apariciones(svg, literal) > 0)).toEqual([])
  })

  it('@s3 contiene EXACTAMENTE 1 vez "http", y es la del xmlns', () => {
    const svg = texto(RUTA_SVG).toLowerCase()

    expect(apariciones(svg, 'http')).toBe(1)
    expect(svg.indexOf('http')).toBe(svg.indexOf(XMLNS_SVG) + 'xmlns="'.length)
  })

  it('@s3 antes de la primera "<svg" hay un comentario con "tools/favicon/generar.mjs" y "no se edita a mano"', () => {
    const comentarios = comentariosAntesDelSvg(texto(RUTA_SVG))

    expect(
      comentarios.some(
        (cuerpo) =>
          cuerpo.includes('tools/favicon/generar.mjs') && cuerpo.includes('no se edita a mano'),
      ),
    ).toBe(true)
  })
})

// ── Los colores, de _tokens.scss (FM-7): ningún hex a mano ──────────────────────────────────────────

type Rgb = readonly [number, number, number]

interface Paleta {
  readonly soft: Rgb
  readonly ink: Rgb
}

const TOKEN_SOFT = '--accent-soft'
const TOKEN_INK = '--ink'

/** El hex `#RRGGBB` que sigue a `token:` en `scss` (`undefined` si no lo hay). */
function hexDelToken(scss: string, token: string): string | undefined {
  return new RegExp(`${token}:\\s*(#[0-9a-f]{6})(?![0-9a-f])`, 'i').exec(scss)?.[1]
}

const BASE_HEXADECIMAL = 16

function rgbDe(hex: string): Rgb {
  const canal = (inicio: number): number =>
    Number.parseInt(hex.slice(inicio, inicio + 2), BASE_HEXADECIMAL)

  return [canal(1), canal(3), canal(5)]
}

/** Los dos colores leídos de `_tokens.scss`; lanza si falta alguno (el ancla de @s4 dice cuál). */
function paleta(): Paleta {
  const scss = texto(RUTA_TOKENS)
  const soft = hexDelToken(scss, TOKEN_SOFT)
  const ink = hexDelToken(scss, TOKEN_INK)

  if (soft === undefined || ink === undefined) {
    throw new Error(`_tokens.scss no declara ${TOKEN_SOFT} y ${TOKEN_INK} como #RRGGBB`)
  }

  return { soft: rgbDe(soft), ink: rgbDe(ink) }
}

// ── Decodificador PNG A MANO (profundidad 8, sin entrelazado, filtros 0-4, IDAT concatenados) ────────

const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
/** La cabecera de cada trozo: el largo de sus datos (4 bytes) y su tipo (4 letras ASCII). */
const LARGO_DEL_CAMPO_DE_LARGO = 4
const LARGO_DEL_TIPO_DE_TROZO = 4
const LARGO_DE_LA_CABECERA_DE_TROZO = LARGO_DEL_CAMPO_DE_LARGO + LARGO_DEL_TIPO_DE_TROZO
const LARGO_DEL_CRC = 4

interface Trozo {
  readonly tipo: string
  readonly datos: Buffer
  readonly fin: number
}

/** Los trozos del PNG que empieza en `inicio` (tras su firma), hasta IEND o hasta el fin de `fichero`. */
function trozosDelPng(fichero: Buffer, inicio: number): readonly Trozo[] {
  const trozos: Trozo[] = []
  let posicion = inicio + FIRMA_PNG.length

  while (posicion + LARGO_DE_LA_CABECERA_DE_TROZO <= fichero.length) {
    const largo = fichero.readUInt32BE(posicion)
    const tipo = fichero.toString(
      'latin1',
      posicion + LARGO_DEL_CAMPO_DE_LARGO,
      posicion + LARGO_DE_LA_CABECERA_DE_TROZO,
    )
    const datos = posicion + LARGO_DE_LA_CABECERA_DE_TROZO
    const fin = datos + largo + LARGO_DEL_CRC

    if (fin > fichero.length) {
      throw new Error(`el trozo ${tipo} se sale del fichero`)
    }

    trozos.push({ tipo, datos: fichero.subarray(datos, datos + largo), fin })
    if (tipo === 'IEND') {
      break
    }
    posicion = fin
  }

  return trozos
}

function empiezaPorLaFirma(fichero: Buffer, inicio: number): boolean {
  return fichero.subarray(inicio, inicio + FIRMA_PNG.length).equals(FIRMA_PNG)
}

interface Cabecera {
  readonly ancho: number
  readonly alto: number
  readonly profundidad: number
  readonly tipoDeColor: number
  readonly entrelazado: number
}

/** Dónde empieza cada campo leído del IHDR; la compresión (10) y el filtro (11) no se leen. */
const POSICION_EN_EL_IHDR: Readonly<Record<keyof Cabecera, number>> = {
  ancho: 0,
  alto: 4,
  profundidad: 8,
  tipoDeColor: 9,
  entrelazado: 12,
}

function cabeceraDe(ihdr: Trozo): Cabecera {
  return {
    ancho: ihdr.datos.readUInt32BE(POSICION_EN_EL_IHDR.ancho),
    alto: ihdr.datos.readUInt32BE(POSICION_EN_EL_IHDR.alto),
    profundidad: ihdr.datos[POSICION_EN_EL_IHDR.profundidad],
    tipoDeColor: ihdr.datos[POSICION_EN_EL_IHDR.tipoDeColor],
    entrelazado: ihdr.datos[POSICION_EN_EL_IHDR.entrelazado],
  }
}

/** Siempre RGBA de 8 bits: un PNG de tipo 2 (RGB) sale con alfa 255 en todos sus píxeles. */
interface Raster {
  readonly ancho: number
  readonly alto: number
  readonly rgba: Uint8Array
}

const TIPO_RGB = 2
const TIPO_RGBA = 6
const CANALES_RGB = 3
const CANALES_RGBA = 4
const CANALES_POR_TIPO: ReadonlyMap<number, number> = new Map([
  [TIPO_RGB, CANALES_RGB],
  [TIPO_RGBA, CANALES_RGBA],
])
const ALFA_OPACO = 255
/** La única profundidad que lee este decodificador: 8 bits, una muestra por byte. */
const PROFUNDIDAD_LEIDA = 8

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)

  if (pa <= pb && pa <= pc) {
    return a
  }

  return pb <= pc ? b : c
}

/** Los cinco filtros de fila del PNG (None, Sub, Up, Average y Paeth en la especificación). */
const FILTRO_NINGUNO = 0
const FILTRO_IZQUIERDA = 1
const FILTRO_ARRIBA = 2
const FILTRO_MEDIA = 3
const FILTRO_PAETH = 4

/** El predictor de cada filtro PNG: a = izquierda, b = arriba, c = arriba-izquierda. */
function predictor(filtro: number, a: number, b: number, c: number): number {
  switch (filtro) {
    case FILTRO_NINGUNO:
      return 0
    case FILTRO_IZQUIERDA:
      return a
    case FILTRO_ARRIBA:
      return b
    case FILTRO_MEDIA:
      return Math.floor((a + b) / 2)
    case FILTRO_PAETH:
      return paeth(a, b, c)
    default:
      throw new Error(`filtro PNG desconocido: ${filtro}`)
  }
}

/** Deshace los filtros fila a fila: `crudo` trae un byte de filtro delante de cada fila. */
function desfiltrar(crudo: Buffer, cabecera: Cabecera, canales: number): Uint8Array {
  const bytesPorFila = cabecera.ancho * canales
  const muestras = new Uint8Array(cabecera.alto * bytesPorFila)

  if (crudo.length !== cabecera.alto * (bytesPorFila + 1)) {
    throw new Error(
      `IDAT inflado con ${crudo.length} bytes: no cuadra con ${cabecera.ancho}×${cabecera.alto}`,
    )
  }

  for (let y = 0; y < cabecera.alto; y++) {
    const filtro = crudo[y * (bytesPorFila + 1)]

    for (let x = 0; x < bytesPorFila; x++) {
      const i = y * bytesPorFila + x
      const a = x >= canales ? muestras[i - canales] : 0
      const b = y > 0 ? muestras[i - bytesPorFila] : 0
      const c = x >= canales && y > 0 ? muestras[i - bytesPorFila - canales] : 0

      muestras[i] = (crudo[y * (bytesPorFila + 1) + 1 + x] + predictor(filtro, a, b, c)) & 0xff
    }
  }

  return muestras
}

function aRgba(muestras: Uint8Array, canales: number): Uint8Array {
  if (canales === CANALES_RGBA) {
    return muestras
  }

  const pixeles = muestras.length / canales
  const rgba = new Uint8Array(pixeles * CANALES_RGBA)

  for (let p = 0; p < pixeles; p++) {
    rgba.set(muestras.subarray(p * canales, p * canales + 3), p * CANALES_RGBA)
    rgba[p * CANALES_RGBA + 3] = ALFA_OPACO
  }

  return rgba
}

/** Decodifica el PNG que empieza en `inicio` de `fichero`. Lanza ante lo que no sabe leer. */
function decodificarPng(fichero: Buffer, inicio = 0): Raster {
  if (!empiezaPorLaFirma(fichero, inicio)) {
    throw new Error(`no hay firma PNG en el byte ${inicio}`)
  }

  const trozos = trozosDelPng(fichero, inicio)
  const [ihdr] = trozos
  const cabecera = cabeceraDe(ihdr)
  const canales = CANALES_POR_TIPO.get(cabecera.tipoDeColor)

  if (
    ihdr.tipo !== 'IHDR' ||
    cabecera.profundidad !== PROFUNDIDAD_LEIDA ||
    cabecera.entrelazado !== 0 ||
    !canales
  ) {
    throw new Error(`PNG que este decodificador no lee: ${JSON.stringify(cabecera)}`)
  }

  const idat = Buffer.concat(trozos.filter((trozo) => trozo.tipo === 'IDAT').map((t) => t.datos))
  const muestras = desfiltrar(inflateSync(idat), cabecera, canales)

  return { ancho: cabecera.ancho, alto: cabecera.alto, rgba: aRgba(muestras, canales) }
}

// ── El ICO: cabecera, entradas de directorio y el PNG de cada una ───────────────────────────────────

const LARGO_DE_LA_CABECERA_ICO = 6
const LARGO_DE_LA_ENTRADA_ICO = 16
/** En una entrada ICO, el byte de medida 0 significa 256. */
const MEDIDA_CERO_DEL_ICO = 256

interface CabeceraIco {
  readonly reservado: number
  readonly tipo: number
  readonly entradas: number
}

interface EntradaIco {
  readonly ancho: number
  readonly alto: number
  readonly tamano: number
  readonly desplazamiento: number
}

/** Dónde empieza cada campo leído; de la entrada no se leen los planos ni los bits por píxel. */
const POSICION_EN_LA_CABECERA_ICO: Readonly<Record<keyof CabeceraIco, number>> = {
  reservado: 0,
  tipo: 2,
  entradas: 4,
}
const POSICION_EN_LA_ENTRADA_ICO: Readonly<Record<keyof EntradaIco, number>> = {
  ancho: 0,
  alto: 1,
  tamano: 8,
  desplazamiento: 12,
}

function cabeceraIco(ico: Buffer): CabeceraIco {
  return {
    reservado: ico.readUInt16LE(POSICION_EN_LA_CABECERA_ICO.reservado),
    tipo: ico.readUInt16LE(POSICION_EN_LA_CABECERA_ICO.tipo),
    entradas: ico.readUInt16LE(POSICION_EN_LA_CABECERA_ICO.entradas),
  }
}

function entradasIco(ico: Buffer): readonly EntradaIco[] {
  return Array.from({ length: cabeceraIco(ico).entradas }, (_, indice) => {
    const base = LARGO_DE_LA_CABECERA_ICO + indice * LARGO_DE_LA_ENTRADA_ICO

    return {
      ancho: ico[base + POSICION_EN_LA_ENTRADA_ICO.ancho] || MEDIDA_CERO_DEL_ICO,
      alto: ico[base + POSICION_EN_LA_ENTRADA_ICO.alto] || MEDIDA_CERO_DEL_ICO,
      tamano: ico.readUInt32LE(base + POSICION_EN_LA_ENTRADA_ICO.tamano),
      desplazamiento: ico.readUInt32LE(base + POSICION_EN_LA_ENTRADA_ICO.desplazamiento),
    }
  })
}

function entradaDeLado(ico: Buffer, lado: number): EntradaIco {
  const entrada = entradasIco(ico).find((e) => e.ancho === lado && e.alto === lado)

  if (entrada === undefined) {
    throw new Error(`favicon.ico no trae una imagen de ${lado}×${lado}`)
  }

  return entrada
}

function rasterDelIco(lado: number): Raster {
  const ico = bytes(RUTA_ICO)

  return decodificarPng(ico, entradaDeLado(ico, lado).desplazamiento)
}

function rasterApple(): Raster {
  return decodificarPng(bytes(RUTA_APPLE))
}

// ── Píxeles y paleta ────────────────────────────────────────────────────────────────────────────────

interface Pixel {
  readonly x: number
  readonly y: number
  readonly rgb: Rgb
  readonly alfa: number
}

function pixelEn(raster: Raster, x: number, y: number): Pixel {
  const i = (y * raster.ancho + x) * CANALES_RGBA

  return {
    x,
    y,
    rgb: [raster.rgba[i], raster.rgba[i + 1], raster.rgba[i + 2]],
    alfa: raster.rgba[i + 3],
  }
}

function pixeles(raster: Raster): readonly Pixel[] {
  return Array.from({ length: raster.rgba.length / CANALES_RGBA }, (_, p) =>
    pixelEn(raster, p % raster.ancho, Math.floor(p / raster.ancho)),
  )
}

const TOLERANCIA_POR_CANAL = 2

function resta(a: Rgb, b: Rgb): Rgb {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function producto(a: Rgb, b: Rgb): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function aMenosDe(rgb: Rgb, esperado: Rgb, tolerancia: number): boolean {
  return rgb.every((canal, i) => Math.abs(canal - esperado[i]) <= tolerancia)
}

/** «De tinta»: visible (alfa > 0) y más cerca, en distancia euclídea, de --ink que de --accent-soft. */
function esDeTinta(pixel: Pixel, { soft, ink }: Paleta): boolean {
  const haciaInk = resta(pixel.rgb, ink)
  const haciaSoft = resta(pixel.rgb, soft)

  return pixel.alfa > 0 && producto(haciaInk, haciaInk) < producto(haciaSoft, haciaSoft)
}

function esSoftOpaco(pixel: Pixel, { soft }: Paleta): boolean {
  return pixel.alfa === ALFA_OPACO && aMenosDe(pixel.rgb, soft, TOLERANCIA_POR_CANAL)
}

/** Su RGB está a ±2 por canal de soft + t·(ink − soft), con t su proyección recortada a [0, 1]. */
function esMezcla(pixel: Pixel, { soft, ink }: Paleta): boolean {
  const eje = resta(ink, soft)
  const t = Math.min(1, Math.max(0, producto(resta(pixel.rgb, soft), eje) / producto(eje, eje)))
  const mezcla: Rgb = [soft[0] + t * eje[0], soft[1] + t * eje[1], soft[2] + t * eje[2]]

  return aMenosDe(pixel.rgb, mezcla, TOLERANCIA_POR_CANAL)
}

// ── @s4 · los colores salen de _tokens.scss ─────────────────────────────────────────────────────────

const LOS_TRES_RASTER = [
  { nombre: 'el PNG de 16×16 del ICO', leer: () => rasterDelIco(16), totalDePixeles: 256 },
  { nombre: 'el PNG de 32×32 del ICO', leer: () => rasterDelIco(32), totalDePixeles: 1024 },
  { nombre: 'el apple-touch-icon', leer: rasterApple, totalDePixeles: 32_400 },
]

describe('@s4 los colores salen de _tokens.scss — el SVG pinta --accent-soft y --ink y los raster son mezcla de los dos', () => {
  it('@s4 ANCLA POSITIVA: _tokens.scss declara EXACTAMENTE una vez --accent-soft: y --ink:, cada una #RRGGBB, y son DISTINTAS', () => {
    const scss = texto(RUTA_TOKENS)
    const soft = hexDelToken(scss, TOKEN_SOFT)
    const ink = hexDelToken(scss, TOKEN_INK)

    expect(apariciones(scss, `${TOKEN_SOFT}:`)).toBe(1)
    expect(apariciones(scss, `${TOKEN_INK}:`)).toBe(1)
    expect(soft).toMatch(/^#[0-9a-f]{6}$/i)
    expect(ink).toMatch(/^#[0-9a-f]{6}$/i)
    expect(soft?.toLowerCase()).not.toBe(ink?.toLowerCase())
  })

  it('@s4 el fill del <rect> es --accent-soft y el fill y el stroke del <path> son --ink', () => {
    const scss = texto(RUTA_TOKENS)
    const soft = hexDelToken(scss, TOKEN_SOFT)?.toLowerCase()
    const ink = hexDelToken(scss, TOKEN_INK)?.toLowerCase()
    const { rect, path } = piezasDe(RUTA_SVG)

    expect(valorDe(rect[0], 'fill')).toBe(soft)
    expect(valorDe(path[0], 'fill')).toBe(ink)
    expect(valorDe(path[0], 'stroke')).toBe(ink)
  })

  it.each(LOS_TRES_RASTER)(
    '@s4 ANCLA POSITIVA: $nombre tiene $totalDePixeles píxeles, al menos uno --accent-soft opaco y al menos uno de tinta',
    ({ leer, totalDePixeles }) => {
      const colores = paleta()
      const todos = pixeles(leer())

      expect(todos).toHaveLength(totalDePixeles)
      expect(todos.some((pixel) => esSoftOpaco(pixel, colores))).toBe(true)
      expect(todos.some((pixel) => esDeTinta(pixel, colores))).toBe(true)
    },
  )

  it.each(LOS_TRES_RASTER)(
    '@s4 en $nombre, todo píxel con alfa > 0 es mezcla de --accent-soft y --ink (±2 por canal)',
    ({ leer }) => {
      const colores = paleta()
      const fuera = pixeles(leer()).filter((p) => p.alfa > 0 && !esMezcla(p, colores))

      // Se listan (los primeros) para que un fallo diga CUÁLES.
      expect(fuera.slice(0, 5)).toEqual([])
    },
  )
})

// ── @s5 · la estructura del ICO ─────────────────────────────────────────────────────────────────────

const LADOS_DEL_ICO = [16, 32]
const ALFA_MAXIMO_EN_ESQUINA = 25

function esquinas(raster: Raster): readonly Pixel[] {
  const ultimaX = raster.ancho - 1
  const ultimaY = raster.alto - 1

  return [
    pixelEn(raster, 0, 0),
    pixelEn(raster, ultimaX, 0),
    pixelEn(raster, 0, ultimaY),
    pixelEn(raster, ultimaX, ultimaY),
  ]
}

describe('@s5 favicon.ico es un ICO de EXACTAMENTE dos PNG RGBA, 16×16 y 32×32, completos, esquinas transparentes y borde superior rosa', () => {
  it('@s5 ANCLA POSITIVA: la cabecera tiene reservado 0, tipo 1 y EXACTAMENTE 2 entradas', () => {
    expect(cabeceraIco(bytes(RUTA_ICO))).toEqual({ reservado: 0, tipo: 1, entradas: 2 })
  })

  it('@s5 las medidas declaradas son una de 16×16 y otra de 32×32', () => {
    const medidas = entradasIco(bytes(RUTA_ICO)).map((e) => [e.ancho, e.alto])

    expect(medidas.sort((a, b) => a[0] - b[0])).toEqual([
      [16, 16],
      [32, 32],
    ])
  })

  it('@s5 en cada entrada, desplazamiento + tamaño ≤ la longitud del fichero', () => {
    const ico = bytes(RUTA_ICO)
    const entradas = entradasIco(ico)

    expect(entradas).toHaveLength(2)
    expect(entradas.filter((e) => e.desplazamiento + e.tamano > ico.length)).toEqual([])
  })

  it.each(LADOS_DEL_ICO)(
    '@s5 la entrada de %i px es un PNG completo: firma, IHDR con SUS medidas, profundidad 8, tipo 6, sin entrelazado, e IEND justo al final',
    (lado) => {
      const ico = bytes(RUTA_ICO)
      const entrada = entradaDeLado(ico, lado)
      const trozos = trozosDelPng(ico, entrada.desplazamiento)
      const ultimo = trozos[trozos.length - 1]

      expect(empiezaPorLaFirma(ico, entrada.desplazamiento)).toBe(true)
      expect(trozos[0].tipo).toBe('IHDR')
      expect(cabeceraDe(trozos[0])).toEqual({
        ancho: lado,
        alto: lado,
        profundidad: 8,
        tipoDeColor: 6,
        entrelazado: 0,
      })
      expect(ultimo.tipo).toBe('IEND')
      expect(ultimo.fin).toBe(entrada.desplazamiento + entrada.tamano)
    },
  )

  it.each(LADOS_DEL_ICO)(
    '@s5 ANCLA POSITIVA: en el PNG de %i px, el píxel central del borde superior es --accent-soft opaco',
    (lado) => {
      const central = pixelEn(rasterDelIco(lado), lado / 2, 0)

      expect(central.alfa).toBe(ALFA_OPACO)
      expect(aMenosDe(central.rgb, paleta().soft, TOLERANCIA_POR_CANAL)).toBe(true)
    },
  )

  it.each(LADOS_DEL_ICO)('@s5 en el PNG de %i px, las cuatro esquinas tienen alfa ≤ 25', (lado) => {
    const alfas = esquinas(rasterDelIco(lado)).map((pixel) => pixel.alfa)

    expect(alfas.filter((alfa) => alfa > ALFA_MAXIMO_EN_ESQUINA)).toEqual([])
  })
})

// ── @s6 · el apple-touch-icon ───────────────────────────────────────────────────────────────────────

describe('@s6 apple-touch-icon.png es un PNG de 180×180, RGB SIN alfa y a sangre', () => {
  it('@s6 ANCLA POSITIVA: empieza por la firma PNG, su primer trozo es IHDR y el último es IEND, que acaba en el último byte', () => {
    const png = bytes(RUTA_APPLE)
    const trozos = trozosDelPng(png, 0)

    expect(empiezaPorLaFirma(png, 0)).toBe(true)
    expect(trozos[0].tipo).toBe('IHDR')
    expect(trozos[trozos.length - 1].tipo).toBe('IEND')
    expect(trozos[trozos.length - 1].fin).toBe(png.length)
  })

  it('@s6 su IHDR declara 180×180, profundidad 8, tipo de color 2 (RGB) y sin entrelazado', () => {
    const [ihdr] = trozosDelPng(bytes(RUTA_APPLE), 0)

    expect(cabeceraDe(ihdr)).toEqual({
      ancho: 180,
      alto: 180,
      profundidad: 8,
      tipoDeColor: 2,
      entrelazado: 0,
    })
  })

  it('@s6 no contiene ningún trozo "tRNS"', () => {
    const tipos = trozosDelPng(bytes(RUTA_APPLE), 0).map((trozo) => trozo.tipo)

    expect(tipos).toContain('IHDR')
    expect(tipos).not.toContain('tRNS')
  })

  it('@s6 los píxeles (0, 0), (179, 0), (0, 179) y (179, 179) tienen EXACTAMENTE el RGB de --accent-soft', () => {
    const { soft } = paleta()

    expect(esquinas(rasterApple()).map((pixel) => pixel.rgb)).toEqual([soft, soft, soft, soft])
  })
})

// ── @s7 · la caja de tinta a 32 y a 180 px ──────────────────────────────────────────────────────────

interface Caja {
  readonly izquierda: number
  readonly derecha: number
  readonly arriba: number
  readonly abajo: number
}

/** La caja de los píxeles de tinta en coordenadas de BORDE de píxel (máximo + 1). */
function cajaDeTinta(tinta: readonly Pixel[]): Caja {
  const xs = tinta.map((pixel) => pixel.x)
  const ys = tinta.map((pixel) => pixel.y)

  return {
    izquierda: Math.min(...xs),
    derecha: Math.max(...xs) + 1,
    arriba: Math.min(...ys),
    abajo: Math.max(...ys) + 1,
  }
}

const TOLERANCIA_DE_LA_CAJA = 1

const CAJAS_ESPERADAS = [
  { lado: 32, leer: () => rasterDelIco(32), x0: 3.98, x1: 28.0, y0: 6.49, y1: 25.49 },
  { lado: 180, leer: rasterApple, x0: 22.36, x1: 157.53, y0: 36.49, y1: 143.4 },
]

function pixelesDeTinta(raster: Raster): readonly Pixel[] {
  const colores = paleta()

  return pixeles(raster).filter((pixel) => esDeTinta(pixel, colores))
}

describe('@s7 la «N» está donde la aprobó Pablo — la caja de tinta cae a ±1 px de la del glifo engrosado', () => {
  it.each(CAJAS_ESPERADAS)(
    '@s7 ANCLA POSITIVA: el raster de $lado px tiene al menos un píxel de tinta',
    ({ leer }) => {
      expect(pixelesDeTinta(leer()).length).toBeGreaterThanOrEqual(1)
    },
  )

  it.each(CAJAS_ESPERADAS)(
    '@s7 a $lado px la caja de tinta está a ±1 px de ($x0, $y0)–($x1, $y1)',
    ({ leer, x0, x1, y0, y1 }) => {
      const caja = cajaDeTinta(pixelesDeTinta(leer()))
      const desvios = {
        izquierda: Math.abs(caja.izquierda - x0),
        derecha: Math.abs(caja.derecha - x1),
        arriba: Math.abs(caja.arriba - y0),
        abajo: Math.abs(caja.abajo - y1),
      }
      const excedidos = Object.entries(desvios).filter(([, d]) => d > TOLERANCIA_DE_LA_CAJA)

      // Se listan los lados que se salen, con la caja medida, para que un fallo diga CUÁNTO.
      expect({ caja, excedidos }).toEqual({ caja, excedidos: [] })
    },
  )
})
