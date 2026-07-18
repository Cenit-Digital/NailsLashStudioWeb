# TDD — F-07 `hero_marca` (`tdd_craftsman`)

Feature en curso: **7 — hero_marca** (`in_progress`, puerta humana APROBADA 2026-07-18).
Contrato: `features/hero_marca.feature` (16 escenarios; **`@s14` `@aplazado-f08` NO se implementa** — C-5).

**Puerta verificada por mí:** cabecera del `.feature` = «APROBADO POR LA PUERTA HUMANA EL 2026-07-18»
**Y** `feature_list.json` §7 `status: in_progress` + campo `puerta_humana`. Las dos cuadran → adelante.

Estado: **15/15 escenarios implementables cubiertos. Suite 629 → 661 (+32). typecheck/lint/build OK.**
NO marco `done` (espera al `judge` y al `mutation_tester`).

## Piezas construidas (por TDD)
- `src/lib/partir-nombre.ts` — la ÚNICA lógica mutable: `partirNombre(nombre)` por `lastIndexOf(' ')`
  con guarda `corte < 0`. (@s12/@s13/@s16, mutantes @s15).
- `src/components/Hero.tsx` — el h1 (dos `<span>` + text node `{' '}` REAL) + eyebrow `<p>` vacío
  (contenido aplazado a F-09). Reemplaza el `<h1>{NOMBRE}</h1>` de F-04 en `home.tsx` (sigue UN h1).
- `src/components/hero.module.scss` — base VISIBLE + oculto SOLO en el 0% + `@media reduce` +
  duración ≤1,2s total + `--ink`. NUNCA inline. (@s1..@s4, @s9).
- `stryker.config.json` — añadidos `src/lib/partir-nombre.ts` y `src/components/Hero.tsx` a `mutate`
  (lista explícita). `vitest.config.ts` YA los cubre por glob desde F-06 → NO se toca.

Ficheros de test: `src/lib/partir-nombre.test.ts` (5), `src/components/hero-estilos.test.ts` (11),
`src/components/hero.test.tsx` (15), `src/pages/home.test.tsx` (+1 @s6 a nivel de página).

---

## Ciclos Rojo → Verde → Refactor

| # | @s | ROJO (test que falla) | VERDE (cambio mínimo) |
| - | -- | --------------------- | --------------------- |
| 1 | @s12 | `partir-nombre.test.ts` importa `partirNombre` inexistente → import falla | `partir-nombre.ts`: `lastIndexOf(' ')` + slice, SIN guarda (aún no exigida) |
| 2 | @s13 | «Estudio» → sin guarda da marca «Estudi», tipo «Estudio» | añadir guarda `corte < 0` → marca=nombre, tipo='' |
| 3 | @s16 | (verde contra código correcto) — **SABOTAJE**: guarda `<= 0` pone SOLO @s16 rojo, @s13 NO | guarda `< 0` (ya presente); @s16 fija la partición corte===0 |
| 4 | @s1 | `hero-estilos.test.ts` lee SCSS inexistente → ENOENT | `hero.module.scss`: `.heroMarca{clip-path:inset(0 0 0 0)}` `.heroStudio{opacity:1}` |
| 5 | @s2 | no hay `@keyframes` | añadir keyframes `paintReveal`/`fadeUp` (oculto SOLO en 0%) |
| 6 | @s3 | no hay `@media reduce` | añadir `@media (prefers-reduced-motion: reduce){ animation:none }` |
| 7 | @s4 | las reglas base no declaran `animation` | añadir `animation` acotado: paintReveal 1s+0.1s=1.1s, fadeUp 0.9s+0.2s=1.1s (**SABOTAJE**: 5,3s → rojo) |
| 8 | @s9 | `.titulo` no declara color | añadir `.titulo{color:var(--ink)}` |
| 9 | @s6 | `hero.test.tsx` importa `Hero` inexistente | `Hero.tsx`: h1 + dos spans (pegados, sin eyebrow aún) |
| 10 | @s7 | spans pegados: falta el espacio (`</span><span`) | insertar text node `{' '}` REAL entre los spans |
| 11 | @s8 | (caracterización del negativo, como @s32 de F-04) | asevera estructuralmente que pegados → «Nails LashStudio» (16) |
| 12 | @s10 | no hay eyebrow `<p>` | añadir `<p className={estilos.eyebrow} />` (vacío; contenido F-09) |
| 13 | @s5 | (verde contra código correcto) — **SABOTAJE**: `style="animation:…;opacity:0;clip-path:…"` inline pone @s5 rojo | animación en la HOJA, cero inline (ya así) |
| 13b | @s11 | (verde) — `seccionesNavegables(hero)=[]`, sin `<section>` | hero es fragmento `h1+p`, sin `<section>` |
| 14 | @s6 (página) | `home.test.tsx`: la home no hornea el hero (h1 sin spans) | cablear `<Hero />` en `home.tsx` reemplazando `<h1>{NOMBRE}</h1>` |

