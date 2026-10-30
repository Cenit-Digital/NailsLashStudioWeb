import { describe, expect, it, vi } from 'vitest'

import { crearClienteCitas, mensajeDeCarga, type PeticionCita } from './cliente-api.ts'

/**
 * Citas · Fase 7 (issue #39): el cliente HTTP del modal y cómo traduce cada respuesta del backend
 * (contrato de la API en #37). `pedir` se inyecta: en la app es `window.fetch`; aquí, un doble.
 */
const API = 'https://citas.example.org'

function respuesta(status: number, cuerpo?: unknown): Response {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), { status })
}

function doble(...respuestas: (Response | Error)[]) {
  const pedir = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>()
  for (const r of respuestas) {
    if (r instanceof Error) pedir.mockRejectedValueOnce(r)
    else pedir.mockResolvedValueOnce(r)
  }
  return pedir
}

const PETICION: PeticionCita = {
  opcion: 'manicura-rusa-m',
  inicio: '2026-11-03T09:00:00.000Z',
  nombre: 'Ana',
  telefono: '625223366',
  email: 'ana@mail.es',
  clave: '0b8f9a52-6f1e-4c3a-9d2b-1a2b3c4d5e6f',
  turnstile: 'tok',
}

const P5 = 'No hemos podido completar la reserva. Inténtalo de nuevo o llámanos al 625 22 33 66.'

describe('GET /dias y /horas', () => {
  it('pide /dias con la opción codificada, sin cabeceras propias (petición CORS simple)', async () => {
    const dias = [{ fecha: '2026-11-03', estado: 'disponible' }]
    const pedir = doble(respuesta(200, { dias }))
    expect(await crearClienteCitas(API, pedir).dias('a b&c')).toEqual(dias)
    expect(pedir).toHaveBeenCalledWith('https://citas.example.org/dias?opcion=a%20b%26c')
  })

  it('pide /horas con opción y fecha', async () => {
    const horas = [{ hora: '10:00', inicio: '2026-11-03T09:00:00.000Z', fin: 'x' }]
    const pedir = doble(respuesta(200, { horas }))
    expect(await crearClienteCitas(API, pedir).horas('manicura-rusa-m', '2026-11-03')).toEqual(
      horas,
    )
    expect(pedir).toHaveBeenCalledWith(
      'https://citas.example.org/horas?opcion=manicura-rusa-m&fecha=2026-11-03',
    )
  })

  it('un fallo de red, un estado no 2xx, un JSON roto o sin la lista dan null', async () => {
    const cliente = (r: Response | Error) => crearClienteCitas(API, doble(r))
    expect(await cliente(new Error('red')).dias('x')).toBeNull()
    expect(await cliente(respuesta(503, { dias: [] })).dias('x')).toBeNull()
    expect(await cliente(new Response('{', { status: 200 })).dias('x')).toBeNull()
    expect(await cliente(respuesta(200, { dias: 'no' })).dias('x')).toBeNull()
    expect(await cliente(respuesta(200, null)).dias('x')).toBeNull()
    expect(await cliente(new Error('red')).horas('x', 'y')).toBeNull()
    expect(await cliente(respuesta(400, { horas: [] })).horas('x', 'y')).toBeNull()
    expect(await cliente(respuesta(200, { dias: [] })).horas('x', 'y')).toBeNull()
  })

  it('un 2xx distinto de 200 con la lista también vale', async () => {
    expect(await crearClienteCitas(API, doble(respuesta(204 - 4, { dias: [] }))).dias('x')).toEqual(
      [],
    )
  })

  it('mensajeDeCarga: el aviso cuando no se pueden cargar días u horas', () => {
    expect(mensajeDeCarga('dias')).toBe(
      'No hemos podido cargar los días disponibles. Inténtalo de nuevo o llámanos al 625 22 33 66.',
    )
    expect(mensajeDeCarga('horas')).toBe(
      'No hemos podido cargar las horas. Inténtalo de nuevo o llámanos al 625 22 33 66.',
    )
  })
})

