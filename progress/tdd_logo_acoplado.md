# Bitácora TDD — F-25 `logo_acoplado` (tdd_craftsman, 2026-09-29)

Contrato: `features/logo_acoplado.feature` (34 escenarios, APROBADO por Pablo el 2026-09-29). Spec:
`project-spec.md` §Feature 25 (LA-C1..LA-C13, LA-1..LA-16, ENMIENDA D-1). Decisiones del lead:
`progress/gherkin_logo_acoplado.md` (D-1..D-8).

## Línea base (antes del primer test)

- `pnpm test` → **47 ficheros, 1556 tests, todo verde** (81 s).

## Orden de trabajo

Los escenarios se recorren en el orden del `.feature`: @s1 → @s27, y @s34 al final. @s28-@s33 son
`@verificacion-viva` y NO se fingen en jsdom: quedan para el lead (sección al final).

Comando de cada ciclo: `pnpm exec vitest run <fichero>` (un fichero, segundos). La suite completa
(`pnpm test`) se corre en los puntos de control marcados y al cierre.

## Ciclos Rojo → Verde → Refactor

(Se añaden según se cierran.)
