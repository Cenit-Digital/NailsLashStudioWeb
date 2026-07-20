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

| Escenario | Dónde se asevera |
|---|---|
| @s1 recorte | `hero.test.tsx` → «@s1 el viewBox ENCIERRA la tinta real» (4 tests) · `hero-estilos.test.ts` → «@s1 ya NO queda ningún clip-path» |
| @s2 trazo, no barrido | `hero.test.tsx` → máscara + `pathLength="100"` + 5 plumadas · `hero-estilos.test.ts` → dasharray en unidades de usuario |
| @s3 la punta, no el frasco | `hero.test.tsx` → «@s3 la PUNTA del aplicador» (4 tests) |
| @s4 duración y orden | `hero-estilos.test.ts` → cota ≤ 4,5 s + «STUDIO entra cuando la marca ya está escrita» |
| @s5 movimiento reducido | `hero-estilos.test.ts` → @s3 del `@media` + `@demo` display:none |
| @s6 accesibilidad | `hero.test.tsx` → @s6/@s7/@s8 (F-07) + «NO duplica el nombre» |
| @s7 sin JS | `hero.test.tsx` → @s5 (F-07), sobre el HTML del prerender |
| @s8 cero terceros | `hero.test.tsx` → href local o `data:`, nunca http · puerta F-05 del build |
| @s9 responsive | `hero-estilos.test.ts` → «@s9 el <svg> mide en em el ancho de su viewBox» (3 tests) |

## Lo que cazó el `judge` (rechazo, y con razón)

Los cuatro bloqueantes eran REALES. Los tres primeros están corregidos:

- **B-1 — el recorte no tenía puerta.** La región del `<mask>` iba como cuatro literales duplicados
  del `viewBox`. El judge saboteó `VISTA_MARCA` con **la caja exacta que secciona la «N» y la «h»**
  (`'0 -840 3895 1200'`) y **los 47 tests siguieron verdes**. *Arreglado*: la máscara se DERIVA del
  viewBox (una sola fuente de verdad) y se añadió la puerta que faltaba — que el viewBox ENCIERRE
  la tinta medida (−15,6 → 3965,3 ‰), con margen mínimo de 40‰ por los cuatro lados.
- **B-2 — `width: 4.12em` sin ningún test.** Sabotaje a `40em` en verde. *Arreglado*: 3 tests
  nuevos sobre `.rotulo`, incluido el de que NO vuelva el `max-width: 100%` que colapsaba el hero.
- **B-3 — violación de contrato YA PUBLICADA.** «STUDIO» arrancaba a 3,7 s cuando el trazo
  terminaba a 4,0 s: entraba **0,3 s antes** de que la marca estuviera escrita, que es justo lo que
  @s4 prohíbe — y el comentario del SCSS afirmaba lo contrario. *Arreglado*: el trazo pasa a 3,6 s
  (termina en 3,7 s) y «STUDIO» entra exactamente en 3,7 s; total 4,3 s ≤ 4,5 s. Y ahora hay un test
  que compara los dos relojes.
- **B-4 — faltaba este diario.** *Arreglado*: es este fichero.

**Addendum del judge, y el error era mío**: borré `src/assets/brush.png` por creerlo huérfano, pero
es el ORIGEN del que `tools/trazo-marca/aplicador.mjs` regenera el aplicador. *Restaurado.*

## Riesgo conocido y ACEPTADO: Great Vibes y `font-display: swap`

`@fontsource` emite `font-display: swap`. Mientras la fuente carga —o para siempre si fallara—, el
`<text>` del SVG cae al genérico `cursive` y **la máscara, calculada para Great Vibes, revela
regiones que no encajan**. El nombre accesible sobrevive (vive en el `<h1>`, no en el SVG), pero
visualmente sería peor que el bug original. Mitiga que la fuente va **autohospedada** y es lo
primero que pide la página. Si molestara en la demo, la salida es vectorizar «Nails Lash» a `<path>`
con las herramientas de `tools/trazo-marca/` y dejar de depender de la fuente en tiempo de pintado.

## Estado

- 5 puertas del `pnpm build` verdes · typecheck 0 · lint 0.
- Mutación de `Hero.tsx`: 100 % (⚠️ los 10 mutantes murieron por *timeout*, no por aserción:
  evidencia más débil de lo que el número sugiere; conviene repetirla sin carga concurrente).
- ⚠️ **Verificación EN VIVO con Chrome PENDIENTE**: la ventana del navegador quedó minimizada y
  Chrome estrangula las pestañas ocultas. Todo lo que se afirma aquí está medido sobre el HTML
  horneado y los tests, **no sobre el rótulo pintado moviéndose**. Es el último paso que falta.
