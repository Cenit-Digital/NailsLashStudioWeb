/**
 * Texto DEMO prellenado del enlace de WhatsApp de la sección `#reserva` (columna izquierda del
 * prototipo Opción-1-Rosa). Es una constante PROPIA, distinta de `CONTACTO_WHATSAPP_TEXTO`, para
 * que los DOS puntos de entrada (el CTA de #contacto y este) sean DISTINGUIBLES cuando lleguen los
 * mensajes al móvil del salón. (El botón flotante de WhatsApp y su constante propia se retiraron:
 * commit 479d541.)
 *
 * `waHref` (F-02) le aplica `encodeURIComponent`. El mensaje lo ENVÍA el usuario desde su propio
 * WhatsApp: el enlace solo abre el chat con el texto puesto, nadie promete que alguien conteste. La
 * composición real de la solicitud (servicio/fecha/hora/profesional) es F-13, NO este enlace: el
 * texto es FIJO y genérico a propósito.
 */
export const RESERVA_WHATSAPP_TEXTO = 'Hola, quiero reservar por chat en Nails Lash Studio.'
