# F-05 `cero_terceros` — destilación Gherkin (gherkin_author, 2026-07-17)

> **Entregable:** `features/cero_terceros.feature` — **43 escenarios, `@s1`..`@s43`**.
> **Estado:** ✅ **APROBADO POR LA PUERTA HUMANA EL 2026-07-17** (40 escenarios) **+ AMPLIACIÓN
> APROBADA POR EL HUMANO EL 2026-07-17** (→ **43**), **tras la escalada de la prueba de mutación**.
> Las **cuatro** preguntas (A-23, A-24, A-27, A-28) **cerradas**; **las 21 marcas `⏸` retiradas**.
> **El estado vigente es §Ampliación por mutación (2026-07-17)**, al final del fichero.
> *(El «37 escenarios» de antes era previo a la ronda de reparación, que añadió @s38/@s39/@s40.)*
>
> **Fuentes leídas, en este orden:** `project-spec.md` §Feature 5 (la FUENTE) ·
> `progress/f05_verificacion_previa.md` (los HECHOS; **manda donde contradiga**) ·
> `features/cascaron_semantico.feature` (formato y listón: 35 escenarios) · `docs/gherkin.md` ·
> `features/tokens_paleta_contraste.feature` (cómo se destila una puerta con matriz).

---

## 1. ~~EL CONTRATO NO ESTÁ APROBADO~~ — **HISTÓRICO: aprobado el 2026-07-17**

> ⚠️ **Todo lo que sigue en esta sección (y en §2 y §5) describe el estado ANTES de la puerta.
> Se conserva como rastro de por qué se paró.** **El estado vigente es §Puerta humana (2026-07-17)**,
> al final: **las 4 preguntas cerradas, las 21 marcas `⏸` retiradas del `.feature`, TDD liberado.**

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

## 5. Avisos al lead (5) — ✅ **LOS 4 PRIMEROS, RESUELTOS EN LA PUERTA DEL 2026-07-17**

*Histórico. El estado vigente está en §Puerta humana, al final.*

1. ~~**A-23 bloquea.** Destilada la propuesta del lead. **El contrato no está aprobado.**~~
   → ✅ **APROBADA la propuesta: acceptance 2 y 5 reescritos. Umbral 1.0, 0 exclusiones.**
2. ~~**A-24**: la `puerta_legal` de `feature_list.json` §5 **sigue diciendo la frase falsa**, y la
   **descripción de F-11 también** («la decisión que por sí sola evita el banner de cookies»). **El
   `.feature` no las hereda, pero el `feature_list.json` sigue mintiendo hasta que la puerta lo
   corrija.**~~
   → ✅ **CORREGIDO: la `puerta_legal` de F-05 Y la de F-11 ya dicen CRITERIO DE PROYECTO.**
   **`feature_list.json` ya no miente.**
3. ~~**A-27**: @s34 declara la deuda; **no la cierra**.~~
   → ✅ **APROBADO que se quede DECLARADA. F-05 no toca F-01. @s34/@s40 anclan el filtro propio.**
4. ~~**A-28**: si la puerta añade `latin-ext`, **la tabla de @s28 cambia** y este contrato **se
   re-aprueba**.~~
   → ✅ **SOLO `latin`. @s28 y @s38 NO cambian. Límite declarado; `latin-ext` exigiría escenario.**
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

## A-23 reformulada (🔴 CAMBIA) — ✅ **CERRADA: el humano eligió (a) el 2026-07-17**

Con **umbral 1.0 y 0 exclusiones** (`harness.config.json`; `stryker.config.json` → `break: 100`),
**habrá mutantes `Regex` sí o sí**. La pregunta que el contrato **no formulaba** ya está escrita:

- ✅ **(a) ELEGIDA POR EL HUMANO. PROPUESTA DEL LEAD:** @s24 crece con filas que **muerden de
  verdad** y **asevera el origen, no la cuenta**. **Es lo que hizo F-03** (19 % → 100 % **sin tocar
  producción, solo arreglando los tests**) **y lo que ya funcionó en F-04** (58 supervivientes,
  **0 exclusiones**).
