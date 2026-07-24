import { readFileSync } from 'node:fs'

import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Home from '../pages/home'
import { candidatasRegistradas } from './carrusel-logica'
import { Galeria } from './Galeria'
import { Resenas } from './Resenas'

/**
 * F-14 — la sección de reseñas: el agregado real de Treatwell en UNA línea discreta y un carrusel
 * coverflow de testimonios PROPIOS de ejemplo que hereda la conducta de la galería v3. Contrato:
 * `features/resenas_agregado_enlace.feature` (@s1..@s9); la conducta del carrusel se hereda POR
 * REFERENCIA de `features/galeria_carrusel.feature` v3 (@s8), leyendo «foto» como «testimonio».
 *
 * REGLAS DURAS (cabeceras de los dos contratos): se asevera por ROL, NOMBRE ACCESIBLE, TEXTO,
 * `data-*` o `style` inline — JAMÁS por clase (`css: false`). Todo literal esperado va ESCRITO A
 * MANO (anti-tautología). Trampas MEDIDAS de jsdom 25: sin `matchMedia`, sin `PointerEvent`, sin
 * `IntersectionObserver` — stubs con captura, patrón `galeria.test.tsx`.
 */

/** La home horneada por SSR (sin ejecutar JavaScript), con el HelmetProvider que el SSG pondría. */
function hornearHome(): string {
  return renderToString(
    <HelmetProvider>
      <Home />
    </HelmetProvider>,
  )
}

describe('@s1 la sección vive ENTRE el equipo y la reserva, como bloque NO navegable', () => {
  it('@s1 el <h2> «Lo que dicen nuestras clientas» va DESPUÉS del de equipo y ANTES del de reserva', () => {
    const horneado = hornearHome()
    // Los tres hitos, escritos A MANO: el h2 de equipo (id equipo-titulo), el nuevo y el de reserva.
    const equipo = horneado.indexOf('id="equipo-titulo"')
    const resenas = horneado.indexOf('Lo que dicen nuestras clientas')
    const reserva = horneado.indexOf('id="reserva-titulo"')

    expect(equipo).toBeGreaterThan(-1)
    expect(resenas).toBeGreaterThan(equipo)
    expect(reserva).toBeGreaterThan(resenas)
  })

  it('@s1 los DOS carruseles quedan SEPARADOS por la reserva: «Nuestros trabajos» sigue detrás de ella', () => {
    const horneado = hornearHome()

    expect(horneado.indexOf('Nuestros trabajos')).toBeGreaterThan(
      horneado.indexOf('id="reserva-titulo"'),
    )
  })

  it('@s1 su elemento raíz es un <div> y NO un <section>, y conserva la clase global demo-seccion', () => {
    // 🔴 Un `<section aria-labelledby>` la haría «sección navegable» y la nav no la enlaza →
    // REGLA_INALCANZABLE (el mismo campo de minas que sorteó la galería).
    const horneado = renderToString(<Resenas />)

    expect(horneado.startsWith('<div')).toBe(true)
    expect(horneado).not.toContain('<section')

    const raiz = /^<div[^>]*class="([^"]*)"/.exec(horneado)

    expect(raiz, 'la raíz no declara class').not.toBeNull()
    expect((raiz as RegExpExecArray)[1]).toContain('demo-seccion')
  })

  it('@s1 no aporta ningún <h1> y aporta EXACTAMENTE UN <h2>', () => {
    const horneado = renderToString(<Resenas />)

    expect((horneado.match(/<h1[\s>]/g) ?? []).length).toBe(0)
    expect((horneado.match(/<h2[\s>]/g) ?? []).length).toBe(1)

    render(<Resenas />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Lo que dicen nuestras clientas',
    )
  })

  it('@s1 no introduce ninguna <nav> ni ningún <a href="#…">: ningún ancla interna nueva', () => {
    // 🔴 Un `<a href="#…">` en los puntos los metería en la puerta de anclas.
    const horneado = renderToString(<Resenas />)

    expect(horneado).not.toContain('<nav')
    expect(horneado).not.toMatch(/<a\s[^>]*href="#/)
  })

  it('@s1 la sección vive dentro de <main> en la home, ENTRE <Equipo /> y <Reserva />', () => {
    // Sobre los BYTES de la página, sin lanzar un build (patrón galeria.test.tsx).
    const home = readFileSync('src/pages/home.tsx', 'utf8')
    const resenas = home.indexOf('<Resenas />')

    expect(resenas).toBeGreaterThan(home.indexOf('<main'))
    expect(home.indexOf('</main>')).toBeGreaterThan(resenas)
    expect(resenas).toBeGreaterThan(home.indexOf('<Equipo />'))
    expect(home.indexOf('<Reserva />')).toBeGreaterThan(resenas)
  })

  it('@s2 @s1 el ÚNICO <a> de la sección es el enlace EXTERNO a Treatwell', () => {
    const { container } = render(<Resenas />)
    const enlaces = [...container.querySelectorAll('a')]

    expect(enlaces).toHaveLength(1)
    expect(enlaces[0].getAttribute('href')).toBe(
      'https://www.treatwell.es/establecimiento/nails-lash-studio/',
    )
  })

  it('@s1 el conjunto de enlaces de la nav NO cambia: la sección no se añade a la navegación', () => {
    const horneado = hornearHome()
    const nav = /<nav\b.*?<\/nav>/s.exec(horneado)

    expect(nav, 'la home no hornea la nav').not.toBeNull()

    const destinos = [...(nav as RegExpExecArray)[0].matchAll(/href="([^"]*)"/g)].map((m) => m[1])

    // Los SIETE destinos de siempre, escritos A MANO. Ni uno más, ni uno de reseñas.
    expect([...new Set(destinos)].sort()).toEqual(
      [
        '#servicios-titulo',
        '#destacados-titulo',
        '#ofertas-titulo',
        '#equipo-titulo',
        '#reserva-titulo',
        '#contacto-titulo',
        '#faq-titulo',
      ].sort(),
    )
  })
})

/* --- @s2 + @s3: el agregado REAL en UNA línea discreta, leído del módulo, jamás hardcodeado. --- */

