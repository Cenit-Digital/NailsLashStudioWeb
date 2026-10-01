import { describe, expect, it } from 'vitest'

import {
  debeVolar,
  estadoTrasObservar,
  margenDeRaiz,
  transformacionFlip,
  variablesDeVuelo,
} from './logo-acoplado-logica'

/**
 * @s24-@s25 de features/logo_acoplado.feature (LA-C11): las decisiones y la geometría del acople son
 * PURAS, sin DOM, y se muerden POR VALOR en sus fronteras. Geometría asimétrica y distinta de cero en
 * todos los ejemplos. Los esperados van A MANO.
 */
describe('@s24 estadoTrasObservar(actual, bordeInferiorDisparo, lineaDeCorte): transición monótona con "<="', () => {
  const filas: readonly (readonly ['texto' | 'caligrafia', number, number, string])[] = [
    ['texto', 73, 73, 'caligrafia'],
    ['texto', 73.5, 73, 'texto'],
    ['texto', 12.5, 73, 'caligrafia'],
    ['texto', -640, 73, 'caligrafia'],
    ['texto', 912, 73, 'texto'],
    ['texto', 150, 260, 'caligrafia'],
    ['caligrafia', 912, 73, 'caligrafia'],
    ['caligrafia', 73.5, 73, 'caligrafia'],
  ]

  for (const [actual, disparo, linea, esperado] of filas) {
    it(`@s24 "${actual}", ${disparo}, ${linea} → "${esperado}"`, () => {
      expect(estadoTrasObservar(actual, disparo, linea)).toBe(esperado)
    })
  }
})

describe('@s24 debeVolar({ primeraObservacion, bordeInferiorOrigen, altoViewport }): no en la primera entrega y a menos de un viewport', () => {
  const filas: readonly (readonly [boolean, number, number, boolean])[] = [
    [false, 42, 812, true],
    [true, 42, 812, false],
    [false, -811, 812, true],
    [false, -812, 812, false],
    [false, -2400, 812, false],
    [true, -2400, 812, false],
  ]

  for (const [primeraObservacion, bordeInferiorOrigen, altoViewport, esperado] of filas) {
    it(`@s24 ${primeraObservacion}, ${bordeInferiorOrigen}, ${altoViewport} → ${esperado}`, () => {
      expect(debeVolar({ primeraObservacion, bordeInferiorOrigen, altoViewport })).toBe(esperado)
    })
  }
})

/** Una caja { left, top, width, height }, en el orden del .feature. */
function caja(left: number, top: number, width: number, height: number) {
  return { left, top, width, height }
}

describe('@s25 transformacionFlip(origen, destino): FLIP con escala por el ANCHO', () => {
  const filas = [
    [caja(365, -58, 550, 100), caja(40, 17, 137.5, 40), { x: 325, y: -75, escala: 4 }],
    [caja(60, -41, 206.25, 60), caja(24, 16, 137.5, 40), { x: 36, y: -57, escala: 1.5 }],
    [caja(365, -58, 550, 100), caja(40, 17, 0, 40), null],
    [caja(365, -58, 0, 100), caja(40, 17, 137.5, 40), null],
    [caja(365, -58, 550, 100), caja(40, 17, -3, 40), null],
  ] as const

  for (const [origen, destino, esperado] of filas) {
    it(`@s25 ${JSON.stringify(origen)}, ${JSON.stringify(destino)} → ${JSON.stringify(esperado)}`, () => {
      expect(transformacionFlip(origen, destino)).toEqual(esperado)
    })
  }
})

describe('@s25 variablesDeVuelo(flip): las tres custom properties con su unidad, sin redondear', () => {
  const filas = [
    [
      { x: 325, y: -75, escala: 4 },
      { '--vuelo-x': '325px', '--vuelo-y': '-75px', '--vuelo-escala': '4' },
    ],
    [
      { x: -12.5, y: 0.75, escala: 1.5 },
      { '--vuelo-x': '-12.5px', '--vuelo-y': '0.75px', '--vuelo-escala': '1.5' },
    ],
  ] as const

  for (const [flip, esperado] of filas) {
    it(`@s25 ${JSON.stringify(flip)} → ${JSON.stringify(esperado)}`, () => {
      expect(variablesDeVuelo(flip)).toEqual(esperado)
    })
  }
})

describe('@s25 margenDeRaiz(altoCabecera): el margen superior redondeado hacia ABAJO (D-1 a)', () => {
  const filas: readonly (readonly [number, string])[] = [
    [73.6, '-73px 0px 0px 0px'],
    [73.2, '-73px 0px 0px 0px'],
    [74, '-74px 0px 0px 0px'],
    [70.99, '-70px 0px 0px 0px'],
  ]

  for (const [altoCabecera, esperado] of filas) {
    it(`@s25 ${altoCabecera} → "${esperado}"`, () => {
      expect(margenDeRaiz(altoCabecera)).toBe(esperado)
    })
  }
})
