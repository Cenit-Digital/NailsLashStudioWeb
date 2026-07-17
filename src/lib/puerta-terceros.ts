/**
 * La PUERTA de terceros — el decisor PURO (F-05).
 *
 * Contrato: features/cero_terceros.feature.
 * Recibe los BYTES CRUDOS de `dist/` y el TEXTO de `vite.config.ts`, y devuelve `{codigoSalida,
 * lineas}`. NO lee ficheros, NI el reloj, NI `process.env`: el cableado con node:fs vive en
 * tools/puerta-terceros.ts. Mismo reparto que F-01, F-03 y F-04.
 *
 * 🔴 POR QUÉ EXISTE F-05, Y ES CRITERIO DE PROYECTO, NO UNA NORMA:
 *   «Autoalojamos las fuentes para que el sitio no haga ninguna petición a dominios de terceros;
 *    así ningún tercero recibe la IP del visitante y no hace falta ningún análisis jurídico.»
 * Es decisión del editor, es SUFICIENTE POR SÍ SOLA y NO CUELGA DE NINGUNA CITA. El apalancamiento
 * es DE PROCESO: sustituye un análisis jurídico por un hecho mecánico verificable en cada build.
 * F-11, F-12 y F-14 heredan el invariante sin volver a discutirlo.
 */
import {
  detectarOrigenesExternos,
  type OrigenExterno,
  type RecursoDeArtefacto,
  sinComillas,
} from './terceros.ts'

/** El objeto vigilado es el PAR `[familia, peso]` del CSS, JAMÁS un fichero de `dist/assets`. */
export type ParDeFuente = readonly [string, number]

/**
 * 🔴 LA GUARDA ANTI-VACUIDAD: LISTA DECLARADA, NO MÍNIMO MÁGICO. Sin guarda, `dist/` vacío → 0
 * orígenes → build VERDE → «protegidos». 0 FALLOS SOBRE 0 FUENTES NO ES ESTAR PROTEGIDO: ES NO
 * HABER MIRADO. Es A-8 en F-01, @s14/@s15 en F-03 y @s26/@s27 en F-04.
 *
 * La puerta exige que el conjunto de `@font-face` del CSS de `dist` sea EXACTAMENTE ÉSTE — NI UNO
 * MÁS, NI UNO MENOS. Los 6 pares están MEDIDOS sobre el prototipo (`Opcion-1-Rosa.dc.html`), NO
 * heredados [V]: Manrope (cuerpo, botones, nav) en 400/500/600/700; Gilda Display (todos los h2/h3,
 * precios) en 400; Great Vibes (el «Nails Lash» del hero) en 400.
 *
 * POR QUÉ LISTA DECLARADA Y NO `MINIMO_DE_PARES = 18` (la forma de F-03): (1) CRECE CON EL DISEÑO,
 * nadie tiene que acordarse de subir un número; (2) un mínimo sería frágil POR UNA RAZÓN AJENA A LA
 * FEATURE — el nº de ficheros CSS de `dist` es chunking y hash de Vite.
 *
 * 🔴 SE CUENTAN PARES, NO FICHEROS, por dos razones medidas [V]: cada `@font-face` emite `woff2` Y
 * `woff` → 12 ficheros para 6 pares; y un `.woff2` de <4096 B NO DEJA FICHERO: se inlinea a
 * `data:` (@s17). Contar ficheros da 12 hoy y otra cosa mañana, por razones que NO tienen NADA que
 * ver con terceros.
 *
 * ✅ A-28 (puerta humana, 2026-07-17): SOLO subset `latin`, que cubre U+0000-00FF (todo el
 * español). El límite queda DECLARADO: un nombre con `Ł`/`ř`/`ğ` PINTA TOFU, sin error —
 * `latin-400.css` no tiene `unicode-range` [V]. `latin-ext` entrará el día que exista un nombre
 * REAL que lo exija, y ENTRARÁ CON SU ESCENARIO, que actualizará esta lista y @s38.
 *
 * 🔴 LA FIJA @s38 CONTRA UN LITERAL ESCRITO A MANO, y es OBLIGATORIO: `ArrayDeclaration` la vacía
 * (`[…]` → `[]`), y con la lista vacía la guarda SE SATISFACE VACUAMENTE. @s30 NO lo mata —inyecta
 * su propio `[]` y jamás evalúa esta constante—, así que sin @s38 el mutante sería INMORTAL con
 * `break: 100`. Vive AQUÍ, dentro de `mutate`, y la cablea el humilde: si viviera en `tools/`, el
 * mutante ni existiría y su valor de producción no lo aseveraría nadie (la deuda 2 de F-03).
 */
