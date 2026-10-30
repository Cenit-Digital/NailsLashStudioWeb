import {
  buscarOpcion,
  categoriasReservables,
  duracionLegible,
  type OpcionCita,
} from './catalogo.ts'
import type { CitaConfirmada, PeticionCita, ResultadoReserva } from './cliente-api.ts'
import {
  type CampoClienta,
  type DatosClienta,
  type ErroresDatos,
  mensajeDeCampo,
  validarDatos,
} from './datos-clienta.ts'
import type { Hueco } from './disponibilidad.ts'
import { diaLargo, horaMadrid } from './formato.ts'

/**
 * Citas · Fase 7 (issue #39): la máquina de pasos del modal (@s1-@s25), pura. El componente solo
 * pinta el estado y despacha eventos; la red la hace él cuando `enviando` pasa a `true`.
 *
 * La clave de idempotencia (@s24, contrato de #37): una por reserva. Se conserva mientras no cambie
 * nada de lo que se envía (doble clic, «Reintentar»); si cambian la opción, la hora o los datos, el
 * evento `enviar` trae una nueva y se usa esa.
 */
export type Paso = 'servicio' | 'dia' | 'hora' | 'datos' | 'resumen' | 'confirmada'

export interface EstadoReserva {
  readonly paso: Paso
  readonly categoria: string | null
  readonly subservicio: string | null
  readonly opcion: string | null
  readonly fecha: string | null
  readonly hueco: Hueco | null
  readonly datos: DatosClienta
  readonly errores: ErroresDatos
  readonly clave: string | null
  /** Lo que se envió con `clave`: si cambia, la clave ya no vale. */
  readonly firma: string | null
  readonly enviando: boolean
  /** Aviso del paso actual: el 409 en «Hora», o el fallo de verificación o de servidor en el resumen. */
  readonly aviso: string | null
  /** En el resumen, tras un fallo: se ofrece «Reintentar» (y, si es de servidor, llamar). */
  readonly fallo: 'verificacion' | 'error' | null
  readonly cita: CitaConfirmada | null
}

export type EventoReserva =
  | { readonly tipo: 'categoria' | 'subservicio' | 'opcion'; readonly id: string }
  | { readonly tipo: 'dia'; readonly fecha: string }
  | { readonly tipo: 'hora'; readonly hueco: Hueco }
  | { readonly tipo: 'escribir'; readonly campo: CampoClienta; readonly valor: string }
  | { readonly tipo: 'continuar' | 'atras' | 'revisar' | 'reiniciar' }
  | { readonly tipo: 'enviar'; readonly claveNueva: string }
  | { readonly tipo: 'respuesta'; readonly resultado: ResultadoReserva }

export function estadoInicial(): EstadoReserva {
  return {
    paso: 'servicio',
    categoria: null,
    subservicio: null,
    opcion: null,
    fecha: null,
    hueco: null,
    datos: { nombre: '', telefono: '', email: '' },
    errores: {},
    clave: null,
    firma: null,
    enviando: false,
    aviso: null,
    fallo: null,
    cita: null,
  }
}

/** «Paso n de 4» de los cuatro pasos; el resumen y la confirmación no cuentan. */
export function numeroDePaso(paso: Paso): number | null {
  const n = ['servicio', 'dia', 'hora', 'datos'].indexOf(paso)
  return n === -1 ? null : n + 1
}

/** @s10: «Continuar» solo con lo del paso elegido. */
export function puedeContinuar(estado: EstadoReserva): boolean {
  switch (estado.paso) {
    case 'servicio':
      return estado.opcion !== null
    case 'dia':
      return estado.fecha !== null
    case 'hora':
      return estado.hueco !== null
    default:
      return false
  }
}

const ANTERIOR: Partial<Record<Paso, Paso>> = {
  dia: 'servicio',
  hora: 'dia',
  datos: 'hora',
  resumen: 'datos',
}
const SIGUIENTE: Partial<Record<Paso, Paso>> = { servicio: 'dia', dia: 'hora', hora: 'datos' }

function firmaDe(estado: EstadoReserva, inicio: string): string {
  const { nombre, telefono, email } = estado.datos
  return JSON.stringify([estado.opcion, inicio, nombre, telefono, email])
}

function alResponder(estado: EstadoReserva, resultado: ResultadoReserva): EstadoReserva {
  const base = { ...estado, enviando: false }
  switch (resultado.tipo) {
    case 'confirmada':
      return { ...base, paso: 'confirmada', cita: resultado.cita, aviso: null, fallo: null }
    case 'hora-ocupada':
      return { ...base, paso: 'hora', hueco: null, aviso: resultado.mensaje, fallo: null }
    case 'campo':
      return {
        ...base,
        paso: 'datos',
        errores: { [resultado.campo]: mensajeDeCampo(resultado.campo) },
        aviso: null,
        fallo: null,
      }
    default:
      return { ...base, aviso: resultado.mensaje, fallo: resultado.tipo }
  }
}

