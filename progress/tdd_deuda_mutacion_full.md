# Deuda de mutación — los 18 supervivientes huérfanos de la primera corrida COMPLETA (2026-07-23)

> `tdd_craftsman`. Cierre de los 18 supervivientes de `bin/harness verify` (99,09 %): 13 en
> `src/lib/horario.ts`, 4 en `src/components/Reserva.tsx`, 1 en `src/components/Equipo.tsx` — todos
> en ficheros de features YA CERRADAS (F-10 `horario`, `reserva_chat`, `equipo`). Umbral 1.0,
> 0 exclusiones (política desde F-03). TDD estricto: cada test nuevo se puso ROJO primero (sabotaje
> a mano del mutante o import inexistente) y VERDE después; los refactors, SOLO en verde.

## La causa, VERIFICADA (no es una sola: son DOS familias)

### Familia A — Reserva/Equipo (5 mutantes): deuda de aserción clásica + 2 inobservables

Mutantes RUNTIME normales (el informe lista su cobertura per-test). 3 se cazan con tests nuevos;
2 eran inobservables por construcción dentro del componente y se curan por refactor (precedentes
del propio repo: `claveBurbuja`, fila muerta de `GRUPOS_SCHEMA` en `mutation_horario.md`).

### Familia B — horario.ts (13 mutantes): NO es deuda de aserción — es el límite de ACTIVACIÓN de mutantes ESTÁTICOS del runner

La hipótesis de partida («sus únicos matadores eran aserciones sobre dist/») se REFINA con medición:

1. **Los 13 son mutantes ESTÁTICOS** (inicializadores evaluados al CARGAR el módulo:
   `CADENA_CERRADO`, `ZONA`, `FORMATO_MADRID` y sus 6 opciones, y el corte de `parsearFranjas`
   —línea 43—, que también corre al derivar `HORARIO_SEMANAL` en la carga). El informe los marca
   «Ran all tests for this mutant».
2. **La suite YA muerde cada una de las 13 mutaciones**, medido por SABOTAJE a mano:
   - `CADENA_CERRADO = ''` → `parsearFranjas('cerrado')` cae al split → `aMinutos(undefined)`
     lanza `TypeError` **en la carga del módulo** → `horario.test.ts` ENTERO rojo (1 failed, 0 tests).
   - `weekday: ''` → `Intl.DateTimeFormat` lanza `RangeError` **en la carga** → fichero entero rojo.
   - Las 11 restantes son de las mismas dos familias (parseo de 'cerrado' / opciones de `Intl` a
     `''`): TODAS revientan la carga del módulo. No hay mutación de las 13 que la suite no detecte
     cuando la mutación REALMENTE se aplica.
3. **Reproducción aislada**: `bin/harness mutate src/lib/horario.ts` → **85,56 %, los mismos 13
   supervivientes, 0 timeouts**. Un mutante que rompería la carga del módulo sobrevive a «todos los
   tests» ⇒ la mutación **nunca estuvo activa** durante esa corrida.
4. **Experimento de cura por test** (la vía «tests unitarios» pedida): 2 tests-sonda que re-evalúan
   el módulo FRESCO en tiempo de test (`vi.resetModules()` + import dinámico) y re-aseveran el
   contrato POR VALOR (@s8/@s9/@s2/@s4/@s11, literales a mano). El dry-run confirma que la
   evaluación fresca ocurre DENTRO del test (`covered 46` / `covered 83` en el informe) — y aun
   así la re-corrida dio **los mismos 13 supervivientes**: en la corrida de un mutante estático,
   `activeMutant` no llega a fijarse ni para la evaluación fresca.
5. **Por qué antes daban 100 %**: en el cierre de F-10 (`progress/mutation_horario.md`) la corrida
   incluía los tests build-based (`*-horneado`) y registró 13-18 **timeouts** — que Stryker cuenta
   como DETECTADOS. Los estáticos «morían» por el COSTE del build por mutante (409 min medidos en
   F-12), no por aserción: un build en proceso HIJO ni siquiera hereda el mutante activo. Al
   excluir los horneados de la mutación (`vitest.stryker.config.ts`, F-12), la corrida in-process
   es rápida (0 timeouts) y los 13 quedan al descubierto.

