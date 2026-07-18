import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  abiertoEn,
  aMinutos,
  estaAbierto,
  EXCEPCIONES,
  HORARIO_SEMANAL,
  type HorarioSemanal,
  horarioParaUI,
  openingHoursSpecification,
  parsearFranjas,
} from './horario.ts'

/**
 * F-10 — la lógica PURA del horario. Contrato: features/horario.feature.
 *
 * ANTI-TAUTOLOGÍA (regla dura del repo): los instantes de test se anclan A MANO como UTC con `Z`
 * (`Date.UTC`/ISO-Z), NUNCA con `new Date(2026,0,12,10,0)` (componentes locales = zona de la
 * máquina). Los minutos esperados (600, 1200, 840, 0, 839), las horas de pared, los booleanos y el
 * copy se escriben A MANO, JAMÁS derivados de `HORARIO` de F-02 ni de un símbolo de producción.
 */

/**
 * @s1 — `estaAbierto` es PURO: sigue el `Date` INYECTADO, no el reloj del sistema. El discriminador
 * es un reloj FALSO puesto a una respuesta OPUESTA (domingo 03:00 = cerrado) frente al argumento
 * (lunes 10:30 = abierto): si la salida siguiera al reloj daría «cerrado» y el test se pondría ROJO.
 * Que dé «abierto» PRUEBA que lee el ARGUMENTO. El determinismo por sí solo NO bastaría (una función
 * que ignora el argumento y lee el reloj también es determinista dentro de una llamada).
 */
describe('@s1 estaAbierto es puro — sigue el Date inyectado, no el reloj del sistema', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('@s1 con el reloj del sistema falseado a un DOMINGO 03:00 (cerrado), estaAbierto(lunes 10:30) sigue el ARGUMENTO → abierto', () => {
    // Reloj del sistema falseado a un DOMINGO a las 03:00 de Madrid (18-ene-2026, CET +1 → 02:00Z):
    // instante en el que el salón está CERRADO.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-18T02:00:00Z'))

    // Argumento DISTINTO e inyectado: un LUNES a las 10:30 de pared en Madrid (invierno CET +1 →
    // 09:30Z), dentro de la franja L-V → abierto.
    const lunesDiezYMedia = new Date('2026-01-12T09:30:00Z')

    // La salida sigue al ARGUMENTO (abierto), NO al reloj del sistema falseado (domingo → cerrado).
    expect(estaAbierto(lunesDiezYMedia)).toBe(true)
  })

  it('@s1 dos llamadas con el MISMO Date devuelven el MISMO booleano (determinista)', () => {
    const lunesDiezYMedia = new Date('2026-01-12T09:30:00Z')

    expect(estaAbierto(lunesDiezYMedia)).toBe(estaAbierto(lunesDiezYMedia))
  })
})

/**
 * @s2 — L-V las franjas son SEMIABIERTAS `[abre, cierra)`: apertura INCLUSIVA (10:00 → 600 dentro),
 * cierre EXCLUSIVO (20:00 → 1200 fuera). Los instantes se anclan a la hora de pared de Madrid como
 * UTC con `Z`; el lunes 12-ene-2026 es INVIERNO (CET +1: 10:00 Madrid = 09:00Z). La fila 09:59 va
 * anclada a INVIERNO (08:59Z) a propósito: además de fijar la apertura, MATA el mutante de offset
 * +2 FIJO (la leería como 10:59 → abierto ≠ cerrado).
 */
describe('@s2 L-V franjas semiabiertas [abre, cierra) — apertura 10:00 inclusiva, cierre 20:00 exclusivo', () => {
  it.each([
    ['09:59', '2026-01-12T08:59:00Z', false],
    ['10:00', '2026-01-12T09:00:00Z', true],
    ['19:59', '2026-01-12T18:59:00Z', true],
    ['20:00', '2026-01-12T19:00:00Z', false],
    ['20:01', '2026-01-12T19:01:00Z', false],
    ['00:00', '2026-01-11T23:00:00Z', false],
  ])('@s2 el lunes a las %s de pared en Madrid → abierto=%s', (_pared, instanteUtc, abierto) => {
    expect(estaAbierto(new Date(instanteUtc))).toBe(abierto)
  })
})

/**
 * @s3 — Sábado (franja corta 10:00–14:00 = `[{600, 840}]`) y Domingo (sin franjas `[]` = cerrado).
 * Instantes UTC fechados EXPLÍCITOS (sábado 17-ene-2026, domingo 18-ene-2026, ambos INVIERNO CET
 * +1), anclados con `Z`. La fila 14:00 fija el cierre EXCLUSIVO del sábado (`minutos < cierra`); las
 * filas de domingo fijan que un día sin franjas está cerrado a cualquier hora.
 */
