# F-04 `cascaron_semantico` — nota de destilación del contrato (gherkin_author, 2026-07-16)

> `features/cascaron_semantico.feature` — **35 escenarios**, `@s1`…`@s35`, sin duplicados y con
> cobertura completa del rango (verificado mecánicamente). `feature_list.json` id 4: `pending` →
> **`spec_ready`**.
>
> ✅ **APROBADO POR EL HUMANO EN LA PUERTA (2026-07-16).** (Esta línea decía «pendiente, no lanzar
> el `tdd_craftsman`» — ya no es cierto y se corrige para no engañar al siguiente lector.)
> **3ª pasada (2026-07-17): DOS CORRECCIONES QUIRÚRGICAS, aprobadas por el humano. SIGUEN SIENDO
> 35 ESCENARIOS** (un `Then` y una fila, no escenarios nuevos). Ver §«Tercera pasada» al final.
>
> Fuente de los hechos: **`progress/f04_verificacion_previa.md`** (manda sobre el troceado).
> Traza al **acceptance reescrito por A-17**, no al viejo. Modelo de calidad igualado:
> `features/tokens_paleta_contraste.feature`.
>
> **2ª pasada (2026-07-16): las CINCO decisiones del humano destiladas.** 33 → 35 escenarios
> (`@s34` A-21, `@s35` A-19). Ver §«Segunda pasada» al final: es donde está lo que cambió.

## Reparto de los 33 escenarios

| Bloque | Tags | Qué fija |
| ------ | ---- | -------- |
| `src/lib/seo.ts` puro | `@s1`–`@s10`, `@s34` | `componerTitulo` (**composición FIJADA**: A-22) · `canonicaDe` (absoluta, **una por página**, origen inyectado; **`@s34`: el origen es placeholder de F-01**: A-21) · `construirJsonLd` (objeto acordado, `geo` exacto, conjunto EXACTO de claves) · **la prohibición del NIF** |
| Cáscara global | `@s11` | `:focus-visible` **sin umbral atribuido** · `scroll-padding-top > 0` (**A-18: F-04 pone, F-06 vigila**) |
| Puerta pura sobre el HTML **CRUDO** de `dist/` | `@s12`–`@s25`, `@s35` | title/description/canónica · canónica repetida entre rutas · `lang` · h1 · landmarks · `section aria-labelledby` · JSON-LD (ausente, no parseable, **tipo efectivo**, `name`/`address`/`geo`) · **reseñas a cualquier profundidad** · **`@s35`: horario solo `…Specification`, nunca la mezcla** · **puerta anti-404** · informe determinista |
| El humilde (exit code) | `@s26`–`@s31` | vacuidad (rutas esperadas, lista vacía, 0 enlaces) · falla cerrada · camino feliz · `dev` no la invoca |
| Las dos trampas ancla | `@s32`, `@s33` | **React 19 nativa → `<head>` vacío + jsdom da VERDE** · **pinchar el literal `<head>`** |

## Las 10 trampas del brief: dónde vive cada una

