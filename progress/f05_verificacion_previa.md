# F-05 — Verificación previa al contrato (lead, 2026-07-17)

> **Qué es esto.** Las 8 afirmaciones que iban a sostener el contrato de `cero_terceros`,
> verificadas **contra fuente primaria antes de escribir una línea de spec**. Es la lección de
> F-03 y F-04 aplicada por delante.
>
> **Método:** 16 subagentes (8 afirmaciones × verificar + refutar adversarialmente), **799.301
> tokens**, 285 llamadas a herramienta, **0 errores**. Diario:
> `.claude/…/subagents/workflows/wf_17bf7527-b46/journal.jsonl`
>
> **Resultado: 0 refutadas de raíz, 8 de 8 con algo tumbado (`resiste: false` en las ocho).**
> **Ninguna decisión de F-05 cae. Lo que cae son los PORQUÉS, y uno de ellos es la
> `puerta_legal` entera.** El patrón de F-04, otra vez y más fuerte: *la decisión es correcta,
> el porqué escrito es falso.*

---

## 0. La bomba: el criterio de aceptación de F-05 es INSATISFACIBLE

**Medido antes de investigar nada**, sobre el `dist/` real de HEAD:

```
$ grep -roh "https\?://[^\"' )>]*" dist/ | sort | uniq -c | sort -rn
      7 http://www.w3.org/1999/xlink
      5 http://www.w3.org/2000/svg
      3 http://www.w3.org/XML/1998/namespace
      3 http://www.w3.org/1998/Math/MathML
      2 https://schema.org
      2 https://react.dev/errors/
      1 https://www.facebook.com/nailslashstudiorozas/
      1 https://example.invalid/
      1 https://example.invalid
      1 http://fb.me/use-check-prop-types
```

**Diez orígenes externos en el artefacto de hoy. Ni uno solo es una petición a un tercero.**
Cuatro son **namespaces XML dentro del bundle de React**; dos son URLs de **mensajes de error**
de React; `schema.org` es el `@context` del JSON-LD de **F-04**; `example.invalid` es la
canónica (TLD reservado RFC 2606, deliberado).

> 🔴 **CORREGIDO 2026-07-17 — este párrafo tenía un ERROR DE HECHO propio, cazado por la revisión
> adversarial del contrato y remedido por el lead.** Decía: *«Facebook es un `<a href>` de
> `site.ts`»*. **Es falso.** Medido:
>
> ```
> $ grep -rlo "facebook" dist/          →  dist/assets/app-BPAduMZD.js   (SOLO el bundle)
> $ grep -o "<a[^>]*facebook[^>]*>" dist/index.html   →  (nada)
> ```
>
> **No hay ningún `<a href>` a Facebook en `dist/index.html`**: el sitio **todavía no tiene pie**
> (lo monta F-06). La URL está **solo en el bundle JS, como literal de cadena** —
> `facebook: "https://www.facebook.com/nailslashstudiorozas/"` — porque `home.tsx` importa
> `site.ts` **estáticamente** y Rollup inlinea el objeto `REDES`. Es decir: cae en **la misma
> categoría que `react.dev/errors/`** — literal inerte en un `.js`, **no** un hiperenlace.
>
> **La conclusión no cambia, se refuerza**: no es una petición, y `detectarOrigenesExternos` no
> debe marcarlo. **Lo que cambia es el porqué** — y es, otra vez, el patrón que esta verificación
> existe para cazar: *la decisión es correcta, el porqué escrito es falso*. Esta vez el porqué
> falso **era mío**.
>
> **Consecuencia para el contrato:** el escenario del `<a href>` a Facebook sigue siendo válido
> **como contrato de futuro** (F-06 montará el pie con ese enlace y entonces sí será un `<a>`),
> pero **NO describe el `dist/` de hoy** y no puede presentarse como tal.

`feature_list.json` §5 exige literalmente: *«El build falla si el artefacto contiene **CUALQUIER**
origen externo»* con *«allowlist vacía»*. **Escrito así, la puerta no se puede satisfacer jamás:
no se puede borrar `http://www.w3.org/2000/svg` del bundle de React.** Y rompería **F-04, que
está `done`**.

→ **A-23**, abajo. Es un error de hecho del troceado, hermano del `@s32` de F-04.

---

## 1. A1 — Qué provoca una petición y qué no · **el corazón de la feature**

**La distinción EXISTE, es enumerable, y el HTML Living Standard la nombra él mismo**: clasifica
los `<link>` en **external resource link** frente a **hyperlink**. Literal (§4.6.1):

