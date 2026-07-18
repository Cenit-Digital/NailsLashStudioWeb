# Review — feature 7 (`hero_marca`)

**Veredicto:** APPROVED

Juzgado por el `judge` el 2026-07-18, MIDIENDO (no fiandome del lead ni del craftsman). El review es el
juego entero: reproduje a mano los dos sabotajes que la revision adversarial predijo como bloqueantes
potenciales, sobre el HTML CRUDO de dist/ (readFileSync + string, JAMAS jsdom) y sobre la unica logica
mutable. Los dos MUERDEN. bin/harness init VERDE (661 tests). pnpm build exit 0 con las CINCO puertas.

## Alcance verificado
- Puerta humana confirmada por DOS vias: cabecera del .feature (APROBADO 2026-07-18) y
  feature_list.json seccion 7 status in_progress + campo puerta_humana (C-1..C-3, C-5, C-7 literales).
- Commit F-07 = 8726fdf. Toco SOLO: Hero.tsx, hero.module.scss, partir-nombre.ts + sus tests,
  home.tsx (6 lineas de cableado), home.test.tsx, stryker.config.json, la bitacora.
  A-27 CONFIRMADO: tools/puerta-placeholders.ts NO tocado (diff vacio).

## Cobertura de escenarios (@s -> test) — 15/15 implementables

- @s1  (base VISIBLE en SCSS): [x] hero-estilos.test.ts @s1 (x3: heroMarca clip-path inset(0 0 0 0),
  heroStudio opacity:1, ninguna base con opacity:0/clip-path recortante). MEDIDO en dist: base visible.
- @s2  (oculto SOLO en el 0%): [x] hero-estilos.test.ts @s2 (it.each paintReveal, fadeUp): lee 0% y 100%.
- @s3  (@media reduce{animation:none}): [x] hero-estilos.test.ts @s3. Presente en dist.
- @s4  (delay+duracion <= 1,2 s): [x] hero-estilos.test.ts @s4 (it.each heroMarca/heroStudio). El limite
  1,2 va A MANO; suma solo valores con unidad de tiempo (ignora el cubic-bezier) y exige >=2 tiempos (no
  esconde el delay). MEDIDO en SCSS y en dist: 1s+0,1s=1,1s y 0,9s+0,2s=1,1s <= 1,2 s.
- @s5  (dist crudo: nombre presente, sin ocultacion inline, sin observer): [x] hero.test.tsx @s5 (x4:
  nombre presente, no opacity:0/clip-path inline, no animation inline, no IntersectionObserver) +
  mi medicion directa de dist/index.html (ver Sabotajes).
- @s6  (UN h1, hijos span nunca div): [x] hero.test.tsx @s6 (x2 via cuantosH1) + home.test.tsx @s6
  (pagina) + puerta de cascaron en pnpm build. MEDIDO en dist: 1 h1, 2 span, 0 div.
- @s7  (nombre accesible Nails Lash Studio, text node de espacio REAL): [x] hero.test.tsx @s7 (x2:
  toHaveAccessibleName + estructural sobre bytes </span> <span, la anti-fragil). MEDIDO en dist: </span> <span.
- @s8  (sin text node -> Nails LashStudio, 16 — defecto prohibido): [x] hero.test.tsx @s8 (x2: literal
  a mano + bytes pegados). Caracterizacion del negativo.
- @s9  (titular --ink, nunca --accent/--brush como texto): [x] hero-estilos.test.ts @s9 (x3) + puerta de
  contraste en build. MEDIDO en dist CSS: ._titulo color:var(--ink), sin color:var(--accent), sin
  color:#C05576. MINIMO_DE_PARES sigue en 18 y la puerta reporta 18 pares (ni fila nueva ni rama 3:1).
- @s10 (eyebrow p, nunca heading, sin Facial): [x] hero.test.tsx @s10 (x3). MEDIDO en dist: p.eyebrow
  vacio, cero h2-h6 aportados por el hero, Facial ausente en toda la pagina.
- @s11 (h1+p SIN section no activa anclas F-06): [x] hero.test.tsx @s11 (x2 via seccionesNavegables REAL)
  + puerta de anclas en build. MEDIDO en dist: los 2 section son servicios/contacto (F-04); el hero suelto en main.
- @s12 (marca/tipo por lastIndexOf): [x] partir-nombre.test.ts @s12 (x2: dato real + Uno Dos Tres).
- @s13 (guarda corte < 0): [x] partir-nombre.test.ts @s13 (x2).
- @s15 (mutar la derivacion rompe un test): [x] cubierto por @s12/@s13/@s16 sobre partir-nombre.ts.
  partir-nombre.ts y Hero.tsx anadidos a mutate de stryker.config.json (verificado en el diff). El
  conjunto exacto lo MIDE el mutation_tester (no se predice).
