# TDD — los tests build-based construyen en un `dist/` TEMPORAL (hallazgo H-3)

> Bitácora del `tdd_craftsman`. Contrato: `progress/brief_tests_build_aislado.md` (infraestructura de
> tests, sin `.feature`, `"sdd": false`). Worktree `.claude/worktrees/tests-build-aislado`, rama
> `worktree-tests-build-aislado`, base `ba5b498`. Sin commits.

## Línea base medida antes de tocar nada (2026-09-30)

- `dist/` del worktree EXISTE: directorio `16:07:07.151345800`, `dist/index.html` `16:07:07.148590100`
  (lo dejó la última suite completa que corrió el hook).
- Las 4 puertas IGNORAN hoy `NLS_DIST_DIR` (medido con un script de scratch, `cwd` en la raíz):

  | puerta       | `NLS_DIST_DIR` vacía | `NLS_DIST_DIR=C:/no/existe/dist` |
  | ------------ | -------------------- | -------------------------------- |
  | cascaron     | exit 0 (599 ms)      | exit 0 (505 ms)                  |
  | placeholders | exit 0 (2333 ms)     | exit 0 (2528 ms)                 |
  | terceros     | exit 0 (500 ms)      | exit 0 (538 ms)                  |
  | anclas       | exit 0 (586 ms)      | exit 0 (499 ms)                  |

  → con un directorio inexistente deberían fallar cerradas y salen en 0: están leyendo el `dist/` viejo
  del proyecto. Es la «pareja» de R2 vista a mano. `placeholders` tarda ~2,5 s: el `it` de cada puerta
  lleva su propio timeout (el de Vitest por defecto, 5 s, queda justo con la máquina cargada).

## Ciclo R1 · `home-horneado`: «el build de este fichero NO toca el `dist/` del proyecto»

### ROJO

Test nuevo en `src/pages/home-horneado.test.ts` (describe `H-3 el build de home-horneado NO toca el
dist/ del proyecto`): `huellaDe(directorio)` = `{ existe, mtimeDelDirectorio, mtimeDelIndex }` con
`statSync(…, { throwIfNoEntry: false })`; la huella del `dist/` del proyecto se toma en la PRIMERA línea
del `beforeAll` (antes del build) y el `it` la compara después con `toEqual`. Lleva ANCLA POSITIVA (la
misma `huellaDe` SÍ ve el `dist/` que el build acaba de dejar: `existe: true` y `mtimeDelIndex` numérico)
para que una huella ciega no dé verde en vacío (patrón `verde-por-vacuidad…`); el ancla pasa en rojo y en
verde, como toda ancla; el rojo lo pone la comparación.

Salida REAL (`pnpm exec vitest run src/pages/home-horneado.test.ts`, 16:26):

```text
 ❯ src/pages/home-horneado.test.ts (27 tests | 1 failed) 16198ms
     × H-3 la huella del dist/ del proyecto (¿existe?, mtime del directorio y de dist/index.html) es la MISMA antes y después del build 12ms

 FAIL  src/pages/home-horneado.test.ts > H-3 el build de home-horneado NO toca el dist/ del proyecto > H-3 la huella del dist/ del proyecto (¿existe?, mtime del directorio y de dist/index.html) es la MISMA antes y después del build
AssertionError: expected { existe: true, …(2) } to deeply equal { existe: true, …(2) }

- Expected
+ Received

  {
    "existe": true,
-   "mtimeDelDirectorio": 1790778153417.5168,
-   "mtimeDelIndex": 1790778153415.5188,
+   "mtimeDelDirectorio": 1790778401587.9497,
+   "mtimeDelIndex": 1790778401586.934,
  }

 Test Files  1 failed (1)
      Tests  1 failed | 26 passed (27)
```

`stat` alrededor de esa corrida: `dist/` 16:22:33.417 → 16:26:41.587 (reescrito por el build del test).

### VERDE (mínimo)

1. `vite.config.ts`: `build: { outDir: process.env.NLS_DIST_DIR || 'dist' }`, con el comentario que pide
   el brief (por qué NO aplica el patrón del literal; sin la cadena `base` + dos puntos en el texto nuevo:
   `grep '\bbase:' vite.config.ts` sigue dando SOLO la línea 31, `base: '/NailsLashStudioWeb/',`).
2. `home-horneado.test.ts`: `mkdtempSync(join(tmpdir(), 'nls-horneado-'))` en el `beforeAll` (tras la
   huella), `artefacto = <temporal>/dist`, `NLS_DIST_DIR: artefacto` en el `env` del `pnpm build`, y
   `index.html` / `assets/` leídos de `artefacto` (`rutaDeAssets()` sustituye a la constante
   `RUTA_ASSETS`, porque el temporal solo existe tras el `beforeAll`). `afterAll` → `rmSync(temporal,
{ recursive: true, force: true })`. El ancla de R1 pasa a mirar `artefacto`. Ni un import de `src/`.

