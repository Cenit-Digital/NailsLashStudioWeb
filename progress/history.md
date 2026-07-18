# Historial de sesiones

> Bitácora **append-only**. Al cerrar cada sesión, añade aquí el resumen que
> estaba en `current.md` (feature, fases recorridas, veredictos, resultado).

<!-- Ejemplo de entrada:
## 2026-01-01 — feature `ejemplo_feature`
- spec_partner: decisiones cerradas (ver project-spec.md).
- gherkin_author: features/ejemplo_feature.feature (@s1..@s5), aprobado por el humano.
- tdd_craftsman: 5 ciclos Rojo-Verde-Refactor. Tests verdes.
- judge: APPROVED (ver progress/judge_ejemplo_feature.md).
- mutation_tester: score 0.92 > 0.80 (ver progress/mutation_ejemplo_feature.md).
- Resultado: done.
-->

## 2026-07-17 — feature `5 — cero_terceros` · **CERRADA `done`**

**Resultado: 43/43 escenarios · 576 tests · judge APROBADO · mutación 100 % en los dos ficheros
(183 + 110 mutantes), 0 timeouts, 0 exclusiones · `pnpm build` exit 0 con las CUATRO puertas.**

`src/lib/terceros.ts` (detector puro) · `src/lib/puerta-terceros.ts` (decisor +
`PARES_DE_FUENTE_ESPERADOS`) · `tools/puerta-terceros.ts` (el humilde). Fuentes autohospedadas por
los 6 imports `@fontsource/<familia>/latin-<peso>.css`.

### La feature en una frase

**«Cero terceros» no es «cero orígenes externos en el texto del artefacto»: es cero PETICIONES
AUTOMÁTICAS.** La distinción la da el HTML Living Standard (*external resource link* vs
*hyperlink*) y **es la feature entera**.

### Fases

- **Verificación previa** (`f05_verificacion_previa.md`): 16 subagentes contra fuente primaria,
  799k tokens. **8/8 afirmaciones con algo tumbado, 0 refutadas de raíz.**
- **Spec**: `project-spec.md` §Feature 5 (555 líneas).
- **Gherkin**: 37 → **40** escenarios tras una **revisión adversarial del contrato** (31 agentes,
  6 lentes, **2,14 M tokens**): **25 hallazgos alegados, 23 confirmados — 3 BLOQUEANTES.**
- **Puerta humana (2026-07-17)**: A-23, A-24, A-27, A-28 — **las cuatro como proponía el lead**.
- **TDD**: 40/40, 568 tests. **judge APROBADO** (30 sabotajes reproducidos).
- **Mutación**: **ESCALADA — 10 supervivientes reales.**
- **Puerta humana (2ª)**: ampliar el contrato **40 → 43**. **Producción NO se toca.**
- **TDD ronda 2**: 43/43, 576 tests, **0 líneas de producción tocadas**.
- **Mutación de cierre**: **100 % / 100 %**, 0 timeouts, 0 exclusiones. **judge delta APROBADO.**

### 🔴 Lo que esta feature enseña, y no estaba en ninguna otra

1. **Un criterio de aceptación puede ser INSATISFACIBLE, y nadie lo nota hasta que se mide.**
   *«El build falla si el artefacto contiene CUALQUIER origen externo»* era imposible: `dist/` ya
   traía **10 orígenes externos y ninguno era una petición** (4 namespaces XML de React,
   `react.dev/errors`, `fb.me`, el `@context` de F-04, la canónica). **Cumplirlo habría roto F-04,
   que estaba `done`.** → A-23.
2. **La `puerta_legal` era una ATRIBUCIÓN NORMATIVA FALSA**, y llevaba ahí desde el troceado.
   El art. 22.2 LSSI **no dice «cookies»**: dice «almacenamiento **Y recuperación**». **MEDIDO:**
   gstatic **no** manda `Set-Cookie` pero **sí** `Cache-Control: max-age=31536000` → *«no almacena
   nada»* es **falso**. Y **Fashion ID no se pudo abrir** (EUR-Lex: 202 + challenge AWS-WAF).
   → **La justificación correcta es CRITERIO DE PROYECTO y no cuelga de ninguna cita.** La
   decisión de autoalojar **no cambió**; cambió su fundamento. F-11 arrastraba lo mismo: corregida.
