# Gherkin — F-04 ENMIENDA 5 (H-5): todo `<link>` root-absoluto del artefacto resuelve, bajo la base, a un fichero no vacío

> Lo escribe el `gherkin_author` el 2026-10-01. Contrato: `features/cascaron_semantico.feature`, banner
> ENMIENDA 5 (líneas 225-302, apilado tras el de la ENMIENDA 4 y antes de «Contrato de la feature 4», corrección 6
> de la verificación) y **19 escenarios, @s46-@s64** (líneas 1990-2473, al final, con «@s1-@s45 (arriba) NO SE
> TOCAN»). `git diff --numstat`: 564 líneas añadidas y **0 borradas** [V]. Estado: **PENDIENTE de la puerta
> humana**. Fuentes, en orden de mando: `progress/brief_h5_enlaces_horneados.md` §8 (decisiones de Pablo) →
> `progress/verificacion_decisiones_h5.md` (prevalece sobre §2-§6 del brief) → resto del brief; spec:
> `project-spec.md` §Feature 4 → «Enmienda 5 (2026-10-01)». Etiquetas: **[V]** verificado en esta sesión ·
> **[I]** inferencia · **[NV]** no verificado.
>
> **`feature_list.json` NO se ha tocado**: precedente de las ENMIENDAS 1-4 (F-04 sigue `done`; banner). El
> reetiquetado de la «deuda de F-05» de su línea 549 lo hace el lead al cerrar (H5-1).

## 1. Reparto: de la spec al contrato

Tres grupos que no se mezclan (lo pidió el lead): puerta pura, extremo a extremo y lo que hace el lead a mano.

| Grupo                                                                | Escenario | Filas | Qué fija                                                                                         |
| -------------------------------------------------------------------- | --------- | ----- | ------------------------------------------------------------------------------------------------ |
| Puerta pura (`src/lib/puerta-cascaron.test.ts`, cuenta para Stryker) | @s46      | 1     | CONTROL: un `<link>` de cada clase del artefacto real, todos resuelven; la lista se pidió        |
|                                                                      | @s47      | 8     | regla 1 (sin el prefijo), su orden frente a la 2 y la 3, y la asimetría 1                        |
|                                                                      | @s48      | 8     | regla 2 (sin fichero): caja, carpeta, `.`/`..`; controles `?query`, `#fragmento`, subcarpeta     |
|                                                                      | @s49      | 3     | regla 3 (0 bytes) y su control de 1 byte                                                         |
|                                                                      | @s50      | 7     | regla 4: una fila por `%`, `&` y barra invertida (dos), y su orden frente a la 1 y la 2          |
|                                                                      | @s51      | 6     | solo la raíz va a `index.html`; `x/` y `x` fallan cerrado; asimetría 2                           |
|                                                                      | @s52      | 12    | la limpieza: cada carácter en los extremos y dentro, y el valor CRUDO en la línea                |
|                                                                      | @s53      | 7     | lo que no es root-absoluto queda fuera y ni pide la lista                                        |
|                                                                      | @s54      | 6     | sin base (ausente o `null`) y con una base sin barra final                                       |
|                                                                      | @s55      | 12    | todo `rel`, la caja de la etiqueta y el `<link>` del `<body>`                                    |
|                                                                      | @s56      | 1     | formato y orden del informe con dos páginas                                                      |
|                                                                      | @s57      | 5     | la lista AUSENTE: corte con una sola línea, o exactamente lo de hoy                              |
|                                                                      | @s58      | 3     | la lista se pide solo con candidatos; si revienta, rama de @s29; con `dist/` ausente, la de @s26 |
|                                                                      | @s59      | 8     | la guarda del extractor nuevo, su orden tras @s28 y sus controles                                |
|                                                                      | @s60      | 1     | las 4 reglas en `REGLAS_DEL_CASCARON`, sin «origen» ni «placeholder»                             |
| Extremo a extremo (`src/pages/home-horneado.test.ts`, fuera)         | @s61      | 1     | ANCLA del artefacto real + CONTROL (exit 0, `✓`, ninguna línea nueva)                            |
|                                                                      | @s62      | 3     | las tres firmas (a), (b) y (c), cada una en su copia, con su línea exacta                        |
| A mano, el lead (`progress/`)                                        | @s63      | 1     | `@demostracion-del-lead`: borrar `public/favicon.svg` → `pnpm build` ≠ 0; restaurar → 0 y limpio |
|                                                                      | @s64      | 1     | `@verificacion-viva`: tras publicar, cada `href` → 200, con la contraprueba `/favicon.svg` → 404 |

