# Auditoría del prototipo — Inventario exhaustivo de secciones

> **Área:** Auditoría del prototipo (troceado en features)
> **Fecha del análisis:** 2026-07-15
> **Autor:** subagente investigador (área: auditoría del prototipo)
> **Estado:** informe de investigación. No modifica código.

## Convención de fuentes usada en este documento

Cada afirmación va etiquetada:

- **[V]** = **hecho verificado** leyendo el archivo indicado (`archivo:línea`).
- **[I]** = **inferencia** mía a partir de hechos verificados (cálculo, deducción). No medido.
- **[?]** = **desconocido / NO VERIFICADO**. Aparece en la tabla del apartado 3.

**Alias de rutas usados** (rutas absolutas completas):

| Alias | Ruta absoluta |
|---|---|
| `PROTO/` | `C:/Users/vhurt/AppData/Local/Temp/claude/C--Users-vhurt-OneDrive-Escritorio-Proyectos-CenitDigitalProyectosCodigo-NailsLashStudioWeb/d9bf86dc-79ce-4d29-aaec-eeb87ab57df6/scratchpad/design/sitio-web-sal-n-de-u-as/project/` |
| `HTML` | `PROTO/Opcion-1-Rosa.dc.html` (463 líneas) |
| `DATA` | `PROTO/salon-data.js` (120 líneas) |

---

## 1. Respuesta ejecutiva

**Qué hacemos:** usamos el prototipo `Opcion-1-Rosa.dc.html` como **especificación visual y funcional**, y lo **reimplementamos** desde cero en el stack de producción. **No lo desplegamos**, ni siquiera adaptado.

**Por qué (cuatro razones, todas verificadas):**

1. **No es HTML desplegable: es un mock de un framework propietario de diseño.** El archivo no es HTML estándar. Envuelve todo en un elemento `<x-dc>` (HTML:9), usa un `<helmet>` (HTML:10-27), etiquetas de plantilla propietarias `<sc-for>` / `<sc-if>` (p.ej. HTML:33, HTML:109) y un bloque `<script type="text/x-dc" data-dc-script>` con una clase `class Component extends DCLogic` (HTML:371-372). Nada de eso lo entiende un navegador por sí solo: depende de dos runtimes locales, `./support.js` (HTML:6; 61.088 bytes en disco) y `./image-slot.js` (HTML:26; 55.383 bytes). Verificado que `support.js` es quien implementa esas etiquetas: `if (tag === "sc-for") return walkFor(el, host);` y `if (tag === "sc-if") return walkIf(el, host);` (`PROTO/support.js:460-461`), y quien invoca `renderVals()` (`PROTO/support.js:737`, `PROTO/support.js:984`). **[V]**
2. **El contenido es casi todo de relleno.** Precios, teléfono, dirección, nombres del equipo y reseñas son datos inventados de plantilla. El propio pie lo admite: `© 2026 nails lash studio · Plantilla de demostración` (HTML:366). La dirección del prototipo es `Calle de la Belleza 24, 28010 Madrid` (DATA:106), que **no** corresponde a Las Rozas de Madrid. **[V]**
3. **La reserva y el chat son atrezzo: no envían nada a ningún sitio.** `empBook(i)` solo hace `this.empSet(i,{booked:true})` sobre estado local (HTML:403) y `chatPick(v)` solo añade mensajes a un array en memoria (HTML:407). No hay `fetch`, ni `XMLHttpRequest`, ni `<form action>`, ni backend. Sin embargo la interfaz promete al usuario `Te confirmaremos por WhatsApp.` (HTML:225) y `Te confirmaremos la hora exacta por WhatsApp en unos minutos.` (HTML:406). **Publicar esto tal cual sería prometer una cita que nadie recibe.** **[V]**
4. **Le falta toda la capa de "sitio real".** No hay `<h1>` en toda la página (solo 8 `<h2>` y 3 `<h3>`), no hay `<title>`, no hay `meta name="description"`, y `<html>` no lleva atributo `lang` (HTML:2). El pie no enlaza aviso legal, privacidad ni cookies (HTML:340-367). **[V]**

**Cómo troceamos:** el inventario del apartado 2 divide la página en **13 bloques** (1 header + 11 secciones + 1 footer). Del reparto sale una propuesta de **features** en el apartado 4.2, ordenada por dependencia: primero el esqueleto y los datos reales, luego los bloques estáticos, y al final los tres bloques interactivos (`#equipo`, `#reserva`, `#colores`), que son los que concentran el riesgo.

**El hallazgo más importante:** existe un **acoplamiento roto entre datos y enlaces** que en producción provocaría que el teléfono mostrado y el teléfono marcado sean distintos. Ver apartado 2.4, hallazgo H-2.

---

## 2. Desarrollo con evidencia

### 2.1. Estructura DOM global

Andamiaje del documento, de fuera a dentro **[V]**:

```
<!DOCTYPE html>                          HTML:1
<html>                    ← sin lang     HTML:2
  <head>                                 HTML:3-7
    <meta charset="utf-8">               HTML:4
    <meta name="viewport" ...>           HTML:5
    <script src="./support.js">          HTML:6   ← runtime DC (obligatorio)
  <body>                                 HTML:8
    <x-dc>                               HTML:9   ← raíz del componente DC
      <helmet>                           HTML:10-27
        3 <link> a Google Fonts          HTML:11-13
        <style> global + 4 @keyframes    HTML:14-25
        <script src="./image-slot.js">   HTML:26  ← runtime de slots de imagen
      <div style="--bg:…">               HTML:28  ← ÚNICO nodo con la paleta (13 CSS vars)
        <header>                         HTML:30-38
        <section id="top">               HTML:40-58
        <sc-for list="{{ categories }}"> HTML:60-84   ← genera 3 <section>
        <section id="colores">           HTML:86-119
        <section id="destacados">        HTML:121-137
        <section id="ofertas">           HTML:139-160
        <section id="equipo">            HTML:162-246
        <section id="reserva">           HTML:248-290
        <section id="contacto">          HTML:292-318
        <section id="faq">               HTML:320-338
        <footer>                         HTML:340-367
    </x-dc>
    <script type="text/x-dc" data-dc-script>   HTML:371-460  ← la lógica
```

**Sistema de temas [V]:** las 13 variables CSS (`--bg`, `--surface`, `--surface2`, `--ink`, `--text`, `--muted`, `--accent`, `--accent-dark`, `--accent-2`, `--accent-soft`, `--line`, `--on-accent`, `--brush`) viven **todas en un único atributo `style` inline** en HTML:28. El comentario de `DATA:2` lo confirma: `// Theme-agnostic — palettes live in each option's root CSS variables.`

**Las 3 opciones de color son el mismo archivo [V]:** `diff Opcion-1-Rosa.dc.html Opcion-2-Azul.dc.html` devuelve exactamente **4 líneas** distintas: 28, 79, 173 y 315. La línea 28 es la paleta; las otras 3 solo cambian el prefijo del `id` del `image-slot` (`s1-` → `s2-`, ver `PROTO/Opcion-2-Azul.dc.html:79`). Paletas verificadas:

| Opción | `--bg` | `--ink` | `--accent` | Fuente |
|---|---|---|---|---|
| 1 Rosa | `#FDF4F7` | `#B0466A` | `#C05576` | HTML:28 |
| 2 Azul | `#F1F8FB` | `#2E6E8E` | `#4E95B5` | `PROTO/Opcion-2-Azul.dc.html:28` |
| 3 Amarillo | `#FFF8EE` | `#C25B7C` | `#E77CA3` | `PROTO/Opcion-3-Amarillo.dc.html:28` |

**Consecuencia [I]:** elegir opción de color **no es una feature**; es cambiar 13 valores. El troceado debe asumir **una sola implementación** con las paletas como tokens.

**Estado de la máquina [V]** — `state = { data:null, color:0, faq:-1, chat:null, emp:{}, days:[] }` (HTML:373). Los datos se cargan **de forma asíncrona** con `import('./salon-data.js').then(...)` dentro de `componentDidMount()` (HTML:376-379), y mientras `data` es `null` `renderVals()` devuelve un objeto con **todas las listas vacías** y `ready:false` (HTML:415). Es decir: **el prototipo tiene un estado de carga vacío observable** — la página se pinta sin contenido hasta que resuelve el `import`.

---

### 2.2. INVENTARIO DE SECCIONES (de arriba abajo)

Leyenda de la columna **Origen**: `DATA` = viene de `salon-data.js`; `HARD` = escrito a mano en el HTML; `CALC` = generado por la lógica en tiempo de ejecución.

---

#### B-01 · `<header>` — Barra de navegación

