# Review — deuda de legibilidad de F-28 (`favicon_marca`), ronda 3: tras la ronda de corrección 2

**Veredicto:** APPROVED, condicionado a I-6. La suite completa de `bin/harness init` la corre el lead; este juez
NO la ha corrido, por orden expresa del entorno. Si esa corrida sale roja, este veredicto queda anulado.

**Bloqueantes: 0. Menores: 2** (más 2 observaciones de entorno que no son del código).

Alcance: `git diff origin/main...HEAD` (merge-base `06742d3`), rama `claude/bold-liskov-c3323b` en `ca36722`.

- Nuevo desde el judge de la ronda 2 (`3a00169`):
  - `a48a296`: menores 2 y 3 (`puntoMedio` en `pathDe` y `FACTOR_DE_LA_LOCA_CORTA`), `generar.mjs` +5 −6;
  - `d7a3233` y `ca36722`: bitácora §10 y `progress/current.md`.
- `git diff --stat a48a296 HEAD -- tools src` sale vacío: desde `a48a296` no cambia código. El test no cambia
  desde `58dc0e3`.
- Aquí se vuelve a medir TODO contra `HEAD`, no solo lo nuevo.
- Contrato:
  - `progress/brief_deuda_favicon_legibilidad.md`: I-1..I-7, alcance y «Fuera de alcance»;
  - `docs/conventions.md`, `docs/tdd.md` y `CHECKPOINTS.md`.
- Bitácora: `progress/tdd_deuda_favicon_legibilidad.md`.

## Comprobaciones propias del juez (2026-10-01, 13:05-13:25, Node v22.15.0)

**Método.** En el repo no se ha escrito nada salvo este informe.

- Todo lo que muta (sabotajes, errores del CLI, módulos de equivalencia) se hizo en copias `git archive` de `HEAD`
  y de `origin/main`, y en árboles sacados con `git show`, en `<scratchpad>/legibilidad/judge-r3/`.
- Las copias usan el `node_modules` del worktree mediante un enlace de tipo junction, retirado al terminar. El
  `node_modules` del worktree queda intacto: 24 entradas y 439 en `.pnpm`, con `vitest` presente.
- Aviso para quien repita esto: en una copia con `node_modules` enlazado, `pnpm exec` intenta un `pnpm install`
  que quiere BORRAR el directorio de módulos (`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`; aquí abortó por falta
  de TTY). En las copias hay que llamar a `node node_modules/vitest/vitest.mjs` directamente.
- `git status` del worktree: 0 cambios antes y después de cada tanda.

- **I-1 (bytes), tras CADA commit que toca código.** `<scratchpad>/judge-r3/i12.mjs`:
  - el `generar.mjs` y el `_tokens.scss` de cada commit, sacados con `git show` a un árbol con la disposición de
    `RAIZ` y la woff copiada;
  - commits: `origin/main`, `591ebab`, `f401f39`, `f0a60fd`, `e99f02a`, `6109869`, `a48a296` y `HEAD`;
  - en los ocho: exit 0, stderr de 0 bytes, los tres md5 del brief §1 y `cmp` idéntico a `public/`.
  - El generador del propio worktree, con `--salida <scratchpad>/judge-r3/wt-salida`: exit 0, stderr de 0
    bytes, `69ffa8c46fbeda00da75d0f40c277ca0`, `907b23175ec72508a80af917023a6b2b` y
    `b82343170913f7ef4a6fabbb2be072fc`, y `cmp` = `public/` en los tres.
  - Sin `--salida` (en la copia de `HEAD`) escribe en `<copia>/public/` con los mismos tres md5. La interfaz
    `[--salida <dir>]` y su valor por defecto no cambian.
- **I-2 (stdout).** Los ocho commits, con la MISMA ruta absoluta de salida, dan un stdout de 360 B idéntico byte a
  byte al de `origin/main`. La línea del brief §1, sin la ruta, mide 141 B (142 con el salto) y, con la ruta
  sustituida por `<dir>`, 147 B: las tres cifras de la bitácora §10 se confirman.
