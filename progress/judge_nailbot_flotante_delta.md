# Review delta: feature 24 `nailbot_flotante`

**Veredicto:** CHANGES_REQUESTED

Revisión delta de solo lectura (2026-09-28) contra `progress/judge_nailbot_flotante.md`.

Qué he hecho:
- NO he lanzado `pnpm build`, Stryker ni la suite completa (orden del lead). `bin/harness init` 46/46 y 1475/1475 es medición del lead.
- Tests acotados: `pnpm exec vitest run` sobre `nailbot-flotante.test.tsx`, `nailbot-flotante-logica.test.ts`, `nailbot-flotante-estilos.test.ts` y `nailbot-arte.test.tsx`. Resultado: 4 ficheros, **90/90 en verde**.
- ESLint sobre los 7 ficheros de F-24, `vitest.setup.ts`, `tools/mutate.mjs` y las 5 `tools/puerta-*.ts`: exit 0.
- Cascada medida en Chrome headless con la hoja REAL compilada por sass. Los ficheros están en el scratchpad de la sesión (`pausa_delta.html`, `tiempo.html`) y no hay nada escrito en el repo.

**Aviso de proceso:** la tarea cita `progress/judge_nailbot_chat_compartido.md` y `progress/a11y_nailbot.md`, pero **no existen en disco**. El único informe previo verificable hallazgo a hallazgo es `progress/judge_nailbot_flotante.md`. El bloqueante a11y coincide con B1, según `progress/current.md` y `progress/tdd_nailbot_flotante.md:14-21`, y B1 lo he verificado. Los menores a11y no son verificables contra su informe.

## Cierre de los cambios requeridos anteriores

1. **B1, la pausa no congelaba: RESUELTO y verificado EN VIVO.**
   - `nailbot-arte.module.scss:36-132`: las 13 reglas animadas usan longhands (`animation-name`, `-duration`, `-timing-function`, `-iteration-count`). Ninguna declara `animation-play-state`, así que la única declaración de esa propiedad es la de la pausa (`:139-141`) y gana sin depender de la especificidad. No usa `!important` (HS-15 respetado).
   - Chrome headless, estilo calculado y `Animation.playState`:
     - con `data-animacion="activa"`, las 13 piezas en `running`;
     - con `"pausada"`, las 13 en `paused`;
     - sin atributo (avatar del chat), `animation-name: none`.
   - En tiempo real, pausada en caliente: el `currentTime` de `.flota` y `.manoPincel` se queda en 400 ms y el `transform` del pincel es idéntico durante 900 ms, mientras una animación de control avanza de 483 a 1383 ms. Al reanudar vuelve a `running` y sigue desde 400 ms (700 ms a los 300 ms): congela y reanuda desde ese fotograma (G4, HS-8 b).
   - «Retirar reduce deja el robot quieto»: con longhands, el bloque `no-preference` entra con `data-animacion="pausada"`, y la animación nace pausada en su fotograma 0. El contrato acepta esa consecuencia (`features/nailbot_flotante.feature:436-438`).
   - Test de bytes que muerde: `nailbot-flotante-estilos.test.ts:127-134` prohíbe el shorthand en toda la hoja del arte. He comprobado que **falla con la hoja anterior** (la de `HEAD`) y pasa con la actual. Además, `:113-125` exige que las 13 reglas tengan `animation-name` con duración e `infinite` en longhand.
