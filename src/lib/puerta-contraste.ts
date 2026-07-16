/**
 * La PUERTA de contraste — lee el SCSS, recorre la matriz de uso y decide (F-03).
 *
 * Contrato: features/tokens_paleta_contraste.feature.
 * La matemática (src/lib/contraste.ts) es pura y no sabe de ficheros ni de exit codes.
 * Aquí vive lo que decide; en tools/puerta-contraste.ts solo el cableado con node:fs.
 * Mismo reparto que F-01 (placeholders.ts ↔ puerta.ts ↔ tools/puerta-placeholders.ts).
 */
import { componer, ErrorDeContraste, hexARgb, ratio, type Rgb } from './contraste.ts'

/**
 * Extrae `--token: valor;` del SCSS. Deliberadamente NO interpreta `:root`: lo que importa
 * es que el token esté declarado y con qué valor.
 *
 * NO va anclada al principio de línea: el `:root { --a: x; --b: y; }` de una sola línea es
 * SCSS igual de válido que el multilínea, y anclarla obligaría a un formato concreto sin que
 * nada lo exija. El espaciado alrededor de `:` es OPCIONAL en CSS (`--a:#fff` ≡ `--a : #fff`).
 *
 * El comentario de línea (`//`) se descarta ANTES, para que un `// --muted: #9C7F89;` no
 * cuente como declarado y resucite el valor viejo.
 */
const DECLARACION_DE_TOKEN = /(--[\w-]+)\s*:\s*([^;]+);/g
const INICIO_DE_COMENTARIO = '//'
const NO_ENCONTRADO = -1

export function extraerTokens(scss: string): Map<string, string> {
  const tokens = new Map<string, string>()

  for (const linea of scss.split('\n')) {
    // Lo que cuenta es lo que hay ANTES del comentario: se corta ahí.
    //
    // Se busca la POSICIÓN en vez de sustituir el comentario por "" o partir por un regex, y
    // no es cosmético: con `.replace(/\/\/.*/, '')` el `''` y el `.*` son mutantes
    // EQUIVALENTES —el comentario llega siempre a fin de línea, así que ni el relleno ni la
    // longitud del match pueden crear o romper una declaración, que necesita `--x`, `:` y
    // `;`—, y un mutante equivalente no se puede matar con ningún test: solo excluirlo. Así,
    // en cambio, cada variante es mortal y la cubren los tests de @s10 que ya existen.
    const inicioDelComentario = linea.indexOf(INICIO_DE_COMENTARIO)
    const antesDelComentario =
      inicioDelComentario === NO_ENCONTRADO ? linea : linea.slice(0, inicioDelComentario)

    for (const declaracion of antesDelComentario.matchAll(DECLARACION_DE_TOKEN)) {
      tokens.set(declaracion[1], declaracion[2].trim())
    }
  }

  return tokens
}

/**
 * El rol determina el umbral (SC 1.4.3 texto normal 4,5:1 · SC 1.4.11 componentes 3:1).
 *
 * NO hay rama de «texto grande» (3:1) a propósito, y esto es una decisión, no un olvido:
 * ninguna fila de la matriz es texto grande —«Studio» es el candidato y @s16 fija justo lo
 * contrario, que se evalúa por su tamaño MÍNIMO (14 px) y por tanto como texto normal—, así
 * que implementar esa rama sería producción que ningún test rojo pidió (Ley 1) y dejaría un
 * mutante inmortal en el `>=` del umbral de tamaño. Precedente del repo: el guarda
 * `length===0` de F-01, retirado por exactamente esta razón.
 * El día que entre una fila de texto grande, hará falta un escenario nuevo en el .feature.
 */
export type Rol = 'texto' | 'texto/icono' | 'componente'

const UMBRAL_TEXTO_NORMAL = 4.5
const UMBRAL_COMPONENTE = 3

export function umbralDe(rol: Rol): number {
  return rol === 'componente' ? UMBRAL_COMPONENTE : UMBRAL_TEXTO_NORMAL
}

/**
 * WCAG exige un ratio DE AL MENOS el umbral: un par que da exactamente 4,5 CUMPLE. De ahí el
 * `>=` y no el `>`. Ningún par real de la paleta cae justo en el umbral, así que la
 * diferencia solo se puede fijar con un ratio sintético (y sin fijarla, `>` pasaría por
 * bueno).
 */
export function cumple(ratioDelPar: number, umbral: number): boolean {
  return ratioDelPar >= umbral
}

/**
 * Un color de la matriz: un token del SCSS, un hex literal, o una composición alfa sobre
 * otro color (el `rgba(...)` del pie y el `color-mix()` de la cabecera).
 */
