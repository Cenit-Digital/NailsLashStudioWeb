# F-04 — Verificación previa al contrato (lead, 2026-07-16)

> **Qué es esto.** Las 9 afirmaciones que iban a sostener el contrato de `cascaron_semantico`,
> verificadas **contra fuente primaria antes de escribir una línea de spec**. Es la lección de
> F-03 aplicada por delante: allí el contrato llegó a la puerta con un fallo real porque heredó
> un número del audit sin recalcularlo. Aquí no se hereda nada.
>
> **Método:** 18 subagentes (9 afirmaciones × verificar + refutar adversarialmente), 817k tokens,
> 0 errores. Diario: `.claude/.../subagents/workflows/wf_adcaf0be-dd0/journal.jsonl`
>
> **Resultado: 4 CONFIRMADAS, 5 MATIZADAS, 0 refutadas de raíz.** Ninguna decisión de F-04 cae;
> **cinco justificaciones sí**. El patrón del día, otra vez: *la decisión es correcta, el porqué
> escrito es falso.*

---

## 1. `vite-react-ssg` + React 19 — **la bomba de F-04**

**Nadie había verificado esto nunca, y es donde vive la feature entera.**

Verificado **contra el código realmente instalado** (`node_modules/vite-react-ssg` 0.9.0), no
contra el README ni contra `main` de GitHub — con números de línea.

**La vía oficial es `<Head/>`** (único método documentado; **no** existe una propiedad `head` en
las rutas). Es un wrapper de `react-helmet-async` (dependencia **directa** `^1.3.0`, no *peer* →
sin conflicto con React 19; su peer de react admite `^19.0.0`).

**La cadena real, verificada:**

```
<Head> → HelmetProvider(context) → extractHelmet(appHTML, helmetContext, styleCollector)
       → metaAttributes → renderHTML: indexHTML.replace('<head>', '<head>' + metaTags)
```

Es **concatenación de strings sobre `index.html` en tiempo de build**, antes de cualquier
hidratación. El `title`/`meta`/`link` salen **horneados**. ✅

### ⚠️ T1 — La metadata nativa de React 19 PIERDE en el prerender

`extractHelmet` lee **exclusivamente del contexto de Helmet**. El parámetro `html` (=`appHTML`)
**solo** se usa para el `styleCollector`: **nunca se parsea buscando metadata**. Verbatim del
dist instalado (línea 429):

```js
function extractHelmet(html, context, styleCollector) {
  const { helmet } = context; ... let titleString = helmet.title.toString();
  const metaStrings = [titleString, helmet.meta.toString(), helmet.link.toString(), ...];
  const styleTag = styleCollector?.toString?.(html) ?? "";
```

El agente **auditó TODOS los escritores del `<head>`** en el dist (`grep "<head>"`): hay **dos**,
`metaAttributes` (:122-124) y `styleTag` (:920). **No existe ninguna ruta de código** por la que
un `<title>`/`<meta>` hoisteado nativamente por React 19 entre en el `<head>` prerenderizado.

> **Si F-04 usa metadata nativa de React 19, el `<head>` del build sale VACÍO.**
> Y estaría **verde en `pnpm dev`** y **verde en jsdom** (React lo hoistea en cliente al
> hidratar). **SEO cero en producción, con todos los tests en verde.**

Es **exactamente** el patrón de la memoria organizacional
(`red-css-para-rama-solo-js-en-ssg`): *bajo SSG el HTML horneado congela el estado que el JS iba
a corregir.* Ya ha mordido 3 veces en WebEmpresa. **Aquí mordería una cuarta.**

→ **El contrato DEBE prohibir explícitamente la metadata nativa de React 19 y mandar `<Head>`.**
No es preferencia de estilo: es la diferencia entre tener SEO y no tenerlo.

### ⚠️ T2 — La inyección es un `replace()` literal que falla EN SILENCIO

`indexHTML.replace('<head>', ...)` es **match de string exacto**, y `String.replace` con string
**no lanza si no encuentra**: devuelve el HTML intacto. Si alguien escribe `<head >`, `<HEAD>` o
`<head lang="es">` en `index.html`, **la inyección no ocurre y el build sigue VERDE con el
`<head>` vacío**. Verde por vacuidad, otra vez, un nivel más abajo.