- **I-3 (nombres).**
  - `pnpm exec vitest run src/pages/favicon-marca.test.ts` en el worktree: **40/40**.
  - `vitest list`: 40 nombres en el worktree y 40 en la copia de `origin/main`, con el **diff vacío**.
  - Los `it` 18-20 siguen rindiendo «tiene 256 / 1024 / 32400 píxeles».
  - En `origin/main` y en `HEAD`: 31 `it`/`it.each`, 63 `expect(` y 4 `import`. El único `expect` tocado sigue
    con el mismo valor (`toHaveLength(esperados)` → `toHaveLength(totalDePixeles)`).
- **I-4 (sabotajes).** Arnés propio (`judge-r3/i4.mjs`):
  - escrito SOLO a partir de las tablas del §2 de la bitácora (constante, valor antes → después y `it` que caen);
  - aplicado sobre la copia de `HEAD`; exige una sola línea cambiada y restaura comparando bytes;
  - las `it` se numeran por la lista de `vitest list` y se mapean por posición en el informe JSON (el título de
    la `it` 19 cambia en S13, como se declara).
  - Resultado: **27/27 coinciden**, más el control S0 (0/40).
    - S18 da **11/40** (18-20, 23, 29-32, 36, 38 y 40) y S27 **9/40** (18-20, 23, 29-32 y 36): las cifras en
      `a48a296` de sus filas.
    - S21-S26 dan verde, como se declara (filtros que los fixtures no ejercitan, y dos controles equivalentes).
  - Las cuatro regiones obligatorias dan rojo: el tipo del trozo (S1-S2), el IHDR (S3-S8), la entrada ICO
    (S9-S12) y el total de píxeles (S13-S14).
- **I-5 (errores del CLI).** Arnés propio (`judge-r3/i5.mjs`):
  - un árbol NUEVO por caso, con `generar.mjs`, `_tokens.scss` y la woff copiados, y el sabotaje en la COPIA;
  - ANTES = `origin/main` y DESPUÉS = `HEAD`;
  - las líneas de stderr se cuentan sin las vacías.

| Caso       | Sabotaje en la copia                       | Exit  | Líneas `at` | Líneas de stderr | stderr DESPUÉS (literal; la ruta, abreviada)                                                          | stdout | ¿Salida creada? |
| ---------- | ------------------------------------------ | ----- | ----------- | ---------------- | ----------------------------------------------------------------------------------------------------- | ------ | --------------- |
| c1         | `--salida` sin directorio                  | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: --salida necesita un directorio`                                                            | vacío  | no              |
| c2         | `--accent-soft: rosa;`                     | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: --accent-soft: se esperaba UNA declaración #RRGGBB en _tokens.scss (rosa)`                  | vacío  | no              |
| c2b        | `--ink` duplicada                          | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: --ink: se esperaba UNA declaración #RRGGBB en _tokens.scss (#8E3355,#8E3355)`               | vacío  | no              |
| c3         | `LETRA` = U+0416 (Ж)                       | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: la fuente no tiene glifo para U+416`                                                        | vacío  | no              |
| c4         | `LETRA` = `i` (glifo compuesto)            | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: glifo compuesto: no soportado`                                                              | vacío  | no              |
| c5         | sin la woff                                | 1 → 1 | 7 → 0       | 17 → 1           | `favicon: error inesperado: ENOENT: no such file or directory, open '<copia>/…/great-vibes-…woff'`    | vacío  | no              |
| c6 (extra) | `--salida` apunta a un FICHERO             | 1 → 1 | 5 → 0       | 15 → 1           | `favicon: error inesperado: EEXIST: file already exists, mkdir '<copia>/soy-un-fichero'`              | vacío  | n/a             |
| c7 (extra) | sin `_tokens.scss`                         | 1 → 1 | 5 → 0       | 15 → 1           | `favicon: error inesperado: ENOENT: no such file or directory, open '<copia>/…/_tokens.scss'`         | vacío  | no              |
| c8 (nuevo) | en la salida, `favicon.ico` es una CARPETA | 1 → 1 | 6 → 0       | 16 → 1           | `favicon: error inesperado: EISDIR: illegal operation on a directory, open '<copia>/out/favicon.ico'` | vacío  | ver menor 1     |

- El control `c0` (sin sabotaje) da exit 0 y crea las tres salidas, antes y después.
- Los casos c1-c7 dan lo mismo que en el judge de la ronda 2: `a48a296` no toca la ruta de error.
- c8 es nuevo en esta ronda. Fuerza un error de E/S DESPUÉS de la primera escritura: en `out/` queda
  `favicon.svg` escrito, antes y después. No es una regresión (el orden de las escrituras no cambia), pero
  desmiente una frase del comentario de `generar` (menor 1).

