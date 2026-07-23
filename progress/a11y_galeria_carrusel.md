# Auditoría a11y + SEO — Galería «Nuestros trabajos» (carrusel coverflow 3D)

> Auditor: `a11y_seo_auditor` (solo lectura) · Fecha: 2026-07-23 · Rama: `feat/galeria-coverflow-3d`
> Alcance: `src/components/Galeria.tsx`, `src/components/galeria-logica.ts`,
> `src/components/galeria.module.scss` contra `features/galeria_carrusel.feature` (18 escenarios)
> y `progress/galeria_coverflow_diseno.md`. Tokens leídos de `src/styles/_tokens.scss`.
> Evidencia dinámica: `pnpm exec vitest run` sobre los 3 ficheros de test de la galería —
> **125 tests verdes** (galeria.test.tsx + galeria-logica.test.ts + galeria-estilos.test.ts).

## Veredicto global: **APTO CON AVISOS** — 0 bloqueantes (🔴), 1 importante (🟡), 3 menores (🔵)

---

## Eje 1 — SC 2.2.2 Pause, Stop, Hide (A, No-Interferencia): **APTO**

- El botón de rotación EXISTE y es persistente: `Galeria.tsx:161-169`, horneado en SSR (aseverado
  en `galeria.test.tsx:487`), sin ninguna regla de hover/foco que lo oculte en
  `galeria.module.scss:28-50`. No aparece «solo al pasar el ratón»: la clase `.mandos` no toca
  `visibility`/`opacity`/`display`.
- Es el **PRIMER control tabulable** del carrusel (APG «first element in the Tab sequence»):
  primer `<button>` del árbol en `Galeria.tsx:160-169`, aseverado con los 9 tabulables en
  `galeria.test.tsx:476-485`.
- **«Parar» es definitivo**: `debeRotar` (`galeria-logica.ts:122-132`) da precedencia absoluta a
  `pausadoPorElUsuario` — ni salir con el ratón ni nada reanuda (@s8: 12 000 ms sin cambio, verde).
  Esto esquiva exactamente el fallo que castiga el Understanding («stop only so long as a user has
  focus … would not be considered a mechanism»): la pausa NO depende de hover ni de foco.
- Hover: pausa al entrar y reanuda al salir (`Galeria.tsx:156-157`); **foco: pausa y NO reanuda**
  (no hay `onBlur`, deliberado, `Galeria.tsx:89-90`, contrato @s10) — lectura conservadora correcta.
- **«Iniciar» manda sobre todo**: `arranqueExplicito` gana a ratón y foco
  (`galeria-logica.ts:127-129`, cableado en `alternarRotacion`, `Galeria.tsx:131-134`; @s11 verde).
  Un ratón/foco NUEVOS lo cancelan (`Galeria.tsx:137-140`), coherente con el APG.
- Tamaño del control: 2.75rem = 44×44 px (`galeria.module.scss:35-39`) — supera SC 2.5.8.

## Eje 2 — SC 1.4.11 Non-text Contrast (AA): **APTO** (cálculos con los hex reales)

Fondo real de la sección: `.galeria` usa `demo-seccion` SIN `--alt` (`Galeria.tsx:143`), luego el
fondo es el del `body` = `--bg #FDF4F7` (`_base.scss:12-14`, `_tokens.scss:18`).

Luminancias relativas (fórmula WCAG, sRGB linealizado):
`L(#FDF4F7)=0.9230 · L(#FFFFFF)=1.0000 · L(#A23E5F)=0.1195 · L(#AB5F79)=0.1822 · L(#6F525A)=0.1015`
Ratio = (L₁+0.05)/(L₂+0.05).

| Par (elemento → colores) | Cálculo | Ratio | Umbral | ✔ |
|---|---|---|---|---|
| Punto ACTIVO `--accent-dark #A23E5F` vs fondo `#FDF4F7` | (0.9730)/(0.1695) | **5.74:1** | 3:1 | ✔ |
| ESTADO activo vs inactivo: relleno `#A23E5F` vs `#FFFFFF` | (1.05)/(0.1695) | **6.19:1** | 3:1 | ✔ |
| Borde punto/flechas `--border-interactive #AB5F79` vs fondo `#FDF4F7` | (0.9730)/(0.2322) | **4.19:1** | 3:1 | ✔ |
| Borde `#AB5F79` vs relleno del control `#FFFFFF` | (1.05)/(0.2322) | **4.52:1** | 3:1 | ✔ |
| Glifos ← → ▶ ❙❙ `#A23E5F` vs `#FFFFFF` | (1.05)/(0.1695) | **6.19:1** | 3:1 (4.5 si texto) | ✔ |
| Anillo de foco global `#AB5F79` vs `#FDF4F7` (`_base.scss:18-22`) | — | **4.19:1** | 3:1* | ✔ |
| Nota `--muted #6F525A` vs `#FDF4F7` (SC 1.4.3, texto 13 px) | (0.9730)/(0.1515) | **6.42:1** | 4.5:1 | ✔ |

