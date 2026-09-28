/**
 * El retoque PURO del HTML horneado (F-04, ENMIENDAS 2 y 3 de `cascaron_semantico.feature`: @s40 y
 * @s41). `vite.config.ts` cablea estas funciones en `ssgOptions.onPageRendered`, que recibe el HTML ya
 * serializado y devuelve el que se escribe en `dist/`.
 *
 * vite-react-ssg 0.9.0 inyecta SIEMPRE un `<link rel="preload">` por cada foto importada por un módulo
 * renderizado y por CADA fichero de fuente del manifiesto (`renderPreloadLink`, sin opción para
 * desactivarlo):
 *   - @s40: las `<img>` del sitio son `loading="lazy"` y sin `crossorigin`; el modo de credenciales no
 *     casa, la precarga no se reutiliza y las fotos se piden ANTES de desplazarse (medido:
 *     progress/hallazgo_hidratacion_ssg.md §4). Sale la PRECARGA de foto; la foto sigue en su `<img>`.
 *   - @s41 (decisión del humano): precarga el `.woff2` Y el `.woff` de cada fuente (este con un
 *     `type="font/woff2"` falso), y Chromium descargaba los dos. Sale la precarga hacia el `.woff`; la
 *     del `.woff2` se queda, y el `.woff` sigue de RESPALDO en el `src` de cada `@font-face` del CSS.
 *
 * Los atributos se buscan por NOMBRE (precedidos de espacio: `data-as` no es `as`), en cualquier orden
 * y sin distinguir mayúsculas. LÍMITE DECLARADO: solo se reconoce la forma `nombre="valor"` con comillas
 * DOBLES, la que emite `jsdom.serialize()` justo antes de `onPageRendered`. Una precarga con otras
 * comillas no se retiraría; la cazaría el test de bytes del artefacto real (home-horneado.test.ts).
 */
const ETIQUETA_LINK = /<link[^>]*>/gi
const REL_PRELOAD = /\srel="preload"/i
const AS_IMAGE = /\sas="image"/i
const AS_FONT = /\sas="font"/i
// La comilla de cierre fija el FINAL del valor: `x.woff2` no termina en `.woff`.
const HREF_WOFF = /\shref="[^"]*\.woff"/i

function esPrecargaDeImagen(etiqueta: string): boolean {
  return REL_PRELOAD.test(etiqueta) && AS_IMAGE.test(etiqueta)
}

function esPrecargaDeFuenteWoff(etiqueta: string): boolean {
  return REL_PRELOAD.test(etiqueta) && AS_FONT.test(etiqueta) && HREF_WOFF.test(etiqueta)
}

function sinLinksQue(sobra: (etiqueta: string) => boolean, html: string): string {
  return html.replace(ETIQUETA_LINK, (etiqueta) => (sobra(etiqueta) ? '' : etiqueta))
}

export function sinPrecargasDeImagen(html: string): string {
  return sinLinksQue(esPrecargaDeImagen, html)
}

export function sinPrecargasDeFuenteWoff(html: string): string {
  return sinLinksQue(esPrecargaDeFuenteWoff, html)
}
