# Review — feature F-04 `cascaron_semantico`, ENMIENDA 3 (@s41)

**Veredicto:** APPROVED

> Revisado: el commit `704a70d` (`src/lib/horneado.ts`, `src/lib/horneado.test.ts`,
> `src/pages/home-horneado.test.ts` y `vite.config.ts`) contra `features/cascaron_semantico.feature`:131-168
> (banner ENMIENDA 3) y :1662-1712 (@s41), `project-spec.md`:1302-1329 y `progress/tdd_cascaron_enmienda3.md`.
> Precedente: `progress/judge_cascaron_enmienda2.md`. No he editado nada del repo salvo este informe.
> Todo lo he ejecutado en el worktree aislado `…/scratchpad/wt-judge3` (en `704a70d`), nunca en el repo
> principal. La evidencia está en `…/scratchpad/judge3/`: `replica-horneado.test.ts`, `sabotear.mjs`,
> `correr.sh`, `casos/`, `resultados.txt`, `idayvuelta.ts`, `mutar.mjs`, `flags/`, `flags-resultados.txt`,
> `crit/`, `crit-resultados.txt`, `base.ts`, `init.log`, `build.log` y `stryker.log`.

## Cobertura de escenarios (@s ↔ test)

- @s41: [x] cubierto.
  - 1er `Then` (ancla: al menos 1 precarga `as="font"` hacia `.woff2`): `src/pages/home-horneado.test.ts:307-310`.
  - 2º `Then` (ancla: algún `@font-face` con `url(….woff) format("woff")`): `src/pages/home-horneado.test.ts:312-317`.
  - 3er `Then` (0 precargas `as="font"` hacia `.woff`, en cualquier orden y caja): `src/pages/home-horneado.test.ts:319-323`.
  - Bucle interno de la lógica mutable: `src/lib/horneado.test.ts:72, 79, 87, 95, 101, 107, 113, 119, 125` (u9-u17).
- @s39 y @s40 siguen cubiertos y en verde: `home-horneado.test.ts:210, 215, 236, 241, 248` y `horneado.test.ts:14-60`.
  El diff de `horneado.test.ts` solo cambia el `import` de la línea 3; los 8 tests de @s40 no se tocan.
- Requisitos del contrato (`.feature`:1667-1681), comprobados:
  - [x] **Anclas primero, con la misma extracción o el mismo criterio que la negativa.** El orden en el fichero es 307 y 312, antes de 319.
    - El 1er ancla y la negativa usan la misma función, `precargasDeFuenteHacia(extension)` (:265-269). Esa función es la `precargasDe('font')` de @s40 (:224-228) más el `href`.
    - El 2º ancla y la negativa comparten el criterio `terminaEn(url, '.woff')` (:260-262).
  - [x] **Literales a mano.** Son `'font'` (:266), `'.woff2'` (:309), `'.woff'` (:297 y :322), `'.css'` (:276), `'dist/assets'` (:271), `@font-face` (:285) y `format("woff")` (:286). Ninguno se lee del manifiesto de Vite, de `@fontsource/*`, de `horneado.ts` ni de la lista de F-05.
  - [x] **El test build-based no importa `src/lib/`.** Sus únicos imports son `node:child_process`, `node:fs` (añade `readdirSync`), `node:path` y `vitest` (:1-5).
  - [x] **Ningún build nuevo.** El único `execSync('pnpm build')` sigue siendo el del `beforeAll` (:29). No hay ningún `*-horneado.test.*` nuevo (`ls src/pages/*horneado*` da los dos de siempre).
  - [x] **Nada de jsdom.** Se leen bytes con `readFileSync`/`readdirSync` y se analizan con expresiones regulares. `jsdom` solo aparece en el comentario «NUNCA jsdom» (:10).
  - [x] **Sin vacuidad.** Lo demuestran los sabotajes de la tabla siguiente.

### Prueba de mordida (punto 2), sin tocar el repo

**Método.** `replica-horneado.test.ts` es el fichero real copiado con `sed`. `diff` confirma que solo cambian
tres líneas:

- :20, `RUTA_DIST` pasa a leer `process.env.HTML_SABOTEADO`;
- :29, el `execSync` pasa a no-op;
- :271, `RUTA_ASSETS` pasa a leer `process.env.ASSETS_SABOTEADOS`.

