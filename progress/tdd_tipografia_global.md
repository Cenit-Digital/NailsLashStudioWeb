# TDD — `tipografia_global` (id 21, LOTE A)

> `tdd_craftsman`. Contrato APROBADO: `features/tipografia_global.feature` (9 escenarios; el test
> unitario implementa **SOLO @s1..@s7** — @s8/@s9 son `@verificacion-viva` con Chrome/CDP y los
> cierra el LEAD en vivo, jamás con jsdom). `mutable: false` (SCSS): Stryker NO ve SCSS y
> `src/styles/` no está en `mutate` → NO se corre Stryker; se declara aquí (igual que F-08). El
> mutante es HUMANO: su defensa es este test + la puerta de aprobación + la verificación en vivo.

## Puerta verificada antes de arrancar

- `features/tipografia_global.feature` cabecera línea 5: «✅✅ APROBADO POR LA PUERTA HUMANA EL
  2026-07-18 (LOTE A)». ✔
- `feature_list.json` id 21: `status: "in_progress"` + `puerta_humana` (APROBADO lote A). ✔
- Ambas cuadran → adelante.

## Producción (mínimo para verde, nada que ningún test pidiera)

- **`src/styles/_tipografia.scss`** (partial NUEVO): dos reglas y nada más.
  - `body { font-family: 'Manrope', system-ui, sans-serif; }` — suelo heredable del cuerpo.
  - `h2, h3 { font-family: 'Gilda Display', serif; }` — regla CONJUNTA (una sola, dos selectores).
- **`src/styles/main.scss`**: añadido `@use 'tipografia';` (enganche; sin él, verde por vacuidad).
- NO se tocó el `<h1>` del hero (F-07), ni cabecera/nav/pie (F-06), ni `_base.scss`/`_tokens.scss`
  (F-04/F-03), ni ningún `.module.scss` `done`. Fuentes ya horneadas por F-05.

## Ciclos Rojo → Verde → Refactor

- **Ciclo 1 — @s1 (body Manrope).**
  - ROJO: test lee `_tipografia.scss` → `ENOENT` (el partial no existe). Falla legítimo.
  - VERDE: creo el partial con la regla `body` y el stack `'Manrope', system-ui, sans-serif`.
  - REFACTOR: sin deuda; helpers de parseo (`reglas`, `selectoresDe`, `reglaExacta`) ya con nombres
    reveladores, calcados de `hero-estilos.test.ts`.
- **Ciclo 2 — @s2 (h2, h3 Gilda Display, CONJUNTA).**
  - ROJO: no existe regla que nombre h2/h3 → 2 tests fallan (la unicidad de la regla y el stack).
  - VERDE: añado la regla conjunta `h2, h3 { font-family: 'Gilda Display', serif; }`.
- **Ciclo 3 — @s3 (enganche @use).**
  - ROJO: `main.scss` no contiene `@use 'tipografia'` → falla.
  - VERDE: añado `@use 'tipografia';` a `main.scss`.
- **Ciclo 4 — @s4 (nadie sin font-family).** Guarda anti-vacuidad sobre la producción de @s1/@s2:
  verde en cuanto existen las dos reglas. Mordida demostrada por SABOTAJE S2 (ver abajo).
- **Ciclo 5 — @s5 (cero terceros / allowlist).** Guarda. Captura LEGÍTIMA durante el desarrollo: el
  primer test de `@import`/`@font-face` leía el fichero CRUDO y saltó con MI PROPIO comentario del
  partial (menciona «@import» en prosa). Corregido: la comprobación de directivas corre sobre el
  CÓDIGO sin comentarios (una directiva real es código, nunca prosa comentada). Mordidas por S3/S4.
- **@s6 (deslinde de h1 / hero).** Guarda; mordida por S5.
- **@s7 (suelo, no techo; sin !important).** Guarda; mordida por S6.

## Trazabilidad @s → test (fichero `src/styles/tipografia-global.test.ts`)

- **@s1** → `@s1 la regla \`body\` declara font-family "'Manrope', system-ui, sans-serif"`.
- **@s2** → `@s2 hay UNA sola regla que nombra h2 y/o h3, y su lista es {h2, h3} (conjunta, no dos
  reglas)` + `@s2 esa regla conjunta declara font-family "'Gilda Display', serif"`.
