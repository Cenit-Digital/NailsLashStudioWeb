import { readFileSync } from 'node:fs'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Cabecera } from './Cabecera'
import { MenuNavegacion } from './MenuNavegacion'
import { Pie } from './Pie'

/**
 * F-06 — la cabecera, la nav y el pie HORNEADOS. Contrato: features/header_nav_footer.feature.
 *
 * 🔴 SSR-SAFE, ASEVERADO SOBRE EL HTML DEL PRERENDER, NO EN JSDOM (verde ≠ funciona, I-8).
 * `renderToString` es EL MISMO mecanismo que usa vite-react-ssg para hornear el HTML: devuelve la
 * cadena del servidor SIN tocar el DOM ni hidratar, así que lo que aquí se asevera es EXACTAMENTE lo
 * que viaja en `dist/`, no el estado post-hidratación que ve jsdom. El primer `pnpm build` real
 * (obligatorio) lo confirma sobre los BYTES de `dist/index.html`.
 *
 * Los atributos JSX literales (aria-label="Principal") NO los protege Stryker: los aseveran ESTOS
 * tests (E1.d). El nombre accesible se consulta por rol/aria, NUNCA por clase CSS.
 */
describe('@s12 el HTML del prerender lleva la cabecera con la marca, la nav con su aria-label y el pie', () => {
  it('@s12 la nav es un landmark con el nombre accesible "Principal"', () => {
    const horneado = renderToString(<Cabecera />)

    expect(horneado).toMatch(/<nav\b[^>]*aria-label="Principal"/)
  })

  it('@s12 la cabecera contiene la marca del salón', () => {
    const horneado = renderToString(<Cabecera />)

    expect(horneado).toMatch(/<header\b/)
    expect(horneado).toContain('Nails Lash Studio')
  })

  it('@s12 el pie es un landmark de footer', () => {
    const horneado = renderToString(<Pie />)

    expect(horneado).toMatch(/<footer\b/)
  })
})

/**
 * @s16 — EL HTML DEL PRERENDER HORNEA EL MENÚ «CERRADO» (estado seguro de primera carga, SSR). La
 * segunda aserción MATA POR ADELANTADO la trampa de Radix (descartado en B-6, pero la guarda
 * persiste): un `Dialog.Portal` emitiría CERO en prerender —solo el `<button>` trigger— y los
 * enlaces NO estarían en el HTML, dejando la puerta de anclas CIEGA (no se rompe: MIENTE POR
 * OMISIÓN). Aquí se exigen los enlaces en el HORNEADO, contra Radix o cualquier regresión futura.
 */
describe('@s16 el HTML del prerender hornea el menú «cerrado» con los enlaces presentes', () => {
  it('@s16 el botón del menú declara aria-expanded="false"', () => {
    const horneado = renderToString(<MenuNavegacion />)

    expect(horneado).toMatch(/<button\b[^>]*aria-expanded="false"/)
  })

  it('@s16 los enlaces de la navegación están en el HTML horneado, no dependen de la hidratación', () => {
    const horneado = renderToString(<MenuNavegacion />)

    expect(horneado).toContain('href="#servicios-titulo"')
    expect(horneado).toContain('href="#contacto-titulo"')
    expect(horneado).toContain('Servicios')
    expect(horneado).toContain('Contacto')
  })
})

/**
 * @s15 — EL ESTADO CONDICIONAL VA EN UN ATRIBUTO CONSULTABLE (`aria-expanded`), NUNCA EN UN
 * className condicional. MEDIDO con Stryker real (E1.c): `className={cond ? 'a' : 'b'}` genera 5
 * mutantes y LOS 5 SOBREVIVEN a consultas por rol/nombre/texto (solo mueren con `toHaveClass`, que
 * el repo PROHÍBE); `aria-expanded={cond ? 'true' : 'false'}` —misma forma— muere 4/4 con consultas
 * permitidas. Es un test de estado INTERACTIVO (post-hidratación) → Testing Library en jsdom, por
 * rol y nombre accesible.
 */
describe('@s15 el estado abierto/cerrado del menú vive en aria-expanded, consultado por rol y nombre', () => {
  it('@s15 aria-expanded pasa de "false" (cerrado) a "true" (abierto) y vuelve, al pulsar el botón', async () => {
    const usuario = userEvent.setup()
    render(<MenuNavegacion />)

    const boton = screen.getByRole('button', { name: /menú/i })
    // El estado se lee de aria-expanded, no de una clase: la clase es CONSTANTE entre estados.
    const claseInicial = boton.getAttribute('class')

    expect(boton).toHaveAttribute('aria-expanded', 'false')

    await usuario.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')

    await usuario.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'false')

    // La clase NO codifica el estado (no es `cond ? 'a' : 'b'`): permanece igual tras el toggle.
    expect(boton.getAttribute('class')).toBe(claseInicial)
  })
})

