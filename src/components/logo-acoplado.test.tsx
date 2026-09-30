import { act, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { inspeccionarAnclas } from '../lib/puerta-anclas'
import Home from '../pages/home'
import { Cabecera } from './Cabecera'
import { Hero } from './Hero'

/**
 * F-25 — el logo acoplado. Contrato: features/logo_acoplado.feature.
 *
 * Lo que hornea el SSG se asevera sobre `renderToString` (el mismo mecanismo que vite-react-ssg). Los
 * literales esperados van A MANO («Nails Lash Studio», «texto», «no»…): NUNCA se importan NOMBRE,
 * partirNombre ni VISTA_MARCA como valor esperado (anti-tautología). El estado se lee de `data-logo`
 * y `data-vuelo`, jamás de una clase (bajo `css: false` las del module no existen).
 */

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

/* ————————————————————————————————————————————————————————————————————————————————————————————
 * EL ARNÉS DE jsdom (geometría de referencia del .feature). jsdom no hace layout: todo
 * getBoundingClientRect mide 0. Aquí se fija ANTES del montaje, por elemento, con cajas
 * asimétricas y sin ceros; «STUDIO» (el disparo) se queda en los ceros de jsdom a propósito: su
 * borde lo trae la ENTRADA del observador, y decidir con otra medida pondría rojas las filas
 * «texto» (0 <= 73 acoplaría siempre).
 * ———————————————————————————————————————————————————————————————————————————————————————————— */

interface Caja {
  left: number
  top: number
  width: number
  height: number
}

interface Geometria {
  cabecera: Caja
  logo: Caja
  enlace: Caja
  origen: Caja
}

const ALTO_DEL_VIEWPORT = 812

/** La línea DEL PROPIO OBSERVADOR, como la fabrica el navegador: el viewport recortado por el margen. */
const LINEA_DEL_OBSERVADOR = { top: 73, bottom: 812 }

function geometriaDeReferencia(): Geometria {
  return {
    cabecera: { left: 0, top: 0, width: 1280, height: 73.6 },
    // El DESTINO del FLIP: el <svg> del logo.
    logo: { left: 40, top: 17, width: 137.5, height: 40 },
    // El SEÑUELO: medir el <a> en vez del <svg> daría x 341 · y −80,4 · escala ≈ 3,04.
    enlace: { left: 24, top: 22.4, width: 181, height: 28.8 },
    // El ORIGEN: el rótulo del hero en el instante del disparo (bottom 42). Alto NO proporcional a
    // propósito: una escala tomada del alto daría 2,5 y no 4.
    origen: { left: 365, top: -58, width: 550, height: 100 },
  }
}

function rectDe(caja: Caja): DOMRect {
  return {
    x: caja.left,
    y: caja.top,
    left: caja.left,
    top: caja.top,
    width: caja.width,
    height: caja.height,
    right: caja.left + caja.width,
    bottom: caja.top + caja.height,
    toJSON: () => caja,
  }
}

const SIN_LAYOUT: Caja = { left: 0, top: 0, width: 0, height: 0 }

/** Fija la geometría (mutable: un test puede moverla entre entregas) y el alto del viewport. */
function fijarGeometria(geometria: Geometria = geometriaDeReferencia()): Geometria {
  vi.stubGlobal('innerHeight', ALTO_DEL_VIEWPORT)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    if (this.matches('header')) return rectDe(geometria.cabecera)
    if (this.matches('[data-acople="origen"]')) return rectDe(geometria.origen)
    if (this.matches('a[data-logo] > svg')) return rectDe(geometria.logo)
    if (this.matches('a[data-logo]')) return rectDe(geometria.enlace)
    return rectDe(SIN_LAYOUT)
  })

  return geometria
}

/** El papel del hero: los dos atributos que F-25 añade a Hero.tsx, sin el resto del hero. */
function PapelDelHero({ conOrigen, conDisparo }: { conOrigen: boolean; conDisparo: boolean }) {
  return (
    <main>
      {conOrigen && <svg data-acople="origen" />}
      {conDisparo && <span data-acople="disparo">Studio</span>}
    </main>
  )
}

function montar({ conOrigen = true, conDisparo = true } = {}) {
  return render(
    <>
      <Cabecera />
      <PapelDelHero conOrigen={conOrigen} conDisparo={conDisparo} />
    </>,
  )
}

interface Entrada {
  bottom: number
  isIntersecting: boolean
  rootBounds: { top: number; bottom: number } | null
}

function entrada(
  bottom: number,
  isIntersecting: boolean,
  rootBounds: Entrada['rootBounds'] = LINEA_DEL_OBSERVADOR,
): Entrada {
  return { bottom, isIntersecting, rootBounds }
}

