# gherkin_logo_acoplado

`features/logo_acoplado.feature` NUEVO (2026-09-29, gherkin_author). Tiene **34 escenarios**, @s1-@s34:
28 son de puerta unitaria (@s1-@s27 y @s34) y 6 de verificación en vivo con Chrome (@s28-@s33, tag
`@verificacion-viva`, precedente `tipografia_global` @s8/@s9). Fuente: `project-spec.md` §F-25, más el brief
`progress/brief_foto_logo_catalogo.md` §2, §5 y §6, más las **decisiones del craftsman_lead sobre D-1..D-8**
(misma fecha, ver abajo). No he tocado `src/`, los tests, `project-spec.md` ni `feature_list.json`: F-25 sigue
`pending`, el lead marca `spec_ready` y escribe la enmienda de LA-C4/LA-C11 en la spec.

`pnpm exec prettier --check` no procesa `.feature` («No parser could be inferred»), así que no aplica. Las tablas
del fichero se han comprobado con un script: todas las filas tienen el mismo número de celdas.

## Escenarios y mapa @s → contrato

| @s  | Qué fija                                                                                                                                  | Dónde se prueba                 | Contrato / decisión        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------- |
| s1  | Horneado: `data-logo="texto"`, `data-vuelo="no"`, href `/`, sin `style`; querySelector solo en efecto                                     | renderToString                  | LA-C1, LA-C2, LA-C9, LA-3  |
| s2  | Las dos representaciones horneadas, `aria-hidden`, viewBox y `<text>` «Nails Lash», sin ids ni máscara                                    | renderToString                  | LA-C1, LA-4, LA-5, P3      |
| s3  | Nombre accesible EXACTO «Nails Lash Studio» y href en los tres estados; `class` constante                                                 | jsdom + IO sustituido           | LA-C1, LA-5, F-06 @s15     |
| s4  | Derivación: con NOMBRE y VISTA_MARCA sustituidos por vi.mock, el logo los sigue                                                           | renderToString (fichero propio) | LA-15, I-7, P3             |
| s5  | Observador: una construcción, `{ threshold: 0, rootMargin: "-73px 0px 0px 0px" }` (floor), observa el disparo; nada sin entrega; limpieza | jsdom                           | LA-C4, LA-C10, LA-6        |
| s6  | Disparo por geometría contra la línea del observador (rootBounds.top 73), no por isIntersecting; frontera `<=`                            | jsdom                           | LA-C4, LA-7                |
| s7  | Manda `rootBounds.top`; si es null, el borde de la cabecera medido EN el callback; cambio de alto sin rehacer el observador               | jsdom                           | LA-C4, D-1 b, D-2, c.l. 13 |
| s8  | Monotonía P2: desconecta y nada vuelve a «texto»                                                                                          | jsdom                           | LA-C5, P2                  |
| s9  | Sin persistencia: montar de nuevo vuelve a «texto»; storage nunca tocado                                                                  | jsdom                           | LA-C5, LA-9                |
| s10 | ¿Vuelo o no? Primera entrega y la regla «a menos de un viewport» (frontera −812/−811)                                                     | jsdom                           | LA-C6, LA-9                |
| s11 | Valores FLIP exactos en el `style` del `<a>` (325px / −75px / 4), con señuelo y escala por el ancho                                       | jsdom                           | LA-C2, LA-C7, LA-2         |
| s12 | Sin origen o con ancho 0: acople sin vuelo y sin errores                                                                                  | jsdom                           | LA-C6.3, LA-C7             |
| s13 | Ni matchMedia, ni animate, ni "scroll"/"resize"; con reduce marca `data-vuelo="si"` igual                                                 | jsdom                           | LA-1, LA-C6, LA-6          |
| s14 | Sin IntersectionObserver o sin disparo: «texto» para siempre, sin errores                                                                 | jsdom                           | LA-C9, LA-C10              |
| s15 | El vuelo en la hoja: 0,9 s, la curva, 0,35 → 1 y `soltar` 0,4 s lineal; sin fill-mode                                                     | bytes SCSS                      | LA-1, LA-10, LA-C3         |
| s16 | Reduced-motion: `animation: none` con el selector COMPLETO, y después de la regla del vuelo                                               | bytes SCSS                      | LA-11, C-4                 |
| s17 | Hueco estable: `inline-grid`, `grid-area: 1 / 1`, visibilidades, base = horneado, `.soloLectores`                                         | bytes SCSS                      | LA-4, LA-C3, I-4           |
| s18 | Alto 2,5 rem y tope de 2,75 rem                                                                                                           | bytes SCSS                      | LA-13                      |
| s19 | `fill: var(--ink)`, Great Vibes, `pointer-events: none`, sin opacity ni --accent; MINIMO_DE_PARES 18                                      | bytes SCSS + puerta-contraste   | LA-12, LA-C12, D-5         |
| s20 | Enmienda F-06: `.marca` se muda, el 820 px se queda, @s12/@s16 intactos                                                                   | bytes + renderToString          | LA-14, F-06                |
| s21 | Enmienda F-07: dos `data-acople` literales, h1 intacto, ids únicos                                                                        | renderToString(<Hero />)        | LA-C9, LA-8, F-07          |
| s22 | El hero sigue su ceremonia; ningún nodo nuevo; el rótulo no se toca                                                                       | jsdom con Hero + Cabecera       | LA-C8, LA-16, LA-2         |
| s23 | Home: un solo h1, logo sin encabezados ni ids, anclas con 0 violaciones                                                                   | renderToString de la home       | LA-C1, F-04/F-05/F-06      |
| s24 | Puras: `estadoTrasObservar` y `debeVolar` por valor en sus fronteras                                                                      | logica.test.ts                  | LA-C11                     |
| s25 | Puras: `transformacionFlip`, `variablesDeVuelo` y `margenDeRaiz` (floor: 73,6 → "-73px…") por valor                                       | logica.test.ts                  | LA-C11, D-1 a              |
| s26 | Guardas de fuente (literales que Stryker nunca inyecta)                                                                                   | bytes TS                        | LA-15, LA-1, LA-9          |
| s27 | `mutate` con los dos ficheros; 100 % (equivalente `[]` documentado)                                                                       | JSON + mutation_tester          | LA-C11                     |
| s28 | EN VIVO: HTML crudo de dist/, sin avisos de hidratación, firma sin minúsculas ni recorte                                                  | Chrome + CDP                    | LA-C13, D-5                |
| s29 | EN VIVO: disparo exacto y vuelo visible (getAnimations), scroll a 1/2/100 px, sin desbordamiento                                          | Chrome + CDP                    | LA-C4, LA-10, D-1          |
| s30 | EN VIVO: P2 al volver arriba; recargas; clic en el logo; bfcache                                                                          | Chrome + CDP                    | P2, LA-9                   |
| s31 | EN VIVO: reduce sin vuelo, y activado a mitad de vuelo; D-3 solo como observación                                                         | Chrome + CDP                    | LA-11, D-3                 |
| s32 | EN VIVO: alto idéntico y ≤ 76 px, CLS 0 a 7 anchos; Great Vibes bloqueada                                                                 | Chrome + CDP                    | LA-4, LA-13, LA-C13        |
| s33 | EN VIVO: árbol a11y, `pointer-events`, fuente propia, legibilidad                                                                         | Chrome + CDP                    | LA-5, LA-C12               |
| s34 | Varias entradas en una entrega: decide la ÚLTIMA; «primera observación» = primera ENTREGA                                                 | jsdom                           | D-4                        |

