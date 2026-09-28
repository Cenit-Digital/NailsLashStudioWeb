# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

## 2026-09-27 — Nailbot (F-23/F-24) · VÍA RÁPIDA publicada (HISTÓRICO: el pipeline se cerró el 2026-09-28, abajo)

Por petición explícita de Pablo («commit and push, que me voy en 20 mins»), se publicó una primera
versión funcional ANTES de cerrar el pipeline SDD. **No está `done`.**

- Hecho y verificado: `ChatNailbot.tsx` (chat de #reserva extraído SIN cambiar DOM ni textos → el
  contrato `reserva_chat.feature` sigue verde), `NailbotArte.tsx` (arte del prototipo, base = pose
  final), `NailbotFlotante.tsx` (lanzador solo-cliente, pausa SC 2.2.2, bocadillo 4 s con Esc/×,
  `<dialog>` modal nativo, ←/→ aislados), `scroll-padding-bottom` ligado a `--nailbot-lanzador`.
  typecheck 0 · lint 0 · suite 1328/1328 (1 crash 0xC0000409 de proceso en `contacto-horneado`
  durante la corrida completa, re-ejecutado aislado 17/17) · `pnpm build` exit 0 con las 5 puertas ·
  en navegador real: modal nativo, foco inicial en «Uñas», Esc cierra y devuelve el foco al robot.
- PENDIENTE (pipeline): Gherkin F-23/F-24 + enmienda reserva_chat → TDD (copy Nailbot honesto, nombre
  opcional, regla del sábado, aviso capa 1, log/foco HS-4) → judge → mutación 100 % (ficheros nuevos a
  `stryker.config.json`) → a11y/seguridad → verificación en vivo (F110, móvil 320 px, reduced-motion).

(La sección que dejó el primer `tdd_craftsman` al empezar se retiró: ese agente se paró a los 90 min con
@s1 hecho y el lead siguió él mismo; ver progress/tdd_nailbot_chat_compartido.md.)

## 2026-09-28 — Nailbot: pipeline completo (F-23 + F-24)

- Contratos: `features/nailbot_chat_compartido.feature` (14) y `features/nailbot_flotante.feature` (15) +
  enmienda de `reserva_chat.feature`. Diarios: `progress/tdd_nailbot_chat_compartido.md`,
  `progress/tdd_nailbot_flotante.md` (declaran con honestidad que el lead escribió el código).
- Revisión independiente (judge ×2, a11y, seguridad): hallazgos corregidos, entre ellos la PAUSA que no
  congelaba en un navegador real (shorthand de animación) y un test en vacío (surrogates).
