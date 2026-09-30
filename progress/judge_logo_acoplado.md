# Review — feature 25 `logo_acoplado`

**Veredicto:** CHANGES_REQUESTED — **1 bloqueante** (B1).

La implementación es sólida. Todos los contratos que el lead marcó como intocables se cumplen, y sus
tests MUERDEN: lo he medido con 27 sabotajes, todos restaurados. El bloqueante es de fidelidad de UN
test a la letra de la enmienda @s26 recién ratificada (7aa8ba9): una cláusula de ese escenario queda
sin morder. El arreglo es una línea en un test; no hay que tocar producción.

## Base de la revisión

- **Qué revisé:** `HEAD` = `7aa8ba9`, con el árbol limpio antes y después (`git status --short` vacío).
  Diff: `git diff d07e4ea..HEAD`. Son 16 ficheros; no tocan `package.json`, `src/styles`, `src/lib` ni `tools`.
- **Contra qué:**
  - `features/logo_acoplado.feature` (34 escenarios, con la ENMIENDA @s26);
  - `project-spec.md` §Feature 25 (`:3479-3811`: LA-C1..LA-C13, LA-1..LA-16 y ENMIENDA D-1);
  - `docs/workflow.md`, `docs/tdd.md`, `docs/conventions.md` y `CHECKPOINTS.md`;
  - `docs/architecture.md`, que sigue siendo la plantilla SIN rellenar: la arquitectura se juzga contra
    LA-14 y la lista de ARTEFACTOS del `.feature`.
- **Qué ejecuté:**
  - Tests acotados de los 4 ficheros de F-25: **110/110**.
  - Tests acotados de `cabecera.test.tsx` y `hero.test.tsx`: **73/73**.
  - `bin/harness init`, UNA sola vez: **exit 0**. Lint, typecheck y Prettier limpios; **51/51 ficheros y
    1671/1671 tests** (75,9 s).
  - NO ejecuté `pnpm build` ni Stryker.
- **Sabotajes:** cada uno se aplicó sobre la fuente real, corrió en `vitest` acotado y se restauró con
  `git checkout --`. Los scripts están en el scratchpad de la sesión:
  `/tmp/claude-0/-home-user-NailsLashStudioWeb/dffbd73b-3f81-5e8b-8819-805db4e58549/scratchpad/`
  (`sabotaje.py` y `lote1.py`..`lote5.py`). **No he modificado ningún fichero del repo salvo este informe.**

## Bloqueantes

### B1 — @s26: la excepción de `trazo-marca` se aplica a los DOS ficheros, y la enmienda la limita al import de `LogoAcoplado.tsx`

- **Dónde:** `src/components/logo-acoplado-estilos.test.ts:433-434`:
  `for (const [nombre, fuente] of FUENTES) { const sinElImportDeLaVista = fuente.replace(IMPORT_DE_LA_VISTA, '') …`
  El especificador `from '../lib/trazo-marca'` se borra también de `logo-acoplado-logica.ts` antes de buscar.
- **Qué dice el contrato:** `features/logo_acoplado.feature:642-646` dice
  «…ni "trazo-marca" (…), salvo el especificador del import de VISTA_MARCA, from '../lib/trazo-marca',
  que LogoAcoplado.tsx trae EXACTAMENTE una vez». Y el comentario de la enmienda lo remacha: «fuera de
  ese import, "trazo-marca" sigue siendo rojo, **comentarios incluidos**».
- **Medido:**

  | Sabotaje en `logo-acoplado-logica.ts`                                   | Resultado           |
  | ----------------------------------------------------------------------- | ------------------- |
  | P3: comentario `// VISTA_MARCA vive en from '../lib/trazo-marca'`       | **VERDE** (34/34)   |
  | P: `export { VISTA_MARCA } from '../lib/trazo-marca'`                   | **VERDE** (110/110) |
  | P4 (control): comentario `// ver trazo-marca`                           | rojo (1)            |
  | P2 (control): 2.º especificador, en un comentario de `LogoAcoplado.tsx` | rojo (1)            |

  La lógica pura, que «sin DOM, solo decide y calcula», puede nombrar el módulo del rótulo, en código o
  en un comentario, con toda la suite verde. Eso contradice la letra ratificada hace un commit.