**REFACTOR (en verde):** helpers de parsing SCSS (`cuerpoDelBloque` por conteo de llaves, robusto a
prettier), `it.each` para los outlines de @s2/@s4/@s8. Nombres reveladores, sin números mágicos (el
límite 1,2 s, «Nails Lash Studio», el 18 de `MINIMO_DE_PARES` van A MANO). `prettier --write` sobre
los 4 ficheros que lo pedían; los `.scss`/regex sobrevivieron (no reformateados).

### Verificaciones por SABOTAJE (método docs/verification.md — no dependen de Stryker)
- **@s16**: guarda mutada `< 0 → <= 0` → SOLO @s16 rojo (1 failed), @s13 (corte=-1) sigue verde.
  Confirma que @s16 es el ÚNICO que mata ese EqualityOperator (@s15 fila 5).
- **@s4**: `paintReveal 4.8s … .5s both` (los ~5,3s del prototipo) → @s4 rojo. La cota muerde.
- **@s5**: `style="animation:…;opacity:0;clip-path:inset(0 100% 0 0)"` inline en el h1 → 2 asertos
  de @s5 rojos. La prohibición de ocultación inline muerde.

### «Verde ≠ funciona» (I-8) — sobre los BYTES del `dist/` REAL tras `pnpm build`
`<main><p class="_eyebrow_…"></p><h1 class="_titulo_…"><span class="_heroMarca_…">Nails Lash</span>`
`<span class="_heroStudio_…">Studio</span></h1>` — medido con `readFileSync`+string (jamás jsdom):
UN h1 · nombre PRESENTE sin JS · dos spans · espacio REAL `</span> <span` · sin `<div>` · **cero
`animation`/`opacity:0`/`clip-path` inline** · sin `IntersectionObserver` · eyebrow `<p>`. El CSS
horneado: `._heroMarca{clip-path:inset(0 0 0 0);animation:_paintReveal 1s cubic-bezier(.5,0,.25,1)
.1s both}`, `._heroStudio{opacity:1;animation:_fadeUp .9s .2s both}`, `@keyframes` + `@media
prefers-reduced-motion: reduce{ animation:none }` presentes. La animación vive en la HOJA, no inline.

---

## Trazabilidad @s → test

- **@s1** (base VISIBLE en SCSS) → `hero-estilos.test.ts` › @s1 (×3: heroMarca clip-path, heroStudio
  opacity:1, ninguna base con opacity:0/clip-path recortante).
- **@s2** (oculto SOLO en el 0%) → `hero-estilos.test.ts` › @s2 (it.each: paintReveal, fadeUp).
- **@s3** (`@media reduce{animation:none}`) → `hero-estilos.test.ts` › @s3.
- **@s4** (delay+duración ≤ 1,2 s) → `hero-estilos.test.ts` › @s4 (it.each: heroMarca, heroStudio) +
  SABOTAJE.
- **@s5** (dist crudo: nombre presente, sin ocultación inline, sin observer) → `hero.test.tsx` › @s5
  (×4) + SABOTAJE + verificación sobre los BYTES de `dist/` (eje [NV]/en-vivo cubierto por el build).
- **@s6** (UN h1, hijos `<span>` nunca `<div>`) → `hero.test.tsx` › @s6 (×2, vía `cuantosH1`) +
  `home.test.tsx` › @s6 (página: 1 h1 tras cablear) + puerta de cascarón en `pnpm build`.
- **@s7** (nombre accesible «Nails Lash Studio», text node de espacio) → `hero.test.tsx` › @s7 (×2:
  `toHaveAccessibleName` + estructural sobre bytes, la anti-frágil).
- **@s8** (sin text node → «Nails LashStudio», 16) → `hero.test.tsx` › @s8 (×2: nombre pegado a mano
  + bytes pegados). Caracterización del negativo.
- **@s9** (titular con `--ink`, nunca `--accent`/`--brush`) → `hero-estilos.test.ts` › @s9 (×3:
  `.titulo` color --ink, sin --accent/--brush/#C05576 como texto, par --ink/--bg en MATRIZ_DE_USO +
  MINIMO_DE_PARES=18) + puerta de contraste en `pnpm build` (18 pares, sin fila nueva).
