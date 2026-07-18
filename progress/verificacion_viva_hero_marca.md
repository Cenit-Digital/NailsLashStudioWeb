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
