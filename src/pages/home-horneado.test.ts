import { execSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { beforeAll, describe, expect, it } from 'vitest'

/**
 * F-10 @s12 y @s14, F-14 @s6 y F-04 @s39-@s42 y @s45 (ENMIENDAS 2, 3 y 4 de `cascaron_semantico.feature`)
 * — sobre el HTML CRUDO del artefacto de PRODUCCIÓN (en @s41, también el CSS de `dist/assets/`; en @s42,
 * el `app-*.js` al que apunta el HTML), leído por BYTES (readFileSync, sin ejecutar JavaScript — I-8,
 * NUNCA jsdom). «Verde ≠ funciona»: para las features de UI se verifica con `pnpm build` + fetch del HTML
 * crudo (feature_list.json §rules.notas). @s39-@s42 y @s45 REUTILIZAN el build de este `beforeAll`: el
 * contrato prohíbe un build nuevo solo para ellos. Que ese build es de PRODUCCIÓN lo demuestran @s42 (por
 * los bytes del bundle) y @s45 (por el modo que escribe el propio log de Vite).
 *
 * 🔴 ESTE FICHERO NO IMPORTA NADA DE `src/lib/` NI DE `src/pages/`, Y ES DELIBERADO (patrón de
 * `trampas-del-horneado.test.tsx`): corre el BUILD REAL (lento) en `beforeAll`. Si importara
 * `horario.ts`, Stryker lo contaría como cobertura y lo re-ejecutaría POR CADA MUTANTE → decenas de
 * builds → TIMEOUTS, y «un informe de mutación con timeouts MIENTE» (docs/verification.md). Los
 * ESPERADOS se escriben A MANO aquí (anti-tautología), no se importan de producción.
 */
const RUTA_DIST = resolve('dist/index.html')

let html = ''
let codigoSalida = 0
let salidaDelBuild = ''

beforeAll(() => {
  // El `pnpm build` REAL con las CINCO puertas. @s14 exige exit 0 «con todas las puertas»: se captura
  // el código de salida (execSync lanza en fallo con `.status`). @s42: `NODE_ENV=production` explícito
  // en el SUBPROCESO (el resto se hereda); si heredara el `test` de Vitest, React saldría en DESARROLLO.
  // @s45: y `MODE=production`, porque Vitest exporta también `MODE=test` y vite-react-ssg lo lee ANTES que
  // `NODE_ENV`. Se CONSERVA su salida estándar (el log de Vite), y si falla, la que trae el error.
  try {
    salidaDelBuild = execSync('pnpm build', {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production', MODE: 'production' },
    }).toString()
  } catch (error: unknown) {
    const fallo = error as { status: number; stdout: Buffer }

    codigoSalida = fallo.status
    salidaDelBuild = fallo.stdout.toString()
  }

  html = readFileSync(RUTA_DIST, 'utf8')
}, 180_000)

/**
 * El JSON-LD horneado, extraído del `<script … application/ld+json …>` de `dist/index.html`. Helmet
 * ordena los atributos con `data-rh="true"` ANTES de `type`, así que el patrón es tolerante a atributos.
 */
function jsonLdHorneado(): Record<string, unknown> {
  const encontrado = /<script[^>]*application\/ld\+json[^>]*>(.+?)<\/script>/s.exec(html)

  return JSON.parse(encontrado?.[1] ?? '{}')
}

/**
 * @s12 — la DEMO NO hornea un badge «Abierto/Cerrado ahora» en vivo (D1). Bajo SSG un badge horneado
 * congela el instante del build → mentira; uno que solo aparece tras hidratar es la rama-solo-JS-en-SSG
 * prohibida. `estaAbierto` se construye y testea (para F-13) pero NO alimenta ningún badge. El ANCLA
 * POSITIVA va PRIMERO (patrón F-04 @s34): sin ella, una negativa sobre bytes pasa VACUAMENTE si el
 * fichero estuviera vacío o fuese el equivocado.
 */
describe('@s12 la DEMO no hornea un badge «Abierto/Cerrado ahora» en el HTML crudo de /', () => {
  it('@s12 ANCLA POSITIVA: el HTML trae la cáscara de F-04 — el <title> «Nails Lash Studio · …» y un <script ld+json>', () => {
    expect(html).toMatch(/<title[^>]*>Nails Lash Studio.*Uñas, pestañas y cejas/i)
    expect(html).toMatch(/<script[^>]*application\/ld\+json/i)
  })

  it('@s12 el HTML NO contiene un indicador «Abierto ahora» / «Cerrado ahora» calculado del instante del build', () => {
    expect(html).not.toMatch(/Abierto ahora/i)
    expect(html).not.toMatch(/Cerrado ahora/i)
  })
})

/**
 * @s14 — `openingHoursSpecification` se COMPONE en el sitio de emisión (`home.tsx`), esparciendo el
 * objeto de `construirJsonLd` (F-04, INTACTO — su @s9 en seo.test.ts sigue verde) y AÑADIENDO la clave.
 * Se asevera sobre el JSON-LD HORNEADO en `dist/`. JAMÁS la clave `openingHours`: la puerta de cascarón
 * de F-04 compara igualdad EXACTA en minúsculas, así que `openinghoursspecification !== openinghours` y
 * no colisiona; si apareciese `openingHours`, el build habría roto (codigoSalida != 0).
 */
describe('@s14 openingHoursSpecification se hornea en el JSON-LD de dist/, sin la clave openingHours', () => {
  it('@s14 ANCLA POSITIVA: el JSON-LD horneado conserva la cáscara BeautySalon de F-04 (@type y name)', () => {
    const jsonLd = jsonLdHorneado()

    expect(jsonLd['@type']).toBe('BeautySalon')
    expect(jsonLd.name).toBe('Nails Lash Studio')
    for (const clave of ['@context', '@type', 'name', 'address', 'geo', 'telephone']) {
      expect(Object.keys(jsonLd)).toContain(clave)
    }
  })

  it('@s14 el JSON-LD horneado contiene «openingHoursSpecification» con el array de @s13 (escrito A MANO)', () => {
    expect(jsonLdHorneado().openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '14:00',
      },
    ])
  })

  it('@s14 el JSON-LD horneado NO contiene la clave «openingHours» (ni las dos a la vez)', () => {
    const claves = Object.keys(jsonLdHorneado())

    expect(claves).toContain('openingHoursSpecification')
    expect(claves).not.toContain('openingHours')
  })

  it('@s14 el build de producción con las CINCO puertas termina en código de salida 0', () => {
    expect(codigoSalida).toBe(0)
  })
})

