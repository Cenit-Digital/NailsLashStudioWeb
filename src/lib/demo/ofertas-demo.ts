/**
 * DATOS DEMO de ofertas (rama demo/lunes-prototipo). NO entra en `registros` de F-01. Ofertas de
 * MUESTRA sobre las categorías REALES (Uñas · Pestañas · Cejas) — se sustituye «Martes de Facial»
 * del prototipo por una oferta de cejas, porque este salón no ofrece Facial. Van con leyenda visible
 * de «muestra, pendientes de confirmar»: ningún importe se presenta como oferta real vigente.
 */
export interface OfertaDemo {
  readonly titulo: string
  readonly desc: string
  readonly precio: string
  readonly antes: string
  readonly badge: string
}

export const OFERTAS_DEMO: readonly OfertaDemo[] = [
  { titulo: 'Pack Manos Perfectas', desc: 'Manicura semipermanente + diseño en dos uñas.', precio: '29 €', antes: '35 €', badge: '−17%' },
  { titulo: 'Dúo Uñas + Pestañas', desc: 'Manicura + lifting de pestañas en una sola visita.', precio: '55 €', antes: '65 €', badge: 'Ahorra 10 €' },
  { titulo: 'Cejas de diez', desc: 'Diseño + laminado de cejas con acabado natural.', precio: '35 €', antes: '42 €', badge: 'Solo este mes' },
]

export const LEYENDA_OFERTAS = 'Ofertas de muestra · pendientes de confirmar con el salón'
