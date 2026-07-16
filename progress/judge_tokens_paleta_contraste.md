# Review — feature 3 tokens_paleta_contraste

**Veredicto:** APPROVED

El review es el juego entero. Se juzga cobertura de los 18 escenarios contra el contrato
aprobado, la regla ANTI-TAUTOLOGÍA, disciplina TDD y calidad de artesano. La mutación la
valida después el `mutation_tester` (C7).

**Medido, no fiado del recuento declarado:**
- `bin/harness init` → **verde** (entorno, lint, typecheck, 182→**183 tests**, 6 ficheros).
- `pnpm test` → **183 passed**, 0 warnings.
- `node tools/puerta-contraste.ts` (el humilde REAL contra el SCSS REAL) →
  `✓ los 18 pares en uso cumplen su umbral WCAG 2.2 AA`, **exit 0**.
- `git diff -- src/lib/contraste.ts` → la producción **no se tocó** para cerrar el superviviente.

## Verificación INDEPENDIENTE de los literales (lo primero que había que romper)

No basta con que el test sea verde: si el literal esperado saliera de la implementación
vigilada, una fórmula rota pasaría verde. **Reimplementé G17 desde cero (script propio del
juez, sin importar `src/`) y recalculé cada literal del contrato.** Todos coinciden:

| Comprobación | Real (cálculo independiente) | Literal del test | |
| --- | --- | --- | --- |
| Las 15 filas hex↔hex de @s11 | 6.4214 · 6.9297 · 5.7394 · 6.1936 · 5.2435 · 4.8554 · 6.1936 · 5.8639 · 7.0638 · 6.4535 · 5.9759 · 8.4308 · 7.7024 · 3.5445 · 5.7945 | 6.42 · 6.93 · 5.74 · 6.19 · 5.24 · 4.86 · 6.19 · 5.86 · 7.06 · 6.45 · 5.98 · 8.43 · 7.70 · 3.54 · 5.79 | **15/15 OK** |
| **Fila del pie (A-16)** | **4.5913** | **4.59** | OK — y `toBeCloseTo(4.60)` **FALLA** (desvío 0,0087). A-16 confirmada |
| @s17 fondo real al 88 % sobre negro | **[222.64, 214.72, 217.36]** | idéntico | OK |
| @s17 nav `--muted` / logo `--ink` | **4.8915 / 5.3809** | 4.89 / 5.38 | OK — peor under posible |
| Las 10 filas de margen de @s17 | 6.35 · 6.99 · 5.55 · 6.11 · 5.32 · 5.86 · 5.17 · 5.69 · 5.05 · 5.55 | idénticas | **10/10 OK** |
| **@s18 al 82 %** | fondo **[207.46, 200.08, 202.54]**, nav **4.2216 < 4.5 → VIOLACIÓN** | 4.22 | OK. El logo aguanta (4.6440): la asimetría que escondía el fallo, confirmada |
| @s12 `#FFFFFF`/`#C05576` | **4.3729** → `toFixed(2)` = `4.37` | 4.37 | OK, y cae en el hueco (3,0 · 4,5) |
| @s16 `--ink` viejo `#B0466A` | **4.1887** → `4.19`; `<4.5` **y** `>3.0` | 4.19 | OK: la trampa vive justo ahí |
| @s7 primarios / @s8 / @s9 | `L(#FF0000)===0.2126`, `L(#00FF00)===0.7152`, `L(#0000FF)===0.0722`, `L(#FFFFFF)===1`, `ratio===21`, `214.2`, `224.4` | idénticos | **exactos en IEEE-754**: el `toBe`/`toEqual` es legítimo |

La cabecera es **88 %** en `_tokens.scss:66`, no 82 %. Correcto.

## ANTI-TAUTOLOGÍA — CUMPLIDA (verificada, no supuesta)

- `puerta-contraste.test.ts` **no importa** `ratio`/`luminancia`/`canalLineal`/`componer`.
  Un `grep` de esas llamadas sobre ese fichero → **solo aparecen en dos comentarios**
  (líneas 19 y 102). **Cero recomputos.**
- `contraste.test.ts`: los esperados son literales. En @s7 los canales se pasan **literales**
  (`[255,0,0]`), no vía `hexARgb`: ninguna función de producción está en el camino del input.
