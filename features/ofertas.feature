Feature: Promociones del mes
  Como visitante quiero ver las ofertas activas con su ahorro para
  aprovecharlas al reservar.

  # Datos verbatim de salon-data.js → offers. El formato del badge NO es
  # uniforme por diseño (porcentaje / ahorro absoluto / restricción temporal)
  # — no tipar ni normalizar (HANDOFF §3 #7).

  @s1
  Scenario: Se muestran las tres ofertas del mes
    Given la home renderizada
    When leo la sección "Ofertas"
    Then contiene las tarjetas "Pack Manos Perfectas", "Dúo Uñas + Pestañas" y "Martes de Facial", en ese orden

  @s2
  Scenario: "Pack Manos Perfectas" muestra precio, precio anterior y badge exactos
    Given la home renderizada
    When leo la tarjeta "Pack Manos Perfectas"
    Then su precio es "29 €", su precio anterior tachado es "35 €" y su badge es "−17%"

  @s3
  Scenario: "Dúo Uñas + Pestañas" muestra precio, precio anterior y badge exactos
    Given la home renderizada
    When leo la tarjeta "Dúo Uñas + Pestañas"
    Then su precio es "55 €", su precio anterior tachado es "65 €" y su badge es "Ahorra 10 €"

  @s4
  Scenario: "Martes de Facial" muestra precio, precio anterior y badge exactos
    Given la home renderizada
    When leo la tarjeta "Martes de Facial"
    Then su precio es "32 €", su precio anterior tachado es "40 €" y su badge es "Solo martes"

  @s5
  Scenario: Cada oferta enlaza al equipo
    Given la home renderizada
    When localizo el enlace "Reservar oferta" de la tarjeta "Pack Manos Perfectas"
    Then su href es "#equipo"
