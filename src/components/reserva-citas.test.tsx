import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { HelmetProvider } from 'react-helmet-async'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Home from '../pages/home'
import { MenuNavegacion } from './MenuNavegacion'
import { ReservaCitas } from './ReservaCitas'

/**
 * Citas · Fase 7 (issue #39): el modal «Reserva tu cita» (contrato features/reserva_citas.feature).
 * La red es un doble (`pedir`); Turnstile, un doble de `window.turnstile` que da el token al momento.
 * Lo que solo se ve en un navegador real (pantalla completa a 390 px, 44 px) se mide en las capturas.
 */
const ENTORNO = { VITE_CITAS_API: 'https://citas.example.org' }
const CLAVE_A = '0b8f9a52-6f1e-4c3a-9d2b-1a2b3c4d5e6f'
const CLAVE_B = '1c8f9a52-6f1e-4c3a-9d2b-1a2b3c4d5e6f'
const P5 = 'No hemos podido completar la reserva. Inténtalo de nuevo o llámanos al 625 22 33 66.'

const DIAS = [
  { fecha: '2026-11-03', estado: 'disponible' },
  { fecha: '2026-11-04', estado: 'completo' },
  { fecha: '2026-11-08', estado: 'cerrado' },
]
const HORAS = [
  { hora: '10:00', inicio: '2026-11-03T09:00:00.000Z', fin: '2026-11-03T10:00:00.000Z' },
  { hora: '10:30', inicio: '2026-11-03T09:30:00.000Z', fin: '2026-11-03T10:30:00.000Z' },
]

function json(status: number, cuerpo?: unknown): Response {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), { status })
}

/** Un backend de pega: /dias y /horas fijos; /reservas responde lo que diga la cola `reservas`. */
function backend(reservas: (() => Response)[]) {
  return vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async (url) => {
    if (url.includes('/dias')) return json(200, { dias: DIAS })
    if (url.includes('/horas')) return json(200, { horas: HORAS })
    const siguiente = reservas.shift()
    if (siguiente === undefined) throw new Error('sin respuesta')
    return siguiente()
  })
}

function montar(pedir = backend([]), claves = [CLAVE_A, CLAVE_B]) {
  const crearClave = vi.fn(() => claves.shift() ?? 'sin-clave')
  render(
    <>
      <a href="#reserva-titulo" data-reserva-citas>
        Reservar
      </a>
      <a href="#reserva-titulo" data-reserva-citas>
        Reservar cita
      </a>
      <a href="#reserva-titulo">Reserva</a>
      <ReservaCitas entorno={ENTORNO} pedir={pedir} crearClave={crearClave} />
    </>,
  )
  return { pedir, crearClave }
}

function dialogo(): HTMLDialogElement {
  return screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement
}

async function hastaElResumen(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.click(screen.getByRole('link', { name: 'Reservar' }))
  const d = within(dialogo())
  await usuario.click(d.getByRole('button', { name: 'Manicura' }))
  await usuario.click(
    d.getByRole('button', { name: 'Manicura Completa con Base Proteínica (Técnica Rusa)' }),
  )
  await usuario.click(d.getByRole('button', { name: 'Uña Mediana · 29 € · 1 h' }))
  await usuario.click(d.getByRole('button', { name: 'Continuar' }))
  await usuario.click(await d.findByRole('button', { name: /mar 3 nov/ }))
  await usuario.click(d.getByRole('button', { name: 'Continuar' }))
  await usuario.click(await d.findByRole('button', { name: '10:00' }))
  await usuario.click(d.getByRole('button', { name: 'Continuar' }))
  await usuario.type(d.getByLabelText('Nombre'), 'Ana')
  await usuario.type(d.getByLabelText('Teléfono'), '625223366')
  await usuario.type(d.getByLabelText('Email'), 'ana@mail.es')
  await usuario.click(d.getByRole('button', { name: 'Revisar la cita' }))
  await d.findByRole('heading', { name: 'Revisa tu cita' })
}

