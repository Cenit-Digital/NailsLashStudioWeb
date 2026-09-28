# Review — feature F-04 `cascaron_semantico`, ENMIENDA 2 (@s39, @s40)

**Veredicto:** APPROVED

> Revisado: el commit `95e701e` en HEAD (`vite.config.ts`, `src/lib/horneado.ts`, `src/lib/horneado.test.ts`,
> `src/pages/home-horneado.test.ts` y `stryker.config.json`) contra `features/cascaron_semantico.feature`:76-119
> (banner) y :1515-1572 (@s39/@s40), `project-spec.md`:1265-1295, `progress/hallazgo_hidratacion_ssg.md` y
> `progress/tdd_cascaron_enmienda2.md`. No he editado nada del repo salvo este informe. Tuve que reconstruir
> `dist/` (ignorado por git) con `pnpm build` porque `bin/harness init` lo sobrescribe (ver punto 4).
> Toda la evidencia está en el scratchpad de la sesión, `…/scratchpad/judge2/`: `replica-horneado.test.ts`,
> `sabotear.mjs`, `resultados.txt`, `lastindex.ts`, `base.ts`, `flags/`, `init.log`, `stryker.log` y
> `build.log`.

## Cobertura de escenarios (@s ↔ test)

- @s39: [x] cubierto.
  - 1er `Then` (ancla: exactamente 1 `<script type="module">` con `src` `/NailsLashStudioWeb/assets/….js`):
    `src/pages/home-horneado.test.ts:210-213`.
  - 2º `Then` (sin `async` en ninguna forma ni caja): `src/pages/home-horneado.test.ts:215-220`.
  - Las dos usan la misma extracción, `modulosDelBundle()` (:191-201).
- @s40: [x] cubierto.
  - 1er `Then` (ancla `as="font"`): `src/pages/home-horneado.test.ts:236-239`.
  - 2º `Then` (ancla `<img loading="lazy">`): `:241-246`.
  - 3er `Then` (0 de imagen, en cualquier orden y caja): `:248-253`.
  - El ancla de fuentes y la negativa comparten `precargasDe()` (:224-228); solo cambia la constante `'font'`/`'image'`.
  - Bucle interno de la lógica mutable: `src/lib/horneado.test.ts:14, 20, 28, 36, 42, 48, 54, 60`.
- Requisitos del contrato (:1522-1533), comprobados:
  - [x] Anclas PRIMERO y con la MISMA extracción que su negativa (orden en el fichero: 210 < 215; 236, 241 < 248).
  - [x] Literales escritos a mano:
    - `'module'` (:196), `'/NailsLashStudioWeb/assets/'` (:197), `'.js'` (:198), `'async'` (:219), `'preload'` (:226), `'lazy'` (:243), `'font'` (:238) e `'image'` (:250).
    - Ninguno se lee de `vite.config.ts` ni de `ssgOptions`: `grep` de `vite.config|ssgOptions` en el test da 0 coincidencias de código.
  - [x] El test build-based no importa nada de `src/lib/`. Sus únicos imports son `node:child_process`, `node:fs`, `node:path` y `vitest` (:1-5).
  - [x] Ningún build nuevo: el único `execSync('pnpm build')` sigue siendo el del `beforeAll` que ya existía (:29). No hay ningún `*-horneado.test.*` nuevo.
  - [x] Nada de jsdom: bytes con `readFileSync` y expresiones regulares. No aparece `document`, `DOMParser` ni `JSDOM` en el fichero.
  - [x] Sin vacuidad, demostrado con sabotajes en la tabla siguiente.

### Prueba de mordida (punto 2), sin tocar el repo

Método: `replica-horneado.test.ts` es el fichero real copiado con `sed`. `diff` confirma que solo cambian
dos líneas:

- :20, la ruta: `RUTA_DIST` = `process.env.HTML_SABOTEADO`.
- :29, el build: `execSync` → no-op.

