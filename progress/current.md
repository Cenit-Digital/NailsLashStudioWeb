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
