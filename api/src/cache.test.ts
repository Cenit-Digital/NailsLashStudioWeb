// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { crearCacheCorta } from './cache.ts'

const T0 = new Date('2026-11-01T10:00:00.000Z')

function en(milisegundos: number): Date {
  return new Date(T0.getTime() + milisegundos)
}

function montar() {
  let llamadas = 0
  const calcular = vi.fn(async (ahora: Date) => {
    llamadas += 1
    return `valor ${llamadas} de ${ahora.toISOString()}`
  })
  return { cache: crearCacheCorta(60_000, calcular), calcular }
}

describe('crearCacheCorta (Fase 8, issue #41)', () => {
  it('la primera vez calcula con la hora pedida', async () => {
    const { cache, calcular } = montar()
    expect(await cache.obtener(T0)).toBe('valor 1 de 2026-11-01T10:00:00.000Z')
    expect(calcular).toHaveBeenCalledWith(T0)
  })

  it('dentro de los 60 s devuelve lo guardado sin volver a calcular', async () => {
    const { cache, calcular } = montar()
    await cache.obtener(T0)
    expect(await cache.obtener(en(59_999))).toBe('valor 1 de 2026-11-01T10:00:00.000Z')
    expect(calcular).toHaveBeenCalledTimes(1)
  })

  it('a los 60 s justos vuelve a calcular', async () => {
    const { cache, calcular } = montar()
    await cache.obtener(T0)
    expect(await cache.obtener(en(60_000))).toBe('valor 2 de 2026-11-01T10:01:00.000Z')
    expect(calcular).toHaveBeenCalledTimes(2)
  })

  it('el nuevo cálculo empieza otra ventana de 60 s', async () => {
    const { cache, calcular } = montar()
    await cache.obtener(T0)
    await cache.obtener(en(60_000))
    expect(await cache.obtener(en(119_999))).toBe('valor 2 de 2026-11-01T10:01:00.000Z')
    expect(calcular).toHaveBeenCalledTimes(2)
  })

  it('si el reloj va hacia atrás, no se fía de lo guardado', async () => {
    const { cache, calcular } = montar()
    await cache.obtener(T0)
    expect(await cache.obtener(en(-1))).toBe('valor 2 de 2026-11-01T09:59:59.999Z')
    expect(calcular).toHaveBeenCalledTimes(2)
  })

  it('dos peticiones a la vez comparten un solo cálculo', async () => {
    const { cache, calcular } = montar()
    const [a, b] = await Promise.all([cache.obtener(T0), cache.obtener(en(10))])
    expect(a).toBe('valor 1 de 2026-11-01T10:00:00.000Z')
    expect(b).toBe(a)
    expect(calcular).toHaveBeenCalledTimes(1)
  })

  it('un fallo no se guarda: la siguiente petición vuelve a calcular', async () => {
    const calcular = vi
      .fn<(ahora: Date) => Promise<string>>()
      .mockRejectedValueOnce(new Error('Google caído'))
      .mockResolvedValueOnce('bien')
    const cache = crearCacheCorta(60_000, calcular)
    await expect(cache.obtener(T0)).rejects.toThrow('Google caído')
    expect(await cache.obtener(en(1))).toBe('bien')
    expect(calcular).toHaveBeenCalledTimes(2)
  })

  it('un fallo antiguo no borra un cálculo posterior', async () => {
    let fallar: (error: Error) => void = () => undefined
    const calcular = vi
      .fn<(ahora: Date) => Promise<string>>()
      .mockImplementationOnce(
        () =>
          new Promise((_, rechazar) => {
            fallar = rechazar
          }),
      )
      .mockResolvedValueOnce('segundo')
    const cache = crearCacheCorta(60_000, calcular)
    const primero = cache.obtener(T0)
    cache.invalidar()
    expect(await cache.obtener(en(1))).toBe('segundo')
    fallar(new Error('tarde'))
    await expect(primero).rejects.toThrow('tarde')
    expect(await cache.obtener(en(2))).toBe('segundo')
    expect(calcular).toHaveBeenCalledTimes(2)
  })

  it('invalidar obliga a calcular de nuevo aunque no hayan pasado 60 s', async () => {
    const { cache, calcular } = montar()
    await cache.obtener(T0)
    cache.invalidar()
    expect(await cache.obtener(en(1))).toBe('valor 2 de 2026-11-01T10:00:00.001Z')
    expect(calcular).toHaveBeenCalledTimes(2)
  })
})
