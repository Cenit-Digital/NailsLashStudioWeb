import { render, screen } from '@testing-library/react'
import Home from './home'

// Test de andamiaje: comprueba que la home renderiza su encabezado principal.
// Se consulta por rol y nombre accesible, nunca por clase CSS: `css: false` en
// vitest.config.ts hace que los CSS Modules no se procesen en test.
describe('Home', () => {
  it('renderiza el encabezado principal de la página', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { level: 1, name: 'Nails & Lash Studio' })).toBeVisible()
  })
})
