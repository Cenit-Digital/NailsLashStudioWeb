# F-05 `cero_terceros` — destilación Gherkin (gherkin_author, 2026-07-17)

> **Entregable:** `features/cero_terceros.feature` — **37 escenarios, `@s1`..`@s37`**.
> **Estado:** `pending` → **`spec_ready`**. ⏸ **NO APROBADO. NO SE IMPLEMENTA.**
>
> **Fuentes leídas, en este orden:** `project-spec.md` §Feature 5 (la FUENTE) ·
> `progress/f05_verificacion_previa.md` (los HECHOS; **manda donde contradiga**) ·
> `features/cascaron_semantico.feature` (formato y listón: 35 escenarios) · `docs/gherkin.md` ·
> `features/tokens_paleta_contraste.feature` (cómo se destila una puerta con matriz).

---

## 1. ⏸ EL CONTRATO NO ESTÁ APROBADO — y por qué eso está escrito en la cabecera del `.feature`

**A-23 bloquea este contrato.** Los **acceptance 2 y 5** de `feature_list.json` §5 son
**insatisfacible** e **inmedible**. **No se destilan tal cual.** Lo que el `.feature` destila es
**la propuesta del lead** — y eso **cambia los criterios de aceptación**, que es **exactamente lo
que un `gherkin_author` no puede cerrar**.

La marca `⏸` va **en la cabecera del fichero, en el primer bloque visible**, con instrucción
expresa al `tdd_craftsman` de **parar mientras siga puesta**. **Precedente de F-03: el craftsman se
negó a implementar con la marca puesta, y tenía razón.**

| # | Qué espera la puerta | Qué hace el contrato mientras tanto |
| --- | --- | --- |
| **A-23** | reescribir acceptance 2 (*«PETICIÓN AUTOMÁTICA»*) y 5 (mutadores **reales**) | los destila **como propuesta**, marcados ⏸ en la traza |
| **A-24** | `puerta_legal` = atribución normativa falsa; y la descripción de F-11 | **NO hereda ninguna de las dos frases**; escribe el criterio de proyecto |
| **A-27** | ¿deuda de binarios de F-01 declarada, o escenario nuevo en una feature `done`? | **cero escenarios sobre `tools/puerta-placeholders.ts`**; declarada en @s34 |
| **A-28** | ¿`latin-ext` (+6 woff2) o se acepta el tofu? | destila la propuesta (aceptar); **@s28 avisa de que su tabla cambia si la puerta decide otra cosa** |

---

## 2. Mapa `acceptance` → `@s`

| Acceptance de `feature_list.json` §5 | Escenarios | Nota |
| --- | --- | --- |
| **A1** `detectarOrigenesExternos(html\|css)` devuelve los orígenes externos, con allowlist vacía | @s1, @s2, @s3, @s4, @s5, @s6, @s7, @s8, @s9, @s19, @s25, @s34 | ✅ destilado tal cual |
| **A2** ⏸ *«el build falla si el artefacto contiene CUALQUIER origen externo»* | **positivo:** @s26, @s27, @s35 · **negativo:** @s10, @s11, @s12, @s13, @s14, @s15, @s16, @s17, @s18 | 🔴 **INSATISFACIBLE** → **A-23**. Destilada la propuesta: *«ninguna **PETICIÓN AUTOMÁTICA**»* |
| **A3** ni una petición a `fonts.googleapis.com` ni a `fonts.gstatic.com` | @s4, @s26, @s29 | ✅ los **dos** orígenes, en filas separadas |
| **A4** no se solicita `wght@300` | @s4, @s28, @s29 | ✅ el 300 entra como `@font-face` de peso 300 → conjunto distinto → violación |
| **A5** ⏸ *«mutar la comparación de origen o el predicado de allowlist rompe un test»* | @s20, @s21, @s23, @s24, @s7, @s30 | 🔴 **INMEDIBLE** → **A-23**. Destilada la propuesta, **nombrando mutadores reales** |
| Guarda anti-vacuidad + falla cerrada (spec §Modos de error) | @s28, @s29, @s30, @s31, @s32, @s33 | no está en el acceptance; **la spec la exige como obligatoria** |

