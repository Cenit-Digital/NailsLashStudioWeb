# Contrato de la feature 2 (`datos_negocio_fuente_unica`) de feature_list.json.
# Destilado de project-spec.md → «Feature 2: datos_negocio_fuente_unica — el NAP canónico».
#
# Aprobado por el humano en la puerta de aprobación (Opción 1, 2026-07-16). Matiz del CEO: la web
# es un DEMO para una primera reunión y F-02 provee el tel:/WhatsApp con DATOS REALES (el CEO lo
# pidió así); las citas y demás van como demo en features posteriores. F-02 es la primera
# aplicación de I-7
# («los datos viven fuera del JSX, en una fuente única») al dato MÁS peligroso del prototipo:
# el teléfono, escrito siete veces a mano y con el href aparte del texto.
#
# ALCANCE DE F-02 (decisión de troceado, cerrada): dos funciones puras —`telHref` y `waHref`—
# más un array `registros` y las CONSTANTES verificadas del NAP en `src/lib/site.ts`. NADA de
# JSON-LD (eso es F-04) ni de lógica de horario (`estaAbierto`, franjas: eso es F-10). F-02 solo
# CUSTODIA los datos que esas features consumirán; su carga de test recae en `telHref`, `waHref`
# y `registros`.
#
# Cierra en su redacción (lo que no está escrito, no está decidido):
#   - A-10 (host de `waHref`) → el host (`wa.me` vs `api.whatsapp.com/send`) NO se ata: se
#     asevera solo que el número va en E.164 SIN el `+` y el texto `encodeURIComponent`-ado
#     (@s5, @s6). El host queda como constante configurable, a verificar a mano antes de F-13.
#   - A-11 (email) → DIFERIDO: `registros` contiene SOLO datos verificados con esPlaceholder:
#     false; el email NO entra aquí. Consecuencia comprobable: la puerta de F-01 sobre estos
#     registros da 0 violaciones y el build de producción sigue verde (@s10).
#   - A-12 (cableado) → SÍ: los `registros` reales de F-02 alimentan la puerta de F-01 por la
#     vía por FLAG (hoy `never[] = []` en el humilde). El humilde no lleva tests (humble object),
#     pero el efecto observable —la puerta alimentada no produce violaciones— sí se fija (@s10).
#   - Caso límite 1 (idempotencia): una entrada ya en E.164 no duplica el prefijo (@s4).
#   - Caso límite 2 (separadores = SOLO espacio y guion, alineado con SEPARADORES=/[ -]/g y
#     PREFIJOS_INTERNACIONALES=['+34','0034'] de placeholders.ts): @s4 y @s11.
#   - Caso límite 4 (`encodeURIComponent`, no `encodeURI`): @s6.
#   - Caso límite 5 (el teléfono real NO es el patrón placeholder): F-01 y F-02 encajan (@s9).
#   - Caso límite 6 (texto vacío omite `?text=`): @s7.
#   - Modos de error (entrada que no es un teléfono ES válido → falla ruidosa, «falla cerrada»
#     del proyecto): @s11, @s12.
#
# MUTANTES QUE DEBEN MORIR (criterio de aceptación 5, I-6): quitar el `+` de `telHref` (@s3,@s4),
# no anteponer `+34` (@s3,@s4), no compactar los separadores (@s4), dejar el `+` en el número de
# `waHref` (@s5), `encodeURIComponent` → `encodeURI` (@s6), y perder la idempotencia con doble
# `+34` (@s4).
#
# TRAZA A LOS 5 ACCEPTANCE de feature_list.json (feature id 2):
#   A1 (NAP exacto) → @s1, @s2   ·   A2 (telHref E.164) → @s3, @s4
#   A3 (waHref sin `+` + urlencoded) → @s5, @s6, @s7   ·   A4 (fuente única) → @s8
#   A5 (mutar la normalización E.164 rompe un test) → transversal, @s3 a @s7
#
# ANTI-TAUTOLOGÍA (regla del arnés; precedente WebEmpresa: el fake de `useIsMobile` atado al
# símbolo `MOBILE_QUERY` en vez del literal fue el primer mutante superviviente). El resultado
# esperado —`'tel:+34625223366'`, `'34625223366'`, `'Hola%2C%20quiero%20cita'`— se escribe A MANO
# en el escenario y en el test; NUNCA se deriva de la constante de `site.ts` ni de volver a llamar
# a `encodeURIComponent` dentro del test. Si el test reflejara la constante o re-aplicara el
# encoder, un teléfono equivocado o un encoder mutado pasarían verdes.
#
# ESTÁNDARES QUE FIJAN EL FORMATO:
#   - `tel:` URI → RFC 3966 §3 (`global-number-digits = "+" *phonedigit DIGIT *phonedigit`) y
#     §5.1.4 («Global numbers MUST be composed with the country (CC) and national (NSN) numbers as
#     specified in E.123 and E.164»): un número global lleva `+` inicial + E.164.
#   - E.164 (ITU-T): internacional = código de país + número nacional, máx. 15 dígitos;
#     España = `+34`. El nacional español son 9 dígitos.
#   - WhatsApp click-to-chat: número internacional completo SIN `+`, ceros, paréntesis, guiones ni
#     espacios, y `text` urlencoded. El host NO está verificado contra fuente primaria (Help
#     Center renderizado con JS) → configurable (A-10); por eso los escenarios NO exigen `wa.me`.