- ❌ **(b) RECHAZADA:** *no* se acepta justificar supervivientes `Regex` en
  `progress/mutation_cero_terceros.md`, y **el umbral de F-05 NO baja: sigue siendo 1.0.**

⚠️ **HONESTIDAD, Y ESTÁ ESCRITA EN EL CONTRATO:** los **13 supervivientes** y el **78,99 %** están
medidos sobre **un prototipo desechable**, **no sobre el código real de F-05, que NO EXISTE**. **Otra
implementación tendrá otro conjunto. NO se promete un 100 % que nadie ha medido sobre el código
real.** **Superviviente conocido y declarado:** `\s*`→`\S*` del cierre **puede ser genuinamente
equivalente** con una extracción `[^)]*`. **Si algún `Regex` resiste, el `tdd_craftsman` ESCALA AL
HUMANO — no lo excluye en silencio ni baja el umbral por su cuenta.**

## ~~Lo que NO se cerró~~ → ✅ **CERRADO TODO EL 2026-07-17. Ver §Puerta humana al final.**

*Sección histórica: decía «A-23, A-24, A-27 y A-28 siguen abiertas; la marca ⏸ se queda y el
contrato NO está aprobado». **Ya no.** El humano las cerró las cuatro. Se conserva el rastro
porque el razonamiento de arriba es lo que leyó para decidir.*

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

---

# ✅ Puerta humana (2026-07-17)

**LA PUERTA SE ABRIÓ.** El humano decidió **las cuatro preguntas** y aprobó **este** contrato, con
**los 40 escenarios TAL CUAL**. **No las cerró el lead ni el `gherkin_author`: las cerró el humano.**
Aquí se **registra el hecho**. El acta vive en `feature_list.json` §5 → campo **`puerta_humana`**;
**donde este fichero y ese campo se leyeran distinto, MANDA `feature_list.json`.**

## Las 4 decisiones

| # | Decisión del humano | Efecto |
|---|---|---|
| **A-23** | ✅ **APROBADA la propuesta del lead.** Acceptance **2** y **5** **REESCRITOS** en `feature_list.json` §5: el 2 → *«una **PETICIÓN AUTOMÁTICA** a un origen externo»*; el 5 nombra **mutadores REALES** y **PROHÍBE** pedir que se mute `.includes`. 🔴 **Eligió la opción (a): SIN supervivientes `Regex` preaprobados.** | **UMBRAL 1.0 INTACTO, 0 EXCLUSIONES.** La opción (b) —justificar supervivientes y bajar el umbral— **RECHAZADA**. **Si un `Regex` resiste → el `tdd_craftsman` ESCALA AL HUMANO.** El contrato ya no destila una *propuesta*: destila **el acceptance vigente**. |
| **A-24** | ✅ **APROBADA.** `puerta_legal` de **F-05 y de F-11** corregidas en `feature_list.json`. | **La justificación de F-05 es CRITERIO DE PROYECTO, NO una norma.** Las prohibiciones de vocabulario del `.feature` pasan de lectura del lead a **letra del `feature_list`**. |
| **A-27** | ✅ **APROBADA la postura del lead: la deuda se queda DECLARADA.** | **F-05 NO toca `tools/puerta-placeholders.ts` ni `features/puerta_placeholders.feature` (Ley 1).** F-05 **sí** filtra por extensión en **su propia** puerta (@s34, @s40). **La deuda de F-01 sigue VIVA y DECLARADA.** |
| **A-28** | ✅ **APROBADA la propuesta del lead: SOLO subset `latin`** (`U+0000-00FF`, todo el español). | **`PARES_DE_FUENTE_ESPERADOS` NO CAMBIA: los 6 pares se quedan.** @s28 y @s38 intactos. **Límite DECLARADO por escrito:** `Ł`/`ř`/`ğ` → **TOFU sin error**; **`latin-ext` entrará el día que exista un nombre REAL que lo exija, CON SU ESCENARIO.** |

