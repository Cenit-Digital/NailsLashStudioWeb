# Gherkin — F-04 ENMIENDA 5 (H-5): todo `<link>` root-absoluto del artefacto resuelve, bajo la base, a un fichero no vacío y que se publica

> Lo escribe el `gherkin_author` el 2026-10-01 y lo repara el mismo día en dos rondas tras las revisiones
> adversariales (ronda 1, §7; ronda 2, §9). Contrato: `features/cascaron_semantico.feature`, banner ENMIENDA 5
> (líneas 225-366, apilado tras el de la ENMIENDA 4 y antes de «Contrato de la feature 4», corrección 6 de la
> verificación) y **27 escenarios, @s46-@s72** (líneas 2054-2905, al final, con «@s1-@s45 (arriba) NO SE TOCAN»).
> @s65-@s67 los añadió la ronda 1 y @s68-@s72 la ronda 2; cada uno va en su grupo, así que el orden del fichero no
> es el de los números (no se renumera nada de lo que ya se cita). @s1-@s45: 0 líneas tocadas [V: el script de la
> ronda 2 comprueba que las líneas 1-224 y las 1687 de «Contrato de la feature 4» hasta el final de @s45 quedan
> byte a byte iguales]. Estado: **PENDIENTE de la puerta humana**. Fuentes, en orden de mando:
> `progress/brief_h5_enlaces_horneados.md` §8 (decisiones de Pablo) → `progress/verificacion_decisiones_h5.md`
> (prevalece sobre §2-§6 del brief) → resto del brief; spec: `project-spec.md` §Feature 4 → «Enmienda 5
> (2026-10-01)», reparada en sus rondas 1 (`cd1744a`: S-7 a S-10, regla 5) y 2 (`4bfbd4f`: S-11, S-12, asimetría
> 3 y trazas). Etiquetas: **[V]** verificado en esta sesión · **[I]** inferencia · **[NV]** no verificado.
>
> **`feature_list.json` NO se ha tocado**: precedente de las ENMIENDAS 1-4 (F-04 sigue `done`; banner). El
> reetiquetado de la «deuda de F-05» de su línea 549 lo hace el lead al cerrar (H5-1).

## 1. Reparto: de la spec al contrato

Tres grupos que no se mezclan (lo pidió el lead): puerta pura, extremo a extremo y lo que hace el lead a mano. Las
filas de la puerta pura las lee del `.feature` el modelo de la ronda 2 (§10): 125.

| Grupo                                                                  | Escenario | Filas | Qué fija                                                                                                                                     |
| ---------------------------------------------------------------------- | --------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Puerta pura (`src/lib/puerta-cascaron.test.ts`, cuenta para Stryker)   | @s46      | 1     | CONTROL: un `<link>` de cada clase del artefacto real, todos resuelven; la lista se pidió                                                    |
|                                                                        | @s47      | 9     | regla 1 (sin el prefijo), su orden frente a la 2 y la 3, la asimetría 1 y `/` bajo la base                                                   |
|                                                                        | @s48      | 14    | regla 2 (sin fichero): caja, carpeta, `...`; los segmentos `.`, `..` y `//` de la RUTA son la 4 (S-11); controles de `?query` y `#fragmento` |
|                                                                        | @s49      | 3     | regla 3 (0 bytes) y su control de 1 byte                                                                                                     |
|                                                                        | @s50      | 11    | regla 4: una fila por `%`, `&` y barra invertida (dentro y AL PRINCIPIO, S-7, también seguida de `/`), y su orden frente a la 1 y la 2       |
|                                                                        | @s51      | 9     | solo la raíz va a `index.html`, y se BUSCA en la lista (dos listas variantes); `x/` y `x` fallan cerrado; asimetría 2; la lista se pidió     |
|                                                                        | @s52      | 16    | la limpieza, con «la lista se pidió» en cada fila: cada carácter en cada extremo y dentro, y el valor CRUDO en la línea                      |
|                                                                        | @s53      | 7     | lo que no es root-absoluto queda fuera y ni pide la lista                                                                                    |
|                                                                        | @s54      | 6     | sin base (ausente o `null`); una base sin barra final corta con la línea de la base (S-12)                                                   |
|                                                                        | @s55      | 12    | todo `rel`, la caja de la etiqueta y el `<link>` del `<body>`, con el ANCLA DE SITIO                                                         |
|                                                                        | @s56      | 1     | formato y orden del informe con dos páginas                                                                                                  |
|                                                                        | @s57      | 7     | la lista AUSENTE: corte con una sola línea (filas 1-3, 6 y 7), o lo de hoy salvo la guarda (4-5)                                             |
|                                                                        | @s58      | 3     | la lista se pide solo con candidatos; si revienta, rama de @s29; con `dist/` ausente, la de @s26                                             |
|                                                                        | @s59      | 8     | la guarda del extractor nuevo, su orden tras @s28, sus controles y su acoplamiento con @s13 (S-9)                                            |
|                                                                        | @s60      | 1     | las 5 reglas en `REGLAS_DEL_CASCARON`, sin «origen» ni «placeholder»; la lista NO es «TODAS» (hueco)                                         |
|                                                                        | @s65      | 5     | regla 5 (S-8): oculto en la lista → regla 5; antes que la 3; solo si está en la lista; cada segmento                                         |
|                                                                        | @s66      | 3     | un candidato en la SEGUNDA página basta: lista presente, ausente y que lanza                                                                 |
|                                                                        | @s68      | 8     | S-12: cada condición de la base no utilizable corta con su línea y sin pedir la lista; `/` es utilizable; sin candidatos, lo de hoy          |
|                                                                        | @s69      | 1     | S-12 va DESPUÉS del corte por lista ausente                                                                                                  |
| Extremo a extremo (`src/pages/home-horneado.test.ts`, fuera)           | @s61      | 1     | ANCLA del artefacto real (con la base, con `assets/` y el favicon) + CONTROL (exit 0, `✓`)                                                   |
|                                                                        | @s62      | 3     | las tres firmas (a), (b) y (c), cada una en su copia, con su línea exacta y el original RELEÍDO intacto                                      |
|                                                                        | @s67      | 1     | el humilde lista solo FICHEROS: un `<link>` a la carpeta real `assets` → regla 2                                                             |
|                                                                        | @s70      | 1     | CONTROL: con `dist/` ausente el humilde no lista antes de `existe()`: línea de @s26, sin `ENOENT` (nace en VERDE)                            |
|                                                                        | @s71      | 1     | el humilde lista también los OCULTOS: un `<link>` a `.vite/manifest.json` → regla 5 (nace en ROJO)                                           |
|                                                                        | @s72      | 1     | CONTROL: el humilde lista también las HTML: un `<link>` a la raíz resuelve a `index.html` → 0 (nace en VERDE)                                |
| A mano, el lead (`progress/verificacion_viva_h5_enlaces_horneados.md`) | @s63      | 1     | `@demostracion-del-lead`: borrar `public/favicon.svg` → `pnpm build` ≠ 0 con la (a); restaurar → 0 y limpio                                  |
|                                                                        | @s64      | 1     | `@verificacion-viva`: tras publicar, cada `href` → 200, contraprueba `/favicon.svg` → 404. CONTROL, no evidencia de H-5                      |

Ningún escenario toca `inspeccionarSitio` (S-4): las reglas nuevas se observan por `ejecutarPuertaDelCascaron`,
que es lo que recibe la lista. Los textos de las reglas y de las tres líneas nuevas son los de la spec, copiados
letra a letra en la cabecera de la sección (y escritos a mano en cada fila).

## 2. Cada `Then` → qué mutante de la implementación futura mata

La implementación aún no existe. Los mutantes se describen sobre la que pide la spec («Resolución ESTRICTA», «El
puerto nuevo», «La base: utilizable, o la puerta corta», «Guarda»), cableada en la forma E de la cabecera de la
sección, con los operadores de Stryker (`Regex`, `ConditionalExpression`, `EqualityOperator`, `MethodExpression`,
`StringLiteral`, `ArrayDeclaration`, `BlockStatement`, `ObjectLiteral`, `BooleanLiteral`, `LogicalOperator`,
`OptionalChaining`) y, donde no hay operador, con la desviación de implementación que la fila impide. Solo cuentan
@s46-@s60, @s65, @s66, @s68 y @s69: los extremo a extremo son build-based y Stryker no los ve
(`vitest.stryker.config.ts`, corrección 16). Esquema de referencia: es el modelo de la ronda 2 (§10), no código de
producción. `limpiar(href)` (recorte de los cinco espacios ASCII con `+`; dentro, TAB, LF y CR SIN `+`) →
candidato si cumple `RUTA_INTERNA` o empieza por barra invertida → con algún candidato: lista ausente → corte;
base declarada y no utilizable (`RUTA_INTERNA.test(base) && base.endsWith('/')` es falso) → corte; si no,
`ubicaciones = new Map(ficheros.listar()…)` → por candidato: regla 4 si el `href` limpio tiene `%`, `&` o barra
invertida; `ruta = rutaDelHref(limpio)`; regla 4 si la ruta contiene `//` o algún segmento es `.` o `..`; con
base, regla 1 si no empieza por ella y `resto = ruta.slice(base.length)`; sin base, `resto = ruta.slice(1)`;
`ubicacion` = `dist/index.html` si `resto` está vacío, si no `dist/<resto>`; regla 2 si no está en la lista;
regla 5 si algún segmento de `ubicacion` empieza por `.`; regla 3 si pesa 0. **[V: modelo]** = medido sobre el
modelo de la ronda 1 (§8); **[V: Stryker r2]** = medido con el instrumentador de Stryker 9.6.1 sobre el modelo de
la ronda 2 y las 125 filas leídas del `.feature` (§10: 159 mutantes del código nuevo, 0 supervivientes);
**[V: modelo r2]** = una desviación de conducta corrida contra esas filas.

