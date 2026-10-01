/**
 * La lógica PURA del logo acoplado (F-25, features/logo_acoplado.feature @s24/@s25, LA-C11). Sin
 * DOM: el componente `LogoAcoplado.tsx` mide y cablea; aquí solo se decide y se calcula, y se muerde
 * por valor. Nada se deriva al cargar el módulo.
 */

/** Qué se ve en la marca: «nails lash studio» (el horneado) o la firma caligráfica acoplada. */
export type EstadoLogo = 'texto' | 'caligrafia'

/**
 * La transición del acople, MONÓTONA (P2): desde «caligrafia» siempre «caligrafia». Desde «texto»,
 * acopla cuando el borde inferior de «STUDIO» queda EN la línea de corte o por encima (`<=`: con 0 px
 * visibles ya no se ve). La línea la elige el componente: la del propio observador o, si no la trae,
 * el borde de la cabecera medido (ENMIENDA D-1).
 */
export function estadoTrasObservar(
  actual: EstadoLogo,
  bordeInferiorDisparo: number,
  lineaDeCorte: number,
): EstadoLogo {
  return actual === 'caligrafia' || bordeInferiorDisparo <= lineaDeCorte ? 'caligrafia' : 'texto'
}

export interface CondicionesDeVuelo {
  /** La primera entrega del observador: si ya acopla, es una carga desplazada, sin nada que ver subir. */
  readonly primeraObservacion: boolean
  readonly bordeInferiorOrigen: number
  readonly altoViewport: number
}

/**
 * ¿Vuela, o acopla al instante? Solo si no es la primera entrega y el rótulo del hero está a menos de
 * un viewport por encima del borde superior: en un salto lejano el logo «caería» desde miles de px.
 */
export function debeVolar({
  primeraObservacion,
  bordeInferiorOrigen,
  altoViewport,
}: CondicionesDeVuelo): boolean {
  return !primeraObservacion && bordeInferiorOrigen > -altoViewport
}

/** Una caja en coordenadas de viewport (lo que devuelve `getBoundingClientRect`). */
export interface Caja {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** El punto de salida del vuelo, relativo al destino, con `transform-origin: 0 0`. */
export interface Flip {
  readonly x: number
  readonly y: number
  readonly escala: number
}

/**
 * FLIP invertido (LA-C7): cuánto desplazar y escalar el logo (destino) para que coincida con el
 * rótulo del hero (origen). La escala sale del ANCHO, la dimensión mayor: los dos <svg> comparten
 * `VISTA_MARCA`, así que casa también el alto. Nula si alguna caja no tiene ancho (sin layout):
 * no hay vuelo, solo acople.
 */
export function transformacionFlip(origen: Caja, destino: Caja): Flip | null {
  if (origen.width <= 0 || destino.width <= 0) {
    return null
  }

  return {
    x: origen.left - destino.left,
    y: origen.top - destino.top,
    escala: origen.width / destino.width,
  }
}

/** Las tres custom properties del punto de salida, que la hoja lee en el `from` de `acoplar`. */
export interface VariablesDeVuelo {
  readonly '--vuelo-x': string
  readonly '--vuelo-y': string
  readonly '--vuelo-escala': string
}

/** El FLIP, con su unidad y sin redondear: el navegador trabaja en fracciones de píxel. */
export function variablesDeVuelo({ x, y, escala }: Flip): VariablesDeVuelo {
  return {
    '--vuelo-x': `${x}px`,
    '--vuelo-y': `${y}px`,
    '--vuelo-escala': `${escala}`,
  }
}

/**
 * El `rootMargin` del observador: sube su línea el alto de la cabecera, redondeado hacia ABAJO
 * (ENMIENDA D-1). Así la línea queda en el borde de la cabecera o por encima, nunca por debajo, y
 * el margen entero no depende de cómo redondee cada motor uno fraccionario.
 */
export function margenDeRaiz(altoCabecera: number): string {
  return `-${Math.floor(altoCabecera)}px 0px 0px 0px`
}
