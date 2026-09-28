import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Home from '../pages/home'
import { ChatNailbot } from './ChatNailbot'
import { NailbotFlotante } from './NailbotFlotante'

/**
 * Nailbot flotante (F-24), contrato features/nailbot_flotante.feature @s1-@s5 y @s7-@s11 (@s6 en
 * nailbot-flotante-logica.test.ts; @s12-@s15 en nailbot-flotante-estilos.test.ts).
 *
 * Literales A MANO (anti-tautología: nada se importa de nailbot-demo.ts como esperado). jsdom 25 no
 * implementa showModal/close: los pone el doble PROTEGIDO de vitest.setup.ts y aquí se ESPÍAN sobre
 * HTMLDialogElement.prototype. Lo nativo (Esc, inercia, foco real) se verifica en navegador.
 */
const LANZADOR = 'Abrir el chat con Nailbot para reservar cita'
const PAUSA = 'Pausar la animación de Nailbot'
const CERRAR_BOCADILLO = 'Cerrar el mensaje de Nailbot'
const CERRAR_CHAT = 'Cerrar el chat'
const TITULO = 'Reserva con Nailbot'
const DESTACADO = '¿Te pinto una cita? 💅'
const TEXTO_BOCADILLO = 'Soy Nailbot y te ayudo a reservar.'
const SUBTITULO_CHAT = 'Asistente automático · demo'
const LEYENDA =
  'Demo · Nailbot responde con opciones predefinidas: no es una persona ni usa inteligencia artificial.'
const CONSULTA = '(prefers-reduced-motion: reduce)'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** Sustituye matchMedia por un espía que solo casa la consulta EXACTA de movimiento reducido. */
function espiarMovimiento(reduce: boolean) {
  const addEventListener = vi.fn()
  const removeEventListener = vi.fn()
  const matchMedia = vi.fn((consulta: string) => ({
    matches: reduce && consulta === CONSULTA,
    addEventListener,
    removeEventListener,
  }))
  vi.stubGlobal('matchMedia', matchMedia)

  return {
    matchMedia,
    addEventListener,
    removeEventListener,
    cambiar(matches: boolean) {
      const manejador = addEventListener.mock.calls.at(-1)?.[1] as (e: { matches: boolean }) => void
      act(() => manejador({ matches }))
    },
  }
}

function lanzador(): HTMLElement {
  return screen.getByRole('button', { name: LANZADOR })
}

function arteDelLanzador(): Element {
  const svg = lanzador().querySelector('svg')
  if (svg === null) throw new Error('el lanzador no contiene el arte')
  return svg
}

function espiarDialogo() {
  return {
    showModal: vi.spyOn(HTMLDialogElement.prototype, 'showModal'),
    close: vi.spyOn(HTMLDialogElement.prototype, 'close'),
  }
}

function dialogo(): HTMLDialogElement {
  const nodo = document.querySelector('dialog')
  if (nodo === null) throw new Error('no hay <dialog>')
  return nodo
}

/** El primer elemento enfocable dentro de un contenedor, en orden del DOM. */
function primerEnfocable(contenedor: Element): Element | null {
  return contenedor.querySelector('button, input, a[href], [tabindex]:not([tabindex="-1"])')
}

describe('@s1 sin JavaScript no hay flotante', () => {
  it('@s1 la home horneada no trae lanzador, pausa, bocadillo, diálogo ni arte animado', () => {
    const html = renderToString(
      <HelmetProvider>
        <Home />
      </HelmetProvider>,
    )

    expect(html).toContain('id="reserva-titulo"')
    expect(html.split(SUBTITULO_CHAT).length - 1).toBe(1)
    for (const ausente of [
      LANZADOR,
      PAUSA,
      '¿Te pinto una cita?',
      TITULO,
      CERRAR_CHAT,
      '<dialog',
      'data-animacion',
    ]) {
      expect(html, ausente).not.toContain(ausente)
    }
  })

  it('@s1 NailbotFlotante a solas tampoco hornea nada', () => {
    expect(renderToString(<NailbotFlotante />)).toBe('')
  })
})