describe('@s2 el agregado es UNA LÍNEA: plataforma declarada, enlace a la fuente y fecha del dato', () => {
  /** El enlace a Treatwell, y desde él su línea contenedora (el <p> del agregado). */
  function lineaDelAgregado(): HTMLElement {
    render(<Resenas />)
    const enlace = screen.getByRole('link', { name: 'Treatwell' })
    const linea = enlace.closest('p')

    expect(linea, 'el enlace no vive en una línea de texto').not.toBeNull()

    return linea as HTMLElement
  }

  it('@s2 muestra la nota «4,9», el total «1.239 opiniones» y la plataforma «Treatwell» en UNA línea', () => {
    const linea = lineaDelAgregado()
    const texto = linea.textContent ?? ''

    // Los literales van ESCRITOS A MANO; el componente los DERIVA del módulo de @s3 en el render.
    expect(texto).toContain('4,9')
    expect(texto).toContain('1.239 opiniones')
    expect(texto).toContain('Treatwell')
  })

  it('@s2 el enlace apunta EXACTAMENTE a la ficha del salón, con target="_blank" y rel con "noopener"', () => {
    lineaDelAgregado()
    const enlace = screen.getByRole('link', { name: 'Treatwell' })

    expect(enlace.getAttribute('href')).toBe(
      'https://www.treatwell.es/establecimiento/nails-lash-studio/',
    )
    // La convención de los enlaces externos del repo (`Contacto.tsx`): target _blank + noopener.
    expect(enlace).toHaveAttribute('target', '_blank')
    expect(enlace.getAttribute('rel')).toContain('noopener')
    // Y NO empieza por "#": es un enlace EXTERNO, invisible para la puerta de anclas.
    expect(enlace.getAttribute('href')?.startsWith('#')).toBe(false)
  })

  it('@s2 la fecha del dato es VISIBLE en la línea: contiene «23/07/2026»', () => {
    expect(lineaDelAgregado().textContent).toContain('23/07/2026')
  })

  it('@s2 @s7 la nota lleva su texto accesible «4,9 de 5» y las estrellas van decorativas con aria-hidden', () => {
    const linea = lineaDelAgregado()

    expect(linea.textContent).toContain('4,9 de 5')

    const estrellas = linea.querySelector('[aria-hidden="true"]')

    expect(estrellas, 'la línea no lleva estrellas decorativas').not.toBeNull()
    // La fila del agregado: 4,9 redondea ARRIBA — cinco llenas, escritas A MANO.
    expect((estrellas as HTMLElement).textContent).toBe('★★★★★')
  })

  it('@s2 la línea COMPLETA, carácter a carácter: los separadores del JSX no son decorativos', () => {
    // Mata los CUATRO StringLiteral «{\' \'} → {""}» supervivientes del lote
    // (progress/mutation_lote_v3_resenas.md): quitar un espacio pega dos tramos visibles
    // («…Treatwell· dato…») y este toBe — jamás toContain — lo retrata.
    expect(lineaDelAgregado().textContent).toBe(
      '★★★★★ 4,9 de 5 · 1.239 opiniones en Treatwell · dato del 23/07/2026',
    )
  })
})

describe('@s3 el componente LEE el módulo del dato: sus valores salen del objeto, sin segunda copia', () => {
  it('@s3 el horneado pinta nota, total, plataforma, href y fecha derivados del módulo real', () => {
    // La prueba de que «el componente lo lee» la remata Stryker POR VALOR (mutar 4.9 o 1239 en el
    // módulo debe poner en rojo ESTE test); aquí se asevera que los CINCO valores llegan al HTML.
    const horneado = renderToString(<Resenas />)

    expect(horneado).toContain('4,9 de 5')
    expect(horneado).toContain('1.239')
    expect(horneado).toContain('Treatwell')
    expect(horneado).toContain('https://www.treatwell.es/establecimiento/nails-lash-studio/')
    expect(horneado).toContain('23/07/2026')
  })

  it('@s3 en el JSX no vive una segunda copia de ningún valor del agregado: los bytes del componente no traen los literales', () => {
    // Si el JSX llevara su propia copia («4,9», «1.239», la URL…), mutar el módulo no cambiaría el
    // DOM y la mentira quedaría retratada. Se leen los BYTES del componente, escritos A MANO.
    const fuente = readFileSync('src/components/Resenas.tsx', 'utf8')

    expect(fuente).not.toContain('4,9')
    expect(fuente).not.toContain('4.9')
    expect(fuente).not.toContain('1239')
    expect(fuente).not.toContain('1.239')
    expect(fuente).not.toContain('treatwell')
    expect(fuente).not.toContain('Treatwell')
    expect(fuente).not.toContain('2026')
  })
})

/* --- @s5: la leyenda de honestidad, VISIBLE y byte a byte (aviso del art. 20.4 integrado). --- */

// La leyenda ESCRITA A MANO, carácter a carácter, con su «·» y sus acentos (patrón de la nota de
// la galería). Si cambia una coma, cambia el CONTRATO primero.
const LEYENDA_ESPERADA =
  'Testimonios de ejemplo · textos de muestra pendientes de sustituir por reseñas reales de clientas del salón; la nota agregada procede de Treatwell.'

describe('@s5 la leyenda de honestidad es VISIBLE e integra el aviso del art. 20.4', () => {
  it('@s5 el horneado trae el texto EXACTO de la leyenda', () => {
    expect(renderToString(<Resenas />)).toContain(LEYENDA_ESPERADA)
  })

  it('@s5 es texto VISIBLE en el flujo: un elemento la lleva como contenido, no como atributo ni title', () => {
    render(<Resenas />)
    const leyenda = screen.getByText(LEYENDA_ESPERADA)

    expect(leyenda).toBeVisible()
    expect(leyenda).not.toHaveAttribute('aria-hidden')
    expect(leyenda).not.toHaveAttribute('hidden')
  })
})

/* =============================================================================================
 * EL CARRUSEL HEREDADO (@s8): la conducta de `features/galeria_carrusel.feature` v3 APLICA ENTERA
 * leyendo «foto» como «testimonio». Los helpers y los tests REPLICAN el patrón de
 * `galeria.test.tsx` sobre `Resenas.tsx`, con los ids y las etiquetas PROPIOS de este contrato.
 * ============================================================================================= */

// Los SEIS testimonios de EJEMPLO, escritos A MANO (anti-tautología): autora, texto, estrellas y
// nota en texto esperados por tarjeta, en orden del DOM.
const TESTIMONIOS_ESPERADOS: readonly {
  autora: string
  texto: string
  servicio: string
  estrellas: string
  notaEnTexto: string
}[] = [
  {
    autora: 'Carmen',
    texto: 'Pedí una manicura sencilla y acerté de pleno. Dos semanas después sigue intacta.',
    servicio: 'Uñas',
    estrellas: '★★★★★',
    notaEnTexto: '5 de 5',
  },
  {
    autora: 'Silvia',
    texto: 'Las extensiones quedaron ligeras y naturales. Nadie diría que no son mías.',
    servicio: 'Pestañas',
    estrellas: '★★★★★',
    notaEnTexto: '5 de 5',
  },
  {
    autora: 'Rocío',
    texto: 'Me diseñaron las cejas respetando mi forma natural. El resultado me encanta.',
    servicio: 'Cejas',
    estrellas: '★★★★☆',
    notaEnTexto: '4 de 5',
  },
  {
    autora: 'Teresa',
    texto: 'Llevé una foto de inspiración y lo bordaron. Cada uña es una pequeña obra.',
    servicio: 'Nail art',
    estrellas: '★★★★★',
    notaEnTexto: '5 de 5',
  },
  {
    autora: 'Irene',
    texto: 'La pedicura más completa que me han hecho. Salí como nueva.',
    servicio: 'Pedicura',
    estrellas: '★★★★★',
    notaEnTexto: '5 de 5',
  },
  {
    autora: 'Mónica',
    texto: 'Reservé a última hora y me atendieron igual de bien. Volveré con mi hermana.',
    servicio: 'Uñas',
    estrellas: '★★★★☆',
    notaEnTexto: '4 de 5',
  },
]

/** Las seis tarjetas, en ORDEN DEL DOM (nunca se reordenan: solo cambian sus atributos). */
function tarjetasDe(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[data-distancia]')]
}

/** La clave de posición de cada tarjeta, en orden del DOM. */
function distanciasDe(container: HTMLElement): (string | undefined)[] {
  return tarjetasDe(container).map((t) => t.dataset.distancia)
}

/** El índice (0-based) de la tarjeta centrada, o -1 si no hay ninguna. */
function centrada(container: HTMLElement): number {
  return distanciasDe(container).indexOf('0')
}

/** El contenedor de diapositivas (el que lleva el aria-live), por su id PROPIO. */
function pistaDe(container: HTMLElement): HTMLElement {
  return container.querySelector('#resenas-pista') as HTMLElement
}