- **Equivalencia más allá de la «N»** (`judge-r3/equiv.mjs`). El generador de `origin/main` y el de `HEAD`,
  cargados como módulos sin su bloque de ejecución:
  - las 14 tablas de la woff, iguales;
  - `glifoDe`, en los 65 536 puntos del BMP: **65 536/65 536** iguales; con glifo real (≠ 0), **230**, la cifra
    corregida en la bitácora §10;
  - `rangoDelGlifo`:
    - 330/330 en la fuente real (`indexToLocFormat` = 0);
    - 5000/5000 sobre una loca SINTÉTICA en el formato 0 (uint16) y 5000/5000 en el 1 (uint32);
    - fuera de rango, el mismo resultado en los dos formatos;
  - `contornos` (antes) contra `contornosDelGlifo` (después): **330/330** (213 simples, 6 vacíos y 111
    compuestos que lanzan el mismo mensaje);
  - `pathDe`, **219/219** (lo que toca `a48a296`); `cajaDe`, 213/213;
  - `componerIco`, con la lista vacía, con 16, con 16 + 32 y con 16 + 32 + 48 + 256: bytes idénticos.
  - La rama del `puntoMedio` corre de verdad: la «N» (glifo 33) tiene **63** pares OFF-OFF y **210** glifos
    tienen al menos uno (`judge-r3/dosoff.mjs`), las cifras de la bitácora §10.
- **I-6, la parte que no es la suite.**
  - `pnpm typecheck`: exit 0. `pnpm lint` (`eslint .`): exit 0.
  - `pnpm format:check`: «All matched files use Prettier code style!». Lo mismo con `prettier --check` sobre los
    7 ficheros del diff.
  - `node --check tools/favicon/generar.mjs`: exit 0.
  - La suite completa NO se ha corrido. Ningún test lee `progress/`; el único que nombra `tools/favicon/` es
    `favicon-marca.test.ts` (40/40).
- **I-7 (alcance).** `git diff --name-only origin/main...HEAD` da 7 ficheros:
  - `src/pages/favicon-marca.test.ts` y `tools/favicon/generar.mjs`;
  - cinco de `progress/`: el brief, `current.md`, la bitácora y los judges de las rondas 1 y 2.
  - No aparecen ni `public/`, ni `index.html`, ni `package.json`, ni `feature_list.json`, ni
    `tools/trazo-marca/aplicador.mjs`, ni otro test.
  - La bitácora §6 se confirma: 6 ficheros en `d5ed7af`, y 7 en `3a00169`, `a48a296` y `HEAD`.
- **Mutación.** NO APLICA, declarado en el brief §4: ninguno de los dos ficheros está en el `mutate` de
  `stryker.config.json`.

## Invariantes ↔ evidencia (en lugar de «Cobertura de escenarios»)

No hay `.feature`: es un refactor sin cambio de comportamiento (precedente H-3), y el contrato son I-1..I-7.
Los @s1-@s7 de F-28 siguen cubiertos por las mismas 40 `it`, con nombres idénticos y en verde.

- I-1: [x] los tres md5 y `cmp` = `public/`, en `origin/main` y en los siete commits de código de la rama.
- I-2: [x] stdout idéntico byte a byte a `origin/main` en los ocho; stderr vacío.
- I-3: [x] 40/40 y `vitest list` con diff vacío contra `origin/main`.
- I-4: [x] 27/27 reproducidos desde las tablas de la bitácora; las cuatro regiones obligatorias, en rojo.
- I-5: [x] los cinco casos del brief y tres extra: exit 1, una línea `favicon: …`, 0 `at` y stdout vacío. Sin
  salida creada en todos los casos de validación.
- I-6: [ ] parcial. typecheck, ESLint y Prettier, en verde; la suite completa, pendiente del lead.
- I-7: [x] solo los dos ficheros y `progress/`.

## Lo que pide esta revisión, punto por punto