| Campo | Valor |
|---|---|
| **Ancla/id** | *(sin id)* — el logo apunta a `#top` |
| **Líneas** | HTML:30-38 |
| **Propósito** | Navegación persistente + CTA principal |
| **Alto aprox.** | **~66-70 px** **[I]** (deducido: `padding:15px 40px` en HTML:30, y el resto de secciones declaran `scroll-margin-top:66px` — HTML:61 — y el hero `70px` — HTML:40 — que es justo la compensación del header sticky) |
| **Origen** | **Mixto** |

**Contenido [V]:**
- Logo textual `nails lash studio` → **HARD** (HTML:31). Fuente `Gilda Display`.
- 6 enlaces de nav → **DATA**: `<sc-for list="{{ nav }}" as="n" hint-placeholder-count="6">` (HTML:33) sobre `SALON.nav` (DATA:5-12), expuesto en `nav:d.nav` (HTML:422).
- Botón `Reservar` → **HARD**, apunta a `#equipo` (HTML:36).

**DOM:** `header[sticky, z-index:50, flex, backdrop-filter:blur(14px)]` › `a` + `nav[flex]` › `sc-for` › `a` × 6 + `a.cta`.

**Hallazgo H-1 — la nav ignora 4 de las 11 secciones. [V]** `SALON.nav` solo declara `unas, facial, depilacion, destacados, ofertas, equipo` (DATA:5-12). Las secciones `#colores` (HTML:86), `#reserva` (HTML:248), `#contacto` (HTML:292) y `#faq` (HTML:320) **existen pero no son alcanzables desde el menú**. `#contacto` (horario y dirección) es información crítica de un salón físico y no tiene entrada en el menú.

---

#### B-02 · `#top` — Hero

| Campo | Valor |
|---|---|
| **Ancla/id** | `top` |
| **Líneas** | HTML:40-58 |
| **Propósito** | Impacto de marca + animación de firma + CTAs |
| **Alto aprox.** | **~620-700 px** en escritorio **[I]** (`padding:96px 24px 104px` = 200px + título `clamp(50px,11.5vw,142px)` con `line-height:.9` ≈ 128px + subtítulo + párrafo + botones) |
| **Origen** | **HARD (100%)** |

**Contenido [V] — ni un solo dato sale de `salon-data.js`:**
- Eyebrow: `Uñas · Facial · Depilación · Madrid` → **HARD** (HTML:41).
- Título `Nails Lash` en `Great Vibes` → **HARD** (HTML:44).
- `Studio` → **HARD** (HTML:49).
- Párrafo `Tu salón de belleza integral...` → **HARD** (HTML:51).
- CTAs `Reservar cita`→`#equipo`, `Ver servicios`→`#unas` → **HARD** (HTML:53-54).
- Botón `↺ Repetir` → **CALC**, `onClick="{{ replay }}"` (HTML:55) → `replayBrush` (HTML:455).
- Indicador `desliza` con `animation:bob` → **HARD** (HTML:57).

**Animación de firma [V]:** dos animaciones sincronizadas de **4,8 s con 0,5 s de retardo**: `paintReveal` (revela el texto con `clip-path:inset(0 100% 0 0)` → `inset(0 0 0 0)`, HTML:21) y `brushSweep` (desplaza `./brush.png` de izquierda a derecha, HTML:22). El `Studio` aparece con `fadeUp .9s 4.4s both` (HTML:49) — es decir, **el hero no está completo hasta 5,3 s** tras la carga. `replayBrush()` la reinicia forzando reflow: `el.style.animation='none'; void el.offsetWidth; el.style.animation=a;` (HTML:395). Se re-dispara al entrar en viewport vía `IntersectionObserver` con `{threshold:0.35}` (HTML:385-388), y se limpia en `componentWillUnmount` (HTML:390).

**DOM:** `section#top[radial-gradient]` › `p.eyebrow` + `div[ref=brushRef]` › (`span[paintReveal]` + `span[brushSweep]`›`img`) + `div.studio` + `p` + `div.ctas` + `div.scroll-hint`.

**Hallazgo H-3 — no hay `<h1>`. [V]** El nombre del salón en el hero es un `<span>` (HTML:44), no un encabezado. En toda la página: **8 `<h2>` y 3 `<h3>`, cero `<h1>`** (verificado por conteo). El único `alt=` del documento es el de `brush.png`, y está vacío (`alt=""`, HTML:46) — correcto por ser decorativo, pero significa que **no hay ni una imagen de contenido con texto alternativo**.

**Riesgo de accesibilidad [I]:** `paintReveal`, `brushSweep` y `bob` (infinita, HTML:24/57) se ejecutan sin ninguna consulta `prefers-reduced-motion`. Verificado: la cadena `prefers-reduced-motion` **no aparece** en el archivo.

---

#### B-03/04/05 · `#unas`, `#facial`, `#depilacion` — Categorías de servicio (×3, generadas)

| Campo | Valor |
|---|---|
| **Ancla/id** | `unas`, `facial`, `depilacion` → **DATA**, `id="{{ cat.id }}"` (HTML:61) sobre `DATA:15,27,39` |
| **Líneas** | HTML:60-84 (**una plantilla** que genera 3 secciones) |
| **Propósito** | Catálogo de servicios con precios |
| **Alto aprox.** | **~1.000-1.050 px cada una** → **~3.050 px las tres** **[I]** (`padding:92px 0` = 184px + cabecera ≈160px + rejilla dominada por la imagen `aspect-ratio:4/5`: a 1200px de ancho máximo menos 80px de padding y 44px de gap ⇒ columna ≈538px ⇒ imagen ≈672px) |
| **Origen** | **DATA (casi 100%)** |

**Contenido [V]:** `<sc-for list="{{ categories }}" as="cat" hint-placeholder-count="3">` (HTML:60) sobre `SALON.categories` (DATA:13-50), expuesto sin transformar: `categories:d.categories` (HTML:423).

Por cada categoría:
- `{{ cat.eyebrow }}` (HTML:64) ← DATA:15/27/39
- `{{ cat.title }}` como `<h2>` (HTML:65)
- `{{ cat.intro }}` (HTML:66)
- Lista de precios: `<sc-for list="{{ cat.items }}" as="it" hint-placeholder-count="6">` (HTML:70) → `{{ it.name }}` / `{{ it.price }}` (HTML:72-73). **6 ítems por categoría, 18 en total** (DATA:17-24, 29-36, 41-48).
- CTA `Reservar {{ cat.label }}` → `#equipo` (HTML:76).
- Imagen: `<image-slot id="s1-{{ cat.id }}" src="{{ cat.img }}" shape="rect" placeholder="Foto de {{ cat.label }}">` (HTML:79) ← `cat.img` = `ph-unas.png` / `ph-facial.png` / `ph-depil.png` (DATA:15/27/39). **Los 3 archivos existen** en `PROTO/` (482.948 / 505.439 / 517.582 bytes).

**Datos de servicio verificados en el prototipo (los 18 precios) [V]:**

| Categoría | Servicio | Precio | Fuente |
|---|---|---|---|
| Uñas | Manicura semipermanente | 25 € | DATA:18 |
| Uñas | Manicura rusa completa | 30 € | DATA:19 |
| Uñas | Uñas acrílicas o gel | 40 € | DATA:20 |
| Uñas | Relleno acrílico o gel | 32 € | DATA:21 |
| Uñas | Pedicura spa completa | 35 € | DATA:22 |
| Uñas | Nail art y diseño | desde 5 € | DATA:23 |
| Facial | Limpieza facial profunda | 40 € | DATA:30 |
| Facial | Tratamiento hidratante | 45 € | DATA:31 |
| Facial | Peeling y luminosidad | 50 € | DATA:32 |
| Facial | Lifting de pestañas | 35 € | DATA:33 |
| Facial | Diseño de cejas | 15 € | DATA:34 |
| Facial | Tinte de pestañas | 12 € | DATA:35 |
| Depilación | Cejas | 8 € | DATA:42 |
| Depilación | Labio superior | 6 € | DATA:43 |
| Depilación | Axilas | 12 € | DATA:44 |
| Depilación | Medias piernas | 18 € | DATA:45 |
| Depilación | Piernas completas | 28 € | DATA:46 |
| Depilación | Ingles o cavado | 15 € | DATA:47 |

> ⚠️ **Estos 18 precios son de plantilla de demostración (HTML:366). NO son los precios del salón real.** Son el *esquema de datos* a rellenar, no el contenido. Ver apartado 3, fila V-1.

**DOM:** `section[id]` › `div[max-width:1200px]` › `div.cabecera`(`p`+`h2`+`p`) + `div[grid auto-fit minmax(300px,1fr), gap:44px]` › `div.tarjeta-precios`(`sc-for`›`div.fila`×6 + `a.cta`) + `div[aspect-ratio:4/5]`›`image-slot`.

