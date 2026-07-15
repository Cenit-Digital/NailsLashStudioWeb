# Stack base WebEmpresa — Vitest + Testing Library + jsdom + Stryker

> **Área investigada:** setup real de testing y mutación en
> `C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/WebEmpresa`,
> su integración con el arnés, y cómo acotar la mutación a un módulo.
>
> **Método:** lectura del código real (archivo:línea), ejecución real de comandos
> en la máquina, y contraste con documentación oficial (Vitest, StrykerJS,
> Testing Library). Todo lo no verificado está marcado como tal.
>
> **Fecha del análisis:** 2026-07-15.

---

## 1. Respuesta ejecutiva

**Qué hacemos:** copiar el stack de testing de WebEmpresa casi tal cual, porque
está verificado y funcionando en un proyecto real de la misma casa y el mismo
stack (Vite + React + TypeScript + pnpm + SSG).

Concretamente:

1. **Vitest con `environment: 'jsdom'`, `globals: true`, `setupFiles: ['./vitest.setup.ts']`**
   y un `vitest.setup.ts` de **una sola línea**: `import '@testing-library/jest-dom/vitest'`.
   Verificado en `WebEmpresa/vitest.config.ts:1-19` y `WebEmpresa/vitest.setup.ts:1`.
2. **`css: false`** en la config de test: los SCSS modules no se compilan al testear.
   Verificado en `WebEmpresa/vitest.config.ts:10`. Esto obliga a un estilo de test que
   **no asevera clases CSS** sino roles ARIA, nombres accesibles y `data-*`.
3. **Stryker con `testRunner: "vitest"`**, `thresholds.break: 100` y una **lista
   explícita de archivos** en `mutate` (no un glob). Verificado en
   `WebEmpresa/stryker.config.json:5-35`.
4. **Para acotar la mutación a un módulo:** `stryker run --mutate <ruta>`, y si se
   quiere afinar más, el **rango de mutación** `--mutate "src/lib/nav.ts:19-19"`.

**Hallazgo crítico y no obvio (verificado ejecutándolo, ver §2.5.3):**
**NO uses `--testFiles` para acotar.** En este stack exacto produce un
**0% de score falso** (16/16 mutantes "supervivientes") mientras que el mismo
comando sin `--testFiles` da **100%**. Es una trampa que haría que el
`mutation_tester` reportara un falso agujero y el `tdd_craftsman` escribiera tests
para matar mutantes que ya estaban muertos.

**Diferencia importante respecto al enunciado de la tarea:** se me pidió estudiar
"cómo se integra con el arnés (`bin/harness`, `init.sh`)". **WebEmpresa NO tiene
`bin/harness` ni `harness.config.json`** (verificado, §2.4). WebEmpresa es anterior
al motor agnóstico: se integra solo por `init.sh` + scripts de `package.json`.
El motor `bin/harness` existe en **este** repo (NailsLashStudioWeb). Por tanto la
integración hay que **construirla**, no copiarla: rellenando `commands.mutate` con
el token `{{target}}`.

**Por qué:** el pipeline Uncle Bob exige que la mutación se pueda acotar a las
líneas tocadas por la feature (`docs/mutation-testing.md:73-75` de este repo). Con
la lista fija de `mutate` de WebEmpresa, cada corrida muta los 17 archivos y tarda
minutos; con `--mutate <fichero>` tarda ~1 min y con rango de líneas ~7 s
(medido, §2.5.2).

---

## 2. Desarrollo con evidencia

### 2.1 Versiones exactas instaladas (verificado ejecutando)

Ejecutado en `WebEmpresa/` leyendo el `package.json` de cada paquete en
`node_modules`, no de memoria:

| Paquete | Versión instalada | Rango declarado (`package.json:40-64`) |
|---|---|---|
| `vitest` | **4.1.9** | `^4.0.0` (`package.json:63`) |
| `jsdom` | **25.0.1** | `^25.0.0` (`package.json:56`) |
| `@testing-library/react` | **16.3.2** | `^16.3.0` (`package.json:45`) |
| `@testing-library/jest-dom` | **6.9.1** | `^6.6.0` (`package.json:44`) |
| `@testing-library/user-event` | **14.6.1** | `^14.6.0` (`package.json:46`) |
| `@stryker-mutator/core` | **9.6.1** | `^9.6.0` (`package.json:42`) |
| `@stryker-mutator/vitest-runner` | **9.6.1** | `^9.6.0` (`package.json:43`) |
| `react` | **19.2.7** | `^19.2.0` (`package.json:36`) |
| `@vitejs/plugin-react-swc` | **3.11.0** | `^3.11.0` (`package.json:50`) |
| `@vitest/coverage-v8` | **4.1.9** | `^4.0.0` (`package.json:51`) |

Motor y gestor exigidos (`WebEmpresa/package.json:8-12`):
`"packageManager": "pnpm@11.9.0"`, `engines.node: ">=22.12.0"`, `engines.pnpm: ">=10"`.

> **Inferencia mía (no verificada):** `jsdom` está en `devDependencies`
> (`package.json:56`) porque Vitest **no** lo trae de serie. La doc oficial de
> Vitest describe jsdom como entorno disponible pero **no encontré una frase
> explícita que diga "instálalo aparte"** (ver §3).

---

### 2.2 Setup de Vitest + Testing Library + jsdom

#### 2.2.1 `vitest.config.ts` (transcripción íntegra — `WebEmpresa/vitest.config.ts:1-19`)

```ts
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts'],
      exclude: ['src/**/*.test.*', 'src/**/*.d.ts'],
    },
  },
})
```

Lectura línea a línea, con la fuente oficial de cada opción:

| Línea | Opción | Qué implica | Fuente oficial |
|---|---|---|---|
| `:5` | `plugins: [react()]` | El JSX/TSX se transpila con SWC en los tests, igual que en build. | Config real, `vitest.config.ts:5` |
| `:7` | `globals: true` | `describe/it/expect` disponibles sin importar. **El default de Vitest es `false`** — "By default, `vitest` does not provide global APIs for explicitness". Requiere `types: ["vitest/globals"]` en tsconfig. | https://vitest.dev/config/globals (verificado) |
| `:8` | `environment: 'jsdom'` | El **default de Vitest es `'node'`**; hay que activar jsdom explícitamente. Built-ins: `'node'`, `'jsdom'`, `'happy-dom'`, `'edge-runtime'`. Se puede sobreescribir por fichero con el docblock `// @vitest-environment jsdom`. | https://vitest.dev/config/environment y https://vitest.dev/guide/environment (verificado) |
| `:9` | `setupFiles: ['./vitest.setup.ts']` | "Paths to setup files resolved relative to the `root`. They will run **before each _test file_** in the same process." Vitest ignora los exports de esos ficheros. | https://vitest.dev/config/setupfiles (verificado, cita textual) |
| `:10` | `css: false` | Los CSS/SCSS **no** se procesan en test. **Consecuencia dura:** `styles.foo` de un `*.module.scss` no devuelve la clase real, así que **los tests no pueden aseverar clases CSS**. (Inferencia mía a partir de la config; el estilo de los tests reales lo confirma: ninguno asevera `className`, ver §2.6.) |
| `:11` | `include: ['src/**/*.{test,spec}.{ts,tsx}']` | Los tests viven **junto al código** en `src/`, no en un `tests/` aparte. | Config real + `find src` (24 ficheros de test, §2.6.1) |
| `:12-17` | `coverage` | Proveedor v8; **cobertura solo de `src/lib/**/*.ts`** (la lógica pura), no de componentes. | `vitest.config.ts:15` |