Salida REAL (16:40):

```text
 Test Files  1 passed (1)
      Tests  27 passed (27)
   Duration  32.16s
```

`stat` del `dist/` del proyecto ANTES y DESPUÉS de esa corrida: `16:35:41.184538400` / `16:35:41.184538400`
(y `dist/index.html` `16:35:41.183507600` en ambos); ningún `nls-horneado-*` sobrante en `%TEMP%`.

⚠️ En este punto el verde de `@s14` (exit 0 con las 5 puertas) DEPENDE de que exista un `dist/` viejo y
válido en el proyecto: las puertas del `pnpm build` aún leen `dist/`, no el temporal. Es justo lo que
destapa R2.

### REFACTOR

Nada que limpiar: la huella y el temporal ya tienen nombre propio; los comentarios de @s41/@s42 siguen
hablando de «el `dist/assets/` de ESTE build», que sigue siendo cierto.

## Ciclo R2 · `home-horneado`: «cada puerta que lee el artefacto inspecciona `NLS_DIST_DIR`»

### ROJO

Test nuevo al final de `src/pages/home-horneado.test.ts`: `describe.each(['cascaron', 'placeholders',
'terceros', 'anclas'])` (escrita A MANO; `puerta-contraste` no lee el artefacto) con la PAREJA por puerta.
`correrPuerta(puerta, directorio)` lanza `node --experimental-strip-types
--disable-warning=ExperimentalWarning tools/puerta-<puerta>.ts` con `execSync`, `cwd: process.cwd()` (la
raíz), `stdio: 'pipe'` y `env: { ...process.env, NLS_DIST_DIR: directorio }`, y devuelve
`{ codigo, salida }` (stdout+stderr van como mensaje del `expect`, para que un fallo diga por qué).

- control: `NLS_DIST_DIR = artefacto` (el `<temporal>/dist` del build de este fichero) → `toBe(0)`.
- caso: `NLS_DIST_DIR = <temporal>/no-existe` → `toBeTypeOf('number')` y `not.toBe(0)` (un `status` null
  por señal NO cuenta como fallo cerrado).
- timeout de 30 s por `it` (medido: `placeholders` ~2,5 s).

Salida REAL (16:49; en este worktree hay un `dist/` viejo y válido, así que los 4 controles pasan y caen
los 4 casos — en una máquina sin `dist/` sería al revés: caerían los controles):

```text
 ❯ src/pages/home-horneado.test.ts (35 tests | 4 failed) 24205ms
     × H-3 caso: con NLS_DIST_DIR = un directorio INEXISTENTE dentro del temporal, sale con un código ≠ 0 406ms
     × H-3 caso: con NLS_DIST_DIR = un directorio INEXISTENTE dentro del temporal, sale con un código ≠ 0 2327ms
     × H-3 caso: con NLS_DIST_DIR = un directorio INEXISTENTE dentro del temporal, sale con un código ≠ 0 393ms
     × H-3 caso: con NLS_DIST_DIR = un directorio INEXISTENTE dentro del temporal, sale con un código ≠ 0 368ms

 FAIL  … > H-3 tools/puerta-cascaron.ts inspecciona el artefacto que señala NLS_DIST_DIR > H-3 caso: …
AssertionError: ✓ Puerta del cascarón: las 1 ruta(s) del artefacto llevan horneados el idioma, el title, la description, la canónica, un h1, los landmarks y el JSON-LD, y ningún enlace interno apunta a la nada.
: expected +0 not to be +0 // Object.is equality

 FAIL  … > H-3 tools/puerta-placeholders.ts inspecciona … > H-3 caso: …
AssertionError: ✓ Puerta de placeholders: el artefacto de producción no tiene placeholders.
: expected +0 not to be +0 // Object.is equality

 FAIL  … > H-3 tools/puerta-terceros.ts inspecciona … > H-3 caso: …
AssertionError: ✓ Puerta de terceros: el artefacto no contiene ninguna construcción que provoque una petición automática a un origen externo, y hornea los 6 pares de fuente autohospedados esperados. Ningún tercero recibe la IP del visitante.
: expected +0 not to be +0 // Object.is equality

 FAIL  … > H-3 tools/puerta-anclas.ts inspecciona … > H-3 caso: …
AssertionError: ✓ Puerta de anclas vivas: cada href="#id" de la nav resuelve a un id presente en su página y cada sección navegable está enlazada por la nav (igualdad de conjuntos).
: expected +0 not to be +0 // Object.is equality

 Test Files  1 failed (1)
      Tests  4 failed | 31 passed (35)
```

