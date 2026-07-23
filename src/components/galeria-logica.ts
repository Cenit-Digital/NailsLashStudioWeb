/**
 * Núcleo PURO del carrusel coverflow de la galería (contrato
 * `features/galeria_carrusel.feature`, brief `progress/galeria_coverflow_diseno.md` §3).
 *
 * Todo lo que DECIDE algo vive aquí, sin `window`, sin `Date.now()` y sin `matchMedia`: el
 * componente solo lo CABLEA. Dos razones, las dos duras:
 *  · `react-refresh/only-export-components` (`eslint.config.js`) impide que `Galeria.tsx` exporte
 *    nada que no sea el componente.
 *  · Con `css: false` (`vitest.config.ts`) un `className` condicional produce el MISMO DOM en sus
 *    dos ramas y el mutante que invierte la condición es INMATABLE. Sacando la decisión aquí, el
 *    mutante muere POR VALOR. Es el patrón de `reserva-logica.ts` y `equipo-logica.ts`.
 */

/**
 * El índice normalizado al rango [0, total): `((i % n) + n) % n`. El `+ n` NO es decorativo — en
 * JavaScript `%` es RESTO y conserva el signo del DIVIDENDO: `(-4) % 6 === -4`, mientras
 * `(((-4) % 6) + 6) % 6 === 2`. Sin él, retroceder antes de la primera foto devuelve un índice
 * inexistente y la tarjeta desaparece del arco sin ningún error en consola.
 */
export function indiceCircular(indice: number, total: number): number {
  return ((indice % total) + total) % total
}

/**
 * La distancia CON SIGNO de una foto a la centrada, por el camino corto: negativa por la
 * izquierda, positiva por la derecha. Con `total = 6` el rango es [-2, +3].
 *
 * EL EMPATE (contrato @s3, convención nº 1 de la cabecera del `.feature`): con `total` PAR la foto
 * opuesta está a la misma distancia por los dos lados. El comparador es ESTRICTO (`> total / 2`),
 * así que la opuesta entra por la DERECHA con distancia `+3`; con `>=` saldría por la izquierda
 * (-3) y el arco se dibujaría al revés en cada vuelta. Se elige `>` por coherencia con un autoplay
 * que avanza +1.
 */
export function distanciaCircular(indice: number, activo: number, total: number): number {
  const bruta = indiceCircular(indice - activo, total)

  return bruta > total / 2 ? bruta - total : bruta
}

/** La clave de posición que lee el SCSS en `[data-distancia='N']`. */
export type ClaveDistancia = '0' | '1' | '2' | '3'

const CLAVES: readonly ClaveDistancia[] = ['0', '1', '2', '3']

/**
 * La CLAVE de posición de una tarjeta, por su VALOR ABSOLUTO: la caída del domo es una función PAR
 * de la distancia (las dos vecinas caen lo mismo), así que la magnitud manda la geometría y el lado
 * viaja aparte en `--s`. Patrón `claveBurbuja` de `reserva-logica.ts`: la decisión NO puede ser un
 * `className` condicional, o el mutante que la invierte sería inmatable con `css: false`.
 */
export function claveDistancia(distancia: number): ClaveDistancia {
  return CLAVES[Math.abs(distancia)]
}

/** El lado: -1 izquierda, 0 la centrada, +1 derecha. Es el multiplicador `--s` de la transform. */
export function signoDe(distancia: number): -1 | 0 | 1 {
  return Math.sign(distancia) as -1 | 0 | 1
}

/**
 * La capa de pintado (`z-index` inline). DESCIENDE con la distancia —la centrada se pinta encima de
 * todas— y es SIEMPRE POSITIVA y ENTERA: un `z-index` negativo pinta la tarjeta por DETRÁS del
 * fondo de su contenedor y la hace desaparecer (gotcha real de Swiper, que genera -1 y -2).
 */
export function capaDe(distancia: number, total: number): number {
  return total - Math.abs(distancia)
}

/**
 * El nombre accesible de una diapositiva, «3 de 6» (variante Grouped del APG). NO repite el `alt`
 * de la foto: lo aporta la `<img>` hija y duplicarlo lo haría sonar dos veces.
 */
export function etiquetaDeDiapositiva(indice: number, total: number): string {
  return `${indice + 1} de ${total}`
}

