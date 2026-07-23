# Auditoría A11y/SEO — Hero «caligrafía lenta» (≈90 s) + mecanismo SC 2.2.2 sin cromo

> Auditor: `a11y_seo_auditor` (solo lectura). Rama `feat/hero-caligrafia-lenta`, 2026-07-23.
> Delta auditado: enmienda de `features/hero.feature` (@s4 reescrito + @s10–@s14), `src/components/Hero.tsx`,
> `src/components/hero-logica.ts`, `src/components/hero.module.scss` y sus tests.
> Vitest dirigido: **3 ficheros, 91 tests, todos verdes** (hero.test.tsx, hero-estilos.test.ts, hero-logica.test.ts).
>
> **VEREDICTO GLOBAL: APTO CON AVISOS** — 0 bloqueantes 🔴, 3 importantes 🟡, 3 menores 🔵.

---

## Eje 1 — SC 2.2.2 Pause, Stop, Hide (A, No-Interferencia): el mecanismo sin cromo

**VEREDICTO DEL EJE: APTO CON AVISOS — «cumplimiento defendible», ni estricto ni incumplimiento.**

### 1.1 ¿Aplica el SC? Sí, sin escapatoria

La caligrafía cumple las TRES condiciones del texto normativo: (1) **arranca sola** (animación CSS
al pintar, `hero.module.scss:86` y `:97-100`), (2) **dura más de cinco segundos** (≈90,8 s — 18×
el umbral), (3) **convive en paralelo con otro contenido** (subtítulo, CTAs y el resto de la home,
`src/pages/home.tsx:88-101`). No hay excepción de «esencial» que invocar: es ceremonia de marca,
no actividad. El contrato hace bien en declararlo **normativo y obligatorio** (feature :36-41) y en
prohibir citarlo como opcional. Además 2.2.2 es uno de los CUATRO criterios de
**No-Interferencia** (Conformance Requirement 5): si falla, contamina la conformidad de la página
ENTERA, no solo del hero. Las apuestas son máximas — por eso este análisis es el más duro.

### 1.2 ¿Qué es el mecanismo y qué hace?

Un `<button type="button">` nativo, transparente, HERMANO del `<h1>`, superpuesto EXACTO al área
del rótulo (`Hero.tsx:186-193`; `.control` con `position:absolute; inset:0` dentro de la `.escena`
relativa, `hero.module.scss:194-201`). Activarlo pone `data-firma='cliente'` →
`animation: none` sobre `.trazo/.aplicador/.heroStudio` (`hero.module.scss:180-187`), y como la
BASE del SCSS **ya es el estado final visible** (I-4), la firma se completa AL INSTANTE: tinta
entera, aplicador retirado, «STUDIO» visible. Es un **stop** genuino (una de las tres vías válidas
del SC: pause/stop/hide). El Understanding no exige que «stop» sea reanudable (eso es «pause»/G4):
saltar al estado final y que el movimiento no vuelva es una forma válida de stop. La técnica más
cercana es **G186** (un control en la página que detiene el contenido en movimiento), y su
procedimiento de prueba pasa mecánicamente: existe el control (1), se activa (2), el movimiento
cesa y no se reinicia (3).

### 1.3 Los tres canales, uno a uno

- **Teclado (SC 2.1.1 del propio mecanismo)** ✅ — `<button>` nativo: focusable por Tab, Enter y
  Espacio de serie, sin listeners a mano. Aseverado por DOM con `userEvent` real
  (`hero.test.tsx:586-608`). Foco visible por el anillo global (eje 2).
- **Lector de pantalla (SC 4.1.2)** ✅ — rol `button` + nombre accesible «Completar la firma»
  (`aria-label`, `Hero.tsx:74,190`). El usuario ciego encuentra un botón nombrado y comprensible
  justo tras el `<h1>` en el orden de lectura. Nota: para este usuario la animación NI SIQUIERA
  interfiere (el SVG es `aria-hidden`, no mueve foco ni anuncia nada) — el botón es para él un
  extra inocuo, no una necesidad.
- **Vidente de ratón** ⚠️ — la ÚNICA pista es `cursor: pointer` sobre el rótulo
  (`hero.module.scss:200`). Aquí está el punto débil, analizado en §1.4.
