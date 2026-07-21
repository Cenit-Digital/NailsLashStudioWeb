/**
 * Núcleo PURO de la sección de reserva (feature `reserva_chat`, contrato
 * features/reserva_chat.feature @s19). Decide la CLAVE de estilo de una burbuja del chat sin que el
 * componente asome ningún `className` condicional: con `css:false` (vitest.config.ts) las dos ramas
 * de un ternario `className={cond ? a : b}` valen `undefined` y el mutante que invierte la condición
 * produce EXACTAMENTE el mismo DOM → sobrevive (medido en `cabecera.test.tsx` @s15). Sacando la
 * decisión a esta función pura, el mutante muere POR VALOR.
 */
export type ClaveBurbuja = 'burbujaBot' | 'burbujaUsuario'

export function claveBurbuja(deBot: boolean): ClaveBurbuja {
  return deBot ? 'burbujaBot' : 'burbujaUsuario'
}

/**
 * Los cuatro datos que la clienta contesta en el guion del chat (contrato @s23), ya listos para
 * componer el mensaje de WhatsApp.
 */
export interface SolicitudReserva {
  readonly servicio: string
  readonly dia: string
  readonly franja: string
  readonly nombre: string
}

/**
 * Compone, en castellano natural, la solicitud que la clienta enviará por WhatsApp al terminar el
 * chat (features/reserva_chat.feature @s23/@s24, decisión de Pablo: «que acabe abriendo WhatsApp
 * con la reserva ya escrita»). Función PURA: mismos cuatro argumentos, mismo texto siempre. El
 * `.tsx` NUNCA compone este texto inline: solo llama a esta función y se lo pasa a `waHref`.
 */
export function mensajeReserva({ servicio, dia, franja, nombre }: SolicitudReserva): string {
  return `Hola, quiero reservar: ${servicio} · ${dia} · ${franja}. Me llamo ${nombre} y os escribo desde la web. ¿Podéis confirmarme la hora exacta?`
}
