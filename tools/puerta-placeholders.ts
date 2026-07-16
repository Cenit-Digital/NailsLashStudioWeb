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
import { registrosSeo } from '../src/lib/seo.ts'
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
 * F-01 dejó cableada. Todos son esPlaceholder:false.
 *
 * 🔴 F-04 (A-21, @s34) AÑADE `registrosSeo`, Y AHÍ VIVE EL ORIGEN DE LA CANÓNICA CON
 * `esPlaceholder: true`. ESO ROMPE EL BUILD DE PRODUCCIÓN A PROPÓSITO, y es la DECISIÓN 9 del
 * proyecto funcionando: *el contenido no verificado vive en una capa explícita y es
 * ESTRUCTURALMENTE IMPOSIBLE publicarlo por accidente*. El dominio final NO ESTÁ DECIDIDO [NV]
 * —migrar `nailslashlasrozas.es` con 301 es decisión del CLIENTE— y NO SE INVENTA.
 *   → Cuando el cliente lo decida: se cambia el DATO y el flag en `src/lib/seo.ts`. SIN TOCAR
 *     CÓDIGO, y el build vuelve a verde solo.
 * Cada feature declara SUS registros y aquí se CONCATENAN: F-04 no toca los de F-02, cuyo
 * contrato (@s10 de datos_negocio_fuente_unica) fija que los suyos no producen violaciones.
 */
const resultado = ejecutarPuerta({
  modo: 'produccion',
  registros: [...registros, ...registrosSeo],
  ficheros: sistemaDeFicherosReal,
})

for (const linea of resultado.lineas) {
  console.error(`  ✗ ${linea}`)
}

if (resultado.codigoSalida === 0) {
  console.log('✓ Puerta de placeholders: el artefacto de producción no tiene placeholders.')
} else {
  console.error(`\n✗ Puerta de placeholders: el build de producción NO puede publicarse.`)
}

process.exit(resultado.codigoSalida)
