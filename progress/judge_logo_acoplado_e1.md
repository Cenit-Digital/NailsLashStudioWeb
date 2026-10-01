# Review — feature 25 `logo_acoplado`, ENMIENDA E-1 (cabecera móvil en una fila sin «Reservar»)

**Veredicto:** APPROVED — **0 bloqueantes**, 7 no bloqueantes.

- Revisado por: `judge`, 2026-09-30, sobre `ba65804` (delta `git diff 1a5b49a..ba65804`).
- Contra: `features/logo_acoplado.feature` @s35-@s41 y la enmienda de @s32; `project-spec.md` §F-25
  «ENMIENDA E-1» (E-1-C1..E-1-C4); los derivados (a)-(f) de `progress/gherkin_logo_acoplado.md` §E-1;
  y la bitácora `progress/tdd_logo_acoplado.md` §ENMIENDA E-1.
- Límites del lead: solo tests acotados. Sin suite completa, sin `pnpm build` y sin Stryker. Todos los
  sabotajes se restauraron con `git checkout --`: el árbol queda limpio (`git status` vacío, HEAD `ba65804`).

## Delta

- **Producción:** SOLO `src/components/cabecera.module.scss:122-130`. Son 4 líneas de comentario del porqué
  y `@media (max-width: 430px) { .reservar { display: none; } }`, detrás del `@media (max-width: 820px)` y,
  por tanto, detrás de la base `.reservar` (`:66-80`).
- **Tests:** `src/components/cabecera.test.tsx:232-600`, 15 `it` nuevos en 4 describe «F-25 E-1 @sN».
- **Otros:** `progress/tdd_logo_acoplado.md` y `progress/current.md`.
- **Sin cambios frente a `1a5b49a`:** `MenuNavegacion.tsx`, `Cabecera.tsx`, `LogoAcoplado.tsx`,
  `stryker.config.json` y el `.feature`.
- **Sin TypeScript mutable en el delta:** ver §Mutación.

## Cobertura de escenarios (@s ↔ test)

- @s35: [x] 6 `it` «@s35 …» (`cabecera.test.tsx:316-378`): anclas; EXACTAMENTE un `@media (max-width: 430px)`
  sin `431px` ni `@media (min-width`; un solo bloque `.reservar` con la única declaración `display: none`;
  el `@media` va después de la base; fuera de él nada oculta `.reservar`; y el de 820 px sigue intacto, sin
  `.reservar` y sin `767px`. Los 7 `Then` del escenario tienen su aserción.
- @s36: [x] 4 `it` «@s36 …» (`:385-433`) sobre `renderToString(<Cabecera />)`: el enlace es uno, está en la nav
  «Principal» y lleva `href` exacto; va después del `</ul>` de `menu-navegacion` y antes de `</nav>`; su
  etiqueta de apertura no lleva `hidden`, `aria-hidden`, `style=`, `tabindex` ni `inert`; y
  `href="#reserva-titulo"` aparece ×2.
- @s37: [x] 3 `it` «@s37 …» (`:436-561`) en jsdom a 320 px, con `matchMedia` que dice que sí a todo,
  `addEventListener` espiado y el observador sustituido. El Given se comprueba dentro de `montarA320`
  (`:503-527`): `innerWidth` es 320, el espía está en su sitio y el observador se construye una vez con
  `rootMargin "-73px 0px 0px 0px"`.
- @s38: [x] 2 `it` «@s38 …» (`:568-600`) sobre bytes: `estilos.reservar` ×1 y `href="#reserva-titulo"` ×2 en
  `MenuNavegacion.tsx`; y ni él ni `Cabecera.tsx` contienen ninguno de los 7 literales vetados, con el ancla
  `export function`. No hay guardas contra `if (`, `?`, `&&` ni `||`.
- @s32 (enmendado): [x] solo cambian el `Then` y el comentario. Es `@verificacion-viva` y NO se finge en jsdom:
  queda para el lead.
- @s39, @s40 y @s41: [x] `@verificacion-viva`, sin ningún test jsdom que los finja. Busqué en `src/` y las únicas
  apariciones de `@s39`-`@s41` son de F-04 y F-05. Quedan para el lead en Chrome + CDP sobre `dist/`.