> **Observación mía (inferencia):** que `coverage.include` sea solo `src/lib/**` y en
> cambio `stryker.mutate` incluya también `src/components/**` indica que la casa
> confía en **mutación** (no en cobertura) como puerta de calidad de los
> componentes. Coherente con `docs/mutation-testing.md` de este repo.

#### 2.2.2 `vitest.setup.ts` (transcripción íntegra — `WebEmpresa/vitest.setup.ts:1`)

```ts
import '@testing-library/jest-dom/vitest'
```

Es **todo** el fichero: una línea. Esto es exactamente lo que prescribe la doc
oficial de jest-dom para Vitest: importar el entrypoint `@testing-library/jest-dom/vitest`
en el setup file y declararlo en `setupFiles: ['./vitest-setup.js']`
(verificado en https://github.com/testing-library/jest-dom, sección Usage/Vitest).

**Lo que NO hay y conviene notar:**
- **No hay `cleanup()` manual ni `afterEach(cleanup)`.** No aparece en el setup.
  > **Inferencia mía (NO verificada en doc oficial):** `@testing-library/react`
  > hace auto-cleanup cuando detecta un `afterEach` global, lo cual encaja con
  > `globals: true`. **No lo he verificado en la documentación oficial de
  > Testing Library** — ver tabla §3. Es una suposición a confirmar antes de
  > copiarla, o a neutralizar añadiendo el cleanup explícito.
- **No hay polyfills globales** de `matchMedia` ni `IntersectionObserver` en el
  setup. Cada test se fabrica su propio doble controlable (§2.6.3). Esto es una
  **decisión de diseño deliberada**, no un olvido: los comentarios del código lo
  justifican como anti-tautología (`WebEmpresa/src/lib/useIsMobile.test.tsx:8-15`).

#### 2.2.3 `tsconfig.json` (`WebEmpresa/tsconfig.json:20-22`)

```jsonc
"types": ["node", "vite/client", "vitest/globals", "@testing-library/jest-dom"]
...
"include": ["src", "vite.config.ts", "vitest.config.ts", "vitest.setup.ts"]
```

Coincide **exactamente** con lo que pide la doc oficial de jest-dom:
`"types": ["vitest/globals", "@testing-library/jest-dom"]` y "ensure your setup
file is included in the `tsconfig.json` `include` array"
(verificado en https://github.com/testing-library/jest-dom).

Nota: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
(`tsconfig.json:14-16`) aplican también a los tests, porque `src` está en `include`.

---

### 2.3 Configuración de Stryker

#### 2.3.1 `stryker.config.json` (transcripción íntegra — `WebEmpresa/stryker.config.json:1-40`)

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "_comment": "Prueba de mutación (RF-CODE-001 / GU-HARNESS-001). Valida que los tests muerden. Umbral: 100% sobre las líneas tocadas por la feature.",
  "packageManager": "pnpm",
  "testRunner": "vitest",
  "plugins": ["@stryker-mutator/vitest-runner"],
  "reporters": ["html", "clear-text", "progress"],
  "coverageAnalysis": "perTest",
  "vitest": { "configFile": "vitest.config.ts" },
  "mutate": [
    "src/lib/seo.ts", "src/lib/nav.ts", "src/lib/theme.ts",
    "src/lib/useIsMobile.ts", "src/lib/useReveal.ts",
    "src/components/HeaderNav.tsx", "src/components/MobileMenu.tsx",
    "src/components/Logo.tsx", "src/components/ThemeToggle.tsx",
    "src/components/Footer.tsx", "src/components/Layout.tsx",
    "src/components/Hero.tsx", "src/components/Servicios.tsx",
    "src/components/Sectores.tsx", "src/components/Paquetes.tsx",
    "src/components/Contacto.tsx", "src/lib/contact.ts"
  ],
  "thresholds": { "high": 100, "low": 90, "break": 100 },
  "tempDirName": ".stryker-tmp",
  "htmlReporter": { "fileName": "reports/mutation/index.html" }
}
```

#### 2.3.2 Qué significa cada clave

| Clave | Valor | Evidencia / fuente |
|---|---|---|
| `testRunner` | `"vitest"` | `stryker.config.json:5` |
| `plugins` | `["@stryker-mutator/vitest-runner"]` | `stryker.config.json:6`. La doc oficial confirma que el runner se instala aparte: "Install `@stryker-mutator/vitest-runner` locally within your project folder" (https://stryker-mutator.io/docs/stryker-js/vitest-runner/) |
| `coverageAnalysis` | `"perTest"` | `stryker.config.json:8`. **Redundante:** la doc oficial del vitest-runner dice que "Your `coverageAnalysis` property is **ignored**. The vitest runner plugin will always use `"perTest"` coverage analysis" (verificado). Es decir, esta línea no hace nada — pero tampoco daña. Semántica de `perTest`: "Only the tests that cover a specific mutant are executed for each mutant. Your tests should be _able to run independently of each other and in random order_" (https://stryker-mutator.io/docs/stryker-js/configuration/) |
| `vitest.configFile` | `"vitest.config.ts"` | `stryker.config.json:9-11`. Doc oficial: "Specify a 'vitest.config.js' file to be loaded. By default vitest will look for a `vitest.config.js` (or `.ts`) file in the root" (verificado) |
| `mutate` | **Lista explícita de 17 ficheros** | `stryker.config.json:12-30`. **No es un glob.** Es una lista que el `tdd_craftsman` va ampliando feature a feature. Doc oficial de `mutate`: "With `mutate` you configure the subset of files or just one specific file to be mutated. These should be your _production code files_, and definitely not your test files" (verificado) |
| `thresholds` | `high:100, low:90, break:100` | `stryker.config.json:31-35`. Doc oficial: "`mutation score < break`: Error! Stryker will exit with exit code 1" (verificado). Con `break: 100`, **cualquier mutante superviviente rompe la build**. Confirmado empíricamente: ver el `ERROR ... setting exit code to 1 (failure)` en §2.5.3 |
| `tempDirName` | `".stryker-tmp"` | `stryker.config.json:36`. Existe en disco (`ls -a` muestra `.stryker-tmp/`) |
| `htmlReporter.fileName` | `"reports/mutation/index.html"` | `stryker.config.json:37-39`; el directorio `reports/` existe en el repo |

#### 2.3.3 Ficheros excluidos

**No hay clave `ignorePatterns` ni exclusiones explícitas** en `stryker.config.json`
(verificado: el fichero completo son las 40 líneas transcritas arriba). La
acotación se hace **solo por inclusión** en `mutate`. Los tests quedan fuera por no
estar listados.

Stryker ignora siempre, por defecto, estos patrones (según el `--help` del CLI
ejecutado localmente, `stryker run --help`):
`node_modules`, `.git`, `/reports`, `*.tsbuildinfo`, `/stryker.log`, `.stryker-tmp`.

**Nota mía (inferencia):** ficheros de `src/` que **no** están en la lista
(`src/App.tsx`, `src/main.tsx`, `src/lib/site.ts`, `src/components/CheckIcon.tsx`,
`src/components/SectorIcon.tsx`, `src/components/ServiceMockup.tsx`,
`src/components/Header.tsx`, `src/pages/*.tsx`) **no se mutan nunca**. No he
encontrado documento que justifique caso por caso esa exclusión — ver §3.

---

### 2.4 Integración con el arnés — **aquí hay una discrepancia con el enunciado**

#### 2.4.1 WebEmpresa NO tiene `bin/harness` (verificado)

Comprobado con `ls bin` y `cat harness.config.json` en `WebEmpresa/`:

```
=== bin? ===        NO HAY bin/
=== harness.config.json? ===  NO HAY harness.config.json
```

WebEmpresa se integra con el arnés **solo por `init.sh` + scripts de pnpm**.
`WebEmpresa/CLAUDE.md:39` dice: "Ejecuta `./init.sh` (o `pnpm verify`)", y
`CLAUDE.md:55-59` declara los comandos: `pnpm typecheck · pnpm lint · pnpm test ·
pnpm coverage`, `pnpm mutation` (Stryker), `pnpm verify` / `./init.sh`.

`WebEmpresa/package.json:26-27`:
```json
"mutation": "stryker run",
"verify": "bash ./init.sh"
```

**`pnpm mutation` NO acepta target:** es `stryker run` a secas
(`package.json:26`), sin token de acotación. Muta los 17 ficheros de la lista.

#### 2.4.2 Qué hace `init.sh` de WebEmpresa (`WebEmpresa/init.sh:1-71`)

Cinco bloques, todos verificados leyendo el fichero:

1. **Entorno** (`init.sh:12-23`): comprueba `node` presente, **Node >= 22**
   (`init.sh:15`), `pnpm` presente (sugiere `corepack enable pnpm`, `init.sh:20`),
   y `node_modules` presente (`init.sh:22`).
2. **Ficheros base del arnés** (`init.sh:26-31`): exige que existan `AGENTS.md`,
   `CLAUDE.md`, `CHECKPOINTS.md`, `feature_list.json`, `progress/current.md`,
   `docs/workflow.md`, `docs/tdd.md`, `docs/gherkin.md`, `docs/mutation-testing.md`,
   `docs/architecture.md`, `docs/conventions.md`, `docs/verification.md` y
   **`stryker.config.json`**.
3. **`feature_list.json`** (`init.sh:35-55`): script Node inline que valida estados
   (`pending|spec_ready|in_progress|done|blocked`), **máximo 1 feature en
   `in_progress`** (`init.sh:41`), y que toda feature con `sdd: true` en estado
   `spec_ready|in_progress|done` tenga su `features/<name>.feature`
   (`init.sh:46-49`).
4. **Calidad** (`init.sh:58-61`): `pnpm typecheck`, `pnpm lint`, `pnpm test`.
   **`init.sh` NO ejecuta la mutación.** La mutación es un paso aparte
   (`pnpm mutation`).
5. **Resumen** con exit code (`init.sh:64-70`).

> **Aviso de portabilidad (verificado, `init.sh:61`):** la línea escribe en
> **`/tmp/we_test.log`**, ruta POSIX. En Windows nativo (sin Git Bash / WSL) esto
> es frágil. `WebEmpresa/package.json:27` además invoca `bash ./init.sh`, o sea
> **depende de bash**. Este repo (NailsLashStudioWeb) ya resuelve eso con
> `init.ps1` + `bin/harness.ps1`.

#### 2.4.3 Cómo SÍ se integra en ESTE repo (NailsLashStudioWeb)

Aquí el arnés es el motor agnóstico:

- `NailsLashStudioWeb/bin/harness:8` → `exec node "$SCRIPT_DIR/../.harness/harness.mjs" "$@"`
- `NailsLashStudioWeb/init.sh:8` → `exec node "$SCRIPT_DIR/.harness/harness.mjs" init`
- El motor sustituye tokens: `.harness/harness.mjs:58` — "Sustituye tokens en un
  comando ({{py}} → intérprete, **{{target}} → objetivo**)".
- `.harness/harness.mjs:250-252`:
  ```js
  const target = process.argv[3] || '';
  console.log(`$ ${resolveCmd(cfg.commands.mutate, { target })}\n`);
  process.exit(run(cfg.commands.mutate, { tokens: { target } }).status);
  ```
  → **`bin/harness mutate <target>` inyecta `<target>` en `{{target}}`**.
- `.harness/harness.mjs:246-248`: si `commands.mutate` está vacío, falla con
  "commands.mutate vacío: declara la prueba de mutación en harness.config.json".
- `.harness/harness.mjs:95`: defaults `mutation = { threshold: 0.8, targets: [] }`.
- `docs/configuration.md:54-55` (este repo): "`{{target}}` → en `commands.mutate`,
  recibe el argumento que pases a `bin/harness mutate <target>`".

**Estado actual de este repo (verificado):** `harness.config.json` está **sin
rellenar** — `commands.install/lint/test/mutate/build` son cadenas vacías,
`project: "mi-proyecto"`, `language: "generic"`, `mutation.threshold: 0.8`,
`mutation.targets: []`. Y **`src/` y `tests/` están vacíos** (`ls -R src tests`
no devuelve ficheros).

**La receta oficial de la plantilla** para nuestro stack
(`NailsLashStudioWeb/docs/configuration.md:77-88`) es:

```json
"commands": {
  "install": "pnpm install",
  "lint":    "eslint . && tsc --noEmit",
  "test":    "vitest run",
  "mutate":  "stryker run",
  "build":   "vite build"
}
```

⚠️ **Ojo:** esa receta oficial pone `"mutate": "stryker run"` **sin `{{target}}`**,
así que `bin/harness mutate src/lib/foo.ts` **ignoraría el argumento** y mutaría
todo. `docs/mutation-testing.md:70-73` de este repo confirma la recomendación
(`"mutate": "stryker run"`, umbral en `stryker.config.json`) pero tampoco añade el
token.

> **Inferencia mía (recomendación, no verificada por ninguna fuente):** declarar
> ```json
> "mutate": "pnpm exec stryker run --mutate {{target}}"
> ```
> tiene el problema de que, sin argumento, `{{target}}` se resuelve a cadena vacía
> (`harness.mjs:250`, `target = process.argv[3] || ''`) y quedaría
> `stryker run --mutate ` (flag sin valor). **No he verificado qué hace Stryker con
> `--mutate` vacío.** Ver §3. La opción segura es un pequeño wrapper
> (`tools/mutate.mjs`) que pase `--mutate` solo si hay target y, si no, caiga a la
> lista de `stryker.config.json`. Esto es diseño pendiente, no un hecho.

---

### 2.5 Cómo correr mutación sobre UN módulo concreto

#### 2.5.1 La opción correcta: `--mutate`

Del `--help` del CLI **ejecutado localmente** (`node node_modules/@stryker-mutator/core/bin/stryker.js run --help`, Stryker 9.6.1):

> `-m, --mutate <filesToMutate>` — "With `mutate` you configure the subset of files
> or just one specific file to be mutated."

**Comando (verificado, funciona):**

```bash
# desde WebEmpresa/ (o el futuro repo con el mismo stack)
pnpm exec stryker run --mutate src/lib/nav.ts
```

Resultado real de esa ejecución:

```
All files | 100.00 |  100.00 |       13 |         0 |          0 |        0 |        0 |
 nav.ts   | 100.00 |  100.00 |       13 |         3 |          0 |        0 |        0 |
INFO MutationTestReportHelper Final mutation score of 100.00 is greater than or equal to break threshold 100
INFO MutationTestExecutor Done in 58 seconds.
```
(13 killed + 3 timeout, 0 supervivientes, **58 s**.)

#### 2.5.2 Afinar aún más: rango de mutación (líneas)

Doc oficial (https://stryker-mutator.io/docs/stryker-js/configuration/, verificado, cita textual):

> "It is possible to specify exactly which code blocks to mutate by means of a
> _mutation range_. This can be done postfixing your file with
> `:startLine[:startColumn]-endLine[:endColumn]`."
> - `"src/app.js:1-11"` → muta líneas 1 a 11.
> - `"src/app.js:5:4-6:4"` → de línea 5 col 4 a línea 6 col 4.
>
> Y una **limitación**: "It is **not** possible to combine mutation range with a
> globbing expression in the same line."

**Verificado ejecutándolo:**

```bash
pnpm exec stryker run --mutate "src/lib/nav.ts:19-19"
```
```
All files | 100.00 |  100.00 |        3 |         0 |          0 |        0 |        0 |
INFO Final mutation score of 100.00 is greater than or equal to break threshold 100
```
→ **3 mutantes en vez de 16, en ~7 segundos.** Esto es exactamente lo que el
pipeline necesita para "mutación sobre las líneas tocadas por la feature"
(`docs/mutation-testing.md:73-75`).

Nota secundaria (verificada en esa misma corrida): Stryker avisó
`WARN MutantTestPlanner Detected 3 static mutants (100% of total)` y sugirió
`ignoreStatic`. Es esperable en un módulo de constantes de nivel superior.

#### 2.5.3 ⚠️ TRAMPA VERIFICADA: `--testFiles` da un 0% FALSO

El `--help` local anuncia:

> `-t, --testFiles <testFilesToRun>` — "With `testFiles` you can limit which test
> files are executed during mutation testing. When specified, only tests from these
> files will be run. This allows you to verify that a module's dedicated unit tests
> can kill all its mutants independently."

Suena a la herramienta perfecta para acotar. **No lo es en este stack.**
Ejecuté las tres variantes sobre el **mismo** fichero:

| Comando ejecutado | Score obtenido | Mutantes |
|---|---|---|
| `--mutate src/lib/nav.ts` | **100.00** ✅ | 13 killed, 3 timeout, **0 survived** |
| `--mutate src/lib/nav.ts --testFiles src/lib/nav.test.ts` | **0.00** ❌ | 0 killed, **16 survived** |
| `--mutate src/lib/nav.ts --testFiles "**/nav.test.ts"` | **0.00** ❌ | 0 killed, **16 survived** |

Salida literal de la variante con `--testFiles` (ruta exacta):

```
[Survived] StringLiteral
src/lib/nav.ts:19:43
-   export const CTA_LINK: NavLink = { label: 'Hablamos', href: '#contacto' }
+   export const CTA_LINK: NavLink = { label: "", href: '#contacto' }
Ran all tests for this mutant.

Ran 2.00 tests per mutant on average.
All files |   0.00 |    0.00 |        0 |         0 |         16 |        0 |        0 |
ERROR MutationTestReportHelper Final mutation score 0.00 under breaking threshold 100, setting exit code to 1 (failure).
```

Y sin embargo `WebEmpresa/src/lib/nav.test.ts:14-16` **sí** asevera ese literal exacto:

```ts
it('@s2 CTA_LINK es "Hablamos" y apunta a #contacto', () => {
  expect(CTA_LINK).toEqual({ label: 'Hablamos', href: '#contacto' })
})
```

Es decir: el test **debería** matar ese mutante, y de hecho lo mata cuando no se
usa `--testFiles`. La columna `covered` también sale `0.00`, lo que sugiere que el
análisis de cobertura per-test no encuentra los tests.

> **Estado: comportamiento VERIFICADO (reproducido 2 veces, con ruta y con glob).
> Causa raíz NO VERIFICADA.** La doc oficial de `testFiles` **no menciona ninguna
> limitación por runner**, y la página del vitest-runner lista limitaciones
> (`threads: true` únicamente, Browser Mode no soportado, `coverageAnalysis`
> ignorado) **pero no menciona `testFiles`**. Ambas cosas comprobadas. Ver §3.

**Regla operativa para el proyecto:** el `mutation_tester` acota **solo** con
`--mutate` (fichero o rango). **`--testFiles` está prohibido** hasta que alguien
verifique la causa.

#### 2.5.4 Receta final recomendada (inferencia mía, basada en lo verificado)

```bash
# Un módulo entero
pnpm exec stryker run --mutate src/components/Reservas.tsx

# Solo las líneas que tocó la feature (rápido: ~7s en el caso medido)
pnpm exec stryker run --mutate "src/lib/horarios.ts:12-40"

# La suite completa de la lista fija (puerta de cierre)
pnpm mutation
```

---

### 2.6 Tests de componentes React: plantillas transcritas

#### 2.6.1 Inventario real (verificado con `find src -name "*.test.*"`)

24 ficheros de test en WebEmpresa, **junto al código**:

`src/components/`: `Contacto.behavior.test.tsx`, `Contacto.test.tsx`, `Footer.test.tsx`,
`Header.test.tsx`, `HeaderNav.test.tsx`, `Hero.test.tsx`, `Layout.test.tsx`,
`Logo.test.tsx`, `MobileMenu.test.tsx`, `Paquetes.test.tsx`, `Sectores.test.tsx`,
`Servicios.reveal.test.tsx`, `Servicios.test.tsx`, `ThemeToggle.test.tsx`
`src/lib/`: `contact.test.ts`, `nav.test.ts`, `seo.test.ts`, `theme.test.tsx`,
`useIsMobile.test.tsx`, `useReveal.test.tsx`
`src/pages/`: `aviso-legal.test.tsx`, `home.test.tsx`
`src/styles/`: `logo-draw.test.ts`, `tokens.test.ts`

**Patrón observado (inferencia mía):** hay un `Contacto.test.tsx` **y** un
`Contacto.behavior.test.tsx`; y un `Servicios.test.tsx` **y** un
`Servicios.reveal.test.tsx`. Se separa el test de estructura/render del test de
comportamiento.

#### 2.6.2 Convenciones extraídas (verificadas leyendo los tests)

1. **Cada `it` lleva la etiqueta del escenario Gherkin**: `it('@s1 ...')`,
   `it('@s2 ...')` — trazabilidad test ↔ `features/<name>.feature`. Ej.:
   `Contacto.behavior.test.tsx:37`, `ThemeToggle.test.tsx:53`, `nav.test.ts:5`.
2. **Consultas por rol y nombre accesible, nunca por clase CSS**:
   `screen.getByRole('button', { name: 'Enviar consulta gratuita' })`
   (`Contacto.behavior.test.tsx:42`), `toHaveAccessibleName(...)`
   (`ThemeToggle.test.tsx:67`). Coherente con `css: false` (§2.2.1).
3. **Aserciones sobre atributos ARIA y `data-*`**: `aria-invalid`
   (`Contacto.behavior.test.tsx:45`), `aria-describedby` (`:46`), `aria-hidden`
   (`ThemeToggle.test.tsx:120`), `data-icon` (`:86`), `data-theme`
   (`:147`), `data-reveal` / `data-in-view` (`useReveal.test.tsx:89,114`).
   > **Inferencia mía:** exponer `data-icon` en el SVG es un *hook de test*
   > deliberado, porque sin CSS no hay otra forma estable de identificar el icono.
4. **Anti-tautología explícita.** Documentado en los propios comentarios:
   `useIsMobile.test.tsx:8-15` — el fake compara contra el literal
   `'(max-width: 767px)'` **escrito a mano**, no contra la constante importada,
   "Así evitamos la tautología: si producción muta la constante (p. ej. a `""`),
   `window.matchMedia("")` no coincide con el literal, el fake devuelve `false` y
   los tests de 'móvil' fallan → **el mutante muere**".
   Idéntico razonamiento en `ThemeToggle.test.tsx:9-15`.
   **Esto es la clave de por qué llegan al 100% de mutación.** Los tests están
   escritos *pensando en qué mutante los mataría*.
5. **`userEvent` para interacción, `fireEvent` solo para lo que `userEvent` no
   puede** (p. ej. rellenar un honeypot oculto:
   `Contacto.behavior.test.tsx:172`).
6. **Mock quirúrgico con `importOriginal`**: se mockea solo el efecto de red y se
   deja la lógica pura real (`Contacto.behavior.test.tsx:9-12`).
7. **Limpieza de estado global en `beforeEach`/`afterEach`**:
   `localStorage.clear()`, `delete document.documentElement.dataset.theme`
   (`ThemeToggle.test.tsx:43-46`), `vi.unstubAllGlobals()` (`:48-50`).
8. **`act` importado de `react`, no de `react-dom/test-utils`**:
   `import { act } from 'react'` (`ThemeToggle.test.tsx:3`,
   `useIsMobile.test.tsx:2`). Se usa para emitir cambios desde dobles externos
   (`ThemeToggle.test.tsx:188-191`).

#### 2.6.3 PLANTILLA A — doble controlable de `matchMedia`

Transcripción literal de `WebEmpresa/src/lib/useIsMobile.test.tsx:6-36`:

```tsx
type Listener = () => void

/**
 * `matchMedia` falso y controlable. `matches` solo vale `mobile` cuando la
 * query recibida coincide con el breakpoint móvil **codificado a mano**
 * (`'(max-width: 767px)'`), no con el símbolo `MOBILE_QUERY` importado. Así
 * evitamos la tautología: si producción muta la constante (p. ej. a `""`),
 * `window.matchMedia("")` no coincide con el literal, el fake devuelve `false`
 * y los tests de "móvil" fallan → el mutante muere.
 */
function fakeMatchMedia(mobile: boolean) {
  let current = mobile
  const listeners = new Set<Listener>()
  window.matchMedia = ((query: string) => ({
    matches: query === '(max-width: 767px)' ? current : false,
    media: query,
    addEventListener: (type: string, cb: Listener) => {
      if (type === 'change') listeners.add(cb)
    },
    removeEventListener: (type: string, cb: Listener) => {
      if (type === 'change') listeners.delete(cb)
    },
  })) as unknown as typeof window.matchMedia
  return {
    setMobile: (value: boolean) => {
      current = value
    },
    emitChange: () => listeners.forEach((cb) => cb()),
    activeListeners: () => listeners.size,
  }
}
```

Variante **keyeada por query** (necesaria si conviven varias media queries), de
`WebEmpresa/src/components/ThemeToggle.test.tsx:16-41`:

```tsx
const DARK_QUERY = '(prefers-color-scheme: dark)'

function fakeMatchMedia(prefersDark: boolean) {
  let current = prefersDark
  const listenersByQuery = new Map<string, Set<Listener>>()
  window.matchMedia = ((query: string) => ({
    matches: query === DARK_QUERY ? current : false,
    media: query,
    addEventListener: (type: string, cb: Listener) => {
      if (type !== 'change') return
      const set = listenersByQuery.get(query) ?? new Set<Listener>()
      set.add(cb)
      listenersByQuery.set(query, set)
    },
    removeEventListener: (type: string, cb: Listener) => {
      if (type === 'change') listenersByQuery.get(query)?.delete(cb)
    },
  })) as unknown as typeof window.matchMedia
  return {
    setDark: (value: boolean) => { current = value },
    emitChange: () => listenersByQuery.get(DARK_QUERY)?.forEach((cb) => cb()),
    activeListeners: () => listenersByQuery.get(DARK_QUERY)?.size ?? 0,
  }
}
```

Uso con `act` (`ThemeToggle.test.tsx:183-193`):

```tsx
it('@s6(theme) en modo Sistema reacciona en vivo al cambio del SO sin recargar', () => {
  const media = fakeMatchMedia(false)
  render(<ThemeToggle />)
  expect(document.documentElement.dataset.theme).toBe('light')

  act(() => {
    media.setDark(true)
    media.emitChange()
  })
  expect(document.documentElement.dataset.theme).toBe('dark')
})
```

#### 2.6.4 PLANTILLA B — doble de `IntersectionObserver` (animaciones al hacer scroll)

Transcripción literal de `WebEmpresa/src/lib/useReveal.test.tsx:5-49`:

```tsx
type IOEntry = { target: Element; isIntersecting: boolean }

function fakeIntersectionObserver() {
  const instances: FakeIO[] = []

  class FakeIO {
    readonly observed = new Set<Element>()
    disconnectCount = 0
    constructor(
      readonly callback: IntersectionObserverCallback,
      readonly options?: IntersectionObserverInit,
    ) {
      instances.push(this)
    }
    observe(el: Element) {
      this.observed.add(el)
    }
    disconnect() {
      this.disconnectCount += 1
      this.observed.clear()
    }
    /** Invoca el callback con entradas mínimas (solo target + isIntersecting). */
    emit(entries: IOEntry[]) {
      this.callback(
        entries.map((e) => e as unknown as IntersectionObserverEntry),
        this as unknown as IntersectionObserver,
      )
    }
  }

  vi.stubGlobal('IntersectionObserver', FakeIO)
  return {
    last: () => instances[instances.length - 1],
    instances: () => instances,
  }
}
```

Y el **componente sonda** (`Probe`) para testear un hook sin acoplarse a un
componente real (`useReveal.test.tsx:56-65`):

```tsx
function Probe({ count = 3 }: { count?: number }) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} data-testid="container">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} data-testid="child" />
      ))}
    </div>
  )
}
```

Tests que vale la pena copiar tal cual (`useReveal.test.tsx:72-143`), porque cubren
los cuatro casos que la mutación exige:

- **Degradación sin API**: `vi.stubGlobal('IntersectionObserver', undefined)` → el
  contenido queda visible (`:72-81`). *(Importante para SSG/SSR.)*
- **Opciones exactas**: `expect(observer.options?.rootMargin).toBe(REVEAL_ROOT_MARGIN)`
  **y** `expect(REVEAL_ROOT_MARGIN).toBe('-40% 0px -40% 0px')` (`:101-104`) — la
  doble aserción es lo que mata al mutante de literal.
- **Bidireccionalidad** (`:117-131`).
- **Limpieza al desmontar**: `expect(observer.disconnectCount).toBe(1)` (`:133-143`).

#### 2.6.5 PLANTILLA C — formulario con validación, envío asíncrono y honeypot

De `WebEmpresa/src/components/Contacto.behavior.test.tsx`. **Es la plantilla más
directamente reutilizable** para el formulario de reservas/contacto del salón.

Mock quirúrgico (`:9-14`):

```tsx
// Mockeamos SOLO el envío real (sendContactEmail); la validación pura
// (validateContact) se mantiene real para ejercitar el comportamiento completo.
vi.mock('../lib/contact', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/contact')>()
  return { ...actual, sendContactEmail: vi.fn() }
})

const send = vi.mocked(sendContactEmail)
```

Promesa controlable para observar estados intermedios (`:16-30`):

```tsx
/** Promesa controlable para observar estados durante un envío pendiente. */
function deferred() {
  let resolve!: () => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  send.mockReset()
  send.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.clearAllMocks()
})
```

Error localizado en **un solo** campo (`:37-55`) — nótese la aserción negativa, que
es la que mata al mutante "pinta el error en todos los campos":

```tsx
it('@s1 con el nombre vacío marca error en "Nombre" y no envía', async () => {
  const user = userEvent.setup()
  render(<Contacto />)

  await user.type(screen.getByLabelText(/Correo electrónico/), 'ana@cenit.dev')
  await user.click(screen.getByRole('button', { name: 'Enviar consulta gratuita' }))

  const nombre = screen.getByLabelText(/Nombre/)
  expect(nombre).toHaveAttribute('aria-invalid', 'true')
  const errorId = nombre.getAttribute('aria-describedby')
  expect(errorId).toBeTruthy()
  expect(document.getElementById(errorId as string)?.textContent?.length).toBeGreaterThan(0)
  // El error es del NOMBRE: el campo Correo NO debe quedar marcado como inválido
  // ni mostrar su mensaje (evita que un error se pinte en todos los campos).
  const email = screen.getByLabelText(/Correo electrónico/)
  expect(email).not.toHaveAttribute('aria-invalid')
  expect(email).not.toHaveAttribute('aria-describedby')
  expect(send).not.toHaveBeenCalled()
})
```

Botón deshabilitado durante el envío (`:108-124`):

```tsx
it('@s5 el botón queda deshabilitado mientras el envío está pendiente', async () => {
  const user = userEvent.setup()
  const pending = deferred()
  send.mockReturnValue(pending.promise)
  render(<Contacto />)

  await user.type(screen.getByLabelText(/Nombre/), 'Ana')
  await user.type(screen.getByLabelText(/Correo electrónico/), 'ana@cenit.dev')
  const button = screen.getByRole('button', { name: 'Enviar consulta gratuita' })
  await user.click(button)

  expect(button).toBeDisabled()

  pending.resolve()
  await waitFor(() => expect(button).toBeEnabled())
})
```

Fallo de red conserva lo escrito (`:144-163`) y honeypot (`:165-177`):

```tsx
it('@s7 si el envío falla, muestra error y conserva lo escrito', async () => {
  const user = userEvent.setup()
  send.mockRejectedValue(new Error('boom'))
  render(<Contacto />)
  /* ... */
  expect(await screen.findByRole('alert')).toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(nombre).toHaveValue('Ana')
})

it('@s8 si el honeypot está relleno, no envía y simula éxito silencioso', async () => {
  const user = userEvent.setup()
  render(<Contacto />)

  await user.type(screen.getByLabelText(/Nombre/), 'Ana')
  await user.type(screen.getByLabelText(/Correo electrónico/), 'ana@cenit.dev')
  // Un bot rellena el campo trampa (fuera del flujo accesible).
  fireEvent.change(screen.getByLabelText('No rellenar'), { target: { value: 'bot' } })
  await user.click(screen.getByRole('button', { name: 'Enviar consulta gratuita' }))

  expect(await screen.findByRole('status')).toBeInTheDocument()
  expect(send).not.toHaveBeenCalled()
})
```

**Convención de feedback (verificada, patrón consistente):** éxito ⇒
`role="status"`; error ⇒ `role="alert"` (`:105`, `:157-158`, `:175`).

#### 2.6.6 PLANTILLA D — test de lógica pura (`src/lib/`)

`WebEmpresa/src/lib/nav.test.ts:1-17`, íntegro:

```ts
import { describe, expect, it } from 'vitest'
import { CTA_LINK, NAV_LINKS } from './nav'

describe('nav', () => {
  it('@s2 NAV_LINKS son Servicios/Sectores/Paquetes/Contacto en orden, con sus anclas', () => {
    expect(NAV_LINKS).toEqual([
      { label: 'Servicios', href: '#servicios' },
      { label: 'Sectores', href: '#sectores' },
      { label: 'Paquetes', href: '#paquetes' },
      { label: 'Contacto', href: '#contacto' },
    ])
  })

  it('@s2 CTA_LINK es "Hablamos" y apunta a #contacto', () => {
    expect(CTA_LINK).toEqual({ label: 'Hablamos', href: '#contacto' })
  })
})
```

> **Inferencia mía:** aunque `globals: true` está activo, los tests **importan
> explícitamente** `describe/it/expect` de `vitest` (`nav.test.ts:1`,
> `ThemeToggle.test.tsx:4`, `useReveal.test.tsx:2`). Es decir: `globals: true` está
> configurado pero el código **no depende de ello**. Recomiendo mantener el import
> explícito.

---

## 3. Lo que NO he podido verificar

| # | Afirmación / duda | Estado | Qué haría falta para verificarlo |
|---|---|---|---|
| 1 | **Causa raíz del 0% con `--testFiles`** | Comportamiento **verificado** (reproducido 2×, ruta y glob); causa **desconocida**. La doc de `testFiles` no cita límites por runner; la del vitest-runner no menciona `testFiles`. | Abrir issue/buscar en el repo de `@stryker-mutator/vitest-runner`; correr con `--logLevel trace` e inspeccionar `.stryker-tmp`. **Mientras tanto: no usar `--testFiles`.** |
| 2 | Que `@testing-library/react` haga **auto-cleanup** con `globals: true` sin `afterEach(cleanup)` | **Inferencia**, no verificada en doc oficial. Hecho verificado: `vitest.setup.ts:1` es una sola línea y no hay `cleanup`. | Leer la doc oficial de `@testing-library/react` (sección auto-cleanup / `RTL_SKIP_AUTO_CLEANUP`) o el código de `node_modules/@testing-library/react`. |
| 3 | Que Vitest **exija instalar `jsdom` aparte** | **Desconocido.** La doc oficial consultada (vitest.dev/config/environment y /guide/environment) **no lo dice explícitamente**. Verificado solo que WebEmpresa lo declara en `devDependencies` (`package.json:56`). | Buscar en la doc de Vitest 4 la nota de instalación de entornos, o probar a desinstalar jsdom y correr. |
| 4 | Qué hace `stryker run --mutate` con **valor vacío** (caso `{{target}}` sin argumento) | **Desconocido.** Relevante porque `harness.mjs:250` resuelve `target` a `''`. | Ejecutar `pnpm exec stryker run --mutate ""` y observar. Decide si hace falta wrapper. |
| 5 | Por qué `src/App.tsx`, `src/main.tsx`, `src/lib/site.ts`, `src/pages/*`, `CheckIcon/SectorIcon/ServiceMockup/Header` **no están** en `mutate` | **Desconocido.** Verificado que no están (`stryker.config.json:12-30`). No hallé justificación documental. | Revisar `progress/mutation_*.md` de WebEmpresa o preguntar al autor. |
| 6 | Que `css: false` sea la razón de no aseverar clases CSS | **Inferencia mía** (consistente con los 24 tests, ninguno asevera `className`). | Doc oficial de la opción `css` de Vitest; o poner `css: true` y ver si `styles.x` resuelve. |
| 7 | **Tiempo total** de `pnpm mutation` sobre los 17 ficheros | **Desconocido.** Solo medí módulos sueltos: 58 s (`nav.ts` completo), ~7 s (rango de 1 línea), ~20 s (corridas fallidas). | Ejecutar `pnpm mutation` completo y cronometrar. |
| 8 | Si `init.sh` de WebEmpresa **funciona en Windows nativo** | **Dudoso, no verificado.** Verificado que usa `/tmp/we_test.log` (`init.sh:61`) y que `pnpm verify` = `bash ./init.sh` (`package.json:27`). | Irrelevante para nosotros: este repo usa `init.ps1` / `bin/harness.ps1`. |
| 9 | Versión de `eslint.config.js` / reglas de lint de WebEmpresa | **No investigado** (fuera del área asignada). | Leer `WebEmpresa/eslint.config.js`. |
| 10 | Todo el **contenido del negocio** (servicios, precios, horarios de Nails&Lash Studio) | **Desconocido y fuera de esta área.** Nada de este informe aporta datos del salón. | Otra investigación. |

---

## 4. Impacto en el proyecto

### 4.1 Qué EXIGE

1. **Rellenar `harness.config.json`** (hoy vacío, verificado): `project`,
   `language: "node"`, y `commands` según la receta de
   `docs/configuration.md:77-88`, **más** una decisión consciente sobre `{{target}}`
   en `commands.mutate` (ver §2.4.3 y §3 punto 4).
2. **Alinear el umbral.** Hay una **contradicción a resolver**:
   `harness.config.json` (este repo) dice `mutation.threshold: 0.8`, mientras que
   `WebEmpresa/stryker.config.json:34` dice `break: 100`. Si copiamos el
   `stryker.config.json` de WebEmpresa, la puerta real será **100%** y el 0.8 del
   arnés será letra muerta. **Decisión de producto pendiente**, no técnica.
3. **Dependencias exactas** (§2.1) + Node ≥ 22.12 y pnpm ≥ 10.
4. **`tsconfig.json` con `types: ["vitest/globals", "@testing-library/jest-dom"]`**
   y el setup file en `include` — requisito de la doc oficial de jest-dom
   (verificado).
5. **Tests junto al código en `src/`**, con `include: ['src/**/*.{test,spec}.{ts,tsx}']`.
   > **Ojo:** este repo tiene `paths.tests: "tests"` en `harness.config.json` y un
   > directorio `tests/` **vacío**. Con el patrón WebEmpresa, `tests/` **no se usa**.
   > Hay que decidir: o cambiar `paths.tests` a `src`, o romper con el patrón.
6. **Cada `it` etiquetado con `@sN`** ligado al escenario Gherkin
   (`features/<name>.feature`) — es lo que hace auditable la trazabilidad para el
   `judge`.

### 4.2 Qué PROHÍBE

1. **Prohibido `--testFiles`** para acotar mutación: produce 0% falso (§2.5.3,
   verificado). Acotar **solo** con `--mutate <fichero>` o `--mutate <fichero:ini-fin>`.
2. **Prohibido aseverar clases CSS** en los tests (`css: false`,
   `vitest.config.ts:10`). Si algo debe ser observable por el test, se expone como
   **rol ARIA, nombre accesible o `data-*`** (patrón `data-icon`, `data-theme`,
   `data-reveal`, `data-in-view`).
3. **Prohibidas las tautologías**: un fake **no** debe compararse contra la
   constante importada de producción, sino contra el literal escrito a mano
   (`useIsMobile.test.tsx:8-15`). Si no, el mutante sobrevive y el 100% es mentira.
4. **Prohibido mutar ficheros de test** (doc oficial de `mutate`: "definitely not
   your test files").
5. **Prohibido `Browser Mode` de Vitest** y configuraciones sin `threads: true`:
   el vitest-runner de Stryker no los soporta (verificado en su doc oficial).
6. **Prohibido dar por buena la mutación con `pnpm mutation` a secas** durante el
   ciclo TDD si tarda minutos: usar el rango acotado y dejar la corrida completa
   para la puerta de cierre. *(Recomendación mía, no norma verificada.)*

### 4.3 Qué FEATURES implica (inferencias de diseño, a validar en la spec)

Del stack heredado salen piezas reutilizables que probablemente serán features del
salón. **Ninguna de estas está confirmada como requisito del negocio** — son
candidatas basadas en lo que WebEmpresa ya tiene resuelto y testeado al 100%:

| Pieza WebEmpresa | Reutilizable en Nails&Lash | Plantilla de test lista |
|---|---|---|
| `Contacto.tsx` + `lib/contact.ts` (validación, honeypot, `role=status`/`role=alert`) | Formulario de contacto / solicitud de cita | §2.6.5 (`Contacto.behavior.test.tsx`) |
| `useReveal` (IntersectionObserver + `data-in-view`) | Animaciones al hacer scroll en galería de trabajos | §2.6.4 (`useReveal.test.tsx`) |
| `useIsMobile` (matchMedia + `useSyncExternalStore`) | Menú móvil | §2.6.3 (`useIsMobile.test.tsx`) |
| `ThemeToggle` + `lib/theme.ts` (light/dark/system, persistencia) | **Dudoso** para un salón de belleza — decisión de diseño | §2.6.3 (`ThemeToggle.test.tsx`) |
| `lib/nav.ts` (NAV_LINKS + CTA) | Navegación por anclas | §2.6.6 (`nav.test.ts`) |
| `lib/seo.ts` | Metadatos / SEO local (Las Rozas) | `seo.test.ts` (no transcrito) |
| `MobileMenu`, `Footer`, `Layout`, `Hero` | Estructura base | tests homónimos |

**Riesgo señalado (inferencia):** el `useReveal` degrada bien sin
`IntersectionObserver` (`useReveal.test.tsx:72-81`), lo cual importa porque el
stack es **SSG** (`vite-react-ssg`, `WebEmpresa/package.json:62`): el HTML se
prerenderiza sin DOM del navegador. Cualquier componente nuevo debe testear ese
camino de degradación.

### 4.4 Acciones concretas siguientes (propuesta, requiere aprobación)

1. Decidir umbral de mutación: 100% (WebEmpresa) vs 0.8 (`harness.config.json`).
2. Decidir `paths.tests`: `src` (patrón WebEmpresa) vs `tests/`.
3. Resolver el token `{{target}}` en `commands.mutate` (§2.4.3 + §3.4).
4. Copiar `vitest.config.ts`, `vitest.setup.ts`, `tsconfig.json` (types/include) y
   `stryker.config.json` **con la lista `mutate` vacía**, para irla llenando feature
   a feature.
5. Verificar los 3 puntos abiertos de la §3 que bloquean decisiones: #1
   (`--testFiles`), #2 (auto-cleanup), #4 (`--mutate` vacío).

---

## Anexo — Comandos ejecutados durante esta investigación (reproducibles)

Todos desde `C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/WebEmpresa`:

```bash
node node_modules/@stryker-mutator/core/bin/stryker.js run --help
node node_modules/@stryker-mutator/core/bin/stryker.js run --mutate src/lib/nav.ts                                  # → 100.00, 58s
node node_modules/@stryker-mutator/core/bin/stryker.js run --mutate src/lib/nav.ts --testFiles src/lib/nav.test.ts  # → 0.00 (FALSO), 19s
node node_modules/@stryker-mutator/core/bin/stryker.js run --mutate src/lib/nav.ts --testFiles "**/nav.test.ts"     # → 0.00 (FALSO), 20s
node node_modules/@stryker-mutator/core/bin/stryker.js run --mutate "src/lib/nav.ts:19-19"                          # → 100.00, 7s
```

Fuentes oficiales consultadas:
- https://stryker-mutator.io/docs/stryker-js/configuration/ (mutate, mutation range, testFiles, thresholds, coverageAnalysis)
- https://stryker-mutator.io/docs/stryker-js/vitest-runner/ (instalación, `vitest.configFile`, limitaciones)
- https://vitest.dev/config/environment (default `'node'`, lista de entornos)
- https://vitest.dev/config/globals (default `false`, `types: ["vitest/globals"]`)
- https://vitest.dev/config/setupfiles ("run before each _test file_ in the same process")
- https://vitest.dev/guide/environment (docblock `// @vitest-environment jsdom`)
- https://github.com/testing-library/jest-dom (entrypoint `@testing-library/jest-dom/vitest`, setupFiles, tsconfig types)
