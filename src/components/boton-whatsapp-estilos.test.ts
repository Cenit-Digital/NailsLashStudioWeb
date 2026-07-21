import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { MINIMO_DE_PARES } from '../lib/puerta-contraste'

/**
 * Botón flotante de WhatsApp — lo que es PURO CSS (fijado, offsets, tamaño, no tapar el foco,
 * reduced-motion, focus-visible). Stryker NO ve SCSS: lo aseveran ESTOS tests (que LEEN los bytes
 * del `.module.scss`, patrón `contacto-estilos.test.ts`/`hero-estilos.test.ts`) + la puerta humana.
 * Contrato: features/boton_whatsapp_flotante.feature (@s5..@s10). NO-MUTABLE por declaración.
 *
 * 🔴 Leer los bytes prueba que la REGLA EXISTE; que se vea/comporte bien es verificación VISUAL +
 * puerta humana (@s8/@s9 lo declaran). Los esperados van ESCRITOS A MANO, jamás importados.
 */
const RUTA_SCSS = 'src/components/boton-whatsapp.module.scss'
const RUTA_TSX = 'src/components/BotonWhatsApp.tsx'

// SUPUESTO DECLARADO (@s9): la equivalencia rem→px asume la raíz por defecto de 16px. No es una
// medición, es un supuesto: 3.5rem = 56px ≥ 44px. WCAG 2.2 SC 2.5.8 exige 24×24 (mínimo NORMATIVO);
// 44×44 es una DECISIÓN DE PROYECTO más exigente, NO una exigencia de la norma (44×44 es SC 2.5.5, AAA).
const PX_POR_REM = 16
const OBJETIVO_MINIMO_PROYECTO_PX = 44
const MAXIMO_ACOTADO_REM = 5

function scss(): string {
  return readFileSync(RUTA_SCSS, 'utf8')
}

/** Quita los comentarios de línea `//…` para asertar sobre el CÓDIGO, no sobre la prosa. */
function codigoScss(): string {
  return scss()
    .split('\n')
    .map((linea) => {
      const inicio = linea.indexOf('//')
      return inicio === -1 ? linea : linea.slice(0, inicio)
    })
    .join('\n')
}