- Mutación: 100 % en los 7 ficheros, timeouts re-medidos a concurrencia 1 (`progress/mutation_nailbot_chat_compartido.md`).
- `bin/harness init`: 46/46 ficheros, 1475/1475 tests, 0 avisos. `pnpm build`: 5 puertas, 6/6 builds
  seguidos tras curar el crash heredado de libuv en Windows (`process.exitCode` en las 5 puertas,
  nodejs/node#56645). Avisos `DEP0190` y el aviso de config de Stryker, eliminados.

### Verificación EN VIVO (Chrome del panel, servidor de desarrollo) — 2026-09-28

- Pausa: 13 piezas animadas en `running`; al pausar, todas `paused` y transforms idénticos durante 1,2 s
  (CONGELA); al reanudar, `running` y en movimiento.
- Panel: `<dialog>` `:modal`; foco inicial en «Uñas»; tras cada paso, al primer control («Entre semana»,
  el campo tras «Un sábado», el enlace final); regla del sábado con «10:00 a 14:00»; mensaje exacto con
  nombre; host del enlace `wa.me` (A-10, solo verificable aquí); aviso como descripción del enlace; Esc
  con tecla REAL cierra y el foco VUELVE al lanzador.
- Móvil 375×812: lanzador 76×76, pausa 32×32, bocadillo visible; F110 al final de la página: 6 controles
  enfocables en pantalla, NINGUNO tapado ni total ni parcialmente → no hace falta relleno en `.pie`
  (HS-10 b, medido). BUG cazado en vivo y corregido: el panel desbordaba (407×884) por `content-box`;
  con `box-sizing: border-box` mide 375×812 y «Cerrar el chat» queda dentro (test de bytes añadido).
- No verificado aquí (anotado como pendiente para el móvil real del humano): lector de pantalla
  (NVDA/VoiceOver), `prefers-reduced-motion` del sistema (la herramienta no lo emula; cubierto por los
  tests de bytes y de componente), gesto atrás de Android, área segura de iOS, abrir el enlace en la app.

### PENDIENTE al cortar la sesión (2026-09-28, el humano apagó el equipo)

- Tras la última ronda (regex SIN lookbehind para Safari < 16.4, `box-sizing` del chat y del panel,
  título del panel en el flujo, contorno en colores forzados y sus tests de bytes): tests afectados
  142/142, typecheck y lint 0. NO re-ejecutados todavía tras esa ronda: `bin/harness init` completo,
  `pnpm build` y la re-medición a concurrencia 1 de 9 timeouts de `chat-nailbot-logica.ts` (la corrida
  a concurrencia por defecto dio 100 %: 97 muertos, 9 timeouts, 0 supervivientes).
- Por eso F-23 sigue `in_progress` y F-24 `spec_ready`: NO se marcan `done` hasta cerrar lo de arriba y
  una revisión delta rápida de los dos bloqueantes corregidos (lookbehind; test de pointer-events).

## 2026-09-28 — Sesión de cierre

- ENMIENDA 2 de F-04 escrita en `features/cascaron_semantico.feature` (@s39 módulo sin `async`, @s40 cero `<link rel="preload" as="image">`, sobre los bytes de `dist/index.html`); pendiente de TDD.
- `tdd_craftsman` — Feature en curso: F-04 — cascaron_semantico (ENMIENDA 2). Escenarios a recorrer: @s39, @s40.
  Diario: `progress/tdd_cascaron_enmienda2.md`.
- `tdd_craftsman` — @s39/@s40 VERDE: `bin/harness init` exit 0 (47/47, 1495/1495), `pnpm build` exit 0 con las 5
  puertas, mutación de `src/lib/horneado.ts` 100 % (11/11, 0 timeouts). Pendiente: `judge` y la sonda de hidratación
  en vivo repetida. F-04 sigue `done` (no se toca `feature_list.json`).
- ENMIENDA 3 de F-04 escrita en `features/cascaron_semantico.feature` (@s41: solo precargas de fuente `.woff2`, cero hacia `.woff`, el CSS conserva `format("woff")` de respaldo; decisión del humano, AskUserQuestion 2026-09-28); pendiente de TDD.
- `tdd_craftsman` — Feature en curso: F-04 — cascaron_semantico (ENMIENDA 3). Escenarios a recorrer: @s41 (más el nit
  del judge de la ENMIENDA 2 en la cabecera de `src/lib/horneado.ts`). Diario: `progress/tdd_cascaron_enmienda3.md`.
- ENMIENDA 4 de F-04 escrita en `features/cascaron_semantico.feature` (@s42 home-horneado, @s43 contacto-horneado, @s44 los 5 experimentos de trampas: el `app-*.js` que carga el HTML, con ancla de su app, sin `jsxDEV` ni `fileName:`; builds de test con `NODE_ENV=production`, decisión del humano, AskUserQuestion 2026-09-28); pendiente de TDD.
- `tdd_craftsman` — @s41 VERDE: `bin/harness init` exit 0 (47/47, 1507/1507), `pnpm build` exit 0 con las 5 puertas
  (`dist/index.html`: 6 precargas de fuente, todas `.woff2`, 0 `.woff`; el CSS conserva los 6 `format("woff")`),
  mutación de `src/lib/horneado.ts` 100 % (23/23, 0 timeouts). Pendiente: `judge`. F-04 sigue `done`.
- `tdd_craftsman` — Feature en curso: F-04 — cascaron_semantico (ENMIENDA 4). Escenarios a recorrer: @s42
  (home-horneado), @s43 (contacto-horneado), @s44 (los 5 experimentos de trampas-del-horneado). Diario:
  `progress/tdd_cascaron_enmienda4.md`. F-04 sigue `done` (no se toca `feature_list.json`).
- `tdd_craftsman` — @s42/@s43/@s44 VERDE: los 3 build-based lanzan con `NODE_ENV=production` (resto heredado);
  sus negativas nacieron ROJAS (368/365 en home y contacto; 13-14/10-11 en los 5 experimentos). `bin/harness init`
  exit 0 (47/47, 1535/1535; 96,3 s antes → 90,0 s después), `pnpm build` exit 0 con las 5 puertas (`dist/` en
  producción, `app-CWmDYxle.js`). No-mutable declarado; `vitest.stryker.config.ts` sigue excluyendo los 3. Observado:
  vitest exporta `MODE=test` y el modo de Vite sigue siendo `test` (bundle idéntico por sha256). Pendiente: `judge`.
- AMPLIACIÓN de la ENMIENDA 4 de F-04 escrita en `features/cascaron_semantico.feature` (@s45, 7 filas: el log del build que ya lanza cada build-based dice «building client environment for production» y nunca «for test»; los lanzamientos llevan también `MODE: 'production'`); pendiente de TDD.
- `tdd_craftsman` — Feature en curso: F-04 — cascaron_semantico (AMPLIACIÓN @s45 de la ENMIENDA 4). Filas a recorrer:
  home-horneado, contacto-horneado y los 5 experimentos de trampas-del-horneado. Diario: sección «Ampliación @s45» de
  `progress/tdd_cascaron_enmienda4.md`.
- `tdd_craftsman` — @s45 VERDE (7 filas): los 3 lanzamientos conservan la salida de su build y llevan también
  `MODE: 'production'`; con solo `NODE_ENV` sus comprobaciones nacieron ROJAS (el log decía «for test»).
  `bin/harness init` exit 0 (47/47, 1556/1556; 84,1 s), `pnpm build` exit 0 con las 5 puertas (`dist/` en producción).
  No-mutable declarado. Diario: «Ampliación @s45» en `progress/tdd_cascaron_enmienda4.md`. Pendiente: `judge`.