| Escenario / fila                                                            | `Then` que muerde                                    | Mutante que mata                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @s46                                                                        | ANCLA: 6 valores en orden                            | extractor que se queda con la primera coincidencia o que filtra todo (`filter` → `() => false`)                                                                                                                                                                                                                                                      |
| @s46                                                                        | la lista se pidió ≥ 1 vez                            | `if (hayCandidatos)` → `false`: la puerta no consulta la lista y da 0 líneas en vacío                                                                                                                                                                                                                                                                |
| @s46                                                                        | exit 0 y 0 líneas                                    | todo mutante que acuse sin motivo: prefijo → `true`, «no está» → `true`, `bytes === 0` → `true`, clase de la regla 4 negada, raíz → `true ?`, «oculto» → `true`, segmentos → `true`                                                                                                                                                                  |
| @s47 `/favicon.svg`                                                         | línea de la regla 1                                  | `!ruta.startsWith(base)` → `false` o `endsWith`; `base === null` → `true` (iría por la rama sin base, encontraría `dist/favicon.svg` y pasaría); texto de la regla → `""`                                                                                                                                                                            |
| @s47 `/no-existe.svg`, `/vacio.svg`                                         | SOLO la línea de la 1                                | `return` temprano de la regla 1 → `{}` (`BlockStatement`): seguiría y añadiría la 2 o la 3                                                                                                                                                                                                                                                           |
| @s47 `/NailsLashStudioWeb`, `/nailslash…`                                   | regla 1                                              | prefijo comparado sin la barra final o sin caja (desviación de implementación)                                                                                                                                                                                                                                                                       |
| @s47 `⟨U+0020⟩/favicon.svg`                                                 | regla 1 con el valor CRUDO                           | quitar la limpieza (sin recortar no es root-absoluto: 0 líneas); poner en la línea el valor limpio (S-6)                                                                                                                                                                                                                                             |
| @s47 `/otra-cosa/x.css`                                                     | regla 1                                              | reutilizar `esEnlaceRoto` de `<a>`, que devuelve `false` sin el prefijo (@s37)                                                                                                                                                                                                                                                                       |
| @s47 `/` (ronda 2)                                                          | regla 1 con el valor `/`                             | un predicado de candidato que exija algo detrás de la barra inicial: 0 líneas [V: modelo r2, «sin-barra-sola», que también rompe @s51 filas 2 y 8]                                                                                                                                                                                                   |
| @s48 controles `?v=2`, `#x`                                                 | 0 líneas                                             | `Regex` sobre `[?#]`: quitar `?` o `#` de la clase                                                                                                                                                                                                                                                                                                   |
| @s48 control `assets/app.css`                                               | 0 líneas                                             | `slice(base.length)` eliminado (`MethodExpression`): buscaría `dist//NailsLashStudioWeb/…`                                                                                                                                                                                                                                                           |
| @s48 `no-existe.svg`                                                        | línea de la regla 2                                  | «no está» → `false` o `!==`; texto de la regla → `""`                                                                                                                                                                                                                                                                                                |
| @s48 `FAVICON.SVG`, `assets`                                                | regla 2                                              | búsqueda sin caja, `existsSync` o resolver carpetas (desviaciones)                                                                                                                                                                                                                                                                                   |
| @s48 `./`, `../`, `//` y `/./favicon.svg` (S-11, ronda 2)                   | regla 4                                              | quitar el `.`, el `..` o el `//` (`segmento === '..'` → `false` solo muere en `../`); `                                                                                                                                                                                                                                                              |     | `→`&&`; `.some`→`.every`; normalizar la ruta (desviación); mirar los segmentos DESPUÉS de la regla 1 (fila `/./favicon.svg`) [V: Stryker r2] |
| @s48 `.../favicon.svg` (ronda 2)                                            | regla 2                                              | comparar los segmentos con `startsWith('.')` en vez de igualdad: también rompe las cuatro filas de @s65 que no son el control [V: modelo r2]                                                                                                                                                                                                         |
| @s48 `?v=/../x`, `#/./x`, `#//x` (ronda 2)                                  | 0 líneas                                             | mirar los segmentos sobre el `href` entero y no sobre la ruta: las tres en rojo [V: modelo r2]                                                                                                                                                                                                                                                       |
| @s49 `vacio.svg`, `vacio.svg?v=2`                                           | línea de la regla 3                                  | `bytes === 0` → `false` o `!==`; texto → `""`; la query sin quitar al buscar                                                                                                                                                                                                                                                                         |
| @s49 `uno.svg` (1 B)                                                        | 0 líneas                                             | si se escribe `bytes < 1`: `<= 1` (`EqualityOperator`); con `=== 0`, el `!==` ya muere en la fila de 0 B                                                                                                                                                                                                                                             |
| @s50 una fila por carácter                                                  | línea de la regla 4                                  | `ArrayDeclaration`, `StringLiteral` o `.some` → `.every` sobre los tres caracteres; texto → `""` [V: Stryker r2]                                                                                                                                                                                                                                     |
| @s50 control `?v=2#x`                                                       | 0 líneas                                             | la comprobación de la 4 → `true`                                                                                                                                                                                                                                                                                                                     |
| @s50 `?a=1&amp;b=2`                                                         | regla 4                                              | mirar la regla 4 sobre la ruta ya sin query                                                                                                                                                                                                                                                                                                          |
| @s50 `/favicon%2Esvg`, `no%20existe.svg`                                    | SOLO la 4                                            | la regla 4 evaluada después de la 1 o de la 2                                                                                                                                                                                                                                                                                                        |
| @s50, las cuatro con barra invertida AL PRINCIPIO; @s57 filas 6 y 7         | regla 4 / la línea del corte                         | quitar la rama S-7 (sin ella no son candidatos y salen con 0) [V: modelo]; `startsWith` → `endsWith` en esa rama [V: Stryker r2]                                                                                                                                                                                                                     |
| @s50 `⟨U+005C⟩/cdn…`; @s57 fila 7 (ronda 2)                                 | regla 4 / la línea del corte                         | el candidato «compacto», una sola regex que acepta `/` o la barra invertida al principio y rechaza una `/` detrás: pasaba las demás filas, y sus 3 mutantes de nivel 1 morían; aquí, 0 líneas [V: modelo r2, «compacta»]                                                                                                                             |
| @s51 raíz con base y sin base (filas 1-2)                                   | 0 líneas y la lista se pidió                         | `resto === ''` → `false`; `''` → `"Stryker was here!"`; `'dist/index.html'` → `""` [V: Stryker r2]; en la 2, el predicado «sin-barra-sola» (no pide la lista)                                                                                                                                                                                        |
| @s51 `x/`, `/x/`, `x`                                                       | regla 2                                              | `resto === ''` → `true`; la alternativa del brief (`<carpeta>/` → `index.html`); resolver contra rutas LÓGICAS                                                                                                                                                                                                                                       |
| @s51, las tres de las listas variantes (ronda 2)                            | regla 2 / regla 3 en la raíz                         | «la raíz pasa sin mirar» (`if (resto === '') return null`): sin estas filas pasaba el contrato entero y sus 5 mutantes morían, un 100 % incumpliendo la spec; con ellas, 3 filas en rojo [V: Stryker r2 y modelo r2, «atajo»]                                                                                                                        |
| @s52, filas con línea y el carácter AL PRINCIPIO (SP; FF; SP+FF; los siete) | regla 2 con el valor CRUDO                           | recorte del PRINCIPIO: sin SP, sin FF, solo espacios, un solo carácter (el `+` quitado), sin TAB, LF o CR en la clase (orden de WHATWG): cada uno rompe alguna, también SOLO por sus líneas [V: modelo]                                                                                                                                              |
| @s52, controles de los extremos (uno, dos y los siete del final)            | 0 líneas                                             | recorte del FIN: sin cualquiera de los 5, un solo carácter (el `+` quitado), sin recorte [V: modelo]                                                                                                                                                                                                                                                 |
| @s52, todas                                                                 | la lista se pidió ≥ 1 vez                            | un recorte del PRINCIPIO roto deja el `href` FUERA y la lista sin pedir: segundo testigo, además de las filas con línea                                                                                                                                                                                                                              |
| @s52, TAB, LF y CR dentro                                                   | 0 líneas                                             | `Regex` de lo que se quita dentro: clase negada (con la clase SIN `+`, es su único mutante de nivel 1) [V: Stryker r2]                                                                                                                                                                                                                               |
| @s52, espacio y FF dentro                                                   | regla 2                                              | quitar dentro también el espacio o el FF; quitar `^` o `$` de la regex del recorte (la clase se quitaría en todo el `href`) [V: modelo]                                                                                                                                                                                                              |
| @s52 `⟨U+0020⟩/…/no-existe.svg`                                             | regla 2 con el valor CRUDO                           | poner en la línea el valor limpio                                                                                                                                                                                                                                                                                                                    |
| Regex del recorte, mutantes de nivel 1                                      | (las filas de @s52)                                  | `^` y `$` quitados, `+` quitado en cada extremo y clase negada: TODOS mueren en las tres formas previsibles [V: modelo y weapon-regex 1.3.6; y Stryker r2, 6 mutantes]                                                                                                                                                                               |
| @s53 `//cdn…`                                                               | 0 líneas, sin pedir la lista                         | `RUTA_INTERNA` sin `(?!\/)` o con `(?=\/)`                                                                                                                                                                                                                                                                                                           |
| @s53 `./x.css`, `../x.css`                                                  | 0 líneas                                             | `RUTA_INTERNA` sin el ancla `^`                                                                                                                                                                                                                                                                                                                      |
| @s53 `<link rel="icon">` sin href                                           | ANCLA y 0 líneas                                     | `?.[1]` → `[1]` (`OptionalChaining`: revienta → rama de @s29); filtro de `undefined` → `true`                                                                                                                                                                                                                                                        |
| @s53 (todas)                                                                | 0 líneas con la lista AUSENTE                        | `candidatos.length > 0` → `>= 0` o `true`, `if (hayCandidatos)` → `true`: cortarían con la línea de la lista ausente [V: Stryker r2]                                                                                                                                                                                                                 |
| @s54 sin base (ausente y `null`)                                            | regla 2, nunca la 1                                  | `base === null` → `false` (iría por la rama con base: regla 1); `slice(1)` eliminado (buscaría `dist//favicon.svg`); la base ausente sin normalizar a `null`; en el corte de S-12, `base !== null` → `true` o `===` (cortaría sin base) [V: Stryker r2]                                                                                              |
| @s54 `/NailsLashStudioWeb/favicon.svg` sin base                             | regla 2                                              | quitar «a ojo» el prefijo cuando no hay base declarada                                                                                                                                                                                                                                                                                               |
| @s54 base sin barra final (ronda 2: S-12)                                   | la línea de la base                                  | normalizar la base (añadirle la barra); en el predicado, `&&` → `                                                                                                                                                                                                                                                                                    |     | `, `endsWith('/')`→`startsWith`o`'/'`→`""` (estos dos, también con @s68 fila 4) [V: Stryker r2]                                              |
| @s55 una fila por `rel`, la caja y el `<body>`                              | regla 2                                              | filtrar por `rel`; un extractor sin la bandera `i` (desviaciones: los extractores reutilizados ya la llevan)                                                                                                                                                                                                                                         |
| @s55 fila `<body>` con el ANCLA DE SITIO (ronda 2)                          | regla 2, y el `href` DESPUÉS de `</head>`            | una puerta que saque los candidatos de `cabezaDe` [V: modelo r2, «solo-cabeza»: solo esta fila]; un ayudante del test que ignore la columna `sitio` y lo meta en el `<head>` (lo caza el ANCLA DE SITIO)                                                                                                                                             |
| @s56                                                                        | las 5 líneas, en orden                               | `ArrayDeclaration` sobre `[...hoy, ...links]` → `[]`, u orden invertido; deduplicar (el `/favicon.svg` doble); ordenar páginas; ruta física en vez de lógica                                                                                                                                                                                         |
| @s57 filas 1-3, 6 y 7                                                       | la línea del corte, SOLA                             | `ficheros === undefined` → `false`: en la forma E la lista indefinida REVIENTA y sale la línea de @s29 (muere en las 5 filas de corte de @s57, @s66 fila 2 y @s69); el corte después de las reglas de hoy (fila 2) o de la regla 1 (fila 3); su `ObjectLiteral` y su `ArrayDeclaration`; texto → `""`; sin la rama S-7 (filas 6 y 7) [V: Stryker r2] |
| @s57 filas 4-5                                                              | lo de hoy                                            | `if (hayCandidatos)` → `true` y `candidatos.length > 0` → `>= 0`: cortarían sin motivo. Estas filas NO matan `ficheros === undefined` → `true` (sin candidatos ni se evalúa): lo matan las 97 filas con candidatos y la lista presente, de @s46 en adelante [V: Stryker r2]                                                                          |
| @s58 fila 1                                                                 | línea de @s29 con la causa                           | tragarse la excepción de la lista (devolver `[]`)                                                                                                                                                                                                                                                                                                    |
| @s58 filas 2-3                                                              | 0 líneas / línea de @s26                             | pedir la lista SIEMPRE (`hayCandidatos` → `true`) o antes de `existe()` (un valor y no un método); en la 3, también `.some` → `.every` en los candidatos (`[].every(…)` es cierto con `dist/` ausente) [V: modelo]                                                                                                                                   |
| @s59 fila 1                                                                 | línea de la guarda                                   | `> 0` → `>= 0`; quitar la guarda (`BlockStatement`); texto → `""`                                                                                                                                                                                                                                                                                    |
| @s59 fila 2                                                                 | línea de la guarda sin lista                         | condicionar la guarda a la lista                                                                                                                                                                                                                                                                                                                     |
| @s59 filas 3-4                                                              | SOLO @s28 / SOLO el title                            | guarda colocada antes de la de @s28 o antes de las violaciones de hoy                                                                                                                                                                                                                                                                                |
| @s59 fila 5                                                                 | 0 líneas                                             | guarda que excluya la canónica (`rel="canonical"`)                                                                                                                                                                                                                                                                                                   |
| @s59 filas 6-7                                                              | 0 líneas                                             | guarda que cuente solo root-absolutos, o que filtre el `href` vacío (`filter(Boolean)`)                                                                                                                                                                                                                                                              |
| @s59 fila 8 (dos páginas)                                                   | 0 líneas                                             | `.some` → `.every` en la guarda (`MethodExpression`)                                                                                                                                                                                                                                                                                                 |
| @s60                                                                        | cada regla, exactamente 1 vez                        | `ArrayDeclaration`/borrado de una de las 5 entradas de `REGLAS_DEL_CASCARON`; duplicarla                                                                                                                                                                                                                                                             |
| @s65 control `favicon.svg`                                                  | 0 líneas                                             | «oculto» = «algún segmento CONTIENE un punto» [V: modelo]                                                                                                                                                                                                                                                                                            |
| @s65 `.vite/manifest.json`                                                  | regla 5                                              | quitar el predicado de oculto; mirar solo el ÚLTIMO segmento [V: modelo]; `.some` → `.every`, `startsWith` → `endsWith` [V: Stryker r2]                                                                                                                                                                                                              |
| @s65 `assets/.oculto.css`                                                   | regla 5                                              | mirar solo el PRIMER segmento tras `dist/` [V: modelo]                                                                                                                                                                                                                                                                                               |
| @s65 `.oculto-vacio.svg`                                                    | regla 5, nunca la 3                                  | la 3 antes que la 5 [V: modelo]                                                                                                                                                                                                                                                                                                                      |
| @s65 `.vite/no-existe.json`                                                 | regla 2                                              | mirar lo oculto ANTES de buscar en la lista: desde la ronda 2 SOLO lo mata esta fila, porque `./` y `../` de @s48 ya son la regla 4                                                                                                                                                                                                                  |
| @s66, las tres filas                                                        | regla 2 en `/servicios` / corte / @s29               | candidatos solo de la 1.ª página del listado; candidatos con `.every` y el listado no vacío. Los dos fallan ABIERTOS (exit 0 en las tres) y pasan el resto del contrato [V: modelo]                                                                                                                                                                  |
| @s68 filas 1-6 (ronda 2)                                                    | la línea de la base, SOLA, y la lista pedida 0 veces | el corte de S-12 → `{}` o su condición → `false`; su `ObjectLiteral`, su `ArrayDeclaration` y el `StringLiteral` del valor; `!esBaseUtilizable` → `esBaseUtilizable`; tomar la cadena vacía por ausente (`if (base)`, fila 2); pedir la lista antes de mirar la base (2º `Then`) [V: Stryker r2]                                                     |
| @s68 fila 7 (`/`)                                                           | 0 líneas y la lista pedida                           | un predicado que exija algo entre las dos barras; el corte de S-12 → `true`                                                                                                                                                                                                                                                                          |
| @s68 fila 8 (sin candidatos)                                                | 0 líneas y la lista pedida 0 veces                   | mirar la base fuera de `if (hayCandidatos)`                                                                                                                                                                                                                                                                                                          |
| @s69                                                                        | SOLO la línea de la lista                            | los dos cortes en el orden inverso                                                                                                                                                                                                                                                                                                                   |
| @s61                                                                        | ANCLA (con `assets/`), exit 0, `✓`                   | (sin Stryker) un humilde que liste solo HTML, NO recursivo (lo garantiza el ancla de `assets/`: sin ella, pasaba [V: e2e r2, «plano» sobre una copia sin `<link>` a `assets/`]), sin tamaño, o que no pase la lista o la base                                                                                                                        |
| @s62                                                                        | ≠ 0 y su línea, única; original RELEÍDO intacto      | (sin Stryker) el humilde que no cablea la lista (corte en vez de la regla), o que la cablea con ubicaciones físicas en vez de `dist/…`; un sabotaje que escriba en el original                                                                                                                                                                       |
| @s67                                                                        | regla 2 en la carpeta, única                         | (sin Stryker) el humilde sin `isFile()`: en Windows da la regla 3 (carpeta de 0 B) y con una carpeta de más de 0 B saldría con 0 [V: modelo y build real; Linux, I]                                                                                                                                                                                  |
| @s70 (ronda 2)                                                              | ≠ 0, la línea de @s26 y sin `ENOENT`                 | (sin Stryker) el humilde ANSIOSO, que lista antes de llamar a la puerta: sale con 1 por un `ENOENT` fuera de ella y sin la línea de @s26; pasaba todo lo demás [V: e2e r2]                                                                                                                                                                           |
| @s71 (ronda 2)                                                              | la regla 5, única                                    | (sin Stryker) el humilde que quita los ocultos: da la regla 2; pasaba todo lo demás [V: e2e r2]                                                                                                                                                                                                                                                      |
| @s72 (ronda 2)                                                              | exit 0, `✓`                                          | (sin Stryker) el humilde que deja fuera las HTML: da la regla 2 sobre la raíz; pasaba todo lo demás [V: e2e r2]                                                                                                                                                                                                                                      |
| @s63, @s64                                                                  | —                                                    | manual: el pipeline de verdad (`pnpm build` entero) y la web publicada (control de regresión)                                                                                                                                                                                                                                                        |

