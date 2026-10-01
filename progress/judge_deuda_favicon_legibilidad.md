# Review — deuda de legibilidad de F-28 (`favicon_marca`): menores 1-4 del judge

**Veredicto:** APPROVED (condicionado a I-6: la suite completa de `bin/harness init` la corre el lead; este
juez NO la ha corrido, por orden expresa. Si esa corrida sale roja, este veredicto queda anulado.)

**Bloqueantes: 0. Menores: 6** (más 2 observaciones de entorno que no son del código).

Alcance: `git diff origin/main...HEAD` (merge-base `06742d3`), rama `claude/bold-liskov-c3323b` en `0b7cd62`:
commits `989d7d6` (brief), `7b7351a` (paso 1), `884a66c` (bitácora), `32708c3` (I-4), `591ebab` (paso 2a),
`f401f39` (paso 2b), `f0a60fd` (paso 3) y `0b7cd62` (paso 4); `bff2e96` es la fusión de `main`. Contrato:
`progress/brief_deuda_favicon_legibilidad.md` (I-1..I-7, alcance y «Fuera de alcance»), `docs/conventions.md`,
`docs/tdd.md` y `CHECKPOINTS.md`. Bitácora: `progress/tdd_deuda_favicon_legibilidad.md`.

## Comprobaciones propias del juez (2026-10-01, ~11:50-12:00, Node v22.15.0)

Método: nada escrito en el repo salvo este informe. Todo lo que muta (sabotajes, errores del CLI) se hizo en
copias `git archive` de `HEAD` y de `origin/main` en `<scratchpad>/legibilidad/judge-r1/`, nunca en el
worktree. `git status` del worktree, limpio antes y después de cada tanda.

- **I-1 (bytes).**
  - Generador del worktree con `--salida judge-r1/i1-despues`: exit 0, stderr 0 bytes, los tres md5 del brief
    §1 (`69ffa8c46fbeda00da75d0f40c277ca0`, `907b23175ec72508a80af917023a6b2b`,
    `b82343170913f7ef4a6fabbb2be072fc`); `cmp` idéntico a `public/` de `HEAD` y de `origin/main`.
  - **Tras CADA paso**: el `generar.mjs` de `06742d3`, `591ebab`, `f401f39`, `f0a60fd` y `0b7cd62`, sacado con
    `git show` a un árbol con la disposición de `RAIZ`, da los mismos tres md5 en los cinco.
  - Sin `--salida` (en la copia) escribe en `<copia>/public/` con los mismos md5: la interfaz
    `[--salida <dir>]` y su valor por defecto no cambian.
- **I-2 (stdout).** El de `origin/main` y el de `HEAD`, con la misma ruta, son `cmp`-idénticos (354 bytes). En
  los cinco commits de paso, con la ruta normalizada, es la misma línea.
- **I-3 (nombres).**
  - `pnpm exec vitest run src/pages/favicon-marca.test.ts` en el worktree: **40/40**.
  - `vitest list` en la copia de `origin/main` y en la de `HEAD`: 40 y 40 nombres, **diff vacío**. Coincide
    también con la lista de `989d7d6` de la bitácora (el test, el generador y `public/` no cambian entre
    `989d7d6` y `origin/main`). Los `it` 18-20 siguen rindiendo «tiene 256 / 1024 / 32400 píxeles».
- **I-4 (sabotajes).** Los 26 de la tabla, re-ejecutados en la copia de `HEAD` (exactamente una línea cambiada
  cada vez y restaurada con `cmp`): **26/26 coinciden** con la tabla, en el número de rojas y en los `it` que
  caen. S13 da 1/40 (el `it` 19, con título «tiene undefined píxeles»). S21-S26 en verde, como se declara. La
  tabla es verificable: cada fila nombra la constante y su valor antes → después, sin ambigüedad.
- **I-5 (errores del CLI).** Arnés propio (`judge-r1/i5.mjs`): un árbol nuevo por caso, con `generar.mjs`,
  `_tokens.scss` y la woff copiados y el sabotaje en la COPIA. ANTES = `origin/main`, DESPUÉS = `HEAD`:

