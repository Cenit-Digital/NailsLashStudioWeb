// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'

import { ErrorServicio } from './errores.ts'
import { crearClienteGoogle, type EventoNuevo } from './google.ts'

interface Llamada {
  readonly url: string
  readonly method: string
  readonly auth: string | null
  readonly tipo: string | null
  readonly cuerpo: string
}

/** Un `fetch` doble: responde según una tabla y apunta cada llamada. */
function fetchDoble(responder: (url: string, method: string) => Response) {
  const llamadas: Llamada[] = []
  const fetch = async (entrada: string | URL | Request, init: RequestInit = {}) => {
    const url = String(entrada)
    const method = init.method ?? 'GET'
    llamadas.push({
      url,
      method,
      auth: new Headers(init.headers).get('authorization'),
      tipo: new Headers(init.headers).get('content-type'),
      cuerpo: typeof init.body === 'string' ? init.body : String(init.body ?? ''),
    })
    return responder(url, method)
  }
  return { fetch: fetch as typeof globalThis.fetch, llamadas }
}

function json(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status })
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const CAL = 'https://www.googleapis.com/calendar/v3'

function token(): Response {
  return json({ access_token: 'acceso-1', expires_in: 3599 })
}

let reloj = 0
function cliente(responder: (url: string, method: string) => Response) {
  const doble = fetchDoble((url, method) => (url === TOKEN_URL ? token() : responder(url, method)))
  const google = crearClienteGoogle({
    clientId: 'id-cliente',
    clientSecret: 'secreto-cliente',
    refreshToken: 'refresco',
    remitente: 'citas@cenit.es',
    fetch: doble.fetch,
    ahora: () => reloj,
  })
  return { google, llamadas: doble.llamadas }
}

beforeEach(() => {
  reloj = 1_000_000
})

describe('token de acceso (OAuth con refresh token, A-32)', () => {
  it('canjea el refresh token y usa el access token como Bearer', async () => {
    const { google, llamadas } = cliente(() => json({ calendars: { a: { busy: [] } } }))
    await google.ocupacion(['a'], '2026-11-03T00:00:00.000Z', '2026-11-04T00:00:00.000Z')

    expect(llamadas[0].url).toBe(TOKEN_URL)
    expect(llamadas[0].method).toBe('POST')
    expect(llamadas[0].tipo).toBe('application/x-www-form-urlencoded')
    expect(Object.fromEntries(new URLSearchParams(llamadas[0].cuerpo))).toEqual({
      grant_type: 'refresh_token',
      client_id: 'id-cliente',
      client_secret: 'secreto-cliente',
      refresh_token: 'refresco',
    })
    expect(llamadas[1].auth).toBe('Bearer acceso-1')
    expect(llamadas[1].tipo).toBe('application/json')
  })

  it('reutiliza el token hasta 60 s antes de que caduque y luego lo renueva', async () => {
    const { google, llamadas } = cliente(() => json({ calendars: { a: { busy: [] } } }))
    const consulta = () => google.ocupacion(['a'], 'x', 'y')
    const canjes = () => llamadas.filter((l) => l.url === TOKEN_URL).length

    await consulta()
    reloj += (3599 - 60) * 1000 - 1
    await consulta()
    expect(canjes()).toBe(1)

    reloj += 1
    await consulta()
    expect(canjes()).toBe(2)
  })

  it('si el canje falla (token revocado), es un fallo del servicio', async () => {
    const doble = fetchDoble(() => json({ error: 'invalid_grant' }, 400))
    const google = crearClienteGoogle({
      clientId: 'i',
      clientSecret: 's',
      refreshToken: 'r',
      remitente: 'c@c.es',
      fetch: doble.fetch,
      ahora: () => 0,
    })
    const promesa = google.ocupacion(['a'], 'x', 'y')
    await expect(promesa).rejects.toBeInstanceOf(ErrorServicio)
    await expect(promesa).rejects.toThrow('google token: HTTP 400')
  })
  it('tras un canje fallido, la siguiente llamada vuelve a canjear', async () => {
    const respuestas = [json({ error: 'temporal' }, 500), token()]
    const doble = fetchDoble((url) =>
      url === TOKEN_URL
        ? (respuestas.shift() as Response)
        : json({ calendars: { a: { busy: [] } } }),
    )
    const google = crearClienteGoogle({
      clientId: 'i',
      clientSecret: 's',
      refreshToken: 'r',
      remitente: 'c@c.es',
      fetch: doble.fetch,
      ahora: () => reloj,
    })
    await expect(google.ocupacion(['a'], 'x', 'y')).rejects.toThrow('google token: HTTP 500')
    await expect(google.ocupacion(['a'], 'x', 'y')).resolves.toEqual([{ id: 'a', busy: [] }])
  })

  it('dos llamadas en paralelo comparten un solo canje', async () => {
    const { google, llamadas } = cliente(() => json({ calendars: { a: { busy: [] } } }))
    await Promise.all([google.ocupacion(['a'], 'x', 'y'), google.ocupacion(['a'], 'x', 'y')])
    expect(llamadas.filter((l) => l.url === TOKEN_URL)).toHaveLength(1)
  })
})