> «These are links to resources that are to be used to augment the current document, generally
> automatically processed by the user agent. **All external resource links have a fetch and
> process the linked resource algorithm** which describes how the resource is obtained.»

> «These are links to other resources that are **generally exposed to the user** by the user
> agent **so that the user can cause the user agent to navigate** to those resources…»

Las cuatro preguntas que deciden F-05, con cita y todas dando **NO**:

| Construcción | ¿Pide? | Fuente primaria |
| --- | --- | --- |
| `<link rel=canonical href=…>` | **NO** | §4.6.8.4: «This keyword creates **a hyperlink**». Tabla normativa: `canonical — Effect on link: Hyperlink` |
| `<a href="https://facebook.com/x">` | **NO** antes del clic | Solo se piden al *follow the hyperlink* — acción del usuario |
| `xmlns="http://www.w3.org/2000/svg"` | **NO** | *Namespaces in XML* §3: «**It is not a goal that it be directly usable for retrieval** of a schema» |
| `"https://react.dev/errors/"` en un `.js` | **NO** | Un literal de cadena no es construcción de fetch. Medido: `react/cjs/react.react-server.production.js:14` lo concatena en un mensaje de error |

### 🔴 El refutador encontró un FALSO NEGATIVO en la regla propuesta

El verificador dedujo *«`rel=alternate` es Hyperlink, luego no detectar»* **de la fila-resumen de
la tabla**. La letra que la desarrolla lo contradice. §4.6.8.1:

> «If the element is a link element and the rel attribute **also contains the keyword
> stylesheet** […] The alternate keyword **modifies the meaning of the stylesheet keyword** […]
> **The alternate keyword does not create a link of its own.**»

Y §4.6.8.23: «stylesheet […] **creates an external resource link**».

→ **`<link rel="alternate stylesheet" href="https://cdn.tercero.com/x.css">` SÍ SE PIDE.** La
regla del verificador habría dejado pasar **una petición real a un tercero**. Y era su propia
trampa nº1 («rel es lo que decide»), sin aplicar hasta el final: se quedó en el valor, no llegó a
las *keywords*.

> **REGLA que F-05 escribe por esto:** la clasificación se hace sobre el **conjunto tokenizado**
> de `rel` (tokens separados por espacio, ASCII case-insensitive), **nunca sobre la cadena
> completa ni sobre un solo token**. La tabla de §4.6.8 es un **resumen**; cuando la sección del
> keyword desarrolla su significado, **manda la sección**.

Segundo hallazgo del refutador, con letra normativa: `<link rel=stylesheet **disabled**>` **NO se
pide** — §4.6.8.23, *linked resource fetch setup steps*: «If el's disabled attribute is set, then
return false». Marcarlo sería **falso positivo sostenido por spec**.

### Los dos ejes que la spec NO decide → **criterio de proyecto, y se declara**

1. **`preconnect` / `dns-prefetch`**: son *external resource* pero **no descargan recurso** —
   abren TCP/TLS o resuelven DNS. Si el eje de F-05 es «contacto con origen externo sin acción
   del usuario», **cuentan**; si es «petición HTTP de un recurso», no. **Hay que elegir uno y no
   mezclarlos.**
2. **`url()` en reglas CSS NO aplicadas**: **solo `@font-face` tiene letra normativa**
   (css-fonts-4 §4.8.1: «user agents **must only download** those fonts that are referred to
   within the style rules applicable to a given page»). Para `background-image` **ninguna spec
   dice CUÁNDO se pide** — css-values-4 §4.5.4 y css-images-4 §2.3 solo definen **CÓMO**. Que
   Chrome no lo pida es **comportamiento observado, NO letra**. Un analizador estático no puede
   evaluar qué reglas aplican → criterio conservador: **marcarlo**, y declararlo como decisión de
   proyecto, no como exigencia de spec.

**`<base href>` es un MODIFICADOR, no un origen**: no pide nada, pero un
`<base href="https://cdn.tercero.com/">` convierte `<img src="a.png">` en una petición a un
tercero. **Hay que resolver contra `base` antes de clasificar.**

---

## 2. A2 — El JSON-LD de F-04 no es una petición · **y la cita era FABRICADA**

**La razón correcta, y la única que hace falta** — HTML Standard, literal:

> «Setting the attribute to any other value means that the script is **a data block, which is not
> processed by the user agent**, but instead by author script or other tools.»

Un `<script type="application/ld+json">` **el navegador ni lo parsea**. `schema.org` en el
`@context` **no puede originar conexión alguna desde el equipo del usuario**.

