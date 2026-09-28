import { useEffect, useId, useRef, useState } from 'react'

import {
  NAILBOT_AVISO,
  NAILBOT_CAMPO_NOMBRE,
  NAILBOT_CAMPO_PLACEHOLDER,
  NAILBOT_ENLACE_FINAL,
  NAILBOT_ENVIAR,
  NAILBOT_HILO_ETIQUETA,
  NAILBOT_LEYENDA,
  NAILBOT_NOMBRE,
  NAILBOT_REINICIAR,
  NAILBOT_SIN_NOMBRE,
  NAILBOT_SUBTITULO,
} from '../lib/demo/nailbot-demo'
import { TELEFONO, waHref } from '../lib/site'
import {
  enfocarPrimerControl,
  estadoInicial,
  opcionesDelPaso,
  responder,
  type EntradaChat,
  type EstadoChat,
} from './chat-nailbot-logica'
import estilos from './chat-nailbot.module.scss'
import { NailbotArte } from './NailbotArte'
import {
  claveBurbuja,
  desplazarAlFinal,
  mensajeReserva,
  type SolicitudReserva,
} from './reserva-logica'

/**
 * Nailbot, el chat de reserva COMPARTIDO (F-23, contrato features/nailbot_chat_compartido.feature).
 * Lo montan `#reserva` (horneado en SSG) y el panel del robot flotante (F-24), cada uno con su estado.
 *
 * Toda decisión vive en la función PURA `responder` (chat-nailbot-logica.ts); el copy, en
 * src/lib/demo/nailbot-demo.ts. Aquí solo se CABLEA: estado, foco y enlace final. No envía nada: el
 * mensaje lo manda la persona desde su WhatsApp (F-13).
 */
export function ChatNailbot() {
  const [estado, setEstado] = useState<EstadoChat>(() => estadoInicial())
  const [borrador, setBorrador] = useState('')
  const hilo = useRef<HTMLDivElement>(null)
  const pie = useRef<HTMLDivElement>(null)
  const actuo = useRef(false)
  const idAviso = useId()

  useEffect(() => {
    // Autoscroll del hilo (reserva_chat @s18): el CÓMO vive en `desplazarAlFinal`.
    desplazarAlFinal(hilo.current)
  }, [estado.mensajes])

  useEffect(() => {
    // Tras cada acción de la persona, el foco pasa al primer control del paso nuevo; NUNCA al montar.
    if (actuo.current) {
      enfocarPrimerControl(pie.current)
    }
  }, [estado])

  const actuar = (entrada: EntradaChat) => {
    actuo.current = true
    setEstado((actual) => responder(actual, entrada))
  }

  const enviarNombre = () => actuar({ tipo: 'nombre', valor: borrador })

  const reiniciar = () => {
    setBorrador('')
    actuar({ tipo: 'reiniciar' })
  }

  const opciones = opcionesDelPaso(estado.paso)

  return (
    <div className={estilos.chat}>
      <div className={estilos.chatCabecera}>
        <div className={estilos.avatar}>
          <NailbotArte />
        </div>
        <div>
          <div className={estilos.chatNombre}>{NAILBOT_NOMBRE}</div>
          <div className={estilos.subtitulo}>{NAILBOT_SUBTITULO}</div>
        </div>
      </div>
      <p className={estilos.leyenda}>{NAILBOT_LEYENDA}</p>
      <div
        className={estilos.hilo}
        ref={hilo}
        role="log"
        aria-live="polite"
        aria-label={NAILBOT_HILO_ETIQUETA}
      >
        {estado.mensajes.map((m, i) => (
          <div
            key={i}
            data-de={m.deBot ? 'bot' : 'usuario'}
            className={estilos[claveBurbuja(m.deBot)]}
          >
            {m.texto}
          </div>
        ))}
      </div>
      <div className={estilos.chatPie} ref={pie}>
        {opciones.length > 0 && (
          <div className={estilos.opciones}>
            {opciones.map((o) => (
              <button
                key={o}
                type="button"
                className={estilos.chipChat}
                onClick={() => actuar({ tipo: 'elegir', valor: o })}
              >
                {o}
              </button>
            ))}
          </div>
        )}
        {estado.paso === 'nombre' && (
          <>
            <div className={estilos.entrada}>
              <input
                value={borrador}
                placeholder={NAILBOT_CAMPO_PLACEHOLDER}
                aria-label={NAILBOT_CAMPO_NOMBRE}
                onChange={(e) => setBorrador(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    enviarNombre()
                  }
                }}
              />
              <button type="button" aria-label={NAILBOT_ENVIAR} onClick={enviarNombre}>
                →
              </button>
            </div>
            <div className={estilos.opciones}>
              <button
                type="button"
                className={estilos.chipChat}
                onClick={() => actuar({ tipo: 'sinNombre' })}
              >
                {NAILBOT_SIN_NOMBRE}
              </button>
            </div>
          </>
        )}
        {estado.paso === 'hecho' && (
          <>
            <p id={idAviso} className={estilos.aviso}>
              {NAILBOT_AVISO}
            </p>
            <a
              className="demo-btn demo-btn--wa"
              // Solo al terminar: `responder` garantiza servicio, día y franja (@s6); el nombre es opcional.
              href={waHref(TELEFONO.legible, mensajeReserva(estado.respuestas as SolicitudReserva))}
              aria-describedby={idAviso}
            >
              {NAILBOT_ENLACE_FINAL}
            </a>
            <button type="button" className={estilos.reiniciar} onClick={reiniciar}>
              {NAILBOT_REINICIAR}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
