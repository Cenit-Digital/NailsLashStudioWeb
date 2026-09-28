# Review: feature 24 `nailbot_flotante` (delta de CIERRE, HEAD 3c171ff)

**Veredicto:** APPROVED

El único cambio requerido del delta anterior (el test de bytes del `pointer-events` del contenedor) está RESUELTO y MUERDE. También se han atendido tres de los cuatro deseables: la guarda de `animation-play-state`, el ancla de `forced-colors` y la nota en `current.md`. El cuarto, persistir los informes, está resuelto también. No hay bloqueantes nuevos.

## Base de la revisión

- **Qué revisé:** el código publicado en `HEAD` (3c171ff), con el árbol limpio. Lo comparé con `progress/judge_nailbot_flotante_delta.md`.
- **La producción TS de F-24 no ha cambiado desde el delta.** Las citas coinciden línea a línea:
  - `NailbotFlotante.tsx:43-54`, `:109`, `:136`, `:141` y `:180-184`;
  - `nailbot-flotante-logica.ts:43-45`, `:51` y `:61`.
  - Esta ronda solo tocó SCSS, tests y documentación.
- **Qué ejecuté:**
  - `bin/harness init` (UNA vez): **exit 0**, lint OK, **46/46 ficheros y 1482/1482 tests**, sin re-ejecuciones por tiempo, con Stryker corriendo en paralelo.
  - Corrida acotada `pnpm exec vitest run src/components/chat-nailbot src/components/nailbot src/components/reserva`: **8/8 ficheros, 216/216**. Incluye `nailbot-flotante.test.tsx`, `nailbot-flotante-logica.test.ts`, `nailbot-flotante-estilos.test.ts` y `nailbot-arte.test.tsx`.
  - `prettier --check`: limpio.
- **Evidencia reproducible** en el scratchpad de la sesión (`.../scratchpad/judge/`): `muerde.mjs`, `deseables.mjs` y las copias `*.scss`. **No he modificado ningún fichero real del repo** salvo este informe.

## Cambio requerido del delta: test de `pointer-events` (RESUELTO)

- **Producción:** `src/components/nailbot-flotante.module.scss:18-23`, es decir, `.flotante { pointer-events: none; > * { pointer-events: auto; } }`.
- **Test:** `src/components/nailbot-flotante-estilos.test.ts:188-196`, dentro del bloque @s13.
  - Ancla positiva en `:194`: el cuerpo de `.flotante` declara `pointer-events: none;`.
  - En `:192` y `:195`, el bloque `> * {` ANIDADO dentro de `.flotante` devuelve `pointer-events: auto;`.
  - El comentario de `:189-190` explica por qué jsdom no lo ve.
- **Muerde.** Extraje `cuerpoDelBloque` LITERAL del test (`:20-46`), ejecuté las aserciones de `:191-195` sobre copias de la hoja y compilé cada copia con sass para confirmar que la regresión es real:

| Copia de la hoja                                         | ¿Pasa el test? | ¿El CSS compilado tiene `.flotante>*{pointer-events:auto}`? |
| -------------------------------------------------------- | -------------- | ----------------------------------------------------------- |
| original                                                 | PASA           | sí                                                          |
| A: la regla `> *` borrada                                | **FALLA**      | no (regresión real)                                         |
| B: `> *` des-anidada a la raíz                           | **FALLA**      | no (y sass avisa de `bogus-combinators`)                    |
| C: `pointer-events: auto` aplanado dentro de `.flotante` | **FALLA**      | no                                                          |
| D: sin el `pointer-events: none`                         | **FALLA**      | sí (el ancla positiva lo caza)                              |
| E: los hijos a `none`                                    | **FALLA**      | no                                                          |
| F: el `auto` movido solo a `.lanzador`                   | **FALLA**      | no (la pausa y el bocadillo quedarían sin clics)            |

## Deseables del delta

