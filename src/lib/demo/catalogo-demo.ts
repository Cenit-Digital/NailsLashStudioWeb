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
  readonly titulo: string
  readonly intro: string
  readonly servicios: readonly ServicioDemo[]
}

export const CATALOGO_DEMO: readonly CategoriaDemo[] = [
  {
    clave: 'unas',
    eyebrow: 'Uñas',
    titulo: 'Manicura y uñas',
    intro: 'Manicura, esmaltado permanente y extensiones para lucir unas manos cuidadas cada día.',
    servicios: [
      { nombre: 'Manicura express', precio: '15 €' },
      { nombre: 'Manicura con esmaltado permanente', precio: '25 €' },
      { nombre: 'Uñas de gel', precio: '35 €' },
      { nombre: 'Uñas acrílicas', precio: '38 €' },
      { nombre: 'Relleno de uñas', precio: '28 €' },
      { nombre: 'Retirada + manicura', precio: '20 €' },
    ],
  },
  {
    clave: 'pestanas',
    eyebrow: 'Pestañas',
    titulo: 'Pestañas',
    intro: 'Lifting y extensiones que abren la mirada, adaptadas a tu ojo y a tu ritmo de vida.',
    servicios: [
      { nombre: 'Lifting de pestañas', precio: '35 €' },
      { nombre: 'Lifting + tinte', precio: '42 €' },
      { nombre: 'Extensiones pelo a pelo', precio: '45 €' },
      { nombre: 'Volumen ruso', precio: '55 €' },
      { nombre: 'Relleno de extensiones', precio: '30 €' },
    ],
  },
  {
    clave: 'cejas',
    eyebrow: 'Cejas',
    titulo: 'Cejas',
    intro: 'Diseño, laminado y tinte para dar forma y definición a tu mirada.',
    servicios: [
      { nombre: 'Diseño de cejas', precio: '12 €' },
      { nombre: 'Diseño + tinte', precio: '18 €' },
      { nombre: 'Laminado de cejas', precio: '30 €' },
      { nombre: 'Laminado + tinte', precio: '35 €' },
      { nombre: 'Depilación con hilo', precio: '10 €' },
    ],
  },
]

/** Leyenda visible obligatoria (F-09 Q-B): los precios son de muestra y llevan IVA incluido. */
export const LEYENDA_PRECIOS = 'Precios de muestra · IVA incluido · pendientes de confirmar con el salón'
