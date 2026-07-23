# Auditoría a11y + SEO — LOTE galería v3 (cristal · 2 s · teclado global) + sección Reseñas

> Auditor: `a11y_seo_auditor` (solo lectura) · Fecha: 2026-07-23 · Rama: `feat/galeria-v3-resenas`
> Alcance (DELTA sobre `progress/a11y_galeria_carrusel.md`, que sigue válida para lo no cambiado):
> `Galeria.tsx` + `galeria.module.scss` (mandos de cristal, `.mandos` eliminada), `carrusel-logica.ts`,
> `Resenas.tsx`, `resenas-logica.ts`, `resenas.module.scss`, `src/lib/resenas-agregado.ts`,
> `src/lib/demo/resenas-demo.ts`, `src/pages/home.tsx`. Contratos: `features/galeria_carrusel.feature`
> v3 (@s20..@s24) y `features/resenas_agregado_enlace.feature`. Tokens: `src/styles/_tokens.scss`.
> Evidencia dinámica: `vitest run` dirigido sobre los 8 ficheros de test del lote — **292 tests verdes**
> (sin suite completa, sin build, sin mutación, según encargo).

## Veredicto global: **APTO CON AVISOS** — 0 bloqueantes (🔴), 2 importantes (🟡), 3 menores (🔵)

---

## Eje 1 — SC 1.4.11: el PEOR CASO del cristal — **APTO** (glifo aguanta; el borde, con matiz 🟡)

Base sólida de los mandos: `color-mix(in srgb, var(--surface) 78%, transparent)` =
`rgba(255,255,255,0.78)` (`galeria.module.scss:42`, `resenas.module.scss:49`). El `backdrop-filter:
blur(8px)` NO cuenta: promedia, no garantiza nada. Composición alfa en sRGB:
`C_eff = 0.78·255 + 0.22·C_under` por canal. Luminancias WCAG y ratios reales:

| Píxel debajo | Base efectiva | Glifo `--accent-dark #A23E5F` | Borde `--border-interactive #AB5F79` |
|---|---|---|---|
| `#FFFFFF` (el que pide el encargo) | `#FFFFFF` | **6,19:1** ✔ | **4,52:1** ✔ |
| `--bg #FDF4F7` | `#FFFDFD` | **6,11:1** ✔ | **4,46:1** ✔ |
| Rojo clásico `#C0392B` (foto «Manicura clásica en rojo») | `#F1D3D0` | **4,41:1** ✔ | **3,22:1** ✔ |
| Sombra granate `#7A1F1F` | `#E2CECE` | **4,12:1** ✔ | **3,00:1** ✔ (justo) |
| Negro absoluto `#000000` (suelo teórico) | `#C7C7C7` | **3,66:1** ✔ | **2,67:1** ✘ |

- OJO a la trampa del enunciado: para un glifo OSCURO el peor caso NO es el píxel más claro (blanco
  da el MÁXIMO contraste, 6,19) sino el más oscuro. El suelo absoluto del compuesto al 78 % es
  `#C7C7C7` y ahí el **glifo aguanta 3,66:1 ≥ 3:1 SIEMPRE**, sobre cualquier píxel imaginable: el
  componente queda identificable por su glifo en todo caso → 1.4.11 se sostiene.
- 🟡 **El borde NO está garantizado**: bajo píxeles casi negros cae a 2,67:1 (y roza el 3,00 en
  sombras granate de la foto roja, donde se posan las flechas a media altura). Hoy no es fallo AA
  (el glifo, que sí identifica el control, nunca baja de 3,66), pero el día que entren las fotos
  reales del salón (fondos oscuros plausibles) el anillo desaparece visualmente. Corrección en una
  línea: subir la base a `var(--surface) 85%` → suelo `#D9D9D9`: borde 3,20:1 y glifo 4,39:1
  INCONDICIONALES. `galeria.module.scss:42` y `resenas.module.scss:49`.
- En el carrusel de reseñas el «peor caso» es trivial: debajo solo hay `--surface2 #FBE7EF`, `--bg`
  o texto — compuesto ≈ `#FFFD.. `, glifo ≥ 6:1. ✔
- El resto del control heredado (44×44 px, z-index 7 > capaDe(0,6)=6, siempre visible en ≤640px,
  fuera de `overflow`/`perspective` — anillo de foco intacto, SC 2.4.7) verificado por bytes en
  `galeria-estilos.test.ts` / `resenas-estilos.test.ts` (@s24, verdes).

