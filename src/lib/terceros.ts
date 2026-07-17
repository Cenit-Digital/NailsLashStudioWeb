/**
 * El DETECTOR de orígenes externos — decisor PURO (F-05).
 *
 * Contrato: features/cero_terceros.feature.
 * Recibe LOS BYTES CRUDOS del HTML y el CSS de `dist/` y devuelve los orígenes externos. NO lee
 * ficheros, NI el reloj, NI `process.env`, y NO decide códigos de salida: el cableado con node:fs
 * vive en tools/puerta-terceros.ts. Mismo reparto que F-01, F-03 y F-04.
 *
 * 🔴 LA DISTINCIÓN QUE **ES** LA FEATURE: **PETICIÓN AUTOMÁTICA ≠ HIPERENLACE**, y el HTML Living
 * Standard la nombra él mismo (§4.6.1): *external resource link* («generally automatically
 * processed by the user agent») frente a *hyperlink* («so that the user can cause the user agent
 * to navigate»). Sin ella F-05 es INSATISFACIBLE: hoy `dist/` trae DIEZ orígenes externos y NI UNO
 * es una petición, y prohibirlos rompería F-04 y F-02, que están `done`.
 *
 * El eje, declarado: **contacto con un origen externo SIN ACCIÓN DEL USUARIO** — porque el tercero
 * recibe la IP igual, que es exactamente lo que esta feature previene. Es CRITERIO DE PROYECTO,
 * NO letra de ninguna norma.
 */

/** Un recurso del artefacto: su ruta y LOS BYTES CRUDOS de su contenido. */
export interface RecursoDeArtefacto {
  readonly ubicacion: string
  readonly tipo: 'html' | 'css'
  readonly contenido: string
}

/** La puerta ACUSA, no gruñe (precedente F-01/F-03/F-04): dónde, qué construcción, quién y con qué URL. */
export interface OrigenExterno {
  readonly ubicacion: string
  readonly construccion: string
  readonly origen: string
  readonly valor: string
}

/**
 * 🔴 EL SENTINELA DEL PROPIO SITIO. Las URL del artefacto se RESUELVEN contra él antes de
 * clasificarlas, y así el parser de la plataforma (WHATWG URL) decide qué es relativo, qué es
 * root-absoluto, qué es protocol-relative y qué es un esquema que no pide nada — en vez de un
 * regex escrito a mano, que es donde viven los falsos negativos (@s8: `//cdn.tercero.com/x.css`
 * pide igual, y un `https?://` NO LA VE).
 *
 * `.invalid` es un TLD RESERVADO por RFC 2606: imposible de confundir con una decisión del
 * proyecto, y la misma disciplina que `example.invalid` en F-04.
 */
const HOST_PROPIO = 'propio.invalid'
const RAIZ_PROPIA = 'https://propio.invalid/'

/**
 * LOS DOS ESQUEMAS QUE PIDEN POR RED, Y SON LOS DOS. `data:` es el propio byte (@s17), `tel:` y
 * `mailto:` no son URL de red (@s18): ninguno contacta con nadie.
 */
const ESQUEMAS_DE_RED = ['http:', 'https:']

/** La etiqueta de apertura y sus atributos crudos. Sin flag `i`: el artefacto lo emite Vite/React, y viene en minúsculas. */
const ETIQUETA = /<([a-z][a-z0-9]*)\b([^>]*)>/g

/** El espaciado alrededor del `=` es OPCIONAL en HTML (`src="x"` ≡ `src = "x"`): el extractor lo tolera. */
const ATRIBUTO = /([a-z-]+)\s*=\s*"([^"]*)"/g

/**
 * QUÉ ATRIBUTO PIDE, POR ETIQUETA. Cada entrada es una REGLA INDEPENDIENTE: el detector que
 * reconozca `<img src>` y no `<img srcset>` muere en su fila de @s1, y `srcset` es exactamente el
 * atributo que un detector ingenuo olvida.
 *
 * Son SUBRECURSOS: se piden AL PROCESAR EL DOCUMENTO, sin que el usuario haga nada.
 */