describe('@s3 Sábado (10:00–14:00) y Domingo (cerrado, lista de franjas vacía)', () => {
  it.each([
    ['Sábado', '13:59', '2026-01-17T12:59:00Z', true],
    ['Sábado', '14:00', '2026-01-17T13:00:00Z', false],
    ['Sábado', '14:30', '2026-01-17T13:30:00Z', false],
    ['Domingo', '10:30', '2026-01-18T09:30:00Z', false],
    ['Domingo', '03:00', '2026-01-18T02:00:00Z', false],
  ])('@s3 el %s a las %s de pared en Madrid → abierto=%s', (_dia, _pared, instanteUtc, abierto) => {
    expect(estaAbierto(new Date(instanteUtc))).toBe(abierto)
  })
})

/**
 * @s4 — DST: instantes a la MISMA hora de pared de Madrid pero en periodos distintos (CET +1 vs
 * CEST +2) dan el MISMO resultado (abierto). Contra un OFFSET FIJO (el mutante que ignora el DST):
 *   · +1 FIJO muere en la fila de VERANO 10:30 (08:30Z se leería como 09:30 Madrid → cerrado).
 *   · +2 FIJO muere en la fila de INVIERNO 19:30 (18:30Z se leería como 20:30 Madrid → cerrado).
 * Solo `Intl`/Europe/Madrid acierta las cuatro. Los instantes se anclan A MANO como UTC con `Z`.
 */
describe('@s4 DST — misma hora de pared en CET y CEST da el mismo resultado (abierto)', () => {
  it.each([
    ['CET invierno 10:30', '2026-01-12T09:30:00Z'],
    ['CEST verano 10:30', '2026-07-13T08:30:00Z'],
    ['CET invierno 19:30', '2026-01-12T18:30:00Z'],
    ['CEST verano 19:30', '2026-07-13T17:30:00Z'],
  ])('@s4 el lunes %s de pared en Madrid está abierto', (_periodo, instanteUtc) => {
    expect(estaAbierto(new Date(instanteUtc))).toBe(true)
  })
})

/**
 * Un horario semanal SINTÉTICO, escrito A MANO (anti-tautología): NO deriva de `HORARIO` de F-02.
 * Solo el lunes abre (10:00–20:00 = `[{600, 1200}]`); el resto cerrado. Es la entrada del motor puro
 * `abiertoEn` para ejercitar la rama de excepciones sin inventar festivos en producción.
 */
const SOLO_LUNES_ABIERTO: HorarioSemanal = {
  Monday: [{ abre: 600, cierra: 1200 }],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: [],
}

/**
 * @s5 — una excepción con franjas VACÍAS en una fecha que sería laborable CIERRA ese día: la
 * excepción MANDA sobre el horario semanal. Un festivo se modela como `{ fecha, franjas: [] }`. El
 * instante (10:30 Madrid) cae de lleno en el mediodía → fecha Madrid y fecha UTC COINCIDEN (el borde
 * a MEDIANOCHE queda FUERA del alcance de F-10, se difiere a F-13).
 */
describe('@s5 una excepción de franjas vacías cierra un lunes laborable — la excepción manda sobre el semanal', () => {
  const lunesDiezYMedia = new Date('2026-01-12T09:30:00Z')

  it('@s5 con la excepción { "2026-01-12", [] } el lunes 10:30 está CERRADO', () => {
    expect(
      abiertoEn(lunesDiezYMedia, SOLO_LUNES_ABIERTO, [{ fecha: '2026-01-12', franjas: [] }]),
    ).toBe(false)
  })

  it('@s5 SIN esa excepción el mismo lunes 10:30 está ABIERTO: el semanal no se modifica, la excepción es un OVERRIDE', () => {
    expect(abiertoEn(lunesDiezYMedia, SOLO_LUNES_ABIERTO, [])).toBe(true)
  })

  it('@s5 la excepción que MANDA es la que CASA POR FECHA, no la primera de la lista: una excepción de OTRA fecha no aplica', () => {
    // Refuerza «si la fecha coincide, mandan» (@s5, conducta ya aprobada) probando su contrapositiva:
    // el emparejamiento es por FECHA, no por POSICIÓN. La PRIMERA excepción es de OTRA fecha (un
    // domingo 18-ene que ABRIRÍA de aplicarse) y la SEGUNDA es la del lunes consultado (franjas
    // vacías → cierra). Manda la SEGUNDA → CERRADO. Un emparejamiento que ignorara la fecha
    // (`find(() => true)`) devolvería la PRIMERA → «abierto», resultado EQUIVOCADO. Fechas y franjas
    // A MANO (anti-tautología).
    expect(
      abiertoEn(lunesDiezYMedia, SOLO_LUNES_ABIERTO, [
        { fecha: '2026-01-18', franjas: [{ abre: 600, cierra: 1200 }] },
        { fecha: '2026-01-12', franjas: [] },
      ]),
    ).toBe(false)
  })
})