Ningún escenario toca `inspeccionarSitio` (S-4): las reglas nuevas se observan por `ejecutarPuertaDelCascaron`,
que es lo que recibe la lista. Los textos de las reglas y de las dos líneas nuevas son los de la spec, copiados
letra a letra en la cabecera de la sección (y escritos a mano en cada fila).

## 2. Cada `Then` → qué mutante de la implementación futura mata

La implementación aún no existe. Los mutantes se describen sobre la que pide la spec («Resolución ESTRICTA»,
«El puerto nuevo», «Guarda»), con los operadores de Stryker (`Regex`, `ConditionalExpression`,
`EqualityOperator`, `MethodExpression`, `StringLiteral`, `ArrayDeclaration`, `BlockStatement`,
`OptionalChaining`) y, donde no hay operador, con la desviación de implementación que la fila impide. Solo
cuentan @s46-@s60: @s61-@s62 son build-based y Stryker no los ve (`vitest.stryker.config.ts`, corrección 16).
Esquema de referencia (orientativo, no es código): `limpiar(href)` → regla 4 si hay `%`, `&` o barra invertida →
`ruta` sin `?`/`#` → con base, regla 1 si no empieza por ella; `resto` → `dist/index.html` si vacío, si no
`dist/<resto>` → regla 2 si no está en la lista, regla 3 si pesa 0.

