# Contrato de la feature 6 (`header_nav_footer`) de feature_list.json.
# Destilado de project-spec.md → «### Feature 6: header_nav_footer — la cabecera, la nav completa,
# el pie, y la PUERTA DE ANCLAS VIVAS que hoy no existe».
#
# =============================================================================================
# ✅✅ **APROBADO POR LA PUERTA HUMANA EL 2026-07-17. B-1..B-7 CERRADAS POR EL HUMANO.** ✅✅
# ✅✅ **AMPLIACIÓN APROBADA POR LA PUERTA HUMANA EL 2026-07-18** (tras la escalada de la prueba de
#    mutación sobre los ficheros ya implementados: 135/156 = 86,54 %, 21 supervivientes REALES
#    verificados por SABOTAJE MANUAL contra la suite completa — `progress/mutation_header_nav_footer.md`
#    §3/§4). Precedente EXACTO de F-01 (la fila `600 123 456` de @s5) y F-05 (+3 escenarios): **la
#    mutación no encontró código de más, encontró CONTRATO DE MENOS.** Las guardas defensivas y las
#    extracciones son CORRECTAS y SE QUEDAN (sin ellas la puerta revienta o miente); faltaban los
#    escenarios que las EXIJAN. Se añaden **@s21..@s27** (7 escenarios) y **7 filas a @s18** (el mapa de
#    mutantes). La producción NO se toca. El bloque de la ampliación vive al final del fichero, tras @s18.
#    Como F-05 (A-23/A-24/A-27/A-28), este contrato YA PASÓ LA PUERTA: el humano decidió las SIETE
#    preguntas el 2026-07-17, TODAS como proponía el lead. **EL `tdd_craftsman` PUEDE IMPLEMENTAR**
#    los 20 escenarios: donde antes se leía «nada se implementa hasta que el humano apruebe», ahora
#    se lee «el humano aprobó ESTE contrato; adelante con el Rojo-Verde-Refactor». `feature_list.json`
#    §6 lleva las 7 decisiones aplicadas (acceptance reescritos, `puerta_legal` corregida, campo
#    `puerta_humana`) y ESTE contrato NO las contradice. Precedente: F-05 (A-23 reescribió acceptance
#    EN LA PUERTA). LAS 7 DECISIONES, LITERALES (todas como proponía el lead):
#      · B-1 → `puerta_legal` reescrita a SC 2.4.11 AA «not entirely hidden» (no «foco no oscurecido»,
#              que roza el 2.4.12 AAA); C43 técnica SUFICIENTE del proyecto; CERO números a la norma.
#      · B-2 → @s11 en DOS CAPAS: (1) suelo CSS estático RE-MEDIDO ≥ altura máxima; (2) afinado JS
#              OPCIONAL, fuera del acceptance. La razón de `scroll-padding` (no `scroll-margin`) es que
#              va en el CONTENEDOR; «scroll-margin no actúa al tabular» era FALSO.
#      · B-3 → breakpoint **820px** [criterio de proyecto MEDIDO], NUNCA el 767 heredado.
#      · B-4 → @s1 como IGUALDAD DE CONJUNTOS + la PUERTA DE ANCLAS VIVAS. «Sección navegable» =
#              `<section>` con `aria-labelledby` que resuelve a un heading real (reutiliza
#              `REGLA_SECTION` de F-04). ESA REGLA YA NO ES [NV]: el humano la FIJÓ (ver @s3/@s20).
#      · B-5 → menú móvil SÍ, mecánica CSS puro (`@media`) + `aria-expanded`. Sin rama de viewport en
#              JS (evita el patrón de memoria). La nav viaja HORNEADA; el menú hornea «cerrado».
#      · B-6 → NO Radix. `radix-ui` SALE de `dependencies` (0 usos en `src/` [V]). Lo ejecuta el
#              `tdd_craftsman` en `package.json`; aquí solo queda REGISTRADO como decisión.
#      · B-7 → `destacados`/`ofertas` son HUÉRFANOS: la nav NO los enlaza (igualdad de conjuntos) y
#              quedan ANOTADOS COMO DEUDA, sin construirse ni descartarse formalmente.
# =============================================================================================
# 🔴 A-23 REDUX — TRES CRITERIOS DE ACEPTACIÓN DE `feature_list.json` §6 NO SE DESTILAN TAL CUAL.
#    La verificación previa (`progress/f06_verificacion_previa.md`, workflow adversarial, ~1,77 M
#    tokens, 8 afirmaciones × verificar+refutar: **1 refutada de raíz, 6 matizadas, 1 confirmada**)
#    demostró que @1, @2 y @4 son **INSATISFACIBLE / FALSO / INSOSTENIBLE**, y que la `puerta_legal`
#    **roza el AAA**. El humano APROBÓ (2026-07-17) reescribir estos criterios, TAL COMO proponía el
#    lead: `feature_list.json` §6 YA los lleva reescritos, y este contrato destila **LAS DECISIONES
#    APROBADAS EN LA PUERTA**, no los criterios originales:
#      - **@1** («cubre TODAS las secciones, no 7 de 11») → **INSATISFACIBLE [V]**: hoy la home tiene
#        **2 secciones** y sus ids viven en los `<h2>` (`servicios-titulo`, `contacto-titulo`), NO en
#        los `<section>` [V: home.tsx:38-39,72,77]. «TODAS las secciones» de una página que aún no
#        existe es **A-23 otra vez**. → **B-4**: se reescribe como **IGUALDAD DE CONJUNTOS derivada
#        del DOM** (@s1, @s2, @s3) **+ una PUERTA DE ANCLAS VIVAS nueva** (el entregable de más
#        valor). Hoy el conjunto es **{servicios, contacto} = 2** y **crece solo** según cierran
#        F-07/F-09/etc. —el argumento que ya ganó en F-04 (`RUTAS_ESPERADAS`) y F-05 (`PARES…`)—.
#      - **@2** («scroll-padding-top; scroll-margin NO actúa al tabular») → **FALSO [V]**: ninguna
#        fuente primaria dice que `scroll-margin` no actúe al tabular; el scroll al `Tab` es
#        **UA-defined** (los *focusing steps* del HTML no llevan paso de scroll). → **B-2**: se
#        destila la razón CORRECTA — `scroll-padding` va en el **CONTENEDOR** (`html`) y por eso
#        cubre TODA operación de scroll-into-view (@s11). **NO** se atribuye a la norma ninguna
#        asimetría de `Tab`.
#      - **@4** («se deriva de la altura REAL de la cabecera») → **INSOSTENIBLE bajo SSG [V]**: en
#        CSS puro NO existe forma de leer la altura de un elemento; la única vía es JS, y el HTML
#        horneado no lleva esa custom property hasta que hidrata —justo cuando el usuario llega desde
#        un `#ancla`—. → **B-2 (Capa 1)**: un `scroll-padding-top` **estático, suelo seguro ≥ altura
#        máxima RE-MEDIDA**, que **SUSTITUYE** el `5rem` de F-04 (@s11). Capa 2 (afinado JS) es
#        OPCIONAL y [I], y el humano decidió (B-2) que NO entra en el acceptance.
#      - **`puerta_legal`** («SC 2.4.11 foco no oscurecido») → **ROZA EL AAA [V]**: el listón de AA
#        es *«not entirely hidden»*; *«no part hidden»* es el **2.4.12 (AAA)**, que NO se persigue.
#        → **B-1**: se reescribe a *«ningún componente que reciba foco de teclado queda ENTERAMENTE
#        oculto por la cabecera sticky (SC 2.4.11 AA)»*, **C43 como técnica suficiente elegida por el
#        proyecto**, y **CERO números atribuidos a la norma**. Es la trampa gemela del 1.4.11 de F-03
#        y del 2.4.7 de F-04: **tercera reincidencia si se copia tal cual**.
#
# =============================================================================================
# FUENTE DE VERDAD DE LOS HECHOS: `progress/f06_verificacion_previa.md`
# =============================================================================================
# Donde `feature_list.json` §6, el troceado de `docs/research/00-fase0-informe.md` o esta
# destilación contradigan a esa verificación, **MANDA LA VERIFICACIÓN**. Se contradicen en cinco
# puntos graves: la `puerta_legal` y cuatro de los cinco acceptance (@1, @2, @4 y la parte del
# breakpoint del @5). El patrón de F-04 y F-05, por tercera vez: *la decisión de construir cabecera
# + nav + pie es correcta; casi todo el «cómo» del troceado es falso o insatisfacible. Ninguna
# decisión de fondo cae. Caen TRES acceptance y la puerta legal.*
#
# NO HUBO CONVERSACIÓN DE SPEC CON EL HUMANO PARA F-06, y ni la spec ni este contrato la simulan.
# El humano DELEGÓ la fase en el `craftsman_lead` hasta la puerta de aprobación, y esa **PUERTA YA SE
# CERRÓ EL 2026-07-17**: el humano decidió las 7 preguntas (todas como proponía el lead). Quien hizo
# de adversario ANTES de la puerta fue la verificación previa —eso no sustituía a la puerta, y por eso
# HUBO puerta—; ahora la aprobación humana está registrada y el `tdd_craftsman` puede implementar.
#
# =============================================================================================
# 🔴 EL ENTREGABLE CENTRAL: UNA PUERTA DE ANCLAS VIVAS QUE HOY NO EXISTE (B-4)
# =============================================================================================
# La anti-404 de F-04 **EXCLUYE las anclas por diseño**: `RUTA_INTERNA = /^\/(?!\/)/`
# (`puerta-cascaron.ts:552`) trata `#ancla` como «un salto dentro de la misma página» y NO la
# comprueba [V]. Consecuencia MEDIDA: **una nav con 7 anclas muertas pasaría las cuatro puertas en
# verde** —incluida `#contacto`, porque el id real es `contacto-titulo`, no `contacto`—.
# → F-06 entrega una PUERTA QUE HOY NO EXISTE: sobre el **HTML CRUDO de cada página de `dist/`**,
#   **todo `href="#id"` de la nav resuelve a un `id` presente en esa misma página**, y **FALLA
#   CERRADA** (artefacto ausente, 0 páginas o 0 anclas → exit ≠ 0). Mata además el bug de `#facial`.
# 🔴 **NO ES LA ANTI-404 DE F-04, Y @s4 LO FIJA**: aquella mira **rutas `/x`**; ésta mira **anclas
#   `#x`**. Son puertas DISTINTAS y COMPLEMENTARIAS. Ni una sustituye a la otra.
# 🔴 **ARQUITECTURA, patrón exacto de la anti-404 de F-04** [V]: función pura DECISORA en `src/lib/`
#   (recibe los BYTES que examina; NO lee ficheros, ni el reloj, ni `process.env`; determinista;
#   informe diffable; **la puerta ACUSA, no gruñe**), + un HUMILDE en `tools/` que cablea
#   `fs`/`process`/`exit`, encadenado en `pnpm build` **DESPUÉS** de `vite-react-ssg build`; **`dev`
#   NO la invoca**. El `.tsx`/`.ts` nuevos se añaden a **DOS listas**: `mutate` de
#   `stryker.config.json` (hoy termina en `puerta-terceros.ts`, sin un solo `.tsx` [V]) **Y**
#   `coverage.include` de `vitest.config.ts` (hoy `['src/lib/**/*.ts']`, que excluye todo `.tsx`
#   [V]). Si el `.tsx` no está en `mutate`, Stryker ni lo mira y la tanda da 100% sin medir nada.
#
# =============================================================================================
# 🔴 EL MENÚ MÓVIL — @s15/@s16/@s17 REGISTRAN LAS DECISIONES DEL HUMANO (B-5, B-6, B-3), YA FIRMES
# =============================================================================================
# Hoy `src/` NO tiene ni `useIsMobile`, ni `matchMedia`, ni `useSyncExternalStore`, ni una sola
# `@media` [V]; el prototipo resuelve el responsive con `flex-wrap: wrap`. La **primera decisión de
# F-06 era una BIFURCACIÓN (B-5)**, y de ella colgaban B-3 y B-6. **EL HUMANO DECIDIÓ (2026-07-17):**
# menú móvil SÍ, con CSS puro (`@media`) para el eje responsive —SIN rama de viewport en JS, evita el
# patrón de memoria `red-css-para-rama-solo-js-en-ssg`— + estado abierto/cerrado en **atributo
# consultable** (`aria-expanded`), **SIN Radix** (`radix-ui` tiene CERO usos en `src/` [V] → SALE de
# `dependencies`; lo ejecuta el `tdd_craftsman` en `package.json`, aquí solo queda registrado).
# 🔴 **LA MECÁNICA YA NO ES NEGOCIABLE:** la nav viaja HORNEADA en el HTML y el menú hornea «cerrado».
# @s16 sigue siendo OBLIGATORIO —asevera los enlaces del menú en el HTML de `dist/`— porque blinda por
# adelantado contra CUALQUIER regresión futura que sacara los enlaces del prerender (era la trampa de
# un `Dialog.Portal` de Radix, ya descartado: emite CERO en prerender —125 bytes, solo el `<button>`
# trigger [V, `renderToString`]— y dejaría la puerta de anclas CIEGA; no se rompe: MIENTE POR OMISIÓN).
#
# =============================================================================================
# 🔴 EL CHOQUE CON LAS CUATRO PUERTAS (E1) — MEDIDO, con un BLOQUEANTE de diseño
# =============================================================================================
#  (a) **El pie NO emite enlaces legales** (@s13). Un `<a href="/aviso-legal">` ROMPE la anti-404 —2
#      violaciones «href interno sin fichero en dist/», la fila 1 de la tabla del bug del cliente
#      [V]—. Rutas, enlaces y contenido legal son **F-16** (A-17, cerrada). La nota «el pie con los
#      huecos de los enlaces legales» de `feature_list.json:101` es **troceado viejo que A-17
#      derogó**, y `home.tsx:86-90` ya lo declara resuelto.
#  (b) **Los `<a>` a Facebook/Instagram pasan las puertas** (@s14): F-05 terceros los IGNORA
#      (hiperenlaces, exit 0 — es literalmente `@s12` de F-05 [V]); la anti-404 los ignora (externos,
#      `@s24` de F-04); la puerta de anclas los ignora (no son `#ancla`). Sin @s14, alguien
#      «endurece» una puerta y ROMPE EL CONTACTO DEL SALÓN (dato real de `site.ts`).
#  (c) 🔴 **Un `className={cond ? 'a' : 'b'}` en TSX es INMATABLE** bajo la regla anti-clase-CSS del
#      repo (`feature_list.json:22`). MEDIDO con Stryker real: genera **5 mutantes** (2
#      ConditionalExpression, 1 EqualityOperator, 2 StringLiteral) y **los 5 SOBREVIVEN** a una suite
#      que consulta por rol/nombre/texto; solo mueren con `toHaveClass`, que esa misma línea PROHÍBE
#      [V]. La salida está medida y es barata: `aria-expanded`/`aria-current` (misma forma
#      condicional) **muere 4/4 con consultas permitidas** [V]. → **INVARIANTE DE F-06 (@s15):** el
#      estado condicional va en un **atributo CONSULTABLE**; el `className` es constante o derivado.
#  (d) **Los atributos JSX literales NO generan mutantes** (`aria-label="Principal"` no está
#      protegido por la mutación): los aseveran los TESTS o la puerta de anclas, **jamás Stryker**.
#      No confundir «100% de mutación» con «el marcado está cubierto».
# 🔴 **TODO ESTO ES [NV] HASTA EL PRIMER `pnpm build` REAL** (I-8): se midió contra funciones puras
#    con fixtures propios, NO contra un `dist/` real. *Verde ≠ funciona.* El primer build de F-06 es
#    OBLIGATORIO y MANDA sobre todo lo escrito aquí (F-04 se llevó sus sustos justo ahí).
#
# =============================================================================================
# ANTI-TAUTOLOGÍA (regla dura del arnés) Y LO PROHIBIDO EN ESTE FICHERO
# =============================================================================================
# TODO esperado se escribe A MANO en el escenario y en el test: el literal del breakpoint (`820px`),
# el número del suelo de `scroll-padding-top` (RE-MEDIDO por el TDD, no importado), el conjunto de
# ids esperados. **JAMÁS se importa la constante que el test debería vigilar PARA COMPARARSE CONTRA
# ELLA** (precedente WebEmpresa: el fake atado al símbolo `MOBILE_QUERY` en vez del literal fue el
# PRIMER mutante superviviente; patrón `doble-de-test-anclado-al-literal-no-al-simbolo`).
# ❌ **PROHIBIDO EN ESTE CONTRATO, EN LOS TESTS Y EN LOS MENSAJES DE VIOLACIÓN:** «foco no
#    oscurecido» a secas · atribuir a SC 2.4.11 un umbral en px o rem · llamar a C43 «obligatorio»
#    sin sujeto · afirmar que 2.4.11 cubre el scroll con `Tab` (es UA) · afirmar que `scroll-margin`
#    no actúa al tabular · atribuir el breakpoint a WCAG (1.4.10 solo exige 320px) · el `767` de
#    WebEmpresa (herencia muerta, 0 en `src/` [V]) · números de altura «copiados» del prototipo sin
#    RE-MEDIR sobre la nav definitiva.
#
# =============================================================================================
# 🔴 LO QUE F-06 NO CONSTRUYE, Y LOS HUÉRFANOS (B-7, DECIDIDO EL 2026-07-17)
# =============================================================================================
# F-06 **NO construye secciones**: su alcance es **cabecera + nav + pie + la puerta de anclas vivas
# + el `scroll-padding-top` derivado**. Las secciones (`top`, `unas`, `faq`, …) las montan
# F-07/F-09/F-15/etc.; la nav crece enlazando a las que van existiendo, y la puerta impide que
# enlace a las que aún no. **`destacados` y `ofertas` son HUÉRFANOS** —0 features los construyen
# [V]—: **el humano DECIDIÓ (B-7)** que la igualdad de conjuntos de B-4 los deja fuera sola (la nav NO
# los enlaza) y quedan **ANOTADOS COMO DEUDA**, sin construirse ni descartarse formalmente por ahora.
# =============================================================================================

