# Diario — hero caligráfico (DEMO), 2026-07-20

Contrato: `features/hero.feature`. Diagnóstico y mediciones:
`progress/hallazgos_hero_caligrafia.md`. Veredicto: `progress/judge_hero_caligrafia.md`.

## Desviación de proceso — DECLARADA, no disimulada

**Esto NO se hizo por TDD estricto (Rojo → Verde → Refactor), y el `craftsman_lead` editó `src/`
directamente**, contra la regla dura de `CLAUDE.md`. El porqué: las dos quejas eran **defectos
visuales cuya causa solo se podía establecer MIDIENDO en un navegador real** (`TextMetrics` sobre la
página viva, el canal alfa del PNG, la transformada de distancia sobre el rótulo rasterizado). Un
`tdd_craftsman` a ciegas habría escrito tests sobre una causa supuesta.

El orden real fue: **medir → validar la técnica empíricamente en Chrome → implementar → escribir los
tests → puertas independientes**. Las puertas que SÍ se respetaron, y que son las que atrapan el
resultado: `judge` (rechazó, ver abajo) y `mutation_tester`. Queda anotado para que nadie lea el
verde como si viniera de TDD.

## Mapa escenario ↔ test

| Escenario                  | Dónde se asevera                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| @s1 recorte                | `hero.test.tsx` → «@s1 el viewBox ENCIERRA la tinta real» (4 tests) · `hero-estilos.test.ts` → «@s1 ya NO queda ningún clip-path» |
| @s2 trazo + coherencia     | `hero.test.tsx` → máscara + `pathLength="100"` + 1 subtrazo + `isPointInStroke` (frente único) · `hero-estilos.test.ts` → dasharray en unidades de usuario |
| @s3 la punta, no el frasco | `hero.test.tsx` → «@s3 la PUNTA del aplicador» (4 tests)                                                                          |
| @s4 duración y orden       | `hero-estilos.test.ts` → cota ≤ 4,5 s + «STUDIO entra cuando la marca ya está escrita»                                            |
| @s5 movimiento reducido    | `hero-estilos.test.ts` → @s3 del `@media` + `@demo` display:none                                                                  |
| @s6 accesibilidad          | `hero.test.tsx` → @s6/@s7/@s8 (F-07) + «NO duplica el nombre»                                                                     |
| @s7 sin JS                 | `hero.test.tsx` → @s5 (F-07), sobre el HTML del prerender                                                                         |
| @s8 cero terceros          | `hero.test.tsx` → href local o `data:`, nunca http · puerta F-05 del build                                                        |
| @s9 responsive             | `hero-estilos.test.ts` → «@s9 el <svg> mide en em el ancho de su viewBox» (3 tests)                                               |

## Lo que cazó el `judge` (rechazo, y con razón)

Los cuatro bloqueantes eran REALES. Los tres primeros están corregidos:

- **B-1 — el recorte no tenía puerta.** La región del `<mask>` iba como cuatro literales duplicados
  del `viewBox`. El judge saboteó `VISTA_MARCA` con **la caja exacta que secciona la «N» y la «h»**
  (`'0 -840 3895 1200'`) y **los 47 tests siguieron verdes**. _Arreglado_: la máscara se DERIVA del
  viewBox (una sola fuente de verdad) y se añadió la puerta que faltaba — que el viewBox ENCIERRE
  la tinta medida (−15,6 → 3965,3 ‰), con margen mínimo de 40‰ por los cuatro lados.
- **B-2 — `width: 4.12em` sin ningún test.** Sabotaje a `40em` en verde. _Arreglado_: 3 tests
  nuevos sobre `.rotulo`, incluido el de que NO vuelva el `max-width: 100%` que colapsaba el hero.
- **B-3 — violación de contrato YA PUBLICADA.** «STUDIO» arrancaba a 3,7 s cuando el trazo
  terminaba a 4,0 s: entraba **0,3 s antes** de que la marca estuviera escrita, que es justo lo que
  @s4 prohíbe — y el comentario del SCSS afirmaba lo contrario. _Arreglado_: el trazo pasa a 3,6 s
  (termina en 3,7 s) y «STUDIO» entra exactamente en 3,7 s; total 4,3 s ≤ 4,5 s. Y ahora hay un test
  que compara los dos relojes.