describe('@s2 tras hidratar, el lanzador va DESPUÉS de <main> y ANTES del <footer>, fuera de ambos', () => {
  it('@s2 posición en el documento, un solo <h1> y ningún id repetido', () => {
    espiarMovimiento(false)
    const { container } = render(
      <HelmetProvider>
        <Home />
      </HelmetProvider>,
    )
    const mains = container.querySelectorAll('main')
    const footers = container.querySelectorAll('footer')
    const lanzadores = screen.getAllByRole('button', { name: LANZADOR })

    expect(mains).toHaveLength(1)
    expect(footers).toHaveLength(1)
    expect(lanzadores).toHaveLength(1)

    const posMain = mains[0].compareDocumentPosition(lanzadores[0])
    expect(posMain & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(posMain & Node.DOCUMENT_POSITION_CONTAINED_BY).toBe(0)
    expect(
      lanzadores[0].compareDocumentPosition(footers[0]) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(footers[0].contains(lanzadores[0])).toBe(false)
    expect(container.querySelectorAll('h1')).toHaveLength(1)

    // Con el panel ABIERTO hay tres artes (avatar de #reserva, lanzador y avatar del panel) y dos chats.
    fireEvent.click(lanzadores[0])
    const artes = container.querySelectorAll('svg[viewBox="0 0 120 120"]')
    expect(artes.length).toBeGreaterThanOrEqual(3)
    for (const svg of artes) {
      expect(svg).not.toHaveAttribute('id')
    }
    const ids = [...container.querySelectorAll('[id]')].map((e) => e.id)
    expect(ids.length).toBeGreaterThanOrEqual(2)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('@s2 a solas, antes y después de abrir, no aporta sección, nav ni headings, salvo su <h2> DENTRO del <dialog>', () => {
    espiarMovimiento(false)
    const { container } = render(<NailbotFlotante />)

    for (const momento of ['antes', 'después']) {
      if (momento === 'después') fireEvent.click(lanzador())
      expect(container.querySelector('section, nav, h1, h3, h4, h5, h6'), momento).toBeNull()
      const h2 = container.querySelectorAll('h2')
      expect(h2, momento).toHaveLength(1)
      expect(h2[0].closest('dialog'), momento).not.toBeNull()
    }
  })
})

describe('@s3 el lanzador: un botón con nombre propio que anuncia un diálogo, con el arte ANIMADO', () => {
  it('@s3 exactamente uno, sin aria-expanded, sin texto y con el arte activo; el avatar de fuera, quieto', () => {
    espiarMovimiento(false)
    const { container } = render(
      <>
        <NailbotFlotante />
        <div data-fuera="">
          <ChatNailbot />
        </div>
      </>,
    )

    const lanzadores = screen.getAllByRole('button', { name: LANZADOR })
    expect(lanzadores).toHaveLength(1)
    expect(lanzadores[0]).toHaveAttribute('type', 'button')
    expect(lanzadores[0]).toHaveAttribute('aria-haspopup', 'dialog')
    expect(lanzadores[0]).not.toHaveAttribute('aria-expanded')
    expect(lanzadores[0]).not.toHaveAttribute('aria-controls')
    expect((lanzadores[0].getAttribute('aria-label') ?? '').toLowerCase()).not.toContain('whatsapp')
    expect((lanzadores[0].textContent ?? '').replace(/\s/g, '')).toBe('')

    expect(arteDelLanzador()).toHaveAttribute('aria-hidden', 'true')
    expect(arteDelLanzador()).toHaveAttribute('focusable', 'false')
    expect(arteDelLanzador()).toHaveAttribute('data-animacion', 'activa')

    const avatarDeFuera = container.querySelector('[data-fuera] svg')
    expect(avatarDeFuera).not.toBeNull()
    expect(avatarDeFuera).not.toHaveAttribute('data-animacion')
  })
})

describe('@s4 la pausa alterna aria-pressed y data-animacion, su etiqueta NO cambia, va junto al robot y no se recuerda', () => {
  const filas: readonly (readonly [number, string, string])[] = [
    [1, 'true', 'pausada'],
    [2, 'false', 'activa'],
  ]

  for (const [pulsaciones, pulsada, estado] of filas) {
    it(`@s4 ${pulsaciones} pulsación(es) → aria-pressed="${pulsada}", data-animacion="${estado}"`, () => {
      espiarMovimiento(false)
      const { unmount } = render(<NailbotFlotante />)
      const pausa = screen.getByRole('button', { name: PAUSA })
      expect(pausa).toHaveAttribute('aria-pressed', 'false')
      expect(arteDelLanzador()).toHaveAttribute('data-animacion', 'activa')

      for (let i = 0; i < pulsaciones; i++) fireEvent.click(pausa)

      expect(pausa).toHaveAttribute('aria-pressed', pulsada)
      expect(arteDelLanzador()).toHaveAttribute('data-animacion', estado)
      expect(pausa).toHaveAccessibleName(PAUSA)
      expect(pausa).toHaveAttribute('type', 'button')
      expect(lanzador().contains(pausa)).toBe(false)
      expect(pausa.parentElement).toBe(lanzador().parentElement)
      // El icono cuenta lo mismo que aria-pressed: ❙❙ mientras se mueve, ▶ cuando está congelado.
      const icono = pausa.querySelector('path')?.getAttribute('d')
      expect(icono).toBe(
        pulsada === 'true'
          ? 'M3 1.6 L10.4 6 L3 10.4 Z'
          : 'M2 1.5 H4.8 V10.5 H2 Z M7.2 1.5 H10 V10.5 H7.2 Z',
      )

      unmount()
      render(<NailbotFlotante />)
      expect(screen.getByRole('button', { name: PAUSA })).toHaveAttribute('aria-pressed', 'false')
      expect(arteDelLanzador()).toHaveAttribute('data-animacion', 'activa')
    })
  }
})

describe('@s5 movimiento reducido: la pausa no se monta; en caliente pausa y recoloca el foco; retirarlo nunca reanuda', () => {
  it('@s5 sin «reduce»: la pausa existe sin pulsar, el arte activo y montar no roba el foco', () => {
    const espia = espiarMovimiento(false)
    const { unmount } = render(<NailbotFlotante />)

    expect(screen.getByRole('button', { name: PAUSA })).toHaveAttribute('aria-pressed', 'false')
    expect(arteDelLanzador()).toHaveAttribute('data-animacion', 'activa')
    expect(document.activeElement).toBe(document.body)
    expect(espia.matchMedia).toHaveBeenCalledWith(CONSULTA)

    const [evento, manejador] = espia.addEventListener.mock.calls[0]
    expect(evento).toBe('change')
    unmount()
    expect(espia.removeEventListener).toHaveBeenCalledWith('change', manejador)
  })

  it('@s5 con «reduce» al montar: la pausa NO existe y el robot queda quieto', () => {
    const espia = espiarMovimiento(true)
    render(<NailbotFlotante />)

    expect(screen.queryByRole('button', { name: PAUSA })).toBeNull()
    expect(arteDelLanzador()).toHaveAttribute('data-animacion', 'pausada')
    expect(document.activeElement).toBe(document.body)
    expect(espia.matchMedia).toHaveBeenCalledWith(CONSULTA)
  })

  it('@s5 activar «reduce» en caliente con el foco en la pausa: la pausa desaparece y el foco pasa al lanzador', () => {
    const espia = espiarMovimiento(false)
    render(<NailbotFlotante />)
    screen.getByRole('button', { name: PAUSA }).focus()

    espia.cambiar(true)

    expect(screen.queryByRole('button', { name: PAUSA })).toBeNull()
    expect(arteDelLanzador()).toHaveAttribute('data-animacion', 'pausada')
    expect(document.activeElement).toBe(lanzador())
  })

  it('@s5 activar «reduce» en caliente con el foco FUERA de la pausa no mueve el foco', () => {
    const espia = espiarMovimiento(false)
    render(<NailbotFlotante />)

    espia.cambiar(true)

    expect(document.activeElement).toBe(document.body)
  })

  it('@s5 retirar «reduce» en caliente: la pausa reaparece PULSADA y el robot sigue quieto', () => {
    const espia = espiarMovimiento(true)
    render(<NailbotFlotante />)
    lanzador().focus()

    espia.cambiar(false)

    expect(screen.getByRole('button', { name: PAUSA })).toHaveAttribute('aria-pressed', 'true')
    expect(arteDelLanzador()).toHaveAttribute('data-animacion', 'pausada')
    expect(document.activeElement).toBe(lanzador())
  })

  it('@s5 retirar «reduce» con el foco en la pausa ya visible no lo mueve', () => {
    const espia = espiarMovimiento(false)
    render(<NailbotFlotante />)
    const pausa = screen.getByRole('button', { name: PAUSA })
    pausa.focus()

    espia.cambiar(false)

    expect(document.activeElement).toBe(pausa)
  })

  it('sin matchMedia (entorno sin la API) el robot se anima y la pausa existe', () => {
    expect(window.matchMedia).toBeUndefined()
    render(<NailbotFlotante />)

    expect(screen.getByRole('button', { name: PAUSA })).toHaveAttribute('aria-pressed', 'false')
    expect(arteDelLanzador()).toHaveAttribute('data-animacion', 'activa')
  })
})

describe('@s7 el bocadillo aparece UNA vez, a los 4 000 ms y no a los 3 999, solo si el panel nunca se abrió', () => {
  function comprobarVisible() {
    const destacado = screen.getByText(DESTACADO)
    expect(destacado.tagName).toBe('STRONG')
    expect(destacado.parentElement?.textContent).toBe(`${DESTACADO} ${TEXTO_BOCADILLO}`)
    expect(screen.getByRole('button', { name: CERRAR_BOCADILLO })).toBeInTheDocument()
    const describedBy = lanzador().getAttribute('aria-describedby') ?? ''
    expect(describedBy).not.toBe('')
    expect(document.getElementById(describedBy)).toBe(destacado.parentElement)
    expect(lanzador()).toHaveAccessibleDescription(`${DESTACADO} ${TEXTO_BOCADILLO}`)
    for (let nodo: Element | null = destacado; nodo !== null; nodo = nodo.parentElement) {
      expect(nodo.getAttribute('role') ?? '').not.toMatch(/^(status|alert|log)$/)
      expect(nodo).not.toHaveAttribute('aria-live')
    }
  }

  function a3999NoEsta() {
    act(() => vi.advanceTimersByTime(3999))
    expect(screen.queryByText(DESTACADO)).toBeNull()
    expect(lanzador()).not.toHaveAttribute('aria-describedby')
  }

  it('@s7 sin antecedentes: está visible a los 4 000 ms', () => {
    vi.useFakeTimers()
    render(<NailbotFlotante />)
    a3999NoEsta()
    act(() => vi.advanceTimersByTime(1))
    comprobarVisible()
  })

  it('@s7 un Escape ANTES de verse no lo descarta por adelantado', () => {
    vi.useFakeTimers()
    render(<NailbotFlotante />)
    act(() => vi.advanceTimersByTime(2000))
    fireEvent.keyDown(document, { key: 'Escape' })
    act(() => vi.advanceTimersByTime(1999))
    expect(screen.queryByText(DESTACADO)).toBeNull()
    act(() => vi.advanceTimersByTime(1))
    comprobarVisible()
  })

  it('@s7 con el panel abierto y cerrado a los 2 000 ms NO aparece, ni a los 4 000 ni a los 60 000', () => {
    vi.useFakeTimers()
    render(<NailbotFlotante />)
    act(() => vi.advanceTimersByTime(2000))
    fireEvent.click(lanzador())
    fireEvent.click(screen.getByRole('button', { name: CERRAR_CHAT }))

    act(() => vi.advanceTimersByTime(2000))
    expect(screen.queryByText(DESTACADO)).toBeNull()
    act(() => vi.advanceTimersByTime(56000))
    expect(screen.queryByText(DESTACADO)).toBeNull()
  })

  it('@s7 un montaje ANTERIOR que lo cerró con su × no impide que la siguiente carga lo ofrezca (sin storage)', () => {
    vi.useFakeTimers()
    const primero = render(<NailbotFlotante />)
    act(() => vi.advanceTimersByTime(4000))
    fireEvent.click(screen.getByRole('button', { name: CERRAR_BOCADILLO }))
    primero.unmount()

    render(<NailbotFlotante />)
    a3999NoEsta()
    act(() => vi.advanceTimersByTime(1))
    comprobarVisible()
  })
})

describe('@s8 el bocadillo se cierra con su ×, con Esc desde cualquier foco o al abrir el panel, y no vuelve', () => {
  function montarConBocadillo() {
    vi.useFakeTimers()
    const alta = vi.spyOn(document, 'addEventListener')
    const baja = vi.spyOn(document, 'removeEventListener')
    const ajeno = document.createElement('button')
    ajeno.textContent = 'Ajeno'
    document.body.appendChild(ajeno)
    render(<NailbotFlotante />)
    act(() => vi.advanceTimersByTime(4000))
    expect(screen.getByText(DESTACADO)).toBeInTheDocument()
    const registro = alta.mock.calls.filter((c) => c[0] === 'keydown').at(-1)
    return { ajeno, baja, manejador: registro?.[1] }
  }

  function comprobarCerradoYNoVuelve(baja: { mock: { calls: unknown[][] } }, manejador: unknown) {
    expect(screen.queryByText(DESTACADO)).toBeNull()
    expect(lanzador()).not.toHaveAttribute('aria-describedby')
    act(() => vi.advanceTimersByTime(56000))
    expect(screen.queryByText(DESTACADO)).toBeNull()
    expect(manejador).toBeDefined()
    expect(baja.mock.calls.some((c) => c[0] === 'keydown' && c[1] === manejador)).toBe(true)
  }

  it('@s8 Esc con el foco en un botón AJENO: se cierra y el foco NO se mueve', () => {
    const { ajeno, baja, manejador } = montarConBocadillo()
    ajeno.focus()

    fireEvent.keyDown(ajeno, { key: 'Escape' })

    expect(document.activeElement).toBe(ajeno)
    comprobarCerradoYNoVuelve(baja, manejador)
    ajeno.remove()
  })

  it('@s8 otra tecla distinta de Esc NO lo cierra', () => {
    const { ajeno } = montarConBocadillo()

    fireEvent.keyDown(ajeno, { key: 'Enter' })

    expect(screen.getByText(DESTACADO)).toBeInTheDocument()
    ajeno.remove()
  })

  it('@s8 la × lo cierra y el foco pasa al lanzador', () => {
    const { ajeno, baja, manejador } = montarConBocadillo()
    const cerrar = screen.getByRole('button', { name: CERRAR_BOCADILLO })
    cerrar.focus()

    fireEvent.click(cerrar)

    expect(document.activeElement).toBe(lanzador())
    comprobarCerradoYNoVuelve(baja, manejador)
    ajeno.remove()
  })

  it('@s8 Esc con el foco EN su propia ×: el bocadillo se cierra y el foco pasa al lanzador, no al vacío', () => {
    const { ajeno, baja, manejador } = montarConBocadillo()
    const cerrar = screen.getByRole('button', { name: CERRAR_BOCADILLO })
    cerrar.focus()

    fireEvent.keyDown(cerrar, { key: 'Escape' })

    expect(document.activeElement).toBe(lanzador())
    comprobarCerradoYNoVuelve(baja, manejador)
    ajeno.remove()
  })

  it('@s8 al desmontar antes de los 4 s se cancela el temporizador del bocadillo', () => {
    vi.useFakeTimers()
    const programar = vi.spyOn(window, 'setTimeout')
    const cancelar = vi.spyOn(window, 'clearTimeout')
    const { unmount } = render(<NailbotFlotante />)
    const indice = programar.mock.calls.findIndex((llamada) => llamada[1] === 4000)
    expect(indice).toBeGreaterThanOrEqual(0)
    const temporizador = programar.mock.results[indice].value as unknown

    unmount()

    expect(cancelar).toHaveBeenCalledWith(temporizador)
  })

  it('@s8 abrir el panel lo cierra', () => {
    const { ajeno, baja, manejador } = montarConBocadillo()
    lanzador().focus()

    fireEvent.click(lanzador())

    expect(document.activeElement).toBe(lanzador())
    comprobarCerradoYNoVuelve(baja, manejador)
    ajeno.remove()
  })
})

describe('@s9 pulsar el lanzador abre un <dialog> NATIVO con showModal()', () => {
  it('@s9 un showModal, título, chat propio, «Cerrar el chat» al final y nada se pausa solo', () => {
    espiarMovimiento(false)
    const espias = espiarDialogo()
    render(<NailbotFlotante />)
    expect(screen.queryByText(SUBTITULO_CHAT)).toBeNull()
    const pausaAntes = screen.getByRole('button', { name: PAUSA }).getAttribute('aria-pressed')

    fireEvent.click(lanzador())

    expect(espias.showModal).toHaveBeenCalledTimes(1)
    const nodo = espias.showModal.mock.contexts[0] as HTMLDialogElement
    expect(nodo.tagName).toBe('DIALOG')
    expect(nodo).toHaveAttribute('open')
    for (const atributo of ['role', 'tabindex', 'closedby']) {
      expect(nodo).not.toHaveAttribute(atributo)
    }
    const titulo = document.getElementById(nodo.getAttribute('aria-labelledby') ?? '')
    expect(titulo?.tagName).toBe('H2')
    expect(titulo?.textContent).toBe(TITULO)
    expect(screen.getByRole('dialog')).toHaveAccessibleName(TITULO)

    const cerrar = within(nodo).getByRole('button', { name: CERRAR_CHAT })
    expect(cerrar).toHaveAttribute('type', 'button')
    expect(screen.getAllByText(SUBTITULO_CHAT)).toHaveLength(1)
    expect(nodo.contains(screen.getByText(SUBTITULO_CHAT))).toBe(true)

    const uñas = within(nodo).getByRole('button', { name: 'Uñas' })
    const orden = [titulo as Element, within(nodo).getByText(LEYENDA), uñas, cerrar]
    for (let i = 1; i < orden.length; i++) {
      expect(orden[i - 1].compareDocumentPosition(orden[i])).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    }
    expect(primerEnfocable(nodo)).toBe(uñas)

    expect(arteDelLanzador()).toHaveAttribute('data-animacion', 'activa')
    expect(screen.getByRole('button', { name: PAUSA })).toHaveAttribute('aria-pressed', pausaAntes)
    expect(nodo.querySelector('svg')).not.toHaveAttribute('data-animacion')
  })
})

describe('@s10 cerrar deja el panel CERRADO y al reabrir la conversación sigue donde estaba', () => {
  function abrirYLlevarAlNombre() {
    espiarMovimiento(false)
    const espias = espiarDialogo()
    const { container } = render(
      <>
        <div data-fuera="">
          <ChatNailbot />
        </div>
        <NailbotFlotante />
      </>,
    )
    fireEvent.click(lanzador())
    const nodo = dialogo()
    for (const p of ['Uñas', 'Entre semana', 'Por la mañana']) {
      fireEvent.click(within(nodo).getByRole('button', { name: p }))
    }
    expect(nodo.querySelectorAll('[data-de]')).toHaveLength(7)
    return { espias, nodo, fuera: container.querySelector('[data-fuera]') as HTMLElement }
  }

  function comprobarReapertura(
    espias: ReturnType<typeof espiarDialogo>,
    nodo: HTMLDialogElement,
    fuera: HTMLElement,
  ) {
    fireEvent.click(lanzador())
    expect(espias.showModal).toHaveBeenCalledTimes(2)
    expect(nodo.querySelectorAll('[data-de]')).toHaveLength(7)
    const campo = within(nodo).getByRole('textbox', { name: 'Tu nombre' })
    expect(primerEnfocable(nodo)).toBe(campo)
    expect(fuera.querySelectorAll('[data-de]')).toHaveLength(1)
  }

  it('@s10 con «Cerrar el chat»: el componente llama a close una vez', () => {
    const { espias, nodo, fuera } = abrirYLlevarAlNombre()

    fireEvent.click(within(nodo).getByRole('button', { name: CERRAR_CHAT }))

    expect(nodo).not.toHaveAttribute('open')
    expect(espias.close).toHaveBeenCalledTimes(1)
    comprobarReapertura(espias, nodo, fuera)
  })

  it('@s10 con un close() AJENO (como Esc o el gesto atrás): el componente no añade otro close', () => {
    const { espias, nodo, fuera } = abrirYLlevarAlNombre()

    act(() => nodo.close())

    expect(nodo).not.toHaveAttribute('open')
    expect(espias.close).toHaveBeenCalledTimes(1)
    comprobarReapertura(espias, nodo, fuera)
  })
})

describe('@s11 con el panel abierto, ← y → no salen del diálogo; ninguna otra tecla se retiene', () => {
  const filas: readonly (readonly [string, string, boolean])[] = [
    ['Uñas', 'ArrowLeft', false],
    ['Uñas', 'ArrowRight', false],
    ['campo', 'ArrowLeft', false],
    ['Uñas', 'Escape', true],
    ['Uñas', 'Tab', true],
    ['Uñas', 'a', true],
  ]

  for (const [foco, tecla, llega] of filas) {
    it(`@s11 «${tecla}» sobre ${foco} → ${llega ? 'llega' : 'NO llega'} a document y no se previene`, () => {
      espiarMovimiento(false)
      const escucha = vi.fn()
      document.addEventListener('keydown', escucha)
      render(<NailbotFlotante />)
      fireEvent.click(lanzador())
      const nodo = dialogo()
      if (foco === 'campo') {
        for (const p of ['Uñas', 'Entre semana', 'Por la mañana']) {
          fireEvent.click(within(nodo).getByRole('button', { name: p }))
        }
      }
      const objetivo =
        foco === 'campo'
          ? within(nodo).getByRole('textbox', { name: 'Tu nombre' })
          : within(nodo).getByRole('button', { name: 'Uñas' })

      const evento = new KeyboardEvent('keydown', { key: tecla, bubbles: true, cancelable: true })
      act(() => {
        objetivo.dispatchEvent(evento)
      })

      expect(escucha).toHaveBeenCalledTimes(llega ? 1 : 0)
      expect(evento.defaultPrevented).toBe(false)
      document.removeEventListener('keydown', escucha)
    })
  }
})
