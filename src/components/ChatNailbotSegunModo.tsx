import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { NAILBOT_HILO_ETIQUETA, NAILBOT_NOMBRE } from '../lib/demo/nailbot-demo'
import {
  NAILBOT_IA_CAMPO,
  NAILBOT_IA_ENLACE_SOLICITUD,
  NAILBOT_IA_ENVIAR,
  NAILBOT_IA_ESPERA,
  NAILBOT_IA_LEYENDA,
  NAILBOT_IA_PLACEHOLDER,
  NAILBOT_IA_SIN_IA,
  NAILBOT_IA_SIN_IA_WHATSAPP_TEXTO,
  NAILBOT_IA_SUBTITULO,
} from '../lib/demo/nailbot-ia'
import { TELEFONO, telHref, waHref } from '../lib/site'
import { ChatNailbot } from './ChatNailbot'
import { NailbotArte } from './NailbotArte'
import {
  LIMITE_TEXTO,
  type EntornoNailbotIA,
  responderIA,
  urlNailbotIA,
  type RespuestaNailbotIA,
} from './chat-nailbot-ia-logica'
import estilos from './chat-nailbot.module.scss'
import { claveBurbuja, desplazarAlFinal } from './reserva-logica'

/**
 * El chat de Nailbot según el MODO DEL BUILD (issue #35, enmienda N-1bis/N-4bis). Sin
 * `VITE_NAILBOT_API_URL` monta el `ChatNailbot` de siempre (guion local, sin red): el mismo HTML y
 * el mismo comportamiento de N-1/N-4. Con la variable, monta el chat de IA y, si la API falla o
 * tarda demasiado, vuelve al guion local con el contacto del salón.
 */
export function ChatNailbotSegunModo() {
  const url = urlNailbotIA(import.meta.env as EntornoNailbotIA)
  return url === null ? <ChatNailbot /> : <ChatNailbotConIA url={url} />
}

function ChatNailbotConIA({ url }: { readonly url: string }) {
  const [sinIA, setSinIA] = useState(false)
  return sinIA ? (
    <ChatNailbot nota={<NotaSinIA />} />
  ) : (
    <ChatNailbotIA url={url} alFallar={() => setSinIA(true)} />
  )
}

function NotaSinIA() {
  return (
    <>
      {NAILBOT_IA_SIN_IA.antes}
      <a href={waHref(TELEFONO.legible, NAILBOT_IA_SIN_IA_WHATSAPP_TEXTO)}>
        {NAILBOT_IA_SIN_IA.whatsapp}
      </a>
      {NAILBOT_IA_SIN_IA.entre}
      <a href={telHref(TELEFONO.legible)}>{TELEFONO.legible}</a>
      {NAILBOT_IA_SIN_IA.despues}
    </>
  )
}

interface Mensaje {
  readonly deBot: boolean
  readonly texto: string
  readonly solicitud?: RespuestaNailbotIA['solicitud']
}

function ChatNailbotIA({ url, alFallar }: { readonly url: string; readonly alFallar: () => void }) {
  const [borrador, setBorrador] = useState('')
  const [mensajes, setMensajes] = useState<readonly Mensaje[]>([])
  // N-4bis: el identificador de conversación vive SOLO en memoria (sin storage, cookies ni analítica).
  const conversacionId = useRef<string>(undefined)
  const [peticion, setPeticion] = useState<AbortController | null>(null)
  const pendiente = peticion !== null
  const hilo = useRef<HTMLDivElement>(null)
  const idLeyenda = useId()

  // Al desmontar el chat se cancela la petición en vuelo; lo que llegue después no pinta nada (React
  // ignora el estado de un componente desmontado). Depende de `peticion` (y no de `[]`) para que cada
  // limpieza vea la petición vigente.
  useEffect(() => () => peticion?.abort(), [peticion])
  useEffect(() => desplazarAlFinal(hilo.current), [mensajes])

  const texto = borrador.trim()

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (texto === '' || texto.length > LIMITE_TEXTO || pendiente) return
    const nueva = new AbortController()
    setPeticion(nueva)
    setBorrador('')
    setMensajes((actuales) => [...actuales, { deBot: false, texto }])
    try {
      const r = await responderIA(url, texto, conversacionId.current, { signal: nueva.signal })
      conversacionId.current = r.conversacionId
      setMensajes((actuales) => [
        ...actuales,
        { deBot: true, texto: r.respuesta, solicitud: r.solicitud },
      ])
      setPeticion(null)
    } catch {
      alFallar()
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
          <div className={estilos.subtitulo}>{NAILBOT_IA_SUBTITULO}</div>
        </div>
      </div>
      <p className={estilos.leyenda} id={idLeyenda}>
        {NAILBOT_IA_LEYENDA}
      </p>
      <div
        className={estilos.hilo}
        ref={hilo}
        role="log"
        aria-live="polite"
        aria-label={NAILBOT_HILO_ETIQUETA}
      >
        {mensajes.map((m, i) => (
          // `pre-line` en línea (no en la hoja de estilos compartida): el aviso de IA llega separado de la
          // respuesta por una línea en blanco (`\n\n`) y en un `div` se colapsaría.
          <div
            key={i}
            data-de={m.deBot ? 'bot' : 'usuario'}
            style={{ whiteSpace: 'pre-line' }}
            className={estilos[claveBurbuja(m.deBot)]}
          >
            {m.texto}
            {m.solicitud && (
              <p>
                <a href={m.solicitud.enlaceWhatsApp}>{NAILBOT_IA_ENLACE_SOLICITUD}</a>
                {' · '}
                {m.solicitud.codigo}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className={estilos.chatPie}>
        <p role="status">{pendiente ? NAILBOT_IA_ESPERA : ''}</p>
        <form className={estilos.entrada} onSubmit={(evento) => void enviar(evento)}>
          <input
            aria-label={NAILBOT_IA_CAMPO}
            aria-describedby={idLeyenda}
            placeholder={NAILBOT_IA_PLACEHOLDER}
            maxLength={LIMITE_TEXTO}
            value={borrador}
            onChange={(evento) => setBorrador(evento.target.value)}
          />
          <button aria-label={NAILBOT_IA_ENVIAR} disabled={pendiente || texto === ''}>
            →
          </button>
        </form>
      </div>
    </div>
  )
}
