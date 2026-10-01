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
src/lib/puerta-cascaron.test.ts` (y `pnpm typecheck`). Línea base del fichero: 211 tests en verde.

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

### C20 · @s69 (S-12 va DESPUÉS del corte por lista ausente)

- Test: la página con el favicon bajo la base, base `./` y SIN la lista; ANCLA EXACTA, exit ≠ 0 y SOLO la
  línea de la lista.
- ROJO visto: `expected [ Array(1) ] to deeply equal [ Array(1) ]`: salía la línea de la BASE (el orden
  heredado de C10/C13).
- VERDE mínimo: dentro del `if (candidatos.length > 0)`, el corte por lista ausente primero y el de la
  base después. 338 passed; `tsc` 0; `prettier` limpio.

### C21 · REFACTOR final (en verde, sin test nuevo)

- `reglaDelLink` recibe el `href` YA limpio: `Candidato` lleva `ruta`, `href` (crudo, el valor de la
  línea) y `limpio`, que `candidatosDe` calcula una sola vez (antes se limpiaba dos veces). Comentario de
  la resolución ESTRICTA con su orden (4-1-2-5-3).
- `fallaCerradaCon(linea)`: las seis salidas de una sola línea (la rama de @s29, la guarda de @s27, los
  dos cortes nuevos, la guarda de @s28 y la nueva) comparten el `{ codigoSalida: CODIGO_FALLO, lineas:
[linea] }`. Ninguna línea de hoy cambia de texto.
- Las constantes de las reglas, en el orden de su número (1, 2, 3, 4, 5); comentario del campo
  `ficheros?` (falla cerrado; es un método) y del bloque de los cortes (forma E, sin `?.`, `??` ni `!`).
- 338 passed; `tsc` 0; `eslint` 0 en los dos ficheros; `prettier --check` limpio; barras en producción:
  66, sin cambios.

## Estado: VERDE (FASE A)

| Fichero                                | Cambio                                                                                                                                                                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/puerta-cascaron.ts`           | `extraerLinks` (exportado, ANCLA) y `hrefsDe`; limpieza, candidato, resolución ESTRICTA y sus 5 reglas; el puerto OPCIONAL `ficheros?` (`ListaDeFicheros`, `FicheroDelArtefacto`) en la forma E; los dos cortes; la guarda nueva; las 5 reglas en `REGLAS_DEL_CASCARON`; `fallaCerradaCon` |
| `src/lib/puerta-cascaron.test.ts`      | 127 tests NUEVOS (una fila de `Examples:` por test), al final del fichero, con ayudantes NUEVOS; 0 líneas borradas o cambiadas (solo 5 importaciones añadidas)                                                                                                                             |
| `progress/tdd_h5_enlaces_horneados.md` | Esta bitácora                                                                                                                                                                                                                                                                              |

Recuento (medido): `src/lib/puerta-cascaron.test.ts` pasa de 211 a **338 tests, todos en verde**; 127 nuevos =
las 127 filas de la puerta pura (@s46 1, @s47 9, @s48 16, @s49 3, @s50 11, @s51 9, @s52 16, @s53 7, @s54 6,
@s55 12, @s56 1, @s57 7, @s58 3, @s59 8, @s60 1, @s65 5, @s66 3, @s68 8, @s69 1). `git diff df01310`: el test,
1058 inserciones y 0 borrados; producción, 264 líneas tocadas. `tools/` y `src/pages/` intactos.

Regresiones (medidas al cerrar la fase): `pnpm exec vitest run src/lib/puerta-cascaron.test.ts
src/lib/puerta-anclas.test.ts src/lib/seo.test.ts` da 3 ficheros y **420 passed** (la llamada de F-06 y @s34
siguen en verde); `pnpm exec vitest run src/lib/trampas-del-horneado.test.tsx` da **45 passed** (los
experimentos de @s32, @s33 y @s44, que corren el humilde de HOY: `head-correcto` solo trae la canónica
absoluta, sin candidatos); `pnpm typecheck` 0; `pnpm exec eslint src/lib/puerta-cascaron.ts
src/lib/puerta-cascaron.test.ts` 0; `pnpm exec prettier --check` de los dos, limpio. NO he corrido la suite
completa ni Stryker (los corre el lead o el `mutation_tester`). `git status` limpio tras cada medida.

