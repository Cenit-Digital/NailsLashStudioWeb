import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { MATRIZ_DE_USO, MINIMO_DE_PARES } from '../lib/puerta-contraste'

/**
 * F-25 — lo que ningún render ve, por BYTES (features/logo_acoplado.feature @s15-@s19; @s26 y @s27
 * sobre la fuente y stryker.config.json). jsdom corre con `css: false` y no anima: la hoja se LEE.
 * ANCLA POSITIVA siempre primero. Literales A MANO.
 *
 * Las comprobaciones de «contiene / no contiene» van sobre los BYTES CRUDOS (los comentarios también
 * cuentan); el troceo en bloques va sobre la hoja SIN comentarios, para que un comentario no se cuele
 * en el selector de la regla que lo sigue.
 */
const RUTA_HOJA = 'src/components/logo-acoplado.module.scss'
const BYTES = readFileSync(RUTA_HOJA, 'utf8')
const HOJA = sinComentarios(BYTES)

const REDUCE = '@media (prefers-reduced-motion: reduce)'
const VUELO_CALIGRAFIA = ".marca[data-vuelo='si'] .logoCaligrafia"
const VUELO_TEXTO = ".marca[data-vuelo='si'] .logoTexto"

function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

/** El cuerpo (entre llaves) del primer bloque cuyo encabezado casa, contando llaves. */
function cuerpoDelBloque(fuente: string, encabezado: RegExp | string): string | null {
  const indice =
    typeof encabezado === 'string'
      ? fuente.indexOf(encabezado)
      : (encabezado.exec(fuente)?.index ?? -1)

  if (indice < 0) {
    return null
  }

  const apertura = fuente.indexOf('{', indice)
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

/** La hoja SIN el bloque indicado (para comprobar qué queda fuera de él). */
function sinBloque(fuente: string, encabezado: string): string {
  const cuerpo = cuerpoDelBloque(fuente, encabezado)

  return cuerpo === null ? fuente : fuente.replace(cuerpo, '')
}

/** Las reglas «selector { declaraciones }» de un fragmento, sin anidamiento. */
function reglas(fragmento: string): { selector: string; cuerpo: string }[] {
  return [...fragmento.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    cuerpo: m[2],
  }))
}

/** Las declaraciones de un bloque hoja, con los espacios normalizados. */
function declaraciones(cuerpo: string | null): string[] {
  return (cuerpo ?? '')
    .split(';')
    .map((declaracion) => declaracion.replace(/\s+/g, ' ').trim())
    .filter((declaracion) => declaracion !== '')
}

/** El bloque de primer nivel cuyo selector es EXACTAMENTE el dado (no uno que lo contenga). */
function bloqueBase(selector: string): string | null {
  const escapado = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return cuerpoDelBloque(HOJA, new RegExp(`(^|\\n)${escapado}\\s*\\{`))
}

const esAnimacion = /(^|[\s;])animation(-[a-z]+)?\s*:/