`dist/` del proyecto antes/después de esa corrida: `16:44:42.526454400` / `16:44:42.526454400` (R1 sigue
verde: las puertas LEEN el `dist/` viejo, no lo escriben).

### VERDE (mínimo)

1. `tools/artefacto.ts` (nuevo, humilde): `DIRECTORIO_ARTEFACTO = process.env.NLS_DIST_DIR || 'dist'`,
   `ubicacionLogica(rutaFisica)` = `join('dist', relative(DIRECTORIO_ARTEFACTO, ruta))` con `/`, y
   `rutaFisica(ubicacion)` = `join(DIRECTORIO_ARTEFACTO, relative('dist', ubicacion))`. No lista, no
   filtra, no lee. Probado a mano antes de cablearlo:

   ```text
   (sin variable)  dist | dist | dist/index.html | dist/assets/x.css | dist | dist\index.html | dist\assets\x.css
   (NLS_DIST_DIR=C:/Temp/nls-horneado-xyz/dist)
                   C:/Temp/nls-horneado-xyz/dist | dist | dist/index.html | dist/assets/x.css
                   | C:\Temp\nls-horneado-xyz\dist | …\dist\index.html | …\dist\assets\x.css
   ```

   Sin variable, las ubicaciones que reciben las puertas son EXACTAMENTE las de antes
   (`dist/index.html`, `dist/assets/…`).

2. `tools/puerta-cascaron.ts` y `tools/puerta-anclas.ts`: la constante local `DIRECTORIO_ARTEFACTO = 'dist'`
   se sustituye por la del helper; `listarHtml` lee la ruta FÍSICA (`join(entrada.parentPath,
entrada.name)`) y entrega `ubicacion: ubicacionLogica(ruta)`. `ES_HTML` se queda en cada humilde.
3. `tools/puerta-placeholders.ts`: el adaptador traduce en los TRES métodos (`existeDirectorio`,
   `listarFicheros`, `leer`) con `rutaFisica(…)` y devuelve lógicas con `ubicacionLogica(…)`.
4. `tools/puerta-terceros.ts`: igual que el cascarón; el filtro `ES_HTML_O_CSS` y la allowlist se quedan
   donde estaban.

Anclas de texto comprobadas tras el cambio (ver «Comprobaciones finales»): siguen en su sitio
`registros, ficheros: sistemaDeFicherosReal`, `A-21`, ningún `html|css` en `puerta-placeholders.ts`;
`allowlist: [],`, `/\.(html|css)$/i`, `entrada.isFile() && ES_HTML_O_CSS.test(entrada.name)`, `A-23` y
`A-27` en `puerta-terceros.ts`.

Las 4 puertas a mano tras el cambio (mismo script de la línea base):

| puerta       | `NLS_DIST_DIR` vacía | `NLS_DIST_DIR=C:/no/existe/dist` | línea con la que falla cerrada                                            |
| ------------ | -------------------- | -------------------------------- | ------------------------------------------------------------------------- |
| cascaron     | exit 0               | exit 1                           | `/ — ruta esperada sin HTML en dist/: ""`                                 |
| placeholders | exit 0               | exit 1                           | `no había nada que inspeccionar: no existe el directorio "dist"`          |
| terceros     | exit 0               | exit 1                           | `… no pudo completar la inspección: ENOENT … scandir 'C:\no\existe\dist'` |
| anclas       | exit 0               | exit 1                           | `no se pudo inspeccionar el artefacto: el directorio dist/ no existe`     |

(Los mensajes de las puras dicen `dist` porque reciben la ubicación LÓGICA: es el diseño, `src/lib/` no
se toca. Solo el ENOENT de terceros, que viene de `readdirSync`, nombra la ruta física.)

Salida REAL de `pnpm exec vitest run src/pages/home-horneado.test.ts` (17:24):

```text
 Test Files  1 passed (1)
      Tests  35 passed (35)
   Duration  30.24s
```

`dist/` del proyecto antes/después: `17:19:04.027830500` / `17:19:04.027830500`; 0 `nls-horneado-*` en `%TEMP%`.

### REFACTOR

Nada: el duplicado `listarHtml` de cascarón/anclas ya existía antes de este encargo y lleva dentro el
filtro de extensión, que el brief manda dejar en cada humilde. El helper no crece.

## Ciclo R3 · `contacto-horneado`: la misma huella de R1, para SU build