/** El nombre accesible de un punto indicador, «Ver la foto 3 de 6». */
export function etiquetaDelPunto(indice: number, total: number): string {
  return `Ver la foto ${etiquetaDeDiapositiva(indice, total)}`
}

/**
 * La etiqueta del control de rotación, que CAMBIA con el estado. Por eso el botón NO expone
 * `aria-pressed` (APG literal: «since the label changes, the rotation control does not have any
 * states, e.g., aria-pressed, specified»): anunciaría el estado dos veces y de forma contradictoria.
 */
export function etiquetaDeRotacion(rotando: boolean): string {
  return rotando ? 'Parar la reproducción automática' : 'Iniciar la reproducción automática'
}

/** El gancho de test `data-estado` del control de rotación. */
export function claveDeRotacion(rotando: boolean): 'rotando' | 'pausado' {
  return rotando ? 'rotando' : 'pausado'
}

/**
 * El `aria-live` del contenedor de diapositivas (APG): CALLADO mientras la rotación es automática
 * —anunciar cada cambio interrumpiría al usuario— y `polite` en cuanto los cambios los provoca él.
 */
export function vozDeLaPista(rotando: boolean, foco: boolean): 'off' | 'polite' {
  return rotando && !foco ? 'off' : 'polite'
}

/** Todo lo que decide si la rotación debe estar corriendo AHORA. Inyectado, nada de `window`. */
export interface EstadoDeRotacion {
  /** El usuario pulsó «Parar» (o el sistema pide movimiento reducido). Gana sobre todo. */
  readonly pausadoPorElUsuario: boolean
  /** El puntero está DENTRO del carrusel. Para mientras esté, y reanuda sola al salir. */
  readonly raton: boolean
  /** El foco de teclado ENTRÓ en el carrusel. Para, y NO reanuda sola: solo el botón la devuelve. */
  readonly foco: boolean
  /** El usuario pulsó «Iniciar»: quiere rotación YA, ignorando el ratón encima y el foco dentro. */
  readonly arranqueExplicito: boolean
}

/**
 * ¿La rotación debe estar corriendo AHORA? Las tres precedencias, en orden:
 *  1. La parada pedida por el usuario es DEFINITIVA (SC 2.2.2: el mecanismo de pausa manda).
 *  2. El arranque explícito ignora ratón y foco (APG: «focus and/or hover states … are ignored»).
 *  3. Si no, rota mientras no haya ni puntero encima ni foco dentro.
 */
export function debeRotar(estado: EstadoDeRotacion): boolean {
  if (estado.pausadoPorElUsuario) {
    return false
  }

  if (estado.arranqueExplicito) {
    return true
  }

  return !estado.raton && !estado.foco
}

/** La cadencia del autoplay: 4 s por foto (decisión del cliente). Constante para poder mutarla. */
export const MILISEGUNDOS_POR_FOTO = 4000

/** El recorrido mínimo, en píxeles, para que un arrastre cuente como cambio de foto. */
export const UMBRAL_DE_ARRASTRE = 48

/**
 * Los pasos que pide un gesto de arrastre: arrastrar a la IZQUIERDA (desplazamiento negativo) trae
 * la SIGUIENTE foto, como en cualquier carrusel táctil. El umbral es un ARGUMENTO (inyectado) para
 * poder morder la frontera por valor, que es INCLUSIVA: justo en el umbral el gesto ya cuenta.
 *
 * ⚠️ jsdom 25 no implementa `PointerEvent`: el GESTO se verifica EN VIVO en Chrome; lo que se
 * testea aquí es la DECISIÓN, que es lo único que puede equivocarse en silencio.
 */
export function pasosDelArrastre(desplazamientoX: number, umbral: number): -1 | 0 | 1 {
  if (Math.abs(desplazamientoX) < umbral) {
    return 0
  }

  // [ENMIENDA 2] La dirección se DERIVA del signo, sin comparador (rediseño por el superviviente
  // 153:10 de progress/mutation_galeria_carrusel.md): los pasos llevan el signo OPUESTO al gesto,
  // y el caso degenerado (0, 0) da 0 — nada — en vez de una dirección arbitraria. Se niega con
  // `0 - Δ` y no con el unario: `-0` existe, y `Math.sign(-0)` devuelve `-0`, no `0`.
  return signoDe(0 - desplazamientoX)
}
