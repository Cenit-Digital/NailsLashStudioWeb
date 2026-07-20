# Contrato de la feature `equipo_reservas` — v2 (REESCRITURA COMPLETA del borrador de 12 escenarios).
#
# =============================================================================================
# 🔧 POR QUÉ SE REESCRIBE ENTERO (el borrador v1 estaba DESACTUALIZADO y MENTÍA)
# =============================================================================================
#   · BLOQUEANTE v1 @s2: afirmaba que las especialidades de Nerea son «Facial» y «Pestañas».
#     ESTE SALÓN NO OFRECE FACIAL. Las categorías REALES son Uñas · Pestañas · Cejas (así lo
#     declara el docblock de `src/lib/demo/catalogo-demo.ts:5-6` y así lo aplicó `ofertas-demo.ts`
#     al sustituir «Martes de Facial» por una oferta de cejas). «Facial» y «Depilación» son del
#     prototipo genérico (`salon-data.js` → team), NO de este negocio → PROHIBIDOS (@s5, @s6).
#   · ⚠️ MATIZ DE HONESTIDAD (revisión adversarial, código LEÍDO — v2 citaba esta fuente como si
#     dijera lo contrario de lo que dice su DATO). `catalogo-demo.ts` HOY SE CONTRADICE A SÍ MISMO:
#     su docblock (L5-6) dice que «Facial»/«Depilación» NO existen en este salón, pero su
#     `CATALOGO_DEMO` SIGUE PUBLICANDO las categorías `eyebrow: 'Servicio Facial'` (L42) y
#     `eyebrow: 'Servicio de Depilación'` (L57), con precios y botones «Reservar Facial» /
#     «Reservar Depilación», VIVAS en la home. Es decir: el catálogo VENDE hoy dos servicios que
#     este contrato prohíbe atribuir a nadie del equipo. ESTE CONTRATO NO ARREGLA ESO (es F-09, no
#     es esta feature) y por eso @s6 está ACOTADO al fragmento `#equipo-titulo`: si fuera de página
#     entera nacería ROJO por culpa del catálogo, sin que la sección de equipo tuviera culpa
#     alguna. → SE ESCALA AL HUMANO como decisión D6: el desajuste catálogo↔equipo es visible en la
#     demo (el CEO puede pulsar «Reservar Facial» y luego no encontrar quien lo haga).
#   · v1 NO cubría: el 7º enlace de la nav (sin él la puerta 5 declara la sección INALCANZABLE y
#     el build MUERE), el hueco de foto sin `ph-woman` (puerta 2), la leyenda visible de datos de
#     ejemplo, el HTML horneado SIN fechas (SSG), y —el fallo que el CEO vería— que EL SÁBADO EL
#     SALÓN CIERRA A LAS 14:00, así que 16:00 / 17:30 / 19:00 NO se pueden ofrecer (@s13).
#   · v1 clavaba fechas fijas («miércoles 22») sin anclar el reloj: irreproducible. v2 ancla el
#     reloj a un jueves concreto y deriva los 6 días A MANO en la tabla (@s10).
#
# =============================================================================================
# FUENTES LEÍDAS (no inventadas)
# =============================================================================================
#   · `Opcion-1-Rosa.dc.html` L162-246 — la sección `#equipo` del prototipo (estructura, copy,
#     estados: notBooked / showTimes / canBook / booked, y el bloque de reseña con ← →).
#   · `salon-data.js` → `team` (7 personas, orden), `timeSlots` (6 franjas), `reviewPool` (10 reseñas).
#     De `team` se conservan NOMBRES y ORDEN; los ROLES/ESPECIALIDADES se CORRIGEN al catálogo real.
#   · `progress/spec_visual_equipo.md` — los valores CSS literales ya mapeados a los tokens del repo.
#     El `tdd_craftsman` NO calcula estilos a ojo: los lee de ahí. Ningún escenario de ESTE fichero
#     asevera por clase CSS (regla anti-clase-CSS del repo: `css:false` en `vitest.config.ts`).
#   · `src/lib/horario.ts` (F-10, done) — L-V 10:00–20:00 · SÁBADO 10:00–14:00 · DOMINGO CERRADO.
#     Es la FUENTE de la restricción de @s13 y de por qué los domingos se saltan (@s10).
#   · `src/components/Reserva.tsx` — el patrón ya vivo del mini-calendario: `DOW` en minúsculas
#     («vie», «sáb»), los días en `useEffect` (cliente), `aria-pressed` en los chips.
#   · `src/components/Ofertas.tsx` + `src/lib/demo/ofertas-demo.ts` — el patrón de datos demo con
#     leyenda visible (`LEYENDA_OFERTAS`) que ESTE contrato replica (@s8).
#   · `src/components/MenuNavegacion.tsx` — los 6 enlaces actuales; @s2 añade el 7º.
#   · `features/contacto.feature`, `features/horario.feature` — estilo de escritura del repo.
#
# =============================================================================================
# 🔴 LAS 5 PUERTAS DE `pnpm build` QUE ESTA FEATURE TOCA (si se rompe una, el build muere)
# =============================================================================================
#   1. CASCARÓN — `<section aria-labelledby="equipo-titulo">` necesita un `<h2 id="equipo-titulo">`
#      REAL en la página. Los nombres de las profesionales son `<h3>`. NINGÚN `<h1>` nuevo: sigue
#      habiendo EXACTAMENTE UNO en la home (el del hero) → @s1, @s4.
#   2. PLACEHOLDERS — el hueco de foto NO puede emitir el literal `ph-woman` ni ningún otro de la
#      lista prohibida. Es un `<div aria-hidden="true">` decorativo, SIN `<img src>` → @s7.
#   3. CONTRASTE — `MINIMO_DE_PARES` en `src/lib/puerta-contraste.ts` es un literal A MANO. Si la
#      sección introduce un par de colores NUEVO, hay que añadirlo a la matriz Y subir el literal
#      a mano. La spec visual ya obliga a `--accent-dark` (nunca `--accent`) en texto pequeño → @s2.
#   4. TERCEROS — cero subrecursos externos. El hueco de foto no carga nada (@s7).
#   5. ANCLAS — IGUALDAD DE CONJUNTOS entre los `href="#…"` de la `<nav>` y los ids de las secciones
#      navegables. 🔴 SIN el 7º enlace `<a href="#equipo-titulo">Equipo</a>` la sección es una
#      sección navegable HUÉRFANA y EL BUILD MUERE. NO es opcional → @s2.
#
# =============================================================================================
# 🔴 DÓNDE MUERDE LA MUTACIÓN (I-6, umbral 1.0) — y dónde NO hay nada que morder
# =============================================================================================
#   · EL NÚCLEO MUTABLE es la ARITMÉTICA, y vive en lógica PURA extraída del componente:
#       (a) el módulo circular del carrusel `((i % n) + n) % n` → @s21, @s22 son los que lo matan.
#           Un `i % n` a secas devuelve NEGATIVO al retroceder desde 0 → hueco vacío: ESE es el
#           mutante que @s22 caza. Sin @s22 el carrusel «funciona» y está roto.
#       (b) la generación de los 6 días saltando domingos, con el reloj INYECTADO → @s10.
#       (c) el filtro de franjas por día contra el horario de F-10 → @s12, @s13.
#     Las tres son funciones PURAS: se testean por valor, se mutan, y el componente solo las CABLEA.
#   · EL ESTADO VA EN ATRIBUTO CONSULTABLE (`aria-pressed`, `disabled`), JAMÁS en un `className`
#     condicional: MEDIDO en este repo (cabecera.test.tsx @s15) que `className={c ? a : b}` genera
#     5 mutantes y SOBREVIVEN LOS 5 → la feature no cerraría nunca → @s24, @s15.
#   · NO-MUTABLE, declarado: todo el SCSS de la sección (Stryker no ve SCSS) y la estructura JSX.
#     Lo visual se asevera leyendo los BYTES del `.module.scss` (patrón `contacto-estilos.test.ts`)
#     contra `progress/spec_visual_equipo.md`, y con la puerta humana. NUNCA con `toHaveClass`.
#
# =============================================================================================
# ANTI-TAUTOLOGÍA (regla dura del arnés)
# =============================================================================================
# TODO literal esperado se escribe A MANO en el test: los 7 nombres, los 7 roles, las 14
# especialidades, las 6 franjas «10:00»…«19:00», los 6 días «vie 17»…«jue 23», el copy del botón,
# el mensaje de confirmación y la leyenda. ❌ PROHIBIDO importar `EQUIPO_DEMO`, `LEYENDA_EQUIPO` ni
# ninguna constante de producción COMO VALOR ESPERADO (precedente WebEmpresa: el doble atado al
# SÍMBOLO en vez de al LITERAL fue el primer mutante superviviente).
# ❌ PROHIBIDO ADEMÁS: emitir «Facial» o «Depilación» (@s6) · llamar a `new Date()` sin inyectar el
# reloj en la función pura de días (@s10) · hornear fechas en el HTML de `dist/` (@s9) · ofrecer
# 16:00/17:30/19:00 un sábado (@s13) · usar el glifo «←» / «→» como nombre accesible (@s25) ·
# aseverar por clase CSS o con `toHaveClass` (todo el fichero).
#
# =============================================================================================
# 🚪 DECISIONES QUE VAN A LA PUERTA HUMANA (el autor PROPONE, el humano DECIDE)
# =============================================================================================
#   D1 — ⚠️ LEGAL, LA MÁS SERIA. `feature_list.json` §18 (`equipo`) está en `status: blocked` por
#        LO 1/1982 art. 2.3 (derechos de imagen) y RGPD art. 7.3, y exige «datos externalizados,
#        NUNCA hardcodeados» + «ninguna foto generada por IA se presenta como profesional real».
#        ESTA feature construye la sección con SIETE PERSONAS DE EJEMPLO. Se cumple lo cumplible:
#        los datos viven FUERA del JSX (`src/lib/demo/equipo-demo.ts`, retirables sin desplegar
#        código), NO hay foto de ninguna persona (hueco decorativo, @s7) y una LEYENDA VISIBLE
#        declara que son perfiles de ejemplo (@s8). AUN ASÍ: publicar nombres inventados como
#        plantilla del salón es una decisión del cliente, no del arnés. → RECOMENDADO: aprobar
#        SOLO para la DEMO, con `bloqueada_para_publicar` (nombres, roles y fotos reales +
#        consentimiento firmado de cada profesional).
#   D2 — Copy exacto de la leyenda (@s8). PROPUESTO: «Equipo y reseñas de ejemplo · perfiles de
#        muestra, pendientes de confirmar con el salón». Si el humano lo cambia, cambia @s8.
#   D3 — Copy exacto del botón y del mensaje de confirmación (@s15, @s16, @s17). PROPUESTO:
#        «Elige día y hora» / «Reservar · mié 22 · 16:00» / «Cita con Lucía el mié 22 a las 16:00»
#        + subtexto «Te confirmaremos por WhatsApp.» (literal del prototipo, L225).
#   D4 — ¿La reserva confirmada COMPONE un `waHref` real (como hace `Reserva.tsx`) o se queda en un
#        mensaje local de demo? → RECOMENDADO: mensaje LOCAL en esta feature (el flujo real de
#        WhatsApp es F-13); el subtexto ya anuncia que la confirmación llega por WhatsApp. Si el
#        humano quiere el enlace real, es un escenario NUEVO.
#   D5 — Rotación de reseñas: ¿cuántas por tarjeta? PROPUESTO: al menos 3 y que dos tarjetas
#        contiguas no arranquen con la misma (@s20), para que la demo no parezca copiada.
#   D6 — ⚠️ DESAJUSTE CATÁLOGO↔EQUIPO (revisión adversarial, [V] código leído). `CATALOGO_DEMO`
#        publica HOY «Servicio Facial» y «Servicio de Depilación» con precios y botones «Reservar
#        Facial»/«Reservar Depilación», mientras ESTE contrato prohíbe que ninguna profesional los
#        ofrezca. La demo quedaría vendiendo dos servicios sin nadie que los preste. NO se arregla
#        aquí (es F-09). → RECOMENDADO: retirar esas dos categorías del catálogo demo ANTES de
#        enseñar la web, en un cambio propio y con su propio contrato. Si el humano prefiere
#        dejarlas, entonces la decisión REAL es la contraria (el salón SÍ los ofrece) y hay que
#        revisar la tabla de @s5. Las dos opciones son coherentes; la mezcla actual NO.
#   D7 — ⚠️ PROCESO. `feature_list.json` id 18 se titula literalmente «Sección de equipo — NO
#        empezar spec» y está en `status: blocked`. Este contrato ES esa spec. Se ha escrito porque
#        la demo lo pide, pero NADIE debe pasarlo a `spec_ready` sin que el humano DESBLOQUEE la
#        id 18 de forma explícita. El `gherkin_author` NO ha tocado el `status` (correcto).
# =============================================================================================