## Trazabilidad (@s → test, `src/lib/puerta-cascaron.test.ts`)

- @s46 (CONTROL, un `<link>` de cada clase; ANCLA de 6; la lista se pidió) → `it` de :1825.
- @s47 (regla 1, 9 filas) → `it.each` de :1889-1923, vía `comprobarUnLink` (:1871).
- @s48 (regla 2 y los segmentos de S-11, 16 filas) → `it.each` de :1925-1998.
- @s49 (regla 3, 3 filas) → :2000-2018.
- @s50 (regla 4, 11 filas) → :2023-2063.
- @s51 (la raíz, con las dos listas variantes; la lista se pidió; 9 filas) → :2083-2143.
- @s52 (la limpieza; la lista se pidió; 16 filas) → :2147-2202.
- @s53 (fuera de la puerta, sin la lista; ANCLA EXACTA; 7 filas) → :2204-2229.
- @s54 (sin base y base sin barra final, 6 filas) → :2231-2278.
- @s55 (todo `rel`, la caja y el `<body>`, con el ANCLA DE SITIO; 12 filas) → :2284-2316.
- @s56 (el informe con dos páginas) → `it` de :2319.
- @s57 (sin la lista: corte o lo de hoy; 7 filas) → :2358-2435.
- @s58 (la lista solo con candidatos; la que lanza; `dist/` ausente; 3 filas) → :2445-2491.
- @s59 (la guarda nueva, 8 filas) → :2500-2611.
- @s60 (las 5 reglas en `REGLAS_DEL_CASCARON`) → `it` de :2615.
- @s65 (regla 5, 5 filas) → :2637-2669.
- @s66 (un candidato en la 2.ª página: con lista, sin ella y la que lanza; 3 filas) → :2671-2710.
- @s68 (S-12: cada condición del predicado, `/`, sin candidatos; la lista pedida 0 o al menos 1 vez; 8
  filas) → :2716-2784.
- @s69 (el corte por lista ausente antes que el de la base) → `it` de :2787.

Ayudantes NUEVOS del test (ninguno de @s1-@s45 cambia): `listaDeReferencia` (:1768), `dobleDeLaLista`
(:1786), `conElementos` (:1804), `puertaSobreLaHome` (:1810), `enElContrato`, `comprobarUnLink`,
`listaSinLaRaiz`, `listaConLaRaizVacia`, `respectoDelCierreDelHead`, `listaQueLanza`, `conLaCanonicaSinHref` y
`lineaDeLaBase`. Los textos de las reglas y de las tres líneas nuevas van ESCRITOS A MANO en el test; ninguno se
importa de producción (solo `REGLAS_DEL_CASCARON`, que es lo vigilado por @s60).

En producción (`src/lib/puerta-cascaron.ts`): `extraerLinks` :561 (con `hrefsDe` :551), `limpiar` :598,
`esCandidato` :618, `tieneSegmentosQueNoInterpreta` :630, `esOculta` :641, `esBaseUtilizable` :650,
`reglaDelLink` :661, `candidatosDe` :712, `violacionesDeLinks` :721, el puerto :914-939, `fallaCerradaCon` :969,
el cableado de la forma E en `inspeccionarArtefacto` (:1018), la guarda nueva (:1066) y las 5 reglas en
`REGLAS_DEL_CASCARON` (:1103-1107).

## Cómo quedó la forma (lo que pide la cabecera «PARA EL `tdd_craftsman`»)

- Cableado de la lista: la FORMA E literal (`let ubicaciones = new Map()`; `if (candidatos.length > 0) { if
(ficheros === undefined) return …; if (base !== null && !esBaseUtilizable(base)) return …; ubicaciones = new
Map(ficheros.listar()…) }`), y las reglas se evalúan SIEMPRE sobre los candidatos. Sin `?.`, `??` ni `!`
  sobre `ficheros`, sin `[]` por defecto y sin volver a comprobar `ficheros !== undefined`.
