import { afterEach, describe, expect, it, vi } from 'vitest'

import type { HorarioSemanal } from '../horario.ts'
import {
  type CalendarioOcupado,
  type ConsultaDisponibilidad,
  diasReservables,
  horasDisponibles,
  trabajadoraParaHueco,
} from './disponibilidad.ts'

/**
 * Citas · Fase 5 (issue #34): la lógica PURA de disponibilidad. Contrato: features/reserva_citas.feature
 * (@s11-@s16 y el cálculo de @s22/@s23). Un `describe` por criterio del issue.
 *
 * ANTI-TAUTOLOGÍA: los instantes se anclan A MANO como UTC con `Z` (noviembre de 2026 es CET, +01:00:
 * las 10:00 de Madrid son las 09:00Z); las fechas, horas y estados esperados se escriben a mano.
 * Calendario de noviembre de 2026: lunes 2, martes 3, miércoles 4, jueves 5, sábado 7, domingo 8.
 */

/** Lunes 2-nov-2026 a las 09:00 de Madrid: todos los huecos de esa semana quedan con antelación. */
const LUNES_9H = new Date('2026-11-02T08:00:00Z')

const LIBRE: CalendarioOcupado[] = [{ id: 't1', busy: [] }]

function horas(fecha: string, consulta: ConsultaDisponibilidad): string[] {
  return horasDisponibles(fecha, consulta).map((hueco) => hueco.hora)
}

describe('@s11 los días son los 30 próximos en hora de Madrid, no la del dispositivo', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('@s11 a las 23:30Z del lunes 2 ya es martes 3 en Madrid: 30 días del 2026-11-03 al 2026-12-02', () => {
    vi.stubEnv('TZ', 'America/New_York')
    const dias = diasReservables({
      ahora: new Date('2026-11-02T23:30:00Z'),
      minutos: 60,
      calendarios: LIBRE,
    })

    expect(dias).toEqual([
      { fecha: '2026-11-03', estado: 'disponible' },
      { fecha: '2026-11-04', estado: 'disponible' },
      { fecha: '2026-11-05', estado: 'disponible' },
      { fecha: '2026-11-06', estado: 'disponible' },
      { fecha: '2026-11-07', estado: 'disponible' },
      { fecha: '2026-11-08', estado: 'cerrado' },
      { fecha: '2026-11-09', estado: 'disponible' },
      { fecha: '2026-11-10', estado: 'disponible' },
      { fecha: '2026-11-11', estado: 'disponible' },
      { fecha: '2026-11-12', estado: 'disponible' },
      { fecha: '2026-11-13', estado: 'disponible' },
      { fecha: '2026-11-14', estado: 'disponible' },
      { fecha: '2026-11-15', estado: 'cerrado' },
      { fecha: '2026-11-16', estado: 'disponible' },
      { fecha: '2026-11-17', estado: 'disponible' },
      { fecha: '2026-11-18', estado: 'disponible' },
      { fecha: '2026-11-19', estado: 'disponible' },
      { fecha: '2026-11-20', estado: 'disponible' },
      { fecha: '2026-11-21', estado: 'disponible' },
      { fecha: '2026-11-22', estado: 'cerrado' },
      { fecha: '2026-11-23', estado: 'disponible' },
      { fecha: '2026-11-24', estado: 'disponible' },
      { fecha: '2026-11-25', estado: 'disponible' },
      { fecha: '2026-11-26', estado: 'disponible' },
      { fecha: '2026-11-27', estado: 'disponible' },
      { fecha: '2026-11-28', estado: 'disponible' },
      { fecha: '2026-11-29', estado: 'cerrado' },
      { fecha: '2026-11-30', estado: 'disponible' },
      { fecha: '2026-12-01', estado: 'disponible' },
      { fecha: '2026-12-02', estado: 'disponible' },
    ])
  })
})

