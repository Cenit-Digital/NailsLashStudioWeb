/**
 * Núcleo PURO compartido por los carruseles coverflow del sitio: la galería «Nuestros trabajos»
 * hoy y el carrusel de reseñas en su propio ciclo (contrato `features/galeria_carrusel.feature`
 * v3, brief `progress/galeria_v3_resenas_diseno.md` §3/§5).
 *
 * Como `galeria-logica.ts`: todo lo que DECIDE algo vive aquí, sin `window`, sin `document` y sin
 * observadores — el componente solo lo CABLEA. Con `css: false` y jsdom sin IntersectionObserver,
 * la única forma de que Stryker muerda estas decisiones es POR VALOR.
 */

/** La cadencia del autoplay: 2 s por foto (decisión del CLIENTE, 2026-07-23). Compartida: la
 * galería y el carrusel de reseñas la importan de aquí — NADIE guarda una segunda copia. */
export const MILISEGUNDOS_POR_FOTO = 2000

/** Una pulsación de tecla, con TODO inyectado por valor: nada de `KeyboardEvent` aquí dentro. */
export interface Pulsacion {
  /** El `key` del evento: `ArrowLeft`, `ArrowRight`, una letra… */
  readonly tecla: string
  readonly ctrl: boolean
  readonly alt: boolean
  readonly meta: boolean
  /** El elemento activo del documento es un campo de escritura (la flecha es del CURSOR). */
  readonly campoDeTextoActivo: boolean
}

/** Las dos únicas teclas que mueven el carrusel, con su paso: ← anterior, → siguiente. */
const PASO_POR_TECLA: Readonly<Record<string, -1 | 1>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
}

/**
 * El paso que pide una pulsación (@s21): ← / → mueven ∓1 y TODA otra tecla vale 0. Las guardas:
 * Ctrl/Alt/Meta son del navegador o del SO (Alt+← es «atrás», Meta+→ es «fin de línea» en macOS) y
 * con un campo de texto activo la flecha es del CURSOR — el chat de `#reserva` escribe en un
 * `<input>`. Shift NO bloquea, a propósito: Shift+flecha no es un atajo del navegador.
 */
export function pasoDeTecla(pulsacion: Pulsacion): -1 | 0 | 1 {
  if (pulsacion.ctrl || pulsacion.alt || pulsacion.meta || pulsacion.campoDeTextoActivo) {
    return 0
  }

  return PASO_POR_TECLA[pulsacion.tecla] ?? 0
}

/** Las etiquetas donde la flecha pertenece al CURSOR, no al carrusel (@s21). */
const ETIQUETAS_DE_ESCRITURA: readonly string[] = ['INPUT', 'TEXTAREA', 'SELECT']

/**
 * ¿El elemento activo es un campo de escritura? Se le pasa su `tagName` (MAYÚSCULAS en documentos
 * HTML) y su `isContentEditable`: la decisión queda pura y el cableado sin literales que Stryker
 * pudiera mutar sin que ningún test lo viera.
 */
export function esCampoDeEscritura(etiqueta: string, editable: boolean): boolean {
  return editable || ETIQUETAS_DE_ESCRITURA.includes(etiqueta)
}

/**
 * El umbral de visibilidad del teclado global (@s22, INCLUSIVO): «el usuario situado» = la sección
 * ocupa al menos el 60 % de sí misma en pantalla. Es el MISMO número que se le pasa al
 * IntersectionObserver del cableado: si divergieran, el observador no avisaría del cruce que la
 * decisión necesita.
 */
export const PROPORCION_VISIBLE_MINIMA = 0.6

/** «Nadie atiende»: la tecla es de la página, sin movimiento y SIN preventDefault. */
export const NADIE = -1

/** Una sección candidata a atender el teclado, con TODO inyectado: nada de `window` aquí. */
export interface SeccionCandidata {
  /** Qué proporción de la sección está en pantalla (el `intersectionRatio`), en [0, 1]. */
  readonly proporcionVisible: number
  /** Distancia del centro de la sección al centro del viewport, en píxeles (≥ 0). */
  readonly distanciaAlCentro: number
  /** ¿El foco de teclado está dentro AHORA? El foco ASIGNA la tecla y EXCLUYE al resto (@s23). */
  readonly focoDentro: boolean
}

/**
 * Quién atiende el teclado (@s22 + el foco de @s23): el índice de la candidata elegida, o `NADIE`.
 * El foco dentro ASIGNA la tecla al carrusel enfocado y EXCLUYE al resto — sin observador, sin
 * umbral. Sin foco, solo compiten las que llegan al umbral (INCLUSIVO); entre ellas gana la
 * CERCANÍA al centro del viewport — no la proporción, ni el orden de registro. El empate TOTAL es
 * estable: se queda la primera.
 */
