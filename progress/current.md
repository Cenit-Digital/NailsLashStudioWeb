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
- **Feature en curso: `reserva_chat` (columna WhatsApp) — sesión 2026-07-21 (`tdd_craftsman`).** Puerta
  humana abierta explícitamente (Pablo, vía `AskUserQuestion`): al terminar el chat, un enlace abre
  WhatsApp con la reserva YA REDACTADA (servicio, día, franja, nombre). `features/reserva_chat.feature`
  reescrito (v3): `@s22` restringido a la frontera con F-13 (disponibilidad/confirmación real), `@s23`
  (nuevo, `mensajeReserva` pura) y `@s24` (nuevo, el enlace "Enviar la reserva por WhatsApp" antes de
  "Reservar otra cita"). Diario: `progress/tdd_chat_whatsapp.md`. NO se marca `done` aquí.
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

- **🎨 FOTOS REALES en Equipo y Galería — TDD VERDE (2026-07-21, `tdd_craftsman`), a la espera de
  `judge`/`mutation_tester` (no marcado `done`).** El lead ya seleccionó y commiteó 13 fotos de Pexels
  en `src/assets/trabajos/` (fotos de TRABAJOS, sin rostro identificable — licencia Pexels + LO
  1/1982); esta sesión solo las cablea. (A) `Equipo.tsx`: el monograma (inicial sobre rosa) se BORRA
  ENTERO (`inicialDe` de `equipo-logica.ts`, sus 4 tests, la regla `.monograma` del SCSS y su test) y
  cada una de las 7 tarjetas pasa a mostrar la foto real de su trabajo (`foto`+`alt` nuevos en
  `ProfesionalDemo`, `equipo-demo.ts`), 800×600 + `loading="lazy"`. `LEYENDA_EQUIPO` pasa a declarar
  también que las fotos son de banco de imágenes. `features/equipo_reservas.feature` @s7/@s8/@s26-@s31
  reescritos (el monograma se sustituye por las fotos). (B) `Galeria.tsx` (sin tests hasta hoy) gana
  las 6 fotos restantes + `src/components/galeria.test.tsx` nuevo (7 tests); NO se añade a
  `stryker.config.json` (instrucción del encargo). **76/76 verdes en los ficheros tocados, 946/946 en
  la suite completa (33 ficheros)**, typecheck 0, lint 0/0. `Reserva.tsx`/`reserva*`/`Contacto.tsx`/
  `home.tsx`/`stryker.config.json`/`feature_list.json` NO se tocaron (fuera de alcance). Diario:
  `progress/tdd_fotos_equipo_galeria.md`. 🟡 Pendiente: `pnpm build` (5 puertas) y mutación de
  `Equipo.tsx`/`equipo-logica.ts` los corre el lead al cierre.

