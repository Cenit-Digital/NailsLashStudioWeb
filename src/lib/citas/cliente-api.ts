import { TELEFONO } from '../site.ts'
import { type CampoClienta, campoDeLaClienta } from './datos-clienta.ts'
import type { DiaReservable, Hueco } from './disponibilidad.ts'

/**
 * Citas · Fase 7 (issue #39): el cliente HTTP del modal contra la API de la Fase 6 (contrato en #37).
 *
 * - `pedir` se inyecta (en la app, `window.fetch`): el módulo no toca la red por su cuenta y los tests
 *   no necesitan servidor.
 * - Los GET no llevan cabeceras propias, así que son peticiones CORS simples, sin preflight.
 * - Los textos para la clienta son los del contrato y los aprobados por Pablo, no los del cuerpo de la
 *   respuesta: el modal no muestra lo que no ha revisado.
 */
export type Pedir = (url: string, init?: RequestInit) => Promise<Response>

export interface PeticionCita {
  readonly opcion: string
  /** Tal cual lo dio `/horas`. */
  readonly inicio: string
  readonly nombre: string
  readonly telefono: string
  readonly email: string
  readonly clave: string
  readonly turnstile: string
}

export interface CitaConfirmada {
  readonly opcion: string
  readonly inicio: string
  readonly fin: string
}

export type ResultadoReserva =
  | { readonly tipo: 'confirmada'; readonly cita: CitaConfirmada }
  | { readonly tipo: 'hora-ocupada' | 'verificacion' | 'error'; readonly mensaje: string }
  | { readonly tipo: 'campo'; readonly campo: CampoClienta }

/** El aviso de @s25 (P5). */
export function mensajeDeError(): string {
  return `No hemos podido completar la reserva. Inténtalo de nuevo o llámanos al ${TELEFONO.legible}.`
}

/** El aviso cuando no se pueden cargar los días o las horas. */
export function mensajeDeCarga(que: 'dias' | 'horas'): string {
  const lo = que === 'dias' ? 'los días disponibles' : 'las horas'
  return `No hemos podido cargar ${lo}. Inténtalo de nuevo o llámanos al ${TELEFONO.legible}.`
}

/** El cuerpo JSON como objeto; si no es JSON, lanza y lo recoge el `catch` de quien llama. */
async function cuerpo(r: Response): Promise<Record<string, unknown>> {
  return Object(await r.json()) as Record<string, unknown>
}

async function lista<T>(pedir: Pedir, url: string, clave: string): Promise<T[] | null> {
  try {
    const r = await pedir(url)
    if (!r.ok) return null
    const valor = (await cuerpo(r))[clave]
    return Array.isArray(valor) ? (valor as T[]) : null
  } catch {
    return null
  }
}

async function traducir(r: Response): Promise<ResultadoReserva> {
  if (r.status === 409) {
    return { tipo: 'hora-ocupada', mensaje: 'Esa hora acaba de ocuparse. Elige otra, por favor.' }
  }
  const c = await cuerpo(r)
  if (r.status === 201 && typeof c.cita === 'object' && c.cita !== null) {
    return { tipo: 'confirmada', cita: c.cita as CitaConfirmada }
  }
  if (r.status === 403 && c.codigo === 'verificacion') {
    return {
      tipo: 'verificacion',
      mensaje: 'No hemos podido comprobar que no eres un robot. Vuelve a intentarlo.',
    }
  }
  const campo = r.status === 400 ? campoDeLaClienta(c.campo) : null
  return campo === null ? { tipo: 'error', mensaje: mensajeDeError() } : { tipo: 'campo', campo }
}

export function crearClienteCitas(api: string, pedir: Pedir) {
  return {
    dias: (opcion: string) =>
      lista<DiaReservable>(pedir, `${api}/dias?opcion=${encodeURIComponent(opcion)}`, 'dias'),

    horas: (opcion: string, fecha: string) =>
      lista<Hueco>(
        pedir,
        `${api}/horas?opcion=${encodeURIComponent(opcion)}&fecha=${encodeURIComponent(fecha)}`,
        'horas',
      ),

    async reservar(peticion: PeticionCita): Promise<ResultadoReserva> {
      try {
        const r = await pedir(`${api}/reservas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(peticion),
        })
        return await traducir(r)
      } catch {
        return { tipo: 'error', mensaje: mensajeDeError() }
      }
    },
  }
}