- **@s10** (eyebrow `<p>`, nunca heading, sin «Facial») → `hero.test.tsx` › @s10 (×3).
- **@s11** (h1+p sin `<section>` no activa anclas F-06) → `hero.test.tsx` › @s11 (×2, vía
  `seccionesNavegables` REAL) + puerta de anclas en `pnpm build`.
- **@s12** (marca/tipo por `lastIndexOf`) → `partir-nombre.test.ts` › @s12 (×2: dato real + «Uno Dos
  Tres»).
- **@s13** (guarda `corte < 0`) → `partir-nombre.test.ts` › @s13 (×2).
- **@s16** (partición corte===0, mata `< → <=`) → `partir-nombre.test.ts` › @s16 (×1) + SABOTAJE.
- **@s15** (mutar la derivación rompe un test) → cubierto por @s12/@s13/@s16 sobre `partir-nombre.ts`;
  `partir-nombre.ts` y `Hero.tsx` añadidos a `mutate` de `stryker.config.json`. **El conjunto exacto
  de mutantes lo MIDE el `mutation_tester`** (no se predice). Mapa esperado (tabla del contrato):
  StringLiteral `' '→''` → @s12 · slice índices → @s12 · negar/forzar guarda → @s13 · `< → <=` → @s16.
  Si un mutante RESISTE: ESCALAR al humano (umbral 1.0, 0 exclusiones), NO excluir ni bajar el umbral.
- **@s14** `@aplazado-f08` — **NO implementado** (C-5: el `bob` depende de scroll; hoy no lo hay).

## Verificación final
- `pnpm typecheck` → 0 errores. `pnpm lint` → 0 warnings. Mis ficheros F-07 prettier-limpios.
- `pnpm test` → **661 passed** (629 → 661, +32), 19 ficheros.
- `pnpm build` → **exit 0** con las CINCO puertas (cascarón, placeholders, contraste 18 pares,
  terceros, anclas).
- **NO** corrí Stryker (lo hace el `mutation_tester`). **NO** usé Chrome (la verificación EN VIVO —
  LCP real, clip-path vs LCP, reduced-motion, reflow 320px — la hace el lead tras esta entrega, C-2).

---

# APÉNDICE — @s17 (acceptance 7, AMPLIACIÓN 2026-07-18): la tipografía de marca del titular

**Puerta verificada por mí (de nuevo, antes de tocar nada):**
- `features/hero_marca.feature` línea 6 = «✅✅ APROBADO POR LA PUERTA HUMANA EL 2026-07-18». `@s17`
  presente (líneas 451-468) y línea 448 = «Este escenario NACE APROBADO... no lleva ninguna marca de
  pendiente».
- `feature_list.json` §7 = `status: "in_progress"` + `puerta_humana` con «AMPLIACION 2026-07-18... el
  titular NO usaba Great Vibes... El humano aprobo arreglarlo en F-07».
- Las dos cuadran → adelante. **El resto de F-07 (16 escenarios previos) NO se toca**: solo se añaden
  DOS declaraciones `font-family` al SCSS y UN describe de test.

**Bug verificado por mí:** en `hero.module.scss`, las reglas base `.heroMarca` (líneas 27-30) y
`.heroStudio` (líneas 34-37) NO declaraban `font-family` → HEREDABAN la del cuerpo → el titular salía
en la fuente por defecto del UA («Times New Roman»), NO en Great Vibes. Los `@font-face` de Great
Vibes y Manrope YA están horneados por F-05 (`src/main.tsx:36-41`); el hero simplemente no los pedía.
Nombres REALES de familia confirmados en `src/lib/puerta-terceros.test.ts:631,636`: `Manrope` y
`Great Vibes`. El eyebrow ya usaba `font-family: 'Manrope', system-ui, sans-serif` (línea 13) — el
titular no.

## Ciclo Rojo → Verde → Refactor

| @s | ROJO (test que falla) | VERDE (cambio mínimo) |
| -- | --------------------- | --------------------- |
| @s17 | 3 asertos nuevos en `hero-estilos.test.ts` (Great Vibes en `.heroMarca`, Manrope en `.heroStudio`, presencia de `font-family` en ambas) → ROJOS contra el SCSS actual sin `font-family`. Confirmado: **3 failed \| 11 passed** | `.heroMarca { font-family: 'Great Vibes', cursive; ... }` y `.heroStudio { font-family: 'Manrope', sans-serif; ... }`. NADA MÁS (no toqué clip-path/opacity/animation/@keyframes/@media). Confirmado: **14 passed** |

