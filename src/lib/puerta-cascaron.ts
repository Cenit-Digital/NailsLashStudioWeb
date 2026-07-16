/**
 * La PUERTA del cascarón — el decisor PURO (F-04).
 *
 * Contrato: features/cascaron_semantico.feature.
 * Recibe el HTML CRUDO de `dist/` y devuelve violaciones. NO lee ficheros, NI el reloj, NI
 * `process.env`, y NO decide códigos de salida: el cableado con node:fs vive en
 * tools/puerta-cascaron.ts. Mismo reparto que F-01 y F-03.
 *
 * 🔴 LA ENTRADA ES EL ARTEFACTO DE PRODUCCIÓN, JAMÁS UN RENDER DEL ÁRBOL DE COMPONENTES.
 * `extractHelmet` lee EXCLUSIVAMENTE del contexto de Helmet y NUNCA parsea el HTML [V:
 * node_modules/vite-react-ssg/dist/shared/vite-react-ssg.DsKK_1op.mjs:429-446]. Si alguien usa
 * la metadata NATIVA de React 19, el `<head>` del build SALE VACÍO — y estaría VERDE en
 * `pnpm dev` y VERDE en jsdom. Esta puerta existe para cazar exactamente eso (@s32).
 */

/** Una página del artefacto: su ruta y LOS BYTES CRUDOS de su HTML. */
export interface PaginaArtefacto {
  readonly ruta: string
  readonly html: string
}

/**
 * 🔴🔴 EL `<head>` DEL DOCUMENTO, Y SOLO ÉL. ESTA FUNCIÓN ES LA MITAD DE LA FEATURE.
 *
 * MEDIDO SOBRE UN BUILD REAL (@s32), y CORRIGE UNA CREENCIA CÓMODA: con la metadata NATIVA de
 * React 19, el `<title>`/`<meta>` NO DESAPARECEN DEL ARTEFACTO — `renderToString` LOS EMITE
 * DENTRO DEL `<body>`, ahí donde está el componente, y el `<head>` SE QUEDA VACÍO:
 *
 *     <head><meta charset="UTF-8"><script type="module" src="..."></script></head>
 *     <body><div id="root"><title>Nails Lash Studio</title><meta name="description" ...>
 *
 * → UNA PUERTA QUE BUSCARA EL `<title>` EN EL DOCUMENTO ENTERO LO ENCONTRARÍA EN EL `<body>` Y
 *   DARÍA EL BUILD POR BUENO. Es decir: sería CIEGA AL ÚNICO BUG QUE ESTA FEATURE EXISTE PARA
 *   PREVENIR, igual que jsdom, y con toda la suite en verde. Un `<title>` en el `<body>` NO ES
 *   UN TITLE HORNEADO.
 *
 * Por eso las reglas del `<head>` (title, description, canónica, JSON-LD) se evalúan SOLO aquí
 * dentro. Si no hay `<head>`, no hay nada: devuelve '' y TODAS esas reglas acusan — que es
 * justo lo que pide @s33 cuando el `replace('<head>', …)` literal no casa.
 */
const REGION_HEAD = /<head\b[^>]*>([\s\S]*?)<\/head>/i

export function cabezaDe(html: string): string {
  return REGION_HEAD.exec(html)?.[1] ?? ''
}

/** La puerta ACUSA, no gruñe (precedente F-01/F-03): ruta + regla + valor encontrado. */
export interface ViolacionCascaron {
  readonly ruta: string
  readonly regla: string
  readonly valor: string
}

/**
 * El `<title>` del artefacto. `[\s\S]` y no `.` porque el HTML horneado tiene saltos de línea.
 * Devuelve null si NO HAY `<title>`; la cadena vacía si lo hay y está vacío. La regla trata los
 * dos casos IGUAL («ausente O vacío», @s13) porque el fallo entra por las dos puertas: el dist
 * BORRA el title vacío [V: extractHelmet :434-436], así que buscar solo el vacío lo dejaría
 * escapar.
 */
const TITULO = /<title[^>]*>([\s\S]*?)<\/title>/i

/**
 * La `<meta name="description">`. Los atributos pueden venir en CUALQUIER ORDEN
 * (`content="x" name="description"` es HTML igual de válido), así que se localiza la etiqueta y
 * se leen sus atributos por separado en vez de exigir un orden que nada impone.
 */
const META = /<meta\b[^>]*>/gi
const ATRIBUTO_NAME = /\bname\s*=\s*"([^"]*)"/i
const ATRIBUTO_CONTENT = /\bcontent\s*=\s*"([^"]*)"/i

const ENLACE = /<link\b[^>]*>/gi
const ATRIBUTO_REL = /\brel\s*=\s*"([^"]*)"/i
const ATRIBUTO_HREF = /\bhref\s*=\s*"([^"]*)"/i

export const REGLA_TITULO = 'title ausente o vacío'
export const REGLA_DESCRIPCION = 'description ausente o vacía'
export const REGLA_CANONICA_AUSENTE = 'canónica ausente'
export const REGLA_CANONICA_REPETIDA = 'canónica repetida entre rutas distintas'
export const REGLA_LANG = 'lang ausente, duplicado o distinto de es'
export const REGLA_H1 = 'h1 ausente o más de uno'

