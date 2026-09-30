# Mutación — feature 27 `catalogo_fotos`

**Veredicto:** PASS
**Score:** killed/total = 7/7 = **100,00 %** (umbral: 100 %, `harness.config.json` → `mutation.threshold`
1.0; `stryker.config.json` → `thresholds.break` 100)

- `src/components/Catalogo.tsx`: 7 instrumentados, 7 killed, 0 survived, 0 timeout, 0 sin cobertura, 0
  errores y 0 ignorados.
- Sobrevivientes: **ninguno**. Equivalentes: **ninguno**. No hay ninguna marca `Stryker disable` y
  tampoco hay receta para el `tdd_craftsman`.

## Base de la medición

- `src/` y la configuración, tal como están en `5482984` (el TDD de F-27, que añade `Catalogo.tsx` al
  final de `mutate`). Durante la sesión entraron `b90caca` (verificación en vivo) y `c9099e9` (judge
  CHANGES_REQUESTED, B1). `git diff --stat 5482984 HEAD -- src stryker.config.json vitest.config.ts
vitest.stryker.config.ts` sale vacío, así que la medición vale para `HEAD`.
- Runner: StrykerJS 9.6.1 con `@stryker-mutator/vitest-runner`, `coverageAnalysis: perTest` y
  `vitest.stryker.config.ts` (los `*-horneado` quedan fuera de la mutación por diseño). Node v22.22.2.
- Comando declarado en `harness.config.json` → `commands.mutate`: `node tools/mutate.mjs {{target}}`,
  que ejecuta `pnpm exec stryker run --mutate src/components/Catalogo.tsx`. Acotado solo con
  `--mutate`, **nunca** con `--testFiles`.
- El judge revisó en paralelo por decisión del lead, así que esta medición NO se hizo con
  `judge_catalogo_fotos.md` en APPROVED. B1 solo pide cambiar `src/components/catalogo.test.tsx`, y
  ningún test de @s8/@s9 es el único que mata un mutante (ver la matriz). Aun así, al cerrar B1 conviene
  repetir la corrida 1 (≈40 s). Si el arreglo toca `Catalogo.tsx`, hay que repetirla sí o sí.

## Comandos exactos y duración (en serie, uno cada vez)

| #   | Comando                                                                                                                                  | Exit  | Pared          | Resultado                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----- | -------------- | ------------------------------------------------------------------------- |
| 1   | `node tools/mutate.mjs src/components/Catalogo.tsx` (**la medición**)                                                                    | 0     | 41 s           | Done in 38 s: **7/7 killed, 100 %**                                       |
| 2   | `pnpm exec stryker run --mutate src/components/Catalogo.tsx --disableBail` (diagnóstico)                                                 | 0     | 64 s           | 7 `Timeout` sin `statusReason`: **descartada** (ver «Diagnósticos»)       |
| 3   | Matriz en memoria: control + 7 × `pnpm exec vitest run --config <scratchpad>/f27_matriz.config.mts` sobre los 4 ficheros de test de F-27 | 0 / 1 | 3-5 s cada una | Control 66/66 verde; cada mutante tumba ≥ 1 test de F-27 (tabla de abajo) |

Los logs, los dos informes HTML, el JSON del informe y la config de la matriz están en el scratchpad
de la sesión: `/tmp/claude-0/-home-user-NailsLashStudioWeb/dffbd73b-3f81-5e8b-8819-805db4e58549/scratchpad/`
(`f27_catalogo.{log,html}`, `f27_catalogo_nobail.{log,html}`, `f27_report.json`,
`f27_matriz.config.mts` y `matriz_{control,0..6}.{log,json}`).

## Tabla del fichero (clear-text de Stryker + JSON del informe)

| Fichero        | Instrumentados | Killed | Survived | Sin cobertura | Timeout | Errores | Ignorados | Estáticos | Tests en dry run | Tests/mutante | Score        |
| -------------- | -------------: | -----: | -------: | ------------: | ------: | ------: | --------: | --------: | ---------------: | ------------: | ------------ |
| `Catalogo.tsx` |              7 |      7 |        0 |             0 |       0 |       0 |         0 |         7 |              201 |        156,29 | **100,00 %** |

