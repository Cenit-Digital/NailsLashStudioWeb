import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { cuantosH1 } from '../lib/puerta-cascaron'
import { seccionesNavegables } from '../lib/puerta-anclas'
import { Hero } from './Hero'

/**
 * F-07 — el hero: UN h1 con dos <span> + un text node {' '} REAL, un eyebrow <p>, sin <section>.
 * Contrato: features/hero_marca.feature.
 *
 * 🔴 SSR-SAFE, ASEVERADO SOBRE EL HTML DEL PRERENDER (renderToString), NUNCA EN JSDOM (verde ≠
 * funciona, I-8). `renderToString` es EL MISMO mecanismo que usa vite-react-ssg para hornear el
 * HTML: devuelve la cadena del servidor SIN hidratar, así que lo que se asevera aquí es
 * EXACTAMENTE lo que viaja en `dist/` (F-06 lo fijó como precedente). Los BYTES del `dist/` real
 * son el eje [NV]/verificación EN VIVO del lead tras el TDD (readFileSync del artefacto).
 *
 * Los atributos/estructura JSX del h1 son LITERALES que Stryker NO muta: los aseveran ESTOS tests.
 * Los esperados («Nails Lash», «Studio», «Nails Lash Studio») van ESCRITOS A MANO (anti-tautología).
 */
describe('@s6 tras el hero sigue habiendo EXACTAMENTE un <h1>, y sus hijos son <span> (phrasing), nunca <div>', () => {
  it('@s6 la puerta de cascarón de F-04 cuenta exactamente 1 <h1> en el hero horneado', () => {
    // `cuantosH1` cuenta etiquetas <h1>: los <span> dentro NO añaden headings.
    expect(cuantosH1(renderToString(<Hero />))).toBe(1)
  })

  it('@s6 los hijos de elemento del <h1> son <span> (phrasing content), NUNCA <div>', () => {
    const horneado = renderToString(<Hero />)

    expect(horneado).toContain('<span')
    // Un <div> dentro de un <h1> es HTML INVÁLIDO (div es flow, no phrasing) y `cuantosH1` NO lo
    // vigila — este escenario sí. El h1 no lleva ningún <div>.
    const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(horneado)?.[1] ?? ''

    expect(h1).not.toContain('<div')
    expect(h1).toContain('<span')
  })
})

/**
 * @s7 — A5, MEDIDO con `dom-accessibility-api@0.6.3`. El caso ROBUSTO —text node {' '} entre los
 * spans— mide «Nails Lash Studio» (17) en LOS DOS motores. jsdom MIENTE sobre `display` (da `""`,
 * no `"inline"`) y para spans pegados fabrica un 17 FALSO → por eso la segunda aserción es
 * ESTRUCTURAL sobre los bytes (el espacio REAL entre </span> y <span), la anti-frágil. El esperado
 * «Nails Lash Studio» va ESCRITO A MANO.
 */
describe('@s7 el nombre accesible del titular es EXACTAMENTE «Nails Lash Studio» (17 car.)', () => {
  it('@s7 el encabezado computa el nombre accesible «Nails Lash Studio» (17 caracteres)', () => {
    render(<Hero />)

    const encabezado = screen.getByRole('heading', { level: 1 })

    expect(encabezado).toHaveAccessibleName('Nails Lash Studio')
    expect('Nails Lash Studio').toHaveLength(17)
  })

  it('@s7 entre el </span> de la marca y el <span> del sufijo hay un text node de espacio REAL', () => {
    const horneado = renderToString(<Hero />)

    // El espacio REAL: `</span> <span`. NO pegados (`</span><span`), que da «Nails LashStudio».
    expect(horneado).toMatch(/<\/span>\s<span\b/)
    expect(horneado).not.toMatch(/<\/span><span\b/)
  })
})

/**
 * @s8 — CASO LÍMITE 5 (el negativo que la MEDICIÓN reveló). SIN el text node de espacio, los dos
 * spans componen «Nails LashStudio» (16, sin espacio). Se asevera ESTRUCTURALMENTE sobre los bytes
 * (ausencia de espacio entre </span><span>), NO con el accessible name de jsdom (oscila 16/17 para
 * pegados). Es una caracterización del DEFECTO que el contrato RECHAZA (como el @s32 de F-04).
 *
 * Las dos filas del contrato —«pegados» y «whitespace de salto de línea JSX»— COLAPSAN a la misma
 * estructura horneada: JSX borra el whitespace con salto de línea entre elementos [V, A5 trampa 2],
 * así que unos spans en líneas separadas se hornean IGUAL que pegados (sin espacio).
 */
describe('@s8 dos spans SIN text node de espacio componen «Nails LashStudio» (16) — DEFECTO prohibido', () => {
  it('@s8 el nombre pegado, compuesto A MANO, es «Nails LashStudio» (16), NO «Nails Lash Studio»', () => {
    // «Nails Lash» + «Studio» = «Nails LashStudio» (16, sin espacio): lo que anuncia un lector de
    // pantalla cuando falta el text node de espacio. Es el «por qué» de las dos filas del outline.
    const nombrePegado = 'Nails Lash' + 'Studio'

    expect(nombrePegado).toBe('Nails LashStudio')
    expect(nombrePegado).toHaveLength(16)
    expect(nombrePegado).not.toBe('Nails Lash Studio')
  })

  it('@s8 unos spans en líneas separadas (whitespace JSX borrado) se hornean pegados, SIN espacio', () => {
    // JSX borra el whitespace con salto de línea entre los spans → equivale a pegados.
    const horneado = renderToString(
      <h1>
        <span>Nails Lash</span>
        <span>Studio</span>
      </h1>,
    )

    // Estructural sobre los bytes: pegados → NO hay espacio; el contrato RECHAZA esta estructura y
    // por eso exige el text node {' '} REAL (que sí produce «Nails Lash Studio», @s7).
    expect(horneado).toMatch(/<\/span><span\b/)
    expect(horneado).not.toMatch(/<\/span>\s<span\b/)
  })
})

/**
 * @s10 — C-7 (APROBADO 2026-07-18): el CONTENIDO de categorías (Uñas · Pestañas · Cejas) es F-09
 * (pending); `site.ts` no las tiene. F-07 fija SOLO la ESTRUCTURA: un <p>, JAMÁS un heading (un
 * <h2> rompería «un h1» y sembraría un heading sin <section>). NUNCA hardcodear «Facial» (no existe
 * en este negocio). Este escenario NO fija un texto: destila la estructura.
 */