→ Escenario obligatorio: **pinchar el literal `<head>`** de `index.html` y exigir rojo.
→ El contrato debe fijar que `index.html` contenga el literal exacto `<head>`, en minúsculas y
  sin atributos (hoy lo cumple: verificado sobre el fichero real del repo).

### T3 — `title` duplicado
Helmet inyecta su `<title>` justo **después** de `<head>`, **sin deduplicar** contra el
`index.html`. Hoy el `index.html` del repo **no** tiene `<title>` estático (verificado) → no hay
duplicado. Si alguien lo añade, habrá dos.

### Arquitectura y verificación
Seguir el precedente de F-01: **decisor PURO** en `src/lib/` que recibe `html: string` y devuelve
violaciones (testeable y mutable) + **humilde** en `tools/` que cablea `node:fs` y recorre
`dist/**/*.html`. **Nada de lógica en el humilde.**
**PROHIBIDO jsdom en este escenario** (daría verde en falso): se asevera sobre el **HTML CRUDO**
de `dist/`. Y **por CADA ruta prerenderizada**, no solo la home: la canónica es *por página* y el
fallo típico es que todas hereden la misma.

---

## 2. El sitio real del cliente — **aparece un `vatID` que nadie había visto**

### El 404 CONFIRMADO (medido con curl, no heredado)

| URL | Código |
| --- | ------ |
| `/es/aviso-legal` | **404** — *hard* 404 real (`HTTP/1.1 404 Not Found`, Apache). **No** es soft-404 |
| `/es/aboutcookies` | 200 |
| `/es/confidentiality_ws` | 200 |
| `/` | 200 |

**Son TRES enlaces en el pie, no uno.** El contrato solo contempla el aviso legal.

### 🔴 El hallazgo: hay un `vatID` escondido en el JSON-LD

```json
"@type": "LocalBusiness", "name": "NAILS LASH STUDIO",
"email": "centroesteticarozas@gmail.com", "vatID": "10656940"
```

Presente en `/` y en `/es/inicio`. **No se renderiza como texto visible: solo existe en el bloque
schema.org.** Por eso las verificaciones anteriores no lo encontraron.

**Pero «10656940» NO es un identificador válido.** Contrastado contra boe.es:

- **Persona jurídica** — Orden EHA/451/2008 art. 2: el NIF *«estará compuesto por nueve
  caracteres»* (letra + 7 dígitos + carácter de control). «10656940» son **8**, todos dígitos,
  sin letra ni control → **no es CIF**.
- **Persona física** — RD 1065/2007 art. 19.1: el NIF es el número del DNI *«seguido del
  correspondiente código o carácter de verificación, constituido por una letra mayúscula»*.
  No la lleva → **NIF incompleto**.
- **8 dígitos es exactamente la longitud de un número de DNI sin su letra.** Es verosímil que sea
  **el DNI del titular truncado**: es decir, **dato personal de una persona física**.

→ **NO desbloquea nada. Las features dependientes del CIF SIGUEN BLOQUEADAS.** El dato hallado no
sirve. Pero el contrato **debe dejar de decir** que «no existe ningún identificador en fuente
pública»: existe, y es inválido.

### 🚨 TRAMPA URGENTE — completar el NIF por algoritmo

> **La letra del DNI es DETERMINISTA** (módulo 23 sobre una tabla). Cualquier agente —o cualquier
> LLM de este pipeline, **incluido el lead**— puede calcularla en un segundo y «arreglar» el dato
> publicando `10656940<letra>`.
>
> **ESO SERÍA INVENTAR UN NIF.** Derivar el carácter de verificación **no acredita** que el número
> pertenezca al titular, ni que el titular sea persona física, ni que ese sea su NIF a efectos del
> art. 10.1 LSSI. Además **publicaría un dato personal** (posible DNI) de una persona física.
>
> El agente que lo encontró lo dejó escrito: *«YO NO HE CALCULADO LA LETRA Y EL CONTRATO DEBE
> PROHIBIRLO EXPLÍCITAMENTE.»*

→ **Escenario obligatorio:** *dado un identificador que no cumple el formato legal, el sistema lo
RECHAZA y bloquea la publicación; **NO lo completa, NO lo corrige, NO lo infiere**.*

### La política de privacidad existe (200) y está legalmente vacía

Art. 2 literal: *«El responsable del tratamiento de sus datos personales es la persona a cargo del
sitio web que utilizo y al que le comunico los datos.»* **Sin nombre, sin razón social, sin NIF,
sin domicilio.** Es texto plantilla del proveedor (Proximedia).