/** El carrusel: el elemento que recibe el ratón y el foco. */
function carruselDe(container: HTMLElement): HTMLElement {
  return container.querySelector('[aria-roledescription="carrusel"]') as HTMLElement
}

describe('@s8 (@s5 de galería) cada tarjeta publica su posición en atributos CONSULTABLES', () => {
  // La tabla heredada, con la PRIMERA centrada. Los doce valores van ESCRITOS A MANO.
  it.each([
    { testimonio: '1º', indice: 0, distancia: '0', s: '0' },
    { testimonio: '2º', indice: 1, distancia: '1', s: '1' },
    { testimonio: '3º', indice: 2, distancia: '2', s: '1' },
    { testimonio: '4º', indice: 3, distancia: '3', s: '1' },
    { testimonio: '5º', indice: 4, distancia: '2', s: '-1' },
    { testimonio: '6º', indice: 5, distancia: '1', s: '-1' },
  ])(
    '@s8 recién montado, la tarjeta del testimonio $testimonio expone data-distancia="$distancia" y --s: $s',
    ({ indice, distancia, s }) => {
      const { container } = render(<Resenas />)
      const tarjeta = tarjetasDe(container)[indice]

      expect(tarjeta.dataset.distancia).toBe(distancia)
      expect(tarjeta.style.getPropertyValue('--s')).toBe(s)
    },
  )

  it('@s8 las seis tarjetas llevan z-index inline MAYOR QUE CERO, decreciente con la distancia', () => {
    const { container } = render(<Resenas />)
    const porDistancia = new Map<string, number[]>()

    for (const tarjeta of tarjetasDe(container)) {
      const capa = Number(tarjeta.style.zIndex)

      expect(capa).toBeGreaterThan(0)
      const clave = tarjeta.dataset.distancia as string

      porDistancia.set(clave, [...(porDistancia.get(clave) ?? []), capa])
    }

    for (const capas of porDistancia.values()) {
      expect(new Set(capas).size).toBe(1)
    }
    const capaDeClave = (clave: string) => (porDistancia.get(clave) as number[])[0]

    expect(capaDeClave('0')).toBeGreaterThan(capaDeClave('1'))
    expect(capaDeClave('1')).toBeGreaterThan(capaDeClave('2'))
    expect(capaDeClave('2')).toBeGreaterThan(capaDeClave('3'))
  })

  it('@s8 EXACTAMENTE UNA de las seis tarjetas expone data-distancia="0"', () => {
    const { container } = render(<Resenas />)

    expect(distanciasDe(container).filter((d) => d === '0')).toEqual(['0'])
  })
})

describe('@s8 (@s6 de galería) el carrusel se anuncia como carrusel, con sus ids y etiquetas PROPIOS', () => {
  it('@s8 el contenedor expone role="group" + aria-roledescription="carrusel" y se llama «Lo que dicen nuestras clientas»', () => {
    render(<Resenas />)
    const carrusel = screen.getByRole('group', { name: 'Lo que dicen nuestras clientas' })

    expect(carrusel).toHaveAttribute('aria-roledescription', 'carrusel')
    // Lo nombra el <h2> de @s1, por aria-labelledby: dos carruseles no comparten NINGÚN id.
    const titulo = screen.getByRole('heading', { level: 2, name: 'Lo que dicen nuestras clientas' })

    expect(carrusel.getAttribute('aria-labelledby')).toBe(titulo.id)
    expect(titulo.id).not.toBe('')
  })

  it('@s8 NO expone role="region": el bloque es NO NAVEGABLE', () => {
    const { container } = render(<Resenas />)

    expect(container.querySelector('[role="region"]')).toBeNull()
  })

  it('@s8 hay SEIS diapositivas con role="group", aria-roledescription="diapositiva" y nombres «n de 6»', () => {
    const { container } = render(<Resenas />)
    const diapositivas = tarjetasDe(container)

    expect(diapositivas).toHaveLength(6)
    expect(diapositivas.map((d) => d.getAttribute('aria-label'))).toEqual([
      '1 de 6',
      '2 de 6',
      '3 de 6',
      '4 de 6',
      '5 de 6',
      '6 de 6',
    ])
    for (const diapositiva of diapositivas) {
      expect(diapositiva).toHaveAttribute('role', 'group')
      expect(diapositiva).toHaveAttribute('aria-roledescription', 'diapositiva')
    }
  })

  it('@s8 NINGUNA diapositiva expone aria-hidden, ni siquiera la que está a distancia 3', () => {
    const { container } = render(<Resenas />)

    for (const diapositiva of tarjetasDe(container)) {
      expect(diapositiva).not.toHaveAttribute('aria-hidden')
    }
  })
})

describe('@s4 @s9 las tarjetas llevan TEXTO propio: cita + autora + servicio + estrellas, sin una sola <img>', () => {
  it('@s9 la sección NO contiene NINGUNA "<img": las tarjetas son de texto', () => {
    expect(renderToString(<Resenas />)).not.toContain('<img')
  })

  it('@s4 el HTML muestra los SEIS textos de ejemplo — escritos A MANO — con su autora y su servicio', () => {
    const horneado = renderToString(<Resenas />)

    for (const { autora, texto, servicio } of TESTIMONIOS_ESPERADOS) {
      expect(horneado).toContain(texto)
      expect(horneado).toContain(autora)
      expect(horneado).toContain(servicio)
    }
  })

  it('@s4 y NINGÚN otro texto de testimonio: seis diapositivas exactas y ni un texto del reviewPool de #equipo', () => {
    const { container } = render(<Resenas />)

    expect(tarjetasDe(container)).toHaveLength(6)

    // Dos calas del reviewPool de equipo-demo, escritas A MANO: si un texto de #equipo apareciera
    // aquí, las dos secciones mostrarían «a la misma clienta» (la disyunción completa, en
    // resenas-demo.test.ts, compara las DOS fuentes de producción entre sí).
    const horneado = renderToString(<Resenas />)

    expect(horneado).not.toContain('Un trato espectacular y un resultado perfecto.')
    expect(horneado).not.toContain('María L.')
  })

  it('@s7 cada tarjeta lleva sus estrellas decorativas aria-hidden y su nota EN TEXTO, las dos A MANO', () => {
    const { container } = render(<Resenas />)
    const tarjetas = tarjetasDe(container)

    TESTIMONIOS_ESPERADOS.forEach(({ estrellas, notaEnTexto }, indice) => {
      const glifos = tarjetas[indice].querySelector('[aria-hidden="true"]')

      expect(glifos, `la tarjeta ${indice + 1} no lleva estrellas decorativas`).not.toBeNull()
      expect((glifos as HTMLElement).textContent).toBe(estrellas)
      expect(tarjetas[indice].textContent).toContain(notaEnTexto)
    })
  })

  it('@s7 la línea de valoración COMPLETA de tarjetas CONOCIDAS, carácter a carácter, una por rama del redondeo', () => {
    // Mata el quinto StringLiteral «{\' \'} → {""}» del informe de mutación del lote (el espacio
    // entre las estrellas y la nota de CADA tarjeta): el textContent ENTERO del <p> de
    // valoración, con toBe, jamás toContain.
    render(<Resenas />)

    const valoracionDe = (cita: string): string => {
      const lamina = screen.getByText(cita).parentElement as HTMLElement
      const glifos = lamina.querySelector('[aria-hidden="true"]') as HTMLElement

      return (glifos.parentElement as HTMLElement).textContent ?? ''
    }

    // Una tarjeta de nota 5 (Carmen) y una de nota 4 (Rocío), con sus citas escritas A MANO.
    expect(
      valoracionDe(
        'Pedí una manicura sencilla y acerté de pleno. Dos semanas después sigue intacta.',
      ),
    ).toBe('★★★★★ 5 de 5')
    expect(
      valoracionDe('Me diseñaron las cejas respetando mi forma natural. El resultado me encanta.'),
    ).toBe('★★★★☆ 4 de 5')
  })
})

