import {
  type CSSProperties,
  type PointerEvent as EventoDePuntero,
  useEffect,
  useRef,
  useState,
} from 'react'

import galeriaRosaDorado from '../assets/trabajos/galeria-rosa-dorado.jpg'
import galeriaEsmaltesRosa from '../assets/trabajos/galeria-esmaltes-rosa.jpg'
import galeriaManicuraFrancesa from '../assets/trabajos/galeria-manicura-francesa.jpg'
import galeriaNudeMinimalista from '../assets/trabajos/galeria-nude-minimalista.jpg'
import galeriaRojoClasico from '../assets/trabajos/galeria-rojo-clasico.jpg'
import galeriaCoralLazo from '../assets/trabajos/galeria-coral-lazo.jpg'
import {
  atiendeLaCandidata,
  CANDIDATA_GALERIA,
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
  claveDistancia,
  debeRotar,
  distanciaCircular,
  etiquetaDeDiapositiva,
  etiquetaDelPunto,
  indiceCircular,
  pasosDelArrastre,
  signoDe,
  UMBRAL_DE_ARRASTRE,
  vozDeLaPista,
} from './galeria-logica'
import estilos from './galeria.module.scss'

/**
 * La galería de trabajos (capa visual del DEMO). Bloque NO navegable (`<div>`): convertirlo en
 * `<section aria-labelledby>` rompería DOS puertas del build (pasaría a «sección navegable» y la
 * nav no la enlaza). Contrato: `features/galeria_carrusel.feature`.
 *
 * Es un CARRUSEL COVERFLOW 3D EN DOMO: la tarjeta centrada se eleva y las laterales caen, giran
 * hacia dentro, encogen y se apagan. Este módulo SOLO cablea: toda decisión vive en
 * `galeria-logica.ts` (pura y mutable) y toda magnitud en `galeria.module.scss`. El puente entre
 * los dos es `data-distancia` (la clave, por valor absoluto) + `--s` (el lado) + `z-index` inline.
 *
 * Fotos REALES de trabajos, de banco de imágenes (Pexels), seleccionadas a mano, SIN rostro
 * identificable: el `alt` describe el trabajo fotografiado. La nota de pie declara la honestidad.
 * El bucle infinito se consigue con ARITMÉTICA CIRCULAR: JAMÁS clonando diapositivas.
 */
const ANCHO_FOTO = 800
const ALTO_FOTO = 600
const ID_TITULO = 'galeria-titulo'
const ID_PISTA = 'galeria-pista'

interface FotoGaleria {
  readonly src: string
  readonly alt: string
}

const FOTOS: readonly FotoGaleria[] = [
  { src: galeriaRosaDorado, alt: 'Manicura rosa empolvado con topos dorados' },
  { src: galeriaEsmaltesRosa, alt: 'Manicura en rosa nude junto a dos esmaltes' },
  { src: galeriaManicuraFrancesa, alt: 'Manicura francesa de uña larga' },
  { src: galeriaNudeMinimalista, alt: 'Manicura nude con detalle minimalista' },
  { src: galeriaRojoClasico, alt: 'Manicura clásica en rojo' },
  { src: galeriaCoralLazo, alt: 'Uñas en coral con lazo en relieve' },
]

const TOTAL = FOTOS.length

/** Las flechas y el autoplay mueven UNA foto cada vez. */
const PASO_DE_FLECHA = 1

/** El nombre accesible del grupo de puntos indicadores (APG). */
const NOMBRE_DE_LOS_PUNTOS = 'Elegir la foto que se muestra'

const CONSULTA_MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)'

const NOTA_GALERIA =
  'Galería de muestra · fotos de banco de imágenes, las fotos reales del salón se añaden antes de publicar.'

