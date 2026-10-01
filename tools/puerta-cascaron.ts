#!/usr/bin/env node
/**
 * El humilde de la puerta del cascarón (F-04): cablea `node:fs` y `node:process` con
 * `ejecutarPuertaDelCascaron`. Enganchado SOLO a `pnpm build` (producción); el build de
 * desarrollo no lo invoca (@s31), igual que las puertas de F-01 y F-03.
 *
 * Aquí NO se decide nada: todo lo que decide vive en src/lib/puerta-cascaron.ts, que está
 * testeado y mutado. Por eso este fichero no lleva tests propios ni entra en la lista `mutate`.
 *
 * H-3: el artefacto se lee de donde diga `tools/artefacto.ts` (`NLS_DIST_DIR`, o `dist`), y la
 * puerta lo sigue recibiendo con ubicaciones LÓGICAS `dist/…`.
 *
 * ENMIENDA 5 (H-5): y la LISTA de ficheros del artefacto (`ficheros`), contra la que la puerta
 * resuelve cada `<link>` root-absoluto. Sin ella, con algún `<link>` así, la puerta corta (S-3).
 *
 * Se ejecuta con el type stripping de Node 22 (`--experimental-strip-types`), que exige la
 * extensión .ts explícita en el import. `tsconfig.json` ya trae `allowImportingTsExtensions`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

import {
  type ArtefactoDeProduccion,
  ejecutarPuertaDelCascaron,
  type ListaDeFicheros,
  RUTAS_ESPERADAS,
} from '../src/lib/puerta-cascaron.ts'
// 🟠 ENMIENDA 1 (2026-07-25, @s37): la MISMA extracción de texto que ya usa `tools/puerta-terceros.ts`
// para leer `base` de `vite.config.ts` — sin revalidar su legitimidad (eso es de F-05); esta puerta
// solo necesita el PREFIJO literal. Ver src/lib/puerta-terceros.ts y progress/enmienda_cascaron_base.md.
import { baseDeclarada } from '../src/lib/puerta-terceros.ts'
import { DIRECTORIO_ARTEFACTO, ubicacionLogica } from './artefacto.ts'

const ES_HTML = /\.html$/i
const FICHERO_DE_CONFIG = 'vite.config.ts'

/**
 * Las rutas FÍSICAS de todos los FICHEROS del artefacto, en todas sus subcarpetas, sin las carpetas
 * (en Windows, `statSync` de una carpeta da 0 B: @s67). LANZA si el directorio no existe.
 */
function rutasDeLosFicheros(): readonly string[] {
  return readdirSync(DIRECTORIO_ARTEFACTO, { recursive: true, withFileTypes: true })
    .filter((entrada) => entrada.isFile())
    .map((entrada) => join(entrada.parentPath, entrada.name))
}

const artefactoReal: ArtefactoDeProduccion = {
  // Honra el contrato del puerto: responde sin lanzar. Es lo que permite a la puerta preguntar
  // antes de listar y no provocar el ENOENT de `readdirSync` (@s26).
  existe: () => existsSync(DIRECTORIO_ARTEFACTO),
  // Y honra la otra mitad: LANZA si el directorio no existe, que es lo que hace `readdirSync`.
  // Solo HTML: un binario (.png, .woff2) leído como utf8 se decodifica a U+FFFD sin lanzar y
  // sería falso positivo en potencia.
  listarHtml: () =>
    rutasDeLosFicheros()
      .filter((ruta) => ES_HTML.test(ruta))
      .map((ruta) => ({ ubicacion: ubicacionLogica(ruta), contenido: readFileSync(ruta, 'utf8') })),
}

// ENMIENDA 5 (H-5): TODOS los ficheros, de cualquier extensión, ocultos y HTML incluidos, con su tamaño
// y SIN leer su contenido (A-27). No filtra nada: lo que el despliegue no publica lo decide la puerta
// (la regla 5, que se muta; @s71). Es un método porque solo se recorre si la puerta lo pide, y siempre
// DESPUÉS de `existe()`: listarlo antes daría, con `dist/` ausente, un ENOENT FUERA de la puerta (@s70).
const listaReal: ListaDeFicheros = {
  listar: () =>
    rutasDeLosFicheros().map((ruta) => ({
      ubicacion: ubicacionLogica(ruta),
      bytes: statSync(ruta).size,
    })),
}

const resultado = ejecutarPuertaDelCascaron({
  artefacto: artefactoReal,
  ficheros: listaReal,
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

// process.exitCode y NO process.exit(): en Windows, salir a la fuerza con E/S pendiente dispara la
// aserción de libuv «!(handle->flags & UV_HANDLE_CLOSING)» (nodejs/node#56645) y el build muere con
// 0xC0000409 aunque la puerta pase. La documentación de Node recomienda dejar que el proceso termine solo.
process.exitCode = resultado.codigoSalida