describe('POST /reservas', () => {
  it('envía el cuerpo JSON exacto, con el `inicio` tal cual', async () => {
    const pedir = doble(respuesta(201, { cita: { opcion: 'o', inicio: 'i', fin: 'f' } }))
    await crearClienteCitas(API, pedir).reservar(PETICION)
    expect(pedir).toHaveBeenCalledWith('https://citas.example.org/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(PETICION),
    })
  })

  it('@s20 201 → confirmada con la cita', async () => {
    const cita = { opcion: 'manicura-rusa-m', inicio: 'i', fin: 'f' }
    expect(
      await crearClienteCitas(API, doble(respuesta(201, { cita }))).reservar(PETICION),
    ).toEqual({ tipo: 'confirmada', cita })
  })

  it('201 sin cita o ilegible → error (no se da por confirmada)', async () => {
    expect(await crearClienteCitas(API, doble(respuesta(201, {}))).reservar(PETICION)).toEqual({
      tipo: 'error',
      mensaje: P5,
    })
    expect(
      await crearClienteCitas(API, doble(respuesta(201, { cita: null }))).reservar(PETICION),
    ).toEqual({ tipo: 'error', mensaje: P5 })
    expect(
      await crearClienteCitas(API, doble(new Response('x', { status: 201 }))).reservar(PETICION),
    ).toEqual({ tipo: 'error', mensaje: P5 })
    expect(
      await crearClienteCitas(API, doble(respuesta(201, { cita: 'x' }))).reservar(PETICION),
    ).toEqual({ tipo: 'error', mensaje: P5 })
    expect(await crearClienteCitas(API, doble(respuesta(201, null))).reservar(PETICION)).toEqual({
      tipo: 'error',
      mensaje: P5,
    })
  })

  it('@s22 409 → hora-ocupada con el texto del contrato, aunque el cuerpo no sea JSON', async () => {
    expect(
      await crearClienteCitas(API, doble(new Response('x', { status: 409 }))).reservar(PETICION),
    ).toEqual({
      tipo: 'hora-ocupada',
      mensaje: 'Esa hora acaba de ocuparse. Elige otra, por favor.',
    })
  })

  it('403 verificación → verificacion con su texto', async () => {
    expect(
      await crearClienteCitas(API, doble(respuesta(403, { codigo: 'verificacion' }))).reservar(
        PETICION,
      ),
    ).toEqual({
      tipo: 'verificacion',
      mensaje: 'No hemos podido comprobar que no eres un robot. Vuelve a intentarlo.',
    })
  })

  it('403 de origen o sin cuerpo → error P5', async () => {
    for (const r of [respuesta(403, { codigo: 'origen', campo: 'email' }), respuesta(403)]) {
      expect(await crearClienteCitas(API, doble(r)).reservar(PETICION)).toEqual({
        tipo: 'error',
        mensaje: P5,
      })
    }
  })

  it('400 de un campo de la clienta → campo; de otro campo → error P5', async () => {
    expect(
      await crearClienteCitas(
        API,
        doble(respuesta(400, { codigo: 'peticion-invalida', campo: 'telefono' })),
      ).reservar(PETICION),
    ).toEqual({ tipo: 'campo', campo: 'telefono' })
    for (const r of [
      respuesta(400, { codigo: 'verificacion', campo: 'clave' }),
      respuesta(400),
      respuesta(503, { cita: { opcion: 'o', inicio: 'i', fin: 'f' } }),
    ]) {
      expect(await crearClienteCitas(API, doble(r)).reservar(PETICION)).toEqual({
        tipo: 'error',
        mensaje: P5,
      })
    }
  })

  it('@s25 413, 503, 500 y un fallo de red → error P5', async () => {
    for (const r of [
      respuesta(413),
      respuesta(503, { codigo: 'servicio-no-disponible', mensaje: 'otro' }),
      respuesta(500),
      new Error('red'),
    ]) {
      expect(await crearClienteCitas(API, doble(r)).reservar(PETICION)).toEqual({
        tipo: 'error',
        mensaje: P5,
      })
    }
  })
})
