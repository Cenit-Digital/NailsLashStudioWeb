// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { crearApp } from './app.ts'
import { candadoEnMemoria, GoogleEnMemoria } from './dobles.ts'
import { ErrorServicio } from './errores.ts'
import type { DependenciasReserva } from './reservar.ts'

const ORIGEN = 'https://cenit-digital.github.io'
const CLAVE = '0f8fad5b-d9cb-469f-a165-70867728950e'

function montar() {
  const google = new GoogleEnMemoria(['trabajadora-1', 'trabajadora-2'])
  const verificarTurnstile = vi.fn(async () => true)
  const avisar = vi.fn()
  const deps: DependenciasReserva = {
    google,
    candado: candadoEnMemoria(),
    calendarios: ['trabajadora-1', 'trabajadora-2'],
    verificarTurnstile,
    ahora: () => new Date('2026-10-30T10:00:00.000Z'),
    emailSalon: 'salon@nails.es',
    avisar,
  }
  return { app: crearApp(deps), google, verificarTurnstile, avisar }
}

function cuerpo(cambios: Record<string, unknown> = {}) {
  return {
    opcion: 'manicura-rusa-m',
    inicio: '2026-11-03T09:00:00.000Z',
    nombre: 'Ana',
    telefono: '611 22 33 44',
    email: 'ana@mail.es',
    clave: CLAVE,
    turnstile: 'token',
    ...cambios,
  }
}

function post(datos: unknown, cabeceras: Record<string, string> = {}): RequestInit {
  return {
    method: 'POST',
    headers: { origin: ORIGEN, 'content-type': 'application/json', ...cabeceras },
    body: typeof datos === 'string' ? datos : JSON.stringify(datos),
  }
}

describe('GET /salud', () => {
  it('responde 200 sin Origin (sondas del clúster)', async () => {
    const { app } = montar()
    const respuesta = await app.request('/salud')
    expect(respuesta.status).toBe(200)
    expect(await respuesta.json()).toEqual({ ok: true })
  })
})

describe('@s28: solo atiende a la web', () => {
  it.each([
    ['otro origen', { origin: 'https://evil.example' }],
    ['el origen con barra final', { origin: 'https://cenit-digital.github.io/' }],
    ['sin Origin', {}],
  ])('rechaza %s con 403 y sin cabeceras CORS', async (_caso, cabeceras) => {
    const { app, google } = montar()
    const respuesta = await app.request('/reservas', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...cabeceras },
      body: JSON.stringify(cuerpo()),
    })
    expect(respuesta.status).toBe(403)
    expect(await respuesta.json()).toEqual({ codigo: 'origen' })
    expect(respuesta.headers.get('access-control-allow-origin')).toBeNull()
    expect(google.eventos).toEqual([])
  })

  it('rechaza también las consultas de disponibilidad de otro origen', async () => {
    const { app } = montar()
    const respuesta = await app.request('/dias?opcion=manicura-rusa-m', {
      headers: { origin: 'https://evil.example' },
    })
    expect(respuesta.status).toBe(403)
  })

  it('al origen de la web le responde con CORS exacto a ese origen', async () => {
    const { app } = montar()
    const respuesta = await app.request('/dias?opcion=manicura-rusa-m', {
      headers: { origin: ORIGEN },
    })
    expect(respuesta.status).toBe(200)
    expect(respuesta.headers.get('access-control-allow-origin')).toBe(ORIGEN)
  })

  it('el preflight de POST /reservas permite POST y Content-Type', async () => {
    const { app } = montar()
    const respuesta = await app.request('/reservas', {
      method: 'OPTIONS',
      headers: {
        origin: ORIGEN,
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    })
    expect(respuesta.status).toBe(204)
    expect(respuesta.headers.get('access-control-allow-origin')).toBe(ORIGEN)
    expect(respuesta.headers.get('access-control-allow-methods')).toBe('GET,POST')
    expect(respuesta.headers.get('access-control-allow-headers')).toBe('Content-Type')
    expect(respuesta.headers.get('access-control-max-age')).toBe('600')
  })
})

