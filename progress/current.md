# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **Feature en curso:** `6 — header_nav_footer` (**`in_progress`**) — **PUERTA HUMANA ABIERTA
  (2026-07-17), TDD EN CURSO.** El `tdd_craftsman` verificó las dos condiciones (contrato aprobado
  + `status: in_progress` + campo `puerta_humana`) y arrancó el Rojo-Verde-Refactor. Mapa `@s → test`
  y diario de ciclos en `progress/tdd_header_nav_footer.md`. `5 — cero_terceros` quedó `done`.
- **Escenarios a recorrer (20):** @s1..@s20. Orden: puerta de anclas (decisor puro: @s1,@s2,@s3,@s20,
  @s5) → puerta (humilde: @s6,@s7,@s19,@s8,@s9,@s10) → deslindes de puertas (@s4,@s13,@s14) →
  cabecera/nav/pie horneados (@s12,@s16) → menú (@s15,@s17) → scroll-padding (@s11) → mutación (@s18).
- **Proyecto:** **5 done · 1 in_progress · 10 pending · 4 blocked.**

### 🔴 F-06 está esperándote. SIETE preguntas (B-1..B-7), y las siete son reales.

**Lo hecho (7 commits):** verificación previa (`f06_verificacion_previa.md`, 8 afirmaciones ×
verificar+refutar, ~1,77 M tokens, **1 recuperación por sobrecarga 529**) · spec
(`project-spec.md` §Feature 6, 409 líneas) · contrato (`features/header_nav_footer.feature`,
**20 escenarios**, marca `⏸`) · **revisión adversarial del contrato** (5 lentes, 15 agentes,
1,18 M tokens → **10 alegados, 4 confirmados: 1 BLOQUEANTE + 3 GRAVES**, 6 falsos) · ronda de
reparación (5 correcciones, 0 rechazadas).

**El patrón de F-04/F-05, otra vez: ninguna decisión de fondo cae; caen TRES de los cinco criterios
de aceptación y la `puerta_legal`.**

**El bloqueante que la revisión cazó antes de tu puerta:** la puerta de anclas vivas tiene **dos**
extractores (anclas + secciones) y **solo el de anclas tenía guarda de vacuidad** → el de secciones
podía derivar 0 y pasar en verde **con la mutación aún al 100 %** (invisible a la métrica). Añadida
la guarda gemela.

**Las 7 preguntas abiertas (`⏸`, ninguna cerrada por el lead):**

- **B-1** — la `puerta_legal` (*«SC 2.4.11 foco no oscurecido»*) **roza el AAA**: el listón AA es
  *«not entirely hidden»*; *«no part hidden»* es el 2.4.12 (AAA). Trampa gemela por **3ª vez**.
- **B-2** — acceptance @2 (*«scroll-margin no actúa al tabular»*) es **falso** (scroll al Tab es
  UA-defined) y @4 (*«se deriva de la altura real»*) es **insostenible bajo SSG**.
- **B-3** — el breakpoint **767 es herencia muerta**; el medido es **793–806px** → propuesta 820px.
- **B-4** — acceptance @1 (*«TODAS las secciones, no 7 de 11»*) es **insatisfacible** (hoy 2
  secciones) → igualdad de conjuntos + **puerta de anclas vivas nueva** (el entregable central).
  Incluye la propuesta de la **regla de «sección navegable»** (reutilizar `REGLA_SECTION` de F-04).
- **B-5** — 🔴 **¿menú móvil y con qué mecánica?** Propuesta: CSS puro + `aria-expanded` (evita el
  patrón de memoria, no necesita Radix). Es la bifurcación de la que cuelgan B-3 y B-6.
- **B-6** — Radix `Dialog` vs `<button aria-expanded>`. Propuesta: **no Radix** (`Portal` deja ciega
  la anti-404; cero usos en `src/` → sale de `dependencies`).
- **B-7** — `destacados`/`ofertas` son **huérfanos** (0 features los construyen).

