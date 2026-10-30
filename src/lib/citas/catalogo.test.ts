import { describe, expect, it } from 'vitest'

import {
  buscarOpcion,
  CATALOGO_PROVISIONAL,
  type CategoriaCita,
  categoriasReservables,
  duracionLegible,
  esReservable,
  subserviciosReservables,
} from './catalogo.ts'
import { CATALOGO_CITAS } from './catalogo-datos.ts'

/**
 * Citas · Fase 3 (issue #30): el catálogo de citas. Un test por criterio del issue.
 * ANTI-TAUTOLOGÍA: los ids, nombres y minutos esperados se escriben A MANO, nunca derivados de los datos.
 */

/** Catálogo mínimo de test, escrito a mano: aísla la lógica de los datos provisionales. */
const MINI: CategoriaCita[] = [
  {
    id: 'a',
    nombre: 'Categoría A',
    subservicios: [
      {
        id: 'a1',
        nombre: 'Con opciones mixtas',
        pregunta: '¿Largo?',
        opciones: [
          { id: 'a1-s', clave: 'S', etiqueta: 'Corta', precio: 20, minutos: 60 },
          { id: 'a1-xl', clave: 'XL', etiqueta: 'Extra', precio: null, minutos: null },
        ],
      },
      {
        id: 'a2',
        nombre: 'Solo consultar',
        pregunta: 'Precio',
        opciones: [{ id: 'a2-1', etiqueta: 'Consultar', precio: null, minutos: null }],
      },
    ],
  },
  {
    id: 'b',
    nombre: 'Categoría B (nada reservable)',
    subservicios: [
      {
        id: 'b1',
        nombre: 'Duración cero',
        pregunta: 'Precio',
        opciones: [{ id: 'b1-1', etiqueta: 'Cero', precio: 0, minutos: 0 }],
      },
    ],
  },
]

describe('criterio 1 · categorías reservables del catálogo real', () => {
  it('salen Manicura, Pedicura, Depilación, Retirada y Manipedi, en ese orden', () => {
    expect(categoriasReservables().map((c) => c.nombre)).toEqual([
      'Manicura',
      'Pedicura',
      'Depilación',
      'Retirada',
      'Manipedi',
    ])
  })

  it('una categoría sin ningún subservicio reservable no aparece', () => {
    expect(categoriasReservables(MINI).map((c) => c.id)).toEqual(['a'])
  })
})

describe('criterio 2 · una opción sin duración no es reservable', () => {
  it('«Uña Extra Larga» de la manicura rusa no es reservable y «Uña Mediana» sí', () => {
    expect(esReservable(buscarOpcion('manicura-rusa-xl-xxl')!.opcion)).toBe(false)
    expect(esReservable(buscarOpcion('manicura-rusa-m')!.opcion)).toBe(true)
  })

  it('duración nula o cero → no reservable; positiva → reservable', () => {
    expect(esReservable({ id: 'x', etiqueta: 'x', precio: 10, minutos: null })).toBe(false)
    expect(esReservable({ id: 'x', etiqueta: 'x', precio: 10, minutos: 0 })).toBe(false)
    expect(esReservable({ id: 'x', etiqueta: 'x', precio: null, minutos: 1 })).toBe(true)
  })
})

describe('criterio 3 · subservicios reservables de una categoría', () => {
  it('un subservicio sin opciones reservables no aparece, y del resto solo quedan sus opciones reservables', () => {
    const subs = subserviciosReservables(MINI[0]!)
    expect(subs.map((s) => s.id)).toEqual(['a1'])
    expect(subs[0]!.opciones.map((o) => o.id)).toEqual(['a1-s'])
  })

  it('en el catálogo real, «Reparación de Uña Rota» no se reserva en línea pero la manicura rusa sí', () => {
    const manicura = categoriasReservables().find((c) => c.id === 'manicura')!
    const ids = manicura.subservicios.map((s) => s.id)
    expect(ids).not.toContain('manicura-reparacion')
    expect(ids).toContain('manicura-rusa')
  })

  it('en el catálogo real, Pedicura deja fuera Construcción y Desenterrar', () => {
    const pedicura = categoriasReservables().find((c) => c.id === 'pedicura')!
    expect(pedicura.subservicios.map((s) => s.id)).toEqual([
      'pedicura-con-durezas',
      'pedicura-sin-durezas',
      'pedicura-limar-cortar',
    ])
  })
})

describe('criterio 4 · buscar una opción por id', () => {
  it('devuelve la categoría, el subservicio y la opción', () => {
    const r = buscarOpcion('manicura-rusa-m')!
    expect(r.categoria.nombre).toBe('Manicura')
    expect(r.subservicio.nombre).toBe('Manicura Completa con Base Proteínica (Técnica Rusa)')
    expect(r.opcion).toEqual({
      id: 'manicura-rusa-m',
      clave: 'M',
      etiqueta: 'Uña Mediana',
      precio: 29,
      minutos: 60,
    })
  })

  it('encuentra opciones de la última categoría y de un catálogo inyectado', () => {
    expect(buscarOpcion('manipedi-1')!.opcion.minutos).toBe(45)
    expect(buscarOpcion('a1-s', MINI)!.subservicio.id).toBe('a1')
  })

  it('un id inexistente devuelve null', () => {
    expect(buscarOpcion('no-existe')).toBeNull()
    expect(buscarOpcion('manicura-rusa-m', MINI)).toBeNull()
  })
})

describe('criterio 5 · duración legible', () => {
  it.each([
    [45, '45 min'],
    [60, '1 h'],
    [75, '1 h 15 min'],
    [120, '2 h'],
    [30, '30 min'],
  ])('%i minutos → «%s»', (minutos, texto) => {
    expect(duracionLegible(minutos)).toBe(texto)
  })
})

describe('criterio 6 · forma del catálogo', () => {
  it('los ids de opción son únicos en todo el catálogo', () => {
    const ids = CATALOGO_CITAS.flatMap((c) =>
      c.subservicios.flatMap((s) => s.opciones.map((o) => o.id)),
    )
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBe(54)
  })

  it('el catálogo se declara provisional', () => {
    expect(CATALOGO_PROVISIONAL).toBe(true)
  })
})
