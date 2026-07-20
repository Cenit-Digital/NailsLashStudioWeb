# ============================================================================
# BORRADOR — feature #13, status "pending" en feature_list.json.
# Origen: nota de Drive del 8/07/2026 ("Carrusel de imágenes antes del
# chatbot"). NO está en el bundle de Claude Design de hoy (HANDOFF §3 #13) —
# no ha pasado la puerta humana como spec_ready todavía.
#
# Lo único determinado por la nota es la posición relativa (antes del chat de
# reserva). Todo lo demás requiere conversación con Pablo antes de que
# gherkin_author pueda escribir escenarios de verdad:
#   - ¿Contenido? (trabajos/resultados vs. instalaciones del salón)
#   - ¿Autoplay o solo navegación manual? Si autoplay, ¿se pausa al enfocar?
#   - ¿Cuántas imágenes de partida y de dónde salen (cliente vs. stock)?
#
# Sin esas respuestas escribir escenarios de comportamiento sería inventar el
# contrato — no lo hago. Un único escenario de posición, que sí es seguro.
# ============================================================================
Feature: Carrusel de imágenes antes de la reserva por chat
  Como visitante quiero ver ejemplos visuales del trabajo del salón justo
  antes de reservar, para decidir con más confianza.

  @s1
  Scenario: El carrusel aparece antes de la sección de reserva por chat
    Given la home renderizada
    When comparo la posición del carrusel de imágenes con la de la sección "Reserva rápida"
    Then el carrusel de imágenes precede a la sección "Reserva rápida" en el orden del documento