### Mapa mutante → escenario (la reescritura de A5 que va a la puerta)

| Mutador **REAL** de Stryker 9.6.1 | Muere en |
| --- | --- |
| `FilterRemoval` (`.filter(p)` → `origenes`) | **@s20 y SOLO @s20** |
| `BooleanLiteral` (el `!` del predicado) | @s21 (y cualquiera con ≥1 origen) |
| `ArrayDeclaration` (`[…]` → `[]`) | @s30 (la guarda de la guarda) |
| `EqualityOperator`, `StringLiteral` | @s23, @s26, @s27 |
| `MethodExpression` (`toLowerCase`⇄`toUpperCase`, `startsWith`⇄`endsWith`) | @s7, @s11, @s23 |
| `Regex` (`^`/`$`) | @s24 |

❌ **`.includes` NO se muta en Stryker 9.6.1** [V, dos vías]. **Cero escenarios lo mencionan**, y el
`.feature` lo **prohíbe expresamente** en @s21 y en la cabecera.

---

## 3. Decisiones de destilación

1. **El eje es «petición automática ≠ hiperenlace»**, y **el negativo pesa tanto como el positivo**
   (9 escenarios de 37). Sin @s10..@s18, *«detectar todo lo que parezca una URL»* pasa @s1..@s9
   igual de bien, y **F-05 rompe F-04 y F-02, las dos `done`**.
2. **@s6 y @s11 son gemelos y van juntos.** La regla del conjunto tokenizado **no se puede anclar
   con uno solo**: `"alternate"` es **prefijo** de `"alternate stylesheet"`, así que cualquier
   implementación por cadena **acierta uno y falla el otro, siempre**. Es el falso negativo que el
   refutador cazó (§1).
3. **@s16 (`disabled`) contrasta a propósito con @s3 y @s5.** En @s3/@s5 la spec **no decide** y
   F-05 **elige** (criterio de proyecto, declarado). En @s16 **la spec sí decide** («return false»)
   y F-05 **obedece**. *La diferencia entre «no hay letra, elijo» y «hay letra, la ignoro» es la
   credibilidad del contrato.*
4. **@s19 NO mata a `FilterRemoval` — y está escrito en su propio comentario.** Es el error más
   probable de esta feature: *«la allowlist real es vacía, ya está cubierto»*. **Medido: es
   equivalente.** Por eso @s20 lleva triple 🔴 y la instrucción de no borrarlo.
5. **@s21 existe aunque lo mate cualquier escenario con ≥1 origen**, para que *«quitar el `!` NO es
   equivalente; excluirlo sería FRAUDULENTO»* esté **en un sitio citable** cuando el informe de
   Stryker apriete.
6. **La guarda es lista declarada, no `MINIMO_DE_PARES`** (forma de F-04, no de F-03). Razón
   decisiva: **ninguno de los 16 mutadores muta literales numéricos** → un `18` **no genera
   mutante**; `ArrayDeclaration` **sí ataca la lista** → **@s30 lo mata**. *La forma elegida es la
   que se puede demostrar viva.*
7. **@s28 cuenta PARES `[familia, peso]`, JAMÁS ficheros**: cada `@font-face` emite `woff2` **y**
   `woff` (**12 ficheros para 6 pares**) y un `.woff2` <4096 B **no deja fichero** (@s17).
8. **@s26 y @s27 son una pinza, y ninguna sobra.** La de la salida cubre `--base` por CLI y
   `renderBuiltUrl` (**no viven en `vite.config.ts`**); la de la config **deja rastro en el diff y
   rompe donde está la causa**. Escrito en el `.feature` para que **nadie borre una por
   «redundante»**.
