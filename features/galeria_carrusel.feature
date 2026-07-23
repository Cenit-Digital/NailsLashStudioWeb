# =============================================================================================
# Contrato de `galeria_carrusel` — v2.1 = v2 (reescritura completa del borrador, que solo tenía
# @s1 sobre la POSICIÓN del bloque) + ENMIENDA 1 (2026-07-23, ordenada por el lead a la salida
# del review del `judge` y de la auditoría a11y): @s19 NUEVO (se CABLEA el arrastre táctil,
# hallazgo 7 del judge), @s12 ampliado (la preferencia de movimiento se escucha EN CALIENTE,
# aviso 🔵 eje 5), @s15 ampliado (la tarjeta oculta no captura clics, aviso 🔵 eje 6) y @s17
# ampliado (diana de 24 px, aviso 🟡 SC 2.5.8). Los Then previos de @s1..@s18 NO cambian.
#
# FUENTE DE VERDAD ÚNICA: `progress/galeria_coverflow_diseno.md` (brief del craftsman_lead,
# síntesis de cuatro reconocimientos: spec CSS 3D del W3C, APG + WCAG 2.2, auditoría de las cinco
# puertas del repo, y arte previo de Swiper). Este fichero NO lo amplía ni lo contradice.
# Otras fuentes LEÍDAS: `src/components/galeria.test.tsx` (los 7 tests vivos, cuyo contrato NO
# cambia), `src/components/Galeria.tsx`, `src/components/galeria.module.scss`, `docs/gherkin.md`,
# `features/hero.feature` y `features/equipo_reservas.feature` (estilo).
# Fuentes de la ENMIENDA 1: `progress/judge_galeria_carrusel.md` (hallazgo 7: `pasosDelArrastre`
# exportada y testeada pero SIN llamar) y `progress/a11y_galeria_carrusel.md` (avisos 🟡 y 🔵).
#
# QUÉ SE CONSTRUYE: la galería «Nuestros trabajos» deja de ser un carril `scroll-snap` y pasa a ser
# un CARRUSEL COVERFLOW 3D EN DOMO (la central se ELEVA, las laterales CAEN, giran hacia dentro,
# encogen y se apagan), con bucle infinito por el camino corto, autoplay de 4 s y control de
# pausa/reanudación persistente.
#
# ---------------------------------------------------------------------------------------------
# TECHO: 19 escenarios (@s1..@s19). Los 18 originales los impuso el lead; el @s19 lo añade la
# ENMIENDA 1 por orden del propio lead (no es ampliación unilateral). Este repo tiene historia de
# contratos sobredimensionados que convierten un cambio de una tarde en dos días. No se amplía
# sin humano.
# ---------------------------------------------------------------------------------------------
#
# LAS DOS CONVENCIONES QUE EL `judge` NECESITA SABER DE ANTEMANO
# ---------------------------------------------------------------------------------------------
#   1. EL EMPATE CON n PAR (=6). La foto OPUESTA está a tres pasos por los dos lados. La convención
#      elegida es el comparador ESTRICTO `>` (`d > n/2` corrige), que produce el rango [-2, +3]: la
#      opuesta entra por la DERECHA, con distancia +3. Con `>=` el rango sería [-3, +2] y entraría
#      por la izquierda. Se elige `>` por coherencia con un autoplay que avanza +1. Un test que
#      espere -3 está mal escrito, no el código. Lo fijan @s3 y @s5.
#   2. EL FOCO NO REANUDA. El APG se contradice consigo mismo (el patrón y su ejemplo 2 dicen que
#      no; el ejemplo 1 y el código de sus dos implementaciones dicen que sí). Se toma la lectura
#      CONSERVADORA (2 fuentes contra 1, y es el escenario que SC 2.2.2 castiga): el ratón reanuda
#      al salir, el foco de teclado NO — solo el botón devuelve la rotación. Lo fija @s10.
#
# LEYENDA DE ATRIBUCIÓN (este repo castiga la atribución normativa falsa)
# ---------------------------------------------------------------------------------------------
#   (N) letra de una norma  ·  (T) técnica suficiente / implementación de referencia (APG)  ·
#   (P) criterio de proyecto. Cada escenario dice de cuál vive. En particular:
#     · El control de pausa persistente y visible es (N) SC 2.2.2 (A, y de No-Interferencia).
#     · «El control va primero en el orden de tabulación» es (T) del APG, NO la letra de SC 2.4.3.
#     · «Arranca pausado bajo prefers-reduced-motion» es (T) del APG + (P) del repo, y NO es la
#       letra de ningún SC A/AA: 2.2.2 exige UN MECANISMO, no honrar la preferencia del SO.
#     · SC 2.3.3 (Animation from Interactions) es AAA y NO cubre el autoplay: prohibido citarlo
#       como obligación AA.
#
# REGLAS DE REDACCIÓN Y DE TEST (duras)
# ---------------------------------------------------------------------------------------------
#   · PROHIBIDO aseverar por clase CSS o con `toHaveClass`. Con `css: false` (`vitest.config.ts:17`)
#     `estilos.x` es `undefined`: las dos ramas de un `className` condicional producen el MISMO DOM
#     y el mutante que invierte la condición es INMATABLE. Se asevera por ROL, NOMBRE ACCESIBLE,
#     TEXTO, `data-*` o `style` inline. Es la razón de ser de `galeria-logica.ts`.
#   · Los escenarios del SCSS (@s13, @s14, @s15) se aseveran leyendo los BYTES de
#     `src/components/galeria.module.scss` (patrón `hero-estilos.test.ts`): Stryker no ve SCSS.
#   · PROHIBIDO crear ningún `galeria-horneado.test.*`. Ya hay 3 tests build-based que lanzan 7
#     builds reales por corrida. Lo horneado se cubre con `renderToString`.
#   · ANTI-TAUTOLOGÍA: los seis alt, los seis ficheros, la nota, las etiquetas ARIA y los valores de
#     la tabla de @s5 se escriben A MANO en el test. Prohibido importar constantes de producción
#     como valor esperado.
#   · Trampas MEDIDAS del entorno: jsdom 25 no implementa `matchMedia` (stub con `vi.stubGlobal`,
#     precedente `reserva.test.tsx:52,539`) ni la CLASE `PointerEvent` — pero React registra los
#     pointer events por NOMBRE, así que en el test se despacha
#     `el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: N }))` y el handler
#     recibe su `clientX` con normalidad (@s19); `setInterval` NO devuelve `number` con
#     `@types/node` cargado (`useRef<ReturnType<typeof setInterval> | null>`).
#
# LO QUE ESTE CONTRATO NO HACE (deuda declarada, brief §12)
# ---------------------------------------------------------------------------------------------
#   · NO mueve la galería antes de `#reserva` (hoy va después por decisión explícita de Pablo).
#     El @s1 del borrador anterior pedía eso: se RETIRA, no se «arregla» por cuenta propia.
#   · NO cambia `loading="lazy"` (lo exige `galeria.test.tsx:60`).
#   · NO añade la galería a la nav ni la convierte en sección navegable: rompería dos puertas.
#   · [ENMIENDA 1] El ARRASTRE con el dedo YA NO está excluido: su cableado lo exige @s19 (la
#     decisión sigue en `pasosDelArrastre`, ya testeada por valor). Para la verificación EN VIVO en
#     Chrome solo queda el GESTO FÍSICO (dedo real), que ningún test de jsdom puede fingir.
# =============================================================================================

