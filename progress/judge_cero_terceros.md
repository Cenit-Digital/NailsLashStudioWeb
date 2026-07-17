# Review — feature 5 `cero_terceros`

**Veredicto:** APPROVED

> **Qué es esto.** Revisión adversarial de F-05. **No me fié de nadie**: ni del lead (que ya se
> equivocó dos veces esta sesión) ni del craftsman (que **confiesa haber roto la Ley 3 tres veces**).
> **Reproduje los sabotajes yo mismo: 30 mutantes aplicados a mano, 0 supervivientes.** Todo lo que
> sigue está **medido**, no leído.
>
> `bin/harness init` ✅ **Entorno listo** · `pnpm test` ✅ **568/568** · `pnpm build` ✅ **exit 0 con
> las CUATRO puertas** · `git status` ✅ **limpio** (restauré los 30 sabotajes; el md5 de los 3
> ficheros de producción == HEAD).

---

## 1. Cobertura de escenarios (@s ↔ test) — **40/40, contados POR TÍTULO DE `it()`**

Extraídos con `grep` sobre los títulos reales, **no** por la tabla de la bitácora. Los 40 tienen
test. **Ni un hueco.**

| `@s` | Test que lo verifica | ✔ |
| --- | --- | --- |
| @s1 | `@s1 %s se detecta como petición automática a cdn.tercero.com` (14 filas) | [x] |
| @s2 | `@s2 <link rel="%s"> a un tercero se detecta` (6 filas) | [x] |
| @s3 | `@s3 <link rel="%s"> … el tercero recibe la IP igual` (2 filas) | [x] |
| @s4 | `@s4 %s se detecta contra %s` (4 filas) | [x] |
| @s5 | `@s5 el artefacto %s la clase "jamas-usada": se marca igual` (2 filas) | [x] |
| @s6 | `@s6 el conjunto tokenizado de rel contiene "stylesheet": la hoja se pide` | [x] |
| @s7 | `@s7 rel=%j se resuelve igual (%s)` (5 filas, incl. **TAB U+0009 real**) | [x] |
| @s8 | `@s8 en %s, %s se detecta` (3 filas) | [x] |
| @s9 | 3 tests (`<base href>` externo · `/` propio · valor RESUELTO) | [x] |
| @s10 | `@s10 la canónica de F-04 no se detecta: un hyperlink no pide nada` | [x] |
| @s11 | `@s11 un feed Atom es un hiperenlace a un recurso alternativo…` | [x] |
| @s12 | `@s12 un hiperenlace a Facebook no transmite nada hasta que la usuaria decide ir` | [x] |
| @s13 | `@s13 un namespace XML es un identificador, no una dirección` | [x] |
| @s14 | `@s14 una URL que viaja como DATO no es una instrucción de carga` | [x] |
| @s15 | `@s15 el @context de F-04 no se detecta: un data block…` | [x] |
| @s16 | `@s16 con el atributo disabled puesto, el recurso no se pide` | [x] |
| @s17 | `@s17 un data: URL no contacta con nadie` | [x] |
| @s18 | `@s18 en %s, %s no se detecta (%s)` (5 filas) | [x] |
| @s19 | `@s19 con allowlist [] se devuelven los dos orígenes detectados` | [x] |
| @s20 | `@s20 la allowlist tapa ESE origen y solo ESE` | [x] |
| @s21 | `@s21 el resultado NO es la lista vacía` | [x] |
| @s22 | `@s22 una allowlist que no casa deja pasar los dos orígenes` | [x] |
| @s23 | `@s23 con un <script src> a %s se detectan %i (%s)` (8 filas) | [x] |
| @s24 | `@s24 %s → %i orígenes (%s)` (8 filas) — **asevera EL ORIGEN, no solo la cuenta** | [x] |
| @s25 | 2 tests (los 4 campos · determinismo y MISMO ORDEN) | [x] |
| @s26 | `@s26 url(%s) → código de salida %i` (6 filas) | [x] |
| @s27 | 3 tests (sin base · base `/` · 4 filas de base ilegal) | [x] |
| @s28 | `@s28 los 6 @font-face esperados, sin origen externo y sin base: código 0` | [x] |
| @s29 | `@s29 el CSS %s → rompe el build y acusa "%s"` (6 filas) + sin ningún `@font-face` | [x] |
| @s30 | `@s30 con el artefacto PERFECTO y la lista vacía, la puerta rompe igual` | [x] |
| @s31 | `@s31 con 0 recursos html o css, la puerta rompe y declara que no inspeccionó nada` | [x] |
| @s32 | `@s32 si leerArtefacto LANZA … la puerta rompe con el motivo` | [x] |
| @s33 | `@s33 con el artefacto LIMPIO, si leerConfigVite LANZA…` | [x] |
| @s34 | `@s34 con .js y .woff2 presentes en dist/ … sale VERDE` | [x] |
| @s35 | `@s35 con la canónica y el JSON-LD de F-04 y el <a href> a Facebook de F-12…` | [x] |
| @s36 | 2 tests (`build` invoca DESPUÉS de vite-react-ssg · `dev`/`dev:ssr` NO invocan) | [x] |
| @s37 | `@s37 el @font-face de %s (%i)…` (4 filas) + **el CSS MINIFICADO REAL de dist/** | [x] |
| @s38 | 2 tests (ancla contra literal a mano · `.length > 0`) | [x] |
| @s39 | 3 tests (allowlist vacía · literal vacío · referencia A-23) | [x] |
| @s40 | 4 tests (filtro · no pasa lo que no casa · A-27 · **F-05 no toca el humilde de F-01**) | [x] |

---

## 2. 🔴 LOS SABOTAJES — **REPRODUCIDOS POR MÍ, NO CREÍDOS**

El craftsman confiesa que **@s5-@s8, @s19-@s23 y @s28-@s34 NACIERON VERDES** (producción antes del
test rojo) y dice haberlo compensado con 19 sabotajes a mano. **No le creí. Apliqué 30 mutantes yo**
(`git checkout` tras cada uno; tree final limpio, verificado por md5 contra HEAD).

**RESULTADO: 30/30 MUERDEN. 0 SUPERVIVIENTES.** Y en cada caso **cae exactamente el test que debe
caer**.

### 2.1 El eje `rel` (@s5-@s8 — nacidos verdes)

| Sabotaje | Rojos | Tests que caen |
| --- | --- | --- |
| `rel` **sin `split`** (compara la CADENA, no el CONJUNTO) | **4** | @s6 + @s7 (TAB, caja alta, caja mixta) |
| `rel` **sin `.toLowerCase()`** (`MethodExpression`) | **4** | @s7 ×4 |
| **`rel.split(' ')`** en vez de ASCII whitespace | **1** | @s7 fila **TAB** — el falso negativo que @s6 existe para cerrar |
| **LISTA NEGRA** (`startsWith('http://')`) en vez de lista blanca de esquemas | **8** | @s4, @s8 ×3, @s9 ×2, @s24, @s26 |
| Extractor `url()` **con un bug que no encuentra nada** | **16** | @s4, @s5, @s8, @s24, @s26… |
| Extractor de **etiquetas con un bug que no encuentra nada** | **44** | @s1 ×14, @s2, @s3… |

### 2.2 El eje allowlist (@s19-@s23 — nacidos verdes)

| Sabotaje | Rojos | Tests que caen |
| --- | --- | --- |
| **`FilterRemoval`**: el `.filter` se elimina | **2** | **@s20 + @s23 fila 1** ← **confirma la reparación del contrato** |
| **`BooleanLiteral`**: se quita la negación | **61** | No es equivalente ni de lejos. **Excluirlo sería fraudulento** |
| El humilde **embarca `['fonts.googleapis.com']`** | **2** | @s39 |
| El humilde **borra la referencia A-23** | **1** | @s39 |

### 2.3 El eje puerta (@s28-@s34 — nacidos verdes)

| Sabotaje | Rojos | Tests que caen |
| --- | --- | --- |
| 🔴 **`ArrayDeclaration` REAL: `PARES_DE_FUENTE_ESPERADOS` → `[]`** | **2** | **LAS DOS SON @s38. @s30 SE QUEDA VERDE.** |
| Se quita la **guarda de la guarda** (lista de pares vacía) | **1** | @s30 |
| Se quita la **guarda del extractor** (0 recursos) | **1** | @s31 |
| El `catch` **se traga la excepción y devuelve VERDE** | **2** | @s32 + @s33 |
| `LogicalOperator` (Y lógico → O lógico) en la comparación del par | **6** | @s29 |
| La guarda de fuentes **no acusa nada** | **7** | @s28 + @s29 |
| La puerta **deja de aseverar la config `base`** | **4** | @s27 |
| Extractor `@font-face` **con un bug que no encuentra nada** | **24** | @s26, @s27, @s28, @s29… |
| **Destokenización ingenua** de la familia (partir por espacios) | **22** | @s37 + arrastre |
| **No se quitan las comillas** de la familia | **23** | @s37 + arrastre |
| El humilde **pierde el filtro de extensión** | **1** | @s40 |
| El humilde **borra TODAS las referencias A-27** | **1** | @s40 |

> 🔴 **EL HALLAZGO QUE IMPORTA, Y LO CONFIRMO CONTRA EL LEAD Y A FAVOR DEL CRAFTSMAN:**
> **`ArrayDeclaration` sobre `PARES_DE_FUENTE_ESPERADOS` lo mata @s38 y SOLO @s38.** Lo medí:
> **2 rojos, los dos @s38; @s30 se queda VERDE.** El contrato afirmaba TRES VECES que lo mataba
> @s30: **era falso**, la ronda de reparación lo corrigió, y **sin @s38 el mutante sería INMORTAL
> con `break: 100` y la feature no cerraría.** La excepción anti-tautología de @s38 **está
> justificada y es LOAD-BEARING**, no un capricho.

### 2.4 NO VACUIDAD — *«¿de cuántas maneras puede esta puerta estar verde sin proteger nada?»*

Ataqué las **seis** vías. **Las seis rompen el build:**

| Vía de vacuidad | ¿La puerta se entera? |
| --- | --- |
| `dist/` **vacío** / 0 recursos | ✅ @s31 — «no se inspeccionó ningún recurso» |
| **0 CSS** / **0 `@font-face`** | ✅ @s29 — acusa los 6 pares que faltan |
| **Filtro de extensión sin coincidencias** | ✅ @s31 (0 recursos) + @s40 (ancla el filtro) |
| **Lista de pares vacía** (la guarda de la guarda) | ✅ @s30 |
| 🔴 **EL EXTRACTOR CON UN BUG QUE NO ENCUENTRE NADA** | ✅ **24 / 16 / 44 rojos** en los tres extractores |
| **El detector devuelve siempre `[]`** («protege» sin mirar) | ✅ **60 rojos** |

**El objeto vigilado ES el extractor, no el sitio.** Verificado: los tres extractores
(`BLOQUE_FONT_FACE`, `URL_CSS`, `ETIQUETA`) mueren si dejan de casar.

---

## 3. Disciplina TDD

- **¿Producción sin test que la pida?** **NO.** Lo verifiqué **empíricamente, no por narrativa**:
  cada línea de decisión que saboteé pone rojo un test. No hay alcance inflado. Los dos `trim()`
  omitidos, la ausencia de `existe*` y la ausencia de `default` en `allowlist` son **decisiones
  razonadas para no crear mutantes equivalentes**, no atajos.
- **¿Evidencia de Rojo→Verde→Refactor?** **PARCIAL, Y ESTÁ CONFESADO.** El craftsman declara —en vez
  de disimular— que **rompió la Ley 3 tres veces**: @s5-@s8, @s19-@s23 y @s28-@s34 **nacieron
  verdes**. **Es deuda de proceso REAL** (§5). **Pero el remedio que prescribe `docs/verification.md`
  es el SABOTAJE, y lo apliqué YO: 30/30 muerden, 0 supervivientes.** Un test que nace verde y
  **nadie** sabotea no demuestra nada; **éstos están saboteados y verificados por un tercero.** Es la
  evidencia más fuerte que se puede producir *a posteriori*, y **es más fuerte que fiarse del orden
  de los commits**.

---

## 4. Calidad (lente de artesano)

- **Arquitectura (`docs/architecture.md`): CORRECTA.** Dos capas limpias. Decisores puros
  (`src/lib/terceros.ts`, `src/lib/puerta-terceros.ts`): sin `node:fs`, sin reloj, sin `process.env`.
  Humilde (`tools/puerta-terceros.ts`): cablea `fs`/`process`, **no decide nada**.
- **El puerto LANZA donde el real lanza** (lección @s20 de F-01): **verificado**.
  `puerta-terceros.test.ts:97-109` — los dobles de `leerArtefacto`/`leerConfigVite` **lanzan**.
  **Ningún doble devuelve `[]` donde el real lanza.** @s32/@s33 lo anclan, y el sabotaje del `catch`
  que se traga la excepción lo confirma (2 rojos).
- **ANTI-TAUTOLOGÍA: LIMPIA.** `terceros.test.ts:3` importa **solo** `detectarOrigenesExternos` + un
  tipo. **La única constante de producción importada es `PARES_DE_FUENTE_ESPERADOS`, y SOLO en
  @s38**, fijada contra un literal escrito a mano (`puerta-terceros.test.ts:630-640`), forma @s27 de
  F-04 / `RUTAS_ESPERADAS`. **La excepción legítima está bien hecha y no se ha colado ninguna otra**:
  `grep` de `KEYWORDS_DE_*` / `ESQUEMAS_DE_RED` / `HOST_PROPIO` / `BASE_PROPIA` / `CODIGO_*` en los
  tests → **0**. Los 14 códigos de salida se aseveran con **literales** (`toBe(0)` / `not.toBe(0)`).
- **`perTest`: LIMPIO.** Verificado línea a línea: **las 45 llamadas a producción están DENTRO de un
  `it`**. Los fixtures son **funciones**, no constantes del `describe`. (En F-03 calcular en el
  `describe` dio **189 supervivientes FALSOS**.) `stryker.config.json` trae los **dos** ficheros
  nuevos en `mutate`, `coverageAnalysis: perTest` y `break: 100`.
- **A-24 — NINGUNA ATRIBUCIÓN NORMATIVA FALSA.** Auditado el código, los tests, el humilde y
  `main.tsx`: `22.2`→0 · `LSSI`→0 · `sin cookies`→0 · `banner`→0 · `CMP`→0 · `AEPD`→0 · `RGPD`→0 ·
  `corresponsabilidad`→0. La **única** mención a «Fashion ID» (`terceros.test.ts:403`) es
  **NEGATIVA** («**NO** se puede prohibir invocando Fashion ID»), que es justo lo que el contrato
  manda anclar. Los 5 «obliga*» son «escenario OBLIGATORIO», **no** normativos. La justificación de
  `main.tsx` y `puerta-terceros.ts:9-14` es **criterio de proyecto**, literal.
- Funciones cortas, un motivo para cambiar, nombres reveladores, sin números mágicos
  (`CODIGO_EXITO`/`CODIGO_FALLO`/`BASE_PROPIA`). Sin `console.log` de debug, sin TODOs.
  `pnpm typecheck` y `pnpm lint` en verde.

### «Verde ≠ funciona» — **el artefacto CRUDO, medido por mí** (`readFileSync`+string, JAMÁS jsdom)

| Medición sobre el `dist/` real | Resultado |
| --- | --- |
| `.woff2` en `dist/assets` | **6** ✅ (+ 6 `.woff` = 12 ficheros, 6 pares) |
| `url()` con esquema `http(s)` en el CSS | **0** ✅ |
| `url(//` protocol-relative | **0** ✅ |
| `googleapis` / `gstatic` en TODO `dist/` | **0** ✅ |
| `wght@300` / `wght@` | **0** ✅ |
| `@font-face` en el CSS | **6** ✅ |
| Los 12 `url()` | **TODOS root-absolutos `/assets/…`** ✅ |
| Subsets no-latin (`latin-ext`/`cyrillic`/`greek`/`vietnamese`) | **0** ✅ (A-28) |
| Familias horneadas | `Manrope`, `Gilda Display`, `Great Vibes` ✅ |

🔴 **Confirmo el `[I]` que el craftsman midió: Vite emite `font-family:Gilda Display` SIN COMILLAS y
CON EL ESPACIO.** El riesgo de @s37 era **real**, y la destokenización ingenua muere (22 rojos).

### Coherencia con las 4 features `done`

`pnpm build` → **exit 0** con **LAS CUATRO PUERTAS**: cascarón ✅ · placeholders ✅ · contraste
(18 pares AA) ✅ · terceros ✅. **F-05 no rompe F-01..F-04.** @s35 lo ancla en test (canónica +
JSON-LD de F-04 + `<a href>` a Facebook de F-12 → VERDE).

### A-27 — **comprobado con `git diff`, no de palabra**

`git diff --stat fc7aa13 HEAD` → **16 ficheros. NI `tools/puerta-placeholders.ts` NI
`features/puerta_placeholders.feature` aparecen.** ✅ La deuda de F-01 **sigue viva y declarada**, y
@s40 tiene un test que la **vigila** (`not.toContain('html|css')` sobre el humilde de F-01).

---

## 5. Hallazgos por gravedad

### 🔴 BLOQUEANTES: **NINGUNO.**

### 🟠 GRAVES (declarados, compensados y verificados — no bloquean)

1. **Ley 3 rota TRES veces** (`progress/tdd_cero_terceros.md:88-98`): @s5-@s8, @s19-@s23 y @s28-@s34
   **nacieron verdes**. **Es deuda de proceso real y no se blanquea.** No bloquea **porque la
   compensación está medida y la reproduje yo** (30/30 muerden, 0 supervivientes) y **porque no
   existe ni una línea de producción sin test que la exija**. **Para F-06: el sabotaje es un remedio
   *a posteriori*, NO una licencia para escribir producción antes del test rojo.**

### 🟡 MENORES

1. **`puerta-terceros.test.ts:714`** — `@s40 … la referencia A-27` usa `toContain('A-27')`, y el
   humilde tiene **2 ocurrencias** de `A-27`: borrar **una** no pone rojo nada (lo medí: **0 rojos**;
   borrando **las dos** → **1 rojo**). El ancla **funciona** para su propósito (que la referencia
   desaparezca del fichero), pero es **más laxa de lo que su título sugiere**. Mismo patrón, sin el
   problema, en `@s39` (`A-23`, 1 sola ocurrencia). **No bloquea**: es la forma declarada del repo
   (`diferidos.test.ts:89-96`).
2. **`progress/history.md` no tiene entrada de F-05** (C5). **No es culpa de F-05** —tampoco la
   tienen F-01..F-04; solo está la del template— y es tarea del **lead al cerrar sesión**, después de
   la mutación.

---

## 6. Checkpoints

- **C1 — El arnés está completo:** [x] ficheros base · docs · `bin/harness init` **exit 0**
- **C2 — El estado es coherente:** [x] **exactamente 1** feature `in_progress` (5 `cero_terceros`) ·
  las 4 `done` con tests verdes · `progress/current.md` describe la sesión activa
- **C3 — El código respeta la arquitectura:** [x] las dos capas de `docs/architecture.md` ·
  3 dependencias nuevas **justificadas y usadas** (`@fontsource/{manrope,gilda-display,great-vibes}`)
  y **2 dadas de baja** (`dm-sans`, `outfit`: herencia muerta de WebEmpresa) · sin logs ni TODOs
- **C4 — La verificación es real:** [x] test por módulo · **sin mocks de `fs`**: puros + dobles del
  puerto que **lanzan como el real** · `bin/harness test` → **568 verdes**
- **C5 — La sesión se cerró bien:** [ ] **pendiente del lead** — sin untracked sospechosos, pero
  falta la entrada en `progress/history.md` y el paso a `done` (que **NO** puede darse hasta C7)
- **C6 — Contrato Gherkin:** [x] `.feature` + sección en `project-spec.md` · @s1..@s40 tagueados con
  `Then` medibles · **mapa @s → test completo (40/40, verificado por título de `it()`)** · **sin
  producción que ningún test exija**
- **C7 — Prueba de mutación:** [ ] **NO ES MI PUERTA** — la valida el `mutation_tester`, que corre
  **ahora, en paralelo**. **No corrí Stryker**: dos tandas sobre el mismo repo comparten
  `.stryker-tmp` y se envenenan **en silencio** (score inventado; coste medido en F-04: ~2 h).

---

## 7. Cambios requeridos

**Ninguno bloqueante.** Para futuras features (**no** condicionan esta aprobación):

1. **F-06 en adelante: la Ley 3 se respeta ANTES, no se compensa DESPUÉS.**
2. Si algún día se toca `@s40`: anclar `A-27` contra la ocurrencia **que decide** (la del
   `ES_HTML_O_CSS`), no contra el fichero entero.

---

## 8. Veredicto

**APPROVED.** 40/40 escenarios cubiertos por un test real. **0 bloqueantes**, 1 grave declarado y
compensado (**verificado por mí**), 2 menores.

**El craftsman le corrigió al lead DOS veces y tenía razón las dos** (`FilterRemoval` → @s20 **y**
@s23 fila 1; `ArrayDeclaration` → **@s38, no @s30**). **Lo remedí yo y confirmo las dos.** Y una
tercera: **no escribió el `font-family` de uso que el brief del lead le pedía, porque el contrato lo
prohíbe.** Hizo bien: manda el contrato.

**F-05 NO se marca `done` hasta que el `mutation_tester` cierre C7 con score 1.0 y 0 exclusiones
(A-23).** Si sobrevive un mutante —incluido cualquier `Regex`— **se ESCALA AL HUMANO**: no se
excluye, no se justifica, no se baja el umbral.
