# Mutación — feature 18 `equipo_reservas`

**Veredicto:** FAIL
**Score:** detectados/total = 112/120 = 93.33 % (umbral: 100 %)
**Comando:** `node tools/mutate.mjs src/components/Equipo.tsx` (sin `--testFiles`)
**Runner:** StrykerJS 9.6.1 · vitest.stryker.config.ts · Done in 5 min 17 s

## Tabla (clear-text de Stryker)

| File       | % score | # killed | # timeout | # survived | # no cov | # errors |
| ---------- | ------: | -------: | --------: | ---------: | -------: | -------: |
| Equipo.tsx |   93.33 |       95 |        17 |          8 |        0 |        0 |

- Total de mutantes válidos: **120** (instrumentados 120).
- Detectados (killed + timeout): **112**. Sobrevivientes: **8**. Sin cobertura: 0. Errores: 0.
- Los 17 timeouts cuentan como DETECTADOS para la puntuación.
- OJO: el arnés se lanzó con `| tee`, así que el "exit 0" del proceso de fondo es de `tee`;
  Stryker cerró con exit 1 (`Final mutation score 93.33 under breaking threshold 100`).

## Mutantes sobrevivientes (8)

### Matable con UN test nuevo (3)

- **src/components/Equipo.tsx:81:37**  `ConditionalExpression`
  - original: `minutos >= franja.abre && minutos < franja.cierra`
  - mutado:   `true && minutos < franja.cierra`  (se borra la cota inferior `>= abre`)
  - Por qué sobrevive: ninguna franja candidata cae ANTES de la apertura, así que quitar el
    límite inferior no cambia nada observable. Todas las `FRANJAS_POSIBLES` (10:00…19:00) son
    `>= abre` en todos los días probados.
  - Falta: un caso con una franja candidata ANTERIOR a `abre` (día que abra p. ej. a las 11:00,
    de modo que 10:00 deba filtrarse por la cota inferior) y aseverar que 10:00 NO se ofrece.

- **src/components/Equipo.tsx:81:63**  `EqualityOperator`
  - original: `minutos < franja.cierra`
  - mutado:   `minutos <= franja.cierra`
  - Por qué sobrevive: ninguna franja candidata coincide EXACTAMENTE con el minuto de cierre,
    así que `<` y `<=` son indistinguibles (sáb cierra 14:00=840; vecinas 13:00=780 dentro,
    16:00=960 fuera; ninguna == 840).
  - Falta: un caso de frontera con una franja candidata igual a `cierra` que deba EXCLUIRSE
    (aseverar que un hueco que empieza justo al cierre no se ofrece).

- **src/components/Equipo.tsx:118:18**  `BooleanLiteral`
  - original: `setReservado(false)`  (dentro de `reiniciar`)
  - mutado:   `setReservado(true)`
  - Por qué sobrevive: @s18 solo comprueba que tras "Cambiar" reaparece la vista de reserva;
    como `reiniciar` también limpia `diaIdx` y `hora`, la guarda de render de L140 es falsa
    con o sin la bandera pegada en true, enmascarando el defecto.
  - Falta: tras "Cambiar", RE-elegir día y hora y aseverar que la confirmación NO aparece hasta
    pulsar "Reservar" (el botón sigue rezando "Reservar · …", sin mensaje de confirmación). Con
    el mutante, `reservado` queda en true y la confirmación saldría sola.

### Requieren REDISEÑO — `className` condicional inmatable con `css:false` (3)

Los tres son el mismo ternario de L177: bajo `css:false` (vitest.config), `estilos.horaActiva`
y `estilos.horaOpcion` son ambos `undefined`, luego `className` es `undefined` en las dos ramas
y el ternario es inobservable en test. El estado real SÍ es observable por `aria-pressed` (L178),
cuyos mutantes murieron. Es la observación #1 del `judge`.

- **src/components/Equipo.tsx:177:32**  `ConditionalExpression`
  - original: `className={franja === hora ? estilos.horaActiva : estilos.horaOpcion}`
  - mutado:   `className={true ? estilos.horaActiva : estilos.horaOpcion}`
- **src/components/Equipo.tsx:177:32**  `ConditionalExpression`
  - mutado:   `className={false ? estilos.horaActiva : estilos.horaOpcion}`