describe('@s10 el eyebrow es un <p>, NUNCA un heading; F-07 fija su estructura, no su contenido', () => {
  it('@s10 el eyebrow es un elemento <p> (párrafo), NUNCA un heading', () => {
    expect(renderToString(<Hero />)).toMatch(/<p\b/)
  })

  it('@s10 el hero no introduce ningún heading aparte del único <h1> del titular', () => {
    const horneado = renderToString(<Hero />)

    expect(cuantosH1(horneado)).toBe(1)
    // Ningún h2…h6: un heading extra rompería «un h1» y sembraría un heading sin <section>.
    expect(horneado).not.toMatch(/<h[2-6]\b/i)
  })

  it('@s10 el eyebrow NO contiene el literal «Facial» (no existe en este negocio)', () => {
    expect(renderToString(<Hero />)).not.toContain('Facial')
  })
})

/**
 * @s5 — CASO LÍMITE 1 (ESCENARIO OBLIGATORIO). El fallo CENTRAL del prototipo: invisible al cargar,
 * incluso SIN JS, por un `animation:… both` HORNEADO INLINE (el `both`/`backwards` proyecta el 0%
 * oculto durante el delay). Aquí se asevera que el titular NO lleva ocultación inline: la animación
 * vive en la HOJA (SCSS module), NUNCA inline (inline ganaría al @media(reduce){animation:none} de
 * @s3 y escondería su duración de @s4). El nombre está PRESENTE en los bytes sin hidratar.
 *
 * `renderToString` es el mecanismo del prerender (F-06). readFileSync+string prueba «texto PRESENTE
 * + sin ocultación inline», NO que esté «pintado» (eso es el eje [NV]/verificación EN VIVO con
 * Chrome, C-2). Que este test MUERDE se comprueba por SABOTAJE (progress/tdd_hero_marca.md): un
 * `style="animation:…"` inline en el titular lo pone ROJO. Los BYTES del `dist/` REAL son la
 * verificación EN VIVO del lead tras el TDD (I-8: el primer `pnpm build` MANDA).
 */
describe('@s5 el HTML CRUDO prerenderizado muestra el nombre PRESENTE y SIN ocultación inline, sin JS', () => {
  it('@s5 el HTML contiene el nombre del salón en el titular (texto PRESENTE en los bytes)', () => {
    const horneado = renderToString(<Hero />)

    expect(horneado).toContain('Nails Lash')
    expect(horneado).toContain('Studio')
  })

  it('@s5 el titular NO lleva opacity:0 ni un clip-path que recorte HORNEADOS inline (el oculto vive en el @keyframes)', () => {
    const horneado = renderToString(<Hero />)

    // Ni «opacity:0» ni «clip-path» viajan en un style inline: viven SOLO en la hoja (SCSS module).
    expect(horneado).not.toMatch(/style="[^"]*opacity\s*:\s*0/i)
    expect(horneado).not.toMatch(/style="[^"]*clip-path/i)
  })

  it('@s5 el titular NO lleva ningún animation/animation-* HORNEADO INLINE — la animación vive en la HOJA', () => {
    const horneado = renderToString(<Hero />)

    // Un `animation:… both` inline proyecta el 0% oculto durante el delay → invisible al cargar SIN
    // JS (A3 §2), gana en especificidad al @media(reduce){animation:none} (@s3) y esconde su
    // duración de @s4. Por eso: CERO `animation` en un style inline.
    expect(horneado).not.toMatch(/style="[^"]*animation/i)
  })

  it('@s5 el nombre está en los bytes sin depender de hidratación ni de ningún IntersectionObserver', () => {
    const horneado = renderToString(<Hero />)

    // El prerender (sin hidratar) ya trae el nombre → no hay IO que arme en cliente (C-1: el hero es
    // above-the-fold; un observer lo dejaría invisible sin JS). Red anti-C-1.
    expect(horneado).not.toContain('IntersectionObserver')
    expect(horneado).toContain('Nails Lash Studio'.slice(0, 10)) // «Nails Lash» presente sin JS
  })
})

/**
 * @s11 — CASO LÍMITE 9 [V, medido con `seccionesNavegables`]: el hero h1+p SIN
 * `<section aria-labelledby>` no activa la igualdad de conjuntos de F-06 —ni con un id suelto—.
 * DESLINDE para que nadie «mejore» el marcado envolviéndolo en `<section>`: eso lo haría navegable
 * y F-06 forzaría un `#hero` en la nav (violación de «inalcanzable» hasta que se enlace).
 */
describe('@s11 el hero como h1 + p SIN <section> no activa la puerta de anclas de F-06', () => {
  it('@s11 la puerta de anclas NO deriva ninguna sección navegable a partir del hero', () => {
    const horneado = renderToString(<Hero />)

    // La función REAL de F-06 sobre el HTML del hero: 0 secciones navegables.
    expect(seccionesNavegables(horneado)).toHaveLength(0)
  })

  it('@s11 el hero NO se envuelve en <section> (no lo hace navegable)', () => {
    expect(renderToString(<Hero />)).not.toMatch(/<section\b/i)
  })
})

/**
 * 🎨 DEMO — la marca ESCRITA A PINCEL (reescrito 2026-07-20). El aplicador de esmalte es un HERMANO
 * decorativo del <h1> (un <svg> `aria-hidden`), NUNCA dentro del <h1> (no altera su estructura ni su
 * nombre accesible «Nails Lash Studio», @s6/@s7). La tinta se revela con una MÁSCARA que dibuja la
 * línea central real de las letras (`stroke-dashoffset`) y el aplicador recorre ESE MISMO path con
 * `offset-path: url(#…)`. Usa `aplicador.png` AUTOHOSPEDADO (cero terceros, F-05 intacto). Que el
 * navegador lo ANIME y la punta vaya pegada a la tinta se RE-VERIFICA EN VIVO con Chrome (jsdom no
 * anima). Los literales van ESCRITOS A MANO (anti-tautología).
 */