Las extracciones, los `it` y las aserciones son byte a byte las mismas. La réplica se ejecutó con vitest
(`-t '@s(39|40|41)'`, entorno node) sobre copias del `dist/index.html` y del `dist/assets/app-Cgt1McRq.css`
de PRODUCCIÓN (el `pnpm build` directo en el worktree, con `app-CWmDYxle.js`). `sabotear.mjs` aborta si un
sabotaje no cambia nada.

Leyenda: A40f = ancla `as="font"` de @s40 (:236) · A1 = 1er ancla de @s41 (:307) · A2 = 2º ancla de @s41 (:312)
· N = negativa de @s41 (:319). En todas las filas, @s39 (2 tests), el ancla de `img` lazy y la negativa de
@s40 quedan en verde.

| Copia saboteada                                                                       | A40f | A1  | A2  | N   | ¿Falla la que toca?                                                          |
| ------------------------------------------------------------------------------------- | ---- | --- | --- | --- | ---------------------------------------------------------------------------- |
| CONTROL (sin tocar)                                                                   | ✓    | ✓   | ✓   | ✓   | 8/8 verdes                                                                   |
| **1 precarga `.woff` con la forma exacta de vite-react-ssg** (pedido)                 | ✓    | ✓   | ✓   | ✗   | SÍ: `expected [ Array(1) ] to deeply equal []`                               |
| **`<LINK HREF="/x.WOFF" AS="font" REL="preload">`** (pedido)                          | ✓    | ✓   | ✓   | ✗   | SÍ: `expected [ '/x.WOFF' ] to deeply equal []`, con otro orden y otra caja  |
| **sin precargas `.woff2`** (pedido)                                                   | ✗    | ✗   | ✓   | ✓   | SÍ, A1: `expected 0 to be greater than or equal to 1`. Cae también A40f      |
| **CSS sin ningún `format("woff")`** (pedido)                                          | ✓    | ✓   | ✗   | ✓   | SÍ, A2: `expected 0 to be greater than or equal to 1`                        |
| **`.woff2` confundible, en el CSS:** `url(….woff2) format("woff")` (pedido)           | ✓    | ✓   | ✗   | ✓   | SÍ: el criterio no toma `.woff2` por `.woff`, y el ancla cae                 |
| **`.woff2` confundible, en el HTML:** `href="/…/woff.woff-x.WOFF2"` (pedido; control) | ✓    | ✓   | ✓   | ✓   | no salta: «termina en» mira el final del valor, no una subcadena             |
| extra: `<link rel='Preload' as=FONT href=/x.woff>`                                    | ✓    | ✓   | ✓   | ✗   | SÍ, con comillas simples y sin comillas. Respalda el límite de `horneado.ts` |
| extra: `<link rel="preload" as="font" href="/x.woff" />`                              | ✓    | ✓   | ✓   | ✗   | SÍ, con autocierre                                                           |
| extra: `format('woff')` con comillas simples                                          | ✓    | ✓   | ✗   | ✓   | SÍ: falla CERRADA, como promete el contrato                                  |
| extra: ningún `.css` en `assets/`                                                     | ✓    | ✓   | ✗   | ✓   | SÍ                                                                           |
| extra: CSS sin regla `@font-face`                                                     | ✓    | ✓   | ✗   | ✓   | SÍ                                                                           |
| control: CSS con `url(….WOFF)` en mayúsculas                                          | ✓    | ✓   | ✓   | ✓   | no salta: es el mismo criterio sin distinguir mayúsculas que la negativa     |
| control: CSS con `url("….woff")` entre comillas dobles                                | ✓    | ✓   | ✓   | ✓   | no salta: la extracción acepta las tres formas de `url()`                    |
| control: `<link rel="prefetch" as="font" href="/x.woff">`                             | ✓    | ✓   | ✓   | ✓   | no salta: no es una precarga                                                 |
| control: `<link rel="preload" as="fetch" href="/x.woff">`                             | ✓    | ✓   | ✓   | ✓   | no salta: no es `as="font"`                                                  |
| control: `href="/x.woff2" data-href="/x.woff"`                                        | ✓    | ✓   | ✓   | ✓   | no salta: se mira el NOMBRE del atributo                                     |

**El criterio del propio test también falla cerrado.** Lo muté en otra copia (`crit/`) y lo ejecuté sobre el CONTROL:

- `endsWith` → `includes`: cae N, con `expected [ …(6) ] to deeply equal []`, porque los 6 `.woff2` contienen «.woff».
- `toLowerCase` → `toUpperCase`: caen A1 y A2, y N queda sin efecto.