/**
 * @s27 — LA ASOCIACIÓN A11Y BOTÓN↔LISTA (ampliación ronda 2, aprobada por la puerta humana el
 * 2026-07-18). El `aria-controls` del botón es igual al `id` del `<ul>`, y ese id es EXACTAMENTE
 * "menu-navegacion" y NO vacío. Con el mutante `ID_LISTA = ''`, el botón queda con `aria-controls=""`
 * y el `<ul>` con `id=""`: siguen siendo IGUALES (ambos ''), así que una aserción de SOLA igualdad los
 * deja pasar — por eso se exige ADEMÁS que el identificador sea EXACTAMENTE "menu-navegacion" y NO
 * vacío: con el mutante el botón deja de anunciar qué lista controla y `@s15` (que solo mira el toggle
 * de `aria-expanded`) no se entera. ANTI-TAUTOLOGÍA: el literal "menu-navegacion" va ESCRITO A MANO;
 * jamás se importa ID_LISTA para compararse contra sí mismo.
 */
describe('@s27 el botón del menú declara aria-controls igual al id de su lista, y ese id es "menu-navegacion"', () => {
  it('@s27 aria-controls del botón == id del <ul> == "menu-navegacion" (no vacío), consultado por rol y nombre', () => {
    render(<MenuNavegacion />)

    const boton = screen.getByRole('button', { name: /menú/i })
    const lista = screen.getByRole('list')
    const idLista = lista.getAttribute('id')

    expect(boton.getAttribute('aria-controls')).toBe(idLista)
    // El literal "menu-navegacion" va ESCRITO A MANO, jamás importado de ID_LISTA (anti-tautología).
    expect(idLista).toBe('menu-navegacion')
    expect(idLista).not.toBe('')
  })
})

/**
 * @s17 — EL BREAKPOINT ES EL LITERAL 920px, LEÍDO DEL SCSS Y ANCLADO CONTRA EL LITERAL A MANO
 * (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`). Criterio de PROYECTO MEDIDO sobre la nav
 * definitiva: cabe en una fila desde 891px con las fuentes cargadas y desde 908px con la de respaldo
 * → 920px deja 12px de margen sobre el peor caso. Era 820px (la banda 793–806px de la nav del
 * prototipo) hasta la ENMIENDA E-2 de F-25. NUNCA el 767 de WebEmpresa (herencia muerta). NUNCA
 * atribuido a WCAG (1.4.10 solo exige 320px). El breakpoint vive SOLO en el SCSS (no hay rama JS de
 * viewport, B-5): no hay símbolo que importar, así que el literal a mano es la única referencia
 * posible y la tautología es imposible por construcción.
 */
describe('@s17 el breakpoint del menú es exactamente el literal 920px en el .module.scss', () => {
  const RUTA_SCSS = 'src/components/cabecera.module.scss'

  it('@s17 la media query del menú móvil usa exactamente "max-width: 920px", comparado contra el literal a mano', () => {
    const scss = readFileSync(RUTA_SCSS, 'utf8')

    // El literal 920px va ESCRITO A MANO aquí, jamás importado del SCSS ni de un símbolo de producción.
    expect(scss).toMatch(/@media\s*\(\s*max-width:\s*920px\s*\)/)
    // Y NO el 767 heredado de WebEmpresa (0 en `src/` [V]).
    expect(scss).not.toContain('767px')
  })
})

/**
 * El PIE HONESTO (realiza @s13/@s14 en el componente, siguiendo la decisión del lead). Emite el
 * enlace a Facebook (dato de F-02) y el `tel:`, que NINGUNA de las tres puertas caza (@s14). NO
 * emite enlaces legales (los cazaría la anti-404 —el bug del cliente—; son F-16, @s13). E Instagram
 * es un HANDLE en `site.ts`, no una URL: hornearla sería HARDCODEAR una URL que la fuente única no
 * tiene (el invariante que F-02 existe para evitar). Literales escritos A MANO (anti-tautología).
 */
