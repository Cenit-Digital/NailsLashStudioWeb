# Review — H-3 tests build-based en `dist/` temporal (infra, sin `.feature`)

**Veredicto:** APPROVED (condicionado a que la verificación completa que corre el lead en paralelo
termine verde; este juez NO ha corrido `bin/harness init` por orden expresa del lead —dos builds a la
vez se pisan `.vite-react-ssg-temp/`—. Si esa corrida sale roja, este veredicto queda anulado.)

Revisión de SOLO LECTURA: `git diff`, `tools/artefacto.ts`, brief, bitácora, greps y una comprobación
puntual con `node` de `tools/artefacto.ts` (sin build).

## Cobertura del contrato (brief ↔ test)

No hay `.feature` (`"sdd": false`); el contrato son R1-R3 y los 5 criterios de cierre del brief.

- R1: [x] `src/pages/home-horneado.test.ts:467-479` (huella antes/después + ANCLA POSITIVA sobre el temporal).
- R2: [x] `src/pages/home-horneado.test.ts:521+` `describe.each` × {cascaron, placeholders, terceros, anclas},
  control (exit 0 con el temporal) + caso (exit ≠ 0, numérico, con dir inexistente). 8 tests.
- R3: [x] `src/pages/contacto-horneado.test.ts:351-363`.
- Criterio 2 (dist/ intacto tras `pnpm test`): R1+R3, y medido sobre suite completa en la bitácora (§Comprobaciones 3).
- Criterio 3 (`pnpm build` sin variable = hoy): medido en bitácora (§Comprobaciones 2) + verificación puntual abajo.
- Criterio 4 (las puertas leen el artefacto REAL del build): R2 + corrida SIN `dist/` del proyecto (§Comprobaciones 1).

## Pregunta 1 — Con `NLS_DIST_DIR` sin valor, ¿todo EXACTAMENTE igual?

SÍ. Comprobado con `node` importando `tools/artefacto.ts`, cwd en la raíz:

- sin variable: `DIRECTORIO_ARTEFACTO = "dist"`; `ubicacionLogica(join('dist','index.html')) = "dist/index.html"`,
  `…('dist','assets','x.css') = "dist/assets/x.css"`, `…('dist','servicios','index.html') = "dist/servicios/index.html"`;
  `rutaFisica('dist') = "dist"`, `rutaFisica('dist/assets/x.css') = "dist\assets\x.css"` (readFileSync lo acepta).
