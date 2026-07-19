import { useState } from 'react'

import { COLORES_DEMO } from '../lib/demo/colores-demo'
import estilos from './prueba-color.module.scss'

/**
 * El probador de color (capa visual del DEMO, interactivo). Bloque NO navegable (`<div>`, no
 * `<section>`): el prototipo tampoco lo enlaza en la nav, así que hacerlo `<section>` rompería la
 * igualdad de conjuntos de la puerta de anclas de F-06.
 *
 * Estado local simple (`useState<number>` con el índice del tono activo). Hornea el primer tono
 * activo por SSR y se hidrata para reaccionar a los clics. Los 12 tonos son data provista (verbatim).
 */
const NAILS = [0, 1, 2, 3, 4]

export function PruebaColor() {
  const [activo, setActivo] = useState(0)
  const color = COLORES_DEMO[activo]

  return (
    <div className={`demo-seccion demo-seccion--alt ${estilos.prueba}`}>
      <div className="demo-contenedor">
        <div className="demo-encabezado">
          <p className="demo-eyebrow">Prueba tu color</p>
          <h2 className="demo-titulo">Encuentra tu tono perfecto</h2>
          <p className="demo-intro">Toca un esmalte y descúbrelo sobre las uñas antes de tu cita.</p>
        </div>

        <div className={estilos.rejilla}>
          <div className={estilos.escaparate}>
            {NAILS.map((n) => (
              <span
                key={n}
                className={estilos.una}
                style={{ background: color.hex }}
                aria-hidden="true"
              />
            ))}
          </div>

          <div>
            <div className={estilos.etiqueta}>
              <span className={estilos.nombre}>{color.nombre}</span>
              <span className={estilos.hex}>{color.hex}</span>
            </div>
            <div className={estilos.swatches}>
              {COLORES_DEMO.map((c, i) => (
                <button
                  key={c.hex}
                  type="button"
                  className={estilos.swatch}
                  style={{ background: c.hex }}
                  aria-label={c.nombre}
                  aria-pressed={i === activo}
                  onClick={() => {
                    setActivo(i)
                  }}
                >
                  {i === activo && <span className={estilos.anillo} aria-hidden="true" />}
                </button>
              ))}
            </div>
            <a className={`demo-btn demo-btn--solido ${estilos.cta}`} href="#reserva-titulo">
              Reservar con este tono
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