- **B-4 — faltaba este diario.** _Arreglado_: es este fichero.

**Addendum del judge, y el error era mío**: borré `src/assets/brush.png` por creerlo huérfano, pero
es el ORIGEN del que `tools/trazo-marca/aplicador.mjs` regenera el aplicador. _Restaurado._

## Riesgo conocido y ACEPTADO: Great Vibes y `font-display: swap`

`@fontsource` emite `font-display: swap`. Mientras la fuente carga —o para siempre si fallara—, el
`<text>` del SVG cae al genérico `cursive` y **la máscara, calculada para Great Vibes, revela
regiones que no encajan**. El nombre accesible sobrevive (vive en el `<h1>`, no en el SVG), pero
visualmente sería peor que el bug original. Mitiga que la fuente va **autohospedada** y es lo
primero que pide la página. Si molestara en la demo, la salida es vectorizar «Nails Lash» a `<path>`
con las herramientas de `tools/trazo-marca/` y dejar de depender de la fuente en tiempo de pintado.

## B-5 — INCOHERENCIA DEL REVELADO (cazada EN VIVO tras el primer push, y arreglada)

Durante la verificación en vivo (rasterizando el fotograma a PNG y leyéndolo, porque la ventana
estaba minimizada) salió un **bug que TODOS los tests y el build daban por bueno**:

**En SVG, el `stroke-dasharray` SE REINICIA en cada `M` (subtrazo).** El trazo tenía 5 subtrazos
(las 5 plumadas), así que la máscara revelaba **las 5 plumadas A LA VEZ** (cada una a su 55 %)
mientras el aplicador estaba en un solo punto. Es decir: la tinta aparecía por toda la palabra a la
vez y el pincel no era su frente → **exactamente la incoherencia que Pablo reportó.**

Cómo se verificó (no se dedujo): prueba controlada con un path de dos subtrazos y dash al 50 % →
los DOS se pintaron enteros, no solo el primero. Y sobre el elemento vivo, `isPointInStroke`
confirmó que «ash» (última plumada) estaba revelada al 40 % mientras «N» aún no.

**Por qué mi test de sincronía numérica (punta↔tinta < 0,12 px) NO lo cazó**: comparaba un modelo
CONTINUO (la punta) contra otro modelo continuo (la fracción revelada calculada del dashoffset),
los dos coherentes entre sí. Nunca miró el RENDER real de la máscara. Lección: para un revelado,
verificar el píxel, no el modelo. Ahora hay un test (`@s2` en `hero.test.tsx`) que interroga el
render con `isPointInStroke`.

**El arreglo**: UN solo subtrazo continuo. Los `M` interiores pasan a `L` (las plumadas se unen por
«viajes de pluma» por hueco vacío). El dash revela entonces un único frente en orden de escritura y
la punta va siempre a su cabeza. Verificado en vivo con el path real: al 45 %, «Nails» escrito y el
aplicador viajando hacia «Lash» con nada a su derecha. La cobertura de tinta no cambia (los viajes
son por hueco vacío). Corregido en `tools/trazo-marca/derivar.html` (reproducible) y regenerado
`src/lib/trazo-marca.ts` (ahora 1 `M`).

## Estado

- 883 tests verdes · typecheck 0 · lint 0 · 5 puertas del `pnpm build` verdes.
- **Verificación EN VIVO con Chrome HECHA** (rasterizando fotogramas a PNG, porque la ventana estaba
  minimizada): recorte resuelto (la tinta no toca ningún borde), sincronía punta↔tinta < 0,12 px,
  STUDIO entra al terminar la marca, y —tras B-5— revelado coherente de frente único.
- Mutación de `Hero.tsx`: **100 %** tras el arreglo (0 supervivientes de 11). ⚠️ Todos por _timeout_,
  no por aserción — evidencia más débil (lo señaló el judge); es un rasgo de estos tests de render
  pesados bajo Stryker, no un hueco: 0 supervivientes = todos los mutantes detectados.
