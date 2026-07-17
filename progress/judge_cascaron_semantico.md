# Review — feature 4 `cascaron_semantico`

**Veredicto:** APPROVED

Verificado, no creído: `bin/harness init` **verde** (11 ficheros, **450 tests**, typecheck + lint 0
warnings) y `pnpm build` **exit 0** con las **TRES** puertas. Los números declarados por el
craftsman son los que da la máquina.

## Cobertura de escenarios (@s ↔ test) — 35/35

Recorridos uno a uno contra el `.feature`. Todos tienen al menos un test concreto:

- @s1–@s3 `componerTitulo` · @s4–@s6 `canonicaDe` · @s7–@s10 `construirJsonLd` → `src/lib/seo.test.ts`
- @s11 → `src/styles/cascara-global.test.ts` (4 tests) — **la bitácora lo ubica en `src/lib/`; está
  en `src/styles/`.** Erratum de la tabla, no del código.
- @s12–@s31, @s35 → `src/lib/puerta-cascaron.test.ts`
- @s32, @s33 → `src/lib/trampas-del-horneado.test.tsx` (5 builds SSG **reales**)
- @s34 → `src/lib/seo.test.ts` (4 tests) + `src/lib/diferidos.test.ts` (5)

Traza a los 6 acceptance de `feature_list.json` id 4: A1→@s16-@s18 · A2→@s12-@s14,@s32,@s33 ·
A3→@s7-@s9,@s19-@s22,@s35 · A4→@s23,@s24 · A5→@s26-@s29 · A6→@s1,@s2,@s4,@s5,@s34. **Sin huecos.**
A5 dice «mínimo conocido de páginas»; se implementa con `RUTAS_ESPERADAS` declarada en vez de un
número mágico. Es **desviación declarada y aprobada en el contrato** (@s26), y es mejor: crece sola.

## Los ocho puntos de lupa

1. **ANTI-TAUTOLOGÍA — LIMPIA.** Ningún esperado se compara contra el símbolo importado:
   - `@s1`: los tres títulos van **carácter a carácter** (`seo.test.ts:46-48`). **NO se recomponen
     con la plantilla vigilada** → el mutante del orden **muere** en la 1ª y en la 2ª fila
     (`marca · reclamo` invertido ≠ literal). El aviso del `gherkin_author` está atendido.
   - `geo`: literal a mano en el test (`seo.test.ts:186,190`) **y en producción**
     (`puerta-cascaron.ts:292-293`, `LATITUD_ACORDADA`), **deliberadamente no importado de
     `site.ts`** — vigilante y vigilado no se mueven juntos.
   - **Nombres de regla**: los tests aseveran **literales** (`'title ausente o vacío'`,
     `'geo distinto de la constante'`…), nunca las constantes `REGLA_*` exportadas. El único uso de
     `REGLAS_DEL_CASCARON` (`seo.test.ts:347-357`) va **precedido de su ancla** (`length >= 10` +
     dos literales), que mata el mutante `[]` que haría pasar los `not.toContain` **vacuamente**.
   - Dirección correcta: la **entrada** viene de `site.ts` (es el `Given` «NAP de la fuente única»);
     los **esperados**, a mano.
2. **@s32/@s33 — ASEVERAN SOBRE EL HTML CRUDO.** `trampas-del-horneado.test.tsx` construye builds
   SSG reales, lee `dist/index.html` con `readFileSync` y ejecuta la puerta **como subproceso**
   (veredicto por exit code). El aislamiento de Stryker (no importa `src/lib`) está bien razonado.
   `cabezaDe` **acota de verdad**, y es **doblemente load-bearing**: cae por `cabezaDe(...)` aislando
   head de body (`:980-986`, fila `<body><title>` → `false`) **y** por la aserción sobre el build
   real de React 19 nativo, que exige que la puerta **acuse** el title que vive en el `<body>`. La
   lección del «rompió por accidente» está fijada, no narrada.
3. **@s18 — LA CUARTA FILA MATA.** `idsDeHeadings` (`:129-141`) solo recoge `h[1-6]` con `id`, y se
   prueba directamente: `<div id="a">` → `[]`, `<p id="a">` → `[]`, `<h7 id="a">` → `[]`. La fila
   `<section aria-labelledby="x">` + `<div id="x">` → **1 violación**. El coladero está cerrado y la
   única regla que mide `SC 1.3.1` de verdad ya protege el acceptance 1. **Bien escalado: exigió una
   fila en el contrato, no código a escondidas.**
