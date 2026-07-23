import { useEffect, useState } from 'react'

import { EQUIPO_DEMO, LEYENDA_EQUIPO, type ProfesionalDemo } from '../lib/demo/equipo-demo'
import { type DiaOfrecido, diasOfrecidos, franjasDe, indiceCircular } from './equipo-logica'
import estilos from './equipo.module.scss'

/**
 * La sección de equipo (capa visual del DEMO, interactiva). Sección navegable `#equipo-titulo`.
 * Contrato: features/equipo_reservas.feature.
 *
 * UNA sola `<section>` con siete `<article>` (las tarjetas NO son `<section>`: eso las volvería
 * navegables y mataría el build por las puertas de cascarón/anclas). Cada tarjeta tiene su PROPIO
 * estado (día, propuesta, reserva, reseña): siete estados independientes.
 *
 * 🔴 Los días se calculan en `useEffect` (cliente), NO en el render del módulo: bajo SSG, calcularlos
 * en build-time hornearía fechas caducas (el HTML horneado nace con «Cargando días…»). El núcleo
 * mutable vive en cuatro funciones PURAS de `./equipo-logica` —`diasOfrecidos`, `franjasOfrecibles`,
 * `franjasDe`, `indiceCircular`— que el componente solo CABLEA; así Stryker puede morderlas por valor.
 *
 * 🔴 La cita elegida (`propuesta`) y la confirmada (`reserva`) se modelan como VALORES `{ dia, hora }`,
 * no como banderas sueltas: no hay guarda redundante `reservado && día && hora` (cuyas cotas son
 * mutantes EQUIVALENTES por invariante), sino un ÚNICO `reserva !== null`. El estado de selección va
 * SIEMPRE en `aria-pressed`, nunca en un `className` condicional (inmatable bajo `css:false`): la
 * franja elegida se colorea desde `[aria-pressed='true']` en el SCSS, misma fuente que el árbol a11y.
 */
const ID_EQUIPO = 'equipo-titulo'

const RESERVA_ROTULO = 'Reserva tu cita'
const CARGANDO_DIAS = 'Cargando días…'
const BOTON_INCOMPLETO = 'Elige día y hora'
const SUBTEXTO_CONFIRMA = 'Te confirmaremos por WhatsApp.'
const ESTRELLAS_TEXTO = '5 de 5 estrellas'

// Las 800×600 REALES de las fotos de `src/assets/trabajos/` (banco de imágenes, @s26-@s31): reservar
// el espacio evita el salto de layout (CLS) antes de que la imagen cargue.
const ANCHO_FOTO = 800
const ALTO_FOTO = 600

/** Una cita como VALOR: el día ofrecido y su franja. Es la propuesta antes de confirmar y la reserva
 *  después; modelarla como objeto (no como banderas coordinadas) elimina la guarda redundante. */
interface Cita {
  readonly dia: DiaOfrecido
  readonly hora: string
}

interface TarjetaProps {
  readonly profesional: ProfesionalDemo
  readonly dias: readonly DiaOfrecido[]
}

