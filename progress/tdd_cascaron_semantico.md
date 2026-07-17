# F-04 `cascaron_semantico` — bitácora del `tdd_craftsman`

## Estado: VERDE — 35/35 escenarios por TDD estricto, mutación 100 %

Contrato: `features/cascaron_semantico.feature` (35 escenarios, aprobado por el humano
2026-07-16; **dos correcciones aprobadas el 2026-07-17**). Fuente de verdad de los hechos:
`progress/f04_verificacion_previa.md`.

**450 tests verdes** · `typecheck` ✅ · `lint` ✅ **0 warnings** · **`pnpm build` → exit 0, las
TRES puertas verdes** ✅

**Mutación — toda a `--concurrency 1 --timeoutMS 60000`, fichero a fichero, SIN otra tanda
compitiendo (ver §«qué pasó de verdad»):**

| Fichero | Score | Mutantes | Supervivientes | Timeouts | tests/mutante |
| ------- | ----- | -------- | -------------- | -------- | ------------- |
| `src/lib/seo.ts` | **100,00 %** | 50 | **0** | **0** | 10,04 |
| `src/lib/puerta-cascaron.ts` | **100,00 %** | 482 | **0** | **0** | 19,55 |
| `tools/puerta-cascaron.ts` (humilde) | — | fuera de `mutate` (no decide nada) | — | — | — |
| `src/styles/_base.scss` | — | Stryker no ve SCSS → **el mutante es HUMANO** | — | — | — |
| F-01/F-02/F-03 | sin re-medir: **intactos**, y añadir tests **nunca baja** un score | — | — | — | — |

**0 mutantes excluidos. 0 `Stryker disable` en F-04.** (F-01 necesitó 1; F-02, otro.) Los tres
equivalentes que aparecieron se eliminaron **cambiando el DISEÑO**, como zanjó F-03.

**`tests/mutante` se reporta a propósito**: es la métrica que delata un informe envenenado, y en
esta feature costó ~2 h descubrirlo. Sano = 19,55; envenenado = 1,35. Ver §«qué pasó de verdad».

---

## ✅ LAS TRES ESCALADAS, Y CÓMO SE CERRARON (humano, 2026-07-17)

Las tres se **escalaron en vez de forzarlas**, y las tres se resolvieron en la puerta humana.
Lo que sigue es el estado FINAL; el razonamiento completo de cada una está más abajo.

**Las tres tenían razón, y ninguna era cosmética:** una habría dejado el build (y la CI, y
`harness init`) en rojo permanente para F-05…F-20; otra era un **error de hecho** del contrato que
**casi me deja una puerta tan ciega como jsdom**; la tercera dejaba abierto **el coladero de la
única regla que mide `SC 1.3.1` de verdad**.

| # | Escalada | Decisión | Qué se hizo |
| - | -------- | -------- | ----------- |
| 1 | **A-21 / build rojo** | **DIFERIR CON ANCLA** | El humilde **no cablea** `registrosSeo` → build **VERDE**. Y el conjunto diferido queda **ANCLADO** contra literal a mano en `src/lib/diferidos.test.ts`. **@s34 se queda: DIFERIDO, NO MUERTO.** |
| 2 | **@s32, error de hecho** | **SE CORRIGE EL `Then`** | El `.feature` se puso al día con la medición. **Producción NO cambió**: `cabezaDe()` ya era lo correcto. |
| 3 | **@s18, promesa sin fila** | **SE AÑADE LA FILA** | 4ª fila en el contrato → implementada **por TDD, rojo primero**: `idsDeHeadings` (h1…h6). |

### 1. A-21 → DIFERIR **CON ANCLA** (y el ancla es lo que lo salva de ser un cajón)

**El conflicto que escalé:** @s34 ordena que el build de producción rompa (*«el código de salida
es distinto de 0»*, «CONSECUENCIA BUSCADA» ×5). **Medido, funcionaba exactamente así**:

```
$ pnpm build ; echo $?
✓ Puerta del cascarón: … horneados el idioma, el title, la description, la canónica…
  ✗ flag esPlaceholder en seo.origenCanonica: "https://example.invalid"
✗ Puerta de placeholders: el build de producción NO puede publicarse.
1
```

Pero el **radio era del proyecto entero**: `harness init`, `verify` y la **CI en rojo
permanente**, y F-05…F-20 desarrollándose contra ese rojo — *y un rojo que siempre está rojo
deja de ser señal*. Es el «verde por vacuidad» del revés.

**Decisión del humano: (b) diferir**, con el precedente exacto de **A-11** (F-02 dejó el email
fuera de `registros` por lo mismo) — **y con el ancla que yo mismo eché en falta**: mi aviso era
que diferir dejaba @s34 en **teatro**. El ancla es lo que lo convierte en guarda de verdad:

- `tools/puerta-placeholders.ts` **no cablea** `registrosSeo` → **`pnpm build` exit 0**.
- **`src/lib/diferidos.test.ts`** fija el conjunto diferido EXACTO contra un **literal escrito a
  mano**: `['seo.origenCanonica', 'site.email']`. **Si alguien difiere un tercero, ROJO.**
  Anti-tautología: el literal a mano, **nunca** derivado de `registrosSeo`.