- **src/components/Equipo.tsx:177:32**  `EqualityOperator`
  - original: `franja === hora`  →  mutado: `franja !== hora`
  - Falta / arreglo (vía preferida del proyecto): REDISEÑAR para que la clase se derive de la
    misma fuente consultable que `aria-pressed`, eliminando la condición duplicada e inmatable
    (no relajar aserciones ni borrar código). NB: la variante de días (L160) SÍ murió; solo la
    de horas (L177) queda viva.

### Candidatos a EQUIVALENTE — guarda redundante (2)

No los excluyo yo para forzar PASS. El veredicto es FAIL por los otros seis. Los dejo
documentados para que el `tdd_craftsman` decida: rediseñar o anotar `// Stryker disable
next-line all` con justificación.

- **src/components/Equipo.tsx:140:23**  `ConditionalExpression`
  - original: `reservado && diaSel !== null && hora !== null`
  - mutado:   `reservado && true && hora !== null`  (guarda `diaSel !== null` → `true`)
  - Por qué sobrevive: invariante del componente. `reservado` solo pasa a true por el botón
    "Reservar" (habilitado solo con `completo` = diaSel!==null && hora!==null) y `reiniciar`
    resetea `reservado` junto a `diaSel`; luego `reservado === true ⟹ diaSel !== null` siempre.
    Guarda redundante: sin estado alcanzable que la distinga. Candidato EQUIVALENTE.
- **src/components/Equipo.tsx:140:42**  `ConditionalExpression`
  - original: `reservado && diaSel !== null && hora !== null`
  - mutado:   `reservado && diaSel !== null && true`  (guarda `hora !== null` → `true`)
  - Mismo razonamiento: `reservado === true ⟹ hora !== null`. Candidato EQUIVALENTE.

## Nota de proceso
Solo mido y reporto. NO edito `src/` ni los tests. Matar cada superviviente es trabajo del
`tdd_craftsman` (test rojo → verde) y re-paso por el `judge`. La feature NO cierra a 93.33 %.

---

## Resolución del `tdd_craftsman` (2026-07-21) — 8 supervivientes, 0 exclusiones

Estrategia: 3 tests nuevos matan los matables; un rediseño de VALOR-OBJETO elimina de raíz los
inmatables/equivalentes (no quedan mutantes que excluir). Verificado: `pnpm exec vitest run
src/components/equipo.test.tsx src/components/equipo-estilos.test.ts` → **56 verdes** (53 → +3).
typecheck 0 · lint 0 errores. Las dos mutaciones matables se aplicaron a mano y se comprobó que los
tests nuevos SE PONEN ROJOS antes de revertir (disciplina rojo→verde).

### Matados con test nuevo (2 → función PURA inyectable)
Se extrajo el núcleo del filtro a `franjasOfrecibles(franjas: readonly Franja[])` (PURA, horario
INYECTADO, patrón de `abiertoEn`/`dentroDe` de F-10). `franjasDe` queda como fino cableado a
`HORARIO_SEMANAL`. Así los comparadores de frontera se muerden por valor con horarios arbitrarios:

- **81:37** `minutos >= franja.abre → true` — test «abre a las 11:00 (660) → 10:00 (600) NO se
  ofrece». Con el mutante 10:00 se colaría; el test cae rojo. Movido a `franjasOfrecibles`.
- **81:63** `minutos < franja.cierra → <=` — test «cierra a las 13:00 (780) → 13:00 (780) NO se
  ofrece» (intervalo semiabierto). Con `<=` la cita del minuto de cierre se ofrecería; rojo.

### Eliminados por REDISEÑO (6 → sin mutante que morder, sin exclusión)

- **177:32 ×3** (`className={franja === hora ? horaActiva : horaOpcion}`, inmatable con `css:false`):
  se BORRA el ternario. La franja lleva `className={estilos.horaOpcion}` fijo y su estado elegido se
  colorea desde `&[aria-pressed='true']` en el SCSS — misma fuente consultable que el árbol a11y
  (regla dura del repo: nunca `className` condicional). Sin ternario no hay ConditionalExpression ni
  EqualityOperator que instrumentar. `equipo-estilos.test.ts` se ancló al nuevo selector (AA intacta:
  relleno `--accent-dark`, borde `--border-interactive`). La `aria-pressed` sigue matada por @s16/@s24.