/**
 * El IntersectionObserver que jsdom 25 NO trae (precedente `stubDeIntersectionObserver` de
 * galeria.test.tsx): captura callback y opciones; constructor, observe y disconnect espiados. Las
 * entregas se hacen A MANO dentro de act(), con la caja de «STUDIO» y la línea del observador.
 */
function stubDeIntersectionObserver() {
  const construir = vi.fn()
  const observar = vi.fn()
  const desconectar = vi.fn()
  const capturado: { callback: ((entradas: unknown[], observador: unknown) => void) | null } = {
    callback: null,
  }

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = observar
      disconnect = desconectar

      constructor(callback: (entradas: unknown[], observador: unknown) => void, opciones: unknown) {
        construir(callback, opciones)
        capturado.callback = callback
      }
    },
  )

  /** UNA llamada al callback con las entradas dadas, en ese orden. */
  function entregar(...entradas: Entrada[]): void {
    expect(capturado.callback, 'el logo no construyó ningún observador').not.toBeNull()
    const disparo = document.querySelector('[data-acople="disparo"]')

    act(() => {
      capturado.callback?.(
        entradas.map(({ bottom, isIntersecting, rootBounds }) => ({
          target: disparo,
          isIntersecting,
          boundingClientRect: rectDe({ left: 530, top: bottom - 30, width: 220, height: 30 }),
          rootBounds:
            rootBounds === null
              ? null
              : rectDe({
                  left: 0,
                  top: rootBounds.top,
                  width: 1280,
                  height: rootBounds.bottom - rootBounds.top,
                }),
        })),
        {},
      )
    })
  }

  return { construir, observar, desconectar, entregar }
}

type Doble = ReturnType<typeof stubDeIntersectionObserver>

/** El <a> de la marca, montado. */
function enlaceDeLaMarca(): HTMLAnchorElement {
  const enlace = document.querySelector('a[data-logo]')

  expect(enlace, 'la cabecera debe montar el <a> con data-logo').not.toBeNull()

  return enlace as HTMLAnchorElement
}

/** La etiqueta de apertura del ÚNICO <a> que lleva data-logo. */
function aperturaDelLogo(html: string): string {
  return /<a\b[^>]*\sdata-logo=[^>]*>/.exec(html)?.[0] ?? ''
}

/** El <a> con data-logo, desde su apertura hasta su </a>. */
function fragmentoDelLogo(html: string): string {
  return /<a\b[^>]*\sdata-logo=[^>]*>[\s\S]*?<\/a>/.exec(html)?.[0] ?? ''
}

/** El fragmento horneado del <a>, parseado a DOM para inspeccionar su estructura. */
function enlaceParseado(fragmento: string): HTMLAnchorElement {
  const plantilla = document.createElement('template')
  plantilla.innerHTML = fragmento
  const enlace = plantilla.content.querySelector('a')

  expect(enlace, 'el horneado debe traer el <a> con data-logo').not.toBeNull()

  return enlace as HTMLAnchorElement
}

describe('@s1 el horneado de la marca nace en «texto» y «no», apunta a BASE_URL y no trae ningún style', () => {
  it('@s1 exactamente un <a> con data-logo, en data-logo="texto" y data-vuelo="no", con href "/" y sin style ni animación; querySelector no se llama al hornear', () => {
    const consultar = vi.spyOn(document, 'querySelector')

    const horneado = renderToString(<Cabecera />)

    // ANCLAS POSITIVAS: la nav de F-06 sigue ahí y hay UN enlace de marca con data-logo.
    expect(horneado).toMatch(/<nav\b[^>]*aria-label="Principal"/)
    expect(horneado.match(/<a\b[^>]*\sdata-logo=/g) ?? []).toHaveLength(1)

    const apertura = aperturaDelLogo(horneado)

    expect(apertura).toContain('data-logo="texto"')
    expect(apertura).toContain('data-vuelo="no"')
    expect(/\shref="([^"]*)"/.exec(apertura)?.[1]).toBe('/')

    const fragmento = fragmentoDelLogo(horneado)

    for (const prohibido of ['style=', '--vuelo-', 'animation']) {
      expect(fragmento, prohibido).not.toContain(prohibido)
    }
    // El hero se busca en el EFECTO, nunca en el render (LA-C9).
    expect(consultar).not.toHaveBeenCalled()
  })
})