- **✅ CIERRE DE SESIÓN — fotos + chat funcional + mutación (2026-07-21, verificado A MANO por el
  lead, NO fiado del informe de los agentes).** Los tres puntos que pidió Pablo, cerrados:
  1. **Fotos** (su punto 3). El lead buscó en Pexels, descargó y **MIRÓ una a una 24 candidatas**;
     descartó 4 por mostrar **rostros identificables**, otras por fondo turquesa/azul fuera de paleta,
     por navideña y por repetida. Quedaron **13** (7 equipo + 6 galería), 544 KB, ~42 KB de media.
     🔴 **Corrección a la bitácora anterior: el ZIP del prototipo NO trae caras de IA.** Las 11
     imágenes de `Opcion-1-Rosa` son placeholders grises con el literal «IMAGEN TEMPORAL» (por eso la
     puerta 2 prohíbe `ph-woman` Y ese literal). No había ninguna foto que reutilizar.
     🔴 **Por qué fotos de TRABAJOS y no retratos** (decisión con base legal, no estética): la
     licencia OFICIAL de Pexels (leída hoy, `https://www.pexels.com/license/`) dice *«Don't imply
     endorsement of your product by people or brands on the imagery»*. Una cara de banco en una
     tarjeta que dice «Lucía · Especialista en uñas» implica que esa persona trabaja aquí → va contra
     la licencia Y contra LO 1/1982. Con fotos de trabajo **el bloqueo de F-18 «para publicar» por
     imagen de terceros DECAE** (siguen bloqueando los nombres/reseñas de ejemplo, con su leyenda).
  2. **Chat funcional** (su punto 1). Pablo eligió por `AskUserQuestion` «que acabe abriendo
     WhatsApp». Un agente se NEGÓ citando @s22 del contrato; **hizo bien en pararse, pero el contrato
     lo había escrito otro agente esa misma mañana y la puerta humana es el humano**: se reabrió @s22
     y se implementó. `mensajeReserva()` PURA en `reserva-logica.ts` + CTA «Enviar la reserva por
     WhatsApp» con `waHref` de F-02.
  3. **Mutación de `#reserva`** (su punto 2): `Reserva.tsx` y `reserva-logica.ts` ENTRAN en `mutate`.
     Afloró **una línea muerta** (`setBorrador('')` redundante) que nadie había visto.
  - 🔴 **LA MUTACIÓN SE PAGÓ SOLA, OTRA VEZ.** Con typecheck 0, lint 0, 950/950 tests y las 5 puertas
    VERDES, la mutación destapó que meter las fotos (borrar el monograma y sus tests) había dejado
    **12 mutantes vivos**: 4 en `equipo-logica.ts` —se podía **VACIAR `'Monday'`/`'Friday'`… de
    `DIA_SEMANA`** sin que ningún test se enterara, y ese array traduce el día al horario de F-10— y
    8 en `Equipo.tsx` (el lead estimó 2 leyendo mal el informe; medidos eran 8). Los 12, cerrados.
  - **CIFRAS FINALES, medidas por el lead:** typecheck **0** · lint **0 errores / 0 warnings** ·
    `pnpm test` **956/956** (33 ficheros) · `pnpm build` **exit 0 con las 5 puertas** · mutación
    **100,00 %** en los CUATRO ficheros: `equipo-logica.ts` (38 muertos), `Equipo.tsx` (63),
    `reserva-logica.ts` (5), `Reserva.tsx` (97). **0 supervivientes.**
  - **1 exclusión NUEVA, revisada y aceptada por el lead** (3 en todo el repo): las deps `[]` del
    `useEffect` de `Equipo.tsx`. React compara las deps con `Object.is` elemento a elemento; un
    literal CONSTANTE (`[]` o `['Stryker was here']`) vale lo mismo en cada render → el efecto corre
    exactamente una vez al montar en AMBOS casos, y `Equipo` no tiene props con las que forzar otra
    cosa. Mutante EQUIVALENTE, no un test que falte. Verificado aplicando la mutación a mano.
  - **VERIFICACIÓN EN VIVO con Chrome** (la lección de F-07): las 13 imágenes cargan, natural 800×600,
    **pintadas 348×261 (4:3 exacto)**, 7 tarjetas, sección de 2637 px, todo `opacity:1`/`visible`.
    El **chat se condujo de punta a punta** (Uñas → Entre semana → Por la mañana → «Marta») y el CTA
    resultante es `wa.me/34625223366?text=Hola, quiero reservar: Uñas · Entre semana · Por la mañana.
    Me llamo Marta…` — los 4 datos y el número REAL. ⚠️ **El capturador de pantalla de Chrome devolvía
    fotogramas EN BLANCO** (y una vez timeout de CDP): NO era la página —se descartó midiendo el DOM—.
    Si alguien repite la verificación, que no confunda el bug del capturador con un fallo de la web.
  - 🟡 **Deuda viva:** (a) el chat sigue SIN decir en pantalla que es una demostración —ahora entrega
    la solicitud de verdad, así que el riesgo baja, pero la leyenda sigue sin escenario—; (b)
    `Galeria.tsx` tiene 7 tests pero NO está en `mutate`; (c) `features/galeria_carrusel.feature` @s24
    (galería ANTES de «Reserva rápida») quedó obsoleto al dejarla donde está; (d) `features/
    contacto.feature` @s11/@s12 reservan «Cómo llegar» a F-11 pero el botón YA existe en
    `Contacto.tsx`, sin test, desde antes de esta sesión; (e) los huecos de foto del CATÁLOGO siguen
    vacíos (Pablo no los marcó) y el catálogo sigue anunciando «Servicio facial» con precios, que el
    salón NO ofrece (deuda `progress/deuda_precios_catalogo.md`, Pablo pidió no tocarla).

## Pendiente del humano (heredado, no bloquea el código)

- **Dominio** (¿migrar con 301?), **plataforma de reseñas** (Treatwell 1.231 vs Google 226),
  **`destacados`/`ofertas`** (huérfanos, B-7), y las **deudas de higiene del judge de F-03**.
- **El corolario duro sigue:** sin razón social ni NIF válido en fuente pública, **la web no se puede
  publicar**. El objetivo es *lista para publicar*.
