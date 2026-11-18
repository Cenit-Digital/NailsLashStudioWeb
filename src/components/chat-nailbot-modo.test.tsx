import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatNailbot } from './ChatNailbot'
import { ChatNailbotSegunModo } from './ChatNailbotSegunModo'
import { NailbotFlotante } from './NailbotFlotante'
import { Reserva } from './Reserva'
import {
  NAILBOT_AVISO,
  NAILBOT_ENLACE_FINAL,
  NAILBOT_LANZADOR_ETIQUETA,
  NAILBOT_OPCIONES,
  NAILBOT_SIN_NOMBRE,
} from '../lib/demo/nailbot-demo'

/**
 * Contrato: features/nailbot_ia.feature (issue #35, enmienda N-1bis/N-4bis). Los textos esperados son
 * literales escritos a mano (anti-tautología).
 */
const URL_API = 'https://chat.example.test'
const LEYENDA_IA = 'Hablas con un sistema de inteligencia artificial, no con una persona'
const LEYENDA_DEMO =
  'Demo · Nailbot responde con opciones predefinidas: no es una persona ni usa inteligencia artificial.'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function abrirLasDosEntradas() {
  render(
    <>
      <Reserva />
      <NailbotFlotante />
    </>,
  )
  fireEvent.click(screen.getByRole('button', { name: NAILBOT_LANZADOR_ETIQUETA }))
  return [
    within(screen.getByRole('region', { name: '¿Prefieres reservar por chat?' })),
    within(screen.getByRole('dialog')),
  ]
}

function escribir(texto: string) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Mensaje' }), { target: { value: texto } })
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
}

function respuesta(conversacionId: string, texto: string, solicitud: unknown = null) {
  return new Response(JSON.stringify({ conversacionId, respuesta: texto, solicitud }))
}

