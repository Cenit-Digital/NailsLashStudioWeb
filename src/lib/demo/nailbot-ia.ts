/**
 * Copy del modo IA de Nailbot (issue #35, enmienda N-1bis/N-4bis de `project-spec.md`). Solo se
 * pinta en un build con `VITE_NAILBOT_API_URL`; el copy de la demo sigue en `nailbot-demo.ts`.
 */

/** Insignia persistente (N-1bis): sustituye al subtítulo «Asistente automático · demo». */
export const NAILBOT_IA_SUBTITULO = 'Asistente de IA'
/** Línea fija (N-1bis): visible durante TODA la conversación, también antes del primer turno. */
export const NAILBOT_IA_LEYENDA =
  'Hablas con un sistema de inteligencia artificial, no con una persona'
export const NAILBOT_IA_CAMPO = 'Mensaje'
export const NAILBOT_IA_PLACEHOLDER = 'Escribe tu pregunta…'
export const NAILBOT_IA_ENVIAR = 'Enviar'
export const NAILBOT_IA_ESPERA = 'Escribiendo…'
export const NAILBOT_IA_ENLACE_SOLICITUD = 'Enviar al salón por WhatsApp'

/** Nota del fallback (N-4bis): el chat de IA falló y sigue el guion local, con el contacto del salón. */
export const NAILBOT_IA_SIN_IA = {
  antes:
    'El asistente de IA no está disponible ahora. Puedes seguir con este guion, escribirnos por ',
  whatsapp: 'WhatsApp',
  entre: ' o llamar al ',
  despues: '.',
} as const
export const NAILBOT_IA_SIN_IA_WHATSAPP_TEXTO = 'Hola, quiero consultar una cita.'