const H1 = /<h1\b[^>]*>/gi
const UN_SOLO_H1 = 1

export function cuantosH1(html: string): number {
  return [...html.matchAll(H1)].length
}

/**
 * CRITERIO DE PROYECTO, NO WCAG: `SC 1.3.1` NO EXIGE LANDMARKS [V]; `ARIA11` es una TÉCNICA
 * SUFICIENTE. Se testean igual porque son buena regla; lo prohibido es la atribución normativa.
 */
export const LANDMARKS_EXIGIDOS = ['main', 'nav', 'footer'] as const

export function reglaDeLandmark(landmark: string): string {
  return `landmark ${landmark} ausente`
}

function tieneLandmark(html: string, landmark: string): boolean {
  return new RegExp(`<${landmark}\\b[^>]*>`, 'i').test(html)
}

/**
 * ✅ LA ÚNICA REGLA DE ESTA PUERTA QUE MIDE `SC 1.3.1` DE VERDAD: una relación que el diseño
 * comunica VISUALMENTE debe existir EN EL CÓDIGO. Una `section` titulada con un `div` con
 * `font-size` le cuenta a quien VE que ese texto la titula, y a nadie más.
 *
 * ⚠️ LÍMITE DECLARADO, Y ESTÁ ESCRITO A PROPÓSITO: esta regla comprueba que el
 * `aria-labelledby` EXISTE y que su id RESUELVE A ALGÚN ELEMENTO — que es literalmente lo que
 * fijan las tres filas de @s18 («cuyo id no existe en NINGÚN elemento»). NO comprueba que el
 * destino sea un heading, y por tanto un `<section aria-labelledby="x">` + `<div id="x">` PASA.
 * Implementarlo sería producción que NINGUNA fila roja pide (Ley 1) y dejaría un mutante
 * INMORTAL: ninguna fila distingue un `<h2 id="x">` de un `<div id="x">`. Cerrar ese coladero
 * exige una FILA NUEVA en el .feature → puerta humana, no un parche aquí.
 * (Precedente literal del repo: la rama de «texto grande» que F-03 NO implementó, por esto.)
 */
export const REGLA_SECTION = 'section sin aria-labelledby a un heading real'

const SECCION = /<section\b([^>]*)>/gi
const ATRIBUTO_LABELLEDBY = /\baria-labelledby\s*=\s*"([^"]*)"/i
const ATRIBUTOS_ID = /\bid\s*=\s*"([^"]*)"/gi

function idsDe(html: string): Set<string> {
  return new Set([...html.matchAll(ATRIBUTOS_ID)].map((atributo) => atributo[1]))
}

export const REGLA_JSONLD_AUSENTE = 'JSON-LD ausente'
export const REGLA_JSONLD_NO_PARSEABLE = 'JSON-LD no parseable'
export const REGLA_TIPO = 'ningún nodo con tipo efectivo BeautySalon'

/** El tipo que ESTE CONTRATO fija (criterio de proyecto, respaldado por Google [V]). */
const TIPO_ACORDADO = 'BeautySalon'

type NodoJson = Record<string, unknown>

