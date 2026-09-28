<!-- Guardado por el craftsman_lead desde el registro del workflow wf_06bde63b-3ab (el revisor no tenía herramienta de escritura). Texto íntegro del informe del agente. -->

# Review DELTA: feature 23 `nailbot_chat_compartido`

**Veredicto:** CHANGES_REQUESTED (1 bloqueante, NUEVO, introducido por una corrección)

> Destino previsto: `progress/judge_nailbot_chat_compartido_delta.md`. El judge NO lo ha escrito: en esta ejecución no tiene herramienta de escritura y el operador prohíbe los ficheros de informe. Lo tiene que guardar el lead.

## Base de la revisión delta
- **La revisión anterior de F-23 NO está en disco.** `progress/judge_nailbot_chat_compartido.md`, `progress/a11y_nailbot.md` y `progress/security_nailbot.md` no existen ni en el árbol ni en el historial de git (`git log --all`). Solo existe `progress/judge_nailbot_flotante.md` (F-24).
- Por eso he reconstruido los bloqueantes de F-23 a partir del diario (`progress/tdd_nailbot_chat_compartido.md:59-65`) y, además, he hecho una revisión COMPLETA de los criterios del judge, para no depender solo de ese resumen.
- Qué he ejecutado:
  - `pnpm exec vitest run` sobre `chat-nailbot.test.tsx`, `chat-nailbot-logica.test.ts`, `chat-nailbot-estilos.test.ts`, `nailbot-arte.test.tsx` y `reserva.test.tsx`: **5/5 ficheros, 126/126 tests**.
  - `pnpm typecheck`: exit 0.
  - `pnpm lint`: exit 0.
  - `prettier --check` sobre los ficheros de F-23: limpio.
- Qué NO he ejecutado, por orden del lead: build, Stryker y la suite completa.

## Bloqueantes anteriores (según el diario), uno a uno
| # | Bloqueante | Estado | Evidencia |
|---|---|---|---|
| 1 | Una sola feature `in_progress` | RESUELTO | `feature_list.json`: in_progress=[23]; F-24 en `spec_ready` |
| 2 | Diario con mapa @s → test | RESUELTO | `tdd_nailbot_chat_compartido.md:24-41`, comprobado test a test (abajo). La desviación TDD está declarada en `:3-22` |
| 3 | Código no pedido: quitarlo o justificarlo | RESUELTO, pero la cura de seguridad trae B-N1 | Guarda `paso === 'dia'` quitada (`chat-nailbot-logica.ts:115-116`). `return estado` justificado y con test sin @s (`chat-nailbot-logica.test.ts:223-232`). `sinSurrogatesSueltos` justificado y con contraprueba (`:341-370`) |
| 4 | Test de la clase global en reserva_chat @s24 | RESUELTO | `reserva.test.tsx:641` comprueba el atributo `class` == `['demo-btn','demo-btn--wa']` (contrato `reserva_chat.feature:642`) |

Menores atendidos y verificados:
- Leyenda sobre el DOM del horneado: `chat-nailbot.test.tsx:90-103`.
- Foco que NO se mueve, con una prueba que muerde: `:425-438`.
- `form action`: `:579`.
- Opacidad de las bases: `nailbot-arte.test.tsx:52`.
- href solo al terminar: `ChatNailbot.tsx:150-158`.
- `enviarNombre`: `:67`.
- Sin copy en el componente.
- A-23 en el acceptance de F-16.
- `.claude/launch.json` ignorado (`.gitignore:54`, `git check-ignore` lo confirma).

## Cobertura de escenarios (@s ↔ test)
- @s1: [x] `chat-nailbot.test.tsx:63-133` (7 tests con renderToString de `<Reserva/>` y de `<ChatNailbot/>`)
- @s2: [x] `:136-155` (los 4 momentos)
- @s3: [x] `:157-226` (5 filas, incluida la de «Lo antes posible»)
- @s4: [x] `:228-250` y el canario `chat-nailbot-logica.test.ts:47-58`
- @s5: [x] `chat-nailbot-logica.test.ts:61-115` (4 rangos) y `fraseSabado`, anclada, en `:117-138`
- @s6: [x] `chat-nailbot.test.tsx:252-312` (2 filas) y el pie sin contenedores vacíos en `:314-325`
- @s7: [x] `:328-355`
- @s8: [x] `:357-439` (7 filas, más «al montar» y «nombre vacío»)
- @s9: [x] `:441-476`
- @s10: [x] `:478-533`
- @s11: [x] `chat-nailbot-logica.test.ts:140-243`
- @s12: [x] `chat-nailbot.test.tsx:535-629`
- @s13: [x] `chat-nailbot-estilos.test.ts:51-119` (pares comprobados contra MATRIZ_DE_USO)
- @s14: [x] `nailbot-arte.test.tsx:12-67`
- Enmienda de reserva_chat:
  - @s7: `reserva.test.tsx:228` y `:236`
  - @s8: RETIRADO en `:286`
  - @s9: `:297`
  - @s12: RETIRADO en `:342`
  - @s13: `:359`
  - @s23: fila nueva en `:631`
  - @s24: `:641`
  - Las del banner (`reserva_chat.feature:26-37`) casan con la fuente.

