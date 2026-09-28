# Review — feature F-04 `cascaron_semantico`, ENMIENDA 4 (@s42, @s43, @s44) y su AMPLIACIÓN (@s45)

**Veredicto:** APPROVED

> Revisado: los commits `89a30b5` (@s42-@s44) y `e80fe57` (@s45), que solo tocan los tres ficheros build-based
> (`src/pages/home-horneado.test.ts`, `src/pages/contacto-horneado.test.ts`, `src/lib/trampas-del-horneado.test.tsx`),
> `progress/current.md` y el diario. Los he leído contra `features/cascaron_semantico.feature`:176-223 (banner ENMIENDA 4 y
> línea AMPLIACIÓN) y :1725-1907 (@s42-@s45), `project-spec.md`:1331-1370 y `progress/tdd_cascaron_enmienda4.md`
> (incluida la sección «Ampliación @s45»). Precedentes: `judge_cascaron_enmienda2.md` y `judge_cascaron_enmienda3.md`.
> No he editado nada del repo salvo este informe. Todos los experimentos se hicieron en una COPIA fuera del repo
> (`git archive e80fe57` + `node_modules`): `…/scratchpad/judge4/copia`. La evidencia está en `…/scratchpad/judge4/`:
> `sabotear.mjs`, `inyectar.mjs`, `correr-{home,contacto,trampas}.sh`, `resultados-{home,contacto,trampas}.txt`,
> `res/*.json`, `env-worker.json`, `build-entorno-worker.mjs`, `sha-{A,B,C,D-repo}.txt`, `comparar.mjs`, `init.log` y
> `build-final.log`. En el repo solo he ejecutado `bin/harness init` (una vez) y `pnpm build` (al final).

## Cobertura de escenarios (@s ↔ test)

Las líneas del mapa del diario (sección «Ampliación», con las de @s42-@s44 ya desplazadas) las he comprobado una a una.

- @s42 (home-horneado, ancla «Lo que dicen nuestras clientas»): [x]
  - 1er `Then`, exactamente 1 `<script type="module">` con `src` `/NailsLashStudioWeb/assets/app-….js` → `home-horneado.test.ts:365`.
    `modulosDeLaApp()` (:341-345) filtra la MISMA extracción de @s39 (`modulosDelBundle()`, :198-208).
  - 2º `Then`, existe, pesa > 0 y contiene el ancla → `:369`.
  - 3er `Then`, 0 `jsxDEV` → `:378`.
  - 4º `Then`, 0 `fileName:` + `"`/`'`/`` ` `` → `:382`.
- @s43 (contacto-horneado, ancla «625 22 33 66»): [x] `contacto-horneado.test.ts:254, 258, 268, 272`.
  La extracción está escrita en el propio fichero (:178-237), con el criterio de @s39.
- @s44 (5 filas: `react19-nativa`, `head-espacio`, `head-mayusculas`, `head-atributo`, `head-correcto`): [x]
  - Cuatro `it.each(FILAS_DE_LOS_EXPERIMENTOS)` → `trampas-del-horneado.test.tsx:421, 428, 440, 447`.
  - Las 5 filas están escritas a mano (:412-418). Nunca `experimentos.keys()`.
  - La medición va en el helper por el que pasa todo build (:203-204), y viaja en `Experimento` (:168-172).
- @s45 (7 filas del `Examples:`): [x]
  - Fila home: `home-horneado.test.ts:401` (ancla), `:405` (« production» tras cada aparición), `:410` (0 «for test»).
  - Fila contacto: `contacto-horneado.test.ts:291, 295, 300`.
  - Filas de los 5 experimentos: tres `it.each` en `trampas-del-horneado.test.tsx:469, 478, 488`.
  - La captura: `home:26, :34-44`; `contacto:31, :40-50`; en trampas, dentro del helper (`:194-198`), separada de `salida`, que es la de la PUERTA.

### Requisitos del contrato (`.feature`:1732-1765 y :1848-1874)

- [x] **Anclas positivas primero y sobre la misma lectura que las negativas.**
  - En cada `describe`, las anclas preceden a las negativas.
  - En home y contacto, las cuatro aserciones llaman a la misma `bundleDeLaApp()`: extracción, resolución y lectura del mismo fichero.
  - En trampas se lee una sola vez, en el helper.
  - En @s45, el ancla y el 2º `Then` comparten `trasCadaModoDelLog()`, y el 3º cuenta sobre la misma `salidaDelBuild`.
- [x] **El bundle se resuelve desde el HTML, nunca por glob.** Se quita el prefijo del `src` y se lee bajo el `dist/assets/` de ESE build (`home:352-357`, `contacto:239-244`, `trampas:158-162`).
- [x] **Literales a mano.** Son `'module'`, los dos prefijos, `app-`, `.js`, las tres anclas, `/jsxDEV/g`, ``/fileName:["'`]/g``, «building client environment for», `' production'` y «building client environment for test». Ninguno sale de `vite.config.ts`, del manifiesto, de `process.env`/`import.meta.env` ni de `HOME_CON_HEAD`/`HOME_CON_METADATA_NATIVA`.
- [x] **Cada ancla es exclusiva de su app.** Lo medí sobre los artefactos de producción de la copia:

  | Literal                          | `app-CWmDYxle.js` (app real) | `app-*.js` de los 5 experimentos |
  | -------------------------------- | ---------------------------- | -------------------------------- |
  | «Lo que dicen nuestras clientas» | 1                            | 0 en los 5                       |
  | «625 22 33 66»                   | 2                            | 0 en los 5                       |
  | «Av. de Atenas 75, Local 41»     | 0                            | 1 en cada uno                    |

