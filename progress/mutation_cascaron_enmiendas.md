# Mutación — feature F-04 `cascaron_semantico`, ENMIENDAS 2 y 3 (`src/lib/horneado.ts`)

> `mutation_tester`, 2026-09-28. Medición INDEPENDIENTE de `src/lib/horneado.ts`
> (`sinPrecargasDeImagen` de @s40 y `sinPrecargasDeFuenteWoff` de @s41) tal como está en HEAD
> `c24870e`. `git diff --quiet HEAD -- src stryker.config.json vitest.stryker.config.ts vitest.config.ts`
> dio limpio antes de medir. No he editado código, tests ni configuración.
>
> Precondiciones: `judge` APPROVED en `progress/judge_cascaron_enmienda2.md` y
> `progress/judge_cascaron_enmienda3.md`. Contexto: `progress/tdd_cascaron_enmienda2.md` (11/11) y
> `progress/tdd_cascaron_enmienda3.md` (23/23).
>
> Umbral: `harness.config.json` → `mutation.threshold` = 1.0; `stryker.config.json` →
> `thresholds.break` = 100. Acotado solo con `--mutate`. No he usado `--testFiles`, que está prohibido.
> Stryker usa `vitest.stryker.config.ts`, que excluye los `*-horneado.test.*` build-based. Por eso el
> dry run recoge los 17 tests unitarios de `src/lib/horneado.test.ts`.

**Veredicto:** PASS
**Score:** killed/total = 23/23 = 100 % (umbral: 100 %)

## Mediciones

| #   | Comando                                                                                                                               | Mutantes | Muertos | Timeouts | Supervivientes | Sin cobertura | Errores | Tests dry run | Tiempo (Stryker / real) |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | -------: | ------: | -------: | -------------: | ------------: | ------: | ------------: | ----------------------: |
| 1   | `pnpm exec stryker run --mutate src/lib/horneado.ts --reporters html,clear-text,progress,json`                                        |       23 |      23 |        0 |              0 |             0 |       0 |            17 |           15 s / 17,7 s |
| 2   | `bin/harness mutate src/lib/horneado.ts` (→ `node tools/mutate.mjs` → `pnpm exec stryker run --mutate src/lib/horneado.ts`, tal cual) |       23 |      23 |        0 |              0 |             0 |       0 |            17 |           20 s / 23,2 s |

- En la medición 1 la única diferencia es el reporter `json`, añadido por CLI y no en la
  configuración. Lo necesitaba para leer `killedBy` por mutante. No cambia qué se mide.
  La medición 2 es el comando del encargo, pasado por el arnés.
- Durante las dos mediciones, otro agente tenía en marcha un `vitest run` con `vite-react-ssg build`.
  Aun así hubo **0 timeouts**, así que no hizo falta re-medir con `--concurrency 1`.
- Stryker ejecutó 3,09 tests por mutante de media, con 4 procesos de test runner.
- Mientras medía, otro agente cambió `src/pages/home-horneado.test.ts` (+6 líneas, sin commit,
  mtime 12:16:16). Fue entre la medición 1 (terminó a las 12:16:15) y la 2 (empezó a las 12:16:32).
  No es mío y no influye en el resultado: `vitest.stryker.config.ts` excluye ese fichero, y en el dry
  run de la medición 2 volvieron a entrar solo los 17 tests de `src/lib/horneado.test.ts`.
  `src/lib/` sigue idéntico a HEAD.

## Mutantes por mutador (23)

El test que lo mata es el `killedBy` del informe JSON de la medición 1. Stryker se detiene en el
primer test que falla, así que es el PRIMER test en caer en orden de ejecución, y puede haber otros
que también lo maten. `uN` es el N-ésimo `it` de `src/lib/horneado.test.ts` en orden de fichero:
u1-u8 son @s40 y u9-u17 son @s41.

Los 8 mutantes Regex están en constantes de módulo y son **estáticos**. Por eso su cobertura por
test es 0, pero Stryker ejecuta con ellos la suite completa. No son «sin cobertura»: el informe los
da como `Killed`.

### Regex (8)

| Id  | Línea              | Mutación                              | Lo mata                               |
| --- | ------------------ | ------------------------------------- | ------------------------------------- |
| 0   | 21 `ETIQUETA_LINK` | `/<link[^>]*>/gi` → `/<link[^>]>/gi`  | u1 (@s40 forma exacta vite-react-ssg) |
| 1   | 21 `ETIQUETA_LINK` | `/<link[^>]*>/gi` → `/<link[>]*>/gi`  | u1                                    |
| 2   | 22 `REL_PRELOAD`   | `\srel="preload"` → `\Srel="preload"` | u1                                    |
| 3   | 23 `AS_IMAGE`      | `\sas="image"` → `\Sas="image"`       | u1                                    |
| 4   | 24 `AS_FONT`       | `\sas="font"` → `\Sas="font"`         | u9 (@s41 forma exacta con type falso) |
| 5   | 26 `HREF_WOFF`     | `\shref=…` → `\Shref=…`               | u9                                    |
| 6   | 26 `HREF_WOFF`     | `[^"]*\.woff"` → `[^"]\.woff"`        | u9                                    |
| 7   | 26 `HREF_WOFF`     | `[^"]*\.woff"` → `["]*\.woff"`        | u9                                    |

