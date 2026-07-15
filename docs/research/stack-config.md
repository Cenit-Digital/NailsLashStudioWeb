# Stack base WebEmpresa — configuración real transcrita

> **Ámbito**: transcripción literal de la configuración REAL de
> `C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/WebEmpresa`
> para poder rellenar el `harness.config.json` de **NailsLashStudioWeb**.
> **Fecha de verificación**: 2026-07-15.
> **Convención**: cada afirmación lleva fuente (`archivo:linea` o URL oficial).
> Se distingue: **[VERIFICADO]** (fuente comprobada), **[INFERENCIA]** (razonamiento
> mío sobre hechos verificados), **[NO VERIFICADO]** (no comprobado; falta).

---

## 1. Respuesta ejecutiva

**Qué hacemos**: clonar el stack de WebEmpresa (Vite 7 + React 19 + TypeScript 5.9 +
SCSS + pnpm + SSG vía `vite-react-ssg`, con Vitest 4 y StrykerJS 9 como puertas) y
declarar sus comandos en el `harness.config.json` de NailsLashStudioWeb, que **hoy está
vacío** (`harness.config.json:6-12`, todos los `commands` son `""`).

**Por qué**: el arnés SSD es agnóstico al lenguaje; el único punto que lo ata a un stack
es `harness.config.json` (`harness.schema.json:5`). WebEmpresa es el "repositorio base del
stack estándar de empresa" (`WebEmpresa/package.json:5`), así que sus comandos son la
referencia canónica.

**Hallazgos que condicionan la decisión**:

1. **WebEmpresa NO tiene `harness.config.json`.** [VERIFICADO] La búsqueda en el árbol de
   proyectos solo lo encuentra en `NailsLashStudioWeb/` y `TemplateSSDUncleBobBettatech/`.
   WebEmpresa es **anterior** al motor agnóstico: su puerta es `init.sh` + scripts de
   `package.json`, no `bin/harness`. La premisa del encargo ("lee harness.config.json de
   WebEmpresa") es falsa: **no existe**. Hay que **derivar** los comandos de `package.json`.
2. **`pnpm@11.9.0` SÍ existe** en npm. [VERIFICADO] No es un número inventado.
3. **NO hay choque real** entre la pnpm instalada (10.21.0) y la declarada (11.9.0):
   pnpm 10 descarga y ejecuta automáticamente la versión de `packageManager`. [VERIFICADO]
4. **Sí hay una incoherencia real**: `engines.node: ">=22.12.0"` es **más laxo** que el
   requisito propio de pnpm 11.9.0 (`node >=22.13`). [VERIFICADO] Ver §5.1.
5. **El umbral de mutación de WebEmpresa es 100%**, no el 0.8 por defecto del arnés.
   [VERIFICADO] Ver §6.

---

## 2. Inventario de archivos leídos

| Archivo | Estado | Nota |
|---|---|---|
| `WebEmpresa/package.json` | Leído | 65 líneas |
| `WebEmpresa/vite.config.ts` | Leído | 14 líneas |
| `WebEmpresa/tsconfig.json` | Leído | 23 líneas |
| `WebEmpresa/eslint.config.js` | Leído | 25 líneas |
| `WebEmpresa/.prettierrc.json` | Leído | 8 líneas |
| `WebEmpresa/.prettierignore` | Leído | 26 líneas |
| `WebEmpresa/stryker.config.json` | Leído | 40 líneas |
| `WebEmpresa/vitest.config.ts` | Leído | 19 líneas |
| `WebEmpresa/vitest.setup.ts` | Leído | 1 línea |
| `WebEmpresa/.nvmrc` | Leído | `22` |
| `WebEmpresa/.editorconfig` | Leído | 9 líneas |
| `WebEmpresa/pnpm-workspace.yaml` | Leído | 16 líneas |
| `WebEmpresa/init.sh` | Leído | 71 líneas |
| `WebEmpresa/pnpm-lock.yaml` | Leído (parcial) | `lockfileVersion: '9.0'` |
| `WebEmpresa/harness.config.json` | **NO EXISTE** | Ver §1.1 |
| `WebEmpresa/eslint.config.*` (TS) | No aplica | es `.js`, no `.ts` |

---

## 3. `package.json` — transcripción

Fuente: `WebEmpresa/package.json`.

### 3.1 Identidad y gestor de paquetes

```json
"name": "webempresa",                    // :2
"private": true,                          // :3
"version": "0.1.0",                       // :4
"type": "module",                         // :6
"license": "UNLICENSED",                  // :7
"packageManager": "pnpm@11.9.0",          // :8
"engines": { "node": ">=22.12.0", "pnpm": ">=10" }   // :9-12
```

- `packageManager: "pnpm@11.9.0"` → `package.json:8`. [VERIFICADO]
- `engines.node: ">=22.12.0"` → `package.json:10`. [VERIFICADO]
- `engines.pnpm: ">=10"` → `package.json:11`. [VERIFICADO]
- `.nvmrc` contiene `22` (a secas, sin minor/patch) → `WebEmpresa/.nvmrc:1`. [VERIFICADO]

### 3.2 Scripts (literal, `package.json:13-28`)

| Script | Comando exacto | Línea |
|---|---|---|
| `dev` | `vite` | :14 |
| `dev:ssr` | `vite-react-ssg dev` | :15 |
| `build` | `vite-react-ssg build` | :16 |
| `preview` | `vite preview` | :17 |
| `typecheck` | `tsc --noEmit` | :18 |
| `lint` | `eslint .` | :19 |
| `lint:fix` | `eslint . --fix` | :20 |
| `format` | `prettier --write .` | :21 |
| `format:check` | `prettier --check .` | :22 |
| `test` | `vitest run` | :23 |
| `test:watch` | `vitest` | :24 |
| `coverage` | `vitest run --coverage` | :25 |
| `mutation` | `stryker run` | :26 |
| `verify` | `bash ./init.sh` | :27 |

> **Ojo**: el script se llama **`mutation`**, no `mutate` (`package.json:26`). [VERIFICADO]
> **Ojo**: **no existe** script `install` ni `ci`. [VERIFICADO]

### 3.3 Dependencies — rango declarado vs versión resuelta

Rango: `package.json:29-39`. Resuelta: `pnpm-lock.yaml` (sección `importers`). [VERIFICADO]

| Paquete | Rango (`package.json`) | Resuelta (lock) |
|---|---|---|
| `@fontsource/dm-sans` | `^5.0.0` (:30) | 5.2.8 |
| `@fontsource/outfit` | `^5.0.0` (:31) | 5.2.8 |
| `@vercel/firewall` | `^1.2.1` (:32) | 1.2.1 |
| `autoskills` | `^0.3.6` (:33) | 0.3.6 |
| `radix-ui` | `^1.6.0` (:34) | 1.6.0 |
| `react` | `^19.2.0` (:35) | **19.2.7** |
| `react-dom` | `^19.2.0` (:36) | **19.2.7** |
| `react-router-dom` | `^6.30.0` (:37) | 6.30.4 |
| `resend` | `^6.17.1` (:38) | 6.17.1 |

### 3.4 DevDependencies — rango vs resuelta

Rango: `package.json:40-64`. [VERIFICADO]

| Paquete | Rango | Resuelta |
|---|---|---|
| `@eslint/js` | `^9.39.0` (:41) | 9.39.4 |
| `@stryker-mutator/core` | `^9.6.0` (:42) | **9.6.1** |
| `@stryker-mutator/vitest-runner` | `^9.6.0` (:43) | 9.6.1 |
| `@testing-library/jest-dom` | `^6.6.0` (:44) | 6.9.1 |
| `@testing-library/react` | `^16.3.0` (:45) | 16.3.2 |
| `@testing-library/user-event` | `^14.6.0` (:46) | 14.6.1 |
| `@types/node` | `^22.10.0` (:47) | 22.20.0 |
| `@types/react` | `^19.2.0` (:48) | 19.2.17 |
| `@types/react-dom` | `^19.2.0` (:49) | 19.2.3 |
| `@vitejs/plugin-react-swc` | `^3.11.0` (:50) | 3.11.0 |
| `@vitest/coverage-v8` | `^4.0.0` (:51) | 4.1.9 |
| `eslint` | `^9.39.0` (:52) | 9.39.4 |
| `eslint-plugin-react-hooks` | `^5.2.0` (:53) | 5.2.0 |
| `eslint-plugin-react-refresh` | `^0.4.20` (:54) | 0.4.26 |
| `globals` | `^15.15.0` (:55) | 15.15.0 |
| `jsdom` | `^25.0.0` (:56) | 25.0.1 |
| `prettier` | `^3.4.0` (:57) | 3.9.3 |
| `sass` | `^1.80.0` (:58) | 1.100.0 |
| `typescript` | `^5.9.0` (:59) | 5.9.3 |
| `typescript-eslint` | `^8.46.0` (:60) | 8.62.0 |
| `vite` | `^7.3.0` (:61) | **7.3.6** |
| `vite-react-ssg` | `0.9.0` **exacto, sin `^`** (:62) | 0.9.0 |
| `vitest` | `^4.0.0` (:63) | **4.1.9** |

> `vite-react-ssg` es la **única** dependencia clavada a versión exacta
> (`package.json:62`). [VERIFICADO] [INFERENCIA] Es deliberado: es el paquete que
> controla el SSG y el que más superficie de rotura tiene (es 0.x, sin garantía semver
> de minor). El lock muestra que arrastra `prettier` y `react-helmet-async` como peers.

> **`sass-embedded@1.100.0`** aparece resuelto en el lock aunque **no** está declarado en
> `package.json`. [VERIFICADO en lock] [INFERENCIA] Entra como dependencia opcional de
> `vite@7.3.6`, coherente con el comentario `vite.config.ts:5` ("Vite 7 usa el API moderno
> de Dart Sass por defecto (sass-embedded)").

---

## 4. Configuración por herramienta

### 4.1 `vite.config.ts` (14 líneas) [VERIFICADO]

```ts
plugins: [react()],            // :7  — @vitejs/plugin-react-swc
ssgOptions: {                  // :8-13
  script: 'async',             // :9
  entry: 'src/main.tsx',       // :10
  dirStyle: 'nested',          // :11
  formatting: 'none',          // :12
}
```
- El build NO es `vite build`: es `vite-react-ssg build` (`package.json:16`), que lee
  `ssgOptions`. Punto de entrada: `src/main.tsx` (`vite.config.ts:10`).

### 4.2 `tsconfig.json` (23 líneas) [VERIFICADO]

Estricto y sin emisión:
```
target: ES2022 (:3) · lib: [ES2023, DOM, DOM.Iterable] (:5) · module: ESNext (:6)
moduleResolution: bundler (:7) · moduleDetection: force (:8)
allowImportingTsExtensions: true (:9) · isolatedModules: true (:11) · noEmit: true (:12)
jsx: react-jsx (:13) · strict: true (:14)
noUnusedLocals: true (:15) · noUnusedParameters: true (:16)
noFallthroughCasesInSwitch: true (:17) · noUncheckedSideEffectImports: true (:18)
skipLibCheck: true (:19)
types: ["node","vite/client","vitest/globals","@testing-library/jest-dom"] (:20)
include: ["src","vite.config.ts","vitest.config.ts","vitest.setup.ts"] (:22)
```
> Hay **un solo** `tsconfig.json`: no existe `tsconfig.app.json` ni `tsconfig.node.json`.
> [VERIFICADO por listado de directorio]

### 4.3 `eslint.config.js` (25 líneas) — flat config [VERIFICADO]

```js
ignores: ['dist','coverage','reports','.stryker-tmp','node_modules','design']  // :8
extends: [js.configs.recommended, ...tseslint.configs.recommended]              // :10
files: ['**/*.{ts,tsx}']                                                        // :11
ecmaVersion: 2022 (:13) · globals: globals.browser (:14)
plugins: react-hooks, react-refresh (:16-19)
rules: ...reactHooks.configs.recommended.rules (:21)
       'react-refresh/only-export-components': ['warn', { allowConstantExport: true }] (:22)
```
> Es `.js` (no `.ts`) y usa `tseslint.config()` (`eslint.config.js:7`). **No** usa
> `tseslint.configs.recommendedTypeChecked`: el chequeo de tipos lo cubre `tsc --noEmit`
> aparte (`package.json:18`). [INFERENCIA sobre :10 + :18]

### 4.4 `.prettierrc.json` (8 líneas) [VERIFICADO]

```json
{ "semi": false, "singleQuote": true, "trailingComma": "all",
  "printWidth": 100, "tabWidth": 2, "endOfLine": "lf" }
```
`.prettierignore` (26 líneas) excluye `pnpm-lock.yaml`, `dist`, `coverage`, `reports`,
`.stryker-tmp` (:1-5), código vendorizado `.claude/ponytail/`, `.claude/skills/` (:9-10),
`.agents/` (:14), el HTML de diseño (:18), `design` (:21) y
`public/robots.txt` + `public/sitemap.xml` (:25-26).

`.editorconfig` (9 líneas): `charset=utf-8`, `end_of_line=lf`, `indent_style=space`,
`indent_size=2`, `insert_final_newline=true`, `trim_trailing_whitespace=true`.

### 4.5 `vitest.config.ts` (19 líneas) [VERIFICADO]

```ts
plugins: [react()]                                    // :5
globals: true                                          // :7
environment: 'jsdom'                                   // :8
setupFiles: ['./vitest.setup.ts']                      // :9
css: false                                             // :10
include: ['src/**/*.{test,spec}.{ts,tsx}']             // :11
coverage: { provider: 'v8',                            // :13
            reporter: ['text','html'],                 // :14
            include: ['src/lib/**/*.ts'],              // :15
            exclude: ['src/**/*.test.*','src/**/*.d.ts'] }  // :16
```
`vitest.setup.ts:1` → `import '@testing-library/jest-dom/vitest'` (una sola línea).

> Los tests **conviven con el código** en `src/` (`vitest.config.ts:11`), NO hay carpeta
> `tests/`. [VERIFICADO] Esto choca con el default `paths.tests: "tests"` del arnés
> (`harness.schema.json:40`). Ver §6.
> **Coverage solo mide `src/lib/**/*.ts`** (`vitest.config.ts:15`): los componentes `.tsx`
> quedan fuera del coverage, aunque **sí** entran en mutación (`stryker.config.json:18-28`).
> [INFERENCIA] La cobertura no es la puerta; la mutación sí.

### 4.6 `stryker.config.json` (40 líneas) [VERIFICADO]

```json
"packageManager": "pnpm"                    // :4
"testRunner": "vitest"                      // :5
"plugins": ["@stryker-mutator/vitest-runner"]   // :6
"reporters": ["html","clear-text","progress"]   // :7
"coverageAnalysis": "perTest"               // :8
"vitest": { "configFile": "vitest.config.ts" }  // :9-11
"thresholds": { "high": 100, "low": 90, "break": 100 }   // :31-35
"tempDirName": ".stryker-tmp"               // :36
"htmlReporter": { "fileName": "reports/mutation/index.html" }  // :37-39
```

`mutate` (`stryker.config.json:12-30`) es una **lista explícita de 17 archivos**, no un glob:
`src/lib/seo.ts`, `src/lib/nav.ts`, `src/lib/theme.ts`, `src/lib/useIsMobile.ts`,
`src/lib/useReveal.ts`, `src/components/HeaderNav.tsx`, `src/components/MobileMenu.tsx`,
`src/components/Logo.tsx`, `src/components/ThemeToggle.tsx`, `src/components/Footer.tsx`,
`src/components/Layout.tsx`, `src/components/Hero.tsx`, `src/components/Servicios.tsx`,
`src/components/Sectores.tsx`, `src/components/Paquetes.tsx`, `src/components/Contacto.tsx`,
`src/lib/contact.ts`.

El comentario `stryker.config.json:3` fija la doctrina:
> "Prueba de mutación (RF-CODE-001 / GU-HARNESS-001). Valida que los tests muerden.
> Umbral: 100% sobre las líneas tocadas por la feature."

> **`break: 100`** (`:34`) ⇒ Stryker **sale con código ≠ 0** si el score baja de 100.
> Eso es exactamente lo que el arnés exige de `commands.mutate` (`harness.schema.json:29`:
> "Debe salir != 0 si no supera el umbral"). [INFERENCIA sobre ambos]

### 4.7 `pnpm-workspace.yaml` (16 líneas) [VERIFICADO]

```yaml
allowBuilds:                    # :5-9
  '@swc/core': true
  esbuild: true
  '@parcel/watcher': true
peerDependencyRules:            # :12-16
  allowedVersions:
    'react-helmet-async>react': '19'
    'react-helmet-async>react-dom': '19'
```
Comentario `:1`: "Ajustes de pnpm (v11): el hogar de estos settings dejó de ser
package.json." Comentario `:3-4`: `allowBuilds` "reemplaza a onlyBuiltDependencies".

**Esto confirma que el salto a pnpm 11 es deliberado, no un typo.** [INFERENCIA fuerte]
`allowBuilds` es un ajuste real de pnpm, añadido en **v10.26.0**, que se configura en
`pnpm-workspace.yaml` y que en v11 **reemplaza** a `onlyBuiltDependencies`,
`onlyBuiltDependenciesFile`, `neverBuiltDependencies`, `ignoredBuiltDependencies` e
`ignoreDepScripts` — https://pnpm.io/settings#allowbuilds [VERIFICADO]

El lock declara `settings: autoInstallPeers: true`, `excludeLinksFromLockfile: false` y
`lockfileVersion: '9.0'` (`pnpm-lock.yaml:1-5`). [VERIFICADO]

### 4.8 `init.sh` (71 líneas) — la puerta real de WebEmpresa [VERIFICADO]

`#!/usr/bin/env bash` (:1), `set -u` (:5) — **nota: `set -u`, NO `set -e`**: el script
acumula `EXIT_CODE` y sigue, para reportar todos los fallos de golpe (:10, :65-70).

**Bloque 1 — Entorno (:12-23)**
- `node` presente, si no `exit 1` (:13)
- Node ≥ 22 vía `parseInt(process.versions.node,10) >= 22` (:15)
- `pnpm` presente, si no: "ejecuta: corepack enable pnpm" (:20)
- `node_modules` presente, si no: "ejecuta 'pnpm install'" (:22)

**Bloque 2 — Archivos base (:26-31)**: exige que existan
`AGENTS.md`, `CLAUDE.md`, `CHECKPOINTS.md`, `feature_list.json`, `progress/current.md`,
`docs/workflow.md`, `docs/tdd.md`, `docs/gherkin.md`, `docs/mutation-testing.md`,
`docs/architecture.md`, `docs/conventions.md`, `docs/verification.md`,
`stryker.config.json`.

**Bloque 3 — `feature_list.json` (:34-55)**: valida por Node embebido que
- los estados ∈ `{pending, spec_ready, in_progress, done, blocked}` (:39)
- **como máximo 1 feature en `in_progress`** (:41)
- toda feature con `sdd: true` en estado `spec_ready|in_progress|done` tiene su
  `features/<name>.feature` (:43-50)

**Bloque 4 — Calidad (:58-61)**
```bash
pnpm -s typecheck   # :59
pnpm -s lint        # :60
pnpm -s test        # :61  (redirige a /tmp/we_test.log)
```

> **`init.sh` NO ejecuta mutación.** [VERIFICADO :58-61] La mutación es una puerta
> aparte (`pnpm mutation`). Esto difiere del arnés nuevo, cuyo `verify` = init + mutación
> (`.harness/harness.mjs:14`, `:262-265`).
> **`init.sh:61` escribe en `/tmp/we_test.log`**: ruta POSIX. En Windows funciona bajo Git
> Bash, pero es una dependencia de entorno a tener en cuenta. [INFERENCIA]

---

## 5. pnpm: ¿existe 11.9.0? ¿choca con la 10.21.0 instalada?

### 5.1 Verificación de existencia

| Comprobación | Resultado | Fuente |
|---|---|---|
| ¿Existe `pnpm@11.9.0`? | **SÍ** | `npm view pnpm@11.9.0 version` → `11.9.0` |
| Publicada el | 2026-06-23T15:43:46.512Z | `npm view pnpm@11.9.0 time` |
| `pnpm` `latest` hoy | **11.13.0** | `npm view pnpm dist-tags` → `"latest": "11.13.0"` |
| `engines` de `pnpm@11.9.0` | **`{"node": ">=22.13"}`** | https://registry.npmjs.org/pnpm/11.9.0 |
| `engines` de `pnpm@10.21.0` | `{"node": ">=18.12"}` | `npm view pnpm@10.21.0 engines` |

Todas [VERIFICADO]. **`pnpm@11.9.0` no es una versión inventada**: existe, está publicada
y hay 4 releases posteriores (11.10.0, 11.11.0, 11.12.0, 11.13.0).

### 5.2 Entorno local medido [VERIFICADO]

| Cosa | Valor | Comando |
|---|---|---|
| pnpm instalada | **10.21.0** | `pnpm --version` |
| Node instalada | **v22.15.0** | `node --version` |
| corepack | 0.32.0 | `corepack --version` |
| Ruta de pnpm | `/c/Users/vhurt/AppData/Roaming/npm/pnpm` | `which pnpm` |

> La ruta indica que pnpm está instalada **vía npm global**, no vía corepack shim.
> [INFERENCIA sobre `which pnpm`]

### 5.3 ¿Choca? — **NO, no hay conflicto bloqueante** [VERIFICADO]

pnpm v10 trae `managePackageManagerVersions` con **default `true`**, y la doc oficial dice
literalmente:
> "When enabled, pnpm will automatically download and run the version of pnpm specified in
> the `packageManager` field of `package.json`. This is the same field used by Corepack."
> — https://pnpm.io/10.x/settings (managePackageManagerVersions)

⇒ **pnpm 10.21.0, al ejecutarse dentro de WebEmpresa, descarga y ejecuta pnpm 11.9.0 sola.**
No hay que hacer nada. La 10.21.0 actúa de *bootstrapper*. [INFERENCIA directa de la doc]

En pnpm v11 ese ajuste **se eliminó** y lo sustituye `pmOnFail`, cuyo default es `download`
— el mismo comportamiento — https://pnpm.io/settings :
> "`managePackageManagerVersions: true` → `pmOnFail: download` (default)".
> Opciones de `pmOnFail`: `download` | `error` | `warn` | `ignore`.

`engines.pnpm: ">=10"` (`package.json:11`) se satisface con ambas (10.21.0 y 11.9.0), así
que tampoco falla por ahí. [INFERENCIA]

### 5.4 El conflicto que SÍ existe: `engines.node` demasiado laxo ⚠️

- `WebEmpresa/package.json:10` declara `"node": ">=22.12.0"`.
- `pnpm@11.9.0` exige `"node": ">=22.13"` (registry.npmjs.org/pnpm/11.9.0). [VERIFICADO]

⇒ **Node 22.12.x satisface `engines` del repo pero NO puede ejecutar la pnpm que el propio
repo declara en `packageManager`.** Ventana de rotura: Node ≥22.12.0 y <22.13.0.
[INFERENCIA sobre dos hechos verificados]

Hoy no explota porque la Node local es **v22.15.0** (>22.13) [VERIFICADO], y `.nvmrc` dice
`22` (resuelve al último 22.x) [VERIFICADO `.nvmrc:1`]. Es una **bomba de relojería en CI**
si alguien fija Node 22.12. **Recomendación para NailsLashStudioWeb: declarar
`"node": ">=22.13.0"`** y, mejor, un `.nvmrc` con versión completa (p.ej. `22.15.0`) en vez
de `22` a secas, para que el entorno sea reproducible.

### 5.5 Riesgos adicionales de pnpm 11 [VERIFICADO salvo lo indicado]

De https://pnpm.io/blog/releases/11.0 y
https://github.com/pnpm/pnpm/releases/tag/v11.0.0:
- "Node.js 22+ required — support for Node 18, 19, 20, and 21 is dropped".
- "pnpm no longer reads the `pnpm` field in `package.json`". → WebEmpresa **ya cumple**:
  no tiene campo `pnpm` en `package.json` y movió los ajustes a `pnpm-workspace.yaml`
  (`pnpm-workspace.yaml:1`). [VERIFICADO]
- "`npm_config_*` environment variables are no longer read" → pasan a `pnpm_config_*`
  (https://pnpm.io/migration). Relevante para CI. [VERIFICADO]
- "Store version bumped to v11." + el índice del store pasa a SQLite
  (`$STORE/index.db` en vez de JSON sueltos en `$STORE/index/`).
  ⇒ **La primera instalación con pnpm 11 re-descarga/reconstruye el store.** [VERIFICADO]
- "`pnpm install -g` (con 0 argumentos) ya no se soporta" → usar `pnpm add -g <pkg>`.
- **[NO VERIFICADO]** Si pnpm 11 cambia `lockfileVersion` desde `9.0`
  (`WebEmpresa/pnpm-lock.yaml:1`). Las notas de v11.0.0 mencionan un cambio de formato
  parcial ("Simplified patchedDependencies lockfile format") pero **no** dicen si sube el
  número de versión del lock. Ver §7.

---

## 6. El comando exacto de cada puerta (para rellenar `harness.config.json`)

### 6.1 Mapeo directo

| Puerta del arnés | Comando exacto | Derivado de |
|---|---|---|
| `install` | `pnpm install --frozen-lockfile` | **[INFERENCIA]** — no hay script `install`; `init.sh:22` solo comprueba `node_modules` y sugiere `pnpm install` |
| `lint` | `pnpm typecheck && pnpm lint` | `package.json:18` + `:19`, en el orden de `init.sh:59-60` |
| `test` | `pnpm test` (= `vitest run`) | `package.json:23`, usado en `init.sh:61` |
| `mutate` | `pnpm mutation` (= `stryker run`) | `package.json:26` |
| `mutate` con target | `pnpm exec stryker run --mutate {{target}}` | **[INFERENCIA]** — ver §6.3 |
| `build` | `pnpm build` (= `vite-react-ssg build`) | `package.json:16` |

> **Por qué `lint` = typecheck **y** lint**: el schema del arnés solo tiene 5 ranuras
> (`install/lint/test/mutate/build`, `harness.schema.json:26-30`) y **no hay ranura
> `typecheck`**. WebEmpresa trata typecheck como puerta obligatoria (`init.sh:59`), así que
> hay que **fusionarla** dentro de `lint` o se pierde. [INFERENCIA]
> Si se quiere paridad total con `init.sh`, añadir `format:check` (`package.json:22`):
> `pnpm typecheck && pnpm lint && pnpm format:check`. Nota: **`init.sh` NO corre
> `format:check`** (:58-61), así que es opcional. [VERIFICADO]

### 6.2 `harness.config.json` propuesto para NailsLashStudioWeb

Estado actual del destino: **todos los `commands` vacíos**
(`NailsLashStudioWeb/harness.config.json:6-12`), `project: "mi-proyecto"` (:3),
`language: "generic"` (:4). Es la plantilla sin tocar — idéntica a
`TemplateSSDUncleBobBettatech/harness.config.json`. [VERIFICADO]
Además, **NailsLashStudioWeb aún no tiene `package.json` ni `.nvmrc`** [VERIFICADO por
listado]: el stack está por crear.

```json
{
  "$schema": "./harness.schema.json",
  "project": "nails-lash-studio-web",
  "language": "node",
  "description": "Web del salón (Las Rozas). Stack estándar Cénit: Vite 7 + React 19 + TS 5.9 + SCSS + pnpm, SSG con vite-react-ssg. Tests Vitest 4, mutación StrykerJS 9.",
  "commands": {
    "install": "pnpm install --frozen-lockfile",
    "lint": "pnpm typecheck && pnpm lint",
    "test": "pnpm test",
    "mutate": "pnpm mutation",
    "build": "pnpm build"
  },
  "paths": {
    "src": "src",
    "tests": "src",
    "features": "features",
    "progress": "progress",
    "spec": "project-spec.md",
    "feature_list": "feature_list.json"
  },
  "mutation": {
    "threshold": 1.0,
    "targets": []
  },
  "rules": {
    "one_feature_at_a_time": true,
    "require_approved_spec_to_implement": true,
    "require_tests_to_close": true,
    "require_mutation_to_close": true
  }
}
```

Decisiones y su porqué:
- **`paths.tests: "src"`** (no el default `"tests"` de `harness.schema.json:40`): en este
  stack los tests viven junto al código, `include: ['src/**/*.{test,spec}.{ts,tsx}']`
  (`vitest.config.ts:11`). [VERIFICADO]
- **`mutation.threshold: 1.0`** (no el default `0.8` de `harness.schema.json:52`): el
  schema define `threshold` como **proporción 0-1** (`harness.schema.json:48-53`), mientras
  Stryker usa **porcentaje 0-100** (`stryker.config.json:31-35`). WebEmpresa exige
  `break: 100` ⇒ `1.0` en el arnés. **Son dos escalas distintas: no copiar el 100 tal cual.**
  [INFERENCIA sobre ambas fuentes]
- **`mutation.targets: []`**: la lista de WebEmpresa (`stryker.config.json:12-30`) es de
  *sus* componentes; para NailsLash hay que reconstruirla con los módulos propios. Dejarla
  vacía hasta que exista `src/`. [INFERENCIA]

### 6.3 Nota sobre `mutate {{target}}`

El motor sustituye `{{target}}` en `commands.mutate` (`.harness/harness.mjs:58`, `:251-252`)
y `bin/harness mutate [target]` lo pasa como argumento (`.harness/harness.mjs:298`).
[VERIFICADO]
- `pnpm mutation` (sin target) ⇒ usa la lista `mutate` de `stryker.config.json`.
- Para soportar target puntual: `pnpm exec stryker run --mutate {{target}}`.
  **[NO VERIFICADO]** que `--mutate` acepte un único fichero por CLI en Stryker 9.6 con esa
  sintaxis exacta; hay que comprobarlo contra la doc de StrykerJS antes de fijarlo. Ver §7.
- Si `commands.mutate` está vacío, `bin/harness mutate` **falla duro**
  (`.harness/harness.mjs:246-248`) y `verify` salta la mutación si
  `require_mutation_to_close` está activo pero el comando vacío (`:262`). [VERIFICADO]

### 6.4 Diferencia de puertas: `init.sh` (WebEmpresa) vs `bin/harness` (arnés nuevo)

| | WebEmpresa `init.sh` | Arnés `bin/harness` |
|---|---|---|
| Orden | entorno → archivos base → feature_list → typecheck → lint → test | init → lint → test; `verify` = init + mutación |
| Mutación en verify | **NO** (`init.sh:58-61`) | **SÍ** (`.harness/harness.mjs:14`, `:262-265`) |
| Config | scripts hardcodeados en `init.sh` | `harness.config.json` |
| Invocación | `pnpm verify` → `bash ./init.sh` (`package.json:27`) | `bin/harness verify` / `bin\harness.ps1 verify` |

[VERIFICADO] NailsLashStudioWeb usa el arnés nuevo (tiene `bin/harness`, `bin/harness.ps1`,
`.harness/harness.mjs`, `init.ps1`), por lo que **la mutación sí entra en `verify`** — una
puerta **más estricta** que la de WebEmpresa.

---

## 7. Lo que NO he podido verificar

| # | Afirmación / hueco | Por qué no está verificado | Qué haría falta |
|---|---|---|---|
| 1 | `WebEmpresa/harness.config.json` | **No existe el archivo.** El encargo lo daba por hecho | Nada que leer: WebEmpresa usa `init.sh`. Confirmar con el equipo si se piensa migrar WebEmpresa al arnés agnóstico |
| 2 | Si pnpm 11 sube `lockfileVersion` desde `9.0` | Ni `pnpm.io/migration` ni las notas de v11.0.0 lo dicen explícitamente | Ejecutar `pnpm install` con pnpm 11.9.0 en una copia y diffear `pnpm-lock.yaml:1`; o buscar el changelog del paquete `@pnpm/lockfile.types` |
| 3 | Sintaxis exacta `stryker run --mutate <file>` en Stryker 9.6 | No consultada la doc de StrykerJS | Leer https://stryker-mutator.io/docs/stryker-js/configuration/#mutate-string y probar `pnpm exec stryker run --mutate src/lib/x.ts` |
| 4 | Que `pnpm install --frozen-lockfile` sea el comando de install acordado | **Inferido**: no hay script `install`; `init.sh:22` solo dice `pnpm install` | Decisión de equipo. En CI `--frozen-lockfile` es lo correcto; en local, `pnpm install` a secas |
| 5 | Que las puertas pasen HOY en WebEmpresa | **No he ejecutado** `pnpm verify` / `pnpm test` / `pnpm mutation` (tarea de lectura) | Ejecutar `bash ./init.sh` y `pnpm mutation` en WebEmpresa |
| 6 | Coherencia lock ↔ `pnpm-workspace.yaml` v11 | `pnpm-lock.yaml` es de 07-jul y declara `settings:` de estilo v10; el workspace ya habla de v11 | `pnpm install` con 11.9.0 y ver si reescribe el lock |
| 7 | Por qué `engines.node` es `>=22.12.0` y no `>=22.13` | No hay comentario ni commit que lo explique | `git log -p -- package.json` en WebEmpresa |
| 8 | Versiones/decisiones de contenido de NailsLash (servicios, precios, horarios) | **Fuera de mi área** | Otro investigador / el cliente |
| 9 | Si `radix-ui` (paquete unificado) es la vía elegida vs `@radix-ui/react-*` | Solo consta la línea `package.json:34` | Decisión de diseño; revisar `project-spec.md` |
| 10 | `autoskills` y `@vercel/firewall` como deps de **producción** | Constan en `package.json:32-33` pero desconozco su rol | Revisar `src/` y `api/` de WebEmpresa; `skills-lock.json` |

---

## 8. Impacto en NailsLashStudioWeb

### 8.1 Qué EXIGE

1. **Node ≥ 22.13** (no 22.12): impuesto por `pnpm@11.9.0` (`engines: {"node": ">=22.13"}`).
   [VERIFICADO] Corregir la laxitud que arrastra WebEmpresa (§5.4).
2. **pnpm 11.x vía `packageManager`**: basta declarar `"packageManager": "pnpm@11.13.0"`
   (la `latest` verificada hoy) y la pnpm 10.21.0 local lo auto-descarga (§5.3).
   [INFERENCIA sobre doc oficial]
3. **Ajustes de pnpm en `pnpm-workspace.yaml`, NUNCA en el campo `pnpm` de
   `package.json`**: pnpm 11 ya no lo lee. [VERIFICADO]
   Hará falta `allowBuilds` para `@swc/core` y `esbuild` como mínimo
   (`pnpm-workspace.yaml:5-9`), o los binarios nativos no se compilan.
4. **TypeScript en modo estricto total**: `strict`, `noUnusedLocals`, `noUnusedParameters`,
   `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports` (`tsconfig.json:14-18`).
5. **Mutación al 100% con `break`**: `stryker.config.json:34`. Una feature no cierra si un
   solo mutante sobrevive en sus archivos. Es **más duro** que el 0.8 por defecto del arnés.
6. **`bin/harness verify` incluye mutación** (`.harness/harness.mjs:262-265`), a diferencia
   del `init.sh` de WebEmpresa. Presupuestar tiempo: la mutación es lenta.
7. **Un solo `in_progress`** a la vez (`init.sh:41`, `rules.one_feature_at_a_time`).

### 8.2 Qué PROHÍBE

1. **No `vite build`** para producción: es `vite-react-ssg build` (`package.json:16`), que
   depende de `ssgOptions.entry: 'src/main.tsx'` (`vite.config.ts:10`). Si el entry no
   existe con ese nombre, el build SSG rompe.
2. **No subir `vite-react-ssg` de versión a la ligera**: está clavada en `0.9.0` sin `^`
   (`package.json:62`). [INFERENCIA] Es 0.x: un minor puede romper.
3. **No poner tests en `tests/`**: `vitest.config.ts:11` solo mira `src/**`.
4. **No usar `onlyBuiltDependencies`** ni las otras 4 removidas en v11
   (https://pnpm.io/settings#allowbuilds). [VERIFICADO]
5. **No confiar en `npm_config_*` en CI**: pnpm 11 ya no las lee. [VERIFICADO]
6. **No copiar el `100` de Stryker al `threshold` del arnés**: escalas distintas (§6.2).
7. **No marcar `done`** sin judge + mutación sobre umbral (CLAUDE.md, reglas duras).

### 8.3 Qué features/tareas implica (backlog de arranque)

| # | Tarea | Fuente |
|---|---|---|
| T1 | Crear `package.json` con `packageManager: pnpm@11.13.0` y `engines.node >=22.13.0` | §5.4, §8.1 |
| T2 | `.nvmrc` con versión completa (`22.15.0`) en vez de `22` | §5.4 |
| T3 | Rellenar `harness.config.json` con el bloque de §6.2 | `harness.config.json:6-12` está vacío |
| T4 | Copiar `tsconfig.json`, `eslint.config.js`, `.prettierrc.json`, `.editorconfig`, `vitest.config.ts`, `vitest.setup.ts` de WebEmpresa | §4 |
| T5 | `pnpm-workspace.yaml` con `allowBuilds` (`@swc/core`, `esbuild`, `@parcel/watcher`) | `pnpm-workspace.yaml:5-9` |
| T6 | `stryker.config.json` con `break: 100` y `mutate` reconstruido para los módulos de NailsLash | §4.6 |
| T7 | Verificar T1-T6 con `bin\harness.ps1 init` (Windows) | CLAUDE.md |
| T8 | Decidir `install`: `--frozen-lockfile` (CI) vs `pnpm install` (local) | §7 #4 |
| T9 | Revisar si `@vercel/firewall`, `resend`, `autoskills` aplican a este proyecto (WebEmpresa los usa; NailsLash quizá no) | §7 #10 |
| T10 | Confirmar sintaxis `--mutate {{target}}` contra doc de StrykerJS | §7 #3 |

> **`resend` (`package.json:38`) y `@vercel/firewall` (`package.json:32`)** sugieren
> formulario de contacto por email y protección de endpoint. [INFERENCIA] Para un salón con
> formulario de reservas/contacto es probable que apliquen, pero **hay que verificarlo
> contra `project-spec.md` y contra lo que el negocio pida** — no lo doy por hecho.

---

## 9. Fuentes

**Archivos** (todos bajo `.../CenitDigitalProyectosCodigo/`):
`WebEmpresa/package.json`, `WebEmpresa/vite.config.ts`, `WebEmpresa/tsconfig.json`,
`WebEmpresa/eslint.config.js`, `WebEmpresa/.prettierrc.json`, `WebEmpresa/.prettierignore`,
`WebEmpresa/.editorconfig`, `WebEmpresa/stryker.config.json`, `WebEmpresa/vitest.config.ts`,
`WebEmpresa/vitest.setup.ts`, `WebEmpresa/.nvmrc`, `WebEmpresa/pnpm-workspace.yaml`,
`WebEmpresa/pnpm-lock.yaml`, `WebEmpresa/init.sh`,
`NailsLashStudioWeb/harness.config.json`, `NailsLashStudioWeb/harness.schema.json`,
`NailsLashStudioWeb/.harness/harness.mjs`,
`TemplateSSDUncleBobBettatech/harness.config.json`,
`TemplateSSDUncleBobBettatech/examples/node-notes-cli/harness.config.json`.

**URLs oficiales**:
- https://registry.npmjs.org/pnpm/11.9.0 — `engines: {"node": ">=22.13"}`
- https://pnpm.io/settings — `pmOnFail` (default `download`), migración desde
  `managePackageManagerVersions`
- https://pnpm.io/settings#allowbuilds — `allowBuilds` (v10.26.0), reemplaza a
  `onlyBuiltDependencies` et al. en v11
- https://pnpm.io/10.x/settings — `managePackageManagerVersions`, default `true`
- https://pnpm.io/blog/releases/11.0 — breaking changes de pnpm 11
- https://pnpm.io/migration — migración v10 → v11
- https://github.com/pnpm/pnpm/releases/tag/v11.0.0 — store v11 (SQLite), Node 22+

**Comandos ejecutados** (2026-07-15):
`npm view pnpm version` → `11.13.0` · `npm view pnpm dist-tags` · `npm view pnpm@11` ·
`npm view pnpm@11.9.0 version` → `11.9.0` · `npm view pnpm@11.9.0 engines` ·
`npm view pnpm@10.21.0 engines` · `npm view pnpm@11.9.0 time` ·
`pnpm --version` → `10.21.0` · `node --version` → `v22.15.0` · `corepack --version` → `0.32.0`