- **Vidente de teclado SIN lector** ⚠️ — al tabular ve el anillo alrededor del área de la firma…
  pero NINGÚN texto que diga qué hace Enter. El nombre viaja solo en `aria-label`, que este
  usuario no puede percibir. Percibe UBICACIÓN, no PROPÓSITO. (No incumple 4.1.2 — el nombre
  programático existe — pero es el mismo déficit de descubribilidad que el ratón, en otra tecla.)

### 1.4 El dictamen honesto sobre la descubribilidad: ¿estricto, defendible o incumplimiento?

**Defendible.** Razonamiento por las dos caras:

*Por qué NO es incumplimiento:*
1. El texto normativo dice «there is a mechanism for the user to pause, stop, or hide it» — y el
   mecanismo EXISTE, en la propia página, operable por todo input y conforme en sí mismo (la
   definición de «mechanism» exige que cumpla los SC del nivel reclamado: 2.1.1 ✅, 4.1.2 ✅,
   2.4.7 ✅; 1.4.11 no exige que un control TENGA indicador visual, solo que el que tenga
   contraste — un control sin indicador no es medible contra 1.4.11).
2. Ningún SC de nivel A/AA de WCAG 2.1 (ni 2.2) exige que los controles sean visibles sin
   hover/foco. La evidencia más fuerte: el borrador de WCAG 2.2 tuvo un SC «Visible Controls»
   exactamente para esto y fue **retirado antes de publicarse**. Lo que el W3C consideró y
   descartó como requisito no puede reclamarse como requisito normativo.
3. Precedente aceptado: los skip links invisibles hasta recibir foco (G1) — un mecanismo A
   (2.4.1) puede ser invisible en reposo.

*Por qué NO es cumplimiento estricto:*
1. NINGUNA técnica suficiente publicada (G4, G186, G187, SCR22…) documenta un control invisible:
   todos los ejemplos de G186 son controles visibles y su lógica presupone que el usuario puede
   ENCONTRARLO. Aquí no hay técnica publicada que ampare la forma — se cumple el criterio, no la
   técnica; eso obliga a defenderlo como «otra técnica suficiente», que es carga argumental propia.
2. El precedente del skip link se vuelve VISIBLE Y LEGIBLE al recibir foco; aquí el foco revela un
   anillo mudo (§1.3). La analogía cubre al ratón a medias y al teclado vidente casi nada.
3. La población que 2.2.2 protege (TDAH, discapacidad cognitiva, sensibilidad vestibular) es la
   MENOS equipada para descubrir un control cuya única pista es un cambio de cursor al pasar por
   encima. Un auditor externo estricto (p. ej. bajo EN 301 549) podría levantar la ceja
   exactamente aquí, y con No-Interferencia en juego lo discutiría.
4. Mitigantes reales que inclinan a «defendible» y no a «incumplimiento»: el objetivo es GRANDE
   (todo el rótulo, el elemento más prominente de la página — la zona sobre la que un ratón pasa
   con altísima probabilidad), el botón es primer tabulable tras la nav, y la conciliación con el
   cliente (veto explícito al cromo) está documentada en contrato y brief (feature :36-41, brief
   §1.2) — la decisión es del cliente, comunicada, no una omisión del equipo. 🟡 **AVISO A-1**.

### 1.5 Ciclo de vida del mecanismo: correcto

- **Desaparece al acabar la ceremonia** ✅ — `setTimeout(milisegundosDeCeremonia())` = 90 800 ms
  (`Hero.tsx:106-108`, `hero-logica.ts:61-63`), espejado contra los BYTES del SCSS
  (`hero-logica.test.ts:29-62`, `hero-estilos.test.ts:393-400`). Ya no hay nada que parar → ya no
  hay control: correcto, y evita un tab-stop fantasma y una superficie que tape el rótulo
  terminado (@s12, `hero.test.tsx:626-658`). Detalle fino A FAVOR: el reloj JS arranca en el
  efecto (post-hidratación), o sea SIEMPRE ≥ que el reloj CSS (que arranca al pintar) → el botón
  jamás se desmonta ANTES de que la animación termine de verdad. La dirección segura.
