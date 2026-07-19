/**
 * DATOS DEMO de servicios destacados (rama demo/lunes-prototipo). NO entra en `registros` de F-01.
 * Contenido HONESTO alineado a las categorías REALES (Uñas · Pestañas · Cejas) — NO los servicios
 * «Facial/Depilación» del prototipo, que este salón no ofrece. Son tipos de servicio genéricos del
 * dominio, presentados como muestra del diseño; nada de reseñas ni afirmaciones inventadas.
 */
export interface DestacadoDemo {
  readonly tag: string
  readonly titulo: string
  readonly desc: string
}

export const DESTACADOS_DEMO: readonly DestacadoDemo[] = [
  { tag: 'Top ventas', titulo: 'Manicura semipermanente', desc: 'Acabado impecable con semanas de duración, sin descamados.' },
  { tag: 'Favorito', titulo: 'Uñas de gel a medida', desc: 'Forma, largura y diseño personalizados por nuestro equipo.' },
  { tag: 'Tendencia', titulo: 'Lifting de pestañas', desc: 'Mirada despierta y natural, sin mantenimiento diario.' },
  { tag: 'Recomendado', titulo: 'Laminado de cejas', desc: 'Cejas con forma y densidad, con un efecto peinado que dura.' },
]