Los `StringLiteral` de las 5 reglas y de las 3 líneas nuevas mueren en CADA fila que espera una línea exacta.
**Equivalentes (ronda 2, medidos).** El `=== 0` → `<= 0` que este mapa anticipaba en la ronda 1 Stryker 9.6.1 NO
lo genera: `equality-operator-mutator.js:10` solo da `!==` para `===`. Los equivalentes que SÍ aparecen son de
FORMA, no de la spec, y la cabecera de la sección dice cómo escribirlos para que no aparezcan: el cableado de la
lista con `hayCandidatos && ficheros !== undefined ? … : []` más un `if (hayCandidatos)` (3 supervivientes) o con
`ficheros?.listar() ?? []` (3), y tres idiomas: el `+` en lo que se quita dentro, el `slice(1)` en el predicado de
oculto y el `^` al quitar la barra sin base (1 cada uno) [V: Stryker r2]. Si aparecen, se REFACTORIZAN, nunca se
excluyen (`mutante-equivalente-se-refactoriza-para-proteger-un-throw-real`, spec «Mutación (D10)»). Si la limpieza
se escribe quitando TAB, LF y CR ANTES de recortar, la clase del recorte basta con FF y espacio: con los cinco,
esos tres serían hijos sobrantes de la clase (nivel 2 de `weapon-regex`, que Stryker 9.6.1 no genera:
`regex-mutator.js:22`, `mutationLevels: [1]`); las dos formas dan el mismo resultado (§8).

## 3. Ciegos declarados (ningún `Then` los ve, y la spec lo acepta)

- **Los huecos de la spec** («Huecos DECLARADOS»), todos en el banner: `href` relativos (uno que empieza por
  barra invertida NO lo es: @s50, S-7); URL absolutas y `//host`, que F-05 solo ve con un `rel` de petición o
  contacto de sus listas: con `apple-touch-icon`, un `rel` desconocido o sin `rel` no las ve NINGUNA de las dos
  puertas (la deuda de FS-6, `project-spec.md:4678`, SIGUE ABIERTA); `<script src>`, `<img src|srcset>`,
  `<source>` y `url()` del CSS; `fetch()`; `<base href>`; comillas simples o sin comillas; el umbral de 0 bytes;
  `vite-ignore` (la regla 1 acusa su efecto, @s47); otros controles C0 en los extremos; y, desde la ronda 2, la
  anti-404 de `<a>` sin limpieza ni regla 4 (la asimetría 3: `<a href=" /x">` y `<a href="⟨U+005C⟩x">` quedan
  fuera, falso negativo HEREDADO de A-17; @s23/@s24 no se tocan) y `baseDeclarada`, que lee texto (un comentario
  `// base: '/vieja/',` delante de la línea real pasa el predicado de S-12 y daría reglas 1 inexactas; hoy
  `vite.config.ts` trae una sola aparición de `base:`, spec). @s53 FIJA que relativos, absolutos y `//` quedan
  fuera; el resto no tiene escenario.
- **`REGLAS_DEL_CASCARON` no es «TODAS las reglas»**, aunque su comentario lo diga (`src/lib/puerta-cascaron.ts:857`):
  le falta `REGLA_RUTA_AUSENTE` (:670), que la puerta emite (@s26) [V: copia literal, 22 entradas, `includes` →
  `false`]. Hueco DECLARADO en @s60, en el banner y, desde su ronda 2, en la spec; no se cierra en H-5 (§5,
  pregunta 1).
- **Lo que la limpieza no recorta.** Ningún `Then` distingue la limpieza de los 5 espacios ASCII de la spec de
  un `.trim()` de JavaScript, que además recorta U+000B, U+00A0, U+FEFF y otros. Con `.trim()` la puerta
  fallaría cerrada en MÁS casos (nunca abierta), pero se apartaría de la spec. No se fija con una fila a
  propósito: con U+000B la fila consagraría un falso negativo (el navegador SÍ lo recorta: `new URL` de Node
  22.15.0 da `/favicon.svg` [V]). Lo contrasta el `judge` contra la spec.
- **El humilde nunca lee el contenido** (`readFileSync`): no es observable desde un test; lo ve el `judge` en
  el código. Lo demás del humilde SÍ tiene `Then` desde la ronda 2: @s61 (raíz y subcarpetas, con su tamaño; el
  ancla de `assets/` hace que dependa del contrato), @s67 (solo ficheros), @s70 (lista DESPUÉS de `existe()`),
  @s71 (también los ocultos, sin filtrar) y @s72 (también las HTML). La ronda 1 decía aquí que «@s61 sí prueba
  que la lista trae todos los ficheros»: era FALSO para los ocultos y las HTML (§9, R2-3 y R2-10).
- **S-4 (las reglas viven fuera de `inspeccionarSitio`)** es estructura: la protegen las 39 llamadas de hoy, que
  no cambian, y el `judge`.
- **Un sabotaje de caja en el extremo a extremo**: no se siembra (firma distinta en Windows y en Linux, [I]); la
  caja la fijan @s47 y @s48 en la puerta pura.
- **Más de una HTML en el artefacto real**: hoy solo hay `index.html` (`RUTAS_ESPERADAS = ['/']`); el orden, la
  ruta y los candidatos repartidos entre páginas los fijan @s56 y @s66 con fixtures.
- **Cuántos `<link>` trae el artefacto real**: @s61 exige «al menos 1 con la base», «al menos 1 con `assets/`» y
  «exactamente 1» del favicon, nunca el total (11): el número de precargas es de F-05.
- **Lo que la guarda nueva no certifica**: solo un fallo TOTAL del extractor; en el artefacto real la canónica
  (el primer `<link>` de 11 [V: build real]) la satisface sola. Que se resuelva algún root-absoluto lo prueban
  @s61 y @s62.

## 4. Autorrevisión del `gherkin_author` (rondas 1 y 2)

### 4.1 ¿Es satisfacible cada `Then` con el repo real?

- **@s46-@s60, @s65, @s66, @s68 y @s69 (puros)**: la «página correcta» es la salida por defecto de `htmlCrudo()`,
  que hoy pasa `inspeccionarSitio` sin violaciones (@s12, `src/lib/puerta-cascaron.test.ts`) [V]; bajo la base su
  `<a href="/">` queda fuera (`esEnlaceRoto` devuelve `false` sin el prefijo, `src/lib/puerta-cascaron.ts:601-603`)
  [V]; con la base `/` resuelve a la raíz y con `./` queda fuera (@s68 filas 7 y 8; la de hoy da 0 en la 8 [V:
  §10]). Las líneas de hoy que se citan son literales del código: @s26 `ruta esperada sin HTML en dist/` (:670,
  con `valor` vacío), @s28 (:848), @s29 (:797), el title (`acusar(REGLA_TITULO, titulo ?? '')`, :480) y el
  formato (:777-779) [V]. **Ronda 1**: 138 corridas de las filas de un `href` contra un modelo de la spec, 0 en
  rojo (§8). **Ronda 2**: las 125 filas puras se LEEN del `.feature` nuevo (las tablas tal cual; los escenarios
  sin tabla genérica, escritos a mano desde él) y se corren contra un modelo de la spec con S-11 y S-12 montado
  sobre una copia literal de `src/lib/puerta-cascaron.ts`, en la forma de cableado E: **0 en rojo**; con la
  puerta de hoy, 96 en rojo y 29 en verde, los controles [V: §10].
- **@s59 fila 1**: `<link rel="canonical">` sin `href` → `atributoDeEtiqueta` devuelve `''`, no `null`
  (:387-401), así que no salta «canónica ausente» [V: leído y medido].
- **@s50 y @s52**: los comportamientos del navegador que se citan están medidos con `new URL(href,
'https://cenit-digital.github.io/NailsLashStudioWeb/')` en Node 22.15.0 (implementa el URL Standard) [V]:

| `href` (notación del `.feature`)                                                                         | host                    | ruta pedida                                                             |
| -------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| `⟨U+0020⟩/favicon.svg⟨U+0020⟩`                                                                           | cenit-digital.github.io | `/favicon.svg`                                                          |
| `⟨U+0009⟩/NailsLashStudioWeb/favicon.svg` (y con `⟨U+000C⟩`)                                             | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`                                       |
| `/NailsLashStudioWeb/fav` + TAB, LF o CR + `icon.svg`                                                    | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`                                       |
| `/NailsLashStudioWeb/fav⟨U+0020⟩icon.svg`                                                                | cenit-digital.github.io | `/NailsLashStudioWeb/fav%20icon.svg`                                    |
| `/NailsLashStudioWeb/fav⟨U+000C⟩icon.svg`                                                                | cenit-digital.github.io | `/NailsLashStudioWeb/fav%0Cicon.svg`                                    |
| `/⟨U+005C⟩cdn.ejemplo/x.css`                                                                             | **cdn.ejemplo**         | `/x.css`                                                                |
| `/NailsLashStudioWeb⟨U+005C⟩favicon.svg`                                                                 | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`                                       |
| `/NailsLashStudioWeb/./favicon.svg` y `assets/../`                                                       | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`                                       |
| `//cdn.ejemplo/x.css`                                                                                    | **cdn.ejemplo**         | `/x.css`                                                                |
| U+000B + `/favicon.svg`                                                                                  | cenit-digital.github.io | `/favicon.svg` (lo recorta)                                             |
| U+00A0 + `/favicon.svg`                                                                                  | cenit-digital.github.io | `/NailsLashStudioWeb/%C2%A0/favicon.svg`                                |
| **Ronda 1:** `⟨U+0020⟩⟨U+0009⟩⟨U+0020⟩⟨U+000A⟩⟨U+0020⟩⟨U+000D⟩⟨U+0020⟩/NailsLashStudioWeb/no-existe.svg` | cenit-digital.github.io | `/NailsLashStudioWeb/no-existe.svg`                                     |
| **Ronda 1:** `/NailsLashStudioWeb/favicon.svg⟨U+0020⟩⟨U+0009⟩⟨U+0020⟩⟨U+000A⟩⟨U+0020⟩⟨U+000D⟩⟨U+0020⟩`   | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`                                       |
| **Ronda 1:** `⟨U+000C⟩/…/no-existe.svg` y `⟨U+0020⟩⟨U+000C⟩/…/no-existe.svg`                             | cenit-digital.github.io | `/NailsLashStudioWeb/no-existe.svg`                                     |
| **Ronda 1:** `⟨U+005C⟩favicon.svg`                                                                       | cenit-digital.github.io | `/favicon.svg` (el 404 de la firma a)                                   |
| **Ronda 1:** `⟨U+005C⟩NailsLashStudioWeb/favicon.svg`                                                    | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`                                       |
| **Ronda 1:** `⟨U+005C⟩⟨U+005C⟩cdn.ejemplo/x.css`                                                         | **cdn.ejemplo**         | `/x.css`                                                                |
| **Ronda 2:** `/` (bajo la base, @s47)                                                                    | cenit-digital.github.io | `/` (fuera del sitio)                                                   |
| **Ronda 2:** `⟨U+005C⟩/cdn.ejemplo/x.css`                                                                | **cdn.ejemplo**         | `/x.css`                                                                |
| **Ronda 2:** `/NailsLashStudioWeb//favicon.svg`                                                          | cenit-digital.github.io | `/NailsLashStudioWeb//favicon.svg` (Pages: 200, 2244 B)                 |
| **Ronda 2:** `/./favicon.svg`                                                                            | cenit-digital.github.io | `/favicon.svg`                                                          |
| **Ronda 2:** `/NailsLashStudioWeb/.../favicon.svg`                                                       | cenit-digital.github.io | igual (Pages: 404)                                                      |
| **Ronda 2:** `…/favicon.svg?v=/../x`, `…#/./x` y `…#//x`                                                 | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg` (la query y el fragmento no se tocan) |

La barra invertida dentro de la ruta se lee como `/` (S-2, que la spec ya da por [V]). Consecuencia que el
contrato escribe: la fila `/NailsLashStudioWeb⟨U+005C⟩favicon.svg` de @s50 es un falso positivo CONSCIENTE, como
el `%` (pediría el favicon que sí existe), y lo mismo `⟨U+005C⟩NailsLashStudioWeb/favicon.svg`. Desde la ronda 2
también los segmentos `.`, `..` y `//` de @s48: GitHub Pages sirve `./`, `assets/../` y `//` con 200 y 2244 B
(`curl -s --path-as-is`, 2026-10-01 13:38 UTC [V: §10]).