/**
 * @s6 — una excepción con franjas PROPIAS en un domingo (normalmente cerrado) ABRE ese día en esa
 * franja. Cierra la rama de excepciones por el lado positivo: la excepción no solo cierra (@s5),
 * también puede ABRIR. Las franjas de la excepción son SEMIABIERTAS `[11:00, 15:00)` (`[{660, 900}]`):
 * 12:00 dentro, 16:00 fuera. Los límites y horas se escriben A MANO; los instantes se anclan a
 * mediodía (fecha Madrid = fecha UTC).
 */
describe('@s6 una excepción de franjas propias abre un domingo normalmente cerrado', () => {
  const excepcionAbreDomingo = [{ fecha: '2026-01-18', franjas: [{ abre: 660, cierra: 900 }] }]

  it('@s6 el domingo 12:00 (dentro de [11:00, 15:00)) está ABIERTO por la excepción', () => {
    expect(
      abiertoEn(new Date('2026-01-18T11:00:00Z'), SOLO_LUNES_ABIERTO, excepcionAbreDomingo),
    ).toBe(true)
  })

  it('@s6 el domingo 16:00 (fuera de [11:00, 15:00)) está CERRADO — cierre exclusivo de la excepción', () => {
    expect(
      abiertoEn(new Date('2026-01-18T15:00:00Z'), SOLO_LUNES_ABIERTO, excepcionAbreDomingo),
    ).toBe(false)
  })
})

/**
 * @s7 — `aMinutos` convierte «HH:MM» a minutos-desde-medianoche (`hora*60 + minuto`). Los esperados
 * (600, 1200, 840, 0, 839) se escriben A MANO. La fila «13:59 → 839» es la que MATA los mutantes de
 * aritmética: con `hora*60 - minuto` daría 721 y con `hora*60` (ignorar el minuto) daría 780; ambos
 * ≠ 839 (las filas con minuto 0 no los distinguen).
 */
describe('@s7 aMinutos convierte "HH:MM" a minutos-desde-medianoche', () => {
  it.each([
    ['10:00', 600],
    ['20:00', 1200],
    ['14:00', 840],
    ['00:00', 0],
    ['13:59', 839],
  ])('@s7 aMinutos("%s") === %i', (hhmm, minutos) => {
    expect(aMinutos(hhmm)).toBe(minutos)
  })
})

/**
 * @s8 — `parsearFranjas` traduce las cadenas de `HORARIO` (F-02) al modelo en minutos. La entrada es
 * el guion «-» del dato de F-02 (el guion largo «–» de la presentación es de `horarioParaUI`, @s11).
 * `'cerrado' → []` es la clave del modelo: la lista vacía ES el «cerrado». Los minutos van A MANO.
 */
describe('@s8 parsearFranjas traduce las cadenas de HORARIO al modelo de franjas en minutos', () => {
  it('@s8 "10:00-20:00" → [{ abre: 600, cierra: 1200 }] (la franja L-V)', () => {
    expect(parsearFranjas('10:00-20:00')).toEqual([{ abre: 600, cierra: 1200 }])
  })

  it('@s8 "10:00-14:00" → [{ abre: 600, cierra: 840 }] (la franja del sábado)', () => {
    expect(parsearFranjas('10:00-14:00')).toEqual([{ abre: 600, cierra: 840 }])
  })

  it('@s8 "cerrado" → [] (lista VACÍA, no un valor «cerrado» guardado)', () => {
    expect(parsearFranjas('cerrado')).toEqual([])
  })
})

/**
 * @s9 — el `HorarioSemanal` derivado de `HORARIO` de F-02 modela los 7 días como listas de franjas.
 * L-V se EXPANDE a los cinco días laborables (misma franja), el sábado es la franja corta y el
 * domingo es `[]` (cerrado, no un string). Las franjas esperadas se escriben A MANO (anti-tautología);
 * que la fuente sea `HORARIO` y no un duplicado lo garantiza la REVISIÓN/puerta (no aseverable por valor).
 */