- E-1-C3, «sin pares de contraste nuevos»: [x] lo cubre @s19 (`logo-acoplado-estilos.test.ts:371-376`,
  `MINIMO_DE_PARES` = 18). Verde en esta revisión.

### Derivados (a)-(f) ratificados

| Derivado                                                          | Dónde                     | ¿Muerde?                                   |
| ----------------------------------------------------------------- | ------------------------- | ------------------------------------------ |
| (a) el `@media` va DESPUÉS de la base                             | @s35 «después de la base» | SÍ: S4 y S23 en ROJO                       |
| (b) un bloque, una declaración, sin `431px` ni `min-width`        | @s35, tests 2 y 3         | SÍ: S2, S3, S5, S5b, S6, S7, S8, S12 y S14 |
| (c) veto de `hidden`, `aria-hidden`, `style`, `tabindex`, `inert` | @s36 y @s37               | SÍ: M1-M5 en ROJO                          |
| (d) guarda de bytes `estilos.reservar`                            | @s38                      | SÍ: M6 en ROJO, y SOLO lo caza @s38        |
| (e) Tab y árbol de accesibilidad                                  | @s39, EN VIVO             | lead                                       |
| (f) los tres caminos a la reserva                                 | @s41, EN VIVO             | lead                                       |

## Sabotajes medidos (mutantes HUMANOS; base: `cabecera.test.tsx` 29/29)

Cada sabotaje se aplicó, se corrió `pnpm exec vitest run src/components/cabecera.test.tsx` y se restauró con
`git checkout --`. **Resultado: 38 sabotajes. 37 en ROJO y 1 que sobrevive, EQUIVALENTE.**

### Sobre la hoja `cabecera.module.scss`

| #   | Sabotaje                                                                   | Resultado | Lo caza                                                                                                                                                                     |
| --- | -------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | quitar el `@media (max-width: 430px)` (= mudarlo a otra hoja)              | ROJO 3    | @s35: exactamente uno, un bloque, después                                                                                                                                   |
| S2  | 430 → 431                                                                  | ROJO 4    | @s35 (incluido «nada lo oculta fuera»)                                                                                                                                      |
| S2b | 430 → 429                                                                  | ROJO 4    | @s35                                                                                                                                                                        |
| S3  | `max-width` → `min-width`                                                  | ROJO 4    | @s35                                                                                                                                                                        |
| S4  | mover el bloque ANTES de la base `.reservar`                               | ROJO 1    | @s35 «después de la base»                                                                                                                                                   |
| S5  | segunda declaración (`visibility: hidden`)                                 | ROJO 1    | @s35 «una sola declaración»                                                                                                                                                 |
| S5b | `display: none !important`                                                 | ROJO 1    | @s35 «una sola declaración»                                                                                                                                                 |
| S6  | `visibility: hidden` en vez de `display: none`                             | ROJO 1    | @s35                                                                                                                                                                        |
| S7  | selector `.nav .reservar`                                                  | ROJO 1    | @s35 «`.reservar` a secas»                                                                                                                                                  |
| S8  | `@media` 430 duplicado                                                     | ROJO 2    | @s35 «exactamente uno» y «fuera»                                                                                                                                            |
| S9  | `@media screen and (max-width: 430px)`                                     | ROJO 4    | @s35                                                                                                                                                                        |
| S10 | `display: none` en la base `.reservar`                                     | ROJO 1    | @s35 «fuera»                                                                                                                                                                |
| S11 | `.reservar` dentro del `@media` de 820 px                                  | ROJO 1    | @s35 «820 intacto»                                                                                                                                                          |
| S12 | `@media` ANIDADO dentro de la base (SCSS; mismo CSS compilado)             | ROJO 1    | @s35 «un bloque `.reservar`»                                                                                                                                                |
| S13 | 430px → 26.875rem                                                          | ROJO 4    | @s35                                                                                                                                                                        |
| S14 | segundo bloque `.disparador` en el `@media` (alternativa (a))              | ROJO 1    | @s35                                                                                                                                                                        |
| S15 | `… and (orientation: portrait)`                                            | ROJO 4    | @s35                                                                                                                                                                        |
| S16 | el bloque comentado con `/* */`                                            | ROJO 3    | @s35 (trocea la hoja sin comentarios)                                                                                                                                       |
| S17 | 820 → 821 (F-06)                                                           | ROJO 4    | F-06 @s17, F-25 @s20 y @s35 (anclas y 820)                                                                                                                                  |
| S18 | `visibility: hidden` en el `&:hover` de la base                            | ROJO 1    | @s35 «fuera» (mira anidados)                                                                                                                                                |
| S19 | un `@media (max-width: 500px)` extra que oculta `.reservar`                | ROJO 1    | @s35 «fuera»                                                                                                                                                                |
| S20 | `display:none` sin espacio                                                 | ROJO 1    | @s35 (y Prettier lo normalizaría)                                                                                                                                           |
| S21 | la `.lista` del 820 pierde su `display: none`                              | ROJO 1    | @s35 «820 intacto»                                                                                                                                                          |
| S22 | quitar el bloque base `.reservar` entero                                   | ROJO 2    | @s35 «después de la base» y «fuera»                                                                                                                                         |
| S23 | la trampa: la base declara `display: inline-flex` y el `@media` va DELANTE | ROJO 1    | @s35 «después de la base»                                                                                                                                                   |
| S24 | `@media(max-width:430px)` sin espacios                                     | **VERDE** | EQUIVALENTE: el mismo CSS, y Prettier lo reescribe a `@media (max-width: 430px)` (medido con `prettier --stdin-filepath x.module.scss`); `format:check` es puerta de `lint` |

