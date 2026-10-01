import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // Los tests build-based (home-horneado, contacto-horneado) corren el `pnpm build` REAL, cada uno en
    // SU `dist/` temporal (`NLS_DIST_DIR`, H-3): ya no comparten ni tocan el `dist/` del proyecto. Pero
    // los dos construyen con la MISMA raíz, y vite-react-ssg 0.9.0 BORRA ENTERA la carpeta compartida
    // `.vite-react-ssg-temp/` al final de cada build (`fs.remove(join(root, ".vite-react-ssg-temp"))`):
    // en paralelo, un build borra el bundle SSR que el otro aún está usando → exit != 0, flaky.
    // Serializar los ficheros hace el build-based DETERMINISTA («un informe con flakiness MIENTE»). No
    // protege de un `pnpm build` lanzado a la vez desde FUERA de esta suite (otro proceso, otra suite).
    // El coste es correr los ficheros en serie; la mayoría son rápidos.
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
