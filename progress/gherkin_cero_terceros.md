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
