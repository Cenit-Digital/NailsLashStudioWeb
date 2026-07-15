# Auditoría de rendimiento y responsive — prototipo `Opcion-1-Rosa.dc.html`

- **Fecha:** 2026-07-15
- **Artefacto auditado:** `.../scratchpad/design/sitio-web-sal-n-de-u-as/project/Opcion-1-Rosa.dc.html` (40.634 bytes)
- **Ruta base (temporal, se borrará):** `C:/Users/vhurt/AppData/Local/Temp/claude/C--Users-vhurt-.../d9bf86dc-79ce-4d29-aaec-eeb87ab57df6/scratchpad/design/sitio-web-sal-n-de-u-as/project`
- **Alcance:** peso de imágenes, formatos modernos, lazy loading, dimensiones intrínsecas/CLS, LCP del hero, fuentes y comportamiento responsive.

> En todo el informe se marca cada afirmación como **[VERIFICADO]** (con fuente: URL oficial o `archivo:línea`), **[INFERENCIA]** (razonamiento mío a partir de hechos verificados) o **[DESCONOCIDO]**.

---

## 1. Respuesta ejecutiva

**Qué hacemos: no optimizamos este prototipo. Lo usamos como especificación de diseño y construimos la web de producción desde cero con un presupuesto de rendimiento cerrado.**

Tres hallazgos invalidan el encuadre original del encargo, y conviene decirlo antes que nada:

1. **Las `ph-*.png` no son fotos: son marcadores de posición desechables.** Cada una lleva el texto «IMAGEN TEMPORAL» impreso encima y es un gráfico plano (degradado + siluetas sólidas), no una fotografía **[VERIFICADO — inspección visual de `ph-woman0.png` y `ph-map.png`]**. Pesan 300-520 KB *porque están mal generadas* (32 bits ARGB, sin paleta), no porque contengan información. `ph-woman0.png` pasa de 346.620 a **3.128 bytes en WebP q80 (-99,1 %)** y a **1.312 bytes en AVIF (-99,6 %)** **[VERIFICADO — medición propia con ffmpeg 8.1.1, ver §3.2]**. Optimizar estos 4,13 MB sería trabajo tirado: ninguno de esos bytes llegará a producción. **Las fotos reales del salón todavía no existen** y son el verdadero riesgo de rendimiento.

