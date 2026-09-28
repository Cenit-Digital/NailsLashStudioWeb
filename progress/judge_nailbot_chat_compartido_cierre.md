# Review: feature 23 `nailbot_chat_compartido` (delta de CIERRE, HEAD 3c171ff)

**Veredicto:** APPROVED

El único bloqueante del delta anterior (B-N1, el lookbehind) está RESUELTO. La cura es correcta y está vigilada. No hay bloqueantes nuevos.

Pendiente para `done`, fuera de esta puerta: C7. La re-medición de cierre de `chat-nailbot-logica.ts` la hace ahora el `mutation_tester` y se anotará en `progress/mutation_nailbot_chat_compartido.md`.

## Base de la revisión

- **Qué revisé:** el código publicado en `HEAD` (3c171ff), con el árbol limpio (`git status` vacío). Lo comparé con `progress/judge_nailbot_chat_compartido_delta.md`.
- **Qué ejecuté:**
  - `bin/harness init` (UNA vez): **exit 0**. Lint (tsc + eslint) OK, **46/46 ficheros y 1482/1482 tests**, sin ninguna re-ejecución por tiempo. Duración 1 min 58 s, con Stryker en paralelo (carga ~10).
  - `pnpm exec vitest run src/components/chat-nailbot src/components/nailbot src/components/reserva`: **8/8 ficheros, 216/216**.
  - `prettier --check` sobre los ficheros de Nailbot y Reserva: limpio.
- **Qué NO ejecuté, por orden del lead:** `pnpm build` y Stryker. El `dist/` lo construyó el lead: `dist/assets/*.js` tiene fecha 2026-09-28 07:47:33 UTC y el commit es de 05:46:10 UTC, así que el bundle es posterior a HEAD.
- **Evidencia reproducible**, en el scratchpad de la sesión (`.../scratchpad/judge/`): `surrogates.mjs` y `lookbehind.mjs`. No he escrito nada en el repo salvo este informe.

## B-N1: lookbehind en `sinSurrogatesSueltos` (RESUELTO)

| Qué se pidió                                                                                               | Estado                     | Evidencia                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quitar el lookbehind: una expresión «par o surrogate suelto» + función de reemplazo que conserve los pares | RESUELTO                   | `src/components/chat-nailbot-logica.ts:154-156`: `/[\uD800-\uDBFF][\uDC00-\uDFFF]\|[\uD800-\uDFFF]/g` con `(encontrado) => encontrado.length === 2 ? encontrado : '�'`. Sin flag `u` y sin `(?<`. La expresión se construye en la llamada (el comentario de `:151-153` explica el porqué).                                                                                       |
| Guarda de bytes con ancla positiva que prohíba `(?<` en `chat-nailbot-logica.ts`                           | RESUELTO                   | `src/components/chat-nailbot.test.tsx:609-613`. Ancla positiva en `:611` (`export function sinSurrogatesSueltos`) y prohibición en `:612` (`not.toContain('(?<')`). **Muerde:** con la versión reconstruida con lookbehind (`(?<![\uD800-\uDBFF])…`) la guarda FALLA; con el fichero vaciado, falla por el ancla; con el fichero real, pasa (`scratchpad/judge/lookbehind.mjs`). |
| Re-medir la mutación de ese fichero                                                                        | EN CURSO (mutation_tester) | `progress/current.md:58-60` la da por pendiente: la corrida por defecto dio 97 muertos, 9 timeouts y 0 supervivientes, pero faltaba la concurrencia 1. Es C7 y no la ejecuto yo.                                                                                                                                                                                                 |

**Comportamiento de la nueva expresión.** La probé con la función extraída TAL CUAL del fichero real y comparada con la referencia nativa `String.prototype.toWellFormed()` (Node 22):

- Casos dirigidos, 20/20 OK:
  - conserva los pares: un par, tres pares seguidos, y los límites U+DBFF U+DFFF;
  - sustituye un alto suelto al principio, en medio y al final;
  - sustituye un bajo suelto al principio, en medio y al final;
  - también alto-alto, bajo-bajo, bajo-alto invertido, alto+par (`\uD83D💅` da `�💅`), par+bajo y bajo+par;
  - vacío, un solo alto y un solo bajo;
  - los surrogates frontera U+D800 y U+DC00 sueltos.
- Fuzz: **20 000 cadenas aleatorias con 0 diferencias** frente a `toWellFormed`.
- Nunca lanza, conserva la longitud y la salida siempre pasa por `encodeURIComponent`.

