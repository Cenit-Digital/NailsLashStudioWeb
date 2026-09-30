# Review — feature F-25 `logo_acoplado`, ENMIENDA E-2 («el menú plegable hasta 920 px»)

**Veredicto:** APPROVED

Alcance: SOLO la ENMIENDA E-2, commit `199ca7a` (diff `git diff b23140e 199ca7a`). Contrato:
`features/logo_acoplado.feature` @s42 (bytes) y los retoques de @s20 y @s35, más
`features/header_nav_footer.feature` @s17. @s39 (filas 920/921) y @s43 son `@verificacion-viva`: los
verifica el lead en Chrome y aquí NO se exigen en jsdom. Fuentes: `project-spec.md` §«ENMIENDA E-2»
(E-2-C1..E-2-C4), `progress/tdd_logo_acoplado.md` §«ENMIENDA E-2» y `progress/gherkin_logo_acoplado.md`
§«ENMIENDA E-2».

**Bloqueantes: 0.**

## Cobertura de escenarios (@s ↔ test)

Todos los tests están en `src/components/cabecera.test.tsx`. Los literales van escritos a mano en cada uso.

- F-06 @s17
  - [x] Then «usa exactamente "920px"» y And «contra el literal a mano»: línea 141,
    `toMatch(/@media\s*\(\s*max-width:\s*920px\s*\)/)`. El literal está en la regex y no se importa
    ningún símbolo, porque no hay rama JS de viewport: `grep matchMedia|innerWidth` en `src/` solo da
    las consultas de movimiento reducido.
- F-25 @s20
  - [x] Then «".cabecera" y "@media (max-width: 920px)", sin "767px"»: líneas 205-210.
  - [x] And «sin comentarios, NO "max-width: 820px"» (NUEVO): líneas 212-215, con
    `sinComentarios(CABECERA)` y `/max-width\s*:\s*820px/`.
  - [x] Los Then de `.marca` y del horneado siguen iguales: líneas 217-238.
- F-25 @s35 (retoques)
  - [x] «EXACTAMENTE un bloque "@media (max-width: 920px)"»: línea 340, con
    `MEDIA_MENU = mediaDeAncho('920px')` (línea 257, literal a mano).
  - [x] «el bloque de 920 sigue declarando … y NO contiene ".reservar"»: líneas 385-395.
- F-25 @s42 (describe «F-25 E-2 @s42», líneas 629-688)
  - [x] Then 1, ANCLA POSITIVA primero, EXACTAMENTE un `@media (max-width: 920px)`: líneas 630-632.
  - [x] And 2, `.disparador` inline-flex, `.lista` none y `flex-direction: column`, y
    `[aria-expanded='true'] + .lista` flex: líneas 634-644.
  - [x] And 3, el bloque va DESPUÉS de las bases `.lista` y `.disparador` de primer nivel: líneas
    646-658. Cada base tiene su ancla `not.toBeNull()`.
  - [x] And 4, EXACTAMENTE un `@media (max-width: 430px)` y detrás del de 920: líneas 660-667.
  - [x] And 5, sin `max-width: 820px` (hoja sin comentarios), sin `921px` ni `767px` (bytes crudos, que
    es más estricto): líneas 669-675.
  - [x] And 6, contacto tiene EXACTAMENTE un `@media (max-width: 820px)` con `.telefono` inline-flex y
    `min-height: 2.75rem`, y no contiene `920px` (sin comentarios, como pide el When): líneas 677-687.
  - [x] And 7, los literales "920px", "820px", "430px", "921px" y "767px" van a mano: cada `it` de @s42
    llama a `mediaDeAncho('…')` con su literal o lo escribe en la regex o la cadena. Ninguno usa
    `MEDIA_MENU` ni `MEDIA_MOVIL`. `mediaDeAncho` (líneas 259-262) solo construye la forma de la regex.
- @s39 (filas 920/921) y @s43: [n/a en jsdom], `@verificacion-viva`, a cargo del lead. La bitácora TDD
  no los finge (tabla de trazabilidad, filas @s39/@s43).

Pasada acotada (la que se autorizó), en el árbol real:
`pnpm vitest run src/components/cabecera.test.tsx src/styles/scroll-padding-cabecera.test.ts
src/components/contacto-estilos.test.ts` → **3 ficheros, 42/42 verde**. `prettier --check` sobre los 6
ficheros tocados → limpio. `eslint` sobre los dos ficheros de test tocados → exit 0.

## Disciplina TDD

