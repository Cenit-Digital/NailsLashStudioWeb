# TDD — F-04 `cascaron_semantico`, ENMIENDA 5 (H-5), FASE A: la puerta PURA — 2026-10-01

> Autor: `tdd_craftsman`. Worktree `.claude/worktrees/amazing-montalcini-d6abb1`, rama
> `claude/amazing-montalcini-d6abb1`, desde `df01310`. Contrato APROBADO por el humano
> (`features/cascaron_semantico.feature`, banner ENMIENDA 5; puerta humana en `57f39ab`): escenarios de
> puerta pura @s46-@s60, @s65, @s66, @s68 y @s69. Spec: `project-spec.md` §Feature 4 → «Enmienda 5
> (2026-10-01)». Mapa: `progress/gherkin_h5_enlaces_horneados.md` (forma E del cableado, §2 y §10-§11).
> Decisiones de Pablo: `progress/brief_h5_enlaces_horneados.md` §8-§9.
>
> Alcance de la FASE A: SOLO `src/lib/puerta-cascaron.ts` y `src/lib/puerta-cascaron.test.ts`. NO se
> tocan `tools/` ni `src/pages/` (FASE B: el humilde y el extremo a extremo @s61, @s62, @s67, @s70-@s72),
> ni `ArtefactoDeProduccion`, ni `inspeccionarSitio`, ni ningún ayudante, fixture o llamada de @s1-@s45.
> `feature_list.json` no se toca (F-04 sigue `done`, como en las ENMIENDAS 1-4).
>
> Entorno: Node 22.15.0, Windows. Ficheros modificados SOLO con Bash y scripts Node
> (`scratchpad/h5/tdd-a/aplicar.mjs` + un parche por paso; la barra invertida se genera con
> `String.fromCharCode(92)`). Durante el ciclo solo se corre `pnpm exec vitest run
> src/lib/puerta-cascaron.test.ts` (y `pnpm typecheck`). Línea base del fichero: 211 tests en verde.

## Ciclos Rojo → Verde → Refactor

### C1 · @s46 (CONTROL: un `<link>` de cada clase, todos resuelven; la lista se pidió)

- Test: `@s46 un <link> de cada clase del artefacto real…` (ANCLA de 6 valores en orden, «la lista se
  pidió ≥ 1 vez», exit 0, 0 líneas). Ayudantes NUEVOS: `listaDeReferencia`, `dobleDeLaLista`,
  `conElementos` (inserta antes de `</head>` o `</body>`), `puertaSobreLaHome`.
- ROJO visto: `TypeError: extraerLinks is not a function` (1 failed | 211 passed).
- VERDE mínimo: `extraerLinks` exportado (`ENLACE` + `ATRIBUTO_HREF` sobre el documento entero); el
  puerto `ListaDeFicheros` / `FicheroDelArtefacto` y el campo OPCIONAL `ficheros?` de
  `PeticionPuertaCascaron`; en `inspeccionarArtefacto`, `if (ficheros !== undefined) ficheros.listar()`
  (trampa deliberada: pedirla SIEMPRE que esté; la generalizan @s48 y @s58). 212 passed; `tsc` 0.
- REFACTOR: `extraerEnlaces` y `extraerLinks` compartían el cuerpo → `hrefsDe(html, etiquetas)`.
  212 passed; `tsc` 0.

### C2 · @s47 (regla 1: bajo base declarada, sin el prefijo; 9 filas)

- Test: `it.each` con las 9 filas del `Examples:` escritas a mano (la del espacio, con su escape), sobre
  el ayudante NUEVO `comprobarUnLink(rel, href, codigo, lineas)`: ANCLA (`extraerLinks` contiene el
  `href` CRUDO), código en la notación del contrato (`enElContrato`: 0 o «distinto de 0») y líneas EXACTAS.
- ROJO visto: 8 failed (las 8 filas que esperan la regla 1), `AssertionError: expected +0 to be 'distinto
  de 0'`; la fila 1 (CONTROL) en verde, como dice el contrato.
- VERDE mínimo: `REGLA_LINK_SIN_PREFIJO`; `violacionesDeLinks(paginas, base)` detrás de las de hoy:
  candidato = `RUTA_INTERNA` sobre el `href` limpio; con base y sin el prefijo, la regla 1 con el valor
  CRUDO. `limpiar` solo quita UN espacio inicial (lo que pide la fila del espacio; la generaliza @s52).
  221 passed; `tsc` 0.
