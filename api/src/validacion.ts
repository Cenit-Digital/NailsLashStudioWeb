import { buscarOpcion, esReservable, type OpcionEncontrada } from '../../src/lib/citas/catalogo.ts'

/**
 * Citas · Fase 6 (issue #37): la validación de `POST /reservas` en el servidor. Contrato:
 * features/reserva_citas.feature @s27 (opción inexistente o no reservable) y las reglas de @s18, que
 * el modal comprueba en el navegador pero aquí se repiten porque la petición puede no venir de él.
 *
 * Nada de lo que escribe la clienta llega a una cabecera de email ni al título del evento con saltos
 * de línea: el nombre rechaza los caracteres de control y el email, cualquier espacio.
 */

export interface PeticionReserva {
  readonly opcion: string
  /** El `inicio` ISO UTC tal cual lo dio `horasDisponibles` (contrato de la Fase 5). */
  readonly inicio: string
  readonly nombre: string
  readonly telefono: string
  readonly email: string
  /** UUID que genera el modal para cada reserva: la clave de idempotencia (@s24). */
  readonly clave: string
  readonly turnstile: string
}

export type ResultadoValidacion =
  | {
      readonly ok: true
      readonly peticion: PeticionReserva
      readonly encontrada: OpcionEncontrada
      readonly minutos: number
    }
  | { readonly ok: false; readonly campo: string }

function esTexto(valor: unknown): valor is string {
  return typeof valor === 'string'
}

function sinControl(texto: string): boolean {
  return Array.from(texto).every((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) !== 127)
}

/** La opción del catálogo si existe y se reserva en línea (@s27); si no, `null`. */
export function opcionReservable(id: unknown): OpcionEncontrada | null {
  const encontrada = esTexto(id) ? buscarOpcion(id) : null
  return encontrada !== null && esReservable(encontrada.opcion) ? encontrada : null
}

/** Valida y normaliza el cuerpo; si falla, dice el primer campo inválido. */
export function validarReserva(cuerpo: unknown): ResultadoValidacion {
  if (typeof cuerpo !== 'object' || cuerpo === null || Array.isArray(cuerpo)) {
    return { ok: false, campo: 'cuerpo' }
  }
  const c = cuerpo as Record<string, unknown>

  const encontrada = opcionReservable(c.opcion)
  if (encontrada === null) return { ok: false, campo: 'opcion' }

  // Solo el ISO UTC canónico (`toISOString`) de una media hora: una fecha imposible no pasa.
  if (
    !esTexto(c.inicio) ||
    !c.inicio.endsWith(':00.000Z') ||
    Number.isNaN(Date.parse(c.inicio)) ||
    new Date(c.inicio).toISOString() !== c.inicio
  ) {
    return { ok: false, campo: 'inicio' }
  }

  const nombre = esTexto(c.nombre) ? c.nombre.trim() : ''
  if (nombre.length === 0 || nombre.length > 80 || !sinControl(nombre)) {
    return { ok: false, campo: 'nombre' }
  }

  const telefono = esTexto(c.telefono) ? c.telefono.trim() : null
  if (
    telefono === null ||
    telefono.length > 20 ||
    !/^[\d +()-]+$/.test(telefono) ||
    telefono.replace(/\D/g, '').length < 9
  ) {
    return { ok: false, campo: 'telefono' }
  }

  const email = esTexto(c.email) ? c.email.trim() : null
  if (email === null || email.length > 254 || !/^[\w.%+-]+@[\w.-]+\.[a-z]{2,}$/i.test(email)) {
    return { ok: false, campo: 'email' }
  }

  if (
    !esTexto(c.clave) ||
    !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/.test(c.clave)
  ) {
    return { ok: false, campo: 'clave' }
  }

  if (!esTexto(c.turnstile) || c.turnstile.length === 0 || c.turnstile.length > 2048) {
    return { ok: false, campo: 'turnstile' }
  }

  return {
    ok: true,
    peticion: {
      opcion: c.opcion as string,
      inicio: c.inicio,
      nombre,
      telefono,
      email,
      clave: c.clave,
      turnstile: c.turnstile,
    },
    encontrada,
    minutos: encontrada.opcion.minutos as number,
  }
}
