import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Catalogo } from './Catalogo'

/**
 * F-27 `catalogo_fotos` — cada categoría del catálogo enseña en su hueco rosa una foto horneada de su
 * servicio. Contrato: features/catalogo_fotos.feature (@s1-@s13 en este fichero).
 *
 * REGLAS DURAS aplicadas aquí:
 *  · ANTI-TAUTOLOGÍA: títulos, `alt`, ficheros, CTA, leyendas y clases globales van ESCRITOS A MANO;
 *    NUNCA se importa `CATALOGO_DEMO`, `LEYENDA_FOTOS` ni `LEYENDA_PRECIOS` como valor esperado.
 *  · ANTI-CLASE-CSS: `css: false` deja las clases del módulo en `undefined`; JAMÁS `toHaveClass`. Lo
 *    global se lee del atributo `class` del horneado.
 *  · ANCLA POSITIVA en toda negativa sobre el horneado.
 */

/** Los tres pares categoría → título → alt de la tabla de @s1, escritos A MANO. */
const FOTOS_CATALOGO: readonly [string, string, string][] = [
  ['unas', 'Manos y pies de Revista', 'Manos con manicura en tono nude y anillos dorados'],
  ['facial', 'Tu piel, radiante', 'Primer plano de pestañas largas sobre un párpado cerrado'],
  ['depilacion', 'Piel suave y cuidada', 'Mano extendiendo crema sobre una pierna de piel suave'],
]

const LEYENDA_PRECIOS_A_MANO =
  'Precios de muestra · IVA incluido · pendientes de confirmar con el salón'

const LEYENDA_FOTOS_A_MANO =
  'Fotos de banco de imágenes, ilustrativas del servicio · las fotos reales del salón se añaden antes de publicar'

function horneado(): string {
  return renderToString(<Catalogo />)
}

/** El trozo del horneado de una categoría: desde su `<h3>` hasta el `<h3>` siguiente o las leyendas. */
function bloqueDeCategoria(html: string, titulo: string): string {
  const cierreTitulo = html.indexOf(`>${titulo}</h3>`)

  if (cierreTitulo < 0) {
    return ''
  }

  const inicio = html.lastIndexOf('<h3', cierreTitulo)
  const finales = [html.indexOf('<h3', cierreTitulo), html.indexOf(LEYENDA_PRECIOS_A_MANO)].filter(
    (posicion) => posicion > cierreTitulo,
  )

  return html.slice(inicio, finales.length > 0 ? Math.min(...finales) : html.length)
}

function etiquetasImg(html: string): string[] {
  return html.match(/<img\b[^>]*>/g) ?? []
}

function atributo(etiqueta: string, nombre: string): string | null {
  return new RegExp(`\\s${nombre}="([^"]*)"`).exec(etiqueta)?.[1] ?? null
}

describe('@s1 cada categoría muestra EXACTAMENTE UNA foto, con el alt exacto de la tabla', () => {
  for (const [clave, titulo, alt] of FOTOS_CATALOGO) {
    it(`@s1 ${clave}: el bloque de "${titulo}" contiene exactamente una <img> con alt "${alt}"`, () => {
      const bloque = bloqueDeCategoria(horneado(), titulo)

      // Ancla positiva: el bloque existe y empieza en su <h3>.
      expect(bloque).toContain(`>${titulo}</h3>`)

      const imagenes = etiquetasImg(bloque)

      expect(imagenes).toHaveLength(1)
      expect(atributo(imagenes[0], 'alt')).toBe(alt)
    })
  }
})

