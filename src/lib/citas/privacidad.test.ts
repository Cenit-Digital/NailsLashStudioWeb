import { describe, expect, it } from 'vitest'

import { detectarPlaceholders } from '../placeholders.ts'
import {
  datosPrivacidad,
  hayPoliticaDePrivacidad,
  registrosDelBuild,
  rutaPrivacidad,
  urlPrivacidad,
} from './privacidad.ts'

/**
 * Citas · issue #41 (decisión 8): la política de privacidad de la vía de citas solo existe con la
 * vía encendida, y mientras el salón no dé sus datos (A-29) el build de producción falla (D-9).
 */
const ENCENDIDA = { VITE_CITAS_API: 'https://citas.example.org' }

describe('@s31 hayPoliticaDePrivacidad: misma regla que la vía de citas', () => {
  it('sin variable, o vacía o en blanco, no hay política', () => {
    expect(hayPoliticaDePrivacidad({})).toBe(false)
    expect(hayPoliticaDePrivacidad({ VITE_CITAS_API: '' })).toBe(false)
    expect(hayPoliticaDePrivacidad({ VITE_CITAS_API: '   ' })).toBe(false)
  })

  it('con host, sí hay política', () => {
    expect(hayPoliticaDePrivacidad(ENCENDIDA)).toBe(true)
  })
})

describe('@s31 la ruta y el enlace', () => {
  it('la ruta de la página es /privacidad-citas', () => {
    expect(rutaPrivacidad()).toBe('/privacidad-citas')
  })

  it('el enlace cuelga de la base del sitio y acaba en barra (dirStyle nested)', () => {
    expect(urlPrivacidad('/')).toBe('/privacidad-citas/')
    expect(urlPrivacidad('/NailsLashStudioWeb/')).toBe('/NailsLashStudioWeb/privacidad-citas/')
  })
})

describe('@s31 los datos que solo tiene el salón (A-29)', () => {
  it('son exactamente estos cuatro, con su texto visible de pendiente', () => {
    const datos = datosPrivacidad()
    expect(datos.razonSocial).toEqual({
      ubicacion: 'privacidad.razonSocial',
      valor: '[PENDIENTE: razón social del salón]',
      esPlaceholder: true,
    })
    expect(datos.nif).toEqual({
      ubicacion: 'privacidad.nif',
      valor: '[PENDIENTE: NIF del salón]',
      esPlaceholder: true,
    })
    expect(datos.email).toEqual({
      ubicacion: 'privacidad.email',
      valor: '[PENDIENTE: email de contacto del salón]',
      esPlaceholder: true,
    })
    expect(datos.conservacion).toEqual({
      ubicacion: 'privacidad.conservacion',
      valor: '[PENDIENTE: plazo de conservación de los datos de la cita]',
      esPlaceholder: true,
    })
  })
})

describe('@s31 registrosDelBuild: lo que ve la puerta de placeholders', () => {
  it('con la vía apagada no aporta nada', () => {
    expect(registrosDelBuild({})).toEqual([])
    expect(registrosDelBuild({ VITE_CITAS_API: ' ' })).toEqual([])
  })

  it('con la vía encendida aporta los cuatro, en este orden, todos placeholder', () => {
    expect(registrosDelBuild(ENCENDIDA).map((r) => r.ubicacion)).toEqual([
      'privacidad.razonSocial',
      'privacidad.nif',
      'privacidad.email',
      'privacidad.conservacion',
    ])
    expect(registrosDelBuild(ENCENDIDA).map((r) => r.esPlaceholder)).toEqual([
      true,
      true,
      true,
      true,
    ])
  })

  it('la puerta los acusa uno a uno por la vía del flag, y apagada no acusa nada', () => {
    const violaciones = detectarPlaceholders({ registros: registrosDelBuild(ENCENDIDA) })
    expect(violaciones.map((v) => [v.via, v.ubicacion])).toEqual([
      ['flag', 'privacidad.razonSocial'],
      ['flag', 'privacidad.nif'],
      ['flag', 'privacidad.email'],
      ['flag', 'privacidad.conservacion'],
    ])
    expect(detectarPlaceholders({ registros: registrosDelBuild({}) })).toEqual([])
  })
})
