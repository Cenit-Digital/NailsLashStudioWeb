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

/**
 * REGRESIÓN — el `.datos a` genérico NO debe teñir los BOTONES. El CTA de WhatsApp (`.demo-btn--wa`,
 * utilidad global de `_demo.scss`) trae su propio color negro-verdoso; sin excluirlo, `.datos a`
 * (especificidad 0,1,1) pisaba a `.demo-btn--wa` (0,1,0) y el texto salía en --accent-dark (rosa)
 * sobre el verde. Igual que @s6, LEER el SCSS es un PROXY de que el selector encierra la exclusión
 * (la resolución real de especificidad en el navegador se acredita a ojo): el byte no la ejecuta.
 * Stryker no ve SCSS, así que esta guarda es la red que impide que un refactor reintroduzca el clobber.
 */
describe('regresión: .datos a NO captura botones (.demo-btn), para no pisar su color', () => {
  it('el bloque .datos excluye .demo-btn de la regla de color de sus enlaces', () => {
    const datos = cuerpoDelBloque(scss(), /\.datos\s*\{/)

    expect(datos, 'no se encontró el bloque .datos en el SCSS').not.toBeNull()
    // ANCLA POSITIVA (anti-vacuidad): el bloque SÍ colorea los enlaces informativos con --accent-dark.
    expect(datos as string).toMatch(/color:\s*var\(--accent-dark\)/)
    // La exclusión: la regla de enlaces se acota con :not(:global(.demo-btn)), así el botón no se tiñe.
    expect(datos as string).toMatch(/a:not\(\s*:global\(\.demo-btn\)\s*\)/)
  })
})
