# F-06 — Verificación previa al contrato (lead, 2026-07-17)

> **Qué es esto.** Las 8 afirmaciones que iban a sostener el contrato de `header_nav_footer`,
> verificadas **contra fuente primaria antes de escribir una línea de spec**. Es la lección de
> F-03, F-04 y F-05 aplicada por delante.
>
> **Método:** workflow adversarial (verificar + refutar cada afirmación), **~1,77 M tokens**
> entre las dos tandas (una recuperación por sobrecarga 529 de la API). Diario:
> `.claude/…/subagents/workflows/wf_d7d82592-b7b/journal.jsonl`
>
> **Resultado: 1 REFUTADA de raíz, 6 MATIZADAS, 1 CONFIRMADA. Ninguna decisión de F-06 «de fondo»
> cae; lo que caen son TRES de los cinco criterios de aceptación y la puerta_legal.** El patrón de
> F-04/F-05, otra vez: *la decisión de construir cabecera+nav+pie es correcta; casi todo el
> «cómo» escrito en el troceado es falso o insatisfacible.*

---

## 0. Las bombas: TRES de los cinco criterios de aceptación no se pueden destilar tal cual

| # | Acceptance de `feature_list.json` §6 | Veredicto | Por qué |
| --- | --- | --- | --- |
| @1 | *«cubre TODAS las secciones de la página, no 7 de 11»* | **INSATISFACIBLE (C1)** | Hoy la página tiene **2 secciones**, y sus ids viven en los `<h2>`, no en los `<section>`. «TODAS las secciones» de una página que aún no existe. Es **A-23 otra vez**. |
| @2 | *«scroll-padding-top (scroll-margin NO actúa al tabular)»* | **FALSO (B2)** | **Ninguna fuente primaria** dice que scroll-margin no actúe al tabular. El scroll al Tab es **UA-defined**. |
| @4 | *«se deriva de la altura REAL de la cabecera»* | **INSOSTENIBLE BAJO SSG (D1)** | En CSS puro **no existe** forma de leer la altura de un elemento; la única vía es JS, y el HTML horneado del SSG **no la tiene hasta que hidrata**. |

Y la **`puerta_legal`** (*«WCAG SC 2.4.11»*) está **rozando el AAA** (B1). Tres de cinco criterios
y la puerta legal a reescribir **antes** de la spec.

---

## 1. B1 — SC 2.4.11 · **la trampa gemela, por TERCERA vez**

`feature_list.json` §6 declara `puerta_legal: "WCAG SC 2.4.11 (foco no oscurecido)"`. Los cuatro
datos duros son ciertos **[V]**: 2.4.11 es **AA**, nuevo en 2.2, C43 (scroll-padding) es **técnica
suficiente** (no advisory), y el Understanding **nombra literalmente** los sticky headers.

### 🔴 Pero el listón NO es «foco no oscurecido». Es «not entirely hidden».

| SC | Nivel | Texto literal |
| --- | --- | --- |
| **2.4.11** | **AA** | *«the component is **not entirely hidden** due to author-created content»* |
| **2.4.12** | **AAA** | *«**no part** of the component is hidden by author-created content»* |

**Oscurecimiento PARCIAL es CONFORME en AA.** Escribir *«el foco no queda oscurecido»* atribuye de
facto el listón del **AAA** bajo etiqueta AA. Es **exactamente** el fallo de F-03 (el 1.4.11 no iba
de «bordes de control») y F-04 (el 2.4.7 no exige contraste/grosor). **Tercera reincidencia si se
copia tal cual.**

**Y no tiene ningún umbral numérico** [V]: los 66px/70px/5rem **NO son WCAG**, son criterio de
proyecto. Prohibido justificar un número citando 2.4.11. **Alcance:** solo *«receives keyboard
focus»* — un ancla `#id` que aterriza bajo la cabecera **no viola 2.4.11** si el destino no recibe
foco de teclado (eso es criterio de proyecto/UX).

