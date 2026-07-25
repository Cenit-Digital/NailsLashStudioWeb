# Mutación — Subruta GitHub Pages (ENMIENDA 1 de F-05 y F-04)

Tarea directa (fuera del pipeline de `feature_list.json`: no hay `subruta_github_pages` en la lista
ni `features/subruta_github_pages.feature`). Mide la mutación de las dos ENMIENDAs ya aprobadas por
el `judge` (`progress/judge_subruta_github_pages.md`, APPROVED, 0 bloqueantes) sobre los dos ficheros
tocados:

- `src/lib/puerta-terceros.ts` (F-05, ENMIENDA 1 — `violacionesDeBase`/`baseDeclarada`/
  `esRutaPropiaRootAbsoluta`).
- `src/lib/puerta-cascaron.ts` (F-04, ENMIENDA 1 — `esEnlaceRoto` nueva, `base` threading por
  `violacionesDeEnlaces`/`violacionesPorRegla`/`inspeccionarSitio`/`ejecutarPuertaDelCascaron`/
  `PeticionPuertaCascaron`).

Comando ejecutado (a través del arnés, sin `--testFiles`, target explícito de 2 ficheros):

```bash
node tools/mutate.mjs "src/lib/puerta-terceros.ts,src/lib/puerta-cascaron.ts"
```

Corrida real vía `pnpm exec stryker run --mutate <ambos ficheros>`. Duración: 6 min 16 s.
`stryker.config.json` no se tocó: ambos ficheros ya estaban en la lista `mutate`.

**Veredicto: FAIL**
**Score combinado:** killed+timeout / total = 614/618 = **99.35%** (umbral: **100%**)

## Score por fichero

```
--------------------|------------------|----------|-----------|------------|----------|----------|
                    | % Mutation score |          |           |            |          |          |
File                |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
--------------------|--------|---------|----------|-----------|------------|----------|----------|
All files           |  99.35 |   99.35 |      608 |         6 |          4 |        0 |        0 |
 puerta-cascaron.ts |  99.20 |   99.20 |      491 |         6 |          4 |        0 |        0 |
 puerta-terceros.ts | 100.00 |  100.00 |      117 |         0 |          0 |        0 |        0 |
--------------------|--------|---------|----------|-----------|------------|----------|----------|
```

### `src/lib/puerta-terceros.ts` → **100.00%** (117/117, 0 supervivientes) — PASS individual

`esRutaPropiaRootAbsoluta` (el `startsWith('/')`/`startsWith('//')` ampliado por la ENMIENDA 1) queda
enteramente cubierta. Confirmado en la traza cruda de Stryker que las 8 filas de `@s27` matan cada
mutante de comparador/booleano ahí — en particular los dos mutantes más peligrosos de esa función:

- `base.startsWith(BASE_PROPIA)` (comparadores/negaciones sobre el `startsWith`): killed por las
  filas 1-4 (`no declara`, `/`, `/subcarpeta/`, `/NailsLashStudioWeb/` → código 0) y por las filas
  5-8 (`https://…`, `//cdn.tercero.com/`, `./` → código 1).
- `!base.startsWith(PREFIJO_PROTOCOLO_RELATIVO)` (la exclusión del protocolo-relativo): killed
  específicamente por la fila `//cdn.tercero.com/` — la única fila que empieza por `/` Y por `//` a
  la vez, la que distingue esta guarda de un `startsWith('/')` a secas.
- `baseDeclarada` (regex `BASE_DE_VITE`, `sinComillas`, `.trim()`) y `violacionesDeBase` (el mensaje
  que NOMBRA `vite.config.ts`): killed, íntegro.

Sin supervivientes, sin exclusiones. Nada que decidir aquí.

### `src/lib/puerta-cascaron.ts` → **99.20%** (491 killed + 6 timeout / 501, 4 supervivientes)

Los 4 supervivientes están TODOS dentro de `esEnlaceRoto` (líneas 582-600, la función nueva de la
ENMIENDA 1). El resto de la función — el `if (base === null)` de @s23/@s24 y el resto de la puerta —
está a 100%: ninguna otra parte de `puerta-cascaron.ts` sobrevivió.

## Mutantes sobrevivientes

### 1 y 2 — la guarda `if (!ruta.startsWith(base))` (línea 593): HUECO REAL, no equivalente