describe('@s2 las tres fotos son DISTINTAS: ningún alt vacío ni repetido, ningún src repetido', () => {
  it('@s2 hay tres alt con algún carácter que no es espacio, distintos entre sí, y tres src distintos', () => {
    const imagenes = etiquetasImg(horneado())
    const alts = imagenes.map((etiqueta) => atributo(etiqueta, 'alt') ?? '')
    const srcs = imagenes.map((etiqueta) => atributo(etiqueta, 'src') ?? '')

    expect(alts).toHaveLength(3)
    for (const alt of alts) {
      expect(alt.trim().length).toBeGreaterThan(0)
    }
    expect(new Set(alts).size).toBe(3)
    expect(new Set(srcs).size).toBe(3)
  })
})

describe('@s3 cada src sale del fichero local de su categoría y ninguno apunta a un tercero', () => {
  /** Los ficheros de cada categoría, en el orden unas, facial, depilacion, escritos A MANO. */
  const FICHEROS = [
    'servicio-unas-manicura-nude',
    'servicio-facial-pestanas',
    'servicio-depilacion-piel-suave',
  ]

  it('@s3 hay tres src, cada uno contiene el nombre del fichero de su categoría y termina en ".jpg"', () => {
    const srcs = etiquetasImg(horneado()).map((etiqueta) => atributo(etiqueta, 'src') ?? '')

    expect(srcs).toHaveLength(3)
    FICHEROS.forEach((fichero, indice) => {
      expect(srcs[indice]).toContain(fichero)
      expect(srcs[indice].endsWith('.jpg')).toBe(true)
    })
  })

  it('@s3 ningún src empieza por "http://", "https://", "//" ni "data:"', () => {
    const srcs = etiquetasImg(horneado()).map((etiqueta) => atributo(etiqueta, 'src') ?? '')

    // Ancla positiva: hay tres src que inspeccionar.
    expect(srcs).toHaveLength(3)
    for (const src of srcs) {
      expect(src).not.toMatch(/^(?:https?:)?\/\//)
      expect(src.startsWith('data:')).toBe(false)
    }
  })

  it('@s3 el horneado del catálogo (ancla: "Manos y pies de Revista") no contiene "http://" ni "https://"', () => {
    const html = horneado()

    expect(html).toContain('Manos y pies de Revista')
    expect(html).not.toContain('http://')
    expect(html).not.toContain('https://')
  })
})

describe('@s4 cada foto declara sus medidas reales y carga diferida, para no provocar salto de maquetación', () => {
  it('@s4 las tres <img> declaran width="800", height="1000" y loading="lazy"', () => {
    const imagenes = etiquetasImg(horneado())

    expect(imagenes).toHaveLength(3)
    for (const etiqueta of imagenes) {
      expect(atributo(etiqueta, 'width')).toBe('800')
      expect(atributo(etiqueta, 'height')).toBe('1000')
      expect(atributo(etiqueta, 'loading')).toBe('lazy')
    }
  })

  it('@s4 ninguna <img> declara "fetchpriority" ni loading="eager"', () => {
    const imagenes = etiquetasImg(horneado())

    // Ancla positiva: hay tres <img> que inspeccionar.
    expect(imagenes).toHaveLength(3)
    for (const etiqueta of imagenes) {
      expect(etiqueta.toLowerCase()).not.toContain('fetchpriority')
      expect(etiqueta).not.toContain('loading="eager"')
    }
  })
})

/** Los tres CTA de reserva, en orden, escritos A MANO. */
const ENLACES_RESERVA = ['Reservar Uñas', 'Reservar Facial', 'Reservar Depilación']

/** La carta de una categoría: el elemento que contiene su enlace «Reservar …». */
function cartaDe(textoEnlace: string): HTMLElement {
  const carta = screen.getByRole('link', { name: textoEnlace }).parentElement

  if (carta === null) {
    throw new Error(`sin carta para ${textoEnlace}`)
  }

  return carta
}

describe('@s5 la foto ES el hueco: ocupa el sitio del bloque rosa, sin envoltorio y sin nada aria-hidden', () => {
  for (const textoEnlace of ENLACES_RESERVA) {
    it(`@s5 el contenedor de la carta de "${textoEnlace}" tiene EXACTAMENTE dos hijos: la carta y después la <img>`, () => {
      render(<Catalogo />)
      const carta = cartaDe(textoEnlace)
      const contenedor = carta.parentElement as HTMLElement
      const hijos = [...contenedor.children]

      expect(hijos).toHaveLength(2)
      expect(hijos[0]).toBe(carta)
      expect(hijos[1].tagName).toBe('IMG')
      expect(hijos[1].parentElement).toBe(contenedor)
    })
  }

  it('@s5 en todo el catálogo no queda ningún aria-hidden="true" y ninguna <img> se esconde del árbol', () => {
    const { container } = render(<Catalogo />)
    const imagenes = [...container.querySelectorAll('img')]

    // Ancla positiva: el catálogo se pintó con sus tres fotos.
    expect(screen.getByRole('link', { name: 'Reservar Uñas' })).toBeInTheDocument()
    expect(imagenes).toHaveLength(3)

    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0)
    for (const imagen of imagenes) {
      expect(imagen.hasAttribute('aria-hidden')).toBe(false)
      expect(imagen.getAttribute('role')).not.toBe('presentation')
      expect(imagen.getAttribute('role')).not.toBe('none')
    }
  })
})

