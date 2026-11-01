// Citas · Fase 8 (issue #41): empaqueta la API en un único ESM para la imagen, sin node_modules en
// tiempo de ejecución. Incluye lo que importa de `src/lib/` (catálogo, disponibilidad y site.ts), que
// vive fuera de `api/`. Patrón de RAGchatbotIA (apps/api/construir.mjs): la API JS de esbuild, no su
// binario, porque pnpm lo invoca con node.
import { build } from 'esbuild'

await build({
  entryPoints: ['src/servidor.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  outfile: 'dist/servidor.mjs',
  // pg usa require(): se le da uno al bundle ESM.
  banner: {
    js: "import{createRequire}from'node:module';const require=createRequire(import.meta.url);",
  },
  // pg intenta cargar su variante nativa opcional; no se usa.
  external: ['pg-native'],
  logLevel: 'warning',
})