```
src/lib/puerta-cascaron.ts:593:7  [ConditionalExpression]
-     if (!ruta.startsWith(base)) {
+     if (false) {

src/lib/puerta-cascaron.ts:593:31  [BlockStatement]
-     if (!ruta.startsWith(base)) {
-       return false
-     }
+     if (!ruta.startsWith(base)) {}
```

Ambos mutantes tienen el MISMO efecto observable: eliminan el `return false` temprano cuando el href
NO empieza por `base`, y dejan que la ejecución caiga igual en `resto = ruta.slice(base.length)`.

**Por qué sobreviven — huecos exactos en la suite actual.** Los tests que SÍ cubren esta línea
(`covered`, no `killed`) son @s36 (`/NailsLashStudioWeb/inexistente`, `/NailsLashStudioWeb/Servicios`),
@s37 (`/NailsLashStudioWeb/`) y "3 más" — TODOS son hrefs que SÍ empiezan por `base`, así que la
guarda nunca se ejercita en la rama que el mutante borra. El único caso con href que NO empieza por
`base` es @s37 `"/otra-cosa"` (10 caracteres) — pero `"/otra-cosa".slice(21)` (21 = longitud de
`/NailsLashStudioWeb/`) da `''` por semántica de `String.prototype.slice` (índice de inicio mayor que
la longitud de la cadena → cadena vacía), y `''` resuelve a `RAIZ_DEL_ARTEFACTO` (`'/'`), que SIEMPRE
existe en `rutasDelArtefacto` (la home). Con o sin la guarda, ese caso concreto da "no violación" —
así que NO distingue al mutante.

**Falta:** un caso con href que NO empiece por `base` y cuya longitud sea MAYOR que `base.length`, de
forma que `ruta.slice(base.length)` produzca un resto que no case con ninguna ruta real (p. ej.
`/pagina-que-no-tiene-nada-que-ver-con-la-base` con `base = /NailsLashStudioWeb/`, esperando código 0
/ sin violación, por estar fuera de ámbito de @s37). Sin la guarda, ese resto NO coincidiría con
`rutasDelArtefacto` y el mutante reportaría una violación falsa donde @s37 exige "fuera de ámbito, no
violación". Es trabajo del `tdd_craftsman`: ampliar `@s37` con esta fila (o una fila nueva) en
`features/cascaron_semantico.feature` y su test en `puerta-cascaron.test.ts`.

### 3 — el ternario `resto === '' ? RAIZ_DEL_ARTEFACTO : ...`, condición → `false` (línea 599:33): EQUIVALENTE, construcción citada

```
src/lib/puerta-cascaron.ts:599:33  [ConditionalExpression]
-     return !rutasDelArtefacto.has(resto === '' ? RAIZ_DEL_ARTEFACTO : `${RAIZ_DEL_ARTEFACTO}${resto}`)
+     return !rutasDelArtefacto.has(false ? RAIZ_DEL_ARTEFACTO : `${RAIZ_DEL_ARTEFACTO}${resto}`)
```

**Por qué es equivalente — identidad algebraica, no ausencia de test.** `RAIZ_DEL_ARTEFACTO` es la
constante `'/'` (línea 560). Para CUALQUIER valor de `resto: string`, la concatenación
`${RAIZ_DEL_ARTEFACTO}${resto}` es `'/' + resto`. Cuando `resto === ''`, esa misma fórmula da
`'/' + '' = '/'`, que es byte a byte el mismo valor que el otro brazo del ternario
(`RAIZ_DEL_ARTEFACTO = '/'`) — por la identidad de JavaScript `X + '' === X` para cualquier string
`X` (ECMA-262: concatenar con la cadena vacía es un no-op). Es decir: para `resto === ''` los DOS
brazos del ternario producen el mismo valor, y para `resto !== ''` el código real YA toma el brazo
`else` (la condición es falsa) — exactamente lo que hace el mutante SIEMPRE. No existe ningún valor
de `resto` para el que el mutante y el código real difieran: es equivalente para el 100% del dominio
de entrada, no solo para los casos que la suite ejercita hoy. Ningún test, por exhaustivo que sea,
puede matarlo tal y como está escrita la línea.

**Consecuencia honesta (no es una exclusión, es un espejo del código):** esto revela que el ternario
en sí es código muerto — `${RAIZ_DEL_ARTEFACTO}${resto}` sin condicional cubre los dos casos igual de
bien, porque la concatenación con cadena vacía ya resuelve el caso `resto === ''` sola. La condición
existe solo por legibilidad ("cuando el resto es vacío, es la home"), no por necesidad funcional.

