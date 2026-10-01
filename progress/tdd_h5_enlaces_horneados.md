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