/* --- @s8 (@s16..@s19 de galería): la navegación manual — flechas, puntos, clic lateral, arrastre. --- */

describe('@s8 (@s17 de galería) los puntos hablan de testimonios y marcan el actual con aria-disabled', () => {
  /** Los seis puntos indicadores, en orden del DOM, por el nombre PROPIO del grupo. */
  function puntosDe(): HTMLElement[] {
    const grupo = screen.getByRole('group', { name: 'Elegir el testimonio que se muestra' })

    return [...grupo.querySelectorAll<HTMLElement>('button')]
  }

  it('@s8 pulsar «Ver el testimonio 5 de 6» centra el QUINTO', () => {
    const { container } = render(<Resenas />)

    fireEvent.click(screen.getByRole('button', { name: 'Ver el testimonio 5 de 6' }))

    expect(centrada(container)).toBe(4)
    expect(distanciasDe(container).filter((d) => d === '0')).toEqual(['0'])
  })

  it('@s8 el punto pulsado pasa a aria-disabled="true" y el del 1º deja de exponerlo; EXACTAMENTE UNO marcado', () => {
    render(<Resenas />)
    const primero = screen.getByRole('button', { name: 'Ver el testimonio 1 de 6' })
    const quinto = screen.getByRole('button', { name: 'Ver el testimonio 5 de 6' })

    expect(primero).toHaveAttribute('aria-disabled', 'true')
    expect(quinto).not.toHaveAttribute('aria-disabled')

    fireEvent.click(quinto)

    expect(quinto).toHaveAttribute('aria-disabled', 'true')
    expect(primero).not.toHaveAttribute('aria-disabled')
    expect(puntosDe().filter((p) => p.getAttribute('aria-disabled') === 'true')).toHaveLength(1)
  })

  it('@s8 los seis son <button type="button"> tabulables, con sus nombres «Ver el testimonio N de 6» en orden', () => {
    render(<Resenas />)
    const puntos = puntosDe()

    expect(puntos).toHaveLength(6)
    for (const punto of puntos) {
      expect(punto).toHaveAttribute('type', 'button')
      expect(punto).not.toBeDisabled()
      expect(punto).not.toHaveAttribute('disabled')
    }
    expect(puntos.map((p) => p.getAttribute('aria-label'))).toEqual([
      'Ver el testimonio 1 de 6',
      'Ver el testimonio 2 de 6',
      'Ver el testimonio 3 de 6',
      'Ver el testimonio 4 de 6',
      'Ver el testimonio 5 de 6',
      'Ver el testimonio 6 de 6',
    ])
  })

  it('@s8 data-actual marca «sí» SOLO en el punto actual: el gancho del estado visual (SC 1.4.11)', () => {
    render(<Resenas />)

    expect(puntosDe().map((p) => p.dataset.actual)).toEqual(['sí', 'no', 'no', 'no', 'no', 'no'])

    fireEvent.click(screen.getByRole('button', { name: 'Ver el testimonio 4 de 6' }))

    expect(puntosDe().map((p) => p.dataset.actual)).toEqual(['no', 'no', 'no', 'sí', 'no', 'no'])
  })
})

describe('@s8 (@s18 de galería) pulsar una tarjeta lateral la trae al centro, sin reordenar el DOM', () => {
  it('@s8 con el 1º centrado, pulsar el TERCERO (a distancia +2) lo centra y manda el 1º a "2" con --s "-1"', () => {
    const { container } = render(<Resenas />)
    const tarjetas = tarjetasDe(container)

    expect(tarjetas[2].dataset.distancia).toBe('2')

    fireEvent.click(tarjetas[2])

    expect(tarjetas[2].dataset.distancia).toBe('0')
    expect(tarjetas[2].style.getPropertyValue('--s')).toBe('0')
    expect(tarjetas[0].dataset.distancia).toBe('2')
    expect(tarjetas[0].style.getPropertyValue('--s')).toBe('-1')
  })

  it('@s8 el orden del DOM de las seis diapositivas sigue siendo 1..6: solo cambian los atributos', () => {
    const { container } = render(<Resenas />)
    const nombresIniciales = tarjetasDe(container).map((t) => t.getAttribute('aria-label'))

    fireEvent.click(tarjetasDe(container)[4])

    expect(tarjetasDe(container).map((t) => t.getAttribute('aria-label'))).toEqual(nombresIniciales)
    // Y las citas siguen en su orden original: el bucle NO reordena ni clona.
    const citas = TESTIMONIOS_ESPERADOS.map(({ texto }) => texto)

    tarjetasDe(container).forEach((tarjeta, indice) => {
      expect(tarjeta.textContent).toContain(citas[indice])
    })
  })
})

/** El MARCO del carrusel: el ancestro con el recorte, padre del escenario `#resenas-pista`. */
function marcoDe(container: HTMLElement): HTMLElement {
  return pistaDe(container).parentElement as HTMLElement
}

/**
 * Un gesto de arrastre: baja en `bajadaX` y sube en `subidaX`. [MEDIDO, contrato de galería] jsdom
 * 25 no implementa la CLASE `PointerEvent`, pero React registra los pointer events por NOMBRE.
 */
function arrastrar(objetivo: HTMLElement, bajadaX: number, subidaX: number): void {
  fireEvent(objetivo, new MouseEvent('pointerdown', { bubbles: true, clientX: bajadaX }))
  fireEvent(objetivo, new MouseEvent('pointerup', { bubbles: true, clientX: subidaX }))
}

describe('@s8 (@s19 de galería) arrastrar sobre el marco mueve UN testimonio, con la frontera INCLUSIVA en 48 píxeles', () => {
  it('@s8 48 px a la IZQUIERDA (200 → 152) son EXACTAMENTE el umbral: traen el SIGUIENTE', () => {
    const { container } = render(<Resenas />)

    arrastrar(marcoDe(container), 200, 152)

    expect(centrada(container)).toBe(1)
  })

  it('@s8 48 px a la DERECHA (200 → 248) traen el ANTERIOR: la dirección del carrusel táctil', () => {
    const { container } = render(<Resenas />)

    arrastrar(marcoDe(container), 200, 248)

    expect(centrada(container)).toBe(5)
  })

  it('@s8 47 px (200 → 153) quedan POR DEBAJO del umbral: no se mueve NADA', () => {
    const { container } = render(<Resenas />)

    arrastrar(marcoDe(container), 200, 153)

    expect(centrada(container)).toBe(0)
  })

  it('@s8 un gesto larguísimo (400 → 40) mueve EXACTAMENTE UNA posición', () => {
    const { container } = render(<Resenas />)

    arrastrar(marcoDe(container), 400, 40)

    expect(centrada(container)).toBe(1)
  })

  it('@s8 el gesto largo sobre una tarjeta lateral GANA a su click sintetizado: decide el ARRASTRE', () => {
    const { container } = render(<Resenas />)
    const tarjetas = tarjetasDe(container)

    arrastrar(tarjetas[2], 300, 200)
    fireEvent.click(tarjetas[2])

    expect(centrada(container)).toBe(1)
    expect(tarjetas[2].dataset.distancia).toBe('1')
  })

  it('@s8 el toque corto (baja y sube en el MISMO clientX) sobre una lateral la sigue centrando', () => {
    // ANTI-VACUIDAD heredada: el contraejemplo que impide matar el clic de centrar para siempre.
    const { container } = render(<Resenas />)
    const tarjetas = tarjetasDe(container)

    arrastrar(tarjetas[2], 300, 300)
    fireEvent.click(tarjetas[2])

    expect(centrada(container)).toBe(2)
  })
})