- [x] **Sin build nuevo.** Cada fichero sigue con un único lanzamiento de build: `home:35`, `contacto:41` y `trampas:194`, dentro del helper. El `execFileSync` de la puerta (`trampas:211`) no construye y no se ha tocado. No hay ningún `*-horneado.test.*` nuevo.
- [x] **Los build-based no importan `src/`.** Solo importan `node:child_process`, `node:fs`, `node:path` y `vitest` (`home:1-5`, `contacto:1-5`, `trampas:1-5`).
- [x] **`vitest.stryker.config.ts` sigue excluyendo los tres.** Lo comprobé con el recolector de Vitest, en la copia:
  - `vitest list --filesOnly` da 47 ficheros, entre ellos los tres `*-horneado`.
  - Con `--config vitest.stryker.config.ts` da 44, y ningún `*-horneado`. `trampas-del-horneado.test.tsx` casa con `**/*-horneado.test.{ts,tsx}`.
  - El unitario `src/lib/horneado.test.ts` sigue dentro.
- [x] **La corrección es la del contrato.** Es `env: { ...process.env, NODE_ENV: 'production', MODE: 'production' }` en el entorno del SUBPROCESO (`home:37`, `contacto:43`, `trampas:197`). Ni `vite.config.ts`, ni `package.json`, ni las configs de Vitest/Stryker, ni la CI se tocan (`git show --stat 89a30b5 e80fe57`).

### Prueba de mordida (punto 2), en la copia y sin tocar el repo

**Método.** `sabotear.mjs` parte SIEMPRE del fichero prístino y aplica un reemplazo de texto (aborta si no casa). Después ejecuta ese fichero de test REAL con Vitest (reporter JSON) y lo restaura. Las extracciones, los `it` y las aserciones son las del commit.

Para los bundles con contenido prohibido, `inyectar.mjs` añade una carga al `app-*.js` que apunta el `index.html`, DESPUÉS de las puertas. El test la ve así como parte del artefacto, igual que vería un build real que la trajera.

**home-horneado** (25 tests):

