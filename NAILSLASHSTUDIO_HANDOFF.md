# HANDOFF — Nails Lash Studio → `NailsLashStudioWeb`

> Extracción de features del bundle de Claude Design (`Sitio_web_salón_de_uñas-handoff.zip`),
> cruzada con los patrones de `WebEmpresa`, `TemplateSSDUncleBob` y `DocsTemplateSSDUncleBob`,
> más lo que he encontrado en Jira/Confluence/Drive para este cliente.
> Formato: mismo esqueleto que `WebEmpresa/design/HANDOFF.md` y `project-spec.md` (comprobado en el repo).
>
> **Actualización 19/07/2026, tras revisión tuya:** paleta y stack ya decididos — **1a Rosa monocromo** + **Vite/React/SCSS Modules igual que `WebEmpresa`**. §5, §7, §8, §9 y §11 actualizados en consecuencia; `_tokens.scss` real adjunto, listo para copiar a `src/styles/`.
>
> **Segunda actualización, misma fecha:** los "Comportamientos numerados" de la §3 ya están formalizados como **14 archivos `.feature` reales** (Gherkin completo, `Given/When/Then`, tags `@sN`), en `nailslashstudio-features.zip` — 70 escenarios en total. Descomprimir directamente en `features/` del repo nuevo. Las listas numeradas de la §3 se mantienen como referencia/trazabilidad de origen, pero el contrato que aprueba la puerta humana es ya el `.feature`, no la prosa.

---

## 0 · Antes de nada — 5 hallazgos que cambian el alcance

1. **El repo que diste (`SistemaDeMemoriaUncleBob`) no existe con ese nombre.** Los repos reales de tu org son `TemplateSSDUncleBob` (arnés SDD genérico) y `DocsTemplateSSDUncleBob` (su documentación publicada en `cenit-digital.github.io/DocsTemplateSSDUncleBob`). Ambos son públicos — los he descargado y leído enteros. Asumo que te referías a estos dos. Si en realidad existe un tercer repo con otro nombre, dímelo y lo reviso también.
2. **`NailsLashStudioWeb` no responde bajo ningún nombre que he probado** (`api.github.com`, `codeload.github.com`, `raw.githubusercontent.com`, con variantes de mayúsculas/guiones). `WebEmpresa`, `TemplateSSDUncleBob` y `DocsTemplateSSDUncleBob` sí son públicos y responden. El patrón más probable es que el repo **todavía no se ha creado** (tiene sentido: es entrega de cliente, no herramienta interna). Si ya existe y es privado, dímelo y lo miro por Chrome con tu sesión.
3. **Jira y Confluence no tienen nada de este cliente** — he buscado "uñas", "nails", "salón", "lash studio" en `WEB` y en todo Confluence: cero resultados. Es lienzo en blanco.
4. **En tu Drive hay una carpeta "CLIENTE UÑAS JOHN" (creada 8 jul 2026) con una nota tuya que el prototipo de hoy (19 jul 2026) todavía no recoge del todo.** La nota dice, literal: *"encima del FAQ, reseñas, arreglar título con tipografía hablada. Carrusel de imágenes antes del chatbot."* He verificado los 3 puntos contra el HTML de hoy — están en la sección 4 de este documento, con el estado real de cada uno.
5. **Es un cliente real, no una plantilla genérica.** Encontré el enlace de Google Maps de "Nails Lash Studio" junto al Zoco de Villalba (40.5179875, -3.9226688). Todos los datos de contacto del prototipo (dirección, teléfono, @instagram, email) son **placeholder de demo** — hay que sustituirlos antes de publicar. No tengo los datos reales del negocio; los marco como pendientes, no los invento.

---

## 1 · Qué hay en el bundle

Bundle de Claude Design (`claude.ai/design`), formato `.dc.html` — prototipo HTML/CSS/JS, no producción. Contenido:

```
project/
├── README.md                          (instrucciones del propio bundle — leídas y aplicadas)
├── nails lash studio - Opciones.dc.html   ← el archivo "abierto" al exportar (leído entero primero)
├── Opcion-1-Rosa.dc.html               (462 líneas) — paleta "Rosa monocromo"
├── Opcion-2-Azul.dc.html               (462 líneas) — paleta "Azules claros"
├── Opcion-3-Amarillo.dc.html           (462 líneas) — paleta "Amarillos y rosas"
├── salon-data.js                       — modelo de datos completo (única fuente de contenido)
├── image-slot.js / support.js          — runtime del propio Claude Design (NO se porta; ver más abajo)
├── brush.png                           — asset del efecto pincel del hero
├── ph-unas.png, ph-facial.png, ph-depil.png, ph-map.png,
│   ph-woman0.png … ph-woman6.png       — fotos de stock/placeholder (11 imágenes)
├── .image-slots.state.json             — 1 entrada huérfana ("blush-hero"), no referenciada por ningún .dc.html actual; ignorar
└── uploads/ (8 imágenes)               — material de referencia pegado durante la sesión de diseño (moodboard/inspiración). No están enlazadas en el HTML — no forman parte del prototipo funcional.
```

**Confirmado por diff exacto entre los 3 `.dc.html`:** las tres opciones son **byte-idénticas** salvo (a) las variables CSS de paleta en la raíz y (b) el prefijo `s1-/s2-/s3-` de los `id` de imagen (namespacing de assets por variante) y (c) en la opción 3 el gradiente del hero tiene 3 paradas de color en vez de 2. Estructura, copy, datos y comportamiento: **100% iguales**. Esto es literalmente lo que dice la página selectora: *"Las tres comparten la nueva estructura... y cambian solo el color."*

`image-slot.js` y `support.js` son el motor de Claude Design (`support.js` trae el comentario `GENERATED from dc-runtime/src/*.ts — do not edit`); `image-slot.js` implementa `<image-slot>`, un placeholder de imagen "solo para diseño" (*"Outside the omelette runtime the slot is read-only"*). Ninguno de los dos se traduce a producción — en `NailsLashStudioWeb` esas posiciones serán `<img>` reales con las fotos definitivas. Esto es exactamente lo que dice el propio `README.md` del bundle: *"recreate them pixel-perfectly... don't copy the prototype's internal structure."*

---

## 2 · Decisiones ya cerradas en el prototipo (verbatim del `.dc.html`)

### 2.1 · Tres paletas — 1a Rosa monocromo activa (decisión en §5)

| Token | 1a · Rosa monocromo | 1b · Azules claros | 1c · Amarillos y rosas |
|---|---|---|---|
| `--bg` | `#FDF4F7` | `#F1F8FB` | `#FFF8EE` |
| `--surface` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| `--surface2` | `#FBE7EF` | `#E4F1F7` | `#FDEFC9` |
| `--ink` (titulares) | `#B0466A` | `#2E6E8E` | `#C25B7C` |
| `--text` | `#5E404A` | `#33505E` | `#6A4A46` |
| `--muted` | `#9C7F89` | `#7C97A5` | `#A98C82` |
| `--accent` | `#C05576` | `#4E95B5` | `#E77CA3` |
| `--accent-dark` | `#A23E5F` | `#347790` | `#CF5E88` |
| `--accent-2` | `#E38AAE` | `#86C2DC` | `#F4C63D` |
| `--accent-soft` | `#F7DDE8` | `#DCEEF5` | `#FCE1EA` |
| `--line` | `rgba(176,70,106,.16)` | `rgba(46,110,142,.16)` | `rgba(194,91,124,.18)` |
| `--brush` (color del trazo del pincel del hero) | `#C05576` | `#4E95B5` | `#E77CA3` |
| Fondo del hero | radial 2 paradas `--accent-soft → --bg` | igual | radial 3 paradas `#FCE1EA → #FDEFC9 → --bg` (única diferencia estructural entre opciones) |

Todo se consume vía `var(--token)` — mismo criterio que exige `docs/conventions.md` de `WebEmpresa` ("Consumir colores vía `var(--color-…)`"). Aquí el prototipo usa nombres cortos (`--ink`, `--accent`…) en vez de `--color-*`; **decisión de nomenclatura pendiente** en §7 para no romper la convención del repo si se reutilizan mixins de `WebEmpresa`.

### 2.2 · Tipografía

- **Gilda Display** (serif) — eyebrows en mayúscula, titulares `<h2>`, precios de ofertas.
- **Great Vibes** (script/manuscrita) — **solo** para "Nails Lash" en el hero. Esta es casi con toda seguridad la respuesta a tu nota *"arreglar título con tipografía hablada"* — Great Vibes es justo una tipografía de trazo manuscrito/"hablado". Lo marco como **resuelto salvo que confirmes lo contrario** (no puedo verificar contra la iteración anterior que no tengo).
- **Manrope** (sans, pesos 300/400/500/600/700) — todo el resto: body, nav, botones, precios de servicios, chat.
- Ninguna de las tres coincide con el par **Outfit + DM Sans** de `WebEmpresa` (`RF-STACK-001` / `docs/DESIGN_SYSTEM.md §4`). Es intencional y correcto — es la identidad de un cliente distinto, no la marca Cénit — pero lo marco explícito para que nadie lo "corrija" por costumbre.

### 2.3 · Radios, sombras, espaciado (para levantar `_tokens.scss` del nuevo repo)

