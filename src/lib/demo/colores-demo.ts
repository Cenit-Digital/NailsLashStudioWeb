/**
 * Los 12 tonos del probador de color, VERBATIM de `salon-data.js → colors` (nombre + hex). Son datos
 * de esmalte provistos por el diseño, no afirmaciones de negocio inventadas: se usan tal cual.
 */
export interface ColorDemo {
  readonly nombre: string
  readonly hex: string
}

export const COLORES_DEMO: readonly ColorDemo[] = [
  { nombre: 'Rojo Carmín', hex: '#B11226' },
  { nombre: 'Vino Tinto', hex: '#6E1E2A' },
  { nombre: 'Nude Rosado', hex: '#E7C4B8' },
  { nombre: 'Rosa Empolvado', hex: '#D9A7A1' },
  { nombre: 'Coral Suave', hex: '#E98A7A' },
  { nombre: 'Malva', hex: '#9B7B8E' },
  { nombre: 'Champán', hex: '#E4D2B8' },
  { nombre: 'Fucsia', hex: '#B33771' },
  { nombre: 'Azul Noche', hex: '#26364F' },
  { nombre: 'Verde Salvia', hex: '#8AA79B' },
  { nombre: 'Negro Ónix', hex: '#1B1B1D' },
  { nombre: 'Blanco Nácar', hex: '#F2ECE4' },
]
