import { readFileSync } from 'node:fs'

import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { BOTON_WHATSAPP_FLOTANTE_TEXTO } from '../lib/demo/contacto-demo'
import { BotonWhatsApp } from './BotonWhatsApp'

/**
 * Botón flotante de WhatsApp (rebanada de F-13). Capa in-process: SSR (`renderToString`, EL MISMO
 * mecanismo del prerender SSG), árbol de accesibilidad (`render`+`screen`) y BYTES de la FUENTE.
 * Contrato: features/boton_whatsapp_flotante.feature.
 *
 * 🔴 ANTI-TAUTOLOGÍA: todo esperado va ESCRITO A MANO («34625223366», la cadena urlencoded, el
 * aria-label). JAMÁS se importa `TELEFONO`/`waHref` ni se re-ejecuta `waHref` como esperado.
 * 🔴 EL HOST NO SE ASEVERA (A-10): ni «wa.me» ni «api.whatsapp.com» aparecen como aserción positiva.
 * 🔴 El montaje en la home y los BYTES de dist/ (@s4, exit-code de @s5/@s6, conteo global de @s12)
 * los acredita la FASE DE MONTAJE + BUILD, no este fichero.
 */
const RUTA_TSX = 'src/components/BotonWhatsApp.tsx'
const RUTA_DEMO = 'src/lib/demo/contacto-demo.ts'
const NOMBRE_ACCESIBLE = 'Abrir chat de WhatsApp con Nails Lash Studio'
const ID_HTML = 'id="whatsapp-flotante"'

function fuenteTsx(): string {
  return readFileSync(RUTA_TSX, 'utf8')
}

describe('@s1 el href horneado lleva el número único de F-02 y el mensaje prellenado urlencoded — sin host', () => {
  it('@s1 el href contiene el E.164 sin el "+" (34625223366) y el texto urlencoded EXACTO', () => {
    const horneado = renderToString(<BotonWhatsApp />)

    // Literales A MANO (nunca `waHref(...)` re-ejecutado): si waHref emitiera basura, esto rompería.
    expect(horneado).toContain('34625223366')
    expect(horneado).toContain(
      '?text=Hola%2C%20quiero%20reservar%20una%20cita%20en%20Nails%20Lash%20Studio.',
    )
  })

  it('@s1 el texto viaja URLENCODED (sin espacio ni coma en crudo) y el número legible NO viaja', () => {
    const horneado = renderToString(<BotonWhatsApp />)

    expect(horneado).not.toContain('text=Hola, quiero')
    expect(horneado).not.toContain('625 22 33 66')
  })

  it('@s1 el enlace tiene el id "whatsapp-flotante" horneado (ANCLA POSITIVA)', () => {
    expect(renderToString(<BotonWhatsApp />)).toContain(ID_HTML)
  })
})

describe('@s2 el .tsx NO hornea ni el número ni el host — el href DERIVA de waHref (guarda de FUENTE)', () => {
  it('@s2 el .tsx no contiene "625 22 33 66", ni "34625223366", ni "+34625223366"', () => {
    const fuente = fuenteTsx()

    expect(fuente).not.toContain('625 22 33 66')
    expect(fuente).not.toContain('34625223366')
    expect(fuente).not.toContain('+34625223366')
  })

  it('@s2 el .tsx no contiene el host de WhatsApp (vive solo en HOST_WHATSAPP de site.ts)', () => {
    const fuente = fuenteTsx()

    expect(fuente).not.toContain('wa.me')
    expect(fuente).not.toContain('api.whatsapp.com')
    expect(fuente).not.toContain('whatsapp.com')
  })

  it('@s2 el .tsx SÍ llama a "waHref(" e importa TELEFONO desde "../lib/site" (ANCLA POSITIVA)', () => {
    const fuente = fuenteTsx()

    expect(fuente).toContain('waHref(')
    expect(fuente).toMatch(/import\s*\{[^}]*\bTELEFONO\b[^}]*\}\s*from\s*['"]\.\.\/lib\/site['"]/)
  })

  it('@s2 el .tsx NO contiene el texto prellenado literal (vive en la constante de src/lib/demo/)', () => {
    expect(fuenteTsx()).not.toContain('Hola, quiero reservar una cita en Nails Lash Studio.')
  })
})

describe('@s3 el botón se anuncia con un nombre accesible explícito y su icono es decorativo', () => {
  it('@s3 existe EXACTAMENTE un role "link" con el nombre accesible exacto del aria-label', () => {
    render(<BotonWhatsApp />)

    // El literal del nombre accesible va A MANO, nunca importado del componente.
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link', { name: NOMBRE_ACCESIBLE })).toBeTruthy()
  })

  it('@s3 el icono es un <svg> inline aria-hidden="true" focusable="false" y NO hay ningún <img>', () => {
    const { container } = render(<BotonWhatsApp />)

    expect(container.querySelectorAll('svg[aria-hidden="true"][focusable="false"]')).toHaveLength(1)
    expect(container.querySelector('img')).toBeNull()
  })
})