const ATRIBUTOS_DE_SUBRECURSO = new Map<string, readonly string[]>([
  ['script', ['src']],
  ['img', ['src', 'srcset']],
  ['source', ['src', 'srcset']],
  ['iframe', ['src']],
  ['embed', ['src']],
  ['object', ['data']],
  ['video', ['src']],
  ['audio', ['src']],
  ['track', ['src']],
  ['input', ['src']],
  ['use', ['href']],
])

const ATRIBUTO_SRCSET = 'srcset'
const ETIQUETA_LINK = 'link'
const ETIQUETA_BASE = 'base'
const ATRIBUTO_REL = 'rel'
const ATRIBUTO_HREF = 'href'

/**
 * LOS KEYWORDS DE `rel` QUE CREAN UN *EXTERNAL RESOURCE LINK* — el UA los pide él solo.
 * `canonical` y `alternate` (a secas) NO están aquí a propósito: crean un HIPERENLACE, y un
 * hiperenlace no pide nada hasta que la usuaria decide ir (@s10, @s11, @s12).
 */
const KEYWORDS_DE_PETICION = ['stylesheet', 'icon', 'preload', 'modulepreload', 'prefetch', 'manifest']

/**
 * 🔴 CRITERIO DE PROYECTO, NO LETRA — Y LA SEPARACIÓN ESTÁ EN EL CÓDIGO A PROPÓSITO.
 * `preconnect` y `dns-prefetch` son *external resource links* pero NO DESCARGAN RECURSO: abren
 * TCP/TLS o resuelven DNS. NINGUNA SPEC decide el eje por nosotros; F-05 elige «CONTACTO con un
 * origen externo SIN ACCIÓN DEL USUARIO» porque EL TERCERO RECIBE LA IP IGUAL.
 * ⚠️ NINGÚN mensaje de violación puede decir que «lo exige el estándar»: SERÍA FALSO. Estos dos se
 * marcan porque ESTE CONTRATO lo decide (@s3).
 */
const KEYWORDS_DE_CONTACTO = ['preconnect', 'dns-prefetch']

/**
 * 🔴 ASCII WHITESPACE, Y NO `\s`. §4.6.8, literal [V]: «the element's rel attribute must be split
 * on ASCII whitespace», e *Infra*: «ASCII whitespace is U+0009 TAB, U+000A LF, U+000C FF, U+000D
 * CR, or U+0020 SPACE». En JS `\s` NO es ASCII whitespace (incluye `\v`, NBSP y espacios Unicode):
 * es SOBRE-ANCHO, del lado del falso positivo. Y un `rel.split(' ')` es MÁS ESTRECHO que la norma:
 * no vería `rel="alternate<TAB>stylesheet"`, cuya hoja SÍ SE PIDE (@s6, @s7).
 *
 * SIN cuantificador a propósito: partir por CADA carácter de espacio da tokens vacíos en los
 * espacios repetidos, y un token vacío no es keyword de nada — la PERTENENCIA AL CONJUNTO es
 * idéntica. Un `+` aquí solo añadiría un mutante `Quantifier removal` GENUINAMENTE EQUIVALENTE
 * (medido con weapon-regex 1.3.6: `[\t\n\f\r ]+` → `[\t\n\f\r ]` no cambia la pertenencia), y un
 * mutante que no se sabe matar no se excluye: se evita no escribiéndolo.
 */
const ASCII_WHITESPACE = /[\t\n\f\r ]/

/**
 * 🔴 FALSO POSITIVO SOSTENIDO POR SPEC, y por eso F-05 lo obedece. §4.6.8.23, *linked resource
 * fetch setup steps*, literal [V]: «If el's disabled attribute is set, then RETURN FALSE» → EL
 * RECURSO NO SE PIDE (@s16). Es un atributo booleano: va SIN valor, así que no lo ve `ATRIBUTO`.
 *
 * CONTRASTE DELIBERADO CON `KEYWORDS_DE_CONTACTO`: allí no hay letra y F-05 ELIGE marcar; aquí la
 * letra decide y F-05 la acata. La diferencia entre «no hay letra, elijo» y «hay letra, la ignoro»
 * es la credibilidad entera de esta puerta.
 */
const DESHABILITADO = /\bdisabled\b/

