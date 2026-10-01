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

## E-1

**ENMIENDA E-1: la cabecera en móvil, en una sola fila sin «Reservar».** Destilada por el gherkin_author el
2026-09-30. Fuentes: `project-spec.md` §F-25 «ENMIENDA E-1» (E-1-C1..E-1-C4 y las alternativas descartadas) y el
brief `progress/brief_foto_logo_catalogo.md` §7. La decisión es FIRME, de Pablo (AskUserQuestion, 2026-09-30):
«Una fila sin "Reservar"». La puerta ratifica la destilación, no la decisión.

He ampliado `features/logo_acoplado.feature` de 34 a **41 escenarios**. Los nuevos son @s35-@s41, añadidos AL
FINAL y sin renumerar nada: cuatro de puerta unitaria (@s35-@s38) y tres EN VIVO (@s39-@s41, con
`@verificacion-viva`). No he tocado `src/`, los tests, `project-spec.md` ni `feature_list.json`. Todas las filas de
cada tabla tienen el mismo número de celdas, y los tags van de @s1 a @s41, únicos y consecutivos (comprobado con un
script).

### Escenarios nuevos

| @s  | Qué fija                                                                                                                                                                                                                                                                                                                    | Dónde se prueba                  | Contrato                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------- |
| s35 | Bytes de `cabecera.module.scss`: EXACTAMENTE un `@media (max-width: 430px)` con un solo bloque, `.reservar`, cuya única declaración es `display: none`. Va DESPUÉS de la base `.reservar`, sin `431px` ni `@media (min-width`. El `@media (max-width: 820px)` sigue intacto y sin `.reservar`                               | bytes SCSS (`cabecera.test.tsx`) | E-1-C1, E-1-C2, alt. (a)   |
| s36 | En el horneado, «Reservar» es EXACTAMENTE uno, dentro de la nav «Principal» y FUERA de la `<ul>`, con `href="#reserva-titulo"`, sin `hidden`, `aria-hidden`, `style`, `tabindex` ni `inert`. `href="#reserva-titulo"` aparece EXACTAMENTE dos veces                                                                         | renderToString(<Cabecera />)     | E-1-C1, alt. (b)           |
| s37 | Con `innerWidth` 320 y un `matchMedia` que responde `true` a todo, «Reservar» sigue en el DOM, `matchMedia` no se llama y no se escucha `resize` ni `orientationchange`                                                                                                                                                     | jsdom                            | E-1-C1 (sin JS)            |
| s38 | Guardas de fuente: `MenuNavegacion.tsx` contiene `estilos.reservar` una vez y `href="#reserva-titulo"` dos veces. Ni él ni `Cabecera.tsx` contienen `useIsMobile`, `matchMedia`, `innerWidth`, `outerWidth`, `screen.width` ni `'resize'`/`"resize"`                                                                        | bytes TSX                        | E-1-C1 (sin `useIsMobile`) |
| s39 | EN VIVO, 12 anchos de 320 a 1280 px, en los dos estados del logo: `<header>` ≤ 76 px e igual en los dos estados; una fila (centros verticales a ≤ 1 px); sin desbordamiento. «Reservar» `display: none`, 0 × 0 y fuera del árbol de a11y y del Tab en 320-430 px; visible y en el Tab desde 431. Sin JS, el mismo resultado | Chrome + CDP                     | E-1-C2, E-1-C3, E-1-C4     |
| s40 | EN VIVO a 320, 390 y 430 px: `scrollPaddingTop` = "96px". En los siete saltos por ancla y con «Reservar cita» del hero, el `top` del título es ≥ el `bottom` del `<header>` (≤ 76 px)                                                                                                                                       | Chrome + CDP                     | E-1-C3 (F-06 @s11)         |
| s41 | EN VIVO a 320 y 430 px: los tres caminos a la reserva funcionan. «Reservar cita» del hero y «Reserva» del menú llevan a `#reserva-titulo`, y el lanzador de Nailbot abre su `<dialog>`                                                                                                                                      | Chrome + CDP                     | E-1-C3                     |

### Cambios en lo que ya estaba aprobado (sin renumerar)

