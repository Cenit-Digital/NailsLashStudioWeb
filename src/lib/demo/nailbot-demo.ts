/**
 * TODO el copy de Nailbot (brief `progress/nailbot_diseno.md` §4 + resoluciones HS-4 y HS-6 de
 * `project-spec.md`). Nailbot es un asistente AUTOMÁTICO con guion local: NO se anuncia como IA (AI Act
 * art. 3.1 + Directrices; `docs/research/asistente-robot/01-legal.md` §5.1). El día que haya servidor
 * con IA, estos textos cambian por el aviso del art. 50.1 (`06-diseno-servidor-futuro.md` §4).
 *
 * El horario del sábado NO se escribe aquí: la frase del sábado lo deriva de `HORARIO.sabado`
 * (fuente única F-02) en la llamada; aquí solo viven los trozos fijos de la frase.
 */

// — Chat (F-23) —
export const NAILBOT_NOMBRE = 'Nailbot'
export const NAILBOT_SUBTITULO = 'Asistente automático · demo'
export const NAILBOT_LEYENDA =
  'Demo · Nailbot responde con opciones predefinidas: no es una persona ni usa inteligencia artificial.'
export const NAILBOT_HILO_ETIQUETA = 'Conversación con Nailbot'

export const NAILBOT_PREGUNTAS = {
  servicio:
    '¡Hola! Soy Nailbot 💅, el asistente automático de Nails Lash Studio. ¿Qué te apetece reservar?',
  dia: '¡Me encanta! ¿Qué día te viene mejor?',
  franja: '¿Prefieres alguna franja horaria?',
  nombre: '¡Casi lo tenemos! ¿A qué nombre hago la solicitud? Si lo prefieres, puedes saltártelo.',
} as const

export const NAILBOT_OPCION_SABADO = 'Un sábado'
export const NAILBOT_FRANJA_SABADO = 'Por la mañana'

export const NAILBOT_OPCIONES = {
  servicio: ['Uñas', 'Pestañas', 'Cejas'],
  dia: ['Entre semana', NAILBOT_OPCION_SABADO, 'Lo antes posible'],
  franja: [NAILBOT_FRANJA_SABADO, 'Por la tarde', 'Me es indiferente'],
} as const

/** «Los sábados abrimos de {apertura} a {cierre}, así que te busco hueco por la mañana.» */
export const NAILBOT_SABADO = {
  antes: 'Los sábados abrimos de ',
  entre: ' a ',
  despues: ', así que te busco hueco por la mañana.',
} as const

export const NAILBOT_SIN_NOMBRE = 'Prefiero no decirlo'
export const NAILBOT_CAMPO_NOMBRE = 'Tu nombre'
export const NAILBOT_CAMPO_PLACEHOLDER = 'Escribe tu nombre…'
export const NAILBOT_ENVIAR = 'Enviar'
export const NAILBOT_ENLACE_FINAL = 'Enviar la reserva por WhatsApp'
export const NAILBOT_REINICIAR = 'Reservar otra cita'

/** «¡Gracias, {nombre}! ✨ Tu solicitud: …» / «¡Gracias! ✨ Tu solicitud: …» (copy de HS-6). */
export const NAILBOT_RESUMEN = {
  conNombreAntes: '¡Gracias, ',
  conNombreDespues: '! ✨ Tu solicitud: ',
  sinNombre: '¡Gracias! ✨ Tu solicitud: ',
  cola: '. Envíasela al salón por WhatsApp con el enlace de abajo y allí te confirmarán la hora exacta.',
} as const

export const NAILBOT_AVISO =
  'Al pulsar se abrirá WhatsApp con este mensaje y tú decides si lo envías. El salón lo usará solo para gestionar tu cita.'

// — Robot flotante (F-24) —
export const NAILBOT_LANZADOR_ETIQUETA = 'Abrir el chat con Nailbot para reservar cita'
export const NAILBOT_PAUSA_ETIQUETA = 'Pausar la animación de Nailbot'
export const NAILBOT_BOCADILLO_DESTACADO = '¿Te pinto una cita? 💅'
export const NAILBOT_BOCADILLO_TEXTO = 'Soy Nailbot y te ayudo a reservar.'
export const NAILBOT_BOCADILLO_CERRAR = 'Cerrar el mensaje de Nailbot'
export const NAILBOT_DIALOGO_TITULO = 'Reserva con Nailbot'
export const NAILBOT_DIALOGO_CERRAR = 'Cerrar el chat'