| Escenario / fila                                    | `Then` que muerde                     | Mutante que mata                                                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @s46                                                | ANCLA: 6 valores en orden             | extractor que se queda con la primera coincidencia o que filtra todo (`filter` → `() => false`)                                                                                  |
| @s46                                                | la lista se pidió ≥ 1 vez             | `if (hayCandidatos)` → `false`: la puerta no consulta la lista y da 0 líneas en vacío                                                                                            |
| @s46                                                | exit 0 y 0 líneas                     | todo mutante que acuse sin motivo: prefijo → `true`, «no está» → `true`, `bytes === 0` → `true`, clase de la regla 4 negada, raíz → `true ?`                                     |
| @s47 `/favicon.svg`                                 | línea de la regla 1                   | `!ruta.startsWith(base)` → `false` o `endsWith`; `base === null` → `true` (iría por la rama sin base, encontraría `dist/favicon.svg` y pasaría); texto de la regla → `""`        |
| @s47 `/no-existe.svg`, `/vacio.svg`                 | SOLO la línea de la 1                 | `return` temprano de la regla 1 → `{}` (`BlockStatement`): seguiría y añadiría la 2 o la 3                                                                                       |
| @s47 `/NailsLashStudioWeb`, `/nailslash…`           | regla 1                               | prefijo comparado sin la barra final o sin caja (desviación de implementación)                                                                                                   |
| @s47 `⟨U+0020⟩/favicon.svg`                         | regla 1 con el valor CRUDO            | quitar la limpieza (sin recortar no es root-absoluto: 0 líneas); poner en la línea el valor limpio (S-6)                                                                         |
| @s47 `/otra-cosa/x.css`                             | regla 1                               | reutilizar `esEnlaceRoto` de `<a>`, que devuelve `false` sin el prefijo (@s37)                                                                                                   |
| @s48 controles `?v=2`, `#x`                         | 0 líneas                              | `Regex` sobre `[?#]`: quitar `?` o `#` de la clase                                                                                                                               |
| @s48 control `assets/app.css`                       | 0 líneas                              | `slice(base.length)` eliminado (`MethodExpression`): buscaría `dist//NailsLashStudioWeb/…`                                                                                       |
| @s48 `no-existe.svg`                                | línea de la regla 2                   | «no está» → `false` o `!==`; texto de la regla → `""`                                                                                                                            |
| @s48 `FAVICON.SVG`, `assets`, `./`, `../`           | regla 2                               | búsqueda sin caja, `existsSync`, resolver carpetas o normalizar segmentos (desviaciones)                                                                                         |
| @s49 `vacio.svg`, `vacio.svg?v=2`                   | línea de la regla 3                   | `bytes === 0` → `false` o `!==`; texto → `""`; la query sin quitar al buscar                                                                                                     |
| @s49 `uno.svg` (1 B)                                | 0 líneas                              | si se escribe `bytes < 1`: `<= 1` (`EqualityOperator`); con `=== 0`, el `!==` ya muere en la fila de 0 B                                                                         |
| @s50 una fila por carácter                          | línea de la regla 4                   | `Regex`: quitar `%`, `&` o la barra invertida de la clase; texto → `""`                                                                                                          |
| @s50 control `?v=2#x`                               | 0 líneas                              | `Regex`: clase negada                                                                                                                                                            |
| @s50 `?a=1&amp;b=2`                                 | regla 4                               | mirar la regla 4 sobre la ruta ya sin query                                                                                                                                      |
| @s50 `/favicon%2Esvg`, `no%20existe.svg`            | SOLO la 4                             | la regla 4 evaluada después de la 1 o de la 2                                                                                                                                    |
| @s51 raíz con base y sin base                       | 0 líneas                              | `resto === ''` → `false` o `!==`; `'index.html'` → `""` (`StringLiteral`)                                                                                                        |
| @s51 `x/`, `/x/`, `x`                               | regla 2                               | `resto === ''` → `true`; la alternativa del brief (`<carpeta>/` → `index.html`); resolver contra rutas LÓGICAS                                                                   |
| @s52 extremos (los 5 caracteres; 1 o 2 por extremo) | 0 líneas                              | `Regex` del recorte: quitar `^` o `$`, quitar cualquiera de los 5 de la clase, quitar el `+` (fila de DOS por extremo); quitar la llamada (`MethodExpression`)                   |
| @s52 tabulador, LF y CR dentro                      | 0 líneas                              | `Regex` de lo que se quita dentro: quitar cualquiera de los 3                                                                                                                    |
| @s52 espacio y FF dentro                            | regla 2                               | quitar dentro con `\s` o con la clase de los extremos (el navegador no lo hace)                                                                                                  |
| @s52 `⟨U+0020⟩/…/no-existe.svg`                     | regla 2 con el valor CRUDO            | poner en la línea el valor limpio                                                                                                                                                |
| @s53 `//cdn…`                                       | 0 líneas, sin pedir la lista          | `RUTA_INTERNA` sin `(?!\/)` o con `(?=\/)`                                                                                                                                       |
| @s53 `./x.css`, `../x.css`                          | 0 líneas                              | `RUTA_INTERNA` sin el ancla `^`                                                                                                                                                  |
| @s53 `<link rel="icon">` sin href                   | ANCLA y 0 líneas                      | `?.[1]` → `[1]` (`OptionalChaining`: revienta → rama de @s29); filtro de `undefined` → `true`                                                                                    |
| @s53 (todas)                                        | 0 líneas con la lista AUSENTE         | contar candidatos de más (`> 0` → `>= 0`): cortaría con la línea de la lista ausente                                                                                             |
| @s54 sin base (ausente y `null`)                    | regla 2, nunca la 1                   | `base === null` → `false` (iría por la rama con base: regla 1); `slice(1)` eliminado (buscaría `dist//favicon.svg` y el control caería); la base ausente sin normalizar a `null` |
| @s54 `/NailsLashStudioWeb/favicon.svg` sin base     | regla 2                               | quitar «a ojo» el prefijo cuando no hay base declarada                                                                                                                           |
| @s54 base sin barra final                           | regla 2                               | normalizar la base (añadirle la barra): abriría la puerta en vez de cerrarla                                                                                                     |
| @s55 una fila por `rel`, la caja y el `<body>`      | regla 2                               | filtrar por `rel`; leer `cabezaDe` en vez del documento; un extractor sin la bandera `i` (desviaciones: los extractores reutilizados ya la llevan)                               |
| @s56                                                | las 5 líneas, en orden                | `ArrayDeclaration` sobre `[...hoy, ...links]` → `[]`, u orden invertido; deduplicar (el `/favicon.svg` doble); ordenar páginas; ruta física en vez de lógica                     |
| @s57 filas 1-3                                      | la línea del corte, SOLA              | `ficheros === undefined` → `false` (sin corte: revienta → línea de @s29); el corte después de las reglas de hoy (fila 2) o después de la regla 1 (fila 3); texto → `""`          |
| @s57 filas 4-5                                      | lo de hoy                             | `ficheros === undefined` → `true`, o `hayCandidatos` → `true`: cortaría sin motivo                                                                                               |
| @s58 fila 1                                         | línea de @s29 con la causa            | tragarse la excepción de la lista (devolver `[]`)                                                                                                                                |
| @s58 filas 2-3                                      | 0 líneas / línea de @s26              | pedir la lista SIEMPRE (`hayCandidatos` → `true`) o antes de `existe()` (un valor y no un método)                                                                                |
| @s59 fila 1                                         | línea de la guarda                    | `> 0` → `>= 0`; quitar la guarda (`BlockStatement`); texto → `""`                                                                                                                |
| @s59 fila 2                                         | línea de la guarda sin lista          | condicionar la guarda a la lista                                                                                                                                                 |
| @s59 filas 3-4                                      | SOLO @s28 / SOLO el title             | guarda colocada antes de la de @s28 o antes de las violaciones de hoy                                                                                                            |
| @s59 fila 5                                         | 0 líneas                              | guarda que excluya la canónica (`rel="canonical"`)                                                                                                                               |
| @s59 filas 6-7                                      | 0 líneas                              | guarda que cuente solo root-absolutos, o que filtre el `href` vacío (`filter(Boolean)`)                                                                                          |
| @s59 fila 8 (dos páginas)                           | 0 líneas                              | `.some` → `.every` (`MethodExpression`)                                                                                                                                          |
| @s60                                                | cada regla, exactamente 1 vez         | `ArrayDeclaration`/borrado de una de las 4 entradas de `REGLAS_DEL_CASCARON`; duplicarla                                                                                         |
| @s61                                                | ANCLA, exit 0, `✓`, sin líneas nuevas | (sin Stryker) un humilde que liste solo HTML, no recursivo, sin tamaño, o que no pase la lista o la base                                                                         |
| @s62                                                | ≠ 0 y su línea, única                 | (sin Stryker) el humilde que no cablea la lista (corte en vez de la regla), o que la cablea con ubicaciones físicas en vez de `dist/…`                                           |
| @s63, @s64                                          | —                                     | manual: el pipeline de verdad (`pnpm build` entero) y la web publicada                                                                                                           |

