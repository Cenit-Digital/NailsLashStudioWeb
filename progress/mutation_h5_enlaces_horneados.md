# Mutación — F-04 ENMIENDA 5 (H-5): `src/lib/puerta-cascaron.ts`, re-mutado ENTERO

> `mutation_tester`, 2026-10-01. Worktree `.claude/worktrees/amazing-montalcini-d6abb1`, rama
> `claude/amazing-montalcini-d6abb1`, HEAD `c3f988f` (`git status` limpio antes y después de medir).
> StrykerJS 9.6.1 con `@stryker-mutator/vitest-runner`; `stryker.config.json`, `vitest.stryker.config.ts`,
> `vitest.config.ts` y `harness.config.json` sin cambios respecto de `origin/main`. Acotado SOLO con `--mutate`;
> `--testFiles` no se ha usado. No he editado código, tests ni configuración.
>
> Contrato de la medición: `project-spec.md` §Feature 4 → «Enmienda 5…» → «Mutación (D10)»;
> `features/cascaron_semantico.feature`, banner de la ENMIENDA 5 («MUTABLE: … se re-muta ENTERO al 100 % y con 0
> exclusiones»); mapa de mutantes previstos y equivalentes medidos en `progress/gherkin_h5_enlaces_horneados.md` §2;
> bitácora `progress/tdd_h5_enlaces_horneados.md`.
>
> Umbral: `harness.config.json` → `mutation.threshold` = 1.0; `stryker.config.json` → `thresholds.break` = 100.
>
> Precondición: no hay un `progress/judge_h5_*.md` en HEAD `c3f988f`, y `progress/current.md:161` tiene el
> `judge` como «pendiente del lead». La medición la encargó el lead. Este PASS no sustituye al `judge`.

**Veredicto:** PASS
**Score:** killed/total = 625/625 = 100 % (umbral: 100 %). Medido a `--concurrency 1`: 0 timeouts,
0 supervivientes, 0 sin cobertura y 0 errores.

## Mutantes sobrevivientes

Ninguno, en las dos corridas.

**Exclusiones: 0.** Ni `src/lib/puerta-cascaron.ts` ni `src/lib/puerta-cascaron.test.ts` contienen
`Stryker disable` (lo he comprobado con grep). La configuración de Stryker no cambia en la rama. No ha aparecido
ningún equivalente, así que no he excluido ninguno.

## Mediciones

| #   | Comando                                                                                                            | Concurrencia     | Mutantes | Muertos | Timeouts | Supervivientes | Sin cobertura | Errores | Tests dry run | Tests/mutante | Tiempo     |
| --- | ------------------------------------------------------------------------------------------------------------------ | ---------------- | -------: | ------: | -------: | -------------: | ------------: | ------: | ------------: | ------------: | ---------- |
| 1   | `node tools/mutate.mjs src/lib/puerta-cascaron.ts` (= `pnpm exec stryker run --mutate src/lib/puerta-cascaron.ts`) | por defecto (23) |      625 |     621 |    **4** |              0 |             0 |       0 |           530 |         24,45 | 1 min 56 s |
| 2   | `pnpm exec stryker run --mutate src/lib/puerta-cascaron.ts --concurrency 1`                                        | **1**            |      625 | **625** |    **0** |          **0** |             0 |       0 |           530 |         24,45 | 14 min 9 s |

- **Medición 1.** Stryker da 100,00 % porque cuenta los timeouts como detectados. No sirve como veredicto: un
  informe con timeouts no se puede leer como final. Por eso, siguiendo el encargo, repetí la medición a
  `--concurrency 1`.
- **Medición 2. Es la que vale.** 625/625 muertos. La media de tests por mutante es igual en las dos corridas
  (24,45), así que no hay el desplome por contención que se vio en F-05 (`progress/mutation_cero_terceros.md`).
