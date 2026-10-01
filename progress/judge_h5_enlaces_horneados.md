# Review — F-04 `cascaron_semantico`, ENMIENDA 5 (H-5): @s46-@s72

**Veredicto:** APPROVED

> Revisado: la rama `claude/amazing-montalcini-d6abb1` en `c3f988f` contra `origin/main` (`e7a3e61`, que es también
> la base de la fusión: la rama está al día). Contrato: `features/cascaron_semantico.feature` (banner ENMIENDA 5,
> :225-397, con su «QUÉ NO CAMBIA» y sus dos excepciones; @s46-@s72, :2085-2963), INTACTO desde la puerta humana
> (`git diff 57f39ab HEAD -- features project-spec.md`, vacío). Spec: `project-spec.md` :1377-1700. Decisiones de Pablo:
> `progress/brief_h5_enlaces_horneados.md` §8-§9. Mapa: `progress/gherkin_h5_enlaces_horneados.md`. Evidencias:
> `progress/tdd_h5_enlaces_horneados.md` (fases A y B) y `progress/verificacion_viva_h5_enlaces_horneados.md` (@s63).
>
> SOLO LECTURA del repo. En el worktree he ejecutado `pnpm exec vitest run src/lib/puerta-cascaron.test.ts` (338/338) y
> `prettier --check` de los `.md` de la rama posteriores al `init` del lead (limpio). Los sabotajes de producción, en una
> COPIA fuera del repo (`…/scratchpad/judge-h5/copia`: `puerta-cascaron.ts` y su test de HEAD, con `node_modules`
> enlazado; control 338/338, y restaurada tras cada uno). Las sondas del humilde REAL, sobre copias del artefacto del
> CONTROL de @s63 (`…/scratchpad/judge-h5/h-1` a `h-5`). Ni suite completa, ni build, ni Stryker (hay un
> `mutation_tester` en curso en este worktree). `git status` del worktree, limpio antes y después.

## Cobertura de escenarios (@s ↔ test)

Puerta pura, `src/lib/puerta-cascaron.test.ts` (127 tests nuevos, de 211 a 338; el diff solo INSERTA):

- @s46: [x] `it` :1825. ANCLA de los 6 valores, en orden (:1840); la lista se pidió ≥ 1 vez (:1848); 0 y `[]`.
- @s47: [x] `it.each` :1889-1923, 9/9 filas, vía `comprobarUnLink` (:1871-1887).
- @s48: [x] :1925-1998, 16/16 (los segmentos de S-11, el ÚLTIMO incluido, y los tres controles tras `?` o `#`).
- @s49: [x] :2000-2018, 3/3.
- @s50: [x] :2023-2063, 11/11. La barra invertida, siempre como `\u005C` (una sola), también en las dos filas que el
  `.feature` escribe literal.
- @s51: [x] :2083-2143, 9/9, con las dos listas variantes (`listaSinLaRaiz`, `listaConLaRaizVacia`) y el 2º `Then`.
- @s52: [x] :2147-2202, 16/16, con el 2º `Then` en cada fila.
- @s53: [x] :2204-2229, 7/7, SIN `ficheros` y con el ANCLA EXACTA (`toEqual`).
- @s54: [x] :2231-2277, 6/6: campo ausente, `{ base: null }` y la base sin barra, que corta por S-12.
- @s55: [x] :2284-2316, 12/12, con el ANCLA DE SITIO A MANO (un único `</head>` por `split` e `indexOf`; nunca `cabezaDe`).
- @s56: [x] `it` :2319, las 5 líneas exactas y en orden.
- @s57: [x] :2358-2434, 7/7.
- @s58: [x] :2445-2490, 3/3 (`listaQueLanza`; el `artefactoInexistente` de @s26, sin cambios).
- @s59: [x] :2500-2611, 8/8, el extractor medido página a página.
- @s60: [x] `it` :2615.
- @s65: [x] :2637-2669, 5/5.
- @s66: [x] :2671-2709, 3/3, ANCLA por página.
- @s68: [x] :2716-2784, 8/8, con la lista pedida «ninguna» o «al menos 1».
- @s69: [x] `it` :2787.

Extremo a extremo, `src/pages/home-horneado.test.ts` (8 tests nuevos, de 42 a 50):