describe('@s2 las DOS representaciones viajan horneadas dentro del enlace, sin ids, sin máscara y sin «Studio» en la firma', () => {
  const fragmento = fragmentoDelLogo(renderToString(<Cabecera />))

  it('@s2 el <a> contiene, en este orden, el <span> sin aria-hidden, el <span> aria-hidden y el <svg>; cada <span> dice «Nails Lash Studio»', () => {
    const enlace = enlaceParseado(fragmento)
    const hijos = [...enlace.children]

    expect(enlace.querySelectorAll('span')).toHaveLength(2)
    expect(enlace.querySelectorAll('svg')).toHaveLength(1)
    expect(hijos.map((hijo) => hijo.tagName.toLowerCase())).toEqual(['span', 'span', 'svg'])
    expect(hijos[0].hasAttribute('aria-hidden')).toBe(false)
    expect(hijos[1].getAttribute('aria-hidden')).toBe('true')
    expect(hijos[0].textContent).toBe('Nails Lash Studio')
    expect(hijos[1].textContent).toBe('Nails Lash Studio')
  })

  it('@s2 el <svg> es aria-hidden, no enfocable, con el viewBox del rótulo y UN <text> «Nails Lash» en x 0 · y 0 · 1000', () => {
    const svg = enlaceParseado(fragmento).querySelector('svg') as SVGSVGElement
    const textos = svg.querySelectorAll('text')

    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('focusable')).toBe('false')
    expect(svg.getAttribute('viewBox')).toBe('-80 -840 4120 1200')
    expect(textos).toHaveLength(1)
    expect(textos[0].getAttribute('x')).toBe('0')
    expect(textos[0].getAttribute('y')).toBe('0')
    expect(textos[0].getAttribute('font-size')).toBe('1000')
    expect(textos[0].textContent).toBe('Nails Lash')
    // P3: solo la firma, sin la última palabra.
    expect(svg.outerHTML).not.toContain('Studio')
    expect(svg.outerHTML).not.toContain('STUDIO')
  })

  it('@s2 el fragmento del <a> no trae ids, máscaras, referencias url(#), trazos ni imágenes', () => {
    expect(fragmento).toContain('<svg')
    for (const prohibido of [' id=', '<mask', 'mask=', 'url(#', '<path', '<image']) {
      expect(fragmento, prohibido).not.toContain(prohibido)
    }
  })
})

/** El atributo class del <a>, de sus dos <span>, del <svg> y del <text>, en ese orden. */
function clasesDeLaMarca(): (string | null)[] {
  const enlace = enlaceDeLaMarca()

  return [enlace, ...enlace.querySelectorAll('span, svg, text')].map((nodo) =>
    nodo.getAttribute('class'),
  )
}

describe('@s3 el nombre accesible es EXACTAMENTE «Nails Lash Studio» y el destino "/" en los tres estados, y ninguna clase cambia', () => {
  const filas: readonly {
    estado: string
    preparar: (io: Doble) => void
    logo: string
    vuelo: string
  }[] = [
    { estado: '«texto», recién montada', preparar: () => {}, logo: 'texto', vuelo: 'no' },
    {
      estado: '«caligrafia» sin vuelo (entrega INICIAL con «STUDIO» ya arriba)',
      preparar: (io) => io.entregar(entrada(12.5, false)),
      logo: 'caligrafia',
      vuelo: 'no',
    },
    {
      estado: '«caligrafia» con vuelo (400 y luego 73)',
      preparar: (io) => {
        io.entregar(entrada(400, true))
        io.entregar(entrada(73, true))
      },
      logo: 'caligrafia',
      vuelo: 'si',
    },
  ]

  for (const { estado, preparar, logo, vuelo } of filas) {
    it(`@s3 ${estado} → un solo enlace «Nails Lash Studio» con data-logo="${logo}" y data-vuelo="${vuelo}"`, () => {
      const io = stubDeIntersectionObserver()
      fijarGeometria()
      montar()
      const recienMontada = clasesDeLaMarca()

      preparar(io)

      const enlaces = screen.getAllByRole('link', { name: 'Nails Lash Studio' })

      expect(enlaces).toHaveLength(1)
      expect(enlaces[0]).toBe(enlaceDeLaMarca())
      expect(enlaces[0]).toHaveAttribute('data-logo', logo)
      expect(enlaces[0]).toHaveAttribute('data-vuelo', vuelo)
      expect(enlaces[0].getAttribute('href')).toBe('/')
      // El nombre sale del <span> solo para lectores (LA-5), no de un atributo.
      for (const atributo of ['aria-label', 'aria-labelledby', 'title']) {
        expect(enlaces[0].hasAttribute(atributo), atributo).toBe(false)
      }
      // Precedente F-06 @s15: el estado vive en atributos, nunca en un className condicional.
      expect(clasesDeLaMarca()).toEqual(recienMontada)
    })
  }
})