- Radio de tarjetas grandes: `20px` / `22px`. Radio de imágenes de categoría: `22px`. Pills/botones: `40px` (o `999px` equivalente). Chat: burbujas `4px 14px 14px 14px` (bot) / `14px 4px 14px 14px` (usuario) — el "pico" asimétrico típico de WhatsApp.
- Contenedor: `max-width:1200px` (`1220px` en Equipo), padding lateral `40px`.
- Secciones: `padding:92-96px 0`.
- Sombras: `box-shadow` con `color-mix(in srgb, var(--accent) N%, transparent)` — **usa `color-mix()`**, función CSS relativamente reciente (Baseline ampliamente disponible desde 2023, sin problema de soporte real en 2026, pero anótalo en `docs/DESIGN_SYSTEM.md` del nuevo repo igual que se documentó en su día lo de CSS Scroll-Driven Animations en `WebEmpresa`).

---

## 3 · Inventario de features

Mismo formato que `project-spec.md` de `WebEmpresa`: por feature → Comportamiento, Contrato observable, Decisiones, Casos límite, Restricciones de implementación, Qué NO cambia, y una lista numerada de comportamientos candidatos a escenarios `@s1..@sn` para que `gherkin_author` los destile directamente. Fuente de cada dato: línea exacta del `.dc.html` o de `salon-data.js` — nada inventado.

### #1 · `fundamentos_marca` — Tokens, tipografía y assets base

**Comportamiento.** Todo el sitio consume 3 paletas intercambiables (§2.1) vía variables CSS en la raíz, dos familias tipográficas de titular (Gilda Display serif + Great Vibes manuscrita solo-hero) y Manrope para el resto. El asset `brush.png` es la única imagen "de sistema" (no de contenido).

**Contrato observable.**
- Con la paleta activa `X`, todo color de superficie/texto/acento en pantalla es uno de los 11 tokens de esa paleta — no hay colores sueltos fuera de `_tokens.scss`.
- El wordmark `nails lash studio` en el header usa Gilda Display; el `<h1>` del hero usa Great Vibes para "Nails Lash" y Manrope 600 mayúsculas espaciadas para "Studio".

**Decisiones (con porqué).**
- Nomenclatura de tokens: el prototipo usa `--ink/--text/--muted/--accent/--accent-dark/--accent-2/--accent-soft/--brush` (8 semánticos + bg/surface/surface2/line/on-accent). **Sigue pendiente decidir** si se adopta tal cual o se remapea a `--color-*` de `WebEmpresa` — esto no lo resuelven ni la paleta ni el stack, es una tercera decisión independiente. Para el `_tokens.scss` que te adjunto he tenido que tomar un criterio de partida para que el archivo sea usable ya: **mantengo la nomenclatura semántica del prototipo tal cual** (`--ink`, `--accent`…), sin remapear a `--color-*`, porque son dos sistemas de marca conceptualmente distintos (Cénit tiene 2 temas claro/oscuro de una misma marca; este cliente tiene 1 paleta fija) y forzar el mismo prefijo no aporta nada salvo que decidáis unificar un design-system compartido entre repos más adelante. Es una asunción de trabajo, no una decisión cerrada — dímelo si lo quieres de otra forma y lo remapeo.
- Las 3 paletas conviven como 3 `data-theme` (o 3 builds) — no como claro/oscuro (esto **no** es un tema oscuro, son 3 identidades de marca alternativas para que el cliente elija una).

**Casos límite.**
- Si `salon-data.js` no ha cargado aún (`state.data === null`), todo el árbol debe tener un estado vacío coherente — el propio prototipo ya lo resuelve con un objeto `ready:false` de fallback (línea 415 del `.dc.html`); replicarlo como *loading state* o, si se sirve como SSG con datos estáticos en build-time (patrón `WebEmpresa`), este caso desaparece por diseño.

**Restricciones de implementación (para `gherkin_author` / `tdd_craftsman`).**
- Un componente/token de tema por paleta, no 3 copias de cada componente.
- `color-mix()` en sombras: usar tal cual, es Baseline amplio en 2026.
- No usar `<image-slot>` ni `support.js` — son herramienta de diseño, no producción (confirmado en `README.md` del bundle y por inspección directa de ambos ficheros).

**Qué NO cambia.** El contenido de `salon-data.js` es la única fuente de verdad de texto/precios — no re-teclear copy a mano en los componentes.

**Comportamientos numerados (candidatos a `@s1..@sn`):**
1. Al aplicar la paleta Rosa, el acento de botones es exactamente `#C05576`.
2. Al aplicar la paleta Azul, el acento de botones es exactamente `#4E95B5`.
3. Al aplicar la paleta Amarillo, el acento de botones es exactamente `#E77CA3` y el fondo del hero usa 3 paradas de gradiente.
4. El wordmark del header renderiza en `Gilda Display`.
5. "Nails Lash" en el hero renderiza en `Great Vibes`.

---

### #2 · `nav` — Cabecera

**Comportamiento.** Cabecera `sticky` (`top:0; z-index:50`) con fondo semitransparente + `backdrop-filter:blur(14px)`. Wordmark a la izquierda (enlaza a `#top`). A la derecha, navegación por anclas generada desde `SALON.nav` (Uñas/Facial/Depilación/Destacados/Ofertas/Equipo) + botón "Reservar" (enlaza a `#equipo`) con estilo de píldora rellena.

**Contrato observable.**
- 6 enlaces de navegación, en este orden exacto: Uñas → Facial → Depilación → Destacados → Ofertas → Equipo (`salon-data.js`, array `nav`).
- El botón "Reservar" es visualmente distinto del resto (fondo `--accent`, texto `--on-accent`, radio `40px`) — no es un enlace de texto más.
- La cabecera permanece fija al hacer scroll (`position:sticky`).

**Decisiones (con porqué).** No hay menú móvil en el prototipo — a **767px** (breakpoint real de `MOBILE_QUERY` en `WebEmpresa/src/lib/useIsMobile.ts` y `HeaderNav.module.scss`) los 6 enlaces + CTA no caben en una fila. **Gap real, no soluble sin decisión de UX** — ver §4.3.

**Casos límite.**
- Scroll hasta una sección: cada `<section>` tiene `scroll-margin-top:66px` (`70px` en el hero) para no quedar tapada por la cabecera sticky — replicar el mismo margen o la navegación por ancla queda con el título cortado.

**Restricciones de implementación.** Mismo patrón de header sticky + blur que `WebEmpresa/src/components/Header.tsx` — reutilizable casi 1:1 salvo el contenido del nav.

**Qué NO cambia.** El orden de las 6 secciones en el nav debe coincidir con el orden real de aparición en la página (actualmente sí coincide, verificado línea a línea).

**Comportamientos numerados:**
1. La cabecera permanece visible (`position:sticky`) tras hacer scroll más allá de su altura.
2. Clic en "Uñas" del nav desplaza el scroll a la sección `#unas` sin que el título quede tapado por la cabecera.
3. El botón "Reservar" del nav enlaza a `#equipo`.
4. *(Gap — sin escenario posible hasta decidir §4.3)* comportamiento del nav por debajo de 767px.

---

### #3 · `hero` — Portada con efecto de pincel

**Comportamiento.** Eyebrow ("Uñas · Facial · Depilación · Madrid") con fade-in. Titular "Nails Lash Studio" revelado por una animación de "pintado" (`clip-path: inset(0 100% 0 0) → inset(0 0 0 0)`, 4.8s) sincronizada con un sweep de la imagen `brush.png` que cruza el texto de izquierda a derecha y rota `-8deg → -5deg`. Subtítulo y 3 CTAs (Reservar cita / Ver servicios / ↺ Repetir) con fade-up escalonado. Indicador "desliza" con animación `bob` infinita.

**Contrato observable.**
- La animación de pintado dura **4.8s** con `cubic-bezier(.5,0,.25,1)` y arranca a los **0.5s** de montar el componente.
- **Se repite automáticamente** cada vez que el hero vuelve a entrar en el viewport (`IntersectionObserver` con `threshold:0.35` sobre el contenedor del brush, línea 385-388 del `.dc.html`) — esto es el *"se repite al entrar en pantalla"* que menciona explícitamente la página selectora de opciones.
- El botón "↺ Repetir" fuerza la misma animación bajo demanda (`replayBrush()`: quita `animation`, fuerza reflow con `el.offsetWidth`, la reaplica).
- 4 CTAs con distinto peso visual: "Reservar cita" (relleno), "Ver servicios" (contorno), "↺ Repetir" (texto plano) — más el nav.

**Decisiones (con porqué).** El "repetir al entrar en pantalla" es el mismo patrón familiar de `WebEmpresa` (`logo_draw_animation`, `features/logo_draw_animation.feature`, `IntersectionObserver` + replay) — mismo mecanismo, distinto elemento. Umbral aquí es `0.35` frente al `rootMargin: -40% 0px -40% 0px` (viewport centrado) documentado para `servicios_scroll_reveal` en `WebEmpresa` — **son dos patrones de disparo distintos** (umbral simple vs. rootMargin centrado); mantenerlos diferenciados y no fusionarlos sin decidirlo explícitamente, porque cambian cuándo dispara la animación.

