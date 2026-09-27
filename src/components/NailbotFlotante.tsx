import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

import {
  NAILBOT_BOCADILLO_CERRAR,
  NAILBOT_BOCADILLO_DESTACADO,
  NAILBOT_BOCADILLO_TEXTO,
  NAILBOT_DIALOGO_CERRAR,
  NAILBOT_DIALOGO_TITULO,
  NAILBOT_LANZADOR_ETIQUETA,
  NAILBOT_LEYENDA,
  NAILBOT_PAUSA_ETIQUETA,
} from '../lib/demo/nailbot-demo'
import { ChatNailbot } from './ChatNailbot'
import { NailbotArte } from './NailbotArte'
import estilos from './nailbot-flotante.module.scss'

/**
 * Nailbot, el robot flotante que se pinta las uñas en la esquina inferior derecha mientras espera a
 * que pidan cita (encargo de Pablo, 2026-09-27; brief `progress/nailbot_diseno.md`, spec F-24).
 *
 * - Se monta SOLO en cliente (L7): sin JS no habría acción, así que no se hornea un botón muerto.
 * - Pulsarlo abre un `<dialog>` NATIVO modal (L8) con el MISMO chat de `#reserva` (`ChatNailbot`, H2),
 *   montado la primera vez que se abre y conservado después (HS-13).
 * - La animación en bucle lleva su control de PAUSA (SC 2.2.2, nivel A). Con
 *   `prefers-reduced-motion: reduce` el robot está quieto y el control no se monta (HS-8).
 * - El bocadillo aparece una vez a los 4 s, se cierra con × o con Esc y no vuelve (H4, L11).
 * - Cero red, cero storage.
 */
const CONSULTA_MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)'
const RETARDO_BOCADILLO_MS = 4000
const ID_BOCADILLO = 'nailbot-bocadillo'
const ID_TITULO = 'nailbot-titulo'
const TECLAS_DE_CARRUSEL = ['ArrowLeft', 'ArrowRight']

export function NailbotFlotante() {
  const [montado, setMontado] = useState(false)
  const [movimientoReducido, setMovimientoReducido] = useState(false)
  const [pausado, setPausado] = useState(false)
  const [bocadillo, setBocadillo] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [chatMontado, setChatMontado] = useState(false)
  const dialogo = useRef<HTMLDialogElement>(null)
  const lanzador = useRef<HTMLButtonElement>(null)
  const pausa = useRef<HTMLButtonElement>(null)
  const bocadilloRetirado = useRef(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }
    const consulta = window.matchMedia(CONSULTA_MOVIMIENTO_REDUCIDO)
    const aplicar = (reduce: boolean) => {
      if (reduce) {
        // Si el foco estaba en el control que va a desaparecer, no se pierde: pasa al lanzador.
        if (pausa.current !== null && document.activeElement === pausa.current) {
          lanzador.current?.focus()
        }
        setPausado(true)
      }
      setMovimientoReducido(reduce)
    }
    aplicar(consulta.matches)
    const alCambiar = (evento: MediaQueryListEvent) => aplicar(evento.matches)
    consulta.addEventListener('change', alCambiar)

    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  useEffect(() => {
    if (!montado) {
      return
    }
    const temporizador = window.setTimeout(() => {
      if (!bocadilloRetirado.current) {
        setBocadillo(true)
      }
    }, RETARDO_BOCADILLO_MS)

    return () => window.clearTimeout(temporizador)
  }, [montado])

  useEffect(() => {
    if (!bocadillo) {
      return
    }
    const alPulsar = (evento: globalThis.KeyboardEvent) => {
      if (evento.key === 'Escape') {
        bocadilloRetirado.current = true
        setBocadillo(false)
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

  const abrir = () => {
    bocadilloRetirado.current = true
    setBocadillo(false)
    setChatMontado(true)
    setAbierto(true)
  }

  const cerrarBocadillo = () => {
    bocadilloRetirado.current = true
    setBocadillo(false)
    lanzador.current?.focus()
  }

  // Con el panel abierto, ←/→ no deben mover los carruseles, que escuchan en `document`.
  const aislarFlechas = (evento: KeyboardEvent<HTMLDialogElement>) => {
    if (TECLAS_DE_CARRUSEL.includes(evento.key)) {
      evento.stopPropagation()
    }
  }

  if (!montado) {
    return null
  }

  return (
    <div className={estilos.flotante}>
      {bocadillo && (
        <div className={estilos.bocadillo} id={ID_BOCADILLO}>
          <p className={estilos.bocadilloTexto}>
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

      <div className={estilos.robot}>
        {!movimientoReducido && (
          <button
            ref={pausa}
            type="button"
            className={estilos.pausa}
            aria-label={NAILBOT_PAUSA_ETIQUETA}
            aria-pressed={pausado}
            onClick={() => setPausado((actual) => !actual)}
          >
            <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
              {pausado ? (
                <path d="M3 1.6 L10.4 6 L3 10.4 Z" fill="currentColor" />
              ) : (
                <>
                  <rect x="2" y="1.5" width="2.8" height="9" rx="1" fill="currentColor" />
                  <rect x="7.2" y="1.5" width="2.8" height="9" rx="1" fill="currentColor" />
                </>
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
          aria-describedby={bocadillo ? ID_BOCADILLO : undefined}
          onClick={abrir}
        >
          <NailbotArte animado pausado={pausado} />
        </button>
      </div>

      <dialog
        ref={dialogo}
        className={estilos.dialogo}
        aria-labelledby={ID_TITULO}
        onClose={() => setAbierto(false)}
        onKeyDown={aislarFlechas}
      >
        <h2 id={ID_TITULO} className={estilos.titulo}>
          {NAILBOT_DIALOGO_TITULO}
        </h2>
        {chatMontado && <ChatNailbot />}
        <p className={estilos.leyenda}>{NAILBOT_LEYENDA}</p>
        <button
          type="button"
          className={estilos.cerrarChat}
          aria-label={NAILBOT_DIALOGO_CERRAR}
          onClick={() => setAbierto(false)}
        >
          <span aria-hidden="true">×</span>
        </button>
      </dialog>
    </div>
  )
}