describe('@s5 tras montar, UN observador vigila a «STUDIO» con la línea de la cabecera como margen, y sin entrega nada cambia', () => {
  it('@s5 constructor una vez con { threshold: 0, rootMargin: "-73px 0px 0px 0px" } y sin root; observe una vez con el disparo; el <a> sigue en «texto» sin style', () => {
    const io = stubDeIntersectionObserver()
    fijarGeometria()
    montar()

    expect(io.construir).toHaveBeenCalledTimes(1)
    const opciones = io.construir.mock.calls[0][1] as Record<string, unknown>

    // -73 = −floor(73,6): Math.round y Math.ceil darían -74 (D-1 a). Sin root: la raíz es el viewport.
    expect(opciones).toStrictEqual({ threshold: 0, rootMargin: '-73px 0px 0px 0px' })
    expect('root' in opciones).toBe(false)
    expect(io.observar).toHaveBeenCalledTimes(1)
    expect(io.observar).toHaveBeenCalledWith(document.querySelector('[data-acople="disparo"]'))

    // En jsdom «STUDIO» mide 0 y «0 <= 73» acoplaría: sin entrega del observador, nada cambia (LA-C10).
    const enlace = enlaceDeLaMarca()

    expect(enlace).toHaveAttribute('data-logo', 'texto')
    expect(enlace).toHaveAttribute('data-vuelo', 'no')
    expect(enlace.hasAttribute('style')).toBe(false)
  })

  it('@s5 al desmontar sin haber acoplado, disconnect se llama EXACTAMENTE una vez (la limpieza del efecto)', () => {
    const io = stubDeIntersectionObserver()
    fijarGeometria()
    const { unmount } = montar()

    expect(io.desconectar).not.toHaveBeenCalled()

    unmount()

    expect(io.desconectar).toHaveBeenCalledTimes(1)
  })
})

describe('@s6 el disparo lo decide la GEOMETRÍA de la entrada contra la línea del observador, no isIntersecting; la frontera es "<="', () => {
  const filas: readonly (readonly [number, boolean, 'texto' | 'caligrafia', string])[] = [
    [912, false, 'texto', 'aún no ha llegado: por debajo del viewport'],
    [400, true, 'texto', '«STUDIO» a la vista'],
    [73.5, true, 'texto', 'medio píxel por debajo de la línea'],
    [73, true, 'caligrafia', 'frontera exacta sobre la línea'],
    [72.5, false, 'caligrafia', 'el aviso de salida típico'],
    [12.5, false, 'caligrafia', 'ya pasó por arriba'],
    [-640, false, 'caligrafia', 'muy por encima: un scroll rápido'],
  ]

  for (const [bottom, isIntersecting, logo, caso] of filas) {
    it(`@s6 bottom ${bottom} · isIntersecting ${isIntersecting} → data-logo="${logo}" (${caso})`, () => {
      const io = stubDeIntersectionObserver()
      fijarGeometria()
      montar()
      io.entregar(entrada(400, true))

      expect(enlaceDeLaMarca()).toHaveAttribute('data-logo', 'texto')

      io.entregar(entrada(bottom, isIntersecting))

      expect(enlaceDeLaMarca()).toHaveAttribute('data-logo', logo)
      expect(io.desconectar).toHaveBeenCalledTimes(logo === 'caligrafia' ? 1 : 0)
    })
  }
})

describe('@s7 la línea de la decisión es la del PROPIO OBSERVADOR; solo sin rootBounds cae al borde de la cabecera medido EN EL CALLBACK', () => {
  const filas: readonly (readonly [
    'con top 73' | 'null',
    number,
    number,
    boolean,
    'texto' | 'caligrafia',
    string,
  ])[] = [
    [
      'con top 73',
      260,
      150,
      true,
      'texto',
      'manda la línea del observador aunque el menú abierto tape',
    ],
    ['con top 73', 73.6, 73.4, true, 'texto', 'manda la línea (73), no el borde medido (73,6)'],
    ['con top 73', 73.6, 73, true, 'caligrafia', 'frontera exacta sobre la línea del observador'],
    ['con top 73', 70, 72, true, 'caligrafia', 'la cabecera encogió tras montar (D-2)'],
    ['null', 260, 150, false, 'caligrafia', 'sin rootBounds: el borde medido con el menú abierto'],
    ['null', 73.6, 150, false, 'texto', 'sin rootBounds, menú cerrado: 150 > 73,6'],
    [
      'null',
      73.6,
      73.6,
      false,
      'caligrafia',
      'sin rootBounds: frontera exacta sobre el borde medido',
    ],
  ]

  for (const [rootBounds, borde, bottom, isIntersecting, logo, caso] of filas) {
    it(`@s7 rootBounds ${rootBounds} · cabecera ${borde} · bottom ${bottom} → "${logo}" (${caso})`, () => {
      const io = stubDeIntersectionObserver()
      const geometria = fijarGeometria()
      montar()
      io.entregar(entrada(400, true))

      geometria.cabecera = { left: 0, top: 0, width: 1280, height: borde }
      io.entregar(
        entrada(bottom, isIntersecting, rootBounds === 'null' ? null : LINEA_DEL_OBSERVADOR),
      )

      expect(enlaceDeLaMarca()).toHaveAttribute('data-logo', logo)
      // El observador NO se rehace al cambiar de alto la cabecera (D-2).
      expect(io.construir).toHaveBeenCalledTimes(1)
      expect(io.observar).toHaveBeenCalledTimes(1)
    })
  }
})