| Sabotaje                                                                                 | Resultado      | ¿Cae lo que le toca?                                                                                                                        |
| ---------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| H0 control                                                                               | 25/25          | —                                                                                                                                           |
| **H1 entorno heredado (build con `NODE_ENV=test MODE=test`, el opcional fuerte)**        | 21/25          | SÍ. Caen @s42 `jsxDEV` (368) y `fileName:` (365), y @s45 2º (`[' test...\ntr']`) y 3º (1). Las anclas siguen en verde                       |
| H2 sin `MODE` (solo `NODE_ENV=production`)                                               | 23/25          | SÍ, solo @s45 2º y 3º. @s42 en verde: el bundle ya es de producción, el modo no                                                             |
| H3 sin `NODE_ENV` (solo `MODE=production`)                                               | 23/25          | SÍ, solo @s42 `jsxDEV`/`fileName:` (368/365). @s45 en verde. Los dos escenarios son complementarios                                         |
| **H4 bundle con `jsxDEV`**                                                               | 24/25          | SÍ, solo @s42 `jsxDEV` (1)                                                                                                                  |
| **H4 bundle con `fileName:"/…"`**                                                        | 24/25          | SÍ, solo @s42 `fileName:` (1)                                                                                                               |
| H4 `fileName:'/…'` y ``fileName:`/…` ``                                                  | 24/25 cada uno | SÍ: las tres comillas                                                                                                                       |
| H4 control `fileName:x` (sin comilla)                                                    | 25/25          | no salta, como fija el 4º `Then`                                                                                                            |
| **H6 log con «building client environment for test»** (sintético, además del real de H2) | 23/25          | SÍ, @s45 2º y 3º                                                                                                                            |
| **H7a log sin la frase (vacuidad): stdout del build a `/dev/null`**                      | 24/25          | SÍ, cae SOLO el ancla (`expected 0 to be greater than or equal to 1`). Las dos negativas pasarían en vacío, y el ancla lo impide            |
| H8 el build falla DESPUÉS de Vite (`pnpm build && exit 1`)                               | 24/25          | cae SOLO @s14 (`expected 1 to be +0`). @s45 sigue verde: la captura en el `catch` NO rompe el `.status`, que se asigna antes (`home:41-43`) |
| H9 ancla de la otra app                                                                  | 24/25          | SÍ, el 2º ancla de @s42                                                                                                                     |
| H10 control con `FORCE_COLOR=1` heredado                                                 | 25/25          | no salta: el escape ANSI envuelve la frase entera (`^[[32mbuilding client environment for production...`)                                   |

**contacto-horneado** (24 tests): los mismos sabotajes dan el mismo patrón.

- C1 heredado: 20/24, con @s43 ×2 y @s45 ×2.
- C2 sin `MODE`: @s45 ×2.
- C3 sin `NODE_ENV`: @s43 ×2.
- C4 `jsxDEV`: 1. C4 `fileName:'…'`: 1.
- C6 log «for test»: @s45 ×2.
- C7a vacuidad: solo el ancla de @s45.
- C8 `&& exit 1`: solo @s10, que es el exit 0 de contacto. @s45 sigue en verde.
- C9 ancla ajena: el 2º ancla de @s43.

**trampas-del-horneado** (45 tests):

| Sabotaje                                                      | Resultado                                                                                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| T0 control                                                    | 45/45                                                                                                                            |
| **T1 entorno heredado (`NODE_ENV=test MODE=test`)**           | 25/45. Caen @s44 `jsxDEV` ×5 (13/14/14/14/14) y `fileName:` ×5 (10/11/11/11/11), y @s45 2º ×5 y 3º ×5. @s32/@s33 siguen en verde |
| T2 sin `MODE`                                                 | 35/45: @s45 2º y 3º, ×5                                                                                                          |
| T3 sin `NODE_ENV`                                             | 35/45: @s44 `jsxDEV`/`fileName:`, ×5                                                                                             |
| T4 `jsxDEV` inyectado / ``fileName:`…` `` inyectado           | 40/45 cada uno: la negativa correspondiente, ×5                                                                                  |
| **T6 leer `salida` (la de la PUERTA) en vez de la del build** | 40/45: el ancla de @s45, ×5. Es el «si se confunden, el ancla cae» del contrato                                                  |
| **T7a stdout del build a `/dev/null` (vacuidad)**             | 40/45: el ancla de @s45, ×5                                                                                                      |
| T8 una fila no construida (`head-correcta`)                   | 38/45: las 7 aserciones de esa fila, con `TypeError` (falla cerrada, no verde)                                                   |