function esNodo(valor: unknown): valor is NodoJson {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

/** Un nodo del JSON-LD y DÓNDE está dentro de él. La ruta es lo que hace auditable el informe. */
export interface NodoLocalizado {
  readonly nodo: NodoJson
  readonly ruta: string
}

const RAIZ_DEL_JSONLD = '$'

/**
 * TODOS los nodos del JSON-LD, a CUALQUIER PROFUNDIDAD: la raíz, los del `@graph`, y los
 * anidados dentro de un `Service`/`Offer`. Es el recorrido que comparten @s20, @s21, @s22 y
 * @s35, y la razón de ser de @s22: EL MUTANTE QUE CORTA LA RECURSIÓN DEBE MORIR.
 *
 * Lleva la RUTA porque el informe tiene que decir DÓNDE está el nodo (@s22): «hay una reseña»
 * sin decir en qué nodo del `@graph` obliga a buscarla a mano.
 */
export function nodosDe(valor: unknown, ruta: string = RAIZ_DEL_JSONLD): NodoLocalizado[] {
  if (Array.isArray(valor)) {
    return valor.flatMap((elemento, indice) => nodosDe(elemento, `${ruta}[${String(indice)}]`))
  }

  if (!esNodo(valor)) {
    return []
  }

  return [
    { nodo: valor, ruta },
    ...Object.entries(valor).flatMap(([clave, anidado]) => nodosDe(anidado, `${ruta}.${clave}`)),
  ]
}

/**
 * El tipo EFECTIVO de un nodo: `@type` es un string O UN ARRAY, y las dos formas son válidas.
 * Una comparación `nodo['@type'] === 'BeautySalon'` cierra los ojos ante `["BeautySalon"]`.
 */
function tiposDe(nodo: NodoJson): string[] {
  const tipo = nodo['@type']

  if (typeof tipo === 'string') {
    return [tipo]
  }

  return Array.isArray(tipo) ? tipo.filter((uno): uno is string => typeof uno === 'string') : []
}

function nodoAcordado(raiz: unknown): NodoJson | undefined {
  return nodosDe(raiz).find((localizado) => tiposDe(localizado.nodo).includes(TIPO_ACORDADO))?.nodo
}

export const REGLA_RESENAS = 'reseñas prohibidas en el JSON-LD'

/**
 * Las claves de reseña PROHIBIDAS. Van las CUATRO y cada una por su motivo:
 *   - `aggregateRating` y `review` → «It applies to Review AND AggregateRating» [V]: se
 *     prohíben AMBOS, no solo el primero.
 *   - `ratingValue` y `reviewCount` → LA PROPIEDAD SUELTA, sin su envoltorio: es la escapatoria
 *     trivial, y sin ella la regla se esquiva en una línea.
 * La comparación es INSENSIBLE A LA CAJA (`review`/`Review`) y RECURSIVA (@s9, @s22).
 *
 * SIN ESCAPATORIA POR EL TIPO: «If the entity that's being reviewed controls the reviews about
 * itself, their pages that use LocalBusiness OR ANY OTHER TYPE OF ORGANIZATION structured data
 * are ineligible…» [V]. `BeautySalon` cae POR LAS DOS RAMAS de la herencia múltiple.
 */
const CLAVES_DE_RESENA = ['aggregaterating', 'review', 'ratingvalue', 'reviewcount']

export const REGLA_HORARIO =
  'horario: solo openingHoursSpecification, nunca openingHours, jamás las dos'

/**
 * A-19: EL HORARIO NO ENTRA EN F-04 (es de F-10). Pero F-04 FIJA LA REGLA Y LA HACE CUMPLIR
 * ESTRUCTURALMENTE, y por eso existe hoy: `openingHours` y `openingHoursSpecification`
 * COEXISTEN y AMBAS son válidas por ramas distintas de schema.org [V]. SI EL CONTRATO NO FIJA
 * CUÁL, DOS IMPLEMENTADORES ELIGEN DISTINTO Y AMBOS PASAN LOS TESTS. Google solo recomienda
 * `openingHoursSpecification` [V] → se fija ESA y se PROHÍBE `openingHours`.
 *
 * PROHIBIR `openingHours` cubre las DOS filas que acusan: la clave sola Y LA MEZCLA (emitir las
 * dos es «válido» para schema.org y es dos fuentes de verdad para el mismo hecho — justo lo que
 * I-7 existe para prohibir; divergen en silencio).
 *
 * ⚠️ PARA F-10: esta regla es tuya y ya está en verde. Emite `openingHoursSpecification` desde
 * el `HORARIO` de la fuente única (F-02) y nunca `openingHours`.
 */
const CLAVE_DE_HORARIO_PROHIBIDA = 'openinghours'

function violacionesDeHorario(pagina: PaginaArtefacto, raiz: unknown): ViolacionCascaron[] {
  return nodosDe(raiz).flatMap(({ nodo, ruta }) =>
    Object.keys(nodo)
      .filter((clave) => clave.toLowerCase() === CLAVE_DE_HORARIO_PROHIBIDA)
      .map((clave) => ({ ruta: pagina.ruta, regla: REGLA_HORARIO, valor: `"${clave}" en ${ruta}` })),
  )
}

function violacionesDeResenas(pagina: PaginaArtefacto, raiz: unknown): ViolacionCascaron[] {
  const violaciones: ViolacionCascaron[] = []

  for (const { nodo, ruta } of nodosDe(raiz)) {
    for (const clave of Object.keys(nodo)) {
      if (CLAVES_DE_RESENA.includes(clave.toLowerCase())) {
        violaciones.push({
          ruta: pagina.ruta,
          regla: REGLA_RESENAS,
          valor: `"${clave}" en ${ruta}`,
        })
      }
    }
  }

  return violaciones
}

export const REGLA_SIN_NAME = 'JSON-LD sin name'
export const REGLA_SIN_ADDRESS = 'JSON-LD sin address'
export const REGLA_ADDRESS_NO_POSTAL = 'address no es PostalAddress'
export const REGLA_ADDRESS_INCOMPLETA = 'address incompleta'
export const REGLA_GEO_AUSENTE = 'geo ausente'
export const REGLA_GEO_DISTINTO = 'geo distinto de la constante'

const TIPO_DIRECCION_ACORDADO = 'PostalAddress'

/**
 * 🔴 LA CONSTANTE `geo` ACORDADA, ESCRITA A MANO AQUÍ Y A PROPÓSITO NO IMPORTADA DE `site.ts`.
 *
 * Si la puerta importara `GEO` de la fuente única, el VIGILANTE y el VIGILADO se moverían
 * JUNTOS: cambiar `site.ts` cambiaría a la vez lo que se emite y lo que se espera, y la puerta
 * pasaría feliz. ESO ES LA TAUTOLOGÍA que el contrato prohíbe («si el test importa la constante
 * que debería vigilar, NO VIGILA NADA»), aplicada a producción. Mismo argumento con el que F-03
 * anclÓ `MINIMO_DE_PARES` a un literal en vez de a `MATRIZ_DE_USO.length`.
 *
 * 🔴 VERIFICADA A NIVEL DE EDIFICIO, JAMÁS DE «LOCAL 41»: point-in-polygon (ray casting) contra
 * Overpass + api.openstreetmap.org sitúa el punto DENTRO de `way/34502818` {building=yes,
 * shop=mall, name="Centro comercial Zoco Rozas"}; los otros 4 edificios del radio de 80 m dan
 * FUERA [V]. Nominatim devuelve `[]` para «Nails Lash Studio Las Rozas» → afirmar «geo == Local
 * 41» sería afirmar más de lo que ninguna fuente sostiene.
 * JAMÁS SE RECALCULA NI SE «CORRIGE» DESDE OSM: quien lo intente introducirá un bug (el CP del
 * mall en OSM es 28242 y el del nº 75 es 28232 — OSM SE CONTRADICE A SÍ MISMO [V]).
 */
const LATITUD_ACORDADA = 40.5179875
const LONGITUD_ACORDADA = -3.9226688

function violacionesDelNodoAcordado(nodo: NodoJson): { regla: string; valor: string }[] {
  const violaciones: { regla: string; valor: string }[] = []
  const { name, address, geo } = nodo

  if (typeof name !== 'string' || name === '') {
    violaciones.push({ regla: REGLA_SIN_NAME, valor: String(name ?? '') })
  }

  if (address === undefined) {
    violaciones.push({ regla: REGLA_SIN_ADDRESS, valor: '' })
  } else if (!esNodo(address) || !tiposDe(address).includes(TIPO_DIRECCION_ACORDADO)) {
    // DECISIÓN DE PROYECTO más estricta que el vocabulario: schema.org ADMITE `Text` [V].
    violaciones.push({ regla: REGLA_ADDRESS_NO_POSTAL, valor: JSON.stringify(address) })
  } else if (typeof address.streetAddress !== 'string' || address.streetAddress === '') {
    violaciones.push({ regla: REGLA_ADDRESS_INCOMPLETA, valor: String(address.streetAddress ?? '') })
  }

  if (!esNodo(geo)) {
    violaciones.push({ regla: REGLA_GEO_AUSENTE, valor: '' })
  } else if (geo.latitude !== LATITUD_ACORDADA || geo.longitude !== LONGITUD_ACORDADA) {
    violaciones.push({
      regla: REGLA_GEO_DISTINTO,
      valor: `${String(geo.latitude)}, ${String(geo.longitude)}`,
    })
  }

  return violaciones
}

const BLOQUE_JSONLD = /<script\b[^>]*type\s*=\s*"application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i

/** Lo que se encontró en el `<script type="application/ld+json">`, y si se pudo parsear. */
type LecturaJsonLd =
  | { readonly estado: 'ausente' }
  | { readonly estado: 'roto'; readonly crudo: string }
  | { readonly estado: 'leido'; readonly nodo: unknown }

export function leerJsonLd(html: string): LecturaJsonLd {
  const bloque = BLOQUE_JSONLD.exec(html)

  if (bloque === null) {
    return { estado: 'ausente' }
  }

  const crudo = bloque[1].trim()

  try {
    // `JSON.parse('')` LANZA, así que el `<script>` vacío cae aquí: es «no parseable», que es lo
    // que fija @s19. La excepción se convierte en VIOLACIÓN, nunca se traga.
    return { estado: 'leido', nodo: JSON.parse(crudo) as unknown }
  } catch {
    return { estado: 'roto', crudo }
  }
}

/**
 * El elemento `html` de apertura, y TODOS sus atributos `lang`. Se recogen TODOS —no el
 * primero— porque el duplicado es una violación por sí mismo (@s15): el `lang` tiene DOS
 * FUENTES POSIBLES (`index.html` y el `<Head>` de vite-react-ssg, que inyecta con
 * `replace('<html', '<html ' + htmlAttributes)` [V: :127-128]). Cuál ganaría es [NV] y no hace
 * falta averiguarlo: se PROHÍBE la ambigüedad, que es más barato que verificarla.
 */
const ELEMENTO_HTML = /<html\b([^>]*)>/i
const ATRIBUTOS_LANG = /\blang\s*=\s*"([^"]*)"/gi