- **@s3** → `@s3 main.scss lo importa con @use 'tipografia'`.
- **@s4** → `@s4 la regla del selector "%s" NOMBRA su propia font-family` (it.each: `body`, `h2, h3`).
- **@s5** → `@s5 toda familia ENTRECOMILLADA … pertenece a la allowlist {Manrope, Gilda Display,
  Great Vibes}` + `@s5 el ÚNICO identificador SIN comillas admitido es un genérico CSS` + `@s5 el
  partial NO contiene ninguna directiva @import ni ningún bloque @font-face`.
- **@s6** → `@s6 la lista de selectores … contiene h2 y h3 y NO contiene h1` + `@s6 el partial no
  declara ninguna regla que aplique a h1 ni a las clases del titular del hero` + `@s6 el partial NO
  edita ni referencia hero.module.scss`.
- **@s7** → `@s7 ninguna declaración font-family … lleva !important` + `@s7 el partial no usa
  !important en ninguna parte` + `@s7 las reglas del partial usan solo selectores de TIPO … body por
  herencia, h2/h3 (0,0,1)`.
- **@s8 / @s9** → `@verificacion-viva`. NO viven en este test ni en jsdom. Los cierra el LEAD con
  Chrome real/CDP sobre `dist/` (`font-family` computado del body y de un `<h2>`, `document.fonts.
  check('16px Manrope')` / `check('24px Gilda Display')`, descarga same-origin del woff2 de Gilda
  Display, y regresión F-03/F-05/F-06/F-07). PROHIBIDO fingirlos con jsdom.

Anti-tautología: los stacks (`'Manrope', system-ui, sans-serif`; `'Gilda Display', serif`), la
allowlist `{Manrope, Gilda Display, Great Vibes}` y los genéricos `{system-ui, sans-serif, serif,
cursive}` van ESCRITOS A MANO en el test; NO se importan de `main.tsx`, `site.ts` ni de ningún
símbolo. El test NO lee los `.module.scss` de F-06/F-07 (ficheros `done` ajenos).

## Verificación por SABOTAJE (docs/verification.md — el número no depende de Stryker)

Batería determinista con backup/restore (todos ROJO y la suite vuelve a VERDE):

| # | Sabotaje | Muerde |
| - | -------- | ------ |
| S1 | quitar `@use 'tipografia'` de `main.scss` | @s3 |
| S2 | quitar `font-family` del `body` | @s1 y @s4 (body) |
| S3 | familia no horneada (`'Playfair Display'`) | @s5 allowlist (+ @s2) |
| S4 | identificador desnudo no genérico (`Georgia`) | @s5 desnudos (+ @s1) |
| S5 | ampliar el selector a `h1, h2, h3` | @s6 (+ @s4) |
| S6 | `!important` en el body | @s7 (+ @s5 desnudos) |

Balance: **TODOS mordieron**; suite restaurada a verde. Las mordidas colaterales confirman que las
guardas se cruzan (S3 rompe también @s2, S6 rompe @s5).

## Estado final (todo verde)

- `pnpm typecheck` → **0**.
- `pnpm lint` → **0** (ESLint no toca SCSS; el nuevo `.test.ts` pasa limpio).
- `pnpm test` → **679 passed** (20 ficheros). Línea base 664 → **+15** tests nuevos (@s1..@s7).
- `pnpm build` → **exit 0** con las **CINCO puertas** (cascarón · placeholders · contraste 18 pares ·
  terceros 6 pares autohospedados · anclas). El woff2/woff de **Gilda Display entró en `dist/assets`**
  (referenciada por primera vez con un `font-family` de USO) SIN romper la puerta de terceros.
- **Stryker**: NO corrido (SCSS, `mutable: false`) — declarado, no fingido.
- **Chrome / @s8-@s9**: NO corridos — los cierra el LEAD en vivo.
- **`done`**: NO marcado. Espera al `judge` y a la verificación en vivo del LEAD.

## Ficheros tocados

- `src/styles/_tipografia.scss` (NUEVO).
- `src/styles/tipografia-global.test.ts` (NUEVO, @s1..@s7).
- `src/styles/main.scss` (+1 línea `@use 'tipografia';`).
- `progress/current.md`, `progress/tdd_tipografia_global.md` (bitácora).
