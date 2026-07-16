import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * F-04 @s11 — la cáscara GLOBAL: `:focus-visible` y `scroll-padding-top`.
 *
 * SEPARACIÓN DE EJES, Y AQUÍ ES DONDE MÁS SE HA PAGADO:
 * `SC 2.4.7` (AA) exige foco VISIBLE. `G165` (foco por defecto) y `C45` (`:focus-visible`) son
 * AMBAS TÉCNICAS SUFICIENTES. TIENE CERO REQUISITO DE CONTRASTE O GROSOR [V]: el 3:1 / 2px es
 * `SC 2.4.13`, Y ES AAA. → ESTE TEST NO ASEVERA NINGÚN UMBRAL, Y NO PODRÍA HACERLO SIN MENTIR.
 * PROHIBIDO ATRIBUIR CUALQUIER UMBRAL A 2.4.7. Es la TRAMPA GEMELA del 1.4.11 de F-03.
 *
 * 🔁 REPARTO CON F-06 (A-18, cerrada por el lead 2026-07-16), escrito aquí para que no se caiga
 * por la grieta entre las dos features:
 *     F-04 PONE el `scroll-padding-top` (es cáscara global, y este test lo fija).
 *     F-06 VIGILA QUE FUNCIONE (que el foco no quede oculto tras la cabecera sticky).
 * `SC 2.4.11 Focus Not Obscured` (AA, NUEVO en WCAG 2.2) ES DE F-06, NO DE F-04: F-04 no puede
 * testear que la cabecera no tape el foco cuando LA CABECERA LA MONTA F-06. `scroll-padding-top`
 * es la técnica C43, suficiente para 2.4.11, cuyo Understanding nombra LITERALMENTE los sticky
 * headers [V]. EL VALOR DEPENDE DE LA ALTURA DE LA CABECERA, QUE ES DE F-06 → aquí se fija que
 * la declaración EXISTE y es > 0, NUNCA un número: fijarlo hoy sería INVENTARLO.
 *
 * EL SCSS NO ES MUTABLE (Stryker no ve CSS/SCSS y `src/styles/` no está en `mutate`), igual que
 * en F-03: aquí el mutante es HUMANO y la puerta de aprobación es su única defensa.
 */
// La ruta va escrita A MANO, no importada del código que vigila (anti-tautología, F-03 @s11).
const RUTA_DE_LA_CASCARA = 'src/styles/_base.scss'

function scssDeLaCascara(): string {
  return readFileSync(RUTA_DE_LA_CASCARA, 'utf8')
}

/** `scroll-padding-top: 5rem;` → 5. Devuelve null si la declaración no existe. */
function valorDeScrollPaddingTop(scss: string): number | null {
  const declaracion = /scroll-padding-top\s*:\s*([\d.]+)\s*[a-z%]*\s*;/.exec(scss)

  return declaracion === null ? null : Number(declaracion[1])
}

/** El bloque de la regla `:focus-visible`, sin el selector. Null si la regla no existe. */
function reglaDeFocusVisible(scss: string): string | null {
  const regla = /:focus-visible\s*\{([^}]*)\}/.exec(scss)

  return regla === null ? null : regla[1]
}

describe('la cáscara global (@s11)', () => {
  it('@s11 existe una regla ":focus-visible" en la hoja global', () => {
    expect(reglaDeFocusVisible(scssDeLaCascara())).not.toBeNull()
  })

  it('@s11 la regla ":focus-visible" declara un indicador de foco VISIBLE, no lo apaga', () => {
    const regla = reglaDeFocusVisible(scssDeLaCascara()) ?? ''

    // Declara un outline...
    expect(regla).toMatch(/outline\s*:/)
    // ...y NO es `outline: none` ni `outline: 0`, que es justo lo que apaga el foco y el
    // fallo real que `C45` existe para evitar.
    expect(regla).not.toMatch(/outline\s*:\s*(none|0)\s*;/)
  })

  it('@s11 existe una declaración "scroll-padding-top" con un valor mayor que 0', () => {
    const valor = valorDeScrollPaddingTop(scssDeLaCascara())

    expect(valor).not.toBeNull()
    expect(valor).toBeGreaterThan(0)
  })

  it('@s11 la hoja global de la cáscara está enganchada al punto de entrada de los estilos', () => {
    // Sin esto, `_base.scss` podría cumplir todo lo anterior y NO LLEGAR AL SITIO: los tests
    // verdes sobre un fichero que nadie importa son el verde por vacuidad de esta feature.
    expect(readFileSync('src/styles/main.scss', 'utf8')).toMatch(/@use\s+'base'/)
  })
})