### 🔴 «Responde 200» es NECESARIO PERO NO SUFICIENTE

`/es/confidentiality_ws` es la **prueba viva**: **200 y jurídicamente nulo**. Un escenario que
solo compruebe `status == 200` **bendeciría** una página legalmente vacía: F-04 cambiaría un 404
por un 200 hueco y el test lo daría por bueno.

→ El escenario debe aseverar **además** que la página contiene los datos del art. 10.1.
→ **Consecuencia dura:** con lo hoy disponible en fuente pública **no se puede generar un aviso
  legal conforme**. F-04 debe declarar **dependencia bloqueante** de un dato que solo aporta el
  cliente. **El contrato no debe prometer un aviso legal completo.**

### Otros datos del JSON-LD actual (la lista de lo que NO copiar)
`addressLocality: "Las Ceudas"` (**confirmado**; debe ser *Las Rozas de Madrid*) ·
`"NAILS LASH STUDIO"` es **nombre comercial, no razón social** · dirección
`"AV.ATENAS 75 LOCAL 41 C.C.ZOCO MONTE ROZAS"` · CP 28232 · tel. +34625223366 ·
`email` solo en el JSON-LD, nunca visible. *(«Proximedia S.A.» aparece en la política de cookies:
es el **proveedor** de la web, no el cliente.)*

---

## 3. `aggregateRating` — la decisión es correcta, **el porqué es falso**

### ❌ Google NO lo prohíbe por *self-serving*

Es **INELEGIBILIDAD**, no prohibición. FAQ oficial, literal:

> *«Do I need to remove self-serving reviews from LocalBusiness or Organization? **No, you don't
> need to remove them.** Google Search just won't display review snippets for those pages anymore.»*
> *«Will I get a manual action for having self-serving reviews on my site? **You won't get a manual
> action just for this.**»*

→ **BORRAR del contrato** cualquier redacción tipo «Google prohíbe aggregateRating self-serving».
Es refutable con la FAQ oficial y **hunde la credibilidad del contrato entero**.

### ✅ La cita que SÍ sostiene la decisión, con fuerza de prohibición

Otra regla, **distinta e imperativa**, en *Technical guidelines*:

> *«**Don't aggregate reviews or ratings from other websites.**»*
> encabezada por: *«Warning: If your site violates one or more of these guidelines, then Google
> may take **manual action** against it.»*

El 4,9 · 1.231 vive en **Treatwell — otro sitio**. **Esta** es la cita.

### El motivo se escribe en TRES capas, porque son tres hechos distintos

| | Fundamento | Fuerza |
| - | ---------- | ------ |
| **(a)** | Google: *«Don't aggregate reviews or ratings from other websites»* | **Prohibición** (warning de manual action) |
| **(b)** | Google: una página con LocalBusiness/subtipo que puntúa sobre sí misma es *«ineligible for star review feature»* | **Inutilidad** (cero *upside* en SERP) |
| **(c)** | Treatwell cl. 4.2.2: el salón **no tiene derecho** sobre las reseñas | **Falta de título** — *no* es «prohibido republicar»: es que **no hay licencia**. Escribirlo como prohibición expresa sería inventar |

→ **(a) y (c) sostienen la decisión POR SEPARADO.** Si mañana Google derogase la regla
*self-serving*, (a) y (c) siguen vivos. **Eso hace la decisión robusta y hay que escribirlo así.**

### Aplicabilidad y trampas
Confirmado: *«If the entity that's being reviewed controls the reviews about itself, their pages
that use **LocalBusiness or any other type of Organization** structured data are ineligible…»*.
`NailSalon` = `Thing > Organization > LocalBusiness > HealthAndBeautyBusiness > NailSalon` → **cae
por las dos ramas**. El contrato debe decir *«LocalBusiness y cualquier subtipo, incluido
NailSalon»* — cerrar la escapatoria de *«es que yo uso NailSalon»*.

**Trampas con escenario propio:** (1) **alias de tipo** — aserción sobre el tipo *efectivo*, no
sobre el string `"LocalBusiness"`; (2) **nodo anidado** — `aggregateRating` reaparece dentro de un
`Service`/`Offer` del `@graph` → **recorrido recursivo**, no comprobación de primer nivel; (3)
**`Review` vs `AggregateRating`** — Google dice *«It applies to Review and AggregateRating»*:
prohibir **ambos**; (4) **propiedad suelta** — `ratingValue`/`reviewCount` sin el envoltorio.

