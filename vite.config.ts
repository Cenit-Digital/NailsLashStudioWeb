import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

import { sinPrecargasDeFuenteWoff, sinPrecargasDeImagen } from './src/lib/horneado'

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
//
// SIN `ssgOptions.script` (2026-09-28, ENMIENDA 2 de `cascaron_semantico.feature`, @s39): vale el
// valor por defecto de vite-react-ssg, `'sync'`, que deja el `<script type="module">` del bundle SIN
// `async`. HTML Living Standard §4.12.1: un módulo con `async` se evalúa «as soon as it is available
// (potentially before parsing completes)»; sin él, «when the page has finished parsing» («The defer
// attribute has no effect on module scripts»). Con `'async'` el cliente podía arrancar ANTES de que
// se parseara el snapshot del router del final del `<body>` → #418 de React y la home VACÍA en 1-6 de
// cada 20 cargas en frío; sin él, 0 de 48. El porqué antiguo («no bloquea el parseo») era falso: un
// módulo nunca bloquea el parseo. Evidencia: progress/hallazgo_hidratacion_ssg.md. NO lo reintroduzcas.
export default defineConfig({
  base: '/NailsLashStudioWeb/',
  plugins: [react()],
  ssgOptions: {
    entry: 'src/main.tsx',
    dirStyle: 'nested',
    formatting: 'none',
    // @s40 (ENMIENDA 2): vite-react-ssg inyecta SIEMPRE un `<link rel="preload" as="image">` por foto,
    // sin opción para desactivarlo; las `<img>` son `loading="lazy"` y no lo reutilizan. @s41 (ENMIENDA
    // 3, decisión del humano): también precarga el `.woff` de cada fuente además del `.woff2`, y el
    // navegador descargaba los dos; solo se precarga el `.woff2` (el `.woff` sigue de respaldo en el
    // CSS). Se retiran del HTML ya serializado, antes de escribirlo en `dist/`. La lógica (pura,
    // testeada y mutada) vive en src/lib/horneado.ts; aquí solo se cablea.
    onPageRendered: (_ruta, html) => sinPrecargasDeFuenteWoff(sinPrecargasDeImagen(html)),
  },
})