### BlockStatement (5)

| Id  | Línea                            | Mutación      | Lo mata |
| --- | -------------------------------- | ------------- | ------- |
| 8   | 28-30 `esPrecargaDeImagen`       | cuerpo → `{}` | u1      |
| 12  | 32-34 `esPrecargaDeFuenteWoff`   | cuerpo → `{}` | u9      |
| 18  | 36-38 `sinLinksQue`              | cuerpo → `{}` | u1      |
| 21  | 40-42 `sinPrecargasDeImagen`     | cuerpo → `{}` | u1      |
| 22  | 44-46 `sinPrecargasDeFuenteWoff` | cuerpo → `{}` | u9      |

### ConditionalExpression (5)

| Id  | Línea | Mutación                                  | Lo mata                                                         |
| --- | ----- | ----------------------------------------- | --------------------------------------------------------------- |
| 9   | 29    | `REL_PRELOAD… && AS_IMAGE…` → `true`      | u3 (@s40 deja intactas las precargas de fuente y el stylesheet) |
| 10  | 29    | `REL_PRELOAD… && AS_IMAGE…` → `false`     | u1                                                              |
| 13  | 33    | `A && B && C` → `true`                    | u11 (@s41 deja intacta la `.woff2` y el stylesheet)             |
| 14  | 33    | `A && B && C` → `false`                   | u9                                                              |
| 16  | 33    | `A && B` (REL_PRELOAD y AS_FONT) → `true` | u13 (@s41 `as="fetch"` hacia `.woff` se queda)                  |

### LogicalOperator (3)

| Id  | Línea | Mutación                             | Lo mata |
| --- | ----- | ------------------------------------ | ------- |
| 11  | 29    | `REL_PRELOAD… && AS_IMAGE…` → `\|\|` | u3      |
| 15  | 33    | `A && B && C` → `A && B \|\| C`      | u11     |
| 17  | 33    | `A && B` → `A \|\| B`                | u13     |

### ArrowFunction (1)

| Id  | Línea | Mutación                                                              | Lo mata |
| --- | ----- | --------------------------------------------------------------------- | ------- |
| 19  | 37    | `(etiqueta) => (sobra(etiqueta) ? '' : etiqueta)` → `() => undefined` | u1      |

### StringLiteral (1)

| Id  | Línea | Mutación                     | Lo mata |
| --- | ----- | ---------------------------- | ------- |
| 20  | 37    | `''` → `"Stryker was here!"` | u1      |

Recuento: 8 + 5 + 5 + 3 + 1 + 1 = 23. Todos `Killed`.

## Mutantes sobrevivientes

Ninguno. No excluyo ningún mutante como equivalente.

## Coherencia con las mediciones previas

- Coincide con `progress/tdd_cascaron_enmienda3.md` y `progress/judge_cascaron_enmienda3.md`:
  23 muertos, 0 timeouts, 0 supervivientes, 0 sin cobertura y 17 tests en el dry run. Los tests que
  matan cada mutante coinciden también con los del diario del craftsman (:204-214).
- Los 11 mutantes de la ENMIENDA 2 (`progress/tdd_cascaron_enmienda2.md` y
  `progress/judge_cascaron_enmienda2.md`) siguen incluidos y mueren con los mismos tests @s40 (u1 y u3).
  Son los ids 0-3, 8-11, 18-21.

## Límites de lo medido (declarados; no afectan al veredicto)

- Stryker no muta los flags de las regex (`g`, `i`) ni reescribe literales como `\.woff"` o
  `="preload"`. Esas mutaciones se hicieron a mano en el ciclo TDD y en el judge
  (`progress/tdd_cascaron_enmienda3.md` §«Mutaciones a mano», `progress/judge_cascaron_enmienda3.md`).
  No las he vuelto a medir aquí.
- El cableado `onPageRendered` de `vite.config.ts` no está en la lista `mutate` de
  `stryker.config.json`. Lo defiende el test de bytes build-based `src/pages/home-horneado.test.ts`,
  que está excluido de la mutación. El judge de la ENMIENDA 2 ya lo dejó declarado como NO-MUTABLE.

## Limpieza

Al terminar he borrado `reports/`. `.stryker-tmp/` no quedó: Stryker limpió su sandbox.
