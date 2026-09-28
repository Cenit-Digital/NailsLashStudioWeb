# Mutación — Nailbot (F-23 `nailbot_chat_compartido` + F-24 `nailbot_flotante`), 2026-09-28

Umbral del repo: 1.0 (`harness.config.json` → `mutation.threshold`; `stryker.config.json` →
`thresholds.break: 100`). Acotado con `node tools/mutate.mjs <ficheros>` (`--mutate`), jamás `--testFiles`.

## Ficheros (todos en `stryker.config.json` → `mutate`)

F-23: `ChatNailbot.tsx`, `chat-nailbot-logica.ts`, `NailbotArte.tsx`; re-medidos `Reserva.tsx` y
`reserva-logica.ts`. F-24: `NailbotFlotante.tsx`, `nailbot-flotante-logica.ts`. El SCSS es NO-MUTABLE:
lo cubren los tests de bytes (`chat-nailbot-estilos.test.ts`, `nailbot-flotante-estilos.test.ts`).

## Historial de mediciones

| # | Qué | Resultado |
|---|---|---|
| 1 | F-23 (5 ficheros), tras el primer TDD | 98,85 % · 2 supervivientes: el literal `tipo: 'nombre'` en `ChatNailbot.tsx` (Enter y botón). Causa: en `responder` la rama del nombre era la rama POR DEFECTO, así que cualquier `tipo` se comportaba como «nombre» → mutante equivalente en la práctica. |
| 2 | Los 7 ficheros, tras curar #1 y escribir F-24 | 96,99 % · 10 supervivientes, todos en `NailbotFlotante.tsx`: 2 `OptionalChaining` (`lanzador.current?.focus()` con el ref siempre montado), 3 del `tipo: 'preferencia'` / `{}` (rama implícita en `siguienteAnimacion`), 2 `BooleanLiteral` en `descartado.current = true` (escrituras muertas, hallazgo también del judge), 2 `ArrayDeclaration` de deps `[]` (el `Stryker disable` estaba DENTRO del cuerpo del efecto y no aplicaba) y 1 `ArrowFunction` (el `clearTimeout` de limpieza sin test). |
| 3 | Los 7 ficheros, tras las curas de #2 y la ronda de revisión | **100,00 % · 308 muertos · 32 timeouts · 0 supervivientes · 0 sin cobertura · 0 errores** (14 min 55 s). |

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

| # | Qué | Resultado |
|---|---|---|
| 4 | Los 32 timeouts de #3 con `--concurrency 1`, rangos con columna exacta | 99 mutantes (el rango de un `BlockStatement` abarcaba todo `NailbotFlotante`): **100 %, 0 timeouts**. Pero los rangos con columna NO casaron con la convención de Stryker en `ChatNailbot.tsx`, `reserva-logica.ts`, `Reserva.tsx` ni en 15 de los 16 de `chat-nailbot-logica.ts`. |
| 5 | Esos rangos, como LÍNEAS completas, `--concurrency 1` | **89,83 %: 6 SUPERVIVIENTES que el informe #3 escondía como «timeout»**. (a) 4 `Regex` en la expresión de surrogates sueltos: era un literal a NIVEL DE MÓDULO (mutante estático que el runner no activa, precedente `hero-logica.ts`) y, peor, **su test pasaba EN VACÍO**: al generar el código con un script, los escapes `\uD83D` se habían guardado como U+FFFD crudos, así que el test comparaba U+FFFD con U+FFFD. (b) 2 en `ChatNailbot.tsx`: `opciones.length > 0 &&` → `true &&` / `>= 0` dejaba un `<div>` vacío en el pie (un hueco del flex) que ningún test veía. |
| 6 | Curas de #5 y los dos ficheros del chat, concurrencia por defecto | 100 % · 134 muertos · 27 timeouts · 0 supervivientes |
| 7 | Los 27 timeouts de #6 como líneas, `--concurrency 1` | **100 % · 49 muertos · 0 timeouts · 0 supervivientes** |

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
