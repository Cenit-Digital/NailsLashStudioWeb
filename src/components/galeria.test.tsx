import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Galeria } from './Galeria'

/**
 * `Galeria.tsx` — SIN tests hasta hoy (2026-07-21). Fotos reales de trabajos, de banco de imágenes
 * (Pexels), SIN rostro identificable (mismo criterio que `equipo.test.tsx` @s26-@s31). Este fichero
 * NO entra en `stryker.config.json` (instrucción explícita del encargo): cubre lo esencial con tests
 * de comportamiento, sin mutación propia.
 *
 * ANTI-TAUTOLOGÍA: los seis pares fichero/alt se escriben A MANO (no se importan de producción).
 */
const FOTOS_GALERIA: readonly [string, string][] = [
  ['galeria-rosa-dorado', 'Manicura rosa empolvado con topos dorados'],
  ['galeria-esmaltes-rosa', 'Manicura en rosa nude junto a dos esmaltes'],
  ['galeria-manicura-francesa', 'Manicura francesa de uña larga'],
  ['galeria-nude-minimalista', 'Manicura nude con detalle minimalista'],
  ['galeria-rojo-clasico', 'Manicura clásica en rojo'],
  ['galeria-coral-lazo', 'Uñas en coral con lazo en relieve'],
]

describe('Galería — hay exactamente seis fotos de trabajos, con su alt correcto y en orden', () => {
  it('el horneado (SSR, sin JS) trae seis <img>, con los seis alt exactos en ese orden', () => {
    const horneado = renderToString(<Galeria />)
    const alts = [...horneado.matchAll(/<img[^>]*\salt="([^"]*)"/g)].map((m) => m[1])

    expect(alts).toEqual(FOTOS_GALERIA.map(([, alt]) => alt))
  })

  it('cada <img> entra en el árbol de accesibilidad con su alt como nombre accesible', () => {
    render(<Galeria />)

    for (const [, alt] of FOTOS_GALERIA) {
      expect(screen.getByRole('img', { name: alt })).toBeInTheDocument()
    }
  })

  it('los seis ficheros se reconocen en el src de cada <img>, en el mismo orden', () => {
    const horneado = renderToString(<Galeria />)
    const srcs = [...horneado.matchAll(/<img[^>]*\ssrc="([^"]*)"/g)].map((m) => m[1])

    expect(srcs).toHaveLength(6)
    FOTOS_GALERIA.forEach(([fichero], indice) => {
      expect(srcs[indice]).toContain(fichero)
    })
  })
})

describe('Galería — cada foto declara sus dimensiones y carga diferida (evita el salto de layout)', () => {
  it('las seis <img> declaran width="800", height="600" y loading="lazy"', () => {
    render(<Galeria />)

    for (const [, alt] of FOTOS_GALERIA) {
      const img = screen.getByRole('img', { name: alt })

      expect(img).toHaveAttribute('width', '800')
      expect(img).toHaveAttribute('height', '600')
      expect(img).toHaveAttribute('loading', 'lazy')
    }
  })
})

describe('Galería — ninguna foto rompe la puerta de placeholders ni la de terceros', () => {
  it('en el horneado no aparece "ph-woman" y ningún src de <img> apunta a un origen externo', () => {
    const horneado = renderToString(<Galeria />)

    expect(horneado.toLowerCase()).not.toContain('ph-woman')
    for (const src of [...horneado.matchAll(/<img[^>]*\ssrc="([^"]*)"/g)].map((m) => m[1])) {
      expect(src).not.toMatch(/^https?:\/\//)
      expect(src).not.toMatch(/^\/\//)
    }
  })
})

describe('Galería — la nota honesta declara que las fotos son de banco de imágenes, no del salón', () => {
  it('el horneado trae el texto exacto de la nota', () => {
    const horneado = renderToString(<Galeria />)

    expect(horneado).toContain(
      'Galería de muestra · fotos de banco de imágenes, las fotos reales del salón se añaden antes de publicar.',
    )
  })
})

describe('Galería — los botones de flecha tienen nombre accesible', () => {
  it('existen los botones "Anterior" y "Siguiente" por rol y nombre accesible', () => {
    render(<Galeria />)

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
  })
})
