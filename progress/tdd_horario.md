# TDD — F-10 `horario` (LOTE A, 2ª feature)

> `tdd_craftsman`. Contrato APROBADO `features/horario.feature` (15 escenarios, v2). Puerta verificada:
> cabecera «✅✅ APROBADO POR LA PUERTA HUMANA EL 2026-07-18 (lote A)» + `feature_list.json` §10
> (`horario`) `status: in_progress` + `puerta_humana` (lote A). Cuadran → implementado por TDD estricto.

## Ficheros

- **`src/lib/horario.ts`** — NUEVO. La ÚNICA lógica mutable de F-10 (lógica PURA). Añadido a la lista
  `mutate` de `stryker.config.json`. `vitest.config.ts` ya lo cubre por glob (`src/lib/**/*.ts`, F-06) → NO tocado.
- **`src/lib/horario.test.ts`** — NUEVO. @s1–@s11, @s13 (43 tests).
- **`src/pages/home.tsx`** — ADITIVO. Compone `openingHoursSpecification` en el SITIO DE EMISIÓN (D4):
  `const jsonLd = { ...construirJsonLd({…}), openingHoursSpecification: openingHoursSpecification(HORARIO_SEMANAL) }`
  inline en el componente (const local, F-04 style → lint-clean). **NO toca `construirJsonLd`/`seo.ts`.**
- **`src/pages/home-horneado.test.ts`** — NUEVO. @s12 y @s14 sobre el `dist/index.html` REAL (build-based,
  patrón `trampas-del-horneado`): NO importa nada de `src/lib` → no lo re-ejecuta Stryker (anti-timeout).
- **`stryker.config.json`** — `+ src/lib/horario.ts` en `mutate`. `home.tsx` NO entra (cableado/JSX, no mutable).

## Ciclos Rojo → Verde → Refactor (un test a la vez)

| # | @s | ROJO (test que falla) | VERDE (mínimo) | REFACTOR |
| - | -- | --------------------- | -------------- | -------- |
| 1 | @s1 | reloj falso a domingo 03:00, `estaAbierto(lunes 10:30)` → import falla | `estaAbierto = () => true` (constante, se generaliza en @s2) | — |
| 2 | @s2 | outline L-V semiabierto (09:59/10:00/19:59/20:00/20:01/00:00) rompe la constante | `abiertoEn`+`horaDePared` (Intl Europe/Madrid, hourCycle h23)+`parsearFranjas`+`aMinutos`+`HORARIO_SEMANAL` derivado de `HORARIO` (F-02); comparadores `>=`/`<` | nombres/constantes |
| 3 | @s3 | sábado 10:00–14:00 + domingo cerrado | la derivación uniforme ya produce S=`[{600,840}]`, D=`[]` (ejercita datos que @s2 no toca) | — |
| 4 | @s4 | DST CET/CEST misma hora de pared | ya lo resuelve `Intl` (sin offset fijo); ancla anti-regresión | — |
| 5 | @s5 | `abiertoEn(…, excepciones)` con 3er arg → arity error | añadida la rama de excepciones (consultadas PRIMERO) + `fecha` a `horaDePared`; `EXCEPCIONES = []` para `estaAbierto` | — |
| 6 | @s6 | excepción abre un domingo cerrado | ya lo cubre la rama (franjas no vacías, semiabiertas) | — |
| 7 | @s7 | `aMinutos` outline (13:59→839) | ya implementado en @s2 | — |
| 8 | @s8 | `parsearFranjas` outline (`'cerrado'`→`[]`) | ya implementado en @s2 | — |
| 9 | @s9 | `HORARIO_SEMANAL` 7 días | ya derivado en @s2 | — |
| 10 | @s10 | `EXCEPCIONES` vacía + festivo daría abierto | `EXCEPCIONES = []` (honesto, no inventa festivos) | — |
| 11 | @s11 | `horarioParaUI` 3 filas → undefined | `horarioParaUI`+`franjaParaUI`+`deMinutos`+`dosDigitos`; copy «Cerrado», separador «–» | franja de UNA franja (evita el separador `join` no testeado) |
| 12 | @s13 | `openingHoursSpecification` → undefined | builder schema.org: `GRUPOS_SCHEMA` (L-V agrupado, S, D omitido), `@type` inglés | — |
| 13 | @s12 | badge en el `dist/` real (build-based) → pasa con ancla positiva + sin badge | (característico: la DEMO no hornea badge) | regex tolerante a `data-rh` de Helmet |
| 14 | @s14 | JSON-LD horneado sin `openingHoursSpecification` | compone en `home.tsx` (spread + clave), SIN tocar `construirJsonLd` | — |

**REFACTOR global (barra verde):** `horaDePared` pasó de `.find(...)?.value ?? ''` (con fallback
INALCANZABLE → superviviente StringLiteral) a `Object.fromEntries(...map([type,value]))` sin fallo muerto.
Prettier aplicado a los dos ficheros nuevos.

## Trazabilidad @s → test