2. **Icono de la pausa sin test: RESUELTO.** `nailbot-flotante.test.tsx:218-224` asevera el trazado exacto de los dos estados en las dos filas de @s4. El ternario de `NailbotFlotante.tsx:180-184` ya queda exigido.
3. **Ref `descartado` muerta: RESUELTO**, con el estado derivado que se pedía.
   - `NailbotFlotante.tsx:43-54`: el bocadillo es `mostrarBocadillo(msDesdeElMontaje, abiertoAlgunaVez, descartado)` y las tres entradas son estado vivo de React.
   - Cada entrada es observable:
     - quitar `setDescartado(true)` (`:109`, `:141`) rompe @s8 (×, Esc ajeno y Esc sobre la ×);
     - quitar `setAbiertoAlgunaVez(true)` (`:136`) rompe @s7, fila «panel abierto a los 2 000 ms» (`test.tsx:354-365`), @s8 «abrir el panel lo cierra» (`:463-472`) y @s9 (el chat no se montaría);
     - quitar el temporizador (`:84-96`) rompe @s7.
   - El Esc previo a verse no descarta por adelantado (`test.tsx:343-352`), porque el escuchador solo existe con el bocadillo visible (`:98-115`).
   - La limpieza del temporizador tiene test que exige cancelar el MISMO id (`test.tsx:449-461`).
   - Sin escrituras muertas ni ramas inalcanzables en el componente.
4. **Diario con mapa `@s → test`: RESUELTO.** `progress/tdd_nailbot_flotante.md:23-41`, con la declaración honesta de la vía rápida (`:3-12`). La desviación de la Ley 1 queda **declarada**, no subsanada; la compensan la revisión independiente y la mutación al 100 %.
5. **C2: RESUELTO.** `feature_list.json` tiene solo F-23 en `in_progress` y F-24 en `spec_ready` hasta cerrar F-23. Lo registra `progress/tdd_nailbot_chat_compartido.md:59-60`.
6. **`bin/harness init` en verde con la suite completa: según la medición del lead** (46/46 ficheros, 1475/1475, en `progress/current.md:38`). No lo he re-ejecutado por orden expresa; los 4 ficheros de F-24 los he corrido yo: 90/90.
7. **Menores anteriores:**
   - Resueltos:
     - anclas de cantidad e ids únicos con el panel ABIERTO (`test.tsx:139-148`);
     - ids solo de `useId`, por bytes (`estilos.test.ts:321-325`);
     - precondición de «sin matchMedia» (`test.tsx:305`);
     - JSDoc colgado de `NailbotFlotante` (`tsx:28-41`);
     - doble de `close` fiel al nativo (`vitest.setup.ts:12-20`);
     - `.claude/launch.json` ignorado (`.gitignore`).
   - Siguen abiertos, no bloquean: partir el componente en hooks; `@media` anidado dentro de `.pausa { … }` (`estilos.test.ts:199-207` sigue sin verlo); escapado de `tools/mutate.mjs`.

## Cobertura de escenarios (@s ↔ test)
- @s1: [x] `nailbot-flotante.test.tsx:87`, `:109`
- @s2: [x] `nailbot-flotante.test.tsx:115`, `:151`
- @s3: [x] `nailbot-flotante.test.tsx:166`
- @s4: [x] `nailbot-flotante.test.tsx:203` (2 filas + icono + sin persistencia)
- @s5: [x] `nailbot-flotante.test.tsx:235`, `:250`, `:260`, `:281` (4 filas). Extras: `:272`, `:293`, `:304`
- @s6: [x] `nailbot-flotante-logica.test.ts:16-30`, `:45-75`, `:102-117`
- @s7: [x] `nailbot-flotante.test.tsx:335`, `:343`, `:354`, `:367`
- @s8: [x] `nailbot-flotante.test.tsx:405`, `:425`, `:463`. Extras: `:416`, `:437`, `:449`
- @s9: [x] `nailbot-flotante.test.tsx:476`
- @s10: [x] `nailbot-flotante.test.tsx:549`, `:559`
- @s11: [x] `nailbot-flotante.test.tsx:581` (6 filas, escuchador real en `document`)
- @s12: [x] `nailbot-flotante-estilos.test.ts:66-146`. **Ahora sí muerde el «la pausa CONGELA»** (`:127-134`, comprobado contra la hoja anterior)
- @s13: [x] `nailbot-flotante-estilos.test.ts:150-251`
- @s14: [x] `nailbot-flotante-estilos.test.ts:255-280`
- @s15: [x] `nailbot-flotante-estilos.test.ts:284-363`

