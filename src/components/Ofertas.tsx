import { LEYENDA_OFERTAS, OFERTAS_DEMO } from '../lib/demo/ofertas-demo'
import estilos from './ofertas.module.scss'

/**
 * Ofertas del mes (capa visual del DEMO). Sección navegable `#ofertas-titulo`. 3 tarjetas con badge,
 * precio actual + anterior tachado y CTA «Reservar oferta» → #reserva-titulo. Ofertas de muestra.
 */
const ID_OFERTAS = 'ofertas-titulo'

export function Ofertas() {
  return (
    <section
      className={`demo-seccion demo-seccion--alt ${estilos.ofertas}`}
      aria-labelledby={ID_OFERTAS}
    >
      <div className="demo-contenedor">
        <div className="demo-encabezado">
          <p className="demo-eyebrow">Ofertas</p>
          <h2 id={ID_OFERTAS} className="demo-titulo">
            Promociones del mes
          </h2>
        </div>
        <div className={estilos.rejilla}>
          {OFERTAS_DEMO.map((oferta) => (
            <div key={oferta.titulo} className={`demo-card ${estilos.carta}`}>
              <span className={estilos.badge}>{oferta.badge}</span>
              <h3 className={estilos.titulo}>{oferta.titulo}</h3>
              <p className={estilos.desc}>{oferta.desc}</p>
              <div className={estilos.precios}>
                <span className={estilos.precio}>{oferta.precio}</span>
                <span className={estilos.antes}>{oferta.antes}</span>
              </div>
              <a className={`demo-btn demo-btn--ghost ${estilos.cta}`} href="#reserva-titulo">
                Reservar oferta
              </a>
            </div>
          ))}
        </div>
        <p className={estilos.leyenda}>{LEYENDA_OFERTAS}</p>
      </div>
    </section>
  )
}