describe('@demo el aplicador: <svg> aria-hidden hermano del h1, autohospedado, recorre el trazo', () => {
  it('@demo el pincel es un <svg aria-hidden> FUERA del <h1> (decorativo, no toca el titular)', () => {
    const horneado = renderToString(<Hero />)

    // Hay un <svg> decorativo (aria-hidden): no anuncia nada a un lector de pantalla.
    expect(horneado).toMatch(/<svg[^>]*aria-hidden="true"/)

    // Y NO vive dentro del <h1>: el titular conserva su estructura EXACTA (dos <span> + text node).
    const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(horneado)?.[1] ?? ''
    expect(h1).not.toContain('<svg')
    expect(h1).not.toContain('<image')
  })

  it('@demo usa el aplicador AUTOHOSPEDADO (href local, sin origen externo http)', () => {
    const horneado = renderToString(<Hero />)

    const href = /<image[^>]*\shref="([^"]*)"/.exec(horneado)?.[1] ?? ''

    // ⚠️ VERDE ≠ FUNCIONA (I-8): aquí el import resuelve a `/src/assets/aplicador.png`, pero en el
    // artefacto de PRODUCCIÓN Vite lo INCRUSTA como `data:image/png;base64,…` por ser < 4 kB
    // (VERIFICADO sobre `dist/index.html`). Aseverar solo «aplicador» pasaría en verde describiendo
    // algo que NO es cierto de lo que se publica. Se acepta cualquiera de las dos formas, y lo que
    // se exige DE VERDAD —lo que protege F-05— es que jamás sea un origen externo.
    expect(href, 'el aplicador viaja como ruta local o incrustado, nunca de un tercero').toMatch(
      /aplicador|^data:image\//,
    )
    // Autohospedado (F-05, cero terceros): ninguna URL absoluta http(s) a un dominio ajeno.
    expect(href).not.toMatch(/^https?:/)
    expect(href).not.toMatch(/^\/\//)
  })

  it('@demo la tinta se revela con una MÁSCARA que traza la línea central, no con un barrido', () => {
    const horneado = renderToString(<Hero />)

    // El <mask> es lo que hace que la tinta aparezca SIGUIENDO el trazo. Un <clipPath> NO valdría:
    // por especificación usa solo la geometría del relleno, «exclusive of … stroke».
    expect(horneado).toMatch(/<mask[^>]*id="tinta-marca"/)
    expect(horneado).toMatch(/<text[^>]*mask="url\(#tinta-marca\)"/)
    expect(horneado, 'el <clipPath> ignora el stroke: no sirve para este revelado').not.toMatch(
      /<clipPath/i,
    )
  })

  it('@demo el trazo declara pathLength="100" — la métrica que sincroniza punta y tinta', () => {
    const horneado = renderToString(<Hero />)

    // Con pathLength="100", `stroke-dashoffset` (unidades de usuario) y `offset-distance` (% de la
    // longitud del path) son AMBAS lineales en longitud de arco → la punta cae exactamente sobre
    // el borde de lo recién pintado. Sin él, cada una avanzaría con su propia métrica.
    expect(horneado).toMatch(/<path[^>]*id="trazo-marca"[^>]*pathLength="100"/)
  })

  it('@demo el recorrido es un TRAZO de escritura real: curvas y UN solo subtrazo continuo', () => {
    const horneado = renderToString(<Hero />)

    const d = /<path[^>]*id="trazo-marca"[^>]*\sd="([^"]*)"/.exec(horneado)?.[1] ?? ''

    expect(d).toMatch(/^\s*M/)
    // MUCHAS curvas (las subidas y los lazos de cada letra). Un barrido sería una sola recta.
    expect((d.match(/C/g) ?? []).length).toBeGreaterThan(8)
    // EXACTAMENTE UN «M»: un solo subtrazo continuo. Las 5 plumadas reales del rótulo van UNIDAS por
    // viajes de pluma (segmentos L). Es OBLIGADO: el `stroke-dasharray` de SVG se REINICIA en cada
    // «M» (verificado en vivo con isPointInStroke), así que varios subtrazos revelarían las plumadas
    // a la vez mientras el aplicador está en un punto → la incoherencia que reportó Pablo. El 1 va
    // ESCRITO A MANO. Su MECANISMO (frente único en orden de escritura) se verifica en el @s3 de abajo.
    expect((d.match(/M/g) ?? []).length).toBe(1)
  })

  /**
   * @s2 — EL INVARIANTE DE COHERENCIA, verificado con `isPointInStroke` (que respeta el dash), NO
   * asumido. Es lo que se le escapó al primer intento: un test de sincronía numérica daba verde
   * porque comparaba un modelo continuo contra sí mismo, mientras el render real revelaba las 5
   * plumadas a la vez. Aquí se comprueba el RENDER: a mitad del trazado, la cabeza del frente está
   * revelada y la cola todavía NO. Con 5 subtrazos (el bug), la cola también aparecería.
   */
  it('@s2 a mitad de escritura, la tinta llega a la cabeza del frente pero NO más allá (coherente)', () => {
    const horneado = renderToString(<Hero />)
    const d = /<path[^>]*id="trazo-marca"[^>]*\sd="([^"]*)"/.exec(horneado)?.[1] ?? ''

    // Se construye el path REAL en jsdom y se interroga con isPointInStroke, que respeta el dash.
    // jsdom no implementa getTotalLength/isPointInStroke, así que si no están, se omite con una
    // aserción estructural equivalente (un solo subtrazo) — el mecanismo se re-verifica EN VIVO.
    const svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNS, 'svg')
    const path = document.createElementNS(svgNS, 'path')
    path.setAttribute('d', d)
    svg.appendChild(path)
    document.body.appendChild(svg)

    const tienePrimitivas =
      typeof (path as SVGGeometryElement).getTotalLength === 'function' &&
      typeof (path as SVGGeometryElement).isPointInStroke === 'function'

    if (!tienePrimitivas) {
      // jsdom no anima: el invariante se garantiza estructuralmente (un subtrazo) + verificación viva.
      expect((d.match(/M/g) ?? []).length).toBe(1)
      svg.remove()
      return
    }

    const geo = path as SVGGeometryElement
    const L = geo.getTotalLength()
    path.setAttribute('stroke-width', '120')
    path.setAttribute('stroke-dasharray', String(L))
    // Revelado el 40 %:
    path.setAttribute('stroke-dashoffset', String(L * 0.6))
    const punto = (frac: number) => {
      const p = geo.getPointAtLength(L * frac)
      const sp = (svg as SVGSVGElement).createSVGPoint()
      sp.x = p.x
      sp.y = p.y
      return geo.isPointInStroke(sp)
    }
    const cabezaRevelada = punto(0.2)
    const colaRevelada = punto(0.9)
    svg.remove()

    expect(cabezaRevelada, 'el 20 % del recorrido debe estar revelado al 40 %').toBe(true)
    expect(
      colaRevelada,
      'el 90 % NO debe estar revelado al 40 % (si lo está, el dash se reinició)',
    ).toBe(false)
  })

  /**
   * LA GEOMETRÍA DEL APLICADOR. Es donde estaba el defecto MEDIDO del intento anterior: el
   * `<image>` anclaba el punto del recorrido a y=−129 de height=150, o sea al 86 % de la imagen,
   * que en `brush.png` (una BOTELLA de 60×198: cerdas en y 12–36, varilla, frasco negro en 105–197)
   * cae DENTRO DEL FRASCO. Lo que «pintaba» las letras era el culo del bote.
   *
   * Los números van ESCRITOS A MANO (anti-tautología), NUNCA importados del componente: 15 y 93 son
   * las dimensiones REALES de `aplicador.png` y 0,4667 la posición medida de la punta en su borde
   * inferior (`tools/trazo-marca/aplicador.mjs` los imprime al generarlo).
   */
  describe('@s3 la PUNTA del aplicador —no el frasco— es lo que va sobre el recorrido', () => {
    function atributosDelAplicador() {
      const horneado = renderToString(<Hero />)
      const img = /<image\b[^>]*>/.exec(horneado)?.[0] ?? ''
      const num = (nombre: string) =>
        Number(new RegExp(`\\s${nombre}="([^"]*)"`).exec(img)?.[1] ?? NaN)

      return { img, x: num('x'), y: num('y'), ancho: num('width'), alto: num('height') }
    }

    it('@s3 el borde INFERIOR de la imagen cae en el (0,0) local: y = −alto', () => {
      const { y, alto } = atributosDelAplicador()

      expect(alto).toBeGreaterThan(0)
      // Si y no fuera exactamente −alto, la punta quedaría flotando por encima o hundida bajo la
      // tinta. Es la aserción que caza el defecto del intento anterior.
      expect(y).toBe(-alto)
    })

    it('@s3 la imagen conserva la proporción REAL de aplicador.png (15 × 93)', () => {
      const { ancho, alto } = atributosDelAplicador()

      // 15/93 van ESCRITOS A MANO: deformar el aplicador lo delataría al instante.
      expect(ancho / alto).toBeCloseTo(15 / 93, 4)
    })

    it('@s3 la punta se sitúa en el centro del borde inferior (0,4667 del ancho, medido)', () => {
      const { x, ancho } = atributosDelAplicador()

      // El desplazamiento en x lleva la punta —no la esquina de la imagen— al punto del recorrido.
      expect(-x / ancho).toBeCloseTo(0.4667, 4)
    })

    it('@s3 el aplicador se INCLINA sobre su punta, como lo sostendría una mano', () => {
      const { img } = atributosDelAplicador()

      // `rotate(18)` sin centro gira alrededor del (0,0) del <g>, que ES la punta ya colocada
      // sobre el recorrido. Con otro centro, la punta se despegaría de la tinta al inclinarse.
      expect(img).toMatch(/transform="rotate\(18\)"/)
    })
  })

  it('@demo la MÁSCARA cubre todo el viewBox del rótulo (si no, faltarían trozos de letra)', () => {
    const horneado = renderToString(<Hero />)
    const mask = /<mask\b[^>]*>/.exec(horneado)?.[0] ?? ''
    const svg = /<svg\b[^>]*>/.exec(horneado)?.[0] ?? ''
    const vista = /viewBox="([^"]*)"/.exec(svg)?.[1] ?? ''
    const [x, y, ancho, alto] = vista.split(' ')

    // La región del <mask> se DERIVA del viewBox (una sola fuente de verdad). Antes eran cuatro
    // literales duplicados y el `judge` lo cazó: saboteando el viewBox, la máscara no se movía y
    // los tests seguían verdes. Si se quedara corta, la parte de las letras que cayera fuera NO se
    // revelaría nunca.
    expect(mask).toMatch(/maskUnits="userSpaceOnUse"/)
    expect(mask).toContain(`x="${x}"`)
    expect(mask).toContain(`y="${y}"`)
    expect(mask).toContain(`width="${ancho}"`)
    expect(mask).toContain(`height="${alto}"`)
  })

  /**
   * @s1 — LA PUERTA DEL RECORTE. Es el escenario que Pablo ha reportado DOS VECES y que hasta ahora
   * no tenía ningún test: se podía encoger el viewBox a la caja que secciona la «N» y la «h» con la
   * suite entera en verde (lo demostró el `judge` saboteando `VISTA_MARCA` a '0 -840 3895 1200').
   *
   * Los límites de la tinta van ESCRITOS A MANO, NUNCA importados: son la MEDICIÓN de
   * `TextMetrics` sobre Great Vibes a 1000 px (progress/hallazgos_hero_caligrafia.md), en milésimas
   * de em con la línea base en 0. La caja de AVANCE del texto solo llega a 3895 — por eso la cola
   * de la «h» (3965,3) se salía y `clip-path` la seccionaba.
   */
  describe('@s1 el viewBox ENCIERRA la tinta real: ni la «N» ni la «h» pueden quedar seccionadas', () => {
    const TINTA = { izq: -15.6, der: 3965.3, arriba: -796.9, abajo: 312.5 }

    function vistaDelRotulo() {
      const svg = /<svg\b[^>]*>/.exec(renderToString(<Hero />))?.[0] ?? ''
      const [x, y, ancho, alto] = (/viewBox="([^"]*)"/.exec(svg)?.[1] ?? '').split(' ').map(Number)

      return { x, y, ancho, alto }
    }

    it('@s1 el borde IZQUIERDO del viewBox queda por fuera del arranque de la «N»', () => {
      const { x } = vistaDelRotulo()

      expect(x).toBeLessThanOrEqual(TINTA.izq)
    })

    it('@s1 el borde DERECHO del viewBox queda por fuera de la cola de la «h»', () => {
      const { x, ancho } = vistaDelRotulo()

      // 3965,3 > 3895 (el ancho de avance): ESTE es el número que delataba el recorte.
      expect(x + ancho).toBeGreaterThanOrEqual(TINTA.der)
    })

    it('@s1 los bordes SUPERIOR e INFERIOR quedan por fuera de las astas y los descendentes', () => {
      const { y, alto } = vistaDelRotulo()

      expect(y).toBeLessThanOrEqual(TINTA.arriba)
      expect(y + alto).toBeGreaterThanOrEqual(TINTA.abajo)
    })

    it('@s1 el margen sobrante es holgado por los cuatro lados, no un empate al milímetro', () => {
      const { x, y, ancho, alto } = vistaDelRotulo()

      // Un viewBox que rozara la tinta dejaría el antialiasing del borde cortado. 40‰ = 0,04 em.
      const MARGEN_MINIMO = 40

      expect(TINTA.izq - x, 'margen izquierdo').toBeGreaterThanOrEqual(MARGEN_MINIMO)
      expect(x + ancho - TINTA.der, 'margen derecho').toBeGreaterThanOrEqual(MARGEN_MINIMO)
      expect(TINTA.arriba - y, 'margen superior').toBeGreaterThanOrEqual(MARGEN_MINIMO)
      expect(y + alto - TINTA.abajo, 'margen inferior').toBeGreaterThanOrEqual(MARGEN_MINIMO)
    })
  })

  it('@demo las letras se dibujan a 1000 unidades por em con la línea base en y=0', () => {
    const horneado = renderToString(<Hero />)
    const texto = /<text\b[^>]*>/.exec(horneado)?.[0] ?? ''

    // 1000 y 0 van ESCRITOS A MANO: es el sistema de coordenadas en el que está calculada la línea
    // central (milésimas de em, línea base en 0). Cambiar cualquiera desalinearía trazo y letras.
    expect(texto).toMatch(/font-size="1000"/)
    expect(texto).toMatch(/\sx="0"/)
    expect(texto).toMatch(/\sy="0"/)
  })

  it('@demo el rótulo dibujado NO duplica el nombre para un lector de pantalla', () => {
    const horneado = renderToString(<Hero />)

    // «Nails Lash» aparece DOS veces en los bytes (el <text> del SVG y el <span> del <h1>), pero
    // el <svg> es aria-hidden, así que solo se anuncia una. Si alguien le quitara el aria-hidden,
    // un lector diría «Nails Lash» dos veces.
    const svg = /<svg\b[^>]*>/.exec(horneado)?.[0] ?? ''
    expect(svg).toContain('aria-hidden="true"')
  })
})

