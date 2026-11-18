Feature: Nailbot con IA detrás de un flag de build

  Scenario: El build sin flag conserva la demo (N-1 y N-4)
    Given que VITE_NAILBOT_API_URL no está configurada
    When la clienta abre y usa cualquiera de las dos instancias de Nailbot
    Then ve el mismo HTML y guion local de la demo
    And el chat no hace peticiones de red

  Scenario: El modo IA envía el turno y conserva el identificador en memoria
    Given un build con VITE_NAILBOT_API_URL configurada
    When la clienta envía texto libre de hasta 1000 caracteres
    Then se envía POST /v1/chat con texto y el ID de conversación si existe
    And se anuncia «Escribiendo…» mientras se espera la respuesta
    And se presenta la respuesta como texto
    And el aviso de IA permanece visible durante la conversación

  Scenario: Una solicitud incluye un destino seguro de WhatsApp
    Given una respuesta de la API con una solicitud y su código
    When el enlace usa el origen https://wa.me
    Then aparece «Enviar al salón por WhatsApp» con el código
    And se omite el enlace si su origen no está permitido

  Scenario: La API no responde correctamente
    Given que el chat está en modo IA
    When la petición falla o recibe un estado 429 o 5xx
    Then se ofrece el WhatsApp y el teléfono del salón
    And no se muestra la traza del error