## Lo que hice, y lo que NO

- **21 marcas `⏸` retiradas**, una por una, **reescritas según su decisión** — incluidas las que
  citaba el lead: `:6` (cabecera), `:115`, `:558` (F-11: **ya corregida en `feature_list.json`**),
  `:590`, `:675` (A2), `:681` (A5), **`:1501` (la escalada — REFORZADA)**, `:1692` y `:2109`
  (A-28, **conservando la nota de que `latin-ext` exigiría un escenario**), `:1930`/`:1935`/`:2163`
  (A-27), `:1987`. **Quedan 0** (`grep -c "⏸"` → **0**).
- **El bloque de congelación se invirtió:** donde decía «MIENTRAS ESTA MARCA ⏸ SIGA PUESTA, NO
  ESCRIBAS NI UN TEST», ahora dice 🟢 **«LA PUERTA ESTÁ ABIERTA. PUEDES IMPLEMENTAR F-05»**, con
  **5 condiciones no negociables**: Ley 1 · los 40 escenarios son el contrato aprobado (si uno es
  imposible, **PARA**) · **umbral 1.0, 0 exclusiones, escalar** · **no tocar F-01/A-27** · **nada
  de vocabulario normativo falso (A-24)**.
- **NO toqué ni un escenario.** Verificado mecánicamente: `diff` de **todas las líneas
  no-comentario** contra `HEAD` → **IDÉNTICO, 0 líneas ejecutables tocadas**. 40 `Scenario`,
  40 tags `@sN`. Solo cabecera, comentarios y marcas.
- **NO toqué `feature_list.json`** (ya lo había aplicado el lead).
- **NO reintroduje** ninguna atribución normativa falsa.

## Lo que el `tdd_craftsman` debe leer antes de escribir la primera línea

1. La **cabecera** del `.feature`: las 4 decisiones y las 5 condiciones.
2. **@s24 y su bloque de escalada** (la marca de `:1501`, ahora reforzada): **el superviviente
   conocido `\s*`→`\S*` del cierre NO está preaprobado.** Nombrarlo **no es licencia para
   excluirlo**: es un aviso de dónde va a doler.
3. **Honestidad de medición, que sigue en pie:** los **13 supervivientes** y el **78,99 %** están
   medidos sobre **un prototipo desechable**, **no sobre el código real de F-05, que NO EXISTE**.
   **Otra implementación tendrá otro conjunto. Se mide cuando exista, no antes.**

---

# Ampliación por mutación (2026-07-17) — **DE 40 A 43 ESCENARIOS** · ESTADO VIGENTE

> ✅ **APROBADA POR EL HUMANO EL 2026-07-17**, tras la **escalada** de
> `progress/mutation_cero_terceros.md` (**10 supervivientes REALES**, los 10 verificados **por
> sabotaje manual**, **0 exclusiones** — A-23 no daba licencia para excluir nada, así que **se midió
> y se escaló**: exactamente lo que el contrato mandaba).

## 🔴 EL PORQUÉ, EN UNA LÍNEA

**LA MUTACIÓN NO ENCONTRÓ CÓDIGO DE MÁS. ENCONTRÓ CONTRATO DE MENOS.**

**Precedente exacto: `@s5` de F-01**, donde la mutación reveló que el escenario **no fijaba el `+`
del regex del teléfono** y **el humano aprobó una fila más** (`| 600  123  456 |`): la salida fue
**una FILA EN EL CONTRATO, con la producción SIN TOCAR**. Igual que **F-03** (19 %→100 %, solo
arreglando los tests) y **F-04** (58 supervivientes, **0 exclusiones**). **Van cuatro seguidas.**

