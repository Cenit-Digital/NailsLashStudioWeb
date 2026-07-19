import { DESTACADOS_DEMO } from '../lib/demo/destacados-demo'
import estilos from './destacados.module.scss'

/**
 * Servicios destacados (capa visual del DEMO). Sección navegable `#destacados-titulo`. 4 tarjetas
 * informativas (tag + título + descripción), contenido honesto sobre Uñas/Pestañas/Cejas.
 */
const ID_DESTACADOS = 'destacados-titulo'

export function Destacados() {
  return (
    <section className={`demo-seccion ${estilos.destacados}`} aria-labelledby={ID_DESTACADOS}>
      <div className="demo-contenedor">
        <div className="demo-encabezado">
          <p className="demo-eyebrow">Destacados</p>
          <h2 id={ID_DESTACADOS} className="demo-titulo">
            Servicios estrella
          </h2>
        </div>
        <div className={estilos.rejilla}>
          {DESTACADOS_DEMO.map((item) => (
            <div key={item.titulo} className={`demo-card ${estilos.carta}`}>
              <span className={estilos.tag}>{item.tag}</span>
              <h3 className={estilos.titulo}>{item.titulo}</h3>
              <p className={estilos.desc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
