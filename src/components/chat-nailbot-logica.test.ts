import { describe, expect, it, vi } from 'vitest'

import { HORARIO } from '../lib/site'
import {
  enfocarPrimerControl,
  estadoInicial,
  fraseSabado,
  opcionesDelPaso,
  resumenFinal,
  responder,
  SELECTOR_CONTROLES,
  sinSurrogatesSueltos,
  type EntradaChat,
  type EstadoChat,
} from './chat-nailbot-logica'

/**
 * El cerebro PURO de Nailbot (F-23, features/nailbot_chat_compartido.feature @s4 canario, @s5, @s11).
 * Todo literal esperado va ESCRITO A MANO (anti-tautología): jamás se importa `nailbot-demo.ts` como
 * esperado. Única excepción declarada (HS-3 b): el canario LEE `HORARIO.sabado` como PRECONDICIÓN.
 */
const SALUDO =
  '¡Hola! Soy Nailbot 💅, el asistente automático de Nails Lash Studio. ¿Qué te apetece reservar?'
const PREGUNTA_DIA = '¡Me encanta! ¿Qué día te viene mejor?'
const PREGUNTA_FRANJA = '¿Prefieres alguna franja horaria?'
const PREGUNTA_NOMBRE =
  '¡Casi lo tenemos! ¿A qué nombre hago la solicitud? Si lo prefieres, puedes saltártelo.'
const COLA =
  '. Envíasela al salón por WhatsApp con el enlace de abajo y allí te confirmarán la hora exacta.'

const elegir = (valor: string): EntradaChat => ({ tipo: 'elegir', valor })

function recorrer(estado: EstadoChat, entradas: readonly EntradaChat[]): EstadoChat {
  return entradas.reduce((actual, entrada) => responder(actual, entrada), estado)
}

function congelar<T>(valor: T): T {
  if (typeof valor === 'object' && valor !== null) {
    for (const hijo of Object.values(valor)) {
      congelar(hijo)
    }
    Object.freeze(valor)
  }
  return valor
}

describe('@s4 canario de acoplamiento declarado (HS-3 b)', () => {
  it('@s4 el sábado REAL de F-02 cierra a las 14:00: la frase «así que te busco hueco por la mañana» depende de ello', () => {
    // PRECONDICIÓN, no valor esperado importado: si falla, revisar la frase del sábado en nailbot-demo.ts.
    expect(
      HORARIO.sabado.endsWith('-14:00'),
      'El sábado ya no cierra a las 14:00: la frase «así que te busco hueco por la mañana» puede mentir. Revísala.',
    ).toBe(true)
  })

  it('@s4 el estado inicial por defecto lleva el rango real del sábado, leído en la llamada', () => {
    expect(estadoInicial().horarioSabado).toBe('10:00-14:00')
  })
})

describe('@s5 la regla del sábado es PURA y sale del DATO en la llamada', () => {
  const casos = [
    {
      rango: '10:00-14:00',
      nuevos: [
        'Los sábados abrimos de 10:00 a 14:00, así que te busco hueco por la mañana.',
        PREGUNTA_NOMBRE,
      ],
      paso: 'nombre',
      franja: 'Por la mañana',
    },
    {
      rango: '09:30-13:00',
      nuevos: [
        'Los sábados abrimos de 09:30 a 13:00, así que te busco hueco por la mañana.',
        PREGUNTA_NOMBRE,
      ],
      paso: 'nombre',
      franja: 'Por la mañana',
    },
    { rango: 'cerrado', nuevos: [PREGUNTA_FRANJA], paso: 'franja', franja: undefined },
    { rango: '10-14', nuevos: [PREGUNTA_FRANJA], paso: 'franja', franja: undefined },
  ] as const

  for (const caso of casos) {
    it(`@s5 con el rango «${caso.rango}» → paso «${caso.paso}»`, () => {
      const enDia = responder(estadoInicial(caso.rango), elegir('Uñas'))
      const siguiente = responder(enDia, elegir('Un sábado'))
      const nuevosDelBot = siguiente.mensajes.slice(enDia.mensajes.length + 1)

      expect(siguiente.mensajes[enDia.mensajes.length]).toEqual({
        deBot: false,
        texto: 'Un sábado',
      })
      expect(nuevosDelBot.map((m) => m.texto)).toEqual(caso.nuevos)
      expect(nuevosDelBot.every((m) => m.deBot)).toBe(true)
      expect(siguiente.paso).toBe(caso.paso)
      expect(siguiente.respuestas.franja).toBe(caso.franja)
      expect(siguiente.respuestas.dia).toBe('Un sábado')
      for (const mensaje of siguiente.mensajes) {
        expect(mensaje.texto).not.toContain(`abrimos de ${caso.rango}`)
      }
    })
  }

  it('@s5 «Lo antes posible» NO es el sábado: pregunta la franja', () => {
    const siguiente = recorrer(estadoInicial('10:00-14:00'), [
      elegir('Uñas'),
      elegir('Lo antes posible'),
    ])

    expect(siguiente.paso).toBe('franja')
    expect(siguiente.mensajes.at(-1)).toEqual({ deBot: true, texto: PREGUNTA_FRANJA })
  })
})

