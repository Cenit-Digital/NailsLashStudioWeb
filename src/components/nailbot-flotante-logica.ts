/**
 * Las tres decisiones PURAS del robot flotante (F-24, features/nailbot_flotante.feature @s6). Se
 * calculan EN LA LLAMADA (nada se deriva al cargar el módulo) y se muerden POR VALOR: el componente
 * `NailbotFlotante.tsx` solo las cablea.
 */

/** A los 4 000 ms del montaje, el bocadillo de invitación puede aparecer (H4, L11). */
export const RETARDO_BOCADILLO_MS = 4000

/** ¿Se muestra el bocadillo? Solo pasado el retardo, si el panel nunca se abrió y nadie lo descartó. */
export function mostrarBocadillo(
  msDesdeElMontaje: number,
  panelAbiertoAlgunaVez: boolean,
  descartado: boolean,
): boolean {
  return msDesdeElMontaje >= RETARDO_BOCADILLO_MS && !panelAbiertoAlgunaVez && !descartado
}

/** El estado de la animación del lanzador y de su control de pausa (SC 2.2.2, HS-8). */
export interface EstadoAnimacion {
  readonly animacion: 'activa' | 'pausada'
  /** Con «reduce» no hay nada que pausar: el control no se monta (HS-8 a). */
  readonly pausaMontada: boolean
  readonly pausaPulsada: boolean
}

export type EventoAnimacion =
  { readonly tipo: 'preferencia'; readonly reduce: boolean } | { readonly tipo: 'pulsarPausa' }

/**
 * La transición del estado de la animación. `null` = preferencia de movimiento aún SIN LEER (el
 * widget no se pinta hasta leerla).
 * - «reduce» (al montar o en caliente): pausada y sin control.
 * - retirar «reduce» NUNCA reanuda sola (L10): el control reaparece PULSADO.
 * - pulsar la pausa alterna congelar / reanudar; antes de leer la preferencia no hay pausa que pulsar.
 * - un evento que no reconoce no cambia NADA (así cada `tipo` es observable).
 */
export function siguienteAnimacion(
  estado: EstadoAnimacion | null,
  evento: EventoAnimacion,
): EstadoAnimacion | null {
  if (evento.tipo === 'pulsarPausa') {
    if (estado === null) {
      return null
    }
    const pulsada = !estado.pausaPulsada

    return { animacion: pulsada ? 'pausada' : 'activa', pausaMontada: true, pausaPulsada: pulsada }
  }

  if (evento.tipo === 'preferencia') {
    if (evento.reduce) {
      return { animacion: 'pausada', pausaMontada: false, pausaPulsada: true }
    }

    return estado === null
      ? { animacion: 'activa', pausaMontada: true, pausaPulsada: false }
      : { ...estado, pausaMontada: true }
  }

  return estado
}

/** Lo MÍNIMO que `enfocar` necesita de un nodo. */
export interface Enfocable {
  focus(): void
}

/** Lleva el foco a un nodo; con el ref aún sin montar (null) no hace nada. Se muerde POR VALOR. */
export function enfocar(nodo: Enfocable | null): void {
  if (nodo !== null) {
    nodo.focus()
  }
}

/** Lo MÍNIMO que `focoDentro` necesita de un contenedor. */
export interface Contenedor {
  contains(otro: Node | null): boolean
}

/** ¿El elemento activo está DENTRO del contenedor? Con el contenedor sin montar (null), no. */
export function focoDentro(contenedor: Contenedor | null, activo: Node | null): boolean {
  return contenedor !== null && contenedor.contains(activo)
}

/** Las ÚNICAS teclas que escuchan los carruseles en `document` (carrusel-logica.ts). */
const TECLAS_DE_CARRUSEL = ['ArrowLeft', 'ArrowRight']

/** ¿El diálogo detiene la propagación de esta tecla? Solo ← y →, para no mover la galería de detrás (L13). */
export function detenerTecla(tecla: string): boolean {
  return TECLAS_DE_CARRUSEL.includes(tecla)
}