### Hallazgos de F-06 que sobreviven a la feature

- **«No copiar del base» mordió por CUARTA vez**: el **767** es de WebEmpresa (0 en `src/`); el
  diseño no tiene ni una `@media`.
- **Un `className={cond?'a':'b'}` en TSX es INMATABLE** bajo la regla anti-clase-CSS (medido: solo
  muere con `toHaveClass`, prohibido) → estado en `aria-current`/`data-*`.
- **`Dialog.Portal` de Radix emite CERO en prerender** → dejaría la anti-404 **ciega** («miente por
  omisión»).
- **La cabecera tiene CINCO alturas** (231/190/149/108/70px); los **5rem de F-04 son insuficientes
  <821px**.
- **Los `.tsx` van a DOS listas**: `mutate` (stryker) **y** `coverage.include` (vitest).

<!-- lo de abajo es el histórico de F-05, ya cerrada -->
- ~~**Feature en curso:** ninguna. `5 — cero_terceros` cerrada **`done`** el 2026-07-17~~
  (43/43 escenarios, judge **APROBADO**, **576 tests**, mutación **100 %** en `terceros.ts`
  (183 mutantes) y `puerta-terceros.ts` (110), **0 timeouts**, **0 exclusiones**, `pnpm build`
  verde con las **CUATRO puertas**). Resumen completo en `progress/history.md`.
- **Siguiente:** F-06 `header_nav_footer` (`pending`) — `depends_on: ["cascaron_semantico"]`,
  ya `done`, sin bloqueos. Es el siguiente del camino crítico hacia la UI visible del demo.
  ⚠️ Aquí muerde el patrón de la memoria organizacional **`red-css-para-rama-solo-js-en-ssg`**:
  si la bifurcación móvil/escritorio se decide con `useIsMobile` (JS), el SSG hornea la rama de
  escritorio y en móvil desborda hasta que hidrata. Y **F-06 hereda dos cosas de F-04**: el
  `scroll-padding-top: 5rem` de `_base.scss` es **un suelo, no un número verificado** — F-06 es
  quien conoce la altura real de la cabecera y quien debe **vigilar** que `SC 2.4.11` se cumpla
  (A-18). También montará el pie, y con él **el primer `<a href>` a Facebook renderizado**
  (hoy la URL solo vive como literal en el bundle).

## Lo que F-05 deja al siguiente (leer antes de abrir F-06)

- **El invariante «cero terceros» ya es una PUERTA, no una promesa.** Cualquier feature que meta
  un `<iframe>`, un widget o una fuente por CDN **rompe el build**. F-11 (mapa) y F-14 (reseñas)
  lo heredan y se cierran en **su** feature.
- 🔴 **La justificación de «cero terceros» es CRITERIO DE PROYECTO, no una norma.** Se corrigió la
  `puerta_legal` de **F-05 y de F-11**: eran una **atribución normativa falsa**. **PROHIBIDO**
  escribir «art. 22.2 LSSI», «sin cookies → sin banner», «elimina banner/CMP» o «Fashion ID obliga
  a autohospedar». Ver `progress/f05_verificacion_previa.md` §6.
- **Las fuentes ya están horneadas** (Manrope 400/500/600/700 · Gilda Display 400 · Great Vibes
  400), pero **NADIE las aplica todavía**: F-05 hornea los `@font-face`; **F-06/F-07 ponen el
  `font-family`**. No están en el SCSS a propósito.

## 🔴 Deuda del arnés que deja F-05 (para el lead)