describe('fraseSabado — la guarda HH:MM-HH:MM, por valor', () => {
  it('deriva la frase de un rango bien formado', () => {
    expect(fraseSabado('11:15-13:45')).toBe(
      'Los sábados abrimos de 11:15 a 13:45, así que te busco hueco por la mañana.',
    )
  })

  it('rechaza lo que no es EXACTAMENTE un rango HH:MM-HH:MM (anclado por los dos lados)', () => {
    for (const noRango of [
      'cerrado',
      '10-14',
      '1:00-14:00',
      '10:00-14:0',
      'x10:00-14:00',
      '10:00-14:00x',
      '10:00 - 14:00',
      '',
    ]) {
      expect(fraseSabado(noRango), noRango).toBeNull()
    }
  })
})

describe('@s11 responder es PURA — determinista, síncrona y sin mutar la entrada congelada', () => {
  it('@s11 dos llamadas con el mismo par no lanzan, dan estados iguales y NUEVOS, y no mutan la entrada', () => {
    const inicial = congelar(estadoInicial())
    const aMitad = congelar(responder(estadoInicial(), elegir('Uñas')))

    for (const estado of [inicial, aMitad]) {
      const copia = structuredClone(estado)
      const primera = responder(estado, elegir('Entre semana'))
      const segunda = responder(estado, elegir('Entre semana'))

      expect(primera).toEqual(segunda)
      expect(primera).not.toBe(estado)
      expect(estado).toEqual(copia)
    }
  })

  it('@s11 el resultado no es una Promise: la costura es síncrona hoy', () => {
    const resultado: unknown = responder(estadoInicial(), elegir('Uñas'))

    expect(resultado).not.toBeInstanceOf(Promise)
    expect((resultado as { then?: unknown }).then).toBeUndefined()
  })

  it('@s11 dos construcciones seguidas del estado inicial son iguales (determinista)', () => {
    expect(estadoInicial()).toEqual(estadoInicial())
    expect(estadoInicial()).toEqual({
      paso: 'servicio',
      mensajes: [{ deBot: true, texto: SALUDO }],
      respuestas: {},
      horarioSabado: '10:00-14:00',
    })
  })

  it('@s11 el nombre vacío o de solo espacios devuelve un estado igual al de entrada', () => {
    const enNombre = recorrer(estadoInicial(), [
      elegir('Uñas'),
      elegir('Entre semana'),
      elegir('Por la mañana'),
    ])

    expect(enNombre.paso).toBe('nombre')
    expect(responder(enNombre, { tipo: 'nombre', valor: '' })).toEqual(enNombre)
    expect(responder(enNombre, { tipo: 'nombre', valor: '   ' })).toEqual(enNombre)
  })

  it('@s11 un nombre de 300 caracteres llega ENTERO al resumen, sin truncar', () => {
    const largo = 'a'.repeat(300)
    const final = recorrer(estadoInicial(), [
      elegir('Uñas'),
      elegir('Entre semana'),
      elegir('Por la mañana'),
      { tipo: 'nombre', valor: largo },
    ])

    expect(final.mensajes.at(-1)?.texto).toContain(largo)
    expect(final.respuestas.nombre).toBe(largo)
  })

  it('@s11 el nombre se guarda y se pinta SIN los espacios de los extremos', () => {
    const final = recorrer(estadoInicial(), [
      elegir('Cejas'),
      elegir('Entre semana'),
      elegir('Por la tarde'),
      { tipo: 'nombre', valor: '  Marta  ' },
    ])

    expect(final.respuestas.nombre).toBe('Marta')
    expect(final.mensajes.at(-2)).toEqual({ deBot: false, texto: 'Marta' })
  })

  it('@s11 «reiniciar» desde el final del camino del sábado sin nombre devuelve el estado inicial EXACTO', () => {
    const final = recorrer(estadoInicial(), [
      elegir('Pestañas'),
      elegir('Un sábado'),
      { tipo: 'sinNombre' },
    ])

    expect(final.paso).toBe('hecho')
    expect(responder(final, { tipo: 'reiniciar' })).toEqual(estadoInicial())
  })

  // Sin etiqueta @s: no lo pide ningún escenario. Hace observable cada `tipo` de la entrada para la
  // mutación al 100 % (decisión del lead, progress/tdd_nailbot_chat_compartido.md).
  it('costura: una entrada que no reconoce devuelve el MISMO estado (nada cambia)', () => {
    const enNombre = recorrer(estadoInicial(), [
      elegir('Uñas'),
      elegir('Entre semana'),
      elegir('Por la mañana'),
    ])
    const desconocida = { tipo: '', valor: 'Marta' } as unknown as EntradaChat

    expect(responder(enNombre, desconocida)).toBe(enNombre)
  })

  it('@s11 «reiniciar» conserva el rango del sábado con el que se construyó el estado', () => {
    const final = recorrer(estadoInicial('09:30-13:00'), [
      elegir('Uñas'),
      elegir('Un sábado'),
      { tipo: 'sinNombre' },
    ])

    expect(responder(final, { tipo: 'reiniciar' }).horarioSabado).toBe('09:30-13:00')
  })
})