Todo lo demás es byte a byte igual: la extracción, los `it` y las aserciones. Se ejecutó con vitest
(`-t '@s(39|40)'`) sobre copias de `dist/index.html` de PRODUCCIÓN (`app-CWmDYxle.js`). `sabotear.mjs`
aborta si un sabotaje no cambia nada.

Leyenda: A39 = ancla @s39 (:210) · N39 = negativa @s39 (:215) · AF = ancla de fuentes (:236) ·
AI = ancla de img lazy (:241) · N40 = negativa @s40 (:248).

| Copia de `dist/index.html`                                            | A39 | N39 | AF  | AI  | N40 | ¿Falla la que toca?                                           |
| --------------------------------------------------------------------- | --- | --- | --- | --- | --- | ------------------------------------------------------------- |
| CONTROL (sin tocar)                                                   | ✓   | ✓   | ✓   | ✓   | ✓   | 5/5 verdes                                                    |
| **`async=""` en el módulo** (pedido)                                  | ✓   | ✗   | ✓   | ✓   | ✓   | SÍ: `expected [ Array(4) ] to not include 'async'`            |
| **`<link rel="preload" as="image">`** (pedido)                        | ✓   | ✓   | ✓   | ✓   | ✗   | SÍ: `expected [ Array(1) ] to deeply equal []`                |
| **`<LINK AS="IMAGE" HREF=… REL="PRELOAD">`** (pedido)                 | ✓   | ✓   | ✓   | ✓   | ✗   | SÍ, con otro orden y en mayúsculas                            |
| **sin ninguna precarga de fuente** (pedido)                           | ✓   | ✓   | ✗   | ✓   | ✓   | SÍ: `expected 0 to be greater than or equal to 1`             |
| **sin ningún `<img lazy>`** (pedido; las 13 `<img>` siguen)           | ✓   | ✓   | ✓   | ✗   | ✓   | SÍ: `expected 0 to be greater than or equal to 1`             |
| extra: `ASYNC` desnudo, en mayúsculas                                 | ✓   | ✗   | ✓   | ✓   | ✓   | SÍ                                                            |
| extra: `async="async"` al final de la etiqueta                        | ✓   | ✗   | ✓   | ✓   | ✓   | SÍ                                                            |
| extra: `<link as=image href='/x.jpg' rel='Preload' />`                | ✓   | ✓   | ✓   | ✓   | ✗   | SÍ: comillas simples, sin comillas, autocierre                |
| extra: sin el `<script type="module">`                                | ✗   | ✗   | ✓   | ✓   | ✓   | SÍ: el ancla falla y la negativa no pasa en vacío (TypeError) |
| extra: dos módulos del bundle                                         | ✗   | ✓   | ✓   | ✓   | ✓   | SÍ: `got 2`                                                   |
| extra: módulo con `src` `/assets/…` (sin la base)                     | ✗   | ✗   | ✓   | ✓   | ✓   | SÍ: el ancla fija la base                                     |
| extra: `loading="eager"` en todas las `<img>`                         | ✓   | ✓   | ✓   | ✗   | ✓   | SÍ                                                            |
| control de falso positivo: el hash del bundle es `app-async-image.js` | ✓   | ✓   | ✓   | ✓   | ✓   | no salta: se mira el NOMBRE del atributo, no una subcadena    |
| control: `data-as="image"` en una precarga de fuente                  | ✓   | ✓   | ✓   | ✓   | ✓   | no salta                                                      |
| control: `<link rel="prefetch" as="image">`                           | ✓   | ✓   | ✓   | ✓   | ✓   | no salta: no es una precarga                                  |

Conclusión: los cinco sabotajes pedidos hacen fallar exactamente la aserción que les toca, y solo esa.
Ninguna negativa puede pasar en vacío.

## Disciplina TDD