- REFACTOR: ninguno todavía (el doble `limpiar(href)` se recoge al crecer las reglas en C3).

### C3 · @s48, primer grupo (regla 2: la ubicación que nombra la RUTA, literal y con su caja; 10 filas)

- Test: `it.each` de @s48 con las filas 1-6 y 11-14 (los 6 CONTROLES y las 4 de la regla 2), con
  `comprobarUnLink('stylesheet', …)`.
- ROJO visto: 4 failed (`no-existe.svg`, `FAVICON.SVG`, `assets` y `.../favicon.svg`), `expected +0 to be
  'distinto de 0'`. Los 6 controles en verde (aún no había regla que mirase la lista).
- VERDE mínimo: `REGLA_LINK_SIN_FICHERO`; `reglaDelLink(href, ubicaciones, base)` con la RUTA sacada con
  `rutaDelHref` (la de la anti-404 de `<a>`, REUTILIZADA: la exigen los controles `?v=2`, `#x`,
  `?v=/../x`, `#/./x` y `#//x`); con base: sin el prefijo, la 1; si no, `dist/<resto>` buscado por
  igualdad EXACTA en un `Set` de las ubicaciones que da `ficheros.listar()`. Sin base, `return null`
  (trampa: ninguna fila sin base todavía). 231 passed; `tsc` 0.
- REFACTOR: `violacionesDeLinks` pasa de dos `filter` a `flatMap` sobre `reglaDelLink` (se va el doble
  `limpiar`). En verde.

### C4 · @s48, segundo grupo (los segmentos `.`, `..` y `//` de la RUTA son la regla 4, S-11; 6 filas)

- Test: las filas 7-10, 15 y 16 de @s48, añadidas a la misma tabla en su sitio.
- ROJO visto: 6 failed, `expected [ Array(1) ] to deeply equal [ Array(1) ]`: la puerta daba la regla 2
  (`dist/./favicon.svg`, `dist/x/..`, `dist/.` no están) o la 1 (`/./favicon.svg`), justo la acusación
  FALSA que S-11 evita.
- VERDE mínimo: `REGLA_LINK_NO_INTERPRETA` (texto de S-11) y, nada más sacar la ruta y ANTES de la base:
  `ruta.includes('//') || ruta.split('/').some((segmento) => segmento === '.' || segmento === '..')`
  (TODOS los segmentos, el último incluido; igualdad, nunca `startsWith('.')`). 237 passed; `tsc` 0.
- REFACTOR: el predicado sale a `tieneSegmentosQueNoInterpreta(ruta)`, con el porqué. `prettier --write`
  sobre los dos ficheros (solo partió una fila de @s47); barras invertidas contadas antes y después:
  17 en el test y 51 en producción, sin cambios. 237 passed.

### C5 · @s49 (regla 3: el fichero existe y pesa 0 bytes; 3 filas)

- Test: las 3 filas, `comprobarUnLink('icon', …)`.
- ROJO visto: 2 failed (`vacio.svg` y `vacio.svg?v=2`), `expected +0 to be 'distinto de 0'`; la de 1 byte
  (CONTROL), en verde.
- VERDE mínimo: `REGLA_LINK_VACIO`; el `Set` pasa a `Map` ubicación → bytes (forma E:
  `new Map(ficheros.listar().map((fichero) => [fichero.ubicacion, fichero.bytes]))`, que compila con
  `strict` por el tipo declarado) y, tras «no está» → regla 2, `bytes === 0` → regla 3 (nunca `< 1`).
  240 passed; `tsc` 0.
- REFACTOR: ninguno.

### C6 · @s50 (regla 4: `%`, `&` y la barra invertida, también AL PRINCIPIO, S-7; 11 filas)

- Test: las 11 filas; la barra invertida va SIEMPRE con su escape `u005C` (también en las dos filas que
  el `.feature` escribe literal), así que el fichero de test lleva 14 escapes nuevos (31 barras en total,
  contadas con `String.fromCharCode(92)`).
