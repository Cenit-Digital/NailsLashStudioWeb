# ============================================================================
# BORRADOR — feature #14, status "pending" en feature_list.json.
# Origen: nota de Drive del 8/07/2026 ("encima del FAQ, reseñas"). NO está en
# el bundle de Claude Design de hoy (HANDOFF §3 #14) — no ha pasado la puerta
# humana como spec_ready todavía.
#
# Lo que SÍ está determinado (y por eso tiene escenario abajo):
#   - Posición: antes de la sección FAQ.
#   - Contenido disponible: las 10 reseñas completas de salon-data.js →
#     reviewPool (autor + texto), ninguna inventada.
#
# Lo que NO está determinado — no escribo escenarios para esto, se añadirían
# aquí en cuanto Pablo confirme:
#   - Layout: ¿rejilla estática de las 10, o carrusel/rotación?
#   - ¿Se muestran las 10 a la vez o un subconjunto con "ver más"?
#   - ¿Controles de navegación, si es carrusel?
# ============================================================================
Feature: Sección de reseñas antes del FAQ
  Como visitante quiero ver reseñas reales del negocio antes de llegar a las
  preguntas frecuentes, para reforzar mi confianza justo antes de decidir.

  @s1
  Scenario: La sección de reseñas aparece antes del FAQ en el documento
    Given la home renderizada
    When comparo la posición de la sección de reseñas con la de "Preguntas frecuentes"
    Then la sección de reseñas precede a la sección de FAQ en el orden del documento

  @s2
  Scenario: El contenido disponible son las diez reseñas del catálogo, sin inventar ninguna
    Given la sección de reseñas renderizada
    When leo los autores mostrados
    Then todos pertenecen al conjunto: María L., Elena R., Cristina P., Sonia G., Beatriz M., Raquel D., Laura F., Patricia V., Nuria S. y Alba C.