- **@s61**: el artefacto real trae `<link rel="icon" href="/NailsLashStudioWeb/favicon.svg">` y su fichero con
  más de 0 bytes (lo asevera ya F-28 @s8 sobre el mismo build) [V]; el exit 0 con la puerta de hoy es el «H-3
  control» (:524-533) [V]. Ronda 2: sobre un build real hay 10 `<link>` con la base, 7 con `assets/` y 1 al
  favicon; el modelo de la puerta con el humilde de la spec da exit 0 y `✓` [V: §10].
- **@s62, @s67 y @s71**: con la puerta de hoy las copias salen con 0 (nacen en ROJO); con el modelo y el humilde
  de la spec, cada una da exactamente su línea [V: §10, ronda 2, sobre copias de un build real].
- **@s70 y @s72**: con la puerta de hoy ya pasan (nacen en VERDE): sobre el directorio inexistente sale la línea
  de @s26 con código 1 y sin `ENOENT`; sobre la copia de la raíz, 0 y `✓` [V: §10].
- **@s63**: la fila (a) la midió el lead con el código de hoy (exit 0, brief §2) [V: brief]; con la enmienda,
  ≠ 0 [I]. La puerta del cascarón es la PRIMERA de la cadena de `pnpm build` (`package.json:16`) [V].
- **@s64**: `/favicon.svg` → 404 y `/NailsLashStudioWeb/favicon.svg` → 200 [V: `curl -I`, 2026-10-01, 11:54 UTC].
  Pasa igual sin H-5: es un control de regresión (§7, R7).
- **@s65 y @s71**: `/NailsLashStudioWeb/.vite/manifest.json` → 404 en GitHub Pages [V: `curl -I`, 2026-10-01]; el
  build real trae `.vite/manifest.json` con 8719 B [V: §10].
- **@s67**: el build real tiene la carpeta `assets/`; `readdirSync` recursivo devuelve 42 entradas, 39 ficheros y
  3 carpetas, y `statSync` de una carpeta da 0 B en Windows; `/NailsLashStudioWeb/assets` → 301 → `/assets/` →
  404 [V: §8].

### 4.2 Colisiones con lo que ya está `done`

- **@s1-@s45**: 0 líneas tocadas [V]. Ningún fixture de `src/lib/puerta-cascaron.test.ts` lleva un `<link>`
  root-absoluto que llegue a la puerta: los dos que hay (líneas 1116 y 1706) van a `canonicaDeLaPagina` [V: grep].
- **Las llamadas de hoy a la puerta** (corregido en la ronda 2, §9: la ronda 1 decía aquí «Todos llevan la
  canónica con `href`», y era FALSO para F-06 y para las ejecuciones sin página). Las 11 de
  `src/lib/puerta-cascaron.test.ts` son 13 ejecuciones (la de :882 es un `it.each` de 3 filas): 10 con página,
  todas con la canónica con `href` (`htmlCrudo` la trae por defecto, :79 y :90, o una absoluta explícita), de las
  que 4 esperan 0 (:936, :983, :1007 y :1730: el caso de @s57 fila 4), y 3 sin página (@s26, :866-873, dos filas;
  @s29, :955), que no llegan a la guarda. La de F-06 (`src/lib/puerta-anclas.test.ts:432-435`) usa `html()`
  (:74-103): `<head></head>` y 0 `<link>`, y sale hoy con 6 violaciones (title, description, canónica, h1, JSON-LD
  y `/aviso-legal`) [V: §10, la puerta de hoy y el modelo sobre una copia literal del fixture]. Su veredicto (≠ 0,
  :436) no cambia SOLO porque las violaciones devuelven antes que cualquier guarda (`src/lib/puerta-cascaron.ts:830-832`):
  es el caso de @s57 fila 5. Lo mismo los experimentos head-espacio, head-mayusculas y head-atributo de @s33, que
  corren el humilde: 0 `<link>` en su `dist/index.html` [V: §10] y ≠ 0 por otras violaciones
  (`src/lib/trampas-del-horneado.test.tsx:370` y :378). ACOPLAMIENTO declarado en el banner, con la condición
  medida: quitarles las violaciones obliga a darles una canónica (si no, «canónica ausente»); con `href` la guarda
  pasa (@s59 fila 5), sin él habla (@s59 fila 1).
- **@s13 (canónica ausente)**: @s59 fila 1 FIJA que una canónica sin `href` entre comillas dobles cuenta como
  PRESENTE (S-9), cosa que @s13 nunca decidió (su fila solo cubre «no hay ningún `<link rel="canonical">`»,
  `features/cascaron_semantico.feature:1109` desde esta ronda [V: grep]: era :1045 antes de la ronda 1 y :1079
  después, y el banner de la ronda 2 crece 30 líneas). La spec (S-9, `project-spec.md:1463`) cita :1079, la línea
  de `f850db8`: PENDIENTE para el `spec_partner`, fuera de mi alcance (§9, R2-14). Declarado en el banner: si
  @s13 se endurece, la guarda vuelve a la puerta humana; nunca se excluyen sus mutantes.
- **Cambio de veredicto declarado**: una canónica sin `href` (o con comillas simples) y ningún otro `href` de
  `<link>` hoy sale con 0 y con la enmienda no [V: la puerta de hoy da `{"codigoSalida":0,"lineas":[]}`]. Está en
  el «QUÉ CAMBIA» del banner para que la puerta humana lo ratifique.
- **Cambio de diagnóstico declarado (S-12, ronda 2)**: con una base declarada no utilizable y algún candidato, la
  puerta del cascarón, la 1.ª de `pnpm build` (`package.json:16`), corta con su línea y la de F-05 (la 4.ª) no se
  imprime. En el banner («QUÉ CAMBIA») y en @s68.
- **@s33 `head-correcto`** (`src/lib/trampas-del-horneado.test.tsx`): su único `<link>` horneado es la canónica
  absoluta [V: §10, 1 `<link>`]: 0 candidatos, la guarda cuenta 1, exit 0 sigue. @s59 fila 5 es justo ese caso.
- **@s32 `react19-nativa`**: su canónica sale en el `<body>` (`</head>` en el offset 148, el `<link>` en el 314
  [V: §10]) y es absoluta: no es candidato, y como ya hay violaciones la guarda no corre [I]. Sus líneas no
  cambian. Es también la prueba de que un `<link>` en el `<body>` es realista (@s55).
- **@s39-@s42 y F-28 @s8** (`src/pages/home-horneado.test.ts`): su ayudante `elementos` pasa a delegar en uno
  nuevo, `elementosDe(fuente, etiqueta)`, con el mismo patrón (excepción DECLARADA en el banner); ninguna de sus
  llamadas cambia, y F-28 @s8 sigue leyendo el artefacto original, que @s62, @s67, @s71 y @s72 exigen intacto
  releyéndolo. @s70 usa el mismo directorio inexistente que el «H-3 caso» (:535-541), sin tocarlo.
- **@s34** (`src/lib/seo.test.ts:355-356`): los cinco textos nuevos, con el de la regla 4 de la ronda 2, no
  contienen «origen» ni «placeholder» [V: leídos]; @s60 exige que estén en la lista para que @s34 los vea.
- **@s23/@s24 (A-17)**: no se tocan. La asimetría 3 (la limpieza, la barra invertida inicial y la regla 4 son
  solo de `<link>`) queda DECLARADA en el banner como falso negativo heredado de A-17 (spec, «Las tres
  asimetrías»).
- **F-05**: no se toca. Rechaza una URL absoluta de tercero SOLO con un `rel` de sus listas
  (`src/lib/terceros.ts:92-99` y :109); con `apple-touch-icon` no (la deuda de FS-6, abierta). @s47 y el banner
  lo dicen así. Validar la `base` sigue siendo suyo (@s27) cuando no hay candidatos (@s68 fila 8).

### 4.3 Anclas positivas

Toda fila pura empieza por el ANCLA del extractor nuevo sobre esa página (el mismo que usan las reglas y la
guarda). El ANCLA mira el extractor, no la clasificación: @s46, @s51, @s52 y @s68 anclan además si la lista se
pidió (solo se pide con candidatos y, con base declarada, si es utilizable), y la fila `<body>` de @s55 ancla el
SITIO del `<link>` a mano sobre el texto. @s59 no lleva ANCLA porque el extractor ES su objeto: su 1er `Then` mide
lo que la guarda cuenta. @s61 ancla el artefacto real (≥ 1 `<link>` con la base, ≥ 1 con `assets/` y el favicon);
@s62, @s67, @s71 y @s72 anclan que cada sabotaje está hecho, leyendo la COPIA del disco, y que el original sigue
intacto, releyéndolo; @s70, que el directorio no existe. @s64 lleva su contraprueba de 404.

## 5. Lo que el contrato precisa sobre la spec (se ratifica en la puerta; recomendación: aprobar tal cual)

Ninguna cambia una decisión de Pablo ni del `spec_partner`; todas se derivan de la spec o la hacen medible.

1. **El extractor nuevo se exporta y se usa como ANCLA** en cada fila pura. La spec ya lo pide puro y exportado
   («nombres orientativos: `extraerLinks(html)`»); el contrato fija que devuelva el `href` CRUDO, en orden de
   aparición, sin los `<link>` sin `href` y con el vacío como `""`.
2. **La lista de referencia** (12 ficheros: los iconos con los bytes reales de `public/`, `dist/.vite/manifest.json`
   con los del artefacto real y dos ocultos más de fixture, uno de 0 B) y «la página correcta» = `htmlCrudo()` sin
   tocarlo, con el `<link>` insertado: así se cumple «ningún fixture de @s1-@s45 cambia». Ronda 2: dos variantes
   de esa lista en @s51 (sin `dist/index.html`, y con él a 0 B).
3. **La limpieza, observable en los dos extremos** (@s52): «la lista se pidió» en cada fila y filas con línea y
   el carácter al principio (FF; espacio+FF; espacio, TAB, espacio, LF, espacio, CR, espacio).
4. **El espacio y el FF DENTRO del `href` dan la regla 2** (@s52): se deduce de la spec (dentro solo se quitan
   TAB, LF y CR) y coincide con el navegador, que los codifica (`%20`, `%0C`) [V: Node].
5. **La guarda habla también con la lista AUSENTE** (@s59 fila 2): la spec la pone en `inspeccionarArtefacto` sin
   condicionarla a la lista, y ya lo dice («Ausente, sin ninguno: lo de hoy, con UNA excepción»); el título de
   @s57 y su fila 4 lo repiten.
6. **Con `dist/` ausente y una lista que lanza, sale la línea de @s26** (@s58 fila 3): es el «método y no valor»
   de la spec, hecho observable; y con el humilde real, @s70 (ronda 2).
7. **La guarda con dos páginas** (@s59 fila 8): la fila que mata `.some` → `.every` en la guarda.
8. **Un candidato en la SEGUNDA página basta** (@s66): «en todo HTML del artefacto» (H5-2) hecho observable con la
   lista presente, ausente y que lanza.
9. **`<LINK REL HREF>` en mayúsculas y `hreflang` delante** (@s55): propiedades de los extractores reutilizados
   (`ENLACE` y `ATRIBUTO_HREF` llevan la bandera `i`, `src/lib/puerta-cascaron.ts:72-74`).
10. **Extremo a extremo**: el ANCLA del sabotaje leída de la COPIA, «es la ÚNICA línea con ` — link
root-absoluto`», el original RELEÍDO e idéntico, el `href` leído tal cual (`.get('href')`, nunca `valorDe`) y
    el ayudante nuevo `elementosDe` (excepción declarada). @s61 ya no asevera «ninguna línea nueva» (vacía, §7 R25).
11. **@s67, el humilde lista solo ficheros**: un cuarto sabotaje que NO es una firma (S-5 sigue en tres); la spec
    dice que el extremo a extremo prueba el humilde y que este lista «solo ficheros».
12. **@s63 y @s64 anotan en `progress/verificacion_viva_h5_enlaces_horneados.md`** (precedente:
    `progress/verificacion_viva_favicon_marca.md`); @s64 fija su extractor, anota tamaño y SHA-256 del HTML (no
    los bytes) y se declara CONTROL de regresión.
13. **Tag nuevo `@demostracion-del-lead`** (@s63), declarado en el banner.
14. **Ronda 2 — la forma del cableado y tres idiomas** (cabecera de la sección, «PARA EL `tdd_craftsman`»): la
    spec deja libre CÓMO se escribe; el contrato fija la forma E y prohíbe `?.`, `??`, `!` y el `[]` por
    defecto, porque las otras dejan mutantes equivalentes que con el 100 % y 0 exclusiones bloquean el cierre.
15. **Ronda 2 — la raíz se BUSCA** (@s51, listas variantes) y **`/` bajo la base es la regla 1** (@s47): pasos 4-5
    y definición de root-absoluto de la spec, hechos observables.
