# F-00 — Arranque del stack (andamiaje, NO feature del pipeline TDD)

> Ejecutado por delegación del `craftsman_lead`. No es una feature: es configuración.
> Especificación seguida: `docs/research/00-fase0-informe.md` §6 (líneas 381-553).
> Repo base de referencia: `../WebEmpresa`.
> **Sin commit**: lo hace el `craftsman_lead`.

## 1. Resultado de las 6 comprobaciones de aceptación

| # | Comprobación | Resultado |
|---|---|---|
| 1 | `pnpm install` | 🟢 VERDE (exit 0) |
| 2 | `pnpm typecheck` | 🟢 VERDE (exit 0) |
| 3 | `pnpm lint` | 🟢 VERDE (exit 0) |
| 4 | `pnpm test` | 🟢 VERDE (exit 0) — 1 test, 1 fichero |
| 5 | `pnpm build` | 🟢 VERDE (exit 0) — **prerender SSG confirmado** |
| 6 | `bin/harness init` | 🟢 VERDE (exit 0) |

**0 fallos, 0 errores, 0 warnings** en los 6. Extras verificados: `harness.config.json` valida
contra `harness.schema.json` (ajv, draft-7) y `prettier --check` pasa sobre todos los ficheros
que he creado.

⚠️ La comprobación 6 se ejecutó con `bash bin/harness init`, **no** con `pwsh bin/harness.ps1 init`:
ver §4, hallazgo H-1 (`pwsh` no existe en esta máquina y `harness.ps1` está roto en PowerShell 5.1).

### Salida literal

#### 1. `pnpm install` (tras `rm -rf node_modules pnpm-lock.yaml`)

```
+ react 19.2.7
+ react-dom 19.2.7
+ react-router-dom 6.30.4 (7.18.1 is available)

devDependencies:
+ @eslint/js 9.39.5 (10.0.1 is available)
+ @stryker-mutator/core 9.6.1
+ @stryker-mutator/vitest-runner 9.6.1
+ @testing-library/jest-dom 6.9.1
+ @testing-library/react 16.3.2
+ @testing-library/user-event 14.6.1
+ @types/node 22.20.1 (26.1.1 is available)
+ @types/react 19.2.17
+ @types/react-dom 19.2.3
+ @vitejs/plugin-react-swc 3.11.0 (4.3.1 is available)
+ @vitest/coverage-v8 4.1.10
+ eslint 9.39.5 (10.7.0 is available)
+ eslint-plugin-react-hooks 5.2.0 (7.1.1 is available)
+ eslint-plugin-react-refresh 0.4.26 (0.5.3 is available)
+ globals 15.15.0 (17.7.0 is available)
+ jsdom 25.0.1 (29.1.1 is available)
+ prettier 3.9.5
+ sass 1.101.0
+ typescript 5.9.3 (7.0.2 is available)
+ typescript-eslint 8.64.0
+ vite 7.3.6 (8.1.4 is available)
+ vite-react-ssg 0.9.0 (0.9.1-beta.1 is available)
+ vitest 4.1.10

Done in 9s using pnpm v11.9.0
--- EXIT: 0
```

> Nota: `Done in ... using pnpm v11.9.0` con `pnpm --version` local = **10.21.0**. Confirma
> empíricamente lo que el informe §6.2 predijo: la 10.21.0 hace de *bootstrapper* de la 11.9.0
> declarada en `packageManager`. **No hubo que hacer nada.**
> Los `(X is available)` son avisos informativos de pnpm sobre versiones nuevas, no warnings del
> proyecto: los rangos `^` son los del base y se mantienen a propósito.

#### 2. `pnpm typecheck`

```
$ tsc --noEmit
--- EXIT: 0
```

#### 3. `pnpm lint`

```
$ eslint .
--- EXIT: 0
```

#### 4. `pnpm test`

```
 RUN  v4.1.10 C:/Users/vhurt/.../NailsLashStudioWeb

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  00:23:36
   Duration  2.26s (transform 48ms, setup 244ms, import 362ms, tests 42ms, environment 1.32s)

--- EXIT: 0
```

#### 5. `pnpm build`

```
[vite-react-ssg] Build for client...
vite v7.3.6 building client environment for production...
✓ 52 modules transformed.
dist/index.html                   0.36 kB │ gzip:  0.25 kB
dist/.vite/manifest.json          0.40 kB │ gzip:  0.20 kB
dist/.vite/ssr-manifest.json      6.05 kB │ gzip:  0.78 kB
dist/assets/app-BYbDMLiU.css      0.03 kB │ gzip:  0.05 kB
dist/assets/app-w2TVQT9I.js      82.98 kB │ gzip: 28.92 kB
dist/assets/client-CWz6TQ5S.js  180.76 kB │ gzip: 56.87 kB
✓ built in 988ms

[vite-react-ssg] Build for server...
✓ 4 modules transformed.
✓ built in 69ms

[vite-react-ssg] Rendering Pages... (1)
dist/index.html       0.61 KiB

[vite-react-ssg] Generating static loader data... (1)
dist/static-loader-data-manifest-ugnw3r1isj.json  0.05 KiB

[vite-react-ssg] Build finished.
--- EXIT: 0
```

