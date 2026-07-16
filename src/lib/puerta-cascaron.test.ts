import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  type ArtefactoDeProduccion,
  ejecutarPuertaDelCascaron,
  type FicheroHtml,
  inspeccionarSitio,
  cabezaDe,
  canonicaDeLaPagina,
  contenidoDelTitulo,
  cuantosH1,
  descripcionDe,
  esNodo,
  extraerEnlaces,
  idsDeHeadings,
  langsDe,
  leerJsonLd,
  nodosDe,
  type PaginaArtefacto,
  rutaDelFichero,
  tiposDe,
  RUTAS_ESPERADAS,
} from './puerta-cascaron.ts'

/**
 * F-04 — la PUERTA del cascarón (decisor puro). Contrato:
 * features/cascaron_semantico.feature.
 *
 * 🔴 LA ENTRADA SON LOS BYTES DE `dist/`, NUNCA UN RENDER DEL ÁRBOL DE COMPONENTES. jsdom está
 * PROHIBIDO en estos escenarios y el porqué es más fino que «jsdom malo»: `react-helmet-async`
 * TAMBIÉN hace efecto sobre `document.head` en cliente, y React 19 TAMBIÉN hoistea su metadata
 * al hidratar → LOS DOS CAMINOS DAN VERDE EN JSDOM. jsdom es EXACTAMENTE CIEGO al único bug que
 * esta feature existe para prevenir. Testing Library aquí no es «insuficiente»: es INCAPAZ POR
 * CONSTRUCCIÓN [I sólida, sobre [V]]. Ver @s32.
 */

/** El JSON-LD del camino feliz: BeautySalon con name, address PostalAddress y geo. */
function jsonLdValido(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: 'Nails Lash Studio',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. de Atenas 75, Local 41',
      postalCode: '28232',
      addressLocality: 'Las Rozas de Madrid',
    },
    geo: { latitude: 40.5179875, longitude: -3.9226688 },
    telephone: '+34625223366',
  })
}

interface OpcionesDeFixture {
  readonly elementoHtml?: string
  readonly title?: string | null
  readonly description?: string | null
  readonly canonica?: string | null
  readonly cuantosH1?: number
  readonly landmarks?: readonly string[]
  readonly secciones?: string
  readonly jsonLd?: string | null
  readonly enlaces?: readonly string[]
}

/**
 * Construye el HTML CRUDO de una página completa y correcta, con los desperfectos que se le
 * pidan. Es una FUNCIÓN llamada DENTRO del `it`, nunca una constante del `describe`: lo que se
 * calcula en el cuerpo del `describe` corre en recolección, SIN mutante activo → supervivientes
 * FALSOS (docs/verification.md; en F-03 produjeron 189).
 */