- Lo que se quita DENTRO del `href` (TAB, LF y CR): clase SIN `+`. El recorte, ANTES de quitar (orden WHATWG).
- El predicado de oculto, sobre TODOS los segmentos de `dist/<resto>`, sin `slice(1)`.
- El `/` inicial sin base: `ruta.slice(prefijo.length)` con `prefijo = base ?? '/'` (un `slice`, nunca una
  regex anclada a `^`; la forma «prefijo único» que el revisor B midió con 0 vivos).
- La RUTA, con `rutaDelHref` REUTILIZADA (nunca `replace(/[?#].*$/, '')`).
- La regla 3, con `bytes === 0` (nunca `< 1`).

## Desviaciones declaradas

- Ninguna del contrato: todas las filas se escribieron tal cual (los textos, letra a letra; cada carácter
  anotado como U+XXXX en el `.feature`, con su escape `uXXXX`, también la barra invertida de las dos filas de
  @s50 que el `.feature` escribe literal).
- «La lista de referencia» lleva los 12 ficheros del `.feature` con sus bytes; «la página correcta» es
  `htmlCrudo()` sin opciones con el `<link>` INSERTADO antes de `</head>` (o de `</body>`). En @s59, «la
  canónica SIN href en lugar de su canónica» se construye con `htmlCrudo({ canonica: null })` más
  `<link rel="canonical">` al final del `<head>` (mismo `<head>`, otra posición: la puerta no mira el orden).
- Notación del código en las tablas: `FALLA` = «distinto de 0», comparado con `enElContrato(codigoSalida)`; la
  aserción sigue siendo «≠ 0», nunca `toBe(1)`.
- Filas que nacieron VERDES respecto del código del ciclo anterior (todas nacerían ROJAS con la puerta de hoy,
  por su ANCLA): @s53 entera, @s54 filas 1-5, @s55 entera, @s56, @s66 entera, @s51 fila 7, @s52 filas 2, 3, 5,
  11, 15 y 16, @s68 filas 2, 4, 7 y 8, y los CONTROLES de cada tabla. Ninguna se dio por buena a ciegas: las de
  @s53, @s55, @s56, @s59 (fila 8), @s66 y @s68 (fila 8) se midieron con un SABOTAJE de producción que las pone
  en rojo, y las de @s52 que dependían de la trampa de C1 se re-midieron en C14 (arriba).
- Trampas de VERDE que vivieron entre ciclos (todas retiradas): «pedir la lista siempre que la hay» (C1 a
  C14), «sin base, devolver null» (C3 a C7), recortar solo un espacio inicial (C2 a C8), el corte de S-12 solo
  con `endsWith` y fuera de «hay candidatos» (C10 a C19) y su orden delante del de la lista (C13 a C20).

## Hallazgos

1. **La FASE A sola ROMPE `pnpm build` hasta que la FASE B cablee la lista en el humilde** (esperado por S-3,
   pero hay que saberlo). Medido: con `NLS_DIST_DIR` apuntando a `scratchpad/h5/verif/dist-build` (la copia
   del build real que guardó la verificación), `node --experimental-strip-types tools/puerta-cascaron.ts` (el
   humilde de HOY, que no pasa `ficheros`) sale con 1 y UNA línea: `la puerta no recibió la lista de ficheros
del artefacto y hay elementos link root-absolutos que resolver`. Por tanto los `beforeAll` de
   `src/pages/home-horneado.test.ts` (:74) y `src/pages/contacto-horneado.test.ts` (:80), que corren
   `pnpm build`, caerían, y la suite completa, `harness init` y el despliegue quedan en rojo entre la fase A y
   la B. No fusionar ni correr la suite completa hasta cerrar la fase B. (`trampas-del-horneado` no lo nota:
   corre `vite-react-ssg build` y el humilde sobre experimentos sin candidatos.)
