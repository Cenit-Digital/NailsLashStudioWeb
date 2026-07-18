# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **LOTE A en ejecución** (camino crítico enseñable para la DEMO del lunes; rigor completo, puertas en
  lote). Orden: **tipografía ✅ → horario (siguiente) → contacto → catálogo.**
- **`21 — tipografia_global`: CERRADA `done`** el 2026-07-18. @s1–@s7 por TDD (partial `_tipografia.scss`:
  body Manrope, `h2,h3` Gilda Display; `@use` en `main.scss`), judge APROBADO (0 bloq., 2 menores),
  mutación N/A (SCSS), **679 tests**, build 5 puertas. **Verificación EN VIVO con Chrome:** body computed
  = Manrope (era Times New Roman), h2 «Servicios» = Gilda Display, hero de F-07 intacto (Great Vibes),
  0 terceros. Resumen en `history.md`.
- **Feature en curso: `10 — horario`** (in_progress). **TDD VERDE @s1..@s15** — a la espera de `judge` +
  `mutation_tester` (NO marcada `done`, Stryker NO corrido). `src/lib/horario.ts` (nuevo, en `mutate`),
  `src/lib/horario.test.ts` (43), `src/pages/home.tsx` (compone `openingHoursSpecification`, sin tocar
  `construirJsonLd`), `src/pages/home-horneado.test.ts` (6, build-based @s12/@s14). **728 tests** (679→+49),
  typecheck/lint 0, `pnpm build` exit 0 (5 puertas), `seo.test.ts` (F-04) sigue verde. 6 sabotajes
  confirmados. Ver `progress/tdd_horario.md`.
- **Proyecto:** **8 done · 3 spec_ready (F-09/F-10/F-12 del lote A) · 6 pending · 4 blocked.**
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
