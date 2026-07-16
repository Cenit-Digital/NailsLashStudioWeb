# F-03 — Verificación previa a la puerta (lead, 2026-07-16)

> Qué es esto: antes de aprobar el contrato de `tokens_paleta_contraste` se verificó
> (a) **por cálculo** la decisión A-15, que el audit dejó explícitamente sin re-verificar, y
> (b) **contra documentación oficial** las 7 afirmaciones técnicas que sostienen el contrato.
> Resultado: **A-15 cambia por decisión humana** y hay **5 correcciones** al contrato.
>
> Método (b): 14 subagentes, 7 afirmaciones × (verificar + refutar adversarialmente),
> 501k tokens, 0 errores. Diario completo:
> `.claude/projects/.../subagents/workflows/wf_a68e5aa6-95c/journal.jsonl`

## 1. A-15 — RESUELTA POR CÁLCULO. El default era incorrecto.

El contrato proponía mantener la cabecera translúcida al **82 %**
(`color-mix(in srgb, var(--bg) 82%, transparent)`), con el argumento de que los tokens
corregidos «casi seguro pasan». **No pasan.**

### Validación del método

Antes de calcular nada nuevo se **replicó la tabla del audit §2.6(b)** con los tokens viejos.
Los **6 fondos efectivos coinciden hex a hex** (`#FDF6F8`, `#FDF2F6`, `#FCF0F4`, `#EFD5DE`,
`#F2D7E0`, `#D8D1D3`) y los ratios difieren **≤ 0,02**. La causa de esa diferencia está
identificada y es un hallazgo en sí: **el audit cuantiza el compuesto a 8 bits antes de
calcular el ratio; el cálculo en coma flotante no.** Ver §3.

### El fallo

| Under bajo la cabecera | nav `--muted #6F525A` | logo `--ink #8E3355` |
| ---------------------- | --------------------- | -------------------- |
| `--surface2 #FBE7EF` | 6,32 ✅ | 6,95 ✅ |
| `--accent #C05576` (botones) | 5,15 ✅ | 5,67 ✅ |
| `--ink #8E3355` (pie) | 4,82 ✅ | 5,31 ✅ |
| `#303030` — «peor caso» **del audit** | 4,61 ✅ | 5,07 ✅ |
| **`#1B1B1D` «Negro Ónix»** — **dato del propio diseño** | **4,44 ❌** | 4,88 ✅ |
| `#000000` negro puro | **4,22 ❌** | 4,64 ✅ |

**El audit declaró como peor caso un `#303030` más claro que el negro de su propia carta de
esmaltes** (`salon-data.js:90` → `{ name: 'Negro Ónix', hex: '#1B1B1D' }`). Con ese tono
seleccionado en el probador, los enlaces de la nav caen a **4,44 < 4,5**.

El acantilado exacto: al 82 % la nav necesita que **ningún under baje de gris 36 (`#242424`)**.

### Por qué el contrato no lo habría cazado

`@s17` declara «foto oscura» como under **solo para `--ink` (logo)**, no para `--muted` (nav).
Pero logo y nav viven en la **misma** cabecera: lo que scrollea bajo uno scrollea bajo el otro.
La matriz declarada **omitía justamente la única combinación que falla**. `--ink` aguanta el
negro puro (4,64); `--muted` no. La asimetría escondía el fallo.

### Decisión del humano: cabecera translúcida al 88 %

| Opción | nav vs `#303030` | vs Ónix `#1B1B1D` | vs negro puro | Veredicto |
| ------ | ---------------- | ----------------- | ------------- | --------- |
| 82 % (contrato) | 4,61 | 4,44 ❌ | 4,22 ❌ | depende del under |
| 85 % | 4,88 | 4,74 | 4,55 (4,54 cuantizado) | inmune, margen +0,04 |
| **88 % — ELEGIDA** | **5,17** | **5,05** | **4,90** | **inmune, margen +0,40** |
| opaca | 6,42 | 6,42 | 6,42 | inmune, pierde el efecto |

