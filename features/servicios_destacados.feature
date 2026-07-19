Feature: Servicios estrella
  Como visitante quiero ver de un vistazo los servicios más recomendados
  para orientar mi elección si no sé por dónde empezar.

  # Datos verbatim de salon-data.js → starServices. Sección puramente
  # informativa, sin estado ni enlaces (HANDOFF §3 #6).

  @s1
  Scenario: Se muestran las cuatro tarjetas de servicio estrella
    Given la home renderizada
    When leo la sección "Destacados"
    Then contiene, en este orden, las tarjetas "Manicura rusa" (tag "Top ventas"), "Uñas acrílicas a medida" (tag "Favorito"), "Limpieza facial premium" (tag "Recomendado") y "Lifting de pestañas" (tag "Tendencia")

  @s2
  Scenario: Cada tarjeta muestra su descripción exacta
    Given la home renderizada
    When leo la tarjeta "Manicura rusa" de la sección "Destacados"
    Then su descripción es "La más pedida: acabado ultra limpio y durabilidad de semanas."