- **Qué se pide:** el `tdd_craftsman` corrige el test; producción no se toca.
  - La excepción se aplica SOLO a `COMPONENTE`.
  - `LOGICA` NO puede contener "trazo-marca" en ninguna forma.
  - Hay que medir que P y P3 se ponen rojos y que la fuente actual sigue verde.
  - De paso se actualiza el docblock de `:387-392`, que aún dice «A RATIFICAR por el lead» (N3).

## Cobertura de escenarios (@s ↔ test)

Todos los ficheros de test están en `src/components/`:

- @s1: [x] `logo-acoplado.test.tsx:216`
- @s2: [x] `logo-acoplado.test.tsx:244`, `:257`, `:274`
- @s3: [x] `logo-acoplado.test.tsx:317` (3 filas)
- @s4: [x] `logo-acoplado-derivacion.test.tsx:36`, `:43`, `:49` (el `vi.mock` vive solo ahí)
- @s5: [x] `logo-acoplado.test.tsx:343`, `:365`
- @s6: [x] `logo-acoplado.test.tsx:390` (7 filas)
- @s7: [x] `logo-acoplado.test.tsx:439` (7 filas)
- @s8: [x] `logo-acoplado.test.tsx:459`
- @s9: [x] `logo-acoplado.test.tsx:481`
- @s10: [x] `logo-acoplado.test.tsx:527` (6 filas)
- @s11: [x] `logo-acoplado.test.tsx:553`, `:573` (ver N1)
- @s12: [x] `logo-acoplado.test.tsx:596` (3 filas)
- @s13: [x] `logo-acoplado.test.tsx:617`
- @s14: [x] `logo-acoplado.test.tsx:704` (3 filas)
- @s15: [x] `logo-acoplado-estilos.test.ts:89-159` (7 `it`)
- @s16: [x] `logo-acoplado-estilos.test.ts:161-203` (5 `it`)
- @s17: [x] `logo-acoplado-estilos.test.ts:205-292` (8 `it`, con el apoyo de fuente en `:276`)
- @s18: [x] `logo-acoplado-estilos.test.ts:294-326` (3 `it`)
- @s19: [x] `logo-acoplado-estilos.test.ts:328-377` (6 `it`)
- @s20: [x] `cabecera.test.tsx:202`, `:209`, `:222`
- @s21: [x] `hero.test.tsx:935`, `:953`
- @s22: [x] `logo-acoplado.test.tsx:731`
- @s23: [x] `logo-acoplado.test.tsx:780`, `:785`, `:792`, `:798`
- @s24: [x] `logo-acoplado-logica.test.ts:16-50` (8 + 6 filas)
- @s25: [x] `logo-acoplado-logica.test.ts:57-105` (5 + 2 + 4 filas)
- @s26: [x] cubierto en `logo-acoplado-estilos.test.ts:395`, `:409`, `:430` y `:442`. **Pero una cláusula no
  muerde: B1.**
- @s27: [x] `logo-acoplado-estilos.test.ts:459` (bytes). La PUNTUACIÓN la mide el `mutation_tester`.
- @s34: [x] `logo-acoplado.test.tsx:828` (3 filas)
- @s28-@s33 `@verificacion-viva`: [x] **NO se fingieron en jsdom.**
  - `grep` de `@s28`..`@s33` en los tests de F-25, `cabecera.test.tsx` y `hero.test.tsx` → 0.
    El único resultado, `hero.test.tsx:72`, es el @s32 de F-04.
  - No hay ningún test build-based nuevo.
  - Constan como PENDIENTES del lead en `progress/tdd_logo_acoplado.md:392-397` y `:423-439`.
  - `progress/verificacion_viva_logo_acoplado.md` aún no existe, que es lo correcto.

Ningún `@s` jsdom/bytes queda sin test: 28/28. En vivo quedan 6 pendientes del lead.

## Contratos que no hay que romper: se cumplen y MUERDEN (sabotajes medidos)

