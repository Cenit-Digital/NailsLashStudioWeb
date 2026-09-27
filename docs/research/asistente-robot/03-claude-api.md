# 03 · Claude API para el asistente del salón: claves, navegador y servidor futuro

> **Fecha de la investigación y de acceso a todas las URLs:** 2026-09-27.
> **Contexto:** web estática (GitHub Pages, sin servidor). El asistente de chat es HOY un guion local; en el FUTURO un servidor propio llamará a la Claude API para responder en el chat web y en WhatsApp.
> **Alcance:** solo documentación oficial (platform.claude.com, code.claude.com, support.claude.com, anthropic.com, y privacy.claude.com, que es el centro de privacidad oficial de Anthropic enlazado desde platform.claude.com). Para la pregunta 1 también se intentó platform.openai.com / help.openai.com.
> **Punto de partida:** la skill oficial `claude-api` (referencia empaquetada, caché del 2026-06-24). Todos los datos se han vuelto a comprobar en la web oficial el 2026-09-27.

## Método y límites

- **Citas.** Por la política de reproducción de contenidos, las fuentes se resumen como **paráfrasis fiel en castellano**, siempre con URL y fecha. Solo hay **una cita literal breve** (en la pregunta 2). Los identificadores técnicos (prefijos, cabeceras, IDs de modelo, precios, límites) se copian tal cual.
- **Claves.** No se ha usado, repetido ni probado ninguna clave. La clave `sk-proj-…` que se pegó en el chat no aparece en este documento.
- **Comprobación del repositorio.** Se hizo un `grep` que lista solo nombres de archivo y no imprime valores. Buscó los prefijos `sk-proj-` y `sk-ant-` en el árbol de trabajo, sin `node_modules` ni `.git`. También se ejecutó `git log --all -S "sk-proj-"` sobre todo el historial. Hubo **0 coincidencias**: la clave no está en el repositorio ni en su historial.
- **Qué significa «NO CONFIRMADO».** Marca lo que no se pudo verificar con texto oficial.

---

## Resumen ejecutivo

1. **La clave `sk-proj-…` no es una credencial de Anthropic ni un «token de Claude Code».** Todas las credenciales de Anthropic documentadas empiezan por `sk-ant-`. Que `sk-proj-` sea el formato de clave de proyecto de OpenAI es muy probable, pero queda **NO CONFIRMADO con texto oficial**, porque las páginas de OpenAI devolvieron 403. En cualquier caso la clave se ha expuesto y hay que **revocarla en el panel de quien la emitió**.
2. **Un token de suscripción de Claude (OAuth, `claude setup-token`) no sirve para un producto propio.** Anthropic lo reserva para el uso ordinario de Claude Code y de sus apps nativas. Para productos, incluido el Agent SDK, exige una **API key de la Claude Console** o de un proveedor cloud.
3. **Ninguna clave puede ir en la web estática.** El SDK bloquea el navegador por defecto y solo lo permite con una opción que su propio nombre marca como peligrosa (`dangerouslyAllowBrowser`). Anthropic solo lo considera razonable en herramientas internas o en depuración temporal, y una web pública no es ninguno de los dos casos.
4. **Modelo para el bot.** Hay dos candidatos: **Claude Haiku 4.5** (`claude-haiku-4-5`, 1/5 USD por MTok, el más rápido) y **Claude Sonnet 5** (`claude-sonnet-5`, 2/10 USD por MTok, «Fast»). Haiku tiene una fecha de retirada «no antes de 2026-10-15» y solo cachea prompts de 4.096 tokens o más. Sonnet 5 cachea desde 1.024 tokens y durará al menos hasta 2027-06-30.
5. **Control de gasto.** Hay tres capas: el tope mensual del tier (Start: 500 USD), un límite propio en Billing y límites de gasto y de velocidad por workspace. Lo recomendable es un **workspace dedicado** con límite bajo y una **API key de service account** que caduque.
6. **Datos.** La API se rige por los Commercial Terms: Anthropic no entrena con el contenido del cliente y el DPA, con SCC, se incorpora por referencia. Para la API comercial se borran entradas y salidas en 30 días, con excepciones. ZDR solo se consigue a través de ventas.
7. **No hay residencia UE en la Claude API directa.** `inference_geo` solo admite `global` o `us`, y el geo del workspace solo `us`. Para inferencia en la UE habría que ir por Google Cloud (multi-región `eu`, con un 10 % de sobreprecio). La disponibilidad del modelo en esa región está NO CONFIRMADA.