### 4 — el mismo ternario, el literal `''` → `"Stryker was here!"` (línea 599:43): SÍNTOMA DEL MISMO CÓDIGO MUERTO, no equivalente en sentido estricto

```
src/lib/puerta-cascaron.ts:599:43  [StringLiteral]
-     return !rutasDelArtefacto.has(resto === '' ? RAIZ_DEL_ARTEFACTO : `${RAIZ_DEL_ARTEFACTO}${resto}`)
+     return !rutasDelArtefacto.has(resto === "Stryker was here!" ? RAIZ_DEL_ARTEFACTO : `${RAIZ_DEL_ARTEFACTO}${resto}`)
```

**Por qué NO lo declaro equivalente, a diferencia del mutante 3.** Por la misma identidad `X+''===X`,
este mutante también coincide con el código real para TODO `resto` salvo un único valor patológico:
`resto === "Stryker was here!"` exactamente. Ahí SÍ hay una diferencia observable en teoría: el
código real (con `resto !== ''`) devolvería `'/' + "Stryker was here!"` (no está en
`rutasDelArtefacto` → violación), y el mutante devolvería `RAIZ_DEL_ARTEFACTO = '/'` (sí está → sin
violación). Técnicamente ES observable, aunque solo mediante un href fabricado a mano cuyo `resto`
tras quitar el prefijo de `base` sea literalmente ese string — matarlo con un test así sería anclar
la aserción al placeholder concreto que Stryker eligió, no al contrato. No cumple el estándar de
"equivalente genuino" (construcción que hace el mutante INOBSERVABLE en TODO el dominio, como el
mutante 3) y por eso NO lo excluyo por mi cuenta.

**La causa raíz de los mutantes 3 y 4 es la MISMA: el ternario es redundante.** Si se refactoriza la
línea 599 a `return !rutasDelArtefacto.has(`${RAIZ_DEL_ARTEFACTO}${resto}`)` (sin condicional — válido
porque `'/' + ''` YA da `'/'`), ambos mutantes desaparecen estructuralmente: no queda
`ConditionalExpression` ni `StringLiteral` de la condición que mutar en ese punto. Es la vía
"refactorizar el equivalente" del repo, no una exclusión — coherente con `docs/mutation-testing.md`
y con el precedente `HOST_WHATSAPP` (`progress/mutation_datos_negocio_fuente_unica.md`), que solo
excluyó tras confirmar que NINGÚN refactor podía eliminar la ambigüedad (ahí sí había una decisión de
contrato pendiente, A-10; aquí NO hay ninguna decisión de contrato de por medio, es álgebra de
strings).

## Qué falta para llegar a 100% (para el `tdd_craftsman`)

1. **Test nuevo (hueco real):** una fila en `@s37` (o un escenario nuevo) con un href que NO empieza
   por `base` y es MÁS LARGO que `base`, esperando "no violación" — mata los mutantes 1 y 2
   (línea 593).
2. **Refactor (elimina el ternario redundante, no es una exclusión):** línea 599,
   `${RAIZ_DEL_ARTEFACTO}${resto}` sin el `resto === '' ? ... : ...` — elimina estructuralmente los
   mutantes 3 y 4. Verificar que ningún test de @s37/@s38 dependía del brazo `RAIZ_DEL_ARTEFACTO`
   como valor literal distinto de la concatenación (no debería, por la propia identidad matemática).

Ninguno de los dos requiere tocar `src/lib/puerta-terceros.ts` (ya al 100%) ni reabrir el contrato
(`@s36`/`@s37`/`@s38` ya cubren el comportamiento correcto; solo falta una fila de dato y una
simplificación de código, no una regla nueva).

## Higiene

Ejecutado a través de `tools/mutate.mjs` (envoltorio del arnés), NUNCA con `--testFiles`. No edité
`src/` ni los tests. `pnpm test`/`typecheck`/`lint` no se reejecutaron aquí (ya verificados 0
errores, 1310/1310, por el `craftsman_lead` antes de esta medición).

## Remate — 4 supervivientes matados (2026-07-25)