- Los umbrales **4.5 / 3.0 son literales del test** (`puerta-contraste.test.ts:79-85, 113-129`),
  nunca `umbralDe(...)`.
- @s8 no compara `ratio(a,b)` con `ratio(b,a)` —eso sería tautológico y una fórmula rota lo
  cumpliría—: **ancla las dos al literal 21** (`contraste.test.ts:112-121`). Bien visto.
- @s13 usa `resolverColor` para resolver el fg, pero **compara contra el literal `[192,85,118]`**
  escrito a mano; asevera una propiedad de la MATRIZ, no de la fórmula. Legítimo, y por VALOR
  RESUELTO (caza `--brush`, alias de `#C05576`, que por nombre se escaparía).

## @s6 `toBe` vs `toBeCloseTo` — CONFIRMADO POR MEDICIÓN PROPIA

El craftsman lo levantó; lo verifiqué yo:

- Rama lineal en el corte: `0.0031308049535603713` · Rama potencia: `0.0031308072830676845`
- **Diferencia entre ramas: 2.3295e-9**
- Tolerancia de `toBeCloseTo(..., 8)`: **5e-9** → **NO discrimina** (`2.33e-9 < 5e-9`)

Es decir: con `toBeCloseTo` —incluso a precisión 8— el mutante `<=` → `<` **sobreviviría** y
@s6 sería decorativo. Está escrito con **`toBe`** (`contraste.test.ts:77, 81`). Correcto, y el
input sintético `10.31475` cumple `10.31475/255 === 0.04045` **exacto** (verificado).

## Cobertura de escenarios (@s ↔ test) — 18/18

- @s1  [x] `@s1 convierte "%s" a tres enteros 0-255` (4 filas)
- @s2  [x] `@s2 expande la forma corta "%s"` (3 filas)
- @s3  [x] `@s3 es insensible a mayúsculas/minúsculas`
- @s4  [x] `@s4 lanza ante el hex malformado "%s"` (**6 filas**, con `1px solid #AB5F79`)
- @s5  [x] `@s5 canalLineal(%i) es exactamente %i` (2 filas, anclas exactas)
- @s6  [x] rama LINEAL + rama POTENCIA, con `toBe`
- @s7  [x] `@s7 la luminancia de %s es exactamente %s` (5 filas, primarios CROMÁTICOS)
- @s8  [x] ratio 21 + simetría, los dos anclados al literal
- @s9  [x] `@s9 %s` (4 filas: alfa=1, alfa=0, `--line` .16, `color-mix` .88)
- @s10 [x] `@s10 el token %s vale exactamente %s` (6 filas, contra el fichero REAL) + 3 de parser
- @s11 [x] 16 filas + no-violación + puerta limpia exit 0 + auditabilidad + ruta vigilada
- @s12 [x] 1 violación que acusa par/ratio/umbral + exit != 0 + **enganche al build y NO al dev** + determinismo
- @s13 [x] negativo por valor resuelto + `--accent-dark` + `#C05576` sigue como relleno
- @s14 [x] exit != 0 (2 filas) + `la salida declara que no se evaluó el mínimo` (ver hallazgo 1)
- @s15 [x] 5 tests: ENOENT, token no declarado, hex malformado, `--header-bg` irreconocible, `--header-bg` ausente
- @s16 [x] matriz declara «Studio» + **umbral 4.5 no 3.0** + fixture 4.19 → violación + corregido 5.98 pasa
- @s17 [x] 2 filas centrales (negro puro) + 10 de margen + matriz vigila **nav Y logo** + 4 de espaciado
- @s18 [x] violación con 4.22 y umbral 4.5, leyendo la opacidad del SCSS

**Ningún @s queda sin test.**

### Las preguntas concretas del encargo, respondidas

4. **Verde por vacuidad (@s14) y falla cerrada (@s15): SÍ, la puerta se niega de verdad.**
   Ejecutado: matriz vacía → `codigoSalida 1`, `"no se evaluó el mínimo de pares exigido: 0 de 16"`.
   SCSS que no casa ningún token con matriz NO vacía → `codigoSalida 1`,
   `"...el token --muted que usa la matriz no está declarado en el :root"`.
   El `try/catch` de `puerta-contraste.ts:381-393` **devuelve exit 1 declarando la causa**, no se
   traga la excepción. El puerto declara en la interfaz que `leerScss` **LANZA** (`:347-355`) y el
   doble de @s15 lo honra (lanza ENOENT, no devuelve cadena vacía): real y doble toman el mismo camino.
