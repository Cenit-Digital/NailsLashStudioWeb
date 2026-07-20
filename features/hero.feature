# language: es
Característica: Portada con efecto de TRAZO DE PLUMA
  Como visitante quiero una portada memorable en la que la marca «Nails Lash»
  se escriba a mano con un aplicador de esmalte, para reconocer al instante que
  es un salón de uñas y pestañas y sentir el cuidado por el detalle.

  # Decisión de Pablo (2026-07-19), tras elegir «Trazo de pluma (SVG)» frente a
  # «contorno de la fuente» y «barrido horizontal»: el aplicador debe RECORRER EL
  # TRAZO REAL de cada letra (subir la N, hacer la montaña, los lazos), no un
  # limpiaparabrisas de izquierda a derecha. Reemplaza el pincel `brush.png` que
  # barría en horizontal. Se implementa SIN romper el contrato de F-07
  # (hero_marca, done): un solo <h1>, dos <span>, nombre accesible «Nails Lash
  # Studio», estado base VISIBLE, cero terceros. Verificado EN VIVO con Chrome.

  @s1 @recorte
  Escenario: El titular se muestra COMPLETO, sin recortes
    Dado que un cliente accede a la página de inicio
    Cuando termina la animación del titular
    Entonces el texto "Nails Lash" es completamente visible
    Y las astas altas de la "N", la "L" y la "h" NO aparecen seccionadas por arriba
    Y debajo se lee "STUDIO"

  @s2 @trazo
  Escenario: Un aplicador de esmalte ESCRIBE la marca siguiendo el trazo de cada letra
    Dado que un cliente accede a la página de inicio con el movimiento permitido
    Cuando arranca la animación del titular
    Entonces un aplicador de esmalte recorre el trazo de "Nails Lash" letra a letra
    Y su punta sube por la "N", hace la montaña y recorre los lazos, no un barrido horizontal
    Y la letra manuscrita Great Vibes se revela justo detrás de la punta
    Y el recorrido completo dura como mucho 2,5 segundos

  @s3 @reducido
  Escenario: Con movimiento reducido, el titular aparece al instante y sin aplicador
    Dado que el sistema operativo tiene activada la preferencia "prefers-reduced-motion: reduce"
    Cuando cargo la página de inicio
    Entonces el titular "Nails Lash Studio" es visible de inmediato, legible y sin movimiento
    Y el aplicador de esmalte NO se muestra (ni barrido ni trazo)

  @s4 @accesibilidad
  Escenario: El aplicador es decorativo y no altera lo que se anuncia
    Dado que un lector de pantalla recorre la portada
    Cuando llega al titular
    Entonces anuncia exactamente un encabezado de nivel 1 con el nombre "Nails Lash Studio"
    Y el aplicador de esmalte queda fuera del encabezado, marcado como decorativo (aria-hidden)

  @s5 @cero-terceros
  Escenario: El aplicador se sirve desde el propio sitio (cero terceros, F-05 intacto)
    Dado el artefacto de producción de la página de inicio
    Cuando se cargan las imágenes de la portada
    Entonces el aplicador de esmalte se pide al propio dominio, nunca a un tercero

  @s6 @responsive
  Escenario: El efecto escala con el titular en móvil y escritorio
    Dado que el titular se reescala con el ancho de la ventana
    Cuando cambio el tamaño de la ventana entre móvil y escritorio
    Entonces el aplicador y su recorrido escalan con el titular y la punta sigue cayendo sobre las letras
