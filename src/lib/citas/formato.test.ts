import { afterEach, describe, expect, it, vi } from 'vitest'

import { diaCorto, diaLargo, horaMadrid } from './formato.ts'

/**
 * Citas · Fase 7 (issue #39), @s11: días y horas en hora de Madrid aunque el dispositivo esté en otra
 * zona. Noviembre de 2026 es CET (+01:00): el martes 3 a las 10:00 de Madrid son las 09:00Z.
 */
describe('@s11 formato en hora de Madrid', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('diaCorto parte la fecha en semana, día y mes cortos', () => {
    vi.stubEnv('TZ', 'America/New_York')
    expect(diaCorto('2026-11-03')).toEqual({ semana: 'mar', dia: '3', mes: 'nov' })
    expect(diaCorto('2026-11-08')).toEqual({ semana: 'dom', dia: '8', mes: 'nov' })
    expect(diaCorto('2026-12-01')).toEqual({ semana: 'mar', dia: '1', mes: 'dic' })
  })

  it('diaLargo es «martes 3 de noviembre», sin coma', () => {
    vi.stubEnv('TZ', 'Pacific/Kiritimati')
    expect(diaLargo('2026-11-03')).toBe('martes 3 de noviembre')
    expect(diaLargo('2026-11-28')).toBe('sábado 28 de noviembre')
  })

  it('horaMadrid pasa un instante UTC a «HH:MM» de Madrid', () => {
    vi.stubEnv('TZ', 'America/New_York')
    expect(horaMadrid('2026-11-03T09:00:00.000Z')).toBe('10:00')
    expect(horaMadrid('2026-11-03T18:30:00.000Z')).toBe('19:30')
    // En verano (CEST, +02:00).
    expect(horaMadrid('2026-07-01T07:05:00.000Z')).toBe('09:05')
  })
})