/**
 * F-14 @s6 — el JSON-LD horneado NO gana un `aggregateRating`: la nota de Treatwell se MUESTRA a
 * las personas (línea del agregado de la sección de reseñas) pero JAMÁS se marca como propia en el
 * structured data (guidelines de Google: reseñas de terceros no marcables; brief v3 §2 +
 * acceptance de F-14). Se AMPLÍA este test build-based EXISTENTE: prohibido crear un cuarto.
 */
describe('@s6 (F-14) el JSON-LD horneado NO contiene aggregateRating ni review', () => {
  it('@s6 ANCLA POSITIVA: la cáscara BeautySalon sigue entera — @type, name y openingHoursSpecification', () => {
    // Sin ella, la negativa pasaría VACUAMENTE si el JSON-LD entero hubiera desaparecido.
    const jsonLd = jsonLdHorneado()

    expect(jsonLd['@type']).toBe('BeautySalon')
    expect(jsonLd.name).toBe('Nails Lash Studio')
    expect(Object.keys(jsonLd)).toContain('openingHoursSpecification')
  })

  it('@s6 el JSON-LD no contiene la clave "aggregateRating" ni la clave "review"', () => {
    const claves = Object.keys(jsonLdHorneado())

    expect(claves).not.toContain('aggregateRating')
    expect(claves).not.toContain('review')
  })

  it('@s6 el literal "aggregateRating" no aparece en NINGÚN byte del HTML horneado', () => {
    expect(html).not.toContain('aggregateRating')
  })

  it('@s6 y la sección de reseñas SÍ está horneada: el agregado visible viaja en el HTML crudo, atribuido y fechado', () => {
    // El ancla de la PROPIA F-14 (escrita A MANO): la nota se muestra a las personas…
    expect(html).toContain('Lo que dicen nuestras clientas')
    expect(html).toContain('4,9 de 5')
    expect(html).toContain('1.239')
    expect(html).toContain('https://www.treatwell.es/establecimiento/nails-lash-studio/')
    expect(html).toContain('23/07/2026')
    // …nunca a los buscadores como propia (la negativa de arriba deja de ser vacua con esto verde).
  })
})