- ROJO visto: 10 failed. Cinco daban OTRA línea (`expected [ Array(1) ] to deeply equal [ Array(1) ]`: la
  regla 1 en `/…cdn`, `NailsLashStudioWeb…favicon` y `/favicon%2Esvg`, la 2 en `%2Esvg` y `no%20existe`)
  y cinco salían con 0 (`&amp;`, y las cuatro que EMPIEZAN por la barra invertida, que no eran
  candidatas). El CONTROL `?v=2#x`, en verde.
- VERDE mínimo: `NO_INTERPRETABLE = /[%&` + barra + `]/` sobre el `href` limpio ENTERO, lo PRIMERO de la
  resolución; `esCandidato(limpio)` = `esRutaInterna(limpio) || limpio.startsWith(BARRA_INVERTIDA)`
  (S-7). Barras comprobadas con `node -e`: `BARRA_INVERTIDA = '` + 2 barras + `'` y la clase con 2
  (producción pasa de 51 a 55). 251 passed; `tsc` 0. `prettier --check` pidió juntar dos filas: `prettier --write` (barras: 31, sin cambios).
- REFACTOR: ninguno (el doble `limpiar` del candidato y de la regla se recoge en C12, cuando la puerta
  necesite los candidatos para pedir la lista).

### C7 · @s51 (solo la RAÍZ va a `index.html`, y se BUSCA en la lista; 9 filas)

- Test: las 9 filas con su base (`CON_LA_BASE` o `SIN_BASE`, este último el campo AUSENTE, no
  `undefined`), su lista (`listaDeReferencia`, y los ayudantes NUEVOS `listaSinLaRaiz` y
  `listaConLaRaizVacia`) y el 2º `Then` («la lista se pidió ≥ 1 vez»), con `rel="alternate"`.
- ROJO visto: 4 failed: la raíz con base (`expected 'distinto de 0' to be +0`: buscaba `dist/`), `/x/` y
  `/` sin base (`expected +0 to be 'distinto de 0'`: sin base no se resolvía nada) y la raíz de 0 bytes
  (otra línea: la 2 y no la 3). La fila 7 (raíz con la lista SIN `dist/index.html`) salió VERDE a la
  primera, por COINCIDENCIA: buscaba `dist/` y daba la 2, la línea que espera; tras el verde sigue verde
  por la razón buena (busca `dist/index.html` y no está), y mata «la raíz pasa sin mirar».
- VERDE mínimo: el prefijo es `base ?? PREFIJO_SIN_BASE` (`'/'`): sin base, la regla 1 no puede aplicar
  (todo candidato que llega ahí empieza por `/`) y el resto es la ruta sin su `/` inicial (con `slice`,
  nunca con una regex anclada a `^`); resto vacío → `dist/index.html` (`ENTRADA_DE_LA_RAIZ`), que se
  busca en la lista como cualquier otra ubicación. 260 passed; `tsc` 0; `prettier` limpio.
- REFACTOR: la `ubicacion` sale a su propia constante (la usará la regla 5). En verde.

### C8 · @s52 (la limpieza del navegador; el valor CRUDO en la línea; 16 filas)

- Test: las 16 filas con sus escapes (TAB `u0009`, LF `u000A`, FF `u000C`, CR `u000D`, espacio `u0020`)
  y el 2º `Then` («la lista se pidió ≥ 1 vez») en cada una. 77 barras en el test tras escribirlo.
- ROJO visto: 10 failed. Las de control que conservaban un carácter (`expected 'distinto de 0' to be
  +0`: daban la regla 2 de `favicon.svg ` o de `fav` + TAB + `icon.svg`) y las de FF o varios caracteres
  al principio (`expected +0 to be 'distinto de 0'`: el `href` quedaba FUERA, sin línea: la falla
  abierta). Seis en verde a la primera: tres con línea que ya cuadraban (un solo espacio inicial, y el
  espacio y el FF de DENTRO, que no se quitan) y tres CONTROLES que empiezan por TAB, FF o espacio + FF
  (quedaban fuera con 0 líneas, como esperan, y su 2º `Then` pasaba solo porque la trampa de C1 pide la
  lista SIEMPRE que la hay). Esos tres se vuelven a medir con sabotaje en C13, cuando la lista se pida
  solo con candidatos.
