import { describe, expect, it } from 'vitest'

import { debeVolar, estadoTrasObservar } from './logo-acoplado-logica'

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
