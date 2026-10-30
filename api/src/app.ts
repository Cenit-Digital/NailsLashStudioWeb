import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { cors } from 'hono/cors'

import { diasReservables, horasDisponibles } from '../../src/lib/citas/disponibilidad.ts'
import { TELEFONO } from '../../src/lib/site.ts'
import { type DependenciasReserva, reservar } from './reservar.ts'
import { opcionReservable, validarReserva } from './validacion.ts'

/**
 * Citas · Fase 6 (issue #37): la API HTTP.
 *
 * Rutas:
 * - `GET /dias` y `GET /horas`: la disponibilidad para el modal (Fase 7).
 * - `POST /reservas`: confirma una cita (@s20-@s27).
 * - `GET /salud`: para las sondas del clúster.
 *
 * Solo atiende al origen de la web publicada (@s28). Cualquier otro origen, o ninguno, recibe 403 y
 * ninguna cabecera CORS. Un fallo de Google, Turnstile o PostgreSQL responde 503 con la salida para
 * la clienta (@s25).
 */
export function crearApp(deps: DependenciasReserva): Hono {
  const origen = 'https://cenit-digital.github.io'
  const app = new Hono()

  app.get('/salud', (c) => c.json({ ok: true }))

  app.use('*', async (c, siguiente) => {
    if (c.req.header('origin') !== origen) return c.json({ codigo: 'origen' }, 403)
    await siguiente()
  })
  app.use(
    '*',
    cors({
      origin: origen,
      allowMethods: ['GET', 'POST'],
      allowHeaders: ['Content-Type'],
      maxAge: 600,
    }),
  )

  async function ocupacionDeLaVentana(ahora: Date) {
    // 31 días cubren entera la ventana de 30 días de Madrid, empiece a la hora que empiece.
    const hasta = new Date(ahora.getTime() + 31 * 24 * 60 * 60_000)
    return deps.google.ocupacion(deps.calendarios, ahora.toISOString(), hasta.toISOString())
  }

  app.get('/dias', async (c) => {
    const encontrada = opcionReservable(c.req.query('opcion'))
    if (encontrada === null) return c.json({ codigo: 'peticion-invalida', campo: 'opcion' }, 400)

    const ahora = deps.ahora()
    const calendarios = await ocupacionDeLaVentana(ahora)
    const minutos = encontrada.opcion.minutos as number

    return c.json({ dias: diasReservables({ ahora, minutos, calendarios }) })
  })

  app.get('/horas', async (c) => {
    const encontrada = opcionReservable(c.req.query('opcion'))
    if (encontrada === null) return c.json({ codigo: 'peticion-invalida', campo: 'opcion' }, 400)
    // Sin fecha, `String(undefined)` es «undefined», que no pasa el patrón.
    const fecha = String(c.req.query('fecha'))
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return c.json({ codigo: 'peticion-invalida', campo: 'fecha' }, 400)
    }

    const ahora = deps.ahora()
    const calendarios = await ocupacionDeLaVentana(ahora)
    const minutos = encontrada.opcion.minutos as number

    return c.json({ horas: horasDisponibles(fecha, { ahora, minutos, calendarios }) })
  })

  app.post(
    '/reservas',
    bodyLimit({
      maxSize: 16 * 1024,
      onError: (c) => c.json({ codigo: 'peticion-invalida', campo: 'cuerpo' }, 413),
    }),
    async (c) => {
      const validacion = validarReserva(await c.req.json().catch(() => undefined))
      if (!validacion.ok) {
        return c.json({ codigo: 'peticion-invalida', campo: validacion.campo }, 400)
      }

      const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim()
      const resultado = await reservar(validacion, ip, deps)
      switch (resultado.tipo) {
        case 'verificacion':
          return c.json({ codigo: 'verificacion' }, 403)
        case 'hora-ocupada':
          return c.json(
            {
              codigo: 'hora-ocupada',
              mensaje: 'Esa hora acaba de ocuparse. Elige otra, por favor.',
            },
            409,
          )
        case 'clave-reutilizada':
          return c.json({ codigo: 'peticion-invalida', campo: 'clave' }, 400)
        default:
          return c.json({ cita: resultado.cita }, 201)
      }
    },
  )

  app.onError((error, c) => {
    deps.avisar(`${c.req.method} ${c.req.path}: ${error.message}`)
    return c.json(
      {
        codigo: 'servicio-no-disponible',
        mensaje: `No hemos podido completar la reserva. Inténtalo de nuevo o llámanos al ${TELEFONO.legible}.`,
      },
      503,
    )
  })

  return app
}
