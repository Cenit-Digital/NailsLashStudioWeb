import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { Cabecera } from './Cabecera'

/**
 * @s4 de features/logo_acoplado.feature (LA-15, I-7): la firma del logo y su viewBox salen de la
 * MISMA fuente que el rótulo del hero —partirNombre(NOMBRE).marca y VISTA_MARCA—, nunca de un
 * literal. Aquí se SUSTITUYEN las dos fuentes con vi.mock (literales A MANO) y el logo debe
 * seguirlas: es lo contrario de importarlas como valor esperado. El vi.mock vive SOLO en este
 * fichero para no contaminar el resto de la suite.
 */
vi.mock('../lib/site', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/site')>()),
  NOMBRE: 'Salón Uñas Bonitas',
}))

vi.mock('../lib/trazo-marca', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/trazo-marca')>()),
  VISTA_MARCA: '0 -700 3000 900',
}))

function enlaceHorneado(): { fragmento: string; enlace: HTMLAnchorElement } {
  const fragmento =
    /<a\b[^>]*\sdata-logo=[^>]*>[\s\S]*?<\/a>/.exec(renderToString(<Cabecera />))?.[0] ?? ''
  const plantilla = document.createElement('template')
  plantilla.innerHTML = fragmento
  const enlace = plantilla.content.querySelector('a')

  expect(enlace, 'el horneado debe traer el <a> con data-logo').not.toBeNull()

  return { fragmento, enlace: enlace as HTMLAnchorElement }
}

describe('@s4 la firma y el viewBox del logo salen de partirNombre(NOMBRE).marca y de VISTA_MARCA', () => {
  it('@s4 con NOMBRE «Salón Uñas Bonitas», la firma es «Salón Uñas» y el <svg> no trae «Bonitas» (P3)', () => {
    const svg = enlaceHorneado().enlace.querySelector('svg') as SVGSVGElement

    expect(svg.querySelector('text')?.textContent).toBe('Salón Uñas')
    expect(svg.outerHTML).not.toContain('Bonitas')
  })

  it('@s4 con VISTA_MARCA «0 -700 3000 900», el <svg> del logo lleva ese viewBox', () => {
    const svg = enlaceHorneado().enlace.querySelector('svg') as SVGSVGElement

    expect(svg.getAttribute('viewBox')).toBe('0 -700 3000 900')
  })

  it('@s4 los dos <span> dicen «Salón Uñas Bonitas» y el <a> ya no trae la marca ni el viewBox reales', () => {
    const { fragmento, enlace } = enlaceHorneado()
    const spans = [...enlace.querySelectorAll('span')]

    expect(spans.map((span) => span.textContent)).toEqual([
      'Salón Uñas Bonitas',
      'Salón Uñas Bonitas',
    ])
    expect(fragmento).not.toContain('Nails Lash')
    expect(fragmento).not.toContain('-80 -840 4120 1200')
  })
})
