import { useEffect, useRef, useState } from 'react'

import { TELEFONO, telHref, waHref } from '../lib/site'
import estilos from './reserva.module.scss'

/**
 * La sección de reserva (capa visual del DEMO, interactiva). Sección navegable `#reserva-titulo`.
 *
 * Combina las dos piezas interactivas del prototipo SIN equipo ficticio (Pablo: «diseño fiel +
 * contenido honesto»): (a) un mini-calendario servicio → día → hora que COMPONE un mensaje de
 * WhatsApp real (`waHref` de F-02: lo ENVÍA el usuario, es honesto) con la alternativa accesible
 * `tel:`; y (b) el chat guiado de 4 pasos (estado local). Las categorías son las REALES (Uñas ·
 * Pestañas · Cejas), no «Facial/Depilación» del prototipo.
 *
 * 🔴 Los días se calculan en `useEffect` (cliente), NO en el render del módulo: bajo SSG, calcularlos
 * en build-time hornearía fechas caducas. El prototipo hace lo mismo en `componentDidMount`.
 */
const ID_RESERVA = 'reserva-titulo'
const SERVICIOS = ['Uñas', 'Pestañas', 'Cejas'] as const
const HORAS = ['10:00', '11:30', '13:00', '16:00', '17:30', '19:00'] as const
const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

interface DiaReserva {
  readonly dow: string
  readonly day: number
}

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

export function Reserva() {
  // — Mini-calendario —
  const [dias, setDias] = useState<DiaReserva[]>([])
  const [servicio, setServicio] = useState<string | null>(null)
  const [diaIdx, setDiaIdx] = useState<number | null>(null)
  const [horaIdx, setHoraIdx] = useState<number | null>(null)

  useEffect(() => {
    const out: DiaReserva[] = []
    const dt = new Date()
    while (out.length < 6) {
      dt.setDate(dt.getDate() + 1)
      if (dt.getDay() !== 0) {
        out.push({ dow: DOW[dt.getDay()], day: dt.getDate() })
      }
    }
    setDias(out)
  }, [])

  const completo = servicio !== null && diaIdx !== null && horaIdx !== null
  const enlaceWhatsApp = completo
    ? waHref(
        TELEFONO.legible,
        `Hola, me gustaría reservar ${servicio} el ${dias[diaIdx].dow} ${dias[diaIdx].day} a las ${HORAS[horaIdx]}. Gracias.`,
      )
    : ''

  // — Chat guiado —
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
    setBorrador('')
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
        {/* — Mini-calendario — */}
        <div>
          <p className="demo-eyebrow">Reserva rápida</p>
          <h2 id={ID_RESERVA} className="demo-titulo">
            Pide tu cita en un momento
          </h2>
          <p className="demo-intro">
            Elige servicio, día y franja, y te llevamos a WhatsApp con el mensaje listo. Confirmamos
            la hora exacta al momento.
          </p>

          <div className={estilos.paso}>
            <span className={estilos.pasoTitulo}>Servicio</span>
            <div className={estilos.opciones}>
              {SERVICIOS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={s === servicio ? estilos.chipActivo : estilos.chip}
                  aria-pressed={s === servicio}
                  onClick={() => setServicio(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className={estilos.paso}>
            <span className={estilos.pasoTitulo}>Día</span>
            <div className={estilos.opciones}>
              {dias.length === 0 && <span className={estilos.cargando}>Cargando días…</span>}
              {dias.map((d, i) => (
                <button
                  key={`${d.dow}-${d.day}`}
                  type="button"
                  className={i === diaIdx ? estilos.diaActivo : estilos.dia}
                  aria-pressed={i === diaIdx}
                  onClick={() => setDiaIdx(i)}
                >
                  <span className={estilos.diaDow}>{d.dow}</span>
                  <span className={estilos.diaNum}>{d.day}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={estilos.paso}>
            <span className={estilos.pasoTitulo}>Hora</span>
            <div className={estilos.opciones}>
              {HORAS.map((h, i) => (
                <button
                  key={h}
                  type="button"
                  className={i === horaIdx ? estilos.chipActivo : estilos.chip}
                  aria-pressed={i === horaIdx}
                  onClick={() => setHoraIdx(i)}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div className={estilos.acciones}>
            {completo ? (
              <a className="demo-btn demo-btn--wa" href={enlaceWhatsApp}>
                Reservar por WhatsApp
              </a>
            ) : (
              <span className={estilos.deshabilitado}>Elige servicio, día y hora</span>
            )}
            <a className="demo-btn demo-btn--ghost" href={telHref(TELEFONO.legible)}>
              Llamar al estudio
            </a>
          </div>
        </div>

        {/* — Chat guiado — */}
        <div className={estilos.chat}>
          <div className={estilos.chatCabecera}>
            <div className={estilos.avatar}>nl</div>
            <div>
              <div className={estilos.chatNombre}>Nails Lash Studio</div>
              <div className={estilos.enLinea}>en línea</div>
            </div>
          </div>
          <div className={estilos.hilo} ref={hilo}>
            {mensajes.map((m, i) => (
              <div
                key={i}
                className={m.deBot ? estilos.burbujaBot : estilos.burbujaUsuario}
              >
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
              <button type="button" className={estilos.reiniciar} onClick={reiniciar}>
                Reservar otra cita
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