describe('@s11 un día sin ningún hueco para la duración sale «completo»', () => {
  it('@s11 con la única trabajadora ocupada de 10:00 a 20:00 el miércoles 4, ese día sale completo', () => {
    const dias = diasReservables({
      ahora: LUNES_9H,
      minutos: 60,
      calendarios: [
        { id: 't1', busy: [{ start: '2026-11-04T09:00:00Z', end: '2026-11-04T19:00:00Z' }] },
      ],
    })

    expect(dias.slice(1, 4)).toEqual([
      { fecha: '2026-11-03', estado: 'disponible' },
      { fecha: '2026-11-04', estado: 'completo' },
      { fecha: '2026-11-05', estado: 'disponible' },
    ])
  })

  it('@s11 si la otra trabajadora está libre, el mismo día sigue disponible', () => {
    const dias = diasReservables({
      ahora: LUNES_9H,
      minutos: 60,
      calendarios: [
        { id: 't1', busy: [{ start: '2026-11-04T09:00:00Z', end: '2026-11-04T19:00:00Z' }] },
        { id: 't2', busy: [] },
      ],
    })

    expect(dias[2]).toEqual({ fecha: '2026-11-04', estado: 'disponible' })
  })

  it('@s11 un servicio más largo que la franja del sábado deja el sábado completo, no cerrado', () => {
    const dias = diasReservables({ ahora: LUNES_9H, minutos: 300, calendarios: LIBRE })

    expect(dias[5]).toEqual({ fecha: '2026-11-07', estado: 'completo' })
  })

  it('@s11 hoy a las 19:00 ya no queda ninguna hora con 2 h de antelación: hoy sale completo', () => {
    const dias = diasReservables({
      ahora: new Date('2026-11-02T18:00:00Z'),
      minutos: 60,
      calendarios: LIBRE,
    })

    expect(dias[0]).toEqual({ fecha: '2026-11-02', estado: 'completo' })
  })
})

describe('@s11 las excepciones de horario (festivos) mandan sobre el horario semanal', () => {
  it('@s11 un festivo con franjas vacías sale cerrado; los días de alrededor no cambian', () => {
    const dias = diasReservables({
      ahora: LUNES_9H,
      minutos: 60,
      calendarios: LIBRE,
      excepciones: [{ fecha: '2026-11-05', franjas: [] }],
    })

    expect(dias.slice(2, 5)).toEqual([
      { fecha: '2026-11-04', estado: 'disponible' },
      { fecha: '2026-11-05', estado: 'cerrado' },
      { fecha: '2026-11-06', estado: 'disponible' },
    ])
  })

  it('@s11 una excepción que abre un domingo de 10:00 a 12:00 ofrece sus horas', () => {
    const consulta = {
      ahora: LUNES_9H,
      minutos: 60,
      calendarios: LIBRE,
      excepciones: [{ fecha: '2026-11-08', franjas: [{ abre: 600, cierra: 720 }] }],
    }

    expect(diasReservables(consulta)[6]).toEqual({ fecha: '2026-11-08', estado: 'disponible' })
    expect(horas('2026-11-08', consulta)).toEqual(['10:00', '10:30', '11:00'])
  })

  it('@s11 sin excepciones se usa el horario real del salón (domingo cerrado, sábado hasta las 14:00)', () => {
    expect(horas('2026-11-08', { ahora: LUNES_9H, minutos: 60, calendarios: LIBRE })).toEqual([])
    expect(horas('2026-11-07', { ahora: LUNES_9H, minutos: 240, calendarios: LIBRE })).toEqual([
      '10:00',
    ])
  })
})

describe('@s11 el desfase de Madrid se calcula para el día pedido (cambio de hora)', () => {
  it('@s11 con ahora en CET (20-mar), el lunes 30-mar (CEST, +02:00) las 10:00 son las 08:00Z', () => {
    const [primera] = horasDisponibles('2026-03-30', {
      ahora: new Date('2026-03-20T09:00:00Z'),
      minutos: 60,
      calendarios: LIBRE,
    })

    expect(primera).toEqual({
      hora: '10:00',
      inicio: '2026-03-30T08:00:00.000Z',
      fin: '2026-03-30T09:00:00.000Z',
    })
  })
})

describe('@s11 el día del cambio de hora, una excepción que abre ese domingo usa el desfase nuevo', () => {
  const abreDomingo = (fecha: string) => ({
    ahora: new Date(`${fecha}T00:30:00Z`),
    minutos: 60,
    calendarios: LIBRE,
    excepciones: [{ fecha, franjas: [{ abre: 600, cierra: 720 }] }],
  })

  it('@s11 domingo 29-mar-2026 (pasa a CEST a las 01:00Z): las 10:00 son las 08:00Z', () => {
    expect(horasDisponibles('2026-03-29', abreDomingo('2026-03-29'))[0]).toEqual({
      hora: '10:00',
      inicio: '2026-03-29T08:00:00.000Z',
      fin: '2026-03-29T09:00:00.000Z',
    })
  })

  it('@s11 domingo 25-oct-2026 (vuelve a CET a las 01:00Z): las 10:00 son las 09:00Z', () => {
    expect(horasDisponibles('2026-10-25', abreDomingo('2026-10-25'))[0]).toEqual({
      hora: '10:00',
      inicio: '2026-10-25T09:00:00.000Z',
      fin: '2026-10-25T10:00:00.000Z',
    })
  })
})

