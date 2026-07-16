# F-03 `tokens_paleta_contraste` — bitácora del `tdd_craftsman`

## Estado: CERRADO EN VERDE

> **POST-CIERRE (2026-07-16, sesión de higiene).** Los hallazgos 1 y 2 del `judge`
> (no bloqueantes, «higiene, no huecos»). **Deuda 2: CERRADA** (186 tests, mutación
> `puerta-contraste.ts` 100 %, **0 timeouts**). **Deuda 1: ESCALADA A PUERTA HUMANA** — al
> intentar arreglarla se confirmó por medición que el contrato tiene una **contradicción real
> entre `@s14` y `@s15`**. No la toco. Ver §«Post-cierre» al final.

**18/18 escenarios implementados por TDD estricto. 183 tests verdes** (186 tras la sesión de
higiene: +3 de la deuda 2).
`typecheck` · `lint` · `build` (con las dos puertas) **verdes, 0 warnings**.

**Mutación (toda a `--concurrency 1`, la única medición honesta — ver Hallazgo 2):**

| Fichero | Score | Muertos | Supervivientes | Timeouts |
| ------- | ----- | ------- | -------------- | -------- |
| `src/lib/contraste.ts` | **100,00 %** | 53 | **0** | 0 |
| `src/lib/puerta-contraste.ts` | **100,00 %** | 232 | **0** | 0 |
| `src/lib/placeholders.ts` (F-01) | sin regresión (100 % de F-01 vigente) | — | — | — |
| `src/lib/puerta.ts` (F-01) | sin regresión (100 % de F-01 vigente) | — | — | — |
| `src/lib/site.ts` (F-02) | sin regresión (100 % de F-02 vigente) | — | — | — |

**0 mutantes excluidos** (F-01 necesitó 1). Los dos equivalentes que aparecieron se
eliminaron cambiando el DISEÑO, no excluyéndolos — ver Hallazgo 4.

**Por qué la regresión de F-01/F-02 no se re-midió, y por qué eso NO es un atajo:** los tres
ficheros y sus tres ficheros de test están **byte a byte idénticos a `origin/main`**
(`git diff --stat origin/main -- …` vacío, verificado). Mismo código + mismos tests = mismos
mutantes y mismo veredicto. Y el único cambio que los roza es **añadir** un test en
`contraste.test.ts`: más tests solo pueden matar más mutantes, **nunca menos**. Re-medirlos
costaba ~2 h y no podía aportar información.

> ⚠️ **Aviso operativo para `bin/harness verify`:** la tanda de los 5 ficheros a concurrencia 1
> son **487 mutantes ≈ 2 h**, y el propio Stryker avisa: **199 mutantes ESTÁTICOS (41 % del
> total, ~79 % del tiempo)**, casi todos de `MATRIZ_DE_USO` (datos a nivel de módulo). El
> `verify` completo ya no es una operación de minutos. Si algún día molesta, la palanca
> documentada es `ignoreStatic`, **pero apagarlos dejaría de vigilar la matriz** — que es medio
> A-13. Decisión para el lead, no la tomo aquí. Medir **fichero a fichero** es lo práctico, y es
> lo que se ha hecho.

## Puerta de arranque

La primera invocación decía «contrato aprobado» pero **cuatro señales en disco decían que no**
(cabecera `⏸ PENDIENTE`, commit `A-15 cerrada` ≠ `contrato aprobado`, `status: spec_ready`,
`current.md: feature en curso ninguna`). **Me negué y no toqué nada.** El humano aprobó después
y quedó registrado (`67c8a94`): cabecera con la fórmula de F-01, `status: in_progress`, marca
retirada, 18 escenarios. **Verificado en disco antes de escribir la primera línea**, no por el
mensaje del lead.

## Arquitectura (la de F-01, sin inventar otra)