**Hallazgo H-4 — `cat.slot` es un campo muerto. [V]** `salon-data.js` declara `slot: 's1-unas'` (DATA:15), `slot: 's1-facial'` (DATA:27), `slot: 's1-depil'` (DATA:39). La cadena `.slot` **no aparece ni una vez** en el HTML (verificado: 0 coincidencias). El id real se construye a mano con `id="s1-{{ cat.id }}"` (HTML:79), que produce `s1-unas`, `s1-facial` y **`s1-depilacion`** — que **no coincide** con el `s1-depil` declarado en DATA:39. Campo obsoleto: **no migrar**.

---

#### B-06 · `#colores` — Probador de esmalte

| Campo | Valor |
|---|---|
| **Ancla/id** | `colores` — **[V] no está en la nav** (H-1) |
| **Líneas** | HTML:86-119 |
| **Propósito** | Juguete interactivo: previsualizar tono sobre uñas dibujadas en CSS |
| **Alto aprox.** | **~600-650 px** **[I]** (`padding:92px 0` + cabecera ≈170px + panel `min-height:260px` HTML:94) |
| **Origen** | **Mixto**: textos HARD, colores DATA |

**Contenido [V]:**
- Eyebrow `Prueba tu color`, `<h2>` `Encuentra tu tono perfecto`, párrafo `Toca un esmalte...` → **HARD** (HTML:89-91).
- **5 uñas dibujadas 100% en CSS** (HTML:95-99): sin imágenes. Alturas 86/104/118/104/86 px, anchos 46/48/50/48/46, `border-radius` elípticos, `box-shadow:inset` y un `div` de brillo con `linear-gradient` + `rotate(7deg)`. Todas pintadas con `background:{{ activeColor.hex }}` y `transition:background .4s`.
- Nombre + hex del tono activo → **DATA/CALC**: `{{ activeColor.name }}` / `{{ activeColor.hex }}` (HTML:103-104) ← `activeColor:d.colors[S.color]` (HTML:446).
- Rejilla de 12 muestras: `<sc-for list="{{ colors }}" as="c" hint-placeholder-count="12">` (HTML:107) ← `colors:d.colors.map((col,i)=>({...col, active:i===S.color, pick:()=>this.setState({color:i})}))` (HTML:445) ← `SALON.colors` (DATA:84-91). Rejilla fija `repeat(6,1fr)` ⇒ **2 filas × 6** (HTML:106).
- Anillo de selección: `<sc-if value="{{ c.active }}">` › `span[inset:-6px, border:2px solid var(--accent)]` (HTML:109-111).
- CTA `Reservar con este tono` → `#equipo` (HTML:115).

**Los 12 esmaltes [V]** (DATA:85-90): Rojo Carmín `#B11226`, Vino Tinto `#6E1E2A`, Nude Rosado `#E7C4B8`, Rosa Empolvado `#D9A7A1`, Coral Suave `#E98A7A`, Malva `#9B7B8E`, Champán `#E4D2B8`, Fucsia `#B33771`, Azul Noche `#26364F`, Verde Salvia `#8AA79B`, Negro Ónix `#1B1B1D`, Blanco Nácar `#F2ECE4`.

**Hallazgo H-5 — el CTA pierde la selección. [V]** El botón dice `Reservar con este tono` (HTML:115) pero es un `<a href="#equipo">` plano: no arrastra `activeColor` a ninguna parte. `state.color` (HTML:373) no se lee en el bloque `#equipo` ni en `chatFlow`. La promesa de la interfaz no se cumple.

**Hallazgo H-6 — los botones de color no son accesibles por lectores de pantalla ni por teclado con etiqueta. [V]** El `<button>` de cada muestra (HTML:108) **no tiene texto ni `aria-label`**: solo `title="{{ c.name }}"` y un `background`. Verificado: **cero atributos `aria-*` en todo el documento**. Además el estado seleccionado se comunica **solo con un anillo de color** (HTML:110), sin `aria-pressed`.

---

#### B-07 · `#destacados` — Servicios estrella

| Campo | Valor |
|---|---|
| **Ancla/id** | `destacados` — **en la nav** (DATA:9) |
| **Líneas** | HTML:121-137 |
| **Propósito** | Escaparate de los 4 servicios más vendidos |
| **Alto aprox.** | **~510 px** **[I]** (184px padding + cabecera ≈130px + tarjetas ≈200px, en 1 fila de 4) |
| **Origen** | **DATA** (tarjetas) + **HARD** (cabecera) |

**Contenido [V]:**
- Eyebrow `Destacados` + `<h2>` `Servicios estrella` → **HARD** (HTML:124-125).
- `<sc-for list="{{ starServices }}" as="s" hint-placeholder-count="4">` (HTML:128) ← `starServices:d.starServices` (HTML:424) ← `SALON.starServices` (DATA:51-56). Sin transformación.
- Por tarjeta: `{{ s.tag }}` como píldora (HTML:130), `{{ s.title }}` `<h3>` (HTML:131), `{{ s.desc }}` (HTML:132).

**Los 4 destacados [V]:** Manicura rusa / `Top ventas` (DATA:52); Uñas acrílicas a medida / `Favorito` (DATA:53); Limpieza facial premium / `Recomendado` (DATA:54); Lifting de pestañas / `Tendencia` (DATA:55).

**DOM:** `section#destacados` › `div[max-width:1200px]` › `div.cabecera` + `div[grid auto-fit minmax(250px,1fr), gap:20px]` › `sc-for` › `div.tarjeta`(`span.tag`+`h3`+`p`) × 4.

> ⚠️ Las etiquetas `Top ventas`, `Favorito`, `Recomendado` y `Tendencia` son **afirmaciones comerciales de plantilla** (HTML:366). Ver apartado 3, fila V-5.

---

#### B-08 · `#ofertas` — Promociones del mes

| Campo | Valor |
|---|---|
| **Ancla/id** | `ofertas` — **en la nav** (DATA:10) |
| **Líneas** | HTML:139-160 |
| **Propósito** | Packs con descuento y precio tachado |
| **Alto aprox.** | **~600 px** **[I]** (184px + cabecera ≈130px + tarjetas ≈290px, 1 fila de 3) |
| **Origen** | **DATA** (tarjetas) + **HARD** (cabecera) |

**Contenido [V]:**
- Eyebrow `Ofertas` + `<h2>` `Promociones del mes` → **HARD** (HTML:142-143).
- `<sc-for list="{{ offers }}" as="o" hint-placeholder-count="3">` (HTML:146) ← `offers:d.offers` (HTML:425) ← `SALON.offers` (DATA:57-61).
- Por tarjeta: `{{ o.badge }}` absoluto arriba-derecha (HTML:148), `{{ o.title }}` `<h3>` (HTML:149), `{{ o.desc }}` (HTML:150), `{{ o.price }}` grande en `--accent` (HTML:152), `{{ o.old }}` con `text-decoration:line-through` (HTML:153), CTA `Reservar oferta`→`#equipo` (HTML:155).

**Las 3 ofertas [V]:** Pack Manos Perfectas 29 €/~~35 €~~/`−17%` (DATA:58); Dúo Uñas + Pestañas 55 €/~~65 €~~/`Ahorra 10 €` (DATA:59); Martes de Facial 32 €/~~40 €~~/`Solo martes` (DATA:60).

> ⚠️ **Precio tachado = anuncio de reducción de precio.** Los importes de referencia (`35 €`, `65 €`, `40 €`) y el `−17%` son inventados de plantilla. La publicidad de descuentos con precio anterior está regulada en España; el encuadre normativo concreto **no lo he verificado y no lo afirmo aquí** — ver apartado 3, fila V-6. Debe resolverlo el área legal antes de publicar.

---

#### B-09 · `#equipo` — Equipo + reserva por profesional ★ SECCIÓN MÁS COMPLEJA

| Campo | Valor |
|---|---|
| **Ancla/id** | `equipo` — **en la nav** (DATA:11) y **destino de TODOS los CTA** (HTML:36, 53, 76, 115, 155, 353) |
| **Líneas** | HTML:162-246 (**85 líneas, la sección más larga**) |
| **Propósito** | Ficha por profesional + selector día/hora + confirmación + carrusel de reseñas |
| **Alto aprox.** | **~2.400-2.500 px** **[I]** (padding 188px + cabecera ≈196px + rejilla: `max-width:1220px` − 80 padding = 1140, `minmax(320px,1fr)` gap 26 ⇒ **3 columnas** ≈362px ⇒ tarjeta ≈684px (imagen `aspect-ratio:4/3`≈272px + cuerpo ≈412px); **7 miembros ⇒ 3 filas** (3+3+1) ⇒ ≈2.104px). **Es ~1/4 de toda la página.** |
| **Origen** | **DATA + CALC intensivo** |

**Contenido [V]:**
- Cabecera centrada: eyebrow `Equipo`, `<h2>` `Nuestro equipo de profesionales`, párrafo `Elige a tu especialista, mira sus reseñas y reserva tu día y hora en segundos.` → **HARD** (HTML:165-167).
- `<sc-for list="{{ team }}" as="m" hint-placeholder-count="7">` (HTML:170) ← `team:d.team.map((m,i)=>{...})` (HTML:426-444), **la transformación más pesada del componente**.

