import { CONTACTO_WHATSAPP_TEXTO } from '../lib/demo/contacto-demo'
import { horarioParaUI, HORARIO_SEMANAL } from '../lib/horario'
import { DIRECCION, GEO, instagramHref, REDES, TELEFONO, telHref, waHref } from '../lib/site'
import estilos from './contacto.module.scss'

/**
 * La sección de contacto (F-12) enriquecida para el DEMO con el look del prototipo Opcion-1-Rosa:
 * horario (dato real de F-10) + dirección + Instagram + CTA de WhatsApp/tel a la izquierda, y un
 * bloque de mapa con enlace «Cómo llegar» a la derecha.
 *
 * 🔴 Reutiliza el id `contacto-titulo` que la nav y la puerta de anclas vivas de F-06 esperan (no
 * crea sección nueva). Los `href` DERIVAN de la fuente única F-02 (`telHref`, `waHref`,
 * `instagramHref`): nunca hardcodeados. El «Cómo llegar» abre Google Maps en pestaña nueva con las
 * coordenadas [V] de F-02 (formato oficial Maps URLs `?api=1&query=lat,lng`): es un HIPERENLACE
 * iniciado por el usuario, no una petición automática → no rompe «cero terceros» (F-05). El email y
 * TikTok NO aparecen (datos no confirmados). Sin `<iframe>` de Maps (rompería F-05/F-11).
 */
const ID_CONTACTO = 'contacto-titulo'

const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${GEO.latitud}%2C${GEO.longitud}`

export function Contacto() {
  const horario = horarioParaUI(HORARIO_SEMANAL)

  return (
    <section className={`demo-seccion ${estilos.contacto}`} aria-labelledby={ID_CONTACTO}>
      <div className={`demo-contenedor ${estilos.rejilla}`}>
        <div className={estilos.info}>
          <p className="demo-eyebrow">Visítanos</p>
          <h2 id={ID_CONTACTO} className="demo-titulo">
            Horario y ubicación
          </h2>

          <div className={estilos.horario}>
            {horario.map((fila) => (
              <div key={fila.dias} className={estilos.horarioFila}>
                <span className={estilos.dia}>{fila.dias}</span>
                <span className={estilos.horas}>{fila.franja}</span>
              </div>
            ))}
          </div>

          <div className={estilos.datos}>
            <div>
              <div className={estilos.datoTitulo}>Dirección</div>
              <div>
                {DIRECCION.centroComercial}, {DIRECCION.via}, {DIRECCION.planta}, {DIRECCION.local},{' '}
                {DIRECCION.codigoPostal} {DIRECCION.localidad}
              </div>
            </div>
            <div className={estilos.datosFila}>
              <div>
                <div className={estilos.datoTitulo}>Teléfono</div>
                <a className={estilos.telefono} href={telHref(TELEFONO.legible)}>
                  {TELEFONO.legible}
                </a>
              </div>
              <div>
                <div className={estilos.datoTitulo}>Instagram</div>
                <a href={instagramHref(REDES.instagram)}>{REDES.instagram}</a>
              </div>
            </div>
            <a
              className={`demo-btn demo-btn--wa ${estilos.wa}`}
              href={waHref(TELEFONO.legible, CONTACTO_WHATSAPP_TEXTO)}
            >
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>

        <div className={estilos.mapa}>
          <span className={estilos.mapaEtiqueta}>
            {DIRECCION.centroComercial} · {DIRECCION.planta}, {DIRECCION.local}
          </span>
          <a
            className={`demo-btn demo-btn--solido ${estilos.comoLlegar}`}
            href={MAPS_HREF}
            target="_blank"
            rel="noopener noreferrer"
          >
            Cómo llegar
          </a>
        </div>
      </div>
    </section>
  )
}