> **Consecuencia:** la `puerta_legal` se reescribe a *«ningún componente que reciba foco de teclado
> queda ENTERAMENTE oculto (SC 2.4.11 AA, "not entirely hidden")»*, C43 como técnica suficiente
> elegida por el proyecto, y **cero números atribuidos a la norma**. → **B-1**.

---

## 2. B2 — «scroll-margin NO actúa al tabular» · **un absoluto SIN FUENTE**

El acceptance @2 lo afirma como hecho. **Ninguna fuente primaria lo sostiene** — ni CSSOM View, ni
CSS Scroll Snap, ni el HTML Living Standard. Al contrario, CSS Scroll Snap §1 describe las dos
propiedades **simétricamente** para las *scroll-into-view operations*.

**La realidad, con cita:**

- El scroll que dispara **Tab** es **comportamiento del UA, no normado**: los *focusing steps* del
  HTML **no contienen ningún paso de scroll**; el único sitio donde la spec ordena hacer scroll es
  el **método `focus()`** («*If preventScroll is false, then scroll a target into view*»).
- `scroll-padding` se define sobre el **CONTENEDOR** de scroll como *«optimal viewing region ... for
  ALL scroll containers»* — cubre **todas** las operaciones de scroll-into-view y paging.
- `scroll-margin` es **por-elemento**; su expansión del border-box (snap area) está normada **solo
  para `:target` y `scrollIntoView()`**.

> **Consecuencia:** mantener el `html { scroll-padding-top }` de F-04 es **correcto**, pero por la
> razón correcta: va en el **contenedor** y cubre todas las operaciones. El criterio se reescribe
> **sin atribuir a la norma una asimetría de comportamiento en Tab** que la norma no fija. Si el
> contrato quiere afirmar algo de Tab+scroll-margin, es **[NV]** (no se pudo medir: el envío
> sintético de Tab fue no fiable) o exige medición multi-navegador. → **B-2**.

---

## 3. A2 — El breakpoint · **REFUTADA: el 767 es herencia muerta de WebEmpresa**

**Medido:** `grep -rn "767"` en `src/`, `tests/`, `features/` y el prototipo → **cero
coincidencias**. Las 17 que existen viven todas en `.memoria-cache/`, `docs/research/` y scratch.
**El prototipo de este proyecto NO tiene ni una `@media`** — resuelve con `flex-wrap: wrap`.

Es *«no copiar del base»* **por cuarta vez** (F-03 tokens, F-04 JSON-LD, F-05 fuentes, F-06 el
breakpoint). El 767 = 768−1 es el `md` de Bootstrap/Tailwind, **convención de framework, no una
medida de este diseño**.

### El breakpoint real, MEDIDO en Chrome (barrido al pixel, `document.fonts.ready`)

- **Con fuentes cargadas (Manrope/Gilda):** la nav envuelve a **805→806px** (altura 70→108).
- **Con la fallback `sans-serif` (el estado pre-swap del SSG):** envuelve a **793px**.
- → **Banda 793–806px.** El borde operativo para el HTML pre-hidratación es **793** (fallback).

**Y `SC 1.4.10 Reflow` (la única norma que ata anchos) exige solo** *«a width equivalent to 320 CSS
pixels»* sin scroll bidireccional — **cero menciones de breakpoint**. La cabecera del prototipo **ya
cumple 1.4.10 hoy** (medido: sin desborde a 320px). **El menú móvil NO se justifica por Reflow.**

> **Consecuencia:** si F-06 introduce un breakpoint, es `max-width: 820px` (**margen sobre toda la
> banda 793–806**, porque el número se mueve ±12px según fuentes y se moverá otra vez al reetiquetar
> la nav), fundamentado como **[criterio de proyecto, medido]**, NUNCA «lo exige WCAG». → **B-3**,
> y depende de la decisión del menú móvil (**B-5**).

---

## 4. A3 — `useIsMobile`/SSG · **el patrón de memoria, y es CONDICIONAL**

**Medido con un build SSG real:** un `useIsMobile` sobre `useSyncExternalStore` hornea
`RAMA=ESCRITORIO` en el HTML estático — **una sola rama**, la de `getServerSnapshot`. La causa raíz
es **más dura que el patrón**: en el prerender **no existe `window` en absoluto** (`mock=false` es
el default de vite-react-ssg y el repo no lo cambia). No es «no hay viewport», es «no hay DOM».

