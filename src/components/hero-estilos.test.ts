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

describe('@s1 el estado base del rótulo en el SCSS es el estado final VISIBLE — sin ocultación en la base', () => {
  // 🎨 El MECANISMO cambió (2026-07-20) pero el INVARIANTE de F-07 es el mismo: el estado base es
  // el final VISIBLE, y lo oculto vive solo en el keyframe. Antes el reveal era un `clip-path`
  // sobre el <span>; ahora es una MÁSCARA cuyo contenido (`.trazo`) se dibuja con
  // `stroke-dashoffset`. `stroke-dashoffset: 0` = trazo COMPLETO = letras ENTERAS visibles.
  it('@s1 la regla base de .trazo declara stroke-dashoffset: 0 (trazo completo = letras visibles)', () => {
    // El 0 va ESCRITO A MANO: sin desplazamiento de guion = el trazo entero está dibujado.
    expect(reglaBase('trazo')).toMatch(/stroke-dashoffset\s*:\s*0\s*;/)
  })

  it('@s1 la regla base de .heroStudio declara opacity: 1', () => {
    expect(reglaBase('heroStudio')).toMatch(/opacity\s*:\s*1\b/)
  })

  it('@s1 ninguna de las dos reglas base oculta: ni stroke-dashoffset: 100 ni opacity: 0', () => {
    // El 100 va ESCRITO A MANO: es el valor de `pathLength`, o sea el trazo ENTERO sin dibujar.
    expect(reglaBase('trazo'), 'trazo no debe ocultar en la base').not.toMatch(
      /stroke-dashoffset\s*:\s*100\b/,
    )
    expect(reglaBase('heroStudio'), 'heroStudio no debe ocultar en la base').not.toMatch(
      /opacity\s*:\s*0\s*;/,
    )
  })

  it('@s1 ya NO queda ningún clip-path recortando el rótulo (era la causa MEDIDA del recorte lateral)', () => {
    // La «N» se salía 15,6‰ por la izquierda y la «h» 70,3‰ por la derecha de la caja de texto, y
    // `clip-path: inset(...)` recorta AL BORDER-BOX. Con el viewBox no hay caja que recorte: si
    // alguien reintroduce un clip-path sobre el rótulo, este test lo caza.
    expect(scss()).not.toMatch(/clip-path\s*:/)
  })
})

/**
 * @s2 — LA OTRA MITAD de @s1: el oculto EXISTE pero ENCERRADO en el 0% del keyframe. Sin las dos,
 * una implementación que borrara el keyframe pasaría @s1 (base visible) sin reveal alguno. Los
 * esperados se escriben A MANO y se LEEN del SCSS, no se importan.
 */