- ¿Producción sin test que la pida? **NO**.
  - `vite.config.ts`: retirar `script: 'async'` lo pide N39 (ROJO en el diario, :51-57). La línea `onPageRendered` (:41) la pide N40 (ROJO con los 13 href, diario :77-87).
  - Cada construcción de `src/lib/horneado.ts` la pide un test unitario rojo (diario, tabla u1-u8, :96-105).
  - `stryker.config.json:31` no es producción: es la inscripción para C7.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ**. Hay 5 ciclos externos y 8 internos, con el mensaje de cada ROJO.
  - Las tres anclas nacen verdes, como exige el contrato («nacen en ROJO … con sus anclas ya en verde»).
  - El craftsman demostró que no eran vacuas saboteando el test y lo registró en el diario (:44-49, :70-75). Mi tabla lo confirma sobre el artefacto.
  - He reproducido los dos ROJOS del bucle externo con las formas exactas del artefacto de `3c171ff`: `async=""` justo tras `type="module"` y `<link rel="preload" as="image" … crossorigin="">`.

## Calidad

- **`src/lib/horneado.ts` (25 líneas).** Es una función pura de una línea más un predicado, con nombres
  claros y sin números mágicos. La cabecera explica el porqué y es exacta:
  - vite-react-ssg 0.9.0, `renderPreloadLink` en `node_modules/vite-react-ssg/dist/shared/vite-react-ssg.DsKK_1op.mjs:179-205`, sin opción para desactivarlo.
  - `onPageRendered` recibe `jsdom.serialize()` (:903-905).
- **`lastIndex` compartido: no hay fallo.** Razonamiento y medida:
  - `REL_PRELOAD` y `AS_IMAGE` (:16-17) NO llevan `g` ni `y`. `RegExp.prototype.test` solo lee y escribe `lastIndex` con esas flags. Medido: con `lastIndex = 9999`, `test()` sigue devolviendo `true` (`lastindex.ts`).
  - `ETIQUETA_LINK` (:15) sí lleva `g`, pero solo la usa `String.prototype.replace`. `RegExp.prototype[@@replace]` pone `lastIndex = 0` antes de buscar si la regex es global, reúne todas las coincidencias y SOLO DESPUÉS llama al _replacer_. Cuando se agotan las coincidencias, `lastIndex` vuelve a 0. Medido: con `lastIndex = 9999` antes de llamar, el resultado es correcto y queda en 0.
  - El _replacer_ no reentra en `ETIQUETA_LINK`: usa las otras dos regex.
  - La función es síncrona, así que la `PQueue` de vite-react-ssg no puede intercalar dos llamadas.
  - 3000 llamadas intercaladas a la función real: 0 fallos.
  - La regresión que sí sería un fallo, añadir `g` a `REL_PRELOAD`, la matan 2 tests (u2 y u6; `flags/`).
- **Mordida más allá de Stryker.** Stryker no muta flags. Las muté a mano (`flags/`) y cada variante muere:
  - quitar `g` de `ETIQUETA_LINK` (u2);
  - quitar `i` de cada una de las tres regex (u6);
  - quitar `\s` en `rel` (u8) y en `as` (u7).
- **Ida y vuelta con el artefacto real.** Inyecté las 13 precargas tal como las serializa jsdom sobre el
  `dist/index.html` de producción. `sinPrecargasDeImagen` devuelve EXACTAMENTE ese artefacto, byte a byte,
  y es idempotente sobre él.
- **Límite de la función (no bloqueante, nit):**
  - Solo reconoce `nombre="valor"` con comillas dobles. El diario lo declara (decisión 3, :131-136) y la defensa es N40 sobre el artefacto (lo demuestra mi sabotaje de comillas simples). La cabecera de `src/lib/horneado.ts:11-13` no lo dice; bastaría una línea, «solo la forma `nombre="valor"` con comillas dobles, que es la que emite `jsdom.serialize()`».
  - `/<link[^>]*>/gi` (:15) también casa `<linkx …>`. Es inocuo, porque el predicado decide.