Feature: NAP canónico en un solo módulo — el teléfono no puede divergir de su enlace
  Como responsable del proyecto quiero que el nombre, la dirección y el teléfono reales vivan en
  una única fuente y que los enlaces tel: y de WhatsApp se deriven de ella para que sea
  imposible enseñar un número y marcar otro —el bug más peligroso del prototipo, donde el
  teléfono se escribía a mano siete veces y el href quedaba suelto del texto.

  # ---------------------------------------------------------------------------
  # Las constantes verificadas del NAP (aceptación 1)
  # ---------------------------------------------------------------------------

  @s1
  Scenario: El módulo expone el NAP verificado, exacto y estructurado
    Given el módulo único de datos del sitio
    When se leen sus constantes del NAP
    Then el nombre es exactamente "Nails Lash Studio"
    And la dirección está estructurada por partes, no como una cadena suelta
    And la dirección incluye "C.C. El Zoco", "Av. de Atenas 75", "Local 41", "Planta 0", "28232" y "Las Rozas de Madrid"
    And el teléfono en forma legible es exactamente "625 22 33 66"
    And el horario es L-V "10:00-20:00", S "10:00-14:00" y D cerrado
    # A1 verbatim. "Local 41" y "Planta 0" desambiguan frente a Acosta Nails (Local 1) en el
    # mismo edificio; F-11 los mostrará. El horario aquí es DATO guardado, no lógica: quien lo
    # interpreta (estaAbierto, franjas) es F-10. Anti-tautología: cada literal se escribe a mano.

  @s2
  Scenario: El módulo expone las demás constantes verificadas y NO inventa un TikTok
    Given el módulo único de datos del sitio
    When se leen sus constantes de geolocalización y redes
    Then la geolocalización es latitud "40.5179875" y longitud "-3.9226688"
    And el usuario de Instagram es exactamente "@nailslash.studio_"
    And el enlace de Facebook es exactamente "https://www.facebook.com/nailslashstudiorozas/"
    And no se expone ningún usuario ni enlace de TikTok
    # Datos [V] sembrados en la fuente única para F-04/F-11/F-12, que los consumirán. TikTok no
    # existe (no verificado): la fuente única no lo inventa. Custodia de datos, no lógica nueva.

  # ---------------------------------------------------------------------------
  # telHref: normalización a E.164 (aceptación 2 y 5; casos límite 1, 2, 3)
  # ---------------------------------------------------------------------------

  @s3
  Scenario: telHref normaliza el teléfono legible a un tel: URI en E.164
    Given el teléfono en forma legible "625 22 33 66"
    When se llama a telHref con ese teléfono
    Then el resultado es exactamente "tel:+34625223366"
    # A2. El literal esperado se escribe a mano. La exactitud mata dos mutantes: quitar el `+`
    # daría "tel:34625223366" y no anteponer "+34" daría "tel:625223366"; ambos difieren y mueren.

  @s4
  Scenario Outline: telHref da la MISMA salida sin importar separadores ni prefijo, y es idempotente
    Given un teléfono escrito como "<entrada>"
    When se llama a telHref con ese teléfono
    Then el resultado es exactamente "tel:+34625223366"

    Examples:
      | entrada           |
      | 625 22 33 66      |
      | 625-22-33-66      |
      | 625  22  33  66   |
      | +34 625 223 366   |
      | +34625223366      |
      | 34625223366       |
      | 0034625223366     |
      | 0034 625 22 33 66 |
    # Casos límite 1, 2 y 3, todos a la misma salida:
    #  - "+34625223366" y "34625223366": entrada YA en E.164 → idempotente, no duplica el
    #    prefijo (nunca "tel:+34+34625223366" ni "tel:+3434625223366"). Mata el mutante de doble +34.
    #  - "625  22  33  66": separadores DOBLES → se compactan igual (el separador es «uno o más»).
    #    Un normalizador que compactara «exactamente uno» dejaría "tel:+34625 22 33 66" y muere.
    #  - "0034…": el prefijo 0034 se reconoce como +34 (alineado con placeholders.ts).
    # Separadores aceptados = SOLO espacio y guion, deliberadamente estrecho (ver @s11 para el punto).

  # ---------------------------------------------------------------------------
  # waHref: número E.164 sin `+` y texto urlencoded (aceptación 3 y 5; caso límite 4)
  # ---------------------------------------------------------------------------

  @s5
  Scenario: waHref lleva el número en E.164 SIN el `+` y el texto urlencoded
    Given el teléfono legible "625 22 33 66" y el texto "Hola, quiero cita"
    When se llama a waHref con ese teléfono y ese texto
    Then el número del enlace es exactamente "34625223366"
    And el enlace NO contiene el número precedido de "+"
    And el parámetro text vale exactamente "Hola%2C%20quiero%20cita"
    # A3. El host (wa.me vs api.whatsapp.com) NO se asevera (A-10). "El número sin `+`" mata el
    # mutante que dejara "+34625223366" en la URL. El text a mano ("," → %2C, " " → %20) mata el
    # mutante que no codificara; se escribe a mano, no re-llamando a encodeURIComponent (tautología).

  @s6
  Scenario Outline: waHref escapa TODOS los caracteres especiales con encodeURIComponent
    Given el teléfono legible "625 22 33 66" y el texto "<texto>"
    When se llama a waHref con ese teléfono y ese texto
    Then el parámetro text vale exactamente "<esperado>"

    Examples:
      | texto        | esperado                     |
      | Hola & adiós | Hola%20%26%20adi%C3%B3s      |
      | precio #1    | precio%20%231                |
      | uñas 💅      | u%C3%B1as%20%F0%9F%92%85     |
      | Cita · 10h   | Cita%20%C2%B7%2010h          |
    # Caso límite 4. Por qué encodeURIComponent y NO encodeURI: encodeURI NO escapa `&` ni `#`.
    # Un `&` crudo inyectaría un parámetro y un `#` crudo cortaría la URL en un fragment → mensaje
    # roto. Las filas de "&" (%26) y "#" (%23) matan el mutante encodeURIComponent → encodeURI;
    # los acentos (%C3%B3, %C3%B1), el punto medio · (%C2%B7) y el emoji 💅 (%F0%9F%92%85) fijan
    # el UTF-8 percent-encoded. Cada `esperado` se escribe a mano (anti-tautología).

  @s7
  Scenario: waHref con texto vacío OMITE el parámetro text
    Given el teléfono legible "625 22 33 66" y un texto vacío
    When se llama a waHref con ese teléfono y ese texto
    Then el número del enlace es exactamente "34625223366"
    And el enlace NO contiene "text="
    # Caso límite 6, cerrado aquí: con texto vacío no se pre-rellena un mensaje en blanco; se omite
    # "?text=" en vez de emitir "?text=" a secas. El número sigue en E.164 sin `+`.

  # ---------------------------------------------------------------------------
  # Fuente única: texto, tel: y WhatsApp salen del MISMO dato (aceptación 4)
  # ---------------------------------------------------------------------------

  @s8
  Scenario: Una sola fuente para el teléfono: el texto visible y ambos href no pueden divergir
    Given que el teléfono se declara una sola vez como el dato canónico "625 22 33 66"
    When se obtienen, a partir de ese mismo dato, el texto visible, telHref y waHref
    Then el texto visible del teléfono es exactamente "625 22 33 66"
    And telHref de ese dato es exactamente "tel:+34625223366"
    And el número de waHref de ese dato es exactamente "34625223366"
    And los tres contienen el mismo número nacional "625223366"
    # A4. Ni el texto ni los href reescriben el número: los tres lo toman del único dato exportado.
    # Cambiar ese dato en site.ts cambia el texto Y ambos href a la vez, y no pueden desincronizarse.
    # Un componente que escribiera el número a mano rompería la igualdad de este escenario.

  # ---------------------------------------------------------------------------
  # Encaje con la puerta de F-01 (casos límite 5; A-11 y A-12)
  # ---------------------------------------------------------------------------

  @s9
  Scenario Outline: El teléfono real NO dispara el patrón placeholder de F-01
    Given el teléfono real escrito como "<forma>" en un artefacto de producción
    When la puerta de placeholders (F-01) lo inspecciona por la vía por patrón
    Then no coincide con el patrón prohibido "600123456"
    And no se emite ninguna violación

    Examples:
      | forma            |
      | 625 22 33 66     |
      | +34 625 22 33 66 |
      | 625223366        |
    # Caso límite 5: 625223366 ≠ 600123456. La prueba de que F-01 y F-02 ENCAJAN: el dato real de
    # F-02 pasa la vía por patrón de la puerta de F-01 sin falso positivo, en cualquiera de sus formas.

  @s10
  Scenario: La puerta alimentada con los registros verificados de F-02 no produce violaciones
    Given que `registros` proyecta el NAP a la forma que consume la puerta de F-01 (ubicacion, valor, esPlaceholder)
    And que cada registro verificado —nombre, dirección, teléfono, horario, geo, redes— declara esPlaceholder: false
    And que el email NO figura entre los registros
    When la puerta de placeholders (F-01) inspecciona esos registros
    Then no se emite ninguna violación
    And por tanto el build de producción sigue verde
    # A-12: los `registros` reales de F-02 sustituyen al `never[] = []` del humilde y alimentan la
    # vía por FLAG que F-01 dejó cableada pero sin alimentar. A-11: el email queda DIFERIDO; por eso
    # no hay violación por flag y el build no se bloquea. Cuando el email entre (F-12/F-16) como
    # esPlaceholder: true, la puerta romperá el build a propósito (D-6) — pero eso NO es F-02.

  # ---------------------------------------------------------------------------
  # Modos de error: entrada que no es un teléfono ES válido → falla cerrada
  # ---------------------------------------------------------------------------

  @s11
  Scenario Outline: telHref rechaza una entrada que no es un teléfono español válido
    Given una entrada "<entrada>" que no es un teléfono español válido
    When se llama a telHref con esa entrada
    Then telHref lanza un error
    And no devuelve ningún "tel:" a medias

    Examples:
      | entrada          | motivo                                                   |
      | ""               | cadena vacía: ni un solo dígito                          |
      | abc              | sin dígitos                                              |
      | 625              | faltan dígitos: el nacional español son 9                |
      | 625.22.33.66     | el punto no es separador (solo espacio y guion)          |
      | 6252233661234567 | fuera del rango E.164: más de 15 dígitos                 |
    # `""` denota la cadena vacía. Decisión cerrada (recomendación del spec, coherente con «falla
    # cerrada» del proyecto): ante basura, lanzar en vez de emitir un "tel:+34" a medias que parezca
    # válido. La fila del punto cierra el caso límite 2: separadores aceptados = SOLO espacio y guion;
    # cualquier otro (punto, barra) hace inválida la entrada. La ruta normal nunca ve basura porque
    # el dato canónico viene siempre de la fuente única verificada; esto es la red de seguridad.

  @s12
  Scenario: waHref rechaza igual una entrada que no es un teléfono válido
    Given el texto "Hola, quiero cita"
    When se llama a waHref con la entrada "abc" y ese texto
    Then waHref lanza un error
    And no devuelve ninguna URL con un número a medias
    # waHref comparte el normalizador a E.164 de telHref: una sola regla de normalización, no dos
    # que puedan divergir. Si la entrada no es un teléfono válido, waHref falla igual que telHref (@s11).