| Deseable                                                    | Estado   | Evidencia                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `animation-play-state` UNA sola vez y en la regla `pausada` | RESUELTO | `nailbot-flotante-estilos.test.ts:132-137`: exactamente 1 regla con play-state, que es la de `[data-animacion='pausada']`, y su selector acaba en `*`. La única declaración está en `nailbot-arte.module.scss:139-141`. **Muerde:** falla con un `animation-play-state: running` inyectado en una regla animada (la variante que señalé en el delta), falla sin el `*` descendiente y falla con una segunda declaración (`scratchpad/judge/deseables.mjs`). |
| Ancla de `@media (forced-colors: active)`                   | RESUELTO | `nailbot-flotante-estilos.test.ts:213-218` exige el borde del `.lanzador` (`ButtonText`) y el del `.dialogo` (`CanvasText`), frente a `nailbot-flotante.module.scss:217-225`. **Muerde:** falla si se borra el bloque o el borde del lanzador.                                                                                                                                                                                                              |
| Nota en `progress/current.md` sobre F-24 en `spec_ready`    | RESUELTO | `progress/current.md:61-62`.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Persistir los informes citados                              | RESUELTO | `judge_nailbot_chat_compartido.md`, `a11y_nailbot.md`, `a11y_nailbot_delta.md`, `security_nailbot.md`, `mutation_nailbot_chat_compartido.md` y `mutation_nailbot_flotante.md` están en git.                                                                                                                                                                                                                                                                 |

## Cobertura de escenarios (@s ↔ test)

- @s1: [x] `nailbot-flotante.test.tsx:87`, `:109`
- @s2: [x] `nailbot-flotante.test.tsx:115`, `:151`
- @s3: [x] `nailbot-flotante.test.tsx:166`
- @s4: [x] `nailbot-flotante.test.tsx:203` (2 filas + icono + sin persistencia)
- @s5: [x] `nailbot-flotante.test.tsx:235`, `:250`, `:260`, `:281` (4 filas). Extras: `:272`, `:293`
- @s6: [x] `nailbot-flotante-logica.test.ts:16-117`
- @s7: [x] `nailbot-flotante.test.tsx:335`, `:343`, `:354`, `:367`
- @s8: [x] `nailbot-flotante.test.tsx:405`, `:425`, `:463`. Extras: `:416`, `:437`, `:449`
- @s9: [x] `nailbot-flotante.test.tsx:476`
- @s10: [x] `nailbot-flotante.test.tsx:549`, `:559`
- @s11: [x] `nailbot-flotante.test.tsx:581`
- @s12: [x] `nailbot-flotante-estilos.test.ts:62-151`, incluida la cascada de la pausa (`:127-138`)
- @s13: [x] `nailbot-flotante-estilos.test.ts:153-288`, incluidos `pointer-events` (`:188`), el foco (`:198`) y `forced-colors` (`:213`)
- @s14: [x] `nailbot-flotante-estilos.test.ts:290-317`
- @s15: [x] `nailbot-flotante-estilos.test.ts:319-400`

Ningún `@s` queda sin test: 15/15.

## Disciplina TDD

- **¿Producción sin test que la pida?** NO en lo que bloqueaba. El `pointer-events` (`module.scss:18-23`), los anillos de foco (`:51-70`) y `forced-colors` (`:216-225`) ya tienen test (`estilos.test.ts:188`, `:198` y `:213`). Queda un resto menor sin guarda: el `.titulo` en el flujo (menor 1). Es CSS de maquetación, no decide si el widget recibe interacción, y aplico el mismo criterio que con los anillos de foco en el delta.
- **¿Evidencia de Rojo→Verde→Refactor?** NO para el código original: es la vía rápida declarada en `progress/tdd_nailbot_flotante.md:3-12` y aceptada como excepción en las rondas anteriores. No la reabro. Las curas de esta ronda traen su test.

## Calidad

**Menores que SIGUEN ABIERTOS** (no bloquean):