- @s61: [x] :721-743. ANCLA sobre el original (≥ 1 `href` con `/NailsLashStudioWeb/`, ≥ 1 con `…/assets/` y exactamente 1
  con el favicon, leídos con `.get('href')`), favicon de más de 0 B y «✓ Puerta del cascarón». El código 0 lo
  asevera el «H-3 control» de `cascaron` (:543-548), CITADO y no duplicado, como manda el contrato (`.feature`:2806).
- @s62: [x] `it.each(FIRMAS_DEL_H5)` :798-821 (datos :759-796), filas (a), (b) y (c). Cada una: ANCLA sobre la COPIA
  releída del disco; un número distinto de 0; su línea; la ÚNICA con « — link root-absoluto»; ningún «✓»; el original,
  releído e idéntico, con su favicon de más de 0 B.
- @s67: [x] :823-846. @s70: [x] :848-865. @s71: [x] :867-890. @s72: [x] :892-913.

A mano, por el lead (no son tests, por contrato):

- @s63: [x] `progress/verificacion_viva_h5_enlaces_horneados.md`. Lo he contrastado con sus registros. En
  `…/scratchpad/h5/s63-sabotaje.log`:65-68 sale con exit 1, y la única línea « — link root-absoluto» es la de la
  regla 1 con `"/favicon.svg"`. En `s63-control.log`:65-69 están las cinco ✓. El `index.html` del sabotaje trae
  `href="/favicon.svg"`.
- @s64: [ ] PENDIENTE POR CONTRATO. Se hace tras fusionar y publicar (H5-6), así que no bloquea esta revisión.

### Lo que pedía el encargo, comprobado

- [x] **Cada `Then` asevera de verdad (no es tautológico).** Las líneas se comparan con `toEqual` exacto, y los
      códigos en la notación del contrato (`enElContrato`: 0 o «≠ 0», nunca `toBe(1)`). La prueba de mordida, en la
      copia, aplica 25 desvíos de la spec. Caen 24, y cada uno lo atrapa el escenario que el mapa le asigna:
  - Limpieza:
    - recorte sin FF → 4 en @s52;
    - quitar antes de recortar → 6 en @s52.
  - Segmentos y regla 4:
    - segmentos sin el último → 2 en @s48;
    - `startsWith('.')` en vez de igualdad → 5 (la fila de `...` y las cuatro de @s65, como predice el
      `.feature`);
    - regla 4 sobre la ruta y no el `href` entero → 1 en @s50;
    - sin `&` en la clase → 1 en @s50.
  - Candidatos:
    - candidato sin barra invertida → 4 en @s50 y 2 en @s57;
    - candidato que acepta `//` → 1 en @s53;
    - candidatos solo de la 1.ª página → @s66 ×3 y @s56;
    - candidatos de `cabezaDe` → la fila `<body>` de @s55.
  - Orden de las reglas:
    - oculto después de los 0 B → 1 en @s65;
    - oculto antes de buscar en la lista → @s48 y @s65.
  - Resolución contra la lista:
    - la raíz pasa sin mirar → 3 en @s51;
    - búsqueda sin caja → `FAVICON.SVG` de @s48.
  - Cortes y base:
    - S-12 antes que S-3 → @s69;
    - `base &&` en vez de `!== null` → la fila `""` de @s68;
    - base sin la barra final → @s54 y @s68;
    - lista pedida siempre que la hay → @s58 ×2 y @s68.
  - Informe:
    - líneas de los `<link>` delante de las de hoy → @s56;
    - valor limpio en la línea → @s47 y @s52 ×4.
  - Guarda nueva:
    - `.every` → la fila 8 de @s59;
    - retirada → filas 1-2 de @s59;
    - puesta antes de las violaciones → filas 3-4 de @s59.

  El único que no cae, `bytes < 1` por `=== 0`, es equivalente (los bytes nunca son negativos), y la producción usa
  `=== 0`.

- [x] **Anclas positivas primero.** En cada test, el primer `expect` es el ANCLA del extractor (`extraerLinks`, el MISMO
      de las reglas y la guarda). En @s55 la sigue el ANCLA DE SITIO, y en @s60 las dos reglas de hoy. En el extremo a
      extremo, el ANCLA del sabotaje va delante de la puerta.
- [x] **Textos EXACTOS.** Busqué con `grep -F` los cinco textos de regla y las tres líneas nuevas. Están byte a byte en
      el `.feature`, en producción (:580-586, :1021, :1027 y :1070) y en los tests. Los tests NUNCA importan los
      `REGLA_LINK_*`: solo `REGLAS_DEL_CASCARON`, que es lo vigilado por @s60 (importaciones :5-30).
