# Gherkin — F-04 ENMIENDA 5 (H-5): todo `<link>` root-absoluto del artefacto resuelve, bajo la base, a un fichero no vacío y que se publica

> Lo escribe el `gherkin_author` el 2026-10-01, y lo repara el mismo día en la **ronda 1 de reparación** tras la
> revisión adversarial (§7). Contrato: `features/cascaron_semantico.feature`, banner ENMIENDA 5 (líneas 225-336,
> apilado tras el de la ENMIENDA 4 y antes de «Contrato de la feature 4», corrección 6 de la verificación) y **22
> escenarios, @s46-@s67** (líneas 2024-2669, al final, con «@s1-@s45 (arriba) NO SE TOCAN»). @s65-@s67 los añadió
> la ronda 1; cada uno va en su grupo, así que el orden del fichero no es el de los números (no se renumera nada
> de lo que ya se cita). @s1-@s45: 0 líneas tocadas [V: el script de la ronda compara byte a byte las líneas 1-224
> y 303-1989 del original]. Estado: **PENDIENTE de la puerta humana**. Fuentes, en orden de mando:
> `progress/brief_h5_enlaces_horneados.md` §8 (decisiones de Pablo) → `progress/verificacion_decisiones_h5.md`
> (prevalece sobre §2-§6 del brief) → resto del brief; spec: `project-spec.md` §Feature 4 → «Enmienda 5
> (2026-10-01)», ya reparada en su ronda 1 (S-7 a S-10, regla 5). Etiquetas: **[V]** verificado en esta sesión ·
> **[I]** inferencia · **[NV]** no verificado.
>
> **`feature_list.json` NO se ha tocado**: precedente de las ENMIENDAS 1-4 (F-04 sigue `done`; banner). El
> reetiquetado de la «deuda de F-05» de su línea 549 lo hace el lead al cerrar (H5-1).

## 1. Reparto: de la spec al contrato

Tres grupos que no se mezclan (lo pidió el lead): puerta pura, extremo a extremo y lo que hace el lead a mano.

| Grupo                                                                  | Escenario | Filas | Qué fija                                                                                                                        |
| ---------------------------------------------------------------------- | --------- | ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| Puerta pura (`src/lib/puerta-cascaron.test.ts`, cuenta para Stryker)   | @s46      | 1     | CONTROL: un `<link>` de cada clase del artefacto real, todos resuelven; la lista se pidió                                       |
|                                                                        | @s47      | 8     | regla 1 (sin el prefijo), su orden frente a la 2 y la 3, y la asimetría 1                                                       |
|                                                                        | @s48      | 8     | regla 2 (sin fichero): caja, carpeta, `.`/`..`; controles `?query`, `#fragmento`, subcarpeta                                    |
|                                                                        | @s49      | 3     | regla 3 (0 bytes) y su control de 1 byte                                                                                        |
|                                                                        | @s50      | 10    | regla 4: una fila por `%`, `&` y barra invertida (dentro y AL PRINCIPIO, S-7), y su orden frente a la 1 y la 2                  |
|                                                                        | @s51      | 6     | solo la raíz va a `index.html`; `x/` y `x` fallan cerrado; asimetría 2                                                          |
|                                                                        | @s52      | 16    | la limpieza, con «la lista se pidió» en cada fila: cada carácter en cada extremo y dentro, y el valor CRUDO en la línea         |
|                                                                        | @s53      | 7     | lo que no es root-absoluto queda fuera y ni pide la lista                                                                       |
|                                                                        | @s54      | 6     | sin base (ausente o `null`) y con una base sin barra final                                                                      |
|                                                                        | @s55      | 12    | todo `rel`, la caja de la etiqueta y el `<link>` del `<body>`                                                                   |
|                                                                        | @s56      | 1     | formato y orden del informe con dos páginas                                                                                     |
|                                                                        | @s57      | 6     | la lista AUSENTE: corte con una sola línea (filas 1-3 y 6, esta con barra invertida inicial), o lo de hoy salvo la guarda (4-5) |
|                                                                        | @s58      | 3     | la lista se pide solo con candidatos; si revienta, rama de @s29; con `dist/` ausente, la de @s26                                |
|                                                                        | @s59      | 8     | la guarda del extractor nuevo, su orden tras @s28, sus controles y su acoplamiento con @s13 (S-9)                               |
|                                                                        | @s60      | 1     | las 5 reglas en `REGLAS_DEL_CASCARON`, sin «origen» ni «placeholder»; la lista NO es «TODAS» (hueco)                            |
|                                                                        | @s65      | 5     | regla 5 (S-8): oculto en la lista → regla 5; antes que la 3; solo si está en la lista; cada segmento                            |
|                                                                        | @s66      | 3     | un candidato en la SEGUNDA página basta: lista presente, ausente y que lanza                                                    |
| Extremo a extremo (`src/pages/home-horneado.test.ts`, fuera)           | @s61      | 1     | ANCLA del artefacto real + CONTROL (exit 0, `✓`)                                                                                |
|                                                                        | @s62      | 3     | las tres firmas (a), (b) y (c), cada una en su copia, con su línea exacta y el original RELEÍDO intacto                         |
|                                                                        | @s67      | 1     | el humilde lista solo FICHEROS: un `<link>` a la carpeta real `assets` → regla 2                                                |
| A mano, el lead (`progress/verificacion_viva_h5_enlaces_horneados.md`) | @s63      | 1     | `@demostracion-del-lead`: borrar `public/favicon.svg` → `pnpm build` ≠ 0 con la (a); restaurar → 0 y limpio                     |
|                                                                        | @s64      | 1     | `@verificacion-viva`: tras publicar, cada `href` → 200, contraprueba `/favicon.svg` → 404. CONTROL, no evidencia de H-5         |