**Prueba de que el prerender SSG ocurre de verdad** (no basta con que el build salga 0): el `<h1>`
viaja horneado en el HTML estático, con `data-server-rendered="true"`.

```html
<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="module" async="" crossorigin="" src="/assets/app-w2TVQT9I.js"></script>
    <link rel="stylesheet" crossorigin="" href="/assets/app-BYbDMLiU.css">
  </head>
  <body>
    <div id="root" data-server-rendered="true"><h1>Nails &amp; Lash Studio</h1><script>...</script></div>
```

#### 6. `bash bin/harness init`

```
── 1. Entorno ──────────────────────────────────────────
[OK]    node -> v22.15.0
[OK]    Versión de Node compatible

── 2. Ficheros base del arnés ──────────────────────────
[OK]    Existe AGENTS.md
[OK]    Existe CLAUDE.md
[OK]    Existe CHECKPOINTS.md
[OK]    Existe docs/workflow.md
[OK]    Existe feature_list.json
[OK]    Existe progress\current.md

── 3. feature_list.json y escenarios ───────────────────
[OK]    feature_list.json válido (20 features)

── 4. Lint ─────────────────────────────────────────────
$ pnpm typecheck && pnpm lint

$ tsc --noEmit
$ eslint .
[OK]    Lint sin errores

── 5. Tests ────────────────────────────────────────────
$ pnpm test

$ vitest run

 RUN  v4.1.10 C:/Users/vhurt/.../NailsLashStudioWeb

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  00:23:57
   Duration  2.83s (transform 56ms, setup 293ms, import 483ms, tests 50ms, environment 1.70s)

[OK]    Todos los tests pasan

── Resumen ─────────────────────────────────────────────
[OK]    Entorno listo. Puedes empezar a trabajar.
=== EXIT: 0 ===
```

#### Extra: validación de `harness.config.json` contra el schema

```
$ npx ajv-cli@5 validate -s harness.schema.json -d harness.config.json --spec=draft7
harness.config.json valid
=== EXIT ajv: 0 ===
```

## 2. Ficheros entregados

