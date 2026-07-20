import { CATALOGO_DEMO, LEYENDA_PRECIOS } from '../lib/demo/catalogo-demo'
import estilos from './catalogo.module.scss'

/**
 * El catálogo de servicios (capa visual del DEMO, inspira F-09). Reemplaza el stub «Servicios» de
 * `home.tsx`. Es UNA sola sección navegable (`aria-labelledby="servicios-titulo"`, el id que la nav
 * y la puerta de anclas vivas de F-06 esperan): las tres categorías van como sub-bloques con `<h3>`,
 * no como secciones nuevas, para no tocar la igualdad de conjuntos de la nav.
 *
 * Categorías REALES (Uñas · Pestañas · Cejas) y precios de MUESTRA con leyenda, desde datos demo.
 */
const ID_SERVICIOS = 'servicios-titulo'

export function Catalogo() {
  return (
    <section className={`demo-seccion ${estilos.catalogo}`} aria-labelledby={ID_SERVICIOS}>
      <div className="demo-contenedor">
        <div className="demo-encabezado">
          <p className="demo-eyebrow">Carta de servicios</p>
          <h2 id={ID_SERVICIOS} className="demo-titulo">
            Servicios
          </h2>
          <p className="demo-intro">
            Uñas, pestañas y cejas de la mano de un equipo que cuida cada detalle.
          </p>
        </div>

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
                  Reservar {categoria.eyebrow.toLowerCase()}
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
