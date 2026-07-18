# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **Feature en curso:** ninguna. `6 — header_nav_footer` cerrada **`done`** el 2026-07-18
  (27/27 escenarios, judge **APROBADO** en las 2 rondas, **629 tests**, mutación **100 %** en los
  cuatro ficheros —`puerta-anclas.ts` (149), `Cabecera.tsx`, `MenuNavegacion.tsx`, `Pie.tsx`—,
  **0 timeouts**, **0 EXCLUSIONES**, `pnpm build` verde con las **CINCO puertas**). Resumen completo
  en `progress/history.md`.
- **Proyecto:** **6 done · 10 pending · 4 blocked.**
- **Siguiente (camino crítico):** F-07 `hero_marca` (`pending`) — `depends_on: ["tokens_paleta_contraste",
  "cascaron_semantico"]`, las dos `done`. Es donde el patrón de memoria `estado-base-visible-ssg-
  reduced-motion` decide el diseño: el prototipo hace **exactamente lo prohibido** (`paintReveal`
  arranca desde `clip-path:inset(0 100% 0 0)` con el nombre del salón en `opacity:0` hasta t=4,4s →
  bajo SSG se hornea INVISIBLE, y bajo `prefers-reduced-motion` se queda congelado invisible). Además
  `bob 2.4s infinite` incumple SC 2.2.2. **El LCP hoy es ~5,3s; objetivo ≤1,2s.**

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
