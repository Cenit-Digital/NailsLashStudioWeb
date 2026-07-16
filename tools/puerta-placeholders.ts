#!/usr/bin/env node
/**
 * El humilde de la puerta de placeholders (F-01): cablea `node:fs` y `node:process` con
 * `ejecutarPuerta`. Enganchado SOLO a `pnpm build` (producción); el build de desarrollo
 * no lo invoca (D-8: en local las fotos IA y los datos placeholder son legítimos).
 *
 * Aquí NO se decide nada: todo lo que decide vive en src/lib/puerta.ts, que está testeado
 * y mutado. Por eso este fichero no lleva tests propios ni entra en la lista `mutate`.
 *
 * Se ejecuta con el type stripping de Node 22 (`--experimental-strip-types`), que exige la
 * extensión .ts explícita en el import. `tsconfig.json` ya trae `allowImportingTsExtensions`.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import process from 'node:process'

import { ejecutarPuerta, type SistemaDeFicheros } from '../src/lib/puerta.ts'
import { registros } from '../src/lib/site.ts'

const sistemaDeFicherosReal: SistemaDeFicheros = {
  // Honra el contrato del puerto: responde sin lanzar. Es lo que permite a la puerta
  // preguntar antes de listar y no provocar el ENOENT de `readdirSync` (@s20).
  existeDirectorio: (directorio) => existsSync(directorio),
  listarFicheros: (directorio) =>
    readdirSync(directorio, { recursive: true, withFileTypes: true })
      .filter((entrada) => entrada.isFile())
      .map((entrada) => `${entrada.parentPath}/${entrada.name}`.replaceAll('\\', '/')),
  leer: (ruta) => readFileSync(ruta, 'utf8'),
}

/**
 * A-12: los `registros` verificados de F-02 (`src/lib/site.ts`) alimentan la vía por FLAG que
 * F-01 dejó cableada. Todos son esPlaceholder:false, así que no producen violaciones y el build
 * de producción sigue verde.
 *
 * 🔴 LO QUE **NO** SE CABLEA AQUÍ, Y POR QUÉ — LEE ESTO ANTES DE «ARREGLARLO» (A-21/A-11):
 * `registrosSeo` de `src/lib/seo.ts` (el ORIGEN DE LA CANÓNICA, `esPlaceholder: true`) **NO
 * entra todavía**, por DECISIÓN HUMANA del 2026-07-17. Cablearlo rompería el build de producción
 * a propósito —que es lo que @s34 describe— y dejaría `harness init`, `verify` y la CI **EN ROJO
 * PERMANENTE** hasta que el cliente decida el dominio [NV]: F-05…F-20 se desarrollarían contra un
 * rojo fijo, y **un rojo que siempre está rojo deja de ser señal**. Mismo criterio con el que
 * F-02 difirió el EMAIL (A-11).
 *   → **DIFERIDO NO ES MUERTO:** el mecanismo está PROBADO en `@s34` (`src/lib/seo.test.ts`), y
 *     el CONJUNTO de lo diferido está **ANCLADO** contra un literal a mano en
 *     `src/lib/diferidos.test.ts`: **si alguien difiere un tercer dato, ESE test se pone ROJO**.
 *     Sin el ancla, «diferido» sería un cajón donde cabe todo.
 *   → Cuando el cliente decida el dominio: se cambia el DATO y el flag a `false` en `seo.ts`, el
 *     registro **deja de ser placeholder solo** y no hay que acordarse de recablear nada aquí.
 */
const resultado = ejecutarPuerta({ modo: 'produccion', registros, ficheros: sistemaDeFicherosReal })

for (const linea of resultado.lineas) {
  console.error(`  ✗ ${linea}`)
}

if (resultado.codigoSalida === 0) {
  console.log('✓ Puerta de placeholders: el artefacto de producción no tiene placeholders.')
} else {
  console.error(`\n✗ Puerta de placeholders: el build de producción NO puede publicarse.`)
}

process.exit(resultado.codigoSalida)