/**
 * F-04 @s39-@s41 — LA EXTRACCIÓN DE ELEMENTOS DEL HTML CRUDO, escrita A MANO aquí (este fichero no
 * importa `src/lib/`). Es LA MISMA para cada ancla positiva y para su negativa: si no casara nada
 * (atributos en otro orden, otra caja, otras comillas), el ancla cae en ROJO y la negativa ya no puede
 * pasar en VACÍO. Mira NOMBRES de atributo (en minúsculas), nunca subcadenas de la etiqueta: el hash de
 * un fichero es arbitrario y podría contener «async» o «image». Valores entre comillas dobles, simples
 * o sin comillas; un atributo sin valor vale ''. Ante un nombre repetido gana el PRIMERO, como en el
 * parser de HTML.
 */
const ATRIBUTO = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

type Atributos = ReadonlyMap<string, string>

function atributosDe(texto: string): Atributos {
  const atributos = new Map<string, string>()

  for (const [, nombre, dobles, simples, sinComillas] of texto.matchAll(ATRIBUTO)) {
    const clave = nombre.toLowerCase()

    if (!atributos.has(clave)) {
      atributos.set(clave, dobles ?? simples ?? sinComillas ?? '')
    }
  }

  return atributos
}

/** Los elementos `<etiqueta …>` del HTML crudo, sin distinguir mayúsculas en el nombre de la etiqueta. */
function elementos(etiqueta: string): readonly Atributos[] {
  const apertura = new RegExp(`<${etiqueta}(?=[\\s/>])([^>]*)>`, 'gi')

  return [...html.matchAll(apertura)].map((encontrado) => atributosDe(encontrado[1]))
}

/** Un valor enumerado de HTML (`type`, `rel`, `as`, `loading`) se compara sin distinguir mayúsculas. */
function valorDe(elemento: Atributos, nombre: string): string | undefined {
  return elemento.get(nombre)?.toLowerCase()
}

/** El prefijo con el que el HTML crudo apunta a `dist/assets/` (base "/NailsLashStudioWeb/"). */
const PREFIJO_DE_ASSETS = '/NailsLashStudioWeb/assets/'

/** @s39 — los `<script type="module">` cuyo `src` apunta al bundle: `/NailsLashStudioWeb/assets/….js`. */
function modulosDelBundle(): readonly Atributos[] {
  return elementos('script').filter((script) => {
    const src = script.get('src') ?? ''

    return (
      valorDe(script, 'type') === 'module' &&
      src.startsWith(PREFIJO_DE_ASSETS) &&
      src.endsWith('.js')
    )
  })
}

/**
 * F-04 @s39 (ENMIENDA 2) — el módulo del bundle SIN `async`. HTML Living Standard §4.12.1: un módulo
 * con `async` se evalúa «as soon as it is available (potentially before parsing completes)»; sin él,
 * «when the page has finished parsing» — después del `<script>` del final del `<body>` que lleva el
 * snapshot del router. `defer` ni se exige ni se prohíbe («has no effect on module scripts»).
 */
describe('@s39 (F-04) el script de módulo del bundle viaja SIN async en el HTML crudo de producción', () => {
  it('@s39 ANCLA POSITIVA: hay exactamente 1 <script type="module"> con src "/NailsLashStudioWeb/assets/….js"', () => {
    // El hash del nombre cambia en cada build y NO se fija.
    expect(modulosDelBundle()).toHaveLength(1)
  })

  it('@s39 ese elemento NO lleva el atributo async en ninguna forma (async, async="", async="async") ni caja', () => {
    // Misma extracción que el ancla. Los nombres ya vienen en minúsculas: «ASYNC» también es 'async'.
    const [modulo] = modulosDelBundle()

    expect([...modulo.keys()]).not.toContain('async')
  })
})

/** @s40 — los `<link rel="preload">` del HTML crudo cuyo `as` vale `destino` (sin distinguir mayúsculas). */
function precargasDe(destino: string): readonly Atributos[] {
  return elementos('link').filter(
    (link) => valorDe(link, 'rel') === 'preload' && valorDe(link, 'as') === destino,
  )
}

/**
 * F-04 @s40 (ENMIENDA 2) — CERO `<link rel="preload" as="image">`: las fotos son `loading="lazy"` y sin
 * `crossorigin`, así que la precarga (`crossorigin=""`) no se reutiliza y se piden ANTES de desplazarse.
 * Lo que se retira es la PRECARGA, nunca la foto. Las precargas de FUENTE siguen (su número es de F-05).
 */