- **Cabecera del fichero:** una línea de estado E-1; la fuente «1bis» con la decisión de Pablo y su fecha
  (2026-09-30); E-1 en ARTEFACTOS (TOCA / NO TOCA); una línea E-1 en «VERDE ≠ FUNCIONA»; los literales de E-1 en
  ANTI-TAUTOLOGÍA; y el bloque de traza E-1-C1..C4, las alternativas (a)/(b)/(c) y el acceptance.
- **@s32:** en el `Then` de la fila, «la marca y la hamburguesa (o la nav horizontal)» pasa a «la marca, la
  hamburguesa (o la nav horizontal) y, por encima de 430 px, «Reservar»», y se cita E-1 y @s39. Su comentario
  explica que el cálculo del spec_partner olvidaba «Reservar» y que @s32 solo se cumple con E-1. Sus
  `Examples` y el resto de sus `Then` no cambian.

### Dudas para la puerta humana

1. **El acceptance y el estado de F-25 (del lead).** `feature_list.json` dice «Los 34 escenarios» y F-25 está
   `in_progress`, con la puerta aprobada el 2026-09-29. No lo he tocado por instrucción. Hay que decidir si E-1 pasa
   por su propia puerta (anotada en `puerta_humana`) o si F-25 vuelve a `spec_ready`. En cualquier caso, el
   «34» pasa a «41».
2. **Derivados míos, no literales en la spec; hay que ratificarlos:**
   - (a) @s35: el `@media (max-width: 430px)` va DESPUÉS de la base `.reservar`. Hoy da igual, porque la base no
     declara `display`, pero así la regla no depende del orden si un día lo declara.
   - (b) @s35: «un solo bloque con una sola declaración» y el veto de `431px` y `@media (min-width`. Cierran la
     alternativa (a) y el hueco fraccionario entre dos rangos.
   - (c) @s36/@s37: el veto de `hidden`, `aria-hidden`, `style`, `tabindex` e `inert` en el enlace.
   - (d) @s38: la guarda de bytes `estilos.reservar`. Es el único puente comprobable entre la hoja y el enlace,
     porque el `className` con hash no se asevera en el DOM.
   - (e) @s39: el Tab y el árbol de accesibilidad como prueba medible de «ausente» y «visible».
   - (f) @s41: comprobar en vivo los tres caminos de E-1-C3. La spec los da por hechos; si uno falla, E-1 pierde su
     premisa.
3. **Filas 392 y 394 de @s39.** Son los anchos que midió el lead (el último con dos filas con «Reservar» y el
   primero con una) y quedan como registro. 820 y 821 comprueban que por encima de 430 px nada cambia, justo en la
   frontera de F-06. Si la puerta quiere un barrido más corto, se pueden quitar sin tocar el contrato.
4. **@s40 usa 640 px de alto.** Los títulos del final de la página no llegan arriba y quedan más abajo, así que la
   desigualdad se cumple igual. Los píxeles son criterio de proyecto: no se atribuye ningún número a SC 2.4.11
   (B-1 de F-06).
5. **Observación, fuera de E-1.** `_base.scss` y `scroll-padding-cabecera.test.ts` derivan 76 px como
   «padding-block 1rem × 2 + 44». La hoja declara `0.9375rem` (30 px + 44 + 1 px de borde = 75 px, lo mismo que
   midió el lead). El tope de 76 px se sigue cumpliendo y no hace falta cambiar nada. Su frase «UNA SOLA FILA en
   todo el rango» era falsa antes de E-1 y pasa a ser cierta con ella. Por otro lado, la línea «Estado: PROPUESTO…
   pendiente de la PUERTA HUMANA» de la cabecera del `.feature` está desfasada (la puerta se aprobó el 2026-09-29).
   No la he tocado.

## ENMIENDA E-2

**ENMIENDA E-2: el menú plegable hasta 920 px.** La destiló el gherkin_author el 2026-09-30. Fuente:
`project-spec.md` §F-25 «ENMIENDA E-2» (E-2-C1..E-2-C4 y las alternativas descartadas). La decisión es FIRME, de
Pablo (AskUserQuestion, 2026-09-30): «Menú hasta 920 px». La puerta ratifica la destilación, no la decisión.