const IDIOMA_DEL_SITIO = 'es'
const UN_SOLO_LANG = 1

export function langsDe(html: string): string[] {
  const elemento = ELEMENTO_HTML.exec(html)

  if (elemento === null) {
    return []
  }

  return [...elemento[1].matchAll(ATRIBUTOS_LANG)].map((atributo) => atributo[1])
}

function contenidoDelTitulo(html: string): string | null {
  const encontrado = TITULO.exec(html)

  return encontrado === null ? null : encontrado[1].trim()
}

/** Busca la primera etiqueta cuyo atributo `clave` valga `valor`, y devuelve su `devuelve`. */
function atributoDeEtiqueta(
  html: string,
  etiquetas: RegExp,
  clave: RegExp,
  valor: string,
  devuelve: RegExp,
): string | null {
  for (const etiqueta of html.matchAll(etiquetas)) {
    if (clave.exec(etiqueta[0])?.[1].toLowerCase() === valor) {
      return devuelve.exec(etiqueta[0])?.[1] ?? ''
    }
  }

  return null
}

export function descripcionDe(html: string): string | null {
  return atributoDeEtiqueta(html, META, ATRIBUTO_NAME, 'description', ATRIBUTO_CONTENT)
}

export function canonicaDeLaPagina(html: string): string | null {
  return atributoDeEtiqueta(html, ENLACE, ATRIBUTO_REL, 'canonical', ATRIBUTO_HREF)
}

