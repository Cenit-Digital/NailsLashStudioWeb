import { act, fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { NailbotFlotante } from './NailbotFlotante'

/**
 * Nailbot flotante (F-24, brief progress/nailbot_diseno.md). Literales esperados A MANO (anti-tautología:
 * nada se importa de `nailbot-demo.ts` como valor esperado).
 *
 * jsdom 25 no implementa `HTMLDialogElement.showModal/close` (docs/research/asistente-robot/05 §2.7):
 * se instala un doble PROTEGIDO (solo si faltan) que refleja `open` y emite `close`. Lo nativo (Esc,
 * inercia del fondo, vuelta del foco) se verifica en navegador real.
 */
const LANZADOR = 'Abrir el chat con Nailbot para reservar cita'
const PAUSA = 'Pausar la animación de Nailbot'
const CERRAR_BOCADILLO = 'Cerrar el mensaje de Nailbot'
const CERRAR_CHAT = 'Cerrar el chat'
const SALUDO_CHAT = '¡Hola! Soy el asistente de Nails Lash Studio ✨ ¿Qué te gustaría reservar?'

const prototipo = HTMLDialogElement.prototype as unknown as Record<string, unknown>
const faltabaShowModal = typeof prototipo.showModal !== 'function'
const faltabaClose = typeof prototipo.close !== 'function'
const showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute('open', '')
})
const close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute('open')
  this.dispatchEvent(new Event('close'))
})

beforeAll(() => {
  if (faltabaShowModal) prototipo.showModal = showModal
  if (faltabaClose) prototipo.close = close
})

afterAll(() => {
  if (faltabaShowModal) delete prototipo.showModal
  if (faltabaClose) delete prototipo.close
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  showModal.mockClear()
  close.mockClear()
})

function arte(): Element {
  const svg = screen.getByRole('button', { name: LANZADOR }).querySelector('svg')
  if (svg === null) throw new Error('el lanzador no contiene el arte')
  return svg
}

function stubMovimiento(reduce: boolean) {
  const consultas: string[] = []
  vi.stubGlobal(
    'matchMedia',
    vi.fn((consulta: string) => {
      consultas.push(consulta)
      return {
        matches: reduce && consulta === '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
    }),
  )
  return consultas
}

describe('Nailbot flotante — montaje solo en cliente', () => {
  it('no viaja horneado: el SSR no contiene el lanzador', () => {
    expect(renderToString(<NailbotFlotante />)).toBe('')
  })

  it('tras hidratar hay un lanzador con nombre accesible que anuncia un diálogo', () => {
    render(<NailbotFlotante />)

    const lanzador = screen.getByRole('button', { name: LANZADOR })
    expect(lanzador).toHaveAttribute('aria-haspopup', 'dialog')
    expect(lanzador).toHaveAttribute('type', 'button')
  })

  it('el arte es decorativo: aria-hidden y no enfocable', () => {
    render(<NailbotFlotante />)

    expect(arte()).toHaveAttribute('aria-hidden', 'true')
    expect(arte()).toHaveAttribute('focusable', 'false')
    expect(arte()).toHaveAttribute('data-animado', 'si')
  })
})

describe('Nailbot flotante — pausa de la animación (SC 2.2.2)', () => {
  it('arranca en marcha y el control la pausa y la reanuda', () => {
    render(<NailbotFlotante />)
    const pausa = screen.getByRole('button', { name: PAUSA })

    expect(pausa).toHaveAttribute('aria-pressed', 'false')
    expect(arte()).toHaveAttribute('data-animacion', 'en-marcha')

    fireEvent.click(pausa)
    expect(pausa).toHaveAttribute('aria-pressed', 'true')
    expect(arte()).toHaveAttribute('data-animacion', 'pausada')

    fireEvent.click(pausa)
    expect(pausa).toHaveAttribute('aria-pressed', 'false')
    expect(arte()).toHaveAttribute('data-animacion', 'en-marcha')
  })

  it('con prefers-reduced-motion: reduce el robot queda quieto y el control no se monta', () => {
    const consultas = stubMovimiento(true)
    render(<NailbotFlotante />)

    expect(consultas).toContain('(prefers-reduced-motion: reduce)')
    expect(screen.queryByRole('button', { name: PAUSA })).toBeNull()
    expect(arte()).toHaveAttribute('data-animacion', 'pausada')
  })

  it('sin la preferencia, el control sí se monta', () => {
    stubMovimiento(false)
    render(<NailbotFlotante />)

    expect(screen.getByRole('button', { name: PAUSA })).toBeInTheDocument()
  })
})

describe('Nailbot flotante — bocadillo de invitación', () => {
  it('aparece a los 4 s (no antes) y describe al lanzador', () => {
    vi.useFakeTimers()
    render(<NailbotFlotante />)

    act(() => vi.advanceTimersByTime(3999))
    expect(screen.queryByText('¿Te pinto una cita? 💅')).toBeNull()

    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByText('¿Te pinto una cita? 💅')).toBeInTheDocument()
    expect(screen.getByText(/Soy Nailbot y te ayudo a reservar\./)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: LANZADOR })).toHaveAttribute(
      'aria-describedby',
      'nailbot-bocadillo',
    )
  })

  it('Esc lo cierra y no vuelve', () => {
    vi.useFakeTimers()
    render(<NailbotFlotante />)
    act(() => vi.advanceTimersByTime(4000))

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('¿Te pinto una cita? 💅')).toBeNull()
    expect(screen.getByRole('button', { name: LANZADOR })).not.toHaveAttribute('aria-describedby')

    act(() => vi.advanceTimersByTime(60000))
    expect(screen.queryByText('¿Te pinto una cita? 💅')).toBeNull()
  })

  it('otra tecla no lo cierra', () => {
    vi.useFakeTimers()
    render(<NailbotFlotante />)
    act(() => vi.advanceTimersByTime(4000))

    fireEvent.keyDown(document, { key: 'Enter' })
    expect(screen.getByText('¿Te pinto una cita? 💅')).toBeInTheDocument()
  })

  it('la × lo cierra y devuelve el foco al lanzador', () => {
    vi.useFakeTimers()
    render(<NailbotFlotante />)
    act(() => vi.advanceTimersByTime(4000))

    fireEvent.click(screen.getByRole('button', { name: CERRAR_BOCADILLO }))
    expect(screen.queryByText('¿Te pinto una cita? 💅')).toBeNull()
    expect(screen.getByRole('button', { name: LANZADOR })).toHaveFocus()
  })

  it('si se abre el chat antes de los 4 s, el bocadillo ya no aparece', () => {
    vi.useFakeTimers()
    render(<NailbotFlotante />)

    fireEvent.click(screen.getByRole('button', { name: LANZADOR }))
    act(() => vi.advanceTimersByTime(10000))
    expect(screen.queryByText('¿Te pinto una cita? 💅')).toBeNull()
  })
})

