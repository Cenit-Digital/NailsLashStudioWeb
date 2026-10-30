import { describe, expect, it } from 'vitest'

import { configCitas } from './config.ts'

/**
 * Citas · Fase 7 (issue #39), decisiones 1 y 2: la vía de citas se enciende con `VITE_CITAS_API`;
 * sin valor no hay modal y los dos botones siguen siendo enlaces (@s4). La clave pública de
 * Turnstile, sin valor, es la de pruebas de Cloudflare que siempre pasa.
 */
describe('@s29 configCitas: sin host la vía de citas está apagada', () => {
  it('sin variables, apagada', () => {
    expect(configCitas({})).toBeNull()
  })

  it('con la variable vacía o en blanco, apagada', () => {
    expect(configCitas({ VITE_CITAS_API: '' })).toBeNull()
    expect(configCitas({ VITE_CITAS_API: '   ' })).toBeNull()
  })

  it('con host, encendida y sin barras finales; Turnstile por defecto en la clave de pruebas', () => {
    expect(configCitas({ VITE_CITAS_API: ' https://citas.example.org// ' })).toEqual({
      api: 'https://citas.example.org',
      sitekey: '1x00000000000000000000AA',
    })
  })

  it('una barra que no es final se conserva', () => {
    expect(configCitas({ VITE_CITAS_API: 'https://x.org/v1/' })?.api).toBe('https://x.org/v1')
  })

  it('la clave de Turnstile del entorno manda; en blanco, la de pruebas', () => {
    expect(
      configCitas({ VITE_CITAS_API: 'https://x.org', VITE_TURNSTILE_SITEKEY: ' 0x4AAA ' })?.sitekey,
    ).toBe('0x4AAA')
    expect(
      configCitas({ VITE_CITAS_API: 'https://x.org', VITE_TURNSTILE_SITEKEY: '  ' })?.sitekey,
    ).toBe('1x00000000000000000000AA')
  })
})