---

## 1. Prefijos de claves: ¿`sk-ant-api03-` frente a `sk-proj-`?

### 1.1 Lado Anthropic (confirmado)

| Credencial | Prefijo documentado | Fuente oficial (acceso 2026-09-27) |
|---|---|---|
| API key de la Claude API (personal, service account o workspace) | `sk-ant-api...`. Los ejemplos oficiales usan `sk-ant-api03-...` | https://platform.claude.com/docs/en/manage-claude/authentication |
| Admin API key (organización de Claude Console) | `sk-ant-admin01-...` | https://platform.claude.com/docs/en/manage-claude/admin-api-keys |
| Admin key de Claude Enterprise (claude.ai) | `sk-ant-api01-...` | https://platform.claude.com/docs/en/manage-claude/admin-api-keys |
| Environment key de Managed Agents (sandbox autoalojado) | `sk-ant-oat01-...` | https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes.md |
| Token OAuth de `claude setup-token` (Claude Code) | **NO CONFIRMADO**: la página oficial no muestra ningún prefijo | https://code.claude.com/docs/en/authentication |

Detalles relevantes de la página de autenticación:
- La API key es un secreto estático que se genera en la Claude Console. Se envía como `Authorization: Bearer <key>` o, en su forma heredada, como `x-api-key`.
- La documentación recomienda guardarla en un gestor de secretos, rotarla y desactivarla si se sospecha de una fuga.
- Al crearla se elige una caducidad: 3 h, 1 día, 7 días, 30 días, una duración a medida o «Never».

### 1.2 Lado OpenAI (`sk-proj-`)

