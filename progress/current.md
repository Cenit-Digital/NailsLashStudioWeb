# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **LOTE A en ejecución** (camino crítico enseñable para la DEMO del lunes; rigor completo, puertas en
  lote). Orden: **tipografía ✅ → horario ✅ → contacto (siguiente) → catálogo.**
- **🎨 DEMO hero «TRAZO DE PLUMA»** (2026-07-19, rama `demo/lunes-prototipo`, a petición de Pablo). Dos
  quejas resueltas sobre el hero: (1) **el recorte** de «Nails Lash» (la «L»/«N»/«h» seccionadas por
  arriba) — causa: `clip-path: inset(0 0 0 0)` (border-box) + `line-height:0.9` dejaban la caja más baja
  que las astas de Great Vibes; arreglado dando ALTURA a la caja (`padding-top:0.6em`, `line-height:0.98`)
  SIN tocar el valor del clip-path → **@s1 de F-07 intacto**. (2) **La animación**: Pablo eligió (puerta,
  `AskUserQuestion`) «Trazo de pluma (SVG)» frente a «contorno» y «barrido». Se sustituyó el `brush.png`
  que barría en horizontal por un **aplicador de esmalte que RECORRE el trazo real de cada letra**: un
  `<svg viewBox>` (escala con el titular responsive) con `<image href=brush.png>` movido por SMIL
  `<animateMotion>` sobre `TRAZO_MARCA` (centerline de «Nails Lash» calibrada en vivo con `measureText`),
  mientras Great Vibes se revela detrás con `paintReveal` (F-07). Ficheros: `Hero.tsx`, `hero.module.scss`.
  **F-07 (done) NO reabierto**: el `<h1>` (2 spans + text node), nombre accesible «Nails Lash Studio»,
  `paintReveal`, `--ink`, fuentes y ≤2,5s siguen igual (28 tests núcleo verdes). Los 3 tests `@demo` del
  mecanismo viejo (`brush.png`/`brushWrite`) se **reescribieron** al nuevo (5 tests: reduced-motion oculta
  `.pincelSvg`, `<svg aria-hidden>` fuera del `<h1>`, `brush` autohospedado, `<animateMotion>` con path de
  curvas y 2 subtrazos). **769 tests verdes**, typecheck/lint 0, `pnpm build` **5 puertas** (F-05 terceros
  OK: el `href` del aplicador es local). **VERIFICADO EN VIVO con Chrome** cuadro a cuadro (líneas CSS+SMIL
  conducidas por `getAnimations().currentTime` + `setCurrentTime`): el aplicador sube por la N, hace la
  montaña, recorre los lazos y termina en la «h»; sin recorte; «STUDIO» visible; reduced-motion sin pincel.
  Contrato en `features/hero.feature` (reescrito del viejo 4.8s/IntersectionObserver). 🟡 Sin commitear.
- **`21 — tipografia_global`: CERRADA `done`** el 2026-07-18. @s1–@s7 por TDD (partial `_tipografia.scss`:
  body Manrope, `h2,h3` Gilda Display; `@use` en `main.scss`), judge APROBADO (0 bloq., 2 menores),
  mutación N/A (SCSS), **679 tests**, build 5 puertas. **Verificación EN VIVO con Chrome:** body computed
  = Manrope (era Times New Roman), h2 «Servicios» = Gilda Display, hero de F-07 intacto (Great Vibes),
  0 terceros. Resumen en `history.md`.
- **`10 — horario`: CERRADA `done`** el 2026-07-19. 15 escenarios por TDD. `src/lib/horario.ts`
  (estaAbierto puro con reloj inyectado, franjas `[abre,cierra)`, excepciones vacías,
  `openingHoursSpecification`, `horarioParaUI`). `openingHoursSpecification` compuesto en `home.tsx` sin
  tocar `construirJsonLd` (F-04 verde). judge APROBADO. **Mutación 100%** (2 supervivientes cerrados:
  ampliar test del predicado de excepción + refactor del dato muerto del domingo; 0 exclusiones). **729
  tests**. Verificación EN VIVO: JSON-LD servido con L-V 10:00-20:00 + Sábado 10:00-14:00, domingo
  omitido, 6 claves de F-04 intactas. Resumen en `history.md`.
  🟡 **Deuda:** el horario VISIBLE (3 filas, `horarioParaUI`) NO se renderiza aún en la página; su sitio
  natural es F-12 (contacto) — asegurar que la DEMO muestre las horas al implementar contacto.
