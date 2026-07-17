#!/usr/bin/env node
/**
 * El humilde de la puerta de terceros (F-05): cablea `node:fs` y `node:process` con
 * `ejecutarPuertaDeTerceros`. Enganchado SOLO a `pnpm build` (producción); el build de desarrollo
 * NO lo invoca (@s36), igual que las puertas de F-01, F-03 y F-04. LA PUERTA SEPARA «VER» DE
 * «PUBLICAR»: en local, mientras se porta el diseño, una petición a Google Fonts es legítima un
 * rato. Lo que es imposible es PUBLICARLA.
 *
 * Aquí NO se decide nada: todo lo que decide vive en src/lib/puerta-terceros.ts y src/lib/terceros.ts,
 * que están testeados y mutados. Por eso este fichero no lleva fichero de test propio ni entra en la
 * lista `mutate`. Pero «sin fichero de test propio» NO ES «sin ancla»: las DOS decisiones que viven
 * aquí se anclan desde tests que LEEN ESTE FICHERO (@s39 y @s40), forma `src/lib/diferidos.test.ts`.
 *
 * Se ejecuta con el type stripping de Node 22 (`--experimental-strip-types`), que exige la
 * extensión .ts explícita en el import. `tsconfig.json` ya trae `allowImportingTsExtensions`.
 */
import { readdirSync, readFileSync } from 'node:fs'
import process from 'node:process'

import {
  ejecutarPuertaDeTerceros,
  PARES_DE_FUENTE_ESPERADOS,
} from '../src/lib/puerta-terceros.ts'
import type { RecursoDeArtefacto } from '../src/lib/terceros.ts'

const DIRECTORIO_ARTEFACTO = 'dist'
const FICHERO_DE_CONFIG = 'vite.config.ts'

/**
 * 🔴 A-27 — EL FILTRO DE EXTENSIÓN, Y ES UNA DECISIÓN, NO HIGIENE. El acceptance 1 acota el alcance
 * a `(html|css)`, y este filtro es lo que lo hace verdad. Lo ancla @s40 leyendo ESTE fichero, y
 * @s34 asevera su consecuencia.
 *
 * POR QUÉ, MEDIDO — y la razón fuerte NO es «un literal no es un fetch», es ésta:
 *   (a) Los `.js` de `dist/assets` traen los DATOS REALES de features `done` que Rollup inlinea —
 *       `https://schema.org` y `https://example.invalid` (F-04), y
 *       `https://www.facebook.com/nailslashstudiorozas/` (`REDES.facebook`, F-02). UN `grep
 *       https?://` SOBRE EL `.js` LOS MARCARÍA Y ROMPERÍA EL BUILD DE UN REPO CORRECTO. La
 *       verificación lo prohíbe expresamente: «NO grepear `https?://` sobre `dist/assets/*.js`:
 *       FALSOS POSITIVOS GARANTIZADOS» [V].
 *   (b) F-05 es la PRIMERA feature que mete BINARIOS en `dist/`. Leer un `.woff2` como utf8 no
 *       lanza: da U+FFFD (medido: 554.818 sobre los 108 ficheros reales, y 50.100 secuencias
 *       candidatas al regex del teléfono en ese ruido). LEER BINARIOS ES UN FALSO POSITIVO
 *       ESPERANDO A OCURRIR. Misma razón que `ES_HTML = /\.html$/i` en tools/puerta-cascaron.ts:23,
 *       cuyo comentario ya cita el riesgo `.woff2` por su nombre.
 *
 * 🔴 HUECO CONOCIDO, DECLARADO, NO CERRADO: con el alcance `(html|css)`, un
 * `fetch('https://tercero…')` desde el JS del bundle NO LO CAZARÍA ESTA PUERTA. Hoy no existe
 * ninguno [V, medido]. ES DEUDA DECLARADA, NO UN PROBLEMA RESUELTO: distinguir un `fetch` real de un
 * literal exige analizar el AST de un bundle minificado, y ESO ES OTRA FEATURE, CON SUS ESCENARIOS.
 * Una puerta que se cree infalible es peor que ninguna.
 *
 * 🔴 A-27 TAMBIÉN DECIDIÓ LO QUE F-05 **NO** HACE: NO toca `tools/puerta-placeholders.ts`, que lista
 * TODOS los ficheros SIN filtro de extensión. Esa deuda es de F-01 (feature `done`) y cerrarla exige
 * un escenario nuevo en `features/puerta_placeholders.feature`; hacerlo aquí sería producción sin
 * test rojo — violación de la Ley 1. LA DEUDA DE F-01 SIGUE VIVA Y DECLARADA.
 */
