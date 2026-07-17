# F-05 `cero_terceros` — bitácora del TDD (tdd_craftsman, 2026-07-17)

> **Estado: VERDE tras la RONDA 2, a la espera del `judge` y de la REMEDICIÓN del `mutation_tester`.**
> **NO se ha marcado `done`, y NO se ha corrido Stryker** (lo corre el `mutation_tester`: nunca dos
> tandas a la vez).
>
> **RONDA 2 (2026-07-17):** `pnpm typecheck` ✅ 0 errores · `pnpm lint` ✅ 0 errores 0 warnings ·
> `pnpm test` ✅ **576/576** (partían de **568** → **8 nuevos**) · `pnpm build` ✅ **exit 0 con las
> CUATRO puertas**. **43/43 escenarios cubiertos.**

---

# 🔴 RONDA 2 — LOS 10 SUPERVIVIENTES, MUERTOS CON CONTRATO Y CON PRODUCCIÓN INTACTA

**La mutación NO encontró código de más: encontró CONTRATO DE MENOS.** El humano amplió el contrato
de **40 a 43 escenarios** (3 filas nuevas + `@s41`/`@s42`/`@s43`) y **decidió expresamente que las
guardas defensivas SON CORRECTAS Y SE QUEDAN**. Esta ronda **no ha tocado ni una línea de `src/`**:
solo tests. `git status` de producción: **LIMPIO** (verificado tras cada sabotaje).

## Qué se ha añadido — SOLO lo nuevo

| `@s` | Dónde | Tests |
| --- | --- | --- |
| **@s1** (+2 filas) | `src/lib/terceros.test.ts` | `<img src="…/a b.png">` (**espacio en la URL**) y `<img src = "…">` (**espacios en el `=`**) → el `it.each` pasa de **14 a 16 filas** |
| **@s9** (+1 fila) | `src/lib/terceros.test.ts` | `@s9 con <base href="http://[">, la base NO PARSEA…` |
| **@s41** (nuevo) | `src/lib/terceros.test.ts` | `@s41 %s no lanza y no detecta ningún origen (%s)` (**3 filas**) |
| **@s42** (nuevo) | `src/lib/terceros.test.ts` | `@s42 con <base> seguido de <base href> a un tercero, a.png es una petición al tercero` |
| **@s43** (nuevo) | `src/lib/puerta-terceros.test.ts` | `@s43 el @font-face inline de dist/index.html no entra en el conjunto…` |

## 🔴 ROJO PRIMERO, DE VERDAD: los 10 mutantes, uno a uno

**La producción YA EXISTÍA, así que un test nuevo PUEDE NACER VERDE Y NO SIGNIFICAR NADA.** Por eso
el criterio no es «el test pasa», sino **«el test SE PONE ROJO con su mutante aplicado a mano»**.
Cada mutante: aplicado al fichero real → suite del fichero → **revertido**. **10/10 muertos, y cada
uno POR EL TEST QUE SE DISEÑÓ PARA ÉL** (ni uno por casualidad ni por daño colateral):

| # | Mutante | Test que se pone ROJO | Rojos |
| - | ------- | --------------------- | ----- |
| 1 | `terceros.ts:257` `ConditionalExpression` `(rel!==undefined && href!==undefined)` → `true` | @s41 filas 1 **y** 2 | **2** |
| 2 | `terceros.ts:257` `ConditionalExpression` `rel !== undefined` → `true` | @s41 fila 1 | **1** |
| 3 | `terceros.ts:257` `LogicalOperator` `(rel!==undefined \|\| href!==undefined) && …` | @s41 filas 1 **y** 2 | **2** |
| 4 | `terceros.ts:258` `ConditionalExpression` `href !== undefined` → `true` | @s41 **fila 2** (la del `<base>` al tercero) | **1** |
| 5 | `terceros.ts:240` `ConditionalExpression` `if (href !== undefined)` → `if (true)` | **@s42** | **1** |
| 6 | `terceros.ts:241` `OptionalChaining` `URL.parse(href, RAIZ_PROPIA)?.href` → `.href` | **@s9 fila 4** | **1** |
| 7 | `terceros.ts:278` `ConditionalExpression` `nombre === ATRIBUTO_SRCSET ? …` → `true ? …` | **@s1 fila `a b.png`** | **1** |
| 8 | `terceros.ts:299` `ConditionalExpression` `url === null \|\| …` → `false \|\| …` | **@s41 fila 3** | **1** |
| 9 | `terceros.ts:58` `Regex` `ATRIBUTO` `\s*=\s*` → `\S*=\s*` | **@s1 fila `src = "…"`** | **1** |
| 10 | `puerta-terceros.ts:159` `ConditionalExpression` `if (recurso.tipo === TIPO_CSS)` → `if (true)` | **@s43** | **1** |