9. **F-05 no lleva `existe*`, y @s32 lo razona.** No es dogma: es **2 de 3** [V]. **F-05 no
   necesita distinguir «no está» de «está y está mal»** → sin escenario que la exija, `existe*`
   sería **producción sin test rojo y mutante inmortal**.
10. **@s37 es un `[I]` declarado, no un hecho.** Que el nombre de familia sobreviva al CSS
    minificado **se mide en el primer test**. Si nace en rojo, **se vuelve a la puerta humana**.
11. **@s7 y @s24 son condicionales al diseño, y se declara.** Si el diseño no usa `.toLowerCase()`
    ni anclas, **el mutante no existe** — pero los escenarios **aseveran comportamiento, no
    implementación**, y **se declaran en `progress/mutation_cero_terceros.md`, no se borran**.

## 4. Lo que se dejó FUERA, a propósito

- **`font-display: swap`**: hecho **medido** (176/176) pero **NO documentado**, y **fuera del
  acceptance**. La spec lo llama «propuesta subordinada a A-23». **Cero escenarios.** Si el humano
  lo quiere, entra con el suyo.
- **`tools/puerta-placeholders.ts`** (A-27): **cero escenarios**. Es F-01, `done`.
- **El `<a href>` a Facebook**: **no se prohíbe**. @s12 lo protege activamente.
- **El JS de `dist/assets/`**: hueco **declarado** en @s34, **no cerrado**. Otra feature.
- **Toda la `puerta_legal` heredada**: cero apariciones de «art. 22.2 LSSI», «sin cookies → sin
  banner», «elimina banner/CMP», «Fashion ID obliga», «autoalojar = cero almacenamiento».

## 5. Avisos al lead (5)

1. ⏸ **A-23 bloquea.** Destilada la propuesta del lead. **El contrato no está aprobado.**
2. ⏸ **A-24**: la `puerta_legal` de `feature_list.json` §5 **sigue diciendo la frase falsa**, y la
   **descripción de F-11 también** («la decisión que por sí sola evita el banner de cookies»). **El
   `.feature` no las hereda, pero el `feature_list.json` sigue mintiendo hasta que la puerta lo
   corrija.**
3. ⏸ **A-27**: @s34 declara la deuda; **no la cierra**.
4. ⏸ **A-28**: si la puerta añade `latin-ext`, **la tabla de @s28 cambia** y este contrato **se
   re-aprueba**.
5. 🔴 **Nada más de la spec me pareció mal.** La verificación previa y `project-spec.md` §Feature 5
   son **coherentes entre sí** en todo lo que este contrato destila; las tres contradicciones que
   quedan son **con `feature_list.json`**, y son exactamente A-23 y A-24. **Verifiqué de primera
   mano y confirmé:** `vite.config.ts` **no declara `base`** · `@fontsource/dm-sans` y
   `@fontsource/outfit` están en `package.json:29-30` **y no se importan** · `REDES.facebook` está
   en `src/lib/site.ts` · la puerta se encadena en `build`, **nunca en `dev`**.

---

# Ronda de reparación (2026-07-17)

Revisión adversarial: **31 agentes, 2,14M tokens, 6 lentes**. **25 alegados → 23 CONFIRMADOS** por
un verificador independiente (3 BLOQUEANTES · 14 GRAVES · 6 MENORES).
**Resultado: 21 correcciones aplicadas, 2 rechazadas con medición propia. Escenarios: @s1..@s40**
(eran 37; **+3**: @s38, @s39, @s40).

**El patrón, por tercera feature seguida (F-03, F-04, F-05): NINGUNA decisión de F-05 cayó. Cayeron
los PORQUÉS.** No reparé nada «porque lo dijera el hallazgo»: **remedí todo lo portante**, y por eso
**dos correcciones que venían «ya verificadas» resultaron falsas al medirlas** (abajo).

## Los 3 BLOQUEANTES

### 1. @s24 y la fila `Regex` — HECHO INVERTIDO (el peor defecto del contrato)