export function quienAtiendeElTeclado(candidatas: readonly SeccionCandidata[]): number {
  const enfocada = candidatas.findIndex((candidata) => candidata.focoDentro)

  if (enfocada !== NADIE) {
    return enfocada
  }

  let elegida = NADIE

  for (let indice = 0; indice < candidatas.length; indice++) {
    const candidata = candidatas[indice]

    if (candidata.proporcionVisible < PROPORCION_VISIBLE_MINIMA) {
      continue
    }

    if (elegida === NADIE || candidata.distanciaAlCentro < candidatas[elegida].distanciaAlCentro) {
      elegida = indice
    }
  }

  return elegida
}

/* ------------------------------------------------------------------------------------------ *
 * EL REGISTRO COMPARTIDO DE CANDIDATAS (@s22 + @s8 de reseñas): la decisión es UNA, no dos
 * copias. Cada carrusel se REGISTRA al montar con su id estable, ACTUALIZA su medida con cada
 * entrada REAL del IntersectionObserver y su foco con focus/blur, y se RETIRA al desmontar.
 * Cada listener de teclado pregunta `atiendeLaCandidata(suId)`: solo el árbitro mueve y hace
 * preventDefault — una tecla, UN carrusel. Estado de MÓDULO consultable por funciones (nada se
 * deriva en la carga: la trampa de estáticos de `progress/tdd_deuda_mutacion_full.md`).
 * ------------------------------------------------------------------------------------------ */

/** Los identificadores ESTABLES de las dos candidatas de la página. */
export const CANDIDATA_GALERIA = 'galeria'
export const CANDIDATA_RESENAS = 'resenas'

const registroDeCandidatas = new Map<string, SeccionCandidata>()

/** Alta de una candidata: sin medida aún (proporción 0 — en jsdom, sin IO, solo atiende el foco). */
export function registrarCandidata(id: string): void {
  registroDeCandidatas.set(id, { proporcionVisible: 0, distanciaAlCentro: 0, focoDentro: false })
}

/** Baja de una candidata (el desmontaje del carrusel): fuera del registro, fuera de la decisión. */
export function retirarCandidata(id: string): void {
  registroDeCandidatas.delete(id)
}

/** La medida REAL del observador: proporción visible y distancia al centro, nunca ceros fijos. */
export function medirCandidata(
  id: string,
  proporcionVisible: number,
  distanciaAlCentro: number,
): void {
  const registrada = registroDeCandidatas.get(id)

  if (registrada !== undefined) {
    registroDeCandidatas.set(id, { ...registrada, proporcionVisible, distanciaAlCentro })
  }
}

/** El foco entra o sale del carrusel: el estado que ASIGNA la tecla en la decisión compartida. */
export function enfocarCandidata(id: string, focoDentro: boolean): void {
  const registrada = registroDeCandidatas.get(id)

  if (registrada !== undefined) {
    registroDeCandidatas.set(id, { ...registrada, focoDentro })
  }
}

/** ¿Le toca a ESTA candidata atender la tecla? UNA sola llamada al árbitro sobre TODO el
 * registro. Sin guarda contra `NADIE` A PROPÓSITO (rediseño anti-mutante, patrón
 * `pasosDelArrastre`): `ids[NADIE]` es `undefined` y nunca iguala a un id — un comparador
 * redundante aquí fabricaría su propio mutante equivalente. */
export function atiendeLaCandidata(id: string): boolean {
  const ids = [...registroDeCandidatas.keys()]

  return ids[quienAtiendeElTeclado([...registroDeCandidatas.values()])] === id
}

/** Cuántas candidatas hay registradas (la limpieza al desmontar se asevera por valor). */
export function candidatasRegistradas(): number {
  return registroDeCandidatas.size
}

/** Un rectángulo medido en vertical: lo único que la distancia al centro necesita de un DOMRect. */
export interface MedidaVertical {
  readonly top: number
  readonly height: number
}

/**
 * La distancia (px, ≥ 0) del centro de la sección al centro del viewport, MEDIDA de la entrada
 * real del observador: centro de `boundingClientRect` contra centro de `rootBounds`. La spec deja
 * `rootBounds` a null solo para marcos de otro origen: sin marco no hay medida — 0, y la
 * visibilidad (que sí llega) sigue mandando.
 */
export function distanciaAlCentroDe(caja: MedidaVertical, marco: MedidaVertical | null): number {
  if (marco === null) {
    return 0
  }

  return Math.abs(centroDe(caja) - centroDe(marco))
}

function centroDe(medida: MedidaVertical): number {
  return medida.top + medida.height / 2
}
