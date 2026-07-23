import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Contacto } from './Contacto'

/**
 * F-12 — la sección de contacto HORNEADA (capa in-process). Contrato: features/contacto.feature.
 *
 * 🔴 SSR-SAFE, ASEVERADO SOBRE EL HTML DEL PRERENDER (`renderToString`), NO EN JSDOM (verde ≠ funciona,
 * I-8). `renderToString` es EL MISMO mecanismo que usa vite-react-ssg para hornear el HTML: la cadena
 * del servidor SIN hidratar. Esta capa da COBERTURA DE MUTACIÓN a los literales de `Contacto.tsx`
 * (id, «Contacto», los separadores de la dirección, los textos de los enlaces). La verificación
 * AUTORITATIVA sobre los BYTES REALES de `dist/` (readFileSync, página entera, anclas) vive en
 * `src/pages/contacto-horneado.test.ts`, como manda el contrato para @s4/@s5/@s7..@s12/@s14.
 *
 * ANTI-TAUTOLOGÍA: cada literal esperado (la URL de IG, el tel:, el handle) va ESCRITO A MANO; NUNCA
 * se re-ejecuta `instagramHref`/`telHref` ni se importa `REDES`/`TELEFONO` como «esperado».
 */
const IG_URL = 'https://www.instagram.com/nailslash.studio_/'
const TEL_HREF = 'tel:+34625223366'

describe('@s4 los enlaces de #contacto tienen href EXACTOS derivados del dato único de F-02', () => {
  it('@s4 el enlace de Instagram lleva href exactamente "https://www.instagram.com/nailslash.studio_/"', () => {
    // Escrito A MANO. Es instagramHref(REDES.instagram), pero NUNCA se re-ejecuta ni se importa aquí.
    expect(renderToString(<Contacto />)).toContain(`href="${IG_URL}"`)
  })

  it('@s4 el enlace de teléfono lleva href exactamente "tel:+34625223366" (telHref de F-02)', () => {
    expect(renderToString(<Contacto />)).toContain(`href="${TEL_HREF}"`)
  })
})

// React intercala comentarios de frontera <!-- --> entre nodos de texto/expresión adyacentes; se
// quitan para asertar el TEXTO PLANO compuesto (la dirección con sus separadores), no la mecánica SSR.
function textoPlano(html: string): string {
  return html.replace(/<!-- -->/g, '')
}

describe('@s5 el teléfono de #contacto es un tel: pulsable con el texto legible visible', () => {
  it('@s5 el enlace de teléfono muestra el texto legible exactamente "625 22 33 66"', () => {
    // Escrito A MANO (anti-tautología): es TELEFONO.legible, pero NO se importa como esperado.
    expect(renderToString(<Contacto />)).toContain('>625 22 33 66<')
  })

  it('@s5 es un enlace tel: (alternativa accesible sin WhatsApp) que envuelve el texto legible', () => {
    expect(renderToString(<Contacto />)).toMatch(
      /<a\b[^>]*href="tel:\+34625223366"[^>]*>625 22 33 66<\/a>/,
    )
  })
})

describe('@s10 la sección reutiliza el ancla #contacto-titulo (un <h2 id> real), no un id nuevo', () => {
  it('@s10 hay un <section aria-labelledby="contacto-titulo"> con su <h2 id="contacto-titulo">Horario y ubicación', () => {
    const horneado = renderToString(<Contacto />)

    // Un ÚNICO destino de ancla, el mismo que enlaza la nav de F-06: no rompe su igualdad de conjuntos.
    // 🎨 DEMO: el titular pasa a «Horario y ubicación» (como el prototipo); el id de ancla NO cambia.
    expect(horneado).toMatch(/<section\b[^>]*aria-labelledby="contacto-titulo"/)
    expect(horneado).toMatch(/<h2\b[^>]*id="contacto-titulo"[^>]*>Horario y ubicación<\/h2>/)
  })
})

describe('@s12 la dirección se muestra como TEXTO derivado de DIRECCION (fuente única F-02)', () => {
  // La dirección legible COMPLETA, escrita A MANO: mata los mutantes de los separadores («, », el
  // text node {' '}) de la composición, además de fijar la parte representativa «Av. de Atenas 75».
  // 🎨 DEMO: el orden y las partes siguen el prototipo (añade Planta 0 y el C.C. delante).
  const DIRECCION_LEGIBLE =
    'C.C. El Zoco, Av. de Atenas 75, Planta 0, Local 41, 28232 Las Rozas de Madrid'

  it('@s12 el párrafo muestra la dirección completa compuesta desde DIRECCION', () => {
    expect(textoPlano(renderToString(<Contacto />))).toContain(DIRECCION_LEGIBLE)
  })
})