- **No se monta bajo reduced-motion** ✅ — `debeMontarseElControl(true|null, …) = false`
  (`hero-logica.ts:49-54`): sin animación no hay nada que completar, y un botón allí sería una
  superficie mentirosa sobre un rótulo estático (@s13). Tabla entera aseverada por valor.
- **No viaja en el HTML horneado** ✅ — estado inicial `null` hasta leer `matchMedia`
  (`Hero.tsx:80`): un botón prerenderizado sin JS sería un control MUERTO — peor que ninguno.
- **No roba clics** ✅ — `inset: 0` ceñido a la `.escena` inline-block que abraza el rótulo
  (@s14); nada interactivo debajo.

### 1.6 Avisos del eje

- 🟡 **A-1 (descubribilidad)** — §1.4. Cumplimiento defendible, no estricto. Queda a la vista del
  lead/cliente; cualquier mejora (p. ej. revelar un rótulo textual SOLO en `:focus-visible`, que
  no es cromo en reposo) rompería el veto de Pablo, así que NO se prescribe — se deja constancia.
- 🟡 **A-3 (ventana sin mecanismo)** — el mecanismo requiere hidratación; la animación es CSS puro
  y arranca ANTES. (a) Hasta que el bundle hidrata (segundos en red lenta) no hay control — el SC
  no exige que exista desde t=0 y quedan ~85+ s de mecanismo: defendible. (b) Si el JS FALLA del
  todo (error, bloqueo), hay 90 s de movimiento sin mecanismo alguno. Para la conformidad WCAG el
  baseline incluye JS («relied upon») → NO bloqueante; pero este repo presume de corrección sin
  JS (@s7) y aquí esa virtud tiene un agujero conocido. Constancia, sin corrección exigible.
- 🔵 **A-5 (cambio de preferencia en caliente)** — `matchMedia` se lee UNA vez, sin listener
  `change` (`Hero.tsx:91`). Si el usuario activa reduce A MITAD de ceremonia, el CSS para en seco
  (el @media reacciona vivo) pero el botón sigue montado hasta los 90,8 s sobre un rótulo ya
  estático, con un `cursor:pointer` que ya no promete nada. Y al revés (reduce→no-preference), la
  animación re-arranca sin que el control se monte. Casos límite raros; menor.

---

## Eje 2 — SC 2.4.7 Focus Visible (AA): el anillo sobre el botón transparente

**VEREDICTO DEL EJE: APTO.**

- El anillo lo pinta el `:focus-visible` GLOBAL: `outline: 3px solid var(--border-interactive)`
  + `outline-offset: 2px` (`src/styles/_base.scss:18-22`). La hoja del hero NO declara NINGÚN
  `outline` (aseverado por bytes, `hero-estilos.test.ts:423-425`) y no hay `outline: none` que
  alcance al botón en el resto del repo (el de `reserva.module.scss:144` está scoped a su módulo).
- **¿Visible de verdad contra el fondo del hero?** El fondo es
  `radial-gradient(--accent-soft #F7DDE8 → --bg #FDF4F7 al 62%)` (`_demo.scss:107`); el rótulo
  cae en la zona alta → peor caso `--accent-soft`. Calculado: `#AB5F79` da **≈3,55:1 sobre
  #F7DDE8** (coincide con el 3,54 documentado en `_tokens.scss:48-50`) y **≈4,19:1 sobre
  #FDF4F7**. Un anillo de 3 px a ≥3,5:1 con offset es visible sin discusión. (Y como _base.scss
  ya deja escrito: 2.4.7 AA exige VISIBLE y nada más — el 3:1/2px es 2.4.13, AAA; aquí se supera
  incluso ese listón no exigible.)
- Aviso cruzado (ya contado como A-1, no se duplica): el anillo enseña DÓNDE está el foco, no QUÉ
  hace el control — eso es descubribilidad (eje 1), no 2.4.7.

---

## Eje 3 — SC 2.4.3 Focus Order: dónde cae el botón

**VEREDICTO DEL EJE: APTO CON AVISO.**