Los `StringLiteral` de las 4 reglas y de las 2 líneas mueren en CADA fila que espera una línea exacta. Los mutantes
equivalentes que la spec anticipa (`=== 0` → `<= 0` con tamaños nunca negativos) se REFACTORIZAN, no se excluyen
(`mutante-equivalente-se-refactoriza-para-proteger-un-throw-real`, spec «Mutación (D10)»).

## 3. Ciegos declarados (ningún `Then` los ve, y la spec lo acepta)

- **Los huecos de la spec** («Huecos DECLARADOS»), todos en el banner: `href` relativos; URL absolutas y `//host`;
  `<script src>`, `<img src|srcset>`, `<source>` y `url()` del CSS; `fetch()`; `<base href>`; comillas
  simples o sin comillas; el umbral de 0 bytes; `vite-ignore` (la regla 1 acusa su efecto, @s47). @s53 FIJA que
  relativos, absolutos y `//` quedan fuera; el resto no tiene escenario.
- **Lo que la limpieza no recorta.** Ningún `Then` distingue la limpieza de los 5 espacios ASCII de la spec de
  un `.trim()` de JavaScript, que además recorta U+000B, U+00A0, U+FEFF y otros. Con `.trim()` la puerta
  fallaría cerrada en MÁS casos (nunca abierta), pero se apartaría de la spec. No se fija con una fila a
  propósito: con U+000B la fila consagraría un falso negativo (el navegador SÍ lo recorta: `new URL` de Node
  22.15.0 da `/favicon.svg` [V]). Lo contrasta el `judge` contra la spec.
