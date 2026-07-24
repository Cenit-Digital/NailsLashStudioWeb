# =============================================================================================
# 🔴 RETIRADA — 2026-07-24. Esta propuesta NUNCA cruzó la puerta humana (su propio encabezado
# lo dice: «Estado: PROPUESTA hasta la puerta humana», sin entrada en feature_list.json). Pablo
# eliminó el componente que la habría implementado (commit 479d541). Se conserva el fichero como
# registro histórico de la propuesta; no describe código vigente.
# =============================================================================================
# CONTRATO — botón FLOTANTE de WhatsApp (rama demo/lunes-prototipo, petición de Pablo:
# «completamente funcional»). Fichero NUEVO. Estado: PROPUESTA hasta la puerta humana.
#
# 🔴 NO TIENE ENTRADA PROPIA EN feature_list.json. Es una REBANADA de la feature id 13
#    (`solicitud_whatsapp`, XL, `pending`), NO la feature entera: F-13 exige componer la
#    solicitud (servicio/fecha/profesional), y ESTE contrato NO lo hace. Por eso NO se marca
#    F-13 como `spec_ready` (sería declarar cubierto un acceptance que estos escenarios no
#    cubren). → DECISIÓN A LA PUERTA nº 1 al final del fichero.
#
# =============================================================================================
# FUENTES LEÍDAS (no inventadas)
# =============================================================================================
#  · `src/lib/site.ts:104-108` — `waHref(tel, texto)`: `HOST_WHATSAPP` + E.164 SIN el "+" +
#    `?text=` con `encodeURIComponent`. Si `texto === ''` NO emite `?text=` [V: site.ts:107].
#    `site.ts:66-73` — el HOST está `Stryker disable next-line all` y el contrato de F-02
#    (A-10) ORDENA NO ASEVERARLO: `wa.me` vs `api.whatsapp.com/send` se verifica A MANO en
#    Android/iOS/WhatsApp Web. ESTE contrato hereda esa prohibición (@s1).
#  · `src/lib/demo/contacto-demo.ts:6` — `CONTACTO_WHATSAPP_TEXTO`: el PRECEDENTE exacto de
#    dónde vive un texto prellenado (una constante en `src/lib/demo/`), no en el `.tsx`.
#  · `src/components/Contacto.tsx:63-68` — el CTA de WhatsApp que YA existe DENTRO de
#    `#contacto` (`demo-btn demo-btn--wa` + `waHref(TELEFONO.legible, CONTACTO_WHATSAPP_TEXTO)`).
#    🔴 OJO: `src/pages/contacto-horneado.test.ts:133-140` (VERDE hoy) EXIGE `wa.me` DENTRO de
#    `#contacto`. Es decir, la prohibición del @s11 de `features/contacto.feature` YA ESTÁ
#    INVERTIDA en la rama demo. Este contrato NO se apoya en esa prohibición: monta el botón
#    fuera de `<main>` por razones de ESTRUCTURA (@s4), no para esquivar @s11.
#  · `src/pages/home.tsx:124-129` — `</main>` y luego `<Pie />` como hermanos dentro del
#    fragmento. Ese es el punto de montaje (@s4).
#  · `src/styles/_demo.scss:164-173` — `.demo-btn--wa`: `#25d366` / `#08130c` (~9,5:1) y su
#    `:hover` `#1fb757`. 🔴 CORRECCIÓN ADVERSARIAL: este par NO está en `MATRIZ_DE_USO` (que solo
#    contiene pares de TOKENS de `_tokens.scss` [V]); es un hex crudo de la hoja de utilidades, ya
#    en uso por `.demo-btn--wa` y por `reserva.module.scss:241-242`. Reutilizar la utilidad NO
#    obliga a tocar `MINIMO_DE_PARES` (sigue en 18) porque la puerta 3 solo evalúa las filas de la
#    matriz y este botón no añade ninguna — NO porque el par ya esté vigilado. No lo está (@s5).
#  · `src/components/contacto-estilos.test.ts` — el PATRÓN de cómo se asevera lo que es puro
#    CSS: `readFileSync` del `.module.scss` + `cuerpoDelBloque` contando llaves. NUNCA
#    `toHaveClass` (vitest.config.ts tiene `css:false` → `estilos.x` es `undefined` en test).
#  · WCAG 2.2 SC 2.4.11 «Focus Not Obscured (Minimum)» y la técnica de fallo F110
#    (https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum ,
#    https://www.w3.org/WAI/WCAG22/Techniques/failures/F110 ): contenido FIJO/STICKY que tapa
#    POR COMPLETO al componente que recibe el foco por teclado = FALLO. Este botón ES contenido
#    sticky → @s8.
#  · WCAG 2.2 SC 2.5.8 «Target Size (Minimum)»: 24×24 CSS px. El proyecto ADOPTA 44×44 (@s9).
#
# =============================================================================================
# 🔴 «VERDE ≠ FUNCIONA» — DÓNDE SE ASEVERA CADA COSA
# =============================================================================================
#  · El HREF horneado y la POSICIÓN en el documento → BYTES del HTML crudo de `dist/`
#    (`readFileSync` + string), NUNCA jsdom: jsdom solo ve el estado post-hidratación y aquí lo
#    que importa es el prerender del SSG (@s1, @s4, @s12).
#  · El ÁRBOL DE ACCESIBILIDAD (nombre accesible, rol) → `render` + `screen` por ROL y NOMBRE
#    ACCESIBLE (@s3). Lo horneado se asevera sobre `renderToString(<X/>)` (SSR).
#  · Lo que es PURO CSS (fijado, offsets, tamaño, no tapar el foco, reduced-motion,
#    focus-visible) → BYTES del `.module.scss` con `readFileSync` (@s7..@s10). Stryker NO ve
#    SCSS → esos escenarios son NO-MUTABLES por declaración.
#  · La ausencia de un literal en la FUENTE → BYTES del `.tsx` (@s2).
#  · El código de salida del build con las 5 puertas → `codigoSalida === 0` (@s5, @s6).
#
# =============================================================================================
# ANTI-TAUTOLOGÍA (regla dura del arnés)
# =============================================================================================
# TODO esperado se escribe A MANO en el test: "34625223366", el texto prellenado, su forma
# urlencoded, el `aria-label`. PROHIBIDO importar `TELEFONO`, `waHref` o la constante del texto
# desde producción para usarlos COMO VALOR ESPERADO, y PROHIBIDO re-ejecutar `waHref` dentro
# del test para comparar contra su propio resultado (precedente WebEmpresa: el doble atado al
# SÍMBOLO en vez de al LITERAL fue el primer mutante superviviente).
#
# ❌ PROHIBIDO EN ESTE CONTRATO, EN LOS TESTS Y EN LOS MENSAJES:
#    · ASEVERAR EL HOST de WhatsApp ("wa.me", "api.whatsapp.com", "https://wa.me/") en NINGÚN
#      test de esta feature (contrato de F-02, A-10, site.ts:66-71). Se asevera el NÚMERO y el
#      TEXTO; el host, NO. La negativa de @s2 sobre los bytes del `.tsx` es la ÚNICA mención
#      legítima del host, y es una PROHIBICIÓN de que aparezca, no una aserción de que aparezca.
#    · hardcodear el número (ni "625 22 33 66", ni "34625223366", ni "+34625223366") en el
#      `.tsx` del botón: el href DERIVA de `waHref(TELEFONO.legible, …)` (@s2).
#    · usar `<img src>` para el icono (rompería la puerta 4, cero terceros/subrecursos) (@s6).
#    · convertir el botón en `<section>` o darle `aria-labelledby` (despertaría las puertas 1 y
#      5) (@s5).
#    · aseverar por CLASE CSS o con `toHaveClass` (css:false → `estilos.x` es `undefined`).
#    · meter estado en un `className` condicional (inmatable por Stryker: 5 mutantes, 5
#      supervivientes). Este botón NO tiene estado: es un `<a>` estático (@s11).
#    · tocar NINGUNO de los ficheros del HERO (otra sesión trabaja en ellos ahora mismo).
#
# =============================================================================================
# ARTEFACTOS QUE ESTE CONTRATO CREA (nombres fijados aquí para que el tdd_craftsman no elija)
# =============================================================================================
#   src/components/BotonWhatsappFlotante.tsx            (export NOMBRADO, docblock citando esta feature)
#   src/components/boton-whatsapp-flotante.module.scss  (import como `estilos`)
#   src/components/boton-whatsapp-flotante.test.tsx     (render/SSR + árbol de accesibilidad)
#   src/components/boton-whatsapp-flotante-estilos.test.ts (BYTES del .module.scss)
#   src/lib/demo/boton-whatsapp-flotante-demo.ts        (la constante del texto prellenado)
#   src/pages/home.tsx                                  (una línea: el montaje, hermano de <Pie/>)
#
# =============================================================================================
# TRAZA
# =============================================================================================
#   «completamente funcional» (href real, sin JS)   → @s1, @s2, @s12
#   sin hardcodear número ni host                    → @s1, @s2
#   nombre accesible + icono decorativo              → @s3
#   montaje fuera de <main> y de <Contacto/>         → @s4
#   no rompe las 5 puertas del build                 → @s5, @s6
#   WCAG 2.2 SC 2.4.11 / F110 (no tapar el foco)     → @s8
#   WCAG 2.2 SC 2.5.8 (área táctil), adoptado 44×44  → @s9
#   SC 2.4.7 foco visible                            → @s10
#   prefers-reduced-motion: reduce                   → @s10
#   feature NO-MUTABLE (declaración medida)          → @s11
# =============================================================================================

