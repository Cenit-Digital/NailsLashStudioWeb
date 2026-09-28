import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { NailbotArte } from './NailbotArte'

/**
 * @s14 de features/nailbot_chat_compartido.feature: NailbotArte ESTÁTICO (tal como lo usa la cabecera
 * del chat). Y, de F-24, el atributo `data-animacion` SOLO en la instancia que se lo pide.
 */
const HTML = renderToString(<NailbotArte />)

describe('@s14 NailbotArte estático: inline, decorativo, sin ids ni subrecursos, en su pose FINAL', () => {
  it('@s14 exactamente un <svg>, raíz del marcado, con viewBox, aria-hidden y focusable', () => {
    expect(HTML.startsWith('<svg')).toBe(true)
    expect(HTML.split('<svg').length - 1).toBe(1)
    const raiz = /^<svg[^>]*>/.exec(HTML)?.[0] ?? ''
    expect(raiz).toContain('viewBox="0 0 120 120"')
    expect(raiz).toContain('aria-hidden="true"')
    expect(raiz).toContain('focusable="false"')
  })

  it('@s14 sin ids, subrecursos, texto ni estilos inline', () => {
    expect(HTML).toContain('<path')
    for (const prohibido of [
      ' id=',
      '<defs',
      '<title',
      '<desc',
      '<text',
      '<image',
      '<use',
      'href=',
      'style=',
    ]) {
      expect(HTML, prohibido).not.toContain(prohibido)
    }
  })

  it('@s14 sin data-animacion: el arte estático no se mueve jamás', () => {
    expect(HTML).toContain('<svg')
    expect(HTML).not.toContain('data-animacion')
  })

  it('@s14 pose FINAL: cuatro uñas base y, sobre cada una, su esmalte rojo con el MISMO trazo y sin opacidad', () => {
    const trazos = [...HTML.matchAll(/<path([^>]*)\/?>/g)].map((m) => m[1])
    const dDe = (atributos: string) => /\sd="([^"]*)"/.exec(atributos)?.[1]
    const bases = trazos.filter((t) => t.includes('fill="var(--nb-una-base)"'))
    const esmaltes = trazos.filter((t) => t.includes('fill="var(--nb-rojo)"'))

    expect(bases).toHaveLength(4)
    for (const base of bases) {
      expect(base).not.toContain('opacity')
      const pintada = esmaltes.find((e) => dDe(e) === dDe(base))
      expect(pintada, `falta el esmalte de la uña ${dDe(base)}`).toBeDefined()
      expect(pintada).not.toContain('opacity')
    }
  })

  it('@s14 todo fill y stroke es «none», «#fff» o un var() de la paleta --nb-* o de --accent / --accent-2', () => {
    const valores = [...HTML.matchAll(/\s(?:fill|stroke)="([^"]*)"/g)].map((m) => m[1])

    expect(valores.length).toBeGreaterThan(0)
    for (const valor of valores) {
      expect(valor).toMatch(/^(none|#fff|var\(--nb-[a-z-]+\)|var\(--accent\)|var\(--accent-2\))$/)
    }
  })
})

describe('NailbotArte animado (F-24): el atributo solo en la instancia que se lo pide', () => {
  it('con animacion="activa" o "pausada" la raíz lleva ese data-animacion', () => {
    expect(renderToString(<NailbotArte animacion="activa" />)).toMatch(
      /^<svg[^>]*data-animacion="activa"/,
    )
    expect(renderToString(<NailbotArte animacion="pausada" />)).toMatch(
      /^<svg[^>]*data-animacion="pausada"/,
    )
  })
})