### ROJO

Mismo par que R1 (huella escrita A MANO otra vez: el fichero no importa nada de otro test) al final de
`src/pages/contacto-horneado.test.ts`, con la huella en la primera línea de su `beforeAll`. Salida REAL
(`pnpm exec vitest run src/pages/contacto-horneado.test.ts`, 17:32):

```text
 ❯ src/pages/contacto-horneado.test.ts (26 tests | 1 failed) 14381ms
     × H-3 la huella del dist/ del proyecto (¿existe?, mtime del directorio y de dist/index.html) es la MISMA antes y después del build 18ms

 FAIL  src/pages/contacto-horneado.test.ts > H-3 el build de contacto-horneado NO toca el dist/ del proyecto > H-3 la huella del dist/ del proyecto (¿existe?, mtime del directorio y de dist/index.html) es la MISMA antes y después del build
AssertionError: expected { existe: true, …(2) } to deeply equal { existe: true, …(2) }

- Expected
+ Received

  {
    "existe": true,
-   "mtimeDelDirectorio": 1790782082963.873,
-   "mtimeDelIndex": 1790782082962.195,
+   "mtimeDelDirectorio": 1790782366191.5737,
+   "mtimeDelIndex": 1790782366190.0576,
  }

 Test Files  1 failed (1)
      Tests  1 failed | 25 passed (26)
```

`dist/` 17:28:02.963 → 17:32:46.191 (reescrito por este build: `vite.config.ts` ya honra la variable,
pero este fichero aún no la pasaba).

### VERDE (mínimo)

Solo el test: `mkdtempSync(join(tmpdir(), 'nls-horneado-'))`, `NLS_DIST_DIR: <temporal>/dist` en el `env`
del `pnpm build`, `index.html` y `assets/` leídos de ahí (desaparecen `RUTA_DIST` y `RUTA_ASSETS`),
`afterAll` con `rmSync` recursive + force, y el ancla de R3 mirando el artefacto temporal. Salida REAL
(17:39):

```text
 Test Files  1 passed (1)
      Tests  26 passed (26)
   Duration  18.79s
```

`dist/` antes/después: `17:32:46.191573800` / `17:32:46.191573800`; 0 `nls-horneado-*` en `%TEMP%`. La
suite completa que lanzó el hook tras este Write (≈17:33-17:39) tampoco lo tocó: seguía en `17:32:46`.

### REFACTOR

Nada: la huella está duplicada entre los dos ficheros A PROPÓSITO (mismo criterio que `ATRIBUTO`: ninguno
de los dos importa nada de otro test ni de `src/`).

## Trazabilidad (criterio de cierre / R → test)

- R1 (`home-horneado` no toca el `dist/` del proyecto) → `H-3 el build de home-horneado NO toca el dist/
del proyecto` › `H-3 la huella del dist/ del proyecto (…) es la MISMA antes y después del build` (+ su
  `ANCLA POSITIVA: la huella SÍ ve el dist/ que este build acaba de dejar`).
- R2 (cada puerta que lee el artefacto inspecciona `NLS_DIST_DIR`) → `H-3 tools/puerta-%s.ts inspecciona
el artefacto que señala NLS_DIST_DIR` × {cascaron, placeholders, terceros, anclas} › `H-3 control: …
sale con 0` y `H-3 caso: … sale con un código ≠ 0` (8 tests).
- R3 (`contacto-horneado` no toca el `dist/` del proyecto) → `H-3 el build de contacto-horneado NO toca el
dist/ del proyecto` › `H-3 la huella … es la MISMA antes y después del build` (+ su ancla).
- Criterio 1 (suite completa) → `pnpm test`: 47 ficheros, 1568 tests (línea base 1556 + 12 nuevos), exit 0.
- Criterio 2 (`dist/` intacto tras `pnpm test`) → R1 + R3, y medido sobre la suite COMPLETA (abajo).
- Criterio 3 (`pnpm build` sin variable produce `dist/` y pasa las 5 puertas) → medido (abajo).
- Criterio 4 (las puertas inspeccionan el artefacto REAL que acaba de construir ese `pnpm build`) → R2
  (control+caso por puerta) y la corrida SIN `dist/` del proyecto (abajo): `@s14`/`@s10` (exit 0 con las
  CINCO puertas) solo pueden pasar si las puertas del build leen el temporal.
- Criterio 5 (typecheck, lint, `format:check`, Stryker) → abajo.

## Comprobaciones finales