export type EspecificacionColor =
  | { readonly clase: 'token'; readonly token: string }
  | { readonly clase: 'hex'; readonly hex: string }
  | {
      readonly clase: 'compuesto'
      readonly color: EspecificacionColor
      readonly alfa: number
      readonly sobre: EspecificacionColor
    }
  /**
   * Un token cuyo valor es `color-mix(in srgb, var(--X) N%, transparent)`, compuesto sobre
   * lo que scrollee debajo. La opacidad se LEE DEL SCSS: es lo que hace que bajar el 88 a 82
   * ponga la puerta en rojo (@s18) en vez de pasar desapercibido.
   */
  | {
      readonly clase: 'cabecera'
      readonly token: string
      readonly sobre: EspecificacionColor
    }

/** El alfa se escribe como lo escribe el CSS y el contrato: `.70`, no `0.7`. */
function describirAlfa(alfa: number): string {
  return alfa.toFixed(2).slice(1)
}

export function describirColor(color: EspecificacionColor): string {
  switch (color.clase) {
    case 'token':
      return color.token
    case 'hex':
      return color.hex
    case 'compuesto':
      return `rgba(${describirColor(color.color)},${describirAlfa(color.alfa)})`
    case 'cabecera':
      return `${color.token} sobre ${describirColor(color.sobre)}`
  }
}

/**
 * Lee `color-mix(in srgb, var(--X) N%, transparent)` y devuelve el token base y su alfa.
 *
 * PRECONDICIÓN (C5): exige que el color base sea OPACO. La equivalencia con α = N/100 vale
 * porque la interpolación de color-mix es PREMULTIPLICADA: `transparent` es `rgb(0 0 0 / 0)`,
 * su RGB premultiplicado es [0,0,0] y su peso va SOLO al alfa, así que el RGB del base
 * sobrevive intacto y solo baja su alfa. La regla general es α_resultante = α(base) × N/100;
 * con un base ya translúcido este modelo NO aplica. `--bg #FDF4F7` es opaco, así que aplica.
 */
const COLOR_MIX_TRANSLUCIDO =
  /color-mix\(\s*in\s+srgb\s*,\s*var\(\s*(--[\w-]+)\s*\)\s*(\d+(?:\.\d+)?)%\s*,\s*transparent\s*\)/
const PORCENTAJE_COMPLETO = 100

function leerCabecera(valor: string, token: string): { base: string; alfa: number } {
  const mezcla = COLOR_MIX_TRANSLUCIDO.exec(valor)

  if (mezcla === null) {
    throw new ErrorDeContraste(
      `el token "${token}" no declara un color-mix translúcido reconocible: "${valor}"`,
    )
  }

  return { base: mezcla[1], alfa: Number(mezcla[2]) / PORCENTAJE_COMPLETO }
}

/**
 * Resuelve un color contra el SCSS. Falla CERRADA (@s15): un token que la matriz nombra pero
 * el :root no declara, o un hex malformado, LANZAN. Devolver [0,0,0] a medias sería peor que
 * no tener puerta: la puerta evaluaría un ratio falso y felicitaría al build.
 */
/** Una sola puerta de entrada a los tokens: un token que la matriz nombra y el :root no
 * declara LANZA, lo use quien lo use (color plano o cabecera). */
function valorDelToken(token: string, tokens: Map<string, string>): string {
  const valor = tokens.get(token)

  if (valor === undefined) {
    throw new ErrorDeContraste(
      `el token "${token}" que usa la matriz no está declarado en el :root`,
    )
  }

  return valor
}

export function resolverColor(color: EspecificacionColor, tokens: Map<string, string>): Rgb {
  switch (color.clase) {
    case 'hex':
      return hexARgb(color.hex)
    case 'token':
      return hexARgb(valorDelToken(color.token, tokens))
    case 'compuesto':
      return componer(
        resolverColor(color.color, tokens),
        color.alfa,
        resolverColor(color.sobre, tokens),
      )
    case 'cabecera': {
      const { base, alfa } = leerCabecera(valorDelToken(color.token, tokens), color.token)

      return componer(
        resolverColor({ clase: 'token', token: base }, tokens),
        alfa,
        resolverColor(color.sobre, tokens),
      )
    }
  }
}

export interface ParDeUso {
  readonly fg: EspecificacionColor
  readonly bg: EspecificacionColor
  readonly rol: Rol
  /** Por qué este par existe en la página. Es lo que hace auditable la matriz (A-13). */
  readonly uso: string
}