describe('ocupacion (freeBusy.query)', () => {
  it('consulta los calendarios en Madrid y los devuelve en el MISMO orden pedido', async () => {
    const { google, llamadas } = cliente(() =>
      json({
        calendars: {
          b: { busy: [{ start: '2026-11-03T10:00:00+01:00', end: '2026-11-03T11:00:00+01:00' }] },
          a: { busy: [] },
        },
      }),
    )
    const ocupacion = await google.ocupacion(
      ['a', 'b'],
      '2026-11-03T00:00:00.000Z',
      '2026-11-04T00:00:00.000Z',
    )

    expect(ocupacion).toEqual([
      { id: 'a', busy: [] },
      { id: 'b', busy: [{ start: '2026-11-03T10:00:00+01:00', end: '2026-11-03T11:00:00+01:00' }] },
    ])
    expect(llamadas[1].url).toBe(`${CAL}/freeBusy`)
    expect(llamadas[1].method).toBe('POST')
    expect(JSON.parse(llamadas[1].cuerpo)).toEqual({
      timeMin: '2026-11-03T00:00:00.000Z',
      timeMax: '2026-11-04T00:00:00.000Z',
      timeZone: 'Europe/Madrid',
      items: [{ id: 'a' }, { id: 'b' }],
    })
  })

  it('los errors de un calendario son fallo cerrado, aunque traiga busy vacío', async () => {
    const { google } = cliente(() =>
      json({ calendars: { a: { busy: [], errors: [{ domain: 'global', reason: 'notFound' }] } } }),
    )
    await expect(google.ocupacion(['a'], 'x', 'y')).rejects.toThrow('google freeBusy: errors en a')
  })

  it('un errors vacío no es un fallo', async () => {
    const { google } = cliente(() => json({ calendars: { a: { busy: [], errors: [] } } }))
    await expect(google.ocupacion(['a'], 'x', 'y')).resolves.toEqual([{ id: 'a', busy: [] }])
  })

  it('un calendario que falta en la respuesta es fallo cerrado', async () => {
    const { google } = cliente(() => json({ calendars: { a: { busy: [] } } }))
    const promesa = google.ocupacion(['a', 'b'], 'x', 'y')
    await expect(promesa).rejects.toBeInstanceOf(ErrorServicio)
    await expect(promesa).rejects.toThrow('google freeBusy: errors en b')
  })

  it('una respuesta sin calendars es fallo cerrado', async () => {
    const { google } = cliente(() => json({}))
    await expect(google.ocupacion(['a'], 'x', 'y')).rejects.toBeInstanceOf(ErrorServicio)
  })

  it('un error HTTP es fallo del servicio', async () => {
    const { google } = cliente(() => json({}, 503))
    await expect(google.ocupacion(['a'], 'x', 'y')).rejects.toThrow('google freeBusy: HTTP 503')
  })
})

describe('buscarEvento (idempotencia, @s24)', () => {
  const id = 'cita0f8fad5bd9cb469fa16570867728950e'

  it('pide el evento por su id en cada calendario y devuelve el primero que lo tiene', async () => {
    const { google, llamadas } = cliente((url) =>
      url.includes('cal%40b')
        ? json({
            status: 'confirmed',
            extendedProperties: {
              private: { opcion: 'manicura-rusa-m', inicio: '2026-11-03T09:00:00.000Z' },
            },
          })
        : json({ error: 'notFound' }, 404),
    )

    await expect(google.buscarEvento(['cal@a', 'cal@b'], id)).resolves.toEqual({
      calendario: 'cal@b',
      opcion: 'manicura-rusa-m',
      inicio: '2026-11-03T09:00:00.000Z',
    })
    expect(llamadas.slice(1).map((l) => `${l.method} ${l.url}`)).toEqual([
      `GET ${CAL}/calendars/cal%40a/events/${id}`,
      `GET ${CAL}/calendars/cal%40b/events/${id}`,
    ])
    expect(llamadas[1].auth).toBe('Bearer acceso-1')
  })

  it('null si ningún calendario lo tiene (404 o 410)', async () => {
    const { google } = cliente((url) => (url.includes('cal%40a') ? json({}, 404) : json({}, 410)))
    await expect(google.buscarEvento(['cal@a', 'cal@b'], id)).resolves.toBeNull()
  })

  it('un evento cancelado (borrado por el salón) no cuenta', async () => {
    const { google } = cliente(() => json({ status: 'cancelled' }))
    await expect(google.buscarEvento(['cal@a'], id)).resolves.toBeNull()
  })

  it('un evento sin propiedades privadas devuelve campos vacíos', async () => {
    const { google } = cliente(() => json({ status: 'confirmed' }))
    await expect(google.buscarEvento(['cal@a'], id)).resolves.toEqual({
      calendario: 'cal@a',
      opcion: '',
      inicio: '',
    })
  })

  it('otro error HTTP es fallo del servicio', async () => {
    const { google } = cliente(() => json({}, 500))
    await expect(google.buscarEvento(['cal@a'], id)).rejects.toThrow('google events.get: HTTP 500')
  })
})