- [x] **Orden 4-1-2-5-3** (`reglaDelLink`, `src/lib/puerta-cascaron.ts`:661-699):
  - la 4 primero: `%`, `&` o la barra invertida en el `href` limpio ENTERO (:666), y después `//`, `.` o `..` en la RUTA
    (:672);
  - luego la 1 (:678), la 2 (:686) y la 5 (:690);
  - por último la 3 (:694), con `=== 0`.
- [x] **Cortes S-3 y S-12** (:1015-1032):
  - Solo saltan con algún candidato, en cualquier página, y S-3 va antes que S-12.
  - Los dos van ANTES de `listar()` y de `inspeccionarSitio`: no evalúan nada más.
  - Sin base es el campo ausente o `null` (`base = null`, :989, y `base !== null`, :1025); la cadena `""` cuenta como
    base declarada.
- [x] **La guarda** (:1066-1072):
  - Va DETRÁS de las violaciones (:1040-1042) y de la guarda de @s28 (:1053-1059), con `.some` y `> 0`.
  - Mira `extraerLinks` (:561), que es `ENLACE` + `ATRIBUTO_HREF` sobre el documento ENTERO.
  - `ENLACE` es global, pero solo se usa con `matchAll`, así que no arrastra `lastIndex`.
- [x] **La limpieza del `href`** (:595-600):
  - Primero recorta los cinco espacios ASCII, con `+`; DESPUÉS quita TAB, LF y CR, SIN `+`: el orden de WHATWG.
  - La línea lleva el `href` CRUDO (`violacionesDeLinks`, :729).
- [x] **`rutaDelHref` como prescribe la spec.** Se REUTILIZA (:670 → :737-739, el `split(/[?#]/)` de la anti-404 de
      `<a>`) y no hay ninguna regex anclada a `$`. Sonda propia: un `?` seguido de U+2028 resuelve, no da la regla 2.
- [x] **Las cuatro formas de la cabecera** «PARA EL `tdd_craftsman`»:
  - lo que se quita dentro, sin `+` (:596);
  - el oculto, sobre TODOS los segmentos, sin `slice(1)` (:641-643);
  - el `/` inicial sin base, con `slice(prefijo.length)` y `PREFIJO_SIN_BASE = '/'` (:609, :676 y :682), sin
    una regex con `^`;
  - la ruta, con `rutaDelHref`.
- [x] **El puerto opcional, con la forma E literal** (:1015-1032):
  - `let ubicaciones = new Map()`; dentro de `if (candidatos.length > 0)`, los dos cortes y después
    `ubicaciones = new Map(ficheros.listar()…)`;
  - las reglas se evalúan SIEMPRE sobre los candidatos;
  - sobre `ficheros` no hay `?.`, ni `??`, ni `!`, ni un `[]` por defecto;
  - las piezas: `ficheros?` en `PeticionPuertaCascaron` (:939), `ListaDeFicheros.listar()` y
    `FicheroDelArtefacto { ubicacion, bytes }` (:914-922).
- [x] **El humilde no lee el contenido de los ficheros.**
  - `listaReal.listar` (`tools/puerta-cascaron.ts`:65-71) es `rutasDeLosFicheros()` (:42-46: `readdirSync` recursivo,
    con `withFileTypes` y `isFile()`), más `ubicacionLogica` y `statSync(ruta).size`. No hay ningún `readFileSync` en
    la lista. El único sigue siendo el de las HTML de `listarHtml` (:55-58), como hoy.
  - Es perezoso: un método que solo llama la puerta, y siempre después de `existe()`.
  - Mis sondas del humilde REAL sobre copias del artefacto de @s63:
    - CONTROL → 0 y ✓;
    - `href` `…/FAVICON.SVG` → 1 por la regla 2 (en Windows, así que no hay ningún `existsSync`);
    - un oculto ANIDADO, `assets/.oculta/f.css` → regla 5;
    - la carpeta `static-loader-data` → regla 2;
    - un `.json` de la raíz → 0 (cualquier extensión).
  - Los 7 sabotajes del humilde de la bitácora (B5) completan la mordida de @s67 y de @s70-@s72.

### QUÉ NO CAMBIA

