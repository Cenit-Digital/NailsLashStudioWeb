import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * F-21 `tipografia_global` — se ASEVERA leyendo el SCSS. Stryker NO ve SCSS y `src/styles/` no está
 * en `mutate` (igual que F-03/F-04/F-08): aquí el mutante es HUMANO y su defensa es ESTE test + la
 * puerta de aprobación humana + la verificación EN VIVO con Chrome. Patrón calcado de
 * `cascara-global.test.ts` y `hero-estilos.test.ts` (readFileSync + parseo del TEXTO del SCSS).
 *
 * Contrato: features/tipografia_global.feature. Este fichero implementa SOLO @s1..@s7 (SIN jsdom
 * como navegador, SIN pintar). Los @s8/@s9 son `@verificacion-viva` (font-family COMPUTADO real,
 * `document.fonts.check`): los cierra el LEAD con Chrome/CDP sobre `dist/`, NUNCA aquí — jsdom no
 * carga @font-face, no descarga fuentes ni pinta.
 *
 * ANTI-TAUTOLOGÍA (regla dura): TODO nombre de fuente esperado —«'Manrope'», «'Gilda Display'» y la
 * allowlist {Manrope, Gilda Display, Great Vibes}— va ESCRITO A MANO aquí, JAMÁS importado de
 * main.tsx, site.ts ni de ningún símbolo para compararse contra sí mismo. Son literales de estilo.
 */
const RUTA_PARTIAL = 'src/styles/_tipografia.scss'
const RUTA_ENTRADA = 'src/styles/main.scss'

function partial(): string {
  return readFileSync(RUTA_PARTIAL, 'utf8')
}

/** El TEXTO del partial sin comentarios de bloque ni de línea (para parsear reglas sin ruido). */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

interface Regla {
  selector: string
  cuerpo: string
}

/**
 * Las reglas de nivel superior del partial: `{ selector, cuerpo }`. Cuenta llaves para respetar
 * cualquier anidamiento y es robusto al reformateo de prettier (no depende de saltos de línea).
 */
function reglas(fuente: string): Regla[] {
  const texto = sinComentarios(fuente)
  const resultado: Regla[] = []
  let i = 0

  while (i < texto.length) {
    const apertura = texto.indexOf('{', i)

    if (apertura < 0) {
      break
    }

    const selector = texto.slice(i, apertura).trim()
    let profundidad = 0
    let cierre = apertura

    for (; cierre < texto.length; cierre++) {
      if (texto[cierre] === '{') {
        profundidad += 1
      } else if (texto[cierre] === '}') {
        profundidad -= 1

        if (profundidad === 0) {
          break
        }
      }
    }

    resultado.push({ selector, cuerpo: texto.slice(apertura + 1, cierre) })
    i = cierre + 1
  }

  return resultado
}

/** La LISTA de selectores de un encabezado de regla: `"h2, h3"` → `['h2', 'h3']`. */
function selectoresDe(selector: string): string[] {
  return selector.split(',').map((s) => s.replace(/\s+/g, ' ').trim())
}

/** La regla cuya lista de selectores normalizada coincide EXACTAMENTE con `esperado`. */
function reglaExacta(fuente: string, esperado: string): Regla | undefined {
  const clave = selectoresDe(esperado).join(', ')

  return reglas(fuente).find((r) => selectoresDe(r.selector).join(', ') === clave)
}

/** Las reglas cuya lista de selectores nombra el tipo `tipo` (p. ej. 'h2'). */
function reglasQueNombran(fuente: string, tipo: string): Regla[] {
  return reglas(fuente).filter((r) => selectoresDe(r.selector).includes(tipo))
}