El contrato decía que los mutantes `Regex` salen de las anclas y que **«si el diseño no usa anclas,
ese mutante no existe»**. **Falso y al revés.** Remedido por mí:

- `regex-mutator.js` (instrumenter 9.6.1 instalado) **no tiene ni una línea sobre anclas**: delega
  el patrón **entero** en `weaponRegex.mutate(pattern, flags, {mutationLevels:[1]})`.
- Ejecutando **weapon-regex 1.3.6**: **`/\s+/` — la tokenización de `rel` que el propio contrato
  manda, sin una sola ancla → 2 mutantes** (*Quantifier removal*, *Predefined character class
  negation*). La extracción de `url()` → **10 mutantes, 0 anclas**. Un patrón **con** anclas
  (`^/assets/.*$`) → 3 mutantes, **solo 2 son anclas**.

→ Fila reescrita (weapon-regex nivel 1, 5 familias, **toda regex literal genera mutantes tenga o no
anclas**); **borrado** el «CONDICIONAL AL DISEÑO… ese mutante no existe». La cláusula condicional se
**partió**, no se borró entera: **sigue siendo cierta para @s7** (`MethodExpression` sí depende del
método presente), **falsa para @s24**.

**Y por qué @s24 mataba CERO — esto no estaba en el hallazgo, lo medí yo:** el `Then` **solo
aseveraba la cuenta**, y la cuenta es **ciega** a las mutaciones de valor. Con `[^']`→`[']`,
`url('/assets/m.woff2')` extrae `'/assets/m.woff2'` con comillas → **sigue sin ser externo** →
0 = 0 → **sobrevive**. **La cuenta solo se mueve si la fila es EXTERNA.** Por eso:

- El `Then` **ahora asevera el ORIGEN**, no solo la cuenta.
- Filas nuevas **medidas**: `url('https://cdn.tercero.com/m.woff2')` (mata `[^']`→`[']`),
  `url("https://…")` (mata `[^"]`→`["]`), `url( https://… )` (mata `[^)]`→`[)]` y el `\s*` de
  apertura).

### 2. @s26 — el `Given` no declaraba `paresEsperados` (la forma exacta del `4,60` de F-03)

`paresEsperados` viaja en la `peticion` del **mismo** punto de entrada que corre la guarda de
fuentes. **@s26 era el único de los 9 escenarios de la puerta que no declaraba ni la lista ni «con
todos los @font-face esperados»** — olvido, no diseño (asimetría delatora: @s28 declara sus cuatro
precondiciones y @s26 declaraba dos). **Las dos lecturas naturales daban ROJO contra una
implementación correcta** (6 pares → «faltan 5» → exit 1; `[]` → dispara @s30).

→ Añadidos los otros 5 `@font-face` + la lista literal de 6 pares. **Y decidido explícitamente lo
que el contrato no decidía:** el fixture **declara `font-weight: 400`**, así que el par bajo prueba
es `("Manrope",400)` **sin ambigüedad y sin que nadie tenga que suponer nada**. *No se destila regla
de defaulting (`font-weight` ausente → 400): ningún escenario la exige → sería producción sin test
rojo, la misma razón por la que F-05 no lleva `existe*`.*

### 3. @s28/@s30 + ANTI-TAUTOLOGÍA — prohibición absoluta falsa + mecanismo de muerte falso

- **La prohibición** («JAMÁS se importa `PARES_DE_FUENTE_ESPERADOS`») **prohibía el ancla que F-04 ya
  usa y que @s30 citaba como «PRECEDENTE LITERAL»**. Comprobado: `puerta-cascaron.test.ts:24`
  **importa** `RUTAS_ESPERADAS`; `:901` → `expect([...RUTAS_ESPERADAS]).toEqual(['/'])`; `:905` →
  `.length > 0`. → **Ejes separados**: prohibido como **valor esperado de un test de
  comportamiento**; **obligatorio** en el **escenario-ancla**.
