import { RESERVA_WHATSAPP_TEXTO } from '../lib/demo/reserva-demo'
import { TELEFONO, telHref, waHref } from '../lib/site'
import { ChatNailbot } from './ChatNailbot'
import estilos from './reserva.module.scss'

/**
 * La sección de reserva (capa visual del DEMO, interactiva). Sección navegable `#reserva-titulo`.
 * Contrato: features/reserva_chat.feature.
 *
 * La columna izquierda es el copy VERBATIM del diseño (Opción-1-Rosa L248-256): eyebrow + h2 +
 * párrafo + dos enlaces (WhatsApp / llamar), ambos derivados de la fuente única F-02. NO lleva
 * calendario: ese widget vive en las tarjetas de `#equipo` (`features/equipo_reservas.feature`).
 * La columna derecha es el chat guiado de 4 pasos, extraído a `ChatNailbot.tsx` para COMPARTIRLO con
 * el robot flotante (estado local, NO envía nada a ningún sitio: eso sigue siendo F-13).
 */
const ID_RESERVA = 'reserva-titulo'

export function Reserva() {
  return (
    <section
      className={`demo-seccion demo-seccion--alt ${estilos.reserva}`}
      aria-labelledby={ID_RESERVA}
    >
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
            <a
              className="demo-btn demo-btn--wa"
              href={waHref(TELEFONO.legible, RESERVA_WHATSAPP_TEXTO)}
            >
              WhatsApp
            </a>
            <a className="demo-btn demo-btn--ghost" href={telHref(TELEFONO.legible)}>
              Llamar al estudio
            </a>
          </div>
        </div>

        {/* — Chat guiado: el asistente COMPARTIDO con el robot flotante (ChatNailbot) — */}
        <ChatNailbot />
      </div>
    </section>
  )
}