- **Comentario de `vite.config.ts` (:22-29 y :37-40).** Es exacto y explica un porqué no obvio: una ausencia que hay que proteger («NO lo reintroduzcas»).
  - El valor por defecto `'sync'` está verificado en `DsKK_1op.mjs:714`, y `rewriteScripts` devuelve el HTML intacto con `sync` (:970-977).
  - Las cifras cuadran con el hallazgo: «1-6 de cada 20», «0 de 48» = 20+20+8.
  - La cita de §4.12.1 es literal.
  - Su estilo es coherente con el comentario de `base` del mismo fichero.
  - `docs/research/stack-ssg-seo.md:188` y `docs/research/stack-config.md:173` ya tachan el porqué falso antiguo.
- **Puerta 4 (F-05, `baseDeclarada`, `src/lib/puerta-terceros.ts:123,202-206`) sigue viendo `base`.**
  - La regex `/\bbase:([^,\n]*)/` casa SOLO la línea 31 de `vite.config.ts`. Los comentarios nuevos no contienen `base:`, y el `` `base`: `` de la :19 no casa por el acento grave.
  - Ejecutado sobre el texto real (`base.ts`): `baseDeclarada(vite.config.ts) = "/NailsLashStudioWeb/"`.
  - `pnpm build` (`build.log`): las 5 puertas en ✓, entre ellas «Puerta de terceros … hornea los 6 pares de fuente».
- **Arquitectura.**
  - `vite.config.ts` importa una función pura de `src/lib/`. Hay precedente: `tools/puerta-cascaron.ts:24` importa `../src/lib/puerta-terceros.ts`.
  - `vite.config.ts` está en `tsconfig.json` → `include`, así que el `typecheck` lo cubre.
  - No hay dependencias nuevas.
- **Tests.**
  - El parser de atributos del test (:160-188) es más general que el de producción, a propósito, y no importa producción (anti-tautología).
  - Detalle aceptable: si la extracción del módulo queda vacía, N39 falla con `TypeError` en vez de con una aserción. Sigue siendo ROJO y no vacío, y el mensaje claro lo da A39.
- `prettier --check` pasa en los 4 ficheros de código. `tsc` y `eslint` dan 0 dentro de `bin/harness init`. No hay `console.*`, `TODO` ni `debugger` en los ficheros tocados.

### Punto 4 — `NODE_ENV=test` en los builds de vitest: NO invalida @s39/@s40

Evidencia:

- **Causa.** vitest ejecuta con `NODE_ENV=test`. `execSync('pnpm build')` lo hereda y vite-react-ssg toma
  `mode = process.env.MODE || process.env.NODE_ENV || … || "production"` (`DsKK_1op.mjs:704`).
- **El artefacto que deja el suite.** Tras `bin/harness init`, `dist/` quedó con `app-C6U4pjd1.js`,
  de 262 070 B y sin ninguna URL `react.dev/errors`: es la build de DESARROLLO de React.
- **El de producción.** `pnpm build` directo deja `app-CWmDYxle.js`, de 164 751 B y con los errores minificados de React.
- **Lo que miran @s39/@s40 no depende del modo:**
  - `rewriteScripts` (:970-977) solo depende de la opción `script`.
  - `renderPreloadLink` (:179-205) depende del manifiesto de assets.
  - `onPageRendered` (:905) se llama siempre.
- **Medido.** El `dist/index.html` de vitest y el de producción son IDÉNTICOS salvo dos cosas:
  el nombre con hash del bundle y `__VITE_REACT_SSG_HASH__`, que es `Math.random()` por build (:708) y
  también difiere entre dos builds de producción. Tamaño: 58 962 B en los dos.
- **Resultado sobre ambos artefactos:**
  - con el de vitest, el suite real da 5/5 verdes (`init.log`);
  - con el de producción, la réplica da 5/5 verdes (fila CONTROL).