## Disciplina TDD
- **¿Hay producción que ningún test pida?** NO. Las dos piezas que ningún escenario pide (`return estado` y `sinSurrogatesSueltos`) están declaradas en el diario y cubiertas por tests. El CSS extra (`overflow-wrap`, `min-width: 0`, `::placeholder`) no es mutable por declaración, y el par `--muted`/`--bg` existe en MATRIZ_DE_USO (`puerta-contraste.ts:209`).
- **¿Hay evidencia de Rojo → Verde → Refactor?** NO. El código lo escribió el lead antes que los tests. Está declarado por escrito y lo compensan la revisión independiente y la mutación. Lo acepto como excepción declarada, con el mismo criterio que aplicó el judge de F-24.

## Calidad
- **B-N1 (BLOQUEANTE, nuevo): el lookbehind rompe el envío con nombre en Safari/iOS anterior a 16.4.**
  - Dónde: `chat-nailbot-logica.ts:153-156`.
  - Qué hace el build: Vite 7 construye por defecto para `baseline-widely-available` (safari16), y esbuild convierte el literal en `new RegExp("…(?<!…)…","g")`. Lo he comprobado en `dist/assets/app-C99heFfv.js`, y es el único lookbehind de todo el bundle.
  - Qué pasa en esos navegadores: la llamada lanza `SyntaxError` en cada `conNombre` (`:187`), es decir, en cualquier «Enviar» o Enter con nombre. El error salta dentro del actualizador de `setEstado` (`ChatNailbot.tsx:64`) y no hay error boundary, así que React 19 desmonta la raíz y la página queda en blanco.
  - Por qué es regresión: rompe el camino principal (@s6 fila 1 y reserva_chat @s15, @s16 y @s24), que antes de la corrección funcionaba.
- `ChatNailbot.tsx:158`: el cast `as SolicitudReserva` (ver menores).
- `chat-nailbot-logica.ts:111-135`: `elegir` fuera de su paso deja un estado mal formado.
- `chat-nailbot-logica.ts:155`: U+FFFD escrito como carácter crudo.
- `chat-nailbot-logica.ts:196-214`: ayudante de DOM dentro del módulo puro.
- Lo positivo:
  - `responder` es pura, con ramas explícitas, y su semántica está mordida por valor.
  - La costura está documentada con honestidad (`06-diseno-servidor-futuro.md` §1 coincide con el código).
  - Los ids salen de `useId`.
  - Todo el copy vive en `nailbot-demo.ts`.
  - No hay dependencias nuevas, ni `console`, ni TODO.
- Cambios fuera de la feature: sin objeciones.
  - `tools/puerta-*.ts:54-57` (y equivalentes): `process.exitCode` es correcto. El código de salida se sigue propagando por la cadena `&&` de `build`, `trampas-del-horneado.test.tsx:145-154` sigue leyendo `.status` y ningún test espía `process.exit`.
  - Tests `*-horneado`: `execSync` con una cadena equivale a lo anterior.
  - `stryker.config.json`: +5 ficheros en `mutate` y el comentario fusionado.
  - `vitest.setup.ts`: los dobles solo se instalan si faltan, y `close` ya es fiel al nativo.
  - `feature_list.json`: F-16 gana la deuda A-23 y F-24 vuelve a `spec_ready`.
  - Resto: `.gitignore` correcto. `Catalogo.tsx`, `PruebaColor.tsx` y los tests de equipo solo cambian de formato (comprobado con `git diff -w`).

## Checkpoints
- C1: [x] ficheros base · [x] docs · [x] `bin/harness init`
  - Pasos 1-4 verificados por el judge: ficheros base, `feature_list` válido con una sola `in_progress` y typecheck y lint a 0.
  - Paso 5, la suite completa: medición del lead, 46/46 ficheros y 1475/1475 tests. No la he re-ejecutado por orden del lead; en lo acotado, 126/126.
- C2: [x] una sola `in_progress` · [x] toda `done` con tests verdes (según la suite del lead) · [x] `current.md` describe la sesión (con el bloque desfasado de `:23-28`)
- C3: [x] módulos previstos · [x] sin dependencias nuevas · [x] sin logs ni TODOs
- C4: [x] un test por módulo · [x] aislamiento real · [x] `bin/harness test` en verde (lead)
- C5: [x] sin ficheros sin trackear sospechosos · [ ] entrada en `history.md` (la sesión sigue abierta) · [x] F-23 en `in_progress`
- C6: [x] `.feature` + sección de spec (`project-spec.md:2651`, `:3005`) · [x] escenarios tagueados · [x] mapa @s → test · [x] sin producción que ningún test pida
- C7: [ ] pendiente del mutation_tester. El informe del lead da 100 %, pero `chat-nailbot-logica.ts` hay que volver a medirlo tras curar B-N1.

