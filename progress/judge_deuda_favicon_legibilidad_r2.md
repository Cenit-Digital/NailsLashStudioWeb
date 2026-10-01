# Review — deuda de legibilidad de F-28 (`favicon_marca`), ronda 2: tras la ronda de corrección 1

**Veredicto:** APPROVED, condicionado a I-6. La suite completa de `bin/harness init` la corre el lead; este juez
NO la ha corrido, por orden expresa del entorno. Si esa corrida sale roja, este veredicto queda anulado.

**Bloqueantes: 0. Menores: 5** (más 2 observaciones de entorno que no son del código).

Alcance: `git diff origin/main...HEAD` (merge-base `06742d3`), rama `claude/bold-liskov-c3323b` en `d5ed7af`.

- Nuevo desde el judge de la ronda 1 (`b7d3567`):
  - `e99f02a`: menores 1, 2 y 4;
  - `6109869`: menor 3;
  - `58dc0e3`: menor 5;
  - `d5ed7af`: bitácora §8-§9 y `progress/current.md`.
- Lo anterior ya lo revisó `progress/judge_deuda_favicon_legibilidad.md`. Aquí se vuelve a medir entero contra
  `HEAD`.
- Contrato:
  - `progress/brief_deuda_favicon_legibilidad.md`: I-1..I-7, alcance y «Fuera de alcance»;
  - `docs/conventions.md`, `docs/tdd.md` y `CHECKPOINTS.md`.
- Bitácora: `progress/tdd_deuda_favicon_legibilidad.md`.

## Comprobaciones propias del juez (2026-10-01, 12:17-12:25, Node v22.15.0)

**Método.** En el repo no se ha escrito nada salvo este informe.

- Todo lo que muta (sabotajes, errores del CLI, módulos de equivalencia) se hizo en copias `git archive` de
  `HEAD`, `origin/main` y `b7d3567`, en `<scratchpad>/legibilidad/judge-r2/`, con `node_modules` enlazado
  (enlaces retirados al terminar).
- Nada de eso se hizo en el worktree. `git status` del worktree: 0 cambios antes y después de cada tanda.

- **I-1 (bytes).**
  - El generador del worktree con `--salida judge-r2/i12/salida` sale con exit 0 y stderr de 0 bytes.
  - Da los tres md5 del brief §1 (`69ffa8c46fbeda00da75d0f40c277ca0`, `907b23175ec72508a80af917023a6b2b` y
    `b82343170913f7ef4a6fabbb2be072fc`), y `cmp` los da idénticos a `public/`.
  - **Tras CADA commit de la ronda 1**: el `generar.mjs` de `b7d3567`, `e99f02a`, `6109869`, `58dc0e3` y
    `d5ed7af`, sacado con `git show` a un árbol con la disposición de `RAIZ`, da los mismos tres md5 en los
    cinco.
  - Sin `--salida` (en la copia de `HEAD`), escribe en `<copia>/public/` con los mismos md5. La interfaz
    `[--salida <dir>]` y su valor por defecto no cambian.
- **I-2 (stdout).**
  - El de `origin/main` y el de `HEAD`, con la misma ruta, son idénticos según `cmp` (354 bytes); stderr, 0
    bytes.
  - En los cinco commits, la línea, quitando solo la ruta final, es la de `origin/main` (`cmp-stdout.mjs`).
  - El resumen sigue saliendo el último, tras las tres escrituras.
- **I-3 (nombres).**
  - `pnpm exec vitest run src/pages/favicon-marca.test.ts` en el worktree: **40/40**.
  - `vitest list`: 40 nombres en el worktree y 40 en la copia de `origin/main`, con el **diff vacío**.
  - Los `it` 18-20 siguen rindiendo «tiene 256 / 1024 / 32400 píxeles».