### Sobre el marcado y el JS (`MenuNavegacion.tsx` / `Cabecera.tsx`)

| #   | Sabotaje                                                                              | Resultado | Lo caza                                                               |
| --- | ------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------- |
| M1  | `hidden` en el enlace                                                                 | ROJO 3    | @s36 (etiqueta) y @s37 (ancla y atributos)                            |
| M2  | `aria-hidden="true"`                                                                  | ROJO 3    | @s36 y @s37                                                           |
| M3  | `style={{ display: 'none' }}`                                                         | ROJO 3    | @s36 y @s37                                                           |
| M4  | `tabIndex={-1}`                                                                       | ROJO 2    | @s36 y @s37                                                           |
| M5  | `inert`                                                                               | ROJO 2    | @s36 y @s37                                                           |
| M6  | clase `estilos.nav` en vez de `estilos.reservar`                                      | ROJO 1    | SOLO @s38 (como anticipa el `.feature`)                               |
| M7  | «Reservar» mudado a un `<li>` de la lista (alternativa (b))                           | ROJO 1    | @s36 «fuera de la `<ul>`»                                             |
| M8  | quitar el enlace                                                                      | ROJO 7    | @s36, @s37 y @s38                                                     |
| M9  | `href="#reserva"`                                                                     | ROJO 6    | @s36, @s37 y @s38                                                     |
| M10 | `useIsMobile` (un efecto con `matchMedia('(max-width: 430px)')` que quita el enlace)  | ROJO 6    | @s37 ×3 y @s38 (y F-06 @s15/@s27: jsdom no trae `matchMedia`)         |
| M11 | quitar el enlace con `window.innerWidth <= 430` en un efecto                          | ROJO 3    | @s37 ×2 y @s38                                                        |
| M12 | `addEventListener('resize')` en `Cabecera.tsx` sin tocar el enlace                    | ROJO 2    | @s37 y @s38                                                           |
| M13 | `addEventListener('orientationchange')` en `Cabecera.tsx`                             | ROJO 1    | @s37 (en tiempo de ejecución; el literal no está en la lista de @s38) |
| M14 | quitar el enlace con `document.documentElement.clientWidth <= 430`, literal NO vetado | ROJO 2    | @s37 en tiempo de ejecución                                           |

**Ningún JS decide el ancho.** `Cabecera.tsx`, `MenuNavegacion.tsx` y `LogoAcoplado.tsx` no contienen
`matchMedia`, `innerWidth`, `outerWidth`, `screen.width` ni `resize`. En `src/components` solo usan
`matchMedia` Hero, Galeria, Resenas y NailbotFlotante, y siempre para `prefers-reduced-motion`, nunca para el
ancho. M14 demuestra además que la puerta de tiempo de ejecución (@s37) caza un JS de ancho aunque use un
literal que @s38 no veta.

