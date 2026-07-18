/**
 * El horario del salón como DATO con lógica PURA (F-10). Contrato: features/horario.feature.
 *
 * Depende de F-02: el horario semanal vive como DATO-string en `src/lib/site.ts` (`HORARIO`); aquí
 * se LEE y se PARSEA (D3), NO se reescribe ni se duplica. Toda decisión de tiempo es PURA y recibe
 * el reloj INYECTADO (`estaAbierto(ahora)`): nunca se llama a `new Date()` ni se lee el entorno.
 */
import { HORARIO } from './site.ts'

/** Minutos desde medianoche, hora de pared Europe/Madrid. Intervalo SEMIABIERTO `[abre, cierra)`. */
export interface Franja {
  readonly abre: number
  readonly cierra: number
}

/** Los 7 días → sus franjas (0 franjas = cerrado). Deriva de `HORARIO` de F-02; L-V se expande. */
export type DiaSemana =
  'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

export type HorarioSemanal = Record<DiaSemana, readonly Franja[]>

/** Override por fecha concreta (Madrid). `franjas: []` = cerrado ese día. Se consulta ANTES del semanal. */
export interface ExcepcionHorario {
  readonly fecha: string
  readonly franjas: readonly Franja[]
}

const MINUTOS_POR_HORA = 60
const CADENA_CERRADO = 'cerrado'
const SEPARADOR_FRANJA = '-'
const SEPARADOR_HORA = ':'
const ZONA = 'Europe/Madrid'

/** `'10:00' → 600`, `'20:00' → 1200`, `'14:00' → 840`, `'13:59' → 839`. `hora*60 + minuto`. */
export function aMinutos(hhmm: string): number {
  const [hora, minuto] = hhmm.split(SEPARADOR_HORA)

  return Number(hora) * MINUTOS_POR_HORA + Number(minuto)
}

/** `'10:00-20:00' → [{600, 1200}]`; `'cerrado' → []` (la lista vacía ES el «cerrado»). */
export function parsearFranjas(texto: string): readonly Franja[] {
  if (texto === CADENA_CERRADO) {
    return []
  }

  const [abre, cierra] = texto.split(SEPARADOR_FRANJA)

  return [{ abre: aMinutos(abre), cierra: aMinutos(cierra) }]
}

/** El horario semanal DERIVADO de `HORARIO` de F-02 (fuente única, sin reescribir site.ts). */
function derivarHorarioSemanal(horario: typeof HORARIO): HorarioSemanal {
  const laborable = parsearFranjas(horario.lunesAViernes)

  return {
    Monday: laborable,
    Tuesday: laborable,
    Wednesday: laborable,
    Thursday: laborable,
    Friday: laborable,
    Saturday: parsearFranjas(horario.sabado),
    Sunday: parsearFranjas(horario.domingo),
  }
}

export const HORARIO_SEMANAL: HorarioSemanal = derivarHorarioSemanal(HORARIO)

/**
 * La lista GLOBAL de excepciones de la DEMO: VACÍA (D5). Estado honesto — no anuncia ningún cierre
 * especial, así que no hay string inventado que la puerta de F-01 deba cazar. NO se inventan
 * festivos ni el cierre de agosto: rellenarla (sin tocar el copy) es la puerta MANUAL de publicación.
 */
export const EXCEPCIONES: readonly ExcepcionHorario[] = []

/** La hora de pared de Madrid del instante: el día de la semana en inglés, los minutos y la fecha. */
interface HoraDePared {
  readonly dia: DiaSemana
  readonly minutos: number
  readonly fecha: string
}

const FORMATO_MADRID = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  weekday: 'long',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function horaDePared(instante: Date): HoraDePared {
  const partes: Record<string, string> = Object.fromEntries(
    FORMATO_MADRID.formatToParts(instante).map((parte) => [parte.type, parte.value] as const),
  )

  return {
    dia: partes.weekday as DiaSemana,
    minutos: Number(partes.hour) * MINUTOS_POR_HORA + Number(partes.minute),
    fecha: `${partes.year}-${partes.month}-${partes.day}`,
  }
}

function dentroDe(minutos: number, franja: Franja): boolean {
  return minutos >= franja.abre && minutos < franja.cierra
}

/**
 * El motor PURO, testeable con horarios y excepciones ARBITRARIOS. Convierte el instante a la hora
 * de pared de Madrid (día + minutos + fecha, DST resuelto por `Intl`) y decide con el intervalo
 * semiabierto `[abre, cierra)`. Las excepciones se consultan PRIMERO: si la fecha coincide, mandan
 * sus franjas (posiblemente vacías = cerrado) sin tocar el semanal ni el copy.
 */
