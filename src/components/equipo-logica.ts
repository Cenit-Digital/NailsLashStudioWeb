import { aMinutos, type DiaSemana, type Franja, HORARIO_SEMANAL } from '../lib/horario'

/**
 * Núcleo PURO de la sección de equipo (feature `equipo_reservas`, contrato
 * features/equipo_reservas.feature). Vive separado de `Equipo.tsx` para que el
 * módulo del componente exporte SOLO su componente (react-refresh) y siguiendo
 * el patrón del repo (F-09: `catalogo` / `catalogo-logica`).
 *
 * 🔴 Las cuatro funciones son PURAS: el reloj (`ahora`) y el horario son
 * DEPENDENCIAS INYECTADAS, nunca `new Date()` interno → deterministas y matables.
 * El componente solo las CABLEA; así Stryker puede morderlas por valor.
 */
const DIAS_A_OFRECER = 6
const DOMINGO = 0

// Abreviaturas en minúsculas, como `Reserva.tsx` (índice = getDay()).
const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const
// getDay() (0=domingo) → el día en inglés de F-10, para leer su horario.
const DIA_SEMANA: readonly DiaSemana[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
// Las seis franjas candidatas (verbatim de `salon-data.js` → timeSlots); se FILTRAN por día.
const FRANJAS_POSIBLES = ['10:00', '11:30', '13:00', '16:00', '17:30', '19:00'] as const

export interface DiaOfrecido {
  readonly dow: string
  readonly day: number
  readonly diaSemana: DiaSemana
}

/**
 * Los SEIS días ofrecidos a partir de MAÑANA, saltando los domingos (el salón cierra, F-10). PURA: el
 * reloj es una DEPENDENCIA INYECTADA (`ahora`), nunca `new Date()` interno → determinista y matable.
 */
export function diasOfrecidos(ahora: Date): readonly DiaOfrecido[] {
  const dias: DiaOfrecido[] = []
  const cursor = new Date(ahora.getTime())

  while (dias.length < DIAS_A_OFRECER) {
    cursor.setDate(cursor.getDate() + 1)

    if (cursor.getDay() !== DOMINGO) {
      dias.push({ dow: DOW[cursor.getDay()], day: cursor.getDate(), diaSemana: DIA_SEMANA[cursor.getDay()] })
    }
  }

  return dias
}

/**
 * El núcleo PURO del filtro de franjas: `FRANJAS_POSIBLES` contra un horario ARBITRARIO (inyectado),
 * con el intervalo SEMIABIERTO `[abre, cierra)` — la misma regla que `dentroDe` de F-10. La cota
 * inferior `>= abre` descarta una franja anterior a la apertura; la superior `< cierra` descarta la que
 * empieza JUSTO al cierre (así el sábado 10:00–14:00 pierde 16:00/17:30/19:00). Ambos comparadores
 * mueren al mutarse, y esta función existe para poder morderlos con horarios de frontera inyectados.
 */
export function franjasOfrecibles(franjas: readonly Franja[]): readonly string[] {
  return FRANJAS_POSIBLES.filter((hora) => {
    const minutos = aMinutos(hora)

    return franjas.some((franja) => minutos >= franja.abre && minutos < franja.cierra)
  })
}

/** Las franjas ofrecibles ESE día: `franjasOfrecibles` cableado al horario real de F-10 (fuente única). */
export function franjasDe(diaSemana: DiaSemana): readonly string[] {
  return franjasOfrecibles(HORARIO_SEMANAL[diaSemana])
}

/**
 * El índice circular normalizado: `((i % n) + n) % n`. Da la vuelta en AMBOS sentidos —avanzar tras el
 * último (i=n → 0) y retroceder antes del primero (i=−1 → n−1)—. El `+ n` existe SOLO para el caso
 * negativo (`-1 % n === -1` en JS): sin él, retroceder desde 0 devuelve un índice inexistente.
 */
export function indiceCircular(indice: number, total: number): number {
  return ((indice % total) + total) % total
}