**El patrón de los 10, y es lo que hay que llevarse:** salvo el `:58`, **todos son guardas
defensivas contra entradas que NINGÚN escenario metía** (`rel`/`href` ausentes, una URL que no
parsea, un `@font-face` en un HTML). **El contrato cubría MUY BIEN lo que el artefacto SÍ trae y no
fijaba NADA de lo malformado.** El `:58` es de otra especie y es el más grave: **un comentario que
aseveraba una tolerancia que ningún test sostenía** — «una promesa sin puerta».

## Las dos decisiones del humano

1. ✅ **SE AÑADEN LAS FILAS/ESCENARIOS QUE MATAN LOS 10. LAS GUARDAS SON CORRECTAS Y SE QUEDAN.**
   Sin ellas el detector **LANZA TypeError** ante HTML malformado y —lo peor— **un `<base>` sin
   `href` seguido de uno válido a un tercero haría la petición al tercero INVISIBLE**: **un FALSO
   NEGATIVO, el peor fallo posible para F-05** (@s42). **Faltaban los escenarios, no el código.**
   🔴 **Un `tdd_craftsman` que «matara» estos mutantes BORRANDO las guardas rompería la feature.**
2. ✅ **EL `:58` (`ATRIBUTO`) SE FIJA CON UN TEST.** El espaciado alrededor del `=` **es opcional en
   HTML** [V] → tolerarlo **es correcto**: `<img src = "https://cdn.tercero.com/a.png">` **DEBE
   detectarse**. El comentario de `terceros.ts:57` pasa de **promesa sin puerta** a **hecho vigilado**.

## Qué cambió, exactamente — **3 filas nuevas + 3 escenarios nuevos**

**Filas nuevas en escenarios que YA existen** (la forma que ya usó F-01 con `@s5`):

| Escenario | Fila añadida | Mata | Medido [V] |
| --- | --- | --- | --- |
| **@s1** | `<img src="https://cdn.tercero.com/a b.png">` | `terceros.ts:278` `ConditionalExpression` | `valor` = `…/a%20b.png`; el mutante da `…/a` |
| **@s1** | `<img src = "https://cdn.tercero.com/a.png">` | `terceros.ts:58` `Regex` (`\s*`→`\S*`) | 1 origen; `construccion` conserva los espacios |
| **@s9** | `\| http://[ \| 0 \| … no parsea y NO LANZA \|` | `terceros.ts:241` `OptionalChaining` | 0 orígenes, **sin excepción** |

**Escenarios nuevos — y SOLO porque no encajaban en ninguno de los 40** (se comprobó uno a uno):

| Nuevo | Qué fija | Mata | Por qué NO encajaba |
| --- | --- | --- | --- |
| **@s41** | HTML malformado: `<link>` sin `rel`; `<link rel>` sin `href` **con la base a un tercero**; `<img src="http://[">` | **los 4 del grupo A** (`:257-258`) **y el `:299`** | @s2/@s3/@s7 fijan `rel` **en el `Given`** (no hay fila que lo quite); **@s18 es «resuelven al PROPIO sitio»** y esto **no** resuelve al propio sitio: es un tercero **que no se pide**; @s1 exige **exactamente 1** |
| **@s42** | `<base>` sin href **seguido de** `<base href>` a un tercero → **1 origen** (HTML LS §4.6.5: gana el primer `<base>` **con href**) | `terceros.ts:240` | el `Given` de **@s9 inyecta UN solo `<base href="<base>">` por plantilla**: no hay fila que meta **DOS** `<base>`, uno sin atributo |
| **@s43** | un recurso **`html` con `@font-face` inline** → **exit 0**, y **NO** acusa `("Impostora", 400)` | `puerta-terceros.ts:159` | **@s28 no es Outline** (no admite filas) y el `Then` de **@s29 exige exit ≠ 0**; éste exige **0** |

## 🔴 Los dos hechos que se pierden al copiar — **MEDIDOS, y escritos donde duelen**

