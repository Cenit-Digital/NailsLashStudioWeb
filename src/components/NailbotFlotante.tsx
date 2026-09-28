import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

import {
  NAILBOT_BOCADILLO_CERRAR,
  NAILBOT_BOCADILLO_DESTACADO,
  NAILBOT_BOCADILLO_TEXTO,
  NAILBOT_DIALOGO_CERRAR,
  NAILBOT_DIALOGO_TITULO,
  NAILBOT_LANZADOR_ETIQUETA,
  NAILBOT_PAUSA_ETIQUETA,
} from '../lib/demo/nailbot-demo'
import { ChatNailbot } from './ChatNailbot'
import { NailbotArte } from './NailbotArte'
import {
  detenerTecla,
  enfocar,
  focoDentro,
  mostrarBocadillo,
  RETARDO_BOCADILLO_MS,
  siguienteAnimacion,
  type EstadoAnimacion,
  type EventoAnimacion,
} from './nailbot-flotante-logica'
import estilos from './nailbot-flotante.module.scss'

const CONSULTA_MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)'

/**
 * Nailbot, el robot que se pinta las uñas en la esquina inferior derecha mientras espera a que pidan
 * cita (F-24, contrato features/nailbot_flotante.feature; brief progress/nailbot_diseno.md).
 *
 * - Solo existe en el CLIENTE (L7): hasta leer la preferencia de movimiento devuelve `null`, así que
 *   el HTML horneado no trae ningún botón muerto.
 * - La animación en bucle lleva su PAUSA (SC 2.2.2); con «reduce» el robot está quieto y la pausa no
 *   se monta (HS-8). Todas las decisiones viven en nailbot-flotante-logica.ts (puras).
 * - El lanzador abre un `<dialog>` NATIVO con showModal(), con su PROPIO ChatNailbot (H2), montado la
 *   primera vez que se abre y conservado después (HS-13).
 * - El bocadillo aparece una vez a los 4 s; se cierra con su ×, con Esc o al abrir el panel (L11).
 * - Sin red y sin storage.
 */
