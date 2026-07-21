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