describe('GET /dias', () => {
  it('devuelve los 30 días con el reloj del servidor y consulta freeBusy de 31 días', async () => {
    const { app, google } = montar()
    const respuesta = await app.request('/dias?opcion=manicura-rusa-m', {
      headers: { origin: ORIGEN },
    })
    const { dias } = (await respuesta.json()) as { dias: { fecha: string; estado: string }[] }

    expect(dias).toHaveLength(30)
    expect(dias[0]).toEqual({ fecha: '2026-10-30', estado: 'disponible' })
    expect(dias[2]).toEqual({ fecha: '2026-11-01', estado: 'cerrado' })
    expect(google.consultas).toEqual([
      {
        calendarios: ['trabajadora-1', 'trabajadora-2'],
        desde: '2026-10-30T10:00:00.000Z',
        hasta: '2026-11-30T10:00:00.000Z',
      },
    ])
  })

  it('@s27: una opción no reservable da 400 sin consultar Google', async () => {
    const { app, google } = montar()
    const respuesta = await app.request('/dias?opcion=manicura-rusa-xl-xxl', {
      headers: { origin: ORIGEN },
    })
    expect(respuesta.status).toBe(400)
    expect(await respuesta.json()).toEqual({ codigo: 'peticion-invalida', campo: 'opcion' })
    expect(google.consultas).toEqual([])
  })
})

describe('GET /horas', () => {
  it('devuelve las horas con el inicio ISO UTC tal cual', async () => {
    const { app } = montar()
    // Sábado 7-nov: de 10:00 a 14:00, servicio de 60 min (@s13).
    const respuesta = await app.request('/horas?opcion=manicura-rusa-m&fecha=2026-11-07', {
      headers: { origin: ORIGEN },
    })
    const { horas } = (await respuesta.json()) as { horas: { hora: string; inicio: string }[] }

    expect(horas.map((h) => h.hora)).toEqual([
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '13:00',
    ])
    expect(horas[0]).toEqual({
      hora: '10:00',
      inicio: '2026-11-07T09:00:00.000Z',
      fin: '2026-11-07T10:00:00.000Z',
    })
  })

  it.each(['', '2026-11-7', 'x2026-11-07', '2026-11-07x'])(
    'una fecha mal escrita (%j) da 400',
    async (fecha) => {
      const { app } = montar()
      const respuesta = await app.request(`/horas?opcion=manicura-rusa-m&fecha=${fecha}`, {
        headers: { origin: ORIGEN },
      })
      expect(respuesta.status).toBe(400)
      expect(await respuesta.json()).toEqual({ codigo: 'peticion-invalida', campo: 'fecha' })
    },
  )

  it('sin fecha da 400', async () => {
    const { app } = montar()
    const respuesta = await app.request('/horas?opcion=manicura-rusa-m', {
      headers: { origin: ORIGEN },
    })
    expect(respuesta.status).toBe(400)
  })

  it('@s27: una opción inexistente da 400', async () => {
    const { app } = montar()
    const respuesta = await app.request('/horas?opcion=nada&fecha=2026-11-07', {
      headers: { origin: ORIGEN },
    })
    expect(respuesta.status).toBe(400)
    expect(await respuesta.json()).toEqual({ codigo: 'peticion-invalida', campo: 'opcion' })
  })
})

