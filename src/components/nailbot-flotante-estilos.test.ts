import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * @s12-@s15 de features/nailbot_flotante.feature: lo que ningún render ve, por BYTES (Stryker no ve
 * SCSS). ANCLA POSITIVA siempre primero. Literales A MANO.
 */
const ARTE = readFileSync('src/components/nailbot-arte.module.scss', 'utf8')
const FLOTANTE = readFileSync('src/components/nailbot-flotante.module.scss', 'utf8')
const BASE = readFileSync('src/styles/_base.scss', 'utf8')
const TSX = readFileSync('src/components/NailbotFlotante.tsx', 'utf8')
const LOGICA = readFileSync('src/components/nailbot-flotante-logica.ts', 'utf8')
const HOME = readFileSync('src/pages/home.tsx', 'utf8')
const SETUP = readFileSync('vitest.setup.ts', 'utf8')

const NO_PREFERENCE = '@media (prefers-reduced-motion: no-preference)'

/** El cuerpo (entre llaves) del primer bloque cuyo encabezado casa, contando llaves. */
function cuerpoDelBloque(fuente: string, encabezado: RegExp | string): string | null {
  const indice =
    typeof encabezado === 'string'
      ? fuente.indexOf(encabezado)
      : (encabezado.exec(fuente)?.index ?? -1)

  if (indice < 0) {
    return null
  }

  const apertura = fuente.indexOf('{', indice)
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

/** La hoja SIN el bloque @media indicado (para comprobar qué queda fuera de él). */
function sinBloque(fuente: string, encabezado: string): string {
  const cuerpo = cuerpoDelBloque(fuente, encabezado)
  return cuerpo === null ? fuente : fuente.replace(cuerpo, '')
}

/** Las reglas «selector { declaraciones }» de un fragmento, sin anidamiento. */
function reglas(fragmento: string): { selector: string; cuerpo: string }[] {
  return [...fragmento.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    cuerpo: m[2],
  }))
}