- **Dry run (en las dos corridas).** 530 tests en 6 ficheros: `src/lib/puerta-cascaron.test.ts` (338),
  `src/lib/seo.test.ts` (43), `src/lib/puerta-anclas.test.ts` (39), `src/components/hero.test.tsx` (59),
  `src/components/logo-acoplado.test.tsx` (49) y `src/pages/home.test.tsx` (2). Ningún `*-horneado.test.*`:
  `vitest.stryker.config.ts` deja fuera el extremo a extremo de D9 (@s61, @s62, @s67, @s70-@s72), como manda la
  spec.
- **Los tests unitarios matan SOLOS el 100 %.** En la medición 2, el primer test que cae (`killedBy`) es de
  `src/lib/puerta-cascaron.test.ts` en los **625** mutantes. Ninguno lo mata otro fichero.
- **141 mutantes estáticos (23 %)**, de constantes de módulo como las regex y los textos de las reglas. Stryker
  corre con ellos toda la suite que los cubre, y han muerto todos.
- **Entorno.** Antes de la medición 1 había un `node .harness/harness.mjs init` ajeno, corriendo `vitest run` en el
  `node_modules` de la raíz del repo, no en este worktree. Esperé a que terminara (unos 110 s) antes de lanzar
  nada. Durante las dos mediciones no había ningún otro proceso de `stryker`, `vitest` ni `harness` (comprobado con
  `Get-CimInstance Win32_Process`). Nunca hubo dos Stryker a la vez.

## Los 4 timeouts de la medición 1: contención, no un bucle infinito

| Id  | Línea                                | Mutador            | Sustitución                                    | Medición 2 (`--concurrency 1`): lo mata                                                                                                                                         |
| --- | ------------------------------------ | ------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 80  | `src/lib/puerta-cascaron.ts:133-139` | `MethodExpression` | se quita el `.filter` que descarta el id vacío | «los huecos del recorrido y de las guardas › un id="" en un heading NO identifica a nadie: se descarta» (falla con «expected [ '' ] to deeply equal []»; 117 tests completados) |
| 81  | `src/lib/puerta-cascaron.ts:133`     | `ArrayDeclaration` | `[...html.matchAll(HEADING_CON_ID)]` → `[]`    | @s12 «una página completa y correcta no produce ninguna violación» (1 test)                                                                                                     |
| 82  | `src/lib/puerta-cascaron.ts:134`     | `ArrowFunction`    | `(heading) => heading[1]` → `() => undefined`  | @s12, el mismo (1 test)                                                                                                                                                         |
| 83  | `src/lib/puerta-cascaron.ts:139`     | `ArrowFunction`    | el predicado del `.filter` → `() => undefined` | @s12, el mismo (1 test)                                                                                                                                                         |

- **Están en código antiguo, no en H-5.** Los cuatro son de `idsDeHeadings` (F-04 @s18). Es la misma función que
  dio «4 timeouts del mismo tipo» en la re-medición de la subruta (`progress/mutation_subruta_github_pages.md:224`).
  No tocan ninguna línea de la ENMIENDA 5.
- **No pueden ser un bucle infinito.** `idsDeHeadings` es un solo `matchAll`, con una regex fija, sobre una cadena
  finita, más un `map` y un `filter`. No hay `while` ni recursión. Ninguna de las cuatro sustituciones puede colgar
  la ejecución.
- **La prueba [V], medición 1:** en la MISMA corrida murieron dos mutantes con el mismo efecto que dos de los
  timeouts:
  - el 84 (el predicado del `.filter` → `true`) deja los ids igual que el 80, y murió tras 110 tests;
  - el 85 (el predicado → `false`) deja el conjunto vacío como el 81, y murió tras 2 tests.

  Además, en la medición 2 los cuatro mueren en 1 o en 117 tests.

