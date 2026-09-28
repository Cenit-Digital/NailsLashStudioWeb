/**
 * El retoque PURO del HTML horneado (F-04, ENMIENDA 2 de `cascaron_semantico.feature`, @s40).
 *
 * vite-react-ssg 0.9.0 inyecta SIEMPRE un `<link rel="preload" as="image" … crossorigin="">` por cada
 * foto importada por un módulo renderizado (`renderPreloadLink`, sin opción para desactivarlo). Las
 * `<img>` del sitio son `loading="lazy"` y sin `crossorigin`: el modo de credenciales no casa, la
 * precarga no se reutiliza y las fotos se piden ANTES de desplazarse (medido:
 * progress/hallazgo_hidratacion_ssg.md §4). `vite.config.ts` cablea esta función en
 * `ssgOptions.onPageRendered`, que recibe el HTML ya serializado y devuelve el que se escribe en `dist/`.
 *
 * Solo sale la PRECARGA de foto: la foto sigue en su `<img>` y las precargas de fuente (`as="font"`,
 * de F-05) se quedan. Los atributos se buscan por NOMBRE (precedidos de espacio: `data-as` no es `as`),
 * en cualquier orden y sin distinguir mayúsculas.
 */
const ETIQUETA_LINK = /<link[^>]*>/gi
const REL_PRELOAD = /\srel="preload"/i
const AS_IMAGE = /\sas="image"/i

function esPrecargaDeImagen(etiqueta: string): boolean {
  return REL_PRELOAD.test(etiqueta) && AS_IMAGE.test(etiqueta)
}

export function sinPrecargasDeImagen(html: string): string {
  return html.replace(ETIQUETA_LINK, (etiqueta) => (esPrecargaDeImagen(etiqueta) ? '' : etiqueta))
}