- **@s1** (puro, reloj inyectado, discriminador) → `horario.test.ts` «@s1 …sigue el ARGUMENTO» + determinismo.
- **@s2** (L-V semiabierto) → outline 6 filas (09:59/10:00/19:59/20:00/20:01/00:00).
- **@s3** (sábado corto + domingo cerrado) → outline 5 filas.
- **@s4** (DST CET/CEST) → outline 4 filas (10:30 y 19:30 en invierno y verano).
- **@s5** (excepción vacía cierra) → 2 tests (con y sin excepción).
- **@s6** (excepción abre domingo) → 2 tests (12:00 dentro, 16:00 fuera).
- **@s7** (`aMinutos`) → outline 5 filas (incl. 13:59→839).
- **@s8** (`parsearFranjas`) → 3 tests.
- **@s9** (`HORARIO_SEMANAL`) → outline L-V + sábado + domingo.
- **@s10** (excepciones `[]` honesta) → 3 tests (`[]`, festivo→abierto, editar→cierra).
- **@s11** (`horarioParaUI` 3 filas) → 1 test (toEqual exacto con «–» y «Cerrado»).
- **@s12** (sin badge en `/`) → `home-horneado.test.ts` (ancla positiva `<title>`+ld+json; sin «Abierto/Cerrado ahora»).
- **@s13** (`openingHoursSpecification`) → 3 tests (array, sin «Sunday», sin clave `openingHours`).
- **@s14** (compone en `home.tsx`) → `home-horneado.test.ts` (6 claves F-04 + array @s13 + sin `openingHours` + build exit 0).
- **@s15** (mutación: límites/comparador) → META-escenario: lo aseveran los SABOTAJES (abajo) + el `mutation_tester`.

## Sabotajes (docs/verification.md) — todos revertidos

1. cierre `<` → `<=` (semiabierto → cerrado-cerrado) ⇒ **@s2 20:00 + @s3 14:00 ROJO**.
2. apertura `>=` → `>` ⇒ **@s2 10:00 ROJO** (apertura inclusiva).
3. `aMinutos` `hora*60 + minuto` → `- minuto` ⇒ **@s7 13:59 ROJO** (las filas con minuto 0 no lo cazan).
4. `estaAbierto` ignora el argumento y lee `new Date()` ⇒ **@s1 ROJO** (reloj falso domingo 03:00 = cerrado ≠ abierto) + @s2/@s3/@s4/@s10 ROJO.
5. cortar la rama de excepciones (siempre semanal) ⇒ **@s5 + @s6 + @s10 ROJO**.
6. domingo deja de ser `[]` (no vacío) ⇒ **@s3 + @s9 + @s11 + @s13 ROJO** (el mutante de la lista vacía muere en presentación + schema.org, como avisa el contrato; en `abiertoEn` podría resistir).

## Estado y cuentas

- **`pnpm test`: 728 passed / 22 files** (desde 679 → +49: 43 `horario.test.ts` + 6 `home-horneado.test.ts`).
- **`pnpm typecheck`: 0** · **`pnpm lint` (eslint): 0** (sin warnings: la composición vive inline en `home.tsx`, no exportada → no dispara `react-refresh/only-export-components`).
- **`pnpm build`: exit 0 con las CINCO puertas** (cascarón, placeholders, contraste, terceros, anclas).
- **`seo.test.ts` (F-04, done): SIGUE VERDE (43)** — @s9 (6 claves exactas + `openingHoursSpecification` ausente en `construirJsonLd`) intacto.
- **`dist/index.html` REAL medido:** el JSON-LD hornea `openingHoursSpecification` [L-V agrupado 10:00–20:00, Sábado 10:00–14:00, Domingo OMITIDO], conserva las 6 claves de F-04, y **cero clave `openingHours`** (grep = 0).

## Confirmaciones al lead

- ✅ **NO se tocó `src/lib/seo.ts` ni `construirJsonLd`** (rompería el @s9 de F-04, done). `openingHoursSpecification`
  se COMPONE en el SITIO DE EMISIÓN `src/pages/home.tsx` (D4). La puerta de cascarón no colisiona:
  `'openinghoursspecification' !== 'openinghours'`.
- ✅ **NO se tocó `src/lib/site.ts` (F-02)**: `HORARIO` se LEE y PARSEA (D3), no se reescribe ni se duplica.
- ✅ **D1 respetado:** `estaAbierto` construido y testeado (para F-13) pero SIN badge horneado en la DEMO (@s12).
- ✅ **D5 respetado:** excepciones de producción `[]` (honesto, sin inventar festivos); la rama se ejercita con
  excepciones PASADAS POR EL TEST (@s5/@s6).
- Nota jsdom (I-8): el `<head>` horneado (title/JSON-LD) NO lo ve jsdom (Helmet corre en modo cliente y ni el
  contexto servidor ni `document.head` se poblan) → @s12/@s14 leen el `dist/` REAL por bytes (build-based),
  exactamente como pide el contrato («leído por bytes … readFileSync»).
- Pendiente: `judge` + `mutation_tester` (umbral 1.0, 0 exclusiones). NO se marca `done` ni se corrió Stryker.