- Dry run: 201 tests en 11 s (4,35 s netos). Los 7 mutantes son **estáticos**, porque todo el
  componente se evalúa al renderizar y `ID_SERVICIOS` es una constante de módulo. Stryker los ejecuta
  contra los 201 tests relacionados (`WARN MutantTestPlanner … 7 static mutants`), no solo contra los
  que los cubren.
- Cobertura per-test de los 6 que están dentro del cuerpo: `catalogo.test.tsx` (36),
  `resenas.test.tsx` (5), `nailbot-flotante.test.tsx` (2) y `home.test.tsx` (2). El #0 sale con
  cobertura 0 porque es de nivel de módulo, pero por ser estático se ejecutaron igualmente 160 tests
  hasta matarlo.

## Mutante → test que lo mata

Stryker corta en el primer test que falla (bail), así que su `killedBy` solo nombra UNO. La última
columna sale de la matriz en memoria (corrida 3): el mismo reemplazo y la misma `location` que Stryker,
contra los 4 ficheros de test de F-27 (66 tests).

| #   | Línea:col | Mutador          | Original → mutado                                              | `killedBy` de Stryker (primero)                                                                      | Tests de F-27 que lo matan (matriz)                                                                                                          | Previsto en el `.feature` |
| --- | --------- | ---------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 0   | 21:22     | `StringLiteral`  | `'servicios-titulo'` → `""` (`ID_SERVICIOS`)                   | `logo-acoplado.test.tsx` (F-25) `@s23 la puerta de anclas vivas sobre la ruta "/" da 0 violaciones…` | 3: `@s10 hay EXACTAMENTE una <section> y declara aria-labelledby=…`, `@s10 el ÚNICO id del catálogo…`, `@s6 existe una región … "Servicios"` | @s10: sí                  |
| 1   | 27:28     | `BlockStatement` | cuerpo de `Catalogo()` → `{}`                                  | `logo-acoplado.test.tsx` (F-25) `@s23 la puerta de anclas vivas…`                                    | 36: todos los de `catalogo.test.tsx` (@s1-@s13)                                                                                              | no listado (es el 7.º)    |
| 2   | 29:25     | `StringLiteral`  | `` `demo-seccion ${estilos.catalogo}` `` → ` `` `              | `@s12 el class de la <section> contiene "demo-seccion"`                                              | 1: el mismo                                                                                                                                  | @s12: sí                  |
| 3   | 35:28     | `ArrowFunction`  | `(categoria) => (…)` → `() => undefined`                       | `@s1 unas: el bloque de "Manos y pies de Revista" contiene exactamente una <img>…`                   | 29: @s1 ×3, @s2, @s3 ×3, @s4 ×2, @s5 ×4, @s6 ×3, @s7 ×2, @s10 ×2 (recuento de `<h3>` y rótulos), @s11 ×3, @s12 ×2, @s13 ×4                   | @s1, @s10: sí             |
| 4   | 43:31     | `StringLiteral`  | `` `demo-card ${estilos.carta}` `` → ` `` `                    | `@s12 el class de cada una de las tres cartas … contiene "demo-card"`                                | 1: el mismo                                                                                                                                  | @s12: sí                  |
| 5   | 44:42     | `ArrowFunction`  | `(servicio) => (…)` → `() => undefined`                        | `@s11 cada carta tiene EXACTAMENTE seis filas…`                                                      | 3: `@s11 … seis filas…`, `@s11 la primera fila de cada carta…` y `@s12 … "demo-card"` (la carta se localiza por sus seis filas)              | @s11: sí                  |
| 6   | 51:30     | `StringLiteral`  | `` `demo-btn demo-btn--solido ${estilos.reservar}` `` → ` `` ` | `@s12 el class de cada uno de los tres enlaces contiene "demo-btn" y "demo-btn--solido"`             | 1: el mismo                                                                                                                                  | @s12: sí                  |

- **La tabla MUTACIÓN del `.feature` se cumple**. De los ≈6 mutantes previstos salen exactamente esos 6
  y cada uno muere con el escenario previsto. El 7.º es el `BlockStatement` del cuerpo del componente,
  que el `.feature` no enumeraba y que mata cualquier test de render.
