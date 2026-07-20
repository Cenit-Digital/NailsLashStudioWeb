import { useRef } from 'react'

import estilos from './galeria.module.scss'

/**
 * La galería de trabajos (capa visual del DEMO). Bloque NO navegable (`<div>`). Carrusel horizontal
 * con `scroll-snap` NATIVO de CSS + botones de flecha (criterio `ponytail`: nativo antes que
 * dependencia). Sin fotos reales todavía: los tiles son placeholders rosados (estado vacío honesto).
 */
const TILES = [0, 1, 2, 3, 4, 5]
const PASO = 320

export function Galeria() {
  const pista = useRef<HTMLDivElement>(null)

  const desplazar = (dir: number) => {
    pista.current?.scrollBy({ left: dir * PASO, behavior: 'smooth' })
  }

  return (
    <div className={`demo-seccion ${estilos.galeria}`}>
      <div className="demo-contenedor">
        <div className={estilos.cabecera}>
          <div className="demo-encabezado">
            <p className="demo-eyebrow">Galería</p>
            <h2 className="demo-titulo">Nuestros trabajos</h2>
          </div>
          <div className={estilos.flechas}>
            <button type="button" aria-label="Anterior" onClick={() => desplazar(-1)}>
              ←
            </button>
            <button type="button" aria-label="Siguiente" onClick={() => desplazar(1)}>
              →
            </button>
          </div>
        </div>
        <div className={estilos.pista} ref={pista}>
          {TILES.map((t) => (
            <div key={t} className={estilos.tile} aria-hidden="true" />
          ))}
        </div>
        <p className={estilos.nota}>Galería de muestra · las fotos reales del salón se añaden antes de publicar.</p>
      </div>
    </div>
  )
}
