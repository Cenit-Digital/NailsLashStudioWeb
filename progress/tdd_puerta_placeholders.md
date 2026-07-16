# TDD — Feature 1 `puerta_placeholders`

> Bitácora del `tdd_craftsman`. Contrato: `features/puerta_placeholders.feature`
> (26 escenarios, aprobado en la puerta humana). **Un escenario = un ciclo
> Rojo → Verde → Refactor.** Se escribe según avanza, no al final.

## Decisiones de diseño (tomadas antes del ciclo 1, con el contrato en la mano)

1. **Dos módulos, porque el contrato fija dos capas** (cabecera del `.feature`):
   - `src/lib/placeholders.ts` — la INSPECCIÓN. Función pura
     `detectarPlaceholders(entrada) → Violacion[]`. No lee ficheros, ni el reloj,
     ni el entorno, ni decide exit codes.
   - `src/lib/puerta.ts` — la PUERTA. Lee (a través de un puerto de sistema de
     ficheros inyectado), invoca la inspección y devuelve `{ codigoSalida, lineas }`.
   - `tools/puerta-placeholders.ts` — el *humble object*: cablea `node:fs` real y
     `process.exit`. Sin decisiones: todo lo que decide vive en `puerta.ts`, que
     está testeado y mutado.
2. **Los tests conviven con el código** (`src/lib/*.test.ts`): `vitest.config.ts`
   tiene `include: ['src/**/*.{test,spec}.{ts,tsx}']`. Un test en `tests/` no se
   ejecutaría.
3. **Anti-tautología**: los 6 patrones se escriben **a mano** en los tests. No se
   importa `PATRONES_PROHIBIDOS`. Precedente WebEmpresa: el fake de `useIsMobile`
   usando `MOBILE_QUERY` en vez del literal → primer mutante superviviente.
4. **El `modo` es un parámetro de la puerta**, no una lectura de `process.env`:
   así `@s14` (dev no falla) es testeable y aparece el `&&` de «producción Y hay
   violaciones» que `feature_list.json` exige que muera.

## Ciclos

### Ciclo 1 — `@s1` (flag: violación con vía, ubicación y valor)

- **Rojo**: `@s1 un registro marcado esPlaceholder produce una violación con vía,
  ubicación y valor`. Falla por no compilar/importar: `src/lib/placeholders.ts` no
  existe (Ley 2: no importar cuenta como fallar).
- **Verde**: el módulo con `detectarPlaceholders` recorriendo `registros` y
  empujando una violación por registro. **Mínimo deliberado: ignora el flag.**
- **Refactor**: nada que limpiar todavía.

### Ciclo 2 — `@s2` (flag `false` + contenido real → sin violación)

- **Rojo**: `AssertionError: expected [ { via: 'flag', …(3) } ] to deeply equal []`.
  Rojo **por el motivo correcto**: el ciclo 1 no miraba el flag.
- **Verde**: `if (registro.esPlaceholder === true)`.
- **Refactor**: —

### Ciclo 3 — `@s24` (registro de JSON que no declara el flag → violación que dice que FALTA)

- **Rojo**: `expected [] to have a length of 1`. `=== true` no caza `undefined`.
- **Verde**: `motivoDelFlag()` con **falla cerrada**: solo un `false` explícito
  absuelve; `true` → `'marcado'`, ausente → `'sin_declarar'`. El motivo distingue
  «FALTA» de «false», que es justo lo que pide el Then.
- **Detalle**: el test construye el registro con `JSON.parse` de verdad, no con un
  cast. Es literalmente el Given («cargado desde JSON»): el tipo exige el flag en
  compilación, pero a los datos que llegan de un `.json` el tipo no los protege.
- **Refactor**: se extrae `motivoDelFlag` fuera del bucle (función corta, nombre
  revelador).

### Ciclo 4 — `@s3` (entrada vacía → lista vacía)

- **Rojo**: **no hubo**. El test pasó a la primera porque `entrada.registros ?? []`
  ya cubría el caso. `docs/tdd.md` dice: un test que pasa a la primera no demuestra
  nada → **se verificó a mano que muerde**, mutando `?? []` a `!`:
  `FAIL @s3 … Tests 1 failed | 3 passed`. Restaurado → verde. El mutante de Stryker
  sobre `??` morirá aquí.
- **Verde/Refactor**: sin cambios de producción (Ley 1: no había test rojo que los
  pidiera).

### Ciclo 5 — `@s4` (los seis patrones prohibidos, Scenario Outline ×6)

- **Rojo**: `Tests 6 failed | 4 passed`. No existía ni el campo `ficheros` ni la
  vía por patrón.
- **Verde**: `PATRONES_PROHIBIDOS` (los 6 literales) + `contenido.includes(patron)`.
  **Mínimo deliberado: comparación literal.** `@s5` forzará la familia TELÉFONO y
  `@s7` la familia TEXTO.
- **Refactor**: —
- **Nota para `@s25`**: hoy la lista de patrones está en el **bucle exterior**. Es
  el orden equivocado y `@s25` lo matará: ahí se invierte a «por posición en el
  contenido».

### Ciclo 6 — `@s5` (el teléfono no escapa por espaciado, guiones ni prefijo)

- **En curso.**