Ningún escenario toca `inspeccionarSitio` (S-4): las reglas nuevas se observan por `ejecutarPuertaDelCascaron`,
que es lo que recibe la lista. Los textos de las reglas y de las dos líneas nuevas son los de la spec, copiados
letra a letra en la cabecera de la sección (y escritos a mano en cada fila).

## 2. Cada `Then` → qué mutante de la implementación futura mata

La implementación aún no existe. Los mutantes se describen sobre la que pide la spec («Resolución ESTRICTA»,
«El puerto nuevo», «Guarda»), con los operadores de Stryker (`Regex`, `ConditionalExpression`,
`EqualityOperator`, `MethodExpression`, `StringLiteral`, `ArrayDeclaration`, `BlockStatement`,
`OptionalChaining`) y, donde no hay operador, con la desviación de implementación que la fila impide. Solo
cuentan @s46-@s60, @s65 y @s66: @s61, @s62 y @s67 son build-based y Stryker no los ve (`vitest.stryker.config.ts`,
corrección 16). Esquema de referencia (orientativo, no es código): `limpiar(href)` → regla 4 si hay `%`, `&` o
barra invertida → `ruta` sin `?`/`#` → con base, regla 1 si no empieza por ella; `resto` → `dist/index.html` si
vacío, si no `dist/<resto>` → regla 2 si no está en la lista, regla 5 si algún segmento empieza por `.`, regla 3
si pesa 0. Las filas marcadas **[V: modelo]** están medidas sobre el modelo de la ronda 1 (§8).

