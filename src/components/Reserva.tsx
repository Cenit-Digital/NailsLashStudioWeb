import { useEffect, useRef, useState } from 'react'

import { RESERVA_WHATSAPP_TEXTO } from '../lib/demo/reserva-demo'
import { TELEFONO, telHref, waHref } from '../lib/site'
import { claveBurbuja, mensajeReserva } from './reserva-logica'
import estilos from './reserva.module.scss'

/**
 * La sección de reserva (capa visual del DEMO, interactiva). Sección navegable `#reserva-titulo`.
 * Contrato: features/reserva_chat.feature.
 *
 * La columna izquierda es el copy VERBATIM del diseño (Opción-1-Rosa L248-256): eyebrow + h2 +
 * párrafo + dos enlaces (WhatsApp / llamar), ambos derivados de la fuente única F-02. NO lleva
 * calendario: ese widget vive en las tarjetas de `#equipo` (`features/equipo_reservas.feature`).
 * La columna derecha es el chat guiado de 4 pasos (estado local, NO envía nada a ningún sitio: eso
 * sigue siendo F-13).
 */
const ID_RESERVA = 'reserva-titulo'

interface MensajeChat {
  readonly deBot: boolean
  readonly texto: string
}

interface PasoChat {
  readonly clave: string
  readonly bot: string
  readonly opciones?: readonly string[]
}

const FLUJO_CHAT: readonly PasoChat[] = [
  { clave: 'servicio', bot: '¡Hola! Soy el asistente de Nails Lash Studio ✨ ¿Qué te gustaría reservar?', opciones: ['Uñas', 'Pestañas', 'Cejas'] },
  { clave: 'dia', bot: '¡Perfecto! ¿Qué día te viene mejor?', opciones: ['Entre semana', 'Este fin de semana', 'Lo antes posible'] },
  { clave: 'franja', bot: 'Genial. ¿Prefieres alguna franja horaria?', opciones: ['Por la mañana', 'Por la tarde', 'Me es indiferente'] },
  { clave: 'nombre', bot: 'Casi listo. ¿A qué nombre hago la reserva?' },
]

function mensajeInicial(): MensajeChat[] {
  return [{ deBot: true, texto: FLUJO_CHAT[0].bot }]
}

/** El href del CTA que entrega la reserva ya redactada (@s24): junta el número de F-02 con el
 * mensaje que compone la función PURA `mensajeReserva` a partir de las cuatro respuestas del guion. */
function hrefReservaWhatsapp(respuestas: Record<string, string>): string {
  const { servicio, dia, franja, nombre } = respuestas

  return waHref(TELEFONO.legible, mensajeReserva({ servicio, dia, franja, nombre }))
}

export function Reserva() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>(mensajeInicial)
  const [paso, setPaso] = useState(0)
  const [borrador, setBorrador] = useState('')
  const [hecho, setHecho] = useState(false)
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const hilo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Asignación directa de scrollTop (como el prototipo): no lanza bajo jsdom, que no implementa
    // Element.scrollTo, y baja el hilo al último mensaje en el navegador igual.
    if (hilo.current) {
      hilo.current.scrollTop = hilo.current.scrollHeight
    }
  }, [mensajes])

  const avanzar = (valor: string) => {
    const pasoActual = FLUJO_CHAT[paso]
    const nuevasRespuestas = { ...respuestas, [pasoActual.clave]: valor }
    const siguiente = paso + 1
    const conUsuario: MensajeChat[] = [...mensajes, { deBot: false, texto: valor }]

    if (siguiente < FLUJO_CHAT.length) {
      setMensajes([...conUsuario, { deBot: true, texto: FLUJO_CHAT[siguiente].bot }])
      setPaso(siguiente)
    } else {
      const resumen = `¡Gracias, ${nuevasRespuestas.nombre}! ✨ Tu solicitud: ${nuevasRespuestas.servicio} · ${nuevasRespuestas.dia} · ${nuevasRespuestas.franja}. Te confirmaremos la hora exacta por WhatsApp. ¡Te esperamos en Nails Lash Studio!`
      setMensajes([...conUsuario, { deBot: true, texto: resumen }])
      setHecho(true)
    }
    setRespuestas(nuevasRespuestas)
  }

  const enviarNombre = () => {
    const valor = borrador.trim()
    if (valor === '') return
    avanzar(valor)
  }

  const reiniciar = () => {
    setMensajes(mensajeInicial())
    setPaso(0)
    setBorrador('')
    setHecho(false)
    setRespuestas({})
  }

  const pasoActual = FLUJO_CHAT[paso]
  const esInput = !hecho && pasoActual.opciones === undefined

  return (
    <section className={`demo-seccion demo-seccion--alt ${estilos.reserva}`} aria-labelledby={ID_RESERVA}>
      <div className={`demo-contenedor ${estilos.rejilla}`}>
        <div>
          <p className="demo-eyebrow">Reserva rápida</p>
          <h2 id={ID_RESERVA} className="demo-titulo">
            ¿Prefieres reservar por chat?
          </h2>
          <p className="demo-intro">
            Elige servicio, día y franja horaria con nuestro asistente y te confirmamos la hora
            exacta por WhatsApp.
          </p>

          <div className={estilos.acciones}>
            <a className="demo-btn demo-btn--wa" href={waHref(TELEFONO.legible, RESERVA_WHATSAPP_TEXTO)}>
              WhatsApp
            </a>
            <a className="demo-btn demo-btn--ghost" href={telHref(TELEFONO.legible)}>
              Llamar al estudio
            </a>
          </div>
        </div>

        {/* — Chat guiado — */}
        <div className={estilos.chat}>
          <div className={estilos.chatCabecera}>
            <div className={estilos.avatar} aria-hidden="true">
              nl
            </div>
            <div>
              <div className={estilos.chatNombre}>Nails Lash Studio</div>
              <div className={estilos.enLinea}>en línea</div>
            </div>
          </div>
          <div className={estilos.hilo} ref={hilo}>
            {mensajes.map((m, i) => (
              <div key={i} data-de={m.deBot ? 'bot' : 'usuario'} className={estilos[claveBurbuja(m.deBot)]}>
                {m.texto}
              </div>
            ))}
          </div>
          <div className={estilos.chatPie}>
            {!hecho && pasoActual.opciones && (
              <div className={estilos.opciones}>
                {pasoActual.opciones.map((o) => (
                  <button key={o} type="button" className={estilos.chipChat} onClick={() => avanzar(o)}>
                    {o}
                  </button>
                ))}
              </div>
            )}
            {esInput && (
              <div className={estilos.entrada}>
                <input
                  value={borrador}
                  placeholder="Escribe tu nombre…"
                  aria-label="Tu nombre"
                  onChange={(e) => setBorrador(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      enviarNombre()
                    }
                  }}
                />
                <button type="button" aria-label="Enviar" onClick={enviarNombre}>
                  →
                </button>
              </div>
            )}
            {hecho && (
              <>
                <a className="demo-btn demo-btn--wa" href={hrefReservaWhatsapp(respuestas)}>
                  Enviar la reserva por WhatsApp
                </a>
                <button type="button" className={estilos.reiniciar} onClick={reiniciar}>
                  Reservar otra cita
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