### 🔴 Dos fallos graves del verificador

1. **CITA INEXISTENTE.** Presentó como literal de la spec JSON-LD 1.1 API: *«Set context document
   to the RemoteDocument obtained by dereferencing context using the LoadDocumentCallback.»*
   **Esa frase no existe.** El texto real (paso 5.2.5) empieza con **«Otherwise,»** — es la rama
   **else** de 5.2.4. Al borrar el «Otherwise» y recapitalizar, **convirtió una rama condicional
   en un mandato incondicional**, que era justo su tesis. Parafraseo vendido como cita.
2. **CAUSA FALSA, medida.** Dijo que `schema.org` viaja en el bundle *«porque el componente
   re-renderiza en hidratación»*. **Falso y la hidratación es irrelevante**: `home.tsx:3` importa
   `construirJsonLd` de `../lib/seo` con un import **estático**, así que Rollup mete el módulo en
   el grafo de cliente e inlinea la constante (`const Wi="https://schema.org"`). **Estaría ahí
   aunque no hubiera hidratación jamás.** Es un hecho del grafo de imports, no del ciclo de vida
   de React.

**Quien puede dereferenciar el `@context` es un PROCESADOR JSON-LD** (Googlebot, un validador,
`jsonld.js`) — **nunca el navegador que renderiza**, y solo si no lo tenía ya dereferenciado.
Invariante complementaria **real**: prohibir cargar en cliente cualquier librería que ejecute el
Context Processing Algorithm. **Medido: este repo no carga ninguna.**

---

## 3. A3 — Las fuentes · **el diseño NO usa las del base**

**Medido sobre el prototipo (`Opcion-1-Rosa.dc.html`), no heredado:**

| Familia | Uso real | Pesos |
| --- | --- | --- |
| **Manrope** | cuerpo, botones, nav | 400, 500, 600, 700 |
| **Gilda Display** | todos los `h2`/`h3`, precios | 400 |
| **Great Vibes** | el «Nails Lash» del hero | 400 |

`font-weight: 300` → **0 ocurrencias**. El prototipo pide `Manrope:wght@300;400;500;600;700` y
**el 300 no se usa jamás**. La afirmación heredada es **CIERTA, y ahora medida**.

> 🔴 **`@fontsource/dm-sans` y `@fontsource/outfit` están en `package.json` y NO se importan en
> ningún sitio.** Son **herencia muerta de WebEmpresa**. Es la lección «no copiar del base»
> mordiendo **por tercera vez**: F-03 los tokens, F-04 el JSON-LD, F-05 las fuentes.

**Verificado instalando de verdad** (npm 5.2.8; las tres familias existen; OFL-1.1 permite
autohospedar: «to use, study, copy, merge, embed, modify, redistribute»):

- **Las rutas exactas, y son las únicas válidas**: `@fontsource/manrope/latin-400.css`,
  `latin-500.css`, `latin-600.css`, `latin-700.css`,
  `@fontsource/gilda-display/latin-400.css`, `@fontsource/great-vibes/latin-400.css`.
  **6 imports, 6 woff2, 119.540 bytes medidos.**
- **TRAMPA INVERSA a la del encargo**: `import '@fontsource/manrope'` **no** trae todos los
  pesos — trae **solo el 400, en los 6 subsets**. Faltarían 500/600/700 **en silencio** (faux-bold
  sintético, sin error en consola). Y `400.css` **también** trae los 6 subsets. **Solo
  `latin-400.css` trae uno** (medido: 1 `@font-face`, 0 `unicode-range`).
- **`font-display: swap` sale por defecto: 176/176 `@font-face`**, y es el único valor presente.
  **Pero es un hecho MEDIDO, no documentado** — la doc oficial no lo menciona; un bump de versión
  podría cambiarlo sin romper promesa escrita. → **la puerta lo mide, no se fía.**
- **0 referencias a `googleapis`/`gstatic`** en todo el árbol de los paquetes.
- **NO usar `@fontsource-variable`**: solo existe para Manrope (las otras dos dan **404**), **no
  tiene `latin.css`** (así que en variable no se puede importar solo-latin y `dist` se comería los
  6 subsets), y **renombra la familia a `'Manrope Variable'`** → si el SCSS sigue diciendo
  `'Manrope'`, **la fuente no carga y cae al fallback sin ningún error**. Es el fallo silencioso
  más caro de la lista.
- **Cada `@font-face` emite `woff2` Y `woff`**: `url(…woff2) format('woff2'), url(…woff)
  format('woff')`. **Vite emite los dos** → 12 ficheros en `dist` para 6 usados. Coste de `dist`,
  no de red.