describe('@s2 el estado OCULTO del titular vive SOLO en el 0% del keyframe, jamás en la base', () => {
  // 🎨 El oculto vive en el `from` de cada keyframe. `escribir` arranca con el trazo SIN dibujar
  // (dashoffset 100 = pathLength entero) y `revelarStudio` con «STUDIO» transparente.
  it.each([
    {
      keyframe: 'escribir',
      clase: 'trazo',
      ocultoEnFrom: /stroke-dashoffset\s*:\s*100\b/,
      ocultoLiteralEnBase: /stroke-dashoffset\s*:\s*100\b/,
    },
    {
      keyframe: 'revelarStudio',
      clase: 'heroStudio',
      ocultoEnFrom: /opacity\s*:\s*0\s*;/,
      ocultoLiteralEnBase: /opacity\s*:\s*0\s*;/,
    },
  ])(
    '@s2 el @keyframes $keyframe oculta en el «from», y ese oculto NO está en la base de .$clase',
    ({ keyframe, clase, ocultoEnFrom, ocultoLiteralEnBase }) => {
      const cuerpo = cuerpoKeyframe(keyframe)
      const desde = fotograma(cuerpo, 'from')

      expect(desde, `${keyframe} necesita un fotograma «from»`).not.toBeNull()
      expect(desde as string).toMatch(ocultoEnFrom)

      // El oculto vive SOLO dentro del @keyframes: NO en la regla base del elemento.
      expect(reglaBase(clase)).not.toMatch(ocultoLiteralEnBase)
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
  it('@s3 existe un @media (prefers-reduced-motion: reduce) que aplica animation: none a .trazo, .aplicador y .heroStudio', () => {
    const media = cuerpoDelBloque(
      scss(),
      /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/,
    )

    expect(media, 'falta el @media (prefers-reduced-motion: reduce)').not.toBeNull()

    const cuerpo = media as string

    // Los TRES elementos que animan quedan bajo la regla, y su efecto es «animation: none». Si se
    // olvidara `.trazo`, el rótulo seguiría escribiéndose solo pese a la preferencia.
    expect(cuerpo).toMatch(/\.trazo\b/)
    expect(cuerpo).toMatch(/\.aplicador\b/)
    expect(cuerpo).toMatch(/\.heroStudio\b/)
    expect(cuerpo).toMatch(/animation\s*:\s*none\s*;/)
  })
})

/**
 * La clase de «lista» (ENMIENDA 2, @s15): GLOBAL y ESCRITA A MANO, jamás una clase del CSS module
 * (bajo `css: false` las del module son undefined — precedente `data-firma`). La añade el efecto
 * de MONTAJE de Hero.tsx; el encabezado del bloque condicionado del SCSS la lleva con `:global()`.
 */
const ENCABEZADO_DE_LA_LISTA = /\.escena:global\(\.caligrafia-lista\)\s*\{/

/** El cuerpo del bloque condicionado a la clase de «lista» — el ÚNICO sitio donde se anima. */
function bloqueDeLaLista(): string {
  const cuerpo = cuerpoDelBloque(scss(), ENCABEZADO_DE_LA_LISTA)

  expect(
    cuerpo,
    'falta el bloque .escena:global(.caligrafia-lista) que condiciona el arranque',
  ).not.toBeNull()

  return cuerpo as string
}

/** La regla ANIMADA de un elemento: vive DENTRO del bloque de la clase de «lista», no en la base. */
function reglaAnimada(clase: string): string {
  const cuerpo = cuerpoDelBloque(bloqueDeLaLista(), new RegExp(`\\.${clase}\\s*\\{`))

  expect(
    cuerpo,
    `.${clase} debe animar DENTRO del bloque de la clase de «lista» (@s15)`,
  ).not.toBeNull()

  return cuerpo as string
}

/** La declaración `animation: …;` de la regla ANIMADA (la del bloque de la clase de «lista»). */
function declaracionAnimacion(clase: string): string | null {
  return /animation\s*:\s*([^;]+);/.exec(reglaAnimada(clase))?.[1] ?? null
}

/**
 * El valor en segundos del token `--duracion-caligrafia`, LEÍDO de la regla raíz `.escena` (la
 * única regla que envuelve a trazo, aplicador y «STUDIO»). Que además valga EXACTAMENTE 90 lo
 * asevera el primer test de @s4 con el número ESCRITO A MANO (anti-tautología).
 */
function segundosDelToken(): number {
  const token = /--duracion-caligrafia\s*:\s*(\d+(?:\.\d+)?)s\s*;/.exec(reglaBase('escena'))

  expect(token, 'el token --duracion-caligrafia debe vivir en la regla raíz .escena').not.toBeNull()

  return Number((token as RegExpExecArray)[1])
}

/**
 * Las animaciones de una declaración `animation`, troceadas por las comas de PRIMER nivel: las
 * comas internas de `cubic-bezier(…)`, `var(…)` o `calc(…)` NO separan animaciones. Sustituye al
 * viejo «quitar paréntesis antes de partir»: ahora los paréntesis LLEVAN los tiempos (var/calc) y
 * borrarlos dejaría la aserción ciega.
 */
function animacionesDe(clase: string): string[] {
  const declaracion = declaracionAnimacion(clase)

  expect(declaracion, `${clase} debe declarar un animation en la hoja`).not.toBeNull()

  const animaciones: string[] = []
  let profundidad = 0
  let actual = ''

  for (const caracter of declaracion as string) {
    if (caracter === '(') {
      profundidad += 1
    } else if (caracter === ')') {
      profundidad -= 1
    }

    if (caracter === ',' && profundidad === 0) {
      animaciones.push(actual.trim())
      actual = ''
      continue
    }

    actual += caracter
  }

  animaciones.push(actual.trim())

  return animaciones
}

/**
 * Los términos de TIEMPO de una animación del atajo, en su orden (primero la duración, después el
 * retardo). Un término es un literal («0.1s», «900ms»), el token (`var(--duracion-caligrafia)`) o
 * un `calc(…)` sobre el token. Los números del `cubic-bezier(…)` no llevan unidad: no cuentan.
 */
function terminosDeTiempo(animacion: string): string[] {
  return (
    animacion.match(
      /calc\((?:[^()]|\([^()]*\))*\)|var\(--duracion-caligrafia\)|\b\d*\.?\d+(?:ms|s)\b/g,
    ) ?? []
  )
}

/**
 * Resuelve un término de tiempo a SEGUNDOS. Para `calc(var(--duracion-caligrafia) ± n s …)` parte
 * del token y aplica los sumandos con su signo — así los tests de coreografía comparan NÚMEROS de
 * verdad (el contrato exige que todo tiempo derive del token, no literales de 90 duplicados).
 */
function resolverSegundos(termino: string): number {
  if (termino === 'var(--duracion-caligrafia)') {
    return segundosDelToken()
  }

  if (termino.startsWith('calc(')) {
    expect(termino, 'todo calc() del rótulo debe derivar del token').toContain(
      'var(--duracion-caligrafia)',
    )

    return [...termino.matchAll(/([+-])\s*(\d*\.?\d+)s\b/g)].reduce(
      (total, [, signo, cantidad]) =>
        signo === '-' ? total - Number(cantidad) : total + Number(cantidad),
      segundosDelToken(),
    )
  }

  const literal = /^(\d*\.?\d+)(ms|s)$/.exec(termino)

  expect(literal, `término de tiempo irreconocible: ${termino}`).not.toBeNull()

  const [, cantidad, unidad] = literal as RegExpExecArray

  return unidad === 'ms' ? Number(cantidad) / 1000 : Number(cantidad)
}

/** {duración, retardo} en segundos de la animación de una clase cuyo nombre encabeza el término. */
function tiemposDe(clase: string, nombre: string): { duracion: number; retardo: number } {
  const animacion = animacionesDe(clase).find((candidata) => candidata.startsWith(nombre))

  expect(animacion, `${clase} debe declarar la animación ${nombre}`).toBeDefined()

  const [duracion, retardo] = terminosDeTiempo(animacion as string)

  expect(retardo, `${nombre} debe declarar duración Y retardo`).toBeDefined()

  return { duracion: resolverSegundos(duracion), retardo: resolverSegundos(retardo) }
}

/**
 * @s4 — REESCRITO (enmienda 2026-07-23, la CALIGRAFÍA LENTA). La aprobación de 4,5 s del
 * 2026-07-20 queda SUPERADA: Pablo pide ≈10 s por letra (9 letras ≈ 90 s de trazo). El número vive
 * en UN token (`--duracion-caligrafia: 90s`) y TODO tiempo del rótulo deriva de él — el reloj del
 * timeout de Hero.tsx lo asevera `hero-logica.test.ts` contra estos MISMOS bytes. La curva pasa a
 * `linear`: a 90 s el cubic-bezier anterior reptaría en los extremos y correría en el centro; una
 * pluma escribe a velocidad constante. jsdom NO anima: BYTES del SCSS; el ritmo real, EN VIVO.
 */
describe('@s4 un ÚNICO token --duracion-caligrafia: 90s gobierna TODOS los tiempos del rótulo', () => {
  it('@s4 el token vale EXACTAMENTE 90s, vive en la regla raíz .escena y se declara UNA sola vez', () => {
    // El 90 va ESCRITO A MANO: la decisión de Pablo (≈10 s por letra × 9 letras), 2026-07-23.
    expect(reglaBase('escena')).toMatch(/--duracion-caligrafia\s*:\s*90s\s*;/)
    // Se cuentan DECLARACIONES de CSS, no prosa: los comentarios citan el token con sus dos puntos.
    const sinComentarios = scss().replace(/\/\/[^\n]*/g, '')

    expect((sinComentarios.match(/--duracion-caligrafia\s*:/g) ?? []).length).toBe(1)
    expect(segundosDelToken()).toBe(90)
  })

  it('@s4 fuera del token NO queda ninguna duración de trazo suelta: todo literal restante es ≤ 1 s', () => {
    // Si alguien duplicara el 90 (u otro trazo largo) como literal en una animación, dejaría DOS
    // relojes que divergen al editar uno. Comentarios fuera: los tiempos de prosa no son CSS.
    const sinComentarios = scss().replace(/\/\/[^\n]*/g, '')
    const sinToken = sinComentarios.replace(/--duracion-caligrafia\s*:\s*90s\s*;/, '')
    const literales = [...sinToken.matchAll(/\b(\d*\.?\d+)(ms|s)\b/g)]

    expect(literales.length).toBeGreaterThan(0)
    for (const [texto, cantidad, unidad] of literales) {
      const segundos = unidad === 'ms' ? Number(cantidad) / 1000 : Number(cantidad)

      expect(segundos, `duración suelta sospechosa: ${texto}`).toBeLessThanOrEqual(1)
    }
  })

  it('@s4 «escribir» y «recorrer» duran var(--duracion-caligrafia) y su curva es linear en las DOS', () => {
    expect(reglaAnimada('trazo')).toMatch(
      /animation\s*:\s*escribir\s+var\(--duracion-caligrafia\)\s+linear\s+0\.1s\s+both/,
    )
    expect(reglaAnimada('aplicador')).toMatch(
      /recorrer\s+var\(--duracion-caligrafia\)\s+linear\s+0\.1s\s+both/,
    )
    // La curva vieja NO queda en el reloj del trazo: reptaría en los extremos a esta duración.
    for (const reloj of ['escribir', 'recorrer']) {
      const animacion = animacionesDe(reloj === 'escribir' ? 'trazo' : 'aplicador').find(
        (candidata) => candidata.startsWith(reloj),
      )

      expect(animacion, `falta ${reloj}`).toBeDefined()
      expect(animacion as string).not.toContain('cubic-bezier')
    }
  })

  it('@s4 tinta y aplicador siguen siendo UN reloj: misma duración, mismo retardo, misma curva', () => {
    // Es la razón de que la punta caiga sobre la tinta (la queja ORIGINAL de Pablo). Con tiempos
    // distintos, la punta se adelantaría o se quedaría atrás. Los esperados van A MANO.
    const escribir = tiemposDe('trazo', 'escribir')
    const recorrer = tiemposDe('aplicador', 'recorrer')

    expect(recorrer.duracion).toBe(escribir.duracion)
    expect(recorrer.retardo).toBe(escribir.retardo)
    expect(escribir.duracion).toBe(90)
    expect(escribir.retardo).toBeCloseTo(0.1, 6)
  })

  it('@s4 «retirarse» arranca en calc(var(--duracion-caligrafia) - 0.4s + 0.1s), derivado del token', () => {
    // La coreografía relativa de hoy (el aplicador se retira al acabar el trazo), expresada SOBRE
    // el token: cambiar los 90 s recoloca la retirada sola. La fórmula va ESCRITA A MANO.
    expect(reglaAnimada('aplicador')).toMatch(
      /retirarse\s+0\.5s\s+linear\s+calc\(var\(--duracion-caligrafia\)\s*-\s*0\.4s\s*\+\s*0\.1s\)\s+both/,
    )
    expect(tiemposDe('aplicador', 'retirarse').retardo).toBeCloseTo(89.7, 6)
  })

  it('@s4 «revelarStudio» arranca en calc(var(--duracion-caligrafia) + 0.2s) y «aparecer» sigue en 0.3s', () => {
    expect(reglaAnimada('heroStudio')).toMatch(
      /revelarStudio\s+0\.6s\s+[^;]*calc\(var\(--duracion-caligrafia\)\s*\+\s*0\.2s\)\s+both/,
    )
    expect(tiemposDe('heroStudio', 'revelarStudio').retardo).toBeCloseTo(90.2, 6)
    // `aparecer` (el fundido de entrada del aplicador) queda IGUAL que antes de la enmienda.
    expect(reglaAnimada('aplicador')).toMatch(/aparecer\s+0\.3s\s+linear\s+0\.1s\s+both/)
  })
})

/**
 * @s4 (segunda mitad) — EL ORDEN. Que cada pieza derive del token no basta: el contrato dice que
 * «STUDIO» se revela AL TERMINAR la marca, «no antes». Se escapó una violación REAL —«STUDIO»
 * arrancaba 0,3 s antes de que la marca acabara de escribirse, con el comentario del SCSS
 * afirmando justo lo contrario— porque ningún test comparaba los dos relojes. Este lo hace,
 * RESOLVIENDO el token y los calc() a números.
 */
describe('@s4 «STUDIO» entra CUANDO la marca ya está escrita, nunca antes — total ≈90,8 s', () => {
  it('@s4 el retardo de .heroStudio es ≥ que el final del trazo (retardo + duración)', () => {
    const escribir = tiemposDe('trazo', 'escribir')
    const studio = tiemposDe('heroStudio', 'revelarStudio')

    expect(escribir.duracion, 'el trazo debe declarar duración').toBeGreaterThan(0)
    expect(studio.retardo, 'STUDIO debe declarar un retardo').toBeGreaterThan(0)
    // En MILISEGUNDOS ENTEROS: en coma flotante 0,1 + 90 puede dar …0000006 y un `>=` fallaría
    // por 6·10⁻¹⁶ describiendo un defecto que no existe.
    const ms = (s: number) => Math.round(s * 1000)

    // Si alguien acelera «STUDIO» o alarga el trazo sin recolocar el otro, esto se pone rojo.
    expect(ms(studio.retardo)).toBeGreaterThanOrEqual(ms(escribir.retardo) + ms(escribir.duracion))
  })

  it('@s4 la ceremonia completa (retardo + duración de «revelarStudio») suma 90,8 s EXACTOS', () => {
    const studio = tiemposDe('heroStudio', 'revelarStudio')
    const ms = (s: number) => Math.round(s * 1000)

    // 90 + 0,2 + 0,6 = 90,8 — el 90800 va ESCRITO A MANO y es el MISMO número que asevera
    // `hero-logica.test.ts` para el timeout de Hero.tsx: un solo reloj, dos vigilantes.
    expect(ms(studio.retardo + studio.duracion)).toBe(90_800)
  })
})

/**
 * @s10/@s14 (enmienda 2026-07-23) — EL CONTROL SIN CROMO en la hoja. jsdom no pinta: que el botón
 * sea invisible (sin fondo, sin borde, sin texto propio), que el cursor sea pointer y que su
 * superficie quede CEÑIDA al área del rótulo se asevera por BYTES; la geometría real, EN VIVO.
 * El anillo de foco NO se declara aquí: lo pinta el `:focus-visible` GLOBAL de `_base.scss`
 * (SC 2.4.7 ya resuelto) — por eso se asevera la AUSENCIA de outline en esta hoja.
 */
describe('@s10/@s14 el control sin cromo: invisible, ceñido al rótulo y con cursor pointer', () => {
  it('@s10 .control es transparente de verdad: sin fondo, sin borde y sin padding', () => {
    const control = reglaBase('control')

    expect(control).toMatch(/background\s*:\s*transparent\s*;/)
    expect(control).toMatch(/border\s*:\s*0\s*;/)
    expect(control).toMatch(/padding\s*:\s*0\s*;/)
  })

  it('@s10 sobre el rótulo el cursor es pointer (la única pista visual de que la firma se puede completar)', () => {
    expect(reglaBase('control')).toMatch(/cursor\s*:\s*pointer\s*;/)
  })

  it('@s10 la hoja NO apaga el anillo de foco global: cero declaraciones de outline', () => {
    expect(scss()).not.toMatch(/outline\s*:/)
  })

  it('@s14 la superficie clicable queda CEÑIDA al rótulo: absolute + inset 0 dentro de la escena relativa', () => {
    const control = reglaBase('control')

    // `inset: 0` sobre la `.escena` (position: relative, inline-block que ABRAZA al rótulo):
    // la superficie es EXACTAMENTE la caja del rótulo, ni un píxel de portada alrededor.
    expect(control).toMatch(/position\s*:\s*absolute\s*;/)
    expect(control).toMatch(/inset\s*:\s*0\s*;/)
    expect(reglaBase('escena')).toMatch(/position\s*:\s*relative/)
    expect(control).not.toMatch(/position\s*:\s*fixed/)
  })
})

/**
 * @s11/@s12 — LA FIRMA COMPLETADA en la hoja. La BASE del SCSS ya ES el estado final (I-4):
 * completar = desactivar las animaciones. El selector lee el `data-firma` que publica Hero.tsx
 * (patrón `data-distancia` de la galería: observable bajo `css: false`, decisión pura por valor),
 * con los DOS finales — «cliente» (@s11) y «reloj» (@s12) — nombrados a mano.
 */
describe('@s11/@s12 la firma completada: animation none devuelve cada pieza a su base VISIBLE', () => {
  it('@s11 el bloque data-firma cliente/reloj aplica animation: none a .trazo, .aplicador y .heroStudio', () => {
    const completada = cuerpoDelBloque(scss(), /\.escena\[data-firma='cliente'\]\s*,/)

    expect(
      completada,
      "falta el bloque .escena[data-firma='cliente'], .escena[data-firma='reloj']",
    ).not.toBeNull()
    // Los dos finales comparten el MISMO bloque: completar por clic o por fin de reloj es igual.
    expect(scss()).toMatch(/\.escena\[data-firma='reloj'\]\s*\{/)

    const cuerpo = completada as string

    // Las TRES piezas que animan quedan cubiertas: olvidar una dejaría media firma sin completar.
    expect(cuerpo).toMatch(/\.trazo\b/)
    expect(cuerpo).toMatch(/\.aplicador\b/)
    expect(cuerpo).toMatch(/\.heroStudio\b/)
    expect(cuerpo).toMatch(/animation\s*:\s*none\s*;/)
  })
})

/**
 * @s15 (ENMIENDA 2, cierra A-3) — EL ARRANQUE EN EL MONTAJE. La caligrafía DEJA de arrancar con el
 * CSS a secas: TODAS las animaciones del rótulo quedan condicionadas a la clase de «lista» que el
 * efecto de montaje añade a la escena, y el estado base NO declara ninguna. Consecuencia: sin
 * JavaScript la base (que YA es el estado final, @s1) es lo ÚNICO que se pinta — rótulo COMPLETO y
 * ESTÁTICO desde el primer pintado — y NUNCA hay movimiento sin el mecanismo para pararlo, porque
 * clase y botón nacen en el MISMO montaje (el DOM lo asevera hero.test.tsx). BYTES del SCSS.
 */
describe('@s15 las animaciones viven condicionadas a la clase de «lista»: el estado base NO anima', () => {
  it('@s15 las reglas base de .trazo, .aplicador y .heroStudio NO declaran animation (la base ya es el final)', () => {
    for (const clase of ['trazo', 'aplicador', 'heroStudio']) {
      expect(
        reglaBase(clase),
        `la base de .${clase} no debe animar: el arranque es del montaje, no del primer pintado`,
      ).not.toMatch(/animation\s*:/)
    }
  })

  it('@s15 el bloque de la clase de «lista» (GLOBAL, observable bajo css:false) anima las TRES piezas', () => {
    for (const clase of ['trazo', 'aplicador', 'heroStudio']) {
      expect(reglaAnimada(clase)).toMatch(/animation\s*:/)
    }
  })

  it('@s15 las CINCO animaciones del rótulo viven DENTRO del bloque de la clase, ninguna suelta', () => {
    const bloque = bloqueDeLaLista()

    // Los cinco nombres van ESCRITOS A MANO: escribir/recorrer (el reloj), aparecer/retirarse (el
    // aplicador) y revelarStudio. Si alguna se quedara en la base, arrancaría sin montaje (A-3).
    for (const nombre of ['escribir', 'recorrer', 'aparecer', 'retirarse', 'revelarStudio']) {
      expect(bloque, `la animación «${nombre}» debe estar condicionada a la clase`).toContain(
        nombre,
      )
    }
  })

  it('@s15 fuera del bloque de la clase, TODO animation restante es «none»: nada arranca sin montaje', () => {
    // Comentarios fuera (citan animaciones en prosa) y el bloque de la lista fuera: lo que queda
    // (@media reduce y data-firma completada) solo puede APAGAR animaciones, jamás declararlas.
    const hoja = scss().replace(/\/\/[^\n]*/g, '')
    const bloque = cuerpoDelBloque(hoja, ENCABEZADO_DE_LA_LISTA)

    expect(bloque, 'falta el bloque condicionado a la clase de «lista»').not.toBeNull()

    const fuera = hoja.replace(bloque as string, '')

    for (const [declaracion, valor] of fuera.matchAll(/animation\s*:\s*([^;]+);/g)) {
      expect(valor.trim(), `animación arrancando fuera del montaje: ${declaracion}`).toBe('none')
    }
  })
})

/**
 * @s9 (responsive) — el ancho del <svg> tiene que ser el del viewBox expresado en em, o el rótulo
 * sale deformado o desencajado. No tenía NINGÚN test: el `judge` lo cazó cambiando `4.12em` por
 * `40em` con la suite en verde. El 4,12 sale de VISTA_MARCA ('-80 -840 4120 1200'): 4120 milésimas
 * de em = 4,12 em. Va ESCRITO A MANO, no importado.
 */
describe('@s9 el <svg> del rótulo mide, en em, exactamente el ancho de su viewBox', () => {
  it('@s9 la regla base de .rotulo declara width: 4.12em (= 4120‰ de em del viewBox)', () => {
    expect(reglaBase('rotulo')).toMatch(/width\s*:\s*4\.12em/)
  })

  it('@s9 .rotulo escala con clamp() y NO fija una altura (la deduce del viewBox)', () => {
    const base = reglaBase('rotulo')

    // El clamp() es lo que hace responsive al rótulo sin depender del contenedor.
    expect(base).toMatch(/font-size\s*:\s*clamp\(/)
    expect(base).toMatch(/height\s*:\s*auto/)
    // `overflow: visible` deja al aplicador asomar fuera del viewBox sin recortarse.
    expect(base).toMatch(/overflow\s*:\s*visible/)
  })

  it('@s9 .rotulo NO usa max-width en % (colapsaba el rótulo dentro del .escena inline-block)', () => {
    // Medido: con `max-width: 100%` el rótulo caía a 102 px y el hero entero a 48 px, porque el
    // porcentaje se resuelve contra un contenedor que a su vez se dimensiona por su contenido.
    expect(reglaBase('rotulo')).not.toMatch(/max-width\s*:[^;]*%/)
  })
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

/**
 * @s17 — AMPLIACIÓN 2026-07-18 (acceptance 7). La verificación EN VIVO con Chrome cazó que el titular
 * salía en la fuente por defecto del UA («Times New Roman»), NO en Great Vibes: `.heroMarca`/
 * `.heroStudio` NO declaraban `font-family` → HEREDABAN la del cuerpo. El `@font-face` de Great Vibes
 * y Manrope YA está horneado por F-05 (`src/main.tsx`); el hero simplemente NO la pedía. ESTE test
 * asevera SOLO que el SCSS PIDE la fuente (bytes del `.module.scss`, como @s1/@s3/@s9). Que el
 * NAVEGADOR la APLIQUE se RE-VERIFICA EN VIVO con Chrome, NO aquí (jsdom no carga @font-face [V]).
 *
 * Anti-tautología: los nombres esperados «Great Vibes» y «Manrope» van ESCRITOS A MANO (como el 1,2 s
 * de @s4), NUNCA importados de site.ts ni de ningún símbolo. Regex robusta a comillas simples/dobles
 * y al whitespace de prettier.
 */
describe('@s17 el rótulo declara su tipografía de marca en el SCSS — Great Vibes (.letras) y Manrope (.heroStudio)', () => {
  // 🎨 «Nails Lash» ya no lo pinta el <span> de HTML sino el <text> del <svg> (`.letras`): la
  // fuente tiene que pedirla ESE elemento. Sin `font-family` heredaría la del cuerpo (Manrope) y
  // el rótulo saldría en palo seco — el mismo fallo que se cazó EN VIVO en F-07 con Times New Roman.
  it('@s17 la regla base de .letras declara font-family con «Great Vibes» + fallback genérico cursive', () => {
    // «Great Vibes» y «cursive» van ESCRITOS A MANO: la letra manuscrita de marca horneada en F-05.
    expect(reglaBase('letras')).toMatch(/font-family\s*:\s*['"]Great Vibes['"]\s*,\s*cursive/)
  })

  it('@s17 la regla base de .heroStudio declara font-family con «Manrope» + fallback genérico sans-serif', () => {
    // «Manrope» y «sans-serif» van ESCRITOS A MANO, no importados de ningún símbolo.
    expect(reglaBase('heroStudio')).toMatch(/font-family\s*:\s*['"]Manrope['"]\s*,\s*sans-serif/)
  })

  it('@s17 NINGUNA de las dos reglas base se queda SIN font-family (la ausencia fue el fallo cazado en vivo)', () => {
    // Presencia EXPLÍCITA: es justo lo que faltaba (heredar la del cuerpo → «Times New Roman»).
    for (const clase of ['letras', 'heroStudio']) {
      expect(reglaBase(clase), `${clase} debe NOMBRAR su propia font-family, no heredarla`).toMatch(
        /font-family\s*:/,
      )
    }
  })

  it('@s17 el rótulo se pinta con --ink (fill), NUNCA con --accent/--brush', () => {
    // En SVG el color del texto es `fill`, no `color`: sin esta aserción @s9 miraría a otro sitio.
    expect(reglaBase('letras')).toMatch(/fill\s*:\s*var\(\s*--ink\s*\)/)
    expect(scss()).not.toMatch(/fill\s*:\s*var\(\s*--(accent|brush)/i)
  })
})

/**
 * 🎨 DEMO — «TRAZO DE PLUMA» (decisión de Pablo 2026-07-19): el aplicador de esmalte ESCRIBE «Nails
 * Lash» recorriendo el trazo real de cada letra (sube la N, la montaña, los lazos), NO un barrido
 * horizontal. El aplicador vive en un <svg> con viewBox (escala con el titular) y lo mueve SMIL
 * `<animateMotion>` — su ESTRUCTURA se asevera en hero.test.tsx (render); AQUÍ, el invariante de HOJA
 * (Stryker no ve SCSS): bajo prefers-reduced-motion el <svg> del pincel NO se muestra (display:none)
 * y el titular no anima. La sincronía punta↔tinta se RE-VERIFICA EN VIVO con Chrome (jsdom no anima).
 */
describe('@demo el aplicador de esmalte se OCULTA bajo prefers-reduced-motion (sin movimiento residual)', () => {
  it('@demo el @media (prefers-reduced-motion: reduce) oculta .aplicador (display:none) y para las animaciones', () => {
    const media = cuerpoDelBloque(
      scss(),
      /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/,
    )

    expect(media, 'falta el @media (prefers-reduced-motion: reduce)').not.toBeNull()
    const cuerpo = media as string
    // El aplicador desaparece por completo y el rótulo queda en su base (trazo entero, visible).
    expect(cuerpo).toMatch(/\.aplicador\b/)
    expect(cuerpo).toMatch(/display\s*:\s*none/)
    expect(cuerpo).toMatch(/animation\s*:\s*none/)
  })

  it('@demo el aplicador recorre EL MISMO path que dibuja la máscara (sincronía por construcción)', () => {
    // `offset-path: url(#trazo-marca)` REFERENCIA el <path> de la máscara en vez de duplicarlo
    // (son 9,8 kB). Si alguien lo sustituyera por otra geometría, la punta dejaría de caer sobre
    // la tinta y volvería la incoherencia que Pablo reportó. El id va ESCRITO A MANO.
    expect(reglaBase('aplicador')).toMatch(/offset-path\s*:\s*url\(\s*['"]?#trazo-marca['"]?\s*\)/)
  })

  it('@demo el dasharray va en UNIDADES DE USUARIO, nunca en %, o la sincronía se rompería', () => {
    // ⚠️ Trampa real: los porcentajes de `stroke-dasharray` se resuelven contra la DIAGONAL DEL
    // VIEWPORT, mientras que `offset-distance: %` se mide sobre la LONGITUD del path. Mezclarlos
    // desincroniza la punta respecto a la tinta. Con `pathLength="100"` el 100 es el path entero.
    expect(reglaBase('trazo')).toMatch(/stroke-dasharray\s*:\s*100\s*;/)
    expect(reglaBase('trazo')).not.toMatch(/stroke-dasharray[^;]*%/)
  })

  it('@demo la hoja del hero NO hornea ninguna petición a un origen externo http(s) (cero terceros, F-05 intacto)', () => {
    // El aplicador es local; su imagen viaja como href en el render (no como url() de la hoja).
    expect(scss()).not.toMatch(/url\(\s*['"]?https?:/i)
  })
})