describe('el pie emite Facebook y tel:, y NO enlaces legales ni una URL de Instagram', () => {
  const FACEBOOK = 'https://www.facebook.com/nailslashstudiorozas/'
  const TEL = 'tel:+34625223366'

  it('el pie hornea el enlace a Facebook (dato real de F-02) y el tel: normalizado a E.164', () => {
    const horneado = renderToString(<Pie />)

    expect(horneado).toContain(`href="${FACEBOOK}"`)
    expect(horneado).toContain(`href="${TEL}"`)
  })

  it('el pie NO hornea ningún enlace legal (los cazaría la anti-404; son F-16)', () => {
    const horneado = renderToString(<Pie />)

    expect(horneado).not.toContain('/aviso-legal')
    expect(horneado).not.toContain('/privacidad')
  })

  it('(DEMO) el pie hornea la URL de Instagram DERIVADA del handle único (instagramHref de F-02, no hardcodeada)', () => {
    // 🎨 Ajuste de la rama demo: el pie oscuro del prototipo añade Instagram. NO se hardcodea la URL:
    // se DERIVA del handle @nailslash.studio_ con `instagramHref` (el mismo patrón que Contacto de
    // F-12), así que la fuente única de F-02 sigue siendo el handle, no una URL.
    const horneado = renderToString(<Pie />)

    expect(horneado).toContain('href="https://www.instagram.com/nailslash.studio_/"')
    expect(horneado).toContain('@nailslash.studio_')
  })
})

/**
 * @s20 (F-25, features/logo_acoplado.feature) — ENMIENDA a F-06: la marca pasa a `<LogoAcoplado />`
 * y las reglas de `.marca` se MUDAN a `logo-acoplado.module.scss`. El `@media` del menú se queda (lo
 * lee @s17 de arriba; 920 px desde la ENMIENDA E-2) y el horneado conserva lo que protegen @s12 y
 * @s16. Literales A MANO.
 */
