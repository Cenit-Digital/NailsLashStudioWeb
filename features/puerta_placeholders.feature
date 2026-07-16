# Contrato de la feature 1 (`puerta_placeholders`) de feature_list.json.
# Destilado de project-spec.md → «Especificación por feature» → Feature 1.
#
# Aprobado por el humano en la puerta de aprobación. Cierra en su redacción:
#   - A-9  → comparación normalizada, patrón por patrón (@s5, @s7)
#   - A-8  → la puerta se niega a pasar por vacuidad (@s20, @s21, @s26)
#   - D-1  → flag Y patrón a la vez son DOS infracciones, no una (@s23)
#   - D-2  → un registro que no declara el flag es violación (@s24)
#   - D-3  → el informe se emite en orden de aparición (@s9, @s25)
#   - D-4  → no basta con inspeccionar «algo»: falta el HTML de entrada → falla (@s26)
#   - D-5  → el data: URI lo cubre la vía por flag; el contrato NO se acopla al empaquetador (@s17)
# Aquí no hay nada que adivinar: lo que no está escrito, no está decidido.

Feature: Puerta de placeholders — el build de producción falla si queda un dato inventado
  Como responsable del proyecto quiero que ningún dato inventado pueda llegar a producción
  para que publicar por accidente las fotos IA, los textos de plantilla, los precios
  inventados o el teléfono "+34 600 123 456" sea estructuralmente imposible, y no una
  cuestión de acordarse a las 3 de la mañana del día del despliegue.

  DOS CAPAS, y la distinción es el contrato:
    - La INSPECCIÓN es una función pura: recibe lo que tiene que examinar (el árbol de
      datos del sitio y/o el texto de un artefacto ya construido) y devuelve la lista de
      violaciones. No lee ficheros, ni el reloj, ni el entorno, y no decide códigos de salida.
    - La PUERTA es el script enganchado SOLO al build de producción: lee, invoca la
      inspección y sale con código distinto de 0. El build de desarrollo no la invoca
      (D-8: las fotos IA y los datos placeholder son legítimos en local; la puerta separa
      «ver» de «publicar»).

  DOS VÍAS de detección, independientes, y ambas producen violación:
    - Por FLAG: un registro marcado esPlaceholder: true. Cubre lo que sabemos que falta y
      no tiene forma reconocible («razón social: pendiente de confirmar»). Un registro que
      NO declara el flag es violación también (@s24): omitirlo no puede significar «es real».
    - Por PATRÓN: el contenido coincide con un patrón prohibido aunque nadie lo marcara.
      Cubre lo que se coló hardcodeado. Los 6 patrones son: IMAGEN TEMPORAL,
      Plantilla de demostración, 600123456, hola@nailslashstudio.com, Calle de la Belleza,
      ph-woman.
  Independientes significa independientes: si un mismo registro dispara las dos, son DOS
  violaciones y el informe acusa las dos (@s23).

  ORDEN DEL INFORME: orden de aparición y determinista. Primero el recorrido del árbol de
  datos, después los ficheros del artefacto en orden estable, y dentro de cada fichero por
  posición en el contenido. El orden es del contenido, NO de la lista de patrones (@s9, @s25).

  A-9 QUEDA CERRADA AQUÍ (comparación literal o normalizada), patrón por patrón:
    - 600123456 → familia TELÉFONO: se comparan los dígitos, ignorando espacios, guiones y
      prefijo internacional (+34 / 0034). Sin esto, "+34 600 123 456" —que es exactamente
      lo que escribe el prototipo— escapa, y es el placeholder más peligroso de la lista.
    - IMAGEN TEMPORAL · Plantilla de demostración · Calle de la Belleza ·
      hola@nailslashstudio.com · ph-woman → familia TEXTO: comparación insensible a
      mayúsculas/minúsculas y a acentos.

  A-8 QUEDA CERRADA AQUÍ (verde por vacuidad): la función pura devuelve la lista vacía ante
  una entrada vacía —es lo correcto para una función—, pero la PUERTA falla si no ha
  inspeccionado nada (@s21) y falla también si no ha inspeccionado el HTML de entrada del
  artefacto (@s26): «≥1 fichero» no basta, porque un dist/ con hojas de estilo y sin HTML
  pasaría «protegido». Falla cerrada: ante la duda, build roto, nunca build verde.

  LÍMITE DECLARADO (@s11): un dato inventado nuevo, bien escrito, sin marcar y sin patrón,
  esta puerta NO lo caza y no puede. Ninguna puerta detecta una mentira bien escrita. Lo
  cubren I-7 (fuente única de datos) y la puerta humana. Una puerta que se cree infalible
  es peor que ninguna.

  # ---------------------------------------------------------------------------
  # La inspección (función pura): la vía por flag
  # ---------------------------------------------------------------------------

  @s1
  Scenario: Un registro marcado como placeholder produce una violación que dice cuál, dónde y con qué valor
    Given un árbol de datos con el registro "legal.razonSocial" marcado esPlaceholder: true y con valor "pendiente de confirmar"
    When se inspecciona el árbol de datos
    Then hay exactamente 1 violación
    And la violación declara que la disparó el flag esPlaceholder
    And la violación declara la ubicación "legal.razonSocial"
    And la violación declara el valor "pendiente de confirmar"

  @s2
  Scenario: Un registro con el flag en false y contenido real no produce violación
    Given un árbol de datos con el registro "nap.telefono" marcado esPlaceholder: false y con valor "625 22 33 66"
    When se inspecciona el árbol de datos
    Then la lista de violaciones está vacía

  @s24
  Scenario: Un registro que no declara el flag es violación
    Given un árbol de datos cargado desde JSON con el registro "servicios.0.nombre" que no declara el flag esPlaceholder
    When se inspecciona el árbol de datos
    Then hay exactamente 1 violación
    And la violación declara la ubicación "servicios.0.nombre"
    And la violación declara que el flag esPlaceholder FALTA, no que sea false
    # Falla cerrada. El tipo exige el flag en compilación y eso cubre el código, pero a los datos
    # que llegan de JSON el tipo no los protege. Marcar un dato es un acto deliberado y visible:
    # omitir la marca no puede significar «es real».

  @s3
  Scenario: La inspección de una entrada vacía devuelve la lista vacía
    Given una entrada sin ningún registro y sin ningún texto de artefacto
    When se inspecciona esa entrada
    Then la lista de violaciones está vacía
    # Correcto como función pura. Es la PUERTA (@s20, @s21) quien se niega a pasar por vacuidad.

  # ---------------------------------------------------------------------------
  # La inspección (función pura): la vía por patrón
  # ---------------------------------------------------------------------------

  @s4
  Scenario Outline: Cada uno de los seis patrones prohibidos produce una violación
    Given el texto de un artefacto de producción que contiene "<contenido>"
    When se inspecciona ese texto
    Then hay exactamente 1 violación
    And la violación declara que la disparó el patrón "<patron>"

    Examples:
      | patron                    | contenido                                  |
      | IMAGEN TEMPORAL           | IMAGEN TEMPORAL                            |
      | Plantilla de demostración | Plantilla de demostración — no publicar    |
      | 600123456                 | 600123456                                  |
      | hola@nailslashstudio.com  | Escríbenos a hola@nailslashstudio.com      |
      | Calle de la Belleza       | Calle de la Belleza 24, 28010 Madrid       |
      | ph-woman                  | /assets/ph-woman0.png                      |

  @s5
  Scenario Outline: El teléfono inventado no escapa por espaciado, guiones ni prefijo internacional
    Given el texto de un artefacto de producción que contiene "<contenido>"
    When se inspecciona ese texto
    Then hay exactamente 1 violación
    And la violación declara que la disparó el patrón "600123456"

    Examples:
      | contenido        |
      | 600123456        |
      | +34 600 123 456  |
      | 600 123 456      |
      | 600-123-456      |
      | +34600123456     |
      | 0034 600 123 456 |
      | 600  123  456    |
    # La última fila —separadores DOBLES— fija que el espaciado irregular tampoco deja
    # escapar el teléfono (el separador es «uno o más», no «exactamente uno»). Sin ella, el
    # regex podría estrecharse a un solo separador y este placeholder —el más peligroso de la
    # lista— escaparía con un doble espacio accidental del maquetado. Aprobado en puerta humana.

  @s6
  Scenario: El teléfono real escrito con espacios no dispara el patrón del inventado
    Given el texto de un artefacto de producción que contiene "+34 625 22 33 66"
    When se inspecciona ese texto
    Then la lista de violaciones está vacía

  @s7
  Scenario Outline: Los patrones de texto se cazan con otra caja y sin acentos
    Given el texto de un artefacto de producción que contiene "<contenido>"
    When se inspecciona ese texto
    Then hay exactamente 1 violación
    And la violación declara que la disparó el patrón "<patron>"

    Examples:
      | patron                    | contenido                            |
      | IMAGEN TEMPORAL           | imagen temporal                      |
      | IMAGEN TEMPORAL           | Imagen Temporal                      |
      | Plantilla de demostración | plantilla de demostracion            |
      | Plantilla de demostración | PLANTILLA DE DEMOSTRACIÓN            |
      | Calle de la Belleza       | calle de la belleza 24, 28010 Madrid |
      | hola@nailslashstudio.com  | HOLA@NAILSLASHSTUDIO.COM             |
      | ph-woman                  | /assets/PH-Woman0.PNG                |

  # ---------------------------------------------------------------------------
  # La inspección (función pura): contar, ordenar y no mentir
  # ---------------------------------------------------------------------------

  @s8
  Scenario: Tres infracciones distintas producen tres violaciones, no una
    Given el texto de un artefacto de producción que contiene "Calle de la Belleza 24", "+34 600 123 456" y "/assets/ph-woman0.png"
    When se inspecciona ese texto
    Then hay exactamente 3 violaciones
    And las violaciones declaran los patrones "Calle de la Belleza", "600123456" y "ph-woman"

  @s23
  Scenario: Un registro marcado que además contiene un patrón produce dos violaciones, una por vía
    Given un árbol de datos con el registro "contacto.email" marcado esPlaceholder: true y con valor "hola@nailslashstudio.com"
    When se inspecciona el árbol de datos
    Then hay exactamente 2 violaciones
    And una violación declara que la disparó el flag esPlaceholder en "contacto.email"
    And otra violación declara que la disparó el patrón "hola@nailslashstudio.com" en "contacto.email"
    # Son dos infracciones independientes y el informe acusa las dos: «una violación por cada
    # infracción encontrada». Un "else if" en vez de dos "if" independientes deja una sin acusar.

  @s9
  Scenario: Dos inspecciones de la misma entrada devuelven la misma lista en el mismo orden
    Given una entrada con 1 violación por flag y 2 violaciones por patrón
    When se inspecciona esa misma entrada dos veces
    Then las dos listas de violaciones son idénticas, elemento a elemento y en el mismo orden

  @s25
  Scenario: Las violaciones se emiten en orden de aparición, no en el orden de la lista de patrones
    Given un árbol de datos con "legal.nif" y después "legal.razonSocial", ambos marcados esPlaceholder: true
    And un artefacto cuyo "dist/index.html" contiene primero "/assets/ph-woman0.png" y después "Calle de la Belleza 24"
    When se inspecciona esa entrada
    Then se emiten exactamente 4 violaciones en este orden: el flag de "legal.nif", el flag de "legal.razonSocial", el patrón "ph-woman" y el patrón "Calle de la Belleza"
    # Primero el árbol de datos, después los ficheros del artefacto en orden estable, y dentro de
    # cada fichero por posición en el contenido. Nótese el discriminante: "Calle de la Belleza" va
    # ANTES que "ph-woman" en la lista de patrones y DESPUÉS en el fichero. Manda el contenido.
    # Recorrer la lista de patrones en el bucle exterior da el orden equivocado y muere aquí.

  @s10
  Scenario: Un registro marcado como placeholder con contenido real es violación igual
    Given un árbol de datos con el registro "nap.telefono" marcado esPlaceholder: true y con el valor real verificado "625 22 33 66"
    When se inspecciona el árbol de datos
    Then hay exactamente 1 violación
    And la violación declara que la disparó el flag esPlaceholder
    # El flag manda: dice «esto no está confirmado», y publicar sin confirmar es lo que D-6 prohíbe.

  @s11
  Scenario: Un dato inventado nuevo, sin marcar y sin patrón, la puerta NO lo caza
    Given un árbol de datos con el registro "servicios.0.precio" marcado esPlaceholder: false y con el valor inventado "31 €"
    When se inspecciona el árbol de datos
    Then la lista de violaciones está vacía
    # Límite declarado, no defecto: la puerta cubre lo conocido y no promete lo que no cumple.

  # ---------------------------------------------------------------------------
  # La puerta: producción falla, desarrollo no
  # ---------------------------------------------------------------------------

  @s12
  Scenario: El build de producción con una violación termina con código de salida distinto de 0
    Given un artefacto de producción que contiene "hola@nailslashstudio.com"
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida nombra el patrón "hola@nailslashstudio.com"

  @s13
  Scenario: El build de producción con un artefacto limpio termina con código de salida 0
    Given un artefacto de producción que incluye "dist/index.html", y un árbol de datos en el que todos los registros declaran esPlaceholder: false
    And ese artefacto contiene el NAP real "+34 625 22 33 66" y "C.C. El Zoco, Av. de Atenas 75, Local 41, 28232 Las Rozas de Madrid"
    When se ejecuta el build de producción
    Then el código de salida es 0
    And no se emite ninguna violación

  @s14
  Scenario: El build de desarrollo con datos placeholder NO falla
    Given un árbol de datos con registros marcados esPlaceholder: true
    And un artefacto de desarrollo que contiene "IMAGEN TEMPORAL" y "/assets/ph-woman0.png"
    When se ejecuta el build de desarrollo
    Then el código de salida es 0
    And el artefacto de desarrollo conserva la imagen "ph-woman0.png"
    # D-8: en local las fotos IA y los datos placeholder son legítimos; son para ver el diseño.

  @s15
  Scenario: El informe de la puerta acusa: una línea por violación con patrón o flag, ubicación y valor
    Given un artefacto de producción cuyo fichero "dist/index.html" contiene "Calle de la Belleza 24"
    And un árbol de datos con el registro "legal.nif" marcado esPlaceholder: true y con valor "pendiente"
    When se ejecuta el build de producción
    Then la salida contiene exactamente 2 líneas de violación
    And una línea nombra el patrón "Calle de la Belleza", la ubicación "dist/index.html" y el valor encontrado
    And otra línea nombra el flag esPlaceholder, la ubicación "legal.nif" y el valor "pendiente"
    And el código de salida es distinto de 0
    # La puerta debe acusar, no gruñir: «hay un placeholder» sin decir cuál obliga a buscarlo a mano.

  # ---------------------------------------------------------------------------
  # La puerta: lo que esquiva a cada vía por separado
  # ---------------------------------------------------------------------------

  @s16
  Scenario: Un literal escrito a mano en la plantilla, ausente de los datos, lo caza el artefacto
    Given un árbol de datos sin ninguna violación, con todos sus registros marcados esPlaceholder: false
    And un artefacto de producción cuyo "dist/index.html" contiene el literal "+34 600 123 456" escrito a mano en la plantilla
    When se ejecuta el build de producción
    Then hay exactamente 1 violación
    And la violación declara que la disparó el patrón "600123456" en "dist/index.html"
    And el código de salida es distinto de 0
    # Los datos cazan lo declarado; el artefacto caza lo que esquivó la capa de datos (bug H-2).

  @s17
  Scenario: Una imagen placeholder inlinada como data: URI la caza la vía por flag
    Given un árbol de datos con el registro "equipo.0.foto" marcado esPlaceholder: true cuyo fichero es "ph-woman0.png"
    And un artefacto de producción donde esa imagen aparece inlinada como "data:image/png;base64,iVBORw0KGgo…" y en el que la cadena "ph-woman" no aparece ni una vez
    When se ejecuta el build de producción
    Then hay al menos 1 violación
    And una violación declara que la disparó el flag esPlaceholder del registro "equipo.0.foto"
    And el código de salida es distinto de 0
    # El empaquetador inlina los assets pequeños y el nombre del fichero desaparece: buscar por
    # nombre no basta cuando el fichero deja de tener nombre. La vía por flag es la robusta y ES
    # LA GARANTÍA: este escenario debe pasar CON el inlining activado. El contrato NO exige tocar
    # la configuración del empaquetador (assetsInlineLimit) ni depende de ella — acoplarlo lo haría
    # frágil sin ganar nada. El patrón es la red; el flag es la puerta.

  @s18
  Scenario: El escaneo excluye el propio código de la puerta
    Given un artefacto de producción limpio
    And que entre los ficheros a inspeccionar está el propio módulo de la puerta, que declara los 6 patrones prohibidos como literales
    When se ejecuta el build de producción
    Then no se emite ninguna violación cuya ubicación sea el módulo de la puerta
    And el código de salida es 0
    # Si no, la puerta fallaría siempre por su propia existencia.

  @s19
  Scenario: La puerta escanea el artefacto de producción, no el repositorio
    Given un repositorio cuyo "project-spec.md" contiene "Calle de la Belleza" y "ph-woman"
    And un artefacto de producción limpio, con ficheros inspeccionables
    When se ejecuta el build de producción
    Then no se emite ninguna violación
    And el código de salida es 0
    # "project-spec.md" no se despliega: un texto legítimo que cita un patrón no es un falso positivo.

  # ---------------------------------------------------------------------------
  # La puerta: falla cerrada (A-8 y modos de error)
  # ---------------------------------------------------------------------------

  @s20
  Scenario: La puerta falla si el directorio del artefacto de producción no existe
    Given que el directorio del artefacto de producción no existe
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida declara que no había nada que inspeccionar
    And la salida no declara que no haya violaciones

  @s21
  Scenario: La puerta falla si no ha inspeccionado ni un fichero
    Given un directorio de artefacto de producción que existe pero no contiene ningún fichero inspeccionable
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida no declara que no haya violaciones
    # Verde por vacuidad: 0 violaciones sobre 0 ficheros no es estar protegido, es no haber mirado.
    # Este estado incumple también la regla de @s26 (falta "dist/index.html"). El contrato NO fija
    # cuál de las dos razones se informa —fijarlo ataría la implementación sin ganar nada—: fija
    # que el build rompe y que NO se reporta verde.

  @s26
  Scenario: La puerta falla si no ha inspeccionado el HTML de entrada del artefacto
    Given un artefacto de producción que contiene 3 hojas de estilo inspeccionables y ningún "dist/index.html"
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida declara que no se inspeccionó "dist/index.html"
    # Haber inspeccionado «algo» no basta: un dist/ con hojas de estilo y sin HTML devuelve 0
    # violaciones y pasaría «protegido». En un sitio SSG el HTML de entrada existe SIEMPRE; si
    # falta, algo ha ido muy mal y el build debe romper en vez de felicitarnos.

  @s22
  Scenario: La puerta falla cerrada si ella misma revienta
    Given un fichero del artefacto de producción cuya lectura lanza una excepción
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida declara que la puerta no pudo completar la inspección
    And la salida no declara que no haya violaciones
    # Una puerta que se traga su propia excepción y devuelve [] es peor que no tener puerta,
    # porque además da confianza. Si la puerta puede fallar en silencio, D-9 es falsa.
