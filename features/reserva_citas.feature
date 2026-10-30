# Spec viva de la capacidad `reserva_citas` (Feature 29 de project-spec.md; issue de la Fase 4).
# Decisiones de base: D-12 (dos vías que conviven), D-13 (solo dos botones), T-8 (backend propio),
# A-32 (OAuth; Calendar acepta solapes → bloqueo propio). Catálogo: src/lib/citas/catalogo.ts (#30).
#
# ESTADO: ✅ APROBADO POR PABLO EL 2026-10-30 (puerta humana, issue #32), con las propuestas P1-P5
# tal como están escritas. Las marcas «PROPUESTA (Px)» quedan como referencia a esas decisiones.
#
# FUERA DE ALCANCE DEL MVP: que la clienta cancele o cambie la cita sola, WhatsApp automático, elegir
# profesional, pagos o señal, integración con Treatwell y cualquier puente con la vía de chat (D-12).

Feature: Reserva de citas en línea
  Como clienta del salón quiero reservar una cita desde el móvil eligiendo servicio, día y hora libres,
  para tenerla confirmada al momento; y como dueña del salón quiero verla al instante en el calendario
  de las tablets.

  # ── Entrada al modal (D-13) ─────────────────────────────────────────────────────────────────

  @s1
  Scenario: «Reservar» de la cabecera abre el modal de citas
    Given la página de inicio cargada en un móvil
    When la clienta pulsa el botón «Reservar» de la cabecera
    Then se abre un diálogo modal con el título «Reserva tu cita» (PROPUESTA P1)
    And el foco está en ese título
    And el paso visible es «Servicio», indicado como «Paso 1 de 4»

  @s2
  Scenario: «Reservar cita» del hero abre el mismo modal
    Given la página de inicio cargada
    When la clienta pulsa «Reservar cita» en la cabecera de la página (hero)
    Then se abre el mismo diálogo «Reserva tu cita» en el paso «Servicio»

  @s3
  Scenario: la vía de chat no cambia
    Given la página de inicio cargada
    When la clienta pulsa el enlace «Reserva» de la navegación
    Then la página se desplaza a la sección «¿Prefieres reservar por chat?»
    And no se abre ningún diálogo de citas
    And el robot Nailbot, el botón «WhatsApp» y «Llamar al estudio» siguen presentes y sin cambios

  @s4
  Scenario: sin JavaScript los dos botones siguen llevando a algún sitio
    Given el HTML horneado de la página, antes de que cargue JavaScript
    When se leen los dos botones de D-13
    Then ambos son enlaces a «#reserva-titulo», la sección de reserva por chat (PROPUESTA P2: igual que hoy)
    And tras cargar JavaScript los dos abren el modal en vez de desplazar la página

  @s5
  Scenario Outline: cerrar el modal devuelve el foco al botón que lo abrió
    Given el modal abierto desde «<boton>»
    When la clienta lo cierra con <accion>
    Then el diálogo se cierra
    And el foco vuelve a «<boton>»
    And al volver a abrirlo empieza de nuevo en el paso «Servicio»

    Examples:
      | boton          | accion                |
      | Reservar       | el botón «Cerrar» (×) |
      | Reservar cita  | la tecla Escape       |

  @s6
  Scenario: en el móvil el modal ocupa la pantalla y es cómodo de tocar
    Given una pantalla de 390 px de ancho
    When se abre el modal
    Then el diálogo ocupa todo el ancho y todo el alto visibles
    And cada botón y cada opción mide al menos 44 × 44 px
    And no aparece desplazamiento horizontal

  # ── Paso 1: Servicio (categoría → subservicio → una opción) ───────────────────────────────

  @s7
  Scenario: las categorías que se reservan en línea
    Given el modal abierto en el paso «Servicio»
    When la clienta mira las categorías
    Then ve, en este orden, «Manicura», «Pedicura», «Depilación», «Retirada» y «Manipedi»

  @s8
  Scenario: los subservicios de una categoría excluyen lo que no se reserva en línea
    Given el paso «Servicio»
    When la clienta elige «Manicura»
    Then ve «Manicura Completa con Base Proteínica (Técnica Rusa)» entre los subservicios
    And no ve «Reparación de Uña Rota»

  @s9
  Scenario: las opciones muestran precio y duración, y se avisa de que son provisionales
    Given la clienta ha elegido «Manicura Completa con Base Proteínica (Técnica Rusa)»
    When mira sus opciones
    Then ve la pregunta «Selecciona el largo de tu uña:»
    And ve la opción «Uña Mediana · 29 € · 1 h»
    And no ve «Uña Extra Larga»
    And ve el aviso «Precios y duraciones orientativos, pendientes de confirmar con el salón» (PROPUESTA P3)

  @s10
  Scenario: sin opción elegida no se puede avanzar
    Given la clienta ha elegido categoría y subservicio pero ninguna opción
    When intenta pasar al paso siguiente
    Then el botón «Continuar» está desactivado
    And el paso sigue siendo «Servicio»

  # ── Paso 2: Día · Paso 3: Hora (disponibilidad real) ──────────────────────────────────────

  @s11
  Scenario: los días se muestran en hora de Madrid y los no disponibles se marcan con texto
    Given la clienta ha elegido «Uña Mediana» (60 min)
    And el dispositivo está configurado en otra zona horaria
    When el modal muestra el paso «Día»
    Then los días son los de los próximos 30 días según la hora de Madrid
    And cada domingo aparece desactivado con el texto «Cerrado»
    And cada día sin ningún hueco de 60 min aparece desactivado con el texto «Completo»
    And el día elegido se distingue también por algo distinto del color

  @s12
  Scenario: un día con algún hueco suficiente no sale «Completo»
    Given un día laborable con citas de 10:00 a 13:00 y de 14:00 a 20:00
    When la clienta busca un servicio de 60 min
    Then ese día aparece disponible
    And en el paso «Hora» ofrece las 13:00

  @s13
  Scenario: las horas cumplen horario, duración y antelación
    Given un sábado sin citas (el salón abre de 10:00 a 14:00)
    And la clienta ha elegido un servicio de 60 min
    When mira las horas de ese sábado
    Then se ofrecen 10:00, 10:30, 11:00, 11:30, 12:00, 12:30 y 13:00
    And no se ofrece 13:30, porque terminaría después del cierre

  @s14
  Scenario: no se ofrecen horas con menos de 2 h de antelación
    Given hoy es lunes a las 11:10 en Madrid y no hay citas
    When la clienta mira las horas de hoy para un servicio de 30 min
    Then la primera hora ofrecida es las 13:30

  @s15
  Scenario: una hora está libre si alguna trabajadora está libre toda la duración
    Given dos trabajadoras; la 1 ocupada de 10:00 a 11:00 y la 2 ocupada de 10:30 a 11:30
    When la clienta busca 60 min ese día
    Then no se ofrecen las 10:00 ni las 10:30
    And sí se ofrece las 11:00, porque la trabajadora 1 queda libre de 11:00 a 12:00

  @s16
  Scenario: las citas que el salón apunta a mano también ocupan
    Given el salón ha creado en su calendario un evento «Ocupado» de 16:00 a 18:00
    When la clienta mira las horas de ese día
    Then ninguna hora que se solape con 16:00–18:00 se ofrece

  # ── Paso 4: Tus datos ─────────────────────────────────────────────────────────────────────

  @s17
  Scenario: los datos que se piden y el aviso de privacidad
    Given la clienta ha elegido servicio, día y hora
    When llega al paso «Tus datos»
    Then se le piden solo «Nombre», «Teléfono» y «Email», los tres obligatorios
    And junto al botón ve el aviso de privacidad de capa 1 con responsable, finalidad, derechos y enlace a la política (PROPUESTA P4)
    And no hay ningún campo de texto libre

  @s18
  Scenario Outline: un dato inválido se explica junto a su campo y no deja avanzar
    Given el paso «Tus datos»
    When la clienta escribe <campo> «<valor>» y pulsa «Revisar la cita»
    Then junto a <campo> aparece el mensaje «<mensaje>»
    And el paso sigue siendo «Tus datos»

    Examples:
      | campo    | valor     | mensaje                                   |
      | Email    | ana@      | Escribe un email válido, como ana@mail.es |
      | Teléfono | 12        | Escribe un teléfono de al menos 9 cifras  |
      | Nombre   |           | Escribe tu nombre                         |

  # ── Confirmación ──────────────────────────────────────────────────────────────────────────

  @s19
  Scenario: antes de confirmar se ve el resumen completo
    Given la clienta ha rellenado datos válidos
    When pulsa «Revisar la cita»
    Then ve el servicio, el día, la hora de inicio y de fin, la duración y el precio
    And ve el botón «Confirmar cita»

  @s20
  Scenario: confirmar crea la cita en el calendario y lo dice
    Given el resumen de «Manicura · Uña Mediana» el martes 3 de noviembre a las 10:00, a nombre de «Ana»
    And la trabajadora 1 está libre
    When la clienta pulsa «Confirmar cita»
    Then en el calendario de la trabajadora 1 aparece un evento de 10:00 a 11:00 titulado «Manicura · Manicura Completa con Base Proteínica (Técnica Rusa) (Uña Mediana) — Ana»
    And la clienta ve «¡Cita confirmada!» con el resumen
    And ve que le llegará un email de confirmación

  @s21
  Scenario: la confirmación llega por email a la clienta y al salón
    Given una cita recién confirmada
    When se envían los avisos
    Then la clienta recibe un email con servicio, día, hora, dirección del salón y cómo cancelar (llamando al salón)
    And el salón recibe un email con el mismo resumen y el teléfono y email de la clienta

  @s22
  Scenario: si el hueco se ocupa mientras rellena los datos, se avisa y no se crea nada
    Given la clienta está en el resumen de las 10:00
    And entretanto esa hora se ha ocupado en todos los calendarios
    When pulsa «Confirmar cita»
    Then ve «Esa hora acaba de ocuparse. Elige otra, por favor.»
    And vuelve al paso «Hora» con las horas actualizadas
    And no se ha creado ningún evento nuevo

  @s23
  Scenario: dos confirmaciones a la vez por el último hueco
    Given una sola trabajadora con un único hueco libre a las 12:00
    When dos clientas confirman las 12:00 a la vez
    Then exactamente una cita queda creada
    And la otra clienta ve el aviso de @s22

  @s24
  Scenario: pulsar dos veces «Confirmar cita» crea una sola cita
    Given el resumen de una cita libre
    When la clienta pulsa «Confirmar cita» dos veces seguidas
    Then en el calendario hay un solo evento para esa reserva

  @s25
  Scenario: si el servidor no responde, la clienta no se queda sin salida
    Given el servidor de citas no responde
    When la clienta pulsa «Confirmar cita»
    Then ve «No hemos podido completar la reserva. Inténtalo de nuevo o llámanos al 625 22 33 66.» (PROPUESTA P5)
    And ve un botón «Reintentar» que conserva todo lo que eligió
    And ve un enlace para llamar al estudio
    And no se la deriva al chat (D-12)

  # ── Seguridad del servidor ────────────────────────────────────────────────────────────────

  @s26
  Scenario: una petición que no supera la verificación anti-bots se rechaza
    Given una petición de reserva sin una verificación válida de Cloudflare Turnstile
    When llega al servidor
    Then se rechaza con un error
    And no se crea ningún evento

  @s27
  Scenario: una opción que no existe o no se reserva en línea se rechaza
    Given una petición de reserva con la opción «manicura-rusa-xl-xxl»
    When llega al servidor
    Then se rechaza con un error de petición inválida
    And no se crea ningún evento

  @s28
  Scenario: la web publicada no contiene ninguna clave y el servidor solo atiende a la web
    Given el sitio construido para GitHub Pages
    When se busca en todo su HTML y JavaScript
    Then no aparece ningún secreto de Google, del correo ni de Turnstile (solo la clave pública de Turnstile)
    And el servidor rechaza las peticiones con un origen distinto de https://cenit-digital.github.io
