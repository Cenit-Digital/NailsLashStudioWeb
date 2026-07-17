#!/usr/bin/env node
/**
 * El humilde de la PUERTA DE ANCLAS VIVAS (F-06): cablea `node:fs` y `node:process` con
 * `ejecutarPuertaDeAnclas`. Enganchado SOLO a `pnpm build` (producción), DESPUÉS de
 * `vite-react-ssg build` y DESPUÉS de las otras cuatro puertas; el build de desarrollo no lo
 * invoca (@s10), igual que las puertas de F-01/F-03/F-04/F-05.
 *
 * Aquí NO se decide nada: todo lo que decide vive en src/lib/puerta-anclas.ts, que está testeado y
 * mutado. Por eso este fichero no lleva tests propios ni entra en la lista `mutate`.
 *
 * Se ejecuta con el type stripping de Node 22 (`--experimental-strip-types`), que exige la
 * extensión .ts explícita en el import. `tsconfig.json` ya trae `allowImportingTsExtensions`.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import process from 'node:process'

import { type ArtefactoDeProduccion } from '../src/lib/puerta-cascaron.ts'
import { ejecutarPuertaDeAnclas } from '../src/lib/puerta-anclas.ts'

const DIRECTORIO_ARTEFACTO = 'dist'
const ES_HTML = /\.html$/i

const artefactoReal: ArtefactoDeProduccion = {
  // Honra el contrato del puerto: responde sin lanzar. Es lo que permite a la puerta preguntar
  // antes de listar y no provocar el ENOENT de `readdirSync` (@s6).
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

const resultado = ejecutarPuertaDeAnclas({ artefacto: artefactoReal })

for (const linea of resultado.lineas) {
  console.error(`  ✗ ${linea}`)
}

if (resultado.codigoSalida === 0) {
  console.log(
    '✓ Puerta de anclas vivas: cada href="#id" de la nav resuelve a un id presente en su página y cada sección navegable está enlazada por la nav (igualdad de conjuntos).',
  )
} else {
  console.error('\n✗ Puerta de anclas vivas: el build de producción NO puede publicarse.')
}

process.exit(resultado.codigoSalida)