describe('POST /reservas', () => {
  it('@s20: 201 con la cita, y el evento creado', async () => {
    const { app, google } = montar()
    const respuesta = await app.request('/reservas', post(cuerpo()))

    expect(respuesta.status).toBe(201)
    expect(respuesta.headers.get('access-control-allow-origin')).toBe(ORIGEN)
    expect(await respuesta.json()).toEqual({
      cita: {
        opcion: 'manicura-rusa-m',
        inicio: '2026-11-03T09:00:00.000Z',
        fin: '2026-11-03T10:00:00.000Z',
      },
    })
    expect(google.eventos).toHaveLength(1)
  })

  it('pasa a Turnstile la primera IP de X-Forwarded-For', async () => {
    const { app, verificarTurnstile } = montar()
    await app.request('/reservas', post(cuerpo(), { 'x-forwarded-for': '203.0.113.7 , 10.0.0.1' }))
    expect(verificarTurnstile).toHaveBeenCalledWith('token', '203.0.113.7', CLAVE)
  })

  it('sin X-Forwarded-For, Turnstile va sin IP', async () => {
    const { app, verificarTurnstile } = montar()
    await app.request('/reservas', post(cuerpo()))
    expect(verificarTurnstile).toHaveBeenCalledWith('token', undefined, CLAVE)
  })

  it('@s24: la misma petición dos veces da 201 las dos y un solo evento', async () => {
    const { app, google } = montar()
    const primera = await app.request('/reservas', post(cuerpo()))
    const segunda = await app.request('/reservas', post(cuerpo()))
    expect([primera.status, segunda.status]).toEqual([201, 201])
    expect(await segunda.json()).toEqual(await primera.json())
    expect(google.eventos).toHaveLength(1)
  })

  it('@s22: 409 con el aviso de hora ocupada', async () => {
    const { app, google } = montar()
    const ocupado = [{ start: '2026-11-03T09:00:00Z', end: '2026-11-03T10:00:00Z' }]
    google.ocupado.set('trabajadora-1', [...ocupado])
    google.ocupado.set('trabajadora-2', [...ocupado])

    const respuesta = await app.request('/reservas', post(cuerpo()))
    expect(respuesta.status).toBe(409)
    expect(await respuesta.json()).toEqual({
      codigo: 'hora-ocupada',
      mensaje: 'Esa hora acaba de ocuparse. Elige otra, por favor.',
    })
    expect(google.eventos).toEqual([])
  })

  it('@s26: 403 si Turnstile no pasa', async () => {
    const { app, google, verificarTurnstile } = montar()
    verificarTurnstile.mockResolvedValue(false)
    const respuesta = await app.request('/reservas', post(cuerpo()))
    expect(respuesta.status).toBe(403)
    expect(await respuesta.json()).toEqual({ codigo: 'verificacion' })
    expect(google.eventos).toEqual([])
  })

  it('@s27: 400 con la opción «manicura-rusa-xl-xxl»', async () => {
    const { app, google, verificarTurnstile } = montar()
    const respuesta = await app.request(
      '/reservas',
      post(cuerpo({ opcion: 'manicura-rusa-xl-xxl' })),
    )
    expect(respuesta.status).toBe(400)
    expect(await respuesta.json()).toEqual({ codigo: 'peticion-invalida', campo: 'opcion' })
    expect(verificarTurnstile).not.toHaveBeenCalled()
    expect(google.eventos).toEqual([])
  })

  it('un JSON roto da 400', async () => {
    const { app } = montar()
    const respuesta = await app.request('/reservas', post('{roto'))
    expect(respuesta.status).toBe(400)
    expect(await respuesta.json()).toEqual({ codigo: 'peticion-invalida', campo: 'cuerpo' })
  })

  it('un cuerpo de más de 16 KiB da 413', async () => {
    const { app } = montar()
    const respuesta = await app.request(
      '/reservas',
      post(cuerpo({ nombre: 'a'.repeat(16 * 1024) })),
    )
    expect(respuesta.status).toBe(413)
    expect(await respuesta.json()).toEqual({ codigo: 'peticion-invalida', campo: 'cuerpo' })
  })

  it('una clave ya usada con otra cita da 400 en el campo clave', async () => {
    const { app } = montar()
    await app.request('/reservas', post(cuerpo()))
    const respuesta = await app.request(
      '/reservas',
      post(cuerpo({ inicio: '2026-11-03T10:00:00.000Z' })),
    )
    expect(respuesta.status).toBe(400)
    expect(await respuesta.json()).toEqual({ codigo: 'peticion-invalida', campo: 'clave' })
  })

  it('@s25: si Google falla, 503 con la salida para la clienta y una línea en el log', async () => {
    const { app, google, avisar } = montar()
    vi.spyOn(google, 'ocupacion').mockRejectedValue(new ErrorServicio('google freeBusy: HTTP 503'))

    const respuesta = await app.request('/reservas', post(cuerpo()))
    expect(respuesta.status).toBe(503)
    expect(respuesta.headers.get('access-control-allow-origin')).toBe(ORIGEN)
    expect(await respuesta.json()).toEqual({
      codigo: 'servicio-no-disponible',
      mensaje:
        'No hemos podido completar la reserva. Inténtalo de nuevo o llámanos al 625 22 33 66.',
    })
    expect(avisar).toHaveBeenCalledWith('POST /reservas: google freeBusy: HTTP 503')
    expect(google.eventos).toEqual([])
  })

  it('@s25: también da 503 si falla la disponibilidad', async () => {
    const { app, google } = montar()
    vi.spyOn(google, 'ocupacion').mockRejectedValue(new ErrorServicio('x'))
    const respuesta = await app.request('/dias?opcion=manicura-rusa-m', {
      headers: { origin: ORIGEN },
    })
    expect(respuesta.status).toBe(503)
  })
})
