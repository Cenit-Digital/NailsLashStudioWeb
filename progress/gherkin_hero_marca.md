# Destilación Gherkin de F-07 (`hero_marca`) — mapa acceptance → @s y decisiones

> Destilado de `project-spec.md §Feature 7` con `progress/f07_verificacion_previa.md` como FUENTE DE
> VERDAD de los hechos (workflow adversarial ~1,1 M tokens; build SSG real + Chrome/CDP). Formato y
> listón heredados de `features/header_nav_footer.feature` (F-06). **Contrato: `features/hero_marca.feature`.**
>
> ✅ **APROBADO POR LA PUERTA HUMANA EL 2026-07-18.** Las cinco preguntas (C-1, C-2, C-3, C-5, C-7)
> están CERRADAS por el humano (todas como proponía el lead). El `tdd_craftsman` QUEDA LIBERADO para
> implementar. Precedente F-05/F-06 (A-23 redux). Ver la sección «Puerta humana 2026-07-18» al final.

## Escenarios: 16 (@s1..@s13, @s16, @s15, @s14; @s16 añadido en la ronda de reparación —partición
## corte===0—; @s15/@s14 se definen tras el resto, junto a su condición C-5, para no renumerar)

## Mapa acceptance de `feature_list.json §7` → @s

| # | Acceptance original | Destilación | @s |
| - | ------------------- | ----------- | -- |
| 1 | «El estado base en CSS es el estado final VISIBLE; el oculto vive solo en el 0% del keyframe» | Se lee el SCSS: base visible (@s1) + oculto SOLO en el 0% (@s2) | **@s1, @s2** |
| 2 | «Con prefers-reduced-motion: reduce el hero se ve completo y legible» | `@media (prefers-reduced-motion: reduce){ animation: none }` en el SCSS — CRITERIO DE PROYECTO (C-4), NO «WCAG obliga» | **@s3** |
| 3 | «El HTML prerenderizado (sin JS) muestra el nombre visible: fetch del HTML crudo, no jsdom» | Bytes de `dist/` (readFileSync + string), sin `opacity:0`/`clip-path` oculto horneado; red anti-observer | **@s5** |
| 4 | «La animación bob no es infinite (SC 2.2.2 A)» | ✅ C-5 (2026-07-18): **APLAZADO A F-08** (el bob depende de scroll, hoy no lo hay). @s14 se conserva por trazabilidad; el `tdd_craftsman` NO lo implementa en F-07 | **@s14** APLAZADO F-08 |
| 5 | «El elemento LCP no tiene opacity:0 en ningún momento y es legible en ≤1,2s (hoy ~5,3s)» | ✅ C-2 (2026-07-18), SEPARADO en dos ejes: base sin `opacity:0`/`clip-path` oculto → @s1; DURACIÓN acotada ≤1,2s (C-3) → @s4; **NÚMERO LCP real → [NV] / verificación EN VIVO con Chrome (NO escenario unitario)** | **@s1, @s4** + nota LCP |
| 6 | «El hook de IntersectionObserver es SSR-safe…» | ✅ C-1 (2026-07-18): **RETIRADO** (no aplica; above-the-fold; `grep`=0 [V]). Cubierto NEGATIVAMENTE por @s5 (visible sin JS) | **retirado** → @s5 |

## Casos límite de la spec (§Feature 7) → @s

| Caso límite | @s |
| ----------- | -- |
| 1. HTML sin JS → nombre VISIBLE (obligatorio) | @s5 |
| 2. reduced-motion → hero completo y legible | @s3 |
| 3. base sin `opacity:0`/`clip-path` oculto (oculto solo en 0%) | @s1 (+@s2) |
| 4. NOMBRE sin espacio → guarda, no compone «Nails LashStudio» ni indexa con -1 | @s13 |
| 5. nombre accesible «Nails Lash Studio» (17); pegados → «Nails LashStudio» (16) → fallo | @s7, @s8 |
| 6. `bob infinite` → viola SC 2.2.2 (A); finito Y ≤5s → conforme (APLAZADO A F-08 por C-5, 2026-07-18) | @s14 APLAZADO F-08 |
| 7. titular con `--accent` como texto → 4,05 < 4,5 → puerta de contraste ROJA | @s9 |
| 8. duración por encima del límite de C-3 → fallo del eje testeable | @s4 |
| 9. hero en `<section>` → activaría la puerta de anclas de F-06; no se envuelve | @s11 |

## Otros comportamientos medidos de la spec → @s