- VERDE mínimo: `limpiar` = recorte de `^[TAB LF FF CR espacio]+|[…]+$` (bandera `g`) y, DESPUÉS, quitar
  `[TAB LF CR]` (bandera `g`, SIN `+`), el orden de WHATWG. Barras contadas: producción de 55 a 66 (8 + 3).
  276 passed; `tsc` 0.
- REFACTOR: `prettier --write` juntó una fila del test (barras: 77, sin cambios). En verde.

### C9 · @s53 (lo que NO es root-absoluto queda fuera, sin la lista; 7 filas)

- Test: las 7 filas, con la base declarada y la petición SIN `ficheros`; ANCLA EXACTA (`toEqual`), exit 0
  y 0 líneas.
- Nacen en VERDE (283 passed), como dice el contrato: son CONTROLES de que la puerta de hoy no acusa lo
  que no es candidato. Para no fiarme de un verde a la primera, SABOTAJE medido: con el candidato
  `limpio.startsWith('/')` (acepta `//`), 1 failed, la fila `//cdn.ejemplo/x.css` (`expected 1 to be
  +0`); revertido (`git diff` de producción vacío), 283 passed.
- VERDE y REFACTOR: sin cambios de producción.

### C10 · @s54 (sin base, la ruta entera; una base sin barra final CORTA con la línea de la base; 6 filas)

- Test: las 6 filas; la base de la fila es `SIN_BASE` (campo ausente), `{ base: null }` o declarada.
- ROJO visto: 1 failed, la fila 6 (base `"/NailsLashStudioWeb"`): `expected [ Array(1) ] to deeply equal
  [ Array(1) ]`, daba la regla 2 de `dist//favicon.svg`, la acusación falsa que S-12 evita. Las filas 1-5
  nacen en VERDE: las cubre el verde de C7 (el prefijo `base ?? '/'`), que forzaron @s51 filas 5 y 8.
- VERDE mínimo: el corte de S-12 con su línea EXACTA y la base TAL CUAL, antes de pedir la lista, solo
  con la condición que pide la fila: `base !== null && !base.endsWith('/')` (las demás condiciones del
  predicado y «solo con candidatos» las fuerza @s68). 289 passed; `tsc` 0.
- REFACTOR: `prettier --write` (una firma de tipo y una fila; barras sin cambios: 77 y 66). En verde.

### C11 · @s55 (todo `rel`, la caja de la etiqueta y el `<link>` del `<body>`; 12 filas)

- Test: las 12 filas; ANCLA del extractor, ANCLA DE SITIO medida A MANO sobre el texto (un único
  `</head>` y la posición del `href` respecto de él, con `indexOf`, nunca con `cabezaDe`), exit ≠ 0 y la
  línea EXACTA de la regla 2.
- Nacen en VERDE (301 passed): el extractor ya era el del documento entero, con la bandera `i`, y sin
  filtrar por `rel`. SABOTAJE medido: con los candidatos sacados de `cabezaDe(pagina.html)`, 1 failed, la
  fila del `<body>` (`expected +0 not to be +0`); revertido con `git checkout` del fichero de producción,
  301 passed.
- VERDE y REFACTOR: sin cambios de producción; `prettier --write` en el test (barras: 77).

### C12 · @s56 (el informe con dos páginas: orden y ruta lógica)

- Test: el listado da `dist/servicios/index.html` y luego `dist/index.html`; 5 líneas EXACTAS en orden.
- Nace en VERDE (302 passed): las de hoy van delante (`[...inspeccionarSitio, ...violacionesDeLinks]`) y
  los `<link>` se recorren con `flatMap` en el orden del listado y de aparición. SABOTAJE medido: con las
  de los `<link>` DELANTE, 1 failed (`expected [ …(5) ] to deeply equal [ …(5) ]`); revertido, 302 passed.
- VERDE y REFACTOR: sin cambios de producción.

### C13 · @s57 (sin la lista, CORTA si hay candidatos; si no, lo de hoy; 7 filas)