| # | Trampa | Escenario |
| - | ------ | --------- |
| 1 | React 19 vs `<Head>`: `<head>` VACÍO en el build, verde en `dev` y en jsdom | **`@s32`** — aserción sobre el HTML **CRUDO**; el último `And` demuestra que **jsdom da VERDE sobre esa misma violación**. Con la acotación del `unshift` de TanStack escrita para quien re-verifique en 6 meses |
| 2 | El `replace()` literal y silencioso | **`@s33`** — Outline con `<head >`, `<HEAD>`, `<head lang="es">`. El **1er `Then` es el corazón**: *el build NO lanza* |
| 3 | El `<title>` vacío desaparece | **`@s13`** — regla **«ausente O vacío»**, dos filas, con la cita `:434-436` |
| 4 | `@graph` anidado + `Review` **y** `AggregateRating` + propiedad suelta | **`@s22`** — 7 filas: raíz, `Service`, `Offer` a 3 niveles, `Review` ×2, `ratingValue`/`reviewCount` sueltos |
| 5 | Alias de tipo | **`@s20`** — 8 filas. Las del **array** son las que fuerzan el tipo efectivo: `json['@type'] === 'BeautySalon'` **falla** las filas 2 y 3 |
| 6 | Verde por vacuidad + falla cerrada | **`@s26`, `@s27`, `@s28`, `@s29`**. `@s27` es **la guarda de la guarda** (lista vacía → @s26 se satisface **vacuamente**) |
| 7 | Canónica por página | **`@s14`** — con **fixture de DOS rutas** sobre el decisor puro, o **nace inerte** (hoy solo existe `/` [V: `App.tsx`]) |
| 8 | **PROHIBIR completar/inferir el NIF** | **`@s10`** — el 4º `And` (*«NO contiene "10656940" seguido de ninguna letra de control»*) es el corazón. Validación **FORMAL** declarada: **no** calcula el módulo 23, **no** acredita titularidad |
| 9 | `priceRange` es Text | **`@s9`** — **A-20 CERRADA**: no entra. Dos razones independientes (precios bloqueados → inventar; Text vs número → degrada en silencio) |
| 10 | `openingHours` vs `…Specification` | **`@s9`** (no se emite: es de F-10) + **`@s35`** — **A-19 CERRADA**: la puerta **prohíbe `openingHours` y prohíbe LA MEZCLA**, estructuralmente |

## Los tres ejes: separados, escenario por escenario

Ninguna atribución normativa falsa sobrevive. **Lo prohibido no es testear la regla: es la
atribución.**

- `@s16` (un h1) y `@s17` (landmarks) → **CRITERIO DE PROYECTO**, con el `[V]` de que *ninguna frase
  sobre el número de h1 existe en toda la norma*. Se testean igual.
- `@s18` → **esto SÍ es 1.3.1** (relación visual que debe existir en el código).
- `@s15` (`lang`) → `SC 3.1.1` exige idioma **determinable por código**; `lang` es **H57, técnica
  suficiente**; que un `lang` incorrecto falle va marcado **[I]**.
- `@s1`/`@s2` (`title`) → `SC 2.4.2` = *«describe topic or purpose»*, **cero unicidad**. La
  composición, **ya fijada** (A-22), sigue siendo **proyecto/SEO** — fijarla no la vuelve WCAG.
- `@s11` (`:focus-visible`) → **cero umbral atribuido a 2.4.7**; el 3:1/2px es **2.4.13, AAA**.
- `@s23` (anti-404) → **«permanente» es TEMPORAL**; «en todas las páginas» **no está en la LSSI**; el
  pie global es **suficiente, no necesario**. **Toda cita de la LSSI lleva su marca `[NV]` de
  versión** + la trampa de la API del BOE.
- `@s7`/`@s21` → **schema.org ≠ Google**. **Cero usos de «obligatorio» sin sujeto explícito** en todo
  el fichero.
- `@s22` → `aggregateRating` en **tres capas**, con **(a) y (c) sosteniendo la decisión POR
  SEPARADO**. La redacción «Google prohíbe self-serving» queda **prohibida**, con la FAQ que la
  refuta citada.
- `@s8` → `geo` **fija la constante y muta si alguien la toca**; el límite **«edificio, jamás Local
  41»** está escrito **dentro del escenario**. El CP **no se verifica contra OSM**.

## Anti-tautología

Todo esperado **a mano**, ninguno importado ni recomputado: `40.5179875` · `-3.9226688` ·
`Las Rozas de Madrid` · `28232` · `BeautySalon` · `Nails Lash Studio` · `+34625223366` ·
`https://example.invalid/servicios`. `@s21` muta **un solo dígito** de `geo` (…875→…876, …688→…680)
para anclar la comparación exacta.

## Estado de los 6 puntos que declaré sin cerrar (1ª pasada)

