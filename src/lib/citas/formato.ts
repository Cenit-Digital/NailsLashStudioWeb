/**
 * Citas · Fase 7 (issue #39), @s11: cómo se escriben los días y las horas en el modal, siempre en hora
 * de Madrid. Las fechas «YYYY-MM-DD» de la API ya son días de Madrid; se formatean a mediodía UTC, que
 * en Madrid cae el mismo día. Los `Intl.DateTimeFormat` se crean dentro de las funciones (AGENTS.md).
 */
function partes(fecha: string, opciones: Intl.DateTimeFormatOptions): Record<string, string> {
  const formato = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', ...opciones })
  return Object.fromEntries(
    formato.formatToParts(new Date(`${fecha}T12:00:00Z`)).map((p) => [p.type, p.value]),
  )
}

/** «2026-11-03» → `{ semana: 'mar', dia: '3', mes: 'nov' }`, para los botones del paso «Día». */
export function diaCorto(fecha: string): { semana: string; dia: string; mes: string } {
  const p = partes(fecha, { weekday: 'short', day: 'numeric', month: 'short' })
  return { semana: p.weekday, dia: p.day, mes: p.month }
}

/** «2026-11-03» → «martes 3 de noviembre». */
export function diaLargo(fecha: string): string {
  const p = partes(fecha, { weekday: 'long', day: 'numeric', month: 'long' })
  return `${p.weekday} ${p.day} de ${p.month}`
}

/** Un instante ISO → «HH:MM» en Madrid (la hora de fin del resumen). */
export function horaMadrid(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso))
}
