# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **LOTE A en ejecución** (camino crítico enseñable para la DEMO del lunes; rigor completo, puertas en
  lote). Orden: **tipografía ✅ → horario ✅ → contacto (siguiente) → catálogo.**
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
