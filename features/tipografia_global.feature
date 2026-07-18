# Contrato de la MICRO-FEATURE NUEVA `tipografia_global` (propuesta id 21).
# Destilado de `progress/spec_draft_tipografia_global.md` (borrador para la puerta).
#
# =============================================================================================
# ⏸⏸  PENDIENTE DE PUERTA HUMANA (LOTE 2026-07-18)  ⏸⏸
#    Este `.feature` NO está aprobado todavía. Va al LOTE de aprobación del 2026-07-18 junto con el
#    resto de propuestas pendientes. Hasta que el humano lo ratifique en la puerta:
#      · el `craftsman_lead` NO añade la entrada id 21 a `feature_list.json` (la aplica DESPUÉS del OK),
#      · el `tdd_craftsman` NO implementa ni una línea (nada de Rojo-Verde-Refactor),
#      · NADIE toca `src/styles/`.
#    El `gherkin_author` PROPONE con recomendación cerrada por pregunta; el humano DECIDE (precedente
#    F-05 A-23, F-06 B-x, F-07 C-x). Origen: deuda DECLARADA en el cierre de F-07
#    (`progress/verificacion_viva_hero_marca.md` §«Hallazgos FUERA DE ALCANCE», punto 2): el `body`
#    global NO fija `font-family` (`grep font-family src/styles` = 0) → el cuerpo cae en la serif por
#    defecto del UA (Times New Roman), visible en la captura EN VIVO («Servicios», el cuerpo).
#
# =============================================================================================
# DECISIONES QUE VAN A LA PUERTA (D-1 · D-2 · D-3, + dos menores) — con la recomendación YA cerrada.
# El humano solo confirma o corrige en el lote. Este contrato destila la recomendación COMO DECIDIDA
# (los escenarios ya la asumen); si el humano corrige, se re-destila (como en F-06 B-x).
# =============================================================================================
#   · D-1 — ¿`h2` y `h3`, o solo `h2`?  → RECOMENDADO: **h2 Y h3**.
#           Es el diseño MEDIDO (main.tsx:22, «Gilda Display 400 = h2/h3, precios»). Un suelo global
#           barato evita que cada feature futura (F-09/FAQ) re-declare Gilda Display en cada heading.
#           Hoy hay DOS `<h2>` en `dist` (home.tsx:75,80: «Servicios», «Contacto») y CERO `<h3>` [V]:
#           el `<h2>` se verifica EN VIVO YA; el `<h3>` se asevera por LECTURA del SCSS (@s2) y se
#           verifica en vivo el día que exista uno (F-09/FAQ) — línea de F-05 A-28.
#           Alternativa descartada (solo h2): YAGNI que contradice el diseño medido y traslada la deuda.
#   · D-2 — ¿Feature nueva, con qué `id` y `mutable`?  → RECOMENDADO: **feature nueva id 21,
#           `mutable: false`** (capa GLOBAL transversal; F-04/F-06/F-07 están `done` y «una feature a la
#           vez» impide colgarla de ellas). Es SCSS puro → `mutable: false` con `nota_mutacion`, EXACTO
#           como F-08 `rejilla_responsive`. `sdd: true`: spec → gherkin → PUERTA → TDD de los tests que
#           LEEN el SCSS → judge → verificación en vivo. El bloque JSON propuesto vive en el borrador §6;
#           lo aplica el `craftsman_lead` SOLO tras el OK.
#   · D-3 — ¿Dónde vive el SCSS?  → RECOMENDADO: **un partial nuevo `src/styles/_tipografia.scss`**,
#           enganchado con `@use 'tipografia'` desde `src/styles/main.scss` (mismo patrón que `_tokens`
#           de F-03 y `_base` de F-04). Ownership limpio: cada feature es dueña de sus ficheros.
#           Alternativa descartada: meterlo en `_base.scss` (es de F-04 `done`; difumina el dueño).
#   · D-4 (menor) — ¿fallback rico o genérico?  → RECOMENDADO: **genérico** (`system-ui, sans-serif`
#           para el body; `serif` para los encabezados). Coherente con la casa (`.heroMarca` usa
#           `'Great Vibes', cursive`, un solo genérico). Descartado el stack serif rico (rompe coherencia).
#   · D-5 (menor) — ¿`body` o `html`?  → RECOMENDADO: **`body`** (objetivo convencional del «font del
#           documento»; `html` ya lleva `scroll-padding-top` de F-04 y no se mezclan dueños). Equivalentes.
#
# =============================================================================================
# ALCANCE EXACTO — dos reglas y nada más, en `src/styles/_tipografia.scss` (@use desde main.scss):
#     body    { font-family: 'Manrope', system-ui, sans-serif; }   ← suelo HEREDABLE, idéntico al
#                                                                     stack de .eyebrow/.cabecera/.pie
#     h2, h3  { font-family: 'Gilda Display', serif; }             ← suelo de TIPO de los encabezados
# Las fuentes están YA horneadas por F-05 (`@fontsource`, 6 woff2 autohospedados, main.tsx:36-41).
# =============================================================================================
# FRONTERAS DURAS — lo que esta feature NO toca (ficheros `done`, una feature a la vez):
#   · El `<h1>` del hero: lo fija F-07 (`.heroMarca` Great Vibes, `.heroStudio` Manrope, en los <span>).
#     El selector `h2, h3` NO matchea `h1`. NO se edita `hero.module.scss` (F-07 `done`) → @s6.
#   · Cabecera, nav y pie: F-06 ya declara su Manrope (`cabecera.module.scss:19,61`). NO se edita
#     (F-06 `done`). Sus declaraciones explícitas GANAN a la herencia del body (§5 del borrador) → @s7.
#   · Los precios: main.tsx dice «Gilda Display 400 = h2/h3, precios», pero los precios son de F-09
#     (`catalogo_servicios`), con su propia clase. Esta feature NO adelanta precios.
#   · `src/lib/`, tests de lógica, `features/`: intactos.
#
# =============================================================================================
# EL CONTRATO TIENE DOS MITADES (como estrenó F-07):
#   (A) Se ASEVERA leyendo el SCSS — nuevo test `src/styles/tipografia-global.test.ts` (readFileSync +
#       regex; ruta y literales A MANO, anti-tautología), patrón calcado de `cascara-global.test.ts`
#       y `hero-estilos.test.ts`. Stryker NO ve SCSS y `src/styles/` NO está en `mutate` (como F-03/
#       F-04/F-08) → aquí el mutante es HUMANO y su defensa es este test + la puerta de aprobación.
#       Este test unitario implementa EXCLUSIVAMENTE @s1..@s7 (SIN jsdom, SIN navegador).
#   (B) Se RE-VERIFICA EN VIVO con Chrome — tras el TDD, sobre `dist/` servido (build SSG real + CDP),
#       NUNCA jsdom (extensión aportada por el humano, misma fase que F-07). El `font-family` COMPUTADO
#       del cuerpo y de un `<h2>` reales; que Gilda Display se descargue por PRIMERA VEZ porque ninguna
#       regla de USO la referencia todavía: `grep -E "font-family:[^;]*Gilda Display" src/styles
#       src/components src/pages` = 0 hoy [V, verificado en esta ronda]. → @s8..@s9. [NV].
#       ⚠️ MATIZ (reparación G1): «Gilda Display» SÍ aparece en `src/` (~14 aciertos [V]) — pero son el
#          registro `@font-face`/allowlist de la PUERTA DE TERCEROS de F-05 (`puerta-terceros.ts:33,61`,
#          `PARES_DE_FUENTE_ESPERADOS`), fixtures de su test y el comentario de `main.tsx:22`; NINGUNO es
#          un `font-family` de USO. Por eso el navegador aún no la descargaba (main.tsx:33-34).
#       🔴 PROHIBIDO fingir con jsdom que la fuente «está pintada»: jsdom no carga @font-face, no
#          descarga fuentes ni pinta [V]. Es el eje [NV], mismo estatuto que el número LCP de F-07 (C-2).
#
# =============================================================================================
# ANTI-TAUTOLOGÍA (regla dura): TODO nombre de fuente esperado se escribe A MANO en el test
# («'Manrope'», «'Gilda Display'», y la allowlist {Manrope, Gilda Display, Great Vibes}). JAMÁS se
# importa de site.ts, de main.tsx ni de ningún símbolo para compararse contra sí mismo (patrón
# `doble-de-test-anclado-al-literal-no-al-simbolo`; como el `820px` de F-06 @s17 y el `'Great Vibes'`
# de F-07 @s17). NOMBRE es entrada legítima de la derivación de F-07; aquí NO hay derivación: son
# literales de estilo → van A MANO, punto.
# =============================================================================================