- **Por qué no afecta.** La carrera de hidratación depende del JS, y ningún test de bytes la puede medir.
  Se midió en vivo con `vite preview` de `pnpm build` directo, en producción.

Consecuencias:

- **Operativa (importante para el lead).** La sonda de hidratación repetida que exige la spec (:1294-1295)
  tiene que correr DESPUÉS de un `pnpm build` directo, nunca justo tras `bin/harness init` ni `pnpm test`.
  Esos dejan en `dist/` un bundle con React de desarrollo, y la sonda mediría otro JS.
  - He dejado `dist/` reconstruido con `pnpm build` de producción (`app-CWmDYxle.js`, 5 puertas en ✓).
  - Su `index.html` solo difiere de la copia inicial en `__VITE_REACT_SSG_HASH__`.
- **Deuda PREEXISTENTE, fuera de esta enmienda.** Afecta a la frase «build REAL de producción» de todos los
  `*-horneado.test.*`. Se podría resolver en una enmienda aparte, por ejemplo con
  `execSync('pnpm build', { stdio: 'pipe', env: { ...process.env, NODE_ENV: 'production' } })`,
  con su test y midiendo el coste. No bloquea.

### Punto 5 — la frase «NO-MUTABLE» del banner: SÍ conviene matizarla

La frase dice que la corrección «vive en `vite.config.ts`», y eso ya es falso a medias: la lógica de @s40
vive en `src/lib/horneado.ts`, que está en `mutate` (`stryker.config.json:31`) y he medido al 100 %. No
invalida nada, porque el código es más estricto que el contrato. Pero un comentario del contrato que miente
sobre qué se muta puede llevar a alguien a tratar `horneado.ts` como exento del umbral. Es texto no
ejecutable y el lead lo puede editar él mismo (CLAUDE.md: `features/` y la spec cuando no cambia ningún
escenario). Texto exacto que propongo:

1. `features/cascaron_semantico.feature:116-119`, sustituir el párrafo por:

```
# MUTABILIDAD, DECLARADA (no fingida; matizada tras el TDD, 2026-09-28). La corrección tiene dos partes:
#   - NO-MUTABLE: lo que vive en `vite.config.ts` (fuera de `mutate` de `stryker.config.json`): la
#     AUSENCIA de `ssgOptions.script` (@s39) y la línea que cablea `ssgOptions.onPageRendered` (@s40).
#     @s39/@s40 se aseveran en un test build-based (`*-horneado.test.*`), excluido de la mutación por
#     `vitest.stryker.config.ts`. Su defensa es el test por bytes sobre el artefacto real, el `judge` y
#     la sonda de hidratación repetida en vivo con más cargas (tiene que dar 0).
#   - MUTABLE: la lógica de @s40, `sinPrecargasDeImagen` (`src/lib/horneado.ts`), está en `mutate` y le
#     aplica el umbral del 100 % con sus tests unitarios (`src/lib/horneado.test.ts`).
```

2. `project-spec.md:1293-1294`, sustituir «No-mutable: `vite.config.ts` no está en `mutate` y el test es
   build-based (excluido de Stryker); se declara por escrito, no se finge.» por:

```
Mutabilidad, declarada por escrito y no fingida: lo que vive en `vite.config.ts` (la ausencia de
`ssgOptions.script` y el cableado de `onPageRendered`) no es mutable —no está en `mutate` y el test de
bytes es build-based, excluido de Stryker—; la lógica de @s40 (`sinPrecargasDeImagen`,
`src/lib/horneado.ts`) sí está en `mutate` y exige el 100 %.
```

3. Opcional, en la misma pasada: `project-spec.md:1287` dice «son las 6 que exige la puerta de F-05». Son
   **12** `<link rel="preload" as="font">` (6 pares de fuente × `.woff2`/`.woff`), como dice bien la
   `.feature`:1563. Propongo «cubren los 6 pares de fuente que exige la puerta de F-05», sin fijar ningún número de `<link>`, porque la Enmienda 3 en curso lo va a cambiar (ver la nota final).

