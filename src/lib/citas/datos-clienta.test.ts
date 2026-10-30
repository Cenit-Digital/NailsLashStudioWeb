import { describe, expect, it } from 'vitest'

import { validarReserva } from '../../../api/src/validacion.ts'
import { campoDeLaClienta, mensajeDeCampo, validarDatos } from './datos-clienta.ts'

/**
 * Citas · Fase 7 (issue #39), @s18: los datos de «Tus datos» se validan en el navegador con las MISMAS
 * reglas que `api/src/validacion.ts`. La tabla de casos se ejecuta contra los dos: si un día divergen,
 * este test se pone rojo antes de que el servidor devuelva un 400 a un dato que el modal dio por bueno.
 */
const BUENOS = { nombre: 'Ana', telefono: '625 22 33 66', email: 'ana@mail.es' }

const CASOS: { campo: 'nombre' | 'telefono' | 'email'; valor: string; valido: boolean }[] = [
  { campo: 'nombre', valor: 'Ana', valido: true },
  { campo: 'nombre', valor: '  Ana  ', valido: true },
  { campo: 'nombre', valor: '', valido: false },
  { campo: 'nombre', valor: '   ', valido: false },
  { campo: 'nombre', valor: 'a'.repeat(80), valido: true },
  { campo: 'nombre', valor: 'a'.repeat(81), valido: false },
  { campo: 'nombre', valor: ` ${'a'.repeat(80)} `, valido: true },
  { campo: 'nombre', valor: 'Ana\nBcc: x', valido: false },
  { campo: 'nombre', valor: 'Ana\u001f', valido: false },
  { campo: 'nombre', valor: 'Ana\u007f', valido: false },
  { campo: 'nombre', valor: 'Ana ñ ~', valido: true },
  { campo: 'telefono', valor: '625223366', valido: true },
  { campo: 'telefono', valor: '+34 (625) 22-33-66', valido: true },
  { campo: 'telefono', valor: '12', valido: false },
  { campo: 'telefono', valor: '12345678', valido: false },
  { campo: 'telefono', valor: '1 2 3 4 5 6 7 8', valido: false },
  { campo: 'telefono', valor: '123456789', valido: true },
  { campo: 'telefono', valor: '62522336x', valido: false },
  { campo: 'telefono', valor: '625.22.33.66', valido: false },
  { campo: 'telefono', valor: '1'.repeat(20), valido: true },
  { campo: 'telefono', valor: '1'.repeat(21), valido: false },
  { campo: 'telefono', valor: ` ${'1'.repeat(20)} `, valido: true },
  { campo: 'telefono', valor: '', valido: false },
  { campo: 'email', valor: 'ana@mail.es', valido: true },
  { campo: 'email', valor: ' ana@mail.es ', valido: true },
  { campo: 'email', valor: 'ana@', valido: false },
  { campo: 'email', valor: 'ana@mail', valido: false },
  { campo: 'email', valor: 'ana@mail.e', valido: false },
  { campo: 'email', valor: 'a na@mail.es', valido: false },
  { campo: 'email', valor: 'ANA.b+c%d-e@sub-x.mail.ES', valido: true },
  { campo: 'email', valor: 'ana@mail.es\nBcc: x@y.es', valido: false },
  { campo: 'email', valor: `${'a'.repeat(246)}@mail.es`, valido: true },
  { campo: 'email', valor: `${'a'.repeat(247)}@mail.es`, valido: false },
  { campo: 'email', valor: ` ${'a'.repeat(246)}@mail.es `, valido: true },
  { campo: 'email', valor: '', valido: false },
]

function servidorAcepta(datos: typeof BUENOS): Record<string, boolean> {
  const resultado = validarReserva({
    opcion: 'manicura-rusa-m',
    inicio: '2026-11-03T09:00:00.000Z',
    ...datos,
    clave: '0b8f9a52-6f1e-4c3a-9d2b-1a2b3c4d5e6f',
    turnstile: 'x',
  })
  return {
    nombre: resultado.ok || resultado.campo !== 'nombre',
    telefono: resultado.ok || resultado.campo !== 'telefono',
    email: resultado.ok || resultado.campo !== 'email',
  }
}

describe('@s18 las reglas del navegador son las del servidor (tabla compartida)', () => {
  it.each(CASOS)('$campo «$valor» → válido: $valido', ({ campo, valor, valido }) => {
    const datos = { ...BUENOS, [campo]: valor }
    expect(validarDatos(datos).errores[campo] === undefined, 'navegador').toBe(valido)
    expect(servidorAcepta(datos)[campo], 'servidor').toBe(valido)
  })
})

describe('@s18 los mensajes junto a cada campo', () => {
  it('las tres filas de Examples del contrato', () => {
    expect(validarDatos({ ...BUENOS, email: 'ana@' }).errores).toEqual({
      email: 'Escribe un email válido, como ana@mail.es',
    })
    expect(validarDatos({ ...BUENOS, telefono: '12' }).errores).toEqual({
      telefono: 'Escribe un teléfono de al menos 9 cifras',
    })
    expect(validarDatos({ ...BUENOS, nombre: '' }).errores).toEqual({
      nombre: 'Escribe tu nombre',
    })
  })

  it('todos los errores a la vez, y ninguno con datos buenos', () => {
    expect(validarDatos({ nombre: '', telefono: '', email: '' }).errores).toEqual({
      nombre: 'Escribe tu nombre',
      telefono: 'Escribe un teléfono de al menos 9 cifras',
      email: 'Escribe un email válido, como ana@mail.es',
    })
    expect(validarDatos(BUENOS)).toEqual({ ok: true, errores: {}, datos: BUENOS })
  })

  it('normaliza con trim lo que se envía', () => {
    expect(
      validarDatos({ nombre: ' Ana ', telefono: ' 625223366 ', email: ' ana@mail.es ' }),
    ).toEqual({
      ok: true,
      errores: {},
      datos: { nombre: 'Ana', telefono: '625223366', email: 'ana@mail.es' },
    })
  })

  it('con errores no es ok', () => {
    expect(validarDatos({ ...BUENOS, nombre: '' }).ok).toBe(false)
  })

  it('mensajeDeCampo da el mensaje de cada campo', () => {
    expect(mensajeDeCampo('nombre')).toBe('Escribe tu nombre')
    expect(mensajeDeCampo('telefono')).toBe('Escribe un teléfono de al menos 9 cifras')
    expect(mensajeDeCampo('email')).toBe('Escribe un email válido, como ana@mail.es')
  })
})

describe('campoDeLaClienta: qué `campo` de un 400 se muestra en «Tus datos»', () => {
  it('nombre, teléfono y email sí; el resto no', () => {
    expect(campoDeLaClienta('nombre')).toBe('nombre')
    expect(campoDeLaClienta('telefono')).toBe('telefono')
    expect(campoDeLaClienta('email')).toBe('email')
    for (const otro of ['opcion', 'inicio', 'clave', 'turnstile', 'cuerpo', undefined, 3]) {
      expect(campoDeLaClienta(otro)).toBeNull()
    }
  })
})
