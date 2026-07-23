import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * F-14 @s9 — el escenario 3D del carrusel de reseñas, sobre los BYTES de `resenas.module.scss`.
 * El SCSS obedece las MISMAS reglas 3D del contrato de galería (@s13/@s14/@s15/@s17/@s24 de
 * `features/galeria_carrusel.feature`), aseveradas con el MISMO patrón de bytes
 * (`galeria-estilos.test.ts`), y las DIFERENCIAS que fija `features/resenas_agregado_enlace.feature`
 * @s9: tarjeta de TEXTO con proporción propia (más ancha que alta, distinta del 4/3 de la galería),
 * central SIEMPRE legible con pares AA de la puerta de contraste, laterales que se apagan en el
 * HIJO envoltorio (`.lamina`).
 *
 * ANTI-TAUTOLOGÍA: cada valor esperado va ESCRITO A MANO y se LEE del SCSS; jamás se importa.
 */
const RUTA_SCSS = 'src/components/resenas.module.scss'

function scss(): string {
  return readFileSync(RUTA_SCSS, 'utf8')
}

/** El cuerpo (entre llaves) del PRIMER bloque cuyo encabezado casa, contando llaves. */
function cuerpoDelBloque(fuente: string, encabezado: RegExp): string | null {
  const cabeza = encabezado.exec(fuente)

  if (cabeza === null) {
    return null
  }

  const apertura = fuente.indexOf('{', cabeza.index)

  if (apertura < 0) {
    return null
  }

  let profundidad = 0

  for (let i = apertura; i < fuente.length; i++) {
    if (fuente[i] === '{') {
      profundidad += 1
    } else if (fuente[i] === '}') {
      profundidad -= 1

      if (profundidad === 0) {
        return fuente.slice(apertura + 1, i)
      }
    }
  }

  return null
}

/** El cuerpo de una regla, exigiendo que exista. */
function regla(fuente: string, encabezado: RegExp, nombre: string): string {
  const cuerpo = cuerpoDelBloque(fuente, encabezado)

  expect(cuerpo, `no se encontró la regla ${nombre}`).not.toBeNull()

  return cuerpo as string
}

/** La regla base de una clase del module (`.tarjeta {`), la PRIMERA del fichero. */
function reglaBase(clase: string): string {
  return regla(scss(), new RegExp(`\\.${clase}\\s*\\{`), `.${clase}`)
}

/** El cuerpo del bloque de una distancia dentro de un ámbito dado. */
function porDistancia(ambito: string, distancia: number): string {
  return regla(
    ambito,
    new RegExp(`\\[data-distancia='${distancia}'\\]\\s*\\{`),
    `distancia ${distancia}`,
  )
}

/** El valor NUMÉRICO de una custom property (`--giro: -30deg` → -30). */
function magnitud(cuerpo: string, propiedad: string): number {
  const encontrado = new RegExp(`--${propiedad}\\s*:\\s*(-?[\\d.]+)`).exec(cuerpo)

  expect(encontrado, `falta --${propiedad}`).not.toBeNull()

  return Number((encontrado as RegExpExecArray)[1])
}

/** La única declaración `transform: …;` del fichero. */
function declaracionTransform(): string {
  const encontrada = /transform\s*:\s*([^;]+);/.exec(scss())

  expect(encontrada, 'falta la declaración transform').not.toBeNull()

  return (encontrada as RegExpExecArray)[1]
}

