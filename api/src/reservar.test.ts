// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { candadoEnMemoria, GoogleEnMemoria, sinCandado } from './dobles.ts'
import { ErrorServicio } from './errores.ts'
import { type DependenciasReserva, reservar } from './reservar.ts'
import { validarReserva } from './validacion.ts'

const CLAVE = '0f8fad5b-d9cb-469f-a165-70867728950e'
const ID_EVENTO = 'cita0f8fad5bd9cb469fa16570867728950e'

/** El resumen de @s20: «Manicura · Uña Mediana», martes 3-nov a las 10:00 (09:00Z), a nombre de Ana. */
function valida(cambios: Record<string, unknown> = {}) {
  const resultado = validarReserva({
    opcion: 'manicura-rusa-m',
    inicio: '2026-11-03T09:00:00.000Z',
    nombre: 'Ana',
    telefono: '611 22 33 44',
    email: 'ana@mail.es',
    clave: CLAVE,
    turnstile: 'token',
    ...cambios,
  })
  if (!resultado.ok) throw new Error(resultado.campo)
  return resultado
}

function montar(calendarios = ['trabajadora-1', 'trabajadora-2']) {
  const google = new GoogleEnMemoria(calendarios)
  const candado = candadoEnMemoria()
  const verificarTurnstile = vi.fn(async () => true)
  const avisar = vi.fn()
  const deps: DependenciasReserva = {
    google,
    candado,
    calendarios,
    verificarTurnstile,
    // Viernes 30-oct-2026 a las 11:00 de Madrid: el reloj del SERVIDOR.
    ahora: () => new Date('2026-10-30T10:00:00.000Z'),
    emailSalon: 'salon@nails.es',
    avisar,
  }
  return { google, candado, verificarTurnstile, avisar, deps }
}