Feature: Sección de equipo con reserva por profesional — 7 tarjetas con rol y especialidades REALES (Uñas · Pestañas · Cejas), calendario propio de 6 días sin domingos calculado en cliente, franjas que RESPETAN el cierre del sábado a las 14:00, y carrusel de reseñas con vuelta circular en ambos sentidos
  Como visitante quiero elegir a mi especialista, ver sus reseñas y reservar día y hora desde su
  propia tarjeta, sin salir de la página y sin que se me ofrezca una hora en la que el salón está
  cerrado; y como responsable del proyecto quiero que la sección sea alcanzable desde la navegación,
  que el HTML horneado no mienta con fechas caducadas y que quede visible que los perfiles y las
  reseñas son de ejemplo.

  # ---------------------------------------------------------------------------
  # LA CÁSCARA: sección navegable, encabezado y el 7º enlace de la nav (puertas 1 y 5).
  # ---------------------------------------------------------------------------

  @s1
  Scenario: La sección se hornea como sección navegable con nombre accesible y el encabezado del diseño
    Given la home renderizada por SSR, sin ejecutar JavaScript
    When se inspecciona la sección de equipo del HTML horneado
    Then existe exactamente UNA "<section>" con aria-labelledby="equipo-titulo"
    And las SIETE tarjetas de profesional NO son "<section>": son "<article>" (o "<li>"), de modo que la sección de equipo añade EXACTAMENTE UNA "<section>" al documento y ni una más
    And existe exactamente UN "<h2>" con id="equipo-titulo" cuyo texto es exactamente "Nuestro equipo de profesionales"
    And sobre ese h2 se muestra el eyebrow con el texto exactamente "Equipo"
    And bajo ese h2 se muestra la intro con el texto exactamente "Elige a tu especialista, mira sus reseñas y reserva tu día y hora en segundos."
    # Puerta 1 (cascarón): todo `aria-labelledby` debe resolver a un heading REAL presente en la
    # página. Los tres literales son los del diseño (Opcion-1-Rosa.dc.html L165-167) y se escriben A
    # MANO en el test. La sección se asevera sobre `renderToString(<Equipo />)` (horneado), no con
    # `screen`: es contenido estático, no interacción.
    # 🔴 EL SEGUNDO `Then` ES UN MATA-BUILDS, AÑADIDO EN LA REVISIÓN ADVERSARIAL. Maquetar cada
    # tarjeta como `<section aria-labelledby="lucia-titulo">` es la opción "semántica" que un
    # implementador elige por instinto, y MATA EL BUILD DOS VECES [V, código leído]:
    #   · `puerta-cascaron.ts:120` vigila TODA `<section>`: una tarjeta SIN `aria-labelledby` que
    #     resuelva a un heading real es violación de `REGLA_SECTION` (puerta 1).
    #   · Y si SÍ se le pone, es PEOR: `puerta-anclas.ts:84-108` (`seccionesNavegables`) declara
    #     NAVEGABLE a toda `<section>` cuyo `aria-labelledby` resuelva a un heading — los `<h3>` de
    #     las tarjetas lo son —, así que la nav tendría que enlazar LAS SIETE o la puerta 5 emite
    #     siete `REGLA_INALCANZABLE` y el build MUERE (puerta 5).
    # `<article>` NO lo vigila ninguna de las dos puertas y es el elemento correcto para una ficha
    # autónoma. El WhatsApp flotante ya se defiende de esta misma trampa (@s5 de su contrato); esta
    # sección no lo hacía.

  @s2
  Scenario: La navegación gana un séptimo enlace a la sección y el build con las cinco puertas sigue en verde
    Given la LISTA de navegación (el "<ul>" con id="menu-navegacion"), que hoy hornea seis enlaces: Servicios, Destacados, Ofertas, Reserva, Contacto y FAQ
    And el CTA "Reservar" de la cabecera, que es un séptimo "<a href='#reserva-titulo'>" que vive DENTRO de la misma "<nav>" pero FUERA de esa lista, y que NO se toca
    When se ejecuta el build de producción con las cinco puertas
    Then la LISTA con id="menu-navegacion" hornea SIETE enlaces y uno de ellos es exactamente '<a href="#equipo-titulo">Equipo</a>', colocado entre "Ofertas" y "Reserva"
    And el CTA "Reservar" sigue apuntando a "#reserva-titulo" y sigue estando fuera de la lista: el conteo de enlaces se hace SOBRE LA LISTA, nunca sobre la "<nav>" entera
    And la puerta de anclas encuentra IGUALDAD DE CONJUNTOS: todo href="#…" de la nav resuelve a un id existente y toda sección navegable está enlazada, sin huérfanas ni rotas
    And la puerta de placeholders, la de terceros y la de contraste no emiten ninguna violación: si la sección introduce un par de colores nuevo, ese par está en la matriz y MINIMO_DE_PARES se ha subido A MANO en src/lib/puerta-contraste.ts
    And el código de salida del build es 0
    # 🔴 SIN ESTE ENLACE EL BUILD MUERE: la sección sería una sección navegable HUÉRFANA para la
    # puerta 5. El orden (entre Ofertas y Reserva) refleja el orden físico de la home y mantiene la
    # alternancia de fondos correcta: Ofertas(alt) → Equipo(plain) → Reserva(alt)
    # (`progress/spec_visual_equipo.md` aviso 7). [NV] hasta el primer `pnpm build` real, que MANDA.
    # 🔴 CORREGIDO EN LA REVISIÓN ADVERSARIAL: v2 decía «la nav hornea SIETE enlaces». FALSO — y un
    # test escrito así nace ROJO. `MenuNavegacion.tsx:57-59` [V] tiene, DENTRO de la misma `<nav>` y
    # FUERA del `<ul id="menu-navegacion">`, un séptimo ancla: el CTA `<a href="#reserva-titulo">
    # Reservar</a>`. Contando por `<nav>` hay 7 hoy y habría 8 después. El conteo SOLO tiene sentido
    # sobre la LISTA. Ojo además: `anclasDeNav` de `puerta-anclas.ts:46-60` extrae los `href="#…"` de
    # la `<nav>` ENTERA (el CTA incluido), así que la igualdad de conjuntos de la puerta 5 se evalúa
    # con los 8, no con los 7. Como `#reserva-titulo` ya existe, eso no rompe nada.

  @s3
  Scenario: Se hornean las siete tarjetas de profesional, en el orden del diseño
    Given la home renderizada por SSR, sin ejecutar JavaScript
    When se leen los nombres de las tarjetas de la sección de equipo, en orden de aparición
    Then son exactamente siete y en este orden: "Lucía", "Carla", "Andrea", "Nerea", "Marta", "Paula" y "Sara"
    And cada uno de esos siete nombres es el texto de un "<h3>"
    # Orden y nombres verbatim de `salon-data.js` → `team`. «Exactamente siete» mata el mutante que
    # recorta o duplica la lista. Los siete literales se escriben A MANO (jamás importando EQUIPO_DEMO).

  @s4
  Scenario: La sección no introduce ningún h1 nuevo: la home sigue teniendo exactamente uno
    Given la home renderizada por SSR, sin ejecutar JavaScript
    When se cuentan los encabezados del documento horneado
    Then hay exactamente UN "<h1>" en toda la página, y es el del hero (la sección de equipo no aporta ninguno)
    And la sección de equipo aporta exactamente UN "<h2>" (el de id="equipo-titulo") y SIETE "<h3>" (uno por profesional)
    # Puerta 1: exactamente 1 `<h1>` por página. La jerarquía h2 → h3 mantiene el orden del árbol de
    # accesibilidad sin saltos de nivel. Se cuenta sobre el HTML horneado, no con jsdom.

  # ---------------------------------------------------------------------------
  # LOS DATOS: roles y especialidades REALES. «Facial» y «Depilación» NO EXISTEN en este salón.
  # ---------------------------------------------------------------------------

  @s5
  Scenario Outline: Cada tarjeta muestra el rol y las DOS especialidades reales de esa profesional
    Given la home renderizada por SSR, sin ejecutar JavaScript
    When se lee la tarjeta de "<nombre>"
    Then su rol visible es exactamente "<rol>"
    And muestra exactamente dos especialidades, que son "<especialidad 1>" y "<especialidad 2>"

    Examples:
      | nombre | rol                  | especialidad 1 | especialidad 2 |
      | Lucía  | Nail artist          | Uñas           | Nail art       |
      | Carla  | Esteticista          | Pestañas       | Cejas          |
      | Andrea | Especialista en uñas | Uñas           | Pedicura       |
      | Nerea  | Lash & brow          | Pestañas       | Cejas          |
      | Marta  | Esteticista          | Cejas          | Pestañas       |
      | Paula  | Nail artist          | Uñas           | Nail art       |
      | Sara   | Manicurista          | Uñas           | Pedicura       |

    # 🔴 ESTA TABLA ES LA REPARACIÓN DEL BLOQUEANTE DE v1. `salon-data.js` asigna a Carla, Nerea,
    # Marta y Sara especialidades de un salón GENÉRICO («Facial», «Depilación») que ESTE negocio NO
    # OFRECE: sus categorías reales son Uñas · Pestañas · Cejas (F-09), más Nail art y Pedicura, que
    # son servicios del catálogo de uñas. Los roles se conservan del prototipo porque describen a la
    # persona, no al servicio. Marta y Nerea comparten par pero en ORDEN distinto: eso fija que el
    # ORDEN de las especialidades es dato, no azar. Los 21 literales se escriben A MANO.

  @s6
  Scenario: Ni "Facial" ni "Depilación" aparecen en la sección de equipo
    Given el HTML horneado de la home, del que se EXTRAE la sección "#equipo-titulo" (sin ejecutar JavaScript)
    When se busca en ese fragmento extraído, sin distinguir mayúsculas
    Then el fragmento SÍ contiene "Nuestro equipo de profesionales" y los siete nombres (ANCLA POSITIVA: prueba de que la extracción NO devolvió la cadena vacía; sin ella la negativa pasaría verde por VACUIDAD)
    And en ese MISMO fragmento no aparece "Facial" ni una sola vez
    And en ese MISMO fragmento no aparece "Depilación" ni una sola vez
    # El mismo deslinde que ya hizo `ofertas-demo.ts` al sustituir «Martes de Facial». Es también un
    # riesgo LEGAL blando (LCD art. 5.1.g): anunciar un servicio que el salón no presta. El ANCLA
    # POSITIVA VA PRIMERO (doctrina `puerta-anclas.ts`: «NUNCA verde por vacuidad»).

  # ---------------------------------------------------------------------------
  # HUECO DE FOTO (puertas 2 y 4) y LEYENDA DE DATOS DE EJEMPLO (D1, D2).
  # ---------------------------------------------------------------------------

  @s7
  Scenario: El hueco de foto es un adorno decorativo: sin imagen, sin literal prohibido y sin subrecursos externos
    Given el HTML horneado de la home con las siete tarjetas de equipo
    When se inspecciona el hueco de foto de cada tarjeta
    Then cada hueco es un elemento con aria-hidden="true" (queda FUERA del árbol de accesibilidad: no aporta ningún nombre)
    And la sección no contiene ningún "<img" ni ningún atributo src
    And en toda la página no aparece el literal "ph-woman" ni una sola vez
    And ningún subrecurso externo se solicita desde la sección: ni img, ni script, ni iframe, ni link, ni @font-face, ni url() apuntando fuera del sitio
    # Puerta 2 (placeholders: «ph-woman» está en la lista prohibida) y puerta 4 (terceros). Además
    # cierra D1: NO hay foto de ninguna persona, ni real ni generada, así que no hay derecho de
    # imagen que gestionar en la DEMO. El hueco mantiene el `aspect-ratio: 4/3` del diseño (spec
    # visual §5) — eso es CSS, se lee de los BYTES del `.module.scss`, NUNCA con toHaveClass.

  @s8
  Scenario: Una leyenda VISIBLE declara que los perfiles y las reseñas son de ejemplo
    Given el HTML horneado de la home con la sección de equipo
    When se lee el pie de la sección de equipo
    Then se muestra un texto visible cuyo contenido es exactamente "Equipo y reseñas de ejemplo · perfiles de muestra, pendientes de confirmar con el salón"
    And ese texto está en el HTML HORNEADO (no aparece solo tras hidratar) y no está oculto visualmente
    And la leyenda menciona AMBAS cosas: los perfiles del equipo y las reseñas
    # D1 + D2, patrón `LEYENDA_OFERTAS` de F-09. Ni un nombre ni una reseña se presentan como reales.
    # Los datos viven en `src/lib/demo/equipo-demo.ts` (FUERA del JSX), retirables sin desplegar
    # código: es lo que exige `feature_list.json` §18. 🔴 EL COPY EXACTO VA A LA PUERTA (D2).

  # ---------------------------------------------------------------------------
  # LOS DÍAS: calculados EN CLIENTE desde «hoy», saltando domingos. Bajo SSG, hornear fechas es
  # hornear una MENTIRA que caduca el día siguiente al build.
  # ---------------------------------------------------------------------------

  @s9
  Scenario: El HTML horneado por SSR no lleva NINGUNA fecha: el calendario nace vacío y se puebla en cliente
    Given la home renderizada por SSR, sin ejecutar JavaScript ni hidratar
    When se inspecciona el bloque de reserva horneado de cada tarjeta
    Then el bloque SÍ contiene el rótulo "Reserva tu cita" y el botón de reserva (ANCLA POSITIVA: la tarjeta se horneó y no está vacía)
    And no se hornea NINGÚN chip de día: la lista de días está vacía y en su lugar se muestra el aviso "Cargando días…"
    And no se hornea NINGÚN selector de hora
    And el botón de reserva se hornea con el atributo disabled
    # 🔴 EL ESCENARIO DE LA COLECCIÓN VACÍA, y el que impide la mentira del SSG: calcular los días en
    # build-time hornearía «vie 17» para siempre. Los días se calculan en `useEffect` (cliente), como
    # ya hace `Reserva.tsx` y como hacía el prototipo en `componentDidMount`. Se asevera sobre
    # `renderToString(<Equipo />)`, NUNCA con jsdom (jsdom solo ve el estado POST-hidratación, y esa
    # lección ya se pagó cara en F-04).

  @s10
  Scenario: Tras hidratar, cada tarjeta ofrece SEIS días a partir de mañana, saltando los domingos
    Given el reloj INYECTADO en el instante del JUEVES "2026-07-16" (el domingo siguiente es el día 19)
    When se generan los días ofrecidos para una tarjeta
    Then son exactamente seis y sus etiquetas son, en este orden: "vie 17", "sáb 18", "lun 20", "mar 21", "mié 22" y "jue 23"
    And ninguno de los seis es domingo: el día 19 se OMITE (el salón cierra los domingos, F-10)
    And ninguno de los seis es "hoy" (el jueves 16): la serie empieza MAÑANA
    And llamar dos veces a la generación con el mismo instante inyectado devuelve la MISMA lista (determinista: no lee el reloj del sistema)
    # 🔴 NÚCLEO MUTABLE (b): la generación es una función PURA con el reloj INYECTADO, extraída del
    # componente para que Stryker pueda morderla. El salto del domingo es el comparador que muere si
    # se muta. La abreviatura en minúsculas («vie», «sáb», «mié») es la de `Reserva.tsx`. Las seis
    # etiquetas se escriben A MANO en el test, jamás re-ejecutando la función de producción.
    # ❌ PROHIBIDO llamar a `new Date()` dentro de la función pura (mismo pecado que `estaAbierto` de
    # F-10 prohíbe): el reloj es una DEPENDENCIA INYECTADA.

  # ---------------------------------------------------------------------------
  # LAS FRANJAS: DEPENDEN DEL DÍA. El sábado el salón cierra a las 14:00 (F-10, done).
  # ---------------------------------------------------------------------------

  @s11
  Scenario: El selector de hora no existe hasta que se elige un día
    Given la tarjeta de "Lucía" hidratada, con sus seis días visibles y ninguno elegido
    When se inspecciona la tarjeta de "Lucía"
    Then no se muestra ningún selector de hora: cero botones de franja horaria
    And los seis chips de día están presentes y TODOS exponen aria-pressed="false"
    And el botón de reserva de esa tarjeta está disabled
    # Estado `showTimes` del prototipo (L201). El selector no está oculto por CSS: NO EXISTE en el
    # árbol, para que un lector de pantalla no anuncie controles inertes.

  @s12
  Scenario: Elegir un día LABORABLE ofrece las seis franjas del salón
    Given la tarjeta de "Lucía" hidratada, con el reloj inyectado al jueves "2026-07-16"
    When se pulsa el chip del día "mié 22" (un miércoles: el salón abre de 10:00 a 20:00)
    Then aparece el selector de hora con exactamente seis franjas, en este orden: "10:00", "11:30", "13:00", "16:00", "17:30" y "19:00"
    And el chip "mié 22" pasa a exponer aria-pressed="true" y los otros cinco días siguen en aria-pressed="false"
    # Las seis franjas son verbatim de `salon-data.js` → `timeSlots`, las mismas que ya usa
    # `Reserva.tsx`. Todas caen dentro de la franja L-V 10:00–20:00 de F-10.

  @s13
  Scenario: Elegir el SÁBADO ofrece solo las franjas anteriores al cierre de las 14:00
    Given la tarjeta de "Lucía" hidratada, con el reloj inyectado al jueves "2026-07-16"
    When se pulsa el chip del día "sáb 18" (un sábado: el salón abre de 10:00 a 14:00)
    Then aparece el selector de hora con exactamente TRES franjas: "10:00", "11:30" y "13:00"
    And NO se ofrece "16:00", ni "17:30", ni "19:00": el salón ya está cerrado a esas horas los sábados
    # 🔴 EL FALLO QUE EL CEO VERÍA. El prototipo ofrece las 6 franjas TODOS los días: un sábado a las
    # 19:00 el salón lleva cinco horas cerrado. Las franjas se FILTRAN contra el horario real de F-10
    # (`src/lib/horario.ts`, done: SÁBADO 10:00–14:00, cierre EXCLUSIVO → 13:00 entra, 14:00 no).
    # NÚCLEO MUTABLE (c): el filtro es una función pura `franjasDe(dia)`; mutar su comparador
    # reintroduce las tres franjas prohibidas y ESTE escenario se pone rojo. Sin este escenario, el
    # filtro entero es código que nadie defiende.

  @s14
  Scenario: Cambiar de día deselecciona la hora ya elegida
    Given la tarjeta de "Lucía" con el día "mié 22" y la hora "16:00" ya elegidos
    When se pulsa el chip de un día distinto, "jue 23"
    Then ninguna franja horaria expone aria-pressed="true": la hora vuelve a estar sin elegir
    And el chip "jue 23" expone aria-pressed="true" y el chip "mié 22" vuelve a aria-pressed="false"
    And el botón de reserva vuelve a estar disabled con el texto "Elige día y hora"
    # Sin este reseteo, un visitante podría confirmar «jue 23 · 16:00» habiendo elegido las 16:00 para
    # el miércoles, o —peor— arrastrar una hora inválida de un laborable a un sábado (@s13).

  # ---------------------------------------------------------------------------
  # EL BOTÓN DE RESERVA: el estado vive en el atributo `disabled` (CONSULTABLE), nunca en una clase.
  # ---------------------------------------------------------------------------

  @s15
  Scenario Outline: Mientras falte el día o la hora, el botón de reserva está disabled con etiqueta fija
    Given la tarjeta de "Lucía" hidratada en el estado "<estado de partida>"
    When se inspecciona su botón de reserva
    Then el botón expone el atributo disabled
    And su texto es exactamente "Elige día y hora"

    Examples:
      | estado de partida                        | qué fija                                              |
      | sin día y sin hora elegidos              | el estado inicial tras hidratar                       |
      | con el día "mié 22" y sin hora elegida   | elegir día NO basta: falta la hora                    |

    # 🔴 `disabled` es un ATRIBUTO CONSULTABLE: el navegador impide el clic y el lector de pantalla lo
    # anuncia. El diseño usa un `<div>` para el estado no habilitado (L217); AQUÍ ES UN
    # `<button disabled>` (spec visual, aviso 9): un `className` condicional sería INMATABLE por
    # Stryker (5 mutantes, sobreviven los 5) y la feature no cerraría nunca. No existe la fila «con
    # hora y sin día» porque el selector de hora no existe sin día (@s11).

  @s16
  Scenario: Con día y hora elegidos el botón se habilita y su etiqueta nombra la cita concreta
    Given la tarjeta de "Lucía" con el día "mié 22" elegido y hora aún sin elegir
    When se pulsa la franja "16:00"
    Then el botón de reserva YA NO expone el atributo disabled
    And su texto es exactamente "Reservar · mié 22 · 16:00"
    And la franja "16:00" expone aria-pressed="true" y las otras cinco siguen en aria-pressed="false"
    # D3: la etiqueta dinámica se COMPONE con el día y la hora elegidos, así que el visitante lee lo
    # que va a confirmar antes de pulsar. El literal esperado se escribe A MANO (jamás recomponiendo
    # la plantilla de producción dentro del test).

  @s17
  Scenario: Confirmar la reserva sustituye el calendario por el mensaje de confirmación
    Given la tarjeta de "Lucía" con el día "mié 22" y la hora "16:00" elegidos y el botón habilitado
    When se pulsa el botón de reserva de la tarjeta de "Lucía"
    Then se muestra el mensaje exactamente "Cita con Lucía el mié 22 a las 16:00"
    And se muestra el subtexto exactamente "Te confirmaremos por WhatsApp."
    And se muestra un botón cuyo nombre accesible es exactamente "Cambiar"
    And ya NO se muestra ningún chip de día ni ninguna franja horaria en esa tarjeta
    # D3 + D4: el mensaje es LOCAL, de demo (el flujo real de WhatsApp es F-13). Estado `booked` del
    # prototipo (L221-227): el calendario y la confirmación son EXCLUYENTES, nunca coexisten.

  @s18
  Scenario: "Cambiar" devuelve la tarjeta exactamente a su estado inicial
    Given la tarjeta de "Lucía" con una reserva ya confirmada
    When se pulsa el botón "Cambiar" de la tarjeta de "Lucía"
    Then vuelve a mostrarse el rótulo "Reserva tu cita" con los seis chips de día, TODOS en aria-pressed="false"
    And no se muestra ningún selector de hora
    And el botón de reserva vuelve a estar disabled con el texto "Elige día y hora"
    And ya no se muestra el mensaje de confirmación ni el botón "Cambiar"
    # El ciclo se cierra: reservar no es un callejón sin salida. Que el día elegido NO se conserve es
    # deliberado: «Cambiar» significa empezar de cero, no editar.

  # ---------------------------------------------------------------------------
  # ESTADO INDEPENDIENTE POR TARJETA. Siete tarjetas, siete estados que no se pisan.
  # ---------------------------------------------------------------------------

  @s19
  Scenario: Elegir un día en una tarjeta no altera ninguna de las otras seis
    Given las siete tarjetas hidratadas, todas en su estado inicial y sin día elegido
    When se pulsa el chip del día "mié 22" en la tarjeta de "Lucía"
    Then la tarjeta de "Lucía" muestra su selector de hora y su chip "mié 22" expone aria-pressed="true"
    And en las otras seis tarjetas ("Carla", "Andrea", "Nerea", "Marta", "Paula" y "Sara") no se muestra ningún selector de hora
    And en esas seis tarjetas TODOS los chips de día siguen en aria-pressed="false" y su botón de reserva sigue disabled
    # El estado (día, hora, reseña activa, reservado) es de CADA tarjeta. Un estado compartido haría
    # que elegir hora para Lucía se lo asignara también a Sara: un fallo que el CEO vería en la demo.

  # ---------------------------------------------------------------------------
  # EL CARRUSEL DE RESEÑAS. Aquí es donde MUERDE la mutación: el módulo ((i % n) + n) % n.
  # ---------------------------------------------------------------------------

  @s20
  Scenario: Cada tarjeta arranca mostrando la primera reseña de su propia rotación
    Given la home renderizada con las siete tarjetas de equipo
    When se lee el bloque de reseña de cada tarjeta
    Then cada tarjeta muestra UNA reseña con su texto entrecomillado y el nombre de su autora
    And la rotación de cada tarjeta tiene al menos TRES reseñas distintas
    And la primera reseña de "Lucía" y la primera de "Carla" son DISTINTAS entre sí
    And la valoración de cinco estrellas expone un texto accesible "5 de 5 estrellas": los glifos "★" por sí solos no son nombre accesible
    # D5. Las reseñas salen del `reviewPool` de `salon-data.js` (10 disponibles). «Al menos tres» es
    # lo que hace que el carrusel signifique algo: con una sola reseña, @s21 y @s22 pasarían por
    # trivialidad y el módulo circular quedaría sin defender.

  @s21
  Scenario: Avanzar más allá de la última reseña vuelve a la primera (no a un hueco vacío)
    Given la tarjeta de "Lucía" mostrando la ÚLTIMA reseña de su rotación
    When se pulsa la flecha de reseña siguiente en la tarjeta de "Lucía"
    Then se muestra la PRIMERA reseña de su rotación, con su texto y su autora
    And el bloque de reseña no queda vacío ni muestra "undefined"
    # 🔴 NÚCLEO MUTABLE (a), lado positivo: `((i % n) + n) % n`. Mata al mutante que suprime el módulo
    # (índice fuera de rango → `undefined` → hueco vacío en la tarjeta).

  @s22
  Scenario: Retroceder antes de la primera reseña vuelve a la última (no a un índice negativo)
    Given la tarjeta de "Lucía" mostrando la PRIMERA reseña de su rotación
    When se pulsa la flecha de reseña anterior en la tarjeta de "Lucía"
    Then se muestra la ÚLTIMA reseña de su rotación, con su texto y su autora
    And el bloque de reseña no queda vacío ni muestra "undefined"
    # 🔴 NÚCLEO MUTABLE (a), EL LADO QUE CASI SIEMPRE SE OLVIDA. Un `i % n` a secas devuelve NEGATIVO
    # al retroceder desde 0 (`-1 % 3 === -1` en JavaScript) → índice inexistente → hueco vacío. La
    # normalización `((i % n) + n) % n` existe SOLO para este caso, y ESTE escenario es el único que
    # la defiende: sin él, el carrusel «funciona» hacia delante y está roto hacia atrás.

  @s23
  Scenario: Mover el carrusel de una tarjeta no mueve el de las demás
    Given las siete tarjetas mostrando cada una la primera reseña de su rotación
    When se pulsa la flecha de reseña siguiente en la tarjeta de "Lucía"
    Then la tarjeta de "Lucía" muestra la SEGUNDA reseña de su rotación
    And la tarjeta de "Carla" sigue mostrando la PRIMERA reseña de la suya, sin cambios
    # Mismo invariante que @s19, aplicado al índice de reseña: siete estados independientes.

  # ---------------------------------------------------------------------------
  # ACCESIBILIDAD: el estado en atributos consultables y nombres accesibles de verdad.
  # ---------------------------------------------------------------------------

  @s24
  Scenario: El estado de selección vive en aria-pressed, y solo un chip está pulsado por grupo
    Given la tarjeta de "Lucía" con el día "mié 22" y la hora "16:00" elegidos
    When se inspecciona el árbol de accesibilidad de esa tarjeta
    Then EXACTAMENTE UN chip de día expone aria-pressed="true" y los otros cinco exponen aria-pressed="false"
    And EXACTAMENTE UNA franja horaria expone aria-pressed="true" y las demás exponen aria-pressed="false"
    And la selección NO se comunica únicamente con color ni con una clase CSS: el atributo aria-pressed está presente en TODOS los chips, elegidos y no elegidos
    # 🔴 REGLA DURA DEL REPO, MEDIDA: el estado en un `className` condicional genera 5 mutantes de
    # Stryker y SOBREVIVEN LOS 5 (`cabecera.test.tsx` @s15) → la feature no cerraría nunca. Y por
    # WCAG SC 1.4.1, el color no puede ser el único portador de la información. `aria-pressed="false"`
    # debe estar PRESENTE (no ausente) en los no elegidos: así el chip se anuncia como alternable.

  @s25
  Scenario: Las flechas del carrusel tienen nombre accesible descriptivo, no un glifo
    Given la tarjeta de "Lucía" con su bloque de reseña
    When se buscan sus dos controles de carrusel por nombre accesible
    Then existe un botón cuyo nombre accesible es exactamente "Reseña anterior de Lucía"
    And existe un botón cuyo nombre accesible es exactamente "Reseña siguiente de Lucía"
    And ninguno de los dos tiene como nombre accesible el glifo "←" ni "→": el glifo, si se muestra, es contenido decorativo con aria-hidden="true"
    And el nombre incluye el de la profesional, de modo que los CATORCE controles de la sección (dos por tarjeta) tienen nombres accesibles DISTINTOS entre sí
    # Un botón llamado «←» se anuncia como «flecha izquierda, botón»: no dice qué hace. Con siete
    # tarjetas habría además catorce controles con el mismo nombre, indistinguibles en la lista de
    # elementos de un lector de pantalla. Se asevera por ROL + NOMBRE ACCESIBLE
    # (`getByRole('button', { name: … })`), nunca por clase CSS.
