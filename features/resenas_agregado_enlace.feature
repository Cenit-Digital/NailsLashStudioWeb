# =============================================================================================
# Contrato de `resenas_agregado_enlace` — v1 (2026-07-23). Feature 14 RE-ENCUADRADA por decisión
# de Pablo (AskUserQuestion, 2026-07-23): sección nueva ENTRE #equipo y #reserva con (a) la nota
# agregada REAL de Treatwell en UNA línea discreta — atribuida, enlazada y fechada — y (b) un
# carrusel coverflow de TESTIMONIOS PROPIOS DE EJEMPLO que hereda TODA la conducta de la galería
# v3. SUSTITUYE al borrador `features/resenas_destacadas.feature` (su posición «antes del FAQ» y
# su contenido —los autores del reviewPool de #equipo— quedaron obsoletos con el re-encuadre;
# retirar aquel fichero del árbol es decisión del lead, no de este contrato).
#
# FUENTE DE VERDAD: `progress/galeria_v3_resenas_diseno.md` (brief del lead, §§1-2 y 5-7) +
# `feature_list.json` F-14 (title/description/acceptance ya re-encuadrados; la decisión de
# plataforma `bloqueada_para_publicar` está RESUELTA: Treatwell) + `docs/research/legal-treatwell.md`
# (raíles legales [V]). Fuentes LEÍDAS para estilo y puertas: `features/galeria_carrusel.feature`
# v3 (EL CONTRATO PADRE de la conducta del carrusel), `src/lib/demo/equipo-demo.ts` (patrón
# LEYENDA_EQUIPO y reviewPool), `src/pages/home.tsx` y `src/pages/home-horneado.test.ts`.
#
# LA REGLA DE ORO: EL CARRUSEL HEREDA POR REFERENCIA (@s8). La conducta contratada en
# `features/galeria_carrusel.feature` v3 (@s3..@s24) APLICA ENTERA al carrusel de testimonios
# leyendo «foto» como «testimonio»; este fichero fija SOLO las diferencias. PROHIBIDO duplicar
# aquí los escenarios de la galería o re-litigar sus decisiones (el empate del camino corto por
# la derecha, el foco que no reanuda, el aria-hidden prohibido, la costura sin frenazo…).
#
# ---------------------------------------------------------------------------------------------
# TECHO: 9 escenarios (@s1..@s9), bajo el tope de ≤14 del encargo del lead. No se amplía sin
# humano.
# ---------------------------------------------------------------------------------------------
#
# LOS RAÍLES LEGALES (NO negociables — investigación [V] en `docs/research/legal-treatwell.md`)
# ---------------------------------------------------------------------------------------------
#   · ❌ NI UN texto de reseña de Treatwell (cl. 4.2/9.1 de sus términos: el salón «no tiene
#     ningún derecho sobre las reseñas»; PI art. 17 TRLPI; RGPD por los nombres). Los testimonios
#     del carrusel son PROPIOS y de EJEMPLO, con leyenda visible (@s4, @s5), sustituibles por
#     reseñas reales de clientas captadas con consentimiento EN EL SALÓN.
#   · ✅ La NOTA AGREGADA sí, SIEMPRE con plataforma declarada + enlace a la fuente + fecha del
#     dato (@s2). MEDIDO en vivo el 2026-07-23: 4,9 · 1.239 opiniones.
#   · ✅ (N) Art. 20.4 TRLGDCU: el aviso sobre el origen va INTEGRADO en la leyenda de honestidad
#     (@s5), sin banner — decisión de Pablo.
#   · ❌ Sin `aggregateRating` (ni `review`) en el JSON-LD (@s6): las valoraciones de terceros no
#     se marcan como propias en el structured data.
#
# REGLAS DE REDACCIÓN Y DE TEST (las de la cabecera del contrato de galería, ÍNTEGRAS)
# ---------------------------------------------------------------------------------------------
#   · PROHIBIDO aseverar por clase CSS o con `toHaveClass` (`css: false` en `vitest.config.ts`
#     hace inmatable al mutante del className condicional): se asevera por ROL, NOMBRE ACCESIBLE,
#     TEXTO, `data-*` o `style` inline. El SCSS, leyendo sus BYTES (@s9).
#   · PROHIBIDO crear un CUARTO test build-based: lo horneado se cubre con `renderToString`, y el
#     JSON-LD ampliando el `home-horneado.test.ts` EXISTENTE (@s6).
#   · ANTI-TAUTOLOGÍA: los cinco valores del agregado, los seis testimonios, la leyenda y las
#     etiquetas ARIA se escriben A MANO en los tests; prohibido importar constantes de producción
#     como valor esperado. (Comparar DOS fuentes de producción ENTRE SÍ — @s4 contra el
#     reviewPool — no es tautología: es la propiedad de disyunción.)
#   · STRYKER: `Resenas.tsx`, `carrusel-logica.ts` y `resenas-agregado.ts` ENTRAN en `mutate`;
#     `resenas-demo.ts` queda FUERA (dato de demo, precedente `equipo-demo.ts`). [OJO estáticos,
#     brief §7]: el módulo del agregado NO deriva NADA en su carga (@s3), o fabrica mutantes
#     estáticos que el runner no puede activar (`tdd_deuda_mutacion_full.md`).
#   · La aritmética del carrusel se REUTILIZA por IMPORT de `galeria-logica.ts` (indiceCircular,
#     distanciaCircular, claveDistancia, signoDe, capaDe, debeRotar, vozDeLaPista,
#     pasosDelArrastre…); lo nuevo compartido (cadencia 2000, teclado, reinicio del reloj) vive
#     en `src/components/carrusel-logica.ts` (brief §5). Duplicar una función pura para
#     «adaptarla» es fallo de review.
# =============================================================================================

