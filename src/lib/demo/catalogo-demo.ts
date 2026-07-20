/**
 * DATOS DEMO del catálogo (rama demo/lunes-prototipo). NO es la feature F-09 y NO entra en los
 * `registros` verificados de F-01 (src/lib/site.ts): son datos de MUESTRA para la demo del lunes.
 *
 * 🔴 Categorías REALES del negocio: Uñas · Pestañas · Cejas ([V] — «Facial»/«Depilación» del
 * prototipo NO existen en este salón). Los NOMBRES de servicio son tipos genéricos del dominio; los
 * PRECIOS son de muestra y van con una leyenda que lo declara («pendientes de confirmar»), tal como
 * decidió la puerta humana de F-09 (Q-B). Ningún precio se presenta como el precio real del salón.
 */
export interface ServicioDemo {
  readonly nombre: string
  readonly precio: string
}

export interface CategoriaDemo {
  readonly clave: string
  readonly eyebrow: string
  readonly textoBoton: string
  readonly titulo: string
  readonly intro: string
  readonly servicios: readonly ServicioDemo[]
}

export const CATALOGO_DEMO: readonly CategoriaDemo[] = [
  {
    clave: 'unas',
    eyebrow: 'Servicio de Uñas',
    textoBoton: 'Reservar Uñas',
    titulo: 'Manos y pies de Revista',
    intro: 'Manicura, pedicura, esculpido y nail art con producto premium y un acabado impecable que dura semanas.',
    servicios: [
      { nombre: 'Manicura semipermanente', precio: '15 €' },
      { nombre: 'Manicura rusa completa', precio: '25 €' },
      { nombre: 'Uñas acrílicas o gel', precio: '35 €' },
      { nombre: 'Relleno acrílico o gel', precio: '38 €' },
      { nombre: 'Pedicura spa completa', precio: '28 €' },
      { nombre: 'Nail art y diseño', precio: '20 €' },
    ],
  },
  {
    clave: 'facial',
    eyebrow: 'Servicio Facial',
    textoBoton: 'Reservar Facial',
    titulo: 'Tu piel, radiante',
    intro: 'Tratamientos de limpieza, hidratación y luminosidad, más pestañas y cejas, adaptados a tu tipo de piel.',
    servicios: [
      { nombre: 'Limpieza facial profunda', precio: '35 €' },
      { nombre: 'Tratamiento hidratante', precio: '42 €' },
      { nombre: 'Peeling y luminosidad', precio: '45 €' },
      { nombre: 'Lifting de pestañas', precio: '55 €' },
      { nombre: 'Diseño de cejas', precio: '30 €' },
      { nombre: 'Tinte de pestañas', precio: '30 €' },
    ],
  },
  {
    clave: 'depilacion',
    eyebrow: 'Servicio de Depilación',
    textoBoton: 'Reservar Depilación',
    titulo: 'Piel suave y cuidada',
    intro: 'Depilación con cera tibia en un entorno higiénico y respetuoso, para una piel suave más tiempo.',
    servicios: [
      { nombre: 'Cejas', precio: '12 €' },
      { nombre: 'Labio superior', precio: '18 €' },
      { nombre: 'Axilas', precio: '30 €' },
      { nombre: 'Medias piernas', precio: '35 €' },
      { nombre: 'Piernas completas', precio: '10 €' },
      { nombre: 'Ingles o cavado', precio: '10 €' },
    ],
  },
]

/** Leyenda visible obligatoria (F-09 Q-B): los precios son de muestra y llevan IVA incluido. */
export const LEYENDA_PRECIOS = 'Precios de muestra · IVA incluido · pendientes de confirmar con el salón'