## F-06 sigue intacto

- **@s17 (820 px):** verde. S17 (820 → 821) lo pone ROJO, y con él @s20 y las anclas de @s35. S21 y S11 muestran
  que el `@media` de 820 px está vigilado declaración a declaración.
- **Horneado de la nav:** @s12, @s16 y @s20 en verde. `MenuNavegacion.tsx` no cambia (`git diff` vacío). Ahora
  @s36 ata además que «Reservar» sigue horneado, dentro de la nav y fuera de la `<ul>`.
- **Igualdad de anclas:** el marcado no cambia, así que el conjunto de `href` que ve `tools/puerta-anclas.ts` sobre
  `dist/` es el mismo por construcción. @s36 fija `href="#reserva-titulo"` ×2 en el horneado (M9 → ROJO).
- **`scroll-padding-cabecera.test.ts`**, que deriva el alto de esta hoja: verde (ver Verificación).

## Disciplina TDD

- ¿Producción sin test que la pida? **NO.** Las 10 líneas de `cabecera.module.scss:121-130` las piden 35-1 y 35-2.
  35-1 salió ROJO («expected +0 to be 1») y se puso VERDE con un `@media` VACÍO: el mínimo, Ley 3. 35-2 salió
  ROJO y se puso VERDE con `.reservar { display: none; }`. El resto son guardas de «el marcado no cambia»
  (E-1-C1). Todas se midieron con sabotaje en la bitácora, y esta revisión las ha re-medido.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ.** Hay ciclos 35-1..35-6, 36-1..36-4, 37-1..37-3 y 38-1..38-2, con los
  mensajes de fallo citados. Los refactors están declarados: `MEDIA_MOVIL` sin bandera `g`, `vecesQueCasa` en @s36
  y `montarA320` partido en tres funciones, todos re-medidos tras el cambio.

## Calidad

- **La hoja:** una regla de especificidad (0,1,0), sin `!important`, y su comentario explica el porqué: el empate
  de especificidad y por qué va detrás. Respeta el patrón de F-06 (CSS puro, `red-css-para-rama-solo-js-en-ssg`)
  y `docs/architecture.md`: no hay módulo nuevo ni dependencia nueva.
- **Los tests:** literales A MANO (`"430px"`, `"display: none"`, `"Reservar"`, `"#reserva-titulo"`); sin
  `toHaveClass` y sin aseverar por clase; anclas positivas antes de cada negación; helpers cortos y con nombres
  claros (`sinElBloque`, `enlacesReservar`, `montarA320`); constantes con nombre (`ANCHO_MINIMO`,
  `CAJA_DE_LA_CABECERA`). El `afterEach` de @s37 restaura espías y globales.
- No hay `console.*`, `debugger` ni TODO en el delta.

## Verificación ejecutada (acotada, por instrucción del lead)

- `pnpm exec vitest run src/components/cabecera.test.tsx` → **29/29** (la base, y de nuevo tras cada restauración).
- `pnpm exec vitest run src/styles/scroll-padding-cabecera.test.ts src/components/logo-acoplado-estilos.test.ts`
  → **37/37**.
- `pnpm typecheck` (`tsc --noEmit`) → exit 0.
- `pnpm exec eslint src/components/cabecera.test.tsx` → exit 0.
- `pnpm exec prettier --check` sobre los 4 ficheros del delta → limpio.
- **NO ejecutado, por instrucción del lead:** `bin/harness init` (lleva la suite completa), `pnpm build` y
  Stryker. La cifra de 1687/1687 de la suite completa es la que declaran la bitácora y el commit; **esta
  revisión NO la ha re-medido.**

## Mutación (para el lead)

**El delta NO tiene TypeScript mutable.** La única producción es `cabecera.module.scss`, y `stryker.config.json`
→ `mutate` solo lista `.ts`/`.tsx`: Stryker no ve el SCSS. `Cabecera.tsx` y `MenuNavegacion.tsx` están en
`mutate`, pero E-1 no los toca: sus 15 tests nuevos solo pueden añadir capacidad de matar mutantes, nunca
quitarla. Los mutantes de E-1 son HUMANOS, y su red son los 38 sabotajes de arriba: 37 ROJOS y 1 equivalente.
**Queda en manos del lead decidir si pasar el `mutation_tester`.** En mi lectura no hay ningún mutante nuevo
que medir.