| Capa | Fichero | Qué hace |
| ---- | ------- | -------- |
| PURA | `src/lib/contraste.ts` | G17: `hexARgb`, `canalLineal`, `luminancia`, `ratio`, `componer`. No lee ficheros ni decide exit codes. |
| PUERTA | `src/lib/puerta-contraste.ts` | Lee el SCSS, recorre la matriz de uso, decide el código de salida. |
| HUMILDE | `tools/puerta-contraste.ts` | Solo cablea `node:fs`/`node:process`. Sin tests ni mutación (no decide nada). |
| DATOS | `src/styles/_tokens.scss` | El `:root` REAL con los 7 cambios. T-1: **no** copiado de WebEmpresa. |

Enganchada a `pnpm build`, **no** a `dev` (D-8, como F-01).

## Trazabilidad @s → test

| `@s` | Test |
| ---- | ---- |
| @s1 | `contraste.test.ts` → `@s1 convierte "%s" a tres enteros 0-255` (4 filas) |
| @s2 | `@s2 expande la forma corta "%s"` (3 filas) |
| @s3 | `@s3 es insensible a mayúsculas/minúsculas` |
| @s4 | `@s4 lanza ante el hex malformado "%s"` (**6 filas**, la última añadida por mutación con aprobación humana) |
| @s5 | `@s5 canalLineal(%i) es exactamente %i` (2 filas) |
| @s6 | `@s6 en el punto de corte 0.04045 usa la rama LINEAL` + `@s6 … rama de POTENCIA` |
| @s7 | `@s7 la luminancia de %s es exactamente %s` (5 filas, primarios cromáticos) |
| @s8 | `@s8 el ratio blanco/negro es exactamente 21` + `@s8 … es igual … también exactamente 21` |
| @s9 | `@s9 %s` (4 filas: α=1, α=0, `--line` α=.16, `color-mix` α=.88) |
| @s10 | `puerta-contraste.test.ts` → `@s10 el token %s vale exactamente %s` (6 filas) + 3 tests de parser (espaciado, multi-token, comentado) |
| @s11 | `@s11 "%s" sobre "%s" … pasa` (16 filas) + no-violación + puerta limpia exit 0 + auditabilidad + ruta vigilada |
| @s12 | `@s12 emite exactamente 1 violación …` + `… exit != 0` + `… enganchada al build, y NO al dev` + `… determinista` |
| @s13 | `@s13 ningún par … declara #C05576 como primer plano` + `… usa --accent-dark` + `… sigue existiendo como relleno` |
| @s14 | `@s14 con %s el código de salida es distinto de 0` (2 filas; la 2ª **inerte** — ver post-cierre) + `@s14 la salida declara que no se evaluó el mínimo` + (post-cierre) `@s14 el mínimo … es exactamente 18` + `@s14 con un par MENOS del mínimo exigido …` + `@s14 la matriz real satisface el mínimo real …` |
| @s15 | 5 tests: fichero ilegible (ENOENT), token no declarado, hex malformado, `--header-bg` irreconocible, `--header-bg` ausente |
| @s16 | matriz declara «Studio» + umbral 4.5 no 3.0 + fixture 4.19 → violación + corregido 5.98 pasa |
| @s17 | 2 filas centrales (negro puro) + 10 filas de margen + matriz vigila nav Y logo + 4 filas de espaciado de `color-mix` |
| @s18 | `@s18 bajar la cabecera al 82 % … violación con 4.22 y umbral 4.5` |

## Las trampas del encargo: todas confirmadas por cálculo ANTES de escribir el test

1. **Pie = 4.59, no 4.60** — medido: **4,5913**. `toBeCloseTo(4.59)` pasa, `toBeCloseTo(4.60)` falla. A-16 confirmada.
2. **Cabecera 88 %, no 82 %** — al 82 % la nav da **4,2216** → violación (`@s18` lo fija con ese número exacto).
3. **`c <= 0.04045`** — fijado con input sintético `10.31475` (`/255 === 0.04045` exacto, verificado).
4. **Sin test contra el literal `0.04045→0.03928`** — no escrito (A-14: Stryker 9.6 no lo genera).
5. **`luminancia` con primarios cromáticos** — `@s7` usa los tres primarios puros; los coeficientes mueren.