**Los 7 profesionales [V]** (DATA:62-70): Lucía/Nail artist [Uñas, Nail art]; Carla/Esteticista [Facial, Depilación]; Andrea/Especialista en uñas [Uñas, Pedicura]; Nerea/Lash & brow [Facial, Pestañas]; Marta/Esteticista [Depilación, Facial]; Paula/Nail artist [Uñas, Nail art]; Sara/Manicurista [Uñas, Depilación].

**Anatomía de la tarjeta [V]:**
1. **Foto**: `<image-slot id="s1-emp{{ m.i }}" src="{{ m.photo }}">` (HTML:173). `photo` **no está en DATA**: se genera con `photo:'ph-woman'+i+'.png'` (HTML:432) → `ph-woman0.png`…`ph-woman6.png`. **Los 7 archivos existen** en `PROTO/`. **Es CALC por índice, no DATA.**
2. **Identidad**: `{{ m.name }}` `<h3>` + `{{ m.role }}` (HTML:178-179); `<sc-for list="{{ m.specialties }}">` → píldoras (HTML:182-184).
3. **Bloque de reserva** — envuelto en `<sc-if value="{{ m.notBooked }}">` (HTML:188):
   - Título `Reserva tu cita` → HARD (HTML:190).
   - **Selector de día**: `<sc-for list="{{ m.days }}">` (HTML:192) con **dos ramas mutuamente excluyentes**, `dd.active` (HTML:193, botón relleno) y `dd.idle` (HTML:196, botón outline).
   - **Selector de hora**: envuelto en `<sc-if value="{{ m.showTimes }}">` ⇒ **solo aparece tras elegir día** (`showTimes: st.day!=null`, HTML:434). Mismo patrón activo/idle (HTML:204/207).
   - **Botón reservar**: `<sc-if value="{{ m.canBook }}">` (HTML:213) vs. **estado deshabilitado** `<sc-if value="{{ m.notBook }}">` renderizado como un `div` con `border:1px dashed` (HTML:216-218). `canBook: has` donde `has = st.day!=null && st.time!=null` (HTML:430, 436).
   - Etiqueta dinámica: `bookLabel: has ? ('Reservar · '+days[st.day].dow+' '+days[st.day].day+' · '+d.timeSlots[st.time]) : 'Elige día y hora'` (HTML:438).
4. **Estado confirmado** — `<sc-if value="{{ m.booked }}">` (HTML:221): check `✓` en círculo (HTML:223), `{{ m.confirmMsg }}` (HTML:224) ← `confirmMsg` construido en HTML:439, la línea `Te confirmaremos por WhatsApp.` (HTML:225) y un botón `Cambiar` → `m.reset` (HTML:226).
5. **Reseñas**: `{{ m.review.stars }}` (HTML:231), `“{{ m.review.text }}”` con `min-height:60px` (HTML:232), `{{ m.review.author }}` (HTML:234) y flechas `←`/`→` → `m.revPrev`/`m.revNext` (HTML:236-237).

**Generación de días [V]** (HTML:380-384):
```js
const DOW=['dom','lun','mar','mié','jue','vie','sáb'];
const days=[]; const dt=new Date();
while(days.length<6){ dt.setDate(dt.getDate()+1); if(dt.getDay()!==0){ days.push({dow:…, day:…, mon:…}); } }
```
⇒ **6 días laborables a partir de mañana, excluyendo domingos, calculados en el navegador del cliente.** Estado por empleada: `emp:{}` indexado por posición, con forma `{day:null,time:null,rev:0,booked:false}` (HTML:398).

**Rotación de reseñas [V]** (HTML:419): `const rot=(i)=>{ const p=d.reviewPool, n=p.length, out=[]; for(let k=0;k<5;k++){ out.push(p[(i*2+k)%n]); } return out; };` — cada profesional recibe **5 reseñas del mismo pool de 10** (DATA:72-83), desplazadas `i*2`. Índice cíclico: `const ri=((st.rev%5)+5)%5;` (HTML:429) — maneja correctamente los negativos.

> 🔴 **Hallazgo H-7 — RESEÑAS FABRICADAS Y ESTRELLAS FIJAS. [V]** Las 10 reseñas (DATA:72-83) son texto estático de plantilla, **no de clientas reales**, y se reparten **por rotación aritmética** entre profesionales (HTML:419): la misma reseña de "María L." se muestra atribuida a **varias** empleadas distintas. Además la puntuación **no es un dato**: está escrita a fuego como `review:{ ...revs[ri], stars:'★★★★★' }` (HTML:440) ⇒ **siempre 5 estrellas, para todo el mundo, pase lo que pase**. Publicar reseñas inventadas en la web de un negocio real es una práctica comercial con riesgo legal serio en España/UE. **No cito artículo concreto porque no lo he verificado** (apartado 3, fila V-4): debe resolverlo el área legal. **Recomendación firme: la sección de reseñas NO se implementa hasta que existan reseñas reales y verificables con consentimiento.**

> 🔴 **Hallazgo H-8 — LA RESERVA NO RESERVA NADA. [V]** `empBook(i){ const st=this.empGet(i); if(st.day!=null && st.time!=null) this.empSet(i,{booked:true}); }` (HTML:403). Solo cambia estado local en memoria. **No hay `fetch`, ni `XHR`, ni `<form action>`, ni backend, ni persistencia**: al recargar la página la "cita" desaparece. Pero la interfaz afirma `Te confirmaremos por WhatsApp.` (HTML:225). En un sitio real esto significa que **la clienta cree que tiene cita y el salón no se entera**. Es el **riesgo número 1 de todo el prototipo**.

> ⚠️ **Hallazgo H-9 — franjas horarias incoherentes con el horario del sábado. [V]** `timeSlots: ['10:00','11:30','13:00','16:00','17:30','19:00']` (DATA:71) es una **lista plana aplicada por igual a todos los días** (`times: d.timeSlots.map(...)`, HTML:435), sin filtrar por día. Pero el horario declarado es `Sábado: 10:00 – 15:00` (DATA:102). ⇒ **El prototipo ofrece cita a las 16:00, 17:30 y 19:00 un sábado, con el salón cerrado.** La implementación real necesita franjas **dependientes del día**.

> ⚠️ **Hallazgo H-10 — sin disponibilidad real.** [V] Todas las franjas se ofrecen siempre a todas las profesionales: no existe concepto de hueco ocupado. Dos clientas pueden "reservar" la misma hora con la misma persona.

**DOM:** `section#equipo` › `div[max-width:1220px]` › `div.cabecera-centrada` + `div[grid auto-fit minmax(320px,1fr), gap:26px]` › `sc-for` › `div.tarjeta[flex-column]` › `div[aspect-ratio:4/3]`›`image-slot` + `div.cuerpo[flex-column, gap:16px]` › `div.identidad` + `sc-if(notBooked)`›`div.reserva` + `sc-if(booked)`›`div.confirmado` + `div.reseñas`.

---

#### B-10 · `#reserva` — Chat simulado de reserva

| Campo | Valor |
|---|---|
| **Ancla/id** | `reserva` — **[V] no está en la nav** (H-1) |
| **Líneas** | HTML:248-290 |
| **Propósito** | Segunda vía de reserva: asistente conversacional estilo WhatsApp |
| **Alto aprox.** | **~660 px** **[I]** (184px padding + tarjeta de chat ≈482px: cabecera ≈68px + cuerpo **`height:344px`** fijo declarado en HTML:264 + pie ≈70px) |
| **Origen** | **DATA (flujo) + HARD (textos) + CALC (mensajes)** |

**Contenido [V]:**
- Columna izquierda, **todo HARD**: eyebrow `Reserva rápida` (HTML:251), `<h2>` `¿Prefieres reservar por chat?` (HTML:252), párrafo (HTML:253), botón `WhatsApp` → `https://wa.me/34600123456` (HTML:255) y `Llamar al estudio` → `tel:+34600123456` (HTML:256).
- Columna derecha, ventana de chat:
  - Cabecera falsa: avatar `nl`, nombre `nails lash studio` (**HARD**, HTML:262) y estado `en línea` en verde `#2f9d5f` (**HARD**, HTML:262).
  - Cuerpo: `div[ref="{{ chatRef }}"][height:344px; overflow-y:auto]` (HTML:264). Autoscroll: `componentDidUpdate(){ if(this._chatEl){ this._chatEl.scrollTop=this._chatEl.scrollHeight; } }` (HTML:391).
  - Burbujas: `<sc-for list="{{ chatMsgs }}">` con ramas `msg.isBot` (izquierda, `border-radius:4px 14px 14px 14px`, HTML:266) y `msg.isUser` (derecha, verde `#DCF6E3`, HTML:267).
  - Pie con **3 modos excluyentes**: `<sc-if value="{{ hasOptions }}">` → botones de opción (HTML:271-277); `<sc-if value="{{ isInput }}">` → `input` + botón enviar (HTML:278-283); `<sc-if value="{{ chatDone }}">` → `Reservar otra cita` (HTML:284-286).