- **El humilde nunca lee el contenido** (`readFileSync`): no es observable desde un test; lo ve el `judge` en
  el código. @s61 sí prueba que la lista trae todos los ficheros, también los de `assets/`, con su tamaño.
- **S-4 (las reglas viven fuera de `inspeccionarSitio`)** es estructura: la protegen las 39 llamadas de hoy, que
  no cambian, y el `judge`.
- **Un sabotaje de caja en el extremo a extremo**: no se siembra (firma distinta en Windows y en Linux, [I]); la
  caja la fijan @s47 y @s48 en la puerta pura.
- **Más de una HTML en el artefacto real**: hoy solo hay `index.html` (`RUTAS_ESPERADAS = ['/']`); el orden y la
  ruta con dos páginas los fija @s56 con fixtures.
- **Cuántos `<link>` trae el artefacto real**: @s61 exige «al menos 1 con la base» y «exactamente 1» del
  favicon, nunca el total (11): el número de precargas es de F-05.

## 4. Revisión adversarial

### 4.1 ¿Es satisfacible cada `Then` con el repo real?

- **@s46-@s60 (puros)**: la «página correcta» es la salida por defecto de `htmlCrudo()`, que hoy pasa
  `inspeccionarSitio` sin violaciones (@s12, `src/lib/puerta-cascaron.test.ts`) [V]; bajo la base su
  `<a href="/">` queda fuera (`esEnlaceRoto` devuelve `false` sin el prefijo, `src/lib/puerta-cascaron.ts:601-603`)
  [V]. Las líneas de hoy que se citan son literales del código: @s26 `ruta esperada sin HTML en dist/`
  (:670, con `valor` vacío), @s28 (:848), @s29 (:797), el title (`acusar(REGLA_TITULO, titulo ?? '')`, :480) y el formato
  (:777-779) [V].
- **@s59 fila 1**: `<link rel="canonical">` sin `href` → `atributoDeEtiqueta` devuelve `''`, no `null`
  (:387-401), así que no salta «canónica ausente» [V: leído].
- **@s50 y @s52**: los comportamientos del navegador que se citan están medidos con `new URL(href,
'https://cenit-digital.github.io/NailsLashStudioWeb/')` en Node 22.15.0 (implementa el URL Standard) [V]:

| `href`                                                | host                    | ruta pedida                              |
| ----------------------------------------------------- | ----------------------- | ---------------------------------------- |
| `" /favicon.svg "`                                    | cenit-digital.github.io | `/favicon.svg`                           |
| `"\t/NailsLashStudioWeb/favicon.svg"` (y `\f`)        | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`        |
| `/NailsLashStudioWeb/fav` + TAB, LF o CR + `icon.svg` | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`        |
| `/NailsLashStudioWeb/fav icon.svg`                    | cenit-digital.github.io | `/NailsLashStudioWeb/fav%20icon.svg`     |
| `/NailsLashStudioWeb/fav` + FF + `icon.svg`           | cenit-digital.github.io | `/NailsLashStudioWeb/fav%0Cicon.svg`     |
| `/\cdn.ejemplo/x.css`                                 | **cdn.ejemplo**         | `/x.css`                                 |
| `/NailsLashStudioWeb\favicon.svg`                     | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`        |
| `/NailsLashStudioWeb/./favicon.svg` y `assets/../`    | cenit-digital.github.io | `/NailsLashStudioWeb/favicon.svg`        |
| `//cdn.ejemplo/x.css`                                 | **cdn.ejemplo**         | `/x.css`                                 |
| U+000B + `/favicon.svg`                               | cenit-digital.github.io | `/favicon.svg` (lo recorta)              |
| U+00A0 + `/favicon.svg`                               | cenit-digital.github.io | `/NailsLashStudioWeb/%C2%A0/favicon.svg` |

Esto **sube a [V] el [NV] de S-2** en la spec («de memoria»): dentro de la ruta, la barra invertida se lee como
`/`. Consecuencia que el contrato escribe: la fila `/NailsLashStudioWeb\favicon.svg` de @s50 es un falso
positivo CONSCIENTE, como el `%` (pediría el favicon que sí existe).