2. El comentario de `REGLAS_DEL_CASCARON` sigue diciendo «TODAS las reglas» y le sigue faltando
   `REGLA_RUTA_AUSENTE`: hueco DECLARADO por @s60 y por la puerta humana; no lo he tocado.
3. Para el `mutation_tester`: el refactor `fallaCerradaCon` agrupa también las tres salidas de una línea que
   ya existían (@s27, @s28 y @s29). Su texto no cambia y sus tests de hoy las siguen aseverando
   (`toContain('rutas esperadas')`, `toContain('ningún enlace')`, `toContain(MOTIVO)`); el `ObjectLiteral` y
   el `ArrayDeclaration` del ayudante los matan además todas las filas de corte nuevas.
4. `git stash` es COMPARTIDO entre worktrees: hay un stash previo de `main` («WIP muerto de puerta.test.ts»)
   que no he tocado; en el sabotaje de C14 usé `push`/`pop` y la lista de stashes quedó como estaba. En los
   demás sabotajes restauré desde una copia o con `git checkout` del fichero, sin stash.

---

# FASE B — el humilde y el extremo a extremo (@s61, @s62, @s67, @s70-@s72) — 2026-10-01

> Autor: `tdd_craftsman`. Mismo worktree y rama, desde `9ed713e` (cierre de la FASE A). Contrato: los escenarios
> de extremo a extremo de `features/cascaron_semantico.feature` (sección «Extremo a extremo (D9)» y su cabecera
> «PARA EL `tdd_craftsman`»), la excepción `elementos` → `elementosDe` y «QUÉ NO CAMBIA» del banner; spec:
> `project-spec.md` §Feature 4 → «Enmienda 5», «El puerto nuevo» y «Prueba de extremo a extremo (D9)». @s63 y
> @s64 son del LEAD (no son tests) y no se han hecho aquí.
>
> Alcance: SOLO `src/pages/home-horneado.test.ts` y `tools/puerta-cascaron.ts`. NO se tocan `tools/artefacto.ts`,
> `ArtefactoDeProduccion`, `src/lib/puerta-cascaron.ts`, `tools/puerta-anclas.ts` ni F-05. `feature_list.json`
> no se toca. Ficheros modificados SOLO con Bash y `scratchpad/h5/tdd-b/aplicar.mjs` (parches `p01`-`p05`); barras
> invertidas contadas antes y después de cada parche con `String.fromCharCode(92)`.

## Línea base (medida antes de tocar nada)

`pnpm exec vitest run src/pages/home-horneado.test.ts` → 42 tests, **2 failed | 40 passed**: `@s14 el build de
producción con las CINCO puertas termina en código de salida 0` (`expected 1 to be +0`) y el `H-3 control` de
`cascaron` (salida: `  ✗ la puerta no recibió la lista de ficheros del artefacto y hay elementos link root-absolutos
que resolver`). Es el hallazgo 1 de la FASE A, confirmado en el `beforeAll` real: `vite-react-ssg build` deja el
artefacto, la 1.ª puerta corta por S-3 y `html` se lee igual, así que lo demás sigue en verde. Una corrida del
fichero tarda unos 10 s.

## Ciclos

### B1 · REFACTOR del ayudante (excepción DECLARADA): `elementos` delega en `elementosDe(fuente, etiqueta)`

- `elementosDe` lleva el MISMO patrón de apertura y el MISMO `atributosDe`, sobre `fuente`; `elementos(etiqueta)`
  pasa a `return elementosDe(html, etiqueta)`. Ninguna llamada cambia; no hay un segundo patrón ni se reasigna
  `html`. Barras del fichero: 24 antes y después.
- Medido: @s39 (2 tests), @s40 (3), @s41 (3), @s42 (4) y F-28 @s8 (7), los 19, en verde; el fichero, igual que la
  línea base (2 failed | 40 passed, los mismos dos del corte S-3). `tsc` 0, `eslint` 0, `prettier` limpio.
  Commit `5145e70`.

### B2 · ROJO: 8 tests nuevos (@s61; @s62 filas a, b y c; @s67; @s70; @s71; @s72)