- **Por qué solo esos cuatro [I].** Son los únicos 4 mutantes del fichero (más el 79, que murió) cuya cobertura
  junta CUATRO ficheros de test. Dos de ellos son de jsdom y React: `hero.test.tsx` (@s11) y
  `logo-acoplado.test.tsx` (@s23, que hace un `renderToString(<Home />)` al recoger el fichero). El tiempo de
  carga de esos dos no entra en el tiempo neto por test con el que Stryker calcula el límite (factor 1,5 sobre el
  tiempo neto, más 5000 ms). Con 23 procesos a la vez y `fileParallelism: true`, cargarlos se pasa del límite. Con
  un solo proceso, el `@s12` de `puerta-cascaron.test.ts` cae primero y el mutante muere enseguida.

## Las líneas de H-5: 146 mutantes, 146 muertos

«Líneas tocadas» son los tramos de `git diff -U0 origin/main...HEAD -- src/lib/puerta-cascaron.ts`: 547-552,
557-564, 580-732, 913-923, 934-939, 968-972, 982-984, 989, 995-997, 1010-1033, 1036-1039, 1056-1071 y 1103-1107.
Entran también las salidas de una línea que ya existían y que el refactor C21 juntó en `fallaCerradaCon`. El
fichero completo pasa de 497 mutantes (subruta, 2026-07-25) a 625.

| Función o constante (línea)                                           | Mutantes | Mutadores                                                                                                                                                                                                   | Estado     |
| --------------------------------------------------------------------- | -------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `extraerEnlaces` / `hrefsDe` / `extraerLinks` (546-563)               |        5 | BlockStatement 3, MethodExpression 1, ArrayDeclaration 1                                                                                                                                                    | 5 muertos  |
| textos `REGLA_LINK_*` (580-587)                                       |        5 | StringLiteral 5                                                                                                                                                                                             | 5 muertos  |
| `limpiar` y sus dos regex (595-600)                                   |       10 | Regex 7, StringLiteral 2, BlockStatement 1                                                                                                                                                                  | 10 muertos |
| `BARRA_INVERTIDA`, `PREFIJO_SIN_BASE`, `ENTRADA_DE_LA_RAIZ` (602-612) |        3 | StringLiteral 3                                                                                                                                                                                             | 3 muertos  |
| `esCandidato` (618-620)                                               |        5 | ConditionalExpression 2, LogicalOperator 1, MethodExpression 1, BlockStatement 1                                                                                                                            | 5 muertos  |
| `NO_INTERPRETABLE` (623)                                              |        1 | Regex 1 (clase negada)                                                                                                                                                                                      | 1 muerto   |
| `tieneSegmentosQueNoInterpreta` (630-634)                             |       17 | ConditionalExpression 6, StringLiteral 4, LogicalOperator 2, EqualityOperator 2, y 3 más                                                                                                                    | 17 muertos |
| `esOculta` (641-643)                                                  |        6 | MethodExpression 2, StringLiteral 2, ArrowFunction 1, BlockStatement 1                                                                                                                                      | 6 muertos  |
| `esBaseUtilizable` (650-652)                                          |        6 | ConditionalExpression 2, LogicalOperator 1, MethodExpression 1, StringLiteral 1, BlockStatement 1                                                                                                           | 6 muertos  |
| `reglaDelLink` (661-699)                                              |       30 | ConditionalExpression 14, BlockStatement 7, EqualityOperator 3, y 6 más                                                                                                                                     | 30 muertos |
| `candidatosDe` (712-718)                                              |        6 | ArrowFunction 3, MethodExpression 1, ObjectLiteral 1, BlockStatement 1                                                                                                                                      | 6 muertos  |
| `violacionesDeLinks` (721-731)                                        |        8 | ArrayDeclaration 2, ConditionalExpression 2, BlockStatement 2, EqualityOperator 1, ObjectLiteral 1                                                                                                          | 8 muertos  |
| `fallaCerradaCon` y `ejecutarPuertaDelCascaron` (969-986)             |        6 | BlockStatement 3, ObjectLiteral 1, ArrayDeclaration 1, StringLiteral 1                                                                                                                                      | 6 muertos  |
| `inspeccionarArtefacto`: forma E, los dos cortes y la guarda nueva    |       37 | ConditionalExpression 11, BlockStatement 7, EqualityOperator 6, StringLiteral 5, y 8 más                                                                                                                    | 37 muertos |
| `REGLAS_DEL_CASCARON` (1082)                                          |        1 | ArrayDeclaration 1                                                                                                                                                                                          | 1 muerto   |
| **Total**                                                             |  **146** | ConditionalExpression 37, BlockStatement 28, StringLiteral 25, EqualityOperator 12, MethodExpression 10, Regex 8, ArrayDeclaration 7, ArrowFunction 7, LogicalOperator 6, ObjectLiteral 3, BooleanLiteral 3 | **146**    |

