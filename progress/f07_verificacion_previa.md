# F-07 — Verificación previa al contrato (lead, 2026-07-18)

> **Qué es esto.** Las 8 afirmaciones que iban a sostener el contrato de `hero_marca`, verificadas
> **contra fuente primaria antes de escribir una línea de spec**. Lección de F-03..F-06 por delante.
>
> **Método:** workflow adversarial (verificar + refutar) + 3 agentes de medición con **build SSG
> real y motor Chrome/CDP** (los que el schema tumbó en el workflow). ~1,1 M tokens. Diario:
> `.claude/…/subagents/workflows/wf_338f9d98-0f1/journal.jsonl` + `.experimentos-tmp/veredictos-f07/`.
>
> **Resultado: 0 refutadas de raíz, 6 MATIZADAS, 1 CONFIRMADA por vía adversarial (A1), 1 con un
> punto NO_VERIFICABLE clave (A2).** El patrón de siempre: *la decisión de fondo es correcta; el
> «cómo» del troceado tiene errores y confusiones.* Y esta feature estrena una **fase de
> verificación EN VIVO con Chrome** (el usuario aportó la extensión), porque el LCP y el clip-path
> **no son verificables en fuente primaria de texto**.

---

## 0. Las bombas de F-07

| # | Afirmación del troceado | Veredicto | Qué pasa |
| --- | --- | --- | --- |
| acc.6 | *«El hook de IntersectionObserver es SSR-safe…»* | **NO APLICA (A7)** | El hero es **above-the-fold**; el observer es el patrón B (scroll-reveal de F-08+). Es **herencia**. → **C-1** |
| acc.5 | *«El elemento LCP … es legible en ≤1,2s»* + puerta_legal *«LCP ≤2,5s»* | **MEZCLA DOS COSAS (A2)** | ≤1,2s es la **duración de animación** que el audit recomienda; ≤2,5s es el **LCP** (norma). No es conflicto, pero **el LCP no es puerta unitaria** → [NV]/en-vivo. → **C-2** |
| acc.1 | *«el estado base es el estado final visible»* | **CIERTO pero INSUFICIENTE (A3)** | Medido: el estado base visible **protege el reposo** (reduced-motion/sin-JS) pero **NO acorta el reveal**. Si el hero es el LCP, `both`+delay lo retrasa a **~5,3s**. → **C-3** (decisión de producto) |
| acc.2 | *«reduced-motion … obligatorio»* | **CRITERIO DE PROYECTO, no WCAG A/AA (A4)** | Ningún SC de nivel A/AA obliga a respetar `prefers-reduced-motion` para animación de **carga**. → **C-4** |

---

## 1. A1 — SC 2.2.2 · **el `bob infinite` lo incumple LIMPIAMENTE (nivel A)**

> El verificador devolvió **basura de relleno** (`«test»`/`«a»`/`«b»`) — el mismo patrón que F-05
> cazó. Su **refutador lo destapó** (*«verificación vacía/fabricada»*) y **rehízo la verificación
> bien**. La conclusión y la cita de abajo son del refutador, contra fuente primaria.

**SC 2.2.2 Pause, Stop, Hide, nivel A** [V: w3.org/TR/WCAG22/], bullet «Moving, blinking, scrolling»:

> *«For any moving, blinking or scrolling information that (1) starts automatically, (2) lasts more
> than five seconds, and (3) is presented in parallel with other content, there is a mechanism for
> the user to pause, stop, or hide it unless the movement … is part of an activity where it is
> essential.»*

El `bob 2.4s ease-in-out infinite` del indicador «desliza»: (1) arranca automático en la carga,
(2) **`infinite` → dura > 5s**, (3) en paralelo con el resto del hero; no es esencial y no tiene
mecanismo de pausa. **Cumple las tres → incumplimiento limpio de nivel A [V].** Solución (técnica
suficiente): **quitar `infinite`** (`animation-iteration-count` finito). El `<button>↺ Repetir` del
prototipo es control de **repetición**, NO de parada.

🔴 **El `paintReveal` (4,8s < 5s) NO dispara 2.2.2** [V]. Solo el `bob` infinito. Y **corregido de
higiene**: `docs/research/audit-a11y.md:386` dice *«para cumplir SC 2.2.2 en AA»* — **2.2.2 es
nivel A**, no AA (error de nivel en ese doc, no en el troceado).