---

## 4. LSSI art. 10.1 — **«en todas las páginas» NO está en la ley**

### ✅ Confirmado: los cuatro adverbios son literales
El art. 10.1 exige acceder *«por medios electrónicos, de forma **permanente, fácil, directa y
gratuita**»*.

### ❌ Refutado: el paréntesis «(aparece en todas las páginas)»

Escaneo léxico del **estatuto entero** (395.867 caracteres):
`"pie de página"` = **0** · `"todas las páginas"` = **0** · `"cada página"` = **0** ·
`enlace` = 6, **todas en el art. 17** (intermediarios), nada que ver con el art. 10.

**El dato que lo cierra:** *«página de inicio»* **sí** aparece 4 veces (art. 39.3.a, publicación
de la resolución sancionadora). **El legislador TIENE vocabulario para localizar algo en una
página concreta y eligió no usarlo en el art. 10.**
**Contraindicio:** el art. 10.2 resuelve el cumplimiento con *«su página **o** sitio de Internet»*
— singular. Contempla que la obligación se satisfaga en **UNA** página.

→ **Redacción honesta:** «LSSI art. 10.1 exige acceso permanente, fácil, directo y gratuito.
**Decisión del proyecto**: enlace en el pie de todas las páginas como medio de cumplimiento — el
art. 10.2 admite "página o sitio", luego el pie global es **SUFICIENTE, no NECESARIO**.»
La distinción suficiente/necesario **es la que salva al contrato de mentir**.

### 🔴 TRAMPA — «permanente» es TEMPORAL, no espacial

El contrato confunde los ejes. *Permanente* = disponible siempre **en el tiempo**. *En todas las
páginas* = presente en todo el **espacio** del sitio.

> Un test que solo verifique «el enlace está en el pie de las N páginas» da **VERDE mientras se
> incumple de verdad** (destino 404, gateado tras login, caducado) y da **ROJO en un caso lícito**
> (art. 10.2). **Es exactamente el 404 del cliente**: el enlace está en el pie, y el destino no
> existe.

→ **Un escenario por adverbio**: **permanente** (el destino responde 200 **y es estable**;
escenario negativo **obligatorio**: enlace presente + destino roto → **debe FALLAR**) · **fácil**
(alcanzable en clics acotados, texto reconocible) · **directa** (al contenido, no a un
intermediario; trampa: PDF o formulario) · **gratuita** (sin muro, sin registro).

### Dos huecos más
1. **Falta el art. 10.1.f) — precios.** Es un estudio de uñas/pestañas: **si la web muestra
   tarifas, f) se activa** y obliga a indicar si el precio incluye impuestos. Con a), es el único
   párrafo del 10.1 que puede escalar a **GRAVE (30.001–150.000 €)**. Riesgo real y no cubierto.
2. **Toda cita de la LSSI debe declarar VERSIÓN.** El art. 10 tiene **4 versiones** y el art. 38
   **10** (última 23-01-2025). Una cita sin versión es incomprobable.
3. **La calificación sancionadora no es plana**: ni «grave» ni «leve» — depende de *«significativo»*
   (art. 38.3.b), concepto indeterminado. El contrato debe reflejar el condicional o callarse.

---

## 5. WCAG — dos atribuciones falsas y **un hueco que importa**

### ❌ `SC 1.3.1` NO exige «exactamente un h1» ni landmarks
Verificado fetcheando la página completa: **ninguna frase sobre número de h1 existe en toda la
norma**. `ARIA11`/`H101`/`ARIA20` son **técnicas suficientes** (en OR), no requisitos.

→ Mantener ambas como **CRITERIO DE PROYECTO** (son buenas reglas, se testean igual). **Lo
prohibido es la atribución normativa.** El escenario que **sí** mide 1.3.1: *una relación que el
diseño comunica visualmente debe existir en el código* (título de sección → heading real +
`section aria-labelledby`, no un `div` con `font-size`).

### Los otros tres
- **`SC 3.1.1` (A)** — no «exige lang»: exige que el idioma sea **determinable por código**; en
  HTML se satisface con `lang` en `<html>` (**H57, técnica suficiente**). *(Que un `lang`
  incorrecto falle es **inferencia**, no frase citable: márcalo como tal.)*