/* --- @s8 (@s7..@s12 y @s20 de galería): el autoplay, sus pausas y el reloj que se reinicia. --- */

/** Avanza el reloj FALSO dentro de `act`, para que React aplique los cambios de estado. */
function avanzar(milisegundos: number): void {
  act(() => {
    vi.advanceTimersByTime(milisegundos)
  })
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('@s8 (@s7 de galería) la voz de la pista se calla mientras rota sola y habla cuando manda el usuario', () => {
  it('@s8 recién montada (rotando, sin foco) la pista expone aria-live="off" y aria-atomic="false"', () => {
    const { container } = render(<Resenas />)

    expect(pistaDe(container)).toHaveAttribute('aria-live', 'off')
    expect(pistaDe(container)).toHaveAttribute('aria-atomic', 'false')
  })

  it('@s8 parada (el ratón dentro del carrusel), pasa a aria-live="polite": los cambios los provoca él', () => {
    // [ENMIENDA 4, 2026-07-24] El control de rotación que paraba con un clic ya NO existe: la fila
    // «rotando=no, foco=no» sigue siendo ALCANZABLE sin él, basta con que el ratón esté DENTRO del
    // carrusel (`raton=true`, patrón `galeria.test.tsx`).
    const { container } = render(<Resenas />)

    fireEvent.mouseEnter(carruselDe(container))

    expect(pistaDe(container)).toHaveAttribute('aria-live', 'polite')
  })
})

describe('@s8 (@s9 de galería) el testimonio centrado cambia cada 2 segundos, ni antes, con la vuelta al MISMO ritmo', () => {
  it('@s8 a los 1999 ms sigue el PRIMERO; a los 2000 queda el SEGUNDO (y el 1º a distancia -1)', () => {
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    avanzar(1999)

    expect(centrada(container)).toBe(0)

    avanzar(1)

    expect(centrada(container)).toBe(1)
    expect(tarjetasDe(container)[0].dataset.distancia).toBe('1')
    expect(tarjetasDe(container)[0].style.getPropertyValue('--s')).toBe('-1')
  })

  it('@s8 otros 2000 ms centran el TERCERO, y a los 12000 ms del arranque vuelve el PRIMERO', () => {
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    avanzar(4000)

    expect(centrada(container)).toBe(2)

    avanzar(8000)

    expect(centrada(container)).toBe(0)
  })

  it('@s8 la cadencia es LA MISMA CONSTANTE compartida: Resenas.tsx la importa de carrusel-logica y no guarda una segunda copia del 2000', () => {
    const fuente = readFileSync('src/components/Resenas.tsx', 'utf8')

    expect(fuente).toMatch(
      /import\s*\{[^}]*MILISEGUNDOS_POR_FOTO[^}]*\}\s*from\s*'\.\/carrusel-logica'/s,
    )
    expect(fuente).not.toContain('2000')
  })
})

