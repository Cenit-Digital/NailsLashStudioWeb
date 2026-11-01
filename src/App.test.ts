import { rutasDe } from './App'

describe('@s31 las rutas del sitio', () => {
  it('sin la vía de citas, solo la home', () => {
    expect(rutasDe({}).map((r) => r.path)).toEqual(['/'])
    expect(rutasDe({ VITE_CITAS_API: '' }).map((r) => r.path)).toEqual(['/'])
  })

  it('con la vía de citas, la home y la política de privacidad', () => {
    const rutas = rutasDe({ VITE_CITAS_API: 'https://citas.example.org' })
    expect(rutas.map((r) => r.path)).toEqual(['/', 'privacidad-citas'])
    expect(rutas[1].entry).toBe('src/pages/privacidad-citas.tsx')
  })
})
