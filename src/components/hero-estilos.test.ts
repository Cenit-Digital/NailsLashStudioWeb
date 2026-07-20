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
describe('@s4 la duración total (delay + duración) de la animación del hero está ACOTADA ≤ 4,5 s', () => {
  // 🎨 El tope de F-07 era 1,2 s (C-3, decisión de LCP), y el demo anterior lo subió a 2,5 s. Pablo
  // APRUEBA el 2026-07-20 subirlo a 4,5 s para que la caligrafía se aprecie, ACEPTANDO el coste de
  // LCP (el rótulo tarda ~4 s en revelarse). No infringe WCAG 2.2.2 (exige MÁS de cinco segundos)
  // ni 2.3.3 (AAA, y solo cubre animación disparada por interacción); bajo prefers-reduced-motion
  // aparece instantáneo. El límite sigue ESCRITO A MANO, RE-LEÍDO del SCSS, JAMÁS importado como
  // símbolo — y la cota sigue MORDIENDO: una animación descontrolada rompe este test igual.
  const LIMITE_TOTAL_SEGUNDOS = 4.5

  it.each(['trazo', 'heroStudio'])(
    '@s4 %s declara un animation cuya suma delay + duración es ≤ 4,5 s',
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
 * Los tiempos (duración, retardo) de la PRIMERA animación declarada por una clase, en segundos y
 * en el orden del atajo `animation`: primero la duración, después el retardo.
 */
function tiemposDe(clase: string): number[] {
  const animacion = declaracionAnimacion(clase) ?? ''
  // Se quitan los grupos entre paréntesis ANTES de separar por comas: si no, la coma interna de
  // `cubic-bezier(0.45, 0, 0.25, 1)` partiría la primera animación por la mitad y el retardo se
  // perdería. Tras quitarlos, la primera coma restante separa de veras una animación de la siguiente.
  const sinFunciones = animacion.replace(/\([^)]*\)/g, '')
  const primera = sinFunciones.split(',')[0]

  return [...primera.matchAll(/(\d*\.?\d+)(ms|s)\b/g)].map(([, cantidad, unidad]) =>
    unidad === 'ms' ? Number(cantidad) / 1000 : Number(cantidad),
  )
}

/**
 * @s4 (segunda mitad) — EL ORDEN. Que cada animación quepa en 4,5 s no basta: el contrato dice que
 * «STUDIO» se revela AL TERMINAR la marca, «no antes». Se escapó una violación REAL —«STUDIO»
 * arrancaba 0,3 s antes de que la marca acabara de escribirse, con el comentario del SCSS
 * afirmando justo lo contrario— porque ningún test comparaba los dos relojes. Este lo hace.
 */
describe('@s4 «STUDIO» entra CUANDO la marca ya está escrita, nunca antes', () => {
  it('@s4 el retardo de .heroStudio es ≥ que el final del trazo (retardo + duración)', () => {
    const [duracionTrazo, retardoTrazo] = tiemposDe('trazo')
    const [, retardoStudio] = tiemposDe('heroStudio')

    expect(duracionTrazo, 'el trazo debe declarar duración').toBeGreaterThan(0)
    expect(retardoStudio, 'STUDIO debe declarar un retardo').toBeGreaterThan(0)
    // En MILISEGUNDOS ENTEROS: en coma flotante 0,1 + 3,6 da 3,7000000000000006 y un `>=` contra
    // 3,7 fallaría por 6·10⁻¹⁶ describiendo un defecto que no existe.
    const ms = (s: number) => Math.round(s * 1000)

    // Si alguien acelera «STUDIO» o alarga el trazo sin recolocar el otro, esto se pone rojo.
    expect(ms(retardoStudio)).toBeGreaterThanOrEqual(ms(retardoTrazo) + ms(duracionTrazo))
  })

  it('@s4 el aplicador recorre el trazo EXACTAMENTE en el mismo tiempo que se dibuja la tinta', () => {
    // Es la razón de que la punta caiga sobre la tinta: misma duración, mismo retardo, misma curva.
    // Con tiempos distintos, la punta se adelantaría o se quedaría atrás — la queja original.
    const [duracionTrazo, retardoTrazo] = tiemposDe('trazo')
    const [duracionAplicador, retardoAplicador] = tiemposDe('aplicador')

    expect(duracionAplicador).toBe(duracionTrazo)
    expect(retardoAplicador).toBe(retardoTrazo)
    expect(declaracionAnimacion('aplicador')).toContain('cubic-bezier(0.45, 0, 0.25, 1)')
    expect(declaracionAnimacion('trazo')).toContain('cubic-bezier(0.45, 0, 0.25, 1)')
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
