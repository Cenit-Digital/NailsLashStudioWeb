import { NOMBRE, REDES, TELEFONO, telHref } from '../lib/site'
import estilos from './cabecera.module.scss'

/**
 * El pie (F-06). Contrato: features/header_nav_footer.feature.
 *
 * 🔴 EL PIE NO EMITE ENLACES LEGALES (@s13, casos límite 7): un `<a href="/aviso-legal">` sin
 * fichero en `dist/` rompería la anti-404 de F-04 —es literalmente el bug del cliente—. Las rutas,
 * los enlaces y el contenido legal son F-16 (A-17, cerrada). Cuando F-16 se desbloquee, aparecerán
 * CON DESTINO REAL.
 *
 * 🔴 Los `<a>` a Facebook y el `tel:` DERIVAN de la fuente única F-02 (nunca hardcodeados): NINGUNA
 * de las tres puertas de enlaces los caza (@s14 — Facebook es hiperenlace externo, `tel:` no es ruta
 * ni petición). Instagram es un HANDLE en `site.ts` (`@nailslash.studio_`), NO una URL, y NO existe
 * `instagramHref`: hornear la URL sería HARDCODEARLA (F-02 existe para impedir esa divergencia).
 */
export function Pie() {
  return (
    <footer className={estilos.pie}>
      <p>{NOMBRE}</p>
      <a href={telHref(TELEFONO.legible)}>{TELEFONO.legible}</a>
      <a href={REDES.facebook}>Facebook</a>
    </footer>
  )
}
