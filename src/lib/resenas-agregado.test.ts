import { describe, expect, it } from 'vitest'

import * as modulo from './resenas-agregado'

/**
 * F-14 @s3 — el dato agregado de Treatwell vive tipado y FECHADO en su módulo. Contrato:
 * `features/resenas_agregado_enlace.feature`.
 *
 * ANTI-TAUTOLOGÍA: los CINCO valores van escritos A MANO (medidos en vivo el 2026-07-23 sobre la
 * ficha del salón en Treatwell), jamás importados de producción como esperado.
 *
 * [OJO estáticos, brief v3 §7] El módulo exporta el objeto LITERAL y NADA MÁS: ninguna derivación
 * (formato de fecha, texto compuesto, estrellas) se ejecuta en su carga — el formateo lo hacen
 * funciones puras llamadas en el render (`resenas-logica.ts`), donde Stryker sí puede activarlas.
 */
describe('@s3 el módulo resenas-agregado exporta el dato real de Treatwell, fechado', () => {
  it('@s3 exporta un objeto con EXACTAMENTE cinco campos y los valores medidos el 2026-07-23', () => {
    expect(modulo.AGREGADO_DE_RESENAS).toEqual({
      nota: 4.9,
      total: 1239,
      plataforma: 'Treatwell',
      url: 'https://www.treatwell.es/establecimiento/nails-lash-studio/',
      fechaDelDato: '2026-07-23',
    })
    expect(Object.keys(modulo.AGREGADO_DE_RESENAS)).toHaveLength(5)
  })

  it('@s3 el objeto literal es el ÚNICO export en runtime: ninguna derivación vive en la carga', () => {
    // La interfaz TypeScript desaparece al compilar: si en runtime hubiera un segundo export
    // (una fecha formateada, un texto compuesto, una fila de estrellas), sería una derivación
    // evaluada al cargar el módulo — el mutante estático que el runner no puede activar.
    expect(Object.keys(modulo)).toEqual(['AGREGADO_DE_RESENAS'])
  })
})