**Configuración (raíz):** `harness.config.json` (reescrito), `package.json`, `.nvmrc`,
`pnpm-workspace.yaml`, `tsconfig.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`,
`vite.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `stryker.config.json`, `index.html`,
`.gitignore` (modificado), `pnpm-lock.yaml` (generado).

**Esqueleto `src/`:** `main.tsx`, `App.tsx`, `vite-env.d.ts`, `pages/home.tsx`, `pages/home.test.tsx`,
`styles/main.scss`.

Calcados **literalmente** del base (byte a byte salvo lo listado en §3): `tsconfig.json`,
`eslint.config.js`, `.prettierrc.json`, `vite.config.ts`, `vitest.config.ts`, `vitest.setup.ts`,
`pnpm-workspace.yaml`.

## 3. Divergencias con el repo base (WebEmpresa) y su motivo

| # | Divergencia | Motivo |
|---|---|---|
| D-1 | `name`: `webempresa` → **`nails-lash-studio-web`** | Encargo (obligatorio). |
| D-2 | `engines.node`: `>=22.12.0` → **`>=22.13.0`** | Informe §6.2: la pnpm 11.9.0 que el propio repo declara en `packageManager` exige `node >=22.13`. El `>=22.12.0` del base abre una ventana de rotura (Node ≥22.12 y <22.13) — bomba de relojería en CI. |
| D-3 | `.nvmrc`: `22` → **`22.15.0`** | Informe §6.2: versión completa; `22` a secas permite resolver a una 22.12.x y reproducir D-2. Es la Node local verificada. |
| D-4 | **Eliminadas** `resend` y `@vercel/firewall` de `dependencies` | Decisión 3 = entrega por WhatsApp, **sin backend** → no habrá `/api`. `resend` es email transaccional de servidor y `@vercel/firewall` protege endpoints. El informe (línea 972) es explícito: «*con la decisión 3 (WhatsApp, sin backend) no aplica*». Con `/api` fuera, ambas serían dependencias muertas. |
| D-5 | **Eliminado** el script `verify` (`bash ./init.sh`) de `package.json` | En el base, `verify` = solo `init.sh` (que **no** corre mutación). Aquí el arnés es el dueño de esa puerta y su `verify` = init **+ mutación** (informe §6.1). Mantener un `pnpm verify` más laxo que `bin/harness verify` sería una trampa: invitaría a cerrar sesión sin mutación. Puerta única: `bin/harness verify`. |
| D-6 | `index.html` **sin** el script anti-FOUC de tema ni `<link rel="icon">` | Decisión 5: **no hay tema oscuro** → el script (que espeja `src/lib/theme.ts` y la clave `cenit-theme`) no tiene nada que aplicar y arrastraría código muerto de otro proyecto. El favicon se omite porque aún no existe el asset: enlazarlo daría un 404. |
| D-7 | `stryker.config.json` con **`mutate: []`** (el base lista 17 ficheros) | Los 17 targets del base son ficheros de WebEmpresa que aquí no existen. Por convención del stack quedan **fuera** de mutación `App.tsx`, `main.tsx`, `pages/*` y `styles/*` → el esqueleto no tiene, por definición, **nada legítimo que mutar**. Cada feature añadirá los suyos (`mutate` es lista explícita, **no un glob**). Consecuencia importante: ver hallazgo H-2. |
| D-8 | `.prettierignore` sin las entradas propias de WebEmpresa (ponytail, `design/`, HTML de diseño) | Esos artefactos no existen aquí. Se conservan las genéricas y se añade `.memoria-cache/`. |
| D-9 | `.gitignore`: añadidos `dist-ssr/`, `.vite-react-ssg-temp/`, `reports/` | El `.gitignore` de la plantilla es genérico (Python + Node); faltaban los artefactos propios de este stack. `.vite-react-ssg-temp/` y `reports/` los genera el build/mutación. |
| D-10 | `main.tsx` **sin** los 8 `import '@fontsource/...'` del base | Elegir tipografía es **diseño**, y el esqueleto lo tiene prohibido: Outfit/DM Sans son las tipografías de marca de **Cénit Digital**, no del salón. Las deps `@fontsource/*` **se conservan** (el mecanismo y las versiones son los del base, informe §6.3), pero la feature de diseño elegirá las familias y añadirá sus imports. |
| D-11 | `App.tsx` sin `Layout` y con una sola ruta; `styles/main.scss` sin `@use` de parciales | No hay `Layout` ni `_tokens/_reset/_base` todavía: son features. `main.scss` solo declara `color-scheme: light` (decisión 5, ya tomada; no es diseño nuevo). |

**Deps conservadas pese a la duda** (regla «si dudas, déjalas»): `radix-ui`, `react-router-dom`,
`@fontsource/dm-sans`, `@fontsource/outfit`, `autoskills` (este repo también vendoriza skills:
tiene `skills-lock.json` y `.agents/skills`). Hoy el esqueleto no importa ninguna.

## 4. Hallazgos (premisas falsas / cosas que el `craftsman_lead` debe decidir)

### H-1 🔴 `bin/harness.ps1` no funciona en esta máquina — la ruta Windows documentada está rota

`CLAUDE.md` y `docs/configuration.md` prescriben `pwsh ./init.ps1` / `bin\harness.ps1 <cmd>` en Windows.
Ambas cosas fallan aquí:

1. **`pwsh` (PowerShell 7) no está instalado**; solo hay Windows PowerShell 5.1.
2. `harness.ps1` **tampoco corre bajo PowerShell 5.1**. Es un bug real, no falta de `pwsh`:

```
Join-Path : No se encuentra ningún parámetro de posición que acepte el argumento '.harness'.
En ...\bin\harness.ps1: 9 Carácter: 11
+ $engine = Join-Path $PSScriptRoot '..' '.harness' 'harness.mjs'
```

`Join-Path` con **3+ segmentos** es sintaxis de PowerShell 7; la 5.1 solo acepta `-Path`/`-ChildPath`.
El fix sería anidar los `Join-Path` o usar `[IO.Path]::Combine(...)`.

**No lo he tocado**: `bin/`, `init.ps1` y `.harness/` son infraestructura de la **plantilla** (compartida
con otros repos), no andamiaje de este proyecto, y el encargo admitía el fallback `bash bin/harness init`
(que funciona y sale 0). **Decisión tuya**: parchear aquí, arreglarlo aguas arriba en la plantilla, o
instalar `pwsh`. Mientras tanto, **en este repo la puerta se invoca con `bash bin/harness init`**.

### H-2 🟠 `bin/harness verify` estará ROJO hasta la primera feature con lógica

Consecuencia directa de D-7, y la primera manifestación concreta de lo que el informe §6.1 ya avisaba
(«*este repo tiene la puerta más estricta que su propio repo base*»: `init.sh` del base no corre mutación,
`verify` del arnés sí). Con `mutate: []`, Stryker **no sale 0, sale 1**:

```
WARN ProjectReader Warning: No files found for mutation with the given glob expressions.
INFO Instrumenter Instrumented 0 source file(s) with 0 mutant(s)
INFO DryRunExecutor No tests were found
ERROR Stryker No tests were executed. Stryker will exit prematurely. Please check your configuration.
ConfigError: No tests were executed. Stryker will exit prematurely.
=== EXIT mutation: 1 ===
```

**No es un error de configuración: es la verdad del esqueleto.** No hay lógica que mutar todavía, y por
convención del stack `pages/*`, `App.tsx`, `main.tsx` y `styles/*` no se mutan. **Me he negado a fingir
verde** metiendo `pages/home.tsx` en `mutate`: no tiene lógica → 0 mutantes → el mismo error, pero
rompiendo además la convención.

Por eso `pnpm mutation` **no estaba** entre los 6 criterios de aceptación (y `harness init` **no** corre
mutación: solo `verify` lo hace). Se resuelve solo en cuanto F-01 añada su primer `src/lib/*.ts` a `mutate`.

### H-3 🟡 `commands.mutate` ignora silenciosamente el `<target>` de `bin/harness mutate`

He usado el contenido **exacto** que me diste (`"mutate": "pnpm mutation"`), pero conviene que lo sepas:
el motor sustituye el token `{{target}}` de `bin/harness mutate <target>` (`.harness/harness.mjs:250-252`)
y, como el comando no lo contiene, **`bin/harness mutate src/lib/x.ts` corre la mutación completa e ignora
el argumento sin avisar**. El `mutation_tester` querrá acotar por feature (y el informe §6.4 obliga a hacerlo
con `--mutate <fichero>`, nunca con `--testFiles`, que da 0% falso).

Opción si quieres arreglarlo: `"mutate": "pnpm mutation {{target}}"` — pero entonces hay que invocar
`bin/harness mutate "--mutate src/lib/x.ts"`, que es feo. **No lo he cambiado por mi cuenta** (me dijiste
que no reinventara el bloque). Decisión tuya.

### H-4 🟡 Actividad concurrente en el repo durante la ejecución

Al empezar, `src/` estaba vacío, no había `package.json` y `feature_list.json` tenía **1 feature de ejemplo**.
Durante la sesión aparecieron un `pnpm-workspace.yaml` autogenerado por pnpm (un *stub* con
`'@swc/core': set this to true or false`), un `node_modules/` y un `pnpm-lock.yaml`; y `harness init` ahora
reporta **20 features** sin que `feature_list.json` figure como modificado en `git status`.

No lo he causado yo y no he tocado `feature_list.json`. Por si el lockfile se había generado contra un
`package.json` intermedio (y con los `allowBuilds` sin aprobar), **rehíce la instalación desde cero**
(`rm -rf node_modules pnpm-lock.yaml && pnpm install`): el `pnpm-lock.yaml` actual corresponde al
`package.json` final, sin `resend` ni `@vercel/firewall`, y con `allowBuilds` ya aplicado.

### H-5 🟢 `prettier --check .` falla en 64 ficheros — **preexistente, no lo he causado**

`pnpm format:check` sale 1, pero **ninguno** de los ficheros es mío: son de la plantilla (`examples/`,
`README.md`, `project-spec.md`, `feature_list.json`, `harness.schema.json`, `progress/current.md`, `docs/`…),
que nunca pasaron por Prettier. `prettier --check` sobre los ficheros que he creado sale **0**
(*All matched files use Prettier code style!*).

No está en la puerta: `commands.lint` = `pnpm typecheck && pnpm lint` = `tsc` + `eslint`, **sin Prettier**
(igual que en el base). No he tocado esos 64 ficheros: un `prettier --write .` masivo generaría un diff
enorme, ajeno a F-00 y difícil de revisar. **Decisión tuya** si quieres normalizarlos en un commit aparte.

## 5. Notas para quien coja la siguiente feature

- **`--testFiles` está PROHIBIDO** en Stryker con este stack (0% falso). Acotar con `--mutate <fichero>`.
- **Consultar en tests por rol/nombre accesible, nunca por clase CSS**: `css: false` en `vitest.config.ts`
  hace que `styles.card` sea `undefined`.
- **`pnpm dev` NO ejercita el SSG** (es SPA plana). Para ver el prerender: `pnpm dev:ssr` o `pnpm build`.
- **No añadas `vercel.json` con el rewrite SPA** (`/(.*) → /index.html`): con `dirStyle: 'nested'`
  anularía el prerender por ruta (informe §6.4, trampa 1).
- Cada feature **añade sus ficheros a `mutate`** en `stryker.config.json` (lista explícita, no glob).
- El `<h1>Nails & Lash Studio</h1>` de `src/pages/home.tsx` es **provisional, de andamiaje**. La primera
  feature de contenido debe sustituirlo, no construir sobre él.