**Las 15 filas hex↔hex de `@s11` reproducen el audit EXACTAS** (verificado antes de escribir el
SCSS: así confirmé que `--surface #FFFFFF` y `--accent-soft #F7DDE8`, que **no están en el
`.feature`**, eran los valores correctos — salen de `docs/research/audit-a11y.md` §2.3, no
inventados). Los 12 ratios de `@s17` y el 4,19 de `@s16` también coinciden.

## ⚠️ LAS TRES LECCIONES (valen más que el código de esta feature)

**Para quien mida mutación en este repo, hoy o dentro de seis meses. Las tres son sobre cómo
se MIENTE un informe verde, y las tres me pasaron a mí en esta feature.**

1. **Un informe de mutación con timeouts NO es de fiar. Ni aunque diga 100 %.**
   `contraste.ts` cantó **«100 %, 0 supervivientes» con 26 de 53 mutantes en TIMEOUT**. Stryker
   cuenta el timeout como muerto, así que un superviviente que además cuelga **desaparece**. La
   señal de alarma fue física: `contraste.ts` **no tiene un solo bucle**; 26 timeouts era
   imposible. A `--concurrency 1 --timeoutMS 60000`: **timeouts 26 → 0, y apareció el
   superviviente real** (el `^` de `HEX_VALIDO`, un fallo abierto de verdad). Es la MISMA
   lección que F-01 aprendió y escribió, y aun así volvió a morder.
   → **Regla: si el informe trae timeouts, el informe no existe. Repite a concurrencia 1.**
   → **Corolario, comprobado en vivo al cerrar:** basta con que OTRO proceso compita por la CPU
   —un bucle de espera mío, otro agente— para que empiecen a aparecer timeouts (4 en los
   primeros 85 mutantes). **Lee la columna `# timeout` ANTES que el score**; si no es 0, el
   score no vale. Ya está como regla del arnés en `docs/verification.md`.

2. **Un 19 % puede ser culpa de los TESTS, no del código.**
   `puerta-contraste.ts` midió **19,25 % con 189 supervivientes** y el código estaba bien. Yo
   calculaba `evaluarMatriz(...)`, `extraerTokens(...)`, `readFileSync(...)` y `MATRIZ_DE_USO
   .find(...)` en el **cuerpo del `describe`**, o sea en **tiempo de recolección**. Stryker
   activa el mutante **POR TEST**: lo que ya se ejecutó al recolectar **no se vuelve a ejecutar**
   con el mutante activo → sobrevive intacto. Y el caso peor: un mutante que rompía la matriz
   hacía fallar la **recolección del fichero** → **0 tests corrían** → Stryker no veía ningún
   test fallido → **lo contaba como SUPERVIVIENTE**. Con helpers perezosos (`scssReal()`,
   `tokensReales()`, `evaluacionesReales()`, `parStudio()`): **19,25 → 65,69 → 90,75 → 98,68 →
   100 %**, sin tocar una línea de producción.
   → **Regla: TODO cálculo va DENTRO del `it()`. Nunca en el cuerpo del `describe`.** Escrita
   también en la cabecera de `puerta-contraste.test.ts`, donde se va a leer.

3. **`toBeCloseTo` puede volver decorativo un escenario entero.**
   `@s6` existe para matar el mutante `<=` → `<` en el corte `0.04045`. Pero **en el corte las
   dos ramas difieren en 2,3e-9** (la curva sRGB es casi continua ahí **por diseño**):
   `toBeCloseTo` **no discrimina ni a precisión 8** (la tolerancia es mayor que el hueco).
   Verificado adversarialmente: con `toBe` el mutante **muere**; con `toBeCloseTo(8)`
   **sobrevive**. Escrito con el matcher de costumbre, el escenario habría parecido cubierto y
   no habría probado nada.
   → **Regla: si el escenario existe para discriminar dos ramas, mide primero la distancia
   entre ellas y elige el matcher con ese número delante.**

