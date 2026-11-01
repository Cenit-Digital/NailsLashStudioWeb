import type { RouteRecord } from 'vite-react-ssg'
import type { EntornoCitas } from './lib/citas/config'
import { hayPoliticaDePrivacidad } from './lib/citas/privacidad'
import Home from './pages/home'
import PrivacidadCitas from './pages/privacidad-citas'

// La home siempre. La política de privacidad de las citas (issue #41) solo con la vía de citas
// encendida (`VITE_CITAS_API`): sin la variable, `dist/` no gana ninguna ruta.
export function rutasDe(entorno: EntornoCitas): RouteRecord[] {
  const home: RouteRecord = { path: '/', Component: Home, entry: 'src/pages/home.tsx' }
  if (!hayPoliticaDePrivacidad(entorno)) return [home]
  return [
    home,
    {
      path: 'privacidad-citas',
      Component: PrivacidadCitas,
      entry: 'src/pages/privacidad-citas.tsx',
    },
  ]
}

export const routes: RouteRecord[] = rutasDe(import.meta.env as EntornoCitas)