| Comportamiento | @s |
| -------------- | -- |
| UN solo `<h1>` tras el hero; hijos `<span>` (no `<div>`) | @s6 |
| derivación marca/tipo por `lastIndexOf(' ')` (la lógica mutable) | @s12 |
| mutantes de la derivación (I-6, umbral 1.0) | @s15 |
| eyebrow `<p>`, nunca heading; estructura, no contenido (C-7 APROBADO 2026-07-18: contenido a F-09) | @s10 |

## Las CINCO preguntas a la puerta humana — CERRADAS POR EL HUMANO EL 2026-07-18 (todas como proponía el lead)

- **✅ C-1** — RETIRADO el acceptance 6 (IntersectionObserver). NO hay observer en el hero (above-the-fold;
  patrón B de F-08+; `grep -rin IntersectionObserver src/` = 0 [V]). Cubierto negativamente por @s5.
- **✅ C-2** — SEPARADO el LCP en dos ejes: ≤1,2s (DURACIÓN, testeable, @s4) vs LCP real (norma, [NV]/en
  vivo). El número LCP real y el clip-path vs LCP van a verificación EN VIVO con Chrome tras el TDD.
  PROHIBIDO fingir medir el LCP con jsdom.
- **✅ C-3** — Decisión de producto: ACORTAR la animación a ≤1,2s totales (delay + duración). El estado
  base visible protege el reposo pero NO acorta el reveal (medido); el prototipo tardaba ~5,3s. → @s4
  fija el límite ≤1,2s.
- **✅ C-5** — El `bob infinite` incumple SC 2.2.2 (A) [V]. APLAZADO A F-08 (depende de scroll; hoy no lo
  hay) → @s14 se conserva por trazabilidad, el `tdd_craftsman` NO lo implementa en F-07. Si algún día se
  hornea, duración total ≤5s (no basta quitar `infinite`).
- **✅ C-7** — Eyebrow sin fuente de datos hoy (categorías = F-09). CONTENIDO aplazado a F-09. NUNCA
  «Facial». @s10 fija solo la estructura (`<p>`).

## Decidido y declarado por el lead (NO va a la puerta, pero el humano puede revocarlo)

- **C-4** — `prefers-reduced-motion` = CRITERIO DE PROYECTO, no obligación WCAG A/AA [V, A4]. Redacción
  FIJA en @s3. PROHIBIDO «WCAG obliga»/«obligatorio» a secas.
- UN h1 con dos `<span>` + text node `{' '}` REAL (nombre accesible 17 car., medido en ambos motores) —
  @s6/@s7/@s8. Derivado de NOMBRE por `lastIndexOf(' ')` con guarda — @s12/@s13.
- Titular con `--ink`, nunca `--accent`/`--brush` como texto (4,05 < 4,5) — @s9.
- Hero sin `<section>` — @s11. `brush.png` aplazado (paintReveal es CSS puro; si acaso, SVG inline).
- **C-8 (deuda declarada)**: sobre-preload de 12 fuentes (`type="font/woff2"` incluso los 6 `.woff`);
  puede dañar el LCP. Territorio F-05/F-20; F-07 no lo toca.
- `Hero.tsx` + la derivación a DOS listas: `mutate` de `stryker.config.json` **Y** `coverage.include`
  de `vitest.config.ts` (hoy `['src/lib/**/*.ts']`, excluye todo `.tsx`).

## El LCP — declarado, NO escenario unitario (C-2)

El **número LCP real** y **si el `clip-path` deja el titular fuera del LCP** son **[NV] en test
unitario** (jsdom no tiene layout ni paint; el clip-path vs LCP es NO_VERIFICABLE en fuente primaria
[V, A2]). Van a **verificación EN VIVO con Chrome** (extensión aportada por el humano) TRAS el TDD:
LCP real, clip-path vs LCP, hero bajo reduced-motion, reflow a 320px. **No hay escenario que finja
medir el LCP con jsdom** (spec, «Modos de error»: el número LCP no produce modo de error de build).

## Anti-tautología y prohibiciones destiladas

- Esperados a mano: «Nails Lash»/«Studio», el número de duración (≤1,2s, C-3 APROBADO 2026-07-18,
  re-leído del SCSS, jamás importado como símbolo). NOMBRE (`site.ts:13`) es ENTRADA legítima; los
  esperados de la partición, a mano.
- PROHIBIDO: umbral a SC 2.2.2 distinto de los «cinco segundos» · `prefers-reduced-motion` como
  obligación WCAG · número LCP como aserción de build · «obligatorio» sin sujeto para reduced-motion ·
  `--accent`/`--brush` como texto del titular · rama «texto grande 3:1» · hardcodear «Facial» · mutar
  `.includes` (no existe en Stryker 9.6.1).

