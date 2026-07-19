import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'

import baseConfig from './vitest.config'

/**
 * Configuración de Vitest EXCLUSIVA para la prueba de mutación (Stryker). El
 * `@stryker-mutator/vitest-runner` la carga por su opción documentada `vitest.configFile`
 * (stryker.config.json → `vitest.configFile`): «Specify a 'vitest.config.js' file to be loaded»
 * (stryker-mutator.io/docs/stryker-js/vitest-runner). `pnpm test`, `pnpm build` y `bin/harness verify`
 * siguen usando `vitest.config.ts` SIN esta exclusión.
 *
 * PROBLEMA que resuelve (F-12): la corrida por-mutante tardaba 409 min con 17 timeouts. Causa raíz:
 * los tests build-based (`*-horneado.test.{ts,tsx}`: home-horneado, contacto-horneado y
 * trampas-del-horneado) ejecutan un BUILD REAL (`pnpm build` / `vite-react-ssg build`) en `beforeAll`.
 * Ese build corre TODO el proyecto en un proceso HIJO; la cobertura per-test de Stryker (que es
 * IN-PROCESS) no puede atribuir su ejecución a un mutante concreto, así que acaban re-ejecutándose por
 * CADA mutante → decenas/cientos de builds completos en serie. NO son unit tests: son tests de
 * INTEGRACIÓN («capa autoritativa», verde ≠ funciona). Su papel de MUTACIÓN ya lo cubren EN PROCESO
 * los unit tests de los mismos literales (site.test.ts, contacto.test.tsx, contacto-fuente.test.ts…),
 * escritos a mano (anti-tautología). Por eso se sacan de la MUTACIÓN, NO del `pnpm test`.
 *
 * `test.exclude` es el mecanismo NATIVO de Vitest (vitest.dev/config/#exclude): Vitest simplemente no
 * recolecta esos ficheros en esta corrida — equivale a que no existieran. NO es `--testFiles` de
 * Stryker, PROHIBIDO en este stack porque da un 0% FALSO (docs/research/00-fase0-informe.md §6.3): los
 * unit tests siguen recolectándose y matando el 100%. Se PRESERVAN los `configDefaults.exclude`
 * (node_modules, dist, *.config.*…) al ampliar la lista, no se reemplazan.
 *
 * `fileParallelism: true`: el serializado (`false`) del base existe SOLO por el flaky entre
 * `home-horneado` y `contacto-horneado` compartiendo el mismo `dist/`. Excluidos ambos aquí, no hay
 * contención de artefacto → se puede paralelizar, y así la cobertura per-test de Stryker se aísla por
 * fichero en vez de compartir un proceso serial.
 */
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      exclude: [...configDefaults.exclude, '**/*-horneado.test.{ts,tsx}'],
      fileParallelism: true,
    },
  }),
)
