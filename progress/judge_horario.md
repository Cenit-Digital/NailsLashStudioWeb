# Review — feature 10 (`horario`)

**Veredicto:** APPROVED

> El review es el juego entero. Se ha PODADO: cobertura de los 15 `@s`, disciplina TDD,
> pureza/anti-tautología, el BLOQUEANTE de F-04 y la ausencia de regresión. 0 bloqueantes,
> 2 menores (informativos, NO exigen cambio). El `mutation_tester` es la puerta siguiente.

## El BLOQUEANTE (F-04 no reabierto) — RESUELTO
- `git diff src/lib/seo.ts src/lib/seo.test.ts` = **VACÍO**. `construirJsonLd` INTACTO.
- `home.tsx` compone en el SITIO DE EMISIÓN (D4): `{ ...construirJsonLd({…}), openingHoursSpecification: openingHoursSpecification(HORARIO_SEMANAL) }`
  (`src/pages/home.tsx:51-59`). El diff es ADITIVO: mismo `construirJsonLd({...})` esparcido + la clave nueva.
- `seo.test.ts` @s9 (6 claves EXACTAS `['@context','@type','address','geo','name','telephone']` +
  `openingHoursSpecification`/`openingHours` ausentes a toda profundidad) SIGUE VERDE (parte de los 728).
- Puerta de cascarón sin colisión: `puerta-cascaron.ts:243` compara igualdad EXACTA en minúsculas contra
  `'openinghours'` → `'openinghoursspecification' !== 'openinghours'`. Build exit 0 con las 5 puertas.

## Cobertura de escenarios (@s ↔ test)
- @s1: [x] `horario.test.ts:36-48` — reloj FALSO domingo 03:00 (cerrado) vs argumento lunes 10:30 (abierto); + determinismo `:50-54`. MUERDE (sabotaje 2).
- @s2: [x] `horario.test.ts:64-75` — outline semiabierto [abre,cierra): 09:59 cerrado, 10:00 abierto, 20:00 cerrado, 00:00 cerrado. MUERDE (sabotaje 1).
- @s3: [x] `horario.test.ts:83-93` — sábado 14:00 cierre exclusivo, domingo vacío cerrado a cualquier hora. MUERDE (sabotaje 1).
- @s4: [x] `horario.test.ts:102-111` — DST CET/CEST (10:30 y 19:30 en invierno y verano), instantes UTC-`Z`; mata offset +1 y +2 FIJO.
- @s5: [x] `horario.test.ts:134-146` — excepción `[]` cierra un lunes laborable (+ control sin excepción).
- @s6: [x] `horario.test.ts:155-169` — excepción abre un domingo (12:00 dentro, 16:00 fuera de [11:00,15:00)).
- @s7: [x] `horario.test.ts:177-187` — `aMinutos` outline, la fila 13:59→839 mata la aritmética.
- @s8: [x] `horario.test.ts:194-206` — `parsearFranjas`: '10:00-20:00', '10:00-14:00', 'cerrado'→[].
- @s9: [x] `horario.test.ts:214-229` — HORARIO_SEMANAL 7 días, L-V expandido, sábado corto, domingo `[]`.
- @s10: [x] `horario.test.ts:238-256` — EXCEPCIONES `[]`, festivo laborable daría abierto, editar cierra.
- @s11: [x] `horario.test.ts:264-272` — horarioParaUI 3 filas exactas, «Cerrado» y separador «–».
- @s12: [x] `home-horneado.test.ts:52-62` — sin badge «Abierto/Cerrado ahora» en dist/, ancla positiva PRIMERO.
- @s13: [x] `horario.test.ts:281-310` — openingHoursSpecification array, «Sunday» omitido, sin clave `openingHours`.
- @s14: [x] `home-horneado.test.ts:71-108` — JSON-LD horneado en dist/ con el array, 6 claves F-04 intactas, sin `openingHours`, build exit 0.
- @s15: [x] META-escenario (mutación). El contrato lo declara medible SOLO cuando `horario.ts` existe, por el
  `mutation_tester` (líneas 438-472 del `.feature`). Evidencia de que MUERDE: 6 sabotajes en el TDD log +
  2 reproducidos por el juez (abajo). Cobertura formal = puerta de mutación (siguiente), NO test unitario. Correcto.

## Disciplina TDD
- ¿Producción sin test que la pida? **NO.** Cada símbolo exportado tiene test (aMinutos→@s7, parsearFranjas→@s8,
  HORARIO_SEMANAL→@s9, EXCEPCIONES→@s10, abiertoEn→@s5/@s6, estaAbierto→@s1..@s4/@s10, horarioParaUI→@s11,
  openingHoursSpecification→@s13/@s14). Helpers internos (horaDePared, dentroDe, deMinutos, franjaParaUI,
  GRUPOS_SCHEMA) se alcanzan por esos tests. `franjaParaUI` NO adelanta código de jornada partida (Ley 1,
  documentado `horario.ts:158-169`).
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ.** Tabla de 14 ciclos en `tdd_horario.md:19-40` (constante en @s1
  generalizada en @s2; refactor `horaDePared` que eliminó un fallback muerto superviviente StringLiteral).