## Ronda de reparación (revisión adversarial de 5 lentes / 11 agentes; 5 confirmados, 1 descartado)

Todas las correcciones re-MEDIDAS o CITADAS antes de aplicar. **5 aplicadas, 0 rechazadas.** El
escenario pasa de 15 a **16** (nuevo @s16). En esa ronda las marcas ⏸ (C-1..C-7) se mantuvieron y
@s4/@s14 seguían con número/condición pendiente; DESPUÉS, la puerta humana del 2026-07-18 las CERRÓ
todas (@s4 fija ≤1,2s por C-3; @s14 se aplaza a F-08 por C-5).

1. **🔴 GRAVE — @s5 no cazaba el mecanismo del fallo (A3 §2).** MEDIDO: el prototipo NO hornea
   `opacity:0`/`clip-path` inline — hornea `style="animation:…both"` inline, cuyo `both`/`backwards`
   proyecta el 0% oculto durante el delay (invisible SIN JS), gana en especificidad al
   `@media(reduce){animation:none}` de @s3 (lo derrota) y esconde su duración de @s4 (que lee la HOJA).
   → **Reforzado el negativo de @s5**: prohíbe TAMBIÉN un `animation`/`animation-*` HORNEADO INLINE en
   el titular. La 3ª aserción se redactó como «texto presente + sin ocultación inline», NO «pintado»
   (eso es el eje [NV]/Chrome). Título ajustado en la misma línea.

2. **🔴 GRAVE — el mutante `corte < 0 → corte <= 0` sobrevivía a todo (MEDIDO, node).** Con corte 10,
   7 y -1 (las 3 entradas de @s12/@s13) el mutante da salida idéntica → SOBREVIVE; @s13 (corte=-1) NO
   lo mata (afirmación FALSA del contrato). SOLO corte===0 lo distingue.
   → **Añadido @s16** (partición corte===0): nombre que EMPIEZA por espacio (« Studio», sintético),
   esperados A MANO `marca=""`, `tipo="Studio"` con la guarda real `corte < 0`. En prosa (Gherkin
   RECORTA las celdas → un espacio inicial no cabe en Examples). **@s15 fila 5 corregida**: su «dónde
   muere» es @s16, no @s13. Comentario de @s13 corregido (no mata el cambio de operador).

3. **🔴 GRAVE — error de hecho: coverage.include.** `vitest.config.ts:15` YA es
   `['src/lib/**/*.ts', 'src/components/**/*.tsx']` desde F-06 (MEDIDO) — la premisa «hoy excluye todo
   .tsx» era FALSA y contradecía la fuente de verdad (`f07_verificacion_previa.md:236`).
   → **Eliminadas las DOS menciones** (cabecera ~línea 48 y nota de @s15). Queda solo lo cierto:
   añadir a mano el fichero a la lista `mutate` de `stryker.config.json` (lista explícita, sin glob).

4. **🔴 GRAVE — @s14 confundía LETRA (≤5s) con TÉCNICA (finitud).** `iteration-count:3` sobre `bob
   2,4s` = 7,2s es finito y >5s → sigue incumpliendo SC 2.2.2 (A).
   → El Then ahora asevera la **DURACIÓN TOTAL** (count × duración por iteración) ≤ 5s —espejo de @s4—,
   además de la finitud; se separa (a) letra (≤5s) de (b) técnica (≠ infinite). El «5» es el LITERAL
   WCAG, no un número horneado de C-3 (C-3 cerrada el 2026-07-18 con ≤1,2s; el «5» de @s14 sigue siendo
   literal WCAG, ajeno a C-3). Nota: @s14 quedó APLAZADO A F-08 en la puerta (C-5), pero su redacción
   —letra vs técnica— se conserva íntegra como contrato de trazabilidad para F-08.

5. **MENOR — @s15 fila 1: mutante fantasma.** Stryker 9.6.1 NO genera `lastIndexOf→indexOf` (MEDIDO:
   0 hits en el method-expression-mutator; solo mapea charAt/slice/substring/trim/etc.).
   → Fila 1 reformulada al mutante REAL `StringLiteral ' ' → ''` (muere en @s12:
   `"Nails Lash Studio".lastIndexOf('') = 17` → marca = nombre completo ≠ «Nails Lash»). Nota de @s15
   reconciliada: los sabotajes mapean a mutadores REALES; prohibidos los fantasma `.includes` y
   `lastIndexOf→indexOf`.