describe('@s8 monótono (P2): acoplada, desconecta y NINGUNA entrega posterior la devuelve a «texto»', () => {
  it('@s8 tras acoplar con vuelo, una entrega con «STUDIO» otra vez a la vista (400) no cambia nada: ni atributos, ni style, ni más desconexiones', () => {
    const io = stubDeIntersectionObserver()
    fijarGeometria()
    montar()
    io.entregar(entrada(400, true))
    io.entregar(entrada(73, true))
    const enlace = enlaceDeLaMarca()
    const estiloAlAcoplar = enlace.getAttribute('style')

    expect(enlace).toHaveAttribute('data-logo', 'caligrafia')

    io.entregar(entrada(400, true))

    expect(enlace).toHaveAttribute('data-logo', 'caligrafia')
    expect(enlace).toHaveAttribute('data-vuelo', 'si')
    expect(enlace.getAttribute('style')).toBe(estiloAlAcoplar)
    expect(io.desconectar).toHaveBeenCalledTimes(1)
    expect(io.construir).toHaveBeenCalledTimes(1)
  })
})

describe('@s9 sin persistencia: montar de nuevo (lo que hace recargar arriba) vuelve a «texto», y nada toca el storage', () => {
  it('@s9 una primera vida que acopló con vuelo y se desmontó no deja rastro: la segunda nace en «texto», con su propio observador, sin getItem ni setItem', () => {
    const leer = vi.spyOn(Storage.prototype, 'getItem')
    const escribir = vi.spyOn(Storage.prototype, 'setItem')
    const io = stubDeIntersectionObserver()
    fijarGeometria()

    const primeraVida = montar()
    io.entregar(entrada(400, true))
    io.entregar(entrada(73, true))
    expect(enlaceDeLaMarca()).toHaveAttribute('data-logo', 'caligrafia')
    primeraVida.unmount()

    montar()
    const enlace = enlaceDeLaMarca()

    expect(enlace).toHaveAttribute('data-logo', 'texto')
    expect(enlace).toHaveAttribute('data-vuelo', 'no')
    expect(enlace.hasAttribute('style')).toBe(false)
    expect(io.construir).toHaveBeenCalledTimes(2)
    expect(leer).not.toHaveBeenCalled()
    expect(escribir).not.toHaveBeenCalled()
  })
})

/** ¿El style del <a> lleva las tres custom properties del vuelo? */
function llevaLasVariablesDeVuelo(enlace: HTMLElement): boolean {
  const estilo = enlace.getAttribute('style') ?? ''

  return ['--vuelo-x', '--vuelo-y', '--vuelo-escala'].every((variable) => estilo.includes(variable))
}

describe('@s10 vuela SOLO si no es la primera entrega y el rótulo está a menos de un viewport por encima; si no, acopla sin vuelo', () => {
  const filas: readonly (readonly [boolean, number, number, 'si' | 'no', string])[] = [
    [false, 42, 73, 'no', 'recarga ya desplazada con el rótulo cerca'],
    [false, -2400, -2369, 'no', 'carga directa en un ancla lejana'],
    [true, 42, 73, 'si', 'cruce por scroll o por un enlace de la nav'],
    [true, -811, -780, 'si', '1 px más cerca que un viewport: vuela'],
    [true, -812, -781, 'no', 'exactamente un viewport por encima: frontera, sin vuelo'],
    [true, -2400, -2369, 'no', 'salto lejano instantáneo o scroll restaurado tarde'],
  ]

  for (const [conEntregaInicial, bordeDelOrigen, bottom, vuelo, caso] of filas) {
    const antecedente = conEntregaInicial
      ? 'tras una entrega inicial a la vista'
      : 'entrega INICIAL'

    it(`@s10 ${antecedente} · origen en ${bordeDelOrigen} · «STUDIO» en ${bottom} → data-vuelo="${vuelo}" (${caso})`, () => {
      const io = stubDeIntersectionObserver()
      const geometria = fijarGeometria()
      geometria.origen = { ...geometria.origen, top: bordeDelOrigen - geometria.origen.height }
      montar()

      if (conEntregaInicial) {
        io.entregar(entrada(400, true))
      }
      io.entregar(entrada(bottom, false))

      const enlace = enlaceDeLaMarca()

      expect(enlace).toHaveAttribute('data-logo', 'caligrafia')
      expect(enlace).toHaveAttribute('data-vuelo', vuelo)
      if (vuelo === 'si') {
        expect(llevaLasVariablesDeVuelo(enlace)).toBe(true)
      } else {
        expect(enlace.hasAttribute('style')).toBe(false)
      }
      expect(io.desconectar).toHaveBeenCalledTimes(1)
    })
  }
})