- Test: las 7 filas con la petición SIN `ficheros`; ANCLA EXACTA, código y líneas.
- ROJO visto: 5 failed (las filas 1-3, 6 y 7): `expected [ Array(1) ] to deeply equal [ Array(1) ]` (sin
  lista, la puerta resolvía contra un mapa vacío y daba la regla 2, la 1 o la 4) y, en la fila 2,
  `expected [ …(2) ] to deeply equal [ Array(1) ]` (el title Y la regla 2: el informe parcial que S-3
  prohíbe). Las filas 4 y 5 (sin candidatos) en verde: lo de hoy.
- VERDE mínimo: `hayCandidatos && ficheros === undefined` → la línea del corte de S-3, sola, antes de
  evaluar nada (detrás del corte de S-12, que ya existía: el orden lo fija @s69). 309 passed; `tsc` 0.
- REFACTOR: los candidatos se calculaban dos veces → `candidatosDe(paginas)` (tipo `Candidato`: ruta
  lógica de la página y `href` crudo) una sola vez en `inspeccionarArtefacto`; `violacionesDeLinks` recibe
  los candidatos y el corte usa `candidatos.length > 0`. 309 passed; `tsc` 0; `prettier` limpio.

### C14 · @s58 (la lista se pide SOLO con candidatos; si revienta, la rama de @s29; 3 filas)

- Test: las 3 filas con una lista cuyo método LANZA `EACCES: lista de prueba` (ayudante NUEVO
  `listaQueLanza`); el `dist/` ausente es el `artefactoInexistente` de @s26, que no cambia.
- ROJO visto: 2 failed: sin candidatos (`expected 'distinto de 0' to be +0`: la trampa de C1 pedía la
  lista SIEMPRE y la puerta caía por la rama de @s29) y con `dist/` ausente (`expected [ Array(1) ] to
  deeply equal [ Array(1) ]`: la línea de @s29 en vez de la de @s26). La fila 1 (con candidato) en verde.
- VERDE mínimo: la FORMA E del mapa, tal cual: `let ubicaciones = new Map()`; `if (candidatos.length > 0)
  { if (ficheros === undefined) return <corte S-3>; ubicaciones = new Map(ficheros.listar()…) }`; y las
  reglas se evalúan SIEMPRE sobre los candidatos, sin otro `if`. Fuera el `ficheros !== undefined` de C1:
  ni `?.`, ni `??`, ni `!`, ni un `[]` por defecto sobre `ficheros`. 312 passed; `tsc` 0; `prettier`
  limpio.
- SABOTAJES pendientes de C8 (ahora el 2º `Then` de @s52 muerde): sin FF en la clase del recorte, 4
  failed (los controles `SP FF … FF SP` y `FF …`, por «la lista se pidió», y las dos filas con FF al
  principio, por sus líneas); sin TAB en las dos clases, 4 failed (el control `TAB …`, por «la lista se
  pidió», `fav TAB icon`, los siete del final y los siete del principio). Revertidos: 312 passed.
- REFACTOR: ninguno (la forma E ya es la definitiva del cableado).

### C15 · @s59 (la guarda del extractor nuevo; 8 filas)

- Test: las 8 filas; la página «con `<link rel="canonical">` SIN href en lugar de su canónica» la da el
  ayudante NUEVO `conLaCanonicaSinHref(opciones)` (`htmlCrudo({ canonica: null })` más ese `<link>`). El
  1er `Then` mira el extractor en CADA página del artefacto (la fila 8 trae dos).
- ROJO visto: 2 failed, las filas 1 y 2 (con la lista y sin ella): `expected +0 to be 'distinto de 0'`,
  la puerta de hoy salía con 0, el CAMBIO DE VEREDICTO declarado del banner. Las filas 3-8 en verde (la
  guarda de @s28, el title y los controles).
- VERDE mínimo: la guarda DETRÁS de la de @s28: `paginas.some((pagina) => extraerLinks(pagina.html)
  .length > 0)`, con su línea EXACTA. 320 passed; `tsc` 0; `prettier` limpio.
- SABOTAJE medido (`.some` → `.every` en la guarda nueva): 1 failed, la fila 8 (dos páginas); restaurado
  desde una copia, 320 passed.
- REFACTOR: ninguno.

### C16 · @s60 (las cinco reglas en `REGLAS_DEL_CASCARON`)

