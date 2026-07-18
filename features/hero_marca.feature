# Contrato de la feature 7 (`hero_marca`) de feature_list.json.
# Destilado de project-spec.md → «### Feature 7: hero_marca — el h1 real, el paintReveal de estado
# base visible, y el LCP que NO es puerta unitaria».
#
# =============================================================================================
# ✅✅ APROBADO POR LA PUERTA HUMANA EL 2026-07-18. EL `tdd_craftsman` QUEDA LIBERADO PARA IMPLEMENTAR. ✅✅
#    Las CINCO preguntas que fueron a la puerta con la propuesta del lead están CERRADAS por el humano
#    (precedente F-05/F-06, A-23 redux). El lead PROPONÍA; el humano DECIDIÓ. Las cinco decisiones,
#    LITERALES, tal como las cerró la puerta:
#      · ✅ C-3 (decisión de producto) — ACORTAR la animación del hero a ≤1,2s TOTAL (delay + duración),
#                leído del SCSS, para un LCP bueno. El estado base visible protege el REPOSO pero NO
#                acorta el reveal (medido con Chrome/CDP); el prototipo tardaba ~5,3s. → @s4 deja de estar
#                pendiente: el límite es ≤1,2s.
#      · ✅ C-1 — RETIRAR el acceptance 6 original (IntersectionObserver): NO hay observer en el hero. Es
#                above-the-fold; el observer es el patrón B de F-08+ (`grep -rin IntersectionObserver
#                src/` = 0 [V]). → Cubierto NEGATIVAMENTE por @s5 (visible sin JS).
#      · ✅ C-2 — SEPARAR el LCP en DOS ejes: (a) TESTEABLE por test unitario = el CSS estático (base
#                visible, sin opacity:0/clip-path/animation ocultante) + la duración ≤1,2s (@s1/@s2/@s4/@s5);
#                (b) [NV] / VERIFICACIÓN EN VIVO CON CHROME tras el TDD = el NÚMERO LCP real y si el
#                clip-path deja el titular fuera del LCP. PROHIBIDO fingir medir el LCP con jsdom.
#      · ✅ C-5 — El indicador «desliza» (`bob`) se APLAZA a F-08 (depende de que haya scroll; hoy no lo
#                hay). → @s14 deja de estar pendiente: se APLAZA A F-08 y el `tdd_craftsman` NO lo implementa en
#                F-07 (se conserva por trazabilidad, sin renumerar). Si algún día se hornea, su duración
#                total ≤5s (no basta quitar `infinite`).
#      · ✅ C-7 — El EYEBROW deja SOLO su ESTRUCTURA (`<p>`) en F-07; el CONTENIDO de categorías es F-09
#                (nunca hardcodear «Facial»). → @s10 fija la estructura; el contenido, aplazado a F-09.
#
# =============================================================================================
# DECIDIDO Y DECLARADO por el lead (medido o criterio de proyecto) — NO va a la puerta, pero el
# `.feature` lo destila porque el humano puede REVOCARLO en la aprobación:
#   · C-4 — `prefers-reduced-motion` es CRITERIO DE PROYECTO, NO obligación WCAG A/AA. Redacción FIJA
#           (@s3): «Por CRITERIO DE PROYECTO, bajo @media (prefers-reduced-motion: reduce) el hero se
#           presenta en su estado final visible y legible sin movimiento residual». PROHIBIDO «WCAG
#           obliga» o «obligatorio» a secas (todo «obligatorio» se lee «obligatorio PARA <quién>»).
#   · El hero es UN h1 con DOS `<span>` + un text node `{' '}` REAL entre ellos (nombre accesible
#     «Nails Lash Studio», 17 car., MEDIDO en los dos motores) — @s6/@s7/@s8.
#   · La marca/tipo se DERIVAN de NOMBRE (`src/lib/site.ts:13`) por `lastIndexOf(' ')` con guarda —
#     @s12/@s13. Es la ÚNICA lógica mutable de F-07 (@s15).
#   · El titular usa `--ink`, NUNCA `--accent`/`--brush` como texto — @s9.
#   · El hero NO se envuelve en `<section>` (no activa la puerta de anclas de F-06) — @s11.
#   · El `brush.png` se APLAZA fuera de F-07 (el `paintReveal` es CSS PURO, cero asset). Si algún día
#     se quiere: SVG inline, NUNCA PNG. Ver «LO QUE F-07 NO CONSTRUYE».
#   · C-8 (deuda declarada): el `dist` preloadea 12 fuentes con `type="font/woff2"` incluso los 6
#     `.woff` → «preload de todo = preload de nada», que puede dañar el LCP. Es territorio F-05/F-20;
#     queda ANOTADO, F-07 NO lo toca.
#   · `Hero.tsx` + la derivación pura se añaden A MANO a la lista `mutate` de `stryker.config.json`
#     (lista explícita, SIN glob → riesgo de verde-por-vacuidad si falta). `coverage.include` de
#     `vitest.config.ts` YA los cubre por glob desde F-06 (`vitest.config.ts:15` =
#     `['src/lib/**/*.ts', 'src/components/**/*.tsx']`, MEDIDO [V]) → NO hay que tocarlo.
#
# =============================================================================================
# FUENTE DE VERDAD DE LOS HECHOS: `progress/f07_verificacion_previa.md`
# =============================================================================================
# Workflow adversarial (~1,1 M tokens; 8 afirmaciones × verificar+refutar; 3 agentes de medición
# sobre BUILD SSG REAL + motor Chrome vía CDP): 0 refutadas de raíz, 6 MATIZADAS, 1 CONFIRMADA por vía
# adversarial (A1: el `bob infinite` incumple SC 2.2.2), 1 con un punto NO_VERIFICABLE clave (A2: el
# clip-path vs LCP). Donde `feature_list.json` §7, el troceado de `docs/research/00-fase0-informe.md`
# o esta destilación contradigan a esa verificación, **MANDA LA VERIFICACIÓN**. Se contradicen en CINCO
# puntos: el acceptance 6 (observer, NO aplica → C-1), la mezcla ≤1,2s/≤2,5s del acceptance 5 (→ C-2),
# la duración de la animación del acceptance 4/5 (→ C-3), el alcance del `bob` (→ C-5) y el contenido
# del eyebrow (→ C-7). Es el patrón de F-04/F-05/F-06 por CUARTA vez: *la decisión de fondo —un hero
# con h1 real y un reveal que no rompe SSG ni accesibilidad— es correcta; el «cómo» del troceado
# arrastra un acceptance que no aplica, una mezcla de dos métricas y una duración que retrasa el LCP.*
# **Ninguna decisión de fondo cae.**
#
# NO HUBO CONVERSACIÓN DE SPEC CON EL HUMANO PARA F-07, y ni la spec ni este contrato la simulan. El
# humano DELEGÓ la fase en el `craftsman_lead` HASTA la puerta de aprobación, CELEBRADA Y CERRADA el
# 2026-07-18. Quien hizo de adversario en lugar del humano fue la verificación previa (medición en
# build SSG real + CDP, reproducible en `.experimentos-tmp/f07-a3/` y `.experimentos-tmp/veredictos-f07/`)
# — eso NO sustituyó a la puerta, y por eso HUBO puerta (cerrada el 2026-07-18).
#
# =============================================================================================
# 🔴 EL CORAZÓN: EL ESTADO BASE VISIBLE BAJO SSG (I-4) — sobre el SCSS y el HTML CRUDO de dist/
# =============================================================================================
# El patrón de memoria `animacion/estado-base-visible-ssg-reduced-motion.md` decide el diseño, y su
# patrón A (@keyframes autónomos) APLICA al hero (contenido semántico, casi seguro el LCP; ninguna de
# las 3 exclusiones se cumple [V, A3 §1]). El prototipo hace EXACTAMENTE lo prohibido, MEDIDO (build
# vite-react-ssg 0.9.0 real + Chrome/CDP): pinta el hero INVISIBLE al cargar INCLUSO SIN JS —causa:
# `animation-fill-mode: both` (incluye `backwards`), que durante el `animation-delay` aplica el
# keyframe `0%` oculto [V: CSS Animations L1]; «Studio» en `opacity:0` durante 4,4s— y NO tiene
# `@media (prefers-reduced-motion: reduce)` → quien pide menos movimiento se queda congelado invisible.
# La forma correcta FUNCIONA, MEDIDA (bajo `reduce`, `getAnimations()==0`, el elemento computa su base
# visible `clip-path: inset(0px)`, `opacity: 1`). La forma EXACTA (SCSS module, NUNCA inline como el
# prototipo — el inline no admite base-visible ni `@media`; `.experimentos-tmp/veredictos-f07/A3-estado-base.md §6`):
#   .heroMarca { clip-path: inset(0 0 0 0); animation: paintReveal <DUR> cubic-bezier(.5,0,.25,1) <DELAY> both; }
#   @keyframes paintReveal { 0% { clip-path: inset(0 100% 0 0); } 100% { clip-path: inset(0 0 0 0); } }
#   .heroStudio { opacity: 1; animation: fadeUp <DUR> <DELAY> both; }
#   @keyframes fadeUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
#   @media (prefers-reduced-motion: reduce) { .heroMarca, .heroStudio { animation: none; } }  ← C-4
# <DUR>/<DELAY> los fija C-3 (APROBADO 2026-07-18: ≤1,2s TOTAL delay+duración). El SCSS NO ES MUTABLE (Stryker no ve CSS): lo aseveran los tests
# que LEEN el SCSS (como `tokens.test.ts` de F-03 y el `scroll-padding` de F-06), y su otra defensa es
# la puerta de aprobación humana. NO «arreglar» el delay con `fill-mode: forwards` (salto visible→oculto)
# ni con delay negativo (arranca ya en el oculto) [V, trampas medidas A3 §7].
#
# =============================================================================================
# 🔴 «VERDE ≠ FUNCIONA» (I-8): DOS EJES DEL TEST, y la trampa de jsdom (A3 §2, A5 §1)
# =============================================================================================
#  (a) El HTML PRERENDERIZADO de `dist/` se asevera sobre los BYTES (`readFileSync` + string), NUNCA
#      con jsdom (@s5). Es el fallo central del prototipo: invisible al cargar, incluso sin JS — y
#      jsdom solo ve el estado post-hidratación. F-04 pagó esta lección cara.
#  (b) El nombre accesible se MIDIÓ con `dom-accessibility-api@0.6.3`: jsdom MIENTE sobre `display`
#      (da `""`, no `"inline"`) y fabrica un separador falso. El caso ROBUSTO —text node `{' '}` entre
#      los spans— mide «Nails Lash Studio» (17) en LOS DOS motores; los spans pegados oscilan (16
#      corregido / 17 sesgado). Por eso @s7/@s8 aseveran la ESTRUCTURA (bytes/JSX), no solo el
#      accessible name de jsdom. Ver `.experimentos-tmp/veredictos-f07/A5-h1-hero.md`.
#
# =============================================================================================
# 🔴 EL LCP, DOS EJES (C-2) — uno es puerta unitaria, el otro NO. NO se finge el segundo con jsdom.
# =============================================================================================
#  · EJE TESTEABLE (puerta unitaria): el CSS estático del hero — base sin `opacity:0`/`clip-path`
#    oculto (@s1/@s2), duración acotada ≤ el límite de C-3 (@s4), y el HTML crudo de dist/ con el
#    nombre visible sin JS (@s5).
#  · EJE [NV] / VERIFICACIÓN EN VIVO CON CHROME (declarado, NO es escenario unitario): el NÚMERO LCP
#    real; y SI el `clip-path` deja el titular fuera del LCP. Esto último es NO_VERIFICABLE en fuente
#    primaria [V, A2]: web.dev solo documenta la exclusión de `opacity:0`; la spec de Largest
#    Contentful Paint / Element Timing del W3C mide el texto por su *border box ∩ viewport*, que NO
#    cambia con `clip-path` — la LETRA de la spec más bien REFUTA la equivalencia; Chromium *podría*
#    anular el área vía el clip del property tree, pero depende de si la animación está compositada y
#    del timing → SOLO medible en Chrome real. Vitest+jsdom NO tiene layout ni paint [V]. **F-07
#    estrena una fase de verificación EN VIVO con Chrome (extensión aportada por el humano) TRAS el
#    TDD**: medir el LCP real, el clip-path vs LCP, el hero bajo reduced-motion y el reflow a 320px
#    (donde `clamp(50px,11.5vw,142px)` hace floor en 50px — SC 1.4.10, AA). **PROHIBIDO escribir un
#    número de LCP como una aserción de build unitaria.** El número LCP NO produce modo de error de
#    build (spec, «Modos de error»): es verificación en vivo.
#
# =============================================================================================
# ANTI-TAUTOLOGÍA (regla dura) Y LO PROHIBIDO EN ESTE FICHERO, LOS TESTS Y LOS MENSAJES
# =============================================================================================
# TODO esperado se escribe A MANO: «Nails Lash» / «Studio», el número de la duración (C-3 APROBADO 2026-07-18: ≤1,2s, RE-LEÍDO
# del SCSS definitivo, JAMÁS importado como símbolo para compararse contra sí mismo — patrón
# `doble-de-test-anclado-al-literal-no-al-simbolo`). NOMBRE (`site.ts:13`) es la ENTRADA de la
# derivación (fuente única F-02, legítima de importar); los ESPERADOS de la partición son a mano.
# ❌ PROHIBIDO: atribuir a SC 2.2.2 un umbral de duración distinto de los «cinco segundos» LITERALES ·
#    llamar a `prefers-reduced-motion` obligación WCAG · escribir un número de LCP como aserción de
#    build · llamar «obligatorio» al `@media reduced-motion` sin decir *para el criterio de proyecto* ·
#    pintar el titular con `--accent`/`--brush` como texto (4,05 < 4,5 → puerta de contraste ROJA
#    [V, medido]) · añadir una rama «texto grande 3:1» para colar un rosa (reintroduce el mutante
#    inmortal que F-03 evitó) · hardcodear «Facial» (NO existe en este negocio [V]) · pedir que se
#    mute `.includes` (ese mutador NO existe en Stryker 9.6.1 [V]).
#
# =============================================================================================
# 🔴 LO QUE F-07 NO CONSTRUYE — y el choque con las CINCO puertas `done`, MEDIDO (A8)
# =============================================================================================
#  · NO IntersectionObserver (C-1): el hero es above-the-fold; el observer lo dejaría invisible sin JS.
#  · NO el `brush.png` (aplazado): el `paintReveal` es CSS puro; el PNG solo añade un binario a dist/
#    que alimenta la deuda de binarios de F-01. Candidato a F-17 o a descartar.
#  · NO el eyebrow con contenido de datos (C-7): las categorías son F-09.
#  · CASCARÓN (F-04): `cuantosH1` cuenta etiquetas `<h1>` → los spans dentro siguen siendo 1 h1
#    [medido]; el `<Head>` (title/description/canónica/JSON-LD) queda INTACTO. 🔴 `cuantosH1` NO valida
#    el anidamiento (un `<div>` en el h1 pasaría) → F-07 usa `<span>` en origen (@s6). CONTRASTE (F-03):
#    el par `--ink`/`--bg` YA ESTÁ en `MATRIZ_DE_USO` (`src/lib/puerta-contraste.ts:247`, ratio 7,06)
#    → no tocar `MINIMO_DE_PARES` si el titular usa `--ink` (@s9). TERCEROS (F-05): el hero no introduce
#    origen externo. ANCLAS (F-06): el hero h1+p sin `<section>` no activa la igualdad de conjuntos
#    (@s11). PLACEHOLDERS (F-01): el hero no hornea patrón ni binario. **Todo esto es [NV] hasta el
#    primer `pnpm build` real (I-8): el primer build de F-07 es OBLIGATORIO y MANDA sobre lo escrito.**
# =============================================================================================