- **I-4 (sabotajes).** Arnés propio (`judge-r2/i4.mjs`).
  - Escrito a partir de las TABLAS de la bitácora, no del `sabotajes.txt` del craftsman.
  - Exige exactamente una línea cambiada por sabotaje y restaura con comparación de bytes.
  - Resultado: **27/27 coinciden** con la bitácora:
    - S1-S17 y S19-S26, con la tabla del §2 (las rojas y los `it` que caen);
    - S18 (**11/40**: 18-20, 23, 29-32, 36, 38 y 40) y S27 (**9/40**: 18-20, 23, 29-32 y 36), con el §8.
  - El control sin sabotaje da 0/40. S13 cambia el título del `it` 19 («tiene undefined píxeles»), como se
    declara.
  - Las cuatro regiones obligatorias dan rojo: el tipo del trozo (S1-S2), el IHDR (S3-S8), la entrada ICO
    (S9-S12) y el total de píxeles (S13-S14).
- **I-5 (errores del CLI).** Arnés propio (`judge-r2/i5.mjs`):
  - un árbol NUEVO por caso, con `generar.mjs`, `_tokens.scss` y la woff copiados, y el sabotaje en la COPIA;
  - ANTES = `origin/main` y DESPUÉS = `HEAD`;
  - las líneas de stderr se cuentan sin las vacías.

| Caso       | Sabotaje en la copia            | Exit  | Líneas `at` | Líneas de stderr | stderr DESPUÉS (literal; la ruta, abreviada)                                                           | stdout | ¿Salida creada? |
| ---------- | ------------------------------- | ----- | ----------- | ---------------- | ------------------------------------------------------------------------------------------------------ | ------ | --------------- |
| c1         | `--salida` sin directorio       | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: --salida necesita un directorio`                                                             | vacío  | no              |
| c2         | `--accent-soft: rosa;`          | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: --accent-soft: se esperaba UNA declaración #RRGGBB en _tokens.scss (rosa)`                   | vacío  | no              |
| c2b        | `--ink` duplicada               | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: --ink: se esperaba UNA declaración #RRGGBB en _tokens.scss (#8E3355,#8E3355)`                | vacío  | no              |
| c3         | `LETRA = 'Ж'`                   | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: la fuente no tiene glifo para U+416`                                                         | vacío  | no              |
| c4         | `LETRA = 'i'` (glifo compuesto) | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: glifo compuesto: no soportado`                                                               | vacío  | no              |
| c5         | sin la woff                     | 1 → 1 | 7 → 0       | 17 → 1           | `favicon: error inesperado: ENOENT: no such file or directory, open '<copia>/…/great-vibes-…woff'`     | vacío  | no              |
| c6 (extra) | `--salida` apunta a un FICHERO  | 1 → 1 | 5 → 0       | 15 → 1           | `favicon: error inesperado: EEXIST: file already exists, mkdir '<copia>/soy-un-fichero'`               | vacío  | n/a             |
| c7 (extra) | sin `_tokens.scss`              | 1 → 1 | 5 → 0       | 15 → 1           | `favicon: error inesperado: ENOENT: no such file or directory, open '<copia>/src/styles/_tokens.scss'` | vacío  | no              |

- El control `c0` (sin sabotaje) da exit 0 y crea la salida, antes y después.
- **La ronda 1 no toca la ruta de error**: `b7d3567` contra `HEAD` da los 9 casos (c0-c7 y c2b) IGUALES (exit,
  stderr con la ruta normalizada, recuentos, stdout y salida).

- **Equivalencia más allá de la «N»** (`judge-r2/equiv.mjs`). El generador de `origin/main` y el de `HEAD`, cargados
  como módulos sin su bloque de ejecución:
  - las 14 tablas de la woff, iguales;
  - `rangoDelGlifo` (lo que reescribe `6109869`):
    - 330/330 en la fuente real (`indexToLocFormat` = 0);
    - 5000/5000 sobre una loca SINTÉTICA aleatoria en el formato 0 (uint16), y 5000/5000 en el 1 (uint32);
    - fuera de rango, el mismo resultado en los dos formatos;
  - `glifoDe`, en los 65 536 puntos del BMP: **65 536/65 536** iguales;
  - `contornos` (antes) contra `contornosDelGlifo` (después): **330/330** iguales (213 simples, 6 vacíos y 111
    compuestos que lanzan el mismo mensaje);
  - `pathDe` y `cajaDe`, iguales en los 213 simples;
  - `componerIco`, con la lista vacía, con 16 y con 16 + 32 + 48 + 256: bytes idénticos.