describe('@s20 ENMIENDA F-25: las reglas de .marca se MUDAN a la hoja del logo, el @media de 920 px se queda y el horneado de F-06 sigue', () => {
  const CABECERA = readFileSync('src/components/cabecera.module.scss', 'utf8')
  const LOGO = readFileSync('src/components/logo-acoplado.module.scss', 'utf8')

  /** Las declaraciones del bloque de PRIMER NIVEL con ese selector exacto (bloques hoja). */
  function declaracionesDe(hoja: string, selector: string): string[] {
    const escapado = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const cuerpo = new RegExp(`(^|\\n)${escapado}\\s*\\{([^{}]*)\\}`).exec(hoja)?.[2] ?? ''

    return cuerpo
      .replace(/\/\/[^\n]*/g, '')
      .split(';')
      .map((declaracion) => declaracion.replace(/\s+/g, ' ').trim())
      .filter((declaracion) => declaracion !== '')
  }

  it('@s20 ANCLAS: cabecera.module.scss conserva .cabecera y el @media de 920 px, sin 767px; y ya NO tiene ningún bloque .marca', () => {
    expect(CABECERA).toContain('.cabecera')
    expect(CABECERA).toMatch(/@media\s*\(\s*max-width:\s*920px\s*\)/)
    expect(CABECERA).not.toContain('767px')
    expect(CABECERA).not.toMatch(/\.marca\b[^{;]*\{/)
  })

  it('@s20 cabecera.module.scss, sin comentarios, NO contiene "max-width: 820px": el menú tiene un solo breakpoint (ENMIENDA E-2)', () => {
    // Sin comentarios: el comentario de la hoja puede citar el 820 como historia.
    expect(sinComentarios(CABECERA)).not.toMatch(/max-width\s*:\s*820px/)
  })

  it('@s20 la mudanza: color, subrayado, cuerpo e interlineado de la marca viven ahora en .marca o .logoTexto de la hoja del logo', () => {
    const mudadas = [...declaracionesDe(LOGO, '.marca'), ...declaracionesDe(LOGO, '.logoTexto')]

    for (const declaracion of [
      'color: var(--ink)',
      'text-decoration: none',
      'font-size: 1.1875rem',
      'line-height: 1.4',
    ]) {
      expect(mudadas, declaracion).toContain(declaracion)
    }
  })

  it('@s20 el horneado de la cabecera sigue con «Nails Lash Studio», la nav «Principal», el menú cerrado y sus enlaces', () => {
    const horneado = renderToString(<Cabecera />)

    expect(horneado).toContain('Nails Lash Studio')
    expect(horneado).toMatch(/<nav\b[^>]*aria-label="Principal"/)
    expect(horneado).toMatch(/<button\b[^>]*aria-expanded="false"/)
    expect(horneado).toContain('href="#servicios-titulo"')
    expect(horneado).toContain('href="#contacto-titulo"')
  })
})

/* ————————————————————————————————————————————————————————————————————————————————————————————
 * F-25 ENMIENDA E-1 (features/logo_acoplado.feature @s35-@s38) — la cabecera en móvil, en UNA fila
 * sin «Reservar»: hasta 430 px, `display: none` en la MISMA hoja, CSS puro. Los describe van
 * prefijados «F-25 E-1 @sN» para no confundirse con los tags de F-06 de este fichero. Literales A
 * MANO: "430px", "display: none", "Reservar" y "#reserva-titulo". Que el enlace se OCULTE de verdad
 * hasta 430 px no lo ve jsdom (`css: false`, sin layout): es @s39, EN VIVO en Chrome.
 * ———————————————————————————————————————————————————————————————————————————————————————————— */

/**
 * «Contiene / no contiene» va sobre los BYTES CRUDOS (los comentarios también cuentan); el troceo en
 * bloques va sobre la hoja SIN comentarios, para que un comentario no se cuele en un selector.
 */
const BYTES_CABECERA = readFileSync('src/components/cabecera.module.scss', 'utf8')
const HOJA_CABECERA = sinComentarios(BYTES_CABECERA)

const MEDIA_MOVIL = mediaDeAncho('430px')
const MEDIA_MENU = mediaDeAncho('920px')

/** El encabezado `@media (max-width: <ancho>) {`, con el ancho escrito A MANO en cada llamada. */
function mediaDeAncho(ancho: string): RegExp {
  return new RegExp(`@media\\s*\\(\\s*max-width:\\s*${ancho}\\s*\\)\\s*\\{`)
}

function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

/** Cuántas veces casa el patrón (sin bandera `g`: aquí se le pone, sin estado compartido). */
function vecesQueCasa(fuente: string, patron: RegExp): number {
  return [...fuente.matchAll(new RegExp(patron.source, 'g'))].length
}

/** El cuerpo (entre llaves) del primer bloque cuyo encabezado casa, contando llaves. */
function cuerpoDelBloque(fuente: string, encabezado: RegExp): string | null {
  const indice = encabezado.exec(fuente)?.index ?? -1

  if (indice < 0) {
    return null
  }

  const apertura = fuente.indexOf('{', indice)
  let profundidad = 0

  for (let i = apertura; i < fuente.length; i++) {
    if (fuente[i] === '{') {
      profundidad += 1
    } else if (fuente[i] === '}') {
      profundidad -= 1

      if (profundidad === 0) {
        return fuente.slice(apertura + 1, i)
      }
    }
  }

  return null
}

/** La hoja SIN el primer bloque entero (encabezado y cuerpo) cuyo encabezado casa. */
function sinElBloque(fuente: string, encabezado: RegExp): string {
  const inicio = encabezado.exec(fuente)?.index
  const cuerpo = cuerpoDelBloque(fuente, encabezado)

  if (inicio === undefined || cuerpo === null) {
    return fuente
  }

  const fin = fuente.indexOf('{', inicio) + cuerpo.length + '{}'.length

  return fuente.slice(0, inicio) + fuente.slice(fin)
}

/** Las reglas «selector { declaraciones }» de un fragmento, sin anidamiento. */
function reglas(fragmento: string): { selector: string; cuerpo: string }[] {
  return [...fragmento.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    cuerpo: m[2],
  }))
}

/** Las declaraciones de un bloque hoja, con los espacios normalizados. */
function declaraciones(cuerpo: string): string[] {
  return cuerpo
    .split(';')
    .map((declaracion) => declaracion.replace(/\s+/g, ' ').trim())
    .filter((declaracion) => declaracion !== '')
}

/** Las declaraciones de la regla de ese selector EXACTO dentro del fragmento ([] si no está). */
function declaracionesDeLaRegla(fragmento: string, selector: string): string[] {
  return declaraciones(reglas(fragmento).find((regla) => regla.selector === selector)?.cuerpo ?? '')
}

