# Review: feature 24 `nailbot_flotante`

**Veredicto:** CHANGES_REQUESTED

Revisión de solo lectura hecha el 2026-09-28 contra `features/nailbot_flotante.feature` (15 escenarios), `project-spec.md` («Feature 24» y «Resolución del craftsman_lead a HS-8..HS-17») y el árbol de trabajo (`git diff HEAD`). Por orden del lead, **no** he ejecutado vitest, `pnpm test`, `pnpm build`, Stryker ni `bin/harness init` (este último lanza `pnpm test` completo), porque hay una mutación en curso. Solo he pasado ESLint a los 7 ficheros de F-24: exit 0 y sin avisos. También he medido una regla CSS en Chrome headless (ver B1).

## Cobertura de escenarios (@s ↔ test)
- @s1: [x] `nailbot-flotante.test.tsx:87` «la home horneada no trae…» y `:109` «NailbotFlotante a solas tampoco hornea nada»
- @s2: [x] `nailbot-flotante.test.tsx:115` (posición, `<h1>` e ids) y `:146` (sin section/nav/headings, antes y después de abrir). Además hay un apoyo de bytes en `nailbot-flotante-estilos.test.ts:330`
- @s3: [x] `nailbot-flotante.test.tsx:161`
- @s4: [x] `nailbot-flotante.test.tsx:198`, las dos filas
- @s5: [x] `nailbot-flotante.test.tsx:223`, `:238`, `:248` y `:269` (las 4 filas). Extras: `:260`, `:281`, `:292`
- @s6: [x] `nailbot-flotante-logica.test.ts:23-27` (5 filas del bocadillo), `:43-73` (7 de la animación) y `:101-105` (6 de las teclas)
- @s7: [x] `nailbot-flotante.test.tsx:322`, `:330`, `:341` y `:354` (4 filas)
- @s8: [x] `nailbot-flotante.test.tsx:392`, `:412` y `:424` (3 filas). Extra: `:403`
- @s9: [x] `nailbot-flotante.test.tsx:437`
- @s10: [x] `nailbot-flotante.test.tsx:510` y `:520`
- @s11: [x] `nailbot-flotante.test.tsx:541-567`, las 6 filas, con un escuchador REAL en `document`
- @s12: [x] **solo nominalmente.** Lo cubren `nailbot-flotante-estilos.test.ts:66-141`, pero el test de `:99-111` pasa aunque la pausa NO congela nada en un navegador real (B1). El «y la pausa CONGELA» del título no está mordido.
- @s13: [x] `nailbot-flotante-estilos.test.ts:145-239`
- @s14: [x] `nailbot-flotante-estilos.test.ts:243`, `:254` y `:263`
- @s15: [x] `nailbot-flotante-estilos.test.ts:272-345`

Ningún `@s` se queda sin test. Los tests cumplen las prohibiciones del contrato: no usan `toHaveClass`, no importan copy ni tiempos de producción como valor esperado, el `<dialog>` no se controla con `open={` y las aserciones negativas llevan su ancla positiva.

## Disciplina TDD
- **¿Producción sin test que la pida?** SÍ:
  - `NailbotFlotante.tsx:168-172`: el icono de la pausa cambia (triángulo o barras) según `pausaPulsada`, pero ningún test asevera el trazado ni el cambio (grep `10.4|M2 1.5|path` en los tres tests: 0 resultados). La pausa no cambia de etiqueta (APG, @s4), así que este icono es el único indicio visual del estado. Stryker convertirá el ternario en `true`/`false` y ambos mutantes sobrevivirán.
  - `NailbotFlotante.tsx:47`, `:93` y `:128`: las escrituras `descartado.current = true` están muertas. Esta ref solo se lee en `:78`, dentro del temporizador de un solo disparo de `:76-80`. Ese temporizador salta antes de que el bocadillo exista, y solo con el bocadillo visible se puede descartar (el escuchador de Esc está condicionado en `:87` y la × solo existe entonces). Por eso, cuando `:78` lee `descartado.current`, vale siempre `false`. Si se borran `:93` y `:128`, toda la suite sigue verde, y los dos mutantes `BooleanLiteral` serán equivalentes. «No vuelve en esa carga» lo garantiza que el temporizador salte una sola vez, no esta ref.
- **¿Hay evidencia de Rojo→Verde→Refactor?** NO. No existe `progress/tdd_nailbot_flotante.md`, ni bitácora ni mapa `@s → test`. El propio lead declara que el código lo escribió él antes que los tests: la vía rápida `302ddb4` ya incluía `NailbotFlotante.tsx`, y los tests se escribieron después, escenario a escenario, contra el contrato. Esto incumple la Ley 1 por construcción. Se puede aceptar como excepción declarada, pero tiene que quedar escrita (C6).