**Casos límite.**
- `prefers-reduced-motion`: el prototipo **no lo contempla** (ni aquí ni en ningún otro `@keyframes` del bundle). `WebEmpresa` tampoco lo documenta explícito en lo que he leído de `docs/DESIGN_SYSTEM.md` — **gap compartido**, lo marco una vez en §4 en vez de repetirlo en cada feature con animación.
- Reentradas rápidas en el viewport (scroll arriba-abajo repetido) — el `IntersectionObserver` no tiene *debounce*; cada `isIntersecting:true` relanza `replayBrush()`. Verificar que relanzar a media animación no deja el `clip-path` en estado intermedio roto (el `void el.offsetWidth` fuerza reflow antes de reaplicar, así que en el prototipo no ocurre — mantener esa misma secuencia al portar).

**Restricciones de implementación.** SCSS `@keyframes` + hook de `IntersectionObserver` — literalmente el patrón ya validado y en producción en `WebEmpresa` (~15 líneas, documentado en tu propia memoria de proyecto). No hace falta ninguna librería de animación para esto.

**Qué NO cambia.** Duración 4.8s y el retraso de 0.5s son valores de diseño específicos de este efecto — no son los mismos 1.1–1.4s de `WebEmpresa`; no armonizar por costumbre sin que alguien lo decida.

**Comportamientos numerados:**
1. Al montar la página, el titular del hero completa su animación de revelado en 4.8s.
2. Al hacer scroll fuera y volver a entrar el hero en el viewport, la animación de pincel se repite.
3. Al pulsar "↺ Repetir", la animación se relanza inmediatamente sin esperar a salir/entrar del viewport.
4. El enlace "Ver servicios" desplaza el scroll a `#unas`.
5. El enlace "Reservar cita" desplaza el scroll a `#equipo`.

---

### #4 · `categorias_servicios` — Uñas / Facial / Depilación

**Comportamiento.** Un mismo bloque se repite 3 veces (uno por categoría de `salon-data.js → categories`), alternando estructura de 2 columnas (lista de precios + foto). Cada categoría trae: eyebrow, título, intro, lista de ítems con precio, y CTA "Reservar {label}" → `#equipo`.

**Contrato observable — datos exactos (fuente única: `salon-data.js`, no reteclear):**

| Categoría | Título | Ítems (nombre → precio) |
|---|---|---|
| **Uñas** | "Manos y pies de revista" | Manicura semipermanente 25€ · Manicura rusa completa 30€ · Uñas acrílicas o gel 40€ · Relleno acrílico o gel 32€ · Pedicura spa completa 35€ · Nail art y diseño desde 5€ |
| **Facial** | "Tu piel, radiante" | Limpieza facial profunda 40€ · Tratamiento hidratante 45€ · Peeling y luminosidad 50€ · Lifting de pestañas 35€ · Diseño de cejas 15€ · Tinte de pestañas 12€ |
| **Depilación** | "Piel suave y cuidada" | Cejas 8€ · Labio superior 6€ · Axilas 12€ · Medias piernas 18€ · Piernas completas 28€ · Ingles o cavado 15€ |

- 6 ítems de precio por categoría, siempre en ese orden.
- Cada categoría tiene su propia imagen (`ph-unas.png` / `ph-facial.png` / `ph-depil.png`) en proporción `4/5`.

**Decisiones (con porqué).** Las 3 categorías comparten un único componente parametrizado (`sc-for` sobre `categories` en el prototipo) — no 3 componentes casi-duplicados. Esto es directamente aplicable con un `.map()` sobre un array de datos, sin lógica condicional por categoría.

**Casos límite.** Precio "desde 5 €" (nail art) es el único no fijo — el componente de precio debe aceptar texto libre, no asumir formato `NN €` siempre.

**Restricciones de implementación.** Un componente `CategoriaServicio` reutilizado 3 veces vía datos, siguiendo la convención de `WebEmpresa` (`docs/conventions.md`: "un componente por archivo… lógica en `src/lib/` como funciones puras").

**Qué NO cambia.** Los precios son los que aparecen arriba, verbatim de `salon-data.js` — **no inventar ni redondear ninguno** (instrucción explícita tuya: "no inventes nada"). Si el cliente real tiene otra lista de precios, es un cambio de contenido, no de estructura.

**Comportamientos numerados:**
1. La sección "Uñas" muestra exactamente 6 servicios con sus 6 precios listados arriba.
2. La sección "Facial" muestra exactamente 6 servicios con sus 6 precios listados arriba.
3. La sección "Depilación" muestra exactamente 6 servicios con sus 6 precios listados arriba.
4. El precio de "Nail art y diseño" se muestra como texto "desde 5 €", no como un número aislado.
5. El CTA de cada categoría enlaza a `#equipo`.

---

### #5 · `prueba_color` — Selector interactivo de esmalte ("Prueba tu color")

**Comportamiento.** Sección con (a) una mini-ilustración de 3 uñas (SVG/CSS, tamaños 46×86 / 48×104 / 50×118 px con brillo simulado) cuyo color de fondo cambia en vivo, y (b) una rejilla de 12 swatches circulares (`salon-data.js → colors`, 12 colores con nombre + hex) donde el swatch activo tiene un anillo doble. Al pulsar un swatch: las 3 uñas cambian de color con transición de 0.4s, y se muestra el nombre + hex del color activo.

**Contrato observable — los 12 colores (nombre → hex), verbatim:**

Rojo Carmín `#B11226` · Vino Tinto `#6E1E2A` · Nude Rosado `#E7C4B8` · Rosa Empolvado `#D9A7A1` · Coral Suave `#E98A7A` · Malva `#9B7B8E` · Champán `#E4D2B8` · Fucsia `#B33771` · Azul Noche `#26364F` · Verde Salvia `#8AA79B` · Negro Ónix `#1B1B1D` · Blanco Nácar `#F2ECE4`.

- Estado inicial: primer color de la lista (Rojo Carmín) activo por defecto.
- El swatch activo muestra un anillo `border:2px solid var(--accent)` desplazado `-6px` (`inset:-6px`) del propio círculo — no un simple cambio de borde del círculo en sí.
- CTA final "Reservar con este tono" → `#equipo`.

