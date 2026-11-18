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

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
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

describe('Nailbot por modo de build', () => {
  it('sin el flag conserva el HTML de la demo y usa el guion sin red', () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', '')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    expect(renderToString(<ChatNailbotSegunModo />)).toBe(renderToString(<ChatNailbot />))
    render(<ChatNailbotSegunModo />)
    const primerServicio = screen.getAllByRole('button')[0]
    const servicio = primerServicio.textContent
    expect(servicio).toBeTruthy()
    fireEvent.click(primerServicio)
    expect(screen.getByRole('log')).toHaveTextContent(servicio ?? '')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('las entradas reales conservan todo el flujo demo y referencias accesibles propias', () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', '')
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

describe('Nailbot con IA', () => {
  const urlApi = 'https://chat.example.test'
  const aviso = 'Hablas con un sistema de inteligencia artificial, no con una persona'

  function enviar(texto: string) {
    fireEvent.change(screen.getByRole('textbox', { name: 'Mensaje' }), { target: { value: texto } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
  }

  function respuesta(conversacionId: string, texto: string) {
    return new Response(JSON.stringify({ conversacionId, respuesta: texto, solicitud: null }))
  }

  it('envía el turno, anuncia la espera y mantiene el aviso y el ID entre turnos', async () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', urlApi)
    let resolver!: (valor: Response) => void
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolver = resolve
          }),
      )
      .mockResolvedValueOnce(respuesta('conv-1', 'Segunda respuesta'))
    vi.stubGlobal('fetch', fetch)
    render(<ChatNailbotSegunModo />)

    expect(screen.getByText('Asistente de IA')).toBeVisible()
    expect(screen.getByText(aviso)).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Mensaje' })).toHaveAttribute('maxlength', '1000')
    enviar('Hola')
    expect(screen.getByRole('status')).toHaveTextContent('Escribiendo…')
    expect(fetch).toHaveBeenCalledWith(
      urlApi + '/v1/chat',
      expect.objectContaining({ method: 'POST', body: '{"texto":"Hola"}' }),
    )
    await act(async () => {
      resolver(respuesta('conv-1', '<b>Primera respuesta</b>'))
    })
    expect(screen.getByText('<b>Primera respuesta</b>')).toBeVisible()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByText(aviso)).toBeVisible()

    enviar('Otra duda')
    expect(await screen.findByText('Segunda respuesta')).toBeVisible()
    expect(fetch).toHaveBeenLastCalledWith(
      urlApi + '/v1/chat',
      expect.objectContaining({ body: '{"texto":"Otra duda","conversacionId":"conv-1"}' }),
    )
  })

  it.each([
    { enlace: 'https://wa.me/123?text=hola', esperado: true },
    { enlace: 'https://wa.me.example.test/123', esperado: false },
  ])(
    'muestra únicamente enlaces de WhatsApp permitidos ($enlace)',
    async ({ enlace, esperado }) => {
      vi.stubEnv('VITE_NAILBOT_API_URL', urlApi)
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              conversacionId: 'conv-1',
              respuesta: 'Solicitud recibida',
              solicitud: { codigo: 'C-123', enlaceWhatsApp: enlace },
            }),
          ),
        ),
      )
      render(<ChatNailbotSegunModo />)
      enviar('Quiero cita')
      expect(await screen.findByText('Solicitud recibida', { exact: false })).toBeVisible()
      const vinculo = screen.queryByRole('link', { name: 'Enviar al salón por WhatsApp' })
      if (esperado) {
        expect(vinculo).toHaveAttribute('href', enlace)
        expect(screen.getByText('· C-123')).toBeVisible()
      } else {
        expect(vinculo).not.toBeInTheDocument()
        expect(screen.queryByText('· C-123')).not.toBeInTheDocument()
      }
    },
  )

  it.each([429, 503, 'red'])('ofrece el contacto del salón ante error %s', async (error) => {
    vi.stubEnv('VITE_NAILBOT_API_URL', urlApi)
    const fetch = vi.fn()
    if (typeof error === 'number') {
      fetch.mockResolvedValue(new Response('diagnóstico privado', { status: error }))
    } else {
      fetch.mockRejectedValue(new Error('diagnóstico privado'))
    }
    vi.stubGlobal('fetch', fetch)
    render(<ChatNailbotSegunModo />)
    enviar('Hola')
    const alerta = await screen.findByRole('alert')
    expect(within(alerta).getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^https:\/\/wa\.me\//),
    )
    expect(within(alerta).getByRole('link', { name: /\d/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/^tel:\+/),
    )
    expect(screen.queryByText('diagnóstico privado')).not.toBeInTheDocument()
    expect(screen.getByText(aviso)).toBeVisible()
  })

  it('impide mensajes vacíos, demasiado largos o solapados y cancela al desmontar', () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', urlApi)
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(() => new Promise(() => {}))
    vi.stubGlobal('fetch', fetch)
    const vista = render(<ChatNailbotSegunModo />)
    const input = screen.getByRole('textbox', { name: 'Mensaje' })
    const formulario = input.closest('form')!
    fireEvent.submit(formulario)
    fireEvent.change(input, { target: { value: 'a'.repeat(1001) } })
    fireEvent.submit(formulario)
    expect(fetch).not.toHaveBeenCalled()
    enviar('a'.repeat(1000))
    expect(fetch).toHaveBeenCalledTimes(1)
    fireEvent.change(input, { target: { value: 'No se solapa' } })
    fireEvent.submit(formulario)
    expect(fetch).toHaveBeenCalledTimes(1)
    const signal = fetch.mock.calls[0][1]?.signal
    expect(signal?.aborted).toBe(false)
    vista.unmount()
    expect(signal?.aborted).toBe(true)
  })

  it('cada instancia comienza sin el ID de la otra', async () => {
    vi.stubEnv('VITE_NAILBOT_API_URL', urlApi)
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
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(
      urlApi + '/v1/chat',
      expect.objectContaining({ body: '{"texto":"Hola"}' }),
    )
  })
})