- **I-6, la parte que no es la suite.**
  - `pnpm typecheck`: exit 0. `pnpm lint` (`eslint .`): exit 0.
  - `pnpm format:check`: «All matched files use Prettier code style!». Lo mismo con `prettier --check` sobre los
    6 ficheros del diff.
  - `node --check tools/favicon/generar.mjs`: exit 0.
  - La suite completa NO se ha corrido. El riesgo está acotado:
    - ningún test LEE `progress/` (las rutas que aparecen están en comentarios);
    - el único test que nombra `tools/favicon/` es `favicon-marca.test.ts` (40/40), y solo busca ese texto
      dentro del SVG generado.
- **I-7 (alcance).** `git diff --name-only origin/main...HEAD` da 6 ficheros:
  - `src/pages/favicon-marca.test.ts` y `tools/favicon/generar.mjs`;
  - cuatro de `progress/`: el brief, `current.md`, la bitácora y el judge de la ronda 1.
  - No aparecen ni `public/`, ni `index.html`, ni `package.json`, ni `feature_list.json`, ni
    `tools/trazo-marca/aplicador.mjs`.
  - Las cifras de la bitácora §8 se confirman: `git diff --numstat b7d3567 58dc0e3` da el test +5 −3 y
    `generar.mjs` +33 −26; por commit, +18 −17 (`e99f02a`), +17 −11 (`6109869`) y +5 −3 (`58dc0e3`).
- **Mutación.** El `mutate` de `stryker.config.json` tiene 37 entradas: 0 de `tools/`, 0 con `favicon` y 0
  tests. NO APLICA, confirmado.

## Invariantes ↔ evidencia (en lugar de «Cobertura de escenarios»)

No hay `.feature`: es un refactor sin cambio de comportamiento (precedente H-3), y el contrato son I-1..I-7.
Los @s1-@s7 de F-28 siguen cubiertos por las mismas 40 `it`, con nombres idénticos y en verde.

- I-1: [x] los tres md5 y `cmp` = `public/`, tras cada commit de la ronda 1 (medido de nuevo).
- I-2: [x] `cmp`-idéntico a `origin/main`; stderr vacío.
- I-3: [x] 40/40 y `vitest list` con diff vacío contra `origin/main`.
- I-4: [x] 27/27 reproducidos con un arnés propio; las cuatro regiones obligatorias, en rojo.
- I-5: [x] los cinco casos del brief y dos extra: exit 1, una línea `favicon: …`, 0 `at`, stdout vacío y sin
  salida creada. La ronda 1 no cambia nada (9/9 iguales a `b7d3567`).
- I-6: [ ] parcial. typecheck, ESLint y Prettier, en verde; la suite completa, pendiente del lead.
- I-7: [x] solo los dos ficheros y `progress/`.

## Lo que pide esta revisión, punto por punto

- **Comportamiento idéntico** (refactor puro, salvo la ruta de error del CLI). [x]
  - Bytes (I-1) y stdout (I-2), idénticos en cada commit.
  - Las funciones que cambian, equivalentes en todo su dominio práctico: la fuente entera, el BMP y la loca
    sintética en los dos formatos.
  - La única conducta nueva es la que pide el brief (menor 4): 0 líneas `at`, una línea `favicon: …` y
    `process.exitCode`.
  - Ningún hunk reasocia coma flotante: la ronda 1 solo toca aritmética entera (`rangoDelGlifo`) y nombres.
