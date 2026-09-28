# 02 — WhatsApp: click-to-chat hoy, chatbot con IA (Cloud API) mañana

> **Fecha de la investigación y de acceso a todas las fuentes:** 2026-09-27.
> **Alcance:** solo documentación oficial de Meta/WhatsApp (faq.whatsapp.com,
> business.whatsapp.com, developers.facebook.com, whatsapp.com/legal y sus
> redirecciones oficiales). Cada afirmación lleva una referencia `[F#]` a la
> tabla de fuentes del final (URL + fecha «Updated» que muestra la página +
> fecha de acceso).
> **Convenciones:**
>
> - Lo no confirmable en fuente oficial va marcado **NO CONFIRMADO**.
> - Lo que es interpretación o recomendación propia va marcado _(interpretación)_.
> - Por la norma de derechos de autor que sigue el investigador, las fuentes se
>   dan como **paráfrasis fiel** en castellano (con URL y fecha), y solo hay
>   **una cita literal** en todo el documento (sección 2.9). Los nombres de
>   parámetros, URLs y cuerpos JSON son identificadores técnicos, no citas.
> - Varias páginas de developers.facebook.com se sirven en castellano traducido
>   por IA; los datos clave se contrastaron con la versión inglesa (`?locale=en_US`).

---

## Resumen ejecutivo

1. **Click to chat (`wa.me`) sigue vigente y es oficial en 2026**: formato
   `https://wa.me/<número>` y `https://wa.me/<número>?text=<texto-urlencoded>`,
   número completo en formato internacional sin `+`, ceros, paréntesis ni
   guiones [F1]. Es lo único que la web estática puede hacer hoy.
2. **Un bot en WhatsApp exige servidor**: Meta entrega los mensajes entrantes
   por _webhook_ a un endpoint HTTPS público con certificado válido, verificado
   con `hub.verify_token`/`hub.challenge` y firmado con `X-Hub-Signature-256`
   (HMAC-SHA256 con el _app secret_) [F5]. GitHub Pages no puede cumplir esto.
3. **Ventana de atención de 24 h**: dentro, respuestas libres (texto, botones,
   listas, Flows…); fuera, solo plantillas aprobadas [F7]. Un bot reactivo vive
   dentro de la ventana; los recordatorios de cita del día siguiente requieren
   plantilla (utilidad).
4. **⚠ Cambio de precios inminente (1-oct-2026, dentro de 4 días)**: los
   mensajes de servicio (respuestas libres, p. ej. las del bot) **pasan a
   cobrarse** a la tarifa de utilidad/autenticación del mercado, con un
   **tramo gratuito de 1.000 mensajes de servicio entregados al mes por número**;
   y las plantillas de utilidad dentro de la ventana también se cobran [F10][F11].
   Sin método de pago, Meta deja de entregar mensajes de servicio una vez
   agotado el tramo gratuito [F10][F11].
5. **Coexistence (mismo número en la app WhatsApp Business del móvil y en la
   Cloud API) está disponible en España** (UE/EEE/Reino Unido añadidos el
   23-oct-2025) [F14], pero **solo se activa a través de un Solution Partner o
   Tech Provider** vía Embedded Signup [F13], y desactiva algunas funciones de
   la app (listas de difusión, mensajes temporales, «ver una vez», ubicación en
   tiempo real) [F13].
6. **Política**: se permite automatizar dentro de la ventana de 24 h siempre
   que haya vías de escalado a humano claras [F26]. Las Condiciones de Meta
   (§4.7, 23-sep-2026) prohíben a «Proveedores de IA» usar la plataforma cuando
   la IA es la funcionalidad principal [F27]; el asistente de un salón, donde la
   IA es auxiliar, _parece_ fuera de esa prohibición _(interpretación; Meta
   decide a su criterio → **NO CONFIRMADO**)_.
7. **On-Premises API está muerta**: la última versión caducó el 23-oct-2025; solo
   existe la Cloud API [F19].
8. **Identidad del usuario**: desde abril de 2026 los webhooks traen un
   _business-scoped user ID_ (BSUID, `user_id`) y el teléfono puede no venir si
   el cliente usa nombre de usuario [F22]. El bot debe indexar conversaciones
   por BSUID.
9. **Indicador «escribiendo…» y marcar como leído** existen vía API (una sola
   llamada; el indicador dura hasta la respuesta o 25 s) [F20][F21].

---

## 1. Click to chat

### 1.1 Formato oficial del enlace

| Caso                                                                             | Formato oficial [F1]                                        |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Abrir chat con un número                                                         | `https://wa.me/<number>`                                    |
| Abrir chat con mensaje precargado                                                | `https://wa.me/<whatsappphonenumber>?text=<urlencodedtext>` |
| Solo mensaje precargado (el usuario elige destinatario de su lista de contactos) | `https://wa.me/?text=<urlencodedtext>`                      |

- El texto debe ir **codificado para URL** (URL-encoded); el propio ejemplo de la
  FAQ codifica los espacios como `%20` [F1].
- El mensaje precargado aparece automáticamente en el campo de texto del chat;
  **no se envía solo**: el usuario tiene que pulsar enviar [F1] _(lo de «no se
  envía solo» es deducción de «aparece en el campo de texto»; interpretación)_.

### 1.2 Requisitos del número

- Número **completo en formato internacional** [F1].
- La FAQ indica **omitir ceros, paréntesis y guiones** al escribirlo en formato
  internacional [F1].
- Ejemplo «correcto» de la FAQ: `https://wa.me/1XXXXXXXXXX`; ejemplo
  «incorrecto»: `https://wa.me/+001-(XXX)XXXXXXX` → es decir, **sin `+`, sin
  prefijo `00`, sin paréntesis ni guiones** [F1].
- Aplicado a España _(interpretación)_: prefijo `34` + los 9 dígitos del número
  → `https://wa.me/34XXXXXXXXX`. La FAQ no detalla qué «ceros» exactamente
  (se entiende el `00` de marcación internacional o un 0 troncal nacional; en
  España no hay 0 troncal).