5. **El negativo (@s13): SÍ**, y por VALOR RESUELTO, que es más fuerte que por nombre.
6. **@s12/@s18 ACUSAN el par exacto.** `describirViolacion` (`:370-374`) emite par + rol + ratio +
   umbral + uso. @s18 asevera `--muted`, `--header-bg`, `#000000`, `4.22` **y** `4.5`. No gruñe.
7. **La trampa del clamp() (@s16): SÍ**, umbral del MÍNIMO (14 px → 4.5), aseverado con
   `toBe(4.5)` **y** `not.toBe(3.0)`.
8. **@s12 engancha al build y NO al dev: VERIFICADO en `package.json:16` y `:14`.**
9. **Consulta por clase CSS: N/A** — esta feature no tiene tests de DOM; el SCSS se verifica
   leyendo el fichero real y parseando el `:root`, no por `styles.card`.

## Disciplina TDD

- **¿Producción sin test que la pida?** NO. Cada guarda la exige un @s: el `>=` de `cumple`
  ← test de frontera con ratios sintéticos; `leerCabecera`/`throw` ← @s15; el `try/catch` ←
  @s15; la guarda del mínimo ← @s14; el `filter(!pasa)` y el `lineas.length > 0` ← @s11.
  **La ausencia de rama «texto grande» (3:1) es una decisión correcta, no un olvido**: ninguna
  fila de la matriz es texto grande, @s16 fija lo contrario para el único candidato, y añadirla
  sería producción que ningún test rojo pidió + un mutante inmortal en el `>=` del tamaño.
  Precedente coherente: el guarda `length===0` de F-01, retirado por lo mismo. NOTA DE TRAZA:
  el acceptance A2 de `feature_list.json` menciona «3:1 (texto grande)»; el `.feature` aprobado
  —que es la ley— no declara ninguna fila de texto grande y @s16 fija justo lo contrario. El día
  que entre una, hace falta escenario nuevo.
- **¿Evidencia de Rojo→Verde→Refactor?** SÍ, con evidencia por ciclo en la bitácora, y del tipo
  que no se puede inventar: el 19,25 % → 65,69 % → 90,75 % → 98,68 % → 100 % de
  `puerta-contraste.ts`, y dos mutantes matados **cambiando el diseño** (el borrado de
  comentarios con `indexOf` + `slice` en vez del `.replace` con regex, cuyos mutantes eran
  equivalentes; y el `^` innecesario de `DECLARACION_DE_TOKEN`) en vez de con tests contrived.
  **0 exclusiones** (F-01 necesitó 1).
- **`tools/puerta-contraste.ts`** es humble object sin decisiones, sin tests y fuera de
  mutación **por diseño ya aprobado** en F-01. Correcto.

## El superviviente del `^` y la puerta humana — VERIFICADO

El craftsman **se negó a tocar el contrato por su cuenta** y lo escaló. Correcto: es la puerta
humana, y el precedente (`| 600  123  456 |` de @s5 en F-01) es exacto.

La fila **aterrizó en el contrato durante este review** (`git diff HEAD -- features/` muestra
`+ | 1px solid #AB5F79 |`) y el test la tiene (`contraste.test.ts:59`). **Verificado que mata de
verdad**, no de boquilla:

| entrada | con `^` (producción) | sin `^` (mutante) | |
| --- | --- | --- | --- |
| `""`, `A23E5F`, `#GGGGGG`, `#12`, `#12345` | rechaza | rechaza | **IDÉNTICO → las 5 NO matan** |
| **`1px solid #AB5F79`** | **rechaza → lanza** | **acepta → slice(1) = "px solid #AB5F79" → [NaN,NaN,NaN]** | **DISCRIMINA → MATA** |

Confirmado además que **la producción no se tocó**: `HEX_VALIDO` sigue siendo
`/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i` (`contraste.ts:20`). El hueco era del contrato y se cerró
donde tocaba. Y no era un mutante equivalente: era un **fallo abierto real** —`--border: 1px
solid #AB5F79` es un valor de token plausible y la puerta lee valores de token del SCSS—.

## El informe de mutación que MINTIÓ — documentado donde toca

