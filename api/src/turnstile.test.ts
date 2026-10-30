// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { ErrorServicio } from './errores.ts'
import { verificarTurnstile } from './turnstile.ts'

function respuesta(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status })
}

const datos = {
  secreto: 'secreto-de-pruebas',
  token: 'token-del-widget',
  ip: '203.0.113.7',
  clave: '0f8fad5b-d9cb-469f-a165-70867728950e',
}

describe('verificarTurnstile (@s26)', () => {
  it('llama a siteverify con el secreto, el token, la IP y la clave como idempotency_key', async () => {
    const fetch = vi.fn(async () => respuesta({ success: true }))
    await verificarTurnstile({ ...datos, fetch })

    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
    expect(init.method).toBe('POST')
    expect(new Headers(init.headers).get('content-type')).toBe('application/json')
    expect(JSON.parse(init.body as string)).toEqual({
      secret: 'secreto-de-pruebas',
      response: 'token-del-widget',
      remoteip: '203.0.113.7',
      idempotency_key: '0f8fad5b-d9cb-469f-a165-70867728950e',
    })
  })

  it('sin IP conocida no envía remoteip', async () => {
    const fetch = vi.fn(async () => respuesta({ success: true }))
    await verificarTurnstile({ ...datos, ip: undefined, fetch })
    const [, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(init.body as string)).not.toHaveProperty('remoteip')
  })

  it('devuelve true si Cloudflare dice success: true', async () => {
    const fetch = vi.fn(async () => respuesta({ success: true }))
    await expect(verificarTurnstile({ ...datos, fetch })).resolves.toBe(true)
  })

  it.each([
    { success: false, 'error-codes': ['invalid-input-response'] },
    { success: false, 'error-codes': ['timeout-or-duplicate'] },
    { success: 'true' },
    {},
  ])('devuelve false si la verificación no pasa: %j', async (cuerpo) => {
    const fetch = vi.fn(async () => respuesta(cuerpo))
    await expect(verificarTurnstile({ ...datos, fetch })).resolves.toBe(false)
  })

  it('si siteverify responde con error HTTP, es un fallo del servicio (no una clienta rechazada)', async () => {
    const fetch = vi.fn(async () => respuesta({}, 500))
    const promesa = verificarTurnstile({ ...datos, fetch })
    await expect(promesa).rejects.toBeInstanceOf(ErrorServicio)
    await expect(promesa).rejects.toThrow('turnstile: HTTP 500')
  })

  it('un error interno de Cloudflare también es fallo del servicio', async () => {
    const fetch = vi.fn(async () =>
      respuesta({ success: false, 'error-codes': ['internal-error'] }),
    )
    await expect(verificarTurnstile({ ...datos, fetch })).rejects.toThrow(
      'turnstile: internal-error',
    )
  })
})