16. **Ronda 2 — el ANCLA DE SITIO** (@s55, fila `<body>`): el caso límite 14, con un testigo que no dependa de
    cómo el ayudante coloque el `<link>`.
17. **Ronda 2 — un control de más en @s48**: `#//x`. La spec lista `?v=/../x` y `#/./x` («Se mira sobre la
    RUTA»); el `//` dentro del fragmento es la misma regla aplicada al tercer elemento de S-11.
18. **Ronda 2 — @s70, @s71 y @s72**: lo que la spec dice del humilde («no puede listar antes de que la puerta
    pregunte `existe()`», «lista también los ocultos y no filtra nada», «HTML incluidas») hecho observable.
    @s70 y @s72 NACEN EN VERDE: son controles que la puerta de hoy ya cumple y la enmienda no debe romper.

**Preguntas para la puerta humana, con su recomendación:**

1. ¿Se añade `REGLA_RUTA_AUSENTE` a `REGLAS_DEL_CASCARON` (que hoy no es «TODAS las reglas»)? **Recomendación:
   no en H-5**; queda DECLARADO (@s60, banner, spec). Es de @s26, ajeno a H-5 (brief §3: conservar las puertas
   existentes), y hoy no esconde nada: su texto no contiene «origen» ni «placeholder».
2. ¿Se acepta la excepción a «ningún ayudante de @s1-@s45 cambia» (`elementos` delega en `elementosDe`)?
   **Recomendación: sí**: es la única forma de medir las copias y el original releído sin un segundo patrón ni
   tocar el estado compartido `html`.
3. ¿Se aceptan los sabotajes del humilde que la D9 de la spec no lista: @s67 (carpeta) y @s71 (oculto), y los
   controles @s70 (`dist/` ausente) y @s72 (la raíz)? **Recomendación: sí**: cada uno ancla una propiedad del
   humilde que la spec da por probada por el extremo a extremo y que ningún otro `Then` veía (medido: un humilde
   sin ella pasaba todo lo demás, §10). Ninguno es una firma: S-5 sigue en tres.
4. ¿Se ratifican S-11 (los segmentos `.`, `..` y vacíos a la regla 4, con su texto ampliado) y S-12 (cortar con
   la línea de la base, también el cambio de diagnóstico frente a F-05)? **Recomendación: sí, tal cual**: es la
   recomendación de la propia spec («Preguntas abiertas») y el contrato ya los fija (@s48, @s54, @s68, @s69).

## 6. Traza: spec → escenarios

| Spec (`project-spec.md` §Feature 4 → «Enmienda 5»)                                                                 | Escenarios                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H5-1 dueño F-04 (ENMIENDA 5, desde @s46)                                                                           | todo el bloque; banner                                                                                                                                           |
| H5-2 todo `<link>`, sea cual sea su `rel`, en todo HTML                                                            | @s46, @s55, @s56 y @s66 (dos páginas)                                                                                                                            |
| H5-2 «root-absoluto» tras la limpieza; `/` + barra invertida falla cerrado                                         | @s52, @s47 (`⟨U+0020⟩/favicon.svg` y `/`), @s53 (`//`), @s50                                                                                                     |
| H5-3 resolución ESTRICTA (solo la raíz → `index.html`, que se busca)                                               | @s51 (con las listas variantes), @s48 (`assets`, `...`), @s67 (carpeta real), @s72                                                                               |
| H5-4 `%` y `&` con regla propia, sin decodificar                                                                   | @s50                                                                                                                                                             |
| H5-5 lista OPCIONAL que falla cerrado                                                                              | @s57, @s58, @s66, @s69                                                                                                                                           |
| H5-6 fusionar, publicar y comprobar                                                                                | @s64                                                                                                                                                             |
| S-1 una sola regla para `%`, `&` y la barra invertida                                                              | @s50                                                                                                                                                             |
| S-2 la barra invertida en CUALQUIER posición                                                                       | @s50 (`/NailsLashStudioWeb⟨U+005C⟩favicon.svg`)                                                                                                                  |
| S-3 lista ausente con candidatos → corta con una línea                                                             | @s57 filas 1-3, 6 y 7, @s66 fila 2, @s69                                                                                                                         |
| S-4 las reglas fuera de `inspeccionarSitio`                                                                        | @s57 filas 4-5 (lo de hoy); ciego estructural (§3)                                                                                                               |
| S-5 el extremo a extremo siembra las TRES firmas                                                                   | @s62                                                                                                                                                             |
| S-6 el valor es el `href` CRUDO                                                                                    | @s47 y @s52 (filas con espacio o FF), @s50 (`&amp;`), @s49 (`?v=2`)                                                                                              |
| S-7 barra invertida AL PRINCIPIO: candidato, regla 4                                                               | @s50 (cuatro filas finales), @s57 filas 6 y 7                                                                                                                    |
| S-8 regla 5, ocultos en la lista                                                                                   | @s65; @s71 (el humilde no los filtra); @s49 (comentario de `.nojekyll`)                                                                                          |
| S-9 canónica sin `href` = presente para @s13; acoplamiento                                                         | @s59 fila 1 y comentario; banner                                                                                                                                 |
| S-10 el rojo demostrado es solo la (a)                                                                             | @s63; @s62 siembra la (c) sobre una copia                                                                                                                        |
| S-11 los segmentos `.`, `..` y `//` de la RUTA → regla 4                                                           | @s48 (título y 8 filas: `./`, `../`, `//`, `/./favicon.svg`, `...` y los controles `?v=/../x`, `#/./x`, `#//x`); texto de la regla 4 en la cabecera, @s50 y @s60 |
| S-12 base declarada no utilizable con candidatos → corta                                                           | @s68, @s69, @s54 (última fila); banner («CAMBIO DE DIAGNÓSTICO»)                                                                                                 |
| Las cinco reglas, texto exacto, en `REGLAS_DEL_CASCARON`                                                           | @s47-@s50, @s65, @s60                                                                                                                                            |
| Formato y orden del informe                                                                                        | @s56                                                                                                                                                             |
| El puerto: presente (se pide solo con candidatos y base utilizable; si lanza, @s29)                                | @s46, @s51, @s52, @s58, @s66, @s68                                                                                                                               |
| El puerto: ausente con / sin candidatos                                                                            | @s57, @s53, @s66, @s69                                                                                                                                           |
| El humilde lo cablea siempre, perezoso, todos los ficheros (ocultos y HTML) y solo ficheros, sin leer el contenido | @s61, @s62, @s67, @s70, @s71, @s72; «sin leer el contenido», ciego (§3)                                                                                          |
| Guarda anti-vacuidad del extractor nuevo, qué no certifica y su acoplamiento                                       | @s59                                                                                                                                                             |
| Qué NO cambia (con el cambio de veredicto de la guarda y las llamadas de hoy, declarados)                          | @s1-@s45 intactos; @s57 filas 4-5; @s59 fila 2; @s61 (`✓`); banner                                                                                               |
| Asimetría 1 (`<a>` fuera, `<link>` regla 1; F-05 solo con sus `rel`)                                               | @s47 (`/otra-cosa/x.css` y comentario), @s55 (segunda canónica), @s53                                                                                            |
| Asimetría 2 (ficheros frente a rutas lógicas)                                                                      | @s51 (`/NailsLashStudioWeb/x`)                                                                                                                                   |
| Asimetría 3 (limpieza, barra invertida inicial y regla 4, solo de `<link>`)                                        | banner («QUÉ NO CAMBIA» y huecos); sin escenario: heredado de A-17, @s23/@s24 no se tocan                                                                        |
| D9 extremo a extremo: ancla, control, tres sabotajes                                                               | @s61, @s62 (y @s67, @s70-@s72, el humilde)                                                                                                                       |
| D9 rojo demostrado del lead                                                                                        | @s63                                                                                                                                                             |
| D10 mutación al 100 %, solo con los unitarios                                                                      | @s46-@s60, @s65, @s66, @s68, @s69 (§2)                                                                                                                           |

Los 19 casos límite de la spec, uno a uno:

| Caso límite                                                                                                              | Escenario / fila                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 1 la raíz, con base y sin ella (y se busca en la lista)                                                                  | @s51 filas 1-2 y las tres de las listas variantes |
| 2 `x/` (no raíz) y `assets` (carpeta sin barra)                                                                          | @s51 (`x/`, `/x/`, `x`), @s48 (`assets`), @s67    |
| 3 la base sin su barra final como `href`                                                                                 | @s47 (`/NailsLashStudioWeb`)                      |
| 4 caja: `FAVICON.SVG` → 2; `nailslashstudioweb` → 1                                                                      | @s48, @s47                                        |
| 5 limpieza; `" /favicon.svg"` → 1                                                                                        | @s52, @s47                                        |
| 6 `//cdn…` no es de esta puerta                                                                                          | @s53                                              |
| 7 `/` + barra invertida + `cdn…` y `/NailsLashStudioWeb` + barra invertida + `favicon.svg` → 4                           | @s50                                              |
| 8 `?v=2` y `#x` resuelven; `&amp;` en la query → 4                                                                       | @s48, @s50                                        |
| 9 `%2E` → 4 aunque Pages la sirva                                                                                        | @s50                                              |
| 10 `.`, `..` y `//` → 4 (nunca la 2); `/./favicon.svg` → 4 antes que la 1; la query y el fragmento no cuentan; `...` → 2 | @s48 (S-11)                                       |
| 11 1 byte pasa; 0 bytes → 3                                                                                              | @s49                                              |
| 12 sin base: con fichero pasa; sin él → 2, nunca la 1                                                                    | @s54                                              |
| 13 `href=""`, sin `href`, relativo o absoluto: fuera; con `href`, cuentan para la guarda                                 | @s53, @s59                                        |
| 14 `<link>` en el `<body>`                                                                                               | @s55 (fila `<body>`, con el ANCLA DE SITIO)       |
| 15 dos páginas: la línea con la ruta de la que lo trae                                                                   | @s56, @s66                                        |
| 16 base sin barra final: corta con la línea de la base (S-12), nunca la 2                                                | @s54 (última fila)                                |
| 17 barra invertida AL PRINCIPIO → 4; sin la lista, corta                                                                 | @s50 (cuatro filas finales), @s57 filas 6 y 7     |
| 18 ocultos en la lista → 5 (también de 0 B); no en la lista → 2; un punto que no abre segmento no oculta                 | @s65                                              |
| 19 base no utilizable (S-12): cada condición, la dinámica, la de una línea; `/` utilizable; sin candidatos, lo de hoy    | @s68; el orden tras la lista ausente, @s69        |

Y la lista de «Mutantes que deben morir» de la spec («Mutación (D10)»): limpieza (extremos y tabulador dentro) →
@s52; aceptar `//` → @s53; `%`, `&` y la barra invertida, una fila por carácter → @s50; la raíz con base y sin
ella → @s51 (filas 1-2 y las listas variantes); `=== 0` → `<= 0` / `< 1` con la fila de 1 byte → @s49 (Stryker
no genera `<= 0` desde `===`, §2); `?query`/`#fragmento` → @s48 y @s50; el orden de las reglas → @s47 (sin base y
sin fichero, SOLO la 1), @s50 (con `%` y sin fichero, SOLO la 4), @s48 (`/./favicon.svg`, la 4 antes que la 1) y
@s65 (oculto de 0 B, SOLO la 5); el puerto ausente con y sin candidatos → @s57 y @s66; el puerto que lanza y el
que no se consulta → @s58 y @s66; la guarda (`.some` → `.every`, `> 0` → `>= 0`) con la canónica sin `href` →
@s59; la barra invertida inicial (S-7) → @s50 y @s57; la regla 5 (predicado, primer segmento, 5 antes que 3,
antes de buscar en la lista) → @s65; los segmentos (S-11: el `.`, el `..` y el `//`, sobre la ruta y no sobre el
`href`, por igualdad y no con `startsWith`) → @s48 y @s65; la base no utilizable (S-12: cada condición, `/`, solo
con candidatos, su orden, que no pide la lista y el valor de su línea) → @s68, @s69 y @s54; el texto de cada regla
y línea, literal → todas las filas con línea, y @s60.

## 7. Revisión adversarial — ronda 1 de reparación (2026-10-01)

25 hallazgos de un revisor, cada uno CONFIRMADO por un verificador independiente. Los de nivel spec ya los había
reparado el `spec_partner` en `project-spec.md` (commit `cd1744a`); aquí se alinea el `.feature`. Cada uno se
re-midió antes de aplicarlo (§8). Formato: **R# · lente · severidad · nivel — objeto.** Veredicto. Qué cambió.

**R1 · satisfacibilidad · grave · feature — @s52, filas de control con el carácter al PRINCIPIO.** Veredicto:
CONFIRMADO. Antes de la ronda, «inicio sin FF», «inicio solo espacios», «inicio de un solo carácter» y el mutante
de Stryker «`+` quitado del inicio» pasaban TODAS las filas: un recorte del principio roto deja el `href` fuera y
da «(ninguna)», como si funcionara [V: modelo]. Matices del verificador, que se confirman: quitar un carácter de la
clase es de nivel 2 (Stryker 9.6.1 no lo genera); TAB en la clase del inicio NO es equivalente en el orden de
WHATWG (`⟨SP⟩⟨TAB⟩⟨SP⟩/favicon.svg`); y un TAB inicial suelto no falla abierto porque lo quita la eliminación
interior. Lo FALSO del hallazgo, y no se aplica: «TAB, LF y CR son equivalentes en cualquier orden» (solo si se
quitan antes de recortar), y «fijar en la spec la clase {FF, espacio}» (es de la spec, no mía, y no hace falta:
las dos formas dan lo mismo en 960 800 cadenas, §8). Cambió: «el doble registra que la puerta pidió la lista» en
TODAS las filas de @s52 (remedio a); tres filas con línea y el carácter al principio, `⟨U+000C⟩…`,
`⟨U+0020⟩⟨U+000C⟩…` y la de siete caracteres (remedio b); un control con TAB, LF y CR entre espacios al final; el
comentario de @s52 dice lo medido en lugar de «una fila por carácter y por sitio»; §2 corregida. Ahora cada
variante del recorte, en los dos extremos, rompe al menos una fila también SOLO por sus líneas, y los mutantes de
nivel 1 de la regex mueren todos en las tres formas [V: modelo y weapon-regex].