| Escenario / fila                                                            | `Then` que muerde                               | Mutante que mata                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @s46                                                                        | ANCLA: 6 valores en orden                       | extractor que se queda con la primera coincidencia o que filtra todo (`filter` → `() => false`)                                                                                                                                          |
| @s46                                                                        | la lista se pidió ≥ 1 vez                       | `if (hayCandidatos)` → `false`: la puerta no consulta la lista y da 0 líneas en vacío                                                                                                                                                    |
| @s46                                                                        | exit 0 y 0 líneas                               | todo mutante que acuse sin motivo: prefijo → `true`, «no está» → `true`, `bytes === 0` → `true`, clase de la regla 4 negada, raíz → `true ?`, «oculto» → `true`                                                                          |
| @s47 `/favicon.svg`                                                         | línea de la regla 1                             | `!ruta.startsWith(base)` → `false` o `endsWith`; `base === null` → `true` (iría por la rama sin base, encontraría `dist/favicon.svg` y pasaría); texto de la regla → `""`                                                                |
| @s47 `/no-existe.svg`, `/vacio.svg`                                         | SOLO la línea de la 1                           | `return` temprano de la regla 1 → `{}` (`BlockStatement`): seguiría y añadiría la 2 o la 3                                                                                                                                               |
| @s47 `/NailsLashStudioWeb`, `/nailslash…`                                   | regla 1                                         | prefijo comparado sin la barra final o sin caja (desviación de implementación)                                                                                                                                                           |
| @s47 `⟨U+0020⟩/favicon.svg`                                                 | regla 1 con el valor CRUDO                      | quitar la limpieza (sin recortar no es root-absoluto: 0 líneas); poner en la línea el valor limpio (S-6)                                                                                                                                 |
| @s47 `/otra-cosa/x.css`                                                     | regla 1                                         | reutilizar `esEnlaceRoto` de `<a>`, que devuelve `false` sin el prefijo (@s37)                                                                                                                                                           |
| @s48 controles `?v=2`, `#x`                                                 | 0 líneas                                        | `Regex` sobre `[?#]`: quitar `?` o `#` de la clase                                                                                                                                                                                       |
| @s48 control `assets/app.css`                                               | 0 líneas                                        | `slice(base.length)` eliminado (`MethodExpression`): buscaría `dist//NailsLashStudioWeb/…`                                                                                                                                               |
| @s48 `no-existe.svg`                                                        | línea de la regla 2                             | «no está» → `false` o `!==`; texto de la regla → `""`                                                                                                                                                                                    |
| @s48 `FAVICON.SVG`, `assets`, `./`, `../`                                   | regla 2                                         | búsqueda sin caja, `existsSync`, resolver carpetas o normalizar segmentos (desviaciones); en `./` y `../`, mirar lo oculto ANTES de buscar en la lista (daría la 5) [V: modelo]                                                          |
| @s49 `vacio.svg`, `vacio.svg?v=2`                                           | línea de la regla 3                             | `bytes === 0` → `false` o `!==`; texto → `""`; la query sin quitar al buscar                                                                                                                                                             |
| @s49 `uno.svg` (1 B)                                                        | 0 líneas                                        | si se escribe `bytes < 1`: `<= 1` (`EqualityOperator`); con `=== 0`, el `!==` ya muere en la fila de 0 B                                                                                                                                 |
| @s50 una fila por carácter                                                  | línea de la regla 4                             | `Regex`: quitar `%`, `&` o la barra invertida de la clase; texto → `""`                                                                                                                                                                  |
| @s50 control `?v=2#x`                                                       | 0 líneas                                        | `Regex`: clase negada                                                                                                                                                                                                                    |
| @s50 `?a=1&amp;b=2`                                                         | regla 4                                         | mirar la regla 4 sobre la ruta ya sin query                                                                                                                                                                                              |
| @s50 `/favicon%2Esvg`, `no%20existe.svg`                                    | SOLO la 4                                       | la regla 4 evaluada después de la 1 o de la 2                                                                                                                                                                                            |
| @s50, las tres con barra invertida AL PRINCIPIO; @s57, su fila              | regla 4 / la línea del corte                    | quitar la rama S-7 («empieza por barra invertida» → candidato): sin ella no son candidatos y salen con 0 [V: modelo]                                                                                                                     |
| @s51 raíz con base y sin base                                               | 0 líneas                                        | `resto === ''` → `false` o `!==`; `'index.html'` → `""` (`StringLiteral`)                                                                                                                                                                |
| @s51 `x/`, `/x/`, `x`                                                       | regla 2                                         | `resto === ''` → `true`; la alternativa del brief (`<carpeta>/` → `index.html`); resolver contra rutas LÓGICAS                                                                                                                           |
| @s52, filas con línea y el carácter AL PRINCIPIO (SP; FF; SP+FF; los siete) | regla 2 con el valor CRUDO                      | recorte del PRINCIPIO: sin SP, sin FF, solo espacios, un solo carácter (el `+` quitado), sin TAB, LF o CR en la clase (orden de WHATWG): cada uno rompe alguna, también SOLO por sus líneas [V: modelo]                                  |
| @s52, controles de los extremos (uno, dos y los siete del final)            | 0 líneas                                        | recorte del FIN: sin cualquiera de los 5, un solo carácter (el `+` quitado), sin recorte [V: modelo]                                                                                                                                     |
| @s52, todas                                                                 | la lista se pidió ≥ 1 vez                       | un recorte del PRINCIPIO roto deja el `href` FUERA y la lista sin pedir: segundo testigo, además de las filas con línea                                                                                                                  |
| @s52, TAB, LF y CR dentro                                                   | 0 líneas                                        | `Regex` de lo que se quita dentro: quitar cualquiera de los 3; clase negada                                                                                                                                                              |
| @s52, espacio y FF dentro                                                   | regla 2                                         | quitar dentro también el espacio o el FF; quitar `^` o `$` de la regex del recorte (la clase se quitaría en todo el `href`) [V: modelo]                                                                                                  |
| @s52 `⟨U+0020⟩/…/no-existe.svg`                                             | regla 2 con el valor CRUDO                      | poner en la línea el valor limpio                                                                                                                                                                                                        |
| Regex del recorte, mutantes de nivel 1                                      | (las filas de @s52)                             | `^` y `$` quitados, `+` quitado en cada extremo y clase negada: TODOS mueren en las tres formas previsibles (una regex con alternancia y luego quitar; dos regex; quitar y luego recortar FF y espacio) [V: modelo y weapon-regex 1.3.6] |
| @s53 `//cdn…`                                                               | 0 líneas, sin pedir la lista                    | `RUTA_INTERNA` sin `(?!\/)` o con `(?=\/)`                                                                                                                                                                                               |
| @s53 `./x.css`, `../x.css`                                                  | 0 líneas                                        | `RUTA_INTERNA` sin el ancla `^`                                                                                                                                                                                                          |
| @s53 `<link rel="icon">` sin href                                           | ANCLA y 0 líneas                                | `?.[1]` → `[1]` (`OptionalChaining`: revienta → rama de @s29); filtro de `undefined` → `true`                                                                                                                                            |
| @s53 (todas)                                                                | 0 líneas con la lista AUSENTE                   | contar candidatos de más (`> 0` → `>= 0`): cortaría con la línea de la lista ausente                                                                                                                                                     |
| @s54 sin base (ausente y `null`)                                            | regla 2, nunca la 1                             | `base === null` → `false` (iría por la rama con base: regla 1); `slice(1)` eliminado (buscaría `dist//favicon.svg` y el control caería); la base ausente sin normalizar a `null`                                                         |
| @s54 `/NailsLashStudioWeb/favicon.svg` sin base                             | regla 2                                         | quitar «a ojo» el prefijo cuando no hay base declarada                                                                                                                                                                                   |
| @s54 base sin barra final                                                   | regla 2                                         | normalizar la base (añadirle la barra): abriría la puerta en vez de cerrarla                                                                                                                                                             |
| @s55 una fila por `rel`, la caja y el `<body>`                              | regla 2                                         | filtrar por `rel`; leer `cabezaDe` en vez del documento; un extractor sin la bandera `i` (desviaciones: los extractores reutilizados ya la llevan)                                                                                       |
| @s56                                                                        | las 5 líneas, en orden                          | `ArrayDeclaration` sobre `[...hoy, ...links]` → `[]`, u orden invertido; deduplicar (el `/favicon.svg` doble); ordenar páginas; ruta física en vez de lógica                                                                             |
| @s57 filas 1-3 y 6                                                          | la línea del corte, SOLA                        | `ficheros === undefined` → `false` (sin corte: revienta → línea de @s29); el corte después de las reglas de hoy (fila 2) o después de la regla 1 (fila 3); texto → `""`; sin la rama S-7 (fila 6)                                        |
| @s57 filas 4-5                                                              | lo de hoy                                       | `ficheros === undefined` → `true`, o `hayCandidatos` → `true`: cortaría sin motivo                                                                                                                                                       |
| @s58 fila 1                                                                 | línea de @s29 con la causa                      | tragarse la excepción de la lista (devolver `[]`)                                                                                                                                                                                        |
| @s58 filas 2-3                                                              | 0 líneas / línea de @s26                        | pedir la lista SIEMPRE (`hayCandidatos` → `true`) o antes de `existe()` (un valor y no un método); en la 3, también `.some` → `.every` en los candidatos (`[].every(…)` es cierto con `dist/` ausente) [V: modelo]                       |
| @s59 fila 1                                                                 | línea de la guarda                              | `> 0` → `>= 0`; quitar la guarda (`BlockStatement`); texto → `""`                                                                                                                                                                        |
| @s59 fila 2                                                                 | línea de la guarda sin lista                    | condicionar la guarda a la lista                                                                                                                                                                                                         |
| @s59 filas 3-4                                                              | SOLO @s28 / SOLO el title                       | guarda colocada antes de la de @s28 o antes de las violaciones de hoy                                                                                                                                                                    |
| @s59 fila 5                                                                 | 0 líneas                                        | guarda que excluya la canónica (`rel="canonical"`)                                                                                                                                                                                       |
| @s59 filas 6-7                                                              | 0 líneas                                        | guarda que cuente solo root-absolutos, o que filtre el `href` vacío (`filter(Boolean)`)                                                                                                                                                  |
| @s59 fila 8 (dos páginas)                                                   | 0 líneas                                        | `.some` → `.every` en la guarda (`MethodExpression`)                                                                                                                                                                                     |
| @s60                                                                        | cada regla, exactamente 1 vez                   | `ArrayDeclaration`/borrado de una de las 5 entradas de `REGLAS_DEL_CASCARON`; duplicarla                                                                                                                                                 |
| @s65 control `favicon.svg`                                                  | 0 líneas                                        | «oculto» = «algún segmento CONTIENE un punto» [V: modelo]                                                                                                                                                                                |
| @s65 `.vite/manifest.json`                                                  | regla 5                                         | quitar el predicado de oculto; mirar solo el ÚLTIMO segmento [V: modelo]                                                                                                                                                                 |
| @s65 `assets/.oculto.css`                                                   | regla 5                                         | mirar solo el PRIMER segmento tras `dist/` [V: modelo]                                                                                                                                                                                   |
| @s65 `.oculto-vacio.svg`                                                    | regla 5, nunca la 3                             | la 3 antes que la 5 [V: modelo]                                                                                                                                                                                                          |
| @s65 `.vite/no-existe.json`                                                 | regla 2                                         | mirar lo oculto ANTES de buscar en la lista [V: modelo]                                                                                                                                                                                  |
| @s66, las tres filas                                                        | regla 2 en `/servicios` / corte / @s29          | candidatos solo de la 1.ª página del listado; candidatos con `.every` y el listado no vacío. Los dos fallan ABIERTOS (exit 0 en las tres) y pasan el resto del contrato [V: modelo]                                                      |
| @s61                                                                        | ANCLA, exit 0, `✓`                              | (sin Stryker) un humilde que liste solo HTML, no recursivo, sin tamaño, o que no pase la lista o la base                                                                                                                                 |
| @s62                                                                        | ≠ 0 y su línea, única; original RELEÍDO intacto | (sin Stryker) el humilde que no cablea la lista (corte en vez de la regla), o que la cablea con ubicaciones físicas en vez de `dist/…`; un sabotaje que escriba en el original                                                           |
| @s67                                                                        | regla 2 en la carpeta, única                    | (sin Stryker) el humilde sin `isFile()`: en Windows da la regla 3 (carpeta de 0 B) y con una carpeta de más de 0 B saldría con 0 [V: modelo y build real; Linux, I]                                                                      |
| @s63, @s64                                                                  | —                                               | manual: el pipeline de verdad (`pnpm build` entero) y la web publicada (control de regresión)                                                                                                                                            |

