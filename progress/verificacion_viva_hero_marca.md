# F-07 — Verificación EN VIVO con Chrome real (lead, 2026-07-18)

> **Qué es esto.** F-07 estrena la fase que el humano habilitó con la extensión de Chrome: medir en
> un navegador REAL lo que jsdom no puede y lo que el contrato declaró **[NV]** (C-2) — el **LCP
> real**, si el **`clip-path`** deja el titular fuera del LCP, el hero **bajo
> `prefers-reduced-motion`**, y el **reflow a 320px**.
>
> **Método.** `dist/` de producción (build con las 5 puertas verdes) servido por `vite preview`
> (:8908) y medido con **Chrome real headless vía CDP con visibilidad forzada** — reproducible en
> `.experimentos-tmp/f07-verificacion-viva/measure-lcp.mjs`. (La pestaña de la extensión cargó en
> **background**, donde Chrome no registra el LCP ni avanza las animaciones; por eso la medición
> fiable se hace con visibilidad forzada. Mismo motor Chrome, resultado determinista.)

---

## ✅ Lo que pasó en vivo (medido en Chrome, no en jsdom)

| Eje | Medido | Veredicto |
| --- | --- | --- |
| **LCP** | **40–48 ms** (viewport 1280 y 320) | ✅ ≪ 2,5 s p75. **C-3 (acortar la animación a ≤1,2s) funcionó**: el hero ya NO bloquea el LCP (el prototipo lo llevaba a ~5,3s) |
| **El elemento LCP** | Es un **`<P>`** (size ~7.752–9.450), **NO el titular** (`lcp_inH1: false`) | ✅ **El `[NV]` del `clip-path` resulta MOOT**: el titular recortado nunca fue el elemento LCP, así que da igual si el clip-path lo excluye o no |
| **`prefers-reduced-motion: reduce`** | `clip-path: inset(0px)` (visible), `opacity: 1`, `getAnimations() == []` | ✅ **El hero se ve COMPLETO y sin movimiento** bajo reduced-motion. El patrón de memoria funciona en Chrome real |
| **Animación (movimiento normal)** | `paintReveal` termina en `finished`, `clip-path: inset(0px 0% 0px 0px)` (revelado) | ✅ La animación corre y **termina** dejando el titular visible |
| **Reflow SC 1.4.10** | a **320px**: `scrollWidth == clientWidth == 320` | ✅ **Sin desbordamiento horizontal** |
| **Nombre accesible del h1** | `"Nails Lash Studio"` (con el espacio real) | ✅ El text node `{' '}` funciona en Chrome real, no solo en el test |

---

## 🔴 El fallo que SOLO la verificación en vivo cazó: el titular NO usa la fuente de marca

**Medido:** `document.fonts.check('142px "Great Vibes"')` → **`false`**; el titular «Nails Lash»
computa `font-family: "Times New Roman"` (el fallback serif del UA), **no Great Vibes**.

**Causa raíz (es del CÓDIGO, no del entorno):** `src/components/hero.module.scss` **no declara
`font-family` para el titular**. `.titulo` (el `<h1>`) solo tiene `color: var(--ink)`; los spans
`.heroMarca` («Nails Lash») y `.heroStudio` («Studio») solo tienen `clip-path`/`opacity`/`animation`
→ **heredan** la fuente del cuerpo, no Great Vibes. El único `font-family` del fichero es el del
`.eyebrow` (Manrope, línea 13).

**Verificado que NO es un problema de servido:** el `@font-face` de Great Vibes **sí** está en el CSS
de `dist/`, y su `.woff2` **se sirve** (HTTP 200, 42.800 bytes). La fuente está disponible; **el hero
simplemente no la pide**, porque el CSS del titular no la nombra.

**Por qué NINGUNA puerta lo cazó, y por qué esto justifica la fase con Chrome:** los tests unitarios
leen el SCSS y aseveran `clip-path`/`animation`/`@media`; el `judge` midió el HTML crudo (estructura,
`--ink`, sin inline); la mutación cubrió la derivación de `NOMBRE`. **Ninguno mira qué fuente PINTA
el titular** — eso solo se ve en un navegador que renderiza. Es «verde ≠ funciona» en estado puro:
la feature se llama `hero_marca` y su titular sale en la letra por defecto, no en la letra manuscrita
de marca (Great Vibes) que el diseño elegido usa para «Nails Lash».