- **`docs/verification.md` debería ganar la regla más cara del día: UNA MEDICIÓN ROTA NO ES UN
  RESULTADO — y siempre apunta a «aquí no hay nada que hacer».** Pasó **cuatro veces en un día**
  (152 timeouts; un sabotaje con error de sintaxis que imprimía «0 red»; `--reporter=basic`
  **eliminado en Vitest 4** → vitest sale ≠0 **sin correr un solo test** y el script lee «0 fallos»
  como «sobrevive»; y una sonda que falló **uniformemente** en los 6 casos y se habría leído como
  «indistinguible = decorado»). **Las cuatro se cazaron solo porque el número era imposible por
  construcción.**
  → **Reglas:** *una medición que coincide con tu hipótesis en TODOS los casos es más probable que
  esté rota a que sea cierta* · **comprueba cuántos tests corrieron de verdad** · **mete controles
  SIN mutante**.
- **`docs/verification.md` debería ganar también: el diff textual de Stryker MIENTE sobre la
  precedencia.** `a && b && c && d` parsea `((a&&b)&&c)&&d`; el mutante se **imprime** `a || b && …`
  pero **es** `(a || b) && …`. **Copiar el diff literal da un mutante MÁS FUERTE que mata 5 tests**
  y «desmiente» un superviviente real. **Parentiza siempre.**
- **`docs/mutation-testing.md` debería recoger que la mutación puede encontrar un hueco en la
  SPEC, no en los tests.** Los 10 supervivientes de F-05 eran **guardas correctas que ningún
  escenario ejercitaba**: producción quedó **byte a byte idéntica** y el contrato creció 40 → 43.
  Corolario del `:58`: **una promesa en un comentario no es un contrato hasta que un test la
  muerde.**
- **Hechos de Stryker 9.6.1 verificados contra el código instalado** (la doc oficial **no** basta:
  lista 17 mutadores e incluye dos de Stryker.NET): son **16** (registro `allMutators`) ·
  **`.includes` NO se muta** · **`Regex` no va de anclas** (delega el patrón entero en
  weapon-regex: `/\s+/` da 2 mutantes sin una sola ancla) · **los literales numéricos no se mutan**
  (por eso una lista declarada ancla mejor que un `MINIMO = 18`).
- **La revisión adversarial del contrato ANTES de la puerta humana se pagó sola** y debería ser
  parte del pipeline: 31 agentes cazaron **3 bloqueantes**, y el peor (`@s30` no mataba a
  `ArrayDeclaration`) habría hecho **imposible cerrar la feature**.
- **Deuda de binarios de F-01 (A-27): SIGUE VIVA y ahora está EJERCITADA.** F-05 metió los
  primeros `.woff2` en `dist/`. **Medido: 0 violaciones**, pero **50.100 secuencias candidatas** al
  regex del teléfono. Cerrarla exige **un escenario nuevo en `features/puerta_placeholders.feature`**
  (feature `done`). **F-05 no la tocó, a propósito** (Ley 1).
- **`prettier --check .` falla en 86 ficheros y ya fallaba antes de F-05.** Preexistente, **no** es
  puerta del arnés (`lint` = `typecheck + eslint`). Sin tocar.
- **Ley 3**: el craftsman la rompió 3 veces en la ronda 1, **lo declaró**, y el `judge` lo aprobó
  tras probarlo por sabotaje **pero lo registró como deuda GRAVE**: *«el sabotaje es un remedio a
  posteriori, no una licencia»*.
- **Los 2 hallazgos menores del `judge`** de F-05 (no bloqueantes).

## Pendiente del humano (no bloquea el código)

- **Dominio**: ¿migrar `nailslashlasrozas.es` con 301?
- **Plataforma de reseñas**: Treatwell 4,9 · 1.231 vs Google 4,9 · 226 (**no son sumables ni
  intercambiables**).
- **A-4**: si «Nails Lash Studio» es logotipo, SC 1.4.3 exime el par del `clamp` (**no se depende**
  de ello).
- **Las dos deudas de higiene del judge de F-03**: la fila 2 inerte de `@s14`, y anclar
  `MINIMO_DE_PARES`.
- **El corolario duro sigue en pie**: sin razón social ni NIF válido en fuente pública, **la web no
  se puede publicar**. El objetivo alcanzable es *lista para publicar*.