Los `StringLiteral` de las 5 reglas y de las 2 líneas mueren en CADA fila que espera una línea exacta. Los
mutantes equivalentes que la spec anticipa (`=== 0` → `<= 0` con tamaños nunca negativos) se REFACTORIZAN, no se
excluyen (`mutante-equivalente-se-refactoriza-para-proteger-un-throw-real`, spec «Mutación (D10)»). Si la
limpieza se escribe quitando TAB, LF y CR ANTES de recortar, la clase del recorte basta con FF y espacio: con los
cinco, esos tres serían hijos sobrantes de la clase (nivel 2 de `weapon-regex`, que Stryker 9.6.1 no genera:
`regex-mutator.js:22`, `mutationLevels: [1]`); las dos formas dan el mismo resultado (§8).

## 3. Ciegos declarados (ningún `Then` los ve, y la spec lo acepta)

- **Los huecos de la spec** («Huecos DECLARADOS»), todos en el banner: `href` relativos (uno que empieza por
  barra invertida NO lo es: @s50, S-7); URL absolutas y `//host`, que F-05 solo ve con un `rel` de petición o
  contacto de sus listas: con `apple-touch-icon`, un `rel` desconocido o sin `rel` no las ve NINGUNA de las dos
  puertas (la deuda de FS-6, `project-spec.md:4564`, SIGUE ABIERTA); `<script src>`, `<img src|srcset>`,
  `<source>` y `url()` del CSS; `fetch()`; `<base href>`; comillas simples o sin comillas; el umbral de 0 bytes;
  `vite-ignore` (la regla 1 acusa su efecto, @s47); otros controles C0 en los extremos. @s53 FIJA que relativos,
  absolutos y `//` quedan fuera; el resto no tiene escenario.
- **`REGLAS_DEL_CASCARON` no es «TODAS las reglas»**, aunque su comentario lo diga (`src/lib/puerta-cascaron.ts:857`):
  le falta `REGLA_RUTA_AUSENTE` (:670), que la puerta emite (@s26) [V: copia literal, 22 entradas, `includes` →
  `false`]. Hueco DECLARADO en @s60 y en el banner; no se cierra en H-5 (§5, pregunta 1).