describe('@s12 la animación del arte vive TODA dentro de «no-preference», atada a [data-animacion]', () => {
  const dentro = cuerpoDelBloque(ARTE, NO_PREFERENCE) ?? ''
  const fuera = sinBloque(ARTE, NO_PREFERENCE)

  it('@s12 ANCLA POSITIVA', () => {
    for (const ancla of [
      NO_PREFERENCE,
      '[data-animacion',
      'transform-box: fill-box',
      'animation-play-state: paused',
    ]) {
      expect(ARTE, ancla).toContain(ancla)
    }
  })

  it('@s12 exactamente trece @keyframes, todas dentro de «no-preference»; fuera, ni @keyframes ni animation', () => {
    expect(ARTE.split('@keyframes').length - 1).toBe(13)
    expect(dentro.split('@keyframes').length - 1).toBe(13)
    expect(fuera).not.toContain('@keyframes')
    expect(fuera).not.toContain('animation')
  })

  it('@s12 dentro de las @keyframes solo se animan transform y opacity', () => {
    const fotogramas = [...ARTE.matchAll(/@keyframes\s+[\w-]+\s*\{/g)].map(
      (m) => cuerpoDelBloque(ARTE.slice(m.index), '@keyframes') ?? '',
    )

    expect(fotogramas).toHaveLength(13)
    for (const cuerpo of fotogramas) {
      const propiedades = [...cuerpo.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1])
      expect(propiedades.length).toBeGreaterThan(0)
      for (const propiedad of propiedades) {
        expect(['transform', 'opacity']).toContain(propiedad)
      }
    }
  })

  it('@s12 toda regla con animation lleva [data-animacion] en el selector; la pausada CONGELA', () => {
    const conAnimacion = reglas(dentro).filter((r) =>
      /(^|[\s;])animation(-name)?\s*:/.test(r.cuerpo),
    )

    expect(conAnimacion.length).toBeGreaterThanOrEqual(13)
    for (const regla of conAnimacion) {
      expect(regla.selector).toContain('[data-animacion')
    }
    const pausada = reglas(dentro).find((r) => r.selector.includes("[data-animacion='pausada']"))
    expect(pausada?.cuerpo).toContain('animation-play-state: paused')
    expect(pausada?.cuerpo).not.toContain('animation: none')
  })

  it('@s12 las duraciones son las del prototipo y cada regla animada es infinita', () => {
    const animadas = reglas(dentro).filter((r) => /animation-name\s*:/.test(r.cuerpo))

    expect(animadas).toHaveLength(13)
    for (const regla of animadas) {
      const duracion = /animation-duration:\s*([\d.]+s)\s*;/.exec(regla.cuerpo)?.[1]
      expect(['3.2s', '1.6s', '4.6s', '7s'], regla.selector).toContain(duracion)
      expect(regla.cuerpo, regla.selector).toMatch(/animation-iteration-count:\s*infinite\s*;/)
    }
    for (const esperada of ['3.2s', '1.6s', '4.6s', '7s']) {
      expect(dentro, esperada).toContain(`animation-duration: ${esperada};`)
    }
  })

  it('@s12 la pausa GANA la cascada: ninguna regla usa el shorthand «animation:», que repondría el play-state a running', () => {
    // Regresión medida en Chrome (2026-09-28): con el shorthand en reglas de especificidad (0,3,0),
    // la regla de pausa (0,2,0) perdía y el robot seguía moviéndose con aria-pressed="true".
    expect(dentro).toContain('animation-name:')
    expect(ARTE).not.toMatch(/(^|[\s;{])animation\s*:/)
    // Y SOLO la regla de pausa toca el play-state (un «running» a mano en una regla animada ganaría).
    const conPlayState = reglas(dentro).filter((r) => /animation-play-state\s*:/.test(r.cuerpo))
    expect(conPlayState).toHaveLength(1)
    expect(conPlayState[0].selector).toContain("[data-animacion='pausada']")
    const pausada = reglas(dentro).find((r) => r.selector.includes("[data-animacion='pausada']"))
    expect(pausada?.selector).toMatch(/\*\s*$/)
  })

  it('@s12 sin will-change, url(, !important ni «reduce»', () => {
    expect(ARTE).toContain('[data-animacion')
    for (const prohibido of [
      'will-change',
      'url(',
      '!important',
      'prefers-reduced-motion: reduce',
    ]) {
      expect(ARTE, prohibido).not.toContain(prohibido)
    }
  })
})

describe('@s13 la hoja del flotante', () => {
  it('@s13 el panel usa border-box: el relleno no se suma al 100vw (desbordaba en móvil, medido en Chrome)', () => {
    const cuerpo = cuerpoDelBloque(FLOTANTE, /\.dialogo\s*\{/) ?? ''

    expect(cuerpo).toContain('padding')
    expect(cuerpo).toMatch(/(^|\s)box-sizing:\s*border-box/)
  })

  it('@s13 ANCLA POSITIVA: declara sus selectores', () => {
    for (const selector of [
      'flotante',
      'lanzador',
      'pausa',
      'bocadillo',
      'cerrarBocadillo',
      'dialogo',
      'cerrarDialogo',
    ]) {
      expect(FLOTANTE, selector).toMatch(new RegExp(`\\.${selector}\\b`))
    }
  })

  it('@s13 .flotante: fijo, z-index 40 y áreas seguras', () => {
    const cuerpo = cuerpoDelBloque(FLOTANTE, /\.flotante\s*\{/) ?? ''

    for (const declaracion of [
      'position: fixed',
      'z-index: 40',
      'env(safe-area-inset-bottom, 0px)',
      'env(safe-area-inset-right, 0px)',
    ]) {
      expect(cuerpo, declaracion).toContain(declaracion)
    }
  })

  it('@s13 la caja fija no captura clics (pointer-events: none) pero sus HIJOS sí (> * { pointer-events: auto })', () => {
    // jsdom ignora pointer-events: si esto se rompe, el robot, la pausa y la × dejan de recibir clics en
    // un navegador real con toda la suite en verde (hallazgo del judge delta).
    const flotante = cuerpoDelBloque(FLOTANTE, /\.flotante\s*\{/) ?? ''
    const hijos = cuerpoDelBloque(flotante, />\s*\*\s*\{/) ?? ''

    expect(flotante).toMatch(/(^|[\s;])pointer-events:\s*none\s*;/)
    expect(hijos).toMatch(/pointer-events:\s*auto\s*;/)
  })

  it('@s13 el foco de teclado: halo claro y forma redonda en el lanzador, la pausa y los dos cierres', () => {
    const lanzador = cuerpoDelBloque(FLOTANTE, /\.lanzador:focus-visible\s*\{/) ?? ''
    const resto =
      cuerpoDelBloque(
        FLOTANTE,
        /\.pausa:focus-visible,\s*\.cerrarBocadillo:focus-visible,\s*\.cerrarDialogo:focus-visible\s*\{/,
      ) ?? ''

    for (const cuerpo of [lanzador, resto]) {
      expect(cuerpo).toMatch(/border-radius:\s*50%/)
      expect(cuerpo).toMatch(/outline:\s*3px solid var\(--accent-dark\)/)
      expect(cuerpo).toMatch(/box-shadow:[\s\S]*var\(--surface\)/)
    }
  })

  it('@s13 en colores forzados, el lanzador y el panel conservan un contorno', () => {
    const forzados = cuerpoDelBloque(FLOTANTE, /@media\s*\(forced-colors:\s*active\)\s*\{/) ?? ''

    expect(cuerpoDelBloque(forzados, /\.lanzador\s*\{/)).toMatch(/border:\s*2px solid ButtonText/)
    expect(cuerpoDelBloque(forzados, /\.dialogo\s*\{/)).toMatch(/border:\s*2px solid CanvasText/)
  })

  it('@s13 sin «inset: 0» ni «width: 100%»', () => {
    expect(FLOTANTE).toMatch(/\.flotante\b/)
    expect(FLOTANTE).not.toContain('inset: 0')
    expect(FLOTANTE).not.toContain('width: 100%')
  })

  it('@s13 .lanzador desde --nailbot-lanzador, con anillo --accent-dark y sin --accent-soft', () => {
    const cuerpo = cuerpoDelBloque(FLOTANTE, /\.lanzador\s*\{/) ?? ''

    expect(cuerpo).toMatch(/(^|\s)width:\s*var\(--nailbot-lanzador\)/)
    expect(cuerpo).toMatch(/(^|\s)height:\s*var\(--nailbot-lanzador\)/)
    expect(cuerpo).toContain('var(--accent-dark)')
    expect(cuerpo).not.toContain('var(--accent-soft)')
  })

  it('@s13 .pausa mide 32px y ningún @media la redimensiona', () => {
    const cuerpo = cuerpoDelBloque(FLOTANTE, /\.pausa\s*\{/) ?? ''

    expect(cuerpo).toMatch(/(^|\s)width:\s*32px/)
    expect(cuerpo).toMatch(/(^|\s)height:\s*32px/)
    for (const media of FLOTANTE.matchAll(/@media[^{]*\{/g)) {
      expect(cuerpoDelBloque(FLOTANTE.slice(media.index), '@media')).not.toMatch(/\.pausa\b/)
    }
  })

  it('@s13 los cierres miden 24px o más', () => {
    for (const bloque of ['cerrarBocadillo', 'cerrarDialogo']) {
      const cuerpo = cuerpoDelBloque(FLOTANTE, new RegExp(`\\.${bloque}\\s*\\{`)) ?? ''
      const ancho = Number(/(^|\s)width:\s*(\d+)px/.exec(cuerpo)?.[2])
      const alto = Number(/(^|\s)height:\s*(\d+)px/.exec(cuerpo)?.[2])

      expect(ancho, bloque).toBeGreaterThanOrEqual(24)
      expect(alto, bloque).toBeGreaterThanOrEqual(24)
    }
  })

  it('@s13 nada de verde ni de mensajería, ni descargas, ni foco apagado', () => {
    const minusculas = FLOTANTE.toLowerCase()

    expect(minusculas).toContain('.lanzador')
    for (const prohibido of [
      '#25d366',
      '#1fb757',
      '#08130c',
      'demo-btn--wa',
      'whatsapp',
      'url(',
      '@font-face',
      'outline: none',
      'outline: 0',
    ]) {
      expect(minusculas, prohibido).not.toContain(prohibido)
    }
  })

  it('@s13 toda animation o transition vive dentro de «no-preference» y dura 5s o menos', () => {
    const dentro = cuerpoDelBloque(FLOTANTE, NO_PREFERENCE) ?? ''
    const fuera = sinBloque(FLOTANTE, NO_PREFERENCE)

    expect(dentro).toContain('animation')
    expect(fuera).not.toMatch(/(^|[\s;{])(animation|transition)\s*:/)
    for (const [, valor, unidad] of dentro.matchAll(
      /(?:animation|transition):[^;]*?([\d.]+)(m?s)\b/g,
    )) {
      const segundos = unidad === 'ms' ? Number(valor) / 1000 : Number(valor)
      expect(segundos).toBeLessThanOrEqual(5)
    }
  })
})

describe('@s14 C43 al fondo: scroll-padding-bottom desde la MISMA custom property que el lanzador', () => {
  it('@s14 --nailbot-lanzador en :root, de 44px o más, y su valor móvil en un @media, también ≥ 44px', () => {
    const escritorio = /--nailbot-lanzador:\s*(\d+)px/.exec(
      cuerpoDelBloque(BASE, /(^|\n):root\s*\{/) ?? '',
    )
    const media = cuerpoDelBloque(BASE, /@media\s*\(max-width:[^)]*\)\s*\{/) ?? ''
    const movil = /--nailbot-lanzador:\s*(\d+)px/.exec(cuerpoDelBloque(media, ':root') ?? '')

    expect(Number(escritorio?.[1])).toBeGreaterThanOrEqual(44)
    expect(Number(movil?.[1])).toBeGreaterThanOrEqual(44)
  })

  it('@s14 html: scroll-padding-bottom con la custom property y el área segura; scroll-padding-top intacto', () => {
    const html = cuerpoDelBloque(BASE, /(^|\n)html\s*\{/) ?? ''
    const valor = /scroll-padding-bottom:\s*([^;]+);/.exec(html)?.[1] ?? ''

    expect(valor).toContain('var(--nailbot-lanzador)')
    expect(valor).toContain('env(safe-area-inset-bottom, 0px)')
    expect(html).toContain('scroll-padding-top: 6rem')
  })

  it('@s14 ni html ni body declaran padding-bottom en _base.scss', () => {
    expect(BASE).toContain('scroll-padding-bottom')
    for (const selector of [/(^|\n)html\s*\{/, /(^|\n)body\s*\{/]) {
      expect(cuerpoDelBloque(BASE, selector) ?? '').not.toMatch(/(^|[\s;])padding-bottom\s*:/)
    }
  })
})

describe('@s15 guardas de FUENTE', () => {
  it('@s15 ANCLAS POSITIVAS', () => {
    for (const ancla of [
      'export function NailbotFlotante',
      'showModal(',
      '.close(',
      'ChatNailbot',
      'NailbotArte',
      'matchMedia',
    ]) {
      expect(TSX, ancla).toContain(ancla)
    }
    expect(LOGICA).toContain('export function')
  })

  it('@s15 sin red, storage ni analítica', () => {
    for (const bytes of [TSX, LOGICA]) {
      for (const prohibido of [
        'fetch(',
        'XMLHttpRequest',
        'localStorage',
        'sessionStorage',
        'document.cookie',
        'sendBeacon',
        'gtag',
        'dataLayer',
      ]) {
        expect(bytes, prohibido).not.toContain(prohibido)
      }
    }
  })

  it('@s15 sin la palabra de la app de mensajería (H5), ni en comentarios', () => {
    for (const bytes of [TSX, LOGICA]) {
      expect(bytes.toLowerCase()).not.toContain('whatsapp')
    }
  })

  it('@s15 sin ids literales: los ids salen de useId (dos instancias de chat en la página)', () => {
    expect(TSX).toContain('useId')
    expect(TSX).not.toContain('id="')
    expect(TSX).not.toMatch(/id=\{['`]/)
  })

  it('@s15 sin open controlado, autoFocus, role="dialog" ni tabIndex', () => {
    for (const prohibido of ['open={', 'autoFocus', 'role="dialog"', 'tabIndex']) {
      expect(TSX, prohibido).not.toContain(prohibido)
    }
  })

  it('@s15 sin los literales de la lista negra de F-01', () => {
    for (const bytes of [TSX, LOGICA]) {
      for (const prohibido of [
        '600123456',
        'ph-woman',
        'IMAGEN TEMPORAL',
        'Plantilla de demostración',
        'hola@nailslashstudio.com',
        'Calle de la Belleza',
      ]) {
        expect(bytes, prohibido).not.toContain(prohibido)
      }
    }
  })

  it('@s15 apoyo: en home.tsx el flotante va tras </main> y antes de <Pie', () => {
    const cierreMain = HOME.indexOf('</main>')
    const flotante = HOME.indexOf('<NailbotFlotante')
    const pie = HOME.indexOf('<Pie')

    for (const posicion of [cierreMain, flotante, pie]) {
      expect(posicion).toBeGreaterThanOrEqual(0)
    }
    expect(cierreMain).toBeLessThan(flotante)
    expect(flotante).toBeLessThan(pie)
  })

  it('@s15 apoyo: vitest.setup.ts instala el doble de showModal y de close SOLO si faltan', () => {
    expect(SETUP).toMatch(/typeof\s+\w+\.showModal\s*!==\s*'function'[\s\S]*?showModal\s*=/)
    expect(SETUP).toMatch(/typeof\s+\w+\.close\s*!==\s*'function'[\s\S]*?close\s*=/)
  })
})
