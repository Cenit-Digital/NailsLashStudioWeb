# Diario — encargo "chat funcional" (sesión 2026-07-21, `tdd_craftsman`)

## TRABAJO 1 — BLOCKED, no implementado

El encargo pide componer, junto a «Reservar otra cita», un enlace de WhatsApp con la solicitud YA
ESCRITA (servicio + día + franja + nombre urlencoded vía `mensajeReserva`/`waHref`).

**Esto contradice el contrato aprobado `features/reserva_chat.feature`**, ya implementado y en HEAD
(commit `31d233e`):

- `@s22` dice literalmente: *"La sección NO compone la solicitud ni envía nada — eso sigue siendo
  F-13"* y el `Then` exige que el mensaje del enlace de WhatsApp *"NO contenga ningún nombre de
  servicio, ninguna fecha, ninguna hora ni ningún nombre de persona: no hay composición dinámica"*.
- La sección "FRONTERA CON F-13" del `.feature` (líneas 38-44) declara esa frontera "SIGUE INTACTA" y
  que la composición real de la solicitud es la feature `solicitud_whatsapp` (id 13 en
  `feature_list.json`), estado `"pending"` — sin `project-spec.md`, sin `.feature` propio, sin puerta
  humana. Es, además, la MISMA lógica que su `acceptance` pide textualmente: *"componerMensajeWhatsApp
  aplica encodeURIComponent... y omite los campos ausentes sin escribir undefined"*.
- El test existente `reserva.test.tsx` `@s22` ya asevera activamente que el href NO contiene
  "Uñas"/"Pestañas"/"Cejas", ninguna hora ni "Marta": implementar TRABAJO 1 tal cual pondría ese test
  en rojo por diseño, es decir, exige REESCRIBIR un escenario aprobado, no añadir uno nuevo.
- `progress/current.md` (deuda declarada el 2026-07-21) confirma que la deuda pendiente sobre
  `Reserva.tsx` es (1) mutación fuera de `stryker` — TRABAJO 2 — y (2) el disclaimer D1 (leyenda de
  "asistente de demostración"). Componer el mensaje NO figura como deuda: es alcance nuevo de F-13.

Por la Ley "no inventes comportamiento cuando el `.feature` lo prohíbe" (rol `tdd_craftsman`) y por
`AGENTS.md`/`CLAUDE.md` ("no saltes la conversación de spec ni la destilación Gherkin para features
`sdd: true`"; F-13 lo es), **paro** en vez de implementar. Ruta correcta: `spec_partner` +
`gherkin_author` abren F-13 (o se reescribe `@s22` de `reserva_chat.feature` con una nueva puerta
humana explícita que retire la frontera), y solo entonces el `tdd_craftsman` implementa por TDD.
No se tocó `Reserva.tsx` para este trabajo (los cambios que SÍ tiene el fichero son de TRABAJO 2).

## TRABAJO 2 — CERRADO, 100 % mutación

`stryker.config.json` → `mutate`: añadidos `src/components/Reserva.tsx` y
`src/components/reserva-logica.ts`.

- `reserva-logica.ts`: `pnpm exec stryker run --mutate src/components/reserva-logica.ts` → **100.00 %**
  (3/3 killed) a la primera, sin cambios.
- `Reserva.tsx`: primera corrida → **97.00 %** (92 killed, 5 timeout, **3 survived**). Los 3:
  1. `BooleanLiteral` línea 69 (`{ deBot: true, texto: resumen }` → `false` en la burbuja del resumen
     final). Ningún test comprobaba `data-de` de esa burbuja. **Fix:** nueva aserción en el test de
     `@s15` — `burbujas[última]` tiene `data-de="bot"`.
  2. `StringLiteral` línea 78 (`setBorrador('')` dentro de `enviarNombre`). Probado **equivalente**
     dado el invariante del propio guion: el paso "nombre" es SIEMPRE el último (`FLUJO_CHAT.length
     === 4`), así que tras `enviarNombre()` el input se desmonta en el mismo render (`hecho=true`) y
     ese `setBorrador('')` nunca llega a pintarse; la única vía para volver a ver el input es
     `reiniciar()`, que ya limpia el borrador de forma independiente (documentado en el propio `@s17`
     del `.feature`: *"El reinicio limpia LOS CINCO estados... si uno se olvidara, el siguiente
     resumen mezclaría datos de dos personas distintas"*). **Fix: REFACTOR, no exclusión** — se borró
     la línea muerta (Ley 3: no dejar código que ningún test puede exigir).
  3. `StringLiteral` línea 85 (`setBorrador('')` dentro de `reiniciar`). Con la línea 78 ya borrada,
     esta SÍ es observable: sin ella, tras completar el chat con "Marta" y pulsar "Reservar otra
     cita", el campo de nombre reaparecería precargado con "Marta" al volver a llegar al cuarto paso.
     **Fix:** nuevo test en el bloque `@s17` (que ya reclama "sin rastro de las respuestas previas")
     que reconstruye el guion tras reiniciar y comprueba que el campo está vacío.
- Segunda corrida: `pnpm exec stryker run --mutate src/components/Reserva.tsx` → **100.00 %** (95
  killed, 4 timeout, **0 survived, 0 exclusiones**).
- Ninguna exclusión (`Stryker disable`) usada. Un mutante se cerró por refactor (código muerto
  eliminado), no por veredicto de equivalencia declarado y dejado en el código.
- Ningún `className` condicional tocado (ya usaba `data-de` + `claveBurbuja` desde la sesión previa).

### Trazabilidad de los tests nuevos/tocados
- `@s15` (resumen interpolado) → añadida aserción `data-de="bot"` en la burbuja final.
- `@s17` ("sin rastro de las respuestas previas") → nuevo test: el campo de nombre vuelve VACÍO tras
  reiniciar y re-recorrer el guion.

## TRABAJO 3 — no iniciado (además, contrato ya en conflicto, preexistente)

No llegué por presupuesto, y de haber llegado habría parado igual: `src/components/Contacto.tsx` YA
tiene un enlace «Cómo llegar» (`MAPS_HREF` derivado de `GEO`, no de `DIRECCION`) desde el commit
`5d24712` ("Demo/lunes prototipo"), sin ningún test (`grep -n "llegar" contacto.test.tsx
contacto-fuente.test.ts` = 0 resultados). Esto **contradice** `features/contacto.feature` `@s11`/`@s12`
(aprobado, feature 12 `in_progress`), que prohíben expresamente el mapa/«Cómo llegar» en `#contacto` y
lo asignan a F-11 (`mapa_como_llegar`, `pending`). Es una deriva preexistente, no introducida por mí;
la dejo anotada para que el lead decida si se retira, se re-contrata o F-11 se abre formalmente.

## Verificación final (medida)
- `pnpm typecheck` → 0.
- `pnpm lint` → 0 errores, 0 warnings.
- `pnpm test` → **947/947** (33 ficheros; 946 + 1 test nuevo).
- Mutación: `reserva-logica.ts` 100 % (3/3), `Reserva.tsx` 100 % (95 killed + 4 timeout / 99, 0
  supervivientes, 0 exclusiones).
- Ficheros tocados: `stryker.config.json` (2 líneas de `mutate`), `src/components/Reserva.tsx` (1
  línea muerta borrada), `src/components/reserva.test.tsx` (2 aserciones/tests nuevos de mutación).
  Nada en `Equipo*`, `Galeria*`, `equipo-demo.ts`, `src/assets/`, `home.tsx`, `feature_list.json`.