Feature: Botón flotante de WhatsApp en la home — un enlace fijo en la esquina inferior derecha, con el mensaje ya escrito, que funciona sin JavaScript y que NUNCA tapa por completo lo que tiene el foco
  Como visitante quiero un acceso permanente a WhatsApp mientras recorro la home, para poder
  escribir al salón desde donde esté sin volver a la sección de contacto; y como responsable
  del proyecto quiero que ese acceso derive del teléfono único de F-02, no estorbe a quien
  navega con teclado ni añada un solo subrecurso externo.

  # ---------------------------------------------------------------------------
  # EL HREF — derivado de la fuente única F-02. El HOST no se asevera (A-10).
  # ---------------------------------------------------------------------------

  @s1
  Scenario: el href del botón flotante lleva el número único de F-02 y el mensaje prellenado urlencoded — sin aseverar el host
    Given el HTML CRUDO prerenderizado de la ruta "/" con el botón flotante horneado por el SSG
    When se localiza el enlace con id "whatsapp-flotante" y se lee su atributo href sin ejecutar JavaScript
    Then el href contiene la subcadena "34625223366" (el E.164 SIN el "+", tal y como lo emite waHref)
    And el href contiene la subcadena "?text=Hola%2C%20quiero%20reservar%20una%20cita%20en%20Nails%20Lash%20Studio."
    And el href NO contiene un espacio en crudo ni la coma sin codificar: el texto viaja urlencoded, no literal
    And el href NO contiene "625 22 33 66" (el formato legible NO viaja en el enlace)
    And ningún test de esta feature asevera el HOST del enlace ("wa.me" ni "api.whatsapp.com"): el host queda fuera del contrato por A-10 y se verifica A MANO en Android, iOS y WhatsApp Web
    # «Completamente funcional» = el href está HORNEADO en dist/ y abre WhatsApp con el texto
    # puesto. Los literales "34625223366" y la cadena urlencoded se escriben A MANO en el test;
    # JAMÁS se comparan contra `waHref(TELEFONO.legible, TEXTO)` re-ejecutado (tautología: el
    # test pasaría aunque waHref emitiera basura). El host se OMITE deliberadamente: F-02 lo
    # dejó `Stryker disable` justo porque el contrato ordena no atarlo [V: site.ts:66-73].

  @s2
  Scenario: el .tsx del botón NO hornea ni el número ni el host — el href DERIVA de waHref (guarda a nivel de FUENTE)
    Given los bytes de "src/components/BotonWhatsappFlotante.tsx" leídos como texto, igual que el repo lee el .module.scss
    When se buscan en esos bytes los literales del teléfono y del host de WhatsApp
    Then el .tsx NO contiene "625 22 33 66", ni "34625223366", ni "+34625223366"
    And el .tsx NO contiene "wa.me" ni "api.whatsapp.com" ni "whatsapp.com": el host vive SOLO en HOST_WHATSAPP de src/lib/site.ts
    And el .tsx SÍ contiene una llamada a "waHref(" y SÍ importa "TELEFONO" desde "../lib/site" (ANCLA POSITIVA: prueba de que el fichero se leyó y NO está vacío)
    And el .tsx NO contiene el texto prellenado literal "Hola, quiero reservar una cita en Nails Lash Studio.": ese texto vive en la constante de src/lib/demo/
    # 🔴 EL AGUJERO QUE NI @s1 NI LA MUTACIÓN MUERDEN: un href DERIVADO y uno HORNEADO producen
    # BYTES IDÉNTICOS en dist/, así que @s1 NO obliga a derivar. Esta guarda de FUENTE sí. Es el
    # mismo patrón que el @s15 de features/contacto.feature con "instagram.com". El ANCLA
    # POSITIVA es obligatoria: sin ella, un fichero vacío o mal ruteado pasaría las cuatro
    # negativas por VACUIDAD (doctrina `puerta-anclas.ts`: «NUNCA verde por vacuidad»).

  # ---------------------------------------------------------------------------
  # ACCESIBILIDAD DEL NOMBRE Y DEL ICONO — árbol de accesibilidad, no clases CSS.
  # ---------------------------------------------------------------------------

  @s3
  Scenario: el botón se anuncia con un nombre accesible explícito y su icono es decorativo, no un <img>
    Given el componente BotonWhatsappFlotante renderizado
    When se consulta el árbol de accesibilidad por ROL y NOMBRE ACCESIBLE
    Then existe EXACTAMENTE un elemento de rol "link" cuyo nombre accesible es exactamente "Abrir chat de WhatsApp con Nails Lash Studio"
    And ese nombre proviene de un atributo aria-label del propio enlace, no del texto del icono
    And el icono es un <svg> INLINE con aria-hidden="true" y focusable="false", de modo que NO aporta nada al nombre accesible ni recibe el foco en navegadores antiguos
    And en el marcado del componente NO existe ninguna etiqueta <img
    # El literal del aria-label se escribe A MANO en el test, NUNCA importado del componente.
    # `focusable="false"` NO es redundante con `aria-hidden`: evita que el SVG entre en el orden
    # de tabulación en motores antiguos. La ausencia de <img> es además la mitad de la defensa
    # de la puerta 4 (@s6): un <img src> sería un SUBRECURSO.

  # ---------------------------------------------------------------------------
  # EL MONTAJE — fuera de <main>, fuera de <Contacto/>, hermano de <Pie/>.
  # ---------------------------------------------------------------------------

  @s4
  Scenario: el botón se monta FUERA de <main> y FUERA de la sección #contacto, como hermano de <Pie/>
    Given el HTML CRUDO prerenderizado de la ruta "/"
    When se comparan las posiciones (índices de carácter) del cierre "</main>" y del enlace con id "whatsapp-flotante", y se EXTRAE aparte la sección "#contacto"
    Then el documento SÍ contiene "</main>" y SÍ contiene 'id="whatsapp-flotante"' (ANCLA POSITIVA: prueba de que ambas búsquedas encontraron algo y ninguna comparación se hace contra -1)
    And el índice del enlace con id "whatsapp-flotante" es MAYOR que el índice de "</main>": el botón NO vive dentro del landmark principal
    And la sección "#contacto" extraída SÍ contiene el href "tel:+34625223366" (ANCLA POSITIVA: la extracción NO devolvió "")
    And en esa MISMA sección extraída NO aparece 'id="whatsapp-flotante"': el botón flotante NO es el CTA de WhatsApp de #contacto, son dos enlaces distintos
    # 🔴 LA COMPARACIÓN DE ÍNDICES ES LA TRAMPA CLÁSICA: `indexOf` devuelve -1 cuando no
    # encuentra, y "-1 < X" sería VERDADERO. Por eso las dos anclas positivas van PRIMERO y son
    # obligatorias. Un botón fijo dentro de `<main>` sería contenido del landmark principal
    # aunque visualmente flote; fuera de él es un complemento persistente de la página, hermano
    # de `<Pie/>` [V: home.tsx:124-129].
    # 🔴 NOTA DE HONESTIDAD: la razón NO es el @s11 de features/contacto.feature. Ese @s11
    # prohibía `wa.me` dentro de `#contacto`, pero la rama demo YA LO INVIRTIÓ y hoy
    # `src/pages/contacto-horneado.test.ts:133-140` EXIGE `wa.me` ahí dentro (VERDE). La razón
    # real es ESTRUCTURAL: un elemento `position: fixed` que acompaña a toda la página no
    # pertenece al contenido de una sección concreta.

  # ---------------------------------------------------------------------------
  # LAS 5 PUERTAS DEL BUILD — el botón NO debe despertar ninguna.
  # ---------------------------------------------------------------------------

  @s5
  Scenario: el botón NO es una <section>, NO añade anclas a la nav y NO añade un par a la matriz de contraste — las puertas 1, 3 y 5 siguen en verde
    Given el proyecto construido con "pnpm build" y sus CINCO puertas
    When se inspeccionan el código de salida del build y el HTML crudo de la ruta "/"
    Then el código de salida del build es 0
    And el enlace con id "whatsapp-flotante" es un <a>, NO una <section>, y NO lleva atributo aria-labelledby (puerta 1: cascarón, no le pide heading)
    And el documento sigue teniendo EXACTAMENTE un <h1> (el botón no aporta ningún heading)
    And ningún href de dentro de <nav> apunta a "#whatsapp-flotante" (puerta 5: la igualdad de conjuntos nav↔secciones navegables NO cambia)
    And el .module.scss del botón NO declara ningún "color" ni ningún "background" propios: el color lo pone una utilidad GLOBAL de src/styles/_demo.scss que YA existe y YA se usa, de modo que el botón NO estrena ninguna pareja de colores
    And MINIMO_DE_PARES de src/lib/puerta-contraste.ts sigue valiendo EXACTAMENTE 18 y MATRIZ_DE_USO no gana ninguna fila (puerta 3)
    # 🔴 CORREGIDO EN LA REVISIÓN ADVERSARIAL, DOS FALLOS EN ESTE MISMO `Then`:
    #  (1) v1 exigía «el botón USA las clases demo-btn demo-btn--wa» → eso es ASEVERAR POR CLASE
    #      CSS, prohibido de raíz por el repo (`css:false` en vitest.config.ts). Se sustituye por
    #      la forma MEDIBLE y equivalente: que la hoja del botón NO declare color/background
    #      propios (bytes del `.module.scss`, patrón `contacto-estilos.test.ts`) + que el literal
    #      `MINIMO_DE_PARES` no se mueva. Qué clase se escriba en el `className` es implementación.
    #  (2) v1 afirmaba que el par `#25d366`/`#08130c` «YA está en la matriz [V: _demo.scss:164-173]».
    #      FALSO, y la cita se delata sola: `_demo.scss` es la HOJA DE ESTILOS, no la matriz. La
    #      matriz es `MATRIZ_DE_USO` de `src/lib/puerta-contraste.ts` y está compuesta ÍNTEGRAMENTE
    #      por pares de TOKENS de `_tokens.scss` [V, fichero leído]: el verde de WhatsApp es un hex
    #      crudo de `_demo.scss` y NO figura en ella. La CONCLUSIÓN de v1 sigue siendo correcta
    #      (reutilizar la utilidad no obliga a tocar `MINIMO_DE_PARES`), pero por otra razón: la
    #      puerta 3 solo evalúa las filas de `MATRIZ_DE_USO`, y este botón no añade ninguna. Un
    #      test escrito sobre la afirmación de v1 («el par está en la matriz») nacería ROJO.
    # Inventar un color propio para el botón sí obligaría a añadir fila y a subir a mano
    # `MINIMO_DE_PARES` (es un literal), y ese es el tipo de cambio que rompe el build en silencio.
    # El `id` del enlace NO es el `id` de una sección navegable: la puerta 5
    # compara los `href="#…"` de dentro de `<nav>` con los ids de las `<section aria-labelledby>`,
    # y este `<a>` no es ninguna de las dos cosas.

  @s6
  Scenario: el botón NO introduce ningún subrecurso externo ni ningún literal placeholder — las puertas 2 y 4 siguen en verde
    Given el proyecto construido con "pnpm build" y el fichero .module.scss del botón
    When se inspeccionan el HTML crudo de "/" y los bytes del .module.scss
    Then el código de salida del build es 0
    And el marcado del botón NO contiene <img, ni <iframe, ni <script, ni un <link>, ni un href de fuente externa: el icono es un <svg> inline (puerta 4)
    And el .module.scss del botón NO contiene "url(" ni "@font-face": el icono NO se carga como imagen de fondo (puerta 4)
    And el .module.scss del botón SÍ contiene el selector ".flotante" (ANCLA POSITIVA: prueba de que la hoja se leyó y NO está vacía — sin esto las dos negativas anteriores pasarían por VACUIDAD)
    And el marcado del botón NO contiene ninguno de los literales prohibidos "IMAGEN TEMPORAL", "Plantilla de demostracion", "600123456", "hola@nailslashstudio.com", "Calle de la Belleza" ni "ph-woman" (puerta 2)
    # Un `background-image: url(icono.svg)` sería un SUBRECURSO y mataría el build igual que un
    # `<img src>`. Por eso la negativa se hace SOBRE LOS BYTES del SCSS y no solo sobre el HTML.
    # El ancla positiva `.flotante` es obligatoria: un `.module.scss` vacío o inexistente pasaría
    # «no contiene url(» por vacuidad.

  # ---------------------------------------------------------------------------
  # LO QUE ES PURO CSS — BYTES del .module.scss (patrón contacto-estilos.test.ts).
  # NO-MUTABLE: Stryker no ve SCSS.
  # ---------------------------------------------------------------------------

  @s7
  Scenario: el botón está FIJADO a la esquina inferior derecha del viewport, leído de los bytes del SCSS
    Given los bytes de "src/components/boton-whatsapp-flotante.module.scss"
    When se extrae el cuerpo del bloque ".flotante" contando llaves (robusto al reformateo de prettier)
    Then el cuerpo declara "position: fixed"
    And declara una propiedad "bottom" y una propiedad "right", ambas con un valor mayor que 0 (no queda pegado al borde)
    And NO declara "left" ni "top" ni "inset: 0": el botón se ancla a UNA esquina, no se estira por el viewport
    And declara un "z-index" con valor numérico explícito, para que quede por encima del contenido y NO dependa del orden del documento
    # Leer los bytes prueba que la REGLA EXISTE; que el resultado se vea bien es verificación
    # VISUAL + puerta humana. NO-MUTABLE (Stryker no ve SCSS): lo aseveran estos tests, no
    # Stryker. Patrón exacto de `contacto-estilos.test.ts` (`cuerpoDelBloque`).

  @s8
  Scenario: el botón NO puede tapar POR COMPLETO al elemento que recibe el foco por teclado — WCAG 2.2 SC 2.4.11, fallo F110
    Given los bytes de "src/components/boton-whatsapp-flotante.module.scss" y el cuerpo del bloque ".flotante"
    When se leen las declaraciones de tamaño y de ocupación del bloque
    Then el cuerpo NO declara "width: 100%", ni "width: 100vw", ni "inset: 0": el botón NUNCA ocupa el ancho completo del viewport
    And su "width" y su "height" son valores ACOTADOS y no superan 5rem cada uno
    And se DECLARA que estos bytes son un PROXY de que el botón es un objeto pequeño de esquina, NO una prueba de que ningún elemento enfocable quede oculto: la conformidad real con SC 2.4.11 se acredita RECORRIENDO LA HOME CON EL TABULADOR y comprobando que cada elemento enfocado sigue siendo visible al menos en parte
    And ese recorrido con tabulador queda como VERIFICACIÓN MANUAL declarada en progress/, no como test verde
    # https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum y
    # https://www.w3.org/WAI/WCAG22/Techniques/failures/F110 : el fallo F110 es «contenido
    # sticky/fijo que oculta POR COMPLETO el elemento con el foco». Un botón de 3,5rem en una
    # esquina no puede ocultar por completo un elemento a ancho de página, PERO SÍ podría
    # ocultar por completo un objetivo pequeño situado justo debajo (p. ej. un enlace del pie).
    # 🔴 POR ESO EL TERCER Y CUARTO `Then` SON OBLIGATORIOS: el byte del SCSS NO mide la
    # conformidad, y decir lo contrario sería fingir cobertura normativa. Misma honestidad que
    # el @s6 de features/contacto.feature con la «prominencia».

  @s9
  Scenario: el área táctil del botón es de al menos 44×44 px CSS — criterio de proyecto por encima del mínimo de SC 2.5.8 (24×24)
    Given los bytes de "src/components/boton-whatsapp-flotante.module.scss" y el cuerpo del bloque ".flotante"
    When se leen su "width", su "height" y su "min-height"
    Then el ancho declarado equivale a 44 px CSS o más (p. ej. 3.5rem = 56px con la raíz por defecto de 16px)
    And el alto declarado equivale a 44 px CSS o más
    And se DECLARA que el mínimo NORMATIVO de WCAG 2.2 SC 2.5.8 «Target Size (Minimum)» es 24×24 px CSS, y que 44×44 es una DECISIÓN DE PROYECTO más exigente, NO una exigencia de la norma
    And la equivalencia rem→px asume una raíz de 16px, que es un SUPUESTO declarado, no una medición
    # Se cita SC 2.5.8 con su umbral REAL (24×24) y se separa del umbral ADOPTADO (44×44). El
    # repo prohíbe la atribución normativa a la ligera: inventar que «WCAG exige 44» sería
    # exactamente eso (44×44 aparece en SC 2.5.5 Target Size Enhanced, que es AAA).

  @s10
  Scenario: el botón muestra el foco de teclado y anula TODA transición bajo prefers-reduced-motion
    Given los bytes de "src/components/boton-whatsapp-flotante.module.scss"
    When se extraen el cuerpo del bloque ".flotante" y el cuerpo del bloque "@media (prefers-reduced-motion: reduce)"
    Then existe una regla ":focus-visible" para el botón que declara un "outline" con un ancho mayor que 0 y un "outline-offset": quien navega con teclado VE dónde está
    And existe un bloque "@media (prefers-reduced-motion: reduce)" en la hoja
    And dentro de ese bloque se declara "transition: none" y "animation: none" para el botón: no queda movimiento residual
    And ninguna transición ni animación del botón se hornea INLINE en el .tsx (un estilo inline gana en especificidad a la @media de la hoja y derrotaría la preferencia del usuario)
    # El último `Then` es la lección YA PAGADA por F-07 (hero_marca): una animación inline vence
    # al `@media (reduce){animation:none}` de la hoja. Se asevera como negativa sobre los bytes
    # del `.tsx` (que no contenga "transition:" ni "animation:" ni un atributo `style=`).
    # NO-MUTABLE. `:focus-visible` cubre SC 2.4.7 (Focus Visible, AA).

  # ---------------------------------------------------------------------------
  # MUTACIÓN — esta feature NO tiene lógica propia. Se declara y se MIDE.
  # ---------------------------------------------------------------------------

  @s11
  Scenario: la feature es NO-MUTABLE — no añade ni un solo predicado nuevo, y eso se comprueba sobre los bytes de la fuente
    Given los bytes de "src/components/BotonWhatsappFlotante.tsx"
    When se busca en ellos cualquier construcción condicional
    Then el .tsx NO contiene "if (", ni el operador ternario "?" fuera de una cadena, ni "&&", ni "||": el componente es render PURO, un <a> estático sin estado
    And el .tsx NO contiene ningún className CONDICIONAL (la construcción que Stryker no puede matar: 5 mutantes, 5 supervivientes)
    And el .tsx SÍ contiene "export function BotonWhatsappFlotante" (ANCLA POSITIVA: el fichero se leyó y NO está vacío)
    And se DECLARA que toda la lógica que esta feature consume (waHref, la normalización a E.164, el encodeURIComponent) YA es de F-02, YA está cubierta al 100% por src/lib/site.test.ts y NO se re-testea aquí
    And si al ejecutar la mutación apareciera un mutante nuevo en el ámbito de esta feature, el tdd_craftsman ESCALA AL HUMANO: no lo excluye, no baja el umbral y no lo declara equivalente por su cuenta
    # `mutable: false`, como la rejilla de F-08 o la tipografía de F-21: se dice POR ESCRITO en
    # `progress/` en vez de fingir cobertura. La ausencia de condicionales no es capricho de
    # estilo: es lo que HACE que la declaración sea cierta y, además, mantiene el estado fuera
    # de un `className` (regla dura del repo). El botón no tiene estado que exponer, así que no
    # necesita `aria-pressed` ni `aria-expanded`.

  # ---------------------------------------------------------------------------
  # CASOS LÍMITE Y FRONTERAS.
  # ---------------------------------------------------------------------------

  @s12
  Scenario: hay EXACTAMENTE un botón flotante en la home y funciona sin JavaScript
    Given el HTML CRUDO prerenderizado de la ruta "/", sin ejecutar JavaScript
    When se cuentan las apariciones de 'id="whatsapp-flotante"' en TODO el documento
    Then aparece EXACTAMENTE 1 vez (ni cero por no haberse montado, ni dos por haberse montado también dentro de <Contacto/>)
    And ese enlace ya trae su href completo HORNEADO en el HTML: no hay onclick, ni data-href, ni ningún atributo que exija hidratación para que el enlace funcione
    And se DECLARA que «funciona sin JavaScript» se acredita AQUÍ por PROXY —un "<a href>" completo en los bytes del prerender, sin atributos que exijan hidratación—, NO por una ejecución real con JS deshabilitado: vitest/jsdom no puede apagar el JS que él mismo ejecuta
    And la comprobación real con JavaScript deshabilitado en el navegador queda como VERIFICACIÓN MANUAL declarada en progress/, no como test verde
    # «Completamente funcional» (petición de Pablo) se traduce aquí a algo MEDIBLE: el enlace
    # vive en los bytes del prerender, no en el JS. Un `id` duplicado, además, es HTML inválido
    # y rompería `document.getElementById` para cualquiera. El conteo se hace sobre el
    # documento ENTERO, no sobre un fragmento.

  @s13
  Scenario: el texto prellenado vive en src/lib/demo/ y NO puede quedar vacío — si se vaciara, el enlace perdería el "?text=" en silencio
    Given la constante del texto prellenado declarada en "src/lib/demo/boton-whatsapp-flotante-demo.ts"
    When se lee su valor y se observa el href resultante en el HTML crudo de "/"
    Then la constante NO es la cadena vacía y tiene más de 10 caracteres
    And el href horneado SÍ contiene "?text=": el mensaje viaja de verdad, el usuario no abre un chat en blanco
    And el fichero de la constante declara, en su docblock, que el mensaje lo ENVÍA el usuario desde su propio WhatsApp (el enlace solo abre el chat con el texto puesto)
    # 🔴 EL BORDE REAL DE `waHref` [V: site.ts:107]: `texto === '' ? enlace : enlace + '?text=…'`.
    # Con el texto vacío el enlace SIGUE FUNCIONANDO y SIGUE SIENDO VERDE en @s1 salvo por la
    # aserción del `?text=` — es decir, la feature se degradaría EN SILENCIO a «abre un chat en
    # blanco». Este escenario blinda ese borde. El docblock replica la honestidad de
    # `contacto-demo.ts:2-5`: prometer «pide tu cita» sería prometer que alguien contesta.

  @s14
  Scenario: el botón flotante NO compone la solicitud (servicio, fecha, profesional) — eso es F-13 y NO se construye aquí
    Given el HTML CRUDO prerenderizado de la ruta "/" con el botón flotante
    When se inspecciona su href y su marcado
    Then el href SÍ contiene "?text=" con un mensaje genérico FIJO (ANCLA POSITIVA: el enlace tiene mensaje)
    And ese mensaje NO contiene ningún nombre de servicio, ninguna fecha, ninguna hora ni ningún nombre de profesional: no hay composición dinámica
    And el botón NO abre ningún formulario, ningún panel ni ningún flujo previo: un solo clic va directo a WhatsApp
    # FRONTERA con la feature id 13 `solicitud_whatsapp` (XL, `pending`), que SÍ compone la
    # solicitud a partir de lo que el usuario elige. Este contrato entrega el ACCESO PERMANENTE
    # como entregable autónomo de la demo. Declararlo aquí impide dos cosas: que esta rebanada
    # invada F-13 «mejorando» el mensaje, y que alguien dé F-13 por cerrada con esto.

  # ---------------------------------------------------------------------------
  # DECISIONES QUE VAN A LA PUERTA — el autor PROPONE, el humano DECIDE
  # ---------------------------------------------------------------------------
  # 1. ENTRADA EN feature_list.json. Esta feature NO existe en el fichero; es una rebanada de la
  #    id 13 (`solicitud_whatsapp`, `pending`).  → RECOMENDADO: NO tocar el `status` de la id 13
  #    (marcarla `spec_ready` daría por especificada la composición de la solicitud, que estos
  #    escenarios NO cubren, @s14). Opciones para el humano: (a) dejarlo como está y anotar la
  #    rebanada en `progress/` —recomendado—, (b) crear una entrada nueva `boton_whatsapp_flotante`
  #    con `mutable: false` y `status: spec_ready`, (c) partir la id 13 en dos.
  #
  # 2. TEXTO PRELLENADO. `CONTACTO_WHATSAPP_TEXTO` ya existe con «Hola, me gustaría reservar una
  #    cita en Nails Lash Studio.»  → RECOMENDADO: constante NUEVA y PROPIA
  #    (`BOTON_WHATSAPP_FLOTANTE_TEXTO` = «Hola, quiero reservar una cita en Nails Lash Studio.»),
  #    para que los dos puntos de entrada sean distinguibles cuando lleguen los mensajes al
  #    móvil del salón. Alternativa: reutilizar la de contacto (menos duplicación, pero los dos
  #    CTA quedan indistinguibles en el chat). → @s1, @s13.
  #
  # 3. `target="_blank"`. El CTA de `#contacto` NO lo lleva [V: Contacto.tsx:63-68]; el «Cómo
  #    llegar» SÍ.  → RECOMENDADO: NO ponerlo, por coherencia con el otro CTA de WhatsApp y
  #    porque abrir pestaña nueva obliga a anunciarlo en el nombre accesible. Si el humano lo
  #    quiere, hay que añadir `rel="noopener"` Y ampliar el `aria-label` de @s3.
  #
  # 4. ¿SE OCULTA EL BOTÓN AL LLEGAR A `#contacto`? Ahí ya hay un CTA de WhatsApp idéntico y el
  #    flotante se le superpone.  → RECOMENDADO: NO para la demo (exigiría IntersectionObserver
  #    = estado = lógica = deja de ser NO-MUTABLE, @s11). Se revisa tras la verificación visual.
  #
  # 5. `aria-label` = «Abrir chat de WhatsApp con Nails Lash Studio».  → RECOMENDADO: sí, es
  #    inequívoco y NO colisiona con el «Escríbenos por WhatsApp» de `#contacto` (dos enlaces al
  #    mismo destino con el MISMO nombre accesible confunden a quien navega por lista de
  #    enlaces). → @s3.
  #
  # VERIFICACIÓN MANUAL QUE ACOMPAÑA A LA PUERTA (no es un test verde, @s8):
  #  · Recorrer la home ENTERA con el tabulador y confirmar que ningún elemento enfocado queda
  #    OCULTO POR COMPLETO tras el botón (SC 2.4.11 / F110). Atención especial a los últimos
  #    enlaces del pie, que son los que caen bajo la esquina inferior derecha.
  #  · Abrir el enlace en Android, iOS y WhatsApp Web y confirmar que el chat abre CON el texto
  #    puesto (el host `wa.me` NO lo cubre ningún test, por A-10: esta es su única verificación).
  #  · Comprobar a 320px de ancho que el botón no tapa contenido ni provoca scroll horizontal.
  #  · Cargar la home con JavaScript DESHABILITADO en el navegador y confirmar que el botón sigue
  #    ahí y sigue abriendo WhatsApp (@s12 solo lo acredita por PROXY sobre los bytes del
  #    prerender: jsdom no puede apagar el JS que él mismo ejecuta).