- **REUTILICÉ** el helper existente `reglaBase(clase)` (línea 61): devuelve el cuerpo de la regla base
  `.heroMarca {`/`.heroStudio {`, NUNCA la del `@media` (allí es `.heroMarca,` → el regex `\.heroMarca\s*\{` no casa).
- **Anti-tautología:** los literales `'Great Vibes'`, `cursive`, `'Manrope'`, `sans-serif` van A MANO
  en el test, NO importados de `site.ts` ni de ningún símbolo (como el 1,2 s de @s4).
- **Regex robusta** a comillas simples/dobles y whitespace de prettier:
  `/font-family\s*:\s*['"]Great Vibes['"]\s*,\s*cursive/` y `/font-family\s*:\s*['"]Manrope['"]\s*,\s*sans-serif/`.
- **REFACTOR (en verde):** `prettier --write` sobre `hero.module.scss` y `hero-estilos.test.ts` →
  **ambos `unchanged`** (las comillas simples y las regex sobreviven; el eyebrow ya usaba `'Manrope'`
  con comillas simples y sobrevivió igual). Nombres reveladores, sin números mágicos.

## Trazabilidad @s17 → test

- **@s17** (el SCSS PIDE Great Vibes en `.heroMarca` y Manrope en `.heroStudio`, con fallback
  genérico, ninguna sin declararla) → `hero-estilos.test.ts` › describe `@s17` (×3):
  1. `.heroMarca` declara `font-family: 'Great Vibes', cursive`,
  2. `.heroStudio` declara `font-family: 'Manrope', sans-serif`,
  3. NINGUNA de las dos se queda SIN `font-family` (presencia explícita — el fallo cazado en vivo).
- El eje [NV] «qué fuente PINTA el navegador» (`document.fonts.check('142px "Great Vibes"')` y el
  `font-family` computado del `<span>`) lo RE-VERIFICA el lead EN VIVO con Chrome, NO este test
  (jsdom no carga @font-face [V]). PROHIBIDO fingirlo con jsdom.

## Verificaciones por SABOTAJE (método docs/verification.md — no dependen de Stryker)

- **SABOTAJE A:** quitar `font-family` de `.heroMarca` → **2 asertos de @s17 ROJOS** (el específico de
  Great Vibes + el de presencia); el de Manrope sigue verde. Revertido.
- **SABOTAJE B:** quitar `font-family` de `.heroStudio` → **2 asertos de @s17 ROJOS** (el específico de
  Manrope + el de presencia); el de Great Vibes sigue verde. Revertido.
- Conclusión: el test MUERDE por CADA declaración por separado (asertos específicos discriminan cuál
  falta; el aserto de presencia cubre la ausencia de cualquiera de las dos). Tras revertir: **14 passed**.

## «Verde ≠ funciona» (I-8) — sobre los BYTES del CSS de `dist/` REAL tras `pnpm build`

`._heroMarca_1y2fi_11{font-family:Great Vibes,cursive;clip-path:inset(0 0 0 0);animation:_paintReveal_1y2fi_1 1s cubic-bezier(.5,0,.25,1) .1s both}`
`._heroStudio_1y2fi_17{font-family:Manrope,sans-serif;opacity:1;animation:_fadeUp_1y2fi_1 .9s .2s both}`
— medido con `grep` sobre `dist/assets/app-*.css` (bytes, jamás jsdom): las DOS `font-family` viajan
horneadas → el navegador AHORA pide Great Vibes / Manrope (antes heredaba «Times New Roman»). El
`@media (prefers-reduced-motion: reduce){ animation:none }` sigue intacto; no toqué nada de @s1..@s4.

## Verificación final

- `pnpm typecheck` → **0 errores**.
- `pnpm lint` → **0 warnings**.
- `pnpm test` → **664 passed** (661 → 664, **+3** por @s17), 19 ficheros.
- `pnpm build` → **exit 0** con las CINCO puertas (cascarón, placeholders, contraste 18 pares,
  terceros [6 pares de fuente autohospedados], anclas).
- **NO** corrí Stryker (lo hace el `mutation_tester`; el SCSS NO lo ve Stryker → @s17 se asevera por
  el test que LEE el SCSS + la puerta humana, como @s1/@s3/@s9). **NO** usé Chrome (la RE-VERIFICACIÓN
  EN VIVO — `document.fonts.check` + `font-family` computado del titular — la hace el lead, eje [NV]).
- **NO** marqué `done` en `feature_list.json` (espera al `judge` y al `mutation_tester`).
- Ficheros tocados en esta ampliación: `src/components/hero.module.scss` (+2 líneas `font-family`) y
  `src/components/hero-estilos.test.ts` (+1 describe `@s17`, 3 `it`). Nada más.
