# Verificación de las decisiones de H-5 antes de la puerta humana

> `craftsman_lead`, 2026-10-01. Workflow `h5-verificar-decisiones` (4 agentes, 0 errores): verificador de
> documentación OFICIAL (docs.github.com, vite.dev, WHATWG, RFC 3986), verificador de código y contratos,
> abogado del diablo y crítico de completitud. Entrada: `progress/brief_h5_enlaces_horneados.md` (§6).
> Lo que sigue es la síntesis del crítico; las medidas con `curl -I` sobre la web publicada las tomaron los
> verificadores el mismo día.

## Recomendación final por pregunta

### 1. ¿Qué contrato es el dueño de H-5: F-04, F-05 o una feature nueva?

**Recomendación final.** F-04 `cascaron_semantico`, ENMIENDA 5 desde @s46. Se mantiene D1, pero con dos argumentos corregidos y el coste a la vista. (i) Quitar FS-6 como argumento y contarle al humano que el registro anotó H-5 como «deuda de F-05». Si elige F-04, después hay que reetiquetar ese texto en feature_list.json:549. (ii) El puerto que lista los ficheros entra como campo OPCIONAL de `PeticionPuertaCascaron`, con el mismo precedente que `base?`. Si falta y hay al menos un `<link>` root-absoluto que comprobar, la puerta falla cerrada. Así no cambia ninguna de las 11 llamadas de puerta-cascaron.test.ts ni la del test de F-06. Si se prefiere obligatorio, hay que declarar que se toca src/lib/puerta-anclas.test.ts. Coste a presupuestar: las reglas nuevas entran en `REGLAS_DEL_CASCARON` sin las palabras 'origen' ni 'placeholder', y hay que re-mutar entero puerta-cascaron.ts (unos 500 mutantes).

**Alternativas.**

- F-05 `cero_terceros`. Solo encaja con la firma (a). Compara solo el host, así que no distingue '/favicon.ico' de '/NailsLashStudioWeb/favicon.ico'. No lee .svg ni .png. Su razón de ser es la privacidad: fallar su puerta por un 404 propio daría un motivo falso.
- F-29 nueva, con una sexta puerta. No toca puerta-cascaron.ts, ni REGLAS_DEL_CASCARON, ni el experimento head-correcto. Pero queda fuera del marco del humano («ENMIENDA aprobada», F-04 o F-05) y duplicaría la resolución bajo la base, que hoy es privada en `esEnlaceRoto`.

**Por qué.** El invariante de H-5 es la anti-404 de A-17 más la resolución bajo la base de la ENMIENDA 1, y las dos son de F-04. Su ✓ ya promete que ningún enlace interno apunta a la nada. FS-6 no prohíbe enmendar F-05 para siempre: fue una decisión acotada a F-28, la de no añadir apple-touch-icon a KEYWORDS_DE_PETICION.

**Evidencias.** Rutas relativas a C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/NailsLashStudioWeb (main, 06742d3). El código del worktree es idéntico: git diff 06742d3..5ccb9b8 solo toca progress/.

- src/lib/puerta-cascaron.ts:537 (REGLA_ENLACE_ROTO), :590-612 (esEnlaceRoto), :742-745 (ArtefactoDeProduccion), :756 (`readonly base?`), :861 (REGLAS_DEL_CASCARON).
- src/lib/puerta-anclas.test.ts:432-435: F-06 llama a `ejecutarPuertaDelCascaron({artefacto, rutasEsperadas})`.
- grep: 11 llamadas en src/lib/puerta-cascaron.test.ts.
- tsc corre dentro de lint: tsconfig.json:22 y harness.config.json:8.
- src/lib/seo.test.ts:355-356 (prohíbe 'placeholder' y 'origen').
- project-spec.md:4184: el texto completo de FS-6 dice «Deuda anotada por si un icono apunta fuera algún día».
- progress/judge_favicon_marca.md:232-235 y feature_list.json:549 («H-5, deuda de F-05»).
- src/lib/terceros.ts:303-311 (solo el host).

### 2. ¿Qué abarca la puerta?