### 🔴 Pero el patrón es CONDICIONAL — su propio «Cuándo NO aplica» lo dice

**Hoy `src/` no tiene `useIsMobile`, ni `matchMedia`, ni `useSyncExternalStore`, ni una sola
`@media`** [V]. El prototipo resuelve con `flex-wrap:wrap`. **Si F-06 NO introduce rama JS, el
patrón NO APLICA** — y citarlo entonces sería justificación falsa, el fallo exacto que mató 5 de 9
razones en F-04.

**Las trampas medidas, si F-06 SÍ mete rama JS:**

- 🔴 **El guard defensivo `typeof window === 'undefined'` compila VERDE y hornea escritorio.** Es
  lo que todo el mundo escribe para «arreglar» el `ReferenceError`, y convierte un fallo ruidoso en
  uno **mudo**: verde en dev, verde en jsdom, roto en el móvil real.
- 🔴 **`ssgOptions.mock: true` EMPEORA el fallo**: instala un `window` de jsdom **sin `matchMedia`**
  → el guard canónico pasa y luego casca; y aunque lo tuviera, jsdom no hace layout → hornea
  escritorio con build verde.
- **Los tests con `matchMedia` mockeado son tautológicos para esto**: solo prueban el estado
  post-hidratación. El HTML pre-hidratación **no lo toca ni un test**. En WebEmpresa lo cazó la
  verificación **en vivo**, no la suite.