3. **«No copiar del base» mordió por TERCERA vez.** El diseño usa **Manrope + Gilda Display +
   Great Vibes**; `@fontsource/dm-sans` y `@fontsource/outfit` llevaban en `package.json`
   **sin un solo import**. (F-03: los tokens. F-04: el JSON-LD. F-05: las fuentes.)
4. **La regla del timeout mordió por TERCERA vez, y es la más cara del repo.** La tanda #1 dio
   **«100 %, 0 survived» con 152/183 en TIMEOUT**, en código **sin un solo bucle**. A
   `--concurrency 1`: **152 → 0 y aparecieron 9 supervivientes reales.**
5. 🔴 **LA LECCIÓN NUEVA — UNA MEDICIÓN ROTA NO ES UN RESULTADO, y siempre apunta a «aquí no hay
   nada que hacer».** Pasó **CUATRO veces en un día**, y las cuatro se cazaron *solo* porque el
   número era **imposible por construcción**:
   - La tanda #1 de Stryker: 152 timeouts en código sin bucles.
   - Un sabotaje del `judge` con error de sintaxis que imprimía «0 red».
   - El primer sabotaje del craftsman: **«0/10, los diez sobreviven»** — `--reporter=basic`
     **se eliminó en Vitest 4**, vitest salía ≠0 **sin correr un solo test**, y el script leía
     «0 fallos» como «sobrevive».
   - La sonda del `judge` en el delta: falló **uniformemente** en los 6 casos, que se habría leído
     como «indistinguible = decorado». **La cazó porque tenía controles SIN mutante.**
   > **Regla que se queda:** *una medición que coincide con tu hipótesis en TODOS los casos es más
   > probable que esté rota a que sea cierta.* **Y: comprueba cuántos tests corrieron de verdad.**
6. **El diff textual de Stryker MIENTE sobre la precedencia.** `a && b && c && d` parsea
   `((a&&b)&&c)&&d`; el mutante `LogicalOperator` se **imprime** `a || b && …` pero **es**
   `(a || b) && …`. **Copiar el diff literal da un mutante MÁS FUERTE que mata 5 tests** y
   «desmiente» un superviviente real. **Parentiza siempre.**
7. **`.includes` NO lo muta Stryker 9.6.1**, y **Stryker tiene 16 mutadores** (registro
   `allMutators`), no los 17 de la página oficial —que lista dos de Stryker.NET—. **Para decidir
   qué se muta, la fuente es el código instalado, no la doc.**
8. **`Regex` no va de anclas**: `regex-mutator.js` delega el patrón **entero** en weapon-regex.
   `/\s+/` **sin una sola ancla** da 2 mutantes.
9. **Vite 7 NO exime a las fuentes del inlining** (4096 B): hoy salva el tamaño (6.192 B) — **suerte,
   no garantía**. Y **`base` reescribe todos los `url()` a un origen externo**: es la vía nº1 y
   **ningún grep del CSS la anticipa** → la puerta asevera **la config**, no solo la salida.
10. 🔴 **LA PRUEBA DE MUTACIÓN ENCONTRÓ UN HUECO EN LA *SPEC*, NO EN LOS TESTS.** Los 10
    supervivientes eran **guardas defensivas CORRECTAS que ningún escenario ejercitaba**.
    **Producción quedó byte a byte idéntica mientras el contrato crecía de 40 a 43.**
    Y el `:58`: **un comentario que prometía tolerar `src = "x"` sin que ningún test lo fijara.**
    > **Una promesa en un comentario no es un contrato hasta que un test la muerde.**
11. **La revisión adversarial del contrato se pagó sola.** Cazó 3 bloqueantes **antes** de la
    puerta humana; el peor: `@s30` **no** mataba a `ArrayDeclaration` (recibe un `[]` literal, así
    que **nunca evalúa la constante de producción**) → con `break: 100` habría sido **INMORTAL y
    la feature no habría cerrado jamás**. **`@s38`, el escenario-ancla que la revisión obligó a
    añadir, es quien lo mata** — confirmado por la mutación **y** por 30 sabotajes del `judge`.

### Deuda declarada (NO cerrada aquí, a propósito)

