import { readFileSync } from 'node:fs'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

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
 * @s17 — EL BREAKPOINT ES EL LITERAL 820px, LEÍDO DEL SCSS Y ANCLADO CONTRA EL LITERAL A MANO
 * (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`). Criterio de PROYECTO MEDIDO: la nav
 * envuelve en la banda 793–806px → 820px da margen sobre toda la banda. NUNCA el 767 de WebEmpresa
 * (herencia muerta). NUNCA atribuido a WCAG (1.4.10 solo exige 320px). El breakpoint vive SOLO en el
 * SCSS (no hay rama JS de viewport, B-5): no hay símbolo que importar, así que el literal a mano es
 * la única referencia posible y la tautología es imposible por construcción.
 */
describe('@s17 el breakpoint del menú es exactamente el literal 820px en el .module.scss', () => {
  const RUTA_SCSS = 'src/components/cabecera.module.scss'

  it('@s17 la media query del menú móvil usa exactamente "max-width: 820px", comparado contra el literal a mano', () => {
    const scss = readFileSync(RUTA_SCSS, 'utf8')

    // El literal 820px va ESCRITO A MANO aquí, jamás importado del SCSS ni de un símbolo de producción.
    expect(scss).toMatch(/@media\s*\(\s*max-width:\s*820px\s*\)/)
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

  it('el pie NO hornea una URL de Instagram (site.ts guarda un HANDLE, no una URL)', () => {
    const horneado = renderToString(<Pie />)

    expect(horneado).not.toContain('instagram.com')
  })
})