describe('@s40 (F-04) el HTML crudo de producción no lleva ningún <link rel="preload" as="image">', () => {
  it('@s40 ANCLA POSITIVA: al menos 1 <link rel="preload"> lleva as="font" — la extracción SÍ ve precargas', () => {
    // Su NÚMERO no se fija aquí: es de F-05 (`cero_terceros.feature`).
    expect(precargasDe('font').length).toBeGreaterThanOrEqual(1)
  })

  it('@s40 ANCLA POSITIVA: al menos 1 <img> lleva loading="lazy" — las fotos SIGUEN horneadas', () => {
    // Cierra el atajo de «arreglar» @s40 quitando las fotos importadas. Su número no se fija.
    const perezosas = elementos('img').filter((img) => valorDe(img, 'loading') === 'lazy')

    expect(perezosas.length).toBeGreaterThanOrEqual(1)
  })

  it('@s40 exactamente 0 <link rel="preload"> llevan as="image", en cualquier orden de atributos y caja', () => {
    // Misma extracción que el ancla de fuentes; se listan los href para que un fallo diga CUÁLES.
    const deImagen = precargasDe('image').map((link) => link.get('href'))

    expect(deImagen).toEqual([])
  })
})

/**
 * @s41 — «termina en» es el FINAL de la URL, sin distinguir mayúsculas; NUNCA una subcadena: `x.woff2`
 * no termina en `.woff`, y el hash de un nombre de fichero podría contener «woff».
 */
function terminaEn(url: string, extension: string): boolean {
  return url.toLowerCase().endsWith(extension)
}

/** @s41 — los `href` de las precargas de fuente (la MISMA extracción de @s40) que terminan en `extension`. */
function precargasDeFuenteHacia(extension: string): readonly string[] {
  return precargasDe('font')
    .map((link) => link.get('href') ?? '')
    .filter((href) => terminaEn(href, extension))
}

const RUTA_ASSETS = resolve('dist/assets')

/** @s41 — los bytes de cada `.css` de `dist/assets/` que deja el build del `beforeAll`. */
function hojasDeEstilo(): readonly string[] {
  return readdirSync(RUTA_ASSETS)
    .filter((fichero) => fichero.endsWith('.css'))
    .map((fichero) => readFileSync(resolve(RUTA_ASSETS, fichero), 'utf8'))
}

/**
 * @s41 — el cuerpo de cada regla `@font-face`, y en él cada `url(…)` seguida del LITERAL `format("woff")`
 * (si el minificador cambiara sus comillas, no casa: falla CERRADA). En un `@font-face` solo el
 * descriptor `src` admite `url(…)`. La URL puede ir sin comillas (la forma de hoy), con dobles o simples.
 */
const REGLA_FONT_FACE = /@font-face\s*\{([^}]*)\}/gi
const URL_CON_FORMATO_WOFF = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^"')\s]*))\s*\)\s*format\("woff"\)/g

/** @s41 — las URL de respaldo `format("woff")` de los `@font-face` del CSS que terminan en `.woff`. */
function respaldosWoffDelCss(): readonly string[] {
  return hojasDeEstilo()
    .flatMap((css) => [...css.matchAll(REGLA_FONT_FACE)].map(([, cuerpo]) => cuerpo))
    .flatMap((cuerpo) =>
      [...cuerpo.matchAll(URL_CON_FORMATO_WOFF)].map(
        ([, dobles, simples, sinComillas]) => dobles ?? simples ?? sinComillas,
      ),
    )
    .filter((url) => terminaEn(url, '.woff'))
}

/**
 * F-04 @s41 (ENMIENDA 3, decisión del humano) — solo se PRECARGAN las fuentes `.woff2`: vite-react-ssg
 * inyecta una precarga por CADA fichero de fuente, y Chromium descargaba también los `.woff` (124 440
 * bytes) sin usarlos. Lo que se retira es la PRECARGA: el `.woff` sigue de RESPALDO en el `src` de
 * cada `@font-face` del CSS.
 */
describe('@s41 (F-04) el HTML crudo de producción solo precarga fuentes .woff2, y el CSS conserva el .woff de respaldo', () => {
  it('@s41 ANCLA POSITIVA: al menos 1 <link rel="preload" as="font"> tiene un href que termina en ".woff2"', () => {
    // MISMA extracción que la negativa. Su NÚMERO no se fija: la lista de fuentes es de F-05.
    expect(precargasDeFuenteHacia('.woff2').length).toBeGreaterThanOrEqual(1)
  })

  it('@s41 ANCLA POSITIVA: al menos 1 @font-face del CSS lleva en su src una url(…) que termina en ".woff" seguida de format("woff")', () => {
    // MISMO criterio «termina en .woff» que la negativa: si no casara nunca, la negativa pasaría en
    // VACÍO. También cae si no hay ningún .css en dist/assets/ o ninguna regla @font-face. Su número
    // no se fija: los pares de fuente son de F-05.
    expect(respaldosWoffDelCss().length).toBeGreaterThanOrEqual(1)
  })

  it('@s41 exactamente 0 <link rel="preload" as="font"> tienen un href que termina en ".woff", en cualquier orden de atributos y caja', () => {
    // Misma extracción que el 1er ancla y mismo criterio que el 2º; se listan los href para que un
    // fallo diga CUÁLES. «Termina en .woff» es el final del valor: una precarga .woff2 no cuenta.
    expect(precargasDeFuenteHacia('.woff')).toEqual([])
  })
})