1. **Los dos build-based SIN `dist/` en el proyecto** (se apartó a scratch para simular CI; 17:39):
   `pnpm exec vitest run src/pages/home-horneado.test.ts src/pages/contacto-horneado.test.ts` →
   `Test Files 2 passed (2) · Tests 61 passed (61) · 38.64s`. Antes: `stat: cannot stat 'dist'`. Después:
   `stat: cannot stat 'dist'` — «si no existía, sigue sin existir». Ni `.vite-react-ssg-temp/` ni
   `nls-horneado-*` sobrantes.
2. **`pnpm build` sin variable** (17:41): exit 0; escribe `dist/index.html` (56.32 KiB) y las cinco líneas
   `✓ Puerta del cascarón… / ✓ Puerta de placeholders… / ✓ Puerta de contraste… / ✓ Puerta de terceros…
/ ✓ Puerta de anclas vivas…`. `dist/` queda en `17:41:05.513607700`.
3. **Suite completa `pnpm test`** (17:42-17:48): exit 0, `Test Files 47 passed (47) · Tests 1568 passed
(1568) · 331.26s`. `dist/` ANTES `17:41:05.513607700` (índice `17:41:05.512604800`) y DESPUÉS
   `17:41:05.513607700` (índice `17:41:05.512604800`): idéntico.
4. `pnpm typecheck` → exit 0. `pnpm lint` (eslint) → exit 0.
5. `pnpm format:check` → el código pasa; solo avisaba de dos `.md`: esta bitácora (formateada con
   `prettier --write` al cerrarla) y `progress/brief_tests_build_aislado.md`, que es del lead y NO he
   tocado (ver notas).
6. Anclas de texto (`grep`): `puerta-placeholders.ts` trae `registros, ficheros: sistemaDeFicherosReal`
   (l. 56) y `A-21` (l. 42) y ningún `html|css`; `puerta-terceros.ts` trae `A-27` (l. 32, 55),
   `/\.(html|css)$/i` (l. 60), `entrada.isFile() && ES_HTML_O_CSS.test(entrada.name)` (l. 70), `A-23`
   (l. 87) y `allowlist: [],` (l. 100). `diferidos.test.ts` y `puerta-terceros.test.ts` verdes dentro de
   la suite completa.
7. `\bbase:` en `vite.config.ts`: una sola aparición, la línea 31 (`base: '/NailsLashStudioWeb/',`).
8. Stryker: ni `stryker.config.json` ni `vitest.stryker.config.ts` tocados; los `*-horneado.test.*` ya
   estaban excluidos; `src/lib/` intacto → su mutación no se mueve. `tools/` no está en `mutate`.
9. Ficheros tocados (`git status`): `src/pages/home-horneado.test.ts`, `src/pages/contacto-horneado.test.ts`,
   `vite.config.ts`, `tools/artefacto.ts` (nuevo), `tools/puerta-{cascaron,placeholders,terceros,anclas}.ts`
   y esta bitácora. Sin commits. No he escrito en `progress/current.md` porque el encargo acota los
   ficheros a estos.

## Notas para el lead

- **`format:check` seguirá en rojo por `progress/brief_tests_build_aislado.md`** (tu brief, sin
  formatear): `pnpm exec prettier --write progress/brief_tests_build_aislado.md` lo arregla. No lo he
  tocado porque no es mío.
- **Hook y ritmo**: cada Edit/Write disparó la suite completa (~6 min, bloqueante); la bitácora la he ido
  escribiendo con `cat >>` desde Bash para no pagar una suite por párrafo. El código, siempre con
  Edit/Write (hook incluido).
- **Riesgo residual, fuera de mi alcance (`trampas-del-horneado.test.tsx` no se toca)**: su subproceso de
  `tools/puerta-cascaron.ts` hereda `process.env` entero. Si alguien exportara `NLS_DIST_DIR` en la shell
  que corre la suite, esa puerta leería ESE directorio en vez del `dist/` del experimento. Hoy nadie lo
  exporta (los dos build-based la pasan solo al `env` de SU subproceso, no a `process.env`).
- Comentario viejo ya desfasado ANTES de este encargo: `tools/puerta-terceros.ts` cita
  «`ES_HTML = /\.html$/i` en tools/puerta-cascaron.ts:23»; estaba en la 27 y ahora en la 33. No es ancla
  de ningún test; no lo he tocado por no gastar otra suite en un comentario.
- Los mensajes de fallo de las puras siguen diciendo `dist` aunque el artefacto viva en el temporal (es el
  diseño: reciben la ubicación LÓGICA). Solo el ENOENT de terceros nombra la ruta física.
- El `dist/` del worktree queda como lo dejó mi `pnpm build` de las 17:41:05 (el que había al empezar lo
  aparté a mi scratchpad para la prueba sin `dist/`).