- **Feature en curso: `12 — contacto`** (`in_progress`) — **TDD VERDE**, a la espera de `judge` +
  `mutation_tester` (NO se marca `done` aquí). Diario completo en `progress/tdd_contacto.md`.
  - 15/15 escenarios por TDD estricto (Rojo→Verde→Refactor). **765 tests** verdes (729 → +36), DOS corridas
    completas seguidas (determinismo). typecheck 0 · lint 0 · `pnpm build` exit 0 con las CINCO puertas
    (anclas de F-06 INTACTA: se reutiliza `#contacto-titulo`).
  - Núcleo mutable: `instagramHref` AÑADIDO a `src/lib/site.ts` (F-02 intacto — no reabierto). Render:
    `src/components/Contacto.tsx` + `contacto.module.scss` (extraído del stub de `home.tsx`).
    `Contacto.tsx` añadido a `mutate` de stryker. `vitest.config.ts`: `fileParallelism: false` (dos tests
    build-based comparten `dist/`; en paralelo eran flaky).
  - Sabotajes OK (mutar instagramHref → @s1 rojo; hardcodear host en .tsx → @s15 rojo con bytes idénticos;
    TikTok → @s7 rojo). Fronteras: sin WhatsApp (F-13), sin mapa (F-11), email omitido (D-3), sin TikTok.
  - Frontera respetada: el horario VISIBLE (deuda de F-10) NO se añadió a #contacto — no está en los 15
    escenarios del contrato; añadirlo sería improvisar alcance. Queda como deuda.
- **F-18 `equipo` — cierre de mutación (2026-07-21, `tdd_craftsman`):** los 8 supervivientes de
  `Equipo.tsx` (score 93.33 %) resueltos con **3 tests nuevos + 0 exclusiones**. (1) `franjasDe` divide
  su núcleo en `franjasOfrecibles(franjas)` PURA e inyectable → 2 tests de frontera matan `>= abre` y
  `< cierra` (81:37, 81:63). (2) El `className` condicional de la hora (177:32 ×3, inmatable con
  css:false) se BORRA: estado en `&[aria-pressed='true']` del SCSS. (3) La confirmación pasa a
  VALOR-OBJETO (`propuesta`/`reserva: Cita | null`): se van la bandera `reservado` (118:18) y la guarda
  redundante (140:23/140:42), sin `// Stryker disable`. **56 verdes** en los 2 ficheros de equipo,
  typecheck/lint 0. Detalle en `progress/mutation_equipo.md`.
- **🎨 DEMO Equipo + WhatsApp flotante — CERRADO Y VERIFICADO (2026-07-21).** A petición de Pablo (la
  página se había desviado del diseño Opción-1-Rosa): (a) se **restauró el orden del diseño** —
  `Ofertas → Equipo → Reserva → Galería` (la Galería, que se había colado en el hueco de Equipo, baja
  tras Reserva; NO se borra, decisión de Pablo); (b) **nueva sección `#equipo`** (`Equipo.tsx` +
  `equipo-logica.ts` + `equipo-demo.ts`), 7 tarjetas (Lucía…Sara) con especialidades REALES (Uñas ·
  Pestañas · Cejas · Nail art · Pedicura — NUNCA «Facial»/«Depilación», que no existen en el salón),
  calendario por profesional (sábado sin franjas de tarde por F-10), carrusel de reseñas circular, y
  **leyenda visible «datos de ejemplo»**; SIN fotos (placeholder de color; el literal `ph-woman` está
  prohibido por la puerta 2). (c) **Botón FLOTANTE de WhatsApp** (`BotonWhatsApp.tsx`), `<a>` estático
  fuera de `<main>`, `href` derivado de `waHref` de F-02 (formato `wa.me` VERIFICADO contra la doc
  oficial de WhatsApp), SVG inline accesible, WCAG 2.2 SC 2.4.11/2.5.8, `prefers-reduced-motion`.
  Contratos: `features/equipo_reservas.feature` (25) y `features/boton_whatsapp_flotante.feature` (14).
  **Puertas:** judge equipo APROBADO; judge botón APROBADO (v2, tras cerrar `@s4`); seguridad SECURE;
  a11y sin bloqueantes. **Mutación 100%** en `Equipo.tsx` y `equipo-logica.ts` (0 exclusiones);
  `BotonWhatsApp.tsx` EXCLUIDO de `mutate` por no-mutable (`<a>` estático, `@s11` lo enforce; ver
  `progress/mutation_boton_whatsapp.md`). **Verificación final (medida a mano):** typecheck 0, lint
  **0 errores/0 warnings** (las 4 funciones puras se extrajeron a `equipo-logica.ts`, patrón F-09),
  `pnpm build` exit 0 con las **5 puertas verdes**, `pnpm test` **889/889**. Reorden confirmado sobre
  `dist/index.html` real. De la sesión paralela: el hero se commiteó (`b2564e9`, `f192bad`); no se tocó.
  ⚠️ **`feature_list.json` F-18/F-13 NO se marcan `done`:** esto es un DEMO verificado, NO publicable.
  El bloqueo de F-18 «para publicar» (fotos reales + consentimiento, LO 1/1982 · RGPD art. 7.3) SIGUE
  vigente; los nombres son de ejemplo. F-13 (calendario que compone la solicitud) es otra feature.