- Es **la lección de `MINIMO_DE_PARES`** (deuda 2 del judge en F-03) aplicada por delante: *una
  guarda que nadie ancla se desactiva en silencio*. Sin ancla, «diferido» es un cajón donde cabe
  todo.
- **@s34 SE QUEDA y está DIFERIDO, NO MUERTO**: prueba el MECANISMO (F-01 + `registrosSeo` →
  exit ≠ 0 nombrando `seo.origenCanonica`), y `diferidos.test.ts` prueba que hoy **no está
  cableado a propósito**. Cuando el cliente elija dominio, **el placeholder desaparece solo**
  (se cambia el dato y el flag en `seo.ts`): **no hay que acordarse de recablear nada**.

**VERIFICADO POR SABOTAJE, no por fe** (el método de `MINIMO_DE_PARES`):

| Sabotaje | Qué cae |
| -------- | ------- |
| Difiero un **tercer** dato (`seo.tercerDato`, placeholder) | ✗ `el conjunto de datos DIFERIDOS es exactamente el aprobado` (1 failed / 4 passed) |
| **Cableo** `registrosSeo` en el humilde | ✗ `el humilde de F-01 NO cablea registrosSeo, y lo declara por escrito` (1 failed / 4 passed) |
| Restaurado | **5/5 verdes** |

Cada sabotaje mata **exactamente su test**, ni uno más: el ancla muerde donde dice que muerde.

### 2. @s32 → EL CONTRATO SE PUSO AL DÍA CONMIGO (producción no cambió)

**Lo que escalé, y era un ERROR DE HECHO del contrato.** Su `Then` decía:

> *«el HTML CRUDO de dist/ NO contiene ningún `<title>` ni ninguna `<meta name="description">»*

**Falso, y lo medí sobre un build SSG real** (`.experimentos-tmp/react19-nativa/dist/index.html`):

```html
<head><meta charset="UTF-8"><script type="module" src="/assets/app-ti4oL6dR.js"></script></head>
<body><div id="root" data-server-rendered="true"><title>Nails Lash Studio</title>
<meta name="description" content="…"><link rel="canonical" href="…">…
```

`renderToString` **NO hoistea** la metadata de React 19 al `<head>`: **LA EMITE EN EL `<body>`**.
El artefacto **SÍ contiene** el `<title>`; lo que sale **VACÍO es el `<head>`** — que es lo que
el mecanismo verificado siempre dijo (`f04_verificacion_previa.md` §1) y lo único que importa.
**La decisión era correcta; la letra, falsa.** El patrón del proyecto, otra vez.

🔴 **Y ES EL HALLAZGO MÁS VALIOSO DE LA FEATURE, PORQUE CASI ME LA CUESTA:** mi primera puerta
buscaba el `<title>` con regex **en el documento entero**. Lo encontraba **en el `<body>`** y
**NO acusaba**. **Rompió por accidente** —el JSON-LD del fixture estaba incompleto y saltó por
`JSON-LD sin name`—; **con un JSON-LD completo, el bug de React 19 habría pasado la puerta EN
VERDE**. Es decir: **mi puerta era TAN CIEGA COMO JSDOM al único bug que F-04 existe para
prevenir**, y la suite entera lo habría certificado. **@s32 se pagó a sí mismo en su primera
ejecución.**

→ `cabezaDe(html)` acota las 4 reglas del `<head>` al `<head>`, y hay un test que **fija el
hallazgo** (`@s32 el <title> SÍ está en el artefacto, pero DENTRO DEL <body>`) para que nadie
«simplifique» `cabezaDe` dentro de seis meses. El `Then` corregido ya está en el `.feature`.

### 3. @s18 → LA FILA NUEVA, IMPLEMENTADA POR TDD

La regla se llamaba *«section sin aria-labelledby A UN HEADING REAL»* y **ninguna de sus 3 filas
lo probaba**: ninguna distinguía un `<h2 id="x">` de un `<div id="x">` → **el coladero estaba
abierto justo en la forma que la prosa quiere prohibir**. **No lo implementé sin fila** (habría
sido producción que ningún test rojo pide + **mutante inmortal**).

El humano añadió la 4ª fila → implementado **rojo primero** (cayó **solo** la fila nueva):
`idsDeHeadings` = ids que cuelgan de `h1`…`h6`, **y nada más**: el contrato **no** fija
`role="heading"` ni `aria-level`, y **no se inventan**. `idsDe` se eliminó: quedó muerta.
Importa más que ninguna otra fila porque **@s18 es la ÚNICA de las diez reglas que mide
`SC 1.3.1` de verdad**: sin ella, el acceptance 1 no estaba protegido.

---

## Apéndice: el razonamiento original de la escalada 1 (se conserva)

### `pnpm build` salía ROJO — y era lo que @s34 ORDENA, no un fallo

El objetivo que me diste dice «`pnpm build` verde, 0 warnings». **Es incompatible con @s34**, y
gana el contrato. Medido:

```
$ pnpm build ; echo $?
✓ Puerta del cascarón: las 1 ruta(s) del artefacto llevan horneados el idioma, el title, …
  ✗ flag esPlaceholder en seo.origenCanonica: "https://example.invalid"