**Conclusión B**: límite del `@stryker-mutator/vitest-runner` con mutantes estáticos en este stack,
NO deuda de tests. Ningún test in-process puede matarlos (cualquier test nuevo depende de la misma
activación que no aterriza). **ESCALADO al lead** con menú de curas (abajo). Los 2 tests-sonda se
QUEDAN: son contrato por valor legítimo sobre instancia fresca, dejan la cobertura visible en el
informe y matarían los 13 el día que la activación estática funcione (o que se aplique la cura a).

## Mutante → cura, uno a uno

| # | Mutante (fichero:línea, mutador, original→mutado) | Cura | Test / cambio |
|---|---|---|---|
| 1 | `Reserva.tsx:53:44` StringLiteral `useState('')`→`"Stryker was here!"` | ✅ test | `reserva.test.tsx` **@s13** «el campo NACE vacío» (`toHaveValue('')` ANTES de escribir; @s14/@s17 siempre escribían antes de mirar). ROJO medido: 1 failed/41 con el sabotaje. |
| 2 | `Reserva.tsx:101:25` StringLiteral `demo-seccion demo-seccion--alt …`→`` | ✅ test | `reserva.test.tsx` **@s1** «la <section> viste demo-seccion demo-seccion--alt…» — atributo `class` sobre `renderToString` (patrón remate de contacto / equipo.test.tsx; sin `toHaveClass`). ROJO medido. |
| 3 | `Reserva.tsx:102:23` StringLiteral `demo-contenedor …`→`` | ✅ test | El MISMO test de @s1 (asersión del primer `<div class=`). ROJO medido también con este sabotaje AISLADO. |
| 4 | `Reserva.tsx:61:9` ConditionalExpression `if (hilo.current)`→`if (true)` | ✅ refactor + tests | INOBSERVABLE en el componente: el hilo se renderiza SIEMPRE ⇒ `hilo.current` nunca es null en el efecto ⇒ `if (true)` es idéntico. Cura: extraída `desplazarAlFinal(nodo)` a `reserva-logica.ts` (patrón `claveBurbuja`); el null pasa a ser ENTRADA de test. 2 tests **@s18** por valor (nodo → `scrollTop`=500; `null` → no lanza). ROJO primero por import inexistente (2 failed/43). El efecto queda como cableado: su vaciado y sus deps los sigue matando el @s18 de DOM (scrollHeight 500). |
| 5 | `Equipo.tsx:58:37` ArrayDeclaration `diaSel === null ? [] : …`→`["Stryker was here"]` | ✅ borrado de código muerto | El brazo `[]` era DATO MUERTO: `franjas` solo se consumía bajo la guarda `diaSel !== null` del JSX (donde siempre es `franjasDe(...)`) ⇒ mutante EQUIVALENTE por construcción. Precedente exacto: fila muerta del domingo en `GRUPOS_SCHEMA` (F-10). Borrada la const; `franjasDe(diaSel.diaSemana)` se llama DONDE se renderiza. DOM idéntico; 65 tests de equipo verdes sin tocar. |
| 6-18 | `horario.ts` 29:24, 32:14, 43:7 (×2), 43:33, 83:48, 85:12, 86:9, 87:10, 88:8, 89:9, 90:11, 91:14 — StringLiteral/ConditionalExpression/EqualityOperator/BlockStatement sobre inicializadores de módulo | 🔺 ESCALADO | Ver Familia B. La suite los mata TODOS cuando la mutación se aplica de verdad (sabotajes medidos); el runner no llega a activarlos. Ninguno es equivalente semántico. |

## El escalado de horario.ts — menú de curas para el lead/humano (elige una)