- El destinatario debe tener una **cuenta de WhatsApp activa** [F1].

### 1.3 Comportamiento por plataforma

- La FAQ afirma que click to chat **funciona tanto en el teléfono como en
  WhatsApp Web** [F1].
- Para los _short links_ de la app WhatsApp Business (formato distinto, ver
  1.5), la FAQ describe: si el cliente tiene WhatsApp instalado se abre el chat
  directamente; **desde un navegador web** se muestra una página con la
  información del negocio y un botón «Continue to chat» [F2].
- **NO CONFIRMADO** en fuente oficial: el comportamiento exacto de un enlace
  `wa.me/<número>` en escritorio (página intermedia de `api.whatsapp.com`,
  apertura de la app de escritorio vs. WhatsApp Web, comportamiento si no hay
  WhatsApp instalado). La FAQ de click to chat no lo documenta. Hay que
  probarlo en dispositivos reales.

### 1.4 Botón oficial «Chat on WhatsApp»

- Existe un botón de marca «Chat on WhatsApp» sujeto a las _brand guidelines_,
  en verde o blanco y en tres tamaños (pequeño, mediano, grande); la FAQ pide
  usarlo **sin modificarlo**, en su última versión y visible [F1].
- **Solo está disponible en inglés** [F1] → para una web en castellano lo
  razonable es un botón propio con texto en castellano _(interpretación; las
  reglas de uso del logotipo de WhatsApp en un botón propio no se verificaron:
  **NO CONFIRMADO**)_.

### 1.5 ¿Sigue siendo el método oficial en 2026?

**Sí.** La página oficial de la FAQ está publicada y accesible a 2026-09-27, sin
aviso de retirada [F1]. Alternativas oficiales complementarias:

- **Short link de la app WhatsApp Business**: se genera automáticamente al crear
  la cuenta (Herramientas > Short link), permite fijar un **mensaje por defecto**
  y compartirlo en la web [F2]. Tiene la forma `wa.me/message/<código>` _(la
  forma exacta del enlace de la app no aparece en la FAQ: **NO CONFIRMADO**; la
  API sí documenta `https://wa.me/message/<código>` [F24])_.
- **QR codes y short links vía API** (solo con Cloud API): mensaje precargado de
  hasta 140 caracteres, máximo 2.000 QR/enlaces por número, sin analítica [F24].
- **Nombres de usuario (usernames)** en WhatsApp Business: despliegue gradual en
  2026, opcionales; el cliente puede escribir el @usuario exacto para iniciar
  chat, y se puede compartir por QR o enlace directo [F4]. **NO CONFIRMADO**:
  formato del enlace directo por nombre de usuario.

---

## 2. WhatsApp Cloud API: recibir y responder mensajes

### 2.1 Cómo llegan los mensajes entrantes

- La plataforma depende de los **webhooks**: el contenido de cualquier mensaje que
  un usuario envía al número del negocio se comunica por webhook, igual que los
  estados de entrega de los mensajes salientes [F8].
- El endpoint debe estar en un **servidor público** que acepte peticiones GET y
  POST y que pueda validar y capturar las cargas [F5].
- **TLS**: certificado TLS/SSL válido y bien instalado; **los certificados
  autofirmados no se admiten** [F5]. mTLS es opcional y se activa por aplicación
  [F5]. Meta recomienda mTLS frente a listas de IPs porque sus IPs cambian
  periódicamente [F6].

### 2.2 Suscripción

- En **App Dashboard > WhatsApp > Configuration** (o _Use cases > Customize >
  Configuration_ si la app se creó con el caso de uso «Connect with customers
  through WhatsApp») se rellenan **Callback URL** y **Verify token**; si la
  verificación pasa, aparece la lista de campos a los que suscribirse [F5].
- Para un bot, el campo imprescindible es `messages` (mensajes entrantes y
  estados de los salientes) [F6].
- Alternativa programática: Subscriptions API con token de app y objeto
  `whatsapp_business_account` [F5].

### 2.3 Verificación del endpoint (GET)

Meta envía un GET cada vez que se establece o edita la Callback URL o el Verify
token [F5]:

```
GET <CALLBACK_URL>?hub.mode=subscribe&hub.challenge=<HUB.CHALLENGE>&hub.verify_token=<HUB.VERIFY_TOKEN>
```

- `hub.verify_token`: cadena elegida por el desarrollador y guardada en el
  servidor; `hub.challenge`: cadena aleatoria generada por Meta [F5].
- Validación: comparar `hub.verify_token` con el valor guardado. Si coincide,
  responder **HTTP 200 con el valor de `hub.challenge`**; si no, un 4xx (o
  cualquier cosa distinta de 200) [F5].
- Si la respuesta no es 200 + challenge, Meta considera el endpoint no
  verificado y **no envía webhooks** [F5].

### 2.4 Notificaciones (POST) y firma `X-Hub-Signature-256`

```
POST <CALLBACK_URL>
Content-Type: application/json
X-Hub-Signature-256: sha256=<SHA256_PAYLOAD_HASH>
```

- Validación [F5]: calcular un **HMAC-SHA256** usando la carga JSON como mensaje
  y el **app secret** como clave; compararlo con lo que va tras `sha256=` en la
  cabecera; si coinciden, la carga es válida; si no, descartarla.
- _(Recomendación de implementación, interpretación)_: calcular el HMAC sobre
  los **bytes crudos** del cuerpo antes de parsear el JSON, y comparar en tiempo
  constante.
- Responder **HTTP 200** si es válida; en otro caso un 4xx [F5].
- **Lotes**: hasta 1.000 actualizaciones por POST, pero el agrupamiento no está
  garantizado; tratar cada POST por separado [F5].