/** Un texto ausente y uno vacío son EL MISMO fallo: los dos dejan la página sin ese dato. */
function ausenteOVacio(valor: string | null): boolean {
  return valor === null || valor === ''
}

/**
 * Las reglas del JSON-LD. Aquí SÍ hay etapas —no reglas independientes—: no se puede aseverar el
 * tipo ni los campos de un JSON-LD que no se ha podido parsear, así que ausente y roto CORTAN.
 * Por eso @s19 exige EXACTAMENTE 1 violación y no una cascada.
 */
function violacionesDelJsonLd(pagina: PaginaArtefacto): ViolacionCascaron[] {
  // SOLO EL `<head>`, por la misma razón que el title (@s32): con la metadata nativa de React 19
  // el `<script type="application/ld+json">` acaba en el `<body>`, y ahí NO ESTÁ HORNEADO.
  const lectura = leerJsonLd(cabezaDe(pagina.html))

  if (lectura.estado === 'ausente') {
    return [{ ruta: pagina.ruta, regla: REGLA_JSONLD_AUSENTE, valor: '' }]
  }

  if (lectura.estado === 'roto') {
    return [{ ruta: pagina.ruta, regla: REGLA_JSONLD_NO_PARSEABLE, valor: lectura.crudo }]
  }

  // Las CLAVES PROHIBIDAS (reseñas y horario) se persiguen en TODO el JSON-LD e
  // INDEPENDIENTEMENTE del tipo: son vía propia, no una etapa del nodo acordado. Un `@graph` con
  // reseñas y sin BeautySalon acusa las dos cosas.
  const clavesProhibidas = [
    ...violacionesDeResenas(pagina, lectura.nodo),
    ...violacionesDeHorario(pagina, lectura.nodo),
  ]
  const acordado = nodoAcordado(lectura.nodo)

  // Sin nodo del tipo acordado no hay nada a lo que aseverarle `name`/`address`/`geo`: por eso
  // corta, y por eso @s20 exige EXACTAMENTE 1 violación y no una cascada.
  if (acordado === undefined) {
    return [...clavesProhibidas, { ruta: pagina.ruta, regla: REGLA_TIPO, valor: '' }]
  }

  return [
    ...clavesProhibidas,
    ...violacionesDelNodoAcordado(acordado).map((una) => ({ ruta: pagina.ruta, ...una })),
  ]
}

function violacionesDeLaPagina(
  pagina: PaginaArtefacto,
  rutasDelArtefacto: ReadonlySet<string>,
): ViolacionCascaron[] {
  const violaciones: ViolacionCascaron[] = []
  const acusar = (regla: string, valor: string): number => violaciones.push({ ruta: pagina.ruta, regla, valor })

  // `if` independientes, NUNCA `else if` (precedente F-01/@s23): cada infracción es
  // independiente y el informe las acusa TODAS (@s25).
  const langs = langsDe(pagina.html)

  // EXACTAMENTE UN `lang`, y con valor `es`. Las tres condiciones son la MISMA regla porque son
  // el mismo fallo: el idioma no queda determinado por código de forma inequívoca.
  if (langs.length !== UN_SOLO_LANG || langs[0] !== IDIOMA_DEL_SITIO) {
    acusar(REGLA_LANG, langs.join(', '))
  }

  // 🔴 SOLO EL `<head>`: un `<title>` en el `<body>` NO es un title horneado. Es lo que hace la
  // puerta capaz de cazar la metadata nativa de React 19, que renderiza en el body (@s32).
  const cabeza = cabezaDe(pagina.html)
  const titulo = contenidoDelTitulo(cabeza)

  if (ausenteOVacio(titulo)) {
    acusar(REGLA_TITULO, titulo ?? '')
  }

  const descripcion = descripcionDe(cabeza)

  if (ausenteOVacio(descripcion)) {
    acusar(REGLA_DESCRIPCION, descripcion ?? '')
  }

  const canonica = canonicaDeLaPagina(cabeza)

  if (canonica === null) {
    acusar(REGLA_CANONICA_AUSENTE, '')
  }

  // CRITERIO DE PROYECTO, NO WCAG: `SC 1.3.1` NO exige «exactamente un h1» — ninguna frase sobre
  // el número de h1 existe en toda la norma [V]. Buena regla, se testea igual; lo prohibido es
  // la atribución normativa.
  const h1 = cuantosH1(pagina.html)

  if (h1 !== UN_SOLO_H1) {
    acusar(REGLA_H1, String(h1))
  }

  // Un `for` con un `if` por landmark, NO una conjunción de las tres presencias: cada landmark
  // ausente es SU PROPIA violación y el informe los acusa TODOS (@s25).
  for (const landmark of LANDMARKS_EXIGIDOS) {
    if (!tieneLandmark(pagina.html, landmark)) {
      acusar(reglaDeLandmark(landmark), '')
    }
  }

  const ids = idsDe(pagina.html)

  for (const seccion of pagina.html.matchAll(SECCION)) {
    const referencia = ATRIBUTO_LABELLEDBY.exec(seccion[1])?.[1]

    // Las DOS condiciones son la MISMA regla porque son el mismo fallo: la sección no declara en
    // el CÓDIGO cuál es su título. Y un id que no resuelve es PEOR que no poner el atributo:
    // promete una relación que el árbol de accesibilidad no puede construir.
    if (referencia === undefined || !ids.has(referencia)) {
      acusar(REGLA_SECTION, referencia ?? '')
    }
  }

  violaciones.push(...violacionesDelJsonLd(pagina))
  violaciones.push(...violacionesDeEnlaces(pagina, rutasDelArtefacto))

  return violaciones
}