Feature: La sección de reseñas: el agregado real de Treatwell en una línea discreta —atribuida, enlazada y fechada— y un carrusel coverflow de testimonios propios de ejemplo que hereda la conducta de la galería v3
  Como visitante quiero ver de un vistazo la valoración real del salón y leer opiniones en un
  carrusel con el mismo relieve que la galería; y como responsable del proyecto quiero no
  republicar ni un texto de Treatwell, declarar siempre plataforma, enlace y fecha del dato,
  avisar con honestidad de que los testimonios mostrados son de ejemplo, y que ni el JSON-LD ni
  las cinco puertas del build se muevan un byte.

  # -------------------------------------------------------------------------------------------
  # LA POSICIÓN Y EL CASCARÓN. El mismo campo de minas que sorteó la galería.
  # -------------------------------------------------------------------------------------------

  @s1
  Scenario: La sección vive ENTRE el equipo y la reserva, como bloque NO navegable que no toca ninguna puerta
    Given la home renderizada por SSR, sin ejecutar JavaScript
    When se inspecciona el HTML horneado
    Then aparece un "<h2>" cuyo texto es exactamente "Lo que dicen nuestras clientas", DESPUÉS del "<h2>" "Nuestro equipo de profesionales" (id="equipo-titulo") y ANTES del "<h2>" de la reserva (id="reserva-titulo")
    And la galería «Nuestros trabajos» SIGUE detrás de la reserva: los DOS carruseles quedan SEPARADOS por la sección de reserva
    And el elemento raíz de la sección es un "<div>", NO un "<section>": bloque NO navegable, como la galería
    And la sección no aporta ningún "<h1>" y aporta exactamente UN "<h2>"
    And no introduce ninguna "<nav>" ni ningún "<a href='#…'>": sus controles son "<button type='button'>", y su único "<a" es el enlace EXTERNO a Treatwell de @s2
    And la sección vive dentro de "<main>"
    And el conjunto de enlaces de la nav NO cambia: la sección no se añade a la navegación
    # [CRITICO] El mismo campo de minas que la galería (@s2 de su contrato): un `<section
    # aria-labelledby>` la haría «sección navegable» (`puerta-cascaron.ts:505-520`) y la nav no la
    # enlaza → `REGLA_INALCANZABLE` (`puerta-anclas.ts:132-142`); un `<a href="#…">` en los puntos
    # los metería en la puerta de anclas. La POSICIÓN es decisión de Pablo (2026-07-23): debajo de
    # «Nuestro equipo de profesionales» — y con ella los dos carruseles quedan separados por
    # #reserva, la geometría que hace excepcional el doble-visible del teclado (@s22 de galería).
    # El texto del `<h2>` («Lo que dicen nuestras clientas») lo eligió el gherkin_author en el tono
    # del sitio («Nuestros trabajos», «Nuestro equipo de profesionales»): aprobarlo o cambiarlo es
    # parte de la puerta humana de ESTE contrato.

  # -------------------------------------------------------------------------------------------
  # EL AGREGADO REAL. Una línea, tres obligaciones: plataforma, enlace, fecha.
  # -------------------------------------------------------------------------------------------

  @s2
  Scenario: El agregado real es UNA LÍNEA discreta: plataforma declarada, enlace a la fuente y fecha del dato, visibles los tres
    Given la sección de reseñas renderizada
    When se lee la línea del agregado
    Then muestra la nota "4,9" (con coma decimal), el total "1.239 opiniones" (con punto de millar) y la plataforma "Treatwell", en UNA línea de texto — no un banner ni una cabecera-aviso
    And contiene un enlace cuyo href es EXACTAMENTE "https://www.treatwell.es/establecimiento/nails-lash-studio/"
    And ese enlace declara target="_blank" y su rel contiene "noopener" (la convención de los enlaces externos del repo, `Contacto.tsx:79-80`)
    And el href NO empieza por "#": es un enlace EXTERNO y la puerta de anclas no lo cuenta como navegación interna
    And la fecha del dato es VISIBLE en la línea: contiene "23/07/2026"
    And la nota lleva su texto accesible "4,9 de 5", y las estrellas que la acompañan son decorativas, con aria-hidden="true" (@s7)
    # (N) art. 20.4 TRLGDCU + raíl del brief §2, NO negociable: la nota agregada SOLO puede
    # mostrarse con plataforma declarada + enlace a la fuente + fecha del dato. «Discreta» es
    # decisión de Pablo: una línea fina. Los literales "4,9", "1.239" y "23/07/2026" se DERIVAN del
    # módulo de @s3 EN EL RENDER (funciones puras de formato llamadas al pintar, jamás en la carga
    # del módulo — trampa de estáticos de Stryker, brief §7) y el test los espera escritos A MANO.

  @s3
  Scenario: El dato agregado vive tipado y FECHADO en su módulo, y el componente lo LEE: nada hardcodeado en el JSX
    Given el módulo "src/lib/resenas-agregado.ts"
    When se lee su export
    Then exporta un objeto con EXACTAMENTE cinco campos y estos valores, que el test espera escritos A MANO: nota 4.9, total 1239, plataforma "Treatwell", url "https://www.treatwell.es/establecimiento/nails-lash-studio/" y fechaDelDato "2026-07-23"
    And el componente renderizado con el módulo REAL pinta ESOS valores: la nota, el total, la plataforma, el href y la fecha de @s2 salen del objeto, sin una segunda copia de ningún valor en el JSX
    And el módulo exporta el objeto LITERAL y nada más: NINGUNA derivación (formato de fecha, texto compuesto, estrellas) se ejecuta en la carga del módulo — el formateo ocurre en funciones llamadas en el render
    # Si el dato caduca (la nota de Treatwell cambia), se actualiza el MÓDULO, no el componente
    # (brief §2). «El componente lo lee» lo demuestra Stryker POR VALOR: `resenas-agregado.ts`
    # entra en `mutate`, y mutar `4.9` o `1239` debe poner en rojo un test del COMPONENTE — si el
    # JSX llevara su propia copia, el mutante sobreviviría y la mentira quedaría retratada.
    # [OJO estáticos, brief §7 + `tdd_deuda_mutacion_full.md`]: derivar estructuras en la carga del
    # módulo fabrica mutantes ESTÁTICOS que el runner no puede activar — de ahí el tercer And.
    # MEDIDO en vivo el 2026-07-23: 4,9 · 1.239 en la URL de la ficha. El dato es real y la fecha
    # también: no se inventa ni se redondea.

  # -------------------------------------------------------------------------------------------
  # LOS TESTIMONIOS PROPIOS Y LA HONESTIDAD. Ni un byte de Treatwell; la leyenda, visible.
  # -------------------------------------------------------------------------------------------

  @s4
  Scenario: Los SEIS testimonios son PROPIOS y de EJEMPLO: viven en su módulo demo, no repiten ni un texto de #equipo y son los únicos textos de testimonio de la sección
    Given el módulo "src/lib/demo/resenas-demo.ts" y la sección de reseñas renderizada
    When se leen los testimonios exportados y los textos del HTML
    Then el módulo exporta EXACTAMENTE SEIS testimonios, cada uno con: autora (nombre de pila, SIN inicial de apellido), texto corto de una o dos frases, nota ENTERA de valor 4 o 5, y servicio que es una categoría real del salón ("Uñas", "Pestañas", "Cejas", "Nail art" o "Pedicura")
    And al menos UNO de los seis tiene nota 4: si los seis fueran de 5, la estrella vacía de @s7 jamás se pintaría (anti-vacuidad)
    And NINGUNO de los seis textos coincide con ninguno de los DIEZ del reviewPool de #equipo (`equipo-demo.ts`): la intersección es VACÍA
    And ninguna autora coincide, ni siquiera en el nombre de pila, con las diez autoras del reviewPool: las dos secciones no pueden mostrar a «la misma clienta»
    And el HTML de la sección muestra esos seis textos — escritos A MANO en el test — y NINGÚN otro texto de testimonio: ni uno procede de Treatwell
    # ❌ Raíl legal duro (brief §2 + `docs/research/legal-treatwell.md`): republicar reseñas de
    # Treatwell viola sus términos (cl. 4.2/9.1), la PI del texto (art. 17 TRLPI) y el RGPD por los
    # nombres. Los testimonios son INVENTADOS COMO EJEMPLO y se declaran como tales (@s5); el día
    # que haya reseñas reales captadas con consentimiento EN EL SALÓN, se sustituye el módulo demo.
    # La disyunción con el reviewPool es la CONVIVENCIA que exige el encargo: #equipo ya muestra
    # mini-reseñas por profesional y repetir textos entre las dos secciones delataría el atrezzo.
    # El nombre de pila SIN inicial también los separa visualmente del patrón «María L.» de #equipo.
    # Los TEXTOS concretos los redacta el craftsman con el dato demo (no son contrato); su NÚMERO,
    # su forma y sus restricciones, SÍ.

  @s5
  Scenario: La leyenda de honestidad es VISIBLE e integra el aviso del art. 20.4: los testimonios son de ejemplo y la nota agregada procede de Treatwell
    Given la sección de reseñas renderizada
    When se lee su nota de honestidad
    Then muestra exactamente el texto "Testimonios de ejemplo · textos de muestra pendientes de sustituir por reseñas reales de clientas del salón; la nota agregada procede de Treatwell."
    And se compara CARÁCTER A CARÁCTER, con su «·» y sus acentos (el patrón de la nota de la galería, `galeria.test.tsx:78-84`)
    And es texto VISIBLE en el flujo de la sección: no vive en un atributo, ni en un title, ni oculto a nadie
    And la leyenda vive exportada en `resenas-demo.ts` (patrón LEYENDA_EQUIPO, `equipo-demo.ts:125`) y el componente la pinta desde ahí
    # (N) art. 20.4 TRLGDCU (información sobre el origen de las reseñas) INTEGRADO en la leyenda de
    # ejemplo, sin banner — decisión de Pablo vía brief §2. El patrón es LEYENDA_EQUIPO: «X de
    # ejemplo · detalle, pendiente de Y». La redacción exacta la propone este contrato y la aprueba
    # el humano en la puerta: si cambia una coma, cambia AQUÍ primero. Cuando lleguen reseñas
    # reales con consentimiento, la leyenda se re-redacta — ese día cambia el contrato, no antes.

  # -------------------------------------------------------------------------------------------
  # EL JSON-LD. La nota se muestra a las personas; a los buscadores, jamás como propia.
  # -------------------------------------------------------------------------------------------

  @s6
  Scenario: El JSON-LD horneado NO gana un aggregateRating: la nota de Treatwell se muestra, pero nunca se marca como propia
    Given el HTML horneado de la home en "dist/"
    When se lee su "<script type='application/ld+json'>"
    Then NO contiene la clave "aggregateRating" ni la clave "review"
    And SÍ sigue conteniendo la cáscara intacta — "@type" "BeautySalon", el name y "openingHoursSpecification" — como ANCLA POSITIVA: el escenario no puede pasar verde porque el JSON-LD entero haya desaparecido
    And se asevera AMPLIANDO el test build-based EXISTENTE (`src/pages/home-horneado.test.ts`): PROHIBIDO crear un cuarto test build-based
    # (P) con respaldo de las guidelines de Google (brief §2 + acceptance de F-14): las reseñas y
    # notas de TERCEROS no se marcan como propias en el structured data. La puerta del cascarón no
    # cambia y `construirJsonLd` queda INTACTO (su @s9 de `seo.test.ts` asevera EXACTAMENTE 6
    # claves): esta feature NO toca `src/lib/seo.ts`.

  # -------------------------------------------------------------------------------------------
  # LAS ESTRELLAS. Una función pura pinta los glifos; el número viaja siempre en texto.
  # -------------------------------------------------------------------------------------------

  @s7
  Scenario Outline: Las estrellas las pinta una función PURA que redondea al entero más cercano, y la nota va SIEMPRE también en texto
    Given una nota "<nota>"
    When se calculan las estrellas decorativas
    Then el resultado es exactamente "<estrellas>": CINCO glifos siempre, llenas "★" primero y vacías "☆" después
    And en el DOM el elemento de los glifos declara aria-hidden="true", y junto a él la nota va EN TEXTO: "4,9 de 5" en el agregado y "4 de 5" o "5 de 5" en cada testimonio

    Examples:
      | nota | estrellas | qué fija                                                  |
      | 5    | ★★★★★     | la fila llena, sin estrella vacía                         |
      | 4    | ★★★★☆     | la estrella VACÍA existe y la fila sigue siendo de CINCO  |
      | 4.9  | ★★★★★     | el agregado (4,9) redondea ARRIBA al entero más cercano   |
      | 4.4  | ★★★★☆     | y 4,4 redondea ABAJO: la frontera del redondeo muerde     |

    # La función (`estrellasDe(nota)`) vive PURA — patrón `galeria-logica.ts` — y Stryker la muerde
    # POR VALOR: los cuatro ejemplos van escritos A MANO. Las estrellas son DECORATIVAS porque el
    # número en texto es la fuente accesible: si los glifos fueran la ÚNICA fuente, un lector de
    # pantalla oiría cinco veces «estrella» o nada — por eso el aria-hidden y el texto son AMBOS
    # obligatorios. Con coma en lo VISIBLE («4,9 de 5», es-ES); el valor del módulo (@s3) va con
    # punto porque es un number, no un literal de pantalla.

  # -------------------------------------------------------------------------------------------
  # EL CARRUSEL HEREDADO. Un solo contrato de conducta (el de galería v3); aquí, las diferencias.
  # -------------------------------------------------------------------------------------------

  @s8
  Scenario: [AJUSTADO 2026-07-24, ver ENMIENDA 4 de galeria_carrusel.feature] El carrusel de testimonios OBEDECE el contrato de la galería v3 POR REFERENCIA, con ids y etiquetas propios
    Given el carrusel de la sección de reseñas montado
    When se le aplican los escenarios de conducta de "features/galeria_carrusel.feature" (v3 + ENMIENDA 4)
    Then los cumple TODOS leyendo «foto» como «testimonio»: la aritmética circular de seis tarjetas con data-distancia, "--s" y z-index inline (@s3..@s5), el árbol APG Grouped con seis diapositivas "1 de 6".."6 de 6" jamás ocultas (@s6), la voz de la pista (@s7), la cadencia de 2000 milisegundos (@s9), las reglas de pausa del ratón (reanuda sola al salir) y del foco (pegajosa, ahora PERMANENTE — @s10), reduced-motion que arranca pausado y se escucha en caliente, sin ninguna vía para reanudarlo (@s12), los puntos con aria-disabled y diana de 24 píxeles (@s17), el clic en lateral (@s18), el arrastre con umbral 48 (@s19), el reinicio del reloj por acción manual (@s20) y el teclado (@s21..@s23)
    # [ENMIENDA 4, 2026-07-24 — remite, no duplica: ver `features/galeria_carrusel.feature`] El
    # control de rotación (@s8 de galería), el arranque explícito «Iniciar» (@s11 de galería), las
    # flechas-botón «Anterior»/«Siguiente» (@s16 de galería) y los mandos de cristal (@s24 de
    # galería) quedaron RETIRADOS en el contrato PADRE por decisión INFORMADA de Pablo (commit
    # 9cf32a9, fuera del TDD): este carrusel heredado NO los tenía nunca por sí mismo y, por la
    # regla de oro «hereda POR REFERENCIA», este Then YA NO promete heredarlos. La cita literal de
    # Pablo, la pregunta del `craftsman_lead` y el detalle completo de qué sobrevive y qué no viven
    # en la ENMIENDA 4 de `features/galeria_carrusel.feature` (bloque tras el TECHO) y en
    # `progress/enmienda4_carrusel_sc222.md` — se remite, no se repite el razonamiento aquí.
    And la cadencia es LA MISMA CONSTANTE de "src/components/carrusel-logica.ts" que usa la galería: no existe una segunda copia del 2000
    And sus identificadores son PROPIOS: la pista es id="resenas-pista" y el carrusel se etiqueta con aria-labelledby al "<h2>" de @s1 — dos carruseles en la misma página no comparten NINGÚN id
    And sus etiquetas hablan de testimonios: el grupo de puntos se llama exactamente "Elegir el testimonio que se muestra" y cada punto "Ver el testimonio N de 6"
    # [RETIRADO ENMIENDA 4] "en la home conviven DOS botones "Anterior", DOS "Siguiente" y DOS
    # controles de rotación..." — ya no tiene referente en NINGUNO de los dos carruseles (ambos
    # perdieron sus tres controles en el MISMO commit 9cf32a9). Lo que sigue siendo cierto, y lo
    # sustituye, es el And anterior: los dos carruseles no comparten NINGÚN id ("galeria-pista" /
    # "resenas-pista") y sus grupos de puntos se distinguen por nombre accesible propio ("Elegir la
    # foto…" / "Elegir el testimonio…").
    And la desambiguación del teclado entre los DOS carruseles es la de @s22 del contrato de galería: la decisión es UNA y compartida, no dos copias
    # LA REGLA DE ORO de este contrato (acceptance 4 de F-14): heredar POR REFERENCIA, no por
    # copia. Este fichero fija SOLO las diferencias; re-litigar aquí una decisión de la galería
    # sería un contrato bífido. El mapa de tests del craftsman REPLICA los escenarios citados sobre
    # `Resenas.tsx` — la mutación al 100 % sobre él lo exige, no hay atajo — reutilizando la
    # aritmética de `galeria-logica.ts` por IMPORT (brief §5). Las etiquetas nuevas («testimonio»
    # en vez de «foto») van escritas A MANO en los tests, como siempre.

  @s9
  Scenario: Lo ÚNICO distinto es la tarjeta: texto sin imagen, proporción propia, la central SIEMPRE legible y las laterales apagándose
    Given la sección de reseñas renderizada y el fichero "src/components/resenas.module.scss"
    When se lee el HTML de la sección y los bytes del SCSS
    Then la sección NO contiene NINGUNA "<img": las tarjetas llevan texto — autora, servicio, estrellas de @s7 y el texto del testimonio — y por eso no necesitan draggable="false"
    And la tarjeta declara su PROPIA proporción, distinta del "4 / 3" de la galería: más ancha que alta (el valor exacto es del craftsman y se comprueba EN VIVO)
    And el SCSS obedece las MISMAS reglas 3D del contrato de galería, aseveradas con el MISMO patrón de bytes (@s13, @s14, @s15): perspectiva como propiedad, sin "transform-style: preserve-3d", UNA sola transform con sus fallbacks, "transition: none" y "pointer-events: none" en la tarjeta oculta, "touch-action: pan-y" en su marco, 640px como único breakpoint, y ni un "url(https://" ni cambio alguno de "@font-face"
    And la tarjeta CENTRAL es SIEMPRE legible: a distancia 0 su opacidad efectiva es 1 — ninguna regla la reduce — y su texto usa SOLO tokens cuyo par figura en la tabla de la puerta de contraste con ratio AA
    And las laterales se APAGAN como las fotos de la galería: la opacidad decrece al crecer la distancia y la oculta va a 0, aplicada al HIJO envoltorio y nunca a la tarjeta (regla de @s13: opacity es grouping property y aplanaría el 3D)
    # La proporción apaisada es (P) del brief §5: una reseña es un párrafo, no una foto 4:3 — la
    # misma silueta de domo ∩ con una tarjeta distinta. «Legible AA» NO es decorativo: la puerta de
    # contraste solo lee `_tokens.scss` y solo evalúa sus pares ESCRITOS A MANO — si la tarjeta
    # usara un par nuevo, habría que AÑADIRLO a la tabla de la puerta, no esquivarla. NO INVENTAR
    # COLOR: --ink y --muted sobre --surface ya están auditados; --accent-dark para acentos, JAMÁS
    # --accent (4,37:1, falla AA); --border-interactive, nunca --line. El apagado de las laterales
    # es (P), como en la galería (las tarjetas no son «parts of graphics required to understand»),
    # pero la CENTRAL legible es la línea que no se cruza: es la que el visitante está leyendo.