Ningún `@s` sin test.

## Disciplina TDD
- **¿Producción sin test que la pida?** SÍ, solo en CSS nuevo de la ronda a11y, y con una trampa:
  - `nailbot-flotante.module.scss:18-23`: `.flotante { pointer-events: none; > * { pointer-events: auto } }`. Ningún test lo exige (grep `pointer-events` en los tests de F-24: 0 resultados). Es CSS que decide si el widget recibe clics:
    - si alguien borra o des-anida la regla `> *`, el robot, la pausa, la × y el panel dejan de recibir clics y toques, y los 1475 tests, las 5 puertas y el typecheck siguen en verde (`fireEvent.click` de jsdom ignora `pointer-events`);
    - el repo ya vigila por bytes esta misma familia (`galeria-estilos.test.ts:302`, `resenas-estilos.test.ts:296`);
    - el propio lead sí añadió test de bytes a la otra cura de esta ronda (`box-sizing`, `estilos.test.ts:150-155`), pero no a esta.
  - También sin test, aunque menos peligrosos: `:51-70` (anillos `:focus-visible` propios; `outline: none/0` ya está prohibido en `estilos.test.ts:220-237`) y `:217-222` (`forced-colors`).
- **¿Evidencia de Rojo→Verde→Refactor?** NO para el código original: la vía rápida está declarada en `progress/tdd_nailbot_flotante.md:3-12` y es una excepción aceptada y registrada. Las curas de esta ronda sí traen su test (icono, cascada, temporizador, `box-sizing`, `enfocar`/`focoDentro`), salvo el CSS de arriba.

## Calidad
- `NailbotFlotante.tsx:43` y `:87`: `msDesdeElMontaje` solo toma los valores 0 y `RETARDO_BOCADILLO_MS`. El nombre promete una medida y en la práctica es un «tiempo cumplido». Lo impone la firma de @s6 (filas 3 999/4 000/60 000 ms), así que es coherente con el contrato. Menor de nombre, no bloquea.
- `nailbot-flotante-logica.ts:51` y `:61`: el `if` explícito sobre `"preferencia"` y el `return estado` final son inalcanzables según los tipos (tras los dos `if`, `evento` es `never`). Solo los pide un test que fuerza un tipo imposible con un cast (`logica.test.ts:81-88`), es decir, código con la forma que pide Stryker. Sería más limpio un `switch` exhaustivo con comprobación `never`. Menor.
- `nailbot-flotante-logica.ts:43-45`: la rama `estado === null` de `pulsarPausa` la exige el tipo (`EstadoAnimacion | null`); queda justificada. Cerrado.
- `nailbot-flotante-estilos.test.ts:127-134`: la guarda de la cascada no ve una variante de la misma regresión, un `animation-play-state: running` explícito en una regla animada (0,3,0), que volvería a ganar a la pausa (0,2,0). Lo he comprobado inyectándolo en una copia: la guarda pasa. Hoy hay exactamente UNA declaración de `animation-play-state` en la hoja; bastaría con exigir que sea la única y que esté en la regla `pausada`. Menor.
- Arquitectura y dependencias: sin cambios de patrón (componente + `-logica.ts` pura + `.module.scss` + copy en `nailbot-demo.ts`), sin dependencias nuevas, sin `console.*` ni TODO.
- **Cambios fuera de la feature:**
  - `tools/puerta-*.ts` (`process.exitCode` en lugar de `process.exit`, en la última sentencia): correcto. No queda ningún `process.exit` temprano en las 5 puertas (grep), y `trampas-del-horneado.test.tsx:145` sigue leyendo el `.status` real. Menor: el mismo comentario de 3 líneas está duplicado en 5 ficheros.
  - `*-horneado.test.ts` y `trampas-del-horneado.test.tsx:136`: `execSync` con una sola cadena equivale al anterior `shell: true`, y el `.status` sigue capturado. Aprobado.
  - `tools/mutate.mjs:33-41`: los tokens seguros van sin comillas y el resto con `JSON.stringify`. Menor, arrastrado y algo peor que antes: una ruta con barras invertidas de Windows sale con cada barra doblada, y antes de este cambio pasaba tal cual. El uso documentado, con `/`, no se ve afectado.
  - `stryker.config.json`: los 5 ficheros nuevos van en `mutate` y el comentario desconocido se funde en `_comment`. Correcto.
  - `vitest.setup.ts`: dobles protegidos y fieles. Correcto.
  - `feature_list.json`: la aceptación de F-16 (capa 1 del aviso) queda bien anotada como deuda. F-24 está en `spec_ready` con código, tests y mutación hechos. Es aceptable como secuenciación, pero conviene decirlo también en `progress/current.md`, que no lo menciona.
  - `_base.scss`: el paso de rem a px de `--nailbot-lanzador` lo exige @s14 («valor en px»). Correcto.

