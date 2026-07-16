# Mutación — feature F-01 `puerta_placeholders`

**Veredicto final:** PASS — break threshold 100 cumplido en los dos ficheros.
**Ficheros mutados:** `src/lib/placeholders.ts` y `src/lib/puerta.ts` (lista `mutate`
de `stryker.config.json`). `tools/puerta-placeholders.ts` NO se muta (humble object).

| Fichero | Score | killed | survived | ignored |
| --- | --- | --- | --- | --- |
| `src/lib/placeholders.ts` | 100.00% | 87 | **0** | 1 (equivalente, ver §3) |
| `src/lib/puerta.ts` | 100.00% | — | **0** | 0 |

> **La cifra que vale es la de una corrida SIN carga.** Todo lo de abajo se midió a
> `--concurrency 2`; el equivalente se confirmó también a `--concurrency 1`.

## AVISO: el primer informe de «100 %» era FALSO por enmascaramiento

El primer `mutation_tester` reportó «100 %, 0 survived» y **no era cierto**. Corrió
mientras el workflow tenía muchos agentes compitiendo por CPU: **134 de 147 mutantes
hicieron *timeout*** y Stryker cuenta el timeout como muerto. Su razonamiento —«un
superviviente real termina, no cuelga, así que 0 survived no puede enmascarar nada»—
**es precisamente el error**: un superviviente que ADEMÁS hace timeout se cuenta como
muerto y desaparece del informe. Bajo carga, los supervivientes se disfrazan de kills.

Correr la mutación **en tranquilo, a baja concurrencia**, destapó **tres** hallazgos
reales que la corrida de alta concurrencia tapaba. Regla para el futuro:
*la puerta de mutación se corre a baja concurrencia; un informe con muchos timeouts no
es de fiar.*

## Los tres hallazgos y su resolución

### 1. `puerta.ts` — superviviente REAL (fallo de test). CERRADO por TDD.

`node .harness/harness.mjs verify` (máquina tranquila, `puerta.ts` con **0 timeouts**,
por tanto fiable) dio **99.32 %, 1 superviviente**:

```
[Survived] BlockStatement — src/lib/puerta.ts:75  motivoDelReventon → cuerpo vacío
```

`motivoDelReventon` vaciado devuelve `undefined`; la línea de fallo quedaba «…no pudo
completar la inspección: undefined», que **sigue conteniendo** «no pudo completar la
inspección», así que `@s22` pasaba. Faltaba fijar la **causa concreta**. Arreglado:
`@s22` ahora asevera `toContain(MOTIVO_DEL_REVENTON)` —la excepción exacta que lanza el
Given—, coherente con «acusar, no gruñir» (`@s15`) y con D-9. ROJO real demostrado antes
del arreglo. Muerto en la corrida final.

### 2. `placeholders.ts` — superviviente REAL (hueco de cobertura). CERRADO por TDD + contrato.

```
[Survived] Regex — src/lib/placeholders.ts:46  /\+?\d+(?:[ -]+\d+)*/g  → [ -] (sin el +)
```

El `+` de `[ -]+` (uno-o-más separadores) no estaba fijado: **ningún ejemplo de `@s5`
usaba separadores múltiples**. Con `[ -]` (exactamente uno), un teléfono con doble
espacio accidental —`+34  600  123  456`— escaparía, y es «el placeholder más peligroso
de la lista». Confirmado a mano por el lead: con `[ -]` los 46 tests seguían verdes.

**Resolución (puerta de aprobación HUMANA pasada):** se mantiene el `+` (detección
robusta) y se fija con un ejemplo nuevo en el contrato — `@s5` gana la fila
`| 600  123  456 |` (separadores dobles). ROJO real: con el mutante `[ -]`, SOLO ese caso
nuevo cae (`1 failed | 46 passed`). Producción sin cambios (ya era correcta). Muerto en la
corrida final (entre los 87 killed).

### 3. `placeholders.ts` — mutante EQUIVALENTE. EXCLUIDO con justificación (esta sección).

```
[Ignored] MethodExpression — src/lib/placeholders.ts:70  toLowerCase() → toUpperCase()
```