En 112 de los 146, el primer test que cae es de un escenario de H-5 (@s46-@s60, @s65, @s66, @s68 o @s69). Los
otros 34 caen antes en tests más antiguos del MISMO fichero unitario (@s12, @s23, @s26-@s29, @s34). Son casi todos
los `{}` de funciones, las salidas de una línea que se juntaron en `fallaCerradaCon` y la guarda de @s28, que va
delante de la nueva. Stryker solo apunta el PRIMER test que falla, así que esto no significa que H-5 no los mate.
Lo que exige D10 («los unitarios, SOLOS») se cumple de todas formas: en los 625 mutantes, el test que mata es de
`src/lib/puerta-cascaron.test.ts`.

## Contraste con lo previsto (`progress/gherkin_h5_enlaces_horneados.md` §2 y spec D10)

Los ids son de la medición 2. Todos están **muertos**.

- **Limpieza** (`ESPACIOS_ASCII_EN_LOS_EXTREMOS` en :595 y `TABULADOR_O_SALTO_DE_LINEA` en :596). Los 6 mutantes
  de nivel 1 del recorte mueren:
  - `^` quitado (399), `$` quitado (402) y el `+` quitado al principio (400) o al final (403): los mata @s52;
  - cada una de las dos clases negadas (401 y 404): las mata @s46.

  Lo que se quita dentro (TAB, LF, CR) genera un ÚNICO mutante, la clase negada (405, @s46). Va sin `+`, así que no
  hay equivalente. Las dos cadenas vacías de los `replace`, cambiadas a «Stryker was here!» (407 y 408), mueren en
  @s47 y @s52.

- **`//` no es root-absoluto** (`RUTA_INTERNA`, :574, código compartido con la anti-404). `^` quitado (391) y el
  lookahead negativo cambiado a positivo (392) mueren; caen primero en @s23 y @s24.
- **Candidato con barra invertida inicial (S-7).**
  - `startsWith` → `endsWith` (416): @s50.
  - `||` → `&&` (415): @s46.
  - `BARRA_INVERTIDA` → cadena vacía (409): @s26.
- **Regla 4 (`%`, `&`, barra invertida).** De `NO_INTERPRETABLE` Stryker 9.6.1 solo genera la clase negada (417,
  @s46). No genera «quitar un carácter de la clase». Ese hueco lo cubren las filas de @s50, una por carácter, por
  contrato; Stryker no lo mide. Lo dejo dicho para el `judge`, sin que afecte al veredicto: no hay ningún mutante
  vivo.
- **Segmentos (S-11), `tieneSegmentosQueNoInterpreta`: los 17 mueren.**
  - `.some` → `.every` (423) y los dos `||` → `&&` (421 y 428): @s48.
  - `===` → `!==` (430 y 433) y los cuatro literales de doble barra, barra, punto y dos puntos cambiados a cadena
    vacía (422, 424, 431 y 434): @s46.