**Flujo conversacional [V]** ← `SALON.chatFlow` (DATA:112-117), **4 pasos**:

| # | `key` | Pregunta del bot | Tipo | Opciones | Fuente |
|---|---|---|---|---|---|
| 1 | `service` | `¡Hola! Soy el asistente de nails lash studio ✨ ¿Qué te gustaría reservar?` | `options` | Uñas, Facial, Depilación, Pestañas | DATA:113 |
| 2 | `day` | `¡Perfecto! ¿Qué día te viene mejor?` | `options` | Entre semana, Este fin de semana, Lo antes posible | DATA:114 |
| 3 | `time` | `Genial. ¿Prefieres alguna franja horaria?` | `options` | Por la mañana, Por la tarde, Me es indiferente | DATA:115 |
| 4 | `name` | `Casi listo. ¿A qué nombre hago la reserva?` | `input` | placeholder `Escribe tu nombre…` | DATA:116 |

**Máquina de estados [V]:** inicialización en HTML:378 (`chat:{ idx:0, msgs:[{role:'bot',text:d.chatFlow[0].bot}], answers:{}, done:false, draft:'' }`); avance en `chatPick(v)` (HTML:407) que añade la respuesta del usuario, la guarda en `answers[step.key]`, y si `idx<flow.length` empuja la siguiente pregunta, si no marca `done:true` y empuja `summary()`. `chatSend()` (HTML:408) valida no-vacío con `.trim()`. `chatKey()` (HTML:409) envía con `Enter` y hace `preventDefault()`. `chatRestart()` (HTML:411) reinicia.

**Mensaje final [V]** (HTML:406): `summary(a){ return '¡Gracias, ' + a.name + '! ✨ Tu solicitud: ' + a.service + ' · ' + a.day + ' · ' + a.time + '. Te confirmaremos la hora exacta por WhatsApp en unos minutos. ¡Te esperamos en nails lash studio!'; }`

> 🔴 **Hallazgo H-11 — el chat tampoco envía nada, y encima pide el nombre.** [V] `chatPick` (HTML:407) solo manipula `this.state.chat`. Las respuestas quedan en `answers` **en memoria del navegador** y se pierden al recargar. Pero el bot promete `Te confirmaremos la hora exacta por WhatsApp en unos minutos` (HTML:406) y `en línea` (HTML:262) simula un agente disponible. Además el paso 4 **recoge el nombre de la persona** (DATA:116) — un dato personal — sin ningún aviso de privacidad ni consentimiento a la vista. Nota matizada: **hoy no sale del navegador**, así que no hay tratamiento remoto; en cuanto se conecte a un backend, sí lo habrá. Ver apartado 3, fila V-7.

> ⚠️ **Hallazgo H-12 — `summary()` concatena la entrada del usuario sin escapar. [V]** `a.name` viene del `input` libre (HTML:280) y se inyecta por concatenación de cadenas (HTML:406). El riesgo real depende de si `support.js` interpola como texto o como HTML — **no lo he verificado** (apartado 3, fila V-8). En la reimplementación esto debe ser texto escapado, sin excepción.

**DOM:** `section#reserva` › `div[grid auto-fit minmax(300px,1fr), gap:56px]` › `div.izquierda`(`p`+`h2`+`p`+`div.botones`) + `div.chat[max-width:410px]` › `div.cabecera` + `div[ref, height:344px, overflow-y:auto]`›`sc-for`›burbujas + `div.pie`›(`sc-if`×3).

---

#### B-11 · `#contacto` — Horario y ubicación

| Campo | Valor |
|---|---|
| **Ancla/id** | `contacto` — **[V] no está en la nav** (H-1) |
| **Líneas** | HTML:292-318 |
| **Propósito** | Horario, dirección, teléfono, Instagram, mapa |
| **Alto aprox.** | **~630 px** **[I]** (184px padding + columna izquierda ≈450px; el mapa declara `min-height:360px` HTML:314) |
| **Origen** | **DATA (textos) + HARD (URLs)** ⚠️ |

**Contenido [V]:**
- Eyebrow `Visítanos` + `<h2>` `Horario y ubicación` → **HARD** (HTML:295-296).
- Horario: `<sc-for list="{{ hours }}" as="h" hint-placeholder-count="3">` (HTML:298) → `{{ h.d }}` / `{{ h.h }}` (HTML:300-301) ← `hours:d.hours` (HTML:448) ← `SALON.hours` (DATA:100-104).
- Dirección: `{{ contact.address }}` (HTML:306) ← DATA:106.
- Teléfono: `<a href="tel:+34600123456">{{ contact.phone }}</a>` (HTML:308) ⚠️ **href HARD**.
- Instagram: `<a href="https://instagram.com/nailslashstudio">{{ contact.instagram }}</a>` (HTML:309) ⚠️ **href HARD**.
- Botón `Escríbenos por WhatsApp` → `https://wa.me/34600123456` (HTML:311) ⚠️ **HARD**.
- Mapa: `<image-slot id="s1-map" src="ph-map.png" shape="rect" placeholder="Mapa de ubicación — arrastra una captura">` (HTML:315). **Es una IMAGEN ESTÁTICA, no un mapa embebido.** `ph-map.png` existe (401.144 bytes).

**Horario del prototipo [V]:** Lunes–Viernes `10:00 – 20:00` (DATA:101); Sábado `10:00 – 15:00` (DATA:102); Domingo `Cerrado` (DATA:103).

**Contacto del prototipo [V]** (DATA:105-111): dirección `Calle de la Belleza 24, 28010 Madrid`; teléfono `+34 600 123 456`; whatsapp `+34 600 123 456`; instagram `@nailslashstudio`; email `hola@nailslashstudio.com`.

