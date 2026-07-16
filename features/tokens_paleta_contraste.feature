# Contrato de la feature 3 (`tokens_paleta_contraste`) de feature_list.json.
# Destilado de project-spec.md → «Feature 3: tokens_paleta_contraste — la paleta accesible con
# puerta que recalcula». Es la primera implementación de I-3 («WCAG 2.2 AA con una puerta que
# recalcula el contraste desde el SCSS») y encarna T-1 («NO copiar `_tokens.scss` de WebEmpresa»).
#
# ⏸  PENDIENTE de aprobación humana. AÚN NO aprobado en la puerta. Nada de esto se implementa
#    hasta que el humano lo apruebe. Lo que no está escrito aquí, no está decidido.
#
# ALCANCE MUTABLE (decisión del lead, cerrada): la lógica mutable es `src/lib/contraste.ts`
# (`hexARgb`, `canalLineal`, `luminancia`, `ratio`, `componer`) MÁS el predicado de la puerta
# (comparar ratio contra umbral). El SCSS NO es mutable: Stryker no ve CSS/SCSS y `src/styles/`
# no está en la lista `mutate`. Los 7 tokens corregidos son un cambio de VALORES; la puerta es
# lo que los verifica. Como en F-01: la función es pura, el `exit ≠ 0` vive en la puerta.
#
# FÓRMULA WCAG 2.2 (W3C G17), verificada en fuente oficial — se usa TAL CUAL:
#   - Luminancia relativa sRGB: L = 0.2126·R + 0.7152·G + 0.0722·B, con cada canal C∈[0,1]
#     linealizado: si C ≤ 0.04045 → C/12.92; si no → ((C+0.055)/1.055)^2.4.
#     El umbral es 0.04045 (WCAG 2.2). El 0.03928 es el valor ANTERIOR (mayo 2021), sin efecto
#     práctico en 8 bits. Fuente: https://www.w3.org/WAI/GL/wiki/Relative_luminance
#   - Ratio de contraste: (L1 + 0.05) / (L2 + 0.05), con L1 la luminancia MÁS CLARA.
#   - Umbrales: SC 1.4.3 texto normal 4,5:1 · texto grande (≥24 px, o ≥18,5 px negrita) 3:1;
#     SC 1.4.11 componentes/bordes de control 3:1.
#     Fuentes: w3.org/WAI/WCAG22/Understanding/contrast-minimum.html y non-text-contrast.html
#
# ANTI-TAUTOLOGÍA (regla dura del arnés; precedente WebEmpresa: el fake de `useIsMobile` atado al
# símbolo `MOBILE_QUERY` en vez del literal fue el primer mutante superviviente —
# `.memoria-cache/patterns/testing/doble-de-test-anclado-al-literal-no-al-simbolo.md`). El
# ratio/veredicto/luminancia ESPERADO se escribe A MANO en el escenario y en el test
# (`toBeCloseTo(6.19)`, `4.5`, `3.0`, `21`, `0.2126`), NUNCA se recomputa con la misma función
# de producción que se vigila, ni re-llamando a `canalLineal`/`ratio` dentro del test. Los
# umbrales (4,5 / 3,0) son literales del test. Si el test reflejara la fórmula, una fórmula rota
# pasaría verde y todos los mutantes de la acceptance 7 sobrevivirían. Los valores «a mano»
# provienen del audit [V] (`contrast.py`/`contrast2.py`), no de la implementación de esta feature.
#
# DECISIONES YA RESUELTAS (contrato CERRADO):
#   - A-13 (matriz de uso): la lista de pares comprobados es una MATRIZ DE USO declarada
#     (par fg/bg + rol + umbral + tamaño efectivo del clamp), NO el producto cartesiano de tokens.
#     La puerta itera esa matriz. DOS guardas anti-«verde por vacuidad» (como @s20/@s21 de F-01):
#       (a) la puerta EXIGE haber evaluado un mínimo conocido de pares; matriz vacía o regex del
#           SCSS que no casa nada → falla cerrada, no pasa (@s14).
#       (b) asevera el NEGATIVO: ningún par de rol texto/componente usa `#C05576` como fg; el
#           texto usa `--accent-dark #A23E5F`, no `--accent` (@s13).
#   - A-14 (umbral 0.04045): el mutante `0.04045 → 0.03928` es EQUIVALENTE si SOLO se prueban
#     colores hex de 8 bits (ningún canal entero c/255 cae en el hueco 0.03928–0.04045: 10/255 =
#     0,0392 < ; 11/255 = 0,0431 >). Se resuelve por DOS vías: (1) Stryker 9.6 no genera el swap
#     literal→literal (sus mutadores numéricos mutan operador/condición, no una constante por otra
#     concreta); esos mutantes de condición SÍ mueren (@s5, @s6). (2) `canalLineal` se prueba con
#     un input SINTÉTICO normalizado en el punto de corte, no solo vía hex, para cubrir la rama de
#     verdad y matar el mutante `<=` → `<` (@s6). Además `luminancia` se prueba con colores
#     CROMÁTICOS de tres canales (@s7) para que los mutantes de coeficiente mueran (un test solo
#     con grises los deja vivos — caso límite 5).
#   - A-15 (cabecera translúcida): se MANTIENE translúcida (fiel al diseño). La puerta valida el
#     `color-mix(in srgb, --bg 82%, transparent)` recalculando `--muted` (nav) e `--ink` (logo)
#     con `componer(--bg@.82, under)` contra un conjunto DECLARADO de under-colors del peor caso,
#     CON los tokens corregidos (@s17). El enumerado completo de qué secciones scrollean debajo se
#     cierra en F-06; F-03 fija la capacidad (`componer`) y valida los under conocidos.
#   - Caso límite 6 (formato hex), CERRADO aquí: `hexARgb` acepta `#RRGGBB` y `#RGB`, insensible a
#     mayúsculas/minúsculas; el `#` es OBLIGATORIO (los tokens del SCSS siempre lo llevan). Sin `#`,
#     con longitud distinta de 3/6, o con dígitos no hexadecimales → lanza (falla cerrada) (@s3, @s4).
#
# TRAZA A LOS 7 ACCEPTANCE de feature_list.json (feature id 3):
#   A1 (contraste.ts implementa G17: L y ratio) → @s5, @s6, @s7, @s8, @s9
#   A2 (la puerta lee _tokens.scss, recalcula TODOS los pares y falla bajo umbral) → @s11, @s12, @s15
#   A3 (los 7 cambios aplicados) → @s10, @s11
#   A4 (#C05576 se conserva como marca en rellenos grandes/decorativos) → @s10, @s13
#   A5 (trampa clamp(): Studio pasa en escritorio y falla en móvil) → @s16
#   A6 (trampa color-mix(): la cabecera translúcida cambia de contraste al scroll) → @s17
#   A7 (mutar 0.04045, coeficientes, 4.5 vs 3.0 o +0.05 rompe un test) → @s6, @s7, @s8, @s11, @s12, @s16
#
# Guarda de vacuidad + falla cerrada (modos de error, análogo a A-8 de F-01) → @s14, @s15.

