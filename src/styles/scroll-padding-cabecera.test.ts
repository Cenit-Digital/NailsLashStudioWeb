import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * F-06 @s11 — CAPA 1 (B-2): el `scroll-padding-top` de la hoja global, RE-MEDIDO sobre la nav
 * definitiva y SUSTITUYENDO el 5rem de F-04.
 *
 * 🔴 `scroll-padding` va en el CONTENEDOR (`html`) y por eso cubre TODA operación de scroll-into-view
 * [V] — ESA es la razón correcta, NO una asimetría de `scroll-margin` frente a `Tab` (FALSA [V]: el
 * scroll al `Tab` es UA-defined). El SCSS NO ES MUTABLE (Stryker no ve CSS): aquí el mutante es
 * HUMANO y la puerta de aprobación es su única defensa; este test es la red.
 *
 * ⚠️ CERO NÚMEROS ATRIBUIDOS A SC 2.4.11 (B-1): el listón AA es «not entirely hidden»
 * (oscurecimiento PARCIAL es CONFORME); «no part hidden» es el 2.4.12 AAA y NO se persigue. Los px
 * de abajo son CRITERIO DE PROYECTO, no WCAG.
 *
 * 🔴 LA ALTURA MÁXIMA, RE-MEDIDA SOBRE LA NAV DEFINITIVA (no copiada del prototipo). El prototipo
 * tomaba hasta 231px porque su nav de 6 enlaces ENVOLVÍA; la cabecera de F-06 NO ENVUELVE (a
 * <=820px hay botón hamburguesa; por encima, solo la marca + 2 enlaces horizontales), así que es UNA
 * SOLA FILA en todo el rango. Su altura máxima, DERIVADA de `cabecera.module.scss`:
 *   padding-block 1rem × 2 (32px)  +  destino táctil del botón min-height 2.75rem (44px)  =  76px.
 * Se escribe A MANO (anti-tautología): NO se importa del SCSS ni de un símbolo de producción.
 */
const RUTA_CASCARA = 'src/styles/_base.scss'
const ALTURA_MAXIMA_CABECERA_MEDIDA_PX = 76
const RAIZ_POR_DEFECTO_PX = 16

function cascara(): string {
  return readFileSync(RUTA_CASCARA, 'utf8')
}

/** `scroll-padding-top: 6rem;` → 96 (px, con la raíz por defecto). null si la declaración no existe. */
function scrollPaddingTopEnPx(scss: string): number | null {
  const declaracion = /scroll-padding-top\s*:\s*([\d.]+)\s*(rem|px)\s*;/.exec(scss)

  if (declaracion === null) {
    return null
  }

  const cantidad = Number(declaracion[1])

  return declaracion[2] === 'rem' ? cantidad * RAIZ_POR_DEFECTO_PX : cantidad
}

describe('@s11 el scroll-padding-top re-medido sustituye el 5rem de F-04', () => {
  it('@s11 existe una declaración scroll-padding-top en el contenedor de scroll (html)', () => {
    const bloqueHtml = /html\s*\{([^}]*)\}/.exec(cascara())?.[1] ?? ''

    expect(bloqueHtml).toMatch(/scroll-padding-top\s*:/)
  })

  it('@s11 su valor resuelto a px es >= la altura máxima medida de la cabecera', () => {
    const valor = scrollPaddingTopEnPx(cascara())

    expect(valor).not.toBeNull()
    expect(valor).toBeGreaterThanOrEqual(ALTURA_MAXIMA_CABECERA_MEDIDA_PX)
  })

  it('@s11 NO es el 5rem heredado de F-04: F-06 lo RE-MIDE y lo sustituye con margen', () => {
    // La re-medición (76px) confirmaría que 5rem=80px «basta», pero F-06 pone un suelo con MARGEN y
    // deja explícito que ya NO es el número no verificado de la cáscara.
    expect(cascara()).not.toMatch(/scroll-padding-top\s*:\s*5rem\s*;/)
  })
})
