Feature: Preguntas frecuentes
  Como visitante quiero resolver mis dudas más comunes sin tener que
  escribir, para decidir si reservar con confianza.

  # Las 6 preguntas son verbatim de salon-data.js → faq (HANDOFF §3 #11).
  # Acordeón de ÍNDICE ÚNICO: abrir una pregunta cierra la que estuviera
  # abierta — confirmado leyendo la lógica del prototipo (no es independiente
  # por pregunta).

  @s1
  Scenario: Las seis preguntas están colapsadas por defecto
    Given la home renderizada
    When leo la sección "Preguntas frecuentes"
    Then contiene exactamente 6 preguntas y ninguna respuesta está visible

  @s2
  Scenario: Abrir una pregunta muestra su respuesta exacta
    Given la sección de FAQ con todas las preguntas cerradas
    When pulso la pregunta "¿Cómo reservo una cita?"
    Then se muestra la respuesta "Reserva desde el calendario de cada profesional, por el chat de WhatsApp de esta página o llamando al estudio. Confirmamos tu hora al momento."
    And el signo de esa pregunta pasa de "+" a "–"

  @s3
  Scenario: Abrir una segunda pregunta cierra la primera
    Given la pregunta "¿Cómo reservo una cita?" abierta
    When pulso la pregunta "¿Qué formas de pago aceptáis?"
    Then la respuesta de "¿Cómo reservo una cita?" deja de mostrarse
    And se muestra la respuesta de "¿Qué formas de pago aceptáis?"

  @s4
  Scenario: Pulsar de nuevo una pregunta abierta la cierra
    Given la pregunta "¿Cuál es la política de cancelación?" abierta
    When pulso esa misma pregunta
    Then su respuesta deja de mostrarse y el signo vuelve a "+"

  # Gap cubierto aquí y NO presente en el prototipo (HANDOFF §4.1) — sin esto
  # el acordeón no es utilizable con lector de pantalla.
  @s5
  Scenario: Cada pregunta expone su estado a tecnología de asistencia
    Given la sección de FAQ con todas las preguntas cerradas
    When leo el atributo "aria-expanded" del botón de "¿Puedo llevar mi propio diseño?"
    Then es "false", y pasa a "true" al abrir esa pregunta