- Test: en `puerta-cascaron.test.ts` (importa `REGLAS_DEL_CASCARON`): ANCLA (`title ausente o vacío` y
  `href interno sin fichero en dist/`), cada uno de los cinco textos, escritos A MANO, exactamente 1 vez,
  y ninguna regla con «origen» ni «placeholder».
- ROJO visto: `expected [ +0, +0, +0, +0, +0 ] to deeply equal [ 1, 1, 1, 1, 1 ]`.
- VERDE mínimo: las cinco constantes al final de `REGLAS_DEL_CASCARON`. La de la regla 5,
  `REGLA_LINK_OCULTO`, nace AQUÍ (la pide este test) y la usa la resolución en C17 (@s65).
  `REGLA_RUTA_AUSENTE` sigue fuera, hueco DECLARADO (@s60, puerta humana). 321 passed; `tsc` 0.
- REFACTOR: `prettier --write` partió la constante de la regla 5 (barras: 81 y 66).

### C17 · @s65 (regla 5: un fichero OCULTO de la lista, S-8; 5 filas)

- Test: las 5 filas, `comprobarUnLink('icon', …)`.
- ROJO visto: 3 failed: `.vite/manifest.json` y `assets/.oculto.css` salían con 0 (`expected +0 to be
  'distinto de 0'`: están en la lista y pesan más de 0) y `.oculto-vacio.svg` daba la regla 3 (`expected
  [ Array(1) ] to deeply equal [ Array(1) ]`). El CONTROL y `.vite/no-existe.json` (la 2), en verde.
- VERDE mínimo: `esOculta(ubicacion)` = algún segmento de `dist/<resto>` empieza por `.` (TODOS los
  segmentos, sin `slice(1)`), mirado DESPUÉS de «no está en la lista» y ANTES de los 0 bytes: el orden
  4-1-2-5-3 de la spec. 326 passed; `tsc` 0; `prettier` limpio.
- REFACTOR: ninguno.

### C18 · @s66 (basta UN candidato en CUALQUIER página; 3 filas)

- Test: el listado da `dist/index.html` (sin candidatos) y `dist/servicios/index.html` (uno); con la
  lista de referencia, sin ella y con la que lanza; ANCLA por página, exit ≠ 0 y la línea EXACTA.
- Nacen en VERDE (329 passed): `candidatosDe` recorre TODAS las páginas y el corte mira
  `candidatos.length > 0`. SABOTAJE medido (candidatos solo de la 1.ª página, `paginas.slice(0, 1)`):
  4 failed, las 3 filas de @s66 y @s56; restaurado desde una copia, 329 passed.
- VERDE y REFACTOR: sin cambios de producción.

### C19 · @s68 (S-12 entero: cada condición del predicado, `/` utilizable, sin candidatos lo de hoy, la lista NO se pide; 8 filas)

- Test: las 8 filas; el 2º `Then` («la lista se pidió 0 veces / al menos 1») en la notación del contrato
  (`'ninguna'` o `'al menos 1'`); la línea de la base la arma el ayudante `lineaDeLaBase(base)` con el
  texto escrito a mano y la base TAL CUAL.
- ROJO visto: 4 failed (`./`, `//cdn.tercero.com/`, la expresión dinámica y `https://cdn.ejemplo/`, las
  bases que ACABAN en `/`): `expected 'al menos 1' to be 'ninguna'`, la puerta pedía la lista y daba la
  regla 1. En verde: la cadena vacía y la config en una línea (ya las cortaba el `endsWith` de C10), el
  CONTROL `/` y `./` sin candidatos (pasaba solo porque `./` acaba en `/`).
- VERDE mínimo: `esBaseUtilizable(base)` = `esRutaInterna(base) && base.endsWith('/')` (empieza por `/`,
  no por `//`, y acaba en `/`), y el corte DENTRO de `if (candidatos.length > 0)`, antes de pedir la
  lista. Las dos cosas a la vez porque la tabla las exige juntas: SABOTAJE medido con el predicado nuevo
  y el corte FUERA del `if`, 1 failed, la fila 8 (`./` sin candidatos); restaurado, 337 passed. El corte
  de S-12 queda, de momento, DELANTE del de la lista ausente (el orden que traía de C10/C13): lo decide
  @s69. 337 passed; `tsc` 0; `prettier` limpio.
- REFACTOR: ninguno.