export function abiertoEn(
  instante: Date,
  horarioSemanal: HorarioSemanal,
  excepciones: readonly ExcepcionHorario[],
): boolean {
  const { dia, minutos, fecha } = horaDePared(instante)
  const excepcion = excepciones.find((entrada) => entrada.fecha === fecha)
  const franjas = excepcion ? excepcion.franjas : horarioSemanal[dia]

  return franjas.some((franja) => dentroDe(minutos, franja))
}

/** El fino ligador sobre `abiertoEn` con el horario semanal canónico (F-02). Reloj INYECTADO. */
export function estaAbierto(ahora: Date): boolean {
  return abiertoEn(ahora, HORARIO_SEMANAL, EXCEPCIONES)
}

/** Una fila de horario para la vista, en castellano. El copy vive en esta capa, no en el dato. */
export interface FilaHorario {
  readonly dias: string
  readonly franja: string
}

const CERRADO_COPY = 'Cerrado'
// El guion LARGO «–» (U+2013) de la presentación, NO el guion «-» del dato de F-02.
const SEPARADOR_PRESENTACION = '–'
const ETIQUETA_LABORABLES = 'Lunes a Viernes'
const ETIQUETA_SABADO = 'Sábado'
const ETIQUETA_DOMINGO = 'Domingo'

function dosDigitos(numero: number): string {
  return String(numero).padStart(2, '0')
}

/** Minutos-desde-medianoche → «HH:MM». Inverso de `aMinutos` para la presentación y schema.org. */
function deMinutos(minutos: number): string {
  const hora = Math.floor(minutos / MINUTOS_POR_HORA)
  const minuto = minutos % MINUTOS_POR_HORA

  return `${dosDigitos(hora)}${SEPARADOR_HORA}${dosDigitos(minuto)}`
}

/**
 * El texto de la franja de una fila: `[]` → «Cerrado» (derivado, no guardado); una franja →
 * «10:00–20:00». Cada grupo de F-02 tiene a lo sumo una franja; una jornada partida exigiría un
 * escenario nuevo (como las excepciones), no se adelanta código para ella (Ley 1).
 */
function franjaParaUI(franjas: readonly Franja[]): string {
  const [franja] = franjas

  return franja === undefined
    ? CERRADO_COPY
    : `${deMinutos(franja.abre)}${SEPARADOR_PRESENTACION}${deMinutos(franja.cierra)}`
}

/** Proyecta el modelo a EXACTAMENTE 3 filas en castellano (D6): L-V, Sábado, Domingo. */
export function horarioParaUI(horarioSemanal: HorarioSemanal): FilaHorario[] {
  return [
    { dias: ETIQUETA_LABORABLES, franja: franjaParaUI(horarioSemanal.Monday) },
    { dias: ETIQUETA_SABADO, franja: franjaParaUI(horarioSemanal.Saturday) },
    { dias: ETIQUETA_DOMINGO, franja: franjaParaUI(horarioSemanal.Sunday) },
  ]
}

/** Un objeto `OpeningHoursSpecification` de schema.org: `dayOfWeek` en la ENUMERACIÓN INGLESA. */
export interface OpeningHoursSpecification {
  readonly '@type': 'OpeningHoursSpecification'
  readonly dayOfWeek: readonly DiaSemana[]
  readonly opens: string
  readonly closes: string
}

const TIPO_OPENING_HOURS = 'OpeningHoursSpecification'

/**
 * Los grupos de días de schema.org (D4/D6): L-V AGRUPADO y Sábado solo. `representante` es el día del
 * que se leen las franjas del grupo (L-V comparten franja). Aquí SOLO se declaran los grupos de días
 * que PUEDEN abrir: el Domingo (cerrado en el modelo, `[]`) no forma grupo — su cierre se representa
 * por AUSENCIA (idiomático en schema.org). Listarlo aquí para luego filtrarlo por sus franjas vacías
 * sería dato MUERTO (un `'Sunday'` inerte que ningún test podría matar). Además, el `.map` sobre las
 * franjas del representante OMITE dinámicamente cualquier grupo cuyo día no tenga franjas.
 */
const GRUPOS_SCHEMA: readonly {
  readonly dias: readonly DiaSemana[]
  readonly representante: DiaSemana
}[] = [
  { dias: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], representante: 'Monday' },
  { dias: ['Saturday'], representante: 'Saturday' },
]

/**
 * El array schema.org, ADITIVO al JSON-LD de F-04 (se COMPONE en el sitio de emisión `home.tsx`, NO
 * en `construirJsonLd`). JAMÁS la clave `openingHours` (la puerta de cascarón de F-04 rompe el build).
 */
export function openingHoursSpecification(
  horarioSemanal: HorarioSemanal,
): OpeningHoursSpecification[] {
  return GRUPOS_SCHEMA.flatMap(({ dias, representante }) =>
    horarioSemanal[representante].map((franja) => ({
      '@type': TIPO_OPENING_HOURS,
      dayOfWeek: dias,
      opens: deMinutos(franja.abre),
      closes: deMinutos(franja.cierra),
    })),
  )
}