| # | Punto | Estado |
| - | ----- | ------ |
| 1 | A6 cubierto a medias (mutante del orden del `title`) | ✅ **CERRADO** por **A-22**. `@s1` fija los literales → **el mutante muere** |
| 2 | `@s18` es una décima regla | ✅ **CONFIRMADA** por el humano. El desfase con `project-spec.md` **lo corrige el lead**; yo no toco el spec |
| 3 | `@s28` exige ≥1 `href` **[NV]** | ⏳ **SE QUEDA TAL CUAL** (confirmado): si nace en rojo, **se vuelve a la puerta**, no se baja el listón |
| 4 | A-19/A-20 como prohibición provisional | ✅ **CONSOLIDADAS**, no caen. Además `@s35` **fija la regla** que hereda F-10 |
| 5 | T3: `<title>` duplicado | ⏳ **LÍMITE DECLARADO** (confirmado): bien no inventar una regla que el spec no fija |
| 6 | `@s10` sin camino positivo | ✅ **CORRECTO Y DELIBERADO** (confirmado). B-1/B-2 siguen bloqueadas |

## Segunda pasada — las CINCO decisiones destiladas (2026-07-16)

**33 → 35 escenarios.** Tags nuevos **al final de la numeración**, colocados **por lógica** en el
fichero (precedente F-01: `@s24`/`@s25`/`@s26` van intercalados). Los tags son **identificadores
estables**: no se renumera nada.

| Decisión | Qué se destiló | Dónde |
| -------- | -------------- | ----- |
| **A-18** — `SC 2.4.11` es de **F-06** | El escenario ya fijaba `scroll-padding-top > 0` y **NUNCA un número**; ahora lleva **la remisión escrita**: *F-04 PONE, F-06 VIGILA QUE FUNCIONE*, con el porqué (F-04 no puede testear que la cabecera tape el foco cuando **la cabecera la monta F-06**). Escrito **dentro del escenario** para que no se caiga por la grieta entre features | `@s11` + cabecera |
| **A-21** — origen = **placeholder de F-01** | **`@s34` NUEVO.** El build de **producción rompe** por el flag de F-01; **dev no**. El 2º `And` es el que **impide la duplicación**: *la violación la emite la puerta de F-01, NO la del cascarón*. Se cita la **decisión 9** literal. `@s4` pasa de «A-21 ABIERTA» a «CERRADA vía F-01», conservando `example.invalid` (RFC 2606) | **`@s34`** (nuevo), `@s4` |
| **A-22** — composición del `title` | `@s1` reescrito de «no vacío» a **Scenario Outline con los 3 literales exactos**. **Dos ramas** (home invierte el orden respecto a las interiores) → un mutante que las unifique también muere. `@s2` se conserva por el invariante | `@s1`, `@s2` |
| **A-19** — horario | Filas de `@s9` **consolidadas** (de «ABIERTA» a «CERRADA: es de F-10»). **`@s35` NUEVO**: la puerta **prohíbe `openingHours` y prohíbe LA MEZCLA**, con las 4 filas | **`@s35`** (nuevo), `@s9` |
| **A-20** — `priceRange` | Fila consolidada con **las dos razones independientes**: precios **bloqueados** (B-5/F-09) → emitir sería **inventar**; y es **Text, no número**. **La primera basta sola** | `@s9` |
| **`@s18`** | De «el humano debe confirmarla» → **«CONFIRMADA»**, marcada como **lo único del contrato que mide de verdad `SC 1.3.1`** | `@s18` |

### `@s1` — el mutante del orden **YA MUERE** (era el punto 1)

```
home   →  "Nails Lash Studio · Uñas, pestañas y cejas en Las Rozas de Madrid"
resto  →  "Servicios · Nails Lash Studio"  ·  "Contacto · Nails Lash Studio"
```

Invertir la concatenación produce `"Uñas, pestañas y cejas… · Nails Lash Studio"` (home) o
`"Nails Lash Studio · Servicios"` (interiores) → **≠ el esperado escrito a mano → muere**. Con
`@s1` en su forma anterior («no vacío, contiene la página») **sobrevivía**. Contenido **[V]**:
categorías **Uñas · Pestañas · Cejas** — **«Facial» NO existe** y no aparece en el fichero
(verificado: 1 sola ocurrencia, la que lo prohíbe) — y **Las Rozas de Madrid**.

### `@s35` — por qué existe una regla de horario en una feature que no emite horario

