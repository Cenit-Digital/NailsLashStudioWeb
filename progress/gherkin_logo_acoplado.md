# gherkin_logo_acoplado

`features/logo_acoplado.feature` NUEVO (2026-09-29, gherkin_author). Tiene 33 escenarios, @s1-@s33:
27 son de puerta unitaria (@s1-@s27) y 6 de verificación en vivo con Chrome (@s28-@s33, tag
`@verificacion-viva`, precedente `tipografia_global` @s8/@s9). Fuente: `project-spec.md` §F-25, más el brief
`progress/brief_foto_logo_catalogo.md` §2, §5 y §6. No he tocado `src/`, los tests, `project-spec.md` ni
`feature_list.json`: F-25 sigue `pending` y el lead marca `spec_ready`.

`pnpm exec prettier --check` no procesa `.feature` («No parser could be inferred»), así que no aplica. Las tablas
del fichero se han comprobado con un script: todas las filas tienen el mismo número de celdas.

## Escenarios y mapa @s → contrato

| @s  | Qué fija                                                                                                                          | Dónde se prueba                 | Contrato / decisión       |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------- |
| s1  | Horneado: `data-logo="texto"`, `data-vuelo="no"`, href `/`, sin `style`; querySelector solo en efecto                             | renderToString                  | LA-C1, LA-C2, LA-C9, LA-3 |
| s2  | Las dos representaciones horneadas, `aria-hidden`, viewBox y `<text>` «Nails Lash», sin ids ni máscara                            | renderToString                  | LA-C1, LA-4, LA-5, P3     |
| s3  | Nombre accesible EXACTO «Nails Lash Studio» y href en los tres estados; `class` constante                                         | jsdom + IO sustituido           | LA-C1, LA-5, F-06 @s15    |
| s4  | Derivación: con NOMBRE y VISTA_MARCA sustituidos por vi.mock, el logo los sigue                                                   | renderToString (fichero propio) | LA-15, I-7, P3            |
| s5  | Observador: una construcción, `{ threshold: 0, rootMargin: "-74px 0px 0px 0px" }`, observa el disparo; nada sin entrega; limpieza | jsdom                           | LA-C4, LA-C10, LA-6       |
| s6  | Disparo por geometría, no por isIntersecting; frontera `<=`                                                                       | jsdom                           | LA-C4, LA-7               |
| s7  | Borde de la cabecera medido EN el callback (menú móvil abierto)                                                                   | jsdom                           | LA-C4, caso límite 13     |
| s8  | Monotonía P2: desconecta y nada vuelve a «texto»                                                                                  | jsdom                           | LA-C5, P2                 |
| s9  | Sin persistencia: montar de nuevo vuelve a «texto»; storage nunca tocado                                                          | jsdom                           | LA-C5, LA-9               |
| s10 | ¿Vuelo o no? Primera entrega y la regla «a menos de un viewport» (frontera −812/−811)                                             | jsdom                           | LA-C6, LA-9               |
| s11 | Valores FLIP exactos en el `style` del `<a>` (325px / −75px / 4), con señuelo y escala por el ancho                               | jsdom                           | LA-C2, LA-C7, LA-2        |
| s12 | Sin origen o con ancho 0: acople sin vuelo y sin errores                                                                          | jsdom                           | LA-C6.3, LA-C7            |
| s13 | Ni matchMedia, ni animate, ni "scroll"/"resize"; con reduce marca `data-vuelo="si"` igual                                         | jsdom                           | LA-1, LA-C6, LA-6         |
| s14 | Sin IntersectionObserver o sin disparo: «texto» para siempre, sin errores                                                         | jsdom                           | LA-C9, LA-C10             |
| s15 | El vuelo en la hoja: 0,9 s, la curva, 0,35 → 1 y `soltar` 0,4 s lineal; sin fill-mode                                             | bytes SCSS                      | LA-1, LA-10, LA-C3        |
| s16 | Reduced-motion: `animation: none` con el selector COMPLETO, y después de la regla del vuelo                                       | bytes SCSS                      | LA-11, C-4                |
| s17 | Hueco estable: `inline-grid`, `grid-area: 1 / 1`, visibilidades, base = horneado, `.soloLectores`                                 | bytes SCSS                      | LA-4, LA-C3, I-4          |
| s18 | Alto 2,5 rem y tope de 2,75 rem                                                                                                   | bytes SCSS                      | LA-13                     |
| s19 | `fill: var(--ink)`, Great Vibes, `pointer-events: none`, sin opacity ni --accent; MINIMO_DE_PARES 18                              | bytes SCSS + puerta-contraste   | LA-12, LA-C12, D-5        |
| s20 | Enmienda F-06: `.marca` se muda, el 820 px se queda, @s12/@s16 intactos                                                           | bytes + renderToString          | LA-14, F-06               |
| s21 | Enmienda F-07: dos `data-acople` literales, h1 intacto, ids únicos                                                                | renderToString(<Hero />)        | LA-C9, LA-8, F-07         |
| s22 | El hero sigue su ceremonia; ningún nodo nuevo; el rótulo no se toca                                                               | jsdom con Hero + Cabecera       | LA-C8, LA-16, LA-2        |
| s23 | Home: un solo h1, logo sin encabezados ni ids, anclas con 0 violaciones                                                           | renderToString de la home       | LA-C1, F-04/F-05/F-06     |
| s24 | Puras: `estadoTrasObservar` y `debeVolar` por valor en sus fronteras                                                              | logica.test.ts                  | LA-C11                    |
| s25 | Puras: `transformacionFlip`, `variablesDeVuelo` y `margenDeRaiz` por valor                                                        | logica.test.ts                  | LA-C11 (D-1)              |
| s26 | Guardas de fuente (literales que Stryker nunca inyecta)                                                                           | bytes TS                        | LA-15, LA-1, LA-9         |
| s27 | `mutate` con los dos ficheros; 100 % (equivalente `[]` documentado)                                                               | JSON + mutation_tester          | LA-C11                    |
| s28 | EN VIVO: HTML crudo de dist/, sin avisos de hidratación, firma sin minúsculas ni recorte                                          | Chrome + CDP                    | LA-C13, D-5               |
| s29 | EN VIVO: disparo exacto y vuelo visible (getAnimations), scroll a 1/2/100 px, sin desbordamiento                                  | Chrome + CDP                    | LA-C4, LA-10, D-1         |
| s30 | EN VIVO: P2 al volver arriba; recargas; clic en el logo; bfcache                                                                  | Chrome + CDP                    | P2, LA-9                  |
| s31 | EN VIVO: reduce sin vuelo, y activado a mitad de vuelo; observación de D-3                                                        | Chrome + CDP                    | LA-11                     |
| s32 | EN VIVO: alto idéntico y ≤ 76 px, CLS 0 a 7 anchos; Great Vibes bloqueada                                                         | Chrome + CDP                    | LA-4, LA-13, LA-C13       |
| s33 | EN VIVO: árbol a11y, `pointer-events`, fuente propia, legibilidad                                                                 | Chrome + CDP                    | LA-5, LA-C12              |