- **🎨 `#reserva` RESTAURADA al diseño + MONOGRAMA en Equipo — CERRADO Y VERIFICADO (2026-07-21).**
  Pablo volvió a señalar secciones desviadas del prototipo. **Auditoría del lead contra los BYTES de
  `dist/index.html` vs `Opcion-1-Rosa.dc.html`:** de las 9 secciones, 7 coincidían; las desviaciones
  reales eran DOS, y solo dos. (a) `#reserva` tenía el titular «Pide tu cita en un momento» y una
  columna izquierda con un mini-calendario que el diseño NO pone ahí (el calendario del diseño vive en
  las tarjetas de `#equipo`, donde ya estaba: estaba DUPLICADO). (b) La galería «Nuestros trabajos» NO
  existe en el diseño — **decisión de Pablo por pregunta explícita: SE QUEDA donde está**, no se toca.
  - **`#reserva` restaurada** (`Reserva.tsx`, `reserva.module.scss`): columna izquierda = copy VERBATIM
    del prototipo (L248-256) —eyebrow, `<h2 id="reserva-titulo">¿Prefieres reservar por chat?</h2>`,
    párrafo— y DOS enlaces: «WhatsApp» (`waHref`) y «Llamar al estudio» (`telHref`), ambos DERIVADOS de
    F-02 (el `34600123456` del prototipo NO entra). Mini-calendario borrado entero (−130 líneas) y el
    SCSS podado: **16 clases declaradas ↔ 16 usadas**, 0 huérfanas. De paso se cazó que `estilos.reserva`
    NO existía en el módulo y rendía `undefined` en el className: arreglado. `RESERVA_WHATSAPP_TEXTO` en
    `src/lib/demo/reserva-demo.ts` (3.er punto de entrada DISTINGUIBLE en el móvil del salón).
  - 🔴 **CAUSA RAÍZ de la deriva, y la lección:** `#reserva` era la ÚNICA sección del proyecto con
    **CERO tests**; por eso fue la única que se desvió sin que nadie lo notara. Ahora tiene **36 tests**
    que cubren los **22 escenarios** del contrato reescrito. `features/reserva_chat.feature` v1 MENTÍA
    (ofrecía «Facial»/«Depilación», que el salón no ofrece): reescrito contra lo que el código hace.
    `claveBurbuja` sale a `reserva-logica.ts` (el ternario de className era inmatable bajo `css:false`).
  - **Monograma en Equipo** (@s26-@s31): donde había un rectángulo rosa VACÍO va la INICIAL de cada
    profesional. `inicialDe(nombre)` PURA en `equipo-logica.ts` (`charAt(0).toUpperCase()`: el caso
    vacío se resuelve SIN guarda, que sería mutante equivalente). Decorativo de verdad —`aria-hidden`
    en `.foto`, el nombre lo sigue dando el `<h3>`—. Gilda Display, `--accent-dark` sobre
    `--accent-soft`: par YA en la matriz, `MINIMO_DE_PARES` sigue en 18. **SIN fotos**: la norma de
    Pablo (nada de caras de IA) y la puerta 2 (`ph-woman` prohibido) siguen vigentes.
  - **Puertas (medidas a mano por el lead, no fiadas del informe del agente):** typecheck 0 · lint
    **0 errores / 0 warnings** · `pnpm build` exit 0 con las **5 puertas** · `pnpm test` **943/943** (32
    ficheros) · **mutación 100 % en `equipo-logica.ts` (36 muertos) y `Equipo.tsx` (55 muertos), 0
    supervivientes y 0 exclusiones nuevas** · judge **APROBADO** (0 bloqueantes) · a11y **0 bloqueantes**
    (monograma 4,86:1 sobre umbral 3:1 por texto grande; `.demo-btn` ≈48 px ≥ SC 2.5.8).
  - Verificado sobre `dist/index.html` REAL: orden Promociones → Equipo → «¿Prefieres reservar por
    chat?» → Galería → Contacto → FAQ; las 7 iniciales (L C A N M P S) HORNEADAS; «Pide tu cita» 0
    apariciones. Diarios: `tdd_reserva_equipo_final.md`, `judge_reserva_equipo_final.md`,
    `a11y_reserva_equipo_final.md`.
  - 🟡 **Deuda declarada (NO reparada, decide el humano):** (1) `Reserva.tsx` y `reserva-logica.ts`
    siguen FUERA de `stryker.config.json → mutate`: hoy tienen 36 tests pero su mutación no se mide.
    (2) D1 del contrato: el chat es un ASISTENTE DE DEMOSTRACIÓN y no lo dice en pantalla; sin leyenda
    visible, un visitante puede creer que ha reservado de verdad. Es honestidad, y merece su @s23.
    (3) `features/galeria_carrusel.feature` @s24 exige que la galería PRECEDA a «Reserva rápida», y hoy
    va DESPUÉS: el contrato quedó obsoleto cuando Pablo decidió dejarla ahí. Ningún test lo enforce.