- **El hueco de `(html|css)`**: un `fetch()` a un tercero desde el JS del bundle **no lo cazaría
  esta puerta**. **Hoy no existe ninguno [V, medido].** Declarado, no cerrado.
- **La deuda de binarios de F-01 sigue viva** (A-27): F-05 es la primera feature que mete
  `.woff2` en `dist/`. **Medido: 0 violaciones hoy**, pero **50.100 secuencias candidatas** al
  regex del teléfono. F-05 **no tocó** `tools/puerta-placeholders.ts` (Ley 1).
- **`latin-ext`** (A-28): un nombre con `Ł`/`ř`/`ğ` daría **tofu silencioso**. Entrará con su
  escenario el día que exista un nombre real que lo exija.
- **Ley 3**: el craftsman la rompió 3 veces en la ronda 1 y lo **declaró**; el `judge` lo aprobó
  tras probarlo por sabotaje, pero lo registró como **deuda GRAVE**: *«el sabotaje es un remedio a
  posteriori, no una licencia»*.
- **`prettier --check .` falla en 86 ficheros y ya fallaba antes de F-05.** Deuda preexistente;
  `format:check` **no** es puerta del arnés (`lint` = `typecheck + eslint`).
- **Los 2 menores del `judge`**, no bloqueantes.

## 2026-07-18 — feature `6 — header_nav_footer` · **CERRADA `done`**

**Resultado: 27/27 escenarios · 629 tests · judge APROBADO (2 rondas) · mutación 100 % en los cuatro
ficheros (`puerta-anclas.ts` 149 + `Cabecera.tsx` + `MenuNavegacion.tsx` + `Pie.tsx`), 0 timeouts,
0 EXCLUSIONES · `pnpm build` exit 0 con las CINCO puertas.**

`src/lib/puerta-anclas.ts` (decisor puro) + `tools/puerta-anclas.ts` (humilde) +
`src/components/{Cabecera,MenuNavegacion,Pie}.tsx` + `cabecera.module.scss`.

### La feature en una frase

**El entregable central no fue la nav, sino una PUERTA DE ANCLAS VIVAS** que no existía: la anti-404
de F-04 **excluye las anclas por diseño** (`RUTA_INTERNA = /^\/(?!\/)/`), así que una nav con 7
anclas muertas pasaba las cuatro puertas en verde. Ahora *«todo `href="#id"` de la nav resuelve a un
`id` presente Y cada sección navegable está enlazada (igualdad de conjuntos)»*, sobre el HTML crudo
de `dist/`, fallando cerrada para **los dos** extractores.

### Fases

- **Verificación previa** (`f06_verificacion_previa.md`): 8 afirmaciones × verificar+refutar,
  ~1,77 M tokens, **1 recuperación por sobrecarga 529**. 1 refutada de raíz, 6 matizadas, 1 confirmada.
- **Spec** (`project-spec.md` §Feature 6, 409 líneas) → **Gherkin** 20 escenarios tras **revisión
  adversarial del contrato** (5 lentes, 15 agentes, 1,18 M tokens → **10 alegados, 4 confirmados:
  1 BLOQUEANTE + 3 GRAVES**).
- **Puerta humana (2026-07-17)**: B-1..B-7, las siete como proponía el lead.
- **TDD** 20/20 (617 tests). **judge APROBADO.**
- **Mutación**: **ESCALADA — 21 supervivientes reales** (contrato de menos).
- **Puerta humana (2ª, 2026-07-18)**: ampliar el contrato **20 → 27**.
- **TDD ronda 2**: 20/21 muertos, producción intacta, **1 equivalente escalado**.
- **Puerta humana (3ª)**: refactorizar el equivalente (no excluir).
- **TDD ronda 3**: refactor de `seccionesNavegables`. **judge delta APROBADO.**
- **Mutación de cierre**: **100 % / 100 %**, 0 exclusiones.

### 🔴 Lo que esta feature enseña, y no estaba en ninguna otra

1. **«No copiar del base» mordió por CUARTA vez.** El breakpoint **`767` era herencia muerta de
   WebEmpresa** (0 ocurrencias en `src/`); el diseño no tiene ni una `@media`. El breakpoint real
   **medido en Chrome** es 793–806px → 820px con margen.