\* El 3:1 del indicador de foco es SC 2.4.13 (AAA), no exigible; se anota porque cumple igualmente.

El estado del punto se distingue por **dos tokens distintos** (`galeria.module.scss:174-187`:
`--surface` → `--accent-dark`), nunca por opacidad del mismo rosa — exactamente lo que @s17 exige y
lo que 1.4.11 («components and states») pedía. El relleno blanco del punto inactivo solo da 1.08:1
contra el fondo, pero su **borde** `#AB5F79` (4.19:1) es quien define el componente: válido.

## Eje 3 — Patrón carousel del APG (variante Grouped): **APTO**

- Contenedor: `role="group"` + `aria-roledescription="carrusel"` + `aria-labelledby` al `<h2>`
  (`Galeria.tsx:151-158`). NO `region`: decisión vigente y justificada (dos puertas del build,
  @s2/@s6); el APG admite group para carruseles no-landmark. El nombre accesible no repite
  «carrusel».
- `aria-live` de la pista: `off` rotando ↔ `polite` cuando manda el usuario
  (`galeria-logica.ts:100-102`, `Galeria.tsx:193`), tabla de verdad completa en @s7 (verde), con
  `aria-atomic="false"`.
- Diapositivas: `role="group"` + `aria-roledescription="diapositiva"` + `aria-label` «n de 6»
  (`Galeria.tsx:203-205`), sin repetir el alt (lo aporta la `<img>`), sin `aria-hidden` en ninguna
  (justificación §7-bis del brief: contenido perceptible al 38 %).
- Botón de rotación **sin `aria-pressed`** en ningún estado (aseverado @s8/@s11) y con etiqueta
  cambiante `Parar/Iniciar la reproducción automática` (`galeria-logica.ts:87-89`) — literal APG.
- Flechas con `aria-controls="galeria-pista"` (`Galeria.tsx:174,183`); puntos en grupo nombrado
  «Elegir la foto que se muestra» con `aria-disabled` en el actual y JAMÁS `disabled` nativo
  (`Galeria.tsx:229-241`), conforme al APG (no sacar del orden de tabulación).

## Eje 4 — SC 2.1.1 Teclado y orden de foco: **APTO** (con el aviso 🟡 de abajo)

- Los 9 controles son `<button type="button">` nativos: rotación, Anterior, Siguiente y 6 puntos —
  todos operables con teclado. Orden de foco = orden del DOM: rotación → Anterior → Siguiente →
  puntos; coherente y aseverado (`galeria.test.tsx:476-485`).
- **Nada enfocable dentro de las tarjetas** (SC 2.4.7 / 2.4.11): los mandos viven fuera del
  escenario con `perspective` y del `overflow:hidden` (`galeria.module.scss:28-33,53-55`), así el
  anillo de foco global (`_base.scss:18-22`) nunca queda recortado ni tapado por la central elevada.
- Clic en tarjeta lateral (`Galeria.tsx:207`, `<div onClick>`) NO es alcanzable por teclado, pero
  tiene **equivalente completo**: las flechas (@s16) y los puntos (@s17) llegan a cualquier foto.
  SC 2.1.1 se satisface por funcionalidad equivalente, tal y como declara @s18. Correcto.
- El arrastre táctil (pointer) tiene el mismo equivalente; su decisión pura (`pasosDelArrastre`,
  `galeria-logica.ts:148-154`) está testeada y el gesto queda declarado para verificación en vivo.

🟡 **AVISO (importante) — SC 2.5.8 Target Size (Minimum), AA de WCAG 2.2**: los puntos miden
0.75rem = **12×12 px** con hueco de 8 px (`galeria.module.scss:166-181`). La prueba del círculo de
24 px falla (centros a 20 px < 24 px: los círculos se solapan), así que el cumplimiento descansa
SOLO en la excepción «equivalente» (las flechas de 44 px alcanzan cualquier foto). Es defendible
pero frágil, y motoramente hostil. Corrección en una línea, sin cambio visual: dar al `<button>`
del punto una caja de ≥24×24 px (p. ej. `padding` + pintar el punto de 12 px con un pseudo-elemento
o `background-clip: content-box`).

## Eje 5 — prefers-reduced-motion (T del APG + P del repo; atribución honesta: no es letra AA): **APTO**

