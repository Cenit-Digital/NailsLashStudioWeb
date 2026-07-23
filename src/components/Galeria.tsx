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
  capaDe,
  claveDeRotacion,
  claveDistancia,
  debeRotar,
  distanciaCircular,
  etiquetaDeDiapositiva,
  etiquetaDelPunto,
  etiquetaDeRotacion,
  indiceCircular,
  MILISEGUNDOS_POR_FOTO,
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
  // MUTANTE EQUIVALENTE (BooleanLiteral false→true), verificado en
  // progress/mutation_galeria_carrusel.md (86:62): inobservable POR CONSTRUCCIÓN — su único lector
  // es `debeRotar` y `entra()` cancela el arranque EN EL MISMO lote, así que ningún render
  // alcanzable distingue los dos valores iniciales (precedente HOST_WHATSAPP, site.ts:72-73).
  // Stryker disable next-line all
  const [arranqueExplicito, setArranqueExplicito] = useState(false)
  // [ENMIENDA 1, @s19] El MARCO es el dueño del gesto: dónde bajó el puntero y cuántos pasos pidió
  // el último arrastre. Refs y no estado: son memoria del gesto, no pintan nada.
  const bajadaDelPuntero = useRef(0)
  const pasosDelUltimoGesto = useRef(0)

  const rotando = debeRotar({ pausadoPorElUsuario: pausado, raton, foco, arranqueExplicito })

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
  }, [rotando])

  /** Mueve la foto centrada `pasos` posiciones, con envoltura por los DOS extremos. */
  const desplazar = (pasos: number) => {
    setActivo((anterior) => indiceCircular(anterior + pasos, TOTAL))
  }

  /**
   * El botón de rotación. Parar es DEFINITIVO (SC 2.2.2); arrancar ignora el ratón encima y el
   * foco dentro (APG). La etiqueta y el `data-estado` siguen a la VOLUNTAD del usuario (`pausado`),
   * no a la pausa transitoria del ratón: si siguieran a esta, el botón diría «Iniciar» justo cuando
   * el usuario acerca el puntero para pararlo.
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

  /**
   * [@s18 + @s19] El clic de centrar de la tarjeta solo actúa si el desplazamiento del gesto quedó
   * BAJO el umbral: el click que el navegador sintetiza tras un arrastre real NO anula el gesto.
   */
  const elegirFoto = (indice: number) => {
    if (pasosDelUltimoGesto.current === 0) {
      setActivo(indice)
    }
  }

  return (
    <div className={`demo-seccion ${estilos.galeria}`}>
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
          onFocus={() => entra(setFoco)}
        >
          <div className={estilos.mandos}>
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
              className={estilos.flecha}
              aria-label="Anterior"
              aria-controls={ID_PISTA}
              onClick={() => desplazar(-PASO_DE_FLECHA)}
            >
              ←
            </button>
            <button
              type="button"
              className={estilos.flecha}
              aria-label="Siguiente"
              aria-controls={ID_PISTA}
              onClick={() => desplazar(PASO_DE_FLECHA)}
            >
              →
            </button>
          </div>
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
                onClick={() => setActivo(indice)}
              />
            ))}
          </div>
        </div>
        <p className={estilos.nota}>{NOTA_GALERIA}</p>
      </div>
    </div>
  )
}