describe('@s15 el vuelo vive en la hoja: 0,9 s con la curva de «STUDIO», de 0,35 a opaco, y el texto se desvanece en 0,4 s lineal', () => {
  it('@s15 ANCLA POSITIVA: la hoja declara .marca, .logoTexto, .logoCaligrafia y las dos @keyframes', () => {
    for (const ancla of [
      '.marca',
      '.logoTexto',
      '.logoCaligrafia',
      '@keyframes acoplar',
      '@keyframes soltar',
    ]) {
      expect(BYTES, ancla).toContain(ancla)
    }
  })

  it('@s15 las reglas del vuelo: acoplar 0.9s con la curva de «STUDIO» y soltar 0.4s linear', () => {
    expect(declaraciones(cuerpoDelBloque(HOJA, `${VUELO_CALIGRAFIA} {`))).toContain(
      'animation: acoplar 0.9s cubic-bezier(0.45, 0, 0.25, 1)',
    )
    expect(declaraciones(cuerpoDelBloque(HOJA, `${VUELO_TEXTO} {`))).toContain(
      'animation: soltar 0.4s linear',
    )
  })

  it('@s15 acoplar parte del punto que marcan las custom properties, a 0,35, y NO tiene «to» ni «100%»', () => {
    const acoplar = cuerpoDelBloque(HOJA, '@keyframes acoplar') ?? ''
    const desde = declaraciones(cuerpoDelBloque(acoplar, /(^|\s)from\s*\{/))

    expect(desde).toContain(
      'transform: translate(var(--vuelo-x), var(--vuelo-y)) scale(var(--vuelo-escala))',
    )
    expect(desde).toContain('opacity: 0.35')
    expect(acoplar).not.toMatch(/(^|\s)(to|100%)\s*\{/)
  })

  it('@s15 soltar fuerza visibility visible mientras dura: de opaco a transparente', () => {
    const soltar = cuerpoDelBloque(HOJA, '@keyframes soltar') ?? ''
    const desde = declaraciones(cuerpoDelBloque(soltar, /(^|\s)from\s*\{/))
    const hasta = declaraciones(cuerpoDelBloque(soltar, /(^|\s)to\s*\{/))

    expect(desde).toEqual(expect.arrayContaining(['opacity: 1', 'visibility: visible']))
    expect(hasta).toEqual(expect.arrayContaining(['opacity: 0', 'visibility: visible']))
  })

  it('@s15 el bloque base .logoCaligrafia escala desde su esquina: transform-origin: 0 0', () => {
    expect(declaraciones(bloqueBase('.logoCaligrafia'))).toContain('transform-origin: 0 0')
  })

  it("@s15 EXACTAMENTE dos @keyframes, y toda animation fuera del @media reduce cuelga de [data-vuelo='si']", () => {
    expect(BYTES.split('@keyframes').length - 1).toBe(2)

    const conAnimacion = reglas(sinBloque(HOJA, REDUCE)).filter((regla) =>
      esAnimacion.test(regla.cuerpo),
    )

    expect(conAnimacion.length).toBeGreaterThanOrEqual(2)
    for (const regla of conAnimacion) {
      expect(regla.selector).toContain("[data-vuelo='si']")
    }
  })

  it('@s15 sin fill-mode, will-change ni !important, y ninguna animation con forwards, backwards o both', () => {
    expect(BYTES).toContain('animation')
    for (const prohibido of ['animation-fill-mode', 'will-change', '!important']) {
      expect(BYTES, prohibido).not.toContain(prohibido)
    }
    for (const regla of reglas(HOJA)) {
      for (const declaracion of declaraciones(regla.cuerpo).filter((d) => esAnimacion.test(d))) {
        expect(declaracion).not.toMatch(/\b(forwards|backwards|both)\b/)
      }
    }
  })
})

describe('@s16 con prefers-reduced-motion: reduce el cambio es INSTANTÁNEO: animation none sobre el selector COMPLETO del vuelo, y DESPUÉS de él', () => {
  const reduce = cuerpoDelBloque(HOJA, REDUCE) ?? ''

  it('@s16 ANCLA POSITIVA: EXACTAMENTE un @media (prefers-reduced-motion: reduce)', () => {
    expect(BYTES.split(REDUCE).length - 1).toBe(1)
  })

  it('@s16 dentro, los dos selectores completos del vuelo declaran animation: none', () => {
    expect(declaraciones(cuerpoDelBloque(reduce, `${VUELO_CALIGRAFIA} {`))).toContain(
      'animation: none',
    )
    expect(declaraciones(cuerpoDelBloque(reduce, `${VUELO_TEXTO} {`))).toContain('animation: none')
  })

  it('@s16 dentro NO hay bloques con .logoCaligrafia o .logoTexto a secas (perderían por especificidad)', () => {
    const selectores = reglas(reduce).map((regla) => regla.selector)

    expect(selectores.length).toBeGreaterThanOrEqual(2)
    expect(selectores).not.toContain('.logoCaligrafia')
    expect(selectores).not.toContain('.logoTexto')
  })

  it('@s16 el @media empieza DESPUÉS de las dos reglas del vuelo: a igual especificidad gana el que va después', () => {
    const inicio = HOJA.indexOf(REDUCE)

    expect(inicio).toBeGreaterThan(HOJA.indexOf(`${VUELO_CALIGRAFIA} {`))
    expect(inicio).toBeGreaterThan(HOJA.indexOf(`${VUELO_TEXTO} {`))
    expect(HOJA.indexOf(`${VUELO_CALIGRAFIA} {`)).toBeGreaterThanOrEqual(0)
    expect(HOJA.indexOf(`${VUELO_TEXTO} {`)).toBeGreaterThanOrEqual(0)
  })

  it('@s16 dentro no se declara opacity, ni transition, ni ninguna animation distinta de none: sin fundido residual', () => {
    const todas = reglas(reduce).flatMap((regla) => declaraciones(regla.cuerpo))

    expect(todas.length).toBeGreaterThanOrEqual(2)
    for (const declaracion of todas) {
      expect(declaracion).not.toMatch(/^(opacity|transition(-[a-z]+)?)\s*:/)
      if (esAnimacion.test(declaracion)) {
        expect(declaracion).toBe('animation: none')
      }
    }
  })
})

describe('@s17 el hueco es estable por construcción —las dos representaciones en la MISMA celda— y la base es el estado horneado', () => {
  const CALIGRAFIA_ACOPLADA = ".marca[data-logo='caligrafia'] .logoCaligrafia"
  const TEXTO_ACOPLADO = ".marca[data-logo='caligrafia'] .logoTexto"

  it('@s17 ANCLA POSITIVA: el bloque .marca declara display: inline-grid', () => {
    expect(declaraciones(bloqueBase('.marca'))).toContain('display: inline-grid')
  })

  it('@s17 las dos representaciones ocupan la misma celda: grid-area: 1 / 1 en cada bloque base', () => {
    expect(declaraciones(bloqueBase('.logoTexto'))).toContain('grid-area: 1 / 1')
    expect(declaraciones(bloqueBase('.logoCaligrafia'))).toContain('grid-area: 1 / 1')
  })

  it('@s17 la base es el horneado: la caligrafía oculta con visibility y el texto sin declarar visibility', () => {
    expect(declaraciones(bloqueBase('.logoCaligrafia'))).toContain('visibility: hidden')
    expect(bloqueBase('.logoTexto')).not.toBeNull()
    expect(bloqueBase('.logoTexto')).not.toMatch(/(^|[\s;])visibility\s*:/)
  })

  it('@s17 SOLO data-logo="caligrafia" invierte las dos visibilidades', () => {
    expect(declaraciones(cuerpoDelBloque(HOJA, `${CALIGRAFIA_ACOPLADA} {`))).toContain(
      'visibility: visible',
    )
    expect(declaraciones(cuerpoDelBloque(HOJA, `${TEXTO_ACOPLADO} {`))).toContain(
      'visibility: hidden',
    )
  })

  it('@s17 ninguna regla depende de data-logo «texto»: si el atributo faltara, se vería la marca', () => {
    expect(BYTES).toContain('data-logo=')
    expect(BYTES).not.toContain("data-logo='texto'")
    expect(BYTES).not.toContain('data-logo="texto"')
  })

  it('@s17 ninguna regla de .logoTexto o .logoCaligrafia saca la caja del flujo: ni display none, ni absolute, ni fixed', () => {
    const representaciones = reglas(HOJA).filter((regla) =>
      /\.logo(Texto|Caligrafia)\b/.test(regla.selector),
    )

    expect(representaciones.length).toBeGreaterThanOrEqual(4)
    for (const regla of representaciones) {
      for (const prohibida of ['display: none', 'position: absolute', 'position: fixed']) {
        expect(declaraciones(regla.cuerpo), `${regla.selector} · ${prohibida}`).not.toContain(
          prohibida,
        )
      }
    }
  })

  it('@s17 .soloLectores usa la técnica clip/1 px del <h1> del hero, sin display none ni visibility hidden', () => {
    const soloLectores = declaraciones(bloqueBase('.soloLectores'))

    for (const declaracion of [
      'position: absolute',
      'width: 1px',
      'height: 1px',
      'overflow: hidden',
      'clip: rect(0, 0, 0, 0)',
      'white-space: nowrap',
    ]) {
      expect(soloLectores, declaracion).toContain(declaracion)
    }
    expect(soloLectores).not.toContain('display: none')
    expect(soloLectores).not.toContain('visibility: hidden')
  })

  /**
   * APOYO (derivado de LA-C1, declarado en progress/tdd_logo_acoplado.md): bajo `css: false` las
   * clases del module son cadenas con hash (`_marca_0a3d44`), no un literal estable, y el contrato
   * prohíbe aseverar por clase en los renders (el estado vive en atributos). Así que ningún render
   * fija QUÉ clase lleva cada nodo, y sin esto el <a> podría perder sus clases con toda la suite
   * verde. Se lee la FUENTE: qué clase lleva cada etiqueta de la marca.
   */
  it('@s17 apoyo: LogoAcoplado.tsx importa la hoja y aplica .marca, .soloLectores, .logoTexto y .logoCaligrafia a sus nodos', () => {
    const fuente = readFileSync('src/components/LogoAcoplado.tsx', 'utf8')
    const etiqueta = (nombre: string): string[] =>
      [...fuente.matchAll(new RegExp(`<${nombre}\\b[^>]*>`, 'g'))].map((m) => m[0])
    const [lectores, visible] = etiqueta('span')

    expect(fuente).toMatch(/import estilos from '\.\/logo-acoplado\.module\.scss'/)
    expect(etiqueta('a')[0]).toContain('className={estilos.marca}')
    expect(lectores).toContain('className={estilos.soloLectores}')
    expect(lectores).not.toContain('aria-hidden')
    expect(visible).toContain('className={estilos.logoTexto}')
    expect(visible).toContain('aria-hidden="true"')
    expect(etiqueta('svg')[0]).toContain('className={estilos.logoCaligrafia}')
    // D-8: el <text> no lleva clase propia; hereda tinta y familia del <svg>.
    expect(etiqueta('text')[0]).not.toContain('className')
  })
})

describe('@s18 el logo caligráfico mide 2,5 rem de alto, con un tope DURO de 2,75 rem: la cabecera no pasa de 76 px', () => {
  /** Todos los bloques cuyo selector contiene .logoCaligrafia, también los de dentro de un @media. */
  const bloquesDeLaFirma = reglas(HOJA).filter((regla) =>
    regla.selector.includes('.logoCaligrafia'),
  )

  it('@s18 ANCLA POSITIVA: el bloque base .logoCaligrafia declara height: 2.5rem', () => {
    expect(declaraciones(bloqueBase('.logoCaligrafia'))).toContain('height: 2.5rem')
  })

  it('@s18 ningún bloque de la firma declara un alto que no esté en rem o que pase de 2.75rem', () => {
    const altos = bloquesDeLaFirma.flatMap((regla) =>
      declaraciones(regla.cuerpo).filter((d) => /^(min-|max-)?height\s*:/.test(d)),
    )

    expect(altos.length).toBeGreaterThanOrEqual(1)
    for (const alto of altos) {
      const valor = /^(?:min-|max-)?height\s*:\s*([\d.]+)rem$/.exec(alto)

      expect(valor, `${alto}: solo rem`).not.toBeNull()
      expect(Number(valor?.[1]), alto).toBeLessThanOrEqual(2.75)
    }
  })

  it('@s18 ningún bloque de la firma declara un ancho en px: el ancho sale de la relación del viewBox', () => {
    expect(bloquesDeLaFirma.length).toBeGreaterThanOrEqual(1)
    for (const regla of bloquesDeLaFirma) {
      for (const declaracion of declaraciones(regla.cuerpo)) {
        expect(declaracion, regla.selector).not.toMatch(/^(min-|max-)?width\s*:.*px/)
      }
    }
  })
})

describe('@s19 la firma se pinta en --ink con Great Vibes, sin opacity en la base, sin --accent y sin capturar clics; no hereda las minúsculas ni el espaciado', () => {
  it('@s19 ANCLA POSITIVA: un bloque de .logoCaligrafia declara fill: var(--ink) y la familia Great Vibes', () => {
    const firma = reglas(HOJA)
      .filter((regla) => regla.selector.startsWith('.logoCaligrafia'))
      .flatMap((regla) => declaraciones(regla.cuerpo))

    expect(firma).toContain('fill: var(--ink)')
    expect(firma).toContain("font-family: 'Great Vibes', cursive")
  })

  it('@s19 el bloque base .logoCaligrafia declara pointer-events: none (el <svg> escalado pasa sobre la nav)', () => {
    expect(declaraciones(bloqueBase('.logoCaligrafia'))).toContain('pointer-events: none')
  })

  it('@s19 fuera de las @keyframes ningún bloque declara opacity', () => {
    const fueraDeLosFotogramas = sinBloque(
      sinBloque(HOJA, '@keyframes acoplar'),
      '@keyframes soltar',
    )

    expect(HOJA).toContain('opacity')
    expect(fueraDeLosFotogramas).not.toMatch(/(^|[\s;{])opacity\s*:/)
  })

  it('@s19 ni --accent ni #C05576 en la hoja (4,05 < 4,5)', () => {
    expect(BYTES).toContain('var(--ink)')
    expect(BYTES).not.toContain('var(--accent)')
    expect(BYTES.toLowerCase()).not.toContain('#c05576')
  })

  it('@s19 D-5: .marca no declara text-transform ni letter-spacing; .logoTexto lleva Gilda, minúsculas y 0.06em', () => {
    const marca = declaraciones(bloqueBase('.marca'))
    const texto = declaraciones(bloqueBase('.logoTexto'))

    expect(marca.length).toBeGreaterThanOrEqual(1)
    expect(marca.filter((d) => /^(text-transform|letter-spacing)\s*:/.test(d))).toEqual([])
    expect(texto).toContain("font-family: 'Gilda Display', serif")
    expect(texto).toContain('text-transform: lowercase')
    expect(texto).toContain('letter-spacing: 0.06em')
  })

  it('@s19 el contraste ya lo vigila la fila A-15: MINIMO_DE_PARES sigue en 18 y hay EXACTAMENTE una fila «logo sobre la cabecera translúcida»', () => {
    const filasDelLogo = MATRIZ_DE_USO.filter((par) =>
      par.uso.startsWith('logo sobre la cabecera translúcida'),
    )

    expect(MINIMO_DE_PARES).toBe(18)
    expect(filasDelLogo).toHaveLength(1)
  })
})

describe('@s26 guardas de FUENTE: sin matchMedia, sin WAAPI, sin scroll, sin storage, sin red y sin el literal de la marca', () => {
  const COMPONENTE = readFileSync('src/components/LogoAcoplado.tsx', 'utf8')
  const LOGICA = readFileSync('src/components/logo-acoplado-logica.ts', 'utf8')
  const FUENTES = [
    ['LogoAcoplado.tsx', COMPONENTE],
    ['logo-acoplado-logica.ts', LOGICA],
  ] as const

  /**
   * ENMIENDA @s26, ratificada por el lead el 2026-09-30 (7aa8ba9): VISTA_MARCA solo puede salir del
   * módulo GENERADO `src/lib/trazo-marca.ts` (@s4, LA-15), y la ruta de su import contiene
   * «trazo-marca». Ese especificador se quita SOLO de LogoAcoplado.tsx, que lo trae EXACTAMENTE una
   * vez; la lógica pura no puede nombrar ese módulo de ninguna forma, comentarios incluidos.
   */
  const IMPORT_DE_LA_VISTA = "from '../lib/trazo-marca'"

  it('@s26 ANCLAS POSITIVAS: el componente exporta LogoAcoplado, usa el observador, los dos atributos y la fuente única; la lógica exporta funciones', () => {
    for (const ancla of [
      'export function LogoAcoplado',
      'IntersectionObserver',
      'data-logo',
      'data-vuelo',
      'partirNombre',
      'VISTA_MARCA',
    ]) {
      expect(COMPONENTE, ancla).toContain(ancla)
    }
    expect(LOGICA).toContain('export function')
  })

  it('@s26 ninguno de los dos usa matchMedia, WAAPI, View Transitions, scroll, storage, cookies ni red', () => {
    for (const [nombre, fuente] of FUENTES) {
      for (const vetado of [
        'matchMedia',
        '.animate(',
        'requestAnimationFrame',
        'startViewTransition',
        'animation-timeline',
        "'scroll'",
        '"scroll"',
        'localStorage',
        'sessionStorage',
        'document.cookie',
        'fetch(',
        'XMLHttpRequest',
      ]) {
        expect(fuente, `${nombre}: ${vetado}`).not.toContain(vetado)
      }
    }
  })

  it('@s26 ninguno de los dos escribe la marca, el viewBox ni los ids del rótulo (los comentarios también son bytes)', () => {
    expect(COMPONENTE.split(IMPORT_DE_LA_VISTA)).toHaveLength(2)

    const bytesVigilados = [
      ['LogoAcoplado.tsx', COMPONENTE.replace(IMPORT_DE_LA_VISTA, '')],
      ['logo-acoplado-logica.ts', LOGICA],
    ] as const

    for (const [nombre, bytes] of bytesVigilados) {
      for (const vetado of ['Nails Lash', '-80 -840 4120 1200', 'tinta-marca', 'trazo-marca']) {
        expect(bytes, `${nombre}: ${vetado}`).not.toContain(vetado)
      }
    }
  })

  it('@s26 el componente no trae aria-label, ni animation, ni dangerouslySetInnerHTML', () => {
    for (const vetado of ['aria-label', 'animation', 'dangerouslySetInnerHTML']) {
      expect(COMPONENTE, vetado).not.toContain(vetado)
    }
  })
})

describe('@s27 LogoAcoplado.tsx y logo-acoplado-logica.ts entran en `mutate` (la puntuación la mide el mutation_tester, no un test)', () => {
  const STRYKER = JSON.parse(readFileSync('stryker.config.json', 'utf8')) as {
    mutate: string[]
    thresholds: { break: number }
  }

  function vecesEnMutate(fichero: string): number {
    return STRYKER.mutate.filter((ruta) => ruta === fichero).length
  }

  it('@s27 mutate trae EXACTAMENTE una vez cada fichero nuevo y sigue trayendo Cabecera.tsx y Hero.tsx; thresholds.break sigue en 100', () => {
    expect(STRYKER.mutate).toContain('src/components/Cabecera.tsx')
    expect(STRYKER.mutate).toContain('src/components/Hero.tsx')
    expect(vecesEnMutate('src/components/LogoAcoplado.tsx')).toBe(1)
    expect(vecesEnMutate('src/components/logo-acoplado-logica.ts')).toBe(1)
    expect(STRYKER.thresholds.break).toBe(100)
  })
})
