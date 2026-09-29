# Contrato de la feature `catalogo_fotos` (F-27, `sdd: true`) — v1, 2026-09-29.
# Fuente: `project-spec.md` §«Feature 27: `catalogo_fotos`» (Propósito, tabla de `alt`, CF-C1..CF-C6,
# Casos límite 1-10, Decisiones CF-1..CF-7, enmiendas, Verificación en vivo I-8).
#
# =============================================================================================
# DECISIÓN FIRME DE PABLO (no se vuelve a discutir en esta puerta)
# =============================================================================================
#   P1 (2026-09-29) — Las fotos son de PEXELS, elegidas por el equipo con selección autónoma, YA
#        seleccionadas, sin rostro identificable y recortadas a 800 × 1000 en `src/assets/servicios/`.
#        Los IDs, autores y el porqué de cada una viven en `progress/fotos_seleccion.md`:
#          · Uñas       → `servicio-unas-manicura-nude.jpg`    (Pexels 34373403)
#          · Facial     → `servicio-facial-pestanas.jpg`       (Pexels 7479587)
#          · Depilación → `servicio-depilacion-piel-suave.jpg` (Pexels 5202459)
#        El `tdd_craftsman` NO busca, NO descarga y NO cambia fotos: solo las cablea (precedente
#        `progress/tdd_fotos_equipo_galeria.md`).
#
# =============================================================================================
# PROPUESTAS DEL spec_partner, A RATIFICAR EN ESTA PUERTA (el autor las traduce, el humano decide)
# =============================================================================================
#   CF-1 — `alt` que DESCRIBE lo fotografiado (los tres textos de @s1). Descartado: `alt=""` (la
#          esconde a quien no ve) y repetir el título de la categoría (redundante con el `<h3>`).
#          → @s1, @s2, @s6, @s13, @s14
#   CF-2 — El `<img>` ES el hueco: lleva la clase `.foto`, sin envoltorio. Descartado: `<div
#          class="foto"><img></div>` (como Equipo) y `background-image` (sin `alt`, fuera del árbol de
#          accesibilidad, sin `loading`, invisible a los tests). → @s5, @s17, @s23
#   CF-3 — `foto` y `alt` viven en `src/lib/demo/catalogo-demo.ts` (I-7), con los tres `import` en
#          el fichero de datos. Descartado: mapa en el componente; nombre derivado de la `clave`.
#          → @s14, @s17, @s18
#   CF-4 — Leyenda propia `LEYENDA_FOTOS` en un SEGUNDO `<p>`, justo tras el de precios. Descartado:
#          alargar `LEYENDA_PRECIOS` (contrato de F-09, Q-B) y un `<figcaption>` por foto.
#          → @s8, @s9, @s15
#   CF-5 — `Catalogo.tsx` ENTRA en `mutate` al 100 %, con su primer test. → @s10, @s11, @s12
#   CF-6 — `loading="lazy"` en las TRES. Descartado: `eager` / `fetchpriority="high"` en la primera,
#          SALVO que la medida en vivo demuestre que la foto de Uñas cae en el primer viewport.
#          → @s4 (unitario) y @s25 (la medida; si falla, decide el lead, no el TDD)
#   CF-7 — Depilación: foto de «piel suave» y un `alt` que NO afirma la técnica (ni cera ni
#          depilación). Descartado: seguir buscando una de cera (ninguna sin cara identificable) o dejar
#          el hueco rosa solo en Depilación. → @s13
#
# =============================================================================================
# FUENTES LEÍDAS (no inventadas)
# =============================================================================================
#   · `src/components/Catalogo.tsx` — HOY: `<div className={estilos.foto} aria-hidden="true" />` tras
#     la carta de cada categoría; un solo `<p>` con `LEYENDA_PRECIOS`; tres `className` en template
#     literal (`demo-seccion …`, `demo-card …`, `demo-btn demo-btn--solido …`). HOY NO TIENE NI UN TEST.
#   · `src/lib/demo/catalogo-demo.ts` — `CategoriaDemo` (clave, eyebrow, textoBoton, titulo, intro,
#     servicios) y `LEYENDA_PRECIOS` = «Precios de muestra · IVA incluido · pendientes de confirmar con
#     el salón». Orden de las categorías: `unas`, `facial`, `depilacion`.
#   · `src/components/catalogo.module.scss` §`.foto` — HOY: `aspect-ratio: 4 / 5; border-radius: 22px;
#     background: linear-gradient(160deg, var(--accent-soft), var(--surface2)); border: 1px solid
#     var(--line); min-height: 260px;` (el `min-height` SALE, CF-C3).
#   · `features/equipo_reservas.feature` @s26-@s31 y `progress/tdd_fotos_equipo_galeria.md` — el
#     patrón del repo para fotos reales (alt exacto por fila, distintas, width/height/lazy, árbol de
#     accesibilidad sin contaminar el `<h3>`, horneado SSR con ancla positiva, cero terceros).
#   · `equipo.test.tsx:128-138`, `contacto.test.tsx:104-120`, `reserva.test.tsx:80` — el patrón para
#     matar los mutantes que vacían un `className` en template literal (leer `class` del horneado).
#   · `contacto-fuente.test.ts` (F-12 @s15) — precedente de guarda que LEE LA FUENTE `.tsx` (@s17).
#   · `equipo-estilos.test.ts` — precedente de test que lee los BYTES del `.module.scss` (@s20, @s21).
#   · `features/tipografia_global.feature` @s8/@s9 — precedente del tag `@verificacion-viva`.
#
# =============================================================================================
# REGLAS PARA EL tdd_craftsman (duras)
# =============================================================================================
#   · ANTI-TAUTOLOGÍA: los tres pares clave/fichero/alt, los tres títulos, los tres CTA, las dos
#     leyendas y las clases globales se escriben A MANO en el test. ❌ PROHIBIDO importar
#     `CATALOGO_DEMO`, `LEYENDA_FOTOS` ni `LEYENDA_PRECIOS` como VALOR ESPERADO en los tests de render.
#     En los tests de DATOS (@s14, @s15) esas constantes son el SUJETO bajo prueba y se comparan
#     contra literales escritos a mano.
#   · ANTI-CLASE-CSS: `vitest.config.ts` → `css: false`, así que `estilos.foto` y demás trozos del
#     módulo salen `undefined` en el render. ❌ PROHIBIDO `toHaveClass`. Lo GLOBAL (`demo-seccion`,
#     `demo-card`, `demo-btn`) sí es observable: se lee el atributo `class` del `renderToString`
#     (@s12). Lo del MÓDULO (`.foto`) se asevera por bytes de la fuente (@s17) y en vivo (@s23).
#   · Lo VISUAL es SCSS y Stryker no ve SCSS: se asevera leyendo los BYTES de la hoja (@s20, @s21).
#   · ANCLA POSITIVA en toda negativa sobre el horneado (sin ella, una extracción vacía pasa verde).
#   · Tests previstos: `src/components/catalogo.test.tsx` (NUEVO: @s1-@s13), un test de datos en
#     `src/lib/demo/` (@s14-@s16, precedente `resenas-demo.test.ts`), guardas de fuente y de ficheros
#     (@s17-@s19) y `src/components/catalogo-estilos.test.ts` (@s20, @s21). Nombres orientativos: el
#     mapa definitivo @s → test lo deja el `tdd_craftsman` en `progress/tdd_catalogo_fotos.md`.
#
# =============================================================================================
# MUTACIÓN (CF-5 / CF-C6, umbral 1.0) — dónde muerde y qué no crea mutantes
# =============================================================================================
#   `src/components/Catalogo.tsx` se AÑADE a `mutate` de `stryker.config.json`. Mutantes esperados
#   (≈ 6) y el escenario que mata cada uno:
#     · `ID_SERVICIOS = 'servicios-titulo'` → `""` ............. @s10 (id y aria-labelledby a mano)
#     · `demo-seccion ${…}` vaciado ............................ @s12
#     · `demo-card ${…}` vaciado ............................... @s12
#     · `demo-btn demo-btn--solido ${…}` vaciado ............... @s12
#     · flecha del `.map` de categorías → `() => undefined` .... @s1, @s10 (recuento de `<h3>`/`<img>`)
#     · flecha del `.map` de servicios  → `() => undefined` .... @s11 (recuento de filas)
#   Lo NUEVO de F-27 NO crea mutantes: atributos JSX literales (E1.d) y literales numéricos (A-14,
#   Stryker 9.6 no los sustituye). Por eso los TESTS aseveran igual `width="800"`, `height="1000"`,
#   `loading="lazy"` y los `alt` exactos (@s1, @s4): Stryker no los protege, lo hace el test.
#   `catalogo-demo.ts` es DATO y sigue FUERA de `mutate` (como `equipo-demo.ts`). No hay
#   `*-logica.ts`: no hay lógica (Ley 1).
#
# =============================================================================================
# QUÉ NO SE TOCA (contratos existentes, enmendados sin romper)
# =============================================================================================
#   · F-09 `features/catalogo_servicios.feature` (`spec_ready`): no se toca. F-27 no construye el
#     catálogo real; pone fotos al de la demo.
#   · `LEYENDA_PRECIOS` no cambia ni un byte (@s9, @s15). La sección navegable `#servicios-titulo`
#     (cascarón F-04, anclas F-06, CTA «Ver servicios» del hero), el `<h2>` oculto y los `<h3>`,
#     intactos (@s10, @s11). F-05 `cero_terceros`: sin hosts nuevos (@s3, @s22). F-08: la rejilla
#     responsive, intacta (@s21, @s23).
#   · A-2 SIGUE ABIERTA: las categorías «Facial» y «Depilación» son las de la demo actual. F-27 les pone
#     foto; NO las ratifica.
#
# =============================================================================================
# VERIFICACIÓN EN VIVO (I-8) — @s22-@s26, tag `@verificacion-viva`
# =============================================================================================
#   NO son tests unitarios ni se ejecutan bajo jsdom. Los corre el `craftsman_lead` tras el TDD, sobre
#   el `dist/` de `pnpm build` (cinco puertas verdes) servido y abierto en Chrome real, y deja la
#   evidencia en `progress/verificacion_viva_catalogo_fotos.md`. Si una medida real contradice a la
#   spec, MANDA la medida (I-8) y se anota.
#
# ESTADO: al terminar este fichero la feature queda lista para `spec_ready`. El cambio de `status` en
# `feature_list.json` lo hace el `craftsman_lead` (encargo: este autor no toca ese fichero).