4. **@s34 — DIFERIDO CON ANCLA REAL.** `DIFERIDOS_APROBADOS` es literal a mano y **diferir un
   tercero pone rojo**: el ancla que muerde es
   `expect(declaradosComoPlaceholder.sort()).toEqual(['seo.origenCanonica'])` + el **ancla del
   ancla**, que lee `tools/puerta-placeholders.ts` en disco. Verificado por sabotaje por el
   craftsman (cada sabotaje mata exactamente su test). **Que mate 0 mutantes NO es defecto**: el
   mutante ahí es humano, y por eso el ancla es lo correcto. Bien declarado.
5. **Falla cerrada y vacuidad — CORRECTAS.** @s26 (dist ausente / 0 HTML / falta una ruta), @s27
   (lista vacía = la guarda de la guarda), @s28 (extractor a 0), @s29 (`try/catch` → build roto
   anclando **la causa concreta**). Ninguna vía devuelve verde.
6. **@s22 RECURSIVO — SÍ.** `nodosDe` (`:172-185`) recorre raíz, `@graph` y anidados llevando la
   ruta (`$.@graph[0].offers`), probado con `Offer` dentro de `Service` dentro de `@graph`, y con
   las propiedades **sueltas** e **insensible a la caja**. El mutante que corta la recursión muere.
   @s20 asevera el **tipo efectivo** (`tiposDe` acepta string y array; `["BeautySalon"]` → 0).
7. **@s10 — CORRECTO Y BIEN JUZGADO.** Rechaza sin completar/corregir/inferir; el mensaje **no echa
   el identificador** (logs del build) y el test contrasta contra el **alfabeto entero**
   (`/10656940\s*[A-Za-z]/`), así ni siquiera codifica la tabla del módulo 23. **La ausencia de
   camino positivo es la decisión correcta**: no existe identificador válido que probar y fingir uno
   sería inventarlo — y una rama que ningún test rojo pide sería mutante inmortal.
8. **@s30/@s31** — aseverados sobre `package.json`: `build` invoca la puerta **después** de
   `vite-react-ssg build`; `dev` y `dev:ssr` **no** la invocan.

## Disciplina TDD

- **¿Producción sin test que la pida?** **NO.** Buscado activamente. Los tres candidatos naturales
  están cerrados por diseño: no hay rama «NIF válido» (@s10), `geo` no emite `@type` y `@s18` no
  inventa `role="heading"`. `REGLAS_DEL_CASCARON` existe para @s34 y está aseverada.
- **¿Rojo→Verde→Refactor?** **SÍ**, con evidencia y con rojos que cazaron defectos reales
  (`cabezaDe`, el `try/catch` de @s29, el fixture de @s33 que rompía por la razón equivocada).
- **Honestidad (Ley 3):** el craftsman **declara** que en el ciclo de @s7 escribió más producción de
  la que su test rojo exigía y que por eso @s8, @s9, @s25 y @s30 **nacieron verdes**. Lo acepto: la
  desviación es real, está **confesada sin que nadie la encontrara**, y esos tests anclan mutantes
  vivos (el conjunto exacto de claves, la constante `geo`). No es alcance inflado: es orden de
  escritura. Queda anotado, no sancionado.
- **Las tres escaladas se escalaron en vez de forzarse.** Es exactamente la conducta que el arnés
  premia, y las tres eran reales.

## Calidad

- Funciones cortas, un motivo para cambiar, nombres reveladores. Reparto puro/humilde idéntico a
  F-01/F-03: `tools/puerta-cascaron.ts` solo cablea `node:fs`/`process`, sin lógica, fuera de
  `mutate` (verificado en `stryker.config.json`).
- Los tres **equivalentes se eliminaron cambiando el diseño**, no excluyéndolos (`URL.canParse` en
  vez del regex; `.some(> 0)` en vez de la suma; el filtro de `id=""` en vez de la condición
  redundante). **0 exclusiones, 0 `Stryker disable`** — mejor que F-01 (1) y F-02 (1).
- «La puerta acusa, no gruñe»: el `valor` de cada violación está anclado uno a uno, y el formato de
  línea fijado. Los `if` son independientes, nunca `else if` (@s25).
- Sin logs de debug ni TODOs sueltos en `src/` (los `TODO` que grepean son la palabra «TODOS»).
- Atribución normativa: **correcta en todo**. Ningún test, mensaje ni comentario dice «lo exige
  1.3.1» sobre h1/landmarks, ni «schema.org obliga», ni «Google prohíbe self-serving».

## El daño del lead: NO QUEDÓ NINGUNO

- **Edición revertida:** árbol de trabajo **limpio** (`git status` vacío). `src/lib/puerta.test.ts`
  figuraba modificado al inicio de mi sesión y hoy coincide con HEAD.