- **@s61**: el artefacto real trae `<link rel="icon" href="/NailsLashStudioWeb/favicon.svg">` y su fichero con
  más de 0 bytes (lo asevera ya F-28 @s8 sobre el mismo build, `src/pages/home-horneado.test.ts`) [V: el test
  existe, y F-28 se cerró con él en verde: `cierre` de F-28 en `feature_list.json`]; el exit 0 con la puerta de hoy es el «H-3 control» (:524-533) [V]. Con la
  enmienda, el exit 0 exige que los 10 root-absolutos resuelvan: los 3 iconos pesan 1148, 2244 y 3682 B en
  `public/` [V: `ls -la public/`]; la hoja y las 6 fuentes `.woff2` salen de Vite con hash [I: inventario del
  brief §2, no repetido en esta sesión, que no lanza builds].
- **@s62**: con la puerta de hoy las tres copias salen con 0, porque la puerta solo lee `<a href>`
  (`extraerEnlaces`, :546) [I: del código]. Con la enmienda dan su línea [I].
- **@s63**: la fila (a) la midió el lead con el código de hoy (exit 0, brief §2) [V: brief]; con la enmienda,
  ≠ 0 [I]. La puerta del cascarón es la PRIMERA de la cadena de `pnpm build` (`package.json:16`) [V].
- **@s64**: `/favicon.svg` → 404 y `/NailsLashStudioWeb/` → 200 los midió la verificación con `curl -I` el
  2026-10-01 (`progress/verificacion_decisiones_h5.md`, pregunta 3) [V: documento; no repetido aquí].

### 4.2 Colisiones con lo que ya está `done`

- **@s1-@s45**: 0 líneas tocadas [V: `git diff`]. Ningún fixture de `src/lib/puerta-cascaron.test.ts` lleva un
  `<link>` root-absoluto que llegue a la puerta: los dos que hay (líneas 1116 y 1706) van a
  `canonicaDeLaPagina` [V: grep]. F-06 (`src/lib/puerta-anclas.test.ts:432-435`) no lleva ninguno [V: grep].
  Todos llevan la canónica con `href`, así que la guarda nueva no salta en ellos.
- **@s33 `head-correcto`** (`src/lib/trampas-del-horneado.test.tsx`): su `index.html` no trae `<link>`
  (:105-115) y su único `<link>` horneado es la canónica absoluta (verificación, pregunta 5): 0 candidatos, la
  guarda cuenta 1, exit 0 sigue. @s59 fila 5 es justo ese caso.
- **@s32 `react19-nativa`**: su canónica sale en el `<body>` y es absoluta: no es candidato, y como ya hay
  violaciones la guarda no corre [I]. Sus líneas no cambian.
- **F-28 @s8** lee el artefacto original: @s62 trabaja en copias y su último `Then` exige el original intacto.
- **@s34** (`src/lib/seo.test.ts:355-356`): los cuatro textos nuevos no contienen «origen» ni «placeholder»
  [V: leídos]; @s60 exige que estén en la lista para que @s34 los vea.
- **F-05**: no se toca. Un `<link>` de `rel` de petición con URL absoluta lo sigue rechazando ella (asimetría 1).

### 4.3 Anclas positivas

Toda fila pura empieza por el ANCLA del extractor nuevo sobre esa página (el mismo que usan las reglas y la
guarda). @s46 ancla además que la lista se pidió. @s59 no lleva ANCLA porque el extractor ES su objeto: su 1er
`Then` mide lo que la guarda cuenta. @s61 ancla el artefacto real (≥ 1 `<link>` con la base y el favicon) y @s62
ancla que cada sabotaje está hecho, y que el original sigue intacto. @s64 lleva su contraprueba de 404.

## 5. Lo que el contrato precisa sobre la spec (se ratifica en la puerta; recomendación: aprobar tal cual)

Ninguna cambia una decisión de Pablo ni del `spec_partner`; todas se derivan de la spec o la hacen medible.