**El diseño de referencia** (prototipo `Opcion-1-Rosa`): «Nails Lash» en **Great Vibes** (cursiva
manuscrita, `clamp(50px,11.5vw,142px)`) + «Studio» en **Manrope**. **Partir el nombre en dos `<span>`
tiene sentido justo por esto — dos fuentes distintas** — y hoy ambos salen en la misma fuente
heredada, con lo que la partición no aporta nada visual.

**Por qué no lo decido yo:** el **acceptance de F-07 NO menciona la tipografía del titular** (se
centró en animación / LCP / a11y). Añadir «el titular usa Great Vibes» **es añadir un criterio de
aceptación** → puerta humana (como A-23/B-4/C-x). Y es una decisión de diseño: **¿Great Vibes solo
para «Nails Lash» y Manrope para «Studio» (como el prototipo)?** → va a la puerta.

---

## Estado

F-07 pasó `judge` (APROBADO) y mutación (100 %, 0 exclusiones). **El único hallazgo abierto es la
tipografía del titular**, y depende de una decisión del humano. `src/` intacto salvo lo ya
commiteado; el servidor de `vite preview` y el experimento CDP están en `.experimentos-tmp/` (git-
ignored).

---

# RE-VERIFICACIÓN EN VIVO 2026-07-18 — tras el fix de `@s17` (acceptance 7, aprobado en la puerta)

> El humano aprobó en la puerta arreglar la tipografía DENTRO de F-07 (Great Vibes para «Nails Lash»,
> Manrope para «Studio»). El `tdd_craftsman` lo implementó por TDD (`@s17`, 2 líneas de `font-family`
> en `hero.module.scss`), el `judge` lo APROBÓ (0 bloqueantes) y el `mutation_tester` re-validó 100 %
> (`@s17` es SCSS → no-mutable, declarado). Esta sección cierra el eje **[NV]/C-2** en vivo.

**Método.** `pnpm build` fresco (exit 0, las 5 puertas) → `dist/` servido por `vite preview` (:4173)
→ medido de DOS formas independientes que coinciden: (a) la **extensión de Chrome del humano** sobre
la pestaña real; (b) **Chrome headless vía CDP con visibilidad forzada** (`.experimentos-tmp/f07-
verificacion-viva/measure-lcp.mjs`, URL 8908→4173), que mide el LCP fiable que la pestaña de fondo no
registra.

## ✅ El eje [NV] que abrió la ampliación, ahora en verde

| Eje | ANTES (el fallo cazado) | AHORA (medido en vivo) |
| --- | --- | --- |
| `document.fonts.check('142px "Great Vibes"')` | **`false`** | **`true`** ✅ |
| `font-family` computado de «Nails Lash» (`.heroMarca`) | `"Times New Roman"` (fallback UA) | **`"Great Vibes", cursive`** ✅ |
| `font-family` computado de «Studio» (`.heroStudio`) | heredado del cuerpo | **`Manrope, sans-serif`** ✅ |
| `Great Vibes 400` en `document.fonts` | `unloaded` | **`loaded`** ✅ |
| Nombre accesible del `<h1>` | — | **`Nails Lash Studio`** ✅ (text node `{' '}` real) |
| CSS horneado en `dist/assets/*.css` | sin `font-family` en el titular | `._heroMarca{font-family:Great Vibes,cursive;…}` · `._heroStudio{font-family:Manrope,sans-serif;…}` ✅ |

## ✅ Regresión / invariantes (Chrome real headless CDP, 3 ramas)

