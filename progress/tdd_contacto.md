# TDD — F-12 `contacto`

> Diario Rojo→Verde→Refactor del `tdd_craftsman`. Contrato (ley):
> `features/contacto.feature` (15 escenarios, v2, APROBADO por la puerta humana
> el 2026-07-18, LOTE A). Baseline anclado: **729 tests** verdes.

## Puerta verificada antes de empezar
- `features/contacto.feature` cabecera: «✅✅ APROBADO POR LA PUERTA HUMANA EL 2026-07-18 (LOTE A)».
- `feature_list.json` §12 (`contacto`): `status: "in_progress"` + `puerta_humana` (lote A). CUADRAN → adelante.

## Diseño (mínimo, homogéneo con el repo)
- **Núcleo mutable ÚNICO:** `instagramHref(handle)` en `src/lib/site.ts` — derivación pura HERMANA de
  `telHref`/`waHref`. EXTIENDE site.ts (no reabre F-02: `telHref`/`waHref`/NAP intactos).
- **Render:** se extrae `src/components/Contacto.tsx` (+ `contacto.module.scss`) del stub `#contacto`
  de `home.tsx` (precedente F-07: el stub `<h1>` → `<Hero/>`). Enriquece la sección EXISTENTE
  `<section aria-labelledby="contacto-titulo">` — NO crea sección/id nuevo (no rompe anclas de F-06).
- Los href DERIVAN de la fuente única F-02; el `.tsx` NO hornea `instagram.com` (@s15).

## Escenarios a recorrer (@s1..@s15) y el ciclo

### Núcleo mutable — `instagramHref` en `src/lib/site.ts` (tests en `src/lib/site.test.ts`)

- **Ciclo 1 — @s1 (happy path).**
  - ROJO: 3 tests de @s1 (URL exacta, no la alternativa, host/sin-@/cierra-«/»). Fallan: `instagramHref is not a function`.
  - VERDE: se AÑADE `instagramHref` a site.ts derivando `` `${HOST_INSTAGRAM}${handle.slice(1)}/` `` (mínimo, sin validar aún). 40 verdes.
  - REFACTOR: `HOST_INSTAGRAM`/`PREFIJO_HANDLE` como constantes con nombre (sin números mágicos: `slice(PREFIJO_HANDLE.length)`).
- **Ciclo 2 — @s2 (falla cerrada: '', '@', '@nails lash').**
  - ROJO: la derivación sin validar devolvía `…instagram.com//` o `…/nails lash/` en vez de lanzar. 3 rojos.
  - VERDE: guarda de cuerpo válido `USUARIO_INSTAGRAM_VALIDO = /^[a-zA-Z0-9._]+$/` → lanza. 43 verdes. (Aún lenient con el "@" para dejar @s3 rojo.)