export function NailbotFlotante() {
  const [animacion, setAnimacion] = useState<EstadoAnimacion | null>(null)
  const [msDesdeElMontaje, setMsDesdeElMontaje] = useState(0)
  const [descartado, setDescartado] = useState(false)
  const [abiertoAlgunaVez, setAbiertoAlgunaVez] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const dialogo = useRef<HTMLDialogElement>(null)
  const lanzador = useRef<HTMLButtonElement>(null)
  const pausa = useRef<HTMLButtonElement>(null)
  const bocadilloRef = useRef<HTMLDivElement>(null)
  const idBocadillo = useId()
  const idTitulo = useId()

  const bocadillo = mostrarBocadillo(msDesdeElMontaje, abiertoAlgunaVez, descartado)

  const aplicar = (evento: EventoAnimacion) =>
    setAnimacion((actual) => siguienteAnimacion(actual, evento))

  useEffect(
    () => {
      if (typeof window.matchMedia !== 'function') {
        aplicar({ tipo: 'preferencia', reduce: false })
        return
      }
      const consulta = window.matchMedia(CONSULTA_MOVIMIENTO_REDUCIDO)
      const alCambiar = (evento: MediaQueryListEvent) => {
        // Si el foco estaba en la pausa que va a desaparecer, no cae al vacío: pasa al lanzador.
        if (evento.matches && document.activeElement === pausa.current) {
          enfocar(lanzador.current)
        }
        aplicar({ tipo: 'preferencia', reduce: evento.matches })
      }
      aplicar({ tipo: 'preferencia', reduce: consulta.matches })
      consulta.addEventListener('change', alCambiar)

      return () => consulta.removeEventListener('change', alCambiar)
    },
    // MUTANTE EQUIVALENTE (ArrayDeclaration): deps CONSTANTES de un efecto de solo-montaje; React
    // compara con Object.is y el efecto corre una sola vez en ambas versiones (precedente Hero.tsx).
    // Stryker disable next-line all
    [],
  )

  useEffect(
    () => {
      const temporizador = window.setTimeout(
        () => setMsDesdeElMontaje(RETARDO_BOCADILLO_MS),
        RETARDO_BOCADILLO_MS,
      )

      return () => window.clearTimeout(temporizador)
    },
    // MUTANTE EQUIVALENTE (ArrayDeclaration): mismo caso que el efecto de arriba.
    // Stryker disable next-line all
    [],
  )

  useEffect(() => {
    if (!bocadillo) {
      return
    }
    // Esc se escucha en document SOLO mientras el bocadillo se ve (HS-9): lo cierra sin mover el foco,
    // salvo que el foco estuviera DENTRO del bocadillo (su ×), que va a desaparecer: entonces, al robot.
    const alPulsar = (evento: globalThis.KeyboardEvent) => {
      if (evento.key === 'Escape') {
        if (focoDentro(bocadilloRef.current, document.activeElement)) {
          enfocar(lanzador.current)
        }
        setDescartado(true)
      }
    }
    document.addEventListener('keydown', alPulsar)

    return () => document.removeEventListener('keydown', alPulsar)
  }, [bocadillo])

  useEffect(() => {
    const nodo = dialogo.current

    if (nodo === null) {
      return
    }
    if (abierto && !nodo.open) {
      nodo.showModal()
    }
    if (!abierto && nodo.open) {
      nodo.close()
    }
  }, [abierto])

  if (animacion === null) {
    return null
  }

  const abrir = () => {
    setAbiertoAlgunaVez(true)
    setAbierto(true)
  }

  const cerrarBocadillo = () => {
    setDescartado(true)
    enfocar(lanzador.current)
  }

  // Con el panel abierto, ← y → no deben mover los carruseles, que escuchan en document (L13).
  const aislarFlechas = (evento: KeyboardEvent<HTMLDialogElement>) => {
    if (detenerTecla(evento.key)) {
      evento.stopPropagation()
    }
  }

  return (
    <div className={estilos.flotante}>
      {bocadillo && (
        <div ref={bocadilloRef} className={estilos.bocadillo}>
          <p id={idBocadillo} className={estilos.bocadilloTexto}>
            <strong>{NAILBOT_BOCADILLO_DESTACADO}</strong> {NAILBOT_BOCADILLO_TEXTO}
          </p>
          <button
            type="button"
            className={estilos.cerrarBocadillo}
            aria-label={NAILBOT_BOCADILLO_CERRAR}
            onClick={cerrarBocadillo}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}

      {animacion.pausaMontada && (
        <button
          ref={pausa}
          type="button"
          className={estilos.pausa}
          aria-label={NAILBOT_PAUSA_ETIQUETA}
          aria-pressed={animacion.pausaPulsada}
          onClick={() => aplicar({ tipo: 'pulsarPausa' })}
        >
          <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
            {animacion.pausaPulsada ? (
              <path d="M3 1.6 L10.4 6 L3 10.4 Z" fill="currentColor" />
            ) : (
              <path d="M2 1.5 H4.8 V10.5 H2 Z M7.2 1.5 H10 V10.5 H7.2 Z" fill="currentColor" />
            )}
          </svg>
        </button>
      )}
      <button
        ref={lanzador}
        type="button"
        className={estilos.lanzador}
        aria-label={NAILBOT_LANZADOR_ETIQUETA}
        aria-haspopup="dialog"
        aria-describedby={bocadillo ? idBocadillo : undefined}
        onClick={abrir}
      >
        <NailbotArte animacion={animacion.animacion} />
      </button>

      <dialog
        ref={dialogo}
        className={estilos.dialogo}
        aria-labelledby={idTitulo}
        onClose={() => setAbierto(false)}
        onKeyDown={aislarFlechas}
      >
        <h2 id={idTitulo} className={estilos.titulo}>
          {NAILBOT_DIALOGO_TITULO}
        </h2>
        {abiertoAlgunaVez && <ChatNailbot />}
        <button
          type="button"
          className={estilos.cerrarDialogo}
          aria-label={NAILBOT_DIALOGO_CERRAR}
          onClick={() => setAbierto(false)}
        >
          <span aria-hidden="true">×</span>
        </button>
      </dialog>
    </div>
  )
}