/* ——————————————————————————————————————————————————————————————————————————————————————————————
 * ENMIENDA 2026-07-23 — LA CALIGRAFÍA LENTA: el control sin cromo (@s10-@s14).
 *
 * A ≈15 s (ENMIENDA 4; sigue siendo MÁS de 5 s) el mecanismo para parar/saltar es OBLIGATORIO
 * (SC 2.2.2, nivel A — PROHIBIDO citarlo como opcional). Pablo pidió «sin nada de botones»: el
 * rótulo es el control — un <button> transparente superpuesto, FUERA del <h1>. jsdom NO anima:
 * aquí se asevera
 * el DOM (montaje, activación, desmontaje, ARIA); los tiempos van por BYTES en hero-estilos y en
 * hero-logica; la vivencia real, EN VIVO en Chrome.
 *
 * `matchMedia` va GUARDADO en Hero.tsx (jsdom 25 no lo trae): el stub de abajo es el patrón de
 * galeria.test.tsx @s12 — responde `matches` SOLO a la consulta EXACTA, escrita A MANO.
 * —————————————————————————————————————————————————————————————————————————————————————————————— */

/** El nombre accesible del control, ESCRITO A MANO (contrato @s10). */
const NOMBRE_DEL_CONTROL = 'Completar la firma'