/** El cuerpo del @media del móvil, el ÚNICO breakpoint que la sección introduce. */
function mediaMovil(): string {
  return regla(scss(), /@media\s*\(\s*max-width:\s*640px\s*\)\s*\{/, '@media (max-width: 640px)')
}

const DISTANCIAS = [0, 1, 2, 3]

describe('@s9 (@s13 de galería) la caja del escenario 3D: perspectiva sí, preserve-3d NO, recorte fuera', () => {
  it('@s9 declara la PROPIEDAD perspective en el escenario y NUNCA la función perspective()', () => {
    expect(scss()).toMatch(/[;{\s]perspective\s*:\s*\d+px/)
    expect(scss()).not.toContain('perspective(')
    expect(reglaBase('escenario')).toMatch(/perspective\s*:\s*\d+px/)
  })

  it('@s9 NO declara transform-style: preserve-3d en ninguna regla', () => {
    expect(scss()).not.toContain('preserve-3d')
  })

  it('@s9 «overflow: hidden» NO vive en la misma regla que «perspective»: recorta el marco', () => {
    expect(reglaBase('escenario')).not.toMatch(/overflow\s*:/)
    expect(reglaBase('marco')).toMatch(/overflow\s*:\s*hidden/)
    expect(reglaBase('marco')).not.toMatch(/perspective\s*:/)
  })

  it('@s9 la opacidad NUNCA en la tarjeta: se aplica al HIJO envoltorio (.lamina), grouping property', () => {
    expect(reglaBase('tarjeta')).not.toMatch(/[;{\s]opacity\s*:/)
    expect(reglaBase('lamina')).toMatch(/opacity\s*:\s*var\(--opacidad/)
  })

  it('@s9 no declara will-change, ni filter: drop-shadow(, ni content-visibility: auto', () => {
    const hoja = scss()

    expect(hoja).not.toMatch(/will-change\s*:/)
    expect(hoja).not.toContain('drop-shadow(')
    expect(hoja).not.toMatch(/content-visibility\s*:\s*auto/)
  })
})

describe('@s9 (@s14 de galería) una ÚNICA transform con las funciones en el orden del coverflow', () => {
  it('@s9 hay EXACTAMENTE UNA declaración «transform:» en toda la hoja, y vive en la tarjeta', () => {
    expect((scss().match(/transform\s*:/g) ?? []).length).toBe(1)
    expect(reglaBase('tarjeta')).toMatch(/transform\s*:/)
  })

  it('@s9 el orden es traslación → rotateY → scale, y NINGUNA regla declara transform: none', () => {
    const lista = declaracionTransform()

    expect(lista).toContain('translate3d(')
    expect(lista.indexOf('translate3d(')).toBeLessThan(lista.indexOf('rotateY('))
    expect(lista.indexOf('rotateY(')).toBeLessThan(lista.indexOf('scale('))
    expect(scss()).not.toMatch(/transform\s*:\s*none/)
  })

  it('@s9 cada custom property de la transform lleva su valor de RESERVA', () => {
    const lista = declaracionTransform()

    for (const reserva of [
      'var(--s, 0)',
      'var(--x, 0%)',
      'var(--y, 0px)',
      'var(--z, 0px)',
      'var(--giro, 0deg)',
      'var(--escala, 1)',
    ]) {
      expect(lista).toContain(reserva)
    }
  })

  it('@s9 las magnitudes por posición van en selectores de atributo, de 0 a 3, con las seis variables', () => {
    const tarjeta = reglaBase('tarjeta')

    for (const distancia of DISTANCIAS) {
      const cuerpo = porDistancia(tarjeta, distancia)

      for (const propiedad of ['x', 'y', 'z', 'giro', 'escala', 'opacidad']) {
        expect(cuerpo, `distancia ${distancia} necesita --${propiedad}`).toMatch(
          new RegExp(`--${propiedad}\\s*:`),
        )
      }
    }
  })

  it('@s9 la transición dura 0.8s con cubic-bezier(0.22, 1, 0.36, 1), con las dos x dentro de [0, 1]', () => {
    const tarjeta = reglaBase('tarjeta')

    expect(tarjeta).toMatch(/transition\s*:\s*transform\s+0\.8s\s+cubic-bezier\(/)
    expect(tarjeta).toContain('cubic-bezier(0.22, 1, 0.36, 1)')

    const curva = /cubic-bezier\(([^)]+)\)/.exec(tarjeta) as RegExpExecArray
    const [x1, , x2] = curva[1].split(',').map((n) => Number(n.trim()))

    for (const x of [x1, x2]) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(1)
    }
  })

  it('@s9 el DOMO ∩: la central se ELEVA (--y negativo), las laterales CAEN y se apagan al alejarse', () => {
    const tarjeta = reglaBase('tarjeta')

    expect(magnitud(porDistancia(tarjeta, 0), 'y')).toBeLessThan(0)
    for (const distancia of [1, 2, 3]) {
      expect(magnitud(porDistancia(tarjeta, distancia), 'y')).toBeGreaterThan(0)
    }
    for (const distancia of [1, 2]) {
      const cerca = porDistancia(tarjeta, distancia)
      const lejos = porDistancia(tarjeta, distancia + 1)

      expect(magnitud(lejos, 'x')).toBeGreaterThan(magnitud(cerca, 'x'))
      expect(Math.abs(magnitud(lejos, 'z'))).toBeGreaterThan(Math.abs(magnitud(cerca, 'z')))
      expect(Math.abs(magnitud(lejos, 'giro'))).toBeGreaterThan(Math.abs(magnitud(cerca, 'giro')))
      expect(magnitud(lejos, 'escala')).toBeLessThan(magnitud(cerca, 'escala'))
      expect(magnitud(lejos, 'opacidad')).toBeLessThan(magnitud(cerca, 'opacidad'))
    }
    expect(magnitud(porDistancia(tarjeta, 3), 'opacidad')).toBe(0)
  })
})

describe('@s9 la DIFERENCIA contratada: tarjeta de texto con proporción propia y central SIEMPRE legible', () => {
  it('@s9 la tarjeta declara su PROPIA proporción, distinta del "4 / 3" de la galería y más ancha que alta', () => {
    const tarjeta = reglaBase('tarjeta')
    const proporcion = /aspect-ratio\s*:\s*(\d+)\s*\/\s*(\d+)/.exec(tarjeta)

    expect(proporcion, 'la tarjeta no declara aspect-ratio').not.toBeNull()

    const ancho = Number((proporcion as RegExpExecArray)[1])
    const alto = Number((proporcion as RegExpExecArray)[2])

    // Más ancha que alta, y NO la 4:3 de las fotos: una reseña es un párrafo, no una foto.
    expect(ancho / alto).toBeGreaterThan(1)
    expect(ancho / alto).not.toBeCloseTo(4 / 3, 5)
  })

  it('@s9 la central es SIEMPRE legible: a distancia 0 su opacidad efectiva es 1', () => {
    expect(magnitud(porDistancia(reglaBase('tarjeta'), 0), 'opacidad')).toBe(1)
    // Y ninguna regla de la lámina la reduce por su cuenta: la opacidad es la variable, con 1 de reserva.
    expect(reglaBase('lamina')).toMatch(/opacity\s*:\s*var\(--opacidad,\s*1\)/)
  })

  it('@s9 el texto usa SOLO pares AA de la tabla de la puerta de contraste: fondo --surface2, texto --text/--ink/--accent-dark', () => {
    // Los pares AUDITADOS (puerta-contraste.ts, MATRIZ_DE_USO): --text/--surface2, --ink/--surface2
    // y --accent-dark/--surface2. NO INVENTAR COLOR; JAMÁS --accent como texto (4,37:1, falla AA).
    expect(reglaBase('lamina')).toMatch(/background\s*:\s*var\(--surface2\)/)
    expect(reglaBase('cita')).toMatch(/color\s*:\s*var\(--text\)/)
    expect(reglaBase('autora')).toMatch(/color\s*:\s*var\(--ink\)/)
    expect(reglaBase('servicio')).toMatch(/color\s*:\s*var\(--accent-dark\)/)
    expect(reglaBase('valoracion')).toMatch(/color\s*:\s*var\(--accent-dark\)/)
    expect(scss()).not.toMatch(/color\s*:\s*var\(--accent\)/)
  })

  it('@s9 la línea del agregado y la leyenda son texto secundario --muted sobre el fondo (par auditado)', () => {
    expect(reglaBase('agregado')).toMatch(/color\s*:\s*var\(--muted\)/)
    expect(reglaBase('leyenda')).toMatch(/color\s*:\s*var\(--muted\)/)
  })
})

describe('@s9 (@s15 de galería) el móvil suaviza el 3D, reduced-motion lo congela y la oculta ni barre ni captura', () => {
  it('@s9 en @media (max-width: 640px) giro, separación y profundidad son MENORES que en escritorio', () => {
    const escritorio = reglaBase('tarjeta')
    const movil = mediaMovil()

    for (const distancia of [1, 2, 3]) {
      const grande = porDistancia(escritorio, distancia)
      const pequeno = porDistancia(movil, distancia)

      expect(Math.abs(magnitud(pequeno, 'giro'))).toBeLessThan(Math.abs(magnitud(grande, 'giro')))
      expect(Math.abs(magnitud(pequeno, 'z'))).toBeLessThan(Math.abs(magnitud(grande, 'z')))
      expect(Math.abs(magnitud(pequeno, 'y'))).toBeLessThan(Math.abs(magnitud(grande, 'y')))
    }
  })

  it('@s9 en el móvil las vecinas SIGUEN ASOMANDO: su opacidad a distancia 1 es mayor que cero', () => {
    expect(magnitud(porDistancia(mediaMovil(), 1), 'opacidad')).toBeGreaterThan(0)
  })

  it('@s9 640px es el ÚNICO breakpoint que la sección introduce', () => {
    const anchos = [...scss().matchAll(/@media[^{]*?(\d+)px/g)].map((m) => m[1])

    expect(anchos.length).toBeGreaterThan(0)
    expect([...new Set(anchos)]).toEqual(['640'])
  })

  it('@s9 ningún giro alcanza los 90 grados en valor absoluto, en ninguno de los dos tamaños', () => {
    const giros = [...scss().matchAll(/--giro\s*:\s*(-?[\d.]+)deg/g)].map((m) => Number(m[1]))

    expect(giros.length).toBeGreaterThanOrEqual(8)
    for (const giro of giros) {
      expect(Math.abs(giro)).toBeLessThan(90)
    }
  })

  it('@s9 declara @media (prefers-reduced-motion: reduce) que anula las transiciones con transition: none', () => {
    const media = regla(
      scss(),
      /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/,
      '@media (prefers-reduced-motion: reduce)',
    )

    expect(media).toMatch(/\.tarjeta\b/)
    expect(media).toMatch(/transition\s*:\s*none/)
  })

  it('@s9 la tarjeta OCULTA declara transition: none y pointer-events: none TAMBIÉN fuera de ese @media', () => {
    const oculta = porDistancia(reglaBase('tarjeta'), 3)

    expect(oculta).toMatch(/transition\s*:\s*none/)
    expect(oculta).toMatch(/pointer-events\s*:\s*none/)
  })

  it('@s9 el MARCO declara touch-action: pan-y: el gesto horizontal es del carrusel, el vertical del navegador', () => {
    expect(reglaBase('marco')).toMatch(/touch-action\s*:\s*pan-y/)
  })

  it('@s9 no aparece ningún url(https:// ni @import url(, y no se añade ni se quita ninguna @font-face', () => {
    const hoja = scss()

    expect(hoja).not.toMatch(/url\(\s*['"]?https?:/i)
    expect(hoja).not.toContain('@import url(')
    expect(hoja).not.toContain('@font-face')
  })
})

describe('@s9 (@s24 de galería) los mandos son círculos de cristal SOBRE el marco, sin fila externa', () => {
  /** La regla COMPARTIDA de los tres mandos (encabezado con comas). */
  function reglaDelMando(clase: string): string {
    return regla(scss(), new RegExp(`\\.${clase}[^{}]*\\{`), `.${clase}`)
  }

  const MANDOS = ['rotacion', 'flechaAnterior', 'flechaSiguiente']

  it('@s9 el SCSS no contiene ninguna regla de fila .mandos', () => {
    expect(scss()).not.toMatch(/\.mandos\b/)
  })

  it('@s9 los tres mandos: position absolute, caja de 2.75rem, cristal color-mix + blur, tokens del repo', () => {
    for (const mando of MANDOS) {
      const cuerpo = reglaDelMando(mando)

      expect(cuerpo, `.${mando}`).toMatch(/position\s*:\s*absolute/)
      expect(cuerpo, `.${mando}`).toMatch(/width\s*:\s*2\.75rem/)
      expect(cuerpo, `.${mando}`).toMatch(/height\s*:\s*2\.75rem/)
      expect(cuerpo, `.${mando}`).toMatch(/background\s*:\s*color-mix\(/)
      expect(cuerpo, `.${mando}`).toContain('var(--surface)')
      expect(cuerpo, `.${mando}`).toContain('transparent')
      expect(cuerpo, `.${mando}`).toMatch(/backdrop-filter\s*:\s*blur\(/)
      expect(cuerpo, `.${mando}`).toMatch(/border\s*:\s*1px solid var\(--border-interactive\)/)
      expect(cuerpo, `.${mando}`).toMatch(/color\s*:\s*var\(--accent-dark\)/)
      // La base al 85 % (auditoría a11y del lote, eje 1): mismo cristal que la galería — con el
      // 78 % el borde caía a 2,67:1 bajo píxel casi negro; al 85 % borde y glifo aguantan SIEMPRE.
      expect(cuerpo, `.${mando}`).toContain('color-mix(in srgb, var(--surface) 85%, transparent)')
    }
  })

  it('@s9 su z-index es MAYOR QUE 6: por encima de la capa máxima de las tarjetas (capaDe(0, 6) = 6)', () => {
    for (const mando of MANDOS) {
      const capa = /z-index\s*:\s*(\d+)/.exec(reglaDelMando(mando))

      expect(capa, `.${mando} necesita z-index`).not.toBeNull()
      expect(Number((capa as RegExpExecArray)[1])).toBeGreaterThan(6)
    }
  })

  it('@s9 las flechas anclan cada una a SU lateral y el chip arriba, y NINGÚN mando se oculta en ningún tamaño', () => {
    expect(scss()).toMatch(/\.flechaAnterior\s*\{[^}]*left\s*:/)
    expect(scss()).toMatch(/\.flechaSiguiente\s*\{[^}]*right\s*:/)
    expect(scss()).toMatch(/\.rotacion\s*\{[^}]*top\s*:/)
    expect(scss()).not.toMatch(/display\s*:\s*none/)
    expect(scss()).not.toMatch(/(?<![a-z-])visibility\s*:\s*hidden/)
    for (const mando of MANDOS) {
      expect(reglaDelMando(mando), `.${mando}`).not.toMatch(/[^-]opacity\s*:/)
    }
  })
})

describe('@s9 (@s17 de galería) los puntos: dos tokens de color y diana de 24 píxeles', () => {
  it('@s9 el punto actual y el disponible usan DOS tokens distintos de fondo, sin apoyarse en opacity', () => {
    const punto = reglaBase('punto')
    const actual = regla(punto, /\[data-actual='sí'\]\s*\{/, "[data-actual='sí']")
    const tokenDe = (cuerpo: string) =>
      (/background\s*:\s*var\((--[a-z0-9-]+)\)/.exec(cuerpo) as RegExpExecArray)[1]

    expect(tokenDe(punto)).not.toBe(tokenDe(actual))
    expect(actual).not.toMatch(/opacity\s*:/)
  })

  it('@s9 los puntos NO se pintan con --accent ni delimitan con --line', () => {
    const punto = reglaBase('punto')

    expect(punto).not.toMatch(/var\(--accent\)/)
    expect(punto).not.toMatch(/var\(--line\)/)
    expect(punto).toMatch(/var\(--border-interactive\)/)
  })

  it('@s9 la caja interactiva del punto mide 1.5rem por lado y el círculo visible 0.75rem, con el anillo EN el ::before', () => {
    const punto = reglaBase('punto')

    expect(punto).toMatch(/width\s*:\s*1\.5rem/)
    expect(punto).toMatch(/height\s*:\s*1\.5rem/)
    expect(punto).not.toMatch(/background-clip/)

    const circulo = regla(punto, /&::before\s*\{/, '.punto::before')

    expect(circulo).toMatch(/width\s*:\s*0\.75rem/)
    expect(circulo).toMatch(/height\s*:\s*0\.75rem/)
    expect(circulo).toMatch(/border-radius\s*:\s*50%/)
    expect(circulo).toMatch(/border\s*:\s*1px solid var\(--border-interactive\)/)
  })

  it('@s9 las cajas de 24 px NO se solapan: el gap es positivo y no hay márgenes negativos', () => {
    const puntos = reglaBase('puntos')

    expect(puntos).toMatch(/gap\s*:\s*[\d.]+rem/)
    expect(puntos).not.toMatch(/margin[^:;]*:\s*-/)
    expect(reglaBase('punto')).not.toMatch(/margin[^:;]*:\s*-/)
  })
})

describe('@s2 el enlace a Treatwell se distingue por algo MÁS que el color', () => {
  it('@s2 la regla del enlace del agregado declara text-decoration: underline, EXPLÍCITO', () => {
    // (N) SC 1.4.1 Use of Color: el enlace rinde 1,12:1 contra el texto que lo rodea — el
    // subrayado es la distinción no cromática. Hasta ahora sobrevivía por el default del
    // navegador (guardia del auditor, eje 4): se declara para que un reset no lo mate en silencio.
    const enlace = regla(reglaBase('agregado'), /(?<![a-z-])a\s*\{/, '.agregado a')

    expect(enlace).toMatch(/text-decoration\s*:\s*underline/)
  })
})
