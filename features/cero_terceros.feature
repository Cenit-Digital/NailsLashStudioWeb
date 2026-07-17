# Contrato de la feature 5 (`cero_terceros`) de feature_list.json.
# Destilado de project-spec.md → «Feature 5: cero_terceros — la petición que nunca sale, y la
# puerta que lo demuestra».
#
# =============================================================================================
# ✅ **APROBADO POR LA PUERTA HUMANA EL 2026-07-17.** El humano cerró **las cuatro preguntas**
#    (A-23, A-24, A-27, A-28) y aprobó **ESTE** contrato, con **estos 40 escenarios, tal cual**.
#    El registro vive también en `feature_list.json` §5 → campo **`puerta_humana`**. **Donde este
#    fichero y ese campo se leyeran distinto, MANDA `feature_list.json`: es el acta.**
# =============================================================================================
# ✅✅ **AMPLIACIÓN APROBADA POR LA PUERTA HUMANA EL 2026-07-17 — DE 40 A 43 ESCENARIOS.**
#    **Tras la ESCALADA de la prueba de mutación** (`progress/mutation_cero_terceros.md`: **10
#    supervivientes REALES**, verificados **uno a uno por sabotaje manual**, con **0 exclusiones** —
#    A-23 no daba licencia para excluir nada, así que **se midió y se escaló**, que es exactamente
#    lo que el contrato mandaba hacer).
#
#    🔴🔴 **EL PORQUÉ, Y ES LA LECCIÓN ENTERA DE LA TANDA: LA MUTACIÓN NO ENCONTRÓ CÓDIGO DE MÁS.
#    ENCONTRÓ CONTRATO DE MENOS.** **PRECEDENTE EXACTO — `@s5` DE F-01**, donde la mutación reveló
#    que el escenario **no fijaba el `+` del regex del teléfono** y **el humano aprobó una fila más**
#    (`| 600  123  456 |`): **la salida fue una FILA EN EL CONTRATO, con la producción SIN TOCAR.**
#    Es también lo que ya pasó en **F-03** (19 %→100 %, solo arreglando los tests) y en **F-04**
#    (58 supervivientes, **0 exclusiones**). **Van cuatro features seguidas con el mismo patrón.**
#
#    ✅ **DECISIÓN 1 DEL HUMANO — SE AÑADEN LAS FILAS/ESCENARIOS QUE MATAN LOS 10. LAS GUARDAS
#    DEFENSIVAS SON CORRECTAS Y SE QUEDAN.** Sin ellas el detector **LANZA TypeError** ante HTML
#    malformado y —lo peor— **un `<base>` sin `href` seguido de uno válido a un tercero haría que la
#    petición al tercero fuera INVISIBLE: un FALSO NEGATIVO, el peor fallo posible para esta
#    feature** (@s42). **LO QUE FALTABAN ERAN LOS ESCENARIOS, NO EL CÓDIGO.** **Un `tdd_craftsman`
#    que «matara» estos mutantes borrando las guardas ROMPERÍA LA FEATURE.**
#    ✅ **DECISIÓN 2 DEL HUMANO — EL `:58` (`ATRIBUTO`) SE FIJA CON UN TEST.** **El espaciado
#    alrededor del `=` es OPCIONAL en HTML** [V], así que **tolerarlo es CORRECTO**: un
#    `<img src = "https://cdn.tercero.com/a.png">` **DEBE detectarse** (@s1, última fila). **El
#    comentario de `terceros.ts:57` pasa de PROMESA SIN PUERTA a HECHO VIGILADO.**
#
#    **QUÉ CAMBIA, EXACTAMENTE — Y NO CAMBIA NADA MÁS:**
#      - **3 FILAS NUEVAS en escenarios que ya existen** (la forma que ya usó F-01 con `@s5`):
#        **@s1** +2 (`src` con un ESPACIO en la URL → mata `:278`; `src = "…"` con espacios en el
#        `=` → mata `:58`) y **@s9** +1 (`<base href="http://[">`, URL inválida → mata `:241`).
#      - **3 ESCENARIOS NUEVOS, y SOLO porque no encajaban en ninguno de los 40**: **@s41**
#        (HTML malformado: `<link>` sin `rel`, `<link rel>` sin `href` con la base a un tercero,
#        `<img src>` inválido → mata los 4 del grupo A y el `:299`), **@s42** (`<base>` sin href
#        seguido de `<base href>` a un tercero → mata `:240`) y **@s43** (un recurso `html` con
#        `@font-face` inline → mata `puerta-terceros.ts:159`).
#      - 🔴 **NINGUNO DE LOS 40 ESCENARIOS APROBADOS SE HA TOCADO, BORRADO NI REINTERPRETADO.**
#        **Solo se les han AÑADIDO FILAS.** **NI UNA DECISIÓN DE F-05 CAE.**
#      - 🔴 **EL UMBRAL SIGUE SIENDO 1.0 CON 0 EXCLUSIONES.** Esta ampliación **NO excluye ni
#        justifica NI UN mutante**: los mata **con contrato**. **A-23 sigue vigente ENTERA.**
#
#    ⚠️ **CADA FILA DE ESTA AMPLIACIÓN SALE DEL INFORME DE MUTACIÓN §4-§5 Y ESTÁ REMEDIDA CONTRA EL
#    CÓDIGO REAL DE `src/lib/` EL 2026-07-17 — NO SE HA INVENTADO NINGUNA, Y NINGUNA SE SUSCRIBE «DE
#    MEMORIA».** Los dos hechos que **más fácilmente se pierden al copiar** van escritos donde
#    duelen: **la fila 2 de @s41 y el fixture de @s42 NECESITAN el `<base>` A UN TERCERO / los DOS
#    `<base>`** — **con la base propia o con un solo `<base>`, el mutante es INDISTINGUIBLE y
#    SOBREVIVE** [V, medido]. **Y el `Then` de la fila del espacio ASEVERA EL `valor`, no la cuenta:
#    es la lección literal de la tanda** («@s24 mataba CERO porque su `Then` solo aseveraba conteos,
#    ciegos a las mutaciones de valor»).
# =============================================================================================
# 🔧 **RONDA DE REPARACIÓN (2026-07-17) — TRAS UNA REVISIÓN ADVERSARIAL DE 31 AGENTES / 6 LENTES.**
#    **23 hallazgos confirmados (3 BLOQUEANTES, 14 GRAVES, 6 MENORES): 21 aplicados, 2 RECHAZADOS
#    CON MEDICIÓN.** Detalle completo en `progress/gherkin_cero_terceros.md` §Ronda de reparación.
#    **El patrón, por tercera feature seguida: NINGUNA decisión de F-05 cayó. Cayeron los PORQUÉS.**
#    **Los tres bloqueantes habrían estrellado el TDD o dejado la feature sin cerrar:**
#      1. **@s24 / fila `Regex`**: el contrato decía que los mutantes `Regex` salen de las **anclas**
#         y que «si el diseño no usa anclas, ese mutante no existe». **FALSO E INVERTIDO** —
#         remedido: `/\s+/` **sin una sola ancla → 2 mutantes**. Reescrito, y **@s24 ahora asevera
#         EL ORIGEN, no solo la cuenta** (por eso mataba CERO).
#      2. **@s26**: el `Given` **no declaraba `paresEsperados`** → el test **nacía ROJO contra una
#         implementación correcta**. Es la forma exacta del `4,60` de F-03. Reparado.
#      3. **@s28/@s30 + ANTI-TAUTOLOGÍA**: la prohibición absoluta de importar
#         `PARES_DE_FUENTE_ESPERADOS` **prohibía el ancla que F-04 ya usa y que este contrato citaba
#         como precedente**, y **@s30 NO mata a `ArrayDeclaration`** (lo mata **@s38**, que no
#         existía). Ejes separados; **@s38 y @s39 añadidos**.
#    ⚠️ **DOS CORRECCIONES PROPUESTAS FUERON RECHAZADAS POR MEDICIÓN PROPIA, y queda escrito para que
#    nadie las reintroduzca «de memoria»:** las filas `rel="alternate<TAB>stylesheet"` / doble espacio
#    **NO matan `\s+`→`\s`** (equivalente para la pertenencia al conjunto) y `url('a"b')` **NO mata
#    `[^']`→`[']`** (espera 0: la mutación no mueve la cuenta). **Ver @s7 y @s24.**
# =============================================================================================
# ✅ **LAS CUATRO DECISIONES DEL HUMANO, LITERALES (2026-07-17)**
# =============================================================================================
# ✅ **A-23 — APROBADA la propuesta del lead.** Los acceptance **2** y **5** quedan **REESCRITOS en
#    `feature_list.json` §5** (ya aplicado; **es la letra vigente, léela allí**): el **2** pasa a
#    *«una **PETICIÓN AUTOMÁTICA** a un origen externo»* y el **5** nombra **mutadores REALES** y
#    **PROHÍBE** pedir que se mute `.includes`. **Este contrato ya destilaba esa propuesta: ahora
#    NO destila una propuesta, destila EL ACCEPTANCE VIGENTE.**
#    🔴🔴 **EL HUMANO ELIGIÓ LA OPCIÓN (a) — SIN supervivientes `Regex` preaprobados: EL UMBRAL DE
#    F-05 SIGUE SIENDO 1.0, CON 0 EXCLUSIONES.** La opción (b) —justificar supervivientes por
#    escrito y bajar el umbral— **FUE RECHAZADA**. **NO HAY LICENCIA PARA EXCLUIR NADA.**
#    **Si un mutante `Regex` resiste, el `tdd_craftsman` ESCALA AL HUMANO** — **NO lo excluye, NO
#    lo justifica por su cuenta, NO baja el umbral.** *Es lo que ya funcionó en F-03 (19 %→100 %
#    sin tocar producción) y en F-04 (58 supervivientes, 0 exclusiones).*
# ✅ **A-24 — APROBADA.** La `puerta_legal` de **F-05 Y la de F-11** están **corregidas en
#    `feature_list.json`** (ya aplicado). **La justificación de F-05 es CRITERIO DE PROYECTO, NO
#    UNA NORMA.** Las prohibiciones de vocabulario de este fichero **siguen vigentes y ahora son
#    la letra del `feature_list`, no una propuesta**.
# ✅ **A-27 — APROBADA la postura del lead: LA DEUDA SE QUEDA DECLARADA.** F-05 **NO TOCA**
#    `tools/puerta-placeholders.ts` **ni** `features/puerta_placeholders.feature` (**Ley 1**).
#    F-05 **SÍ** filtra por extensión en **SU PROPIA** puerta (@s34, @s40). **La deuda de F-01
#    sigue VIVA y DECLARADA**, y cerrarla es otra feature, del humano.
# ✅ **A-28 — APROBADA la propuesta del lead: SOLO subset `latin`.** Cubre `U+0000-00FF` (todo el
#    español). **`PARES_DE_FUENTE_ESPERADOS` NO CAMBIA: los 6 pares se quedan.** **EL LÍMITE QUEDA
#    DECLARADO POR ESCRITO:** un nombre con `Ł`/`ř`/`ğ` **pinta TOFU, sin error**; **`latin-ext`
#    entrará el día que exista un nombre REAL que lo exija, y entrará CON SU ESCENARIO.**
#
# 🟢 **PARA EL `tdd_craftsman`: LA PUERTA ESTÁ ABIERTA. PUEDES IMPLEMENTAR F-05.** Ya no hay
#    ningún criterio de aceptación en disputa. **BAJO ESTAS CONDICIONES, QUE NO SON NEGOCIABLES:**
#      1. **Ley 1**: ni una línea de producción sin un test rojo que la exija.
#      2. **Los 40 escenarios de este fichero son el contrato APROBADO.** No se añaden, no se
#         borran y no se reinterpretan. Si al implementar descubres que uno es **imposible o
#         falso**, **PARAS y devuelves el control al lead** — es el precedente de F-03.
#      3. **UMBRAL 1.0, 0 EXCLUSIONES (A-23).** **Un superviviente NO se excluye ni se justifica:
#         SE ESCALA AL HUMANO.** Vale para `Regex` y **para cualquier otro mutador**.
#      4. **F-05 NO TOCA `tools/puerta-placeholders.ts` (A-27)** ni ninguna feature `done`.
#      5. **PROHIBIDO el vocabulario normativo falso (A-24)** en el código, en los tests y en los
#         mensajes de violación. Ver el bloque «PROHIBIDO EN ESTE FICHERO».
#
# =============================================================================================
# FUENTE DE VERDAD DE LOS HECHOS: `progress/f05_verificacion_previa.md`
# =============================================================================================
# 16 subagentes, 8 afirmaciones × verificar + refutar adversarialmente: **0 refutadas de raíz, 8
# de 8 con algo tumbado**. **Donde `feature_list.json` §5, el troceado de
# `docs/research/00-fase0-informe.md` §7 o `project-spec.md` contradigan a esa verificación,
# MANDA LA VERIFICACIÓN.** Se contradicen en tres puntos graves: el acceptance 2, la
# `puerta_legal` y la descripción → **A-23** y **A-24**.
#
# El patrón de F-04, otra vez y más fuerte: **la decisión es correcta; el porqué escrito es
# falso.** **Ninguna decisión de F-05 cae. Lo que cae son los porqués.**
#
# NO HUBO CONVERSACIÓN DE SPEC CON EL HUMANO PARA F-05, y ni la spec ni este contrato la simulan.
# El humano **delegó** la fase en el `craftsman_lead` **hasta la puerta de aprobación de este
# `.feature`**, que sigue **EN PIE**. Quien hizo de adversario en lugar del humano fue la
# verificación previa. **Eso NO sustituye a la puerta.**
#
# =============================================================================================
# 🔴 LA BOMBA DE F-05: EL ACCEPTANCE 2, ESCRITO COMO ESTÁ, ES INSATISFACIBLE (A-23)
# =============================================================================================
# `feature_list.json` §5 exige literalmente: *«El build falla si el artefacto contiene **CUALQUIER**
# origen externo»*, con *«allowlist vacía»*. **Medido sobre el `dist/` real de HEAD, ANTES de
# investigar nada** [V, §0 de la verificación]:
#
#       7 http://www.w3.org/1999/xlink            } namespaces XML del bundle de React
#       5 http://www.w3.org/2000/svg              }
#       3 http://www.w3.org/XML/1998/namespace    }
#       3 http://www.w3.org/1998/Math/MathML      }
#       2 https://schema.org                      → el @context del JSON-LD de F-04 (feature `done`)
#       2 https://react.dev/errors/               } literales de mensajes de error de React
#       1 http://fb.me/use-check-prop-types       }
#       1 https://www.facebook.com/nailslashstudiorozas/  → literal de `REDES.facebook` (`site.ts:47`)
#         INLINEADO EN EL BUNDLE `.js` por el grafo de imports vía `registros` (`site.ts:135`).
#         🔴 **NO es un `<a href>`: HOY NO EXISTE NINGUNO en `dist/index.html`** [V, remedido
#         2026-07-17: `grep -o '<a href="[^"]*"' dist/index.html` → SOLO `#servicios-titulo`,
#         `#contacto-titulo` y `tel:+34625223366`; `grep -c facebook dist/index.html` → **0**;
#         única ocurrencia en `dist/assets/app-BPAduMZD.js`; `grep -rn "REDES" src/ --include=*.tsx`
#         → **0: ningún componente lo renderiza**]. Mismo mecanismo que el `schema.org` de §2
#         (Rollup inlinea la constante). **El `<a href>` lo crea F-12.** (F-02, `done`)
#       1 https://example.invalid/                } la canónica de F-04: TLD RESERVADO RFC 2606,
#       1 https://example.invalid                 } DELIBERADA (A-21)
#
# **DIEZ orígenes externos en el artefacto de hoy. NI UNO SOLO ES UNA PETICIÓN A UN TERCERO** [V].
# **No se puede borrar `http://www.w3.org/2000/svg` del bundle de React**, y borrar `schema.org` o
# `example.invalid` **ROMPERÍA F-04, QUE ESTÁ `done`**. Es un **error de hecho del troceado**,
# hermano del `@s32` de F-04.
#
# 🔴 **LA PRUEBA, SEPARADA POR ALCANCES — Y ASÍ ES MÁS FUERTE, NO MÁS DÉBIL.** La revisión
# adversarial cazó que este bloque mezclaba dos lecturas y atribuía a F-02 una rotura imposible:
#   - Leído sobre el **ARTEFACTO ENTERO** —que es **como está escrito el acceptance 2**— es
#     **insatisfacible por los diez**, y **8 de ellos ni siquiera se pueden borrar** (están dentro de
#     React o son datos que Rollup inlinea).
#   - Leído sobre el **ALCANCE `(html|css)` del acceptance 1**, que es **lo que esta puerta lee de
#     verdad** (@s34), el detector ve **DOS**, y **los DOS son de F-04** [V, remedido hoy
#     clasificando el MISMO grep de §0 **por fichero**]: `https://example.invalid/` (la canónica,
#     A-21) y `https://schema.org` (el `@context` del JSON-LD). **BASTAN POR SÍ SOLOS para hacer
#     insatisfacible el acceptance 2 y romper F-04, que está `done`** — no hace falta invocar a
#     React ni a F-02.
#   - 🔴 **F-02 NO SE PUEDE ROMPER POR ESTA PUERTA**: su URL de Facebook vive en
#     `dist/assets/app-BPAduMZD.js`, **un `.js` que el filtro de @s34 nunca lee**. Y los 4 namespaces
#     de React viven en `client-BZFsEVlP.js`: **la puerta NUNCA los lee**, así que **no pueden ser
#     «la mitad de la prueba» de nada** (@s13 lo decía; corregido allí).
# **Medido por fichero** [V]: `dist/index.html` → **2** · `app-BPAduMZD.js` → 5 ·
# `client-BZFsEVlP.js` → 19 ocurrencias · `dist/assets/*.css` → **0 URL, 0 `url(`**.
#
# → **LA DISTINCIÓN QUE ES LA FEATURE: petición automática ≠ hiperenlace.** Y **el HTML Living
#   Standard la nombra él mismo** (§4.6.1), clasificando los `<link>` en **external resource link**
#   frente a **hyperlink** [V, literal]:
#     «These are links to resources that are to be used to augment the current document, generally
#     automatically processed by the user agent. **All external resource links have a fetch and
#     process the linked resource algorithm** which describes how the resource is obtained.»
#     «These are links to other resources that are **generally exposed to the user** by the user
#     agent **so that the user can cause the user agent to navigate** to those resources…»
# → **SIN ESTA DISTINCIÓN, F-05 ES INSATISFACIBLE.** Este contrato destila el eje **«petición
#   automática»** — ✅ **APROBADO POR LA PUERTA HUMANA EL 2026-07-17 (A-23): es la letra vigente
#   del acceptance 2 en `feature_list.json` §5.**
#
# =============================================================================================
# ✅ LAS CUATRO PREGUNTAS — **LAS CUATRO CERRADAS POR EL HUMANO EL 2026-07-17**
# =============================================================================================
# *Se conserva el razonamiento entero, con sus mediciones, porque es lo que el humano leyó para
# decidir. Lo que cambia es el estado: ya no son preguntas, son **decisiones registradas**.*
#
# ✅ **A-23 — CERRADA: APROBADA la propuesta del lead.** Acceptance 2 (*«CUALQUIER origen
#   externo»*) era **insatisfacible** y acceptance 5 (*«mutar … el predicado de allowlist»*) era
#   **inmedible**: **nombraba «el predicado» sin decir qué mutador lo ataca**. **Los DOS quedan
#   REESCRITOS en `feature_list.json` §5**: el 2 como *«una **PETICIÓN AUTOMÁTICA** a un origen
#   externo»* y el 5 **nombrando mutadores REALES** (`ArrayDeclaration`, `FilterRemoval`,
#   `BooleanLiteral`, `EqualityOperator`, `StringLiteral`, `MethodExpression`, `Regex`) y
#   **prohibiendo** pedir que se mute `.includes`.
#   **Subordinada a A-23 y NO destilada aquí:** la regla de `font-display: swap` (hoy **fuera del
#   acceptance**; es hecho **MEDIDO** —**164/164 `@font-face` en las TRES FAMILIAS QUE F-05 HORNEA**
#   (`@fontsource` 5.2.8), `swap` único valor presente, **0 sin `font-display`**— **pero NO
#   documentado**: la doc oficial no lo menciona y un bump de versión podría cambiarlo sin romper
#   promesa escrita [V]). *🔴 **ÁMBITO CORREGIDO: decía «176/176», y ese número solo cuadra sumando
#   los 12 `@font-face` de `@fontsource-variable/manrope`** — el paquete que este mismo contrato
#   manda NO usar y que @s29 fila 6 convierte en violación. **El número era cierto y la conclusión
#   no cambia** (`swap` es el único valor en las dos lecturas), pero el ámbito no estaba escrito.*
#   **Si el humano la quiere, entra con su escenario; hoy NO está y no se finge que esté.**
#
#   🔴 **LA SUB-PREGUNTA DE A-23 QUE LEVANTÓ LA REVISIÓN ADVERSARIAL — TAMBIÉN CERRADA:**
#   **el mapa mutante modelaba `Regex` como «las anclas `^`/`$`» y declaraba @s24 «condicional al
#   diseño». Es FALSO Y AL REVÉS** (ver el mapa mutante). Con **`mutation.threshold` = 1.0 y 0
#   exclusiones** [V: `harness.config.json`; `stryker.config.json` → `break: 100`], **habrá mutantes
#   `Regex` sí o sí**. El humano decidió **por escrito, en la puerta**:
#     ✅ **(a) — ELEGIDA. LA PROPUESTA DEL LEAD.** **@s24 crece con filas que MUERDAN de verdad**, y
#         el escenario **asevera el ORIGEN, no solo la cuenta** (ver @s24: **medido, las filas de
#         hoy matan CERO**). **Es lo que hizo F-03**, que pasó de 19 % a 100 % **sin tocar
#         producción, solo arreglando los tests**. Y **es lo que ya funcionó en F-04**: 58
#         supervivientes, **0 exclusiones**.
#     ❌ **(b) — RECHAZADA POR EL HUMANO.** *No* se acepta que un superviviente `Regex` se
#         **justifique** en `progress/mutation_cero_terceros.md`, y **el umbral de F-05 NO baja**.
#
#   🔴🔴 **CONSECUENCIA OPERATIVA, Y ES LA LÍNEA QUE EL `tdd_craftsman` NO PUEDE NO LEER:**
#   **EL UMBRAL DE F-05 ES 1.0. NO HAY NI UN SUPERVIVIENTE `Regex` PREAPROBADO. CERO EXCLUSIONES.**
#   **SI UN MUTANTE `Regex` RESISTE → SE ESCALA AL HUMANO.** No se excluye en `stryker.config.json`,
#   no se justifica en `progress/`, no se baja el umbral, no se declara «equivalente» por cuenta
#   propia. **La única salida autorizada es: una fila más en el contrato, o el humano.**
#   ⚠️ **HONESTIDAD DE MEDICIÓN, Y ES OBLIGATORIA AQUÍ:** los **13 supervivientes `Regex`** y el
#   **78,99 %** que motivan esta pregunta están **MEDIDOS SOBRE UN PROTOTIPO DESECHABLE** de la
#   revisión (que pasa @s1..@s25 en verde, 67/67), **NO sobre el código real de F-05, QUE NO EXISTE**
#   [V: `grep -rln "allowlist|detectarOrigenes" src/` → nada]. **Otra implementación tendrá otro
#   conjunto.** 🔴 **ESTE CONTRATO NO PROMETE UN 100 % QUE NADIE HA MEDIDO SOBRE EL CÓDIGO REAL.**
#   **Si al implementar algún mutante `Regex` resiste, el `tdd_craftsman` ESCALA AL HUMANO** —
#   **NO lo excluye en silencio, NO baja el umbral por su cuenta.** *Excluir un mutante que no se
#   sabe matar es exactamente lo que este fichero llama fraudulento en @s21.*
# ✅ **A-24 — CERRADA: APROBADA.** La **`puerta_legal` de F-05 era una ATRIBUCIÓN NORMATIVA FALSA**
#   y la descripción prometía «elimina banner, CMP y política de cookies **de un plumazo**».
#   **Este contrato nunca heredó ninguna de las dos frases** (ver el bloque siguiente), y ahora
#   **tampoco las tiene `feature_list.json`: la `puerta_legal` de F-05 Y la de F-11 están
#   CORREGIDAS** (ya aplicado el 2026-07-17). **La justificación de F-05 es CRITERIO DE PROYECTO,
#   NO UNA NORMA** — y eso ya no es la lectura del lead: **es la letra del `feature_list`.**
#   **Las prohibiciones de vocabulario de este fichero son ahora NORMATIVAS para el TDD.**
# ✅ **A-27 — CERRADA: APROBADA la postura del lead — LA DEUDA SE QUEDA DECLARADA.**
#   🔴 **F-05 es la PRIMERA feature que mete BINARIOS en `dist/`** → **activa la deuda
#   declarada de F-01**. Medido, sin suponer nada [V]: `tools/puerta-placeholders.ts` lista
#   **todos** los ficheros **sin filtro de extensión** y hace `readFileSync(ruta, 'utf8')`; leyendo
#   los 108 `.woff`/`.woff2` reales de `@fontsource` con utf8 **no lanza**, da **554.818 U+FFFD**,
#   **0 violaciones HOY**, pero **50.100 secuencias candidatas** al regex del teléfono en ese ruido
#   binario. Comprobado **end-to-end** inyectando un `.woff2` real en `dist/assets/`: **las tres
#   puertas pasan, exit 0** [V]. **El falso positivo es POTENCIAL, no determinista, y no se ha
#   observado un fallo real** — pero *«0 violaciones»* **no significa que el hueco esté cerrado**:
#   los ficheros que entran en `dist/` tras el pipeline de Vite **no son byte a byte** los de
#   `node_modules`.
#   🔴 **DECIDIDO POR EL HUMANO: F-05 NO TOCA `tools/puerta-placeholders.ts` NI
#   `features/puerta_placeholders.feature`, Y ESTE CONTRATO NO TIENE NI UN ESCENARIO SOBRE ELLOS.**
#   La deuda es **de F-01** (feature **`done`**), y `progress/current.md:477-478` ya
#   declara que cerrarla **exige un escenario nuevo en `features/puerta_placeholders.feature`**.
#   Hacerlo dentro de F-05 sin ese escenario sería **producción sin test rojo: violación de la
#   Ley 1**. **Reabrir una feature `done` es decisión del humano, y HOY NO LA HA TOMADO: la deuda
#   de F-01 SIGUE VIVA Y DECLARADA.**
#   **Lo que F-05 SÍ hace, y está en @s34 Y @s40:** su **propio** humilde **filtra por extensión**
#   (`/\.(html|css)$/i`), como `ES_HTML = /\.html$/i` en `tools/puerta-cascaron.ts:23` — cuyo
#   comentario **ya cita el riesgo `.woff2` por su nombre** [V]. **Leer binarios sería un falso
#   positivo esperando a ocurrir**, y eso es justo lo que valida el alcance `(html|css)` del
#   acceptance 1.
#   🔴 **CORREGIDO POR LA REVISIÓN: esa protección NO EXISTÍA.** @s34 era **INERTE** —su `Then` («la
#   puerta NO lee ese fichero») **no era observable** desde el build, y su fixture **no tenía
#   contenido**, así que **un humilde SIN filtro pasaba las 4 filas**— y **el contrato no nombraba en
#   ningún punto el mecanismo de anclaje del humilde**. **Ahora @s34 nace rojo si el filtro se rompe,
#   y @s40 ancla la decisión en el fichero donde vive** (forma `diferidos.test.ts:89-96`).
# ✅ **A-28 — CERRADA: APROBADA la propuesta del lead — SOLO subset `latin`.** `latin-400.css` **NO
#   tiene `unicode-range`** [V] → ese `@font-face` **aplica a TODO el rango**: un carácter fuera del
#   subset latin **no cae al fallback**, pinta **TOFU, sin error**. El latin cubre `U+0000-00FF`
#   (ñ, vocales acentuadas, ¿, ¡) → **suficiente para español**. **El humano decidió ACEPTARLO**:
#   `latin-ext` (**+6 woff2**) **NO entra**. **`PARES_DE_FUENTE_ESPERADOS` NO CAMBIA: los 6 pares se
#   quedan, y la tabla de @s28 se queda tal cual.**
#   ⚠️ **EL LÍMITE QUEDA DECLARADO POR ESCRITO, QUE ES LA OTRA MITAD DE LA DECISIÓN: un nombre con
#   `Ł`, `ř` o `ğ` DARÁ TOFU, sin error y sin aviso.** Es **decisión de PRODUCTO tomada a
#   conciencia**, no un descuido. **`latin-ext` entrará el día que exista un nombre REAL que lo
#   exija — y entrará CON SU ESCENARIO**, que actualizará @s28 y @s38. **Hoy no existe ese nombre,
#   así que no hay escenario, y NO SE FINGE QUE LO HAYA.**
#
# =============================================================================================
# 🔴 A-24: POR QUÉ EXISTE F-05 — Y LO QUE ESTE CONTRATO TIENE PROHIBIDO DECIR
# =============================================================================================
# `feature_list.json` §5 dice hoy `"puerta_legal": "RGPD (evita el análisis de corresponsabilidad
# de Fashion ID) + art. 22.2 LSSI (sin cookies → sin banner)"`. **ESTE CONTRATO NO HEREDA ESA
# FRASE**, ni ninguna de sus derivadas. Los hechos, medidos:
#   - **El art. 22.2 LSSI NO DICE «cookies»** [V]. Regula «**dispositivos de almacenamiento y
#     recuperación** de datos en equipos terminales», y está redactado como **permiso
#     condicionado**, no como prohibición.
#   - **«Google Fonts no almacena nada en el equipo» es FALSO COMO HECHO** [V, medido 2026-07-17]:
#     ni `fonts.googleapis.com` ni `fonts.gstatic.com` devuelven `Set-Cookie` — **pero** el `.woff2`
#     devuelve `Cache-Control: public, max-age=31536000`. **La caché ES almacenamiento.**
#   - **Si ese cacheo activa el 22.2 es [NV], y en los DOS sentidos** (las dos ramas están [V]): a
#     favor, CEPD *Directrices 2/2023* v2.0 párr. 50 («does constitute storage, at the very least
#     through the caching mechanism») — dicho de *tracking pixels*, sobre el art. 5(3) ePD, cuya
#     letra es **disyuntiva**; en contra, la transposición española y la **Guía de cookies de la
#     AEPD (mayo 2024)** lo formulan en **conjuntivo y con finalidad** (§1 pág. 8: «…**para
#     almacenar y recuperar datos** de un equipo terminal»), y **la caché de un `.woff2` almacena
#     pero no recupera datos del terminal**. **NO hay pronunciamiento de AEPD ni de CEPD sobre CDNs
#     de fuentes** [V].
#   - **AUTOALOJAR ≠ CERO ALMACENAMIENTO.** El `.woff2` **propio TAMBIÉN se cachea**. Lo que
#     autoalojar da es **CERO TERCEROS**, que es otra cosa.
#   - Lo único que se sostiene sin inferencia: **el art. 22.2 no obliga a poner banner por cargar
#     una fuente** — o porque no entra en su ámbito, o porque entraría en la excepción del párrafo
#     3.º. **EN NINGUNA DE LAS DOS RAMAS JUSTIFICA F-05.**
#
# > **LA JUSTIFICACIÓN CORRECTA DE F-05 ES UN CRITERIO DE PROYECTO, NO UNA NORMA:**
# > **«Autoalojamos las fuentes para que el sitio no haga ninguna petición a dominios de terceros;
# > así ningún tercero recibe la IP del visitante y no hace falta ningún análisis jurídico.»**
# > Es **decisión del editor**, **es SUFICIENTE POR SÍ SOLA**, y **NO CUELGA DE NINGUNA CITA**.
#
# **Y por eso es «la decisión de mayor apalancamiento» — pero NO por lo que decía el troceado.** No
# deroga ninguna obligación (no puede). Lo que hace es **sustituir un análisis jurídico por un
# hecho mecánico verificable en cada build**. **El apalancamiento es DE PROCESO, no normativo.**
#
# ❌ **PROHIBIDO EN ESTE FICHERO, EN LOS TESTS Y EN LOS MENSAJES DE VIOLACIÓN** (§6 de la
# verificación): «art. 22.2 LSSI» como justificación · «sin cookies → sin banner» · «elimina
# banner, CMP y política de cookies» · «lo exige la AEPD» · «Google Fonts no pone cookies → fuera
# del 22.2» · «autoalojar = cero almacenamiento» · «Fashion ID obliga a autohospedar» ·
# **«obligatorio» sin sujeto explícito** (todo «obligatorio» se lee «obligatorio **PARA** \<quién\>»).
# *Es la misma regla que F-04 ya tuvo que escribir para schema.org ≠ Google.*
#
# FASHION ID — LO QUE SÍ SE PUEDE DECIR, Y CON QUÉ MARCA
#   **[I] por analogía razonada — y NO se pudo RE-VERIFICAR en fuente primaria el 2026-07-17**:
#   EUR-Lex devuelve **HTTP 202 / 2.035 B de challenge AWS-WAF** en las tres variantes,
#   `publications.europa.eu` da **404** sobre el `cellar:`, y curia sirve un shell SPA [V: medido].
#   *El repo ya lo tenía resuelto y marcado antes que nadie:* `docs/research/legal-rgpd.md:410-416`
#   dice literalmente que el salto **botón social → fuente tipográfica** es «**una analogía
#   razonada, no un pronunciamiento**… **Un tribunal podría distinguir ambos casos. [I]**», y `:575`
#   lo tabula como «discutible [I]». **NADIE PUEDE ASCENDER ESA [I] A CERTEZA.**
#   El **ap. 85 AFIRMA Y LUEGO LIMITA**, y **quien lo cite DEBE reproducir las dos frases**: «…**can
#   be considered to be a controller** […] **That liability is, however, limited to** the operation
#   … in respect of which it **actually determines the purposes and means**…». `jointly`
#   (corresponsabilidad) aparece **SOLO en el ap. 84** [V]. Y **`font`/`typeface` = 0 ocurrencias**
#   en la sentencia (64.423 caracteres, EN y ES) [V] → **LA ANALOGÍA ES NUESTRA, NO DE LA
#   SENTENCIA**. No citar «art. 2(d) Directiva 95/46»: **DEROGADA**; vigente **RGPD art. 26** [V].
#   → Autohospedar es una **TÉCNICA SUFICIENTE** elegida por el proyecto, **NUNCA una obligación**.
#   → 🔴 **F-05 NO PROHÍBE NI CONDICIONA EL `<a href>` A FACEBOOK DE `site.ts:47`** invocando
#     Fashion ID: el predicado fáctico del ap. 27 es la transmisión **AUTOMÁTICA**, «regardless of
#     whether or not he or she … **has clicked**», y `hyperlink` = **0 ocurrencias** en la sentencia
#     [V]. **@s12 lo ancla**, y no es decorativo: **sin él, alguien «endurece» la puerta y ROMPE EL
#     CONTACTO DEL SALÓN** (es dato REAL de la fuente única, y es de **F-12**).
#
# =============================================================================================
# 🔴 LA REGLA DEL CONJUNTO TOKENIZADO DE `rel` — EL FALSO NEGATIVO QUE CASI SE CUELA (@s6, @s7)
# =============================================================================================
# Deducir «`rel="alternate"` es *Hyperlink*, luego no detectar» **DE LA FILA-RESUMEN DE LA TABLA**
# es **FALSO**, y **habría dejado pasar UNA PETICIÓN REAL A UN TERCERO**. Lo cazó el refutador. La
# letra que la desarrolla manda, §4.6.8.1 [V, literal]:
#   «If the element is a link element and the rel attribute **also contains the keyword
#   stylesheet** […] The alternate keyword **modifies the meaning of the stylesheet keyword** […]
#   **The alternate keyword does not create a link of its own.**»
# Y §4.6.8.23: «stylesheet […] **creates an external resource link**».
#   → **`<link rel="alternate stylesheet" href="https://cdn.tercero.com/x.css">` SÍ SE PIDE** (@s6).
#   → **`<link rel="alternate" type="application/atom+xml" href="…">` NO** (@s11). **Son gemelos y
#     van juntos a propósito: la diferencia NO está en la cadena, está en el CONJUNTO.**
#
# > **REGLA DURA DE F-05:** la clasificación se hace sobre el **CONJUNTO TOKENIZADO** de `rel`
# > (**tokens separados por ASCII WHITESPACE** — TAB, LF, FF, CR y espacio), y **los keywords se
# > COMPARAN ASCII case-insensitive**, **NUNCA sobre la cadena completa ni sobre un solo token**.
# > **La tabla de §4.6.8 es un RESUMEN; cuando la sección del keyword desarrolla su significado,
# > MANDA LA SECCIÓN.**
# >
# > 🔴 **CORREGIDO — decía «separados por espacio», que es MÁS ESTRECHO QUE LA NORMA y cae del lado
# > del FALSO NEGATIVO que @s6 existe para cerrar.** §4.6.8, **literal** [V]: «To determine which
# > link types apply to a link, a, area, or form element, the element's rel attribute **must be
# > split on ASCII whitespace**.» E *Infra*, literal: «**ASCII whitespace is U+0009 TAB, U+000A LF,
# > U+000C FF, U+000D CR, or U+0020 SPACE.**» → `rel="alternate<TAB>stylesheet"` **es HTML válido y
# > LA HOJA SE PIDE**; un `rel.split(' ')` **no la ve**. La otra mitad SÍ es literal: «Keywords are
# > always ASCII case-insensitive, and must be compared as such».
# > ⚠️ **PARA EL `tdd_craftsman`: en JS `\s` NO es ASCII whitespace** (incluye `\v`, NBSP y espacios
# > Unicode). La partición correcta es **`/[\t\n\f\r ]+/`**. Un `\s` es sobre-ancho — lado del falso
# > positivo, no del negativo. **Y la CASE-INSENSIBILIDAD es de la COMPARACIÓN de keywords, no de la
# > tokenización** (@s7 lo decía al revés).
#
# =============================================================================================
# LOS DOS EJES QUE LA SPEC NO DECIDE → CRITERIO DE PROYECTO, Y SE DECLARA COMO TAL
# =============================================================================================
# 1. **`preconnect` / `dns-prefetch` CUENTAN** como origen externo (@s3). Son *external resource
#    links* pero **NO descargan recurso**: abren TCP/TLS o resuelven DNS. **NINGUNA SPEC DECIDE EL
#    EJE POR NOSOTROS; hay que elegir uno y no mezclarlos.** El eje de F-05 es **«contacto con un
#    origen externo SIN ACCIÓN DEL USUARIO»** — porque **el tercero recibe la IP igual**, que es
#    exactamente lo que esta feature previene. *Alternativa descartada:* el eje «petición HTTP de un
#    recurso» → **dejaría pasar un `preconnect` a un CDN, que entrega la IP sin descargar un byte**.
# 2. **`url()` en reglas CSS NO APLICADAS SE MARCA** (@s5). **Solo `@font-face` tiene letra
#    normativa** (css-fonts-4 §4.8.1: «user agents **must only download** those fonts that are
#    referred to within the style rules **applicable** to a given page» [V]). Para
#    `background-image` **NINGUNA spec dice CUÁNDO se pide** — css-values-4 §4.5.4 y css-images-4
#    §2.3 solo definen **CÓMO** [V]. **Que Chrome no lo pida es COMPORTAMIENTO OBSERVADO, NO
#    LETRA.** Y **un analizador estático NO PUEDE evaluar qué reglas aplican** → **criterio
#    conservador**. *Alternativa descartada:* fiarse del comportamiento observado de un motor →
#    **convierte la puerta en rehén de una implementación no escrita**.
#
# =============================================================================================
# 🔴 EL HUECO CONOCIDO — SE DECLARA, **NO SE CIERRA**
# =============================================================================================
# El acceptance 1 dice **`(html|css)`**. Por tanto: **un `fetch('https://tercero…')` desde el JS del
# bundle NO LO CAZARÍA ESTA PUERTA.** **Hoy no existe ninguno** [V, medido: las URL de los `.js` son
# **TODAS literales de cadena, y ninguna una construcción de fetch** — de **TRES clases**, no de una:
# (a) mensajes de error de React, (b) namespaces XML, y (c) 🔴 **los DATOS REALES de F-02 y F-04 que
# Rollup inlinea**. *Decía «las únicas URL de los `.js` son literales de mensajes de error y
# namespaces XML»: **FALSO**, y lo desmentía la propia fuente de verdad (§2). Ver @s34.*]. **ES DEUDA
# DECLARADA, NO UN PROBLEMA RESUELTO.** *Alternativa descartada:* extender la puerta al JS de `dist/assets/` → la
# verificación lo desaconseja **expresamente** («**NO grepear `https?://` sobre `dist/assets/*.js`:
# falsos positivos garantizados**» [V]), y distinguir un `fetch` real de un literal exige analizar
# el AST de un bundle minificado. **ESO ES OTRA FEATURE, CON SUS ESCENARIOS.** @s34 fija el límite;
# no lo disimula. *Una puerta que se cree infalible es peor que ninguna* (límite declarado, como
# @s11 de F-01 y T3 de F-04).
#
# =============================================================================================
# ANTI-TAUTOLOGÍA (regla dura del arnés)
# =============================================================================================
# Precedente WebEmpresa: el fake de `useIsMobile` atado al símbolo `MOBILE_QUERY` en vez del literal
# fue el **PRIMER MUTANTE SUPERVIVIENTE**
# (`.memoria-cache/patterns/testing/doble-de-test-anclado-al-literal-no-al-simbolo.md`).
# **TODO esperado se escribe A MANO en el escenario y en el test**: `'Manrope'`, `400`, `500`,
# `600`, `700`, `'Gilda Display'`, `'Great Vibes'`, `'fonts.googleapis.com'`, `'cdn.jsdelivr.net'`.
#
# 🔴 **SON DOS EJES DISTINTOS, Y LA VERSIÓN ANTERIOR DE ESTE BLOQUE LOS FUNDIÓ EN UNA PROHIBICIÓN
# ABSOLUTA QUE ERA FALSA — la cazó la revisión adversarial, y la desmiente EL PRECEDENTE QUE ESTE
# MISMO CONTRATO INVOCA:**
#   1. ❌ **PROHIBIDO: usar `PARES_DE_FUENTE_ESPERADOS` como VALOR ESPERADO de un test de
#      COMPORTAMIENTO**, y jamás recomputar el esperado con la función vigilada. *Si el test importa
#      la constante que debería vigilar PARA COMPARARSE CONTRA ELLA, no vigila nada.* Es el
#      precedente WebEmpresa (el fake atado al símbolo `MOBILE_QUERY` en vez del literal).
#   2. ✅ **OBLIGATORIO: UN escenario-ancla (@s38) que SÍ IMPORTA la constante y la FIJA contra un
#      LITERAL ESCRITO A MANO.** **Eso NO es tautología: es lo contrario.** *Sin él, vaciar la
#      constante no pondría rojo nada y DESACTIVARÍA LA GUARDA DE @s29 EN EL BUILD REAL.*
# **FUENTE, MEDIDA — es la forma YA DESPLEGADA Y VERDE EN F-04** [V, comprobado hoy]:
# `src/lib/puerta-cascaron.ts:828` → `export const RUTAS_ESPERADAS: readonly string[] = ['/']`;
# `src/lib/puerta-cascaron.test.ts:24` **IMPORTA el símbolo**; `:901` → `expect([...RUTAS_ESPERADAS])
# .toEqual(['/'])`; `:905` → `expect(RUTAS_ESPERADAS.length).toBeGreaterThan(0)`. Su propio
# comentario (`:893-898`) escribe la distinción exacta: «**Se ancla contra un LITERAL ESCRITO A MANO,
# no contra el símbolo importado: eso sería tautología.**» Y nombra el precio de no hacerlo: «es la
# **deuda 2 que el judge encontró en F-03 con `MINIMO_DE_PARES`**».
# 🔴 **DÓNDE VIVE LA CONSTANTE — EL CONTRATO ANTERIOR NO LO DECÍA EN NINGÚN SITIO, Y EL TDD TENÍA
# QUE ADIVINARLO:** `PARES_DE_FUENTE_ESPERADOS` se **exporta desde `src/lib/puerta-terceros.ts`**
# (**DENTRO de `mutate`**, forma F-04), y **el humilde `tools/puerta-terceros.ts` LA CABLEA** en la
# petición, exactamente como `tools/puerta-cascaron.ts:44` hace `rutasEsperadas: RUTAS_ESPERADAS`.
#
# =============================================================================================
# ARQUITECTURA (precedente F-01/F-03/F-04) Y ALCANCE MUTABLE
# =============================================================================================
# DOS CAPAS, y la distinción es el contrato:
#   - **DECISORES PUROS**: `src/lib/terceros.ts` (`detectarOrigenesExternos(recursos, allowlist)`)
#     y `src/lib/puerta-terceros.ts` (`ejecutarPuertaDeTerceros(peticion)` → `{codigoSalida,
#     lineas}`; `CODIGO_EXITO = 0` / `CODIGO_FALLO = 1`). **NO leen ficheros, NI el reloj, NI
#     `process.env`.** Deterministas: misma entrada → misma salida, **MISMO ORDEN** (informe
#     **diffable**, @s25). **LA PUERTA ACUSA, NO GRUÑE** (precedente F-01/F-03/F-04).
#   - **EL HUMILDE `tools/puerta-terceros.ts`**: cablea `node:fs`, `node:process` y el `exit`;
#     **FILTRA POR EXTENSIÓN** `/\.(html|css)$/i` (@s34); **cablea la `allowlist` `[]`** (@s39) y
#     **`PARES_DE_FUENTE_ESPERADOS`** importada de `src/lib/puerta-terceros.ts` (como
#     `tools/puerta-cascaron.ts:44` hace `rutasEsperadas: RUTAS_ESPERADAS`); imprime `  ✗ <línea>`
#     por **stderr** y `✓ …` por **stdout** si exit 0. **SIN LÓGICA, SIN FICHERO DE TEST PROPIO,
#     FUERA DE `mutate`.** Se encadena en `pnpm build` **DESPUÉS** de `vite-react-ssg build`, como
#     F-01/F-03/F-04 [V: package.json]. **`dev` NO la invoca** (@s36).
#     🔴 **«SIN FICHERO DE TEST PROPIO» ≠ «SIN ANCLA», Y HAY QUE ESCRIBIRLO O SE LEE MAL** [V, §8 de
#     la verificación, literal]: *«no llevan **fichero de test propio** ni entran en `mutate`;
#     **cuando una DECISIÓN vive en el humilde, se ancla desde un test que LEE EL FICHERO**»*. El
#     repo **ya tiene el mecanismo y es el único que tiene**: `src/lib/diferidos.test.ts:89-96` →
#     `readFileSync('tools/puerta-placeholders.ts','utf8')` + aserción **contra literal escrito a
#     mano** + la referencia («A-21») escrita en el propio humilde. **Las DOS decisiones que F-05
#     mete en su humilde se anclan así: el filtro de extensión (@s34) y la allowlist `[]` (@s39).**
# **ENTRADA DEL DETECTOR**: `recursos` = `{ubicacion, tipo: 'html'|'css', contenido: string}[]` —
#   **LOS BYTES de `dist/`**. **SALIDA**: `OrigenExterno[]` = `{ubicacion, construccion, origen,
#   valor}`. Vacío = no se detectó ninguno.
# **`allowlist` es PARÁMETRO, SIN `default`** — 🔴 **es la ÚNICA NECESIDAD del diseño** (ver
#   «Mutantes»). **El `[]` de PRODUCCIÓN lo pasa el humilde, y lo ancla @s39.**
# **`PARES_DE_FUENTE_ESPERADOS` se EXPORTA desde `src/lib/puerta-terceros.ts`** (**dentro de
#   `mutate`**, forma F-04 con `RUTAS_ESPERADAS`), **la cablea el humilde**, y **la fija @s38**.
#   *Antes esto no estaba escrito en NINGÚN sitio del contrato y el TDD tenía que decidirlo a
#   ciegas, con las dos ramas rotas por la regla anti-tautología mal escrita.*
# ALCANCE `mutate`: **`src/lib/terceros.ts` y `src/lib/puerta-terceros.ts`** se añaden a
#   `stryker.config.json`. `tools/` queda fuera, como siempre.
#
# 🔴 **EL PUERTO: DECIDIDO A CONCIENCIA — F-05 NO LLEVA `existe*`.**
#   **«Las tres puertas comparten un patrón exacto» es FALSO: es 2 de 3** [V]. **F-03 NO tiene
#   interfaz de puerto ni ningún `existe*`**: su puerto es **un campo suelto** en la petición
#   (`readonly leerScss: () => string`) con contrato de **una sola mitad** («LANZA si el fichero no
#   existe, que es lo que hace `readFileSync`»).
#   **El `existe*` es CONDICIONAL, NO DOGMA:** solo hace falta cuando la puerta necesita
#   **distinguir «el artefacto no está» de «el artefacto está y está mal»** para informar por la
#   rama correcta. **F-04 lo necesita** (@s26 de F-04 exige acusar **qué ruta falta**). **F-05 NO**:
#   si `dist/` no existe, `readdirSync` lanza, el `catch` **falla cerrada** con «la puerta de
#   terceros no pudo completar la inspección: <motivo>», y **eso ya es informativo y correcto** — no
#   hay ningún escenario que exija una línea distinta. **Y SIN ESCENARIO QUE LA EXIJA, `existe*`
#   SERÍA PRODUCCIÓN SIN TEST ROJO Y UN MUTANTE INMORTAL.** Prescribírselo a F-05 «porque las otras
#   lo tienen» sería atribuir a un patrón algo que el patrón **no dice**.
#   → **PUERTO DE F-05, FORMA F-03:** dos campos sueltos, **`leerArtefacto()`** y
#     **`leerConfigVite()`**, **LOS DOS LANZAN** si el fichero/directorio no existe (es lo que hacen
#     `readdirSync`/`readFileSync`). **LO INVARIANTE Y LO ÚNICO QUE SE COPIA SIN PENSAR:** el
#     contrato del puerto va **escrito junto al puerto**, y **EL DOBLE DEL TEST LO HONRA — LANZA
#     DONDE EL REAL LANZA** (lección @s20 de F-01). @s32 y @s33 lo anclan.
#
# =============================================================================================
# 🔴 LA ASERCIÓN DEL CSS ES NEGATIVA Y POR LISTA BLANCA DE ESQUEMAS (@s26)
# =============================================================================================
# Ningún `url()` del CSS de `dist` puede tener esquema `http(s)` **ni ser protocol-relative
# (`//host/…`)** — **solo** rutas **root-absolutas** `/assets/…` o `data:`. **Tres razones medidas,
# y las tres importan** [V, §4]:
#   1. **La ruta es ROOT-ABSOLUTA** (`url(/assets/…woff2)`), **NO relativa** [V]. *Una puerta que
#      exigiera `url(./…)` da falso negativo.* (`vite.config.ts` **NO declara `base`** → `base = '/'`
#      [V: fichero real del repo, comprobado hoy]).
#   2. 🔴 **VITE 7 NO EXIME A LAS FUENTES DEL INLINING** [V]: `build.assetsInlineLimit` = **4096 B**
#      (doc oficial + `logger.js:223`); verificado en el código instalado (`config.js:8815-8832`,
#      `shouldInline`): **el único opt-out por extensión es `.html` (l.8822) y `.svg` con `#`
#      (l.8823)**; `noInlineRE` es solo el query `?no-inline` (l.8624); el corte es
#      `content.length < limit` (l.8832). **`woff2` NO APARECE EN NINGUNA EXCEPCIÓN — al contrario:
#      `logger.js:200` lo mete en `KNOWN_ASSET_TYPES` (que alimenta `DEFAULT_ASSETS_RE`, l.208) y
#      `config.js:8570-8571` da su mime, que es justo lo que produce el `data:font/woff2;base64,…`.
#      LA FUENTE ES `shouldInline`, NO UN GREP.**
#      🔴 **CORREGIDO — aquí decía «`grep -rn 'woff'` sobre la lógica de assets de Vite 7 → CERO
#      RESULTADOS». ES FALSO, remedido hoy sobre vite 7.3.6 instalado: da 5 aciertos**
#      (`config.js:8570`, `:8571`, `:12782-12783`, `logger.js:200`) **y los aciertos SON la lógica de
#      assets**. La frase era autorrefutante: citaba `config.js:8815-8832` como fuente, el mismo
#      fichero donde `woff` aparece 4 veces. *(Origen: la verificación §4 acotó el grep a
#      `dist/node/*.js`, que NO alcanza `chunks/`, donde vive TODA la lógica.)*
#      Un `.woff2` de <4096 B se vuelve `data:font/woff2;base64,…` y **NO DEJA FICHERO EN
#      `dist/assets`**. **Hoy no ocurre porque el `.woff2` más pequeño DE LAS SEIS FUENTES DE F-05
#      mide 14.044 B** (`manrope-latin-500-normal.woff2`), **3,4× el límite**, y **ninguno de los 12
#      ficheros (6 woff2 + 6 woff) baja de 4096 B** [V, medido sobre `@fontsource` 5.2.8 instalado
#      de verdad; la misma instalación reproduce el 119.540 A LA UNIDAD].
#      🔴 **CORREGIDO — aquí decía «6.192 B», marcado [V] DOS VECES, y era un ERROR DE HECHO DE
#      ÁMBITO:** el fichero de 6.192 B es `outfit-latin-ext-100-normal.woff2`, de **`@fontsource/
#      outfit`** — **la dependencia MUERTA que este mismo contrato da de baja** (@s29), peso **100**
#      (que F-05 no hornea) y subset **latin-ext** (que A-28 decide NO usar). **Remedido hoy: es el
#      ÚNICO fichero del repo con ese tamaño, y las tres familias de F-05 NI SIQUIERA ESTÁN
#      INSTALADAS** (`ls node_modules/.pnpm | grep fontsource` → solo `dm-sans` y `outfit`) → **el §4
#      no podía físicamente medir el ámbito correcto**. **El fichero que sostenía el número
#      DESAPARECE DEL REPO al implementar esta feature.** *Lección reutilizable: una verificación no
#      puede medir un ámbito que no existe en disco; si no está instalado, se instala (como sí se
#      hizo para el 119.540) o se marca **NO VERIFICADO**.*
#      **Sigue siendo un HECHO DE TAMAÑO, NO UNA GARANTÍA** (un subset más fino o un bump de
#      `@fontsource` puede cruzar el límite sin romper ninguna promesa escrita) → **LA PUERTA NO
#      PUEDE ASUMIR QUE EXISTE UN FICHERO `.woff2` EN DISCO** (@s17: sin ese escenario, **un `.woff2`
#      que adelgace por debajo del límite ROMPERÍA EL BUILD SIN MOTIVO**).
#   3. Una **LISTA NEGRA** (`grep https?://`) es **EXACTAMENTE lo que la verificación prohíbe**:
#      sobre `dist/assets/*.js` da **falsos positivos garantizados** (`fb.me`, `react.dev`,
#      `w3.org`) y sobre `dist/*.html` casa `example.invalid` [V]. *Alternativa descartada.*
#
# 🔴 **LA PUERTA ASEVERA LA CONFIG `base`, ADEMÁS DE LA SALIDA (@s27).** **`base` es la vía nº1 por
# la que un tercero entra sin que nadie lo escriba** [V, medido con un build REAL]:
# `base: 'https://cdn.evil.example/x/'` reescribe **TODOS** los `url()` →
# `url(https://cdn.evil.example/x/assets/…woff2)`. **UN SOLO CAMPO DE CONFIG INVALIDA EL «NUNCA
# EXTERNO», Y NINGÚN GREP DEL CSS LO ANTICIPA.**
# **LAS DOS ASERCIONES SON COMPLEMENTARIAS Y NINGUNA SOBRA** — hay que escribirlo o alguien borrará
# una por «redundante»:
#   - **La de la SALIDA** cubre **`--base` por CLI** y **`experimental.renderBuiltUrl`**, que **NO
#     viven en `vite.config.ts`**: la puerta corre **después** del build y ve el `url()` **ya
#     reescrito**, con esquema `http(s)` → **lo caza**.
#   - **La de la CONFIG** cubre el **commit**: deja **rastro en el diff** y rompe el build **EN EL
#     SITIO DONDE ESTÁ LA CAUSA**, no tres capas más abajo. *Una puerta que solo dice «hay un origen
#     externo en `dist/assets/x.css`» manda al siguiente a buscar el porqué.*
#
# =============================================================================================
# 🔴 LA GUARDA ANTI-VACUIDAD: LISTA DECLARADA, NO MÍNIMO MÁGICO (@s28, @s29, @s30, @s31)
# =============================================================================================
# *Sin guarda: `dist/` vacío → **0 orígenes → build VERDE → «protegidos»**.* Es **A-8 en F-01**,
# **@s14/@s15 en F-03**, **@s26/@s27 en F-04**. **AQUÍ ES OBLIGATORIA.** Hay dos formas en el repo y
# **se elige la de F-04**:
#
#     PARES_DE_FUENTE_ESPERADOS = [
#       ['Manrope', 400], ['Manrope', 500], ['Manrope', 600], ['Manrope', 700],
#       ['Gilda Display', 400], ['Great Vibes', 400],
#     ]
#
# La puerta exige que **el conjunto de `@font-face` del CSS de `dist` sea EXACTAMENTE ÉSTE — ni uno
# más, ni uno menos**.
# **POR QUÉ ESTA FORMA Y NO `MINIMO_DE_PARES = 18` (F-03):**
#   1. **CRECE CON EL DISEÑO**: nadie tiene que acordarse de subir un número. Es el argumento que ya
#      ganó en F-04 (`RUTAS_ESPERADAS`).
#   2. **Un mínimo aquí sería frágil POR UNA RAZÓN AJENA A LA FEATURE**: el número de ficheros CSS
#      de `dist` es un detalle de **chunking y hash de Vite**; subirlo o bajarlo por un cambio de
#      bundler **no dice nada sobre terceros**.
#   3. 🔴 **CONTRA STRYKER, EL LITERAL NUMÉRICO NO ANCLA NADA.** **Medido sobre el registro
#      autoritativo `allMutators` (`mutate.js:17-34`) del instrumenter 9.6.1 INSTALADO: 16
#      mutadores, y NINGUNO muta literales numéricos** [V]. `MINIMO_DE_PARES = 18` **NO GENERA
#      MUTANTE**: su valor en F-03 es **anclar contra HUMANOS** (borrar una fila rompe el build y hay
#      que venir a bajar el número a mano) — real, pero **es otra cosa**. **`ArrayDeclaration`, en
#      cambio, SÍ ATACA LA LISTA** (`['a','b']` → `[]` [V: `array-declaration-mutator.js`]).
#      🔴 **CORREGIDO — AQUÍ ESTE CONTRATO AFIRMABA UN HECHO FALSO: decía que «@s30 LO MATA».**
#      **NO lo mata, y está medido:** `array-declaration-mutator.js:7` es `if (path.isArrayExpression())`
#      → **solo dispara sobre un literal de array EN EL FICHERO MUTADO**, y **@s30 inyecta SU PROPIO
#      `[]` desde el escenario**, así que **ningún escenario evalúa jamás la constante de
#      producción**. **QUIEN MATA A `ArrayDeclaration` SOBRE `PARES_DE_FUENTE_ESPERADOS` ES EL
#      ESCENARIO-ANCLA @s38** (forma @s26/@s27 de F-04), **no @s30**. Con `break: 100` y sin @s38 ese
#      mutante sería **INMORTAL y la feature NO CERRARÍA**. *El contrato ya aplicaba bien esa misma
#      regla a la allowlist en @s20 y se contradecía a sí mismo tres páginas antes.*
#      **LA FORMA ELEGIDA SE SOSTIENE — pero por las razones 1 y 2, y por @s38, no por @s30.**
#   4. **MATA DOS PÁJAROS**: es la guarda anti-vacuidad **Y** es el escenario del **acceptance 4**
#      (el `wght@300` entraría como un `@font-face` de **peso 300** en `dist` → **conjunto distinto
#      → violación**, @s29). *Y se asevera sobre el **ARTEFACTO**, no sobre los imports de `src/`:
#      la filosofía de F-04.*
#
# **[I] DECLARADO, QUE EL TDD DEBE MEDIR EN SU PRIMER TEST (@s37):** que el **nombre de familia
# sobrevive al CSS MINIFICADO** de `dist` (Vite no renombra identificadores CSS, **pero PUEDE
# QUITAR LAS COMILLAS**) → la comparación es sobre el nombre **destokenizado y sin comillas**, y
# **ESO SE MIDE, NO SE SUPONE**.
#
# =============================================================================================
# LAS FUENTES — EL DISEÑO **NO USA LAS DEL BASE** (la lección mordiendo por TERCERA vez)
# =============================================================================================
# **Medido sobre el prototipo (`Opcion-1-Rosa.dc.html`), NO heredado** [V]:
#   | Manrope       | cuerpo, botones, nav        | 400, 500, 600, 700 |
#   | Gilda Display | todos los h2/h3, precios    | 400                |
#   | Great Vibes   | el «Nails Lash» del hero    | 400                |
# **6 imports, 6 woff2, 119.540 bytes** [V, verificado INSTALANDO DE VERDAD: `@fontsource` 5.2.8;
# las tres familias existen; **OFL-1.1 permite autohospedar** — «to use, study, copy, merge, embed,
# modify, redistribute»]. Rutas exactas, **y son las únicas válidas**:
# `@fontsource/manrope/latin-400.css` · `latin-500.css` · `latin-600.css` · `latin-700.css` ·
# `@fontsource/gilda-display/latin-400.css` · `@fontsource/great-vibes/latin-400.css`.
# **`font-weight: 300` → 0 ocurrencias** en el prototipo, que sin embargo pide
# `Manrope:wght@300;400;500;600;700`: **EL 300 NO SE USA JAMÁS** [V] → **acceptance 4** (@s4, @s29).
#
# 🔴 **`@fontsource/dm-sans` y `@fontsource/outfit` ESTÁN en `package.json` y NO SE IMPORTAN EN
#   NINGÚN SITIO** [V: comprobado hoy, `package.json:29-30`]. Son **HERENCIA MUERTA DE WebEmpresa**
#   — la lección «no copiar del base» mordiendo **POR TERCERA VEZ**: F-03 los tokens, F-04 el
#   JSON-LD, F-05 las fuentes. **F-05 LES DA DE BAJA.** *(No es «producción sin test»: quitar una
#   dependencia no es código. **Lo ancla @s29**: si un `@font-face` de Outfit o DM Sans llegara a
#   `dist`, el conjunto no coincide y el build rompe.)*
#
# **POR QUÉ NO `index.css` NI `400.css` — ES LA TRAMPA INVERSA A LA QUE SUGIERE EL NOMBRE** [V,
#   medido]: `import '@fontsource/manrope'` **NO trae todos los pesos**: trae **SOLO el 400, en los
#   6 subsets**. Faltarían 500/600/700 **EN SILENCIO** (faux-bold sintético, **sin error en
#   consola**). Y `400.css` **también** trae los 6 subsets. **Solo `latin-<peso>.css` trae uno**
#   (medido: 1 `@font-face`, 0 `unicode-range`).
# **POR QUÉ NO `@fontsource-variable`** [V, medido] — **el fallo silencioso más caro de la lista**:
#   (a) solo existe para **Manrope** (las otras dos dan **404**); (b) **no tiene `latin.css`** → en
#   variable no se puede importar solo-latin y `dist` se comería los 6 subsets; (c) **RENOMBRA LA
#   FAMILIA a `'Manrope Variable'`** → si el SCSS dice `'Manrope'`, **la fuente no carga y cae al
#   fallback SIN NINGÚN ERROR**.
# **Cada `@font-face` emite `woff2` Y `woff`** (`url(…woff2) format('woff2'), url(…woff)
#   format('woff')`) y **Vite emite los dos** → **12 ficheros en `dist` para 6 usados** [V]. **Coste
#   de `dist`, NO de red.** *(Por eso @s28 cuenta PARES `[familia, peso]`, no ficheros.)*
#
# =============================================================================================
# ALCANCE — QUÉ ENTRA, QUÉ NO (una feature a la vez: decisión del humano YA TOMADA)
# =============================================================================================
# **ENTRA:** los **6 imports** de `@fontsource` autohospedados · la **baja** de las dos dependencias
# muertas · `src/lib/terceros.ts` + `src/lib/puerta-terceros.ts` + `tools/puerta-terceros.ts`,
# encadenada en `pnpm build`.
# **NO ENTRA — lo heredan y CIERRAN EN SU PROPIA FEATURE:**
#   | **F-11** `mapa_como_llegar` | «No hay iframe de Google Maps ni ninguna petición a un tercero»
#   |   [V: acceptance de F-11] | **CIERRA EN F-11.** F-05 no crea el mapa ni lo prohíbe: cuando
#   |   F-11 lo intente, **la puerta de F-05 YA ESTARÁ AHÍ** y el `<iframe src>` externo **romperá
#   |   el build** (@s1). *✅ La descripción de F-11 arrastraba la MISMA atribución falsa que A-24
#   |   («la decisión que por sí sola evita el banner de cookies»): **CORREGIDA en la puerta humana
#   |   del 2026-07-17 — la `puerta_legal` de F-11 ya dice CRITERIO DE PROYECTO, heredado de F-05**.
#   |   **Que nadie la reintroduzca «de memoria» cuando toque implementar F-11.***
#   | **F-12** `contacto` | el `<a href>` a Facebook e Instagram | **CIERRA EN F-12.** F-05 **NO LOS
#   |   TOCA**: son **hiperenlaces**, no piden nada [V] (@s12)
#   | **F-14** `resenas_agregado_enlace` | el enlace a Treatwell, sin `aggregateRating` | En F-14
#   | **F-06/F-07** | **APLICAR** las familias a los elementos | **En F-06/F-07. F-05 HORNEA LOS
#   |   `@font-face`; NO ESCRIBE NI UN `font-family` DE USO.** *Consecuencia DECLARADA, no oculta:*
#   |   mientras nada referencie una familia, **el navegador no descarga su woff2** (css-fonts-4
#   |   §4.8.1 [V]). **NO afecta al invariante** —cero terceros se cumple igual— y la puerta sigue
#   |   midiendo lo que debe: que los `@font-face` **horneados** no apuntan a ningún origen externo.
#
# =============================================================================================
# MUTANTES QUE DEBEN MORIR (I-6, umbral 1.0) — Y AQUÍ ESTÁ EL PELIGRO
# =============================================================================================
# 🔴 **NECESIDAD, Y ES LO ÚNICO NECESARIO: la allowlist entra como PARÁMETRO.** Si se cablea
#   (`const ALLOWLIST = []` dentro del fichero mutado), **NINGÚN test puede pasar una no vacía** y
#   **`FilterRemoval` es GENUINAMENTE INMATABLE** [V, medido ejecutando node].
# **TÉCNICA SUFICIENTE (una entre varias, NO una necesidad):** que **no haya literal de array en el
#   fichero mutado** → **parámetro SIN `default`**, y **el `[]` lo pasan el humilde y los tests**
#   (los tests **no se mutan**). *No es la única salida:* `array-declaration-mutator.js:13-15` solo
#   dispara sobre `isArrayExpression()` o un callee llamado **exactamente** `Array`, así que un
#   default `new Set<string>()` **tampoco** genera el mutante [V]. **Un default `= []` es la PEOR
#   opción**: el literal sigue ahí y `ArrayDeclaration` lo **RELLENA** con `["Stryker was here"]`
#   (🔴 **CONTRAINTUITIVO: sobre array NO VACÍO QUITA, sobre array VACÍO RELLENA** [V]), y el 100 %
#   **solo se alcanzaría con un fixture grotesco** cuyo origen sea el token literal `Stryker was
#   here`. *No es «inalcanzable» —eso era demasiado fuerte—: es **indefendible**.*
# 🔴 **LO QUE MATA A `FilterRemoval` NO ES EL DISEÑO DEL PARÁMETRO: ES EL ESCENARIO** (@s20).
#   **SON DOS COSAS INDEPENDIENTES**, y el verificador las soldó en una **cadena causal falsa**.
# 🔴 **QUITAR EL `!` DE `!allowlist.includes(o)` NO ES EQUIVALENTE** (devuelve `[]` en vez de la
#   lista) [V, medido]. **Lo mata cualquier escenario con ≥1 origen detectado (@s21). EXCLUIRLO
#   SERÍA FRAUDULENTO.**
#
# **EL MAPA MUTANTE → ESCENARIO (acceptance 5 ✅ REESCRITO por A-23, APROBADO EN LA PUERTA HUMANA
# DEL 2026-07-17 y ya vigente en `feature_list.json` §5):**
#   | `FilterRemoval` (`.filter(p)` → `origenes`)            | **@s20 y la 1ª fila de @s23**   |
#   |   [V: medido POR SABOTAJE — los DOS son «allowlist NO vacía que tapa un origen realmente
#   |   presente», que es el predicado que el propio @s20 enuncia. **«@s20 Y SOLO @s20» era FALSO**
#   |   y estaba escrito como medición; la exclusividad la añadió este contrato al destilar, y la
#   |   fuente (§7) nunca la dijo. **NO se borra ninguno de los dos:** si @s23 cambiara de allowlist,
#   |   @s20 es el único que queda.]
#   | `BooleanLiteral` (el `!` del predicado)                | @s21 (y cualquiera con ≥1)      |
#   | `ArrayDeclaration` (`[…]` → `[]`) sobre `PARES_DE_FUENTE_ESPERADOS` | **@s38, el ESCENARIO-ANCLA** |
#   |   [🔴 **CORREGIDO: NO es @s30.** @s30 inyecta su propio `[]` desde el escenario y **jamás
#   |   evalúa la constante de producción**; el mutador solo dispara sobre un literal de array **en
#   |   el fichero mutado** (`array-declaration-mutator.js:7`, `isArrayExpression()`). Sin @s38 este
#   |   mutante es **INMORTAL** con `break: 100`. @s30 vigila el COMPORTAMIENTO ante lista vacía —
#   |   que es otra cosa, y también hace falta.]
#   | `EqualityOperator` + `StringLiteral` (comparación)     | @s23, @s26                      |
#   | `MethodExpression`: los ÚNICOS pares reales que aplican aquí son **`endsWith`⇄`startsWith`**,
#   |   **`every`⇄`some`**, **`filter`→(eliminado)** y **`toLowerCase`⇄`toUpperCase`**
#   |   [V: `method-expression-mutator.js`, 22 claves]      | @s7, @s23                       |
#   | `Regex` = **weapon-regex 1.3.6 nivel 1 sobre el PATRÓN COMPLETO**: *Quantifier removal* ·
#   |   *Predefined character class negation* (`\s`→`\S`) · *Character class negation* (`[^']`→`[']`)
#   |   · `^` removal · `$` removal                          | @s24 (ver su bloque: NO basta) |
#   |   🔴 **CORREGIDO, Y ERA EL PEOR ERROR DE ESTE CONTRATO: decía «`^`/`$` de la tokenización de
#   |   `rel` o de la extracción de `url()`», como si los mutantes `Regex` SALIERAN de las anclas.
#   |   ES FALSO Y ESTÁ INVERTIDO** [V: `regex-mutator.js` **NO tiene ni una línea sobre anclas** —
#   |   delega el patrón ENTERO en `weaponRegex.mutate(pattern, flags, {mutationLevels:[1]})`].
#   |   **TODA regex literal del fichero mutado genera mutantes, TENGA O NO ANCLAS.** Remedido hoy
#   |   ejecutando weapon-regex 1.3.6 instalado: **`/\s+/` — la tokenización de `rel` que MANDA este
#   |   contrato, SIN UNA SOLA ANCLA → 2 mutantes** (`\s` *Quantifier removal*, `\S+` *Predefined
#   |   character class negation*); la extracción de `url()` **→ 10 mutantes, 0 anclas**; y un patrón
#   |   **CON** anclas (`^/assets/.*$`) → 3 mutantes, **de los que solo 2 son anclas**.
#
# ❌ 🔴 **PROHIBIDO EN ESTE FICHERO, EN LOS TESTS Y EN `progress/`: ESCRIBIR «MUTAR `.includes`».
#   ESE MUTANTE NO EXISTE EN STRYKER 9.6.1.** Verificado **por DOS vías independientes** [V]: (a) el
#   mapa `replacements` de `method-expression-mutator.js:4-27` tiene **22 claves y NINGUNA es
#   `includes`**; (b) **la página oficial no contiene la palabra «includes»**. `.some` **solo**
#   existe como destino de `every`→`some`. *Y el propio verificador **fabricó un número**: dijo «19
#   mutadores»; el registro autoritativo da **exactamente 16**. **Ninguna lectura da 19.** Para
#   decidir qué se muta en este repo, **la fuente es el CÓDIGO INSTALADO, no la página** —que
#   además lista `Checked Statement` y `Assignment Expression`, **que son de Stryker.NET/Stryker4s,
#   NO de StrykerJS** [V].*
#
# ⚠️ **@s7 ES CONDICIONAL AL DISEÑO, y se declara**: si la normalización **no** usa `.toLowerCase()`
#   (p. ej. un regex con bandera `i`), **ese `MethodExpression` no existe y @s7 no tiene a quién
#   matar** — pero **sigue siendo un buen test**, porque asevera **comportamiento** («la caja no
#   decide»), no implementación. Se declara en `progress/mutation_cero_terceros.md`, no se borra en
#   silencio. **Este condicional SÍ es cierto: `MethodExpression` depende del método presente.**
#
# 🔴 **@s24 NO ES CONDICIONAL, Y ESTE CONTRATO DECÍA LO CONTRARIO. LA FRASE ESTABA PARTIDA MAL:**
#   el condicional se escribía para «@s24 y @s7 juntos» («si el diseño no usa `.toLowerCase()`, ni
#   `startsWith`/`endsWith`, **ni anclas de regex**, esos mutantes no existen»). **Para @s7 es
#   verdad; para @s24 es FALSO Y AL REVÉS**: los mutantes `Regex` **no salen de las anclas** y **no
#   dependen de que el diseño use anclas** — salen de **TODA regex literal**, y el contrato manda
#   tokenizar `rel` y extraer `url()` en tres formas de comillas **sin que el repo tenga ningún
#   parser CSS**. **Habrá mutantes `Regex`. La pregunta no es SI existen: es QUIÉN los mata** → ver
#   @s24 y **A-23**.
#
# 🔴 **PRECEDENTE MEDIDO, CORREGIDO — el mutador `Regex` ha dejado supervivientes REALES en este
#   repo DOS veces, no una:** en **F-01** el `+` de `[ -]+` del regex del **teléfono**
#   (`[Survived] Regex — src/lib/placeholders.ts:46`, `progress/mutation_puerta_placeholders.md` §2)
#   y en **F-03** el `^` de `HEX_VALIDO`, **el único superviviente DE F-03** (`progress/
#   gherkin_tokens_paleta_contraste.md` §El superviviente; `progress/current.md:339`;
#   `progress/judge_tokens_paleta_contraste.md:125`). **Las dos veces la salida fue la misma: una
#   fila más EN EL CONTRATO, la producción sin tocar** (`features/tokens_paleta_contraste.feature:27`).
#   ❌ **BORRADO «EL ÚNICO SUPERVIVIENTE REAL DEL REPO»: era FALSO** — F-01 tuvo DOS supervivientes
#   reales (§1 y §2 de ese fichero) y **F-04 tuvo 58** (`git log 5ad226d`: «test(f04): mata los 58
#   supervivientes de puerta-cascaron.ts (0 exclusiones)»). Y el puntero estaba mal: **§2 documenta
#   el `+` del teléfono de F-01, NO el `^` de F-03** — quien siguiera la cita aterrizaba en otro
#   regex. *(F-03 citaba §2 como PRECEDENTE de F-01; este contrato fundió las dos referencias.)*
#
# ⚠️ **«EXACTAMENTE DOS EQUIVALENTES» SERÍA UNA PREDICCIÓN, NO UNA MEDICIÓN.** El fichero de F-05
#   **NO EXISTE** (`grep -rln "allowlist|detectarOrigenes" src/` → nada [V]). **Otra implementación
#   tendrá otro conjunto. SE MIDE CUANDO EXISTA, NO ANTES.**
#
# **HIGIENE DE MEDICIÓN, NO NEGOCIABLE** (`docs/verification.md`): añadir `src/lib/terceros.ts` y
#   `src/lib/puerta-terceros.ts` a la lista `mutate` de `stryker.config.json` · **todo cálculo
#   dentro del `it`**, nunca en el `describe` (`perTest`) · leer **`# timeout` y `tests per mutant`
#   ANTES que el score** · **una sola tanda** de Stryker a la vez · acotar con `--mutate <fichero>`,
#   **JAMÁS con `--testFiles`** (da 0 % falso con este stack).
#
# =============================================================================================
# TRAZA A LOS 5 ACCEPTANCE de feature_list.json (feature id 5)
# =============================================================================================
#   A1 (`detectarOrigenesExternos(html|css)` devuelve los orígenes externos, con allowlist vacía)
#      → @s1, @s2, @s3, @s4, @s5, @s6, @s7, @s8, @s9, @s19, @s25, @s34, **@s40** (el filtro
#      `(html|css)` ANCLADO donde vive), **@s39** (la allowlist `[]` de producción), **@s42** (el
#      `<base href>` VÁLIDO gana: sin él, la petición al tercero es INVISIBLE — ampliación 2026-07-17)
#   A2 ✅ **REESCRITO Y APROBADO EN LA PUERTA HUMANA (A-23, 2026-07-17).** El texto viejo
#      (*«CUALQUIER origen externo»*) era **INSATISFACIBLE** y **ya no existe**. La letra vigente de
#      `feature_list.json` §5 es *«el build falla si el artefacto contiene una **PETICIÓN
#      AUTOMÁTICA** a un origen externo»* → @s26, @s27, @s35 (positivo) y @s10..@s18 (**el negativo,
#      que es lo que la hace satisfacible SIN romper F-04 ni F-02, las dos `done`**), **@s41** (el
#      negativo de LO MALFORMADO: ni lanza ni inventa un origen — ampliación 2026-07-17)
#   A3 (ni una petición a fonts.googleapis.com ni a fonts.gstatic.com) → @s4, @s26, @s29, **@s39**
#   A4 (no se solicita `wght@300`) → @s4, @s28, @s29, **@s38**, **@s43** (los pares son **DEL CSS**:
#      un `@font-face` de un recurso `html` NO cuenta — ampliación 2026-07-17)
#   A5 ✅ **REESCRITO Y APROBADO EN LA PUERTA HUMANA (A-23, 2026-07-17).** El texto viejo era
#      **INMEDIBLE** —pedía **un mutante que no existe** (`.includes`)— y **ya no existe**: la letra
#      vigente **nombra mutadores REALES** y **prohíbe expresamente pedir que se mute `.includes`**
#      → @s20 **y la 1ª fila de @s23** (`FilterRemoval`), @s21 (`BooleanLiteral`), @s23
#      (`EqualityOperator`, `StringLiteral`, `MethodExpression`), **@s38 (`ArrayDeclaration` — NO
#      @s30)**, @s24 (`Regex`), @s7 (`MethodExpression`). **Umbral 1.0, 0 exclusiones: un
#      superviviente SE ESCALA AL HUMANO.**
#   Guarda anti-«verde por vacuidad» + falla cerrada → @s28, @s29, @s30, @s31, @s32, @s33, **@s38**,
#      **@s43** (el filtro por tipo de `paresDelCss`, que **prometía «del CSS» y nada comprobaba**)
#   **LO MALFORMADO, que NINGUNO de los 40 metía** (ampliación 2026-07-17, tras los 10
#      supervivientes) → **@s41** (`rel`/`href` ausentes, URL que no parsea), **@s42** (el `<base>`
#      sin href que NO corta la búsqueda), **@s9 fila 4** (`<base href>` inválido), **@s1 filas 15-16**
#      (el espacio en la URL de un `src`, y el espaciado alrededor del `=`)
#   **Las dos CONSTANTES DE PRODUCCIÓN, que antes no aseveraba NINGÚN escenario** → **@s38**
#      (`PARES_DE_FUENTE_ESPERADOS`) y **@s39** (la allowlist `[]` del humilde). *Los 34 pasos que
#      las mencionaban las INYECTAN desde el test: sin @s38/@s39, «allowlist vacía» —la letra del
#      acceptance 1 y del 3— **no es un invariante: es una constante sin test**.*
#
# Razonamiento completo, con los cálculos y las citas: `progress/f05_verificacion_previa.md`,
# `progress/gherkin_cero_terceros.md` y `project-spec.md` §Feature 5. **Aquí no hay nada que
# adivinar: lo que no está escrito, no está decidido.**