- **Reintentos**: si un POST falla, se reintenta de inmediato y luego con
  frecuencia decreciente **durante 7 días**; el servidor debe **deduplicar**; lo
  no confirmado en 7 días se descarta [F5][F6]. (La guía genérica de webhooks de
  Graph API habla de 36 horas [F25]; para WhatsApp manda la página específica,
  que dice 7 días.)
- **No hay API para recuperar webhooks históricos**: hay que guardarlos al
  recibirlos [F5].

Forma de un mensaje entrante (ejemplo oficial resumido) [F9]:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "changes": [
        {
          "field": "messages",
          "value": {
            "messaging_product": "whatsapp",
            "metadata": { "display_phone_number": "...", "phone_number_id": "..." },
            "contacts": [{ "profile": { "name": "..." }, "wa_id": "..." }],
            "messages": [
              {
                "from": "...",
                "id": "wamid....",
                "timestamp": "...",
                "type": "text",
                "text": { "body": "Hi!" }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Identificadores (BSUID)** [F22]:

- Desde **principios de abril de 2026** todos los webhooks de `messages` incluyen
  `user_id` (BSUID), exista o no nombre de usuario. Formato: código de país
  ISO + punto + hasta 128 alfanuméricos (p. ej. `ES.…`).
- Si el usuario adopta nombre de usuario, **su teléfono puede no venir** en el
  webhook, salvo que en los últimos 30 días haya habido mensajes/llamadas con
  ese número o el usuario esté en la agenda de contactos (evaluado por número
  de negocio).
- Enviar a un BSUID está soportado desde julio de 2026; Meta indica que
  **soportar BSUID es obligatorio** para empresas integradas directamente y
  partners.
- El BSUID cambia si el usuario cambia de número (llega un webhook de sistema).

### 2.5 Cómo se responde

Todas las respuestas usan la Messages API [F7]:

```
POST https://graph.facebook.com/<API_VERSION>/<WHATSAPP_BUSINESS_PHONE_NUMBER_ID>/messages
Authorization: Bearer <ACCESS_TOKEN>

{ "messaging_product": "whatsapp", "recipient_type": "individual",
  "to": "<WHATSAPP_USER_PHONE_NUMBER>", "type": "text",
  "text": { "body": "..." } }
```

- Los ejemplos actuales usan la versión `v26.0` [F7][F20][F21].
- `recipient_type` puede ser `individual` o `group` [F7].
- Token: para producción, **token permanente de usuario del sistema** creado en
  Business Settings con los permisos `business_management`,
  `whatsapp_business_messaging` y `whatsapp_business_management`; el token
  temporal del panel caduca pronto [F9].
- **Límite por par negocio-usuario**: 1 mensaje cada 6 s al mismo usuario
  (~10/min); ráfagas de hasta 45 «tomando prestado» cupo futuro; al exceder,
  error `131056` [F8]. → El bot debe mandar **una respuesta consolidada**, no
  muchas burbujas _(interpretación)_.
- Throughput por defecto: 80 mensajes/s por número [F8] (irrelevante para un
  salón).

### 2.6 Ventana de atención al cliente (24 h)

- Cuando un usuario escribe **o llama** al negocio arranca un temporizador de
  24 h; cada nuevo mensaje/llamada del usuario lo **reinicia** a 24 h [F7].
- **Dentro** de la ventana: se puede enviar cualquier tipo de mensaje de
  servicio (texto, imagen, audio, vídeo, documento, ubicación, contactos,
  reacciones, botones de respuesta —hasta 3—, listas, botón CTA con URL,
  petición de ubicación, **WhatsApp Flows** —p. ej. reservar citas—) [F7].
- **Fuera** de la ventana: **solo plantillas preaprobadas** [F7][F8].
- Solo se puede escribir a usuarios que hayan dado **opt-in** [F7]; antes de
  enviar plantillas hay que tener opt-in que deje claro el nombre del negocio y
  la intención [F8].
- Incidencia conocida: en casos raros se recibe un mensaje y no se puede
  responder dentro de la ventana [F7].
- Los mensajes de servicio se facturan en la categoría `SERVICE` [F7] (ver §3).

### 2.7 Cuándo hacen falta plantillas

- Para **iniciar** conversación o **volver a escribir** pasadas 24 h desde el
  último mensaje del cliente (p. ej. recordatorio de cita, confirmación enviada
  al día siguiente) [F7][F8].
- Categorías: **marketing, utilidad, autenticación** [F10]. El negocio es
  responsable de revisar la categoría asignada; al usarla acepta el cargo de esa
  categoría [F10].
- Revisión: sistemas automáticos + revisión manual; la decisión puede tardar
  **hasta 24 h**; se notifica en WhatsApp Manager, por email y por el webhook
  de estado de plantilla [F23].

### 2.8 Contenido promocional dentro de respuestas libres

Un mensaje sin plantilla solo tiene una categoría; aunque lleve contenido
promocional, Meta no le aplica cargo de marketing adicional [F11]. _(Esto no
exime de la política de mensajería; interpretación.)_

### 2.9 Política: automatización y escalado a humano

La **WhatsApp Business Messaging Policy** (actualizada el 23-sep-2026) permite
usar automatización para responder dentro de la ventana de 24 h, pero exige que
el negocio «must also have available prompt, clear, and direct escalation
paths» [F26] (única cita literal del documento). Enumera como vías válidas: paso
a un agente humano dentro del chat, teléfono, email, soporte web, visita a la
tienda o formulario de soporte [F26].

La misma política exige opt-in para contactar a personas y respetar las
peticiones de baja [F26].

### 2.10 Condiciones de Meta sobre IA (relevante para un bot con Claude)

- **Meta Terms for WhatsApp Business Platform, §4.7 «Proveedores de IA»**
  (última actualización 23-sep-2026) [F27]: los proveedores/desarrolladores de
  tecnologías de IA (LLMs, IA generativa, asistentes de propósito general) tienen
  prohibido usar la plataforma para ofrecer esas tecnologías **cuando son la
  funcionalidad principal** (no incidental o auxiliar), según determine Meta a
  su exclusivo criterio.
- Un negocio **puede contratar a un proveedor de IA como su Solution Provider**,
  pero no puede permitir que los datos de la plataforma se usen para crear,
  entrenar o mejorar modelos de IA, salvo ajustar un modelo para su **uso
  exclusivo** [F27].
- La página de precios para «AI Providers» aclara que esa política **no cambia**
  cómo se cobra al resto de empresas [F12]; desde el 13-may-2026 Meta ya no
  cobra a los «AI Providers» por mensajes a usuarios de la UE/EEE [F12][F14].
- _(Interpretación)_: un asistente de citas/FAQ del salón, en el que la IA es
  auxiliar al servicio del salón, no encaja en «IA como funcionalidad
  principal». **NO CONFIRMADO**: Meta no publica un criterio que lo garantice y
  se reserva la decisión.
- Alternativa nativa de Meta: **Meta Business Agent** (agentes de IA configurables
  por Meta: conocimiento, conectores a APIs externas, traspaso a humano) [F8];
  se cobra por tokens desde el 1-ago-2026 (ver §3.4) [F11].

---

## 3. Precios

### 3.1 Modelo vigente desde el 1-jul-2025

- Meta cobra **por mensaje entregado** (no enviado); hasta el 30-sep-2026 solo se
  cobran los mensajes de **plantilla**; la tarifa depende de la **categoría** y
  del **prefijo telefónico del país del destinatario** [F10].
- El modelo por conversación quedó obsoleto el 1-jul-2025 [F10].

### 3.2 Qué es gratis HOY (hasta el 30-sep-2026)

| Concepto                                                                                                                                                                           | Estado hasta 30-sep-2026 | Fuente |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------ |
| Mensajes **sin plantilla** (servicio) dentro de la ventana de 24 h                                                                                                                 | Gratis desde 1-nov-2024  | [F10]  |
| Plantillas de **utilidad** entregadas dentro de la ventana                                                                                                                         | Gratis desde 1-jul-2025  | [F10]  |
| Todo mensaje en una **ventana de punto de entrada gratuito (FEP)** de 72 h (usuario que llega desde anuncio «click to WhatsApp» o botón CTA de página de Facebook, en Android/iOS) | Gratis                   | [F10]  |
| Mensajes que el usuario envía al negocio                                                                                                                                           | Nunca se cobran          | [F10]  |

### 3.3 Qué se cobra HOY

- **Marketing**: toda entrega [F10].
- **Utilidad** y **autenticación**: fuera de la ventana de atención [F10].
- Utilidad y autenticación tienen **niveles por volumen** mensuales, agregados a
  nivel de portfolio y por par mercado-categoría [F10].

### 3.4 ⚠ Cambios desde el 1-oct-2026

Según la página de precios (Updated 10-sep-2026) y la de próximas
actualizaciones (Updated 25-ago-2026):

1. **Mensajes de servicio**: Meta cobrará **cada mensaje de servicio**, a la
   **misma tarifa que utilidad/autenticación de cada mercado**, **sin niveles de
   volumen** [F10][F11].
2. **Tramo gratuito nuevo**: **1.000 mensajes de servicio entregados al mes por
   número de negocio**, compartido entre 1:1 y grupos, sin acumulación entre
   meses; después se cobra [F10].
3. **Utilidad dentro de la ventana**: pasan a cobrarse (gratis desde 1-jul-2025
   hasta 30-sep-2026) [F10][F11].
4. **Método de pago**: Meta avisa de que, sin método de pago registrado antes del
   30-sep-2026, dejará de entregar mensajes de servicio cuando pasen a ser de
   pago [F11]; la página de precios precisa que sin método de pago se entregan
   los del tramo gratuito, pero no los siguientes [F10].
5. El objeto `pricing` de los webhooks de estado cambia: pasado el tramo
   gratuito, `"billable": true, "type": "regular", "category": "service"` [F10].
6. **Qué NO cambia**: cuándo se puede enviar un mensaje de servicio (solo en
   ventana abierta) [F10]; la FEP de 72 h sigue gratuita para la entrega [F11].
7. **Meta Business Agent** (IA de Meta), desde el 1-ago-2026: cargo por tokens de
   entrada y salida que incluye la entrega; tarifa global de **2,00 USD por
   millón de tokens**, que Meta estima en ~20.000–25.000 tokens por mensaje
   (≈ 4–5 céntimos de USD por mensaje) [F11]. Un bot de **terceros** (p. ej.
   Claude) genera mensajes de **servicio** para Meta, más el coste que cobre el
   proveedor de IA aparte [F11].

**Discrepancia detectada**: la página comercial
`business.whatsapp.com/products/platform-pricing` (sin fecha visible, accedida
2026-09-27) sigue diciendo que no se cobran los mensajes de servicio ni las
respuestas de utilidad [F28]. La documentación para desarrolladores es más
reciente y explícita [F10][F11]; _(interpretación)_ tomarla como referencia y
**re-verificar después del 1-oct-2026**.

### 3.5 Dónde está la tabla oficial para España

- **Tabla oficial**: developers.facebook.com → _Pricing on the WhatsApp Business
  Platform_ → sección de hojas de tarifas → fila **EUR**: «Tarifas en EUR» (CSV),
  «Niveles de volumen en EUR» (CSV) y «Tarifas y niveles de volumen en EUR»
  (PDF). Hay un bloque aparte con las hojas **vigentes desde el 1-oct-2026**
  (que ya incluyen las tarifas de servicio) [F10].
- **España es mercado propio** en las hojas (código de país 34, código ISO ES),
  no parte de «Resto de Europa Occidental» [F10].
- Calculadora interactiva oficial: `business.whatsapp.com/products/platform-pricing`
  (mercado «Spain», divisa EUR, categoría) [F28].
- Cambios recientes que afectan a España: **subida de la tarifa de marketing**
  desde el 1-jul-2026 [F10].
- Calendario: Meta solo puede cambiar precios el **primer día de cada trimestre**
  (1-ene, 1-abr, 1-jul, 1-oct) [F10].
- **No se transcriben cifras** en este informe: los CSV/PDF están en el CDN de
  Meta con URLs firmadas y la calculadora carga los importes dinámicamente; no se
  descargaron ficheros. Además, las tarifas cambian el 1-oct-2026. **Para citar
  importes, abrir la hoja EUR vigente el día de la decisión.**

### 3.6 Coexistence y precio

Con Coexistence, los mensajes que el negocio envía **desde la app WhatsApp
Business siguen siendo gratis**; los enviados **por la Cloud API** se cobran según
los precios de la API [F13]. Los mensajes enviados desde la app no abren,
extienden ni afectan a las ventanas ni al precio de la API [F13].

### 3.7 Estimación cualitativa para el salón _(interpretación, sin cifras)_

- Un bot reactivo con **menos de 1.000 respuestas al mes por número** quedaría
  dentro del tramo gratuito de servicio de Meta a partir del 1-oct-2026; por
  encima, cada respuesta costaría la tarifa de utilidad/autenticación de España.
- Las **plantillas** (recordatorios fuera de ventana) se cobran siempre.
- Costes aparte, no de Meta: API de Claude (ver `03-claude-api.md`), hosting del
  servidor y, en su caso, la cuota del BSP (**NO CONFIRMADO**: varía por
  proveedor; Meta no la publica).

---

## 4. Coexistence (mismo número en la app y en la Cloud API)

### 4.1 Qué es

Configuración de **Embedded Signup** que permite conectar a la Cloud API una
cuenta y número **existentes de la app WhatsApp Business**; el negocio sigue
chateando 1:1 desde la app y WhatsApp mantiene **sincronizado el historial**
entre la app y la integración [F13]. En soporte y documentación de partners se
llama «Coexistence» [F13].

### 4.2 Requisitos [F13]

- App WhatsApp Business **versión 2.24.17 o superior**.
- Quien integra **debe ser ya Solution Partner o Tech Provider**.
- Saber usar la Cloud API; webhook capaz de aceptar y procesar webhooks.
- Usar Embedded Signup con _session logging_.
- Suscribirse además a los campos `account_update`, `history`,
  `smb_app_state_sync` y **`smb_message_echoes`** (mensajes que el dueño envía
  desde la app tras la conexión).
- Tras el alta hay **24 h para sincronizar el historial**; si no, hay que
  desconectar y repetir. La app debe permanecer abierta durante la
  sincronización.

**Consecuencia práctica** _(interpretación)_: el salón **no puede activar
Coexistence por su cuenta como simple «desarrollador directo»**. Opciones:
(a) un **BSP/Solution Partner** que ofrezca Coexistence, o (b) convertirse en
**Tech Provider**, lo que exige **verificación del negocio** y **App Review** con
vídeos de envío de mensaje y creación de plantilla [F18]. **NO CONFIRMADO**: que
un negocio pueda registrar su propio número por Coexistence usando su propia app
de Tech Provider (la documentación no lo prohíbe ni lo describe).

### 4.3 Disponibilidad en España

- **Disponible**: el changelog oficial del **23-oct-2025** añade como soportados
  para Coexistence en Embedded Signup, entre otros, el **Espacio Económico
  Europeo, la Unión Europea y el Reino Unido** [F14].
- El 15-abr-2026 se añadieron Nigeria y Sudáfrica [F14]. La guía actual
  (Updated 26-jun-2026) no lista países excluidos [F13].

### 4.4 Limitaciones y funciones que cambian [F13]

| Función de la app                                                           | Tras conectar a la Cloud API                                                                                                                | ¿La API lo soporta?                               |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Chats 1:1                                                                   | Siguen; ahora se admite editar/anular mensajes                                                                                              | Sí; se pueden sincronizar los últimos **6 meses** |
| Contactos                                                                   | Sin cambios                                                                                                                                 | Sí (sincronizables)                               |
| Chats de grupo                                                              | Sin cambios                                                                                                                                 | No (no se sincronizan)                            |
| Mensajes temporales                                                         | **Se desactivan** en chats 1:1                                                                                                              | No                                                |
| Mensajes «ver una vez»                                                      | **Se desactivan** en chats 1:1                                                                                                              | No                                                |
| Ubicación en tiempo real                                                    | **Se desactiva** en chats 1:1                                                                                                               | No                                                |
| Listas de difusión                                                          | **Se desactivan**; las existentes quedan de solo lectura                                                                                    | No                                                |
| Llamadas de voz y vídeo                                                     | Sin cambios en la app                                                                                                                       | No                                                |
| Catálogo, pedidos, estados                                                  | Sin cambios en la app                                                                                                                       | No                                                |
| Mensajes de bienvenida/ausencia, automáticos, respuestas rápidas, etiquetas | Sin cambios en la app                                                                                                                       | No                                                |
| Perfil de empresa, canales                                                  | Sin cambios                                                                                                                                 | No                                                |
| Dispositivos vinculados                                                     | Hasta 4 acompañantes; se **desvinculan todos** al conectar y se pueden volver a vincular; **no** se admiten WhatsApp para Windows ni WearOS | —                                                 |

Otras limitaciones [F13]:

- **Rendimiento fijo de 20 mensajes/s** para números en app + API.
- Mensajes de clientes desde un acompañante no soportado **no disparan webhook**.
- **Desconexión automática** (evento `PARTNER_REMOVED`) si el **dispositivo
  principal está inactivo ~14 días** o un acompañante ~30 días, entre otros
  motivos → el móvil del salón debe usarse con regularidad.
- El negocio puede desconectarse desde la app: Ajustes > Cuenta > Plataforma de
  WhatsApp Business > Desconectar cuenta.
- La ventana de atención solo se abre para mensajes recibidos **después** del
  alta en la Cloud API [F13].
- Embedded Signup v2 y v3 quedan obsoletos el **15-oct-2026**; hay que usar v4
  [F13] (afecta al partner).

_(Interpretación)_: si el salón tiene activados **mensajes de ausencia/bienvenida**
en la app, seguirán funcionando en la app y podrían **duplicar** las respuestas
del bot; conviene desactivarlos cuando el bot esté en marcha.

### 4.5 Sin Coexistence

Un número que ya se usa en WhatsApp **no puede registrarse** en la Cloud API sin
**eliminar antes** la cuenta de WhatsApp [F17]; es decir, el salón perdería la
app en ese número. Alternativa: usar **otro número** dedicado al bot.

---

## 5. Requisitos de alta, límites y vías de acceso

### 5.1 Alta directa en la Cloud API (desarrollador)

Según _Get started_ (Updated 16-jun-2026) y _About the platform_ (Updated
4-ago-2026) [F9][F8]:

1. Cuenta de Facebook o cuenta gestionada de Meta, y **registro como
   desarrollador**.
2. **App de Meta** con el caso de uso «Connect with customers through WhatsApp».
3. **Portfolio comercial de Meta (business portfolio)**: obligatorio.
4. Modelo de cuentas 2026: una **WhatsApp account (WAAC)** (presencia, números,
   nombre visible, usernames) y una **Messaging account** (plantillas y
   facturación), ambas asociadas al portfolio [F8][F14].
5. Se crean automáticamente una cuenta y un **número de prueba** (límites
   relajados, sin método de pago para plantillas) [F8].
6. **Token permanente** de usuario del sistema (§2.5) [F9].
7. **Método de pago** en el Centro de facturación (imprescindible en la práctica
   desde el 1-oct-2026, §3.4) [F10][F11].

La FAQ oficial resume: los desarrolladores crean la cuenta desde la
documentación para desarrolladores; los negocios que trabajan con un BSP lo
hacen por el flujo de Embedded Signup [F3].

### 5.2 Número de teléfono [F17]

- Propio, con código de país y de área (no números cortos), capaz de **recibir
  llamadas o SMS**; se recomienda móvil.
- Tras registrarlo sigue sirviendo para llamadas/SMS normales, pero **no** para
  la app de WhatsApp (salvo Coexistence, §4).
- Hay que dar un **nombre visible (display name)** al registrarlo [F16][F17].

### 5.3 Verificación del negocio y nombre visible

- **Verificación del negocio**: no es requisito para empezar; es una de las vías
  para subir el límite de mensajería de 250 a 2.000 [F15]; mejora funciones
  (más throughput, estado de _Official Business Account_) [F8]; **es obligatoria
  para ser Tech Provider** [F18].
- **Nombre visible**: pasa verificación automática al alcanzar un límite de
  mensajería superior; solo si se aprueba aparece en la cabecera del chat y en la
  lista de chats; se puede cambiar 10 veces cada 30 días y tras la aprobación hay
  14 días para volver a registrar el número [F16].

### 5.4 Límites de mensajería [F15]

- Número máximo de **usuarios únicos a los que se entregan mensajes fuera de la
  ventana de atención** en 24 h móviles; se fija **por portfolio** (desde el
  7-oct-2025) [F15][F29].
- Portfolio nuevo: **250**; ampliable a 2.000 (verificando el negocio, vía
  partner, o enviando 2.000 plantillas de alta calidad en 30 días), y después
  10.000 / 100.000 / ilimitado por escalado automático [F15].
- _(Interpretación)_: un bot que **solo responde** dentro de la ventana no
  consume este límite; sí lo consumen los recordatorios por plantilla.

### 5.5 Cloud API directa vs. proveedor (BSP)

|                                   | Directa (el salón o su desarrollador) | Solution Partner (BSP) / Tech Provider             |
| --------------------------------- | ------------------------------------- | -------------------------------------------------- |
| Alta                              | App de Meta propia + portfolio [F9]   | Embedded Signup del partner [F3][F17]              |
| **Coexistence** (mantener la app) | **No** (requiere ser SP o TP) [F13]   | **Sí**, si el partner lo ofrece [F13]              |
| Requisitos extra                  | Ninguno para empezar                  | TP: verificación + App Review [F18]                |
| Coste de Meta                     | Tarifas de §3                         | Tarifas de §3 (+ cuota del BSP: **NO CONFIRMADO**) |
| Control del código/bot            | Total                                 | Depende del partner (_interpretación_)             |

### 5.6 On-Premises API: retirada

- Desde enero de 2024 las novedades solo llegan a Cloud API; desde el
  **1-jul-2024** solo se pueden registrar números en Cloud API (error `1005` si se
  intenta en On-Premises); el **23-oct-2025** caducó la última versión (v2.63) y
  los mensajes de números aún en On-Premises **no se entregan** [F19].
- Conclusión: **la Cloud API es la única vía**.

---

## 6. «Escribiendo…» y marcar como leído

### 6.1 Marcar como leído [F20]

```json
POST /<API_VERSION>/<WHATSAPP_BUSINESS_PHONE_NUMBER_ID>/messages
{ "messaging_product": "whatsapp", "status": "read",
  "message_id": "<WHATSAPP_MESSAGE_ID>" }
```

- Usar el `id` (`wamid…`) del webhook del mensaje recibido; hacerlo **dentro de
  los 30 días** siguientes; marca también como leídos los mensajes anteriores de
  la conversación; un ID inválido devuelve el error `131009`. Respuesta:
  `{ "success": true }`.

### 6.2 Indicador de escritura [F21]

```json
POST /<API_VERSION>/<WHATSAPP_BUSINESS_PHONE_NUMBER_ID>/messages
{ "messaging_product": "whatsapp", "status": "read",
  "message_id": "<WHATSAPP_MESSAGE_ID>",
  "typing_indicator": { "type": "text" } }
```

- La misma llamada **marca como leído y muestra «escribiendo…»**.
- Desaparece **al responder o a los 25 s**, lo que ocurra antes.
- Meta recomienda mostrarlo **solo si se va a responder** y cuando la respuesta
  tardará unos segundos.
- Disponible desde el 8-abr-2025 [F14].
- **NO CONFIRMADO**: si se puede reenviar para prolongarlo más de 25 s (la
  documentación no lo dice).

---

## Implicaciones para el diseño

### A. Lo que la web puede hacer HOY sin servidor (GitHub Pages)

1. **Solo enlaces click to chat.** Construir
   `https://wa.me/34XXXXXXXXX?text=` + `encodeURIComponent(mensaje)` con el número
   real del salón en formato internacional, **sin `+`, espacios, guiones ni
   paréntesis** [F1].
2. **Mensajes precargados por servicio** (p. ej. «Hola, quiero cita para
   manicura semipermanente»). _(Interpretación)_: darles una forma estable y
   fácil de reconocer (servicio + intención) facilitará que el futuro bot
   entienda el primer mensaje sin cambiar la web.
3. **El mensaje no se envía solo**: el cliente lo ve en el campo de texto y pulsa
   enviar [F1]. La web **no puede saber** si se envió ni leer respuestas.
4. **Botón propio en castellano** (el oficial «Chat on WhatsApp» solo existe en
   inglés) [F1]; revisar las _brand guidelines_ antes de usar el logotipo
   (**NO CONFIRMADO** el detalle).
5. **Probar en dispositivos reales**: móvil con app, escritorio con app de
   escritorio, escritorio solo con navegador (WhatsApp Web). El comportamiento de
   escritorio no está documentado con detalle (**NO CONFIRMADO**, §1.3).
6. **Automatizaciones sin código disponibles hoy en la app WhatsApp Business**:
   short link con mensaje por defecto [F2]; respuestas rápidas y mensajes de
   bienvenida/ausencia existen en la app [F13]. _(Interpretación)_: si más
   adelante se activa Coexistence + bot, habrá que desactivar los mensajes
   automáticos de la app para no duplicar respuestas.
7. **Nunca** poner en el front un token de Meta, el app secret ni la clave de la
   API de Claude: en una web estática quedarían públicos _(interpretación; buena
   práctica de seguridad)_.

### B. Arquitectura mínima el día que haya servidor

```
Cliente (WhatsApp)
   │  escribe (también desde el enlace wa.me de la web)
   ▼
Meta Cloud API ──POST webhook (firmado X-Hub-Signature-256)──►  Endpoint HTTPS público
                                                                 (función serverless o VPS)
                                                                 1. valida HMAC con app secret
                                                                 2. guarda el payload, deduplica por wamid
                                                                 3. responde 200 enseguida
                                                                 4. encola el trabajo
                                                                        │
                                                                        ▼
                                                                 Worker
                                                                 a. status=read + typing_indicator
                                                                 b. contexto: historial por BSUID,
                                                                    servicios, horarios, políticas
                                                                 c. llamada a la API de Claude
                                                                 d. ¿escalar a humano? → pausa el bot
                                                                 e. POST /messages (1 respuesta)
   ◄──────────────────────── respuesta ─────────────────────────┘
```

Decisiones y requisitos, con su base:

1. **Número**: si el salón vive en la app WhatsApp Business del móvil →
   **Coexistence mediante un BSP/Solution Partner** (o hacerse Tech Provider)
   [F13][F18]; disponible en España [F14]. Si se prefiere independencia de
   partners → **número nuevo dedicado** al bot con Cloud API directa [F9][F17].
2. **Endpoint de webhooks**: HTTPS público con certificado válido (no
   autofirmado), verificación GET con `hub.verify_token`/`hub.challenge`, POST con
   HMAC-SHA256, 200 rápido, **idempotencia** (reintentos hasta 7 días) y
   **persistencia** de payloads (no hay histórico recuperable) [F5].
3. **Identidad**: clave primaria de conversación = **BSUID (`user_id`)**, con el
   teléfono como dato opcional [F22].
4. **Ventana de 24 h**: el bot responde libremente dentro de la ventana; todo lo
   que sea fuera (recordatorios, confirmaciones al día siguiente) necesita
   **plantillas de utilidad aprobadas** (hasta 24 h de revisión) y opt-in
   [F7][F8][F23].
5. **Escalado a humano obligatorio**: ofrecer siempre pasar con una persona, el
   teléfono del salón o la visita al local [F26]. Con Coexistence, el webhook
   `smb_message_echoes` indica que el dueño ha respondido desde la app [F13] →
   _(interpretación)_ usarlo para **pausar el bot** en ese chat.
6. **UX**: marcar como leído + «escribiendo…» al recibir; una sola respuesta
   consolidada (límite de 1 mensaje/6 s por usuario) [F8][F20][F21]; botones de
   respuesta rápida (máx. 3) o listas para elegir servicio [F7].
7. **Secretos solo en el servidor**: token de usuario del sistema, app secret,
   verify token y clave de Claude [F5][F9] _(la custodia es interpretación)_.
8. **Costes a presupuestar** (a partir del 1-oct-2026): mensajes de servicio
   gratis hasta **1.000/mes por número**, después tarifa de España; plantillas
   siempre de pago; **método de pago obligatorio** para no cortar el servicio
   [F10][F11]; más API de Claude, hosting y posible cuota del BSP.
9. **Cumplimiento Meta**: no usar los datos de WhatsApp para entrenar modelos
   (salvo ajuste de uso exclusivo) y mantener la IA como **auxiliar** del servicio
   del salón (§4.7) [F27]; riesgo residual **NO CONFIRMADO** porque Meta decide a
   su criterio. El RGPD/LOPDGDD queda fuera del alcance de este informe.
10. **Alternativa a valorar**: **Meta Business Agent** (IA gestionada por Meta,
    con traspaso a humano y conectores), con cargo por tokens desde el 1-ago-2026
    [F8][F11], frente a Claude + servidor propio.

---

## Fuentes

Todas accedidas el **2026-09-27**. «Updated» = fecha que muestra la propia página.

| ID  | Documento                                                                                                          | URL                                                                                                                                          | Updated                                |
| --- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| F1  | WhatsApp Help Center — How to use click to chat                                                                    | https://faq.whatsapp.com/5913398998672934                                                                                                    | sin fecha visible                      |
| F2  | WhatsApp Help Center — How to create short links (app WhatsApp Business)                                           | https://faq.whatsapp.com/502291734918768                                                                                                     | sin fecha visible                      |
| F3  | WhatsApp Help Center — How to get started on the WhatsApp Business Platform                                        | https://faq.whatsapp.com/5773272372736965                                                                                                    | sin fecha visible                      |
| F4  | WhatsApp Help Center — About usernames on WhatsApp Business                                                        | https://faq.whatsapp.com/1131753190029163                                                                                                    | sin fecha visible                      |
| F5  | Meta for Developers — Create a webhook endpoint                                                                    | https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint/                                  | 17-jun-2026                            |
| F6  | Meta for Developers — Webhooks (WhatsApp, overview)                                                                | https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/                                                          | sin fecha visible (leída vía WebFetch) |
| F7  | Meta for Developers — Service messages (ventana de 24 h, Messages API)                                             | https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages/                                            | 21-may-2026                            |
| F8  | Meta for Developers — About the WhatsApp Business Platform                                                         | https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform/                                                | 4-ago-2026                             |
| F9  | Meta for Developers — WhatsApp Cloud API Get Started                                                               | https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started/                                                       | 16-jun-2026                            |
| F10 | Meta for Developers — Pricing on the WhatsApp Business Platform                                                    | https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/                                                           | 10-sep-2026                            |
| F11 | Meta for Developers — Upcoming pricing updates for Meta Business Agent, service and utility messages               | https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages/                                     | 25-ago-2026                            |
| F12 | Meta for Developers — New pricing policy for AI Providers                                                          | https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ai-providers                                               | 1-sep-2026                             |
| F13 | Meta for Developers — Onboard WhatsApp Business app users («Coexistence»)                                          | https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/                     | 26-jun-2026                            |
| F14 | Meta for Developers — WhatsApp changelog (entradas 8-abr-2025, 23-oct-2025, 15-abr-2026, 12-may-2026, 22-sep-2026) | https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog                                                          | página viva                            |
| F15 | Meta for Developers — Messaging limits                                                                             | https://developers.facebook.com/documentation/business-messaging/whatsapp/messaging-limits/                                                  | 21-may-2026                            |
| F16 | Meta for Developers — Display names                                                                                | https://developers.facebook.com/documentation/business-messaging/whatsapp/display-names/                                                     | 16-jun-2026                            |
| F17 | Meta for Developers — Business phone numbers                                                                       | https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers/                              | 21-may-2026                            |
| F18 | Meta for Developers — Become a Tech Provider                                                                       | https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/get-started-for-tech-providers/                 | 20-ago-2026                            |
| F19 | Meta for Developers — On-Premises API Sunset                                                                       | https://developers.facebook.com/docs/whatsapp/on-premises/sunset                                                                             | sin fecha visible                      |
| F20 | Meta for Developers — Mark messages as read                                                                        | https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/mark-message-as-read/                                     | 2-jul-2026                             |
| F21 | Meta for Developers — Typing indicators                                                                            | https://developers.facebook.com/documentation/business-messaging/whatsapp/typing-indicators/                                                 | 17-jun-2026                            |
| F22 | Meta for Developers — Business-scoped user IDs                                                                     | https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids/                                          | 15-sep-2026                            |
| F23 | Meta for Developers — Template review                                                                              | https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-review/                                         | 17-jun-2026                            |
| F24 | Meta for Developers — QR Codes and Short Links                                                                     | https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes/                                                          | 21-may-2026                            |
| F25 | Meta for Developers — Webhooks de Meta: Getting started (Graph API, genérico)                                      | https://developers.facebook.com/docs/graph-api/webhooks/getting-started                                                                      | sin fecha visible                      |
| F26 | WhatsApp Business Messaging Policy                                                                                 | https://business.whatsapp.com/policy (redirige a https://whatsappbusiness.com/policy/)                                                       | 23-sep-2026                            |
| F27 | Meta Terms for WhatsApp Business Platform, §4.7 «Proveedores de IA»                                                | https://www.whatsapp.com/legal/business-solution-terms (redirige a https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform) | 23-sep-2026                            |
| F28 | WhatsApp Business — Platform Pricing (página comercial + calculadora)                                              | https://business.whatsapp.com/products/platform-pricing (redirige a https://whatsappbusiness.com/products/platform-pricing/)                 | sin fecha visible                      |
| F29 | Meta for Developers — Upcoming changes to messaging limits (ya en vigor)                                           | https://developers.facebook.com/documentation/business-messaging/whatsapp/upcoming-messaging-limits-changes/                                 | 17-jun-2026                            |

### Pendiente / NO CONFIRMADO (resumen)

- Comportamiento exacto de `wa.me` en escritorio sin app instalada (§1.3).
- Reglas de marca para un botón propio con el logotipo de WhatsApp (§1.4).
- Formato del enlace directo por nombre de usuario (§1.5).
- Si un negocio puede activar Coexistence para su propio número siendo su
  propio Tech Provider (§4.2).
- Cuota de los BSP (§3.7, §5.5).
- Si el uso de Claude como asistente auxiliar del salón queda siempre fuera de
  la prohibición de §4.7 (decisión discrecional de Meta) (§2.10).
- Si el indicador de escritura puede reenviarse para durar más de 25 s (§6.2).
- Importes concretos de España: leer la hoja EUR vigente en la fecha de decisión
  (§3.5).