describe('@s1 la regla `body` del partial declara el stack de Manrope — suelo heredable del cuerpo', () => {
  it('@s1 la regla `body` declara font-family "\'Manrope\', system-ui, sans-serif"', () => {
    // El stack va ESCRITO A MANO: fuente de cuerpo entrecomillada + genérico system-ui + sans-serif.
    // NO se importa de main.tsx ni de ningún símbolo (anti-tautología). Regex robusta a comillas
    // simples/dobles y al whitespace de prettier.
    const body = reglaExacta(partial(), 'body')

    expect(body, 'falta la regla `body` en el partial').not.toBeUndefined()
    expect(body?.cuerpo).toMatch(
      /font-family\s*:\s*['"]Manrope['"]\s*,\s*system-ui\s*,\s*sans-serif/,
    )
  })
})

describe('@s2 la regla CONJUNTA `h2, h3` declara el stack de Gilda Display — suelo de tipo de los encabezados', () => {
  it('@s2 hay UNA sola regla que nombra h2 y/o h3, y su lista de selectores es {h2, h3} (conjunta, no dos reglas)', () => {
    // D-1 (RECOMENDADO: h2 Y h3). Reparación G2: UNA regla conjunta cuya lista nombra AMBOS tipos,
    // JAMÁS dos reglas `h2 {…}` y `h3 {…}` por separado. Que sea exactamente UNA regla mencionando
    // h2/h3 es lo que lo garantiza: una regla separada `h3 {…}` haría length 2.
    const conEncabezados = reglas(partial()).filter((r) => {
      const sels = selectoresDe(r.selector)

      return sels.includes('h2') || sels.includes('h3')
    })

    expect(conEncabezados).toHaveLength(1)
    expect(selectoresDe(conEncabezados[0].selector)).toContain('h2')
    expect(selectoresDe(conEncabezados[0].selector)).toContain('h3')
  })

  it('@s2 esa regla conjunta declara font-family "\'Gilda Display\', serif"', () => {
    // «Gilda Display» y «serif» van ESCRITOS A MANO, no importados de ningún símbolo.
    const encabezados = reglasQueNombran(partial(), 'h2')

    expect(encabezados, 'falta la regla de encabezados con h2').toHaveLength(1)
    expect(encabezados[0].cuerpo).toMatch(/font-family\s*:\s*['"]Gilda Display['"]\s*,\s*serif/)
  })
})

describe('@s3 el partial está ENGANCHADO al punto de entrada de los estilos', () => {
  it('@s3 main.scss lo importa con @use \'tipografia\'', () => {
    // ANTI-VACUIDAD (misma guarda que `@use 'base'` de F-04 @s11): un `_tipografia.scss` perfecto
    // que nadie importa NO llega al sitio (el cuerpo seguiría en Times New Roman) = verde por
    // vacuidad de esta feature. Se lee `main.scss` y se afirma el `@use`.
    expect(readFileSync(RUTA_ENTRADA, 'utf8')).toMatch(/@use\s+'tipografia'/)
  })
})

describe('@s4 ninguno de los dos selectores se queda SIN font-family — la AUSENCIA fue el fallo real de F-07', () => {
  // ANTI-VACUIDAD (misma guarda que F-07 @s17): la AUSENCIA de `font-family` fue el fallo EXACTO
  // que la verificación en vivo cazó en F-07 (el titular salió en Times New Roman por HERENCIA). Un
  // nivel arriba: si `body` o `h2, h3` se quedaran sin font-family, el cuerpo caería en la serif del
  // UA en SILENCIO, verde en @s3 y roto en pantalla. Los selectores de los Examples van A MANO.
  it.each(['body', 'h2, h3'])(
    '@s4 la regla del selector "%s" NOMBRA su propia font-family (no hereda la serif del UA)',
    (selector) => {
      const regla = reglaExacta(partial(), selector)

      expect(regla, `falta la regla del selector ${selector}`).not.toBeUndefined()
      expect(regla?.cuerpo).toMatch(/font-family\s*:/)
    },
  )
})

/** Los valores de cada declaración `font-family` del partial (sin comentarios). */
function declaracionesFontFamily(fuente: string): string[] {
  return [...sinComentarios(fuente).matchAll(/font-family\s*:\s*([^;{}]+)/g)].map((m) => m[1].trim())
}

/** Cada familia/identificador de cada declaración `font-family`, ya troceado por comas y sin vacíos. */
function familiasDeclaradas(fuente: string): string[] {
  return declaracionesFontFamily(fuente)
    .flatMap((decl) => decl.split(',').map((s) => s.trim()))
    .filter((s) => s.length > 0)
}

describe('@s5 cero fuentes no autohospedadas — allowlist de F-05, sin @import ni @font-face nuevos', () => {
  // Allowlist y genéricos van ESCRITOS A MANO (anti-tautología): las tres familias horneadas por
  // F-05 (main.tsx:36-41) y los genéricos CSS admitidos. JAMÁS importados de ningún símbolo.
  const ALLOWLIST_FAMILIAS = ['Manrope', 'Gilda Display', 'Great Vibes']
  const GENERICOS = ['system-ui', 'sans-serif', 'serif', 'cursive']

  it('@s5 toda familia ENTRECOMILLADA del partial pertenece a la allowlist {Manrope, Gilda Display, Great Vibes}', () => {
    const entrecomilladas = familiasDeclaradas(partial()).filter((f) => /^['"]/.test(f))

    // No vacuidad: si no hubiera ninguna familia entrecomillada, la comprobación pasaría en vano.
    expect(entrecomilladas.length).toBeGreaterThan(0)

    for (const familia of entrecomilladas) {
      const nombre = familia.replace(/^['"]|['"]$/g, '')

      expect(ALLOWLIST_FAMILIAS, `familia no horneada por F-05: ${familia}`).toContain(nombre)
    }
  })

  it('@s5 el ÚNICO identificador SIN comillas admitido es un genérico CSS (Georgia, Cormorant… se rechazan)', () => {
    // VECTOR SIN COMILLAS: CSS admite `font-family: Georgia`. Comprobar solo las entrecomilladas
    // dejaría escapar una familia no horneada de una palabra escrita desnuda.
    const desnudos = familiasDeclaradas(partial()).filter((f) => !/^['"]/.test(f))

    expect(desnudos.length).toBeGreaterThan(0)

    for (const identificador of desnudos) {
      expect(GENERICOS, `identificador desnudo no genérico: ${identificador}`).toContain(identificador)
    }
  })

  it('@s5 el partial NO contiene ninguna directiva @import ni ningún bloque @font-face', () => {
    // Sobre el CÓDIGO (sin comentarios): una directiva real es código, jamás prosa comentada.
    const codigo = sinComentarios(partial())

    expect(codigo, 'un @import metería un origen nuevo').not.toMatch(/@import\b/)
    expect(codigo, 'un @font-face metería una fuente nueva').not.toMatch(/@font-face\b/)
  })
})

describe('@s6 el selector de encabezados es EXACTAMENTE h2, h3 y NO incluye h1 — el hero (F-07) intacto', () => {
  it('@s6 la lista de selectores de encabezados contiene h2 y h3 y NO contiene h1', () => {
    const encabezados = reglasQueNombran(partial(), 'h2')

    expect(encabezados).toHaveLength(1)

    const sels = selectoresDe(encabezados[0].selector)

    expect(sels).toContain('h2')
    expect(sels).toContain('h3')
    expect(sels).not.toContain('h1')
  })

  it('@s6 el partial no declara ninguna regla que aplique a h1 ni a las clases del titular del hero', () => {
    // Las clases del titular van A MANO: son las de F-07. El partial jamás las declara ni matchea h1.
    const clasesHero = ['.heroMarca', '.heroStudio', '.titulo']

    for (const regla of reglas(partial())) {
      expect(selectoresDe(regla.selector), 'ninguna regla del partial matchea h1').not.toContain('h1')

      for (const clase of clasesHero) {
        expect(regla.selector, `el partial no debe declarar ${clase}`).not.toContain(clase)
      }
    }
  })

  it('@s6 el partial NO edita ni referencia hero.module.scss (F-07 está `done`)', () => {
    expect(partial()).not.toMatch(/hero\.module/)
  })
})

describe('@s7 la capa global es un SUELO, no un TECHO — sin !important, solo selectores de tipo', () => {
  it('@s7 ninguna declaración font-family del partial lleva !important', () => {
    for (const declaracion of declaracionesFontFamily(partial())) {
      expect(declaracion, 'una font-family con !important convertiría el suelo en techo').not.toMatch(
        /!important/i,
      )
    }
  })

  it('@s7 el partial no usa !important en ninguna parte', () => {
    expect(partial()).not.toMatch(/!important/i)
  })

  it('@s7 las reglas del partial usan solo selectores de TIPO (sin clase ni id): body por herencia, h2/h3 (0,0,1)', () => {
    // El body fija su fuente por HERENCIA (la fuerza más débil) y `h2, h3` es (0,0,1): cualquier
    // font-family propia (hero, cabecera) o clase futura (precios de F-09) los derrota.
    for (const regla of reglas(partial())) {
      expect(regla.selector, `${regla.selector} debe ser un selector de tipo, sin clase ni id`).not.toMatch(
        /[.#]/,
      )
    }
  })
})