export function Galeria() {
  const [activo, setActivo] = useState(0)
  // La pausa EXPLÍCITA: el botón «Parar», o el arranque bajo `prefers-reduced-motion`.
  const [pausado, setPausado] = useState(false)
  const [raton, setRaton] = useState(false)
  // El foco NO se limpia al salir: entrar para la rotación y solo el botón la devuelve.
  const [foco, setFoco] = useState(false)
  // [@s20] La GENERACIÓN del reloj: cada acción manual crea un token NUEVO (identidad, no
  // aritmética: un contador `g + 1` tendría a `g - 1` de mutante EQUIVALENTE — cualquier cambio
  // re-suscribe igual). El efecto del intervalo la lleva en sus deps: acción → efecto nuevo →
  // el intervalo cuenta 2000 ms DESDE la acción, no desde el arranque.
  const [generacionDelReloj, setGeneracionDelReloj] = useState({})
  // [ENMIENDA 1, @s19] El MARCO es el dueño del gesto: dónde bajó el puntero y cuántos pasos pidió
  // el último arrastre. Refs y no estado: son memoria del gesto, no pintan nada.
  const bajadaDelPuntero = useRef(0)
  const pasosDelUltimoGesto = useRef(0)
  // [@s23] La sección que observa el IntersectionObserver. El estado del teclado global (foco
  // dentro, proporción visible y distancia al centro MEDIDAS) ya no vive aquí: vive en el
  // registro COMPARTIDO de `carrusel-logica.ts`, donde la decisión es UNA para los DOS
  // carruseles de la página (@s22 + @s8 de reseñas).
  const raiz = useRef<HTMLDivElement | null>(null)

  // El botón que ponía `arranqueExplicito` a `true` se retiró a mano (commit 9cf32a9): hoy ningún
  // gesto de UI puede activar esa rama de `debeRotar`, así que aquí se pasa siempre `false`. La
  // función pura conserva el parámetro por ser una capacidad reutilizable (ver su docblock).
  const rotando = debeRotar({
    pausadoPorElUsuario: pausado,
    raton,
    foco,
    arranqueExplicito: false,
  })

  useEffect(
    () => {
      // (T) implementación de referencia del APG: «If operating system preferences have been set
      // for reduced motion …, the auto-rotation is initially paused». No se le retira la función:
      // el usuario puede arrancarla con el botón. Se lee dentro del efecto (nunca durante el
      // render) para que el HTML horneado y la primera hidratación coincidan; la llamada va
      // GUARDADA por un motivo MEDIDO: jsdom 25 no implementa `matchMedia` (precedente
      // `reserva.test.tsx`).
      if (typeof window.matchMedia !== 'function') {
        return
      }

      const preferencia = window.matchMedia(CONSULTA_MOVIMIENTO_REDUCIDO)

      if (preferencia.matches) {
        setPausado(true)
      }

      // [ENMIENDA 1, @s12] La preferencia se ESCUCHA en caliente, en este MISMO efecto: activarla
      // pausa la rotación EN CURSO; desactivarla NO toca nada — reanudar sigue siendo decisión del
      // usuario, con su botón (la rama contraria pararía el carrusel al RETIRAR la preferencia).
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
    // MUTANTE EQUIVALENTE (ArrayDeclaration, deps → ['Stryker was here']), verificado en
    // progress/mutation_galeria_carrusel.md (124:6): deps CONSTANTES de un efecto solo-montaje se
    // comparan elemento a elemento con Object.is y nunca difieren — el efecto corre EXACTAMENTE
    // una vez al montar en ambas versiones (precedente Equipo.tsx:210).
    // Stryker disable next-line all
    [],
  )

  useEffect(() => {
    if (!rotando) {
      return
    }

    // ⚠️ `setInterval` NO devuelve `number` con `@types/node` cargado: el identificador se guarda
    // en una constante local y lo limpia el propio efecto, sin ref que tipar.
    const reloj = setInterval(() => {
      setActivo((anterior) => indiceCircular(anterior + PASO_DE_FLECHA, TOTAL))
    }, MILISEGUNDOS_POR_FOTO)

    return () => {
      clearInterval(reloj)
    }
  }, [rotando, generacionDelReloj])

  /**
   * [@s20] Toda acción MANUAL pasa por aquí: reinicia el intervalo, así el siguiente avance
   * automático llega 2000 ms después de la acción. En PAUSA no arranca nada: el efecto del
   * intervalo sigue sin correr mientras `rotando` sea false — la parada del usuario es definitiva.
   */
  const reiniciarElReloj = () => {
    setGeneracionDelReloj({})
  }

  /** Mueve la foto centrada `pasos` posiciones, con envoltura por los DOS extremos. MANUAL. */
  const desplazar = (pasos: number) => {
    setActivo((anterior) => indiceCircular(anterior + pasos, TOTAL))
    reiniciarElReloj()
  }

  useEffect(
    () => {
      // [ENMIENDA 3, @s23] El teclado global. La DECISIÓN es pura y COMPARTIDA (`pasoDeTecla` y
      // el registro de candidatas de `carrusel-logica.ts`, @s21/@s22): aquí solo el cableado —
      // alta en el registro, listener sobre el documento, medidas del observador y limpieza. La
      // línea roja: `preventDefault()` SOLO cuando el árbitro compartido dice que atiende ESTE
      // carrusel — una tecla, UN carrusel, aunque haya dos listeners.
      registrarCandidata(CANDIDATA_GALERIA)

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

        if (!atiendeLaCandidata(CANDIDATA_GALERIA)) {
          return
        }

        evento.preventDefault()
        // El MISMO camino manual que `desplazar` (mover + reiniciar el reloj de @s20), escrito
        // sobre los setters ESTABLES de React: este efecto es solo-montaje y no puede cerrar
        // sobre funciones del render sin avisos de exhaustive-deps (que este repo no tolera) ni
        // re-suscribir el listener en cada render (la limpieza asevera UN solo registro).
        setActivo((anterior) => indiceCircular(anterior + pasos, TOTAL))
        setGeneracionDelReloj({})
      }

      document.addEventListener('keydown', alPulsarLaTecla)

      // El observador va GUARDADO por un motivo MEDIDO: jsdom 25 no implementa
      // IntersectionObserver (brief v3 §7). El umbral es EL MISMO de la decisión pura, y la
      // candidata se actualiza con la medida REAL de cada entrada: la proporción visible y la
      // distancia del centro de `boundingClientRect` al centro de `rootBounds` — nada de ceros
      // fijos (hallazgo 1 del judge del lote).
      const observarLaSeccion = (seccion: Element) => {
        const observador = new IntersectionObserver(
          (entradas) => {
            for (const entrada of entradas) {
              medirCandidata(
                CANDIDATA_GALERIA,
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
        // VERIFICADO en progress/mutation_lote_v3_resenas.md (257:9) y RATIFICADO por el lead:
        // `ref={raiz}` va INCONDICIONAL en el <div> raíz y React fija los refs de host ANTES de
        // los efectos pasivos — el chequeo de null es defensa inalcanzable (misma familia que
        // Reserva.tsx:61, tdd_deuda_mutacion_full.md mutante #4).
        // Stryker disable next-line all
        raiz.current !== null && typeof IntersectionObserver === 'function'
          ? observarLaSeccion(raiz.current)
          : null

      return () => {
        document.removeEventListener('keydown', alPulsarLaTecla)
        observador?.disconnect()
        retirarCandidata(CANDIDATA_GALERIA)
      }
    },
    // MUTANTE EQUIVALENTE (ArrayDeclaration): deps CONSTANTES de un efecto solo-montaje, como el
    // efecto de matchMedia de arriba (precedente verificado en mutation_galeria_carrusel.md 124:6).
    // Stryker disable next-line all
    [],
  )

  /** El ratón o el foco entran al carrusel: marcan su fuente como activa (paran la rotación). */
  const entra = (poner: (dentro: boolean) => void) => {
    poner(true)
  }

  /** [@s19] El gesto empieza: se guarda dónde bajó el puntero sobre el marco. */
  const alBajarElPuntero = (evento: EventoDePuntero) => {
    bajadaDelPuntero.current = evento.clientX
  }

  /**
   * [@s19] El gesto acaba: la DECISIÓN es de `pasosDelArrastre` (pura, umbral INCLUSIVO de 48 px).
   * Cada arrastre cuenta UNA sola foto, por lejos que llegue el dedo; bajo el umbral, cero.
   */
  const alSubirElPuntero = (evento: EventoDePuntero) => {
    const pasos = pasosDelArrastre(evento.clientX - bajadaDelPuntero.current, UMBRAL_DE_ARRASTRE)

    pasosDelUltimoGesto.current = pasos
    desplazar(pasos)
  }

  /** [@s17 + @s18 + @s20] Centra la foto pedida por una acción MANUAL (punto o clic en tarjeta). */
  const mostrarFoto = (indice: number) => {
    setActivo(indice)
    reiniciarElReloj()
  }

  /**
   * [@s18 + @s19] El clic de centrar de la tarjeta solo actúa si el desplazamiento del gesto quedó
   * BAJO el umbral: el click que el navegador sintetiza tras un arrastre real NO anula el gesto.
   */
  const elegirFoto = (indice: number) => {
    if (pasosDelUltimoGesto.current === 0) {
      mostrarFoto(indice)
    }
  }

  return (
    <div ref={raiz} className={`demo-seccion ${estilos.galeria}`}>
      <div className="demo-contenedor">
        <div className="demo-encabezado">
          <p className="demo-eyebrow">Galería</p>
          <h2 id={ID_TITULO} className="demo-titulo">
            Nuestros trabajos
          </h2>
        </div>
        <div
          className={estilos.carrusel}
          role="group"
          aria-roledescription="carrusel"
          aria-labelledby={ID_TITULO}
          onMouseEnter={() => entra(setRaton)}
          onMouseLeave={() => setRaton(false)}
          onFocus={() => {
            entra(setFoco)
            // [@s23] El foco dentro ASIGNA el teclado a esta candidata en el registro
            // compartido y EXCLUYE a la otra (@s22).
            enfocarCandidata(CANDIDATA_GALERIA, true)
          }}
          onBlur={() => {
            // [@s23] Al salir el foco deja de atender; la PAUSA de `foco` sí es pegajosa (@s10).
            enfocarCandidata(CANDIDATA_GALERIA, false)
          }}
        >
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
              {FOTOS.map((foto, indice) => {
                const distancia = distanciaCircular(indice, activo, TOTAL)

                return (
                  <div
                    key={foto.alt}
                    className={estilos.tarjeta}
                    role="group"
                    aria-roledescription="diapositiva"
                    aria-label={etiquetaDeDiapositiva(indice, TOTAL)}
                    data-distancia={claveDistancia(distancia)}
                    onClick={() => elegirFoto(indice)}
                    style={
                      {
                        '--s': signoDe(distancia),
                        zIndex: capaDe(distancia, TOTAL),
                      } as CSSProperties
                    }
                  >
                    <div className={estilos.lienzo}>
                      {/* [ENMIENDA 2, MEDIDO] sin draggable=false el drag nativo de imagen se
                          traga el pointerup y el arrastre de @s19 muere en silencio. */}
                      <img
                        src={foto.src}
                        alt={foto.alt}
                        width={ANCHO_FOTO}
                        height={ALTO_FOTO}
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className={estilos.puntos} role="group" aria-label={NOMBRE_DE_LOS_PUNTOS}>
            {FOTOS.map((foto, indice) => (
              <button
                key={foto.alt}
                type="button"
                className={estilos.punto}
                aria-label={etiquetaDelPunto(indice, TOTAL)}
                aria-disabled={indice === activo ? 'true' : undefined}
                data-actual={indice === activo ? 'sí' : 'no'}
                onClick={() => mostrarFoto(indice)}
              />
            ))}
          </div>
        </div>
        <p className={estilos.nota}>{NOTA_GALERIA}</p>
      </div>
    </div>
  )
}