export const PARES_DE_FUENTE_ESPERADOS: readonly ParDeFuente[] = [
  ['Manrope', 400],
  ['Manrope', 500],
  ['Manrope', 600],
  ['Manrope', 700],
  ['Gilda Display', 400],
  ['Great Vibes', 400],
]

/**
 * EL PUERTO — DOS CAMPOS SUELTOS, forma F-03 (`readonly leerScss: () => string`), y NO una interfaz
 * con `existe*`.
 *
 * 🔴 F-05 NO LLEVA `existe*`, Y ESTÁ RAZONADO: «las tres puertas comparten un patrón exacto» es
 * FALSO — es 2 de 3 [V]. El `existe*` es CONDICIONAL, NO DOGMA: solo hace falta cuando la puerta
 * necesita distinguir «el artefacto no está» de «el artefacto está y está mal» PARA INFORMAR POR LA
 * RAMA CORRECTA. F-04 lo necesita (su @s26 exige acusar QUÉ RUTA falta). F-05 NO: si `dist/` no
 * existe, `readdirSync` LANZA, el `catch` falla cerrada con el motivo, y eso ya es informativo y
 * correcto. SIN ESCENARIO QUE LA EXIJA, `existe*` SERÍA PRODUCCIÓN SIN TEST ROJO Y UN MUTANTE
 * INMORTAL.
 *
 * CONTRATO DEL PUERTO, escrito JUNTO AL PUERTO porque el doble de test y el real TIENEN que
 * coincidir (lección de @s20 de F-01):
 *   - `leerArtefacto` LANZA si `dist/` no existe (es lo que hace `readdirSync`). Devuelve los
 *     recursos YA FILTRADOS por extensión: la pura nunca ve un `.js` ni un `.woff2` (@s34, @s40).
 *   - `leerConfigVite` LANZA si `vite.config.ts` no existe (es lo que hace `readFileSync`).
 * EL DOBLE DEL TEST LO HONRA: LANZA DONDE EL REAL LANZA (@s32, @s33).
 */
export interface PeticionPuertaTerceros {
  readonly leerArtefacto: () => readonly RecursoDeArtefacto[]
  readonly leerConfigVite: () => string
  readonly allowlist: readonly string[]
  readonly paresEsperados: readonly ParDeFuente[]
}

export interface ResultadoPuertaTerceros {
  readonly codigoSalida: number
  readonly lineas: readonly string[]
}

const CODIGO_EXITO = 0
const CODIGO_FALLO = 1

const TIPO_CSS = 'css'
const FICHERO_DE_CONFIG = 'vite.config.ts'

/**
 * La única `base` que sostiene el invariante de la ruta root-absoluta. Pasa `base` NO DECLARADA o
 * declarada EXACTAMENTE `'/'`; CUALQUIER OTRA COSA es violación — `'./'` no empieza por http y
 * rompe el invariante igual (@s27).
 */
const BASE_PROPIA = '/'

/** `@font-face` … `}`. Sirve para las dos formas reales, `@font-face {` y la minificada `@font-face{`. */
const BLOQUE_FONT_FACE = /@font-face([^}]*)\}/g