- @s16 (particion corte===0, mata < -> <=): [x] partir-nombre.test.ts @s16 + mi sabotaje (ver abajo).
- @s14 @aplazado-f08: CONFIRMADO tagueado @aplazado-f08 y NO implementado (C-5: el bob depende de scroll;
  hoy no lo hay). NO cuenta como hueco.

## Sabotajes reproducidos por MI (no dependen de Stryker; arbol revertido con git checkout)

1. Mutante corte < 0 -> corte <= 0 (EqualityOperator, @s15 fila 5). Aplicado a mano a partir-nombre.ts:22
   y corrido partir-nombre.test.ts:
   - Resultado: 1 failed / 4 passed. Cae SOLO @s16 (input espacio+Studio: esperaba marca vacia, recibio
     espacio+Studio). @s13 (corte=-1) sigue VERDE. -> El superviviente que la revision predijo esta
     MUERTO: @s16 es el unico input que distingue la frontera, como afirma el contrato. NO es bloqueante.
2. animation HORNEADO INLINE en el titular (lo que la revision adversarial cazo: derrotaria el
   reduced-motion por especificidad). Meti un style con animation: paintReveal 4.8s .5s both en el h1 y
   corri hero.test.tsx:
   - Resultado: 1 failed / 14 passed. Cae la asercion @s5 "el titular NO lleva ningun animation HORNEADO
     INLINE". -> La prohibicion MUERDE. NO es bloqueante.
3. Medicion directa del HTML CRUDO de dist/index.html (readFileSync + string, jamas jsdom):
   h1._titulo > span._heroMarca "Nails Lash" + text node espacio + span._heroStudio "Studio" — UN h1,
   DOS span, CERO div, text node de espacio REAL (</span> <span), CERO style= en el h1 (-> cero
   animation/opacity:0/clip-path inline), nombre presente sin JS, sin IntersectionObserver, eyebrow p
   vacio, Facial ausente. CSS horneado: base visible + oculto solo en 0% + @media reduce{animation:none}.

## Disciplina TDD
- Produccion sin test que la pida? NO. partir-nombre.ts (guarda corte<0 exigida por @s13/@s16),
  hero.module.scss (cada regla exigida por @s1-@s4/@s9), Hero.tsx (h1+2 spans+espacio+eyebrow exigidos por
  @s5-@s11), cableado en home.tsx (@s6 a nivel de pagina). Bitacora con ciclos Rojo->Verde->Refactor y 3
  sabotajes documentados coherentes con lo que reproduje.
- Evidencia de Rojo->Verde->Refactor? SI (tabla de 14 ciclos en progress/tdd_hero_marca.md).
- Anti-tautologia: OK. NOMBRE se importa SOLO como ENTRADA; los esperados (Nails Lash/Studio/vacio, 1,2 s,
  --ink, 18) van a mano. perTest: todo calculo que ve al mutante (partirNombre(), renderToString(Hero))
  vive DENTRO del it; en los describe solo literales -> sin supervivientes falsos.

## Atribucion normativa
- Ninguna atribucion normativa falsa. El @media reduced-motion se declara CRITERIO DE PROYECTO (C-4), no
  obligacion WCAG. Los hits de "WCAG obliga"/"obligatorio" en los tests son las GUARDAS que PROHIBEN esa
  atribucion, no la cometen. NO hay numero LCP asertado como puerta unitaria: el LCP vive solo en
  comentarios como eje [NV]/verificacion EN VIVO (C-2). El "5 s" solo aparece en @s14 (aplazado) como
  literal de SC 2.2.2. El "ESCENARIO OBLIGATORIO" de @s5 se refiere a un escenario requerido, no a WCAG.

## Checkpoints
- C1 (arnes completo, bin/harness init exit 0): [x] — 661 tests verdes, lint/typecheck limpios.
- C2 (estado coherente, 1 sola in_progress): [x] — solo F-07 in_progress.
- C3 (arquitectura, sin deps nuevas, sin debug suelto): [x] — sin dependencias nuevas; paintReveal es CSS puro (cero asset).
- C4 (verificacion real, tests por modulo, aislamiento real): [x] — readFileSync real del SCSS/dist, sin mocks de FS.
- C5 (sesion bien cerrada): [x] — arbol limpio tras mis sabotajes; sin temporales sospechosos.
- C6 (Gherkin, mapa @s->test, sin produccion sin test): [x] — 15/15 mapeados; @s14 aplazado documentado.
- C7 (mutacion >= umbral 1.0): [ ] PENDIENTE del mutation_tester (puerta distinta; no la corro yo).

