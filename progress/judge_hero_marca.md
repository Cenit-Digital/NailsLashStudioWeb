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