describe('reservar', () => {
  it('@s20: crea en la trabajadora 1 el evento de 10:00 a 11:00 con su título', async () => {
    const { google, deps } = montar()
    const resultado = await reservar(valida(), '203.0.113.7', deps)

    expect(resultado).toEqual({
      tipo: 'creada',
      cita: {
        opcion: 'manicura-rusa-m',
        inicio: '2026-11-03T09:00:00.000Z',
        fin: '2026-11-03T10:00:00.000Z',
      },
    })
    expect(google.eventos).toHaveLength(1)
    expect(google.eventos[0]).toEqual({
      calendario: 'trabajadora-1',
      evento: {
        id: ID_EVENTO,
        titulo:
          'Manicura · Manicura Completa con Base Proteínica (Técnica Rusa) (Uña Mediana) — Ana',
        descripcion: expect.stringContaining('Teléfono: 611 22 33 44'),
        inicio: '2026-11-03T09:00:00.000Z',
        fin: '2026-11-03T10:00:00.000Z',
        clave: CLAVE,
        opcion: 'manicura-rusa-m',
      },
    })
  })

  it('revalida solo el hueco pedido, en todos los calendarios y dentro del bloqueo del día', async () => {
    const { google, candado, deps } = montar()
    await reservar(valida(), undefined, deps)
    expect(candado.dias).toEqual(['2026-11-03'])
    expect(google.consultas).toEqual([
      {
        calendarios: ['trabajadora-1', 'trabajadora-2'],
        desde: '2026-11-03T09:00:00.000Z',
        hasta: '2026-11-03T10:00:00.000Z',
      },
    ])
  })

  it('el día del bloqueo es el de Madrid, no el de UTC', async () => {
    const { candado, deps } = montar()
    // Las 00:30 del miércoles 4 en Madrid son las 23:30Z del martes 3: fuera de horario, pero el
    // bloqueo es del día 4.
    await reservar(valida({ inicio: '2026-11-03T23:30:00.000Z' }), undefined, deps)
    expect(candado.dias).toEqual(['2026-11-04'])
  })

  it('si la trabajadora 1 está ocupada, se asigna la 2', async () => {
    const { google, deps } = montar()
    google.ocupado.set('trabajadora-1', [
      { start: '2026-11-03T10:00:00+01:00', end: '2026-11-03T11:00:00+01:00' },
    ])
    await reservar(valida(), undefined, deps)
    expect(google.eventos.map((e) => e.calendario)).toEqual(['trabajadora-2'])
  })

  it('@s21: envía el email a la clienta y al salón (con Reply-To de la clienta)', async () => {
    const { google, deps } = montar()
    await reservar(valida(), undefined, deps)

    expect(google.correos).toEqual([
      {
        para: 'ana@mail.es',
        correo: {
          asunto: 'Cita confirmada: martes 3 de noviembre a las 10:00',
          texto: expect.stringContaining('llama al salón: 625 22 33 66'),
        },
      },
      {
        para: 'salon@nails.es',
        correo: {
          asunto: 'Nueva cita web: Ana, martes 3 de noviembre a las 10:00',
          texto: expect.stringContaining('Email: ana@mail.es'),
        },
        responderA: 'ana@mail.es',
      },
    ])
  })

  it('si el email falla, la cita sigue creada y se avisa en el log sin datos personales', async () => {
    const { google, avisar, deps } = montar()
    google.fallaCorreo = true
    const resultado = await reservar(valida(), undefined, deps)

    expect(resultado.tipo).toBe('creada')
    expect(google.eventos).toHaveLength(1)
    expect(avisar.mock.calls).toEqual([
      [`email de confirmación no enviado (${ID_EVENTO}): smtp caído`],
      [`email de confirmación no enviado (${ID_EVENTO}): smtp caído`],
    ])
  })

  it('@s22: si la hora está ocupada en todos los calendarios, no crea nada ni envía emails', async () => {
    const { google, deps } = montar()
    const ocupado = [{ start: '2026-11-03T09:30:00Z', end: '2026-11-03T10:30:00Z' }]
    google.ocupado.set('trabajadora-1', [...ocupado])
    google.ocupado.set('trabajadora-2', [...ocupado])

    await expect(reservar(valida(), undefined, deps)).resolves.toEqual({ tipo: 'hora-ocupada' })
    expect(google.eventos).toEqual([])
    expect(google.correos).toEqual([])
  })

  it('@s22: con menos de 2 h de antelación según el reloj del servidor, la hora ya no vale', async () => {
    const { google, deps } = montar()
    const resultado = await reservar(valida(), undefined, {
      ...deps,
      ahora: () => new Date('2026-11-03T07:30:00.000Z'),
    })
    expect(resultado).toEqual({ tipo: 'hora-ocupada' })
    expect(google.eventos).toEqual([])
  })

  it('@s22: si el insert choca con un id ya existente (409), tampoco se confirma', async () => {
    const { google, deps } = montar()
    vi.spyOn(google, 'buscarEvento').mockResolvedValue(null)
    await google.insertarEvento('trabajadora-1', {
      id: ID_EVENTO,
      titulo: 't',
      descripcion: 'd',
      inicio: '2026-11-04T09:00:00.000Z',
      fin: '2026-11-04T10:00:00.000Z',
      clave: CLAVE,
      opcion: 'manicura-rusa-m',
    })

    await expect(reservar(valida(), undefined, deps)).resolves.toEqual({ tipo: 'hora-ocupada' })
    expect(google.correos).toEqual([])
  })

  it('@s24: la misma clave otra vez devuelve la misma cita sin crear otro evento ni otro email', async () => {
    const { google, deps } = montar()
    await reservar(valida(), undefined, deps)
    const segunda = await reservar(valida(), undefined, deps)

    expect(segunda).toEqual({
      tipo: 'repetida',
      cita: {
        opcion: 'manicura-rusa-m',
        inicio: '2026-11-03T09:00:00.000Z',
        fin: '2026-11-03T10:00:00.000Z',
      },
    })
    expect(google.eventos).toHaveLength(1)
    expect(google.correos).toHaveLength(2)
  })

  it('@s24: dos clics a la vez crean un solo evento', async () => {
    const { google, deps } = montar()
    google.esperaMs = 20
    const resultados = await Promise.all([
      reservar(valida(), undefined, deps),
      reservar(valida(), undefined, deps),
    ])
    expect(resultados.map((r) => r.tipo).sort()).toEqual(['creada', 'repetida'])
    expect(google.eventos).toHaveLength(1)
  })

  it.each([{ opcion: 'manicura-rusa-s' }, { inicio: '2026-11-03T10:00:00.000Z' }])(
    'una clave ya usada con otra cita se rechaza: %j',
    async (cambio) => {
      const { google, deps } = montar()
      await reservar(valida(), undefined, deps)
      await expect(reservar(valida(cambio), undefined, deps)).resolves.toEqual({
        tipo: 'clave-reutilizada',
      })
      expect(google.eventos).toHaveLength(1)
    },
  )

  it('@s26: sin Turnstile válido no se consulta Google ni se crea nada', async () => {
    const { google, candado, verificarTurnstile, deps } = montar()
    verificarTurnstile.mockResolvedValue(false)

    await expect(reservar(valida(), '203.0.113.7', deps)).resolves.toEqual({
      tipo: 'verificacion',
    })
    expect(verificarTurnstile).toHaveBeenCalledWith('token', '203.0.113.7', CLAVE)
    expect(candado.dias).toEqual([])
    expect(google.consultas).toEqual([])
    expect(google.eventos).toEqual([])
  })

  it('@s25: si Google falla, el error sube (la API responde 503) y no se crea nada', async () => {
    const { google, deps } = montar()
    vi.spyOn(google, 'ocupacion').mockRejectedValue(new ErrorServicio('google freeBusy: HTTP 503'))
    await expect(reservar(valida(), undefined, deps)).rejects.toBeInstanceOf(ErrorServicio)
    expect(google.eventos).toEqual([])
  })

  it('@s23 (lógica): con una trabajadora y dos clientas a la vez, una sola cita', async () => {
    const { google, deps } = montar(['trabajadora-1'])
    google.esperaMs = 20
    const otra = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
    const resultados = await Promise.all([
      reservar(valida(), undefined, deps),
      reservar(valida({ clave: otra, nombre: 'Bea' }), undefined, deps),
    ])
    expect(resultados.map((r) => r.tipo).sort()).toEqual(['creada', 'hora-ocupada'])
    expect(google.eventos).toHaveLength(1)
  })

  it('@s23 (control): sin bloqueo, el mismo caso crea dos citas solapadas', async () => {
    const { google, deps } = montar(['trabajadora-1'])
    google.esperaMs = 20
    const otra = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
    await Promise.all([
      reservar(valida(), undefined, { ...deps, candado: sinCandado }),
      reservar(valida({ clave: otra }), undefined, { ...deps, candado: sinCandado }),
    ])
    expect(google.eventos).toHaveLength(2)
  })
})
