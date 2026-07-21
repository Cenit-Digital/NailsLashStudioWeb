import { useRef } from 'react'

import galeriaRosaDorado from '../assets/trabajos/galeria-rosa-dorado.jpg'
import galeriaEsmaltesRosa from '../assets/trabajos/galeria-esmaltes-rosa.jpg'
import galeriaManicuraFrancesa from '../assets/trabajos/galeria-manicura-francesa.jpg'
import galeriaNudeMinimalista from '../assets/trabajos/galeria-nude-minimalista.jpg'
import galeriaRojoClasico from '../assets/trabajos/galeria-rojo-clasico.jpg'
import galeriaCoralLazo from '../assets/trabajos/galeria-coral-lazo.jpg'
import estilos from './galeria.module.scss'

/**
 * La galería de trabajos (capa visual del DEMO). Bloque NO navegable (`<div>`). Carrusel horizontal
 * con `scroll-snap` NATIVO de CSS + botones de flecha (criterio `ponytail`: nativo antes que
 * dependencia).
 *
 * Fotos REALES de trabajos, de banco de imágenes (Pexels), seleccionadas a mano, SIN rostro
 * identificable (mismo criterio que `src/lib/demo/equipo-demo.ts`): el `alt` describe el trabajo
 * fotografiado, nunca al salón ni a una persona. La nota de pie sigue declarando honestidad: son
 * fotos de banco, no del salón.
 */
const ANCHO_FOTO = 800
const ALTO_FOTO = 600

interface FotoGaleria {
  readonly src: string
  readonly alt: string
}

const FOTOS: readonly FotoGaleria[] = [
  { src: galeriaRosaDorado, alt: 'Manicura rosa empolvado con topos dorados' },
  { src: galeriaEsmaltesRosa, alt: 'Manicura en rosa nude junto a dos esmaltes' },
  { src: galeriaManicuraFrancesa, alt: 'Manicura francesa de uña larga' },
  { src: galeriaNudeMinimalista, alt: 'Manicura nude con detalle minimalista' },
  { src: galeriaRojoClasico, alt: 'Manicura clásica en rojo' },
  { src: galeriaCoralLazo, alt: 'Uñas en coral con lazo en relieve' },
]

const NOTA_GALERIA =
  'Galería de muestra · fotos de banco de imágenes, las fotos reales del salón se añaden antes de publicar.'

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
          {FOTOS.map((foto) => (
            <div key={foto.alt} className={estilos.tile}>
              <img
                src={foto.src}
                alt={foto.alt}
                width={ANCHO_FOTO}
                height={ALTO_FOTO}
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <p className={estilos.nota}>{NOTA_GALERIA}</p>
      </div>
    </div>
  )
}