Feature: El nombre del salón como un <h1> real, VISIBLE horneado en dist/ y bajo reduced-motion, con un paintReveal de estado base visible que no sabotea el LCP ni incumple SC 2.2.2
  Como responsable del proyecto quiero que el nombre del salón se presente como un <h1> real,
  visible en el HTML prerenderizado sin JavaScript y visible bajo prefers-reduced-motion, con una
  animación de revelado (paintReveal, CSS puro) cuyo estado de reposo sea siempre el estado final
  visible —el estado oculto vive SOLO en el 0% del keyframe—, con un nombre accesible «Nails Lash
  Studio» derivado de la fuente única, sin incumplir SC 2.2.2 (A) ni retrasar el LCP; y que el número
  LCP real quede como verificación EN VIVO con Chrome, no como puerta unitaria fingida con jsdom.

  # ---------------------------------------------------------------------------
  # El estado base visible bajo SSG (I-4) — SOBRE EL SCSS. No es mutable (Stryker no ve SCSS): lo
  # aseveran tests que LEEN el SCSS + la puerta de aprobación humana.
  # ---------------------------------------------------------------------------

  @s1
  Scenario: el estado base del titular en el SCSS es el estado final VISIBLE — sin opacity:0 ni clip-path oculto en la regla del elemento
    Given el SCSS module del hero con las reglas de los elementos del titular ".heroMarca" y ".heroStudio"
    When un test lee esas reglas del elemento (no las de los @keyframes)
    Then la regla base de ".heroMarca" declara "clip-path" con el valor "inset(0 0 0 0)" (recuadro sin desplazamiento = caja completa = visible)
    And la regla base de ".heroStudio" declara "opacity" con el valor "1"
    And ninguna regla base de esos dos elementos declara "opacity: 0" ni un "clip-path" que recorte (p. ej. "inset(0 100% 0 0)")
    # 🔴 CASO LÍMITE 3 + acceptance 1 + la mitad testeable del acceptance 5 (C-2). La base es el estado
    # FINAL visible: si el UA ignora la animación, el texto se ve completo (fallback correcto por
    # diseño). Es lo que F-03 hizo con los tokens y F-06 con el `scroll-padding`: leer el CSS estático
    # y aseverar. MEDIDO [V, A3 §3 caso B]: bajo `reduce`, `animation:none` deja el elemento en esta
    # base visible. El prototipo NO tiene esta base explícita (confía en el default y en `both`, que
    # proyecta el `0%` oculto durante el delay) → por eso se hornea invisible.

  @s2
  Scenario Outline: el estado OCULTO del titular vive SOLO en el 0% del keyframe, jamás en la base
    Given el SCSS module del hero con el keyframe "<keyframe>"
    When un test lee sus fotogramas
    Then el fotograma "0%" declara el estado oculto "<oculto en 0%>"
    And el fotograma "100%" declara el estado final visible "<visible en 100%>"
    And ese estado oculto NO aparece en ninguna regla base de elemento (solo dentro del @keyframes)

    Examples:
      | keyframe    | oculto en 0%                                | visible en 100%          |
      | paintReveal | clip-path: inset(0 100% 0 0)                | clip-path: inset(0 0 0 0) |
      | fadeUp      | opacity: 0                                  | opacity: 1               |

    # 🔴 LA OTRA MITAD de @s1 (acceptance 1). @s1 fija «la base es visible»; ESTE fija «el oculto EXISTE
    # pero ENCERRADO en el 0%». Sin las dos, una implementación que borrara el keyframe entero pasaría
    # @s1 (base visible) sin reveal alguno, y una que metiera el oculto en la base pasaría un @s1 laxo.
    # Los esperados se escriben A MANO; se leen del SCSS, no se importan. Es la lección de I-4: «el
    # estado oculto vive SOLO dentro del ámbito de la animación (el 0% del keyframe)».

  @s3
  Scenario: el SCSS declara @media (prefers-reduced-motion: reduce) { animation: none } para el hero — CRITERIO DE PROYECTO (C-4)
    Given el SCSS module del hero
    When un test lee sus reglas @media
    Then existe una regla "@media (prefers-reduced-motion: reduce)" que aplica "animation: none" a los elementos del titular (".heroMarca" y ".heroStudio")
    And el efecto declarado por el contrato es: bajo esa preferencia el hero se presenta en su estado final visible y legible SIN movimiento residual
    # 🔴 CASO LÍMITE 2 + acceptance 2. C-4, DECIDIDO Y DECLARADO. Redacción FIJA: «Por CRITERIO DE
    # PROYECTO, bajo @media (prefers-reduced-motion: reduce) el hero se presenta en su estado final
    # visible y legible sin movimiento residual». **PROHIBIDO** «WCAG obliga» / «obligatorio» a secas:
    # ningún SC de nivel A/AA obliga a respetar `prefers-reduced-motion` para animación de CARGA [V,
    # A4]; SC 2.2.2 (A) solo aplica a movimiento que «dura más de cinco segundos» (el paintReveal no lo
    # dispara) y su remedio es «un mecanismo para pausar/parar/ocultar», NO nombra reduced-motion; SC
    # 2.3.3 es AAA y solo cubre animación «triggered by interaction»; y reduced-motion NO desactiva nada
    # por sí solo —es un detector, el AUTOR escribe la @media— [V: Media Queries L5]. El prototipo NO la
    # tiene (medido: sin JS y bajo `reduce` se traga 4,8s + 4,4s). El «OBLIGATORIO» del comentario del
    # CSS medido (A3 §6) describe la TÉCNICA DEL PROYECTO, no una cita normativa.

  @s4
  Scenario: la duración total de la animación del hero está ACOTADA ≤ 1,2 s TOTAL (delay + duración), leída del SCSS — límite fijado por C-3 en la puerta 2026-07-18
    Given el SCSS module del hero y el límite de duración total (delay + duración) de 1,2 segundos que fijó C-3 (APROBADO 2026-07-18)
    When un test lee las declaraciones "animation" de ".heroMarca" y ".heroStudio" y suma delay + duración de cada una
    Then la duración total (delay + duración) de cada elemento resuelta a segundos es menor o igual que 1,2 s
    And el test compara contra el límite 1,2 s escrito A MANO (C-3 APROBADO 2026-07-18), no contra un símbolo importado
    # ✅ EL NÚMERO LO FIJÓ LA PUERTA (C-3, APROBADO 2026-07-18): ≤ 1,2 s TOTAL (delay + duración). CASO
    # LÍMITE 8 + la parte testeable del acceptance 5 (el ≤1,2s, que C-2 separa del LCP ≤2,5s). MEDIDO
    # [V, A3 §7]: la base visible NO acorta el reveal para quien acepta movimiento; con delay 0,5s +
    # duración 4,8s el titular-LCP se retrasaba a ~5,3s → POR ESO la puerta ACORTA a ≤1,2s totales
    # (delay ~0,1s + duración ~1s, como recomienda `docs/research/audit-perf.md §3.6`). El
    # `<DUR>`/`<DELAY>` del SCSS los fija ESTA decisión → el número esperado del test (1,2 s) se escribe
    # A MANO, RE-LEÍDO del SCSS definitivo, JAMÁS importado como símbolo. Este eje (la DURACIÓN) SÍ es
    # puerta unitaria; el NÚMERO LCP real NO (C-2, verificación EN VIVO con Chrome).

  @s5
  Scenario: el HTML CRUDO prerenderizado de dist/ muestra el nombre del salón PRESENTE en los bytes y SIN ocultación inline (ni opacity/clip-path ni animation horneados) sin ejecutar JavaScript — readFileSync + string, NUNCA jsdom
    Given el HTML CRUDO prerenderizado de la ruta "/" del artefacto de producción
    When se inspeccionan sus BYTES sin ejecutar JavaScript
    Then el HTML contiene el nombre del salón en el elemento del titular (texto PRESENTE en los bytes)
    And el elemento del titular NO lleva "opacity:0" ni un "clip-path" que recorte HORNEADOS en su estilo inline (el oculto vive solo en el @keyframes de la hoja)
    And el elemento del titular NO lleva un "animation" (ni "animation-name"/"animation-fill-mode"/"animation-*") HORNEADO INLINE — la animación vive en la HOJA (SCSS module), NUNCA inline: un "animation:… both" inline proyecta el 0% oculto durante el delay → invisible al cargar SIN JS (MEDIDO, A3 §2), GANA en especificidad al "@media (reduce){ animation:none }" de @s3 (lo derrota) y esconde su duración del techo de @s4 (que lee la HOJA, no el inline)
    And el nombre está PRESENTE en los bytes y SIN ocultación inline, sin depender de la hidratación ni de ningún IntersectionObserver (readFileSync+string prueba «texto presente + sin ocultación inline», NO que esté «pintado» — eso es el eje [NV]/verificación EN VIVO con Chrome)
    # 🔴 CASO LÍMITE 1 (ESCENARIO OBLIGATORIO) + acceptance 3. Es el fallo CENTRAL del prototipo:
    # invisible al cargar, incluso SIN JS. MECANISMO MEDIDO [V, A3 §2]: el prototipo NO hornea
    # `opacity:0`/`clip-path` recortado inline — hornea `style="animation:paintReveal 4.8s … .5s both"`
    # inline; la invisibilidad al cargar (SIN JS) la produce el `both`/`backwards`, que proyecta el
    # keyframe `0%` oculto durante el `animation-delay` [V: CSS Animations L1, A3 §4]. Por eso el negativo
    # NO basta prohibiendo solo `opacity:0`/`clip-path`: prohíbe TAMBIÉN `animation`/`animation-*`
    # HORNEADO INLINE en el titular — A3 §6/§7 manda que la animación viva en la HOJA (SCSS module),
    # NUNCA inline (el inline no admite base-visible ni @media, GANA en especificidad al
    # `@media(reduce){animation:none}` → derrota @s3, y esconde su duración de @s4 que lee la HOJA). Se
    # asevera sobre los BYTES de `dist/` (readFileSync + aserción de string), NUNCA con jsdom (jsdom solo
    # ve el estado post-hidratación — «Verde ≠ funciona», I-8; F-04 lo pagó caro). readFileSync+string
    # prueba «texto PRESENTE + sin ocultación inline», NO que esté «pintado» (eso es el eje [NV]/Chrome,
    # C-2). La aserción anti-observer es la RED anti-C-1: un IntersectionObserver dejaría el titular
    # invisible sin JS → cubre negativamente el acceptance 6 retirado. [NV] hasta el primer `pnpm build`
    # real de F-07.

  # ---------------------------------------------------------------------------
  # El h1 real — UN h1, dos spans, un text node {' '} REAL. Estructura MEDIDA (A5). Los atributos JSX
  # literales NO los protege Stryker: los aseveran ESTOS tests.
  # ---------------------------------------------------------------------------

  @s6
  Scenario: tras el hero sigue habiendo EXACTAMENTE un <h1>, y sus hijos son <span> (phrasing), nunca <div>
    Given el marcado del hero que reestiliza el <h1>{NOMBRE} que F-04 dejó horneado (src/pages/home.tsx:65)
    When la puerta de cascarón de F-04 cuenta las etiquetas <h1> del artefacto y se inspeccionan los hijos del h1
    Then hay exactamente 1 <h1> en la página (los <span> dentro no añaden headings)
    And los hijos de elemento del <h1> son <span> (phrasing content), NUNCA <div>
    # 🔴 F-07 NO añade otro h1: reestiliza el existente (la puerta de cascarón exige exactamente uno)
    # [V, medido: `cuantosH1` cuenta etiquetas <h1>; spans dentro siguen siendo 1]. 🔴 TRAMPA MEDIDA: el
    # `<div>Studio</div>` del prototipo es INVÁLIDO dentro de un <h1> [V: HTML LS — h1 admite *Phrasing
    # content*; `div` es *Flow content* sin phrasing] y `cuantosH1` NO valida el anidamiento (un `<div>`
    # en el h1 PASA la puerta de F-04) → F-07 usa `<span>` en ORIGEN. La segunda aserción es lo que la
    # puerta de F-04 no vigila y este escenario sí.

  @s7
  Scenario: el nombre accesible del titular es EXACTAMENTE «Nails Lash Studio» (17 car.) — dos <span> con un text node de espacio REAL entre ellos
    Given un hero cuyo <h1> contiene dos <span> —el de la marca y el del sufijo— con un text node de espacio " " (JSX {' '}) ENTRE ellos, ambos derivados de NOMBRE
    When se consulta el encabezado por su rol y se computa su nombre accesible
    Then el nombre accesible es exactamente «Nails Lash Studio» (17 caracteres)
    And entre el </span> de la marca y el <span> del sufijo hay un text node de espacio REAL (no whitespace de salto de línea que JSX borra, ni un espacio DENTRO de un span)
    # 🔴 A5, MEDIDO con `dom-accessibility-api@0.6.3` (el motor de testing-library del repo). El caso
    # ROBUSTO —text node `{' '}` entre los spans— mide 17 en LOS DOS motores (jsdom sesgado y
    # corregido); por eso el diseño se ancla a la ESTRUCTURA, no a la ambigüedad de accname#3. jsdom
    # MIENTE sobre `display` (da `""`, no `"inline"`): la segunda aserción (text node de espacio
    # presente entre los spans) es la anti-frágil, sobre el JSX/bytes. Un espacio DENTRO de un span se
    # `trim()`ea (casos E/E2 de A5 → 16). El esperado «Nails Lash Studio» se escribe A MANO.

  @s8
  Scenario Outline: dos spans SIN text node de espacio entre ellos componen «Nails LashStudio» (16, sin espacio) — DEFECTO que el diseño prohíbe
    Given un hero cuyo <h1> tiene los dos <span> "<separación>"
    When se computa el nombre accesible del encabezado
    Then el nombre accesible NO es «Nails Lash Studio» (le falta el espacio) — es «Nails LashStudio» (16 caracteres)
    And el contrato RECHAZA esta estructura: entre los dos spans DEBE haber un text node de espacio REAL

    Examples:
      | separación                                          | por qué                                                                       |
      | pegados (</span><span>, sin nada entre medias)      | sin separador → «Nails LashStudio» (medido caso A corregido = 16)              |
      | separados solo por whitespace de salto de línea JSX | JSX borra el whitespace con salto → equivale a pegados → «Nails LashStudio»    |

    # 🔴 CASO LÍMITE 5 (el negativo) — el que la MEDICIÓN reveló. La afirmación «nombre accesible Nails
    # Lash Studio» SOLO se cumple con el text node de espacio; el troceado lo OMITÍA. AVISO: la
    # aserción del negativo NO puede descansar en el accessible name de jsdom SIN CORREGIR (para spans
    # pegados jsdom da 17 sesgado / 16 corregido — oscila); el `tdd_craftsman` la mide con el
    # `getComputedStyle` corregido de A5 (span→inline) O la asevera ESTRUCTURALMENTE sobre los bytes
    # (ausencia de text node de espacio entre `</span><span>`). Elige la vía anti-frágil, como en A5.

  @s9
  Scenario: el titular se pinta con --ink, NUNCA con --accent/--brush como texto — la puerta de contraste de F-03 se mantiene verde
    Given el par de colores del titular sobre el fondo
    When la puerta de contraste de F-03 recalcula los ratios de MATRIZ_DE_USO desde el SCSS
    Then el titular usa el token de texto "--ink" sobre "--bg" (par ya presente en MATRIZ_DE_USO, ratio 7,06 ≥ 4,5)
    And NO usa "--accent" ni "--brush" (#C05576) como color de TEXTO del titular
    And no se añade una fila nueva ni se sube MINIMO_DE_PARES por el titular
    # 🔴 CASO LÍMITE 7. PELIGRO MEDIDO [V]: pintar el titular con `--accent`/`--brush` #C05576 como
    # TEXTO da 4,05 < 4,5 → puerta de contraste de F-03 ROJA (build roto). El par `--ink`/`--bg` YA
    # ESTÁ en `src/lib/puerta-contraste.ts:247` («titular sobre el fondo», 7,06) → no hace falta fila
    # nueva. Y NO añadir una rama «texto grande 3:1» para colar un rosa: reintroduce el mutante inmortal
    # que F-03 evitó a propósito. #C05576 sí vale como relleno grande/decorativo, NUNCA como texto.

  @s10
  Scenario: el eyebrow es un <p>, NUNCA un heading; F-07 fija su estructura, no su contenido (C-7 APROBADO 2026-07-18: contenido aplazado a F-09)
    Given un hero con un eyebrow (la línea sobre el titular)
    When se inspecciona el marcado del eyebrow
    Then el eyebrow es un elemento <p> (párrafo), NUNCA un heading (h1…h6)
    And el hero no introduce ningún heading aparte del único <h1> del titular
    And el eyebrow NO contiene el literal «Facial» (no existe en este negocio)
    # ✅ C-7 (APROBADO POR LA PUERTA 2026-07-18): el CONTENIDO del eyebrow se APLAZA a F-09 —las
    # categorías (Uñas · Pestañas · Cejas) son F-09 (pending); `site.ts` no las tiene—. F-07 fija SOLO
    # la ESTRUCTURA: un `<p>`, jamás un heading (un `<h2>` rompería «un h1» y sembraría un heading sin
    # `<section>`). NUNCA hardcodear «Facial» [V]. Este escenario NO fija un texto: destila la estructura.

  @s11
  Scenario: el hero como h1 + p SIN <section> no activa la puerta de anclas de F-06 — deslinde declarado
    Given el HTML CRUDO de la ruta "/" con el hero como un <h1> y un <p>, SIN envolverlo en <section aria-labelledby> y SIN un id suelto que lo haga navegable
    When la puerta de anclas vivas de F-06 deriva las secciones navegables de esa página
    Then la puerta NO deriva ninguna sección navegable a partir del hero
    And la puerta NO emite ninguna violación de «sección inalcanzable» por el hero
    And el build de producción con las CINCO puertas sigue en código de salida 0 por lo que respecta al hero
    # 🔴 CASO LÍMITE 9 [V, medido con `seccionesNavegables`]: el hero h1+p SIN `<section aria-labelledby>`
    # no activa la igualdad de conjuntos de F-06 —ni con un `id` suelto en el h1—. DESLINDE para que
    # nadie «mejore» el marcado envolviéndolo en `<section>`: eso lo haría navegable y F-06 forzaría un
    # `#hero` en la nav (violación de «inalcanzable» hasta que se enlace). No se envuelve.

  # ---------------------------------------------------------------------------
  # La derivación PURA marca/tipo (la ÚNICA lógica mutable de F-07) — en src/lib/. NOMBRE es la
  # ENTRADA (fuente única F-02); los ESPERADOS de la partición se escriben A MANO.
  # ---------------------------------------------------------------------------

  @s12
  Scenario Outline: la marca y el tipo se derivan de NOMBRE por lastIndexOf(' ') — la última palabra es el tipo
    Given el nombre "<nombre>" como entrada de la derivación
    When se parte por el último espacio con lastIndexOf(' ')
    Then la marca es exactamente "<marca>"
    And el tipo es exactamente "<tipo>"

    Examples:
      | nombre            | marca      | tipo   | por qué                                                                    |
      | Nails Lash Studio | Nails Lash | Studio | el dato REAL (site.ts:13): dos espacios → lastIndexOf da el ÚLTIMO (idx 10) |
      | Uno Dos Tres      | Uno Dos    | Tres   | varias palabras: la última va al tipo, el resto a la marca                  |

    # 🔴 LA LÓGICA MUTABLE. `split(' ')` NO sirve (da 3 partes para el nombre real) [V, A5 §3]:
    # `lastIndexOf(' ')` da directamente «Nails Lash» | «Studio». Es un split de PRESENTACIÓN frágil
    # pero suficiente para el dato real (la alternativa limpia —estructurar {marca,tipo} en site.ts—
    # tocaría F-02, fuera de alcance). La fila «Uno Dos Tres» DISTINGUE `lastIndexOf` de `indexOf` (con
    # `indexOf` la marca saldría «Uno» y el tipo «Dos Tres») y `slice(corte+1)` de `slice(corte)`. Los
    # esperados se escriben A MANO; NOMBRE se importa solo como ENTRADA.

  @s13
  Scenario: un NOMBRE sin espacio NO compone «Nails LashStudio» ni indexa con -1 — la guarda corte < 0
    Given un nombre de UNA sola palabra "Estudio" (sin ningún espacio) como entrada de la derivación
    When se parte por el último espacio y lastIndexOf(' ') devuelve -1
    Then la guarda corte < 0 aplica: la marca es el nombre completo "Estudio" y el tipo es la cadena vacía ""
    And la derivación NO indexa con -1 (no produce "Estudi" con slice(0,-1))
    And la derivación NUNCA compone un nombre pegado tipo «Nails LashStudio»
    # 🔴 CASO LÍMITE 4 — el que mata el split de presentación frágil. `lastIndexOf(' ')` → -1 para una
    # sola palabra; sin la guarda, `slice(0,-1)` recorta el último carácter y `slice(-1+1)=slice(0)`
    # duplica. La guarda `corte < 0` degrada a un solo `<span>` (sufijo vacío), FALLA CERRADA, jamás un
    # nombre accesible corrupto. Es un input SINTÉTICO («Estudio»): el dato real siempre tiene espacio,
    # pero la guarda es lógica que Stryker muta (@s15). 🔴 OJO (MEDIDO [V, node]): con corte = -1 este
    # escenario NO distingue `corte < 0` de `corte <= 0` (-1<0 y -1<=0 son ambos TRUE, misma salida);
    # esa frontera la cubre @s16 (corte===0). @s13 mata la NEGACIÓN/forzado de la guarda (@s15 fila 4),
    # NO el cambio de operador `<→<=` (@s15 fila 5, que muere en @s16).

  @s16
  Scenario: un NOMBRE que EMPIEZA por espacio (corte===0) parte por ese primer y único espacio — la partición que distingue la guarda `corte < 0` de `corte <= 0`
    Given un nombre SINTÉTICO que empieza por un espacio y no tiene ningún otro: la cadena de siete caracteres formada por un espacio inicial seguido de "Studio", como entrada de la derivación
    When se parte por el último espacio y lastIndexOf(' ') devuelve 0 (corte === 0)
    Then la guarda real "corte < 0" es FALSE (0 < 0), así que NO degrada por la guarda: la marca es exactamente la cadena vacía "" y el tipo es exactamente "Studio"
    And este es el ÚNICO input que distingue "corte < 0" de "corte <= 0": con la guarda mutada a "corte <= 0" la guarda sería TRUE (0 <= 0) y daría marca = " Studio" (con el espacio inicial) y tipo = "" — resultado DISTINTO → este escenario MATA ese mutante, que @s13 (corte = -1) NO mata
    # 🔴 LA PARTICIÓN corte===0, añadida tras MEDICIÓN [V, node]: con las entradas de @s12/@s13
    # (corte 10, 7 y -1) el mutante `corte < 0 → corte <= 0` (EqualityOperator de Stryker 9.6.1)
    # SOBREVIVE (idéntica salida en las tres); SOLO corte===0 lo distingue. Input SINTÉTICO (el dato
    # real, site.ts:13, NUNCA empieza por espacio), como «Estudio» en @s13. El espacio inicial NO cabe
    # en una tabla de Examples (Gherkin RECORTA las celdas), por eso es un Scenario en prosa y no una
    # fila de @s12. Los esperados (marca="", tipo="Studio") se escriben A MANO. Es el «dónde muere»
    # REAL de @s15 fila 5 (NO @s13, cuya afirmación previa era FALSA). El nombre pegado corrupto sigue
    # descartado: marca="" + tipo="Studio" compone «Studio», no «Nails LashStudio».

  # ---------------------------------------------------------------------------
  # Los mutantes que deben morir (I-6, umbral 1.0). El conjunto exacto se MIDE cuando el fichero exista.
  # ---------------------------------------------------------------------------

  @s15
  Scenario Outline: mutar la derivación de NOMBRE rompe al menos un test
    Given la implementación de la derivación pura marca/tipo en src/lib/
    When se aplica la mutación "<mutación>"
    Then al menos un test pasa de verde a rojo

    Examples:
      | mutación                                                                          | dónde muere                                                                            |
      | sustituir el literal de espacio por cadena vacía en lastIndexOf (StringLiteral ' ' → '') | @s12 («Nails Lash Studio».lastIndexOf('') = 17 → marca = nombre completo, ≠ «Nails Lash») |
      | alterar el índice del sufijo (slice(corte + 1) → slice(corte) o slice(corte - 1))  | @s12 (el tipo deja de ser «Studio»/«Tres»)                                             |
      | alterar el corte de la marca (slice(0, corte) → slice(0, corte - 1) u otro)        | @s12 (la marca deja de ser «Nails Lash»)                                               |
      | negar o forzar la guarda del predicado corte < 0                                  | @s13 (el nombre sin espacio se compone mal)                                            |
      | alterar el operador de la guarda (EqualityOperator corte < 0 → corte <= 0)         | @s16 (corte===0, « Studio»: la guarda real da marca=«», tipo=«Studio»; con <= daría marca=« Studio», tipo=«») — @s13 (corte=-1) NO lo mata |

    # 🔴 EL CONJUNTO EXACTO DE MUTANTES **NO SE PUEDE PREDECIR**: el fichero de F-07 NO EXISTE todavía;
    # otra implementación tendrá otro conjunto. **SE MIDE CUANDO EXISTA, NO ANTES** (la lección de F-05
    # con «exactamente dos equivalentes» sería una PREDICCIÓN, no una medición). Los sabotajes de esta
    # tabla mapean a mutadores REALES de Stryker 9.6.1 (StringLiteral ' '→'', EqualityOperator <→<=,
    # ArithmeticOperator ±1, negación de condicional/booleano); el CONJUNTO COMPLETO se nombra al medir.
    # PROHIBIDO nombrar mutadores FANTASMA: ni `.includes` ni `lastIndexOf→indexOf` existen en Stryker
    # 9.6.1 [V, MEDIDO: 0 hits en los ficheros de mutadores; el method-expression-mutator no los mapea].
    # Si un mutante RESISTE, el
    # `tdd_craftsman` ESCALA AL HUMANO —NO lo excluye, NO baja el umbral, NO lo declara equivalente por
    # su cuenta— (umbral 1.0, 0 exclusiones). Cubre el acceptance «mutar la composición rompe un test».
    # 🔴 SOLO la DERIVACIÓN es mutable: el SCSS (@s1..@s4) NO lo ve Stryker, y los atributos/estructura
    # JSX del h1/eyebrow (@s5..@s11) son LITERALES que NO generan mutantes → los aseveran los tests, no
    # Stryker. `Hero.tsx` + la derivación se añaden A MANO a `mutate` de `stryker.config.json` (lista
    # explícita, SIN glob → riesgo de verde-por-vacuidad si falta). `coverage.include` de
    # `vitest.config.ts` YA los cubre por glob desde F-06 (`vitest.config.ts:15` incluye
    # `src/components/**/*.tsx` y `src/lib/**/*.ts`, MEDIDO [V]) → NO hay que tocarlo.

  # ---------------------------------------------------------------------------
  # @s14 — El indicador «desliza» (bob). APLAZADO A F-08 POR LA PUERTA (C-5, APROBADO 2026-07-18): el
  # bob depende de que haya scroll y hoy NO lo hay. El `tdd_craftsman` NO lo implementa en F-07. Se
  # CONSERVA este escenario como contrato de trazabilidad para F-08 (NO se renumeran los demás: es un
  # hueco documentado, mismo precedente con el que F-05 dejó escenarios). Si algún día se hornea, la
  # exigencia ya queda escrita aquí: iteración FINITA Y duración total ≤ 5 s (no basta quitar «infinite»).
  # ---------------------------------------------------------------------------

  @s14 @aplazado-f08
  Scenario: [APLAZADO A F-08 — el `tdd_craftsman` NO lo implementa en F-07] si algún día se hornea el indicador «desliza», su movimiento total dura ≤ CINCO segundos — iteración FINITA Y duración total (count × duración por iteración) acotada, NO solo «≠ infinite» (SC 2.2.2, nivel A)
    Given el SCSS del indicador «desliza» del hero, EN EL SUPUESTO de que F-08 lo hornee (C-5 lo APLAZÓ a F-08 el 2026-07-18; F-07 NO lo hornea)
    When un test lee su "animation-iteration-count" y la duración por iteración de su "animation", y calcula la duración TOTAL del movimiento (iteration-count × duración por iteración) resuelta a segundos
    Then (TÉCNICA) el número de iteraciones es FINITO — NO "infinite"
    And (LETRA, la propiedad normativa de SC 2.2.2) la duración TOTAL del movimiento (iteration-count × duración por iteración) es menor o igual que CINCO segundos — espejo de cómo @s4 suma delay + duración, aquí el «5» es el LITERAL de la norma
    And un iteration-count finito NO basta por sí solo: "iteration-count: 3" sobre "bob 2,4s" = 7,2 s es FINITO y SIGUE incumpliendo (> 5 s); por eso el test mide la DURACIÓN, no solo la finitud
    And con "infinite" —o con cualquier duración total > 5 s— el movimiento arrancaría automático y en paralelo con el resto del hero → incumpliría SC 2.2.2 (A)
    # ✅ C-5 (APROBADO POR LA PUERTA 2026-07-18: APLAZADO A F-08). CASO LÍMITE 6 + acceptance 4. A1, CONFIRMADO por vía adversarial: el
    # `bob 2.4s ease-in-out infinite` del prototipo cumple las TRES condiciones del bullet «Moving,
    # blinking, scrolling» de SC 2.2.2 (A) [V: w3.org/TR/WCAG22/]: (1) arranca automático, (2) `infinite`
    # → dura > 5s, (3) va en paralelo; no es esencial y no tiene mecanismo de pausa → incumplimiento
    # limpio de nivel A. 🔴 SEPARA LETRA de TÉCNICA (hallazgo GRAVE corregido): la LETRA normativa es la
    # DURACIÓN («lasts more than five seconds»), NO la finitud. Quitar `infinite` es NECESARIO pero NO
    # suficiente: `iteration-count: 3` sobre `bob 2,4s` = 7,2s es FINITO y > 5s → SIGUE incumpliendo. Por
    # eso el Then asevera la DURACIÓN TOTAL (count × duración por iteración) ≤ 5s —espejo exacto de cómo
    # @s4 suma delay+duración— o exigiría un mecanismo real de pausa/parada; NO basta con `≠ "infinite"`.
    # El `<button>↺ Repetir` del prototipo es control de REPETICIÓN, NO de parada. 🔴 El `paintReveal`
    # (4,8s < 5s) NO dispara 2.2.2 [V]: el único gancho de nivel A es el `bob` infinito. **PROHIBIDO**
    # atribuir a SC 2.2.2 un umbral distinto de los «cinco segundos» LITERALES (aquí el «5» es ESE
    # literal WCAG, no un número horneado de C-3). DECISIÓN DE LA PUERTA (C-5, APROBADO 2026-07-18):
    # APLAZADO A F-08 (que sí introduce scroll; hoy no lo hay) → este escenario NO se implementa en F-07;
    # se conserva por trazabilidad para F-08. Si algún día se hornea, la exigencia queda fijada aquí:
    # iteración FINITA Y duración total ≤ 5s (no basta quitar «infinite»). Higiene: `docs/research/audit-a11y.md:386`
    # dice «para cumplir SC 2.2.2 en AA» — 2.2.2 es nivel A, no AA (error de nivel en ESE doc, no en el troceado).