- Orden DOM real de la home (`src/pages/home.tsx:81-101`): cabecera/nav → `.demo-hero` → Hero
  (eyebrow `<p>` no focusable, `<svg aria-hidden focusable="false">`, `<h1>`, **botón**) →
  subtítulo → CTAs «Reservar cita»/«Ver servicios». El control es el PRIMER tabulable tras la nav
  y cae ANTES de los CTAs del hero: coincide con el orden visual (la firma está encima) y con la
  lógica (primero decides sobre la animación, luego navegas). Orden significativo ✅.
- ¿Molesta 90 s después? No: desmontado, cero tab-stop residual (@s12) ✅.
- 🟡 **A-2 (pérdida de foco al desmontar)** — si el foco ESTÁ en el botón cuando este se desmonta
  (por Enter/Espacio del propio usuario, o porque el reloj llega a 90,8 s mientras lo tenía
  enfocado), el foco cae a `<body>` y el siguiente Tab rearranca desde el principio del
  documento. No es un fallo A/AA nítido (el botón está casi al principio, la pérdida es de un
  paso), pero es el clásico hallazgo de gestión de foco que un auditor anota. Corrección de una
  línea si algún día se quiere: mover el foco a un destino razonable (p. ej. el primer CTA) al
  completar. NO se exige; constancia.

---

## Eje 4 — prefers-reduced-motion: rótulo completo estático, sin botón

**VEREDICTO DEL EJE: APTO.**

- **SCSS** ✅ — `@media (prefers-reduced-motion: reduce)` con `animation: none` sobre `.trazo`,
  `.aplicador` y `.heroStudio` + `display: none` del aplicador (`hero.module.scss:206-216`).
  Como la BASE es el estado final (dashoffset 0, opacity 1), el resultado es el rótulo COMPLETO,
  legible, sin movimiento residual, sin depender de JS. Aseverado por bytes
  (`hero-estilos.test.ts:157-175,580-593`).
- **JS** ✅ — guardado `typeof window.matchMedia !== 'function'` antes de leer (`Hero.tsx:87-91`,
  precedente jsdom 25), lectura DENTRO del efecto, nunca en render; el estado `null` inicial
  garantiza que sin lectura no se monta nada (dirección de fallo segura). Bajo reduce el timeout
  NI SE ARMA (`Hero.tsx:98-100`; aseverado en @s13 incluso a los 90,8 s, `hero.test.tsx:664-677`).
- Aviso 🔵 A-5 (sin listener de `change`) ya registrado en el eje 1.

---

## Eje 5 — SC 2.3.1 Three Flashes (A, No-Interferencia): N/A, y por qué

**VEREDICTO DEL EJE: N/A DECLARADO.**

No existe NINGÚN destello: la revelación es un frente de máscara CONTINUO a velocidad constante
(`linear`, un único subtrazo), sin alternancia de luminancia; los únicos cambios de opacidad son
fundidos suaves únicos de 0,3/0,5/0,6 s (`aparecer`/`retirarse`/`revelarStudio`), no repetitivos.
Nada puede acercarse a 3 destellos/segundo ni a un par de luminancias en oposición. El otro SC de
No-Interferencia queda limpio por naturaleza del efecto.

---

## Eje 6 — El nombre accesible del h1 y la estructura protegida

**VEREDICTO DEL EJE: APTO.**

El botón vive FUERA del `<h1>`, como hermano dentro de `.escena` (`Hero.tsx:173-193`). Con el
control MONTADO se asevera (`hero.test.tsx:522-539`): UN solo `<h1>`, exactamente dos `<span>`
hijos, el text node de espacio REAL entre ellos, nombre accesible **«Nails Lash Studio»** (17)
intacto, y `h1.querySelector('button') === null`. El SVG sigue `aria-hidden` (sin «Nails Lash»
duplicado, @s6). Orden de lectura para lector de pantalla: heading 1 «Nails Lash Studio» →
botón «Completar la firma» — coherente y sin ruido. ARIA mínimo y justificado: `aria-label` en un
botón nativo cuyo diseño veta el texto visible es exactamente el caso en que ARIA procede.

---

## Eje 7 — SEO / LCP: la máscara de 90 s

**VEREDICTO DEL EJE: APTO (razonamiento estático; re-medición EN VIVO pendiente del lead, como fija el contrato).**