**Recomendación final.** Todo `<link>` de todo HTML del artefacto cuyo href sea root-absoluto, sea cual sea su `rel`. Se mantiene D2, pero hay que reescribir el porqué de D5 y fijar qué cuenta como «root-absoluto».
(a) Antes de clasificar, recortar el espacio ASCII de los extremos y quitar tabuladores y saltos de línea, como hace el navegador. Decidir expresamente qué pasa con '/\'; se recomienda que falle cerrado.
(b) La violación (a) afirma solo lo que la puerta sabe: «`<link>` root-absoluto sin el prefijo de la base». Nunca «no existe».
(c) La salida de D5, «escríbelo como URL absoluta», solo vale para los `rel` de hiperenlace (canonical, alternate). Para un `rel` de petición, F-05 lo rechaza porque su allowlist es `[]`, y conviene decirlo así.
(d) La ENMIENDA tiene que decir qué extractor reutiliza. Se recomienda `ENLACE` + `ATRIBUTO_HREF`, los de la canónica, leyendo el documento entero y no solo `cabezaDe`.

**Alternativas.**

- Solo iconos (`rel` con el token icon o apple-touch-icon). Hoy son los únicos `<link>` literales de index.html. Pero Vite procesa el href de TODO `<link>` sin mirar el `rel`, así que cualquier `<link>` futuro de index.html tendría la misma firma. Además obliga a tokenizar `rel`: más código y más mutantes.
- Todos los subrecursos: `<script src>`, `<img src|srcset>`, `<source>`, `url()` del CSS. El fallback silencioso de Vite también les afecta. Pero hoy todos los `src` del artefacto son assets con hash, emitidos con la base, y el único BASE_URL del JSX es la marca. Sube el coste sin cobertura nueva.

**Por qué.** Vite trata igual el href de todo `<link>` y, si no encuentra el fichero, lo deja intacto y sin la base: filtrar por `rel` no baja el riesgo. El falso positivo en hiperenlaces es improbable, porque Google pide la canónica absoluta y las alternates «fully-qualified». Sin el recorte, ' /favicon.svg' pasaría por relativo, un falso negativo. jsdom conserva esos espacios en el artefacto, y el navegador los recorta antes de pedir el fichero.

**Evidencias.** - Vite 7.3.6, node_modules/.pnpm/vite@7.3.6…/vite/dist/node/chunks/config.js: :23280-23300 (link: srcAttributes ['href']), :24036-24038 (solo reescribe si checkPublicFile), :23972-23978 (deja la URL intacta ante ENOENT).

- src/lib/terceros.ts:86-99 (hiperenlace frente a petición) y tools/puerta-terceros.ts:100 (`allowlist: []`).
- Google, verificado hoy: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls («Use absolute paths rather than relative paths with the rel="canonical" link element») y https://developers.google.com/search/docs/specialty/international/localized-versions («Alternate URLs must be fully-qualified»).
- WHATWG URL #concept-basic-url-parser y #relative-slash-state, según el verificador de documentación.
- Medido hoy con jsdom 24.1.3, el que usa vite-react-ssg (vite-react-ssg.DsKK_1op.mjs:902-904 serializa con `jsdom.serialize()`): href=' /favicon.svg ' sale con los espacios intactos.
- dist/index.html: 11 `<link>`, 10 root-absolutos con la base, y la canónica absoluta.
- src/components/LogoAcoplado.tsx:137 y src/main.tsx:49 (únicos BASE_URL).

### 3. ¿Cómo se resuelve un href acabado en '/'?

**Recomendación final.** CAMBIAR la recomendación del brief: solo la RAÍZ del artefacto se resuelve a index.html. Es el caso del resto vacío: un href igual a la base declarada, o '/' cuando no hay base, apunta a dist/index.html.
Cualquier otro href acabado en '/' es violación y falla cerrado con su línea. También lo es el href de una carpeta sin barra final.
Hace falta un escenario explícito para la raíz y otro para '/NailsLashStudioWeb/x/'.
Hay que declarar la asimetría que queda: para `<link>` la puerta mira ficheros (D4), y para `<a>`, rutas lógicas. Por eso '/NailsLashStudioWeb/servicios' es violación en un `<link>` y válido en un `<a>`. Hoy es latente, porque RUTAS_ESPERADAS = ['/'].