export const REGLA_ENLACE_ROTO = 'href interno sin fichero en dist/'

const ANCLA = /<a\b[^>]*>/gi

/**
 * TODOS los href del artefacto: internos, externos, `tel:`, `mailto:` y anclas. Se extraen
 * TODOS —no solo los internos— porque la guarda de @s28 cuenta lo que el EXTRACTOR encontró: lo
 * que detecta es que EL EXTRACTOR ESTÁ ROTO, no que el sitio tenga pocos enlaces.
 */
export function extraerEnlaces(html: string): string[] {
  return [...html.matchAll(ANCLA)]
    .map((etiqueta) => ATRIBUTO_HREF.exec(etiqueta[0])?.[1])
    .filter((href): href is string => href !== undefined)
}

/**
 * Una ruta INTERNA del artefacto es la que empieza por `/`. Todo lo demás queda fuera:
 *   - los ABSOLUTOS (`https://…`) apuntan fuera del artefacto — y el de Facebook es un dato
 *     REAL que la fuente única ya emite [V]: tratarlo como interno rompería el build.
 *   - `tel:` y `mailto:` NO SON RUTAS.
 *   - `#ancla` es un salto dentro de la misma página.
 * Nótese que NO se implementa como «no empieza por /» al revés: `//host/x` es protocol-relative
 * y sale del sitio, así que se excluye explícitamente.
 */
const RUTA_INTERNA = /^\/(?!\/)/

function esRutaInterna(href: string): boolean {
  return RUTA_INTERNA.test(href)
}

