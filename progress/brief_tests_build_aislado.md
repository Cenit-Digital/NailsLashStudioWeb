# Brief — los tests build-based construyen en un `dist/` TEMPORAL (hallazgo H-3)

> Lo escribe el `craftsman_lead` para el `tdd_craftsman`. Infraestructura de tests, **sin `.feature`**
> (no cambia ningún comportamiento del sitio; mismo trato que F-20, `"sdd": false`). El diseño está
> DECIDIDO aquí: no lo reabras sin una razón medida, y si la encuentras, para y anótala.

## El problema (medido)

`home-horneado.test.ts` y `contacto-horneado.test.ts` corren el `pnpm build` REAL en su `beforeAll` y
leen el resultado del `dist/` compartido del proyecto. Los hooks de `.claude/settings.json` corren la
suite en cada Edit/Write (`PostToolUse`) y en cada fin de turno (`Stop`), así que **cada edición rehace
`dist/`**. H-3 (`progress/verificacion_viva_logo_acoplado.md` en la rama de F-25): `vite preview`
sirviendo `dist/` mientras la cadena `claude → Stop → harness init → pnpm test → vitest → pnpm build`
lo vaciaba y reescribía → `ERR_HTTP_RESPONSE_CODE_FAILURE` y páginas sin JS.

Línea base en este worktree (2026-09-30, lead): sin `dist/` al empezar; `bin/harness init` verde
(47 ficheros, 1556 tests, suite 378 s) y **al terminar existe `dist/`** (creado 15:51:50 por la suite).

## Hecho = (criterios de cierre)

1. La suite completa pasa.
2. Tras `pnpm test`, el `dist/` del proyecto está EXACTAMENTE como antes (si no existía, sigue sin
   existir; si existía, mismo mtime del directorio y de `dist/index.html`).
3. `pnpm build` (sin variable) sigue produciendo `dist/` y pasando las CINCO puertas, igual que hoy.
4. Las puertas siguen inspeccionando el artefacto de producción REAL: en los tests, el que acaba de
   construir ese mismo `pnpm build`, ahora en un directorio temporal.
5. typecheck, lint y `format:check` en verde. Stryker intacto (sus tests build-based ya están excluidos).

## Diseño decidido

1. **Una variable de entorno, `NLS_DIST_DIR`** = directorio FÍSICO del artefacto. Sin valor (o vacía)
   → `dist`, y todo se comporta EXACTAMENTE como hoy. Sin prefijo `VITE_` (Vite expone esas al cliente).
2. **`vite.config.ts`**: `build: { outDir: process.env.NLS_DIST_DIR || 'dist' }`.
   - ⚠️ La puerta de terceros lee este fichero como TEXTO con `/\bbase:([^,\n]*)/` (PRIMER match): no
     escribas `base:` (minúsculas + dos puntos) en ningún comentario ni código nuevo. `outDir` no lo
     vigila ninguna puerta, así que aquí NO aplica el patrón «valor guardado por puerta que lee la
     config como texto debe ser literal» (`.memoria-cache/patterns/tooling/`); dilo en el comentario.
   - Vite, con un `outDir` fuera de la raíz, avisa y no lo vacía: da igual, el temporal es nuevo.
3. **`tools/artefacto.ts`** (nuevo, humilde, sin decisiones): el directorio físico
   (`process.env.NLS_DIST_DIR || 'dist'`) y la traducción entre ruta FÍSICA y ubicación LÓGICA
   `dist/<relativa con />`. Lo usan las 4 puertas que leen el artefacto: `puerta-cascaron`,
   `puerta-placeholders`, `puerta-terceros`, `puerta-anclas`. `puerta-contraste` no lee el artefacto:
   no se toca. **Los módulos puros de `src/lib/` NO se tocan**: siguen recibiendo ubicaciones `dist/…`
   (de eso dependen sus mensajes y el `rutaDelFichero` de la puerta del cascarón), así que su mutación
   al 100 % no se mueve. `puerta-placeholders` recibe rutas lógicas en `existeDirectorio`,
   `listarFicheros` y `leer`: su adaptador traduce en los tres.
   - Anclas de TEXTO que leen estos humildes y deben seguir verdes (NO las rompas):
     - `tools/puerta-placeholders.ts`: contiene `registros, ficheros: sistemaDeFicherosReal` y `A-21`;
       NO contiene `html|css` (`diferidos.test.ts`, `puerta-terceros.test.ts` @s40).
     - `tools/puerta-terceros.ts`: contiene `allowlist: [],`, `/\.(html|css)$/i`,
       `entrada.isFile() && ES_HTML_O_CSS.test(entrada.name)`, `A-23` y `A-27` (@s39, @s40). El filtro
       de extensión se QUEDA en cada humilde, no se mueve al helper.
   - `package.json` → `scripts.build` NO cambia (varios tests anclan el orden de las puertas).