const ES_HTML_O_CSS = /\.(html|css)$/i

const TIPO_CSS = 'css'
const ES_CSS = /\.css$/i

const artefactoReal = (): readonly RecursoDeArtefacto[] =>
  // LANZA si `dist/` no existe, que es lo que hace `readdirSync` — y es el contrato del puerto: la
  // puerta falla cerrada con el motivo (@s32). F-05 no lleva `existe*` a propósito: no hay ningún
  // escenario que exija una línea distinta, y sin él sería producción sin test rojo.
  readdirSync(DIRECTORIO_ARTEFACTO, { recursive: true, withFileTypes: true })
    .filter((entrada) => entrada.isFile() && ES_HTML_O_CSS.test(entrada.name))
    .map((entrada) => {
      const ubicacion = `${entrada.parentPath}/${entrada.name}`.replaceAll('\\', '/')

      return {
        ubicacion,
        tipo: ES_CSS.test(entrada.name) ? TIPO_CSS : ('html' as const),
        contenido: readFileSync(ubicacion, 'utf8'),
      }
    })

const resultado = ejecutarPuertaDeTerceros({
  leerArtefacto: artefactoReal,
  // LANZA si `vite.config.ts` no existe, que es lo que hace `readFileSync` (@s33). Se lee como
  // TEXTO y decide una función pura: un `import` de la config EJECUTARÍA código y no vería `--base`.
  leerConfigVite: () => readFileSync(FICHERO_DE_CONFIG, 'utf8'),
  /**
   * 🔴 A-23 — LA ALLOWLIST DE PRODUCCIÓN ES `[]`, Y VA ESCRITO AQUÍ PARA QUE QUIEN LA RELLENE TENGA
   * QUE LEER POR QUÉ ESTABA VACÍA. Lo ancla @s39 leyendo este fichero.
   *
   * NO SE PERMITE NINGÚN ORIGEN. Ni uno. El invariante titular de F-05 es «cero peticiones
   * automáticas a terceros», y una allowlist con algo dentro lo derrota EN SILENCIO: un
   * `["fonts.googleapis.com"]` aquí dejaría los 40 escenarios verdes y el build verde, y EMBARCARÍA
   * GOOGLE FONTS — el acceptance 3 derrotado con la puerta en verde.
   *
   * Que el parámetro EXISTA (y no esté cableado dentro del fichero mutado) es la ÚNICA NECESIDAD
   * del diseño: cableado, el mutante `FilterRemoval` sería GENUINAMENTE INMATABLE [V, medido]. Que
   * PUEDA ser no vacía (@s20) y que EN PRODUCCIÓN SEA `[]` (@s39) son la CAPACIDAD y el VALOR: dos
   * cosas distintas, y las dos hacen falta.
   */
  allowlist: [],
  paresEsperados: PARES_DE_FUENTE_ESPERADOS,
})

for (const linea of resultado.lineas) {
  console.error(`  ✗ ${linea}`)
}

if (resultado.codigoSalida === 0) {
  console.log(
    `✓ Puerta de terceros: el artefacto no contiene ninguna construcción que provoque una petición automática a un origen externo, y hornea los ${String(PARES_DE_FUENTE_ESPERADOS.length)} pares de fuente autohospedados esperados. Ningún tercero recibe la IP del visitante.`,
  )
} else {
  console.error('\n✗ Puerta de terceros: el build de producción NO puede publicarse.')
}

process.exit(resultado.codigoSalida)