/** El href sin `?query` ni `#fragmento`: lo que identifica al fichero del artefacto. */
function rutaDelHref(href: string): string {
  return href.split(/[?#]/)[0]
}

/**
 * LA PUERTA ANTI-404 (A-17): ningún href interno apunta a una ruta que no exista en `dist/`.
 *
 * Es el eje «PERMANENTE» de la LSSI art. 10.1, aseverado CONTRA EL DESTINO — que es donde de
 * verdad se incumple. *Permanente* es TEMPORAL, no espacial: «en todas las páginas» NO ESTÁ EN
 * LA LEY [V: 0 ocurrencias en el estatuto entero]. ES EXACTAMENTE EL 404 DEL CLIENTE: el enlace
 * está en el pie, y el destino no existe.
 *
 * La comparación es EXACTA y SENSIBLE A LA CAJA: la resolución de rutas del artefacto no es un
 * juego de cajas (`/Aviso-Legal` ≠ `/aviso-legal`).
 */
function violacionesDeEnlaces(
  pagina: PaginaArtefacto,
  rutasDelArtefacto: ReadonlySet<string>,
): ViolacionCascaron[] {
  return extraerEnlaces(pagina.html)
    .filter((href) => esRutaInterna(href) && !rutasDelArtefacto.has(rutaDelHref(href)))
    .map((href) => ({ ruta: pagina.ruta, regla: REGLA_ENLACE_ROTO, valor: href }))
}

/**
 * La canónica es POR PÁGINA (@s14) y el fallo típico es que TODAS HEREDEN LA DE LA HOME. Este
 * cruce es la razón de ser de que la puerta reciba EL SITIO ENTERO y no una página: ese fallo
 * PASA CUALQUIER COMPROBACIÓN QUE MIRE UNA SOLA PÁGINA.
 *
 * Se acusa a la SEGUNDA que la usa, nombrando a la primera: así el informe apunta a la página
 * que hay que arreglar y dice contra quién colisiona.
 */
function violacionesDeCanonicaRepetida(
  paginas: readonly PaginaArtefacto[],
): ViolacionCascaron[] {
  const violaciones: ViolacionCascaron[] = []
  const duenaDeLaCanonica = new Map<string, string>()

  for (const pagina of paginas) {
    const canonica = canonicaDeLaPagina(cabezaDe(pagina.html))

    if (canonica === null) {
      continue
    }

    const primera = duenaDeLaCanonica.get(canonica)

    if (primera === undefined) {
      duenaDeLaCanonica.set(canonica, pagina.ruta)
    } else {
      violaciones.push({
        ruta: pagina.ruta,
        regla: REGLA_CANONICA_REPETIDA,
        valor: `"${canonica}", ya declarada por la ruta "${primera}"`,
      })
    }
  }

  return violaciones
}

export const REGLA_RUTA_AUSENTE = 'ruta esperada sin HTML en dist/'

/**
 * GUARDA ANTI-«VERDE POR VACUIDAD» (A5, @s26): una HTML por CADA ruta esperada.
 *
 * SIN ELLA: `dist/` vacío → 0 páginas → 0 violaciones → build VERDE → «protegidos». 0 FALLOS
 * SOBRE 0 PÁGINAS NO ES ESTAR PROTEGIDO: ES NO HABER MIRADO. Es el modo de fallo MÁS PROBABLE de
 * esta puerta, porque corre DESPUÉS del build y uno que no generara nada la dejaría escaneando
 * el vacío.
 *
 * Vive AQUÍ y no en la puerta —aunque sea una guarda— porque es lo que hace que
 * `rutasEsperadas` SIGNIFIQUE algo en el decisor: es la única regla que compara lo que el
 * artefacto TRAE con lo que el contrato EXIGE. La puerta solo la convierte en código de salida.
 */
function violacionesDeRutasAusentes(
  paginas: readonly PaginaArtefacto[],
  rutasEsperadas: readonly string[],
): ViolacionCascaron[] {
  const rutasDelArtefacto = new Set(paginas.map((pagina) => pagina.ruta))

  return rutasEsperadas
    .filter((esperada) => !rutasDelArtefacto.has(esperada))
    .map((ruta) => ({ ruta, regla: REGLA_RUTA_AUSENTE, valor: '' }))
}

/**
 * El orden del informe es el de las páginas recibidas y, dentro de cada una, el de las reglas:
 * misma entrada → misma salida, MISMO ORDEN. El informe tiene que ser DIFFABLE (@s25).
 */
export function inspeccionarSitio(
  paginas: readonly PaginaArtefacto[],
  rutasEsperadas: readonly string[],
): ViolacionCascaron[] {
  // Las rutas que EXISTEN DE VERDAD en el artefacto, que es contra lo que se asevera el eje
  // «permanente» de la anti-404: NO contra las esperadas. Una ruta esperada que el build no
  // generó no hace que sus enlaces dejen de estar rotos — eso lo acusa su propia guarda.
  const rutasDelArtefacto = new Set(paginas.map((pagina) => pagina.ruta))

  return [
    ...violacionesDeRutasAusentes(paginas, rutasEsperadas),
    ...paginas.flatMap((pagina) => violacionesDeLaPagina(pagina, rutasDelArtefacto)),
    ...violacionesDeCanonicaRepetida(paginas),
  ]
}

// =============================================================================================
// LA PUERTA: la que lee el artefacto, aplica las guardas y decide el código de salida.
// =============================================================================================

/** Un fichero HTML del artefacto, tal cual sale de `dist/`. */
export interface FicheroHtml {
  readonly ubicacion: string
  readonly contenido: string
}

/**
 * El único contacto de la puerta con el mundo. Lo cablea el humilde de tools/.
 *
 * CONTRATO DEL PUERTO — el caso «el directorio no existe» se declara aquí, y no se deja a la
 * casualidad, porque el doble de test y el real TIENEN que coincidir (lección de @s20 de F-01):
 *   - `existe` responde SIN LANZAR. Es lo que la puerta pregunta ANTES de listar.
 *   - `listarHtml` LANZA si el directorio no existe (es lo que hace `readdirSync`). Por eso la
 *     puerta pregunta primero: un doble que devolviera [] en vez de lanzar haría pasar @s26 con
 *     producción rota, informando por la rama de @s29.
 */
export interface ArtefactoDeProduccion {
  existe(): boolean
  listarHtml(): readonly FicheroHtml[]
}

export interface PeticionPuertaCascaron {
  readonly artefacto: ArtefactoDeProduccion
  readonly rutasEsperadas: readonly string[]
}

export interface ResultadoPuertaCascaron {
  readonly codigoSalida: number
  readonly lineas: readonly string[]
}

const DIRECTORIO_ARTEFACTO = 'dist'
const FICHERO_DE_ENTRADA = /(^|\/)index\.html$/
const CODIGO_EXITO = 0
const CODIGO_FALLO = 1

/** `dist/index.html` → `/` · `dist/servicios/index.html` → `/servicios`. */
export function rutaDelFichero(ubicacion: string): string {
  const relativa = ubicacion.slice(`${DIRECTORIO_ARTEFACTO}/`.length)

  return `/${relativa.replace(FICHERO_DE_ENTRADA, '')}`
}

/** Acusar, no gruñir: cada línea dice QUÉ ruta, QUÉ regla y con QUÉ valor. */
function describirViolacion(violacion: ViolacionCascaron): string {
  return `${violacion.ruta} — ${violacion.regla}: "${violacion.valor}"`
}

function motivoDelReventon(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function ejecutarPuertaDelCascaron(
  peticion: PeticionPuertaCascaron,
): ResultadoPuertaCascaron {
  try {
    return inspeccionarArtefacto(peticion)
  } catch (error: unknown) {
    // FALLA CERRADA (@s29): ante la duda, BUILD ROTO, NUNCA BUILD VERDE. Tragarse la excepción y
    // devolver «0 violaciones» sería PEOR que no tener puerta, porque además daría confianza
    // falsa. Es literalmente cómo se evaporaron los 3 bloqueantes AA del stack base [V].
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: [
        `la puerta del cascarón no pudo completar la inspección: ${motivoDelReventon(error)}`,
      ],
    }
  }
}

function inspeccionarArtefacto(peticion: PeticionPuertaCascaron): ResultadoPuertaCascaron {
  const { artefacto, rutasEsperadas } = peticion

  // LA GUARDA DE LA GUARDA (@s27). Sin ella, la de @s26 SE DESACTIVA SOLA: con la lista vacía,
  // «una HTML por cada ruta esperada» se satisface VACUAMENTE y la puerta pasa sin inspeccionar
  // nada. El mutante «vaciar RUTAS_ESPERADAS» tiene que romper aquí.
  if (rutasEsperadas.length === 0) {
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: ['la lista de rutas esperadas está vacía: no hay nada que exigirle al artefacto'],
    }
  }

  // El artefacto se lee SOLO si existe: `listarHtml` LANZA si no (contrato del puerto). Sin
  // este `existe()`, un dist/ ausente informaría por la rama de @s29 y NO declararía qué ruta
  // esperada no encontró, que es lo que @s26 exige.
  const paginas = artefacto.existe()
    ? artefacto.listarHtml().map((fichero) => ({
        ruta: rutaDelFichero(fichero.ubicacion),
        html: fichero.contenido,
      }))
    : []

  // La inspección incluye la GUARDA de «una HTML por cada ruta esperada» (@s26): va PRIMERO,
  // porque un dist/ vacío tiene que acusar QUÉ RUTA FALTA, no «no encontré enlaces».
  const violaciones = inspeccionarSitio(paginas, rutasEsperadas)

  if (violaciones.length > 0) {
    return { codigoSalida: CODIGO_FALLO, lineas: violaciones.map(describirViolacion) }
  }

  // GUARDA DEL EXTRACTOR (@s28). EL OBJETO VIGILADO NO ES EL SITIO: ES EL EXTRACTOR. Que la
  // puerta anti-404 informe «0 enlaces rotos» habiendo mirado 0 ENLACES es el mismo verde por
  // vacuidad de la guarda anterior, un nivel más abajo. Cuenta TODOS los href (internos,
  // externos, `tel:`, anclas) porque lo que detecta es que EL EXTRACTOR ESTÁ ROTO, no que el
  // sitio tenga pocos enlaces.
  const cuantosEnlaces = paginas.reduce(
    (total, pagina) => total + extraerEnlaces(pagina.html).length,
    0,
  )

  if (cuantosEnlaces === 0) {
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: [
        'no se inspeccionó ningún enlace del artefacto: el extractor de href no encontró nada',
      ],
    }
  }

  return { codigoSalida: CODIGO_EXITO, lineas: [] }
}