Ninguna mutación del criterio da un falso verde.

Conclusión: cada sabotaje pedido hace fallar exactamente la aserción que le toca. Ninguna negativa puede
pasar en vacío y ningún control da un falso positivo.

### Ida y vuelta con el artefacto real (`idayvuelta.ts`)

Tomé el `dist/index.html` de PRODUCCIÓN de la ENMIENDA 2 (`judge2/prod.index.html`, con 12 precargas de
fuente) y le apliqué la función real `sinPrecargasDeFuenteWoff`. El resultado es IDÉNTICO al artefacto de
producción de `704a70d`, salvo el `__VITE_REACT_SSG_HASH__` aleatorio. También con la composición de
`vite.config.ts`. Además:

- la composición es idempotente sobre el artefacto nuevo;
- el orden de la composición da igual, porque las dos funciones retiran conjuntos disjuntos;
- el HTML pierde 826 caracteres.

Las 6 precargas `.woff2` que quedan son idénticas byte a byte a las del artefacto de la ENMIENDA 2.

## Disciplina TDD

- ¿Producción sin test que la pida? **NO**.
  - La línea `vite.config.ts:43` la pide N, en ROJO con los 6 `href` `.woff` (diario :71-85). Su otra mitad, `sinPrecargasDeImagen`, la vigila la negativa de @s40 (sabotaje del diario, :92-95).
  - Cada construcción de `horneado.ts` la pide un ROJO de u9-u16, y cada ROJO lleva su mensaje (diario, tabla :99-109).
  - `sinLinksQue` (:36-38) nace en el REFACTOR en verde: extrae el `replace` que estaba duplicado.
  - Los comentarios de `horneado.ts:1-20`, `:25` y `vite.config.ts:37-42` no son comportamiento.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ**: 3 ciclos externos y 9 internos.
  - Los dos anclas nacen verdes, como exige el contrato («con sus dos anclas ya en verde»). Su no-vacuidad está demostrada con sabotajes en el test (diario :55-69) y la confirma mi tabla.
- **u17 (`:125`, orden de atributos) nació VERDE. Está justificado:**
  - Desde u13, cada condición del predicado es una regex independiente, así que el orden de los atributos ya daba igual. Forzar un ROJO habría exigido escribir en u15 una regex contigua artificial, en vez de reutilizar `REL_PRELOAD`: un mínimo fingido.
  - El fixture lo pide expresamente el contrato («atributos en otro orden», `.feature`:1678). No añadió ni una línea de producción, así que la Ley 1 se respeta.
  - Muerde. He reproducido el sabotaje del diario (`flags/m12`): con el criterio dependiente del orden, `/\srel="preload" as="font"[^>]*\shref="[^"]*\.woff"/i`, cae SOLO u17 (16/17).
  - Además, u17 caza también una `g` metida en `HREF_WOFF` (`m11`).
  - Queda declarado en el diario, no escondido. Es un test de regresión legítimo frente a refactors, no teatro.
- **Mutaciones a mano** (Stryker no muta flags ni reescribe regex). Las muté en copias (`flags/`, `mutar.mjs`) y confirmo la tabla del diario (:139-150). Todas mueren:

| Mutación                                     | Resultado (tests que caen) |
| -------------------------------------------- | -------------------------- |
| sin `\s` ante `href`                         | 16/17: u12                 |
| `[^"]*` → `.*` en `HREF_WOFF`                | 16/17: u12                 |
| `HREF_WOFF` → `/\.woff"/i`                   | 16/17: u12                 |
| sin la comilla de cierre                     | 15/17: u11, u12            |
| `\.woff2?"` (retirar también `.woff2`)       | 15/17: u11, u12            |
| sin `i` en `HREF_WOFF`                       | 16/17: u16                 |
| sin `i` en `AS_FONT`                         | 16/17: u16                 |
| sin `\s` ante `as`                           | 16/17: u14                 |
| sin `g` en `ETIQUETA_LINK`                   | 15/17: u2, u10             |
| sin `REL_PRELOAD` en el predicado de fuentes | 16/17: u15                 |
| `g` en `AS_FONT` (arrastra `lastIndex`)      | 16/17: u10                 |
| `g` en `HREF_WOFF` (arrastra `lastIndex`)    | 15/17: u10, u17            |
| criterio dependiente del orden               | 16/17: u17                 |

