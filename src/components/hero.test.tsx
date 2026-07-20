import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

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
 * 🎨 DEMO — «TRAZO DE PLUMA» (decisión de Pablo 2026-07-19). El aplicador de esmalte es un HERMANO
 * decorativo del <h1> (un <svg> `aria-hidden`), NUNCA dentro del <h1> (no altera su estructura ni su
 * nombre accesible «Nails Lash Studio», @s6/@s7). Escribe «Nails Lash» recorriendo el TRAZO REAL de
 * las letras con SMIL `<animateMotion>` sobre un path con curvas y DOS subtrazos (la pluma se levanta
 * Usa `aplicador.png` AUTOHOSPEDADO (cero terceros,
 * F-05 intacto). Que el navegador lo ANIME y la punta vaya pegada a la tinta se RE-VERIFICA EN VIVO
 * con Chrome (jsdom no anima SMIL). Los literales van ESCRITOS A MANO (anti-tautología).
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

  it('@demo el recorrido es un TRAZO de escritura real: curvas y 5 plumadas, no una recta', () => {
    const horneado = renderToString(<Hero />)

    const d = /<path[^>]*id="trazo-marca"[^>]*\sd="([^"]*)"/.exec(horneado)?.[1] ?? ''

    expect(d).toMatch(/^\s*M/)
    // MUCHAS curvas (las subidas y los lazos de cada letra). Un barrido sería una sola recta.
    expect((d.match(/C/g) ?? []).length).toBeGreaterThan(8)
    // El 5 va ESCRITO A MANO: son los levantamientos de pluma REALES del rótulo — «N», «ails», el
    // punto de la «i», «L» y «ash». No se eligieron: salieron como componentes conexas del
    // esqueleto de los glifos (tools/trazo-marca/derivar.html).
    expect((d.match(/M/g) ?? []).length).toBe(5)
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
