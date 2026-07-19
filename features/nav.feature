Feature: Cabecera y navegación por anclas
  Como visitante quiero llegar a cualquier sección desde la cabecera para
  moverme por la página sin perder tiempo haciendo scroll manual.

  # Navegación móvil (<767px, MOBILE_QUERY de WebEmpresa/src/lib/useIsMobile.ts):
  # el prototipo NO incluye un patrón equivalente al MobileMenu de WebEmpresa.
  # Es un contrato pendiente (HANDOFF §4.3) — NO se especifica aquí a propósito,
  # para no inventarlo. Añadir un nuevo Feature "nav_movil" cuando se decida.

  @s1
  Scenario: El wordmark enlaza al inicio
    Given la home renderizada
    When localizo el wordmark "nails lash studio" de la cabecera
    Then es un enlace cuyo href es "#top"

  @s2
  Scenario: La navegación muestra los seis enlaces en el orden del catálogo
    Given la home renderizada
    When inspecciono la navegación de la cabecera
    Then existen enlaces con nombre "Uñas", "Facial", "Depilación", "Destacados", "Ofertas" y "Equipo", en ese orden
    And sus href son "#unas", "#facial", "#depilacion", "#destacados", "#ofertas" y "#equipo" respectivamente

  @s3
  Scenario: El botón "Reservar" de la cabecera enlaza al equipo
    Given la home renderizada
    When localizo el botón "Reservar" de la cabecera
    Then es un enlace cuyo href es "#equipo"

  @s4
  Scenario: La cabecera permanece fija al hacer scroll
    Given la home renderizada
    When leo el estilo calculado de la cabecera
    Then su "position" es "sticky" y su "top" es "0px"

  @s5
  Scenario: Cada sección deja margen para no quedar tapada por la cabecera al navegar por ancla
    Given la home renderizada
    When leo el "scroll-margin-top" calculado de la sección "#unas"
    Then es mayor o igual a la altura de la cabecera
