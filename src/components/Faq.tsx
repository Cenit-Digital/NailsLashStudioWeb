import { FAQ_DEMO } from '../lib/demo/faq-demo'
import estilos from './faq.module.scss'

/**
 * La FAQ en acordeón (capa visual del DEMO, inspira F-15). Sección navegable `#faq-titulo` (la nav y
 * la puerta de anclas vivas de F-06 la esperan).
 *
 * 🔴 Usa `<details name="faq">` NATIVO: apertura única (el atributo `name` agrupa los `<details>` como
 * acordeón exclusivo) SIN JavaScript, y las respuestas viajan SIEMPRE en el DOM aunque estén
 * colapsadas → encontrables con Ctrl+F e indexables (el fallo que F-15 existe para evitar: el
 * prototipo destruía y recreaba la respuesta en el DOM).
 */
const ID_FAQ = 'faq-titulo'

export function Faq() {
  return (
    <section className={`demo-seccion demo-seccion--alt ${estilos.faq}`} aria-labelledby={ID_FAQ}>
      <div className={estilos.contenedor}>
        <p className={`demo-eyebrow ${estilos.centro}`}>FAQ</p>
        <h2 id={ID_FAQ} className={`demo-titulo ${estilos.centro}`}>
          Preguntas frecuentes
        </h2>
        <div className={estilos.lista}>
          {FAQ_DEMO.map((item) => (
            <details key={item.pregunta} name="faq" className={estilos.item}>
              <summary className={estilos.pregunta}>{item.pregunta}</summary>
              <p className={estilos.respuesta}>{item.respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