| Contrato                                                                             | Producción                                                                | Sabotaje → resultado                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nombre accesible EXACTO «Nails Lash Studio» en los 2 estados                         | `LogoAcoplado.tsx:133-147`                                                | A: `<span>` visible sin `aria-hidden` → **5 rojos** (3× @s3, @s2, apoyo @s17) · B: `<svg>` sin `aria-hidden` → **4** · C: `title={NOMBRE}` en el `<a>` → **3** (@s3)                                                    |
| Estado en atributos, nunca en `className` condicional                                | `LogoAcoplado.tsx:128-131`                                                | `className={acople.logo === HORNEADO ? estilos.marca : estilos.logoTexto}` → **3 rojos** (2× @s3, apoyo @s17). Bajo `css: false` las clases son `_marca_0a3d44`, así que la constancia de @s3 muerde de verdad (ver N2) |
| Un solo `<h1>`, ids únicos, igualdad de anclas, nav horneada                         | —                                                                         | @s23 (`inspeccionarAnclas` → `[]`), @s20 y @s1. El `id` y el `href="#inicio"` ya los había medido el craftsman. Suite completa verde, incluidas las puertas F-04/F-05/F-06                                              |
| Cero terceros                                                                        | —                                                                         | El diff no añade ninguna URL (`grep https?://` en las líneas `+` → 0). @s26 veta `fetch(`/`XMLHttpRequest`. `package.json` no cambia                                                                                    |
| 88 % de `--header-bg`, `_base.scss`, matriz A-15                                     | sin tocar                                                                 | `git diff --stat -- src/styles src/lib tools` vacío. @s19 fija `MINIMO_DE_PARES` = 18 y una sola fila A-15                                                                                                              |
| D-1 (a) `Math.floor` en el `rootMargin`                                              | `logo-acoplado-logica.ts:97-99`, usado en `LogoAcoplado.tsx:113`          | H: sin `floor` → **4 rojos** (3 filas de @s25 y @s5)                                                                                                                                                                    |
| D-1 (b) decidir contra `rootBounds.top`, y si es null el borde medido EN el callback | `LogoAcoplado.tsx:92`                                                     | D: decidir siempre con el borde medido → **4 rojos** (@s6 fila 73,5 y 3 filas de @s7)                                                                                                                                   |
| Frontera `<=`                                                                        | `logo-acoplado-logica.ts:21`                                              | H2: `<` → **17 rojos**                                                                                                                                                                                                  |
| D-4 decide la ÚLTIMA; «primera» = primera ENTREGA                                    | `LogoAcoplado.tsx:88-90`                                                  | E: `entradas[0]` → **3 rojos** (@s34) · W: `primeraEntrega` nunca a `false` → **9 rojos**                                                                                                                               |
| P2 monótono                                                                          | `LogoAcoplado.tsx:100-104` y `logo-acoplado-logica.ts:21`                 | F: volver a «texto» con una entrega posterior → **1 rojo** (@s8) · G: sin `actual === 'caligrafia' \|\|` → **2 rojos** (@s24) · V: sin `disconnect` al acoplar → **16 rojos**                                           |
| Reduced-motion: sin vuelo y resuelto en la hoja                                      | `logo-acoplado.module.scss:115-123`; el componente no mira la preferencia | K: quitar la regla de `.logoTexto` del `@media` → **3 rojos** (@s16) · L2: un fundido de 0,2 s en vez de `none` → **2 rojos** · Y: `addEventListener('resize')` → **1 rojo** (@s13)                                     |
| Tope de 2,75 rem y cero CLS por construcción                                         | `logo-acoplado.module.scss:12-16`, `:38-45` y `:58-66`                    | L: `max-height: 2.8rem` → **1 rojo** (@s18). La rejilla en una sola celda y `visibility` los fija @s17 (el craftsman midió `display: none` → 2 rojos)                                                                   |
| Viewport = `innerHeight`, no `clientHeight`                                          | `LogoAcoplado.tsx:47`                                                     | I: `clientHeight` → **1 rojo** (@s10, fila −811)                                                                                                                                                                        |
| Hero solo se busca en el efecto (LA-C9)                                              | `LogoAcoplado.tsx:71-80`                                                  | J: un `querySelector` en el render → **2 rojos** (@s1 y @s14)                                                                                                                                                           |
| Las custom properties van SOLO en el `<a>`                                           | `LogoAcoplado.tsx:131`                                                    | R: sin `style` → **5 rojos** (@s10, @s11, @s13)                                                                                                                                                                         |
| Enmiendas F-06 y F-07                                                                | `Hero.tsx:211`, `:268`; `cabecera.module.scss:35-36`                      | Q: sin `origen` → **2 rojos** (@s21, @s22) · Q2: `disparo` en el primer `<span>` → **1** · Q3: sin `disparo` → **2** · T: `.marca` de vuelta en `cabecera.module.scss` → **1** (@s20)                                   |

