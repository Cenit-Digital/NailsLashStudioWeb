# Diario — «el chat SÍ compone y entrega por WhatsApp» (sesión 2026-07-21, `tdd_craftsman`)

## Por qué esta sesión SÍ implementa lo que la anterior bloqueó

Un agente previo (`progress/tdd_chat_funcional.md`, TRABAJO 1) se negó a componer el mensaje de
WhatsApp con los datos del chat porque `features/reserva_chat.feature` @s22 (v2) decía literalmente
que esta sección "NO compone la solicitud" y que eso era F-13 (`pending`). Hizo bien en pararse: ese
contrato lo escribió un agente esa misma mañana y no había puerta humana para tocarlo.

DESPUÉS, el `craftsman_lead` preguntó a Pablo explícitamente (`AskUserQuestion`) qué debía pasar al
terminar el chat. Pablo eligió: *"Que acabe abriendo WhatsApp — Al terminar las 4 preguntas, un botón
abre WhatsApp con la reserva ya escrita (servicio, día, franja y nombre) para que la clienta la
envíe."* La puerta humana quedó abierta para esta pieza concreta (no para el resto de F-13: sigue
pendiente la disponibilidad real por profesional/franja y la confirmación de servidor).

Esta sesión reescribe la frontera del contrato (`@s22` acotado + `@s23`/`@s24` nuevos, con la cabecera
"ACTUALIZACIÓN v3" documentando la decisión y su motivo) y la implementa por TDD.

## Escenarios recorridos (@s23, @s24 — nuevos; @s22 reacotado sin tocar producción)

### @s23 — `mensajeReserva` compone los cuatro datos, función PURA

- **ROJO**: test en `reserva.test.tsx` importando `mensajeReserva` de `./reserva-logica` (no existía) →
  `TypeError: mensajeReserva is not a function`.
- **VERDE**: `mensajeReserva({ servicio, dia, franja, nombre })` en `src/components/reserva-logica.ts`,
  interpolación en una plantilla, sin estado ni reloj.
- **REFACTOR**: ninguno necesario (función ya corta y con nombres claros).
- Segundo caso (acentos, superíndice, «&») en el mismo ciclo VERDE, mismo criterio que @s20 del bot:
  mata al mutante que fija un valor o pierde un campo del objeto.

### @s24 — el enlace "Enviar la reserva por WhatsApp" antes de "Reservar otra cita"

- **ROJO**: test único con las tres fases (ausente al montar, ausente a mitad de guion, presente y
  posicionado tras terminar) → `getByRole('link', { name: 'Enviar la reserva por WhatsApp' })` no
  encuentra nada.
- **VERDE**: en `Reserva.tsx`, dentro de `{hecho && (...)}` se envuelve en un Fragment y se añade el
  `<a className="demo-btn demo-btn--wa" href={...}>` ANTES del `<button>` de reiniciar. El href sale
  de un nuevo helper local `hrefReservaWhatsapp(respuestas)` que junta `waHref(TELEFONO.legible,
  mensajeReserva(...))` — ninguna composición de texto vive en el JSX.
- **REFACTOR**: la llamada `waHref(TELEFONO.legible, mensajeReserva({...}))` se extrajo del JSX a
  `hrefReservaWhatsapp` (module-scope, no exportado, hermano de `mensajeInicial`) para que la línea del
  `<a>` quede en una sola línea legible. Tests re-corridos tras el cambio: siguen verdes.
- Técnica de aserción del href: en vez de transcribir a mano el urlencoded largo (propenso a error
  con «ñ»/«·»/«¿»), el test decodifica con `decodeURIComponent` (el inverso NATIVO, que ningún código
  de producción llama) y compara el resultado con el literal completo escrito a mano — no reejecuta
  `mensajeReserva`/`waHref` contra su propio resultado (misma anti-tautología del resto del contrato).

## Contrato reescrito

`features/reserva_chat.feature`: cabecera con bloque "ACTUALIZACIÓN v3" (cita literal de Pablo),
sección "FRONTERA CON F-13" reescrita ("se estrecha, no desaparece": disponibilidad real y
confirmación de servidor siguen siendo F-13), `@s22` reacotado al enlace FIJO de la columna izquierda
(sus tests existentes en `reserva.test.tsx` NO se tocaron: seguían siendo válidos porque ya apuntaban
específicamente al enlace `>WhatsApp<`, no al nuevo), `@s23` y `@s24` nuevos, ANTI-TAUTOLOGÍA ampliada
con la regla de `decodeURIComponent`, TRAZA y lista de artefactos actualizadas.

## Trazabilidad

- @s23 (mensajeReserva compone los 4 datos) → 2 tests en `describe('@s23 ...')` (caso base + caso con
  acentos/superíndice/«&»).
- @s24 (enlace antes de "Reservar otra cita") → 1 test en `describe('@s24 ...')`: ausencia inicial,
  ausencia a mitad de guion, presencia + posición + nombre accesible + `target` + href tras terminar.
- @s22 (frontera con F-13 acotada) → los 3 tests YA EXISTENTES de `describe('@s22 ...')` (sin cambios
  de código, solo de título/comentario del `.feature`).

## Verificación final (medida)

- `pnpm typecheck` → 0.
- `pnpm lint` → 0 errores, 0 warnings.
- `pnpm test` → **950/950** (33 ficheros; 947 + 3 tests nuevos).
- Mutación: `pnpm exec stryker run --mutate src/components/reserva-logica.ts` → **100.00 %** (5/5
  killed, 0 survived). `pnpm exec stryker run --mutate src/components/Reserva.tsx` → **100.00 %** (97
  killed + 4 timeout / 101, 0 survived, 0 exclusiones nuevas). Ninguna corrida acotó con `--testFiles`.
- Ficheros tocados: `features/reserva_chat.feature` (cabecera v3, `@s22` reescrito, `@s23`/`@s24`
  nuevos), `src/components/reserva-logica.ts` (+`SolicitudReserva`, +`mensajeReserva`),
  `src/components/Reserva.tsx` (+import, +`hrefReservaWhatsapp`, +enlace en el bloque `hecho`),
  `src/components/reserva.test.tsx` (+3 tests). NADA en `Equipo*`, `Galeria*`, `equipo-demo.ts`,
  `src/assets/`, `Contacto*`, `home.tsx`, `feature_list.json`, `stryker.config.json` (ya tenía los dos
  ficheros en `mutate` desde la sesión previa).

## NO marcado como `done`

Pendiente `judge` y `mutation_tester` (ya con los números de mutación medidos arriba para su
verificación). `feature_list.json` no se tocó.