> **Consecuencia:** decisión primera de F-06, **es una bifurcación**: ¿mete rama JS o resuelve el
> responsive con CSS puro (como el prototipo)? Si CSS puro → el patrón **no se invoca**. Si rama JS
> → red CSS en el **mismo literal** que la query, test que lee el SCSS y ancla contra el **literal a
> mano** (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`), `getServerSnapshot` puro, y
> **prohibido `ssgOptions.mock`**. → **B-5**.

---

## 5. A4 — Radix Dialog · **CONFIRMADA, y con una bomba: `Portal` deja la puerta anti-404 CIEGA**

**Medido:** `radix-ui` 1.6.2 está instalado, exporta `Dialog`, y focus-trap + Escape + devolución
de foco **funcionan** (aria-expanded false→true, Escape cierra y devuelve el foco). **No mete
ninguna petición externa ni CSS** — F-05 a salvo, verificado con build real.

### 🔴 `Dialog.Portal` emite CERO en prerender

**Medido con `renderToString`** (el mismo que usa vite-react-ssg): el HTML estático son **125 bytes
— solo el `<button>` trigger**; el enlace `/unas` **NO ESTÁ**. Causa: `Portal` hace
`container = ... mounted && globalThis?.document?.body` con `mounted=false` en SSR → **devuelve
`null`**. **Build VERDE, cero warnings, menú entero ausente.** Sin `Portal`, el mismo Dialog **sí**
prerenderiza completo.

> 🔴 **Y esto deja la puerta anti-404 de F-04 CIEGA**: si los enlaces del menú viven solo en el
> `Portal`, **no están en el HTML** y la puerta pasa en verde sin verificar nada. *«No se rompe:
> MIENTE POR OMISIÓN. Es peor.»*

**Dos hechos más:**

- **`radix-ui` hoy tiene CERO usos en `src/`** [V] — es el caso `@fontsource/dm-sans` de F-05. Si
  F-06 no lo usa, **sale de `dependencies`**.
- **Radix NO es obligatorio para un menú accesible**: la letra de WCAG (2.1.2, 4.1.2) no nombra
  Radix, ni Escape, ni `aria-expanded`. **Si el menú móvil NO es modal, ni siquiera hace falta un
  Dialog** — un `<button aria-expanded>` + `<nav>` es otra técnica suficiente.

> **Consecuencia:** → **B-6**. Si se usa Radix, **decidir por escrito** entre sin `Portal`
> (prerenderiza) o con `Portal` + escenario obligatorio que asevere los enlaces en el HTML de
> `dist/`.

---

## 6. C1 — Secciones y nav · **CONFIRMADA: el acceptance @1 es INSATISFACIBLE, y falta una puerta**

### El «7 de 11» vs el «6» — resuelto con números

El prototipo tiene **exactamente 11 secciones** (expandiendo el bucle de 3 categorías): `top, unas,
facial, depilacion, colores, destacados, ofertas, equipo, reserva, contacto, faq`. El array `nav`
tiene **6 entradas**; la cabecera emite **8 elementos `<a href="#">`** (logo + 6 + CTA) que
resuelven a **7 destinos distintos** (`#equipo` está duplicado). **El «7 de 11» y el «6» miden cosas
distintas; ambos correctos.** Secciones no cubiertas por la nav: **4** (colores, reserva, contacto,
faq).

### 🔴 La bomba: hoy NINGUNA de esas secciones existe

`src/pages/home.tsx` tiene **2 ids**, y **ninguno es un id de sección**: son `servicios-titulo` y
`contacto-titulo`, en los `<h2>`. **Si F-06 porta la nav del prototipo, las 7 anclas están MUERTAS
hoy (7 de 7)** — incluida `#contacto`, porque el id real es `contacto-titulo`, no `contacto`.

**Y la puerta anti-404 de F-04 NO lo caza:** `RUTA_INTERNA = /^\/(?!\/)/` (`puerta-cascaron.ts:552`)
**excluye las anclas por diseño** (*«#ancla es un salto dentro de la misma página»*). Una nav con 7
anclas muertas **pasaría las cuatro puertas en verde**.

### Quién construye cada sección (cruzado con las 20 features)

| Sección | Feature | Estado |
| --- | --- | --- |
| `top` | F-07 hero_marca | pending |
| `unas` `pestañas` `cejas` | F-09 catalogo_servicios | pending (**`facial` NO existe** — F-09 lo corrige) |
| `contacto` | F-12 + F-10 + F-11 | pending |
| `faq` | F-15 | pending |
| `colores` | F-19 probador_color | **blocked** |
| `equipo` | F-18 equipo | **blocked, «NO empezar spec»** |
| `reserva` | — | **no se construye** (sustituida por F-13) |
| **`destacados` `ofertas`** | **NINGUNA** | 🔴 **huérfanos: 0 ocurrencias en `feature_list.json`** |

**F-06 depende solo de `cascaron_semantico` (done). CERO destinos de F-06 existen o pueden existir
hoy.**

> **Consecuencia — el entregable de más valor de F-06 NO es la nav, es una PUERTA que no existe:**
> *«todo `href="#id"` de la nav resuelve a un id presente en el `dist/`, y falla cerrada»*. Esa
> puerta mata **además** el bug de `#facial`. Y el acceptance @1 se reescribe como **igualdad de
> conjuntos** derivada del DOM: *«la nav enlaza EXACTAMENTE a las secciones que EXISTEN en el
> artefacto, ni una de más (ancla muerta) ni una de menos (sección inalcanzable)»* — hoy da
> `{servicios, contacto} = 2`, y **crece solo** según cierran F-07/F-09/etc. → **B-4**. Los
> huérfanos `destacados`/`ofertas` → **B-7**. Y F-06 **no construye secciones**: su alcance es
> cabecera + nav + pie + la puerta de anclas + el scroll-padding derivado.

---

## 7. D1 — La altura de la cabecera · **la promesa @4 es insostenible bajo SSG**

**Medido en Chrome real (barrido 280–1600px al pixel):** la cabecera del prototipo toma **CINCO
alturas** — 231 / 190 / 149 / 108 / 70px — con saltos de envoltura en **282, 385, 647, 821px**.
**66px no acierta a ningún ancho; 70px solo a ≥821px.** Los **5rem (80px)** de F-04 solo bastan a
≥821px; por debajo se quedan cortos **28/69/110/151px**.

### 🔴 «Se deriva de la altura REAL» no lo sostiene ninguna técnica CSS pura

Verificado contra las specs del CSSWG: **no hay función de tamaño-de-elemento** en css-values-5;
`anchor-size()` **no es válida** en `scroll-padding-top` y exige caja absolutamente posicionada; las
**container queries** solo condicionan **descendientes** (`html` es ancestro del header); los
**porcentajes** de scroll-padding resuelven contra el **scrollport**, no contra un elemento.

**La única vía es JS** — es literalmente lo que hace el ejemplo de C43 con `offsetHeight`. Pero bajo
SSG **el HTML horneado no lleva esa custom property hasta que hidrata**, así que antes de hidratar
manda el **fallback estático del CSS: un número fijo**. La promesa se rompe **justo en la primera
carga**, que es cuando el usuario llega desde un enlace con `#ancla`.

**Y el consuelo «5rem escala con rem, luego cubre 1.4.4» es FALSO MEDIDO**: a raíz 32px (200%),
5rem=160px pero la cabecera en rem mide **590px** a 320w. La envoltura flex es **no lineal**; el rem
no la sigue.

> **Consecuencia:** el criterio @4 se reescribe en **dos capas honestas**. Capa 1 (obligatoria PARA
> F-06, criterio de proyecto): un `scroll-padding-top` **estático en CSS, correcto por sí solo sin
> JS**, dimensionado como **suelo seguro ≥ altura máxima medida** en el rango soportado (o una
> **tabla `@media` con los saltos medidos**) — sustituye los 5rem, no los hereda. Capa 2 (opcional):
> afinado JS (`ResizeObserver` → var) que **solo mejora** post-hidratación. **Las cifras hay que
> RE-MEDIRLAS sobre la nav definitiva** (cambiar «Facial» por «Pestañas/Cejas» mueve los saltos). →
> **B-2** (mismo eje que el scroll-padding).

---

## 8. E1 — Choque con las cuatro puertas · **un BLOQUEANTE nuevo: el className condicional es inmatable**

Tres de las cuatro puertas **no se rompen** (medido): F-05 terceros ignora los `<a href>` a
Facebook/Instagram (**@s12 existe justo para eso**), F-03 contraste ya tiene los pares de cabecera y
pie en `MATRIZ_DE_USO` (y la guarda es `< minimo`, así que **añadir** pares pasa; **no** hay que
tocar `MINIMO_DE_PARES`), F-01 placeholders no dispara. Pero:

### 🔴 (a) El pie con `<a href="/aviso-legal">` ROMPE el build

**Medido:** 2 violaciones «href interno sin fichero en dist/». Es **literalmente la fila 1 de la
tabla de `@s24`** (el bug del cliente). La nota *«el pie con los huecos de los enlaces legales»* de
`feature_list.json:101` es **troceado viejo que A-17 ya derogó**: F-04 (línea 64) reparte *«F-04 NO
emite los enlaces legales del pie: eso es F-16»*. **F-06 NO emite enlaces legales.**

### 🔴 (b) Un `className={cond ? 'a' : 'b'}` en TSX es INMATABLE bajo la regla del propio repo

**Medido con Stryker de verdad** (19 mutantes, 0 timeouts, tanda sana): `className={cond ?
'activo' : 'inactivo'}` genera **5 mutantes** (2 ConditionalExpression, 1 EqualityOperator, 2
StringLiteral) y **los 5 sobreviven** a una suite que consulta por rol/nombre accesible/texto — todo
lo que `feature_list.json:22` **permite**. **Solo mueren con `toHaveClass`**, que es la consulta por
clase CSS que esa misma línea **prohíbe**. Con umbral 1.0, **F-06 no cierra si escribe un className
condicional.** Es una colisión entre dos reglas del repo, no un fallo de Stryker.

> **La salida está medida y es barata:** `aria-current={cond ? 'page' : undefined}` —misma forma
> condicional, mismos mutadores— **muere 4/4 con consultas permitidas**. **Regla de diseño de
> F-06:** el estado condicional se expresa en un atributo **consultable** (aria-current, aria-
> pressed, data-*), y el className es **constante o derivado**. → escenario/nota en el contrato.

### Dos trampas de proceso, silenciosas

- **`mutate` de `stryker.config.json` es una lista EXPLÍCITA**: si F-06 crea
  `src/components/Cabecera.tsx` y **no lo añade**, Stryker **ni lo mira** y la tanda da 100% sin
  medir nada. **Y `vitest.config.ts` tiene otra lista** (`coverage.include: ['src/lib/**/*.ts']`):
  los `.tsx` quedan fuera del informe de cobertura. **Son DOS listas y hay que tocar las dos.**
- **Los atributos JSX literales NO generan mutantes**: `aria-label="Principal"` **no está protegido
  por la mutación** — lo aseveran los tests o la puerta del cascarón, jamás Stryker. No confundir
  «100% de mutación» con «el marcado está cubierto».

> **Y todo esto es [NV] hasta el primer `pnpm build` real**: se midió contra las funciones puras con
> fixtures propios, no contra un `dist/` real. *«Verde ≠ funciona»*: el primer build de F-06 es
> obligatorio y puede desmentir cualquier cosa (F-04 se llevó sus sustos justo ahí).

---

## 9. Las preguntas abiertas que van a la puerta humana

| # | Qué | Por qué no lo decido yo |
| --- | --- | --- |
| **B-1** | La `puerta_legal` (*«SC 2.4.11 foco no oscurecido»*) **roza el AAA**. Propuesta: reescribir a *«not entirely hidden» (AA)*, C43 como técnica de proyecto, cero números atribuidos a la norma. | Cambia la puerta legal declarada. |
| **B-2** | Acceptance @2 (*«scroll-margin no actúa al tabular»*) es **falso** y @4 (*«se deriva de la altura real»*) es **insostenible bajo SSG**. Propuesta: reescribir @2 con la razón correcta (scroll-padding va en el contenedor) y @4 en dos capas (suelo CSS estático medido + afinado JS opcional). | Cambia dos criterios de aceptación. |
| **B-3** | El breakpoint **767 es herencia muerta**; el medido es **793–806px**. Propuesta: `820px` como criterio de proyecto medido, **si hay menú móvil** (depende de B-5). | Cambia un criterio y un número. |
| **B-4** | Acceptance @1 (*«TODAS las secciones, no 7 de 11»*) es **insatisfacible** (hoy 2 secciones). Propuesta: **igualdad de conjuntos** derivada del DOM + **una puerta de anclas vivas nueva** (el entregable de más valor de F-06). | Reescribe el criterio central y añade una puerta. Es **A-23 otra vez**. |
| **B-5** | 🔴 **¿Menú móvil, sí o no?** Si **no** (CSS puro, como el prototipo): no aplica el patrón de memoria, no hace falta Radix, `radix-ui` **sale de `dependencies`**. Si **sí**: rama JS con red CSS + breakpoint 820px, o Radix. Es la **bifurcación de diseño** de la que cuelgan B-3, B-6 y el patrón A3. | Decisión de **producto y arquitectura**. |
| **B-6** | Si hay menú móvil: **¿Radix `Dialog` o `<button aria-expanded>` + `<nav>`?** Si Radix: **decidir `Portal` sí/no** (con Portal deja la anti-404 ciega → escenario obligatorio). Si no se usa Radix: **sale de `dependencies`**. | Decisión de arquitectura + dependencia. |
| **B-7** | `destacados` y `ofertas` son **huérfanos** (0 features los construyen). ¿La nav los ignora, o se registran como features/`no_se_construyen`? | Decisión de alcance del producto. |

**Decididos por mí y declarados en el contrato** (medidos o de proyecto): el pie **NO emite enlaces
legales** (A-17, ya cerrada; es de F-16) · el estado condicional va en un **atributo consultable**
(aria/data-*), no en el className (medido: inmatable si no) · los `.tsx` se añaden a **las dos
listas** (`mutate` + `coverage.include`) · **no** se toca `MINIMO_DE_PARES` (añadir pares pasa) ·
los `<a>` a Facebook/Instagram se pintan con tranquilidad (medido: exit 0) · el primer `pnpm build`
real es **obligatorio** y manda sobre todo lo anterior.