/** @s42 — los módulos del bundle (la MISMA extracción de @s39) cuyo `src` es el de la app: `app-….js`. */
function modulosDeLaApp(): readonly Atributos[] {
  return modulosDelBundle().filter((script) =>
    (script.get('src') ?? '').startsWith(`${PREFIJO_DE_ASSETS}app-`),
  )
}

/**
 * @s42 — los bytes del fichero al que apunta ese módulo: se quita el prefijo y se lee bajo el
 * `dist/assets/` de ESTE build. NUNCA por glob. Si no hubiera módulo o fichero, `readFileSync` lanza.
 */
function bundleDeLaApp(): string {
  const [modulo] = modulosDeLaApp()
  const fichero = (modulo?.get('src') ?? '').slice(PREFIJO_DE_ASSETS.length)

  return readFileSync(resolve(RUTA_ASSETS, fichero), 'utf8')
}

/** @s42 — cuántas veces casa `patron` (con `g`: sin él, `matchAll` lanza) en `texto`. */
function apariciones(texto: string, patron: RegExp): number {
  return [...texto.matchAll(patron)].length
}

describe('@s42 (F-04) el build que lanza home-horneado es de producción: su bundle app-*.js no trae JSX de desarrollo ni rutas del disco', () => {
  it('@s42 ANCLA POSITIVA: hay exactamente 1 <script type="module"> cuyo src empieza por "/NailsLashStudioWeb/assets/app-" y termina en ".js"', () => {
    expect(modulosDeLaApp()).toHaveLength(1)
  })

  it('@s42 ANCLA POSITIVA: ese fichero existe, pesa más de 0 bytes y contiene "Lo que dicen nuestras clientas"', () => {
    // El literal es de la app REAL (0 veces en la mínima de trampas). Si no existiera, lanza: ROJO.
    // Se CUENTA, como en las negativas: un `toContain` fallido volcaría el bundle entero en el informe.
    const bundle = bundleDeLaApp()

    expect(bundle.length).toBeGreaterThan(0)
    expect(apariciones(bundle, /Lo que dicen nuestras clientas/g)).toBeGreaterThanOrEqual(1)
  })

  it('@s42 esos mismos bytes contienen exactamente 0 apariciones de "jsxDEV"', () => {
    expect(apariciones(bundleDeLaApp(), /jsxDEV/g)).toBe(0)
  })

  it('@s42 esos mismos bytes contienen exactamente 0 apariciones de "fileName:" seguido de una comilla (", \' o `)', () => {
    // Las tres comillas: hoy son todas `fileName:"/…"`, y un cambio de minificador no la deja en vacío.
    expect(apariciones(bundleDeLaApp(), /fileName:["'`]/g)).toBe(0)
  })
})

/**
 * @s45 — lo que sigue INMEDIATAMENTE a cada aparición de «building client environment for» en la salida
 * capturada del build, tal cual (sin filtrar ni normalizar), con el largo de « production». Es la MISMA
 * extracción para el ancla (cuántas hay) y para el 2º `Then` (qué sigue a cada una).
 */
function trasCadaModoDelLog(): readonly string[] {
  return salidaDelBuild
    .split('building client environment for')
    .slice(1)
    .map((resto) => resto.slice(0, ' production'.length))
}

describe('@s45 (F-04) el build "pnpm build" que lanza home-horneado corre en modo de Vite "production", según su propio log', () => {
  it('@s45 ANCLA POSITIVA: la salida estándar capturada del build contiene al menos 1 vez "building client environment for"', () => {
    expect(trasCadaModoDelLog().length).toBeGreaterThanOrEqual(1)
  })

  it('@s45 cada una de esas apariciones va seguida, tras un espacio, del literal "production"', () => {
    // Se listan las que NO siguen con « production», para que un fallo diga QUÉ modo trae el log.
    expect(trasCadaModoDelLog().filter((tras) => tras !== ' production')).toEqual([])
  })

  it('@s45 esa misma salida contiene exactamente 0 veces "building client environment for test"', () => {
    expect(apariciones(salidaDelBuild, /building client environment for test/g)).toBe(0)
  })
})