---

## 2. A2 — El LCP · **testeable a medias, y un punto NO_VERIFICABLE que decide el diseño**

**CONFIRMADO [V: web.dev/articles/lcp, doc oficial de Google para Core Web Vitals]:** el umbral
bueno es **LCP ≤ 2,5s p75**; los elementos con `opacity:0` se **excluyen** del LCP; un fondo con
degradado (no `url()`) **no es elegible**.

### 🔴 El `[DESCONOCIDO]` del audit, resuelto: es NO_VERIFICABLE en fuente primaria

¿Un texto recortado por `clip-path:inset(0 100% 0 0)` (invisible pero `opacity:1`) se excluye del
LCP **como el `opacity:0`**? **web.dev solo documenta `opacity:0`.** Y la spec de **Element Timing /
Largest Contentful Paint del W3C mide el texto por su *border box ∩ viewport*** — que **NO cambia
con `clip-path`**. Es decir: **la LETRA de la spec más bien REFUTA la equivalencia** (el clip-path
no reduciría el área que el LCP cuenta). Chromium *podría* anular el área vía el clip del property
tree, pero **depende de si la animación está compositada y del timing → solo medible en Chrome
real**. → **NO_VERIFICABLE en fuente primaria; se mide EN VIVO con Chrome.**

### 🔴 El LCP NO es una puerta de build unitaria

Vitest+jsdom no tiene layout ni paint. El audit (§3.6) ya lo dice: *«un build desplegado +
Lighthouse + CrUX»*. **Lo testeable con un test unitario (leyendo el CSS/HTML):** que el estado base
del titular **no tenga `opacity:0` ni `clip-path` oculto** (CSS estático, como F-06 hizo con el
scroll-padding), y que la **duración de la animación** esté acotada. **Lo [NV]/en-vivo:** el número
LCP real. → **C-2.**

### La discrepancia ≤1,2s vs ≤2,5s — resuelta

`docs/research/audit-perf.md` §3.6: el **≤1,2s es la DURACIÓN de animación** que el audit
recomienda (*«La animación debe recortarse a ≤1,2s»*), NO un umbral de LCP. El **≤2,5s es el LCP**.
**No es conflicto**: son dos cosas distintas, y el contrato debe separarlas.

---

## 3. A3 — El estado base bajo SSG · **MEDIDO con build real + Chrome/CDP, y la trampa del LCP**

**Medido** (build vite-react-ssg 0.9.0 real + motor Chrome vía CDP; reproducible en
`.experimentos-tmp/f07-a3/`):

- **El prototipo pinta el hero INVISIBLE al cargar, incluso SIN JS.** Causa exacta:
  `animation-fill-mode: both` incluye `backwards`, que **durante el `animation-delay` aplica el
  keyframe inicial (oculto)** [V: CSS Animations L1, `backwards`: *«During the period defined by
  animation-delay, the animation will apply the property values defined in the keyframe that will
  start the first iteration»*]. Medido: «Studio» `opacity:0` durante **4,4s**; «Nails Lash»
  `clip-path` recortado durante el delay. Y **con JS deshabilitado** el HTML estático ya pinta
  invisible (`getAnimations()==1`: los `@keyframes` corren sin JS).
- **El prototipo NO tiene `@media (prefers-reduced-motion: reduce)`** → quien pide menos movimiento
  se traga los 4,8s + 4,4s.
- **La forma correcta funciona, MEDIDO**: base visible explícita + oculto solo en el `0%` +
  `@media reduce{ animation:none }`. Bajo `reduce`: `getAnimations()==0` y el elemento computa su
  base visible (`clip-path: inset(0px)`, `opacity: 1`) [V: `animation-name: none` → *«there will be
  no animation … no effect … does not affect the computed value»*].

### 🔴 LA TRAMPA MAYOR, MEDIDA: el estado base visible NO arregla el LCP

El patrón A garantiza el **reposo** seguro (reduced-motion / sin-JS / sin-animación). **NO acorta el
reveal para quien acepta movimiento**: `both`+delay sigue mostrando el `0%` oculto durante el delay.
**Si el hero es el LCP, eso lo retrasa a ~5,3s.** → **El estado base visible es necesario pero no
suficiente para un LCP bueno; hay que ACORTAR la animación.** → **C-3** (decisión de producto).