**Las tres trampas de método del informe (§3), confirmadas al reproducirlas:**

1. **La precedencia**: el mutante nº 3 se aplicó **PARENTIZADO** (`(a || b) && c && d`), como manda
   el informe. Copiar el diff literal de Stryker habría dado otro mutante, más fuerte, que mata 5
   tests y habría «desmentido» un superviviente real.
2. **Las barras invertidas**: el mutante nº 9 se construyó con `String.fromCharCode(92)`, no con un
   literal en heredoc. **Y el script PARA si el patrón no se encuentra** — un «patrón no encontrado»
   **no es** un «no sobrevive».
3. **El `<base>` a un tercero de @s41 fila 2 y los DOS `<base>` de @s42 NO son decoración**: medido,
   con la base propia o con un solo `<base>` los mutantes 4 y 5 son **indistinguibles**.

### 🔴🔴 LA REGLA DEL ARNÉS MORDIÓ POR CUARTA VEZ — Y ESTA VEZ EN MI PROPIO SABOTAJE

**La primera tanda de sabotajes cantó «0/10, SOBREVIVEN LOS DIEZ», con `rojos: 0` en los diez —
incluidos mutantes que provocan un `TypeError` seguro. ERA FALSO, Y POR UNA MEDICIÓN ROTA:**
`--reporter=basic` **NO EXISTE en Vitest 4** (se eliminó). El reporter no cargaba, `vitest` salía
con código ≠ 0 **sin ejecutar NI UN TEST**, y el script leía «0 fallos» → «SOBREVIVE».

**Es la misma especie exacta que el «100 %, 0 survived» con 152 timeouts de la tanda #1**: *una
medición rota que parece un resultado*, y **que además apuntaba en la dirección cómoda** («no hay
nada que hacer»). Se cazó **porque el resultado era imposible por construcción**, no porque el
script avisara. **Remedio, ya aplicado en el script**: reporter `json` a fichero, el veredicto se
lee **del informe y no del código de salida**, y **PARA si `casos.length === 0`**. Con la medición
honesta: **10/10 muertos**, y **82 / 44 tests ejecutados** en cada tanda.

> **La lección, por si vuelve:** *un sabotaje que da el resultado que te conviene se verifica igual
> de duro que uno que no.* **`ejecutados > 0` es la mitad del veredicto.**

## Lo que esta ronda NO ha hecho, a propósito

- **NO ha tocado `src/`.** Las guardas se quedan **tal cual**: el humano aprobó **el código**; lo que
  creció es **el contrato**. `git status` de `src/lib/terceros.ts` y `src/lib/puerta-terceros.ts`:
  **limpio**.
- **NO ha corrido Stryker.** La remedición la hace el `mutation_tester`, **solo** y a
  `--concurrency 1`.
- **NO ha excluido ni justificado ningún mutante.** Umbral **1.0, 0 exclusiones** (A-23), y **no ha
  hecho falta ninguna licencia: los 10 se matan CON CONTRATO.**
- **NO ha marcado `done`.**

---

# RONDA 1 — la implementación original (40 escenarios)

## La puerta, verificada antes de escribir nada

Las dos mitades que el arranque exige, comprobadas por mí:

- `features/cero_terceros.feature:6` → «✅ **APROBADO POR LA PUERTA HUMANA EL 2026-07-17**».
- `feature_list.json` §5 → `"status": "in_progress"` **y** campo `puerta_humana` con el acta
  (A-23, A-24, A-27, A-28).

Cuadran, y la marca `⏸` de F-03 no está. **Se implementa.**

## Qué se ha construido

| Fichero | Qué | ¿`mutate`? |
| --- | --- | --- |
| `src/lib/terceros.ts` | `detectarOrigenesExternos(recursos, allowlist)` — **puro**. `allowlist` es **PARÁMETRO SIN `default`**. | **SÍ** (añadido) |
| `src/lib/puerta-terceros.ts` | `ejecutarPuertaDeTerceros(peticion)` → `{codigoSalida, lineas}` + **`PARES_DE_FUENTE_ESPERADOS`**. | **SÍ** (añadido) |
| `tools/puerta-terceros.ts` | El humilde: `node:fs`/`node:process`, filtro `/\.(html|css)$/i`, `allowlist: []`, `process.exit`. | **NO** (fuera, como siempre) |
| `src/main.tsx` | Los **6 imports** `@fontsource/<familia>/latin-<peso>.css`. | NO (convención) |
| `package.json` | Baja de `@fontsource/dm-sans` y `@fontsource/outfit`; alta de las 3 familias reales; puerta encadenada en `build` **después** de `vite-react-ssg build`. **`dev` intacto.** | — |
| `stryker.config.json` | **Los dos ficheros nuevos en `mutate`.** Sin esto el 100 % sería vacío. | — |

## Trazabilidad `@s → test` (por título de `it()`)

Los 40 escenarios del contrato tienen test. Ni uno añadido, ni uno borrado, ni uno reinterpretado.

> **RONDA 2:** el contrato es ahora **@s1..@s43**, y **@s41/@s42/@s43 + las 3 filas nuevas de
> @s1/@s9 están en la tabla de la ronda 2, arriba**. Las cuentas de tests de esta sección son las de
> la ronda 1 (**75** en el detector, **43** en la puerta); tras la ronda 2 son **82** y **44**.

### `src/lib/terceros.test.ts` — el detector (75 tests)

| `@s` | Título del `it()` |
| --- | --- |
| @s1 | `@s1 <marcado> se detecta como petición automática a cdn.tercero.com` (**14 filas**) |
| @s2 | `@s2 <link rel="%s"> a un tercero se detecta (%s)` (6 filas) |
| @s3 | `@s3 <link rel="%s"> a un tercero se detecta: el tercero recibe la IP igual` (2 filas) |
| @s4 | `@s4 %s se detecta contra %s` (4 filas) |
| @s5 | `@s5 el artefacto %s la clase "jamas-usada": se marca igual` (2 filas) |
| @s6 | `@s6 el conjunto tokenizado de rel contiene "stylesheet": la hoja se pide` |
| @s7 | `@s7 rel=%j se resuelve igual (%s)` (5 filas, incluida la del **TAB U+0009 real**) |
| @s8 | `@s8 en %s, %s se detecta` (3 filas) |
| @s9 | `@s9 con <base href="https://cdn.tercero.com/">, a.png es una petición al tercero — y es 1, no 2` · `@s9 con <base href="/">, a.png resuelve al propio sitio…` · `@s9 el valor declarado es la URL RESUELTA, no el "a.png" literal` |
| @s10 | `@s10 la canónica de F-04 no se detecta: un hyperlink no pide nada` |
| @s11 | `@s11 un feed Atom es un hiperenlace a un recurso alternativo: el navegador no lo pide` |
| @s12 | `@s12 un hiperenlace a Facebook no transmite nada hasta que la usuaria decide ir` |
| @s13 | `@s13 un namespace XML es un identificador, no una dirección` |
| @s14 | `@s14 una URL que viaja como DATO no es una instrucción de carga` |
| @s15 | `@s15 el @context de F-04 no se detecta: un data block no lo procesa el navegador` |
| @s16 | `@s16 con el atributo disabled puesto, el recurso no se pide` |
| @s17 | `@s17 un data: URL no contacta con nadie` |
| @s18 | `@s18 en %s, %s no se detecta (%s)` (5 filas) |
| @s19 | `@s19 con allowlist [] se devuelven los dos orígenes detectados` |
| @s20 | `@s20 la allowlist tapa ESE origen y solo ESE` |
| @s21 | `@s21 el resultado NO es la lista vacía` |
| @s22 | `@s22 una allowlist que no casa deja pasar los dos orígenes` |
| @s23 | `@s23 con un <script src> a %s se detectan %i (%s)` (**8 filas**) |
| @s24 | `@s24 %s → %i orígenes (%s)` (**8 filas**) |
| @s25 | `@s25 cada origen declara SU ubicación, SU construcción, SU origen y SU valor` · `@s25 dos llamadas con los mismos recursos dan listas idénticas, elemento a elemento y EN EL MISMO ORDEN` |

