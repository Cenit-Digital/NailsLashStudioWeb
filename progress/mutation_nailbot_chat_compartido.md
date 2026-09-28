# Mutación — Nailbot (F-23 `nailbot_chat_compartido` + F-24 `nailbot_flotante`), 2026-09-28

Umbral del repo: 1.0 (`harness.config.json` → `mutation.threshold`; `stryker.config.json` →
`thresholds.break: 100`). Acotado con `node tools/mutate.mjs <ficheros>` (`--mutate`), jamás `--testFiles`.

## Ficheros (todos en `stryker.config.json` → `mutate`)

F-23: `ChatNailbot.tsx`, `chat-nailbot-logica.ts`, `NailbotArte.tsx`; re-medidos `Reserva.tsx` y
`reserva-logica.ts`. F-24: `NailbotFlotante.tsx`, `nailbot-flotante-logica.ts`. El SCSS es NO-MUTABLE:
lo cubren los tests de bytes (`chat-nailbot-estilos.test.ts`, `nailbot-flotante-estilos.test.ts`).

## Historial de mediciones

| #   | Qué                                                         | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | F-23 (5 ficheros), tras el primer TDD                       | 98,85 % · 2 supervivientes: el literal `tipo: 'nombre'` en `ChatNailbot.tsx` (Enter y botón). Causa: en `responder` la rama del nombre era la rama POR DEFECTO, así que cualquier `tipo` se comportaba como «nombre» → mutante equivalente en la práctica.                                                                                                                                                                                                                                            |
| 2   | Los 7 ficheros, tras curar #1 y escribir F-24               | 96,99 % · 10 supervivientes, todos en `NailbotFlotante.tsx`: 2 `OptionalChaining` (`lanzador.current?.focus()` con el ref siempre montado), 3 del `tipo: 'preferencia'` / `{}` (rama implícita en `siguienteAnimacion`), 2 `BooleanLiteral` en `descartado.current = true` (escrituras muertas, hallazgo también del judge), 2 `ArrayDeclaration` de deps `[]` (el `Stryker disable` estaba DENTRO del cuerpo del efecto y no aplicaba) y 1 `ArrowFunction` (el `clearTimeout` de limpieza sin test). |
| 3   | Los 7 ficheros, tras las curas de #2 y la ronda de revisión | **100,00 % · 308 muertos · 32 timeouts · 0 supervivientes · 0 sin cobertura · 0 errores** (14 min 55 s).                                                                                                                                                                                                                                                                                                                                                                                              |

## Curas aplicadas (por familia)

- **Rama por defecto → ramas explícitas** (`responder`, `siguienteAnimacion`): una entrada o evento que no
  reconocen no cambia NADA; así cada `tipo` es observable. Test de la costura SIN etiqueta @s.
- **`?.` sobre refs siempre montados → ayudantes puros** `enfocar(nodo)` y `focoDentro(contenedor, activo)`
  con su guarda `null` mordida por valor (patrón `desplazarAlFinal`).
- **Escrituras muertas → estado derivado**: el bocadillo se deriva de tres hechos con estado a través de la
  decisión pura `mostrarBocadillo`.
- **Limpieza del temporizador**: test que espía `setTimeout`/`clearTimeout` y exige cancelar el MISMO id.

## Mutantes equivalentes excluidos (con precedente)

- `NailbotFlotante.tsx`: las dos deps `[]` de efectos de solo-montaje (`ArrayDeclaration`). React compara
  con `Object.is` y el efecto corre una sola vez en ambas versiones. Precedente: `Hero.tsx:156`,
  `Galeria.tsx:158` y `:276`. `// Stryker disable next-line all` en su propia línea, sobre `[]`.

## Timeouts (la regla del repo: «un informe con timeouts miente»)

32 timeouts en la medición #3 (16 en `chat-nailbot-logica.ts`, 7 en `ChatNailbot.tsx`, 4 en
`reserva-logica.ts`, 3 en `nailbot-flotante-logica.ts`, 1 en `NailbotFlotante.tsx`, 1 en `Reserva.tsx`).
Re-medidos con `--concurrency 1` acotando `--mutate` a sus rangos exactos: ver la sección siguiente.

## Re-medición de los timeouts a concurrencia 1 — la regla del repo acertó

| #   | Qué                                                                    | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4   | Los 32 timeouts de #3 con `--concurrency 1`, rangos con columna exacta | 99 mutantes (el rango de un `BlockStatement` abarcaba todo `NailbotFlotante`): **100 %, 0 timeouts**. Pero los rangos con columna NO casaron con la convención de Stryker en `ChatNailbot.tsx`, `reserva-logica.ts`, `Reserva.tsx` ni en 15 de los 16 de `chat-nailbot-logica.ts`.                                                                                                                                                                                                                                                                                              |
| 5   | Esos rangos, como LÍNEAS completas, `--concurrency 1`                  | **89,83 %: 6 SUPERVIVIENTES que el informe #3 escondía como «timeout»**. (a) 4 `Regex` en la expresión de surrogates sueltos: era un literal a NIVEL DE MÓDULO (mutante estático que el runner no activa, precedente `hero-logica.ts`) y, peor, **su test pasaba EN VACÍO**: al generar el código con un script, los escapes `\uD83D` se habían guardado como U+FFFD crudos, así que el test comparaba U+FFFD con U+FFFD. (b) 2 en `ChatNailbot.tsx`: `opciones.length > 0 &&` → `true &&` / `>= 0` dejaba un `<div>` vacío en el pie (un hueco del flex) que ningún test veía. |
| 6   | Curas de #5 y los dos ficheros del chat, concurrencia por defecto      | 100 % · 134 muertos · 27 timeouts · 0 supervivientes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 7   | Los 27 timeouts de #6 como líneas, `--concurrency 1`                   | **100 % · 49 muertos · 0 timeouts · 0 supervivientes**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