1. **El extractor nuevo se exporta y se usa como ANCLA** en cada fila pura. La spec ya lo pide puro y exportado
   («nombres orientativos: `extraerLinks(html)`»); el contrato fija que devuelva el `href` CRUDO, en orden de
   aparición, sin los `<link>` sin `href` y con el vacío como `""`.
2. **La lista de referencia** (9 ficheros, los iconos con los bytes reales de `public/`) y «la página correcta» =
   `htmlCrudo()` sin tocarlo, con el `<link>` insertado: así se cumple «ningún ayudante de @s1-@s45 cambia».
3. **Dos caracteres por extremo** (@s52): sin esa fila, recortar uno solo pasaría.
4. **El espacio y el FF DENTRO del `href` dan la regla 2** (@s52): se deduce de la spec (dentro solo se quitan
   TAB, LF y CR) y coincide con el navegador, que los codifica (`%20`, `%0C`) [V: Node].
5. **La guarda habla también con la lista AUSENTE** (@s59 fila 2): la spec la pone en `inspeccionarArtefacto` sin
   condicionarla a la lista. La frase «ausente, sin ninguno: EXACTAMENTE lo de hoy» se cumple para todo artefacto
   que lleve la canónica con `href` (@s57 filas 4-5); la única excepción es el fixture que mata la guarda.
6. **Con `dist/` ausente y una lista que lanza, sale la línea de @s26** (@s58 fila 3): es el «método y no valor»
   de la spec, hecho observable.
7. **La guarda con dos páginas** (@s59 fila 8): la fila que mata `.some` → `.every`, que la spec pide.
8. **`<LINK REL HREF>` en mayúsculas y `hreflang` delante** (@s55): propiedades de los extractores reutilizados
   (`ENLACE` y `ATRIBUTO_HREF` llevan la bandera `i`, `src/lib/puerta-cascaron.ts:72-74`).
9. **Extremo a extremo**: el ANCLA del sabotaje en cada copia, «es la ÚNICA línea con ` — link root-absoluto`», el
   original intacto y el `href` leído tal cual (`.get('href')`, nunca `valorDe`, que lo pasa a minúsculas:
   `src/pages/home-horneado.test.ts:241-243`).
10. **@s63**: el CONTROL tras restaurar (`pnpm build` → 0) y `git status --porcelain` vacío: la spec pide
    restaurar y comprobar el árbol limpio (brief §7); el contrato lo hace `Then`.
11. **@s64**: la propuesta de la spec («cada `href` … responde 200 a `curl -I`»), con la contraprueba
    `/favicon.svg` → 404 para que «todo 200» no sea vacío. Es la comprobación que H5-6 manda repetir.
12. **Tag nuevo `@demostracion-del-lead`** (@s63), declarado en el banner.

## 6. Traza: spec → escenarios

| Spec (`project-spec.md` §Feature 4 → «Enmienda 5»)                | Escenarios                                                     |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| H5-1 dueño F-04 (ENMIENDA 5, desde @s46)                          | todo el bloque; banner                                         |
| H5-2 todo `<link>`, sea cual sea su `rel`, en todo HTML           | @s46, @s55, @s56 (dos páginas)                                 |
| H5-2 «root-absoluto» tras la limpieza; `/\` falla cerrado         | @s52, @s47 (`⟨U+0020⟩/favicon.svg`), @s53 (`//`), @s50         |
| H5-3 resolución ESTRICTA (solo la raíz → `index.html`)            | @s51, @s48 (`assets`, `.`, `..`)                               |
| H5-4 `%` y `&` con regla propia, sin decodificar                  | @s50                                                           |
| H5-5 lista OPCIONAL que falla cerrado                             | @s57, @s58                                                     |
| H5-6 fusionar, publicar y comprobar                               | @s64                                                           |
| S-1 una sola regla para `%`, `&` y la barra invertida             | @s50                                                           |
| S-2 la barra invertida en CUALQUIER posición                      | @s50 (`/NailsLashStudioWeb\favicon.svg`)                       |
| S-3 lista ausente con candidatos → corta con una línea            | @s57 filas 1-3                                                 |
| S-4 las reglas fuera de `inspeccionarSitio`                       | @s57 filas 4-5 (lo de hoy); ciego estructural (§3)             |
| S-5 el extremo a extremo siembra las TRES firmas                  | @s62                                                           |
| S-6 el valor es el `href` CRUDO                                   | @s47 y @s52 (filas con espacio), @s50 (`&amp;`), @s49 (`?v=2`) |
| Las cuatro reglas, texto exacto, en `REGLAS_DEL_CASCARON`         | @s47-@s50, @s60                                                |
| Formato y orden del informe                                       | @s56                                                           |
| El puerto: presente (se pide solo con candidatos; si lanza, @s29) | @s46, @s58                                                     |
| El puerto: ausente con / sin candidatos                           | @s57, @s53                                                     |
| El humilde lo cablea siempre, sin leer el contenido               | @s61, @s62; ciego (§3)                                         |
| Guarda anti-vacuidad del extractor nuevo                          | @s59                                                           |
| Qué NO cambia                                                     | @s1-@s45 intactos; @s57 filas 4-5; @s61 (`✓`)                  |
| Asimetría 1 (`<a>` fuera, `<link>` regla 1)                       | @s47 (`/otra-cosa/x.css`), @s55 (segunda canónica)             |
| Asimetría 2 (ficheros frente a rutas lógicas)                     | @s51 (`/NailsLashStudioWeb/x`)                                 |
| D9 extremo a extremo: ancla, control, tres sabotajes              | @s61, @s62                                                     |
| D9 rojo demostrado del lead                                       | @s63                                                           |
| D10 mutación al 100 %, solo con los unitarios                     | @s46-@s60 (§2)                                                 |