**Hallazgo lateral.** El comentario del contrato (`.feature`:1877) cita `logLevel: 'silent'` como forma de silenciar el log, y no lo es: H7b (en el `vite.config.ts` real) da 25/25 y T7b (en el de la app mínima) da 45/45. vite-react-ssg 0.9.0 construye el cliente con su propio `customLogger: createLogger()` (`node_modules/vite-react-ssg/dist/shared/vite-react-ssg.DsKK_1op.mjs:732` y `:758`), que ignora `logLevel`. Con `silent` desaparece la línea «building ssr environment», pero «building client environment for production» sigue saliendo. No afecta al veredicto: el log sigue siendo la prueba y la defensa contra la vacuidad es real (H7a/C7a/T7a/T6). Es solo un ejemplo inexacto en un comentario no normativo (ver Cambios, 1).

### Punto 4: el artefacto de los tests es el de `pnpm build` directo (sha256)

- **Entorno de un worker de Vitest, completo.** Lo capturé con una sonda de un solo uso en la copia (`env-worker.json`). Difiere del shell en 21 claves, entre ellas `MODE=test`, `NODE_ENV=test`, `TEST=true`, `VITEST=true`, `VITEST_POOL_ID`, `VITEST_WORKER_ID`, `BASE_URL=/`, `DEV=1`, `PROD=` y `SSR=`.
  - El diario anotó `SSR=1`; en mi sonda sale `SSR=""`. No influye: el build lo decide `MODE`/`NODE_ENV`.
- **Tres builds en la MISMA ruta de la copia:**
  - A: fuera de Vitest, con ese entorno más `NODE_ENV=production MODE=production`.
  - B: `pnpm build` directo, sin `NODE_ENV` ni `MODE`.
  - C: el `dist/` que deja el propio `home-horneado.test.ts` corriendo bajo Vitest.
  - D: además, el `dist/` del repo (el `pnpm build` directo del craftsman, 12:57), leído sin tocarlo.
- **Resultado:**
  - Los **28 ficheros de `dist/assets/` son idénticos por sha256 en A, B, C y D**: `app-CWmDYxle.js` (164 751 B, 0 `jsxDEV`, 0 `fileName:`), `app-Cgt1McRq.css`, `client-*.js`, las fuentes y las imágenes.
  - `static-loader-data/index.<hash>.json` tiene el mismo sha256 en los tres builds.
  - Solo difieren `index.html` y `static-loader-data-manifest-<hash>.json`. Ambos son IDÉNTICOS una vez normalizado el hash aleatorio (`__VITE_REACT_SSG_HASH__`, `Math.random()`).
  - Frente al repo difiere también `.vite/ssr-manifest.json`: lleva rutas absolutas de `node_modules`, no se publica y no está en `assets/`.
  - Los bundles de los experimentos salen con el mismo hash en la copia que en el repo: `app-D946Yd8C.js` (83 684 B) y `app-BYpc6tA3.js` (95 213 B) ×4. En producción no dependen de la ruta del disco, tal como dice el diario.
- **La afirmación del diario queda reproducida**, y también con `MODE=production`, que es el estado final.

## Disciplina TDD