**Tests del saneador** (`src/components/chat-nailbot-logica.test.ts`):

- `:344-347`: contraprueba de que la entrada está rota (`URIError`).
- `:349-357`: valores exactos con escapes `\u` reales. Lo he verificado byte a byte: las entradas son `\\uD83D` en el fichero, no U+FFFD crudo.
- `:359-369`: `responder` guarda el nombre ya saneado.

**Bundle de producción.** `grep` de `(?<=` y `(?<!`:

- `dist/assets/app-CWmDYxle.js`: **0**; `dist/assets/client-BOiSO48a.js`: **0**. Tampoco hay ningún `(?<`.
- En todo `dist/` (incluidos `index.html` y `static-loader-data`), `grep -rl`: **ningún fichero**.
- El saneador llega al bundle como `e.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g,t=>t.length===2?t:"�")`, sin `new RegExp` con lookbehind.
- En `src/`, fuera de los tests, no queda ningún `(?<`. Los que hay viven en `galeria-estilos.test.ts:406` y `resenas-estilos.test.ts:361/:416`, que no llegan al bundle.

## Cobertura de escenarios (@s ↔ test)

- @s1: [x] `chat-nailbot.test.tsx:62-133` (tests en `:63`, `:70`, `:78`, `:90`, `:105`, `:115`, `:126`)
- @s2: [x] `chat-nailbot.test.tsx:136-155`
- @s3: [x] `chat-nailbot.test.tsx:157-226`
- @s4: [x] `chat-nailbot.test.tsx:228-250`, más el canario de `chat-nailbot-logica.test.ts:47-58`
- @s5: [x] `chat-nailbot-logica.test.ts:61-138`
- @s6: [x] `chat-nailbot.test.tsx:252`, `:277`, `:314`
- @s7: [x] `chat-nailbot.test.tsx:328-355`
- @s8: [x] `chat-nailbot.test.tsx:357`, `:403`, `:419`, `:425`
- @s9: [x] `chat-nailbot.test.tsx:441-476`
- @s10: [x] `chat-nailbot.test.tsx:478-533`
- @s11: [x] `chat-nailbot-logica.test.ts:140-243`
- @s12: [x] `chat-nailbot.test.tsx:535-635`, incluida la nueva guarda de compatibilidad de `:609-613`
- @s13: [x] `chat-nailbot-estilos.test.ts:51-126`
- @s14: [x] `nailbot-arte.test.tsx:12-67`
- Enmienda de `reserva_chat.feature`:
  - @s7: `reserva.test.tsx:228`, `:236`
  - @s8: RETIRADO en `:286`
  - @s9: `:290`
  - @s12: RETIRADO en `:342`
  - @s13: `:359`
  - @s23: `:631`
  - @s24: `:640`
  - Todo verde en la corrida acotada.

Ningún `@s` queda sin test: 14/14.

## Disciplina TDD

- **¿Producción sin test que la pida?** NO. `sinSurrogatesSueltos` y el `return estado` de `chat-nailbot-logica.ts:180` están declarados en `progress/tdd_nailbot_chat_compartido.md:49-54` y tienen test. La nueva expresión la exigen los valores de `chat-nailbot-logica.test.ts:349-357`: un reemplazo sin `g` lo caza el `not.toThrow` de `:356`, y quitar la rama del par lo caza `:354`.
- **¿Evidencia de Rojo→Verde→Refactor?** NO para el código original. La desviación está DECLARADA (`progress/tdd_nailbot_chat_compartido.md:3-22`) y se aceptó como excepción en las rondas anteriores. No la reabro: no hay nada nuevo que la agrave. La cura de B-N1 trae su guarda.

## Calidad

**Menores del delta anterior que ya están RESUELTOS:**

- U+FFFD escrito como escape `'�'` (`chat-nailbot-logica.ts:155`).
- La cabecera del `.feature` ya remite a `puerta_humana` (`features/nailbot_chat_compartido.feature:7-9`).
- `progress/current.md:23-24` ya no atribuye el TDD a un `tdd_craftsman`.
- Los informes que se citaban ahora están en disco y en git: `judge_nailbot_chat_compartido.md`, `a11y_nailbot.md`, `a11y_nailbot_delta.md` y `security_nailbot.md`.
- La mutación ya sigue la convención de nombre: `mutation_nailbot_chat_compartido.md` y `mutation_nailbot_flotante.md`.

**Menores que SIGUEN ABIERTOS** (no bloquean):

