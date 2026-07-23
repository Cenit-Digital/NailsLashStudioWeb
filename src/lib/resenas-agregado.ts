/**
 * El dato AGREGADO real de las reseñas del salón en Treatwell (F-14, contrato
 * `features/resenas_agregado_enlace.feature` @s2/@s3). MEDIDO EN VIVO el 2026-07-23 sobre la
 * ficha pública: 4,9 · 1.239 opiniones. El dato es real y la fecha también: no se inventa ni se
 * redondea. Si el dato caduca (la nota de Treatwell cambia), se actualiza ESTE módulo — nunca el
 * componente, que lo lee por valor.
 *
 * Raíl legal (brief v3 §2, art. 20.4 TRLGDCU): la nota agregada SOLO puede mostrarse con
 * plataforma declarada + enlace a la fuente + fecha del dato. Los tres viajan aquí juntos.
 *
 * [OJO estáticos, brief v3 §7] Este módulo exporta el objeto LITERAL y NADA MÁS: ninguna
 * derivación (formato de fecha, texto compuesto, estrellas) se ejecuta en su carga. El formateo
 * para UI vive en funciones puras (`src/components/resenas-logica.ts`) llamadas en el render,
 * donde Stryker puede activar sus mutantes. Derivar aquí fabricaría mutantes ESTÁTICOS que el
 * runner no alcanza (`progress/tdd_deuda_mutacion_full.md`).
 */
export interface AgregadoDeResenas {
  /** La nota media publicada por la plataforma, tal cual (number con punto: no es literal de UI). */
  readonly nota: number
  /** El total de opiniones contadas por la plataforma. */
  readonly total: number
  /** La plataforma de origen, declarada SIEMPRE junto a la nota. */
  readonly plataforma: string
  /** El enlace EXTERNO a la fuente del dato. */
  readonly url: string
  /** El día en que se midió el dato, en ISO (`aaaa-mm-dd`). */
  readonly fechaDelDato: string
}

export const AGREGADO_DE_RESENAS: AgregadoDeResenas = {
  nota: 4.9,
  total: 1239,
  plataforma: 'Treatwell',
  url: 'https://www.treatwell.es/establecimiento/nails-lash-studio/',
  fechaDelDato: '2026-07-23',
}
