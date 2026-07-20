import { DIRECCION, instagramHref, NOMBRE, REDES, TELEFONO, telHref } from '../lib/site'
import estilos from './cabecera.module.scss'

/**
 * El pie (F-06) — capa visual del DEMO (pie oscuro del prototipo Opcion-1-Rosa).
 *
 * 🔴 EL PIE NO EMITE ENLACES LEGALES (@s13): un `<a href="/aviso-legal">` sin fichero en `dist/`
 * rompería la anti-404 de F-04 —es literalmente el bug del cliente—. Son F-16 (bloqueada).
 *
 * 🔴 Los enlaces DERIVAN de la fuente única F-02 (nunca hardcodeados): `tel:` de `telHref`, la URL de
 * Instagram de `instagramHref` (el handle @nailslash.studio_ es el dato) y Facebook de `REDES`. Los
 * anclas internas (`#servicios-titulo`, `#contacto-titulo`) apuntan SOLO a secciones que existen, así
 * que la puerta de anclas vivas sigue verde. El texto «Plantilla de demostración» NO se usa: es un
 * patrón que caza la puerta de placeholders de F-01.
 */
export function Pie() {
  return (
    <footer className={estilos.pie}>
      <div className={estilos.pieContenido}>
        <div className={estilos.pieMarca}>
          <div className={estilos.pieLogo}>{NOMBRE}</div>
          <p>Uñas, pestañas y cejas. Tu salón de belleza integral, cuidado al detalle.</p>
        </div>
        <div className={estilos.pieCols}>
          <div className={estilos.pieCol}>
            <div className={estilos.pieTitulo}>Estudio</div>
            <a href="#servicios-titulo">Servicios</a>
            <a href="#faq-titulo">Preguntas frecuentes</a>
            <a href="#contacto-titulo">Contacto</a>
          </div>
          <div className={estilos.pieCol}>
            <div className={estilos.pieTitulo}>Contacto</div>
            <a href={telHref(TELEFONO.legible)}>{TELEFONO.legible}</a>
            <a href={instagramHref(REDES.instagram)}>{REDES.instagram}</a>
            <a href={REDES.facebook}>Facebook</a>
            <span>
              {DIRECCION.centroComercial}, {DIRECCION.localidad}
            </span>
          </div>
        </div>
      </div>
      <div className={estilos.pieLegal}>© 2026 {NOMBRE}</div>
    </footer>
  )
}
