# =============================================================================================
# CONTRATO — F-28 `favicon_marca`: la «N» caligráfica de Great Vibes (la letra del rótulo del hero),
# en --ink sobre un cuadrado de esquinas redondeadas --accent-soft, declarada en `index.html` como
# SVG + ICO de respaldo (16 y 32) + apple-touch-icon (180), generada desde la fuente AUTOALOJADA, y
# ningún 404 en la primera carga. Cierra el hallazgo H-2 de la verificación en vivo de F-25.
# Estado: APROBADO por Pablo en la puerta humana (2026-09-30; gherkin_author, 2026-09-30). Entrada 28 de
# `feature_list.json`. Implementación y sabotajes: progress/tdd_favicon_marca.md. Mapa y revisión
# adversarial de este contrato: progress/gherkin_favicon_marca.md.
# =============================================================================================
# FUENTES, EN ORDEN DE MANDO
#   1. `project-spec.md` → «Feature 28» (Contrato 1-4, Decisiones FM-1..FM-7 y FS-1..FS-6, «Cómo se
#      verifica»). MANDA.
#   2. `progress/brief_favicon_marca.md` (§2 decisiones del humano, §4 propuestas del lead, §5 techo,
#      §6 mutación).
#   3. Oráculo de geometría: `docs/research/favicon/aprobado-B.svg`, comparado POR ATRIBUTOS (FS-2).
#      Hoy está SIN VERSIONAR [V: `git status`]: FS-2 obliga a versionar `docs/research/favicon/`; sin
#      él, @s2 nace rojo en cualquier checkout limpio.
#
# =============================================================================================
# DECISIONES DEL HUMANO (Pablo, AskUserQuestion, 2026-09-30, sobre la hoja de candidatos a 16 y 32 px
# reales en pestañas clara y oscura: `docs/research/favicon/candidatos.png`)
# =============================================================================================
#   FM-1 · Diseño «B»: «N» de Great Vibes en --ink (#8E3355) sobre cuadrado redondeado --accent-soft
#          (#F7DDE8); glifo relleno Y trazo del mismo color de 18 unidades con stroke-linejoin="round"
#          (engrosa las líneas finas), margen del 13 % por lado, radio del 20 % del lado. Descartadas: A
#          («N» blanca sobre tinta, la que se recomendaba), C («NL») y D (blanca sobre --accent).
#          CONTRAPARTIDA ACEPTADA A SABIENDAS: en una pestaña clara el borde rosa casi se funde con el
#          blanco; la «N» se lee igual. NO se «arregla» con un borde: sería otro diseño que Pablo no vio.
#   FM-2 · Juego de iconos: SVG + `.ico` de respaldo (16 + 32 px) + `apple-touch-icon` de 180 px.
#   Propuestas del lead que ESTA PUERTA RATIFICA (o no): FM-3 (se declara en `index.html`, no en el
#   <Head> de home.tsx) · FM-4 (en `public/`, nombres fijos) · FM-5 (orden ICO → SVG → Apple, y
#   `sizes="32x32"`, no "any") · FM-6 (ficheros GENERADOS por `tools/favicon/generar.mjs`, Node puro,
#   cero dependencias) · FM-7 (colores contra `_tokens.scss`).
#
# PREGUNTA ABIERTA
#   PA-28-1 · ¿Hay un iPhone real para probar el apple-touch-icon («Añadir a pantalla de inicio»)? Si
#   no, se declara [NV]. Recomendación de la spec: que NO bloquee el `done`: los bytes (180×180, RGB,
#   a sangre, @s6) son lo que pide Apple, y el resto es la máscara del sistema. NO es escenario.
#
# =============================================================================================
# ARTEFACTOS — LISTA CERRADA (brief §5; el tdd_craftsman NO toca nada más)
# =============================================================================================
#   index.html                        TOCA · los tres <link> dentro de <head>. El literal `<head>` (en
#                                     minúsculas y sin atributos) y la ausencia de <title> estático que
#                                     fija F-04 @s33 NO cambian: @s1 extrae justo de ese `<head>`.
#   public/favicon.svg                NUEVO · generado
#   public/favicon.ico                NUEVO · generado
#   public/apple-touch-icon.png       NUEVO · generado
#   tools/favicon/generar.mjs         NUEVO · sin tests ni mutación propios (precedente aplicador.mjs):
#                                     se verifican sus SALIDAS. Sin script en package.json.
#   src/pages/favicon-marca.test.ts   NUEVO · @s1-@s7. NO importa NADA de `src/` (FS-5).
#   src/pages/home-horneado.test.ts   SOLO AÑADIR · @s8, sobre el build de su `beforeAll` EXISTENTE.
#   progress/tdd_favicon_marca.md     el mapa @s → test y los NUEVE sabotajes con su rojo demostrado.
#   (del lead, no del TDD) progress/verificacion_viva_favicon_marca.md · @s9 y @s10.
#
# =============================================================================================
# «VERDE ≠ FUNCIONA» — DÓNDE SE ASEVERA CADA COSA
# =============================================================================================
#   · BYTES (readFileSync + node:zlib; sin render, sin jsdom, sin ejecutar el generador): @s1-@s7 →
#     src/pages/favicon-marca.test.ts. El decodificador PNG se escribe A MANO en el test (profundidad 8,
#     sin entrelazado, filtros 0-4, IDAT concatenados), como el de tools/trazo-marca/aplicador.mjs,
#     pero sin importarlo.
#   · HORNEADO: @s8 → src/pages/home-horneado.test.ts, sobre el `html` y el `dist/` que YA deja su
#     `beforeAll` y con la MISMA extracción de <link> de F-04 @s40 (`elementos('link')` + `valorDe`):
#     PROHIBIDO un build nuevo, un segundo `beforeAll` o un segundo extractor.
#   · EN VIVO (Chromium real sobre el build servido; PROHIBIDO fingirlos en jsdom): @s9 y @s10, que
#     anota el LEAD en progress/verificacion_viva_favicon_marca.md.
#   · `pnpm build` con las cinco puertas en exit 0 lo sigue exigiendo F-10 @s14 en el MISMO
#     `beforeAll`: no se duplica aquí.
#
# =============================================================================================
# ANTI-TAUTOLOGÍA Y PROHIBICIONES
# =============================================================================================
#   ✅ A MANO en el test: "/favicon.ico", "/favicon.svg", "/apple-touch-icon.png", el prefijo
#      "/NailsLashStudioWeb/" (como PREFIJO_DE_ASSETS de @s39), "32x32", "image/svg+xml", "18",
#      "round", las medidas 16/32/180, los tipos de color 6 y 2, las cajas de @s7 y el ancla del
#      oráculo de @s2.
#   ✅ Del ORÁCULO (FS-2): el `d` de la «N» y los atributos de geometría, por atributos.
#   ✅ De `_tokens.scss` (FM-7): los dos colores. ❌ NINGÚN hex escrito a mano en el test.
#   ❌ PROHIBIDO re-rasterizar el SVG en el test o importar el generador (FS-3: sería el generador
#      probándose a sí mismo). ❌ PROHIBIDO importar de `src/` (FS-5). ❌ PROHIBIDO «lo que diga
#      producción» como esperado.
#
# =============================================================================================
# MUTACIÓN: NO APLICA — DECLARADO
# =============================================================================================
#   Nada de lo que toca F-28 está en `mutate` de stryker.config.json [V]: `index.html`, `public/` y
#   `tools/` quedan fuera, y los dos ficheros de test no son código mutable. Se COMPENSA como en F-25
#   E-1/E-2 con SABOTAJES MANUALES DEMOSTRADOS: cada uno se aplica, pone ROJO al menos un test (o un
#   escenario en vivo), se anota y se revierte. Los nueve (spec «Cómo se verifica»):
#     1 quitar un <link> de index.html → @s1, @s8
#     2 escribir la base a mano en un href → @s1
#     3 cambiar un hex del SVG → @s4
#     4 meter un <text> o un href externo en el SVG → @s3
#     5 cambiar el tamaño de una imagen del .ico → @s5
#     6 guardar el apple-touch-icon con canal alfa → @s6
#     7 borrar un fichero de public/ → @s2-@s7 según el fichero, y @s8
#     8 desplazar la N 2 px o más en el raster de 32 o de 180 → @s7
#     9 rasterizar sin trazo → @s10 (y, a 180 px, probablemente @s7 [I])
#   Tabla completa, lo que NO mata ningún sabotaje y los ciegos declarados: progress/gherkin_favicon_marca.md.
#
# =============================================================================================
# TRAZA — contrato, decisiones y casos límite → escenario
# =============================================================================================
#   Contrato 1 (index.html) → @s1 · Contrato 2: SVG → @s2, @s3, @s4; ICO → @s4, @s5, @s7; Apple →
#   @s4, @s6, @s7; paleta → @s4; geometría → @s7 (+ @s10) · Contrato 3 (horneado) → @s8 · Contrato 4
#   (generador) → por sus salidas: @s2-@s7 (+ @s10)
#   FM-1 → @s2, @s4, @s7 · FM-2 → @s1, @s5, @s6 · FM-3 → @s1, @s8 · FM-4 → @s1, @s8 · FM-5 → @s1
#   (+ @s9) · FM-6 → @s3 (cabecera), @s7, @s10 · FM-7 → @s4 · FS-1 → @s1 + @s5 · FS-2 → @s2 · FS-3 →
#   @s7, @s10 · FS-4 → @s4 (un token cambiado exige regenerar) · FS-5 → cabecera · FS-6 → @s3, @s8
#   (cubren las cegueras de F-05: no lee `.svg` y `apple-touch-icon` no es `icon`)
#   Casos límite: 1 (base a `/`) → @s8 se pone rojo JUNTO a F-04 @s39/@s42: cambiar la base los
#   actualiza todos · 2 (`pnpm dev`) → NO es escenario (dev no ejercita el SSG, I-8) · 3 (rutas
#   futuras o un <Head> con otro icono; Helmet no deduplica) → @s8 «EXACTAMENTE 3» · 4 (pestaña clara)
#   → ACEPTADO por Pablo (FM-1), sin escenario · 5 (máscara de iOS) → @s6 (a sangre) + PA-28-1 · 6
#   (caché de favicons) → @s9 con perfil NUEVO
#   FUERA DE ALCANCE, DECLARADO: manifest e iconos PWA 192/512, mask-icon, theme-color, variante oscura
#   del SVG, el /favicon.ico de la RAÍZ DEL ORIGEN de GitHub Pages (sitio de la organización) y los 404
#   AJENOS al icono que salgan en @s9 (se anotan como hallazgo, no se arreglan aquí).
# =============================================================================================