- **«@s30 mata a `ArrayDeclaration`» es FALSO** (escrito 3 veces, y era la razón nº3 —la única que
  apela a Stryker— para elegir la lista declarada): el mutador solo dispara sobre
  `isArrayExpression()` **en el fichero mutado**, y @s30 **inyecta su propio `[]`** → **ningún
  escenario evaluaba la constante de producción** → con `break: 100` el mutante sería **INMORTAL y
  la feature no cerraría**.
- **El contrato NUNCA decía dónde vive la constante.** → Declarado: **`src/lib/puerta-terceros.ts`**
  (dentro de `mutate`), **cableada por el humilde** como `tools/puerta-cascaron.ts:44`.

→ **@s38 añadido** (el ancla, forma @s26/@s27 de F-04). **@s30 se queda**: vigila el
*comportamiento* ante lista vacía — otra cosa, y también hace falta. *Nota honesta escrita en el
contrato: esto hace que la lista declarada **necesite un ancla que `MINIMO_DE_PARES = 18` no
necesitaba**; la decisión se sostiene por las razones 1 y 2, no por la 3.*

## Los GRAVES y MENORES aplicados (18)

| # | Dónde | Qué se corrigió |
| --- | --- | --- |
| 4 | @s5 | **Inerte**: «ninguna página usa la clase» no entra por ningún parámetro (la entrada son los BYTES). Era un duplicado **más débil** de @s4 fila 4. → **Outline de pinza** con el HTML entrando de verdad por `recursos`: las dos filas dan el mismo resultado, **y eso es la aserción**. |
| 5 | @s37 | `Then` no medible contra `{codigoSalida, lineas}` (único «se reconoce» del fichero); «par» sin peso; las 4 filas colapsaban a exit≠0 por 5 pares faltantes. → Reescrito: artefacto de 6 `@font-face`, salida real, par con peso, + Given de `vite.config.ts`. |
| 6 | @s23 | La tabla **no mataba a `endsWith`**: el caso que el comentario nombraba (`evil-fonts.googleapis.com`) **no era fila**. Medido: `endsWith` sobrevivía **las 7**. → Fila añadida. |
| 7 | @s34 | **Inerte**: `Then` no observable + fixture **sin contenido** → un humilde **sin filtro** pasaba las 4 filas. → Partido en **@s34** (comportamiento, **nace rojo si el filtro se rompe**) y **@s40** (ancla, forma `diferidos.test.ts:89-96`). |
| 8 | @s17 + cabecera | **6.192 B era ERROR DE ÁMBITO** marcado [V] dos veces: es `outfit-latin-ext-100-normal.woff2`, de la dependencia **muerta** que F-05 da de baja. Mínimo real **14.044 B** (**3,4×**, no 1,5×). Las 3 familias de F-05 **ni están instaladas** → el §4 solo podía medir el ámbito equivocado. **El hecho era autodestructivo.** |
| 9 | global | **Ningún escenario aseveraba la allowlist `[]` de PRODUCCIÓN** (34/34 pasos la inyectan). Un `["fonts.googleapis.com"]` en el humilde dejaba **los 37 escenarios y el build VERDES** y embarcaba Google Fonts. → **@s39 añadido**. |
| 10 | cabecera l.52 + @s12 + @s35 | **El `<a href>` a Facebook NO EXISTE** (comprobado por mí: **0** en `dist/index.html`; vive como literal en `app-*.js`; **ningún `.tsx` renderiza `REDES`**). → @s12 pasa de descriptivo a **preventivo**; @s35 lo marca «lo añadirá F-12». **El recuento de 10 se conserva: lo falso era el mecanismo.** |
| 11 | @s34 + cabecera | «Las **únicas** URL de los `.js` son mensajes de error y namespaces» **falso**: hay **3 clases**, y la 3ª son **los datos de F-02/F-04 que Rollup inlinea** (24, no 21). **La razón verdadera es más fuerte**: un grep del `.js` **acusaría a dos features `done`**. |
| 12 | @s24 + @s8 + cabecera | «El `^` fue **EL ÚNICO SUPERVIVIENTE REAL DEL REPO**» **falso** (F-01 tuvo 2; **F-04 tuvo 58**) y **§2 apunta al regex del teléfono de F-01, no al `^` de F-03**. → Reescrito con las dos veces y sus fuentes verdaderas. |
| 13 | @s10 | Llamaba «**tabla normativa**» a la tabla de §4.6.8, que la spec declara **literalmente no normativa** — **la tabla que @s6 existe para desautorizar**. Autocontradicción a 100 líneas. |
| 14 | @s17 + cabecera | «`grep -rn 'woff'` sobre la lógica de assets de Vite 7 → **CERO RESULTADOS**» **falso**: da **5 aciertos**, y **son la lógica de assets**. Frase **autorrefutante** (citaba `config.js`, donde `woff` sale 4 veces). Conclusión intacta vía `shouldInline`. |
| 15 | cabecera + @s13 + @s35 | La prueba de A-23 estaba **8/10 fuera del alcance `(html\|css)`**. → **Separada por alcances**, y **es más fuerte**: la puerta ve **DOS**, los **dos de F-04**, y **bastan solos**. **F-02 no puede romperse por esta puerta.** |
| 16 | @s35 | «LAS DIEZ URL» **falso** por aritmética (enumeraba 8) y por relevancia (7 viven en `.js` que la puerta no lee). |
| 17 | cabecera + @s6 + @s7 | «tokens separados **por espacio**» **más estrecho que la norma** («split on **ASCII whitespace**»): **4 de los 5 separadores daban falso negativo**, justo el caso de @s6. + fila TAB en @s7. Y la case-insensibilidad es **de la comparación de keywords**, no de la tokenización. |
| 18 | @s20 + mapa | «**@s20 Y SOLO @s20**» **falso**: la **1ª fila de @s23 también mata** `FilterRemoval` (cumple el predicado que @s20 enuncia). **Ninguno se borra.** |
| 19 | @s1 | `construccion` era el **mismo placeholder** en Given y Then → exigía **en silencio** devolver la etiqueta de cierre (6 de 14 filas la llevaban). → Columna **partida** en `marcado` / `construccion` + regla escrita. |
| 20 | @s1 | **No había ni un `http://` positivo** en los 25 escenarios del detector → borrar `http:` de la lista blanca daba **67/67 en verde**. → Fila `http://` añadida. |
| 21 | cabecera A-23 | «176/176 `@font-face`» **sin ámbito**: solo cuadra sumando `@fontsource-variable/manrope`, **el paquete que el contrato prohíbe**. → **164/164** en las 3 familias que F-05 hornea. |