**R2 · satisfacibilidad · menor · feature — @s57 «exactamente lo de hoy» frente a @s59 fila 2.** Veredicto:
CONFIRMADO (matiz: el banner declaraba la guarda, no su consecuencia). Medido: la puerta de hoy da exit 0 con
0 líneas sobre la canónica sin `href` y sobre la de comillas simples. Cambió: título de @s57 («lo de hoy, salvo la
guarda nueva (@s59, fila 2)»), su fila 4 y su comentario; en el banner, «CAMBIO DE VEREDICTO DECLARADO» dentro de
«QUÉ CAMBIA»; @s59 fila 2. La spec ya lo decía (:1530-1536).

**R3 · satisfacibilidad · menor · feature — candidatos en ALGUNA página frente a TODAS.** Veredicto: CONFIRMADO,
con el mecanismo corregido: `.some` → `.every` sin más ya muere (en el modelo, en @s58 fila 3: `[].every` es
cierto con `dist/` ausente). Las que pasaban todo el contrato son «solo la 1.ª página del listado» y «`.every` con
el listado no vacío», que fallan ABIERTAS [V: modelo]. Cambió: @s66, nuevo, con las tres filas del remedio (lista
presente, ausente y que lanza) sobre un mismo artefacto, en vez de repartirlas entre @s57 y @s58.

**R4 · mensurabilidad · grave · feature — @s62, último `Then` medido sobre la foto.** Veredicto: CONFIRMADO (el
verificador rebaja la severidad: la mitad del favicon sí se medía en disco). Medido: con `elementos` copiado literal
de `src/pages/home-horneado.test.ts:215-238`, tras dañar el original en disco sigue viendo 1 `href` con la base;
releído, 0, y el texto ya no es el del `beforeAll`. Cambió: el último `Then` de @s62 (y el de @s67) exige el
`index.html` del original RELEÍDO del disco e idéntico al que leyó el `beforeAll`; nota «QUÉ TEXTO SE MIDE».

**R5 · mensurabilidad · grave · feature — @s62, ANCLA de la copia imposible con `elementos`.** Veredicto:
CONFIRMADO (matiz: reasignar `html` lo cumple a la letra, pero es un truco sobre estado compartido). Medido:
`elementos` tiene un solo parámetro y, sobre la copia (a), ve el original (1 con la base, 0 sin ella); el mismo
patrón sobre el texto de la copia ve 0 y 1. Cambió: EXCEPCIÓN DECLARADA (banner y notas): ayudante nuevo
`elementosDe(fuente, etiqueta)` con el mismo patrón y `atributosDe`, `elementos` delega en él; prohibidos un
segundo patrón y reasignar `html`; el ANCLA lee la copia del disco. Pregunta 2 de §5.

**R6 · mensurabilidad · menor · spec — la lista mide el `dist/` local, no lo que publica Pages (ocultos).**
Veredicto: CONFIRMADO; la spec eligió la regla 5 propia (S-8). Medido: `/NailsLashStudioWeb/.vite/manifest.json`
→ 404 en Pages hoy; el build real trae `.vite/manifest.json` (8719 B). Cambió: regla 5 en la cabecera, orden
4-1-2-5-3, lista de referencia con `dist/.vite/manifest.json (8719)`, `dist/assets/.oculto.css (300)` y
`dist/.oculto-vacio.svg (0)`; @s65 nuevo (5 filas: control, carpeta oculta, fichero oculto en carpeta visible,
oculto de 0 B, oculto que no está en la lista); @s49 (`.nojekyll` sería la 5); @s60 con cinco; banner. Las seis
variantes de la regla 5 del modelo mueren (§2).

**R7 · mensurabilidad · menor · feature — @s64 sin extractor, no discrimina y «progress/» sin fichero.**
Veredicto: CONFIRMADO (matiz: en la práctica, el extractor de la spec y un grep dan los mismos 10 `href`). Cambió:
el `When` fija el extractor (`ENLACE` + `ATRIBUTO_HREF`) y la definición de root-absoluto con la limpieza; se
declara CONTROL de regresión, no evidencia de H-5; @s63 y @s64 nombran
`progress/verificacion_viva_h5_enlaces_horneados.md`. Del HTML se anotan tamaño y SHA-256, no los bytes:
`prettier --check` sobre la home descargada avisa «Code style issues found» [V], y un `.html` en `progress/`
rompería `lint`. Medido además: a `src/lib/puerta-cascaron.ts` solo lo importan las puertas [V: grep].

**R8 · mutantes · grave · feature — @s52, el `+` y el FF del recorte izquierdo sobreviven.** Veredicto: CONFIRMADO;
la misma causa que R1 (matiz: quitar el FF de la clase es de nivel 2). Cambió: lo de R1; de sus tres remedios se
aplican el (1) y el (3); el (2), duplicar las filas sin la lista, sobra con ellos.

**R9 · mutantes · menor · spec — @s59 fila 1 vive de un hueco de @s13.** Veredicto: CONFIRMADO; la spec lo fija en
S-9. Cambió: salvedad (1) del «QUÉ NO CAMBIA» del banner, el «por qué» de @s59 fila 1 y su comentario («SU
ACOPLAMIENTO CON @s13»: si @s13 se endurece, vuelta a la puerta humana; nunca excluir sus mutantes).

**R10 · mutantes · menor · feature — el filtro `isFile()` del humilde, sin ningún `Then`.** Veredicto: CONFIRMADO.
Medido: `readdirSync` recursivo de un build real da 42 entradas, 39 ficheros y 3 carpetas; `statSync` de una
carpeta da 0 B en Windows; el modelo con el humilde SIN `isFile()` da la regla 3 sobre la copia, y CON él, la 2;
`/NailsLashStudioWeb/assets` → 301 → 404. El tamaño de una carpeta en Linux no se midió [I]. Cambió: @s67, nuevo,
fuera de @s62 para no tocar «tres sabotajes, uno por firma» (S-5). Pregunta 3 de §5.

**R11 · vacuidad · grave · feature — @s52, filas «(ninguna)» con el carácter al principio.** Veredicto:
CONFIRMADO; la misma causa que R1 (matiz del verificador: TAB/LF/CR solo son equivalentes si se quitan antes de
recortar). Cambió: lo de R1, con sus dos remedios.

**R12 · vacuidad · menor · feature — @s62, `elementos('link')` lee el original en caché.** Veredicto: CONFIRMADO;
la misma causa que R4 y R5. Cambió: lo de R4 y R5.

**R13 · vacuidad · menor · spec — un `href` que EMPIEZA por barra invertida queda fuera sin aviso.** Veredicto:
CONFIRMADO; la spec eligió candidato + regla 4 (S-7). Medido: `new URL` da `/favicon.svg` del mismo host para
`⟨U+005C⟩favicon.svg` y host `cdn.ejemplo` para `⟨U+005C⟩⟨U+005C⟩cdn.ejemplo/x.css`; el modelo sin la rama S-7 da
0 líneas. Cambió: tres filas en @s50 y una en @s57 (fila 6, el corte), con la notación `⟨U+005C⟩` (en JavaScript,
barra invertida + «f» es un FF); @s53 y el banner dicen que no es relativo.

**R14 · vacuidad · menor · spec — lo que la guarda no certifica y su acoplamiento.** Veredicto: CONFIRMADO; la spec
ya lo declara. Medido: en el build real la canónica absoluta es el primer `<link>` de 11. Cambió: comentario de
@s59 («QUÉ NO CERTIFICA», «SU ACOPLAMIENTO») y el final de los huecos del banner.

**R15 · fidelidad · grave · feature — la firma (b) se daba por medida por F-28.** Veredicto: CONFIRMADO en la
PROCEDENCIA: el H-6 de F-28 dejó el fichero en `public/` (`progress/tdd_favicon_marca.md:129` y :308-310). El
CONTENIDO es cierto: lo midió el verificador el 2026-10-01 (árbol de HEAD con el `href` con la base y sin
`public/favicon.svg`: `vite-react-ssg build` y las 5 puertas con 0, `href` tal cual, sin `favicon.svg` en el
artefacto; control con 0 y 2244 B) [V: sus registros y su `dist-b/`, leídos en esta ronda]. Cambió: banner (columna
«medida»: (b) → ronda 1, y el párrafo de la procedencia); @s48 fila (b); @s62 sin «(el H-6 de F-28)». PENDIENTE
fuera de mi alcance: `project-spec.md:1406` y S-5 (:1449), y el brief (:23), siguen diciendo «medido por F-28».

**R16 · fidelidad · menor · spec — la (c) no es «el mismo 404», y el rojo demostrado solo reproduce la (a).**
Veredicto: CONFIRMADO; la spec ya lo corrige (S-10 y «dos 404 y un icono vacío»). Cambió: banner («DOS 404 Y UN
ICONO VACÍO»), @s49 fila (c), título y fila (c) de @s62, y el comentario de @s63 («SOLO la (a)»). Ningún
comentario dice ya que el rojo demostrado reproduzca la (c).

**R17 · fidelidad · menor · feature — `REGLAS_DEL_CASCARON` no es «TODAS las reglas».** Veredicto: CONFIRMADO
(matiz: el comentario está en :857, la lista en :861). Medido: 22 entradas, `includes(REGLA_RUTA_AUSENTE)` →
`false`, y su texto no contiene «origen» ni «placeholder». Cambió: título, `Given` y comentario de @s60 (hueco
DECLARADO, no se cierra), cabecera de la sección y banner. Pregunta 1 de §5. PENDIENTE fuera de mi alcance:
`project-spec.md:1500-1501` sigue citando «TODAS las reglas».

**R18 · fidelidad · menor · spec — asimetría 1: `apple-touch-icon` con URL absoluta no lo ve nadie.** Veredicto:
CONFIRMADO; la spec ya lo dice (asimetría 1 y huecos). Cambió: comentario de @s47 (`KEYWORDS_DE_PETICION` y
`KEYWORDS_DE_CONTACTO`, token a token; con otro `rel` o sin él, ninguna puerta), dos filas de @s53 y los huecos del
banner (FS-6 sigue ABIERTA, `project-spec.md:4564`).

**R19 · fidelidad · menor · feature — @s54, «la base es de F-05, @s27».** Veredicto: CONFIRMADO: F-05 solo exige
«/» inicial y no «//» (`esRutaPropiaRootAbsoluta`, `src/lib/puerta-terceros.ts:213-215`) y @s27 de
`cero_terceros.feature` (:1824-1832) no tiene ninguna fila sin barra final [V: leídos]. Cambió: el «por qué» de la
última fila de @s54. PENDIENTE fuera de mi alcance: el caso límite 16 de la spec (:1632) mantiene «(es de F-05,
@s27…)».

**R20 · fidelidad · menor · spec — S-2 citado como [NV] en la spec y medido en el `.feature`.** Veredicto:
CONFIRMADO; la spec ya lo sube a [V]. Cambió: el comentario de @s50 cita WHATWG #path-state y la medida.

**R21 · fidelidad · menor · spec — historial de mutación («su última corrida»).** Veredicto: CONFIRMADO; la spec ya
lo corrige. El `.feature` no cita ese historial: sin cambio.

**R22 · colisión · grave · feature — @s61/@s62 frente a «ningún ayudante de @s1-@s45 cambia».** Veredicto:
CONFIRMADO; la misma causa que R4 y R5. Cambió: lo de R4 y R5 (excepción declarada en el banner: un ayudante nuevo,
`elementosDe`, en el que `elementos` delega, que es la opción (i) de R5 y la (b) de este; y el original releído
del disco).

**R23 · colisión · menor · spec — @s59 frente a @s13 y a «sin ninguno, EXACTAMENTE lo de hoy».** Veredicto:
CONFIRMADO (matiz: la cita :1047 es :1045). Cambió: lo de R2 y R9.

**R24 · colisión · menor · feature — los huecos atribuían a F-05 las URL absolutas de terceros.** Veredicto:
CONFIRMADO en lo esencial. Lo no demostrado, y no se aplica: que el reetiquetado de la «deuda de F-05»
(`feature_list.json:549`) haga parecer cerrada FS-6 (ese texto es la deuda de H-5, no FS-6), y que el iPhone pida
el icono solo [NV]. Cambió: lo de R18; el banner dice que FS-6 SIGUE ABIERTA.

**R25 · colisión · menor · feature — @s61, «ninguna línea con " — link root-absoluto"» no puede fallar.**
Veredicto: CONFIRMADO. Medido: `execSync(…).toString()` de un proceso que escribe en las dos salidas y sale con 0
devuelve solo la estándar, y el humilde escribe las líneas en la de error (`tools/puerta-cascaron.ts:60`). Cambió:
se retira esa mitad del `Then` y el comentario explica por qué sobra (toda salida con líneas lleva el código 1,
`src/lib/puerta-cascaron.ts:785-854`, y las filas puras lo fijan).