## Calidad
- **B1, bloqueante: la pausa no congela en un navegador real (regresión frente a `302ddb4`).**
  - En `nailbot-arte.module.scss:36-93`, cada regla animada tiene la forma `.arte[data-animacion] .x`, con especificidad (0,3,0), y usa el *shorthand* `animation:`. Ese shorthand repone `animation-play-state` a su valor inicial, `running`.
  - La regla de pausa `.arte[data-animacion='pausada'] *` (`:96-98`) solo llega a (0,2,0), así que pierde la cascada.
  - Lo he medido en Chrome headless con los mismos selectores: el estado calculado de `.flota` bajo `data-animacion="pausada"` es `animation-play-state=running`. Con los selectores de HEAD (`.arte[data-animado='si'] .flota` frente a `.arte[data-animado='si'][data-animacion='pausada'] *`, misma especificidad y la pausa después) sale `paused`. La reproducción está en el scratchpad de la sesión (`pausa.html`).
  - Consecuencias:
    - La pausa (SC 2.2.2, nivel A) no hace nada visible, aunque `aria-pressed="true"`.
    - Al retirar «reduce» en caliente, el robot **se mueve solo** mientras la pausa se anuncia pulsada, lo que contradice HS-8 (a) y L10.
  - El prototipo lo resolvía con `!important`, que HS-15 prohíbe portar.
  - El test de bytes de @s12 (`nailbot-flotante-estilos.test.ts:108-110`) solo comprueba que la declaración existe, por eso pasa en verde aunque no funcione.