## Calidad

- **`src/lib/horneado.ts` (46 líneas).** Dos funciones exportadas de una línea, sobre un helper común `sinLinksQue(sobra, html)` (:36-38) y dos predicados de una línea (:28-34).
  - Los nombres dicen exactamente qué sale: `sinPrecargasDeFuenteWoff` y `esPrecargaDeFuenteWoff`.
  - No hay números mágicos. La duplicación que había en el `replace` desapareció en el REFACTOR.
  - La decisión de crear una función nueva y componerla, en vez de ampliar `sinPrecargasDeImagen`, está razonada (diario :154-161). Deja @s40 y su cableado intactos.
- **Regex a nivel de módulo (:21-26).** Todas lo están.
  - Ninguna de las que usa `.test()` lleva `g` ni `y`, así que no comparten estado de `lastIndex`.
  - `ETIQUETA_LINK` lleva `g`, pero solo la usa `replace`, que reinicia `lastIndex` (lo razoné y medí en la ENMIENDA 2).
  - Si alguien añadiera `g` por error a `AS_FONT` o a `HREF_WOFF`, lo mata u10 (tabla anterior).
- **El comentario de `HREF_WOFF` (:25)** explica un porqué no obvio: la comilla de cierre fija el final del valor.
- **El límite de comillas dobles ya está declarado** (:17-19). Cierra el nit 3 de mi review de la ENMIENDA 2.
  - Es exacto. vite-react-ssg llama a `onPageRendered` con `jsdom.serialize()` (`node_modules/vite-react-ssg/dist/shared/vite-react-ssg.DsKK_1op.mjs:904-905`), y `renderPreloadLink` añade `rel, as, type, href, crossOrigin` en ese orden (:192-199). Esa es la forma del fixture u9.
  - Su respaldo también es real: el sabotaje `rel='Preload' as=FONT href=/x.woff` lo caza N.
- **La cabecera (:6-14) es exacta.** `renderPreloadLink` precarga CADA fichero `.woff`/`.woff2`/`.ttf` con `type: "font/woff2"` fijo y sin opción para desactivarlo (`DsKK_1op.mjs:192-199`).
- **Cableado de `vite.config.ts:43`.** `sinPrecargasDeFuenteWoff(sinPrecargasDeImagen(html))` es correcto; como las dos funciones son disjuntas, el orden da igual (medido). El comentario (:37-42) es exacto y sigue el estilo del fichero.
- **Puerta 4 (F-05, `baseDeclarada`) sigue viendo `base`.**
  - La regex `/\bbase:([^,\n]*)/` (`src/lib/puerta-terceros.ts:123`) casa SOLO la línea 31. Los comentarios nuevos no contienen `base:`.
  - Ejecutado sobre el texto real (`base.ts`): `baseDeclarada(vite.config.ts) = "/NailsLashStudioWeb/"`.
  - `pnpm build`: las 5 puertas en ✓, entre ellas «Puerta de terceros … hornea los 6 pares de fuente autohospedados esperados».
- **Tests de bytes.**
  - `respaldosWoffDelCss` (:289-298) busca `url() format("woff")` en todo el cuerpo del `@font-face` sin aislar `src`. Es equivalente, porque solo `src` admite `url()` (CSS Fonts 4), y evita el corte en el primer `;` de un `data:` en base64. Está razonado en el diario (:166-172).
  - Que el CSS se lea bajo demanda, y no en el `beforeAll`, deja intacto el lanzamiento del build de cara a la ENMIENDA 4. Si faltara `dist/assets`, `readdirSync` lanzaría y el test caería en ROJO, no en verde.
- **Estilo.** `prettier --check` pasa en los 4 ficheros de código y en el diario. `tsc` y `eslint` dan 0 dentro de `bin/harness init`. No hay `console.*`, `TODO`, `debugger`, `.only` ni `.skip`.
- **Arquitectura.** Sin dependencias nuevas. `vite.config.ts` importa una función pura de `src/lib/`, que ya tenía precedente en la ENMIENDA 2.

### Punto 4: @s39/@s40 siguen verdes y el CSS no se ha tocado

- **@s39/@s40 en verde en los dos modos.**
  - En `bin/harness init` (build de vitest, `NODE_ENV=test`), dentro de 1507/1507.
  - En la réplica sobre el artefacto de producción: fila CONTROL, 8/8.
  - Esto también muestra que @s41 no depende del modo, y es coherente con la ENMIENDA 4 pendiente.