describe('el guion paso a paso, por valor', () => {
  it('cada opción queda registrada en su paso y avanza al siguiente', () => {
    const enDia = responder(estadoInicial(), elegir('Pestañas'))
    const enFranja = responder(enDia, elegir('Entre semana'))
    const enNombre = responder(enFranja, elegir('Me es indiferente'))

    expect(enDia.paso).toBe('dia')
    expect(enDia.respuestas).toEqual({ servicio: 'Pestañas' })
    expect(enFranja.paso).toBe('franja')
    expect(enFranja.respuestas).toEqual({ servicio: 'Pestañas', dia: 'Entre semana' })
    expect(enNombre.paso).toBe('nombre')
    expect(enNombre.respuestas).toEqual({
      servicio: 'Pestañas',
      dia: 'Entre semana',
      franja: 'Me es indiferente',
    })
    expect(enNombre.mensajes.map((m) => m.texto)).toEqual([
      SALUDO,
      'Pestañas',
      PREGUNTA_DIA,
      'Entre semana',
      PREGUNTA_FRANJA,
      'Me es indiferente',
      PREGUNTA_NOMBRE,
    ])
    expect(enNombre.mensajes.map((m) => m.deBot)).toEqual([
      true,
      false,
      true,
      false,
      true,
      false,
      true,
    ])
  })

  it('«Prefiero no decirlo» termina SIN nombre: la burbuja es de la persona y el resumen no inventa nombre', () => {
    const final = recorrer(estadoInicial(), [
      elegir('Cejas'),
      elegir('Lo antes posible'),
      elegir('Por la tarde'),
      { tipo: 'sinNombre' },
    ])

    expect(final.paso).toBe('hecho')
    expect('nombre' in final.respuestas).toBe(false)
    expect(final.mensajes.slice(-2)).toEqual([
      { deBot: false, texto: 'Prefiero no decirlo' },
      {
        deBot: true,
        texto: `¡Gracias! ✨ Tu solicitud: Cejas · Lo antes posible · Por la tarde${COLA}`,
      },
    ])
  })

  it('con nombre, el resumen saluda por el nombre', () => {
    const final = recorrer(estadoInicial(), [
      elegir('Uñas'),
      elegir('Entre semana'),
      elegir('Por la mañana'),
      { tipo: 'nombre', valor: 'Marta' },
    ])

    expect(final.paso).toBe('hecho')
    expect(final.mensajes.at(-1)).toEqual({
      deBot: true,
      texto: `¡Gracias, Marta! ✨ Tu solicitud: Uñas · Entre semana · Por la mañana${COLA}`,
    })
  })
})

