/**
 * Contraste WCAG 2.2 (W3C G17) — la capa PURA de la puerta (F-03).
 *
 * Contrato: features/tokens_paleta_contraste.feature.
 * No lee ficheros, ni el reloj, ni el entorno, y no decide códigos de salida: recibe
 * colores y devuelve números. Quien lee el SCSS, recorre la matriz de uso y decide el
 * exit code es la puerta (src/lib/puerta-contraste.ts). Mismo patrón que F-01.
 */

/** Canales sRGB 0-255. Enteros al salir de `hexARgb`; flotantes al salir de `componer` (A-16). */
export type Rgb = readonly [number, number, number]

/** El error de dominio de esta capa (docs/conventions.md: manejo de errores uniforme). */
export class ErrorDeContraste extends Error {}

/**
 * El `#` es OBLIGATORIO y la longitud solo puede ser 3 o 6 (caso límite 6 del contrato).
 * La bandera `i` es la que hace al parser insensible a la caja (@s3).
 */
const HEX_VALIDO = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/** "#RGB" es taquigrafía de "#RRGGBB": cada dígito se duplica, no se rellena con ceros. */
function expandirFormaCorta(digitos: string): string {
  return digitos.length === 3
    ? digitos
        .split('')
        .map((digito) => digito + digito)
        .join('')
    : digitos
}

export function hexARgb(hex: string): Rgb {
  if (!HEX_VALIDO.test(hex)) {
    throw new ErrorDeContraste(`hex malformado: "${hex}"`)
  }

  const digitos = expandirFormaCorta(hex.slice(1))

  return [
    parseInt(digitos.slice(0, 2), 16),
    parseInt(digitos.slice(2, 4), 16),
    parseInt(digitos.slice(4, 6), 16),
  ]
}

/**
 * Linealización sRGB de un canal (W3C G17), tomando el canal en 0-255 y normalizándolo.
 *
 * El umbral es 0.04045 y la comparación es `<=`: es la letra del GLOSARIO de WCAG 2.2.
 * NO revertir a 0.03928 «citando el wiki del WG»: ese wiki todavía imprime el valor
 * ANTERIOR (mayo 2021) con una errata encima que dice que el correcto es 0.04045. No es
 * normativo y no contradice a este módulo: lo respalda.
 *
 * Acepta canal fraccionario a propósito: `componer` devuelve flotantes sin cuantizar (A-16)
 * y su salida entra aquí tal cual.
 */
const MAXIMO_DE_8_BITS = 255
const CORTE_LINEAL = 0.04045
const DIVISOR_LINEAL = 12.92
const DESPLAZAMIENTO_GAMMA = 0.055
const ESCALA_GAMMA = 1.055
const EXPONENTE_GAMMA = 2.4

export function canalLineal(canal: number): number {
  const normalizado = canal / MAXIMO_DE_8_BITS

  return normalizado <= CORTE_LINEAL
    ? normalizado / DIVISOR_LINEAL
    : Math.pow((normalizado + DESPLAZAMIENTO_GAMMA) / ESCALA_GAMMA, EXPONENTE_GAMMA)
}

/** Luminancia relativa sRGB (W3C G17): L = 0.2126·R + 0.7152·G + 0.0722·B, canales lineales. */
const COEFICIENTE_ROJO = 0.2126
const COEFICIENTE_VERDE = 0.7152
const COEFICIENTE_AZUL = 0.0722

export function luminancia([rojo, verde, azul]: Rgb): number {
  return (
    COEFICIENTE_ROJO * canalLineal(rojo) +
    COEFICIENTE_VERDE * canalLineal(verde) +
    COEFICIENTE_AZUL * canalLineal(azul)
  )
}

/**
 * Ratio de contraste WCAG (W3C G17): (L1 + 0.05) / (L2 + 0.05), con L1 la luminancia MÁS
 * CLARA. Simétrico por construcción: el orden de los argumentos no altera el resultado.
 */
const COMPENSACION_DE_REFLEXION = 0.05

export function ratio(unColor: Rgb, otroColor: Rgb): number {
  const unaLuminancia = luminancia(unColor)
  const otraLuminancia = luminancia(otroColor)
  const masClara = Math.max(unaLuminancia, otraLuminancia)
  const masOscura = Math.min(unaLuminancia, otraLuminancia)

  return (masClara + COMPENSACION_DE_REFLEXION) / (masOscura + COMPENSACION_DE_REFLEXION)
}

/**
 * Composición alfa de `fg` sobre un fondo OPACO: α·fg + (1−α)·bg, canal a canal.
 *
 * A-16: devuelve FLOTANTES, sin cuantizar a 8 bits. La cuantización es un detalle de
 * render, no del color especificado; el audit sí cuantizaba, y de ahí —y solo ahí— sale la
 * diferencia entre su 4,60 y el 4,59 real de la fila del pie de @s11.
 *
 * PRECONDICIÓN (C5): `bg` debe ser OPACO. `color-mix(in srgb, X 88%, transparent)` equivale
 * a `X` con α=0.88 solo si X es opaco; la regla general es α_resultante = α(X) × 0.88.
 * `--bg #FDF4F7` lo es. Respaldo: la interpolación de color-mix es PREMULTIPLICADA;
 * `transparent` es `rgb(0 0 0 / 0)`, su RGB premultiplicado es [0,0,0] y su peso va SOLO al
 * alfa, así que el RGB del otro color sobrevive intacto y solo baja su alfa.
 */
export function componer(fg: Rgb, alfa: number, bg: Rgb): Rgb {
  const mezclar = (canalFg: number, canalBg: number) => alfa * canalFg + (1 - alfa) * canalBg

  return [mezclar(fg[0], bg[0]), mezclar(fg[1], bg[1]), mezclar(fg[2], bg[2])]
}
