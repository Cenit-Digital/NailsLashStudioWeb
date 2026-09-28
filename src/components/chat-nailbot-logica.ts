import {
  NAILBOT_FRANJA_SABADO,
  NAILBOT_OPCION_SABADO,
  NAILBOT_OPCIONES,
  NAILBOT_PREGUNTAS,
  NAILBOT_RESUMEN,
  NAILBOT_SABADO,
  NAILBOT_SIN_NOMBRE,
} from '../lib/demo/nailbot-demo'
import { HORARIO } from '../lib/site'

/**
 * El CEREBRO de Nailbot (F-23, contrato features/nailbot_chat_compartido.feature): una función PURA
 * `responder(estado, entrada) → estado`. Es la COSTURA del servidor futuro (L4 + HS-7): garantiza la
 * FORMA del estado que pinta la UI y un único punto de sustitución; NO garantiza la sincronía, el
 * texto libre ni el copy legal que traerá la IA (ver docs/research/asistente-robot/06).
 *
 * `responder` va sin reloj, sin azar, sin red, sin storage y sin DOM, y nunca muta la entrada: devuelve
 * objetos nuevos. El módulo aloja además `enfocarPrimerControl`, un ayudante de foco que recibe el nodo
 * como ENTRADA para morderse por valor (mismo patrón que `desplazarAlFinal` en reserva-logica.ts).
 */
export type PasoChat = 'servicio' | 'dia' | 'franja' | 'nombre' | 'hecho'

export interface MensajeChat {
  readonly deBot: boolean
  readonly texto: string
}

export interface RespuestasChat {
  readonly servicio?: string
  readonly dia?: string
  readonly franja?: string
  readonly nombre?: string
}

export interface EstadoChat {
  readonly paso: PasoChat
  readonly mensajes: readonly MensajeChat[]
  readonly respuestas: RespuestasChat
  /** El rango del sábado («HH:MM-HH:MM» o «cerrado»), fijado al construir el estado (@s5). */
  readonly horarioSabado: string
}

export type EntradaChat =
  | { readonly tipo: 'elegir'; readonly valor: string }
  | { readonly tipo: 'nombre'; readonly valor: string }
  | { readonly tipo: 'sinNombre' }
  | { readonly tipo: 'reiniciar' }

type PasoConOpciones = keyof typeof NAILBOT_OPCIONES

const SIGUIENTE: Readonly<Record<PasoConOpciones, PasoChat>> = {
  servicio: 'dia',
  dia: 'franja',
  franja: 'nombre',
}

// Un rango del horario de F-02 con la forma «HH:MM-HH:MM». Cualquier otra cosa («cerrado», «10-14») no lo es.
const RANGO_HORARIO = /^(\d{2}:\d{2})-(\d{2}:\d{2})$/

function bot(texto: string): MensajeChat {
  return { deBot: true, texto }
}

function persona(texto: string): MensajeChat {
  return { deBot: false, texto }
}

/**
 * El estado inicial del guion. El rango del sábado se lee EN LA LLAMADA (nunca en la carga del
 * módulo): por defecto, el dato real `HORARIO.sabado` de la fuente única F-02.
 */
export function estadoInicial(horarioSabado: string = HORARIO.sabado): EstadoChat {
  return {
    paso: 'servicio',
    mensajes: [bot(NAILBOT_PREGUNTAS.servicio)],
    respuestas: {},
    horarioSabado,
  }
}

/** Las opciones cerradas del paso en curso (ninguna en el paso del nombre ni al terminar). */
export function opcionesDelPaso(paso: PasoChat): readonly string[] {
  return paso in NAILBOT_OPCIONES ? NAILBOT_OPCIONES[paso as PasoConOpciones] : []
}

/**
 * La frase del sábado, derivada del rango (L6), o `null` si el rango no es «HH:MM-HH:MM» (HS-3 a):
 * entonces la regla no se aplica y la franja se pregunta como otro día cualquiera.
 */
export function fraseSabado(horarioSabado: string): string | null {
  const rango = RANGO_HORARIO.exec(horarioSabado)

  if (rango === null) {
    return null
  }

  return `${NAILBOT_SABADO.antes}${rango[1]}${NAILBOT_SABADO.entre}${rango[2]}${NAILBOT_SABADO.despues}`
}

/** El resumen final (copy de HS-6): con nombre o, si no lo dio, sin él. */
export function resumenFinal(respuestas: RespuestasChat): string {
  const saludo =
    respuestas.nombre === undefined
      ? NAILBOT_RESUMEN.sinNombre
      : `${NAILBOT_RESUMEN.conNombreAntes}${respuestas.nombre}${NAILBOT_RESUMEN.conNombreDespues}`

  return `${saludo}${respuestas.servicio} · ${respuestas.dia} · ${respuestas.franja}${NAILBOT_RESUMEN.cola}`
}