Feature: Tokens de la paleta Rosa + puerta de contraste que recalcula los ratios
  Como responsable del proyecto quiero que los 13 tokens de la paleta vivan en un :root real con
  los 7 cambios que cumplen WCAG 2.2 AA, y que una puerta mecánica recalcule el contraste desde el
  SCSS y rompa el build si cualquier par en uso baja de su umbral, para que corregir la paleta sea
  una garantía verificada y no una recomendación que alguien deshace en silencio dentro de seis
  meses — que es exactamente cómo el stack base tenía 3 bloqueantes AA en HEAD con las tres
  puertas verdes: ninguna feature los representaba. Una auditoría sin puerta no existe.

  # ---------------------------------------------------------------------------
  # hexARgb: parseo del hex a canales 0–255 (A1; caso límite 6; modos de error)
  # ---------------------------------------------------------------------------

  @s1
  Scenario Outline: hexARgb convierte "#RRGGBB" a tres enteros 0–255
    Given el color hex "<hex>"
    When se llama a hexARgb con ese color
    Then el resultado es exactamente los canales [<r>, <g>, <b>]

    Examples:
      | hex      | r   | g   | b   |
      | #000000  | 0   | 0   | 0   |
      | #FFFFFF  | 255 | 255 | 255 |
      | #A23E5F  | 162 | 62  | 95  |
      | #186237  | 24  | 98  | 55  |
    # Los canales esperados se escriben a mano (162 = 0xA2, 62 = 0x3E, 95 = 0x5F; 24 = 0x18,
    # 98 = 0x62, 55 = 0x37). #A23E5F es --accent-dark y #186237 es «en línea»: tokens reales de la
    # paleta corregida, con aporte de los tres canales (necesario para @s7).

  @s2
  Scenario Outline: hexARgb expande la forma corta "#RGB"
    Given el color hex "<hex>"
    When se llama a hexARgb con ese color
    Then el resultado es exactamente los canales [<r>, <g>, <b>]

    Examples:
      | hex   | r   | g   | b   |
      | #fff  | 255 | 255 | 255 |
      | #000  | 0   | 0   | 0   |
      | #123  | 17  | 34  | 51  |
    # "#123" expande a "#112233" → [17, 34, 51] (0x11=17, 0x22=34, 0x33=51). Escritos a mano.

  @s3
  Scenario: hexARgb es insensible a mayúsculas/minúsculas y exige el "#"
    Given los colores hex "#a23e5f" y "#A23E5F"
    When se llama a hexARgb con cada uno
    Then ambos devuelven exactamente los canales [162, 62, 95]
    # Cierra el caso límite 6 (menor, [PREGUNTA] del spec): el parser normaliza la caja. El "#" es
    # obligatorio; una entrada sin "#" es inválida (@s4). Los tokens del SCSS siempre llevan "#".

  @s4
  Scenario Outline: hexARgb lanza ante un hex malformado (falla cerrada)
    Given la entrada "<entrada>"
    When se llama a hexARgb con esa entrada
    Then hexARgb lanza un error
    And no devuelve ningún canal a medias

    Examples:
      | entrada  | motivo                                              |
      | ""       | cadena vacía: no hay hex                             |
      | A23E5F   | sin "#": el parser lo exige                          |
      | #GGGGGG  | dígitos no hexadecimales                             |
      | #12      | longitud inválida: ni 3 ni 6 dígitos                 |
      | #12345   | longitud inválida: 5 dígitos                         |
    # "" denota la cadena vacía. Falla cerrada (derivación de I-3, igual que F-01): ante un hex que
    # el SCSS no debería contener, lanzar en vez de devolver [0,0,0] a medias, que la puerta
    # confundiría con un color real y evaluaría un ratio falso.

  # ---------------------------------------------------------------------------
  # canalLineal: linealización sRGB y el umbral 0.04045 (A1; A-14; acceptance 7)
  # ---------------------------------------------------------------------------

  @s5
  Scenario Outline: canalLineal aplica la rama correcta según el umbral 0.04045
    Given el canal de 8 bits <c8>
    When se llama a canalLineal con ese canal
    Then el resultado es exactamente <esperado>

    Examples:
      | c8  | esperado | rama                                                             |
      | 0   | 0        | lineal: 0/12.92 = 0 exacto                                        |
      | 255 | 1        | potencia: ((1+0.055)/1.055)^2.4 = 1^2.4 = 1 exacto                |
    # Dos anclas exactas y hand-checkables: canalLineal(0) = 0 y canalLineal(255) = 1. Matan los
    # mutantes de condición de Stryker que fuerzan la rama: forzar la condición a `true` (siempre
    # lineal) haría canalLineal(255) = 1/12.92 ≈ 0,077 ≠ 1 → muere aquí; forzarla a `false`
    # (siempre potencia) haría canalLineal(0) = (0.055/1.055)^2.4 ≈ 0,000834 ≠ 0 → muere aquí.

  @s6
  Scenario: canalLineal en el punto de corte usa la rama lineal (mata el mutante 0.04045 → <)
    Given un canal SINTÉTICO cuyo valor normalizado es exactamente 0.04045 (el punto de corte)
    When se llama a canalLineal con ese canal
    Then usa la rama LINEAL (resultado = 0.04045 / 12.92), no la rama de potencia
    And para un canal cuyo valor normalizado sea 0.05 (por encima del corte) usa la rama de POTENCIA
    # A-14. Se prueba con un input SINTÉTICO en el corte, no vía hex, porque ningún canal entero
    # c/255 cae ahí. El input en 0.04045 exacto discrimina `c <= 0.04045` de `c < 0.04045`: con `<=`
    # entra en la rama lineal, con `<` entra en la de potencia, y los dos resultados difieren → el
    # mutante `<=` → `<` muere. Sobre el mutante literal `0.04045 → 0.03928`: Stryker 9.6 NO lo
    # genera (no cambia una constante por otra concreta); si apareciera, sería equivalente en 8 bits
    # (por eso este contrato lo cubre con el input sintético y no finge una cobertura imposible).

  # ---------------------------------------------------------------------------
  # luminancia: los coeficientes 0.2126/0.7152/0.0722 (A1; caso límite 5; acceptance 7)
  # ---------------------------------------------------------------------------

  @s7
  Scenario Outline: la luminancia de un primario puro es exactamente su coeficiente
    Given el color "<hex>"
    When se calcula su luminancia
    Then la luminancia es exactamente <esperado>

    Examples:
      | hex      | esperado | por qué                                                        |
      | #000000  | 0        | negro: 0.2126·0 + 0.7152·0 + 0.0722·0 = 0                       |
      | #FFFFFF  | 1        | blanco: 0.2126 + 0.7152 + 0.0722 = 1 (los coeficientes suman 1) |
      | #FF0000  | 0.2126   | rojo puro: canalLineal(255)=1 en R, 0 en G y B → 0.2126         |
      | #00FF00  | 0.7152   | verde puro → 0.7152                                             |
      | #0000FF  | 0.0722   | azul puro → 0.0722                                              |
    # Caso límite 5: los primarios puros aíslan cada coeficiente con un valor EXACTO escrito a mano,
    # porque canalLineal(255)=1 y canalLineal(0)=0. Matan los mutantes de coeficiente: mutar 0.2126
    # cambia luminancia(#FF0000); mutar 0.7152, la de #00FF00; mutar 0.0722, la de #0000FF. Mutar el
    # `+` que une los tres términos por `-` haría luminancia(#FFFFFF) = 0.2126−0.7152−0.0722 ≠ 1, y
    # mutar `·` por `/` cambiaría todos. Un test SOLO con grises (R=G=B) dejaría estos mutantes vivos.

  # ---------------------------------------------------------------------------
  # ratio: (L1+0.05)/(L2+0.05), simétrico (A1; acceptance 7: +0.05 y el /)
  # ---------------------------------------------------------------------------

  @s8
  Scenario: el ratio blanco/negro es exactamente 21 y es simétrico
    Given los colores blanco "#FFFFFF" (luminancia 1) y negro "#000000" (luminancia 0)
    When se calcula el ratio entre ellos
    Then el ratio es exactamente 21
    And ratio(blanco, negro) es igual a ratio(negro, blanco)
    # A1. 21 = (1 + 0.05) / (0 + 0.05) = 1.05 / 0.05, escrito a mano (el máximo teórico WCAG). Mata
    # el mutante `+0.05` → `-0.05` (daría 0.95/−0.05 = −19) y la eliminación del `+0.05` (daría 1/0 =
    # Infinity); y el mutante `/` → `·` (daría 1.05·0.05 = 0.0525). La simetría fija que L1 es el más
    # claro con independencia del orden de los argumentos.

  # ---------------------------------------------------------------------------
  # componer: composición alfa sobre fondo opaco (A1; --line α=.16 y color-mix α=.82)
  # ---------------------------------------------------------------------------

  @s9
  Scenario Outline: componer mezcla α·fg + (1−α)·bg canal a canal
    Given el color de primer plano <fg> con alfa <alfa> sobre el fondo opaco <bg>
    When se llama a componer con esos valores
    Then el resultado es exactamente los canales <esperado>

    Examples:
      | fg              | alfa | bg              | esperado              | caso                                  |
      | [162, 62, 95]   | 1    | [255, 255, 255] | [162, 62, 95]         | α=1 → devuelve el fg opaco             |
      | [162, 62, 95]   | 0    | [255, 255, 255] | [255, 255, 255]       | α=0 → devuelve el fondo                 |
      | [0, 0, 0]       | 0.16 | [255, 255, 255] | [214.2, 214.2, 214.2] | --line α=.16: 0.16·0 + 0.84·255 = 214.2 |
      | [255, 255, 255] | 0.82 | [0, 0, 0]       | [209.1, 209.1, 209.1] | color-mix --bg@.82: 0.82·255 = 209.1    |
    # A1. Cubre `--line rgba(...,.16)` (decorativo) y el `color-mix(in srgb, --bg 82%, transparent)`
    # de la cabecera (equivale a --bg con α=.82 sobre lo que scrollee debajo, @s17). Los esperados se
    # escriben a mano (0.84·255 = 214.2; 0.82·255 = 209.1). Las filas α=1 y α=0 son las identidades.

  # ---------------------------------------------------------------------------
  # Los 13 tokens en :root con los 7 cambios (A3, A4; inventario A-15)
  # ---------------------------------------------------------------------------

  @s10
  Scenario Outline: _tokens.scss declara cada token en un :root real con su valor corregido
    Given el fichero "src/styles/_tokens.scss" con un bloque :root
    When se lee el valor del token "<token>"
    Then su valor es exactamente "<valor>"

    Examples:
      | token                | valor    | cambio                                                     |
      | --muted              | #6F525A  | cambio 1: valor (antes #9C7F89, inservible como texto)      |
      | --accent-2           | #B3316E  | cambio 4: valor (antes #E38AAE, 2,47:1 con blanco)         |
      | --border-interactive | #AB5F79  | cambio 5: token NUEVO para bordes de control (SC 1.4.11)    |
      | --ink                | #8E3355  | cambio 6: valor para el fondo del pie (antes #B0466A)       |
      | --accent-dark        | #A23E5F  | usado como texto/borde por los cambios 2 y 3               |
      | --accent             | #C05576  | A4: se CONSERVA como color de marca en rellenos grandes     |
    # A3 verbatim (los 7 cambios) y A4. El :root es real, no un `style` inline como el prototipo
    # (Opcion-1-Rosa.dc.html:28). `--accent #C05576` se conserva para rellenos decorativos
    # (`--accent`, `--brush`); el color de estado «en línea» #186237 (cambio 7) y `--muted #6F525A`
    # completan el inventario. NO se copia `_tokens.scss` de WebEmpresa (T-1): sus valores base
    # arrastran 3 bloqueantes AA. Cada literal se escribe a mano.

  # ---------------------------------------------------------------------------
  # La puerta: recalcula la MATRIZ DE USO desde el SCSS (A2, A3, A7; A-13)
  # ---------------------------------------------------------------------------

  @s11
  Scenario Outline: cada par en uso, corregido, alcanza SU umbral y el build queda verde
    Given "src/styles/_tokens.scss" con los 7 cambios aplicados
    And la matriz de uso declarada con el par "<fg>" sobre "<bg>", rol "<rol>", umbral <umbral>
    When la puerta recalcula el ratio de ese par desde el SCSS
    Then el ratio es aproximadamente <ratio>
    And el par pasa su umbral <umbral>
    And no se emite ninguna violación para ese par

    Examples:
      | fg                        | bg                  | rol         | umbral | ratio |
      | --muted #6F525A           | --bg                | texto       | 4.5    | 6.42  |
      | --muted #6F525A           | --surface           | texto       | 4.5    | 6.93  |
      | --accent-dark #A23E5F     | --bg                | texto       | 4.5    | 5.74  |
      | --accent-dark #A23E5F     | --surface           | texto       | 4.5    | 6.19  |
      | --accent-dark #A23E5F     | --surface2          | texto       | 4.5    | 5.24  |
      | --accent-dark #A23E5F     | --accent-soft       | texto       | 4.5    | 4.86  |
      | #FFFFFF                   | --accent-dark       | texto       | 4.5    | 6.19  |
      | #FFFFFF                   | --accent-2 #B3316E  | texto/icono | 4.5    | 5.86  |
      | --ink #8E3355             | --bg                | texto       | 4.5    | 7.06  |
      | --ink #8E3355             | --surface2          | texto       | 4.5    | 6.45  |
      | --ink #8E3355             | --accent-soft       | texto       | 4.5    | 5.98  |
      | --text #5E404A            | --bg                | texto       | 4.5    | 8.43  |
      | --text #5E404A            | --surface2          | texto       | 4.5    | 7.70  |
      | rgba(#FFFFFF,.70)         | --ink #8E3355       | texto       | 4.5    | 4.60  |
      | --border-interactive #AB5F79 | --accent-soft    | componente  | 3.0    | 3.54  |
      | #186237                   | --accent-soft       | texto       | 4.5    | 5.79  |
    # A2 + A3 + A7. Es la MATRIZ DE USO (A-13): las combinaciones que la página usa de verdad, no el
    # producto cartesiano de tokens. Los ratios son [V] del audit y se escriben A MANO
    # (`toBeCloseTo(6.19)`); el test NUNCA los recomputa con `ratio()`, que es la función vigilada
    # (anti-tautología). El botón «Reservar» es #FFFFFF/--accent-dark = 6.19 (antes 4,37 con #C05576).
    # La fila del pie `rgba(#FFFFFF,.70)/--ink` usa `componer` (@s9). La fila `--border-interactive`
    # con umbral 3.0 mata el mutante 3.0 → 4.5: con 4.5 su ratio 3.54 fallaría; con 3.0 pasa.

  @s12
  Scenario: un par por debajo de su umbral produce una violación y rompe el build
    Given una matriz de uso con el par de rol texto "#FFFFFF" sobre "#C05576", umbral 4.5
    When la puerta recalcula ese par desde el SCSS
    Then el ratio es aproximadamente 4.37
    And se emite exactamente 1 violación que nombra el par, el ratio 4.37 y el umbral 4.5
    And el código de salida del build es distinto de 0
    And el informe es determinista: misma entrada → misma salida, mismo orden de violaciones
    # A2 + A7. Fixture de par MALO CONOCIDO: el botón «Reservar» VIEJO, blanco sobre #C05576 = 4,37
    # ([V] audit), que cae en el hueco (3,0 · 4,5). Mata el mutante 4.5 → 3.0 en un par de texto: con
    # el umbral mutado a 3.0 este par pasaría (4,37 > 3,0) y la violación desaparecería. La puerta debe
    # ACUSAR el par exacto con su ratio y su umbral, no decir «hay un fallo de contraste» (como F-01).

  @s13
  Scenario: la matriz de uso NUNCA usa #C05576 como fg de un par de texto o de componente
    Given "src/styles/_tokens.scss" con --accent = #C05576 y --accent-dark = #A23E5F
    When se recorre la matriz de uso
    Then ningún par de rol texto o componente declara "#C05576" (--accent) como color de primer plano
    And el texto sobre fondo claro usa "--accent-dark #A23E5F", no "--accent"
    And "#C05576" solo aparece como relleno grande o decorativo (--accent, --brush), fuera de la matriz
    # A-13 (aseveración del NEGATIVO, análoga a @s21 de F-01) + A4 + regla dura del audit §5.2:
    # «prohibido #C05576 como texto pequeño o como relleno con texto blanco — se reintroduce solo».
    # El problema nunca fue la estética rosa, sino confundir «color de marca para rellenos» con
    # «color de texto». Sin esta guarda, alguien reintroduce #C05576 como texto y la puerta calla.

  @s14
  Scenario: la puerta falla si no ha evaluado un mínimo de pares (verde por vacuidad)
    Given una matriz de uso vacía, o un regex del SCSS que no casa ningún token
    When se ejecuta la puerta de contraste
    Then el código de salida es distinto de 0
    And la salida declara que no se evaluó el mínimo de pares exigido
    And la salida NO declara que no haya fallos de contraste
    # A-13, guarda (a), análoga a A-8 de F-01. Verde por vacuidad: 0 fallos sobre 0 pares no es estar
    # protegido, es no haber mirado. Una matriz que apunta a un token que ya no existe, o un regex que
    # deja de casar `:root`, haría que la puerta pasara «protegidos». La puerta EXIGE un mínimo conocido
    # de pares evaluados; si no lo alcanza, falla cerrada.

  @s15
  Scenario Outline: la puerta falla cerrada ante un SCSS ilegible o un token roto
    Given "<situacion>" al leer "src/styles/_tokens.scss"
    When se ejecuta la puerta de contraste
    Then el código de salida es distinto de 0
    And la salida declara la causa y NO declara que no haya fallos de contraste

    Examples:
      | situacion                                                     |
      | el fichero _tokens.scss no existe o no se puede leer          |
      | un token de la matriz de uso no está declarado en el :root    |
      | un token está declarado con un hex malformado                 |
    # Modos de error (derivación de I-3, igual que F-01). Una puerta que se traga la excepción y
    # devuelve «0 fallos» es PEOR que ninguna: da confianza falsa. Es literalmente cómo se evaporaron
    # los 3 bloqueantes AA del stack base. Ante la duda: build roto, nunca verde.

  # ---------------------------------------------------------------------------
  # Trampa (a): clamp() — el ratio no cambia, el UMBRAL sí (A5; acceptance 7)
  # ---------------------------------------------------------------------------

  @s16
  Scenario: la puerta aplica al clamp() el umbral del tamaño MÍNIMO, no del máximo
    Given el par "Studio" con font-size clamp(14px, 2.2vw, 24px), rol texto sobre --accent-soft
    And la matriz registra su tamaño efectivo MÍNIMO (14 px), que exige umbral 4.5
    When la puerta evalúa un fixture con el ratio constante 4.19 (el --ink VIEJO)
    Then la puerta aplica el umbral 4.5 (texto normal a 14 px), no 3.0 (texto grande a 24 px)
    And marca el fixture 4.19 como violación, porque a 14 px «Studio» es texto normal
    And con el --ink #8E3355 corregido «Studio» sube a 5.98 y pasa incluso a 14 px (@s11)
    # A5. La trampa: «Studio» da 4,19:1 CONSTANTE ([V]); a 24 px (escritorio) es texto grande →
    # umbral 3,0 → pasaría; a 14 px (móvil) es texto normal → umbral 4,5 → falla. Se detecta SIN
    # navegador porque es cálculo, no render: la matriz registra el tamaño efectivo mínimo del clamp
    # y la puerta aplica el umbral del PEOR caso (4,5). El cambio 6 (--ink #8E3355 → 5,98) cierra la
    # trampa por valor, pero la puerta debe modelar el mínimo para que la clase de bug no vuelva.
    # (Escape A-4: si «Nails Lash Studio» es logotipo, SC 1.4.3 lo exime; decisión del humano, no se
    # depende de ella — se construye AA igual.)

  # ---------------------------------------------------------------------------
  # Trampa (b): color-mix() — la cabecera translúcida (A6; A-15)
  # ---------------------------------------------------------------------------

  @s17
  Scenario Outline: la cabecera translúcida se recompone con componer(--bg@.82, under) y pasa su umbral
    Given la cabecera con background color-mix(in srgb, --bg 82%, transparent)
    And un under-color del peor caso "<under>" que puede scrollear bajo la cabecera
    When se compone el fondo real con componer(--bg@.82, under) y se recalcula el par "<fg>"
    Then el ratio del par recompuesto es al menos su umbral <umbral>
    And no se emite ninguna violación para ese par sobre ese under

    Examples:
      | fg                | rol         | under            | umbral |
      | --muted #6F525A   | texto (nav) | --surface2       | 4.5    |
      | --muted #6F525A   | texto (nav) | --accent-soft    | 4.5    |
      | --ink #8E3355     | logo        | --surface2       | 4.5    |
      | --ink #8E3355     | logo        | foto oscura      | 4.5    |
    # A6 + A-15. El fondo real de la cabecera es 82% --bg + 18% de lo que pase por debajo. Se testea
    # SIN navegador porque color-mix es composición determinista: `componer(--bg@.82, under)` (@s9)
    # para cada under posible, y se recalculan --muted (nav) e --ink (logo) contra cada uno CON los
    # tokens corregidos. Con los tokens VIEJOS el logo --ink caía a 3,88:1 / 3,96:1 cuando el pie o
    # un botón pasaban por debajo ([V, audit §2.6]); el audit calculó la trampa con tokens ANTIGUOS y
    # NO re-verificó la cabecera corregida → la puerta es quien decide. El conjunto de under-colors es
    # declarado (peor caso conocido); el enumerado completo de secciones que scrollean se cierra en F-06.
