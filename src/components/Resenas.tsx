import {
  type CSSProperties,
  type PointerEvent as EventoDePuntero,
  useEffect,
  useRef,
  useState,
} from 'react'

import { LEYENDA_RESENAS, TESTIMONIOS_DEMO } from '../lib/demo/resenas-demo'
import { AGREGADO_DE_RESENAS } from '../lib/resenas-agregado'
import {
  atiendeLaCandidata,
  CANDIDATA_RESENAS,
  distanciaAlCentroDe,
  enfocarCandidata,
  esCampoDeEscritura,
  medirCandidata,
  MILISEGUNDOS_POR_FOTO,
  pasoDeTecla,
  PROPORCION_VISIBLE_MINIMA,
  registrarCandidata,
  retirarCandidata,
} from './carrusel-logica'
import {
  capaDe,
  claveDeRotacion,
  claveDistancia,
  debeRotar,
  distanciaCircular,
  etiquetaDeDiapositiva,
  etiquetaDeRotacion,
  indiceCircular,
  pasosDelArrastre,
  signoDe,
  UMBRAL_DE_ARRASTRE,
  vozDeLaPista,
} from './galeria-logica'
import {
  estrellasDe,
  etiquetaDelPuntoDeTestimonio,
  fechaVisible,
  notaEnTexto,
  totalConMillar,
} from './resenas-logica'
import estilos from './resenas.module.scss'

/**
 * La sección de reseñas (F-14, capa visual del DEMO). Bloque NO navegable (`<div>`): convertirlo
 * en `<section aria-labelledby>` rompería DOS puertas del build (pasaría a «sección navegable» y
 * la nav no la enlaza). Contrato: `features/resenas_agregado_enlace.feature`; la conducta del
 * carrusel se hereda POR REFERENCIA de `features/galeria_carrusel.feature` v3, leyendo «foto»
 * como «testimonio»: MISMO árbol APG, MISMA aritmética circular (importada de `galeria-logica.ts`,
 * jamás duplicada) y los ids y etiquetas PROPIOS que fija @s8.
 *
 * Las tarjetas son de TEXTO (@s9): cita + autora + servicio + estrellas decorativas con la nota
 * accesible en texto. El puente con el SCSS es el mismo de la galería: `data-distancia` (la
 * clave, por valor absoluto) + `--s` (el lado) + `z-index` inline.
 */
const ID_TITULO = 'resenas-titulo'
const ID_PISTA = 'resenas-pista'

const TOTAL = TESTIMONIOS_DEMO.length

/** Las flechas y el autoplay mueven UN testimonio cada vez. */
const PASO_DE_FLECHA = 1

/** El nombre accesible del grupo de puntos indicadores (APG), propio de este carrusel. */
const NOMBRE_DE_LOS_PUNTOS = 'Elegir el testimonio que se muestra'

const CONSULTA_MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)'