- ¿Producción sin test que la pida? **NO**. No se toca producción: los dos commits solo cambian ficheros de test y el diario.
  - `NODE_ENV: 'production'` lo piden las negativas de @s42-@s44, que estaban en ROJO.
  - `MODE: 'production'` lo piden el 2º y el 3º `Then` de @s45, en ROJO.
  - Conservar el stdout lo pide el ancla de @s45, en ROJO: `ReferenceError`/`TypeError` porque la salida no existía.
  - La rama `catch` que conserva `error.stdout` (`home:39-44`, `contacto:45-50`) no la fuerza ningún test automático. Es una exigencia literal del contrato («si el build falla, la que trae el error», `.feature`:1856-1857), está declarada en la Decisión 2 del diario y yo la he ejercitado con H8/C8. Aceptable.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ**, y la he verificado con los artefactos que dejó el craftsman en el scratchpad:
  - `rojo-s42-jsxdev.log` (11:13, 21 tests, `expected 368`) y `rojo-s42-filename.log` (11:14, 22 tests, 368 y 365).
  - `rojo-s44-c1.log` (11:39, ancla ×5 `Target cannot be null`), `rojo-s44-jsxdev.log` (11:53, 13/14) y `rojo-s44-filename.log` (11:55, 10 failed | 20 passed).
  - `rojo-s45-home-c2.log` (12:21) y `-c3.log` (12:23), y `rojo-s45-trampas.log` (12:50, 10 failed | 35 passed).
  - Todos son ANTERIORES a los commits (12:06 y 13:06), y los recuentos crecen de uno en uno.
  - De contacto no hay log guardado, solo el texto del diario. Mis C1/C2 reproducen exactamente sus mensajes (368/365, `[' test...\ntr']`, 1).
- **La desviación de «un test a la vez» está declarada (Decisión 1) y la acepto.** La 2ª negativa se escribió con la 1ª todavía en rojo porque la corrección es UNA línea que pone las dos en verde, y el contrato exige que «nacen en ROJO». Hacerlo al revés habría obligado a un sabotaje.
- **Anclas nacidas en verde, como exige el contrato.** Su no-vacuidad está probada con sabotajes en el diario y en mi tabla (H7a, H9, C7a, C9, T6, T7a, T8).
- **REFACTOR en verde:** contar en vez de `toContain` (para no volcar el bundle), `PREFIJO_DE_ASSETS`, `FILAS_DE_S44` → `FILAS_DE_LOS_EXPERIMENTOS` y el ancla de @s45 compartiendo la extracción del 2º `Then`.

## Calidad

- **Funciones cortas y de un solo motivo:** `modulosDeLaApp`, `bundleDeLaApp`/`leerBundleDeLaApp`, `apariciones` y `trasCadaModoDelLog`, todas de 3 a 7 líneas. Los nombres dicen qué devuelven.
  - `apariciones` usa `matchAll`, que lanza sin `g`: un olvido cae en ROJO, nunca da un recuento falso.
- **La captura no rompe el `.status`.** En el `catch`, `codigoSalida = fallo.status` va ANTES de leer `fallo.stdout` (`home:41-43`, `contacto:47-49`), y en éxito `codigoSalida` sigue en 0. Lo prueban H8/C8: cae la aserción de exit 0 que le toca y @s45 no se ve afectado.
  - `stdio: 'pipe'` no cambia. La salida de `pnpm build` son unos 4 KB, lejos del `maxBuffer` de 1 MiB de `execSync`.
- **Trampas: falla cerrada.** Si falta el módulo o el fichero, `leerBundleDeLaApp` lanza dentro del `beforeAll` y cae el fichero entero (diario, Decisión 4). El build no tiene `catch` y conserva su semántica de antes.
- **Duplicación entre los tres ficheros, exigida por el contrato y no bloqueante.** `ATRIBUTO`+`atributosDe`, `apariciones`, `trasCadaModoDelLog`, `PREFIJO_DE_ASSETS`/`modulosDeLaApp`/`bundleDeLaApp` están en dos o tres copias, unas 45 líneas por fichero.
  - El `.feature` (:1807-1809) prohíbe importar `src/` u otro test: importar un test registraría su `beforeAll`, e importar `src/lib/` metería los builds en la cobertura de Stryker.
  - En las tres copias el criterio es el mismo, y lo he comprobado leyendo el código.
  - Ver Cambios, 2.
- **Nits no bloqueantes:**
  - `trasCadaModoDelLog` lee el estado del módulo en home/contacto y recibe un parámetro en trampas. Es coherente con cómo cada fichero guarda su build.
  - El 2º `Then` compara los 11 caracteres que siguen a la frase, así que «for productionX» pasaría. Es la letra del `Then` («seguida del literal production»), así que no pido cambio.