**Descartado (no aplicado):** el 6º hallazgo alegado, declarado falso por el verificador independiente;
no llegó como corrección a aplicar. Re-verifiqué los 5 anteriores por medición propia y todos se
sostienen → 0 rechazos.

## Verde ≠ funciona (I-8)

Todo lo anterior es [NV] hasta el primer `pnpm build` real de F-07 (OBLIGATORIO): la estructura del h1,
el nombre accesible y la puerta de anclas se midieron contra experimentos y funciones puras, no contra
el `dist/` de F-07. El primer build MANDA sobre lo escrito.

## Avisos al lead (lo que me pareció digno de señalar) — RESUELTOS en la puerta del 2026-07-18

1. **El acceptance 5 y el 6 de `feature_list.json §7` chocaban con la verificación previa** y NO se
   destilaron tal cual: el 6 (observer) se retira (C-1) y el 5 mezcla dos métricas (C-2). Fue el patrón
   A-23 por cuarta vez: la decisión de fondo es correcta; el «cómo» del troceado no. → ✅ RESUELTO: la
   puerta reescribió los acceptance de `feature_list.json §7` y corrigió la `puerta_legal` (ya no suelda
   norma y métrica no-unitaria; el LCP queda como verificación EN VIVO). El contrato ya no lo contradice.
2. **@s4 y @s14 nacían con un número/condición PENDIENTE** (C-3 fija la duración; C-5 decide si el bob
   se hornea). → ✅ RESUELTO: @s4 fija ≤1,2s (C-3); @s14 se APLAZA a F-08 (C-5) y no se implementa en F-07.
3. **El LCP NO es puerta unitaria.** → ✅ RESUELTO: la puerta (C-2) confirmó que el número LCP real NO es
   test unitario; va a verificación EN VIVO con Chrome tras el TDD. No hizo falta volver al `spec_partner`.

## Puerta humana 2026-07-18

**LA PUERTA SE ABRIÓ Y SE CERRÓ EL 2026-07-18.** El humano decidió las cinco preguntas de F-07, todas
como proponía el lead. El `tdd_craftsman` queda LIBERADO para implementar. Las decisiones, literales:

- **C-3** (decisión de producto) → **ACORTAR la animación a ≤1,2s TOTAL** (delay + duración), leído del
  SCSS, para un LCP bueno. El estado base visible protege el reposo pero NO acorta el reveal (medido con
  Chrome/CDP); el prototipo tardaba ~5,3s. **@s4 fija el límite ≤1,2s.**
- **C-1** → **RETIRAR el acceptance 6 original** (IntersectionObserver). El hero es above-the-fold; el
  observer es el patrón B de F-08+. **NO hay observer en el hero** (cubierto negativamente por @s5).
- **C-2** → **SEPARAR el LCP en dos ejes**: (a) TESTEABLE por test unitario (CSS estático + duración
  ≤1,2s → @s1/@s2/@s4/@s5); (b) **[NV]/VERIFICACIÓN EN VIVO CON CHROME** tras el TDD (el número LCP real
  y si el `clip-path` deja el titular fuera del LCP). **PROHIBIDO fingir medir el LCP con jsdom.**
- **C-5** → el indicador «desliza» (`bob`) se **APLAZA a F-08** (depende de que haya scroll; hoy no lo
  hay). **@s14 se CONSERVA como escenario de trazabilidad marcado `@aplazado-f08`**, y el `tdd_craftsman`
  NO lo implementa en F-07 (NO se renumeran los demás: hueco documentado, precedente F-05). Si algún día
  se hornea, duración total ≤5s (no basta quitar `infinite`).
- **C-7** → el **eyebrow** deja solo su ESTRUCTURA (`<p>`) en F-07; el contenido de categorías es **F-09**
  (nunca hardcodear «Facial»). **@s10 fija la estructura; el contenido, aplazado a F-09.**

**Qué se tocó en el contrato `features/hero_marca.feature`:** se sustituyó el bloque `⏸` de la cabecera
por el bloque `✅ APROBADO POR LA PUERTA HUMANA EL 2026-07-18`; se retiraron las 15 marcas `⏸`
(`grep ⏸` = 0); @s4 pasó de «≤ el límite que fije C-3» a «≤1,2s»; @s14 quedó marcado `@aplazado-f08`
(NO se renumeró nada). **Ningún otro escenario de comportamiento cambió.** `feature_list.json` NO se
tocó (el lead ya había aplicado las cinco decisiones a §7).
