import {
  type FormEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { CATALOGO_PROVISIONAL } from '../lib/citas/catalogo'
import {
  crearClienteCitas,
  mensajeDeCarga,
  mensajeDeError,
  type Pedir,
} from '../lib/citas/cliente-api'
import { configCitas, type EntornoCitas } from '../lib/citas/config'
import type { CampoClienta } from '../lib/citas/datos-clienta'
import type { DiaReservable, Hueco } from '../lib/citas/disponibilidad'
import {
  estadoInicial,
  etiquetaOpcion,
  type EventoReserva,
  numeroDePaso,
  peticionDe,
  puedeContinuar,
  reducirReserva,
  resumenDe,
  vistaServicio,
} from '../lib/citas/flujo-reserva'
import { diaCorto } from '../lib/citas/formato'
import { cargarTurnstile } from '../lib/citas/turnstile'
import { NOMBRE, TELEFONO, telHref } from '../lib/site'
import estilos from './reserva-citas.module.scss'
import { ReservaCitasTurnstile } from './ReservaCitasTurnstile'

/**
 * Citas · Fase 7 (issue #39): el modal «Reserva tu cita» (contrato features/reserva_citas.feature).
 *
 * - Solo existe en el CLIENTE y solo si `VITE_CITAS_API` tiene valor (decisión 1): sin él devuelve
 *   `null` y los dos botones de D-13 siguen siendo enlaces a `#reserva-titulo` (@s4).
 * - Lo abren SOLO los enlaces marcados con `data-reserva-citas` («Reservar» de la cabecera y «Reservar
 *   cita» del hero), con un clic delegado en `document`; el enlace «Reserva» de la nav y Nailbot no
 *   cambian (@s3).
 * - `<dialog>` nativo como Nailbot: a 600 px o menos ocupa la pantalla (@s6).
 * - Las decisiones viven en src/lib/citas/ (puras y mutadas); aquí solo se pinta y se cablea la red.
 */
const CAMPOS: { campo: CampoClienta; etiqueta: string; tipo: string; auto: string; max: number }[] =
  [
    { campo: 'nombre', etiqueta: 'Nombre', tipo: 'text', auto: 'name', max: 80 },
    { campo: 'telefono', etiqueta: 'Teléfono', tipo: 'tel', auto: 'tel', max: 20 },
    { campo: 'email', etiqueta: 'Email', tipo: 'email', auto: 'email', max: 254 },
  ]

/** `para` es la consulta (opción, u opción y fecha): con otra, la lista es de antes y no se pinta. */
type Carga<T> =
  | { estado: 'cargando' }
  | { estado: 'error'; para: string }
  | { estado: 'listo'; para: string; datos: T[] }

function cargaDe<T>(carga: Carga<T>, para: string): Carga<T> {
  return carga.estado !== 'cargando' && carga.para === para ? carga : { estado: 'cargando' }
}

function Llamar() {
  return (
    <a className={estilos.secundario} href={telHref(TELEFONO.legible)}>
      Llamar al estudio
    </a>
  )
}

export function ReservaCitas({
  entorno = import.meta.env as EntornoCitas,
  pedir,
  crearClave = () => crypto.randomUUID(),
}: {
  entorno?: EntornoCitas
  pedir?: Pedir
  crearClave?: () => string
}) {
  const [montado, setMontado] = useState(false)
  const config = useMemo(() => configCitas(entorno), [entorno])
  const cliente = useMemo(
    () => (config ? crearClienteCitas(config.api, pedir ?? ((u, i) => window.fetch(u, i))) : null),
    [config, pedir],
  )

  const [estado, setEstado] = useState(estadoInicial)
  const actual = useRef(estado)
  const [abierto, setAbierto] = useState(false)
  const [dias, setDias] = useState<Carga<DiaReservable>>({ estado: 'cargando' })
  const [horas, setHoras] = useState<Carga<Hueco>>({ estado: 'cargando' })
  const [recarga, setRecarga] = useState(0)
  const [token, setToken] = useState<string | null>(null)
  const [widget, setWidget] = useState(0)
  const [turnstileFallo, setTurnstileFallo] = useState(false)
  const dialogo = useRef<HTMLDialogElement>(null)
  const titulo = useRef<HTMLHeadingElement>(null)
  const abridor = useRef<HTMLElement | null>(null)
  const pasoEnfocado = useRef<string>('servicio')
  const [enfocarError, setEnfocarError] = useState(0)

  /** Aplica el evento al estado ACTUAL (síncrono: el doble clic ve el «enviando» del primero). */
  const despachar = useCallback((evento: EventoReserva) => {
    const siguiente = reducirReserva(actual.current, evento)
    actual.current = siguiente
    setEstado(siguiente)
    return siguiente
  }, [])

  useEffect(() => setMontado(true), [])

  useEffect(() => {
    if (!montado || config === null) return
    const alPulsar = (evento: MouseEvent) => {
      const objetivo =
        evento.target instanceof Element ? evento.target.closest('[data-reserva-citas]') : null
      if (!(objetivo instanceof HTMLElement)) return
      // Ctrl/Cmd/Mayús-clic o el botón central siguen siendo del navegador (pestaña nueva, etc.).
      if (evento.defaultPrevented || evento.button !== 0) return
      if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return
      evento.preventDefault()
      abridor.current = objetivo
      despachar({ tipo: 'reiniciar' })
      pasoEnfocado.current = 'servicio'
      setToken(null)
      setTurnstileFallo(false)
      setAbierto(true)
    }
    document.addEventListener('click', alPulsar)
    return () => document.removeEventListener('click', alPulsar)
  }, [montado, config, despachar])

  useEffect(() => {
    const nodo = dialogo.current
    if (nodo === null) return
    if (abierto && !nodo.open) {
      nodo.showModal()
      // showModal() enfoca el primer control; el contrato quiere el foco en el título (@s1).
      titulo.current?.focus()
    }
    if (!abierto && nodo.open) nodo.close()
  }, [abierto, montado])

  const { paso, opcion, fecha } = estado

  // Al cambiar de paso, el foco va a su encabezado: el botón pulsado desaparece o se desactiva y un
  // lector de pantalla debe anunciar el paso nuevo. Al abrir, el foco es del título (@s1).
  useEffect(() => {
    if (!abierto || paso === pasoEnfocado.current) return
    pasoEnfocado.current = paso
    document.getElementById('reserva-citas-paso')?.focus()
  }, [abierto, paso])

  // Tras «Revisar la cita» con errores, o un 400 de un campo, el foco va al primer campo inválido.
  useEffect(() => {
    if (enfocarError > 0) {
      dialogo.current?.querySelector<HTMLInputElement>('input[aria-invalid="true"]')?.focus()
    }
  }, [enfocarError])

  useEffect(() => {
    if (!abierto || paso !== 'dia' || opcion === null || cliente === null) return
    let vivo = true
    void cliente.dias(opcion).then((lista) => {
      if (!vivo) return
      setDias(
        lista === null
          ? { estado: 'error', para: opcion }
          : { estado: 'listo', para: opcion, datos: lista },
      )
      // Un día elegido antes que ya no está disponible deja de estar elegido.
      const elegido = actual.current.fecha
      if (
        lista &&
        elegido &&
        !lista.some((d) => d.fecha === elegido && d.estado === 'disponible')
      ) {
        despachar({ tipo: 'opcion', id: opcion })
      }
    })
    return () => {
      vivo = false
    }
  }, [abierto, paso, opcion, cliente, recarga, despachar])

  useEffect(() => {
    if (!abierto || paso !== 'hora' || opcion === null || fecha === null || cliente === null) return
    let vivo = true
    const para = `${opcion} ${fecha}`
    void cliente.horas(opcion, fecha).then((lista) => {
      if (!vivo) return
      setHoras(lista === null ? { estado: 'error', para } : { estado: 'listo', para, datos: lista })
      // Una hora elegida antes que ya no se ofrece deja de estar elegida.
      const elegida = actual.current.hueco
      if (lista && elegida && !lista.some((h) => h.inicio === elegida.inicio)) {
        despachar({ tipo: 'dia', fecha })
      }
    })
    return () => {
      vivo = false
    }
  }, [abierto, paso, opcion, fecha, cliente, recarga, despachar])

  // Decisión 3: el script de Turnstile se pide al llegar a «Tus datos», no antes.
  useEffect(() => {
    if (abierto && paso === 'datos') cargarTurnstile().catch(() => setTurnstileFallo(true))
  }, [abierto, paso])

  const alToken = useCallback((t: string | null) => {
    setToken(t)
    if (t !== null) setTurnstileFallo(false)
  }, [])
  const alFallarTurnstile = useCallback(() => setTurnstileFallo(true), [])

  if (!montado || config === null || cliente === null) return null

  // Con una reserva en vuelo no se cierra: la clienta debe ver si quedó confirmada (× y Escape).
  const cerrar = () => {
    if (!actual.current.enviando) setAbierto(false)
  }
  const alCancelar = (evento: SyntheticEvent) => {
    if (actual.current.enviando) evento.preventDefault()
  }
  const alCerrar = () => {
    setAbierto(false)
    abridor.current?.focus()
  }

  const confirmar = () => {
    const antes = actual.current
    const enviando = despachar({ tipo: 'enviar', claveNueva: crearClave() })
    const peticion = enviando === antes ? null : peticionDe(enviando, token ?? '')
    if (peticion === null) return
    void cliente.reservar(peticion).then((resultado) => {
      // Una respuesta de una reserva que ya no está en curso (se reabrió el modal) se descarta.
      if (!actual.current.enviando || actual.current.clave !== peticion.clave) return
      const siguiente = despachar({ tipo: 'respuesta', resultado })
      if (siguiente.paso === 'datos') setEnfocarError((n) => n + 1)
      if (resultado.tipo !== 'confirmada') {
        // El token es de un solo uso: «Reintentar» pide uno nuevo y conserva la clave.
        setToken(null)
        setWidget((n) => n + 1)
      }
    })
  }

  const revisar = (evento: FormEvent) => {
    evento.preventDefault()
    if (despachar({ tipo: 'revisar' }).paso === 'datos') setEnfocarError((n) => n + 1)
  }

  const numero = numeroDePaso(paso)
  const vista = vistaServicio(estado)
  const resumen = resumenDe(estado)
  const cargaDias = cargaDe(dias, String(opcion))
  const cargaHoras = cargaDe(horas, `${opcion} ${fecha}`)

  const avisoCarga = (que: 'dias' | 'horas') => (
    <div className={estilos.aviso} role="alert">
      <p>{mensajeDeCarga(que)}</p>
      <div className={estilos.acciones}>
        <button
          type="button"
          className={estilos.principal}
          onClick={() => setRecarga((n) => n + 1)}
        >
          Reintentar
        </button>
        <Llamar />
      </div>
    </div>
  )

  return (
    <dialog
      ref={dialogo}
      className={estilos.dialogo}
      aria-labelledby="reserva-citas-titulo"
      onClose={alCerrar}
      onCancel={alCancelar}
      data-paso={paso}
    >
      <div className={estilos.cabeza}>
        <h2 id="reserva-citas-titulo" ref={titulo} tabIndex={-1} className={estilos.titulo}>
          Reserva tu cita
        </h2>
        <button
          type="button"
          className={estilos.cerrar}
          aria-label="Cerrar"
          disabled={estado.enviando}
          onClick={cerrar}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      {numero !== null && <p className={estilos.paso}>Paso {numero} de 4</p>}

      {paso === 'servicio' && (
        <section aria-labelledby="reserva-citas-paso" className={estilos.cuerpo}>
          <h3 id="reserva-citas-paso" tabIndex={-1} className={estilos.subtitulo}>
            Servicio
          </h3>
          <ul className={estilos.opciones} aria-label="Categorías">
            {vista.categorias.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={estilos.opcion}
                  aria-pressed={estado.categoria === c.id}
                  onClick={() => despachar({ tipo: 'categoria', id: c.id })}
                >
                  {c.nombre}
                </button>
              </li>
            ))}
          </ul>
          {vista.categoria && (
            <ul className={estilos.opciones} aria-label="Servicios">
              {vista.categoria.subservicios.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={estilos.opcion}
                    aria-pressed={estado.subservicio === s.id}
                    onClick={() => despachar({ tipo: 'subservicio', id: s.id })}
                  >
                    {s.nombre}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {vista.subservicio && (
            <>
              <p className={estilos.pregunta}>{vista.subservicio.pregunta}</p>
              <ul className={estilos.opciones} aria-label="Opciones">
                {vista.subservicio.opciones.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      className={estilos.opcion}
                      aria-pressed={estado.opcion === o.id}
                      onClick={() => despachar({ tipo: 'opcion', id: o.id })}
                    >
                      {etiquetaOpcion(o)}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {CATALOGO_PROVISIONAL && (
            <p className={estilos.nota}>
              Precios y duraciones orientativos, pendientes de confirmar con el salón
            </p>
          )}
        </section>
      )}

      {paso === 'dia' && (
        <section aria-labelledby="reserva-citas-paso" className={estilos.cuerpo}>
          <h3 id="reserva-citas-paso" tabIndex={-1} className={estilos.subtitulo}>
            Día
          </h3>
          {cargaDias.estado === 'cargando' && <p role="status">Cargando los días…</p>}
          {cargaDias.estado === 'error' && avisoCarga('dias')}
          {cargaDias.estado === 'listo' && cargaDias.datos.length === 0 && (
            <div className={estilos.aviso} role="alert">
              <p>No quedan días libres. Llámanos al {TELEFONO.legible}, por favor.</p>
              <Llamar />
            </div>
          )}
          {cargaDias.estado === 'listo' && (
            <ul className={estilos.dias} aria-label="Días">
              {cargaDias.datos.map((d) => {
                const { semana, dia, mes } = diaCorto(d.fecha)
                return (
                  <li key={d.fecha}>
                    <button
                      type="button"
                      className={estilos.dia}
                      aria-pressed={estado.fecha === d.fecha}
                      disabled={d.estado !== 'disponible'}
                      data-fecha={d.fecha}
                      onClick={() => despachar({ tipo: 'dia', fecha: d.fecha })}
                    >
                      <span>{semana}</span> <strong>{dia}</strong> <span>{mes}</span>
                      {d.estado === 'cerrado' && (
                        <span className={estilos.estadoDia}> Cerrado</span>
                      )}
                      {d.estado === 'completo' && (
                        <span className={estilos.estadoDia}> Completo</span>
                      )}
                      {estado.fecha === d.fecha && (
                        <span className={estilos.marca} aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      {paso === 'hora' && (
        <section aria-labelledby="reserva-citas-paso" className={estilos.cuerpo}>
          <h3 id="reserva-citas-paso" tabIndex={-1} className={estilos.subtitulo}>
            Hora
          </h3>
          {estado.aviso && (
            <p className={estilos.aviso} role="alert">
              {estado.aviso}
            </p>
          )}
          {cargaHoras.estado === 'cargando' && <p role="status">Cargando las horas…</p>}
          {cargaHoras.estado === 'error' && avisoCarga('horas')}
          {cargaHoras.estado === 'listo' && cargaHoras.datos.length === 0 && (
            <p className={estilos.aviso} role="alert">
              No quedan horas libres este día. Elige otro, por favor.
            </p>
          )}
          {cargaHoras.estado === 'listo' && (
            <ul className={estilos.horas} aria-label="Horas">
              {cargaHoras.datos.map((h) => (
                <li key={h.inicio}>
                  <button
                    type="button"
                    className={estilos.opcion}
                    aria-pressed={estado.hueco?.inicio === h.inicio}
                    onClick={() => despachar({ tipo: 'hora', hueco: h })}
                  >
                    {h.hora}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {paso === 'datos' && (
        <form
          className={estilos.cuerpo}
          noValidate
          onSubmit={revisar}
          aria-labelledby="reserva-citas-paso"
        >
          <h3 id="reserva-citas-paso" tabIndex={-1} className={estilos.subtitulo}>
            Tus datos
          </h3>
          {CAMPOS.map(({ campo, etiqueta, tipo, auto, max }) => {
            const error = estado.errores[campo]
            return (
              <div key={campo} className={estilos.campo}>
                <label htmlFor={`reserva-citas-${campo}`}>{etiqueta}</label>
                <input
                  id={`reserva-citas-${campo}`}
                  type={tipo}
                  autoComplete={auto}
                  maxLength={max}
                  required
                  value={estado.datos[campo]}
                  aria-invalid={error !== undefined}
                  aria-describedby={error ? `reserva-citas-${campo}-error` : undefined}
                  onChange={(e) => despachar({ tipo: 'escribir', campo, valor: e.target.value })}
                />
                {error && (
                  <p id={`reserva-citas-${campo}-error`} className={estilos.error}>
                    {error}
                  </p>
                )}
              </div>
            )
          })}
          <p className={estilos.nota}>
            Responsable: {NOMBRE}. Finalidad: gestionar tu cita y enviarte la confirmación.
            Derechos: acceso, rectificación y supresión llamando al {TELEFONO.legible}. Más
            información en la política de privacidad.
          </p>
          <div className={estilos.acciones}>
            <button
              type="button"
              className={estilos.secundario}
              onClick={() => despachar({ tipo: 'atras' })}
            >
              Atrás
            </button>
            <button type="submit" className={estilos.principal}>
              Revisar la cita
            </button>
          </div>
        </form>
      )}

      {(paso === 'resumen' || paso === 'confirmada') && resumen && (
        <section aria-labelledby="reserva-citas-paso" className={estilos.cuerpo}>
          <h3 id="reserva-citas-paso" tabIndex={-1} className={estilos.subtitulo}>
            {paso === 'confirmada' ? '¡Cita confirmada!' : 'Revisa tu cita'}
          </h3>
          <dl className={estilos.resumen}>
            <dt>Servicio</dt>
            <dd>{resumen.servicio}</dd>
            <dt>Día</dt>
            <dd>{resumen.dia}</dd>
            <dt>Hora</dt>
            <dd>
              {resumen.inicio} – {resumen.fin}
            </dd>
            <dt>Duración</dt>
            <dd>{resumen.duracion}</dd>
            <dt>Precio</dt>
            <dd>{resumen.precio}</dd>
          </dl>
          {paso === 'confirmada' ? (
            <p role="status">
              Te hemos enviado un email de confirmación a {estado.datos.email}. Para cancelarla o
              cambiarla, llámanos al {TELEFONO.legible}.
            </p>
          ) : (
            <>
              <ReservaCitasTurnstile
                key={widget}
                sitekey={config.sitekey}
                alToken={alToken}
                alFallar={alFallarTurnstile}
              />
              {(estado.aviso || turnstileFallo) && (
                <p className={estilos.aviso} role="alert">
                  {estado.aviso ?? mensajeDeError()}
                </p>
              )}
              <p role="status" className={estilos.nota}>
                {estado.enviando
                  ? 'Enviando tu reserva…'
                  : token === null && !turnstileFallo
                    ? 'Comprobando que no eres un robot…'
                    : ''}
              </p>
              <div className={estilos.acciones}>
                <button
                  type="button"
                  className={estilos.secundario}
                  disabled={estado.enviando}
                  onClick={() => despachar({ tipo: 'atras' })}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  className={estilos.principal}
                  disabled={token === null}
                  aria-busy={estado.enviando}
                  onClick={confirmar}
                >
                  {estado.fallo ? 'Reintentar' : 'Confirmar cita'}
                </button>
                {(estado.fallo === 'error' || turnstileFallo) && <Llamar />}
              </div>
            </>
          )}
        </section>
      )}

      {(paso === 'servicio' || paso === 'dia' || paso === 'hora') && (
        <div className={estilos.acciones}>
          {paso !== 'servicio' && (
            <button
              type="button"
              className={estilos.secundario}
              onClick={() => despachar({ tipo: 'atras' })}
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            className={estilos.principal}
            disabled={!puedeContinuar(estado)}
            onClick={() => despachar({ tipo: 'continuar' })}
          >
            Continuar
          </button>
        </div>
      )}
    </dialog>
  )
}