function TarjetaProfesional({ profesional, dias }: TarjetaProps) {
  const [diaIdx, setDiaIdx] = useState<number | null>(null)
  const [propuesta, setPropuesta] = useState<Cita | null>(null)
  const [reserva, setReserva] = useState<Cita | null>(null)
  const [resenaIdx, setResenaIdx] = useState(0)

  // 🔴 Sin `const franjas = diaSel === null ? [] : …`: el brazo `[]` de aquel ternario era DATO
  // MUERTO (el valor solo se consumía bajo la guarda `diaSel !== null` del JSX, donde siempre es
  // `franjasDe(...)`) y su mutante ArrayDeclaration era EQUIVALENTE por construcción (deuda de
  // mutación 2026-07-23). Mismo remedio que la fila muerta del domingo en GRUPOS_SCHEMA de F-10:
  // se borra el dato inerte en verde y las franjas se piden DONDE se renderizan.
  const diaSel = diaIdx === null ? null : dias[diaIdx]
  const etiquetaBoton =
    propuesta === null
      ? BOTON_INCOMPLETO
      : `Reservar · ${propuesta.dia.dow} ${propuesta.dia.day} · ${propuesta.hora}`

  const elegirDia = (indice: number) => {
    setDiaIdx(indice)
    setPropuesta(null)
  }

  const reiniciar = () => {
    setDiaIdx(null)
    setPropuesta(null)
    setReserva(null)
  }

  const resena = profesional.resenas[indiceCircular(resenaIdx, profesional.resenas.length)]

  return (
    <article className={estilos.tarjeta}>
      <div className={estilos.foto}>
        <img
          src={profesional.foto}
          alt={profesional.alt}
          width={ANCHO_FOTO}
          height={ALTO_FOTO}
          loading="lazy"
        />
      </div>
      <div className={estilos.cuerpo}>
        <div className={estilos.filaNombre}>
          <h3 className={estilos.nombre}>{profesional.nombre}</h3>
          <span className={estilos.rol}>{profesional.rol}</span>
        </div>

        <ul className={estilos.especialidades}>
          {profesional.especialidades.map((especialidad) => (
            <li key={especialidad} className={estilos.chipEspecialidad}>
              {especialidad}
            </li>
          ))}
        </ul>

        {reserva !== null ? (
          <div className={estilos.confirmacion}>
            <div className={estilos.circulo} aria-hidden="true">
              ✓
            </div>
            <p
              className={estilos.mensaje}
            >{`Cita con ${profesional.nombre} el ${reserva.dia.dow} ${reserva.dia.day} a las ${reserva.hora}`}</p>
            <p className={estilos.subtexto}>{SUBTEXTO_CONFIRMA}</p>
            <button type="button" className={estilos.cambiar} onClick={reiniciar}>
              Cambiar
            </button>
          </div>
        ) : (
          <div className={estilos.reserva}>
            <span className={estilos.pasoTitulo}>{RESERVA_ROTULO}</span>
            <div className={estilos.dias}>
              {dias.length === 0 && <span className={estilos.cargando}>{CARGANDO_DIAS}</span>}
              {dias.map((dia, indice) => (
                <button
                  key={dia.day}
                  type="button"
                  className={estilos.dia}
                  aria-pressed={indice === diaIdx}
                  aria-label={`${dia.dow} ${dia.day}`}
                  onClick={() => elegirDia(indice)}
                >
                  <span className={estilos.diaDow}>{dia.dow}</span>
                  <span className={estilos.diaNum}>{dia.day}</span>
                </button>
              ))}
            </div>

            {diaSel !== null && (
              <div className={estilos.horas}>
                {franjasDe(diaSel.diaSemana).map((franja) => (
                  <button
                    key={franja}
                    type="button"
                    className={estilos.horaOpcion}
                    aria-pressed={franja === propuesta?.hora}
                    onClick={() => setPropuesta({ dia: diaSel, hora: franja })}
                  >
                    {franja}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              className={estilos.reservar}
              disabled={propuesta === null}
              onClick={() => setReserva(propuesta)}
            >
              {etiquetaBoton}
            </button>
          </div>
        )}

        <figure className={estilos.resena}>
          <div className={estilos.estrellas} role="img" aria-label={ESTRELLAS_TEXTO}>
            <span aria-hidden="true">★★★★★</span>
          </div>
          <blockquote className={estilos.resenaTexto}>{`“${resena.texto}”`}</blockquote>
          <figcaption className={estilos.resenaPie}>
            <span className={estilos.autora}>{resena.autora}</span>
            <div className={estilos.flechas}>
              <button
                type="button"
                className={estilos.flecha}
                aria-label={`Reseña anterior de ${profesional.nombre}`}
                onClick={() => setResenaIdx(resenaIdx - 1)}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                className={estilos.flecha}
                aria-label={`Reseña siguiente de ${profesional.nombre}`}
                onClick={() => setResenaIdx(resenaIdx + 1)}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </figcaption>
        </figure>
      </div>
    </article>
  )
}

export function Equipo() {
  const [dias, setDias] = useState<readonly DiaOfrecido[]>([])

  // MUTANTE EQUIVALENTE (ArrayDeclaration, deps → ['Stryker was here']), verificado a mano
  // (progress/mutation_equipo_fotos.md): las dependencias de `useEffect` se comparan elemento a
  // elemento con `Object.is`, nunca por referencia del array. Un literal CONSTANTE en las deps
  // (aquí, o la cadena mutada) es el MISMO valor primitivo en cada render, así que React nunca
  // detecta un cambio y el efecto se ejecuta EXACTAMENTE una vez al montar en ambos casos: con
  // `[]` y con `['Stryker was here']`. `Equipo` no tiene props (no se puede forzar una key/prop
  // distinta desde el test) y un remount SIEMPRE re-ejecuta el efecto sea cual sea el array, así
  // que ningún test observable en este stack distingue las dos ramas. Comprobado a mano: con el
  // mutante aplicado, la suite completa de equipo (75 tests) sigue en VERDE.
  useEffect(
    () => {
      setDias(diasOfrecidos(new Date()))
    },
    // Stryker disable next-line all
    [],
  )

  return (
    <section
      className={`demo-seccion demo-seccion--plain ${estilos.equipo}`}
      aria-labelledby={ID_EQUIPO}
    >
      <div className="demo-contenedor">
        <div className="demo-encabezado demo-encabezado--centro">
          <p className="demo-eyebrow">Equipo</p>
          <h2 id={ID_EQUIPO} className="demo-titulo">
            Nuestro equipo de profesionales
          </h2>
          <p className="demo-intro">
            Elige a tu especialista, mira sus reseñas y reserva tu día y hora en segundos.
          </p>
        </div>

        <div className={estilos.rejilla}>
          {EQUIPO_DEMO.map((profesional) => (
            <TarjetaProfesional key={profesional.nombre} profesional={profesional} dias={dias} />
          ))}
        </div>

        <p className={estilos.leyenda}>{LEYENDA_EQUIPO}</p>
      </div>
    </section>
  )
}
