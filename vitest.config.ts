import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // Los tests build-based (home-horneado, contacto-horneado) corren el `pnpm build` REAL contra el
    // MISMO `dist/`. En paralelo, dos builds se pisan el artefacto (una puerta ve un dist/ a medio
    // escribir → exit != 0, flaky). Serializar los ficheros hace el build-based DETERMINISTA («un
    // informe con flakiness MIENTE»). El coste es correr los ficheros en serie; la mayoría son rápidos.
    fileParallelism: false,
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts', 'src/components/**/*.tsx'],
      exclude: ['src/**/*.test.*', 'src/**/*.d.ts'],
    },
  },
})