- **El CSS no se ha tocado.**
  - `git diff 95e701e 704a70d --stat` no incluye ningún `.css`/`.scss` ni `package.json`.
  - El CSS de producción tiene el MISMO hash de contenido que el de la ENMIENDA 2: `app-Cgt1McRq.css`.
  - Tiene 6 `@font-face`, 6 `format("woff2")` y 6 `format("woff")`.
  - `dist/assets` conserva los 12 ficheros de fuente. El `.woff` sigue de respaldo.

## Checkpoints

- C1: [x] los ficheros base y los docs existen · [x] `bin/harness init` en el worktree, UNA vez → **exit 0** (1 min 50 s): lint OK, **47/47 ficheros y 1507/1507 tests**.
- C2: [x] como mucho una feature `in_progress`: F-23 en `704a70d`, y ninguna en el HEAD actual `d278666`. F-04 sigue `done` con el patrón de enmienda · [x] las features `done` tienen tests en verde · [x] `progress/current.md` describe la sesión activa.
- C3: [x] `horneado.ts` sigue el patrón de `src/lib/` · [x] sin dependencias nuevas · [x] sin logs ni TODOs.
- C4: [x] `horneado.ts` tiene su `horneado.test.ts` · [x] aislamiento real: bytes del artefacto real y fixtures literales, sin mocks del sistema de ficheros · [x] la suite es > 0 y está en verde.
- C5: [x] `git status` limpio en el worktree tras init, build y Stryker (`dist/` y `reports/` están en `.gitignore`) · [ ] entrada en `progress/history.md`: la sesión sigue abierta y le toca al lead al cerrarla (mismo criterio que en la ENMIENDA 2) · [x] F-04 queda `done`.
- C6: [x] el `.feature` (banner y @s41) y la sección de la spec existen · [x] @s41 está tagueado y sus tres `Then` son medibles · [x] mapa `@s → test` en `progress/tdd_cascaron_enmienda3.md:26-34`, con todas las líneas verificadas · [x] no hay producción sin test rojo.
- C7: lo valida el `mutation_tester`. Lo he medido aquí porque lo pide el encargo.
  - [x] `pnpm exec stryker run --mutate src/lib/horneado.ts` da **100 %**: 23 muertos, 0 timeouts, 0 supervivientes y 0 sin cobertura, con 17 tests en el dry run y 15 s. No hizo falta re-medir con `--concurrency 1`.
  - [x] No hay supervivientes que documentar. Falta `progress/mutation_cascaron_enmienda3.md`, que es del `mutation_tester`.
- **Build en el worktree.** `pnpm build` → **exit 0**, con las 5 puertas en ✓. Su `dist/index.html` lleva:
  - **6 `<link rel="preload" as="font">`, las 6 hacia `.woff2` y 0 hacia `.woff`**;
  - 0 `as="image"`;
  - el módulo `app-CWmDYxle.js`, sin `async`.
  - El `dist/` del worktree queda en producción.

## Cambios requeridos (si aplica)

Ninguno bloqueante. Recomendaciones al lead, sin reabrir el TDD:

1. **Commitear la corrección del diario.** El diario commiteado (`progress/tdd_cascaron_enmienda3.md:194`) dice «`dist/` queda construido en producción». El propio craftsman lo corrige en el árbol de trabajo del repo principal (sin commitear): otro proceso rehízo `dist/` en modo test. Conviene commitear esa corrección para que el diario no mienta sobre el estado del artefacto.
2. **Límite de «termina en», anotado y no bloqueante.** El contrato define el criterio literalmente, y producción y test lo aplican igual. Pero una precarga hacia `/x.woff?v=1` o `href=" /x.woff "` (espacios permitidos en una URL de atributo) la descargaría el navegador y no la retirarían ni `HREF_WOFF` ni `terminaEn`: fallaría ABIERTO en los dos lados. Hoy no ocurre: Vite pone el hash en el nombre del fichero, sin query, y jsdom no rellena con espacios. Si el lead lo quiere dejar escrito, basta una línea en el banner de la ENMIENDA 3, del estilo del límite de comillas de `horneado.ts`.
3. **Pendientes que ya estaban anotados.** Siguen abiertos Manrope 500 (es de F-05) y la ENMIENDA 4 (`NODE_ENV=production` en los builds de test). @s41 no depende del modo: está medido sobre los dos artefactos.