- **Falsa alarma descartada, y hay que decirlo:** los imports **sin** `.ts` que quedan en
  `contraste.test.ts`, `placeholders.test.ts`, `puerta.test.ts`, `puerta-contraste.test.ts` y
  `site.test.ts` **NO son daño del lead**: datan de F-01 (`16f1caf`), muy anterior a la ventana de
  interferencia. Los tests de F-04 usan `.ts`. Es inconsistencia de estilo entre features, **no** un
  defecto de esta feature (y no la arregla F-04: sería alcance inflado). La producción de `tools/`
  **sí** exige `.ts` (`--experimental-strip-types`) y la conserva.
- **`docs/verification.md`:** la regla **falsa** de la extensión `.ts` **no está** como regla. Está
  registrada como *corolario refutado* (`:127-134`) con la medición que la tumba y con la
  advertencia de que aplicarla habría roto el build. **Es la forma correcta de matar una regla
  falsa: dejando el cadáver a la vista.**

### Las dos reglas que la sustituyen: AMBAS BIEN FUNDADAS (auditadas, porque se me pidió dudar)

1. **`tests per mutant` desplomado = informe que miente.** **Sólida.** No es generalización
   precipitada, y la diferencia con la regla falsa es de método: (a) medición **pareada sobre el
   mismo código y los mismos tests** (19,68 vs 1,35); (b) un **falsador aritmético independiente**
   (`--coverageAnalysis all` **no puede** dar 2,45 tests/mutante sobre 246); (c) exige
   **verificación por sabotaje, que no depende de Stryker** — y el sabotaje se hizo
   (`ausenteOVacio → false`, «Survived» en el informe, **5 tests muertos** a mano). Se declara como
   **síntoma con procedimiento de verificación**, no como causa. Eso es exactamente lo que le
   faltaba a la regla del `.ts`.
   - *Matiz que dejo, sin bloquear:* de las tres señales, el doc dice «basta una». La señal 2
     aislada admite causa legítima (mejor atribución `perTest`, o un cambio en la suite): solo es
     anómala a **código y tests constantes**, que es lo que la tabla acota. Las señales 1 y 3 sí
     bastan solas. Sugerencia: escribir esa acotación junto al «basta una».
2. **Nunca dos Stryker a la vez.** **Sólida, y por el mejor motivo: es un MECANISMO, no una
   correlación.** Verificado en disco: `stryker.config.json` → `"tempDirName": ".stryker-tmp"`, ruta
   **única y global** → dos tandas comparten sandbox. Y el modo de fallo es **silencioso** (0
   timeouts, 0 errors), que es lo que la hace peligrosa. La cautela añadida («`rm -rf .stryker-tmp`
   solo si no hay otra tanda viva») es precisamente el error que se cometió.

## Checkpoints

- **C1** [x] arnés completo · `bin/harness init` exit 0.
- **C2** [x] una sola feature `in_progress` (id 4) · `current.md` describe la sesión activa.
- **C3** [x] arquitectura respetada (puro/humilde) · sin deps injustificadas · sin logs ni TODOs.
- **C4** [x] test por módulo · aislamiento real (builds SSG reales y dobles que **honran el contrato
  del puerto**: `listarHtml` lanza como `readdirSync`) · 450 tests verdes.
- **C5** [ ] **no evaluable por mí**: `progress/history.md` y el cierre de sesión son del lead, y la
  feature no puede pasar a `done` hasta el `mutation_tester`. Árbol limpio, sin temporales sueltos.
- **C6** [x] `.feature` con `@s1..@s35`, `Then` medibles, mapa `@s → test` en la bitácora, sin
  producción que ningún test rojo pida.
- **C7** — del `mutation_tester`. Declarado 100 % en los dos ficheros (50 y 482 mutantes, 0
  supervivientes, **0 timeouts**), 0 exclusiones. **Yo no lo doy por bueno: es su puerta.**

## Cambios requeridos

**Ninguno bloqueante.** Dos apuntes menores, para el lead, que **no condicionan esta aprobación**:

1. La tabla de trazabilidad de `progress/tdd_cascaron_semantico.md` sitúa `cascara-global.test.ts`
   en `src/lib/`; está en `src/styles/`. Erratum de una línea.
2. `docs/verification.md`: acotar el «basta una» de las tres señales (ver arriba). Y el desfase de
   `project-spec.md` §Feature 4 con la **décima** regla lo cierra el lead, como fija el contrato.

## Nota

Esta feature hace lo que F-04 existía para hacer: **una puerta que ve lo que jsdom no puede ver**.
El hallazgo de @s32 —que la primera puerta era *tan ciega como jsdom* y solo rompió por accidente—
es el tipo de defecto que sobrevive a una suite entera en verde, y lo cazó el escenario que el
contrato exigía **precisamente para eso**. El escenario se pagó a sí mismo. Aprobado.