He ampliado `features/logo_acoplado.feature` de 41 a **43 escenarios**. Los nuevos son @s42 y @s43, añadidos AL
FINAL y sin renumerar nada. Los tags van de @s1 a @s43, únicos y consecutivos, y todas las filas de cada tabla
tienen el mismo número de celdas (comprobado con un script). No he tocado `src/`, los tests ni `project-spec.md`.
No he ejecutado la suite ni he hecho commit.

### Escenarios nuevos

| @s  | Qué fija                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Dónde se prueba                                            | Contrato               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------- |
| s42 | Bytes, sin comentarios. `cabecera.module.scss` tiene EXACTAMENTE un `@media (max-width: 920px)` con el menú de F-06: `.disparador` inline-flex, `.lista` none y en columna, y `[aria-expanded='true'] + .lista` flex. Va DESPUÉS de las bases `.lista` y `.disparador`, y el `430px` de E-1 va detrás. Sin `max-width: 820px`, `921px` ni `767px`. `contacto.module.scss` conserva EXACTAMENTE un `@media (max-width: 820px)` con `.telefono` (inline-flex, `min-height: 2.75rem`) y no contiene `920px` | bytes SCSS (`cabecera.test.tsx`, describe «F-25 E-2 @s42») | E-2-C1, E-2-C3, E-2-C4 |
| s43 | EN VIVO. Outline de 2 filas: fuentes cargadas y fuentes bloqueadas (ancla: `document.fonts.check` a false). Barrido de 800 a 960 px de 1 en 1, en los dos estados del logo. Cabecera ≤ 76 px y en una fila (centros verticales a ≤ 1 px). Hasta 920 px, «Menú» visible y la lista plegada; desde 921 px, la nav horizontal. El mismo alto en cada tramo (75 y 71 px medidos) y sin desbordamiento horizontal                                                                                             | Chrome + CDP                                               | E-2-C2, E-2-C4         |

### Cambios en lo que ya estaba aprobado (sin renumerar)

- **F-06 `features/header_nav_footer.feature`:**
  - @s17: el título, el `Then` y el `And` del literal a mano pasan a `"920px"`. El comentario lleva la medida
    nueva: una fila desde 891 px con las fuentes cargadas y desde 908 px con la de respaldo, y 920 px deja 12 px de
    margen sobre el peor caso. Nunca se atribuye a una norma ni se usa el 767. Añade un bloque «HISTORIA»: la banda
    793–806 px era de la nav del prototipo y quedó superada, y E-2 (Pablo, 2026-09-30) subió el literal. Remite a
    `project-spec.md` §F-25 «ENMIENDA E-2». El «DECIDIDO» del 2026-07-17 se conserva como «era `820px`» y le sigue
    un «ENMENDADO».
  - También se han actualizado: el resumen B-3 (dice que el literal subió a 920px y remite a @s17), la nota
    anti-tautología del literal, la línea de la mecánica del menú y la fila de @s18 («alterar el literal del
    breakpoint 920px (820px antes de …)»).
  - Las medidas del prototipo de @s11 sobre `scroll-padding` (282/385/647/821px) quedan intactas: son otra cosa.
- **F-25 `features/logo_acoplado.feature`:**
  - Cabecera: la línea de Estado (E-1 APROBADA, E-2 PENDIENTE, 43 escenarios) y la línea desfasada de E-1
    («Pendiente de la PUERTA HUMANA» → «APROBADA el 2026-09-30»). Se añaden una línea E-2, la fuente «1bis» con la
    decisión de Pablo, la fuente 2 con E-2-C1..C4, E-2 en ARTEFACTOS (TOCA / NO TOCA), en «VERDE ≠ FUNCIONA» y en
    ANTI-TAUTOLOGÍA, y el bloque de traza E-2-C1..C4 con las alternativas (a)-(d) y el acceptance (43).
  - @s20: el ancla pasa a `@media (max-width: 920px)`. Se añade un `And`: la hoja sin comentarios NO contiene
    `max-width: 820px`.
  - @s35: las anclas del bloque del menú (título, `Then` y el `And` del contenido) pasan a 920 px.
  - @s39: las filas 820/821 pasan a **920/921**, con los mismos valores de celda que antes. Su texto ya no citaba
    820/821 en el cuerpo, solo en las filas. Se añade un comentario E-2.
  - Comentarios: ARTEFACTOS y la línea «NO TOCA» de E-1 («820 px entonces, 920 px desde E-2»), D-2, el comentario
    de @s32 (fronteras 920/921) y la cabecera del bloque E-1. En esta última, «como los 820 px de F-06 sobre la
    banda 793–806» se deja como historia y se añade «la ENMIENDA E-2 los subió a 920 px, con 12 px sobre los 908
    medidos».