### `src/lib/puerta-terceros.test.ts` — la puerta (43 tests)

| `@s` | Título del `it()` |
| --- | --- |
| @s26 | `@s26 url(%s) → código de salida %i` (6 filas) |
| @s27 | `@s27 un vite.config.ts que no declara base…` · `@s27 base declarada exactamente "/"…` · `@s27 base "%s" rompe el build con una línea propia que NOMBRA vite.config.ts` (4 filas) |
| @s28 | `@s28 los 6 @font-face esperados, sin origen externo y sin base: código 0 y ninguna violación` |
| @s29 | `@s29 el CSS %s → rompe el build y acusa "%s"` (6 filas) · `@s29 un CSS sin ningún @font-face acusa los 6 pares que faltan: dist/ vacío NO es dist/ limpio` |
| @s30 | `@s30 con el artefacto PERFECTO y la lista vacía, la puerta rompe igual y lo declara` |
| @s31 | `@s31 con 0 recursos html o css, la puerta rompe y declara que no inspeccionó nada` |
| @s32 | `@s32 si leerArtefacto LANZA, como readdirSync cuando dist/ no existe, la puerta rompe con el motivo` |
| @s33 | `@s33 con el artefacto LIMPIO, si leerConfigVite LANZA la puerta rompe con el motivo` |
| @s34 | `@s34 con .js y .woff2 presentes en dist/, la puerta que solo recibe html y css sale VERDE` |
| @s35 | `@s35 con la canónica y el JSON-LD de F-04 y el <a href> a Facebook de F-12, el build es VERDE` |
| @s36 | `@s36 el script "build" invoca la puerta de terceros DESPUÉS de vite-react-ssg build` · `@s36 el script "%s" NO invoca la puerta de terceros` (dev, dev:ssr) |
| @s37 | `@s37 el @font-face de %s (%i) declarado como %s se reconoce (%s)` (4 filas) · `@s37 el CSS MINIFICADO REAL de dist/ (sin comillas, sin espacios) se reconoce igual` |
| @s38 | `@s38 los pares de fuente del diseño real son exactamente los 6 medidos sobre el prototipo` · `@s38 PARES_DE_FUENTE_ESPERADOS no está vacía…` |
| @s39 | `@s39 el humilde pasa a la puerta una allowlist exactamente vacía` · `@s39 el humilde no declara ningún origen permitido: el literal de la allowlist está vacío` · `@s39 el humilde declara por escrito la referencia A-23…` |
| @s40 | `@s40 el humilde declara el filtro de extensión /\.(html|css)$/i` · `@s40 el humilde no pasa a la puerta ningún fichero que no case ese filtro` · `@s40 el humilde declara por escrito la referencia A-27` · `@s40 F-05 NO toca el humilde de F-01: la deuda de binarios sigue declarada` |

---

## 🔴 HONESTIDAD DE PROCESO: dónde me salté la Ley 3, y qué hice al respecto