- **Comportamiento idéntico** (refactor puro, salvo la ruta de error del CLI). [x]
  - Bytes (I-1) y stdout (I-2), idénticos en cada commit de código.
  - Las funciones que cambian, equivalentes en la fuente entera, en el BMP y en la loca sintética en los dos
    formatos.
  - La única conducta nueva es la que pide el brief (menor 4): 0 líneas `at`, una línea `favicon: …` y
    `process.exitCode`. En c8 (E/S tras la primera escritura) la conducta es la de `origin/main`.
  - Ningún hunk reasocia coma flotante: en `pathDe`, `cajaDe`, `bajoElTrazo`, `tramosDe` y `rasterizar` solo
    cambian nombres (y unas llaves en el bucle de canales); `geometria`, `aplanar` y `crucesDeFila` no se tocan.
- **Ningún nombre nuevo miente.** [x] Contrastados con la especificación y con su uso:
  - WOFF: numTables en el 12, cabecera de 44, entrada de 20 y campos 4/8/12.
  - cmap: numTables en el 2, registros desde el 4 de 8 bytes, la subtabla en su byte 4; formato 4 con
    segCountX2 en el 6, endCode en el 14 y reservedPad de 2.
  - `head.indexToLocFormat` en el 50; `FACTOR_DE_LA_LOCA_CORTA` se usa para multiplicar y así se lee
    (`generar.mjs:147`); el comentario de las l. 136-137 lo dice.
  - La cabecera del glifo, de 10 bytes; las seis banderas con su nombre TrueType.
  - ICONDIR 0/2/4 e ICONDIRENTRY 0/1/4/6/8/12.
  - `puntoMedio` (`generar.mjs:270`) ya no comparte palabra con el `medio` del medio trazo (l. 413-416 y
    443-457).
  - En el test: `LARGO_DEL_CAMPO_DE_LARGO` + `LARGO_DEL_TIPO_DE_TROZO`, IHDR 0/4/8/9/12, `PROFUNDIDAD_LEIDA`,
    `POSICION_DEL_ALFA`, los cinco `FILTRO_*`, la cabecera y la entrada ICO y `totalDePixeles`.
  - Los nombres no mienten. Lo que exagera es un COMENTARIO: menor 1.
- **`contornos`, bien partido.** [x]
  - `contornosDelGlifo` (l. 168-181) es un orquestador de 13 líneas sobre un lector explícito, `lectorDe`
    (l. 184-197), sin estado escondido.
  - Las cuatro responsabilidades del brief, cada una en su función:
    - `finalesDeContorno` (l. 200);
    - `banderasDe` (l. 205), con la repetición;
    - `coordenadasDelEje` (l. 220), UNA sola función parametrizada por `EJE_X`/`EJE_Y` (l. 162-163);
    - `agruparEnContornos` (l. 232).
  - Lo confirma la comparación de los 330 glifos.
- **La tabla de sabotajes de I-4, verificable.** [x] Cada fila nombra la constante y su valor antes → después, y
  S18 y S27 llevan ya sus cifras en `a48a296`. Un arnés escrito SOLO a partir de esas filas reproduce 27/27. El
  menor 1 del judge de la ronda 2 queda resuelto.
- **Nada fuera de la lista de I-7.** [x] Son 7 ficheros, todos dentro de lo permitido.
- **Los menores del judge de la ronda 2.** [x] Los cinco, resueltos:
  - 1 (tabla del §2) y 4 (230 glifos reales), corregidos y medidos de nuevo aquí;
  - 2 (`puntoMedio`) y 3 (`FACTOR_DE_LA_LOCA_CORTA`), en `a48a296`, sin un byte distinto;
  - 5 (estado del push), corregido; ver la observación de entorno 1.

## Disciplina TDD

- **¿Producción sin test que la pida?** NO, dentro del contrato.
  - El generador está fuera del perímetro de tests por diseño (FM-6/FS-4): lo verifican sus salidas (I-1, I-2) y
    su ruta de error (I-5).
  - `a48a296` solo renombra (un identificador local y una constante); no añade conducta.
  - El test no gana ni aserciones, ni `it`, ni imports.
- **¿Evidencia de Rojo → Verde → Refactor?** SÍ, en la forma que corresponde a un refactor:
  - el verde se mantiene commit a commit (I-1 e I-2 medidos aquí en los siete commits de código);
  - el «rojo» de los nombres nuevos son los sabotajes (27/27);
  - un commit por paso o por menor, más los de la bitácora.

## Calidad

