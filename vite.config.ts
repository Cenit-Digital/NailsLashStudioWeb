import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vite.dev/config/ · SSG vía vite-react-ssg (ver package.json "build").
// Vite 7 usa el API moderno de Dart Sass por defecto (sass-embedded), sin avisos de deprecación.
//
// `base` FIJA COMO LITERAL SIMPLE (2026-07-25, tras dos enmiendas — ver progress/tdd_subruta_github_pages.md
// y progress/enmienda_cascaron_base.md): el sitio se publica HOY en GitHub Pages DE PROYECTO
// (`https://<org>.github.io/NailsLashStudioWeb/`), y no hay dominio propio todavía — DECISIÓN
// EXPLÍCITA de Pablo, temporal hasta que el cliente pague y se despliegue en servidor propio. Una
// expresión DINÁMICA (`process.env.PAGES_BASE_PATH ?? '/'`) se intentó dos veces y se revirtió: la
// puerta de terceros (F-05, `violacionesDeBase`) lee este fichero como TEXTO, sin evaluarlo, así que
// una expresión no-literal nunca empieza por `/` y rompe el build SIEMPRE, tenga o no la variable de
// entorno un valor. El literal `/NailsLashStudioWeb/` SÍ es una ruta same-origin root-absoluta
// (ENMIENDA 1 de `cero_terceros.feature`, @s27) y la puerta anti-404 de F-04 (ENMIENDA 1 de
// `cascaron_semantico.feature`, @s36-@s38) ya sabe resolver los hrefs internos bajo este prefijo.
// `vitest.config.ts` es un fichero SEPARADO que NO declara `base`: este cambio NO afecta a ningún
// test (siempre ven `import.meta.env.BASE_URL === '/'`), solo a `pnpm dev`/`build`/`preview` reales.
export default defineConfig({
  base: '/NailsLashStudioWeb/',
  plugins: [react()],
  ssgOptions: {
    script: 'async',
    entry: 'src/main.tsx',
    dirStyle: 'nested',
    formatting: 'none',
  },
})