- **Ciclo 3 — @s3 (handle SIN "@" → falla cerrada, D-1a).**
  - ROJO: `instagramHref('nailslash.studio_')` derivaba la URL en vez de lanzar. 1 rojo.
  - VERDE: guarda propia `if (!handle.startsWith(PREFIJO_HANDLE)) throw` (predicado mutable del "@" inicial). 44 verdes.
  - REFACTOR: helper `resultadoODisparo` reutilizado por @s2/@s3 (un valor codifica «lanzó» y «no emitió //»). Nombres claros, funciones cortas.
- **@s13 (mutación de instagramHref):** cubierto por @s1/@s2/@s3; el conjunto EXACTO lo MIDE el `mutation_tester`. site.ts YA está en `mutate` de stryker (F-02) → no se toca la lista.
- **No reabrí F-02:** `telHref`/`waHref`/`numeroE164`/`numeroNacional`/NAP/`registros` y sus 37 tests INTACTOS; solo se AÑADIÓ `instagramHref` (+ `HOST_INSTAGRAM`/`PREFIJO_HANDLE`/`USUARIO_INSTAGRAM_VALIDO`). typecheck 0 · lint 0.

### El artefacto — `Contacto` component (render extraído del stub de `home.tsx`)

Diseño: se EXTRAE `src/components/Contacto.tsx` (+ `contacto.module.scss`) del stub `#contacto` de
`home.tsx`, homogéneo con el repo (Hero/Pie/Cabecera son componentes con `.module.scss` co-locado; F-07
ya extrajo `<Hero/>` del `<h1>` stub). Dos capas de test, como el repo:
- `src/components/contacto.test.tsx` — `renderToString(<Contacto/>)` in-process: da COBERTURA DE MUTACIÓN
  a los literales de `Contacto.tsx` (id, «Contacto», separadores de la dirección, textos de enlace).
- `src/pages/contacto-horneado.test.ts` — build-based, AUTORITATIVO sobre los BYTES de `dist/` (readFileSync,
  NUNCA jsdom), como manda el contrato para @s4/@s5/@s7..@s12/@s14. NO importa nada de `src/` (anti-timeout).

- **Ciclo 4 — @s4 (href de IG en #contacto).**
  - ROJO: `contacto.test.tsx` @s4 no compila (`Contacto` no existe).
  - VERDE: se crea `Contacto.tsx` (extrae el stub: `<section>`+`<h2 id>`+dirección+`tel:` y AÑADE el enlace
    de IG derivado de `instagramHref(REDES.instagram)`) y se compone `<Contacto/>` en `home.tsx` (se
    quitan `telHref`/`ID_CONTACTO`, ya sin uso). 2 verdes.
  - Se añaden @s5/@s10/@s12/@s14 in-process (caracterizan/guardan las piezas extraídas → cobertura de mutación). 8 verdes.
- **Ciclo 5 — @s6 (prominencia móvil = CSS).**
  - ROJO: `contacto-estilos.test.ts` lee `contacto.module.scss` inexistente → readFileSync lanza. 2 rojos.
  - VERDE: se crea `contacto.module.scss` con `.telefono` + una `@media (max-width: 820px)` que lo trata,
    y se cablea `className={estilos.telefono}` en el `tel:`. 2 verdes. (Leer la @media es PROXY de existencia,
    NO prueba de prominencia; sin cita a WCAG SC 2.5.8.)
- **Ciclo 6 — @s15 (guarda de FUENTE).**
  - La guarda `contacto-fuente.test.ts` se DISPARÓ SOLA al detectar «instagram.com» en un comentario mío del
    `.tsx` (prueba que muerde) → reescrito el comentario. 2 verdes. `.tsx` en 0, `site.ts` en ≥1.
- **Ciclo 7 — @s4/@s5/@s7/@s8/@s9/@s10/@s11/@s12/@s14 sobre `dist/` (build real).**
  - `contacto-horneado.test.ts`: `pnpm build` en `beforeAll`, extrae `#contacto` de los bytes reales,
    ANCLA POSITIVA en cada negativa (anti-vacuidad B1). 17 verdes; el build con las 5 puertas exit 0.

## Trazabilidad @s → test (cada escenario cubierto por ≥1 test concreto)

| @s | test(s) |
| -- | ------- |
| @s1 | `site.test.ts` «@s1 …» (URL exacta · no la alternativa · host/sin-@/cierra «/») |
| @s2 | `site.test.ts` «@s2 el caso "%s" LANZA …» (it.each: '', '@', '@nails lash') |
| @s3 | `site.test.ts` «@s3 "nailslash.studio_" (sin "@") LANZA …» |
| @s4 | `contacto-horneado.test.ts` «@s4 …» (dist, autoritativo) + `contacto.test.tsx` «@s4 …» (in-process) |
| @s5 | `contacto-horneado.test.ts` «@s5 …» + `contacto.test.tsx` «@s5 …» |
| @s6 | `contacto-estilos.test.ts` «@s6 …» (2: @media que trata .telefono · sin atribución WCAG) |
| @s7 | `contacto-horneado.test.ts` «@s7 …» (ancla positiva marca + sin «tiktok» en TODO el doc) |
| @s8 | `contacto-horneado.test.ts` «@s8 …» (ancla positiva + sin email + sin mailto: en TODO el doc) |
| @s9 | `contacto-horneado.test.ts` «@s9 …» (ancla positiva h2+tel · Facebook NO en #contacto, SÍ en el pie) |
| @s10 | `contacto-horneado.test.ts` «@s10 …» (1 sección + 1 id + nav enlaza + exit 0) + `contacto.test.tsx` «@s10 …» |
| @s11 | `contacto-horneado.test.ts` «@s11 …» (ancla positiva tel+dir+IG · sin wa.me/api.whatsapp.com) |
| @s12 | `contacto-horneado.test.ts` «@s12 …» (dir texto · sin iframe/«Cómo llegar»/«Planta 0») + `contacto.test.tsx` «@s12 …» |
| @s13 | cubierto por @s1/@s2/@s3 (`site.test.ts`); lo MIDE el `mutation_tester`. `site.ts` + `Contacto.tsx` en `mutate` |
| @s14 | `contacto-horneado.test.ts` «@s14 …» + `contacto.test.tsx` «@s14 …» (texto=handle · href=URL · cuerpo común) |
| @s15 | `contacto-fuente.test.ts` «@s15 …» (.tsx sin «instagram.com» · site.ts con el host) |

## Sabotajes (docs/verification.md) — cada test MUERDE, todos revertidos

1. **Mutar `instagramHref`** (quitar la «/» final: `` `${HOST}${usuario}` ``) → `@s1` ROJO (2 tests). Revertido.
2. **Hardcodear el host en `Contacto.tsx`** (`href="https://www.instagram.com/nailslash.studio_/"`) → `@s15`
   ROJO. Clave: los BYTES de `dist/` quedan IDÉNTICOS (@s4/@s14 siguen verdes), SOLO la guarda de FUENTE lo
   caza. Revertido.
3. **Meter un enlace de TikTok en `Contacto.tsx`** → `@s7` ROJO (página entera, tras rebuild). Revertido.
4. (Bonus) La guarda @s15 se disparó SOLA con «instagram.com» dentro de un comentario del `.tsx` → corregido.

## Estado final

- **765 tests** verdes (baseline 729 → +36: `site.test.ts` +7, `contacto.test.tsx` +8, `contacto-estilos` +2,
  `contacto-fuente` +2, `contacto-horneado` +17). **DOS** corridas completas seguidas verdes (determinismo).
- typecheck 0 · lint 0 · `pnpm build` exit 0 con las **CINCO puertas** (cascarón, placeholders, contraste,
  terceros, **anclas** — la igualdad de conjuntos de F-06 INTACTA: F-12 reutiliza `#contacto-titulo`).
- **NO reabrí F-02:** solo AÑADÍ `instagramHref` a `site.ts`; `telHref`/`waHref`/NAP/`registros` y sus tests
  siguen verdes.

## Cambios (ficheros)

- **Producción:** `src/lib/site.ts` (+`instagramHref` y constantes; F-02 intacto) · `src/components/Contacto.tsx`
  (nuevo) · `src/components/contacto.module.scss` (nuevo) · `src/pages/home.tsx` (compone `<Contacto/>`; se
  quitan la sección inline, `telHref` e `ID_CONTACTO`).
- **Config:** `stryker.config.json` (+`src/components/Contacto.tsx` en `mutate`) · `vitest.config.ts`
  (`fileParallelism: false` — DOS tests build-based comparten el mismo `dist/`; en paralelo se pisaban el
  artefacto → flaky; serializar los ficheros lo hace DETERMINISTA).
- **Tests:** `src/lib/site.test.ts` (+bloques de `instagramHref`) · `contacto.test.tsx` · `contacto-estilos.test.ts`
  · `contacto-fuente.test.ts` · `contacto-horneado.test.ts` (nuevos).

## Fronteras respetadas (nada improvisado)

- SIN botón/flujo de WhatsApp (es F-13, @s11) · SIN mapa/«Cómo llegar»/«Planta 0, Local 41» (es F-11, @s12) ·
  email OMITIDO en la demo (D-3, @s8) · SIN TikTok (@s7) · Facebook SOLO en el pie de F-06 (@s9).
- El **horario VISIBLE** (deuda de F-10, `horarioParaUI`) NO se añadió a `#contacto`: no figura en los 15
  escenarios del contrato; añadirlo sería IMPROVISAR ALCANCE. Queda como deuda para su propia decisión.

## Pendiente (NO lo hace el `tdd_craftsman`)

- Mutación con Stryker sobre `site.ts` (instagramHref) y `Contacto.tsx` → `mutation_tester` (umbral 1.0; si algún
  mutante RESISTE, se ESCALA: ampliar/refactorizar, 0 exclusiones). · Review → `judge`. · Verificación EN VIVO
  con Chrome (prominencia del `tel:` en móvil, la página pintada) → el `lead`. **NO se marca `done` aquí.**
