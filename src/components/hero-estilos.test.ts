import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { MATRIZ_DE_USO, MINIMO_DE_PARES } from '../lib/puerta-contraste'

/**
 * F-07 — EL CORAZÓN: el estado base VISIBLE del hero, sobre el SCSS module (I-4). El SCSS NO es
 * mutable (Stryker no ve CSS): lo aseveran ESTOS tests (que LEEN el SCSS, como `tokens.test.ts` de
 * F-03 y el `scroll-padding` de F-06) y la puerta de aprobación humana.
 *
 * La forma EXACTA la fija `.experimentos-tmp/veredictos-f07/A3-estado-base.md §6` (base visible +
 * oculto SOLO en el 0% + `@media reduce`), MEDIDA con build SSG real + Chrome/CDP. Contrato:
 * features/hero_marca.feature (@s1..@s4, @s9).
 *
 * Los esperados (los valores del CSS, el límite 1,2 s, el token --ink) van ESCRITOS A MANO
 * (anti-tautología): se LEEN del SCSS, jamás se importan como símbolo.
 */
const RUTA_SCSS = 'src/components/hero.module.scss'

function scss(): string {
  return readFileSync(RUTA_SCSS, 'utf8')
}

/**
 * El cuerpo (entre llaves) del PRIMER bloque cuyo encabezado casa `encabezado`, contando llaves
 * para respetar el anidamiento (@keyframes/@media). Robusto al reformateo de prettier (no depende
 * de saltos de línea). Devuelve null si no hay bloque.
 */
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

/** La regla base del elemento (`.heroMarca {`), NUNCA la del @media (allí es `.heroMarca,`). */
function reglaBase(clase: string): string {
  const cuerpo = cuerpoDelBloque(scss(), new RegExp(`\\.${clase}\\s*\\{`))

  expect(cuerpo, `no se encontró la regla base de .${clase}`).not.toBeNull()

  return cuerpo as string
}

/** El cuerpo de un fotograma («0%» / «100%») DENTRO del cuerpo de un @keyframes. */
function fotograma(cuerpoKeyframe: string, parada: string): string | null {
  return cuerpoDelBloque(cuerpoKeyframe, new RegExp(`${parada}\\s*\\{`))
}

/** El cuerpo de un @keyframes por su nombre (contando llaves: tiene fotogramas anidados). */
function cuerpoKeyframe(nombre: string): string {
  const cuerpo = cuerpoDelBloque(scss(), new RegExp(`@keyframes\\s+${nombre}\\s*\\{`))

  expect(cuerpo, `no se encontró el @keyframes ${nombre}`).not.toBeNull()

  return cuerpo as string
}

describe('@s1 el estado base del titular en el SCSS es el estado final VISIBLE — sin opacity:0 ni clip-path oculto', () => {
  it('@s1 la regla base de .heroMarca declara clip-path: inset(0 0 0 0) (caja completa = visible)', () => {
    // El valor «inset(0 0 0 0)» va ESCRITO A MANO: recuadro sin desplazamiento = caja completa.
    expect(reglaBase('heroMarca')).toMatch(/clip-path\s*:\s*inset\(\s*0\s+0\s+0\s+0\s*\)/)
  })

  it('@s1 la regla base de .heroStudio declara opacity: 1', () => {
    expect(reglaBase('heroStudio')).toMatch(/opacity\s*:\s*1\b/)
  })

  it('@s1 ninguna regla base de esos dos elementos declara opacity: 0 ni un clip-path que recorte', () => {
    for (const clase of ['heroMarca', 'heroStudio']) {
      const base = reglaBase(clase)

      // «opacity: 0» (no «opacity: 1»): el estado transparente NO vive en la base.
      expect(base, `${clase} no debe ocultar en la base`).not.toMatch(/opacity\s*:\s*0\s*;/)
      // Un clip-path que recorta (p. ej. inset con 100%): el oculto NO vive en la base.
      expect(base, `${clase} no debe recortar en la base`).not.toMatch(/clip-path[^;]*100%/)
    }
  })
})

