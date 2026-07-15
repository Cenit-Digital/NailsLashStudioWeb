import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './App'
import './styles/main.scss'

// `createRoot` es el nombre que busca vite-react-ssg: no es opcional.
export const createRoot = ViteReactSSG({ routes })