**Se declara en vez de disimularse.** El ciclo Rojo→Verde fue limpio en @s1, @s2, @s3, @s4, @s9,
@s16, @s26/@s27 (módulo ausente → import roto → rojo) y en @s39. **Pero en tres puntos escribí más
producción de la que el test rojo de turno exigía:**

1. **La tokenización de `rel`** (`split` + `toLowerCase`) se escribió en el ciclo de **@s2**, donde
   una simple pertenencia a un conjunto habría bastado → **@s6 y @s7 nacieron VERDES**.
2. **El filtro de la allowlist** (`.filter(o => !allowlist.includes(o))`) se escribió en el ciclo de
   **@s1**, donde ningún test lo pedía → **@s19..@s23 nacieron VERDES**.
3. **La puerta entera** se escribió en el ciclo de **@s26** → **@s28..@s34 nacieron VERDES**.

`docs/tdd.md` es explícito: *«Un test que pasa a la primera no demuestra nada: ajústalo o sospecha
del montaje»*. **El remedio que aplica `docs/verification.md` es el SABOTAJE** (*«Verifica por
SABOTAJE, que no depende de Stryker: aplica a mano un mutante y corre la suite»*). Lo hice sobre
**todos** los ejes nacidos verdes, y **todos muerden**:

| Sabotaje aplicado a mano | Tests en rojo | Qué demuestra |
| --- | --- | --- |
| `rel` sin `split` (se compara la CADENA, no el CONJUNTO) | **4** | @s6 + @s7 filas 3-5: la regla del conjunto tokenizado está anclada |
| `rel` sin `.toLowerCase()` | **4** | @s7 filas 1-4 — es el `MethodExpression` que el mapa mutante asigna a @s7 |
| `rel.split(' ')` en vez de ASCII whitespace | **1** | @s7 fila TAB: el falso negativo que @s6 existe para cerrar |
| Lista negra `https?://` en vez de lista blanca de esquemas | **4** | @s8: protocol-relative anclado |
| **`FilterRemoval`**: `.filter(p)` → `encontrados` | **2** | **@s20 + @s23 fila 1** |
| **`BooleanLiteral`**: quitar el `!` | **57** | No es equivalente ni de lejos. **Excluirlo sería fraudulento** |
| allowlist laxa con `endsWith` | **1** | @s23 fila `evil-fonts.googleapis.com` |
| allowlist laxa con `includes` | **4** | @s23 filas atacantes |
| allowlist laxa con `startsWith` | **2** | @s23 filas atacantes |
| Se quita la guarda de la lista vacía | **1** | @s30 |
| Se quita la guarda del extractor | **1** | @s31 |
| La guarda de fuentes no acusa nada | **7** | @s28 + @s29 |
| El `catch` se traga la excepción y devuelve VERDE | **2** | @s32 + @s33: falla cerrada |
| El `catch` solo envuelve el artefacto | **5** | @s33: la mitad de la puerta desactivada |
| `LogicalOperator` `&&`→`||` en la comparación del par | **6** | @s29 |
| **`ArrayDeclaration` REAL: `PARES_DE_FUENTE_ESPERADOS` → `[]`** | **2, y las 2 son @s38** | **@s30 NO lo mata. Sin @s38 sería INMORTAL** |
| El humilde embarca `['fonts.googleapis.com']` | **2** | @s39 |
| El humilde pierde el filtro de extensión | **1** | @s40 |
| El humilde borra la referencia `A-23` | **1** | @s39 |

**Dos correcciones del contrato quedan CONFIRMADAS por medición propia e independiente:**

- **`FilterRemoval` NO lo mata «@s20 y SOLO @s20»**: el sabotaje da **2 rojos** — @s20 **y la 1ª
  fila de @s23**. La reparación del contrato era correcta.
- **`ArrayDeclaration` sobre la constante lo mata @s38, NO @s30**: el sabotaje da **2 rojos y los
  dos son @s38**; @s30 se quedó **verde**. La reparación del contrato era correcta, y sin @s38 la
  feature no cerraría.

---

## Decisiones de diseño (y por qué)

### 1. 🔴 La clasificación la hace el parser WHATWG de URL, no un regex escrito a mano

