import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { partirNombre } from '../lib/partir-nombre'
import { NOMBRE } from '../lib/site'
import { VISTA_MARCA } from '../lib/trazo-marca'
import {
  debeVolar,
  estadoTrasObservar,
  margenDeRaiz,
  transformacionFlip,
  variablesDeVuelo,
  type EstadoLogo,
} from './logo-acoplado-logica'
import estilos from './logo-acoplado.module.scss'

/** Lo que hornea el SSG y con lo que nace cada montaje; sin JS, la marca se queda así (LA-C13). */
const HORNEADO: EstadoLogo = 'texto'

interface Acople {
  logo: EstadoLogo
  /** Las custom properties del vuelo: existen SOLO si el logo llegó volando (data-vuelo="si"). */
  variables?: CSSProperties
}

/**
 * El punto de salida del vuelo, o `undefined` si el logo se acopla sin vuelo: en la primera entrega
 * (carga ya desplazada), con el rótulo a un viewport o más por encima, sin rótulo en la página o sin
 * una caja con ancho que medir.
 */
function vueloHacia(destino: Element, primeraObservacion: boolean): CSSProperties | undefined {
  const rotulo = document.querySelector('[data-acople="origen"]')

  if (rotulo === null) {
    return undefined
  }

  const origen = rotulo.getBoundingClientRect()
  const flip = transformacionFlip(origen, destino.getBoundingClientRect())

  if (flip === null) {
    return undefined
  }

  const vuela = debeVolar({
    primeraObservacion,
    bordeInferiorOrigen: origen.bottom,
    altoViewport: window.innerHeight,
  })

  if (!vuela) {
    return undefined
  }

  return variablesDeVuelo(flip) as CSSProperties
}

/**
 * La marca de la cabecera (F-25). Contrato: features/logo_acoplado.feature.
 *
 * Enlaza a la home (que EXISTE en `dist/`), jamás a un `#ancla`: no toca la puerta de anclas vivas.
 * El href es `import.meta.env.BASE_URL` (nativa de Vite), no el literal "/": `vite.config.ts` fija
 * `base: '/NailsLashStudioWeb/'` (ENMIENDA 1 a F-05/F-04), así que en producción vale
 * "/NailsLashStudioWeb/". Ver progress/tdd_subruta_github_pages.md.
 */
export function LogoAcoplado() {
  const { marca } = partirNombre(NOMBRE)
  const [acople, setAcople] = useState<Acople>({ logo: HORNEADO })
  const enlace = useRef<HTMLAnchorElement>(null)
  const logo = useRef<SVGSVGElement>(null)

  useEffect(
    () => {
      if (typeof IntersectionObserver !== 'function') {
        return
      }

      const disparo = document.querySelector('[data-acople="disparo"]')

      if (disparo === null) {
        return
      }

      const cabecera = enlace.current!.closest('header')!
      let primeraEntrega = true

      const observador = new IntersectionObserver(
        (entradas) => {
          // Decide la ÚLTIMA entrada de la entrega; «primera» cuenta entregas, no entradas (D-4).
          const entrada = entradas[entradas.length - 1]
          const primeraObservacion = primeraEntrega
          primeraEntrega = false

          const lineaDeCorte = entrada.rootBounds?.top ?? cabecera.getBoundingClientRect().bottom
          // Solo escucha mientras la marca sigue en el horneado: al acoplar se desconecta.
          const logoTrasEntrega = estadoTrasObservar(
            HORNEADO,
            entrada.boundingClientRect.bottom,
            lineaDeCorte,
          )

          if (logoTrasEntrega === HORNEADO) {
            return
          }

          observador.disconnect()

          setAcople({
            logo: logoTrasEntrega,
            variables: vueloHacia(logo.current!, primeraObservacion),
          })
        },
        {
          threshold: 0,
          rootMargin: margenDeRaiz(cabecera.getBoundingClientRect().height),
        },
      )

      observador.observe(disparo)

      return () => {
        observador.disconnect()
      }
    },
    // MUTANTE EQUIVALENTE (ArrayDeclaration, deps → ['Stryker was here']), DEMOSTRADO en
    // progress/mutation_logo_acoplado.md (LogoAcoplado.tsx 122:6 antes de esta marca: survived con
    // los 182 tests relacionados; aplicado a mano, la suite COMPLETA siguió verde 1672/1672): deps
    // CONSTANTES de un efecto solo-montaje se comparan elemento a elemento con Object.is y nunca
    // difieren, así que el efecto corre EXACTAMENTE una vez al montar en ambas versiones. Misma
    // familia que Hero.tsx, Galeria.tsx y Equipo.tsx.
    // Stryker disable next-line ArrayDeclaration: equivalente demostrado en progress/mutation_logo_acoplado.md
    [],
  )

  return (
    <a
      ref={enlace}
      href={import.meta.env.BASE_URL}
      className={estilos.marca}
      data-logo={acople.logo}
      data-vuelo={acople.variables === undefined ? 'no' : 'si'}
      style={acople.variables}
    >
      <span className={estilos.soloLectores}>{NOMBRE}</span>
      <span className={estilos.logoTexto} aria-hidden="true">
        {NOMBRE}
      </span>
      <svg
        ref={logo}
        className={estilos.logoCaligrafia}
        viewBox={VISTA_MARCA}
        aria-hidden="true"
        focusable="false"
      >
        <text x="0" y="0" fontSize="1000">
          {marca}
        </text>
      </svg>
    </a>
  )
}