- **Arranca pausado**: `matchMedia('(prefers-reduced-motion: reduce)')` leído en efecto de montaje,
  guardado contra SSR/jsdom (`Galeria.tsx:76-82,95-102`) → `setPausado(true)`. El intervalo del
  primer render se limpia antes del primer tick de 4 000 ms (aseverado @s12: 12 000 ms sin
  movimiento, verde). Sin JS no hay autoplay: el horneado es estático.
- **No se le retira la función**: el botón queda en «Iniciar…», sin `disabled` (@s12).
- **Las transiciones 3D se eliminan**: `@media (prefers-reduced-motion: reduce)` pone
  `transition: none` en `.tarjeta` y `.lienzo` (`galeria.module.scss:244-249`); además el
  `scroll-behavior: smooth` global ya está condicionado a `no-preference` (`_base.scss:19-23`).
  El coverflow queda como composición estática (los `transform` no animan): correcto — MDN señala
  scale/pan de objetos grandes como disparador vestibular y aquí no se reproduce solo.

🔵 Menor: la preferencia se lee UNA vez al montar, sin `addEventListener('change')`. Si el usuario
activa reduce-motion con la página abierta, el autoplay en curso no se pausa hasta recargar.
Corrección: suscribirse al `change` del MediaQueryList en el mismo efecto.

## Eje 6 — Movimiento 3D y legibilidad: **APTO**

- Las tarjetas contienen SOLO imágenes (`Galeria.tsx:215-223`): no hay texto esencial que la
  opacidad (0.72/0.38 escritorio, 0.60/0.18 móvil) o el giro puedan volver ilegible. La centrada va
  siempre a opacidad 1 y giro 0. Los alt siguen íntegros en el árbol de accesibilidad (sin
  `aria-hidden`). Los giros saturan en |52°| < 90°: ninguna tarjeta se ve especular.
- La opacidad va en `.lienzo`, no en `.tarjeta` (grouping property) — sin efectos colaterales 3D.

🔵 Menor: la tarjeta oculta (`[data-distancia='3']`, opacidad 0, `--x:150%`) sigue siendo
**clicable** (el `onClick` de `Galeria.tsx:207` y `z-index` 3 > 0): en pantallas anchas puede
existir una zona invisible junto al borde derecho que captura clics y cambia la foto. No es
incumplimiento WCAG, pero sí una sorpresa de puntero. Corrección: `pointer-events: none` en la
regla `[data-distancia='3']` de `galeria.module.scss:130-139`.

## Eje 7 — SEO técnico: **APTO**

- Raíz `<div>` sin `<section>`, sin `<nav>` falsa y sin `<a href="#">`: los puntos y flechas son
  `<button type="button">` (`Galeria.tsx:143,170-187,229-241`), conforme a las puertas de cascarón
  y anclas (@s2, aseverado).
- Jerarquía: un único `<h2>` «Nuestros trabajos» (`Galeria.tsx:147-149`); ningún `<h1>` nuevo.
- **Sin clones**: el bucle es aritmético (`indiceCircular`/`distanciaCircular`,
  `galeria-logica.ts:20-38`); un solo `FOTOS.map` (`Galeria.tsx:196`) ⇒ 6 `<img>` exactas en el
  HTML horneado (@s1 verde). Cero contenido duplicado para el rastreador.
- Las 6 imágenes conservan `alt` descriptivo del trabajo, `width=800`/`height=600` (sin CLS) y
  `src` local empaquetado (sin origen externo).
- Contenido indexable en SSR: todo el bloque se hornea con `renderToString` (fotos, alt, nota y
  botón incluidos), sin depender de JS.

🔵 Menor (deuda YA declarada en @s1 y brief §11.3, no exigible aquí): `loading="lazy"` en las 6
fotos de un coverflow donde casi todas están en viewport retrasa el pintado y puede producir un
salto al primer avance. Cuando se renegocie el contrato: `eager` (o `fetchpriority`) para las 3
visibles.

---

## Resumen

| Eje | Veredicto |
|---|---|
| 1 · SC 2.2.2 Pause, Stop, Hide | **APTO** |
| 2 · SC 1.4.11 Non-text Contrast | **APTO** (todos los pares ≥ 4.19:1) |
| 3 · Patrón carousel APG | **APTO** |
| 4 · SC 2.1.1 Teclado | **APTO** · 🟡 aviso SC 2.5.8 (puntos de 12 px) |
| 5 · prefers-reduced-motion | **APTO** · 🔵 sin listener de cambio |
| 6 · 3D y legibilidad | **APTO** · 🔵 tarjeta invisible clicable |
| 7 · SEO técnico | **APTO** · 🔵 lazy en viewport (deuda declarada) |

**APTO CON AVISOS**: ningún bloqueante AA. El aviso 🟡 (2.5.8) se sostiene hoy en la excepción de
control equivalente; se recomienda cerrarlo con el área de 24 px antes de publicar.