`openingHours` y `openingHoursSpecification` **coexisten y ambas son válidas** por ramas distintas
de schema.org [V]. **Si el contrato no fija cuál, dos implementadores eligen distinto y AMBOS PASAN
LOS TESTS.** La 1ª fila (ninguna de las dos) **es el estado real de F-04 hoy** y evita que la regla
nazca rompiendo el build; la 3ª **nace inerte a propósito** — es el contrato que **F-10 hereda ya
escrito, con su fixture**. La 4ª (**la mezcla**) es la que más fácil se olvida: es «válida» para
schema.org y son **dos fuentes de verdad para el mismo hecho**, justo lo que I-7 prohíbe.

## Para el `tdd_craftsman` (cuando el humano apruebe)

- **La entrada de la aserción es innegociable**: los **bytes** de `dist/` (`readFileSync` + string).
  **jsdom PROHIBIDO** en `@s12`–`@s25`, `@s32`, `@s33`. jsdom no es «insuficiente»: es **incapaz por
  construcción** — da verde por **dos** caminos (helmet en cliente y el hoisting de React 19).
- `@s14` y `@s22` **exigen fixture** (dos rutas / `@graph` anidado) o **nacen inertes**. `@s14` es el
  gemelo exacto de `@s14` de F-03, que nació inerte y lo cazó el judge.
- El mutante **«cortar la recursión»** de `@s22` y el **`> 1` → `>= 1`** de `@s16` son los dos que
  más fácil sobreviven. Sin la fila de **2 h1** y sin las filas **anidadas**, sobreviven seguro.
- **No importes `site.ts` en los tests** para construir esperados. Si el test importa la constante
  que debería vigilar, no vigila nada. **Vale también para los 3 títulos de `@s1`**: escríbelos a
  mano, carácter a carácter, separador «·» incluido. Si recompones el título con la misma plantilla
  que vigilas, **el mutante del orden vuelve a sobrevivir** y habremos deshecho A-22.
- **`tools/puerta-cascaron.ts` no lleva tests propios y va fuera de `mutate`** — el contrato exacto
  de `tools/puerta-contraste.ts` [V].
- **`@s34` NO lleva lógica nueva**: el origen es un **registro placeholder** y lo caza **la puerta
  de F-01 por el flag**. Si te descubres escribiendo una comprobación de placeholder dentro de
  F-04, **para**: estás duplicando F-01 y las dos copias divergirán.
- **`@s35` nace con una fila inerte a propósito** (la de `…Specification`): es el contrato que
  **F-10 hereda**. No la borres por «no aporta hoy» — aporta el día que F-10 empiece.

## Tercera pasada — las DOS correcciones quirúrgicas (2026-07-17, aprobación humana)

**Las levantó el `tdd_craftsman` IMPLEMENTANDO** (`progress/tdd_cascaron_semantico.md` §2 y §3), no
una relectura de despacho. **Las dos eran reales.** El contrato **sigue aprobado** y **sigue
teniendo 35 escenarios**: se tocó **un `Then` y se añadió una fila**. Verificado mecánicamente:
**35 tags `@sN` únicos, 35 líneas `Scenario`, sin huecos ni duplicados.**

| # | Escenario | Qué se cambió | Por qué |
| - | --------- | ------------- | ------- |
| 1 | **`@s32`** | El `Then` pasa de *«el HTML CRUDO de dist/ NO contiene ningún `<title>`»* a *«**el `<head>`** del HTML CRUDO de dist/ no contiene ningún `<title>` ni ninguna `<meta name="description">` — **están en el `<body>`, donde no sirven para nada**»*. Comentario ampliado con (a)…(d) | **ERROR DE HECHO, MEDIDO** sobre un build SSG real: `renderToString` **NO hoistea** la metadata de React 19 al `<head>` — **la emite en el `<body>`**. El `<title>` **SÍ está en el artefacto**. Lo vacío es **el `<head>`**, que es lo que la verificación previa siempre dijo y lo único que importa |
| 2 | **`@s18`** | **Fila 4 añadida**: `<section aria-labelledby="x">` con `<div id="x">`, id que **resuelve a un elemento que NO es heading** → **1**. Tabla realineada. Comentario con el porqué | Las 3 filas **prometían lo que ninguna probaba**. Ninguna distinguía `<h2 id="x">` de `<div id="x">` → **el coladero que la propia prosa prohíbe PASABA** |

