import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { renderToString } from 'react-dom/server'

import { cuantosH1 } from '../lib/puerta-cascaron'
import Home from './home'

/**
 * Test de andamiaje (F-00): comprueba que la home renderiza su encabezado principal.
 * Se consulta por rol y nombre accesible, nunca por clase CSS.
 *
 * ⚠️ ESTE TEST NO VIGILA EL SEO, Y NO PUEDE: es jsdom. `react-helmet-async` hace efecto sobre
 * `document.head` en cliente y React 19 hoistea su metadata al hidratar → LOS DOS CAMINOS DAN
 * VERDE AQUÍ. jsdom es EXACTAMENTE CIEGO al bug que F-04 existe para prevenir (@s32). Lo que
 * vigila el `<head>` HORNEADO es `src/lib/puerta-cascaron.ts` sobre los BYTES de `dist/`, y lo
 * demuestra `src/lib/trampas-del-horneado.test.tsx`. NO «simplifiques» aquella puerta a un test
 * de Testing Library: LA DESACTIVARÍAS SIN ENTERARTE.
 *
 * El `HelmetProvider` es necesario desde que la cáscara emite su metadata con el `<Head>` de
 * vite-react-ssg (F-04): en el build real lo pone `ViteReactSSG`, y aquí hay que ponerlo a mano.
 */
describe('Home', () => {
  it('renderiza el encabezado principal de la página', () => {
    render(
      <HelmetProvider>
        <Home />
      </HelmetProvider>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Nails Lash Studio' })).toBeVisible()
  })
})

/**
 * @s6 (F-07) — el hero REEMPLAZA el <h1>{NOMBRE} que F-04 dejó horneado (src/pages/home.tsx:65): la
 * home hornea el hero (h1 con dos <span> + text node de espacio) y SIGUE teniendo EXACTAMENTE un
 * <h1> (no se añade otro). Se asevera sobre el HTML del prerender (renderToString), no en jsdom.
 */
describe('@s6 la home hornea el hero y sigue teniendo exactamente un <h1>', () => {
  it('@s6 la home prerenderiza exactamente 1 <h1>, con dos <span> y el text node de espacio', () => {
    const horneado = renderToString(
      <HelmetProvider>
        <Home />
      </HelmetProvider>,
    )

    expect(cuantosH1(horneado)).toBe(1)
    // El h1 del hero: dos spans con un espacio REAL entre ellos → «Nails Lash Studio».
    expect(horneado).toMatch(
      /<h1\b[^>]*>.*<span[^>]*>Nails Lash<\/span>\s<span[^>]*>Studio<\/span>.*<\/h1>/s,
    )
  })
})