4. **Los dos tests build-based** (`home-horneado`, `contacto-horneado`): cada fichero crea su temporal
   con `mkdtempSync(join(tmpdir(), 'nls-horneado-'))`, construye con
   `execSync('pnpm build', { stdio: 'pipe', env: { ...process.env, NODE_ENV: 'production', MODE:
'production', NLS_DIST_DIR: <temporal>/dist } })`, lee TODO (`index.html`, `assets/`) de ese
   `<temporal>/dist`, y lo borra en `afterAll` (`rmSync` recursive + force). Siguen sin importar nada
   de `src/` (Stryker). El resto de sus aserciones no cambia.
5. **`trampas-del-horneado.test.tsx` NO se toca**: ya construye en `.experimentos-tmp/<nombre>/dist`
   con su propio `cwd`, y nunca toca el `dist/` del proyecto.
6. **Lo hace el lead, no tú:** comentarios de `vitest.config.ts` y `vitest.stryker.config.ts`
   (`fileParallelism: false` SE QUEDA: vite-react-ssg borra ENTERA la carpeta compartida
   `.vite-react-ssg-temp/` al final de cada build, así que dos builds en paralelo siguen pisándose
   aunque ya no compartan `dist/`), el hook de `.claude/settings.json` y los docs.

## TDD — los rojos, uno a uno (en este orden)

- **R1 · `home-horneado`**: «el build de este fichero NO toca el `dist/` del proyecto». Huella de
  `dist/` (¿existe?; mtime del directorio y de `dist/index.html`) tomada al PRINCIPIO del `beforeAll`,
  antes del build, y comparada después. Hoy ROJO: la línea base lo demuestra.
- **R2 · `home-horneado`**: «cada puerta que lee el artefacto inspecciona `NLS_DIST_DIR`». Por cada una
  de las 4, como subproceso (`node --experimental-strip-types --disable-warning=ExperimentalWarning
tools/puerta-X.ts`, `cwd` en la raíz), SIEMPRE EN PAREJA (anti-vacuidad,
  `.memoria-cache/patterns/testing/verde-por-vacuidad-en-puerta-de-verificacion.md`):
  - control: `NLS_DIST_DIR` = el artefacto temporal recién construido → exit 0;
  - caso: `NLS_DIST_DIR` = un directorio INEXISTENTE dentro del temporal → exit ≠ 0.
    Sin la pareja, el caso pasaría en verde en una máquina sin `dist/` (CI) aunque la puerta ignorase
    la variable; sin el caso, el control pasaría con un `dist/` viejo y válido. Hoy ROJO.
- **R3 · `contacto-horneado`**: la misma huella de R1, para SU build.

Reglas: un test a la vez; los esperados, a mano (anti-tautología); sin `--testFiles`.

## El entorno te va a frenar (y es justo lo que se arregla)

Cada Edit/Write dispara el hook con la suite COMPLETA (~6 min, 2 builds reales + 5 de experimento).
Agrupa las ediciones y **no lances otra suite completa en paralelo con la del hook**: suites solapadas
fue lo que H-3 relaciona con los reinicios del contenedor (exit 137). Para tus ciclos, corre SOLO el
fichero afectado (`pnpm exec vitest run src/pages/home-horneado.test.ts`).

## Entregable

`progress/tdd_tests_build_aislado.md`: bitácora de ciclos (rojo con su salida real → verde →
refactor), mapa «criterio de cierre / R → test», y las comprobaciones finales (typecheck, lint,
`format:check`, los dos ficheros build-based, y `dist/` sin tocar tras correrlos). Devuélveme UNA línea.
