# Mutación — feature 5 `cero_terceros`

**Veredicto:** 🔴 **FAIL — ESCALADA AL LEAD**
**Umbral:** `harness.config.json` → `mutation.threshold: 1.0` · `stryker.config.json` → `break: 100`.
**10 mutantes sobrevivientes REALES**, los 10 **verificados por sabotaje manual** contra la suite
completa (568 tests). **0 exclusiones, 0 `Stryker disable`, 0 justificaciones de equivalencia.**
A-23 (humano, 2026-07-17) eligió la opción **SIN supervivientes preaprobados**: el `mutation_tester`
**no tiene licencia para excluir nada**. Se mide y se escala. **Los mata el `tdd_craftsman`.**

---

## 1. Salud del informe — SE LEE ANTES QUE EL SCORE

> «Un informe con timeouts MIENTE» (`docs/verification.md` §52) y «un `tests per mutant` desplomado
> miente al revés» (§77). **Aquí mordió la primera, y mordió fuerte.**

### 🔴 La primera tanda de `terceros.ts` dio «100 %, 0 supervivientes» Y ERA FALSO

| Tanda | Concurrencia | `# timeout` | tests/mutante | Score | ¿Vale? |
| ----- | ------------ | ----------- | ------------- | ----- | ------ |
| `terceros.ts` #1 | por defecto (harness) | **152 / 183** | **1,59** | **100,00 %** ❌ | **NO — DESCARTADA** |
| `terceros.ts` #2 | `--concurrency 1` | **0** | **10,85** | **95,08 %** | ✅ sí |
| `puerta-terceros.ts` #1 | `--concurrency 1 --timeoutMS 60000` | **0** | **7,24** | **99,09 %** | ✅ sí |

**El calco exacto de F-01 y F-03**: `terceros.ts` es **código puro, sin un solo bucle que pueda
colgarse** → 152 timeouts son **imposibles por construcción**; son ruido de contención, y cada uno
**contaba como MUERTO**. Ese «100 %» tapaba **9 supervivientes reales**. La tanda #1 **no se
reporta, no se commitea y no cierra nada**; queda aquí solo como evidencia de que la regla del arnés
se aplicó. Reproducido lo de F-03 al pie de la letra: **timeouts 152 → 0 ⇒ aparecen supervivientes**.

### El «118 tests» del dry run NO es un síntoma — está explicado y medido

El dry run de `terceros.ts` corre **118 tests**, no los 568 de la suite. **No es la mentira de §77.**
Stryker acota a los **tests relacionados por el grafo de dependencias** con el fichero mutado [V]:

| Fichero mutado | Dry run | Cuadra con |
| -------------- | ------- | ---------- |
| `src/lib/terceros.ts` | **118** | `terceros.test.ts` (75) + `puerta-terceros.test.ts` (43) = **118** ✓ |
| `src/lib/puerta-terceros.ts` | **43** | `puerta-terceros.test.ts` (**43**) ✓ — `terceros.test.ts` NO lo importa |

Las dos cuentan **exactas**, y la segunda tanda **confirma la explicación de forma independiente**.
`tests/mutante` **10,85** y **7,24** están en el rango sano del precedente F-04 (`seo.ts` **10,04**,
`puerta-cascaron.ts` **19,55**); el envenenado de F-04 fue **1,35** — y el de la tanda #1, **1,59**.

**Higiene de la tanda:** una sola a la vez, `rm -rf .stryker-tmp` entre tandas y **sin ninguna otra
viva** (comprobado con `Get-CimInstance Win32_Process`). Baseline previo: **568/568 verde**.

```bash
pnpm exec stryker run --mutate src/lib/terceros.ts        --concurrency 1
pnpm exec stryker run --mutate src/lib/puerta-terceros.ts --concurrency 1 --timeoutMS 60000
```

---

## 2. Informe por fichero

| Fichero | `# timeout` | tests/mutante | Total | Killed | **Survived** | Score |
| ------- | ----------- | ------------- | ----- | ------ | ------------ | ----- |
| `src/lib/terceros.ts` | **0** | 10,85 | 183 | 174 | **9** | **95,08 %** |
| `src/lib/puerta-terceros.ts` | **0** | 7,24 | 110 | 109 | **1** | **99,09 %** |
| **Feature** | **0** | — | **293** | **283** | **10** | **96,59 %** |

Ambos por debajo de **100 %**. Stryker sale con código 1 en las dos tandas honestas.

---

## 3. Verificación por SABOTAJE MANUAL — los 10 son REALES

> «Si algo figura Survived, VERIFÍCALO POR SABOTAJE MANUAL antes de tocar nada.» En F-04 el informe
> mintió y un «Survived» mataba 5 tests a mano. **Aquí no: los 10 sobreviven de verdad.**

Cada mutante aplicado a mano al fichero, `pnpm test` completo (**568 tests**), fichero restaurado
(`git status` limpio al terminar). **10/10 SOBREVIVEN con la suite VERDE: 0 supervivientes falsos.**

