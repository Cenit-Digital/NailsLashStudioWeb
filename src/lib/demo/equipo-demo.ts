import equipoNailArtRojo from '../../assets/trabajos/equipo-nail-art-rojo.jpg'
import equipoExtensionPestanas from '../../assets/trabajos/equipo-extension-pestanas.jpg'
import equipoPedicura from '../../assets/trabajos/equipo-pedicura.jpg'
import equipoCejasProductos from '../../assets/trabajos/equipo-cejas-productos.jpg'
import equipoPestanasPinzas from '../../assets/trabajos/equipo-pestanas-pinzas.jpg'
import equipoNailArtLeopardo from '../../assets/trabajos/equipo-nail-art-leopardo.jpg'
import equipoCuidadoUnas from '../../assets/trabajos/equipo-cuidado-unas.jpg'

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
 * y van con `LEYENDA_EQUIPO` visible: ningún nombre, foto ni reseña se presenta como real (D1/D2). Las
 * reseñas salen del `reviewPool` de `salon-data.js` (10 disponibles), repartidas de modo que dos
 * tarjetas contiguas no arrancan con la misma (D5) y cada rotación tiene al menos tres distintas.
 *
 * `foto`/`alt` (2026-07-21): fotos de TRABAJOS de banco de imágenes (Pexels), seleccionadas a mano,
 * SIN rostro identificable (la licencia de Pexels prohíbe implicar el respaldo de una persona real, y
 * un rostro aquí implicaría que esa persona trabaja en el salón — LO 1/1982). El `alt` describe el
 * TRABAJO fotografiado, nunca a la profesional.
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
  readonly foto: string
  readonly alt: string
}

const RESENAS: readonly ResenaDemo[] = [
  {
    autora: 'María L.',
    texto: 'Un trato espectacular y un resultado perfecto. Repetiré sin duda.',
  },
  { autora: 'Elena R.', texto: 'Mis uñas nunca habían durado tanto. Profesionales de verdad.' },
  { autora: 'Cristina P.', texto: 'Súper detallistas y muy limpias. Salí encantada del salón.' },
  { autora: 'Sonia G.', texto: 'El mejor sitio de la zona, con diferencia. 100% recomendable.' },
  { autora: 'Beatriz M.', texto: 'Ambiente relajante y acabado impecable. Me encantó todo.' },
  {
    autora: 'Raquel D.',
    texto: 'Puntuales, cuidadosas y con un gusto exquisito. Cinco estrellas.',
  },
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
  {
    nombre: 'Lucía',
    rol: 'Nail artist',
    especialidades: ['Uñas', 'Nail art'],
    resenas: rotacion(0, 1, 2),
    foto: equipoNailArtRojo,
    alt: 'Nail art en rojo con detalles en blanco y dorado',
  },
  {
    nombre: 'Carla',
    rol: 'Esteticista',
    especialidades: ['Pestañas', 'Cejas'],
    resenas: rotacion(3, 4, 5),
    foto: equipoExtensionPestanas,
    alt: 'Extensión de pestañas con efecto volumen',
  },
  {
    nombre: 'Andrea',
    rol: 'Especialista en uñas',
    especialidades: ['Uñas', 'Pedicura'],
    resenas: rotacion(6, 7, 8),
    foto: equipoPedicura,
    alt: 'Pedicura profesional en cabina',
  },
  {
    nombre: 'Nerea',
    rol: 'Lash & brow',
    especialidades: ['Pestañas', 'Cejas'],
    resenas: rotacion(9, 0, 1),
    foto: equipoCejasProductos,
    alt: 'Productos de tinte para cejas y pestañas',
  },
  {
    nombre: 'Marta',
    rol: 'Esteticista',
    especialidades: ['Cejas', 'Pestañas'],
    resenas: rotacion(2, 3, 4),
    foto: equipoPestanasPinzas,
    alt: 'Pestañas postizas y pinzas de aplicación',
  },
  {
    nombre: 'Paula',
    rol: 'Nail artist',
    especialidades: ['Uñas', 'Nail art'],
    resenas: rotacion(5, 6, 7),
    foto: equipoNailArtLeopardo,
    alt: 'Nail art con estampado de leopardo sobre esmalte negro',
  },
  {
    nombre: 'Sara',
    rol: 'Manicurista',
    especialidades: ['Uñas', 'Pedicura'],
    resenas: rotacion(8, 9, 0),
    foto: equipoCuidadoUnas,
    alt: 'Cuidado de cutículas antes del esmaltado',
  },
]

export const LEYENDA_EQUIPO =
  'Equipo, fotos y reseñas de ejemplo · perfiles de muestra y fotos de banco de imágenes, pendientes de confirmar con el salón'