- **Lo que la limpieza no recorta.** Ningún `Then` distingue la limpieza de los 5 espacios ASCII de la spec de
  un `.trim()` de JavaScript, que además recorta U+000B, U+00A0, U+FEFF y otros. Con `.trim()` la puerta
  fallaría cerrada en MÁS casos (nunca abierta), pero se apartaría de la spec. No se fija con una fila a
  propósito: con U+000B la fila consagraría un falso negativo (el navegador SÍ lo recorta: `new URL` de Node
  22.15.0 da `/favicon.svg` [V]). Lo contrasta el `judge` contra la spec.
- **El humilde nunca lee el contenido** (`readFileSync`): no es observable desde un test; lo ve el `judge` en
  el código. @s61 sí prueba que la lista trae todos los ficheros, también los de `assets/`, con su tamaño, y
  @s67, que no trae carpetas.
- **S-4 (las reglas viven fuera de `inspeccionarSitio`)** es estructura: la protegen las 39 llamadas de hoy, que
  no cambian, y el `judge`.
- **Un sabotaje de caja en el extremo a extremo**: no se siembra (firma distinta en Windows y en Linux, [I]); la
  caja la fijan @s47 y @s48 en la puerta pura.
- **Más de una HTML en el artefacto real**: hoy solo hay `index.html` (`RUTAS_ESPERADAS = ['/']`); el orden, la
  ruta y los candidatos repartidos entre páginas los fijan @s56 y @s66 con fixtures.
- **Cuántos `<link>` trae el artefacto real**: @s61 exige «al menos 1 con la base» y «exactamente 1» del
  favicon, nunca el total (11): el número de precargas es de F-05.
- **Lo que la guarda nueva no certifica**: solo un fallo TOTAL del extractor; en el artefacto real la canónica
  (el primer `<link>` de 11 [V: build real]) la satisface sola. Que se resuelva algún root-absoluto lo prueban
  @s61 y @s62.

## 4. Autorrevisión del `gherkin_author` (antes y después de la ronda 1)

### 4.1 ¿Es satisfacible cada `Then` con el repo real?

- **@s46-@s60, @s65 y @s66 (puros)**: la «página correcta» es la salida por defecto de `htmlCrudo()`, que hoy pasa
  `inspeccionarSitio` sin violaciones (@s12, `src/lib/puerta-cascaron.test.ts`) [V]; bajo la base su
  `<a href="/">` queda fuera (`esEnlaceRoto` devuelve `false` sin el prefijo, `src/lib/puerta-cascaron.ts:601-603`)
  [V]. Las líneas de hoy que se citan son literales del código: @s26 `ruta esperada sin HTML en dist/`
  (:670, con `valor` vacío), @s28 (:848), @s29 (:797), el title (`acusar(REGLA_TITULO, titulo ?? '')`, :480) y el
  formato (:777-779) [V]. **Ronda 1**: TODAS las filas puras de un `href` (@s47-@s54, @s65) se leyeron del
  `.feature` y se corrieron contra un modelo de la spec montado sobre una copia literal del código de hoy, en los
  dos órdenes de limpieza: 138 corridas, 0 en rojo; y @s46, @s55-@s59 y @s66, escritas a mano, también [V: §8].
- **@s59 fila 1**: `<link rel="canonical">` sin `href` → `atributoDeEtiqueta` devuelve `''`, no `null`
  (:387-401), así que no salta «canónica ausente» [V: leído y medido].
- **@s50 y @s52**: los comportamientos del navegador que se citan están medidos con `new URL(href,
'https://cenit-digital.github.io/NailsLashStudioWeb/')` en Node 22.15.0 (implementa el URL Standard) [V]:

| `href` (notación del `.feature`)                                                                         | host                    | ruta pedida                              |
| -------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------- |
| `⟨U+0020⟩/favicon.svg⟨U+0020⟩`                                                                           | cenit-digital.github.io | `/favicon.svg`                           |
| `⟨U+0009⟩/NailsLashStudioWeb/favicon.svg` (y con `⟨U+000C⟩`)                                             | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`        |
| `/NailsLashStudioWeb/fav` + TAB, LF o CR + `icon.svg`                                                    | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`        |
| `/NailsLashStudioWeb/fav⟨U+0020⟩icon.svg`                                                                | cenit-digital.github.io | `/NailsLashStudioWeb/fav%20icon.svg`     |
| `/NailsLashStudioWeb/fav⟨U+000C⟩icon.svg`                                                                | cenit-digital.github.io | `/NailsLashStudioWeb/fav%0Cicon.svg`     |
| `/⟨U+005C⟩cdn.ejemplo/x.css`                                                                             | **cdn.ejemplo**         | `/x.css`                                 |
| `/NailsLashStudioWeb⟨U+005C⟩favicon.svg`                                                                 | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`        |
| `/NailsLashStudioWeb/./favicon.svg` y `assets/../`                                                       | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`        |
| `//cdn.ejemplo/x.css`                                                                                    | **cdn.ejemplo**         | `/x.css`                                 |
| U+000B + `/favicon.svg`                                                                                  | cenit-digital.github.io | `/favicon.svg` (lo recorta)              |
| U+00A0 + `/favicon.svg`                                                                                  | cenit-digital.github.io | `/NailsLashStudioWeb/%C2%A0/favicon.svg` |
| **Ronda 1:** `⟨U+0020⟩⟨U+0009⟩⟨U+0020⟩⟨U+000A⟩⟨U+0020⟩⟨U+000D⟩⟨U+0020⟩/NailsLashStudioWeb/no-existe.svg` | cenit-digital.github.io | `/NailsLashStudioWeb/no-existe.svg`      |
| **Ronda 1:** `/NailsLashStudioWeb/favicon.svg⟨U+0020⟩⟨U+0009⟩⟨U+0020⟩⟨U+000A⟩⟨U+0020⟩⟨U+000D⟩⟨U+0020⟩`   | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`        |
| **Ronda 1:** `⟨U+000C⟩/…/no-existe.svg` y `⟨U+0020⟩⟨U+000C⟩/…/no-existe.svg`                             | cenit-digital.github.io | `/NailsLashStudioWeb/no-existe.svg`      |
| **Ronda 1:** `⟨U+005C⟩favicon.svg`                                                                       | cenit-digital.github.io | `/favicon.svg` (el 404 de la firma a)    |
| **Ronda 1:** `⟨U+005C⟩NailsLashStudioWeb/favicon.svg`                                                    | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`        |
| **Ronda 1:** `⟨U+005C⟩⟨U+005C⟩cdn.ejemplo/x.css`                                                         | **cdn.ejemplo**         | `/x.css`                                 |