**Decisiones (con porqué).** Es **estado puramente de UI, sin persistencia** — no hay `localStorage` ni se envía el color elegido a ningún sitio en el prototipo (a diferencia del chat de reserva, que sí "recuerda" la elección dentro de la sesión de chat). Antes de implementar: **decidir si el tono elegido aquí debería pre-rellenar algo en el chat de reserva** (`reserva_chat`, #9) — el prototipo actual **no los conecta entre sí**, son dos piezas de estado independientes. Es una mejora razonable pero no está en el bundle — no la des por hecha sin confirmarlo.

**Casos límite.** 12 colores en rejilla de 6 columnas = exactamente 2 filas siempre — con el dato actual no hay caso de rejilla desigual, pero si el cliente pide más/menos colores en el futuro, la rejilla deja de cuadrar a 6 columnas limpias.

**Restricciones de implementación.** Estado local simple (`useState<number>` para el índice activo) — no hace falta gestor de estado global para esto (criterio `ponytail`/YAGNI de tu propio repo: *"Does this need to exist at all?... reach for stdlib/native before dependencies"*).

**Qué NO cambia.** El orden y los 12 nombres/hex de los colores — verbatim de `salon-data.js`, no inventar tonos nuevos ni renombrar los existentes.

**Comportamientos numerados:**
1. Al cargar la sección, "Rojo Carmín" (`#B11226`) está activo por defecto.
2. Al pulsar el swatch "Azul Noche", las 3 ilustraciones de uña cambian a `#26364F` y el nombre mostrado pasa a "Azul Noche".
3. El swatch activo muestra el anillo de selección; el resto no.
4. El CTA "Reservar con este tono" enlaza a `#equipo`.

---

### #6 · `servicios_destacados` — Servicios estrella

**Comportamiento.** Rejilla de 4 tarjetas, cada una con una etiqueta superior (tag), título y descripción corta.

**Contrato observable — verbatim de `salon-data.js → starServices`:**

| Tag | Título | Descripción |
|---|---|---|
| Top ventas | Manicura rusa | "La más pedida: acabado ultra limpio y durabilidad de semanas." |
| Favorito | Uñas acrílicas a medida | "Forma, largura y diseño personalizados por nuestras técnicas." |
| Recomendado | Limpieza facial premium | "Piel visiblemente luminosa desde la primera sesión." |
| Tendencia | Lifting de pestañas | "Mirada despierta y natural, sin mantenimiento diario." |

**Decisiones.** Puramente informativa — ninguna tarjeta enlaza a nada ni tiene estado. Sección de menor riesgo de implementación de todo el sitio.

**Casos límite.** Ninguno relevante — contenido estático de 4 elementos fijos.

**Restricciones de implementación.** Componente de tarjeta simple, reutilizable con `ofertas` (#7) a nivel de estilo de tarjeta (radios, sombra, `border`) pero **no** el mismo componente — `ofertas` tiene badge de descuento y precio, esta no.

**Qué NO cambia.** Las 4 tags son semánticamente distintas entre sí (Top ventas / Favorito / Recomendado / Tendencia) — no unificarlas en una sola etiqueta genérica tipo "Destacado".

**Comportamientos numerados:**
1. La sección muestra exactamente 4 tarjetas de servicio estrella con el tag, título y descripción de la tabla de arriba.

---

### #7 · `ofertas` — Promociones del mes

**Comportamiento.** 3 tarjetas con badge de descuento en la esquina, título, descripción, precio actual + precio tachado, y CTA "Reservar oferta" → `#equipo`.

**Contrato observable — verbatim de `salon-data.js → offers`:**

| Título | Descripción | Precio | Antes | Badge |
|---|---|---|---|---|
| Pack Manos Perfectas | Manicura semipermanente + diseño en dos uñas. | 29 € | 35 € | −17% |
| Dúo Uñas + Pestañas | Manicura rusa + lifting de pestañas en una sola visita. | 55 € | 65 € | Ahorra 10 € |
| Martes de Facial | Limpieza facial profunda todos los martes. | 32 € | 40 € | Solo martes |

**Decisiones.** El formato del badge **no es uniforme** — mezcla porcentaje ("−17%"), ahorro absoluto ("Ahorra 10 €") y restricción temporal ("Solo martes"). Es texto libre por diseño, no tres variantes de un mismo tipo — el componente debe aceptar cualquier string, no intentar tipar/calcular el badge a partir de precio/antes.

**Casos límite.** "Martes de Facial" es una oferta con restricción temporal real (solo aplica un día de la semana) que **no se valida en ningún sitio del prototipo** — es solo texto informativo, no hay lógica de "hoy es martes → mostrar/ocultar". Si se quiere lógica real de vigencia por día, es una decisión nueva, no algo que ya esté especificado.

**Restricciones de implementación.** Verificar que "−17%" es aproximadamente correcto (29/35 ≈ 0,829 → descuento real 17,1%) — coincide, no hace falta recalcular, pero si en el futuro cambian los precios habría que recalcular el badge a mano (no hay fórmula automática en el prototipo).

**Qué NO cambia.** Los 3 precios "antes/ahora" son los de la tabla — no inventar más ofertas ni cambiar los importes.

**Comportamientos numerados:**
1. La sección muestra exactamente 3 tarjetas de oferta con los datos de la tabla de arriba.
2. Cada tarjeta muestra el precio actual junto al precio anterior tachado.
3. El CTA de cada oferta enlaza a `#equipo`.

---

### #8 · `equipo_reservas` — Equipo y calendario de reserva (la feature más compleja del sitio)

**Comportamiento.** Rejilla de 7 tarjetas de profesional. Cada tarjeta trae, en este orden: foto, nombre + rol, especialidades (chips), **selector de día** (6 próximos días hábiles, excluyendo domingos), **selector de hora** (aparece solo tras elegir día; 6 franjas fijas), **botón de reserva** (habilitado solo con día+hora elegidos), y **reseña rotativa** con navegación ←/→. Tras reservar, la tarjeta cambia a un estado de confirmación con botón "Cambiar".

**Contrato observable.**
- **Equipo** (`salon-data.js → team`, verbatim): Lucía (Nail artist — Uñas, Nail art) · Carla (Esteticista — Facial, Depilación) · Andrea (Especialista en uñas — Uñas, Pedicura) · Nerea (Lash & brow — Facial, Pestañas) · Marta (Esteticista — Depilación, Facial) · Paula (Nail artist — Uñas, Nail art) · Sara (Manicurista — Uñas, Depilación).
- **Días**: se calculan en runtime desde "hoy", saltando domingos, hasta reunir 6 días (`componentDidMount`, líneas 380-384) — **no son fechas fijas del dataset**, son relativas a la fecha de carga de la página.
- **Horas** (`salon-data.js → timeSlots`, fijas): 10:00 · 11:30 · 13:00 · 16:00 · 17:30 · 19:00.
- El botón de reserva solo se habilita (`canBook`) cuando hay día **y** hora elegidos; si no, muestra un botón deshabilitado con el texto "Elige día y hora".
- El texto del botón habilitado es dinámico: `"Reservar · {dow} {day} · {hora}"` (p. ej. "Reservar · mié 22 · 16:00").
- Tras confirmar, el mensaje es `"Cita con {nombre} el {dow} {day} a las {hora}"` + nota "Te confirmaremos por WhatsApp." + botón "Cambiar" que resetea ese profesional a su estado inicial.
- **Reseñas por profesional**: cada tarjeta muestra 1 reseña de un pool rotativo de 5 (tomadas del `reviewPool` global de 10 reseñas, con un desplazamiento distinto por profesional: `p[(i*2+k)%n]` — la profesional `i` empieza en un punto distinto del pool). Botones ← → avanzan/retroceden la reseña mostrada para esa tarjeta, con **wrap-around** (módulo, nunca queda fuera de rango).
- El estado de cada tarjeta (día elegido / hora elegida / índice de reseña / reservado o no) es **independiente por profesional** — elegir día en la tarjeta de Lucía no afecta a la de Carla.

**Decisiones (con porqué).**
- Este es el componente con más estado de todo el sitio: 7 sub-estados independientes, cada uno con 4 campos (`day`, `time`, `rev`, `booked`). En React, esto es un `Record<number, {day, time, rev, booked}>` o 7 instancias de un componente con estado propio — **no** un único estado plano compartido (el prototipo ya evita ese error: `empGet`/`empSet` indexan por `i`).
- **No hay backend real** en el prototipo: "reservar" solo cambia estado local, no hay llamada de red ni persistencia. Antes de construir esto en `NailsLashStudioWeb`, hace falta decidir si la reserva real va contra algo (¿el mismo patrón de `n8n`/WhatsApp Business API que aparece en tu propio catálogo de servicios de Cénit Digital, o un simple `mailto`/webhook?) — **el prototipo no lo especifica**, es una decisión de arquitectura pendiente, no algo que se pueda inferir del handoff.

**Casos límite.**
- Cambiar de día **después** de elegir hora: el prototipo resetea la hora a `null` (`empDay` hace `{day:di, time:null}`) — si no se replica, quedaría una hora "fantasma" de un día distinto seleccionada.
- Navegar reseñas ← en la primera o → en la última: el módulo `((st.rev%5)+5)%5` garantiza wrap-around correcto incluso con `rev` negativo — importante si se reimplementa a mano, es fácil romper el signo con `%` en JS/TS.
- Todos los días calculados caen en el mismo mes o pueden cruzar mes/año — el cálculo usa `Date` nativo y ya lo resuelve; no hay caso especial de fin de mes que requiera lógica extra, pero si se testea con fecha fija hay que fijar el "hoy" del test (`vi.setSystemTime` en Vitest) para que no sea flaky.

**Restricciones de implementación (para `gherkin_author` / `tdd_craftsman`).**
- Es la feature con más candidatos a mutación (múltiples ramas de estado) — presupuestar más tiempo de `tdd_craftsman` y `mutation_tester` aquí que en cualquier otra.
- Testing Library + Vitest, como en `WebEmpresa/src/components/*.test.tsx` — cada transición de estado (elegir día → aparecen horas → elegir hora → se habilita reservar → reservar → confirmación → cambiar → vuelta al inicio) es un test independiente.

**Qué NO cambia.** Las 6 franjas horarias y los 7 nombres/roles/especialidades del equipo son datos reales del cliente (aunque el resto de contacto sea placeholder, esta lista de personas parece contenido real a mantener, no demo) — **confirmar con el cliente antes de asumirlo**, lo marco como probable pero no verificado.

**Comportamientos numerados:**
1. La sección muestra exactamente 7 tarjetas de profesional, en el orden: Lucía, Carla, Andrea, Nerea, Marta, Paula, Sara.
2. Al cargar, ninguna tarjeta muestra selector de hora hasta que se elige un día en esa tarjeta.
3. Elegir un día en la tarjeta de un profesional no afecta el estado de las demás tarjetas.
4. Con día y hora elegidos, el botón de reserva muestra el texto "Reservar · {día} · {hora}" y está habilitado.
5. Sin hora elegida, el botón muestra "Elige día y hora" y está deshabilitado.
6. Cambiar de día tras haber elegido una hora deselecciona la hora.
7. Confirmar una reserva sustituye el selector por un mensaje de confirmación con el nombre del día y la hora exactos, y un botón "Cambiar".
8. Pulsar "Cambiar" tras confirmar vuelve la tarjeta a su estado inicial (sin día ni hora).
9. Navegar la reseña de un profesional con → tras la última reseña del pool vuelve a la primera (no queda en blanco).

---

### #9 · `reserva_chat` — Chat de reserva simulado (estilo WhatsApp)

**Comportamiento.** Widget de chat con cabecera ("nails lash studio" · "en línea"), historial de mensajes con scroll automático al último, y un flujo guiado de 4 pasos con opciones tipo botón salvo el último paso (nombre), que es un campo de texto libre.

**Contrato observable — guion exacto (`salon-data.js → chatFlow`), verbatim:**

1. Bot: *"¡Hola! Soy el asistente de nails lash studio ✨ ¿Qué te gustaría reservar?"* → opciones: Uñas / Facial / Depilación / Pestañas.
2. Bot: *"¡Perfecto! ¿Qué día te viene mejor?"* → opciones: Entre semana / Este fin de semana / Lo antes posible.
3. Bot: *"Genial. ¿Prefieres alguna franja horaria?"* → opciones: Por la mañana / Por la tarde / Me es indiferente.
4. Bot: *"Casi listo. ¿A qué nombre hago la reserva?"* → campo de texto libre, placeholder "Escribe tu nombre…".
5. Al enviar el nombre, mensaje final: *"¡Gracias, {nombre}! ✨ Tu solicitud: {servicio} · {día} · {franja}. Te confirmaremos la hora exacta por WhatsApp en unos minutos. ¡Te esperamos en nails lash studio!"* + botón "Reservar otra cita" que reinicia el guion desde el paso 1.
- Enter en el campo de texto envía, igual que el botón →.
- El scroll del historial baja automáticamente a cada mensaje nuevo (`componentDidUpdate`: `this._chatEl.scrollTop = this._chatEl.scrollHeight`).

**Decisiones (con porqué).** Es un **árbol de decisión con guion fijo, no un chatbot con IA real** — ninguna respuesta del "bot" depende de lo que el usuario escriba salvo el nombre (que solo se interpola en el resumen final, no se valida ni procesa). Esto es coherente con ser un *prototipo* de la funcionalidad de chatbot que Cénit Digital vende como servicio (`plan_startup_servicios_digitales_v3.pdf`: "Chatbot WhatsApp con IA... 600€ setup + 199€/mes") — **decisión pendiente y de negocio, no de diseño**: ¿`NailsLashStudioWeb` lleva este simulador de guion fijo en el propio sitio web (front-end puro, sin backend), o el "chat de verdad" vive en WhatsApp Business vía la integración real que vendéis, y esta caja es solo un teaser/demo? Ninguna de las dos es errónea, pero cambian completamente el alcance técnico de esta feature — de "componente de React con estado local" a "integración con Twilio/360Dialog + Claude API" como está documentado en el propio stack de servicios de Cénit.

**Casos límite.**
- Enviar un nombre vacío o solo espacios: el prototipo ya lo bloquea (`chatSend`: `if(!v) return`, con `.trim()`) — replicar esa validación mínima.
- Reiniciar (`chatRestart`) debe limpiar completamente el historial y las respuestas previas, no solo mostrar el primer mensaje de nuevo.

**Restricciones de implementación.** Si se mantiene como simulador front-end (opción A de la decisión pendiente): estado local simple, sin dependencias — otra vez, aplica el criterio `ponytail` del propio repo. Si se conecta a WhatsApp real (opción B): sale del alcance de "componente de React" y entra en el catálogo de servicios de automatización de Cénit — sería una feature de otra envergadura, con su propio `project-spec.md`.

**Qué NO cambia.** El guion de 4 preguntas y sus opciones exactas — no añadir ni quitar pasos sin que alguien lo decida explícitamente, ya que el resumen final depende de las 4 claves (`service`, `day`, `time`, `name`).

**Comportamientos numerados:**
1. Al abrir la página, el chat muestra el primer mensaje del bot con 4 opciones: Uñas, Facial, Depilación, Pestañas.
2. Elegir una opción añade un mensaje de "usuario" con esa opción y encadena la siguiente pregunta del bot.
3. En el último paso, escribir un nombre vacío y pulsar enviar no añade ningún mensaje.
4. Completar los 4 pasos muestra el mensaje de resumen con los 4 datos elegidos, interpolados correctamente.
5. Tras el resumen, "Reservar otra cita" reinicia el chat al primer mensaje, sin rastro de las respuestas anteriores.
6. El contenedor de mensajes se desplaza automáticamente para mostrar siempre el último mensaje.

---

### #10 · `contacto_horario` — Horario y ubicación

**Comportamiento.** Dos columnas: (izq) tabla de horario + dirección/teléfono/Instagram + CTA WhatsApp; (der) imagen de mapa.

**Contrato observable — verbatim de `salon-data.js → hours` y `contact`:**
- Horario: Lunes–Viernes 10:00–20:00 · Sábado 10:00–15:00 · Domingo Cerrado.
- Contacto (**placeholder de demo, no real** — ver §4.4): dirección "Calle de la Belleza 24, 28010 Madrid" · teléfono "+34 600 123 456" · Instagram "@nailslashstudio" · email "hola@nailslashstudio.com" (el email **no se muestra en ningún sitio del HTML actual**, solo vive en el dato — posible descuido del prototipo o contenido reservado para el futuro formulario, ver §4.2).
- Enlaces `tel:` y `wa.me` están **hardcodeados** al número `+34600123456` en el propio HTML (no interpolados desde `contact.phone` en todos los sitios — hay 4 apariciones del enlace `wa.me/34600123456` y 3 de `tel:+34600123456` repetidas literalmente en vez de vía variable). **Esto sí es un defecto real a corregir al implementar**, no un patrón a copiar: un único punto de verdad para el teléfono (`contact.phone`), no 7 strings duplicados.

**Decisiones.** El mapa es una imagen estática (`ph-map.png`, placeholder), no un mapa interactivo embebido (Google Maps/Mapbox). Coherente con "arrastra una captura" del propio placeholder — **decisión de producto pendiente**: ¿mapa interactivo real o captura estática? Un mapa interactivo añade una dependencia (API de mapas) que el criterio `ponytail` del repo cuestionaría si una imagen estática cumple el mismo propósito con menos coste — pero es decisión de negocio, no técnica.

**Casos límite.** Ninguno de estado — es contenido mayormente estático salvo los CTAs.

**Restricciones de implementación.** Centralizar el teléfono en una única constante/token de contenido — ver el defecto de duplicación arriba.

**Qué NO cambia.** El horario Lunes–Viernes/Sábado/Domingo es contenido real de negocio muy probablemente correcto (no tiene pinta de placeholder como sí la tiene el resto de contacto) — confirmar con el cliente igualmente antes de publicarlo como definitivo.

**Comportamientos numerados:**
1. La sección muestra el horario exacto de la tabla de arriba, en el orden Lunes-Viernes → Sábado → Domingo.
2. El botón "Escríbenos por WhatsApp" abre `wa.me` con el número de contacto vigente (una sola fuente, no un literal repetido).
3. El enlace de teléfono usa el prefijo `tel:` con el mismo número.

---

### #11 · `faq` — Preguntas frecuentes

**Comportamiento.** Acordeón de 6 preguntas — un `+`/`–` que alterna, solo un contenido de respuesta visible a la vez por pregunta individual (no hay `exclusive:true` — cada pregunta se abre/cierra de forma independiente, **pueden estar varias abiertas a la vez**, lo confirmo porque el estado es un único índice `faq:-1` inicial... **espera**: releyendo `renderVals` (línea 447), es `S.faq===i` — sí es **un único índice global**, es decir **solo una pregunta puede estar abierta a la vez** en todo el acordeón, no por-pregunta independiente. Corrijo: abrir una pregunta cierra automáticamente la que estuviera abierta antes.

**Contrato observable — las 6 preguntas, verbatim de `salon-data.js → faq`:**

1. "¿Cómo reservo una cita?" → "Reserva desde el calendario de cada profesional, por el chat de WhatsApp de esta página o llamando al estudio. Confirmamos tu hora al momento."
2. "¿Cuánto dura el esmaltado semipermanente?" → "Entre 2 y 3 semanas con un acabado impecable, según el crecimiento natural de tu uña y el cuidado diario."
3. "¿Retiráis esmaltado o uñas de otro salón?" → "Sí. Realizamos una retirada segura y valoramos el estado de tus uñas antes de comenzar el nuevo servicio."
4. "¿Puedo llevar mi propio diseño?" → "Por supuesto. Trae tu inspiración y la adaptamos a tus uñas; también te asesoramos si lo prefieres."
5. "¿Qué formas de pago aceptáis?" → "Efectivo, tarjeta y pagos por móvil. El importe se confirma antes de empezar, sin sorpresas."
6. "¿Cuál es la política de cancelación?" → "Te pedimos avisar con 24 h de antelación para poder reorganizar la agenda y ofrecer la hora a otra clienta."

**Decisiones.** Acordeón de índice único (no independiente por pregunta) — comportamiento estándar y accesible, pero **verificar accesibilidad de teclado y `aria-expanded`** al implementar: el prototipo usa `<button>` (correcto, focoable) pero no incluye atributos ARIA — es exactamente el tipo de gap que el agente `a11y_seo_auditor` de tu propio `.claude/agents/` está pensado para pillar.

**Casos límite.** Ninguno de datos — 6 preguntas fijas.

**Restricciones de implementación.** `aria-expanded={open}` en el botón, `aria-controls`/`id` enlazando pregunta↔respuesta — gap a cerrar respecto al prototipo, no algo que ya venga resuelto.

**Qué NO cambia.** Las 6 preguntas y respuestas son contenido de negocio válido (política de cancelación, pagos, etc.) — mismo criterio que el horario: probablemente reales, confirmar con el cliente antes de publicar.

**Comportamientos numerados:**
1. La sección muestra exactamente 6 preguntas, colapsadas por defecto.
2. Al abrir una pregunta, su respuesta se muestra y el signo cambia de "+" a "–".
3. Al abrir una segunda pregunta estando otra ya abierta, la primera se cierra automáticamente.
4. Cada botón de pregunta expone `aria-expanded` correcto para lectores de pantalla. *(gap a implementar, no presente en el prototipo)*

---

### #12 · `footer`

**Comportamiento.** 3 columnas: identidad + descripción corta / enlaces de servicios (Uñas, Facial, Depilación, Reservar) / contacto (teléfono, Instagram, dirección). Línea de copyright con año fijo `© 2026` y subtítulo "Plantilla de demostración".

**Decisiones.** *"Plantilla de demostración"* es literal del prototipo — **hay que quitarlo** al pasar a producción, es texto de marcador de agua del propio Claude Design, no contenido del cliente. El año `2026` está **hardcodeado**, no calculado — `WebEmpresa/src/components/Footer.tsx` sí calcula el año dinámicamente (`new Date().getFullYear()`, confirmado en su `feature_list.json`: *"Copyright con año dinámico"*) — replicar ese mismo patrón aquí en vez del literal fijo del prototipo.

**Casos límite.** Ninguno.

**Restricciones de implementación.** Año dinámico (patrón ya resuelto en `WebEmpresa/src/components/Footer.tsx` — copiar el enfoque, no reinventar).

**Qué NO cambia.** Estructura de 3 columnas y los 4 enlaces de servicios.

**Comportamientos numerados:**
1. El pie de página muestra el año actual calculado en tiempo de build/ejecución, no un literal.
2. El pie de página no contiene el texto "Plantilla de demostración" en producción.

---

### #13 · `galeria_carrusel` — **[FALTA EN EL PROTOTIPO]** Carrusel de imágenes antes del chat

**Origen.** Tu nota en Drive (carpeta "CLIENTE UÑAS JOHN", doc sin título, 8 jul 2026): *"Carrusel de imágenes antes del chatbot."* Verificado contra el bundle de hoy (19 jul 2026): **no existe ninguna sección de galería/carrusel** en ninguno de los 3 `.dc.html` (grep de `galer|carousel|carrusel|gallery`: cero resultados). Esta nota **no está incorporada todavía**.

**Comportamiento propuesto (a confirmar contigo, no a implementar a ciegas).** Un carrusel de imágenes — lectura razonable: trabajos reales (nail art, resultados de manicura/pedicura, antes/después) — posicionado **entre `#ofertas`/`#equipo` y `#reserva`** (el chat), tal como pide la nota ("antes del chatbot"). No invento cuántas imágenes, si es autoplay, si tiene controles manuales, ni si usa las fotos de equipo/categoría ya existentes o exige fotos nuevas — son decisiones tuyas o del cliente que el prototipo actual no resuelve.

**Preguntas concretas para cerrar el contrato antes de que `gherkin_author` pueda destilar escenarios:**
1. ¿Carrusel de trabajos/resultados (nail art, antes-después) o de instalaciones del salón?
2. ¿Autoplay o solo navegación manual? Si autoplay: ¿se pausa al pasar el ratón/foco (requisito de accesibilidad WCAG 2.2.2)?
3. ¿Cuántas imágenes de partida? ¿Las aporta el cliente o se usan de stock mientras tanto (mismo patrón `ph-*.png` que ya usa el resto del prototipo)?

**Restricciones de implementación (una vez cerrado el contrato).** Nada de esto necesita una librería de carrusel — con `scroll-snap-type` nativo de CSS + botones de flecha se cubre el caso típico sin dependencias (otra vez, criterio `ponytail`: nativo antes que dependencia). Si el cliente pide autoplay con miniaturas, ahí sí se justifica evaluar una librería ligera — decisión a tomar cuando el contrato esté cerrado, no antes.

**Estado:** `pending` — necesita conversación (`spec_partner`) antes de `gherkin_author`, no está `spec_ready`.

---

### #14 · `resenas_destacadas` — **[POSIBLE FALTA]** Sección de reseñas encima del FAQ

**Origen.** Misma nota de Drive: *"encima del FAQ, reseñas..."*. Interpretación más directa: una sección de reseñas **independiente**, posicionada justo antes de `#faq`. Verificado: hoy **no existe** ninguna sección con `id` propio de reseñas — solo hay una reseña rotativa **embebida dentro de cada tarjeta de profesional** (feature #8), usando el mismo `reviewPool` de 10 reseñas de `salon-data.js`.

**Dato a favor de que sí falta:** `salon-data.js → reviewPool` tiene 10 reseñas completas (autor + texto), pero el prototipo solo expone 5 por profesional en rotación — hay contenido de sobra ya escrito para una sección propia sin inventar una sola reseña nueva:

> María L. — "Un trato espectacular y un resultado perfecto. Repetiré sin duda."
> Elena R. — "Mis uñas nunca habían durado tanto. Profesionales de verdad."
> Cristina P. — "Súper detallistas y muy limpias. Salí encantada del salón."
> Sonia G. — "El mejor sitio de la zona, con diferencia. 100% recomendable."
> Beatriz M. — "Ambiente relajante y acabado impecable. Me encantó todo."
> Raquel D. — "Puntuales, cuidadosas y con un gusto exquisito. Cinco estrellas."
> Laura F. — "Me asesoraron genial con el diseño. Quedó precioso, gracias."
> Patricia V. — "Trato cercano y resultado de diez. Ya soy clienta fija."
> Nuria S. — "Higiene impecable y auténticas manos de artista. Muy contenta."
> Alba C. — "Conseguí justo lo que quería. Volveré segurísimo."

**Lo que no puedo confirmar solo:** si la nota pedía una sección *nueva* o si describía un cambio de orden de algo que existía en una iteración anterior del diseño que no está en este bundle (no tengo esa iteración para comparar). Lo trato como gap real porque en el estado actual, objetivamente, no hay tal sección — pero **confírmalo antes de que pase por la puerta humana** como feature aprobada.

**Restricciones de implementación (si se confirma).** Reutilizar `reviewPool` completo (10 entradas) — no truncar a 5. Encaja bien como rejilla de 3 columnas o carrusel horizontal simple, mismo criterio `ponytail` que en #13: CSS nativo antes que dependencia.

**Estado:** `pending` — misma razón que #13.

---

## 4 · Otros huecos y decisiones — todo lo "que no estás teniendo en cuenta"

Consolido aquí lo que ya salió suelto arriba, más lo que solo se ve mirando el conjunto:

### 4.1 · Movimiento y accesibilidad
- **`prefers-reduced-motion` no está contemplado en ningún `@keyframes`** del bundle (pincel del hero, `paintReveal`, `brushSweep`, `fadeUp`, `bob`). Con 5 animaciones distintas en la portada, es el primer sitio donde alguien con esa preferencia del sistema lo va a notar. Añadir `@media (prefers-reduced-motion: reduce)` que desactive o reduzca las 5 es trabajo nuevo, no algo que se porte del prototipo.
- El acordeón de FAQ y los botones de día/hora del calendario no tienen atributos ARIA en el prototipo (`aria-expanded`, `aria-pressed`/`aria-selected`) — exactamente el tipo de cosas que vuestro propio agente `a11y_seo_auditor` (`.claude/agents/a11y_seo_auditor.md` en `WebEmpresa`) está pensado para auditar. Recomiendo pasarlo por ese agente antes de dar por cerrado el pipeline, igual que hacéis en `WebEmpresa`.

### 4.2 · Formulario de contacto por email — ausente
El prototipo **no tiene ningún `<form>` ni campo `type="email"`** (verificado con grep) — todo el contacto pasa por WhatsApp/teléfono. `WebEmpresa` sí tiene una feature `contact_form` con envío por Resend (`api/contact.ts`, `docs/DESIGN_SYSTEM.md`, `progress/tdd_contact_form.md`). **Decisión pendiente**: ¿este sitio de cliente necesita también un formulario de email, o WhatsApp+teléfono es intencionalmente suficiente para este tipo de negocio (una decisión de producto razonable — un salón de uñas capta casi todo por WhatsApp en la práctica)? No lo doy por sentado en ningún sentido.

### 4.3 · Navegación móvil — sin resolver
Ya lo señalé en #2: 6 enlaces + CTA "Reservar" no caben en una fila por debajo de los ~767px que usa `WebEmpresa` como corte móvil, y el prototipo no incluye ningún menú hamburguesa/`MobileMenu` equivalente al de `WebEmpresa/src/components/MobileMenu.tsx`. Antes de implementar, decidir si se replica el mismo patrón de menú móvil de `WebEmpresa` (ya validado, con sus tests) o se diseña uno específico para este cliente.

### 4.4 · Datos de contacto: son placeholder, no reales
Dirección, teléfono y email del prototipo (§2, #10) son genéricos de demo. Lo que sí he podido confirmar por tu cuenta de Drive: el negocio real se llama efectivamente **Nails Lash Studio** y está ubicado junto al **Zoco de Villalba** (coordenadas `40.5179875, -3.9226688` — Collado Villalba, noroeste de Madrid, dentro de vuestra zona objetivo del propio plan de negocio). No tengo la dirección postal exacta, teléfono real ni redes reales — **no los invento**; hace falta que me los pases o los recojas del cliente antes de que `tdd_craftsman` los fije en el código.

### 4.5 · SEO y metadatos — sin especificar
El bundle no incluye ni `<title>`, ni `<meta description>`, ni Open Graph, ni JSON-LD de negocio local (`LocalBusiness`/`BeautySalon` de schema.org) — todo lo que sí exige `docs/conventions.md` de `WebEmpresa` ("`<title>` y `description` por página") y que revisa el agente `a11y_seo_auditor`. Es contenido que hay que redactar de cero para este cliente, no algo que el handoff resuelva.

### 4.6 · Imágenes: todas son de stock/placeholder
Las 11 fotos (`ph-unas/facial/depil/map.png`, `ph-woman0..6.png`) son imágenes de recurso genérico, no fotos reales del salón, del equipo ni del local. Antes de publicar hacen falta fotos reales — del propio negocio, o al menos criterio del cliente sobre licencias de stock si se van a mantener imágenes genéricas de forma permanente.

### 4.7 · Selector de tema claro/oscuro — no aplica aquí (y es correcto que no aplique)
`WebEmpresa` tiene `theme_selector` (claro/oscuro/sistema, WEB-4). Este prototipo **no tiene tema oscuro** — tiene 3 identidades de marca alternativas (§2.1), que es un concepto distinto. Lo marco solo para que quede explícito que la ausencia de un `ThemeToggle` aquí es coherente con el diseño, no un olvido.

---

## 5 · Paleta — ✅ DECIDIDO: 1a · Rosa monocromo

Confirmado por ti el 19/07/2026. Token de acento único `#C05576` en toda la interfaz (tabla completa de los 11 tokens en §2.1). Las otras dos (`1b Azules claros`, `1c Amarillos y rosas`) quedan documentadas en §2.1 como referencia — no se implementan, pero conviene no borrarlas del repo por si el cliente pide un cambio de imagen más adelante; son gratis de mantener como `_tokens-alt.scss` o comentario.

Resumen de por qué esta opción, para que quede constancia: es la más clásica/segura del sector (encaja con casi cualquier estética de salón de belleza), un solo acento simplifica el sistema de tokens frente a las otras dos, y es la única de las tres sin gradiente multi-parada en el hero — menos superficie para que algo se vea mal en pantallas pequeñas.

---

## 6 · Cómo encaja con los patrones ya establecidos en `WebEmpresa`

Lo que **sí** se hereda tal cual (ya validado en producción, no hay que redecidirlo):

| Patrón | En `WebEmpresa` | Aplicación aquí |
|---|---|---|
| Reveal al hacer scroll | `IntersectionObserver` ~15 líneas + SCSS `@keyframes`, sin librería | Mismo mecanismo para el pincel del hero (#3) — cambia el disparador (umbral simple vs. `rootMargin` centrado), no el patrón |
| Stack | Vite 7 + React 19 + TS + SCSS Modules + pnpm + `vite-react-ssg` | ✅ Decidido en §7 — se hereda tal cual, sin traducir a Next.js |
| Estructura de componente | `Componente.tsx` + `Componente.module.scss` + `Componente.test.tsx` co-ubicados, sin subcarpetas, `PascalCase` | Igual aquí — ~14-16 componentes según la lista de §3 |
| Tokens vía `var(--…)` | `_tokens.scss` con `@use`, nunca `@import` | Igual, con la salvedad de nomenclatura ya señalada en #1 |
| Breakpoints reales en uso | `560px`, `767px` (hook `useIsMobile`), `820px`, `880px` | Punto de partida razonable — pero **ojo**: tu propia memoria de proyecto dice que en `WebEmpresa` los breakpoints "son escasos" y que hay un sistema de 3 niveles con `clamp()` **planeado pero no hecho todavía** — no hereden un problema conocido sin decidirlo |
| Testing | Vitest + Testing Library, co-ubicados, `it('@sN …')` citando el escenario Gherkin | Igual |
| Mutación | Stryker, umbral configurable (`WebEmpresa` no expone el número en lo que he leído del `package.json`; `TemplateSSDUncleBob` usa `0.8`–`1.0` en sus ejemplos) | Fijar umbral explícito para este repo antes de empezar — no asumir un número |
| Disciplina de simplicidad | Skill `ponytail` (YAGNI, stdlib/nativo antes que dependencia) — presente en `.claude/skills/` de `WebEmpresa`, **nueva desde la última vez que until ahora tenía documentado tu contexto de proyecto** | La aplico explícitamente en varias features de arriba (#5, #9, #13, #14) — es coherente con "0 warnings, 0 problemas" que pides: menos código propio, menos superficie de fallo |
| Agentes del pipeline | **9 en total**, no 6: `spec_partner`, `gherkin_author`, `tdd_craftsman`, `judge`, `mutation_tester`, `craftsman_lead` (los 6 que ya tenía yo documentados) **+ `security_reviewer`, `a11y_seo_auditor`, `mentor`** (de apoyo, solo lectura) — actualizo esto porque no lo tenía registrado | Recomiendo pasar `security_reviewer` (por los enlaces `wa.me`/`tel:` con datos reales de cliente) y `a11y_seo_auditor` (por los gaps de §4.1/4.5) antes de `done` |

---

## 7 · Stack — ✅ DECIDIDO: Vite + React + SCSS Modules, igual que `WebEmpresa`

Confirmado por ti el 19/07/2026. Se descarta Next.js/Tailwind/Supabase/Stripe del `plan_startup_servicios_digitales_v3.pdf §04` **para este proyecto concreto** — queda como stack candidato para el día que un sitio de cliente necesite de verdad backend/auth/pagos (este no: es casi puramente estático, sin formulario de email siquiera, §4.2).

Consecuencia directa de esta decisión: `NailsLashStudioWeb` puede heredar literalmente el arnés, los 9 agentes, `docs/` y el patrón de componente/testing de `WebEmpresa` sin traducir nada de un framework a otro. Detalle concreto de bootstrapping en §8 — ya no es condicional, es una lista de pasos.

---

## 8 · Estado real del repo `NailsLashStudioWeb`

Verificado hoy (§0.2): no responde en `api.github.com`, `codeload.github.com` ni `raw.githubusercontent.com`, con y sin variantes de nombre. `WebEmpresa`, `TemplateSSDUncleBob` y `DocsTemplateSSDUncleBob` sí son públicos y responden con normalidad desde el mismo entorno — así que no es un problema de red por mi lado, es específico de ese repo.

**Reverificado al cerrar este documento (19/07/2026, tras las 2 decisiones): sigue sin responder.** Asumo que aún no existe. Si ya lo has creado en paralelo y es privado, dímelo y lo reviso con Claude en Chrome usando tu sesión antes de que nadie duplique trabajo.

**Pasos de arranque, ya sin condicionales porque §5 y §7 están cerrados:**

1. En GitHub, **"Use this template"** sobre `Cenit-Digital/TemplateSSDUncleBob` → nombrar el repo `NailsLashStudioWeb`.
2. Copiar de `WebEmpresa` tal cual (mismo stack, cero traducción): `package.json` (dependencias — quitar lo específico de Cénit como `resend`/`@vercel/firewall` hasta que #4.2 y el hosting se decidan), `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts` + `vitest.setup.ts`, `stryker.config.json`, `init.sh`.
3. Copiar `docs/` completo de `WebEmpresa` (`workflow.md`, `gherkin.md`, `conventions.md`, `tdd.md`, `mutation-testing.md`, `architecture.md`, `verification.md`, `tooling.md`, `autonomous.md`) — son metodología, no contenido de Cénit; aplican igual aquí.
4. Copiar `.claude/agents/` (los 9), `.claude/skills/ponytail*` y `AGENTS.md`/`CLAUDE.md`/`CHECKPOINTS.md` de `WebEmpresa`.
5. `src/styles/_tokens.scss` — **no copiar el de `WebEmpresa`** (es la paleta Bosque&Limón/Noche&Oro de Cénit, no aplica aquí). Usar el de este cliente — te lo dejo ya redactado y listo para pegar en el archivo adjunto `_tokens.scss` (paleta 1a Rosa, §2.1/§2.3 de este documento).
6. `feature_list.json` — pegar el bloque de §9 (actualizado más abajo con la infraestructura como feature `#0`, igual que `infra_base` en `WebEmpresa`).
7. `harness.config.json` — no hace falta si se sigue el patrón nativo de `WebEmpresa` (scripts de `package.json` en vez del motor `.harness/harness.mjs` de la plantilla genérica) — mismo patrón que `WebEmpresa` ya usa, confirmado: no tiene `harness.config.json` propio.

---

## 9 · `feature_list.json` propuesto — listo para pegar en el repo nuevo

Mismo esquema exacto que `WebEmpresa/feature_list.json` (verificado campo a campo). Actualizado tras las 2 decisiones del 19/07/2026. Añado `#0 infra_base` con `"sdd": false` — mismo precedente exacto que `WebEmpresa/feature_list.json#1` (scaffolding sin puerta Gherkin, porque no es comportamiento observable, es infraestructura). Las 12 features de contenido entran `spec_ready`; las 2 de la nota del 8 de julio siguen `pending` hasta que confirmes su contrato (§3, #13/#14) — esa parte no ha cambiado, la paleta y el stack no resuelven esas dos preguntas.

```json
{
  "project": "nailslashstudioweb",
  "description": "Web de cliente — Nails Lash Studio (uñas, facial, depilación). Paleta: 1a Rosa monocromo. Stack: Vite+React+SCSS Modules (igual que WebEmpresa). Decidido 19/07/2026.",
  "rules": {
    "one_feature_at_a_time": true,
    "require_tests_to_close": true,
    "require_approved_spec_to_implement": true,
    "valid_status": ["pending", "spec_ready", "in_progress", "done", "blocked"],
    "sdd_required_when": "feature has \"sdd\": true"
  },
  "features": [
    { "id": 0,  "name": "infra_base",               "title": "Repositorio base desde TemplateSSDUncleBob + esqueleto de WebEmpresa (Vite+React+TS+SCSS+pnpm)", "sdd": false, "status": "pending" },
    { "id": 1,  "name": "fundamentos_marca",         "title": "Tokens paleta 1a Rosa monocromo + tipografía (Gilda Display / Great Vibes / Manrope) + assets base", "sdd": true, "status": "spec_ready" },
    { "id": 2,  "name": "nav",                       "title": "Cabecera sticky + navegación por anclas",      "sdd": true, "status": "spec_ready" },
    { "id": 3,  "name": "hero",                      "title": "Portada con efecto de pincel (replay on view)", "sdd": true, "status": "spec_ready" },
    { "id": 4,  "name": "categorias_servicios",      "title": "Uñas / Facial / Depilación con precios",       "sdd": true, "status": "spec_ready" },
    { "id": 5,  "name": "prueba_color",               "title": "Selector interactivo de esmalte (12 tonos)",  "sdd": true, "status": "spec_ready" },
    { "id": 6,  "name": "servicios_destacados",       "title": "4 servicios estrella",                        "sdd": true, "status": "spec_ready" },
    { "id": 7,  "name": "ofertas",                    "title": "3 promociones del mes",                       "sdd": true, "status": "spec_ready" },
    { "id": 8,  "name": "equipo_reservas",            "title": "7 profesionales + calendario día/hora + reseñas", "sdd": true, "status": "spec_ready" },
    { "id": 9,  "name": "reserva_chat",               "title": "Chat de reserva guiado (4 pasos)",            "sdd": true, "status": "spec_ready" },
    { "id": 10, "name": "contacto_horario",           "title": "Horario, dirección, mapa, WhatsApp/tel",      "sdd": true, "status": "spec_ready" },
    { "id": 11, "name": "faq",                        "title": "Acordeón de 6 preguntas",                     "sdd": true, "status": "spec_ready" },
    { "id": 12, "name": "footer",                     "title": "Pie de página con año dinámico",              "sdd": true, "status": "spec_ready" },
    { "id": 13, "name": "galeria_carrusel",           "title": "Carrusel de imágenes antes del chat (nota 8 jul, sin especificar del todo)", "sdd": true, "status": "pending" },
    { "id": 14, "name": "resenas_destacadas",         "title": "Sección de reseñas encima del FAQ (nota 8 jul, a confirmar)", "sdd": true, "status": "pending" }
  ]
}
```

---

## 10 · Orden de implementación recomendado

Mismo criterio que `WebEmpresa/design/HANDOFF.md §3`: fundamentos primero, estructura de página después, piezas interactivas complejas al final, huecos nuevos solo cuando estén cerrados.

```
infra_base (bootstrap desde TemplateSSDUncleBob + esqueleto WebEmpresa — sdd:false, sin puerta)
  → fundamentos_marca → nav → hero
  → categorias_servicios → servicios_destacados → ofertas   (contenido mayormente estático, bajo riesgo)
  → prueba_color                                             (estado local simple)
  → contacto_horario → faq → footer                          (estático + accesibilidad)
  → equipo_reservas                                          (la más compleja — última de las "ya especificadas")
  → reserva_chat                                              (depende de la decisión de arquitectura de §3 #9)
  ⏸ resolver §5 (paleta), §7 (stack), §3 #13/#14 (huecos de la nota del 8 jul)
  → galeria_carrusel / resenas_destacadas                     (solo cuando pasen de pending a spec_ready)
```

`equipo_reservas` va casi al final a propósito: es la que más superficie de mutación tiene (§3 #8) y conviene abordarla con el resto del sistema de componentes/tokens ya estable, no como la primera pieza sobre la que iterar.

---

## 11 · Prompt de arranque para Claude Code

Mismo formato que el prompt que ya usasteis en `WebEmpresa/design/HANDOFF.md §4` (el que empieza "Integra el design system de..."). Ya sin corchetes por rellenar — paleta y stack decididos el 19/07/2026. Pégalo tal cual en el repo:

> Arranca como `craftsman_lead`. Este repo se levanta desde **`TemplateSSDUncleBob`** ("Use this template"), con el esqueleto de **`WebEmpresa`** encima (Vite 7 + React 19 + TS + SCSS Modules + pnpm + `vite-react-ssg` — mismo stack, sin traducir a Next.js; ver §8 para la lista exacta de qué copiar). Ya tienes `NAILSLASHSTUDIO_HANDOFF.md`, `feature_list.json` listo para copiar (§9, con `infra_base` como `#0` sin puerta Gherkin por ser scaffolding), `_tokens.scss` con la paleta elegida, **y los 14 `features/*.feature` ya escritos** (`nailslashstudio-features.zip` — descomprimir tal cual en `features/`). **Paleta: 1a · Rosa monocromo. Stack: Vite + React + SCSS Modules.**
>
> Primero `infra_base` (#0, `sdd:false`): monta el repo siguiendo §8 paso a paso, copia `_tokens.scss` y los 14 `.feature` adjuntos tal cual, y confirma `./init.sh` en verde antes de tocar ninguna feature de contenido.
>
> Luego, **una feature a la vez**, en el orden de la §10. Los `.feature` de las 12 primeras ya están escritos y listos para la **puerta humana** — no hace falta `gherkin_author` para destilarlos, solo mi aprobación explícita de cada uno antes de que `tdd_craftsman` empiece. `galeria_carrusel.feature` y `resenas_destacadas.feature` son intencionalmente parciales (1-2 escenarios cada uno, solo lo determinado) — no los completes con supuestos, espera a que yo cierre el contrato (§3 #13/#14). Para cada feature aprobada: `tdd_craftsman` Rojo-Verde-Refactor contra los datos exactos de `salon-data.js` citados en el documento → `judge` → `mutation_tester`. No inventes precios, horarios, nombres del equipo ni textos de reseñas — todos están citados verbatim arriba y en los propios `.feature`.
>
> Las features #13 (`galeria_carrusel`) y #14 (`resenas_destacadas`) están en `pending`, no `spec_ready` — no las implementes hasta que yo confirme el contrato exacto (§3 tiene las preguntas concretas pendientes).
>
> Antes de cualquier `commit`: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` en verde, **0 warnings**, y mutación por encima del umbral que fijes en `stryker.config.json`. Pasa `security_reviewer` antes de tocar los enlaces `wa.me`/`tel:` con datos reales de cliente, y `a11y_seo_auditor` antes de cerrar `faq` y `equipo_reservas` (gaps de ARIA en §4.1).

---

## 12 · Checklist de verificación — "0 fallos, 0 errores, 0 warnings"

Antes de dar cualquier feature por `done` (mismo criterio no negociable que `AGENTS.md` de `WebEmpresa §3`):

- [ ] `typecheck` / `lint` / `test` / `build` en verde — 0 warnings, no solo 0 errores.
- [ ] Mutación por encima del umbral fijado en `harness.config.json` o `stryker.config.json` (número explícito, no heredado por defecto sin decidirlo).
- [ ] Cada escenario `@sN` de `features/<name>.feature` tiene su `it('@sN …')` correspondiente en Vitest (trazabilidad citada, no solo "hay tests").
- [ ] Todos los precios, horarios, nombres de equipo y textos de reseña coinciden **verbatim** con los citados en la §3 de este documento — ninguno inventado ni redondeado.
- [ ] `security_reviewer` ha pasado por los enlaces de contacto (`wa.me`, `tel:`) una vez tengan datos reales del cliente (§4.4).
- [ ] `a11y_seo_auditor` ha pasado por `faq` (ARIA del acordeón) y `equipo_reservas` (foco/teclado del calendario) — gaps identificados en §4.1, no resueltos por el prototipo.
- [ ] `prefers-reduced-motion` cubierto en las 5 animaciones del hero (§4.1) antes de cerrar `hero`.
- [ ] El texto "Plantilla de demostración" y el año fijo `2026` del footer no llegan a producción (§3 #12).
- [ ] Ningún literal `+34600123456` repetido — una sola fuente de teléfono (§3 #10).
- [ ] `galeria_carrusel` y `resenas_destacadas` siguen en `pending` hasta que confirmes su contrato — no se implementan "mientras tanto" con una interpretación libre.

---

*Documento generado a partir de: `Sitio_web_salón_de_uñas-handoff.zip` (bundle de Claude Design, 19/07/2026) · repos `Cenit-Digital/WebEmpresa`, `Cenit-Digital/TemplateSSDUncleBob`, `Cenit-Digital/DocsTemplateSSDUncleBob` (descargados y leídos en el momento de redactar este documento) · búsqueda en Jira (`WEB`) y Confluence (`DDS`) · Google Drive (carpeta "CLIENTE UÑAS JOHN"). Sin acceso confirmado a `Cenit-Digital/NailsLashStudioWeb` — ver §8.*