**Alternativas.**

- La del brief: todo '<carpeta>/' se resuelve a '<carpeta>/index.html'. Se apoya en un comportamiento de Pages que es [NV]: no está documentado ni se ha medido, porque el sitio no tiene subcarpetas. Y daría por bueno en un `<link>` lo que la anti-404 de `<a>` ya marca como roto ('/servicios/'), así que habría que declarar ese hueco.
- Todo href acabado en '/' es violación, también la raíz. La puerta contradiría a @s37, que acepta '/NailsLashStudioWeb/' en un `<a>`: es la URL que hornea la marca.

**Por qué.** La raíz es lo único documentado (Pages busca el fichero de entrada en el nivel superior) y medido (/NailsLashStudioWeb/ → 200). Además es la misma URL que @s37 ya acepta. Para subcarpetas no hay documentación ni medida. El motivo del brief, «una canónica root-absoluta algún día», choca con la guía de Google, que pide la canónica absoluta. Fallar cerrado es coherente con la pregunta 4 y con la anti-404 de `<a>`, que ya marca '/servicios/' como roto.

**Evidencias.** - https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site: «the entry file must be at the top level». El verificador de documentación revisó los 28 artículos de /en/pages y ninguno habla del índice de las subcarpetas.

- Medido hoy con curl -I: /NailsLashStudioWeb/ → 200; /NailsLashStudioWeb → 301 a la versión con barra; /NailsLashStudioWeb/assets/ → 404; /favicon.svg → 404.
- src/lib/puerta-cascaron.ts:571-573 (quita ?query y #fragmento), :590-612 (resto vacío → '/'), :770-774 (rutaDelFichero da '/servicios', sin barra), :892 (RUTAS_ESPERADAS).
- features/cascaron_semantico.feature @s37, fila '/NailsLashStudioWeb/'.
- Guía de Google sobre la canónica, citada en la pregunta 2.

### 4. ¿Se decodifica el %-encoding del href antes de comparar?

**Recomendación final.** No se decodifica, y un href con '%' falla cerrado. Se mantiene, con tres ajustes.
(i) La violación lleva su propia causa ('%' sin resolver), con regla o valor propios. No puede reutilizar «sin fichero», porque sería una acusación falsa.
(ii) El MISMO trato para '&', es decir, las referencias de carácter: jsdom serializa '&' como '&amp;' y la puerta compara los bytes crudos.
(iii) Declararlo como falso positivo CONSCIENTE, porque Pages SÍ decodifica los %XX.
El texto de la regla no puede contener 'origen' ni 'placeholder'.

**Alternativas.**

- Decodificar antes de comparar. Coincide con lo que sirve Pages, pero obliga a tratar las secuencias mal formadas (Vite necesita su propio `decodeURIIfPossible`) y también las referencias de carácter de HTML. Es más código y más mutantes para un caso que hoy no existe.

**Por qué.** Vite decodifica el href antes de buscarlo en public/ y al reescribirlo solo escapa '%' como '%25'. La única fuente realista de '%' es, por tanto, un fichero de public/ con '%' en el nombre, y se arregla renombrándolo. Hoy hay 0 '%' y 0 '&' en los href de los `<link>`. Un falso positivo ruidoso es mejor que un falso negativo.

**Evidencias.** - config.js:2689-2711 (`partialEncodeURIPath` solo cambia '%') y :24037-24038 (`decodeURIIfPossible` y luego `partialEncodeURIPath`).

- WHATWG URL #path-state: el navegador no decodifica la ruta (verificador de documentación).
- Medido hoy con curl -I: /NailsLashStudioWeb/favicon%2Esvg → 200, así que Pages decodifica; el verificador midió también %66avicon.svg → 200.
- Medido hoy con jsdom 24.1.3: un href con '&' sale como '&amp;'.
- dist/index.html: ningún '%' en los href de los `<link>`.
- src/lib/puerta-cascaron.ts:74 (ATRIBUTO_HREF devuelve el valor crudo) y :777-779 (formato de la línea).
- src/lib/seo.test.ts:355-356.

### 5. ¿Cómo se evita que la puerta pase en verde sin haber mirado nada (guarda anti-vacuidad, D7)?

**Recomendación final.** SUSTITUIR la recomendación de partida, que queda REFUTADA, por una guarda con el molde de @s28 sobre el EXTRACTOR nuevo.

- La guarda cuenta todos los `<link>` del artefacto que tengan href, de cualquier forma y `rel`, canónica incluida. Si son 0, falla cerrada con su propio motivo.
- Va en `inspeccionarArtefacto`, después de la guarda de @s28, y no en `inspeccionarSitio`, que tiene 39 llamadas en los tests, varias con igualdad exacta.
- Se mata con un fixture cuyo único `<link>` sea `rel="canonical"` sin href.
- El ancla «el artefacto REAL trae ≥1 `<link>` root-absoluto con la base» va PRIMERO en el test build-based de D9, junto a su control.
  No cambia ningún fixture ni ningún escenario de @s1-@s45.

**Alternativas.**

- La del brief: el ayudante htmlCrudo hornea un `<link rel="stylesheet">` con su fichero. No basta por dos motivos. El control head-correcto de @s33 corre la puerta REAL sobre una app mínima sin ningún `<link>` root-absoluto, y el ayudante no llega a ese experimento. Además, @s37 con base exige `lineas` igual a `[]`, y un único href con un único fichero no vale a la vez para los tests con base y sin ella.
- Guarda sobre los `<link>` root-absolutos (0 → fallo), cambiando también la plantilla del experimento de trampas. Toca un test de @s33, y la feature (líneas 1419-1423) manda volver a la puerta humana si una guarda nace en rojo.

**Por qué.** Lo que se vigila es el extractor, no el sitio. Que haya cero `<link>` root-absolutos es un estado legítimo, como demuestra head-correcto, y para ese caso el patrón de memoria dice que la guarda «no aplica». Contando los que tienen href, canónica incluida, siempre hay al menos 1 porque F-04 exige la canónica. La guarda se puede matar porque un `<link rel="canonical">` sin href hace que `canonicaDeLaPagina` devuelva '' y no null, así que no salta «canónica ausente».

**Evidencias.** - src/lib/trampas-del-horneado.test.tsx: :22-26 (VITE_CONFIG sin base), :105-115 (index.html sin `<link>`), :206-219 (corre tools/puerta-cascaron.ts), :393-399 (`expect(codigoSalida).toBe(0)`).

- .experimentos-tmp/head-correcto/dist/index.html: su único `<link>` es la canónica absoluta.
- src/lib/puerta-cascaron.test.ts: :74-90 (htmlCrudo trae la canónica por defecto) y :979-991 (@s37 con base, `lineas` igual a `[]`).
- src/lib/puerta-cascaron.ts: :386-401 y :407-409 (sin href → ''), :489-492 (solo null acusa), :803 y :834-851 (guarda de @s28).
- .memoria-cache/patterns/testing/verde-por-vacuidad-en-puerta-de-verificacion.md, apartado «Cuándo NO aplica».
- vitest.stryker.config.ts:13-14: los tests build-based no cuentan para la mutación.

## Correcciones al brief

1. §2: el dist tiene 16 `<img src>`, no 17, y 0 srcset (medido sobre dist/index.html de las 10:12). Lo demás del inventario se confirma: 3 iconos, 1 stylesheet, 6 preload, la canónica absoluta, 1 `<script src>` y un solo `<a>` root-absoluto.
2. §2 y §5 (D4): que Vite «solo pone la base si el fichero existe» es comportamiento del CÓDIGO, no de la documentación. vite.dev dice que las referencias del .html «are all automatically adjusted», sin condición. La spec tiene que citar config.js:24038 y :23972-23978 y la medida, no los docs. Además, `vite-ignore` es otra vía a la firma (a).
3. §1: la premisa necesita un matiz. En el camino oficial, deploy-pages.yml:51 corre `node .harness/harness.mjs init` (typecheck, lint y tests, según el comentario de :49-50) ANTES de `pnpm build` (:68). H-5 es defensa en profundidad frente a una publicación manual, y eso pesa al decidir alcance y coste.
4. §4 y D1, sobre FS-6: no sirve como argumento. FS-6 (project-spec.md:4184) es una decisión de F-28 que rechazó añadir apple-touch-icon a KEYWORDS_DE_PETICION, «por si un icono apunta fuera algún día». No prohíbe enmendar F-05. El judge (judge_favicon_marca.md:232-235) y el cierre de F-28 (feature_list.json:549) anotaron H-5 como «deuda de F-05». El humano debe saberlo, y ese texto se reetiqueta después de decidir.
5. §4, F-05 (matiz): que '/favicon.ico' y '/NailsLashStudioWeb/favicon.ico' sean «propias» por igual se deduce del código (terceros.ts:303-311), no de @s18, cuya tabla no trae ningún favicon. El filtro (html|css) viene del acceptance 1 (cero_terceros.feature:2121); A-27 es la decisión sobre los binarios.
6. §4: el banner de la ENMIENDA 5 no va en la línea 1. Los banners se apilan en orden ascendente, y el nuevo va después de la línea 223, antes de «Contrato de la feature 4» (:225). La sección final llevará «@s1-@s45 (arriba) NO SE TOCAN».
7. §4 y D6, premisa incompleta: no basta con no tocar ArtefactoDeProduccion para dejar fuera a F-06. src/lib/puerta-anclas.test.ts:432-435 llama directamente a ejecutarPuertaDelCascaron, así que un campo OBLIGATORIO en PeticionPuertaCascaron rompe tsc en ese test y en las 11 llamadas de puerta-cascaron.test.ts. «Opcional = verde por vacuidad» también es falso si el campo opcional falla cerrado cuando falta y hay al menos un `<link>` root-absoluto (precedente: `base?` en puerta-cascaron.ts:756).
8. D4: hay que quitar «GitHub Pages (Linux)». Ninguna documentación oficial dice que las rutas distingan mayúsculas y minúsculas; solo lo dice del nombre index.html (troubleshooting-404 #indexhtml-file). La justificación pasa a ser la medida: FAVICON.SVG → 404 (re-medido hoy con curl -I). El argumento contra existsSync se REFUERZA. En `vite build`, initPublicFiles solo se llama desde _createServer (config.js:25445, que lanza si el comando no es 'serve'), y vite-react-ssg solo crea servidor en dev (vite-react-ssg.DsKK_1op.mjs:1077-1107). checkPublicFile cae entonces en tryStatSync (config.js:8096-8104). Resultado: en Windows un href con la caja equivocada se hornea CON la base (firma b) y en Linux SIN ella (firma a). Por eso D9 no puede aseverar una regla concreta con un sabotaje de caja.
9. D2: hay que definir qué es «root-absoluto». Antes de clasificar se recortan los espacios de los extremos y se quitan tabuladores y saltos de línea (WHATWG basic URL parser); jsdom 24.1.3 conserva ' /favicon.svg ' al serializar (medido hoy). También hay que decidir '/\x', que en http(s) se parsea como host (WHATWG relative-slash state). Sin esto hay falsos negativos.
10. D2, sobre las comillas: que ATRIBUTO_HREF solo case comillas dobles (puerta-cascaron.ts:74) es un hueco teórico. En el pipeline real todo pasa por jsdom.serialize() (vite-react-ssg.DsKK_1op.mjs:902-904), que emite comillas dobles aunque la entrada traiga simples o ninguna (medido hoy con jsdom 24.1.3). Se declara, no hace falta cubrirlo. La ENMIENDA tiene que decir qué extractor reutiliza, como ya pide la feature en sus notas de @s41 (:1682).
11. D3: el umbral de 0 bytes de la firma (c) es arbitrario: un icono truncado a 1 byte pasa. Hay que declararlo. .nojekyll (0 B) no da falso positivo: se crea después de la puerta (deploy-pages.yml:74) y nada lo enlaza.
12. D5: el porqué hay que reescribirlo como se indica en la pregunta 2. Vite procesa el href de todo `<link>` sin mirar el `rel` (config.js:23280-23300). «Escríbelo como URL absoluta» solo vale para hiperenlaces, porque F-05 rechazaría un `rel` de petición absoluto (allowlist [] en tools/puerta-terceros.ts:100). La regla (a) no dice «no existe».
13. D7 / §6 pregunta 5: queda REFUTADA (ver la pregunta 5). §7 solo revisó puerta-cascaron.test.ts y puerta-anclas. Falta src/lib/trampas-del-horneado.test.tsx:393-399, el control head-correcto de @s33, que corre la puerta real.
14. §6 pregunta 3: el motivo («algún día una canónica root-absoluta») choca con la guía de Google. La recomendación cambia a «solo la raíz»: ver la pregunta 3.
15. Reglas nuevas: entran en REGLAS_DEL_CASCARON (puerta-cascaron.ts:854-861, «TODAS las reglas») y @s34 (seo.test.ts:355-356) prohíbe 'origen' y 'placeholder' en su texto. El vocabulario del propio brief («la raíz del origen») no puede ir en ninguna regla.
16. D9 y D10: el test build-based de D9 está fuera de la mutación (vitest.stryker.config.ts:13-14). Los tests unitarios tienen que matar solos el 100 %, guarda y puerto incluidos.
17. Contradicción 1, sobre D7: el verificador de código la llamó «viable cambiando ayudantes», pero él mismo halló la colisión con head-correcto. El abogado del diablo la da por refutada. Gana el abogado: lo confirman el test (:393-399) y el HTML medido del experimento.
18. Contradicción 2, sobre checkPublicFile: el verificador de documentación dijo que compara con publicFiles.has (exacto), y por eso infirió que un href con otra caja «también saldría sin la base». El abogado del diablo dice que en build se usa tryStatSync. Gana el abogado: config.js:25445 es la única llamada y está dentro de _createServer. La inferencia del verificador solo vale con un sistema de ficheros sensible a la caja, como Linux o la CI.
19. Contradicción 3, sobre los timeouts: el abogado del diablo habla de «~501 mutantes con 6 timeouts la última vez», pero eso fue la PRIMERA corrida de la subruta (mutation_subruta_github_pages.md:34). El remate tuvo 497 mutantes y 4 timeouts (:219-224). El último verify completo (progress/current.md:85-88) lista 13 timeouts, todos en otros ficheros (placeholders, equipo-logica y resenas-logica), ninguno en puerta-cascaron.ts. La re-mutación sigue siendo un coste real, pero sin ese agravante.

## Sin verificar (ninguno bloquea la puerta)

- Filas 2 y 3 de la tabla de §2 (fichero borrado → '/favicon.svg' sin la base y exit 0; fichero de 0 B → con la base y 5 ✓). Comprobarlas exige un build, que esta tarea prohíbe. Son coherentes con el código de Vite (ENOENT → intacto; tryStatSync().isFile() es cierto con 0 B). NO bloquea: es la medida del lead, y el «rojo demostrado» de la definición de hecho la vuelve a reproducir.
- Que GitHub Pages sirva '<carpeta>/index.html' en subcarpetas, y que redirija con 301 un href de subcarpeta sin barra. No está documentado (28 artículos revisados) ni medido, porque el sitio no tiene subcarpetas; solo la raíz está medida (200, y 301 sin barra). NO bloquea con la recomendación «solo la raíz» de la pregunta 3. Si el humano elige la del brief, hay que llevarlo marcado como [NV].
- Que GitHub Pages distinga mayúsculas y minúsculas y decodifique los %XX: no está documentado, pero está medido hoy con curl -I (FAVICON.SVG → 404; favicon%2Esvg → 200). NO bloquea: las dos decisiones fallan cerradas.
- Qué hace `vite build` con un href con espacios en los extremos (' /favicon.svg'): checkPublicFile lo descarta porque exige url[0] === '/', pero lo que hace urlToBuiltUrl después no se ha medido (haría falta un build). NO bloquea: la spec solo tiene que fijar el recorte en D2.
- Que con un href de caja distinta se obtenga la firma (b) en Windows y la (a) en Linux: es una inferencia del código de Vite, sin medir. NO bloquea, porque la comparación exacta de D4 las caza las dos. Sí impide que D9 asevere una regla concreta con un sabotaje de caja.
- Las palabras literales del humano en §3 («Hecho = ENMIENDA aprobada», «F-04 o F-05»): se toman del brief y no se pueden contrastar con el mensaje original. El descarte de F-29 en la pregunta 1 depende de ellas. NO bloquea: se le pregunta al propio humano en la puerta.
- Las medidas complementarias del verificador de documentación que no repetí (/nailslashstudioweb/favicon.svg → 404 y %66avicon.svg → 404/200): repetí las demás y coinciden. NO bloquea.
- Conclusión: nada de lo que queda sin verificar bloquea la puerta humana. Eso sí, antes de llevarla hay que corregir el brief: sobre todo la pregunta 5 (refutada), la premisa de D6, el uso de FS-6 y el motivo de la pregunta 3.

¿Bloquea la puerta? **no**.

## Hechos externos (verificador de documentación oficial)

- **confirmada** — (a1) GitHub Pages documenta index.html como fichero de entrada, pero SOLO en el nivel superior de la fuente de publicación (o del artefacto de Actions). Evidencia: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#creating-your-site: «the entry file must be at the top level of the source folder». Para Actions: «the artifact that you deploy must include the entry file at the top level».
- **no_verificable** — (a2) GitHub Pages sirve <carpeta>/index.html cuando se pide una ruta acabada en '/', en cualquier carpeta. Evidencia: Revisé los 28 artículos de https://docs.github.com/en/pages (listado de /api/pagelist + /api/article/body, buscando 'index.html', 'trailing', 'slash', 'redirect' y 'directory'). Ninguno describe las subcarpetas. Lo más cercano es «Each file will be available on your site in the same directory structure» (creating-a-github-pages-site).
- **no_verificable** — (a3) Si se pide la ruta sin la barra final, GitHub Pages redirige a la versión con barra. Evidencia: No hay documentación oficial: los mismos 28 artículos de docs.github.com/en/pages solo hablan de redirecciones HTTP→HTTPS y apex↔www. [Medida complementaria, curl -I] https://cenit-digital.github.io/NailsLashStudioWeb → 301 Location https://cenit-digital.github.io/NailsLashStudioWeb/
- **confirmada** — (b1) La documentación oficial dice que el nombre del fichero index.html distingue mayúsculas y minúsculas en GitHub Pages. Evidencia: https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites#indexhtml-file: «The name of the `index.html` file is case sensitive.»
- **no_verificable** — (b2) Las rutas de GitHub Pages distinguen mayúsculas y minúsculas en general, porque se sirven desde un sistema Linux. Evidencia: Ninguna página de docs.github.com/en/pages lo afirma. La única sección sobre Linux, «URL formatting on Linux» (troubleshooting-custom-domains-and-github-pages), trata de guiones en el nombre de usuario. La frase «GitHub uses a case sensitive file system» está en https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners y se refiere a CODEOWNERS, no a Pages.
- **confirmada** — (c1) Según el estándar URL de WHATWG, el navegador NO decodifica el %-encoding de la ruta. Lo codifica con el conjunto de la ruta (por ejemplo, espacio → %20) y deja intactos los %XX existentes. Excepción: '%2e' cuenta como segmento punto. Evidencia: https://url.spec.whatwg.org/#path-state: «UTF-8 percent-encode c using the path percent-encode set». #path-percent-encode-set incluye el espacio a través del query percent-encode set. #single-dot-path-segment: «"." or an ASCII case-insensitive match for "%2e"». Según el índice de definiciones, «percent-decode» solo se usa en hosts (§3.5), en §1.3, §4.8.3 y en formularios (§5.1), nunca en el parseo de la ruta.
- **no_verificable** — (c2) GitHub Pages, o un servidor estático típico según WHATWG, decodifica el %-encoding antes de buscar el fichero. Evidencia: WHATWG URL no regula el servidor. La norma IETF RFC 3986 §2.4 (https://www.rfc-editor.org/rfc/rfc3986.txt) dice que los componentes se separan «before the percent-encoded octets within those components can be safely decoded», y §2.3 declara equivalentes los %XX de caracteres no reservados. docs.github.com no dice nada al respecto. [Medida complementaria, curl -I] /NailsLashStudioWeb/favicon%2Esvg → 200 y /NailsLashStudioWeb/%66avicon.svg → 200.
- **confirmada** — (c3) En este stack, Vite decodifica el href con decodeURI antes de buscarlo en public/ y, al reescribirlo con la base, solo escapa '%' como '%25'. Evidencia: Código de Vite 7.3.6 instalado (no documentación): C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/NailsLashStudioWeb/node_modules/vite/dist/node/chunks/config.js:24037-24038 (decodeURIIfPossible(attr.value) → checkPublicFile → partialEncodeURIPath) y config.js:2699-2711 (partialEncodeURIPath: filePath.replaceAll("%", "%25")).
- **refutada** — (d1) La documentación oficial de Vite dice que la base solo se antepone a las URL root-absolutas de index.html si el fichero existe en public/, o algo equivalente. Evidencia: https://vite.dev/guide/build#public-base-path: «asset references in your `.html` files are all automatically adjusted». No hay condición ni mención a ficheros inexistentes. Lo mismo en https://vite.dev/guide/assets#the-public-directory y https://vite.dev/config/shared-options#publicdir. https://vite.dev/guide/features#html lista `<link href>` entre los procesados y ofrece `vite-ignore` como exclusión.
- **confirmada** — (d2) Vite deja el href root-absoluto intacto, sin la base y sin avisar, cuando el fichero no está en public/ ni existe en la raíz del proyecto. Evidencia: Código de Vite 7.3.6: config.js:24038 (solo reescribe con la base si checkPublicFile) y config.js:23972-23978 (processAssetUrl: si urlToBuiltUrl lanza ENOENT, devuelve url$3 sin cambios). config.js:8096-8104: checkPublicFile hace publicFiles.has(fileName), comparación exacta de cadenas. config.js:24085: solo avisa en <link> CSS («doesn't exist at build time, it will remain unchanged»).
- **confirmada** — (d3) vite-react-ssg no documenta ninguna reescritura propia de los <link href> respecto a la base. Evidencia: https://github.com/Daydreamer-riri/vite-react-ssg (README, §Public Base Path): «Vite React SSG will give it to the react-router's `basename`». Es el repositorio que declara node_modules/vite-react-ssg/package.json:10-12.
- **confirmada** — (e1) En un <link href>, '//x' es una URL relativa al esquema, es decir, de OTRO host. '/x' es path-absolute: conserva el esquema y el host del documento. Evidencia: https://url.spec.whatwg.org/#scheme-relative-url-string: «must be "//", followed by an opaque-host-and-port string». #path-absolute-url-string: «must be U+002F (/), followed by zero or more URL-path-segment strings». MDN https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL: «Scheme-relative URL… only the protocol is missing».
- **confirmada** — (e2) En http(s), '/\x' también se parsea como host, igual que '//x'. Además, antes de parsear se eliminan los tabuladores y saltos de línea y se recortan los espacios de los extremos. Evidencia: https://url.spec.whatwg.org/#relative-slash-state: «If url is special and c is U+002F (/) or U+005C (\)» → special authority ignore slashes. #concept-basic-url-parser: «Remove all ASCII tab or newline from input». https://html.spec.whatwg.org/multipage/semantics.html#attr-link-href: «valid non-empty URL potentially surrounded by spaces».
- **confirmada** — (e3) Un elemento <base href> cambia la resolución de los <link href> root-absolutos, incluido el host. Evidencia: https://html.spec.whatwg.org/multipage/semantics.html#create-a-link-request: «encoding-parsing a URL given options's href, relative to options's base URL». Esa base es la «document base URL», que según https://html.spec.whatwg.org/multipage/urls-and-fetching.html#document-base-url es la del primer elemento base con href.
