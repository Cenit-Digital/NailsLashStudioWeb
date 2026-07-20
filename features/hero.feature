# language: es
Característica: Portada con la marca ESCRITA A PINCEL
  Como visitante quiero una portada memorable en la que la marca «Nails Lash»
  se escriba a mano con un aplicador de esmalte, para reconocer al instante que
  es un salón de uñas y pestañas y sentir el cuidado por el detalle.

  # Reescrito el 2026-07-20 tras dos quejas de Pablo sobre el intento anterior, las
  # dos DIAGNOSTICADAS CON MEDICIONES (progress/hallazgos_hero_caligrafia.md):
  #
  # 1. EL RECORTE LATERAL. La tinta de «Nails Lash» va de x −15,6 a 3965,3 ‰ de em,
  #    pero la caja del texto solo mide 3895 ‰: la «N» se salía 15,6 ‰ por la
  #    izquierda y la «h» 70,3 ‰ por la derecha. `clip-path: inset(0 0 0 0)` recorta
  #    AL BORDER-BOX, así que las seccionaba en vertical. (La sesión anterior arregló
  #    el eje Y con padding; nadie tocó el eje X.)
  #
  # 2. LA INCOHERENCIA DE LA ANIMACIÓN. Eran DOS RELOJES sobre DOS GEOMETRÍAS: la
  #    tinta se revelaba con una guillotina vertical (`clip-path`) mientras el pincel
  #    viajaba por otra trayectoria. Y además el `<image>` anclaba el punto del
  #    recorrido al 86 % de `brush.png` — o sea DENTRO DEL FRASCO NEGRO—, así que lo
  #    que «pintaba» las letras no era la punta del pincel.
  #
  # DECISIONES HUMANAS de esta reescritura (puerta de aprobación, 2026-07-20):
  #   · Pablo APRUEBA subir la duración a 4,5 s, por encima del tope de 2,5 s que
  #     tenía F-07 por LCP, para que la caligrafía se aprecie. Coste aceptado: el
  #     rótulo tarda ~4,5 s en revelarse. No infringe WCAG 2.2.2 (exige MÁS de cinco
  #     segundos) ni 2.3.3 (es AAA y solo cubre animación disparada por interacción).
  #   · NO se instala GSAP ni Anime.js: ninguna de las dos genera la línea central de
  #     unas letras (las fuentes guardan CONTORNOS), que es lo único difícil aquí. Con
  #     el trazo ya derivado, CSS puro lo cubre entero y respeta la regla nº 1 del
  #     proyecto (cero terceros).
  #
  # Se mantiene intacto lo que F-07 protegía: UN solo <h1>, dos <span>, el text node
  # de espacio REAL, nombre accesible «Nails Lash Studio», estado base VISIBLE, la
  # animación en la HOJA y nunca inline, --ink como color, y cero terceros.

  @s1 @recorte
  Escenario: El rótulo se muestra COMPLETO, sin recortes por ningún lado
    Dado que un cliente accede a la página de inicio
    Cuando termina la animación del rótulo
    Entonces el texto "Nails Lash" es completamente visible
    Y el arranque de la "N" NO aparece seccionado por la izquierda
    Y la cola de la "h" NO aparece seccionada por la derecha
    Y las astas altas NO aparecen seccionadas por arriba
    Y debajo se lee "STUDIO"

  @s2 @trazo
  Escenario: La tinta aparece SIGUIENDO el trazo de cada letra, no como un barrido
    Dado que un cliente accede a la página de inicio con el movimiento permitido
    Cuando arranca la animación del rótulo
    Entonces la tinta se revela recorriendo la línea central real de las letras
    Y en ningún momento aparece un frente recto vertical barriendo de izquierda a derecha
    Y la marca se escribe en 5 plumadas, que son los levantamientos de pluma reales

  @s3 @punta
  Escenario: La punta del aplicador cae sobre la tinta que se está pintando
    Dado que la animación del rótulo está a la mitad
    Cuando se compara la posición del aplicador con el borde de lo ya pintado
    Entonces es la PUNTA de las cerdas la que va sobre el recorrido, nunca el frasco
    Y la punta coincide con el borde de lo recién pintado

  @s4 @duracion
  Escenario: El recorrido es lento y deliberado, para que se aprecie
    Dado que un cliente accede a la página de inicio con el movimiento permitido
    Cuando se mide el tiempo total del rótulo (espera + duración)
    Entonces dura como mucho 4,5 segundos
    Y "STUDIO" se revela al terminar la marca, no antes

  @s5 @reducido
  Escenario: Con movimiento reducido, el rótulo aparece al instante y sin aplicador
    Dado que el sistema operativo tiene activada la preferencia "prefers-reduced-motion: reduce"
    Cuando cargo la página de inicio
    Entonces el rótulo "Nails Lash" es visible de inmediato, legible y sin movimiento
    Y "STUDIO" es visible de inmediato
    Y el aplicador de esmalte NO se muestra

  @s6 @accesibilidad
  Escenario: El aplicador y el rótulo son decorativos y no alteran lo que se anuncia
    Dado que un lector de pantalla recorre la portada
    Cuando llega al titular
    Entonces anuncia exactamente un encabezado de nivel 1 con el nombre "Nails Lash Studio"
    Y NO anuncia "Nails Lash" dos veces
    Y el rótulo dibujado queda marcado como decorativo (aria-hidden)

  @s7 @sin-js
  Escenario: El nombre viaja en el HTML horneado, sin depender de JavaScript
    Dado el artefacto de producción de la página de inicio
    Cuando se lee el HTML crudo, sin hidratar
    Entonces el nombre "Nails Lash Studio" está presente en los bytes
    Y el titular NO lleva ninguna ocultación ni animación horneada inline

  @s8 @cero-terceros
  Escenario: El aplicador se sirve desde el propio sitio (cero terceros, F-05 intacto)
    Dado el artefacto de producción de la página de inicio
    Cuando se cargan las imágenes de la portada
    Entonces el aplicador de esmalte se pide al propio dominio, nunca a un tercero
    Y no se ha añadido ninguna librería de animación de terceros

  @s9 @responsive
  Escenario: El efecto escala con el rótulo en móvil y escritorio
    Dado que el rótulo se reescala con el ancho de la ventana
    Cuando cambio el tamaño de la ventana entre móvil y escritorio
    Entonces el aplicador y su recorrido escalan con el rótulo y la punta sigue cayendo sobre las letras
    Y la página NO desborda en horizontal
