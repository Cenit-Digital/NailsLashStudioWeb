Feature: Categorías de servicios con precios
  Como visitante quiero ver qué servicios ofrece cada categoría y su precio
  para decidir qué reservar antes de contactar.

  # Datos verbatim de salon-data.js → categories. No redondear ni inventar
  # ningún precio (HANDOFF §3 #4).

  @s1
  Scenario: La sección "Uñas" muestra sus seis servicios y precios
    Given la home renderizada
    When leo la lista de precios de la sección "#unas"
    Then contiene, en este orden: "Manicura semipermanente" a "25 €", "Manicura rusa completa" a "30 €", "Uñas acrílicas o gel" a "40 €", "Relleno acrílico o gel" a "32 €", "Pedicura spa completa" a "35 €" y "Nail art y diseño" a "desde 5 €"

  @s2
  Scenario: La sección "Facial" muestra sus seis servicios y precios
    Given la home renderizada
    When leo la lista de precios de la sección "#facial"
    Then contiene, en este orden: "Limpieza facial profunda" a "40 €", "Tratamiento hidratante" a "45 €", "Peeling y luminosidad" a "50 €", "Lifting de pestañas" a "35 €", "Diseño de cejas" a "15 €" y "Tinte de pestañas" a "12 €"

  @s3
  Scenario: La sección "Depilación" muestra sus seis servicios y precios
    Given la home renderizada
    When leo la lista de precios de la sección "#depilacion"
    Then contiene, en este orden: "Cejas" a "8 €", "Labio superior" a "6 €", "Axilas" a "12 €", "Medias piernas" a "18 €", "Piernas completas" a "28 €" e "Ingles o cavado" a "15 €"

  @s4
  Scenario: El precio de "Nail art y diseño" se muestra como texto libre, no como número
    Given la home renderizada
    When leo el precio de "Nail art y diseño" en la sección "#unas"
    Then el texto mostrado es exactamente "desde 5 €"

  @s5
  Scenario: El botón de reserva de cada categoría enlaza al equipo
    Given la home renderizada
    When localizo el botón "Reservar Uñas" de la sección "#unas"
    Then es un enlace cuyo href es "#equipo"