## Hallazgos que cambiaron el trabajo

### 1. `@s6` exige `toBe`, no `toBeCloseTo` (o el mutante `<=`→`<` sobrevive)

En el punto de corte las dos ramas difieren en **2,3e-9** (la curva sRGB es casi continua ahí
por diseño). `toBeCloseTo` **no discrimina ni a precisión 8**. Verificado adversarialmente:
con `toBe` el mutante muere; con `toBeCloseTo(8)` **sobrevive**. Si `@s6` se hubiera escrito
con el matcher de costumbre, el escenario habría sido decorativo.

### 2. La mutación bajo carga MINTIÓ (la lección de F-01, otra vez)

Primer informe de `contraste.ts`: **«100 %, 0 supervivientes»… con 26 de 53 mutantes en
timeout**. `contraste.ts` no tiene bucles: 26 timeouts no era creíble. A `--concurrency 1
--timeoutMS 60000`: **timeouts 26 → 0 y apareció 1 superviviente real**. El 100 % era falso.
**Toda la mutación de esta feature está medida a concurrencia 1.**

### 3. El 19 % de `puerta-contraste.ts` era un defecto DE MIS TESTS, no del código

Primera medición: **19,25 %, 189 supervivientes**. Causa: yo calculaba `evaluarMatriz(...)`,
`extraerTokens(...)` y `readFileSync(...)` en el **cuerpo del `describe`**, o sea en tiempo de
**recolección**. Stryker activa el mutante **por test**: lo que ya se ejecutó al recolectar no
se vuelve a ejecutar con el mutante activo → **sobrevive intacto**. Peor: un mutante que rompía
la matriz hacía fallar la *recolección* del fichero → **0 tests corrían** → Stryker no veía
ningún test fallido → **lo contaba como superviviente**.
Con helpers perezosos (`scssReal()`, `tokensReales()`, `evaluacionesReales()`, `parStudio()`):
**19,25 % → 65,69 % → 90,75 % → 98,68 % → 100 %**. Regla escrita en la cabecera del fichero de
test para que no vuelva a pasar.

### 4. Dos mutantes se mataron cambiando el DISEÑO, no añadiendo tests contrived

- `.replace(/\/\/.*/, '')` tenía **dos mutantes equivalentes** (`''`→texto y `.*`→`.`): el
  comentario llega siempre a fin de línea, así que ni el relleno ni la longitud del match
  pueden crear o romper una declaración (que necesita `--x`, `:` y `;`). Un mutante equivalente
  **no se puede matar, solo excluir**. Sustituido por `indexOf('//')` + `slice`: **cada
  variante es ahora mortal** y la matan los tests de `@s10` que ya existían. **0 exclusiones en
  F-03** (F-01 necesitó 1).
- El `^` de `DECLARACION_DE_TOKEN` obligaba a un formato de fichero que nada exigía. Quitado:
  el parser lee ahora `:root { --a: x; --b: y; }` de una línea (SCSS válido) y el mutante
  desaparece **por ser el ancla innecesaria**, no por un test a medida.

### 5. Prettier y el contrato chocan: manda el contrato

Prettier pasa los hex a minúsculas (`#6F525A` → `#6f525a`) y pone **`@s10` en rojo** («su valor
es exactamente "#6F525A"»). `src/styles/_tokens.scss` va a `.prettierignore` con el porqué
escrito. (`format:check` falla en **76 ficheros ya en HEAD**, antes de F-03: deuda preexistente,
no la toco. El gate declarado del arnés es `lint`, y está verde.)

## Decisiones de diseño (para no volver a discutirlas)

1. **No hay rama de «texto grande» (3:1).** Ninguna fila de la matriz lo es —«Studio» es el
   candidato y `@s16` fija lo contrario: se evalúa a su tamaño MÍNIMO (14 px) = texto normal—.
   Implementarla sería producción que ningún test rojo pidió (Ley 1) **y un mutante inmortal**
   en el `>=` del tamaño. Precedente: el guarda `length===0` de F-01, retirado por lo mismo.
   El día que entre texto grande, hace falta un escenario nuevo.
