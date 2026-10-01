/**
 * El ARTEFACTO de producción para los humildes de las puertas que lo LEEN (`puerta-cascaron`,
 * `puerta-placeholders`, `puerta-terceros` y `puerta-anclas`): DÓNDE está físicamente y cómo se NOMBRA.
 * Humilde, sin decisiones: ni lista, ni filtra, ni lee. El filtro de extensión sigue en cada humilde
 * (el de `puerta-terceros` lo anclan tests que leen ESE fichero, @s39/@s40 de F-05).
 *
 * H-3 (progress/brief_tests_build_aislado.md): el directorio FÍSICO es `NLS_DIST_DIR` si trae valor y,
 * si no (o vacía), `dist`, como siempre: la MISMA regla que `build.outDir` en `vite.config.ts`. Los
 * tests build-based la apuntan a un temporal para no tocar el `dist/` del proyecto. La ubicación
 * LÓGICA es SIEMPRE `dist/<relativa con />`: los módulos puros de `src/lib/` la siguen recibiendo tal
 * cual (de ella salen sus mensajes y el `rutaDelFichero` de la puerta del cascarón), sin enterarse de
 * dónde vive el artefacto.
 */
import { join, relative } from 'node:path'
import process from 'node:process'

const DIRECTORIO_LOGICO = 'dist'

/** El directorio FÍSICO del artefacto: `NLS_DIST_DIR`, o `dist` si no trae valor. */
export const DIRECTORIO_ARTEFACTO = process.env.NLS_DIST_DIR || DIRECTORIO_LOGICO

/** Ruta FÍSICA → ubicación LÓGICA: `<artefacto>/assets/x.css` → `dist/assets/x.css`. */
export function ubicacionLogica(rutaFisica: string): string {
  return join(DIRECTORIO_LOGICO, relative(DIRECTORIO_ARTEFACTO, rutaFisica)).replaceAll('\\', '/')
}

/** Ubicación LÓGICA → ruta FÍSICA: `dist/assets/x.css` → `<artefacto>/assets/x.css`. */
export function rutaFisica(ubicacion: string): string {
  return join(DIRECTORIO_ARTEFACTO, relative(DIRECTORIO_LOGICO, ubicacion))
}
