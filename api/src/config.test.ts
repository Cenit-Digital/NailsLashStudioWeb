// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { leerConfig } from './config.ts'

const entorno = {
  CITAS_CALENDARIOS: ' cal-1@group.calendar.google.com , cal-2@group.calendar.google.com ',
  GOOGLE_CLIENT_ID: 'id',
  GOOGLE_CLIENT_SECRET: 'secreto',
  GOOGLE_REFRESH_TOKEN: 'refresco',
  CITAS_REMITENTE: 'citas@cenit.es',
  CITAS_EMAIL_SALON: 'salon@nails.es',
  TURNSTILE_SECRETO: 'turnstile',
  DATABASE_URL: 'postgres://u:p@pg:5432/citas',
}

describe('leerConfig (@s28: los secretos solo llegan por el entorno)', () => {
  it('lee la configuración completa; el puerto por defecto es 8080', () => {
    expect(leerConfig(entorno)).toEqual({
      puerto: 8080,
      calendarios: ['cal-1@group.calendar.google.com', 'cal-2@group.calendar.google.com'],
      google: {
        clientId: 'id',
        clientSecret: 'secreto',
        refreshToken: 'refresco',
        remitente: 'citas@cenit.es',
      },
      emailSalon: 'salon@nails.es',
      turnstileSecreto: 'turnstile',
      databaseUrl: 'postgres://u:p@pg:5432/citas',
    })
  })

  it('respeta PORT', () => {
    expect(leerConfig({ ...entorno, PORT: '3000' }).puerto).toBe(3000)
  })

  it.each(['0', '-1', '70000', 'abc', '80.5'])('rechaza un PORT inválido: %j', (PORT) => {
    expect(() => leerConfig({ ...entorno, PORT })).toThrow('PORT inválido')
  })

  it('acepta los extremos 1 y 65535', () => {
    expect(leerConfig({ ...entorno, PORT: '1' }).puerto).toBe(1)
    expect(leerConfig({ ...entorno, PORT: '65535' }).puerto).toBe(65535)
  })

  it('si falta algo, lo dice por su NOMBRE y sin mostrar ningún valor', () => {
    const incompleto = { ...entorno, GOOGLE_CLIENT_SECRET: undefined, DATABASE_URL: '' }
    delete (incompleto as Record<string, unknown>).TURNSTILE_SECRETO
    expect(() => leerConfig(incompleto)).toThrow(
      'Faltan variables de entorno: GOOGLE_CLIENT_SECRET, TURNSTILE_SECRETO, DATABASE_URL',
    )
  })

  it('sin CITAS_CALENDARIOS, falta', () => {
    const sinCalendarios: Record<string, string | undefined> = { ...entorno }
    delete sinCalendarios.CITAS_CALENDARIOS
    expect(() => leerConfig(sinCalendarios)).toThrow(
      'Faltan variables de entorno: CITAS_CALENDARIOS',
    )
  })

  it('una lista de calendarios vacía cuenta como falta', () => {
    expect(() => leerConfig({ ...entorno, CITAS_CALENDARIOS: ' , ' })).toThrow(
      'Faltan variables de entorno: CITAS_CALENDARIOS',
    )
  })
})