- **Estilo.** `prettier --check` pasa en los tres ficheros y en el diario. `tsc` y `eslint` dan 0 dentro de `bin/harness init`. No hay `console.*`, `debugger`, `.only` ni `.skip`. Los dos «TODO» que devuelve el grep son la palabra española en nombres de test de F-12, no marcadores.
- **Arquitectura.** Sin dependencias nuevas. `vite.config.ts` y `package.json` intactos. El despliegue (`deploy-pages.yml` → `pnpm build`) no cambia.
- **Coste.** `bin/harness init` tarda 89 s en total (vitest `Duration` 77,75 s) con 1556 tests. El diario midió 96,3 s antes de la enmienda y 84,1 s después: no es más caro.

## Checkpoints

- C1: [x] Existen los ficheros base y los docs. [x] `bin/harness init` en el repo, UNA vez → **exit 0**: lint OK, **47/47 ficheros, 1556/1556 tests** (1535 + 21 de @s45).
- C2: [x] Ninguna feature `in_progress`. F-04 sigue `done` con el patrón de enmienda. [x] Las features `done` tienen sus tests en verde. [x] `progress/current.md` describe la sesión activa (líneas 75-94, ENMIENDA 4 y su ampliación).
- C3: [x] Solo cambian ficheros de test y `progress/`. [x] Sin dependencias nuevas. [x] Sin logs de depuración ni TODOs.
- C4: [x] Hay tests por módulo. [x] Aislamiento real: builds reales en `dist/` y `.experimentos-tmp/`, sin mocks del sistema de ficheros. [x] La suite es > 0 y está en verde.
- C5: [x] `git status` limpio tras init y build (`dist/` y `.experimentos-tmp/` están en `.gitignore`). [ ] Entrada en `progress/history.md`: la sesión sigue abierta y le toca al lead al cerrarla, mismo criterio que en las ENMIENDAS 2 y 3. [x] F-04 queda `done`.
- C6: [x] El `.feature` (banner, línea AMPLIACIÓN y @s42-@s45) y la sección de la spec existen. [x] Los escenarios están tagueados y sus `Then` son medibles. [x] El mapa `@s → test` del diario está verificado línea a línea. [x] No hay producción sin test rojo.
- C7: [x] No aplica corrida nueva: no hay lógica mutable nueva ni cambio en `mutate`/`stryker.config.json`. Los tres ficheros siguen fuera de la corrida de Stryker (44/47, comprobado). La mutación de `horneado.ts` sigue al 100 % (`progress/mutation_cascaron_enmiendas.md`). La declaración NO-MUTABLE del diario es correcta.
- **Build final en el repo.** `pnpm build` → **exit 0** con las 5 puertas en ✓ (cascarón, placeholders, contraste, terceros con «hornea los 6 pares de fuente», anclas) y «building client environment for production». `dist/` queda en PRODUCCIÓN: `app-CWmDYxle.js`, 164 751 B, 0 `jsxDEV` y 0 `fileName:`.

## Cambios requeridos (si aplica)

Ninguno bloqueante. Recomendaciones al lead, sin reabrir el TDD:

1. **Corregir el ejemplo del comentario de `.feature`:1877.** `logLevel: 'silent'` no silencia la línea del cliente en vite-react-ssg 0.9.0, porque este pasa su propio `customLogger` (`vite-react-ssg.DsKK_1op.mjs:732/758`). Solo silencia la del SSR. Basta con quitar ese ejemplo o matizarlo. `customLogger`, `stdio: 'ignore'`/`'inherit'` y redirigir la salida SÍ vacían el log, y ahí el ancla cae (H7a/C7a/T7a).
2. **Vigilar la duplicación de las extracciones entre los tres build-based.** Hoy la exige el contrato. Si aparece un cuarto fichero build-based, conviene una enmienda que permita un helper común FUERA de `src/` y de `mutate` (p. ej. bajo `tests/`), para no mantener cuatro copias del mismo criterio.
3. **Entrada en `progress/history.md` al cerrar la sesión** (C5).