Los dos hallazgos que el craftsman levantó están **documentados en la bitácora** (§2 y §3) y,
lo que importa más, **la lección está escrita en el sitio donde muerde**:

- La regla de los cálculos perezosos está en la **cabecera del propio fichero de test**
  (`puerta-contraste.test.ts:24-31`): «TODO cálculo va DENTRO del `it()`… Stryker activa cada
  mutante POR TEST… con los cálculos en el cuerpo del describe este fichero puntuaba 19 % con
  189 supervivientes falsos». Ahí lo verá quien lo vaya a romper. **Arreglado de raíz**
  (helpers perezosos `scssReal()`, `tokensReales()`, `evaluacionesReales()`, `parStudio()`),
  no parcheado.
- **«100 %, 0 supervivientes» con 26 de 53 mutantes en TIMEOUT en un fichero sin bucles: el
  informe mentía.** A concurrencia 1: timeouts 26→0 y apareció el superviviente real. Está en
  la bitácora §2 y toda la mutación de F-03 se midió a concurrencia 1. **RECOMENDACIÓN AL LEAD
  (no bloqueante):** esto ya ha mordido **dos veces** (F-01 y F-03). La bitácora de una feature
  es memoria que nadie relee. Merece subir a `docs/verification.md` o a `stryker.config.json`
  como regla del arnés —*un informe con timeouts no es un informe verde: se remide a
  concurrencia 1*— y es candidato a patrón de memoria organizacional. Para el `mutation_tester`:
  **exigir 0 timeouts** antes de dar por buena una puntuación.

## Calidad (lente de artesano)

- **Arquitectura respetada** (`docs/architecture.md`), la de F-01 sin inventar otra: PURA
  (`contraste.ts`, no lee ficheros ni decide exit) ↔ PUERTA (`puerta-contraste.ts`, decide) ↔
  HUMILDE (`tools/`, solo cablea `node:fs`/`node:process`). Dependencia en un solo sentido.
- **Sin números mágicos**: `CORTE_LINEAL`, `DIVISOR_LINEAL`, `ESCALA_GAMMA`, `EXPONENTE_GAMMA`,
  `COEFICIENTE_*`, `COMPENSACION_DE_REFLEXION`, `UMBRAL_TEXTO_NORMAL`, `UMBRAL_COMPONENTE`,
  `CODIGO_EXITO/FALLO`, `NO_ENCONTRADO`, `PORCENTAJE_COMPLETO`, `MAXIMO_DE_8_BITS`.
- **Funciones cortas, un motivo para cambiar**; nombres reveladores; `readonly`/`Rgb` como tipo.
- **Contrato de errores correcto** (`docs/conventions.md`): `ErrorDeContraste` como error de
  dominio; la puerta devuelve el par código-de-salida + líneas y **no** imprime; el humilde
  escribe a `console.error` y hace `process.exit(codigoSalida)`. Canal de error + código, bien.
- **`valorDelToken` como única puerta de entrada a los tokens** (`:154`): un token no declarado
  lanza **lo use quien lo use** (color plano o cabecera). Buen diseño: no hay coladero.
- **Los comentarios explican el PORQUÉ no obvio** (A-16, C5, C7, el `<=` del glosario, el
  `MINIMO_DE_PARES` literal), no el qué. El aviso «A QUIEN LEA ESTO DENTRO DE SEIS MESES» de
  `_tokens.scss:53-65` está exactamente donde alguien iría a bajar el 88 %.
- **`.prettierignore`**: la caja de los hex la fija el contrato (@s10 exige `#6F525A`) y el
  porqué está escrito. Manda el contrato. Correcto. (`format:check` falla en 76 ficheros **ya
  en HEAD**: deuda preexistente, ajena a F-03; el gate declarado del arnés es `lint`, verde.)
- **La matriz alcanza los colores por TOKEN, no por hex literal** (decisión 2): es el sentido de
  A2 —con el hex en la matriz, revertir `--estado-en-linea` a `#2F9D5F` no rompería el build—.
  Correcto y bien argumentado.

## Checkpoints

- **C1** [x] arnés completo; `bin/harness init` exit 0.
- **C2** [x] una sola feature `in_progress` (id 3); `current.md` describe la sesión.
- **C3** [x] `src/lib` solo los módulos previstos; sin deps nuevas; sin logs de debug ni TODOs
  (el `TODO` de `puerta-contraste.test.ts:24` es **castellano** —«TODO cálculo va dentro del
  `it()`»—, no un marcador; ver nit 3).