🔴 **Dos trampas de método encontradas al reproducir, y anotadas porque volverán a morder:**

1. **El diff textual de Stryker MIENTE sobre la precedencia.** Para `a && b && c && d` (que parsea
   `((a&&b)&&c)&&d`), el `LogicalOperator` de `terceros.ts:257` se imprime como
   `rel !== undefined || href !== undefined &&…`, pero el mutante real es
   **`(rel !== undefined || href !== undefined) && …`**. Copiar el diff **literal** da otro mutante,
   más fuerte: sin paréntesis `&&` liga más que `||`, y ese sí **mata 5 tests**. Reproducido con
   paréntesis: **SOBREVIVE**. *Un sabotaje mal parentizado habría «desmentido» un superviviente real.*
2. **El heredoc se come las barras invertidas**: el primer intento de sabotear el regex buscaba
   `s*` en vez de `\s*` → «patrón no encontrado». Se rehízo sin barras literales
   (`String.fromCharCode(92)`). *Un «NO_APLICA» no es un «no sobrevive».*

---

## 4. Mutantes sobrevivientes — `src/lib/terceros.ts` (9)

### Grupo A — las guardas `!== undefined` de `<link>` (4 mutantes, `urlsQuePide`)

- **`terceros.ts:257:7`** `ConditionalExpression` — `rel !== undefined && href !== undefined` → `true`
- **`terceros.ts:257:7`** `ConditionalExpression` — `rel !== undefined` → `true`
- **`terceros.ts:257:7`** `LogicalOperator` — `(rel !== undefined || href !== undefined)`
- **`terceros.ts:258:7`** `ConditionalExpression` — `href !== undefined` → `true`

**Qué falta, y son DOS tests que se cubren entre sí (matan los 4):**

1. **`<link href="https://cdn.tercero.com/x.css">` SIN `rel`** → debe dar **0 orígenes y NO lanzar**.
   Hoy nada lo fija: con el mutante, `contactaConElOrigen(undefined)` hace `undefined.split` →
   **TypeError**. Mata `rel!==undefined → true`, el `&&`→`||` y el colapso a `true`.
2. **`<base href="https://cdn.tercero.com/">` + `<link rel="stylesheet">` SIN `href`** → debe dar
   **0 orígenes**. Con el mutante se hace `yield undefined`, que resuelve contra la base del tercero
   → **`https://cdn.tercero.com/undefined`: un FALSO POSITIVO inventado**. Mata `href!==undefined → true`.
   *Con la base propia NO se distingue* (ambos caen del lado propio): **la fila tiene que llevar
   `<base>` a un tercero.**

### Grupo B — `baseDelDocumento` (2 mutantes)

- **`terceros.ts:240:11`** `ConditionalExpression` — `if (href !== undefined)` → `if (true)`
  **Falta:** un HTML con **`<base>` SIN `href` SEGUIDO de `<base href="https://cdn.tercero.com/">`**
  y una URL relativa → debe detectar **1 origen** (el primer `<base href>` válido gana, §4.6.5).
  Con el mutante, el `<base>` sin href devuelve `…/undefined` **y corta el bucle**: el `<base>` del
  tercero **no se consulta jamás** y la petición al tercero **se vuelve invisible**.
  *Un `<base>` sin href a secas NO lo mata: `…/undefined` y `…/` son ambos host propio.*
- **`terceros.ts:241:16`** `OptionalChaining` — `URL.parse(href, RAIZ_PROPIA)?.href` → `.href`
  **Falta:** **`<base href="http://[">`** (URL **inválida**, `URL.parse` → `null`) → debe caer con
  gracia en `RAIZ_PROPIA` y **no lanzar**. Con el mutante: `null.href` → **TypeError**.

### Grupo C — el resto (3 mutantes)

- **`terceros.ts:278:13`** `ConditionalExpression` — `nombre === ATRIBUTO_SRCSET ? urlDeSrcset(valor) : valor` → `true ? …`
  **Falta:** un subrecurso **no-`srcset` cuya URL lleve un ESPACIO**, p. ej.
  `<img src="https://cdn.tercero.com/a b.png">` → el `valor` acusado debe ser la URL **completa**
  (`…/a%20b.png`), no truncada en el espacio. Con el mutante se le aplica `split(' ')[0]` a **todo**
  atributo y el `valor` sale **truncado** (`…/a`) — el origen se sigue detectando, así que **solo lo
  caza un aserto sobre `valor`** (el de @s25). Sin espacios en la URL, `split(' ')[0] === valor` y el
  mutante es indistinguible. **Roza el límite declarado nº 2 del `tdd` (srcset multi-candidato) pero
  NO es el mismo: aquí el hueco es `src`, no `srcset`.**
