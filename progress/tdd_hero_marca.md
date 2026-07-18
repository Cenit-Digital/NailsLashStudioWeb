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