describe('@s8 (@s20 de galería) cualquier desplazamiento manual REINICIA el reloj', () => {
  it('@s8 el punto «Ver el testimonio 2 de 6» en t=1500: el 2º queda EN EL ACTO, en t=3499 sigue y en t=3500 llega el 3º', () => {
    // [ENMIENDA 4, 2026-07-24] El `When` usaba el botón «Siguiente» (RETIRADO, @s16 de galería):
    // se sustituye por el punto indicador del 2º testimonio, mismo efecto por la misma vía.
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    avanzar(1500)
    fireEvent.click(screen.getByRole('button', { name: 'Ver el testimonio 2 de 6' }))

    expect(centrada(container)).toBe(1)

    avanzar(1999)

    expect(centrada(container)).toBe(1)

    avanzar(1)

    expect(centrada(container)).toBe(2)
  })

  it('@s8 un punto indicador en t=1500 da el MISMO resultado: el 5º al acto, y el 6º en t=3500', () => {
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    avanzar(1500)
    fireEvent.click(screen.getByRole('button', { name: 'Ver el testimonio 5 de 6' }))

    expect(centrada(container)).toBe(4)

    avanzar(1999)

    expect(centrada(container)).toBe(4)

    avanzar(1)

    expect(centrada(container)).toBe(5)
  })

  it('@s8 un arrastre por encima del umbral en t=1500 da el MISMO resultado: el 2º al acto, el 3º en t=3500', () => {
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    avanzar(1500)
    arrastrar(marcoDe(container), 200, 152)

    expect(centrada(container)).toBe(1)

    avanzar(1999)

    expect(centrada(container)).toBe(1)

    avanzar(1)

    expect(centrada(container)).toBe(2)
  })

  it('@s8 en un carrusel parado por `prefers-reduced-motion` (única parada que sobrevive), el desplazamiento manual NO arranca nada', () => {
    // [ENMIENDA 4, 2026-07-24] El botón que paraba «por el usuario» ya NO EXISTE (@s8/@s11 de
    // galería, RETIRADOS): la única parada persistente que sobrevive es `prefers-reduced-motion`.
    vi.stubGlobal('matchMedia', (consulta: string) => ({
      matches: consulta === '(prefers-reduced-motion: reduce)',
      media: consulta,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    fireEvent.click(screen.getByRole('button', { name: 'Ver el testimonio 2 de 6' }))

    expect(centrada(container)).toBe(1)

    avanzar(12000)

    expect(centrada(container)).toBe(1)
  })
})

describe('@s8 (@s10 de galería) el ratón reanuda la rotación al salir; el foco de teclado NO', () => {
  it('@s8 el PUNTERO para mientras está dentro y REANUDA sola al salir', () => {
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    fireEvent.mouseEnter(carruselDe(container))
    avanzar(8000)

    expect(centrada(container)).toBe(0)

    fireEvent.mouseLeave(carruselDe(container))
    avanzar(2000)

    expect(centrada(container)).toBe(1)
  })

  it('@s8 el FOCO de teclado para, y al salir NO reanuda sola: pegajosa PERMANENTE, nada la devuelve', () => {
    // [ENMIENDA 4, 2026-07-24] El botón «Iniciar» que antes revertía esta pausa YA NO EXISTE
    // (@s11 de galería, RETIRADO). El foco se posa sobre CUALQUIER tabulable del carrusel: un
    // punto indicador (@s17 de galería).
    vi.useFakeTimers()
    const { container } = render(<Resenas />)
    const punto = screen.getByRole('button', { name: 'Ver el testimonio 1 de 6' })

    fireEvent.focus(punto)
    avanzar(8000)

    expect(centrada(container)).toBe(0)

    fireEvent.blur(punto)
    avanzar(2000)

    expect(centrada(container)).toBe(0)
  })
})

describe('@s8 (@s12 de galería) con movimiento reducido arranca PAUSADO y la preferencia se escucha EN CALIENTE', () => {
  /** El `matchMedia` que jsdom 25 NO trae, con los dos listeners ESPIADOS (patrón galeria.test.tsx). */
  function stubDeMatchMedia(conPreferencia: boolean) {
    const escuchar = vi.fn()
    const dejarDeEscuchar = vi.fn()
    // Espiado (no una función suelta): mata el `StringLiteral` que vaciaría la consulta real
    // (`'(prefers-reduced-motion: reduce)' -> ''`), invisible mientras nada comprobara con QUÉ
    // argumento se llamó de verdad a `matchMedia` (mismo patrón que `galeria.test.tsx`).
    const matchMedia = vi.fn((consulta: string) => ({
      matches: conPreferencia && consulta === '(prefers-reduced-motion: reduce)',
      media: consulta,
      addEventListener: escuchar,
      removeEventListener: dejarDeEscuchar,
    }))

    vi.stubGlobal('matchMedia', matchMedia)

    return { escuchar, dejarDeEscuchar, matchMedia }
  }

  /** El manejador que el carrusel registró con addEventListener('change'). */
  function manejadorDelCambio(
    escuchar: ReturnType<typeof vi.fn>,
  ): (cambio: { matches: boolean }) => void {
    expect(escuchar).toHaveBeenCalledWith('change', expect.any(Function))

    return escuchar.mock.calls[0][1] as (cambio: { matches: boolean }) => void
  }

  it('@s8 window.matchMedia se consulta con la media query EXACTA de movimiento reducido', () => {
    // Sin esta comprobación, el mutante `StringLiteral` que cambia la consulta real por `''`
    // sobrevive: ningún test comprobaba con QUÉ argumento llegaba la llamada de verdad.
    const { matchMedia } = stubDeMatchMedia(true)
    render(<Resenas />)

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('@s8 a los 12000 ms sigue centrado el PRIMERO: arrancó pausado y no se movió ni una posición', () => {
    stubDeMatchMedia(true)
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    // Checkpoint a un tiempo NO múltiplo de 12000 (6×2000, la vuelta completa): sin esta
    // comprobación intermedia, si el arranque pausado no pausara nada, el reloj seguiría rotando y
    // volvería a caer en el PRIMERO tras una vuelta entera — el `Then` final pasaría igual (mismo
    // patrón que @s8 (@s10 de galería), `avanzar(8000)`).
    avanzar(2000)

    expect(centrada(container)).toBe(0)

    avanzar(10000)

    expect(centrada(container)).toBe(0)
  })

  it('@s8 [ENMIENDA 4] bajo esta preferencia YA NO EXISTE ninguna forma de arrancar la rotación: ni por control (retirado) ni por ningún otro gesto de la UI', () => {
    // El desplazamiento MANUAL (un punto indicador) sigue moviendo el testimonio EN EL ACTO, pero
    // el reloj automático sigue sin correr: la parada es PERMANENTE mientras dure la página.
    stubDeMatchMedia(true)
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    fireEvent.click(screen.getByRole('button', { name: 'Ver el testimonio 2 de 6' }))

    expect(centrada(container)).toBe(1)

    avanzar(12000)

    expect(centrada(container)).toBe(1)
  })

  it('@s8 sin la preferencia, el carrusel arranca ROTANDO', () => {
    stubDeMatchMedia(false)
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    avanzar(2000)

    expect(centrada(container)).toBe(1)
  })

  it('@s8 activar la preferencia con la página abierta pausa la rotación EN CURSO', () => {
    const { escuchar } = stubDeMatchMedia(false)
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    avanzar(2000)
    expect(centrada(container)).toBe(1)

    act(() => manejadorDelCambio(escuchar)({ matches: true }))

    // Checkpoint a un tiempo NO múltiplo de 12000 tras la pausa: si el listener `change` no
    // pausara nada, aquí ya habría avanzado varios pasos (mismo patrón que @s8 (@s10 de galería),
    // `avanzar(8000)`). Sin esta comprobación, saltar directo a `avanzar(12000)` cae en el MISMO
    // testimonio por una vuelta entera y no distingue «pausado» de «dio una vuelta entera sin parar».
    avanzar(8000)

    expect(centrada(container)).toBe(1)

    avanzar(4000)

    expect(centrada(container)).toBe(1)
  })

  it('@s8 un cambio que DESACTIVA la preferencia NO pausa una rotación en curso', () => {
    const { escuchar } = stubDeMatchMedia(false)
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    act(() => manejadorDelCambio(escuchar)({ matches: false }))
    avanzar(2000)

    expect(centrada(container)).toBe(1)
  })

  it('@s8 [AJUSTADO ENMIENDA 4] un cambio que DESACTIVA la preferencia no reanuda nada: la pausa es DEFINITIVA por NINGUNA vía', () => {
    const { escuchar } = stubDeMatchMedia(true)
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    act(() => manejadorDelCambio(escuchar)({ matches: false }))
    avanzar(12000)

    expect(centrada(container)).toBe(0)
  })

  it('@s8 al desmontar, removeEventListener recibe EXACTAMENTE el manejador registrado con "change"', () => {
    const { escuchar, dejarDeEscuchar } = stubDeMatchMedia(true)
    const { unmount } = render(<Resenas />)

    expect(escuchar).toHaveBeenCalledTimes(1)
    const manejador = manejadorDelCambio(escuchar)

    expect(dejarDeEscuchar).not.toHaveBeenCalled()

    unmount()

    expect(dejarDeEscuchar).toHaveBeenCalledTimes(1)
    expect(dejarDeEscuchar).toHaveBeenCalledWith('change', manejador)
  })
})

/* --- @s8 (@s21..@s23 de galería): el teclado global — decisión COMPARTIDA, cableado PROPIO. --- */

/**
 * Una tecla REAL sobre el documento (el listener del cableado vive ahí, no en React). Se devuelve
 * el evento para leer `defaultPrevented`: la línea roja heredada es que preventDefault llegue SOLO
 * cuando se atiende.
 */
function pulsarTecla(opciones: KeyboardEventInit): KeyboardEvent {
  const evento = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...opciones })

  act(() => {
    document.dispatchEvent(evento)
  })

  return evento
}

describe('@s8 (@s23 de galería) el foco DENTRO del carrusel de reseñas atiende el teclado por sí solo', () => {
  it('@s8 con el foco sobre CUALQUIER tabulable (un punto indicador), ArrowLeft centra el ANTERIOR y ESE evento recibe preventDefault', () => {
    // jsdom NO trae IntersectionObserver y aquí NO se stubea: el foco dentro basta.
    // [ENMIENDA 4] El foco se posaba sobre «Siguiente» (RETIRADO, @s16 de galería) SOLO como
    // cualquier elemento tabulable: un punto indicador cumple el mismo papel.
    const { container } = render(<Resenas />)

    fireEvent.focus(screen.getByRole('button', { name: 'Ver el testimonio 1 de 6' }))
    const evento = pulsarTecla({ key: 'ArrowLeft' })

    expect(centrada(container)).toBe(5)
    expect(evento.defaultPrevented).toBe(true)
  })

  it('@s8 cuando el foco SALE deja de atender: ArrowLeft ya no mueve ni recibe preventDefault', () => {
    const { container } = render(<Resenas />)
    const punto = screen.getByRole('button', { name: 'Ver el testimonio 1 de 6' })

    fireEvent.focus(punto)
    fireEvent.blur(punto)
    const evento = pulsarTecla({ key: 'ArrowLeft' })

    expect(centrada(container)).toBe(0)
    expect(evento.defaultPrevented).toBe(false)
  })

  it('@s8 montar, teclear y desmontar SIN IntersectionObserver no lanza ningún error, y sin foco nada se mueve', () => {
    const { container, unmount } = render(<Resenas />)

    const evento = pulsarTecla({ key: 'ArrowRight' })

    expect(centrada(container)).toBe(0)
    expect(evento.defaultPrevented).toBe(false)
    expect(() => unmount()).not.toThrow()
  })
})

/**
 * El IntersectionObserver que jsdom 25 NO trae (trampa MEDIDA, brief v3 §7): stub con CAPTURA del
 * callback y de las opciones, y disparo manual de entradas — patrón `galeria.test.tsx`. Las
 * entradas llevan sus rects REALES (`boundingClientRect`/`rootBounds`): el cableado MIDE la
 * distancia al centro de la entrada, nada de ceros fijos (hallazgo 1 del judge del lote).
 */
function stubDeIntersectionObserver() {
  const observar = vi.fn()
  const desconectar = vi.fn()
  const capturado: {
    callback: ((entradas: unknown[]) => void) | null
    opciones: unknown
  } = { callback: null, opciones: null }

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = observar
      disconnect = desconectar

      constructor(callback: (entradas: unknown[]) => void, opciones: unknown) {
        capturado.callback = callback
        capturado.opciones = opciones
      }
    },
  )

  /** El marco (rootBounds) mide 800 px con el centro en 400; la caja se posa a 120 px del centro
   * — una geometría cualquiera y NO cero, para que un cero fijo no pase desapercibido. */
  function verSeccion(intersectionRatio: number): void {
    expect(capturado.callback, 'el carrusel no construyó ningún observador').not.toBeNull()
    act(() => {
      ;(capturado.callback as (entradas: unknown[]) => void)([
        {
          isIntersecting: intersectionRatio > 0,
          intersectionRatio,
          target: observar.mock.calls[0]?.[0] ?? null,
          boundingClientRect: { top: 370, height: 300 },
          rootBounds: { top: 0, height: 800 },
        },
      ])
    })
  }

  return { observar, desconectar, capturado, verSeccion }
}

describe('@s8 (@s23 de galería) la sección suficientemente visible atiende; bajo el umbral, la tecla es de la página', () => {
  it('@s8 tras una entrada con ratio 0.8, ArrowRight centra el SIGUIENTE con preventDefault, y el umbral del observador es 0.6', () => {
    const { verSeccion, capturado } = stubDeIntersectionObserver()
    const { container } = render(<Resenas />)

    // El observador se construye con el MISMO umbral que la decisión pura, escrito A MANO.
    expect(capturado.opciones).toEqual({ threshold: [0.6] })

    verSeccion(0.8)
    const evento = pulsarTecla({ key: 'ArrowRight' })

    expect(centrada(container)).toBe(1)
    expect(evento.defaultPrevented).toBe(true)
  })

  it('@s8 el MISMO keydown con ctrlKey NO mueve y NO recibe preventDefault', () => {
    const { verSeccion } = stubDeIntersectionObserver()
    const { container } = render(<Resenas />)

    verSeccion(0.8)
    const evento = pulsarTecla({ key: 'ArrowRight', ctrlKey: true })

    expect(centrada(container)).toBe(0)
    expect(evento.defaultPrevented).toBe(false)
  })

  it('@s8 tras una entrada con ratio 0.4, ArrowLeft NO mueve y NO recibe preventDefault: el scroll no se secuestra', () => {
    const { verSeccion } = stubDeIntersectionObserver()
    const { container } = render(<Resenas />)

    verSeccion(0.4)
    const evento = pulsarTecla({ key: 'ArrowLeft' })

    expect(centrada(container)).toBe(0)
    expect(evento.defaultPrevented).toBe(false)
  })

  it('@s8 con un campo de texto activo la flecha es del CURSOR: ni mueve ni recibe preventDefault', () => {
    // El caso del chat de #reserva (escribe en un <input>): el foco REAL se mueve con .focus().
    const { verSeccion } = stubDeIntersectionObserver()
    const { container } = render(
      <>
        <Resenas />
        <input aria-label="Tu nombre" />
      </>,
    )

    verSeccion(0.8)
    act(() => {
      screen.getByRole('textbox', { name: 'Tu nombre' }).focus()
    })
    const evento = pulsarTecla({ key: 'ArrowRight' })

    expect(centrada(container)).toBe(0)
    expect(evento.defaultPrevented).toBe(false)
  })

  it('@s8 una tecla atendida REINICIA el reloj: ArrowRight en t=1500 ⇒ avance automático en t=3500', () => {
    const { verSeccion } = stubDeIntersectionObserver()
    vi.useFakeTimers()
    const { container } = render(<Resenas />)

    verSeccion(0.8)
    avanzar(1500)
    pulsarTecla({ key: 'ArrowRight' })

    expect(centrada(container)).toBe(1)

    avanzar(1999)

    expect(centrada(container)).toBe(1)

    avanzar(1)

    expect(centrada(container)).toBe(2)
  })

  it('@s8 al desmontar se limpia TODO: el manejador de "keydown" registrado y el disconnect del observador', () => {
    const { desconectar } = stubDeIntersectionObserver()
    const escuchar = vi.spyOn(document, 'addEventListener')
    const dejarDeEscuchar = vi.spyOn(document, 'removeEventListener')
    const { unmount } = render(<Resenas />)

    const registros = escuchar.mock.calls.filter(([tipo]) => tipo === 'keydown')

    expect(registros).toHaveLength(1)
    expect(desconectar).not.toHaveBeenCalled()

    unmount()

    const bajas = dejarDeEscuchar.mock.calls.filter(([tipo]) => tipo === 'keydown')

    expect(bajas).toHaveLength(1)
    expect(bajas[0][1]).toBe(registros[0][1])
    expect(desconectar).toHaveBeenCalledTimes(1)

    escuchar.mockRestore()
    dejarDeEscuchar.mockRestore()
  })
})

/* --- @s8 el And de la desambiguación (@s22 de galería): DOS carruseles, UNA decisión. --- */

/**
 * Stub del IO que captura TODOS los observadores construidos (uno por carrusel), con el elemento
 * observado de cada uno: las entradas se disparan sobre la sección que contiene la pista pedida.
 */
function stubDeObservadoresDeAmbos() {
  interface Capturado {
    callback: (entradas: unknown[]) => void
    observado: Element | null
  }

  const instancias: Capturado[] = []

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      private readonly capturado: Capturado

      constructor(callback: (entradas: unknown[]) => void) {
        this.capturado = { callback, observado: null }
        instancias.push(this.capturado)
      }

      observe(elemento: Element): void {
        this.capturado.observado = elemento
      }

      disconnect(): void {
        this.capturado.observado = null
      }
    },
  )

  /** La entrada MEDIDA del carrusel cuya sección contiene `pista`: el marco (rootBounds) mide
   * 800 px con el centro en 400 y la caja se posa a la distancia pedida POR DEBAJO del centro. */
  function verSeccion(pista: Element, intersectionRatio: number, distanciaAlCentro: number): void {
    const instancia = instancias.find((capturada) => capturada.observado?.contains(pista))

    expect(instancia, 'ninguna sección observada contiene esa pista').toBeDefined()
    act(() => {
      ;(instancia as Capturado).callback([
        {
          isIntersecting: intersectionRatio > 0,
          intersectionRatio,
          target: (instancia as Capturado).observado,
          boundingClientRect: { top: 250 + distanciaAlCentro, height: 300 },
          rootBounds: { top: 0, height: 800 },
        },
      ])
    })
  }

  return { verSeccion }
}

