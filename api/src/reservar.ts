import { trabajadoraParaHueco } from '../../src/lib/citas/disponibilidad.ts'
import type { ClienteGoogle } from './google.ts'
import {
  type DatosCita,
  descripcionEvento,
  emailClienta,
  emailSalon,
  fechaMadrid,
  tituloEvento,
} from './mensajes.ts'
import type { ResultadoValidacion } from './validacion.ts'

/**
 * Citas · Fase 6 (issue #37): confirmar una reserva (@s20-@s26). Orden, y por qué:
 *
 * 1. Turnstile (@s26), antes de tocar Google o PostgreSQL.
 * 2. Bloqueo del DÍA en Madrid (`pg_advisory_xact_lock`, T-8 enmendada). Va por día y no por
 *    trabajadora: el doble clic debe ver la reserva del primero ANTES de elegir trabajadora, o la
 *    segunda petición, viendo ocupada a la 1, reservaría a la 2 (@s24).
 * 3. Dentro del bloqueo:
 *    - idempotencia: si ya hay un evento con el id de esta clave, se devuelve esa cita;
 *    - `freeBusy` del hueco pedido y `trabajadoraParaHueco` con el reloj del servidor (@s22);
 *    - `events.insert` con id determinista, una red extra (A-32): Calendar acepta solapes.
 * 4. Fuera del bloqueo, los emails (@s21). Si fallan, la cita sigue creada y queda en el log.
 */

export interface Candado {
  /** Ejecuta `trabajo` con el día `'YYYY-MM-DD'` bloqueado en exclusiva. */
  conDia<T>(fecha: string, trabajo: () => Promise<T>): Promise<T>
}

export interface DependenciasReserva {
  readonly google: ClienteGoogle
  readonly candado: Candado
  /** Los calendarios de las trabajadoras, en orden de preferencia. */
  readonly calendarios: readonly string[]
  verificarTurnstile(token: string, ip: string | undefined, clave: string): Promise<boolean>
  /** El reloj del servidor (contrato de la Fase 5: nunca el del navegador). */
  ahora(): Date
  readonly emailSalon: string
  /** Log técnico; nunca recibe datos personales. */
  avisar(mensaje: string): void
}

export interface CitaConfirmada {
  readonly opcion: string
  readonly inicio: string
  readonly fin: string
}

export type ResultadoReserva =
  | { readonly tipo: 'creada' | 'repetida'; readonly cita: CitaConfirmada }
  | { readonly tipo: 'hora-ocupada' | 'verificacion' | 'clave-reutilizada' }

type Valida = Extract<ResultadoValidacion, { ok: true }>

export async function reservar(
  valida: Valida,
  ip: string | undefined,
  deps: DependenciasReserva,
): Promise<ResultadoReserva> {
  const { peticion, encontrada, minutos } = valida
  if (!(await deps.verificarTurnstile(peticion.turnstile, ip, peticion.clave))) {
    return { tipo: 'verificacion' }
  }

  // Un UUID sin guiones es hexadecimal, que cabe en el base32hex que exige el id de Calendar.
  const id = `cita${peticion.clave.replaceAll('-', '')}`
  const fin = new Date(Date.parse(peticion.inicio) + minutos * 60_000).toISOString()
  const cita: CitaConfirmada = { opcion: peticion.opcion, inicio: peticion.inicio, fin }
  const datos: DatosCita = { ...peticion, encontrada, fin, minutos }

  const resultado = await deps.candado.conDia(
    fechaMadrid(peticion.inicio),
    async (): Promise<ResultadoReserva> => {
      const previo = await deps.google.buscarEvento(deps.calendarios, id)
      if (previo !== null) {
        const misma = previo.opcion === peticion.opcion && previo.inicio === peticion.inicio
        return misma ? { tipo: 'repetida', cita } : { tipo: 'clave-reutilizada' }
      }

      const ocupacion = await deps.google.ocupacion(deps.calendarios, peticion.inicio, fin)
      const trabajadora = trabajadoraParaHueco(peticion.inicio, {
        ahora: deps.ahora(),
        minutos,
        calendarios: ocupacion,
      })
      if (trabajadora === null) return { tipo: 'hora-ocupada' }

      const creado = await deps.google.insertarEvento(trabajadora, {
        id,
        titulo: tituloEvento(datos),
        descripcion: descripcionEvento(datos),
        inicio: peticion.inicio,
        fin,
        clave: peticion.clave,
        opcion: peticion.opcion,
      })

      return creado ? { tipo: 'creada', cita } : { tipo: 'hora-ocupada' }
    },
  )

  // Si el proceso cayó entre el insert y los emails, la repetición no los reenvía: queda rastro aquí.
  if (resultado.tipo === 'repetida') deps.avisar(`reserva repetida (${id})`)
  if (resultado.tipo === 'creada') {
    const envios = await Promise.allSettled([
      deps.google.enviarCorreo(peticion.email, emailClienta(datos)),
      deps.google.enviarCorreo(deps.emailSalon, emailSalon(datos), peticion.email),
    ])
    envios.forEach((envio) => {
      if (envio.status === 'rejected') {
        deps.avisar(`email de confirmación no enviado (${id}): ${(envio.reason as Error).message}`)
      }
    })
  }

  return resultado
}