/**
 * @s2 — LA OTRA MITAD de @s1: el oculto EXISTE pero ENCERRADO en el 0% del keyframe. Sin las dos,
 * una implementación que borrara el keyframe pasaría @s1 (base visible) sin reveal alguno. Los
 * esperados se escriben A MANO y se LEEN del SCSS, no se importan.
 */
describe('@s2 el estado OCULTO del titular vive SOLO en el 0% del keyframe, jamás en la base', () => {
  it.each([
    {
      keyframe: 'paintReveal',
      ocultoEn0: /clip-path\s*:\s*inset\(\s*0\s+100%\s+0\s+0\s*\)/,
      visibleEn100: /clip-path\s*:\s*inset\(\s*0\s+0\s+0\s+0\s*\)/,
      ocultoLiteralEnBase: /clip-path[^;]*100%/,
    },
    {
      keyframe: 'fadeUp',
      ocultoEn0: /opacity\s*:\s*0\s*;/,
      visibleEn100: /opacity\s*:\s*1\b/,
      ocultoLiteralEnBase: /opacity\s*:\s*0\s*;/,
    },
  ])(
    '@s2 el @keyframes $keyframe oculta en el 0%, muestra el final en el 100%, y el oculto NO está en la base',
    ({ keyframe, ocultoEn0, visibleEn100, ocultoLiteralEnBase }) => {
      const cuerpo = cuerpoKeyframe(keyframe)

      const cero = fotograma(cuerpo, '0%')
      const cien = fotograma(cuerpo, '100%')

      expect(cero, `${keyframe} necesita un fotograma 0%`).not.toBeNull()
      expect(cien, `${keyframe} necesita un fotograma 100%`).not.toBeNull()

      expect(cero as string).toMatch(ocultoEn0)
      expect(cien as string).toMatch(visibleEn100)

      // El oculto vive SOLO dentro del @keyframes: NO en ninguna regla base de elemento.
      expect(reglaBase('heroMarca')).not.toMatch(ocultoLiteralEnBase)
      expect(reglaBase('heroStudio')).not.toMatch(ocultoLiteralEnBase)
    },
  )
})

/**
 * @s3 — CRITERIO DE PROYECTO (C-4), NO WCAG A/AA. Bajo `@media (prefers-reduced-motion: reduce)` el
 * hero se presenta en su estado final visible y legible SIN movimiento residual. El prototipo NO la
 * tiene (medido: sin JS y bajo `reduce` se traga 4,8s + 4,4s). PROHIBIDO «WCAG obliga»/«obligatorio»
 * a secas: ningún SC de nivel A/AA obliga reduced-motion para animación de carga [V, A4].
 */
describe('@s3 el SCSS declara @media (prefers-reduced-motion: reduce) { animation: none } para el titular', () => {
  it('@s3 existe un @media (prefers-reduced-motion: reduce) que aplica animation: none a .heroMarca y .heroStudio', () => {
    const media = cuerpoDelBloque(
      scss(),
      /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/,
    )

    expect(media, 'falta el @media (prefers-reduced-motion: reduce)').not.toBeNull()

    const cuerpo = media as string

    // Los dos elementos del titular quedan bajo la regla, y su efecto es «animation: none».
    expect(cuerpo).toMatch(/\.heroMarca\b/)
    expect(cuerpo).toMatch(/\.heroStudio\b/)
    expect(cuerpo).toMatch(/animation\s*:\s*none\s*;/)
  })
})

/** La declaración `animation: …;` de una regla base. null si el elemento no anima. */
function declaracionAnimacion(clase: string): string | null {
  return /animation\s*:\s*([^;]+);/.exec(reglaBase(clase))?.[1] ?? null
}

/**
 * Suma los valores de TIEMPO («1s», «0.1s», «900ms») de una declaración `animation`, resueltos a
 * segundos = delay + duración. Los números del `cubic-bezier(0.5, 0, 0.25, 1)` NO llevan unidad de
 * tiempo, así que NO cuentan; `both` no es un número. Espejo de cómo @s14 sumaría count × duración.
 */
