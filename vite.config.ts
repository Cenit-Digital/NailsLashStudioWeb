import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vite.dev/config/ · SSG vía vite-react-ssg (ver package.json "build").
// Vite 7 usa el API moderno de Dart Sass por defecto (sass-embedded), sin avisos de deprecación.
export default defineConfig({
  plugins: [react()],
  ssgOptions: {
    script: 'async',
    entry: 'src/main.tsx',
    dirStyle: 'nested',
    formatting: 'none',
  },
})
