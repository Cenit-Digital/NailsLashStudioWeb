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
  #   · [SUPERADA el 2026-07-23 — ver ENMIENDA] Pablo APROBÓ subir la duración a
  #     4,5 s, por encima del tope de 2,5 s que tenía F-07 por LCP. A 4,5 s no
  #     infringía WCAG 2.2.2 (exige MÁS de cinco segundos). Ese razonamiento ya NO
  #     aplica al régimen nuevo: queda aquí solo como historia.
  #   · NO se instala GSAP ni Anime.js: ninguna de las dos genera la línea central de
  #     unas letras (las fuentes guardan CONTORNOS), que es lo único difícil aquí. Con
  #     el trazo ya derivado, CSS puro lo cubre entero y respeta la regla nº 1 del
  #     proyecto (cero terceros). SIGUE VIGENTE.
  #
  # ENMIENDA — LA CALIGRAFÍA LENTA (puerta de aprobación, 2026-07-23):
  #   · Pablo pide «≈10 s por letra»: 9 letras a velocidad constante ≈ 90 s de trazo
  #     (≈90,8 s con la coreografía de salida). Acepta que casi nadie la vea acabar.
  #     La aprobación de 4,5 s del 2026-07-20 queda SUPERADA por esta.
  #   · CONCILIACIÓN SC 2.2.2 (nivel A, normativo): Pablo pidió «sin nada de botones
  #     de parar ni historias», pero por encima de 5 s el mecanismo para parar/saltar
  #     es OBLIGATORIO — PROHIBIDO citarlo como opcional en este contrato o en el
  #     código. La forma respeta al cliente: el mecanismo va SIN CROMO — el propio
  #     rótulo es el control (@s10–@s14). Cero chips, cero ⏸. La decisión de los 90 s
  #     es del CLIENTE, con esta conciliación comunicada y documentada.
  #   · El LCP se RE-VERIFICA EN VIVO con la animación larga (precedente F-07: el
  #     LCP real era un <p>, no el titular — comprobar que sigue siendo así).
  #
  # NOTA TÉCNICA de la enmienda: jsdom NO ejecuta animaciones CSS. El token, los
  # tiempos y las curvas (@s4) se aseveran por BYTES del SCSS (patrón galeria-estilos);
  # el control (@s10–@s14) por DOM. El ritmo REAL de los ≈90 s se verifica EN VIVO en
  # Chrome (getAnimations() + muestreo de fotogramas), como pidió Pablo expresamente.
  #
  # ENMIENDA 2 — EL ARRANQUE EN EL MONTAJE (2026-07-23, tras la auditoría
  # progress/a11y_hero_caligrafia_lenta.md — avisos A-2, A-3, A-5 — y la primera mutación):
  #   · A-3 (estructural): la caligrafía DEJA de arrancar con el CSS a secas. Arranca SOLO
  #     cuando el componente monta: el efecto de montaje añade la clase de «lista» y las
  #     animaciones del SCSS quedan condicionadas a esa clase (@s15). Consecuencias
  #     contratadas: el mecanismo de parar EXISTE SIEMPRE que hay movimiento — nacen juntos
  #     (@s15); sin JavaScript el rótulo se ve COMPLETO y ESTÁTICO desde el primer pintado,
  #     porque la base ya es el estado final y el horneado no lleva la clase (@s7 ampliado);
  #     bajo reduced-motion nada cambia: ni clase ni botón (@s13 ampliado).
  #   · A-2: si el foco está EN el botón cuando este se desmonta (clic, Enter o fin del
  #     reloj), NO cae al vacío: se recoloca dentro del hero (@s16).
  #   · A-5: la preferencia de movimiento se escucha EN CALIENTE (@s17), con el patrón ya
  #     contratado en features/galeria_carrusel.feature @s12.
  #   · MUTACIÓN: la exclusión in-situ del equivalente deps-[] del efecto de lectura de la
  #     preferencia (Hero.tsx 92:6, ArrayDeclaration; 97,14 % → 100 % con ella) queda
  #     RATIFICADA por el lead con el patrón del repo (Galeria.tsx 136-137, Equipo.tsx 210).
  #     Ver progress/mutation_hero_caligrafia_lenta.md.
  #
  # Se mantiene intacto lo que F-07 protegía: UN solo <h1>, dos <span>, el text node
  # de espacio REAL, nombre accesible «Nails Lash Studio», estado base VISIBLE, la
  # animación en la HOJA y nunca inline, --ink como color, y cero terceros. Los
  # escenarios @s1–@s3 y @s5–@s9 NO cambiaron con la enmienda de los 90 s; la
  # ENMIENDA 2 amplía @s7 y @s13 y añade @s15–@s17.

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

  # @s4 REESCRITO el 2026-07-23. La curva pasa a linear: a 90 s el cubic-bezier
  # anterior reptaría en los extremos y correría en el centro; una pluma real escribe
  # a velocidad constante, y a velocidad constante las letras complejas tardan más
  # SOLAS («≈10 s por letra» es el promedio: 9 letras × 10 s ≈ 90 s de trazo).
  @s4 @duracion
  Escenario: La caligrafía es una ceremonia de ≈90 segundos a velocidad constante
    Dada la hoja de estilos del hero (los tiempos se aseveran por BYTES del SCSS)
    Cuando se leen las animaciones del rótulo
    Entonces existe un ÚNICO token "--duracion-caligrafia: 90s" y todo tiempo del rótulo deriva de él por calc(), sin ninguna otra duración de trazo suelta
    Y "escribir" y "recorrer" duran exactamente var(--duracion-caligrafia) y su curva es "linear" en las DOS
    Y tinta y aplicador siguen siendo UN reloj: misma duración, mismo retardo y misma curva
    Y "retirarse" arranca en calc(var(--duracion-caligrafia) - 0.4s + 0.1s) y "revelarStudio" en calc(var(--duracion-caligrafia) + 0.2s): la coreografía relativa de hoy, derivada del token
    Y "STUDIO" se revela al terminar la marca, no antes (total ≈90,8 s)

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
    Y el HTML horneado NO lleva la clase de «lista» que arranca la caligrafía: sin JavaScript nada se anima y el rótulo se ve COMPLETO y ESTÁTICO desde el primer pintado, porque la base ya es el estado final (ENMIENDA 2, A-3)

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

  # @s10–@s14 NUEVOS (enmienda 2026-07-23): el mecanismo SC 2.2.2 sin cromo.
  # El rótulo es el control. Se asevera por DOM; la vivencia real, EN VIVO.

  @s10 @control
  Escenario: El rótulo es el control para completar la firma, sin ningún cromo visible
    Dado que un cliente accede a la página de inicio con el movimiento permitido
    Cuando se inspecciona la portada mientras la caligrafía corre
    Entonces existe un botón transparente superpuesto al área del rótulo, sin texto visible, sin fondo y sin borde
    Y su nombre accesible es "Completar la firma"
    Y sobre el rótulo el cursor es "pointer"
    Y al tabular hasta él recibe el foco y el anillo de foco global del sitio lo hace visible
    Y el botón vive FUERA del <h1>: el titular conserva UN h1, dos span y el text node de espacio real (@s6 intacto)

  @s11 @control @completar
  Escenario: Activar el control completa la firma al instante
    Dado que la caligrafía está a medio escribir
    Cuando el cliente activa el control (con clic, o con Enter o Espacio teniendo el foco)
    Entonces el rótulo aparece completo de inmediato: toda la tinta, el aplicador retirado y "STUDIO" visible
    Y el botón desaparece del árbol (ya no hay nada que completar)

  @s12 @control @fin-de-reloj
  Escenario: El control solo existe mientras la animación corre
    Dado que un cliente deja la ceremonia correr hasta el final
    Cuando el reloj de la caligrafía termina por sí solo
    Entonces el botón desaparece del árbol sin intervención del cliente
    Y el rótulo terminado NO queda cubierto por ninguna superficie clicable

  @s13 @control @reducido
  Escenario: Con movimiento reducido el control NO se monta, porque no hay nada que completar
    Dado que el sistema operativo tiene activada la preferencia "prefers-reduced-motion: reduce"
    Cuando cargo la página de inicio
    Entonces el rótulo completo es visible de inmediato, como protege @s5
    Y el botón "Completar la firma" NO existe en el árbol en ningún momento
    Y la clase de «lista» NO se añade: la caligrafía no arranca y nada hay que completar (ENMIENDA 2, A-3)

  @s14 @control @punteria
  Escenario: El control no roba clics fuera del área del rótulo
    Dado que la caligrafía está en marcha
    Cuando el cliente pulsa en la portada fuera del área del rótulo
    Entonces la firma NO se completa y sigue escribiéndose
    Y la superficie clicable del control queda ceñida al área del rótulo

  # @s15–@s17 NUEVOS (ENMIENDA 2): el arranque en el montaje, el foco al desmontar y la
  # preferencia en caliente. Se aseveran por BYTES del SCSS y por DOM, como @s4 y @s10–@s14.
  # La clase de «lista» debe ser OBSERVABLE bajo css:false (precedente data-firma): nada de
  # aseverar por clase de CSS module, que en jsdom es undefined.

  @s15 @arranque
  Escenario: La caligrafía arranca SOLO cuando el componente monta, junta e inseparable de su control
    Dado que un cliente accede a la página de inicio con el movimiento permitido
    Cuando el componente del hero monta y su efecto añade la clase de «lista» a la escena
    Entonces la caligrafía arranca en ese momento y no antes: en el SCSS TODAS las animaciones del rótulo (tinta, aplicador y "STUDIO") están condicionadas a la clase de «lista», y el estado base NO declara ninguna animación
    Y el botón "Completar la firma" se monta desde ese MISMO efecto, en el mismo render que la clase
    Y por construcción NUNCA hay movimiento sin mecanismo para pararlo: nacen juntos y mueren juntos (cierra el aviso A-3)

  @s16 @control @foco
  Escenario: El foco no cae al vacío cuando el botón se desmonta bajo él
    Dado que el foco está en el botón "Completar la firma"
    Cuando el botón se desmonta — por clic, por Enter o porque el reloj de la ceremonia llega al final
    Entonces el foco NO queda en el <body>: se recoloca en el contenedor de la escena del rótulo (el que envuelve rótulo, titular y botón)
    Y ese contenedor acepta el foco solo programáticamente (tabindex -1): NO aparece ninguna parada de tabulador nueva
    Y el siguiente Tab continúa hacia delante desde el hero, sin rearrancar desde el principio del documento
    # Destino elegido con el JSX real (Hero.tsx): los CTAs «Reservar cita»/«Ver servicios»
    # viven en la página (home.tsx), FUERA del componente — el contenedor de la escena es el
    # destino razonable DENTRO del hero, y desde él Tab sigue hacia esos CTAs. Cierra A-2.

  @s17 @reducido @en-caliente
  Escenario: Activar el movimiento reducido A MITAD de firma la completa; desactivarlo no rearranca nada
    Dado que la caligrafía está a medio escribir, montada SIN la preferencia de movimiento reducido
    Cuando el sistema dispara el evento "change" del MediaQueryList activando "prefers-reduced-motion: reduce"
    Entonces la firma se COMPLETA al instante — el equivalente de reduce a mitad de camino: toda la tinta, el aplicador retirado y "STUDIO" visible
    Y el botón "Completar la firma" se desmonta: no queda superficie clicable sobre un rótulo ya estático
    Y un cambio posterior que DESACTIVA la preferencia NO rearranca nada: ni caligrafía ni botón
    Y al desmontar el hero la escucha se limpia: removeEventListener recibe EXACTAMENTE el mismo manejador que registró addEventListener con el evento "change"
    # Patrón ya contratado en la galería (features/galeria_carrusel.feature @s12): mismo
    # listener "change" en el mismo efecto que lee la preferencia, misma limpieza. Cierra A-5.
