import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { NAILBOT_HILO_ETIQUETA, NAILBOT_NOMBRE } from '../lib/demo/nailbot-demo'
import { TELEFONO, telHref, waHref } from '../lib/site'
import { ChatNailbot } from './ChatNailbot'
import { NailbotArte } from './NailbotArte'
import { responderIA, type RespuestaNailbotIA } from './chat-nailbot-ia-logica'
import estilos from './chat-nailbot.module.scss'
import { claveBurbuja, desplazarAlFinal } from './reserva-logica'

const LIMITE_MENSAJE = 1000

interface Mensaje {
  readonly deBot: boolean
  readonly texto: string
  readonly solicitud?: RespuestaNailbotIA['solicitud']
}

export function ChatNailbotSegunModo() {
  const url = import.meta.env.VITE_NAILBOT_API_URL?.trim()
  return url ? <ChatNailbotIA url={url} /> : <ChatNailbot />
}

function ChatNailbotIA({ url }: { readonly url: string }) {
  const [borrador, setBorrador] = useState('')
  const [mensajes, setMensajes] = useState<readonly Mensaje[]>([])
  const [pendiente, setPendiente] = useState(false)
  const [fallo, setFallo] = useState(false)
  const conversacionId = useRef<string>(undefined)
  const enCurso = useRef<AbortController | null>(null)
  const hilo = useRef<HTMLDivElement>(null)
  const idAviso = useId()

  useEffect(() => () => enCurso.current?.abort(), [])
  useEffect(() => desplazarAlFinal(hilo.current), [mensajes])

  const texto = borrador.trim()
  const valido = texto.length > 0 && texto.length <= LIMITE_MENSAJE

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!valido || enCurso.current) return
    const peticion = new AbortController()
    enCurso.current = peticion
    setPendiente(true)
    setFallo(false)
    setBorrador('')
    setMensajes((actuales) => [...actuales, { deBot: false, texto }])
    try {
      const respuesta = await responderIA(url, texto, conversacionId.current, peticion.signal)
      if (peticion.signal.aborted) return
      conversacionId.current = respuesta.conversacionId
      setMensajes((actuales) => [
        ...actuales,
        { deBot: true, texto: respuesta.respuesta, solicitud: respuesta.solicitud },
      ])
    } catch {
      if (!peticion.signal.aborted) setFallo(true)
    } finally {
      if (!peticion.signal.aborted) {
        enCurso.current = null
        setPendiente(false)
      }
    }
  }

  return (
    <div className={estilos.chat}>
      <div className={estilos.chatCabecera}>
        <div className={estilos.avatar}>
          <NailbotArte />
        </div>
        <div>
          <div className={estilos.chatNombre}>{NAILBOT_NOMBRE}</div>
          <div className={estilos.subtitulo}>Asistente de IA</div>
        </div>
      </div>
      <p className={estilos.leyenda} id={idAviso}>
        Hablas con un sistema de inteligencia artificial, no con una persona
      </p>
      <div
        className={estilos.hilo}
        ref={hilo}
        role="log"
        aria-live="polite"
        aria-label={NAILBOT_HILO_ETIQUETA}
      >
        {mensajes.map((mensaje, i) => (
          <div key={i} className={estilos[claveBurbuja(mensaje.deBot)]}>
            {mensaje.texto}
            {mensaje.solicitud && (
              <p>
                <a href={mensaje.solicitud.enlaceWhatsApp}>Enviar al salón por WhatsApp</a>
                {' · '}
                {mensaje.solicitud.codigo}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className={estilos.chatPie}>
        <p role="status">{pendiente ? 'Escribiendo…' : ''}</p>
        {fallo && (
          <p role="alert">
            El asistente no está disponible. Contacta con el salón por{' '}
            <a href={waHref(TELEFONO.legible, 'Hola, quiero consultar una cita.')}>WhatsApp</a>
            {' o llama al '}
            <a href={telHref(TELEFONO.legible)}>{TELEFONO.legible}</a>.
          </p>
        )}
        <form className={estilos.entrada} onSubmit={(evento) => void enviar(evento)}>
          <input
            aria-label="Mensaje"
            aria-describedby={idAviso}
            maxLength={LIMITE_MENSAJE}
            value={borrador}
            onChange={(evento) => setBorrador(evento.target.value)}
          />
          <button type="submit" aria-label="Enviar" disabled={pendiente || !valido}>
            →
          </button>
        </form>
      </div>
    </div>
  )
}
