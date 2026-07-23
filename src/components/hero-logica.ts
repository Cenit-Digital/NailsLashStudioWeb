/**
 * Núcleo PURO de la caligrafía lenta del hero (contrato `features/hero.feature`, enmienda
 * 2026-07-23; brief `progress/hero_caligrafia_lenta_diseno.md` §3b). Todo lo que DECIDE vive aquí,
 * sin `window`, sin `matchMedia` y sin DOM: `Hero.tsx` solo cablea. Dos razones, las dos duras
 * (patrón `galeria-logica.ts` / `reserva-logica.ts`):
 *  · `react-refresh/only-export-components` impide que `Hero.tsx` exporte nada más.
 *  · Con `css: false` un render condicional no distingue sus ramas por clase: la decisión se
 *    asevera POR VALOR aquí, y el DOM la observa por `data-firma`/presencia del botón.
 *
 * ⚠️ NADA DERIVADO EN LA CARGA DEL MÓDULO (mutantes estáticos no activables por el runner:
 * `progress/tdd_deuda_mutacion_full.md`, familia B): la duración total del reloj se calcula EN
 * LLAMADA (`milisegundosDeCeremonia`), nunca en un inicializador.
 */

/**
 * Los segundos del trazo: el ESPEJO del token `--duracion-caligrafia` del SCSS (un test compara
 * los dos números leyendo los bytes de la hoja — cambiar uno sin el otro pone la suite roja).
 */
export const SEGUNDOS_DE_TRAZO = 30

/**
 * La cola de salida tras el trazo: 0,2 s hasta que arranca `revelarStudio` + 0,6 s de revelado.
 * Los dos sumandos viven en el `calc()` y la duración de `revelarStudio` de la hoja; el test los
 * lee de allí y los compara con este total.
 */
export const SEGUNDOS_DE_SALIDA = 0.8

const MILISEGUNDOS_POR_SEGUNDO = 1000

/**
 * En qué acabó (o no) la firma: `corriendo` mientras el trazo se escribe, `cliente` si la completó
 * el control sin cromo (@s11) y `reloj` si el timeout llegó al final por sí solo (@s12). Los dos
 * finales se DISTINGUEN a propósito: `Hero.tsx` lo expone en `data-firma`, y así la limpieza del
 * timeout es observable (un reloj sin limpiar re-etiquetaría «cliente» como «reloj»).
 */
export type FaseDeLaFirma = 'corriendo' | 'cliente' | 'reloj'

/** ¿La firma ya está completa (por el cliente o por el fin del reloj)? */
export function firmaCompletada(fase: FaseDeLaFirma): boolean {
  return fase !== 'corriendo'
}

/**
 * ¿Debe existir el control «Completar la firma» AHORA? Solo si la preferencia de movimiento está
 * LEÍDA y permite animar (`movimientoReducido === false`; `null` = aún sin leer, SSR/primer
 * render) Y la firma sigue corriendo. Bajo reduce no hay nada que completar (@s13) y tras
 * completarla no queda nada que cubrir (@s11/@s12).
 */
export function debeMontarseElControl(
  movimientoReducido: boolean | null,
  fase: FaseDeLaFirma,
): boolean {
  return movimientoReducido === false && !firmaCompletada(fase)
}

/**
 * La duración TOTAL de la ceremonia en milisegundos (trazo + cola de salida = ≈30,8 s): es el
 * plazo del `setTimeout` con el que `Hero.tsx` desmonta el control cuando el reloj termina solo
 * (@s12). Derivada de UNA fuente en tiempo de llamada, jamás duplicada a mano.
 */
export function milisegundosDeCeremonia(): number {
  return (SEGUNDOS_DE_TRAZO + SEGUNDOS_DE_SALIDA) * MILISEGUNDOS_POR_SEGUNDO
}
