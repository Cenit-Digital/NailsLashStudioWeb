# Brief — deuda de legibilidad de F-28 (`favicon_marca`): menores 1-4 del judge

> Lo escribe el `craftsman_lead` (2026-10-01). Refactor que NO cambia comportamiento: sin entrada nueva en
> `feature_list.json` ni `.feature`. El mismo trato que H-3 y las PR #14 y #15: el contrato son los
> invariantes I-1..I-7 de abajo. F-28 sigue `done`; al terminar, el lead anota en su `cierre` que la deuda
> quedó saldada.
>
> Rama `claude/bold-liskov-c3323b` (worktree), puesta al día con `main` en `2a49c14` (F-28 fusionada).

## 0. Origen

`progress/judge_favicon_marca.md`, §«Menores», puntos 1-4. El 5 (disciplina TDD de las 40 `it`) y los 6-8
no son código y quedan fuera.

## 1. Medidas de partida (las tomó el lead, 2026-10-01, Node v22.15.0)

**Salidas del generador.** `node tools/favicon/generar.mjs --salida <scratchpad>/antes` reproduce `public/`
byte a byte:

| Fichero                | md5 (`public/` en HEAD = salida del generador ANTES) |
| ---------------------- | ---------------------------------------------------- |
| `favicon.svg`          | `69ffa8c46fbeda00da75d0f40c277ca0`                   |
| `favicon.ico`          | `907b23175ec72508a80af917023a6b2b`                   |
| `apple-touch-icon.png` | `b82343170913f7ef4a6fabbb2be072fc`                   |

La salida estándar ANTES fue `favicon: «N» en #8E3355 sobre #F7DDE8, viewBox -213 -1132 1618 1618 →
favicon.svg, favicon.ico (16 + 32) y apple-touch-icon.png (180) en <dir>`.

**El error ANTES.** `node tools/favicon/generar.mjs --salida`, sin directorio:

- sale con `exit=1`;
- imprime la línea fuente con el `^`;
- después `Error: --salida necesita un directorio`;
- y por último 5 líneas `    at …` más `Node.js v22.15.0`.

Esa traza cruda es lo que pide quitar `docs/conventions.md` («la capa de interfaz captura, informa por el
canal de error y sale con código != 0. Nunca propagar stack traces crudos al usuario»).

## 2. Alcance

### A. `src/pages/favicon-marca.test.ts` (menores 1 y 2)

**Obligatorio:**

- Nombre para cada número de formato que señaló el judge, al estilo de los que ya lo tienen
  (`LARGO_DE_LA_CABECERA_DE_TROZO`: constantes en MAYÚSCULAS y en castellano, junto a su sección):
  - `posicion + 4` (dónde empieza el tipo del trozo, ~338): la cabecera del trozo PNG es el largo (4) más el
    tipo (4);
  - los desplazamientos 0/4/8/9/12 del IHDR (~370-374);
  - `cabecera.profundidad !== 8` (~480): la única profundidad que lee el decodificador;
  - `base + 1/8/12` de la entrada ICO (~520-523): ancho 0, alto 1, tamaño 8, desplazamiento 12.
- Menor 2: la clave `pixeles` de `LOS_TRES_RASTER` (~611-615) pasa a otro nombre (p. ej. `totalDePixeles`),
  para que al desestructurar (~643) ya no haga falta renombrarla. Ojo: el título del `it.each` interpola
  `$pixeles`. Se cambia el marcador para que el título RENDERIZADO quede igual.

**Permitido** (mismo tipo de número, en las mismas secciones de decodificación PNG/ICO y de píxeles,
~319-607):

- los 0/2/4 de `cabeceraIco`;
- el 4 de RGBA en `aRgba`, `pixelEn` y `pixeles`;
- los filtros 0-4 de `predictor`.

Todo lo que pase de la lista obligatoria se declara en la bitácora.

**Prohibido:**

- cambiar el título renderizado de un `describe`/`it`;
- cambiar una aserción, un valor esperado o el número de `it`;
- añadir imports: FS-3/FS-5, el test no importa `src/` ni el generador;
- tocar otros ficheros de test.

