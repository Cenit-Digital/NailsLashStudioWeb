import { afterEach, describe, expect, it, vi } from 'vitest'
import { LIMITE_TEXTO, responderIA, TIEMPO_MAXIMO_MS, urlNailbotIA } from './chat-nailbot-ia-logica'

/**
 * Contrato: features/nailbot_ia.feature. Los esperados son literales escritos a mano (anti-tautología)
 * y las formas de la API, las REALES de RAGchatbotIA `apps/api/src/http/app.ts` (`POST /v1/chat`).
 */
const API = 'https://chat.example.test'
const ERROR = 'No se pudo contactar con el asistente.'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

function cuerpoOk(extra: Record<string, unknown> = {}) {
  return { conversacionId: 'conv-1', respuesta: 'Hola', solicitud: null, ...extra }
}

function responde(cuerpo: unknown, init: ResponseInit = {}) {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(cuerpo), init))
  vi.stubGlobal('fetch', fetch)
  return fetch
}

describe('urlNailbotIA (@s1)', () => {
  it.each([
    [undefined, null],
    ['', null],
    ['   ', null],
    ['https://chat.example.test', 'https://chat.example.test'],
    ['  https://chat.example.test  ', 'https://chat.example.test'],
    ['https://chat.example.test/', 'https://chat.example.test'],
    ['https://chat.example.test///', 'https://chat.example.test'],
    ['https://chat.example.test/api/', 'https://chat.example.test/api'],
  ])('«%s» → %s', (valor, esperado) => {
    expect(urlNailbotIA({ VITE_NAILBOT_API_URL: valor })).toBe(esperado)
  })

  it('sin la clave en el entorno no hay modo IA', () => {
    expect(urlNailbotIA({})).toBeNull()
  })

  it('los límites son los de la enmienda (1000 caracteres, 75 s)', () => {
    expect(LIMITE_TEXTO).toBe(1000)
    expect(TIEMPO_MAXIMO_MS).toBe(75000)
  })
})

describe('responderIA (@s2)', () => {
  it('envía POST /v1/chat con {texto, conversacionId}, sin credenciales, y devuelve la respuesta', async () => {
    const fetch = responde(cuerpoOk())
    const r = await responderIA(API, 'hola', 'conv-0')
    expect(r).toEqual({ conversacionId: 'conv-1', respuesta: 'Hola', solicitud: null })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      'https://chat.example.test/v1/chat',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"texto":"hola","conversacionId":"conv-0"}',
        credentials: 'omit',
        redirect: 'error',
      }),
    )
  })

  it('en el primer turno no envía conversacionId', async () => {
    const fetch = responde(cuerpoOk())
    await responderIA(API, 'hola')
    expect(fetch.mock.calls[0][1].body).toBe('{"texto":"hola"}')
  })

  it('conserva la solicitud con un enlace de https://wa.me/', async () => {
    responde(
      cuerpoOk({
        solicitud: {
          id: 'x',
          codigo: 'A1B2C3',
          estado: 'pendiente',
          enlaceWhatsApp: 'https://wa.me/34600000000?text=Hola',
        },
      }),
    )
    expect((await responderIA(API, 'cita')).solicitud).toEqual({
      codigo: 'A1B2C3',
      enlaceWhatsApp: 'https://wa.me/34600000000?text=Hola',
    })
  })
})

describe('solicitud no pintable (@s3)', () => {
  it.each([
    'http://wa.me/1',
    'https://wa.me',
    'https://wa.me.evil.test/1',
    'https://wa.me@evil.test/1',
    'https://user@wa.me/1',
    'https://wa.me:444/1',
    'https://evil.test/https://wa.me/1',
    'javascript:alert(1)',
    'no-es-una-url',
    '',
    '   ',
  ])('un enlace «%s» deja la solicitud en null', async (enlaceWhatsApp) => {
    responde(cuerpoOk({ solicitud: { codigo: 'A1', enlaceWhatsApp } }))
    expect((await responderIA(API, 'hola')).solicitud).toBeNull()
  })

  it.each([
    { enlaceWhatsApp: 'https://wa.me/1' },
    { codigo: '', enlaceWhatsApp: 'https://wa.me/1' },
    { codigo: '  ', enlaceWhatsApp: 'https://wa.me/1' },
    { codigo: 7, enlaceWhatsApp: 'https://wa.me/1' },
    { codigo: 'A1' },
    { codigo: 'A1', enlaceWhatsApp: 7 },
  ])(
    'una solicitud incompleta (%j) deja la solicitud en null sin romper la respuesta',
    async (s) => {
      responde(cuerpoOk({ solicitud: s }))
      expect(await responderIA(API, 'hola')).toEqual({
        conversacionId: 'conv-1',
        respuesta: 'Hola',
        solicitud: null,
      })
    },
  )

  it('una respuesta sin el campo solicitud también vale', async () => {
    responde({ conversacionId: 'conv-1', respuesta: 'Hola' })
    expect((await responderIA(API, 'hola')).solicitud).toBeNull()
  })
})