Feature: catalogo_fotos — cada categoría del catálogo enseña en su hueco rosa una foto horneada de su servicio, con un alt que describe lo que se ve y una leyenda que declara que son de banco de imágenes, sin salto de maquetación y sin una sola petición a terceros
  Como clienta que visita la web quiero ver una foto claramente relacionada con cada servicio
  para hacerme una idea de lo que reservo, sin que la web finja que son trabajos del salón.

  # ===========================================================================================
  # (A) RENDER — `src/components/catalogo.test.tsx` (NUEVO). `renderToString(<Catalogo />)` es el
  # mismo mecanismo que usa vite-react-ssg para prerenderizar; `render()` de Testing Library para el
  # árbol de accesibilidad. Ningún escenario de este bloque necesita `pnpm build`.
  # ===========================================================================================

  @s1
  Scenario Outline: Cada categoría muestra EXACTAMENTE UNA foto, con el alt exacto de la tabla
    Given el catálogo de servicios renderizado a HTML por SSR, sin ejecutar JavaScript ni hidratar
    When se lee el bloque de la categoría "<clave>", el que empieza en el "<h3>" "<titulo>" y acaba antes del "<h3>" siguiente o de las leyendas
    Then ese bloque contiene EXACTAMENTE UNA "<img"
    And el atributo alt de esa "<img" es exactamente "<alt>"

    Examples:
      | clave      | titulo                  | alt                                                      |
      | unas       | Manos y pies de Revista | Manos con manicura en tono nude y anillos dorados        |
      | facial     | Tu piel, radiante       | Primer plano de pestañas largas sobre un párpado cerrado |
      | depilacion | Piel suave y cuidada    | Mano extendiendo crema sobre una pierna de piel suave    |

    # CF-1. Los tres `alt` son los de la tabla de la spec, LITERALES y A MANO en el test (sin comillas
    # «» y sin punto final). «Exactamente una» mata al mutante que pinta la foto dos veces, en la
    # categoría equivocada o ninguna (flecha del `.map` de categorías vaciada). Caso límite 9: si Pablo
    # cambia una foto, cambia el fichero y su `alt` en datos, y esta tabla cambia con él.

  @s2
  Scenario: Las tres fotos son DISTINTAS entre sí: ningún alt vacío ni repetido, ningún src repetido
    Given el catálogo de servicios renderizado a HTML por SSR, sin ejecutar JavaScript ni hidratar
    When se leen, en orden de aparición, los atributos alt y src de las "<img" del catálogo
    Then hay exactamente tres alt y los tres tienen al menos un carácter que no es espacio
    And los tres alt son distintos entre sí
    And los tres src son distintos entre sí
    # Caso límite 8 («`alt` vacío o repetido por error»). Repetir la misma foto o el mismo texto en dos
    # categorías sería una regresión que @s1 solo detecta si el literal cambia; esta la caza siempre.

  @s3
  Scenario: Cada src sale del fichero local de su categoría y ninguno apunta a un tercero
    Given el catálogo de servicios renderizado a HTML por SSR, sin ejecutar JavaScript ni hidratar
    When se leen, en orden de aparición, los atributos src de las "<img" del catálogo
    Then hay exactamente tres src
    And el primero contiene "servicio-unas-manicura-nude", el segundo "servicio-facial-pestanas" y el tercero "servicio-depilacion-piel-suave", y los tres terminan en ".jpg"
    And ninguno empieza por "http://", "https://", "//" ni "data:"
    And el HTML horneado del catálogo, ANCLA POSITIVA incluida (contiene "Manos y pies de Revista"), no contiene "http://" ni "https://" en ninguna parte
    # CF-C4 y F-05 `cero_terceros`. Los nombres de fichero se escriben A MANO. En el test, Vite resuelve el
    # `import` a una ruta local que contiene el nombre del fichero (mismo patrón que `equipo.test.tsx`
    # @s31); en `dist/` la ruta es `/NailsLashStudioWeb/assets/<nombre>-<huella>.jpg` (@s22). «data:»
    # vigila que un fichero por debajo de `assetsInlineLimit` (4 KB) no acabe incrustado en el HTML.

  @s4
  Scenario: Cada foto declara sus medidas reales y carga diferida, para no provocar salto de maquetación
    Given el catálogo de servicios renderizado a HTML por SSR, sin ejecutar JavaScript ni hidratar
    When se inspeccionan los atributos de las tres "<img" del catálogo
    Then las tres declaran width="800" y height="1000", que son las medidas reales de los ficheros (@s19) y la proporción 4:5 del hueco
    And las tres declaran loading="lazy"
    And ninguna declara el atributo "fetchpriority" ni loading="eager"
    # CF-C2 y CF-6. Con width/height el navegador reserva la caja 4:5 antes de descargar la foto (CLS 0,
    # @s24); con `aspect-ratio` en la hoja (@s20) la caja se ajusta al ancho de la columna. No son
    # mutantes (E1.d, A-14): los protege este test. La negativa de `fetchpriority`/`eager` FIJA CF-6: si
    # la medida de @s25 obliga a cambiarlo, el lead enmienda ESTE escenario y añade uno propio.

  @s5
  Scenario: La foto ES el hueco: ocupa el sitio del antiguo bloque rosa, sin envoltorio, y ya no queda nada oculto con aria-hidden
    Given el catálogo de servicios renderizado en el DOM
    When se recorre, en cada categoría, el contenedor de su carta (el padre del elemento que contiene el enlace "Reservar …")
    Then ese contenedor tiene EXACTAMENTE DOS hijos elemento: primero la carta y después la "<img"
    And la "<img" es hija DIRECTA de ese contenedor: no hay ningún elemento envolviéndola
    And en todo el catálogo no queda ningún elemento con aria-hidden="true"
    And ninguna de las tres "<img" declara aria-hidden, role="presentation" ni role="none"
    # CF-2 y CF-C2 («mismo sitio en el DOM, después de la carta»): el orden visual y el de lectura no
    # cambian. HOY el único `aria-hidden` del catálogo es el `<div>` del hueco rosa; al desaparecer, el
    # recuento cae a cero. Que la `<img>` lleve la CLASE `.foto` no es observable aquí (`css: false`):
    # lo aseveran @s17 (fuente) y @s23 (en vivo).

  @s6
  Scenario: La foto entra en el árbol de accesibilidad con su alt, sin contaminar los encabezados ni los enlaces
    Given el catálogo de servicios renderizado en el DOM
    When se consulta el árbol de accesibilidad del catálogo
    Then hay EXACTAMENTE TRES elementos con rol "img" y sus nombres accesibles son, en orden, "Manos con manicura en tono nude y anillos dorados", "Primer plano de pestañas largas sobre un párpado cerrado" y "Mano extendiendo crema sobre una pierna de piel suave"
    And los tres encabezados de nivel 3 tienen como nombre accesible exactamente "Manos y pies de Revista", "Tu piel, radiante" y "Piel suave y cuidada": la foto no les añade su alt ni ningún otro texto
    And ninguna "<img" es descendiente de un "<h3>" ni de un enlace, así que los nombres de los enlaces "Reservar …" tampoco cambian
    And existe una región cuyo nombre accesible es exactamente "Servicios"
    # CF-1: la foto es CONTENIDO (Pablo la quiere «claramente relacionada» con el servicio), por eso deja de
    # ocultarse. Lo que no cambia es que el nombre de cada categoría lo da SOLO su `<h3>`. Precedente:
    # `equipo_reservas.feature` @s29. Se asevera por ROL + NOMBRE (`getByRole`), nunca por clase CSS.

  @s7
  Scenario: Las tres fotos y las dos leyendas viajan HORNEADAS (SSR) y en el orden de lectura
    Given el catálogo de servicios renderizado a HTML por SSR, sin ejecutar JavaScript ni hidratar
    When se localizan en el HTML horneado las posiciones de los títulos, de los enlaces "Reservar …", de los alt de las fotos y de las dos leyendas
    Then el horneado contiene "Servicios", "Manos y pies de Revista", "Tu piel, radiante" y "Piel suave y cuidada" (ANCLA POSITIVA: la extracción no devolvió la cadena vacía)
    And los alt de las "<img", en orden de aparición, son exactamente los tres de la tabla de @s1, en el orden unas, facial, depilacion
    And las posiciones van estrictamente en este orden: "Manos y pies de Revista" < "Reservar Uñas" < alt de Uñas < "Tu piel, radiante" < "Reservar Facial" < alt de Facial < "Piel suave y cuidada" < "Reservar Depilación" < alt de Depilación < leyenda de precios < leyenda de fotos
    # Caso límite 3 («sin JS → idéntico»): nada depende de la hidratación; la foto es un dato ESTÁTICO y
    # hornearla no miente nunca. El orden fija que cada foto va DESPUÉS de su carta (CF-C2) y que las dos
    # leyendas van al pie, tras la última categoría. Los bytes de `dist/` los mira @s22.

  @s8
  Scenario: La leyenda de las fotos aparece EXACTAMENTE UNA VEZ, en su propio párrafo, justo después del de precios
    Given el catálogo de servicios renderizado en el DOM
    When se leen los párrafos al pie del catálogo
    Then el texto "Fotos de banco de imágenes, ilustrativas del servicio · las fotos reales del salón se añaden antes de publicar" aparece EXACTAMENTE UNA VEZ en el catálogo
    And ese texto es el contenido COMPLETO de un "<p>", no un fragmento de otro párrafo
    And ese "<p>" es el hermano elemento INMEDIATAMENTE SIGUIENTE del "<p>" cuyo contenido completo es "Precios de muestra · IVA incluido · pendientes de confirmar con el salón"
    # CF-4 y CF-C2. El literal se escribe A MANO (con el punto medio «·», U+00B7, y sin punto final). Es
    # la honestidad de CF-C5: declara el origen de las fotos, como las leyendas de equipo y galería.
    # «Una vez» mata la leyenda duplicada (p. ej., pintada dentro del `.map`, tres veces).

  @s9
  Scenario: La leyenda de precios NO cambia ni un byte
    Given el catálogo de servicios renderizado en el DOM
    When se lee el párrafo de la leyenda de precios
    Then su contenido completo es exactamente "Precios de muestra · IVA incluido · pendientes de confirmar con el salón", byte a byte, con sus dos «·» (U+00B7) y sin punto final
    And ese texto aparece EXACTAMENTE UNA VEZ en el catálogo
    And el párrafo de precios NO contiene "Fotos de banco de imágenes": las dos leyendas no se han fundido en una
    # Su contrato es de F-09 (Q-B) y F-27 no lo toca (CF-4, alternativa (a) descartada). Descartado
    # expresamente: alargar `LEYENDA_PRECIOS` con el aviso de las fotos.

  @s10
  Scenario: La sección navegable, su h2 oculto y los tres h3 siguen intactos: F-27 no añade ni quita ningún id ni encabezado
    Given el catálogo de servicios renderizado a HTML por SSR, sin ejecutar JavaScript ni hidratar
    When se inspecciona la estructura de la sección en el HTML horneado
    Then hay EXACTAMENTE UNA "<section" y declara aria-labelledby="servicios-titulo"
    And el ÚNICO atributo id del catálogo es id="servicios-titulo", y lo lleva un "<h2>" cuyo texto es exactamente "Servicios"
    And hay 0 "<h1>", 1 "<h2>" y EXACTAMENTE 3 "<h3>", cuyos textos son, en orden, "Manos y pies de Revista", "Tu piel, radiante" y "Piel suave y cuidada"
    And los tres rótulos de categoría siguen siendo, en orden, "Servicio de Uñas", "Servicio Facial" y "Servicio de Depilación"
    # El literal `servicios-titulo` se escribe A MANO en el test: mata el mutante que vacía `ID_SERVICIOS`.
    # «Único id» protege la puerta de anclas vivas de F-06 (las fotos no traen ids) y el destino del CTA
    # «Ver servicios» del hero; el `<h2>` sigue en el DOM, oculto solo a la vista (su clase del módulo no
    # es observable con `css: false`). El recuento de `<h3>` mata la flecha vaciada del `.map` de
    # categorías.

  @s11
  Scenario: Las tres cartas conservan sus seis filas y su enlace de reserva
    Given el catálogo de servicios renderizado en el DOM
    When se recorren las tres cartas de precios, en orden
    Then hay EXACTAMENTE TRES enlaces en el catálogo, sus textos son, en orden, "Reservar Uñas", "Reservar Facial" y "Reservar Depilación", y los tres declaran href="#reserva-titulo"
    And cada carta contiene EXACTAMENTE SEIS filas de servicio antes de su enlace, cada una con un nombre y un precio (18 filas en total)
    And la primera fila de cada carta es, en orden, "Manicura semipermanente" con "15 €", "Limpieza facial profunda" con "35 €" y "Cejas" con "12 €"
    # CF-C2 («el CTA queda intacto») y CF-C6: el recuento de filas mata la flecha vaciada del `.map` de
    # servicios. Las filas y sus precios son contrato de F-09 / de la demo; aquí solo se fija que F-27
    # no los mueve. Los literales se escriben A MANO.

  @s12
  Scenario: Las clases GLOBALES del diseño llegan al horneado en la sección, las tres cartas y los tres enlaces
    Given el catálogo de servicios renderizado a HTML por SSR, sin ejecutar JavaScript ni hidratar
    When se lee el atributo class de la "<section", de cada una de las tres cartas y de cada uno de los tres enlaces "Reservar …"
    Then el class de la "<section" contiene "demo-seccion"
    And el class de cada una de las tres cartas (el elemento que contiene las seis filas y el enlace) contiene "demo-card"
    And el class de cada uno de los tres enlaces contiene "demo-btn" y "demo-btn--solido"
    # CF-5 / CF-C6: mata los tres mutantes que VACÍAN los template literals `demo-seccion ${…}`,
    # `demo-card ${…}` y `demo-btn demo-btn--solido ${…}` de `Catalogo.tsx`. Son clases GLOBALES literales,
    # observables con `css: false` (el trozo del módulo sale `undefined`). Se lee el atributo del
    # horneado; ❌ `toHaveClass` prohibido. Precedentes: `equipo.test.tsx:128-138`,
    # `contacto.test.tsx:104-120`, `reserva.test.tsx:80`.

  @s13
  Scenario: Los alt describen lo que se ve y no fingen: ni «foto de», ni trabajo del salón, ni personas, y el de Depilación no afirma la técnica
    Given los tres alt de las fotos del catálogo, leídos del HTML horneado por SSR
    When se comparan, sin distinguir mayúsculas ni acentos, contra las expresiones prohibidas
    Then ninguno empieza por "foto de" ni por "imagen de"
    And ninguno contiene "nuestro", "nuestra", "del salón" ni "resultado"
    And ninguno contiene el nombre de ninguna de las siete profesionales del equipo ("Lucía", "Carla", "Andrea", "Nerea", "Marta", "Paula", "Sara")
    And el alt de Depilación no contiene la palabra "cera" ni la raíz "depil"
    # CF-C5 y CF-7. El `alt` dice lo que se ve, nunca «nuestro trabajo» ni «resultado del salón», nunca
    # identifica a una persona y no empieza por «Foto de…». Los siete nombres son un INDICADOR medible de
    # «no identifica a una persona»: impiden atar una foto de banco a una profesional de la sección de
    # equipo de la misma página (la ausencia de rostros la verificó el lead, P1, y no es testeable). Pexels
    # no dio ninguna foto de depilación CON CERA sin cara identificable: la elegida enseña «piel suave»
    # (la promesa de la tarjeta), y su `alt` no puede prometer lo que la foto no muestra.

  # ===========================================================================================
  # (B) DATOS — `src/lib/demo/catalogo-demo.ts` (CF-C1 / CF-3, I-7). Test de datos en `src/lib/demo/`
  # (precedente `resenas-demo.test.ts`). Aquí las constantes son el SUJETO: se comparan contra
  # literales escritos A MANO. El fichero sigue FUERA de `mutate` (es dato, como `equipo-demo.ts`).
  # ===========================================================================================

  @s14
  Scenario Outline: Cada categoría de los datos del catálogo lleva su foto y su alt
    Given los datos de muestra del catálogo, importados del módulo de datos del demo
    When se lee la categoría cuya clave es "<clave>"
    Then su campo "alt" es exactamente "<alt>"
    And su campo "foto" es una cadena no vacía que contiene "<fichero>"

    Examples:
      | clave      | fichero                            | alt                                                      |
      | unas       | servicio-unas-manicura-nude.jpg    | Manos con manicura en tono nude y anillos dorados        |
      | facial     | servicio-facial-pestanas.jpg       | Primer plano de pestañas largas sobre un párpado cerrado |
      | depilacion | servicio-depilacion-piel-suave.jpg | Mano extendiendo crema sobre una pierna de piel suave    |

    # CF-C1 / CF-3: `foto` es la URL que devuelve el `import` estático del `.jpg` (como `equipo-demo.ts`)
    # y `alt` el texto de CF-1. Caso límite 9: cambiar una foto es cambiar un fichero y un `alt` AQUÍ, sin
    # tocar la mecánica del componente.

  @s15
  Scenario: Los datos exportan la leyenda de las fotos, conservan intacta la de precios y el orden de las categorías
    Given el módulo de datos del catálogo del demo
    When se leen sus constantes exportadas de leyenda y la lista de categorías
    Then la leyenda de fotos exportada es exactamente "Fotos de banco de imágenes, ilustrativas del servicio · las fotos reales del salón se añaden antes de publicar"
    And la leyenda de precios exportada sigue siendo exactamente "Precios de muestra · IVA incluido · pendientes de confirmar con el salón"
    And las claves de las categorías son, en orden, exactamente "unas", "facial" y "depilacion": ninguna sobra ni falta
    # CF-C1: nueva constante `LEYENDA_FOTOS`; `LEYENDA_PRECIOS` no cambia ni un byte (contrato de F-09,
    # Q-B). El orden de las claves es el que da el orden de las fotos en @s1/@s7.

  @s16
  Scenario: Una categoría sin foto o sin alt NO compila: los dos campos son obligatorios
    Given un fichero de test que declara dos categorías de muestra completas salvo por un campo: a una le falta "foto" y a la otra le falta "alt", cada una precedida de una directiva "@ts-expect-error"
    When se ejecuta el comprobador de tipos del proyecto ("pnpm typecheck", parte de "bin/harness init")
    Then termina con código de salida 0, lo que SOLO ocurre si la ausencia de cada campo es un error de tipos
    And si "foto" o "alt" pasara a ser opcional, la directiva "@ts-expect-error" correspondiente quedaría sin error que justificar y el comprobador terminaría con código distinto de 0 (TS2578)
    # Caso límite 7: «no compila (campos obligatorios): no hay rama en tiempo de ejecución que probar».
    # Lo que SÍ se puede probar es que el tipo lo exige, y la única forma medible es el comprobador de
    # tipos (`tsconfig.json` incluye `src`, tests incluidos). Es ROJO de verdad antes del cambio: hoy las
    # dos categorías compilan y las dos directivas sobran → TS2578. Sin precedente en el repo: ver dudas
    # para la puerta en `progress/gherkin_catalogo_fotos.md`.

  # ===========================================================================================
  # (C) GUARDAS DE FUENTE Y DE FICHERO — lo que ni el render (`css: false`) ni Stryker ven. Se leen
  # BYTES (precedente `contacto-fuente.test.ts`, F-12 @s15). No son mutables: que muerden se
  # demuestra por SABOTAJE en `progress/tdd_catalogo_fotos.md`.
  # ===========================================================================================

  @s17
  Scenario: En la fuente del componente, la clase del hueco la lleva la img y la foto llega por el dato
    Given los bytes de la fuente del componente del catálogo, "src/components/Catalogo.tsx"
    When se leen como texto
    Then la referencia a la clase del hueco "estilos.foto" aparece EXACTAMENTE UNA VEZ en el fichero
    And esa única aparición está DENTRO de la etiqueta "<img": entre el "<img" y el "/>" que la cierra
    And la fuente NO contiene "aria-hidden"
    And la fuente NO contiene ".jpg" ni "assets/": el componente no importa ninguna foto, la recibe del dato
    # CF-2 («el `<img>` ES el hueco») y CF-3 («los tres `import` viven en el fichero de datos, no en el
    # componente»). Con `css: false` la clase del módulo no llega al render, así que la única prueba
    # unitaria de CF-2 es la fuente; la visual es @s23. «Exactamente una vez» caza el envoltorio
    # descartado (alternativa (a) de CF-2: `<div className={estilos.foto}><img/></div>`) y el hueco
    # duplicado.

  @s18
  Scenario: Los tres import de las fotos viven en el fichero de datos, estáticos y locales
    Given los bytes de la fuente de datos del catálogo, "src/lib/demo/catalogo-demo.ts"
    When se buscan en ella las sentencias "import" de ficheros ".jpg"
    Then hay EXACTAMENTE TRES
    And sus rutas terminan, una cada una, en "assets/servicios/servicio-unas-manicura-nude.jpg", "assets/servicios/servicio-facial-pestanas.jpg" y "assets/servicios/servicio-depilacion-piel-suave.jpg"
    And ninguna ruta de import empieza por "http://", "https://" ni "//"
    # CF-3, alternativa (b) descartada: Vite SOLO empaqueta lo que se importa estáticamente; una ruta
    # escrita como cadena (o derivada de la `clave`) pasaría @s14 en el test y dejaría `dist/` sin la foto.

  @s19
  Scenario: Los tres ficheros de foto miden de verdad 800 × 1000 y no llevan metadatos EXIF
    Given los tres ficheros "servicio-unas-manicura-nude.jpg", "servicio-facial-pestanas.jpg" y "servicio-depilacion-piel-suave.jpg" de "src/assets/servicios/"
    When se leen sus bytes y se recorren sus marcadores JPEG
    Then el marcador de inicio de trama (SOF, base o progresivo) de cada fichero declara exactamente 800 de ancho y 1000 de alto
    And ninguno contiene un segmento APP1 que empiece por "Exif"
    # CF-C2 («`ANCHO_FOTO = 800` y `ALTO_FOTO = 1000`: las medidas REALES de los ficheros») y CF-C4 («los
    # ficheros no llevan EXIF»). Sin esta guarda, cambiar una foto por otra de distinto tamaño (caso límite
    # 9) dejaría a width/height (@s4) mintiendo al navegador; y un EXIF colado publicaría autor, cámara o
    # ubicación (el original de Depilación traía «KAROLINA GRABOWSKA / KABOOMPICS»,
    # `progress/fotos_seleccion.md`). Los ficheros son JPEG progresivos (SOF2). Precedente: el
    # `tdd_craftsman` ya midió los 13 JPEG de equipo/galería con un lector de cabecera.

  # ===========================================================================================
  # (D) HOJA — `src/components/catalogo-estilos.test.ts` (NUEVO). Stryker no ve SCSS: el test LEE LOS
  # BYTES de `src/components/catalogo.module.scss` y extrae el cuerpo del bloque `.foto` contando
  # llaves (patrón `cuerpoDelBloque` de `equipo-estilos.test.ts`). Las regex toleran espacios
  # alrededor de «:», «,» y «/». Nunca `toHaveClass`, nunca jsdom para estilos.
  # ===========================================================================================

  @s20
  Scenario Outline: El bloque .foto de la hoja del catálogo declara lo que hace que la foto cubra el hueco 4:5
    Given los bytes de la hoja "src/components/catalogo.module.scss"
    When se lee el cuerpo del bloque ".foto"
    Then ese cuerpo declara "<declaración>"

    Examples:
      | declaración                                                              |
      | display: block                                                           |
      | width: 100%                                                              |
      | height: auto                                                             |
      | aspect-ratio: 4 / 5                                                      |
      | object-fit: cover                                                        |
      | border-radius: 22px                                                      |
      | border: 1px solid var(--line)                                            |
      | background: linear-gradient(160deg, var(--accent-soft), var(--surface2)) |

    # CF-C3. `aspect-ratio: 4 / 5` + `object-fit: cover` son las dos que la spec exige leer de bytes: sin
    # la primera la caja la decide la foto; sin la segunda la foto se deforma para llenar la caja. El
    # degradado rosa se QUEDA como fondo del propio `<img>`: es lo que se ve mientras carga o si falla
    # (caso límite 1, @s26). `border-radius` y el borde `--line` se conservan (no hay par de contraste
    # nuevo: la foto no es texto ni un color de token).

  @s21
  Scenario: El bloque .foto ya no fuerza un alto mínimo ni mueve el encuadre, y la rejilla responsive de F-08 sigue intacta
    Given los bytes de la hoja "src/components/catalogo.module.scss"
    When se leen la hoja completa y los cuerpos de los bloques ".foto" y ".rejilla"
    Then la hoja contiene EXACTAMENTE UN bloque ".foto"
    And el cuerpo de ".foto" NO contiene "min-height" ni "max-height", y su única declaración de alto es "height: auto"
    And el cuerpo de ".foto" NO contiene "object-position" (encuadre por defecto, centrado)
    And el cuerpo de ".foto" NO contiene "transition" ni "animation"
    And el cuerpo de ".rejilla" sigue declarando "grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr))"
    # CF-C3: sale el `min-height: 260px`, que con `aspect-ratio` solo podía deformar la caja en una columna
    # estrecha. `object-position` por defecto: los recortes ya están centrados en el sujeto. Caso límite
    # 10 (`prefers-reduced-motion`): no aplica porque nada se mueve, y esta negativa lo mantiene así.
    # Caso límite 2: a 320 px la rejilla de F-08 da una sola columna sin desbordar (se MIDE en @s23).
    # Caso límite 6 (densidad 2×, foto algo blanda en escritorio): ACEPTADO para la demo, el `srcset` es
    # de F-17 (bloqueada); no tiene escenario.

  # ===========================================================================================
  # (E) VERIFICACIÓN EN VIVO (I-8) — `@verificacion-viva`. NO son tests unitarios, NUNCA bajo jsdom.
  # Los corre el `craftsman_lead` tras el TDD sobre el `dist/` real (`pnpm build`, cinco puertas
  # verdes) servido con `vite preview` y abierto en Chrome real vía CDP. Evidencia (cifras, capturas,
  # sondas) en `progress/verificacion_viva_catalogo_fotos.md`. Si la medida contradice a la spec,
  # MANDA la medida y se anota.
  # ===========================================================================================

  @s22 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO, BYTES DE dist/] el HTML publicado trae las tres fotos horneadas y la leyenda, y el build pasa las cinco puertas
    Given el árbol de trabajo con F-27 implementada y la suite unitaria verde
    When se ejecuta "pnpm build" y se leen los bytes de "dist/index.html"
    Then "pnpm build" termina con código de salida 0 con las CINCO puertas verdes (placeholders · contraste · terceros · anclas · cascarón)
    And dentro de la sección aria-labelledby="servicios-titulo" hay EXACTAMENTE TRES "<img", y sus src, en orden, empiezan por "/NailsLashStudioWeb/assets/", contienen "servicio-unas-manicura-nude", "servicio-facial-pestanas" y "servicio-depilacion-piel-suave" y terminan en ".jpg"
    And cada una de las tres declara el alt exacto de @s1, width="800", height="1000" y loading="lazy"
    And los tres ".jpg" existen en "dist/assets/" con huella en el nombre, y ningún src del catálogo empieza por "http://", "https://", "//" ni "data:"
    And la leyenda de fotos aparece EXACTAMENTE UNA VEZ en "dist/index.html", justo después de la de precios
    And no hay ningún <link rel="preload" as="image"> que apunte a ninguna de las tres fotos
    # CF-C4: los bytes de `dist/` son lo que ve quien navega SIN JavaScript (caso límite 3). La puerta de
    # terceros de F-05 sigue verde por construcción (imports locales bajo `BASE_URL`). La última negativa
    # es la regresión de `cascaron_semantico.feature` @s40 (ENMIENDA 2): vite-react-ssg inyecta una
    # precarga por foto que el `<img loading="lazy">` no reutiliza, y `sinPrecargasDeImagen` la retira;
    # aquí se comprueba que también retira las tres nuevas.

  @s23 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] las tres fotos cubren su hueco sin deformarse de 320 a 1280 px, y ninguna petición sale del origen
    Given el "dist/" de producción servido con "vite preview" y abierto en Chrome real vía CDP
    When a 320, 360, 375, 390, 414, 768 y 1280 px de ancho se lleva el catálogo a la vista, se espera a que carguen las tres fotos y se miden
    Then a cada ancho, cada una de las tres "<img" del catálogo tiene "complete" true, "naturalWidth" 800 y "naturalHeight" 1000
    And su caja renderizada cumple alto = ancho × 1,25 (± 1 px) y su "object-fit" computado es "cover": cubre el hueco sin deformar la foto
    And su "border-radius" computado es "22px", y su atributo class es el de la clase generada del hueco (contiene "foto"), que ningún otro elemento del catálogo lleva
    And a 320 px la rejilla de cada categoría va a UNA columna, la foto mide ≈ 272 × 340 px (cifra de la spec; la real se anota y manda) y "document.documentElement.scrollWidth" no supera el ancho del viewport
    And todas las peticiones de red de la página van al propio origen, y las de los tres ".jpg" responden 200
    # Criterio de aceptación de `feature_list.json` #27 («3 fotos cubren su card sin deformarse, móvil
    # 320 px»). Es la contraparte visual de @s17 (CF-2: la `<img>` lleva la clase `.foto`) y de @s20
    # (CF-C3). Caso límite 2.

  @s24 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] CLS 0: las fotos diferidas entran en una caja ya reservada, también al saltar con «Ver servicios»
    Given el mismo "dist/" en Chrome real vía CDP, con un "PerformanceObserver" de "layout-shift" activo desde el inicio de la carga (buffered)
    When a cada ancho (320, 360, 375, 390, 414, 768 y 1280 px) se pulsa el CTA «Ver servicios» del hero y se espera a que terminen de cargar las tres fotos del catálogo
    Then a cada ancho, la suma de los "layout-shift" sin entrada reciente del usuario (CLS) es exactamente 0
    And la posición vertical del <h2 id="servicios-titulo"> respecto al viewport, medida justo tras el salto y otra vez con las tres fotos cargadas, difiere en 1 px o menos
    # Caso límite 4: con `loading="lazy"` las fotos cargan al acercarse, pero su caja ya está reservada
    # (width/height de @s4 + `aspect-ratio` de @s20), así que el ancla aterriza donde debe y nada empuja
    # el contenido. La segunda comprobación existe porque los desplazamientos justo después del clic
    # quedan fuera del CLS (`hadRecentInput`) y podrían esconder un salto real.

  @s25 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO CON CHROME — MEDIDA DE CF-6] ¿cae la foto de Uñas en el primer viewport a 1280 × 800 y a 1440 × 900?
    Given el mismo "dist/" en Chrome real vía CDP, con la caché vacía y sin desplazamiento
    When se carga la home a 1280 × 800 y a 1440 × 900 y se miden la foto de Uñas del catálogo y el elemento LCP
    Then en "progress/verificacion_viva_catalogo_fotos.md" queda anotado, para cada tamaño, el "getBoundingClientRect().top" de la foto de Uñas, el "window.innerHeight" y el elemento y el tiempo que reporta "largest-contentful-paint"
    And si en LOS DOS tamaños el "top" es mayor o igual que el "innerHeight" y el elemento LCP no es ninguna de las tres fotos del catálogo, CF-6 queda ratificada por medida y @s4 no cambia
    And si en ALGUNO de los dos tamaños el "top" es menor que el "innerHeight" o el LCP es una foto del catálogo, F-27 NO se marca done: decide el "craftsman_lead" (loading="eager" o fetchpriority="high" solo en la primera), con un escenario propio y la enmienda de @s4, nunca el "tdd_craftsman" por su cuenta
    # Caso límite 5 y CF-6: «en los tamaños medidos, el catálogo empieza debajo del hero [I, a verificar
    # en vivo]». Es una MEDIDA con dos salidas posibles, no una afirmación: por eso las dos ramas quedan
    # escritas y la que se cumpla se anota con la cifra.

  @s26 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] si una foto no carga, el hueco conserva su caja 4:5 y su degradado rosa, y enseña el alt
    Given el mismo "dist/" en Chrome real vía CDP, con las peticiones a los tres ".jpg" del catálogo bloqueadas ("Network.setBlockedURLs")
    When a 320 y a 1280 px se lleva el catálogo a la vista y se esperan los tres errores de carga
    Then cada una de las tres "<img" del catálogo tiene "naturalWidth" 0 (la carga falló)
    And su caja renderizada mide lo mismo que con la foto cargada en @s23 (± 1 px): alto = ancho × 1,25
    And su "background-image" computado contiene "linear-gradient": el hueco sigue pintando el degradado rosa
    And la captura de cada hueco, guardada como evidencia, muestra el texto de su alt dentro de la caja
    And "document.documentElement.scrollWidth" no supera el ancho del viewport
    # Caso límite 1: «la imagen falla al cargar → el `alt` se pinta dentro del hueco, sobre el degradado
    # rosa, y el hueco conserva el 4:5 (atributos width/height + aspect-ratio)».