## Cambios requeridos
1. **B-N1.** Quitar el lookbehind de `sinSurrogatesSueltos`: una sola expresión «par o surrogate suelto» con una función de reemplazo que conserve las coincidencias de longitud 2. Añadir una guarda de bytes con ancla positiva que prohíba `(?<` en `chat-nailbot-logica.ts` y volver a medir la mutación de ese fichero. Solo por decisión del humano cabe la alternativa: declarar `build.target` ≥ safari16.4 en `vite.config.ts` y documentarlo, asumiendo que así los Safari antiguos no llegan a parsear el bundle.
2. Antes de `done`, guardar en disco los informes citados que faltan (o corregir las referencias en el diario y en `current.md`), además de este delta.
3. Deseables: los menores de la lista.

## Menores (lista devuelta)

- Trazabilidad: `progress/tdd_nailbot_chat_compartido.md:18` y `progress/current.md:35` citan `progress/judge_nailbot_chat_compartido.md`, `progress/a11y_nailbot.md` y `progress/security_nailbot.md`. No existen ni en disco ni en git. Este delta se ha reconstruido a partir del resumen del diario (`:59-65`). Antes de pasar a `done`, hay que guardar esos informes o corregir las referencias, y guardar también este informe en `progress/judge_nailbot_chat_compartido_delta.md`. El judge no lo ha escrito: en esta ejecución no tiene herramienta de escritura y el operador prohíbe los ficheros de informe.
- `ChatNailbot.tsx:158`: el cast `estado.respuestas as SolicitudReserva` esconde en un comentario la invariante de `responder`. Un tipo discriminado para el paso `hecho` la haría explícita.
- `chat-nailbot-logica.ts:111-135`: `elegir` en los pasos `nombre` o `hecho` devuelve en silencio `paso: undefined` y una burbuja con `texto: undefined` (casts en `:112` y `:134`). Choca con el `return estado` de `:180` para entradas que no reconoce. Ningún escenario lo pide: conviene registrarlo como deuda de la costura o morderlo con un test.
- `chat-nailbot-logica.ts:155`: el U+FFFD está escrito como carácter crudo. Con `'�'` quedaría explícito y seguiría la lección del propio diario.
- `chat-nailbot-logica.ts:196-214`: el ayudante de foco del DOM vive en el módulo del cerebro puro (sigue el precedente de `desplazarAlFinal`). `SELECTOR_CONTROLES` solo se exporta para el test `chat-nailbot-logica.test.ts:380`, que repite lo que ya comprueba `:379`.
- `features/nailbot_chat_compartido.feature:7-8`: la cabecera sigue diciendo «PROPUESTA hasta la puerta humana… Sin entrada todavía en feature_list.json». Está desfasada: debe remitir a `puerta_humana` de F-23.
- `progress/current.md:23-28`: todavía atribuye el TDD a un `tdd_craftsman` y lista «escenarios a recorrer», lo que contradice la declaración del diario.
- `Reserva.tsx:13`: la línea de comentario tiene unos 135 caracteres (Prettier no parte comentarios).
- El prefijo oculto «Nailbot:/Tú:» por burbuja (SC 1.3.1), declarado como no atendido, solo consta en el diario (`:64-65`). Conviene registrarlo como deuda en `feature_list.json` o en la spec.
- Hay diffs de solo formato fuera de la feature: `Catalogo.tsx:46-49`, `PruebaColor.tsx:26-28`, `equipo.test.tsx`, `equipo-estilos.test.ts` y buena parte de `reserva.test.tsx`. Además, el árbol mezcla cambios de F-24, que está `spec_ready`. Mejor en commits separados para que el diff de F-23 se lea bien.
- `tools/mutate.mjs:36-38`: `JSON.stringify` sigue sin escapar bien para shell las rutas con barra invertida ni `%VAR%` (cmd) o `$` (sh). Con el uso documentado funciona.
- Siguen pendientes en vivo los puntos propios de F-23 de la lista del `.feature`: 320 px con un nombre de 300 caracteres en #reserva, contraste real del subtítulo, la leyenda y el aviso, foco visible en chips, campo y enlace, encuadre del avatar y lector de pantalla. `current.md` (2026-09-28) solo cubre el panel a 375 px.
- `progress/mutation_nailbot.md` no sigue la convención de nombre `mutation_<name>.md`. Después de B-N1 hay que volver a medir `chat-nailbot-logica.ts`.