function cuerposDeReserva(pedir: ReturnType<typeof backend>) {
  return pedir.mock.calls
    .filter(([url]) => url.endsWith('/reservas'))
    .map(([, init]) => JSON.parse(String((init as RequestInit | undefined)?.body)))
}

let tokens = 0
beforeEach(() => {
  tokens = 0
  window.turnstile = {
    render: (_caja, opciones) => {
      tokens += 1
      opciones.callback(`tok-${tokens}`)
      return `w${tokens}`
    },
    remove: vi.fn(),
  }
})

afterEach(() => {
  delete window.turnstile
  document.head
    .querySelectorAll('script[src*="challenges.cloudflare.com"]')
    .forEach((s) => s.remove())
})

describe('@s4 @s29 sin host (o en el HTML horneado) no hay modal: los botones siguen siendo enlaces', () => {
  it('sin VITE_CITAS_API no se monta nada y el clic no se intercepta', () => {
    render(
      <>
        <a href="#reserva-titulo" data-reserva-citas>
          Reservar
        </a>
        <ReservaCitas entorno={{}} pedir={backend([])} />
      </>,
    )
    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull()
    const clic = new MouseEvent('click', { bubbles: true, cancelable: true })
    screen.getByRole('link', { name: 'Reservar' }).dispatchEvent(clic)
    expect(clic.defaultPrevented).toBe(false)
  })

  it('el prerender no hornea el modal, aun con host', () => {
    expect(renderToString(<ReservaCitas entorno={ENTORNO} pedir={backend([])} />)).toBe('')
  })

  it('«Reservar» de la cabecera y «Reservar cita» del hero llevan data-reserva-citas; «Reserva» de la nav no', () => {
    const nav = renderToString(<MenuNavegacion />)
    expect(nav).toMatch(
      /<a [^>]*href="#reserva-titulo" data-reserva-citas="true"[^>]*>Reservar<\/a>/,
    )
    expect(nav).toMatch(/<a href="#reserva-titulo">Reserva<\/a>/)
    const home = renderToString(
      <HelmetProvider>
        <Home />
      </HelmetProvider>,
    )
    expect(home).toMatch(
      /<a class="demo-btn demo-btn--solido" href="#reserva-titulo" data-reserva-citas="true">Reservar cita<\/a>/,
    )
    expect(home.match(/data-reserva-citas/g)).toHaveLength(2)
  })
})