Feature: Tipografía global del documento — el cuerpo en Manrope y los encabezados de sección en Gilda Display, con las fuentes ya horneadas por F-05, sin introducir ninguna fuente no autohospedada
  Como responsable del proyecto quiero que el texto del documento deje de caer en la serif por
  defecto del navegador (Times New Roman) y respete el sistema tipográfico MEDIDO del prototipo:
  el cuerpo en Manrope (suelo heredable, idéntico al stack de la cabecera y el eyebrow) y los
  encabezados de sección h2/h3 en Gilda Display, declarados en un partial global nuevo
  `_tipografia.scss` enganchado desde `main.scss`, usando SOLO fuentes ya autohospedadas por F-05
  (cero peticiones a terceros); sin tocar el <h1> del hero (F-07), ni la cabecera/nav/pie (F-06),
  ni los precios (F-09); asegurando que ningún selector se queda sin fuente y que el navegador REAL
  pinta de verdad Manrope y Gilda Display, verificado en vivo con Chrome tras el TDD.

  # ---------------------------------------------------------------------------
  # (A) Se ASEVERA leyendo el SCSS — Stryker no ve SCSS. Test `src/styles/tipografia-global.test.ts`.
  # 🔴 BLINDAJE (reparación menor): este test unitario implementa SOLO @s1..@s7 con readFileSync +
  # regex sobre el TEXTO del SCSS. jsdom NO interviene aquí. @s8/@s9 (`@verificacion-viva`) NUNCA se
  # ejecutan bajo este test ni bajo jsdom: van por Chrome real/CDP sobre `dist/` (ver bloque (B)).
  # ---------------------------------------------------------------------------

  @s1
  Scenario: la regla `body` del partial declara `font-family` con el stack de Manrope — suelo heredable del cuerpo
    Given el partial nuevo "src/styles/_tipografia.scss" con la regla del selector "body"
    When un test lee la declaración "font-family" de la regla "body"
    Then la declaración es exactamente "'Manrope', system-ui, sans-serif" (la fuente de cuerpo escrita A MANO, seguida del genérico "system-ui" y el genérico de familia "sans-serif")
    And el stack esperado "'Manrope', system-ui, sans-serif" se escribe A MANO como literal en el test, elegido para COINCIDIR con el stack de la casa (el de ".eyebrow", ".cabecera" y ".pie"), pero el test NO lee "hero.module.scss" ni "cabecera.module.scss" para aseverarlo: son ficheros `done` ajenos y leerlos acoplaría esta feature a ellos
    And el nombre esperado "'Manrope'" se escribe A MANO en el test, NO se importa de main.tsx ni de ningún símbolo (anti-tautología)
    # 🔴 D-4/D-5 (RECOMENDADOS: fallback genérico, selector `body`). Es el suelo HEREDABLE del documento:
    # el `body` fija la fuente que TODO descendiente sin `font-family` propia hereda. Regex del test
    # (spec §3.1.1): /font-family\s*:\s*['"]Manrope['"]\s*,\s*system-ui\s*,\s*sans-serif/. Arregla la
    # deuda de F-07: hoy el cuerpo cae en Times New Roman porque `grep font-family src/styles` = 0 [V].

  @s2
  Scenario: la regla CONJUNTA `h2, h3` del partial declara `font-family` con el stack de Gilda Display — suelo de tipo de los encabezados de sección
    Given el partial "src/styles/_tipografia.scss" con UNA sola regla cuyo encabezado (lista de selectores) es exactamente "h2, h3"
    When un test lee la declaración "font-family" de esa regla conjunta
    Then la declaración es exactamente "'Gilda Display', serif" (la fuente de encabezado escrita A MANO, seguida del genérico de familia "serif")
    And es UNA regla conjunta cuya lista de selectores nombra AMBOS tipos, "h2" y "h3" (D-1 RECOMENDADO: h2 Y h3, el diseño medido en main.tsx:22) — NO dos reglas `h2 {…}` y `h3 {…}` por separado
    And el nombre esperado "'Gilda Display'" se escribe A MANO en el test, NO se importa de ningún símbolo (anti-tautología)
    # 🔴 D-1 (RECOMENDADO: h2 Y h3). Regex del test (spec §3.1.2): /font-family\s*:\s*['"]Gilda Display['"]\s*,\s*serif/.
    # 🔴 UNIFICACIÓN (reparación G2): el contrato exige la regla CONJUNTA `h2, h3` (una sola regla, dos
    # selectores en la lista), NO admite dos reglas separadas. Es el diseño y lo más simple de aseverar:
    # @s4 busca el bloque cuyo encabezado es literalmente `h2, h3` y @s6 lee «esa regla» en singular —
    # las tres coinciden en la MISMA forma. Regla separada `h3 {…}` → @s4 no la encuentra → rojo.
    # 🔴 CASO LÍMITE (spec §4.1): HOY hay DOS `<h2>` en `dist` (home.tsx:75,80) y CERO `<h3>` [V]. El
    # selector `h3` de esa regla conjunta es VÁLIDO y se asevera por LECTURA aunque hoy no haya ningún
    # `<h3>` que pintar; se verifica EN VIVO el día que exista uno (F-09/FAQ). Es la línea de F-05 A-28
    # («latin-ext entrará el día que exista un nombre real que lo exija»).

  @s3
  Scenario: el partial está ENGANCHADO al punto de entrada de los estilos — `main.scss` lo importa con `@use 'tipografia'`
    Given el punto de entrada de los estilos globales "src/styles/main.scss"
    When un test lee sus directivas "@use"
    Then existe una directiva "@use 'tipografia'" que engancha el partial nuevo
    # 🔴 ANTI-VACUIDAD (spec §3.1.3), misma guarda que `cascara-global.test.ts` @s11. SIN ESTO el partial
    # cumpliría @s1/@s2 y NO LLEGARÍA AL SITIO: un `_tipografia.scss` perfecto que nadie importa es el
    # VERDE POR VACUIDAD de esta feature (el cuerpo seguiría en Times New Roman). El test lee `main.scss`
    # y afirma el `@use`, como el `@use 'base'` que ya vigila F-04.

  @s4
  Scenario Outline: ninguno de los dos selectores se queda SIN `font-family` — la AUSENCIA fue el fallo real cazado en vivo en F-07
    Given el partial "src/styles/_tipografia.scss" con la regla del selector "<selector>"
    When un test comprueba si esa regla NOMBRA su propia "font-family"
    Then la regla del selector "<selector>" declara una "font-family" (no se queda sin ella heredando la serif por defecto del UA)

    Examples:
      | selector |
      | body     |
      | h2, h3   |

    # 🔴 ANTI-VACUIDAD (spec §3.1.4), MISMA guarda que F-07 @s17: la AUSENCIA de `font-family` fue el
    # fallo EXACTO que la verificación en vivo cazó en F-07 («Nails Lash» salió en Times New Roman porque
    # `.heroMarca` NO declaraba `font-family` y HEREDABA la del cuerpo). Aquí es el mismo riesgo un nivel
    # arriba: si `body` o `h2, h3` se quedaran sin `font-family`, el texto caería en la serif del UA en
    # SILENCIO, verde en @s3 y roto en pantalla. Regex mínima del test: /font-family\s*:/ sobre cada regla.

  @s5
  Scenario: cero fuentes no autohospedadas — toda familia entrecomillada del partial está en la allowlist de familias YA horneadas por F-05, y no hay `@import` ni `@font-face` nuevos
    Given el partial "src/styles/_tipografia.scss", la allowlist de familias ya horneadas por F-05 escrita A MANO en el test: {'Manrope', 'Gilda Display', 'Great Vibes'}, y la lista A MANO de genéricos CSS admitidos: {system-ui, sans-serif, serif, cursive}
    When un test extrae toda familia CON COMILLAS y todo identificador SIN comillas de cada declaración "font-family" del partial, y busca directivas "@import" y bloques "@font-face"
    Then toda familia entrecomillada del partial ("Manrope", "Gilda Display") pertenece a la allowlist {Manrope, Gilda Display, Great Vibes}
    And el partial NO contiene NINGUNA familia entrecomillada fuera de esa allowlist (ni "Cormorant Garamond", ni "Playfair Display", ni ninguna otra no horneada)
    And el ÚNICO identificador SIN comillas admitido en cualquier declaración "font-family" del partial es un genérico de {system-ui, sans-serif, serif, cursive}; CUALQUIER otro identificador desnudo (p. ej. "Georgia", o una familia de una sola palabra sin comillas como "Cormorant") se RECHAZA — de lo contrario una familia no horneada escrita sin comillas escaparía a la comprobación de familias entrecomilladas
    And el partial NO contiene ninguna directiva "@import" ni ningún bloque "@font-face" (no introduce fuentes ni orígenes nuevos)
    # 🔴 GUARDA DE CERO-TERCEROS (spec §3.1.5) — PROTEGE EL INVARIANTE DE F-05. Referenciar una familia
    # NO horneada caería al fallback EN SILENCIO (main.tsx:18-19: un 'Manrope Variable' mal escrito no
    # carga y cae al fallback sin ningún error) → esta guarda lo CAZA en el test, antes de llegar a
    # `dist`. La allowlist va A MANO (anti-tautología): son las tres familias de F-05 (main.tsx:36-41).
    # 🔴 VECTOR SIN COMILLAS (reparación menor): CSS admite familias sin comillas (`font-family: Georgia`).
    # Comprobar solo las entrecomilladas dejaría escapar una familia no horneada de UNA palabra escrita
    # desnuda. Por eso el test exige que el ÚNICO identificador sin comillas admitido sea un genérico de
    # {system-ui, sans-serif, serif, cursive}; cualquier otro identificador desnudo es rojo.
    # 🔴 CASO LÍMITE / ERROR (spec §4.3): una familia mal escrita o no horneada NO produce error de build
    # —cae al genérico en silencio—; ESTE es el escenario que la convierte en rojo de test. Un
    # `@import`/`@font-face` nuevo sería el único vector para meter un tercero: prohibido aquí y cazado
    # además por la puerta de terceros de F-05 en el build (@s9). Coherente con `puerta-terceros`.

  @s6
  Scenario: el selector de encabezados es EXACTAMENTE `h2, h3` y NO incluye `h1` — el titular del hero (F-07) queda intacto
    Given el partial "src/styles/_tipografia.scss" con su regla de encabezados de sección
    When un test lee la LISTA de selectores de esa regla
    Then la lista de selectores contiene "h2" y "h3" y NO contiene "h1"
    And el partial NO declara ninguna regla que aplique al elemento "h1" ni a las clases del titular del hero (".heroMarca", ".heroStudio", ".titulo")
    And el partial NO edita ni referencia "src/components/hero.module.scss" (F-07 está `done`: su tipografía de marca la fija @s17 de hero_marca.feature)
    # 🔴 FRONTERA DURA (spec §2 y §5). El `h2, h3` es un selector de TIPO (0,0,1) que NO matchea `h1`:
    # el <h1> del hero conserva Great Vibes/Manrope de F-07 sin que esta feature lo roce. DESLINDE para
    # que nadie «amplíe» el selector a `h1, h2, h3` y pise el titular. Se asevera por LECTURA: la regla
    # nombra h2 y h3, jamás h1. La regresión EN VIVO del hero se re-verifica en @s9.

  @s7
  Scenario: la capa global es un SUELO, no un TECHO — el partial no usa `!important`, así que toda declaración `font-family` propia (cabecera, eyebrow, hero) sigue ganando
    Given el partial "src/styles/_tipografia.scss" con sus reglas "body" y "h2, h3"
    When un test comprueba la fuerza de esas reglas
    Then ninguna declaración "font-family" del partial lleva "!important"
    And el `body` fija su fuente por HERENCIA (la fuerza más débil): cualquier descendiente con "font-family" propia —".eyebrow", ".heroMarca", ".heroStudio" (F-07), ".cabecera", ".pie" (F-06)— la sobrescribe, tenga la especificidad que tenga
    And el selector de tipo "h2, h3" (0,0,1) es derrotado por cualquier CLASE futura (0,1,0), p. ej. la de los precios de F-09
    # 🔴 EL PUNTO QUE PIDIÓ PABLO (spec §5): la dirección de la cascada es SEGURA por construcción. El
    # `body` NO puede derrotar al hero ni al header porque la HERENCIA solo rellena donde NINGUNA regla
    # matchea; el `h2, h3` es el selector más débil tras la herencia. NADA existente se pisa.
    # 🔴 CASO LÍMITE (spec §4.5): un futuro `<h2>` con clase propia (F-09) GANA al selector de tipo `h2`
    # —el global es un SUELO, no un techo—; sin colisión, es exactamente el comportamiento buscado. El
    # `!important` sería la única forma de romper esto: por eso el test PROHÍBE su presencia en el partial.
    # Riesgo residual DECLARADO (no bug): redundancia (body Manrope + cabecera Manrope + eyebrow Manrope);
    # es deliberada —cada feature es dueña de su declaración y no se tocan ficheros `done`—.

  # ---------------------------------------------------------------------------
  # (B) Se RE-VERIFICA EN VIVO con Chrome tras el TDD — sobre `dist/` servido (build SSG real + CDP),
  # NUNCA jsdom. Eje [NV], mismo estatuto que el número LCP de F-07 (C-2). PROHIBIDO fingir con jsdom.
  # Estos escenarios NO son puerta unitaria: son la fase EN VIVO que estrenó F-07.
  # 🔴 BLINDAJE (reparación menor): @s8/@s9 NO viven en `tipografia-global.test.ts` ni en jsdom. jsdom no
  # carga @font-face, no descarga fuentes ni pinta [V]; ejecutarlos ahí sería FINGIR. Van SOLO por Chrome
  # real/CDP sobre `dist/`, tras las cinco puertas verdes.
  # ---------------------------------------------------------------------------

  @s8 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] el navegador PINTA de verdad Manrope en el cuerpo y Gilda Display en un `<h2>`, y descarga por PRIMERA VEZ el woff2 autohospedado de Gilda Display
    Given el `dist/` de producción (build SSG real con las cinco puertas verdes) servido y abierto en Chrome real vía CDP
    When se computa el "font-family" del "document.body" y el de un "<h2>" real de la página, y se consulta "document.fonts"
    Then el "font-family" computado de "document.body" resuelve al stack de Manrope y "document.fonts.check('16px Manrope')" es "true"
    And el "font-family" computado de un "<h2>" real (home.tsx:75,80: «Servicios» / «Contacto») resuelve al stack de Gilda Display y "document.fonts.check('24px Gilda Display')" es "true"
    And la petición del woff2 de Gilda Display va a una ruta "/assets/…" del propio sitio, SIN esquema "http(s)://" y SIN dominio de terceros (es la PRIMERA feature que la referencia con un `font-family` de USO → dispara su descarga por primera vez; hoy "document.fonts" la tiene como "unloaded" porque ninguna regla de USO la nombra: `grep -E "font-family:[^;]*Gilda Display" src/styles src/components src/pages` = 0 [V])
    And los nombres "Manrope" y "Gilda Display" pasados a "document.fonts.check(...)" se escriben A MANO en el script de verificación, NO se importan de ningún símbolo
    # 🔴 EJE [NV] / RE-VERIFICACIÓN EN VIVO (spec §3.2.1-§3.2.3), MISMO estatuto que el `document.fonts.check('142px
    # "Great Vibes"')` de F-07 @s17: que el NAVEGADOR APLIQUE la fuente es NO_VERIFICABLE en test unitario
    # —jsdom no carga @font-face, no descarga fuentes ni pinta [V]—. El fallo de F-07 lo cazó EXACTAMENTE
    # esta fase: «Nails Lash» computaba Times New Roman, no Great Vibes (`verificacion_viva_hero_marca.md`).
    # 🔴 Gilda Display se DESCARGA por primera vez: F-05 hornea el @font-face pero «mientras nada referencie
    # una familia, el navegador no descarga su woff2» (main.tsx:33-34, css-fonts-4 §4.8.1). Esta feature es
    # la PRIMERA que la referencia con un `font-family` de USO → su woff2 pasa de `unloaded` a `loaded`.
    # 🔴 PRECISIÓN DEL GREP (reparación G1): «Gilda Display» SÍ aparece en `src/` (~14 aciertos [V]) — pero
    # todos son el registro `@font-face`/allowlist de la puerta de terceros de F-05 (`puerta-terceros.ts:33,
    # 61`), fixtures de su test y el comentario de `main.tsx:22`; NINGUNO es un `font-family` de USO. El
    # grep que vale es el acotado al USO: `grep -E "font-family:[^;]*Gilda Display" src/styles src/components
    # src/pages` = 0 hoy [V]. Se mide en Chrome real (misma sonda que F-07: `.experimentos-tmp/…/measure-lcp.mjs`), NUNCA con jsdom.

  @s9 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] REGRESIÓN — el hero, la cabecera, los colores y el cero-terceros siguen intactos, y `pnpm build` termina en exit 0 con las cinco puertas
    Given el mismo `dist/` de producción servido y abierto en Chrome real vía CDP
    When se computan las fuentes del hero, de la cabecera/nav/pie, los colores del documento y las peticiones de red, y se ejecuta "pnpm build"
    Then REGRESIÓN F-07: el "<h1>" del hero SIGUE computando "Great Vibes" en «Nails Lash» (.heroMarca) y "Manrope" en «Studio» (.heroStudio) — la fuente del body NO lo derrota (herencia derrotada por declaración propia, @s7)
    And REGRESIÓN F-06: la cabecera, la nav y el pie SIGUEN computando "Manrope" (sus declaraciones explícitas ganan a la herencia del body)
    And REGRESIÓN F-03: NINGÚN color del documento cambia (cambiar "font-family" no toca los ratios de contraste; "puerta-contraste.ts" los recalcula desde "_tokens.scss", que no se edita) — el titular sigue en "--ink" (#8E3355)
    And REGRESIÓN F-05: hay CERO peticiones a orígenes web externos (0 a "googleapis"/"gstatic"); TODA petición de fuente que el navegador SÍ emite es same-origin a una ruta "/assets/…" del propio sitio y responde HTTP 200 — se descargan SOLO los pesos realmente USADOS (Gilda Display 400 y Great Vibes 400 y Manrope; un peso horneado que NINGUNA regla usada invoque —p. ej. Manrope 500/600— puede NO descargarse, y no descargarlo NO es un fallo)
    And "pnpm build" termina en código de salida 0 con las CINCO puertas verdes (placeholders · contraste · terceros · anclas · cascarón anti-404): esta feature NO añade puerta de build propia (es SCSS)
    # 🔴 REGRESIÓN EN VIVO (spec §3.2.3-§3.2.6). Esta feature toca un suelo GLOBAL: hay que demostrar que
    # no derriba nada de lo `done`. El hero (@s7: su `font-family` propia gana a la herencia del body), la
    # cabecera (F-06, ídem), el contraste (F-03: `font-family` no interviene en el cálculo de color → riesgo
    # nulo, se re-verifica igual) y el cero-terceros (F-05: un `font-family` a secas NO genera petición
    # externa; solo dispara el woff2 YA autohospedado de Gilda Display, @s8). Es la fase que F-07 midió con
    # la extensión de Chrome del humano + CDP headless, coincidiendo las dos; se repite aquí. [NV] hasta el
    # primer `pnpm build` real de esta feature (I-8: el primer build MANDA sobre lo escrito).
