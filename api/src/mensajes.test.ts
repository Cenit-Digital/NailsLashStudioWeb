// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { buscarOpcion, type OpcionEncontrada } from '../../src/lib/citas/catalogo.ts'
import {
  descripcionEvento,
  emailClienta,
  emailSalon,
  fechaMadrid,
  type DatosCita,
  tituloEvento,
} from './mensajes.ts'

function opcion(id: string): OpcionEncontrada {
  const encontrada = buscarOpcion(id)
  if (encontrada === null) throw new Error(id)
  return encontrada
}

const cita: DatosCita = {
  encontrada: opcion('manicura-rusa-m'),
  inicio: '2026-11-03T09:00:00.000Z',
  fin: '2026-11-03T10:00:00.000Z',
  minutos: 60,
  nombre: 'Ana',
  telefono: '611 22 33 44',
  email: 'ana@mail.es',
}

// El servidor puede estar en cualquier zona horaria: todo debe salir en hora de Madrid igualmente.
const zonaOriginal = process.env.TZ
beforeAll(() => {
  process.env.TZ = 'America/New_York'
})
afterAll(() => {
  if (zonaOriginal === undefined) delete process.env.TZ
  else process.env.TZ = zonaOriginal
})

describe('tituloEvento (@s20)', () => {
  it('categoría · subservicio (opción) — nombre', () => {
    expect(tituloEvento(cita)).toBe(
      'Manicura · Manicura Completa con Base Proteínica (Técnica Rusa) (Uña Mediana) — Ana',
    )
  })
})

describe('fechaMadrid', () => {
  it('da la fecha de pared de Madrid de un instante UTC', () => {
    expect(fechaMadrid('2026-11-03T09:00:00.000Z')).toBe('2026-11-03')
    // 23:30 UTC del 2 de noviembre ya es día 3 en Madrid (UTC+1).
    expect(fechaMadrid('2026-11-02T23:30:00.000Z')).toBe('2026-11-03')
  })
})

describe('descripcionEvento', () => {
  it('lleva los datos de contacto y la reserva para el salón', () => {
    expect(descripcionEvento(cita)).toBe(
      [
        'Reserva hecha en la web.',
        'Clienta: Ana',
        'Teléfono: 611 22 33 44',
        'Email: ana@mail.es',
        'Duración: 1 h',
        'Precio: 29 € (orientativo)',
      ].join('\n'),
    )
  })

  it('una opción sin precio dice «a consultar»', () => {
    const sinPrecio = {
      ...cita,
      encontrada: {
        ...cita.encontrada,
        opcion: { ...cita.encontrada.opcion, precio: null },
      },
    }
    expect(descripcionEvento(sinPrecio)).toContain('Precio: a consultar en el salón')
  })
})

describe('emailClienta (@s21)', () => {
  it('servicio, día, hora, dirección y cómo cancelar llamando al salón', () => {
    expect(emailClienta(cita)).toEqual({
      asunto: 'Cita confirmada: martes 3 de noviembre a las 10:00',
      texto: [
        'Hola, Ana:',
        '',
        'Tu cita en Nails Lash Studio está confirmada.',
        '',
        'Servicio: Manicura · Manicura Completa con Base Proteínica (Técnica Rusa) (Uña Mediana)',
        'Día: martes 3 de noviembre',
        'Hora: de 10:00 a 11:00 (1 h)',
        'Precio: 29 € (orientativo)',
        'Dirección: C.C. El Zoco, Av. de Atenas 75, Local 41, Planta 0, 28232 Las Rozas de Madrid',
        '',
        'Si necesitas cancelar o cambiar la cita, llama al salón: 625 22 33 66.',
        '',
        'Nails Lash Studio',
      ].join('\n'),
    })
  })

  it('en horario de verano también usa la hora de Madrid', () => {
    const verano = {
      ...cita,
      inicio: '2026-07-04T08:30:00.000Z',
      fin: '2026-07-04T09:15:00.000Z',
      minutos: 45,
    }
    const { asunto, texto } = emailClienta(verano)
    expect(asunto).toBe('Cita confirmada: sábado 4 de julio a las 10:30')
    expect(texto).toContain('Hora: de 10:30 a 11:15 (45 min)')
  })
})

describe('emailSalon (@s21)', () => {
  it('el mismo resumen más el teléfono y el email de la clienta', () => {
    expect(emailSalon(cita)).toEqual({
      asunto: 'Nueva cita web: Ana, martes 3 de noviembre a las 10:00',
      texto: [
        'Nueva cita reservada en la web.',
        '',
        'Servicio: Manicura · Manicura Completa con Base Proteínica (Técnica Rusa) (Uña Mediana)',
        'Día: martes 3 de noviembre',
        'Hora: de 10:00 a 11:00 (1 h)',
        'Precio: 29 € (orientativo)',
        '',
        'Clienta: Ana',
        'Teléfono: 611 22 33 44',
        'Email: ana@mail.es',
        '',
        'La cita ya está en el calendario.',
      ].join('\n'),
    })
  })
})