- Al final del fichero, tras F-28 @s8; un `it` por escenario y un `it.each(FIRMAS_DEL_H5)` de 3 filas para @s62.
  Cada sabotaje, en su PROPIA copia (`cpSync` recursivo) dentro del `temporal` del fichero (`copia-s62-a` a
  `copia-s72`); @s70 usa `join(temporal, "no-existe")`, el del «H-3 caso», sin copiar nada. La puerta se corre con
  el `correrPuerta` de siempre. Ningún build, `beforeAll`, `execSync` de build ni jsdom nuevos.
- Cada `Then` sobre una copia lee del DISCO después del sabotaje (`indexDe(copia)` + `elementosDe`, `statSync`); el
  `href` se lee TAL CUAL con `.get("href")`; el último `Then` RELEE el `index.html` ORIGINAL y lo compara con `html`.
  Las anclas van delante de lo demás en cada test.
- **Medida 1, con la FASE A y el humilde de HOY** (lo que pide el lead): 50 tests, **9 failed | 41 passed**. En
  TODOS los nuevos, las anclas pasan; el rojo cae así:

| Test          | Dónde cae (medido)                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| @s61          | en «la salida contiene "✓ Puerta del cascarón"»: `código 1`, la salida trae la línea del corte S-3                       |
| @s62 (a)      | en «la salida contiene la línea»: el código es 1 (distinto de 0, pasa), pero la línea es la del corte S-3, no la regla 1 |
| @s62 (b)      | ídem, no la regla 2                                                                                                      |
| @s62 (c)      | ídem, no la regla 3                                                                                                      |
| @s67          | ídem, no la regla 2 de `"/NailsLashStudioWeb/assets"`                                                                    |
| @s70          | VERDE (CONTROL): línea de @s26, código distinto de 0, sin `ENOENT` ni `✓`                                                |
| @s71          | en «la salida contiene la línea»: la del corte S-3, no la de la regla 5                                                  |
| @s72          | en «el código de salida es 0»: sale con 1 por el corte S-3                                                               |
| (ya existían) | @s14 (exit del `beforeAll` 1) y `H-3 control` de `cascaron`, los dos de la línea base                                    |

- **Medida 2, con la puerta de ANTES de H-5** (`src/lib/puerta-cascaron.ts` de `df01310` puesto en su sitio solo
  para esta corrida y restaurado acto seguido; `git diff HEAD` de ese fichero, vacío): **5 failed | 45 passed**.
  @s62 (a, b, c), @s67 y @s71, en ROJO en «el código de salida es un número distinto de 0» (las copias salen con 0 y
  `✓ Puerta del cascarón`); @s61, @s70 y @s72, en VERDE; el resto del fichero, en verde. Es exactamente el «NACEN EN
  ROJO / NACEN EN VERDE» del contrato, que habla de la puerta que solo mira `<a href>`. Con la FASE A ya en la rama,
  @s61 y @s72 nacen además en rojo por el corte S-3 (medida 1): lo anticipaba el lead.

### B3 · VERDE: el puerto de la lista en el humilde

- `tools/puerta-cascaron.ts`: `listaReal: ListaDeFicheros`, cuyo `listar()` es el `readdirSync` recursivo con
  `withFileTypes` de `DIRECTORIO_ARTEFACTO`, solo `isFile()`, y por cada fichero su `ubicacionLogica(ruta)` y
  `statSync(ruta).size`; NUNCA `readFileSync`. Se pasa como `ficheros: listaReal`. Es un método: no lista hasta que
  la puerta lo pide, y la puerta lo pide DESPUÉS de `existe()`.
- 50 passed (50): el `beforeAll` vuelve a salir con 0 (@s14 en verde), el `H-3 control` de `cascaron` en verde y los
  8 nuevos en verde. `tsc` 0, `eslint` 0, `prettier` limpio. Commit `2ea2733`.

### B4 · REFACTOR del humilde