2. **La matriz alcanza los colores por su TOKEN, no por el hex literal** que escribe el
   contrato (`#FFFFFF` → `--on-accent`, `#186237` → `--estado-en-linea`). Es el sentido de A2:
   con el hex en la matriz, revertir `--estado-en-linea` al viejo `#2F9D5F` (2,69:1) **no
   rompería el build**. El color es el mismo; el que lee el SCSS es la puerta.
3. **`MINIMO_DE_PARES = 18` es un LITERAL, nunca `MATRIZ_DE_USO.length`.** Con `.length` la
   guarda sería tautológica: borras una fila y el mínimo baja solo. Así, borrar un par **rompe
   el build** y hay que venir a bajarlo a mano, dejando rastro en el diff.
4. **La cabecera se vigila contra el PEOR under posible (negro puro), 2 filas en la matriz**
   (nav **y** logo: viven en la misma cabecera). Las otras 10 filas de `@s17` documentan el
   margen y viven en el test. Desacopla F-03 de F-06/F-17.
5. **`--line` conserva su valor auditado** `rgba(176,70,106,.16)`. El cambio 5 es la
   **partición** (`--border-interactive` nace para los bordes de control), **no** un recoloreo:
   el `.feature` no le asigna valor nuevo y no me lo he inventado.
6. **`@s13` compara por VALOR RESUELTO, no por nombre.** Verificado adversarialmente: inyectando
   `--brush` (alias de `#C05576`) como texto, la guarda **lo caza**; por nombre se habría escapado.
7. **`cumple(ratio, umbral)` existe como función** porque WCAG pide «AL MENOS» el umbral: el
   `>=` frente al `>` solo se puede fijar con un ratio sintético exacto (ningún par real cae
   justo en 4,5 ni en 3,0).
8. **La fila `1px solid #AB5F79` de `@s4` NO la añadí yo.** La pedí, la aprobó el humano en la
   puerta y la escribió el `gherkin_author`. Un superviviente de mutación que revela un hueco
   del CONTRATO **no autoriza a un agente a editar el contrato**: autoriza a pedirlo. Misma
   regla que en el arranque de esta feature, cuando me negué a implementar sobre un contrato
   que en disco decía «AÚN NO aprobado».

## Verificado adversarialmente (no me fío de un verde)

- **La puerta rompe el build de verdad** (ejecutando el humilde real contra el SCSS real):
  revertir `--ink` → 3 violaciones (4.19 la del clamp); bajar a 82 % → **4.22**; borrar un token
  → falla cerrada declarando la causa. Restaurado → exit 0.
- **`@s13`** con `--brush` inyectado → rojo. **`@s12`** desenganchando la puerta del `build` → rojo.
- **`@s17`** bajando el SCSS a 82 % → rojo (nav y logo). El 88 % del SCSS **manda de verdad**.

## El superviviente de `contraste.ts`: RESUELTO por la puerta humana (2026-07-16)

La mutación destapó un superviviente REAL en `HEX_VALIDO`: borrar el `^`.

```
- /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
+ /#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
```

**No era equivalente: era un fallo ABIERTO.** Sin el `^`, el regex solo exige que la cadena
ACABE en `#` + 3 o 6 dígitos hex. `1px solid #AB5F79` casaría por el final → `hexARgb` **no
lanzaría** → `slice(1)` = `"px solid #AB5F79"` → devolvería **`[NaN, NaN, NaN]`**: «canales a
medias», exactamente lo que `@s4` prohíbe. Y no es rebuscado: `--border: 1px solid #AB5F79` es
un valor de token plausible, **y la puerta lee valores de token del SCSS** (@s10, @s11).