> 🔴 **Hallazgo H-2 — ACOPLAMIENTO ROTO ENTRE DATO Y ENLACE. EL BUG MÁS PELIGROSO DEL PROTOTIPO. [V]** El **texto** del teléfono sale de los datos (`{{ contact.phone }}`) pero el **`href` está escrito a mano**. Verificado en las 7 apariciones:
>
> | Línea | Elemento | `href` (HARD) | Texto |
> |---|---|---|---|
> | HTML:255 | Botón WhatsApp (#reserva) | `https://wa.me/34600123456` | `WhatsApp` |
> | HTML:256 | Llamar (#reserva) | `tel:+34600123456` | `Llamar al estudio` |
> | HTML:308 | Teléfono (#contacto) | `tel:+34600123456` | `{{ contact.phone }}` |
> | HTML:309 | Instagram (#contacto) | `https://instagram.com/nailslashstudio` | `{{ contact.instagram }}` |
> | HTML:311 | WhatsApp (#contacto) | `https://wa.me/34600123456` | `Escríbenos por WhatsApp` |
> | HTML:359 | Teléfono (footer) | `tel:+34600123456` | `{{ contact.phone }}` |
> | HTML:360 | Instagram (footer) | `https://instagram.com/nailslashstudio` | `{{ contact.instagram }}` |
>
> **Consecuencia en producción:** cambiar `contact.phone` en `salon-data.js` actualiza **lo que se lee** pero **no lo que se marca al pulsar**. La web mostraría el teléfono real del salón y **llamaría al número de demostración**. Un fallo silencioso, invisible en revisión visual, que rompe la captación de clientas. **La reimplementación DEBE derivar `href` del mismo dato que el texto.**

> **Hallazgo H-13 — campos de contacto muertos. [V]** `contact.whatsapp` (DATA:108) y `contact.email` (DATA:110) **no se referencian ni una vez** en el HTML (verificado: 0 coincidencias para `whatsapp` y `contact.email`). El WhatsApp se reconstruye a mano en la URL `wa.me` y **el email no se muestra en ninguna parte de la web**. Relevante: un canal de contacto electrónico suele ser exigible en la información del prestador de servicios — **encuadre normativo NO VERIFICADO** (apartado 3, fila V-7).

**DOM:** `section#contacto` › `div[grid auto-fit minmax(300px,1fr), gap:48px, align-items:stretch]` › `div.izquierda`(`p`+`h2`+`div.horario`›`sc-for`×3 + `div.datos`) + `div[min-height:360px]`›`image-slot#s1-map`.

---

#### B-12 · `#faq` — Preguntas frecuentes (acordeón)

| Campo | Valor |
|---|---|
| **Ancla/id** | `faq` — **[V] no está en la nav** (H-1) |
| **Líneas** | HTML:320-338 |
| **Propósito** | Resolver objeciones antes de reservar |
| **Alto aprox.** | **~700 px plegado** **[I]** (184px padding + cabecera ≈120px + 6 filas ≈66px). Crece al abrir: solo **una** puede estar abierta a la vez. |
| **Origen** | **DATA (Q&A) + HARD (cabecera)** |

**Contenido [V]:**
- Eyebrow `FAQ` + `<h2>` `Preguntas frecuentes`, ambos centrados → **HARD** (HTML:322-323). Contenedor estrecho: `max-width:840px` (HTML:321).
- `<sc-for list="{{ faq }}" as="f" hint-placeholder-count="6">` (HTML:325) ← `faq:d.faq.map((f,i)=>({ ...f, open:S.faq===i, sign:S.faq===i?'–':'+', toggle:()=>this.setState(s=>({faq:s.faq===i?-1:i})) }))` (HTML:447) ← `SALON.faq` (DATA:92-99).
- Por fila: `<button onClick="{{ f.toggle }}">` con `{{ f.q }}` + `{{ f.sign }}` (HTML:327-329); respuesta bajo `<sc-if value="{{ f.open }}">` → `<p>{{ f.a }}</p>` (HTML:331-333).

**Acordeón de apertura única [V]:** `faq:-1` inicial (HTML:373) = todo cerrado; `toggle` hace `s.faq===i?-1:i` (HTML:447) ⇒ abrir una **cierra la anterior**; el signo alterna `+`/`–` (HTML:447).

**Las 6 preguntas [V]** (DATA:93-98): ¿Cómo reservo una cita?; ¿Cuánto dura el esmaltado semipermanente?; ¿Retiráis esmaltado o uñas de otro salón?; ¿Puedo llevar mi propio diseño?; ¿Qué formas de pago aceptáis?; ¿Cuál es la política de cancelación?

> ⚠️ **Contenido con consecuencias contractuales.** Dos respuestas comprometen al negocio: `Efectivo, tarjeta y pagos por móvil` (DATA:97) y `Te pedimos avisar con 24 h de antelación` (DATA:98). Son de plantilla: **hay que confirmarlas con la propietaria** (apartado 3, filas V-2/V-3). La respuesta de DATA:93 además describe **tres** vías de reserva (calendario, chat de WhatsApp, teléfono) que deben existir de verdad.

> **Hallazgo H-14 — acordeón sin semántica accesible. [V]** Es `button` + `sc-if` (HTML:327-333), sin `aria-expanded` ni `aria-controls` (cero atributos `aria-*` en el documento). La respuesta **se destruye y recrea** en el DOM, no se oculta.

**DOM:** `section#faq` › `div[max-width:840px]` › `p` + `h2` + `div[border-top]` › `sc-for` › `div[border-bottom]`(`button`(`span`+`span.signo`) + `sc-if`›`p`) × 6.

---

#### B-13 · `<footer>` — Pie

| Campo | Valor |
|---|---|
| **Ancla/id** | *(sin id)* |
| **Líneas** | HTML:340-367 |
| **Propósito** | Cierre de marca, enlaces secundarios, copyright |
| **Alto aprox.** | **~310 px** **[I]** (`padding:56px 40px 40px` HTML:340 + contenido ≈150px + barra inferior ≈65px) |
| **Origen** | **HARD (casi todo)** ⚠️ |

**Contenido [V]:**
- Marca `nails lash studio` → **HARD** (HTML:343) + descriptor `Uñas, facial y depilación. Tu salón de belleza integral, cuidado al detalle.` → **HARD** (HTML:344).
- Columna `Servicios`: 4 enlaces **HARD** → `#unas`, `#facial`, `#depilacion`, `#equipo` (HTML:350-353).
- Columna `Contacto`: `{{ contact.phone }}` con href HARD (HTML:359), `{{ contact.instagram }}` con href HARD (HTML:360), `{{ contact.address }}` (HTML:361).
- Copyright: `© 2026 nails lash studio · Plantilla de demostración` → **HARD** (HTML:366).

> 🔴 **Hallazgo H-15 — el pie no tiene NI UN enlace legal. [V]** No hay aviso legal, ni política de privacidad, ni política de cookies, ni condiciones. Verificado leyendo HTML:340-367 completo: solo `Servicios` y `Contacto`. Para la web de un negocio real en España esto es una carencia estructural. **El encuadre normativo exacto NO lo he verificado** (apartado 3, fila V-7) — lo debe resolver el área legal, pero el **hueco de maquetación** hay que preverlo ya.

> 🔴 **Hallazgo H-16 — el texto `Plantilla de demostración` está en el pie (HTML:366).** Si el prototipo se copiara a producción sin tocar, la web del salón real anunciaría literalmente que es una demo. Evidencia directa de que este archivo **nunca fue pensado para publicarse**.

**DOM:** `footer[background:var(--ink)]` › `div[max-width:1200px, flex, justify-between]` › `div.marca` + `div[flex, gap:60px]`(`div.servicios` + `div.contacto`) + `div.copyright[border-top]`.

---

### 2.3. Tablas resumen

#### Mapa de secciones (orden de arriba abajo)

| # | Bloque | Ancla | Líneas | Alto aprox. **[I]** | Origen | Interactivo |
|---|---|---|---|---|---|---|
| B-01 | Header | *(→`#top`)* | 30-38 | ~70 px | Mixto | Enlaces |
| B-02 | Hero | `#top` | 40-58 | ~660 px | **HARD 100%** | Botón repetir |
| B-03 | Uñas | `#unas` | 60-84 | ~1.020 px | **DATA** | No |
| B-04 | Facial | `#facial` | 60-84 | ~1.020 px | **DATA** | No |
| B-05 | Depilación | `#depilacion` | 60-84 | ~1.020 px | **DATA** | No |
| B-06 | Probador color | `#colores` | 86-119 | ~620 px | Mixto | **Sí** |
| B-07 | Destacados | `#destacados` | 121-137 | ~510 px | **DATA** | No |
| B-08 | Ofertas | `#ofertas` | 139-160 | ~600 px | **DATA** | No |
| B-09 | **Equipo + reserva** | `#equipo` | 162-246 | **~2.490 px** | DATA+CALC | **Sí (mucho)** |
| B-10 | Chat reserva | `#reserva` | 248-290 | ~660 px | Mixto | **Sí** |
| B-11 | Contacto | `#contacto` | 292-318 | ~630 px | DATA+HARD | No |
| B-12 | FAQ | `#faq` | 320-338 | ~700 px | **DATA** | **Sí** |
| B-13 | Footer | — | 340-367 | ~310 px | **HARD** | No |
| | **TOTAL** | | | **≈ 10.300 px** | | |

> **[I] Aviso sobre los altos:** son **cálculos derivados del CSS declarado** (paddings, `aspect-ratio`, `min-height`, `clamp`, número de ítems), a ~1440px de ancho y con la FAQ plegada. **No están medidos en navegador.** Margen de error estimado ±20%. Para verificarlos: renderizar y medir (apartado 3, fila V-9).

#### Trazabilidad `salon-data.js` → HTML

| Clave en DATA | Línea DATA | ¿Se usa? | Dónde se consume | Nº ítems |
|---|---|---|---|---|
| `brand.name` | 4 | ❌ **NO** | — (marca escrita a mano en HTML:31, 262, 343) | — |
| `brand.tagline` | 4 | ❌ **NO** | — (HTML:41 escribe otra variante, con `· Madrid`) | — |
| `nav` | 5-12 | ✅ | HTML:33 (header) | 6 |
| `categories` | 13-50 | ✅ | HTML:60 (3 secciones) | 3 × 6 ítems |
| `categories[].slot` | 15,27,39 | ❌ **NO** | — (id construido a mano en HTML:79) | — |
| `starServices` | 51-56 | ✅ | HTML:128 | 4 |
| `offers` | 57-61 | ✅ | HTML:146 | 3 |
| `team` | 62-70 | ✅ | HTML:170 | 7 |
| `timeSlots` | 71 | ✅ | HTML:435 (vía `d.timeSlots`) | 6 |
| `reviewPool` | 72-83 | ✅ | HTML:419 (rotación) | 10 |
| `colors` | 84-91 | ✅ | HTML:107 | 12 |
| `faq` | 92-99 | ✅ | HTML:325 | 6 |
| `hours` | 100-104 | ✅ | HTML:298 | 3 |
| `contact.address` | 106 | ✅ | HTML:306, 361 | — |
| `contact.phone` | 107 | ⚠️ **solo texto** | HTML:308, 359 (**href hardcodeado**) | — |
| `contact.whatsapp` | 108 | ❌ **NO** | — (URL `wa.me` a mano) | — |
| `contact.instagram` | 109 | ⚠️ **solo texto** | HTML:309, 360 (**href hardcodeado**) | — |
| `contact.email` | 110 | ❌ **NO** | — (**no aparece en la web**) | — |
| `chatFlow` | 112-117 | ✅ | HTML:378, 407, 417-418 | 4 pasos |

**Resumen [V]: 5 campos declarados y nunca usados** (`brand.name`, `brand.tagline`, `categories[].slot`, `contact.whatsapp`, `contact.email`) y **2 usados a medias** (`phone`, `instagram`: texto sí, enlace no).

#### Inventario de `image-slot` (11 huecos de imagen)

| Id generado | Sección | `src` | Origen del `src` | Archivo en disco | Línea |
|---|---|---|---|---|---|
| `s1-unas` | #unas | `ph-unas.png` | DATA:15 | ✅ 482.948 B | HTML:79 |
| `s1-facial` | #facial | `ph-facial.png` | DATA:27 | ✅ 505.439 B | HTML:79 |
| `s1-depilacion` | #depilacion | `ph-depil.png` | DATA:39 | ✅ 517.582 B | HTML:79 |
| `s1-emp0`…`s1-emp6` | #equipo | `ph-woman0..6.png` | **CALC** HTML:432 | ✅ los 7 (331-361 KB) | HTML:173 |
| `s1-map` | #contacto | `ph-map.png` | **HARD** HTML:315 | ✅ 401.144 B | HTML:315 |

**Peso [V]:** los 11 `ph-*.png` suman **≈ 4,0 MB** (medido en el listado del directorio). **[I]** Para una web real esto es inaceptable sin optimización: 4 MB de imágenes decorativas penalizan gravemente la carga en móvil.

**Estado de subidas [V]:** `PROTO/.image-slots.state.json` contiene **una sola clave, `blush-hero`**, con un `data:image/webp;base64`. Ese id **no se corresponde con ninguno** de los 11 slots de `Opcion-1-Rosa.dc.html`. **[I]** Conclusión: no hay ninguna imagen subida por el usuario para esta opción; los 11 slots resuelven a los `ph-*.png` de relleno.

**[?] Procedencia y derechos de los 11 `ph-*.png`: NO VERIFICADO.** Ver apartado 3, fila V-10. Especialmente crítico en `ph-woman0..6.png`: **si son personas reales, hacen falta derechos de imagen; y en ningún caso son las profesionales del salón.**

---

### 2.4. Hallazgos consolidados, por gravedad

| Id | Gravedad | Hallazgo | Evidencia |
|---|---|---|---|
| **H-8** | 🔴 **Crítico** | La reserva no reserva: solo estado local, pero promete confirmación por WhatsApp | HTML:403 vs HTML:225 |
| **H-11** | 🔴 **Crítico** | El chat no envía nada, simula agente `en línea` y recoge el nombre | HTML:407, 262, 406 |
| **H-7** | 🔴 **Crítico** | Reseñas inventadas, rotadas entre profesionales, con 5 estrellas fijas | DATA:72-83, HTML:419, HTML:440 |
| **H-2** | 🔴 **Crítico** | Texto del teléfono desde datos, `href` a mano ⇒ mostraría uno y marcaría otro | HTML:308, 359 vs DATA:107 |
| **H-15** | 🔴 **Crítico** | Cero enlaces legales en el pie | HTML:340-367 |
| **H-16** | 🔴 **Crítico** | El pie dice literalmente `Plantilla de demostración` | HTML:366 |
| **H-9** | ⚠️ Alto | Franjas fijas: ofrece 16:00/17:30/19:00 el sábado, cerrado a las 15:00 | DATA:71 vs DATA:102 |
| **H-10** | ⚠️ Alto | Sin disponibilidad real: dobles reservas posibles | HTML:435 |
| **H-3** | ⚠️ Alto | Sin `<h1>`, sin `<title>`, sin `meta description`, sin `lang` | HTML:2-7, conteo |
| **H-1** | ⚠️ Alto | La nav omite `#colores`, `#reserva`, `#contacto`, `#faq` | DATA:5-12 |
| **H-6** | ⚠️ Alto | Botones de color sin nombre accesible; cero `aria-*` en el documento | HTML:108 |
| **H-14** | ⚠️ Medio | Acordeón FAQ sin `aria-expanded` | HTML:327-333 |
| **H-13** | ⚠️ Medio | `contact.email` y `contact.whatsapp` nunca se renderizan | DATA:108,110 |
| **H-5** | ⚠️ Medio | `Reservar con este tono` no arrastra el tono elegido | HTML:115 |
| **H-12** | ⚠️ Medio | `summary()` concatena entrada de usuario sin escapar | HTML:406 |
| **H-4** | ℹ️ Bajo | `cat.slot` muerto e incoherente (`s1-depil` vs `s1-depilacion`) | DATA:39 vs HTML:79 |

---

## 3. Lo que NO he podido verificar

| Id | Afirmación / incógnita | Por qué no está verificado | Qué haría falta |
|---|---|---|---|
| **V-1** | **Los 18 servicios y sus precios reales** | El prototipo se autodeclara `Plantilla de demostración` (HTML:366). Los precios de DATA:17-48 son de relleno | Lista de precios oficial de la propietaria (carta, Booksy/Treatwell, o confirmación escrita) |
| **V-2** | **Formas de pago reales** | DATA:97 afirma `Efectivo, tarjeta y pagos por móvil` como texto de plantilla | Confirmación de la propietaria |
| **V-3** | **Política de cancelación real (24 h)** | DATA:98 es texto de plantilla con efecto contractual | Decisión escrita de la propietaria |
| **V-4** | **Régimen legal de publicar reseñas** | **No he consultado ninguna fuente normativa.** No cito artículos de memoria | Área legal: fuente oficial (BOE / EUR-Lex) sobre reseñas de consumidores y prácticas desleales |
| **V-5** | **Si se pueden usar `Top ventas` / `Favorito` / `Recomendado`** | Son afirmaciones de plantilla (DATA:52-55) sin dato que las respalde | Datos reales de ventas + criterio legal sobre afirmaciones comerciales |
| **V-6** | **Régimen de los precios tachados (`35 €`→`29 €`, `−17%`)** | No he consultado la norma sobre anuncio de reducción de precios | Área legal: fuente oficial sobre precio anterior/reducciones |
| **V-7** | **Qué información legal exige la web (aviso legal, privacidad, cookies, email de contacto)** | No he consultado LSSI/RGPD en fuente oficial. **No afirmo requisitos concretos** | Área legal: BOE (LSSI-CE, LOPDGDD) + EUR-Lex (RGPD) + criterio AEPD sobre cookies |
| **V-8** | **Si `{{ }}` de `support.js` escapa HTML** (riesgo real de H-12) | He verificado que `support.js` implementa `sc-for`/`sc-if` (support.js:460-461) pero **no he leído su ruta de interpolación** | Leer la función de interpolación en `PROTO/support.js` (61 KB) |
| **V-9** | **Los altos en píxeles del apartado 2.3** | Son **cálculos** desde el CSS declarado, no medidas | Renderizar en navegador a 1440px/390px y medir con DevTools |
| **V-10** | **Procedencia y derechos de los 11 `ph-*.png` (4 MB)** | Solo consta su existencia y tamaño. Origen desconocido | Confirmar si son generadas por IA, de stock o propias; y en `ph-woman*` si hay personas reales |
| **V-11** | **Datos reales del salón: nombre, dirección en Las Rozas, teléfono, Instagram, email** | El prototipo dice `Calle de la Belleza 24, 28010 Madrid` (DATA:106) y `+34 600 123 456` (DATA:107): **placeholders**, y **28010 Madrid no es Las Rozas** | Datos oficiales del negocio (ficha Google Business, Registro Mercantil, o la propietaria) |
| **V-12** | **Horario real** | DATA:100-104 es de plantilla | Confirmación de la propietaria |
| **V-13** | **Nombres, roles y fotos de las 7 profesionales reales** | DATA:62-70 son nombres inventados | Datos + consentimiento explícito de cada profesional para publicar nombre y foto |
| **V-14** | **Si el salón tiene sistema de reservas (Booksy, Treatwell, agenda propia)** | Determina si `#equipo` se integra o se construye | Preguntar a la propietaria |
| **V-15** | **Stack de producción** | `harness.config.json` define comandos, pero no he auditado el stack | Leer `harness.config.json` y `docs/architecture.md` |
| **V-16** | **Licencia de las 3 fuentes de Google (`Gilda Display`, `Great Vibes`, `Manrope`)** | Verificado que se cargan (HTML:11-13); **licencia no verificada** | Ficha oficial en fonts.google.com de cada familia |
| **V-17** | **Implicación de servir Google Fonts desde `fonts.googleapis.com`** | Verificado el `<link>` (HTML:13). **El encuadre RGPD no lo he verificado** | Área legal + decisión técnica (autoalojar las fuentes evita el debate) |

---

## 4. Impacto en el proyecto

### 4.1. Qué EXIGE

1. **Reimplementar, no adaptar.** El formato `.dc.html` (`<x-dc>`, `<sc-for>`, `<sc-if>`, `DCLogic`) depende de `support.js`+`image-slot.js` (116 KB de runtime propietario). **[V]** El prototipo es **la especificación**; el código es desechable.
2. **Una implementación, tres paletas como tokens.** Las opciones difieren en **4 líneas** (28, 79, 173, 315). **[V]** Los 13 tokens de HTML:28 deben ser variables de tema, no tres webs.
3. **Datos reales antes que código.** Todo el contenido es de demostración (HTML:366). **[V]** Sin V-1, V-11, V-12 y V-13 no se puede publicar nada.
4. **Un `href` derivado del dato, nunca escrito a mano.** H-2 es un fallo silencioso que la revisión visual no detecta. **[V]** Requisito verificable: *cambiar el teléfono en un único sitio cambia texto y `href` en las 7 apariciones*.
5. **Decidir qué es la reserva.** H-8/H-10 obligan a elegir: (a) integrar un sistema real, (b) enlazar a WhatsApp/teléfono sin simular agenda, o (c) construir backend con disponibilidad. **La opción (b) es la única que no requiere backend, y el prototipo ya tiene los botones** (HTML:255-256).
6. **Franjas dependientes del día.** H-9: el sábado cierra a las 15:00 pero se ofrecen las 19:00. **[V]**
7. **Capa base de sitio real:** `lang`, `<title>`, `meta description`, un `<h1>` único, `alt` en las 11 imágenes de contenido. **[V]**
8. **Presupuesto de imágenes.** 4 MB en 11 PNG. **[V]** Formatos modernos, tamaños responsivos y carga diferida.
9. **Hueco de enlaces legales en el pie**, aunque su contenido lo defina el área legal (V-7). **[V]**

### 4.2. Qué PROHÍBE

1. 🔴 **Prohibido publicar reseñas inventadas** (H-7). Se implementa **solo** con reseñas reales, verificables y consentidas — o no se implementa.
2. 🔴 **Prohibido publicar estrellas fijas** (`stars:'★★★★★'`, HTML:440). Una puntuación es un dato, no una decoración.
3. 🔴 **Prohibida cualquier confirmación que no confirme** (H-8/H-11). Si no hay backend, **se borra la promesa**, no se conserva el texto.
4. 🔴 **Prohibido el `en línea` falso** (HTML:262) y el chat que simula un humano si no hay nadie.
5. 🔴 **Prohibido publicar los datos de plantilla**: `+34 600 123 456`, `Calle de la Belleza 24, 28010 Madrid`, `hola@nailslashstudio.com`, `Plantilla de demostración`.
6. 🔴 **Prohibido publicar nombres y fotos de profesionales sin consentimiento** (V-13), y prohibido presentar `ph-woman*.png` como el equipo real.
7. ⚠️ **Prohibido mantener precios tachados y `Top ventas` sin respaldo** (V-5/V-6) hasta que el área legal se pronuncie.
8. ⚠️ **Prohibido recoger el nombre** (DATA:116) sin base legal ni información de privacidad, en cuanto ese dato salga del navegador (V-7).
9. ⚠️ **Prohibido copiar `cat.slot`** (H-4): campo muerto e incoherente.

### 4.3. Features que implica (propuesta de troceado)

Ordenadas por dependencia. `sdd:true` = merece conversación de spec + Gherkin.

**Bloque 0 — Cimientos (bloquean todo)**

| Feature | Alcance | Bloques | `sdd` |
|---|---|---|---|
| `F-00-datos-reales` | Sustituir `salon-data.js` por datos verificados. **Bloquea la publicación entera.** Cierra V-1, V-11, V-12, V-13 | todos | ✅ |
| `F-01-esqueleto-tema` | Documento base: `lang`, `<title>`, `meta`, tokens de HTML:28 como tema, tipografías (V-16/V-17) | global | ✅ |
| `F-02-fuente-unica-contacto` | **Mata H-2 y H-13.** Teléfono/WhatsApp/Instagram/email derivan `href` **y** texto del mismo dato | B-01,10,11,13 | ✅ |

**Bloque 1 — Estáticos (bajo riesgo)**

| Feature | Alcance | Bloques | `sdd` |
|---|---|---|---|
| `F-03-header-nav` | Header sticky + nav. **Resuelve H-1** | B-01 | ❌ |
| `F-04-hero` | Hero + `<h1>` real (H-3) + animación con `prefers-reduced-motion` | B-02 | ✅ |
| `F-05-categorias-servicios` | Las 3 secciones desde datos, 6 ítems cada una | B-03/04/05 | ✅ |
| `F-06-destacados` | 4 tarjetas. **Sujeta a V-5** | B-07 | ❌ |
| `F-07-ofertas` | 3 tarjetas con precio tachado. **BLOQUEADA por V-6** | B-08 | ✅ |
| `F-08-contacto-horario` | Horario + dirección + mapa | B-11 | ✅ |
| `F-09-faq` | Acordeón de apertura única + `aria-expanded` (H-14). **Contenido sujeto a V-2/V-3** | B-12 | ✅ |
| `F-10-footer-legal` | Pie + **hueco de enlaces legales** (H-15) y sin `Plantilla de demostración` (H-16) | B-13 | ✅ |

**Bloque 2 — Interactivos (todo el riesgo)**

| Feature | Alcance | Bloques | `sdd` |
|---|---|---|---|
| `F-11-reserva-decision` | **Feature de decisión, no de código.** Elegir (a) integración, (b) solo WhatsApp/teléfono, (c) backend. **Bloquea F-12 y F-13.** Cierra V-14 | B-09,10 | ✅ |
| `F-12-equipo-fichas` | Fichas **sin** agenda ni reseñas: foto, nombre, rol, especialidades. Entregable seguro e independiente de F-11 | B-09 | ✅ |
| `F-13-agenda` | Selector día/hora. **Solo si F-11 = (a) o (c).** Debe resolver H-9 y H-10 | B-09 | ✅ |
| `F-14-resenas` | **CONGELADA.** No se abre hasta cerrar V-4 y tener reseñas reales (H-7) | B-09 | ✅ |
| `F-15-chat` | **CONGELADA/replanteada.** Hoy simula un agente y no envía nada (H-11). Alternativa honesta: enlace directo a WhatsApp | B-10 | ✅ |
| `F-16-probador-color` | 12 tonos, uñas en CSS. Debe resolver H-6 (a11y) y H-5 (arrastrar el tono al CTA). Feature de deleite, **última** | B-06 | ✅ |
| `F-17-imagenes` | 11 slots: optimización (4 MB → objetivo), `alt`, responsive. **Sujeta a V-10** | B-03..11 | ✅ |

**Camino crítico [I]:** `F-00` → `F-02` → `F-11`. Las tres desbloquean el resto; **ninguna es de maquetación**. El trabajo bonito (`F-16`) es el menos urgente, y el bloque más grande de la página (`B-09`, ~25% del alto) es también el más bloqueado.

### 4.4. Recomendaciones inmediatas

1. **Reunión con la propietaria** para cerrar V-1, V-2, V-3, V-11, V-12, V-13, V-14. **Sin esto no hay proyecto**, solo maquetación de datos falsos.
2. **Encargo al área legal**: V-4, V-6, V-7, V-17. Tres de esas cuatro **bloquean features** (`F-07`, `F-10`, `F-14`).
3. **Decidir `F-11` antes de tocar `#equipo`**: es el 25% de la página y su implementación cambia por completo según la respuesta.
4. **Congelar por defecto `F-14` (reseñas) y `F-15` (chat)**: es el par de features que más riesgo aporta y menos valor verificable tiene hoy.

---

## Anexo — Archivos del prototipo

| Archivo | Bytes | Papel |
|---|---|---|
| `PROTO/Opcion-1-Rosa.dc.html` | 40.634 | **Prototipo auditado** |
| `PROTO/Opcion-2-Azul.dc.html` | 40.634 | Idéntico salvo 4 líneas (28, 79, 173, 315) |
| `PROTO/Opcion-3-Amarillo.dc.html` | 40.639 | Ídem |
| `PROTO/salon-data.js` | 7.684 | **Datos compartidos** (de demostración) |
| `PROTO/support.js` | 61.088 | Runtime DC (`sc-for`/`sc-if`/`renderVals`) — **no reutilizable** |
| `PROTO/image-slot.js` | 55.383 | Runtime de slots — **no reutilizable** |
| `PROTO/.image-slots.state.json` | 3.737 | Solo `blush-hero`; **ningún slot de Opción 1** |
| `PROTO/brush.png` | 5.857 | Pincel del hero (HTML:46) |
| `PROTO/ph-*.png` (11) | ≈4,0 MB | Imágenes de relleno (V-10) |
| `PROTO/nails lash studio - Opciones.dc.html` | 4.580 | Índice de opciones (no auditado) |
| `PROTO/uploads/` (9 archivos) | ≈1,3 MB | Capturas de referencia (no auditadas) |
