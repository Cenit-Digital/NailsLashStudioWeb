import { describe, expect, it, vi } from 'vitest'

import {
  detenerTecla,
  enfocar,
  focoDentro,
  mostrarBocadillo,
  siguienteAnimacion,
  type EstadoAnimacion,
} from './nailbot-flotante-logica'

/**
 * @s6 de features/nailbot_flotante.feature: las tres decisiones PURAS del flotante, por VALOR. Los
 * literales esperados van A MANO (3 999 / 4 000 ms, las teclas, los estados).
 */
describe('@s6 ¿se muestra el bocadillo?', () => {
  const filas: readonly (readonly [number, boolean, boolean, boolean])[] = [
    [3999, false, false, false],
    [4000, false, false, true],
    [60000, false, false, true],
    [4000, true, false, false],
    [4000, false, true, false],
  ]

  for (const [ms, abierto, descartado, esperado] of filas) {
    it(`@s6 ${ms} ms · panel abierto: ${abierto} · descartado: ${descartado} → ${esperado}`, () => {
      expect(mostrarBocadillo(ms, abierto, descartado)).toBe(esperado)
    })
  }
})

describe('@s6 el estado de la animación', () => {
  const activa: EstadoAnimacion = { animacion: 'activa', pausaMontada: true, pausaPulsada: false }
  const pausadaPulsada: EstadoAnimacion = {
    animacion: 'pausada',
    pausaMontada: true,
    pausaPulsada: true,
  }
  const reducida: EstadoAnimacion = {
    animacion: 'pausada',
    pausaMontada: false,
    pausaPulsada: true,
  }

  it('@s6 sin leer + «no-preference» → activa · montada · no pulsada', () => {
    expect(siguienteAnimacion(null, { tipo: 'preferencia', reduce: false })).toEqual(activa)
  })

  it('@s6 sin leer + «reduce» → pausada · no montada', () => {
    expect(siguienteAnimacion(null, { tipo: 'preferencia', reduce: true })).toEqual(reducida)
  })

  it('@s6 activa + pulsar la pausa → pausada · montada · pulsada', () => {
    expect(siguienteAnimacion(activa, { tipo: 'pulsarPausa' })).toEqual(pausadaPulsada)
  })

  it('@s6 pausada + pulsar la pausa → activa · montada · no pulsada', () => {
    expect(siguienteAnimacion(pausadaPulsada, { tipo: 'pulsarPausa' })).toEqual(activa)
  })

  it('@s6 activa + «reduce» en caliente → pausada · no montada', () => {
    expect(siguienteAnimacion(activa, { tipo: 'preferencia', reduce: true })).toEqual(reducida)
  })

  it('@s6 pausada y pulsada + «reduce» en caliente → pausada · no montada', () => {
    expect(siguienteAnimacion(pausadaPulsada, { tipo: 'preferencia', reduce: true })).toEqual(
      reducida,
    )
  })

  it('@s6 pausada · no montada + «reduce» retirado → pausada · montada · PULSADA: nunca reanuda sola', () => {
    expect(siguienteAnimacion(reducida, { tipo: 'preferencia', reduce: false })).toEqual(
      pausadaPulsada,
    )
  })

  it('antes de leer la preferencia no hay pausa que pulsar: sigue SIN LEER', () => {
    expect(siguienteAnimacion(null, { tipo: 'pulsarPausa' })).toBeNull()
  })

  it('un evento que no reconoce no cambia NADA: devuelve el MISMO estado (hace observable cada tipo)', () => {
    const desconocido = { tipo: '', reduce: true } as unknown as Parameters<
      typeof siguienteAnimacion
    >[1]

    expect(siguienteAnimacion(activa, desconocido)).toBe(activa)
    expect(siguienteAnimacion(null, desconocido)).toBeNull()
  })

  it('una preferencia «no-preference» repetida no cambia un estado activo', () => {
    expect(siguienteAnimacion(activa, { tipo: 'preferencia', reduce: false })).toEqual(activa)
  })

  it('no muta el estado de entrada: devuelve uno nuevo', () => {
    const entrada = Object.freeze({ ...reducida })

    expect(siguienteAnimacion(entrada, { tipo: 'preferencia', reduce: false })).not.toBe(entrada)
    expect(entrada).toEqual(reducida)
  })
})

describe('@s6 ¿el diálogo detiene la propagación de la tecla?', () => {
  const filas: readonly (readonly [string, boolean])[] = [
    ['ArrowLeft', true],
    ['ArrowRight', true],
    ['ArrowUp', false],
    ['Escape', false],
    ['Tab', false],
    ['a', false],
  ]

  for (const [tecla, esperado] of filas) {
    it(`@s6 «${tecla}» → ${esperado}`, () => {
      expect(detenerTecla(tecla)).toBe(esperado)
    })
  }
})

describe('enfocar y focoDentro: las guardas del foco, por valor', () => {
  it('enfocar lleva el foco al nodo; con null no hace nada ni lanza', () => {
    const focus = vi.fn()

    enfocar({ focus })

    expect(focus).toHaveBeenCalledTimes(1)
    expect(() => enfocar(null)).not.toThrow()
  })

  it('focoDentro pregunta al contenedor por el activo; sin contenedor, false', () => {
    const activo = document.createElement('button')
    const contains = vi.fn((otro: Node | null) => otro === activo)

    expect(focoDentro({ contains }, activo)).toBe(true)
    expect(contains).toHaveBeenCalledWith(activo)
    expect(focoDentro({ contains }, document.body)).toBe(false)
    expect(focoDentro(null, activo)).toBe(false)
  })
})