describe('@s6 la foto entra en el árbol de accesibilidad con su alt, sin contaminar encabezados ni enlaces', () => {
  it('@s6 hay EXACTAMENTE tres imágenes y sus nombres accesibles son, en orden, los tres alt de la tabla', () => {
    render(<Catalogo />)
    const imagenes = screen.getAllByRole('img')

    expect(imagenes).toHaveLength(3)
    FOTOS_CATALOGO.forEach(([, , alt], indice) => {
      expect(imagenes[indice]).toBe(screen.getByRole('img', { name: alt }))
    })
  })

  it('@s6 los tres <h3> se llaman EXACTAMENTE como su título: la foto no les añade su alt', () => {
    render(<Catalogo />)
    const encabezados = screen.getAllByRole('heading', { level: 3 })

    expect(encabezados).toHaveLength(3)
    FOTOS_CATALOGO.forEach(([, titulo], indice) => {
      expect(encabezados[indice]).toBe(screen.getByRole('heading', { level: 3, name: titulo }))
    })
  })

  it('@s6 ninguna <img> desciende de un <h3> ni de un enlace, y los tres enlaces conservan su nombre', () => {
    render(<Catalogo />)
    const imagenes = screen.getAllByRole('img')

    // Ancla positiva: hay tres fotos que inspeccionar.
    expect(imagenes).toHaveLength(3)
    for (const imagen of imagenes) {
      expect(imagen.closest('h3, a')).toBeNull()
    }
    for (const textoEnlace of ENLACES_RESERVA) {
      expect(screen.getByRole('link', { name: textoEnlace })).toBeInTheDocument()
    }
  })

  it('@s6 existe una región cuyo nombre accesible es exactamente "Servicios"', () => {
    render(<Catalogo />)

    expect(screen.getByRole('region', { name: 'Servicios' })).toBeInTheDocument()
  })
})