- **`latin-400.css` NO tiene `unicode-range`** → ese `@font-face` **aplica a TODO el rango**. Si
  aparece un carácter fuera del subset latin, el navegador **no cae a la siguiente fuente**: pinta
  **tofu**, sin error. El latin cubre `U+0000-00FF` (ñ, vocales acentuadas, ¿, ¡) → suficiente
  para español; **pero un nombre con `Ł`, `ř`, `ğ` daría tofu**. → **A-28**.

---

## 4. A4 — Vite · **dos hechos que cambian el diseño de la puerta**

El mecanismo central **es cierto y está medido**: un `url()` de un CSS de `node_modules` se
resuelve, el `.woff2` se emite a `dist/assets` con hash, y el CSS final apunta al propio
artefacto. **Pero:**

### 🔴 (1) Vite 7 NO exime a las fuentes del inlining

`build.assetsInlineLimit` = **4096 B** por defecto (doc oficial + `logger.js:223`). Verificado en
el código instalado (`config.js:8815-8832`, `shouldInline`): **el único opt-out por extensión es
`.html` y `.svg` con `#`**; `noInlineRE` es solo el query `?no-inline`. Medido con `grep -rn
'woff' node_modules/vite/dist/node/*.js` → **cero resultados: Vite 7 no menciona woff en ninguna
parte de su lógica de assets.**

> Un `.woff2` de <4096 B se convierte en `data:font/woff2;base64,…` y **NO deja fichero en
> `dist/assets`**. Hoy no ocurre **solo porque el `.woff2` más pequeño mide 6.192 B**. Es un
> **hecho de tamaño, no una garantía.**

**→ La puerta NO debe asumir que existe fichero `.woff2` en disco.**

### 🔴 (2) `base` es la vía nº1 por la que un tercero entra sin que nadie lo escriba

Medido con un build real: `base: 'https://cdn.evil.example/x/'` reescribe **todos** los `url()`:

```
url(https://cdn.evil.example/x/assets/outfit-latin-400-normal-BGsTXAXT.woff2)
```

**Un solo campo de config —o `--base` por CLI, o el hook `experimental.renderBuiltUrl`— invalida
el «nunca externo», y ningún grep del CSS lo anticipa.**
**→ La puerta debe aseverar la CONFIG, no solo la salida.**

### Otros hechos medidos

- **La ruta es ROOT-ABSOLUTA** `url(/assets/…woff2)`, **no relativa**. Una puerta que exija
  `url(./…)` da falso negativo. (`vite.config.ts` no declara `base` → `base = '/'`.)
- `build.sourcemap` = `false` por defecto; medido: **no hay `.map` ni `sourceMappingURL`** en el
  `dist` real.
- **Bug real de `vite-react-ssg` 0.9.0** (`vite-react-ssg.DsKK_1op.mjs:192-199`): su
  `renderPreloadLink` etiqueta `type: "font/woff2"` **también para `.woff` y `.ttf`**. Si F-05
  acabara generando preloads de `.woff`, el `type` sería falso.

> **La aserción fuerte y correcta es NEGATIVA y por lista blanca de esquemas:** ningún `url()`
> del CSS de `dist` puede tener esquema `http(s)` — solo rutas `/assets/…` o `data:`.
> **NO grepear `https?://` sobre `dist/assets/*.js`** (falsos positivos garantizados: `fb.me`,
> `react.dev`, los namespaces de `w3.org`) **ni sobre `dist/*.html`** (`example.invalid`).

---

## 5. A5 — Fashion ID · **el ap. 85 afirma Y LUEGO limita**

El verificador escribió que *«el 85 NO es refuerzo: es precisamente el que LIMITA»*. **Falso de
hecho**, y el refutador lo cazó citando el XHTML oficial de CELLAR: el ap. 85 es la **respuesta
dispositiva** a la segunda cuestión y su **primera frase afirma** el estatus:

> «…the operator of a website, such as Fashion ID, that embeds on that website a social plugin
> causing the browser of a visitor to that website to request content from the provider of that
> plugin and, to that end, to transmit to that provider the personal data of the visitor **can be
> considered to be a controller** […] **That liability is, however, limited to** the operation or
> set of operations […] in respect of which it **actually determines the purposes and means**…»

**El verificador citó solo la segunda frase y ocultó la primera** — el pecado que él mismo
enunciaba, cometido al revés.

**Lo que esto significa para F-05:**