export function Resenas() {
  const [activo, setActivo] = useState(0)
  // La pausa EXPLÍCITA: el botón «Parar», o el arranque bajo `prefers-reduced-motion`.
  const [pausado, setPausado] = useState(false)
  const [raton, setRaton] = useState(false)
  // El foco NO se limpia al salir: entrar para la rotación y solo el botón la devuelve.
  const [foco, setFoco] = useState(false)
  // MUTANTE EQUIVALENTE (BooleanLiteral false→true) POR LA MISMA CONSTRUCCIÓN verificada en
  // progress/mutation_galeria_carrusel.md (Galeria.tsx 86:62): su único lector es `debeRotar` y
  // `entra()` cancela el arranque EN EL MISMO lote — ningún render alcanzable distingue los dos
  // valores iniciales (precedente HOST_WHATSAPP, site.ts:72-73).
  // Stryker disable next-line all
  const [arranqueExplicito, setArranqueExplicito] = useState(false)
  // [@s20 heredado] La GENERACIÓN del reloj: cada acción manual crea un token NUEVO (identidad,
  // no aritmética). El efecto del intervalo la lleva en sus deps: acción → efecto nuevo → el
  // intervalo cuenta 2 s DESDE la acción, no desde el arranque.
  const [generacionDelReloj, setGeneracionDelReloj] = useState({})
  // [@s19 heredado] El MARCO es el dueño del gesto: dónde bajó el puntero y cuántos pasos pidió
  // el último arrastre. Refs y no estado: son memoria del gesto, no pintan nada.
  const bajadaDelPuntero = useRef(0)
  const pasosDelUltimoGesto = useRef(0)
  // [@s23 heredado] La sección que observa el IntersectionObserver. El estado del teclado global
  // (foco dentro, proporción visible y distancia al centro MEDIDAS) vive en el registro
  // COMPARTIDO de `carrusel-logica.ts`: la decisión es UNA para los DOS carruseles (@s22 + @s8).
  const raiz = useRef<HTMLDivElement | null>(null)

  const rotando = debeRotar({ pausadoPorElUsuario: pausado, raton, foco, arranqueExplicito })

  useEffect(
    () => {
      // (T) APG: bajo `prefers-reduced-motion` la rotación arranca PAUSADA, sin retirar la
      // función. Leída dentro del efecto (nunca en el render) y GUARDADA por un motivo MEDIDO:
      // jsdom 25 no implementa `matchMedia` (precedente Galeria.tsx / reserva.test.tsx).
      if (typeof window.matchMedia !== 'function') {
        return
      }

      const preferencia = window.matchMedia(CONSULTA_MOVIMIENTO_REDUCIDO)

      if (preferencia.matches) {
        setPausado(true)
      }

      // [@s12 heredado] La preferencia se ESCUCHA en caliente: activarla pausa la rotación EN
      // CURSO; desactivarla NO toca nada — reanudar sigue siendo decisión del usuario.
      const alCambiarLaPreferencia = (cambio: MediaQueryListEvent) => {
        if (cambio.matches) {
          setPausado(true)
        }
      }

      preferencia.addEventListener('change', alCambiarLaPreferencia)

      return () => {
        preferencia.removeEventListener('change', alCambiarLaPreferencia)
      }
    },
    // MUTANTE EQUIVALENTE (ArrayDeclaration sobre deps CONSTANTES de un efecto solo-montaje),
    // verificado en progress/mutation_galeria_carrusel.md (124:6, precedente Equipo.tsx:210).
    // Stryker disable next-line all
    [],
  )

  useEffect(() => {
    if (!rotando) {
      return
    }

    // ⚠️ `setInterval` NO devuelve `number` con `@types/node` cargado: el identificador se queda
    // en una constante local y lo limpia el propio efecto.
    const reloj = setInterval(() => {
      setActivo((anterior) => indiceCircular(anterior + PASO_DE_FLECHA, TOTAL))
    }, MILISEGUNDOS_POR_FOTO)

    return () => {
      clearInterval(reloj)
    }
  }, [rotando, generacionDelReloj])

  /**
   * [@s20 heredado] Toda acción MANUAL pasa por aquí: reinicia el intervalo, así el siguiente
   * avance automático llega 2 s después de la acción. En PAUSA no arranca nada: el efecto del
   * intervalo sigue sin correr mientras `rotando` sea false.
   */
  const reiniciarElReloj = () => {
    setGeneracionDelReloj({})
  }

  useEffect(
    () => {
      // [@s23 heredado] El teclado global. La DECISIÓN es pura y COMPARTIDA con la galería (el
      // registro de candidatas de `carrusel-logica.ts`, @s21/@s22): aquí solo el cableado — alta
      // en el registro, listener sobre el documento, medidas del observador y limpieza. La línea
      // roja: `preventDefault()` SOLO cuando el árbitro compartido dice que atiende ESTE
      // carrusel — una tecla, UN carrusel, aunque haya dos listeners.
      registrarCandidata(CANDIDATA_RESENAS)

      const alPulsarLaTecla = (evento: KeyboardEvent) => {
        const enfocado = document.activeElement
        const pasos = pasoDeTecla({
          tecla: evento.key,
          ctrl: evento.ctrlKey,
          alt: evento.altKey,
          meta: evento.metaKey,
          campoDeTextoActivo:
            enfocado instanceof HTMLElement &&
            esCampoDeEscritura(enfocado.tagName, enfocado.isContentEditable),
        })

        if (pasos === 0) {
          return
        }

        if (!atiendeLaCandidata(CANDIDATA_RESENAS)) {
          return
        }

        evento.preventDefault()
        // El MISMO camino manual que `desplazar` (mover + reiniciar el reloj), escrito sobre los
        // setters ESTABLES de React: este efecto es solo-montaje (precedente Galeria.tsx).
        setActivo((anterior) => indiceCircular(anterior + pasos, TOTAL))
        setGeneracionDelReloj({})
      }

      document.addEventListener('keydown', alPulsarLaTecla)

      // El observador va GUARDADO por un motivo MEDIDO: jsdom 25 no implementa
      // IntersectionObserver (brief v3 §7). El umbral es EL MISMO de la decisión pura, y la
      // candidata se actualiza con la medida REAL de cada entrada: proporción visible y distancia
      // del centro de `boundingClientRect` al centro de `rootBounds` — nada de ceros fijos.
      const observarLaSeccion = (seccion: Element) => {
        const observador = new IntersectionObserver(
          (entradas) => {
            for (const entrada of entradas) {
              medirCandidata(
                CANDIDATA_RESENAS,
                entrada.intersectionRatio,
                distanciaAlCentroDe(entrada.boundingClientRect, entrada.rootBounds),
              )
            }
          },
          { threshold: [PROPORCION_VISIBLE_MINIMA] },
        )

        observador.observe(seccion)

        return observador
      }

      const observador =
        // MUTANTE EQUIVALENTE (ConditionalExpression sobre el operando `raiz.current`),
        // VERIFICADO en progress/mutation_lote_v3_resenas.md (220:9, el espejo exacto de
        // Galeria.tsx 257:9) y RATIFICADO por el lead: `ref={raiz}` va INCONDICIONAL en el <div>
        // raíz y React fija los refs de host ANTES de los efectos pasivos — defensa inalcanzable
        // (misma familia que Reserva.tsx:61, tdd_deuda_mutacion_full.md mutante #4).
        // Stryker disable next-line all
        raiz.current !== null && typeof IntersectionObserver === 'function'
          ? observarLaSeccion(raiz.current)
          : null

      return () => {
        document.removeEventListener('keydown', alPulsarLaTecla)
        observador?.disconnect()
        retirarCandidata(CANDIDATA_RESENAS)
      }
    },
    // MUTANTE EQUIVALENTE (ArrayDeclaration sobre deps CONSTANTES de un efecto solo-montaje),
    // verificado en progress/mutation_galeria_carrusel.md (124:6, precedente Equipo.tsx:210).
    // Stryker disable next-line all
    [],
  )

  /** Mueve el testimonio centrado `pasos` posiciones, con envoltura por los DOS extremos. MANUAL. */
  const desplazar = (pasos: number) => {
    setActivo((anterior) => indiceCircular(anterior + pasos, TOTAL))
    reiniciarElReloj()
  }

  /**
   * El botón de rotación. Parar es DEFINITIVO (SC 2.2.2); arrancar ignora el ratón encima y el
   * foco dentro (APG). La etiqueta y el `data-estado` siguen a la VOLUNTAD del usuario.
   */
  const alternarRotacion = () => {
    setPausado(!pausado)
    setArranqueExplicito(pausado)
  }

  /** Un ratón o un foco NUEVOS cancelan el arranque explícito y vuelven a mandar ellos. */
  const entra = (poner: (dentro: boolean) => void) => {
    poner(true)
    setArranqueExplicito(false)
  }

  /** [@s19 heredado] El gesto empieza: se guarda dónde bajó el puntero sobre el marco. */
  const alBajarElPuntero = (evento: EventoDePuntero) => {
    bajadaDelPuntero.current = evento.clientX
  }

  /**
   * [@s19 heredado] El gesto acaba: la DECISIÓN es de `pasosDelArrastre` (pura, umbral INCLUSIVO
   * de 48 px). Cada arrastre cuenta UN solo testimonio, por lejos que llegue el dedo.
   */
  const alSubirElPuntero = (evento: EventoDePuntero) => {
    const pasos = pasosDelArrastre(evento.clientX - bajadaDelPuntero.current, UMBRAL_DE_ARRASTRE)

    pasosDelUltimoGesto.current = pasos
    desplazar(pasos)
  }

  /** [@s17 + @s18 + @s20 heredados] Centra el testimonio pedido por una acción MANUAL. */
  const mostrarTestimonio = (indice: number) => {
    setActivo(indice)
    reiniciarElReloj()
  }

  /**
   * [@s18 + @s19 heredados] El clic de centrar de la tarjeta solo actúa si el desplazamiento del
   * gesto quedó BAJO el umbral: el click que el navegador sintetiza tras un arrastre real NO anula
   * el gesto.
   */
  const elegirTestimonio = (indice: number) => {
    if (pasosDelUltimoGesto.current === 0) {
      mostrarTestimonio(indice)
    }
  }

  return (
    <div ref={raiz} className={`demo-seccion ${estilos.resenas}`}>
      <div className="demo-contenedor">
        <div className="demo-encabezado">
          <p className="demo-eyebrow">Reseñas</p>
          <h2 id={ID_TITULO} className="demo-titulo">
            Lo que dicen nuestras clientas
          </h2>
        </div>
        {/* [@s2] El agregado REAL en UNA línea discreta — nunca un banner. Sus tres obligaciones
            (art. 20.4 TRLGDCU, brief v3 §2): plataforma declarada + enlace a la fuente + fecha del
            dato. TODO se deriva del módulo de @s3 EN el render: ni una segunda copia en el JSX. */}
        <p className={estilos.agregado}>
          <span aria-hidden="true">{estrellasDe(AGREGADO_DE_RESENAS.nota)}</span>{' '}
          <span>{notaEnTexto(AGREGADO_DE_RESENAS.nota)}</span> ·{' '}
          {totalConMillar(AGREGADO_DE_RESENAS.total)} opiniones en{' '}
          <a href={AGREGADO_DE_RESENAS.url} target="_blank" rel="noopener noreferrer">
            {AGREGADO_DE_RESENAS.plataforma}
          </a>{' '}
          · dato del {fechaVisible(AGREGADO_DE_RESENAS.fechaDelDato)}
        </p>
        <div
          className={estilos.carrusel}
          role="group"
          aria-roledescription="carrusel"
          aria-labelledby={ID_TITULO}
          onMouseEnter={() => entra(setRaton)}
          onMouseLeave={() => setRaton(false)}
          onFocus={() => {
            entra(setFoco)
            // [@s23 heredado] El foco dentro ASIGNA el teclado a esta candidata en el registro
            // compartido y EXCLUYE a la otra (@s22).
            enfocarCandidata(CANDIDATA_RESENAS, true)
          }}
          onBlur={() => {
            // [@s23 heredado] Al salir el foco deja de atender; la PAUSA de `foco` sí es pegajosa.
            enfocarCandidata(CANDIDATA_RESENAS, false)
          }}
        >
          {/* [@s24 heredado] Los mandos de cristal: hijos directos del carrusel, flotando sobre
              el marco por SCSS. El chip va PRIMERO en el DOM (tab-order del APG). */}
          <button
            type="button"
            className={estilos.rotacion}
            aria-label={etiquetaDeRotacion(!pausado)}
            data-estado={claveDeRotacion(!pausado)}
            onClick={alternarRotacion}
          >
            {pausado ? '▶' : '❙❙'}
          </button>
          <button
            type="button"
            className={estilos.flechaAnterior}
            aria-label="Anterior"
            aria-controls={ID_PISTA}
            onClick={() => desplazar(-PASO_DE_FLECHA)}
          >
            ←
          </button>
          <button
            type="button"
            className={estilos.flechaSiguiente}
            aria-label="Siguiente"
            aria-controls={ID_PISTA}
            onClick={() => desplazar(PASO_DE_FLECHA)}
          >
            →
          </button>
          <div
            className={estilos.marco}
            onPointerDown={alBajarElPuntero}
            onPointerUp={alSubirElPuntero}
          >
            <div
              className={estilos.escenario}
              id={ID_PISTA}
              aria-live={vozDeLaPista(rotando, foco)}
              aria-atomic="false"
            >
              {TESTIMONIOS_DEMO.map((testimonio, indice) => {
                const distancia = distanciaCircular(indice, activo, TOTAL)

                return (
                  <div
                    key={testimonio.autora}
                    className={estilos.tarjeta}
                    role="group"
                    aria-roledescription="diapositiva"
                    aria-label={etiquetaDeDiapositiva(indice, TOTAL)}
                    data-distancia={claveDistancia(distancia)}
                    onClick={() => elegirTestimonio(indice)}
                    style={
                      {
                        '--s': signoDe(distancia),
                        zIndex: capaDe(distancia, TOTAL),
                      } as CSSProperties
                    }
                  >
                    <div className={estilos.lamina}>
                      <p className={estilos.cita}>{testimonio.texto}</p>
                      <p className={estilos.valoracion}>
                        <span aria-hidden="true">{estrellasDe(testimonio.nota)}</span>{' '}
                        <span>{notaEnTexto(testimonio.nota)}</span>
                      </p>
                      <p className={estilos.firma}>
                        <span className={estilos.autora}>{testimonio.autora}</span>
                        <span className={estilos.servicio}>{testimonio.servicio}</span>
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className={estilos.puntos} role="group" aria-label={NOMBRE_DE_LOS_PUNTOS}>
            {TESTIMONIOS_DEMO.map((testimonio, indice) => (
              <button
                key={testimonio.autora}
                type="button"
                className={estilos.punto}
                aria-label={etiquetaDelPuntoDeTestimonio(indice, TOTAL)}
                aria-disabled={indice === activo ? 'true' : undefined}
                data-actual={indice === activo ? 'sí' : 'no'}
                onClick={() => mostrarTestimonio(indice)}
              />
            ))}
          </div>
        </div>
        {/* [@s5] La leyenda de honestidad, VISIBLE: testimonios de ejemplo + el aviso del art.
            20.4 (la nota agregada procede de la plataforma declarada). Vive en el módulo demo,
            patrón LEYENDA_EQUIPO: retirable sin desplegar código cuando lleguen reseñas reales. */}
        <p className={estilos.leyenda}>{LEYENDA_RESENAS}</p>
      </div>
    </div>
  )
}