describe('@s5 el botón es un <a> (no <section>) sin aria-labelledby — puerta 1 tranquila', () => {
  it('@s5 el enlace horneado es un <a id="whatsapp-flotante">, no una <section>', () => {
    const horneado = renderToString(<BotonWhatsApp />)

    expect(horneado).toMatch(/<a\b[^>]*id="whatsapp-flotante"/)
    expect(horneado).not.toContain('<section')
  })

  it('@s5 el enlace NO lleva aria-labelledby (no le pide heading a la puerta de cascarón)', () => {
    expect(renderToString(<BotonWhatsApp />)).not.toContain('aria-labelledby')
  })
})

describe('@s6 el botón no introduce subrecursos externos ni literales placeholder — puertas 2 y 4', () => {
  it('@s6 el marcado no contiene <img, <iframe, <script, <link ni src= (el icono es svg inline)', () => {
    const horneado = renderToString(<BotonWhatsApp />)

    expect(horneado).not.toContain('<img')
    expect(horneado).not.toContain('<iframe')
    expect(horneado).not.toContain('<script')
    expect(horneado).not.toContain('<link')
    expect(horneado).not.toContain('src=')
  })

  it('@s6 el marcado no contiene ninguno de los literales placeholder prohibidos (puerta 2)', () => {
    const horneado = renderToString(<BotonWhatsApp />)

    for (const prohibido of [
      'IMAGEN TEMPORAL',
      'Plantilla de demostracion',
      '600123456',
      'hola@nailslashstudio.com',
      'Calle de la Belleza',
      'ph-woman',
    ]) {
      expect(horneado).not.toContain(prohibido)
    }
  })
})

describe('@s11 la feature es NO-MUTABLE — el .tsx es render PURO, sin ningún predicado', () => {
  it('@s11 el .tsx no contiene "if (", ni ternario "?", ni "&&", ni "||"', () => {
    const fuente = fuenteTsx()

    expect(fuente).not.toContain('if (')
    expect(fuente).not.toContain('&&')
    expect(fuente).not.toContain('||')
    // No hay ningún "?" legítimo en un <a> estático: ni ternario, ni ?., ni ??, ni query en URLs.
    expect(fuente).not.toContain('?')
  })

  it('@s11 el .tsx SÍ contiene "export function BotonWhatsApp" (ANCLA POSITIVA)', () => {
    expect(fuenteTsx()).toContain('export function BotonWhatsApp')
  })
})

describe('@s12 hay EXACTAMENTE un botón en el horneado y trae su href completo (funciona sin JS)', () => {
  it('@s12 el id "whatsapp-flotante" aparece EXACTAMENTE 1 vez en el horneado del componente', () => {
    const horneado = renderToString(<BotonWhatsApp />)
    const apariciones = horneado.split(ID_HTML).length - 1

    expect(apariciones).toBe(1)
  })

  it('@s12 el enlace NO depende de hidratación: sin onclick ni data-href (PROXY de "sin JS")', () => {
    const horneado = renderToString(<BotonWhatsApp />)

    expect(horneado).not.toContain('onclick')
    expect(horneado).not.toContain('data-href')
    expect(horneado).toMatch(/<a\b[^>]*href="[^"]+"/)
  })
})

describe('@s13 el texto prellenado vive en src/lib/demo/ y NO puede quedar vacío', () => {
  it('@s13 la constante no es vacía y tiene más de 10 caracteres', () => {
    // La constante es el SUJETO bajo prueba (no un "esperado"): se comprueban sus propiedades.
    expect(BOTON_WHATSAPP_FLOTANTE_TEXTO).not.toBe('')
    expect(BOTON_WHATSAPP_FLOTANTE_TEXTO.length).toBeGreaterThan(10)
  })

  it('@s13 el href horneado SÍ trae "?text=": el usuario no abre un chat en blanco', () => {
    expect(renderToString(<BotonWhatsApp />)).toContain('?text=')
  })

  it('@s13 el docblock de la constante declara que el mensaje lo ENVÍA el usuario', () => {
    const fuenteDemo = readFileSync(RUTA_DEMO, 'utf8')

    expect(fuenteDemo).toContain('BOTON_WHATSAPP_FLOTANTE_TEXTO')
    expect(fuenteDemo).toContain('ENVÍA el usuario')
  })
})

describe('@s14 el botón NO compone la solicitud (servicio, fecha, profesional) — eso es F-13', () => {
  it('@s14 el href trae "?text=" con un mensaje genérico FIJO (ANCLA POSITIVA)', () => {
    const horneado = renderToString(<BotonWhatsApp />)

    expect(horneado).toContain(
      '?text=Hola%2C%20quiero%20reservar%20una%20cita%20en%20Nails%20Lash%20Studio.',
    )
  })

  it('@s14 el mensaje no contiene servicio, fecha, hora ni profesional, y no hay <form> ni panel', () => {
    const horneado = renderToString(<BotonWhatsApp />)

    expect(horneado).not.toMatch(/\d{1,2}[:/]\d{2}/) // sin hora/fecha
    for (const dinamico of ['Manicura', 'Pestañas', 'Cejas', 'Lifting']) {
      expect(horneado).not.toContain(dinamico)
    }
    expect(horneado).not.toContain('<form')
    expect(horneado).not.toContain('<dialog')
  })
})