describe('@s7 las tres fotos y las dos leyendas viajan HORNEADAS (SSR) y en el orden de lectura', () => {
  it('@s7 el horneado trae "Servicios" y los tres títulos (ancla positiva) y los alt en orden unas, facial, depilacion', () => {
    const html = horneado()

    expect(html).toContain('Servicios')
    for (const [, titulo] of FOTOS_CATALOGO) {
      expect(html).toContain(titulo)
    }
    expect(etiquetasImg(html).map((etiqueta) => atributo(etiqueta, 'alt'))).toEqual(
      FOTOS_CATALOGO.map(([, , alt]) => alt),
    )
  })

  it('@s7 título < CTA < alt de cada categoría, en orden, y al pie la leyenda de precios < la de fotos', () => {
    const html = horneado()
    const hitos = [
      'Manos y pies de Revista',
      'Reservar Uñas',
      'Manos con manicura en tono nude y anillos dorados',
      'Tu piel, radiante',
      'Reservar Facial',
      'Primer plano de pestañas largas sobre un párpado cerrado',
      'Piel suave y cuidada',
      'Reservar Depilación',
      'Mano extendiendo crema sobre una pierna de piel suave',
      LEYENDA_PRECIOS_A_MANO,
      LEYENDA_FOTOS_A_MANO,
    ]
    const posiciones = hitos.map((hito) => html.indexOf(hito))

    hitos.forEach((hito, indice) => {
      expect(posiciones[indice], `falta "${hito}" en el horneado`).toBeGreaterThanOrEqual(0)
    })
    for (let indice = 1; indice < posiciones.length; indice++) {
      expect(
        posiciones[indice],
        `"${hitos[indice]}" va tras "${hitos[indice - 1]}"`,
      ).toBeGreaterThan(posiciones[indice - 1])
    }
  })
})

describe('@s8 la leyenda de las fotos aparece UNA vez, en su propio párrafo, justo después del de precios', () => {
  it('@s8 el texto es el contenido COMPLETO de un único <p>, hermano inmediato del <p> de precios', () => {
    render(<Catalogo />)
    const leyendasFotos = screen.getAllByText(LEYENDA_FOTOS_A_MANO)

    expect(leyendasFotos).toHaveLength(1)

    const parrafoFotos = leyendasFotos[0]
    const parrafoPrecios = screen.getByText(LEYENDA_PRECIOS_A_MANO)

    expect(parrafoFotos.tagName).toBe('P')
    expect(parrafoFotos.textContent).toBe(LEYENDA_FOTOS_A_MANO)
    expect(parrafoPrecios.tagName).toBe('P')
    expect(parrafoPrecios.textContent).toBe(LEYENDA_PRECIOS_A_MANO)
    expect(parrafoPrecios.nextElementSibling).toBe(parrafoFotos)
  })
})

describe('@s9 la leyenda de precios NO cambia ni un byte', () => {
  it('@s9 su <p> dice EXACTAMENTE el literal de F-09, con sus dos «·» (U+00B7) y sin punto final, una sola vez', () => {
    render(<Catalogo />)
    const leyendasPrecios = screen.getAllByText(LEYENDA_PRECIOS_A_MANO)

    expect(leyendasPrecios).toHaveLength(1)

    const texto = leyendasPrecios[0].textContent ?? ''

    expect(leyendasPrecios[0].tagName).toBe('P')
    expect(texto).toBe('Precios de muestra · IVA incluido · pendientes de confirmar con el salón')
    expect(texto.split('·')).toHaveLength(3)
    expect(texto.endsWith('.')).toBe(false)
  })

  it('@s9 el párrafo de precios NO contiene "Fotos de banco de imágenes": las leyendas no se funden', () => {
    render(<Catalogo />)

    expect(screen.getByText(LEYENDA_PRECIOS_A_MANO).textContent).not.toContain(
      'Fotos de banco de imágenes',
    )
  })
})