- **Ningún nombre nuevo miente.** [x] Cada nombre, contrastado con su especificación o con su uso:
  - WOFF: numTables en el 12, cabecera de 44, entrada de 20 y campos 4/8/12.
  - cmap: numTables en el 2, registros desde el 4 de 8 bytes, y el desplazamiento de la subtabla en su byte 4.
  - Formato 4: segCountX2 en el 6, endCode en el 14 y reservedPad de 2.
  - `posicionDelSegmento` = `s · 2`; `desplazamientoDelRango` = idRangeOffset.
  - `head.indexToLocFormat` en el 50; la cabecera del glifo, de 10 bytes.
  - Las seis banderas, con su nombre TrueType.
  - ICONDIRENTRY 0/1/4/6/8/12.
  - En el test: `POSICION_DEL_ALFA` = 3 = el índice del alfa en RGBA; `CANALES_RGB` en `aRgba` = las tres
    muestras de color que se copian; IHDR 0/4/8/9/12.
  - En `generar`, `contornos` (l. 565-567) ya no comparte palabra con el índice `glifo`. El comentario de la
    Interfaz (l. 596-599) es CIERTO desde `e99f02a`: `generar` devuelve el resumen (l. 588-592) y solo la
    Interfaz escribe (l. 603 y 607).
  - Dos nombres que no mienten pero se leen peor de lo que podrían: menores 2 y 3.
- **`contornos`, bien partido.** [x]
  - `contornosDelGlifo` (l. 169-182) es un orquestador de 13 líneas sobre un lector explícito, `lectorDe`
    (l. 185-198), que no tiene estado escondido.
  - Las cuatro responsabilidades del brief, cada una en su función:
    - `finalesDeContorno` (l. 201);
    - `banderasDe` (l. 206), con la repetición;
    - `coordenadasDelEje` (l. 221), UNA sola función parametrizada por `EJE_X`/`EJE_Y` (l. 163-164), sin
      duplicar;
    - `agruparEnContornos` (l. 233).
  - Lo confirma la comparación de los 330 glifos.
- **La tabla de sabotajes de I-4, verificable.** [x] Cada fila nombra la constante y su valor antes → después.
  Un arnés escrito SOLO a partir de esas filas reproduce 27/27. Con un pero de redacción: el menor 1.
- **Nada fuera de la lista de I-7.** [x] Son 6 ficheros, todos dentro de lo permitido.

## Disciplina TDD

- **¿Producción sin test que la pida?** NO, dentro del contrato.
  - El generador está fuera del perímetro de tests por diseño (FM-6/FS-4): lo verifican sus salidas.
  - La ronda 1 no añade conducta: solo mueve el `console.log` del resumen de `generar` a la Interfaz, con los
    mismos bytes en el mismo orden (I-2).
  - El test gana un nombre (`POSICION_DEL_ALFA`) y no gana ni aserciones, ni `it`, ni imports: 31 `it`/`it.each`
    y 63 `expect(` en `origin/main` y en `HEAD`. El único `expect` tocado en la rama sigue con el mismo valor.
- **¿Evidencia de Rojo → Verde → Refactor?** SÍ, en la forma que corresponde a un refactor:
  - el verde se mantiene commit a commit (I-1, I-2, I-3 e I-5, tras `e99f02a`, `6109869` y `58dc0e3`;
    medido de nuevo aquí);
  - el «rojo» de los nombres nuevos son los sabotajes: S27 nuevo, y S18 ahora alcanza el alfa;
  - un commit por menor, más el de la bitácora.

## Calidad

- **Bien.**
  - La ronda 1 resuelve los cinco menores de código del judge anterior con el arreglo más limpio de los
    propuestos: `generar` devuelve el resumen en vez de matizar el comentario.
  - Un solo nombre por ancho de entero, compartido por cmap, loca y glyf (l. 65-66, 119-128, 146-148 y
    194-195).
  - `rangoDelGlifo` (l. 143-150) se lee como su comentario: «desde donde empieza él hasta donde empieza el
    siguiente».
  - El menor 6 queda registrado como deuda D-1, con dos salidas concretas (bitácora §9).
- **Por mejorar.** Ver «Menores». Ninguno cambia comportamiento ni rompe un invariante.

## Checkpoints

- **C1.**
  - [x] Ficheros base.
  - [x] Docs.
  - [ ] `bin/harness init` completo: typecheck, ESLint y Prettier, en verde; la suite queda para el lead (I-6).
- **C2.**
  - [x] 0 features `in_progress` (17 `done`, 5 `pending`, 1 `spec_ready` y 4 `blocked`).
  - [x] F-28 `done`, con su test en 40/40.
  - [x] `progress/current.md` describe esta sesión.
