# Corrección final — 0 warnings + mutación certificable

Dos correcciones de higiene sobre features ya cerradas por TDD. No se añade
comportamiento nuevo: se REUBICA lógica (para react-refresh) y se ajusta la
lista `mutate` de Stryker (fichero declarado no-mutable). Sin tocar aserciones.

## CORRECCIÓN 1 — extraer la lógica pura de Equipo (elimina 4 warnings react-refresh)

`pnpm lint` emitía 4 `react-refresh/only-export-components` en `Equipo.tsx`
porque el módulo del componente exportaba también cuatro funciones PURAS
(`diasOfrecidos`, `franjasOfrecibles`, `franjasDe`, `indiceCircular`). Patrón del
repo (F-09: `catalogo`/`catalogo-logica`): mover lo puro a un módulo hermano.

- NUEVO `src/components/equipo-logica.ts`: alberga las cuatro funciones puras,
  el tipo `DiaOfrecido` y las constantes que solo ellas usan (`DIAS_A_OFRECER`,
  `DOMINGO`, `DOW`, `DIA_SEMANA`, `FRANJAS_POSIBLES`), más los imports de F-10
  (`aMinutos`, `Franja`, `HORARIO_SEMANAL`, `DiaSemana`). Comportamiento y
  cuerpos VERBATIM.
- `Equipo.tsx`: importa `diasOfrecidos`, `franjasDe`, `indiceCircular` y el tipo
  `DiaOfrecido` desde `./equipo-logica`; deja de exportar las funciones. El
  componente (`Equipo`) sigue siendo la ÚNICA exportación del módulo. Markup
  intacto.
- `equipo.test.tsx`: las funciones puras se importan ahora de `./equipo-logica`
  (línea 5). Aserciones sin cambios.

Objetivo: `pnpm lint` → 0 errores, 0 warnings.

## CORRECCIÓN 2 — mutación del botón flotante (choque estructural)

`node tools/mutate.mjs src/components/BotonWhatsApp.tsx` ABORTA en el dry-run:
`@s11` lee los BYTES del `.tsx` y prohíbe `if (` / `&&` / `||` / `?`, pero
Stryker INSTRUMENTA ese mismo fichero inyectando `if (stryMutAct…`, así que el
baseline cae en el sandbox y Stryker no arranca. No es un mutante vivo: es un
choque entre un guard de FUENTE y la instrumentación (ver
`progress/mutation_boton_whatsapp.md`).

Vía documentada (docs/mutation-testing.md, fichero declarado no-mutable):
- `stryker.config.json`: QUITAR `src/components/BotonWhatsApp.tsx` de `mutate`
  (los 3 mutantes son de string-literal, presentacionales; el comportamiento lo
  guardan @s1..@s14 + el de montaje @s4). AÑADIR
  `src/components/equipo-logica.ts` (ahí vive ahora la lógica mutable de Equipo).
  MANTENER `src/components/Equipo.tsx`.
- Documentar la exclusión en `progress/mutation_boton_whatsapp.md` (sección
  «Resolución»).

## Ficheros tocados

- NUEVO `src/components/equipo-logica.ts` (funciones puras + tipo `DiaOfrecido`
  + constantes + imports de F-10, cuerpos verbatim).
- `src/components/Equipo.tsx` (importa de `./equipo-logica`; deja de exportar
  las 4 funciones y `DiaOfrecido`; markup y comportamiento intactos).
- `src/components/equipo.test.tsx` (línea 5: funciones puras desde
  `./equipo-logica`; aserciones sin cambios).
- `stryker.config.json` (fuera `BotonWhatsApp.tsx`; dentro `equipo-logica.ts`;
  `Equipo.tsx` se mantiene).
- `progress/mutation_boton_whatsapp.md` (sección «Resolución»).

## Verificación (targeted, sin build)

- `pnpm exec vitest run equipo.test.tsx equipo-estilos.test.ts
  boton-whatsapp.test.tsx boton-whatsapp-montaje.test.tsx` → **4 files, 81
  tests PASSED**.
- `pnpm typecheck` (`tsc --noEmit`) → **OK, sin errores**.
- `pnpm lint` (`eslint .`) → **exit 0, 0 errores, 0 warnings** (los 4
  `react-refresh/only-export-components` desaparecen: `Equipo.tsx` exporta solo
  el componente).

## Nota sobre la mutación

No se corre `node tools/mutate.mjs` aquí (es fase del `mutation_tester`). La
lista `mutate` resultante deja lista la corrida certificable: sale el `<a>`
estático no-mutable, entra `equipo-logica.ts` con la lógica realmente mordible.