**Pendientes fuera del alcance del `gherkin_author`** (los repara el `spec_partner`; ninguno cambia una regla ni
un escenario): `project-spec.md:1406` y S-5 (:1449) atribuyen la firma (b) a F-28 (R15); :1500-1501 dice «TODAS
las reglas» (R17); el caso límite 16 (:1632) dice «es de F-05, @s27» (R19); y el brief §2 (:23), «medido por F-28».
**Ronda 2: CERRADOS.** El `spec_partner` los reparó en su ronda 2 (commit `4bfbd4f`: la tabla de las tres firmas
y S-5, «Las cinco reglas nuevas», el caso límite 16 y la errata del brief §2), y el `.feature` se alinea en §9
(R2-12 y R2-14).

## 8. Medidas de la ronda 1 (2026-10-01, Node v22.15.0, Windows; solo lectura del repo)

Temporales en `scratchpad/h5/gherkin-r1/` de la sesión (no se versionan). `git status` del worktree: limpio
antes de escribir el `.feature` y este mapa.

- **El modelo** (`modelo.mts`): la «Definición de root-absoluto», la «Resolución ESTRICTA», «El puerto nuevo» y
  la «Guarda» de la spec, montados sobre una copia LITERAL de `src/lib/puerta-cascaron.ts` (sus
  `inspeccionarSitio`, `rutaDelFichero`, `extraerEnlaces`, `ENLACE` y `ATRIBUTO_HREF` reales) y sobre una copia
  literal de `jsonLdValido`/`htmlCrudo` de `src/lib/puerta-cascaron.test.ts:39-111`. La limpieza, en los dos
  órdenes: A (recortar los cinco y luego quitar TAB/LF/CR, el de WHATWG) y B (quitar y luego recortar FF y
  espacio).
- **El contrato contra el modelo** (`filas.mts`, `medir.mts`): 102 filas de @s46-@s60, @s65 y @s66, con el
  resultado esperado escrito a mano. Fiel A y fiel B: 102/102 en verde. `verificar-feature.mts` lee las tablas del
  `.feature` nuevo (@s47-@s54 y @s65) y las corre en los dos órdenes: 138 corridas, 0 en rojo.
- **Variantes de conducta** (`medir.mts`; `medir3.mts`, las mismas sin el `Then` de la lista): 32 por orden. En
  el orden A mueren todas, también solo por sus líneas; en el B, las seis de «sin TAB, LF o CR en la clase» son
  IDÉNTICAS a la fiel (allí la clase ya es FF y espacio) y el resto muere. «Candidatos solo de la 1.ª página» y
  «`.every` con el listado no vacío» mueren SOLO en @s66; «`.every`» a secas, también en @s58 fila 3. Las seis
  de la regla 5 mueren en @s65 (y «antes de buscar en la lista», también en @s48 `./` y `../`).
- **Stryker** (`stryker.mts`): `weapon-regex` 1.3.6 con `mutationLevels: [1]` (el de Stryker 9.6.1,
  `regex-mutator.js:22`) sobre las regex de la limpieza en tres formas: 7, 7 y 7 mutantes; TODOS mueren, también
  solo por líneas. El `+` del inicio, que antes sobrevivía, muere en tres filas de @s52.
- **Equivalencia de los órdenes** (`orden.mts`): las 960 800 cadenas de 0 a 7 caracteres sobre {TAB, LF, FF, CR,
  espacio, `/`, `a`} dan el mismo resultado con A y con B.
- **El navegador** (`url.mts`): `new URL(href, 'https://cenit-digital.github.io/NailsLashStudioWeb/')` para cada
  `href` nuevo (tabla de §4.1).
- **El extremo a extremo** (`e2e.mts`, sobre el build real de la verificación, `scratchpad/h5/verif/dist-build`, y
  sus copias): `elementos` copiado literal (`ayudantes.mts`, de `src/pages/home-horneado.test.ts:215-238`) no ve
  las copias ni el original dañado tras la foto, y `elementosDe` sí; el modelo con el humilde CON `isFile()` da
  exit 0 sobre el artefacto real, la línea exacta de cada firma en (a), (b) y (c), y la regla 2 en la carpeta;
  SIN `isFile()`, la regla 3; `readdirSync` da 42 entradas (39 ficheros, 3 carpetas: `.vite`, `assets`,
  `static-loader-data`) y `statSync` de `assets` da 0 B; `execSync(…).toString()` con código 0 devuelve solo la
  salida estándar. En `index.html`: 11 `<link>`, la canónica primero, y ninguno con `%`, `&` o barra invertida.
- **La puerta de hoy** (`hoy.mts`): sobre la canónica sin `href` y sobre la de comillas simples,
  `{"codigoSalida":0,"lineas":[]}`; `REGLAS_DEL_CASCARON`, 22 entradas, sin `REGLA_RUTA_AUSENTE`.
- **La web** (`curl -I`, 2026-10-01 11:54 UTC): `/NailsLashStudioWeb/.vite/manifest.json` → 404,
  `/NailsLashStudioWeb/favicon.svg` → 200, `/favicon.svg` → 404, `/NailsLashStudioWeb/assets/` → 404 y
  `/NailsLashStudioWeb/assets` → 301 a `…/assets/`.
- **Prettier** sobre la home publicada que guardó la verificación: «Code style issues found».
- **El `.feature`** se generó con `construir.mjs` desde `git show HEAD:features/cascaron_semantico.feature`:
  comprueba que las líneas 1-224 y 303-1989 (las de @s1-@s45) quedan byte a byte iguales, que las 5 barras
  invertidas literales siguen (las nuevas van como `⟨U+005C⟩`) y que re-pintar una tabla que no cambia da sus
  mismos bytes.

## 9. Revisión adversarial — ronda 2 de reparación (2026-10-01)

18 hallazgos de un revisor, cada uno CONFIRMADO por un verificador independiente. Los de nivel spec ya los había
reparado el `spec_partner` en `project-spec.md` (commit `4bfbd4f`, con su lista «Para el `gherkin_author`, ronda
2», puntos 1-5, que se cumplen todos aquí); aquí se alinea el `.feature` y se re-mide cada uno antes de aplicarlo
(§10). Formato: **R2-# · lente · severidad · nivel — objeto.** Veredicto. Qué cambió.

**R2-1 · satisfacibilidad · menor · spec — @s57 fila 4: «las llamadas de hoy llevan la canónica con `href`».**
Veredicto: CONFIRMADO. Medido: el fixture de F-06 (`src/lib/puerta-anclas.test.ts:74-103`) da 0 `<link>` y, con la
puerta de hoy y con el modelo, código 1 y 6 líneas; de las 13 ejecuciones de `puerta-cascaron.test.ts`, 3 no tienen
página. Cambió: el «por qué» de las filas 4 y 5 de @s57 (la 4 cita solo las 4 llamadas que esperan 0; la 5, la de
F-06), un párrafo nuevo en el comentario de @s57 («LAS LLAMADAS DE HOY»), el banner («LAS LLAMADAS DE HOY A LA
PUERTA», con el acoplamiento) y §4.2. Ningún `Then` ni fixture cambia.

**R2-2 · mensurabilidad · menor · feature — el humilde ANSIOSO pasaba todo el contrato.** Veredicto: CONFIRMADO.
Medido sobre copias de un build real: el humilde que lista antes de llamar a la puerta pasa @s61, @s62 y @s67 y,
con `dist/` ausente, sale con 1 por un `ENOENT` (`node:fs:1489 … binding.readdir(`) y sin la línea de @s26; el
de la spec, no. Cambió: @s70 nuevo (nace en VERDE: el humilde de hoy ya es perezoso), el «por qué» de @s58 fila 3
y su comentario, las notas del extremo a extremo, el banner (NO-MUTABLE) y §2.

**R2-3 · mensurabilidad · menor · feature — el humilde que filtrara los ocultos pasaba todo.** Veredicto:
CONFIRMADO. Medido: con ese humilde, @s61, @s62 y @s67 pasan; sobre una copia con el `href` del favicon a
`/NailsLashStudioWeb/.vite/manifest.json` (8719 B, 1 `<link>`), da la regla 2 y el de la spec la 5; la puerta de
hoy, 0 y `✓`. Cambió: @s71 nuevo (nace en ROJO), el comentario de @s61 (ya no dice «TODOS los ficheros»), el de
@s65, §3 (lo que decía «@s61 sí prueba que la lista trae todos los ficheros» era falso) y §2.

**R2-4 · mutantes · grave · feature — el cableado de la lista opcional deja equivalentes.** Veredicto:
CONFIRMADO, también con S-12 dentro: forma «`ficheros !== undefined ? … : []`» 40 mutantes y 3 supervivientes;
forma «`?.`/`??`» 35 y 3; forma E 159 mutantes del código nuevo y 0 supervivientes; `tsc --strict` da TS18048 en
la forma ingenua y compila las tres. Matiz del verificador, que se recoge: el proceso ya manda refactorizar el
equivalente, así que no se cuela ningún bug; el coste es una vuelta de mutación. Las dos atribuciones de §2 eran
falsas y se corrigen: `ficheros === undefined` → `true` NO lo matan @s57 filas 4-5 (sin candidatos ni se evalúa),
sino las 97 filas con candidatos y la lista presente; y → `false`, en la forma E, revienta y sale la línea de
@s29. Cambió: «EL CABLEADO DE LA LISTA, SIN CÓDIGO MUERTO» en la cabecera de la sección (la forma E, con el corte
de S-12 dentro, y lo prohibido), §2 (esquema, filas de @s57, párrafo de equivalentes, fuera el `<= 0` que Stryker
no genera).

**R2-5 · mutantes · menor · feature — tres idiomas dejan un equivalente cada uno.** Veredicto: CONFIRMADO. Medido:
«quitar el `+`» de lo que se quita dentro, «quitar el `slice`» del predicado de oculto con `slice(1)` y «quitar
el `^`» de una regex anclada para la barra sin base SOBREVIVEN; con la clase sin `+`, el predicado sin `slice` y
`slice(1)`, no hay ninguno. Cambió: «TRES FORMAS DE ESCRIBIR LA SPEC QUE DEJAN UN MUTANTE EQUIVALENTE» en la
cabecera, el comentario de @s52 y §2.

**R2-6 · mutantes · menor · feature — nada fijaba que la raíz se BUSQUE en la lista.** Veredicto: CONFIRMADO.
Medido: «la raíz pasa sin mirar» (`if (resto === '') return null`) pasa las 122 filas restantes y sus 5 mutantes
mueren todos (un 100 % incumpliendo los pasos 4-5 de la spec); con las filas nuevas, 3 en rojo. Cambió: @s51 gana
una columna `lista` y tres filas (sin `dist/index.html`, con base y sin ella → regla 2; con él de 0 B → regla
3), su título y su comentario; la cabecera nombra las listas variantes.

**R2-7 · mutantes · menor · feature — `⟨U+005C⟩/host/x` sin fila.** Veredicto: CONFIRMADO. Medido: el candidato
«compacto» pasa todas las demás filas y deja fuera `⟨U+005C⟩/cdn.ejemplo/x.css`, que `new URL` lleva al host
`cdn.ejemplo`. Cambió: una fila en @s50 (regla 4) y su gemela sin la lista en @s57 (fila 7, el corte), con la
notación `⟨U+005C⟩` (la cabecera explica que en JavaScript barra invertida y `/` es solo `/`), y el comentario de
@s50 («las CUATRO filas del final»).

**R2-8 · vacuidad · menor · feature — `/` bajo la base, sin fila; @s51 fila 2 sin «pidió la lista».** Veredicto:
CONFIRMADO. Medido: un predicado de candidato que exija algo tras la barra inicial pasaba el contrato; ahora rompe
@s47 (fila `/`), @s51 fila 2 (no pide la lista) y @s51 fila 8. Cambió: la fila `/` de @s47 (regla 1) y el `Then`
«el doble registra que la puerta pidió la lista» en todo @s51, cuyo `Given` dice ya que el doble registra.

**R2-9 · vacuidad · menor · feature — @s55, la fila `<body>` no anclaba su sitio.** Veredicto: CONFIRMADO.
Medido: una puerta que lee los candidatos de `cabezaDe` solo rompe esa fila, y solo si el ayudante pone de verdad
el `<link>` en el `<body>`; la metadata nativa de React 19 lo deja ahí (react19-nativa: `</head>` en 148, `<link>`
en 314). Cambió: el `Then` «(ANCLA DE SITIO)» con la columna `posicion` (ANTES / DESPUÉS del único `</head>`,
medido a mano, nunca con `cabezaDe`) y el comentario de @s55.

**R2-10 · vacuidad · menor · feature — @s61 no anclaba las subcarpetas; nadie las HTML.** Veredicto: CONFIRMADO.
Medido: sobre una copia sin los 7 `<link>` a `assets/`, el ancla antigua se cumple y un humilde NO recursivo pasa
@s61, @s62 y @s67; un humilde sin `.html` pasa todo y solo cae en una copia con un `<link>` a la raíz. Cambió: el
ANCLA de @s61 exige además «al menos 1 cuyo `href` empieza por `/NailsLashStudioWeb/assets/`», su comentario, y
@s72 nuevo (la raíz → 0, nace en VERDE).

_*R2-11 · vacuidad · menor · feature — la premisa de F-06 y los head-* de @s33._* Veredicto: CONFIRMADO; es R2-1
visto desde la guarda. Medido además: head-espacio, head-mayusculas y head-atributo tienen 0 `<link>` en su
`dist/index.html`; head-correcto, 1 (la canónica). Cambió: lo de R2-1; el banner nombra también los head-*.