function segundosTotales(animacion: string): number {
  const tiempos = [...animacion.matchAll(/(\d*\.?\d+)(ms|s)\b/g)]

  return tiempos.reduce((suma, [, cantidad, unidad]) => {
    const segundos = unidad === 'ms' ? Number(cantidad) / 1000 : Number(cantidad)

    return suma + segundos
  }, 0)
}

/**
 * @s4 — el NÚMERO lo fijó la PUERTA (C-3, APROBADO 2026-07-18): ≤ 1,2 s TOTAL (delay + duración).
 * La base visible protege el REPOSO pero NO acorta el reveal (medido: con delay 0,5s + duración
 * 4,8s el titular-LCP se retrasaba a ~5,3s) → la puerta ACORTA a ≤1,2s. Este eje (la DURACIÓN) SÍ
 * es puerta unitaria; el NÚMERO LCP real NO (C-2, verificación EN VIVO con Chrome).
 */
describe('@s4 la duración total (delay + duración) de la animación del hero está ACOTADA ≤ 1,2 s', () => {
  // El límite 1,2 s va ESCRITO A MANO (C-3), RE-LEÍDO del SCSS, JAMÁS importado como símbolo.
  const LIMITE_TOTAL_SEGUNDOS = 1.2

  it.each(['heroMarca', 'heroStudio'])(
    '@s4 %s declara un animation cuya suma delay + duración es ≤ 1,2 s',
    (clase) => {
      const animacion = declaracionAnimacion(clase)

      expect(animacion, `${clase} debe declarar un animation en la hoja`).not.toBeNull()

      const total = segundosTotales(animacion as string)

      // Debe haber al menos dos tiempos (duración + delay): un solo tiempo escondería el delay.
      expect(
        [...(animacion as string).matchAll(/(\d*\.?\d+)(ms|s)\b/g)].length,
      ).toBeGreaterThanOrEqual(2)
      expect(total).toBeLessThanOrEqual(LIMITE_TOTAL_SEGUNDOS)
    },
  )
})

/**
 * @s9 — CASO LÍMITE 7. El titular se pinta con `--ink`, NUNCA con `--accent`/`--brush` (#C05576)
 * como TEXTO: pintarlo con #C05576 da 4,05 < 4,5 → la puerta de contraste de F-03 ROJA (build roto)
 * [V, medido]. El par `--ink`/`--bg` YA ESTÁ en MATRIZ_DE_USO (ratio 7,06) → no hace falta fila
 * nueva ni subir MINIMO_DE_PARES. Y NO se añade una rama «texto grande 3:1» para colar un rosa
 * (reintroduce el mutante inmortal que F-03 evitó). #C05576 sí vale como relleno grande, nunca texto.
 */
describe('@s9 el titular se pinta con --ink, NUNCA con --accent/--brush como texto', () => {
  it('@s9 la regla base del titular declara color: var(--ink)', () => {
    // El token --ink va ESCRITO A MANO aquí; el titular NUNCA usa --accent/--brush como texto.
    expect(reglaBase('titulo')).toMatch(/color\s*:\s*var\(\s*--ink\s*\)/)
  })

  it('@s9 el SCSS del hero NO usa --accent, --brush ni #C05576 como color de TEXTO del titular', () => {
    const hoja = scss()

    expect(hoja).not.toMatch(/color\s*:\s*var\(\s*--accent/i)
    expect(hoja).not.toMatch(/color\s*:\s*var\(\s*--brush/i)
    expect(hoja).not.toMatch(/color\s*:\s*#C05576/i)
  })

  it('@s9 el par --ink/--bg YA está en MATRIZ_DE_USO y MINIMO_DE_PARES sigue en 18 (ni fila nueva ni subir el mínimo)', () => {
    const tieneParTitular = MATRIZ_DE_USO.some(
      (par) =>
        par.fg.clase === 'token' &&
        par.fg.token === '--ink' &&
        par.bg.clase === 'token' &&
        par.bg.token === '--bg',
    )

    expect(tieneParTitular).toBe(true)
    // El 18 va ESCRITO A MANO (anti-tautología): F-07 no añade fila ni sube el mínimo por el titular.
    expect(MINIMO_DE_PARES).toBe(18)
  })
})
