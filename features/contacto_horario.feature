Feature: Horario, ubicación y contacto
  Como visitante quiero saber cuándo puedo visitar el salón y cómo
  contactar directamente, para planificar mi visita o escribir ya.

  # Horario verbatim de salon-data.js → hours. Datos de contacto (dirección,
  # teléfono, email) son PLACEHOLDER de demo en el prototipo — sustituir por
  # los reales antes de publicar (HANDOFF §4.4). El teléfono debe tener una
  # única fuente; el prototipo lo repite como literal 7 veces (defecto real a
  # corregir, HANDOFF §3 #10) — por eso el @s3 se contrata en relación al dato
  # de contacto, no como literal duplicado.

  @s1
  Scenario: El horario se muestra completo y en orden
    Given la home renderizada
    When leo la sección "Horario y ubicación"
    Then muestra, en este orden, "Lunes – Viernes" con "10:00 – 20:00", "Sábado" con "10:00 – 15:00" y "Domingo" con "Cerrado"

  @s2
  Scenario: El botón de WhatsApp usa el número de contacto vigente
    Given la home renderizada
    When localizo el enlace "Escríbenos por WhatsApp"
    Then su href apunta a "wa.me" seguido del número de teléfono de contacto vigente, sin dígitos adicionales

  @s3
  Scenario: El enlace de teléfono usa el mismo número que el de WhatsApp
    Given la home renderizada
    When comparo el número del enlace "tel:" con el del enlace de WhatsApp
    Then ambos citan el mismo número de contacto vigente

  @s4
  Scenario: La dirección se muestra tal como está configurada
    Given la home renderizada
    When leo el bloque de dirección de la sección de contacto
    Then el texto coincide exactamente con el valor configurado en el dato de contacto