- **Bien.**
  - El reparto de `contornos` y el lector explícito son lo mejor del cambio: cada función se lee como su
    comentario.
  - La Interfaz (l. 594-608) es la única capa que habla con el usuario, y su comentario lo dice con verdad.
  - La bitácora es verificable: sus cifras (I-2 en bytes, 230 glifos, 63 y 210 pares OFF-OFF, 7 ficheros, 27
    sabotajes) se reproducen con arneses propios.
- **Por mejorar.** Ver «Menores». Ninguno cambia comportamiento ni rompe un invariante.

## Checkpoints

- **C1.**
  - [x] Ficheros base.
  - [x] Docs.
  - [ ] `bin/harness init` completo: typecheck, ESLint y Prettier, en verde; la suite queda para el lead (I-6).
- **C2.**
  - [x] 0 features `in_progress`.
  - [x] F-28 `done`, con su test en 40/40.
  - [x] `progress/current.md` describe esta sesión.
- **C3.**
  - [x] Ningún módulo nuevo en `src/`.
  - [x] Ninguna dependencia nueva.
  - [x] Ni logs de depuración ni TODOs: el `console.log` (l. 602) y el `console.error` (l. 606) son la salida
        del CLI, en la Interfaz.
- **C4.**
  - [x] Sin módulos nuevos.
  - [x] Aislamiento real: lectura de bytes reales; los sabotajes del juez, en copias.
  - [ ] `bin/harness test` completo: pendiente del lead.
- **C5.**
  - [x] Árbol limpio, sin ficheros sin trackear.
  - [ ] `progress/history.md`: la entrada la escribe el lead al cerrar.
  - [x] F-28 sigue `done`; su `cierre` (con la D-1) es cosa del lead.
- **C6.** N/A por diseño: no hay `.feature`, y el contrato es el brief. El mapa @s1-@s7 → 40 `it` de F-28 sigue
  intacto.
- **C7.** N/A, declarado: ninguno de los dos ficheros está en el `mutate`. Lo compensan I-1 (bytes en cada
  commit), I-3, I-4 (27/27) e I-5.

## Cambios requeridos

Ninguno.

## Menores (no bloquean; para el lead o una ronda futura)

1. **`tools/favicon/generar.mjs:559-560`.** El comentario de `generar` dice: «Toda la validación … va ANTES de la
   primera escritura (`mkdirSync`): un error no deja iconos a medias».
   - La primera mitad es cierta. La consecuencia, dicha así, promete más de lo que hace: solo vale para los
     errores de VALIDACIÓN.
   - Medido en c8: si una escritura falla después de la primera (aquí, `favicon.ico` es una carpeta), el CLI
     informa bien (`favicon: error inesperado: EISDIR …`, exit 1, 0 `at`), pero en `out/` queda `favicon.svg`
     escrito. Es decir, iconos a medias.
   - No es una regresión: `origin/main` hace lo mismo, y el brief solo pide conservar la validación antes de
     `mkdirSync`. Pero el comentario es nuevo de esta rama (`f0a60fd`).
   - Propuesta: «un error de validación no deja iconos a medias». No cambia ni un byte.
2. **`tools/favicon/generar.mjs:271`.** La línea mide 107 columnas, por encima del `printWidth` de 100 de
   `.prettierrc.json`.
   - Viene del renombrado `medio` → `puntoMedio` (`a48a296`); antes medía 97.
   - Prettier no la marca porque no puede partir un template literal, así que `format:check` sigue en verde.
   - Hay precedente en `origin/main` (el `<path …>` de `componerSvg`, hoy l. 332, mide 109). Cosmético y
     opcional.

## Observaciones de entorno (no son del código revisado)

1. **El push de la bitácora.** La bitácora («Estado al cerrar», l. 579-583) dice que `d7a3233` y su corrección
   «quedaban sin push al cerrar». Era cierto al escribirla.
   - Desde las 13:13:03, el reflog de `origin/claude/bold-liskov-c3323b` registra un sexto «update by push», a
     `ca36722`, mientras este juez revisaba. La rama local y la remota están igualadas.
   - PR, ninguna: `gh pr list --head claude/bold-liskov-c3323b --state all` da `[]`.
   - Que lo concilie el lead al cerrar.
2. **Worktrees.** `git worktree list` ya no muestra el `verificador-r2/main-wt` que señaló el judge de la ronda 2.
   Quedan el principal, `bold-liskov-c3323b` y `amazing-montalcini-d6abb1`, que es de otra rama y no entra aquí.