2. **La trampa gemela de WCAG, por TERCERA vez.** La `puerta_legal` (*«SC 2.4.11 foco no
   oscurecido»*) rozaba el AAA: el listón AA es *«not entirely hidden»*; *«no part hidden»* es el
   2.4.12, que es AAA. **Cero umbrales numéricos**: los 66/70/80px no son WCAG.
3. **Tres criterios de aceptación no se podían destilar tal cual** (A-23 redux): @1 *«TODAS las
   secciones, no 7 de 11»* insatisfacible (hoy 2 secciones, ids en los `<h2>`); @2 *«scroll-margin no
   actúa al tabular»* **falso** (el scroll al Tab es UA-defined); @4 *«se deriva de la altura real»*
   **insostenible bajo SSG** (en CSS puro no hay forma de leer la altura de un elemento).
4. 🔴 **Un `className={cond?'a':'b'}` en TSX es INMATABLE** bajo la regla anti-clase-CSS del repo
   (5 mutantes, solo mueren con `toHaveClass`, prohibido). **La salida medida: el estado va en un
   atributo consultable** (`aria-current`/`aria-expanded`, muere 4/4). Es una **colisión entre dos
   reglas del repo**, no un fallo de Stryker.
5. **`Dialog.Portal` de Radix emite CERO en prerender** → dejaría la anti-404 **ciega** («miente por
   omisión»). Y `radix-ui` tenía **cero usos en `src/`** → salió de `dependencies` (caso `dm-sans`).
6. 🔴 **VERDE POR VACUIDAD EN UN SEGUNDO EXTRACTOR, invisible a la mutación.** La revisión del
   contrato cazó que la puerta de anclas tiene **dos** extractores (anclas + secciones) y solo el de
   anclas tenía guarda de vacuidad. El de secciones podía derivar 0 y pasar en verde **con la
   mutación aún al 100 %** — la brecha no la caza la métrica de cierre, solo la puerta humana.
7. 🔴 **LA MUTACIÓN ENCONTRÓ UN HUECO EN LA SPEC, por tercera vez** (F-01, F-05, F-06). Los 21
   supervivientes eran **guardas defensivas correctas que ningún escenario ejercitaba**; producción
   quedó **intacta** mientras el contrato crecía 20 → 27. El grupo F era **el `:58` de F-05 otra
   vez**: un comentario que prometía tolerar `href = "#x"` con espacios sin que ningún test lo fijara.
8. 🔴 **UN «MUTANTE EQUIVALENTE» SE ELIMINA POR REFACTOR, NO SIEMPRE SE EXCLUYE — pero el refactor
   ingenuo RE-INTRODUCE el equivalente.** La forma orientativa del lead (`referencia !== undefined &&
   headings.has(...)`) habría vuelto a ser equivalente: `true && headings.has(...)` = `headings.has(
   undefined)` = siempre false (la trampa del `undefined` redundante). La forma correcta: **un guard
   que protege un THROW real** (`coincidencia[1]` sobre `null` revienta), así **debilitar el guard
   LANZA** y un test lo mata. El proyecto mantiene **0 exclusiones** desde F-03.
9. **La mutación sobre TSX es territorio nuevo y benigno**: los mismos 6 mutadores de cualquier
   `.ts`; los **atributos JSX literales NO se mutan** (`aria-label="Principal"` no está protegido por
   la mutación — lo aseveran los tests o la puerta del cascarón). Los `.tsx` van a **DOS listas**:
   `mutate` (Stryker) **y** `coverage.include` (Vitest).

### Deuda declarada (NO cerrada aquí)

- **El menor del judge** (`@s12`/`@s16` aseveran sobre `renderToString`, el motor de prerender, no
  sobre `readFileSync` de `dist/`): honra el espíritu anti-jsdom; para F-07+ un test que lea
  `dist/index.html` cerraría también la letra.
- **`destacados`/`ofertas` son huérfanos** (0 features): la nav no los enlaza; anotados como deuda,
  sin construirse ni descartarse (B-7).
- **El scroll-padding-top (`6rem`) y el breakpoint (`820px`) se RE-MIDEN** cuando la nav definitiva
  cambie las etiquetas (F-09 mete «Pestañas/Cejas»): mueven los saltos de envoltura.