## Las 2 RECHAZADAS — con medición, no con opinión

La corrección del bloqueante 1 traía filas concretas «ya redactadas y ya verificadas». **Las medí y
no muerden.** Queda escrito en @s7 y @s24 para que nadie las reintroduzca «de memoria»:

1. **`rel="alternate<TAB>stylesheet"` y el doble espacio NO matan `\s+`→`\s`.**
   `"alternate  stylesheet".split(/\s/)` → `["alternate","","stylesheet"]`, que **sigue conteniendo
   `stylesheet`** → **equivalente para la pertenencia al conjunto**. Y `\s+`→`\S+` **ya lo mata
   cualquier fila de `stylesheet` existente** (@s2, @s6): no hacía falta fila nueva.
   → **La fila TAB entra igualmente, pero por LETRA DE NORMA** (corrección 17), **no por mutación**.
   **No se finge que mate lo que no mata.**
2. **`url('a"b')` NO mata `[^']`→`[']`.** Espera **0**, y la mutación **no mueve la cuenta** (con
   comillas o sin ellas, `a"b` no es externo). Lo que sí lo mata es **un `url()` externo con comillas
   simples** — medido: **1 → 0**.
   *(Y `url( … )` con espacios **no mata `\s*`→`\S*` del cierre**, como se afirmaba: `[^)]*` ya se
   come el espacio final. Sí mata el `\s*` de **apertura** y `[^)]`→`[)]`. La fila entra por eso.)*