- **C3.**
  - [x] Ningún módulo nuevo en `src/`.
  - [x] Ninguna dependencia nueva.
  - [x] Ni logs de depuración ni TODOs: el `console.log` (l. 603) es la salida del CLI, en la Interfaz.
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
- **C7.** N/A, declarado y confirmado: ninguno de los dos ficheros está entre las 37 entradas del `mutate`. Lo
  compensan I-1 (bytes en cada commit), I-3, I-4 (27/27) e I-5.

## Cambios requeridos

Ninguno.

## Menores (no bloquean; para el lead o una ronda futura)

1. **Bitácora, l. 128 (tabla del §2, fila S18).** Dice 5/40 (20, 23, 36, 38 y 40), que era cierto en `884a66c`.
   - En `HEAD` da 11/40: lo dice el §8 (l. 425-427) y este juez lo reproduce.
   - S27 solo aparece en prosa (l. 428-429), sin fila en la tabla.
   - Quien verifique la tabla del §2 contra `HEAD` choca con S18.
   - Propuesta: anotar en la fila S18 «en `HEAD`, 11/40: ver §8» y añadir la fila S27, o dejar una sola tabla
     medida en `HEAD`.
2. **`tools/favicon/generar.mjs:271`.** `medio` (el punto medio de dos OFF, el renombrado `m → medio` de esta
   rama) convive con otro `medio`, el medio trazo (`GROSOR_TRAZO / 2`), en las l. 414-425 y 444-458.
   - Es el mismo tipo de homónimo que el `glifo` del menor 2 de la ronda 1, aunque aquí cada sentido vive en su
     propia función.
   - Propuesta: `puntoMedio` en `pathDe`. No cambia ni un byte.
3. **`tools/favicon/generar.mjs:140` y `:148`.** `DIVISOR_DE_LA_LOCA_CORTA` se usa para MULTIPLICAR
   (`… * DIVISOR_DE_LA_LOCA_CORTA`).
   - No miente: el comentario de las l. 136-137 dice que la loca corta guarda los desplazamientos «divididos
     entre 2».
   - Pero en el sitio de uso se lee al revés. `FACTOR_DE_LA_LOCA_CORTA` (o `ESCALA_…`) se leería directo.
     Opcional.
4. **Bitácora, l. 251 y 394.** «65 536 iguales, 231 de ellos con glifo»: medido, 231 puntos de código se
   resuelven sin error, pero uno de ellos, U+FFFF (el segmento centinela del formato 4), da el glifo 0
   (`.notdef`). Con glifo real son 230. Es precisión de redacción; la equivalencia (65 536/65 536) no cambia.
   El judge de la ronda 1 repitió la cifra.
5. **Bitácora, l. 499 («Estado al cerrar»).** Dice «Sin push y sin PR», pero:
   - `origin/claude/bold-liskov-c3323b` está en `d5ed7af`; el reflog registra pushes a las 11:57, 12:07 y
     12:15;
   - no hay PR (`gh pr list --head claude/bold-liskov-c3323b --state all` sale vacío).

   El «sin push» ya no es cierto. Que lo concilie el lead al cerrar.

**Fuera de alcance, ya declarado** (hallazgo 3 de la bitácora; no cuenta como menor):

- el generador sigue con los literales 4/3 de canales en `rasterizar` (l. 464-470), `sinAlfa` (l. 475) y
  `codificarPng` (l. 503-508);
- el test, en cambio, ya los nombra (`CANALES_RGBA` y `POSICION_DEL_ALFA`);
- no están en la lista del brief. Encajan en la misma ronda que `tools/trazo-marca/aplicador.mjs`.

## Observaciones de entorno (no son del código revisado)

1. **Un worktree de otro verificador.** `git worktree list` muestra uno registrado en
   `<scratchpad>/legibilidad/verificador-r2/main-wt`, con HEAD suelto en `06742d3`, de un verificador paralelo.
   - No está en la rama ni en el diff.
   - Cuando termine, hay que quitarlo con `git worktree remove` (C5).
   - El `verificador-r1/wt-main` de la ronda 1 ya no aparece.
2. **Método.** Los enlaces `node_modules` de las copias del juez se retiran al terminar. Se comprueba que el
   `node_modules` del worktree queda intacto.