**El hueco estaba en el CONTRATO, no en el código.** La producción ya era correcta. Verifiqué
una a una que **las 5 filas de `@s4` se comportaban IDÉNTICO con `^` y sin él** (ninguna
termina en un hex válido, así que el `$` ya las rechazaba): ninguna podía matarlo.

**No añadí la fila yo: la pedí y la aprobó el humano en la puerta** (la escribió el
`gherkin_author`). Precedente idéntico: F-01 añadió `| 600  123  456 |` a `@s5` cuando la
mutación reveló que el `+` de `[ -]+` no estaba probado — `progress/mutation_puerta_placeholders.md` §2.

Fila aprobada, hoy en el contrato:

```gherkin
| 1px solid #AB5F79 | shorthand de borde: NO empieza por "#" pero TERMINA en un hex válido |
```

**Demostrado, no supuesto** (como exige el arnés): con la producción correcta las 6 filas
pasan; aplicando el mutante a mano cae **exactamente un test — el nuevo** (`1 failed | 28
passed`), y las otras 5 filas siguen verdes, confirmando que eran ciegas al ancla. Restaurada
la producción: 29/29. **`contraste.ts` → 100,00 %, 0 supervivientes, 0 timeouts. Producción sin
tocar: ni una línea.**

## Ficheros

- **Nuevos:** `src/lib/contraste.ts`, `src/lib/contraste.test.ts`, `src/lib/puerta-contraste.ts`,
  `src/lib/puerta-contraste.test.ts`, `tools/puerta-contraste.ts`, `src/styles/_tokens.scss`.
- **Tocados:** `package.json` (puerta al `build`), `stryker.config.json` (+2 ficheros a `mutate`),
  `src/styles/main.scss` (`@use 'tokens'`), `.prettierignore` (caja de los hex).
- **NO tocados:** `features/*.feature`, `feature_list.json` (el `done` no lo marco yo).

---

# Post-cierre — las dos deudas de higiene del `judge` (2026-07-16)

F-03 ya estaba aprobada y pusheada (`7181f1e`). Esto no reabre la feature: cierra deuda.
**Producción NO tocada: `git diff HEAD -- src/lib/puerta-contraste.ts` vacío.** El único fichero
modificado es `src/lib/puerta-contraste.test.ts` (+47 líneas, 3 tests).

## Deuda 2 — `MINIMO_DE_PARES = 18` sin ancla: **CERRADA**

### El rojo, demostrado (no supuesto)

El hallazgo decía «bajarlo a 1 no pondría rojo nada». **Lo verifiqué sabotéandolo**, que es la
única forma honesta de probar un ancla sobre producción que ya existe:

| paso | producción | suite |
| ---- | ---------- | ----- |
| 1. sabotaje, sin tests nuevos | `MINIMO_DE_PARES = 1` | **183/183 VERDE** ← el hueco, confirmado |
| 2. con los 3 tests nuevos | `MINIMO_DE_PARES = 1` | **1 failed** (`expected 1 to be 18`) |
| 3. restaurado | `MINIMO_DE_PARES = 18` | **186/186 VERDE** |

El paso 1 es el hallazgo del `judge` reproducido: la guarda anti-vacuidad del build real se
podía **desactivar en silencio** con todo en verde. Es la misma clase de fallo que F-03 existe
para impedir, y ya estaba escrita como anti-patrón en `docs/verification.md` («Una constante que
decide una guarda y que ningún test fija»).

### Los tres tests, y por qué son tres

1. **`@s14 el mínimo de pares que la puerta exige en el build es exactamente 18`** — el ancla del
   `judge`. Contra el **literal `18` escrito a mano**, NUNCA contra el símbolo importado ni contra
   `MATRIZ_DE_USO.length`: contra el símbolo el test seguiría al mutante y no fijaría nada
   (memoria: `doble-de-test-anclado-al-literal-no-al-simbolo`). Mismo argumento con el que ya se
   anclaba `RUTA_DE_LOS_TOKENS` en `@s11`. Coge las **dos direcciones**: bajarlo (guarda muerta)
   y subirlo a 19 (guarda insatisfacible).
