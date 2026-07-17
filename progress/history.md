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
