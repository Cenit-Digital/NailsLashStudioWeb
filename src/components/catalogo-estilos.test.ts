import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * F-27 `catalogo_fotos` @s20-@s21 — lo VISUAL del hueco de foto es SCSS y Stryker NO ve SCSS. Estos
 * tests LEEN los BYTES de `catalogo.module.scss` (patrón `equipo-estilos.test.ts`) y extraen el cuerpo
 * de cada bloque contando llaves. Las regex toleran espacios alrededor de «:», «,» y «/». Nunca
 * `toHaveClass`, nunca jsdom para estilos. Contrato: features/catalogo_fotos.feature.
 */
const RUTA_SCSS = 'src/components/catalogo.module.scss'

function scss(): string {
  return readFileSync(RUTA_SCSS, 'utf8')
}

/** Cuerpo (entre llaves) del PRIMER bloque cuyo encabezado casa, contando llaves (robusto al anidamiento). */
function cuerpoDelBloque(fuente: string, encabezado: RegExp): string | null {
  const cabeza = encabezado.exec(fuente)

  if (cabeza === null) {
    return null
  }

  const apertura = fuente.indexOf('{', cabeza.index)
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

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * La declaración como regex: propiedad completa (no la cola de otra, p. ej. `max-width`), espacios
 * libres alrededor de «:», «,» y «/», y terminada en «;».
 */
function patronDeDeclaracion(declaracion: string): RegExp {
  const cuerpo = escaparRegex(declaracion)
    .replace(/\s*:\s*/, '\\s*:\\s*')
    .replace(/\s*,\s*/g, '\\s*,\\s*')
    .replace(/\s*\/\s*/g, '\\s*\\/\\s*')
    .replace(/ +/g, '\\s+')

  return new RegExp(`(?:^|[\\s;{])${cuerpo}\\s*;`)
}

describe('@s20 el bloque .foto declara lo que hace que la foto cubra el hueco 4:5', () => {
  const DECLARACIONES = [
    'display: block',
    'width: 100%',
    'height: auto',
    'aspect-ratio: 4 / 5',
    'object-fit: cover',
    'border-radius: 22px',
    'border: 1px solid var(--line)',
    'background: linear-gradient(160deg, var(--accent-soft), var(--surface2))',
  ]

  for (const declaracion of DECLARACIONES) {
    it(`@s20 el cuerpo de .foto declara "${declaracion}"`, () => {
      const foto = cuerpoDelBloque(scss(), /\.foto\s*\{/)

      expect(foto, 'falta el bloque .foto').not.toBeNull()
      expect(foto as string).toMatch(patronDeDeclaracion(declaracion))
    })
  }
})

describe('@s21 el bloque .foto ya no fuerza un alto mínimo ni mueve el encuadre, y la rejilla de F-08 sigue intacta', () => {
  function cuerpoDeFoto(): string {
    const foto = cuerpoDelBloque(scss(), /\.foto\s*\{/)

    expect(foto, 'falta el bloque .foto').not.toBeNull()

    return foto as string
  }

  it('@s21 la hoja contiene EXACTAMENTE un bloque .foto', () => {
    // Cualquier regla cuyo selector nombre `.foto` (sola, anidada o en una lista) cuenta como bloque.
    expect(scss().match(/\.foto\b[^{};]*\{/g) ?? []).toHaveLength(1)
  })

  it('@s21 .foto NO contiene "min-height" ni "max-height", y su única declaración de alto es "height: auto"', () => {
    const foto = cuerpoDeFoto()
    const altos = foto.match(/(?:^|[\s;{])height\s*:[^;]*;/g) ?? []

    expect(foto).not.toContain('min-height')
    expect(foto).not.toContain('max-height')
    expect(altos).toHaveLength(1)
    expect(altos[0]).toMatch(patronDeDeclaracion('height: auto'))
  })

  it('@s21 .foto NO contiene "object-position" (encuadre centrado por defecto)', () => {
    const foto = cuerpoDeFoto()

    // Ancla positiva: es el bloque del hueco (lleva su object-fit).
    expect(foto).toContain('object-fit')
    expect(foto).not.toContain('object-position')
  })

  it('@s21 .foto NO contiene "transition" ni "animation": nada se mueve', () => {
    const foto = cuerpoDeFoto()

    expect(foto).toContain('object-fit')
    expect(foto).not.toContain('transition')
    expect(foto).not.toContain('animation')
  })

  it('@s21 .rejilla sigue declarando "grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr))"', () => {
    const rejilla = cuerpoDelBloque(scss(), /\.rejilla\s*\{/)

    expect(rejilla, 'falta el bloque .rejilla').not.toBeNull()
    expect(rejilla as string).toMatch(
      patronDeDeclaracion('grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr))'),
    )
  })
})
