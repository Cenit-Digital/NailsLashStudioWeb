Feature: Selector interactivo de color de esmalte
  Como visitante quiero probar distintos tonos de esmalte sobre una
  ilustración de uñas para elegir mi color antes de la cita.

  # 12 colores verbatim de salon-data.js → colors. No inventar tonos nuevos
  # ni renombrar los existentes (HANDOFF §3 #5).

  @s1
  Scenario: Por defecto está activo el primer color del catálogo
    Given la home renderizada
    When leo el nombre de color activo en la sección "Prueba tu color"
    Then es "Rojo Carmín" y su valor hexadecimal mostrado es "#B11226"

  @s2
  Scenario: Elegir un swatch cambia la ilustración y el nombre mostrado
    Given la sección "Prueba tu color" visible
    When pulso el swatch con nombre accesible "Azul Noche"
    Then el color de fondo de las tres ilustraciones de uña pasa a "#26364f"
    And el nombre mostrado pasa a "Azul Noche" con hexadecimal "#26364F"

  @s3
  Scenario: El swatch activo se distingue visualmente del resto
    Given la sección "Prueba tu color" visible
    When pulso el swatch con nombre accesible "Fucsia"
    Then el swatch "Fucsia" muestra el anillo de selección
    And ningún otro swatch lo muestra

  @s4
  Scenario: El catálogo ofrece los doce colores completos
    Given la sección "Prueba tu color" visible
    When cuento los swatches de color
    Then son exactamente 12: Rojo Carmín, Vino Tinto, Nude Rosado, Rosa Empolvado, Coral Suave, Malva, Champán, Fucsia, Azul Noche, Verde Salvia, Negro Ónix y Blanco Nácar

  @s5
  Scenario: El CTA final enlaza al equipo
    Given la sección "Prueba tu color" visible
    When localizo el enlace "Reservar con este tono"
    Then su href es "#equipo"
