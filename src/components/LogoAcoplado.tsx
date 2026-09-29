import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { partirNombre } from '../lib/partir-nombre'
import { NOMBRE } from '../lib/site'
import { VISTA_MARCA } from '../lib/trazo-marca'

interface Acople {
  logo: 'texto' | 'caligrafia'
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
  const final = destino.getBoundingClientRect()

  if (origen.width <= 0 || final.width <= 0) {
    return undefined
  }

  if (primeraObservacion || origen.bottom <= -window.innerHeight) {
    return undefined
  }

  return {
    '--vuelo-x': `${origen.left - final.left}px`,
    '--vuelo-y': `${origen.top - final.top}px`,
    '--vuelo-escala': `${origen.width / final.width}`,
  } as CSSProperties
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
  const [acople, setAcople] = useState<Acople>({ logo: 'texto' })
  const enlace = useRef<HTMLAnchorElement>(null)
  const logo = useRef<SVGSVGElement>(null)

  useEffect(() => {
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
        const entrada = entradas[0]
        const primeraObservacion = primeraEntrega
        primeraEntrega = false

        const lineaDeCorte = entrada.rootBounds?.top ?? cabecera.getBoundingClientRect().bottom

        if (entrada.boundingClientRect.bottom > lineaDeCorte) {
          return
        }

        observador.disconnect()

        setAcople({ logo: 'caligrafia', variables: vueloHacia(logo.current!, primeraObservacion) })
      },
      {
        threshold: 0,
        rootMargin: `-${Math.floor(cabecera.getBoundingClientRect().height)}px 0px 0px 0px`,
      },
    )

    observador.observe(disparo)

    return () => {
      observador.disconnect()
    }
  }, [])

  return (
    <a
      ref={enlace}
      href={import.meta.env.BASE_URL}
      data-logo={acople.logo}
      data-vuelo={acople.variables === undefined ? 'no' : 'si'}
      style={acople.variables}
    >
      <span>{NOMBRE}</span>
      <span aria-hidden="true">{NOMBRE}</span>
      <svg ref={logo} viewBox={VISTA_MARCA} aria-hidden="true" focusable="false">
        <text x="0" y="0" fontSize="1000">
          {marca}
        </text>
      </svg>
    </a>
  )
}