### La forma EXACTA del CSS del hero (en un SCSS module, NO inline)

```scss
.heroMarca {                         // el <h1>/marca (el LCP)
  clip-path: inset(0 0 0 0);         // BASE = estado final VISIBLE
  animation: paintReveal <DUR> cubic-bezier(.5,0,.25,1) <DELAY> both;
}
@keyframes paintReveal { 0% { clip-path: inset(0 100% 0 0); } 100% { clip-path: inset(0 0 0 0); } }

.heroStudio { opacity: 1; animation: fadeUp <DUR> <DELAY> both; }
@keyframes fadeUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) { .heroMarca, .heroStudio { animation: none; } }  // OBLIGATORIO (falta en el proto)
```

**Sin IntersectionObserver** (A7): el hero es above-the-fold; el observer dejaría el contenido
invisible sin JS. `<DUR>`/`<DELAY>` los fija **C-3**.

---

## 4. A4 — `prefers-reduced-motion` · **es CRITERIO DE PROYECTO, no obligación WCAG A/AA**

Ningún SC de nivel A/AA obliga a respetar `prefers-reduced-motion` para la animación de **carga**
del hero [V]:
- **SC 2.2.2 (A)** solo aplica a movimiento que *«lasts more than five seconds»* → el `paintReveal`
  (4,8s) **no lo dispara**; el único gancho A es el `bob` infinito (§1), y 2.2.2 pide *«un mecanismo
  para pausar/parar/ocultar»*, **NO nombra `prefers-reduced-motion`** (es una forma de cumplirlo).
- **SC 2.3.3 Animation from Interactions es AAA** y solo cubre animación *«triggered by
  interaction»* (scroll/click), **NO la de carga** [V]. C39 (usar `prefers-reduced-motion`) es
  técnica **suficiente** para 2.3.3, y *«Techniques are not required to meet WCAG»*.
- **`prefers-reduced-motion` NO desactiva animaciones por sí solo** [V: Media Queries L5] — es solo
  un detector de la preferencia; **el AUTOR debe escribir la `@media`**. El prototipo no la tiene.

> **Redacción para el contrato (C-4):** *«Por CRITERIO DE PROYECTO, bajo `@media
> (prefers-reduced-motion: reduce)` el hero se presenta en su estado final visible y legible sin
> movimiento residual.»* **PROHIBIDO** *«WCAG obliga»* o *«obligatorio»* a secas.

---

## 5. A5 — El h1 del hero · **MEDIDO con `dom-accessibility-api`**

**Un h1 con dos `<span>`** (reestilizando el `<h1>{NOMBRE}</h1>` de F-04; **no** añadir otro: la
puerta de cascarón exige exactamente uno). El `<div>Studio</div>` del prototipo es **INVÁLIDO dentro
de un h1** [V: HTML LS — h1 admite *«Phrasing content»*; `div` es *«Flow content»* sin phrasing] →
**`<span>`**.

🔴 **El nombre accesible es «Nails Lash Studio» SOLO con un text node `{' '}` REAL entre los spans.**
Medido con `dom-accessibility-api@0.6.3`: spans pegados o con whitespace-JSX → **«Nails LashStudio»**
(sin espacio); un espacio **dentro** de un span se recorta. Y **jsdom miente sobre `display`** (da
`""` no `"inline"`), así que el caso robusto (text node de espacio) es el que mide **17 en ambos
motores**.

**Derivar de `NOMBRE`** (fuente única F-02) por `lastIndexOf(' ')` con guarda (`split(' ')` da **3**
partes, no sirve). Es un split de **presentación** frágil pero suficiente para el dato real; la
alternativa limpia (estructurar `{marca, tipo}` en `site.ts`) tocaría F-02 (fuera de alcance).

**El eyebrow** («Uñas · Pestañas · Cejas»): **no tiene fuente de datos hoy** — las categorías son
**F-09 (pending)**; `site.ts` no las tiene. Va como **`<p>`, NUNCA un heading**. → **aplazar a F-09**
(preferido) **o** reutilizar `RECLAMO` (`seo.ts:17` = *«Uñas, pestañas y cejas en Las Rozas de
Madrid»*). **NUNCA hardcodear «Facial»** (no existe). → **C-7.**