1. `ChatNailbot.tsx:158`: el cast `estado.respuestas as SolicitudReserva`. Un tipo discriminado para el paso `hecho` haría explícita la invariante.
2. `chat-nailbot-logica.ts:111-136`: `elegir` fuera de su paso (`nombre` o `hecho`) deja `paso: undefined` (casts en `:112` y `:134`). Choca con el `return estado` de `:180`. Registrarlo como deuda de la costura o morderlo con un test.
3. `chat-nailbot-logica.ts:196-214`: el ayudante de DOM vive en el módulo puro. `SELECTOR_CONTROLES` (`:202`) solo se exporta para `chat-nailbot-logica.test.ts:380`, que repite `:379`.
4. Líneas por encima de `printWidth: 100` (comentarios que Prettier no parte): `Reserva.tsx:13` (133 caracteres) y `chat-nailbot-logica.ts:58` (116).
5. El prefijo oculto «Nailbot:/Tú:» por burbuja (SC 1.3.1) solo consta en el diario (`tdd_nailbot_chat_compartido.md:64-65`). No está como deuda en `feature_list.json` ni en `project-spec.md`.
6. `tools/mutate.mjs:36-39`: el escapado de shell (barras invertidas, `%VAR%`, `$`) sigue igual. Con el uso documentado funciona.
7. La guarda `(?<` solo vigila `chat-nailbot-logica.ts`, pero el riesgo real es el bundle entero. Hoy no hay ningún lookbehind ni en `src/` de producción ni en `dist/`. Opcional: una guarda a nivel de bundle en la cadena de puertas del build. Nota: `(?<` también prohíbe los grupos con nombre; es más estricto de lo necesario, pero inocuo.
8. Dos casos del saneador solo los cubre el `not.toThrow` de `chat-nailbot-logica.test.ts:356`: un alto suelto EN MEDIO y un bajo suelto AL FINAL. No tienen aserción de valor exacto. Mi comprobación de comportamiento confirma que son correctos; la mutación dirá si hace falta más.
9. Trazabilidad:
   - `progress/tdd_nailbot_chat_compartido.md` no registra la ronda delta: ni la cura de B-N1 ni la guarda de `chat-nailbot.test.tsx:609-613`.
   - `progress/current.md:54-62` («PENDIENTE…») está en parte desfasado: `bin/harness init` ya está verde (1482/1482, medido en esta revisión) y el `dist/` es posterior a HEAD. Solo queda la re-medición de la mutación.
   - Hay que actualizar ambos antes de `done`.
10. Siguen pendientes en vivo, para el móvil del humano, los puntos de `progress/current.md:50-52`: lector de pantalla y 320 px con un nombre de 300 caracteres en #reserva.

## Checkpoints

- C1: [x] ficheros base · [x] docs · [x] `bin/harness init` exit 0 (esta revisión: 46/46 ficheros, 1482/1482 tests)
- C2: [x] una sola `in_progress` (F-23; F-24 en `spec_ready`) · [x] toda `done` con tests verdes (suite completa en verde) · [x] `current.md` describe la sesión (con la sección «PENDIENTE» en parte desfasada, menor 9)
- C3: [x] módulos previstos · [x] sin dependencias nuevas · [x] sin logs ni TODOs
- C4: [x] test por módulo · [x] aislamiento real · [x] `bin/harness test` con más de 0 tests y todos verdes
- C5: [x] sin ficheros sin trackear (`git status` vacío) · [ ] entrada en `progress/history.md` (la sesión sigue abierta; la escribe el lead al cerrar) · [x] F-23 en `in_progress`, coherente
- C6: [x] `.feature` + sección de spec · [x] escenarios `@s1..@s14` tagueados · [x] mapa `@s → test` (`tdd_nailbot_chat_compartido.md:24-41`) · [x] sin producción que ningún test pida
- C7: [ ] PENDIENTE del `mutation_tester`. La re-medición de cierre de `chat-nailbot-logica.ts` tras B-N1 (9 timeouts, a concurrencia 1) corre en paralelo y se anotará en `progress/mutation_nailbot_chat_compartido.md`. No la he ejecutado.

## Cambios requeridos

Ninguno bloqueante para esta puerta. Para pasar a `done` (responsabilidad del lead):

1. Que C7 cierre al 100 % sin timeouts en `progress/mutation_nailbot_chat_compartido.md`.
2. Actualizar la trazabilidad (menor 9): una entrada de la ronda delta en el diario y la sección «PENDIENTE» de `current.md`.
3. Deseables: los menores 1-8 y 10, como deuda registrada o como curas.
