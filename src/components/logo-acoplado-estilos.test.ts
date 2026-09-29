import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

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