Y **el hero como `h1+p` SIN `<section aria-labelledby>` NO activa la puerta de anclas de F-06**
[V, medido con `seccionesNavegables`]: ni con un `id` suelto. **No envolver en `<section>`.**

---

## 6. A6 — La «animación de pincel» · **es el `paintReveal` (CSS puro), NO el `brush.png`**

🔴 **Desconflación clave** (que el propio brief del lead confundía): la *«animación de pincel»* del
título de F-07 es el **`paintReveal`** (clip-path que revela el texto de izquierda a derecha como
una pincelada) — **efecto SOLO-CSS, cero asset**. El **`brush.png`** es un adorno físico separado
(`alt=""`, `pointer-events:none`) movido por **`brushSweep`**, que barre por encima.

- **El corazón de F-07 (el `paintReveal`) se construye sin ningún asset ni dependencia.**
- **El `brush.png` NO está en el acceptance de F-07 y se APLAZA fuera de F-07.** No es esencial;
  meterlo hoy solo añade un binario a `dist/` que alimenta la **deuda de binarios declarada de F-01**
  (su puerta lee todos los ficheros utf8 sin filtro de extensión), sin ganar nada que F-07 exija.
  (F-17 está blocked por **falta de fotos reales**, no porque no pueda renderizar un adorno; pero el
  brush es candidato a F-17 o a descartar.) **Si algún día se quiere: SVG inline, nunca PNG** (no
  mete origen externo ni binario).

---

## 7. A7 — El observer y las fuentes · **el acceptance 6 no aplica; el preload puede dañar el LCP**

**(a) IntersectionObserver — NO aplica al hero.** El patrón de memoria distingue el patrón A
(`@keyframes` autónomos = el hero) del patrón B (observer = scroll-reveal de secciones que entran en
viewport, F-08+). El hero es above-the-fold: **no hay nada que «entre en vista»**. Medido:
`grep -rin IntersectionObserver src/` = **0**. El acceptance 6 es **herencia del patrón B** y meter
un observer en el hero sería **producción sin motivo (Ley 1)**. → **C-1: retirar el acceptance 6.**