- ¿Hay producción que ningún test pida? **NO.** Hice un diff de las tres hojas SCSS quitando los
  comentarios `//` (`git show b23140e:…` frente a `git show 199ca7a:…`). El único cambio que no es
  comentario es `cabecera.module.scss:107`, `@media (max-width: 820px) {` → `@media (max-width: 920px) {`.
  `contacto.module.scss` y `_base.scss` solo cambian comentarios, y `scroll-padding-cabecera.test.ts`
  solo el JSDoc. El número lo exigen en rojo @s17, las dos de @s20, las dos de @s35 y 42-1.
- ¿El cambio es exactamente E-2-C1? **SÍ.** Es el mismo bloque, con el mismo contenido (líneas 107-124)
  y en el mismo orden: base (`.lista` :45, `.disparador` :83), luego 920 (:107) y luego 430 (:130). No hay
  JS, ni cambios en el horneado, ni un segundo bloque. El `@media (max-width: 820px)` de contacto
  (`contacto.module.scss:117`) queda intacto byte a byte.
- ¿Hay evidencia de Rojo→Verde→Refactor? **SÍ.** E2-1..E2-4 van en rojo con mensajes reales, contra la
  hoja de 820 (6 rojos antes del VERDE). Luego hay un VERDE de un solo número y tres refactors en verde:
  el comentario de la hoja, `declaracionesDeLaRegla` extraído de un cierre duplicado de @s35 y
  `mediaDeAncho` usado también por `MEDIA_MOVIL`/`MEDIA_MENU`. Las guardas 42-2..42-6 pasan a la primera
  (se declaran GUARDAS), y cada una se mide con un sabotaje.
- Sabotajes: **creíbles, y REPRODUCIDOS por mí.** Los hice sobre una copia aislada de `src/` en el
  scratchpad, con `node_modules` enlazado, sin tocar el árbol real porque el lead estaba construyendo
  `dist/`. Corrí `cabecera.test.tsx` y `contacto-estilos.test.ts` (39 tests de base) y todos los
  resultados coinciden con la tabla de la bitácora:
  - (a) 920 → 820 en el bloque del menú → **10 rojos**: @s17, @s20 ×2, @s35 ×2 y @s42 ×5 (todos menos
    contacto).
  - (b) un segundo bloque `@media (max-width: 820px)` junto al de 920 → **2 rojos**, solo las negativas:
    @s20 «sin comentarios, NO "max-width: 820px"» y 42-5.
  - (c1) el bloque de 920 delante de `.nav` → **1 rojo**, 42-3.
  - (d) quitar `flex-direction: column` → **1 rojo**, 42-2.
  - (e) el 820 de contacto pasa a 920 → **1 rojo**, 42-6. `contacto-estilos.test.ts` sigue VERDE, que es
    el hueco que la bitácora declara.
  - Extra: el bloque de 430 delante del de 920 → **1 rojo**, 42-4.

  Al terminar, `git status` del repo está limpio: la copia vive fuera del repo.

## Calidad

- Helpers: **bien.** `mediaDeAncho` (259-262) quita la regex repetida a mano en
  `MEDIA_MOVIL`/`MEDIA_MENU` y conserva el literal en cada llamada. `declaracionesDeLaRegla` (329-332)
  sustituye el cierre local de @s35 y lo reutiliza @s42. También se reutilizan `sinComentarios`,
  `vecesQueCasa`, `cuerpoDelBloque` y `reglas` sin copiarlos. El uso de `sinComentarios` en @s20 (línea
  214), antes de su declaración (línea 264), es válido porque las declaraciones de función se elevan.
- Duplicación: la negativa `/max-width\s*:\s*820px/` sobre la hoja sin comentarios aparece dos veces, en
  @s20 (214) y en 42-5 (671). Es intencionada: dos Then de dos escenarios distintos la piden, y el
  gherkin_author lo anotó (Ambigüedad 3). No bloquea. Ver N-4.
- Mensajes: los `expect` de orden llevan mensaje. Son `base.source` en 42-3 y «la hoja debe tener el
  @media de 920 px» en 42-3 y 42-4, así que un rojo dice qué base falta o qué orden se rompe. Los nombres
  de `it` copian el Then.
- Comentarios nuevos: no hay atribuciones a norma. «NUNCA atribuido a una norma» aparece en
  `cabecera.module.scss:100`, y «NUNCA atribuido a WCAG» en test:130. Las cifras cuadran con la spec:
  891/908 px y 12 px (920 − 908). La historia del 820 (banda 793–806 de la nav del prototipo) está
  marcada como historia. `_base.scss:34-36` y `scroll-padding-cabecera.test.ts:19-21` ya no dicen «2
  enlaces», que era falso: `MenuNavegacion.tsx` tiene 7 `<a>` en la lista (41-59) más «Reservar» (62).
  Los comentarios de contacto no escriben «WCAG» (veto de `contacto-estilos.test.ts:68`). Los matices
  van en N-1..N-3.