Sesión de `tdd_craftsman` sobre los 4 supervivientes diagnosticados arriba. Detalle completo del
ciclo TDD en `progress/tdd_subruta_github_pages.md` §Remate — 4 supervivientes matados.

### 1. Mutantes 1 y 2 (línea 593, la guarda) — fila nueva en `@s37`

Fila añadida a `features/cascaron_semantico.feature` (`@s37`) y a su `it.each` en
`src/lib/puerta-cascaron.test.ts`: href `/pagina-que-no-tiene-nada-que-ver-con-la-base` (45
caracteres, NO empieza por `base` = `/NailsLashStudioWeb/`, 20 caracteres — a diferencia de
`/otra-cosa`, 10 caracteres, más corta que `base`). Esperado: sin violación (fuera de ámbito, mismo
razonamiento que `/otra-cosa`).

**Confirmación manual de que mata los mutantes (documentada, no solo afirmada):** el test nace
VERDE contra el código real (la puerta ya se comportaba bien; el hueco era de la suite, no del
código). Se aplicaron a mano los dos mutantes del informe sobre `esEnlaceRoto` y se corrió
`pnpm exec vitest run src/lib/puerta-cascaron.test.ts -t "@s37"`:
- Mutante 1 (`if (false) { return false }`): la fila nueva pasó a FALLAR — `expected [] but got
  [{ regla: 'href interno sin fichero en dist/', valor: '/pagina-que-no-tiene-nada-que-ver-con-la-base' }]`.
  El resto de `@s37` (incluida `/otra-cosa`) siguió en verde, confirmando que SOLO la fila nueva
  ejercita la guarda.
- Mutante 2 (`if (!ruta.startsWith(base)) {}`, bloque vacío): mismo fallo, mismo mensaje.

Revertido el cambio manual antes de continuar (nunca quedó en el árbol de trabajo).

### 2. Mutantes 3 y 4 (línea 599, el ternario) — refactor

`return !rutasDelArtefacto.has(resto === '' ? RAIZ_DEL_ARTEFACTO : `${RAIZ_DEL_ARTEFACTO}${resto}`)`
→ `return !rutasDelArtefacto.has(`${RAIZ_DEL_ARTEFACTO}${resto}`)`, con comentario que remite a este
informe. Elimina estructuralmente el `ConditionalExpression` y el `StringLiteral` de la condición:
no queda nada que Stryker pueda mutar ahí. `pnpm test` (suite completa) confirmó que ningún test de
`@s36`/`@s37`/`@s38` (ni ningún otro) dependía del brazo literal — 1311/1311 verdes, tal y como
predecía la identidad algebraica `'/' + '' === '/'`.

### Re-medición — `src/lib/puerta-cascaron.ts`

```bash
node tools/mutate.mjs src/lib/puerta-cascaron.ts
```

```
--------------------|------------------|----------|-----------|------------|----------|----------|
                    | % Mutation score |          |           |            |          |          |
File                |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
--------------------|--------|---------|----------|-----------|------------|----------|----------|
All files           | 100.00 |  100.00 |      493 |         4 |          0 |        0 |        0 |
 puerta-cascaron.ts | 100.00 |  100.00 |      493 |         4 |          0 |        0 |        0 |
--------------------|--------|---------|----------|-----------|------------|----------|----------|
```

**100.00%, 0 supervivientes.** 4 timeouts (el mismo tipo de mutante-cuelga-el-runner de siempre en
este fichero, no relacionado con el remate). 0 exclusiones nuevas.

### Verificación de cierre

- `pnpm test` (suite completa) → **1311/1311** (1310 + 1 fila nueva).
- `pnpm typecheck` → 0 errores. `pnpm lint` → 0 errores.
- `pnpm build` con `dist/` borrado primero → exit 0, CINCO puertas verdes. `dist/index.html`:
  `<a href="/NailsLashStudioWeb/" class="_marca_1s54z_23">Nails Lash Studio</a>`, scripts y assets
  prefijados `/NailsLashStudioWeb/assets/...` — byte a byte igual que antes del remate, cero
  regresión del comportamiento real.

### Estado final combinado (ambos ficheros de esta tarea)

`src/lib/puerta-terceros.ts` → 100.00% (117/117, sin cambios en este remate). `src/lib/puerta-cascaron.ts`
→ 100.00% (493/497, 4 timeout, 0 supervivientes). **Score combinado: 100%.** Umbral (1.0) superado
en los dos ficheros.