describe('@s12 un día con algún hueco suficiente nunca sale completo', () => {
  const consulta = {
    ahora: LUNES_9H,
    minutos: 60,
    calendarios: [
      {
        id: 't1',
        busy: [
          { start: '2026-11-05T09:00:00Z', end: '2026-11-05T12:00:00Z' },
          { start: '2026-11-05T13:00:00Z', end: '2026-11-05T19:00:00Z' },
        ],
      },
    ],
  }

  it('@s12 con citas de 10:00 a 13:00 y de 14:00 a 20:00 el jueves 5 sale disponible', () => {
    expect(diasReservables(consulta)[3]).toEqual({ fecha: '2026-11-05', estado: 'disponible' })
  })

  it('@s12 y su única hora es las 13:00', () => {
    expect(horasDisponibles('2026-11-05', consulta)).toEqual([
      { hora: '13:00', inicio: '2026-11-05T12:00:00.000Z', fin: '2026-11-05T13:00:00.000Z' },
    ])
  })
})

describe('@s13 las horas cumplen el horario y la duración', () => {
  it('@s13 un sábado sin citas, 60 min: de 10:00 a 13:00 cada 30 min, sin las 13:30', () => {
    expect(horas('2026-11-07', { ahora: LUNES_9H, minutos: 60, calendarios: LIBRE })).toEqual([
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '13:00',
    ])
  })

  it('@s13 un servicio de 45 min el sábado puede empezar a las 13:00 (acaba 13:45) pero no a las 13:30', () => {
    expect(horas('2026-11-07', { ahora: LUNES_9H, minutos: 45, calendarios: LIBRE })).toEqual([
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '13:00',
    ])
  })

  it('@s13 con jornada partida (10:00-14:00 y 16:00-20:00) ninguna hora cruza el cierre del mediodía', () => {
    const partida: HorarioSemanal = {
      Monday: [
        { abre: 600, cierra: 840 },
        { abre: 960, cierra: 1200 },
      ],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    }

    expect(
      horas('2026-11-09', {
        ahora: LUNES_9H,
        minutos: 60,
        calendarios: LIBRE,
        horarioSemanal: partida,
      }),
    ).toEqual([
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '13:00',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
      '18:00',
      '18:30',
      '19:00',
    ])
  })
})

describe('@s14 no se ofrecen horas con menos de 2 h de antelación', () => {
  it('@s14 lunes 11:10 en Madrid, 30 min: de 13:30 a 19:30', () => {
    expect(
      horas('2026-11-02', {
        ahora: new Date('2026-11-02T10:10:00Z'),
        minutos: 30,
        calendarios: LIBRE,
      }),
    ).toEqual([
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
      '18:00',
      '18:30',
      '19:00',
      '19:30',
    ])
  })

  it('@s14 la antelación es inclusiva: a las 11:30 exactas se ofrecen las 13:30', () => {
    const lista = horas('2026-11-02', {
      ahora: new Date('2026-11-02T10:30:00Z'),
      minutos: 30,
      calendarios: LIBRE,
    })

    expect(lista[0]).toBe('13:30')
  })

  it('@s14 un minuto después (11:31) la primera pasa a las 14:00', () => {
    const lista = horas('2026-11-02', {
      ahora: new Date('2026-11-02T10:31:00Z'),
      minutos: 30,
      calendarios: LIBRE,
    })

    expect(lista[0]).toBe('14:00')
  })
})

describe('@s15 una hora vale si alguna trabajadora está libre toda la duración', () => {
  const consulta = {
    ahora: LUNES_9H,
    minutos: 60,
    calendarios: [
      { id: 't1', busy: [{ start: '2026-11-03T09:00:00Z', end: '2026-11-03T10:00:00Z' }] },
      { id: 't2', busy: [{ start: '2026-11-03T09:30:00Z', end: '2026-11-03T10:30:00Z' }] },
    ],
  }

  it('@s15 t1 ocupada 10:00-11:00 y t2 10:30-11:30: no 10:00 ni 10:30, sí 11:00 en adelante', () => {
    expect(horas('2026-11-03', consulta)).toEqual([
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
      '18:00',
      '18:30',
      '19:00',
    ])
  })

  it('@s15 a las 11:00 la primera trabajadora libre es t1 (t2 sigue ocupada)', () => {
    expect(trabajadoraParaHueco('2026-11-03T10:00:00.000Z', consulta)).toBe('t1')
  })

  it('@s15 a las 12:00 están libres las dos y gana la primera del array: t1', () => {
    expect(trabajadoraParaHueco('2026-11-03T11:00:00.000Z', consulta)).toBe('t1')
  })

  it('@s15 si t1 está ocupada a las 15:00 y t2 no, la hora va a t2', () => {
    expect(
      trabajadoraParaHueco('2026-11-03T14:00:00.000Z', {
        ahora: LUNES_9H,
        minutos: 60,
        calendarios: [
          { id: 't1', busy: [{ start: '2026-11-03T14:00:00Z', end: '2026-11-03T15:00:00Z' }] },
          { id: 't2', busy: [] },
        ],
      }),
    ).toBe('t2')
  })
})