**R2-12 · fidelidad · grave · spec — la firma (b) se atribuía a F-28.** Veredicto: CONFIRMADO; la spec ya lo
corrige (tabla de las tres firmas y S-5) y el brief §2 lleva su errata. Cambió: el párrafo de la (b) del banner,
que ya no dice «aunque el brief §2 y la spec lo digan» sino que cita la spec y la errata. El pendiente de R15
(§7) queda cerrado.

**R2-13 · fidelidad · grave · spec — los segmentos `.` y `..` daban la regla 2, un mensaje falso.** Veredicto:
CONFIRMADO; la spec eligió S-11 (regla 4 con su texto ampliado, mirada sobre la RUTA). Medido: Pages sirve `./`,
`assets/../` y `//` con 200 y 2244 B, y `...` con 404 (`curl --path-as-is`, 13:38 UTC); `new URL` normaliza `.` y
`..`, conserva `//` y no toca la query ni el fragmento. Cambió: el texto de la regla 4 en la cabecera, en las 11
líneas de @s50 y en @s60; @s48 (título; `./` y `../` a la 4; filas nuevas `//`, `/./favicon.svg`, `...` y tres
controles: `?v=/../x` y `#/./x`, de la spec, y `#//x`, mío, por la misma regla); el «por qué» de @s65 fila 5 y su
comentario; el banner («QUÉ CAMBIA»). La ronda 1 no lo había declarado falso positivo consciente: ahora lo es,
con un mensaje que dice solo lo que la puerta sabe.

**R2-14 · fidelidad · menor · spec — caso límite 16, «TODAS las reglas» y la cita de @s13.** Veredicto: CONFIRMADO;
la spec ya lo corrige. Cambió: la última fila de @s54 pasa a la línea de la base (S-12) sin perder su «nadie
valida la barra final», con título y comentario nuevos; el comentario de @s60 cita la spec; §4.2 cita la fila de
@s13. OJO, MEDIDO: esa fila está ahora en `features/cascaron_semantico.feature:1109`, no en :1079, porque el
banner de esta ronda crece 30 líneas; la cita :1079 de la spec (S-9, `project-spec.md:1463`) queda desfasada:
PENDIENTE para el `spec_partner`, fuera de mi alcance (no cambia ninguna regla ni escenario).

**R2-15 · fidelidad · menor · feature — @s57 fila 4: F-06 no es «el caso» de esa fila.** Veredicto: CONFIRMADO;
mismo origen que R2-1 (la frase sin [V] de §4.2 de la ronda 1). Cambió: lo de R2-1; F-06 pasa a la fila 5.

**R2-16 · colisión · menor · spec — con una base que F-05 rechaza, esta puerta fallaba antes y con otro motivo.**
Veredicto: CONFIRMADO; la spec eligió S-12 (cortar con una línea propia que enseña la base, después del corte por
lista ausente y sin pedir la lista). Matiz del verificador, que se recoge: con la cadena vacía la puerta de HOY ya
fallaba antes que F-05 por la anti-404 de `<a>`; por eso la cadena vacía tiene su fila (@s68 fila 2), que además
mata tomarla por «sin base». Cambió: @s68 nuevo (una fila por condición del predicado, la dinámica, la de una
línea, una absoluta, `/` como control y «sin candidatos → lo de hoy»), @s69 nuevo (el orden de los dos cortes), la
última fila de @s54, «LAS TRES LÍNEAS NUEVAS QUE NO SON REGLAS» en la cabecera, el banner («CAMBIO DE DIAGNÓSTICO
DECLARADO» y el hueco de `baseDeclarada`) y §2.

**R2-17 · colisión · menor · spec — una tercera asimetría entre `<a>` y `<link>`, sin declarar.** Veredicto:
CONFIRMADO; la spec la declara («Las tres asimetrías», punto 3, y un hueco). Cambió: el banner declara las TRES
asimetrías en «QUÉ NO CAMBIA» y la de `<a>` en los HUECOS; @s23 y @s24 no se tocan (§8 de Pablo y «@s1-@s45 NO SE
TOCAN»); no hay escenario: es heredado.

**R2-18 · colisión · menor · feature — @s57 fila 4 y el banner frente a F-06 y las llamadas que salen con 0.**
Veredicto: CONFIRMADO en lo principal; su hipótesis de acoplamiento («si alguien completa el `<head>` de F-06 sin
canónica, la guarda nueva hablaría») es FALSA y NO se aplica tal cual: sin canónica sale «canónica ausente»
(:491), y la guarda solo puede hablar con una canónica SIN `href` (@s59 fila 1). Cambió: lo de R2-1, con la fila
4 citando solo :936, :983, :1007 y :1730; el acoplamiento del banner se escribe con la condición medida (quitarle
las violaciones obliga a darle una canónica; con `href`, la guarda pasa; sin él, habla), que es lo que la spec
pide («quien lo haga le da a la página una canónica con `href`»).

**Lo que la ronda NO aplica, y por qué.** Ninguno de los 18 resultó falso al medirlo. Dos remedios se aplican de
forma distinta a la propuesta: R2-18 (la hipótesis, arriba) y R2-10 (de «atestiguar las HTML o declararlas ciegas»
se elige atestiguarlas con @s72, que no necesita build). Y R2-14 deja un pendiente nuevo para el `spec_partner`
(la cita :1079 de S-9 → :1109). En la puerta humana: las preguntas 3 y 4 de §5.

## 10. Medidas de la ronda 2 (2026-10-01, Node v22.15.0, TypeScript 5.9.3, Windows; solo lectura del repo)

Temporales en `scratchpad/h5/gherkin-r2/` de la sesión (no se versionan). `git status` del worktree: limpio
antes de escribir el `.feature` y este mapa.

- **El modelo** (`generar.mjs` → `forma-*.ts`): la Enmienda 5 de la spec CON S-11 y S-12 (limpieza; candidato;
  regla 4 en dos pasos; base utilizable; corte por lista ausente y por base; reglas 1, 2, 5 y 3; guarda nueva;
  las 5 reglas en `REGLAS_DEL_CASCARON`), montada sobre `base.ts`, copia LITERAL de `src/lib/puerta-cascaron.ts`
  (`cmp` idéntico), en la forma de cableado E. Variantes: las formas «ref» (`ficheros !== undefined ? … : []` y
  `if (hayCandidatos)`) y «a» (`?.`/`??`), con S-12; los tres idiomas de R2-5; y siete desviaciones de conducta
  («atajo», «compacta», «sin-barra-sola», «solo-cabeza», «seg-startswith», «seg-href-entero»). `tsc --strict
--noUnusedLocals`: las formas E, ref y a compilan (exit 0); `estrechar.ts`, la forma ingenua, da TS18048.
- **Las filas** (`filas.ts`): las 125 filas puras se LEEN del `.feature` nuevo, decodificando `⟨U+XXXX⟩` (las
  tablas de @s47-@s55, @s57, @s65 y @s68, tal cual; @s46, @s56, @s58-@s60, @s66 y @s69, escritas a mano desde
  él), sobre `fixtures.ts`, copia literal de `src/lib/puerta-cascaron.test.ts:40-111`. Por escenario: @s46 1,
  @s47 9, @s48 14, @s49 3, @s50 11, @s51 9, @s52 16, @s53 7, @s54 6, @s55 12, @s56 1, @s57 7, @s58 3, @s59 8,
  @s60 1, @s65 5, @s66 3, @s68 8, @s69 1.
- **Fidelidad** (`fieles.mjs`, `fieles2.mjs`): forma E, 0 en rojo de 125; ref, a y los tres idiomas, 0 (los
  equivalentes no cambian la conducta). Desviaciones: «atajo» rompe @s51 filas 7-9 (sin ellas, 0 de 122);
  «compacta», @s50 fila 11 y @s57 fila 7; «sin-barra-sola», @s47 fila 9 y @s51 filas 2 (no pide la lista) y 8;
  «solo-cabeza», @s55 fila 12; «seg-startswith», @s48 fila 11 y @s65 filas 2-5; «seg-href-entero», @s48 filas
  12-14. La puerta de HOY (con el extractor del modelo solo para las ANCLAS): 96 en rojo; en verde, 29, que son
  los controles (@s47 f1, @s48 f1-f3 y f12-f14, @s49 f1, @s50 f1, @s54 f1, @s65 f1, las 7 de @s53, @s57 f4-f5,
  @s68 f8, @s58 f2-f3 y @s59 f3-f8).
- **Stryker** (`mutar.mjs`: el `Instrumenter` de `@stryker-mutator/instrumenter` 9.6.1, cada mutante empalmado y
  corrido contra las 125 filas). Forma E, el código nuevo entero (lo común y el cableado hasta la guarda nueva):
  160 mutantes, 159 mueren; el superviviente es `.some` → `.every` de la guarda de @s28, código de HOY que mata
  hoy `src/lib/puerta-cascaron.test.ts:1727-1744`, fuera de estas filas. Forma ref (cableado): 40 mutantes, 3
  sobreviven (`ficheros !== undefined` → `true`, el `[]` → `["Stryker was here"]` e `if (hayCandidatos)` →
  `true`). Forma a: 35, 3 sobreviven (`?.` → `.` y los dos `[]`). Idiomas: `[…]+` dentro, 2 mutantes, sobrevive
  «quitar el `+`»; `split('/').slice(1)`, 8, sobrevive «quitar el `slice`»; `replace(/^…/, '')`, 2, sobrevive
  «quitar el `^`». «Atajo», sin las 3 filas nuevas de @s51: 5 mutantes, 0 sobreviven. Atribuciones: `ficheros ===
undefined` → `true` muere en 97 filas (las de candidatos y lista presente, desde @s46); → `false`, en 7 (las 5
  de corte de @s57, @s66 fila 2 y @s69); `segmento === '..'` → `false`, solo en @s48 `assets/../`;
  `endsWith('/')` → `startsWith`, en @s54 fila 6 y @s68 fila 4. Fuentes de Stryker leídas:
  `equality-operator-mutator.js:10` (`'===': ['!==']`), `regex-mutator.js:22` (`mutationLevels: [1]`),
  `method-expression-mutator.js:6` y :10, `array-declaration-mutator.js:10`.
- **El extremo a extremo** (`humildes.mjs`, `e2e.mjs`): copias del build real de la verificación de la ronda 1
  (`scratchpad/h5/verif/dist-build`: 11 `<link>`, 10 con la base, 7 con `assets/`, 1 al favicon de 2244 B;
  `.vite/manifest.json` de 8719 B), con la puerta corrida como subproceso desde la raíz del worktree y
  `NLS_DIST_DIR`, igual que `correrPuerta` (`src/pages/home-horneado.test.ts:498-511`, que con código ≠ 0 devuelve
  las dos salidas). Humildes: «hoy» (el real, solo con los imports a rutas absolutas), y sobre el modelo, el de la
  spec («perezoso»), «ansioso», «filtra-ocultos», «sin-html» y «plano» (no recursivo). Resultado (V = el escenario
  pasa):

  | Humilde        | @s61 | @s62 a/b/c | @s67  | @s70 | @s71  | @s72 |
  | -------------- | ---- | ---------- | ----- | ---- | ----- | ---- |
  | hoy            | V    | R (0)      | R (0) | V    | R (0) | V    |
  | perezoso       | V    | V          | V     | V    | V     | V    |
  | ansioso        | V    | V          | V     | R    | V     | V    |
  | filtra-ocultos | V    | V          | V     | V    | R     | V    |
  | sin-html       | V    | V          | V     | V    | V     | R    |
  | plano          | R    | R          | R     | V    | R     | R    |

  Sobre una copia SIN los 7 `<link>` a `assets/` (`build-sinsub2`), «plano» pasa @s61, @s62 y @s67, y el ancla
  nueva de @s61 da 0 `<link>` con `assets/`. Las anclas de las copias se miden del disco: @s71, 1 `<link>` al
  manifiesto y 0 al favicon; @s72, 1 a la raíz y 0 al favicon; @s70, el directorio no existe antes ni después.

- **F-06** (`f06.mts`, sobre `f06-fixture.ts`, copia literal de `src/lib/puerta-anclas.test.ts:60-103`): 0
  `<link>`; la puerta de hoy y el modelo, `codigoSalida` 1 y las 6 líneas (title, description, canónica, h1,
  JSON-LD y `/aviso-legal`).
- **`.experimentos-tmp`** (builds de las 10:59): head-espacio, head-mayusculas y head-atributo, 0 `<link>`;
  head-correcto, 1; react19-nativa, `</head>` en el offset 148 y su único `<link>` (la canónica) en el 314.
- **El navegador** (`url.mjs`, `new URL(href, 'https://cenit-digital.github.io/NailsLashStudioWeb/')`): tabla de
  §4.1, filas «Ronda 2».
- **La web** (`curl -s --path-as-is`, 2026-10-01 13:38 UTC): `/NailsLashStudioWeb/favicon.svg`, `./favicon.svg`,
  `assets/../favicon.svg` y `//favicon.svg` → 200 y 2244 B; `.../favicon.svg` y `no-existe.svg` → 404.
- **El `.feature`** se generó con `construir.mjs` desde el de `4bfbd4f`: comprueba que las líneas 1-224 y las 1687
  de «Contrato de la feature 4» hasta el final de @s45 quedan byte a byte iguales, pinta las tablas con el pintor
  de la ronda 1 y cuenta las barras invertidas literales: 5 → 6 (la nueva, en la asimetría 3 del banner). Las
  filas nuevas la escriben `⟨U+005C⟩`.