/** La pista de un carrusel por su id PROPIO (los dos conviven en estos tests). */
function pistaPorId(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement
}

describe('@s8 la desambiguación del teclado entre los DOS carruseles es la de @s22: UNA decisión compartida', () => {
  it('@s8 ambos ≥ 0.6 ⇒ una tecla mueve SOLO el más cercano al centro, con UN único preventDefault', () => {
    // La «pantalla altísima» que @s22 contrata (su fila 5): gana la CERCANÍA, no la proporción.
    // El Then es SINGULAR — una tecla, UN carrusel (hallazgo 1a del judge del lote).
    const { verSeccion } = stubDeObservadoresDeAmbos()

    render(
      <>
        <Galeria />
        <Resenas />
      </>,
    )
    const pistaGaleria = pistaPorId('galeria-pista')
    const pistaResenas = pistaPorId('resenas-pista')

    verSeccion(pistaGaleria, 0.9, 600)
    verSeccion(pistaResenas, 0.7, 150)

    const evento = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    })
    const frenar = vi.spyOn(evento, 'preventDefault')

    act(() => {
      document.dispatchEvent(evento)
    })

    expect(centrada(pistaResenas)).toBe(1)
    expect(centrada(pistaGaleria)).toBe(0)
    expect(frenar).toHaveBeenCalledTimes(1)
    expect(evento.defaultPrevented).toBe(true)
  })

  it('@s8 foco DENTRO de la galería + reseñas visibles ≥ 0.6 ⇒ la tecla mueve SOLO la galería', () => {
    // El caso (b) del judge, alcanzable en pantalla NORMAL: la pausa de foco no se pierde al
    // hacer scroll y la sección de reseñas puede llegar al 60 % con el foco aún en la galería.
    const { verSeccion } = stubDeObservadoresDeAmbos()

    render(
      <>
        <Galeria />
        <Resenas />
      </>,
    )
    const pistaGaleria = pistaPorId('galeria-pista')
    const pistaResenas = pistaPorId('resenas-pista')

    verSeccion(pistaResenas, 0.8, 100)
    const carruselGaleria = pistaGaleria.closest('[aria-roledescription="carrusel"]') as HTMLElement

    // [ENMIENDA 4] El foco se posaba sobre «Siguiente» (RETIRADO, @s16 de galería) SOLO como
    // cualquier elemento tabulable DENTRO de la galería: un punto indicador cumple el mismo papel.
    fireEvent.focus(within(carruselGaleria).getByRole('button', { name: 'Ver la foto 1 de 6' }))

    const evento = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    })
    const frenar = vi.spyOn(evento, 'preventDefault')

    act(() => {
      document.dispatchEvent(evento)
    })

    expect(centrada(pistaGaleria)).toBe(5)
    expect(centrada(pistaResenas)).toBe(0)
    expect(frenar).toHaveBeenCalledTimes(1)
  })

  it('@s8 el carrusel NO atendido no reinicia su reloj: su tick original vive, y el del atendido cuenta desde la tecla', () => {
    const { verSeccion } = stubDeObservadoresDeAmbos()

    vi.useFakeTimers()
    render(
      <>
        <Galeria />
        <Resenas />
      </>,
    )
    const pistaGaleria = pistaPorId('galeria-pista')
    const pistaResenas = pistaPorId('resenas-pista')

    verSeccion(pistaGaleria, 0.8, 100)
    verSeccion(pistaResenas, 0.7, 500)

    avanzar(1500)
    pulsarTecla({ key: 'ArrowRight' })

    // La atiende la galería (más cercana): mueve EN EL ACTO; las reseñas, quietas.
    expect(centrada(pistaGaleria)).toBe(1)
    expect(centrada(pistaResenas)).toBe(0)

    // t=1999: el tick de las reseñas (t=2000) aún no llega; el de la galería ya no existe.
    avanzar(499)

    expect(centrada(pistaResenas)).toBe(0)

    // t=2000: el reloj de las reseñas NO se reinició — su tick ORIGINAL avanza puntual.
    avanzar(1)

    expect(centrada(pistaResenas)).toBe(1)
    expect(centrada(pistaGaleria)).toBe(1)

    // t=3499/3500: el de la galería SÍ se reinició — 2000 ms DESDE la tecla, como fija @s20.
    avanzar(1499)

    expect(centrada(pistaGaleria)).toBe(1)

    avanzar(1)

    expect(centrada(pistaGaleria)).toBe(2)
    expect(centrada(pistaResenas)).toBe(1)
  })

  it('@s8 al desmontar los DOS carruseles el registro compartido queda VACÍO: ninguna candidata huérfana', () => {
    // Los esperados 2 y 0 van escritos A MANO; `candidatasRegistradas` solo OBSERVA el registro.
    const { unmount } = render(
      <>
        <Galeria />
        <Resenas />
      </>,
    )

    expect(candidatasRegistradas()).toBe(2)

    unmount()

    expect(candidatasRegistradas()).toBe(0)
  })
})