describe('@s10 la sección navegable, su h2 oculto y los tres h3 siguen intactos: ni un id ni un encabezado de más', () => {
  it('@s10 hay EXACTAMENTE una <section> y declara aria-labelledby="servicios-titulo"', () => {
    const html = horneado()

    expect(html.match(/<section\b/g) ?? []).toHaveLength(1)
    expect(/<section[^>]*\saria-labelledby="([^"]*)"/.exec(html)?.[1]).toBe('servicios-titulo')
  })

  it('@s10 el ÚNICO id del catálogo es "servicios-titulo" y lo lleva un <h2> cuyo texto es "Servicios"', () => {
    const html = horneado()
    const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map((coincidencia) => coincidencia[1])

    expect(ids).toEqual(['servicios-titulo'])
    expect(html).toMatch(/<h2[^>]*\sid="servicios-titulo"[^>]*>Servicios<\/h2>/)
  })

  it('@s10 hay 0 <h1>, 1 <h2> y EXACTAMENTE 3 <h3>, con los tres títulos en orden', () => {
    const html = horneado()
    const titulos = [...html.matchAll(/<h3[^>]*>([^<]*)<\/h3>/g)].map(
      (coincidencia) => coincidencia[1],
    )

    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(0)
    expect(html.match(/<h2[\s>]/g) ?? []).toHaveLength(1)
    expect(html.match(/<h3[\s>]/g) ?? []).toHaveLength(3)
    expect(titulos).toEqual([
      'Manos y pies de Revista',
      'Tu piel, radiante',
      'Piel suave y cuidada',
    ])
  })

  it('@s10 los tres rótulos de categoría son, en orden, "Servicio de Uñas", "Servicio Facial" y "Servicio de Depilación"', () => {
    const rotulos = [
      ...horneado().matchAll(/<p[^>]*\sclass="demo-eyebrow"[^>]*>([^<]*)<\/p>/g),
    ].map((coincidencia) => coincidencia[1])

    expect(rotulos).toEqual(['Servicio de Uñas', 'Servicio Facial', 'Servicio de Depilación'])
  })
})

describe('@s11 las tres cartas conservan sus seis filas y su enlace de reserva', () => {
  it('@s11 hay EXACTAMENTE tres enlaces, "Reservar Uñas", "Reservar Facial" y "Reservar Depilación", todos a "#reserva-titulo"', () => {
    render(<Catalogo />)
    const enlaces = screen.getAllByRole('link')

    expect(enlaces.map((enlace) => enlace.textContent)).toEqual(ENLACES_RESERVA)
    for (const enlace of enlaces) {
      expect(enlace.getAttribute('href')).toBe('#reserva-titulo')
    }
  })

  it('@s11 cada carta tiene EXACTAMENTE seis filas de nombre + precio antes de su enlace (18 en total)', () => {
    render(<Catalogo />)
    let filasEnTotal = 0

    for (const textoEnlace of ENLACES_RESERVA) {
      const enlace = screen.getByRole('link', { name: textoEnlace })
      const hijos = [...cartaDe(textoEnlace).children]
      const filas = hijos.slice(0, -1)

      expect(hijos.at(-1)).toBe(enlace)
      expect(filas).toHaveLength(6)
      for (const fila of filas) {
        const [nombre, precio] = [...fila.children].map((celda) => celda.textContent ?? '')

        expect(fila.children).toHaveLength(2)
        expect(nombre.trim().length).toBeGreaterThan(0)
        expect(precio).toMatch(/^\d+ €$/)
      }
      filasEnTotal += filas.length
    }

    expect(filasEnTotal).toBe(18)
  })

  it('@s11 la primera fila de cada carta es, en orden, "Manicura semipermanente" 15 €, "Limpieza facial profunda" 35 € y "Cejas" 12 €', () => {
    render(<Catalogo />)
    const primeras = ENLACES_RESERVA.map((textoEnlace) =>
      [...cartaDe(textoEnlace).children[0].children].map((celda) => celda.textContent),
    )

    expect(primeras).toEqual([
      ['Manicura semipermanente', '15 €'],
      ['Limpieza facial profunda', '35 €'],
      ['Cejas', '12 €'],
    ])
  })
})

/** El horneado de SSR como fragmento consultable: se leen SUS atributos, sin hidratar nada. */
function fragmentoHorneado(): DocumentFragment {
  const plantilla = document.createElement('template')

  plantilla.innerHTML = horneado()

  return plantilla.content
}