### B. `tools/favicon/generar.mjs` (menores 3 y 4)

**Menor 3, nombres.** Hay que renombrar las variables de una letra o abreviadas que lista el judge, allí
donde aparezcan: `o`, `p`, `f`, `nc`, `np`, `g`, `ro`, `cs`, `pts` y `q`, más el `d` que es el buffer del
glifo en `contornos`.

- El `d` del trazo SVG (`pathDe`, `componerSvg`, `aplanar`, el principal) es el atributo `d` de SVG,
  vocabulario del dominio, y SE QUEDA.
- Permitidos, por ser del mismo tipo: `off`, `segX2`, `ini`, el `[a, b]` de `contornos`, `s`/`k` de
  `rasterizar`, `m` de `pathDe` y los `t`/`c`/`n`/`k` de la tabla CRC.
- Pueden quedarse los nombres matemáticos de siempre: `t`/`u` de la Bézier, `x`/`y`, `dx`/`dy`, `i` como
  índice de bucle, `cx`/`cy`, `px`/`py`.

**Menor 3, números de formato.** Llevan nombre:

- WOFF: el desplazamiento de `numTables` (12), el largo de la cabecera (44), el de la entrada del directorio
  (20) y sus campos (4/8/12);
- `head`: `indexToLocFormat` en el 50;
- `glyf`: la cabecera de 10 bytes;
- los bits de las banderas 1/2/4/8/16/32 (en castellano, con su nombre de la especificación TrueType citado
  UNA vez en un comentario: ON_CURVE_POINT, X_SHORT_VECTOR, Y_SHORT_VECTOR, REPEAT_FLAG,
  X_IS_SAME_OR_POSITIVE…, Y_IS_SAME_OR_POSITIVE…);
- `cmap` (formato 4 y sus desplazamientos): recomendado;
- ICO: cabecera 6 y entrada 16, con los nombres que ya usa el test (`LARGO_DE_LA_CABECERA_ICO`,
  `LARGO_DE_LA_ENTRADA_ICO`), y los campos de la entrada.

**Menor 3, `contornos` (~110-159) hace cuatro cosas.** Se parte en funciones de un solo motivo:

1. finales de contorno;
2. banderas con repetición;
3. coordenadas de un eje;
4. agrupar en contornos.

Los bucles de x y de y son el mismo algoritmo con otros bits: UNA función parametrizada por el eje, sin
duplicar. El cursor de lectura compartido se pasa de forma explícita (un lector pequeño o un `{ valores,
siguiente }`); lo decides tú, y gana lo más simple.

**Menor 4, errores** (`docs/conventions.md`, «Manejo de errores uniforme»):

- Un tipo de error de dominio (p. ej. `class ErrorDelFavicon extends Error`) para los cuatro `throw`
  (~55, 98, 115, 225).
- El bloque «Principal» pasa a una función (p. ej. `generar(argv)`), y la capa de interfaz, al final del
  fichero, captura:
  - error de dominio → `console.error` con `favicon: <mensaje>`;
  - cualquier otro error (p. ej. falta la woff porque no se hizo `pnpm install`) → tampoco lleva traza, y
    el mensaje dice que es inesperado (p. ej. `favicon: error inesperado: <mensaje>`).
- En los dos casos, `process.exitCode = 1` y NO `process.exit()`, por el precedente de Windows que comenta
  `tools/puerta-anclas.ts:58`.
- Toda la validación (argumentos, glifo, tokens) sigue ANTES de la primera escritura (`mkdirSync`), para
  que un error no deje iconos a medias. Hoy ya es así; se conserva.

**Prohibido:**

- cambiar el VALOR de una constante, el texto de `CABECERA_SVG`, el texto de la línea de resumen de la
  salida estándar, la interfaz (`[--salida <dir>]`) o el orden de las escrituras;
- añadir dependencias o scripts a `package.json`;
- tocar `index.html` o `public/`.
- **No reasociar ni «simplificar» aritmética de coma flotante** (`pathDe`, `cajaDe`, `geometria`, `aplanar`,
  `crucesDeFila`, `bajoElTrazo`, `rasterizar`): un redondeo distinto cambia bytes, y la comparación de md5
  es la ÚNICA red de esta herramienta, que no tiene tests por contrato (FM-6/FS-4).