La cabecera del `.feature` trae, además, la traza completa: LA-C1..C13, los casos límite 1-20, las enmiendas y
el acceptance de `feature_list.json`. También fija los ARTEFACTOS y los nombres de ficheros y selectores, la
GEOMETRÍA DE REFERENCIA común a todos los escenarios de jsdom y las prohibiciones anti-tautología.

## Dudas de la destilación → decisiones del craftsman_lead (2026-09-29), ya aplicadas en el `.feature`

1. **D-1 → ACEPTADA y reforzada.** El problema: `Math.ceil` ponía la línea del observador POR DEBAJO del borde
   de la cabecera. El aviso podía llegar con «STUDIO» asomando hasta 1 px, la decisión `<=` devolvía «texto» y
   el observador ya no volvía a avisar mientras «STUDIO» siguiera subiendo: el acople se perdía, con una
   probabilidad de ≈ 0,8/Δ con scroll lento. Queda así:
   - (a) `margenDeRaiz` usa **`Math.floor`**. Elegí floor y no el alto exacto porque un margen entero no depende
     de cómo redondee cada motor un `rootMargin` fraccionario. La geometría de referencia pasa a una cabecera de
     **73,6 px** para que floor (73) se distinga a la vez de round y de ceil (74). Cambian @s5 («-73px…») y @s25
     (73,6 → «-73px…», 73,2 → «-73px…», 74 → «-74px…», 70,99 → «-70px…»).
   - (b) La decisión compara contra **`entry.rootBounds.top`**, la línea del propio observador. Si `rootBounds`
     es null, cae al borde de la cabecera medido en el callback. Aviso y decisión son coherentes por
     construcción. **Toda entrada** de los escenarios de jsdom trae `rootBounds.top = 73`, así que la frontera
     del disparo pasa de 73,2 a **73** en @s3, @s6, @s8, @s10-@s13 y @s22. @s6 se rehace con las filas
     73,5 → «texto», 73 → «caligrafia» (con isIntersecting true, porque tocar el borde es intersecar) y
     72,5 → «caligrafia» (el aviso de salida típico). **@s7 se reescribe** para fijar la precedencia: siete filas
     con `rootBounds` presente o null, el menú abierto (260) y la cabecera encogida (70). @s24 renombra el
     tercer parámetro de `estadoTrasObservar` a `lineaDeCorte` (valores alineados a 73). @s29 exige el acople en
     las tres pasadas y ningún píxel de «STUDIO» asomando.
   - Nota para la enmienda de la spec: con (b), el caso límite 13 (menú móvil abierto) ya no acopla por el borde
     del menú. Espera a la línea de la cabecera cerrada (fila 1 de @s7), que es lo que la spec ya describía como
     efecto práctico («el disparo espera a esa línea»).