describe('Nailbot flotante — panel de chat (<dialog> modal nativo)', () => {
  it('el chat no se monta hasta la primera apertura', () => {
    render(<NailbotFlotante />)

    expect(screen.queryByText(SALUDO_CHAT)).toBeNull()
  })

  it('pulsar el robot abre el diálogo modal con el chat compartido y su título', () => {
    render(<NailbotFlotante />)
    fireEvent.click(screen.getByRole('button', { name: LANZADOR }))

    expect(showModal).toHaveBeenCalledTimes(1)
    const dialogo = screen.getByRole('dialog', { name: 'Reserva con Nailbot' })
    expect(dialogo).toHaveAttribute('open')
    expect(screen.getByText(SALUDO_CHAT)).toBeInTheDocument()
    expect(
      screen.getByText(
        'Demo · Nailbot responde con opciones predefinidas: no es una persona ni usa inteligencia artificial.',
      ),
    ).toBeInTheDocument()
  })

  it('el primer control enfocable del diálogo es la primera opción del chat, y «Cerrar el chat» va al final', () => {
    render(<NailbotFlotante />)
    fireEvent.click(screen.getByRole('button', { name: LANZADOR }))

    const botones = screen.getByRole('dialog').querySelectorAll('button')
    expect(botones[0]).toHaveTextContent('Uñas')
    expect(botones[botones.length - 1]).toHaveAccessibleName(CERRAR_CHAT)
  })

  it('«Cerrar el chat» cierra el diálogo y conserva la conversación al reabrir', () => {
    render(<NailbotFlotante />)
    fireEvent.click(screen.getByRole('button', { name: LANZADOR }))
    fireEvent.click(screen.getByRole('button', { name: 'Pestañas' }))

    fireEvent.click(screen.getByRole('button', { name: CERRAR_CHAT }))
    expect(close).toHaveBeenCalledTimes(1)
    expect(document.querySelector('dialog')).not.toHaveAttribute('open')

    fireEvent.click(screen.getByRole('button', { name: LANZADOR }))
    expect(showModal).toHaveBeenCalledTimes(2)
    expect(screen.getByText('Pestañas')).toBeInTheDocument()
    expect(screen.getByText('¡Perfecto! ¿Qué día te viene mejor?')).toBeInTheDocument()
  })

  it('un cierre nativo (evento close, p. ej. Esc) sincroniza el estado y se puede reabrir', () => {
    render(<NailbotFlotante />)
    fireEvent.click(screen.getByRole('button', { name: LANZADOR }))
    const dialogo = screen.getByRole('dialog')

    act(() => {
      dialogo.removeAttribute('open')
      dialogo.dispatchEvent(new Event('close'))
    })
    fireEvent.click(screen.getByRole('button', { name: LANZADOR }))

    expect(showModal).toHaveBeenCalledTimes(2)
  })

  it('con el panel abierto, ←/→ no llegan a document (los carruseles no se mueven)', () => {
    const escucha = vi.fn()
    document.addEventListener('keydown', escucha)
    render(<NailbotFlotante />)
    fireEvent.click(screen.getByRole('button', { name: LANZADOR }))
    const opcion = screen.getByRole('button', { name: 'Uñas' })

    fireEvent.keyDown(opcion, { key: 'ArrowLeft' })
    fireEvent.keyDown(opcion, { key: 'ArrowRight' })
    expect(escucha).not.toHaveBeenCalled()

    fireEvent.keyDown(opcion, { key: 'Tab' })
    expect(escucha).toHaveBeenCalledTimes(1)
    document.removeEventListener('keydown', escucha)
  })
})