- Citar «84-85» para la corresponsabilidad **no es error de atribución**. El error es citarlos
  **truncados**: quien cite el 85 **debe reproducir su segunda frase**.
- **`jointly` (corresponsabilidad) aparece SOLO en el ap. 84.** El 85 y el fallo p.2 dicen solo
  «can be considered to be a controller».
- **La analogía fuente ↔ botón social es NUESTRA `[I]`, no de la sentencia**: medido sobre 64.423
  caracteres, `font`/`typeface` = **0 ocurrencias** en EN, `tipograf` = **0** en ES.
- **Autohospedar es una TÉCNICA SUFICIENTE (criterio de proyecto)**, no una obligación. F-05 **no
  puede escribir «Fashion ID obliga a autohospedar»**.
- 🔴 **F-05 NO DEBE prohibir ni condicionar el `<a href>` a Facebook de `site.ts:47` invocando
  Fashion ID.** El predicado fáctico del ap. 27 es la transmisión **automática** «regardless of
  whether or not he or she … **has clicked**». `hyperlink` = 0 ocurrencias en la sentencia.
- No citar «art. 2(d) Directiva 95/46» como derecho aplicable hoy: **derogada**; vigente RGPD
  art. 26.

---

## 6. A6 — 🔴 **LA `puerta_legal` DE F-05 ES UNA ATRIBUCIÓN NORMATIVA FALSA**

Es el hallazgo más grave de la sesión. `feature_list.json` §5 dice:

> `"puerta_legal": "RGPD (evita el análisis de corresponsabilidad de Fashion ID) + art. 22.2 LSSI
> (sin cookies → sin banner)"`

y la descripción: *«elimina banner, CMP y política de cookies **de un plumazo**»*.

### (a) La cita de la AEPD: **CONFIRMADA**

La Guía de cookies que sirve hoy la URL canónica **es la de MAYO 2024** (portada: «Guía
actualizada en mayo 2024»), y la cita de §4.1 pág. 31 **es literal** — con dos elisiones que
importan y que hay que restituir: el original dice «todas las cookies **utilizadas desde su página
web**» y remite a una lista **cerrada** de finalidades («**enumeradas más arriba**»).

### (b) El eje LSSI: **REFUTADO EN SU FORMA ESCRITA**

**El art. 22.2 LSSI no dice «cookies».** Regula «**dispositivos de almacenamiento y recuperación**
de datos en equipos terminales», y está redactado como **permiso condicionado**, no como
prohibición.

**MEDIDO 2026-07-17:** ni `fonts.googleapis.com` ni `fonts.gstatic.com` devuelven `Set-Cookie`;
el `.woff2` devuelve **`Cache-Control: public, max-age=31536000`**.
→ **«Google Fonts no almacena nada en el equipo» es FALSO como hecho.**

¿Se activa el 22.2 por ese cacheo? **NO_VERIFICABLE, y en los DOS sentidos:**

- **A favor:** CEPD, Directrices 2/2023 v2.0, párr. 50 («does constitute storage, at the very
  least through the caching mechanism») — pero dicho de *tracking pixels*, y sobre el art. 5(3)
  ePD, cuya letra es **disyuntiva** («storage **or** the gaining of access»).
- **En contra:** la transposición española y **la propia AEPD** lo formulan en **conjuntivo y con
  finalidad** — Guía §1 pág. 8: «tecnologías similares utilizadas … **para almacenar y recuperar
  datos** de un equipo terminal»; §2.1 pág. 11: «…**con la finalidad de almacenar información y
  recuperar la información ya almacenada**». **La caché de un `.woff2` almacena pero no recupera
  datos del terminal.**
- **No hay pronunciamiento de AEPD ni CEPD sobre CDNs de fuentes.**

**Lo único que se sostiene sin inferencia:** *el art. 22.2 **no obliga a poner banner por cargar
una fuente*** — o porque no entra en su ámbito, o porque entraría en la excepción del párrafo 3.º.
**En ninguna rama justifica F-05.**

### (c) El eje RGPD: **NO_VERIFICABLE HOY EN FUENTE PRIMARIA**

El verificador declaró que el motivo válido era Fashion ID y que *«no depende de ninguna
inferencia discutible»*. **Su propio scratchpad prueba que nunca pudo abrir la sentencia**:
`c40-17-es.html` = **0 bytes**; cuatro ficheros de curia de **exactamente 130.226 bytes** (el
mismo shell SPA, con `count('Fashion ID') == 0`).

El refutador lo reintentó hoy: **EUR-Lex devuelve HTTP 202 / 2.035 B de challenge AWS-WAF** en las
tres variantes; `publications.europa.eu` da **404** sobre el `cellar:`; curia sirve shell JS.

