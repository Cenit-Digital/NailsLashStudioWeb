import {
  type DiaSemana,
  EXCEPCIONES,
  type ExcepcionHorario,
  type Franja,
  HORARIO_SEMANAL,
  type HorarioSemanal,
} from '../horario.ts'

/**
 * Citas · Fase 5 (issue #34): la disponibilidad como lógica PURA. Contrato: features/reserva_citas.feature
 * (@s11-@s16 y el cálculo de @s22/@s23). La usan el modal (pasos «Día» y «Hora») y el backend `api/`
 * (revalida la hora pedida y elige trabajadora antes de crear el evento).
 *
 * Reloj INYECTADO (`ahora`), sin red ni almacenamiento. Las fechas son de pared en Europe/Madrid
 * (`'YYYY-MM-DD'`) y los instantes, ISO en UTC. Nunca se usan los métodos locales de `Date`.
 *
 * Sin literales de texto a nivel de módulo: con este runner los inicializadores estáticos sobreviven a
 * la mutación (ver la deuda de horario.ts). Por eso las cadenas y el `Intl.DateTimeFormat` viven
 * dentro de las funciones, y los bucles son `Array.from` (un mutante no puede colgarlos).
 */

/** Un periodo ocupado, tal como lo da `calendars[id].busy` de `freeBusy.query` (ISO con offset). */
export interface PeriodoOcupado {
  readonly start: string
  readonly end: string
}

/** Lo ocupado de un calendario de trabajadora. */
export interface CalendarioOcupado {
  readonly id: string
  readonly busy: readonly PeriodoOcupado[]
}

export interface ConsultaDisponibilidad {
  readonly ahora: Date
  /** Duración del servicio: los `minutos` de una opción reservable del catálogo. */
  readonly minutos: number
  /** En orden de preferencia: «la primera libre» es la primera de este array. */
  readonly calendarios: readonly CalendarioOcupado[]
  readonly horarioSemanal?: HorarioSemanal
  readonly excepciones?: readonly ExcepcionHorario[]
}

export type EstadoDia = 'disponible' | 'cerrado' | 'completo'

export interface DiaReservable {
  readonly fecha: string
  readonly estado: EstadoDia
}

export interface Hueco {
  /** Hora de inicio en Madrid, «HH:MM». */
  readonly hora: string
  /** Instantes ISO en UTC; el intervalo es semiabierto `[inicio, fin)`. */
  readonly inicio: string
  readonly fin: string
}

interface HuecoInterno extends Hueco {
  readonly ms: number
  /** Ids de los calendarios libres en todo el hueco, en el orden de la consulta. */
  readonly libres: readonly string[]
}

const MS_POR_MINUTO = 60_000
const DIAS_RESERVABLES = 30
const ANTELACION_MINUTOS = 120
const PASO_MINUTOS = 30
const PASOS_POR_DIA = 48

/**
 * La fecha de pared de Madrid de un instante y el desfase (ms) de Madrid respecto a UTC en él. Solo
 * lee hasta los minutos: el desfase es exacto para instantes en minuto exacto (los únicos que se le pasan).
 */
function paredMadrid(ms: number): { readonly fecha: string; readonly desfase: number } {
  const formato = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const p = Object.fromEntries(formato.formatToParts(ms).map((parte) => [parte.type, parte.value]))
  const comoUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
  )

  return { fecha: `${p.year}-${p.month}-${p.day}`, desfase: comoUtc - ms }
}

/** Medianoche de la fecha `'YYYY-MM-DD'` leída como si fuera UTC (base para la aritmética de días). */
function medianocheUtc(fecha: string): number {
  const [anio, mes, dia] = fecha.split('-').map(Number)

  return Date.UTC(anio, mes - 1, dia)
}

function isoUtc(ms: number): string {
  return new Date(ms).toISOString()
}

/** De hoy (en Madrid) a hoy + 29, ambos incluidos. */
function fechasReservables(ahora: Date): string[] {
  const hoy = medianocheUtc(paredMadrid(ahora.getTime()).fecha)

  return Array.from({ length: DIAS_RESERVABLES }, (_, i) =>
    isoUtc(hoy + i * 24 * 60 * MS_POR_MINUTO).slice(0, 10),
  )
}