- **118:18** (`reiniciar` → `setReservado(false)→true`) y **140:23 / 140:42** (guarda
  `reservado && diaSel !== null && hora !== null`, cotas EQUIVALENTES por invariante): se sustituye la
  bandera `reservado` + los tres estados coordinados por dos VALORES-OBJETO `Cita | null`: `propuesta`
  (día+hora elegidos) y `reserva` (confirmada). La confirmación se decide con un ÚNICO `reserva !== null`
  (sin guarda compuesta redundante → sin mutantes equivalentes), y la propuesta se construye desde el
  `diaSel` YA ESTRECHADO dentro de `{diaSel !== null && …}` (sin re-chequear nulos → sin cota
  redundante). Desaparece `setReservado`, luego el mutante 118 no existe. Test-regresión @s18 añadido:
  tras «Cambiar», reponer día+hora NO reconfirma solo (hace falta pulsar «Reservar»).

**Exclusiones Stryker:** NINGUNA. No hubo que anotar `// Stryker disable` en ningún sitio: el rediseño
hace inalcanzables los estados que antes hacían equivalentes a las guardas.

Pendiente: que el `mutation_tester` re-corra `node tools/mutate.mjs src/components/Equipo.tsx` y
confirme 100 % (lo lanza otra fase; el `tdd_craftsman` no ejecuta la mutación).

---

## RONDA 2 — re-medición del `mutation_tester` (2026-07-21)

**Veredicto:** PASS
**Score:** detectados/total = 109/109 = **100.00 %** (umbral: 100 %)
**Comando:** `node tools/mutate.mjs src/components/Equipo.tsx` (sin `--testFiles`)
**Runner:** StrykerJS 9.6.1 · vitest.stryker.config.ts · Done in 5 min 16 s · exit 0
(`Final mutation score of 100.00 is greater than or equal to break threshold 100`)

### Tabla (clear-text de Stryker)

| File       | % score | # killed | # timeout | # survived | # no cov | # errors |
| ---------- | ------: | -------: | --------: | ---------: | -------: | -------: |
| Equipo.tsx |  100.00 |       93 |        16 |          0 |        0 |        0 |

- Mutantes instrumentados: **109** (antes 120; el rediseño del `tdd_craftsman`
  eliminó de raíz 11 puntos de mutación — el ternario `className` de L177 ×3, la
  bandera `setReservado` de L118, y las dos cotas de la guarda compuesta L140).
- Detectados (killed + timeout): **109**. Sobrevivientes: **0**. Sin cobertura: 0. Errores: 0.
- Los 16 timeouts cuentan como DETECTADOS.
- Dry-run inicial: 51 tests verdes (los tests de mutación bajo `vitest.stryker.config.ts`;
  los `*-horneado` quedan excluidos de la mutación por diseño, corren en `bin/harness verify`).

### Supervivientes
NINGUNO. Los 8 de la Ronda 1 (93.33 %) fueron neutralizados:
- **81:37** y **81:63** (cotas de frontera) — muertos por los tests nuevos de
  `franjasOfrecibles` (abre 11:00 → 10:00 fuera; cierra 13:00 → 13:00 fuera).
- **177:32 ×3** (ternario `className` inmatable con `css:false`) — el ternario ya NO existe:
  la franja lleva `className` fijo y su estado se colorea desde `[aria-pressed='true']`. Sin
  `ConditionalExpression`/`EqualityOperator` que instrumentar → sin mutante que sobreviva.
- **118:18** (`setReservado(false)→true`) y **140:23 / 140:42** (guarda compuesta EQUIVALENTE) —
  la bandera `reservado` + los tres estados coordinados se sustituyeron por dos VALORES-OBJETO
  `Cita | null` (`propuesta`, `reserva`) y un único `reserva !== null`. Los estados que hacían
  equivalentes a esas cotas ya no son alcanzables → sin mutantes que excluir.

### Exclusiones Stryker
NINGUNA. No hay `// Stryker disable` en el archivo. El 100 % es genuino, no forzado.

Cierre: la feature `equipo_reservas` cumple la puerta de mutación (100 % ≥ umbral 100 %).

---

## RONDA 1 — `src/components/equipo-logica.ts` (núcleo PURO extraído) — `mutation_tester` (2026-07-21)

**Veredicto:** PASS
**Score:** detectados/total = 40/40 = **100.00 %** (umbral: 100 %)
**Comando:** `node tools/mutate.mjs src/components/equipo-logica.ts` (sin `--testFiles`)
**Runner:** StrykerJS 9.6.1 · vitest.stryker.config.ts · Done in 2 min 36 s · exit 0
(`Final mutation score of 100.00 is greater than or equal to break threshold 100`)