export function reducirReserva(estado: EstadoReserva, evento: EventoReserva): EstadoReserva {
  switch (evento.tipo) {
    case 'categoria':
      return { ...estado, categoria: evento.id, subservicio: null, opcion: null }
    case 'subservicio':
      return { ...estado, subservicio: evento.id, opcion: null }
    case 'opcion':
      // Otra opción cambia la duración: el día y la hora elegidos ya no valen.
      return { ...estado, opcion: evento.id, fecha: null, hueco: null }
    case 'dia':
      return { ...estado, fecha: evento.fecha, hueco: null }
    case 'hora':
      return { ...estado, hueco: evento.hueco, aviso: null }
    case 'escribir':
      return {
        ...estado,
        datos: { ...estado.datos, [evento.campo]: evento.valor },
        errores: { ...estado.errores, [evento.campo]: undefined },
      }
    case 'continuar': {
      const siguiente = SIGUIENTE[estado.paso]
      return puedeContinuar(estado) && siguiente
        ? { ...estado, paso: siguiente, aviso: null }
        : estado
    }
    case 'atras': {
      const anterior = ANTERIOR[estado.paso]
      return anterior && !estado.enviando
        ? { ...estado, paso: anterior, aviso: null, fallo: null }
        : estado
    }
    case 'revisar': {
      if (estado.paso !== 'datos') return estado
      const validacion = validarDatos(estado.datos)
      return validacion.ok
        ? { ...estado, paso: 'resumen', datos: validacion.datos, errores: {} }
        : { ...estado, errores: validacion.errores }
    }
    case 'enviar': {
      if (estado.paso !== 'resumen' || estado.enviando || estado.hueco === null) return estado
      const firma = firmaDe(estado, estado.hueco.inicio)
      const clave = estado.firma === firma && estado.clave ? estado.clave : evento.claveNueva
      return { ...estado, clave, firma, enviando: true, aviso: null, fallo: null }
    }
    case 'respuesta':
      return estado.enviando ? alResponder(estado, evento.resultado) : estado
    default:
      return estadoInicial()
  }
}

/** El cuerpo de `POST /reservas` mientras se envía; `null` si no hay nada que enviar. */
export function peticionDe(estado: EstadoReserva, turnstile: string): PeticionCita | null {
  if (
    !estado.enviando ||
    estado.opcion === null ||
    estado.hueco === null ||
    estado.clave === null
  ) {
    return null
  }
  return {
    opcion: estado.opcion,
    inicio: estado.hueco.inicio,
    ...estado.datos,
    clave: estado.clave,
    turnstile,
  }
}

/** 29 → «29 €»; sin precio, «Consultar». */
export function precioLegible(precio: number | null): string {
  return precio === null ? 'Consultar' : `${precio} €`
}

/** «Uña Mediana · 29 € · 1 h» (@s9). */
export function etiquetaOpcion(opcion: OpcionCita): string {
  return `${opcion.etiqueta} · ${precioLegible(opcion.precio)} · ${duracionLegible(opcion.minutos ?? 0)}`
}

export interface Resumen {
  readonly servicio: string
  readonly dia: string
  readonly inicio: string
  readonly fin: string
  readonly duracion: string
  readonly precio: string
}

/** @s19: el resumen de lo elegido; `null` si falta algo. */
export function resumenDe(estado: EstadoReserva): Resumen | null {
  // `String(null)` es «null», que no es ninguna opción: buscarOpcion da null.
  const encontrada = buscarOpcion(String(estado.opcion))
  if (encontrada === null || estado.fecha === null || estado.hueco === null) return null
  const { categoria, subservicio, opcion } = encontrada
  return {
    servicio: `${categoria.nombre} · ${subservicio.nombre} (${opcion.etiqueta})`,
    dia: diaLargo(estado.fecha),
    inicio: estado.hueco.hora,
    fin: horaMadrid(estado.hueco.fin),
    duracion: duracionLegible(opcion.minutos ?? 0),
    precio: precioLegible(opcion.precio),
  }
}

/** Lo que muestra el paso «Servicio»: las categorías y, según lo elegido, subservicios y opciones. */
export function vistaServicio(estado: EstadoReserva) {
  const categorias = categoriasReservables()
  const categoria = categorias.find((c) => c.id === estado.categoria) ?? null
  const subservicio = categoria?.subservicios.find((s) => s.id === estado.subservicio) ?? null
  return { categorias, categoria, subservicio }
}
