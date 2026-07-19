Feature: Pie de página
  Como visitante quiero encontrar en el pie los enlaces y datos de contacto
  básicos, para volver a cualquier sección o contactar sin subir arriba.

  # "Plantilla de demostración" y el año fijo "2026" son marcas del propio
  # prototipo de Claude Design — NO deben llegar a producción (HANDOFF §3 #12).
  # Patrón de año dinámico: igual que WebEmpresa/src/components/Footer.tsx.

  @s1
  Scenario: El pie muestra el año actual calculado, no un literal fijo
    Given la fecha del sistema es cualquier año futuro, por ejemplo 2027
    When renderizo el pie de página
    Then el copyright muestra "© 2027", coincidiendo con el año del sistema

  @s2
  Scenario: El pie no contiene texto de plantilla de demostración
    Given la home renderizada
    When leo el texto completo del pie de página
    Then no contiene la cadena "Plantilla de demostración"

  @s3
  Scenario: El pie enlaza a las tres categorías de servicio y a reservar
    Given la home renderizada
    When leo la columna "Servicios" del pie
    Then contiene enlaces "Uñas", "Facial", "Depilación" y "Reservar" cuyos href son "#unas", "#facial", "#depilacion" y "#equipo"

  @s4
  Scenario: El pie muestra los datos de contacto vigentes
    Given la home renderizada
    When leo la columna "Contacto" del pie
    Then el teléfono y el Instagram mostrados coinciden con los datos de contacto vigentes