Los 16 casos límite de la spec, uno a uno:

| Caso límite                                                                              | Escenario / fila                         |
| ---------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1 la raíz, con base y sin ella                                                           | @s51 filas 1-2                           |
| 2 `x/` (no raíz) y `assets` (carpeta sin barra)                                          | @s51 (`x/`, `/x/`, `x`), @s48 (`assets`) |
| 3 la base sin su barra final como `href`                                                 | @s47 (`/NailsLashStudioWeb`)             |
| 4 caja: `FAVICON.SVG` → 2; `nailslashstudioweb` → 1                                      | @s48, @s47                               |
| 5 limpieza; `" /favicon.svg"` → 1                                                        | @s52, @s47                               |
| 6 `//cdn…` no es de esta puerta                                                          | @s53                                     |
| 7 `/\cdn…` y `/NailsLashStudioWeb\favicon.svg` → 4                                       | @s50                                     |
| 8 `?v=2` y `#x` resuelven; `&amp;` en la query → 4                                       | @s48, @s50                               |
| 9 `%2E` → 4 aunque Pages la sirva                                                        | @s50                                     |
| 10 `.`/`..` → 2                                                                          | @s48                                     |
| 11 1 byte pasa; 0 bytes → 3                                                              | @s49                                     |
| 12 sin base: con fichero pasa; sin él → 2, nunca la 1                                    | @s54                                     |
| 13 `href=""`, sin `href`, relativo o absoluto: fuera; con `href`, cuentan para la guarda | @s53, @s59                               |
| 14 `<link>` en el `<body>`                                                               | @s55 (fila `<body>`)                     |
| 15 dos páginas: la línea con la ruta de la que lo trae                                   | @s56                                     |
| 16 base sin barra final → regla 2, falla cerrada                                         | @s54 (última fila)                       |

Y la lista de «Mutantes que deben morir» de la spec («Mutación (D10)»): limpieza (extremos y tabulador dentro) →
@s52; aceptar `//` → @s53; `%`, `&` y la barra invertida, una fila por carácter → @s50; la raíz con base y sin
ella → @s51; `=== 0` → `<= 0` / `< 1` con la fila de 1 byte → @s49; `?query`/`#fragmento` → @s48 y @s50; el orden
de las reglas → @s47 (sin base y sin fichero, SOLO la 1) y @s50 (con `%` y sin fichero, SOLO la 4); el puerto
ausente con y sin candidatos → @s57; el puerto que lanza y el que no se consulta → @s58; la guarda (`.some` →
`.every`, `> 0` → `>= 0`) con la canónica sin `href` → @s59; el texto de cada regla y línea, literal → todas las
filas con línea, y @s60.