La barra invertida dentro de la ruta se lee como `/` (S-2, que la spec ya da por [V]). Consecuencia que el
contrato escribe: la fila `/NailsLashStudioWeb⟨U+005C⟩favicon.svg` de @s50 es un falso positivo CONSCIENTE, como
el `%` (pediría el favicon que sí existe), y lo mismo `⟨U+005C⟩NailsLashStudioWeb/favicon.svg`.

- **@s61**: el artefacto real trae `<link rel="icon" href="/NailsLashStudioWeb/favicon.svg">` y su fichero con
  más de 0 bytes (lo asevera ya F-28 @s8 sobre el mismo build) [V: el test existe y F-28 se cerró con él en verde];
  el exit 0 con la puerta de hoy es el «H-3 control» (:524-533) [V]. Con la enmienda, el exit 0 exige que los 10
  root-absolutos resuelvan [V, ronda 1: el modelo, con el humilde copiado de la spec sobre un build real, da
  `{"codigo":0,"lineas":[]}`].
- **@s62**: con la puerta de hoy las tres copias salen con 0, porque la puerta solo lee `<a href>`
  (`extraerEnlaces`, :546) [I: del código]. Con la enmienda dan su línea [V, ronda 1: modelo sobre copias de un
  build real, (a), (b) y (c) dan exactamente su línea]. El último `Then` relee el original [V: §7, R4].
- **@s63**: la fila (a) la midió el lead con el código de hoy (exit 0, brief §2) [V: brief]; con la enmienda,
  ≠ 0 [I]. La puerta del cascarón es la PRIMERA de la cadena de `pnpm build` (`package.json:16`) [V].
- **@s64**: `/favicon.svg` → 404 y `/NailsLashStudioWeb/favicon.svg` → 200 [V: `curl -I`, 2026-10-01, 11:54 UTC].
  Pasa igual sin H-5: es un control de regresión (§7, R7).
- **@s65**: `/NailsLashStudioWeb/.vite/manifest.json` → 404 en GitHub Pages [V: `curl -I`, 2026-10-01].
- **@s67**: el build real tiene la carpeta `assets/`; `readdirSync` recursivo devuelve 42 entradas, 39 ficheros y
  3 carpetas, y `statSync` de una carpeta da 0 B en Windows; `/NailsLashStudioWeb/assets` → 301 → `/assets/` →
  404 [V: §8].

### 4.2 Colisiones con lo que ya está `done`

- **@s1-@s45**: 0 líneas tocadas [V]. Ningún fixture de `src/lib/puerta-cascaron.test.ts` lleva un `<link>`
  root-absoluto que llegue a la puerta: los dos que hay (líneas 1116 y 1706) van a `canonicaDeLaPagina` [V: grep].
  F-06 (`src/lib/puerta-anclas.test.ts:432-435`) no lleva ninguno [V: grep]. Todos llevan la canónica con `href`,
  así que la guarda nueva no salta en ellos.
- **@s13 (canónica ausente)**: @s59 fila 1 FIJA que una canónica sin `href` entre comillas dobles cuenta como
  PRESENTE (S-9), cosa que @s13 nunca decidió (su fila solo cubre «no hay ningún `<link rel="canonical">`»,
  `features/cascaron_semantico.feature:1045`). Declarado en el banner: si @s13 se endurece, la guarda vuelve a la
  puerta humana; nunca se excluyen sus mutantes.
- **Cambio de veredicto declarado**: una canónica sin `href` (o con comillas simples) y ningún otro `href` de
  `<link>` hoy sale con 0 y con la enmienda no [V: la puerta de hoy da `{"codigoSalida":0,"lineas":[]}`]. Está en
  el «QUÉ CAMBIA» del banner para que la puerta humana lo ratifique.
- **@s33 `head-correcto`** (`src/lib/trampas-del-horneado.test.tsx`): su único `<link>` horneado es la canónica
  absoluta (verificación, pregunta 5): 0 candidatos, la guarda cuenta 1, exit 0 sigue. @s59 fila 5 es justo ese caso.
- **@s32 `react19-nativa`**: su canónica sale en el `<body>` y es absoluta: no es candidato, y como ya hay
  violaciones la guarda no corre [I]. Sus líneas no cambian.
- **@s39-@s42 y F-28 @s8** (`src/pages/home-horneado.test.ts`): su ayudante `elementos` pasa a delegar en uno
  nuevo, `elementosDe(fuente, etiqueta)`, con el mismo patrón (excepción DECLARADA en el banner); ninguna de sus
  llamadas cambia, y F-28 @s8 sigue leyendo el artefacto original, que @s62 y @s67 exigen intacto releyéndolo.
- **@s34** (`src/lib/seo.test.ts:355-356`): los cinco textos nuevos no contienen «origen» ni «placeholder» [V:
  leídos]; @s60 exige que estén en la lista para que @s34 los vea.
