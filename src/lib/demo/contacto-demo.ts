/**
 * Texto DEMO prellenado del enlace de WhatsApp (rama demo/lunes-prototipo). `waHref` (F-02) le aplica
 * `encodeURIComponent`. El mensaje lo ENVÍA el usuario desde su WhatsApp: el enlace solo abre el chat
 * con el texto puesto. La composición real de la solicitud (servicio/fecha) es F-13.
 */
export const CONTACTO_WHATSAPP_TEXTO = 'Hola, me gustaría reservar una cita en Nails Lash Studio.'

/**
 * Texto DEMO prellenado del BOTÓN FLOTANTE de WhatsApp (rebanada de F-13). Es una constante PROPIA,
 * distinta de `CONTACTO_WHATSAPP_TEXTO`, para que los dos puntos de entrada (el CTA de #contacto y
 * el flotante) sean DISTINGUIBLES cuando lleguen los mensajes al móvil del salón. `waHref` (F-02) le
 * aplica `encodeURIComponent`. El mensaje lo ENVÍA el usuario desde su propio WhatsApp: el enlace
 * solo abre el chat con el texto puesto, nadie promete que alguien conteste. La composición real de
 * la solicitud (servicio/fecha/profesional) es F-13, no este botón.
 */
export const BOTON_WHATSAPP_FLOTANTE_TEXTO = 'Hola, quiero reservar una cita en Nails Lash Studio.'