Y **el propio repo ya lo tenía resuelto y marcado**: `docs/research/legal-rgpd.md:410-416` dice
literalmente que el salto botón social → fuente tipográfica es «**una analogía razonada, no un
pronunciamiento**… **Un tribunal podría distinguir ambos casos. [I]**», y `:575` lo tabula como
«discutible [I]».
→ **El verificador degradó una inferencia ajena a «inferencia» y ascendió la suya a certeza.**

> ### La justificación correcta de F-05 es **CRITERIO DE PROYECTO, no una norma**
>
> «Autoalojamos las fuentes para que el sitio **no haga ninguna petición a dominios de
> terceros**; así **ningún tercero recibe la IP del visitante** y **no hace falta ningún análisis
> jurídico** sobre corresponsabilidad.»
>
> Es decisión del editor, **es suficiente por sí sola, y no cuelga de ninguna cita.**

**PROHIBIDO en contrato y Gherkin:** «obligatorio» sin sujeto · «lo exige la AEPD» · «art. 22.2
LSSI» como justificación · «sin cookies → sin banner» · «elimina banner, CMP y política de
cookies» · «Google Fonts no pone cookies → fuera del 22.2» · «autoalojar = cero almacenamiento»
(**es cero terceros**; el `.woff2` propio **también** se cachea).

→ **A-24.**

---

## 7. A7 — Stryker · **el criterio de aceptación pide un mutante que NO EXISTE**

### 🔴 `.includes` NO es mutado por Stryker 9.6.1

Verificado por **dos vías independientes**: (a) `grep` de `'includes'` sobre los mutadores
instalados → **salida vacía**; el mapa `replacements` de `method-expression-mutator.js:4-27` tiene
**22 claves y ninguna es `includes`**; (b) la página oficial **no contiene la palabra «includes»**.

`.some` **solo** existe como destino de `every`→`some` y origen de `some`→`every`. De los métodos
del encargo solo se mutan: `endsWith`⇄`startsWith`, `every`⇄`some`, `filter`→(eliminado),
`toLowerCase`⇄`toUpperCase`.

> El criterio *«Mutar la comparación de origen o el predicado de allowlist rompe un test»* es
> **INMEDIBLE tal cual**: nombra «el predicado» sin decir **qué mutador** lo ataca. → **A-23**.

**Y el propio verificador fabricó un número**: dijo «19 mutadores». Medido por el refutador: el
registro autoritativo `allMutators` (`mutate.js:17-34`) da **exactamente 16**. El directorio tiene
20 ficheros `.js` y 17 `*-mutator.js` (uno de ellos, `node-mutator.js`, **es la interfaz base, no
un mutador**). **Ninguna lectura da 19.** Y «la lista oficial coincide» es falso: la página lista
17 encabezados e incluye `Checked Statement` y `Assignment Expression`, **que son de
Stryker.NET/Stryker4s, no de StrykerJS**.
→ **Para decidir qué se muta en este repo, la fuente es el código instalado, no la página.**

### La trampa de la allowlist vacía, medida ejecutando node

Sobre la forma `origenes.filter(o => !allowlist.includes(o))` con `allowlist = []`:

| Mutante | ¿Equivalente con `[]`? | Cómo se mata |
| --- | --- | --- |
| **FilterRemoval** (`.filter(p)` → `origenes`) | **SÍ** | allowlist **no vacía** que tape un origen **realmente presente** |
| **ArrayDeclaration** (`[]` → `["Stryker was here"]`) | **SÍ** | que **no haya literal `[]`** en el fichero mutado |
| **BooleanLiteral** (quitar el `!`) | **NO** — devuelve `[]` en vez de la lista | cualquier test con ≥1 origen detectado |

🔴 **`ArrayDeclaration` sobre `[]` es CONTRAINTUITIVO**: sobre array **no vacío quita** elementos;
sobre array **vacío lo RELLENA** con `["Stryker was here"]`. Quien asuma que `[]`→`[]` (no-op, sin
mutante) **se equivoca: el mutante existe siempre**.

🔴 **Quitar el `!` NO es equivalente. Excluirlo sería FRAUDULENTO.**

### Lo que es NECESIDAD y lo que es TÉCNICA SUFICIENTE (el refutador separó los ejes)

- **NECESIDAD, y es lo único necesario:** la allowlist **debe entrar como PARÁMETRO**. Si se
  cablea (`const ALLOWLIST = []` dentro del fichero mutado), **ningún test puede pasar una no
  vacía** y `FilterRemoval` es **genuinamente inmatable**.
