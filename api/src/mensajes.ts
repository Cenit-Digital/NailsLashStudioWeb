import { duracionLegible, type OpcionEncontrada } from '../../src/lib/citas/catalogo.ts'
import { DIRECCION, NOMBRE, TELEFONO } from '../../src/lib/site.ts'

/**
 * Citas · Fase 6 (issue #37): los textos que genera el backend, el título del evento (@s20) y los
 * emails a la clienta y al salón (@s21). Puros: sin red ni reloj. Fechas y horas, siempre en Madrid.
 * Sin cadenas ni `Intl` a nivel de módulo (convención de mutación de AGENTS.md).
 */

export interface DatosCita {
  readonly encontrada: OpcionEncontrada
  /** Instantes ISO en UTC, `[inicio, fin)`. */
  readonly inicio: string
  readonly fin: string
  readonly minutos: number
  readonly nombre: string
  readonly telefono: string
  readonly email: string
}

export interface Correo {
  readonly asunto: string
  readonly texto: string
}

function partesMadrid(iso: string): Record<string, string> {
  const formato = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

  return Object.fromEntries(formato.formatToParts(new Date(iso)).map((p) => [p.type, p.value]))
}

function diaLegible(iso: string): string {
  const p = partesMadrid(iso)
  return `${p.weekday} ${p.day} de ${p.month}`
}

function horaLegible(iso: string): string {
  const p = partesMadrid(iso)
  return `${p.hour}:${p.minute}`
}

/** La fecha de pared `'YYYY-MM-DD'` de Madrid de un instante (la clave del bloqueo por día). */
export function fechaMadrid(iso: string): string {
  // Con todas las opciones explícitas: sin ellas (la zona del sistema) el día sale sin cero inicial.
  const formato = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const p = Object.fromEntries(formato.formatToParts(new Date(iso)).map((x) => [x.type, x.value]))

  return `${p.year}-${p.month}-${p.day}`
}

function servicio({ encontrada }: DatosCita): string {
  return `${encontrada.categoria.nombre} · ${encontrada.subservicio.nombre} (${encontrada.opcion.etiqueta})`
}

function precio({ encontrada }: DatosCita): string {
  const euros = encontrada.opcion.precio
  return euros === null ? 'a consultar en el salón' : `${euros} € (orientativo)`
}

function resumen(cita: DatosCita): string[] {
  return [
    `Servicio: ${servicio(cita)}`,
    `Día: ${diaLegible(cita.inicio)}`,
    `Hora: de ${horaLegible(cita.inicio)} a ${horaLegible(cita.fin)} (${duracionLegible(cita.minutos)})`,
    `Precio: ${precio(cita)}`,
  ]
}

/** «Manicura · Manicura Completa … (Uña Mediana) — Ana» (@s20). */
export function tituloEvento(cita: DatosCita): string {
  return `${servicio(cita)} — ${cita.nombre}`
}

/** La descripción del evento: lo que el salón necesita ver en la tablet. */
export function descripcionEvento(cita: DatosCita): string {
  return [
    'Reserva hecha en la web.',
    `Clienta: ${cita.nombre}`,
    `Teléfono: ${cita.telefono}`,
    `Email: ${cita.email}`,
    `Duración: ${duracionLegible(cita.minutos)}`,
    `Precio: ${precio(cita)}`,
  ].join('\n')
}

export function emailClienta(cita: DatosCita): Correo {
  const d = DIRECCION
  const direccion = `${d.centroComercial}, ${d.via}, ${d.local}, ${d.planta}, ${d.codigoPostal} ${d.localidad}`

  return {
    asunto: `Cita confirmada: ${diaLegible(cita.inicio)} a las ${horaLegible(cita.inicio)}`,
    texto: [
      `Hola, ${cita.nombre}:`,
      '',
      `Tu cita en ${NOMBRE} está confirmada.`,
      '',
      ...resumen(cita),
      `Dirección: ${direccion}`,
      '',
      `Si necesitas cancelar o cambiar la cita, llama al salón: ${TELEFONO.legible}.`,
      '',
      NOMBRE,
    ].join('\n'),
  }
}

export function emailSalon(cita: DatosCita): Correo {
  return {
    asunto: `Nueva cita web: ${cita.nombre}, ${diaLegible(cita.inicio)} a las ${horaLegible(cita.inicio)}`,
    texto: [
      'Nueva cita reservada en la web.',
      '',
      ...resumen(cita),
      '',
      `Clienta: ${cita.nombre}`,
      `Teléfono: ${cita.telefono}`,
      `Email: ${cita.email}`,
      '',
      'La cita ya está en el calendario.',
    ].join('\n'),
  }
}