1. `nailbot-flotante.module.scss:155-163`: el `.titulo` pasa al flujo con `margin-right: 3rem` para no montarse sobre «Cerrar el chat». Es la cura del IMPORTANTE-2 de `progress/a11y_nailbot_delta.md:190` y no tiene guarda de bytes. Volver a `position: absolute` o quitar el margen no rompe ningún test: `grep titulo` en `nailbot-flotante-estilos.test.ts` da 0 resultados. Conviene un ancla: el `.titulo` sin `position: absolute` y con margen derecho de al menos 36px + 12px.
2. El test de `pointer-events` es más estricto que la semántica. Una reescritura EQUIVALENTE a una regla de raíz `.flotante > * { pointer-events: auto }` lo hace fallar (copia G: el CSS compilado es correcto y aun así el test falla). Es un falso positivo del lado seguro, aceptable. Si alguien hace ese refactor, que ajuste el test en vez de revertir la hoja.
3. `nailbot-flotante-estilos.test.ts:235-243`: un `@media` ANIDADO dentro de `.pausa { … }` sigue sin verse.
4. Partir `NailbotFlotante.tsx` en hooks. Además, el nombre `msDesdeElMontaje` (`:43`) promete una medida y en la práctica es un «tiempo cumplido».
5. `nailbot-flotante-logica.ts:51` y `:61`: ramas inalcanzables según los tipos. Sería más limpio un `switch` exhaustivo con comprobación `never`.
6. `tools/puerta-*.ts`: el mismo comentario duplicado en 5 ficheros. `tools/mutate.mjs:36-39`: el escapado para shell.
7. Trazabilidad:
   - `progress/tdd_nailbot_flotante.md:54-56` da por atendidos `pointer-events` y `forced-colors` sin citar sus tests nuevos (`estilos.test.ts:188-196`, `:213-218`), ni la guarda de play-state (`:132-137`).
   - `progress/current.md:54-62` («PENDIENTE…») está en parte desfasado: `init` ya está verde (1482/1482) y el `dist/` es posterior a HEAD.
8. Lo exige el acceptance de F-24 en `feature_list.json` («Verificación en vivo: … móvil 320 px, reduced-motion en frío y en caliente») y NO es una puerta del judge: `progress/current.md:46` midió 375×812, y `:50-52` declara sin verificar el `prefers-reduced-motion` del sistema y el lector de pantalla. El lead tiene que cerrarlo, o registrarlo explícitamente como pendiente del móvil real, antes de `done`.

## Checkpoints

- C1: [x] ficheros base · [x] docs · [x] `bin/harness init` exit 0 (esta revisión: 46/46 ficheros, 1482/1482 tests)
- C2: [x] una sola `in_progress` (F-23) · [x] toda `done` con tests verdes · [x] `current.md` describe la sesión y anota F-24 en `spec_ready` (`:61-62`)
- C3: [x] módulos previstos · [x] sin dependencias nuevas · [x] sin logs ni TODOs
- C4: [x] test por módulo · [x] aislamiento real (relojes falsos, dobles de `matchMedia` y `<dialog>`, bytes) · [x] suite verde
- C5: [x] sin ficheros sin trackear · [ ] entrada en `progress/history.md` (la sesión sigue abierta) · [x] F-24 en `spec_ready`, coherente con `one_feature_at_a_time`
- C6: [x] `.feature` + spec · [x] escenarios `@s1..@s15` tagueados · [x] mapa `@s → test` (`tdd_nailbot_flotante.md:23-41`) · [x] sin producción bloqueante sin test (el `.titulo` queda como menor 1)
- C7: [x] `NailbotFlotante.tsx` y `nailbot-flotante-logica.ts` al 100 % sin timeouts (`progress/mutation_nailbot_chat_compartido.md` #3/#4, resumido en `progress/mutation_nailbot_flotante.md`). Su TS no ha cambiado desde esa medición. La re-medición de cierre conjunta la hace el `mutation_tester` en paralelo y se anotará en `progress/mutation_nailbot_chat_compartido.md`; no la he ejecutado.

## Cambios requeridos

Ninguno bloqueante. Para pasar a `done`, que va después de F-23 por `one_feature_at_a_time`:

1. Que C7 quede confirmado en la re-medición conjunta.
2. Cerrar o registrar la verificación en vivo del acceptance (menor 8).
3. Deseables: la guarda del `.titulo` (menor 1) y la trazabilidad (menor 7).
