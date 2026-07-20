import { CATALOGO_DEMO, LEYENDA_PRECIOS } from '../lib/demo/catalogo-demo'
import estilos from './catalogo.module.scss'

/**
 * El catálogo de servicios (capa visual del DEMO, inspira F-09). Reemplaza el stub «Servicios» de
 * `home.tsx`. Es UNA sola sección navegable (`aria-labelledby="servicios-titulo"`, el id que la nav
 * y la puerta de anclas vivas de F-06 esperan): las tres categorías van como sub-bloques con `<h3>`,
 * no como secciones nuevas, para no tocar la igualdad de conjuntos de la nav.
 *
 * Categorías REALES (Uñas · Pestañas · Cejas) y precios de MUESTRA con leyenda, desde datos demo.
 *
 * ⚠️ El `<h2 id="servicios-titulo">Servicios</h2>` está OCULTO VISUALMENTE a propósito. Pablo retiró
 * a mano el encabezado visible del catálogo y quiere que siga sin verse; el heading, en cambio, NO
 * puede desaparecer del DOM porque de su `id` dependen tres cosas: (1) la puerta del cascarón, que
 * exige que todo `aria-labelledby` resuelva a un heading real; (2) la puerta de anclas vivas, que
 * compara los `href="#…"` de la nav con los ids de las secciones navegables; y (3) el CTA «Ver
 * servicios» del hero, que enlaza a `#servicios-titulo`. Por eso se oculta con la técnica de
 * *visually hidden* (`.tituloOculto`) y NUNCA con `display:none`/`visibility:hidden`, que lo
 * sacarían del árbol de accesibilidad y dejarían la sección otra vez sin nombre accesible.
 */
const ID_SERVICIOS = 'servicios-titulo'

export function Catalogo() {
  return (
    <section className={`demo-seccion ${estilos.catalogo}`} aria-labelledby={ID_SERVICIOS}>
      <div className="demo-contenedor">
        <h2 id={ID_SERVICIOS} className={estilos.tituloOculto}>
          Servicios
        </h2>

        {CATALOGO_DEMO.map((categoria) => (
          <div key={categoria.clave} className={estilos.categoria}>
            <div className={estilos.categoriaCabecera}>
              <p className="demo-eyebrow">{categoria.eyebrow}</p>
              <h3 className={estilos.categoriaTitulo}>{categoria.titulo}</h3>
              <p className="demo-intro">{categoria.intro}</p>
            </div>
            <div className={estilos.rejilla}>
              <div className={`demo-card ${estilos.carta}`}>
                {categoria.servicios.map((servicio) => (
                  <div key={servicio.nombre} className={estilos.fila}>
                    <span className={estilos.nombre}>{servicio.nombre}</span>
                    <span className={estilos.precio}>{servicio.precio}</span>
                  </div>
                ))}
                <a className={`demo-btn demo-btn--solido ${estilos.reservar}`} href="#reserva-titulo">
                  {categoria.textoBoton}
                </a>
              </div>
              <div className={estilos.foto} aria-hidden="true" />
            </div>
          </div>
        ))}

        <p className={estilos.leyenda}>{LEYENDA_PRECIOS}</p>
      </div>
    </section>
  )
}