- **`features/tipografia_global.feature:82`** (fuera de la lista, pero el grep lo pedía): citaba «el `820px` de
  F-06 @s17» como ejemplo del patrón anti-tautología. Ahora dice «`920px` —`820px` antes de la ENMIENDA E-2 de
  F-25—». Solo comentario.
- **`feature_list.json` (F-25):** `acceptance[0]` dice «Los 43 escenarios … + ENMIENDA E-2 @s42-@s43».
  `puerta_humana` gana la entrada de E-2 con «PUERTA HUMANA PENDIENTE», en el mismo formato que E-1. `status` sigue
  `in_progress`.

Grep final: en `features/*.feature` ya no queda ningún `820` que afirme el breakpoint ACTUAL del menú. Los que
quedan son historia marcada («antes», «entonces», «HISTORIA»), anclas negativas o el corte del `tel:` de contacto.

### Decisiones tomadas (derivados míos; hay que ratificarlos)

1. **Contacto va por bytes en @s42, no en vivo en @s43.** El comportamiento de contacto ES su hoja, y ningún test
   anclaba su `820px` (`contacto-estilos.test.ts` acepta cualquier `max-width`). El ancla POSITIVA (`820px` +
   `.telefono` inline-flex y `min-height: 2.75rem`) y la NEGATIVA (`920px` no aparece) cazan una «armonización»
   por error. Es determinista y la corre el TDD.
2. **@s42 fija el orden: base → 920 → 430.** La spec lo dice («el orden de la hoja no cambia»). Lo convierto en
   aserción porque no es cosmético: con el `@media` delante de `.disparador { display: none }`, «Menú» no
   aparecería nunca.
3. **@s42 exige `flex-direction: column` en `.lista`.** E-2-C1 dice «en columna». @s35 no lo exigía.
4. **@s42 veta `921px`,** por lo mismo que @s35 veta `431px`: con un solo `max-width` no queda hueco fraccionario.
5. **@s43 es un Outline por carga de fuentes, con un ancla** (`document.fonts.check('1em "Gilda Display"')` true o
   false) que demuestra que el bloqueo funcionó. Los altos 75/71 px van «medidos», como registro. El contrato es
   «≤ 76 px y el MISMO alto en cada tramo», para no atarse a redondeos de subpíxel.
6. **La parte de E-2-C4 «a 920 px Tab de «Menú» a «Reservar»; a 921 px Tab de «FAQ» a «Reservar»»** la cubren las
   filas 920/921 de @s39, sin duplicarla en @s43. «@s32 y @s39 a sus anchos de siempre» queda como instrucción
   en el comentario de @s43 y en la traza, no como `Then`.

### Ambigüedades para el lead

1. **`feature_list.json` de F-06** (entrada 6, `acceptance`, líneas ~139-140) sigue diciendo «max-width: 820px» y
   «el breakpoint (820px, …)». No lo he tocado: la instrucción era solo F-25, y E-2-C3 no lo lista. Si el
   acceptance de F-06 debe reflejar el contrato vigente, hay que añadirle «(920px desde la ENMIENDA E-2 de F-25)».
2. **`project-spec.md` E-1-C4** (≈ línea 3846) dice «el `@media (max-width: 820px)` sigue intacto (F-06 @s17)». Es
   historia de E-1, pero se lee como contrato vigente. Es tuyo si quieres anotarlo.
3. **Duplicación intencionada:** «NO contiene `max-width: 820px`» está en @s20 (lo pediste) y en @s42. El TDD puede
   cubrir las dos aserciones con un único `expect`, siempre que cada `describe` cite su tag.
4. **Fuentes «bloqueadas» en @s43.** He escrito «las peticiones de fuentes del sitio (.woff2) … Network.setBlockedURLs».
   Tu verificación previa usó `route` de Playwright solo para Great Vibes. La medida de E-2 (908 px) es con TODAS
   las fuentes bloqueadas (marca de 141,8 px), así que el `.feature` pide bloquear todas.