**(b) `font-display: swap` DESBLOQUEA el LCP, no lo perjudica** [V: web.dev/articles/optimize-lcp:
*«If you set a font-display value of anything other than auto or block, then text will always be
visible during load, and LCP won't be blocked on an additional network request»*]. El titular se
pinta **de inmediato en la fuente de fallback**; el LCP se cronometra ahí.

🔴 **Pero el `dist` preloadea 12 fuentes** (Manrope 400/500/600/700 + Gilda 400 + Great Vibes 400,
cada una **woff2 Y woff**), todas con `type="font/woff2"` **incluso los 6 `.woff`** (el bug de
`renderPreloadLink` de vite-react-ssg que A4 de F-06 documentó). **Preload de todo = preload de
nada**: esa contienda por el ancho de banda crítico **puede dañar el propio LCP del titular**. Es
territorio **F-05/F-20**, pero **impacta el presupuesto de LCP de F-07** → **C-8 (deuda declarada).**

**(c) El `clamp(50px,11.5vw,142px)`**: SC 1.4.4 (resize 200%) y SC 1.4.10 (reflow 320px) son AA sin
gemelo AAA aquí; el zoom escala el clamp (1.4.4 OK); a 320px el clamp hace floor en 50px → **medir
en vivo que «Nails Lash» a 50px en Great Vibes no desborda** (1.4.10). La **legibilidad** del script
font es **criterio de proyecto**, no puerta WCAG (1.4.8 es AAA).

---

## 8. A8 — Choque con las 5 puertas done · **medido**

- **CASCARÓN (F-04):** `cuantosH1` cuenta etiquetas `<h1>` → spans dentro siguen siendo **1** h1
  [medido]. El `<Head>` (title/description/canónica/JSON-LD) intacto. 🔴 **Trampa: `cuantosH1` NO
  valida el anidamiento** — un `<div>` dentro del h1 pasa la puerta pero es HTML inválido (§5).
- **CONTRASTE (F-03):** el par `--ink`/`--bg` **YA ESTÁ** en `MATRIZ_DE_USO` (línea 247, *«titular
  sobre el fondo»*, ratio **7,06**). **NO hace falta fila nueva ni subir `MINIMO_DE_PARES`** si el
  titular usa `--ink`. 🔴 **PELIGRO: pintar el titular con `--accent`/`--brush` #C05576 como TEXTO da
  4,05 < 4,5 → puerta ROJA** [medido]. Usar `--ink`. Y **NO añadir rama de «texto grande 3:1»** para
  colar un rosa (reintroduce el mutante inmortal que F-03 evitó a propósito).
- **TERCEROS (F-05):** Great Vibes ya en `PARES_DE_FUENTE_ESPERADOS`. Un preload propio o `<img>`
  local resuelven a host propio → no externos. No toca.
- **ANCLAS (F-06):** el hero `h1+p` sin `<section>` no activa la igualdad de conjuntos (§5). No toca.
- **PLACEHOLDERS (F-01):** el hero no hornea patrón ni binario (el brush se aplaza, §6). No toca.
- **STRYKER/VITEST:** si F-07 crea `src/components/Hero.tsx`, **añadirlo a mano a `mutate` de
  `stryker.config.json`** (lista explícita; `vitest.config.ts` ya lo cubre por glob). Si es CSS puro
  + JSX estático, **casi no da mutantes útiles** (los atributos JSX literales no se mutan); si hay
  lógica (derivación de NOMBRE, guarda del split), esa sí se muta. El estado va en atributos
  consultables, **nunca en className condicional** (lección MenuNavegación, F-06).

---

## 9. Las preguntas que van a la puerta humana

| # | Qué | Por qué no lo decido yo |
| --- | --- | --- |
| **C-1** | El **acceptance 6 (IntersectionObserver) NO aplica** al hero (above-the-fold; es del patrón B de F-08+). **Propuesta: retirarlo.** | Cambia un criterio de aceptación. |
| **C-2** | El acceptance del **LCP mezcla** ≤1,2s (duración animación, testeable) con LCP ≤2,5s (norma). **Propuesta: separarlos** — el CSS estático (base visible + duración) es puerta unitaria; el **LCP real es [NV]/verificación EN VIVO con Chrome**. | Cambia criterios y define qué es puerta vs en-vivo. |
| **C-3** | 🔴 **DECISIÓN DE PRODUCTO:** el estado base visible **no acorta el reveal**; con la animación del prototipo (delay 0,5s + 4,8s) el LCP del titular se retrasa a **~5,3s**. **¿Se ACORTA la animación (a ≤1,2s, como recomienda el audit, para un LCP bueno) o se mantiene el reveal largo de marca?** | Es un trade-off de producto: animación de marca vs rendimiento. |
| **C-5** | El indicador **«desliza» (`bob infinite`)** incumple SC 2.2.2 (A). **Propuesta: si F-07 lo hornea, sin `infinite` (iteración finita); o aplazarlo a F-08** (depende de que haya scroll). | Alcance + decisión de a11y. |
| **C-7** | El **eyebrow** no tiene fuente de datos hoy (categorías = F-09). **Propuesta: aplazar el contenido a F-09** y dejar en F-07 solo la estructura (`<p>`), o reutilizar `RECLAMO`. | Alcance/producto. |

**Decididos por mí y declarados** (medidos o de proyecto): el hero es **1 h1 con dos `<span>` +
`{' '}` text node**, derivado de NOMBRE por `lastIndexOf` con guarda · el titular usa **`--ink`**
(nunca `--accent` como texto) · **no envolver en `<section>`** · la `@media reduced-motion` como
**criterio de proyecto** (no WCAG) · el **`brush.png` se aplaza** (el `paintReveal` es CSS puro) ·
`Hero.tsx` se añade a `mutate` · el **sobre-preload de fuentes** (C-8) queda **deuda declarada** para
F-05/F-20. Y **F-07 estrena verificación EN VIVO con Chrome** (extensión aportada por el humano):
tras el TDD, medir el **LCP real**, si el **clip-path** deja el titular fuera del LCP (NO_VERIFICABLE
en texto), el hero **bajo reduced-motion**, y el reflow a 320px.