describe('fallos saneados (@s4)', () => {
  it.each([400, 404, 413, 429, 500, 503])(
    'un estado %s rechaza con el error saneado aunque el cuerpo parezca válido',
    async (status) => {
      responde(cuerpoOk(), { status })
      await expect(responderIA(API, 'hola')).rejects.toThrow(ERROR)
    },
  )

  it('un 5xx no lee el cuerpo del servidor', async () => {
    const json = vi.fn().mockResolvedValue({ error: 'traza privada' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json }))
    await expect(responderIA(API, 'hola')).rejects.toThrow(ERROR)
    expect(json).not.toHaveBeenCalled()
  })

  it('un fallo de red rechaza con el error saneado, sin su mensaje', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('secreto de red')))
    const fallo = responderIA(API, 'hola')
    await expect(fallo).rejects.toThrow(ERROR)
    await expect(fallo).rejects.not.toThrow('secreto')
  })

  it('un cuerpo que no es JSON rechaza con el error saneado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>caído</html>')))
    await expect(responderIA(API, 'hola')).rejects.toThrow(ERROR)
  })

  it.each([
    ['null', null],
    ['una lista', []],
    ['un texto', 'hola'],
    ['un número', 7],
    ['un objeto vacío', {}],
    ['sin conversacionId', { respuesta: 'Hola', solicitud: null }],
    ['conversacionId numérico', { conversacionId: 7, respuesta: 'Hola' }],
    ['conversacionId vacío', { conversacionId: '', respuesta: 'Hola' }],
    ['conversacionId en blanco', { conversacionId: '   ', respuesta: 'Hola' }],
    ['sin respuesta', { conversacionId: 'c', solicitud: null }],
    ['respuesta numérica', { conversacionId: 'c', respuesta: 7 }],
    ['respuesta vacía', { conversacionId: 'c', respuesta: '' }],
    ['respuesta en blanco', { conversacionId: 'c', respuesta: '   ' }],
  ])('un 200 con %s rechaza con el error saneado', async (_caso, cuerpo) => {
    responde(cuerpo)
    await expect(responderIA(API, 'hola')).rejects.toThrow(ERROR)
  })
})

/**
 * El resultado de una promesa ya liquidada o la marca `colgada`: un mutante que deje la petición sin
 * cortar debe FALLAR la prueba, no colgarla hasta el tiempo máximo del ejecutor (un «timeout» invalida
 * el score de mutación).
 */
async function liquidada<T>(promesa: Promise<T>): Promise<T | 'colgada'> {
  return Promise.race([promesa, Promise.resolve('colgada' as const)])
}

describe('plazo y cancelación (@s5)', () => {
  /** Un fetch que no responde nunca y rechaza al abortarse su señal, como el real. */
  function fetchColgado() {
    const fetch = vi.fn((_url: string, init: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new Error('abortado')))
      })
    })
    vi.stubGlobal('fetch', fetch)
    return fetch
  }

  it('si el servidor no responde en 75 s, rechaza con el error saneado (ni un milisegundo antes)', async () => {
    vi.useFakeTimers()
    const fetch = fetchColgado()
    const fallo = responderIA(API, 'hola').catch((e: unknown) => e)
    await vi.advanceTimersByTimeAsync(74_999)
    expect(fetch.mock.calls[0][1].signal?.aborted).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(fetch.mock.calls[0][1].signal?.aborted).toBe(true)
    expect(await liquidada(fallo)).toEqual(new Error(ERROR))
  })

  it('el plazo se puede acortar', async () => {
    vi.useFakeTimers()
    const fetch = fetchColgado()
    const fallo = responderIA(API, 'hola', undefined, { tiempoMs: 3000 }).catch((e: unknown) => e)
    await vi.advanceTimersByTimeAsync(2999)
    expect(fetch.mock.calls[0][1].signal?.aborted).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(fetch.mock.calls[0][1].signal?.aborted).toBe(true)
    expect(await liquidada(fallo)).toEqual(new Error(ERROR))
  })

  it('al terminar bien, el plazo ya no corta nada', async () => {
    vi.useFakeTimers()
    const fetch = responde(cuerpoOk())
    await responderIA(API, 'hola')
    await vi.advanceTimersByTimeAsync(75_000)
    expect(fetch.mock.calls[0][1].signal?.aborted).toBe(false)
  })

  it('la señal de la vista corta la petición en vuelo con el error saneado', async () => {
    const fetch = fetchColgado()
    const vista = new AbortController()
    const fallo = responderIA(API, 'hola', undefined, { signal: vista.signal }).catch(
      (e: unknown) => e,
    )
    vista.abort()
    await new Promise((resolver) => setTimeout(resolver, 0))
    expect(fetch.mock.calls[0][1].signal?.aborted).toBe(true)
    expect(await liquidada(fallo)).toEqual(new Error(ERROR))
  })

  it('cancelar la señal de la vista DESPUÉS de terminar no toca la petición ya hecha', async () => {
    const fetch = responde(cuerpoOk())
    const vista = new AbortController()
    await responderIA(API, 'hola', undefined, { signal: vista.signal })
    vista.abort()
    expect(fetch.mock.calls[0][1].signal?.aborted).toBe(false)
  })
})
