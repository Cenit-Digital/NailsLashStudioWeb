// @vitest-environment node
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import EmbeddedPostgres from 'embedded-postgres'
import pg from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { crearCandadoPg } from './candado-pg.ts'
import { GoogleEnMemoria } from './dobles.ts'
import { reservar } from './reservar.ts'
import { validarReserva } from './validacion.ts'

/**
 * @s23 con un PostgreSQL REAL (embedded-postgres: binarios de PG que corren con el usuario, sin
 * Docker ni root). Fuera de la mutación (vitest.stryker.config.ts): arranca un servidor por proceso.
 */

let directorio: string
let servidor: EmbeddedPostgres
let pool: pg.Pool

beforeAll(async () => {
  directorio = await mkdtemp(join(tmpdir(), 'citas-pg-'))
  const puerto = 40000 + Math.floor(Math.random() * 20000)
  servidor = new EmbeddedPostgres({
    databaseDir: join(directorio, 'datos'),
    user: 'citas',
    password: 'citas-pruebas',
    port: puerto,
    persistent: false,
    onLog: () => undefined,
  })
  await servidor.initialise()
  await servidor.start()
  pool = new pg.Pool({
    host: 'localhost',
    port: puerto,
    user: 'citas',
    password: 'citas-pruebas',
    database: 'postgres',
  })
}, 120_000)

afterAll(async () => {
  await pool?.end()
  await servidor?.stop()
  await rm(directorio, { recursive: true, force: true })
}, 60_000)

function pausa(ms: number) {
  return new Promise((resuelve) => setTimeout(resuelve, ms))
}

describe('crearCandadoPg (PostgreSQL real)', () => {
  it('dos trabajos del mismo día se ejecutan de uno en uno', async () => {
    const candado = crearCandadoPg(pool)
    const traza: string[] = []
    const trabajo = (nombre: string) => async () => {
      traza.push(`${nombre}:entra`)
      await pausa(150)
      traza.push(`${nombre}:sale`)
    }

    await Promise.all([
      candado.conDia('2026-11-03', trabajo('a')),
      pausa(30).then(() => candado.conDia('2026-11-03', trabajo('b'))),
    ])
    expect(traza).toEqual(['a:entra', 'a:sale', 'b:entra', 'b:sale'])
  })

  it('días distintos no se bloquean entre sí', async () => {
    const candado = crearCandadoPg(pool)
    const traza: string[] = []
    const trabajo = (nombre: string) => async () => {
      traza.push(`${nombre}:entra`)
      await pausa(150)
      traza.push(`${nombre}:sale`)
    }

    await Promise.all([
      candado.conDia('2026-11-03', trabajo('a')),
      pausa(30).then(() => candado.conDia('2026-11-04', trabajo('b'))),
    ])
    expect(traza).toEqual(['a:entra', 'b:entra', 'a:sale', 'b:sale'])
  })

  it('si el trabajo falla, el error sube y el día queda libre', async () => {
    const candado = crearCandadoPg(pool)
    await expect(
      candado.conDia('2026-11-05', async () => {
        throw new Error('google caído')
      }),
    ).rejects.toThrow('google caído')
    await expect(candado.conDia('2026-11-05', async () => 'libre')).resolves.toBe('libre')
  })

  it('@s23: una trabajadora, un único hueco a las 12:00 y dos clientas a la vez → una sola cita', async () => {
    const google = new GoogleEnMemoria(['trabajadora-1'])
    // Lo demás del día, ocupado: solo queda libre el hueco de 12:00 a 13:00 (Madrid, UTC+1).
    google.ocupado.set('trabajadora-1', [
      { start: '2026-11-03T10:00:00+01:00', end: '2026-11-03T12:00:00+01:00' },
      { start: '2026-11-03T13:00:00+01:00', end: '2026-11-03T20:00:00+01:00' },
    ])
    google.esperaMs = 100
    const deps = {
      google,
      candado: crearCandadoPg(pool),
      calendarios: ['trabajadora-1'],
      verificarTurnstile: async () => true,
      ahora: () => new Date('2026-10-30T10:00:00.000Z'),
      emailSalon: 'salon@nails.es',
      avisar: () => undefined,
    }
    const peticion = (clave: string, nombre: string) => {
      const v = validarReserva({
        opcion: 'manicura-rusa-m',
        inicio: '2026-11-03T11:00:00.000Z',
        nombre,
        telefono: '611223344',
        email: 'c@mail.es',
        clave,
        turnstile: 't',
      })
      if (!v.ok) throw new Error(v.campo)
      return v
    }

    const resultados = await Promise.all([
      reservar(peticion('0f8fad5b-d9cb-469f-a165-70867728950e', 'Ana'), undefined, deps),
      reservar(peticion('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'Bea'), undefined, deps),
    ])

    expect(resultados.map((r) => r.tipo).sort()).toEqual(['creada', 'hora-ocupada'])
    expect(google.eventos).toHaveLength(1)
  })
})