**88 % es incondicionalmente AA**: no existe under —ni el negro puro— que la tumbe.
Conserva la translucidez (deja pasar 12 % frente al 18 %) y el `backdrop-filter: blur(14px)`.
Comprobado que **el redondeo a 8 bits no lo tumba** (4,903 cuantizado vs 4,892 flotante).

**Consecuencia de diseño para el contrato:** `@s17` deja de validar *«una lista declarada de
unders conocidos»* y pasa a validar **el peor under POSIBLE (negro puro)**. Es una guarda más
fuerte y más simple, y **desacopla F-03 de F-06 y F-17**: ya no hace falta enumerar qué
secciones scrollean debajo, ni restringir cómo de oscuras pueden ser las fotos reales.

> `backdrop-filter: blur(14px)` no altera este análisis, y el audit ya lo decía: el desenfoque
> **promedia** el color, no lo aclara. Para una región oscura grande el centro sigue oscuro
> (peor caso intacto); para un elemento oscuro pequeño el blur solo **ayuda**.

## 2. Verificación contra documentación oficial — 7 afirmaciones

| # | Afirmación | Veredicto | Efecto |
| - | ---------- | --------- | ------ |
| C1 | Luminancia G17: coeficientes, `<= 0.04045`, 12.92, 2.4, 0.055/1.055 | **CONFIRMADA** | corregir la **fuente citada** (ver §4) |
| C2 | Ratio `(L1+0.05)/(L2+0.05)`, L1 el más claro, máx. 21 | **CONFIRMADA** | ninguno |
| C3 | Texto grande ≥24 px, **≥18,5 px negrita** | **MATIZADA** | **la cifra es correcta**, solo redacción |
| C4 | SC 1.4.11 3:1 «componentes/bordes de control» | **MATIZADA** | **justificación falsa**, decisión válida |
| C5 | `color-mix(in srgb, --bg 82%, transparent)` ≡ `--bg@.82` | **CONFIRMADA** | añadir precondición |
| C6 | Stryker 9.6 no genera el mutante literal→literal | **CONFIRMADA** | ninguno |
| C7 | Texto sobre fondo variable: exigir el peor caso | **MATIZADA** | **justificación falsa**, decisión válida |

### C3 — el lead se equivocaba, el contrato tenía razón

Se sospechaba que «≥18,5 px negrita» era un error y que la cifra oficial era 18,66 px
(14 pt × 4/3). **Falso.** Los dos verificadores, por separado, confirman que **18,5 px es la
cifra que publica el W3C** y que **«18.66px» no aparece en `w3.org`** (búsqueda restringida al
dominio: cero resultados). **La cifra se queda como está.** Único cambio: redactar que la
definición normativa es en **puntos** y que los px son la aproximación del propio W3C.

### C4 — la decisión sobrevive, la justificación no

«SC 1.4.11 exige 3:1 a los bordes de control» es **falso como regla**. El eje normativo no es
«borde de control sí / decorativo no», sino **la información visual requerida para IDENTIFICAR
el componente y su estado**. Partir `--line` (decorativo) de `--border-interactive #AB5F79`
sigue siendo correcto; **el porqué escrito está mal** y hay que reescribirlo.

### C7 — «WCAG exige el peor caso» es falso

WCAG **no** formula la regla como «cumple el peor caso». La técnica **F83** trata el peor caso
como *Quickcheck*: condición **suficiente, no necesaria**. La exigencia real de SC 1.4.3 es
**≥4,5:1 entre cada letra y el fondo inmediatamente detrás de ella**. Exigir el peor under
**sigue siendo correcto y defendible** —lo implica— pero **el porqué hay que reescribirlo**:
no se hace «porque WCAG lo exija así», sino porque bajo un fondo dependiente del scroll *cada*
posición es un fondo inmediato posible, y el peor de ellos es el que decide.

### C1 — la fuente citada por el contrato está desactualizada

El contrato (línea 19) cita `https://www.w3.org/WAI/GL/wiki/Relative_luminance`. Ese wiki
**sigue imprimiendo `0.03928`** en la fórmula, con una errata encima que dice que el valor
correcto es `0.04045`. **No contradice al contrato: lo respalda** — pero un revisor futuro que
lo cite «corregiría» la implementación hacia el valor obsoleto. **Fuente de verdad: el glosario
de WCAG 2.2**, no el wiki. Dejarlo escrito.

