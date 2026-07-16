import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { detectarPlaceholders, type RegistroDatos } from './placeholders.ts'
import { registrosSeo } from './seo.ts'
import { registros } from './site.ts'

/**
 * 🔴 EL ANCLA DE LO DIFERIDO (A-11 + A-21, decisión humana del 2026-07-17).
 *
 * EL PROBLEMA QUE RESUELVE. La decisión 9 del proyecto dice que el contenido no verificado vive
 * en una capa explícita y es ESTRUCTURALMENTE IMPOSIBLE publicarlo por accidente. Hoy hay DOS
 * datos que esa capa **aún no vigila en el build**, y los dos por decisión humana consciente:
 *   - `site.email`         → A-11: el cliente no lo ha confirmado (F-02 lo dejó fuera de
 *                            `registros` para no romper el build).
 *   - `seo.origenCanonica` → A-21: el dominio final NO está decidido [NV] (F-04 lo declara como
 *                            placeholder en `registrosSeo`, pero el humilde NO lo cablea).
 *
 * DIFERIR ES LEGÍTIMO. LO QUE NO ES LEGÍTIMO ES QUE «DIFERIDO» SEA UN CAJÓN DONDE CABE TODO.
 * Sin este test, el patrón «lo dejo fuera del humilde y ya» se puede repetir con el TERCER dato,
 * y con el cuarto, y nadie se entera: la puerta de placeholders seguiría verde vigilando cada vez
 * menos. **Es exactamente la deuda que el judge encontró en F-03 con `MINIMO_DE_PARES`**: una
 * constante que decide una guarda y que ningún test fija se puede desactivar en silencio.
 * *Una auditoría sin puerta no existe.*
 *
 * ANTI-TAUTOLOGÍA: el conjunto esperado va **ESCRITO A MANO**, NUNCA derivado de `registrosSeo`
 * ni de `registros`. Si el test importara lo que debe vigilar, no vigilaría nada: añadir un
 * diferido cambiaría a la vez el dato y el esperado, y pasaría en verde.
 */
const DIFERIDOS_APROBADOS = ['seo.origenCanonica', 'site.email']

/** Los registros que el humilde de F-01 pasa HOY a la puerta, y solo esos. */
function registrosCableadosEnElBuild(): readonly RegistroDatos[] {
  return registros
}

describe('el ancla de lo diferido (A-11, A-21)', () => {
  /**
   * LA GUARDA. Si alguien difiere un TERCER dato —lo declara placeholder y no lo cablea— este
   * test se pone ROJO y hay que venir aquí a justificarlo A MANO, dejando rastro en el diff.
   */
  it('el conjunto de datos DIFERIDOS es exactamente el aprobado por el humano', () => {
    const declaradosComoPlaceholder = registrosSeo
      .filter((registro) => registro.esPlaceholder)
      .map((registro) => registro.ubicacion)

    // `site.email` no figura en NINGÚN registro (A-11: F-02 lo dejó fuera del todo), así que se
    // asevera por su lado, abajo. Aquí van los que SÍ están declarados y NO se cablean.
    expect(declaradosComoPlaceholder.sort()).toEqual(['seo.origenCanonica'])
    expect(DIFERIDOS_APROBADOS).toContain('seo.origenCanonica')
  })

  /**
   * A-21: el origen está DECLARADO como placeholder pero NO CABLEADO al build. Las dos mitades
   * son el acuerdo: declarado (el mecanismo existe y @s34 lo prueba) + no cableado (el build
   * sigue verde). Si alguien cablea `registrosSeo` en el humilde, el build se pone rojo y hay
   * que volver a la puerta humana — este test explica por qué.
   */
  it('A-21: el origen de la canónica está DECLARADO placeholder pero NO cableado al build', () => {
    expect(registrosSeo.some((registro) => registro.ubicacion === 'seo.origenCanonica')).toBe(true)
    expect(
      registrosCableadosEnElBuild().some((registro) => registro.ubicacion === 'seo.origenCanonica'),
    ).toBe(false)
  })

  /** A-11: el email sigue sin confirmar y NO figura en ningún registro (F-02, @s10). */
  it('A-11: el email no figura entre los registros cableados', () => {
    expect(registrosCableadosEnElBuild().map((registro) => registro.ubicacion)).not.toContain(
      'site.email',
    )
    expect(DIFERIDOS_APROBADOS).toContain('site.email')
  })

  /**
   * LA CONSECUENCIA que hace verde el build, aseverada: lo que el humilde SÍ pasa no produce
   * NINGUNA violación. Es el `@s10` de F-02 visto desde F-04, y lo que garantiza que descablear
   * `registrosSeo` devuelve el build a verde de verdad, no de palabra.
   */
  it('los registros cableados no producen ninguna violación: el build de producción sale VERDE', () => {
    expect(detectarPlaceholders({ registros: registrosCableadosEnElBuild() })).toEqual([])
  })

  /**
   * 🔴 EL ANCLA DEL ANCLA. Lo anterior mira los SÍMBOLOS; esto mira EL FICHERO REAL que corre en
   * el build. Sin esto, alguien cablea `registrosSeo` en el humilde y los tests de arriba siguen
   * verdes (aseveran `registros`, no lo que el humilde hace con ellos).
   */
  it('el humilde de F-01 NO cablea registrosSeo, y lo declara por escrito', () => {
    const humilde = readFileSync('tools/puerta-placeholders.ts', 'utf8')

    expect(humilde).toContain('registros, ficheros: sistemaDeFicherosReal')
    expect(humilde).not.toMatch(/^import .*registrosSeo/m)
    // La decisión va ESCRITA donde se toma: quien la revierta tiene que leer por qué.
    expect(humilde).toContain('A-21')
  })
})
