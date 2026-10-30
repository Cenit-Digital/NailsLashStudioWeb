import type { PeriodoOcupado } from '../../src/lib/citas/disponibilidad.ts'
import type { ClienteGoogle, EventoNuevo, EventoWeb } from './google.ts'
import type { Correo } from './mensajes.ts'
import type { Candado } from './reservar.ts'

/**
 * Dobles de prueba compartidos por los tests de `api/` (no es código de producción: no lo importa
 * `servidor.ts` y queda fuera de la mutación). Un Google Calendar en memoria que, como el real, acepta
 * solapes (A-32) y rechaza un id repetido con 409.
 */
export class GoogleEnMemoria implements ClienteGoogle {
  readonly ocupado = new Map<string, PeriodoOcupado[]>()
  readonly eventos: { calendario: string; evento: EventoNuevo }[] = []
  readonly correos: { para: string; correo: Correo; responderA?: string }[] = []
  readonly consultas: { calendarios: readonly string[]; desde: string; hasta: string }[] = []
  /** Espera artificial dentro de `ocupacion`, para entrelazar peticiones concurrentes. */
  esperaMs = 0
  fallaCorreo = false

  constructor(calendarios: readonly string[]) {
    calendarios.forEach((id) => this.ocupado.set(id, []))
  }

  async ocupacion(calendarios: readonly string[], desde: string, hasta: string) {
    this.consultas.push({ calendarios, desde, hasta })
    // La foto se toma al consultar; la espera simula la red antes de que llegue la respuesta.
    const foto = calendarios.map((id) => ({ id, busy: [...(this.ocupado.get(id) ?? [])] }))
    await new Promise((resuelve) => setTimeout(resuelve, this.esperaMs))
    return foto
  }

  async buscarEvento(calendarios: readonly string[], id: string): Promise<EventoWeb | null> {
    const hallado = this.eventos.find(
      (e) => e.evento.id === id && calendarios.includes(e.calendario),
    )
    return hallado === undefined
      ? null
      : {
          calendario: hallado.calendario,
          opcion: hallado.evento.opcion,
          inicio: hallado.evento.inicio,
        }
  }

  async insertarEvento(calendario: string, evento: EventoNuevo): Promise<boolean> {
    if (this.eventos.some((e) => e.calendario === calendario && e.evento.id === evento.id)) {
      return false
    }
    this.eventos.push({ calendario, evento })
    this.ocupado.get(calendario)?.push({ start: evento.inicio, end: evento.fin })
    return true
  }

  async enviarCorreo(para: string, correo: Correo, responderA?: string): Promise<void> {
    if (this.fallaCorreo) throw new Error('smtp caído')
    this.correos.push({ para, correo, ...(responderA === undefined ? {} : { responderA }) })
  }
}

/** Un candado en memoria que serializa por día, como `pg_advisory_xact_lock`. */
export function candadoEnMemoria(): Candado & { readonly dias: string[] } {
  const colas = new Map<string, Promise<unknown>>()
  const dias: string[] = []

  return {
    dias,
    async conDia<T>(fecha: string, trabajo: () => Promise<T>): Promise<T> {
      dias.push(fecha)
      const anterior = colas.get(fecha) ?? Promise.resolve()
      const actual = anterior.then(trabajo, trabajo)
      colas.set(
        fecha,
        actual.catch(() => undefined),
      )
      return actual
    },
  }
}

/** Sin bloqueo: para demostrar que el test de @s23 detecta su falta. */
export const sinCandado: Candado = {
  conDia: (_fecha, trabajo) => trabajo(),
}