**Es equivalente de verdad, verificado por dos vías independientes (lead + artesano) y
confirmado a `--concurrency 2` y `--concurrency 1` con resultado idéntico.** Justificación
(esto es lo que exige `docs/mutation-testing.md` §78-80 para excluir un equivalente):

- `normalizarTexto` pliega la caja de **ambas** caras de la comparación: `contenido` y
  `patron` pasan por la MISMA función (`coincidenciasDeTexto` normaliza los dos). Si se
  pliega a mayúsculas en vez de a minúsculas, **ambos** lados cambian igual y
  `normalizado.indexOf(patronNormalizado)` sigue casando idéntico.
- El `valor` que devuelve la violación se toma del **contenido ORIGINAL**
  (`contenido.slice(inicio, fin)`), no del normalizado, así que su caja tampoco cambia.
- Lo único que distinguiría `toLowerCase` de `toUpperCase` es un carácter de plegado
  **asimétrico** (p. ej. `ß`.toUpperCase() = `SS` pero `ß`.toLowerCase() = `ß`). **Ninguno
  de los 6 patrones del contrato** (`IMAGEN TEMPORAL`, `Plantilla de demostración`,
  `600123456`, `hola@nailslashstudio.com`, `Calle de la Belleza`, `ph-woman`) contiene
  uno. Matarlo exigiría inventar un patrón con `ß` que no corresponde a ningún placeholder
  real: sería ensuciar el contrato, no mejorarlo.

**Exclusión quirúrgica**, no de brocha gorda: el `.toLowerCase()` se aisló en su propia
sentencia (`const enMinuscula = texto[i].toLowerCase()`) y el `// Stryker disable
next-line all` cae SOLO sobre esa línea, que solo contiene ese mutante. Los mutantes de
`normalize('NFD')`, `replace(DIACRITICOS, '')` y sus StringLiteral **siguen mutándose y
muriendo** — prueba: `# killed` se mantuvo en **87** tras la exclusión, no bajó. No se
tapó nada más. No se tocó `stryker.config.json` ni el umbral.

## Cómo reproducir

```
cd <repo>
pnpm exec stryker run --mutate src/lib/placeholders.ts --concurrency 2   # 100%, 0 survived, 1 ignored
pnpm exec stryker run --mutate src/lib/puerta.ts --concurrency 2          # 100%, 0 survived
node .harness/harness.mjs verify   # la puerta oficial: init + lint + test + mutación de ambos
```

`--concurrency 2` (o 1) a propósito: a alta concurrencia los timeouts enmascaran
supervivientes (fue lo que pasó). PROHIBIDO `--testFiles` (da 0 % falso con este stack;
`docs/research/00-fase0-informe.md` §6.3).

## Corroboración cruzada (además de la corrida de Stryker)

El `tdd_craftsman` verificó **a mano** que los mutantes clave muerden —mutando la línea de
producción y viendo el rojo por aserción—: `&&`→`||` cae en `@s14`, `>0`→`>=0` en `@s13`,
vaciar los guardas cae en `@s20`/`@s21`/`@s26`, `motivoDelReventon` vacío cae en `@s22`, y
`[ -]+`→`[ -]` cae en el nuevo caso de `@s5`. Bitácora: `progress/tdd_puerta_placeholders.md`
(sesiones 3ª a 5ª).

## Nota heredada (no es de F-01; queda enlazada)

Cuando entren imágenes (features posteriores), `dist/` tendrá binarios y hoy la puerta lee
**todo** con `readFileSync(..., 'utf8')` sin filtro por extensión. No es un superviviente de
F-01 ni afecta a este veredicto: es un escenario que aún no existe en el contrato. Anotado
en `progress/tdd_puerta_placeholders.md`; necesita un `@s` nuevo (puerta humana) antes de tocarse.

---

**Cierre:** F-01 supera la puerta de mutación con **0 supervivientes reales** en los dos
ficheros y **un** equivalente excluido con justificación. El 100 % no fue limpio a la
primera: lo destapó y lo selló una verificación a baja concurrencia. El `mutation_tester`
mide; no edita `src/` ni los tests.