/* --- @s8: los DOS carruseles CONVIVEN en la home, desambiguados por su nombre accesible. --- */

describe('@s8 [AJUSTADO 2026-07-24, ENMIENDA 4] los DOS carruseles conviven en la home: ningún id compartido, grupos de puntos con nombre propio', () => {
  it('@s8 los dos carruseles se nombran «Nuestros trabajos» y «Lo que dicen nuestras clientas» y no comparten NINGÚN id', () => {
    const { container } = render(
      <HelmetProvider>
        <Home />
      </HelmetProvider>,
    )
    const trabajos = screen.getByRole('group', { name: 'Nuestros trabajos' })
    const clientas = screen.getByRole('group', { name: 'Lo que dicen nuestras clientas' })

    expect(trabajos).toHaveAttribute('aria-roledescription', 'carrusel')
    expect(clientas).toHaveAttribute('aria-roledescription', 'carrusel')

    // Ni un id compartido en toda la página: los dos árboles son independientes.
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('galeria-pista')
    expect(ids).toContain('resenas-pista')
  })

  // [RETIRADO ENMIENDA 4] "hay DOS botones de cada mando en la página..." (Anterior, Siguiente,
  // control de rotación) — ya no tiene referente en NINGUNO de los dos carruseles (ambos perdieron
  // sus tres controles en el MISMO commit 9cf32a9). Lo que sigue siendo cierto, y lo sustituye, ya
  // está cubierto: el test de arriba (ningún id compartido) y el de abajo (grupos de puntos con
  // nombre accesible propio).

  it('@s8 los puntos de cada carrusel hablan su idioma: «Ver la foto…» en la galería, «Ver el testimonio…» aquí', () => {
    render(
      <HelmetProvider>
        <Home />
      </HelmetProvider>,
    )

    expect(screen.getByRole('button', { name: 'Ver la foto 1 de 6' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver el testimonio 1 de 6' })).toBeInTheDocument()
  })
})

/* --- @s6 (proxy runnable): la sección JAMÁS emite structured data propio. --- */

describe('@s6 la sección no aporta NINGÚN structured data: el aggregateRating no existe ni aquí ni en el JSON-LD', () => {
  it('@s6 el horneado de la sección no contiene "aggregateRating", ni "ld+json", ni <script>', () => {
    // El JSON-LD horneado en dist/ lo asevera `home-horneado.test.ts` (@s6 ampliado): aquí, el
    // PROXY runnable — la sección no emite ni un <script> del que pudiera nacer la clave.
    const horneado = renderToString(<Resenas />)

    expect(horneado).not.toContain('aggregateRating')
    expect(horneado).not.toContain('ld+json')
    expect(horneado).not.toContain('<script')
  })
})