- **F-05**: no se toca. Rechaza una URL absoluta de tercero SOLO con un `rel` de sus listas
  (`src/lib/terceros.ts:92-99` y :109); con `apple-touch-icon` no (la deuda de FS-6, abierta). @s47 y el banner
  lo dicen así.

### 4.3 Anclas positivas

Toda fila pura empieza por el ANCLA del extractor nuevo sobre esa página (el mismo que usan las reglas y la
guarda). El ANCLA mira el extractor, no la clasificación: @s46 y @s52 anclan además que la lista se pidió (solo
se pide con candidatos). @s59 no lleva ANCLA porque el extractor ES su objeto: su 1er `Then` mide lo que la
guarda cuenta. @s61 ancla el artefacto real (≥ 1 `<link>` con la base y el favicon); @s62 y @s67 anclan que
cada sabotaje está hecho, leyendo la COPIA del disco, y que el original sigue intacto, releyéndolo. @s64 lleva
su contraprueba de 404.

## 5. Lo que el contrato precisa sobre la spec (se ratifica en la puerta; recomendación: aprobar tal cual)

Ninguna cambia una decisión de Pablo ni del `spec_partner`; todas se derivan de la spec o la hacen medible.

1. **El extractor nuevo se exporta y se usa como ANCLA** en cada fila pura. La spec ya lo pide puro y exportado
   («nombres orientativos: `extraerLinks(html)`»); el contrato fija que devuelva el `href` CRUDO, en orden de
   aparición, sin los `<link>` sin `href` y con el vacío como `""`.
2. **La lista de referencia** (12 ficheros: los iconos con los bytes reales de `public/`, `dist/.vite/manifest.json`
   con los del artefacto real y dos ocultos más de fixture, uno de 0 B) y «la página correcta» = `htmlCrudo()` sin
   tocarlo, con el `<link>` insertado: así se cumple «ningún fixture de @s1-@s45 cambia».
3. **La limpieza, observable en los dos extremos** (@s52): «la lista se pidió» en cada fila y filas con línea y
   el carácter al principio (FF; espacio+FF; espacio, TAB, espacio, LF, espacio, CR, espacio).
4. **El espacio y el FF DENTRO del `href` dan la regla 2** (@s52): se deduce de la spec (dentro solo se quitan
   TAB, LF y CR) y coincide con el navegador, que los codifica (`%20`, `%0C`) [V: Node].
5. **La guarda habla también con la lista AUSENTE** (@s59 fila 2): la spec la pone en `inspeccionarArtefacto` sin
   condicionarla a la lista, y ya lo dice («Ausente, sin ninguno: lo de hoy, con UNA excepción»); el título de
   @s57 y su fila 4 lo repiten.
6. **Con `dist/` ausente y una lista que lanza, sale la línea de @s26** (@s58 fila 3): es el «método y no valor»
   de la spec, hecho observable.
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

**Preguntas para la puerta humana, con su recomendación:**

1. ¿Se añade `REGLA_RUTA_AUSENTE` a `REGLAS_DEL_CASCARON` (que hoy no es «TODAS las reglas»)? **Recomendación:
   no en H-5**; queda DECLARADO (@s60, banner). Es de @s26, ajeno a H-5 (brief §3: conservar las puertas
   existentes), y hoy no esconde nada: su texto no contiene «origen» ni «placeholder».
2. ¿Se acepta la excepción a «ningún ayudante de @s1-@s45 cambia» (`elementos` delega en `elementosDe`)?
   **Recomendación: sí**: es la única forma de medir las copias y el original releído sin un segundo patrón ni
   tocar el estado compartido `html`.
3. ¿Se acepta @s67, un sabotaje que la D9 de la spec no lista? **Recomendación: sí**: ancla el «solo ficheros» del
   humilde, que la spec da por probado por el extremo a extremo y ningún otro `Then` veía.

## 6. Traza: spec → escenarios