## Disciplina TDD

- **¿Producción sin test que la pida?** NO.
  - El cableado de `className` lo exige el apoyo declarado (`logo-acoplado-estilos.test.ts:276`).
  - `color` y `text-decoration` de `.marca`, y `font-size` y `line-height` de `.logoTexto`, los exige
    el test derivado de la mudanza (`cabecera.test.tsx:209`).
  - Los tres extras de `.soloLectores` (`margin: -1px; padding: 0; border: 0`, en
    `logo-acoplado.module.scss:25-27`) no los enumera ningún test. Aun así, el bloque es IDÉNTICO a
    `.heroMarca` (`hero.module.scss:131-141`), y el contrato pide «la técnica del `<h1>` del hero».
    No hay alcance inflado.
- **¿Evidencia de Rojo→Verde→Refactor?** SÍ.
  - Hay ciclos del 1 al 27 y el 34, con el mensaje del rojo citado y fake-its declarados que el
    siguiente ciclo generalizó (@s2→@s4, @s10→@s11).
  - El ciclo de @s24 no se revivió tras el reinicio del contenedor, pero está declarado y se midió con
    sabotajes. He re-medido G y H2: muerden.
  - Las guardas que pasaron a la primera (@s8, @s9, @s13, @s22, @s23 y @s26) traen cada una su sabotaje.

## Calidad

- `LogoAcoplado.tsx` (150 líneas) mide y cablea. `logo-acoplado-logica.ts` (99 líneas) decide y calcula,
  con cinco funciones puras y cortas, un solo motivo para cambiar y nombres de dominio.
  - `HORNEADO` (`:17`) como estado inicial y como `actual` del callback está bien razonado: evita el
    equivalente `'texto'`→`""`, y el comentario de `:93` explica por qué basta.
  - `data-vuelo` se deriva de `acople.variables` (`:130`), así que «vuelo sí ⇔ hay variables» se
    cumple por construcción.
- Los tests usan geometría asimétrica y sin ceros, un señuelo en el `<a>`, literales a mano y ninguna
  importación de producción como valor esperado. No hay `toHaveClass` ni aserciones por clase.
- Sin `console.log`, TODOs, `.only` ni `.skip`. Prettier y ESLint están limpios.

### No bloqueantes

1. **N1 — LA-C2 «en el MISMO render»: jsdom no lo muerde.** Sabotaje S: la entrega pone solo
   `{ logo }` y un `useEffect` añade las variables en un SEGUNDO commit (el fotograma de destello en la
   esquina que LA-C2 quiere evitar). Resultado: **110/110 VERDE**.
   - El `Then` de @s11 («tras esa misma llamada») se cumple a la letra, porque `act()` vacía los
     efectos. La producción actual es correcta: un único `setAcople` en `LogoAcoplado.tsx:106-109`.
   - Hoy lo único que lo vigila es @s29 en vivo («sin destello»), y ningún mutante de Stryker fabrica
     ese flujo en dos fases.
   - **Recomendado en la misma ronda que B1:** envolver `<Cabecera />` en un `<Profiler onRender>` en
     `@s11` y exigir EXACTAMENTE un commit durante la entrega que acopla.
2. **N2 — Afirmación falsa sobre `css: false`, medida.** Bajo `css: false`, Vitest devuelve un proxy
   «stable»: las clases del module son cadenas (`_marca_0a3d44`, `_logoTexto_0a3d44`), NO `undefined`.
   - La afirman `logo-acoplado.test.tsx:17` («las del module no existen») y
     `logo-acoplado-estilos.test.ts:272-274` («las clases del module son undefined y ningún render las ve»).
   - También `progress/tdd_logo_acoplado.md:173-177` y el paréntesis de `features/logo_acoplado.feature:110`,
     que es del lead.
   - La prohibición de aseverar por clase sigue siendo válida, pero por OTRO motivo: el hash no es un
     literal estable, y el estado vive en atributos.
   - Hay que corregir el porqué. El apoyo de @s17 sigue justificado por esa prohibición, no por la
     «inexistencia» de las clases.