2. **`@s14 con un par MENOS del mínimo exigido la puerta falla, aunque ningún par viole su
   umbral`** — la frontera, con el mínimo REAL de producción. Es el verde por vacuidad literal:
   0 fallos sobre pocos pares no es estar protegido. Se recorta a `MINIMO_DE_PARES - 1`, **no** a
   `length - 1`, para que **añadir** un par a la matriz no lo ponga rojo sin motivo.
3. **`@s14 la matriz real satisface el mínimo real: la puerta de producción sale con código 0`** —
   la otra mitad de la frontera. La guarda tiene que ser exigente **y satisfacible**.

**El reparto símbolo/literal es deliberado:** el test 1 fija el **VALOR** (literal); los tests 2 y
3 fijan el **COMPORTAMIENTO** de `length < minimo` (símbolo). Verificado en vivo: bajo el sabotaje
`18 → 1` los tests 2 y 3 **siguen verdes** —usan el símbolo, así que *siguen al mutante*— y solo
el test 1 se pone rojo. Es la razón exacta por la que el ancla va contra el literal, comprobada en
el propio repo en vez de citada.

### `covered 0` no es un defecto: es el argumento

El test 1 mata **0 mutantes** (`✘ … el mínimo … es exactamente 18 (covered 0)` en el informe).
No es un fallo del test: **Stryker no muta un literal numérico suelto** (sus mutadores numéricos
tocan operador/condición, no una constante por otra). Por eso la mutación decía 100 % con la
guarda desanclada, y por eso hacía falta este test. **El mutante aquí es HUMANO**, exactamente
como el 88 → 82 del SCSS que `@s18` existe para anclar (el SCSS tampoco lo muta Stryker). Un
fichero al 100 % de mutación puede tener una guarda muerta: el score no cubre esta clase.

### Lo que NO hice, y por qué

- **No anclé que el humilde pase `MINIMO_DE_PARES`** (el `judge` lo apunta de pasada). El humilde
  es *humble object* sin decisiones, sin tests y fuera de mutación **por diseño ya aprobado en
  F-01**. Aseverar sobre su texto fuente sería testear lo que no decide. Precedente respetado: se
  ancla la CONSTANTE (como `RUTA_DE_LOS_TOKENS`), y del cableado responde el humilde.
  **Residual conocido y aceptado:** si alguien editara `tools/puerta-contraste.ts` para pasar
  `minimoDePares: 1`, ningún test lo vería. Es el mismo residual que `RUTA_DE_LOS_TOKENS` ya
  tenía desde F-01; si algún día molesta, es un escenario nuevo, no un parche.

### Verificación

`typecheck` · `lint` · `build` **verdes, 0 warnings**. `pnpm test` → **186**. El humilde real
contra el SCSS real → `✓ los 18 pares en uso cumplen su umbral WCAG 2.2 AA`, exit 0.

**Mutación de `src/lib/puerta-contraste.ts`** (`--mutate src/lib/puerta-contraste.ts
--concurrency 1 --timeoutMS 60000`, sin nada compitiendo por la CPU):

| Score | Muertos | Supervivientes | **Timeouts** | No cov | Errores |
| ----- | ------- | -------------- | ------------ | ------ | ------- |
| **100,00 %** | 232 | **0** | **0** | 0 | 0 |

**`# timeout` leído ANTES que el score** (regla del arnés, `docs/verification.md`): es 0, así que
el score vale. No se re-midió la tanda completa: `contraste.ts` no se ha tocado y
`placeholders.ts`/`puerta.ts`/`site.ts` siguen byte a byte idénticos a `origin/main`; el único
cambio es **añadir** tests, y más tests solo pueden matar más mutantes, nunca menos.

## Deuda 1 — la 2ª fila de `@s14`: **ESCALADA, NO ARREGLADA**

**La fila es inerte: confirmado.** Las dos filas pasan `matriz: []`, y con matriz vacía la guarda
del mínimo cortocircuita **antes** de que `leerScss` influya. Medido con la producción real:

| caso | matriz | SCSS | exit | línea emitida |
| ---- | ------ | ---- | ---- | ------------- |
| A (fila 1) | vacía | real | 1 | `no se evaluó el mínimo de pares exigido: 0 de 16` |
| B (fila 2) | vacía | `body { color: red; }` | 1 | **idéntica a A** ← la fila 2 es la fila 1 con otro nombre |
| **C (la fila que pide el encargo)** | **REAL** | `body { color: red; }` | 1 | `la puerta … no pudo completar el análisis: el token "--muted" … no está declarado en el :root` |

**Y aquí para el trabajo: el caso C sale por la rama de `@s15`, no por la de `@s14`.**

### La contradicción del contrato, en concreto

`@s14` dice: *«Given una matriz de uso vacía, **o un regex del SCSS que no casa ningún token**»* →
*«And la salida declara **que no se evaluó el mínimo de pares exigido**»*. Leído en Gherkin
estricto, los tres `Then` valen para los **dos** `Given`.

**Ese `Then` es INSATISFACIBLE para el segundo `Given` con matriz no vacía**, y no por un
descuido del código: porque **`@s15` manda lo contrario**. `@s15` declara *«un token de la matriz
de uso no está declarado en el :root»* → *«la salida declara la causa»*, y `valorDelToken` LANZA
antes de llegar a la guarda del mínimo. Un SCSS que no casa ningún token **es** un token no
declarado. Los dos escenarios **se solapan sobre la misma entrada y exigen mensajes distintos**.

Se ve en que el caso C ya está cubierto: es, letra por letra, la 1ª fila del `it.each` de `@s15`
(`:root { --bg: #FDF4F7; }` + un par cualquiera). **Cualquier arreglo de la fila 2 es redundante
con `@s15` o contradice a `@s14`.** Por eso no la toco.

### El origen del choque

El comentario de `@s14` describe un diseño donde el regex roto produce **0 pares evaluados** y la
guarda del mínimo lo caza. Eso exigiría que `evaluarMatriz` **se saltara en silencio** los pares
que no puede resolver. La producción **lanza**, y es lo correcto: las dos variantes fallan cerrada
—no hay agujero de seguridad—, pero la que lanza **acusa el token exacto** (`--muted`) en vez de
gruñir `0 de 18`. Es lo que exige `docs/conventions.md` y la lección del `motivoDelReventon` de
F-01, ya citada en este mismo fichero de test: «exigir la CAUSA concreta, no un "no pudo
completar" que cualquier cosa cumple». **El contrato encoded el diseño peor en `@s14` y el mejor
en `@s15`.** Misma forma que la contradicción A-16 (4,59 vs 4,60) que el propio contrato
documenta: una hipótesis del contrato sobre la implementación que la implementación refutó.

### Las tres salidas (decisión del humano, no mía)

1. **RECOMENDADA — retirar el 2º `Given` de `@s14`.** `@s14` queda como «matriz vacía o corta →
   falla por el mínimo»; el caso del regex es de `@s15`, que ya lo cubre y lo cubre mejor.
   **No se pierde cobertura** (medido) y desaparece el solapamiento. Exige editar el `.feature`.
2. Relajar el `Then` de `@s14` a «declara la causa». Deja `@s14` y `@s15` casi duplicados y
   **debilita** el `Then` que hoy es fuerte para la matriz vacía. No me gusta.
3. **Cambiar la producción** para que los pares irresolubles se descarten y caigan en la guarda
   del mínimo. **Mala**: rompe `@s15`, y el build pasaría de acusar «el token `--muted` no está
   declarado» a decir «0 de 18». **Menos informativa por contrato. No la haría sin orden expresa.**

**Precedente aplicado:** igual que con el `^` de `HEX_VALIDO` y con el arranque de esta feature —
un hueco del CONTRATO **no autoriza a un agente a editar el contrato**: autoriza a pedirlo.