const token = (nombre: string): EspecificacionColor => ({ clase: 'token', token: nombre })

/**
 * LA MATRIZ DE USO (A-13): las combinaciones que la página usa DE VERDAD, no el producto
 * cartesiano de tokens. La puerta la recorre y recalcula cada par desde el SCSS.
 *
 * Los colores que el contrato escribe como hex (#FFFFFF, #186237) se alcanzan por su TOKEN,
 * para que la puerta los lea del :root: si alguien revierte --estado-en-linea al viejo
 * #2F9D5F (2,69:1), el build rompe. Con el hex literal en la matriz, no se enteraría.
 */
export const MATRIZ_DE_USO: readonly ParDeUso[] = [
  { fg: token('--muted'), bg: token('--bg'), rol: 'texto', uso: 'texto secundario sobre el fondo' },
  {
    fg: token('--muted'),
    bg: token('--surface'),
    rol: 'texto',
    uso: 'texto secundario sobre tarjeta',
  },
  { fg: token('--accent-dark'), bg: token('--bg'), rol: 'texto', uso: 'enlace/acento sobre fondo' },
  {
    fg: token('--accent-dark'),
    bg: token('--surface'),
    rol: 'texto',
    uso: 'enlace/acento sobre tarjeta',
  },
  {
    fg: token('--accent-dark'),
    bg: token('--surface2'),
    rol: 'texto',
    uso: 'enlace/acento sobre superficie alterna',
  },
  {
    fg: token('--accent-dark'),
    bg: token('--accent-soft'),
    rol: 'texto',
    uso: 'tag sobre pastilla suave',
  },
  {
    fg: token('--on-accent'),
    bg: token('--accent-dark'),
    rol: 'texto',
    uso: 'botón «Reservar» (antes 4,37 con --accent: el bloqueante que abrió esta feature)',
  },
  {
    fg: token('--on-accent'),
    bg: token('--accent-2'),
    rol: 'texto/icono',
    uso: 'badge/icono sobre acento 2',
  },
  { fg: token('--ink'), bg: token('--bg'), rol: 'texto', uso: 'titular sobre el fondo' },
  {
    fg: token('--ink'),
    bg: token('--surface2'),
    rol: 'texto',
    uso: 'pregunta de FAQ sobre superficie alterna',
  },
  {
    fg: token('--ink'),
    bg: token('--accent-soft'),
    rol: 'texto',
    uso: '«Studio» del logo: clamp(14px, 2.2vw, 24px) → se evalúa a 14 px, texto normal (@s16)',
  },
  { fg: token('--text'), bg: token('--bg'), rol: 'texto', uso: 'cuerpo sobre el fondo' },
  {
    fg: token('--text'),
    bg: token('--surface2'),
    rol: 'texto',
    uso: 'cuerpo sobre superficie alterna',
  },
  {
    fg: { clase: 'compuesto', color: token('--on-accent'), alfa: 0.7, sobre: token('--ink') },
    bg: token('--ink'),
    rol: 'texto',
    uso: 'texto atenuado del pie sobre el fondo del pie (única fila compuesta: 4,59 por A-16)',
  },
  {
    fg: token('--border-interactive'),
    bg: token('--accent-soft'),
    rol: 'componente',
    uso: 'borde de swatch/día/input: identifica el control, SC 1.4.11 → 3:1',
  },
  {
    fg: token('--estado-en-linea'),
    bg: token('--accent-soft'),
    rol: 'texto',
    uso: 'estado «en línea» (antes #2F9D5F, 2,69:1)',
  },
  // A-15 / A6. La cabecera translúcida se vigila contra el PEOR UNDER POSIBLE, el negro puro:
  // si pasa con negro puro, pasa con cualquier cosa. Esto DESACOPLA F-03 de F-06 y F-17 —no
  // hace falta enumerar qué secciones scrollean debajo ni restringir cómo de oscuras pueden
  // ser las fotos— y evita el fallo del contrato anterior, que declaraba «foto oscura» solo
  // para el logo y NO para la nav, que es justo la que fallaba. Van LAS DOS: logo y nav viven
  // en la MISMA cabecera y lo que scrollea bajo uno scrollea bajo el otro.
  {
    fg: token('--muted'),
    bg: { clase: 'cabecera', token: '--header-bg', sobre: { clase: 'hex', hex: '#000000' } },
    rol: 'texto',
    uso: 'enlaces de la nav sobre la cabecera translúcida, con el peor under posible debajo',
  },
  {
    fg: token('--ink'),
    bg: { clase: 'cabecera', token: '--header-bg', sobre: { clase: 'hex', hex: '#000000' } },
    rol: 'texto',
    uso: 'logo sobre la cabecera translúcida, con el peor under posible debajo',
  },
]