1. **La fila 2 de @s41 NECESITA el `<base>` A UN TERCERO.** [V, medido]
   `URL.parse(undefined, 'https://cdn.tercero.com/')` → **`https://cdn.tercero.com/undefined`**, host
   `cdn.tercero.com` → **1 ≠ 0 → MUERE**. Con la base propia → host `propio.invalid` → **0 = 0 →
   SOBREVIVE**. **Quien «simplifique» el fixture desactiva el escenario.**
2. **El fixture de @s42 NECESITA LOS DOS `<base>`.** [V, medido] `<base><img src="a.png">` a secas →
   **0 orígenes CON y SIN mutante** (`…/undefined` y `…/` son **ambos host propio**) →
   **INDISTINGUIBLE**.

**Y la lección literal de la tanda, aplicada:** el `Then` de la fila del espacio **ASEVERA EL
`valor`, no la cuenta** — «@s24 mataba CERO porque su `Then` solo aseveraba conteos, **ciegos a las
mutaciones de valor**». El origen se detecta igual con el mutante: **solo el aserto sobre `valor` lo
caza**. Por lo mismo, el `Then` de **@s43 acusa el par concreto**, no solo el código de salida.

## Método — **NO se ha inventado ninguna fila**

- **Cada fila sale del informe §4-§5**, y **las 8 del detector + la de la puerta se REMIDIERON
  contra el código real de `src/lib/` el 2026-07-17** (script efímero con
  `node --experimental-strip-types`, **borrado; `src/` y los tests intactos**). **0 discrepancias con
  el informe: los 10 son reales y el análisis del `mutation_tester` se sostiene entero.**
- **Fila medida y NO añadida, y queda escrito para que nadie la proponga «de memoria»:** un
  **`<base>` sin href A SECAS** — **no mata `:240`** (ver arriba). Va **en el comentario de @s42**,
  no como fila. *Es la misma disciplina que @s24 y @s7 ya escribieron.*
- **`http://[` no es un capricho:** es un host IPv6 sin cerrar, **la forma más corta que hace que el
  parser WHATWG devuelva `null`**. Un `.invalid` **no serviría: parsea perfectamente.**

## Lo que NO se ha tocado

- ❌ **NI UN escenario de los 40 se ha modificado, borrado ni reinterpretado. Solo se han AÑADIDO
  FILAS** (@s1 +2, @s9 +1). **Verificado:** 43 tags `@s1..@s43`, **43 `Scenario`**, **0 duplicados**,
  **todas las tablas consistentes en nº de columnas**. **NI UNA DECISIÓN DE F-05 CAE.**
- ❌ **NO se ha tocado `src/` ni los tests** (es trabajo del `tdd_craftsman`).
- ❌ **NO se excluye ni se justifica NI UN mutante.** **EL UMBRAL SIGUE SIENDO 1.0 CON 0
  EXCLUSIONES: A-23 sigue vigente ENTERA.** Esta ampliación los mata **con contrato**.
- ❌ **NO se ha reintroducido ninguna atribución normativa falsa (A-24).** Las dos citas nuevas son
  **HTML LS §4.6.5** (@s42) y **«el espaciado del `=` es opcional en HTML»** (@s1): **las dos son
  letra de la norma técnica, ninguna es jurídica.**

## Para el `tdd_craftsman`

1. **6 tests rojos matan los 10** (`mutation_cero_terceros.md` §7). El mapa fila→mutante está en el
   comentario de cada escenario: **@s1 (2 filas), @s9 (1 fila), @s41 (3 filas), @s42, @s43.**
2. **NO borres las guardas para «matar» los mutantes**: son la decisión 1 del humano. **El mutante
   muere porque el test nuevo lo distingue, no porque el código se simplifique.**
3. **Después: vuelta al `judge` y REMEDICIÓN a `--concurrency 1`.** Añadir tests no puede bajar un
   score, **pero el informe honesto hay que volver a emitirlo** — y **la tanda #1 de `terceros.ts`
   dio «100 %, 0 supervivientes» Y ERA FALSO** (152 timeouts, 1,59 tests/mutante). **Se lee
   `# timeout` y `tests per mutant` ANTES que el score.**