function htmlCrudo(opciones: OpcionesDeFixture = {}): string {
  const {
    elementoHtml = '<html lang="es">',
    title = 'Nails Lash Studio · Uñas, pestañas y cejas en Las Rozas de Madrid',
    description = 'Estudio de uñas, pestañas y cejas en Las Rozas de Madrid.',
    canonica = 'https://example.invalid/',
    cuantosH1 = 1,
    landmarks = ['main', 'nav', 'footer'],
    secciones = '<section aria-labelledby="s-t"><h2 id="s-t">Servicios</h2></section>',
    jsonLd = jsonLdValido(),
    enlaces = ['/'],
  } = opciones

  const cabeza = [
    title === null ? '' : `<title>${title}</title>`,
    description === null ? '' : `<meta name="description" content="${description}" />`,
    canonica === null ? '' : `<link rel="canonical" href="${canonica}" />`,
    jsonLd === null ? '' : `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ')

  const encabezados = Array.from({ length: cuantosH1 }, () => '<h1>Nails Lash Studio</h1>').join('')
  const hrefs = enlaces.map((href) => `<a href="${href}">enlace</a>`).join('')
  const nav = landmarks.includes('nav') ? `<nav>${hrefs}</nav>` : hrefs
  const pie = landmarks.includes('footer') ? '<footer>Nails Lash Studio</footer>' : ''
  const cuerpo = `${encabezados}${secciones}`

  return `<!doctype html>
${elementoHtml}
  <head>
    ${cabeza}
  </head>
  <body>
    ${nav}
    ${landmarks.includes('main') ? `<main>${cuerpo}</main>` : cuerpo}
    ${pie}
  </body>
</html>`
}

function paginaCompleta(ruta = '/', opciones: OpcionesDeFixture = {}): PaginaArtefacto {
  return { ruta, html: htmlCrudo(opciones) }
}

describe('inspeccionarSitio → el camino feliz (@s12)', () => {
  // Sin este escenario, una puerta que devolviera una violación SIEMPRE pasaría todos los
  // escenarios negativos y rompería el build para siempre.
  it('@s12 una página completa y correcta no produce ninguna violación', () => {
    expect(inspeccionarSitio([paginaCompleta('/')], ['/'])).toEqual([])
  })
})

/**
 * A2. 🔴 LA FILA DEL `<title>` VACÍO EXISTE POR UN HALLAZGO SOBRE EL DIST INSTALADO, y explica
 * por qué la regla se formula «ausente O vacío» y no «vacío»: `extractHelmet` hace
 * `if (titleString.split(">")[1] === "</title") titleString = ""` [V: :434-436] → un
 * `<Head><title>{''}</title>` NO PRODUCE UN `<title>` VACÍO: PRODUCE NINGÚN `<title>`. EL DIST
 * BORRA EL TITLE VACÍO. Si la regla solo buscara el vacío, ESTE CASO SE ESCAPARÍA. Las dos filas
 * del title son la MISMA regla por las DOS puertas por las que entra el fallo.
 *
 * LÍMITE DECLARADO (T3): un `<title>` DUPLICADO —posible si alguien añade uno estático a
 * `index.html`, que Helmet NO deduplica [V]— NO lo caza esta regla. Ver la cabecera del .feature.
 */
describe('inspeccionarSitio → title, description y canónica (@s13)', () => {
  it.each([
    ['no hay ningún <title>', { title: null }, 'title ausente o vacío'],
    ['el <title> está presente pero vacío', { title: '' }, 'title ausente o vacío'],
    ['no hay ninguna <meta name="description">', { description: null }, 'description ausente o vacía'],
    ['la <meta name="description"> tiene content=""', { description: '' }, 'description ausente o vacía'],
    ['no hay ningún <link rel="canonical">', { canonica: null }, 'canónica ausente'],
  ])('@s13 %s → 1 violación por la regla "%s"', (_situacion, desperfecto, regla) => {
    expect(inspeccionarSitio([paginaCompleta('/', desperfecto)], ['/'])).toEqual([
      { ruta: '/', regla, valor: '' },
    ])
  })
})

/**
 * A2. LA CANÓNICA ES POR PÁGINA, y el fallo típico es que TODAS HEREDEN LA DE LA HOME. Ese fallo
 * PASA CUALQUIER TEST QUE MIRE UNA SOLA PÁGINA: la aserción es ENTRE rutas, no dentro de una.
 *
 * ⚠️ ESTE ESCENARIO NACERÍA INERTE SI SE ESCRIBIERA SOBRE EL `dist/` REAL: hoy solo hay UNA ruta
 * (`/` [V: src/App.tsx]) y dos rutas no pueden colisionar. POR ESO SE ESCRIBE CON UN FIXTURE DE
 * DOS RUTAS SOBRE EL DECISOR PURO — que es exactamente para lo que sirve un decisor puro: los
 * fixtures son gratis. Escrito de otra forma, ES TEATRO.
 * PRECEDENTE DIRECTO: `@s14` de F-03 NACIÓ INERTE Y LO CAZÓ EL JUDGE («un test verde por vacuidad
 * DENTRO del escenario que persigue el verde por vacuidad»). No repetirlo.
 */
describe('inspeccionarSitio → la canónica es POR PÁGINA (@s14)', () => {
  it('@s14 la misma canónica en dos rutas distintas produce 1 violación que nombra las dos', () => {
    const violaciones = inspeccionarSitio(
      [
        paginaCompleta('/', { canonica: 'https://example.invalid/' }),
        paginaCompleta('/servicios', { canonica: 'https://example.invalid/' }),
      ],
      ['/', '/servicios'],
    )

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0].regla).toBe('canónica repetida entre rutas distintas')
    // Nombra LAS DOS rutas: la suya en `ruta`, y la que ya la usaba en `valor`.
    expect(violaciones[0].ruta).toBe('/servicios')
    expect(violaciones[0].valor).toContain('https://example.invalid/')
    expect(violaciones[0].valor).toContain('/')
  })

  // Mata al mutante que marca SIEMPRE la canónica como repetida — con él, la prueba de arriba
  // pasaría por la razón equivocada y el build rompería siempre.
  it('@s14 dos rutas con canónica PROPIA no producen ninguna violación', () => {
    expect(
      inspeccionarSitio(
        [
          paginaCompleta('/', { canonica: 'https://example.invalid/' }),
          paginaCompleta('/servicios', { canonica: 'https://example.invalid/servicios' }),
        ],
        ['/', '/servicios'],
      ),
    ).toEqual([])
  })
})

/**
 * SEPARACIÓN DE EJES: `SC 3.1.1` (A) NO «exige lang»: exige que el idioma sea DETERMINABLE POR
 * CÓDIGO [V]. `lang` en `<html>` es H57, TÉCNICA SUFICIENTE, no la norma. Y que un `lang`
 * INCORRECTO falle es [I], no frase citable: se testea igual, pero NO se le atribuye a la norma.
 * Esa atribución es lo único prohibido.
 *
 * 🔴 LA FILA DEL DUPLICADO NO ES HIPOTÉTICA: el `lang` tiene DOS FUENTES POSIBLES. Hoy sale de
 * `index.html` (`<html lang="es">` [V]); pero `<Head>` TAMBIÉN puede inyectarlo
 * (`indexHTML.replace('<html', '<html ' + htmlAttributes)` [V: :127-128]). Si ambos existen →
 * `<html lang="xx" lang="es">`, atributo DUPLICADO. CUÁL GANA ES [NV] Y NO HACE FALTA
 * AVERIGUARLO: la decisión es UNA SOLA FUENTE (`index.html`) y la puerta asevera EXACTAMENTE UN
 * `lang`, con valor `es`. RESOLVER UNA AMBIGÜEDAD PROHIBIÉNDOLA ES MÁS BARATO QUE VERIFICARLA.
 */
describe('inspeccionarSitio → el lang (@s15)', () => {
  it.each([
    ['<html>', 'ausente: el idioma no es determinable por código', ''],
    ['<html lang="en">', 'distinto de "es"', 'en'],
    ['<html lang="">', 'vacío: no determina ningún idioma', ''],
    ['<html lang="xx" lang="es">', 'DUPLICADO: dos fuentes escribieron el atributo', 'xx, es'],
  ])('@s15 %s (%s) → 1 violación', (elementoHtml, _motivo, valor) => {
    expect(inspeccionarSitio([paginaCompleta('/', { elementoHtml })], ['/'])).toEqual([
      { ruta: '/', regla: 'lang ausente, duplicado o distinto de es', valor },
    ])
  })
})

/** Las violaciones de UNA regla concreta: los escenarios de frontera cuentan POR REGLA. */
function violacionesPorRegla(
  paginas: readonly PaginaArtefacto[],
  rutasEsperadas: readonly string[],
  regla: string,
): readonly unknown[] {
  return inspeccionarSitio(paginas, rutasEsperadas).filter((una) => una.regla === regla)
}

/**
 * ⚠️ CRITERIO DE PROYECTO, NO WCAG, y la distinción es obligatoria: `SC 1.3.1` NO EXIGE
 * «exactamente un h1». NINGUNA FRASE SOBRE EL NÚMERO DE h1 EXISTE EN TODA LA NORMA [V: fetch de
 * la página completa]. `H101`/`ARIA11`/`ARIA20` son TÉCNICAS SUFICIENTES, EN OR — no requisitos.
 * Es una BUENA REGLA y se testea igual; LO PROHIBIDO ES LA ATRIBUCIÓN NORMATIVA. Ningún test,
 * mensaje de violación ni comentario puede decir «lo exige 1.3.1».
 */
describe('inspeccionarSitio → la cuenta de h1 (@s16)', () => {
  // LAS TRES FILAS FIJAN LA FRONTERA EXACTA y matan el mutante `> 1` → `>= 1` (con él, la fila
  // de 1 h1 emitiría violación y el build se rompería siempre) y el mutante que solo mira la
  // presencia (con él, la fila de 2 pasaría).
  it.each([
    { cuantosH1: 0, cuantas: 1, frontera: 'ausente' },
    { cuantosH1: 1, cuantas: 0, frontera: 'el único caso que pasa' },
    { cuantosH1: 2, cuantas: 1, frontera: 'más de uno' },
  ])('@s16 con $cuantosH1 h1 hay exactamente $cuantas violación(es) ($frontera)', ({ cuantosH1, cuantas }) => {
    expect(
      violacionesPorRegla([paginaCompleta('/', { cuantosH1 })], ['/'], 'h1 ausente o más de uno'),
    ).toHaveLength(cuantas)
  })
})

/**
 * ⚠️ CRITERIO DE PROYECTO, NO WCAG: `SC 1.3.1` NO EXIGE LANDMARKS [V]. `ARIA11` es una TÉCNICA
 * SUFICIENTE. Buena regla, se testea igual; prohibida la atribución normativa.
 */
describe('inspeccionarSitio → los landmarks (@s17)', () => {
  // Tres filas, no una: el mutante `&&` → `||` en la conjunción de las tres presencias muere
  // aquí (con `||`, faltar UN solo landmark dejaría de emitir violación).
  it.each([['main'], ['nav'], ['footer']])(
    '@s17 sin el landmark "%s" → 1 violación que lo nombra',
    (landmark) => {
      const presentes = ['main', 'nav', 'footer'].filter((uno) => uno !== landmark)

      expect(inspeccionarSitio([paginaCompleta('/', { landmarks: presentes })], ['/'])).toEqual([
        { ruta: '/', regla: `landmark ${landmark} ausente`, valor: '' },
      ])
    },
  )
})

/**
 * ✅ ESTO SÍ ES `SC 1.3.1`, y es lo único de esta feature que lo es: UNA RELACIÓN QUE EL DISEÑO
 * COMUNICA VISUALMENTE DEBE EXISTIR EN EL CÓDIGO. El título de sección tiene que ser un heading
 * REAL referenciado por `aria-labelledby` — NO un `div` con `font-size`, que comunica «esto
 * titula esta sección» solo a quien lo VE.
 *
 * ✅ CONFIRMADA POR EL HUMANO (2026-07-16) COMO LA DÉCIMA REGLA DE VIOLACIÓN: la lista del
 * project-spec enumeraba NUEVE y esta no estaba; el gherkin_author AVISÓ en vez de colarla.
 */
describe('inspeccionarSitio → section con título en el código (@s18)', () => {
  // LA TERCERA FILA ES LA QUE MUERDE: un `aria-labelledby` que apunta a un id INEXISTENTE es
  // PEOR que no ponerlo (promete una relación que el árbol de accesibilidad no puede resolver) y
  // PASA CUALQUIER COMPROBACIÓN DE MERA PRESENCIA DEL ATRIBUTO.
  it.each([
    [
      'una <section aria-labelledby="x"> y un <h2 id="x">Servicios</h2> dentro',
      '<section aria-labelledby="x"><h2 id="x">Servicios</h2></section>',
      0,
    ],
    [
      'una <section> sin aria-labelledby, titulada con un <div class="titulo">',
      '<section><div class="titulo">Servicios</div></section>',
      1,
    ],
    [
      'una <section aria-labelledby="x"> cuyo id "x" no existe en ningún elemento',
      '<section aria-labelledby="x"><h2 id="otro">Servicios</h2></section>',
      1,
    ],
    /**
     * ✅ CUARTA FILA (aprobación humana en la puerta, 2026-07-17). Las tres de arriba PROMETÍAN
     * LO QUE NINGUNA PROBABA: la regla se llama «section sin aria-labelledby A UN HEADING REAL»
     * y ninguna distinguía un `<h2 id="x">` de un `<div id="x">` → el coladero estaba ABIERTO, y
     * era JUSTO LA FORMA QUE LA PROSA QUIERE PROHIBIR: el `div` con `font-size` le cuenta «esto
     * titula esta sección» SOLO A QUIEN LO VE.
     * Importa más que ninguna otra fila: @s18 es LA ÚNICA de las diez reglas que mide `SC 1.3.1`
     * DE VERDAD. Sin ella, el acceptance 1 NO ESTABA PROTEGIDO.
     */
    [
      '<section aria-labelledby="x"> con <div id="x">: el id resuelve a algo que NO es heading',
      '<section aria-labelledby="x"><div id="x" class="titulo">Servicios</div></section>',
      1,
    ],
  ])('@s18 %s → %i violación(es)', (_situacion, secciones, cuantas) => {
    expect(
      violacionesPorRegla(
        [paginaCompleta('/', { secciones })],
        ['/'],
        'section sin aria-labelledby a un heading real',
      ),
    ).toHaveLength(cuantas)
  })
})

/**
 * A3. 🔴 UNA PUERTA QUE SE TRAGA SU EXCEPCIÓN Y DEVUELVE `[]` ES PEOR QUE NINGUNA: es
 * LITERALMENTE cómo se evaporaron los 3 bloqueantes AA del stack base [V]. El JSON-LD roto es
 * VIOLACIÓN, con su línea en el informe; jamás un `catch` mudo.
 *
 * Que el JSON-LD llegue al `dist/` está garantizado por la vía de `<Head>`: `extractHelmet`
 * incluye `helmet.script.toString()` en `metaStrings` [V: :437-442] → un
 * `<Head><script type="application/ld+json">` SE HORNEA. Sin ese hallazgo, el contrato no podría
 * prometer JSON-LD prerenderizado.
 */
describe('inspeccionarSitio → el JSON-LD ausente o roto (@s19)', () => {
  it.each([
    ['no hay ningún <script type="application/ld+json">', null, 'JSON-LD ausente'],
    ['el <script> contiene "{ esto no es json"', '{ esto no es json', 'JSON-LD no parseable'],
    ['el <script> está vacío', '', 'JSON-LD no parseable'],
  ])('@s19 %s → 1 violación por la regla "%s"', (_situacion, jsonLd, regla) => {
    const violaciones = inspeccionarSitio([paginaCompleta('/', { jsonLd })], ['/'])

    // NO lanza ninguna excepción y NO devuelve la lista vacía.
    expect(violaciones).toHaveLength(1)
    expect(violaciones[0].ruta).toBe('/')
    expect(violaciones[0].regla).toBe(regla)
  })
})

/** El JSON-LD del camino feliz con el `@type` que se le pida (o SIN `@type`, si es `null`). */
function jsonLdConTipo(tipo: string | readonly string[] | null): string {
  const nodo = JSON.parse(jsonLdValido()) as Record<string, unknown>

  delete nodo['@type']

  return JSON.stringify(tipo === null ? nodo : { ...nodo, '@type': tipo })
}

/**
 * 🔴 UN TEST QUE HAGA `json['@type'] === 'BeautySalon'` CIERRA LOS OJOS ANTE MEDIA DOCENA DE
 * FORMAS VÁLIDAS y deja abierta la escapatoria «es que yo uso otro tipo». Ese test FALLARÍA las
 * filas 2 y 3 (un array nunca es igual a un string) → LAS FILAS DEL ARRAY SON LAS QUE FUERZAN EL
 * TIPO EFECTIVO. Mata también el mutante `===` → `!==`.
 *
 * LA JERARQUÍA REAL, literal de schema.org, con HERENCIA MÚLTIPLE [V]:
 *   Thing > Organization > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
 *   Thing > Place        > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
 * El padre DIRECTO es `HealthAndBeautyBusiness`; `LocalBusiness` es ANCESTRO. Es la RUTA DUAL lo
 * que hace válidas a la vez `address` (vía Organization) y `geo` (vía Place).
 *
 * Las filas de LocalBusiness/HealthAndBeautyBusiness/NailSalon fallan porque ESTE CONTRATO fija
 * `BeautySalon` (criterio de proyecto, respaldado por Google: «Use the most specific
 * LocalBusiness sub-type possible» [V]) — NO porque schema.org obligue: schema.org NO OBLIGA A
 * NADA [V]. Sujeto explícito, siempre.
 */
describe('inspeccionarSitio → el tipo EFECTIVO (@s20)', () => {
  it.each([
    ['"BeautySalon"', 'BeautySalon', 0],
    ['["BeautySalon"]', ['BeautySalon'], 0],
    ['["BeautySalon","Organization"]', ['BeautySalon', 'Organization'], 0],
    ['"LocalBusiness"', 'LocalBusiness', 1],
    ['"HealthAndBeautyBusiness"', 'HealthAndBeautyBusiness', 1],
    ['"NailSalon"', 'NailSalon', 1],
    ['["LocalBusiness","Organization"]', ['LocalBusiness', 'Organization'], 1],
    ['ausente', null, 1],
  ])('@s20 @type %s → %i violación(es)', (_etiqueta, tipo, cuantas) => {
    expect(
      violacionesPorRegla(
        [paginaCompleta('/', { jsonLd: jsonLdConTipo(tipo) })],
        ['/'],
        'ningún nodo con tipo efectivo BeautySalon',
      ),
    ).toHaveLength(cuantas)
  })

  // El nodo puede estar en la raíz o DENTRO DE UN `@graph`: la regla es «EXISTE UN NODO cuyo
  // tipo efectivo incluye BeautySalon», con el mismo recorrido RECURSIVO de @s22.
  it('@s20 el nodo BeautySalon dentro de un @graph no produce violación', () => {
    const enGrafo = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [JSON.parse(jsonLdValido()) as unknown],
    })

    expect(
      violacionesPorRegla(
        [paginaCompleta('/', { jsonLd: enGrafo })],
        ['/'],
        'ningún nodo con tipo efectivo BeautySalon',
      ),
    ).toHaveLength(0)
  })
})

/** El JSON-LD del camino feliz, con el desperfecto que se le aplique. */
function jsonLdModificado(estropear: (nodo: Record<string, never>) => void): string {
  const nodo = JSON.parse(jsonLdValido()) as Record<string, never>

  estropear(nodo)

  return JSON.stringify(nodo)
}

/**
 * A3. SUJETO EXPLÍCITO, ES LA REGLA MÁS CARA DE ESTE CONTRATO: `name` y `address` son
 * obligatorios PARA GOOGLE, y SOLO para la ELEGIBILIDAD DE RICH RESULT. schema.org NO OBLIGA A
 * NINGUNA PROPIEDAD: un JSON-LD con solo `@type` es VÁLIDO [V, verificado POR AUSENCIA CITABLE].
 * Ningún mensaje de violación puede decir «schema.org obliga a X»: sería FALSO. Y Google no
 * garantiza nada: «Google does not guarantee that features that consume structured data will
 * show up in search results» [V].
 *
 * LA FILA DEL `address` COMO Text ES DECISIÓN DE PROYECTO MÁS ESTRICTA QUE EL VOCABULARIO:
 * schema.org ADMITE `Text` en `address` — ese string PASARÍA su validación [V]. Exigir
 * PostalAddress es NUESTRO. (El literal de esa fila es la dirección REAL del JSON-LD del
 * cliente [V]: es exactamente la forma que NO queremos.)
 */
describe('inspeccionarSitio → name, address y geo (@s21)', () => {
  it.each([
    ['no hay campo name', (n: Record<string, never>) => delete n.name, 'JSON-LD sin name'],
    ['name es la cadena vacía', (n: Record<string, never>) => (n.name = '' as never), 'JSON-LD sin name'],
    ['no hay campo address', (n: Record<string, never>) => delete n.address, 'JSON-LD sin address'],
    [
      'address es el Text "AV.ATENAS 75 LOCAL 41 C.C.ZOCO MONTE ROZAS"',
      (n: Record<string, never>) => (n.address = 'AV.ATENAS 75 LOCAL 41 C.C.ZOCO MONTE ROZAS' as never),
      'address no es PostalAddress',
    ],
    [
      'address.streetAddress es la cadena vacía',
      (n: Record<string, never>) => ((n.address as Record<string, string>).streetAddress = ''),
      'address incompleta',
    ],
    // LAS DOS FILAS DE geo MUTAN UN SOLO DÍGITO de la constante (…875 → …876, …688 → …680):
    // anclan que el valor se compara EXACTO. La constante NUNCA se recalcula ni se «corrige»
    // desde OSM — está verificada a nivel de EDIFICIO, jamás de «Local 41».
    [
      'geo.latitude es 40.5179876',
      (n: Record<string, never>) => ((n.geo as Record<string, number>).latitude = 40.5179876),
      'geo distinto de la constante',
    ],
    [
      'geo.longitude es -3.9226680',
      (n: Record<string, never>) => ((n.geo as Record<string, number>).longitude = -3.922668),
      'geo distinto de la constante',
    ],
    ['no hay campo geo', (n: Record<string, never>) => delete n.geo, 'geo ausente'],
  ])('@s21 %s → 1 violación por la regla "%s"', (_situacion, estropear, regla) => {
    const violaciones = inspeccionarSitio(
      [paginaCompleta('/', { jsonLd: jsonLdModificado(estropear) })],
      ['/'],
    )

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0].ruta).toBe('/')
    expect(violaciones[0].regla).toBe(regla)
  })
})

/** Un JSON-LD con `@graph`: el BeautySalon válido, más los nodos que se le añadan. */
function jsonLdConGrafo(...nodosExtra: readonly unknown[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [JSON.parse(jsonLdValido()) as unknown, ...nodosExtra],
  })
}

/**
 * 🔴 T-6, Y SU PORQUÉ SE ESCRIBE EN TRES CAPAS PORQUE SON TRES HECHOS DISTINTOS:
 *   (a) PROHIBICIÓN — Google, *Technical guidelines*: «Don't aggregate reviews or ratings from
 *       other websites», encabezado por «Warning: If your site violates one or more of these
 *       guidelines, then Google may take MANUAL ACTION against it» [V]. El 4,9 · 1.231 de las
 *       filas VIVE EN TREATWELL — OTRO SITIO. ESTA es la cita que aplica.
 *   (b) INUTILIDAD — una página con LocalBusiness/subtipo que puntúa sobre sí misma es
 *       «ineligible for star review feature» [V]: CERO *upside* en SERP.
 *   (c) FALTA DE TÍTULO — Treatwell cl. 4.2.2: el salón NO TIENE DERECHO sobre las reseñas [V].
 *       NO es «prohibido republicar»: es que NO HAY LICENCIA. Escribirlo como prohibición
 *       expresa SERÍA INVENTAR.
 * (a) Y (c) SOSTIENEN LA DECISIÓN POR SEPARADO: si mañana Google derogase la regla
 * *self-serving*, (a) y (c) siguen vivos. Eso hace la decisión ROBUSTA.
 *
 * ❌ PROHIBIDA la redacción «Google prohíbe aggregateRating self-serving», en el Gherkin, en el
 * código y en los mensajes: eso es INELEGIBILIDAD, NO PROHIBICIÓN, y la FAQ OFICIAL LO REFUTA
 * («No, you don't need to remove them» / «You won't get a manual action just for this») [V]. Es
 * REFUTABLE CON UNA FUENTE OFICIAL Y HUNDIRÍA LA CREDIBILIDAD DEL CONTRATO ENTERO.
 */
describe('inspeccionarSitio → reseñas prohibidas a CUALQUIER profundidad (@s22)', () => {
  const conAggregateRating = { '@type': 'Service', aggregateRating: { ratingValue: 4.9, reviewCount: 1231 } }

  // 🔴 LAS FILAS ANIDADAS SON LA RAZÓN DE SER DE ESTE ESCENARIO: `aggregateRating` puede
  // REAPARECER DENTRO DE UN `Service`/`Offer` DEL `@graph` → RECORRIDO RECURSIVO, NUNCA
  // COMPROBACIÓN DE PRIMER NIVEL. EL MUTANTE QUE CORTA LA RECURSIÓN DEBE MORIR AQUÍ, y SIN
  // FIXTURE NEGATIVO ANIDADO SOBREVIVE — es la lección literal de F-03.
  it.each([
    [
      'el nodo raíz tiene aggregateRating { ratingValue: 4.9, reviewCount: 1231 }',
      () => jsonLdModificado((n) => (n.aggregateRating = { ratingValue: 4.9, reviewCount: 1231 } as never)),
      'aggregateRating',
    ],
    [
      'el @graph contiene un Service que tiene aggregateRating',
      () => jsonLdConGrafo(conAggregateRating),
      'aggregateRating',
    ],
    [
      'el @graph contiene un Service con un Offer anidado que tiene aggregateRating',
      () => jsonLdConGrafo({ '@type': 'Service', offers: { '@type': 'Offer', aggregateRating: { ratingValue: 4.9 } } }),
      'aggregateRating',
    ],
    [
      'el nodo raíz tiene review: [ { "@type": "Review" } ]',
      () => jsonLdModificado((n) => (n.review = [{ '@type': 'Review' }] as never)),
      'review',
    ],
    [
      'el @graph contiene un Service que tiene review: [ { "@type": "Review" } ]',
      () => jsonLdConGrafo({ '@type': 'Service', review: [{ '@type': 'Review' }] }),
      'review',
    ],
    [
      'el nodo raíz tiene ratingValue: 4.9 SUELTO, sin envoltorio',
      () => jsonLdModificado((n) => (n.ratingValue = 4.9 as never)),
      'ratingValue',
    ],
    [
      'el nodo raíz tiene reviewCount: 1231 SUELTO, sin envoltorio',
      () => jsonLdModificado((n) => (n.reviewCount = 1231 as never)),
      'reviewCount',
    ],
  ])('@s22 %s → al menos 1 violación que declara la ruta del nodo', (_situacion, construir, clave) => {
    const violaciones = violacionesPorRegla(
      [paginaCompleta('/', { jsonLd: construir() })],
      ['/'],
      'reseñas prohibidas en el JSON-LD',
    ) as { ruta: string; valor: string }[]

    expect(violaciones.length).toBeGreaterThanOrEqual(1)
    expect(violaciones[0].ruta).toBe('/')
    expect(violaciones[0].valor).toContain(clave)
  })

  // La RUTA DEL NODO dentro del JSON-LD: sin ella el informe no dice DÓNDE está la reseña, y a
  // las 3 de la mañana nadie la busca a mano en un @graph anidado.
  it('@s22 la violación declara la RUTA del nodo dentro del JSON-LD, no solo la clave', () => {
    const violaciones = violacionesPorRegla(
      [
        paginaCompleta('/', {
          jsonLd: jsonLdConGrafo({ '@type': 'Service', offers: { '@type': 'Offer', aggregateRating: { ratingValue: 4.9 } } }),
        }),
      ],
      ['/'],
      'reseñas prohibidas en el JSON-LD',
    ) as { valor: string }[]

    expect(violaciones[0].valor).toContain('@graph')
    expect(violaciones[0].valor).toContain('offers')
  })

  // SIN ESCAPATORIA POR LA CAJA: `review`/`Review` es la misma clave prohibida (@s9).
  it('@s22 la comparación de la clave prohibida es INSENSIBLE A LA CAJA', () => {
    expect(
      violacionesPorRegla(
        [paginaCompleta('/', { jsonLd: jsonLdModificado((n) => (n.AggregateRating = { ratingValue: 4.9 } as never)) })],
        ['/'],
        'reseñas prohibidas en el JSON-LD',
      ).length,
    ).toBeGreaterThanOrEqual(1)
  })
})

/**
 * ✅ A-19 CERRADA POR EL HUMANO (2026-07-16): el horario NO entra en F-04 — es de F-10. Pero
 * F-04 SÍ FIJA LA REGLA, y este escenario es el mecanismo por el que la fija.
 *
 * 🔴 POR QUÉ ESTA REGLA EXISTE HOY, SI F-04 NO EMITE HORARIO: `openingHours` y
 * `openingHoursSpecification` COEXISTEN y AMBAS son válidas por ramas distintas de schema.org
 * [V]. SI EL CONTRATO NO FIJA CUÁL, DOS IMPLEMENTADORES ELIGEN DISTINTO Y AMBOS PASAN LOS TESTS.
 * Google solo recomienda `openingHoursSpecification` [V] → se fija ESA y se PROHÍBE
 * `openingHours`.
 *
 * ⚠️ PARA F-10: esta regla es TUYA y ya está en verde. Emite `openingHoursSpecification` desde
 * el `HORARIO` de la fuente única (F-02) y NUNCA `openingHours`.
 */
describe('inspeccionarSitio → el horario, la regla que hereda F-10 (@s35)', () => {
  it.each([
    ['no hay ni openingHours ni openingHoursSpecification (ES EL ESTADO DE F-04 HOY)', {}, 0],
    ['hay openingHours (la clave PROHIBIDA)', { openingHours: 'Mo-Fr 10:00-20:00' }, 1],
    [
      'hay openingHoursSpecification (la forma ELEGIDA: la que F-10 deberá emitir)',
      { openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification' }] },
      0,
    ],
    // LA 4ª FILA ES LA QUE MÁS IMPORTA Y LA QUE MÁS FÁCIL SE OLVIDA: LA MEZCLA. Emitir las dos es
    // «válido» para schema.org y es DOS FUENTES DE VERDAD PARA EL MISMO HECHO, que es justo lo
    // que I-7 existe para prohibir. Divergen en silencio.
    [
      'hay openingHours Y openingHoursSpecification a la vez (LA MEZCLA: dos fuentes de verdad)',
      { openingHours: 'Mo-Fr 10:00-20:00', openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification' }] },
      1,
    ],
  ])('@s35 %s → %i violación(es)', (_situacion, horario, cuantas) => {
    expect(
      violacionesPorRegla(
        [paginaCompleta('/', { jsonLd: jsonLdModificado((n) => Object.assign(n, horario)) })],
        ['/'],
        'horario: solo openingHoursSpecification, nunca openingHours, jamás las dos',
      ),
    ).toHaveLength(cuantas)
  })
})

/**
 * A-17, CERRADA POR EL HUMANO. ES LA ENTREGA CENTRAL DE F-04 Y SUSTITUYE AL ACCEPTANCE 3 VIEJO,
 * que era insostenible: «responde 200» es NECESARIO PERO NO SUFICIENTE —
 * `/es/confidentiality_ws` del cliente RESPONDE 200 Y ES JURÍDICAMENTE NULO [V]— y F-04 NO PUEDE
 * PROMETER UN AVISO LEGAL CONFORME porque NO EXISTEN RAZÓN SOCIAL NI NIF VÁLIDO [V].
 * ESTA PUERTA ES MÁS FUERTE que «/aviso-legal responde 200»: cubre TODOS los enlaces, no uno; se
 * puede testear HOY, sin red; y NO PROMETE NADA LEGAL.
 *
 * AQUÍ SE ASEVERA EL EJE «PERMANENTE» DE LA LSSI art. 10.1, Y ES LA MITAD DE LA LECCIÓN:
 * *permanente* es TEMPORAL (disponible siempre en el tiempo), NO ESPACIAL («en todas las
 * páginas», que NO ESTÁ EN LA LEY [V: 0 ocurrencias en el estatuto entero]). Un test que solo
 * verificara «el enlace está en el pie de las N páginas» daría VERDE MIENTRAS SE INCUMPLE DE
 * VERDAD y ROJO EN UN CASO LÍCITO (art. 10.2: «su página O sitio»). ES EXACTAMENTE EL 404 DEL
 * CLIENTE: EL ENLACE ESTÁ EN EL PIE, Y EL DESTINO NO EXISTE. Por eso se asevera CONTRA EL DESTINO.
 *
 * EL PIE DE F-04 NO EMITE ENLACES LEGALES TODAVÍA (A-17): las rutas, los enlaces y el contenido
 * legal son F-16. Suena incómodo y es lo correcto — un pie que enlaza a la nada ES el bug del
 * cliente. Cuando F-16 se desbloquee, los enlaces aparecerán CON DESTINO REAL, y esta puerta hace
 * ESTRUCTURALMENTE IMPOSIBLE que aparezcan sin él.
 */
describe('inspeccionarSitio → la puerta ANTI-404 (@s23, @s24)', () => {
  it.each([
    ['/aviso-legal', 'ES LITERALMENTE EL BUG DEL CLIENTE: hoy su /es/aviso-legal da 404 [V]'],
    ['/servicios', 'ruta no prerenderizada: el enlace apunta a la nada'],
    ['/Aviso-Legal', 'no existe: la resolución de rutas del artefacto no es un juego de cajas'],
  ])('@s23 un enlace a "%s" sin fichero en dist/ → 1 violación que declara el href (%s)', (href) => {
    // El artefacto contiene ÚNICAMENTE dist/index.html → la única ruta que existe es "/".
    expect(inspeccionarSitio([paginaCompleta('/', { enlaces: ['/', href] })], ['/'])).toEqual([
      { ruta: '/', regla: 'href interno sin fichero en dist/', valor: href },
    ])
  })

  /**
   * La aseveración del NEGATIVO, y no es decorativa: SIN ELLA, LA PUERTA ANTI-404 NACE ROTA O
   * NACE LAXA. Rota si trata los externos como rutas internas (rompería el build por el enlace
   * REAL de Facebook, que la fuente única ya emite [V: src/lib/site.ts]). Laxa si «no es
   * interno» se implementa como «no empieza por `/`», que dejaría pasar cualquier cosa.
   * `example.invalid` es TLD reservado (RFC 2606): el mailto NO es un dato del cliente, es un
   * fixture. EL EMAIL REAL NO SE PUBLICA (A-11).
   */
  it.each([
    ['/', 'la home EXISTE: dist/index.html'],
    ['https://www.facebook.com/nailslashstudiorozas/', 'externo: fuera del artefacto (dato real, F-02)'],
    ['tel:+34625223366', 'no es una ruta'],
    ['mailto:info@example.invalid', 'no es una ruta'],
    ['#servicios', 'ancla dentro de la misma página'],
  ])('@s24 un enlace a "%s" no produce violación anti-404 (%s)', (href) => {
    expect(
      violacionesPorRegla(
        [paginaCompleta('/', { enlaces: [href] })],
        ['/'],
        'href interno sin fichero en dist/',
      ),
    ).toEqual([])
  })
})

/**
 * LA PUERTA ACUSA, NO GRUÑE (precedente F-01/F-03): «hay un problema de SEO» sin decir en qué
 * ruta ni qué regla obliga a buscarlo a mano — y a las 3 de la mañana nadie lo busca: LO SALTA.
 * DETERMINISMO: misma entrada → misma salida, MISMO ORDEN. El informe tiene que ser DIFFABLE, o
 * el ruido lo vuelve invisible.
 */
describe('inspeccionarSitio → el informe (@s25)', () => {
  function sitioConTresFallos(): PaginaArtefacto[] {
    return [
      paginaCompleta('/', { title: null, canonica: null }),
      paginaCompleta('/servicios', { cuantosH1: 0, canonica: 'https://example.invalid/servicios' }),
    ]
  }

  // TRES violaciones y no una: cada infracción es independiente y el informe las acusa TODAS. Un
  // `else if` en vez de dos `if` independientes deja una sin acusar (precedente F-01/@s23).
  it('@s25 hay exactamente 3 violaciones: 2 de la home y 1 de /servicios', () => {
    expect(inspeccionarSitio(sitioConTresFallos(), ['/', '/servicios'])).toHaveLength(3)
  })

  it('@s25 cada violación nombra su ruta, su regla y el valor encontrado', () => {
    for (const violacion of inspeccionarSitio(sitioConTresFallos(), ['/', '/servicios'])) {
      expect(violacion.ruta).not.toBe('')
      expect(violacion.regla).not.toBe('')
      expect(violacion).toHaveProperty('valor')
    }
  })

  it('@s25 inspeccionar el MISMO sitio dos veces da listas idénticas y EN EL MISMO ORDEN', () => {
    expect(inspeccionarSitio(sitioConTresFallos(), ['/', '/servicios'])).toEqual(
      inspeccionarSitio(sitioConTresFallos(), ['/', '/servicios']),
    )
  })
})

/**
 * LA PUERTA (el que decide el código de salida). Los dobles HONRAN EL CONTRATO DEL PUERTO:
 * `listarHtml` LANZA si el directorio no existe, que es lo que hace `readdirSync`. Un doble que
 * devolviera [] en vez de lanzar haría pasar @s26 con producción rota, informando por la rama
 * equivocada — es la lección literal de @s20 de F-01.
 */
function artefactoCon(...ficheros: readonly FicheroHtml[]): ArtefactoDeProduccion {
  return { existe: () => true, listarHtml: () => ficheros }
}

function artefactoInexistente(): ArtefactoDeProduccion {
  return {
    existe: () => false,
    listarHtml: () => {
      throw new Error("ENOENT: no such file or directory, scandir 'dist'")
    },
  }
}

function ficheroDe(ubicacion: string, opciones: OpcionesDeFixture = {}): FicheroHtml {
  return { ubicacion, contenido: htmlCrudo(opciones) }
}

/**
 * A5 + la guarda anti-«verde por vacuidad» (A-8 en F-01, @s14 en F-03; AQUÍ ES OBLIGATORIA).
 * SIN ESTO: `dist/` vacío → 0 páginas → 0 violaciones → build VERDE → «protegidos». 0 FALLOS
 * SOBRE 0 PÁGINAS NO ES ESTAR PROTEGIDO: ES NO HABER MIRADO.
 * `RUTAS_ESPERADAS` DECLARADA ES MEJOR QUE UN MÍNIMO MÁGICO: crece con las rutas y nadie tiene
 * que acordarse de subir un número.
 * ES EL MODO DE FALLO MÁS PROBABLE DE ESTA PUERTA: se ejecuta DESPUÉS del build (como F-01 y
 * F-03 [V: package.json]), y un build que no generó nada la dejaría escaneando el vacío.
 */
describe('ejecutarPuertaDelCascaron → la guarda de las rutas esperadas (@s26)', () => {
  it.each([
    ['el directorio dist/ no existe', artefactoInexistente, ['/', '/servicios']],
    ['dist/ existe pero no contiene ningún fichero HTML', () => artefactoCon(), ['/', '/servicios']],
    [
      'dist/ contiene index.html pero no contiene servicios/index.html',
      () => artefactoCon(ficheroDe('dist/index.html')),
      ['/', '/servicios'],
    ],
  ])('@s26 %s → exit != 0 y la salida declara la ruta que no encontró', (_situacion, construir, rutasEsperadas) => {
    const resultado = ejecutarPuertaDelCascaron({
      artefacto: construir(),
      rutasEsperadas,
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('/servicios')
    expect(resultado.lineas.length).toBeGreaterThan(0)
  })
})

/**
 * El mutante «vaciar `RUTAS_ESPERADAS`» DEBE ROMPER. Sin este escenario, la guarda de @s26 SE
 * DESACTIVA SOLA: con la lista vacía, «una HTML por cada ruta esperada» se satisface VACUAMENTE
 * y la puerta pasa sin inspeccionar nada. ES LA GUARDA DE LA GUARDA — y es exactamente la trampa
 * que @s14 de F-03 tardó un judge en descubrir: un verde por vacuidad DENTRO del escenario que
 * persigue el verde por vacuidad.
 */
describe('ejecutarPuertaDelCascaron → la guarda de la guarda (@s27)', () => {
  it('@s27 con la lista de rutas esperadas vacía → exit != 0 y lo declara', () => {
    const resultado = ejecutarPuertaDelCascaron({
      artefacto: artefactoCon(ficheroDe('dist/index.html')),
      rutasEsperadas: [],
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('rutas esperadas')
    expect(resultado.lineas.length).toBeGreaterThan(0)
  })
})

/**
 * A5, y EL OBJETO VIGILADO NO ES EL SITIO: ES EL EXTRACTOR. Que la puerta anti-404 (@s23)
 * informe «0 enlaces rotos» habiendo mirado 0 ENLACES es exactamente el mismo verde por vacuidad
 * de @s26, un nivel más abajo: un extractor que deja de casar hace que la puerta pase
 * «protegidos» sin haber mirado ni un enlace. La guarda cuenta TODOS los href extraídos
 * (internos, externos, `tel:`, anclas), porque lo que detecta es que EL EXTRACTOR ESTÁ ROTO, no
 * que el sitio tenga pocos enlaces.
 */
describe('ejecutarPuertaDelCascaron → la guarda del extractor (@s28)', () => {
  it('@s28 un dist/ cuya index.html no tiene ni un href → exit != 0 y lo declara', () => {
    const resultado = ejecutarPuertaDelCascaron({
      artefacto: artefactoCon(ficheroDe('dist/index.html', { enlaces: [] })),
      rutasEsperadas: ['/'],
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('ningún enlace')
  })

  // La guarda cuenta TODOS los href, no solo los internos: un artefacto cuyo único enlace es
  // externo SÍ demuestra que el extractor funciona.
  it('@s28 la guarda cuenta TODOS los href, también los externos y los tel:', () => {
    const resultado = ejecutarPuertaDelCascaron({
      artefacto: artefactoCon(ficheroDe('dist/index.html', { enlaces: ['tel:+34625223366'] })),
      rutasEsperadas: ['/'],
    })

    expect(resultado.codigoSalida).toBe(0)
  })
})

/**
 * Modos de error (derivación de D-9/I-8, [I], igual que F-01 y F-03). UNA PUERTA QUE SE TRAGA SU
 * PROPIA EXCEPCIÓN Y DEVUELVE `[]` ES PEOR QUE NO TENER PUERTA, PORQUE ADEMÁS DA CONFIANZA. Es
 * literalmente cómo se evaporaron los 3 bloqueantes AA del stack base [V]. ANTE LA DUDA: BUILD
 * ROTO, NUNCA BUILD VERDE. Si la puerta puede fallar en silencio, D-9 es falsa.
 */
describe('ejecutarPuertaDelCascaron → falla cerrada si ella misma revienta (@s29)', () => {
  const MOTIVO = 'EACCES: permission denied'

  it('@s29 si la lectura de un fichero lanza → exit != 0 y declara que no pudo completar', () => {
    const resultado = ejecutarPuertaDelCascaron({
      artefacto: {
        existe: () => true,
        listarHtml: () => {
          throw new Error(MOTIVO)
        },
      },
      rutasEsperadas: ['/'],
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('no pudo completar la inspección')
    // ANCLA LA CAUSA CONCRETA, no solo la frase: es el superviviente REAL que la mutación
    // destapó en `puerta.ts` de F-01 (un motivo vaciado cumplía «...contenga la frase»).
    expect(resultado.lineas.join('\n')).toContain(MOTIVO)
  })
})

/** Sin el camino feliz, una puerta que rompiera SIEMPRE pasaría todos los escenarios negativos. */
describe('ejecutarPuertaDelCascaron → el camino feliz (@s30)', () => {
  it('@s30 un dist/ con una HTML por cada ruta esperada y todo correcto → exit 0, 0 violaciones', () => {
    const resultado = ejecutarPuertaDelCascaron({
      artefacto: artefactoCon(
        ficheroDe('dist/index.html', { canonica: 'https://example.invalid/' }),
        ficheroDe('dist/servicios/index.html', { canonica: 'https://example.invalid/servicios' }),
      ),
      rutasEsperadas: ['/', '/servicios'],
    })

    expect(resultado.codigoSalida).toBe(0)
    expect(resultado.lineas).toEqual([])
  })
})

/**
 * Precedente F-01/@s14 y F-03: LA FUNCIÓN ES PURA; EL `exit != 0` VIVE EN LA PUERTA, y la puerta
 * se engancha SOLO a `pnpm build` de producción, DESPUÉS de `vite-react-ssg build`. `dev` NO la
 * invoca: LA PUERTA SEPARA «VER» DE «PUBLICAR». En local una cáscara a medias es legítima — es
 * para ver el diseño.
 */
describe('la puerta está enganchada al build de PRODUCCIÓN, y NO al de desarrollo (@s31)', () => {
  function scripts(): Record<string, string> {
    return (JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> })
      .scripts
  }

  it('@s31 el script "build" invoca la puerta del cascarón DESPUÉS de vite-react-ssg build', () => {
    const build = scripts().build

    expect(build).toContain('tools/puerta-cascaron.ts')
    expect(build.indexOf('vite-react-ssg build')).toBeLessThan(build.indexOf('tools/puerta-cascaron.ts'))
  })

  it.each([['dev'], ['dev:ssr']])('@s31 el script "%s" NO invoca la puerta del cascarón', (guion) => {
    expect(scripts()[guion]).not.toContain('puerta-cascaron')
  })
})

/**
 * `RUTAS_ESPERADAS` DECLARADA ES MEJOR QUE UN MÍNIMO MÁGICO: crece con las rutas y nadie tiene
 * que acordarse de subir un número. Pero SI NINGÚN TEST LA FIJA, vaciarla no pondría rojo nada y
 * DESACTIVARÍA LA GUARDA DE @s26 EN EL BUILD REAL (es la deuda 2 que el judge encontró en F-03
 * con `MINIMO_DE_PARES`). Se ancla contra un LITERAL ESCRITO A MANO, no contra el símbolo
 * importado: eso sería tautología.
 */
describe('RUTAS_ESPERADAS está anclada (@s26, @s27)', () => {
  it('@s26 las rutas esperadas del sitio real son exactamente ["/"] — hoy solo existe la home', () => {
    expect([...RUTAS_ESPERADAS]).toEqual(['/'])
  })

  it('@s27 RUTAS_ESPERADAS no está vacía: si lo estuviera, la guarda de @s26 se desactivaría', () => {
    expect(RUTAS_ESPERADAS.length).toBeGreaterThan(0)
  })
})

/**
 * LOS EXTRACTORES, PROBADOS DIRECTAMENTE.
 *
 * Los escenarios ejercitan la puerta de punta a punta, y eso deja los extractores probados SOLO
 * por la ruta feliz: la mutación destapó que su ROBUSTEZ (la caja, el espaciado, los atributos
 * de más, lo que no es un objeto) no la fijaba NADIE. Un extractor que deja de casar hace que la
 * puerta pase «protegidos» sin haber mirado — el mismo verde por vacuidad de @s28, un nivel más
 * abajo. Precedente literal: F-03 probó `extraerTokens` y `hexARgb` directamente, por esto mismo.
 *
 * El HTML del dist viene MINIFICADO y con atributos que no controlamos: `data-rh="true"` lo pone
 * Helmet [V: dist/index.html real]. Un extractor que exigiera `<title>` exacto no casaría NADA.
 */
describe('los extractores del HTML CRUDO, probados directamente', () => {
  it.each([
    ['<head><title>Hola</title></head>', 'Hola'],
    ['<head><title data-rh="true">Hola</title></head>', 'Hola'],
    ['<head><TITLE>Hola</TITLE></head>', 'Hola'],
    ['<head><title>\n  Hola\n</title></head>', 'Hola'],
    ['<head></head>', null],
  ])('contenidoDelTitulo(%j) es %j', (html, esperado) => {
    expect(contenidoDelTitulo(cabezaDe(html))).toBe(esperado)
  })

  it.each([
    ['<head><meta name="description" content="Hola"></head>', 'Hola'],
    ['<head><meta content="Hola" name="description"></head>', 'Hola'],
    ['<head><meta NAME="Description" content="Hola"></head>', 'Hola'],
    ['<head><meta name = "description" content = "Hola"></head>', 'Hola'],
    ['<head><meta name="description" content=""></head>', ''],
    ['<head><meta name="description"></head>', ''],
    ['<head><meta name="viewport" content="x"></head>', null],
    ['<head></head>', null],
  ])('descripcionDe(%j) es %j', (html, esperado) => {
    expect(descripcionDe(cabezaDe(html))).toBe(esperado)
  })

  it.each([
    [
      '<head><link rel="canonical" href="https://example.invalid/"></head>',
      'https://example.invalid/',
    ],
    [
      '<head><link href="https://example.invalid/" rel="canonical"></head>',
      'https://example.invalid/',
    ],
    [
      '<head><link REL="Canonical" href="https://example.invalid/"></head>',
      'https://example.invalid/',
    ],
    ['<head><link rel="canonical"></head>', ''],
    ['<head><link rel="stylesheet" href="/a.css"></head>', null],
    ['<head></head>', null],
  ])('canonicaDeLaPagina(%j) es %j', (html, esperado) => {
    expect(canonicaDeLaPagina(cabezaDe(html))).toBe(esperado)
  })

  // El extractor de atributos devuelve '' cuando la etiqueta existe SIN el atributo pedido, y
  // null cuando la etiqueta no existe. Son casos distintos y la regla los trata igual («ausente
  // O vacía»), pero el `?? ''` no lo fijaba ningún test: sin él, la puerta reventaría.
  it('descripcionDe distingue «no hay meta» (null) de «meta sin content» ("")', () => {
    expect(descripcionDe(cabezaDe('<head></head>'))).toBeNull()
    expect(descripcionDe(cabezaDe('<head><meta name="description"></head>'))).toBe('')
  })

  it('canonicaDeLaPagina distingue «no hay link» (null) de «link sin href» ("")', () => {
    expect(canonicaDeLaPagina(cabezaDe('<head></head>'))).toBeNull()
    expect(canonicaDeLaPagina(cabezaDe('<head><link rel="canonical"></head>'))).toBe('')
  })

  // 🔴 `cabezaDe` ES LA MITAD DE LA FEATURE (@s32): sin ella la puerta encuentra el `<title>`
  // que React 19 emite EN EL BODY y da el build por bueno.
  it.each([
    ['<html><head><title>x</title></head><body><h1>y</h1></body></html>', true],
    ['<html><head></head><body><title>x</title></body></html>', false],
    ['<html><body><title>x</title></body></html>', false],
  ])('cabezaDe(%j) aisla el head del body: hay title en el head = %s', (html, headTieneTitulo) => {
    expect(/<title/i.test(cabezaDe(html))).toBe(headTieneTitulo)
  })

  it('cabezaDe devuelve "" si no hay head: todas las reglas del head acusan (@s33)', () => {
    expect(cabezaDe('<html><body><h1>x</h1></body></html>')).toBe('')
  })

  it('cabezaDe casa el head aunque lleve atributos', () => {
    expect(cabezaDe('<html><head lang="es"><title>x</title></head></html>')).toContain('<title>')
  })

  it.each([
    ['<html lang="es">', ['es']],
    ['<html>', []],
    ['<html lang="xx" lang="es">', ['xx', 'es']],
    ['<html LANG="es">', ['es']],
    ['<html lang = "es">', ['es']],
    ['<html data-x="1" lang="es" class="y">', ['es']],
    // El `lang` de un elemento del BODY no es el del documento: solo cuenta el de <html>.
    ['<html lang="es"><body><p lang="en">x</p></body></html>', ['es']],
  ])('langsDe(%j) es %j', (html, esperado) => {
    expect(langsDe(html)).toEqual(esperado)
  })

  it.each([
    ['<h1>x</h1>', 1],
    ['', 0],
    ['<h1>a</h1><h1>b</h1>', 2],
    ['<H1>x</H1>', 1],
    ['<h1 class="hero">x</h1>', 1],
    // El `\b` NO es decorativo: sin el, <h10> contaria como h1.
    ['<h10>x</h10>', 0],
  ])('cuantosH1(%j) es %i', (html, esperado) => {
    expect(cuantosH1(html)).toBe(esperado)
  })

  it.each([
    ['<a href="/">x</a>', ['/']],
    ['<a class="c" href="/a" data-x="1">x</a>', ['/a']],
    ['<a HREF="/a">x</a>', ['/a']],
    ['<a href="/a">x</a><a href="tel:+34625223366">y</a>', ['/a', 'tel:+34625223366']],
    ['<a>sin href</a>', []],
    ['', []],
    // El `\b`: <article> NO es un enlace.
    ['<article href="/no">x</article>', []],
  ])('extraerEnlaces(%j) es %j', (html, esperado) => {
    expect(extraerEnlaces(html)).toEqual(esperado)
  })

  it.each([
    ['dist/index.html', '/'],
    ['dist/servicios/index.html', '/servicios'],
    ['dist/aviso-legal/index.html', '/aviso-legal'],
  ])('rutaDelFichero(%j) es %j', (ubicacion, esperado) => {
    expect(rutaDelFichero(ubicacion)).toBe(esperado)
  })

  // 🔴 SOLO los ids que cuelgan de un HEADING REAL (h1…h6): es lo que hace que @s18 mida
  // `SC 1.3.1` de verdad. Un `div` con id NO titula nada para quien no ve.
  it.each([
    ['<section aria-labelledby="x"><h2 id="x">T</h2></section>', ['x']],
    ['<h1 id="a">A</h1><h6 id="b">B</h6>', ['a', 'b']],
    ['<h2>sin id</h2>', []],
    ['<h2 ID="a">A</h2>', ['a']],
    ['<h2 class="t" id="a" data-x="1">A</h2>', ['a']],
    ['<div id="a">A</div>', []],
    ['<p id="a">A</p>', []],
    // h7 NO existe: el rango es h1..h6 y nada mas.
    ['<h7 id="a">A</h7>', []],
  ])('idsDeHeadings(%j) es %j', (html, esperado) => {
    expect([...idsDeHeadings(html)]).toEqual(esperado)
  })
})

/**
 * EL RECORRIDO DEL JSON-LD, probado directamente. Es el corazon de @s20/@s21/@s22/@s35: si
 * `esNodo` o `tiposDe` se rompen, la puerta deja de ver nodos y pasa «protegidos» — o revienta.
 */
describe('el recorrido del JSON-LD, probado directamente', () => {
  it.each([
    [{}, true],
    [{ a: 1 }, true],
    // 🔴 `typeof null === 'object'` [V]: sin el `!== null`, un `null` del JSON-LD se trataria
    // como nodo y `Object.entries(null)` REVENTARIA la puerta.
    [null, false],
    [[], false],
    [[1, 2], false],
    ['texto', false],
    [42, false],
    [undefined, false],
  ])('esNodo(%j) es %s', (valor, esperado) => {
    expect(esNodo(valor)).toBe(esperado)
  })

  it.each([
    [{ '@type': 'BeautySalon' }, ['BeautySalon']],
    [{ '@type': ['BeautySalon'] }, ['BeautySalon']],
    [{ '@type': ['BeautySalon', 'Organization'] }, ['BeautySalon', 'Organization']],
    [{}, []],
    [{ '@type': null }, []],
    [{ '@type': 42 }, []],
    // Un `@type` con basura NO tumba el recorrido: se queda con los strings.
    [{ '@type': ['BeautySalon', 42, null] }, ['BeautySalon']],
  ])('tiposDe(%j) es %j', (nodo, esperado) => {
    expect(tiposDe(nodo as Record<string, unknown>)).toEqual(esperado)
  })

  it('nodosDe recorre raiz, @graph y anidados, y les pone su RUTA', () => {
    expect(
      nodosDe({ '@graph': [{ '@type': 'Service', offers: { '@type': 'Offer' } }] }).map(
        (localizado) => localizado.ruta,
      ),
    ).toEqual(['$', '$.@graph[0]', '$.@graph[0].offers'])
  })

  it('nodosDe no revienta con null ni con primitivos dentro', () => {
    expect(
      nodosDe({ a: null, b: 'x', c: 1, d: [null, 'y'] }).map((localizado) => localizado.ruta),
    ).toEqual(['$'])
  })

  it.each([
    ['<script type="application/ld+json">{"a":1}</script>', 'leido'],
    ['<script type="application/ld+json">  {"a":1}  </script>', 'leido'],
    ['<script data-rh="true" type="application/ld+json">{"a":1}</script>', 'leido'],
    ['<script type="application/ld+json"></script>', 'roto'],
    ['<script type="application/ld+json">{ no</script>', 'roto'],
    ['<script type="text/javascript">var a=1</script>', 'ausente'],
    ['', 'ausente'],
  ])('leerJsonLd(%j).estado es %s', (html, esperado) => {
    expect(leerJsonLd(html).estado).toBe(esperado)
  })

  // El `.trim()` del crudo: sin el, `JSON.parse('  {..}  ')` funciona igual, pero el VALOR que
  // el informe acusa llevaria los espacios. El informe acusa lo que hay escrito.
  it('leerJsonLd acusa el crudo SIN espacios de relleno', () => {
    const lectura = leerJsonLd('<script type="application/ld+json">   { roto   </script>')

    expect(lectura.estado).toBe('roto')
    expect(lectura.estado === 'roto' ? lectura.crudo : '').toBe('{ roto')
  })
})

/**
 * LOS HUECOS QUE DESTAPÓ LA MUTACIÓN. Ninguno cambia una regla: todos ejercitan una regla que YA
 * ESTÁ DECLARADA en el contrato, con un fixture que su tabla no llegaba a distinguir.
 */
describe('los huecos que destapó la mutación', () => {
  /**
   * 🔴 LA REGLA DICE «lang ausente, DUPLICADO o distinto de es», y la tabla de @s15 NO PROBABA EL
   * DUPLICADO DE VERDAD: su fila es `<html lang="xx" lang="es">`, y ahí el primero (`xx`) YA ES
   * distinto de `es`, así que la caza el chequeo del VALOR — el del RECUENTO no hacía falta.
   * Con `lang="es" lang="es"` el valor es correcto y lo único que acusa es el RECUENTO.
   * Sin este test, quitar `langs.length !== UN_SOLO_LANG` NO ROMPÍA NADA: la mitad
   * «DUPLICADO» de la regla se podía borrar en silencio.
   * NO es una regla nueva: es la que el contrato ya declara, con el fixture que la aísla.
   */
  it('@s15 un lang DUPLICADO con los dos valores correctos SIGUE siendo violación', () => {
    expect(
      inspeccionarSitio([paginaCompleta('/', { elementoHtml: '<html lang="es" lang="es">' })], ['/']),
    ).toEqual([{ ruta: '/', regla: 'lang ausente, duplicado o distinto de es', valor: 'es, es' }])
  })

  /**
   * `typeof null === 'object'` [V]. Un `null` en el JSON-LD es JSON VÁLIDO, así que la puerta lo
   * ve; si `esNodo` no lo descartara, `tiposDe(null)` REVENTARÍA. Reventar no es el fin del
   * mundo (@s29 lo convierte en build roto), pero informaría por la rama equivocada: «la puerta
   * no pudo completar la inspección» en vez de «address no es PostalAddress».
   */
  it('@s21 un address null se acusa como address no PostalAddress, y NO revienta la puerta', () => {
    const violaciones = inspeccionarSitio(
      [paginaCompleta('/', { jsonLd: jsonLdModificado((n) => (n.address = null as never)) })],
      ['/'],
    )

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0].regla).toBe('address no es PostalAddress')
  })

  it('@s21 un geo null se acusa como geo ausente, y NO revienta la puerta', () => {
    const violaciones = inspeccionarSitio(
      [paginaCompleta('/', { jsonLd: jsonLdModificado((n) => (n.geo = null as never)) })],
      ['/'],
    )

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0].regla).toBe('geo ausente')
  })

  /**
   * El `||` de «address no es un nodo O su tipo no es PostalAddress» son DOS caminos al MISMO
   * fallo, y la tabla de @s21 solo ejercitaba el primero (el `Text` del cliente). Sin la fila de
   * abajo, cambiar ese `||` por `&&` no rompía nada: un `address` que ES objeto pero declara
   * OTRO tipo (o ninguno) se colaría — y ese es el caso realista, no el string suelto.
   */
  it.each([
    ['un objeto SIN @type', { streetAddress: 'Av. de Atenas 75' }],
    ['un objeto con OTRO @type', { '@type': 'Place', streetAddress: 'Av. de Atenas 75' }],
  ])('@s21 un address que es %s no es PostalAddress: violación', (_situacion, address) => {
    const violaciones = inspeccionarSitio(
      [paginaCompleta('/', { jsonLd: jsonLdModificado((n) => (n.address = address as never)) })],
      ['/'],
    )

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0].regla).toBe('address no es PostalAddress')
  })

  // El `typeof … !== 'string'` de streetAddress: la tabla solo prueba la cadena vacía. Un
  // streetAddress que NO es texto (un número, un objeto) es igual de incompleto.
  it('@s21 un streetAddress que no es texto es address incompleta', () => {
    const violaciones = inspeccionarSitio(
      [
        paginaCompleta('/', {
          jsonLd: jsonLdModificado(
            (n) => ((n.address as unknown as Record<string, unknown>).streetAddress = 42),
          ),
        }),
      ],
      ['/'],
    )

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0].regla).toBe('address incompleta')
  })

  // Idem para `name`: la tabla prueba «no hay» y «vacío». Un name que no es texto es lo mismo.
  it('@s21 un name que no es texto es JSON-LD sin name', () => {
    const violaciones = inspeccionarSitio(
      [paginaCompleta('/', { jsonLd: jsonLdModificado((n) => (n.name = 42 as never)) })],
      ['/'],
    )

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0].regla).toBe('JSON-LD sin name')
  })
})

/**
 * LA PUERTA ACUSA, NO GRUÑE — Y EL `valor` ES LA MITAD DE LA ACUSACIÓN (@s13, @s15, @s21, @s25).
 *
 * La mutación destapó que casi ningún test miraba el `valor`: se podía vaciar TODOS los `valor`
 * del informe y la suite seguía verde. Un informe que dice «geo distinto de la constante» sin
 * decir QUÉ geo encontró obliga a abrir el dist a mano — y a las 3 de la mañana nadie lo abre.
 */
describe('el informe acusa el VALOR encontrado, no solo la regla', () => {
  it.each([
    [
      'geo distinto de la constante',
      () => jsonLdModificado((n) => ((n.geo as unknown as Record<string, number>).latitude = 40.5179876)),
      '40.5179876, -3.9226688',
    ],
    [
      'address no es PostalAddress',
      () => jsonLdModificado((n) => (n.address = 'AV.ATENAS 75 LOCAL 41 C.C.ZOCO MONTE ROZAS' as never)),
      'AV.ATENAS 75 LOCAL 41 C.C.ZOCO MONTE ROZAS',
    ],
    ['JSON-LD sin name', () => jsonLdModificado((n) => (n.name = 42 as never)), '42'],
  ])('la violación "%s" declara el valor encontrado', (regla, construir, esperado) => {
    const violaciones = inspeccionarSitio([paginaCompleta('/', { jsonLd: construir() })], ['/'])

    expect(violaciones[0].regla).toBe(regla)
    expect(violaciones[0].valor).toContain(esperado)
  })

  it('la violación del JSON-LD no parseable acusa EL CRUDO que no pudo parsear', () => {
    const violaciones = inspeccionarSitio([paginaCompleta('/', { jsonLd: '{ esto no es json' })], ['/'])

    expect(violaciones[0].regla).toBe('JSON-LD no parseable')
    expect(violaciones[0].valor).toBe('{ esto no es json')
  })

  it('la violación de la section acusa el aria-labelledby que no resolvió', () => {
    const violaciones = inspeccionarSitio(
      [
        paginaCompleta('/', {
          secciones: '<section aria-labelledby="no-existe"><h2 id="otro">S</h2></section>',
        }),
      ],
      ['/'],
    )

    expect(violaciones[0].regla).toBe('section sin aria-labelledby a un heading real')
    expect(violaciones[0].valor).toBe('no-existe')
  })

  it('la violación del h1 acusa CUÁNTOS encontró', () => {
    const violaciones = inspeccionarSitio([paginaCompleta('/', { cuantosH1: 3 })], ['/'])

    expect(violaciones[0].regla).toBe('h1 ausente o más de uno')
    expect(violaciones[0].valor).toBe('3')
  })

  it('la violación de reseñas acusa la clave Y la ruta del nodo', () => {
    const violaciones = inspeccionarSitio(
      [
        paginaCompleta('/', {
          jsonLd: jsonLdModificado((n) => (n.aggregateRating = { ratingValue: 4.9 } as never)),
        }),
      ],
      ['/'],
    )

    expect(violaciones[0].valor).toBe('"aggregateRating" en $')
  })

  it('la violación del horario acusa la clave Y la ruta del nodo', () => {
    const violaciones = inspeccionarSitio(
      [paginaCompleta('/', { jsonLd: jsonLdModificado((n) => (n.openingHours = 'Mo-Fr' as never)) })],
      ['/'],
    )

    expect(violaciones[0].valor).toBe('"openingHours" en $')
  })

  it('la violación de la ruta ausente acusa la ruta esperada que no encontró', () => {
    const resultado = ejecutarPuertaDelCascaron({
      artefacto: artefactoCon(ficheroDe('dist/index.html')),
      rutasEsperadas: ['/', '/servicios'],
    })

    expect(resultado.lineas.join('\n')).toContain('/servicios')
    expect(resultado.lineas.join('\n')).toContain('ruta esperada sin HTML en dist/')
  })

  // El formato de la línea del informe: ruta + regla + valor. Es lo que lo hace DIFFABLE y
  // grepeable. Sin fijarlo, el separador y el orden se pueden mutar sin que nada se entere.
  it('cada línea del informe lleva la ruta, la regla y el valor, en ese orden', () => {
    const resultado = ejecutarPuertaDelCascaron({
      artefacto: artefactoCon(ficheroDe('dist/index.html', { cuantosH1: 0 })),
      rutasEsperadas: ['/'],
    })

    expect(resultado.lineas).toEqual(['/ — h1 ausente o más de uno: "0"'])
  })
})