/** `font-family: 'Manrope'` → `font-family` → ` 'Manrope'`. Sin `\s*`: los espacios los quita `trim`. */
const DECLARACION = /([a-z-]+):([^;}]*)/g

/** `base: 'https://…'` en el TEXTO de vite.config.ts. Sin `\s*`: las comillas y los espacios se quitan aparte. */
const BASE_DE_VITE = /\bbase:([^,\n]*)/

const FONT_FAMILY = 'font-family'
const FONT_WEIGHT = 'font-weight'

function declaracionesDe(bloque: string): Map<string, string> {
  const declaraciones = new Map<string, string>()

  for (const encontrada of bloque.matchAll(DECLARACION)) {
    declaraciones.set(encontrada[1], encontrada[2])
  }

  return declaraciones
}

/**
 * 🔴 EL [I] QUE EL CONTRATO MANDA MEDIR, NO SUPONER: que el nombre de familia sobreviva al CSS
 * MINIFICADO de `dist` es una INFERENCIA — Vite no renombra identificadores CSS, PERO PUEDE QUITAR
 * LAS COMILLAS. Por eso la comparación es sobre el nombre DESTOKENIZADO y SIN COMILLAS (@s37).
 * `'Gilda Display'` LLEVA UN ESPACIO: una destokenización ingenua (partir por espacios) se rompe
 * ahí, y por eso es la familia que @s37 elige.
 *
 * `String(…)` y no `?? ''`: un `@font-face` sin `font-family` o sin `font-weight` NO SE ADIVINA —
 * da un par que no casa con ninguno esperado y ROMPE EL BUILD. Ningún escenario fija una regla de
 * defaulting (`font-weight` ausente → 400) y NO SE INVENTA: sería producción sin test rojo, la
 * misma razón por la que F-05 no lleva `existe*`. ANTE LA DUDA: BUILD ROTO, NUNCA BUILD VERDE.
 *
 * El peso NO lleva `trim()`: `Number(' 400')` ya es 400, así que un `trim()` aquí sería CÓDIGO
 * MUERTO — y código muerto es un mutante equivalente escrito a propósito.
 */
function parDelBloque(bloque: string): ParDeFuente {
  const declaraciones = declaracionesDe(bloque)

  return [
    sinComillas(String(declaraciones.get(FONT_FAMILY))).trim(),
    Number(String(declaraciones.get(FONT_WEIGHT))),
  ]
}

function paresDelCss(recursos: readonly RecursoDeArtefacto[]): readonly ParDeFuente[] {
  const pares: ParDeFuente[] = []

  for (const recurso of recursos) {
    if (recurso.tipo === TIPO_CSS) {
      for (const bloque of recurso.contenido.matchAll(BLOQUE_FONT_FACE)) {
        pares.push(parDelBloque(bloque[1]))
      }
    }
  }

  return pares
}

function contiene(pares: readonly ParDeFuente[], buscado: ParDeFuente): boolean {
  return pares.some(([familia, peso]) => familia === buscado[0] && peso === buscado[1])
}

/** LA PUERTA ACUSA, NO GRUÑE (@s25): se declara EXACTAMENTE qué par sobra o cuál falta. */
function describirPar(par: ParDeFuente): string {
  return `("${par[0]}", ${String(par[1])})`
}

function describirOrigen(origen: OrigenExterno): string {
  return `${origen.ubicacion} — origen externo "${origen.origen}": ${origen.construccion}`
}