- **Indexabilidad** ✅ — la máscara es 100 % visual: «Nails Lash» y «Studio» viajan en los BYTES
  del prerender por partida doble (el `<text>` del SVG y el `<h1>` con la técnica `clip`/1px de
  la WAI — ni `display:none` ni `visibility:hidden`, `hero.module.scss:137-147`). Google no
  ejecuta la animación: indexa el DOM, donde el texto está SIEMPRE. Un solo `<h1>`, sin headings
  extra, title/meta/canonical/JSON-LD de la home intactos (fuera del delta).
- **LCP, razonamiento estático** ✅ con matices:
  1. El `<text>` SVG **no es candidato a LCP** en Chromium (solo `<img>`, `<svg:image>`, posters,
     fondos y bloques de texto HTML lo son) → el titular enmascarado NO registra entrada ni a 4,5 s
     ni a 90 s: el delta NO CAMBIA el elemento LCP respecto al régimen anterior.
  2. El `<image>` del aplicador arranca a `opacity: 0` (excluido) y es minúsculo.
  3. «STUDIO» (texto HTML real) se pinta a los 90,8 s, pero es una palabra a 14-24 px: área muy
     inferior al `<p>` del subtítulo, y cualquier input/scroll previo congela el LCP antes.
  4. Precedente F-07: el LCP era un `<p>` (el subtítulo, visible desde el primer paint sin
     animación, `home.tsx:90-93`). El razonamiento estático dice que SIGUE siéndolo. La
     re-medición EN VIVO la hace el lead (contrato, feature :42-43) — correcto reparto.
  5. Cero CLS del delta: la máscara no altera layout (caja del SVG fija desde t=0), los fundidos
     son de opacidad y el botón es absoluto.
- 🔵 **A-6 (perf, no WCAG/SEO estricto)** — 90 s de animación de `stroke-dashoffset` +
  `offset-distance` no van al compositor: repaint por frame durante minuto y medio en la parte
  alta de la página. No mueve LCP (post-paint) pero puede rascar INP/batería en móvil modesto.
  El muestreo en vivo del lead (brief §4) es el sitio donde vigilarlo.
- 🔵 **A-7 (preexistente, fuera del delta)** — el eyebrow `<p className={estilos.eyebrow} />` viaja
  VACÍO al HTML (`Hero.tsx:119`); un `<p>` vacío es ruido semántico inocuo hasta que F-09 lo
  pueble. Solo constancia: no lo introdujo esta enmienda.

---

## Resumen de hallazgos

| # | Impacto | Eje | Hallazgo | Referencia |
|---|---------|-----|----------|------------|
| A-1 | 🟡 | 1 | Descubribilidad del mecanismo para vidente (solo `cursor:pointer`; foco = anillo mudo). **Cumplimiento defendible, no estricto** — veto del cliente documentado; sin técnica publicada que lo ampare, sin SC A/AA que lo condene | `hero.module.scss:200`, `Hero.tsx:186-193`, feature :36-41 |
| A-2 | 🟡 | 3 | Pérdida de foco a `<body>` cuando el botón se desmonta estando enfocado (Enter o fin de reloj) | `Hero.tsx:191,106-108` |
| A-3 | 🟡 | 1 | Sin JS/antes de hidratar la animación CSS corre sin mecanismo (baseline WCAG con JS lo salva; riesgo residual real de 90 s) | `Hero.tsx:80-92`, `hero.test.tsx:552-556` |
| A-5 | 🔵 | 1/4 | `matchMedia` sin listener de `change`: toggles de preferencia en caliente dejan botón huérfano o animación sin control | `Hero.tsx:84-92` |
| A-6 | 🔵 | 7 | 90 s de repaint no compositado (dashoffset/offset-distance): vigilar INP/batería en la verificación en vivo | `hero.module.scss:86,97-100` |
| A-7 | 🔵 | 7 | Eyebrow `<p>` vacío en el HTML (preexistente, fuera del delta) | `Hero.tsx:119` |

**0 bloqueantes.** Los tres 🟡 son constancia y riesgo documentado, no correcciones exigibles: A-1
está conciliado con el cliente por contrato; A-2 y A-3 son mejoras de una línea/decisión de
arquitectura que el lead puede encolar o descartar con conocimiento de causa.

**VEREDICTO: APTO CON AVISOS.**
