import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * feature `equipo_reservas` — lo VISUAL de la sección es CSS, y Stryker NO ve SCSS. Estos tests LEEN
 * los BYTES del `.module.scss` (patrón `contacto-estilos.test.ts`) y los anclan contra los valores
 * literales de `progress/spec_visual_equipo.md`. La corrección AA de la spec es dura: texto pequeño y
 * rellenos en `--accent-dark` (nunca `--accent`, 4,05:1), bordes de controles en `--border-interactive`
 * (nunca `--line`, decorativo). Se asevera por BYTES, JAMÁS con `toHaveClass` (css:false en vitest).
 */
const RUTA_SCSS = 'src/components/equipo.module.scss'

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

describe('equipo-estilos — el hueco de foto mantiene el aspect-ratio 4/3 del diseño con fondo de token', () => {
  it('el bloque .foto declara "aspect-ratio: 4 / 3" y su fondo es var(--accent-soft)', () => {
    const foto = cuerpoDelBloque(scss(), /\.foto\s*\{/)

    expect(foto, 'falta el bloque .foto').not.toBeNull()
    expect(foto as string).toMatch(/aspect-ratio:\s*4\s*\/\s*3/)
    expect(foto as string).toMatch(/background:\s*var\(--accent-soft\)/)
  })
})

describe('equipo-estilos — el monograma (D8): Gilda Display en --accent-dark, sobre el --accent-soft ya existente', () => {
  it('el bloque .monograma usa la familia Gilda Display y el color var(--accent-dark)', () => {
    const monograma = cuerpoDelBloque(scss(), /\.monograma\s*\{/)

    expect(monograma, 'falta el bloque .monograma').not.toBeNull()
    expect(monograma as string).toMatch(/font-family:\s*'Gilda Display',\s*serif/)
    expect(monograma as string).toMatch(/color:\s*var\(--accent-dark\)/)
  })
})

describe('equipo-estilos — corrección AA: los rellenos/texto pequeños van a --accent-dark, nunca --accent', () => {
  it('ningún "background:" ni "color:" usa var(--accent) a pelo (solo cabe dentro del color-mix de la sombra)', () => {
    // aviso 1 de la spec: --accent bajo texto blanco o como texto pequeño falla AA. Solo sobrevive en el
    // color-mix del box-shadow (que este regex, anclado a background:/color:, no toca).
    expect(scss()).not.toMatch(/(?:background|color):\s*var\(--accent\)\s*[;}]/)
  })

  it('el relleno del día activo es var(--accent-dark)', () => {
    // El bloque STANDALONE `.diaActivo` (no el encabezado agrupado `.dia, .diaActivo`) arranca con el relleno.
    expect(scss()).toMatch(/\.diaActivo\s*\{\s*background:\s*var\(--accent-dark\)/)
  })

  it('el relleno de la hora ELEGIDA (derivado de aria-pressed, no de una clase) es var(--accent-dark)', () => {
    // El estado activo de la franja NO vive en un `className` condicional (inmatable con css:false):
    // se colorea desde `&[aria-pressed='true']`, la misma fuente que el árbol de accesibilidad.
    expect(scss()).toMatch(/&\[aria-pressed='true'\]\s*\{\s*background:\s*var\(--accent-dark\)/)
  })

  it('el color del chip de especialidad es var(--accent-dark) sobre var(--accent-soft)', () => {
    const chip = cuerpoDelBloque(scss(), /\.chipEspecialidad\s*\{/)

    expect(chip as string).toMatch(/color:\s*var\(--accent-dark\)/)
    expect(chip as string).toMatch(/background:\s*var\(--accent-soft\)/)
  })

  it('el botón de reservar habilitado se rellena con var(--accent-dark), no --accent', () => {
    const reservar = cuerpoDelBloque(scss(), /\.reservar\s*\{/)

    expect(reservar as string).toMatch(/background:\s*var\(--accent-dark\)/)
  })
})

describe('equipo-estilos — los bordes de controles usan --border-interactive (3:1), no --line (decorativo)', () => {
  it('el borde del botón de día usa var(--border-interactive)', () => {
    const dia = cuerpoDelBloque(scss(), /\.dia,\s*\n?\s*\.diaActivo\s*\{/)

    expect(dia as string).toMatch(/border:\s*1px solid var\(--border-interactive\)/)
  })

  it('el borde de la opción de hora usa var(--border-interactive)', () => {
    const hora = cuerpoDelBloque(scss(), /\.horaOpcion\s*\{/)

    expect(hora as string).toMatch(/border:\s*1px solid var\(--border-interactive\)/)
  })

  it('el borde de las flechas de reseña usa var(--border-interactive)', () => {
    const flecha = cuerpoDelBloque(scss(), /\.flecha\s*\{/)

    expect(flecha as string).toMatch(/border:\s*1px solid var\(--border-interactive\)/)
  })
})

describe('equipo-estilos — las estrellas usan --accent-2 (F-03 las oscurece respecto al prototipo)', () => {
  it('el bloque .estrellas colorea con var(--accent-2)', () => {
    const estrellas = cuerpoDelBloque(scss(), /\.estrellas\s*\{/)

    expect(estrellas as string).toMatch(/color:\s*var\(--accent-2\)/)
  })
})