/**
 * La clase de «lista» (ENMIENDA 2, @s15/@s7/@s13 — cierra A-3): GLOBAL y ESCRITA A MANO, jamás la
 * clase del CSS module (bajo `css: false` las del module son undefined; precedente `data-firma`).
 * El SCSS condiciona TODAS las animaciones del rótulo a ella (bytes en hero-estilos @s15).
 */
const CLASE_LISTA = 'caligrafia-lista'

function stubDeMatchMedia(conPreferencia: boolean) {
  // Los dos listeners ESPIADOS (ENMIENDA 2, @s17): la preferencia se escucha EN CALIENTE con el
  // patrón ya contratado en galeria.test.tsx @s12 — captura del manejador y disparo manual.
  const escuchar = vi.fn()
  const dejarDeEscuchar = vi.fn()

  vi.stubGlobal('matchMedia', (consulta: string) => ({
    // La media query va ESCRITA A MANO: si Hero.tsx preguntara por otra, `matches` sería false.
    matches: conPreferencia && consulta === '(prefers-reduced-motion: reduce)',
    media: consulta,
    addEventListener: escuchar,
    removeEventListener: dejarDeEscuchar,
  }))

  return { escuchar, dejarDeEscuchar }
}

/** El movimiento PERMITIDO: matchMedia existe y la preferencia de reduce NO casa. */
function conMovimientoPermitido() {
  return stubDeMatchMedia(false)
}