- **C4** [x] test por módulo; `bin/harness test` → 183 verdes. Sin mocks del filesystem: @s10/@s11
  leen el **fichero real** y los fixtures de @s15 son SCSS real.
- **C5** [x] sin temporales sospechosos trackeados.
- **C6** [x] `.feature` con @s1..@s18 y `Then` medibles; mapa @s→test en la bitácora; sin
  producción no pedida.
- **C7** [ ] mutación: la valida el `mutation_tester`. La bitácora reporta `puerta-contraste.ts`
  **100 %** (232 muertos, 0 supervivientes, 0 exclusiones) y `contraste.ts` **98,11 %** con el
  único superviviente ya cerrado por la fila de @s4 recién aprobada — **pendiente de remedir**
  (debe dar 100 % y **0 timeouts**, a concurrencia 1).

## Hallazgos (ninguno bloqueante)

1. **MENOR — `puerta-contraste.test.ts:295`: la 2ª fila de @s14 es inerte.** La fila dice
   probar «un SCSS cuyo `:root` no casa ningún token», pero pasa una matriz vacía, y con matriz
   vacía `evaluarMatriz` devuelve la lista vacía **sea cual sea el SCSS**. Verificado
   ejecutándolo: esa fila con `body { color: red; }` y con el SCSS **real** dan **exactamente el
   mismo resultado** (`no se evaluó el mínimo de pares exigido: 0 de 16`). O sea: el `leerScss`
   de esa fila no influye y la fila 2 **es la fila 1 con otro nombre**. Es —con ironía— un test
   verde por vacuidad dentro del escenario que persigue el verde por vacuidad.
   **No bloquea** porque (a) la fila 1 y el test del mensaje cubren el escenario de verdad, y
   (b) la protección para el SCSS que no casa **existe y la verifiqué**: con matriz NO vacía
   falla cerrada declarando la causa (rama de @s15). **Sugerencia:** reescribir esa fila con
   matriz NO vacía aseverando la causa real, o retirarla por redundante.
2. **MENOR — `puerta-contraste.ts:316`: `MINIMO_DE_PARES = 18` no lo fija ningún test.**
   Un `grep` de `MINIMO_DE_PARES` sobre `src/` y `tools/` → solo la declaración y el humilde.
   Los tests inyectan `minimoDePares` a mano (correcto: anti-tautología), así que **bajarlo a 1
   en producción no pondría rojo nada** y desactivaría en silencio la guarda anti-vacuidad del
   build real. La decisión 3 de la bitácora (literal, nunca `.length`) es **acertada** y queda
   registrada como tal; el hueco es solo que su VALOR no está anclado. Mitigado: borrar una fila
   de la matriz ya rompe @s11 (el helper `evaluacionDe` lanza si el par no está). **Sugerencia:**
   anclarlo con un test literal, exactamente como ya se hace —con el mismo razonamiento— en
   `@s11 la puerta vigila src/styles/_tokens.scss` (`:171-173`): «si el humilde leyera otro,
   todo lo anterior no demostraría nada». Lo mismo vale si el humilde pasara `minimoDePares: 1`.
3. **NIT — `puerta-contraste.test.ts:24`:** «TODO cálculo…» hace saltar cualquier búsqueda de
   `TODO`/`FIXME` y la revisión de C3. Es castellano, no un marcador. Un «Todo cálculo» lo evita.

## Cambios requeridos

**Ninguno bloqueante. La feature está lista para la puerta de mutación (`mutation_tester`, C7).**

Los tres hallazgos son de higiene, no huecos: **ningún `@s` queda sin test, ningún literal es
tautológico y ningún valor esperado está mal**. Quedan a criterio del lead antes de marcar
`done`, junto con la recomendación de subir la lección del «informe de mutación con timeouts
miente» a `docs/verification.md` (ya ha mordido en F-01 y F-03).

**Para el `mutation_tester`:** remedir `contraste.ts` con la fila nueva de @s4 (debe dar 100 %)
y **exigir 0 timeouts a concurrencia 1** antes de dar por buena cualquier puntuación de esta
feature. Un informe con 26 timeouts en un fichero sin bucles ya dijo «100 %» una vez, y era mentira.