- `NailbotFlotante.tsx:78`: `mostrarBocadillo(RETARDO_BOCADILLO_MS, …)` pasa la constante como si fuera el tiempo medido. En el componente, el primer argumento de la decisión pura nunca se mide y el tercero (`descartado`) siempre es `false`: la decisión pura queda cableada a medias. Es la raíz de la ref muerta.
- `NailbotFlotante.tsx:39-210`: el componente tiene unas 170 líneas, 4 efectos y 3 manejadores, y demasiados motivos para cambiar (preferencia de movimiento, bocadillo, sincronía del diálogo y render). Pide hooks propios, por ejemplo `usePreferenciaDeMovimiento`, `useBocadillo` y `useDialogoModal`. No es bloqueante.
- `NailbotFlotante.tsx:24-36`: el JSDoc del componente está colgado de `CONSULTA_MOVIMIENTO_REDUCIDO` (`:37`) y no de `NailbotFlotante` (`:39`). El IDE lo atribuye a la constante.
- `nailbot-flotante-logica.ts:41`: la rama `estado === null ||` de `pulsarPausa` no se puede alcanzar desde el componente, porque la pausa solo se monta con el estado ya leído. Solo la justifica un test ad hoc que no sale del contrato (`nailbot-flotante-logica.test.ts:75-77`, «defensa»). Sería mejor tipar la transición para que `pulsarPausa` exija un estado no nulo, o dejar la decisión anotada.
- Predicción para el mutation_tester: dos `OptionalChaining` probablemente equivalentes en `NailbotFlotante.tsx:64` y `:130` (`lanzador.current?.focus()`), porque la ref siempre está puesta cuando se ejecutan. Hay que matarlos o justificarlos en `progress/mutation_nailbot_flotante.md`.
- Tests con riesgo de vacuidad (menores):
  - `nailbot-flotante.test.tsx:139-141`: el bucle sobre `svg[viewBox="0 0 120 120"]` no tiene ancla de cantidad (≥ 2, el avatar de #reserva y el del lanzador). Si cambiara el `viewBox`, pasaría sin comprobar nada.
  - `:142-143`: la unicidad de ids solo se comprueba con el panel CERRADO, sin el segundo `ChatNailbot` montado, que es justo lo que más ids aporta al widget.
  - `:306-308`: no se comprueba que el id venga de `useId`. Un id literal fijo, como el `nailbot-bocadillo` de la vía rápida, pasaría.
  - `:292-297`: el test «sin matchMedia» no afirma su precondición (`typeof window.matchMedia` indefinido). Si el setup añadiera un doble de matchMedia, este test pasaría a cubrir la otra rama sin avisar.
  - `nailbot-flotante-estilos.test.ts:192-194`: «ningún @media redimensiona .pausa» solo detecta `.pausa` escrito dentro de un `@media`. Un `@media` anidado dentro de `.pausa { … }` (SCSS) pasaría.
  - `nailbot-flotante.test.tsx:238-279`: las filas 2-4 de @s5 no repiten la comprobación de `removeEventListener` con el mismo manejador. Es la misma ruta de código que la fila 1, así que lo acepto.
- `vitest.setup.ts:12-16`: el doble de `close` despacha `"close"` aunque el diálogo ya esté cerrado, y el nativo no lo hace. Esto podría ocultar un `close()` de más. El componente lo evita en `:111`, así que es menor.
- **Infraestructura DEP0190: sin cambio de comportamiento, aprobado.**
  - `contacto-horneado.test.ts:33`, `home-horneado.test.ts:27` y `trampas-del-horneado.test.tsx:136`: `execSync` usa por defecto el shell del sistema, igual que el anterior `shell: true`. Mantienen `stdio` y `cwd`, y siguen lanzando con `.status` al fallar.
  - `trampas-del-horneado.test.tsx:145`: `execFileSync('node', …)` sin shell es equivalente (`node.exe` se resuelve sin shell) y además aguanta espacios en la ruta.
  - `tools/mutate.mjs`: el cambio de punto y coma es solo formato (`.prettierrc` `semi: false`). En el uso documentado (sin argumento, o con una ruta con `/`) el comando es idéntico. Menor: `JSON.stringify` (`:39`) no escapa bien para shell. En cmd.exe dobla las barras invertidas de una ruta Windows y deja expandir las variables de entorno; en sh deja expandir el dólar y las comillas invertidas.
- Arquitectura: sigue el patrón del repo (componente + `-logica.ts` pura + `.module.scss` + tests junto al código + copy en `src/lib/demo/nailbot-demo.ts`). No añade dependencias (`package.json` sin cambios) ni hay `console.*` o TODO sueltos. `docs/architecture.md` sigue siendo plantilla, sin capas propias contra las que medir.
- Nota para el a11y_seo_auditor: el lanzador vive fuera de todo landmark, a propósito (L14), así que la regla *best-practice* `region` de axe lo marcará. Conviene dejarlo justificado.

## Checkpoints
- C1: [x] ficheros base · [x] docs · [ ] `bin/harness init` exit 0 (NO ejecutado: lanza `pnpm test` completo, prohibido durante la mutación; sin verificar)
- C2: [ ] como mucho una `in_progress`: F-23 **y** F-24 lo están a la vez (`harness.config.json` `one_feature_at_a_time: true`), y la cabecera del propio `.feature` dice «su TDD NO empieza hasta que F-23 esté `done`» · [ ] toda `done` con tests verdes (sin verificar esta sesión) · [x] `current.md` describe la sesión activa (aunque cita `progress/tdd_nailbot_chat_compartido.md`, que no existe)
- C3: [x] módulos previstos · [x] sin dependencias nuevas · [x] sin logs ni TODOs
- C4: [x] al menos un test por módulo · [x] aislamiento real (relojes falsos, dobles de `matchMedia` y `<dialog>`, bytes) · [ ] `bin/harness test` completo en verde (sin verificar: el lead solo reporta subconjuntos)
- C5: [ ] `.claude/launch.json` sin trackear (decidir si se versiona o se ignora) · [ ] entrada en `history.md` (sesión aún abierta) · [x] F-24 en `in_progress`, estado correcto
- C6: [x] `.feature` + sección en spec · [x] Gherkin tagueado con `Then` medibles · [ ] mapa `@s → test` en `progress/tdd_nailbot_flotante.md` (no existe) · [ ] sin producción que ningún test pida (`NailbotFlotante.tsx:168-172`, `:93`, `:128`)
- C7: [ ] pendiente (mutation_tester)

## Cambios requeridos
1. **B1, la pausa.** Arreglar la cascada de `nailbot-arte.module.scss:96-98` para que `data-animacion='pausada'` gane a las reglas animadas de `:36-93`. Opciones, a elegir sin `!important` (HS-15):
   - una especificidad ≥ (0,3,0), declarada después;
   - longhands en lugar del shorthand `animation:`;
   - `animation-play-state` dentro de cada regla animada.

   Además, añadir un test de bytes a @s12 que habría fallado con el fichero actual. Por ejemplo: la regla de pausa tiene al menos tantas clases y atributos como cada selector animado y va después de ellos. Verificarlo EN VIVO: la pausa congela, y al retirar «reduce» el robot sigue quieto.
2. **Icono de la pausa** (`NailbotFlotante.tsx:168-172`). Poner un test que muerda el cambio de icono con `aria-pressed` (y proponer al lead que lo añada a @s4), o quitar el ternario.
3. **Ref `descartado` muerta** (`NailbotFlotante.tsx:47/:78/:93/:128`). Dos salidas:
   - quitarla;
   - o, mejor, derivar la visibilidad del bocadillo de `mostrarBocadillo(…)` con estado vivo (un «listo» que pone el temporizador + abierto alguna vez + descartado), de modo que la decisión pura de @s6 sea la única fuente y cada entrada importe.
4. **Escribir `progress/tdd_nailbot_flotante.md`** con el mapa `@s → test` de arriba y la declaración honesta de la vía rápida (sin ciclos R-V-R), cerrando C6.
5. **Resolver C2.** Secuenciar (F-24 no pasa a `done` antes que F-23) y dejar la excepción de las dos `in_progress` registrada en `feature_list.json` y `progress/current.md`.
6. **Antes de volver a revisión**, con la mutación ya terminada: `bin/harness init` en verde, suite completa incluida. No se aprueba sin eso.
7. Deseable, no bloqueante: los menores de «Calidad» (anclas de cantidad y `useId` en `@s2`/`@s7`, precondición de «sin matchMedia», la comprobación de `@media` anidado en `.pausa`, JSDoc mal colgado, partir el componente en hooks, fidelidad del doble de `close`, escapado de `tools/mutate.mjs`).