Las URL se resuelven contra un **sentinela** (`https://propio.invalid/`, TLD reservado RFC 2606) y
se clasifican con `URL.parse`. Así, **sin una sola regla escrita a mano**, caen solos: root-absoluto
(@s18), relativo (@s18), `#ancla` (@s18), `tel:` (@s18), `data:` (@s17), **protocol-relative**
(@s8) y la resolución contra `<base href>` (@s9). Es la **lista blanca de esquemas** que el contrato
exige (`['http:', 'https:']`), y no una lista negra — que es exactamente lo que la verificación
prohíbe. **Medido antes de escribir el código**: los 8 casos del contrato salen correctos.

### 2. 🔴 Ni un regex con mutantes que no sepa matar — y se midieron TODOS con weapon-regex 1.3.6

El contrato avisa de que el `Regex` ha dejado supervivientes reales en este repo **dos veces**.
En vez de escribir y rezar, **enumeré los mutantes de cada patrón candidato con la weapon-regex
1.3.6 instalada, antes de elegir** (reproduje primero el hecho del contrato: `/\s+/` → 2 mutantes):

| Patrón candidato | Mutantes | Decisión |
| --- | --- | --- |
| `url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)` | **10** | ❌ **DESCARTADO**: incluye el `\s*`→`\S*` del cierre que el contrato declara **genuinamente equivalente** |
| **`url\(([^)]*)\)`** | **2** | ✅ **ELEGIDO**: los dos mueren en cualquier fila EXTERNA de @s24. Las comillas se quitan con operaciones de cadena |
| `[\t\n\f\r ]+` (tokenizar `rel`) | 2 | ❌ el `+`→`` es **equivalente para la pertenencia al conjunto** (medido y confirmado por el contrato) |
| **`[\t\n\f\r ]`** (sin cuantificador) | **1** | ✅ **ELEGIDO**: el `+` era decoración que nunca cambió la respuesta; su único efecto era parir un mutante equivalente |
| **`\bdisabled\b`** | **0** | ✅ **ELEGIDO** (@s16) |
| **`@font-face([^}]*)\}`** | **2** | ✅ sirve para las dos formas reales (`@font-face {` y la minificada `@font-face{`) con un solo fixture |
| **`([a-z-]+):([^;}]*)`**, **`\bbase:([^,\n]*)`** | 4 / 2 | ✅ todos mueren |

**Esto NO es esquivar a Stryker: es no escribir código muerto.** El `+` de la tokenización y una
alternancia de comillas de 10 mutantes **no cambiaban ni una respuesta del contrato**. La regla que
seguí: *un mutante que no se sabe matar no se excluye — se evita no escribiéndolo.*

### 3. 🔴 Dos `trim()` que NO escribí, porque habrían sido código muerto → mutantes equivalentes

**Medido**: el parser WHATWG **ya descarta los espacios que envuelven** (`URL.parse(' https://x ')`
→ host `x`), y `Number(' 400')` **ya es 400**. Un `trim()` en el `url()` del CSS o en el peso sería
**código muerto**, y código muerto es un `MethodExpression` (`trim` → eliminado) **equivalente
escrito a propósito**. El `trim()` de la **familia** sí está, porque ahí **sí** se observa
(` 'Manrope'` ≠ `Manrope`) y muere.

### 4. El puerto: dos campos sueltos, y **F-05 NO lleva `existe*`** (forma F-03)

Como manda el contrato. Si `dist/` no existe, `readdirSync` **lanza**, el `catch` falla cerrada con
el motivo, y **ningún escenario exige una línea distinta** → un `existe*` sería producción sin test
rojo y un mutante inmortal. **El doble del test LANZA donde el real lanza** (@s32, @s33).
**Verificado end-to-end**: con `dist/` movido, la puerta real da exit 1 con el `ENOENT`.

### 5. `@font-face` sin `font-family` o sin `font-weight`: **no se adivina**