Feature: Cero peticiones automáticas a terceros, fuentes autohospedadas y la puerta que lo demuestra
  Como responsable del proyecto quiero que el ARTEFACTO DE PRODUCCIÓN no contenga ninguna
  construcción que provoque, SIN ACCIÓN DEL USUARIO, una petición a un origen que no sea el propio
  sitio, y que una puerta mecánica lo demuestre en cada build sobre el HTML y el CSS CRUDOS de
  `dist/` con allowlist vacía; para que ningún tercero reciba la IP del visitante y no haga falta
  ningún análisis jurídico —criterio de proyecto, NO una norma— y para que F-11, F-12 y F-14
  hereden el invariante sin volver a discutirlo. La puerta NO puede prohibir «cualquier origen
  externo»: hoy hay DIEZ en `dist/` y NI UNO es una petición; prohibirlos rompería F-04 y F-02, que
  están `done`. Lo que se prohíbe es LA PETICIÓN AUTOMÁTICA.

  # ---------------------------------------------------------------------------
  # EL DETECTOR — lo que SÍ debe detectar (A1; la petición sale sin que el usuario haga nada)
  # ---------------------------------------------------------------------------

  @s1
  Scenario Outline: los subrecursos del HTML a un origen externo se detectan
    Given un recurso "dist/index.html" de tipo html que contiene <marcado>
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then hay exactamente 1 origen externo detectado
    And el origen detectado declara la ubicación "dist/index.html", la construcción "<construccion>", el origen "cdn.tercero.com" y el valor "<valor>"

    Examples:
      | marcado                                                         | construccion                                             | valor                              |
      | <script src="https://cdn.tercero.com/a.js"></script>            | <script src="https://cdn.tercero.com/a.js">              | https://cdn.tercero.com/a.js       |
      | <script src="http://cdn.tercero.com/a.js"></script>             | <script src="http://cdn.tercero.com/a.js">               | http://cdn.tercero.com/a.js        |
      | <img src="https://cdn.tercero.com/a.png">                       | <img src="https://cdn.tercero.com/a.png">                | https://cdn.tercero.com/a.png      |
      | <img srcset="https://cdn.tercero.com/a.png 2x">                 | <img srcset="https://cdn.tercero.com/a.png 2x">          | https://cdn.tercero.com/a.png      |
      | <source srcset="https://cdn.tercero.com/a.webp">                | <source srcset="https://cdn.tercero.com/a.webp">         | https://cdn.tercero.com/a.webp     |
      | <source src="https://cdn.tercero.com/a.mp4">                    | <source src="https://cdn.tercero.com/a.mp4">             | https://cdn.tercero.com/a.mp4      |
      | <iframe src="https://cdn.tercero.com/m.html"></iframe>          | <iframe src="https://cdn.tercero.com/m.html">            | https://cdn.tercero.com/m.html     |
      | <embed src="https://cdn.tercero.com/a.swf">                     | <embed src="https://cdn.tercero.com/a.swf">              | https://cdn.tercero.com/a.swf      |
      | <object data="https://cdn.tercero.com/a.pdf"></object>          | <object data="https://cdn.tercero.com/a.pdf">            | https://cdn.tercero.com/a.pdf      |
      | <video src="https://cdn.tercero.com/a.mp4"></video>             | <video src="https://cdn.tercero.com/a.mp4">              | https://cdn.tercero.com/a.mp4      |
      | <audio src="https://cdn.tercero.com/a.mp3"></audio>             | <audio src="https://cdn.tercero.com/a.mp3">              | https://cdn.tercero.com/a.mp3      |
      | <track src="https://cdn.tercero.com/a.vtt">                     | <track src="https://cdn.tercero.com/a.vtt">              | https://cdn.tercero.com/a.vtt      |
      | <input type="image" src="https://cdn.tercero.com/b.png">        | <input type="image" src="https://cdn.tercero.com/b.png"> | https://cdn.tercero.com/b.png      |
      | <use href="https://cdn.tercero.com/s.svg#i"></use>              | <use href="https://cdn.tercero.com/s.svg#i">             | https://cdn.tercero.com/s.svg#i    |
      | <img src="https://cdn.tercero.com/a b.png">                     | <img src="https://cdn.tercero.com/a b.png">              | https://cdn.tercero.com/a%20b.png  |
      | <img src = "https://cdn.tercero.com/a.png">                     | <img src = "https://cdn.tercero.com/a.png">              | https://cdn.tercero.com/a.png      |

    # 🔴🔴 **LAS DOS ÚLTIMAS FILAS LAS AÑADE LA AMPLIACIÓN DEL 2026-07-17, Y LAS TRAE LA MUTACIÓN.**
    # **PRECEDENTE EXACTO: el `+` del regex del teléfono en F-01, donde la mutación reveló que `@s5`
    # no fijaba el `+` y el humano aprobó la fila `| 600  123  456 |`. LA MUTACIÓN NO ENCONTRÓ CÓDIGO
    # DE MÁS: ENCONTRÓ CONTRATO DE MENOS.**
    #
    # **FILA `a b.png` — MATA `terceros.ts:278` `ConditionalExpression`** (`nombre ===
    # ATRIBUTO_SRCSET ? urlDeSrcset(valor) : valor` → `true ? …`). **UN ESPACIO EN LA URL, Y NO ES
    # `srcset`.** Con el mutante se le aplica `split(' ')[0]` a **TODO** atributo → el `valor` sale
    # **TRUNCADO**. 🔴 **EL ORIGEN SE DETECTA IGUAL Y LA CUENTA NO SE MUEVE: SOLO LO CAZA EL ASERTO
    # SOBRE `valor`, que este escenario YA TIENE.** **ES LA LECCIÓN LITERAL DE ESTA TANDA** — «@s24
    # mataba CERO porque su `Then` solo aseveraba conteos, ciegos a las mutaciones de valor».
    # **MEDIDO CONTRA EL CÓDIGO REAL, no deducido** [V, 2026-07-17]: el detector devuelve
    # `valor = "https://cdn.tercero.com/a%20b.png"` (**el parser WHATWG codifica el espacio**), y el
    # mutante devuelve `"https://cdn.tercero.com/a"`. **Sin espacio en la URL, `split(' ')[0] ===
    # valor` y el mutante es INDISTINGUIBLE: por eso ninguna de las otras 14 filas lo mata.**
    # ⚠️ **NO es el límite declarado nº 2 del `tdd` (`srcset` multi-candidato): aquí el hueco es
    # `src`, no `srcset`.** **Y NO ES UN EQUIVALENTE** —el informe lo llama «el más cercano a uno»—:
    # **esta fila lo distingue por el `valor`, y está medido.**
    #
    # **FILA `src = "…"` — MATA `terceros.ts:58` `Regex`** (`ATRIBUTO`: `([a-z-]+)\s*=\s*"([^"]*)"`
    # → `([a-z-]+)\S*=\s*"([^"]*)"`). ✅ **ES LA DECISIÓN 2 DEL HUMANO (2026-07-17): SE FIJA CON UN
    # TEST.** **El espaciado alrededor del `=` es OPCIONAL en HTML** (`src="x"` ≡ `src = "x"`) [V],
    # **así que tolerarlo es CORRECTO y el código se queda**: un `<img src = "https://cdn.tercero
    # .com/a.png">` **DEBE detectarse**. **El comentario de `terceros.ts:57` ASEVERABA esa tolerancia
    # y NINGÚN test la sostenía: una PROMESA SIN PUERTA.** Con `\S*` la tolerancia desaparece y la
    # suite **ni se enteraba**. **Ahora es un HECHO VIGILADO.** [V, medido hoy: 1 origen,
    # `construccion = '<img src = "https://cdn.tercero.com/a.png">'`, `valor` = la URL.]
    # ⚠️ **NO CONFUNDIR CON EL `\s*`→`\S*` QUE @s24 NOMBRA: aquél es de `URL_CSS`, y el diseño lo
    # EVITÓ eligiendo `url\(([^)]*)\)` — ése NO ha aparecido: el diseño de @s24 FUNCIONÓ.** **Éste
    # es OTRO, en OTRO regex, y NO estaba preaprobado por nadie.**
    #
    # **A1.** Fundamento [V]: **son SUBRECURSOS — se piden AL PROCESAR EL DOCUMENTO**, sin que el
    # usuario haga nada. Es el eje entero de F-05: *«contacto con un origen externo SIN ACCIÓN DEL
    # USUARIO»*.
    # **LA FILA DEL `<iframe>` ES LA QUE F-11 HEREDA** (`mapa_como_llegar`): F-05 **no crea el mapa
    # ni lo prohíbe**; cuando F-11 intente incrustar el iframe de Google Maps, **esta puerta ya
    # estará ahí y romperá el build**. El invariante se hereda **sin repetir el razonamiento**.
    # `cdn.tercero.com` es un **fixture**, no un dato del proyecto: **NO existe ningún CDN en este
    # repo y no se inventa ninguno**. Los esperados se escriben **A MANO** (anti-tautología).
    # **14 filas y no una**: cada construcción es una **regla independiente**. El mutante que
    # reconozca `<img src>` y no `<img srcset>` **muere en su fila**, y `srcset` es exactamente el
    # atributo que un detector ingenuo olvida.
    #
    # 🔴 **LA FILA `http://` ES NUEVA, Y LA AÑADE LA REVISIÓN POR MUTACIÓN — NO ES SIMETRÍA
    # DECORATIVA** [V, medido por SABOTAJE]: **en los 25 escenarios del detector NO HABÍA NI UN
    # `http://` positivo** — el único `http://` era el `xmlns` de @s13, **que es un NEGATIVO**.
    # Medido: **mutando la lista blanca de esquemas a `['', 'https:']` (el `StringLiteral` sobre
    # `'http:'`), la suite del detector daba 67/67 EN VERDE**: un detector que declare que `http:`
    # **no es esquema de red** pasaba el contrato ENTERO del detector **y pasaba @s13 por la razón
    # equivocada**. **`http:` y `https:` son los DOS esquemas de red, y los DOS piden.** *Que lo
    # cazara @s26 (fila 4) no basta: **el detector es una unidad y su contrato tiene que morder
    # solo**.*
    #
    # 🔴 **LA COLUMNA ESTÁ PARTIDA EN DOS, Y ES UNA REPARACIÓN DE CONTRATO:** antes `<construccion>`
    # era **el mismo placeholder en el Given y en el Then**, así que el contrato exigía **en
    # silencio** que el detector devolviera `<video src="…"></video>` **con etiqueta de cierre** — un
    # requisito **que ninguna parte del diseño pide** y que **6 de las 14 filas llevaban y 8 no**.
    # **REGLA, AHORA ESCRITA:** `marcado` es **lo que el Given inyecta** (HTML realista, con su
    # cierre); **`construccion` es LA ETIQUETA DE APERTURA LITERAL, sin contenido ni cierre**: es
    # **lo que el detector VE** y **lo que hace falta para localizarla en el fichero**. **La puerta
    # acusa, no gruñe** (@s25).

  @s2
  Scenario Outline: un <link> cuyo rel tokenizado contiene un keyword de external resource link se detecta
    Given un recurso "dist/index.html" de tipo html que contiene <link rel="<rel>" href="https://cdn.tercero.com/r">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then hay exactamente 1 origen externo detectado
    And el origen detectado declara el origen "cdn.tercero.com" y el valor "https://cdn.tercero.com/r"

    Examples:
      | rel           | fundamento                                                              |
      | stylesheet    | §4.6.8.23: «stylesheet […] creates an external resource link» [V]        |
      | icon          | external resource link [V]                                              |
      | preload       | external resource link [V]                                              |
      | modulepreload | external resource link [V]                                              |
      | prefetch      | external resource link [V]                                              |
      | manifest      | external resource link [V]                                              |

    # **A1.** HTML Living Standard §4.6.1, **literal [V]**: «These are links to resources that are to
    # be used to augment the current document, **generally automatically processed by the user
    # agent**. **All external resource links have a fetch and process the linked resource
    # algorithm** which describes how the resource is obtained.»
    # **ES LA MITAD DE F-05, Y EL ESTÁNDAR LA NOMBRA ÉL MISMO**: *external resource link* frente a
    # *hyperlink*. Sin esta distinción **F-05 es insatisfacible** (@s10, @s11, @s12).
    # La clasificación se hace sobre el **CONJUNTO TOKENIZADO** de `rel`, **nunca sobre la cadena**
    # (@s6, @s7).

  @s3
  Scenario Outline: preconnect y dns-prefetch a un origen externo se detectan — CRITERIO DE PROYECTO
    Given un recurso "dist/index.html" de tipo html que contiene <link rel="<rel>" href="https://cdn.tercero.com">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then hay exactamente 1 origen externo detectado
    And el origen detectado declara el origen "cdn.tercero.com"

    Examples:
      | rel          |
      | preconnect   |
      | dns-prefetch |

    # 🔴 **CRITERIO DE PROYECTO DECLARADO, NO LETRA. SE ESCRIBE ASÍ O SE ESTÁ MINTIENDO.**
    # `preconnect` y `dns-prefetch` **son *external resource links* pero NO DESCARGAN RECURSO**:
    # abren TCP/TLS o resuelven DNS [V]. **NINGUNA SPEC DECIDE EL EJE POR NOSOTROS. Hay que elegir
    # uno y NO MEZCLARLOS.**
    # **EL EJE DE F-05 ES «CONTACTO CON UN ORIGEN EXTERNO SIN ACCIÓN DEL USUARIO»** — porque **EL
    # TERCERO RECIBE LA IP IGUAL**, que es **exactamente lo que esta feature previene** (y es
    # literalmente la justificación entera de F-05: *«ningún tercero recibe la IP del visitante»*).
    # *Alternativa DESCARTADA:* el eje «petición HTTP de un recurso» → **dejaría pasar un
    # `preconnect` a un CDN, que entrega la IP sin descargar un byte**. Sería una puerta que cumple
    # su letra y falla su propósito.
    # ⚠️ **NINGÚN mensaje de violación puede decir que «lo exige el estándar»: SERÍA FALSO.** Estos
    # dos se marcan **porque ESTE CONTRATO lo decide**.

  @s4
  Scenario Outline: en el CSS, @import y cualquier url() a un origen externo se detectan
    Given un recurso "dist/assets/x.css" de tipo css que contiene <construccion>
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then hay exactamente 1 origen externo detectado
    And el origen detectado declara la ubicación "dist/assets/x.css" y el origen "<origen>"

    Examples:
      | construccion                                                                                  | origen               |
      | @import url(https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700);       | fonts.googleapis.com |
      | @import "https://cdn.tercero.com/x.css";                                                      | cdn.tercero.com      |
      | @font-face { font-family: 'Manrope'; src: url(https://fonts.gstatic.com/s/manrope/x.woff2); }  | fonts.gstatic.com    |
      | .h { background-image: url("https://cdn.tercero.com/b.png"); }                                | cdn.tercero.com      |

    # **A1 + A3 + A4.** El `url()` de `@font-face` es **LETRA NORMATIVA**: css-fonts-4 §4.8.1 [V].
    # **LA PRIMERA FILA ES EL ESTADO DEL PROTOTIPO, LITERAL Y MEDIDO** [V]: pide
    # `Manrope:wght@300;400;500;600;700` y **el 300 NO SE USA JAMÁS** (`font-weight: 300` → **0
    # ocurrencias** en `Opcion-1-Rosa.dc.html`). **Es el acceptance 3 y el 4 EN LA MISMA FILA**, y es
    # exactamente la petición que F-05 existe para que no salga nunca.
    # **LA TERCERA FILA es `fonts.gstatic.com`** (acceptance 3): `googleapis` sirve el CSS,
    # `gstatic` sirve el `.woff2`. **Son DOS orígenes distintos y el acceptance nombra los dos**; una
    # puerta que solo mire `googleapis` deja salir el binario.
    # **LA CUARTA FILA es el CRITERIO DE PROYECTO de @s5**, aquí en su forma externa.
    # ⚠️ **Anti-tautología**: `'Manrope'` se escribe **a mano**; JAMÁS se importa
    # `PARES_DE_FUENTE_ESPERADOS`.

  @s5
  Scenario Outline: un url() en una regla CSS que quizá no aplica SE MARCA IGUAL — CRITERIO CONSERVADOR
    Given los recursos "dist/assets/x.css" de tipo css con la regla ".jamas-usada { background-image: url(https://cdn.tercero.com/b.png); }" y "dist/index.html" de tipo html que <usa> la clase "jamas-usada"
    When se llama a detectarOrigenesExternos con esos recursos y la allowlist []
    Then hay exactamente 1 origen externo detectado
    And el origen detectado declara la ubicación "dist/assets/x.css" y el origen "cdn.tercero.com"

    Examples:
      | usa    | html del artefacto                              |
      | SÍ usa | <div class="jamas-usada"></div>                 |
      | NO usa | <div class="otra-clase"></div>                  |

    # 🔴 **LAS DOS FILAS DAN EL MISMO RESULTADO, Y *ESO* ES EL CRITERIO CONSERVADOR: LA
    # APLICABILIDAD NO INFLUYE.** **Ésa es la aserción — no una premisa.**
    # 🔴 **REPARADO POR LA REVISIÓN ADVERSARIAL: el escenario era INERTE.** Decía «*And que ninguna
    # página del artefacto usa la clase "jamas-usada"*» — una premisa que **NO ENTRA POR NINGÚN
    # PARÁMETRO** de `detectarOrigenesExternos(recursos, allowlist)`: la entrada son **los BYTES de
    # `dist/`** (`{ubicacion, tipo, contenido}[]`), y **no hay campo que codifique «qué clases usa el
    # artefacto»**. Era **inerte POR CONSTRUCCIÓN, no por olvido** — es exactamente lo que la
    # verificación §1 cierra: «**un analizador estático NO PUEDE evaluar qué reglas aplican**». El
    # test resultante era un **DUPLICADO ESTRICTAMENTE MÁS DÉBIL de @s4 fila 4** (mismo recurso,
    # misma allowlist, mismo «exactamente 1», y @s4 además asevera la ubicación): **mataba CERO
    # mutantes que @s4 no matara ya**. *Es el patrón literal de F-03/@s14.* **Ahora el HTML entra
    # DE VERDAD por `recursos`, y la pinza mide lo que el escenario dice medir.**
    #
    # 🔴 **CRITERIO DE PROYECTO DECLARADO, NO LETRA — y el porqué hay que escribirlo o alguien
    # «arregla» este falso positivo aparente dentro de seis meses.**
    # **SOLO `@font-face` TIENE LETRA NORMATIVA** sobre CUÁNDO se pide: css-fonts-4 §4.8.1 («user
    # agents **must only download** those fonts that are referred to within the style rules
    # **applicable** to a given page» [V]). **Para `background-image` NINGUNA SPEC DICE CUÁNDO SE
    # PIDE** — css-values-4 §4.5.4 y css-images-4 §2.3 **solo definen CÓMO** [V]. **Que Chrome no lo
    # pida es COMPORTAMIENTO OBSERVADO, NO LETRA.**
    # **Y un ANALIZADOR ESTÁTICO NO PUEDE EVALUAR QUÉ REGLAS APLICAN** (dependen del DOM, del JS, del
    # media query, del `@supports`) → **criterio CONSERVADOR: se marca**.
    # *Alternativa DESCARTADA:* fiarse del comportamiento observado de un motor → **convierte la
    # puerta en REHÉN DE UNA IMPLEMENTACIÓN NO ESCRITA**, que puede cambiar en cualquier versión sin
    # romper ninguna promesa.
    # **CONSECUENCIA ACEPTADA Y DECLARADA:** si mañana alguien quiere un `background-image` externo
    # en una regla muerta, **la puerta rompe y hay que venir a la puerta humana**. Es el lado
    # correcto en el que equivocarse.

  @s6
  Scenario: 🔴 rel="alternate stylesheet" a un tercero SÍ SE DETECTA — el falso negativo que casi se cuela
    Given un recurso "dist/index.html" de tipo html que contiene <link rel="alternate stylesheet" title="Alto contraste" href="https://cdn.tercero.com/c.css">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then hay exactamente 1 origen externo detectado
    And el origen detectado declara el origen "cdn.tercero.com" y el valor "https://cdn.tercero.com/c.css"

    # 🔴🔴 **ESTE ESCENARIO ES OBLIGATORIO. SIN ÉL, LA REGLA DEL CONJUNTO TOKENIZADO NO ESTÁ
    # ANCLADA EN NINGÚN SITIO Y F-05 DEJA PASAR UNA PETICIÓN REAL A UN TERCERO.**
    # **LO CAZÓ EL REFUTADOR, Y ERA UN FALSO NEGATIVO DE LA REGLA PROPUESTA** [V, §1 de la
    # verificación]. El verificador dedujo *«`rel="alternate"` es Hyperlink, luego no detectar»*
    # **DE LA FILA-RESUMEN DE LA TABLA** de §4.6.8. **La letra que la desarrolla lo CONTRADICE**,
    # §4.6.8.1 [V, literal]:
    #   «If the element is a link element and the rel attribute **also contains the keyword
    #   stylesheet** […] The alternate keyword **modifies the meaning of the stylesheet keyword**
    #   […] **The alternate keyword DOES NOT CREATE A LINK OF ITS OWN.**»
    # Y §4.6.8.23: «stylesheet […] **creates an external resource link**» [V].
    # → **`alternate` NO crea link propio: MODIFICA a `stylesheet`. El link SIGUE SIENDO un external
    #   resource link. LA HOJA SE PIDE.**
    # 🔴 **LA CLASIFICACIÓN ES SOBRE EL CONJUNTO TOKENIZADO DE `rel` (tokens separados por ASCII
    # WHITESPACE — TAB, LF, FF, CR y espacio; los keywords se COMPARAN ASCII case-insensitive),
    # NUNCA SOBRE LA CADENA COMPLETA NI SOBRE UN SOLO TOKEN.** Un detector que compare
    # `rel === 'stylesheet'` **falla aquí**; uno que haga `rel.includes('alternate') → no detectar`
    # **falla aquí**; uno que mire **solo el primer token** **falla aquí**.
    # 🔴 **CORREGIDO: decía «separados por espacio», MÁS ESTRECHO QUE LA NORMA** —§4.6.8 literal:
    # «must be **split on ASCII whitespace**»— **y del lado del FALSO NEGATIVO que este escenario
    # existe para cerrar**: `rel="alternate<TAB>stylesheet"` es HTML válido, **la hoja SE PIDE**, y
    # un `rel.split(' ')` **no la ve**. **La fila TAB de @s7 lo ancla.** ⚠️ En JS **`\s` NO es ASCII
    # whitespace**: la partición correcta es **`/[\t\n\f\r ]+/`**.
    # **@s11 ES SU GEMELO Y VA JUNTO A PROPÓSITO**: `rel="alternate"` **SOLO** (sin `stylesheet`) →
    # **NO se detecta**. **La diferencia NO está en la cadena: ESTÁ EN EL CONJUNTO.** Los dos
    # escenarios juntos son la regla; **cualquiera de los dos solo, la deja a medias**.
    # **REGLA GENERAL QUE ESTE ESCENARIO FIJA PARA TODO EL PROYECTO: la tabla de §4.6.8 es un
    # RESUMEN; cuando la sección del keyword desarrolla su significado, MANDA LA SECCIÓN.**

  @s7
  Scenario Outline: los keywords de rel se comparan ASCII case-insensitive, y rel se parte por ASCII whitespace
    Given un recurso "dist/index.html" de tipo html que contiene <link rel="<rel>" href="https://cdn.tercero.com/c.css">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then hay exactamente 1 origen externo detectado
    And el origen detectado declara el origen "cdn.tercero.com"

    Examples:
      | rel                     | por qué                                                        |
      | STYLESHEET              | caja alta pura                                                 |
      | StyleSheet              | caja mixta                                                     |
      | ALTERNATE STYLESHEET    | caja alta sobre el conjunto de DOS tokens (@s6)                |
      | Alternate StyleSheet    | caja mixta sobre el conjunto de DOS tokens (@s6)               |
      | alternate<TAB>stylesheet | 🔴 SEPARADOR TAB: ASCII whitespace, NO solo U+0020            |

    # **Los KEYWORDS de `rel` se COMPARAN ASCII case-insensitive** [V: HTML Living Standard §4.6.8,
    # literal: «Keywords are always ASCII case-insensitive, and must be compared as such»]. **La
    # resolución de rel del artefacto NO ES UN JUEGO DE CAJAS** — es la misma lección que la fila
    # `/Aviso-Legal` de @s23 de F-04, del otro lado.
    # 🔴 **CORREGIDO: este comentario decía «La tokenización de `rel` es ASCII case-insensitive».
    # Por la letra, lo case-insensitive es la COMPARACIÓN DE KEYWORDS, no la tokenización.**
    #
    # 🔴 **LA FILA `<TAB>` LA AÑADE LA REVISIÓN, Y ES LETRA DE NORMA, NO GUSTO** [V, fuente primaria]:
    # §4.6.8 dice «the element's rel attribute **must be split on ASCII whitespace**», e *Infra*
    # define ASCII whitespace como **TAB, LF, FF, CR y SPACE**. **El contrato decía «separados por
    # espacio»: 4 de los 5 separadores de la norma daban FALSO NEGATIVO**, y el caso que se colaba
    # era **exactamente el de @s6** (`rel="alternate<TAB>stylesheet"` → la hoja SE PIDE y el detector
    # no la veía). **Ninguna fila de ningún Examples usaba un separador distinto de U+0020**: el
    # hueco no estaba tapado en ningún sitio. ⚠️ **`<TAB>` es el carácter U+0009 REAL en el fixture**,
    # no la cadena literal `<TAB>`.
    # ⚠️ **HONESTIDAD DE MEDICIÓN — esta fila NO se justifica por mutación, y no se finge que sí:**
    # medí que `\s+`→`\s` (*Quantifier removal*) **NO muere con TAB ni con doble espacio**
    # (`"alternate  stylesheet".split(/\s/)` → `["alternate","","stylesheet"]`, que **sigue
    # conteniendo `stylesheet`** → el mutante es **EQUIVALENTE** para la pertenencia al conjunto).
    # **Entra por LETRA DE NORMA, que basta.** Ver @s24 para quién sí muerde a los `Regex`.
    # 🔴 **MUTANTE REAL QUE ESTE ESCENARIO MATA (acceptance 5 reescrito, A-23):**
    # **`MethodExpression` `toLowerCase`⇄`toUpperCase`** [V: `method-expression-mutator.js`, 22
    # claves; los ÚNICOS pares que aplican a F-05 son `endsWith`⇄`startsWith`, `every`⇄`some`,
    # `filter`→(eliminado) y `toLowerCase`⇄`toUpperCase`]. Con el mutante, `'STYLESHEET'
    # .toUpperCase()` no casa contra `'stylesheet'` → **0 detectados → ROJO**. Las dos últimas filas
    # lo matan **también sobre el camino de @s6**, que es el que de verdad importa.
    # ⚠️ **CONDICIONAL AL DISEÑO, Y SE DECLARA**: si la normalización no usa `.toLowerCase()` (p. ej.
    # un regex con la bandera `i`), **ese mutante no existe** y este escenario **no tiene a quién
    # matar** — pero **sigue siendo un buen test**, porque asevera **comportamiento** («la caja no
    # decide»), no implementación. **Se declara en `progress/mutation_cero_terceros.md`; NO se borra
    # en silencio.**
    # ❌ **PROHIBIDO escribir aquí «mutar `.includes`»: ESE MUTADOR NO EXISTE en Stryker 9.6.1** [V,
    # por dos vías independientes].

  @s8
  Scenario Outline: un url() protocol-relative a un tercero SE DETECTA
    Given un recurso "<ubicacion>" de tipo <tipo> que contiene <construccion>
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then hay exactamente 1 origen externo detectado
    And el origen detectado declara el origen "cdn.tercero.com"

    Examples:
      | ubicacion          | tipo | construccion                                        |
      | dist/assets/x.css  | css  | @font-face { src: url(//cdn.tercero.com/x.woff2); } |
      | dist/index.html    | html | <link rel="stylesheet" href="//cdn.tercero.com/x.css"> |
      | dist/index.html    | html | <script src="//cdn.tercero.com/a.js"></script>      |

    # 🔴 **ES EL HUECO CLÁSICO DE TODA LISTA BLANCA ESCRITA COMO «EMPIEZA POR `http`»** [V: caso
    # límite 9 de la spec]. Una URL protocol-relative **hereda el esquema de la página** y **pide al
    # tercero EXACTAMENTE IGUAL**. Un detector que busque `https?://` **NO LA VE**.
    # **POR ESO LA ASERCIÓN ES POR LISTA BLANCA DE ESQUEMAS, NEGATIVA** (@s26): *solo `/assets/…` o
    # `data:`* — **no** «todo lo que no empiece por http». **UNA LISTA NEGRA AQUÍ ES EL BUG.**
    # 🔴 **MUTANTES QUE ESTE ESCENARIO Y @s26 MATAN JUNTOS:** `StringLiteral` (mutar `'/'` o `'//'`)
    # y `EqualityOperator` en la comparación de esquema. Y **la extracción generará mutantes `Regex`
    # USE O NO USE ANCLAS** (ver @s24 y el mapa mutante): **el `Regex` ha dejado supervivientes
    # REALES en este repo DOS veces** — el `+` del teléfono en **F-01** y el `^` de `HEX_VALIDO` en
    # **F-03** (el único superviviente **de F-03**, no «del repo»: F-04 tuvo **58**).

  @s9
  Scenario Outline: <base href> a un tercero convierte una URL relativa en una petición a un tercero
    Given un recurso "dist/index.html" de tipo html con <base href="<base>"> y la construcción <img src="a.png">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then hay exactamente <detectados> origen(es) externo(s) detectado(s)
    And <asercion>

    Examples:
      | base                        | detectados | asercion                                                          |
      | https://cdn.tercero.com/    | 1          | el origen detectado declara el origen "cdn.tercero.com"           |
      | /                           | 0          | no se detecta ningún origen: a.png resuelve al propio sitio       |
      | https://cdn.tercero.com/    | 1          | el valor declarado es la URL RESUELTA, no el "a.png" literal      |
      | http://[                    | 0          | la base NO PARSEA: se cae con gracia en la raíz propia y NO LANZA |

    # 🔴🔴 **LA 4ª FILA LA AÑADE LA AMPLIACIÓN DEL 2026-07-17, Y LA TRAE LA MUTACIÓN** (precedente
    # exacto: el `+` del teléfono en `@s5` de F-01 — **la mutación no encontró código de más:
    # encontró CONTRATO DE MENOS**). **MATA `terceros.ts:241` `OptionalChaining`**
    # (`URL.parse(href, RAIZ_PROPIA)?.href` → `.href`). **`http://[` es una URL INVÁLIDA:
    # `URL.parse` devuelve `null`** → el `?.` + `?? RAIZ_PROPIA` **cae con gracia en el propio
    # sitio**; **con el mutante, `null.href` → TypeError** y la puerta **revienta ante un HTML
    # malformado**. [V, medido hoy contra el código real: **0 orígenes, sin excepción**.]
    # ✅ **ES LA DECISIÓN 1 DEL HUMANO: LA GUARDA ES CORRECTA Y SE QUEDA. LO QUE FALTABA ERA EL
    # ESCENARIO, NO EL CÓDIGO.** **NADA en la suite metía una URL QUE NO PARSEE** — es el patrón de
    # los 10 supervivientes: *el contrato cubría muy bien lo que el artefacto SÍ trae, y no fijaba
    # qué pasa con lo malformado*. **Su HERMANO EXACTO es la 3ª fila de @s41** (`<img src="http://[">`,
    # el `:299`): **van juntos a propósito, y son la misma lección por las dos ramas** — la de la
    # `base` y la del subrecurso.
    #
    # 🔴 **`<base href>` ES UN MODIFICADOR, NO UN ORIGEN** [V]. **No pide nada por sí mismo** —por
    # eso la 1ª fila detecta **1 y no 2**: el origen es **el `<img>`**, no el `<base>`— **pero
    # convierte `<img src="a.png">` en una petición a un tercero**.
    # → **LAS URL SE RESUELVEN CONTRA `base` ANTES DE CLASIFICARLAS.** Un detector que clasifique
    # `"a.png"` como «relativa, luego propia» **es ciego a esta vía entera**.
    # **LA 2ª FILA (`base = "/"`) MATA AL MUTANTE QUE MARCA TODA URL RELATIVA**: sin ella, la 1ª
    # pasaría **por la razón equivocada** (precedente: la fila `/` de @s24 en F-04).
    # **LA 3ª FILA ASEVERA EL INFORME, y no es cosmética**: acusar `a.png` **manda al siguiente a
    # buscar el porqué**; acusar `https://cdn.tercero.com/a.png` **dice dónde está el problema**.
    # **LA PUERTA ACUSA, NO GRUÑE** (@s25).
    # ⚠️ **ES LA HERMANA DE @s27**, y las dos existen por la misma razón: **hay vías por las que un
    # tercero entra SIN QUE NADIE ESCRIBA SU NOMBRE en la construcción**. `base` en la config
    # (@s27), `<base>` en el HTML (aquí).

  # ---------------------------------------------------------------------------
  # EL DETECTOR — lo que NO debe detectar (A2 reescrito por A-23)
  # 🔴 CADA UNO DE ESTOS ES UN FALSO POSITIVO QUE ROMPERÍA LA FEATURE, F-04 O F-02. SIN ELLOS,
  #    «DETECTAR TODO LO QUE PAREZCA UNA URL» PASA LOS ESCENARIOS DE ARRIBA IGUAL DE BIEN.
  # ---------------------------------------------------------------------------

  @s10
  Scenario: <link rel="canonical"> NO se detecta — es un HIPERENLACE, y es la canónica de F-04
    Given un recurso "dist/index.html" de tipo html que contiene <link rel="canonical" href="https://example.invalid/">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then no se detecta ningún origen externo

    # 🔴 **SIN ESTE ESCENARIO, F-05 ROMPE F-04, QUE ESTÁ `done`.**
    # **Fundamento, letra normativa** [V]: §4.6.8.4: «This keyword creates **A HYPERLINK**». Y la
    # tabla-resumen de §4.6.8 **concuerda** (`canonical — Effect on link: Hyperlink`) — **pero LA
    # TABLA NO ES LA FUENTE**. 🔴 **CORREGIDO: este comentario la llamaba «tabla normativa», y la
    # spec la declara literalmente NO NORMATIVA** [V, fuente primaria, texto inmediatamente anterior
    # a la tabla]: «The following table summarizes the link types… **This table is non-normative**;
    # the actual definitions for the link types are given in the next few sections.» **MANDA
    # §4.6.8.4**, como fija la REGLA DURA de este contrato (@s6). *Era una AUTOCONTRADICCIÓN: @s6
    # existe precisamente para enseñar que fiarse de una fila de esa tabla produjo el falso negativo
    # que habría dejado pasar UNA PETICIÓN REAL A UN TERCERO — y @s10 la acreditaba como «normativa»
    # 100 líneas después. **@s10 NO CAE: §4.6.8.4 es la SECCIÓN, es literal, y lo sostiene él solo.**
    # (Heredado de la verificación previa, que escribió «Tabla normativa» en su §1.)*
    # **Un hyperlink NO PIDE NADA**: solo al *follow the hyperlink* — **ACCIÓN DEL USUARIO**
    # (§4.6.1 [V]).
    # `https://example.invalid` es **la canónica DELIBERADA de F-04** (A-21): **TLD RESERVADO por
    # RFC 2606**, y su origen entra como **REGISTRO PLACEHOLDER de F-01** porque **el dominio final
    # lo decide el cliente** [NV]. **Aparece DOS VECES en el `dist/` de hoy** [V, §0].
    # **ES UNA DE LAS DIEZ URL QUE HACEN INSATISFACIBLE EL ACCEPTANCE 2** (A-23): una puerta que
    # prohibiera «cualquier origen externo» **rompería el build por la canónica de una feature
    # cerrada y correcta**.

  @s11
  Scenario: <link rel="alternate"> SOLO (sin stylesheet) NO se detecta — el gemelo de @s6
    Given un recurso "dist/index.html" de tipo html que contiene <link rel="alternate" type="application/atom+xml" href="https://tercero.com/f.xml">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then no se detecta ningún origen externo

    # 🔴 **ES EL GEMELO DE @s6 Y VA AQUÍ A PROPÓSITO. LOS DOS JUNTOS SON LA REGLA DEL CONJUNTO
    # TOKENIZADO; CUALQUIERA DE LOS DOS SOLO, LA DEJA A MEDIAS.**
    #   - `rel="alternate stylesheet"` → el conjunto **CONTIENE `stylesheet`** → **external resource
    #     link → SE DETECTA** (@s6).
    #   - `rel="alternate"` **SOLO** → el conjunto **NO contiene `stylesheet`** → `alternate` **no
    #     crea link propio como external resource** → **NO se detecta** (aquí).
    # 🔴 **LA DIFERENCIA NO ESTÁ EN LA CADENA — LA CADENA `"alternate"` ES PREFIJO DE `"alternate
    # stylesheet"`. ESTÁ EN EL CONJUNTO.** Un detector que decida por `startsWith`/`includes` sobre
    # la cadena **acierta uno y falla el otro, SIEMPRE**.
    # 🔴 **MUTANTE REAL:** `MethodExpression` **`startsWith`⇄`endsWith`** [V]. Con @s6 y @s11 juntos,
    # cualquier implementación basada en prefijos/sufijos de la cadena **cae en uno de los dos**.
    # Un feed Atom es un **hiperenlace a un recurso alternativo**: **el navegador no lo pide** al
    # procesar el documento.

  @s12
  Scenario: el <a href> a Facebook NO se detecta — es F-12, y romperlo rompe el contacto del salón
    Given un recurso "dist/index.html" de tipo html que contiene <a href="https://www.facebook.com/nailslashstudiorozas/">Facebook</a>
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then no se detecta ningún origen externo

    # 🔴 **SIN ESTE ESCENARIO, ALGUIEN «ENDURECE» LA PUERTA Y ROMPE EL CONTACTO DEL SALÓN.**
    # **Es el DATO REAL de la fuente única** [V: `src/lib/site.ts`, `REDES.facebook`], emitido por
    # **F-02, feature `done`**, y **sigue siendo UNA DE LAS DIEZ URL del `dist/` de hoy** [V, §0].
    # **Cierra en F-12** (`contacto`), no aquí. **F-05 NO LO TOCA.**
    # 🔴 **CORREGIDO — ERROR DE HECHO heredado del §0 de la fuente de verdad, y remedido hoy: HOY EL
    # `<a href>` NO EXISTE.** `grep -o '<a href="[^"]*"' dist/index.html` → **TRES anclas y ninguna a
    # Facebook** (`#servicios-titulo`, `#contacto-titulo`, `tel:+34625223366`); `grep -c facebook
    # dist/index.html` → **0**; `grep -rn "REDES" src/ --include=*.tsx` → **0: ningún componente lo
    # renderiza**. La URL **viaja como LITERAL en `dist/assets/app-BPAduMZD.js`** (`Pn={instagram:…,
    # facebook:"https://www.facebook.com/nailslashstudiorozas/"}`), inlineada por Rollup vía
    # `registros` (`site.ts:135`) — **mismo mecanismo que el `schema.org` de §2**, que la fuente de
    # verdad ya había descrito bien; **§0 etiquetó mal el hecho gemelo**. **Y ese `.js` esta puerta
    # NO LO LEE** (@s34) → **F-02 no puede romperse por esta puerta**.
    # 🔴 **ESO NO LO VUELVE DECORATIVO: LO VUELVE PREVENTIVO, y es el punto entero de la feature.**
    # **El `<a href> lo crea F-12**, y **este escenario es la red tendida por adelantado**: el día
    # que F-12 pinte el enlace, **la puerta de F-05 ya estará ahí**, y **sin este escenario la
    # rompería**. Es exactamente para lo que F-11/F-12/F-14 heredan el invariante **sin volver a
    # discutirlo**. *(La verificación previa §0 ya está corregida en origen — 2026-07-17.)*
    # **Fundamento** [V]: **NO PIDE NADA ANTES DEL CLIC**. Solo al *follow the hyperlink* — **ACCIÓN
    # DEL USUARIO**. §4.6.1: «These are links to other resources that are **generally exposed to the
    # user** by the user agent **so that the user can cause the user agent to navigate** to those
    # resources…»
    # 🔴 **Y NO SE PUEDE PROHIBIR INVOCANDO FASHION ID** [V, §5 de la verificación]: el predicado
    # fáctico del **ap. 27** es la transmisión **AUTOMÁTICA**, «regardless of whether or not he or
    # she … **HAS CLICKED**», y **`hyperlink` = 0 OCURRENCIAS en toda la sentencia**. **Un `<a href>`
    # NO es un social plugin**: no transmite nada hasta que la usuaria decide ir. *La analogía
    # fuente↔botón social es **NUESTRA [I]**, no de la sentencia (`font`/`typeface` = **0
    # ocurrencias** en 64.423 caracteres [V]), y **NO se pudo re-verificar en fuente primaria el
    # 2026-07-17** (EUR-Lex: HTTP 202 + challenge AWS-WAF). **NADIE PUEDE ASCENDER ESA [I] A
    # CERTEZA.***
    # **LA DISTINCIÓN PETICIÓN AUTOMÁTICA ≠ HIPERENLACE ES LA FEATURE ENTERA**, y este escenario es
    # donde se paga: **es un enlace a Facebook, en una feature que se llama «cero terceros», y NO SE
    # MARCA.** Si te parece contraintuitivo, **lee el párrafo de arriba antes de tocarlo.**

  @s13
  Scenario: xmlns de un SVG en línea NO se detecta
    Given un recurso "dist/index.html" de tipo html que contiene <svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then no se detecta ningún origen externo

    # **Fundamento, literal** [V]: *Namespaces in XML* §3: «**It is not a goal that it be directly
    # usable for retrieval** of a schema». **Un namespace es un IDENTIFICADOR, no una dirección: el
    # navegador NO LO PIDE JAMÁS.**
    # **SON CUATRO DE LAS DIEZ URL DEL `dist/` DE HOY, Y VIVEN DENTRO DEL BUNDLE DE REACT** [V,
    # §0]: `http://www.w3.org/1999/xlink` (**7**), `http://www.w3.org/2000/svg` (**5**),
    # `http://www.w3.org/XML/1998/namespace` (**3**), `http://www.w3.org/1998/Math/MathML` (**3**).
    # **NO SE PUEDEN BORRAR: ESTÁN DENTRO DE REACT.**
    # 🔴 **CORREGIDO — decía «Son la mitad de la prueba de que el acceptance 2 es INSATISFACIBLE».
    # NO PUEDEN SERLO, y está medido:** los 18 del bundle viven en `dist/assets/client-BZFsEVlP.js`,
    # **un `.js` que esta puerta NUNCA LEE** (@s34), y **`dist/index.html` NO contiene ningún
    # `xmlns` hoy** (0 ocurrencias de `w3.org` en el HTML). **La prueba de A-23 en el alcance real de
    # la puerta son los DOS orígenes de F-04 del `index.html`, y bastan solos** (ver la cabecera).
    # 🔴 **ESTE ESCENARIO ES PREVENTIVO, Y ES CORRECTO QUE LO SEA:** en cuanto un componente emita un
    # **SVG en línea al HTML horneado** —que es lo normal en cuanto haya un icono—, **un detector que
    # grepee `https?://` lo marcaría** y rompería el build de un repo correcto. Se tiende la red
    # antes, no después.

  @s14
  Scenario: <meta property="og:image"> NO se detecta
    Given un recurso "dist/index.html" de tipo html que contiene <meta property="og:image" content="https://cdn.tercero.com/og.png">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then no se detecta ningún origen externo

    # **Un `<meta>` NO tiene algoritmo de *fetch and process the linked resource***: es **metadata
    # declarativa para consumidores EXTERNOS** (el *scraper* de una red social al compartir el
    # enlace), **no una construcción de subrecurso**. **El navegador que renderiza la página NO PIDE
    # `og:image` NUNCA** — quien la pide es un servidor de terceros, **desde su propia
    # infraestructura, y NO recibe la IP de la visitante**, que es el eje de F-05 (@s3).
    # **Es la MISMA forma que @s15**: una URL que viaja **como DATO**, no como instrucción de carga.
    # **Sin este escenario, un detector que grepee `https?://` en atributos lo marca** y F-05 empieza
    # a prohibir cosas que no prohíbe.

  @s15
  Scenario: la URL del @context del JSON-LD NO se detecta — es un DATA BLOCK, y es F-04
    Given un recurso "dist/index.html" de tipo html que contiene <script type="application/ld+json">{"@context":"https://schema.org","@type":"BeautySalon"}</script>
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then no se detecta ningún origen externo

    # 🔴 **SIN ESTE ESCENARIO, F-05 ROMPE F-04, QUE ESTÁ `done`.** `https://schema.org` aparece
    # **DOS VECES** en el `dist/` de hoy [V, §0] y es **el `@context` del JSON-LD de F-04**.
    # **LA RAZÓN CORRECTA, Y LA ÚNICA QUE HACE FALTA** — HTML Standard, **literal** [V]: «Setting the
    # attribute to any other value means that the script is **a data block, WHICH IS NOT PROCESSED
    # BY THE USER AGENT**, but instead by author script or other tools.» **EL NAVEGADOR NI LO
    # PARSEA** → **no puede originar conexión alguna desde el equipo de la visitante**.
    # ⚠️ **OJO CON UNA CITA QUE CIRCULA Y ES FABRICADA** [V, §2 de la verificación]: el verificador
    # presentó como literal de la spec JSON-LD 1.1 API *«Set context document to the RemoteDocument
    # obtained by dereferencing context…»*. **ESA FRASE NO EXISTE.** El texto real (paso 5.2.5)
    # empieza con **«Otherwise,»** — es la **rama ELSE** de 5.2.4. Al borrar el «Otherwise» y
    # recapitalizar, **convirtió una rama condicional en un mandato incondicional**. **Parafraseo
    # vendido como cita. Si alguien te trae esa frase para refutar este escenario, NO LA ACEPTES.**
    # **QUIEN SÍ PUEDE DEREFERENCIAR EL `@context` ES UN PROCESADOR JSON-LD** (Googlebot, un
    # validador, `jsonld.js`) — **NUNCA el navegador que renderiza**, y solo si no lo tenía ya
    # dereferenciado. **LA INVARIANTE COMPLEMENTARIA REAL** es prohibir cargar en cliente cualquier
    # librería que ejecute el *Context Processing Algorithm*; **medido: este repo NO CARGA NINGUNA**
    # [V]. *No lleva escenario porque no hay nada que detectar hoy: es una regla para el futuro y se
    # declara aquí, no se finge testeada.*
    # **Y `schema.org` viaja en el bundle POR EL GRAFO DE IMPORTS, NO POR LA HIDRATACIÓN** [V,
    # medido]: `home.tsx:3` importa `construirJsonLd` con un import **ESTÁTICO** → Rollup inlinea
    # `const Wi="https://schema.org"`. **Estaría ahí aunque no hubiera hidratación jamás.** *(El
    # verificador dijo «porque el componente re-renderiza en hidratación»: **FALSO y la hidratación
    # es IRRELEVANTE**.)*

  @s16
  Scenario: <link rel="stylesheet" disabled> NO se detecta — falso positivo SOSTENIDO POR SPEC
    Given un recurso "dist/index.html" de tipo html que contiene <link rel="stylesheet" disabled href="https://cdn.tercero.com/x.css">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then no se detecta ningún origen externo

    # 🔴 **ESCENARIO OBLIGATORIO: SIN ÉL, «DETECTAR TODO `stylesheet`» PASA @s2 y @s6 IGUAL DE BIEN**
    # y **la regla nace más gorda de lo que la letra permite**.
    # **Fundamento, LETRA NORMATIVA** [V, §4.6.8.23, *linked resource fetch setup steps*]: «If el's
    # **disabled attribute is set**, then **RETURN FALSE**.» → **el recurso NO SE PIDE.**
    # **MARCARLO SERÍA UN FALSO POSITIVO SOSTENIDO POR SPEC** — no una opinión: **hay letra que dice
    # que no se pide**. Lo cazó el refutador (§1 de la verificación), junto con @s6, **y son los dos
    # hallazgos que salvaron la regla en las dos direcciones**: @s6 la salvó de ser **demasiado
    # laxa**; @s16 la salva de ser **demasiado estricta**.
    # ⚠️ **CONTRASTE DELIBERADO CON @s3 y @s5:** allí F-05 **elige** marcar donde la spec no decide
    # (**criterio de proyecto, declarado**). **Aquí la spec SÍ decide, y F-05 la obedece.** **La
    # diferencia entre «no hay letra, elijo» y «hay letra, la ignoro» es la credibilidad entera de
    # este contrato** (es la lección de los tres ejes de F-04: *letra ≠ técnica suficiente ≠ criterio
    # de proyecto*).

  @s17
  Scenario: url(data:…) NO se detecta — no es una petición, es el propio byte
    Given un recurso "dist/assets/x.css" de tipo css con "@font-face { font-family: Manrope; src: url(data:font/woff2;base64,d09GMgABAAAAAA) format('woff2'); }"
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then no se detecta ningún origen externo

    # **NO ES UNA PETICIÓN: ES EL PROPIO BYTE.** No hay origen, no hay red, no hay tercero.
    # 🔴 **Y NO ES UN CASO HIPOTÉTICO — PUEDE APARECER SOLO, SIN QUE NADIE LO ESCRIBA** [V, §4 de la
    # verificación]: **VITE 7 NO EXIME A LAS FUENTES DEL INLINING.** `build.assetsInlineLimit` =
    # **4096 B** por defecto; verificado en el código **instalado** (`config.js:8815-8832`,
    # `shouldInline`): **el único opt-out por extensión es `.html` (l.8822) y `.svg` con `#`
    # (l.8823)**; `noInlineRE` es solo el query `?no-inline` (l.8624); el corte es
    # `content.length < limit` (l.8832). **Un `.woff2` de <4096 B se convierte en
    # `data:font/woff2;base64,…` y NO DEJA FICHERO EN `dist/assets`.**
    # 🔴 **CORREGIDO — aquí decía «`grep -rn 'woff'` sobre la lógica de assets de Vite 7 → CERO
    # RESULTADOS»: es FALSO** [remedido hoy sobre vite 7.3.6 instalado: **5 aciertos**, y **los
    # aciertos SON la lógica de assets** — `logger.js:200` mete `woff2?` en `KNOWN_ASSET_TYPES` (que
    # construye `DEFAULT_ASSETS_RE`, l.208) **y es literalmente lo que hace que un `.woff2` sea un
    # asset para Vite**; `config.js:8570-8571` da su mime, que es lo que `assetToDataURL` usa para
    # emitir el `data:font/woff2;base64,…` **del fixture de este mismo escenario**]. La frase era
    # **autorrefutante**: citaba `config.js` como fuente, el fichero donde `woff` aparece 4 veces.
    # **La prueba directa es `shouldInline`, y es MÁS fuerte que cualquier grep. LA CONCLUSIÓN NO
    # CAE: Vite 7 no exime a las fuentes.**
    # 🔴 **CORREGIDO — y era un ERROR DE HECHO DE ÁMBITO, marcado [V] dos veces:** decía «**el
    # `.woff2` más pequeño mide 6.192 B**». **Ese fichero es `outfit-latin-ext-100-normal.woff2`, de
    # `@fontsource/outfit`** — **la dependencia MUERTA que este contrato da de baja** (@s29), de peso
    # **100** (que F-05 no hornea) y subset **latin-ext** (que A-28 decide NO usar). **Remedido hoy:
    # es el ÚNICO fichero del repo con ese tamaño, y las tres familias de F-05 NI SIQUIERA ESTÁN
    # INSTALADAS** → el §4 **solo podía medir el ámbito equivocado**. **El hecho era AUTODESTRUCTIVO:
    # el fichero que lo sostenía desaparece del repo al implementar esta misma feature.**
    # ✅ **EL HECHO, EN SU ÁMBITO** [V, `@fontsource` 5.2.8 instalado de verdad]: **el `.woff2` más
    # pequeño de las SEIS fuentes de F-05 mide 14.044 B** (`manrope-latin-500-normal.woff2`), **3,4×
    # el límite** (no 1,5×), y **ninguno de los 12 ficheros (6 woff2 + 6 woff) baja de 4096 B**. *La
    # misma instalación reproduce el 119.540 A LA UNIDAD: las dos cifras no podían ser ciertas a la
    # vez.* **SIGUE SIENDO UN HECHO DE TAMAÑO, NO UNA GARANTÍA** — un subset más fino o un bump de
    # `@fontsource` **puede cruzar el límite sin romper ninguna promesa escrita**. **@s17 NO CAE: la
    # decisión es correcta y el escenario sigue siendo OBLIGATORIO.**
    # → 🔴 **LA PUERTA NO PUEDE ASUMIR QUE EXISTE UN FICHERO `.woff2` EN DISCO** (ni @s28 contar
    # ficheros: cuenta **PARES `[familia, peso]` del CSS**). **SIN ESTE ESCENARIO, UN `.woff2` QUE
    # ADELGACE POR DEBAJO DEL LÍMITE —un subset más fino, un bump de `@fontsource`— ROMPERÍA EL BUILD
    # SIN NINGÚN MOTIVO**, y el siguiente agente pasaría un día buscando un tercero que no existe.
    # **`data:` ES UNO DE LOS DOS ÚNICOS ESQUEMAS DE LA LISTA BLANCA** (@s26). El otro es la ruta
    # root-absoluta `/assets/…`.

  @s18
  Scenario Outline: las URL que resuelven al propio sitio NO se detectan
    Given un recurso "<ubicacion>" de tipo <tipo> que contiene <construccion>
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then no se detecta ningún origen externo

    Examples:
      | ubicacion         | tipo | construccion                                                            | por qué                                       |
      | dist/assets/x.css | css  | @font-face { src: url(/assets/manrope-latin-400-normal-BGsTXAXT.woff2); } | ROOT-ABSOLUTA: es la forma REAL de Vite [V]   |
      | dist/index.html   | html | <script type="module" src="/assets/app-ti4oL6dR.js"></script>           | el propio artefacto                           |
      | dist/index.html   | html | <img src="a.png">                                                       | relativa, sin <base>: el propio sitio         |
      | dist/index.html   | html | <a href="#servicios">Servicios</a>                                      | ancla dentro de la misma página               |
      | dist/index.html   | html | <a href="tel:+34625223366">625 22 33 66</a>                             | no es una URL de red (dato real de F-02 [V])  |

    # **LA ASEVERACIÓN DEL CAMINO NORMAL, Y NO ES DECORATIVA: MATA AL MUTANTE QUE MARCA TODO.** Con
    # él, **@s1..@s9 pasarían TODOS por la razón equivocada** y la puerta rompería el build **en cada
    # ejecución** (precedente: la fila `/` de @s24 en F-04).
    # 🔴 **LA 1ª FILA ES UN HECHO MEDIDO, NO UNA SUPOSICIÓN** [V, §4]: **la ruta que emite Vite es
    # ROOT-ABSOLUTA (`url(/assets/…woff2)`), NO RELATIVA** (`vite.config.ts` **no declara `base`** →
    # `base = '/'` [V: fichero real del repo, comprobado hoy]). **UNA PUERTA QUE EXIGIERA `url(./…)`
    # DA FALSO NEGATIVO.** El hash del nombre es de Vite; el fixture reproduce **la forma real**.
    # **LA FILA DEL `tel:`** usa el **dato REAL de F-02** [V] y ancla que «no empieza por `/`» **NO
    # es** «es externo»: si «no interno» se implementa como «no empieza por `/`», la puerta se vuelve
    # **laxa o rota** — es la lección literal de @s24 de F-04.

  # ---------------------------------------------------------------------------
  # LA ALLOWLIST Y LOS MUTANTES (A1; A5 reescrito por A-23)
  # 🔴 AQUÍ ESTÁ EL PELIGRO DE ESTA FEATURE. LEE `progress/f05_verificacion_previa.md` §7 ENTERO
  #    ANTES DE TOCAR NADA DE ESTA SECCIÓN.
  # ---------------------------------------------------------------------------

  @s19
  Scenario: con allowlist vacía se devuelven TODOS los orígenes detectados
    Given un recurso "dist/index.html" de tipo html con un <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope"> y un <script src="https://cdn.jsdelivr.net/x.js">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then hay exactamente 2 orígenes externos detectados
    And los orígenes detectados son exactamente "fonts.googleapis.com" y "cdn.jsdelivr.net"

    # **A1 — ES EL CONTRATO BASE DE LA FEATURE**: *«devuelve los orígenes externos encontrados, **con
    # allowlist vacía**»*, y **es el estado real de producción: la allowlist de F-05 ES `[]`**.
    # 🔴🔴 **NECESARIO PERO **NO SUFICIENTE**, Y ESTO ES LO MÁS IMPORTANTE DE ESTA SECCIÓN: ESTE
    # ESCENARIO **NO MATA A `FilterRemoval`**.** **MEDIDO ejecutando node** [V, §7]: sobre
    # `origenes.filter(o => !allowlist.includes(o))` con `allowlist = []`, el mutante `.filter(p)` →
    # `origenes` **es EQUIVALENTE** — devuelve exactamente lo mismo. **Con solo este escenario,
    # `FilterRemoval` SOBREVIVE y el umbral 1.0 NO SE ALCANZA.** **Quien crea que «ya está cubierto
    # porque la allowlist real es vacía» se equivoca, y está medido.** → **@s20 ES OBLIGATORIO.**
    # `fonts.googleapis.com` es **acceptance 3**; `cdn.jsdelivr.net` es un **fixture** (no hay
    # ningún jsDelivr en este repo y no se inventa ninguno). Los dos se escriben **A MANO**.
    # **DOS orígenes y no uno**: el detector los acusa **TODOS**; un `else if` en vez de dos `if`
    # independientes deja uno sin acusar (precedente F-01/@s23, F-04/@s25).

  @s20
  Scenario: 🔴 una allowlist NO VACÍA que tapa un origen REALMENTE PRESENTE lo excluye del informe
    Given un recurso "dist/index.html" de tipo html con un <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope"> y un <script src="https://cdn.jsdelivr.net/x.js">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist ["fonts.googleapis.com"]
    Then hay exactamente 1 origen externo detectado
    And el único origen detectado es "cdn.jsdelivr.net"
    And "fonts.googleapis.com" NO aparece en el resultado

    # 🔴🔴🔴 **ESTE ESCENARIO EXISTE PARA MATAR A `FilterRemoval`. NO LO BORRES «PORQUE LA ALLOWLIST
    # REAL ES VACÍA»: ESE ES EXACTAMENTE EL RAZONAMIENTO QUE LO DEJA VIVO.**
    # 🔴 **CORREGIDO: decía «ES EL ÚNICO QUE MATA A `FilterRemoval`» y «@s20 Y SOLO @s20». ES FALSO,
    # medido POR SABOTAJE**: aplicando a mano el mutante (`.filter(p)` → `encontrados`), **la 1ª fila
    # de @s23 TAMBIÉN lo mata** (allowlist `["fonts.googleapis.com"]`, único origen presente
    # `fonts.googleapis.com`, esperado **0** → sin filtro da 1 → ROJO). **Cumple literalmente el
    # predicado que este mismo escenario enuncia** («que el filtro TENGA ALGO QUE QUITAR»): el
    # contrato enunciaba bien la regla y **no la aplicaba a su propia tabla**. La exclusividad **la
    # añadió este contrato al destilar**; la fuente (§7) enuncia el predicado y **nunca dice «solo
    # @s20»**. *Consecuencia real: el `mutation_tester` que usara el mapa como diagnóstico («si
    # `FilterRemoval` sobrevive, el culpable es @s20») **miraría al sitio equivocado**.*
    # ✅ **NO SE BORRA NINGUNO DE LOS DOS:** si @s23 cambiara de allowlist, **@s20 es el único que
    # queda**. El escenario sigue siendo **obligatorio**; lo que cae es el superlativo.
    # **EL MUTANTE:** `FilterRemoval` sustituye `origenes.filter(p)` por `origenes` [V:
    # `stryker-mutator` 9.6.1, registro autoritativo `allMutators` de `mutate.js:17-34` — **16
    # mutadores**, medido sobre el instrumenter **INSTALADO**].
    # **POR QUÉ SOLO MUERE AQUÍ, MEDIDO EJECUTANDO NODE** [V, §7]: con `allowlist = []` (@s19,
    # @s21, @s22) el filtro **no quita nada**, así que `.filter(p)` y `origenes` **devuelven lo
    # mismo → EL MUTANTE ES EQUIVALENTE Y SOBREVIVE**. **La ÚNICA forma de distinguirlos es que el
    # filtro TENGA ALGO QUE QUITAR**: una allowlist **NO VACÍA** que contenga un origen **REALMENTE
    # PRESENTE**. Aquí, con el mutante, el resultado sería `["fonts.googleapis.com",
    # "cdn.jsdelivr.net"]` → **≠ el esperado escrito a mano → MUERE**.
    # 🔴 **SON DOS COSAS INDEPENDIENTES, Y EL VERIFICADOR LAS SOLDÓ EN UNA CADENA CAUSAL FALSA:**
    #   (1) **NECESIDAD DEL DISEÑO** — la allowlist **DEBE entrar como PARÁMETRO**. Si se cablea
    #       (`const ALLOWLIST = []` dentro del fichero mutado), **NINGÚN test puede pasar una no
    #       vacía** y `FilterRemoval` es **GENUINAMENTE INMATABLE** [V, medido]. **Es la ÚNICA
    #       NECESIDAD del diseño de F-05.**
    #   (2) **LO QUE LO MATA ES ESTE ESCENARIO**, no el diseño del parámetro. **El diseño hace
    #       POSIBLE matarlo; el escenario lo MATA.**
    # **NO ES UNA CONCESIÓN NI UNA PUERTA TRASERA: ES LO QUE HACE MEDIBLE EL INVARIANTE «ALLOWLIST
    # VACÍA».** Una allowlist que nadie puede rellenar **no es una allowlist vacía: es una constante
    # sin test**. Y **la allowlist de PRODUCCIÓN sigue siendo `[]`** — la pasa **el humilde**, y el
    # `[]` de los tests **no se muta** (los tests no se mutan).
    # ⚠️ **PARA EL `tdd_craftsman`:** el parámetro va **SIN `default`**. **TÉCNICA SUFICIENTE, no
    # necesidad**: que **no haya literal de array en el fichero mutado**. *No es la única salida:
    # `array-declaration-mutator.js:13-15` solo dispara sobre `isArrayExpression()` o un callee
    # llamado **exactamente** `Array`, así que un default `new Set<string>()` **tampoco** genera el
    # mutante* [V]. **Un default `= []` es la PEOR opción**: el literal sigue ahí y `ArrayDeclaration`
    # lo **RELLENA** con `["Stryker was here"]` (🔴 **contraintuitivo: sobre array NO VACÍO QUITA,
    # sobre array VACÍO RELLENA** [V]) → el 100 % **solo se alcanzaría con un fixture grotesco** cuyo
    # origen fuera el token literal `Stryker was here`. **Indefendible.**

  @s21
  Scenario: con allowlist vacía, un origen detectado se DEVUELVE — el resultado NO es la lista vacía
    Given un recurso "dist/index.html" de tipo html con un <script src="https://cdn.jsdelivr.net/x.js">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then el resultado NO es la lista vacía
    And hay exactamente 1 origen externo detectado
    And el único origen detectado es "cdn.jsdelivr.net"

    # 🔴 **ESTE ESCENARIO MATA A `BooleanLiteral`: EL `!` DE `!allowlist.includes(o)`.**
    # 🔴🔴 **QUITAR EL `!` NO ES EQUIVALENTE, Y ESTÁ MEDIDO** [V, §7]: con el mutante, el predicado
    # pasa a ser `allowlist.includes(o)` → con `allowlist = []` **nada casa** → **devuelve `[]` en
    # vez de la lista**. **EXCLUIRLO DEL ANÁLISIS DE MUTACIÓN COMO «EQUIVALENTE» SERÍA FRAUDULENTO.**
    # Queda **escrito aquí para que nadie lo intente** cuando el informe de Stryker apriete.
    # **Lo mata CUALQUIER escenario con ≥1 origen detectado** (@s19, @s20, @s22, @s1..@s9…). Este
    # existe **para que la razón esté escrita en un sitio citable** y para que **el primer `Then` sea
    # explícito**: *el resultado **NO** es `[]`*. **Un escenario que solo dijera «hay 1 origen» ya lo
    # mata; uno que dijera «no falla» no.**
    # ❌ **PROHIBIDO escribir «mutar `.includes`» aquí ni en ningún sitio: ESE MUTADOR NO EXISTE en
    # Stryker 9.6.1** [V, por DOS vías independientes: el mapa `replacements` de
    # `method-expression-mutator.js:4-27` tiene **22 claves y ninguna es `includes`**; y **la página
    # oficial no contiene la palabra «includes»**]. **Lo que se muta del predicado es el `!`
    # (`BooleanLiteral`) y el `.filter` (`FilterRemoval`) — NADA MÁS.** Es exactamente lo que hace
    # **INMEDIBLE** el acceptance 5 tal como está escrito (**A-23**).

  @s22
  Scenario: una allowlist que NO contiene ninguno de los orígenes presentes no tapa nada
    Given un recurso "dist/index.html" de tipo html con un <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope"> y un <script src="https://cdn.jsdelivr.net/x.js">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist ["cdn.ausente.example"]
    Then hay exactamente 2 orígenes externos detectados
    And los orígenes detectados son exactamente "fonts.googleapis.com" y "cdn.jsdelivr.net"

    # **La aseveración del NEGATIVO DE LA ALLOWLIST: una allowlist NO VACÍA que no casa NO TAPA
    # NADA.** Mata al mutante que, **en cuanto la allowlist tiene algo, deja de reportar** — o al
    # que **la trata como un interruptor** en vez de como un conjunto de exclusión.
    # **JUNTO A @s20 FORMA LA PINZA, Y NINGUNO SOBRA:**
    #   - @s20: allowlist no vacía **QUE SÍ CASA** → **tapa ESE y solo ESE**.
    #   - @s22: allowlist no vacía **QUE NO CASA** → **no tapa NINGUNO**.
    # Sin @s22, «la allowlist tapa todo si no está vacía» pasa @s20 (que solo mira que
    # `fonts.googleapis.com` no aparezca)… **no: pasaría @s20 solo si además borrase
    # `cdn.jsdelivr.net`, y @s20 lo exige presente.** Aun así @s22 vale por sí solo: ancla que **la
    # pertenencia se decide origen a origen**, y es lo que hace que @s23 (comparación exacta) tenga
    # dónde morder.
    # `cdn.ausente.example` usa el TLD **RESERVADO** `.example` (RFC 2606): **imposible de confundir
    # con una decisión del proyecto**. Es la misma disciplina que `example.invalid` en F-04.

  @s23
  Scenario Outline: la allowlist compara el origen EXACTO — ni subcadena, ni prefijo, ni sufijo
    Given un recurso "dist/index.html" de tipo html con un <script src="https://<origen>/x.js">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist ["fonts.googleapis.com"]
    Then hay exactamente <detectados> origen(es) externo(s) detectado(s)

    Examples:
      | origen                                | detectados | por qué                                                          |
      | fonts.googleapis.com                  | 0          | IGUAL al de la allowlist: se tapa                                |
      | evil-fonts.googleapis.com             | 1          | 🔴 SUBDOMINIO ATACANTE: el permitido es SUFIJO. NO se tapa        |
      | evil-fonts.googleapis.com.attacker.net | 1         | 🔴 SUPERCADENA: contiene el permitido y NO es él. NO se tapa      |
      | fonts.googleapis.co                   | 1          | UN CARÁCTER de menos: NO se tapa                                 |
      | fonts.googleapis.comm                 | 1          | UN CARÁCTER de más: NO se tapa                                   |
      | googleapis.com                        | 1          | SUBCADENA del permitido: NO se tapa                              |
      | fonts.googleapis.com.attacker.net     | 1          | 🔴 SUFIJO ATACANTE: el permitido es PREFIJO. NO se tapa           |
      | attacker.net/fonts.googleapis.com     | 1          | el permitido va en la RUTA, no en el origen. NO se tapa          |

    # 🔴 **ESTE ESCENARIO MATA A `EqualityOperator` Y A `StringLiteral`** en la comparación de origen
    # (acceptance 5 reescrito, **A-23**), **y de paso a `MethodExpression` `startsWith`⇄`endsWith`**
    # [V: los ÚNICOS pares que aplican a F-05 son `endsWith`⇄`startsWith`, `every`⇄`some`,
    # `filter`→(eliminado), `toLowerCase`⇄`toUpperCase`].
    # 🔴 **LAS FILAS ATACANTES NO SON PARANOIA ACADÉMICA: SON EL BYPASS.** Una allowlist implementada
    # con `origen.includes(permitido)` **deja pasar `evil-fonts.googleapis.com.attacker.net`**; una
    # con `origen.endsWith(permitido)` **deja pasar `evil-fonts.googleapis.com`**; una con
    # `origen.startsWith(permitido)` **deja pasar `fonts.googleapis.com.attacker.net`**. **Las tres
    # formas ingenuas caen en alguna fila de esta tabla, y las tres convierten la allowlist en una
    # puerta abierta.** *Es la ironía de F-05: la allowlist existe para no reportar, y una allowlist
    # laxa es peor que ninguna.*
    # 🔴 **LA FILA `evil-fonts.googleapis.com` LA AÑADE LA REVISIÓN, Y ARREGLA UN ERROR DE HECHO: LA
    # FRASE DE ARRIBA NOMBRABA UN CASO QUE NO ERA FILA.** El comentario decía —y sigue diciendo, ya
    # con respaldo— que `endsWith` «deja pasar `evil-fonts.googleapis.com`», **pero ese origen NO
    # ESTABA EN LA TABLA**: la fila era `evil-fonts.googleapis.com.attacker.net`, que **termina en
    # `attacker.net` y por tanto NO casa con `endsWith`**. **Medido ejecutando node sobre las 7 filas
    # literales: `endsWith` SOBREVIVÍA LAS 7** (`'evil-fonts.googleapis.com'.endsWith('fonts.
    # googleapis.com')` → **true**), mientras `includes` moría (filas 2,4,6) y `startsWith` moría
    # (filas 4 y 6). **Con esta fila, `endsWith` MUERE** (taparía → 0, esperado **1**) **y la
    # implementación correcta con `===` sigue verde** — comprobado. **Así las tres formas ingenuas
    # caen DE VERDAD, como el escenario afirma.** *Importa porque el mapa mutante carga a @s23 con
    # `MethodExpression` `endsWith`⇄`startsWith` **sin cláusula condicional**: con umbral 1.0, si el
    # diseño usa `startsWith` en la comparación de origen, el mutante a `endsWith` **sobrevivía** y
    # el umbral era inalcanzable —o se compraba con una exclusión que este fichero llama fraudulenta.*
    # **LA 1ª FILA (el positivo) MATA AL MUTANTE QUE NUNCA TAPA** — sin ella, todas las demás pasan
    # con una allowlist que no hace nada, **y @s20 sería el único guardián de que la allowlist
    # funciona**. **Y, MEDIDO POR SABOTAJE, esta fila mata TAMBIÉN a `FilterRemoval`** (ver @s20: el
    # mapa decía «@s20 Y SOLO @s20», y era falso).
    # **LA 7ª FILA ancla que la comparación es sobre el ORIGEN, no sobre la URL entera** — el eje de
    # F-05 es **quién recibe la IP**, y quien la recibe es `attacker.net`.
    # Los esperados se escriben **A MANO**. **`fonts.googleapis.com` es el dato del acceptance 3**;
    # los demás son **fixtures** con TLD/formas inventadas **a propósito para el test**, no
    # decisiones del proyecto.

  @s24
  Scenario Outline: la extracción de url() no se confunde — y ASEVERA EL ORIGEN, no solo la cuenta
    Given un recurso "dist/assets/x.css" de tipo css que contiene <construccion>
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then hay exactamente <detectados> origen(es) externo(s) detectado(s)
    And <asercion>

    Examples:
      | construccion                                                        | detectados | asercion                                                  | por qué                                                        |
      | @font-face { src: url(/assets/m.woff2); }                           | 0          | no se detecta ningún origen                               | root-absoluta: propia                                          |
      | @font-face { src: url(https://cdn.tercero.com/m.woff2); }           | 1          | el origen detectado es "cdn.tercero.com"                  | externa, sin comillas                                          |
      | .a { --x: "url(https://cdn.tercero.com/m.woff2)"; }                 | 1          | el origen detectado es "cdn.tercero.com"                  | criterio conservador (@s5): dentro de un valor, se marca       |
      | @font-face { src: url("/assets/m.woff2") format("woff2"); }         | 0          | no se detecta ningún origen                               | comillas dobles: sigue siendo propia                           |
      | @font-face { src: url('/assets/m.woff2') format('woff2'); }         | 0          | no se detecta ningún origen                               | comillas simples: sigue siendo propia                          |
      | @font-face { src: url('https://cdn.tercero.com/m.woff2'); }         | 1          | el origen detectado es "cdn.tercero.com"                  | 🔴 EXTERNA CON COMILLAS SIMPLES: mata `[^']`→`[']` [V, medido] |
      | @font-face { src: url("https://cdn.tercero.com/m.woff2"); }         | 1          | el origen detectado es "cdn.tercero.com"                  | 🔴 EXTERNA CON COMILLAS DOBLES: mata `[^"]`→`["]` [V, medido]  |
      | @font-face { src: url( https://cdn.tercero.com/m.woff2 ); }         | 1          | el origen detectado es "cdn.tercero.com"                  | 🔴 ESPACIOS DENTRO: mata `[^)]`→`[)]` y `\s*`→`\S*` (apertura) |

    # 🔴🔴 **ESTE BLOQUE ESTABA MAL DE RAÍZ Y ERA EL PEOR DEFECTO DEL CONTRATO. LO CAZÓ LA REVISIÓN
    # ADVERSARIAL Y ESTÁ REMEDIDO AQUÍ, CONTRA EL CÓDIGO INSTALADO.**
    # **DECÍA:** «`Regex`: **SI** la extracción de `url()` o la tokenización de `rel` **USA ANCLAS**,
    # `^` y `$` se mutan», y «⚠️ **CONDICIONAL AL DISEÑO**: si el diseño no usa anclas de regex, **ese
    # mutante no existe** y este escenario **no tiene a quién matar**».
    # **ES FALSO, Y ESTÁ INVERTIDO** [V, fuente primaria + medición propia reproducida]:
    #   - `regex-mutator.js` (instrumenter 9.6.1 **instalado**) **NO tiene ni una línea sobre
    #     anclas**: delega el patrón **ENTERO** en `weaponRegex.mutate(pattern, flags,
    #     {mutationLevels:[1]})` — **weapon-regex 1.3.6**.
    #   - **Medido ejecutando weapon-regex 1.3.6:** **`/\s+/` —la tokenización de `rel` que MANDA
    #     este contrato, SIN UNA SOLA ANCLA— genera 2 MUTANTES**: `\s` (*Quantifier removal*) y
    #     `\S+` (*Predefined character class negation*). La extracción de `url()` → **10 mutantes, 0
    #     anclas**, incluida *Character class negation* (`[^']`→`[']`). Y `^/assets/.*$` **CON**
    #     anclas → 3 mutantes, **de los que solo 2 son anclas**.
    #   - → **TODA REGEX LITERAL DEL FICHERO MUTADO GENERA MUTANTES, TENGA O NO ANCLAS.** Las anclas
    #     **no son ni necesarias ni suficientes**. **El condicional está BORRADO porque es al revés:
    #     habrá mutantes `Regex` SÍ O SÍ.**
    # **Y LO QUE ESTE ESCENARIO HACÍA, MEDIDO CON STRYKER DE VERDAD sobre un prototipo que pasa
    # @s1..@s25 en verde (67/67): 257 mutantes, 78,99 %, 13 supervivientes `Regex`, NI UNO un ancla,
    # y LAS 5 FILAS DE @s24 MATABAN CERO** («~ … (covered)», nunca «✓ … (killed)»).
    #
    # 🔴 **POR QUÉ MATABAN CERO, Y ES LA LECCIÓN: EL `Then` SOLO ASEVERABA LA CUENTA.** Las 5 filas
    # solo variaban **la forma de comillas**, y **la cuenta es CIEGA a las mutaciones de valor**.
    # **Medido por mí, modelando el pipeline completo (extraer → clasificar → contar):** con
    # `[^']`→`[']`, `url('/assets/m.woff2')` extrae `'/assets/m.woff2'` **con las comillas** → **sigue
    # sin ser externo** → **cuenta 0 = esperado 0 → EL MUTANTE SOBREVIVE**. **La cuenta solo se mueve
    # si la fila es EXTERNA**: entonces el valor con comillas **no parsea como esquema** → 1 → 0 →
    # **MUERE**. **Por eso las tres filas nuevas son EXTERNAS y por eso el `Then` ahora asevera EL
    # ORIGEN.**
    # ⚠️ **HONESTIDAD DE MEDICIÓN — NO SUSCRIBO LAS FILAS QUE SE ME PROPUSIERON, PORQUE LAS MEDÍ Y NO
    # MUERDEN** (queda escrito para que nadie las vuelva a proponer «de memoria»):
    #   - **`rel="alternate<TAB>stylesheet"` y el doble espacio NO matan `\s+`→`\s`**: `"alternate
    #     stylesheet".split(/\s/)` → `["alternate","","stylesheet"]`, que **sigue conteniendo
    #     `stylesheet`** → **equivalente para la pertenencia al conjunto**. *(La fila TAB de @s7 entra
    #     igual, pero por LETRA DE NORMA — no por mutación. Ver @s7.)*
    #   - **`\s+`→`\S+` ya lo mata CUALQUIER fila de `stylesheet` existente** (@s2, @s6): no hacía
    #     falta fila nueva.
    #   - **`url('a"b')` NO mata `[^']`→`[']`**: espera 0 y la mutación **no mueve la cuenta**. Por eso
    #     la fila que entra es `url('https://cdn.tercero.com/m.woff2')`, **externa**.
    #   - **`url( … )` con espacios NO mata `\s*`→`\S*` del CIERRE**: `[^)]*` ya se come el espacio
    #     final, así que `\s*` casa vacío en las dos ramas. **Sí mata el `\s*` de APERTURA y
    #     `[^)]`→`[)]`.** La fila entra por eso, no por lo que se decía.
    # 🔴🔴 **SUPERVIVIENTE CONOCIDO Y DECLARADO, NO TAPADO:** `\s*`→`\S*` **del cierre** puede ser
    # **genuinamente equivalente** con una extracción `[^)]*`. **Si sobrevive, SE ESCALA AL HUMANO.**
    # ✅ **A-23 CERRADA EN LA PUERTA DEL 2026-07-17, Y SE CERRÓ POR EL LADO DURO — LEE ESTO DESPACIO,
    # `tdd_craftsman`:** el humano eligió **(a)** y **RECHAZÓ (b)**. **EL UMBRAL DE F-05 ES 1.0 CON 0
    # EXCLUSIONES, Y NO HAY NI UN SUPERVIVIENTE `Regex` PREAPROBADO — TAMPOCO ÉSTE.**
    # **Que este comentario lo nombre NO es una licencia para excluirlo**: es un aviso de dónde va a
    # doler. **NO se excluye en `stryker.config.json`. NO se justifica en
    # `progress/mutation_cero_terceros.md`. NO se declara «equivalente» por cuenta propia. NO se baja
    # el umbral.** **Las dos únicas salidas autorizadas son: (1) una fila más que lo mate —como en
    # F-03 y F-04, sin tocar producción—, o (2) PARAR Y ESCALAR AL HUMANO.**
    # *Excluir un mutante que no se sabe matar es lo que este fichero llama fraudulento en @s21.*
    # ⚠️ **Y NADA DE ESTO ES UNA PROMESA DE 100 %:** los 13 supervivientes están medidos sobre **un
    # prototipo desechable**, **no sobre el código real de F-05, que NO EXISTE**. **Otra
    # implementación tendrá otro conjunto.** **Se mide cuando exista, no antes.**
    #
    # 🔴 **PRECEDENTE MEDIDO, CORREGIDO — el mutador `Regex` ha mordido de verdad en este repo DOS
    # VECES:** en **F-01** el `+` de `[ -]+` del regex del **teléfono** (`[Survived] Regex —
    # src/lib/placeholders.ts:46`, `progress/mutation_puerta_placeholders.md` **§2**) y en **F-03** el
    # `^` de `HEX_VALIDO`, **el único superviviente DE F-03** (`progress/
    # gherkin_tokens_paleta_contraste.md`; `progress/current.md:339`;
    # `progress/judge_tokens_paleta_contraste.md:125`). **Las dos veces la salida fue la misma: una
    # fila más EN EL CONTRATO, la producción SIN TOCAR** (`features/tokens_paleta_contraste.feature:27`).
    # ❌ **«EL ÚNICO SUPERVIVIENTE REAL DEL REPO» ERA FALSO** (F-01 tuvo dos; **F-04 tuvo 58**, `git
    # log 5ad226d`), **y el puntero §2 apuntaba al regex EQUIVOCADO**: quien lo siguiera buscando un
    # `^` aterrizaba en el `+` de un teléfono. *(F-03 cita §2 como PRECEDENTE de F-01; este contrato
    # fundió las dos referencias y perdió cuál documenta qué.)*
    # **LAS FILAS DE COMILLAS anclan que `url()` acepta las TRES formas** (sin comillas, dobles,
    # simples) — **es la forma REAL que emite `@fontsource`**: `url(…woff2) format('woff2'),
    # url(…woff) format('woff')` [V, medido].

  @s25
  Scenario: el informe acusa una línea por origen, con los cuatro campos, y es determinista
    Given un artefacto con "dist/index.html" que tiene un <script src="https://cdn.jsdelivr.net/x.js"> y "dist/assets/x.css" que tiene un @import url(https://fonts.googleapis.com/css2?family=Manrope)
    When se llama a detectarOrigenesExternos dos veces con esos mismos recursos y la allowlist []
    Then hay exactamente 2 orígenes externos detectados
    And cada origen detectado declara SU ubicación, SU construcción, SU origen y SU valor
    And las dos listas son idénticas, elemento a elemento y EN EL MISMO ORDEN

    # **LA PUERTA ACUSA, NO GRUÑE** (precedente F-01/F-03/F-04). «Hay un origen externo en el
    # artefacto» **sin decir en qué fichero, qué construcción ni qué URL** obliga a buscarlo a mano —
    # **y a las 3 de la mañana nadie lo busca: lo salta**. Los **CUATRO** campos son el contrato de
    # salida: `{ubicacion, construccion, origen, valor}`.
    # **DETERMINISMO: misma entrada → misma salida, MISMO ORDEN.** El informe tiene que ser
    # **DIFFABLE**, o el ruido lo vuelve invisible.
    # **DOS ficheros y dos tipos (html y css) a la vez**: el detector recorre **todos** los recursos
    # que recibe, no el primero. **Un `find`/`some` en vez de un recorrido completo muere aquí.**

  # ---------------------------------------------------------------------------
  # LA PUERTA — la aserción NEGATIVA por LISTA BLANCA DE ESQUEMAS (A2 reescrito por A-23; A3)
  # ---------------------------------------------------------------------------

  @s26
  Scenario Outline: el CSS de dist/ solo admite rutas /assets/… o data: — cualquier otro esquema es violación
    Given un artefacto de producción cuyo "dist/assets/x.css" contiene "@font-face { font-family: Manrope; font-weight: 400; src: url(<url>); }"
    And ese mismo CSS declara además los otros 5 @font-face esperados, todos con url(/assets/…woff2)
    And la lista de pares de fuente esperados [("Manrope",400), ("Manrope",500), ("Manrope",600), ("Manrope",700), ("Gilda Display",400), ("Great Vibes",400)]
    And un vite.config.ts que no declara base
    When se ejecuta la puerta de terceros sobre ese artefacto con la allowlist []
    Then el código de salida es <codigo>
    And <asercion>

    Examples:
      | url                                                       | codigo | asercion                                                          |
      | /assets/manrope-latin-400-normal-BGsTXAXT.woff2           | 0      | no se emite ninguna violación de origen externo                   |
      | data:font/woff2;base64,d09GMgABAAAAAA                     | 0      | no se emite ninguna violación de origen externo                   |
      | https://fonts.gstatic.com/s/manrope/v15/x.woff2           | 1      | una línea declara "dist/assets/x.css" y el origen "fonts.gstatic.com" |
      | http://cdn.tercero.com/x.woff2                            | 1      | una línea declara "dist/assets/x.css" y el origen "cdn.tercero.com"   |
      | //cdn.tercero.com/x.woff2                                 | 1      | una línea declara "dist/assets/x.css" y el origen "cdn.tercero.com"   |
      | https://cdn.evil.example/x/assets/manrope-latin-400.woff2 | 1      | una línea declara "dist/assets/x.css" y el origen "cdn.evil.example"  |

    # 🔴🔴 **REPARADO — ERA UN BLOQUEANTE, Y ES LA FORMA EXACTA DEL `4,60` CUANTIZADO DE F-03
    # (A-16): EL TEST NACÍA ROJO CONTRA UNA IMPLEMENTACIÓN CORRECTA.**
    # El Given declaraba **UN SOLO `@font-face`** y **NO declaraba `paresEsperados`** — y `paresEsperados`
    # **viaja en la `peticion`** del **MISMO punto de entrada** que corre la guarda de fuentes. **Medido
    # sobre los 9 escenarios que invocan «se ejecuta la puerta de terceros»: @s26 era EL ÚNICO que no
    # declaraba ni la lista literal ni «con todos los @font-face esperados»** (@s28/@s29/@s30/@s31/@s37
    # declaran la lista; @s27/@s33 dicen «con todos los esperados»). **Era un OLVIDO, no un diseño —
    # asimetría delatora: @s28 declara sus cuatro precondiciones y @s26 declaraba dos.**
    # **LAS DOS LECTURAS NATURALES DABAN ROJO:** con los 6 pares (el espejo de sus hermanos), un CSS
    # de 1 `@font-face` → **«faltan 5 pares» → exit 1**, no 0; con `[]` → dispara **la guarda de la
    # guarda de @s30** → 1. **La única escapatoria era inventar `[("Manrope",400)]`, valor que no
    # aparecía en NINGÚN sitio del contrato.** Y la salida más probable del TDD —desactivar la guarda
    # de fuentes en este camino— **habría destripado @s29 y @s30**.
    # ✅ **AHORA el artefacto declara los 6 `@font-face` y la lista literal: las filas 1-2 dan 0 DE
    # VERDAD, y las filas 3-6 dan 1 POR EL ORIGEN EXTERNO** —que es lo que este escenario mide— **y no
    # por la guarda de fuentes**. *(Las filas 3-6 no aprobaban vacuamente ni antes: su `asercion`
    # ancla al detector. El defecto era de las filas 1-2, y bastaba.)*
    # 🔴 **DECISIÓN QUE EL CONTRATO NO TOMABA Y AHORA TOMA — el peso de un `@font-face` SIN
    # `font-weight`:** el fixture **declara `font-weight: 400` EXPLÍCITAMENTE**, así que **el par bajo
    # prueba es `("Manrope", 400)` sin ambigüedad y NADIE TIENE QUE SUPONER NADA**. *No se destila una
    # regla de defaulting (`font-weight` ausente → 400) porque **ningún escenario la exige** y sería
    # **producción sin test rojo** — la misma razón por la que F-05 no lleva `existe*`. Si algún día
    # hace falta, **entra con su escenario**.*
    #
    # 🔴 **LA ASERCIÓN ES NEGATIVA Y POR LISTA BLANCA DE ESQUEMAS. NO ES UN DETALLE DE ESTILO: ES LA
    # DECISIÓN DE DISEÑO CENTRAL DE LA PUERTA, Y TIENE TRES RAZONES MEDIDAS** [V, §4]:
    #   1. **LA RUTA ES ROOT-ABSOLUTA** (`url(/assets/…woff2)`), **NO relativa** — `vite.config.ts`
    #      **no declara `base`** → `base = '/'` [V: fichero real, comprobado hoy]. *Una puerta que
    #      exigiera `url(./…)` DA FALSO NEGATIVO.*
    #   2. **VITE 7 NO EXIME A LAS FUENTES DEL INLINING** (`assetsInlineLimit` = 4096 B) → **la fila
    #      `data:` NO ES HIPOTÉTICA** (@s17). **La puerta NO puede asumir que existe un fichero
    #      `.woff2` en disco.**
    #   3. 🔴 **UNA LISTA NEGRA (`grep https?://`) ES EXACTAMENTE LO QUE LA VERIFICACIÓN PROHÍBE**:
    #      sobre `dist/assets/*.js` **da falsos positivos garantizados** (`fb.me`, `react.dev`,
    #      `w3.org`) y sobre `dist/*.html` **casa `example.invalid`** [V]. **Alternativa
    #      DESCARTADA.** *(Y por eso el humilde filtra por extensión: @s34.)*
    # **LA FILA `//cdn.tercero.com` ES EL HUECO CLÁSICO** (@s8): **protocol-relative FALLA**. Una
    # lista blanca escrita como «empieza por `http` → malo» **la deja pasar**.
    # **LA ÚLTIMA FILA ES LO QUE `base: 'https://cdn.evil.example/x/'` PRODUCE EN EL CSS REAL** [V,
    # medido con un build real]: **es la mitad de salida de la pinza de @s27**, y por eso **ninguna
    # de las dos aserciones sobra** (ver la cabecera).
    # **LA FILA DE `fonts.gstatic.com` ES EL ACCEPTANCE 3.**
    # 🔴 **MUTANTES: `StringLiteral` (mutar `'/assets/'`, `'data:'`, `'/'`) y `EqualityOperator`
    # mueren en esta tabla** — el positivo (filas 1-2) y el negativo (filas 3-6) **juntos**. Sin las
    # filas 1-2, «todo es violación» pasa las 3-6.

  @s27
  Scenario Outline: la puerta asevera la config base de vite.config.ts, ADEMÁS de la salida
    Given un artefacto de producción cuyo CSS está limpio, con todos los @font-face esperados y ningún origen externo
    And un vite.config.ts en el que <situacion>
    When se ejecuta la puerta de terceros sobre ese artefacto con la allowlist []
    Then el código de salida es <codigo>
    And <asercion>

    Examples:
      | situacion                              | codigo | asercion                                                                       |
      | no se declara base                     | 0      | no se emite ninguna violación por base                                         |
      | base es exactamente "/"                | 0      | no se emite ninguna violación por base                                         |
      | base es "https://cdn.evil.example/x/"  | 1      | una línea propia declara la violación de base y NOMBRA "vite.config.ts"        |
      | base es "https://cdn.tercero.com/"     | 1      | una línea propia declara la violación de base y NOMBRA "vite.config.ts"        |
      | base es "./"                           | 1      | una línea propia declara la violación de base y NOMBRA "vite.config.ts"        |
      | base es "/subcarpeta/"                 | 1      | una línea propia declara la violación de base y NOMBRA "vite.config.ts"        |

    # 🔴 **`base` ES LA VÍA Nº1 POR LA QUE UN TERCERO ENTRA SIN QUE NADIE LO ESCRIBA** [V, medido con
    # un build REAL]: `base: 'https://cdn.evil.example/x/'` reescribe **TODOS** los `url()` →
    # `url(https://cdn.evil.example/x/assets/outfit-latin-400-normal-BGsTXAXT.woff2)`. **UN SOLO
    # CAMPO DE CONFIG INVALIDA EL «NUNCA EXTERNO».**
    # 🔴 **LAS DOS ASERCIONES SON COMPLEMENTARIAS Y NINGUNA SOBRA. HAY QUE ESCRIBIRLO O ALGUIEN
    # BORRARÁ UNA POR «REDUNDANTE» DENTRO DE SEIS MESES:**
    #   - **LA DE LA SALIDA (@s26)** cubre **`--base` por CLI** y **`experimental.renderBuiltUrl`**,
    #     que **NO VIVEN en `vite.config.ts`**: la puerta corre **DESPUÉS** del build y ve el `url()`
    #     **ya reescrito** → lo caza. **@s27 sería CIEGA a esos dos.**
    #   - **LA DE LA CONFIG (aquí)** cubre **el commit**: deja **rastro en el diff** y rompe el build
    #     **EN EL SITIO DONDE ESTÁ LA CAUSA**. *Una puerta que solo dice «hay un origen externo en
    #     `dist/assets/x.css`» **manda al siguiente a buscar el porqué**.* **@s26 sería MUDA sobre la
    #     causa.**
    # **EL 1er Given ES CRÍTICO: EL CSS ESTÁ LIMPIO.** Sin él, el escenario no probaría nada nuevo —
    # @s26 ya rompería. **Aquí la puerta rompe SIN QUE HAYA NI UN ORIGEN EXTERNO EN EL ARTEFACTO**,
    # y **ESO** es el escenario.
    # **LA 1ª FILA ES EL ESTADO REAL DE HOY** [V: `vite.config.ts` del repo **no declara `base`**;
    # comprobado hoy] — y no es decorativa: **sin ella la regla nacería rompiendo el build de un repo
    # correcto**.
    # **LAS FILAS `"./"` Y `"/subcarpeta/"` anclan la regla EXACTA**: pasa **`base` no declarada** o
    # **declarada EXACTAMENTE `'/'`**; **cualquier otra cosa es violación**. **NO** es «pasa si no
    # empieza por http»: `'./'` no empieza por http y **rompe el invariante de la ruta root-absoluta**
    # (razón 1 de @s26). 🔴 **`StringLiteral` sobre `'/'` muere aquí.**
    # ⚠️ **`leerConfigVite()` devuelve EL TEXTO de `vite.config.ts`** (forma F-03: `leerScss`), y una
    # función **PURA** decide. **No se importa la config: se lee como texto.** Un `import` de
    # `vite.config.ts` ejecutaría código y no vería `--base`.

  # ---------------------------------------------------------------------------
  # LA GUARDA ANTI-VACUIDAD: conjunto EXACTO de @font-face (A4; A-8 de F-01, @s26/@s27 de F-04)
  # ---------------------------------------------------------------------------

  @s28
  Scenario: el conjunto EXACTO de @font-face esperado deja el build en verde
    Given un artefacto de producción cuyo CSS declara exactamente los @font-face ("Manrope", 400), ("Manrope", 500), ("Manrope", 600), ("Manrope", 700), ("Gilda Display", 400) y ("Great Vibes", 400)
    And la lista de pares de fuente esperados [("Manrope",400), ("Manrope",500), ("Manrope",600), ("Manrope",700), ("Gilda Display",400), ("Great Vibes",400)]
    And un vite.config.ts que no declara base y un CSS sin ningún origen externo
    When se ejecuta la puerta de terceros sobre ese artefacto con la allowlist []
    Then el código de salida es 0
    And no se emite ninguna violación

    # **EL CAMINO FELIZ DE LA GUARDA. Sin él, una guarda que rompiera SIEMPRE pasaría @s29, @s30 y
    # @s31.**
    # **LOS 6 PARES SON MEDIDOS SOBRE EL PROTOTIPO (`Opcion-1-Rosa.dc.html`), NO HEREDADOS** [V]:
    # **Manrope** (cuerpo, botones, nav) en **400/500/600/700**; **Gilda Display** (todos los h2/h3,
    # precios) en **400**; **Great Vibes** (el «Nails Lash» del hero) en **400**. **6 imports, 6
    # woff2, 119.540 bytes** [V, verificado **instalando de verdad**: `@fontsource` 5.2.8, las tres
    # familias existen, **OFL-1.1 permite autohospedar**].
    # 🔴 **SE CUENTAN PARES `[familia, peso]` DEL CSS, JAMÁS FICHEROS DE `dist/assets`**, por DOS
    # razones medidas [V]: (a) **cada `@font-face` emite `woff2` Y `woff`** → **12 ficheros para 6
    # pares**; (b) **un `.woff2` de <4096 B no deja fichero: se inlinea a `data:`** (@s17). **Contar
    # ficheros da 12 hoy y otra cosa mañana, por razones que NO tienen NADA que ver con terceros.**
    # ⚠️ **ANTI-TAUTOLOGÍA, REGLA DURA — Y SON DOS EJES, NO UNO:** la lista del `Given` se escribe
    # **A MANO** —`'Manrope'`, `400`, `'Gilda Display'`…— y **JAMÁS se importa
    # `PARES_DE_FUENTE_ESPERADOS` para USARLA COMO VALOR ESPERADO de este test, ni se recomputa con
    # la función vigilada**. *Si el test importa la constante que debería vigilar **para compararse
    # contra ella**, no vigila nada.*
    # 🔴 **CORREGIDO: aquí decía «JAMÁS se importa», a secas — una prohibición ABSOLUTA que era
    # FALSA y que prohibía justamente el ancla que F-04 construyó para cerrar este mismo hueco y que
    # @s30 invocaba como «PRECEDENTE LITERAL».** El precedente hace **exactamente lo prohibido**
    # [V, comprobado hoy]: `puerta-cascaron.test.ts:24` **IMPORTA `RUTAS_ESPERADAS`** y `:901` hace
    # `expect([...RUTAS_ESPERADAS]).toEqual(['/'])` — **anclada contra un LITERAL ESCRITO A MANO**.
    # **La distinción es la que el propio F-04 escribió (`:893-898`): «se ancla contra un literal
    # escrito a mano, NO contra el símbolo importado: ESO sería tautología».**
    # → **El ancla vive en @s38, y es OBLIGATORIA: sin ella, `ArrayDeclaration` sobre la constante
    # es INMORTAL con `break: 100` — o la lista se saca de `mutate` y su valor de producción no lo
    # asevera nadie, que es LA DEUDA 2 DE F-03 REINTRODUCIDA.**
    # ✅ **A-28 CERRADA EN LA PUERTA DEL 2026-07-17: SOLO `latin`, Y PUNTO. `latin-ext` NO ENTRA, ASÍ
    # QUE ESTA LISTA NO CAMBIA: LOS 6 PARES SE QUEDAN TAL CUAL.** El humano aprobó la propuesta del
    # lead: **aceptar latin y declararlo**.
    # ⚠️ **EL LÍMITE, DECLARADO — Y LA NOTA SE CONSERVA A PROPÓSITO:** **`latin-400.css` NO tiene
    # `unicode-range`** [V] → aplica a **TODO** el rango: un nombre con `Ł`/`ř`/`ğ` **pinta TOFU, sin
    # error**. El latin cubre `U+0000-00FF` (ñ, vocales acentuadas, ¿, ¡) → **suficiente para
    # español**. **`latin-ext` entrará el día que exista un nombre REAL que lo exija, y ese día
    # ENTRARÁ CON SU ESCENARIO** (+6 woff2), **que actualizará esta lista y la de @s38**. **Nadie la
    # amplía sin ese escenario.**

  @s29
  Scenario Outline: un conjunto de @font-face DISTINTO del declarado rompe el build, acusando el par
    Given un artefacto de producción cuyo CSS, respecto del conjunto esperado, <situacion>
    And la lista de pares de fuente esperados [("Manrope",400), ("Manrope",500), ("Manrope",600), ("Manrope",700), ("Gilda Display",400), ("Great Vibes",400)]
    And un vite.config.ts que no declara base y un CSS sin ningún origen externo
    When se ejecuta la puerta de terceros sobre ese artefacto con la allowlist []
    Then el código de salida es distinto de 0
    And la salida declara exactamente qué par sobra o cuál falta: "<acusacion>"
    And la salida NO declara que no haya violaciones

    Examples:
      | situacion                                                  | acusacion                          | por qué                                                        |
      | añade un @font-face ("Manrope", 300)                       | sobra el par ("Manrope", 300)      | 🔴 ES EL ACCEPTANCE 4: el wght@300 del prototipo               |
      | no declara el @font-face ("Manrope", 700)                  | falta el par ("Manrope", 700)      | un peso que se cae en silencio = faux-bold sintético           |
      | no declara ningún @font-face de "Great Vibes"              | falta el par ("Great Vibes", 400)  | la familia del hero desaparece                                 |
      | añade un @font-face ("Outfit", 400)                        | sobra el par ("Outfit", 400)       | 🔴 herencia MUERTA de WebEmpresa que F-05 da de baja [V]        |
      | añade un @font-face ("DM Sans", 400)                       | sobra el par ("DM Sans", 400)      | 🔴 idem: está en package.json y no se importa [V]               |
      | añade un @font-face ("Manrope Variable", 400)              | sobra el par ("Manrope Variable", 400) | 🔴 @fontsource-variable RENOMBRA la familia [V]             |
      | no declara ningún @font-face                               | faltan los 6 pares                 | 🔴 LA GUARDA ANTI-VACUIDAD: dist/ vacío NO es dist/ limpio      |

    # 🔴 **ES LA GUARDA ANTI-VACUIDAD Y EL ACCEPTANCE 4, A LA VEZ. MATA DOS PÁJAROS, Y ESA ES LA
    # RAZÓN DE ELEGIR ESTA FORMA.**
    # **1ª FILA — ACCEPTANCE 4, «no se solicita wght@300 (no se usa)»:** el prototipo pide
    # `Manrope:wght@300;400;500;600;700` y **`font-weight: 300` → 0 OCURRENCIAS** [V, medido]. Si
    # alguien importara el 300, **entraría como un `@font-face` de peso 300 en `dist` → conjunto
    # distinto → VIOLACIÓN**. **Y se asevera sobre el ARTEFACTO, no sobre los imports de `src/`: la
    # filosofía de F-04.** *Un test que leyera los `import` de `src/` sería ciego a un `@font-face`
    # que entre por cualquier otra vía.*
    # **ÚLTIMA FILA — LA GUARDA:** *sin ella, `dist/` sin ningún `@font-face` → **0 orígenes → build
    # VERDE → «protegidos»**.* **0 fallos sobre 0 fuentes NO ES ESTAR PROTEGIDO: ES NO HABER
    # MIRADO.** Es A-8 en F-01, @s14/@s15 en F-03, @s26/@s27 en F-04. **AQUÍ ES OBLIGATORIA.**
    # **FILAS 4 y 5 — LA BAJA DE LAS DEPENDENCIAS MUERTAS:** `@fontsource/dm-sans` y
    # `@fontsource/outfit` **están en `package.json` y NO se importan en ningún sitio** [V:
    # comprobado hoy]. **F-05 les da de baja**, y **este escenario es lo que lo ancla**: quitar una
    # dependencia **no es código y no lleva test propio**, pero si un `@font-face` suyo llegara a
    # `dist`, **el conjunto no coincide y el build rompe**. *Es la lección «no copiar del base»
    # mordiendo POR TERCERA VEZ: F-03 los tokens, F-04 el JSON-LD, F-05 las fuentes.*
    # **FILA 6 — `@fontsource-variable`, EL FALLO SILENCIOSO MÁS CARO** [V, medido]: **renombra la
    # familia a `'Manrope Variable'`** → si el SCSS dice `'Manrope'`, **la fuente NO CARGA y cae al
    # fallback SIN NINGÚN ERROR**. Aquí **rompe el build**, que es lo que queremos. (Además: solo
    # existe para Manrope —las otras dos dan **404**— y **no tiene `latin.css`**.)
    # **«ACUSANDO QUÉ PAR SOBRA O FALTA» NO ES COSMÉTICO: LA PUERTA ACUSA, NO GRUÑE** (@s25).
    # **POR QUÉ LISTA DECLARADA Y NO `MINIMO_DE_PARES = 18` (la forma de F-03):** (1) **crece con el
    # diseño** —nadie tiene que acordarse de subir un número—; (2) un mínimo sería frágil **por una
    # razón AJENA a la feature** (el nº de ficheros CSS de `dist` es **chunking y hash de Vite**);
    # (3) 🔴 **CONTRA STRYKER, EL LITERAL NUMÉRICO NO ANCLA NADA**: **medido sobre el registro
    # autoritativo `allMutators` del instrumenter 9.6.1 instalado, NINGUNO de los 16 mutadores muta
    # literales numéricos** [V] → `MINIMO_DE_PARES = 18` **NO GENERA MUTANTE**. **`ArrayDeclaration`
    # SÍ ataca la lista** → y **@s30 lo mata**. **LA FORMA ELEGIDA ES LA QUE SE PUEDE DEMOSTRAR
    # VIVA.**

  @s30
  Scenario: 🔴 la puerta falla si la lista de pares de fuente esperados está VACÍA — la guarda de la guarda
    Given un artefacto de producción cuyo CSS declara los 6 @font-face correctos y ningún origen externo
    And la lista de pares de fuente esperados []
    When se ejecuta la puerta de terceros sobre ese artefacto con la allowlist []
    Then el código de salida es distinto de 0
    And la salida declara que la lista de pares de fuente esperados está vacía
    And la salida NO declara que no haya violaciones

    # 🔴🔴 **ES LA GUARDA DE LA GUARDA: asevera EL COMPORTAMIENTO de la puerta ante una lista
    # esperada VACÍA — falla, no pasa vacuamente.** Con la lista vacía, «el conjunto de `@font-face`
    # coincide con el esperado» **se satisface VACUAMENTE** y **la puerta pasaría sin vigilar ni una
    # fuente**: **verde por vacuidad DENTRO del escenario que persigue el verde por vacuidad.**
    # **@s14 de F-03 tardó UN JUDGE en descubrir esta trampa.** No se descubre otra vez: **se hereda
    # escrita.**
    # 🔴🔴 **CORREGIDO — ERROR DE HECHO, hermano del @s32 de F-04, y estaba escrito TRES VECES:
    # este escenario decía ser «EL ESCENARIO QUE MATA A `ArrayDeclaration`». NO LO MATA.**
    # **EL MUTANTE:** `ArrayDeclaration` sustituye `['a','b']` → `[]` [V:
    # `array-declaration-mutator.js:7` → `if (path.isArrayExpression())`] — **solo dispara sobre un
    # literal de array EN EL FICHERO MUTADO**. **Y este escenario INYECTA SU PROPIO `[]` desde el
    # `Given`**, igual que todos sus hermanos: **NINGÚN escenario evaluaba jamás la constante de
    # producción** → **el mutante que la vacía le sobrevivía intacto**. *El contrato ya aplicaba bien
    # esa misma regla a la allowlist en @s20 (`:1007-1010`) y se contradecía a sí mismo.*
    # **Y el precedente que se invocaba lo desmiente:** en F-04 quien mata al mutante es **el ANCLA
    # QUE IMPORTA LA CONSTANTE** (`puerta-cascaron.test.ts:905`), **no un escenario de lista vacía
    # inyectada**. **ESO es el @s27 de F-04.**
    # → ✅ **QUIEN MATA A `ArrayDeclaration` ES @s38, EL ESCENARIO-ANCLA** (que este contrato **no
    # tenía** y ahora sí). **@s30 y @s38 son DISTINTOS Y LOS DOS HACEN FALTA:** @s38 fija **el VALOR**
    # de la constante; @s30 fija **el COMPORTAMIENTO** ante una lista vacía **venga de donde venga**.
    # 🔴 **LA RAZÓN Nº3 DE ELEGIR LA LISTA DECLARADA, REESCRITA CON LO MEDIDO:** **NINGUNO de los 16
    # mutadores de Stryker 9.6.1 muta literales numéricos** [V, medido sobre el registro autoritativo
    # `allMutators` del instrumenter **instalado** — *y ojo: el verificador dijo «19 mutadores» y
    # **fabricó el número**; la página oficial lista 17 encabezados e incluye `Checked Statement` y
    # `Assignment Expression`, **que son de Stryker.NET/Stryker4s, NO de StrykerJS**. **La fuente es
    # el CÓDIGO INSTALADO, no la página.***]. Un `18` **no genera mutante**; **esta lista SÍ — y por
    # eso EXIGE @s38**. *Nota honesta: eso hace que la lista declarada **necesite un ancla que
    # `MINIMO_DE_PARES = 18` no necesitaba**. **@s30 ancla contra HUMANOS, exactamente igual que el
    # `18` de F-03** — que es justo lo que la razón nº3 pretendía desacreditar.* **LA DECISIÓN SE
    # SOSTIENE por las razones 1 y 2** (crece con el diseño; un mínimo es frágil por chunking/hash de
    # Vite, razón ajena a la feature), **que bastan solas. Lo que cae es el porqué escrito.**
    # **EL 1er Given ES CRÍTICO: EL ARTEFACTO ESTÁ PERFECTO.** La puerta rompe **igual**, y por **la
    # lista**, no por el artefacto. Es lo que distingue este escenario de @s29.

  @s31
  Scenario: la puerta falla si no ha inspeccionado ni un solo recurso
    Given un artefacto de producción del que la puerta extrae 0 recursos de tipo html o css
    And la lista de pares de fuente esperados [("Manrope",400), ("Manrope",500), ("Manrope",600), ("Manrope",700), ("Gilda Display",400), ("Great Vibes",400)]
    When se ejecuta la puerta de terceros sobre ese artefacto con la allowlist []
    Then el código de salida es distinto de 0
    And la salida declara que no se inspeccionó ningún recurso
    And la salida NO declara que no haya orígenes externos

    # **EL OBJETO VIGILADO NO ES EL SITIO: ES EL EXTRACTOR** (precedente literal: @s28 de F-04). Que
    # la puerta informe **«0 orígenes externos» habiendo mirado 0 recursos** es el mismo verde por
    # vacuidad de @s29, **un nivel más abajo**: si el filtro de extensión (@s34) deja de casar, o el
    # `dist/` sale vacío, **la puerta pasa «protegidos» SIN HABER MIRADO NADA**.
    # **ES EL MODO DE FALLO MÁS PROBABLE DE ESTA PUERTA**: se ejecuta **DESPUÉS** del build (como
    # F-01/F-03/F-04 [V: `package.json`]), y **un build que no generó nada la dejaría escaneando el
    # vacío**.
    # ⚠️ **ES DISTINTO DE @s29 y DE @s30, y los tres hacen falta:** @s29 vigila **el conjunto de
    # fuentes**; @s30 vigila **la lista esperada**; @s31 vigila **que haya habido algo que
    # inspeccionar**. Un `dist/` con CSS pero sin `@font-face` cae en @s29; un `dist/` **sin ningún
    # html ni css** cae aquí. **@s32 cubre el caso en que `dist/` NO EXISTE**, que es otro: allí la
    # puerta **ni llega a contar**, porque el puerto **LANZA**.

  # ---------------------------------------------------------------------------
  # FALLA CERRADA — el puerto LANZA, y el doble del test LANZA donde el real lanza
  # ---------------------------------------------------------------------------

  @s32
  Scenario: la puerta falla cerrada si la lectura del artefacto LANZA
    Given un puerto de lectura del artefacto que LANZA al invocarse, como hace readdirSync cuando dist/ no existe
    When se ejecuta la puerta de terceros con ese puerto y la allowlist []
    Then el código de salida es distinto de 0
    And la salida declara que la puerta de terceros no pudo completar la inspección, con el motivo
    And la salida NO declara que no haya orígenes externos

    # **Modos de error (derivación de D-9/I-8, [I], igual que F-01, F-03 y F-04). ANTE LA DUDA: BUILD
    # ROTO, NUNCA BUILD VERDE.**
    # 🔴 **UNA PUERTA QUE SE TRAGA SU PROPIA EXCEPCIÓN Y DEVUELVE `[]` ES PEOR QUE NO TENER PUERTA,
    # PORQUE ADEMÁS DA CONFIANZA. ES LITERALMENTE CÓMO SE EVAPORARON LOS 3 BLOQUEANTES AA DEL STACK
    # BASE** [V]. Si la puerta puede fallar en silencio, **D-9 es falsa**.
    # 🔴 **AQUÍ SE PAGA LA DECISIÓN DEL PUERTO, Y ESTÁ RAZONADA — F-05 NO LLEVA `existe*`:**
    # **«las tres puertas comparten un patrón exacto» es FALSO: es 2 de 3** [V]. **F-03 no tiene
    # interfaz de puerto ni ningún `existe*`**: su puerto es **un campo suelto** (`readonly leerScss:
    # () => string`) con contrato de **una sola mitad**. **El `existe*` es CONDICIONAL, NO DOGMA:**
    # solo hace falta cuando la puerta necesita **distinguir «el artefacto no está» de «el artefacto
    # está y está mal»** para informar **por la rama correcta**. **F-04 lo necesita** (@s26 de F-04
    # exige acusar **qué ruta falta**). **F-05 NO**: si `dist/` no existe, `readdirSync` **lanza**, el
    # `catch` **falla cerrada con el motivo**, y **eso ya es informativo y correcto**. **NO HAY NINGÚN
    # ESCENARIO EN ESTE CONTRATO QUE EXIJA UNA LÍNEA DISTINTA — y sin escenario que la exija,
    # `existe*` sería PRODUCCIÓN SIN TEST ROJO Y UN MUTANTE INMORTAL.** Prescribírselo a F-05 «porque
    # las otras lo tienen» sería **atribuir a un patrón algo que el patrón no dice**.
    # 🔴 **LO INVARIANTE, Y LO ÚNICO QUE SE COPIA SIN PENSAR (lección @s20 de F-01):** el contrato del
    # puerto va **ESCRITO JUNTO AL PUERTO** («LANZA si el fichero/directorio no existe, que es lo que
    # hacen `readdirSync`/`readFileSync`»), y **EL DOBLE DEL TEST LO HONRA: LANZA DONDE EL REAL
    # LANZA.** **Un doble que devolviera `[]` donde el real lanza testea una puerta que no existe.**

  @s33
  Scenario: la puerta falla cerrada si la lectura de vite.config.ts LANZA
    Given un artefacto de producción cuyo CSS está limpio y con todos los @font-face esperados
    And un puerto de lectura de vite.config.ts que LANZA al invocarse, como hace readFileSync cuando el fichero no existe
    When se ejecuta la puerta de terceros con ese puerto y la allowlist []
    Then el código de salida es distinto de 0
    And la salida declara que la puerta de terceros no pudo completar la inspección, con el motivo
    And la salida NO declara que no haya orígenes externos

    # **EL SEGUNDO PUERTO, Y NO SOBRA.** El puerto de F-05 son **DOS campos sueltos** (forma F-03):
    # **`leerArtefacto()`** y **`leerConfigVite()`**, y **LOS DOS LANZAN**. @s32 ancla el primero;
    # **este ancla el segundo**.
    # **EL 1er Given ES CRÍTICO: EL ARTEFACTO ESTÁ LIMPIO.** Sin `vite.config.ts` **la puerta NO
    # PUEDE saber si `base` es `/`** (@s27) → **NO PUEDE CONCLUIR QUE EL BUILD ESTÁ LIMPIO**, aunque
    # el CSS lo parezca. **Un `catch` que solo envolviera la lectura del artefacto daría VERDE
    # AQUÍ**, y eso es exactamente el agujero: **la mitad de la puerta desactivada en silencio.**
    # **ANTE LA DUDA: BUILD ROTO, NUNCA BUILD VERDE.**

  # ---------------------------------------------------------------------------
  # EL HUMILDE: el filtro de extensión, el camino feliz, y dev (A1; A-27)
  # ---------------------------------------------------------------------------

  @s34
  Scenario: el humilde SOLO lee .html y .css — ni binarios, ni el JS del bundle
    Given un artefacto de producción cuyo "dist/assets/index-BQhTQL2u.js" contiene el literal "https://react.dev/errors/" y el literal "https://www.facebook.com/nailslashstudiorozas/"
    And cuyo "dist/assets/manrope-latin-400-normal-Bx.woff2" contiene ruido binario leído como utf8
    And cuyo "dist/index.html" y "dist/assets/index-DiwrgTda.css" están limpios, con los 6 @font-face esperados y sin ningún origen externo
    And un vite.config.ts que no declara base
    When se ejecuta la puerta de terceros sobre ese artefacto con la allowlist []
    Then el código de salida es 0
    And no se emite ninguna violación

  # 🔴 **@s40 ES LA OTRA MITAD DE @s34 Y VA CON ÉL**: aquí se asevera el COMPORTAMIENTO (el build es
  # verde con `.js` y `.woff2` presentes); **@s40 ancla LA DECISIÓN en el fichero donde vive**. Está
  # escrito abajo, junto a @s39, porque **comparte mecanismo con él** (leer el humilde como texto).

    # **A1: ES LO QUE VALIDA EL ALCANCE `(html|css)` DEL ACCEPTANCE**, y **el humilde filtra por
    # extensión** `/\.(html|css)$/i` — **exactamente como `ES_HTML = /\.html$/i` en
    # `tools/puerta-cascaron.ts:23`, cuyo comentario YA CITA EL RIESGO `.woff2` POR SU NOMBRE** [V].
    #
    # 🔴🔴 **REPARADO — EL ESCENARIO ERA INERTE Y NO PODÍA NACER ROJO.** Decía «Given un artefacto que
    # contiene el fichero "<fichero>" / When se ejecuta el build / **Then la puerta de terceros NO lee
    # ese fichero**», y tenía **dos defectos que se sumaban**: (1) **«no lee ese fichero» NO ES
    # OBSERVABLE** desde la salida de la puerta (`{codigoSalida, lineas}`) — @s35 comparte el mismo
    # When y demuestra cuál es el observable real: **código de salida + violaciones**; (2) **el Given
    # NO DABA CONTENIDO**, así que leer o no leer los ficheros **producía el MISMO resultado**: **un
    # humilde SIN filtro pasaba las 4 filas**. Y el contrato **no nombraba en NINGÚN punto el
    # mecanismo de anclaje del humilde** → el TDD lo escribía contra la función pura, que **nunca
    # recibe esos ficheros**, y **pasaba VACUAMENTE sin tocar el filtro**. **La protección de A-27 que
    # el contrato creía tener NO EXISTÍA.**
    # ✅ **AHORA SON DOS ESCENARIOS Y LOS DOS MUERDEN:** (a) el fixture **TIENE CONTENIDO que haría
    # INFLUIR al filtro** —el `.js` lleva literales `https://` **reales del `dist/` de hoy** y el
    # `.woff2` lleva ruido binario—, así que **con el filtro roto ESTO NACE ROJO**, que es justo lo
    # que antes no pasaba; (b) la decisión **se ancla DONDE VIVE**, con **el único mecanismo que el
    # repo tiene para eso** [V, §8 de la verificación, literal: *«cuando una DECISIÓN vive en el
    # humilde, **se ancla desde un test que lee el fichero**»*]: la forma de
    # `src/lib/diferidos.test.ts:89-96` — `readFileSync('tools/puerta-terceros.ts','utf8')` + aserción
    # **contra literal escrito a mano** + **la referencia «A-27» escrita en el propio humilde**, como
    # F-01 escribe «A-21». *(«SIN FICHERO DE TEST PROPIO» sigue siendo cierto y no se toca: no llevar
    # fichero de test propio **no es** no tener ancla.)*
    #
    # 🔴 **LA RAZÓN DE SER DEL FILTRO, CORREGIDA — Y LA VERDADERA ES MÁS FUERTE QUE LA QUE ESTABA
    # ESCRITA.** Decía: «las **únicas** URL de los `.js` de `dist/` son literales de cadena de
    # **mensajes de error y namespaces XML**». **ES FALSO, remedido fichero a fichero**, y **lo
    # desmentía la propia fuente de verdad que este contrato declara vinculante** (§2). Las URL de los
    # `.js` son **TODAS literales de cadena y ninguna una construcción de fetch**, pero son de **TRES
    # clases**, y **la tercera es la que importa**:
    #   (a) **mensajes de error de React** — `https://react.dev/errors/`, `http://fb.me/use-check-prop-types`
    #       [V: `react.react-server.production.js:14` **lo concatena en un mensaje de error**];
    #   (b) **namespaces XML** — `http://www.w3.org/*` (**18 ocurrencias, todas en `client-*.js`**);
    #   (c) 🔴 **LOS DATOS REALES DE F-02 Y F-04 QUE ROLLUP INLINEA EN `app-*.js`** — `https://schema.org`
    #       (el `@context`, F-04), `https://example.invalid` (la canónica, F-04) y
    #       `https://www.facebook.com/nailslashstudiorozas/` (`REDES.facebook`, F-02) [V, §2: import
    #       **estático** de `home.tsx:3` → `const Wi="https://schema.org"`].
    # **Son 24 URL en los `.js`, no 21** — la enumeración se dejaba fuera exactamente esas tres.
    # 🔴 **LA CLASE (c) ES LO QUE HACE EL FILTRO OBLIGATORIO Y NO MERAMENTE HIGIÉNICO: son datos de
    # features `done` que un `grep https?://` sobre el `.js` marcaría como orígenes externos y
    # ROMPERÍA EL BUILD DE UN REPO CORRECTO.** Por eso **la verificación lo prohíbe expresamente: «NO
    # grepear `https?://` sobre `dist/assets/*.js`: FALSOS POSITIVOS GARANTIZADOS»** [V]. *El contrato
    # argumentaba el filtro por su flanco DÉBIL («un literal no es un fetch») y ocultaba el FUERTE.*
    # *(También decía «Son CUATRO de las diez URL que hacen INSATISFACIBLE el acceptance 2»: tampoco
    # cuadraba — los `.js` cargan NUEVE de las diez distintas. Ver la cabecera, donde la prueba de
    # A-23 está ahora separada por alcances.)*
    # 🔴 **LA FILA DEL `.woff2` ES LA OTRA MITAD, Y ES A-27** ✅ (**CERRADA el 2026-07-17**): **F-05
    # es la PRIMERA feature que
    # mete BINARIOS en `dist/`**. **Leer binarios sería un FALSO POSITIVO ESPERANDO A OCURRIR**:
    # medido sobre los 108 `.woff`/`.woff2` reales de `@fontsource` leídos con utf8 → **no lanza**,
    # **554.818 U+FFFD**, **0 violaciones HOY**, pero **50.100 SECUENCIAS CANDIDATAS** al regex del
    # teléfono en ese ruido binario [V]. **La puerta de F-05 se protege sola con este filtro.**
    # ✅ **LO QUE ESTE ESCENARIO NO HACE, Y ES A-27 — DECIDIDO POR EL HUMANO EL 2026-07-17: LA DEUDA
    # SE QUEDA DECLARADA.**
    # **`tools/puerta-placeholders.ts` lista TODOS los ficheros SIN FILTRO DE EXTENSIÓN y hace
    # `readFileSync(ruta, 'utf8')`** [V]. **F-05 NO LO TOCA —NI ÉL NI
    # `features/puerta_placeholders.feature`— Y ESTE CONTRATO NO TIENE NI UN ESCENARIO SOBRE ÉL**:
    # la deuda es **de F-01, feature `done`**, y `progress/current.md:477-478` ya declara
    # que cerrarla **exige un escenario nuevo en `features/puerta_placeholders.feature`**. **Hacerlo
    # dentro de F-05 sin ese escenario sería PRODUCCIÓN SIN TEST ROJO: violación de la Ley 1.**
    # 🔴 **PARA EL `tdd_craftsman`: NO «arregles de paso» la puerta de placeholders. Está decidido
    # que NO. La deuda de F-01 sigue VIVA y DECLARADA, y es de otra feature.**
    # *Comprobado end-to-end inyectando un `.woff2` real en `dist/assets/`: **las tres puertas pasan,
    # exit 0** [V]. El falso positivo es **POTENCIAL, no determinista**, y **no se ha observado un
    # fallo real** — pero «0 violaciones» **NO significa que el hueco esté cerrado**: los ficheros que
    # entran en `dist/` tras el pipeline de Vite **no son byte a byte** los de `node_modules`.*
    # 🔴 **HUECO CONOCIDO, DECLARADO, NO CERRADO:** con el alcance `(html|css)`, **un
    # `fetch('https://tercero…')` desde el JS del bundle NO LO CAZARÍA ESTA PUERTA**. **Hoy no existe
    # ninguno** [V, medido]. **ES DEUDA DECLARADA, NO UN PROBLEMA RESUELTO.** *Alternativa
    # descartada:* extender la puerta al JS → falsos positivos garantizados, y distinguir un `fetch`
    # real de un literal **exige analizar el AST de un bundle minificado**. **ESO ES OTRA FEATURE, CON
    # SUS ESCENARIOS.** *Una puerta que se cree infalible es peor que ninguna* (límite declarado, como
    # @s11 de F-01 y T3 de F-04).

  @s35
  Scenario: el build de producción con el artefacto limpio termina con código de salida 0
    Given un artefacto de producción cuyo CSS declara exactamente los 6 @font-face esperados, todos con url(/assets/…woff2) o url(data:…), sin ningún @import ni url() externo
    And un HTML sin ningún subrecurso externo, con la canónica de F-04 y el JSON-LD de F-04
    And un <a href> a Facebook en ese HTML — lo añadirá F-12; hoy el HTML NO lo trae [V, medido]
    And un vite.config.ts que no declara base
    When se ejecuta el build de producción
    Then el código de salida es 0
    And no se emite ninguna violación

    # **EL CAMINO FELIZ. SIN ÉL, UNA PUERTA QUE ROMPIERA SIEMPRE PASARÍA TODOS LOS ESCENARIOS
    # NEGATIVOS.**
    # 🔴 **EL 2º Given ES EL ESCENARIO ENTERO, Y ES LO QUE HACE SATISFACIBLE LA PROPUESTA DE A-23**:
    # el artefacto **limpio** de F-05 **CONTIENE, EN EL HTML QUE LA PUERTA SÍ LEE**, la canónica
    # `https://example.invalid` (F-04) y el `@context` `https://schema.org` (F-04) — **las DOS únicas
    # URL externas del `dist/index.html` de hoy** [V, §0, remedido] — **y el build es VERDE.**
    # 🔴 **CORREGIDO — decía «es decir, LAS DIEZ URL EXTERNAS MEDIDAS EN EL `dist/` DE HOY [V, §0]»,
    # y era un ERROR DE HECHO con atribución [V] falsa, en el comentario que ES LA JUSTIFICACIÓN DE
    # A-23 QUE VA A LA PUERTA HUMANA.** Dos recuentos independientes lo tumban: **(1) ARITMÉTICA** —
    # el comentario enumeraba cuatro grupos (`example.invalid`, `schema.org`, Facebook, `w3.org/*`) =
    # **8 de las 10 distintas**; faltaban `https://react.dev/errors/` y `http://fb.me/use-check-prop-types`,
    # **que el propio @s34 SÍ enumera** (el contrato ya las conocía y aquí las perdía en silencio).
    # **(2) RELEVANCIA** — `dist/index.html` de hoy contiene **DOS**; los `w3.org/*` y las de React
    # **viven solo en `.js`, que @s34 dice literalmente que la puerta NO LEE** → **no pueden ser lo
    # que pone verde este escenario**, y **no aparecían en ningún Given**. *Le decía al humano que el
    # camino feliz ejercita las diez cuando ejercita **las dos que la puerta lee**.*
    # 🔴 **Y EL `<a href>` A FACEBOOK: CORREGIDO, PERO NO BORRADO.** El Given describía un artefacto
    # **que no existe** —hoy `dist/index.html` **no tiene ningún `<a href>` a Facebook** [V: 0
    # ocurrencias; vive como literal en `app-*.js`]— y un `tdd_craftsman` que construyera el fixture
    # desde ese Given **construiría un artefacto que contradice el `dist/` real: el modo de fallo de
    # A-16 (F-03)**. **Se queda MARCADO como lo que es: F-12 lo añadirá**, y **este escenario es lo
    # que garantiza que, cuando lo haga, el build siga verde**. *Preventivo, no descriptivo.*
    # **LAS OTRAS SIETE de las diez viven en `dist/assets/*.js`, que la puerta NO lee (@s34).**
    # **CON EL ACCEPTANCE 2 VIEJO («CUALQUIER origen externo») ESTE ESCENARIO ERA IMPOSIBLE Y F-04 Y
    # F-02 —LAS DOS `done`— SE ROMPÍAN.** ✅ **A-23 CERRADA EL 2026-07-17: el acceptance 2 está
    # REESCRITO en `feature_list.json` §5 («una PETICIÓN AUTOMÁTICA a un origen externo») y este
    # escenario es SATISFACIBLE. Es exactamente el escenario que la reescritura vino a salvar.**
    # **Se encadena en `pnpm build` DESPUÉS de `vite-react-ssg build`**, como F-01/F-03/F-04 [V:
    # `package.json`].

  @s36
  Scenario: el build de desarrollo NO invoca la puerta de terceros
    Given un artefacto con un <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700">
    When se ejecuta el build de desarrollo
    Then el código de salida es 0

    # **Precedente F-01/@s14, F-03 y F-04/@s31: la función es PURA; el `exit ≠ 0` vive en LA
    # PUERTA**, y la puerta se engancha **SOLO a `pnpm build` de producción**, **DESPUÉS** de
    # `vite-react-ssg build` [V: `package.json`]. **`dev` NO la invoca.**
    # **LA PUERTA SEPARA «VER» DE «PUBLICAR».** El fixture es **la petición literal del prototipo**
    # [V]: en local, mientras se porta el diseño, **es legítimo** tenerla un rato. **Lo que es
    # imposible es PUBLICARLA.**

  # ---------------------------------------------------------------------------
  # EL [I] QUE EL TDD DEBE MEDIR EN SU PRIMER TEST
  # ---------------------------------------------------------------------------

  @s37
  Scenario Outline: el nombre de familia se compara DESTOKENIZADO y SIN COMILLAS, como sale del CSS minificado
    Given un artefacto de producción cuyo CSS declara los 6 @font-face esperados, sin ningún origen externo
    And en ese CSS el @font-face de <familia> se declara como font-family: <declaracion>
    And la lista de pares de fuente esperados [("Manrope",400), ("Manrope",500), ("Manrope",600), ("Manrope",700), ("Gilda Display",400), ("Great Vibes",400)]
    And un vite.config.ts que no declara base
    When se ejecuta la puerta de terceros sobre ese artefacto con la allowlist []
    Then el código de salida es 0
    And no se emite ninguna violación
    And la salida NO declara que sobre ni que falte el par <par>

    Examples:
      | familia         | declaracion      | par                     | por qué                                          |
      | "Gilda Display" | "Gilda Display"  | ("Gilda Display", 400)  | comillas dobles: la forma de @fontsource [V]     |
      | "Gilda Display" | 'Gilda Display'  | ("Gilda Display", 400)  | comillas simples                                 |
      | "Gilda Display" | Gilda Display    | ("Gilda Display", 400)  | SIN comillas: Vite PUEDE quitarlas al minificar  |
      | "Manrope"       | "Manrope"        | ("Manrope", 400)        | con comillas: la forma de @fontsource [V]        |

    # 🔴🔴 **REPARADO — EL `Then` NO ERA MEDIBLE Y EL «PAR» NO ERA UN PAR.** Decía «**Then el par se
    # reconoce como <par>**» con `<par>` = `(Gilda Display)`. **Tres defectos independientes, los
    # tres reales:**
    #   1. **NO HAY CANAL POR EL QUE ESCRIBIR ESE `expect`**: la arquitectura fija la salida en
    #      `{codigoSalida, lineas}`, y «se reconoce» **no es ninguno de los dos**. *Medido: `grep -n
    #      "reconoce"` → **UNA sola ocurrencia en las 1534 líneas**, ésta — **el único verbo de
    #      aserción del fichero sin contrapartida en la arquitectura**. Los otros 8 escenarios que
    #      comparten este When aseveran por el canal real.* **La salida más probable —exportar un
    #      destokenizador para hacer legible el par— es PRODUCCIÓN QUE NINGÚN ESCENARIO EXIGE**, justo
    #      lo que este contrato prohíbe en su sección del puerto («sin escenario que la exija, sería
    #      producción sin test rojo y un mutante inmortal»). **El defecto empujaba al TDD a la trampa
    #      que el contrato veta en otra página.**
    #   2. **`(Gilda Display)` NO ES UN PAR**: el objeto vigilado es `[familia, peso]`, y @s29 acusa
    #      en forma `("Manrope", 300)`. **El contrato usaba su término portante con dos significados
    #      con 2 líneas de distancia**, y el Given no declaraba `font-weight`, así que **no podía
    #      construir el par que el Then decía reconocer**. **Corregido: la columna lleva el peso.**
    #   3. **LAS CUATRO FILAS COLAPSABAN AL MISMO OBSERVABLE**: el Given declaraba «**el** @font-face»
    #      (**singular**) contra una lista de **6** esperados → por la guarda de @s29 («ni uno más, ni
    #      uno menos») → **exit ≠ 0 en LAS CUATRO FILAS**, por una razón **ajena al escenario**. **La
    #      variación de comillas —lo ÚNICO que este escenario existe para medir— NUNCA alcanzaba el
    #      observable.** *(Y faltaba el Given de `vite.config.ts`, que @s33 hace disparar al fallar
    #      cerrada.)*
    # ✅ **AHORA: artefacto COMPLETO (6 `@font-face`) + salida real + par con peso.** Así **una
    # destokenización ingenua (partir por espacios) NACE ROJA en las tres primeras filas** —
    # `'Gilda Display'` **lleva un espacio**, y por eso es la familia elegida— **que es exactamente lo
    # que el [I] manda medir, y AHORA SE MIDE A TRAVÉS DE LA PUERTA, no de un helper interno.**
    #
    # 🔴 **[I] DECLARADO, Y EL `tdd_craftsman` DEBE MEDIRLO EN SU PRIMER TEST — NO SUPONERLO.** Que
    # el nombre de familia **sobreviva al CSS MINIFICADO de `dist`** es una **inferencia**, no un
    # hecho medido: **Vite no renombra identificadores CSS, PERO PUEDE QUITAR LAS COMILLAS**. → **la
    # comparación es sobre el nombre DESTOKENIZADO y SIN COMILLAS**, y **ESO SE MIDE, NO SE SUPONE**.
    # **`'Gilda Display'` LLEVA UN ESPACIO, y por eso es la familia que se elige para las dos
    # primeras filas**: es donde una destokenización ingenua (partir por espacios) **se rompe**.
    # ⚠️ **SI AL MEDIRLO RESULTA QUE VITE HACE OTRA COSA** (renombra, escapa, colapsa), **este
    # escenario NACE EN ROJO y se VUELVE A LA PUERTA HUMANA — NO SE LE BAJA EL LISTÓN EN SILENCIO.**
    # Es la postura de @s28 de F-04 con el `[NV]` de los href, y es la correcta.
    # 🔴 **`MethodExpression` `toLowerCase`⇄`toUpperCase`**: si la destokenización normaliza la caja,
    # ese mutante existe y **NO se mata aquí** (las cuatro filas usan la misma caja) → **lo mata @s7
    # en el camino del `rel`**, y si el diseño normaliza la caja **también** en el nombre de familia,
    # **hará falta una fila con `MANROPE`**. **Se decide MIDIENDO, y se declara en
    # `progress/mutation_cero_terceros.md`.**

  # ---------------------------------------------------------------------------
  # LAS DOS CONSTANTES DE PRODUCCIÓN — LO QUE NINGÚN ESCENARIO ASEVERABA
  # 🔴 AÑADIDOS POR LA REVISIÓN ADVERSARIAL. Los 34 pasos que mencionan la allowlist y la lista de
  #    pares las INYECTAN desde el test: sin estos dos escenarios, los valores REALES que corren en
  #    el build no los fija nadie. «Una allowlist que nadie puede rellenar no es una allowlist
  #    vacía: es una constante sin test» — lo dice este mismo fichero en @s20.
  # ---------------------------------------------------------------------------

  @s38
  Scenario: 🔴 PARES_DE_FUENTE_ESPERADOS está ANCLADA contra un literal escrito a mano — y no está vacía
    Given la constante PARES_DE_FUENTE_ESPERADOS exportada por "src/lib/puerta-terceros.ts"
    Then es exactamente [("Manrope",400), ("Manrope",500), ("Manrope",600), ("Manrope",700), ("Gilda Display",400), ("Great Vibes",400)]
    And su longitud es mayor que 0

    # 🔴🔴 **ESTE ESCENARIO NO EXISTÍA, Y SIN ÉL LA FEATURE NO CIERRA. ES EL ÚNICO QUE MATA A
    # `ArrayDeclaration` SOBRE LA CONSTANTE DE PRODUCCIÓN.**
    # **EL MUTANTE:** `['a','b']` → `[]` [V: `array-declaration-mutator.js:7`, `isArrayExpression()`].
    # **Aplicado a `PARES_DE_FUENTE_ESPERADOS`, LA GUARDA DE @s29 SE DESACTIVA SOLA**: con la lista
    # vacía, «el conjunto de `@font-face` coincide con el esperado» **se satisface VACUAMENTE**.
    # **@s30 NO lo mata** —inyecta su propio `[]` y jamás evalúa la constante—, y con `break: 100`
    # el mutante sería **INMORTAL**: **la puerta de mutación rompe y ningún escenario puede
    # arreglarla.** *(El contrato afirmaba tres veces que lo mataba @s30. Era falso, y era la razón
    # nº3 —la única que apelaba a Stryker— para elegir esta forma de guarda.)*
    # 🔴 **ESTO NO ES TAUTOLOGÍA — ES LO CONTRARIO, Y LA DISTINCIÓN ES LA REGLA DURA DE LA CABECERA:**
    # **se ancla contra un LITERAL ESCRITO A MANO, NO contra el símbolo importado.** Importar la
    # constante **para compararla consigo misma** sería tautología; importarla **para FIJARLA contra
    # seis pares escritos a mano** es lo que impide que alguien la vacíe sin que nada se ponga rojo.
    # **PRECEDENTE LITERAL, YA DESPLEGADO Y VERDE EN F-04** [V, comprobado hoy]:
    # `src/lib/puerta-cascaron.ts:828` → `export const RUTAS_ESPERADAS: readonly string[] = ['/']`;
    # `puerta-cascaron.test.ts:24` **importa el símbolo**; `:901` → `expect([...RUTAS_ESPERADAS])
    # .toEqual(['/'])`; `:905` → `expect(RUTAS_ESPERADAS.length).toBeGreaterThan(0)`. Y su comentario
    # (`:893-898`) nombra el precio de no tenerlo: «**SI NINGÚN TEST LA FIJA, vaciarla no pondría
    # rojo nada y DESACTIVARÍA LA GUARDA DE @s26 EN EL BUILD REAL** (es la **deuda 2 que el judge
    # encontró en F-03 con `MINIMO_DE_PARES`**)». **F-05 la reintroducía. Aquí se cierra.**
    # 🔴 **DÓNDE VIVE, QUE EL CONTRATO NO DECÍA EN NINGÚN SITIO:** la constante se **exporta desde
    # `src/lib/puerta-terceros.ts`** (**DENTRO de `mutate`** → el mutante EXISTE y este escenario lo
    # mata) y **el humilde `tools/puerta-terceros.ts` LA CABLEA**, como `tools/puerta-cascaron.ts:44`
    # (`rutasEsperadas: RUTAS_ESPERADAS`). *Si viviera en `tools/` (fuera de `mutate`) el mutante ni
    # existiría — y su valor de producción no lo aseveraría nadie: la deuda 2, otra vez.*
    # ⚠️ **@s38 y @s30 SON DISTINTOS Y LOS DOS HACEN FALTA:** @s38 fija **el VALOR** de la constante;
    # @s30 fija **el COMPORTAMIENTO** de la puerta ante una lista vacía, **venga de donde venga**.
    # ✅ **A-28 CERRADA EN LA PUERTA DEL 2026-07-17: SOLO `latin`. ESTA LISTA NO CAMBIA — LOS 6 PARES
    # SE QUEDAN, Y EL LITERAL ESCRITO A MANO DE ESTE ESCENARIO ES EL DEFINITIVO.**
    # ⚠️ **NOTA CONSERVADA (el límite declarado):** si algún día entra `latin-ext` —**solo cuando
    # exista un nombre REAL que lo exija, y CON SU PROPIO ESCENARIO**— **esta lista cambiaría** (+6
    # woff2) **y este escenario se actualizaría con ella**. Que es exactamente la gracia de anclarla:
    # **el cambio es VISIBLE y hay que venir aquí a escribirlo.**

  @s39
  Scenario: 🔴 el humilde pasa la allowlist VACÍA, y lo declara por escrito
    Given el fichero "tools/puerta-terceros.ts" leído como texto
    Then la allowlist que pasa a la puerta es exactamente []
    And no declara ningún origen permitido
    And declara por escrito la referencia "A-23"

    # 🔴🔴 **ESTE ESCENARIO NO EXISTÍA, Y ERA EL HUECO SOBRE EL INVARIANTE TITULAR DE LA FEATURE.**
    # **NINGÚN escenario aseveraba que la allowlist de PRODUCCIÓN fuera `[]`.** **Medido: `grep -n
    # "allowlist" features/cero_terceros.feature` → los 34 pasos la INYECTAN desde el test** con un
    # literal en el `When`; y **los tres únicos escenarios que corren el build real (@s34, @s35,
    # @s36) NO la nombraban**. Como el contrato exige **parámetro SIN `default`**, el `[]` de
    # producción **SOLO existe en `tools/puerta-terceros.ts`** — que el contrato declara **sin
    # fichero de test propio y fuera de `mutate`**.
    # 🔴 **CONSECUENCIA REAL, Y ES GRAVE: un `["fonts.googleapis.com"]` en el humilde dejaba los 37
    # escenarios VERDES y el build VERDE, y EMBARCABA GOOGLE FONTS** — **el acceptance 3 derrotado
    # con la puerta en verde**, y el acceptance 1 («con allowlist vacía») **sin un solo test**.
    # **LO DICE ESTE MISMO FICHERO, EN @s20, Y DABA EL VEREDICTO AL REVÉS:** «una allowlist que nadie
    # puede rellenar **no es una allowlist vacía: es una constante sin test**».
    # 🔴 **INCONSISTENCIA INTERNA QUE LO DELATA:** el contrato **SÍ anclaba** una decisión del humilde
    # que el acceptance **no nombra** (el filtro de extensión, @s34) y **dejaba sin anclar la que el
    # acceptance SÍ nombra** (la allowlist).
    # **MECANISMO — el mismo de @s34 y el único que el repo tiene** [V, §8 de la verificación, la
    # fuente de verdad designada: *«cuando una **decisión** vive en el humilde, **se ancla desde un
    # test que lee el fichero**»*]: `src/lib/diferidos.test.ts:89-96` → «🔴 **EL ANCLA DEL ANCLA. Lo
    # anterior mira los SÍMBOLOS; esto mira EL FICHERO REAL que corre en el build. Sin esto, alguien
    # cablea `registrosSeo` en el humilde y los tests de arriba siguen verdes**» con
    # `readFileSync('tools/puerta-placeholders.ts','utf8')` **y aserción contra literal escrito a
    # mano**. **La referencia «A-23» va ESCRITA en el humilde**, como F-01 escribe «A-21»: **quien
    # rellene la allowlist tiene que leer por qué estaba vacía.**
    # ⚠️ **NO CONTRADICE A @s20:** @s20 exige que la allowlist **PUEDA** ser no vacía (es la única
    # necesidad del diseño, y sin ella `FilterRemoval` es inmatable). **@s39 exige que EN PRODUCCIÓN
    # SEA `[]`.** **Son la capacidad y el valor: dos cosas distintas, y las dos hacen falta.**

  @s40
  Scenario: el filtro de extensión del humilde está ANCLADO en el fichero donde vive
    Given el fichero "tools/puerta-terceros.ts" leído como texto
    Then declara el filtro de extensión /\.(html|css)$/i
    And no pasa a la puerta ningún fichero que no case ese filtro
    And declara por escrito la referencia "A-27"

    # 🔴 **ES LA OTRA MITAD DE @s34, Y SIN ELLA LA DECISIÓN NO LA ASEVERA NADIE.** @s34 mide el
    # COMPORTAMIENTO (build verde con `.js` y `.woff2` presentes, y **nace rojo si el filtro se
    # rompe**); **@s40 ancla LA DECISIÓN donde vive**. **El filtro `/\.(html|css)$/i` vive SOLO en el
    # humilde**, que está **fuera de `mutate`** y **sin fichero de test propio**: **ningún test contra
    # la función pura lo toca jamás** — la pura recibe los recursos **YA FILTRADOS**.
    # **MECANISMO: el mismo de @s39** [V, §8 de la verificación: *«cuando una **decisión** vive en el
    # humilde, **se ancla desde un test que lee el fichero**»*] — forma `diferidos.test.ts:89-96`,
    # `readFileSync('tools/puerta-terceros.ts','utf8')`, **aserción contra literal escrito a mano**, y
    # **la referencia «A-27» ESCRITA EN EL PROPIO HUMILDE**, como F-01 escribe «A-21».
    # ✅ **A-27 CERRADA EL 2026-07-17, Y SE CERRÓ ASÍ: LA DEUDA SE QUEDA DECLARADA.** Este escenario
    # ancla **el filtro de F-05** —que es **lo que F-05 SÍ hace**, y el humano lo aprobó— y **NO** la
    # deuda de `tools/puerta-placeholders.ts`, que es **de F-01 (feature `done`)** y **exige un
    # escenario nuevo en `features/puerta_placeholders.feature`**. **El humano decidió NO reabrir
    # F-01 hoy: la deuda sigue viva y declarada, y F-05 no la toca.**

  # ---------------------------------------------------------------------------
  # 🔴 LO MALFORMADO — LA AMPLIACIÓN APROBADA POR EL HUMANO EL 2026-07-17 (@s41..@s43)
  #
  # **NINGÚN ESCENARIO DE LOS 40 METÍA UNA ENTRADA MALFORMADA**, y por eso la mutación dejó **10
  # supervivientes**: `rel`/`href` ausentes, una URL que NO PARSEA, un `@font-face` en un HTML.
  # **El contrato cubría MUY BIEN lo que el artefacto SÍ trae, y no fijaba NADA de lo que pasa con
  # lo malformado.** **Las guardas defensivas del código SON CORRECTAS Y SE QUEDAN** (decisión 1 del
  # humano): sin ellas el detector **LANZA TypeError** ante HTML malformado y —lo peor— **un `<base>`
  # sin `href` seguido de uno válido a un tercero haría que la petición al tercero fuera INVISIBLE**:
  # **un FALSO NEGATIVO, el peor fallo posible para esta feature. LO QUE FALTABAN ERAN LOS
  # ESCENARIOS, NO EL CÓDIGO.**
  # ---------------------------------------------------------------------------

  @s41
  Scenario Outline: HTML malformado: la puerta NO lanza y NO inventa un origen que nadie pide
    Given un recurso "dist/index.html" de tipo html que contiene <marcado>
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then la llamada NO lanza ninguna excepción
    And no se detecta ningún origen externo

    Examples:
      | marcado                                                                | por qué                                                             |
      | <link href="https://cdn.tercero.com/x.css">                            | 🔴 `<link>` SIN `rel`: no declara qué es, y NADA lo pide            |
      | <base href="https://cdn.tercero.com/"><link rel="stylesheet">          | 🔴 `<link rel>` SIN `href`: no hay nada que pedir. LA BASE ES A UN TERCERO A PROPÓSITO |
      | <img src="http://[">                                                   | 🔴 URL INVÁLIDA en un subrecurso: `URL.parse` → `null`              |

    # 🔴🔴 **ESCENARIO NUEVO — LA AMPLIACIÓN DEL 2026-07-17. LAS TRES FILAS SALEN DEL INFORME DE
    # MUTACIÓN (`progress/mutation_cero_terceros.md` §4), Y LAS TRES ESTÁN MEDIDAS CONTRA EL CÓDIGO
    # REAL** [V, 2026-07-17: **0 orígenes y sin excepción en las tres**].
    # **NO ENCAJABAN EN NINGUNO DE LOS 40**: @s2/@s3/@s7 fijan `rel` **en el propio `Given`** (no hay
    # forma de quitarlo por una fila), @s18 es «las URL que **resuelven al propio sitio**» —y esto
    # **NO** resuelve al propio sitio: es un tercero **que sencillamente no se pide**— y @s1 exige
    # **exactamente 1** origen. **Por eso es escenario nuevo, y solo por eso.**
    #
    # **FILAS 1 y 2 — MATAN LOS 4 MUTANTES DEL GRUPO A** (`terceros.ts:257-258`), **y se cubren entre
    # sí**: `ConditionalExpression` `rel !== undefined && href !== undefined` → `true`,
    # `ConditionalExpression` `rel !== undefined` → `true`, `LogicalOperator`
    # `(rel !== undefined || href !== undefined) && …`, y `ConditionalExpression`
    # `href !== undefined` → `true`.
    #   - **FILA 1** (sin `rel`): con el mutante, `contactaConElOrigen(undefined)` hace
    #     `undefined.split` → **TypeError**. Mata `rel !== undefined → true`, el `&&`→`||` y el
    #     colapso a `true`.
    #   - **FILA 2** (sin `href`): con el mutante se hace **`yield undefined`**, que **resuelve contra
    #     la base** → **`https://cdn.tercero.com/undefined`: UN FALSO POSITIVO INVENTADO**, un origen
    #     que **nadie escribió y que nadie pide**. Mata `href !== undefined → true`.
    # 🔴🔴 **LA FILA 2 TIENE QUE LLEVAR EL `<base>` A UN TERCERO, Y NO ES DECORACIÓN: CON LA BASE
    # PROPIA EL MUTANTE ES INDISTINGUIBLE** (ambos caen del lado propio → 0 = 0 → **SOBREVIVE**).
    # **MEDIDO, no deducido** [V, 2026-07-17]: `URL.parse(undefined, 'https://cdn.tercero.com/')` →
    # **`https://cdn.tercero.com/undefined`, host `cdn.tercero.com`** (→ 1 ≠ 0 → **MUERE**), frente a
    # `URL.parse(undefined, 'https://propio.invalid/')` → host `propio.invalid` (→ 0 = 0 →
    # **sobrevive**). **NADIE QUITE ESE `<base>` POR «SIMPLIFICAR EL FIXTURE»: LO DESACTIVA.**
    #
    # **FILA 3 — MATA `terceros.ts:299` `ConditionalExpression`** (`url === null || …` → `false || …`).
    # Con el mutante: `null.protocol` → **TypeError**. **Es el HERMANO EXACTO del `OptionalChaining`
    # de `:241`** (la 4ª fila de @s9): **NADA en la suite metía una URL QUE NO PARSEE**, ni por la
    # rama de la `base` ni por la del subrecurso. **Las dos filas van juntas a propósito.**
    # ⚠️ **`http://[` NO ES UN CAPRICHO**: es un host IPv6 sin cerrar, **la forma más corta que hace
    # que el parser WHATWG devuelva `null`** — y `.invalid` **no serviría**: parsea perfectamente.
    #
    # ✅ **DECISIÓN 1 DEL HUMANO (2026-07-17): LAS GUARDAS SON CORRECTAS Y SE QUEDAN.** **Un
    # `tdd_craftsman` que «matara» estos mutantes BORRANDO las guardas rompería la feature**: sin
    # ellas, un HTML malformado **revienta la puerta** (filas 1 y 3) o **inventa un tercero que no
    # existe** (fila 2). **AQUÍ NO SOBRABA CÓDIGO: FALTABA CONTRATO.**

  @s42
  Scenario: 🔴 un <base> sin href NO corta la búsqueda: gana el primer <base href> VÁLIDO
    Given un recurso "dist/index.html" de tipo html que contiene <base><base href="https://cdn.tercero.com/"><img src="a.png">
    When se llama a detectarOrigenesExternos con ese recurso y la allowlist []
    Then hay exactamente 1 origen externo detectado
    And el origen detectado declara el origen "cdn.tercero.com" y el valor "https://cdn.tercero.com/a.png"

    # 🔴🔴 **ESCENARIO NUEVO — LA AMPLIACIÓN DEL 2026-07-17. MATA `terceros.ts:240`
    # `ConditionalExpression`** (`if (href !== undefined)` → `if (true)`).
    # **ES EL PEOR DE LOS 10, Y POR ESO TIENE ESCENARIO PROPIO: EL MUTANTE PRODUCE UN FALSO
    # NEGATIVO.** Con él, el **primer `<base>` (el que NO tiene `href`)** devuelve `…/undefined` **y
    # CORTA EL BUCLE**: el `<base href>` del tercero **no se consulta JAMÁS**, `a.png` resuelve al
    # sitio propio y **LA PETICIÓN AL TERCERO SE VUELVE INVISIBLE**. **Un falso negativo es el peor
    # fallo posible para F-05: la puerta diría «limpio» mientras el visitante entrega su IP.**
    # **LA LETRA, Y ESTE ESCENARIO LA FIJA** [V, HTML Living Standard §4.6.5]: **gana el PRIMER
    # `<base>` que TENGA `href`**, no el primer `<base>` a secas. [V, medido hoy contra el código
    # real: **1 origen, valor `https://cdn.tercero.com/a.png`**.]
    # 🔴🔴 **UN `<base>` SIN HREF A SECAS **NO** LO MATA, Y ESO ES LO QUE HACE QUE ESTE FIXTURE TENGA
    # QUE LLEVAR LOS DOS `<base>`** [V, medido: `<base><img src="a.png">` → **0 orígenes con y sin
    # mutante**, porque `…/undefined` y `…/` **son AMBOS host propio → INDISTINGUIBLE**]. **Quien
    # «simplifique» este fixture a un solo `<base>` deja el mutante vivo y el falso negativo abierto.**
    # **NO ENCAJA EN @s9**: su `Given` inyecta **UN** `<base href="<base>">` por plantilla — **no hay
    # fila que pueda meter DOS elementos `<base>`, y uno de ellos sin atributo**. Por eso va aparte.
    # ⚠️ **ES LA HERMANA DE @s9**, y las dos existen por lo mismo: **hay vías por las que un tercero
    # entra SIN QUE NADIE ESCRIBA SU NOMBRE en la construcción** que pide.

  @s43
  Scenario: 🔴 un @font-face dentro de un recurso html NO cuenta como par: los pares son DEL CSS
    Given un artefacto de producción cuyo "dist/assets/x.css" declara exactamente los 6 @font-face esperados, todos con url(/assets/…woff2)
    And ese mismo artefacto tiene un "dist/index.html" que contiene en línea "<style>@font-face{font-family:'Impostora';font-weight:400;src:url(/assets/i.woff2)}</style>"
    And la lista de pares de fuente esperados [("Manrope",400), ("Manrope",500), ("Manrope",600), ("Manrope",700), ("Gilda Display",400), ("Great Vibes",400)]
    And un vite.config.ts que no declara base
    When se ejecuta la puerta de terceros sobre ese artefacto con la allowlist []
    Then el código de salida es 0
    And no se emite ninguna violación
    And la salida NO declara que sobre el par ("Impostora", 400)

    # 🔴🔴 **ESCENARIO NUEVO — LA AMPLIACIÓN DEL 2026-07-17. MATA `puerta-terceros.ts:159`
    # `ConditionalExpression`** (`if (recurso.tipo === TIPO_CSS)` → `if (true)`), **el ÚNICO
    # superviviente de `puerta-terceros.ts` (99,09 %)**.
    # **`paresDelCss` PROMETE «del CSS» Y NADA LO COMPROBABA**: **ningún recurso `html` de los tests
    # llevaba un `@font-face`**, así que **el filtro por tipo no lo aseveraba nadie** — otra **promesa
    # sin puerta**, la misma especie que el `:58` de @s1.
    # **CON EL MUTANTE, EL `@font-face` DEL HTML ENTRA EN EL CONJUNTO** → «**sobra el par
    # ("Impostora", 400)**» → **BUILD ROTO POR UN FALSO POSITIVO**. [V, medido hoy contra el código
    # real: **código de salida 0 y ninguna violación**.]
    # 🔴 **EL `Then` NO SE QUEDA EN EL CÓDIGO DE SALIDA, Y ES DELIBERADO** (lección de esta tanda):
    # acusar **el par concreto** es lo que hace el aserto **específico del mutante** y no de cualquier
    # otro fallo que también diera exit 0. **LA PUERTA ACUSA, NO GRUÑE** (@s25).
    # **`'Impostora'` es un FIXTURE**, escrito **A MANO** y **elegido para que NO PUEDA CONFUNDIRSE con
    # ninguna de las 3 familias reales** (anti-tautología: **jamás se importa
    # `PARES_DE_FUENTE_ESPERADOS` como valor esperado** — el ancla de la constante es **@s38**, y sigue
    # siendo la única que la importa).
    # **NO ENCAJA EN @s28 NI EN @s29**: @s28 **no es un Outline** (no admite filas) y el `Then` de @s29
    # exige **código de salida DISTINTO de 0**. **Éste exige 0: es un camino feliz, y es su contrario.**
    # ⚠️ **UN `@font-face` inline en el HTML NO ES HIPOTÉTICO**: es exactamente lo que emite un
    # `<style>` crítico en línea, y `dist/index.html` **SÍ pasa por esta puerta** (@s34: el filtro del
    # humilde deja entrar `.html` **y** `.css`). **El `url(/assets/…)` es propio: no hay origen externo
    # que detectar aquí, y por eso el único eje que este escenario mide es EL CONJUNTO DE PARES.**
