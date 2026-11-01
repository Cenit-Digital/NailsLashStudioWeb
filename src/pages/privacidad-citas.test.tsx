import { render, screen, within } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'

import Privacidad from './privacidad-citas'

/**
 * Citas · issue #41: la política de privacidad de la vía de citas (RGPD art. 13, LOPDGDD art. 11).
 * Se consulta por rol y texto; los esperados van escritos a mano. Lo que vigila el <head> horneado
 * y los enlaces es la batería de puertas de `pnpm build`, no jsdom.
 */
function pintar() {
  render(
    <HelmetProvider>
      <Privacidad />
    </HelmetProvider>,
  )
}

describe('@s31 la política de privacidad de las citas', () => {
  it('tiene un solo h1 y los encabezados de sección en orden', () => {
    pintar()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Política de privacidad de las citas' }),
    ).toBeVisible()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Responsable del tratamiento',
      'Para qué usamos tus datos',
      'Por qué podemos usarlos',
      'Qué datos tratamos',
      'Quién más los recibe',
      'Cuánto tiempo los conservamos',
      'Tus derechos y cómo ejercerlos',
    ])
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0)
  })

  it('el responsable lleva la razón social, el NIF y el email como pendientes visibles, y el teléfono real', () => {
    pintar()
    const seccion = screen.getByRole('region', { name: 'Responsable del tratamiento' })
    expect(within(seccion).getByText(/\[PENDIENTE: razón social del salón\]/)).toBeVisible()
    expect(within(seccion).getByText(/\[PENDIENTE: NIF del salón\]/)).toBeVisible()
    expect(within(seccion).getByText(/\[PENDIENTE: email de contacto del salón\]/)).toBeVisible()
    expect(within(seccion).getByRole('link', { name: '625 22 33 66' })).toHaveAttribute(
      'href',
      'tel:+34625223366',
    )
    expect(within(seccion).getByText(/Av\. de Atenas 75, Local 41/)).toBeVisible()
  })

  it('finalidad, base jurídica, datos y destinatarios', () => {
    pintar()
    expect(
      within(screen.getByRole('region', { name: 'Para qué usamos tus datos' })).getByText(
        'Gestionar tu cita y enviarte la confirmación por email.',
      ),
    ).toBeVisible()
    expect(
      within(screen.getByRole('region', { name: 'Por qué podemos usarlos' })).getByText(
        /medidas precontractuales a petición tuya \(artículo 6\.1\.b del RGPD\)/,
      ),
    ).toBeVisible()
    const datos = within(screen.getByRole('region', { name: 'Qué datos tratamos' }))
    expect(datos.getAllByRole('listitem').map((i) => i.textContent)).toEqual([
      'Nombre',
      'Teléfono',
      'Email',
      'Servicio elegido',
      'Día y hora de la cita',
    ])
    const destinatarios = within(screen.getByRole('region', { name: 'Quién más los recibe' }))
    expect(destinatarios.getAllByRole('listitem').map((i) => i.textContent)).toEqual([
      'Google, como proveedor del calendario donde se apunta la cita y del correo con el que se envía la confirmación.',
      'Cloudflare Turnstile, para comprobar que quien reserva no es un programa automático.',
    ])
  })

  it('la conservación es un pendiente visible', () => {
    pintar()
    expect(
      within(screen.getByRole('region', { name: 'Cuánto tiempo los conservamos' })).getByText(
        '[PENDIENTE: plazo de conservación de los datos de la cita]',
      ),
    ).toBeVisible()
  })

  it('los derechos, cómo ejercerlos y la reclamación ante la AEPD', () => {
    pintar()
    const derechos = within(screen.getByRole('region', { name: 'Tus derechos y cómo ejercerlos' }))
    expect(derechos.getAllByRole('listitem').map((i) => i.textContent)).toEqual([
      'Acceso',
      'Rectificación',
      'Supresión',
      'Oposición',
      'Limitación del tratamiento',
      'Portabilidad',
    ])
    expect(derechos.getByRole('link', { name: '625 22 33 66' })).toHaveAttribute(
      'href',
      'tel:+34625223366',
    )
    expect(derechos.getByText(/\[PENDIENTE: email de contacto del salón\]/)).toBeVisible()
    expect(derechos.getByRole('link', { name: 'www.aepd.es' })).toHaveAttribute(
      'href',
      'https://www.aepd.es',
    )
  })

  it('la navegación enlaza cada sección y vuelve al inicio', () => {
    pintar()
    const nav = within(screen.getByRole('navigation', { name: 'Contenido de la política' }))
    expect(nav.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '#responsable-titulo',
      '#finalidad-titulo',
      '#base-titulo',
      '#datos-titulo',
      '#destinatarios-titulo',
      '#conservacion-titulo',
      '#derechos-titulo',
    ])
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
  })
})