- **Deuda anotada (`progress/deuda_precios_catalogo.md`):** los precios del catálogo quedaron
  descolocados en el commit `5a1345c` (p. ej. «Piernas completas 10 €» < «Medias piernas 35 €», y el
  catálogo anuncia «Facial»/«Depilación» que el salón no ofrece). Pablo pidió expresamente NO tocarlo.
- **Proyecto:** **9 done · 2 spec_ready (F-09/F-12 del lote A) · 6 pending · 4 blocked.**
- **Contratos del lote A ya aprobados y abiertos** (cabecera ✅): `features/horario.feature` (15),
  `features/contacto.feature` (15), `features/catalogo_servicios.feature` (17). El `tdd_craftsman` los
  implementa uno a uno; F-10 compone `openingHoursSpecification` en `home.tsx` (NO en `construirJsonLd`,
  que rompería F-04); F-09 separa dato (`catalogo.ts`, fuera de mutate) de lógica (`catalogo-logica.ts`).

## Cierre de F-07 (para el siguiente, leer antes de abrir F-08)

- **F-07 estrenó la VERIFICACIÓN EN VIVO con Chrome** (extensión del humano) y se pagó sola: cazó que
  el titular salía en la fuente por defecto porque `hero.module.scss` no declaraba `font-family`
  («verde ≠ funciona», I-8). Se arregló DENTRO de F-07 (acceptance 7 / `@s17`, aprobado en la puerta):
  `.heroMarca` = Great Vibes + cursive, `.heroStudio` = Manrope + sans-serif. Re-verificado en vivo:
  `document.fonts.check` = true, LCP 136-216 ms, cero terceros. **Lección: para features de UI, una
  puerta unitaria + build NO sustituye a ver la página pintada en un navegador real.**

## 🟡 Deuda declarada por F-07 (NO reparada — una feature a la vez; decide el humano)

- **Error de app en re-navegación SUAVE de `vite-react-ssg` bajo `vite preview`:** la 2.ª navegación
  cliente a la misma URL dispara el fetch de loader-data y recibe `index.html` → `Unexpected token
  '<', "<!DOCTYPE "... is not valid JSON` (error boundary). **NO aparece en carga completa ni en
  recarga dura** (ambas renderizan perfecto), y **no lo causa F-07**. El sitio es de UNA ruta con nav
  por anclas, así que un usuario normal no dispara navegación de ruta cliente. **Revisar antes de
  publicar o al meter enrutado multipágina (F-16).**
- **El `body` global no fija `font-family`** (`grep font-family src/styles` = 0): todo el texto que no
  lo declare sale en la serif por defecto del UA (visible en la captura de F-07: «Servicios», el
  cuerpo). No hay feature/spec aprobada para la tipografía global del cuerpo → **candidato a su propia
  feature**.

## Pendiente del humano (heredado, no bloquea el código)

- **Dominio** (¿migrar con 301?), **plataforma de reseñas** (Treatwell 1.231 vs Google 226),
  **`destacados`/`ofertas`** (huérfanos, B-7), y las **deudas de higiene del judge de F-03**.
- **El corolario duro sigue:** sin razón social ni NIF válido en fuente pública, **la web no se puede
  publicar**. El objetivo es *lista para publicar*.