- Arquitectura: sin cambios de capas ni dependencias. CSS puro, en la línea del patrón de F-06.

## Checkpoints

- C1: [x] los ficheros base y los docs existen. [ ] `bin/harness init` NO lo ejecuté: el lead lo
  prohibió explícitamente porque corría a la vez `dist/` y Chromium, y el contenedor ya se había
  reiniciado. Me atengo a lo que declara el lead en el commit: typecheck, lint, format:check y suite
  completa de 1694/1694. Mi evidencia propia es la pasada acotada de 42/42, más prettier y eslint sobre
  los ficheros tocados.
- C2: [x] una sola feature `in_progress` (F-25).
- C3: [x] sin módulos ni dependencias nuevas, sin logs de debug ni TODOs.
- C4: [x] los tests leen los ficheros reales, sin mocks del sistema de ficheros. La pasada acotada da
  > 0 tests y todos verdes.
- C5: [n/a] la sesión sigue abierta, así que es trabajo del lead al cerrar.
- C6: [x] @s17/@s20/@s35/@s42 tienen mapa `@s → test` en la bitácora y no hay producción sin rojo.
  @s39/@s43 son vivos y los verifica el lead.
- C7: [n/a] E-2 solo cambia SCSS, que Stryker no ve (spec E-2-C3: «Sin mutación propia»). Los
  sabotajes manuales, reproducidos arriba, cumplen ese papel.

## Bloqueantes

Ninguno.

## Notas (no bloquean)

- **N-1** `src/components/contacto.module.scss:5-7` y `:115-116` siguen llamando al 820 del tel:
  «criterio MEDIDO». La medida (banda 793–806) era de la nav del prototipo, no de la prominencia del
  tel:, y E-2 ya la declara superada. La redacción sigue lo que pide E-2-C3 y no es falsa en sentido
  estricto (el 820 salió de una medida), pero puede hacer creer que alguien midió el tel:. Si se toca
  algún día: «criterio de proyecto, heredado del valor que el menú de F-06 tenía entonces».
- **N-2** Errata PREEXISTENTE junto a texto que tocó E-2: `src/styles/_base.scss:37` y
  `src/styles/scroll-padding-cabecera.test.ts:23` dicen «padding-block 1rem×2 (32px)», pero la hoja
  declara `padding-block: 0.9375rem` (`cabecera.module.scss:21`), es decir 15 px × 2. La cota de 76 px
  sigue siendo un techo válido (30 + 44 = 74, y en vivo se miden 75), pero «DERIVADA de
  cabecera.module.scss» no es literal. Queda fuera del alcance de E-2.
- **N-3** `src/components/cabecera.module.scss:81-82` (preexistente, sin tocar): «Solo aparece en móvil».
  Con el corte en 920 px la hamburguesa aparece también en tabletas en vertical. Es un matiz de texto.
- **N-4** El mismo hecho (el número 920) lo anclan en positivo 4 tests (@s17, @s20, @s35-1 y 42-1), y la
  negativa del 820 está dos veces (@s20 y 42-5). Lo exige el contrato, porque cada escenario pide su
  Then. El sabotaje (a) da 10 rojos por un solo defecto. Es aceptable, pero si la hoja vuelve a cambiar
  de número, el retoque tendrá que tocar 4-5 sitios.
- **N-5** 42-3 (comentario de la línea 647) dice «sus reglas (0,1,0) ganan a las base SOLO por ir
  detrás». Es exacto para `.disparador` y `.lista`, que son las que mide el test. La tercera regla del
  bloque, `.disparador[aria-expanded='true'] + .lista`, es (0,3,0) y no depende del orden.
- **N-6** Higiene: el mensaje del commit `199ca7a` repite dos veces el bloque de trailers
  `Co-Authored-By`/`Claude-Session`. Además, la bitácora (`progress/tdd_logo_acoplado.md:895`) dice «Sin
  commits», escrito antes de que el lead hiciera el commit.
- **N-7** El cierre de E-2 queda pendiente de la verificación EN VIVO del lead: @s43, las filas 920/921 de
  @s39 y el repaso de @s32/@s39 (E-2-C4), sobre un `dist/` reconstruido. El `dist/` anterior llevaba el
  820.