Feature: Favicon de la marca — la «N» de Great Vibes en tinta sobre rosa suave, declarada en index.html como SVG, ICO de respaldo y apple-touch-icon, generada desde la fuente autoalojada y sin ningún 404
  Como visitante quiero reconocer la pestaña del salón por la «N» de su rótulo, y que la primera carga
  no pinte un error en la consola; y como responsable del proyecto quiero que el icono sea del SITIO
  (heredado por toda ruta), que sus colores no puedan derivar de la paleta y que la geometría sea la
  que aprobó Pablo, sin dependencias nuevas ni builds nuevos en los tests.

  # ---------------------------------------------------------------------------------------------
  # BYTES — src/pages/favicon-marca.test.ts. ANCLA POSITIVA SIEMPRE PRIMERO.
  # ---------------------------------------------------------------------------------------------

  @s1
  Scenario: index.html declara dentro de <head>, en este orden, el ICO con sizes="32x32", el SVG con type="image/svg+xml" y el apple-touch-icon — con los href SIN la base
    Given los bytes de "index.html"
    When se extraen, del fragmento entre "<head>" y "</head>", los elementos "<link" cuyo "rel", partido en tokens por espacios y sin distinguir mayúsculas, contiene "icon" o "apple-touch-icon", leyendo sus atributos POR NOMBRE
    Then se extraen EXACTAMENTE 3, y en el fichero ENTERO también EXACTAMENTE 3: ninguno fuera de <head> (ANCLA POSITIVA, antes de juzgar un solo atributo)
    And el 1.º tiene rel "icon", href exactamente "/favicon.ico" y sizes "32x32"
    And el 2.º tiene rel "icon", href exactamente "/favicon.svg" y type "image/svg+xml"
    And el 3.º tiene rel "apple-touch-icon" y href exactamente "/apple-touch-icon.png"
    And ningún href empieza por "/NailsLashStudioWeb/" ni por "//", ni contiene ":": ni la base escrita a mano ni un esquema
    # Por ATRIBUTOS, no por el literal: el orden de los atributos, las comillas y el "/>" que pone
    # Prettier son libres. `rel`, `type` y `sizes` se comparan sin distinguir mayúsculas (valores
    # enumerados de HTML); `href`, exacto. La base vive SOLO en vite.config.ts y Vite la antepone
    # (brief, hecho 1): escribirla aquí la duplicaría y, el día que cambie, divergiría. `sizes="32x32"`
    # y no "16x16 32x32" (FS-1): es pista de selección, no inventario; el inventario lo asevera @s5.
    # Si el `<head>` de index.html dejara de ser ese literal exacto, el fragmento sale vacío y el ancla
    # cae en rojo (y, en el build, la puerta de F-04 también).

  @s2
  Scenario: favicon.svg tiene la MISMA geometría que aprobó Pablo — viewBox, rect, el d de la «N» y el trazo de 18 con unión redonda — comparada por atributos con aprobado-B.svg
    Given los bytes de "public/favicon.svg" y los del oráculo "docs/research/favicon/aprobado-B.svg"
    When se extraen, de cada fichero, sus elementos "<svg", "<rect" y "<path" con sus atributos por nombre
    Then cada uno de los dos ficheros tiene EXACTAMENTE un "<svg", un "<rect" y un "<path" (ANCLA POSITIVA)
    And el oráculo tiene viewBox "-213 -1132 1618 1618"; su rect, x "-213", y "-1132", width "1618", height "1618" y rx "324"; y su d empieza por "M1001 147Q" y termina en "Z" (ANCLA A MANO: el oráculo es el aprobado y nadie lo ha tocado)
    And el viewBox del <svg> de favicon.svg y los atributos x, y, width, height y rx de su <rect> son IDÉNTICOS, como cadena, a los del oráculo
    And el atributo d del <path> de favicon.svg es IDÉNTICO, como cadena, al del oráculo
    And el <path> de favicon.svg lleva stroke-width "18" y stroke-linejoin "round"
    # FS-2: se separa la GEOMETRÍA (lo que aprobó Pablo, del oráculo) del COLOR (lo que dicta el
    # token, @s4), y se admite la cabecera de @s3; por eso no es byte a byte. El `d` NO se escribe a
    # mano en el test (FS-2); el ancla solo fija su principio y su fin. Lado 1618, margen 13 % y radio
    # 20 % (rx = round(0,2 · 1618) = 324) son los de FM-1. Para que el `d` salga idéntico, generar.mjs
    # tiene que formatear los números como prototipo-glifos.mjs (p. ej. "890.5"): si no, rojo, y es
    # lo que se quiere.

  @s3
  Scenario: favicon.svg es AUTOCONTENIDO — sin texto, imágenes, referencias, estilos ni scripts, y el único "http" es el del xmlns — y declara que es generado
    Given los bytes de "public/favicon.svg"
    When se buscan en ellos, sin distinguir mayúsculas, los literales vigilados
    Then contiene 'xmlns="http://www.w3.org/2000/svg"' y "<path" (ANCLA POSITIVA: se leyó un SVG de verdad)
    And contiene 0 veces cada uno de "<text", "<image", "<use", "<style", "<script" y "<foreignObject"
    And contiene 0 veces "href" (ni href ni xlink:href), 0 veces "url(" y 0 veces "@import"
    And contiene EXACTAMENTE 1 vez "http", y es la del xmlns
    And ANTES de la primera "<svg" hay un comentario "<!--" … "-->" que contiene "tools/favicon/generar.mjs" y "no se edita a mano"
    # Nadie más lo mira: la puerta de F-05 solo lee `.html` y `.css` de dist/ [V: ES_HTML_O_CSS] (FS-6).
    # Un <text> no sirve: un SVG usado como imagen no carga fuentes web [NV] y la «N» saldría en la
    # fuente del sistema; de ahí el contorno. El comentario no puede contener "href", "http" ni "<svg".

  @s4
  Scenario: Los colores salen de _tokens.scss — el SVG pinta --accent-soft y --ink, y todo píxel visible de los tres raster es mezcla de esos dos
    Given los bytes de "src/styles/_tokens.scss" y de "public/favicon.svg", y los píxeles decodificados de los PNG de 16×16 y 32×32 de "public/favicon.ico" y del de "public/apple-touch-icon.png"
    When se leen de _tokens.scss los hex de "--accent-soft" y de "--ink" y se comparan con los colores del SVG y con cada píxel de los tres raster
    Then _tokens.scss declara EXACTAMENTE una vez "--accent-soft:" y EXACTAMENTE una vez "--ink:", cada una con un hex "#RRGGBB", y los dos hex son DISTINTOS (ANCLA POSITIVA; ningún hex se escribe a mano en el test, FM-7)
    And el fill del <rect> de favicon.svg es el hex de --accent-soft, y el fill y el stroke de su <path> son el de --ink, sin distinguir mayúsculas
    And cada raster decodificado tiene exactamente ancho × alto píxeles (256, 1 024 y 32 400), al menos uno a ±2 por canal de --accent-soft con alfa 255 y al menos uno «de tinta» —su RGB más cerca, en distancia euclídea, de --ink que de --accent-soft— (ANCLA POSITIVA contra la paleta vacía)
    And en los tres raster, todo píxel con alfa > 0 tiene un RGB a ±2 por canal, como mucho, de soft + t·(ink − soft), con t la proyección de ese RGB sobre el segmento soft → ink recortada a [0, 1]
    # FM-7 y FS-4: si alguien cambia un token, esto se pone rojo hasta regenerar (el generador lee los
    # mismos tokens). En el ICO el alfa es RECTO (PNG): un borde semitransparente conserva el RGB de
    # --accent-soft; un RGB premultiplicado u oscurecido contra negro cae aquí. Sin el ancla, un raster
    # todo transparente pasaría el último `Then` en vacío.

  @s5
  Scenario: favicon.ico es un ICO de EXACTAMENTE dos PNG RGBA, 16×16 y 32×32, completos y dentro del fichero, con las cuatro esquinas transparentes y el borde superior rosa opaco
    Given los bytes de "public/favicon.ico" y el hex de --accent-soft leído de "src/styles/_tokens.scss" como en @s4
    When se leen su cabecera, sus entradas de directorio y los bytes del PNG al que apunta cada entrada
    Then la cabecera tiene reservado 0, tipo 1 y EXACTAMENTE 2 entradas (ANCLA POSITIVA del inventario)
    And las medidas declaradas en las entradas son una de 16×16 y otra de 32×32
    And en cada entrada, desplazamiento + tamaño ≤ la longitud del fichero
    And los bytes de cada entrada empiezan por la firma PNG (89 50 4E 47 0D 0A 1A 0A); su primer trozo es IHDR con el ancho y el alto de SU entrada, profundidad 8, tipo de color 6 (RGBA) y sin entrelazado; y su último trozo es IEND y acaba EXACTAMENTE en desplazamiento + tamaño
    And en cada PNG, el píxel central del borde superior (fila 0; columna 8 a 16 px y 16 a 32 px) tiene alfa 255 y su RGB a ±2 por canal de --accent-soft (ANCLA POSITIVA de la lectura de píxeles: un decodificado todo a cero pasaría las esquinas en vacío)
    And en cada PNG, los cuatro píxeles de las esquinas tienen alfa ≤ 25
    # PNG dentro de ICO (brief FM-6.3). FS-1: `sizes="32x32"` en el <link>, pero el inventario lleva
    # los dos. «Profundidad 8, sin entrelazado» concreta lo que el decodificador a mano del test lee;
    # es lo que escribe el precedente aplicador.mjs. Esquinas: radio del 20 % (3,2 px a 16 px); la
    # esquina de 16 px apenas se roza (alfa ≈ 2 [I: cálculo del área]).

  @s6
  Scenario: apple-touch-icon.png es un PNG de 180×180, RGB SIN alfa y a sangre — sus cuatro esquinas son --accent-soft exacto
    Given los bytes de "public/apple-touch-icon.png" y el hex de --accent-soft leído de "src/styles/_tokens.scss" como en @s4
    When se leen sus trozos y se decodifican sus píxeles
    Then empieza por la firma PNG, su primer trozo es IHDR y su último es IEND, que acaba en el último byte del fichero (ANCLA POSITIVA: un PNG completo)
    And su IHDR declara 180 de ancho, 180 de alto, profundidad 8, tipo de color 2 (RGB, sin canal alfa) y sin entrelazado
    And no contiene ningún trozo "tRNS"
    And los píxeles (0, 0), (179, 0), (0, 179) y (179, 179) tienen EXACTAMENTE el RGB de --accent-soft
    # iOS aplica su propia máscara (~22 % de radio) y pinta de NEGRO lo transparente: por eso a sangre,
    # sin esquinas redondeadas y sin alfa (brief FM-6.4). Un "tRNS" en un PNG de tipo 2 declara un
    # color transparente: sería alfa por la puerta de atrás. Lo que no ven los bytes (la máscara real)
    # es PA-28-1.

  @s7
  Scenario Outline: La «N» está donde la aprobó Pablo — la caja de los píxeles de tinta del raster de <lado> px cae a ±1 px de la del glifo engrosado con medio trazo
    Given los píxeles decodificados <raster> y los hex de --accent-soft y --ink leídos de "src/styles/_tokens.scss"
    When se toman sus píxeles «de tinta» (alfa > 0 y RGB más cerca, en distancia euclídea, de --ink que de --accent-soft) y su caja en coordenadas de BORDE de píxel: izquierda = columna mínima, derecha = columna máxima + 1, arriba = fila mínima, abajo = fila máxima + 1
    Then hay AL MENOS un píxel de tinta (ANCLA POSITIVA: sin él no hay caja que comparar)
    And |izquierda − <x0>| ≤ 1, |derecha − <x1>| ≤ 1, |arriba − <y0>| ≤ 1 y |abajo − <y1>| ≤ 1

    Examples:
      | lado | raster                                   | x0    | x1     | y0    | y1     |
      | 32   | del PNG de 32×32 de "public/favicon.ico" | 3.98  | 28.00  | 6.49  | 25.49  |
      | 180  | de "public/apple-touch-icon.png"         | 22.36 | 157.53 | 36.49 | 143.40 |

    # Esperados A MANO, de la spec [V: cálculo sobre aprobado-B.svg]: caja de tinta del glifo
    # (−3, −795)–(1194, 148) ± 9 (medio trazo) en un lado de 1618 → x 12,42-87,52 %, y 20,27-79,67 %.
    # La convención de BORDE es obligatoria: con centros de píxel (mínimo + 0,5) la fila de arriba a
    # 32 px se sale 0,01 [I: sonda propia, ver progress/gherkin_favicon_marca.md]. Con bordes, la
    # sonda da 4-28 × 7-25 (32 px) y 22-157 × 37-143 (180 px): holgura ≈ 0,5 px por lado. A 16 px NO
    # hay caja (con el antialias no es fiable): allí solo paleta (@s4) y transparencia (@s5). La caja
    # fija posición y escala pero NO ve el trazo a 32 px (misma caja con y sin él [I: sonda]): eso es
    # @s10 (FS-3). Un desplazamiento de 1 px cabe en la tolerancia: el sabotaje 8 es de 2 px o más.

  # ---------------------------------------------------------------------------------------------
  # HORNEADO — src/pages/home-horneado.test.ts, sobre el build de su `beforeAll` EXISTENTE.
  # ---------------------------------------------------------------------------------------------

  @s8
  Scenario: Tras el pnpm build REAL, dist/index.html declara los tres iconos con la base /NailsLashStudioWeb/, uno por fila y en el mismo orden, y cada href sirve los MISMOS bytes que su gemelo de public/
    Given el "dist/" que deja el "pnpm build" REAL que YA lanza el beforeAll de "src/pages/home-horneado.test.ts" (NINGÚN build ni beforeAll nuevo)
    When se extraen de "dist/index.html", con la MISMA extracción de "<link" de F-04 @s40, los "<link" cuyo "rel", partido en tokens y sin distinguir mayúsculas, contiene "icon" o "apple-touch-icon"
    Then hay EXACTAMENTE 3 (ANCLA POSITIVA; y uno por fila: una ruta o un <Head> que añadiera otro icono lo pone rojo)
    And en orden de documento: rel "icon" con href exactamente "/NailsLashStudioWeb/favicon.ico" y sizes "32x32"; rel "icon" con href exactamente "/NailsLashStudioWeb/favicon.svg" y type "image/svg+xml"; rel "apple-touch-icon" con href exactamente "/NailsLashStudioWeb/apple-touch-icon.png"
    And para cada uno de esos tres href, quitado el prefijo "/NailsLashStudioWeb/", el fichero de "dist/" con ese nombre existe, pesa más de 0 bytes y es byte a byte IGUAL a su gemelo de "public/"
    # Hueco del brief: el hecho 1 se midió con `vite build`; el build real es `vite-react-ssg build`
    # (jsdom + onPageRendered) [V: package.json]: ESTE escenario es la prueba en el pipeline de verdad.
    # El prefijo va a mano (como PREFIJO_DE_ASSETS de @s39): si la base pasa a `/` (caso límite 1), se
    # pone rojo JUNTO a F-04 @s39/@s42, y es lo correcto. El fichero sigue SIN importar nada de `src/`.
    # CONVIVENCIA [V]: F-04 @s40/@s41 filtran rel="preload" (los iconos no lo son) y `horneado.ts` solo
    # retira precargas de imagen o de fuente; F-05 cuenta rel="icon" como petición y la ruta
    # root-absoluta propia pasa; F-10 @s12/@s14 y F-14 @s6 leen el JSON-LD y el exit 0 del MISMO build,
    # que debe seguir en 0 con los iconos (F-01 lee también los binarios de dist/: un choque saldría ahí).

  # ---------------------------------------------------------------------------------------------
  # EN VIVO — Chromium real sobre el build servido; los anota el LEAD en
  # progress/verificacion_viva_favicon_marca.md. NUNCA jsdom.
  # ---------------------------------------------------------------------------------------------

  @s9 @verificacion-viva
  Scenario: [EN VIVO, Chromium real, NO jsdom] la primera carga del build servido en /NailsLashStudioWeb/ no deja ningún 404, pide el SVG y no el /favicon.ico de la raíz, y la pestaña muestra la «N»; sin los <link>, el 404 vuelve
    Given "pnpm build" en exit 0 y dos sitios servidos igual bajo "/NailsLashStudioWeb/": el "dist/" real y una CONTRAPRUEBA, copia de "dist/" fuera del repo con los tres <link> de icono quitados de su index.html
    And un Chromium CON ventana y un perfil NUEVO para cada sitio (sin caché de favicons), con la red y la consola registradas desde antes de navegar
    When se abre "/NailsLashStudioWeb/" de cada sitio y se espera a que la carga termine y la red quede en reposo
    Then con el dist/ real, hay una petición a "/NailsLashStudioWeb/favicon.svg" con respuesta 200 (ANCLA POSITIVA: el navegador SÍ pidió un icono; sin ella, «cero 404» sería vacuo)
    And con el dist/ real, ninguna respuesta de la red es 404, la consola no tiene ningún "Failed to load resource" con "404" y no hay ninguna petición a "/favicon.ico" de la RAÍZ del origen
    And con el dist/ real, una captura de la pestaña, archivada junto a la anotación, muestra la «N» tinta sobre el cuadrado rosa
    And con la CONTRAPRUEBA, sí hay una petición a "/favicon.ico" de la raíz con respuesta 404, y la consola muestra su "Failed to load resource" (el ROJO de este escenario, demostrado)
    # FM-5 se MIDE aquí [NV hasta hoy]: si Chrome pide el ICO en vez del SVG (o además), es HALLAZGO
    # para la puerta, NO un cambio de `sizes` a ciegas. «Con ventana»: la captura de la pestaña lo
    # exige, y un Chromium sin ventana puede no pedir favicons [NV]: el ancla lo delata. Si `vite
    # preview` no devuelve 404 fuera de la base [I, se mide], los dos sitios se sirven con un servidor
    # estático que monte dist/ bajo /NailsLashStudioWeb/ y dé 404 al resto, como GitHub Pages, y se
    # anota. Un 404 AJENO al icono se anota como hallazgo y no se arregla aquí (lista cerrada). Tras
    # publicar se repite sobre GitHub Pages, donde nació el H-2 (no es escenario).

  @s10 @verificacion-viva
  Scenario: [EN VIVO, Chromium real, NO jsdom] los raster reproducen la «N» CON su trazo — su cobertura de tinta no se aparta más de un 10 % de la de Chromium dibujando favicon.svg al mismo tamaño
    Given Chromium real dibujando "public/favicon.svg" en un canvas transparente de 16×16, 32×32 y 180×180, una copia de ese SVG SIN los atributos stroke, stroke-width y stroke-linejoin dibujada igual, y los raster de 16 y 32 de "public/favicon.ico" y el de "public/apple-touch-icon.png" decodificados
    When se calcula en cada imagen su cobertura de tinta C = Σ t·α/255, con t la proyección del RGB del píxel sobre el segmento --accent-soft → --ink (de _tokens.scss) recortada a [0, 1]
    Then CALIBRACIÓN (ANCLA POSITIVA: Chromium SÍ dibujó y la medida VE el trazo): a 16, 32 y 180 px, la C de Chromium CON trazo es > 0 y la C de Chromium SIN trazo es ≤ 80 % de ella
    And a 16, 32 y 180 px, |C del raster − C de Chromium con trazo| ≤ 10 % de la C de Chromium con trazo
    And las nueve C y los seis cocientes se anotan en progress/verificacion_viva_favicon_marca.md
    # FS-3: la identidad SVG↔raster es por construcción; esta es la única medida que ve el trazo de 18
    # (brief, hecho 4: sin él la «N» queda floja a 16 px). «Claramente más del 10 %» (spec) se concreta
    # en ≤ 80 %: una separación de al menos el DOBLE del umbral. La sonda de esta redacción da ≈ 72 % a
    # 16, 32 y 180 px [I: no es Chromium]. SI LA CALIBRACIÓN FALLA a algún tamaño, V2 pasa a ser una
    # ampliación ×6 de cada raster junto a la de Chromium, lado a lado, que JUZGA Pablo, y se anota así.
    # C es invariante a la posición: un desplazamiento de la «N» es cosa de @s7, no de este escenario.
