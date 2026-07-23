/**
 * Núcleo PURO de la sección de reseñas (F-14, contrato `features/resenas_agregado_enlace.feature`
 * @s2, @s7, @s8). Patrón `galeria-logica.ts`: todo lo que DECIDE o FORMATEA vive aquí, sin
 * `window` y sin tocar el módulo del dato — el componente solo CABLEA.
 *
 * El formateo del agregado (coma decimal, punto de millar, fecha visible) se llama EN EL RENDER:
 * derivarlo en la carga de `resenas-agregado.ts` fabricaría mutantes ESTÁTICOS que el runner de
 * Stryker no puede activar (trampa medida, brief v3 §7 + `progress/tdd_deuda_mutacion_full.md`).
 *
 * La aritmética del carrusel NO vive aquí: se importa de `galeria-logica.ts` y de
 * `carrusel-logica.ts` (regla del contrato: duplicar una función pura es fallo de review).
 */
import { etiquetaDeDiapositiva } from './galeria-logica'

/** La escala de las reseñas: la fila SIEMPRE es de cinco glifos y toda nota se lee «de 5». */
const NOTA_MAXIMA = 5

/**
 * La fila de estrellas decorativas de una nota (@s7): CINCO glifos siempre, llenas «★» primero y
 * vacías «☆» después, redondeando al ENTERO más cercano (4,9 → cinco llenas; 4,4 → cuatro).
 * Son DECORATIVAS: la fuente accesible es el número en texto (`notaEnTexto`), nunca los glifos.
 */
export function estrellasDe(nota: number): string {
  const llenas = Math.round(nota)

  return '★'.repeat(llenas) + '☆'.repeat(NOTA_MAXIMA - llenas)
}

/** La nota con coma decimal es-ES para lo VISIBLE («4,9»); el number del módulo va con punto. */
function notaConComa(nota: number): string {
  return String(nota).replace('.', ',')
}

/** El texto accesible de una nota (@s2, @s7): «4,9 de 5», «4 de 5», «5 de 5». */
export function notaEnTexto(nota: number): string {
  return `${notaConComa(nota)} de ${NOTA_MAXIMA}`
}

/** Cada grupo del separador de millar junta tres cifras. */
const CIFRAS_POR_GRUPO_DE_MILLAR = 3

/**
 * El total con punto de millar es-ES (@s2): 1239 → «1.239», 226 → «226». A MANO y no con
 * `toLocaleString('es-ES')` por un gotcha MEDIDO: el CLDR español declara `minimumGroupingDigits: 2`
 * y deja los números de cuatro cifras SIN separador («1239»), pero el contrato exige «1.239».
 */
export function totalConMillar(total: number): string {
  const cifras = String(total)
  const cabeza = cifras.length % CIFRAS_POR_GRUPO_DE_MILLAR
  let resultado = cifras.slice(0, cabeza)

  for (let corte = cabeza; corte < cifras.length; corte += CIFRAS_POR_GRUPO_DE_MILLAR) {
    const grupo = cifras.slice(corte, corte + CIFRAS_POR_GRUPO_DE_MILLAR)

    resultado = resultado === '' ? grupo : `${resultado}.${grupo}`
  }

  return resultado
}

/** La fecha ISO del módulo (`aaaa-mm-dd`) en su forma visible es-ES (@s2): «23/07/2026». */
export function fechaVisible(fechaIso: string): string {
  const [ano, mes, dia] = fechaIso.split('-')

  return `${dia}/${mes}/${ano}`
}

/** El nombre accesible de un punto indicador (@s8): «Ver el testimonio 3 de 6». */
export function etiquetaDelPuntoDeTestimonio(indice: number, total: number): string {
  return `Ver el testimonio ${etiquetaDeDiapositiva(indice, total)}`
}