describe('@s11 el punto de salida del vuelo son tres custom properties en el style del <a>, con la caja del RÓTULO (origen) y la del <svg> del LOGO (destino)', () => {
  it('@s11 en UNA sola entrega: data-logo="caligrafia", data-vuelo="si" y EXACTAMENTE --vuelo-x 325px, --vuelo-y -75px y --vuelo-escala 4', () => {
    const io = stubDeIntersectionObserver()
    fijarGeometria()
    montar()
    io.entregar(entrada(400, true))

    io.entregar(entrada(73, true))

    const enlace = enlaceDeLaMarca()

    expect(enlace).toHaveAttribute('data-logo', 'caligrafia')
    expect(enlace).toHaveAttribute('data-vuelo', 'si')
    expect(enlace.style).toHaveLength(3)
    // x = 365 − 40; y = −58 − 17; escala = 550 / 137,5. Medir el <a> (señuelo) daría 341px / -80.4px;
    // escalar por el alto daría 2.5.
    expect(enlace.style.getPropertyValue('--vuelo-x')).toBe('325px')
    expect(enlace.style.getPropertyValue('--vuelo-y')).toBe('-75px')
    expect(enlace.style.getPropertyValue('--vuelo-escala')).toBe('4')
  })

  it('@s11 ninguna otra etiqueta del documento recibe style: ni el <svg> del logo, ni el rótulo, ni «STUDIO»', () => {
    const io = stubDeIntersectionObserver()
    fijarGeometria()
    montar()
    io.entregar(entrada(400, true))
    io.entregar(entrada(73, true))

    expect([...document.querySelectorAll('[style]')]).toEqual([enlaceDeLaMarca()])
  })
})

describe('@s12 sin una transformación FLIP válida el logo se acopla SIN vuelo y sin errores', () => {
  const filas: readonly (readonly [string, (geometria: Geometria) => void, boolean])[] = [
    ['el documento NO tiene ningún [data-acople="origen"]', () => {}, false],
    [
      'el origen mide width 0 (una caja sin layout)',
      (g) => (g.origen = { ...g.origen, width: 0 }),
      true,
    ],
    ['el <svg> del logo mide width 0', (g) => (g.logo = { ...g.logo, width: 0 }), true],
  ]

  for (const [cambio, aplicar, conOrigen] of filas) {
    it(`@s12 ${cambio} → data-logo="caligrafia", data-vuelo="no", sin style, sin console.error`, () => {
      const error = vi.spyOn(console, 'error')
      const io = stubDeIntersectionObserver()
      aplicar(fijarGeometria())
      montar({ conOrigen })
      io.entregar(entrada(400, true))

      io.entregar(entrada(73, true))

      const enlace = enlaceDeLaMarca()

      expect(enlace).toHaveAttribute('data-logo', 'caligrafia')
      expect(enlace).toHaveAttribute('data-vuelo', 'no')
      expect(enlace.hasAttribute('style')).toBe(false)
      expect(io.desconectar).toHaveBeenCalledTimes(1)
      expect(error).not.toHaveBeenCalled()
    })
  }
})

