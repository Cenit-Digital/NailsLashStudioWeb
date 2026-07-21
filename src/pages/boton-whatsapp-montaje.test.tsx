import { HelmetProvider } from 'react-helmet-async'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import Home from './home'

/**
 * @s4 de features/boton_whatsapp_flotante.feature — EL MONTAJE del botón flotante en la home:
 * FUERA de <main>, FUERA de la sección #contacto y HERMANO de <Pie/>. El montaje vive en
 * src/pages/home.tsx (hermano de <Pie/>, tras el cierre de </main>) y ESTE fichero es el único
 * que lo PINEA: sin él, una regresión que moviera el botón dentro de <main>/#contacto, lo
 * duplicara o lo eliminara pasaría verde (bloqueante del judge, progress/judge_boton_whatsapp.md).
 *
 * Se asevera sobre el HTML del PRERENDER: `renderToString` es EL MISMO mecanismo del SSG
 * (patrón de home.test.tsx @s6), no jsdom (que solo ve el estado post-hidratación). El
 * `HelmetProvider` es obligatorio desde que la cáscara emite metadata con el <Head> de F-04.
 *
 * 🔴 ANTI-TAUTOLOGÍA: los literales ("</main>", 'id="whatsapp-flotante"', "tel:+34625223366",
 * 'aria-labelledby="contacto-titulo"') van ESCRITOS A MANO; NO se importa el id de BotonWhatsApp
 * ni TELEFONO. El SUJETO bajo prueba es <Home/>.
 * 🔴 ANTI-VACUIDAD: las ANCLAS POSITIVAS van PRIMERO — `indexOf` devuelve -1 si no encuentra y
 * "-1 < X" sería VERDADERO; sin las anclas, un botón AUSENTE pasaría la comparación de índices.
 * 🔴 EL HOST NO SE ASEVERA (A-10): este fichero no menciona "wa.me" ni "api.whatsapp.com".
 */
const ID_HTML = 'id="whatsapp-flotante"'
const CIERRE_MAIN = '</main>'
const TEL_HREF = 'tel:+34625223366'

function homeHorneada(): string {
  return renderToString(
    <HelmetProvider>
      <Home />
    </HelmetProvider>,
  )
}

/**
 * La sección #contacto EXTRAÍDA del prerender: el fragmento entre <section aria-labelledby=
 * "contacto-titulo" …> y su </section> (mismo patrón que contacto-horneado.test.ts; las secciones
 * no se anidan). '' si no aparece → hace CAER la ANCLA POSITIVA del tel: (anti-vacuidad).
 */
function seccionContacto(html: string): string {
  const encontrado =
    /<section\b[^>]*aria-labelledby="contacto-titulo"[^>]*>([\s\S]*?)<\/section>/.exec(html)

  return encontrado?.[1] ?? ''
}

describe('@s4 el botón flotante se monta FUERA de <main> y FUERA de #contacto, hermano de <Pie/>', () => {
  it('@s4 ANCLA POSITIVA: el prerender de la home SÍ contiene "</main>" y el id "whatsapp-flotante"', () => {
    const html = homeHorneada()

    expect(html).toContain(CIERRE_MAIN)
    expect(html).toContain(ID_HTML)
  })

  it('@s4 el enlace "whatsapp-flotante" aparece DESPUÉS del cierre de </main>: no vive en el landmark principal', () => {
    const html = homeHorneada()

    // Ambos índices son >= 0 (lo garantiza la ancla positiva de arriba); la comparación NO se
    // hace contra -1. El botón fixed que acompaña a toda la página no pertenece al <main>.
    expect(html.indexOf(ID_HTML)).toBeGreaterThan(html.indexOf(CIERRE_MAIN))
  })

  it('@s4 la sección #contacto extraída SÍ trae el tel: (ANCLA POSITIVA) y NO trae el botón flotante', () => {
    const seccion = seccionContacto(homeHorneada())

    expect(seccion).toContain(`href="${TEL_HREF}"`)
    expect(seccion).not.toContain(ID_HTML)
  })
})
