/**
 * DATOS DEMO del equipo (rama demo/lunes-prototipo). Contrato: features/equipo_reservas.feature.
 *
 * SIETE perfiles de MUESTRA (nombres y orden de `salon-data.js` → team). Los ROLES se conservan del
 * prototipo (describen a la persona), pero las ESPECIALIDADES se CORRIGEN a las categorías REALES del
 * salón (Uñas · Pestañas · Cejas, más Nail art y Pedicura del catálogo de uñas): «Facial» y
 * «Depilación» son de un salón genérico y este negocio NO los ofrece (mismo deslinde que hizo
 * `ofertas-demo.ts`). Marta y Nerea comparten par pero en ORDEN distinto: el orden es dato, no azar.
 *
 * Los datos viven FUERA del JSX (retirables sin desplegar código, como exige `feature_list.json` §18)
 * y van con `LEYENDA_EQUIPO` visible: ningún nombre ni reseña se presenta como real (D1/D2). Las
 * reseñas salen del `reviewPool` de `salon-data.js` (10 disponibles), repartidas de modo que dos
 * tarjetas contiguas no arrancan con la misma (D5) y cada rotación tiene al menos tres distintas.
 */
export interface ResenaDemo {
  readonly autora: string
  readonly texto: string
}

export interface ProfesionalDemo {
  readonly nombre: string
  readonly rol: string
  readonly especialidades: readonly [string, string]
  readonly resenas: readonly ResenaDemo[]
}

const RESENAS: readonly ResenaDemo[] = [
  { autora: 'María L.', texto: 'Un trato espectacular y un resultado perfecto. Repetiré sin duda.' },
  { autora: 'Elena R.', texto: 'Mis uñas nunca habían durado tanto. Profesionales de verdad.' },
  { autora: 'Cristina P.', texto: 'Súper detallistas y muy limpias. Salí encantada del salón.' },
  { autora: 'Sonia G.', texto: 'El mejor sitio de la zona, con diferencia. 100% recomendable.' },
  { autora: 'Beatriz M.', texto: 'Ambiente relajante y acabado impecable. Me encantó todo.' },
  { autora: 'Raquel D.', texto: 'Puntuales, cuidadosas y con un gusto exquisito. Cinco estrellas.' },
  { autora: 'Laura F.', texto: 'Me asesoraron genial con el diseño. Quedó precioso, gracias.' },
  { autora: 'Patricia V.', texto: 'Trato cercano y resultado de diez. Ya soy clienta fija.' },
  { autora: 'Nuria S.', texto: 'Higiene impecable y auténticas manos de artista. Muy contenta.' },
  { autora: 'Alba C.', texto: 'Conseguí justo lo que quería. Volveré segurísimo.' },
]

/** Toma una rotación (≥3) del `RESENAS` por índices; reparto pensado para que las contiguas difieran. */
function rotacion(...indices: readonly number[]): readonly ResenaDemo[] {
  return indices.map((indice) => RESENAS[indice])
}

export const EQUIPO_DEMO: readonly ProfesionalDemo[] = [
  { nombre: 'Lucía', rol: 'Nail artist', especialidades: ['Uñas', 'Nail art'], resenas: rotacion(0, 1, 2) },
  { nombre: 'Carla', rol: 'Esteticista', especialidades: ['Pestañas', 'Cejas'], resenas: rotacion(3, 4, 5) },
  { nombre: 'Andrea', rol: 'Especialista en uñas', especialidades: ['Uñas', 'Pedicura'], resenas: rotacion(6, 7, 8) },
  { nombre: 'Nerea', rol: 'Lash & brow', especialidades: ['Pestañas', 'Cejas'], resenas: rotacion(9, 0, 1) },
  { nombre: 'Marta', rol: 'Esteticista', especialidades: ['Cejas', 'Pestañas'], resenas: rotacion(2, 3, 4) },
  { nombre: 'Paula', rol: 'Nail artist', especialidades: ['Uñas', 'Nail art'], resenas: rotacion(5, 6, 7) },
  { nombre: 'Sara', rol: 'Manicurista', especialidades: ['Uñas', 'Pedicura'], resenas: rotacion(8, 9, 0) },
]

export const LEYENDA_EQUIPO =
  'Equipo y reseñas de ejemplo · perfiles de muestra, pendientes de confirmar con el salón'