- **(a) Refactor a evaluación PEREZOSA** en `src/lib/horario.ts`: mover `FORMATO_MADRID` (y/o las
  constantes de parseo, y la derivación de `HORARIO_SEMANAL`) a evaluación en tiempo de llamada.
  Los 13 dejarían de ser estáticos y los matarían los tests EXISTENTES (@s1-@s11) sin escribir uno
  nuevo. Coste: toca producción de una feature `done` con contrato aprobado (puerta) y re-construye
  el `Intl.DateTimeFormat` por llamada (perf irrelevante en este uso).
- **(b) `ignoreStatic: true`** en `stryker.config.json`: política oficial de Stryker para estáticos
  (quedan fuera del score, señalados). Coste: relaja la regla «0 exclusiones»; es un cambio de
  CONFIG (vetado para el craftsman; decisión de política).
- **(c) Aceptarlos DOCUMENTADOS** como límite del arnés, con los sabotajes de este diario como
  prueba de que la suite muerde: el score de `horario.ts` queda en 85,56 % con 13 «supervivientes
  de activación», no de aserción.

❌ Lo que NO se hizo: excluir mutantes, bajar el umbral, `// Stryker disable` en horario.ts, tocar
`stryker.config.json`/`vitest*.config.ts`, o declarar equivalentes por cuenta propia.

## Corridas de CONFIRMACIÓN (medidas)

- `bin/harness mutate src/lib/horario.ts` → **85,56 %** · 77 killed · 0 timeout · 13 survived
  (los 13 escalados; reproducido DOS veces: antes y después de los tests-sonda).
- `bin/harness mutate src/components/Reserva.tsx` → **100,00 %** · 98 killed · 0 survived · exit 0.
- `bin/harness mutate src/components/reserva-logica.ts` → **100,00 %** · 10 killed · 0 survived · exit 0.
- `bin/harness mutate src/components/Equipo.tsx` → **100,00 %** · 60 killed · 0 survived · exit 0.

## Tests dirigidos (config de mutación, la misma que usa Stryker)

- `src/lib/horario.test.ts` → **46 passed** (44 + 2 sondas).
- `src/components/reserva.test.tsx` → **45 passed** (41 + 4 nuevos: 1 de @s13, 1 de @s1, 2 de @s18).
- `src/components/equipo.test.tsx` → **65 passed** (sin cambios; el refactor no altera el DOM).
- `pnpm typecheck` → 0 · `pnpm lint` → 0.

## Alcance tocado

- `src/lib/horario.test.ts` — +2 tests-sonda (módulo fresco por valor). Producción de F-10 INTACTA.
- `src/components/reserva.test.tsx` — +4 tests (@s13 campo virgen, @s1 clases, @s18 ×2 por valor).
- `src/components/reserva-logica.ts` — +`desplazarAlFinal` + `NodoDesplazable` (extracción de la
  guarda inobservable; única producción nueva, exigida por los 2 tests @s18 en rojo).
- `src/components/Reserva.tsx` — el efecto pasa a cablear `desplazarAlFinal(hilo.current)` (la
  guarda vive en la lógica); resto intacto.
- `src/components/Equipo.tsx` — borrada la const muerta `franjas`; `franjasDe` se llama en el JSX.
- ❌ NO tocados: `galeria*`, `Galeria.tsx`, `contacto.test.tsx`, `site.test.ts`,
  `feature_list.json`, `stryker.config.json`, `vitest*.config.ts`, `src/lib/horario.ts` (los
  sabotajes se aplicaron y RESTAURARON vía `git checkout --`, diff vacío verificado).

## Resolución del lead (2026-07-23) — opción (d): exclusión QUIRÚRGICA por línea, aplicada

El lead descartó el menú (a)/(b)/(c) y ordenó una cuarta vía, ejecutada por el `tdd_craftsman` en
esta micro-tarea. **Solo comentarios en `src/lib/horario.ts`** (19 inserciones, 0 borrados, cero
cambios de semántica; verificado con `git diff` — ninguna línea tocada fuera de comentarios).

### La decisión y el porqué frente a (a)/(b)/(c)