## Checkpoints

- **C1** [x] los ficheros base y los docs existen. [ ] `bin/harness init`: NO ejecutado por instrucción del lead.
  Lo sustituyen el typecheck completo y los lint, format y tests acotados, todos en verde.
- **C2** [x] una sola feature `in_progress` (25). [x] `progress/current.md` describe la sesión activa (E-1).
  [x] el acceptance de `feature_list.json` ya dice 41 escenarios.
- **C3** [x] `src/` no gana módulos, [x] no hay dependencias nuevas, [x] no hay logs ni TODOs.
- **C4** [x] el módulo tiene sus tests. [x] Son de bytes, `renderToString` y jsdom, sin mocks del sistema de
  ficheros. [x] Los tests acotados, en verde.
- **C5** [x] no hay ficheros sin trackear. [ ] `progress/history.md` todavía no tiene la entrada de F-25: se
  escribe al cerrar la sesión, y F-25 sigue `in_progress`. [x] el estado de la feature es correcto.
- **C6** [x] existen el `.feature` y la §F-25 «ENMIENDA E-1». [x] Los @s35-@s41 son consecutivos y sus `Then`
  son medibles. [x] Del @s35 al @s38 hay test; @s39-@s41 y @s32 son `@verificacion-viva` y quedan para el lead.
  [x] No hay producción que ningún test pida.
- **C7** [ ] Pendiente, fuera de esta puerta. Sin TS mutable en el delta: ver §Mutación.

## Bloqueantes

Ninguno.

## No bloqueantes (para el lead; ninguno impide aprobar)

1. **Cabecera del `.feature` desfasada.** `features/logo_acoplado.feature:11` sigue diciendo «Pendiente de la
   PUERTA HUMANA», pero la línea 5 del mismo fichero ya dice que la puerta aprobó E-1 el 2026-09-30. Es
   documentación y la puede corregir el lead.
2. **Ancla débil en @s35.** En `cabecera.test.tsx:318-320`, el ancla `.reservar` se busca en los BYTES CRUDOS, y
   el propio comentario de E-1 (`cabecera.module.scss:122-125`) ya la satisface. Sola no muerde si desaparece la
   base, aunque los tests «después de la base» y «fuera» sí lo cazan (S22 en ROJO). Mejora opcional: buscar el
   ancla en `HOJA_CABECERA`.
3. **Veto de `min-width` sensible a los espacios.** `cabecera.test.tsx:328` usa el literal `'@media (min-width'`,
   así que `@media(min-width:…)` o `@media screen and (min-width…)` pasarían esa línea. Es fiel a la letra del
   `Then` y lo cubren el veto de `431px` y la normalización de Prettier (medida), pero es frágil.
4. **Dos `declaracionesDe` distintas en el mismo fichero.** Una en la línea 191, `(hoja, selector)`, en el describe
   de @s20; otra en la 369, `(selector)`, en @s35. No colisionan, pero cuesta leerlas. Se arregla renombrando una.
5. **Helpers de la hoja duplicados.** `cuerpoDelBloque`, `reglas` y `sinComentarios` se repiten en 9 ficheros de test.
   Es un patrón que el repo ya tenía («un test no importa de otro test»), no una deuda de E-1. Lo anoto solo como
   registro.
6. **Literales que @s37 y @s38 no cubren.** Ninguno de los dos mira `window.onresize =`, `ResizeObserver` ni
   `visualViewport`. Queda fuera de la letra del contrato, y cualquier JS que de verdad oculte el enlace según el
   ancho lo caza @s37 en tiempo de ejecución (M14 en ROJO).
7. **Falta correr la suite completa.** Antes de cerrar la sesión, el lead debe correr `bin/harness init` o
   `verify` cuando el contenedor lo permita: esta revisión no ha re-medido la suite completa. Quedan además
   pendientes EN VIVO @s32 y @s39-@s41.
