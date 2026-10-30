import type { CalendarioOcupado } from '../../src/lib/citas/disponibilidad.ts'
import { ErrorServicio } from './errores.ts'
import type { Correo } from './mensajes.ts'

/**
 * Citas · Fase 6 (issue #37): el cliente de Google, con `fetch` directo y sin el SDK. Usa OAuth con el
 * refresh token de la cuenta dueña de los calendarios (A-32, docs/research/citas/autenticacion-google.md).
 * Llamadas: `freeBusy.query`, `events.get`, `events.insert` y Gmail `messages.send`.
 *
 * Toda respuesta inesperada lanza `ErrorServicio`. Eso es fallo cerrado: la API no reserva a ciegas.
 * Los secretos llegan por configuración (el entorno del servidor) y nunca se escriben en el código.
 */

export interface ConfigGoogle {
  readonly clientId: string
  readonly clientSecret: string
  readonly refreshToken: string
  /** La dirección desde la que se envían los emails (la de la cuenta autorizada). */
  readonly remitente: string
  readonly fetch: typeof fetch
  /** Reloj en ms, para la caducidad del access token. */
  readonly ahora: () => number
}

/** Lo que se lee de un evento de la web: dónde está y qué se reservó. */
export interface EventoWeb {
  readonly calendario: string
  readonly opcion: string
  readonly inicio: string
}

export interface EventoNuevo {
  /** Id determinista (base32hex) derivado de la clave de la reserva. */
  readonly id: string
  readonly titulo: string
  readonly descripcion: string
  readonly inicio: string
  readonly fin: string
  readonly clave: string
  readonly opcion: string
}

export interface ClienteGoogle {
  /** `freeBusy` de los calendarios, en el orden pedido (el orden fija «la primera libre»). */
  ocupacion(
    calendarios: readonly string[],
    desde: string,
    hasta: string,
  ): Promise<CalendarioOcupado[]>
  /** El evento con ese id en el primer calendario que lo tenga y no esté cancelado, o `null`. */
  buscarEvento(calendarios: readonly string[], id: string): Promise<EventoWeb | null>
  /** `true` si se creó; `false` si ese id ya existía en el calendario (409). */
  insertarEvento(calendario: string, evento: EventoNuevo): Promise<boolean>
  enviarCorreo(para: string, correo: Correo, responderA?: string): Promise<void>
}

function falla(operacion: string, respuesta: Response): ErrorServicio {
  return new ErrorServicio(`google ${operacion}: HTTP ${respuesta.status}`)
}

function base64(texto: string): string {
  return Buffer.from(texto).toString('base64')
}

export function crearClienteGoogle(config: ConfigGoogle): ClienteGoogle {
  // La promesa del canje en curso o vigente: las llamadas en paralelo comparten un solo canje.
  let vigente: Promise<string> | null = null
  let caduca = -Infinity

  async function canjear(): Promise<string> {
    const respuesta = await config.fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
      }).toString(),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    })
    if (!respuesta.ok) throw falla('token', respuesta)

    const cuerpo = (await respuesta.json()) as { access_token: string; expires_in: number }
    // Se renueva 60 s antes de que caduque, para no usar un token a punto de morir.
    caduca = config.ahora() + (cuerpo.expires_in - 60) * 1000

    return cuerpo.access_token
  }

  function acceso(): Promise<string> {
    if (config.ahora() >= caduca) {
      caduca = Infinity
      vigente = canjear().catch((error: unknown) => {
        caduca = -Infinity
        throw error
      })
    }

    return vigente as Promise<string>
  }

  async function llamar(url: string, method: string, cuerpo?: unknown): Promise<Response> {
    return config.fetch(url, {
      method,
      headers: { authorization: `Bearer ${await acceso()}`, 'content-type': 'application/json' },
      // Sin cuerpo (GET), `JSON.stringify(undefined)` es `undefined`: la petición va sin body.
      body: JSON.stringify(cuerpo),
    })
  }

  function urlCalendario(calendario: string): string {
    return `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendario)}/events`
  }

  return {
    async ocupacion(calendarios, desde, hasta) {
      const respuesta = await llamar('https://www.googleapis.com/calendar/v3/freeBusy', 'POST', {
        timeMin: desde,
        timeMax: hasta,
        timeZone: 'Europe/Madrid',
        items: calendarios.map((id) => ({ id })),
      })
      if (!respuesta.ok) throw falla('freeBusy', respuesta)

      const cuerpo = (await respuesta.json()) as {
        calendars?: Record<string, { busy: CalendarioOcupado['busy']; errors?: unknown[] }>
      }

      return calendarios.map((id) => {
        const calendario = cuerpo.calendars?.[id]
        if (calendario === undefined || (calendario.errors ?? []).length > 0) {
          throw new ErrorServicio(`google freeBusy: errors en ${id}`)
        }
        return { id, busy: calendario.busy }
      })
    },

    async buscarEvento(calendarios, id) {
      const encontrados = await Promise.all(
        calendarios.map(async (calendario): Promise<EventoWeb | null> => {
          const respuesta = await llamar(`${urlCalendario(calendario)}/${id}`, 'GET')
          if (respuesta.status === 404 || respuesta.status === 410) return null
          if (!respuesta.ok) throw falla('events.get', respuesta)

          const evento = (await respuesta.json()) as {
            status?: string
            extendedProperties?: { private?: Record<string, string> }
          }
          if (evento.status === 'cancelled') return null
          const privadas = evento.extendedProperties?.private

          return { calendario, opcion: privadas?.opcion ?? '', inicio: privadas?.inicio ?? '' }
        }),
      )

      return encontrados.find((evento) => evento !== null) ?? null
    },

    async insertarEvento(calendario, evento) {
      const respuesta = await llamar(urlCalendario(calendario), 'POST', {
        id: evento.id,
        summary: evento.titulo,
        description: evento.descripcion,
        start: { dateTime: evento.inicio, timeZone: 'Europe/Madrid' },
        end: { dateTime: evento.fin, timeZone: 'Europe/Madrid' },
        extendedProperties: {
          private: {
            origen: 'web-citas',
            clave: evento.clave,
            opcion: evento.opcion,
            inicio: evento.inicio,
          },
        },
        reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 }] },
      })
      if (respuesta.status === 409) return false
      if (!respuesta.ok) throw falla('events.insert', respuesta)

      return true
    },

    async enviarCorreo(para, correo, responderA) {
      const cabeceras = [
        `From: ${config.remitente}`,
        `To: ${para}`,
        ...(responderA === undefined ? [] : [`Reply-To: ${responderA}`]),
        `Subject: =?UTF-8?B?${base64(correo.asunto)}?=`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
      ]
      const mime = `${cabeceras.join('\r\n')}\r\n\r\n${base64(correo.texto)}`
      const respuesta = await llamar(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        'POST',
        { raw: Buffer.from(mime).toString('base64url') },
      )
      if (!respuesta.ok) throw falla('gmail.send', respuesta)
    },
  }
}