- **`terceros.ts:299:7`** `ConditionalExpression` — `url === null || …` → `false || …`
  **Falta:** una **URL inválida en un atributo de subrecurso**, p. ej. `<img src="http://[">` → debe
  ignorarse sin lanzar. Con el mutante: `null.protocol` → **TypeError**. Es el **hermano exacto** del
  `OptionalChaining` de `:241`: **nada en la suite mete una URL que NO PARSEE.**
- **`terceros.ts:58:18`** `Regex` — `ATRIBUTO`: de `([a-z-]+)\s*=\s*"([^"]*)"` a `([a-z-]+)\S*=\s*"([^"]*)"`
  **Falta:** un atributo con **espacios alrededor del `=`**: `<img src = "https://cdn.tercero.com/a.png">`
  → debe detectar **1 origen**. 🔴 **El comentario de `:57` ASEVERA que «el espaciado alrededor del
  `=` es OPCIONAL en HTML y el extractor lo tolera» — y NINGÚN test lo fija.** Es una **promesa del
  código sin puerta**: con `\S*` la tolerancia desaparece y la suite **ni se entera**.
  ⚠️ **NO es el `\s*`→`\S*` de cierre que el contrato nombra en `@s24`**: aquel es de `URL_CSS`, y el
  diseño lo evitó eligiendo `url\(([^)]*)\)`. Ese **no ha aparecido: el diseño de @s24 funcionó.**
  **Éste es OTRO, en OTRO regex, y NO está preaprobado por nadie.**

---

## 5. Mutante sobreviviente — `src/lib/puerta-terceros.ts` (1)

- **`puerta-terceros.ts:159:9`** `ConditionalExpression` — `if (recurso.tipo === TIPO_CSS)` → `if (true)`
  **Falta:** un recurso de **tipo `html` que CONTENGA un `@font-face`** (p. ej. un
  `<style>@font-face{font-family:'Impostora';font-weight:400}</style>` inline) junto al CSS con los 6
  pares esperados → la puerta **no debe contar ese par** (código de salida **0**). Con el mutante, el
  `@font-face` del HTML **entra en el conjunto** → «sobra el par ("Impostora", 400)» → **build roto
  por un falso positivo**. Hoy ningún recurso `html` de los tests lleva `@font-face`, así que el
  filtro por tipo **no lo asevera nadie**: `paresDelCss` promete «del CSS» y **nada lo comprueba**.

> **`ArrayDeclaration` sobre `PARES_DE_FUENTE_ESPERADOS` MURIÓ**, y con él el resto del catálogo:
> el escenario-ancla **`@s38` hizo su trabajo** y lo confirma esta tanda, no solo los 30 sabotajes
> del `judge`. **El diseño de la allowlist como parámetro + @s38 funcionó: 0 equivalentes de fábrica.**

---

## 6. Lo que este agente NO ha hecho, a propósito

- **No ha tocado `src/` ni los tests.** Los sabotajes se aplicaron y **se revirtieron**;
  `git status` **limpio** al cierre (verificado tras cada tanda) y **suite 568/568 verde** al final.
- **No ha excluido ni justificado ningún mutante como equivalente.** La vía existe
  (`docs/mutation-testing.md` §74-80) pero **la decide el humano**, y **A-23 la cerró**.
  **Ni siquiera el de `:278`, que es el más cercano a un equivalente**: NO lo es —
  `<img src>` con un espacio lo distingue por el `valor`.
- **No ha marcado nada `done`.** La feature **NO CIERRA** con 10 supervivientes.

## 7. Qué pedirle al `tdd_craftsman` (6 tests rojos matan los 10)

| # | Test que falta | Mata |
| - | -------------- | ---- |
| 1 | `<link href="…">` **sin `rel`** → 0 orígenes, sin lanzar | 3 de `:257` |
| 2 | `<base href>` a tercero + `<link rel="stylesheet">` **sin `href`** → 0 orígenes | `:258` |
| 3 | `<base>` sin href **seguido de** `<base href>` a tercero → 1 origen | `:240` |
| 4 | URL **inválida** (`http://[`) en `<base href>` **y** en `<img src>` → sin lanzar | `:241`, `:299` |
| 5 | `<img src = "…">` con **espacios en el `=`**, y `<img src>` con **espacio en la URL** | `:58`, `:278` |
| 6 | recurso `html` con `@font-face` inline → **no** cuenta como par | `puerta:159` |

**Patrón de los 10, y merece leerse junto:** salvo el `:58`, **todos son guardas defensivas contra
entradas que NINGÚN escenario mete** (`rel`/`href` ausentes, URL que no parsea, `@font-face` en un
HTML). El contrato cubre **muy bien lo que el artefacto SÍ trae** y **no fija lo que pasa con lo
malformado**. El `:58` es de otra especie y es el más grave: **un comentario que asevera una
tolerancia que ningún test sostiene** — exactamente el anti-patrón «una promesa sin puerta».

**Después de matarlos: vuelta al `judge` y REMEDICIÓN a `--concurrency 1`** (añadir tests no puede
bajar un score, pero **el informe honesto hay que volver a emitirlo**).