`String(mapa.get(...))` en vez de `?? ''`. Ningún escenario fija una regla de defaulting
(`font-weight` ausente → 400) y **no se inventa**: sería producción sin test rojo, la misma razón por
la que F-05 no lleva `existe*`. Un bloque malformado da un par que no casa → **rompe el build**.
Ante la duda, **BUILD ROTO**. De paso, evita un literal y una rama que ningún test observaría.

---

## Los hechos del contrato, RE-MEDIDOS por mí (no heredados)

| Hecho del contrato | Mi medición | ¿Cuadra? |
| --- | --- | --- |
| Las 6 rutas `latin-<peso>.css` existen y son las únicas válidas | las 6 existen | ✅ |
| **119.540 bytes** en 6 woff2 | 14108+14044+14172+14212+20204+42800 = **119.540** | ✅ **a la unidad** |
| El `.woff2` más pequeño de **las seis de F-05** mide **14.044 B** (3,4× el límite de 4096) | `manrope-latin-500-normal.woff2` = **14.044** | ✅ **confirma la corrección del contrato** sobre el 6.192 B de la verificación (era de `outfit`, la dep que F-05 da de baja) |
| `latin-400.css`: 1 `@font-face`, **0 `unicode-range`** | 0 ocurrencias | ✅ (el tofu de A-28 es real y queda declarado) |
| `font-display: swap` sale por defecto | presente en los 6 | ✅ |
| 0 referencias a `googleapis`/`gstatic` en los paquetes | 0 | ✅ |
| Vite emite **12 ficheros para 6 pares** (woff2 **y** woff) | 12 en `dist/assets` | ✅ (**por eso @s28 cuenta PARES, no ficheros**) |
| La ruta que emite Vite es **ROOT-ABSOLUTA** | los 12 `url()` son `/assets/…` | ✅ |
| `/\s+/` → 2 mutantes weapon-regex | 2 (`\s`, `\S+`) | ✅ |
| Stryker 9.6.1 tiene **16 mutadores**; `includes` **no se muta** | `allMutators` = 16; 22 claves, ninguna `includes` | ✅ |
| `ArrayDeclaration`: array no vacío → `[]`; vacío → `["Stryker was here"]` | confirmado en el código instalado | ✅ |

### 🔴 El `[I]` de @s37, MEDIDO — y era un riesgo REAL

El contrato ordena medirlo, no suponerlo. **Medido sobre un `pnpm build` real**, la forma del CSS de
`dist/` es:

```
@font-face{font-family:Manrope;font-style:normal;font-display:swap;font-weight:400;src:url(/assets/manrope-latin-400-normal-PaqtzbVb.woff2) format("woff2"),…}
```

→ **VITE SÍ QUITA LAS COMILLAS**: `font-family:Gilda Display` sale **sin comillas y con el espacio**.
La inferencia era correcta **y el riesgo era real**: una destokenización ingenua (partir por
espacios) se habría roto justo ahí. Por eso hay un test extra con **el byte exacto del `dist/` de
hoy**. **No hizo falta volver a la puerta humana: Vite no renombra ni escapa.**

---

## «Verde ≠ funciona»: verificado sobre el artefacto CRUDO, nunca con jsdom

`readFileSync` + aserción de string sobre `dist/` real:

- **Los 12 `.woff2`/`.woff` salen a `dist/assets`** ✅
- **El CSS los referencia sin esquema `http(s)`**: `grep -o "https\?://" dist/assets/*.css` → **0** ✅
- **0 `url(//` protocol-relative** ✅ · los 12 `url()` son `/assets/…` ✅ · **6 `@font-face`** ✅

Y **la puerta rompe de verdad** (no solo pasa) — probado contra el `dist/` real:

| Sabotaje del artefacto real | Salida |
| --- | --- |
| `@import url(https://fonts.googleapis.com/…)` en el CSS de `dist` | exit **1** — `dist/assets/app-0yEhU914.css — origen externo "fonts.googleapis.com": url(…)` |
| Un `@font-face` de peso **300** (el `wght@300`, **acceptance 4**) | exit **1** — `sobra el par ("Manrope", 300)` |
| `base: 'https://cdn.evil.example/x/'` en `vite.config.ts` | exit **1** — `vite.config.ts — base debe no declararse o ser exactamente "/"` |
| `dist/` no existe | exit **1** — `la puerta de terceros no pudo completar la inspección: ENOENT…` |