/** Los KEYWORDS se COMPARAN ASCII case-insensitive [V, §4.6.8]. La tokenización NO es un juego de cajas. */
function contactaConElOrigen(rel: string): boolean {
  return rel.split(ASCII_WHITESPACE).some((token) => {
    const keyword = token.toLowerCase()

    return KEYWORDS_DE_PETICION.includes(keyword) || KEYWORDS_DE_CONTACTO.includes(keyword)
  })
}

function atributosDe(crudo: string): Map<string, string> {
  const atributos = new Map<string, string>()

  for (const encontrado of crudo.matchAll(ATRIBUTO)) {
    atributos.set(encontrado[1], encontrado[2])
  }

  return atributos
}

/** `srcset="https://x/a.png 2x"` → la URL es el primer token; el resto es el descriptor. */
function urlDeSrcset(valor: string): string {
  return valor.split(' ')[0]
}

/**
 * `url(…)` EN CUALQUIER PARTE DEL CSS, y a propósito. Solo `@font-face` tiene letra normativa
 * sobre CUÁNDO se pide (css-fonts-4 §4.8.1 [V]); para `background-image` NINGUNA spec dice cuándo
 * se pide, y que Chrome no lo pida en una regla que no aplica es COMPORTAMIENTO OBSERVADO, NO
 * LETRA. Un analizador estático NO PUEDE evaluar qué reglas aplican → CRITERIO CONSERVADOR: se
 * marca (@s5). Fiarse del comportamiento observado de un motor convierte la puerta en rehén de una
 * implementación no escrita.
 *
 * `([^)]*)` y no una alternancia de comillas: la forma con alternancia genera DIEZ mutantes
 * `Regex` (medido con weapon-regex 1.3.6), entre ellos el `\s*`→`\S*` del cierre, que es
 * GENUINAMENTE EQUIVALENTE con una extracción `[^)]*`. Ésta genera DOS, y los dos mueren en
 * cualquier fila EXTERNA de @s24. Las comillas se quitan aparte, con operaciones de cadena.
 */
const URL_CSS = /url\(([^)]*)\)/g

/**
 * El prelude de un `@import`. La forma `@import url(…)` ya la ve `URL_CSS`; ésta existe por la
 * forma de CADENA (`@import "…";`), que no lleva `url()` (@s4, fila 2).
 */
const IMPORT_CSS = /@import([^;]*);/g

const COMILLAS = ['"', "'"]

/**
 * Quita las comillas de un valor de CSS. NO lleva `.trim()`, y NO es un olvido: MEDIDO, el parser
 * WHATWG de URL ya descarta los espacios que envuelven al valor (`URL.parse(' https://x ')` →
 * host `x`), así que un `trim()` aquí sería CÓDIGO MUERTO — y código muerto es un mutante
 * `MethodExpression` GENUINAMENTE EQUIVALENTE escrito a propósito. Los espacios de
 * `url( https://… )` los come el parser (@s24, última fila).
 *
 * Se quitan TODAS las comillas, no solo las envolventes: es más conservador y no necesita decidir
 * si el valor está BIEN entrecomillado — decisión que ningún escenario exige y que traería un
 * `endsWith`⇄`startsWith` sin fila que lo mate.
 */
export function sinComillas(crudo: string): string {
  return COMILLAS.reduce((valor, comilla) => valor.replaceAll(comilla, ''), crudo)
}

interface Construccion {
  readonly construccion: string
  readonly valor: string
  /** Contra qué se resuelve la URL: el `<base href>` del documento, o el sentinela del propio sitio. */
  readonly base: string
}

/**
 * Las construcciones del CSS. El prelude del `@import` se ofrece SIEMPRE como candidato: si es la
 * forma `url(…)`, no parsea como URL absoluta y cae del lado propio, así que `URL_CSS` lo cuenta
 * una sola vez; si es la forma de cadena, las comillas se caen y queda la URL.
 */
function* construccionesDelCss(css: string): Generator<Construccion> {
  for (const encontrado of css.matchAll(URL_CSS)) {
    yield { construccion: encontrado[0], valor: sinComillas(encontrado[1]), base: RAIZ_PROPIA }
  }

  for (const encontrado of css.matchAll(IMPORT_CSS)) {
    yield { construccion: encontrado[0], valor: sinComillas(encontrado[1]), base: RAIZ_PROPIA }
  }
}