- **`SC 2.4.2` (A)** — el listón normativo es *«describe topic or purpose»*. **Cero requisito de
  unicidad.** La composición del `title` es **regla de PROYECTO/SEO**, legítima, **nunca WCAG**.
- **`SC 2.4.7` (AA)** — `G165` (foco por defecto) y `C45` (`:focus-visible`) son **ambas
  suficientes**. **CERO requisito de contraste o grosor**: el 3:1/2px es **`SC 2.4.13`, y es AAA**.
  → **PROHIBIR** atribuir cualquier umbral a 2.4.7. *(Es la trampa gemela del 1.4.11 de F-03.)*

### ✅ EL HUECO: `SC 2.4.11 Focus Not Obscured` (AA, **nuevo en WCAG 2.2**)
Su *Understanding* **nombra literalmente los sticky headers**, y su técnica suficiente es **`C43`
Using CSS scroll-padding to un-obscure content**. **F-04 monta una cabecera sticky.** No estaba en
la lista de `puerta_legal` de F-04. *(F-06 ya lo contempla; hay que decidir de quién es.)*

---

## 6. `BeautySalon` — la jerarquía declarada es inexacta, y **dos autoridades distintas**

### La jerarquía real (literal de schema.org) — herencia **múltiple**
```
Thing > Organization > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
Thing > Place        > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
```
El padre **directo** es `HealthAndBeautyBusiness`; `LocalBusiness` es ancestro. Decir «BeautySalon,
subtipo de LocalBusiness» es cierto **transitivamente** y falso como jerarquía — y **borra el
mecanismo que justifica el contrato**: la **ruta dual** es lo que hace válidas a la vez `address`
(vía `Organization`) y `geo` (vía `Place`).

### 🔴 Dos autoridades, y el contrato debe separarlas

| | schema.org (validez de vocabulario) | Google (elegibilidad de rich result) |
| - | ----------------------------------- | ------------------------------------ |
| Obligatorio | **NADA.** Cero propiedades. Un JSON-LD con solo `@type` es **válido** | **`name`** (Text) y **`address`** (PostalAddress) |
| Recomendado | — | `geo`, `openingHoursSpecification`, `telephone`, `priceRange`, … |

*(Verificado por ausencia citable: en `schema.org/BeautySalon` y `schema.org/LocalBusiness` **no
existe ninguna frase** que marque propiedad alguna como *required*.)*

→ **Prohibir en el contrato la palabra «obligatorio» sin sujeto explícito.** Todo «obligatorio»
debe leerse «obligatorio **para** \<schema.org|Google\>». Ningún escenario puede afirmar «falla
porque schema.org obliga a X»: sería falso.
→ **FIJAR `name`.** La afirmación original no lo menciona y es requisito de Google: **es el hueco
más caro** de la redacción actual.
→ Exigir `PostalAddress` (y no `Text`) en `address` es **decisión de proyecto más estricta que el
vocabulario** — declararlo, o el siguiente lector creerá que lo impone schema.org.
→ Google respalda el subtipo: *«Use the most specific LocalBusiness sub-type possible»*.
→ Y no garantiza nada: *«Google does not guarantee that features that consume structured data will
show up in search results.»*

### Trampas
1. **`priceRange` es Text, no número.** Literal: *«for example $$$»*. Un `"priceRange": 25` es
   sintácticamente válido y **basura semántica**: nadie lo rechaza, degrada en silencio.
2. **`openingHours` vs `openingHoursSpecification` coexisten** y ambas son válidas por ramas
   distintas. Si el contrato no fija **cuál**, dos implementadores eligen distinto y **ambos pasan
   los tests**. Google solo recomienda `openingHoursSpecification` → fijar esa y **prohibir la
   mezcla**.
3. **`address` admite `Text`** además de `PostalAddress`: un string pasa la validación.

---

## 7. `geo` — ✅ CONFIRMADO, y con mejor prueba que la que traía

**La constante se queda: `40.5179875, -3.9226688`.**

- Reverse de Nominatim del punto **exacto**: *«Bar Cañas, 75, Avenida de Atenas, Las Rozas de
  Madrid, Comunidad de Madrid, 28232, España»*. Haversines recalculadas de forma independiente
  (R=6371008.8): **10,8 m** Bar Cañas · **14,0 m** nodo del mall · 21,4 m · 23,8 m · 28,5 m.