describe('@s9 el HorarioSemanal derivado de F-02 modela los 7 días como franjas', () => {
  it.each([['Monday'], ['Tuesday'], ['Wednesday'], ['Thursday'], ['Friday']] as const)(
    '@s9 el %s (laborable) tiene la franja [{ abre: 600, cierra: 1200 }] (10:00–20:00)',
    (dia) => {
      expect(HORARIO_SEMANAL[dia]).toEqual([{ abre: 600, cierra: 1200 }])
    },
  )

  it('@s9 el sábado tiene la franja [{ abre: 600, cierra: 840 }] (10:00–14:00)', () => {
    expect(HORARIO_SEMANAL.Saturday).toEqual([{ abre: 600, cierra: 840 }])
  })

  it('@s9 el domingo tiene una lista de franjas VACÍA [] (cerrado)', () => {
    expect(HORARIO_SEMANAL.Sunday).toEqual([])
  })
})

/**
 * @s10 — en la DEMO la lista global de excepciones es VACÍA (D5): estado honesto que no anuncia
 * ningún cierre especial y no inventa festivos. Con esa lista, `estaAbierto` decide ÚNICAMENTE por el
 * horario semanal — un 1 de enero laborable (jueves) daría «abierto» → la publicación queda BLOQUEADA
 * (puerta manual) hasta que el cliente confirme festivos y agosto. Añadir/editar una excepción cambia
 * el comportamiento SIN tocar el copy ni site.ts (acceptance 3).
 */
describe('@s10 la lista de excepciones de producción es VACÍA — estado honesto que bloquea la publicación', () => {
  it('@s10 EXCEPCIONES es exactamente [] (no contiene ningún festivo ni el cierre de agosto inventados)', () => {
    expect(EXCEPCIONES).toEqual([])
    expect(EXCEPCIONES).toHaveLength(0)
  })

  it('@s10 con la lista vacía, un 1 de enero laborable (jueves 10:30) daría «abierto»: decide solo por el semanal', () => {
    // 2026-01-01 es JUEVES (laborable); 10:30 Madrid en invierno CET +1 = 09:30Z.
    expect(estaAbierto(new Date('2026-01-01T09:30:00Z'))).toBe(true)
  })

  it('@s10 añadir una excepción { "2026-01-01", [] } CIERRA ese día: editar la lista cambia el comportamiento', () => {
    expect(
      abiertoEn(new Date('2026-01-01T09:30:00Z'), HORARIO_SEMANAL, [
        { fecha: '2026-01-01', franjas: [] },
      ]),
    ).toBe(false)
  })
})

/**
 * @s11 — `horarioParaUI` proyecta el modelo a EXACTAMENTE 3 filas en castellano. El copy vive en la
 * capa de presentación (mutable, StringLiteral): «Cerrado», los rótulos de día y el separador «–»
 * (guion largo de la presentación, NO el «-» del dato de F-02). La fila «Domingo → Cerrado» es donde
 * muere el mutante de la lista vacía del domingo. Los literales se escriben A MANO.
 */
describe('@s11 horarioParaUI proyecta el modelo a 3 filas en castellano, con el copy en la presentación', () => {
  it('@s11 devuelve exactamente 3 filas, en orden, con la franja y el «Cerrado» del domingo', () => {
    expect(horarioParaUI(HORARIO_SEMANAL)).toEqual([
      { dias: 'Lunes a Viernes', franja: '10:00–20:00' },
      { dias: 'Sábado', franja: '10:00–14:00' },
      { dias: 'Domingo', franja: 'Cerrado' },
    ])
  })
})

/**
 * @s13 — `openingHoursSpecification` devuelve el array schema.org: `dayOfWeek` en la ENUMERACIÓN
 * INGLESA (Monday…Saturday; el copy español vive solo en la UI), L-V AGRUPADO en un array, Sábado
 * solo, Domingo (cerrado) OMITIDO (idiomático: no se representa con opens===closes). Aquí también
 * muere el mutante de la lista vacía del domingo: si dejara de ser `[]`, aparecería un objeto «Sunday».
 * Los nombres ingleses y las horas «10:00»/«20:00»/«14:00» se escriben A MANO.
 */
describe('@s13 openingHoursSpecification devuelve el array schema.org — dayOfWeek inglés, L-V agrupado, domingo omitido', () => {
  it('@s13 el array agrupa L-V y el sábado, con @type OpeningHoursSpecification y opens/closes en HH:MM', () => {
    expect(openingHoursSpecification(HORARIO_SEMANAL)).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '14:00',
      },
    ])
  })

  it('@s13 NO hay ningún objeto para «Sunday»: el domingo (cerrado) se OMITE', () => {
    const spec = openingHoursSpecification(HORARIO_SEMANAL)

    expect(spec.some((objeto) => objeto.dayOfWeek.includes('Sunday'))).toBe(false)
  })

  it('@s13 ningún objeto usa la clave «openingHours» (siempre openingHoursSpecification)', () => {
    for (const objeto of openingHoursSpecification(HORARIO_SEMANAL)) {
      expect(Object.keys(objeto)).not.toContain('openingHours')
    }
  })
})