- `listarHtml` y `listar` repetían el recorrido: sale a `rutasDeLosFicheros()` (recursivo, solo ficheros, rutas
  físicas; LANZA si no existe). `listarHtml` filtra con `ES_HTML` sobre la RUTA y no sobre el nombre: equivalente,
  porque el patrón está anclado al final y la ruta acaba en el nombre. Comentarios del porqué (sin filtrar, sin leer,
  perezoso) y una línea en la cabecera. Barras: 2, sin cambios.
- 50 passed (50); `tsc` 0, `eslint` 0, `prettier` limpio. Commit `d2b8fcd`.

### B5 · SABOTAJES del humilde (no se muta: su defensa es este extremo a extremo)

Script `scratchpad/h5/tdd-b/sabotear.mjs`: cada variante reescribe SOLO el `listar` del humilde, corre el fichero con
el reporter JSON y, en un `finally`, restaura el texto original (`git diff --exit-code` del humilde: 0; `git status`
limpio). Resultados medidos:

| Sabotaje del `listar`                               | Resultado          | Qué cae                                                                                                 |
| --------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------- |
| S1 no recursivo (sin `recursive: true`)             | 9 failed, 41 pass. | @s61, @s62 (a, b, c), @s67, @s71, @s72, @s14 y `H-3 control` (los `<link>` de `assets/` dan la regla 2) |
| S2 sin `isFile()` (carpetas incluidas)              | 1 failed, 49 pass. | SOLO @s67: la carpeta `assets` pesa 0 B en Windows y da la regla 3, no la 2                             |
| S3 quita los ocultos (algún segmento empieza por .) | 1 failed, 49 pass. | SOLO @s71: da la regla 2 («sin fichero en dist/») de un fichero que SÍ está                             |
| S4 quita las `.html`                                | 1 failed, 49 pass. | SOLO @s72: la regla 2 sobre la raíz `"/NailsLashStudioWeb/"`                                            |
| S5 ansioso (lista al cargar, antes de la puerta)    | 1 failed, 49 pass. | SOLO @s70: el `ENOENT` de `readdirSync` sale FUERA de la puerta y se pierde la línea de @s26            |
| S6 ubicación FÍSICA en vez de `dist/…`              | 9 failed, 41 pass. | los mismos 9 que S1 (nada resuelve: regla 2 en todos los `<link>`)                                      |
| S7 sin tamaño (`bytes: 1`)                          | 1 failed, 49 pass. | SOLO @s62 (c): sale con 0 y `✓`                                                                         |

Así, @s70 y @s72 (CONTROLES) y @s67 y @s71 no son verdes a ciegas: cada uno, y solo él, mata la propiedad del humilde
que el mapa le asigna (`progress/gherkin_h5_enlaces_horneados.md` §2).

## Cierre (paso 4 del encargo)

- Los seis ficheros que pide el lead (`home-horneado`, `contacto-horneado`, `trampas-del-horneado`,
  `puerta-cascaron`, `puerta-anclas` y `seo`) en una sola corrida de `pnpm exec vitest run`: **541 passed (541)**;
  por fichero, 50/50, 26/26, 45/45, 338/338, 39/39 y 43/43.
- `pnpm typecheck` 0; `pnpm exec eslint tools/puerta-cascaron.ts src/pages/home-horneado.test.ts` 0; `pnpm exec
prettier --check` de los dos, limpio.
- **Build real** con `NLS_DIST_DIR` en `scratchpad/h5/tdd-b/build-real/dist`: `pnpm build` sale con **0** y las
  CINCO puertas en `✓` (cascarón, placeholders, contraste, terceros y anclas vivas), sin ninguna línea `✗`. El `dist/`
  del proyecto no existía antes ni existe después; `git status` limpio.
- Ese artefacto, medido: 42 entradas del `readdirSync` recursivo (39 ficheros y 3 carpetas: `.vite`, `assets` y
  `static-loader-data`), 2 ocultos (`.vite/manifest.json` y `.vite/ssr-manifest.json`) y 1 HTML (`index.html`); su
  `index.html` trae 11 `<link>` con `href`, 10 root-absolutos y 7 bajo `/NailsLashStudioWeb/assets/`.