## Eje 2 — SC 2.2.2 con cadencia de 2 s — **APTO** (🔵 aviso UX en reseñas, atribución honesta)

El mecanismo de control está ÍNTEGRO en los DOS carruseles:
- Botón ⏸/▶ PRIMERO en el DOM y en el tab-order, persistente, sin `aria-pressed`
  (`Galeria.tsx:350-357`, `Resenas.tsx:329-337`); «Parar» es definitivo — `debeRotar` da precedencia
  absoluta a `pausadoPorElUsuario`, y el anti-regresión de @s20 está cableado: en pausa,
  `reiniciarElReloj` solo cambia el token; el efecto del intervalo sigue sin correr porque `rotando`
  es false (`Galeria.tsx:161-175,182-184`; réplica en `Resenas.tsx:133-147`). Aseverado en tests.
- Hover pausa/reanuda; foco pausa PEGAJOSO (no reanuda al salir); reduced-motion arranca pausado y
  se escucha EN CALIENTE (`Galeria.tsx:128-151`, `Resenas.tsx:103-125`).
- ¿2 s introduce algo nuevo? **Normativamente no**: SC 2.2.2 exige un MECANISMO de pausa, no un
  ritmo — el mecanismo no cambió, y el reinicio del reloj (@s20) incluso mejora el control (la foto
  no salta 0,3 s después de una acción manual). `aria-live` sigue en `off` mientras rota
  (`vozDeLaPista`): a 2 s NO hay metralleta de anuncios al lector de pantalla. No hay destello
  (SC 2.3.1 no aplica).
- 🔵 **Aviso honesto, NO WCAG**: 2 s por TESTIMONIO (texto de 1-2 frases, ~15-20 palabras) queda por
  debajo de la velocidad de lectura cómoda; el lector medio necesita 4-6 s. Quien lee con ratón o
  teclado pausa sin querer (hover/foco); quien lee en TÁCTIL no tiene hover y deberá cazar el ⏸.
  Es decisión del cliente (brief v3 §1, cerrada) y 2.2.2 se cumple: se deja constancia, no se bloquea.

## Eje 3 — Teclado global (@s21..@s23) — **APTO CON AVISO 🟡** (guardas correctas; doble-atención)