/**
 * El cuerpo (entre llaves) del PRIMER bloque cuyo encabezado casa `encabezado`, contando llaves para
 * respetar el anidamiento (@media, &:hover, &:focus-visible). Robusto al reformateo de prettier.
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

function cuerpoFlotante(): string {
  const cuerpo = cuerpoDelBloque(codigoScss(), /\.flotante\s*\{/)
  expect(cuerpo, 'falta el bloque .flotante').not.toBeNull()
  return cuerpo as string
}

describe('@s5 la hoja del botón NO estrena colores — el color lo pone una utilidad global (puerta 3)', () => {
  it('@s5 el .module.scss NO declara ningún "color" ni ningún "background" propios', () => {
    const codigo = codigoScss()

    expect(codigo).not.toMatch(/\bcolor\s*:/)
    expect(codigo).not.toMatch(/\bbackground\b/)
  })

  it('@s5 MINIMO_DE_PARES sigue valiendo EXACTAMENTE 18 (la puerta 3 no gana ninguna fila)', () => {
    // El 18 va ESCRITO A MANO (anti-tautología): este botón no añade pares a la matriz.
    expect(MINIMO_DE_PARES).toBe(18)
  })
})

describe('@s6 la hoja del botón NO carga subrecursos — sin url() ni @font-face (puerta 4)', () => {
  it('@s6 el .module.scss NO contiene "url(" ni "@font-face"', () => {
    const hoja = scss()

    expect(hoja).not.toContain('url(')
    expect(hoja).not.toContain('@font-face')
  })

  it('@s6 el .module.scss SÍ contiene el selector ".flotante" (ANCLA POSITIVA, no verde por vacuidad)', () => {
    expect(scss()).toContain('.flotante')
  })
})

describe('@s7 el botón está FIJADO a la esquina inferior derecha del viewport', () => {
  it('@s7 el cuerpo de .flotante declara position: fixed', () => {
    expect(cuerpoFlotante()).toMatch(/position\s*:\s*fixed/)
  })

  it('@s7 declara bottom y right con valor > 0 (no queda pegado al borde)', () => {
    const cuerpo = cuerpoFlotante()

    const bottom = /bottom\s*:\s*([\d.]+)rem/.exec(cuerpo)
    const right = /right\s*:\s*([\d.]+)rem/.exec(cuerpo)

    expect(bottom, 'falta bottom').not.toBeNull()
    expect(right, 'falta right').not.toBeNull()
    expect(Number((bottom as RegExpExecArray)[1])).toBeGreaterThan(0)
    expect(Number((right as RegExpExecArray)[1])).toBeGreaterThan(0)
  })

  it('@s7 NO declara left, ni top, ni inset: 0 (se ancla a UNA esquina)', () => {
    const cuerpo = cuerpoFlotante()

    expect(cuerpo).not.toMatch(/(?<![\w-])left\s*:/)
    expect(cuerpo).not.toMatch(/(?<![\w-])top\s*:/)
    expect(cuerpo).not.toMatch(/inset\s*:\s*0/)
  })

  it('@s7 declara z-index con valor numérico explícito (queda por encima del contenido)', () => {
    expect(cuerpoFlotante()).toMatch(/z-index\s*:\s*\d+/)
  })
})

describe('@s8 el botón NUNCA ocupa el viewport completo — WCAG 2.2 SC 2.4.11, fallo F110', () => {
  it('@s8 NO declara width: 100%, ni width: 100vw, ni inset: 0', () => {
    const cuerpo = cuerpoFlotante()

    expect(cuerpo).not.toMatch(/width\s*:\s*100%/)
    expect(cuerpo).not.toMatch(/width\s*:\s*100vw/)
    expect(cuerpo).not.toMatch(/inset\s*:\s*0/)
  })

  it('@s8 su width y su height son valores ACOTADOS que no superan 5rem cada uno', () => {
    const cuerpo = cuerpoFlotante()

    const width = /(?<![\w-])width\s*:\s*([\d.]+)rem/.exec(cuerpo)
    const height = /(?<![\w-])height\s*:\s*([\d.]+)rem/.exec(cuerpo)

    expect(width, 'falta width').not.toBeNull()
    expect(height, 'falta height').not.toBeNull()
    expect(Number((width as RegExpExecArray)[1])).toBeLessThanOrEqual(MAXIMO_ACOTADO_REM)
    expect(Number((height as RegExpExecArray)[1])).toBeLessThanOrEqual(MAXIMO_ACOTADO_REM)
    // PROXY DECLARADO: estos bytes prueban que el botón es un objeto PEQUEÑO de esquina, NO que
    // ningún elemento enfocable quede oculto. La conformidad real con SC 2.4.11 se acredita
    // RECORRIENDO LA HOME CON EL TABULADOR (verificación MANUAL declarada en progress/, no test verde).
  })
})

describe('@s9 el área táctil del botón es de al menos 44×44 px CSS (decisión de proyecto sobre SC 2.5.8)', () => {
  it('@s9 el ancho declarado equivale a 44px CSS o más (raíz 16px asumida)', () => {
    const width = /(?<![\w-])width\s*:\s*([\d.]+)rem/.exec(cuerpoFlotante())

    expect(width, 'falta width').not.toBeNull()
    expect(Number((width as RegExpExecArray)[1]) * PX_POR_REM).toBeGreaterThanOrEqual(
      OBJETIVO_MINIMO_PROYECTO_PX,
    )
  })

  it('@s9 el alto y el min-height declarados equivalen a 44px CSS o más', () => {
    const cuerpo = cuerpoFlotante()

    const height = /(?<![\w-])height\s*:\s*([\d.]+)rem/.exec(cuerpo)
    const minHeight = /min-height\s*:\s*([\d.]+)rem/.exec(cuerpo)

    expect(height, 'falta height').not.toBeNull()
    expect(minHeight, 'falta min-height').not.toBeNull()
    expect(Number((height as RegExpExecArray)[1]) * PX_POR_REM).toBeGreaterThanOrEqual(
      OBJETIVO_MINIMO_PROYECTO_PX,
    )
    expect(Number((minHeight as RegExpExecArray)[1]) * PX_POR_REM).toBeGreaterThanOrEqual(
      OBJETIVO_MINIMO_PROYECTO_PX,
    )
    // DECLARADO: el mínimo NORMATIVO de SC 2.5.8 «Target Size (Minimum)» es 24×24; 44×44 es una
    // decisión de proyecto MÁS exigente, no una exigencia de la norma. La equivalencia rem→px
    // asume raíz de 16px (supuesto, no medición).
  })
})

describe('@s10 el botón muestra el foco de teclado y anula TODA transición bajo prefers-reduced-motion', () => {
  it('@s10 hay una regla :focus-visible con outline de grosor > 0 y outline-offset', () => {
    const foco = cuerpoDelBloque(codigoScss(), /:focus-visible\s*\{/)

    expect(foco, 'falta la regla :focus-visible').not.toBeNull()

    const outline = /outline\s*:\s*([\d.]+)px/.exec(foco as string)
    expect(outline, 'falta outline con grosor').not.toBeNull()
    expect(Number((outline as RegExpExecArray)[1])).toBeGreaterThan(0)
    expect(foco as string).toMatch(/outline-offset\s*:/)
  })

  it('@s10 existe @media (prefers-reduced-motion: reduce) con transition: none y animation: none', () => {
    const media = cuerpoDelBloque(
      codigoScss(),
      /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/,
    )

    expect(media, 'falta la @media reduced-motion').not.toBeNull()
    expect(media as string).toMatch(/transition\s*:\s*none/)
    expect(media as string).toMatch(/animation\s*:\s*none/)
  })

  it('@s10 el .tsx NO hornea ninguna transición ni animación INLINE (ganaría a la @media de la hoja)', () => {
    const fuenteTsx = readFileSync(RUTA_TSX, 'utf8')

    expect(fuenteTsx).not.toMatch(/transition\s*:/)
    expect(fuenteTsx).not.toMatch(/animation\s*:/)
    expect(fuenteTsx).not.toContain('style=')
  })
})