## Pureza y anti-tautología (verificado)
- `estaAbierto(ahora)` = `abiertoEn(ahora, HORARIO_SEMANAL, EXCEPCIONES)` (`horario.ts:129-131`): reloj INYECTADO.
  `grep new Date|Date.now|process|readFileSync` en `horario.ts` = 0 en runtime (solo la docstring). PURO.
- Conversión a pared Madrid vía `Intl.DateTimeFormat` zona `Europe/Madrid` hourCycle h23 (`:83-104`): DST por
  Intl, NUNCA offset fijo (@s4 lo mata).
- Límites 600/1200/840/0/839 y copy escritos A MANO en el test; instantes anclados UTC-`Z`; el doble sintético
  `SOLO_LUNES_ABIERTO` (`horario.test.ts:118-126`) NO deriva de `HORARIO`. HORARIO_SEMANAL LEE/PARSEA `HORARIO`
  de F-02 (`horario.ts:53-67`); `site.ts` sin diff (D3, F-02 no reabierta).

## El test MUERDE (sabotajes reproducidos por el juez, revertidos, repo limpio)
1. Cierre `minutos < cierra` → `<=` ⇒ @s2 20:00 + @s3 14:00 ROJO (2 fallos). Revertido.
2. `estaAbierto` lee `new Date()` en vez del argumento ⇒ @s1 ROJO (+ @s10 y otros por reloj vs argumento). Revertido.
`diff` contra backup = idéntico; `horario.ts:107` y `:130` restaurados.

## Decisión D1 (verificado)
- NO se renderiza badge «Abierto/Cerrado ahora». `home.tsx` solo consume `HORARIO_SEMANAL` y
  `openingHoursSpecification`; NO importa ni pinta `estaAbierto` (construido para F-13). @s12 lo asevera sobre dist/.

## Mutación-ready / nada de más
- `git status` = solo lo esperado: mod `home.tsx`, `stryker.config.json`, `progress/current.md`;
  nuevos `horario.ts`, `horario.test.ts`, `home-horneado.test.ts`, `tdd_horario.md`. Sin basura.
- `stryker.config.json` diff = ADITIVO `+ src/lib/horario.ts` en `mutate` (línea 24). `home.tsx` NO entra
  (cableado/JSX). `home-horneado.test.ts` no importa `src/lib` → no lo re-ejecuta Stryker (anti-timeout).

## Calidad (lente de artesano)
- Funciones cortas, un motivo de cambio; nombres reveladores (vocabulario de dominio en castellano, homogéneo
  con el repo). Sin números mágicos sueltos (MINUTOS_POR_HORA, separadores, etiquetas y copy nombrados).
- Capas limpias: `site.ts` (dato F-02) → `horario.ts` (dominio PURO) → `home.tsx` (composición UI). Sin IO en el
  dominio. Respeta `docs/architecture.md` (inmutabilidad: `readonly`; efectos controlados).

## Checkpoints
- C1 arnés completo: [x] `bin/harness init` exit 0 ("Entorno listo").
- C2 estado coherente: [x] una sola feature `in_progress` (`horario`); `current.md` describe la sesión.
- C3 arquitectura: [x] módulo previsto, cero dependencias nuevas, sin logs/TODO sueltos.
- C4 verificación real: [x] test por módulo; `pnpm test` 728 verdes (>0).
- C5 sesión: [x] sin ficheros sospechosos; estado F-10 reflejado (in_progress, no `done`).
- C6 contrato Gherkin: [x] 15 `@s` con `Then` medible, mapa `@s→test`, sin producción sin test.
- C7 mutación: [ ] pendiente del `mutation_tester` (puerta siguiente; umbral 1.0, 0 exclusiones).

## Sin regresión
- `pnpm typecheck` 0 · `pnpm lint` 0 · `pnpm test` **728 passed / 22 files** (incluye build-based) ·
  `pnpm build` exit 0 con las 5 puertas · `seo.test.ts` (F-04) VERDE.

## Menores (informativos — NO exigen cambio)
1. @s15 no tiene test unitario propio (es META-escenario): su cobertura formal es la puerta de mutación.
   Correcto por contrato; queda EXPLÍCITO para el `mutation_tester` (umbral 1.0, 0 exclusiones desde F-03).
2. `franjaParaUI` (`horario.ts:163`) toma solo la 1.ª franja del grupo. Es deliberado (el modelo de F-02 nunca
   produce jornada partida; Ley 1, documentado en el código). Si F-13/una excepción introdujera multi-franja,
   haría falta escenario NUEVO. No es deuda de F-10.

## Cambios requeridos
Ninguno.