- **El refutador MEJORÓ la prueba del verificador**, que había escrito «dentro del C.C. El Zoco»
  teniendo solo 14 m a un **nodo** — *«un nodo es un centroide, no una huella: esa frase excedía su
  prueba»*. Lo zanjó con **point-in-polygon (ray casting)** contra Overpass +
  `api.openstreetmap.org`: el punto cae **geométricamente DENTRO** de `way/34502818`
  `{building=yes, shop=mall, name="Centro comercial Zoco Rozas"}`. Los otros 4 edificios del radio
  de 80 m dan **fuera**.
- **Límite honesto declarado:** verificado a nivel de **EDIFICIO**, nunca de **Local 41**
  (Nominatim devuelve `[]` para «Nails Lash Studio Las Rozas»). → **Un escenario que afirme
  «geo == Local 41» afirma más de lo que ninguna fuente sostiene.** El escenario correcto: el
  JSON-LD emite **exactamente la constante acordada** y muta si alguien la toca. **Jamás la
  recalcula ni la "corrige" desde OSM.**
- **El CP se fija a 28232** (dato del cliente): **no verificar el CP contra OSM** — OSM se
  contradice a sí mismo (nodo del mall 28242 vs nodos del nº 75 en 28232) y `way/34502818` no
  lleva `addr:postcode`.
- Acción documental: en `docs/research/01-hechos-verificados-lead.md:73` sustituir *«Fresha (no
  verificado por mí)»* por esta verificación OSM.

---

## 8. TRLGDCU art. 60.4 — la cita **no** es inventada, pero el alcance sí está mal

**El art. 60.4 SÍ habla de castellano.** No procede refutar. Pero:

- *«al menos»* es un **suelo**, no exclusividad.
- *«de forma gratuita»* existe en la norma y **el contrato lo omite**.
- **El ámbito es la información precontractual del art. 60.2** (identidad con razón social,
  dirección, teléfono, precio total con impuestos, duración, desistimiento, reclamaciones) —
  **NO el JSON-LD**, y **no se satisface con `html lang=es`** (eso es WCAG SC 3.1.1, obligación
  distinta).

→ `feature_list.json:109` debe reescribirse. Y marcar como **[I] interpretación** —no [V]— la
frase «el 60.4 no alcanza al JSON-LD»: se **deduce** de que la norma habla de información
*«facilitada al consumidor»*; no es letra expresa. **El contrato no debe presentar como literal lo
que es lectura razonada.**

---

## 9. Lecciones de MÉTODO (valen para cualquier verificación futura)

1. **🔴 El resumen de `WebFetch` MIENTE.** Declaró *«No link to Política de privacidad appears in
   the footer»*. **Es FALSO**: solo apareció al hacer `grep` del **HTML crudo**. Es la misma clase
   de fallo que el informe de mutación con timeouts de F-03. → **Para negar la existencia de algo,
   ve al crudo.**
2. **Una AUSENCIA en un volcado resumido NO es prueba de ausencia en la fuente.** El primer volcado
   del *Understanding* de 1.3.1 devolvió la lista **sin `H101`**, haciendo parecer inventada una
   cita **correcta**. *«Un verificador perezoso habría gritado "REFUTADA" y habría destruido una
   cita buena.»* Un fetch dirigido lo confirmó.
3. **El snippet del buscador es la vía por la que entran las citas fantasma.** El verificador citó
   como WCAG 2.2 una frase que **solo existe en 2.0/2.1**; el buscador afirmaba que estaba en las
   *Understanding* actuales, y el fetch directo lo desmintió. → **Toda cita lleva versión Y se
   comprueba en la página de ESA versión.**
4. **🔴 La API de datos abiertos del BOE ordena los bloques de versión por PUBLICACIÓN, no por
   vigencia.** El bloque `BOE-A-2021-17910` lleva `fecha_vigencia="20220528"` —**posterior** al
   `20220302` de la Ley 4/2022— y muestra la redacción **corta** del art. 60.4. **Quien
   re-verifique vía API y coja «el bloque con la vigencia más tardía» concluirá que la forma corta
   es la vigente y REVERTIRÁ el contrato**, reintroduciendo la cita truncada que este hallazgo
   corrige. → **Verificar en `act.php` sin pinear fecha; NUNCA ordenando bloques de la API por
   `fecha_vigencia`.**
5. **Distinguir siempre**: letra de la norma ≠ técnica suficiente · vocabulario ≠ Google ·
   prohibición ≠ inelegibilidad ≠ falta de título · interpretación ≠ cita.
