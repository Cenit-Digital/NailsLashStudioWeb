import { afterEach, describe, expect, it, vi } from 'vitest'
import { responderIA } from './chat-nailbot-ia-logica'

afterEach(() => vi.unstubAllGlobals())

describe('adaptador de Nailbot IA', () => {
  it('envía JSON al endpoint sin credenciales y conserva la respuesta', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ conversacionId: 'conv', respuesta: 'Hola', solicitud: null }),
    })
    vi.stubGlobal('fetch', fetch)
    const signal = new AbortController().signal
    expect(await responderIA('https://api.example.test/', 'hola', 'conv', signal)).toEqual({
      conversacionId: 'conv',
      respuesta: 'Hola',
      solicitud: null,
    })
    expect(fetch).toHaveBeenCalledWith('https://api.example.test/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: 'hola', conversacionId: 'conv' }),
      credentials: 'omit',
      redirect: 'error',
      signal,
    })
  })

  it('omite el identificador si no existe y permite un enlace HTTPS de wa.me', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        conversacionId: 'nueva',
        respuesta: 'Listo',
        solicitud: { codigo: 'A1', enlaceWhatsApp: 'https://wa.me/34600000000?text=hola' },
      }),
    })
    vi.stubGlobal('fetch', fetch)
    const r = await responderIA('https://api.example.test', 'hola')
    expect(r.solicitud).toEqual({
      codigo: 'A1',
      enlaceWhatsApp: 'https://wa.me/34600000000?text=hola',
    })
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ texto: 'hola' })
  })

  it('normaliza barras finales repetidas sin alterar la ruta de la API', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ conversacionId: 'c', respuesta: 'hola', solicitud: null }),
    })
    vi.stubGlobal('fetch', fetch)
    await responderIA('https://api.example.test///', 'hola')
    expect(fetch.mock.calls[0][0]).toBe('https://api.example.test/v1/chat')
  })

  it.each([
    'http://wa.me/1',
    'https://wa.me.evil.test/1',
    'https://wa.me@evil.test/1',
    'https://user@wa.me/1',
    'https://user:pass@wa.me/1',
    'https://:pass@wa.me/1',
    'https://wa.me:444/1',
    'javascript:alert(1)',
    'no-url',
  ])('no devuelve enlaces no admitidos: %s', async (enlaceWhatsApp) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          conversacionId: 'c',
          respuesta: 'r',
          solicitud: { codigo: 'A1', enlaceWhatsApp },
        }),
      }),
    )
    expect((await responderIA('https://api.example.test', 'hola')).solicitud).toBeNull()
  })

  it.each([429, 500])('oculta detalle de error HTTP %s', async (status) => {
    const json = vi.fn().mockResolvedValue({ error: 'detalle privado' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status, json }))
    await expect(responderIA('https://api.example.test', 'hola')).rejects.toThrow(
      'No se pudo contactar con el asistente.',
    )
    expect(json).not.toHaveBeenCalled()
  })

  it('oculta errores de red y JSON inválido', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('secreto de red')))
    await expect(responderIA('https://api.example.test', 'hola')).rejects.toThrow(
      'No se pudo contactar con el asistente.',
    )
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('secreto JSON')
        },
      }),
    )
    await expect(responderIA('https://api.example.test', 'hola')).rejects.toThrow(
      'No se pudo contactar con el asistente.',
    )
  })

  it.each([
    { respuesta: 'hola' },
    { conversacionId: 'c', respuesta: 1 },
    { respuesta: 'hola', solicitud: null },
    { conversacionId: 'c', respuesta: 1, solicitud: null },
    { conversacionId: '', respuesta: 'hola', solicitud: null },
    { conversacionId: '   ', respuesta: 'hola', solicitud: null },
    { conversacionId: 'c', respuesta: '', solicitud: null },
    { conversacionId: 'c', respuesta: '   ', solicitud: null },
    {
      conversacionId: 'c',
      respuesta: 'hola',
      solicitud: { codigo: 1, enlaceWhatsApp: 'https://wa.me/1' },
    },
  ])('rechaza datos incompletos sin mostrarlos', async (datos) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => datos }))
    await expect(responderIA('https://api.example.test', 'hola')).rejects.toThrow(
      'No se pudo contactar con el asistente.',
    )
  })

  it('permite identificar la cancelación sin exponer el error de red', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('secreto')))
    await expect(
      responderIA('https://api.example.test', 'hola', undefined, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError', message: 'Operación cancelada.' })
  })
})
