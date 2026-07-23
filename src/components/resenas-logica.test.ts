import { describe, expect, it } from 'vitest'

import {
  estrellasDe,
  etiquetaDelPuntoDeTestimonio,
  fechaVisible,
  notaEnTexto,
  totalConMillar,
} from './resenas-logica'

/**
 * F-14 — el núcleo PURO de la sección de reseñas (contrato `features/resenas_agregado_enlace.feature`
 * @s2, @s7, @s8). Patrón `galeria-logica.ts`: todo lo que decide algo vive puro y Stryker lo muerde
 * POR VALOR. El formateo del agregado ocurre AQUÍ, llamado en el render — jamás en la carga del
 * módulo del dato (trampa de estáticos, brief v3 §7).
 *
 * ANTI-TAUTOLOGÍA: todo valor esperado va ESCRITO A MANO.
 */
describe('@s7 las estrellas las pinta una función PURA que redondea al entero más cercano', () => {
  // La tabla del contrato, con las cuatro filas ESCRITAS A MANO: CINCO glifos siempre,
  // llenas «★» primero y vacías «☆» después.
  it.each([
    { nota: 5, estrellas: '★★★★★', que: 'la fila llena, sin estrella vacía' },
    {
      nota: 4,
      estrellas: '★★★★☆',
      que: 'la estrella VACÍA existe y la fila sigue siendo de CINCO',
    },
    {
      nota: 4.9,
      estrellas: '★★★★★',
      que: 'el agregado (4,9) redondea ARRIBA al entero más cercano',
    },
    { nota: 4.4, estrellas: '★★★★☆', que: 'y 4,4 redondea ABAJO: la frontera del redondeo muerde' },
  ])('@s7 estrellasDe($nota) es "$estrellas" — $que', ({ nota, estrellas }) => {
    expect(estrellasDe(nota)).toBe(estrellas)
  })
})

describe('@s7 @s2 la nota viaja SIEMPRE también en texto, con coma decimal es-ES', () => {
  it('@s7 la nota del agregado se lee «4,9 de 5»', () => {
    expect(notaEnTexto(4.9)).toBe('4,9 de 5')
  })

  it('@s7 las notas ENTERAS de los testimonios se leen «4 de 5» y «5 de 5», sin coma fantasma', () => {
    expect(notaEnTexto(4)).toBe('4 de 5')
    expect(notaEnTexto(5)).toBe('5 de 5')
  })
})

describe('@s2 el total lleva punto de millar es-ES y la fecha del dato se muestra dd/mm/aaaa', () => {
  it('@s2 el total del agregado se escribe «1.239»', () => {
    expect(totalConMillar(1239)).toBe('1.239')
  })

  it('@s2 un total de tres cifras va sin separador: la regla del millar no inventa puntos', () => {
    expect(totalConMillar(226)).toBe('226')
  })

  it('@s2 la fecha ISO del módulo se muestra «23/07/2026»', () => {
    expect(fechaVisible('2026-07-23')).toBe('23/07/2026')
  })
})

describe('@s8 los puntos hablan de testimonios: «Ver el testimonio N de 6»', () => {
  it('@s8 la etiqueta del tercer punto es exactamente «Ver el testimonio 3 de 6»', () => {
    expect(etiquetaDelPuntoDeTestimonio(2, 6)).toBe('Ver el testimonio 3 de 6')
  })

  it('@s8 la del primero y la del último cierran el rango 1..6', () => {
    expect(etiquetaDelPuntoDeTestimonio(0, 6)).toBe('Ver el testimonio 1 de 6')
    expect(etiquetaDelPuntoDeTestimonio(5, 6)).toBe('Ver el testimonio 6 de 6')
  })
})
