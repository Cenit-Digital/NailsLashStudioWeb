Feature: Chat de reserva guiado
  Como visitante quiero reservar respondiendo unas pocas preguntas en un
  chat, sin rellenar un formulario largo, para completar mi solicitud en
  segundos.

  # Guion fijo de 4 pasos verbatim de salon-data.js → chatFlow. NO es un
  # chatbot con IA — ninguna respuesta del bot depende del texto libre salvo
  # el nombre, que solo se interpola en el resumen final (HANDOFF §3 #9).
  # Alcance de esta feature: el widget de front-end. Si se conecta a
  # WhatsApp Business real, es una feature de arquitectura distinta — no
  # confundir el alcance (ver HANDOFF §3 #9, decisión pendiente).

  @s1
  Scenario: El primer mensaje ofrece las cuatro opciones de servicio
    Given la home recién cargada
    When leo el chat de la sección "Reserva rápida"
    Then el primer mensaje del bot es "¡Hola! Soy el asistente de nails lash studio ✨ ¿Qué te gustaría reservar?"
    And las opciones mostradas son "Uñas", "Facial", "Depilación" y "Pestañas"

  @s2
  Scenario: Elegir una opción encadena la siguiente pregunta
    Given el chat en su primer paso
    When pulso la opción "Uñas"
    Then aparece un mensaje de usuario "Uñas"
    And el siguiente mensaje del bot es "¡Perfecto! ¿Qué día te viene mejor?"

  @s3
  Scenario: Las tres primeras preguntas ofrecen las opciones del guion
    Given el chat en su segundo paso
    When leo las opciones mostradas
    Then son "Entre semana", "Este fin de semana" y "Lo antes posible"

  @s4
  Scenario: El último paso pide el nombre por texto libre
    Given el chat en su cuarto paso
    When leo el campo de entrada del chat
    Then su placeholder es "Escribe tu nombre…" y no muestra botones de opción

  @s5
  Scenario: Enviar el nombre vacío no añade ningún mensaje
    Given el chat en su cuarto paso con el campo de nombre vacío
    When pulso el botón de enviar del chat
    Then no se añade ningún mensaje nuevo al historial

  @s6
  Scenario: Completar el guion muestra el resumen interpolado
    Given el chat con servicio "Uñas", día "Entre semana" y franja "Por la mañana" ya elegidos
    When escribo el nombre "Marta" y pulso enviar
    Then el mensaje final es "¡Gracias, Marta! ✨ Tu solicitud: Uñas · Entre semana · Por la mañana. Te confirmaremos la hora exacta por WhatsApp en unos minutos. ¡Te esperamos en nails lash studio!"

  @s7
  Scenario: "Reservar otra cita" reinicia el guion sin rastro de respuestas previas
    Given el chat con el resumen final ya mostrado
    When pulso el botón "Reservar otra cita"
    Then el historial vuelve a mostrar únicamente el primer mensaje del bot

  @s8
  Scenario: Pulsar Enter en el campo de nombre envía igual que el botón
    Given el chat en su cuarto paso con el nombre "Marta" escrito
    When pulso la tecla Enter
    Then se envía el mensaje igual que si hubiera pulsado el botón de enviar

  @s9
  Scenario: El historial se desplaza automáticamente al último mensaje
    Given un chat con suficientes mensajes para desbordar el alto visible
    When se añade un nuevo mensaje
    Then el contenedor de mensajes queda desplazado hasta mostrar ese último mensaje