Además, la equivalencia `0.03928 ≈ 0.04045` se verificó **por cálculo exhaustivo**: de los 256
canales `c/255`, **ninguno** cae en el hueco `(0.03928, 0.04045]` (vecinos: `10/255 = 0,039216`
y `11/255 = 0,043137`). **Depende estrictamente de los 8 bits**: a 10 bits `41/1023 = 0,040078`
**sí** cae dentro. El contrato ya acota a 8 bits, así que es correcto; conviene **no**
presentar la equivalencia como universal.

### C5 — precondición que faltaba

La equivalencia `color-mix(in srgb, X 82%, transparent)` ≡ `X` con α=0.82 está respaldada por
spec normativa (interpolación **premultiplicada**: `transparent` = `rgb(0 0 0 / 0)`, su RGB
premultiplicado es `[0,0,0]` y su peso va **solo** al alfa, así que el RGB sobrevive intacto).
Verificado además por cálculo: des-premultiplicar devuelve `#FDF4F7` exacto.
**Precondición a escribir: exige que `--bg` sea OPACO.** La regla general es
`α_resultante = α(--bg) × 0.82`.

## 3. Hallazgo propio: la fila del pie no pasaría `toBeCloseTo(4.60)`

`@s11` declara la fila `rgba(#FFFFFF,.70)` / `--ink #8E3355` → **4,60** ([V] del audit) y el
contrato manda escribirla a mano como `toBeCloseTo(4.60)`.

| Modelo de `componer` | ratio | `toBeCloseTo(4.60)` (precisión 2 → exige < 0,005) |
| -------------------- | ----- | ------------------------------------------------ |
| flotante (lo que manda `@s9`) | **4,5913** | ❌ **FALLA** (desvío 0,0087) |
| cuantizado a 8 bits (lo que hizo el audit) | 4,5966 | ✅ pasa (desvío 0,0034) |

**El contrato se contradice a sí mismo**: `@s9` fija `componer` en **coma flotante**
(`[0,0,0] α=.16 sobre blanco → [214.2, 214.2, 214.2]`, fraccionario y explícito), pero el
esperado 4,60 de `@s11` sale de un cálculo **cuantizado**. Escrito tal cual, **el TDD se
estrella** en esa fila.

Afecta **solo a las filas compuestas** (`rgba`/`color-mix`). Las filas hex↔hex del audit se
reproducen exactas (6,42 · 6,19 · 5,98 · 5,74 · 3,54 · 4,37 · 4,19 · 5,79…).

**Decisión del lead (A-16):** `componer` **devuelve flotantes, sin cuantizar** —coherente con
`@s9`, que ya lo fija—; el esperado de esa fila pasa a **4,59**. La cuantización es un detalle
de render, no del color especificado, y el delta de 0,01 **no cambia ningún veredicto** (ambos
≥ 4,5). Se deja escrito que el 4,60 del audit es el valor cuantizado, para que nadie lo
«corrija» de vuelta.

## 4. Cambios que van al contrato

1. **A-15 → 88 %** (decisión humana). `@s17` valida el **peor under posible (negro puro)**, no
   una lista declarada. Recalcular sus ratios al 88 %. `@s9`: la fila del `color-mix` pasa de
   α=.82 a **α=.88** (`0.88·255 = 224.4`).
2. **A-16 (nueva):** `componer` en coma flotante; fila del pie **4,59**, no 4,60.
3. **C1:** fuente de verdad = glosario WCAG 2.2, **no** el wiki (que imprime 0.03928); acotar
   la equivalencia a 8 bits explícitamente.
4. **C4:** reescribir la justificación de SC 1.4.11 (eje = identificar el componente).
5. **C7:** reescribir la justificación del peor caso (F83 = Quickcheck suficiente, no
   necesario; la exigencia real es letra vs fondo inmediato).
6. **C3:** redacción — normativo en puntos, px como aproximación oficial. **18,5 se queda.**
7. **C5:** precondición `--bg` opaco.
