#!/usr/bin/env node
/**
 * El humilde de la puerta de contraste (F-03): cablea `node:fs` y `node:process` con
 * `ejecutarPuertaDeContraste`. Enganchado SOLO a `pnpm build` (producción); el build de
 * desarrollo no lo invoca, igual que la puerta de placeholders de F-01.
 *
 * Aquí NO se decide nada: todo lo que decide vive en src/lib/puerta-contraste.ts, que está
 * testeado y mutado. Por eso este fichero no lleva tests propios ni entra en la lista `mutate`.
 *
 * Se ejecuta con el type stripping de Node 22 (`--experimental-strip-types`), que exige la
 * extensión .ts explícita en el import. `tsconfig.json` ya trae `allowImportingTsExtensions`.
 */
import { readFileSync } from 'node:fs'
import process from 'node:process'

import {
  ejecutarPuertaDeContraste,
  MATRIZ_DE_USO,
  MINIMO_DE_PARES,
  RUTA_DE_LOS_TOKENS,
} from '../src/lib/puerta-contraste.ts'

// Honra el contrato del puerto: LANZA si el fichero no existe o no se puede leer, y la
// puerta lo convierte en un build roto que declara la causa (@s15).
const resultado = ejecutarPuertaDeContraste({
  leerScss: () => readFileSync(RUTA_DE_LOS_TOKENS, 'utf8'),
  matriz: MATRIZ_DE_USO,
  minimoDePares: MINIMO_DE_PARES,
})

for (const linea of resultado.lineas) {
  console.error(`  ✗ ${linea}`)
}

if (resultado.codigoSalida === 0) {
  console.log(
    `✓ Puerta de contraste: los ${MINIMO_DE_PARES} pares en uso cumplen su umbral WCAG 2.2 AA.`,
  )
} else {
  console.error('\n✗ Puerta de contraste: el build de producción NO puede publicarse.')
}

process.exit(resultado.codigoSalida)