2. **D-2 → RESUELTA por D-1 (b), caso límite aceptado.** Si la cabecera cambia de alto tras montar, el disparo se
   adelanta o se retrasa ≈ 4 px como mucho y nunca se pierde. El observador no se rehace. Salió gratis como fila 4
   de @s7 (cabecera encogida a 70, «STUDIO» en 72, línea 73 → «caligrafia»; constructor y observe con una sola
   llamada).
3. **D-3 → ACEPTADA como caso límite documentado.** Retirar `reduce` tras acoplar puede reproducir el vuelo UNA
   vez desde el origen antiguo: raro e inofensivo. Solo queda como observación en @s31, que no aprueba ni suspende.
4. **D-4 → FIJADA en @s34 (nuevo, al final).** Decide la ÚLTIMA entrada de la entrega. Tres filas: [400, 73] →
   acopla con vuelo; [73, 400] → «texto», que mata la implementación que aplica la transición monótona entrada a
   entrada; y dos entradas en la entrega INICIAL → acople sin vuelo, porque «primera observación» es la primera
   ENTREGA.
5. **D-5 → RATIFICADA** en @s19: `text-transform` y `letter-spacing` se mudan a `.logoTexto`. @s28 lo comprueba en
   vivo.
6. **D-6, D-7 y D-8 → RATIFICADAS tal cual.** D-6: el `disconnect` al desmontar (@s5), el `@media (reduce)`
   después de las reglas del vuelo (@s16) y `document.querySelector` fuera del render (@s1). D-7: el alcance de
   @s23, con ids únicos solo para `tinta-marca`/`trazo-marca` y sin ids en el logo. D-8: los nombres fijados aquí
   (ficheros de test, `.soloLectores`, `<text>` sin clase propia).

Sin dudas abiertas. Pendiente del lead: la enmienda de LA-C4 y LA-C11 en `project-spec.md` (floor,
`rootBounds.top` con caída al borde medido, «decide la última entrada») y marcar `spec_ready`.