---

## Límites DECLARADOS (no cerrados) — deuda honesta, no disimulada

1. **El hueco del JS del bundle** (ya declarado en el contrato): con el alcance `(html|css)`, un
   `fetch('https://tercero…')` desde el bundle **no lo caza esta puerta**. Hoy no existe ninguno [V].
   **Es otra feature, con sus escenarios.**
2. **`srcset` con varios candidatos**: se toma **el primer token**. Ningún escenario monta un
   `srcset` multi-candidato (`a.png 1x, b.png 2x`), así que un parseo completo sería **producción sin
   test rojo** y traería mutantes inmortales (`filter`, `>0`). **Se declara; si hace falta, entra con
   su fila.**
3. **Nombres de etiqueta y atributo en minúsculas**: los regex van **sin flag `i`**. El artefacto lo
   emite Vite/React y viene en minúsculas [V]; el contrato solo exige case-insensitivity en **la
   comparación de keywords de `rel`** (@s7), que sí está. Un `i` obligaría a un `.toLowerCase()`
   sobre nombres que **ningún escenario ejercita** → mutante inmortal.
4. **A-28, el tofu**: un nombre con `Ł`/`ř`/`ğ` pinta tofu sin error. **Decisión de producto del
   humano**, escrita en `src/main.tsx` y en `PARES_DE_FUENTE_ESPERADOS`.
5. **A-27**: F-05 **no ha tocado** `tools/puerta-placeholders.ts`. **La deuda de F-01 sigue viva y
   declarada**, y @s40 tiene un test que lo vigila.

## Lo que este agente NO ha hecho, a propósito

- **No ha corrido Stryker** (lo corre el `mutation_tester`: nunca dos tandas a la vez).
- **No ha marcado `done`** nada en `feature_list.json`.
- **No ha escrito ni un `font-family` de uso**: F-05 hornea los `@font-face`; **aplicarlos es
  F-06/F-07** (el contrato lo dice en «Alcance»). *Nota para el lead: el encargo mencionaba «y el
  `font-family` en el SCSS»; **el contrato lo prohíbe expresamente** y manda el contrato. La guarda
  anti-vacuidad no lo necesita: los 6 `@font-face` llegan a `dist` igual, y está medido.*
- **No ha excluido ni justificado ningún mutante.** Umbral **1.0, 0 exclusiones** (A-23). Si al
  `mutation_tester` le sobrevive uno —incluido cualquier `Regex`— **se escala al humano**.

## Para el `mutation_tester`

- `mutate` ya trae `src/lib/terceros.ts` y `src/lib/puerta-terceros.ts`. Acotar con
  `--mutate <fichero>`, **jamás** con `--testFiles` (0 % falso con este stack).
- **Leer `# timeout` y `tests per mutant` ANTES que el score.** Código puro sin bucles: un timeout
  es ruido de concurrencia, no un mutante muerto.
- **Condicional al diseño, declarado como manda el contrato**: `@s7` mata
  `toLowerCase`⇄`toUpperCase` **porque el diseño SÍ usa `.toLowerCase()`** (verificado por sabotaje:
  4 rojos). El `endsWith`⇄`startsWith` que el mapa asigna a @s23 **NO existe en este diseño**: la
  allowlist compara con `.includes` sobre el origen exacto, que **no se muta** en Stryker 9.6.1. No
  es un hueco: @s23 asevera **comportamiento** (las tres formas ingenuas caen), y lo verifiqué por
  sabotaje (`endsWith` → 1 rojo, `includes` → 4, `startsWith` → 2).
- El `MethodExpression` sobre `trim` de la **familia** muere en @s37; los `trim` del `url()` y del
  peso **no existen** (no se escribieron: eran código muerto).