describe('insertarEvento (@s20)', () => {
  const evento: EventoNuevo = {
    id: 'cita0f8fad5bd9cb469fa16570867728950e',
    titulo: 'Manicura · X (Uña Mediana) — Ana',
    descripcion: 'Reserva hecha en la web.',
    inicio: '2026-11-03T09:00:00.000Z',
    fin: '2026-11-03T10:00:00.000Z',
    clave: '0f8fad5b-d9cb-469f-a165-70867728950e',
    opcion: 'manicura-rusa-m',
  }

  it('inserta el evento con id determinista, zona de Madrid, propiedades privadas y aviso', async () => {
    const { google, llamadas } = cliente(() => json({ id: evento.id }))
    await expect(google.insertarEvento('cal@a', evento)).resolves.toBe(true)

    expect(llamadas[1].url).toBe(`${CAL}/calendars/cal%40a/events`)
    expect(llamadas[1].method).toBe('POST')
    expect(llamadas[1].auth).toBe('Bearer acceso-1')
    expect(JSON.parse(llamadas[1].cuerpo)).toEqual({
      id: 'cita0f8fad5bd9cb469fa16570867728950e',
      summary: 'Manicura · X (Uña Mediana) — Ana',
      description: 'Reserva hecha en la web.',
      start: { dateTime: '2026-11-03T09:00:00.000Z', timeZone: 'Europe/Madrid' },
      end: { dateTime: '2026-11-03T10:00:00.000Z', timeZone: 'Europe/Madrid' },
      extendedProperties: {
        private: {
          origen: 'web-citas',
          clave: '0f8fad5b-d9cb-469f-a165-70867728950e',
          opcion: 'manicura-rusa-m',
          inicio: '2026-11-03T09:00:00.000Z',
        },
      },
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 }] },
    })
  })

  it('false si ese id ya existe en el calendario (409)', async () => {
    const { google } = cliente(() => json({}, 409))
    await expect(google.insertarEvento('cal@a', evento)).resolves.toBe(false)
  })

  it('otro error HTTP es fallo del servicio', async () => {
    const { google } = cliente(() => json({}, 403))
    await expect(google.insertarEvento('cal@a', evento)).rejects.toThrow(
      'google events.insert: HTTP 403',
    )
  })
})

describe('enviarCorreo (Gmail API, @s21)', () => {
  function decodificar(cuerpo: string): string {
    const { raw } = JSON.parse(cuerpo) as { raw: string }
    expect(raw).toMatch(/^[\w-]+$/)
    return Buffer.from(raw, 'base64url').toString('utf8')
  }

  it('envía un mensaje MIME en UTF-8 desde el remitente, con Reply-To', async () => {
    const { google, llamadas } = cliente(() => json({ id: 'm1' }))
    await google.enviarCorreo(
      'salon@nails.es',
      { asunto: 'Nueva cita web: Ana, martes', texto: 'Clienta: Ana\nMañana' },
      'ana@mail.es',
    )

    expect(llamadas[1].url).toBe('https://gmail.googleapis.com/gmail/v1/users/me/messages/send')
    expect(llamadas[1].method).toBe('POST')
    expect(llamadas[1].auth).toBe('Bearer acceso-1')
    const mime = decodificar(llamadas[1].cuerpo)
    const [cabeceras, cuerpo] = mime.split('\r\n\r\n')
    expect(cabeceras.split('\r\n')).toEqual([
      'From: citas@cenit.es',
      'To: salon@nails.es',
      'Reply-To: ana@mail.es',
      `Subject: =?UTF-8?B?${Buffer.from('Nueva cita web: Ana, martes').toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
    ])
    expect(Buffer.from(cuerpo, 'base64').toString('utf8')).toBe('Clienta: Ana\nMañana')
  })

  it('sin Reply-To no pone esa cabecera', async () => {
    const { google, llamadas } = cliente(() => json({ id: 'm1' }))
    await google.enviarCorreo('ana@mail.es', { asunto: 'a', texto: 'b' })
    const [cabeceras] = decodificar(llamadas[1].cuerpo).split('\r\n\r\n')
    expect(cabeceras.split('\r\n').slice(0, 3)).toEqual([
      'From: citas@cenit.es',
      'To: ana@mail.es',
      `Subject: =?UTF-8?B?${Buffer.from('a').toString('base64')}?=`,
    ])
  })

  it('un error HTTP es fallo del servicio', async () => {
    const { google } = cliente(() => json({}, 429))
    await expect(google.enviarCorreo('a@b.es', { asunto: 'a', texto: 'b' })).rejects.toThrow(
      'google gmail.send: HTTP 429',
    )
  })
})