/**
 * Las construcciones de subrecurso del HTML. Es un GENERADOR a propósito: devolver `[]` para las
 * etiquetas que no piden nada daría un literal de array que `ArrayDeclaration` rellena con
 * `["Stryker was here"]` sin que ningún escenario lo note — un mutante equivalente de fábrica.
 */
function* construccionesDelHtml(html: string): Generator<Construccion> {
  const base = baseDelDocumento(html)

  for (const etiqueta of html.matchAll(ETIQUETA)) {
    for (const valor of urlsQuePide(etiqueta[1], etiqueta[2])) {
      yield { construccion: etiqueta[0], valor, base }
    }
  }
}

/**
 * 🔴 `<base href>` ES UN MODIFICADOR, NO UN ORIGEN: no pide nada por sí mismo —por eso `base` NO
 * está en ATRIBUTOS_DE_SUBRECURSO y @s9 detecta 1 y no 2— pero convierte `<img src="a.png">` en
 * una petición a un tercero. LAS URL SE RESUELVEN CONTRA ÉL ANTES DE CLASIFICARLAS: un detector
 * que dé por propia toda URL relativa es CIEGO A ESTA VÍA ENTERA (@s9).
 */
function baseDelDocumento(html: string): string {
  for (const etiqueta of html.matchAll(ETIQUETA)) {
    if (etiqueta[1] === ETIQUETA_BASE) {
      const href = atributosDe(etiqueta[2]).get(ATRIBUTO_HREF)

      if (href !== undefined) {
        return URL.parse(href, RAIZ_PROPIA)?.href ?? RAIZ_PROPIA
      }
    }
  }

  return RAIZ_PROPIA
}

function* urlsQuePide(etiqueta: string, crudo: string): Generator<string> {
  const atributos = atributosDe(crudo)

  if (etiqueta === ETIQUETA_LINK) {
    const rel = atributos.get(ATRIBUTO_REL)
    const href = atributos.get(ATRIBUTO_HREF)

    if (
      rel !== undefined &&
      href !== undefined &&
      contactaConElOrigen(rel) &&
      !DESHABILITADO.test(crudo)
    ) {
      yield href
    }

    return
  }

  const nombres = ATRIBUTOS_DE_SUBRECURSO.get(etiqueta)

  if (nombres === undefined) {
    return
  }

  for (const nombre of nombres) {
    const valor = atributos.get(nombre)

    if (valor !== undefined) {
      yield nombre === ATRIBUTO_SRCSET ? urlDeSrcset(valor) : valor
    }
  }
}

const TIPO_HTML = 'html'

function construccionesDe(recurso: RecursoDeArtefacto): Generator<Construccion> {
  return recurso.tipo === TIPO_HTML
    ? construccionesDelHtml(recurso.contenido)
    : construccionesDelCss(recurso.contenido)
}

/**
 * El origen externo de una URL del artefacto, o null si no contacta con ningún tercero.
 * Se resuelve contra el sentinela del propio sitio: así `/assets/x`, `a.png` y `#ancla` caen del
 * lado propio SIN una sola regla escrita a mano.
 */
function origenExternoDe(valor: string, base: string): { origen: string; valor: string } | null {
  const url = URL.parse(valor, base)

  if (url === null || !ESQUEMAS_DE_RED.includes(url.protocol) || url.host === HOST_PROPIO) {
    return null
  }

  return { origen: url.host, valor: url.href }
}

export function detectarOrigenesExternos(
  recursos: readonly RecursoDeArtefacto[],
  allowlist: readonly string[],
): readonly OrigenExterno[] {
  const encontrados: OrigenExterno[] = []

  for (const recurso of recursos) {
    for (const construccion of construccionesDe(recurso)) {
      const externo = origenExternoDe(construccion.valor, construccion.base)

      if (externo !== null) {
        encontrados.push({
          ubicacion: recurso.ubicacion,
          construccion: construccion.construccion,
          origen: externo.origen,
          valor: externo.valor,
        })
      }
    }
  }

  return encontrados.filter((origen) => !allowlist.includes(origen.origen))
}