describe.each([
  ['cadena vacía', ''],
  ['sin definir', undefined],
])('Nailbot SIN la variable del build (@s1, %s)', (_nombre, valor) => {
  it('monta el guion local: mismo HTML que ChatNailbot, sin ninguna señal de IA y sin red', () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', valor)
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    expect(renderToString(<ChatNailbotSegunModo />)).toBe(renderToString(<ChatNailbot />))
    render(<ChatNailbotSegunModo />)
    expect(screen.getByText(LEYENDA_DEMO)).toBeVisible()
    expect(screen.getByText('Asistente automático · demo')).toBeVisible()
    expect(screen.queryByText('Asistente de IA')).not.toBeInTheDocument()
    expect(screen.queryByText(LEYENDA_IA)).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    const primerServicio = screen.getAllByRole('button')[0]
    const servicio = primerServicio.textContent ?? ''
    expect(servicio).not.toBe('')
    fireEvent.click(primerServicio)
    expect(screen.getByRole('log')).toHaveTextContent(servicio)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('las dos entradas reales conservan todo el flujo demo y referencias accesibles propias', () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', valor)
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const paneles = abrirLasDosEntradas()
    const vinculos = paneles.map((panel) => {
      for (const nombre of [
        NAILBOT_OPCIONES.servicio[0],
        NAILBOT_OPCIONES.dia[0],
        NAILBOT_OPCIONES.franja[0],
        NAILBOT_SIN_NOMBRE,
      ]) {
        fireEvent.click(panel.getByRole('button', { name: nombre }))
      }
      const enlace = panel.getByRole('link', { name: NAILBOT_ENLACE_FINAL })
      expect(enlace).toHaveAccessibleDescription(NAILBOT_AVISO)
      return enlace
    })
    expect(vinculos[0].getAttribute('href')).toBe(vinculos[1].getAttribute('href'))
    expect(vinculos[0].getAttribute('aria-describedby')).not.toBe(
      vinculos[1].getAttribute('aria-describedby'),
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('Nailbot CON la variable del build (@s2)', () => {
  it('muestra la insignia y la línea fija desde antes del primer turno, y un campo acotado', () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
    render(<ChatNailbotSegunModo />)
    expect(screen.getByText('Asistente de IA')).toBeVisible()
    expect(screen.queryByText('Asistente automático · demo')).not.toBeInTheDocument()
    expect(screen.getByText(LEYENDA_IA)).toBeVisible()
    expect(screen.queryByText(LEYENDA_DEMO)).not.toBeInTheDocument()
    const campo = screen.getByRole('textbox', { name: 'Mensaje' })
    expect(campo).toHaveAttribute('maxlength', '1000')
    expect(campo).toHaveAttribute('placeholder', 'Escribe tu pregunta…')
    expect(campo).toHaveAccessibleDescription(LEYENDA_IA)
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
    expect(screen.getByRole('log', { name: 'Conversación con Nailbot' })).toHaveAttribute(
      'aria-live',
      'polite',
    )
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByRole('log')).toBeEmptyDOMElement()
  })

  it('envía el turno a POST /v1/chat, anuncia «Escribiendo…» y pinta la respuesta como texto', async () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', `${URL_API}/`)
    let resolver!: (valor: Response) => void
    const fetch = vi.fn().mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolver = resolve
        }),
    )
    vi.stubGlobal('fetch', fetch)
    render(<ChatNailbotSegunModo />)
    escribir('  ¿Abrís el sábado?  ')
    expect(screen.getByRole('status')).toHaveTextContent('Escribiendo…')
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Mensaje' })).toHaveValue('')
    expect(screen.getByText('¿Abrís el sábado?')).toHaveAttribute('data-de', 'usuario')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      'https://chat.example.test/v1/chat',
      expect.objectContaining({ method: 'POST', body: '{"texto":"¿Abrís el sábado?"}' }),
    )
    await act(async () => {
      resolver(respuesta('conv-1', 'Aviso de IA\n\n<b>Sí, de 10:00 a 14:00</b>'))
    })
    const burbuja = screen.getByText('<b>Sí, de 10:00 a 14:00</b>', { exact: false })
    expect(burbuja).toHaveTextContent('Aviso de IA <b>Sí, de 10:00 a 14:00</b>')
    expect(burbuja.querySelector('b')).toBeNull()
    expect(burbuja).toHaveAttribute('data-de', 'bot')
    expect(burbuja).toHaveStyle({ whiteSpace: 'pre-line' })
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByText(LEYENDA_IA)).toBeVisible()
  })

  it('reenvía el identificador de conversación solo desde el segundo turno', async () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(respuesta('conv-1', 'Primera'))
      .mockResolvedValueOnce(respuesta('conv-1', 'Segunda'))
    vi.stubGlobal('fetch', fetch)
    render(<ChatNailbotSegunModo />)
    escribir('Hola')
    expect(await screen.findByText('Primera')).toBeVisible()
    escribir('Otra duda')
    expect(await screen.findByText('Segunda')).toBeVisible()
    expect(fetch.mock.calls.map((llamada) => llamada[1].body)).toEqual([
      '{"texto":"Hola"}',
      '{"texto":"Otra duda","conversacionId":"conv-1"}',
    ])
    expect(screen.getByText(LEYENDA_IA)).toBeVisible()
  })

  it('@s6 el identificador vive solo en memoria: ni storage ni cookies', async () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta('conv-1', 'Hola')))
    const guardar = vi.spyOn(Storage.prototype, 'setItem')
    const cookies = vi.spyOn(document, 'cookie', 'set')
    render(<ChatNailbotSegunModo />)
    escribir('Hola')
    expect(await screen.findByText('Hola', { selector: 'div[role="log"] div' })).toBeVisible()
    expect(guardar).not.toHaveBeenCalled()
    expect(cookies).not.toHaveBeenCalled()
    expect(window.localStorage.length).toBe(0)
    expect(window.sessionStorage.length).toBe(0)
  })

  it('no envía mensajes vacíos, en blanco, de más de 1000 caracteres ni solapados', () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(() => new Promise(() => {}))
    vi.stubGlobal('fetch', fetch)
    render(<ChatNailbotSegunModo />)
    const campo = screen.getByRole('textbox', { name: 'Mensaje' })
    const formulario = campo.closest('form')!
    // El envío nativo del formulario siempre se cancela (la página no se recarga), también el vacío.
    expect(fireEvent.submit(formulario)).toBe(false)
    fireEvent.change(campo, { target: { value: '   ' } })
    fireEvent.submit(formulario)
    fireEvent.change(campo, { target: { value: 'a'.repeat(1001) } })
    fireEvent.submit(formulario)
    expect(fetch).not.toHaveBeenCalled()
    fireEvent.change(campo, { target: { value: 'a'.repeat(1000) } })
    fireEvent.submit(formulario)
    expect(fetch).toHaveBeenCalledTimes(1)
    fireEvent.change(campo, { target: { value: 'No se solapa' } })
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
    fireEvent.submit(formulario)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('al desmontar cancela la petición en vuelo y no vuelve al guion', async () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
    const fetch = vi.fn((_url: string, init: RequestInit) => {
      return new Promise<Response>((_resolve, rechazar) => {
        init.signal?.addEventListener('abort', () => rechazar(new Error('abortado')))
      })
    })
    vi.stubGlobal('fetch', fetch)
    const vista = render(<ChatNailbotSegunModo />)
    escribir('Hola')
    const senal = fetch.mock.calls[0][1].signal
    expect(senal?.aborted).toBe(false)
    vista.unmount()
    expect(senal?.aborted).toBe(true)
    await act(async () => {})
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('desmontar sin ninguna petición en vuelo no lanza ni deja errores', () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
    const errores = vi.fn()
    window.addEventListener('error', errores)
    const vista = render(<ChatNailbotSegunModo />)
    expect(() => vista.unmount()).not.toThrow()
    window.removeEventListener('error', errores)
    expect(errores).not.toHaveBeenCalled()
  })

  it('el hilo baja hasta el último mensaje tras cada turno', async () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta('conv-1', 'Hola')))
    render(<ChatNailbotSegunModo />)
    const hilo = screen.getByRole('log')
    Object.defineProperty(hilo, 'scrollHeight', { configurable: true, value: 480 })
    expect(hilo.scrollTop).toBe(0)
    escribir('Hola')
    expect(hilo.scrollTop).toBe(480)
    Object.defineProperty(hilo, 'scrollHeight', { configurable: true, value: 960 })
    await act(async () => {})
    expect(hilo.scrollTop).toBe(960)
  })

  it('cada instancia tiene su propia conversación', async () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(respuesta('conv-1', 'Primera instancia'))
      .mockResolvedValueOnce(respuesta('conv-2', 'Segunda instancia'))
    vi.stubGlobal('fetch', fetch)
    const [reserva, dialogo] = abrirLasDosEntradas()
    for (const [panel, mensaje] of [
      [reserva, 'Primera instancia'],
      [dialogo, 'Segunda instancia'],
    ] as const) {
      fireEvent.change(panel.getByRole('textbox', { name: 'Mensaje' }), {
        target: { value: 'Hola' },
      })
      fireEvent.click(panel.getByRole('button', { name: 'Enviar' }))
      expect(await panel.findByText(mensaje)).toBeVisible()
    }
    expect(fetch.mock.calls.map((llamada) => llamada[1].body)).toEqual([
      '{"texto":"Hola"}',
      '{"texto":"Hola"}',
    ])
  })
})