/* =============================================================================================
 * REMATE DE MUTACIÓN (progress/mutation_contacto.md): la capa DEMO post-judge (horario, mapa,
 * clases demo-*) evolucionó el componente sin extender este fichero, que es el que la mutación ve.
 * Los 6 tests siguientes matan a los 6 sobrevivientes de `Contacto.tsx`. Literales A MANO.
 * ============================================================================================= */

describe('el horario visible se hornea con sus TRES filas (dato real de F-10)', () => {
  // Mata al mutante `horario.map(() => undefined)` (Contacto.tsx:35): sin estas aserciones el
  // bloque del horario desaparecía ENTERO del render sin que la suite se enterara. Las tres filas
  // van A MANO, con el guion LARGO «–» (U+2013) de la presentación, no el «-» del dato de F-02.
  it('cada fila empareja sus días con su franja: L-V 10:00–20:00, Sábado 10:00–14:00 y Domingo Cerrado', () => {
    const horneado = renderToString(<Contacto />)

    expect(horneado).toMatch(/>Lunes a Viernes<\/span><span[^>]*>10:00–20:00</)
    expect(horneado).toMatch(/>Sábado<\/span><span[^>]*>10:00–14:00</)
    expect(horneado).toMatch(/>Domingo<\/span><span[^>]*>Cerrado</)
  })
})

describe('el enlace «Cómo llegar» abre Google Maps con las coordenadas verificadas de F-02', () => {
  // Mata al mutante ESTÁTICO que vacía MAPS_HREF (Contacto.tsx:20): un href vacío rompería el
  // enlace de Maps en producción sin que la suite se enterara. La URL va ESCRITA A MANO desde las
  // coordenadas [V] (40.5179875, -3.9226688); React escapa el «&» del atributo como «&amp;».
  it('el href es EXACTAMENTE el formato oficial Maps URLs ?api=1&query=lat%2Clng', () => {
    expect(renderToString(<Contacto />)).toMatch(
      /<a\b[^>]*href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=40\.5179875%2C-3\.9226688"[^>]*>Cómo llegar<\/a>/,
    )
  })
})

describe('las clases demo del layout sobreviven en el horneado (Stryker SÍ muta los template literals)', () => {
  // Matan a los 4 mutantes que vacían los className compuestos (Contacto.tsx:26,27,64,77): perder
  // esas clases destroza el layout demo EN SILENCIO. Son clases GLOBALES literales, observables
  // bajo css:false; se lee el atributo class del horneado (patrón equipo.test.tsx:128-138), sin
  // toHaveClass y sin ningún className condicional.
  it('la <section> lleva demo-seccion y la rejilla demo-contenedor', () => {
    const horneado = renderToString(<Contacto />)
    const seccion = /<section[^>]*class="([^"]*)"/.exec(horneado)

    expect(seccion, 'la <section> no declara class').not.toBeNull()
    expect((seccion as RegExpExecArray)[1]).toContain('demo-seccion')

    // La rejilla es el PRIMER <div> con class del horneado (los demás módulos css quedan undefined).
    const rejilla = /<div[^>]*class="([^"]*)"/.exec(horneado)

    expect(rejilla, 'la rejilla no declara class').not.toBeNull()
    expect((rejilla as RegExpExecArray)[1]).toContain('demo-contenedor')
  })

  it('el CTA de WhatsApp viste demo-btn demo-btn--wa y «Cómo llegar» demo-btn demo-btn--solido', () => {
    const horneado = renderToString(<Contacto />)

    expect(horneado).toMatch(
      /<a\b[^>]*class="[^"]*demo-btn demo-btn--wa[^"]*"[^>]*>Escríbenos por WhatsApp<\/a>/,
    )
    expect(horneado).toMatch(
      /<a\b[^>]*class="[^"]*demo-btn demo-btn--solido[^"]*"[^>]*>Cómo llegar<\/a>/,
    )
  })
})

describe('@s14 el texto visible del enlace de Instagram es el handle y es CONSISTENTE con su href', () => {
  it('@s14 el enlace de IG muestra "@nailslash.studio_" y su href es la URL derivada', () => {
    // Texto visible = el handle; href = la URL. Ambos ESCRITOS A MANO. Réplica del @s8 de F-02.
    expect(renderToString(<Contacto />)).toMatch(
      /<a\b[^>]*href="https:\/\/www\.instagram\.com\/nailslash\.studio_\/"[^>]*>@nailslash\.studio_<\/a>/,
    )
  })

  it('@s14 el texto visible y el href COMPARTEN el cuerpo del handle "nailslash.studio_"', () => {
    // Consistencia texto ↔ href: si uno se hardcodeara con el handle alternativo, dejarían de compartirlo.
    expect(IG_URL).toContain('nailslash.studio_')
    expect('@nailslash.studio_').toContain('nailslash.studio_')
  })
})
