# F-04 `cascaron_semantico` — nota de destilación del contrato (gherkin_author, 2026-07-16)

> `features/cascaron_semantico.feature` — **33 escenarios**, `@s1`…`@s33`, tags secuenciales y sin
> duplicados (verificado mecánicamente). `feature_list.json` id 4: `pending` → **`spec_ready`**.
>
> ⏸ **PENDIENTE DE APROBACIÓN HUMANA.** Nadie lo ha aprobado. **NO lanzar el `tdd_craftsman`.**
>
> Fuente de los hechos: **`progress/f04_verificacion_previa.md`** (manda sobre el troceado).
> Traza al **acceptance reescrito por A-17**, no al viejo. Modelo de calidad igualado:
> `features/tokens_paleta_contraste.feature`.

## Reparto de los 33 escenarios

| Bloque | Tags | Qué fija |
| ------ | ---- | -------- |
| `src/lib/seo.ts` puro | `@s1`–`@s10` | `componerTitulo` (invariante, **no** composición: A-22) · `canonicaDe` (absoluta, **una por página**, origen inyectado: A-21) · `construirJsonLd` (objeto acordado, `geo` exacto, conjunto EXACTO de claves) · **la prohibición del NIF** |
| Cáscara global | `@s11` | `:focus-visible` **sin umbral atribuido** · `scroll-padding-top > 0` (A-18) |
| Puerta pura sobre el HTML **CRUDO** de `dist/` | `@s12`–`@s25` | title/description/canónica · canónica repetida entre rutas · `lang` · h1 · landmarks · `section aria-labelledby` · JSON-LD (ausente, no parseable, **tipo efectivo**, `name`/`address`/`geo`) · **reseñas a cualquier profundidad** · **puerta anti-404** · informe determinista |
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
| 9 | `priceRange` es Text | **`@s9`** (fila prohibida, A-20 abierta) + la regla escrita para cuando se cierre |
| 10 | `openingHours` vs `…Specification` | **`@s9`** (ambas prohibidas, A-19 abierta) + la regla y el **«prohibida la mezcla»** escritos |

## Los tres ejes: separados, escenario por escenario

Ninguna atribución normativa falsa sobrevive. **Lo prohibido no es testear la regla: es la
atribución.**

- `@s16` (un h1) y `@s17` (landmarks) → **CRITERIO DE PROYECTO**, con el `[V]` de que *ninguna frase
  sobre el número de h1 existe en toda la norma*. Se testean igual.
- `@s18` → **esto SÍ es 1.3.1** (relación visual que debe existir en el código).
- `@s15` (`lang`) → `SC 3.1.1` exige idioma **determinable por código**; `lang` es **H57, técnica
  suficiente**; que un `lang` incorrecto falle va marcado **[I]**.
- `@s1`/`@s2` (`title`) → `SC 2.4.2` = *«describe topic or purpose»*, **cero unicidad**. La
  composición es **proyecto/SEO** (A-22).
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

## 🔴 LO QUE **NO** HE PODIDO CERRAR — para la puerta humana

1. **A6 queda cubierto SOLO EN PARTE, y está declarado en el contrato.** El acceptance 6 pide
   *«mutar la composición del title o de la canónica rompe un test»*. **La canónica sí** (`@s4` mata
   al que ignora el origen, `@s5` al que ignora la ruta). **El title no del todo**: con **A-22
   abierta**, el contrato solo puede fijar el invariante (no vacío, distinto por página), así que
   **el mutante que invierte el orden de la concatenación SOBREVIVE**. No es un descuido: es el
   precio de dejar A-22 abierta. **Cerrar A-22 en la puerta cierra el hueco** con una fila de
   esperados literales.
2. **`@s18` es una DÉCIMA regla de violación.** El `project-spec.md` §Feature 4 → «Contrato»
   enumera **nueve**, y `section aria-labelledby` **no está entre ellas**. La he destilado porque el
   **acceptance 1** (reescrito el 2026-07-16) la nombra explícitamente como «lo que SÍ mide 1.3.1»,
   y el acceptance es la fuente más nueva y cerrada por el humano. **El humano debe confirmarla o
   retirarla.** No se cuela en silencio.
3. **`@s28` (0 enlaces) exige que la cáscara emita ≥1 `href` en `dist/index.html`.** Es razonable
   (la `nav`/`footer` emiten enlaces o anclas) pero **[NV]: no está verificado sobre un `dist/`
   real, porque la cáscara aún no existe**. Si al implementar sale con 0 `href`, **la guarda nace en
   rojo → volver a la puerta humana**, no bajarle el listón.
4. **A-19 y A-20 se destilan como PROHIBICIÓN provisional** (`@s9`: `openingHours`,
   `openingHoursSpecification` y `priceRange` **no se emiten** mientras las preguntas sigan
   abiertas). Es la lectura literal del spec («A-19», «A-20» como diferidas), y aseverar el
   **conjunto exacto de claves** impide que se cuelen sin cerrar su pregunta. **Si el humano cierra
   A-19 o A-20 a favor de F-04, esas filas caen y hay que añadir su escenario positivo.** Escrito
   para que ese cambio sea **visible**.
5. **Límite declarado (T3): el `<title>` DUPLICADO no lo caza nadie.** Helmet **no deduplica**
   contra `index.html` [V]. Hoy no hay `<title>` estático [V] → no hay duplicado. **No he inventado
   una regla de unicidad** que el spec no fija; queda como límite declarado (precedente `@s11` de
   F-01). Si el humano la quiere, es una fila más en `@s13`.
6. **Ningún camino positivo para `@s10`, y es deliberado**: **no existe ningún identificador válido
   que probar**. Fingir uno sería inventarlo. **B-1/B-2 siguen bloqueadas.**

## Para el `tdd_craftsman` (cuando el humano apruebe)

- **La entrada de la aserción es innegociable**: los **bytes** de `dist/` (`readFileSync` + string).
  **jsdom PROHIBIDO** en `@s12`–`@s25`, `@s32`, `@s33`. jsdom no es «insuficiente»: es **incapaz por
  construcción** — da verde por **dos** caminos (helmet en cliente y el hoisting de React 19).
- `@s14` y `@s22` **exigen fixture** (dos rutas / `@graph` anidado) o **nacen inertes**. `@s14` es el
  gemelo exacto de `@s14` de F-03, que nació inerte y lo cazó el judge.
- El mutante **«cortar la recursión»** de `@s22` y el **`> 1` → `>= 1`** de `@s16` son los dos que
  más fácil sobreviven. Sin la fila de **2 h1** y sin las filas **anidadas**, sobreviven seguro.
- **No importes `site.ts` en los tests** para construir esperados. Si el test importa la constante
  que debería vigilar, no vigila nada.
- **`tools/puerta-cascaron.ts` no lleva tests propios y va fuera de `mutate`** — el contrato exacto
  de `tools/puerta-contraste.ts` [V].