- **TÉCNICA SUFICIENTE (una entre varias, NO una necesidad):** que no haya literal de array en el
  fichero → parámetro **sin default**, y que el `[]` lo pase **el test** (los tests no se mutan).
  **No es la única salida**: `array-declaration-mutator.js:13-15` solo dispara sobre
  `isArrayExpression()` o un callee llamado exactamente `Array`, así que un default
  `new Set<string>()` **tampoco** genera el mutante. Un default `= []` es **la peor** opción: el
  literal sigue ahí y el mutante resucita.
- **Lo que mata a `FilterRemoval` NO es el diseño del parámetro, sino el ESCENARIO** (allowlist no
  vacía que tape un origen presente). **Son dos cosas independientes; el verificador las soldó en
  una cadena causal falsa.**
- **«INALCANZABLE» era demasiado fuerte**: medido, `ArrayDeclaration` **muere** con un fixture cuyo
  origen sea el token literal `Stryker was here`. Redacción honesta: *«con default `= []` el 100 %
  solo se alcanza con un fixture grotesco»*.
- **«Exactamente dos equivalentes» es una PREDICCIÓN, no una medición**: el fichero de F-05 **no
  existe** (`grep -rln "allowlist|detectarOrigenes" src/` → nada). Otra implementación tendrá otro
  conjunto.

### Escenarios que el `.feature` necesita SÍ O SÍ

`@s-filter` (mata FilterRemoval) · `@s-allowlist-vacia` (contrato base; **necesario pero NO
suficiente**) · `@s-negacion` (mata el `!`) · `@s-allowlist-no-tapa` · `@s-comparacion-exacta`
(mata EqualityOperator y StringLiteral) · y **condicionales al diseño**: `@s-normalizacion` (solo
si se usa `.toLowerCase()`), `@s-startsWith`, `@s-regex-anclas` (precedente medido: en F-03 el `^`
fue **el único superviviente real del repo**).

**Higiene de medición, no negociable** (`docs/verification.md`): añadir el fichero a la lista
`mutate` de `stryker.config.json:18-26` · todo cálculo **dentro del `it`**, nunca en el `describe`
(`perTest`) · leer `# timeout` y `tests per mutant` **antes** que el score · **una sola tanda** de
Stryker a la vez · acotar con `--mutate <fichero>`, **jamás** con `--testFiles`.

---

## 8. A8 — La arquitectura de la cuarta puerta · **CONFIRMADA, con un matiz que importa**

Patrón confirmado y literal: **humble object** — decisor puro en `src/lib/puerta-<X>.ts` que
devuelve `{codigoSalida, lineas}`; adaptador con `node:fs` en `tools/`, que **no decide nada**,
imprime `  ✗ <linea>` por stderr, `✓ …` por stdout si exit 0, y hace
`process.exit(resultado.codigoSalida)`. `CODIGO_EXITO = 0` / `CODIGO_FALLO = 1`. try/catch →
`CODIGO_FALLO` + «la puerta … no pudo completar …: ${motivoDelReventon(error)}». Todo en español,
camelCase, constantes en SCREAMING_SNAKE. Se encadena en `build`, **nunca en `dev`**.

### 🔴 El refutador tumbó «las tres comparten un patrón exacto»: **es 2 de 3**

**F-03 NO tiene interfaz de puerto ni ningún `existe*`**: su puerto es **un campo suelto** en la
petición — `readonly leerScss: () => string`, con contrato de **una sola mitad** («LANZA si el
fichero no existe, que es lo que hace `readFileSync`»).

> **El `existe*` es CONDICIONAL, no dogma:** solo hace falta cuando la puerta necesita
> **distinguir «el artefacto no está» de «el artefacto está y está mal»** para informar por la
> rama correcta. F-03 no lo necesita porque un SCSS ausente ya se informa bien por el catch.
> **Prescribírselo a F-05 a ciegas sería atribuir a un «patrón» algo que el patrón no dice.**
> Y sin un escenario que exija esa línea distinta, `existe*` es **producción sin test rojo y
> mutante inmortal**.

**Lo INVARIANTE, y lo único que se copia sin pensar:** el contrato del puerto va **escrito junto al
puerto**, y **el doble del test lo honra** (lanza donde el real lanza).

Otro matiz: «los `tools/` no llevan tests» es falso como enunciado general —
`src/lib/diferidos.test.ts:89-96` **sí** testea `tools/puerta-placeholders.ts` leyéndolo con
`readFileSync`. La forma correcta: *no llevan **fichero de test propio** ni entran en `mutate`;
cuando una **decisión** vive en el humilde, se ancla desde un test que lee el fichero*.

