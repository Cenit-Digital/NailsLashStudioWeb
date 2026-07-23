/**
 * DATOS DEMO de la sección de reseñas (F-14). Contrato: `features/resenas_agregado_enlace.feature`
 * (@s4, @s5).
 *
 * ❌ RAÍL LEGAL DURO (brief v3 §2 + `docs/research/legal-treatwell.md`): republicar reseñas de
 * Treatwell viola sus términos (cl. 4.2/9.1: el salón «no tiene ningún derecho sobre las
 * reseñas»), la PI del texto (art. 17 TRLPI) y el RGPD por los nombres. Estos SEIS testimonios son
 * INVENTADOS COMO EJEMPLO — redactados de cero para esta demo, sin copiar ni parafrasear ningún
 * texto real — y se declaran como tales con la leyenda visible (`LEYENDA_RESENAS`, patrón
 * `LEYENDA_EQUIPO`). El día que haya reseñas reales captadas con consentimiento EN EL SALÓN, se
 * sustituye ESTE módulo (los datos viven fuera del JSX, retirables sin desplegar código).
 *
 * DISYUNCIÓN con el `reviewPool` de `equipo-demo.ts` (@s4): ni un texto repetido, ni una autora
 * que coincida siquiera en el nombre de pila — dos secciones no pueden mostrar «a la misma
 * clienta». El nombre de pila SIN inicial también los separa del patrón «María L.» de #equipo.
 * Las notas son ENTERAS (4 o 5) y al menos una es 4: la estrella vacía de @s7 existe de verdad.
 * Los servicios son los REALES del salón (Uñas · Pestañas · Cejas · Nail art · Pedicura).
 *
 * Este módulo es DATO de demo: queda FUERA de `mutate` (precedente `equipo-demo.ts`).
 */
export interface TestimonioDemo {
  readonly autora: string
  readonly texto: string
  readonly nota: number
  readonly servicio: string
}

export const TESTIMONIOS_DEMO: readonly TestimonioDemo[] = [
  {
    autora: 'Carmen',
    texto: 'Pedí una manicura sencilla y acerté de pleno. Dos semanas después sigue intacta.',
    nota: 5,
    servicio: 'Uñas',
  },
  {
    autora: 'Silvia',
    texto: 'Las extensiones quedaron ligeras y naturales. Nadie diría que no son mías.',
    nota: 5,
    servicio: 'Pestañas',
  },
  {
    autora: 'Rocío',
    texto: 'Me diseñaron las cejas respetando mi forma natural. El resultado me encanta.',
    nota: 4,
    servicio: 'Cejas',
  },
  {
    autora: 'Teresa',
    texto: 'Llevé una foto de inspiración y lo bordaron. Cada uña es una pequeña obra.',
    nota: 5,
    servicio: 'Nail art',
  },
  {
    autora: 'Irene',
    texto: 'La pedicura más completa que me han hecho. Salí como nueva.',
    nota: 5,
    servicio: 'Pedicura',
  },
  {
    autora: 'Mónica',
    texto: 'Reservé a última hora y me atendieron igual de bien. Volveré con mi hermana.',
    nota: 4,
    servicio: 'Uñas',
  },
]

/**
 * La leyenda de honestidad (@s5), VISIBLE en la sección: los testimonios son de ejemplo y la nota
 * agregada procede de Treatwell — el aviso del art. 20.4 TRLGDCU va INTEGRADO aquí, sin banner
 * (decisión de Pablo, brief v3 §2). Si cambia una coma, cambia el contrato primero.
 */
export const LEYENDA_RESENAS =
  'Testimonios de ejemplo · textos de muestra pendientes de sustituir por reseñas reales de clientas del salón; la nota agregada procede de Treatwell.'