- NO he corrido la suite completa, `bin/harness init` ni Stryker (los corre el lead o el `mutation_tester`).
  `home-horneado` pasa de 42 a **50 tests** (8 nuevos).

## Trazabilidad FASE B (@s → test, `src/pages/home-horneado.test.ts`)

- @s61 → `it` de :722: ANCLA (al menos 1 `href` con `/NailsLashStudioWeb/`, al menos 1 con
  `/NailsLashStudioWeb/assets/`, exactamente 1 `/NailsLashStudioWeb/favicon.svg`), `favicon.svg` de más de 0 B y «la
  salida contiene "✓ Puerta del cascarón"». «El código de salida es 0» es el `H-3 control` de `cascaron` (:543),
  CITADO y no duplicado, como manda el contrato.
- @s62 → `it.each(FIRMAS_DEL_H5)` de :799, filas (a), (b) y (c) (los datos, en :759).
- @s67 → `it` de :824. @s70 → `it` de :849. @s71 → `it` de :868. @s72 → `it` de :893.
- Ayudantes NUEVOS: `elementosDe` (:247, en el que delega `elementos`, :254), `HREF_DEL_FAVICON`, `MARCA_DE_LINK`,
  `copiaDelArtefacto`, `indexDe`, `linksConHref`, `cambiarElHrefDelFavicon`, `bytesDelFichero`, `lineasDeLink`,
  `esperarQueLaPuertaPare`, `esperarElOriginalIntacto` (:659-719) y `FirmaDelH5` (:746). Literales y líneas, A MANO;
  el fichero sigue sin importar nada de `src/`.
- Humilde (`tools/puerta-cascaron.ts`): `rutasDeLosFicheros`, `listaReal` y `ficheros: listaReal`.

## Desviaciones declaradas (FASE B)

1. B1 es un refactor de un ayudante de TEST con el fichero en rojo por dos tests que no lo usan (el corte S-3 de la
   FASE A); sus 19 tests estaban y siguieron en verde. Lo ordena el lead como paso 1.
2. Los seis escenarios se escribieron en un solo paso (orden del lead), no uno a uno; cada test se midió por separado.
3. @s61 no vuelve a aseverar el código 0: lo hace el `H-3 control` (contrato: «se cita, no se duplica»); el mensaje
   de la aserción del `✓` lleva el código, para que un fallo lo diga.
4. «La salida contiene la línea», por subcadena (el humilde antepone la marca `✗`); «esa es la ÚNICA», contando las
   líneas (partidas por el salto de línea) que contienen ` — link root-absoluto`.
5. «Exactamente 1 `<link>` de `href` X y 0 de Y» se cuenta con `elementosDe` sobre el `index.html` de la copia
   releído y `.get("href")` por igualdad; el cambio de `href` reemplaza la 1.ª aparición del atributo del favicon, y
   el ANCLA (1 nuevo, 0 viejo) comprueba que se hizo.
6. B4 toca `listarHtml` del humilde (el filtro HTML sobre la ruta): no está en «QUÉ NO CAMBIA», y lo cubren el
   `H-3 control`, @s61-@s72 y `trampas-del-horneado` (45/45).

## Hallazgos (FASE B)

1. El rojo de la FASE A (`pnpm build` en 1 por S-3) queda cerrado: el build real sale con 0 y las cinco puertas en `✓`.
2. Con la FASE A ya en la rama, @s61 y @s72 no «nacen en verde» respecto del humilde de hoy (caen por S-3); el
   contrato se refiere a la puerta anterior a H-5, y con ella sí nacen en verde (medida 2). No es un defecto del
   contrato: es el corte en dos fases.
3. El hook `Fact-Forcing Gate` paró tres órdenes (la medida con la puerta de `df01310`, el borrado del temporal del
   build real y la escritura de esta bitácora, que solo citaba ese borrado); se presentaron los hechos y se
   repitieron tal cual. Aparte, dos heredocs largos de Bash fallaron al analizarse («unexpected EOF while looking for
   matching quote») y se escribieron por trozos, sin comillas simples en el texto: nada llegó a escribirse a medias.
