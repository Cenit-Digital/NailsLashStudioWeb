# Spec viva de la capacidad `nailbot_ia` (issue #35): Nailbot con IA real DETRÁS DE UN FLAG DE BUILD.
# Decisiones: enmienda N-1bis/N-4bis de project-spec.md, APROBADA por Pablo el 2026-11-18. N-1 y N-4
# siguen rigiendo tal cual el guion local (nailbot_chat_compartido.feature, nailbot_flotante.feature).
# Contrato de la API: POST /v1/chat de Cenit-Digital/RAGchatbotIA (apps/api/src/http/app.ts):
#   petición { texto, conversacionId? } · respuesta { conversacionId, respuesta, solicitud: null | { codigo, enlaceWhatsApp, … } }
# La activación PÚBLICA (poner la variable en el build de Pages) NO está en este contrato: es D-10.
# «Las dos entradas» = la sección #reserva y el diálogo del robot flotante, cada una con su instancia.

Feature: Nailbot con IA detrás de un flag de build
  Como clienta quiero hablar con Nailbot con texto libre cuando el salón active la IA, sabiendo que es
  una IA y sin perder nunca el camino al salón si la IA falla.

  @s1
  Scenario: Sin la variable del build, Nailbot es el de siempre (N-1 y N-4)
    Given un build sin VITE_NAILBOT_API_URL (ausente o en blanco)
    When la clienta abre y usa cualquiera de las dos entradas de Nailbot
    Then ve el mismo HTML, el guion local y la leyenda de demo de siempre
    And no aparece «Asistente de IA» ni campo de texto libre
    And el chat no hace ninguna petición de red
    And el HTML horneado de #reserva lleva la leyenda de demo y no «Asistente de IA»

  @s2
  Scenario: Con la variable, el turno va a POST /v1/chat y el aviso de IA es permanente (N-1bis, N-4bis)
    Given un build con VITE_NAILBOT_API_URL configurada
    Then Nailbot muestra la insignia «Asistente de IA» y la línea «Hablas con un sistema de inteligencia artificial, no con una persona» antes del primer turno
    And el campo de texto libre admite como máximo 1000 caracteres y no se envía vacío ni más largo
    When la clienta envía un mensaje
    Then se llama a POST {url}/v1/chat con { texto } y, desde el segundo turno, con el conversacionId recibido
    And «Escribiendo…» se anuncia en un role=status mientras se espera
    And la respuesta se muestra como texto (nunca como HTML), con el aviso de IA que antepone el servidor
    And la insignia y la línea fija siguen visibles durante toda la conversación
    And mientras hay una petición en curso no se envía otro mensaje

  @s3
  Scenario: Una solicitud solo muestra el enlace de WhatsApp si es de https://wa.me/
    Given una respuesta de la API con una solicitud y su código
    When enlaceWhatsApp empieza por «https://wa.me/»
    Then aparece «Enviar al salón por WhatsApp» con ese enlace y el código de la solicitud
    But si no empieza así, no se pinta ni el enlace ni el código

  @s4
  Scenario: Si la API falla, Nailbot vuelve al guion local con el contacto del salón
    Given que Nailbot está en modo IA
    When la petición falla por red, devuelve 404, 429 o 5xx, o su cuerpo no cumple el contrato
    Then esa instancia vuelve al guion local de N-1/N-4 (leyenda de demo, opciones cerradas)
    And una nota ofrece WhatsApp y el teléfono de src/lib/site.ts
    And no se muestra ninguna traza ni el cuerpo del error
    And no se vuelve a llamar a la API desde esa instancia

  @s5
  Scenario: Si la API tarda más de 75 segundos, Nailbot vuelve al guion local
    Given que Nailbot está en modo IA y espera una respuesta
    When pasan 75 segundos sin respuesta
    Then la petición se cancela y Nailbot vuelve al guion local con la nota de contacto
    But al desmontarse el chat se cancela la petición sin mostrar el guion

  @s6
  Scenario: El identificador de conversación vive solo en memoria (N-4bis)
    Given un build con VITE_NAILBOT_API_URL configurada
    When la clienta mantiene una conversación
    Then el conversacionId se guarda solo en memoria de esa instancia
    And no se usa sessionStorage, localStorage ni cookies, ni se pide el teléfono
    And las dos entradas no comparten conversación