describe('@s1-@s5 entrada y salida', () => {
  it('@s1 «Reservar» abre «Reserva tu cita» con el foco en el título y «Paso 1 de 4»', async () => {
    const usuario = userEvent.setup()
    montar()
    await usuario.click(screen.getByRole('link', { name: 'Reservar' }))
    expect(dialogo()).toHaveAttribute('open')
    const titulo = screen.getByRole('heading', { name: 'Reserva tu cita' })
    expect(titulo).toHaveFocus()
    expect(within(dialogo()).getByText('Paso 1 de 4')).toBeInTheDocument()
    expect(within(dialogo()).getByRole('heading', { name: 'Servicio' })).toBeInTheDocument()
  })

  it('@s2 «Reservar cita» abre el mismo modal y el clic no desplaza la página', () => {
    montar()
    const clic = new MouseEvent('click', { bubbles: true, cancelable: true })
    act(() => {
      screen.getByRole('link', { name: 'Reservar cita' }).dispatchEvent(clic)
    })
    expect(clic.defaultPrevented).toBe(true)
    expect(dialogo()).toHaveAttribute('open')
  })

  it('@s3 «Reserva» de la nav no abre ningún diálogo', async () => {
    const usuario = userEvent.setup()
    montar()
    await usuario.click(screen.getByRole('link', { name: 'Reserva' }))
    expect(dialogo()).not.toHaveAttribute('open')
  })

  it('@s5 cerrar con × devuelve el foco y al reabrir empieza en «Servicio»', async () => {
    const usuario = userEvent.setup()
    montar()
    const reservar = screen.getByRole('link', { name: 'Reservar' })
    await usuario.click(reservar)
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Manicura' }))
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Cerrar' }))
    expect(dialogo()).not.toHaveAttribute('open')
    expect(reservar).toHaveFocus()
    await usuario.click(reservar)
    expect(within(dialogo()).getByRole('button', { name: 'Manicura' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('@s5 cerrar con Escape (el navegador cierra el <dialog>) devuelve el foco a «Reservar cita»', async () => {
    const usuario = userEvent.setup()
    montar()
    const hero = screen.getByRole('link', { name: 'Reservar cita' })
    await usuario.click(hero)
    act(() => dialogo().close())
    expect(dialogo()).not.toHaveAttribute('open')
    expect(hero).toHaveFocus()
  })
})

describe('@s7-@s16 pasos «Servicio», «Día» y «Hora»', () => {
  it('@s9-@s10 aviso provisional y «Continuar» desactivado sin opción', async () => {
    const usuario = userEvent.setup()
    montar()
    await usuario.click(screen.getByRole('link', { name: 'Reservar' }))
    const d = within(dialogo())
    expect(
      d.getByText('Precios y duraciones orientativos, pendientes de confirmar con el salón'),
    ).toBeInTheDocument()
    await usuario.click(d.getByRole('button', { name: 'Manicura' }))
    await usuario.click(
      d.getByRole('button', { name: 'Manicura Completa con Base Proteínica (Técnica Rusa)' }),
    )
    expect(d.getByText('Selecciona el largo de tu uña:')).toBeInTheDocument()
    expect(d.queryByRole('button', { name: /Uña Extra Larga/ })).toBeNull()
    expect(d.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('@s11-@s16 los días y las horas salen de la API; «Cerrado» y «Completo» desactivados', async () => {
    const usuario = userEvent.setup()
    const { pedir } = montar()
    await usuario.click(screen.getByRole('link', { name: 'Reservar' }))
    const d = within(dialogo())
    await usuario.click(d.getByRole('button', { name: 'Manicura' }))
    await usuario.click(
      d.getByRole('button', { name: 'Manicura Completa con Base Proteínica (Técnica Rusa)' }),
    )
    await usuario.click(d.getByRole('button', { name: 'Uña Mediana · 29 € · 1 h' }))
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    expect(await d.findByRole('button', { name: /mié 4 nov Completo/ })).toBeDisabled()
    expect(d.getByRole('button', { name: /dom 8 nov Cerrado/ })).toBeDisabled()
    const martes = d.getByRole('button', { name: /mar 3 nov/ })
    await usuario.click(martes)
    expect(martes).toHaveAttribute('aria-pressed', 'true')
    expect(pedir).toHaveBeenCalledWith('https://citas.example.org/dias?opcion=manicura-rusa-m')
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    expect(await d.findByRole('button', { name: '10:30' })).toBeInTheDocument()
    expect(pedir).toHaveBeenCalledWith(
      'https://citas.example.org/horas?opcion=manicura-rusa-m&fecha=2026-11-03',
    )
  })

  it('si /dias falla: aviso, «Reintentar» que vuelve a pedir y enlace para llamar', async () => {
    const usuario = userEvent.setup()
    let fallos = 1
    const pedir = vi.fn(async (url: string) => {
      if (url.includes('/dias') && fallos-- > 0) throw new Error('red')
      return json(200, { dias: DIAS })
    })
    montar(pedir as unknown as ReturnType<typeof backend>)
    await usuario.click(screen.getByRole('link', { name: 'Reservar' }))
    const d = within(dialogo())
    await usuario.click(d.getByRole('button', { name: 'Manicura' }))
    await usuario.click(
      d.getByRole('button', { name: 'Manicura Completa con Base Proteínica (Técnica Rusa)' }),
    )
    await usuario.click(d.getByRole('button', { name: 'Uña Mediana · 29 € · 1 h' }))
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    expect(
      await d.findByText(
        'No hemos podido cargar los días disponibles. Inténtalo de nuevo o llámanos al 625 22 33 66.',
      ),
    ).toBeInTheDocument()
    expect(d.getByRole('link', { name: 'Llamar al estudio' })).toHaveAttribute(
      'href',
      'tel:+34625223366',
    )
    await usuario.click(d.getByRole('button', { name: 'Reintentar' }))
    expect(await d.findByRole('button', { name: /mar 3 nov/ })).toBeInTheDocument()
  })
})

describe('@s17-@s19 «Tus datos» y el resumen', () => {
  it('@s17-@s18 solo tres campos obligatorios, el aviso de privacidad y los mensajes junto al campo', async () => {
    const usuario = userEvent.setup()
    montar()
    await hastaElResumen(usuario)
    const d = within(dialogo())
    await usuario.click(d.getByRole('button', { name: 'Atrás' }))
    const email = d.getByLabelText('Email')
    // Ningún campo de texto libre: solo los tres inputs.
    expect(dialogo().querySelectorAll('input, textarea, select')).toHaveLength(3)
    expect(email).toBeRequired()
    expect(d.getByLabelText('Nombre')).toBeRequired()
    expect(d.getByLabelText('Teléfono')).toBeRequired()
    expect(
      d.getByText(/Responsable: Nails Lash Studio\. Finalidad: gestionar tu cita/),
    ).toBeInTheDocument()
    await usuario.clear(email)
    await usuario.type(email, 'ana@')
    await usuario.click(d.getByRole('button', { name: 'Revisar la cita' }))
    expect(email).toHaveAccessibleDescription('Escribe un email válido, como ana@mail.es')
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(d.getByRole('heading', { name: 'Tus datos' })).toBeInTheDocument()
  })

  it('@s19 el resumen con servicio, día, horas, duración y precio', async () => {
    const usuario = userEvent.setup()
    montar()
    await hastaElResumen(usuario)
    const d = within(dialogo())
    expect(
      d.getByText('Manicura · Manicura Completa con Base Proteínica (Técnica Rusa) (Uña Mediana)'),
    ).toBeInTheDocument()
    expect(d.getByText('martes 3 de noviembre')).toBeInTheDocument()
    expect(d.getByText('10:00 – 11:00')).toBeInTheDocument()
    expect(d.getByText('1 h')).toBeInTheDocument()
    expect(d.getByText('29 €')).toBeInTheDocument()
    expect(d.getByRole('button', { name: 'Confirmar cita' })).toBeEnabled()
  })
})

describe('@s20-@s25 confirmar', () => {
  it('@s20 201 → «¡Cita confirmada!» con el aviso del email; el cuerpo es el del contrato', async () => {
    const usuario = userEvent.setup()
    const { pedir } = montar(
      backend([() => json(201, { cita: { opcion: 'manicura-rusa-m', inicio: 'i', fin: 'f' } })]),
    )
    await hastaElResumen(usuario)
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Confirmar cita' }))
    const d = within(dialogo())
    expect(await d.findByRole('heading', { name: '¡Cita confirmada!' })).toBeInTheDocument()
    expect(
      d.getByText(
        'Te hemos enviado un email de confirmación a ana@mail.es. Para cancelarla o cambiarla, llámanos al 625 22 33 66.',
      ),
    ).toBeInTheDocument()
    expect(cuerposDeReserva(pedir)).toEqual([
      {
        opcion: 'manicura-rusa-m',
        inicio: '2026-11-03T09:00:00.000Z',
        nombre: 'Ana',
        telefono: '625223366',
        email: 'ana@mail.es',
        clave: CLAVE_A,
        turnstile: 'tok-1',
      },
    ])
  })

  it('@s24 el doble clic envía una sola petición', async () => {
    const usuario = userEvent.setup()
    let responder: (r: Response) => void = () => {}
    const pedir = backend([() => json(201, { cita: { opcion: 'o', inicio: 'i', fin: 'f' } })])
    pedir.mockImplementation(async (url: string) => {
      if (url.includes('/dias')) return json(200, { dias: DIAS })
      if (url.includes('/horas')) return json(200, { horas: HORAS })
      return new Promise<Response>((r) => (responder = r))
    })
    montar(pedir)
    await hastaElResumen(usuario)
    const confirmar = within(dialogo()).getByRole('button', { name: 'Confirmar cita' })
    fireEvent.click(confirmar)
    fireEvent.click(confirmar)
    expect(cuerposDeReserva(pedir)).toHaveLength(1)
    await act(async () => responder(json(201, { cita: { opcion: 'o', inicio: 'i', fin: 'f' } })))
  })

  it('@s22 409 → vuelve a «Hora» con el aviso y vuelve a pedir las horas', async () => {
    const usuario = userEvent.setup()
    const { pedir } = montar(backend([() => json(409, { codigo: 'hora-ocupada' })]))
    await hastaElResumen(usuario)
    const pedidasAntes = pedir.mock.calls.filter(([u]) => u.includes('/horas')).length
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Confirmar cita' }))
    const d = within(dialogo())
    expect(
      await d.findByText('Esa hora acaba de ocuparse. Elige otra, por favor.'),
    ).toBeInTheDocument()
    expect(d.getByRole('heading', { name: 'Hora' })).toBeInTheDocument()
    await d.findByRole('button', { name: '10:00' })
    expect(pedir.mock.calls.filter(([u]) => u.includes('/horas')).length).toBe(pedidasAntes + 1)
    expect(d.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('@s25 503 → P5, «Reintentar» con la misma clave y un token nuevo, enlace para llamar y nada de chat', async () => {
    const usuario = userEvent.setup()
    const { pedir } = montar(
      backend([
        () => json(503, { codigo: 'servicio-no-disponible' }),
        () => json(201, { cita: { opcion: 'o', inicio: 'i', fin: 'f' } }),
      ]),
    )
    await hastaElResumen(usuario)
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Confirmar cita' }))
    const d = within(dialogo())
    expect(await d.findByText(P5)).toBeInTheDocument()
    expect(d.getByRole('link', { name: 'Llamar al estudio' })).toHaveAttribute(
      'href',
      'tel:+34625223366',
    )
    expect(dialogo().innerHTML).not.toMatch(/chat|whatsapp|#reserva-titulo/i)
    await usuario.click(d.getByRole('button', { name: 'Reintentar' }))
    await d.findByRole('heading', { name: '¡Cita confirmada!' })
    const [primera, segunda] = cuerposDeReserva(pedir)
    expect(segunda.clave).toBe(primera.clave)
    expect(primera.turnstile).toBe('tok-1')
    expect(segunda.turnstile).toBe('tok-2')
  })

  it('400 de un campo → vuelve a «Tus datos» con su mensaje', async () => {
    const usuario = userEvent.setup()
    montar(backend([() => json(400, { codigo: 'peticion-invalida', campo: 'email' })]))
    await hastaElResumen(usuario)
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Confirmar cita' }))
    const d = within(dialogo())
    await d.findByRole('heading', { name: 'Tus datos' })
    expect(d.getByLabelText('Email')).toHaveAccessibleDescription(
      'Escribe un email válido, como ana@mail.es',
    )
  })

  it('403 de verificación → su aviso y «Reintentar»', async () => {
    const usuario = userEvent.setup()
    montar(backend([() => json(403, { codigo: 'verificacion' })]))
    await hastaElResumen(usuario)
    await usuario.click(within(dialogo()).getByRole('button', { name: 'Confirmar cita' }))
    const d = within(dialogo())
    expect(
      await d.findByText('No hemos podido comprobar que no eres un robot. Vuelve a intentarlo.'),
    ).toBeInTheDocument()
    expect(d.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})

describe('revisión: foco, token, reserva en vuelo y listas vacías', () => {
  it('Ctrl-clic o Mayús-clic en «Reservar» siguen siendo del navegador', () => {
    montar()
    for (const tecla of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }]) {
      const clic = new MouseEvent('click', { bubbles: true, cancelable: true, ...tecla })
      screen.getByRole('link', { name: 'Reservar' }).dispatchEvent(clic)
      expect(clic.defaultPrevented).toBe(false)
    }
    expect(dialogo()).not.toHaveAttribute('open')
  })

  it('al cambiar de paso el foco va al encabezado del paso', async () => {
    const usuario = userEvent.setup()
    montar()
    await usuario.click(screen.getByRole('link', { name: 'Reservar' }))
    const d = within(dialogo())
    await usuario.click(d.getByRole('button', { name: 'Manicura' }))
    await usuario.click(
      d.getByRole('button', { name: 'Manicura Completa con Base Proteínica (Técnica Rusa)' }),
    )
    await usuario.click(d.getByRole('button', { name: 'Uña Mediana · 29 € · 1 h' }))
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    expect(d.getByRole('heading', { name: 'Día' })).toHaveFocus()
  })

  it('«Revisar la cita» con errores lleva el foco al primer campo inválido', async () => {
    const usuario = userEvent.setup()
    montar()
    await hastaElResumen(usuario)
    const d = within(dialogo())
    await usuario.click(d.getByRole('button', { name: 'Atrás' }))
    await usuario.clear(d.getByLabelText('Teléfono'))
    await usuario.click(d.getByRole('button', { name: 'Revisar la cita' }))
    expect(d.getByLabelText('Teléfono')).toHaveFocus()
  })

  it('volver del resumen y regresar pide un token nuevo (el anterior puede haber caducado)', async () => {
    const usuario = userEvent.setup()
    const { pedir } = montar(
      backend([() => json(201, { cita: { opcion: 'o', inicio: 'i', fin: 'f' } })]),
    )
    await hastaElResumen(usuario)
    const d = within(dialogo())
    await usuario.click(d.getByRole('button', { name: 'Atrás' }))
    await usuario.click(d.getByRole('button', { name: 'Revisar la cita' }))
    await usuario.click(await d.findByRole('button', { name: 'Confirmar cita' }))
    await d.findByRole('heading', { name: '¡Cita confirmada!' })
    expect(cuerposDeReserva(pedir)[0].turnstile).toBe('tok-2')
  })

  it('con una reserva en vuelo no se puede cerrar el modal', async () => {
    const usuario = userEvent.setup()
    let responder: (r: Response) => void = () => {}
    const pedir = backend([])
    pedir.mockImplementation(async (url: string) => {
      if (url.includes('/dias')) return json(200, { dias: DIAS })
      if (url.includes('/horas')) return json(200, { horas: HORAS })
      return new Promise<Response>((r) => (responder = r))
    })
    montar(pedir)
    await hastaElResumen(usuario)
    const d = within(dialogo())
    await usuario.click(d.getByRole('button', { name: 'Confirmar cita' }))
    expect(d.getByRole('button', { name: 'Cerrar' })).toBeDisabled()
    expect(d.getByText('Enviando tu reserva…')).toBeInTheDocument()
    const cancelar = new Event('cancel', { cancelable: true })
    act(() => {
      dialogo().dispatchEvent(cancelar)
    })
    expect(cancelar.defaultPrevented).toBe(true)
    await act(async () => responder(json(201, { cita: { opcion: 'o', inicio: 'i', fin: 'f' } })))
    expect(await d.findByRole('heading', { name: '¡Cita confirmada!' })).toBeInTheDocument()
  })

  it('un día sin horas lo dice', async () => {
    const usuario = userEvent.setup()
    const pedir = backend([])
    pedir.mockImplementation(async (url: string) =>
      url.includes('/dias') ? json(200, { dias: DIAS }) : json(200, { horas: [] }),
    )
    montar(pedir)
    await usuario.click(screen.getByRole('link', { name: 'Reservar' }))
    const d = within(dialogo())
    await usuario.click(d.getByRole('button', { name: 'Manicura' }))
    await usuario.click(
      d.getByRole('button', { name: 'Manicura Completa con Base Proteínica (Técnica Rusa)' }),
    )
    await usuario.click(d.getByRole('button', { name: 'Uña Mediana · 29 € · 1 h' }))
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    await usuario.click(await d.findByRole('button', { name: /mar 3 nov/ }))
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    expect(
      await d.findByText('No quedan horas libres este día. Elige otro, por favor.'),
    ).toBeInTheDocument()
  })

  it('una hora elegida que ya no se ofrece deja de estar elegida', async () => {
    const usuario = userEvent.setup()
    let horas = HORAS
    const pedir = backend([])
    pedir.mockImplementation(async (url: string) =>
      url.includes('/dias') ? json(200, { dias: DIAS }) : json(200, { horas }),
    )
    montar(pedir)
    await usuario.click(screen.getByRole('link', { name: 'Reservar' }))
    const d = within(dialogo())
    await usuario.click(d.getByRole('button', { name: 'Manicura' }))
    await usuario.click(
      d.getByRole('button', { name: 'Manicura Completa con Base Proteínica (Técnica Rusa)' }),
    )
    await usuario.click(d.getByRole('button', { name: 'Uña Mediana · 29 € · 1 h' }))
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    await usuario.click(await d.findByRole('button', { name: /mar 3 nov/ }))
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    await usuario.click(await d.findByRole('button', { name: '10:00' }))
    horas = HORAS.slice(1)
    await usuario.click(d.getByRole('button', { name: 'Atrás' }))
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    await d.findByRole('button', { name: '10:30' })
    await waitFor(() => expect(d.getByRole('button', { name: 'Continuar' })).toBeDisabled())
  })
})

describe('@s30 F-05 enmendada: Turnstile y la API solo bajo demanda', () => {
  it('nada se pide al montar; el script de Turnstile se inyecta al llegar a «Tus datos»', async () => {
    delete window.turnstile
    const usuario = userEvent.setup()
    const { pedir } = montar()
    expect(pedir).not.toHaveBeenCalled()
    const scripts = () =>
      document.head.querySelectorAll('script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]')
    await usuario.click(screen.getByRole('link', { name: 'Reservar' }))
    expect(pedir).not.toHaveBeenCalled()
    const d = within(dialogo())
    await usuario.click(d.getByRole('button', { name: 'Manicura' }))
    await usuario.click(
      d.getByRole('button', { name: 'Manicura Completa con Base Proteínica (Técnica Rusa)' }),
    )
    await usuario.click(d.getByRole('button', { name: 'Uña Mediana · 29 € · 1 h' }))
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    await usuario.click(await d.findByRole('button', { name: /mar 3 nov/ }))
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    await usuario.click(await d.findByRole('button', { name: '10:00' }))
    expect(scripts()).toHaveLength(0)
    await usuario.click(d.getByRole('button', { name: 'Continuar' }))
    await waitFor(() => expect(scripts()).toHaveLength(1))
  })

  it('el modal y su lógica no usan storage, cookies ni analítica', () => {
    for (const fichero of [
      'src/components/ReservaCitas.tsx',
      'src/components/ReservaCitasTurnstile.tsx',
      'src/lib/citas/cliente-api.ts',
      'src/lib/citas/flujo-reserva.ts',
      'src/lib/citas/turnstile.ts',
    ]) {
      const bytes = readFileSync(fichero, 'utf8')
      for (const prohibido of [
        'localStorage',
        'sessionStorage',
        'document.cookie',
        'gtag',
        'dataLayer',
      ]) {
        expect(bytes, `${fichero}: ${prohibido}`).not.toContain(prohibido)
      }
    }
  })
})