- **NO CONFIRMADO con texto oficial explícito.** Los `WebFetch` a `platform.openai.com/docs/api-reference/...` y a `help.openai.com/...` devolvieron **HTTP 403**.
- El índice del buscador sobre las páginas oficiales de *Project API keys* (https://platform.openai.com/docs/api-reference/project-api-keys/retrieve) solo enseña valores enmascarados del tipo `sk-abc...def`. Las admin keys aparecen como `sk-admin...`. En ninguno de esos fragmentos aparece la cadena `sk-proj-`.
- Solo el **foro de la comunidad de OpenAI** (community.openai.com) describe `sk-proj-` como el prefijo actual de las claves de proyecto. No es documentación oficial y no se ha usado como fuente.
- **Conclusión:** que sea una clave de OpenAI es muy probable, pero no está confirmado. Lo que sí está confirmado es que **no encaja con ningún prefijo de Anthropic**, porque todos los documentados empiezan por `sk-ant-`. Tampoco puede ser un token de suscripción válido para el producto (ver pregunta 2).

### 1.3 Qué hacer con la clave pegada

- Hay que darla por **expuesta**, porque se pegó en un chat. Debe **revocarla** su titular en el panel del emisor. Si es de OpenAI, eso se hace en la página de API keys de su plataforma.
- No se puede reutilizar para nada de este proyecto.
- El repositorio está limpio (ver «Método»).
- Anthropic colabora con el *secret scanning* de GitHub. Si una clave de Anthropic aparece en un repositorio público, Anthropic la **desactiva automáticamente** y avisa al usuario por correo. Fuente: https://support.claude.com/en/articles/9767949-api-key-best-practices-keeping-your-keys-safe-and-secure (actualizada el 2026-03-16; acceso 2026-09-27). Es relevante porque la web se publica desde un repositorio en GitHub Pages.

---

## 2. Tokens de suscripción de Claude / Claude Code (OAuth, `claude setup-token`)

**Qué es `claude setup-token`**
- Fuente: https://code.claude.com/docs/en/authentication (acceso 2026-09-27).
- Genera un **token OAuth válido durante un año**, pensado para CI y scripts donde no se puede iniciar sesión en un navegador.
- El token se exporta como `CLAUDE_CODE_OAUTH_TOKEN`.
- **Se autentica contra la suscripción de Claude** y requiere un plan Pro, Max, Team o Enterprise.
- Solo sirve para hacer peticiones al modelo.

**Qué dice la página «Legal and compliance»**
- Fuente: https://code.claude.com/docs/en/legal-and-compliance (acceso 2026-09-27).
- La autenticación OAuth es **exclusiva** de quienes han comprado un plan Free, Pro, Max, Team o Enterprise. Está pensada para el uso ordinario de Claude Code y de otras aplicaciones nativas de Anthropic.
- Los desarrolladores que construyan productos o servicios, **incluidos los que usan el Agent SDK**, deben usar API keys. Cita literal: *«should use API key authentication through Claude Console or a supported cloud provider»*.
- Anthropic **no permite** que terceros ofrezcan el inicio de sesión de Claude.ai en sus aplicaciones. Tampoco permite enrutar peticiones a través de credenciales de planes Free, Pro o Max en nombre de sus usuarios.
- Tampoco permite recoger, almacenar ni intermediar credenciales o tokens de sesión de Claude.ai.
- Anthropic puede hacer cumplir estas restricciones **sin aviso previo**.
- En cambio, sí es legítimo que un cliente configure **su propia API key**, por ejemplo en un gestor de secretos, para sus usuarios autorizados. La condición es que el uso se facture al titular de la clave y que no se revenda ni se intermedie.
- Contrato aplicable: los usuarios de la API se rigen por los **Commercial Terms** y los de Free, Pro y Max por los **Consumer Terms**.

**Qué dice el resumen del Agent SDK**
- Fuente: https://code.claude.com/docs/en/agent-sdk/overview (acceso 2026-09-27).
- Salvo aprobación previa, un tercero no puede ofrecer el login de claude.ai ni los límites de uso de una suscripción en su producto, tampoco en agentes hechos con el Agent SDK.
- En su lugar hay que usar la autenticación por API key que explica el Quickstart.

**Qué usar para el producto propio**
- Una **API key de la Claude Console** (https://platform.claude.com/settings/keys).
- Mejor una **service account key**: la documentación la recomienda para cargas compartidas o automáticas en producción. Conviene limitarla a un **workspace dedicado** y ponerle caducidad.
- La alternativa sin secretos estáticos es **Workload Identity Federation**, si el servidor corre en un cloud con identidad federable.
- Fuente: https://platform.claude.com/docs/en/manage-claude/authentication (acceso 2026-09-27).

---

## 3. Llamar a la API desde el navegador

**Qué dice la documentación oficial**
- Fuente: el SDK de TypeScript, https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript (acceso 2026-09-27).
- En navegadores, el SDK viene **desactivado por defecto** para no exponer credenciales secretas. Solo se activa poniendo `dangerouslyAllowBrowser: true`.
- La propia documentación explica el riesgo: la opción deja las credenciales en el código del cliente. Cualquier persona con acceso al navegador puede inspeccionarlas, extraerlas y usarlas mal.
- Solo describe **dos casos de bajo riesgo**:
  - **Herramientas internas**, usadas únicamente por personas de confianza.
  - **Desarrollo o depuración temporal**, con credenciales de vida corta, que no se usen en producción o que se roten a menudo.

**Sobre el nombre de la cabecera `anthropic-dangerous-direct-browser-access`**
- **NO CONFIRMADO en la documentación oficial.** Se buscó en platform.claude.com, docs.anthropic.com, anthropic.com, support.claude.com y code.claude.com, y ninguna página lo menciona.
- Sin verificar hoy: es la cabecera que envía el SDK de TypeScript cuando se activa `dangerouslyAllowBrowser`, y con ella la API acepta la petición cruzada (CORS). Una llamada `fetch` que la añada a mano tiene exactamente el mismo riesgo, porque la clave sigue estando en el navegador.

**Otras restricciones documentadas**
- **CORS no está disponible para organizaciones con ZDR.** Para llamar a la API desde una aplicación de navegador hay que pasar por un **proxy de backend**. Fuente: https://platform.claude.com/docs/en/manage-claude/api-and-data-retention (acceso 2026-09-27).
- La única vía oficial para llamar a la API desde el dispositivo del usuario sin incluir una clave es **App Attest**, y solo existe para **apps de iOS y macOS**. No hay equivalente para la web. Fuente: https://platform.claude.com/docs/en/manage-claude/authentication (acceso 2026-09-27).

**Por qué NO sirve para una web pública en GitHub Pages**
1. La clave queda al alcance de cualquier visitante: basta con ver el código fuente, las DevTools o la pestaña de red.
2. El repositorio y la carpeta `dist/` son públicos. El *secret scanning* de GitHub desactivaría la clave (ver 1.3), pero antes de eso cualquiera podría haberla usado.
3. Todo el gasto se factura a la organización. El único freno sería el tope mensual; no hay manera de poner límites por usuario desde el navegador.
4. No encaja en ninguno de los dos casos de bajo riesgo: los usuarios no son de confianza y es producción.
5. OpenAI dice lo mismo de sus claves: recomienda enrutar siempre las peticiones por el backend propio. Fuente: https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety. El texto viene del extracto del buscador, porque el fetch directo devolvió 403.

---

## 4. Servidor futuro: bot de atención al cliente del salón

### 4.1 Modelos, coste y latencia

Fuentes (acceso 2026-09-27):
- https://platform.claude.com/docs/en/about-claude/models/overview.md
- https://platform.claude.com/docs/en/about-claude/pricing.md
- https://platform.claude.com/docs/en/models/haiku-4-5/overview
- https://platform.claude.com/docs/en/about-claude/model-deprecations
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching.md

| | **Claude Haiku 4.5** | **Claude Sonnet 5** | Claude Opus 5.5 (referencia) |
|---|---|---|---|
| ID en la API | `claude-haiku-4-5` (snapshot `claude-haiku-4-5-20251001`) | `claude-sonnet-5` | `claude-opus-5-5` |
| Entrada / salida (USD por MTok) | 1 / 5 | 2 / 10 ¹ | 4 / 20 |
| Escritura en caché 5 min / lectura de caché | 1,25 / 0,10 | 2,50 / 0,20 | 5 / 0,20 |
| Latencia comparativa | «Fastest» | «Fast» | «Moderate» |
| Contexto / salida máxima | 200K / 64K | 1M / 128K | 1M / 128K |
| Thinking / effort | Extended thinking; **no admite** `effort` | Adaptive; effort por defecto `high` | Adaptive, siempre activo; effort por defecto `medium` |
| Prefijo mínimo para cachear | **4.096 tokens** | 1.024 tokens | 512 tokens |
| Tokens de system prompt para tool use (`auto`) | 496 | 354 | 286 |
| Retirada | **no antes de 2026-10-15** | no antes de 2027-06-30 | no antes de 2027-09-22 |
| `inference_geo` | **No** (devuelve 400) | Sí | Sí |

¹ La página de precios indica que el precio de Sonnet 5, 2/10 USD, se anunció como introductorio pero **ya es el precio estándar**. La subida a 3/15 USD prevista para el 2026-09-01 **no se aplicará**.

**Notas**
- **Tokenizador.** Según la página de precios, los modelos Claude 4.7 y posteriores usan un tokenizador que produce unos **30 % más tokens** con el mismo texto; Sonnet 4.6 y anteriores siguen con el antiguo. Por esa redacción, Haiku 4.5 usa el antiguo y Sonnet 5 el nuevo. Es una inferencia: conviene medirlo con `count_tokens`.
- **Guía «Choosing a model»** (https://platform.claude.com/docs/en/about-claude/models/choosing-a-model.md):
  - Propone empezar «efficiency-first» con Haiku 4.5 cuando hay requisitos estrictos de latencia o de coste.
  - Sitúa Haiku en las aplicaciones de tiempo real.
  - Recuerda que ajustar `effort` suele funcionar mejor que cambiar de modelo.
- **Guía de soporte al cliente** (https://platform.claude.com/docs/en/about-claude/use-case-guides/customer-support-chat.md):
  - Presenta Claude Opus 5 como un buen equilibrio para el soporte, incluso en los casos complejos.
  - Sugiere Haiku 4.5 para priorizar la latencia en flujos con RAG, herramientas o contexto largo.
- **Ciclo de vida.** Anthropic avisa con **al menos 60 días** antes de retirar un modelo público. A 2026-09-27, Haiku 4.5 sigue «Active» y no hay anuncio de deprecación.
- **Recomendación propia, no oficial.**
  - Prototipar con **Sonnet 5 con effort `low`** y compararlo con **Haiku 4.5** en 30 a 50 preguntas reales del salón.
  - Dejar el ID del modelo en una variable de entorno.
  - Sonnet 5 es la opción más robusta por su horizonte de vida y porque su mínimo de caché es menor.
- **Estimación orientativa de coste.** Es un cálculo propio con los precios oficiales. Supuestos: 6 turnos, unos 3.000 tokens fijos entre system prompt y herramientas, un historial medio de unos 500 tokens y 150 tokens de salida por turno.
  - **Haiku 4.5:** unos 0,026 USD por conversación. No cachea porque el prefijo no llega a 4.096 tokens.
  - **Sonnet 5 sin caché:** unos 0,05 USD.
  - **Sonnet 5 con caché del prefijo:** unos 0,026 USD, o unos 0,03 USD si se aplica el ~30 % de tokens de más.
  - **Orden de magnitud:** entre 25 y 50 USD al mes por cada 1.000 conversaciones.
  - Como referencia oficial, la página de precios calcula unos **37 USD por 10.000 tickets** de unos 3.700 tokens cada uno con Haiku 4.5.

### 4.2 Prompt caching

Fuentes (acceso 2026-09-27):
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching.md
- https://platform.claude.com/docs/en/about-claude/pricing.md
- https://platform.claude.com/docs/en/api/rate-limits.md

- **Precios relativos a la entrada base:**
  - Escritura con TTL de 5 minutos: ×1,25.
  - Escritura con TTL de 1 hora: ×2.
  - Lectura: ×0,1.
  - La caché de 5 minutos compensa desde la primera lectura.
- **TTL:** 5 minutos por defecto, y el plazo se renueva sin coste cada vez que se usa la caché. Opcionalmente, `ttl: "1h"`.
- **Caché automática:** basta con un único `cache_control` al nivel superior de la petición; el punto de corte avanza solo a medida que crece la conversación. Se pueden fijar hasta **4 puntos de corte explícitos**.
- **Invalidación:** la caché es un prefijo con el orden `tools` → `system` → `messages`. Cambiar un nivel invalida ese nivel y todos los siguientes. Por eso el system prompt tiene que ser **estable**: sin fechas ni identificadores variables.
- **Tamaño mínimo:** por debajo del mínimo del modelo, la petición **no se cachea y no da error**. Esto afecta a Haiku 4.5, con un mínimo de 4.096 tokens.
- **Rate limits:** en la mayoría de modelos, los tokens leídos de caché **no cuentan para el ITPM**.
- **ZDR:** el prompt caching es compatible con ZDR. Las representaciones de caché se mantienen solo en memoria durante el TTL (https://platform.claude.com/docs/en/manage-claude/api-and-data-retention).

### 4.3 Tool use (consultar huecos y crear solicitud de cita)

Fuentes (acceso 2026-09-27):
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview.md
- https://platform.claude.com/docs/en/api/errors

**Cómo funciona**
- **Herramientas de cliente.** Claude responde con `stop_reason: "tool_use"` y uno o varios bloques `tool_use`. Tu servidor ejecuta la operación y devuelve un `tool_result`.
- **Herramientas de servidor** (como `web_search`). Las ejecuta Anthropic y el resultado llega en la misma respuesta.
- **Coste.** Las definiciones de las herramientas cuentan como tokens de entrada. Además, la API añade un system prompt de tool use cuyo tamaño aparece en la tabla de 4.1.
- **`strict: true`.** Garantiza que las llamadas cumplen el esquema de la herramienta.
- **`tool_choice: {type: "auto", disable_parallel_tool_use: true}`.** Limita a una llamada de herramienta por turno.
- **Parámetros inventados.** La documentación advierte de que, si faltan parámetros obligatorios, **Sonnet puede inventar un valor razonable** en lugar de preguntar. Por eso el servidor tiene que **validar y pedir confirmación**.
- **Opus 5.5.** No admite `tool_choice` forzado (`any` o `tool`) y devuelve 400; hay que usar `auto`.

**Herramientas propuestas (diseño propio)**
- `consultar_huecos(servicio, fecha)`: solo lectura.
- `crear_solicitud_cita(servicio, fecha_hora, nombre, contacto)`: crea una solicitud **pendiente**. La cita la **confirma una persona**; el bot nunca la da por confirmada.
- `derivar_a_humano(motivo)`: devuelve el WhatsApp o el teléfono reales.

**Nota sobre el alcance actual.** Según la memoria del proyecto, el demo actual gestiona las citas como demostración, sin backend, por decisión de diseño. Estas herramientas son para el servidor futuro.

### 4.4 Streaming

Fuentes (acceso 2026-09-27):
- https://platform.claude.com/docs/en/build-with-claude/streaming.md
- https://platform.claude.com/docs/en/api/errors
- https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript

- **Activación:** se pone `"stream": true` y la respuesta llega por **SSE**.
- **Secuencia de eventos:** `message_start` → `content_block_start` / `content_block_delta` / `content_block_stop` → `message_delta` → `message_stop`. Puede haber eventos `ping` intercalados.
- **Errores:** pueden llegar **dentro del stream**, después de un HTTP 200. Por ejemplo, `overloaded_error`, que equivale al HTTP 529.
- **Eventos nuevos:** hay que tolerar tipos de evento desconocidos, porque pueden añadirse en el futuro.
- **Helpers del SDK:** `messages.stream(...)` y `finalMessage()`.
- **Peticiones largas:** conviene hacerlas en streaming para no chocar con los timeouts.
- **Diseño:** en la web, el servidor reenvía el stream al navegador por SSE. En WhatsApp se envía la respuesta completa, sin streaming al usuario.

### 4.5 Límites de gasto, rate limits y claves en la Console

Fuentes (acceso 2026-09-27):
- https://platform.claude.com/docs/en/api/rate-limits.md
- https://platform.claude.com/docs/en/api/overview
- https://platform.claude.com/docs/en/manage-claude/authentication

**Tope mensual por tier**

| Tier | Tope mensual |
|---|---|
| Start | 500 USD |
| Build | 1.000 USD |
| Scale | 200.000 USD |

- Las organizaciones nuevas pueden empezar en un tier **Evaluation**, con límites más bajos.
- Al llegar al tope del tier se devuelve un **429 sin `retry-after`** con `error_code: enforced_spend_limit_reached`. El acceso vuelve el día 1 del mes siguiente.

**Límite propio**
- Se puede fijar un límite más bajo en Settings → Billing.
- Al alcanzarlo se devuelve un **400 `invalid_request_error`**.

**Por workspace**
- Se pueden poner **límites de gasto y de rate propios** en cada workspace, salvo en el Default Workspace.
- Los límites de la organización se aplican siempre, aunque la suma de los workspaces sea mayor.

**Rate limits del tier Start** (iguales para Haiku 4.5 y Sonnet 5)
- 1.000 RPM.
- 2.000.000 ITPM.
- 400.000 OTPM.
- Si se superan, llega un 429 con `retry-after`.
- Los SDK reintentan 2 veces por defecto.
- Existen además «acceleration limits» ante subidas bruscas del tráfico, así que hay que aumentarlo de forma gradual.

**Claves**
- Usar una **service account key** para producción, limitada a un workspace y con caducidad.
- Guardarla en un gestor de secretos.
- «Disable» es reversible; «Delete» es permanente.

### 4.6 Retención de datos y ZDR

Fuentes (acceso 2026-09-27):
- https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data (actualizada el 2026-07-01)
- https://platform.claude.com/docs/en/manage-claude/api-and-data-retention

**Clientes comerciales (API)**
- Anthropic **borra las entradas y salidas en un plazo de 30 días**.
- Si hay infracción de la política de uso, conserva entradas y salidas hasta **2 años** y las puntuaciones de clasificación hasta **7 años**.
- El feedback que se envía se conserva **5 años**.
- Todo esto aplica salvo que se haya pactado otra cosa, como ZDR.

**Lo que dice la documentación de la plataforma**
- Los datos retenidos **nunca** se usan para entrenar sin permiso expreso.
- Afirma también que el contenido de las conversaciones no se retiene por defecto, salvo en los «Covered Models» (Fable 5/5.1 y Mythos), que exigen 30 días.
- ⚠️ Esta redacción no coincide con la del centro de privacidad. Para el registro de actividades de tratamiento, lo prudente es asumir **30 días**.

**ZDR**
- Hay que **pedirlo al equipo de ventas** y se activa por organización.
- Cubre la Messages API y la Token Counting API, en las funciones elegibles.
- No cubre la Console ni el playground, Batches (retención de 29 días), la ejecución de código ni Managed Agents.
- **CORS no está disponible con ZDR.**
- Incluso con ZDR, el contenido marcado por los sistemas de trust & safety puede conservarse hasta 2 años.
- Requisitos mínimos o precio de ZDR para una pyme: **NO CONFIRMADO**. Parece un acuerdo de tipo empresarial.

### 4.7 Términos comerciales y DPA

Fuentes (acceso 2026-09-27):
- https://www.anthropic.com/legal/commercial-terms
- https://www.anthropic.com/legal/data-processing-addendum
- https://code.claude.com/docs/en/legal-and-compliance

**Commercial Terms** (vigentes desde el 2025-06-17, según la página)
- Anthropic **no puede entrenar modelos** con el contenido del cliente.
- El **DPA se incorpora por referencia**.
- El cliente es **titular de los outputs**.
- Se permite usar el servicio para dar funcionalidad a productos destinados a los clientes y usuarios finales del propio cliente.

**DPA** (vigente desde el 2025-02-24)
- El cliente es el **responsable** del tratamiento y Anthropic el **encargado**.
- Incluye las **Cláusulas Contractuales Tipo de la UE** (módulos 2 y 3, con la ley de Irlanda), el addendum del Reino Unido y el suizo.
- La lista de subencargados está en https://www.anthropic.com/subprocessors.

**Implicación para el RGPD.** Conviene contrastarlo con `docs/research/legal-rgpd.md`:
- El salón, como responsable, tendría que informar de que los mensajes del chat los trata Anthropic, un encargado en EE. UU. con SCC.
- Debe minimizar los datos personales que se recogen.
- **No debe recoger datos de salud por el bot**, por ejemplo alergias a pegamentos o productos, porque son datos de categoría especial.

### 4.8 Residencia e inferencia en la UE

Fuentes (acceso 2026-09-27):
- https://platform.claude.com/docs/en/manage-claude/data-residency
- https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai

**Claude API directa**
- `inference_geo` solo admite `"global"` (por defecto) o `"us"`.
- `"us"` tiene un recargo de **×1,1** y solo funciona en Claude 4.6 y posteriores. Con Haiku 4.5 devuelve un 400.
- El **geo del workspace**, que decide dónde se almacenan los datos en reposo, solo admite `"us"` y no se puede cambiar después.
- **Conclusión: a 2026-09-27 no hay inferencia ni almacenamiento en la UE en la API directa.**

**Alternativa: Google Cloud (Agent Platform / Vertex)**
- Ofrece endpoints **multi-región `eu`** con un **10 % de sobreprecio**.
- El tratamiento de datos lo rige Google.
- Algunas funciones no están disponibles, como Batches o la Files API.
- Qué modelos concretos están en `eu`, incluidos Haiku 4.5 y Sonnet 5, está **NO CONFIRMADO**: hay que comprobarlo en Model Garden.

**Alternativa: Amazon Bedrock**
- Tiene endpoints regionales.
- Qué regiones de la UE hay para cada modelo está **NO CONFIRMADO**: no se ha verificado en esta investigación.

---

## Implicaciones para el diseño

### A. Por qué NO se puede meter ninguna clave en la web estática

1. **Una web estática es pública por definición.** Todo lo que entra en `dist/` puede leerlo cualquiera, y además el repositorio está en GitHub. Ninguna «ofuscación» protege una clave que el navegador tiene que enviar.
2. **La propia documentación del SDK lo prohíbe en la práctica.** El navegador viene bloqueado por defecto. `dangerouslyAllowBrowser` solo se contempla para herramientas internas o depuración temporal, y una web pública es producción con usuarios desconocidos.
3. **No habría control de gasto ni de abuso.** Cualquiera podría consumir hasta el tope mensual de la organización. Sin servidor no se pueden aplicar límites por usuario o IP, filtros ni registros.
4. **Un token de suscripción tampoco vale.** Aunque se tuviera uno de verdad, Anthropic reserva el OAuth para el uso ordinario de Claude Code y de sus apps. Usarlo en un producto va contra sus condiciones y puede provocar medidas sin aviso (pregunta 2).
5. **La clave `sk-proj-…` que se pegó no es de Anthropic y ya está expuesta.** Hay que revocarla. El repositorio está limpio (verificado).

### B. Esqueleto de arquitectura del servidor futuro

```
[Navegador · web del salón en GitHub Pages (estática, SIN claves)]
        │  POST https://api.<dominio-propio>/chat
        │  { sessionId, mensaje }            (URL pública, no es un secreto)
        ▼
[Endpoint propio (serverless o VPS), HTTPS]
   ├─ CORS: solo el origen de la web del salón
   ├─ Anti-abuso: rate limit por IP/sesión · longitud máx. de mensaje
   │             · nº máx. de turnos por sesión · desafío anti-bot en el widget
   ├─ Secreto: ANTHROPIC_API_KEY en variable de entorno / gestor de secretos
   │           (service account key · workspace dedicado "asistente-salon" · con caducidad)
   ├─ Núcleo del asistente
   │    · system prompt ESTABLE con la info del salón (cacheable; sin fechas dentro)
   │    · modelo en variable de entorno (CLAUDE_MODEL = claude-sonnet-5 | claude-haiku-4-5)
   │    · max_tokens acotado (p. ej. 400–600) · effort "low" en Sonnet 5
   │    · tools: consultar_huecos (lectura) · crear_solicitud_cita (PENDIENTE,
   │             confirma una persona) · derivar_a_humano (WhatsApp/tel reales)
   │    · validación en servidor de TODO input de herramienta (strict: true + checks)
   ├─ Web: stream de Claude → re-emitido al navegador por SSE
   ├─ Errores: 429/529 → reintento (SDK: 2 por defecto) y, si falla,
   │           mensaje de respaldo con WhatsApp/teléfono reales
   └─ Logs: sin datos personales; retención corta y documentada
        ▲
[Webhook de WhatsApp Business] ── mismo núcleo, respuesta completa (sin streaming)
```

### C. Límites y controles concretos

- **Console:**
  - Workspace dedicado con **límite de gasto mensual bajo**, por ejemplo de 20 a 50 USD al principio.
  - **Límite de gasto de la organización** en Billing.
  - Límites de rate del workspace por debajo de los de la organización.
- **Claves:**
  - Service account key limitada al workspace, con caducidad y rotación periódica.
  - Nunca en el repositorio. La variable de entorno solo existe en el servidor.
- **Coste por petición:**
  - `max_tokens` acotado.
  - Prompt estable y cacheable. Con Sonnet 5 se cachea a partir de 1.024 tokens; con Haiku 4.5, a partir de 4.096.
  - Historial recortado a los últimos N turnos.
- **Datos:**
  - Aviso de privacidad actualizado: encargado Anthropic, EE. UU., SCC, 30 días.
  - El bot no pide datos de salud.
  - Minimizar nombre y teléfono y usarlos solo en `crear_solicitud_cita`.
- **Decisión de residencia:** si el salón exige inferencia en la UE, la Claude API directa no la ofrece hoy. La alternativa es Google Cloud `eu`, con un 10 % más de coste y la disponibilidad de modelos por confirmar.

### D. Qué preparar ya en la web estática, sin tocar claves

- Encapsular el guion local tras una interfaz del tipo `responder(mensaje, historial) → respuesta`. Así, cuando llegue el servidor, se sustituye por un `fetch` al endpoint propio sin cambiar la UI.
- La URL del endpoint puede ir en la configuración de la web, porque **no es un secreto**. La clave **nunca**.