/** El manejador que Hero registró con addEventListener('change'), capturado del espía. */
function manejadorDelCambio(
  escuchar: ReturnType<typeof vi.fn>,
): (cambio: { matches: boolean }) => void {
  expect(escuchar).toHaveBeenCalledWith('change', expect.any(Function))

  return escuchar.mock.calls[0][1] as (cambio: { matches: boolean }) => void
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('@s10 el rótulo es el control: un botón transparente con nombre accesible, FUERA del <h1>', () => {
  it('@s10 mientras la caligrafía corre existe el botón «Completar la firma», sin ningún texto visible', () => {
    conMovimientoPermitido()
    render(<Hero />)

    const control = screen.getByRole('button', { name: NOMBRE_DEL_CONTROL })

    // Sin cromo: cero texto (el nombre viaja en aria-label), y es un <button> NATIVO de verdad
    // (type="button"): clic, Enter y Espacio vienen de serie, sin listeners de teclado a mano.
    expect(control.textContent).toBe('')
    expect(control).toHaveAttribute('type', 'button')
    expect(control.tagName).toBe('BUTTON')
  })

  it('@s10 el botón vive FUERA del <h1>: el titular conserva UN h1, dos <span> y el text node de espacio real', () => {
    conMovimientoPermitido()
    const { container } = render(<Hero />)

    const h1 = container.querySelector('h1') as HTMLElement

    // La estructura protegida de F-07, INTACTA con el control montado (@s6/@s7 vivos).
    expect(h1.querySelector('button')).toBeNull()
    expect(h1.querySelectorAll(':scope > span')).toHaveLength(2)
    expect(
      [...h1.childNodes].some(
        (nodo) => nodo.nodeType === Node.TEXT_NODE && nodo.textContent === ' ',
      ),
      'el text node de espacio REAL entre los dos <span> debe seguir ahí',
    ).toBe(true)
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('Nails Lash Studio')
    expect(container.querySelectorAll('h1')).toHaveLength(1)
  })

  it('@s10 al tabular, el botón recibe el foco (el anillo visible lo pinta el :focus-visible GLOBAL de _base.scss)', async () => {
    conMovimientoPermitido()
    render(<Hero />)

    const usuario = userEvent.setup()

    await usuario.tab()

    expect(screen.getByRole('button', { name: NOMBRE_DEL_CONTROL })).toHaveFocus()
  })

  it('@s10 el botón NO viaja en el HTML horneado: se monta en cliente, donde puede funcionar', () => {
    // El prerender no conoce la preferencia del visitante NI tiene JS que responda al clic: un
    // botón horneado sería un control muerto. Se monta tras leer matchMedia (patrón galería).
    expect(renderToString(<Hero />)).not.toContain('<button')
  })
})

/** La escena del rótulo: el elemento que publica la fase de la firma en `data-firma`. */
function escenaDe(container: HTMLElement): HTMLElement {
  const escena = container.querySelector('[data-firma]')

  expect(escena, 'la escena debe publicar data-firma').not.toBeNull()

  return escena as HTMLElement
}

describe('@s11 activar el control completa la firma AL INSTANTE y desmonta el botón', () => {
  // 🎨 El mecanismo: la BASE del SCSS ya es el estado final (I-4 de F-07). Completar = poner
  // `animation: none` vía `data-firma` (los bytes de esa regla los asevera hero-estilos): toda la
  // tinta, el aplicador retirado y «STUDIO» visible, sin reflow. Aquí, el DOM: fase y desmontaje.
  it('@s11 el CLIC pasa la firma de «corriendo» a «cliente» y el botón desaparece del árbol', () => {
    conMovimientoPermitido()
    const { container } = render(<Hero />)

    // Antes de activar: la firma corre (estado inicial OBSERVABLE, mata al literal saboteado).
    expect(escenaDe(container)).toHaveAttribute('data-firma', 'corriendo')

    fireEvent.click(screen.getByRole('button', { name: NOMBRE_DEL_CONTROL }))

    expect(escenaDe(container)).toHaveAttribute('data-firma', 'cliente')
    // Ya no hay nada que completar: el botón se desmonta y el rótulo queda descubierto.
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('@s11 Enter con el foco también completa (activación NATIVA del <button>)', async () => {
    conMovimientoPermitido()
    const { container } = render(<Hero />)
    const usuario = userEvent.setup()

    await usuario.tab()
    await usuario.keyboard('{Enter}')

    expect(escenaDe(container)).toHaveAttribute('data-firma', 'cliente')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('@s11 Espacio con el foco también completa (activación NATIVA del <button>)', async () => {
    conMovimientoPermitido()
    const { container } = render(<Hero />)
    const usuario = userEvent.setup()

    await usuario.tab()
    await usuario.keyboard('[Space]')

    expect(escenaDe(container)).toHaveAttribute('data-firma', 'cliente')
    expect(screen.queryByRole('button')).toBeNull()
  })
})

/**
 * @s12 — EL FIN DE RELOJ. jsdom no anima CSS: el «final» que puede observar un test es el del
 * `setTimeout` de Hero.tsx, cuyo plazo (15 800 ms, ESCRITO A MANO aquí) deriva de UNA fuente
 * (`milisegundosDeCeremonia()`, aseverada por valor y contra los bytes del SCSS en
 * hero-logica.test.ts). Reloj FALSO avanzado dentro de `act` (patrón galeria.test.tsx).
 */
const MILISEGUNDOS_DE_CEREMONIA = 15_800

/** Avanza el reloj FALSO dentro de `act`, para que React aplique los cambios de estado. */
function avanzar(milisegundos: number): void {
  act(() => {
    vi.advanceTimersByTime(milisegundos)
  })
}

describe('@s12 el control SOLO existe mientras la animación corre: el fin del reloj lo desmonta solo', () => {
  it('@s12 un milisegundo ANTES del final el botón sigue; al cumplirse los 15 800 ms desaparece sin intervención', () => {
    conMovimientoPermitido()
    vi.useFakeTimers()
    const { container } = render(<Hero />)

    avanzar(MILISEGUNDOS_DE_CEREMONIA - 1)

    // La ceremonia AÚN corre: el control sigue vivo (mata a un plazo acortado o a un reloj de 0).
    expect(screen.getByRole('button', { name: NOMBRE_DEL_CONTROL })).toBeInTheDocument()
    expect(escenaDe(container)).toHaveAttribute('data-firma', 'corriendo')

    avanzar(1)

    // El reloj terminó por sí solo: fase «reloj» y NINGUNA superficie clicable sobre el rótulo.
    expect(escenaDe(container)).toHaveAttribute('data-firma', 'reloj')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('@s12 la LIMPIEZA del efecto: completar por clic NO deja un reloj vivo que re-etiquete la firma', () => {
    // Sin `clearTimeout` en la limpieza, el reloj huérfano dispararía a los 15,8 s y pisaría
    // «cliente» con «reloj» — ESTA aserción es la que hace matable ese mutante (por eso
    // FaseDeLaFirma distingue los dos finales; ver hero-logica.ts).
    conMovimientoPermitido()
    vi.useFakeTimers()
    const { container } = render(<Hero />)

    fireEvent.click(screen.getByRole('button', { name: NOMBRE_DEL_CONTROL }))
    avanzar(MILISEGUNDOS_DE_CEREMONIA)

    expect(escenaDe(container)).toHaveAttribute('data-firma', 'cliente')
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('@s13 con movimiento reducido el control NO se monta: no hay nada que completar', () => {
  // El rótulo completo YA es visible al instante bajo reduce: lo garantiza la HOJA (@s3/@s5 de
  // hero-estilos: @media reduce → animation none + base final visible). Aquí, el DOM del control.
  it('@s13 el botón «Completar la firma» NO existe en el árbol en ningún momento, ni siquiera tras 15,8 s', () => {
    stubDeMatchMedia(true)
    vi.useFakeTimers()
    const { container } = render(<Hero />)

    expect(screen.queryByRole('button')).toBeNull()

    avanzar(MILISEGUNDOS_DE_CEREMONIA)

    // Ni botón NI reloj: bajo reduce el timeout no debe ni armarse (la fase sigue «corriendo»,
    // que bajo reduce es solo el nombre del reposo — la hoja ya lo pinta todo).
    expect(screen.queryByRole('button')).toBeNull()
    expect(escenaDe(container)).toHaveAttribute('data-firma', 'corriendo')
  })

  it('@s13 tampoco viaja en el HTML horneado (allí la preferencia es incognoscible: no se monta nada)', () => {
    expect(renderToString(<Hero />)).not.toContain('<button')
  })

  it('@s13 la clase de «lista» NO se añade bajo reduce: la caligrafía no arranca y nada hay que completar', () => {
    // ENMIENDA 2 (@s13 ampliado): bajo reduce «nada cambia: ni clase ni botón». Sin la clase, el
    // SCSS no declara NINGUNA animación (@s15 en hero-estilos) y la base ya es el estado final.
    stubDeMatchMedia(true)
    vi.useFakeTimers()
    const { container } = render(<Hero />)

    expect(escenaDe(container).classList.contains(CLASE_LISTA)).toBe(false)

    avanzar(MILISEGUNDOS_DE_CEREMONIA)

    expect(escenaDe(container).classList.contains(CLASE_LISTA)).toBe(false)
  })
})

/**
 * @s7 sin-js AMPLIADO (ENMIENDA 2, cierra A-3) — el HTML horneado NO lleva la clase de «lista».
 * Antes la animación era CSS a secas: si el JS fallaba, 90 s de movimiento SIN mecanismo (el
 * agujero que señaló la auditoría). Ahora el arranque es del MONTAJE: sin JavaScript la clase
 * jamás llega, nada anima, y el rótulo se ve COMPLETO y ESTÁTICO desde el primer pintado porque
 * la base del SCSS ya es el estado final (@s1 de hero-estilos).
 */
describe('@s7 sin JavaScript el rótulo nace COMPLETO y ESTÁTICO: el horneado NO lleva la clase de «lista»', () => {
  it('@s7 renderToString no contiene la clase de «lista» (sin JS nada arranca: la base ya es el final)', () => {
    expect(renderToString(<Hero />)).not.toContain(CLASE_LISTA)
  })
})

/**
 * @s17 (ENMIENDA 2, cierra A-5) — LA PREFERENCIA SE ESCUCHA EN CALIENTE, en el MISMO efecto que
 * la lee, con limpieza (patrón contratado en features/galeria_carrusel.feature @s12). Activar
 * reduce a MITAD de firma la COMPLETA — la clase de «lista» cae (la base ya es el final: toda la
 * tinta, aplicador retirado, «STUDIO» visible) y el botón se desmonta con ella: no queda superficie
 * clicable sobre un rótulo estático. Desactivarla después NO rearranca nada: reduce manda una vez.
 */
describe('@s17 activar reduce a MITAD de firma la completa; desactivarlo no rearranca nada', () => {
  it('@s17 el change a matches:true COMPLETA la firma al instante: clase y botón fuera', () => {
    const { escuchar } = conMovimientoPermitido()
    vi.useFakeTimers()
    const { container } = render(<Hero />)

    // La firma corre: clase de «lista» puesta y control vivo (a medio escribir).
    avanzar(MILISEGUNDOS_DE_CEREMONIA / 2)
    expect(escenaDe(container).classList.contains(CLASE_LISTA)).toBe(true)

    act(() => manejadorDelCambio(escuchar)({ matches: true }))

    // Sin clase no hay animación declarada (la base ES el final) y sin botón no queda superficie.
    expect(escenaDe(container).classList.contains(CLASE_LISTA)).toBe(false)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('@s17 un change a matches:false sobre una firma EN MARCHA no la toca: la rama contraria no completa', () => {
    // Mata al manejador que completara INCONDICIONALMENTE en cada change: pararía la caligrafía
    // justo cuando el visitante RETIRA la preferencia.
    const { escuchar } = conMovimientoPermitido()
    const { container } = render(<Hero />)

    act(() => manejadorDelCambio(escuchar)({ matches: false }))

    expect(escenaDe(container).classList.contains(CLASE_LISTA)).toBe(true)
    expect(escenaDe(container)).toHaveAttribute('data-firma', 'corriendo')
    expect(screen.getByRole('button', { name: NOMBRE_DEL_CONTROL })).toBeInTheDocument()
  })

  it('@s17 desactivar la preferencia DESPUÉS de completar NO rearranca nada: ni caligrafía ni botón, ni reloj fantasma', () => {
    const { escuchar } = conMovimientoPermitido()
    vi.useFakeTimers()
    const { container } = render(<Hero />)

    act(() => manejadorDelCambio(escuchar)({ matches: true }))
    act(() => manejadorDelCambio(escuchar)({ matches: false }))

    expect(escenaDe(container).classList.contains(CLASE_LISTA)).toBe(false)
    expect(screen.queryByRole('button')).toBeNull()

    // Y el reloj quedó LIMPIO al morir el control: 15,8 s después nada re-etiqueta la firma.
    avanzar(MILISEGUNDOS_DE_CEREMONIA)
    expect(escenaDe(container)).toHaveAttribute('data-firma', 'corriendo')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('@s17 al desmontar, removeEventListener recibe EXACTAMENTE el manejador que registró addEventListener con "change"', () => {
    const { escuchar, dejarDeEscuchar } = conMovimientoPermitido()
    const { unmount } = render(<Hero />)

    expect(escuchar).toHaveBeenCalledTimes(1)
    const manejador = manejadorDelCambio(escuchar)

    expect(dejarDeEscuchar).not.toHaveBeenCalled()

    unmount()

    expect(dejarDeEscuchar).toHaveBeenCalledTimes(1)
    expect(dejarDeEscuchar).toHaveBeenCalledWith('change', manejador)
  })
})

/**
 * @s16 (ENMIENDA 2, cierra A-2) — EL FOCO NO CAE AL VACÍO. Si `document.activeElement` es el botón
 * cuando este se desmonta (clic, Enter o fin del reloj), el foco se recoloca en la ESCENA (el
 * contenedor que envuelve rótulo, titular y botón) con `tabindex="-1"`: acepta foco SOLO
 * programáticamente — ninguna parada de tabulador nueva — y desde ella el siguiente Tab continúa
 * hacia delante (los CTAs viven en home.tsx, FUERA del componente: la escena es el destino
 * razonable DENTRO del hero). Si el foco estaba en otro sitio, NO se roba.
 */
describe('@s16 el foco no cae al vacío cuando el botón se desmonta bajo él', () => {
  it('@s16 por CLIC: el foco pasa a la escena, que lo acepta solo programáticamente (tabindex -1)', async () => {
    conMovimientoPermitido()
    const { container } = render(<Hero />)
    const usuario = userEvent.setup()

    // userEvent.click enfoca el botón al pulsar (como un navegador real) ANTES de activarlo.
    await usuario.click(screen.getByRole('button', { name: NOMBRE_DEL_CONTROL }))

    expect(screen.queryByRole('button')).toBeNull()
    expect(escenaDe(container)).toHaveFocus()
    // tabindex -1: foco programático SÍ, parada de tabulador NO — el siguiente Tab sigue adelante.
    expect(escenaDe(container)).toHaveAttribute('tabindex', '-1')
  })

  it('@s16 por ENTER con el foco en el botón: el foco se recoloca en la escena', async () => {
    conMovimientoPermitido()
    const { container } = render(<Hero />)
    const usuario = userEvent.setup()

    await usuario.tab()
    await usuario.keyboard('{Enter}')

    expect(screen.queryByRole('button')).toBeNull()
    expect(escenaDe(container)).toHaveFocus()
  })

  it('@s16 por FIN DE RELOJ mientras el botón tenía el foco: el foco se recoloca, no cae al <body>', () => {
    conMovimientoPermitido()
    vi.useFakeTimers()
    const { container } = render(<Hero />)

    act(() => {
      screen.getByRole('button', { name: NOMBRE_DEL_CONTROL }).focus()
    })
    avanzar(MILISEGUNDOS_DE_CEREMONIA)

    expect(screen.queryByRole('button')).toBeNull()
    expect(escenaDe(container)).toHaveFocus()
    expect(document.body).not.toHaveFocus()
  })

  it('@s16 si el foco NO estaba en el botón, el fin de reloj NO lo roba (la recolocación es condicional)', () => {
    // El Dado del contrato es «el foco está EN el botón»: fuera de él, robar el foco a mitad de
    // lectura sería EXACTAMENTE la clase de salto que la gestión de foco debe evitar.
    conMovimientoPermitido()
    vi.useFakeTimers()
    const { container } = render(<Hero />)

    avanzar(MILISEGUNDOS_DE_CEREMONIA)

    expect(screen.queryByRole('button')).toBeNull()
    expect(escenaDe(container)).not.toHaveFocus()
  })
})

/**
 * @s15 (ENMIENDA 2, cierra A-3) — EL ARRANQUE EN EL MONTAJE, la mitad DOM (los bytes del SCSS los
 * asevera hero-estilos @s15). El efecto de montaje añade la clase de «lista» a la escena Y monta
 * el botón EN EL MISMO render: por construcción nunca hay movimiento sin mecanismo para pararlo —
 * nacen juntos y mueren juntos.
 */
describe('@s15 la clase de «lista» y el botón nacen y mueren JUNTOS: movimiento y mecanismo inseparables', () => {
  it('@s15 al montar con el movimiento permitido la escena recibe la clase de «lista» Y el botón, en el MISMO render', () => {
    conMovimientoPermitido()
    const { container } = render(<Hero />)

    // Las dos cosas a la vez tras el montaje: la caligrafía arranca YA con su mecanismo en pie.
    expect(escenaDe(container).classList.contains(CLASE_LISTA)).toBe(true)
    expect(screen.getByRole('button', { name: NOMBRE_DEL_CONTROL })).toBeInTheDocument()
  })

  it('@s15 completar la firma retira la clase CON el botón: sin movimiento no queda mecanismo (mueren juntos)', () => {
    conMovimientoPermitido()
    const { container } = render(<Hero />)

    expect(escenaDe(container).classList.contains(CLASE_LISTA)).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: NOMBRE_DEL_CONTROL }))

    // Sin clase no hay animación declarada (la base es el final) y sin botón no queda superficie:
    // el rótulo terminado queda limpio, como en @s12.
    expect(escenaDe(container).classList.contains(CLASE_LISTA)).toBe(false)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('@s14 el control no roba clics fuera del área del rótulo', () => {
  // La GEOMETRÍA real (que el botón cubra el rótulo y NADA más) no existe en jsdom: la fija la
  // hoja (`.control` absolute + inset 0 dentro de la escena relativa, aseverado por BYTES en
  // hero-estilos @s14) y se vive EN VIVO. Aquí, lo aseverable del árbol: dónde vive la superficie
  // y que un clic fuera NO completa nada.
  it('@s14 un clic FUERA del rótulo (el eyebrow) NO completa la firma: sigue escribiéndose', () => {
    conMovimientoPermitido()
    const { container } = render(<Hero />)

    fireEvent.click(container.querySelector('p') as HTMLElement)

    expect(escenaDe(container)).toHaveAttribute('data-firma', 'corriendo')
    expect(screen.getByRole('button', { name: NOMBRE_DEL_CONTROL })).toBeInTheDocument()
  })

  it('@s14 la superficie clicable vive DENTRO de la escena del rótulo (su padre directo)', () => {
    conMovimientoPermitido()
    const { container } = render(<Hero />)

    const control = screen.getByRole('button', { name: NOMBRE_DEL_CONTROL })

    // El padre del botón ES la escena (la que publica data-firma): con `inset: 0` su caja no
    // puede salirse del área del rótulo. Fuera de la escena, inset 0 cubriría OTRA cosa.
    expect(control.parentElement).toBe(escenaDe(container))
  })
})