function elegir(estado: EstadoChat, valor: string): EstadoChat {
  const paso = estado.paso as PasoConOpciones
  const respuestas = { ...estado.respuestas, [paso]: valor }
  const conPersona = [...estado.mensajes, persona(valor)]
  // «Un sábado» solo existe como opción del paso del día (NAILBOT_OPCIONES.dia).
  const sabado = valor === NAILBOT_OPCION_SABADO ? fraseSabado(estado.horarioSabado) : null

  if (sabado !== null) {
    // El sábado solo abre por la mañana: la franja la IMPONE el horario, nadie la elige (HS-2).
    return {
      ...estado,
      paso: 'nombre',
      respuestas: { ...respuestas, franja: NAILBOT_FRANJA_SABADO },
      mensajes: [...conPersona, bot(sabado), bot(NAILBOT_PREGUNTAS.nombre)],
    }
  }

  const siguiente = SIGUIENTE[paso]

  return {
    ...estado,
    paso: siguiente,
    respuestas,
    mensajes: [...conPersona, bot(NAILBOT_PREGUNTAS[siguiente as keyof typeof NAILBOT_PREGUNTAS])],
  }
}

function terminar(estado: EstadoChat, burbuja: string, nombre: string | undefined): EstadoChat {
  const respuestas = nombre === undefined ? estado.respuestas : { ...estado.respuestas, nombre }

  return {
    ...estado,
    paso: 'hecho',
    respuestas,
    mensajes: [...estado.mensajes, persona(burbuja), bot(resumenFinal(respuestas))],
  }
}

/** Sustituye cada surrogate UTF-16 suelto por U+FFFD: el texto queda «bien formado» para codificarlo. */
export function sinSurrogatesSueltos(texto: string): string {
  // SIN aserción lookbehind: Safari/iOS anterior a 16.4 no la soporta y el literal lanzaría SyntaxError al
  // ejecutarse (hallazgo del judge delta). Se casa un PAR válido o un surrogate suelto, y solo el suelto
  // se sustituye. La expresión se construye EN LA LLAMADA (un literal de módulo es un mutante estático).
  return texto.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g, (encontrado) =>
    encontrado.length === 2 ? encontrado : '\uFFFD',
  )
}

/** La costura: dado un estado y una acción de la persona, el estado siguiente. PURA. */
export function responder(estado: EstadoChat, entrada: EntradaChat): EstadoChat {
  if (entrada.tipo === 'reiniciar') {
    return estadoInicial(estado.horarioSabado)
  }

  if (entrada.tipo === 'elegir') {
    return elegir(estado, entrada.valor)
  }

  if (entrada.tipo === 'sinNombre') {
    return terminar(estado, NAILBOT_SIN_NOMBRE, undefined)
  }

  if (entrada.tipo === 'nombre') {
    return conNombre(estado, entrada.valor)
  }

  // Una entrada que no reconoce no cambia NADA. No lo pide ningún escenario: hace OBSERVABLE cada uno
  // de los cuatro `tipo` (si no, el último sería la rama por defecto y su literal, un mutante
  // equivalente) y así la mutación llega al 100 %. Decisión del lead, anotada en el diario TDD.
  return estado
}

function conNombre(estado: EstadoChat, valor: string): EstadoChat {
  // El nombre se interpola ENTERO (sin truncar); vacío o solo espacios no añade NADA (reserva_chat @s14).
  // Un surrogate UTF-16 suelto (un emoji partido al pegar o borrar) haría lanzar a encodeURIComponent
  // al componer el enlace y rompería el chat: se sustituye por U+FFFD (hallazgo del security_reviewer).
  const nombre = sinSurrogatesSueltos(valor.trim())

  if (nombre === '') {
    return estado
  }

  return terminar(estado, nombre, nombre)
}

/** Lo MÍNIMO que `enfocarPrimerControl` necesita de un nodo (apto para jsdom y para tests por valor). */
export interface ContenedorDeControles {
  querySelector(selector: string): { focus(): void } | null
}

/** Los controles que pueden recibir el foco en el pie del chat, en el orden del DOM. */
export const SELECTOR_CONTROLES = 'button, input, a[href]'

/**
 * Tras cada acción de la persona, el foco pasa al PRIMER control del paso nuevo (HS-4 b): el primer
 * chip, el campo del nombre o el enlace final. La guarda del contenedor sin montar se muerde por valor.
 */
export function enfocarPrimerControl(contenedor: ContenedorDeControles | null): void {
  if (contenedor === null) {
    return
  }

  contenedor.querySelector(SELECTOR_CONTROLES)?.focus()
}