## Menores (NO bloqueantes)
1. @s5 unitario via renderToString, no readFileSync de dist/. El contrato pide "readFileSync + string"
   sobre el artefacto. Los tests usan renderToString (react-dom/server) como proxy fiel del prerender SSG
   (NO es jsdom), y el eje de bytes de dist/ queda cubierto por pnpm build + la bitacora + mi propia
   medicion de dist/index.html, que confirma todos los invariantes de @s5. Mitigado; no bloquea.
   Sugerencia para F-08+: un test que lea el artefacto de dist/ cerraria la letra.
2. Hero.tsx en mutate sin logica mutable propia. Es correcto tenerlo (contrato A8: lista explicita,
   riesgo de verde-por-vacuidad si falta), pero rendira 0/~0 mutantes; la cobertura de mutacion REAL vive
   en partir-nombre.ts (@s12/@s13/@s16). Aviso para el mutation_tester: confirmar 100% en partir-nombre.ts
   (todos los mutantes @s15 muertos) y que un 0/0 en Hero.tsx no enmascara nada.

## Cambios requeridos
Ninguno. La feature esta lista para la puerta de mutacion.

---

# APÉNDICE — Review de @s17 (acceptance 7, AMPLIACIÓN 2026-07-18): la tipografía de marca del titular

**Veredicto:** APPROVED

Juzgado por el `judge` el 2026-07-18 (segunda ronda, TRAS la ampliación de la puerta humana). Reviso
SOLO `@s17` y confirmo NO-REGRESIÓN en lo ya aprobado. Reproduje a mano el sabotaje que predice el
contrato (sobre el SCSS, `readFileSync`+string, jamás jsdom): MUERDE. `pnpm test` 664 verde,
`typecheck`/`lint` 0, `pnpm build` exit 0 con las CINCO puertas. Árbol restaurado al estado en revisión.

## Puerta humana confirmada (DOS vías)
- `features/hero_marca.feature`: cabecera «APROBADO POR LA PUERTA HUMANA EL 2026-07-18» + bloque `@s17`
  (líneas 451-468) con «Este escenario NACE APROBADO... no lleva ninguna marca de pendiente».
- `feature_list.json` §7: `status: in_progress`, `acceptance[6]` (el 7º) = la tipografía de marca, y
  campo `puerta_humana` con «AMPLIACION 2026-07-18 ... El humano aprobo arreglarlo en F-07».

## Cobertura de escenarios (@s17 ↔ test)
- @s17: [x] cubierto por `src/components/hero-estilos.test.ts` › describe `@s17` (3 `it`):
  1. `.heroMarca` declara `font-family: 'Great Vibes', cursive` — regex a mano
     `/font-family\s*:\s*['"]Great Vibes['"]\s*,\s*cursive/` (hero-estilos.test.ts:266-269).
  2. `.heroStudio` declara `font-family: 'Manrope', sans-serif` — regex a mano
     `/font-family\s*:\s*['"]Manrope['"]\s*,\s*sans-serif/` (hero-estilos.test.ts:271-274).
  3. NINGUNA de las dos se queda SIN `font-family` (presencia explícita, hero-estilos.test.ts:276-283).
  → Aseveradas LAS DOS reglas (Great Vibes+cursive y Manrope+sans-serif), leyendo el `.module.scss`
  con `reglaBase()` (la regla BASE del elemento, NUNCA la del `@media` — verificado: el regex
  `\.heroMarca\s*\{` no casa el `.heroMarca,` del @media; el `.heroStudio {` base está antes del @media
  → `cuerpoDelBloque` devuelve la base).

## El test MUERDE (no es vacuo) — sabotaje reproducido por MÍ
- Reproduje el SABOTAJE A del `tdd_craftsman`: quité `font-family: 'Great Vibes', cursive;` de
  `.heroMarca` en `hero.module.scss` y corrí `hero-estilos.test.ts` → **2 failed | 12 passed**: cayeron
  el `it` específico de Great Vibes Y el de presencia; el de Manrope siguió VERDE (discrimina cuál
  falta). Revertido. Confirma la bitácora (`progress/tdd_hero_marca.md`, SABOTAJE A/B): el test muerde
  por CADA declaración por separado.
- Nota de higiene: el `git checkout` con que revertí el sabotaje clobberó también las 2 líneas
  `font-family` que el `tdd_craftsman` había entregado SIN commitear; las restauré al byte exacto
  (blob `a1794d9`, idéntico al del diff en revisión) y re-verifiqué `hero-estilos.test.ts` = 14 passed.
  Árbol final = los 6 ficheros en revisión, nada más.

## Implementación == acceptance
- `src/components/hero.module.scss` regla base `.heroMarca` (línea 28): `font-family: 'Great Vibes', cursive;`.
  Regla base `.heroStudio` (línea 34): `font-family: 'Manrope', sans-serif;`. Las dos EN LA HOJA.
