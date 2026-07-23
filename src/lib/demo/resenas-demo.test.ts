import { describe, expect, it } from 'vitest'

import { EQUIPO_DEMO } from './equipo-demo'
import { LEYENDA_RESENAS, TESTIMONIOS_DEMO } from './resenas-demo'

/**
 * F-14 @s4/@s5 — los testimonios del carrusel son PROPIOS y de EJEMPLO (raíl legal duro, brief v3
 * §2 + `docs/research/legal-treatwell.md`: ni un texto de Treatwell). Contrato:
 * `features/resenas_agregado_enlace.feature`.
 *
 * ANTI-TAUTOLOGÍA: los literales esperados van A MANO. Comparar DOS fuentes de producción ENTRE SÍ
 * (los testimonios contra el reviewPool de `equipo-demo.ts`) NO es tautología: es la propiedad de
 * DISYUNCIÓN que exige el contrato — las dos secciones no pueden mostrar «a la misma clienta».
 */

/** Los servicios REALES del salón, escritos A MANO (los del catálogo: nunca «Facial»/«Depilación»). */
const SERVICIOS_DEL_SALON = ['Uñas', 'Pestañas', 'Cejas', 'Nail art', 'Pedicura']

/** Un nombre de pila, sin espacios ni inicial de apellido con punto. */
const NOMBRE_DE_PILA = /^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+$/

describe('@s4 el módulo demo exporta EXACTAMENTE SEIS testimonios propios, con su forma contratada', () => {
  it('@s4 son seis, ni uno más', () => {
    expect(TESTIMONIOS_DEMO).toHaveLength(6)
  })

  it('@s4 cada uno lleva autora de nombre de pila (sin inicial de apellido), texto corto de 1-2 frases, nota entera 4 o 5 y un servicio real del salón', () => {
    for (const testimonio of TESTIMONIOS_DEMO) {
      // El nombre de pila SIN inicial separa visualmente estos testimonios del patrón
      // «María L.» del reviewPool de #equipo.
      expect(testimonio.autora).toMatch(NOMBRE_DE_PILA)

      const frases = testimonio.texto.split('.').filter((tramo) => tramo.trim() !== '')

      expect(frases.length).toBeGreaterThanOrEqual(1)
      expect(frases.length).toBeLessThanOrEqual(2)
      expect(testimonio.texto.length).toBeLessThan(120)

      expect(Number.isInteger(testimonio.nota)).toBe(true)
      expect([4, 5]).toContain(testimonio.nota)

      expect(SERVICIOS_DEL_SALON).toContain(testimonio.servicio)
    }
  })

  it('@s4 al menos UNO de los seis tiene nota 4: sin él, la estrella vacía de @s7 jamás se pintaría (anti-vacuidad)', () => {
    expect(TESTIMONIOS_DEMO.some((testimonio) => testimonio.nota === 4)).toBe(true)
  })
})

describe('@s4 la DISYUNCIÓN con el reviewPool de #equipo: la intersección es VACÍA', () => {
  /** Las reseñas del pool de equipo, reunidas desde las rotaciones de los SIETE perfiles. */
  function poolDeEquipo(): { textos: Set<string>; nombresDePila: Set<string> } {
    const textos = new Set<string>()
    const nombresDePila = new Set<string>()

    for (const profesional of EQUIPO_DEMO) {
      for (const resena of profesional.resenas) {
        textos.add(resena.texto)
        nombresDePila.add(resena.autora.split(' ')[0])
      }
    }

    return { textos, nombresDePila }
  }

  it('@s4 el pool reunido trae las DIEZ reseñas de equipo-demo: el ancla que impide una disyunción vacua', () => {
    const { textos, nombresDePila } = poolDeEquipo()

    expect(textos.size).toBe(10)
    expect(nombresDePila.size).toBe(10)
  })

  it('@s4 NINGUNO de los seis textos coincide con ninguno de los diez del reviewPool', () => {
    const { textos } = poolDeEquipo()

    for (const testimonio of TESTIMONIOS_DEMO) {
      expect(textos.has(testimonio.texto)).toBe(false)
    }
  })

  it('@s4 ninguna autora coincide, ni siquiera en el nombre de pila, con las diez del reviewPool', () => {
    const { nombresDePila } = poolDeEquipo()

    for (const testimonio of TESTIMONIOS_DEMO) {
      expect(nombresDePila.has(testimonio.autora)).toBe(false)
    }
  })
})

describe('@s5 la leyenda de honestidad vive exportada en el módulo demo (patrón LEYENDA_EQUIPO)', () => {
  it('@s5 su texto es EXACTO, con su «·» y sus acentos, e integra el aviso del art. 20.4', () => {
    expect(LEYENDA_RESENAS).toBe(
      'Testimonios de ejemplo · textos de muestra pendientes de sustituir por reseñas reales de clientas del salón; la nota agregada procede de Treatwell.',
    )
  })
})