| Caso       | Sabotaje en la copia            | Exit  | Líneas `at` | Líneas de stderr | stderr DESPUÉS (literal; la ruta, abreviada)                                                       | stdout | ¿Salida creada? |
| ---------- | ------------------------------- | ----- | ----------- | ---------------- | -------------------------------------------------------------------------------------------------- | ------ | --------------- |
| c1         | `--salida` sin directorio       | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: --salida necesita un directorio`                                                         | vacío  | no              |
| c2         | `--accent-soft: rosa;`          | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: --accent-soft: se esperaba UNA declaración #RRGGBB en _tokens.scss (rosa)`               | vacío  | no              |
| c2b        | `--ink` duplicada               | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: --ink: se esperaba UNA declaración #RRGGBB en _tokens.scss (#8E3355,#8E3355)`            | vacío  | no              |
| c3         | `LETRA = 'Ж'`                   | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: la fuente no tiene glifo para U+416`                                                     | vacío  | no              |
| c4         | `LETRA = 'i'` (glifo compuesto) | 1 → 1 | 5 → 0       | 10 → 1           | `favicon: glifo compuesto: no soportado`                                                           | vacío  | no              |
| c5         | sin la woff                     | 1 → 1 | 7 → 0       | 17 → 1           | `favicon: error inesperado: ENOENT: no such file or directory, open '<copia>/…/great-vibes-…woff'` | vacío  | no              |
| c6 (extra) | `--salida` apunta a un FICHERO  | 1 → 1 | 5 → 0       | 15 → 1           | `favicon: error inesperado: EEXIST: file already exists, mkdir '<copia>/soy-un-fichero'`           | vacío  | no              |

Control `c0` (sin sabotaje): exit 0 y los tres md5 del brief, antes y después. Las líneas de stderr se cuentan
sin las vacías.

- **Equivalencia más allá de la «N».** Los dos generadores, cargados como módulos sin su bloque de ejecución:
  - las 14 tablas de la woff, iguales;
  - `contornos` (antes) contra `contornosDelGlifo` (después) en los **330** glifos: 330 iguales (213 simples, 6
    vacíos y 111 compuestos que lanzan el mismo mensaje);
  - `pathDe` y `cajaDe`, iguales en los 213 simples;
  - `glifoDe` en los 65 536 puntos del BMP: 65 536 iguales (231 con glifo);
  - `componerIco` con lados 16/32/48/256 y con la lista vacía: bytes idénticos (ejercita el
    `% MEDIDA_CERO_DEL_ICO` con 256).
- **I-6, la parte que no es la suite.** `pnpm typecheck` exit 0, `pnpm lint` (`eslint .`) exit 0,
  `pnpm format:check` («All matched files use Prettier code style!») y `node --check tools/favicon/generar.mjs`
  exit 0. La suite completa NO se ha corrido (orden expresa). Riesgo acotado: ningún otro test lee
  `tools/favicon/` ni `progress/` (grep), y el único test tocado es el que da 40/40.
- **I-7 (alcance).** `git diff --name-only origin/main...HEAD` = 5 ficheros: los dos de código y tres de
  `progress/`. Ni `public/`, ni `index.html`, ni `package.json`, ni `feature_list.json`, ni
  `tools/trazo-marca/aplicador.mjs`.
- **Mutación.** El `mutate` de `stryker.config.json` tiene 37 entradas: 0 de `tools/`, 0 con `favicon` y 0 tests.
  NO APLICA, confirmado.

## Invariantes ↔ evidencia (en lugar de «Cobertura de escenarios»)

No hay `.feature`: es un refactor sin cambio de comportamiento (precedente H-3) y el contrato son I-1..I-7. Los
@s1-@s7 de F-28 siguen cubiertos por las mismas 40 `it`, con nombres idénticos y en verde.

- I-1: [x] los tres md5 y `cmp` = `public/`, tras cada paso (re-medido por el juez en los cinco commits).
- I-2: [x] la misma línea; stderr vacío.
- I-3: [x] 40/40 y `vitest list` con diff vacío contra `origin/main`.
- I-4: [x] 26/26 reproducidos; las cuatro regiones obligatorias, en rojo (S1-S14).
- I-5: [x] los cinco casos del brief y dos extra: exit 1, una línea `favicon: …`, 0 `at`, stdout vacío y sin
  salida creada.
- I-6: [ ] parcial: typecheck, ESLint y Prettier en verde; la suite completa, pendiente del lead.
- I-7: [x] solo los dos ficheros y `progress/`.

## Lista del brief, punto por punto

**A. `src/pages/favicon-marca.test.ts`**

- [x] `posicion + 4` → `LARGO_DEL_CAMPO_DE_LARGO` (l. 323-325 y 343); la cabecera del trozo pasa a ser la
      suma, que sigue valiendo 8.
- [x] IHDR 0/4/8/9/12 → `POSICION_EN_EL_IHDR` (l. 376-391), tipada `Record<keyof Cabecera, number>`: si falta
      un campo, no compila.
- [x] `!== 8` → `PROFUNDIDAD_LEIDA` (l. 411 y 507).
- [x] La entrada ICO → `POSICION_EN_LA_ENTRADA_ICO` (l. 546-551 y 566-569).
- [x] Menor 2: `totalDePixeles` (l. 657-661), el marcador `$totalDePixeles` (l. 688) y la desestructuración sin
      renombrar (l. 689).
- [x] Lo «Permitido», declarado en la bitácora §1: `POSICION_EN_LA_CABECERA_ICO` con `interface CabeceraIco`
      (l. 527-559), `CANALES_RGB`/`CANALES_RGBA` (l. 403-408, 479-488, 604 y 615) y los `FILTRO_*` (l. 426-445).
- [x] Nada de lo «Prohibido»: títulos idénticos (I-3); ninguna aserción ni valor esperado cambia (el único
      `expect` tocado pasa de `toHaveLength(esperados)` a `toHaveLength(totalDePixeles)`, el mismo valor); sin
      imports nuevos (siguen `node:fs`, `node:path`, `node:zlib` y `vitest`); ningún otro test tocado.

**B. `tools/favicon/generar.mjs`**

- [x] Nombres obligatorios: buscando `o`, `p`, `f`, `nc`, `np`, `g`, `ro`, `cs`, `pts`, `q` y `d` como
      declaración o parámetro, solo queda `const d = pathDe(glifo)` (l. 560): el `d` de SVG que el brief manda
      conservar.
- [x] Números de formato: WOFF (l. 64-71), cmap (l. 88-100), `head` (l. 132-135), glyf y las seis banderas,
      con su nombre TrueType citado una vez (l. 145-158), e ICO con los nombres del test (l. 516-530). Comprobados
      contra las especificaciones (WOFF 12/44/20 y 4/8/12; cmap 2, 4 + 8·i y +4, formato 4 con segCountX2 en 6 y
      endCode en 14; `indexToLocFormat` en 50; cabecera de glifo de 10; banderas 1/2/4/8/16/32; ICONDIRENTRY
      0/1/4/6/8/12): ninguno miente.
- [x] `contornos` partido (l. 160-239): un orquestador de 12 líneas (l. 164-175) sobre `lectorDe` (l. 179-192) y
      las cuatro responsabilidades del brief en `finalesDeContorno` (l. 195), `banderasDe` (l. 200),
      `coordenadasDelEje` (l. 215, UNA función parametrizada por `EJE_X`/`EJE_Y`, l. 157-158) y
      `agruparEnContornos` (l. 227). Las dos reescrituras no literales son equivalentes: la bandera ON con
      `BANDERA_EN_LA_CURVA` y `!== 0` en lugar de `=== 1`, y `finales.at(-1)` en lugar de `finales[nc - 1]`, también
      con 0 contornos (`undefined + 1` da `NaN` en los dos casos). La comparación de los 330 glifos lo confirma.
- [x] Errores:
  - `ErrorDelFavicon` (l. 52) en los cuatro `throw` (l. 59, 129, 168 y 305), con el mismo texto;
  - `generar(argv)` (l. 556-587), con toda la validación antes de `mkdirSync` (l. 567);
  - la Interfaz (l. 589-602), con `process.exitCode` y sin `process.exit()`. El precedente que cita
    (`tools/puerta-anclas.ts:58`) existe y dice lo mismo.
- [x] Nada de lo «Prohibido»:
  - ningún valor de constante cambia;
  - `CABECERA_SVG` y la línea de resumen siguen igual, y el orden de escritura sigue siendo svg → ico → png;
  - ni dependencias, ni `public/`, ni `index.html`;
  - la coma flotante no se reasocia: los hunks de `pathDe`, `cajaDe`, `bajoElTrazo` y `rasterizar` solo
    renombran.
- [x] «Fuera de alcance», respetado: `aplicador.mjs` y el resto de `src/` siguen intactos.

## Disciplina TDD

- **¿Producción sin test que la pida?** NO, dentro del contrato.
  - El generador queda fuera del perímetro de tests por diseño (FM-6/FS-4): lo verifican sus salidas.
  - La única conducta nueva es la ruta de error del CLI (l. 52 y 589-602). La PIDE el brief (menor 4), y su
    prueba es I-5: ANTES, 5-7 líneas `at`; DESPUÉS, 0. Lo midieron la bitácora y este juez.
  - El test no gana producción: solo nombra lo que ya había.
- **¿Evidencia de Rojo → Verde → Refactor?** SÍ, en la forma que corresponde a un refactor:
  - el verde se mantiene paso a paso: I-1, I-2 e I-3 tras los pasos 1, 2a, 2b y 3, re-medidos aquí;
  - el «rojo» de los nombres nuevos son los sabotajes de I-4 (26, reproducidos);
  - el rojo de la ruta de error es la traza cruda de ANTES;
  - un commit por paso.

## Calidad

- **Bien.**
  - El reparto de `contornos` está limpio: funciones de un solo motivo y un lector explícito, sin estado
    compartido escondido. El orquestador se lee en el orden en que el glyf guarda los datos.
  - Las constantes van junto a su sección, con el campo de la especificación citado una vez.
  - Las tablas de posición del test van tipadas con `keyof` de su interfaz.
  - El contrato de errores cumple `docs/conventions.md`: un tipo de error de dominio, captura en la interfaz,
    stderr, código ≠ 0 y sin traza.
- **Por mejorar.** Ver «Menores». Ninguno cambia comportamiento ni rompe un invariante.

## Checkpoints

- **C1.**
  - [x] Ficheros base.
  - [x] Docs.
  - [ ] `bin/harness init` completo: typecheck, ESLint y Prettier en verde (medido aquí); la suite queda para
        el lead (I-6).
- **C2.**
  - [x] 0 features `in_progress` (17 `done`).
  - [x] F-28 `done`, con su test en 40/40. El @s8 de `home-horneado.test.ts` no se toca.
  - [x] `progress/current.md` describe esta sesión.
- **C3.**
  - [x] Ningún módulo nuevo en `src/`.
  - [x] Ninguna dependencia nueva.
  - [x] Ni logs de depuración ni TODOs: el `console.log` de `generar` (l. 582) es la salida del CLI.
- **C4.**
  - [x] Sin módulos nuevos.
  - [x] Aislamiento real: lectura de bytes reales; los sabotajes del juez, en copias.
  - [ ] `bin/harness test` completo: pendiente del lead.
- **C5.**
  - [x] Árbol limpio, sin ficheros sin trackear.
  - [ ] `progress/history.md`: la entrada la escribe el lead al cerrar.
  - [x] F-28 sigue `done`; su `cierre` es cosa del lead.
- **C6.** N/A por diseño: no hay `.feature` y el contrato es el brief. El mapa @s1-@s7 → 40 `it` de F-28 sigue
  intacto.
- **C7.** N/A, declarado y confirmado: ninguno de los dos ficheros está entre las 37 entradas del `mutate`. Lo
  compensan I-1 (bytes en cada paso), I-3, I-4 (26/26) e I-5.

## Cambios requeridos

Ninguno.

## Menores (no bloquean; para el lead o una ronda futura)

1. **`tools/favicon/generar.mjs:590`.** El comentario de la Interfaz dice «La única capa que habla con quien
   ejecuta el CLI», pero `generar` escribe la línea de resumen por stdout (l. 582-586). La bitácora §5 repite la
   frase. Hay dos arreglos:
   - precisar el comentario («la única que informa de los errores»);
   - o que `generar` devuelva el resumen y lo imprima la Interfaz. Salen los mismos bytes en el mismo orden, así
     que I-2 se mantiene.
2. **`tools/favicon/generar.mjs:559-561`.** `glifo` tiene ahora dos sentidos:
   - el renombrado `g → glifo` lo hace el ÍNDICE de glifo en `glifoDe` (l. 123), `rangoDelGlifo` (l. 137) y
     `contornosDelGlifo` (l. 163);
   - en `generar`, `glifo` es la lista de contornos, y la l. 559
     (`const glifo = contornosDelGlifo(tablas, glifoDe(…))`) usa la palabra con los dos sentidos.

   Propuesta: `const contornos = …`, y luego `pathDe(contornos)` y `cajaDe(contornos)`.

3. **`tools/favicon/generar.mjs:100` y `:148`.** El mismo hecho (un entero de 16 bits ocupa 2 bytes) tiene dos
   nombres: `BYTES_POR_VALOR` (cmap) y `BYTES_POR_ENTERO_16` (glyf). Además, `rangoDelGlifo` (l. 141-142)
   sigue con los literales `* 4` y `* 2` para los mismos anchos (el hallazgo 3 de la bitácora). Una constante
   por ancho, compartida por cmap, loca y glyf, quitaría la duplicación.
4. **`tools/favicon/generar.mjs:116`.** `desplazamiento` (dónde está el segmento `s` dentro de cada array)
   convive con `desplazamientoDelRango` (l. 121, el idRangeOffset), y los dos entran en la misma suma (l. 124).
   `posicionDelSegmento` lo haría evidente.
5. **`src/pages/favicon-marca.test.ts:487-488`.** El literal `3` sigue dos veces (las tres muestras RGB que se
   copian y el índice del alfa), al lado del `CANALES_RGB` recién creado. Está fuera de la lista del brief, pero
   desentona, y S18 (sabotear `CANALES_RGB`) no lo alcanza.
6. **`src/pages/favicon-marca.test.ts:438-445`.** Ningún fixture ejecuta las ramas 1-4 de `predictor`: los tres
   PNG usan el filtro 0 en todas sus filas (este juez lo confirma con S21-S24 en verde). Así,
   `FILTRO_IZQUIERDA`…`FILTRO_PAETH` no tienen peso en ningún test. Viene de F-28 y no es una regresión, pero
   conviene registrarlo como deuda del decodificador de prueba (el hallazgo 1 de la bitácora).

## Observaciones de entorno (no son del código revisado)

1. **Un worktree huérfano.** `git worktree list` muestra uno registrado en
   `<scratchpad>/legibilidad/verificador-r1/wt-main` (HEAD suelto en `06742d3`), de un verificador paralelo. No
   está en la rama ni en el diff. Cuando ese verificador termine, hay que quitarlo con `git worktree remove`
   para que no quede registrado (C5).
2. **Aviso de método.** `pnpm exec` en una copia `git archive` con `node_modules` enlazado dispara la
   comprobación de dependencias de pnpm, que intenta reinstalar.
   - Aquí abortó (`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`) sin daño: el `node_modules` del worktree está
     intacto, comprobado.
   - En copias se usa `node node_modules/vitest/vitest.mjs`.
   - Los enlaces de este juez ya están retirados.
