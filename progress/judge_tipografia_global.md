# Review — feature 21 `tipografia_global` (LOTE A)

**Veredicto:** APPROVED

> El review es el juego entero. Se juzga diseño y cobertura de escenarios; la
> mutación no aplica (SCSS, `mutable:false`, como F-08) y el eje [NV] (@s8/@s9,
> `@verificacion-viva`) lo cierra el LEAD en vivo con Chrome/CDP. Ambas son
> puertas distintas y quedan fuera de este veredicto por diseño, NO son hueco.

## Cobertura de escenarios (@s ↔ test) — `src/styles/tipografia-global.test.ts`
- @s1: [x] `@s1 la regla body declara font-family "'Manrope', system-ui, sans-serif"` — regex del stack EXACTO (`_tipografia.scss:10-12`). MUERDE (sabotaje S2 → rojo).
- @s2: [x] dos tests — `hay UNA sola regla que nombra h2 y/o h3, y su lista es {h2, h3}` (conjunta, `toHaveLength(1)` + contiene h2 y h3) + `declara font-family "'Gilda Display', serif"` (`_tipografia.scss:17-21`). La regla CONJUNTA queda aseverada: una regla separada `h3 {…}` daría length 2 → rojo.
- @s3: [x] `main.scss lo importa con @use 'tipografia'` — anti-vacuidad. MUERDE (sabotaje S1 → rojo, 1 test).
- @s4: [x] `it.each(['body','h2, h3'])` — cada regla NOMBRA su font-family. MUERDE (sabotaje S2 → rojo en body).
- @s5: [x] tres tests — familias entrecomilladas ⊆ {Manrope, Gilda Display, Great Vibes}; único identificador desnudo admitido = genérico {system-ui, sans-serif, serif, cursive}; sin `@import`/`@font-face`. Protege el cero-terceros de F-05. Anti-vacuidad (`> 0`) en ambas listas.
- @s6: [x] tres tests — lista {h2, h3} sin h1; ninguna regla matchea h1 ni `.heroMarca/.heroStudio/.titulo`; el partial NO referencia `hero.module`. Frontera dura con F-07.
- @s7: [x] tres tests — sin `!important` en font-family; sin `!important` en ninguna parte; solo selectores de TIPO (sin `.`/`#`). Suelo, no techo.
- @s8: [ ] `@verificacion-viva` — [NV], lo cierra el LEAD en vivo (Chrome/CDP sobre `dist/`). Correctamente NO ejecutado bajo jsdom. NO es hueco.
- @s9: [ ] `@verificacion-viva` — [NV] regresión + `pnpm build`. Ídem. `pnpm build` YA validado por el judge (exit 0, 5 puertas) como puerta de no-regresión.

## Disciplina TDD
- ¿Producción sin test que la pida? **NO.** El partial tiene EXACTAMENTE dos reglas (`body`, `h2,h3`), ambas exigidas por @s1/@s2/@s4; `main.scss` +`@use` exigido por @s3. Cero producción sobrante.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ.** Bitácora `progress/tdd_tipografia_global.md`: 6 ciclos + batería de 6 sabotajes con backup/restore. Reproduje S1 (→@s3 rojo) y S2 (→@s1+@s4 rojos): ambos MUERDEN. Repo restaurado idéntico (diff vacío vs backup, git status = snapshot inicial).
- Anti-tautología: **OK.** Nombres y allowlist van A MANO en el test; no se importa de `main.tsx`/`site.ts`/símbolo alguno; el test NO lee los `.module.scss` de F-06/F-07 (solo `_tipografia.scss` y `main.scss`).
- Método/mutación: **OK.** `mutable:false` declarado en `feature_list.json` (id 21) — SCSS, Stryker no ve SCSS y `src/styles/` no está en `mutate`; declarado, no fingido (igual que F-08).

## Calidad (lente de artesano)
- `_tipografia.scss`: dos reglas, nombres reveladores, comentarios que explican el PORQUÉ (herencia como suelo, selector de tipo 0,0,1), sin números mágicos, sin `!important`. Respeta `docs/architecture.md` (capa de estilos global, cada feature dueña de su partial).
- Test: helpers de parseo cortos y con un solo motivo (`reglas`, `selectoresDe`, `reglaExacta`, `reglasQueNombran`, `familiasDeclaradas`), robustos a reformateo de prettier (cuenta llaves, normaliza whitespace). Parseo sobre el código SIN comentarios (evita el falso positivo de un `@import` en prosa, cazado y corregido en el ciclo 5).

## Alcance (nada de más)
- `git diff`+status: SOLO `_tipografia.scss` (nuevo), `main.scss` (+1 `@use`), `tipografia-global.test.ts` (nuevo), bitácora, `current.md`, cabecera de `tipografia_global.feature` y status id 21 (`spec_ready→in_progress`).
- CERO cambios en `_base.scss`/`_tokens.scss` (F-03/F-04), en `hero.module.scss` (F-07) y en cabecera/nav/pie (F-06). Verificado en el diff.

## Sin regresión (puertas verdes)
- `pnpm typecheck`: 0. `pnpm lint`: 0. `pnpm test`: **679 passed** (20 ficheros; +15 nuevos @s1..@s7).
- `pnpm build`: **exit 0** con las CINCO puertas (cascarón · placeholders · contraste 18 pares · terceros 6 pares autohospedados · anclas). TERCEROS verde con Gilda Display entrando por PRIMERA VEZ en `dist/assets` (`gilda-display-latin-400-normal-*.woff2/.woff`); 0 referencias a googleapis/gstatic.

## Checkpoints
- C1 (arnés completo, `harness init` exit 0): [x]
- C2 (estado coherente, UNA sola feature `in_progress` = id 21): [x]
- C3 (arquitectura: partial en `src/styles/`, cero deps nuevas, sin logs/TODOs): [x]
- C4 (verificación real: test por módulo, 679 verdes, lee ficheros reales): [x]
- C5 (sesión cerrada: bitácora + current.md; untracked legítimos): [x]
- C6 (contrato Gherkin: @s tagueados, Then medibles, mapa @s→test, sin producción sin test): [x]
- C7 (mutación): N/A declarado — SCSS `mutable:false` (como F-08); la validan el test + puerta humana + verificación en vivo, no Stryker.

## Bloqueantes
- Ninguno (0).

## Menores (no bloquean)
1. Cabeceras de puerta del LOTE A en `features/catalogo_servicios.feature`, `features/contacto.feature` y `features/horario.feature` (flip `⏸ PENDIENTE → ✅ APROBADO`) quedan fuera del alcance estricto de `tipografia_global`. Son comentarios de puerta del lote (no código, no escenarios) y no tocan nada `done` ni añaden producción sin test; son bookkeeping del LEAD al abrir el LOTE A. Anotado, no bloquea.
2. Redundancia deliberada `body`Manrope + `.cabecera`Manrope + `.eyebrow`Manrope: es el riesgo residual DECLARADO en @s7 (cada feature dueña de su declaración; no se tocan ficheros `done`). No es bug; informativo.

## Cambios requeridos
- Ninguno. Se libera a la verificación EN VIVO del LEAD (@s8/@s9) y, tras ella, al cierre `done`.