### Fuera de alcance

- `tools/trazo-marca/aplicador.mjs`, que tiene la misma deuda según el judge;
- el menor 5;
- cualquier otro fichero de `src/`.

## 3. Invariantes (el contrato que verifica el `judge`)

- **I-1.** Las tres salidas de `node tools/favicon/generar.mjs --salida <scratchpad>/despues` tienen los md5
  de §1. Se comprueba tras CADA paso, no solo al final. `public/` no aparece en el diff: nunca se escribe en
  `public/`; se compara contra él.
- **I-2.** La salida estándar del generador es la misma línea que en §1 (solo cambia la ruta).
- **I-3.** `pnpm exec vitest run src/pages/favicon-marca.test.ts` da 40/40. La lista de nombres renderizados
  (`pnpm exec vitest list src/pages/favicon-marca.test.ts`) es IDÉNTICA antes y después (diff vacío).
- **I-4.** Los nombres nuevos del test cargan peso: un sabotaje por región renombrada da rojo. Las regiones
  son el tipo del trozo, el IHDR (profundidad o tipo de color), la entrada ICO y la clave del total de
  píxeles. Se sabotea la CONSTANTE del test con `sed` desde Bash, sobre un estado ya commiteado, y se
  restaura con `git checkout -- <fichero>`. NUNCA se sabotea `public/`.
- **I-5.** Ruta de error del CLI, en un árbol de scratchpad que replique la disposición de `RAIZ`:
  `tools/favicon/generar.mjs`, `src/styles/_tokens.scss` y
  `node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff` copiados. Así los sabotajes
  no tocan el repo. Casos:
  1. `--salida` sin directorio;
  2. un token sin `#RRGGBB` válido (o duplicado);
  3. `LETRA` cambiada en la COPIA a un carácter que la fuente no tiene;
  4. `LETRA` cambiada a un glifo compuesto, si la fuente tiene alguno (búscalo; si no lo hay, se declara como
     no reproducible);
  5. la woff ausente (error inesperado).

  Por caso, se anotan:
  - el código de salida (≠ 0);
  - el stderr literal;
  - el recuento de líneas `   at` (debe ser 0);
  - el stdout (vacío);
  - si se creó el directorio de salida (no).

- **I-6.** `node .harness/harness.mjs init` en verde: typecheck, ESLint, Prettier y la suite completa (la
  línea base de esta sesión la mide el lead).
- **I-7.** El diff toca solo los dos ficheros, más `progress/`, y el `cierre` de F-28 en `feature_list.json`,
  que es cosa del lead.

## 4. Logística

- **Hook `PostToolUse`.** Cada Edit/Write de un fichero no-`.md` dispara la suite completa (~2 min). Agrupa
  cada paso en pocas escrituras. Los sabotajes con `sed` desde Bash no lo disparan.
- **Pasos sugeridos**, cada uno verde y con un commit local en la rama (sin push):
  1. el test (menores 1 y 2);
  2. los nombres y constantes del generador;
  3. el reparto de `contornos`;
  4. los errores.
- `generar.mjs` no lo ve ESLint (solo `*.{ts,tsx}`). Sus puertas son Prettier (`pnpm exec prettier --check`)
  y ejecutarlo. Pasa `prettier --write` a los dos ficheros antes de cada commit.
- **Mutación: NO APLICA, declarado.** Ninguno de los dos ficheros está en el `mutate` de `stryker.config.json`
  (37 entradas, ninguna de `tools/` ni de tests), y el test no importa `src/`, así que no mata mutantes de
  nadie. La compensan I-1 (bytes), I-3 (nombres) e I-4 (sabotajes).
- **Bitácora:** `progress/tdd_deuda_favicon_legibilidad.md`. Por paso: qué se hizo, el md5 y los 40/40.
  Además, la tabla de sabotajes de I-4, la de errores de I-5 y lo que pasó de la lista obligatoria.
