#!/usr/bin/env node
/**
 * El humilde de la puerta del cascarón (F-04): cablea `node:fs` y `node:process` con
 * `ejecutarPuertaDelCascaron`. Enganchado SOLO a `pnpm build` (producción); el build de
 * desarrollo no lo invoca (@s31), igual que las puertas de F-01 y F-03.
 *
 * Aquí NO se decide nada: todo lo que decide vive en src/lib/puerta-cascaron.ts, que está
 * testeado y mutado. Por eso este fichero no lleva tests propios ni entra en la lista `mutate`.
 *
 * Se ejecuta con el type stripping de Node 22 (`--experimental-strip-types`), que exige la
 * extensión .ts explícita en el import. `tsconfig.json` ya trae `allowImportingTsExtensions`.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import process from 'node:process'

import {
  type ArtefactoDeProduccion,
  ejecutarPuertaDelCascaron,
  RUTAS_ESPERADAS,
} from '../src/lib/puerta-cascaron.ts'
// 🟠 ENMIENDA 1 (2026-07-25, @s37): la MISMA extracción de texto que ya usa `tools/puerta-terceros.ts`
// para leer `base` de `vite.config.ts` — sin revalidar su legitimidad (eso es de F-05); esta puerta
// solo necesita el PREFIJO literal. Ver src/lib/puerta-terceros.ts y progress/enmienda_cascaron_base.md.
import { baseDeclarada } from '../src/lib/puerta-terceros.ts'

const DIRECTORIO_ARTEFACTO = 'dist'
const ES_HTML = /\.html$/i
const FICHERO_DE_CONFIG = 'vite.config.ts'

const artefactoReal: ArtefactoDeProduccion = {
  // Honra el contrato del puerto: responde sin lanzar. Es lo que permite a la puerta preguntar
  // antes de listar y no provocar el ENOENT de `readdirSync` (@s26).
  existe: () => existsSync(DIRECTORIO_ARTEFACTO),
  // Y honra la otra mitad: LANZA si el directorio no existe, que es lo que hace `readdirSync`.
  // Solo HTML: un binario (.png, .woff2) leído como utf8 se decodifica a U+FFFD sin lanzar y
  // sería falso positivo en potencia.
  listarHtml: () =>
    readdirSync(DIRECTORIO_ARTEFACTO, { recursive: true, withFileTypes: true })
      .filter((entrada) => entrada.isFile() && ES_HTML.test(entrada.name))
      .map((entrada) => {
        const ubicacion = `${entrada.parentPath}/${entrada.name}`.replaceAll('\\', '/')

        return { ubicacion, contenido: readFileSync(ubicacion, 'utf8') }
      }),
}

const resultado = ejecutarPuertaDelCascaron({
  artefacto: artefactoReal,
  rutasEsperadas: RUTAS_ESPERADAS,
  // LANZA si vite.config.ts no existe, mismo contrato que tools/puerta-terceros.ts. Se lee como
  // TEXTO, nunca se importa: la puerta no ejecuta la config, solo necesita el prefijo literal.
  base: baseDeclarada(readFileSync(FICHERO_DE_CONFIG, 'utf8')),
})

for (const linea of resultado.lineas) {
  console.error(`  ✗ ${linea}`)
}

if (resultado.codigoSalida === 0) {
  console.log(
    `✓ Puerta del cascarón: las ${String(RUTAS_ESPERADAS.length)} ruta(s) del artefacto llevan horneados el idioma, el title, la description, la canónica, un h1, los landmarks y el JSON-LD, y ningún enlace interno apunta a la nada.`,
  )
} else {
  console.error('\n✗ Puerta del cascarón: el build de producción NO puede publicarse.')
}

process.exit(resultado.codigoSalida)