### `@s32` — el error de hecho, y por qué casi cuesta la feature

Medido en `.experimentos-tmp/react19-nativa/dist/index.html`:

```html
<head><meta charset="UTF-8"><script type="module" src="/assets/app-ti4oL6dR.js"></script></head>
<body><div id="root" data-server-rendered="true"><title>Nails Lash Studio</title>
<meta name="description" content="…"><link rel="canonical" href="…">…
```

**La decisión era correcta; la letra del `Then`, falsa.** El patrón del proyecto, otra vez.

🔴 **Y NO ERA COSMÉTICO.** La primera puerta del craftsman buscaba el `<title>` con regex **en el
documento entero**, **lo encontraba en el `<body>` y NO acusaba**. Rompió **por accidente** (el
JSON-LD del fixture estaba incompleto); **con un JSON-LD completo, el bug de React 19 habría pasado
la puerta EN VERDE** — la puerta habría sido **tan ciega como jsdom al único bug que F-04 existe
para prevenir**. **`@s32` se pagó a sí mismo en su primera ejecución.** De ahí `cabezaDe(html)`, que
acota las 4 reglas del `<head>` al `<head>`, y de ahí el aviso (d) en el escenario: **quien
«simplifique» `cabezaDe` deja los tests verdes y borra la feature**.

**Lección para el resto del proyecto:** una regla sobre el `<head>` que se asevere contra el
documento entero **no es una regla sobre el `<head>`**. Vale para F-06 y F-16.

### `@s18` — la fila que exige la propia prosa de la regla

La regla se llama *«`section` sin `aria-labelledby` **a un heading real**»* y la prosa es enfática
(*«NO un `div` con `font-size`»*). Las tres filas solo distinguían: atributo **ausente** (→1), id
que **resuelve** (→0), id que **no existe en ningún elemento** (→1). **Ninguna distinguía un
`<h2 id="x">` de un `<div id="x">`** → `<section aria-labelledby="x">` + `<div id="x" class="titulo">`
**PASABA**, que es **justo la forma que la regla existe para prohibir**.

**Importa más que ninguna otra fila del contrato:** `@s18` es **la ÚNICA de las diez reglas que mide
`SC 1.3.1` de verdad** (las otras nueve son criterio de proyecto o requisito de Google). Sin la
fila, **el `acceptance` 1 no estaba protegido**: la única regla normativa se cumplía en el papel.

**Qué cuenta como heading: `h1`…`h6`.** El spec **no fija más** (ni `role="heading"` ni `aria-level`)
y **no se inventa** — lo que no está escrito, no está decidido. Si hace falta, se vuelve a la puerta.

⚠️ **El craftsman NO lo implementó, y con razón**: sin fila sería **producción que ningún test rojo
pide (Ley 1)** y un **mutante INMORTAL** → rompería el umbral de 1.0. **Cerrar el coladero exigía
una fila en el contrato, no código a escondidas.** Avisó en vez de colarlo; el humano lo aprobó.
Precedente literal: la rama de «texto grande» que F-03 **no** implementó por esto mismo.

### Lo que NO se tocó, a propósito

- **Ningún otro escenario.** En particular **`@s33`** conserva su `Then` («el HTML CRUDO de dist/ NO
  contiene ningún `<title>`…») **y es CORRECTO ahí**: su trampa es el `replace()` literal que **no
  inyecta nada en ninguna parte** — no hay metadata en el `<body>` que rescatar, porque la vía es
  `<Head>`, no la nativa de React 19. **Son dos bugs distintos y solo uno emite al `<body>`.**
- **`feature_list.json`** — no lo toca el `gherkin_author`; la feature está `in_progress` con el
  craftsman dentro y **no se devuelve a `pending`**: el contrato sigue **aprobado**.
- **§1 de la bitácora del craftsman** (`pnpm build` en rojo por `@s34`) **no es cosa mía**: es
  decisión del **lead/humano**, no una corrección del contrato. **Sigue abierta.**
