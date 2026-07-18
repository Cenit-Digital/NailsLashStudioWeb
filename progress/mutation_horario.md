# Mutación — F-10 `horario` (ESCALADA de supervivientes)

> `tdd_craftsman`. Cierre de la prueba de mutación de `src/lib/horario.ts`. Umbral 1.0 (100%), 0
> exclusiones (política del repo desde F-03). Regla aplicada (memoria «escalada de mutación: ampliar
> y refactorizar»): ante supervivientes se AMPLÍA el contrato/test (no se quitan guardas) y se
> REFACTORIZA el equivalente (NO se excluye, NO se baja el umbral, NO `// Stryker disable`).

## Resultado INICIAL (medido, no supuesto)

`node tools/mutate.mjs src/lib/horario.ts` → **96.81%** · 73 killed · 18 timeout · **3 survived** · 0 no-cov · 0 errors.

> Nota de honestidad: el briefing anticipaba «97,87% / 2 supervivientes / 23 timeouts». La MEDICIÓN
> real dio **96,81% / 3 supervivientes / 18 timeouts**. La diferencia es un tercer superviviente en la
> MISMA línea muerta 201 (la fila del domingo en `GRUPOS_SCHEMA`): además del `StringLiteral` que
> describía el briefing, Stryker saca ahí un `ArrayDeclaration` hermano. Mismo dato muerto, misma raíz,
> misma reparación (un solo refactor los borra a los dos por construcción).

Supervivientes exactos:

| # | Ubicación | Mutador | Mutación | Familia |
| - | --------- | ------- | -------- | ------- |
| 1 | `horario.ts:122:51` | `ConditionalExpression` | `excepciones.find((e) => e.fecha === fecha)` → `find((e) => true)` | test insuficiente |
| 2 | `horario.ts:201:11` | `ArrayDeclaration` | `{ dias: ['Sunday'], … }` → `{ dias: [], … }` | equivalente (dato muerto) |
| 3 | `horario.ts:201:12` | `StringLiteral` | `{ dias: ['Sunday'], … }` → `{ dias: [''], … }` | equivalente (dato muerto) |

## Reparación

### Superviviente 1 (línea 122) — AMPLIAR el test (no quitar la guarda)

Causa: @s5/@s6 usaban listas con UNA excepción cuya `fecha` COINCIDE con la consultada → `find(() =>
true)` devuelve esa misma → no distingue el emparejamiento por fecha del «devuelve el primero».

Reparación (refuerza una conducta YA aprobada de @s5 — «si la fecha coincide, mandan» —, no una
conducta nueva): añadido en `src/lib/horario.test.ts`, describe `@s5`, un `it` con DOS excepciones
donde **la que casa NO es la primera**:

- 1.ª entrada: `{ fecha: '2026-01-18', franjas: [{ abre: 600, cierra: 1200 }] }` — OTRA fecha, abriría.
- 2.ª entrada: `{ fecha: '2026-01-12', franjas: [] }` — el lunes consultado, cierra.
- `abiertoEn(lunes 10:30, SOLO_LUNES_ABIERTO, …)` → **`false`** (manda la 2.ª, por fecha).

Con el mutante `find(() => true)` devolvería la 1.ª (abriría) → `true` ≠ `false` → **rojo → muere**.
Fechas y franjas escritas A MANO (anti-tautología). Verde contra el código real; rojo contra el mutante.

### Supervivientes 2 y 3 (línea 201) — REFACTORIZAR el equivalente (no excluir)

Causa: el domingo (cerrado, `[]`) se OMITE del `openingHoursSpecification` porque su representante no
tiene franjas → la fila `{ dias: ['Sunday'], representante: 'Sunday' }` de `GRUPOS_SCHEMA` era DATO
MUERTO: el `.flatMap`/`.map` nunca emite nada de ella. Mutar `['Sunday']` a `[]` o a `['']` no cambia
la salida → mutantes EQUIVALENTES.

Reparación (patrón F-06: se elimina por REFACTOR, no por exclusión): retirada la fila del domingo de
`GRUPOS_SCHEMA` en `src/lib/horario.ts`. Ahora la tabla declara SOLO los grupos de días que pueden
ABRIR (L-V, Sábado); el cierre del domingo se representa por AUSENCIA (idiomático en schema.org) y el
`.map` sobre las franjas del representante sigue omitiendo dinámicamente cualquier grupo sin franjas.
Sin el literal `'Sunday'` inerte, **los dos mutantes de la línea 201 desaparecen por construcción**.

Sin nuevos equivalentes ingenuos: NO se añadió ningún `.filter`/guarda redundante (el `undefined`
redundante que la memoria advierte) — solo se borró la fila muerta; la estructura `flatMap/map` intacta.

Comprobado que el refactor NO abre otro hueco: la salida de `openingHoursSpecification(HORARIO_SEMANAL)`
es IDÉNTICA (el domingo no producía objeto antes ni ahora) → @s13 y @s14 (JSON-LD horneado) siguen
verdes y el `dist/` es byte-idéntico. El mutante `ArrayDeclaration` del domingo en `parsearFranjas`
(`[]` → `["Stryker was here"]`), que antes moría también en @s13, sigue muriendo en @s11 (la fila
«Domingo» dejaría de decir «Cerrado») → no se convierte en superviviente.

## Resultado FINAL

`node tools/mutate.mjs src/lib/horario.ts` → **100.00%** · 77 killed · 13 timeout · **0 survived** · 0 no-cov · 0 errors. Break threshold 100 SATISFECHO (exit 0).

## Secundario — los 13 timeouts (no bloquean; investigados)

Bajaron de 18 → 13 al retirar la fila muerta (menos mutantes en el pool; el conteo de timeouts varía
entre corridas). `horario.ts` es lógica PURA **sin bucles explícitos** (`while`/`for`): toda iteración
va por métodos de array ACOTADOS (`.find`, `.some`, `.map`, `.flatMap`, `.split`), que un mutante NO
puede volver infinitos. Por tanto los timeouts NO son bucles legítimos vueltos infinitos NI síntoma de
estructura frágil de producción: son el heurístico de timeout de Stryker disparándose bajo el entorno
de test PESADO (jsdom, `setup ~30 s`, `environment ~250 s` agregados en el arranque de vitest), común a
toda la suite. Cuentan como DETECTADOS (no restan del score). No se fuerza nada (son legítimos del runner).

## Alcance tocado (cierre)

- `src/lib/horario.ts` — retirada la fila muerta del domingo de `GRUPOS_SCHEMA` (+ comentario que
  explica el porqué). Único cambio de producción.
- `src/lib/horario.test.ts` — +1 test en @s5 (emparejamiento por fecha, no por posición).
- ❌ NO se tocó `src/pages/home.tsx` ni `src/lib/seo.ts` (el JSON-LD ya estaba bien). NO se tocó
  `src/lib/site.ts` (F-02). NO se tocó `stryker.config.json` (0 exclusiones, umbral 1.0 intacto).

## Puertas verificadas tras el cierre

- `pnpm test` → **729 passed** / 22 files (era 728; +1 por el test de @s5).
- `pnpm typecheck` → 0 · `pnpm lint` → 0.
- `pnpm build` → **exit 0** con las 5 puertas (cascarón, placeholders, contraste, terceros, anclas).
- `seo.test.ts` (F-04, done) → **43 passed** (verde): `construirJsonLd` intacto, sus 6 claves exactas.
- Mutación `src/lib/horario.ts` → **100%**, 0 supervivientes, umbral 1.0 mantenido, 0 exclusiones.