- **Regla 5, `esOculta`: los 6 mueren.**
  - `.some` → `.every` (436), `startsWith` → `endsWith` (439) y el cuerpo `() => undefined` (438): @s65.
  - Los dos literales (437 y 440): @s46.

  En `reglaDelLink`, la condición de oculto → `false` y su `{}` (471 y 472) mueren en @s65.

- **Base utilizable (S-12).**
  - En `esBaseUtilizable`: `&&` → `||` (444), `endsWith` → `startsWith` (445) y la barra → cadena vacía (446),
    todos en @s54.
  - En el corte (:1025): `false` y su `{}` (582 y 587, @s54); `true` (581, @s46; 584, @s51); `||` (583, @s46);
    `base === null` (585, @s51); `!esBaseUtilizable` → `esBaseUtilizable` (586, @s46); y el texto de la línea (588,
    @s54).
- **Lista ausente (S-3), en :1019.**
  - `ficheros === undefined` → `true` (576) o `!==` (578): @s46.
  - → `false` (577), su `{}` (579) y el texto (580): @s57.
- **Solo con candidatos, en :1018.**
  - `> 0` → `>= 0` (573), `<= 0` (574) y → `true` (571): @s26.
  - → `false` (572) y su `{}` (575): @s46.
- **La raíz va a `index.html`** (:683).
  - La comparación del resto con la cadena vacía → `false` (463) y esa cadena → «Stryker was here!» (465): @s51.
  - La misma comparación → `true` (462) y `!==` (464): @s48.
  - `ENTRADA_DE_LA_RAIZ` → cadena vacía (411) y `PREFIJO_SIN_BASE` → cadena vacía (410): @s51.
  - `slice(prefijo.length)` → `ruta` (460): @s46.
- **Regla 3** (:694): `bytes !== 0` (475, @s46), → `false` (474, @s49), → `true` (473) y su `{}` (476, @s49).
  Confirmado lo que dicen la spec y el mapa: de `=== 0` Stryker 9.6.1 NO genera `<= 0`.
- **Orden de las reglas.** Los `{}` de cada `return` temprano mueren: 450 (@s50), 453 (@s48), 459 (@s47),
  469 (@s48), 472 (@s65) y 476 (@s49).
- **Guarda del extractor nuevo** (:1066-1070).
  - `.some` → `.every` (609), `> 0` → `>= 0` (613), `true` (611), `!seInspeccionoAlgunLink` → `false` (617), su
    `{}` (618) y el texto (619): @s59.
  - Los demás caen antes en @s28.
- **`REGLAS_DEL_CASCARON`** → `[]` (622): @s34 y @s60.
- **Textos de las 5 reglas** (394-398): @s47, @s48, @s49, @s48 y @s60.

**Equivalentes de forma que preveía el mapa §2. No aparece ninguno**, porque el código está escrito como pide la
cabecera:

| Forma prevista         | Cómo está escrito                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Cableado de la lista   | Forma E, sin `?.`, `??` ni `!` sobre `ficheros`                                                                    |
| Lo que se quita dentro | Clase sin `+`                                                                                                      |
| Predicado de oculto    | Sin `slice(1)`                                                                                                     |
| Barra sin base         | `ruta.slice(prefijo.length)`, no una regex con `^`; el `??` de `base ?? PREFIJO_SIN_BASE` muere (454 → `&&`, @s46) |
| Ruta                   | `rutaDelHref`, no una regex con `$`; su regex (493) muere                                                          |

## Reproducir

```bash
cd .claude/worktrees/amazing-montalcini-d6abb1
node tools/mutate.mjs src/lib/puerta-cascaron.ts                          # medición 1 (por defecto)
pnpm exec stryker run --mutate src/lib/puerta-cascaron.ts --concurrency 1 # medición 2 (la que vale)
```

El informe HTML queda en `reports/mutation/index.html`, que no se versiona. Los ids, `killedBy` y `coveredBy` de
este documento salen del JSON incrustado en ese HTML (`app.report`), leído con un script de solo lectura del
scratchpad.
