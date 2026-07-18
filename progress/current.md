# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **Feature en curso:** `7 — hero_marca` (**`spec_ready`**) — **PARADA EN LA PUERTA HUMANA.**
  Verificación previa, spec y contrato (16 escenarios) hechos y commiteados; **`src/` sin tocar**.
  `6 — header_nav_footer` quedó `done` (resumen en `history.md`).
- **Proyecto:** **6 done · 1 spec_ready · 9 pending · 4 blocked.**

### 🔴 F-07 está esperándote. CINCO preguntas (C-1, C-2, C-3, C-5, C-7).

**Lo hecho (5 commits):** verificación previa (`f07_verificacion_previa.md`, 8 afirmaciones ×
verificar+refutar + 3 agentes con **build SSG real y motor Chrome/CDP**, ~1,1 M tokens) · spec
(`project-spec.md` §Feature 7, 369 líneas) · contrato (`features/hero_marca.feature`, **16
escenarios**, marca `⏸`) · **revisión adversarial del contrato** (5 lentes, 11 agentes → **6
alegados, 5 confirmados: 0 bloqueantes, 4 graves, 1 menor**) · ronda de reparación (5 correcciones).

**El patrón de siempre: la decisión de fondo es correcta; el «cómo» del troceado tenía errores.**
Y esta feature **estrena verificación EN VIVO con Chrome** (la extensión que aportó el humano),
porque el **LCP** y si el **`clip-path` oculta del LCP** son **NO_VERIFICABLE en fuente primaria de
texto**.

**Las 5 preguntas abiertas (`⏸`):**

- **C-1** — el **acceptance 6 (IntersectionObserver) NO aplica** al hero (above-the-fold; es del
  patrón B de F-08+). **Propuesta: retirarlo** (medido: `grep IntersectionObserver src/` = 0).
- **C-2** — el acceptance del **LCP mezcla** ≤1,2s (duración animación, **testeable**) con LCP ≤2,5s
  (norma, **[NV]/en-vivo con Chrome**). **Propuesta: separarlos.**
- **C-3** — 🔴 **DECISIÓN DE PRODUCTO:** el estado base visible **NO acorta el reveal** (medido con
  Chrome/CDP); con la animación del prototipo el LCP del titular se retrasa a **~5,3s**. **¿Se
  ACORTA la animación (a ≤1,2s, para un LCP bueno) o se mantiene el reveal largo de marca?**
- **C-5** — el indicador **«desliza» (`bob infinite`)** incumple SC 2.2.2 (A). **Propuesta: si F-07
  lo hornea, con duración total ≤5s; o aplazarlo a F-08** (depende de que haya scroll).
- **C-7** — el **eyebrow** no tiene fuente de datos hoy (categorías = F-09). **Propuesta: aplazar el
  contenido a F-09** (solo estructura `<p>` en F-07) o reutilizar `RECLAMO`. NUNCA «Facial».

### Hallazgos de F-07 que sobreviven a la feature

- **La «animación de pincel» es el `paintReveal` (CSS puro), NO el `brush.png`** (adorno, se aplaza).
- **El estado base visible protege el REPOSO pero NO acorta el reveal** — es necesario pero no
  suficiente para un LCP bueno (medido con Chrome/CDP).
- **`prefers-reduced-motion` es CRITERIO DE PROYECTO, no WCAG A/AA** (2.2.2 solo el bob >5s; 2.3.3 es
  AAA; el AUTOR debe poner la `@media`).
- **El `clip-path` es NO_VERIFICABLE**: ¿oculta el titular del LCP como el `opacity:0`? La spec de
  Element Timing mide por *border box ∩ viewport* (que no cambia con clip-path) → solo Chrome lo
  dirime. **F-07 estrena verificación EN VIVO con Chrome.**
- **Un `animation` HORNEADO INLINE gana en especificidad al `@media(reduce)` de la hoja** → la
  animación va SIEMPRE en el SCSS module, nunca inline (lo cazó la revisión adversarial).
- **El h1: dos `<span>` + un text node `{' '}` REAL** (pegados dan «Nails LashStudio»; jsdom miente
  sobre `display`). Titular con **`--ink`** (nunca `--accent`: 4,05<4,5).