| Spec (`project-spec.md` §Feature 4 → «Enmienda 5»)                           | Escenarios                                                             |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| H5-1 dueño F-04 (ENMIENDA 5, desde @s46)                                     | todo el bloque; banner                                                 |
| H5-2 todo `<link>`, sea cual sea su `rel`, en todo HTML                      | @s46, @s55, @s56 y @s66 (dos páginas)                                  |
| H5-2 «root-absoluto» tras la limpieza; `/` + barra invertida falla cerrado   | @s52, @s47 (`⟨U+0020⟩/favicon.svg`), @s53 (`//`), @s50                 |
| H5-3 resolución ESTRICTA (solo la raíz → `index.html`)                       | @s51, @s48 (`assets`, `.`, `..`), @s67 (carpeta real)                  |
| H5-4 `%` y `&` con regla propia, sin decodificar                             | @s50                                                                   |
| H5-5 lista OPCIONAL que falla cerrado                                        | @s57, @s58, @s66                                                       |
| H5-6 fusionar, publicar y comprobar                                          | @s64                                                                   |
| S-1 una sola regla para `%`, `&` y la barra invertida                        | @s50                                                                   |
| S-2 la barra invertida en CUALQUIER posición                                 | @s50 (`/NailsLashStudioWeb⟨U+005C⟩favicon.svg`)                        |
| S-3 lista ausente con candidatos → corta con una línea                       | @s57 filas 1-3 y 6, @s66 fila 2                                        |
| S-4 las reglas fuera de `inspeccionarSitio`                                  | @s57 filas 4-5 (lo de hoy); ciego estructural (§3)                     |
| S-5 el extremo a extremo siembra las TRES firmas                             | @s62                                                                   |
| S-6 el valor es el `href` CRUDO                                              | @s47 y @s52 (filas con espacio o FF), @s50 (`&amp;`), @s49 (`?v=2`)    |
| S-7 barra invertida AL PRINCIPIO: candidato, regla 4                         | @s50 (tres filas finales), @s57 fila 6                                 |
| S-8 regla 5, ocultos en la lista                                             | @s65; @s48 (`./`, `../`: sigue la 2); @s49 (comentario de `.nojekyll`) |
| S-9 canónica sin `href` = presente para @s13; acoplamiento                   | @s59 fila 1 y comentario; banner                                       |
| S-10 el rojo demostrado es solo la (a)                                       | @s63; @s62 siembra la (c) sobre una copia                              |
| Las cinco reglas, texto exacto, en `REGLAS_DEL_CASCARON`                     | @s47-@s50, @s65, @s60                                                  |
| Formato y orden del informe                                                  | @s56                                                                   |
| El puerto: presente (se pide solo con candidatos; si lanza, @s29)            | @s46, @s52, @s58, @s66                                                 |
| El puerto: ausente con / sin candidatos                                      | @s57, @s53, @s66                                                       |
| El humilde lo cablea siempre, solo ficheros, sin leer el contenido           | @s61, @s62, @s67; ciego (§3)                                           |
| Guarda anti-vacuidad del extractor nuevo, qué no certifica y su acoplamiento | @s59                                                                   |
| Qué NO cambia (con el cambio de veredicto de la guarda, declarado)           | @s1-@s45 intactos; @s57 filas 4-5; @s59 fila 2; @s61 (`✓`)             |
| Asimetría 1 (`<a>` fuera, `<link>` regla 1; F-05 solo con sus `rel`)         | @s47 (`/otra-cosa/x.css` y comentario), @s55 (segunda canónica), @s53  |
| Asimetría 2 (ficheros frente a rutas lógicas)                                | @s51 (`/NailsLashStudioWeb/x`)                                         |
| D9 extremo a extremo: ancla, control, tres sabotajes                         | @s61, @s62 (y @s67, el humilde)                                        |
| D9 rojo demostrado del lead                                                  | @s63                                                                   |
| D10 mutación al 100 %, solo con los unitarios                                | @s46-@s60, @s65, @s66 (§2)                                             |

Los 18 casos límite de la spec, uno a uno:

| Caso límite                                                                                              | Escenario / fila                               |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1 la raíz, con base y sin ella                                                                           | @s51 filas 1-2                                 |
| 2 `x/` (no raíz) y `assets` (carpeta sin barra)                                                          | @s51 (`x/`, `/x/`, `x`), @s48 (`assets`), @s67 |
| 3 la base sin su barra final como `href`                                                                 | @s47 (`/NailsLashStudioWeb`)                   |
| 4 caja: `FAVICON.SVG` → 2; `nailslashstudioweb` → 1                                                      | @s48, @s47                                     |
| 5 limpieza; `" /favicon.svg"` → 1                                                                        | @s52, @s47                                     |
| 6 `//cdn…` no es de esta puerta                                                                          | @s53                                           |
| 7 `/` + barra invertida + `cdn…` y `/NailsLashStudioWeb` + barra invertida + `favicon.svg` → 4           | @s50                                           |
| 8 `?v=2` y `#x` resuelven; `&amp;` en la query → 4                                                       | @s48, @s50                                     |
| 9 `%2E` → 4 aunque Pages la sirva                                                                        | @s50                                           |
| 10 `.`/`..` → 2 (no la 5)                                                                                | @s48                                           |
| 11 1 byte pasa; 0 bytes → 3                                                                              | @s49                                           |
| 12 sin base: con fichero pasa; sin él → 2, nunca la 1                                                    | @s54                                           |
| 13 `href=""`, sin `href`, relativo o absoluto: fuera; con `href`, cuentan para la guarda                 | @s53, @s59                                     |
| 14 `<link>` en el `<body>`                                                                               | @s55 (fila `<body>`)                           |
| 15 dos páginas: la línea con la ruta de la que lo trae                                                   | @s56, @s66                                     |
| 16 base sin barra final → regla 2, falla cerrada                                                         | @s54 (última fila)                             |
| 17 barra invertida AL PRINCIPIO → 4; sin la lista, corta                                                 | @s50 (tres filas finales), @s57 fila 6         |
| 18 ocultos en la lista → 5 (también de 0 B); no en la lista → 2; un punto que no abre segmento no oculta | @s65                                           |

Y la lista de «Mutantes que deben morir» de la spec («Mutación (D10)»): limpieza (extremos y tabulador dentro) →
@s52 (ahora en los dos extremos, §2); aceptar `//` → @s53; `%`, `&` y la barra invertida, una fila por carácter →
@s50; la raíz con base y sin ella → @s51; `=== 0` → `<= 0` / `< 1` con la fila de 1 byte → @s49; `?query`/`#fragmento`
→ @s48 y @s50; el orden de las reglas → @s47 (sin base y sin fichero, SOLO la 1), @s50 (con `%` y sin fichero,
SOLO la 4) y @s65 (oculto de 0 B, SOLO la 5); el puerto ausente con y sin candidatos → @s57 y @s66; el puerto
que lanza y el que no se consulta → @s58 y @s66; la guarda (`.some` → `.every`, `> 0` → `>= 0`) con la canónica
sin `href` → @s59; la barra invertida inicial (S-7) → @s50 y @s57; la regla 5 (predicado, primer segmento, 5
antes que 3, antes de buscar en la lista) → @s65 y @s48; el texto de cada regla y línea, literal → todas las filas
con línea, y @s60.

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