/**
 * TODAS las reglas que esta puerta puede emitir. Existe para que @s34 pueda DEMOSTRAR que la
 * puerta del cascarón NO dice nada del origen ni de los placeholders: esa violación la emite la
 * PUERTA DE F-01 por la vía del flag, y F-04 SE APOYA EN ELLA en vez de duplicarla.
 */
export const REGLAS_DEL_CASCARON: readonly string[] = [
  REGLA_LANG,
  REGLA_TITULO,
  REGLA_DESCRIPCION,
  REGLA_CANONICA_AUSENTE,
  REGLA_CANONICA_REPETIDA,
  REGLA_H1,
  ...LANDMARKS_EXIGIDOS.map(reglaDeLandmark),
  REGLA_SECTION,
  REGLA_JSONLD_AUSENTE,
  REGLA_JSONLD_NO_PARSEABLE,
  REGLA_TIPO,
  REGLA_SIN_NAME,
  REGLA_SIN_ADDRESS,
  REGLA_ADDRESS_NO_POSTAL,
  REGLA_ADDRESS_INCOMPLETA,
  REGLA_GEO_AUSENTE,
  REGLA_GEO_DISTINTO,
  REGLA_RESENAS,
  REGLA_HORARIO,
  REGLA_ENLACE_ROTO,
]

/**
 * LAS RUTAS QUE EL ARTEFACTO DEBE TRAER. La conoce la puerta, no el humilde (como el `dist` de
 * F-01 y la `RUTA_DE_LOS_TOKENS` de F-03).
 *
 * DECLARARLAS ES MEJOR QUE UN MÍNIMO MÁGICO: crece con las rutas y nadie tiene que acordarse de
 * subir un número. Hoy son ["/"] porque hoy el sitio SOLO tiene la home [V: src/App.tsx]; cuando
 * F-16 añada las páginas legales, se añaden aquí y la guarda las exige sola.
 */
export const RUTAS_ESPERADAS: readonly string[] = ['/']