- Los nombres de familia CASAN con los `@font-face` de F-05: `Great Vibes` (400) y `Manrope` (400-700),
  confirmados en `src/lib/puerta-terceros.test.ts:631,636` y en `src/main.tsx:22` («Great Vibes 400 (el
  «Nails Lash» del hero)»). `Great Vibes` sin comillas en el CSS horneado casa con `'Great Vibes'` del
  @font-face (misma familia). El eyebrow ya usaba `'Manrope'` (línea 13) — coherente.

## Anti-tautología
- Los literales `'Great Vibes'`, `cursive`, `'Manrope'`, `sans-serif` van ESCRITOS A MANO en el test,
  NO importados. El fichero de test importa SOLO `MATRIZ_DE_USO, MINIMO_DE_PARES` de `puerta-contraste`;
  la única mención a `site.ts` es un COMENTARIO (línea 262), no un `import`. Como el 1,2 s de @s4.

## Nada de más (alcance) — `git --no-pager diff`
- SOLO: `src/components/hero.module.scss` (+2 líneas `font-family`), `src/components/hero-estilos.test.ts`
  (+1 describe `@s17`, 3 `it`), y docs de contrato/progreso (`feature_list.json` acceptance[6]+puerta_humana,
  `features/hero_marca.feature` bloque @s17, `progress/gherkin_hero_marca.md`, `progress/tdd_hero_marca.md`).
- CERO cambios en `Hero.tsx`, `partir-nombre.ts`, otros escenarios, o F-01..F-06. No hay producción que
  ningún test exija: las 2 líneas del SCSS las pide @s17.

## Coherencia de método (NO es hueco)
- @s17 lee el SCSS igual que @s1/@s3/@s9 (Stryker no ve CSS → lo aseveran el test que LEE el SCSS + la
  puerta humana). El eje [NV] «qué fuente PINTA el navegador» (`document.fonts.check('142px "Great
  Vibes"')` + `font-family` computado del `<span>`) queda para la RE-VERIFICACIÓN EN VIVO con Chrome del
  lead, mismo estatuto que el número LCP de C-2. Correcto, no es un hueco.

## Sin regresión
- `pnpm typecheck` → 0 errores. `pnpm lint` → 0 warnings.
- `pnpm test` → **664 passed** (19 ficheros) — la cuenta esperada.
- `pnpm build` → **exit 0** con las CINCO puertas (cascarón, placeholders, contraste 18 pares, terceros
  6 pares de fuente autohospedados, anclas). El CSS de `dist/` hornea las dos `font-family` (verificado
  vía build; la bitácora lo midió sobre los bytes: `font-family:Great Vibes,cursive` /
  `font-family:Manrope,sans-serif`).
- Los 15 escenarios previos siguen VERDES e INTACTOS (`hero-estilos.test.ts` 14 passed; suite 664).

## Checkpoints
- C1 (arnés, build exit 0): [x] — 664 verde, typecheck/lint limpios, build 5 puertas.
- C2 (1 sola in_progress): [x] — solo F-07.
- C3 (arquitectura, sin deps nuevas): [x] — 2 líneas de CSS, cero asset, cero dependencia.
- C4 (verificación real): [x] — `readFileSync` real del SCSS; sabotaje reproducido por mí.
- C5 (sesión bien cerrada): [x] — árbol restaurado al estado en revisión (6 ficheros, mismos blobs).
- C6 (Gherkin, mapa @s→test, sin producción sin test): [x] — @s17 mapeado; 16/16 implementables cubiertos.
- C7 (mutación ≥ umbral 1.0): [ ] PENDIENTE del `mutation_tester` (@s17 no aporta lógica mutable: el
  SCSS no lo ve Stryker; la cobertura de mutación sigue en `partir-nombre.ts`). Puerta distinta.

## Menores (NO bloqueantes)
1. El tercer `it` (presencia `/font-family\s*:/`) está subsumido para COBERTURA por los dos asertos
   específicos (si `.heroMarca` casa `'Great Vibes', cursive`, obviamente tiene `font-family:`). No es
   defecto: aporta un mensaje de fallo más claro para «falta del todo» y sirvió para discriminar en el
   sabotaje. Se queda; solo lo anoto.
2. Seguimiento (NO de este gate): la RE-VERIFICACIÓN EN VIVO con Chrome del titular pintando Great Vibes
   (`document.fonts.check` === true + `font-family` computado resuelto a "Great Vibes") la debe cerrar el
   lead tras esta aprobación — es el eje [NV]/C-2, fuera de la puerta unitaria del `judge`.

## Cambios requeridos
Ninguno. `@s17` APROBADO. Sin bloqueantes. Lista para la puerta de mutación.
