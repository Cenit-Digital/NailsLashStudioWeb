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
 * entre «Nails» y «Lash») — NO un barrido horizontal. Usa `brush.png` AUTOHOSPEDADO (cero terceros,
 * F-05 intacto). Que el navegador lo ANIME y la punta vaya pegada a la tinta se RE-VERIFICA EN VIVO
 * con Chrome (jsdom no anima SMIL). Los literales van ESCRITOS A MANO (anti-tautología).
 */
describe('@demo el aplicador de esmalte: <svg> aria-hidden hermano del h1, brush.png autohospedado, recorre el trazo', () => {
  it('@demo el pincel es un <svg aria-hidden> FUERA del <h1> (decorativo, no toca el titular)', () => {
    const horneado = renderToString(<Hero />)

    // Hay un <svg> decorativo (aria-hidden): no anuncia nada a un lector de pantalla.
    expect(horneado).toMatch(/<svg[^>]*aria-hidden="true"/)

    // Y NO vive dentro del <h1>: el titular conserva su estructura EXACTA (dos <span> + text node).
    const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(horneado)?.[1] ?? ''
    expect(h1).not.toContain('<svg')
    expect(h1).not.toContain('<image')
  })

  it('@demo usa brush.png AUTOHOSPEDADO (href local con «brush», sin origen externo http)', () => {
    const horneado = renderToString(<Hero />)

    const href = /<image[^>]*\shref="([^"]*)"/.exec(horneado)?.[1] ?? ''
    // «brush» va ESCRITO A MANO: el aplicador de esmalte, servido desde el propio sitio.
    expect(href).toMatch(/brush/)
    // Autohospedado (F-05, cero terceros): ninguna URL absoluta http(s) a un dominio ajeno.
    expect(href).not.toMatch(/^https?:/)
  })

  it('@demo el aplicador RECORRE el trazo de las letras con <animateMotion> (no un barrido horizontal)', () => {
    const horneado = renderToString(<Hero />)

    const anim = /<animateMotion[^>]*\spath="([^"]*)"/.exec(horneado)
    expect(anim, 'el pincel debe moverse con <animateMotion> sobre un path (no left/top)').not.toBeNull()

    const trazo = (anim as RegExpExecArray)[1]
    // Un TRAZO real de escritura, NO un barrido: empieza en un moveto (M), tiene MUCHAS curvas (C, las
    // subidas/lazos de cada letra) y EXACTAMENTE DOS subtrazos (dos «M» = la pluma se levanta entre
    // «Nails» y «Lash»). Un barrido horizontal sería una sola recta sin curvas.
    expect(trazo).toMatch(/^\s*M/)
    expect((trazo.match(/C/g) ?? []).length).toBeGreaterThan(8)
    expect((trazo.match(/M/g) ?? []).length).toBe(2)
  })
})