describe('@s16 las citas apuntadas a mano en el calendario también ocupan', () => {
  const esperado = [
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '18:00',
    '18:30',
    '19:00',
  ]

  function conOcupado(start: string, end: string) {
    return { ahora: LUNES_9H, minutos: 60, calendarios: [{ id: 't1', busy: [{ start, end }] }] }
  }

  it('@s16 «Ocupado» de 16:00 a 18:00: no hay horas que se solapen; sí 15:00 y 18:00 (bordes)', () => {
    expect(horas('2026-11-03', conOcupado('2026-11-03T15:00:00Z', '2026-11-03T17:00:00Z'))).toEqual(
      esperado,
    )
  })

  it('@s16 el mismo ocupado con offset +01:00 da las mismas horas', () => {
    expect(
      horas('2026-11-03', conOcupado('2026-11-03T16:00:00+01:00', '2026-11-03T18:00:00+01:00')),
    ).toEqual(esperado)
  })

  it('@s16 el mismo ocupado con offset +02:00 da las mismas horas', () => {
    expect(
      horas('2026-11-03', conOcupado('2026-11-03T17:00:00+02:00', '2026-11-03T19:00:00+02:00')),
    ).toEqual(esperado)
  })
})

describe('@s16 un periodo ocupado ilegible ocupa (fallo cerrado: nunca se vende un hueco dudoso)', () => {
  it('@s16 con start/end que no son fechas, esa trabajadora no ofrece ninguna hora ese día', () => {
    expect(
      horas('2026-11-03', {
        ahora: LUNES_9H,
        minutos: 60,
        calendarios: [{ id: 't1', busy: [{ start: 'ayer', end: 'mañana' }] }],
      }),
    ).toEqual([])
  })
})

describe('@s22/@s23 la hora pedida se revalida antes de asignarla', () => {
  const consulta = {
    ahora: LUNES_9H,
    minutos: 60,
    calendarios: [
      { id: 't1', busy: [{ start: '2026-11-03T09:00:00Z', end: '2026-11-03T10:00:00Z' }] },
    ],
  }

  it('@s22 una hora libre, tal como la devuelve horasDisponibles, devuelve la trabajadora', () => {
    expect(trabajadoraParaHueco('2026-11-03T11:00:00.000Z', consulta)).toBe('t1')
  })

  it('@s22 el mismo instante escrito de otra forma (+01:00) se rechaza: solo vale el inicio ofrecido', () => {
    expect(trabajadoraParaHueco('2026-11-03T12:00:00+01:00', consulta)).toBeNull()
  })

  it('@s22 un inicio sin offset (ambiguo según la zona del servidor) se rechaza', () => {
    vi.stubEnv('TZ', 'UTC')
    expect(trabajadoraParaHueco('2026-11-03T11:00:00', consulta)).toBeNull()
    vi.unstubAllEnvs()
  })

  it('@s22 una hora ocupada en todos los calendarios devuelve null', () => {
    expect(trabajadoraParaHueco('2026-11-03T09:00:00.000Z', consulta)).toBeNull()
  })

  it('@s22 una hora fuera de horario (sábado 13:30 para 60 min) devuelve null', () => {
    expect(trabajadoraParaHueco('2026-11-07T12:30:00.000Z', consulta)).toBeNull()
  })

  it('@s22 una hora que no es media hora en punto (10:15) devuelve null', () => {
    expect(trabajadoraParaHueco('2026-11-04T09:15:00.000Z', consulta)).toBeNull()
  })

  it('@s22 una hora sin 2 h de antelación (lunes 10:30 con ahora a las 09:00) devuelve null', () => {
    expect(trabajadoraParaHueco('2026-11-02T09:30:00.000Z', consulta)).toBeNull()
  })

  it('@s22 un inicio que no es una fecha devuelve null', () => {
    expect(trabajadoraParaHueco('mañana a las diez', consulta)).toBeNull()
  })
})

describe('las horas solo existen dentro de los 30 días reservables', () => {
  const consulta = { ahora: LUNES_9H, minutos: 60, calendarios: LIBRE }

  it('el último día de la ventana (2026-12-01) tiene horas', () => {
    expect(horas('2026-12-01', consulta)[0]).toBe('10:00')
  })

  it('el día siguiente (2026-12-02) no tiene horas', () => {
    expect(horas('2026-12-02', consulta)).toEqual([])
  })

  it('un día anterior a hoy (2026-11-01) no tiene horas', () => {
    expect(horas('2026-11-01', consulta)).toEqual([])
  })

  it('una hora fuera de la ventana no se asigna', () => {
    expect(trabajadoraParaHueco('2026-12-02T09:00:00.000Z', consulta)).toBeNull()
  })
})