function motivoDelReventon(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * La `base` declarada en el texto de la config, o null si NO SE DECLARA — que es el estado real de
 * hoy [V: `vite.config.ts` del repo no declara `base`] y es válido.
 */
function baseDeclarada(config: string): string | null {
  const encontrada = BASE_DE_VITE.exec(config)

  return encontrada === null ? null : sinComillas(encontrada[1]).trim()
}

function* violacionesDeBase(config: string): Generator<string> {
  const base = baseDeclarada(config)

  if (base !== null && base !== BASE_PROPIA) {
    yield `${FICHERO_DE_CONFIG} — base debe no declararse o ser exactamente "/": "${base}"`
  }
}

/**
 * 🔴 ES LA GUARDA ANTI-VACUIDAD Y EL ACCEPTANCE 4 A LA VEZ, y ésa es la razón de elegir esta forma.
 * El `wght@300` del prototipo entraría como un `@font-face` de peso 300 en `dist` → conjunto
 * distinto → VIOLACIÓN (@s29). Y se asevera sobre el ARTEFACTO, no sobre los imports de `src/`: la
 * filosofía de F-04. Un test que leyera los `import` de `src/` sería ciego a un `@font-face` que
 * entre por cualquier otra vía.
 */
function* violacionesDeFuentes(
  recursos: readonly RecursoDeArtefacto[],
  paresEsperados: readonly ParDeFuente[],
): Generator<string> {
  const encontrados = paresDelCss(recursos)

  for (const esperado of paresEsperados) {
    if (!contiene(encontrados, esperado)) {
      yield `falta el par ${describirPar(esperado)}`
    }
  }

  for (const encontrado of encontrados) {
    if (!contiene(paresEsperados, encontrado)) {
      yield `sobra el par ${describirPar(encontrado)}`
    }
  }
}

export function ejecutarPuertaDeTerceros(
  peticion: PeticionPuertaTerceros,
): ResultadoPuertaTerceros {
  try {
    return inspeccionarArtefacto(peticion)
  } catch (error: unknown) {
    // FALLA CERRADA (@s32, @s33): ANTE LA DUDA, BUILD ROTO, NUNCA BUILD VERDE. Una puerta que se
    // traga su propia excepción y devuelve `[]` es PEOR que no tener puerta, porque además da
    // confianza. Es literalmente cómo se evaporaron los 3 bloqueantes AA del stack base [V].
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: [`la puerta de terceros no pudo completar la inspección: ${motivoDelReventon(error)}`],
    }
  }
}

function inspeccionarArtefacto(peticion: PeticionPuertaTerceros): ResultadoPuertaTerceros {
  const { leerArtefacto, leerConfigVite, allowlist, paresEsperados } = peticion

  // LA GUARDA DE LA GUARDA (@s30). Sin ella, la de @s29 SE DESACTIVA SOLA: con la lista vacía, «el
  // conjunto de @font-face coincide con el esperado» se satisface VACUAMENTE y la puerta pasaría
  // SIN VIGILAR NI UNA FUENTE. @s14 de F-03 tardó UN JUDGE en descubrir esta trampa; aquí se
  // hereda escrita.
  if (paresEsperados.length === 0) {
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: ['la lista de pares de fuente esperados está vacía: no hay ninguna fuente que exigirle al artefacto'],
    }
  }

  const recursos = leerArtefacto()

  // EL OBJETO VIGILADO NO ES EL SITIO: ES EL EXTRACTOR (@s31, precedente literal @s28 de F-04). Que
  // la puerta informe «0 orígenes externos» habiendo mirado 0 RECURSOS es el mismo verde por
  // vacuidad, un nivel más abajo: si el filtro de extensión del humilde deja de casar, o `dist/`
  // sale vacío, la puerta pasa «protegidos» SIN HABER MIRADO NADA.
  if (recursos.length === 0) {
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: ['no se inspeccionó ningún recurso html o css del artefacto: no hay nada sobre lo que concluir'],
    }
  }

  const violaciones = [
    ...detectarOrigenesExternos(recursos, allowlist).map(describirOrigen),
    ...violacionesDeBase(leerConfigVite()),
    ...violacionesDeFuentes(recursos, paresEsperados),
  ]

  return violaciones.length === 0
    ? { codigoSalida: CODIGO_EXITO, lineas: [] }
    : { codigoSalida: CODIGO_FALLO, lineas: violaciones }
}