La cabecera del `.feature` trae, además, la traza completa: LA-C1..C13, los casos límite 1-20, las enmiendas y
el acceptance de `feature_list.json`. También fija los ARTEFACTOS y los nombres de ficheros y selectores, la
GEOMETRÍA DE REFERENCIA común a todos los escenarios de jsdom y las prohibiciones anti-tautología.

## Dudas para la puerta humana

1. **D-1 (BLOQUEANTE; recomiendo devolverla al spec_partner antes de aprobar).** LA-C4/LA-C11 fijan
   `rootMargin = −Math.ceil(altoCabecera)`. Con eso, la línea del observador (y = 74) queda POR DEBAJO del borde
   de la cabecera (73,2). El navegador avisa cuando el borde de «STUDIO» cruza y = 74, así que el aviso puede
   llegar con ese borde en (73,2; 74). En ese caso `estadoTrasObservar` devuelve «texto» y, como «STUDIO» ya no
   interseca, el observador no vuelve a avisar mientras siga subiendo: **el acople se pierde** hasta que la
   persona baje y vuelva a subir. Con scroll lento (Δ de 1-2 px por fotograma, trackpad o DPR 2) la probabilidad
   ronda 0,8/Δ, es decir, alta. La justificación de la spec («un borde fraccionario nunca deja 1 px asomando») va
   al revés: ceil es justo lo que deja asomar hasta 1 px al avisar. **Propuesta:** `Math.floor`, o el alto sin
   redondear, pone la línea en el borde o por encima, y así todo aviso de salida cumple `<=`. Si se acepta,
   cambian los valores de @s5 y @s25 («-73px…»; 70,01 → «-70px…») y el comentario de LA-C4. La forma de los
   escenarios no cambia. @s6 (fila 73,7) y @s29 (pasadas de 1 y 2 px) dejan el caso a la vista.
2. **D-2.** El rootMargin se fija al montar. Si la cabecera encoge después (por ejemplo, al redimensionar
   cruzando los 820 px: ≈ 74 px con hamburguesa y ≈ 70 px con la nav horizontal), la ventana de D-1 crece hasta
   ≈ 4 px incluso con floor. Hay dos opciones: aceptarlo como caso raro o rehacer el observador al cambiar el alto.
   Ningún escenario lo fija.
3. **D-3.** Si se acopla con `reduce` activo, queda `data-vuelo="si"`. Si la persona retira `reduce` más tarde, la
   regla del vuelo vuelve a aplicarse, `animation-name` pasa de `none` a `acoplar` y el vuelo se reproduce desde el
   origen ANTIGUO. La spec no lo trata. En @s31 lo he dejado como observación en vivo, no como contrato.
4. **D-4.** La spec no dice qué entrada decide si una sola entrega trae varias del mismo disparo. Recomiendo la
   última. Ningún escenario lo fija.
5. **D-5 (derivado, ya contratado en @s19 y @s28).** Las reglas que se mudan de `.marca` incluyen
   `text-transform: lowercase` y `letter-spacing: 0.06em`. Si se quedan en `.marca`, el `<text>` del `<svg>` las
   hereda: la firma saldría en minúsculas, con 60 unidades de separación por letra, y la «h» se saldría del
   viewBox (el recorte que F-07 ya sufrió). @s19 las pone en `.logoTexto`. La puerta debe ratificarlo; la
   alternativa es neutralizarlas en `.logoCaligrafia`.
6. **Derivados menores (para ratificar):** en @s5, el `disconnect` al desmontar antes de acoplar (la limpieza
   del efecto; sin ella sobrevive un mutante). En @s16, que el `@media (reduce)` vaya DESPUÉS de las reglas del
   vuelo: con el selector completo empatan en especificidad y decide el orden. En @s1, que
   `document.querySelector` no se llame durante `renderToString`, la forma medible de «nunca en el render».
7. **@s23:** solo exige que `tinta-marca`/`trazo-marca` sean únicos y que el logo no aporte ids. No exige
   «ningún id repetido en toda la home», porque no se ha medido si hoy la home ya cumple eso.
8. **Nombres fijados aquí** (la spec no los daba): los ficheros de test, el selector `.soloLectores` y que el
   `<text>` no necesita clase propia (`fill` y `font-family` pueden ir en un bloque que empiece por `.logoCaligrafia`).
