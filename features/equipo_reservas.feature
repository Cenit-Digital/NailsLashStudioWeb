Feature: Equipo y calendario de reserva por profesional
  Como visitante quiero elegir profesional, día y hora, y confirmar mi cita
  desde su propia tarjeta, para reservar sin salir de la página.

  # Estado independiente por profesional (día/hora/reseña activa/reservado).
  # Días: se calculan en runtime desde "hoy", saltando domingos, hasta reunir
  # 6 — NO son fechas fijas del dataset (HANDOFF §3 #8). Horas: fijas,
  # verbatim de salon-data.js → timeSlots.

  @s1
  Scenario: Se muestran las siete tarjetas de profesional en orden
    Given la home renderizada
    When leo la sección "Equipo"
    Then aparecen, en este orden, las tarjetas de "Lucía", "Carla", "Andrea", "Nerea", "Marta", "Paula" y "Sara"

  @s2
  Scenario: Cada tarjeta muestra el rol y las especialidades del prototipo
    Given la home renderizada
    When leo la tarjeta de "Nerea"
    Then su rol es "Lash & brow" y sus especialidades son "Facial" y "Pestañas"

  @s3
  Scenario: El selector de hora no aparece hasta elegir un día
    Given la tarjeta de "Lucía" sin día elegido
    When inspecciono la tarjeta de "Lucía"
    Then no se muestra ningún selector de hora

  @s4
  Scenario: Elegir un día en una tarjeta muestra las seis franjas horarias
    Given la tarjeta de "Lucía" sin día elegido
    When pulso uno de los seis días disponibles en la tarjeta de "Lucía"
    Then se muestran exactamente las franjas "10:00", "11:30", "13:00", "16:00", "17:30" y "19:00"

  @s5
  Scenario: Elegir día en una tarjeta no afecta a las demás
    Given las tarjetas de "Lucía" y "Carla" sin día elegido
    When pulso un día en la tarjeta de "Lucía"
    Then la tarjeta de "Carla" sigue sin día elegido ni selector de hora visible

  @s6
  Scenario: Sin hora elegida, el botón de reserva está deshabilitado
    Given la tarjeta de "Lucía" con un día elegido y sin hora elegida
    When inspecciono el botón de reserva de la tarjeta de "Lucía"
    Then su texto es "Elige día y hora" y está deshabilitado

  @s7
  Scenario: Con día y hora elegidos, el botón de reserva se habilita con etiqueta dinámica
    Given la tarjeta de "Lucía" con el día "miércoles 22" y la hora "16:00" elegidos
    When inspecciono el botón de reserva de la tarjeta de "Lucía"
    Then su texto es "Reservar · mié 22 · 16:00" y está habilitado

  @s8
  Scenario: Cambiar de día después de elegir hora deselecciona la hora
    Given la tarjeta de "Lucía" con día y hora ya elegidos
    When pulso un día distinto en la tarjeta de "Lucía"
    Then la hora vuelve a quedar sin elegir y el botón de reserva vuelve a mostrar "Elige día y hora"

  @s9
  Scenario: Confirmar la reserva muestra el mensaje de confirmación
    Given la tarjeta de "Lucía" con el día "miércoles 22" y la hora "16:00" elegidos
    When pulso el botón de reserva de la tarjeta de "Lucía"
    Then se muestra el mensaje "Cita con Lucía el mié 22 a las 16:00"
    And se muestra un botón "Cambiar"

  @s10
  Scenario: "Cambiar" tras confirmar devuelve la tarjeta a su estado inicial
    Given la tarjeta de "Lucía" con una reserva ya confirmada
    When pulso el botón "Cambiar" de la tarjeta de "Lucía"
    Then la tarjeta de "Lucía" vuelve a mostrar el selector de día sin ninguno elegido

  @s11
  Scenario: Avanzar la reseña más allá de la última vuelve a la primera
    Given la tarjeta de "Lucía" mostrando la última reseña de su rotación
    When pulso el botón "→" de reseñas en la tarjeta de "Lucía"
    Then se muestra la primera reseña de su rotación, no un hueco vacío

  @s12
  Scenario: Retroceder la reseña antes de la primera vuelve a la última
    Given la tarjeta de "Lucía" mostrando la primera reseña de su rotación
    When pulso el botón "←" de reseñas en la tarjeta de "Lucía"
    Then se muestra la última reseña de su rotación, no un hueco vacío