## A-23 reformulada (🔴 CAMBIA — y sigue ⏸ del humano)

Con **umbral 1.0 y 0 exclusiones** (`harness.config.json`; `stryker.config.json` → `break: 100`),
**habrá mutantes `Regex` sí o sí**. La pregunta que el contrato **no formulaba** ya está escrita:

- **(a) PROPUESTA DEL LEAD:** @s24 crece con filas que **muerden de verdad** y **asevera el origen,
  no la cuenta**. **Es lo que hizo F-03** (19 % → 100 % **sin tocar producción, solo arreglando los
  tests**) **y lo que ya funcionó en F-04** (58 supervivientes, **0 exclusiones**).
- **(b)** el contrato acepta **por escrito** que algún superviviente `Regex` se justifique en
  `progress/mutation_cero_terceros.md`, y el umbral de F-05 no es 1.0.

⚠️ **HONESTIDAD, Y ESTÁ ESCRITA EN EL CONTRATO:** los **13 supervivientes** y el **78,99 %** están
medidos sobre **un prototipo desechable**, **no sobre el código real de F-05, que NO EXISTE**. **Otra
implementación tendrá otro conjunto. NO se promete un 100 % que nadie ha medido sobre el código
real.** **Superviviente conocido y declarado:** `\s*`→`\S*` del cierre **puede ser genuinamente
equivalente** con una extracción `[^)]*`. **Si algún `Regex` resiste, el `tdd_craftsman` ESCALA AL
HUMANO — no lo excluye en silencio ni baja el umbral por su cuenta.**

## Lo que NO se cerró (sigue ⏸ del humano)

**A-23, A-24, A-27 y A-28 siguen abiertas. La marca ⏸ se queda y el contrato NO está aprobado.**

- **A-27**: @s40 ancla **el filtro de F-05**; **no cierra** la deuda de `tools/puerta-placeholders.ts`,
  que es de **F-01 (`done`)** y exige escenario propio en su feature. **Reabrir una `done` es del
  humano.**
- **A-28**: si la puerta añade `latin-ext`, cambian **@s28 y @s38**, y el contrato **se re-aprueba**.

## Fuentes primarias remedidas por mí en esta ronda

`regex-mutator.js` + **weapon-regex 1.3.6 ejecutado** · `array-declaration-mutator.js:7` ·
`puerta-cascaron.ts:828` · `puerta-cascaron.test.ts:24,901,905` · `diferidos.test.ts:89-96` ·
`stryker.config.json` (`break: 100`) · `harness.config.json` (`threshold 1.0`, `targets []`) ·
`dist/index.html` (`<a href>` ×3, **0 facebook**) · `site.ts:45-48` · `grep -rn REDES src/ --include=*.tsx` → 0 ·
`node_modules/vite/dist/node` (`woff` → **5 aciertos**) · el fichero de **6192 B** (`@fontsource/outfit`) ·
`ls node_modules/.pnpm | grep fontsource` → **solo dm-sans y outfit**.
**Sondas ejecutadas y borradas; `git status` limpio.**

## Nota sobre `progress/f05_verificacion_previa.md`

El §0 **ya está corregido en origen** (bloque «🔴 CORREGIDO 2026-07-17») para el error de hecho del
`<a href>` a Facebook: **lo comprobé y no procede repetirlo**. **Siguen sin corregir en ese fichero**,
y el `.feature` los corrige de su lado dejando constancia: `:90` («Tabla normativa»), `:112` («tokens
separados por espacio»), `:229` (el glob inútil del grep de `woff`) y `:233` (el 6.192 B).

**Lección reutilizable: una verificación NO PUEDE medir un ámbito que no existe en disco; si no está
instalado, se instala (como sí se hizo para el 119.540) o se marca NO VERIFICADO.**