### 🔴 F-05 es la PRIMERA feature que mete binarios en `dist/` → activa la deuda de F-01

- **NO rompe** la puerta del cascarón (`tools/puerta-cascaron.ts:23` filtra `ES_HTML = /\.html$/i`,
  y su comentario **ya cita el riesgo `.woff2` por su nombre**) ni la de contraste (solo lee
  `_tokens.scss`).
- **SÍ activa el camino de la deuda en la puerta de placeholders**: `tools/puerta-placeholders.ts`
  lista **todos** los ficheros sin filtro de extensión y hace `readFileSync(ruta, 'utf8')`.

**MEDIDO, no supuesto** (leyendo los 108 `.woff`/`.woff2` reales de `@fontsource` con utf8):
**no lanza** · **554.818 U+FFFD** · **0 violaciones HOY** · pero **50.100 secuencias candidatas**
al regex del teléfono en ese ruido binario.

**Comprobado además por mí, end-to-end**, inyectando un `.woff2` real en `dist/assets/` y corriendo
las tres puertas: **las tres pasan, exit 0.** Y el `.woff2` va comprimido con Brotli, así que la
URL de la licencia OFL **no aparece como literal** (0 URLs visibles al decodificar utf8).

> **Conclusión honesta:** el falso positivo es **potencial, no determinista**, y **no se ha
> observado un fallo real**. Pero *«0 violaciones»* **no significa que el hueco esté cerrado**: los
> ficheros que entren en `dist/` tras el pipeline de Vite **no son byte a byte** los de
> `node_modules`.
>
> 🔴 **F-05 NO PUEDE tocar `tools/puerta-placeholders.ts`**: la deuda es **de F-01**, y
> `progress/current.md:477-478` ya declara que **cerrarla exige un escenario nuevo en
> `features/puerta_placeholders.feature`**. Hacerlo dentro de F-05 sin ese escenario sería
> **producción sin test rojo — violación de la Ley 1**. → **A-27**.

**Lo que F-05 sí debe hacer:** su **propio** humilde debe **filtrar por extensión** el conjunto que
lee como texto (como `ES_HTML` en `tools/puerta-cascaron.ts:23`) — y eso valida el alcance
`(html|css)` del criterio de aceptación: **leer binarios sería un falso positivo esperando a
ocurrir**.

---

## 9. Las preguntas abiertas que van a la puerta humana

| # | Qué | Por qué no lo decido yo |
| --- | --- | --- |
| **A-23** | El criterio *«el build falla si el artefacto contiene CUALQUIER origen externo»* es **insatisfacible** (10 orígenes medidos hoy, ninguno una petición) y *«mutar el predicado de allowlist»* pide **un mutante que no existe**. Propuesta: reescribirlos como *«ninguna PETICIÓN AUTOMÁTICA a un origen externo»* y nombrar mutadores reales. | **Cambia los criterios de aceptación.** Es la puerta humana. |
| **A-24** | La **`puerta_legal` es una atribución normativa falsa** y la descripción promete «elimina banner, CMP y política de cookies de un plumazo». Propuesta: sustituir por **criterio de proyecto** + Fashion ID marcado `[I]` y **no re-verificado hoy**. | Toca el contrato **y** `feature_list.json`. |
| **A-27** | F-05 es la primera feature que mete binarios en `dist/` → **activa la deuda declarada de F-01** (medido: 0 violaciones hoy, 50.100 secuencias candidatas). ¿Se deja declarada, o se abre escenario en `puerta_placeholders.feature` (feature **`done`**)? | **Reabrir una feature cerrada** es decisión del humano. |
| **A-28** | `latin-400.css` **no tiene `unicode-range`** → un nombre con `Ł`/`ř`/`ğ` daría **tofu silencioso**. ¿Se añade `latin-ext` (+6 woff2) o se acepta? | Decisión de **producto** (¿qué nombres de clienta se esperan?). |

**Decididos por mí y declarados en el contrato** (criterio de proyecto, no norma): `preconnect` y
`dns-prefetch` **cuentan** como origen externo (contactan al tercero → el tercero recibe la IP, que
es exactamente lo que F-05 previene) · la puerta **asevera la config `base`** además de la salida
(es la vía nº1) · `url()` en reglas CSS no aplicadas **se marca** (criterio conservador; un
analizador estático no puede evaluar qué reglas aplican) · **no** se usa `@fontsource-variable`.