3. **N3 — Textos caducados tras la ratificación (7aa8ba9).**
   - `logo-acoplado-estilos.test.ts:387-392`: «DESVIACIÓN DECLARADA, A RATIFICAR por el lead».
   - `progress/tdd_logo_acoplado.md:299`, `:404-408` («Propongo enmendar…», «Si el lead la rechaza…») y
     `:418` («Ratificar la desviación de @s26» sigue en «Pendiente»).
4. **N4 — [I, SIN MEDIR: a mirar en vivo en @s28/@s32] Alineación vertical de «nails lash studio».**
   - `.marca` es `inline-grid` (`logo-acoplado.module.scss:13`) sin `align-items`. La fila de la
     rejilla mide 40 px por el `<svg>` (`:60`), y el `<span>` `.logoTexto`, como ítem no reemplazado,
     se estira a esos 40 px con su línea de ≈ 26,6 px arriba.
   - Antes de F-25, el `<a>` medía ≈ 26,6 px y lo centraba el `align-items: center` de `.cabecera`.
   - Hipótesis: en el estado «texto» la marca queda ≈ 6,7 px más alta que la nav, contra el «como hoy»
     de la tabla de la spec (`project-spec.md:3498-3499`).
   - Si se confirma, es un hueco del contrato: ningún escenario fija la alineación. La cura (p. ej.
     `align-items: center` en `.marca`) necesitaría su propio test de bytes.
5. **N5 — `LogoAcoplado.tsx:82` usa `enlace.current!.closest('header')!`.** Si el componente se montara
   fuera de un `<header>`, `:113` lanzaría un `TypeError` dentro del efecto. En React 19 un error no
   capturado desmonta la raíz. Hoy solo lo monta `Cabecera.tsx:15` (LA-C1), así que no hay riesgo vivo.
   No pido una guarda: sería producción sin test. Basta con dejar constancia por si alguien reutiliza
   el componente.
6. **N6 — Para el `mutation_tester`:** el `[]` de `LogoAcoplado.tsx:122` está SIN marcar, como encarga
   el contrato. Su `// Stryker disable next-line` y la justificación van en
   `progress/mutation_logo_acoplado.md`.
   - En mi pre-análisis no veo otros equivalentes: `??`→`&&` lo mata @s7 fila 1; `?.` lo matan las filas
     null; `length - 1`→`+ 1` acaba en `TypeError`.

## Checkpoints

- C1 El arnés está completo: [x] ficheros base y docs presentes; `bin/harness init` → exit 0.
- C2 El estado es coherente: [x] solo F-25 está en `in_progress`; la suite completa está verde;
  `progress/current.md` describe la sesión activa.
- C3 El código respeta la arquitectura: [x] los artefactos son exactamente los de LA-14 y la lista del
  `.feature`. No hay dependencias nuevas ni logs de depuración.
- C4 La verificación es real: [x] 4 ficheros de test nuevos más las enmiendas. Los bytes se leen del
  fichero real con `readFileSync`, sin mocks de fs. 1671 tests > 0, todos verdes.
- C5 La sesión se cerró bien: [x] no hay ficheros sin trackear y F-25 sigue en `in_progress`, que es
  correcto. La entrada de `history.md` toca al cierre de la sesión, que sigue abierta.
- C6 Contrato Gherkin: [ ]
  - Hay `.feature` y spec. Los `@s` están tagueados y los `Then` son medibles. No hay producción sin test.
  - Pero la cláusula enmendada de @s26 no muerde en `logo-acoplado-logica.ts` (B1).
- C7 Prueba de mutación: [ ] pendiente del `mutation_tester`. Es otra puerta, no la mía.

## Cambios requeridos

1. **B1:** en `src/components/logo-acoplado-estilos.test.ts:430-440`:
   - la excepción del especificador `from '../lib/trazo-marca'` se aplica SOLO a `LogoAcoplado.tsx`;
   - `logo-acoplado-logica.ts` no puede contener "trazo-marca" en ninguna forma, comentarios incluidos,
     como dice `features/logo_acoplado.feature:642-646`;
   - hay que medir que los sabotajes P y P3 de este informe se ponen ROJOS y que la fuente actual sigue verde;
   - hay que actualizar el docblock caducado de `:387-392`.

Recomendado en la misma ronda, no bloquea: N1 (contar commits con `<Profiler>` en @s11), y N2 y N3
(corregir los porqués y los textos caducados). N4 va a la verificación en vivo del lead.
