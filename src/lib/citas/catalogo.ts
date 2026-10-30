import { CATALOGO_CITAS } from './catalogo-datos.ts'

export { CATALOGO_CITAS }

/**
 * Citas · Fase 3 (issue #30): el catálogo de citas, categoría → subservicio → opción. Lo usan el paso
 * «Servicio» del modal de reserva y el backend (la duración de la opción fija el hueco que se busca).
 * Los datos viven en catalogo-datos.ts y son PROVISIONALES (Excel «Propuestas diseños web»).
 */

export interface OpcionCita {
  readonly id: string
  /** Talla (S, M, L…) cuando la opción la tiene. */
  readonly clave?: string
  readonly etiqueta: string
  /** Euros con IVA; `null` = «Consultar». */
  readonly precio: number | null
  /** Duración; `null` = no se reserva en línea. */
  readonly minutos: number | null
}

export interface SubservicioCita {
  readonly id: string
  readonly nombre: string
  /** Lo que se pregunta para elegir la opción («Selecciona el largo de tu uña:»). */
  readonly pregunta: string
  readonly opciones: readonly OpcionCita[]
}

export interface CategoriaCita {
  readonly id: string
  readonly nombre: string
  readonly subservicios: readonly SubservicioCita[]
}

/** Los precios y tiempos aún no los ha confirmado el salón (issue #25). */
export const CATALOGO_PROVISIONAL = true

/** Una opción se reserva en línea solo si tiene una duración positiva. */
export function esReservable(opcion: OpcionCita): boolean {
  return (opcion.minutos ?? 0) > 0
}

/** Subservicios con alguna opción reservable, cada uno solo con sus opciones reservables. */
export function subserviciosReservables(categoria: CategoriaCita): SubservicioCita[] {
  return categoria.subservicios
    .map((s) => ({ ...s, opciones: s.opciones.filter(esReservable) }))
    .filter((s) => s.opciones.length > 0)
}

/** Categorías con algún subservicio reservable, en el orden del catálogo. */
export function categoriasReservables(
  catalogo: readonly CategoriaCita[] = CATALOGO_CITAS,
): CategoriaCita[] {
  return catalogo
    .map((c) => ({ ...c, subservicios: subserviciosReservables(c) }))
    .filter((c) => c.subservicios.length > 0)
}

export interface OpcionEncontrada {
  readonly categoria: CategoriaCita
  readonly subservicio: SubservicioCita
  readonly opcion: OpcionCita
}

/**
 * Busca una opción por su id; `null` si no existe. Encuentra también las NO reservables (p. ej. «Uña
 * Extra Larga»): quien vaya a reservar debe comprobar `esReservable` antes de buscar huecos.
 */
export function buscarOpcion(
  id: string,
  catalogo: readonly CategoriaCita[] = CATALOGO_CITAS,
): OpcionEncontrada | null {
  for (const categoria of catalogo) {
    for (const subservicio of categoria.subservicios) {
      const opcion = subservicio.opciones.find((o) => o.id === id)
      if (opcion) return { categoria, subservicio, opcion }
    }
  }
  return null
}

/** 45 → «45 min», 60 → «1 h», 75 → «1 h 15 min». */
export function duracionLegible(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas === 0) return `${resto} min`
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`
}