describe('Nailbot con IA: solicitud (@s3)', () => {
  it.each([
    { enlace: 'https://wa.me/34600000000?text=hola', visible: true },
    { enlace: 'https://wa.me.example.test/1', visible: false },
    { enlace: 'http://wa.me/1', visible: false },
    { enlace: 'javascript:alert(1)', visible: false },
  ])(
    'con el enlace $enlace, el enlace de WhatsApp visible es $visible',
    async ({ enlace, visible }) => {
      vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValue(
            respuesta('conv-1', 'Solicitud recibida', { codigo: 'C1D2E3', enlaceWhatsApp: enlace }),
          ),
      )
      render(<ChatNailbotSegunModo />)
      escribir('Quiero cita')
      expect(await screen.findByText('Solicitud recibida', { exact: false })).toBeVisible()
      const vinculo = screen.queryByRole('link', { name: 'Enviar al salón por WhatsApp' })
      if (visible) {
        expect(vinculo).toHaveAttribute('href', enlace)
        expect(screen.getByText('· C1D2E3', { exact: false })).toBeVisible()
      } else {
        expect(vinculo).not.toBeInTheDocument()
        expect(screen.queryByText('C1D2E3', { exact: false })).not.toBeInTheDocument()
      }
    },
  )
})

describe('Nailbot con IA: fallo y vuelta al guion local (@s4)', () => {
  async function fallar(fetch: ReturnType<typeof vi.fn>) {
    vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
    vi.stubGlobal('fetch', fetch)
    render(<ChatNailbotSegunModo />)
    escribir('Hola')
    return screen.findByRole('alert')
  }

  it.each([
    ['429', () => vi.fn().mockResolvedValue(new Response('traza privada', { status: 429 }))],
    ['500', () => vi.fn().mockResolvedValue(new Response('traza privada', { status: 500 }))],
    ['503', () => vi.fn().mockResolvedValue(new Response('traza privada', { status: 503 }))],
    [
      '404 (conversación caducada)',
      () => vi.fn().mockResolvedValue(new Response('{}', { status: 404 })),
    ],
    ['fallo de red', () => vi.fn().mockRejectedValue(new Error('traza privada'))],
    ['cuerpo inválido', () => vi.fn().mockResolvedValue(new Response('{"respuesta":7}'))],
  ])('ante %s vuelve al guion local con el contacto del salón', async (_caso, crear) => {
    const alerta = await fallar(crear())
    expect(alerta).toHaveTextContent(
      'El asistente de IA no está disponible ahora. Puedes seguir con este guion, escribirnos por WhatsApp o llamar al 625 22 33 66.',
    )
    expect(within(alerta).getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/34625223366?text=Hola%2C%20quiero%20consultar%20una%20cita.',
    )
    expect(within(alerta).getByRole('link', { name: '625 22 33 66' })).toHaveAttribute(
      'href',
      'tel:+34625223366',
    )
    expect(screen.queryByText('traza privada', { exact: false })).not.toBeInTheDocument()
    // El guion local de N-1: leyenda de demo, opciones cerradas y ningún campo de texto libre.
    expect(screen.getByText(LEYENDA_DEMO)).toBeVisible()
    expect(screen.queryByText(LEYENDA_IA)).not.toBeInTheDocument()
    expect(screen.queryByText('Asistente de IA')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: NAILBOT_OPCIONES.servicio[0] }))
    expect(screen.getByRole('log')).toHaveTextContent(NAILBOT_OPCIONES.servicio[0])
  })

  it('no sigue llamando a la API una vez en el guion local', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('red'))
    await fallar(fetch)
    fireEvent.click(screen.getByRole('button', { name: NAILBOT_OPCIONES.servicio[0] }))
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('una conversación que ya llevaba turnos también vuelve al guion si el siguiente falla', async () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(respuesta('conv-1', 'Primera'))
        .mockResolvedValueOnce(new Response('{}', { status: 404 })),
    )
    render(<ChatNailbotSegunModo />)
    escribir('Hola')
    expect(await screen.findByText('Primera')).toBeVisible()
    escribir('Sigo aquí')
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.queryByText('Primera')).not.toBeInTheDocument()
  })
})

describe('Nailbot con IA: plazo (@s5)', () => {
  it('si la API no responde en 75 s vuelve al guion local', async () => {
    vi.useFakeTimers()
    vi.stubEnv('VITE_NAILBOT_API_URL', URL_API)
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) => {
        return new Promise<Response>((_resolve, rechazar) => {
          init.signal?.addEventListener('abort', () => rechazar(new Error('abortado')))
        })
      }),
    )
    render(<ChatNailbotSegunModo />)
    escribir('Hola')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(74_999)
    })
    expect(screen.getByRole('status')).toHaveTextContent('Escribiendo…')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('alert')).toHaveTextContent('El asistente de IA no está disponible')
    expect(screen.getByText(LEYENDA_DEMO)).toBeVisible()
  })
})