/** La ruta del SCSS vigilado. La conoce la puerta, no el humilde (como el `dist` de F-01). */
export const RUTA_DE_LOS_TOKENS = 'src/styles/_tokens.scss'

/**
 * El mínimo CONOCIDO de pares que la puerta exige haber evaluado (A-13, guarda (a)).
 *
 * Es un LITERAL a propósito, NO `MATRIZ_DE_USO.length`: con `.length` la guarda sería
 * tautológica —borra una fila y el mínimo baja solo—, que es exactamente el verde por
 * vacuidad que viene a impedir. Si alguien borra un par de la matriz, el build ROMPE y hay
 * que venir aquí a bajar el número a mano, dejando rastro en el diff.
 */
export const MINIMO_DE_PARES = 18

export interface Evaluacion {
  readonly fg: string
  readonly bg: string
  readonly rol: Rol
  readonly uso: string
  readonly ratio: number
  readonly umbral: number
  readonly pasa: boolean
}

export function evaluarMatriz(scss: string, matriz: readonly ParDeUso[]): Evaluacion[] {
  const tokens = extraerTokens(scss)

  return matriz.map((par) => {
    const umbral = umbralDe(par.rol)
    const ratioDelPar = ratio(resolverColor(par.fg, tokens), resolverColor(par.bg, tokens))

    return {
      fg: describirColor(par.fg),
      bg: describirColor(par.bg),
      rol: par.rol,
      uso: par.uso,
      ratio: ratioDelPar,
      umbral,
      pasa: cumple(ratioDelPar, umbral),
    }
  })
}

export interface PeticionPuertaContraste {
  /**
   * El único contacto de la puerta con el mundo. Lo cablea el humilde de tools/.
   *
   * CONTRATO DEL PUERTO: LANZA si el fichero no existe o no se puede leer, que es lo que
   * hace `readFileSync`. Un doble que devolviera "" en vez de lanzar haría pasar @s15 con
   * producción rota, informando por la rama equivocada (la del mínimo de pares).
   */
  readonly leerScss: () => string
  readonly matriz: readonly ParDeUso[]
  readonly minimoDePares: number
}

export interface ResultadoPuertaContraste {
  readonly codigoSalida: number
  readonly lineas: readonly string[]
}

const CODIGO_EXITO = 0
const CODIGO_FALLO = 1
const DECIMALES_DEL_INFORME = 2

/** Acusar, no gruñir: cada línea dice QUÉ par, con QUÉ ratio, contra QUÉ umbral y en QUÉ uso. */
function describirViolacion(evaluacion: Evaluacion): string {
  const ratioLegible = evaluacion.ratio.toFixed(DECIMALES_DEL_INFORME)

  return `"${evaluacion.fg}" sobre "${evaluacion.bg}" (${evaluacion.rol}): ratio ${ratioLegible} < umbral ${evaluacion.umbral} — ${evaluacion.uso}`
}

export function ejecutarPuertaDeContraste(
  peticion: PeticionPuertaContraste,
): ResultadoPuertaContraste {
  let evaluaciones: Evaluacion[]

  try {
    evaluaciones = evaluarMatriz(peticion.leerScss(), peticion.matriz)
  } catch (error: unknown) {
    // Falla cerrada (@s15): ante la duda, build roto, nunca build verde. Tragarse la
    // excepción y devolver «0 fallos» sería PEOR que no tener puerta, porque además daría
    // confianza falsa. Es literalmente cómo se evaporaron los 3 bloqueantes AA del base.
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: [
        `la puerta de contraste no pudo completar el análisis: ${error instanceof Error ? error.message : String(error)}`,
      ],
    }
  }

  // Guarda anti-«verde por vacuidad» (A-13(a), análoga a A-8 de F-01): 0 fallos sobre 0
  // pares no es estar protegido, es no haber mirado. Una matriz vacía, o un regex que deja
  // de casar el :root, haría que la puerta pasara «protegidos».
  if (evaluaciones.length < peticion.minimoDePares) {
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: [
        `no se evaluó el mínimo de pares exigido: ${evaluaciones.length} de ${peticion.minimoDePares}`,
      ],
    }
  }

  // El orden del informe es el de la matriz declarada: entrada igual → salida igual (@s12).
  const lineas = evaluaciones.filter((una) => !una.pasa).map(describirViolacion)

  return { codigoSalida: lineas.length > 0 ? CODIGO_FALLO : CODIGO_EXITO, lineas }
}