- `NLS_DIST_DIR=` (vacía): `"dist"`, igual.
- Antes, la ubicación era `${parentPath}/${name}` con `\` → `/` y `parentPath` bajo `dist`: mismas cadenas.
  `src/lib/puerta.ts:53,70,82` y `src/lib/puerta-cascaron.ts:764,770` siguen recibiendo `dist`/`dist/…`.
- `vite.config.ts:42` `outDir: process.env.NLS_DIST_DIR || 'dist'` = el default de Vite sin variable.
- `package.json` `scripts.build`: sin cambios (orden de puertas anclado por `puerta-{anclas,cascaron,terceros}.test.ts`).
- `tools/puerta-contraste.ts` solo lee SCSS (`:26`), no el artefacto: bien excluida de R2.
- `.harness/` no lanza `pnpm build`: los hooks ya no reescriben `dist/` tras este cambio.

## Pregunta 2 — ¿R1/R2/R3 pueden pasar en vacío o ser flaky?

- R1/R3 NO en vacío: sin `dist/` previo, «sigue sin existir» es aserción real (un build al proyecto lo crearía);
  el ANCLA POSITIVA prueba que `huellaDe` no es ciega. ROJO real registrado en bitácora (mtimes distintos).
- R2 NO en vacío: la pareja cubre los dos entornos (con `dist/` viejo válido caen los casos —rojo registrado—;
  sin `dist/` caerían los controles). El control además ejercita `ubicacionLogica`: con rutas físicas,
  `rutaDelFichero` del cascarón no produciría `/` y saldría ≠ 0.
- Flaky: no por diseño. Única fuente: un `pnpm build` EXTERNO en el mismo checkout durante la ventana del
  `beforeAll`→test (R1/R3 rojos por causa ajena, además del choque en `.vite-react-ssg-temp/`). Ya
  documentado en `vitest.config.ts`. Ver nota 2.

## Pregunta 3 — Anclas de texto

Todas intactas (grep):

- `vite.config.ts`: `base:` aparece SOLO en la línea 31; el comentario nuevo (33-41) no lo contiene y va
  DESPUÉS del `base` real, así que el primer match de `/\bbase:([^,\n]*)/` no cambia. Ningún test lee el
  `vite.config.ts` real (los de terceros usan configs sintéticas).
- `tools/puerta-terceros.ts`: `A-27` (32, 55), `/\.(html|css)$/i` (60), `entrada.isFile() && ES_HTML_O_CSS.test(entrada.name)` (70), `A-23` (87), `allowlist: [],` (100).
- `tools/puerta-placeholders.ts`: `A-21` (42), `registros, ficheros: sistemaDeFicherosReal` (56), sin `html|css`.
- `src/lib/trampas-del-horneado.test.tsx:211-218` ejecuta `tools/puerta-cascaron.ts` con `cwd` en el
  experimento: el import `./artefacto.ts` se resuelve junto al fichero y `dist` relativo al cwd → igual que antes.

## Disciplina TDD

- ¿Producción sin test que la pida? NO. `tools/artefacto.ts` y el cableado de las 4 puertas los pide R2;
  `vite.config.ts:42` lo pide R1.
- ¿Evidencia de Rojo→Verde→Refactor? SÍ, con salidas reales para R1, R2 y R3 (`progress/tdd_tests_build_aislado.md`).

## Calidad

- `tools/artefacto.ts`: humilde, 2 funciones de una línea, nombres claros, sin números mágicos. Bien.
- Duplicación de `huellaDe` entre los dos ficheros: deliberada y justificada (ningún test importa de otro/`src/`).
- Inconsistencia menor: `home-horneado.test.ts:330` usa `rutaDeAssets()` y `contacto-horneado.test.ts:287`
  `join(artefacto, 'assets', …)` inline. Cosmético.

## Checkpoints

- C1: [x] según bitácora (suite completa verde 1568/1568); `bin/harness init` NO corrido por este juez (orden del lead).
- C2: [x] no se toca `feature_list.json`.
- C3: [x] `src/` de producción intacto; sin dependencias nuevas.
- C4: [x] aislamiento real con `mkdtempSync` + subprocesos reales, sin mocks de FS.
- C5: [ ] pendiente: `.claude/settings.json` sin cambios en el momento de la revisión (hook de `.md` aún no
  aplicado; `.claude/hooks/` vacío) y `progress/history.md`/`current.md` sin entrada. Es tarea del lead.
- C6: n/a (sin `.feature`, `sdd: false`).
- C7: n/a (`src/lib/` intacto; `tools/` fuera de `mutate`; los `*-horneado` excluidos de Stryker).

## Bloqueantes

Ninguno.

## Notas (no bloqueantes)

1. `afterAll` hace `rmSync(temporal, { recursive: true, force: true })` (`home-horneado.test.ts:89`,
   `contacto-horneado.test.ts:95`) con `temporal` que vale `''` si `mkdtempSync` fallara. Improbable y
   `rmSync('')` no debería resolverse al cwd, pero un `if (temporal !== '')` cuesta una línea y quita la duda.
2. R1/R3 miden una huella parcial (mtime del directorio + `index.html`). Suficiente para el riesgo real
   (cualquier build al `dist/` del proyecto vacía el directorio y reescribe `index.html`), pero no detectaría
   una escritura solo en subcarpetas. Y dan rojo si alguien lanza `pnpm build` en el mismo checkout durante
   la suite: el mensaje culparía al test, no al build externo.
3. Si la shell que corre Vitest exportara `NLS_DIST_DIR`, `trampas-del-horneado` (subproceso de la puerta
   del cascarón, `env` heredado) leería ese directorio en vez del `dist/` del experimento. Ya anotado por el
   tdd_craftsman; se cierra pasando `env` sin esa variable en ese subproceso si algún día se exporta.
4. Comentario desfasado previo: `tools/puerta-terceros.ts:46` cita `tools/puerta-cascaron.ts:23` para
   `ES_HTML`; ahora está en la 33. No es ancla de ningún test.
5. Los mensajes de las puras dicen `dist/` aunque el artefacto viva en el temporal (diseño: ubicación
   LÓGICA); solo el ENOENT de terceros nombra la ruta física. Correcto, pero conviene saberlo al depurar.
6. `format:check`: la bitácora avisa de que `progress/brief_tests_build_aislado.md` no está formateado. Si
   sigue así, `bin/harness init` (lint incluye `format:check`) saldrá rojo; revisar en la verificación del lead.
   Este fichero de veredicto también debe pasar Prettier.