- [x] El diff toca 12 ficheros. No están entre ellos:
  - `tools/artefacto.ts`, F-05 (`terceros`, `puerta-terceros`) ni F-06 (`puerta-anclas`);
  - `vite.config.ts`, `index.html` ni `public/`;
  - `feature_list.json`, `package.json`, `stryker.config.json` ni las configs de Vitest.
- [x] `ArtefactoDeProduccion` e `inspeccionarSitio` no tienen ningún hunk: misma firma y mismo cuerpo (S-4).
      `extraerEnlaces` solo cambia de forma (delega en `hrefsDe`, :546-555) y da el mismo resultado. Fuera de su test, a
      la puerta solo la llama F-06, en `src/lib/puerta-anclas.test.ts`:432; esa página sigue saliendo por sus
      6 violaciones.
- [x] Ninguna línea de hoy cambia:
  - las de @s27, @s28 y @s29 son idénticas byte a byte; solo pasan por `fallaCerradaCon` (:969-971);
  - el `✓` y el `✗` del humilde están intactos (`tools/puerta-cascaron.ts`:83-91).
- [x] @s1-@s45 y sus fixtures no cambian. `puerta-cascaron.test.ts` no borra ninguna línea: solo añade 5 importaciones
      (:17-27). `htmlCrudo`, `paginaCompleta`, `artefactoCon` y `ficheroDe` siguen iguales; el `<link>` se INSERTA con un
      ayudante NUEVO, `conElementos` (:1804).
- [x] Las dos excepciones aprobadas están dentro de su alcance:
  - `elementos(etiqueta)` pasa a `elementosDe(html, etiqueta)`, con el MISMO patrón y el MISMO `atributosDe`
    (`home-horneado.test.ts`:247-256), sin un segundo patrón y sin reasignar `html`;
  - @s67 y @s70-@s72 existen.
  - El extremo a extremo no importa nada de `src/` ni hace un build nuevo; cada sabotaje usa su propia copia dentro del
    `temporal` del fichero.

## Disciplina TDD

- ¿Producción sin test que la pida? NO.
  - Cada pieza la pide una fila. Entre otras:
    - `esOculta`, @s65;
    - `ENTRADA_DE_LA_RAIZ` y la búsqueda de la raíz, @s51;
    - `esBaseUtilizable` entero, @s54 y @s68;
    - el orden de los cortes, @s69;
    - la guarda, @s59.
  - `hrefsDe`, `fallaCerradaCon` y `rutasDeLosFicheros` son refactors en verde.
  - Los `REGLA_LINK_*` exportados siguen la convención del fichero (todos los `REGLA_*` se exportan).
  - Lo confirman los 24 sabotajes de arriba: no hay ninguna rama que ningún test vea.
- ¿Evidencia de Rojo → Verde → Refactor? SÍ.
  - Fase A: C1-C21. Cada ciclo con el ROJO citado (mensaje y número de fallos), el verde mínimo y las trampas
    declaradas y retiradas: «pedir la lista siempre», «sin base, `null`», un solo espacio, el orden S-12/S-3.
  - Las filas que nacieron verdes respecto del ciclo anterior se midieron con un sabotaje: @s53, @s55, @s56, @s59
    fila 8, @s66 y @s68 fila 8. Las de @s52 se volvieron a medir en C14.
  - Fase B: rojo medido contra el humilde de hoy (9 fallos, S-3) y contra la puerta previa a H-5 (los 5 que el
    contrato da por rojos), más 7 sabotajes del humilde (B5).

## Calidad

- Funciones cortas y con un solo motivo:
  - `limpiar`, `esCandidato`, `tieneSegmentosQueNoInterpreta`, `esOculta`, `esBaseUtilizable`, `candidatosDe` y
    `violacionesDeLinks` son de 1 a 6 líneas;
  - `reglaDelLink` (:661-699) es una cascada de cláusulas de guarda en el orden de la spec, que se lee de arriba abajo.
- Nombres reveladores y sin números mágicos: `PREFIJO_SIN_BASE`, `ENTRADA_DE_LA_RAIZ`, `BARRA_INVERTIDA`,
  `NO_INTERPRETABLE`, el tipo `Candidato` (ruta, `href` crudo y limpio).
- Contrato de errores:
  - todo fallo de una línea sale por `fallaCerradaCon`;
  - una lista que lanza cae en la rama de @s29;
  - el humilde escribe en el canal de error y fija `process.exitCode`.
