Feature: Tokens de marca, tipografía y assets base
  Como visitante quiero ver una identidad visual coherente (color, tipografía)
  en todo el sitio, para percibir un negocio cuidado y profesional.

  # Paleta activa: 1a · Rosa monocromo (HANDOFF §5, decidido 19/07/2026).
  # 1b y 1c NO se implementan — quedan solo como referencia en _tokens.scss.
  # Fuente de verdad de valores: NAILSLASHSTUDIO_HANDOFF.md §2.

  @s1
  Scenario: El acento de marca es el token de la paleta Rosa
    Given la home renderizada
    When leo el color de fondo calculado del botón "Reservar" de la cabecera
    Then es exactamente "#c05576"

  @s2
  Scenario: El wordmark de la cabecera usa la tipografía de titular
    Given la home renderizada
    When leo la familia tipográfica calculada del wordmark "nails lash studio"
    Then contiene "Gilda Display"

  @s3
  Scenario: El titular manuscrito del hero usa la tipografía script
    Given la home renderizada
    When leo la familia tipográfica calculada del texto "Nails Lash" del hero
    Then contiene "Great Vibes"

  @s4
  Scenario: "Studio" bajo el titular usa la tipografía de interfaz
    Given la home renderizada
    When leo la familia tipográfica calculada del texto "Studio" del hero
    Then contiene "Manrope"

  @s5
  Scenario: Los fondos alternos de sección usan el token de superficie secundaria
    Given la home renderizada
    When leo el color de fondo calculado de la sección "Prueba tu color"
    Then es exactamente "#fbe7ef"