- **F-27 muerde por sí sola**. En #0 y #1, Stryker atribuye la muerte a un test de F-25, pero solo
  porque es el primero en fallar. La matriz demuestra que los tests de F-27 también los matan
  (#0: 3 tests; #1: 36 tests).
- **Lo nuevo de F-27 no genera mutantes**, como preveía la cabecera (E1.d, A-14). No hay ninguno en
  `ANCHO_FOTO`/`ALTO_FOTO` (líneas 24-25), en los atributos de la `<img>` (57-64), en
  `href="#reserva-titulo"` ni en el segundo `<p>` de `LEYENDA_FOTOS` (70). Esos puntos los protegen
  @s1, @s4, @s7, @s8 y @s17 más los sabotajes del TDD y del judge, no Stryker. B1 (la leyenda repetida
  como fragmento) es justo de esa clase: ningún mutador de Stryker duplica un `<p>`, así que el 100 %
  no dice nada sobre B1.

## `src/lib/demo/catalogo-demo.ts` (DATOS): fuera de `mutate`, y así debe seguir

- **No está** en la lista `mutate` de `stryker.config.json`: no hay ninguna entrada `src/lib/demo/*`.
- Así lo deciden la spec (`project-spec.md` §Feature 27, CF-C6: «`catalogo-demo.ts` es dato, fuera de
  `mutate` (como `equipo-demo.ts`)») y el `.feature` (cabecera MUTACIÓN y bloque (B)).
- No lo he añadido. Su contenido lo defienden los tests de datos @s14-@s16 y la guarda de fuente @s18
  (sabotajes (F)-(M) y (R)-(T) de `progress/tdd_catalogo_fotos.md`).

## Diagnósticos (no son la medición)

- **Corrida 2, `--disableBail`.** La lancé para conocer TODOS los tests que matan cada mutante. Dio 7
  `Timeout` sin `statusReason` y 0 killed, así que no aporta información y la descarto. No es un
  hueco: en la corrida 1 los 7 son `Killed` con su test y su razón. Esa corrida sobrescribió
  `reports/mutation/index.html`, y he vuelto a copiar en su sitio el informe de la corrida 1 (`cmp`
  idéntico).
- **Corrida 3, la matriz en memoria.** Una config de Vitest en el scratchpad extiende
  `vitest.stryker.config.ts` y añade un plugin `transform` (`enforce: 'pre'`). Ese plugin sustituye el
  texto de `Catalogo.tsx`, SOLO en memoria, por el empalme exacto de cada mutante del informe. Antes
  comprueba que la fuente en disco es idéntica a la del informe; si no, aborta.
  - No toca `src/`.
  - Las guardas de bytes (@s17) leen el disco y no ven el mutante, igual que se espera.
  - El control sin mutante dio 66/66 verdes. Cada corrida acotada duró entre 3 y 5 s.

## Concurrencia (a conocimiento del lead)

- A las 14:50 corría un `bin/harness init` ajeno (hijo del proceso principal). Esperé a que el
  contenedor quedara en reposo (14:53:01) antes de lanzar nada.
- Cuando arrancó la corrida 1 (14:53:06) seguía viva una ejecución acotada del judge
  (`pnpm vitest run` de los 4 tests de F-27, de ≈5 s), que coincidió con la copia del sandbox de
  Stryker.
  - Son tests unitarios: no crean `.experimentos-tmp/` ni `.vite-react-ssg-temp/`.
  - La corrida salió limpia (0 timeout, 0 errores, 0 sin cobertura), así que no alteró el resultado.
- Las corridas 2 y 3 fueron en solitario (lo comprobé con `ps` antes de cada una). No lancé la suite
  completa ni `pnpm build`.

## Nota de proceso

- No he editado `src/`, ningún test, `stryker.config.json` ni `harness.config.json`, y no he añadido
  marcas `Stryker disable`.
- `git status` muestra solo este informe. `reports/` está en `.gitignore`.
- C7 (prueba de mutación) queda **cumplido** para F-27 con `Catalogo.tsx` al 100 %.
- Quedan pendientes, fuera de mi papel, B1 del judge (`tdd_craftsman` → judge) y, tras B1, repetir
  la corrida 1 y el `bin/harness init` que pide el judge antes de `done`.