- **(d) elegida — `// Stryker disable` por línea y por MUTADOR** con el patrón terminal del repo
  (precedentes: `HOST_WHATSAPP` site.ts:72, deps del `useEffect` de Equipo.tsx:214, los 2
  equivalentes de Galeria.tsx:90/136): exclusión visible EN el código, con motivo honesto y
  referencia a este diario; los mutantes quedan «Ignored» (señalados en el informe, fuera del
  score) y TODO lo demás del fichero sigue medido.
- **(a) rechazada**: refactor a evaluación perezosa toca producción de una feature `done` con
  contrato aprobado, solo para contentar al arnés — el fallo es del runner, no del diseño.
- **(b) rechazada**: `ignoreStatic: true` es GLOBAL — apagaría también los estáticos que el runner
  SÍ mide y mata legítimamente en otros ficheros (en este mismo `horario.ts` hay estáticos
  MUERTOS: el `BlockStatement` de `derivarHorarioSemanal`, el `ObjectLiteral` de
  `HORARIO_SEMANAL`, los literales de `horarioParaUI`/`GRUPOS_SCHEMA`… todos `static:true` y
  «Killed» en el informe). Demasiado martillo para 14 mutantes de un fichero.
- **(c) rechazada**: aceptar la puerta roja (85,56 %) normaliza un `verify` que falla y entierra
  la señal: un superviviente NUEVO y real quedaría camuflado entre los «conocidos».

### Hallazgo durante la aplicación: la familia son 14, no 13 (y 2 barridos evitados)

1. **El `===→!==` de `parsearFranjas` (línea del `if`) también es de la familia**: el informe
   original lo dio «Killed», pero al medirlo AISLADO (con el resto de la familia ya excluida)
   **sobrevive** — y con el set de exclusión intercambiado, sobrevive el `BlockStatement` en su
   lugar. Dos corridas independientes lo prueban: aquel «kill» fue un artefacto de scheduling
   (activación por estado envenenado de un worker), no una aserción. Su mutación pertenece a la
   misma familia de sabotaje ya medida («parseo de 'cerrado'» → revienta la carga). Excluidos
   los 4 de esa línea (`all`): condición ×2, `===→!==` y el cuerpo del `if`. Total: **14**.
2. **Dos barridos ilegítimos detectados y evitados** (por eso la exclusión es también por
   MUTADOR, no solo por línea): el `ObjectLiteral` de las opciones de `Intl` arranca en la misma
   línea que el `'en-CA'` excluido, y un primer intento de bloque `disable all … restore all` con
   el `restore` ANTES del `})` no ancla en ningún nodo del AST y se comió el resto del fichero
   (78 ignorados). Corregido: `restore` tras el `})`, y `disable next-line StringLiteral` (no
   `all`) en la línea de `FORMATO_MADRID`. El `ObjectLiteral` queda MEDIDO y MUERTO (2 corridas).

### La corrida VERDE — `bin/harness mutate src/lib/horario.ts` → exit 0

```
------------|------------------|----------|-----------|------------|----------|----------|
            | % Mutation score |          |           |            |          |          |
File        |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
------------|--------|---------|----------|-----------|------------|----------|----------|
All files   | 100.00 |  100.00 |       76 |         0 |          0 |        0 |        0 |
 horario.ts | 100.00 |  100.00 |       76 |         0 |          0 |        0 |        0 |
------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100  →  exit 0
```

Ignorados: **14 exactos**, verificados uno a uno en el informe (90 instrumentados = 76 killed +
14 ignored, 0 survived, 0 no-cov): `CADENA_CERRADO`, `ZONA`, los 4 del `if` de `parsearFranjas`,
`'en-CA'` y las 7 opciones de `Intl`. Nada más excluido: los 76 restantes se miden y mueren.

### Verificaciones finales

- `pnpm exec vitest run src/lib/horario.test.ts` → **46 passed (46)**, sin cambios.
- `pnpm typecheck` → 0 · `pnpm lint` → 0.
- Ficheros tocados en esta micro-tarea: `src/lib/horario.ts` (solo comentarios) y este diario.
