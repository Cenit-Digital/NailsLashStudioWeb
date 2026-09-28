# TDD — F-04 `cascaron_semantico`, ENMIENDA 2 (@s39, @s40) — 2026-09-28

> Autor: `tdd_craftsman`. Contrato: `features/cascaron_semantico.feature` (banner «ENMIENDA 2» y
> escenarios @s39/@s40 al final), `project-spec.md` §Feature 4 → «Enmienda 2 (2026-09-28)», evidencia
> en `progress/hallazgo_hidratacion_ssg.md`. No he cambiado el contrato: es satisfacible tal cual.
>
> Precondición: F-04 sigue `done` en `feature_list.json` y NO se toca. Es el mismo patrón que la
> ENMIENDA 1: amplía el contrato sin reabrir el ciclo, y el propio banner lo declara. El lead me
> lanzó con esa autonomía delegada.

## Estado: VERDE

| Fichero                           | Cambio                                                                                                                                                      |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vite.config.ts`                  | retirado `ssgOptions.script: 'async'` (@s39); añadido `onPageRendered` que llama a `sinPrecargasDeImagen` (@s40); comentario con el porqué de las dos cosas |
| `src/lib/horneado.ts`             | NUEVO: `sinPrecargasDeImagen(html)`, una función pura (@s40)                                                                                                |
| `src/lib/horneado.test.ts`        | NUEVO: 8 tests unitarios (bucle interno de @s40)                                                                                                            |
| `src/pages/home-horneado.test.ts` | 5 tests sobre los bytes de `dist/index.html` (@s39 ×2, @s40 ×3), extracción de elementos a mano y cabecera actualizada                                      |
| `stryker.config.json`             | `src/lib/horneado.ts` añadido a la lista explícita `mutate`                                                                                                 |

## Trazabilidad

- **@s39**, módulo del bundle SIN `async`:
  - 1er `Then` (ancla) → `src/pages/home-horneado.test.ts:210`, «@s39 ANCLA POSITIVA: hay exactamente 1 `<script type="module">` con src "/NailsLashStudioWeb/assets/….js"».
  - 2º `Then` → `src/pages/home-horneado.test.ts:215`, «@s39 ese elemento NO lleva el atributo async en ninguna forma … ni caja».
- **@s40**, cero `<link rel="preload" as="image">`:
  - 1er `Then` (ancla `as="font"`) → `src/pages/home-horneado.test.ts:236`.
  - 2º `Then` (ancla `<img loading="lazy">`) → `src/pages/home-horneado.test.ts:241`.
  - 3er `Then` (0 de imagen, en cualquier orden y caja) → `src/pages/home-horneado.test.ts:248`.
  - Lógica mutable que lo hace cumplir → `src/lib/horneado.test.ts:14, 20, 28, 36, 42, 48, 54, 60`.

Los 5 tests de bytes reutilizan el `pnpm build` que ya corre el `beforeAll` del fichero (no hay build
nuevo ni jsdom), y el fichero sigue sin importar nada de `src/lib/`. Literales a mano: `"module"`,
`"/NailsLashStudioWeb/assets/"`, `".js"`, `"async"`, `"preload"`, `"font"`, `"image"`, `"lazy"`.
Nada se lee de `vite.config.ts` ni se deduce de `ssgOptions`.

## Ciclos Rojo → Verde → Refactor

Primero una línea base: `pnpm exec vitest run src/pages/home-horneado.test.ts` → 10/10 en verde
(~8 s por corrida, build incluido).

### @s39

**Ciclo 1, ancla positiva (`:210`).** Escribí la extracción a mano (`atributosDe`, `elementos`,
`valorDe`, `modulosDelBundle`) y solo el test del ancla. Nace VERDE, que es lo que exige el contrato
(«nacen en ROJO … con sus anclas ya en verde»). Como un test que pasa a la primera no demuestra nada,
comprobé que no pasa en vacío saboteando el literal esperado en el test (no en producción):
`'/OtroSitio/assets/'` →
`AssertionError: expected [] to have a length of 1 but got +0`. Luego lo restauré.

**Ciclo 2, negativa (`:215`).** ROJO sobre el artefacto de HEAD:

```
× @s39 ese elemento NO lleva el atributo async en ninguna forma (async, async="", async="async") ni caja
AssertionError: expected [ Array(4) ] to not include 'async'
 ❯ src/pages/home-horneado.test.ts:219:36