| Escenario | Great Vibes | `font-family` | LCP | ¿LCP en `<h1>`? | reflow | anims |
| --- | --- | --- | --- | --- | --- | --- |
| normal 1280 | `true` | `"Great Vibes", cursive` | **216 ms** | `false` (`<P>`/`<H3>`) | `scrollW==clientW==1258` | `paintReveal: finished` |
| reduced-motion 1280 | `true` | `"Great Vibes", cursive` | **156 ms** | `false` | `1258==1258` | **`[]`** (sin movimiento residual) |
| reflow 320 | `true` | `"Great Vibes", cursive` | **136 ms** | `false` | **`320==320`** (sin desborde) | `paintReveal: finished` |

- **LCP 136-216 ms** ≪ 2,5 s p75 [V: web.dev] con Great Vibes YA en el camino crítico (43 KB woff2,
  status 200). El acceptance decía «el LCP medido (40 ms) aguanta Great Vibes»; ahora, con la fuente
  REALMENTE cargada, se mide directo y **aguanta con holgura** (sube de ~40 ms a ~150-216 ms, sigue
  «good»). **`lcp_inH1: false`** en las 3 ramas → el titular NO es el elemento LCP, así que la fuente
  del titular no gobierna el LCP (el `clip-path` sigue siendo MOOT, como en la 1.ª verificación).
- **`color: rgb(142,51,85)` = `--ink` (#8E3355)** en las 3 ramas → el contraste de F-03 intacto.
- **Reduced-motion:** `clip-path: inset(0px)`, `opacity: 1`, `getAnimations() == []` → el hero se ve
  COMPLETO y sin movimiento. El patrón de memoria sigue funcionando con la fuente añadida.

## ✅ Red y consola (invariante F-05 + higiene)

- **0 peticiones a orígenes web externos** (`PerformanceResourceTiming`, medido en las dos cargas):
  `n_externas: 0`. El `great-vibes-latin-400-normal-*.woff2` carga **200** desde `localhost`, junto a
  Manrope/Gilda. Ningún tercero recibe la IP: F-05 intacto.
- **Consola limpia en carga:** el único mensaje es `Content Script: Initializing` de la PROPIA
  extensión (`chrome-extension://…`), no de la app. 0 errores / 0 warnings de la página.
- **Captura visual:** el `<h1>` muestra «Nails Lash» en la cursiva de marca (Great Vibes, rosa `--ink`)
  + «Studio» en Manrope — el diseño Opcion-1-Rosa. La partición en dos `<span>` por fin aporta su
  contraste tipográfico.

## 🟡 Hallazgos FUERA DE ALCANCE de F-07 (reportados, NO tocados — una feature a la vez)

1. **Error de la app en re-navegación SUAVE (no en carga real).** La 2.ª `navigate` de la extensión a
   la misma URL dispara el fetch de loader-data cliente de `vite-react-ssg`, y bajo `vite preview` ese
   fetch devuelve `index.html` → `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` (error
   boundary). **NO aparece en carga completa ni en recarga dura (Ctrl+Shift+R): ambas renderizan
   perfecto.** NO lo causa `@s17` (una `font-family` no genera un error de JSON). El sitio es de UNA
   ruta con nav por anclas (`#servicios`/`#contacto`), así que un usuario normal no dispara navegación
   de ruta cliente. Candidato a investigar cuando entre enrutado multipágina (F-16) o antes de
   publicar. **Deuda declarada, no reparada.**
2. **El `body` global no fija `font-family`** en `src/styles/` (grep = 0): todo el texto que no lo
   declare sale en la serif por defecto del UA (visible en la captura: «Servicios», el cuerpo). NO es
   F-07 (el titular del hero SÍ queda correcto) y no hay feature/spec aprobada para la tipografía
   global del cuerpo. Candidato a su propia feature. **Deuda declarada, no reparada.**

## Veredicto de la fase EN VIVO
**PASS.** El eje [NV] que abrió la ampliación (¿el navegador PINTA Great Vibes?) queda **cerrado en
verde**, medido por la extensión de Chrome del humano Y por CDP headless. Sin regresión (LCP, reduced-
motion, reflow, contraste, cero terceros, consola). Los 2 hallazgos fuera de alcance quedan DECLARADOS
como deuda para el humano, no reparados (una feature a la vez). F-07 lista para cerrar `done`.
