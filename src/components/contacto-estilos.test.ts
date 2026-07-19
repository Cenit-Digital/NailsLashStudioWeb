import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * F-12 @s6 — la PROMINENCIA del `tel:` en móvil es CSS: Stryker NO ve SCSS, así que la aseveran ESTOS
 * tests (que LEEN los bytes del `.module.scss`, como `hero-estilos.test.ts` de F-07 y el `scroll-padding`
 * de F-06) + la verificación VISUAL y la puerta humana. Contrato: features/contacto.feature.
 *
 * 🔴 Leer la `@media` PRUEBA que el tratamiento móvil EXISTE, NO que el objetivo sea PROMINENTE (que
 * sea grande y cómodo de pulsar): el byte del SCSS no mide eso. La prominencia real se acredita SOLO
 * con verificación visual + la puerta humana. Y NO se atribuye a WCAG SC 2.5.8 ningún umbral de tamaño
 * de objetivo: la prominencia es CRITERIO DE PROYECTO verificado a ojo, no una puerta normativa.
 */
const RUTA_SCSS = 'src/components/contacto.module.scss'

function scss(): string {
  return readFileSync(RUTA_SCSS, 'utf8')
}

/**
 * El cuerpo (entre llaves) del PRIMER bloque cuyo encabezado casa `encabezado`, contando llaves para
 * respetar el anidamiento (@media). Robusto al reformateo de prettier. null si no hay bloque.
 */
function cuerpoDelBloque(fuente: string, encabezado: RegExp): string | null {
  const cabeza = encabezado.exec(fuente)

  if (cabeza === null) {
    return null
  }

  const apertura = fuente.indexOf('{', cabeza.index)

  if (apertura < 0) {
    return null
  }

  let profundidad = 0

  for (let i = apertura; i < fuente.length; i++) {
    if (fuente[i] === '{') {
      profundidad += 1
    } else if (fuente[i] === '}') {
      profundidad -= 1

      if (profundidad === 0) {
        return fuente.slice(apertura + 1, i)
      }
    }
  }

  return null
}

describe('@s6 la prominencia del tel: en móvil es CSS — una @media leída del SCSS (PROXY de existencia)', () => {
  it('@s6 existe una @media para móvil que da tratamiento a .telefono (el enlace tel:)', () => {
    const media = cuerpoDelBloque(scss(), /@media\s*\([^)]*max-width[^)]*\)\s*\{/)

    expect(media, 'falta la @media móvil que trata el tel:').not.toBeNull()
    expect(media as string).toMatch(/\.telefono\b/)
  })

  it('@s6 el tratamiento móvil NO atribuye a WCAG SC 2.5.8 ningún umbral (prominencia = criterio de proyecto)', () => {
    // Leer la @media es PROXY de EXISTENCIA, NO prueba de prominencia; esta no se cita como puerta WCAG.
    const hoja = scss()

    expect(hoja).not.toMatch(/2\.5\.8/)
    expect(hoja).not.toMatch(/WCAG/i)
  })
})
