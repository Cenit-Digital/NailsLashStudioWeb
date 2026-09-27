# 06 — Nailbot con IA real: diseño del servidor futuro (NO se implementa hoy)

> Síntesis del `craftsman_lead` (2026-09-27) a partir de `01-legal.md`, `02-whatsapp.md` y
> `03-claude-api.md`, que llevan las fuentes oficiales con URL y fecha de acceso. Aquí no hay datos
> nuevos: cada afirmación remite al informe que la sostiene. Las cifras (precios, límites) **se
> re-verifican el día de la decisión**, porque cambian: los mensajes de servicio de WhatsApp pasan a
> cobrarse el **1-oct-2026** (verificado por el lead en
> <https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages>,
> 2026-09-27) y Haiku 4.5 tiene retirada «no antes de 2026-10-15» (`03` §4.1).

## 0. Qué hay HOY y qué NO

- **Hoy (F-23 + F-24):** Nailbot es un **guion local** en el navegador. Sin red, sin claves, sin
  persistencia. Al terminar, compone la solicitud y abre WhatsApp con `wa.me` (`02` §1); **el mensaje
  lo envía la persona**. No es un «sistema de IA» (`01` §2) → **no se anuncia como IA** y lleva la
  leyenda de demo.
- **Nunca en la web estática:** ninguna clave (de Anthropic, OpenAI ni Meta). GitHub Pages es pública:
  todo lo que va a `dist/` lo puede leer cualquiera (`03` §A). La clave `sk-proj-…` que se pegó en el
  chat de la sesión **no es de Anthropic** (todas las de Anthropic empiezan por `sk-ant-`, `03` §1.1) y
  **debe revocarse**; no está en el repo.
- **Un token de suscripción de Claude Code tampoco vale** para un producto propio: Anthropic reserva el
  OAuth de las suscripciones a sus apps y a Claude Code (`03` §2). Para el servidor hace falta una
  **API key de la Claude Console**.

## 1. La costura que ya deja el código de hoy

El guion vive detrás de una función PURA del tipo `responder(estado, entrada) → turno`
(`src/components/nailbot-*.ts`, F-23). El día del servidor, esa costura se sustituye por un
`fetch` al endpoint propio **sin tocar la UI** (`03` §D). La URL del endpoint NO es un secreto y puede
ir en la configuración de la web; la clave, **nunca**.

## 2. Arquitectura mínima

```
Navegador (GitHub Pages, SIN claves)                WhatsApp del cliente
   │ POST https://api.<dominio>/nailbot                  │ mensaje entrante
   ▼                                                     ▼
┌──────────────── Servidor propio (HTTPS) ────────────────────────────────┐
│ /nailbot  (web)              /whatsapp/webhook (Meta)                    │
│  · CORS solo al origen web    · GET: hub.verify_token / hub.challenge    │
│  · rate limit IP/sesión       · POST: firma X-Hub-Signature-256 (HMAC)   │
│  · longitud y nº de turnos    · responde 200 rápido; procesa en cola     │
│            └──────────────┬──────────────┘                               │
│                   NÚCLEO NAILBOT (uno solo para los dos canales)         │
│  · system prompt estable con los datos del salón (fuente única F-02)     │
│  · modelo en variable de entorno (p. ej. Sonnet 5 / Haiku 4.5, `03` §4.1)│
│  · herramientas: consultar_horario · preparar_solicitud_cita (PENDIENTE, │
│    la confirma una persona) · derivar_a_humano (tel/WhatsApp reales)     │
│  · max_tokens acotado · prompt caching · historial recortado             │
│  · secretos SOLO en entorno: ANTHROPIC_API_KEY, token de sistema de Meta,│
│    app secret, verify token                                              │
└──────────────────────────────────────────────────────────────────────────┘
```

Detalle técnico: webhook, ventana de 24 h, plantillas, «escribiendo…» (`02` §2, §6); streaming,
caching, tool use, límites de gasto y rate limits de la Console (`03` §4.2-§4.5).

## 3. Decisiones que tendrá que tomar el salón (no las toma el código)

| # | Decisión | Por qué importa | Fuente |
|---|---|---|---|
| S1 | **¿Mismo número en la app y en la API (Coexistence)?** | Disponible en España, pero solo vía Solution Partner / Tech Provider, y la app pierde funciones (difusión, temporales…) | `02` §4 |
| S2 | **Proveedor/hosting del servidor** | Será encargado del tratamiento (contrato art. 28 RGPD) | `01` §3.2 |
| S3 | **Modelo y presupuesto mensual** | Límite de gasto en la Console; orden de magnitud por conversación en `03` §4.1 | `03` §4.1, §4.5 |
| S4 | **Presupuesto de WhatsApp** | Desde el 1-oct-2026 los mensajes de servicio se cobran (tramo gratuito mensual por número según `02` §3.4) y hace falta método de pago | `02` §3.4 |
| S5 | **Residencia de datos** | La API directa de Claude no ofrece inferencia en la UE hoy | `03` §4.8 |

## 4. Puertas legales ANTES de encender la IA (bloqueantes)

1. **AI Act art. 50.1** (aplicable desde el 2-ago-2026; el Ómnibus, Reg. (UE) 2026/1744, no lo cambió —
   verificado por el lead en EUR-Lex): aviso «soy un asistente de inteligencia artificial, no una
   persona» en el **primer turno** de cada sesión, en web y WhatsApp, más una insignia persistente
   junto al campo de texto; el bot lo reconoce siempre que se le pregunte. Cambiar la leyenda de demo
   por la de IA (`01` §5.2).
2. **RGPD:** política de privacidad publicada (hoy NO existe: F-16 `paginas_legales` está
   `blocked` a la espera de los datos del titular), contratos de encargo con Anthropic / hosting /
   Meta, transferencia a EE. UU. con cláusulas contractuales tipo (Anthropic no aparece en la lista del
   DPF a 27-09-2026), minimización (sin teléfono, sin datos de salud) (`01` §3.2).
3. **Condiciones de WhatsApp:** el bot acotado a los temas del salón (uso auxiliar, cláusula 4.7), vía
   clara de escalado a una persona, opt-in y ventana de 24 h (`01` §4, `02` §2.9).
4. **Revisar el día del lanzamiento** (cambia rápido): cláusula 4.7 de Meta, asunto AT.41034, recurso
   C-703/25 P sobre el DPF, precios de Meta y de Anthropic (`01` §5.2.7).

## 5. Orden de trabajo sugerido cuando llegue el servidor

1. Revocar cualquier clave expuesta; crear un **workspace dedicado** en la Console con límite de gasto
   bajo y una API key con caducidad (`03` §C).
2. Núcleo Nailbot + endpoint web detrás de la costura `responder` (la UI de F-23 no cambia).
3. Evaluación con 30-50 preguntas reales del salón antes de exponerlo (`03` §4.1).
4. Webhook de WhatsApp (tras decidir S1) reutilizando el mismo núcleo.
5. Cambiar los textos de demo por el aviso de IA del art. 50 (puerta legal 1).