## Checkpoints
- C1: [x] ficheros base · [x] docs · [x] `bin/harness init` exit 0 según la medición del lead (no re-ejecutado por orden; los 4 ficheros de F-24 dan 90/90 y ESLint exit 0)
- C2: [x] una sola `in_progress` (F-23) · [x] las `done` con tests verdes (suite completa del lead: 1475/1475) · [x] `current.md` describe la sesión (falta la nota de F-24 en `spec_ready`, menor)
- C3: [x] módulos previstos · [x] sin dependencias nuevas · [x] sin logs ni TODOs
- C4: [x] test por módulo · [x] aislamiento real (relojes falsos, dobles de `matchMedia` y `<dialog>`, bytes, espías) · [x] suite completa verde según el lead
- C5: [x] `.claude/launch.json` ignorado · [ ] entrada en `history.md` (sesión abierta) · [x] estado de F-24 coherente con `one_feature_at_a_time` y declarado
- C6: [x] `.feature` + spec · [x] Gherkin tagueado · [x] mapa `@s → test` en `progress/tdd_nailbot_flotante.md` · [ ] sin producción que ningún test pida (`nailbot-flotante.module.scss:18-23`)
- C7: [x] 100 % en los 7 ficheros, timeouts re-medidos a concurrencia 1, equivalentes justificados con precedente (`progress/mutation_nailbot.md`). El SCSS queda fuera de la mutación, que es justo por lo que el punto de C6 importa.

## Cambios requeridos
1. **Test de bytes para el `pointer-events` del contenedor** (`nailbot-flotante.module.scss:18-23`), a añadir en `nailbot-flotante-estilos.test.ts`, bloque @s13. No hace falta tocar producción.
   - Ancla positiva: `.flotante` declara `pointer-events: none`.
   - Además, una regla hija directa de `.flotante` (el `> *` anidado) devuelve `pointer-events: auto`.
   - Modelo: `galeria-estilos.test.ts:302`.
   - Tiene que fallar si se borra o des-anida la regla `> *`.
2. Deseable en la misma pasada, no bloqueante:
   - exigir que `animation-play-state` se declare UNA sola vez en `nailbot-arte.module.scss` y en la regla `pausada`;
   - ancla de bytes de `@media (forced-colors: active)` con el borde del `.lanzador`;
   - anotar en `progress/current.md` que F-24 está implementada y revisada pero aparcada en `spec_ready` hasta cerrar F-23;
   - persistir en disco los informes de judge F-23 y a11y que la tarea da por existentes (regla anti-teléfono-descompuesto).

Con el punto 1 en verde (más `bin/harness init` completo), F-24 queda en condiciones de APPROVED sin otra ronda de diseño.