describe('F-25 E-1 @s35 cabecera.module.scss gana EXACTAMENTE un @media (max-width: 430px) que solo oculta «Reservar», después de su regla base; el @media de 920 px sigue intacto', () => {
  it('@s35 ANCLAS POSITIVAS: la hoja contiene ".cabecera", ".reservar", ".disparador" y EXACTAMENTE un bloque @media (max-width: 920px) (F-06 @s17)', () => {
    for (const ancla of ['.cabecera', '.reservar', '.disparador']) {
      expect(BYTES_CABECERA, ancla).toContain(ancla)
    }

    expect(vecesQueCasa(HOJA_CABECERA, MEDIA_MENU)).toBe(1)
  })

  it('@s35 la hoja contiene EXACTAMENTE un bloque @media (max-width: 430px), y ni "431px" ni "@media (min-width"', () => {
    expect(vecesQueCasa(HOJA_CABECERA, MEDIA_MOVIL)).toBe(1)
    expect(BYTES_CABECERA).not.toContain('431px')
    expect(BYTES_CABECERA).not.toContain('@media (min-width')
  })

  it('@s35 ese @media contiene EXACTAMENTE un bloque, de selector ".reservar" a secas, con una sola declaración: "display: none"', () => {
    const media = cuerpoDelBloque(HOJA_CABECERA, MEDIA_MOVIL) ?? ''
    const bloques = reglas(media)

    // Una sola llave de apertura: ni anidamiento ni un segundo bloque (cierra la alternativa (a)).
    expect(vecesQueCasa(media, /\{/)).toBe(1)
    expect(bloques.map(({ selector }) => selector)).toEqual(['.reservar'])
    expect(declaraciones(bloques[0].cuerpo)).toEqual(['display: none'])
  })

  it('@s35 ese @media empieza en la hoja DESPUÉS del bloque base ".reservar" de primer nivel', () => {
    // Empatan en especificidad (0,1,0): gana la que va detrás (la trampa de @s16).
    const base = /(^|\n)\.reservar\s*\{/.exec(HOJA_CABECERA)
    const media = MEDIA_MOVIL.exec(HOJA_CABECERA)

    expect(base, 'la hoja debe tener el bloque base .reservar').not.toBeNull()
    expect(media, 'la hoja debe tener el @media de 430 px').not.toBeNull()
    expect(media?.index).toBeGreaterThan(base?.index ?? Infinity)
  })

  it('@s35 fuera de ese @media, ningún bloque cuyo selector contiene ".reservar" declara "display: none" ni "visibility: hidden"', () => {
    const fuera = sinElBloque(HOJA_CABECERA, MEDIA_MOVIL)
    const encabezados = [...fuera.matchAll(/[^{};]*\.reservar\b[^{};]*\{/g)]

    // ANCLA POSITIVA: la base `.reservar` sigue fuera del @media.
    expect(encabezados.length).toBeGreaterThan(0)

    for (const { 0: encabezado, index } of encabezados) {
      // El cuerpo ENTERO, anidados incluidos (`&:hover` también es `.reservar`).
      const cuerpo = cuerpoDelBloque(fuera.slice(index), /\{/) ?? ''

      expect(cuerpo, encabezado.trim()).not.toMatch(/display\s*:\s*none/)
      expect(cuerpo, encabezado.trim()).not.toMatch(/visibility\s*:\s*hidden/)
    }
  })

  it('@s35 el @media (max-width: 920px) de F-06 sigue declarando el menú plegable y NO contiene ".reservar"; la hoja sigue sin "767px"', () => {
    const menu = cuerpoDelBloque(HOJA_CABECERA, MEDIA_MENU) ?? ''

    expect(declaracionesDeLaRegla(menu, '.disparador')).toContain('display: inline-flex')
    expect(declaracionesDeLaRegla(menu, '.lista')).toContain('display: none')
    expect(declaracionesDeLaRegla(menu, ".disparador[aria-expanded='true'] + .lista")).toContain(
      'display: flex',
    )
    expect(menu).not.toContain('.reservar')
    expect(BYTES_CABECERA).not.toContain('767px')
  })
})

/** Los `<a>` cuyo texto es EXACTAMENTE "Reservar" (no «Reserva» de la lista), en el HTML dado. */
function enlacesReservar(html: string): RegExpExecArray[] {
  return [...html.matchAll(/<a\b[^>]*>Reservar<\/a>/g)]
}

describe('F-25 E-1 @s36 el enlace «Reservar» sigue horneado, dentro de la nav y FUERA de la lista del menú, con href="#reserva-titulo" y sin nada en el marcado que lo oculte', () => {
  it('@s36 ANCLA POSITIVA: hay EXACTAMENTE un <a> «Reservar», dentro de la <nav> "Principal", con href exactamente "#reserva-titulo"', () => {
    const horneado = renderToString(<Cabecera />)
    const enlaces = enlacesReservar(horneado)
    const nav = /<nav\b[^>]*aria-label="Principal"[^>]*>/.exec(horneado)

    expect(enlaces).toHaveLength(1)
    expect(nav, 'la cabecera debe hornear la nav "Principal"').not.toBeNull()

    const inicioDeLaNav = nav?.index ?? Infinity
    const finDeLaNav = horneado.indexOf('</nav>', inicioDeLaNav)

    expect(enlaces[0].index).toBeGreaterThan(inicioDeLaNav)
    expect(enlaces[0].index).toBeLessThan(finDeLaNav)
    expect(enlaces[0][0]).toMatch(/\shref="#reserva-titulo"[\s>]/)
  })

  it('@s36 está DESPUÉS del </ul> de la lista id="menu-navegacion" y ANTES del </nav>: no se ha mudado al menú', () => {
    const horneado = renderToString(<Cabecera />)
    const lista = /<ul\b[^>]*\sid="menu-navegacion"/.exec(horneado)

    expect(lista, 'la nav debe hornear la lista "menu-navegacion"').not.toBeNull()

    const finDeLaLista = horneado.indexOf('</ul>', lista?.index ?? Infinity)
    const finDeLaNav = horneado.indexOf('</nav>', finDeLaLista)
    const [reservar] = enlacesReservar(horneado)

    expect(finDeLaLista).toBeGreaterThan(-1)
    expect(reservar.index).toBeGreaterThan(finDeLaLista)
    expect(reservar.index).toBeLessThan(finDeLaNav)
  })

  it('@s36 su etiqueta de apertura NO contiene "hidden", "aria-hidden", "style=", "tabindex" ni "inert"', () => {
    const [reservar] = enlacesReservar(renderToString(<Cabecera />))
    const apertura = /^<a\b[^>]*>/.exec(reservar[0])?.[0] ?? ''

    // ANCLA POSITIVA: la etiqueta existe y es la del enlace a la reserva.
    expect(apertura).toContain('href="#reserva-titulo"')

    for (const oculta of ['hidden', 'aria-hidden', 'style=', 'tabindex', 'inert']) {
      expect(apertura, oculta).not.toContain(oculta)
    }
  })

  it('@s36 el HTML de la cabecera contiene href="#reserva-titulo" EXACTAMENTE dos veces: «Reserva» en la lista y «Reservar»', () => {
    const horneado = renderToString(<Cabecera />)

    expect(vecesQueCasa(horneado, /href="#reserva-titulo"/)).toBe(2)
  })
})

describe('F-25 E-1 @s37 ningún JS decide el ancho: montada en jsdom a 320 px con un matchMedia que responde que sí a todo, la cabecera conserva «Reservar» y no consulta matchMedia ni escucha "resize"', () => {
  const ANCHO_MINIMO = 320
  // La cabecera de la geometría de referencia del .feature: alto 73,6 (rootMargin "-73px …").
  const CAJA_DE_LA_CABECERA = { x: 0, y: 0, left: 0, top: 0, width: 320, height: 73.6 }

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  /** El IntersectionObserver que jsdom no trae: un doble con el constructor espiado. */
  function sustituirObservador() {
    const construir = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn()
        disconnect = vi.fn()

        constructor(...argumentos: unknown[]) {
          construir(...argumentos)
        }
      },
    )

    return construir
  }

  /** Un matchMedia que responde que SÍ a cualquier consulta: un `useIsMobile` quitaría el enlace. */
  function matchMediaQueDiceQueSi() {
    const matchMedia = vi.fn((consulta: string) => ({
      matches: true,
      media: consulta,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    vi.stubGlobal('matchMedia', matchMedia)

    return matchMedia
  }

  /** El <header> mide la caja de referencia; el resto, los ceros de jsdom. */
  function fijarCajaDeLaCabecera(): void {
    const medir = Element.prototype.getBoundingClientRect
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      return this.matches('header')
        ? ({
            ...CAJA_DE_LA_CABECERA,
            right: CAJA_DE_LA_CABECERA.width,
            bottom: CAJA_DE_LA_CABECERA.height,
            toJSON: () => CAJA_DE_LA_CABECERA,
          } as DOMRect)
        : medir.call(this)
    })
  }

  /**
   * Monta la cabecera REAL a 320 px, con el papel del hero (origen y disparo) para que el efecto del
   * logo llegue a construir su observador: sin el disparo, el efecto vuelve antes y «corren sus
   * efectos» no probaría nada.
   */
  function montarA320() {
    const construirObservador = sustituirObservador()
    vi.stubGlobal('innerWidth', ANCHO_MINIMO)
    const matchMedia = matchMediaQueDiceQueSi()
    const escucharVentana = vi.spyOn(window, 'addEventListener')
    fijarCajaDeLaCabecera()

    render(
      <>
        <Cabecera />
        <main>
          <svg data-acople="origen" />
          <span data-acople="disparo">Studio</span>
        </main>
      </>,
    )

    // El Given, de verdad: 320 px, el espía en su sitio y los efectos corridos con la geometría.
    expect(window.innerWidth).toBe(ANCHO_MINIMO)
    expect(window.matchMedia).toBe(matchMedia)
    expect(construirObservador).toHaveBeenCalledTimes(1)
    expect(construirObservador.mock.calls[0][1]).toMatchObject({ rootMargin: '-73px 0px 0px 0px' })

    return { matchMedia, escucharVentana }
  }

  it('@s37 ANCLA POSITIVA: getAllByRole("link", { name: "Reservar" }) da EXACTAMENTE un enlace, dentro de la navegación "Principal", con href exactamente "#reserva-titulo"', () => {
    montarA320()

    const nav = screen.getByRole('navigation', { name: 'Principal' })
    const enlaces = screen.getAllByRole('link', { name: 'Reservar' })

    expect(enlaces).toHaveLength(1)
    expect(nav).toContainElement(enlaces[0])
    expect(enlaces[0]).toHaveAttribute('href', '#reserva-titulo')
  })

  it('@s37 ese enlace no lleva los atributos hidden, aria-hidden, style, tabindex ni inert', () => {
    montarA320()

    // `hidden: true` lo encuentra aunque algo lo sacara del árbol: el atributo es lo que se mira.
    const [reservar] = screen.getAllByRole('link', { name: 'Reservar', hidden: true })

    expect(reservar).toHaveAttribute('href', '#reserva-titulo')

    for (const oculta of ['hidden', 'aria-hidden', 'style', 'tabindex', 'inert']) {
      expect(reservar, oculta).not.toHaveAttribute(oculta)
    }
  })

  it('@s37 matchMedia NO se ha llamado ninguna vez, y window.addEventListener no ha recibido "resize" ni "orientationchange"', () => {
    const { matchMedia, escucharVentana } = montarA320()
    const tipos = escucharVentana.mock.calls.map(([tipo]) => tipo)

    expect(matchMedia).not.toHaveBeenCalled()
    expect(tipos).not.toContain('resize')
    expect(tipos).not.toContain('orientationchange')
  })
})

/**
 * La clase es el ÚNICO puente entre la hoja (@s35) y el enlace: bajo `css: false` el className es
 * una cadena con hash y no se asevera en el DOM, así que se ata aquí, por BYTES (los comentarios
 * también cuentan). Los dos ficheros están en `mutate`: ninguna guarda veta `if (`, `?`, `&&` ni `||`.
 */
describe('F-25 E-1 @s38 guardas de FUENTE: MenuNavegacion.tsx sigue atando «Reservar» a la clase .reservar, y ni él ni Cabecera.tsx conocen el ancho de la pantalla', () => {
  const MENU = readFileSync('src/components/MenuNavegacion.tsx', 'utf8')

  it('@s38 ANCLAS POSITIVAS: MenuNavegacion.tsx contiene EXACTAMENTE una vez "estilos.reservar" y EXACTAMENTE dos veces href="#reserva-titulo"', () => {
    expect(vecesQueCasa(MENU, /estilos\.reservar/)).toBe(1)
    expect(vecesQueCasa(MENU, /href="#reserva-titulo"/)).toBe(2)
  })

  it('@s38 ni MenuNavegacion.tsx ni Cabecera.tsx contienen "useIsMobile", "matchMedia", "innerWidth", "outerWidth", "screen.width", "\'resize\'" ni \'"resize"\'', () => {
    const fuentes = {
      'MenuNavegacion.tsx': MENU,
      'Cabecera.tsx': readFileSync('src/components/Cabecera.tsx', 'utf8'),
    }
    const vetados = [
      'useIsMobile',
      'matchMedia',
      'innerWidth',
      'outerWidth',
      'screen.width',
      "'resize'",
      '"resize"',
    ]

    for (const [fichero, bytes] of Object.entries(fuentes)) {
      // ANCLA POSITIVA: son los ficheros de la cabecera, no un vacío.
      expect(bytes, fichero).toContain('export function')

      for (const vetado of vetados) {
        expect(bytes, `${fichero}: ${vetado}`).not.toContain(vetado)
      }
    }
  })
})

/* ————————————————————————————————————————————————————————————————————————————————————————————
 * F-25 ENMIENDA E-2 (features/logo_acoplado.feature @s42) — el menú plegable hasta 920 px: SOLO cambia
 * el número del `@media` de F-06, con el MISMO bloque y el MISMO contenido, CSS puro. El 820 de
 * contacto.module.scss es OTRO corte (la prominencia del tel:, F-12) y no se mueve. Literales A MANO
 * en cada uso: "920px", "820px", "430px", "921px" y "767px", nunca importados de producción ni tomados
 * de otra constante. Que el menú se pliegue hasta 920 px y la nav quepa en una fila desde 921 px no lo
 * ve jsdom (`css: false`, sin layout): es @s43 y las filas 920/921 de @s39, EN VIVO en Chrome.
 * ———————————————————————————————————————————————————————————————————————————————————————————— */

describe('F-25 E-2 @s42 el breakpoint del menú pasa a 920 px: cabecera.module.scss tiene EXACTAMENTE un @media (max-width: 920px) con el MISMO menú plegable, ninguna "max-width: 820px" y su @media (max-width: 430px) detrás; contacto.module.scss conserva su @media (max-width: 820px) del tel:', () => {
  it('@s42 ANCLA POSITIVA: cabecera.module.scss contiene EXACTAMENTE un bloque @media (max-width: 920px)', () => {
    expect(vecesQueCasa(HOJA_CABECERA, mediaDeAncho('920px'))).toBe(1)
  })

  it('@s42 ese bloque declara ".disparador" con "display: inline-flex", ".lista" con "display: none" y "flex-direction: column", y ".disparador[aria-expanded=\'true\'] + .lista" con "display: flex"', () => {
    const menu = cuerpoDelBloque(HOJA_CABECERA, mediaDeAncho('920px')) ?? ''
    const lista = declaracionesDeLaRegla(menu, '.lista')

    expect(declaracionesDeLaRegla(menu, '.disparador')).toContain('display: inline-flex')
    expect(lista).toContain('display: none')
    expect(lista).toContain('flex-direction: column')
    expect(declaracionesDeLaRegla(menu, ".disparador[aria-expanded='true'] + .lista")).toContain(
      'display: flex',
    )
  })

  it('@s42 ese @media (max-width: 920px) empieza en la hoja DESPUÉS de los bloques base ".lista" y ".disparador" de primer nivel', () => {
    // El `@media` no suma especificidad: sus reglas (0,1,0) ganan a las base SOLO por ir detrás.
    const media = mediaDeAncho('920px').exec(HOJA_CABECERA)

    expect(media, 'la hoja debe tener el @media de 920 px').not.toBeNull()

    for (const base of [/(^|\n)\.lista\s*\{/, /(^|\n)\.disparador\s*\{/]) {
      const bloque = base.exec(HOJA_CABECERA)

      expect(bloque, `la hoja debe tener el bloque base ${base.source}`).not.toBeNull()
      expect(media?.index, base.source).toBeGreaterThan(bloque?.index ?? Infinity)
    }
  })

  it('@s42 cabecera.module.scss contiene EXACTAMENTE un bloque @media (max-width: 430px), que empieza en la hoja DESPUÉS del @media (max-width: 920px)', () => {
    const movil = mediaDeAncho('430px')
    const menu = mediaDeAncho('920px').exec(HOJA_CABECERA)

    expect(vecesQueCasa(HOJA_CABECERA, movil)).toBe(1)
    expect(menu, 'la hoja debe tener el @media de 920 px').not.toBeNull()
    expect(movil.exec(HOJA_CABECERA)?.index).toBeGreaterThan(menu?.index ?? Infinity)
  })

  it('@s42 ANCLAS NEGATIVAS: cabecera.module.scss NO contiene "max-width: 820px" (un solo breakpoint del menú), ni "921px", ni "767px"', () => {
    // "820px", sin comentarios: el comentario de la hoja lo cita como historia.
    expect(HOJA_CABECERA).not.toMatch(/max-width\s*:\s*820px/)
    // Con un solo `max-width` no queda hueco fraccionario entre dos rangos (como "431px" en @s35).
    expect(BYTES_CABECERA).not.toContain('921px')
    expect(BYTES_CABECERA).not.toContain('767px')
  })

  it('@s42 contacto.module.scss SÍ contiene EXACTAMENTE un bloque @media (max-width: 820px), que declara ".telefono" con "display: inline-flex" y "min-height: 2.75rem", y NO contiene "920px" (el corte del tel: no se mueve)', () => {
    const contacto = sinComentarios(readFileSync('src/components/contacto.module.scss', 'utf8'))
    const delTel = mediaDeAncho('820px')
    const telefono = declaracionesDeLaRegla(cuerpoDelBloque(contacto, delTel) ?? '', '.telefono')

    expect(vecesQueCasa(contacto, delTel)).toBe(1)
    expect(telefono).toContain('display: inline-flex')
    expect(telefono).toContain('min-height: 2.75rem')
    // Sin comentarios: el del tel: puede citar el 920 del menú para decir que este corte no se movió.
    expect(contacto).not.toContain('920px')
  })
})
