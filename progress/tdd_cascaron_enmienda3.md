# TDD — F-04 `cascaron_semantico`, ENMIENDA 3 (@s41) — 2026-09-28

> Autor: `tdd_craftsman`. Contrato: `features/cascaron_semantico.feature` (banner «ENMIENDA 3» y
> escenario @s41, línea 1683), `project-spec.md` §Feature 4 → «Enmienda 3 (2026-09-28)». Precedente:
> `progress/tdd_cascaron_enmienda2.md` y su review `progress/judge_cascaron_enmienda2.md` (APPROVED).
> El contrato no lo he cambiado: se puede cumplir tal cual.
>
> Precondición: F-04 sigue `done` en `feature_list.json` y NO se toca (mismo patrón que las ENMIENDAS
> 1 y 2). Mientras trabajaba, el lead hizo el commit `9f36f5d` (10:19) con los contratos de las
> ENMIENDAS 3 y 4. Comprobé que @s41 es idéntico al que había leído. La ENMIENDA 4 (@s42-@s44) no es
> de esta sesión.

## Estado: VERDE

| Fichero                           | Cambio                                                                                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/horneado.ts`             | NUEVA `sinPrecargasDeFuenteWoff(html)` (@s41). Helper común `sinLinksQue` para las dos funciones. Cabecera actualizada para @s41 con el límite de las comillas dobles (nit del judge) |
| `src/lib/horneado.test.ts`        | 9 tests unitarios nuevos (bucle interno de @s41). Los 8 de @s40 no cambian                                                                                                            |
| `src/pages/home-horneado.test.ts` | 3 tests sobre los bytes de `dist/index.html` y del CSS de `dist/assets/`, más sus extracciones. Cabecera actualizada a @s39-@s41. El `beforeAll` y el `execSync` no se tocan          |
| `vite.config.ts`                  | `onPageRendered` compone las dos funciones puras (una línea). Comentario de @s41                                                                                                      |
| `progress/current.md`             | Nota de arranque y resultado                                                                                                                                                          |

No toco `stryker.config.json`: `src/lib/horneado.ts` ya estaba en `mutate`. Tampoco toco el CSS ni los
`@font-face`: el `.woff` sigue de respaldo.

## Trazabilidad

- **@s41**, solo precargas de fuente `.woff2` y el CSS conserva el `.woff`:
  - 1er `Then` (ancla, hay precargas `as="font"` hacia `.woff2`) → `src/pages/home-horneado.test.ts:307`.
  - 2º `Then` (ancla, algún `@font-face` lleva `url(….woff) format("woff")`) → `src/pages/home-horneado.test.ts:312`.
  - 3er `Then` (0 precargas `as="font"` hacia `.woff`, en cualquier orden y caja) → `src/pages/home-horneado.test.ts:319`.
  - Lógica mutable que lo hace cumplir → `src/lib/horneado.test.ts:72, 79, 87, 95, 101, 107, 113, 119, 125`.
- **@s40** sigue cubierto como en la ENMIENDA 2: `src/pages/home-horneado.test.ts:236, 241, 248` y
  `src/lib/horneado.test.ts:14-60`. Su ancla `as="font"` sigue viva: quedan 6 precargas `.woff2`.

Cómo encajan los tres tests de bytes con lo que pide el contrato:

- Reutilizan el `pnpm build` del `beforeAll`. No hay build nuevo ni jsdom, y el fichero sigue sin
  importar nada de `src/lib/`.
- El 1er ancla y la negativa comparten la extracción `precargasDeFuenteHacia(extension)`, que es la
  `precargasDe('font')` de @s40 más el `href`.
- El 2º ancla y la negativa comparten el criterio `terminaEn(url, '.woff')`: el final del valor, sin
  distinguir mayúsculas.
- Los literales están escritos a mano: `'font'`, `'preload'` (el de @s40), `'.woff2'`, `'.woff'`,
  `'.css'`, `'dist/assets'`, `@font-face` y `format("woff")`. Nada se lee del manifiesto de Vite, de
  `@fontsource/*`, de `horneado.ts` ni de la lista de pares de F-05.

## Ciclos Rojo → Verde → Refactor

Línea base: `pnpm exec vitest run src/lib/horneado.test.ts src/pages/home-horneado.test.ts` →
23/23 en verde (~9 s, build incluido).

### Bucle externo (bytes del artefacto)

**Ciclo 1, 1er ancla (`:307`).** Escribí `terminaEn`, `precargasDeFuenteHacia` y este único test. Nace
VERDE, como exige el contrato («con sus dos anclas ya en verde»). Para probar que no es vacía, saboteé
EN EL TEST la lectura del `href` (`link.get('data-href')`):
`AssertionError: expected 0 to be greater than or equal to 1`. Restaurado.

**Ciclo 2, 2º ancla (`:312`).** Añadí `hojasDeEstilo`, `REGLA_FONT_FACE`, `URL_CON_FORMATO_WOFF`,
`respaldosWoffDelCss` y este test. Nace VERDE. Hice cuatro sabotajes en el test, restaurando desde una
copia tras cada uno. Los cuatro dieron ROJO con `expected 0 to be greater than or equal to 1`:

| Sabotaje (en el test)                                                         | Qué forma de pasar en vacío cierra                                                            |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| filtrar `.scss` en vez de `.css` (no se encuentra ningún CSS)                 | «cae si no se encuentra ningún `.css` en `dist/assets/`»                                      |
| la extracción de `url(…)` solo acepta URL con comillas (`(?!)` en la 3ª rama) | «exigiera comillas»: la URL de hoy va sin comillas                                            |
| `format('woff')` con comillas simples                                         | el literal `format("woff")` falla CERRADO si cambian sus comillas                             |
| `terminaEn` con `toUpperCase()` (compara con mayúsculas)                      | «comparase con mayúsculas». Caen los DOS anclas, porque comparten el criterio con la negativa |

**Ciclo 3, negativa (`:319`).** ROJO sobre el artefacto de HEAD, con los 6 `href`:

```
AssertionError: expected [ …(6) ] to deeply equal []
- []
+ [
+   "/NailsLashStudioWeb/assets/manrope-latin-400-normal-8tf8FM3T.woff",
+   "/NailsLashStudioWeb/assets/manrope-latin-500-normal-DMZssgOp.woff",
+   "/NailsLashStudioWeb/assets/manrope-latin-600-normal-BqgrALkZ.woff",
+   "/NailsLashStudioWeb/assets/manrope-latin-700-normal-DGRFkw-m.woff",
+   "/NailsLashStudioWeb/assets/gilda-display-latin-400-normal-PMqH6bj4.woff",
+   "/NailsLashStudioWeb/assets/great-vibes-latin-400-normal-BAZ173uY.woff",
+ ]
 ❯ src/pages/home-horneado.test.ts:322:45
```

Aquí entré en el bucle interno (abajo). Con `sinPrecargasDeFuenteWoff` en verde, el VERDE externo
necesitó una sola línea de producción en `vite.config.ts`:
`onPageRendered: (_ruta, html) => sinPrecargasDeFuenteWoff(sinPrecargasDeImagen(html))`.
Resultado: 35/35 en los dos ficheros. Artefacto: 6 precargas `as="font"`, todas `.woff2`.

**La composición está vigilada por las dos mitades.** Saboteé `vite.config.ts` dejando solo
`sinPrecargasDeFuenteWoff(html)` y cayó @s40 (`:248`) con
`AssertionError: expected [ …(13) ] to deeply equal []`. La otra mitad ya la demuestra el ROJO del
ciclo 3. Restaurado.

### Bucle interno (`src/lib/horneado.ts`, un test a la vez)

| #   | Test (`horneado.test.ts`)                                  | ROJO observado                                                                           | VERDE mínimo                                                                              |
| --- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| u9  | `:72` forma exacta de vite-react-ssg (con el `type` falso) | `TypeError: sinPrecargasDeFuenteWoff is not a function` (no importar cuenta como fallar) | `html.replace(/<link[^>]*>/, '')`                                                         |
| u10 | `:79` TODAS, no solo la primera                            | `expected '<head><link rel="preload" as="font" t…' to be '<head></head>'`                | `ETIQUETA_LINK`, la regex global que ya existía                                           |
| u11 | `:87` la `.woff2` y el `stylesheet` se quedan              | `expected '<head></head>' to be '<head><link rel="stylesheet" crossori…'`                | _replacer_ que solo retira si `/\.woff"/` (la comilla de cierre marca el final del valor) |
| u12 | `:95` `data-href="/f.woff"` detrás de `href="/f.woff2"`    | `expected '<head></head>' to be '<head><link rel="preload" as="font" d…'`                | `HREF_WOFF = /\shref="[^"]*\.woff"/`                                                      |
| u13 | `:101` `as="fetch"` hacia un `.woff` se queda              | `expected '<head></head>' to be '<head><link rel="preload" as="fetch" …'`                | `AS_FONT = /as="font"/` && `HREF_WOFF`                                                    |
| u14 | `:107` `data-as="font"` en un `as="fetch"`                 | `expected '<head></head>' to be '<head><link rel="preload" data-as="fo…'`                | `\s` delante de `as=`                                                                     |
| u15 | `:113` `rel="prefetch" as="font"` hacia `.woff` se queda   | `expected '<head></head>' to be '<head><link rel="prefetch" as="font" …'`                | `REL_PRELOAD`, la constante de @s40 que ya existía (trae su `\s` y su `i`)                |
| u16 | `:119` mayúsculas, `.WOFF` incluido                        | `expected '<head><LINK REL="PRELOAD" AS="FONT" H…' to be '<head></head>'`                | flag `i` en `AS_FONT` y `HREF_WOFF`                                                       |
| u17 | `:125` cualquier orden de atributos                        | **nació VERDE** (ver abajo)                                                              | ninguno                                                                                   |

**u17 nació verde, y lo declaro.** Desde u13 cada condición es una regex independiente, así que el orden
ya daba igual. Para conseguir un ROJO habría tenido que inventar en u15 una pareja contigua
`rel="preload" as="font"` en lugar de reutilizar `REL_PRELOAD`, que ya existía. Eso habría sido teatro,
no el mínimo real. Escribí el test igualmente, porque el contrato pide expresamente ese fixture, y
comprobé que muerde saboteando la PRODUCCIÓN con un criterio dependiente del orden (la forma exacta de
vite-react-ssg en una sola regex, `/\srel="preload" as="font"[^>]*\shref="[^"]*\.woff"/i`). Cayó SOLO
u17: `expected '<head><link href="/f.woff" crossorigi…' to be '<head></head>'`, con 16/17 en verde.
Restaurado.

**No escribí un test `data-rel="preload"` para fuentes.** Nacería verde: `REL_PRELOAD` es la misma
constante de @s40, y su `\s` ya lo fija u8 (y Stryker lo mata con u1).

**REFACTOR (en verde, 17/17 tras cada paso):**

1. Extraje el predicado `esPrecargaDeFuenteWoff` y el helper `sinLinksQue(sobra, html)`. Las dos
   funciones exportadas repetían el mismo `replace` con _replacer_, y ahora son una línea cada una.
2. Actualicé la cabecera de `horneado.ts` para @s40 y @s41 y añadí el **nit del judge**: «LÍMITE
   DECLARADO: solo se reconoce la forma `nombre="valor"` con comillas DOBLES, la que emite
   `jsdom.serialize()` …; la cazaría el test de bytes del artefacto real». Añadí también un comentario
   de una línea sobre `HREF_WOFF` que explica el porqué de la comilla de cierre.
3. **Reforcé el fixture de u12.** El `data-href` iba DELANTE del `href` y ahora va DETRÁS. Sigue
   exigiendo el `\s`, y en su ciclo habría dado el mismo ROJO (con `/\.woff"/` también se retiraba).
   Además caza que `[^"]*` degenere en `.*`, es decir, que se busque «algo después del `href` que
   termine en `.woff`» en vez del final del VALOR del `href`.
4. `prettier --write` sobre `horneado.test.ts`: solo partió una línea larga de u17.

**Mutaciones a mano** (Stryker no muta flags). Cada una deja al menos un test en ROJO y restauré tras
cada una:

| Mutación a mano                              | Test que la mata |
| -------------------------------------------- | ---------------- |
| sin `\s` ante `href`                         | u12              |
| `[^"]*` → `.*` en `HREF_WOFF`                | u12              |
| `HREF_WOFF` → `/\.woff"/i` (cualquier valor) | u12              |
| sin la comilla de cierre (subcadena)         | u11 y u12        |
| sin `i` en `HREF_WOFF`                       | u16              |
| sin `i` en `AS_FONT`                         | u16              |
| sin `\s` ante `as`                           | u14              |
| sin `g` en `ETIQUETA_LINK`                   | u2 (@s40) y u10  |
| sin `REL_PRELOAD` en el predicado de fuentes | u15              |

## Decisiones y su porqué

1. **Una función NUEVA, compuesta en `onPageRendered`, en vez de ampliar `sinPrecargasDeImagen`.**
   - Son dos decisiones distintas con dos orígenes distintos: @s40 fue autonomía delegada y @s41 una
     decisión del humano. Con una función cada una, cada nombre dice exactamente qué retira.
   - No hay que renombrar nada, así que @s40, sus 8 tests y su cableado quedan intactos.
   - El coste es una composición en `vite.config.ts`, fuera de `mutate`. La vigilan los dos tests de
     bytes: quitar cualquiera de las dos mitades deja en ROJO su escenario, y lo he medido en los dos
     sentidos.
   - Descarté `sinPrecargasInutiles` y parecidos: el nombre ya no diría qué sale.
2. **«Termina en `.woff`» en la función pura = `\.woff"` dentro del valor de `href`.** La comilla de
   cierre fija el final del valor, así que `x.woff2` no casa y un hash que contenga «woff» tampoco. Es
   el mismo criterio que el contrato exige al test. La forma solo de comillas dobles es el límite
   declarado en la cabecera.
3. **El 2º ancla busca `url(…) format("woff")` en todo el cuerpo del `@font-face`, sin aislar antes el
   descriptor `src`.**
   - En un `@font-face` solo `src` admite `url(…)` (CSS Fonts 4), así que el resultado es el mismo.
   - Me ahorro un paso que podía fallar: aislar `src` con `[^;]*` lo cortaría en el primer `;` de un
     `data:font/woff2;base64,…`, y eso pasa si una fuente adelgaza por debajo del límite de inlining
     que documenta F-05.
   - Está anotado en el comentario de `URL_CON_FORMATO_WOFF`.
4. **El CSS se lee bajo demanda (`hojasDeEstilo()`) y no en el `beforeAll`.** Así el `beforeAll`, y con
   él la forma de lanzar el build, quedan intactos, como pedía el lead de cara a la ENMIENDA 4. El
   helper corre después del `beforeAll`, sobre el mismo `dist/`. Si `dist/assets` no existiera,
   `readdirSync` lanzaría ENOENT y el test caería en ROJO, nunca en verde.
5. **El número de precargas no se fija en ningún test de bytes** (hoy son 6): la lista de fuentes es de
   F-05. Los tests unitarios sí mencionan «el artefacto de HEAD lleva 6», pero solo en el nombre, como
   hacía @s40 con «lleva 13».

## Resultados de la verificación final

- `pnpm typecheck` → exit 0. `pnpm lint` → exit 0, sin avisos.
- `pnpm exec prettier --check`: `src/lib/horneado.ts`, `src/lib/horneado.test.ts`,
  `src/pages/home-horneado.test.ts`, `vite.config.ts`, `progress/current.md` y este diario pasan.
- `bin/harness init` → **exit 0**: lint OK, **47/47 ficheros y 1507/1507 tests** (1495 + 9 unitarios +
  3 de bytes).
- `pnpm build` directo → **exit 0** con las 5 puertas en ✓ (cascarón, placeholders, contraste, terceros
  con «hornea los 6 pares de fuente», y anclas). En `dist/index.html` (producción, `app-CWmDYxle.js`,
  módulo sin `async`):
  - **6 `<link rel="preload" as="font">`, las 6 hacia `.woff2`, 0 hacia `.woff`**;
  - 0 `<link rel="preload" as="image">`.
  - El CSS **conserva** 6 `@font-face` con 6 `format("woff2")` y 6 `format("woff")`: el respaldo sigue.
  - **`dist/` NO queda en producción, y no por mí.** A las 10:55:58, después de mi build y mientras yo
    solo ejecutaba prettier, otro proceso (otro agente o el lead, con un `*-horneado` en paralelo)
    reescribió `dist/` con un build de vitest (`app-C6U4pjd1.js`, `NODE_ENV=test`). No lo he
    reconstruido para no pisarle el `dist/` compartido a mitad de su test. Sobre ESE artefacto, @s41
    también se cumple: 6 precargas `as="font"`, 6 hacia `.woff2`, 0 hacia `.woff`, y 6
    `format("woff")` en el CSS. Quien necesite el artefacto de producción (la sonda en vivo, p. ej.)
    tiene que lanzar `pnpm build` directo.
- Mutación, `pnpm exec stryker run --mutate src/lib/horneado.ts` → **100 %**: 23 muertos, 0 timeouts,
  0 supervivientes, 0 sin cobertura, 17 tests en el dry run y 11 s. No hubo timeouts, así que no hizo
  falta re-medir con `--concurrency 1`. Mutantes:
  - Regex ×8:
    - `ETIQUETA_LINK` `[>]*` y `[^>]` (u1).
    - `\S` en `REL_PRELOAD` y en `AS_IMAGE` (u1).
    - `\S` en `AS_FONT` (u9).
    - En `HREF_WOFF`: `\S`, `[^"]` y `["]*` (u9).
  - `esPrecargaDeImagen` ×4: Block (u1), `true` (u3), `false` (u1) y `&&`→`||` (u3).
  - `esPrecargaDeFuenteWoff` ×6:
    - Block (u9), `true` (u11), `false` (u9).
    - `(A&&B)||C` (u11), `A&&B`→`true` (u13) y `A||B` (u13).
  - `sinLinksQue` ×3: Block (u1), ArrowFunction (u1) y StringLiteral `''`→`"Stryker was here!"` (u1).
  - Block de cada función exportada ×2 (u1 y u9).

## Observado, fuera del alcance (para el lead)

- **Los builds de vitest siguen heredando `NODE_ENV=test`** (el punto 4 del judge de la ENMIENDA 2). Lo
  que mira @s41 (el HTML y el CSS) no depende del modo: lo he medido sobre los dos artefactos, el de
  producción y el de vitest. Lo resuelve la ENMIENDA 4, que no he tocado.
- **Manrope 500** se sigue precargando (su `.woff2`). El contrato lo deja fuera de alcance: es de F-05.
- **Las 6 precargas `.woff2` siguen con `type="font/woff2"` y `crossorigin=""`.** Es correcto, y el
  contrato ni lo exige ni lo prohíbe.

No he tocado: `feature_list.json`, nada de Nailbot, el `.feature`, `project-spec.md` ni
`stryker.config.json`. No he hecho ningún commit.
