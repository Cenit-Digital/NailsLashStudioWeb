# F-03 `tokens_paleta_contraste` — nota de cambios del contrato (gherkin_author, 2026-07-16)

> Actualización **quirúrgica** de `features/tokens_paleta_contraste.feature`. El contrato NO se
> reescribió: se conservan estructura, tono, comentarios de trazabilidad y rigor. Fuente de todos
> los cambios: `progress/f03_verificacion_previa.md`.
>
> **17 → 18 escenarios** (nuevo `@s18`). Sigue `⏸ PENDIENTE de aprobación humana`; A-15 ya viene
> decidida por el humano (88 %). `feature_list.json` ya estaba en `spec_ready`: sin cambio.

## Verificación independiente antes de escribir

Los valores del brief se **recomputaron con la fórmula G17** (script desechable, fuera del repo)
antes de escribirlos. **Todos coinciden exactamente**, ninguno se estimó:

- `--bg #FDF4F7` = [253, 244, 247]; al 88 % sobre `#000000` → **[222.64, 214.72, 217.36]**
- 88 % sobre negro puro: nav **4.89** · logo **5.38** · al 82 %: nav **4.22** (logo 4.64)
- filas de apoyo al 88 %: `--surface2` 6.35/6.99 · `--accent` 5.55/6.11 · `--ink` 5.32/5.86 ·
  `#303030` 5.17/5.69 · `#1B1B1D` 5.05/5.55
- fila del pie en coma flotante: **4.5913** → `4.59` (cuantizada: 4.5966 → el 4,60 del audit)

## Los 7 cambios

| # | Dónde | Qué |
| - | ----- | --- |
| 1 | cabecera A-15, `@s9`, `@s17`, comentarios | **82 % → 88 %**. Bloque A-15 reescrito: ya no dice «se mantiene translúcida y la puerta valida los under conocidos», sino **«se mantiene translúcida al 88 %, incondicionalmente AA»**. Deja escrito **que el 82 % NO cumplía** y por qué (nav 4,44 con «Negro Ónix» `#1B1B1D`, dato del propio diseño — `salon-data.js:90`), con un aviso explícito a quien lo lea en seis meses: bajarlo «por fidelidad al diseño» revierte AA, no estética. |
| 2 | `@s17` (+ nuevo `@s18`) | **Cambio de naturaleza**: de «lista declarada de unders conocidos» a **el peor under POSIBLE, negro puro**. Escenario central: nav `--muted` **4.89** y logo `--ink` **5.38** sobre `componer(--bg@.88, #000000)` = [222.64, 214.72, 217.36], todo a mano. Se documenta que la matriz vieja **omitía la única combinación mala** (declaraba «foto oscura» solo para el logo, y la nav es la que falla). Se deja escrito que **DESACOPLA F-03 de F-06 y F-17** y se **elimina** la promesa «el enumerado completo se cierra en F-06». Se conserva la nota del `blur(14px)` (promedia, no aclara). **`@s18` NUEVO**: fixture al 82 % sobre negro → nav **4.22 → violación + exit ≠ 0**, para que el 88 no sea un número mágico sin defensa. |
| 3 | `@s9` | Fila del color-mix a **α=.88** → **[224.4, 224.4, 224.4]** (0.88·255). `--line` (α=.16 → 214.2) e identidades α=1 / α=0 **intactas**. |
| 4 | cabecera (**A-16 nueva**) + `@s11` | `componer` **devuelve flotantes, sin cuantizar** (coherente con `@s9`; la cuantización es render, no color especificado). Fila del pie **4.60 → 4.59**, con el porqué escrito: 4,60 es el **valor cuantizado del audit**, el flotante es 4,5913, y `toBeCloseTo(4.60)` fallaría por 0,0087 → **el TDD se estrellaba**. Se acota que **solo afecta a las filas compuestas**; las 15 filas hex↔hex del audit quedan **intactas** (6,42 · 6,19 · 5,98 · 5,74 · 3,54 · 4,37 · 4,19 · 5,79) con un «NO TOCAR» explícito. |
| 5 | cabecera (fórmula) + `@s6` | **C1**: fuente de verdad = **glosario de WCAG 2.2**, no el wiki del WG. Nota defensiva: el wiki **todavía imprime 0.03928** con su propia errata, no es normativo, **no revertir**. Equivalencia acotada a **8 bits** (vecinos 10/255 = 0,039216 y 11/255 = 0,043137; a 10 bits **41/1023 = 0,040078 SÍ cae** en el hueco) — ya no se presenta como universal. `<=` conservado (letra del glosario). |
| 6 | cabecera (umbrales) + `@s17` | **C4**: reescrito el eje de SC 1.4.11 → **la información visual requerida para IDENTIFICAR el componente y su estado**, no «borde de control sí / decorativo no» (falso como regla). Partir `--line` de `--border-interactive` **sigue siendo correcto**. **C7**: reescrito el porqué del peor caso → **F83 es un *Quickcheck*: suficiente, no necesaria**; la exigencia real de SC 1.4.3 es **≥4,5:1 entre cada letra y el fondo inmediatamente detrás**; bajo scroll *cada* posición es un fondo inmediato posible. **Ninguna decisión ni umbral cambió.** |
| 7 | cabecera (umbrales) + `@s9` | **C3**: **18,5 px se queda** (cifra oficial del W3C; «18.66px» no existe en w3.org). Solo redacción: normativo **en puntos** (18 pt / 14 pt negrita), px = **aproximación del propio W3C**. **C5**: precondición escrita — `color-mix(in srgb, X 88%, transparent)` ≡ `X`@α=0.88 **exige `--bg` OPACO** (`α_resultante = α(--bg) × 0.88`), con el respaldo normativo (interpolación premultiplicada; `transparent` = `rgb(0 0 0 / 0)`, RGB premultiplicado [0,0,0], su peso va solo al alfa). |

## Traza actualizada

`A6` (trampa color-mix) → **`@s17`, `@s18`** (antes solo `@s17`). El resto de la traza a los 7
acceptance de `feature_list.json` se conserva sin cambios. Cobertura: los 7 acceptance y los 6
casos límite del `project-spec.md` siguen cubiertos.

## Anti-tautología

Intacta y reforzada: **todo** ratio esperado nuevo (4.89 · 5.38 · 4.22 · 6.35 · 6.99 · 5.55 ·
6.11 · 5.32 · 5.86 · 5.17 · 5.69 · 5.05 · 5.55) y **todo** fondo compuesto ([222.64, 214.72,
217.36] · [207.46, 200.08, 202.54] · [224.4, …]) se escribe **a mano** en el escenario; ninguno se
recomputa con `ratio()`/`componer()`, que son las funciones vigiladas. Umbrales (4.5 / 3.0)
literales.

## Para el tdd_craftsman

- `@s17` y `@s18` **no** exigen enumerar secciones de F-06/F-17: el negro puro las cubre todas.
- Ojo al **A-16**: `componer` **no cuantiza**. Si algún esperado compuesto no cuadra por ~0,005,
  el sospechoso es una cuantización a 8 bits colada en la implementación, no el literal.