## Checkpoints

- C1: [x] los ficheros base y los docs existen · [x] `bin/harness init` → **exit 0** (1 min 30 s): lint OK, **47/47 ficheros y 1495/1495 tests**, sin avisos.
- C2: [x] una sola feature `in_progress` (F-23), y F-04 sigue `done` con el patrón de enmienda · [x] las features `done` tienen tests en verde · [x] `progress/current.md` describe la sesión activa; el bloque del 09-27 está marcado HISTÓRICO.
- C3: [x] `src/lib/horneado.ts` sigue el patrón de `src/lib/` · [x] sin dependencias nuevas · [x] sin logs ni TODOs.
- C4: [x] `horneado.ts` tiene su `horneado.test.ts` · [x] los tests usan aislamiento real: bytes del artefacto real y entradas literales, sin mocks del sistema de ficheros · [x] suite > 0 y en verde.
- C5: [x] no hay ficheros sin trackear sospechosos. `dist/` y `reports/` están en `.gitignore` y Stryker limpió su sandbox. Solo queda `M progress/current.md`, la nota del craftsman sin commitear · [ ] entrada en `progress/history.md`: la sesión sigue abierta y es del lead al cerrarla · [x] F-04 queda `done`.
- C6: [x] el `.feature` y la sección de la spec existen · [x] @s39/@s40 tagueados y con `Then` medibles · [x] mapa `@s → test` en `progress/tdd_cascaron_enmienda2.md:21-30`, con las líneas verificadas · [x] no hay producción sin test rojo.
- C7 (del `mutation_tester`; medido aquí como exige el encargo): [x] `pnpm exec stryker run --mutate src/lib/horneado.ts` da **100 %** (11 muertos, 0 timeouts, 0 supervivientes, 0 sin cobertura, 11,7 s). No hizo falta re-medir con `--concurrency 1` · [x] no hay supervivientes que documentar. Falta el informe `progress/mutation_cascaron_enmienda2.md`, que es del `mutation_tester`.

## Cambios requeridos (si aplica)

Ninguno bloqueante. Recomendados al lead, sin reabrir el TDD:

1. Matizar la frase «NO-MUTABLE» del banner (`features/cascaron_semantico.feature:116-119`) y de la spec
   (`project-spec.md:1293-1294`) con el texto exacto del punto 5. Opcional: corregir «las 6» en
   `project-spec.md:1287`.
2. Correr la sonda de hidratación repetida (spec :1294-1295; tiene que dar 0) SOLO tras un `pnpm build`
   directo, nunca tras `bin/harness init` ni `pnpm test` (punto 4). Sigue pendiente y es condición de la
   spec para dar la enmienda por cerrada.
3. Nit: añadir a la cabecera de `src/lib/horneado.ts:11-13` el límite ya declarado en el diario, que solo
   reconoce `nombre="valor"` con comillas dobles, la forma de `jsdom.serialize()`.
4. Aparte y preexistente: valorar una enmienda para que los `*-horneado.test.*` construyan con
   `NODE_ENV=production` (punto 4).

## Nota de alcance

Mientras revisaba, `project-spec.md` apareció MODIFICADO en el árbol de trabajo (mtime 09:44:59, sin
commitear) con una «Enmienda 3 (2026-09-28)» de otro agente: precargar solo `.woff2` y retirar los
`.woff` en el mismo `src/lib/horneado.ts`. NO la he escrito yo y NO entra en esta revisión, que juzga
el HEAD `95e701e`. Si la Enmienda 3 amplía `sinPrecargasDeImagen` o `horneado.ts`, necesita su
propio ciclo, su `judge` y su mutación. El ancla `as="font"` de @s40 (`home-horneado.test.ts:236`)
seguirá anclando mientras quede al menos una precarga `.woff2`.
