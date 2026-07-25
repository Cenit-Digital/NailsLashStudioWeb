import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './App'

/**
 * LAS FUENTES AUTOHOSPEDADAS (F-05) — 6 imports, 6 woff2, 119.540 bytes [V, medido a la unidad
 * sobre `@fontsource` 5.2.8 instalado].
 *
 * Autoalojamos para que el sitio NO HAGA NINGUNA PETICIÓN A DOMINIOS DE TERCEROS: así ningún
 * tercero recibe la IP del visitante y no hace falta ningún análisis jurídico. Es CRITERIO DE
 * PROYECTO, decisión del editor, y NO CUELGA DE NINGUNA CITA. `tools/puerta-terceros.ts` lo
 * demuestra en cada build.
 *
 * 🔴 `latin-<peso>.css` Y NADA MÁS — ES LA TRAMPA INVERSA A LA QUE SUGIERE EL NOMBRE [V, medido]:
 *   - `@fontsource/manrope` NO trae todos los pesos: trae SOLO el 400, en los 6 subsets. Faltarían
 *     500/600/700 EN SILENCIO (faux-bold sintético, SIN error en consola).
 *   - `400.css` TAMBIÉN trae los 6 subsets. Solo `latin-<peso>.css` trae uno.
 *   - `@fontsource-variable` NO se usa: solo existe para Manrope (las otras dos dan 404), no tiene
 *     `latin.css`, y RENOMBRA LA FAMILIA a 'Manrope Variable' → si el SCSS dice 'Manrope', la
 *     fuente NO CARGA y cae al fallback SIN NINGÚN ERROR. Si llegara a `dist`, @s29 rompe el build.
 *
 * Los pesos son los MEDIDOS sobre el prototipo, NO heredados [V]: Manrope 400/500/600/700 (cuerpo,
 * botones, nav), Gilda Display 400 (h2/h3, precios), Great Vibes 400 (el «Nails Lash» del hero).
 * El prototipo pide `wght@300` y NO LO USA NI UNA VEZ [V]: por eso el 300 NO se importa, y si
 * entrara, la guarda de @s29 rompería el build.
 *
 * ✅ A-28 (puerta humana, 2026-07-17): SOLO subset `latin` (cubre U+0000-00FF: todo el español).
 * EL LÍMITE, DECLARADO: `latin-400.css` NO tiene `unicode-range` [V], así que ese `@font-face`
 * aplica a TODO el rango — un nombre con `Ł`/`ř`/`ğ` PINTA TOFU, sin error y sin aviso. Es decisión
 * de PRODUCTO tomada a conciencia. `latin-ext` entrará el día que exista un nombre REAL que lo
 * exija, y ENTRARÁ CON SU ESCENARIO.
 *
 * ⚠️ F-05 HORNEA LOS `@font-face`; NO ESCRIBE NI UN `font-family` DE USO — eso es F-06/F-07.
 * Consecuencia DECLARADA, no oculta: mientras nada referencie una familia, el navegador no descarga
 * su woff2 (css-fonts-4 §4.8.1 [V]). NO afecta al invariante: cero terceros se cumple igual.
 */
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/gilda-display/latin-400.css'
import '@fontsource/great-vibes/latin-400.css'

import './styles/main.scss'

// `createRoot` es el nombre que busca vite-react-ssg: no es opcional.
// `basename` viaja a react-router: `vite.config.ts` fija `base: '/NailsLashStudioWeb/'`
// (ENMIENDA 1 a F-05/F-04, 2026-07-25), así que en producción `basename` vale
// '/NailsLashStudioWeb/', no '/'. Ver el porqué en progress/tdd_subruta_github_pages.md.
export const createRoot = ViteReactSSG({ routes, basename: import.meta.env.BASE_URL })
