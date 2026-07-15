import type { RouteRecord } from 'vite-react-ssg'
import Home from './pages/home'

// Esqueleto: solo la home. Las rutas reales (y el Layout) llegan con sus features.
export const routes: RouteRecord[] = [{ path: '/', Component: Home, entry: 'src/pages/home.tsx' }]