2. **El prototipo no es código publicable, ni siquiera es una página que funcione sola.** Es una maqueta de una herramienta de diseño: usa un runtime propietario (`<x-dc>`, `DCLogic`) cuyo `support.js` declara en su primera línea *«GENERATED from dc-runtime/src/*.ts — do not edit»* y exige `window.React` / `window.ReactDOM` **[VERIFICADO — `support.js:1`, `support.js:10-17`]**, que **el HTML nunca carga** (0 referencias a React en el archivo) **[VERIFICADO — `grep -c "react\|React" Opcion-1-Rosa.dc.html` → 0]**. `support.js` (61.088 B) + `image-slot.js` (55.383 B) = **116 KB de andamiaje de autoría** (botones "Replace"/"Edit", `<input type=file>`, créditos de Unsplash) que jamás debe enviarse al navegador **[VERIFICADO — `image-slot.js:481-483`]**. Auditar su LCP es un error de categoría: **medimos un boceto, no un edificio**.

3. **La premisa «layout de 1280px fijo» es falsa.** No hay ningún `1280` en `Opcion-1-Rosa.dc.html`. El 1280px vive en el *lienzo comparador* (`nails lash studio - Opciones.dc.html:31,40,44`), que incrusta cada opción con `style="display:block;width:1280px"` — es **el ancho de la mesa de trabajo del diseñador**, no una restricción de la página **[VERIFICADO]**. La maqueta en sí es fluida: `max-width:1200px`, tipografía `clamp()`, `flex-wrap:wrap` y rejillas `auto-fit` **[VERIFICADO — `Opcion-1-Rosa.dc.html:62,65,68`]**, y lleva `<meta name="viewport" content="width=device-width, initial-scale=1">` **[VERIFICADO — línea 5]**.

**Pero sí hay dos defectos reales y accionables**, que son diseño (no bytes) y por tanto **sí se heredan a producción**:

- **Desbordamiento horizontal silencioso en móvil.** Las rejillas usan `repeat(auto-fit,minmax(320px,1fr))` dentro de un contenedor con `padding:0 40px`. A 360 px de ancho (Galaxy S8/S20/S24, muy común) el contenedor deja 280 px útiles, pero la pista mínima sigue siendo 320 px → **desborda 40 px**. Y `overflow-x:hidden` en la raíz **lo recorta en silencio en vez de mostrar scroll** **[VERIFICADO — `Opcion-1-Rosa.dc.html:28,163,169` + spec CSS Grid; ver §3.8]**. Se ve como tarjetas cortadas, no como un bug obvio. **Es el hallazgo más importante que sí sobrevive a producción.**
- **El hero tarda ~5,3 s en ser legible por decisión de diseño.** El titular «Nails Lash» se revela con `paintReveal 4.8s ... .5s both` y el subtítulo «Studio» está en `opacity:0` hasta t=4,4 s por `fadeUp .9s 4.4s both` **[VERIFICADO — líneas 21,23,44,49]**. La documentación oficial de LCP confirma que *«Elements with an opacity of 0, that are invisible to the user»* quedan excluidos del LCP **[VERIFICADO — web.dev/articles/lcp]**. El umbral «bueno» es **2,5 s en el percentil 75** **[VERIFICADO — ídem]**. La animación de marca, tal cual, es incompatible con un LCP bueno.

**Decisión recomendada:** aprobar el prototipo como **dirección de arte**, y abrir features separadas para (a) el pipeline de imagen real, (b) el hero con LCP acotado, (c) la rejilla responsive corregida y (d) las fuentes autoalojadas. Nada de `scratchpad/design/**` entra en `src/`.

---

## 2. Qué es realmente el artefacto (y por qué importa antes que cualquier métrica)

| Archivo | Bytes | Qué es | ¿Va a producción? |
|---|---:|---|---|
| `Opcion-1-Rosa.dc.html` | 40.634 | Maqueta `<x-dc>` + lógica `DCLogic` | **No** — es una comp de diseño |
| `support.js` | 61.088 | Runtime dc-runtime (necesita React inyectado por la herramienta) | **No** |
| `image-slot.js` | 55.383 | Componente de autoría (Replace/Edit/subir archivo) | **No** |
| `salon-data.js` | 7.684 | Datos de demo (precios/equipo/FAQ ficticios) | **No** (los datos reales están sin verificar) |
| `ph-*.png` × 11 | **4.336.197** | Marcadores «IMAGEN TEMPORAL» | **No** |
| `brush.png` | 5.857 | Pincel decorativo del hero (60×198) | Quizá (como SVG) |

**Total de los assets del prototipo: 4.506.843 bytes ≈ 4,30 MiB** **[VERIFICADO — `du -cb`]**.

**[INFERENCIA]** Ese 4,30 MiB **no es un presupuesto de producción rebasado**; es peso de maqueta. El número que importa no lo tenemos todavía porque **las fotos reales del salón no existen** (§4).

---

## 3. Desarrollo con evidencia

### 3.1 Inventario real de las PNG

Medido con `System.Drawing` (dimensiones) y `ls -la` / `du -cb` (bytes) **[VERIFICADO]**:

| Archivo | Dimensiones | Bytes | Formato de píxel |
|---|---|---:|---|
| `ph-depil.png` | 800×1000 | 517.582 | Format32bppArgb |
| `ph-facial.png` | 800×1000 | 505.439 | Format32bppArgb |
| `ph-unas.png` | 800×1000 | 482.948 | Format32bppArgb |
| `ph-map.png` | 1000×720 | 401.144 | Format32bppArgb |
| `ph-woman0..6.png` (×7) | 800×620 | 323.512–361.906 c/u | Format32bppArgb |
| `brush.png` | 60×198 | 5.857 | Format32bppArgb |

**Suma `ph-*.png` = 4.336.197 B (4,13 MiB)** en 11 archivos **[VERIFICADO]**.

### 3.2 Las PNG son marcadores planos, y están mal codificadas

Inspección visual directa: `ph-woman0.png` es un rectángulo con degradado rosa, una silueta de persona en sólido y el texto **«IMAGEN TEMPORAL»**; `ph-map.png` es un pin de mapa sobre degradado con la palabra «Ubicación» **[VERIFICADO — lectura de imagen]**.

Reencodificaciones propias de `ph-woman0.png` (346.620 B) con `ffmpeg 8.1.1-essentials` **[VERIFICADO — medición reproducible]**:

| Codificación | Bytes | Δ vs original |
|---|---:|---:|
| Original (PNG 32bpp ARGB) | 346.620 | — |
| PNG rgb24, `-compression_level 100` | 101.072 | **−70,8 %** |
| PNG paleta 8-bit (64 colores) | 42.027 | **−87,9 %** |
| WebP `-quality 80` | 3.128 | **−99,1 %** |
| AVIF `libaom-av1 -crf 32` | 1.312 | **−99,6 %** |

Mismo patrón en `ph-unas.png` (482.948 → 5.362 WebP → 2.142 AVIF) y `ph-map.png` (401.144 → 7.496 WebP → 3.384 AVIF) **[VERIFICADO]**.

**[INFERENCIA]** Que un 800×1000 caiga a 2 KB en AVIF demuestra entropía casi nula: son gráficos vectoriales rasterizados. Además, el simple hecho de que quitar el canal alfa ya ahorre un 71 % prueba que **el generador guardó ARGB sin cuantizar**. Conclusión operativa: **estas cifras de ahorro (−99 %) NO son extrapolables a las fotos reales del salón.** Usarlas como promesa de rendimiento sería engañoso.

### 3.3 Formatos modernos (AVIF / WebP): el soporte ya no es excusa

**[VERIFICADO — MDN, *Image file type and format guide*]**:
- **AVIF**: Chrome 85, Edge 121, Opera 71, Firefox 93, **Safari 16.1**.
- **WebP**: todas las versiones de Chrome, Edge, Firefox, Opera y Safari (en macOS requiere Safari 14 + Big Sur).
- MDN sobre AVIF: *«It offers much better compression than PNG or JPEG with support for higher color depths, animated frames, transparency, etc.»*
- MDN sobre PNG vs fotos: *«Photographs typically fare well with lossy compression … This makes JPEG and WebP good choices for photographs»*; PNG se prefiere *«for more precise reproduction of source images, or when transparency is needed»*.

**[INFERENCIA]** Para fotografía de salón (piel, uñas, texturas) **PNG es la elección equivocada de raíz**. La pauta de producción debe ser `<picture>` con AVIF → WebP → JPEG de respaldo. Con Safari 16.1+ cubriendo AVIF, WebP queda solo como red de seguridad para navegadores antiguos.

### 3.4 Lazy loading: ausente, y además arquitectónicamente imposible aquí

**[VERIFICADO]** En `Opcion-1-Rosa.dc.html`: `grep -c "loading="` → **0**; `grep -c "decoding="` → **0**; `fetchpriority` → **0**; `rel="preload"` → **0**.

**[VERIFICADO]** Solo existe **un** `<img>` en todo el HTML — `brush.png` (línea 46). Las 11 imágenes restantes se pintan mediante `<image-slot>`, un custom element que crea su `<img>` **dentro de un shadow root** (`attachShadow({mode:'open', clonable:true})`, `image-slot.js:456-463`) y le asigna `src` **por JavaScript en tiempo de ejecución** (`image-slot.js:989`), partiendo de `style="display:none"` (`image-slot.js:463`).

Esto es doblemente malo según la documentación oficial del *preload scanner* **[VERIFICADO — web.dev/articles/preload-scanner]**: *«When markup payloads are contained in and rendered entirely by JavaScript in the browser, any resources in that markup are effectively invisible to the preload scanner.»*

**[INFERENCIA]** Es decir: en este prototipo **ninguna imagen es descubrible por el escáner de precarga**; todas esperan a que ejecute React + dc-runtime + `image-slot`. Es el peor patrón de carga posible. Pero, de nuevo: **es un artefacto de la herramienta de diseño, no una decisión del proyecto**. En producción, con `<img>` en el HTML servido, el problema desaparece por construcción.

Referencia para la implementación **[VERIFICADO — MDN `<img>`]**: `loading="eager"` es *«the default value»*; `loading="lazy"` *«Defers loading the image until it reaches a calculated distance from the viewport»*. **Aviso importante de MDN**: *«Loading is only deferred when JavaScript is enabled. This is an anti-tracking measure.»*

### 3.5 Dimensiones intrínsecas y CLS — aquí la maqueta *acierta*

Contra lo que cabría esperar, **el prototipo reserva el espacio correctamente**. No conviene inventar un problema que no existe:

- Bloques de categoría: contenedor con `aspect-ratio:4/5` **[VERIFICADO — línea 78]**, y las fuentes son 800×1000 = **exactamente 4/5** → sin salto.
- Tarjetas de equipo: contenedor con `aspect-ratio:4/3` **[VERIFICADO — línea 172]**.
- Mapa: `min-height:360px` **[VERIFICADO — línea 314]**.
- Texto de reseña: `min-height:60px` acota el salto al rotar reseñas **[VERIFICADO — línea 232]**.
- `brush.png` solo declara `height:150px` sin `width`, pero está en `position:absolute` **[VERIFICADO — líneas 45-46]** → fuera de flujo, **no contribuye a CLS**.

Umbral oficial **[VERIFICADO — web.dev/articles/cls]**: CLS **≤ 0,1 en el percentil 75**.

Dos matices reales:

1. **Desajuste de proporción en equipo:** las fuentes son 800×620 (ratio **1,290**) dentro de un contenedor `4/3` (**1,333**) **[VERIFICADO]**. `image-slot` aplica `object-fit:cover` (`image-slot.js:889`) → recorte leve. No es CLS, pero sí encuadre perdido: **las fotos reales deben entregarse en 4/3 exacto**.
2. **Riesgo de CLS por intercambio de fuente**, no por imágenes → §3.7.

Para producción, la regla oficial **[VERIFICADO — MDN `<img>`]**: *«Including `height` and `width` enables the aspect ratio of the image to be calculated by the browser prior to the image being loaded. This aspect ratio is used to reserve the space needed to display the image, reducing or even preventing a layout shift»*.

### 3.6 LCP del hero

**Candidato a LCP [INFERENCIA, a partir de hechos verificados]:** el `<span>` «Nails Lash» (línea 44) con `font-size:clamp(50px,11.5vw,142px)`, `line-height:.9`, `white-space:nowrap`. A 1280 px de lienzo, `11.5vw` = 147,2 px → se satura en **142 px**. Es, con diferencia, el bloque de texto de mayor área del viewport inicial.

Hechos verificados que lo condicionan:

- El fondo del hero es `radial-gradient(...)` **[VERIFICADO — línea 40]**. La doc oficial solo considera *«Elements with background images loaded via `url()` function»* **[VERIFICADO — web.dev/articles/lcp]** → **el degradado no es elegible para LCP**. Bien.
- `paintReveal` = `from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0 0 0)}` **[VERIFICADO — línea 21]**, aplicado como `paintReveal 4.8s cubic-bezier(.5,0,.25,1) .5s both` **[VERIFICADO — línea 44]**. Con `fill-mode: both` y retardo 0,5 s: **totalmente recortado de t=0 a t=0,5 s, y completamente revelado solo en t=5,3 s**.
- «Studio» lleva `fadeUp .9s 4.4s both` **[VERIFICADO — línea 49]** con `fadeUp{from{opacity:0;...}}` **[VERIFICADO — línea 23]** → **`opacity:0` hasta t=4,4 s**, visible del todo en t=5,3 s.
- Doc oficial: *«Elements with an opacity of 0, that are invisible to the user»* se filtran como no-contentful **[VERIFICADO — web.dev/articles/lcp]** → «Studio» **no puede ser LCP** hasta 4,4 s.
- Umbral bueno: **LCP ≤ 2,5 s en p75** **[VERIFICADO — ídem]**.
- No hay `fetchpriority` ni `rel=preload` para la fuente del hero **[VERIFICADO — §3.4]**.

**[DESCONOCIDO]** Si un elemento de texto recortado por `clip-path` es o no elegible para LCP mientras está recortado. La documentación oficial detalla el caso `opacity:0` pero **no encontré redacción oficial sobre `clip-path`**. → Tabla §4.

**[INFERENCIA]** Aunque el LCP técnico llegara a dispararse antes (por el párrafo de apoyo, línea 51, con solo 0,3 s de retardo), **la promesa de marca no es legible hasta ~5,3 s**. Sea cual sea el número que reporte la API, es una mala experiencia y un riesgo directo de suspender LCP. La animación debe recortarse a **≤ 1,2 s de duración total** y no debe gobernar la visibilidad del titular.

### 3.7 Fuentes: Google Fonts

**[VERIFICADO — `Opcion-1-Rosa.dc.html:11-13`]**:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gilda+Display&family=Great+Vibes&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Lo que ya está bien** (no lo toquemos): `preconnect` a ambos orígenes **[VERIFICADO — líneas 11-12]** y `display=swap` **[VERIFICADO — línea 13]**. La doc oficial confirma que el parámetro `display` inyecta `font-display` en el CSS devuelto **[VERIFICADO — developers.google.com/fonts/docs/css2]**.

**Lo que está mal:**

1. **Son TRES familias, no dos.** El encargo mencionaba Gilda Display + Manrope; también se carga **Great Vibes** **[VERIFICADO — línea 13]**, usada **una sola vez en todo el documento** (línea 44), para el titular del hero — es decir, **una familia entera para ~10 glifos**, y precisamente en el camino crítico del LCP **[VERIFICADO — `grep -o "font-family:'[^']*'"` → Gilda Display ×17, Manrope ×11, Great Vibes ×1]**.
2. **Se pide un peso que no se usa.** La URL solicita `wght@300;400;500;600;700`, pero en el HTML solo aparecen **400 (×12), 500 (×2), 600 (×18) y 700 (×7)**; **`font-weight:300` no se usa ni una vez** **[VERIFICADO — `grep -o "font-weight:[0-9]*"`]**. Es una instancia de fuente descargada para nada.
3. **La hoja de estilo de terceros bloquea el render.** Es un `<link rel="stylesheet">` en `<head>` hacia `fonts.googleapis.com` **[VERIFICADO — línea 13]** → conexión y descarga de tercero en el camino crítico, antes del primer pintado.
4. La doc oficial de Google Fonts recomienda *«Be precise about the styles you are using»* y permite pedir rangos de eje variable uniendo valores con `..` (p. ej. `wght@300..700`) frente a instancias sueltas con `;` **[VERIFICADO — developers.google.com/fonts/docs/css2]**.

**[DESCONOCIDO]** El **peso real en bytes** de esa petición. Al recuperar la URL, la API devolvió **7 reglas `@font-face` en `.ttf` y sin `unicode-range`**, porque Google Fonts sirve CSS distinto según el `User-Agent` y el mío no anunció soporte woff2. Un navegador moderno recibiría **woff2 con subconjuntos `unicode-range`**, bastante más ligero. **No puedo dar una cifra de KB sin medirlo con un UA real.** → Tabla §4.

### 3.8 Responsive: el 1280 es la mesa de trabajo, pero hay un desbordamiento real

**Desmontando la premisa [VERIFICADO]:** `grep -rn "1280"` no devuelve **ninguna** coincidencia en `Opcion-1-Rosa.dc.html`. Las seis coincidencias están en `nails lash studio - Opciones.dc.html:31,40,44,53,57,66`, en la forma `<dc-import name="Opcion-1-Rosa" hint-size="1280px,6200px" style="display:block;width:1280px">`. Es **el marco de previsualización del comparador**, no la página.

**La maqueta es fluida sin media queries [VERIFICADO]:** `grep -c "@media"` → **0**. Y aun así responde, gracias a:
- `grid-template-columns:repeat(auto-fit,minmax(…,1fr))` en 7 rejillas (líneas 68, 93, 127, 145, 169, 249, 293),
- tipografía `clamp()` (líneas 44, 49, 51, 65, 90, 125, 143, 166, 252, 296, 323),
- `flex-wrap:wrap` en cabecera y nav (líneas 30, 32).

**[INFERENCIA]** «Sin media queries» **no** equivale a «no responsive». Este layout es *intrínsecamente* responsive. La pregunta correcta no es «¿faltan breakpoints?» sino «¿dónde se rompe?». Y se rompe en un sitio concreto:

#### El bug: desbordamiento horizontal recortado en silencio

Cadena de hechos **[VERIFICADO]**:
- Contenedores internos: `max-width:1200px; padding:0 40px` (línea 62) y `max-width:1220px; padding:0 40px` (línea 163) → **ancho útil = min(viewport, 1200) − 80**.
- Rejilla de equipo: `repeat(auto-fit,minmax(320px,1fr))` (línea 169).
- Spec CSS Grid sobre `repeat()` con `auto-fit`: *«if any number of repetitions would overflow, then 1 repetition»* **[VERIFICADO — w3.org/TR/css-grid-1/]** → con espacio insuficiente queda **1 pista**, pero esa pista conserva su mínimo de **320 px** y **desborda**.
- Raíz con `overflow-x:hidden` (línea 28) → el desborde **se recorta sin barra de scroll**.

Cálculo resultante **[INFERENCIA a partir de lo anterior]**:

| Viewport | Ancho útil | `minmax(320px,…)` equipo (L169) | `minmax(300px,…)` ×4 (L68,93,249,293) | `minmax(280px,…)` (L145) | `minmax(250px,…)` (L127) |
|---:|---:|---:|---:|---:|---:|
| 320 px | 240 px | **desborda 80 px** | **desborda 60 px** | **desborda 40 px** | **desborda 10 px** |
| **360 px** | 280 px | **desborda 40 px** | **desborda 20 px** | justo (0) | ok |
| 375 px | 295 px | **desborda 25 px** | **desborda 5 px** | ok | ok |
| 390 px | 310 px | **desborda 10 px** | ok | ok | ok |
| 414 px | 334 px | ok | ok | ok | ok |

**360 px y 375 px son anchos de móvil masivamente comunes.** El síntoma no es un scroll horizontal (que se vería y se reportaría), sino **tarjetas cortadas por el borde derecho** — mucho más fácil de pasar por alto en QA.

**Corrección concreta:** `repeat(auto-fit, minmax(min(320px, 100%), 1fr))`. El `min()` deja que la pista ceda por debajo de su mínimo cuando el contenedor es más estrecho, eliminando el desborde sin añadir un solo breakpoint.

#### Otros puntos responsive verificados

- **Cabecera pegajosa que se desincroniza con los anclajes.** La cabecera es `position:sticky` con `padding:15px 40px` y `flex-wrap:wrap` (línea 30), y contiene 6 enlaces + botón «Reservar» (líneas 32-37). Las secciones asumen una altura fija de cabecera: `scroll-margin-top:70px` (línea 40) y `66px` (líneas 61, 86, 121, 139, 162, 248, 292, 320) **[VERIFICADO]**. **[INFERENCIA]** En móvil el nav envuelve en 2-3 filas y la cabecera pasa de ~66 px a bastante más → al pulsar un enlace del menú, **el título de la sección queda oculto bajo la cabecera**. Los 66/70 px están calibrados a ojo para escritorio.
- **Muestras de esmalte apretadas.** `grid-template-columns:repeat(6,1fr)` fijo, `max-width:440px`, `gap:16px`, `aspect-ratio:1` (líneas 106-108) **[VERIFICADO]**. **[INFERENCIA]** A 360 px: (280 − 5×16)/6 ≈ **33 px** por botón. Cumple el mínimo oficial de **24×24 px CSS de WCAG 2.2 SC 2.5.8 «Target Size (Minimum)», nivel AA** **[VERIFICADO — w3.org/TR/WCAG22/]**, pero queda incómodo. (Detalle de a11y: lo cede al auditor correspondiente.)
- **Relleno de 40 px en móvil.** `padding:0 40px` consume 80 px de 360 → 22 % del ancho. Sin media query que lo reduzca **[VERIFICADO — líneas 62, 163; `@media` = 0]**.

#### Dimensionado de imagen vs. layout real

**[INFERENCIA — aritmética sobre líneas 62 y 68]** A 1200 px de contenedor: ancho útil 1120 px, rejilla de categorías a 2 columnas con `gap:44px` → cada imagen ≈ **538 px CSS**. Las fuentes de 800 px solo dan **1,49×** → **insuficiente para pantallas 2×** (harían falta ~1076 px). En equipo (línea 163: 1220 − 80 = 1140; 3 columnas, `gap:26px`) → ≈ **363 px CSS**, y 2× pediría ~725 px: los 800 px sí bastan.

Conclusión: **las fuentes de 800 px están simultáneamente cortas para retina en escritorio y muy sobradas para móvil.** Eso es exactamente el problema que resuelve `srcset`/`sizes` **[VERIFICADO — MDN `<img>`: descriptores `w` y atributo `sizes`]**.

---

## 4. Lo que NO he podido verificar

| # | Afirmación / dato que falta | Por qué no está verificado | Qué haría falta |
|---|---|---|---|
| 1 | **Peso real de las fotos definitivas del salón** | No existen. Todo lo medido son marcadores «IMAGEN TEMPORAL» | Fotos reales del salón; entonces medir AVIF/WebP y fijar presupuesto |
| 2 | **KB reales de la petición a Google Fonts** | La API sirve CSS según `User-Agent`; mi descarga devolvió `.ttf` sin `unicode-range` en vez de woff2 subsetado | Descargar el CSS con UA de Chrome/Safari real, o medir en DevTools → pestaña Network |
| 3 | **LCP / CLS / INP medidos** | No he ejecutado la página. Además **no puede ejecutarse**: `support.js` exige `window.React`, que el HTML no carga (`support.js:10-17`) | Un build de producción real desplegado + Lighthouse/PageSpeed y datos de campo (CrUX) |
| 4 | **¿Es elegible para LCP un texto recortado con `clip-path`?** | La doc oficial detalla `opacity:0` pero no encontré redacción sobre `clip-path` | Spec de Element Timing / código de Chromium, o medición empírica con `PerformanceObserver` |
| 5 | **Cuál es exactamente el elemento LCP del hero** | Es inferencia por área; depende de métricas de fuente reales de Great Vibes y del viewport | `PerformanceObserver` de `largest-contentful-paint` sobre la página real |
| 6 | **Anchos de móvil de la audiencia real del salón** | Sin analítica. Los 360/375/390 px son anchos habituales del mercado, no datos del negocio | Google Analytics / Search Console del sitio actual, si existe |
| 7 | **Si «Nails Lash» a `clamp()` mínimo de 50px + `nowrap` desborda a 320 px** | Requiere renderizar con Great Vibes real para medir el avance de los glifos | Render en navegador a 320 px y medir `scrollWidth` |
| 8 | **Rendimiento del hosting (TTFB, CDN, HTTP/2/3, compresión)** | No hay infraestructura decidida ni verificada | Definir hosting y medir |
| 9 | **Datos de negocio de la maqueta** (precios, equipo, horarios, teléfono `+34600123456`, dirección) | `salon-data.js` es contenido de demo; el pie dice «Plantilla de demostración» (línea 366) | Confirmación del cliente. **Fuera de mi área, pero bloquea la publicación** |

---

## 5. Impacto en el proyecto

### 5.1 Qué EXIGE

1. **Reconstruir, no portar.** `scratchpad/design/**` es dirección de arte. Prohibido copiar `Opcion-1-Rosa.dc.html` a `src/`. Se reimplementa el diseño en el stack del proyecto con HTML servido (`<img>` en el marcado, descubrible por el preload scanner **[VERIFICADO — web.dev/articles/preload-scanner]**).
2. **Corregir la rejilla antes de que se herede:** `minmax(min(320px,100%),1fr)` en las 7 rejillas, y **quitar `overflow-x:hidden` de la raíz** (línea 28) — es un parche que oculta desbordes en vez de arreglarlos. Criterio de aceptación medible: **a 320/360/375/390/414 px, `document.documentElement.scrollWidth <= clientWidth`** y ninguna tarjeta recortada.
3. **Presupuesto de rendimiento en CI**, anclado a los umbrales oficiales **[VERIFICADO — web.dev]**: **LCP ≤ 2,5 s** y **CLS ≤ 0,1**, ambos **en p75**.
4. **Pipeline de imagen** con `<picture>` AVIF → WebP → JPEG; `width`/`height` en todos los `<img>` **[VERIFICADO — MDN]**; `loading="lazy"` **salvo** en el LCP; `srcset`+`sizes` derivados del layout real (§3.8).
5. **Entrega de fotos con proporción exacta:** equipo **4/3** (no 800×620 = 1,29) y categorías **4/5** **[VERIFICADO — líneas 78, 172]**.
6. **Fuentes:** eliminar `wght@300` (no se usa **[VERIFICADO]**); autoalojar woff2 subsetado a `latin`; mantener `font-display:swap`; **`preload` solo de la fuente del titular del hero**.
7. **Recalcular `scroll-margin-top`** en función de la altura real de la cabecera (idealmente vía variable CSS actualizada con `ResizeObserver`), no los 66/70 px fijos de escritorio.

### 5.2 Qué PROHÍBE

- ❌ **Enviar `support.js` + `image-slot.js` (116 KB)** o cualquier `<image-slot>`/`<x-dc>`/`DCLogic` a producción **[VERIFICADO — `support.js:1`, `image-slot.js:481-483`]**.
- ❌ **Publicar PNG para fotografía** **[VERIFICADO — MDN recomienda formatos con pérdida para fotos]**.
- ❌ **Publicar los `ph-*.png`** — llevan «IMAGEN TEMPORAL» impreso.
- ❌ **Publicar `salon-data.js`** (precios/equipo/teléfono ficticios; el pie dice «Plantilla de demostración», línea 366).
- ❌ **Animaciones que retrasen la visibilidad del contenido del hero**: nada de `opacity:0` con retardo largo + `fill-mode:both` sobre texto **[VERIFICADO — web.dev/articles/lcp excluye `opacity:0`]**. Techo duro: **≤ 1,2 s**.
- ❌ **`overflow-x:hidden` como solución** a un desbordamiento.

### 5.3 Features que implica (candidatas para `feature_list.json`)

| Feature | Descripción | Criterio de aceptación medible |
|---|---|---|
| `perf-image-pipeline` | Build que genera AVIF+WebP+JPEG en varios anchos con `srcset`/`sizes` | Ninguna imagen servida >150 KB; ≥2 anchos por imagen; AVIF servido a Chrome 85+/Safari 16.1+ |
| `responsive-grid-fix` | `minmax(min(N,100%),1fr)` + eliminar `overflow-x:hidden` | `scrollWidth <= clientWidth` a 320/360/375/390/414 px |
| `hero-lcp` | Hero con animación acotada y titular pintado de inmediato | LCP ≤ 2,5 s (p75, móvil); animación ≤1,2 s; sin `opacity:0` sobre el LCP |
| `font-self-host` | woff2 subsetado, sin peso 300, `preload` del titular | ≤2 familias en camino crítico; 0 peticiones bloqueantes a terceros |
| `sticky-header-offset` | Offset de anclaje ligado a la altura real de la cabecera | El título de sección queda visible tras navegar por anclaje en 320-1440 px |
| `perf-budget-ci` | Lighthouse CI como puerta de mérito | Falla el build si LCP >2,5 s o CLS >0,1 |
| `real-content` | Sustituir datos y fotos de demo por los reales | 0 apariciones de «IMAGEN TEMPORAL», `+34600123456` o «Plantilla de demostración» |

### 5.4 Presupuestos propuestos

**[INFERENCIA — propuesta de ingeniería mía, derivada de los umbrales oficiales LCP ≤2,5 s / CLS ≤0,1 (p75); NO son cifras tomadas de una fuente]**

| Recurso | Presupuesto | Nota |
|---|---:|---|
| Imagen del hero / LCP | ≤ 150 KB (AVIF) | Precargar; nunca `lazy` |
| Foto de categoría (1080w) | ≤ 80 KB (AVIF) | 3 en total |
| Retrato de equipo (720w) | ≤ 45 KB (AVIF) | 7 en total; `lazy` |
| Mapa | ≤ 30 KB, o mejor `<iframe>` diferido | Evaluar coste de privacidad/RGPD aparte |
| CSS crítico | ≤ 15 KB en línea | |
| JS total (comprimido) | ≤ 80 KB | El prototipo trae 116 KB solo de andamiaje |
| **Peso total de la primera carga** | **≤ 900 KB** | vs. 4,30 MiB del prototipo |

---

## 6. Resumen de fuentes

**Documentación oficial**
- LCP: umbral 2,5 s @p75, elegibilidad, exclusión de `opacity:0`, degradados no elegibles — https://web.dev/articles/lcp
- CLS: umbral 0,1 @p75 — https://web.dev/articles/cls
- Preload scanner y recursos inyectados por JS — https://web.dev/articles/preload-scanner
- `<img>`: `loading`, `width`/`height` y aspect ratio, `srcset`/`sizes` — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img
- Soporte y uso de AVIF/WebP/PNG — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types
- Google Fonts CSS2: parámetro `display`, rangos `..`, «be precise» — https://developers.google.com/fonts/docs/css2
- CSS Grid `repeat()` / `auto-fit` («if any number of repetitions would overflow, then 1 repetition») — https://www.w3.org/TR/css-grid-1/
- WCAG 2.2 SC 2.5.8 Target Size (Minimum), 24×24 px CSS, nivel AA — https://www.w3.org/TR/WCAG22/

**Evidencia del repositorio/prototipo**
- `Opcion-1-Rosa.dc.html` líneas 5, 11-13, 21, 23, 28, 30, 32-37, 40, 44-46, 49, 51, 62, 65, 68, 78, 93, 106-108, 127, 145, 163, 169, 172, 232, 249, 293, 314, 320, 366
- `nails lash studio - Opciones.dc.html` líneas 31, 40, 44, 53, 57, 66
- `image-slot.js` líneas 456-463, 481-483, 889, 989
- `support.js` líneas 1, 10-17
- `salon-data.js` líneas 15, 27, 39

**Mediciones propias (reproducibles)**
- `ls -la`, `du -cb`, `stat -c%s` para bytes
- `System.Drawing.Image` (PowerShell) para dimensiones y formato de píxel
- `ffmpeg 8.1.1-essentials_build` (`libwebp`, `libaom-av1`) para las conversiones de §3.2
- `grep -c` / `grep -o` para conteos de `@media`, `loading=`, `font-weight`, `font-family`, `1280`