Contexto: el `tdd_craftsman` movió las cuatro funciones PURAS (`diasOfrecidos`,
`franjasOfrecibles`, `franjasDe`, `indiceCircular`) de `Equipo.tsx` a este fichero
`equipo-logica.ts` (patrón F-09 `catalogo`/`catalogo-logica`, para que el módulo del
componente exporte SOLO el componente — react-refresh). El fichero YA está en la lista
`mutate` de `stryker.config.json`. Esta ronda muerde el núcleo por VALOR en su nuevo hogar.

### Tabla (clear-text de Stryker)

| File             | % score | # killed | # timeout | # survived | # no cov | # errors |
| ---------------- | ------: | -------: | --------: | ---------: | -------: | -------: |
| equipo-logica.ts |  100.00 |       33 |         7 |          0 |        0 |        0 |

- Mutantes instrumentados: **40**. Detectados (killed + timeout): **40**. Sobrevivientes: **0**.
  Sin cobertura: 0. Errores: 0.
- Los 7 timeouts cuentan como DETECTADOS para la puntuación.
- Dry-run inicial: 51 tests verdes (los tests de mutación bajo `vitest.stryker.config.ts`;
  los `*-horneado` quedan excluidos de la mutación por diseño). 6.83 tests por mutante de media.

### Mutantes sobrevivientes
NINGUNO. Cada uno de los 40 mutantes fue matado o expiró por timeout. Los comparadores de frontera
del filtro (`>= abre`, `< cierra` en `franjasOfrecibles`), la normalización circular
`((i % n) + n) % n` de `indiceCircular`, y el salto de domingos + serie desde mañana de
`diasOfrecidos` se muerden por VALOR con horarios/índices inyectados (@s10, @s12, @s13, @s21, @s22
y los describes `franjasOfrecibles`/`franjasDe`/`indiceCircular`).

### Exclusiones Stryker
NINGUNA. No hay `// Stryker disable` en el archivo. El 100 % es genuino, no forzado.

Cierre: `src/components/equipo-logica.ts` cumple la puerta de mutación (100 % ≥ umbral 100 %).

---

## RONDA 1 (sesión 2026-07-21) — re-medición del `mutation_tester` sobre `Equipo.tsx`

**Veredicto:** PASS
**Score:** detectados/total = 69/69 = **100.00 %** (umbral: 100 %)
**Comando:** `node tools/mutate.mjs src/components/Equipo.tsx` (sin `--testFiles`)
**Runner:** StrykerJS 9.6.1 · vitest.stryker.config.ts · Done in 4 min 5 s · exit 0
(`Final mutation score of 100.00 is greater than or equal to break threshold 100`)

### Tabla (clear-text de Stryker)

| File       | % score | # killed | # timeout | # survived | # no cov | # errors |
| ---------- | ------: | -------: | --------: | ---------: | -------: | -------: |
| Equipo.tsx |  100.00 |       49 |        20 |          0 |        0 |        0 |

- Mutantes instrumentados: **69**. Detectados (killed + timeout): **69**. Sobrevivientes: **0**.
  Sin cobertura: 0. Errores: 0. Los 20 timeouts cuentan como DETECTADOS.
- Coincide con lo esperado tras el rediseño: en la RONDA 2 el componente traía 109 mutantes con las
  cuatro funciones PURAS co-localizadas; el `tdd_craftsman` las MOVIÓ a `src/components/equipo-logica.ts`
  (40 mutantes, 100 % en su propia ronda). 69 + 40 = 109 → la separación no perdió ni un punto de mutación.
- Dry-run inicial: 51 tests verdes (config de mutación `vitest.stryker.config.ts`; los `*-horneado`
  quedan excluidos de la mutación por diseño). 7.23 tests por mutante de media.

### Mutantes sobrevivientes
NINGUNO.

### Exclusiones Stryker
NINGUNA. No hay ningún `// Stryker disable` en `Equipo.tsx`. El 100 % es genuino, no forzado.

Cierre: `src/components/Equipo.tsx` mantiene la puerta de mutación (100 % ≥ umbral 100 %) en su forma
actual (post-extracción a `equipo-logica.ts`).