Feature: La galería «Nuestros trabajos» como carrusel coverflow 3D en domo, con bucle infinito por el camino corto, autoplay de 4 segundos y control de pausa persistente
  Como visitante quiero ver los trabajos del salón en un carrusel con relieve, que avance solo y que
  pueda parar cuando quiera; y como responsable del proyecto quiero que las seis fotos, la nota de
  honestidad y las cinco puertas del build sigan exactamente como están, que el bucle no deje huecos
  vacíos y que quien navegue con teclado o con lector de pantalla no se quede fuera.

  # -------------------------------------------------------------------------------------------
  # LO QUE NO PUEDE ROMPERSE. Dos escenarios de regresión, ni uno más.
  # -------------------------------------------------------------------------------------------

  @s1
  Scenario: Las seis fotos siguen horneadas, con su alt, su orden y sus dimensiones, y el carrusel NO clona diapositivas
    Given la galería renderizada por SSR, sin ejecutar JavaScript
    When se leen las etiquetas "<img" del HTML horneado, en orden de aparición
    Then hay EXACTAMENTE SEIS, ni una más: el bucle infinito se consigue con la aritmética circular, NUNCA duplicando diapositivas
    And sus seis alt son, en este orden: "Manicura rosa empolvado con topos dorados", "Manicura en rosa nude junto a dos esmaltes", "Manicura francesa de uña larga", "Manicura nude con detalle minimalista", "Manicura clásica en rojo" y "Uñas en coral con lazo en relieve"
    And sus seis src contienen, en ese mismo orden, los ficheros "galeria-rosa-dorado", "galeria-esmaltes-rosa", "galeria-manicura-francesa", "galeria-nude-minimalista", "galeria-rojo-clasico" y "galeria-coral-lazo"
    And las seis declaran width="800", height="600" y loading="lazy"
    And ningún src apunta a un origen externo y en el horneado no aparece el literal "ph-woman"
    # Los 7 tests de `galeria.test.tsx` se CONSERVAN INTACTOS: este escenario es su enunciado, no su
    # sustituto. La técnica del clon (Swiper `loopedSlides`) es la primera que se le ocurre a quien
    # implementa un bucle: aquí MATA la suite entera, porque `getByRole('img', { name })` es singular.
    # `loading="lazy"` se conserva aunque en un coverflow casi todas las fotos estén en viewport: es
    # una decisión ya tomada y su mejora es deuda declarada, no parte de este encargo.

  @s2
  Scenario: La galería sigue sin tocar ninguna de las cinco puertas del build
    Given la home renderizada por SSR, sin ejecutar JavaScript
    When se inspecciona el bloque de la galería en el HTML horneado
    Then su elemento raíz sigue siendo un "<div>" y NO un "<section>"
    And la galería no aporta ningún "<h1>": la home sigue teniendo EXACTAMENTE UNO, el del hero
    And la galería aporta exactamente UN "<h2>", cuyo texto es exactamente "Nuestros trabajos"
    And los puntos indicadores NO son "<a href='#…'>" y no viven dentro de ninguna "<nav>": son "<button type='button'>"
    And se muestra la nota exactamente "Galería de muestra · fotos de banco de imágenes, las fotos reales del salón se añaden antes de publicar."
    And existe EXACTAMENTE UN botón cuyo nombre accesible es "Anterior" y EXACTAMENTE UNO cuyo nombre accesible es "Siguiente"
    And la galería sigue viviendo dentro de "<main>"
    # [CRITICO] Convertirlo en `<section aria-labelledby>` rompe DOS puertas a la vez: pasaría a ser
    # «sección navegable» (`puerta-cascaron.ts:505-520`) y la nav no la enlaza, luego
    # `REGLA_INALCANZABLE` (`puerta-anclas.ts:132-142`). Usar `<nav>` o `<a href="#…">` para los
    # puntos los mete en la puerta de anclas como anclas de navegación (`puerta-anclas.ts:34,46-60`).
    # La nota se compara CARÁCTER A CARÁCTER, con su «·» y sus acentos (`galeria.test.tsx:78-84`).
    # Que la galería siga dentro de `<main>` lo vigila `boton-whatsapp-montaje.test.tsx:50-63`.

  # -------------------------------------------------------------------------------------------
  # LA ARITMÉTICA DEL BUCLE. Aquí es donde muerde Stryker: es lo único que puede morder.
  # -------------------------------------------------------------------------------------------

  @s3
  Scenario Outline: La distancia a la foto centrada va CON SIGNO y por el camino corto, y el empate se resuelve por la derecha
    Given la galería de SEIS fotos con la TERCERA centrada
    When se calcula la distancia circular de la foto "<foto>"
    Then vale exactamente "<distancia>"
    And exactamente UNA de las seis fotos tiene distancia 0
    And ninguna de las seis tiene distancia "-3": con n par el rango es [-2, +3] y el "-3" NO EXISTE

    Examples:
      | foto | distancia | qué fija                                                              |
      | 1ª   | -2        | dos pasos por la IZQUIERDA: el signo dice el lado                     |
      | 2ª   | -1        | la vecina izquierda                                                   |
      | 3ª   | 0         | la centrada, y es la única a distancia 0                              |
      | 4ª   | +1        | la vecina derecha                                                     |
      | 5ª   | +2        | dos pasos por la derecha                                              |
      | 6ª   | +3        | EL EMPATE: tres pasos por los dos lados; la convención `>` la manda a la DERECHA |

    # [CRITICO] `distanciaCircular` es la función con más mutantes vivos potenciales del componente
    # (`%`, `+`, `-`, `>`, `/`). El empate NO es un detalle estético: con `>=` en vez de `>` la sexta
    # foto saldría por la IZQUIERDA (-3) y el arco entero se dibujaría al revés en cada vuelta.
    # ANTI-TAUTOLOGÍA: las seis distancias van escritas A MANO; jamás re-ejecutando la función.

  @s4
  Scenario: Retroceder desde una foto posterior NO produce una distancia fuera de rango (el doble módulo)
    Given la galería de SEIS fotos con la QUINTA centrada
    When se calcula la distancia circular de la PRIMERA foto
    Then vale exactamente "+2", porque el camino corto va por la derecha
    And ninguna de las seis distancias cae fuera del rango [-2, +3]
    And avanzar seis posiciones desde cualquier foto devuelve exactamente a esa misma foto, y retroceder seis también
    # [CRITICO] EL ESCENARIO QUE CAZA EL MUTANTE MÁS CARO. En JavaScript `%` es RESTO y conserva el
    # signo del DIVIDENDO. MEDIDO: `(-4) % 6 === -4`, mientras `(((-4) % 6) + 6) % 6 === 2`. Con un
    # solo módulo esta distancia sale -4: cae fuera de [-2, +3], no casa con ninguna clave de
    # `data-distancia` y la primera foto DESAPARECE del arco, sin error en consola. El doble módulo
    # existe SOLO para el caso `indice < activo`, y ESTE escenario es el único que lo defiende: sin
    # él el carrusel «funciona» hacia delante y está roto en cuanto la foto activa pasa de la cuarta.

  @s5
  Scenario Outline: Cada tarjeta publica su posición en atributos CONSULTABLES, nunca en una clase
    Given la galería recién montada, con la PRIMERA foto centrada
    When se inspeccionan las seis tarjetas en orden del DOM
    Then la tarjeta de la foto "<foto>" expone data-distancia="<data-distancia>"
    And su atributo style declara la variable "--s" con el valor "<--s>"
    And su z-index inline es MAYOR QUE CERO
    And EXACTAMENTE UNA de las seis tarjetas expone data-distancia="0"
    And el z-index decrece ESTRICTAMENTE al crecer la distancia (capa 0 > capa 1 > capa 2 > capa 3) y las dos tarjetas que comparten distancia comparten capa

    Examples:
      | foto | data-distancia | --s | qué fija                                            |
      | 1ª   | 0              | 0   | la centrada: signo 0, y la lista de transform completa igual |
      | 2ª   | 1              | 1   | vecina derecha                                      |
      | 3ª   | 2              | 1   | derecha lejana                                      |
      | 4ª   | 3              | 1   | la OCULTA, que entra por la derecha (el empate de @s3) |
      | 5ª   | 2              | -1  | izquierda lejana: misma clave que la 3ª, signo opuesto |
      | 6ª   | 1              | -1  | vecina izquierda                                    |

    # Este es el PUENTE entre TypeScript y SCSS, y el escenario que caza al mutante «se olvidó de
    # escribir --s» (invisible para @s3, que solo mira la función pura). MEDIDO en los dos entornos
    # que importan: `renderToString` emite `style="--s:1"` y jsdom devuelve
    # `el.style.getPropertyValue('--s') === "1"`. Precedente de `style` inline: `PruebaColor.tsx:35,52`.
    # Precedente de `data-*`: `Reserva.tsx:136`. La CLAVE `data-distancia` usa el VALOR ABSOLUTO (la
    # caída del domo es una función PAR de la distancia) y el signo viaja aparte en `--s`.
    # [CRITICO] «Mayor que cero» es un Then y no un comentario: un z-index NEGATIVO pinta la tarjeta
    # POR DETRÁS del fondo del contenedor y la hace desaparecer. Es un gotcha real de Swiper, que
    # genera -1 y -2.

  # -------------------------------------------------------------------------------------------
  # EL ÁRBOL DE ACCESIBILIDAD. Variante «Grouped» del APG. El DOM jamás se reordena.
  # -------------------------------------------------------------------------------------------

  @s6
  Scenario: El carrusel se anuncia como carrusel, y sus seis diapositivas NUNCA se ocultan
    Given la galería renderizada
    When se consulta el árbol de accesibilidad
    Then el contenedor del carrusel expone role="group", aria-roledescription="carrusel" y aria-labelledby apuntando al "<h2>" cuyo texto es "Nuestros trabajos"
    And NO expone role="region": el bloque es NO NAVEGABLE por decisión ya vigente
    And su nombre accesible es exactamente "Nuestros trabajos", sin la palabra "carrusel" (esa la aporta aria-roledescription)
    And hay exactamente SEIS diapositivas, cada una con role="group" y aria-roledescription="diapositiva"
    And sus nombres accesibles son, en orden del DOM, "1 de 6", "2 de 6", "3 de 6", "4 de 6", "5 de 6" y "6 de 6"
    And NINGUNA diapositiva expone aria-hidden, ni siquiera la que está a distancia 3 y no se ve
    And el orden del DOM de las seis es SIEMPRE 1..6, cualquiera que sea la foto centrada
    And los botones "Anterior" y "Siguiente" apuntan con aria-controls al contenedor de diapositivas, que tiene id="galeria-pista"
    # (T) APG, variante Grouped. (N) ARIA para el `aria-hidden`: quien oculta contenido VISIBLE «MUST
    # ensure that identical or equivalent meaning and functionality is exposed», y aquí no lo está en
    # ningún otro sitio (una foto al 38 % se ve). El propio APG avisa: «the screen reader experience
    # can be confusing and disorienting if slides that are not visible on screen are incorrectly
    # hidden». Y un `aria-label="3 de 6"` sobre un árbol donde solo existe una foto es una
    # contradicción activa. Efecto colateral verificable: `aria-hidden` rompería `galeria.test.tsx:32-38`
    # (las seis `<img>` por rol). La decisión correcta por accesibilidad es también la que no rompe la
    # suite. El nombre de la diapositiva NO repite el `alt`: lo aporta la `<img>` hija y duplicarlo lo
    # haría sonar dos veces. Que el DOM no se reordene es lo que sostiene (N) SC 2.4.3 Focus Order.

  @s7
  Scenario Outline: La voz de la pista se calla mientras rota sola y habla cuando manda el usuario
    Given el contenedor de diapositivas del carrusel
    When el carrusel está rotando "<rotando>" y con el foco de teclado dentro "<foco>"
    Then ese contenedor expone aria-live="<aria-live>"
    And expone aria-atomic="false"

    Examples:
      | rotando | foco | aria-live | por qué                                                            |
      | sí      | no   | off       | la rotación es automática: anunciar cada cambio interrumpiría al usuario |
      | no      | no   | polite    | parado: los cambios los provoca el usuario y SÍ deben anunciarse    |
      | sí      | sí   | polite    | con el foco dentro el usuario está navegando y debe oír lo que cambia |
      | no      | sí   | polite    | cierra la tabla de verdad                                           |

    # (T) APG. La tercera fila es DEFENSIVA (con el foco dentro la rotación ya está parada por @s10)
    # pero fija el contrato completo de la función y mata al mutante que convierte `rotando && !foco`
    # en `rotando` a secas; la segunda mata al que lo convierte en `!foco`. `aria-atomic="false"` está
    # en la prosa del patrón APG pero AUSENTE del HTML de sus dos ejemplos (verificado): se pone
    # porque es inocuo y blinda contra un ancestro que lo ponga a `true`.

  @s8
  Scenario: El control de rotación es el PRIMER tabulable, su nombre CAMBIA y nunca lleva aria-pressed
    Given el carrusel rotando, cuyo control de rotación tiene el nombre accesible exactamente "Parar la reproducción automática"
    When se pulsa ese control
    Then su nombre accesible pasa a ser exactamente "Iniciar la reproducción automática"
    And en NINGUNO de los dos estados expone el atributo aria-pressed
    And expone data-estado="rotando" antes de pulsarlo y data-estado="pausado" después
    And avanzar el reloj 12000 milisegundos NO cambia la foto centrada, ni aunque el puntero salga del carrusel: la parada pedida por el usuario es DEFINITIVA
    And el control es el PRIMER elemento tabulable dentro del carrusel, por delante de "Anterior" y de "Siguiente"
    And está siempre presente y visible: no aparece solo al pasar el ratón ni al enfocar
    And ningún elemento enfocable vive dentro de las tarjetas: los NUEVE controles (rotación, Anterior, Siguiente y los seis puntos) están FUERA del contenedor con perspectiva
    # (N) SC 2.2.2 Pause, Stop, Hide (Nivel A, BLOQUEANTE, y de No-Interferencia: un fallo aquí
    # contamina la conformidad de TODA la página). El Understanding es literal: «Having an animation
    # stop only so long as a user has focus on it … would not be considered a "mechanism for the user
    # to pause"», y «there is no five second exception for auto-updating».
    # (T) APG para lo demás, literal: «first element in the Tab sequence inside the carousel» y «since
    # the label changes, the rotation control does not have any states, e.g., aria-pressed, specified»
    # — poner `aria-pressed` con la etiqueta ya cambiando anuncia el estado DOS VECES y contradictorio.
    # [OJO] «El control va primero» es (T) del APG, NO la letra de SC 2.4.3.
    # «Nada enfocable dentro de las tarjetas» es (N) SC 2.4.7 Focus Visible: `overflow:hidden`,
    # `transform` y `opacity` son los tres asesinos del anillo de foco; y (N) SC 2.4.11 (palabra clave
    # «entirely»): la central ELEVADA podría tapar del todo un control que viviera en una lateral.
    # Además, un focusable dentro de un `overflow:hidden` hace que el navegador desplace el contenedor
    # al tabular y descoloca el carrusel entero.

  # -------------------------------------------------------------------------------------------
  # EL AUTOPLAY Y SUS REGLAS DE PAUSA. Reloj falso; nada de esperas reales.
  # -------------------------------------------------------------------------------------------

  @s9
  Scenario: La foto centrada cambia cada 4 segundos, ni antes
    Given el carrusel rotando con la PRIMERA foto centrada y el reloj bajo control del test
    When el reloj avanza 4000 milisegundos
    Then la SEGUNDA foto queda a distancia 0 y la primera pasa a distancia "-1"
    And a los 3999 milisegundos la PRIMERA seguía centrada: el cambio no ocurre antes de la marca
    And al avanzar otros 4000 milisegundos queda centrada la TERCERA
    And a los 24000 milisegundos desde el arranque vuelve a estar centrada la PRIMERA: la vuelta completa son seis pasos
    # `vi.useFakeTimers()` + `act`. La cadencia es una constante EXPORTADA (mutable y aseverable), no
    # un número enterrado en el componente. La frontera de los 3999 ms mata los mutantes de
    # comparador y los de aritmética sobre el intervalo. La vuelta completa a los 24 s vuelve a
    # ejercitar el bucle de @s4 por el camino largo, ya cableado.
    # [MEDIDO] `setInterval` NO devuelve `number` con `@types/node` cargado (`error TS2322: Type
    # 'Timeout' is not assignable to type 'number'`): el ref se tipa `ReturnType<typeof setInterval>`.

  @s10
  Scenario Outline: El ratón reanuda la rotación al salir; el foco de teclado NO
    Given el carrusel rotando con la PRIMERA foto centrada
    And "<gesto>" ha entrado en el carrusel y, desde entonces, avanzar el reloj 8000 milisegundos NO ha cambiado la foto centrada
    When "<gesto>" sale del carrusel y el reloj avanza otros 4000 milisegundos
    Then la foto centrada es "<foto centrada al final>"

    Examples:
      | gesto                | foto centrada al final | decisión                                                        |
      | el puntero del ratón | la SEGUNDA             | reanuda sola al salir (T)                                       |
      | el foco de teclado   | la PRIMERA             | NO reanuda sola: solo el botón la devuelve (P, lectura conservadora) |

    # LA ASIMETRÍA ES DELIBERADA y es la decisión nº 2 de la cabecera de este fichero. El APG se
    # contradice consigo mismo sobre si el foco reanuda; se elige que NO (2 fuentes contra 1, y es la
    # lectura que no roza SC 2.2.2, que castiga precisamente la animación que solo para mientras
    # tienes el foco encima). Que el gesto PARE la rotación va en el `Given` a propósito: sin esa
    # media, el `Then` del ratón pasaría verde aunque la pausa no existiera.
    # La rotación queda decidida por una función PURA con TODO inyectado (pausado por el usuario,
    # ratón, foco, arranque explícito): es lo único que Stryker puede morder de este comportamiento.

  @s11
  Scenario: «Iniciar» arranca la rotación AHORA, ignorando el ratón encima y el foco dentro
    Given el carrusel parado por el usuario, con el puntero del ratón ENCIMA del carrusel y el foco de teclado DENTRO de él
    And su control de rotación se anuncia exactamente "Iniciar la reproducción automática"
    When se pulsa ese control y el reloj avanza 4000 milisegundos
    Then la foto centrada ha avanzado UNA posición, aunque el ratón siga encima y el foco siga dentro
    And el nombre accesible del control es ahora exactamente "Parar la reproducción automática"
    And el control sigue sin exponer aria-pressed
    # (T) APG, literal: «If a user activates the rotation control button to start rotation it is
    # assumed the user wants auto-rotation to start immediately, so focus and/or hover states within
    # the carousel for pausing rotation are ignored». Es la PRECEDENCIA del arranque explícito sobre
    # ratón y foco; la contraria (que el usuario pulse «Iniciar» y no pase nada porque tiene el ratón
    # encima del botón que acaba de pulsar) es el fallo obvio que este escenario impide.

  @s12
  Scenario: Con la preferencia de movimiento reducido, el carrusel arranca PAUSADO pero no se le retira la función, y la preferencia se escucha EN CALIENTE
    Given el sistema operativo con la preferencia "prefers-reduced-motion: reduce" activada
    When se monta la galería y el reloj avanza 12000 milisegundos
    Then la foto centrada sigue siendo la PRIMERA: el carrusel arrancó pausado, no se movió ni una posición
    And el control de rotación se anuncia exactamente "Iniciar la reproducción automática"
    And ese control NO expone el atributo disabled: pulsarlo arranca la rotación
    And las seis diapositivas siguen presentes, con sus nombres accesibles "1 de 6" … "6 de 6"
    And en el caso CONTRARIO — montada SIN la preferencia y rotando — activarla con la página abierta pausa la rotación EN CURSO: desde el disparo del cambio, avanzar el reloj 12000 milisegundos NO mueve la foto centrada y el control pasa a anunciarse exactamente "Iniciar la reproducción automática"
    And un cambio que DESACTIVA la preferencia no toca nada: NO pausa una rotación en curso y NO arranca una pausada — reanudar sigue siendo decisión del usuario, con su botón
    And al desmontar la galería la escucha se limpia: removeEventListener recibe EXACTAMENTE el mismo manejador que registró addEventListener con el evento "change"
    # (T) implementación de referencia del APG, literal: «If operating system preferences have been
    # set for reduced motion or disabling animations, the auto-rotation is initially paused». Y (P)
    # por precedente FIRME del repo (`hero.module.scss:169`, `boton-whatsapp.module.scss:52`, ambos
    # aseverados por regex). [OJO] NO es la letra de ningún SC A/AA: 2.2.2 exige UN MECANISMO, no
    # honrar la preferencia del SO. Prohibido citarlo como requisito AA.
    # MDN describe literalmente este componente: «Animations such as scaling or panning large objects
    # can be vestibular motion triggers» — un coverflow es `scale` + `translateZ` + `rotateY` sobre
    # tarjetas grandes: caso de manual.
    # [MEDIDO] jsdom 25.0.1 NO implementa `window.matchMedia`: la llamada va GUARDADA
    # (`typeof window.matchMedia === 'function'`) y stubeada con `vi.stubGlobal`.
    # [ENMIENDA 1, aviso 🔵 del auditor (eje 5)] La preferencia se ESCUCHA en caliente: el MISMO
    # efecto que la lee al montar se suscribe con addEventListener('change') al MediaQueryList y
    # devuelve su limpieza. En jsdom: el stub de matchMedia devuelve un objeto con addEventListener/
    # removeEventListener espiados (vi.fn()); el test CAPTURA el manejador registrado y lo dispara a
    # mano con `{ matches: true }` y con `{ matches: false }`. La rama del matches:false NO es
    # decorativa: mata al mutante que pausa INCONDICIONALMENTE en cada change — ese mutante pararía
    # el carrusel justo cuando el usuario RETIRA la preferencia.

  # -------------------------------------------------------------------------------------------
  # EL SCSS. Se asevera leyendo los BYTES del fichero: Stryker no ve SCSS y la puerta de contraste
  # solo lee `_tokens.scss`. Estos tres escenarios son la ÚNICA red de lo visual.
  # -------------------------------------------------------------------------------------------

  @s13
  Scenario: La caja del escenario 3D: perspectiva sí, preserve-3d NO, y el recorte fuera
    Given el fichero "src/components/galeria.module.scss"
    When se leen sus bytes
    Then declara la PROPIEDAD "perspective" en el contenedor del escenario, y NO usa la función "perspective(" dentro de ninguna lista de transforms
    And NO declara "transform-style: preserve-3d" en ninguna regla
    And "overflow: hidden" NO aparece en la MISMA regla que declara "perspective": vive en un ancestro distinto
    And la propiedad "opacity" NO aparece en la regla de la tarjeta: se aplica al hijo que envuelve la imagen
    And no declara "will-change", ni "filter: drop-shadow(", ni "content-visibility: auto"
    # Las cuatro trampas más graves del brief §6, cada una hunde la implementación EN SILENCIO:
    #  · CON `preserve-3d` el orden de pintado lo decide el algoritmo de Newell sobre la geometría y
    #    `z-index` solo ordena elementos COPLANARES — las laterales están rotadas, así que el
    #    arbitraje sería geométrico y dependiente del motor. SIN él, cada tarjeta crea contexto de
    #    apilamiento por su propio `transform` y el `z-index` de @s5 es la autoridad, determinista en
    #    todos los navegadores. La `perspective` del padre sigue aplicando igual (spec §4.1.1). ES UNA
    #    DECISIÓN DELIBERADA, NO UN OLVIDO: quien la «arregle» rompe @s5.
    #  · `perspective()` dentro de la transform de la tarjeta daría SEIS puntos de fuga distintos: son
    #    seis volteos independientes, no un coverflow.
    #  · `overflow` en el elemento con `perspective` aplana el 3D. `overflow: clip` NO es escapatoria:
    #    el issue csswg-drafts#6374 lleva abierto desde 2021.
    #  · `opacity` es GROUPING PROPERTY de la spec: en la tarjeta aplanaría su subárbol.
    #  · `filter` con cualquier valor distinto de `none` aplana el 3D; `content-visibility: auto`
    #    aplica contención de pintado y también; `will-change` en seis tarjetas lo desaconseja MDN
    #    expresamente («use it as a last resort», «excessive memory use … worse performance»).

  @s14
  Scenario: Una ÚNICA declaración de transform, con las funciones en el orden que dibuja un coverflow
    Given el fichero "src/components/galeria.module.scss"
    When se lee la regla de la tarjeta
    Then contiene EXACTAMENTE UNA declaración "transform:", y ninguna regla de posición la redeclara con otra lista de funciones
    And esa lista lleva las funciones en este orden: primero la traslación, después "rotateY" y por último "scale"
    And NINGUNA regla declara "transform: none" para la tarjeta centrada
    And cada custom property usada dentro de la transform lleva su valor de reserva: "var(--s, 0)", "var(--x, 0%)", "var(--y, 0px)", "var(--z, 0px)", "var(--giro, 0deg)" y "var(--escala, 1)"
    And las magnitudes por posición se fijan con selectores de atributo, de "[data-distancia='0']" a "[data-distancia='3']", nunca con una clase de estado
    And la transición dura "0.8s" con la curva "cubic-bezier(0.22, 1, 0.36, 1)", cuyos dos valores de x están dentro de [0, 1]
    # Si dos listas de `transform` no tienen las MISMAS funciones en el MISMO orden, el navegador cae
    # en descomposición de matriz + Slerp de cuaterniones y la trayectoria deja de ser la diseñada.
    #  · `rotateY` ANTES de trasladar ⇒ anillo cilíndrico, no coverflow.
    #  · `scale` ANTES de trasladar ⇒ la matriz es S·T y la separación queda MULTIPLICADA por la
    #    escala: el abanico deriva durante toda la transición.
    #  · `transform: none` para la central está PROHIBIDO: cambia la longitud de la lista Y destruye
    #    el contexto de apilamiento, con lo que el `z-index` de @s5 deja de aplicar. Se escribe la
    #    lista completa con `--s: 0`.
    #  · [CRITICO] Si `--s` falta o llega vacía, `transform` cae a su valor INICIAL `none` (regla de
    #    *invalid at computed-value time*), NO a la declaración anterior de la cascada: las seis
    #    tarjetas se apilan en el centro SIN ningún error en consola. El fallback es el seguro.
    #  · [OJO] `cubic-bezier` exige x1 y x2 en [0,1]; fuera de rango la declaración entera se descarta
    #    EN SILENCIO y te quedas con `ease` sin saber por qué (la `y` sí puede salirse).
    #  · `translateZ()` no acepta porcentajes (`<length>` puro); los porcentajes de la traslación
    #    horizontal se resuelven contra el border-box de la propia tarjeta, así que la separación
    #    escala sola con el ancho.

  @s15
  Scenario: El móvil suaviza el 3D, el movimiento reducido lo congela, y la tarjeta oculta no barre la pantalla ni captura clics
    Given el fichero "src/components/galeria.module.scss"
    When se leen sus bytes
    Then declara un bloque "@media (max-width: 640px)" cuyos valores de giro, separación y profundidad son, en valor absoluto, MENORES que los del escritorio para la misma distancia
    And en ese bloque las vecinas siguen asomando: su opacidad a distancia 1 es mayor que cero
    And 640px es el ÚNICO breakpoint que la galería introduce: es el que ya usa el repo
    And ningún valor de giro alcanza los 90 grados en valor absoluto, en ninguno de los dos tamaños
    And declara un bloque "@media (prefers-reduced-motion: reduce)" que anula las transiciones de la tarjeta con "transition: none"
    And la tarjeta oculta, la que casa "[data-distancia='3']", declara "transition: none" TAMBIÉN fuera de ese @media
    And esa MISMA regla de la tarjeta oculta declara "pointer-events: none": una tarjeta a opacidad 0 no puede seguir capturando clics
    And no aparece ningún "url(https://" ni ningún "@import url(", y no se añade ni se quita ninguna "@font-face"
    # EL SALTO DEL BUCLE, resuelto sin estado extra: cada tarjeta hace exactamente UNA discontinuidad
    # por vuelta, de distancia -2 a +3. Si ESA transicionara, la tarjeta BARRERÍA todo el escenario de
    # izquierda a derecha en 0,8 s. Con `transition: none` en la oculta, y como las transiciones se
    # disparan leyendo la configuración del estado NUEVO: entrar en oculta (-2 → +3) es instantáneo e
    # invisible, y salir (+3 → +2) sí transiciona, desde el borde derecho, que es lo natural.
    # [OJO] Verificar este comportamiento EN VIVO en Chrome, no darlo por bueno de memoria.
    # Los ángulos son SATURANTES, no lineales: los defectos de Swiper (`rotate: 50`) son lineales y a
    # distancia 2 dan 100°, con lo que la tarjeta pasa de perfil y se ve ESPEJADA POR DETRÁS. Bajo los
    # 90° `backface-visibility` deja de ser un problema.
    # El último `Then` es la puerta de terceros (`src/lib/terceros.ts:167,173`): el conjunto de
    # `@font-face` es EXACTO (6) y añadir o quitar uno mata el build.
    # [OJO] La puerta de contraste solo lee `_tokens.scss` y solo evalúa 18 pares escritos a mano: un
    # color nuevo aquí es INVISIBLE para ella. NO INVENTAR COLOR: usar tokens (`--accent-dark`, nunca
    # `--accent`, que es 4,37:1 y falla AA; `--border-interactive`, nunca `--line`).
    # [ENMIENDA 1, aviso 🔵 del auditor (eje 6)] La oculta tiene opacidad 0 pero z-index 3 (> 0, por
    # @s5) y el clic de centrar de @s18 encima: sin `pointer-events: none` queda una franja INVISIBLE
    # junto al borde derecho que roba el clic y cambia la foto «sola». Con él, el clic atraviesa
    # hasta lo que sí se ve. No es incumplimiento WCAG: es una sorpresa de puntero que se elimina.

  # -------------------------------------------------------------------------------------------
  # LA NAVEGACIÓN MANUAL. Todo gesto de puntero tiene equivalente por teclado (N, SC 2.1.1).
  # -------------------------------------------------------------------------------------------

  @s16
  Scenario Outline: Las flechas mueven una posición y dan la vuelta por los DOS extremos
    Given el carrusel parado con la foto "<foto de partida>" centrada
    When se pulsa el botón "<botón>"
    Then la foto centrada pasa a ser la "<foto centrada>"
    And su tarjeta expone data-distancia="0" y es la ÚNICA que lo hace
    And ninguna de las seis tarjetas queda sin data-distancia ni expone un valor distinto de "0", "1", "2" o "3"

    Examples:
      | botón     | foto de partida | foto centrada | qué fija                                                     |
      | Siguiente | 1ª              | 2ª            | el avance normal                                             |
      | Siguiente | 6ª              | 1ª            | la vuelta hacia DELANTE, sin hueco vacío                      |
      | Anterior  | 1ª              | 6ª            | la vuelta hacia ATRÁS: con `i % n` a secas el índice sale NEGATIVO |
      | Anterior  | 2ª              | 1ª            | el retroceso normal                                          |

    # La tercera fila es la hermana de @s4 en el CABLEADO: es el lado que casi siempre se olvida, y
    # sin ella el carrusel «funciona» hacia delante y está roto hacia atrás (lección ya pagada en
    # `equipo_reservas.feature` @s22). Los nombres accesibles "Anterior" y "Siguiente" son LITERALES
    # NO NEGOCIABLES (`galeria.test.tsx:88-93`) y singulares: no puede haber dos con ese nombre.

  @s17
  Scenario: Los puntos llevan a su foto, marcan el actual con aria-disabled, JAMÁS con el disabled nativo, y ofrecen una diana de 24 píxeles
    Given el carrusel con la PRIMERA foto centrada y sus SEIS puntos indicadores
    When se pulsa el punto cuyo nombre accesible es exactamente "Ver la foto 5 de 6"
    Then la QUINTA foto queda centrada: su tarjeta expone data-distancia="0"
    And ese punto pasa a exponer aria-disabled="true" y el punto "Ver la foto 1 de 6" deja de exponerlo
    And EXACTAMENTE UNO de los seis expone aria-disabled="true"
    And NINGUNO de los seis expone el atributo disabled nativo: los seis siguen siendo tabulables
    And los seis viven en un grupo cuyo nombre accesible es exactamente "Elegir la foto que se muestra"
    And el fichero "src/components/galeria.module.scss" distingue el punto ACTUAL del disponible con dos colores de token DISTINTOS, y no únicamente con "opacity" del mismo color
    And la caja interactiva de cada punto mide al menos "1.5rem" por lado (24 píxeles CSS) SIN que el círculo visible pase de "0.75rem": la regla del punto declara AMBAS medidas, y el aspecto de 12 píxeles se conserva recortando el color al círculo (background-clip a la caja de contenido, o un pseudo-elemento que lleve consigo el borde)
    # (T) APG: el `disabled` nativo sacaría el punto del orden de tabulación y el usuario de teclado
    # perdería la referencia de dónde estaba; por eso el patrón prefiere `aria-disabled`.
    # (N) SC 1.4.11 Non-text Contrast (AA) — EL FALLO AA MÁS PROBABLE DE TODO EL COMPONENTE. El texto
    # del criterio dice «components AND STATES»: la diferencia visual entre el punto actual y el
    # disponible ES UN ESTADO ⇒ exige ≥ 3:1. Distinguirlos con `opacity: .4` frente a `1` del MISMO
    # rosa FALLA. Las fotos NO entran en este criterio (no son «parts of graphics required to
    # understand the content»): su opacidad lateral es (P).
    # [ENMIENDA 1, aviso 🟡 del auditor (eje 4)] (N) SC 2.5.8 Target Size (Minimum), AA de WCAG 2.2:
    # con dianas de 12×12 px y hueco de 8 px, los círculos de 24 px de la prueba del criterio se
    # SOLAPAN (centros a 20 px) y el cumplimiento colgaba SOLO de la excepción «equivalente» (las
    # flechas de 44 px). Se cierra dando CAJA de ≥ 24 px al `<button>` sin tocar lo que se ve: el
    # círculo de 12 px con su borde sigue siendo lo único visible. [OJO] `background-clip:
    # content-box` recorta el FONDO pero no el borde (que se pinta siempre en el borde de la caja):
    # si se elige esa vía, el anillo de 1px debe resolverse aparte (p. ej. pseudo-elemento); el
    # hueco entre cajas puede encogerse para que la separación VISUAL apenas cambie, y las cajas de
    # 24 px NO pueden solaparse entre sí. Se asevera por BYTES en `galeria-estilos.test.ts`, como el
    # resto del SCSS de este escenario, y se verifica EN VIVO que el aspecto no cambió.

  @s18
  Scenario: Pulsar una tarjeta lateral la trae al centro, sin reordenar el DOM
    Given el carrusel con la PRIMERA foto centrada, en el que la TERCERA está a distancia "+2"
    When se pulsa la tarjeta de la TERCERA foto
    Then la tercera queda centrada: su tarjeta expone data-distancia="0" y su "--s" vale "0"
    And la PRIMERA pasa a exponer data-distancia="2" con "--s" igual a "-1"
    And el orden del DOM de las seis diapositivas sigue siendo 1..6: solo cambian los atributos, nunca la posición en el árbol
    # (P) criterio de proyecto: es el gesto que todo el mundo intenta al ver un coverflow. La tarjeta
    # es CLICABLE pero NO ENFOCABLE (@s8): el teclado llega a cualquier foto por las flechas (@s16) y
    # por los puntos (@s17), que son el equivalente exigido por (N) SC 2.1.1 Keyboard.
    # Los valores esperados salen de la misma tabla que @s3 con la tercera centrada (la primera queda
    # a -2, luego clave "2" y signo -1): si @s3 y @s18 dejaran de casar, uno de los dos miente.
    # [OJO — ENMIENDA 1] El ARRASTRE ya no se remite a la verificación en vivo: su CABLEADO lo exige
    # @s19 (la decisión sigue en la función pura `pasosDelArrastre`, con el umbral inyectado y ya
    # testeada por valor). En vivo en Chrome solo queda el GESTO FÍSICO — dedo real sobre pantalla —
    # que ningún test de jsdom puede fingir. Y OJO a la interacción: el clic de centrar de ESTE
    # escenario solo actúa cuando el desplazamiento del gesto quedó POR DEBAJO del umbral (@s19).

  @s19
  Scenario: Arrastrar sobre el marco mueve UNA foto, con la frontera INCLUSIVA en 48 píxeles, y el gesto largo no queda anulado por el clic de la tarjeta
    Given el carrusel parado con la PRIMERA foto centrada
    When el puntero baja sobre el marco del carrusel en clientX 200 y sube en clientX 152
    Then la SEGUNDA foto queda centrada: 48 píxeles hacia la IZQUIERDA son EXACTAMENTE el umbral, el gesto YA cuenta (frontera inclusiva) y trae la SIGUIENTE
    And un segundo gesto que baja en clientX 200 y sube en clientX 248 devuelve la PRIMERA al centro: 48 píxeles hacia la DERECHA traen la ANTERIOR
    And un tercer gesto que baja en clientX 200 y sube en clientX 153 no mueve NADA: 47 píxeles quedan POR DEBAJO del umbral y la PRIMERA sigue centrada
    And un gesto que baja en clientX 400 y sube en clientX 40 mueve EXACTAMENTE UNA posición: por lejos que llegue el dedo, cada arrastre cuenta una sola foto
    And si un gesto largo baja Y sube sobre la MISMA tarjeta lateral, y a continuación se dispara el click que el navegador sintetiza sobre ella, la foto centrada final es la que decidió el ARRASTRE, no la tarjeta pulsada
    And un toque corto sobre una tarjeta lateral — bajar y subir en el MISMO clientX, y su click — la sigue trayendo al centro, exactamente como fija @s18
    And las seis "<img" de la galería declaran el atributo draggable="false": sin él, el drag nativo de imagen del navegador se traga el pointerup y el gesto muere en silencio
    And el fichero "src/components/galeria.module.scss" declara "touch-action: pan-y" en la regla del MARCO, y se asevera leyendo sus BYTES: en pantalla táctil, sin él, el navegador reclama el gesto horizontal para hacer scroll y dispara pointercancel
    And un gesto de 0 píxeles con umbral 0 no mueve NADA: pasosDelArrastre(0, 0) devuelve 0, no una dirección arbitraria
    # [ENMIENDA 1 — hallazgo 7 del judge y §11.4 del brief: «se repone»] Al pasar de scroll-snap a
    # transforms se perdió el deslizamiento que el navegador daba gratis; `pasosDelArrastre` y
    # `UMBRAL_DE_ARRASTRE` (48, frontera INCLUSIVA) existían y estaban testeados por valor (5 tests
    # verdes) pero NADIE los llamaba. Este escenario exige el CABLEADO, no re-litiga la decisión:
    # `onPointerDown`/`onPointerUp` en el MARCO del carrusel (el ancestro con el recorte, NO cada
    # tarjeta), guardando el clientX de la bajada y llamando en la subida a
    # `desplazar(pasosDelArrastre(clientX_subida - clientX_bajada, UMBRAL_DE_ARRASTRE))`.
    # LA SEMÁNTICA DEL CLIC (la más simple y honesta, y queda FIJADA aquí): el MARCO es el dueño del
    # gesto; el clic de centrar de la tarjeta (@s18) solo actúa si el desplazamiento del gesto quedó
    # POR DEBAJO del umbral. Un arrastre real que empieza y acaba sobre la misma tarjeta dispara
    # ADEMÁS su click: sin esta regla, ese click «recentraría» la tarjeta agarrada y anularía el
    # gesto en silencio. ANTI-VACUIDAD: la fila del toque corto es el contraejemplo que impide
    # «resolver» este escenario matando el clic de @s18 para siempre.
    # [MEDIDO] jsdom 25 no implementa la CLASE `PointerEvent`, pero React registra los pointer
    # events por NOMBRE: el test despacha
    # `el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 200 }))` (y su
    # 'pointerup') y el handler recibe `clientX` con normalidad. jsdom TAMPOCO sintetiza el click
    # posterior al pointerup: cuando el escenario lo exige, el test lo despacha a mano imitando al
    # navegador. El GESTO FÍSICO (dedo real, presión, captura del puntero) se verifica EN VIVO en
    # Chrome antes del cierre, como el resto de lo táctil.
    # [ENMIENDA 2, MEDIDO en Chrome real por CDP] El gesto NO funcionaba: un press+movimiento sobre
    # una <img> arranca el drag NATIVO de imagen del navegador y el pointerup JAMÁS llega al marco
    # (espía instalado: solo se registró pointerdown). Contraprueba: con draggable=false puesto en
    # caliente, el MISMO gesto real mueve la foto y el pointerup llega. jsdom no podía verlo: los
    # eventos despachados a mano no disparan el drag nativo — por eso los dos And nuevos se aseveran
    # por atributo y por bytes, y el gesto físico sigue verificándose en vivo.
    # [ENMIENDA 2 — REDISEÑO, decisión del lead a la salida de progress/mutation_galeria_carrusel.md
    # (superviviente 153:10)] El retorno de `pasosDelArrastre` se deriva del SIGNO
    # (`-signoDe(desplazamientoX)`) en vez de un ternario con comparador: MISMA conducta para todo
    # |Δ| ≥ umbral con umbral > 0 — los And de dirección de arriba NO cambian — y el caso degenerado
    # `pasosDelArrastre(0, 0)` pasa a devolver 0 (nada) en vez de una dirección arbitraria. Sin
    # comparador, no queda mutante de igualdad que instrumentar.
