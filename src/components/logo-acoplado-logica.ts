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