```

(las 4 claves: `type`, `async`, `crossorigin`, `src`; el HTML era
`<script type="module" async="" crossorigin="" src="/NailsLashStudioWeb/assets/app-C6U4pjd1.js">`).
VERDE mínimo: quité la línea `script: 'async'` de `vite.config.ts`, así que vuelve el valor por
defecto de la librería, `'sync'`, que no añade ningún atributo (`rewriteScripts`). Resultado: 12/12,
incluido @s14 de F-10 (build con exit 0 y las 5 puertas). El bundle sale con el MISMO hash
(`app-C6U4pjd1.js`): solo cambia el atributo, como decía el hallazgo. REFACTOR: el porqué quedó en el
comentario de `vite.config.ts` (cita de §4.12.1, cifras y remisión al hallazgo). No había nada más que
limpiar.

### @s40, bucle externo (bytes del artefacto)

**Ciclo 3, ancla `as="font"` (`:236`).** Nace VERDE (lo que pide el contrato). Para probar que no es
vacía, saboteé la extracción (`rel === 'prefetch'`) →
`AssertionError: expected 0 to be greater than or equal to 1`. Restaurado.

**Ciclo 4, ancla `<img loading="lazy">` (`:241`).** Nace VERDE. Sabotaje (`=== 'eager'`) →
`AssertionError: expected 0 to be greater than or equal to 1`. Restaurado.

**Ciclo 5, negativa (`:248`).** ROJO con los 13 href:

```
- []
+ [
+   "/NailsLashStudioWeb/assets/equipo-nail-art-rojo-D-scHKME.jpg",
    … (7 de #equipo + 6 de la galería)
+   "/NailsLashStudioWeb/assets/galeria-coral-lazo-B9Bjn85z.jpg",
+ ]
 ❯ src/pages/home-horneado.test.ts:252:22
```

Aquí entro en el bucle interno (abajo). Con `sinPrecargasDeImagen` en verde, el VERDE externo
necesitó una sola línea de producción en `vite.config.ts`:
`onPageRendered: (_ruta, html) => sinPrecargasDeImagen(html)`. Resultado: 15/15. Artefacto:
0 `as="image"`, 12 `as="font"`, 13 `<img loading="lazy">`.

### @s40, bucle interno (`src/lib/horneado.ts`, un test a la vez)

| #   | Test (`horneado.test.ts`)                       | ROJO observado                                                            | VERDE mínimo                                                                                        |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| u1  | `:14` retira la forma exacta de vite-react-ssg  | `Failed to resolve import "./horneado"` (no importar cuenta como fallar)  | `html.replace(/<link[^>]*>/, '')`                                                                   |
| u2  | `:20` retira TODAS, no solo la primera          | `expected '<head><link rel="preload" as="image" …' to be '<head></head>'` | flag `g`                                                                                            |
| u3  | `:28` deja intactas la fuente y el `stylesheet` | `expected '<head></head>' to be '<head><link rel="stylesheet" crossori…'` | `/<link[^>]*as="image"[^>]*>/g`                                                                     |
| u4  | `:36` `rel="prefetch" as="image"` se queda      | `expected '<head></head>' to be '<head><link rel="prefetch" as="image"…'` | `/<link[^>]*rel="preload" as="image"[^>]*>/g` (pareja contigua)                                     |
| u5  | `:42` cualquier orden de atributos              | `expected '<head><link as="image" href="/a.jpg" …' to be '<head></head>'` | cada `<link>` se decide por dos pruebas independientes (`REL_PRELOAD`, `AS_IMAGE`) en un _replacer_ |
| u6  | `:48` sin distinguir mayúsculas                 | `expected '<head><LINK REL="PRELOAD" AS="IMAGE" …' to be '<head></head>'` | flag `i` en las tres regex                                                                          |
| u7  | `:54` `data-as="image"` no es `as`              | `expected '<head></head>' to be '<head><link rel="preload" data-as="im…'` | `\s` delante de `as=`                                                                               |
| u8  | `:60` `data-rel="preload"` no es `rel`          | `expected '<head></head>' to be '<head><link data-rel="preload" rel="p…'` | `\s` delante de `rel=`                                                                              |

REFACTOR en verde: una cabecera con el porqué (librería 0.9.0 sin opción, `lazy` sin `crossorigin`,
dónde se cablea y qué NO sale), sin cambiar el comportamiento. 8/8 tras el refactor.

## Decisiones y su porqué

1. **@s39: se retira la opción, no se cambia a `'defer'`.** La norma dice que `defer` «has no effect
   on module scripts», así que ponerlo sería añadir un atributo inerte. Retirar la línea deja el
   comportamiento por defecto de la librería (`'sync'`), que es justo lo que se midió en el hallazgo
   (0 de 48 cargas rotas). El test no exige ni prohíbe `defer`, igual que el contrato.
2. **@s40: `onPageRendered` más una función pura en `src/lib/`.** Es el único punto donde se puede
   corregir: la librería inyecta las precargas en jsdom (`renderPreloadLinks`,
   `vite-react-ssg.DsKK_1op.mjs:903`), serializa y llama a `onPageRendered` justo antes de escribir el
   fichero (`:905`), y lo hace en todas las rutas (sirve también para las de F-16).
   Alternativas que descarté:
   - `onBeforePageRender`: llega antes de la inyección, así que no ve las precargas.
   - Un paso más en `pnpm build` que reescribiera `dist/`: el build no se puede corregir después de
     que el SSG ya ha escrito el artefacto.
   - La regex directamente en `vite.config.ts`: sería lógica sin tests unitarios y fuera de la
     mutación.
   - Añadir `crossorigin` a los `<img>`: el contrato lo prohíbe expresamente.
3. **Hay dos extracciones distintas, y es a propósito.** El test de bytes no puede importar
   `src/lib/`, porque Stryker lo relanzaría por cada mutante y cada vez haría un build. Además, un
   esperado sacado de producción no vigila nada (anti-tautología). Por eso el test tiene su propio
   parser de atributos, más general: acepta comillas dobles, simples o ninguna, atributos sin valor, y
   si un nombre se repite gana el primero. Lo comprobé en el scratchpad con `async`, `async=""`,
   `ASYNC="async"`, `TYPE='MODULE'`, valores sin comillas, un hash `app-async.js`, `data-as` y
   `<linkx>`. La función de producción solo reconoce `nombre="valor"` con comillas dobles, que es lo
   que emite `jsdom.serialize()` justo antes de `onPageRendered`. **Es un límite declarado:** si algún
   día apareciera una precarga de imagen con otras comillas, la función no la quitaría, pero el test de
   bytes (`:248`) lo cazaría sobre el artefacto real.
4. **Nota sobre el banner de la ENMIENDA 2.** El banner (y `project-spec.md`, línea ~1293) dicen
   «NO-MUTABLE … la corrección vive en `vite.config.ts`». Eso sigue siendo cierto para lo que queda en
   `vite.config.ts`: la retirada de `script` y una línea de cableado. Pero la lógica de @s40 ahora vive
   en un fichero mutable y está mutada al 100 %. Es más estricto que el contrato, no lo contradice, y
   no he tocado el contrato. El lead o el `judge` pueden decidir si matizan esa frase.
5. **Nombre del fichero de test.** `src/lib/horneado.test.ts` no casa con la exclusión
   `**/*-horneado.test.{ts,tsx}` de `vitest.stryker.config.ts`, porque le falta el guion. Por eso
   Stryker sí lo ejecuta (8 tests en el dry run).
6. **`vite.config.ts` se sigue leyendo como TEXTO en la puerta 4** (`baseDeclarada`, regex
   `\bbase:`). Los comentarios nuevos no contienen `base:`, y la única declaración sigue siendo la de la
   línea 31. Lo comprobé ejecutando `baseDeclarada(readFileSync('vite.config.ts'))`, que devuelve
   `"/NailsLashStudioWeb/"`, y con la puerta de terceros en verde en `pnpm build`.

## Resultados de la verificación final

- `pnpm typecheck` → exit 0. `pnpm lint` → exit 0, sin avisos.
- `pnpm exec prettier --check`: `vite.config.ts`, `src/lib/horneado.ts`, `src/lib/horneado.test.ts` y
  `src/pages/home-horneado.test.ts` pasan. `stryker.config.json` falla, pero ya fallaba en HEAD
  (comprobado con `git show HEAD:stryker.config.json | prettier --check`), igual que otros 197
  ficheros del repo. Mi línea sigue el estilo del fichero y no lo he reformateado para no meter ruido.
- `bin/harness init` → **exit 0**: 47/47 ficheros de test, 1495/1495 tests, lint OK, sin avisos.
- `pnpm build` → **exit 0** con las 5 puertas (cascarón, placeholders, contraste, terceros y anclas).
  En `dist/index.html`: `<script type="module" crossorigin="" src="/NailsLashStudioWeb/assets/app-CWmDYxle.js">`
  (sin `async`), 0 `<link … as="image">`, 12 `<link rel="preload" as="font">` y 13
  `<img loading="lazy">`.
- Mutación: `pnpm exec stryker run --mutate src/lib/horneado.ts` → **100 %**, 11 muertos, 0 timeouts,
  0 supervivientes, 0 sin cobertura (umbral 100 superado). Como no hubo ningún timeout, no hizo falta
  re-medir con `--concurrency 1`. Mutantes: LogicalOperator `&&`→`||` (lo mata u3);
  ConditionalExpression `true` (u3) y `false` (u1); BlockStatement ×2 (u1); StringLiteral `''`→
  `"Stryker was here!"` (u1); ArrowFunction (u1); Regex `[^>]*`→`[>]*` y `[^>]*`→`[^>]` (u1);
  Regex `\s`→`\S` en `rel` y en `as` (u1).

## Observado, fuera del alcance (para el lead)

- **El build que lanza vitest no es exactamente el de producción.** `execSync('pnpm build')` dentro
  de vitest hereda `NODE_ENV=test`, y vite-react-ssg usa `process.env.NODE_ENV` como `mode`. Por eso
  el bundle sale con otro hash: `app-C6U4pjd1.js` desde vitest (lo reproduje con
  `NODE_ENV=test pnpm exec vite-react-ssg build`) frente a `app-CWmDYxle.js` con `pnpm build` directo.
  En lo que miran @s39/@s40 los dos artefactos coinciden: los dos sin `async` y con 0 precargas de
  imagen (medido en ambos). No he investigado qué más cambia entre modos. Es preexistente y afecta a
  todos los `*-horneado.test.*`.
- **Falta la sonda de hidratación en vivo.** La spec la pide repetida con más cargas y tiene que dar 0.
  No la he corrido porque necesita el navegador del lead. `dist/` queda construido con `pnpm build` de
  producción.
- **Tipo de las fuentes `.woff`.** Las 6 precargas que apuntan a un `.woff` declaran
  `type="font/woff2"`. Es de F-05 y ya está anotado en el banner.
- **Commit del lead.** Mi nota de arranque en `progress/current.md` entró en el commit `be96477` del
  lead (08:45), hecho mientras yo trabajaba. Yo no he hecho ningún commit.

No he tocado: `feature_list.json`, nada de Nailbot, el `.feature` ni `project-spec.md`.