- Arquitectura: la lógica pura vive en `src/lib/` sin `node:fs`, y la E/S en `tools/`. El humilde no decide nada: ni
  filtra ocultos ni HTML, porque eso es de la regla 5, que se muta.
- Tests:
  - todos los ayudantes son nuevos y los dobles están escritos a mano;
  - en el cuerpo de los `describe` solo hay datos literales (`ROTO` en @s55; `FAVICON` y `CON_EL_FAVICON` en @s68), y
    todo cálculo va dentro del `it` (`docs/verification.md`).
- Observación sin acción: el humilde recorre el artefacto dos veces por ejecución (`listarHtml` y `listar`, ambos con
  `rutasDeLosFicheros()`, `tools/puerta-cascaron.ts`:55-71). Son 42 entradas y memorizarlas añadiría estado.

## Checkpoints

- C1: [x]
  - Ficheros y docs base presentes.
  - El `init` del lead, a las 18:44-18:46 sobre `d73ce5a`, terminó verde: 56 ficheros, 1955/1955, `tsc`, ESLint y
    Prettier a 0 (`…/scratchpad/h5-init-final.log`).
  - HEAD solo le añade un `.md`, y lo he pasado por `prettier --check`.
  - No lo he repetido por orden del lead: hay un Stryker en curso.
- C2: [x] Ninguna feature `in_progress`: F-04 sigue `done`, que es el patrón de las ENMIENDAS 1-4, y
  `feature_list.json` no se toca. `progress/current.md` describe esta sesión, aunque arrastra entradas viejas, que
  son deuda previa.
- C3: [x] `src/` solo cambia en `lib/` y en tests. Sin dependencias nuevas. Sin logs de depuración ni TODO: los únicos
  `console` son la salida del humilde.
- C4: [x] Hay un test por módulo. El extremo a extremo usa copias reales en un temporal y el subproceso REAL. El puerto
  de la lista se dobla a mano en la frontera; no se moquea `fs`. La suite estaba verde en el `init` del lead.
- C5: [ ] Pendiente del lead: la entrada de `progress/history.md` al cerrar, tras H5-6.
- C6: [x]
  - Existen `.feature` y la sección de la spec.
  - Los `@s` van tagueados y cada `Then` es medible.
  - El mapa @s → test está en la bitácora y aquí.
  - No hay producción que nadie pidiera.
- C7: [ ] Es del `mutation_tester`, que está en curso: 100 % sobre `src/lib/puerta-cascaron.ts` con 0 exclusiones.
  Los sabotajes de arriba no lo sustituyen.

## Cambios requeridos

Ninguno bloqueante.

## Menores (no bloquean; para el lead o una ronda futura)

1. **Ley 2 en la fase B.** Los seis escenarios de extremo a extremo se escribieron en un solo paso: es la desviación
   declarada 2 (`progress/tdd_h5_enlaces_horneados.md`, «Desviaciones declaradas (FASE B)»), por orden del lead.
   - Lo mitigan los rojos medidos test a test contra dos líneas base y los 7 sabotajes del humilde.
   - Que no se convierta en costumbre: el coste de un `beforeAll` con build se paga una vez por corrida, no por test.
2. **Refactor con el fichero en rojo (B1).** `elementos` → `elementosDe` se hizo con `home-horneado.test.ts` en rojo,
   por dos tests ajenos (el corte S-3 de la fase A). Sus 19 dependientes estaban y siguieron en verde, y está
   declarado. Aun así, es justo el olor de «refactor en rojo» de `docs/tdd.md`.
3. **Commits intermedios con `pnpm build` en 1.** Entre `3d218af` y `5145e70` el build sale con 1 (hallazgo 1 de la
   fase A): el humilde aún no pasaba `ficheros`. Ese tramo de la rama no se puede bisecar. La fusión tiene que ser
   SQUASH, como ya decide H5-6.
4. **`inspeccionarArtefacto` ya ronda las 90 líneas** (`src/lib/puerta-cascaron.ts`:988-1075), con seis salidas: dos
   guardas viejas, dos cortes, las violaciones y la guarda nueva. No es un defecto: la forma E y el sitio de la guarda
   los prescribe el contrato. Si alguien lo trocea, que vuelva a medir la mutación, porque la forma E se eligió
   justamente por no dejar mutantes equivalentes.