describe('@s12 las clases GLOBALES del diseño llegan al horneado en la sección, las cartas y los enlaces', () => {
  // Matan a los tres mutantes que VACÍAN los template literals de `Catalogo.tsx` (`demo-seccion ${…}`,
  // `demo-card ${…}` y `demo-btn demo-btn--solido ${…}`). Se lee el atributo `class` del horneado;
  // nunca `toHaveClass` (patrón equipo.test.tsx:133-145, contacto.test.tsx:105-120).
  it('@s12 el class de la <section> contiene "demo-seccion"', () => {
    const seccion = fragmentoHorneado().querySelector('section')

    expect(seccion, 'no se horneó la <section>').not.toBeNull()
    expect(seccion?.getAttribute('class') ?? '').toContain('demo-seccion')
  })

  it('@s12 el class de cada una de las tres cartas (seis filas + enlace) contiene "demo-card"', () => {
    const enlaces = [...fragmentoHorneado().querySelectorAll('a')]

    expect(enlaces).toHaveLength(3)
    for (const enlace of enlaces) {
      const carta = enlace.parentElement as HTMLElement

      expect(carta.children).toHaveLength(7)
      expect(carta.getAttribute('class') ?? '').toContain('demo-card')
    }
  })

  it('@s12 el class de cada uno de los tres enlaces contiene "demo-btn" y "demo-btn--solido"', () => {
    const enlaces = [...fragmentoHorneado().querySelectorAll('a')]

    expect(enlaces).toHaveLength(3)
    for (const enlace of enlaces) {
      const clases = (enlace.getAttribute('class') ?? '').split(/\s+/)

      expect(clases).toContain('demo-btn')
      expect(clases).toContain('demo-btn--solido')
    }
  })
})

/** Minúsculas y sin acentos, para comparar «sin distinguir mayúsculas ni acentos». */
function normalizado(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

describe('@s13 los alt describen lo que se ve y no fingen: ni «foto de», ni trabajo del salón, ni personas', () => {
  /** Los siete nombres de las profesionales del equipo, escritos A MANO. */
  const PROFESIONALES = ['Lucía', 'Carla', 'Andrea', 'Nerea', 'Marta', 'Paula', 'Sara']

  function altsHorneados(): string[] {
    return etiquetasImg(horneado()).map((etiqueta) => normalizado(atributo(etiqueta, 'alt') ?? ''))
  }

  it('@s13 ninguno empieza por "foto de" ni por "imagen de"', () => {
    const alts = altsHorneados()

    expect(alts).toHaveLength(3)
    for (const alt of alts) {
      expect(alt.startsWith('foto de')).toBe(false)
      expect(alt.startsWith('imagen de')).toBe(false)
    }
  })

  it('@s13 ninguno contiene "nuestro", "nuestra", "del salón" ni "resultado"', () => {
    const alts = altsHorneados()

    expect(alts).toHaveLength(3)
    for (const alt of alts) {
      for (const prohibida of ['nuestro', 'nuestra', 'del salón', 'resultado']) {
        expect(alt).not.toContain(normalizado(prohibida))
      }
    }
  })

  it('@s13 ninguno contiene el nombre de ninguna de las siete profesionales del equipo', () => {
    const alts = altsHorneados()

    expect(alts).toHaveLength(3)
    for (const alt of alts) {
      for (const nombre of PROFESIONALES) {
        expect(alt).not.toContain(normalizado(nombre))
      }
    }
  })

  it('@s13 el alt de Depilación no contiene "cera" ni la raíz "depil"', () => {
    const bloque = bloqueDeCategoria(horneado(), 'Piel suave y cuidada')
    const imagenes = etiquetasImg(bloque)

    // Ancla positiva: el bloque de Depilación existe y su única foto trae un alt no vacío (el literal
    // exacto lo fija @s1; aquí manda la negativa, sea cual sea el texto).
    expect(imagenes).toHaveLength(1)

    const alt = normalizado(atributo(imagenes[0], 'alt') ?? '')

    expect(alt.trim().length).toBeGreaterThan(0)
    expect(alt).not.toContain('cera')
    expect(alt).not.toContain('depil')
  })
})