Feature: Cabecera, navegación, pie, y la PUERTA DE ANCLAS VIVAS que demuestra que ningún enlace de la nav apunta a una sección que no existe en el artefacto
  Como responsable del proyecto quiero que la home tenga una cabecera con la marca y una navegación
  que enlace EXACTAMENTE a las secciones que existen en el artefacto de producción, un pie honesto,
  y que una puerta mecánica nueva demuestre en cada build —sobre el HTML CRUDO de `dist/`— que
  ningún `href="#id"` de la nav apunta a un `id` ausente en esa página (ni sobra un ancla muerta ni
  falta una sección alcanzable); más un `scroll-padding-top` que la cabecera sticky no invalide;
  para cubrir el hueco que la anti-404 de F-04 excluye por diseño y matar el bug de `#facial`.

  # ---------------------------------------------------------------------------
  # La PUERTA DE ANCLAS VIVAS — el decisor puro (B-4). Igualdad de conjuntos derivada del DOM.
  # ---------------------------------------------------------------------------

  @s1
  Scenario Outline: un href="#id" de la nav a un id ausente en la página produce violación (ancla muerta)
    Given el HTML CRUDO de la ruta "/" con una nav que enlaza "<ancla>" y una página que NO contiene ningún elemento con el id "<id buscado>"
    When se inspecciona esa página con la puerta de anclas vivas
    Then hay exactamente 1 violación
    And la violación declara la ruta "/", el ancla "<ancla>" y el id ausente "<id buscado>"

    Examples:
      | ancla             | id buscado       | por qué                                                                                  |
      | #facial           | facial           | sección que ESTE negocio NO tiene (es Uñas·Pestañas·Cejas): el bug concreto que la puerta mata |
      | #colores          | colores          | sección aún no construida (F-19, blocked): la nav no puede enlazar a la nada              |
      | #servicios        | servicios        | el id REAL vive en el <h2 id="servicios-titulo">: apuntar a "#servicios" cae en el vacío  |
      | #contacto         | contacto         | ídem: el id real es "contacto-titulo"; hoy home.tsx lo evita apuntando a "#contacto-titulo" [V] |

    # 🔴 ESTE ES EL PREDICADO CENTRAL: «el `id` del ancla NO está en el conjunto de `id`s de la
    # página». Muere aquí (ancla muerta) Y en @s2 (nav válida → 0 violaciones): sin las dos mitades,
    # un mutante que marque TODO como violación pasaría @s1 por la razón equivocada.
    # Las filas `#servicios`/`#contacto` son el **desajuste id-de-`<h2>` vs ancla** (casos límite 2 y
    # 3 de la spec): el id vive en el `<h2>` con sufijo `-titulo` [V: home.tsx:38-39,72,77], y un
    # ancla a `#servicios` a secas aterriza en la nada. La puerta lo blinda.
    # El `Then` asevera **el id ausente**, no solo la cuenta: es la lección de F-05 (@s24 mataba CERO
    # porque su `Then` solo aseveraba conteos, ciego a las mutaciones de valor). Los esperados se
    # escriben A MANO; JAMÁS se importan del código de producción.

  @s2
  Scenario: una nav cuyas anclas resuelven todas a un id presente NO produce ninguna violación
    Given el HTML CRUDO de la ruta "/" con una nav que enlaza "#servicios-titulo" y "#contacto-titulo", y una página con un elemento id "servicios-titulo" y un elemento id "contacto-titulo"
    When se inspecciona esa página con la puerta de anclas vivas
    Then la lista de violaciones está vacía
    # EL CAMINO FELIZ, y es el estado de `home.tsx` HOY (la nav apunta a `#servicios-titulo` y
    # `#contacto-titulo`, cuyos ids existen en los `<h2>`) [V]. Sin este escenario, una puerta que
    # devolviera una violación SIEMPRE pasaría todos los negativos y rompería el build para siempre.
    # `html` son LOS BYTES de `dist/`, NUNCA un render del árbol de componentes.

  @s3
  Scenario Outline: una sección navegable cuyo id ninguna ancla de la nav enlaza produce violación (inalcanzable)
    Given el HTML CRUDO de la ruta "/" con una sección navegable (una <section> con aria-labelledby que resuelve al heading real <h2 id="<id sección>">) y una nav que NO enlaza "#<id sección>"
    When se inspecciona esa página con la puerta de anclas vivas
    Then hay exactamente 1 violación
    And la violación declara la ruta "/", el id "<id sección>" y que la sección es inalcanzable desde la nav

    Examples:
      | id sección | por qué                                                                       |
      | faq        | cuando F-15 monte la FAQ, si la nav no la enlaza queda inalcanzable [NV]       |
      | contacto-titulo | el contacto (horario y dirección) es información crítica de un salón físico: quedar sin enlace es un fallo real |

    # 🔴 LA OTRA MITAD DE LA IGUALDAD DE CONJUNTOS (B-4): la nav enlaza EXACTAMENTE a las secciones
    # existentes —ni una de más (@s1: ancla muerta) NI UNA DE MENOS (aquí: sección inalcanzable)—.
    # El conjunto se DERIVA DEL DOM, no de una lista fija: crece solo según cierran F-07/F-09/etc.,
    # sin que nadie tenga que subir un número (el argumento que ganó en F-04 con `RUTAS_ESPERADAS`).
    # ✅ **REGLA DE «SECCIÓN NAVEGABLE» — FIJADA POR LA PUERTA HUMANA EL 2026-07-17 (parte de B-4). YA
    # NO ES [NV] PARA EL TDD; LA IMPLEMENTA TAL CUAL:** navegable = una `<section>` con `aria-labelledby`
    # que RESUELVE a un heading real (`h1`…`h6`); su `id` de anclaje es el del heading. El humano la fijó
    # **coherente con `REGLA_SECTION` de F-04** —`'section sin aria-labelledby a un heading real'`, `puerta-cascaron.ts:118`;
    # el bucle de `:507-519` acusa toda `<section>` cuyo `aria-labelledby` no resuelva a un id de
    # `idsDeHeadings` (`:505,:131`)—, así que la regla es DECIDIBLE en la puerta y el TDD la implementa
    # SIN depender de un `dist/` futuro desconocido ni de una decisión posterior. Antes esta nota decía
    # «[NV], la FIJA el TDD»: era demasiado débil, y la revisión adversarial lo cazó —los dos Examples de
    # arriba COLAPSAN sobre la MISMA forma del DOM (el id del `<h2>` == destino del `aria-labelledby`) y
    # NINGUNO distingue una derivación de otra, de modo que un mutante «navegable = cualquier id»
    # SOBREVIVÍA a @s1/@s2/@s3—. **@s20 añade el Example que la DISTINGUE** (un heading con id que NINGUNA
    # `<section>` referencia → NO cuenta como inalcanzable) y SE CONSERVA como parte del contrato aprobado.

  # ⬇️ @s20 se define aquí (junto a @s3, su hermano) pero conserva el número 20 para NO renumerar
  #    @s4..@s18, que la revisión adversarial ya cita por su tag. Añadido en la ronda de reparación.
  @s20
  Scenario: un heading con id que NINGUNA sección referencia por aria-labelledby NO es navegable — no produce violación de inalcanzable (DISTINGUE la regla de @s3)
    Given el HTML CRUDO de la ruta "/" con un heading <h2 id="promociones-titulo"> que NINGUNA <section> referencia por aria-labelledby, y una nav que NO enlaza "#promociones-titulo"
    When se inspecciona esa página con la puerta de anclas vivas
    Then la lista de violaciones NO contiene ninguna violación de «sección inalcanzable» para el id "promociones-titulo"
    # 🔴 EL EXAMPLE QUE DISTINGUE LA REGLA DE «SECCIÓN NAVEGABLE» (hallazgo GRAVE de la revisión). Los
    # dos Examples de @s3 colapsan sobre la misma forma del DOM y NO separan «navegable = section con
    # aria-labelledby→heading real» de «navegable = cualquier id». Aquí el heading tiene id pero
    # NINGUNA `<section>` lo referencia: bajo la regla FIJADA POR LA PUERTA (coherente con `REGLA_SECTION`
    # de F-04) NO es navegable → 0 violaciones de inalcanzable. Un mutante «navegable = cualquier id»
    # —que SOBREVIVE a @s1/@s2/@s3— aquí acusaría 1 y MUERE (@s18, fila añadida). Sin este escenario la
    # mitad «ni una de menos» de B-4 queda anclada TAUTOLÓGICAMENTE a la implementación.
    # ✅ FIJADO POR LA PUERTA HUMANA con @s3 (parte de B-4, 2026-07-17): la derivación «section con
    # aria-labelledby → heading real» es FIRME; este Example DISTINGUE la regla y SE CONSERVA.

  @s4
  Scenario: la puerta de anclas vivas es DISTINTA y COMPLEMENTARIA de la anti-404 de F-04 (#x vs /x)
    Given una página "/" con un ancla muerta "#facial" (sin id "facial") y un enlace a una ruta interna inexistente "/servicios"
    When se ejecuta el build de producción con las cuatro puertas más la puerta de anclas
    Then la puerta de anclas vivas acusa "#facial" como ancla muerta y NO acusa "/servicios"
    And la puerta anti-404 de F-04 acusa "/servicios" como "href interno sin fichero en dist/" y NO acusa "#facial"
    And el código de salida es distinto de 0
    # 🔴 EL ESCENARIO QUE IMPIDE CONFUNDIR LAS DOS PUERTAS. La anti-404 IGNORA "#facial" por diseño
    # (`RUTA_INTERNA = /^\/(?!\/)/` excluye "#" [V: puerta-cascaron.ts:552,548]); la puerta de anclas
    # IGNORA "/servicios" (no es un ancla). **Son gemelas para ejes que la otra excluye.** Sin este
    # escenario, alguien «funde» las dos puertas y reabre el hueco de las 7 anclas muertas que HOY
    # pasan las cuatro puertas en verde [V].

  @s5
  Scenario: el informe de la puerta de anclas acusa una línea por violación y es determinista
    Given una página "/" con dos anclas muertas "#facial" y "#depilacion" y una sección navegable "faq" sin enlace en la nav
    When se inspecciona ese mismo artefacto dos veces con la puerta de anclas vivas
    Then hay exactamente 3 violaciones
    And cada violación nombra su ruta, su ancla o id, y qué falta
    And las dos listas son idénticas, elemento a elemento y EN EL MISMO ORDEN
    # LA PUERTA ACUSA, NO GRUÑE (precedente F-01/F-03/F-04, @s25). «Hay anclas rotas» sin decir
    # cuáles no se arregla a las 3 de la mañana: se salta. TRES violaciones y no una: cada infracción
    # es independiente; un `else if` en vez de `if` independientes deja una sin acusar. DETERMINISMO:
    # misma entrada → misma salida, MISMO ORDEN → informe DIFFABLE, o el ruido lo vuelve invisible.

  # ---------------------------------------------------------------------------
  # La puerta (el humilde): vacuidad, falla cerrada y el exit code. Escenario de vacuidad OBLIGATORIO.
  # ---------------------------------------------------------------------------

  @s6
  Scenario Outline: la puerta de anclas falla si el artefacto está ausente o no tiene páginas — NUNCA verde por vacuidad
    Given que "<situacion>"
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida declara por qué no pudo inspeccionar el artefacto
    And la salida NO declara que no haya anclas rotas

    Examples:
      | situacion                                             |
      | el directorio dist/ no existe                         |
      | dist/ existe pero no contiene ningún fichero HTML     |

    # 🔴 FALLA CERRADA (casos límite 4). SIN ESTO: `dist/` vacío → 0 páginas → 0 anclas → 0
    # violaciones → build VERDE → «protegidos». 0 fallos sobre 0 páginas NO ES ESTAR PROTEGIDO: ES NO
    # HABER MIRADO. Es la guarda anti-vacuidad de A-8 (F-01), @s14/@s15 (F-03), @s26/@s27 (F-04). La
    # puerta se ejecuta DESPUÉS del build; un build que no generó nada la dejaría escaneando el vacío.

  @s7
  Scenario: la puerta de anclas falla si no ha inspeccionado ni un solo ancla de nav
    Given un dist/ con una index.html cuya nav contiene al menos un href="#…"
    And que la puerta extrae 0 anclas de nav de ese artefacto
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida declara que no se inspeccionó ningún ancla de la nav
    And la salida NO declara que no haya anclas rotas
    # 🔴 ESCENARIO DE VACUIDAD OBLIGATORIO — patrón EXACTO de `@s28` de F-04. El objeto vigilado NO es
    # el sitio: ES EL EXTRACTOR. Que la puerta informe «0 anclas rotas» habiendo mirado 0 anclas es el
    # mismo verde por vacuidad, un nivel más abajo: un extractor que deja de casar hace pasar la
    # puerta «protegidos» sin mirar nada.
    # ⚠️ **PARA EL TDD:** esta guarda EXIGE que la cáscara emita al menos un `href="#…"` en la nav de
    # `dist/index.html`. Es razonable (la nav de F-06 los emite), pero NO está verificado sobre un
    # `dist/` real hasta el primer build [NV]. Si el artefacto saliera con 0 anclas, esta guarda NACE
    # EN ROJO y se VUELVE a la puerta humana, no se le baja el listón en silencio.
    # ➡️ @s19 es el GEMELO de este escenario para el SEGUNDO extractor (las secciones navegables).

  # ⬇️ @s19 se define aquí (junto a @s7, su gemelo) pero conserva el número 19 para NO renumerar
  #    @s8..@s18, que la revisión adversarial ya cita por su tag. Añadido en la ronda de reparación.
  @s19
  Scenario: la puerta de anclas falla si no ha derivado ni una sola sección navegable — GEMELO de @s7 para el OTRO extractor
    Given un dist/ con una index.html que contiene al menos una sección navegable en su HTML (una <section> con aria-labelledby que resuelve a un heading real)
    And que la puerta deriva 0 secciones navegables de ese artefacto
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida declara que no se inspeccionó ninguna sección navegable
    And la salida NO declara que no haya secciones inalcanzables
    # 🔴🔴 ESCENARIO DE VACUIDAD OBLIGATORIO — LA GUARDA QUE FALTABA (BLOQUEANTE de la revisión
    # adversarial). La puerta tiene DOS extractores independientes: (1) las anclas de nav (`href="#id"`,
    # guardado por @s7) y (2) las SECCIONES NAVEGABLES (consulta DOM PROPIA y más estrecha, ver @s3).
    # Solo (1) tenía guarda de vacuidad. Modo de fallo reproducido: si (2) se rompe y deriva 0 secciones
    # mientras las anclas se extraen bien → @s7 verde, @s1/@s2 verdes, @s3 VACUO (0 «inalcanzables»),
    # @s9 VACUAMENTE cierto → exit 0 habiendo inspeccionado CERO secciones. Es la mitad «ni una de
    # menos» de B-4 certificando verde SIN MIRAR. Y lo peligroso: la mutación SIGUE alcanzando 100%
    # (@s3 mata en su fixture al mutante que vacía el extractor de secciones), así que la brecha es
    # INVISIBLE a la métrica de cierre — SOLO la cazan esta guarda y la puerta humana. Es @s28 de F-04
    # («el objeto vigilado ES EL EXTRACTOR») aplicado al SEGUNDO extractor. Muere aquí un mutante que
    # deje la derivación de secciones en `[]`; @s18 (fila «vaciar el extractor de SECCIONES») lo nombra.
    # ⚠️ **PARA EL TDD:** igual que @s7, esta guarda EXIGE que la cáscara emita al menos una sección
    # navegable en `dist/index.html` (la home de F-04 ya emite dos `<section aria-labelledby>` [V:
    # home.tsx:71-77]). [NV] hasta el primer build real: si el artefacto saliera con 0 secciones, la
    # guarda NACE EN ROJO y se VUELVE a la puerta humana, no se le baja el listón en silencio.

  @s8
  Scenario: la puerta de anclas falla cerrada si ella misma revienta
    Given un fichero HTML del artefacto de producción cuya lectura o cuyo parseo lanza una excepción
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida declara que la puerta de anclas no pudo completar la inspección
    And la salida NO declara que no haya anclas rotas
    # Modos de error (derivación de D-9/I-8, [I], igual que F-01/F-03/F-04/F-05). Una puerta que se
    # traga su propia excepción y devuelve `[]` es PEOR QUE NO TENER PUERTA, porque además da
    # confianza. ANTE LA DUDA: BUILD ROTO, NUNCA BUILD VERDE.

  @s9
  Scenario: el build de producción con una nav consistente termina con código de salida 0
    Given un dist/ cuyas páginas tienen una nav en la que cada href="#id" resuelve a un id presente y cada sección navegable está enlazada por la nav
    When se ejecuta el build de producción
    Then el código de salida es 0
    And la puerta de anclas no emite ninguna violación
    # Sin el camino feliz, una puerta que rompiera SIEMPRE pasaría todos los escenarios negativos.

  @s10
  Scenario: el build de desarrollo NO invoca la puerta de anclas
    Given una página con un ancla muerta "#facial"
    When se ejecuta el build de desarrollo
    Then el código de salida es 0
    # Precedente F-01/F-03/F-04/F-05: la FUNCIÓN es pura; el `exit ≠ 0` vive en el HUMILDE, enganchado
    # SOLO a `pnpm build` de producción DESPUÉS de `vite-react-ssg build` [V: package.json]. La puerta
    # separa «ver» de «publicar»: en local una nav a medias es legítima, es para ver el diseño.

  # ---------------------------------------------------------------------------
  # El scroll-padding-top (Capa 1, B-2) — SOBRE EL SCSS. No es mutable (Stryker no ve SCSS).
  # ---------------------------------------------------------------------------

  @s11
  Scenario: la hoja global declara un scroll-padding-top con un suelo seguro >= la altura máxima re-medida, que SUSTITUYE el 5rem de F-04
    Given la hoja de estilos global del sitio y la altura máxima de la cabecera sticky que el TDD mide sobre la nav definitiva en el rango de anchos soportado
    When se lee la declaración "scroll-padding-top" de las reglas globales
    Then existe una declaración "scroll-padding-top" en el contenedor de scroll (html)
    And su valor —o el mayor escalón de su tabla @media— resuelto a px con la raíz por defecto es mayor o igual que esa altura máxima medida
    And ese valor NO es el "5rem" heredado de F-04 salvo que la re-medición confirme que 80px basta
    # 🔴 CAPA 1 (B-2), CRITERIO DE PROYECTO. `scroll-padding` va en el CONTENEDOR (`html`) y por eso
    # cubre TODA operación de scroll-into-view [V] — ESA es la razón correcta, NO una asimetría de
    # `scroll-margin` frente a `Tab` (que es FALSA [V]: el scroll al `Tab` es UA-defined).
    # 🔴 EL NÚMERO ES [NV]: HAY QUE RE-MEDIRLO sobre la nav definitiva y escribirlo A MANO en el test.
    # MEDIDO en el prototipo [V]: la cabecera toma CINCO alturas —231/190/149/108/70px— con saltos en
    # 282/385/647/821px; los **5rem (80px) de F-04 se quedan cortos 28/69/110/151px por debajo de
    # 821px** → 80px NO basta (la cabecera llega a 231px). Cambiar «Facial» por «Pestañas/Cejas» y
    # completar la nav MUEVE los saltos: por eso se RE-MIDE, no se copia. Se admite un único valor
    # suelo O una tabla `@media` cuyos escalones cubran cada salto medido. El SCSS de F-04 ya lo dice:
    # «F-06 es quien puede ajustarlo, porque es quien conoce la altura» (`_base.scss:32-35`) [V].
    # ⚠️ **NO SE ATRIBUYE NINGÚN NÚMERO A SC 2.4.11** (B-1): el listón AA es «not entirely hidden»
    # (oscurecimiento PARCIAL es CONFORME); «no part hidden» es el 2.4.12 AAA y NO se persigue. C43
    # (`scroll-padding`) es la técnica suficiente ELEGIDA POR EL PROYECTO, no una imposición de la
    # norma. El SCSS NO ES MUTABLE (Stryker no ve CSS): aquí el mutante es HUMANO y la puerta de
    # aprobación es su única defensa. Capa 2 (afinado JS con `ResizeObserver`) es OPCIONAL, [I], y el
    # humano DECIDIÓ en B-2 (2026-07-17) que NO entra en el acceptance: solo mejora post-hidratación.

  # ---------------------------------------------------------------------------
  # El marcado de cabecera / nav / pie — SSR-safe, sobre el HTML CRUDO de dist/, NUNCA jsdom.
  # ---------------------------------------------------------------------------

  @s12
  Scenario: el HTML CRUDO de dist/ contiene la cabecera con la marca, la nav con su aria-label y el pie, ANTES de hidratar
    Given el HTML CRUDO prerenderizado de la ruta "/" del artefacto de producción
    When se inspecciona ese HTML sin ejecutar JavaScript
    Then contiene un landmark de navegación con el nombre accesible "Principal"
    And contiene la marca del salón en la cabecera
    And contiene un landmark de pie de página
    # 🔴 SSR-SAFE, ASEVERADO SOBRE LOS BYTES DE `dist/`, NO EN JSDOM (verde ≠ funciona, I-8). La nav y
    # el pie tienen que estar HORNEADOS en el HTML: un usuario que llega antes de hidratar debe ver la
    # navegación. Los landmarks `nav`/`footer` los exige F-04 como CRITERIO DE PROYECTO (no «lo exige
    # 1.3.1»). Los atributos literales (`aria-label="Principal"`) NO los protege Stryker: los asevera
    # ESTE test. El nombre accesible se consulta por rol/aria, NUNCA por clase CSS.

  @s13
  Scenario: el pie NO emite enlaces legales — un href interno a una ruta legal inexistente rompería la anti-404 de F-04
    Given un pie que emitiera un enlace "/aviso-legal" sin fichero correspondiente en dist/
    When se ejecuta el build de producción
    Then la puerta anti-404 de F-04 emite violación por "href interno sin fichero en dist/" con el href "/aviso-legal"
    And el código de salida es distinto de 0
    # 🔴 F-06 NO EMITE ENLACES LEGALES (casos límite 7). Rutas, enlaces y contenido legal son F-16
    # (A-17, cerrada). Un pie que enlaza a la nada ES LITERALMENTE EL BUG DEL CLIENTE (su
    # /es/aviso-legal da 404 [V]), y la anti-404 lo hace estructuralmente imposible. Este escenario
    # DESLINDA: si aparecieran enlaces legales, los caza la anti-404 de F-04, NO la puerta de anclas.
    # Cuando F-16 se desbloquee, aparecerán CON DESTINO REAL.

  @s14
  Scenario: el enlace del pie a la red social pasa las tres puertas de enlaces — coherencia con @s12 de F-05 y @s24 de F-04
    Given un pie con un enlace "https://www.facebook.com/nailslashstudiorozas/" (dato real de la fuente única de F-02 [V: site.ts:47, REDES.facebook])
    When se ejecuta el build de producción
    Then la puerta de terceros NO emite violación por ese enlace (es un hiperenlace, no una petición automática)
    And la puerta anti-404 de F-04 NO emite violación por ese enlace (es externo, no una ruta interna)
    And la puerta de anclas vivas NO emite violación por ese enlace (no es un ancla "#…")

    # 🔴 COHERENCIA CON `@s12` DE F-05 y `@s24` DE F-04. Sin este escenario, alguien «endurece» una
    # puerta tratando el enlace de Facebook como interno o como petición, y ROMPE EL CONTACTO DEL
    # SALÓN (dato REAL de `site.ts` [V]). F-05 ignora los hiperenlaces (el predicado del ap. 27 de
    # Fashion ID es la transmisión AUTOMÁTICA «regardless of whether … has clicked»). QUIÉN emite
    # estos `<a>` (F-06 en el pie o F-12 en contacto) es alcance de producto; lo que este escenario
    # FIJA es que, estén donde estén, NINGUNA puerta los caza.
    # ✂️ **INSTAGRAM ELIDIDO A PROPÓSITO (reparación tras revisión adversarial), como en F-05
    # (`cero_terceros.feature`, que usa SOLO la URL de Facebook por lo mismo).** `site.ts:46` guarda
    # un HANDLE —`instagram: '@nailslash.studio_'`—, NO una URL, y NO existe `instagramHref` (a
    # diferencia de `telHref`/`waHref`). La URL `https://www.instagram.com/nailslash.studio_/` NO vive
    # en la fuente única (ni guardada ni derivada): rotularla «dato real de la fuente única de F-02»
    # era una CITA FABRICADA. Un TDD que la tomara literal hornearía una URL HARDCODEADA, violando el
    # invariante que F-02 existe para evitar (`site.ts:4`: «el texto visible y el href no puedan
    # divergir») y la acceptance de F-12 («los href derivan del dato único de F-02, no están
    # hardcodeados»). La fila de Facebook BASTA: su URL es verbatim de `site.ts:47` y el punto del
    # escenario —ninguna puerta caza un enlace EXTERNO— queda cubierto. Emitir el enlace de Instagram
    # (previo `instagramHref` en F-02) es alcance de F-02/F-12, NO de F-06.

  # ---------------------------------------------------------------------------
  # El menú móvil — DECIDIDO POR LA PUERTA HUMANA (B-5/B-6/B-3, 2026-07-17): CSS puro + aria-expanded
  # + 820px, SIN Radix. La mecánica es FIRME; el TDD la implementa tal cual, no es «propuesta».
  # ---------------------------------------------------------------------------

  @s15
  Scenario: el estado abierto/cerrado del menú se expresa en un atributo consultable, nunca en un className condicional
    Given un botón que controla la apertura del menú de navegación
    When el menú está cerrado y luego se abre
    Then el estado se lee del atributo "aria-expanded" del botón ("false" cerrado, "true" abierto), consultado por rol y nombre accesible
    And NO se expresa mediante un className condicional del tipo cond ? 'a' : 'b'
    # 🔴 INVARIANTE DE F-06 (E1.c), MEDIDO CON STRYKER REAL: un `className={cond ? 'a' : 'b'}` genera
    # 5 mutantes y LOS 5 SOBREVIVEN a consultas por rol/nombre/texto; solo mueren con `toHaveClass`,
    # que `feature_list.json:22` PROHÍBE [V]. `aria-expanded={cond ? 'true' : 'false'}` —misma forma
    # condicional— muere 4/4 con consultas permitidas [V]. El estado condicional va SIEMPRE en un
    # atributo consultable (`aria-expanded`, `aria-current`, `aria-pressed`, `data-*`); el `className`
    # es constante o derivado. Es el mismo eje que I-5: consultar por rol/nombre/texto/`data-*`,
    # NUNCA por clase CSS.
    # ✅ **DECIDIDO (B-5/B-6, 2026-07-17):** CSS puro + `aria-expanded`, SIN Radix. La mecánica es
    # FIRME; el `tdd_craftsman` implementa este escenario tal cual (nada de Radix, nada de className
    # condicional para el estado abierto/cerrado).

  @s16
  Scenario: el HTML CRUDO de dist/ hornea el menú «cerrado» — estado seguro de primera carga (SSR)
    Given el HTML CRUDO prerenderizado de la ruta "/" del artefacto de producción
    When se inspecciona el botón del menú sin ejecutar JavaScript
    Then el botón declara "aria-expanded" con el valor "false"
    And los enlaces de la navegación están presentes en el HTML horneado (no dependen de la hidratación)
    # 🔴 SSR-SAFE, SOBRE LOS BYTES DE `dist/`, NO EN JSDOM (I-8). El estado horneado por SSR es
    # «cerrado» (el estado seguro de primera carga). La segunda aserción es la que MATA por adelantado
    # la trampa de Radix (DESCARTADO en B-6, pero la guarda persiste): un `Dialog.Portal` emitiría CERO
    # en prerender —125 bytes, solo el `<button>` trigger [V, `renderToString`]— y los enlaces NO
    # estarían en el HTML, dejando la puerta de anclas CIEGA (no se rompe: MIENTE POR OMISIÓN). Este
    # escenario los exige en el HTML de `dist/`, contra Radix o cualquier regresión futura equivalente.
    # ✅ **DECIDIDO (B-5/B-6, 2026-07-17):** hay menú móvil con botón → este escenario aplica ENTERO,
    # con su aserción de `aria-expanded="false"` horneado Y la de los enlaces presentes en el HTML. La
    # trampa de Radix/Portal quedó descartada (B-6), pero @s16 sigue blindando el prerender igual.

  @s17
  Scenario: el breakpoint del menú es exactamente el literal 820px, leído del SCSS y anclado contra el literal escrito a mano
    Given el fichero .module.scss de la cabecera con la media query del menú móvil
    When un test lee ese SCSS
    Then la media query usa exactamente el literal "820px"
    And el test compara contra el literal "820px" escrito A MANO, no contra el símbolo importado de producción
    # 🔴 ESCENARIO OBLIGATORIO (B-3), patrón `doble-de-test-anclado-al-literal-no-al-simbolo`. El
    # breakpoint es CRITERIO DE PROYECTO MEDIDO: la nav envuelve en la banda 793–806px (fuentes
    # cargadas 805→806; fallback pre-swap 793) → `820px` da margen sobre toda la banda [V]. **NUNCA el
    # `767` de WebEmpresa** (herencia muerta, 0 en `src/` [V]; es el `md` de Bootstrap, no una medida
    # de este diseño). **NUNCA atribuido a WCAG:** SC 1.4.10 Reflow solo exige 320px sin scroll
    # bidireccional y la cabecera ya lo cumple hoy [V]; el menú móvil NO se justifica por Reflow.
    # 🔴 RE-MEDIR sobre la nav definitiva: el número se mueve ±12px según fuentes y al reetiquetar la
    # nav. Si hay rama JS de viewport (vía B-5), el `@media` del SCSS y la constante JS son EL MISMO
    # LITERAL, y el test lee el SCSS y lo ancla contra el literal a mano (anti-tautología).
    # ✅ **DECIDIDO (B-3/B-5, 2026-07-17):** hay menú móvil → este escenario aplica. El breakpoint es
    # el literal `820px` [criterio de proyecto MEDIDO], NUNCA el 767 heredado; el TDD lo implementa.

  # ---------------------------------------------------------------------------
  # Los mutantes que deben morir (I-6, umbral 1.0). El conjunto exacto se MIDE cuando el fichero exista.
  # ---------------------------------------------------------------------------

  @s18
  Scenario Outline: mutar el predicado de la puerta o el breakpoint rompe al menos un test
    Given la implementación de la puerta de anclas y del breakpoint del menú
    When se aplica la mutación "<mutación>"
    Then al menos un test pasa de verde a rojo

    Examples:
      | mutación                                                                            | dónde muere                          |
      | negar el predicado «el id del ancla está presente en la página»                     | @s1 (ancla muerta) y @s2 (nav válida) |
      | invertir la igualdad de conjuntos (dejar de acusar la sección inalcanzable)         | @s3                                  |
      | «navegable = cualquier id» en vez de «section con aria-labelledby → heading real»   | @s20 (heading no referenciado → 0)   |
      | vaciar el extractor de ANCLAS de nav (verde por vacuidad del 1.er extractor)        | @s7                                  |
      | vaciar el extractor de SECCIONES navegables (verde por vacuidad del 2.º extractor)  | @s19                                 |
      | alterar el literal del breakpoint 820px                                             | @s17                                 |
      | tratar un `<a>` de nav SIN href como si tuviera href (leer el grupo de un match nulo) | @s21 (a sin href → 0 anclas, sin lanzar) |
      | contar un `id=""` (vacío) como destino de anclaje válido                            | @s22 (# a id="" → ancla muerta)      |
      | tratar como navegable una `<section>` cuyo aria-labelledby NO resuelve a un heading  | @s23 (gemelo simétrico de @s20)      |
      | vaciar el nombre de una regla o alterar el formato de `describir()`                  | @s24 (texto exacto de cada regla)    |
      | cambiar el cuantificador de las guardas de vacuidad (`.some` → `.every`)             | @s25 (artefacto multi-página mixto)  |
      | estrechar la tolerancia de espacios alrededor del `=` en href/id/aria-labelledby     | @s26 (HTML válido con espacios)      |
      | vaciar el `id` que asocia el botón del menú con su lista (aria-controls ↔ id)        | @s27 (MenuNavegacion)                |

    # 🔴 EL CONJUNTO EXACTO DE MUTANTES **NO SE PUEDE PREDECIR**: el fichero de F-06 NO EXISTE
    # todavía; otra implementación tendrá otro conjunto. **SE MIDE CUANDO EXISTA, NO ANTES** (la
    # lección de F-05 con «exactamente dos equivalentes» sería una PREDICCIÓN, no una medición). Este
    # escenario nombra sabotajes de COMPORTAMIENTO, no mutadores concretos de Stryker. Si al medir un
    # mutante RESISTE, el `tdd_craftsman` ESCALA AL HUMANO —NO lo excluye, NO baja el umbral, NO lo
    # declara equivalente por su cuenta— (A-23, umbral 1.0, 0 exclusiones). Cubre el acceptance @5:
    # «mutar el breakpoint o el predicado de nav rompe un test».
    # ⚠️ Si la extracción de anclas/ids usa un regex con anclas `^`/`$`, se mutan → hará falta un
    # escenario de extracción (en F-03 el `^` fue el ÚNICO superviviente real del repo). Se añadirá
    # CON SU FILA cuando la mutación lo revele, como en F-05 (contrato de menos, no código de más).
    # ✅ MEDIDO EL 2026-07-18: el fichero YA EXISTE y se midió (135/156, 21 supervivientes reales). Honrando
    # esta misma nota, se han añadido las SEIS filas de abajo (grupos A–F + MenuNavegacion), cada una con
    # el escenario nuevo que la mata (@s21..@s27). Ver la ampliación al final del fichero.

  # =============================================================================================
  # 🔴 AMPLIACIÓN DEL CONTRATO — APROBADA POR LA PUERTA HUMANA EL 2026-07-18 (los 21 supervivientes)
  # =============================================================================================
  # Tras la primera tanda de mutación sobre los ficheros ya implementados, el humano APROBÓ (2026-07-18)
  # AMPLIAR el contrato. Precedente EXACTO de F-01 (la fila `600 123 456` de @s5) y F-05 (+3 escenarios):
  # **la mutación no encontró código de más, encontró CONTRATO DE MENOS.** Las guardas defensivas y las
  # extracciones son CORRECTAS y SE QUEDAN (sin ellas la puerta revienta o miente); lo que faltaban eran
  # los escenarios que las EXIJAN. La producción NO se toca. Los 6 grupos + 1 del informe
  # (`progress/mutation_header_nav_footer.md` §3/§4) → un escenario cada uno:
  #   · @s21 ← Grupo A: `<a>` de nav SIN href                       (mata `puerta-anclas.ts:51`,`:53`).
  #   · @s22 ← Grupo B: `id=""` no cuenta como destino               (mata `:71` x3; gemelo del `:58` de F-05).
  #   · @s23 ← Grupo C: `<section>` cuyo aria-labelledby no resuelve  (mata `:89` x2,`:91`; gemelo de @s20).
  #   · @s24 ← Grupo D: TEXTO EXACTO de `describir()` (ambas reglas)  (mata `:30`,`:31`,`:127`,`:143` x2).
  #   · @s25 ← Grupo E: artefacto MULTI-PÁGINA mixto → exit 0         (mata `:215`,`:227`; `.some`→`.every`).
  #   · @s26 ← Grupo F: espacios alrededor del `=`                    (mata `:36` x2,`:67`,`:82` x2).
  #   · @s27 ← MenuNavegacion: `aria-controls` del botón ↔ `id` lista (mata `MenuNavegacion.tsx:5`).
  # 🔴 DECISIÓN 2 DEL HUMANO (2026-07-18), para el Grupo F: el espaciado alrededor del `=` es OPCIONAL en
  #    HTML válido, así que TOLERARLO es CORRECTO — `<a href = "#servicios">` DEBE reconocerse. El
  #    comentario pasa de promesa sin puerta a HECHO VIGILADO, exactamente como se decidió para el `:58`
  #    de F-05. Las guardas del regex `\s*=\s*` se QUEDAN; se añade el escenario que las exige.
  # 🔴 GRUPO E — SÍ ES REPRESENTABLE HOY. La puerta de anclas NO consulta `RUTAS_ESPERADAS` (['/'] es de
  #    la anti-404 de F-04 [V: no se importa en puerta-anclas.ts]); inspecciona lo que `listarHtml()`
  #    devuelva (`tools/puerta-anclas.ts:30-37`). Un artefacto de DOS páginas es un fixture (fake
  #    `ArtefactoDeProduccion`), IGUAL que @s6/@s7 usan uno de 0/1 páginas. Que un `dist/` REAL traiga hoy
  #    una sola ruta es deuda de F-16 y el caveat [NV]-hasta-el-primer-build que ya cargan @s6..@s9; NO
  #    impide expresar ni medir el escenario contra el fixture. No se finge nada — se declara y se mide.

  @s21
  Scenario: un <a> de la nav SIN atributo href no aporta ninguna ancla y NO hace reventar la inspección
    Given el HTML CRUDO de la ruta "/" con una nav que contiene un <a href="#servicios-titulo"> y un <a> SIN atributo href (p. ej. el logo de la marca), y una página con un elemento id "servicios-titulo"
    When se inspecciona esa página con la puerta de anclas vivas
    Then la inspección termina SIN lanzar ninguna excepción
    And la lista de violaciones está vacía
    And el <a> sin href NO se cuenta como ancla ni genera una violación de ancla muerta
    # 🔴 GRUPO A (mata `puerta-anclas.ts:51` OptionalChaining `?.[1]` y `:53` ConditionalExpression
    # `href !== undefined && …`). Hoy TODA `<a>` de los fixtures lleva `href`, así que
    # `ATRIBUTO_HREF.exec(...)?.[1]` nunca devuelve `undefined` y la guarda `href !== undefined` nunca
    # se ejerce. Con los mutantes, un `<a>` sin href provoca `null[1]` o `undefined.startsWith` →
    # TypeError. Una `<a>` sin `href` es HTML legítimo (un ancla de nombre, un logo, un botón-enlace): la
    # extracción DEBE ignorarla sin reventar. La aserción «no lanza» es MEDIBLE: la llamada RETORNA en
    # vez de propagar la excepción.

  @s22
  Scenario: un id="" (vacío) NO cuenta como destino de anclaje — un href="#" es un ancla muerta
    Given el HTML CRUDO de la ruta "/" con una nav que enlaza "#" (un <a href="#">) y una página que contiene un elemento con id="" (vacío) y NINGÚN otro id
    When se inspecciona esa página con la puerta de anclas vivas
    Then hay exactamente 1 violación de ancla muerta
    And la violación declara la ruta "/", el ancla "#" y el id "" (vacío)
    # 🔴 GRUPO B (mata `puerta-anclas.ts:71` x3: el `.filter((id) => id !== '')` — MethodExpression,
    # ConditionalExpression y StringLiteral). El comentario de `:64-66` PROMETE que un `id=""` se
    # descarta, pero NINGÚN test lo fija — promesa sin puerta, IDÉNTICO al `:58` de F-05. Un `href="#"`
    # apunta al id "" (`"#".slice(1) === ""`); como el `id=""` de la página NO cuenta como destino, ese
    # `#` es un ancla muerta. Con el filtro mutado (quitado, `=> true`, o comparado con otra cadena), el
    # `id=""` SÍ entraría en el conjunto y `#` resolvería → 0 violaciones. El esperado (ancla "#",
    # id "") se escribe A MANO.

  @s23
  Scenario Outline: una <section> cuyo aria-labelledby NO resuelve a un heading real NO es navegable — sin violación de inalcanzable y sin lanzar (GEMELO simétrico de @s20)
    Given el HTML CRUDO de la ruta "/" con "<sección>" y una nav que NO enlaza a esa sección
    When se inspecciona esa página con la puerta de anclas vivas
    Then la inspección termina SIN lanzar ninguna excepción
    And la lista de violaciones NO contiene ninguna violación de «sección navegable inalcanzable» para esa sección

    Examples:
      | sección                                                                                                 | por qué                                                                                                     |
      | una <section> SIN atributo aria-labelledby                                                              | sin aria-labelledby ningún heading la titula: no es navegable; leer el grupo de un match NULO NO debe lanzar |
      | una <section aria-labelledby="fantasma"> cuando NINGÚN heading (h1…h6) de la página tiene id "fantasma" | el aria-labelledby apunta a un id que no es un heading real → no resuelve → no es navegable                   |

    # 🔴 GRUPO C (mata `puerta-anclas.ts:89:24` OptionalChaining y `:91:9` ConditionalExpression; y CUBRE
    # el `:89:69` NoCoverage del `?? ''`). @s20 prueba el caso simétrico (un heading suelto que ninguna
    # `<section>` referencia → no navegable); AQUÍ falta el gemelo: la SECCIÓN cuya referencia no resuelve.
    # Fila 1: sin aria-labelledby, `ATRIBUTO_LABELLEDBY.exec(...)` da null → `?.[1]` mutado a `[1]`
    # revienta; lo correcto → `undefined ?? '' → ''`, no navegable, sin lanzar. Fila 2: referencia a un id
    # que no es heading → `headings.has(referencia)` es false; el mutante `if (true)` la marcaría navegable
    # y acusaría 1 inalcanzable → MUERE. Es la línea que DISTINGUE navegable=sección-con-heading-real de
    # navegable=cualquier-sección.
    # ⚠️ NOTA HONESTA para el TDD y el mutation_tester: la fila 1 CUBRE el `:89:69` (`?? ''` → `?? "Stryker
    # was here!"`, hoy NoCoverage), pero su ÚNICO input distinguidor sería un heading con id igual al
    # literal de reemplazo de Stryker (porque `idsDeHeadings` filtra `''`, así que `''` y ese literal dan
    # el MISMO `headings.has(...) === false`). Si al REMEDIR resiste, se ESCALA al humano (umbral 1.0, 0
    # exclusiones) — NO se fabrica un fixture atado a la cadena interna de Stryker (sería tautología).

  @s24
  Scenario Outline: la línea que la puerta acusa para cada regla tiene el TEXTO EXACTO — nombre de la regla Y formato ancla/id
    Given el HTML CRUDO de la ruta "/" con "<fixture mínimo>", que produce EXACTAMENTE una violación de tipo "<tipo>"
    When se inspecciona esa página con la puerta de anclas vivas y se DESCRIBE con describir() su única violación
    Then la línea descrita es, carácter a carácter, «<línea exacta>»

    Examples:
      | tipo         | fixture mínimo                                                                                            | línea exacta                                                                |
      | ancla muerta | una nav con <a href="#facial"> y una página SIN ningún elemento con id "facial"                           | / — ancla de la nav sin destino en la página: ancla "#facial" → id "facial" |
      | inalcanzable | una <section aria-labelledby="faq"> con <h2 id="faq"> como único heading, y una nav SIN anclas muertas que NO enlaza "#faq" | / — sección navegable inalcanzable desde la nav: id "faq"                    |

    # 🔴 GRUPO D (mata `:30` y `:31` —los literales REGLA_ANCLA_MUERTA/REGLA_INALCANZABLE—, `:127`
    # —el `ancla: ''` de la violación inalcanzable— y `:143` x2 —el `violacion.ancla === ''` que ELIGE el
    # formato—). @s5 comprueba que CADA violación nombra ruta/ancla/id y qué-falta y que el informe es
    # determinista, pero NO fija el LITERAL: un `Then` que solo cuenta líneas es CIEGO a las mutaciones de
    # valor (la lección de @s24 de F-05, que mataba CERO). Aquí la inspección PASA POR EL PIPELINE
    # (`inspeccionarAnclas` → `describir`), así que la fila «ancla muerta» exige el literal REGLA de `:30`
    # y el formato `ancla "x" → id "y"`; la fila «inalcanzable» exige REGLA de `:31`, el `ancla: ''` de
    # `:127` y la rama `id "y"` de `:143` (el `ancla` vacío ES la condición que selecciona ese formato).
    # 🔴 ANTI-TAUTOLOGÍA (regla dura): las dos «línea exacta» se escriben A MANO; el fixture recorre las
    # constantes REGLA_* DE PRODUCCIÓN (para que mutarlas a '' cambie la SALIDA y mueran `:30`/`:31`),
    # pero el ORÁCULO —el literal esperado— es a mano; JAMÁS se importan REGLA_ANCLA_MUERTA/REGLA_INALCANZABLE
    # para compararse contra sí mismas (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`). El `—`
    # (raya) y el `→` (flecha) son EXACTAMENTE los de `puerta-anclas.ts:147,145`.

  @s25
  Scenario: un artefacto MULTI-PÁGINA mixto SIN violaciones termina en exit 0 — las guardas de vacuidad miran el CONJUNTO, no cada página (.some, no .every)
    Given un artefacto de producción con DOS páginas HTML: la ruta "/" con una nav cuyas anclas resuelven y una sección navegable enlazada por la nav, y la ruta "/otra" SIN ninguna ancla de nav y SIN ninguna sección navegable
    And ninguna de las dos páginas produce violaciones de anclas
    When se ejecuta la puerta de anclas vivas sobre ese artefacto
    Then el código de salida es 0
    And la salida NO declara que no se inspeccionara ningún ancla de la nav
    And la salida NO declara que no se inspeccionara ninguna sección navegable
    # 🔴 GRUPO E (mata `:215` y `:227`, `.some` → `.every` en las DOS guardas de vacuidad). @s7 y @s19
    # usan UNA sola página vacía, donde `.some` y `.every` dan EL MISMO veredicto (ambos false → guarda
    # dispara) y NO se distinguen. Solo un artefacto MIXTO los separa: con `.some`, la página "/" (con
    # anclas y sección) basta para que la puerta sepa que SÍ inspeccionó → exit 0; con `.every`, la
    # página "/otra" (0 anclas, 0 secciones) haría fallar las guardas y la puerta gritaría vacuidad
    # habiendo inspeccionado de verdad. (El comentario de `:212-214` ya neutralizó el `> 0` → `>= 0`;
    # ESTE es OTRO mutante, sobre el CUANTIFICADOR.)
    # ✅ REPRESENTABLE HOY: la puerta de anclas NO consulta `RUTAS_ESPERADAS`; inspecciona lo que
    # `listarHtml()` devuelva. El artefacto de dos páginas es un fixture (fake `ArtefactoDeProduccion`),
    # como el de 0/1 páginas de @s6/@s7. Que un `dist/` REAL traiga hoy una sola ruta es deuda de F-16 y el
    # caveat [NV]-hasta-el-primer-build de @s6..@s9; no impide expresar ni medir el escenario.

  @s26
  Scenario Outline: un atributo con ESPACIOS alrededor del "=" (HTML válido) se reconoce igual que sin espacios — href, id y aria-labelledby
    Given el HTML CRUDO de la ruta "/" con "<fixture con espacios>" (el "=" del atributo va rodeado de espacios, HTML válido)
    When se inspecciona esa página con la puerta de anclas vivas
    Then las violaciones de la inspección son EXACTAMENTE «<violaciones esperadas>»

    Examples:
      | atributo        | fixture con espacios                                                                                        | violaciones esperadas                                                                              |
      | href            | una nav con <a href = "#facial"> y una página SIN ningún elemento con id "facial"                            | 1 violación de ancla muerta: ancla "#facial" → id "facial"                                          |
      | id              | una nav con <a href="#servicios-titulo"> y un <p id = "servicios-titulo"> en la página (sin secciones)       | lista vacía — el id con espacios se reconoce y el ancla "#servicios-titulo" RESUELVE                |
      | aria-labelledby | una <section aria-labelledby = "faq"> con un <h2 id="faq"> como único heading, y una nav que NO enlaza "#faq" | 1 violación de sección inalcanzable: id "faq" — la sección con aria-labelledby espaciado SÍ es navegable |

    # 🔴 GRUPO F (el más grave; mata `:36` x2 —ATRIBUTO_HREF—, `:67` —ATRIBUTO_ID— y `:82` x2
    # —ATRIBUTO_LABELLEDBY—, todas `Regex` que estrechan el `\s*=\s*` a `\S*=\s*` o `\s*=\S*`). Los tres
    # regex TOLERAN el espaciado y NINGÚN fixture lo ejerce. **DECISIÓN 2 DEL HUMANO (2026-07-18):** el
    # espacio alrededor del `=` es OPCIONAL en HTML válido, así que tolerarlo es CORRECTO — `href = "#…"`
    # DEBE reconocerse. El comentario pasa a HECHO VIGILADO, EXACTAMENTE como el `:58` de F-05. AVISO (del
    # informe): los mutantes solo se distinguen CON espacios; sin espacios son indistinguibles → cada
    # fixture LLEVA el espacio. Cada fila AÍSLA un atributo y su observable es DISTINTO (un fixture único
    # «0 violaciones» ENMASCARARÍA mutantes): href reconocido → 1 ancla muerta; id reconocido → el ancla
    # RESUELVE (lista vacía); aria-labelledby reconocido → la sección es navegable y, sin enlace, 1
    # inalcanzable. Los esperados se escriben A MANO.

  @s27
  Scenario: el botón del menú móvil declara aria-controls igual al id de su lista, y ese id es exactamente "menu-navegacion" — la asociación a11y botón↔lista
    Given el menú de navegación renderizado con su botón disparador y su lista <ul>
    When se consulta el botón por su rol y su nombre accesible (nunca por clase CSS)
    Then el atributo "aria-controls" del botón es EXACTAMENTE igual al atributo "id" del <ul> de la navegación
    And ese identificador es exactamente el literal "menu-navegacion", escrito A MANO en el test
    And ese identificador NO está vacío
    # 🔴 MenuNavegacion (mata `MenuNavegacion.tsx:5`, `const ID_LISTA = 'menu-navegacion'` → `''`). Con
    # `''`, el botón queda con `aria-controls=""` y el `<ul>` con `id=""`: siguen siendo IGUALES (ambos
    # ''), así que una aserción de SOLA igualdad los deja pasar — por eso el `Then` exige ADEMÁS que el
    # identificador sea EXACTAMENTE "menu-navegacion" y NO vacío: con el mutante el botón deja de anunciar
    # qué lista controla (el disparador ya no la asocia) y `cabecera.test.tsx` (que solo comprueba el
    # toggle de `aria-expanded`) no se entera.
    # 🔴 ANTI-TAUTOLOGÍA: el literal "menu-navegacion" se escribe A MANO; NUNCA se importa `ID_LISTA` para
    # compararse contra sí mismo (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`).