describe('opcionesDelPaso y resumenFinal, por valor', () => {
  it('cada paso ofrece sus opciones cerradas; el nombre y el final, ninguna', () => {
    expect(opcionesDelPaso('servicio')).toEqual(['Uñas', 'Pestañas', 'Cejas'])
    expect(opcionesDelPaso('dia')).toEqual(['Entre semana', 'Un sábado', 'Lo antes posible'])
    expect(opcionesDelPaso('franja')).toEqual([
      'Por la mañana',
      'Por la tarde',
      'Me es indiferente',
    ])
    expect(opcionesDelPaso('nombre')).toEqual([])
    expect(opcionesDelPaso('hecho')).toEqual([])
  })

  it('resumenFinal con y sin nombre', () => {
    const base = { servicio: 'Uñas', dia: 'Un sábado', franja: 'Por la mañana' }

    expect(resumenFinal({ ...base, nombre: 'Lucía' })).toBe(
      `¡Gracias, Lucía! ✨ Tu solicitud: Uñas · Un sábado · Por la mañana${COLA}`,
    )
    expect(resumenFinal(base)).toBe(
      `¡Gracias! ✨ Tu solicitud: Uñas · Un sábado · Por la mañana${COLA}`,
    )
  })
})

describe('sinSurrogatesSueltos: un nombre con un emoji partido no rompe el enlace', () => {
  // Escapes \u a propósito: un surrogate suelto escrito «crudo» en el fichero se guarda como U+FFFD y el
  // test pasaría EN VACÍO (medido: la mutación lo destapó el 2026-09-28).
  it('CONTRAPRUEBA: la entrada está rota de verdad — encodeURIComponent lanza con un surrogate suelto', () => {
    expect(() => encodeURIComponent('Ana\uD83D')).toThrow(URIError)
    expect(() => encodeURIComponent('Ana\uDC85x')).toThrow(URIError)
  })

  it('sustituye los surrogates sueltos por U+FFFD y deja intactos los pares y el resto', () => {
    expect(sinSurrogatesSueltos('Ana\uD83D')).toBe('Ana�')
    expect(sinSurrogatesSueltos('\uD83DAna')).toBe('�Ana')
    expect(sinSurrogatesSueltos('\uDC85Ana')).toBe('�Ana')
    expect(sinSurrogatesSueltos('Ana\uDC85x')).toBe('Ana�x')
    expect(sinSurrogatesSueltos('Ana 💅 Mª')).toBe('Ana 💅 Mª')
    expect(sinSurrogatesSueltos('\uD83D💅')).toBe('�💅')
    expect(() => encodeURIComponent(sinSurrogatesSueltos('x\uD83Dy\uDC85'))).not.toThrow()
  })

  it('responder guarda el nombre ya saneado: el mensaje se puede codificar', () => {
    const final = recorrer(estadoInicial(), [
      elegir('Uñas'),
      elegir('Entre semana'),
      elegir('Por la mañana'),
      { tipo: 'nombre', valor: 'Ana\uD83D' },
    ])

    expect(final.respuestas.nombre).toBe('Ana�')
    expect(() => encodeURIComponent(final.mensajes.at(-1)?.texto ?? '')).not.toThrow()
  })
})

describe('enfocarPrimerControl (HS-4 b), por valor', () => {
  it('pide al contenedor el PRIMER control enfocable y lo enfoca', () => {
    const focus = vi.fn()
    const querySelector = vi.fn(() => ({ focus }))

    enfocarPrimerControl({ querySelector })

    expect(querySelector).toHaveBeenCalledWith('button, input, a[href]')
    expect(SELECTOR_CONTROLES).toBe('button, input, a[href]')
    expect(focus).toHaveBeenCalledTimes(1)
  })

  it('con el contenedor sin montar (null) o sin controles, no hace nada y no lanza', () => {
    expect(() => enfocarPrimerControl(null)).not.toThrow()
    expect(() => enfocarPrimerControl({ querySelector: () => null })).not.toThrow()
  })
})