- **Guardas verificadas**: `pasoDeTecla` devuelve 0 con Ctrl/Alt/Meta y con campo de escritura
  activo (INPUT/TEXTAREA/SELECT/contenteditable — el chat de #reserva queda protegido);
  `preventDefault()` SOLO tras decidir atender (`Galeria.tsx:210-227`, `Resenas.tsx:176-193`);
  visibilidad con umbral 0,6 INCLUSIVO (`quienAtiendeElTeclado`, `carrusel-logica.ts:82-98`).
  292 tests verdes incluyen las 8 filas de @s21 y la tabla de @s22.
- **¿Se pierde el scroll por flechas?** Solo el HORIZONTAL: `PASO_POR_TECLA` mapea únicamente
  ArrowLeft/ArrowRight (`carrusel-logica.ts:27-30`). ArrowUp/ArrowDown/PageDown/espacio — el scroll
  VERTICAL real de esta página de una columna — jamás se capturan. La página no tiene scroll
  horizontal (`overflow: hidden` en las secciones), así que la flecha secuestrada no quitaba nada.
  No hay trampa de teclado (Tab sale siempre) y SC 2.1.4 no aplica (las flechas no son teclas de
  carácter). **Dictamen: compromiso aceptable.**
- 🟡 **La doble-atención existe**: hay DOS listeners de documento (uno por carrusel) y cada uno
  llama a `quienAtiendeElTeclado` con UNA sola candidata y `distanciaAlCentro: 0`
  (`Galeria.tsx:217-221`, `Resenas.tsx:183-187`). El desempate por cercanía al centro que @s22
  contrata («si ocurriera, gana el más cercano») es INALCANZABLE en el cableado real: si ambas
  secciones llegaran al 60 % visible a la vez (viewport altísimo o zoom-out fuerte; o foco dentro
  de un carrusel con el otro visible), UNA pulsación movería LOS DOS carruseles. La geometría real
  (separados por #reserva, sección alta) lo hace excepcional, y los usuarios de zoom WCAG amplían,
  no reducen — por eso es 🟡 y no 🔴. Corrección en una línea de diseño: registro compartido de
  candidatas (módulo) con `distanciaAlCentro` real del `boundingClientRect`, UNA decisión y UN
  movimiento. Pendiente además la verificación EN VIVO del gesto (jsdom no sabe de visibilidad),
  como el propio @s23 declara.

## Eje 4 — Reseñas: contraste del TEXTO — **APTO** (🔵 laterales, con la defensa anotada)

Tarjeta central (`.lamina` sobre `--surface2 #FBE7EF`, opacidad 1 a distancia 0):

| Elemento | Par | Ratio | Umbral | ✔ |
|---|---|---|---|---|
| Cita (15 px) | `--text #5E404A` / `#FBE7EF` | **7,70:1** | 4,5:1 | ✔ |
| Autora (16 px, 600) | `--ink #8E3355` / `#FBE7EF` | **6,45:1** | 4,5:1 | ✔ |
| Servicio (13 px) y nota «N de 5» (14 px) | `--accent-dark #A23E5F` / `#FBE7EF` | **5,24:1** | 4,5:1 | ✔ |
| Línea del agregado (15 px) | `--muted #6F525A` / `--bg #FDF4F7` | **6,42:1** | 4,5:1 | ✔ |
| Enlace Treatwell | `--accent-dark` / `--bg` | **5,74:1** | 4,5:1 | ✔ |
| Leyenda de honestidad (13 px) | `--muted` / `--bg` | **6,42:1** | 4,5:1 | ✔ |

- Todos los pares son tokens YA auditados por la puerta de contraste; ningún color nuevo. Las
  estrellas ★ van en `--accent-dark` y son `aria-hidden` con el número en texto al lado: su
  contraste no es exigible (decorativas con alternativa textual) y aun así da 5,24.
- **¿Texto esencial SOLO en laterales? NO**: los seis testimonios rotan TODOS por el centro
  (autoplay, flechas, puntos, arrastre, teclado) a opacidad 1, y el texto completo vive siempre en
  el árbol de accesibilidad (ninguna diapositiva lleva `aria-hidden`). 🔵 Constancia honesta: el
  texto lateral apagado rinde 3,04:1 (d=1, op 0.62) y 1,55:1 (d=2, op 0.28) — una lectura estricta
  de 1.4.3 contaría ese texto visible; la defensa es que son duplicados-preview de contenido
  íntegramente disponible en el centro, sancionados como (P) por @s9 con puerta humana. Se anota,
  no se bloquea.
- 🔵 Guardia: el enlace a Treatwell se distingue del texto circundante por color a 1,12:1 — hoy
  cumple 1.4.1 porque CONSERVA el subrayado por defecto (ninguna regla lo quita; solo `.demo-btn`
  resetea `text-decoration`). Si alguien añade `text-decoration: none` a `.agregado a`, cae 1.4.1.

## Eje 5 — Árbol APG del segundo carrusel — **APTO**

- **Ids propios sin colisión**: `resenas-titulo` / `resenas-pista` (`Resenas.tsx:54-55`) contra
  `galeria-titulo` / `galeria-pista`; los `aria-controls` de las flechas de reseñas apuntan a SU
  pista (`Resenas.tsx:342,351`). Ningún id compartido.
- Contenedor `role="group"` + `aria-roledescription="carrusel"` + `aria-labelledby` al `<h2>` propio
  (`Resenas.tsx:310-314`); pista con `aria-live={vozDeLaPista(...)}` + `aria-atomic="false"`
  (`Resenas.tsx:361-365`); seis diapositivas `role="group"` + «diapositiva» + «1 de 6»..«6 de 6»,
  jamás ocultas (`Resenas.tsx:371-377`).
- **⏸ primero** en DOM/tab-order, **sin `aria-pressed`** en ningún estado, etiqueta
  Parar/Iniciar (`Resenas.tsx:329-337`) — literal APG, replicado del contrato padre.
- **Diana de 24 px en los puntos**: caja `1.5rem` con círculo visible de `0.75rem` en el `::before`
  que lleva su propio anillo (`resenas.module.scss:235-252`), hueco 0.125rem sin solape; estado por
  DOS tokens, no opacidad (SC 1.4.11 de estados ✔, 5,74:1 relleno activo / 4,19:1 borde sobre --bg).
- **Estrellas**: `aria-hidden="true"` con la nota SIEMPRE en texto al lado — «4,9 de 5» en el
  agregado (`Resenas.tsx:302-303`) y «4 de 5»/«5 de 5» en cada tarjeta (`Resenas.tsx:389-390`);
  nombres de puntos «Ver el testimonio N de 6» y grupo «Elegir el testimonio que se muestra».
- Los DOS «Anterior»/«Siguiente»/rotación de la home se desambiguan por el nombre accesible del
  carrusel contenedor («Nuestros trabajos» / «Lo que dicen nuestras clientas»); dentro de cada
  ámbito siguen singulares. ✔ (@s8, tests verdes)

## Eje 6 — SEO — **APTO**

- **Cascarón**: raíz `<div>` NO navegable (`Resenas.tsx:290`), sin `<section>`, sin `<nav>`, sin
  `<a href="#…">` — controles `<button type="button">`; UN solo `<h2>` nuevo («Lo que dicen
  nuestras clientas»), ningún `<h1>`; dentro de `<main>` entre Equipo y Reserva (`home.tsx:117-124`);
  la nav no cambia. Todo horneable por SSR (`renderToString`, tests verdes).
- **JSON-LD SIN `aggregateRating`**: `home.tsx:59-67` compone `construirJsonLd` + horario y NADA
  más; el test horneado EXISTENTE lo asevera por claves Y por bytes
  (`home-horneado.test.ts:127-135`: ni `aggregateRating` ni `review` en todo el HTML). Conforme a
  las guidelines de Google: la nota de terceros se muestra a personas, jamás se marca como propia.
- **Enlace a Treatwell**: `target="_blank" rel="noopener noreferrer"` (`Resenas.tsx:305`).
  **Dictamen sobre `nofollow`: NO es necesario.** Es un enlace de ATRIBUCIÓN editorial a la fuente
  del dato (obligación del art. 20.4), no un enlace pagado (`sponsored`) ni contenido de usuario
  (`ugc`); las directrices de Google reservan nofollow para enlaces no avalados — citar la fuente
  del agregado ES avalarla. El rel actual es la convención del repo y es correcto.
- **Los textos de ejemplo no se presentan como reseñas reales**: cero marcado `Review`/`Rating` en
  structured data + la leyenda VISIBLE en el flujo: «Testimonios de ejemplo · textos de muestra
  pendientes de sustituir por reseñas reales de clientas del salón; la nota agregada procede de
  Treatwell.» (`resenas-demo.ts:72-73`, pintada en `Resenas.tsx:419`). Evaluación de la redacción:
  cumple — declara la naturaleza de ejemplo SIN ambigüedad, separa el agregado (real, atribuido,
  enlazado y fechado «dato del 23/07/2026») de los testimonios (inventados), e integra el aviso de
  origen del 20.4 sin banner. Riesgo residual asumible: un snippet de Google podría citar una frase
  de ejemplo, pero sin marcado de reseña no hay claim estructurado que lo respalde.

---

## Resumen

| Eje | Veredicto |
|---|---|
| 1 · SC 1.4.11 cristal (peor caso calculado) | **APTO** · 🟡 borde 2,67:1 bajo píxel casi negro (glifo aguanta 3,66:1 siempre; fix: surface 85 %) |
| 2 · SC 2.2.2 con 2 s | **APTO** · 🔵 2 s sobre texto es hostil al lector táctil (decisión de cliente, no WCAG) |
| 3 · Teclado global @s21..@s23 | **APTO** · 🟡 doble-atención posible: el desempate de @s22 es inalcanzable en el cableado |
| 4 · Contraste del texto de Reseñas | **APTO** (todos ≥ 5,24:1) · 🔵 laterales apagadas bajo 4,5 (defensa anotada) + guardia del subrayado |
| 5 · Árbol APG del segundo carrusel | **APTO** |
| 6 · SEO | **APTO** (sin aggregateRating; nofollow NO necesario; leyenda desactiva los ejemplos) |

**APTO CON AVISOS**: 0 bloqueantes AA. Los dos 🟡 (borde del cristal sobre fondos oscuros; decisión
de teclado no compartida entre carruseles) tienen corrección de una línea cada uno y conviene
cerrarlos — junto a la verificación EN VIVO que @s23/@s24 ya declaran — antes de publicar.
