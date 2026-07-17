# Contrato de la feature 6 (`header_nav_footer`) de feature_list.json.
# Destilado de project-spec.md → «### Feature 6: header_nav_footer — la cabecera, la nav completa,
# el pie, y la PUERTA DE ANCLAS VIVAS que hoy no existe».
#
# =============================================================================================
# ⏸⏸ **ESTE CONTRATO NO ESTÁ APROBADO. B-1..B-7 ESPERAN LA PUERTA HUMANA.** ⏸⏸
#    A diferencia de F-05 —cuya cabecera ya lleva la marca ✅ porque el humano cerró A-23/A-24/A-27/
#    A-28— aquí **NO HA HABIDO PUERTA**. El `craftsman_lead` **propone**; NO cierra ninguna de las
#    SIETE preguntas abiertas. **NADA de este fichero se implementa hasta que el humano apruebe.**
#    Precedente de proceso: F-05 (donde A-23 reescribió los acceptance 2 y 5 EN LA PUERTA).
# =============================================================================================
# 🔴 A-23 REDUX — TRES CRITERIOS DE ACEPTACIÓN DE `feature_list.json` §6 NO SE DESTILAN TAL CUAL.
#    La verificación previa (`progress/f06_verificacion_previa.md`, workflow adversarial, ~1,77 M
#    tokens, 8 afirmaciones × verificar+refutar: **1 refutada de raíz, 6 matizadas, 1 confirmada**)
#    demostró que @1, @2 y @4 son **INSATISFACIBLE / FALSO / INSOSTENIBLE**, y que la `puerta_legal`
#    **roza el AAA**. Este contrato destila **LA PROPUESTA DEL LEAD**, no los criterios originales:
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
#        OPCIONAL y [I], y no entra en el acceptance salvo decisión humana.
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
# El humano DELEGÓ la fase en el `craftsman_lead` **hasta esta puerta de aprobación**, que sigue EN
# PIE. Quien hizo de adversario en lugar del humano fue la verificación previa. **Eso NO sustituye a
# la puerta.**
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
# 🔴 EL MENÚ MÓVIL — LOS ESCENARIOS @s15/@s16/@s17 DESTILAN LA PROPUESTA DEL LEAD (B-5, B-6, B-3)
# =============================================================================================
# Hoy `src/` NO tiene ni `useIsMobile`, ni `matchMedia`, ni `useSyncExternalStore`, ni una sola
# `@media` [V]; el prototipo resuelve el responsive con `flex-wrap: wrap`. La **primera decisión de
# F-06 es una BIFURCACIÓN (B-5)**, y de ella cuelgan B-3 y B-6. **PROPUESTA DEL LEAD, PENDIENTE DE
# PUERTA:** CSS puro para el eje responsive + estado abierto/cerrado en **atributo consultable**
# (`aria-expanded`), SIN Radix (`radix-ui` tiene CERO usos en `src/` [V] → SALE de `dependencies`).
# 🔴 **EL HUMANO PUEDE CAMBIAR LA MECÁNICA (Radix, o sin menú móvil):** en ese caso estos tres
# escenarios se reescriben. Si elige Radix, DEBE decidir `Portal` sí/no —con `Portal`, el menú
# **emite CERO en prerender** (125 bytes, solo el `<button>` trigger [V, `renderToString`]) y
# dejaría las puertas de anclas **CIEGAS** (no se rompe: MIENTE POR OMISIÓN) → @s16 pasa a ser el
# escenario OBLIGATORIO que asevera los enlaces del menú en el HTML de `dist/`—.
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
# 🔴 LO QUE F-06 NO CONSTRUYE, Y LOS HUÉRFANOS (B-7)
# =============================================================================================
# F-06 **NO construye secciones**: su alcance es **cabecera + nav + pie + la puerta de anclas vivas
# + el `scroll-padding-top` derivado**. Las secciones (`top`, `unas`, `faq`, …) las montan
# F-07/F-09/F-15/etc.; la nav crece enlazando a las que van existiendo, y la puerta impide que
# enlace a las que aún no. **`destacados` y `ofertas` son HUÉRFANOS** —0 features los construyen
# [V]—: la igualdad de conjuntos de B-4 los deja fuera solo; si deben registrarse como features o en
# `no_se_construyen` es **B-7, PENDIENTE DE PUERTA**.
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
    # ⏸ **REGLA DE «SECCIÓN NAVEGABLE» — PROPUESTA MEDIDA, PENDIENTE DE PUERTA (parte de B-4). El
    # `craftsman_lead` PROPONE; NO CIERRA:** navegable = una `<section>` con `aria-labelledby` que
    # RESUELVE a un heading real (`h1`…`h6`); su `id` de anclaje es el del heading. Es **coherente con
    # `REGLA_SECTION` de F-04** —`'section sin aria-labelledby a un heading real'`, `puerta-cascaron.ts:118`;
    # el bucle de `:507-519` acusa toda `<section>` cuyo `aria-labelledby` no resuelva a un id de
    # `idsDeHeadings` (`:505,:131`)—, así que la regla es DECIDIBLE YA en la puerta, sin depender de un
    # `dist/` futuro desconocido. Antes esta nota decía «[NV], la FIJA el TDD»: era demasiado débil, y
    # la revisión adversarial lo cazó —los dos Examples de arriba COLAPSAN sobre la MISMA forma del DOM
    # (el id del `<h2>` == destino del `aria-labelledby`) y NINGUNO distingue una derivación de otra, de
    # modo que un mutante «navegable = cualquier id» SOBREVIVÍA a @s1/@s2/@s3—. **@s20 añade el Example
    # que la DISTINGUE** (un heading con id que NINGUNA `<section>` referencia → NO cuenta como
    # inalcanzable). Si el humano prefiere otra derivación en la puerta, @s3/@s20 se reescriben.

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
    # NINGUNA `<section>` lo referencia: bajo la regla PROPUESTA (coherente con `REGLA_SECTION` de
    # F-04) NO es navegable → 0 violaciones de inalcanzable. Un mutante «navegable = cualquier id»
    # —que SOBREVIVE a @s1/@s2/@s3— aquí acusaría 1 y MUERE (@s18, fila añadida). Sin este escenario la
    # mitad «ni una de menos» de B-4 queda anclada TAUTOLÓGICAMENTE a la implementación.
    # ⏸ PENDIENTE DE PUERTA con @s3 (parte de B-4): si el humano fija otra derivación, se reescribe.

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
    # aprobación es su única defensa. Capa 2 (afinado JS con `ResizeObserver`) es OPCIONAL, [I], y
    # NO entra en el acceptance salvo que el humano lo decida en B-2.

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
  # El menú móvil — PROPUESTA DEL LEAD (B-5/B-6/B-3), PENDIENTE DE PUERTA. Puede cambiar la mecánica.
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
    # ⏸ **PROPUESTA (B-5/B-6):** CSS puro + `aria-expanded`, SIN Radix. Si el humano elige Radix o
    # «sin menú móvil», la MECÁNICA cambia y este escenario se reescribe.

  @s16
  Scenario: el HTML CRUDO de dist/ hornea el menú «cerrado» — estado seguro de primera carga (SSR)
    Given el HTML CRUDO prerenderizado de la ruta "/" del artefacto de producción
    When se inspecciona el botón del menú sin ejecutar JavaScript
    Then el botón declara "aria-expanded" con el valor "false"
    And los enlaces de la navegación están presentes en el HTML horneado (no dependen de la hidratación)
    # 🔴 SSR-SAFE, SOBRE LOS BYTES DE `dist/`, NO EN JSDOM (I-8). El estado horneado por SSR es
    # «cerrado» (el estado seguro de primera carga). La segunda aserción es la que MATA por adelantado
    # la trampa de Radix: si el humano eligiera `Dialog.Portal`, el menú emite CERO en prerender —125
    # bytes, solo el `<button>` trigger [V, `renderToString`]— y los enlaces NO estarían en el HTML,
    # dejando la puerta de anclas CIEGA (no se rompe: MIENTE POR OMISIÓN). Este escenario los exige en
    # el HTML de `dist/`.
    # ⏸ **PROPUESTA (B-5/B-6):** aplica si hay menú móvil con botón. Si el humano elige «sin menú
    # móvil» (todo por CSS, sin botón), la aserción de `aria-expanded` se retira y queda solo la de
    # los enlaces horneados.

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
    # ⏸ **PROPUESTA (B-3/B-5):** aplica SOLO si hay menú móvil. Si el humano elige «sin menú», no hay
    # breakpoint y este escenario NO aplica.

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