Curas de #5: la expresión se construye EN LA LLAMADA con escapes `\u` (sin surrogates crudos en el
fichero); tests con escapes, más una CONTRAPRUEBA que demuestra que la entrada está rota de verdad
(`encodeURIComponent` lanza `URIError` con ella y no tras sanearla); y un test de que el pie no deja
contenedores vacíos en ningún paso.

## Resultado final

**100 % en los 7 ficheros, sin timeouts pendientes de re-medir**: `chat-nailbot-logica.ts` y
`ChatNailbot.tsx` (#6 + #7), `NailbotFlotante.tsx`, `nailbot-flotante-logica.ts`, `NailbotArte.tsx`,
`reserva-logica.ts` y `Reserva.tsx` (#3 + #4 + #5; sin cambios de código después). Ningún aviso de Stryker
(el `_comment_ignorePatterns` desconocido se fundió en `_comment`) ni `DEP0190` (`tools/mutate.mjs` lanza
una sola cadena de comando).

## Re-medición de cierre (2026-09-28, sesión de cierre)

Código medido: HEAD `3c171ff` (árbol limpio, sin cambios en `src/`, tests ni config). Motivo:
`progress/current.md` («PENDIENTE al cortar la sesión») dejaba 9 timeouts de `chat-nailbot-logica.ts`
sin re-medir a concurrencia 1 tras la última ronda (regex de `sinSurrogatesSueltos` SIN lookbehind).
Acotado solo con `--mutate`, nunca `--testFiles`. Logs y copias del informe HTML en el scratchpad de
la sesión, no en el repo.

| #   | Qué                                                                  | Comando                                                                                                                                                                                                                                                                       | Muertos | Timeouts | Supervivientes | Sin cobertura | Errores | Tiempo     |
| --- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- | -------------- | ------------- | ------- | ---------- |
| 8   | Los 7 ficheros de F-23 y F-24, concurrencia por defecto (4 procesos) | `pnpm exec stryker run --mutate src/components/ChatNailbot.tsx,src/components/chat-nailbot-logica.ts,src/components/NailbotArte.tsx,src/components/NailbotFlotante.tsx,src/components/nailbot-flotante-logica.ts,src/components/Reserva.tsx,src/components/reserva-logica.ts` | 340     | **1**    | 0              | 0             | 0       | 3 min 49 s |
| 9   | El timeout de #8, en líneas completas, con `--concurrency 1`         | `pnpm exec stryker run --mutate src/components/reserva-logica.ts:57-63 --concurrency 1`                                                                                                                                                                                       | 5       | **0**    | 0              | 0             | 0       | 30 s       |

Detalle:

- **#8**: 343 mutantes instrumentados = 340 muertos + 1 timeout + 2 `Ignored` (las deps `[]` de
  `NailbotFlotante.tsx:81` y `:95`, los equivalentes ya justificados arriba). Score 100,00 %
  (Stryker cuenta el timeout como detectado). Ningún `WARN` de Stryker en el log. La carga llegó a
  7,3 de media en 4 núcleos durante la corrida.
- **Los 9 timeouts pendientes de `chat-nailbot-logica.ts` no se repiten**: 106 muertos y 0 timeouts
  (antes 97 + 9, el mismo total de 106). No queda nada que re-medir en ese fichero.
- **El único timeout de #8** es `reserva-logica.ts:57`, `BlockStatement` (cuerpo entero de
  `desplazarAlFinal`, L57:70-L63:2 → `{}`).
- **#9**: acotado a las líneas 57-63 (las 5 mutantes de `desplazarAlFinal`). El antiguo timeout pasa a
  **Killed** por una aserción de valor (`expected +0 to be 500`), no por reloj. Las otras cuatro
  (`ConditionalExpression` true/false, `EqualityOperator`, `BlockStatement` de la guarda) también
  mueren. **Ningún timeout escondía un superviviente.**

### Veredicto por fichero (tras #8 + #9, 0 timeouts pendientes)

| Fichero                      | Muertos / válidos                                     | Score                    | Veredicto |
| ---------------------------- | ----------------------------------------------------- | ------------------------ | --------- |
| `chat-nailbot-logica.ts`     | 106 / 106                                             | 100 %                    | PASS      |
| `ChatNailbot.tsx`            | 56 / 56                                               | 100 %                    | PASS      |
| `NailbotArte.tsx`            | 1 / 1                                                 | 100 %                    | PASS      |
| `NailbotFlotante.tsx`        | 97 / 97 (+2 equivalentes excluidos con justificación) | 100 %                    | PASS      |
| `nailbot-flotante-logica.ts` | 62 / 62                                               | 100 %                    | PASS      |
| `reserva-logica.ts`          | 15 / 15 (14 en #8 + el timeout muerto en #9)          | 100 %                    | PASS      |
| `Reserva.tsx`                | 4 / 4                                                 | 100 %                    | PASS      |
| **Total**                    | **341 / 341**                                         | **100 %** (umbral 100 %) | **PASS**  |

**Veredicto de mutación:** PASS. 0 supervivientes, 0 sin cobertura, 0 errores y 0 timeouts sin
re-medir.

**Aviso de proceso (no es de mutación):** en disco, los últimos veredictos del judge siguen siendo
`CHANGES_REQUESTED` (`judge_nailbot_chat_compartido_delta.md` y `judge_nailbot_flotante_delta.md`).
Este PASS **no** basta para marcar F-23 ni F-24 como `done`: falta la revisión delta pendiente que
recoge `progress/current.md`. Si esa revisión obliga a tocar `src/`, esta medición caduca.