describe('@s13 el componente NO consulta la preferencia de movimiento, NO anima con JS y NO escucha el scroll', () => {
  it('@s13 con matchMedia respondiendo «reduce», un acople con vuelo marca data-vuelo="si" con sus variables; ni matchMedia ni animate se llaman; ningún "scroll" ni "resize"', () => {
    const matchMedia = vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.stubGlobal('matchMedia', matchMedia)
    const animar = vi.fn()
    Object.defineProperty(Element.prototype, 'animate', {
      value: animar,
      configurable: true,
      writable: true,
    })
    const escucharVentana = vi.spyOn(window, 'addEventListener')
    const escucharDocumento = vi.spyOn(document, 'addEventListener')

    try {
      const io = stubDeIntersectionObserver()
      fijarGeometria()
      montar()
      io.entregar(entrada(400, true))
      io.entregar(entrada(73, true))

      const enlace = enlaceDeLaMarca()

      // La preferencia la resuelve la HOJA (@s16), no el componente.
      expect(enlace).toHaveAttribute('data-logo', 'caligrafia')
      expect(enlace).toHaveAttribute('data-vuelo', 'si')
      expect(llevaLasVariablesDeVuelo(enlace)).toBe(true)
      expect(matchMedia).not.toHaveBeenCalled()
      expect(animar).not.toHaveBeenCalled()

      const tipos = [...escucharVentana.mock.calls, ...escucharDocumento.mock.calls].map(
        ([tipo]) => tipo,
      )

      expect(tipos).not.toContain('scroll')
      expect(tipos).not.toContain('resize')
    } finally {
      delete (Element.prototype as unknown as Record<string, unknown>).animate
    }
  })
})

describe('@s14 sin IntersectionObserver o sin «STUDIO» en la página, la marca se queda en «texto» y sin errores', () => {
  /** Los selectores con los que se ha llamado document.querySelector que mencionan data-acople. */
  function consultasDeAcople(consultar: { mock: { calls: unknown[][] } }): unknown[] {
    return consultar.mock.calls
      .map(([selector]) => selector)
      .filter((selector) => String(selector).includes('data-acople'))
  }

  const filas: readonly {
    situacion: string
    conObservador: boolean
    conDisparo: boolean
    conOrigen: boolean
    comprobar: (io: Doble | null, consultar: { mock: { calls: unknown[][] } }) => void
  }[] = [
    {
      situacion: 'window.IntersectionObserver AUSENTE y un documento CON los dos data-acople',
      conObservador: false,
      conDisparo: true,
      conOrigen: true,
      comprobar: (_io, consultar) => expect(consultasDeAcople(consultar)).toEqual([]),
    },
    {
      situacion:
        'observador sustituido y un documento SIN [data-acople="disparo"] (una página sin hero)',
      conObservador: true,
      conDisparo: false,
      conOrigen: true,
      comprobar: (io) => {
        expect(io?.construir).not.toHaveBeenCalled()
        expect(io?.observar).not.toHaveBeenCalled()
      },
    },
    {
      situacion: 'observador sustituido, con disparo pero SIN [data-acople="origen"]',
      conObservador: true,
      conDisparo: true,
      conOrigen: false,
      comprobar: (io) => expect(io?.construir).toHaveBeenCalledTimes(1),
    },
  ]

  for (const { situacion, conObservador, conDisparo, conOrigen, comprobar } of filas) {
    it(`@s14 ${situacion} → «texto» mientras está montada, sin errores al montar ni al desmontar`, () => {
      const error = vi.spyOn(console, 'error')
      const consultar = vi.spyOn(document, 'querySelector')
      const io = conObservador ? stubDeIntersectionObserver() : null
      fijarGeometria()

      expect('IntersectionObserver' in window).toBe(conObservador)

      let montada: ReturnType<typeof montar> | null = null

      expect(() => {
        montada = montar({ conDisparo, conOrigen })
      }).not.toThrow()

      const enlace = enlaceDeLaMarca()

      expect(enlace).toHaveAttribute('data-logo', 'texto')
      expect(enlace).toHaveAttribute('data-vuelo', 'no')
      expect(enlace.hasAttribute('style')).toBe(false)
      comprobar(io, consultar)
      expect(() => montada?.unmount()).not.toThrow()
      expect(error).not.toHaveBeenCalled()
    })
  }
})