/** Las franjas de una fecha: primero las excepciones (festivos), luego el horario semanal. */
function franjasDe(
  fecha: string,
  horarioSemanal: HorarioSemanal,
  excepciones: readonly ExcepcionHorario[],
): readonly Franja[] {
  const excepcion = excepciones.find((entrada) => entrada.fecha === fecha)
  if (excepcion) return excepcion.franjas

  const dias: readonly DiaSemana[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]

  return horarioSemanal[dias[new Date(medianocheUtc(fecha)).getUTCDay()]]
}

/**
 * Los huecos de una fecha con sus calendarios libres. Un inicio vale si es una media hora en punto,
 * el servicio cabe entero en una franja, respeta la antelación (inclusiva) y alguna trabajadora está
 * libre en todo `[inicio, fin)`.
 */
function huecosDelDia(fecha: string, consulta: ConsultaDisponibilidad): HuecoInterno[] {
  const {
    ahora,
    minutos,
    calendarios,
    horarioSemanal = HORARIO_SEMANAL,
    excepciones = EXCEPCIONES,
  } = consulta
  if (!fechasReservables(ahora).includes(fecha)) return []

  const franjas = franjasDe(fecha, horarioSemanal, excepciones)
  const medianoche = medianocheUtc(fecha)
  // El desfase de ESE día (no el de `ahora`), medido a las 12:00Z: Madrid cambia de hora a la 01:00Z,
  // así que a mediodía ya rige el desfase con el que abre el salón, también el día del cambio.
  const desfase = paredMadrid(medianoche + 12 * 60 * MS_POR_MINUTO).desfase
  const limite = ahora.getTime() + ANTELACION_MINUTOS * MS_POR_MINUTO
  // Un periodo ilegible da NaN y toda comparación con NaN es falsa: ocupa (fallo cerrado).
  const ocupados = calendarios.map((calendario) => ({
    id: calendario.id,
    periodos: calendario.busy.map((b) => ({ inicio: Date.parse(b.start), fin: Date.parse(b.end) })),
  }))

  return Array.from({ length: PASOS_POR_DIA }, (_, i) => i * PASO_MINUTOS)
    .filter((t) => franjas.some((f) => f.abre <= t && t + minutos <= f.cierra))
    .map((t) => {
      const inicio = medianoche + t * MS_POR_MINUTO - desfase
      const fin = inicio + minutos * MS_POR_MINUTO
      const libres = ocupados
        .filter((c) => c.periodos.every((p) => p.fin <= inicio || p.inicio >= fin))
        .map((c) => c.id)

      return {
        hora: isoUtc(medianoche + t * MS_POR_MINUTO).slice(11, 16),
        inicio: isoUtc(inicio),
        fin: isoUtc(fin),
        ms: inicio,
        libres,
      }
    })
    .filter((hueco) => hueco.ms >= limite && hueco.libres.length > 0)
}

/** Los 30 días reservables con su estado: sin franjas «cerrado»; con franjas y sin hueco «completo». */
export function diasReservables(consulta: ConsultaDisponibilidad): DiaReservable[] {
  const { horarioSemanal = HORARIO_SEMANAL, excepciones = EXCEPCIONES } = consulta

  return fechasReservables(consulta.ahora).map((fecha) => {
    if (franjasDe(fecha, horarioSemanal, excepciones).length === 0) {
      return { fecha, estado: 'cerrado' }
    }

    return { fecha, estado: huecosDelDia(fecha, consulta).length > 0 ? 'disponible' : 'completo' }
  })
}

/** Las horas ofrecidas de una fecha `'YYYY-MM-DD'` de Madrid; `[]` fuera de los 30 días. */
export function horasDisponibles(fecha: string, consulta: ConsultaDisponibilidad): Hueco[] {
  return huecosDelDia(fecha, consulta).map(({ hora, inicio, fin }) => ({ hora, inicio, fin }))
}

/**
 * La trabajadora a la que asignar un inicio pedido: la primera libre, si ese inicio es EXACTAMENTE el
 * `inicio` de una de las horas ofrecidas AHORA (ISO UTC de `horasDisponibles`); `null` si no (ocupada,
 * fuera de horario o de la ventana, sin antelación, o escrito de otra forma: sin offset dependería de
 * la zona del servidor). El bloqueo frente a dos reservas simultáneas es del backend.
 */
export function trabajadoraParaHueco(
  inicio: string,
  consulta: ConsultaDisponibilidad,
): string | null {
  const ms = Date.parse(inicio)
  if (Number.isNaN(ms)) return null

  const hueco = huecosDelDia(paredMadrid(ms).fecha, consulta).find((h) => h.inicio === inicio)

  return hueco?.libres[0] ?? null
}
