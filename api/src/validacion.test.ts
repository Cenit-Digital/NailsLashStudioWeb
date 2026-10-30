// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { validarReserva } from './validacion.ts'

/** Una petición válida escrita a mano (anti-tautología: nada se copia de producción). */
function peticion(cambios: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    opcion: 'manicura-rusa-m',
    inicio: '2026-11-03T09:00:00.000Z',
    nombre: 'Ana',
    telefono: '625 22 33 66',
    email: 'ana@mail.es',
    clave: '0f8fad5b-d9cb-469f-a165-70867728950e',
    turnstile: 'token-de-turnstile',
    ...cambios,
  }
}

function campoRechazado(cuerpo: unknown): string | null {
  const resultado = validarReserva(cuerpo)
  return resultado.ok ? null : resultado.campo
}

describe('validarReserva', () => {
  it('acepta una petición válida y devuelve la opción con sus minutos', () => {
    const resultado = validarReserva(peticion())
    expect(resultado).toEqual({
      ok: true,
      peticion: {
        opcion: 'manicura-rusa-m',
        inicio: '2026-11-03T09:00:00.000Z',
        nombre: 'Ana',
        telefono: '625 22 33 66',
        email: 'ana@mail.es',
        clave: '0f8fad5b-d9cb-469f-a165-70867728950e',
        turnstile: 'token-de-turnstile',
      },
      minutos: 60,
      encontrada: expect.objectContaining({
        categoria: expect.objectContaining({ nombre: 'Manicura' }),
        subservicio: expect.objectContaining({
          nombre: 'Manicura Completa con Base Proteínica (Técnica Rusa)',
        }),
        opcion: expect.objectContaining({ etiqueta: 'Uña Mediana', precio: 29 }),
      }),
    })
  })

  it('recorta los espacios del nombre, el teléfono y el email', () => {
    const resultado = validarReserva(
      peticion({ nombre: '  Ana  ', telefono: ' 625223366 ', email: ' ana@mail.es ' }),
    )
    expect(resultado.ok && resultado.peticion).toMatchObject({
      nombre: 'Ana',
      telefono: '625223366',
      email: 'ana@mail.es',
    })
  })

  describe('@s27: opción inexistente o no reservable', () => {
    it('rechaza «manicura-rusa-xl-xxl» (no se reserva en línea)', () => {
      expect(campoRechazado(peticion({ opcion: 'manicura-rusa-xl-xxl' }))).toBe('opcion')
    })

    it('rechaza una opción que no existe', () => {
      expect(campoRechazado(peticion({ opcion: 'no-existe' }))).toBe('opcion')
    })

    it('rechaza una opción que no es texto', () => {
      expect(campoRechazado(peticion({ opcion: 7 }))).toBe('opcion')
    })
  })

  describe('el cuerpo', () => {
    it.each([null, undefined, 'texto', 3, ['a']])(
      'rechaza un cuerpo que no es un objeto: %j',
      (c) => {
        expect(campoRechazado(c)).toBe('cuerpo')
      },
    )
  })

  describe('@s18 en el servidor: nombre', () => {
    it.each(['', '   ', 7])('rechaza el nombre %j', (nombre) => {
      expect(campoRechazado(peticion({ nombre }))).toBe('nombre')
    })

    it('acepta 80 caracteres y rechaza 81', () => {
      expect(campoRechazado(peticion({ nombre: 'a'.repeat(80) }))).toBeNull()
      expect(campoRechazado(peticion({ nombre: 'a'.repeat(81) }))).toBe('nombre')
    })

    it.each(['Ana\r\nBcc: x@y.es', 'Ana\nB', 'Ana\u0000', 'Ana\u007f', 'Ana\u001f'])(
      'rechaza caracteres de control (inyección de cabeceras): %j',
      (nombre) => {
        expect(campoRechazado(peticion({ nombre }))).toBe('nombre')
      },
    )

    it('acepta tildes y eñes', () => {
      expect(campoRechazado(peticion({ nombre: 'María Íñiguez' }))).toBeNull()
    })
  })

  describe('@s18 en el servidor: teléfono', () => {
    it.each([
      '12',
      '12345678',
      '1234 5678',
      'abcdefghij',
      '625223366x',
      'x625223366',
      7,
      '+34 (625) 22-33-66 0000000',
    ])('rechaza el teléfono %j', (telefono) => {
      expect(campoRechazado(peticion({ telefono }))).toBe('telefono')
    })

    it.each(['123456789', '+34 625 22 33 66', '(625) 22-33-66'])('acepta %j', (telefono) => {
      expect(campoRechazado(peticion({ telefono }))).toBeNull()
    })

    it('acepta 20 caracteres y rechaza 21', () => {
      expect(campoRechazado(peticion({ telefono: '1'.repeat(20) }))).toBeNull()
      expect(campoRechazado(peticion({ telefono: '1'.repeat(21) }))).toBe('telefono')
    })
  })

  describe('@s18 en el servidor: email', () => {
    it.each([
      'ana@',
      'ana',
      '@mail.es',
      'ana@mail',
      'ana @mail.es',
      'ana@mail.es\r\nBcc: x@y.es',
      'a@b@c.es',
      7,
    ])('rechaza el email %j', (email) => {
      expect(campoRechazado(peticion({ email }))).toBe('email')
    })

    it('acepta 254 caracteres y rechaza 255', () => {
      const largo = (n: number) => `${'a'.repeat(n - 8)}@mail.es`
      expect(campoRechazado(peticion({ email: largo(254) }))).toBeNull()
      expect(campoRechazado(peticion({ email: largo(255) }))).toBe('email')
    })
  })

  describe('inicio: solo el ISO UTC exacto de horasDisponibles', () => {
    it.each([
      '2026-11-03T10:00:00+01:00',
      '2026-11-03T09:00:00Z',
      '2026-11-03T09:00',
      'x2026-11-03T09:00:00.000Z',
      '2026-11-03T09:00:00.000Zx',
      '2026-11-03T09:00:01.000Z',
      7,
    ])('rechaza %j', (inicio) => {
      expect(campoRechazado(peticion({ inicio }))).toBe('inicio')
    })
  })

  describe('clave de idempotencia (@s24): un UUID en minúsculas', () => {
    it.each([
      '',
      '0F8FAD5B-D9CB-469F-A165-70867728950E',
      '0f8fad5bd9cb469fa16570867728950e',
      'x0f8fad5b-d9cb-469f-a165-70867728950e',
      '0f8fad5b-d9cb-469f-a165-70867728950ex',
      7,
    ])('rechaza %j', (clave) => {
      expect(campoRechazado(peticion({ clave }))).toBe('clave')
    })
  })

  describe('token de Turnstile', () => {
    it.each(['', 7])('rechaza %j', (turnstile) => {
      expect(campoRechazado(peticion({ turnstile }))).toBe('turnstile')
    })

    it('acepta 2048 caracteres y rechaza 2049', () => {
      expect(campoRechazado(peticion({ turnstile: 't'.repeat(2048) }))).toBeNull()
      expect(campoRechazado(peticion({ turnstile: 't'.repeat(2049) }))).toBe('turnstile')
    })
  })
})