<!-- lo de abajo es el histórico de F-06, ya cerrada -->
- ~~**Feature en curso:** ninguna. `6 — header_nav_footer` cerrada **`done`** el 2026-07-18~~
  (27/27 escenarios, judge **APROBADO** en las 2 rondas, **629 tests**, mutación **100 %** en los
  cuatro ficheros —`puerta-anclas.ts` (149), `Cabecera.tsx`, `MenuNavegacion.tsx`, `Pie.tsx`—,
  **0 timeouts**, **0 EXCLUSIONES**, `pnpm build` verde con las **CINCO puertas**). Resumen completo
  en `progress/history.md`.

## Lo que F-06 deja al siguiente (leer antes de abrir F-07)

- **La QUINTA puerta ya existe: anclas vivas.** Cualquier feature que añada una sección debe darle un
  `id` de anclaje (`<section aria-labelledby>` → heading real) **y** enlazarla desde la nav, o el
  build rompe (igualdad de conjuntos). F-07 mete la sección `#top`/hero: **si la nav la enlaza, la
  sección tiene que existir con su id**.
- **El scroll-padding-top es `6rem` y el breakpoint `820px`, MEDIDOS sobre la nav actual.** Cuando
  F-09 cambie «Facial» por «Pestañas/Cejas», **los saltos de envoltura se mueven** → re-medir.
- **El estado condicional va en un atributo CONSULTABLE** (`aria-current`/`aria-expanded`/`data-*`),
  **NUNCA en un `className` condicional** (medido inmatable bajo la regla anti-clase-CSS). F-07 tiene
  estado de animación (`prefers-reduced-motion`, IntersectionObserver): mismo principio.
- **`radix-ui` ya NO está en `dependencies`.** Si F-07 necesitara un primitivo accesible, se discute
  antes de re-añadirlo (regla «dependencias mínimas»).
- **La mutación sobre `.tsx` funciona** pero los atributos JSX literales NO se mutan: lo que quieras
  aseverar del marcado, lo aseveran los TESTS o una puerta, jamás la mutación. Y los `.tsx` van a
  **DOS listas** (`mutate` de Stryker + `coverage.include` de Vitest).

## 🔴 Deuda del arnés que deja F-06 (para el lead)

- **`docs/mutation-testing.md` debería recoger: un refactor anti-equivalente INGENUO re-introduce el
  equivalente.** Medido: `referencia !== undefined && headings.has(referencia)` → el mutante que pone
  el operando izquierdo del `&&` a `true` da `true && headings.has(referencia)` = `headings.has(
  undefined)` = siempre false (la trampa del `undefined` redundante). **La forma que SÍ funciona: un
  guard que protege un THROW real**, así debilitarlo LANZA y un test lo mata. Es la diferencia entre
  «normalizar a un valor inerte» (equivalente) y «saltar con un guard verificado por el throw».
- **`docs/verification.md` debería recoger el VERDE POR VACUIDAD MULTI-EXTRACTOR**: cuando una puerta
  tiene N extractores independientes, **cada uno necesita su propia guarda de vacuidad**. La de F-06
  tenía dos y solo uno guardado; el hueco era **invisible a la mutación 100 %** (el mutante que vacía
  el 2º extractor lo mata su fixture, pero el build pasa en verde con 0 secciones inspeccionadas).
  Solo lo cazó la revisión adversarial del contrato.
- **La trampa gemela de WCAG ha mordido TRES veces** (F-03 el 1.4.11, F-04 el 2.4.7, F-06 el 2.4.11):
  el listón del AA se confunde con el del AAA. Regla: **antes de citar un SC como puerta_legal,
  buscar su hermano `Enhanced` (AAA) y confirmar cuál es el listón AA literal.**
- **La revisión adversarial del contrato ANTES de la puerta humana se pagó sola OTRA VEZ**: cazó el
  bloqueante de vacuidad multi-extractor. Debería ser parte fija del pipeline, no opcional.
- **El menor del judge** (renderToString vs readFileSync en `@s12`/`@s16`): para F-07+, leer
  `dist/index.html` cierra la letra del «verificar sobre el HTML crudo».
- **`prettier --check .` sigue fallando en ~86 ficheros** (preexistente, no es puerta del arnés).

## Pendiente del humano (no bloquea el código)

- **Dominio** (¿migrar `nailslashlasrozas.es` con 301?), **plataforma de reseñas** (Treatwell 1.231
  vs Google 226), **A-4** (si «Nails Lash Studio» es logotipo, SC 1.4.3 exime el par del `clamp`),
  las **dos deudas de higiene del judge de F-03**, y **`destacados`/`ofertas`** (huérfanos, B-7).
- **El corolario duro sigue**: sin razón social ni NIF válido en fuente pública, **la web no se puede
  publicar**. El objetivo es *lista para publicar*.
