import { describe, expect, it } from 'vitest'

import { NOMBRE } from './site'
import { partirNombre } from './partir-nombre'

/**
 * F-07 — la ÚNICA lógica mutable de la feature (@s15): partir NOMBRE en marca + tipo por
 * `lastIndexOf(' ')` con guarda `corte < 0`. Contrato: features/hero_marca.feature.
 *
 * ANTI-TAUTOLOGÍA (regla dura): NOMBRE (site.ts:13) se importa SOLO como ENTRADA (fuente única
 * F-02, legítima). Los ESPERADOS de cada partición («Nails Lash» / «Studio», etc.) se escriben
 * A MANO, JAMÁS derivados de NOMBRE ni comparados contra un símbolo de producción.
 */
describe('@s12 la marca y el tipo se derivan de NOMBRE por lastIndexOf(" ") — la última palabra es el tipo', () => {
  it('@s12 el dato REAL "Nails Lash Studio" (dos espacios) parte por el ÚLTIMO → marca «Nails Lash», tipo «Studio»', () => {
    // NOMBRE es la entrada; el esperado va escrito A MANO.
    expect(NOMBRE).toBe('Nails Lash Studio')

    const { marca, tipo } = partirNombre(NOMBRE)

    expect(marca).toBe('Nails Lash')
    expect(tipo).toBe('Studio')
  })

  it('@s12 «Uno Dos Tres» (varias palabras) → la última al tipo, el resto a la marca: marca «Uno Dos», tipo «Tres»', () => {
    // Esta fila DISTINGUE lastIndexOf de indexOf (con indexOf la marca saldría «Uno» y el tipo
    // «Dos Tres») y slice(corte+1) de slice(corte).
    const { marca, tipo } = partirNombre('Uno Dos Tres')

    expect(marca).toBe('Uno Dos')
    expect(tipo).toBe('Tres')
  })
})

/**
 * @s13 — CASO LÍMITE 4: un NOMBRE de UNA sola palabra. `lastIndexOf(' ')` → -1; sin la guarda,
 * `slice(0,-1)` recorta el último carácter («Estudi») y `slice(-1+1)=slice(0)` duplica el nombre.
 * La guarda `corte < 0` degrada a un solo trozo (sufijo vacío), FALLA CERRADA. Input SINTÉTICO.
 */
describe('@s13 un NOMBRE sin espacio NO compone «Nails LashStudio» ni indexa con -1 — la guarda corte < 0', () => {
  it('@s13 «Estudio» (sin ningún espacio): marca es el nombre completo «Estudio», tipo es la cadena vacía ""', () => {
    const { marca, tipo } = partirNombre('Estudio')

    expect(marca).toBe('Estudio')
    expect(tipo).toBe('')
  })

  it('@s13 la derivación NO indexa con -1 (no produce «Estudi» con slice(0,-1)) ni un nombre pegado', () => {
    const { marca, tipo } = partirNombre('Estudio')

    // Sin la guarda, marca sería «Estudi» (slice(0,-1)) y tipo «Estudio» (slice(0)) → «Estudi»+«Estudio».
    expect(marca).not.toBe('Estudi')
    expect(`${marca}${tipo}`).not.toBe('EstudiEstudio')
    // NUNCA compone un nombre pegado tipo «Nails LashStudio».
    expect(`${marca}${tipo}`).toBe('Estudio')
  })
})

/**
 * @s16 — LA PARTICIÓN corte===0, MEDIDA [V, node]: con las entradas de @s12/@s13 (corte 10, 7 y
 * -1) el mutante `corte < 0 → corte <= 0` SOBREVIVE (idéntica salida en las tres). SOLO corte===0
 * lo distingue: con la guarda real `< 0` (0<0 FALSE) NO degrada → marca «», tipo «Studio»; con el
 * mutante `<= 0` (0<=0 TRUE) degradaría → marca « Studio», tipo «» (DISTINTO). Input SINTÉTICO (el
 * dato real NUNCA empieza por espacio). Los esperados van A MANO. Su bite se comprueba por SABOTAJE
 * (progress/tdd_hero_marca.md): mutar la guarda a `<= 0` pone ESTE escenario ROJO, y @s13 NO.
 */
describe('@s16 un NOMBRE que EMPIEZA por espacio (corte===0) distingue la guarda «corte < 0» de «corte <= 0»', () => {
  // La cadena de SIETE caracteres: un espacio inicial seguido de «Studio». Escrita a mano.
  const ESPACIO_MAS_STUDIO = ' Studio'

  it('@s16 « Studio» (un único espacio, inicial): la guarda real «corte < 0» es FALSE → marca «», tipo «Studio»', () => {
    expect(ESPACIO_MAS_STUDIO).toHaveLength(7)
    expect(ESPACIO_MAS_STUDIO.lastIndexOf(' ')).toBe(0)

    const { marca, tipo } = partirNombre(ESPACIO_MAS_STUDIO)

    // Con «corte < 0» (0<0 FALSE): NO degrada por la guarda.
    expect(marca).toBe('')
    expect(tipo).toBe('Studio')
    // Con el mutante «corte <= 0» (0<=0 TRUE) daría marca « Studio», tipo «» → resultado DISTINTO.
    expect(marca).not.toBe(' Studio')
    // Y NO compone un nombre pegado corrupto: «»+«Studio» = «Studio», no «Nails LashStudio».
    expect(`${marca}${tipo}`).toBe('Studio')
  })
})