✗ Puerta de placeholders: el build de producción NO puede publicarse.
1
```

Es **literalmente** el Then de @s34: *«el código de salida es distinto de 0»*, *«la violación la
emite la PUERTA DE PLACEHOLDERS de F-01 por el flag esPlaceholder, no la puerta del cascarón»*,
*«la salida declara la ubicación del registro del origen»*. Y la **CONSECUENCIA BUSCADA** que el
contrato escribe cinco veces: *«el sitio NO SE PUEDE PUBLICAR mientras el dominio no se decida»*
(decisión 9 + decisión 6 de Fase 0: *«corolario duro: la web no se puede publicar»*).

**LO QUE NO ES OBVIO, Y POR ESO LO ESCALO:** el contrato cerró A-21 en abstracto, pero el
**radio de explosión** es del proyecto entero, no de F-04:

- `bin/harness init` ejecuta `build` → **init ROJO**.
- `bin/harness verify` → **ROJO**.
- La **CI** (`harness-ci.yml`) → **ROJA** (llevaba verde desde `fe3a6b1`).
- **F-05…F-20 se desarrollarían con el build en rojo permanente** → un rojo esperado deja de ser
  señal. Es el mismo mecanismo que el «verde por vacuidad», del revés: *nadie mira un rojo que
  siempre está rojo*, y el siguiente fallo REAL entra sin que nadie se entere.

**Las dos salidas, y ninguna la tomo yo:**
- **(a) Se queda rojo** (lo que dice el contrato). Hay que decidir qué hace la CI y el `init`.
- **(b) Se difiere** el cableado, como **F-02 hizo con el email** (A-11): `site.ts` documenta
  literalmente *«el EMAIL NO entra (A-11 diferido): mientras no figure, la puerta no rompe el
  build por flag y el build de producción sigue verde (@s10)»*. **Hay precedente EXACTO en este
  repo de diferir un placeholder para no romper el build.** Pero eso deja @s34 **inerte**, que
  es justo lo que el contrato prohíbe.

**Cómo se revierte a verde, si el humano elige (b):** una línea en
`tools/puerta-placeholders.ts` → `registros` en vez de `[...registros, ...registrosSeo]`. El
test de @s34 seguiría verde (prueba el mecanismo), pero sería teatro: probaría una composición
que nadie ejecuta.

**Lo que NO se puede hacer:** poner `esPlaceholder: false` al origen. Eso sería **inventar el
dominio**, que el contrato prohíbe expresamente y el cliente aún no ha decidido [NV].

### 2. 🔴 @s32 tiene un ERROR DE HECHO en su `Then`, y lo he medido

El contrato dice:

> `Then el HTML CRUDO de dist/ NO contiene ningún <title> ni ninguna <meta name="description">`

**ES FALSO.** Build SSG real, `.experimentos-tmp/react19-nativa/dist/index.html`:

```html
<head><meta charset="UTF-8"><script type="module" src="/assets/app-ti4oL6dR.js"></script></head>
<body><div id="root" data-server-rendered="true"><title>Nails Lash Studio</title>
<meta name="description" content="…"><link rel="canonical" href="…">…
```

`renderToString` **NO hoistea** la metadata de React 19 al `<head>`: **LA EMITE DENTRO DEL
`<body>`**, donde está el componente. El artefacto **SÍ contiene** el `<title>`. Lo que está
vacío es **el `<head>`** — que es exactamente lo que el mecanismo verificado siempre dijo
(*«el `<head>` del build sale VACÍO»*, `f04_verificacion_previa.md` §1) y lo único que importa.

**LA DECISIÓN ES CORRECTA, LA LETRA DEL `Then` ES FALSA.** El patrón del proyecto, otra vez.

**Y NO ES COSMÉTICO — casi me cuesta la feature:** mi primera puerta buscaba el `<title>` con
regex **en el documento entero**. Lo encontraba **en el `<body>`** y **NO acusaba**. Rompió por
accidente (el JSON-LD del fixture estaba incompleto); **con un JSON-LD completo, el bug de React
19 habría pasado la puerta EN VERDE** — o sea, mi puerta habría sido **tan ciega como jsdom** al
único bug que F-04 existe para prevenir. **@s32 se pagó a sí mismo en su primera ejecución.**

→ Implementado lo **medido**: `cabezaDe(html)` acota las 4 reglas del `<head>` al `<head>`, y hay
un test explícito (`@s32 el <title> SÍ está en el artefacto, pero DENTRO DEL <body>`) que fija el
hallazgo para que nadie «simplifique» `cabezaDe` dentro de seis meses.
→ **Propuesta de corrección del `.feature`** (puerta humana, yo no lo edito): *«el `<head>` del
HTML CRUDO de dist/ no contiene ningún `<title>` ni ninguna `<meta name="description">` — están
en el `<body>`, donde no sirven para nada»*.

### 3. @s18 promete «a un heading real» y NINGUNA FILA LO PRUEBA

La regla se llama `section sin aria-labelledby a un heading real` y la prosa es enfática (*«NO un
`div` con `font-size`»*). Pero las **tres filas** solo distinguen: atributo ausente (→1), id que
resuelve (→0), id que **«no existe en NINGÚN elemento»** (→1).

**Ninguna fila distingue un `<h2 id="x">` de un `<div id="x">`.** Implementar la comprobación de
«es heading» sería **producción que ningún test rojo pide (Ley 1)** y un **mutante INMORTAL**
(nada lo mataría) → rompería el umbral de 1.0.

→ Implementado lo que fijan las filas, con el **límite declarado en el código**. **El coladero
sigue abierto**: `<section aria-labelledby="x">` + `<div id="x" class="titulo">` **PASA**, que es
justo la forma que la prosa quiere prohibir. **Cerrarlo exige una FILA NUEVA en el `.feature`** →
puerta humana. Precedente literal del repo: la rama de «texto grande» que F-03 **no** implementó
por esta misma razón.

---

## Puerta de arranque (verificada EN DISCO, no por el mensaje del lead)

| Señal | Estado |
| ----- | ------ |
| `feature_list.json` id 4 → `status` | `in_progress` ✅ |
| Cabecera del `.feature` | «Aprobado por el humano en la puerta (2026-07-16, sobre los 35 escenarios)» ✅ |
| `progress/current.md` | «Feature en curso: 4 — cascaron_semantico (in_progress)» ✅ |

## Arquitectura (la de F-01/F-03, sin inventar otra)

| Capa | Fichero | Qué hace |
| ---- | ------- | -------- |
| PURA | `src/lib/seo.ts` | `componerTitulo`, `canonicaDe`, `construirJsonLd`, `ORIGEN_CANONICA`, `registrosSeo`. |
| PURA (decisor) | `src/lib/puerta-cascaron.ts` | `inspeccionarSitio(paginas, rutasEsperadas)` + `ejecutarPuertaDelCascaron`. Recibe HTML CRUDO, devuelve violaciones. |
| HUMILDE | `tools/puerta-cascaron.ts` | Solo `node:fs`/`node:process`. Sin tests ni mutación. |
| CÁSCARA | `src/pages/home.tsx` | El `<Head>` de vite-react-ssg. **Fuera de `mutate`** por convención del stack (`pages/*`) y por el ALCANCE MUTABLE que fija el contrato. |
| ESTILO | `src/styles/_base.scss` | `:focus-visible` + `scroll-padding-top`. **No mutable** (Stryker no ve SCSS) → el mutante es HUMANO. |

**@s28 [NV] RESUELTO:** `dist/index.html` real emite **4 hrefs** (2 anclas de nav + tel: +
ancla). La guarda **NO nace en rojo**. No hubo que volver a la puerta.

## Trazabilidad @s → test

| `@s` | Test |
| ---- | ---- |
| @s1 | `seo.test.ts` → `@s1 componerTitulo("%s") es exactamente "%s"` (3 filas, literales A MANO) |
| @s2 | `@s2 compone un título DISTINTO…` + `@s2 ninguno de los dos títulos es la cadena vacía` |
| @s3 | `@s3 lanza ante la página con el nombre vacío…` |
| @s4 | `@s4 canonicaDe("%s", origen) es exactamente "%s"` (2 filas) |
| @s5 | `@s5 devuelve una canónica DISTINTA para "/" y para "/servicios"` |
| @s6 | `@s6 lanza ante el origen "%s"…` (3 filas) |
| @s7 | `@s7 el campo "@type"…`, `"name"`, `"address.@type"`, `"address.addressLocality"`, `"address.postalCode"` (5 tests) |
| @s8 | `@s8 el campo "geo.latitude" es exactamente 40.5179875` + `geo.longitude … -3.9226688` |
| @s9 | `@s9 las claves de primer nivel son EXACTAMENTE las acordadas` + `@s9 la clave "%s" no aparece a NINGUNA profundidad` (8 filas) |
| @s10 | 4 tests: lanza / ErrorDeSeo / NO contiene `10656940` / **NO contiene `10656940` + letra de control** |
| @s11 | `cascara-global.test.ts` → 4 tests (`:focus-visible` existe · declara foco visible, no `outline:none` · `scroll-padding-top` > 0 · enganchado a `main.scss`) |
| @s12 | `puerta-cascaron.test.ts` → `@s12 una página completa y correcta no produce ninguna violación` |
| @s13 | `@s13 %s → 1 violación por la regla "%s"` (5 filas: title ausente/vacío, description ausente/vacía, canónica ausente) |
| @s14 | `@s14 la misma canónica en dos rutas distintas…` (**fixture de DOS rutas**) + `@s14 dos rutas con canónica PROPIA no producen violación` |
| @s15 | `@s15 %s (%s) → 1 violación` (4 filas, incluida la del `lang` DUPLICADO) |
| @s16 | `@s16 con $cuantosH1 h1 hay exactamente $cuantas violación(es)` (3 filas: 0→1, 1→0, 2→1) |
| @s17 | `@s17 sin el landmark "%s" → 1 violación que lo nombra` (3 filas) |
| @s18 | `@s18 %s → %i violación(es)` (3 filas) — **con el límite declarado, ver §3** |
| @s19 | `@s19 %s → 1 violación por la regla "%s"` (3 filas; asevera que NO lanza y NO devuelve `[]`) |
| @s20 | `@s20 @type %s → %i violación(es)` (8 filas) + `@s20 el nodo BeautySalon dentro de un @graph no produce violación` |
| @s21 | `@s21 %s → 1 violación por la regla "%s"` (8 filas; las dos de `geo` mutan UN dígito) |
| @s22 | `@s22 %s → al menos 1 violación…` (7 filas, **3 anidadas**) + `@s22 la violación declara la RUTA del nodo` + `@s22 … INSENSIBLE A LA CAJA` |
| @s23 | `@s23 un enlace a "%s" sin fichero en dist/ → 1 violación…` (3 filas) |
| @s24 | `@s24 un enlace a "%s" no produce violación anti-404` (5 filas) |
| @s25 | 3 tests: exactamente 3 violaciones · cada una nombra ruta/regla/valor · **dos pasadas idénticas y en el mismo orden** |
| @s26 | `@s26 %s → exit != 0 y la salida declara la ruta que no encontró` (3 filas) + `@s26 las rutas esperadas … son exactamente ["/"]` (ancla contra literal) |
| @s27 | `@s27 con la lista de rutas esperadas vacía → exit != 0 y lo declara` + `@s27 RUTAS_ESPERADAS no está vacía` |
| @s28 | `@s28 un dist/ cuya index.html no tiene ni un href → exit != 0` + `@s28 la guarda cuenta TODOS los href` |
| @s29 | `@s29 si la lectura de un fichero lanza → exit != 0 y declara que no pudo completar` (**ancla la CAUSA concreta**, lección de F-01) |
| @s30 | `@s30 un dist/ con una HTML por cada ruta esperada y todo correcto → exit 0, 0 violaciones` |
| @s31 | `@s31 el script "build" invoca la puerta DESPUÉS de vite-react-ssg build` + `@s31 el script "%s" NO invoca la puerta` (dev, dev:ssr) |
| @s32 | `trampas-del-horneado.test.tsx` → 4 tests, **build SSG REAL**: `<head>` sin title/description · **el title SÍ está en el `<body>`** (§2) · la puerta acusa · exit != 0 · **jsdom DA VERDE sobre la misma violación** |
| @s33 | 3 filas (`<head >`, `<HEAD>`, `<head lang="es">`) con **build real** + `@s33 el index.html REAL contiene "<head>" y ningún <title>` + **control**: con `<head>` correcto la MISMA cáscara SÍ hornea |
| @s34 | `seo.test.ts` → 4 tests: el registro placeholder existe · **el build de producción rompe vía el FLAG de F-01** nombrando `seo.origenCanonica` · **la puerta del cascarón NO dice nada del origen** (no duplica F-01) · **dev NO rompe** |
| @s35 | `@s35 %s → %i violación(es)` (4 filas, incluida **LA MEZCLA**) |

## Decisiones de diseño (para no volver a discutirlas)

1. **La constante `geo` va ESCRITA A MANO EN LA PUERTA** (`puerta-cascaron.ts`), **no importada
   de `site.ts`**. Si la importara, el **vigilante y el vigilado se moverían juntos**: cambiar
   `site.ts` cambiaría a la vez lo emitido y lo esperado, y la puerta pasaría feliz. Es la
   anti-tautología aplicada a producción — mismo argumento con el que F-03 ancló
   `MINIMO_DE_PARES` a un literal en vez de a `.length`.
2. **`registrosSeo` va SEPARADO de los `registros` de F-02**, y el humilde los **concatena**.
   Meter el origen en el array de F-02 **rompería su contrato**: su `@s10` fija que sus registros
   son todos `esPlaceholder:false` y que su puerta **no emite ninguna violación**. Cada feature
   declara los suyos.
3. **@s10 rechaza CUALQUIER identificador fiscal, no solo el malformado.** No es pereza: **hoy no
   existe ninguno válido**, y el contrato **prohíbe el camino positivo** (*«fingir uno sería
   inventarlo»*). Una rama «válido» que ningún test rojo pide sería producción sin test (Ley 1) y
   **mutante inmortal**. El mensaje **NO echa el identificador** (es verosímilmente un DNI
   truncado = dato personal) y el test lo contrasta **contra el alfabeto entero**, no contra la
   tabla del módulo 23 — así **ni siquiera codifica la tabla**, y es más fuerte (26 letras, no 23).
4. **`trampas-del-horneado.test.tsx` NO importa nada de `src/lib`**, a propósito: corre 5 builds
   SSG reales (~24 s) y ejecuta la puerta **como subproceso**. Si importara la puerta, Stryker lo
   contaría como cobertura y lo re-ejecutaría **por cada mutante** → horas y **timeouts**, y *«un
   informe con timeouts MIENTE»* (`docs/verification.md`). El veredicto se lee del **exit code**
   del subproceso, que además es la prueba **más fuerte**: es el build de verdad.
5. **La guarda de «una HTML por ruta esperada» vive en `inspeccionarSitio`, no en la puerta.** Es
   lo que hace que `rutasEsperadas` **signifique algo** en el decisor (el contrato se lo pasa en
   12 escenarios). Lo cazó **el lint**: `_rutasEsperadas` estaba sin usar — la firma del contrato
   era decorativa.
6. **`react-helmet-async` entra como devDependency.** `home.test.tsx` (andamiaje de F-00) ahora
   necesita `HelmetProvider` porque la cáscara emite con `<Head>`. pnpm es estricto y no deja
   importar una transitiva. Está documentado en el propio test que **ese test NO vigila el SEO y
   no puede**: es jsdom.

## Lo que enseñó la mutación (y no fue poco)

Los ficheros nuevos son `src/lib/seo.ts` y `src/lib/puerta-cascaron.ts`. **Toda la medición a
`--concurrency 1 --timeoutMS 60000`**, fichero a fichero, y **leyendo `# timeout` ANTES que el
score** (regla dura del arnés, `docs/verification.md`): **0 timeouts en todas las tandas**, así
que los scores son honestos. `placeholders.ts`/`puerta.ts`/`site.ts`/`contraste.ts`/
`puerta-contraste.ts` **no se re-miden**: están intactos y **añadir tests nunca baja un score**.

**`seo.ts`: 13 supervivientes → 0.** Y ninguno exigía tocar el contrato: **eran todos míos**.
- **8** eran valores que yo mismo declaré como «interpretación» y **no aseveré** (`@context`,
  `telephone`, `streetAddress`, y los mensajes de error partidos en tres literales).
- **2** eran mensajes de error sin anclar: es **el superviviente exacto de F-01** (`@s22`, un
  motivo vaciado cumplía «…contenga la frase»). La puerta **acusa**, no gruñe.
- **3** eran del regex `/^https?:\/\/[^/?#\s]+$/` — quitar el `^`, el `$` y el `?`. **El `^` es
  literalmente el superviviente que apareció en F-03.** Matarlos habría exigido **filas nuevas**
  en @s6 (puerta humana). **Se eliminaron POR DISEÑO**, no excluyéndolos: `URL.canParse(x) &&
  new URL(x).origin === x`. No hay ancla que quitar → no hay mutante. Y de paso murió el
  **equivalente** `catch { return false }` → `catch {}` (undefined es falsy igual que false):
  sin `catch`, no hay equivalente que excluir. **Es la lección 4 de F-03 aplicada dos veces.**

**`puerta-cascaron.ts`: 58 supervivientes → 0.** Tres lecciones:
1. **La ruta feliz no prueba a los extractores.** Los escenarios los ejercitaban solo por el
   camino bueno: **su ROBUSTEZ no la fijaba nadie** (la caja, el espaciado del `=`, los atributos
   de más, `<h10>` vs `<h1>`, un `<meta>` sin `name`). Un extractor que deja de casar hace que la
   puerta pase **«protegidos» sin haber mirado** — el verde por vacuidad de @s28 un nivel más
   abajo. → Se prueban **directamente**, como F-03 hizo con `extraerTokens`/`hexARgb`.
2. **Casi ningún test miraba el `valor`.** Se podían **vaciar TODOS los `valor` del informe** y
   la suite seguía verde: «la puerta acusa, no gruñe» es media feature y no lo fijaba nadie.
3. **Tres equivalentes, los tres eliminados cambiando el DISEÑO** (nunca excluidos):
   - `referencia === undefined || !ids.has(referencia)` → la primera condición era **redundante**
     (`Set<string>.has(undefined)` siempre es `false`). Se filtran los `id=""` en
     `idsDeHeadings` y queda `!ids.has(referencia ?? '')`.
   - `total + …` → `total - …` en la cuenta de enlaces: **equivalente**, porque restar de 0 nunca
     vuelve a 0 salvo que todo sea 0 — el mismo veredicto. Se cambió a `.some(… > 0)`, y así
     `> 0` → `>= 0` **muere**.
   - El `catch` de `esOrigenAbsoluto` (arriba).

**Y dos huecos REALES que la mutación destapó, no cosméticos:**
- 🔴 **La mitad «DUPLICADO» de la regla del `lang` se podía borrar en silencio.** La fila de @s15
  es `<html lang="xx" lang="es">`, y ahí el primero **ya es distinto de `es`** → lo cazaba el
  chequeo del VALOR, y el del RECUENTO **no hacía falta**. Con `lang="es" lang="es"` (duplicado,
  ambos correctos) **solo acusa el recuento**. Sin ese test, `langs.length !== UN_SOLO_LANG` se
  podía quitar sin romper nada. **No es regla nueva: la regla ya dice «duplicado».**
- 🔴 **Dos páginas SIN canónica no son dos páginas con la misma canónica.** Sin el `continue` del
  `null`, todas se registraban bajo la clave `null` y la puerta habría acusado «canónica
  repetida» **encima** de «canónica ausente» — una violación **inventada**.

**0 mutantes excluidos** (F-01 necesitó 1, F-02 otro). **0 `Stryker disable` en F-04.**

## 🔴 LA MEDICIÓN DE MUTACIÓN: QUÉ PASÓ DE VERDAD (y TRES hipótesis falsas, dos mías)

**CAUSA REAL, confirmada por el lead: DOS STRYKER CORRIENDO A LA VEZ.** Entre las 07:28 y las
08:15 el lead me dio por muerto (mi `transcript` llevaba horas sin escribirse) y lanzó sus
propias tandas **en paralelo con las mías**, borrando `.stryker-tmp` a mitad y editando mis
ficheros de test. **Todo lo que se midió en esa ventana —suyo y mío— es basura por contención de
sandbox.** El tiempo perdido no cambia el veredicto; la lección, sí.

**Yo no sabía que había otro Stryker, y perseguí dos hipótesis. LAS DOS ERAN FALSAS. Las dejo
escritas para que nadie las repita:**

> ❌ **HIPÓTESIS 1 (mía): «lo rompe el proceso externo que reescribe `src/lib/`».** La probé:
> restauré el árbol, lo verifiqué limpio y corrí la tanda comprobando `git status` **al
> terminar** → **0 ficheros tocados durante la tanda**, y aun así dio 28,42 %. **Refutada por mí
> mismo.** (El proceso existía —era el lead— pero no era la causa.)
>
> ❌ **HIPÓTESIS 2 (mía): «lo rompe `coverageAnalysis: perTest`».** La probé con la palanca que
> NO depende de la atribución, `--coverageAnalysis all`, que OBLIGA a correr los 246 tests contra
> cada mutante. Dio **«Ran 2,45 tests per mutant»**, que con `all` es **aritméticamente
> imposible**. **Refutada** — y esa imposibilidad era justo la pista de que el runner ni siquiera
> estaba ejecutando los tests, porque otro Stryker le pisaba el sandbox.

### ❌ LA TERCERA, la del lead: «la extensión .ts rompe la cobertura». TAMBIÉN FALSA

El lead sospechó que **la extensión `.ts` en el import de un test rompe `perTest` e INVENTA
supervivientes**, midiendo `seo.ts` **42 % → 100 %** al quitarla (`tests/mutante` **0,90 →
10,04**). Iba a subirlo a `docs/verification.md` como **regla del arnés**. **NO SE SOSTIENE:**

| Medición | Imports | ¿Contención? | tests/mutante | Score |
| -------- | ------- | ------------ | ------------- | ----- |
| **pc4** (01:30, 6 h ANTES de que el lead empezara) | **CON `.ts`** | **no** | **19,68** | **98,97 %** |
| **Control final `seo.ts`** (yo solo, tras parar el lead) | **CON `.ts`** | **no** | **10,04** | **100 %** |
| Lead, `seo.ts` | SIN `.ts` | no | 10,04 | 100 % |
| Lead, `seo.ts` | CON `.ts` | **sí (yo corriendo)** | 0,90 | 42 % |

**Con `.ts` y sin contención doy 10,04 tests/mutante y 100 %: EXACTAMENTE lo mismo que el lead
sin `.ts`.** La variable no era la extensión — **era la contención**. Su tanda del 42 % peleaba
contra la mía por el mismo `.stryker-tmp`.

→ **La regla propuesta debe BORRARSE de `docs/verification.md`.** Sería una regla **falsa**, y
además **peligrosa**: empujaría a quitar las extensiones `.ts`, que **NO son estilo** — los
humildes de `tools/` corren con `node --experimental-strip-types`, **que las EXIGE**. Aplicarla
**rompe las tres puertas del build** (el propio lead lo comprobó: `ERR_MODULE_NOT_FOUND`).
**Una regla falsa en el arnés es peor que ninguna regla.**

### ✅ LAS DOS REGLAS QUE SÍ SE SOSTIENEN

1. **Hermana de «un informe con timeouts MIENTE»: un informe cuyo `tests per mutant` se desploma
   MIENTE.** Mismo código: **19,68 → 1,35** tests/mutante y **98,97 % → 7,05 %**. Es tan delator
   como el timeout y **MÁS PELIGROSO, porque el score BAJA en vez de subir**: nadie sospecha de un
   7 %, así que no lo cuestionas — te empuja a «arreglar» código que ya está bien, o peor, a
   **añadir tests basura hasta que el número suba**. La mentira del timeout te hace confiar de
   más; esta te hace destrozar lo que funciona. **Lee `tests per mutant` junto a `# timeout`, y
   compáralo entre tandas.**
2. **NUNCA corras dos Stryker a la vez sobre el mismo repo.** Comparten `.stryker-tmp`
   (`tempDirName`, **global** en `stryker.config.json`) y **se envenenan en silencio**: 0 timeouts,
   0 errors, y un score inventado. Es la causa nº 1 del punto 1.

**Lo único sólido de esa ventana es lo verificado A MANO, que no depende de Stryker:** el mutante
`ausenteOVacio → false`, que el informe declaraba **«Survived» con 101 tests cubriéndolo**, **mata
5 tests** aplicado a mano (`5 failed | 198 passed`). El informe mentía, y el sabotaje lo prueba.

### El «58 supervivientes» del commit: ERA REAL

La tanda de los 58 corrió a las **00:38** y `pc4` (98,97 %, 5 supervivientes nombrados) a la
**01:30** — las dos con el árbol limpio y **seis horas antes** de la interferencia. **Ninguna
está contaminada**, y las lecciones que salieron de ellas (los extractores sin probar, el `valor`
sin aseverar, los tres equivalentes) **se sostienen enteras**.

## Honestidad sobre el proceso (Ley 3)

En el ciclo de **@s7 escribí más producción de la que su test rojo exigía** (devolví el objeto
JSON-LD entero en vez de solo los 5 campos aseverados). Consecuencia: **@s8, @s9, @s25 y @s30
nacieron VERDES**. No lo disimulo. Su valor sigue siendo real (anclan mutantes: @s8 mata
cualquier toque a la constante, @s9 el conjunto exacto de claves), pero **no dirigieron código
nuevo**, y eso es una desviación de la Ley 3 que reconozco.

**@s2 nace verde sobre @s1 y eso SÍ es deliberado**: el contrato lo conserva como INVARIANTE
(*«si mañana se añade una página, la regla sigue viva sin tocar la tabla de @s1»*), no como
motor de código.

## Interpretaciones que el contrato no fija (declaradas, no coladas)

- **`@context` (`https://schema.org`), el valor de `telephone` (`+34625223366`) y la composición
  de `streetAddress`** no los fija ningún `Then`. Los **asevero igualmente** porque el umbral de
  mutación es **1.0** y sin aserción sus mutantes sobreviven. La cabecera del `.feature` respalda
  el literal del teléfono (lo lista entre los que van «A MANO»). `streetAddress` se asevera por
  `toContain` de los datos de F-02, que es lo que @s7 remite a @s21.
- **`geo` NO emite `@type: GeoCoordinates`**: ningún escenario lo pide → sería mutante inmortal.
- **`@s31` se asevera sobre `package.json`** (precedente literal de F-03 `@s12`), no con un
  parámetro `modo`: el contrato dice «dev NO invoca la puerta», que es cableado, no lógica.

## Bitácora de ciclos (rojo → verde → refactor)

Todos los ciclos siguieron el orden del contrato, `@s1..@s35`, un `@s` a la vez, verificando el
ROJO antes de cada implementación. Los rojos que **cazaron defectos reales** (no solo ausencia de
código):

- **@s32 → `cabezaDe()`**: mi puerta escaneaba el documento entero y era **ciega al bug de React
  19**. Ver §2. **El hallazgo más importante de la feature.**
- **@s29 → `try/catch` en la puerta**: la excepción se propagaba en vez de convertirse en build
  roto.
- **lint → la guarda de rutas ausentes** se movió al decisor puro (decisión 5).
- **@s33 (fila de control) → el fixture** tenía el JSON-LD incompleto y la puerta rompía **por la
  razón equivocada**. Corregido: un test que pasa por el motivo equivocado no prueba nada.


## Qué queda (y qué NO he hecho)

- **NO he marcado la feature como `done`.** Espera `judge` + `mutation_tester`, como manda el
  protocolo. `feature_list.json` sigue en `in_progress`.
- **Para el `mutation_tester`:** los números están arriba y son **reproducibles en limpio**. Si
  te sale algo distinto, **lee `tests per mutant` ANTES que el score** y comprueba que no haya
  otra tanda de Stryker viva: es lo que envenenó seis mediciones de esta feature.
- **Para el `judge`:** los tres puntos que más merecen mirada crítica son (a) que `@s2`, `@s8`,
  `@s9`, `@s25` y `@s30` **nacieron verdes** por una desviación mía de la Ley 3 en el ciclo de
  `@s7` —lo reconozco abajo—, (b) las **interpretaciones declaradas** (valores que el contrato no
  fija y asevero igual, porque el umbral 1.0 lo exige), y (c) que `@s34` está **DIFERIDO**: su
  test prueba el mecanismo, y `diferidos.test.ts` prueba que hoy no está cableado a propósito.
- **Deuda del arnés que dejo escrita (no la cierro yo):** `docs/verification.md` gana dos reglas
  nuevas —el `tests per mutant` desplomado, y la prohibición de correr dos Stryker a la vez— y
  **pierde la regla FALSA de la extensión `.ts`**, que estaba a punto de entrar y habría **roto
  el build** de haberse aplicado.