describe('@s22 el hero sigue su ceremonia sin enterarse del acople, y el vuelo no crea nodos ni toca el rótulo', () => {
  it('@s22 con Cabecera y Hero REALES: acopla con vuelo, la firma del hero sigue «corriendo» con su control, y el documento no gana ni pierde nodos', () => {
    // La caligrafía del hero en marcha: matchMedia SIN preferencia de movimiento reducido.
    vi.stubGlobal('matchMedia', (consulta: string) => ({
      matches: false,
      media: consulta,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    const io = stubDeIntersectionObserver()
    fijarGeometria()
    render(
      <>
        <Cabecera />
        <Hero />
      </>,
    )
    const rotulo = document.querySelector('[data-acople="origen"]') as SVGSVGElement

    expect(rotulo, 'el hero real publica su origen').not.toBeNull()
    expect(document.querySelector('[data-firma]')).toHaveAttribute('data-firma', 'corriendo')
    const elementosAntes = document.querySelectorAll('*').length

    io.entregar(entrada(400, true))
    io.entregar(entrada(73, true))

    const enlace = enlaceDeLaMarca()

    expect(enlace).toHaveAttribute('data-logo', 'caligrafia')
    expect(enlace).toHaveAttribute('data-vuelo', 'si')
    expect(document.querySelector('[data-firma]')).toHaveAttribute('data-firma', 'corriendo')
    expect(screen.getByRole('button', { name: 'Completar la firma' })).toBeInTheDocument()
    expect(document.querySelectorAll('*')).toHaveLength(elementosAntes)
    expect(document.querySelectorAll('svg[viewBox="-80 -840 4120 1200"]')).toHaveLength(2)
    expect(document.querySelectorAll('[id="tinta-marca"]')).toHaveLength(1)
    expect(document.querySelectorAll('[id="trazo-marca"]')).toHaveLength(1)
    expect(rotulo.hasAttribute('style')).toBe(false)
    expect(rotulo.hasAttribute('data-vuelo')).toBe(false)
    expect((enlace.querySelector('svg') as SVGSVGElement).hasAttribute('mask')).toBe(false)
  })
})

describe('@s23 en la home horneada sigue habiendo UN <h1>, el logo no es un encabezado, los ids del rótulo son únicos y las anclas no cambian', () => {
  const home = renderToString(
    <HelmetProvider>
      <Home />
    </HelmetProvider>,
  )
  const logo = fragmentoDelLogo(home)

  it('@s23 ANCLAS: EXACTAMENTE un <h1 y EXACTAMENTE un <a> con data-logo', () => {
    expect(home.split('<h1').length - 1).toBe(1)
    expect(home.match(/<a\b[^>]*\sdata-logo=/g) ?? []).toHaveLength(1)
  })

  it('@s23 el <a> del logo no es ni contiene un encabezado', () => {
    expect(logo).toContain('<svg')
    for (const prohibido of ['<h1', '<h2', '<h3', '<h4', '<h5', '<h6', 'role="heading"']) {
      expect(logo, prohibido).not.toContain(prohibido)
    }
  })

  it('@s23 los ids del rótulo aparecen una vez cada uno y el logo no trae ningún id', () => {
    expect(home.split('id="tinta-marca"').length - 1).toBe(1)
    expect(home.split('id="trazo-marca"').length - 1).toBe(1)
    expect(logo).not.toContain(' id=')
  })

  it('@s23 la puerta de anclas vivas sobre la ruta "/" da 0 violaciones y el logo no apunta a un #ancla', () => {
    expect(inspeccionarAnclas([{ ruta: '/', html: home }])).toEqual([])
    expect(aperturaDelLogo(home)).not.toContain('href="#')
  })
})

describe('@s34 si una entrega trae VARIAS entradas decide la ÚLTIMA; «primera observación» es la primera ENTREGA, no la primera entrada (D-4)', () => {
  const filas: readonly (readonly [
    boolean,
    readonly number[],
    'texto' | 'caligrafia',
    'si' | 'no',
    string,
  ])[] = [
    [true, [400, 73], 'caligrafia', 'si', 'la última está sobre la línea: acopla y vuela'],
    [true, [73, 400], 'texto', 'no', 'la última vuelve a verse: decide ella, no «alguna de ellas»'],
    [
      false,
      [400, 12.5],
      'caligrafia',
      'no',
      'dos entradas en la PRIMERA entrega: carga desplazada',
    ],
  ]

  for (const [conEntregaInicial, bordes, logo, vuelo, caso] of filas) {
    const antecedente = conEntregaInicial
      ? 'tras una entrega inicial a la vista'
      : 'entrega INICIAL'

    it(`@s34 ${antecedente} · entradas ${bordes.join(' y luego ')} en UNA entrega → "${logo}"/"${vuelo}" (${caso})`, () => {
      const io = stubDeIntersectionObserver()
      fijarGeometria()
      montar()

      if (conEntregaInicial) {
        io.entregar(entrada(400, true))
      }
      // isIntersecting no decide (@s6): se da el realista, tocar la línea ya es intersecar.
      io.entregar(...bordes.map((bottom) => entrada(bottom, bottom >= LINEA_DEL_OBSERVADOR.top)))

      const enlace = enlaceDeLaMarca()

      expect(enlace).toHaveAttribute('data-logo', logo)
      expect(enlace).toHaveAttribute('data-vuelo', vuelo)
      expect(io.desconectar).toHaveBeenCalledTimes(logo === 'caligrafia' ? 1 : 0)
    })
  }
})
