# Borrador de spec — F-12 `contacto`

> **Estado:** DRAFT del `spec_partner`, redactado por delegación de Pablo
> («yo preparo, tú apruebas en lotes»). Llega a la puerta con todo resuelto y
> una recomendación por decisión. **Objetivo AHORA: prototipo DEMO con datos
> placeholder.** No es todavía sección de `project-spec.md`; se traslada allí
> cuando el humano cierre las **DECISIONES PARA LA PUERTA**.
>
> Fuentes leídas (no inventadas): `feature_list.json` §12, `src/lib/site.ts`
> (F-02, done), `src/pages/home.tsx` (stub `#contacto-titulo`),
> `src/components/Pie.tsx` (Facebook + `tel:` en el pie, F-06),
> `docs/research/datos-google.md` §3.5 (handle IG) y §5.2.

---

## Propósito

Una frase: **reunir el contacto del salón en la sección `#contacto` de la home
—dirección, teléfono `tel:` prominente en móvil e Instagram— con todos los
enlaces DERIVADOS de la fuente única F-02 (nunca hardcodeados), de modo que
exista una vía de contacto accesible que NO dependa de WhatsApp.**

---

## Comportamiento (qué hace, en prosa precisa)

F-12 **enriquece la sección `#contacto` que ya existe** en `home.tsx` (no crea
una nueva). Hoy ese stub —dejado por F-04 y validado por la puerta de anclas
vivas de F-06— contiene: `<section aria-labelledby="contacto-titulo">`, su
`<h2 id="contacto-titulo">Contacto</h2>`, un `<p>` con la dirección derivada de
`DIRECCION` y un `<a href={telHref(...)}>` con el teléfono. F-12 lo amplía así:

1. **Dirección** (ya presente): texto legible derivado de `DIRECCION` (F-02).
   La dirección postal completa es el dato de contacto; el **mapa estático + el
   enlace «Cómo llegar» + la mención explícita «Planta 0, Local 41» son F-11**
   (frontera declarada abajo). F-12 no incrusta mapa ni añade el «Cómo llegar».
2. **Teléfono `tel:` prominente en móvil**: un `<a href={telHref(TELEFONO.legible)}>`
   con texto visible `625 22 33 66`. El `href` es `tel:+34625223366` (E.164,
   ya normalizado por F-02). «Prominente en móvil» = tratamiento visual/CSS que
   lo hace destacar y cómodo de pulsar en pantallas pequeñas.
3. **Instagram `@nailslash.studio_`** (handle VERIFICADO; **NO** el
   `@nail_lash_studio_` del directorio del centro, no verificado —
   `datos-google.md` §3.5). Se muestra como enlace cuyo `href` DERIVA del handle
   de F-02 mediante una función `instagramHref` (ver Contrato y Decisión D-1).
4. **Facebook**: permanece **en el pie** (F-06 ya lo emite, `Pie.tsx`) **sin
   peso visual**. F-12 **no** lo duplica en la sección de contacto ni le añade
   protagonismo. Instagram es la red destacada del contacto; Facebook, el enlace
   discreto del pie.
5. **TikTok NO aparece** en ninguna parte del artefacto (no verificado; F-02 no
   lo guarda). Es una aserción NEGATIVA comprobable (Casos límite).
6. **Email**: **NO se muestra en la DEMO** (bloqueado para publicar, sin
   confirmar). Ver Decisión D-3 y Preguntas abiertas.

La información resultante (teléfono pulsable + dirección + Instagram) es la
**vía de contacto accesible independiente del canal** que exige la
`puerta_legal` (RD 193/2023 art. 14.1): el usuario puede contactar sin necesidad
de tener WhatsApp instalado.

---

## Contrato (entradas, salidas, errores)

### Función nueva propuesta: `instagramHref(handle)` en `src/lib/site.ts`

Es el **único núcleo mutable** de F-12 (el resto es render + CSS). Hermana de
`telHref`/`waHref`: deriva la URL pública del perfil a partir del **handle**
guardado en `REDES.instagram`, para que el enlace no diverja del dato único.

| Entrada | Salida | Notas |
| --- | --- | --- |
| `instagramHref('@nailslash.studio_')` | `'https://www.instagram.com/nailslash.studio_/'` | Quita el `@` inicial, antepone el host `https://www.instagram.com/`, cierra con `/`. |
| `instagramHref('nailslash.studio_')` (sin `@`) | **decisión** (ver D-1a): aceptar y derivar igual, **o** fallar cerrado | El dato canónico SIEMPRE trae `@`; la ruta normal nunca ve la variante sin `@`. |
| `instagramHref('')` / handle inválido | **falla cerrada** (`throw`), igual que `numeroNacional` ante basura | No emitir una URL a medias que parezca válida. |

- **Anti-hardcode (invariante heredado de F-02):** cambiar `REDES.instagram` en
  el ÚNICO sitio (site.ts) cambia el `href` del enlace de Instagram en el
  artefacto. Ningún componente hornea la URL literal.
- **Anti-tautología (regla del repo):** el test de `instagramHref` compara
  contra el literal `'https://www.instagram.com/nailslash.studio_/'` escrito a
  mano, NUNCA contra una constante importada de producción.

### Enlace de teléfono (ya derivado por F-02)

- `href` = `telHref(TELEFONO.legible)` → `tel:+34625223366`.
- Texto visible = `TELEFONO.legible` (`625 22 33 66`).
- Modo de error: `telHref` ya falla cerrado ante un teléfono no español válido
  (F-02, `@s11`). F-12 no reimplementa normalización.

### Salidas del artefacto (lo que TDD/mutación aseveran sobre el render)

- La sección `#contacto` contiene: dirección (texto de `DIRECCION`), un
  `tel:` con `href` E.164 y texto legible, y un enlace de Instagram con `href`
  derivado del handle.
- **NO** contiene: ninguna referencia a TikTok (ni `tiktok.com` ni el texto
  «TikTok»), ningún botón/flujo de reserva por WhatsApp (es F-13), ningún email.
- Facebook NO se emite dentro de `#contacto` (sigue solo en el pie, F-06).

---

## FRONTERA DE ALCANCE (declarada explícitamente)

### 🔴 Con F-13 `solicitud_whatsapp` (XL, APLAZADO) — la frontera central

- El `acceptance` de F-12 dice *«Junto al botón de WhatsApp hay una alternativa
  accesible (teléfono)»*. Pero **el botón/flujo de reserva por WhatsApp es F-13**,
  no F-12.
- **Decisión de alcance para la DEMO:** **F-12 construye la alternativa
  accesible (el `tel:` real, la dirección y las redes) como entregable
  autónomo. F-12 NO construye el botón de WhatsApp.** Cuando F-13 aterrice,
  colocará su botón en/junto a esta misma sección `#contacto` y la alternativa
  accesible ya estará ahí, a su lado.
- Reinterpretación del criterio para la DEMO: *«existe una alternativa de
  contacto accesible por un canal que no requiere WhatsApp (el `tel:`), presente
  en la sección de contacto»*. La adyacencia física «junto al botón» se cierra
  con F-13; F-12 garantiza que la alternativa EXISTE y es prominente.

### Con F-11 `mapa_como_llegar`

- F-12 muestra la **dirección como texto**. El **mapa estático autohospedado**,
  el enlace **«Cómo llegar»** (Maps en pestaña nueva) y la mención **«Planta 0,
  Local 41»** son de F-11. F-12 no los construye.

### Con F-06 `header_nav_footer` (done)

- **Facebook y el `tel:` del PIE ya existen** (`Pie.tsx`). F-12 NO los toca ni
  los duplica. F-12 opera en la sección `#contacto` del `<main>`, no en el pie.

---

## Casos límite (para TDD / mutación)

1. **`href` derivado que cambia con el dato único.** Si se cambia
   `REDES.instagram` (o `TELEFONO.legible`) en site.ts, el `href` del enlace en
   el artefacto cambia en consecuencia. Mutar la derivación (no quitar el `@`,
   quitar el host, quitar la `/` final) rompe un test.
2. **`tel:` normalizado a E.164.** El `href` es exactamente `tel:+34625223366`
   para el número legible con espacios; heredado de F-02. Mutar el resultado
   esperado (quitar el `+`, el `34`, dejar los espacios) rompe un test.
3. **Ausencia de TikTok.** El artefacto de la sección de contacto NO contiene
   `tiktok` (case-insensitive) ni el texto «TikTok». Aserción negativa que falla
   si alguien añade un enlace de TikTok. (Como F-02 no guarda TikTok, el estado
   base es 0; el test lo BLINDA.)
4. **Handle IG correcto, no el alternativo.** El `href` deriva de
   `@nailslash.studio_` y produce `.../nailslash.studio_/`, NUNCA
   `.../nail_lash_studio_/` (el no verificado del directorio).
5. **Handle vacío / inválido → falla cerrada.** `instagramHref('')` lanza, no
   emite `https://www.instagram.com//`.
6. **El email NO se filtra al artefacto.** La sección de contacto NO contiene
   `centroesteticarozas@gmail.com` ni un `mailto:` (mientras esté sin confirmar).
   Aserción negativa que protege contra publicar un email no verificado.
7. **Facebook NO se cuela en `#contacto`.** La sección de contacto no emite el
   enlace de Facebook (sigue siendo exclusivo del pie, F-06). (Blinda la
   frontera de peso visual.)

> **Nota de mutación / no-mutable:** la lógica mutable de F-12 es
> `instagramHref` (derivación pura). La «prominencia en móvil» del `tel:` y el
> «sin peso visual» de Facebook son **CSS** → Stryker no ve SCSS: se DECLARA
> no-mutable (como F-08), no se finge cobertura. Las aserciones negativas
> (TikTok, email, Facebook fuera de `#contacto`) se aseveran sobre el render.

---

## Decisiones (cada una con su razón y la alternativa descartada)

- **D-1 · Instagram como enlace DERIVADO vía `instagramHref` en site.ts.**
  El dato canónico de F-02 es el **handle** `@nailslash.studio_`, no una URL
  (decisión deliberada anotada en `Pie.tsx`: *«hornear la URL sería
  HARDCODEARLA»*). Para enlazar Instagram sin hardcodear, se añade una
  derivación pura, hermana de `telHref`/`waHref`, que convierte el handle en URL.
  Esto da además a F-12 su núcleo mutable (`feature_list` la marca `mutable:true`).
  - *Alternativa descartada A:* guardar la URL completa de IG en `REDES`.
    Contradice la nota de site.ts y reintroduce la divergencia texto/href que
    F-02 existe para matar.
  - *Alternativa descartada B:* mostrar el handle como texto plano sin enlace.
    Pierde utilidad como canal de contacto y deja a F-12 sin lógica mutable
    (chocaría con `mutable:true`).
  - *Nota de alcance:* añadir `instagramHref` **extiende** site.ts (F-02) con
    una función nueva; **no modifica** el comportamiento existente de F-02 ni
    rompe sus tests. Lo implementa el `tdd_craftsman` de F-12 por TDD. → **Es una
    DECISIÓN PARA LA PUERTA** (tocar el módulo de una feature done).

- **D-2 · Reutilizar el stub `#contacto-titulo` existente, no crear sección
  nueva.** Ese `<section aria-labelledby="contacto-titulo">` ya está cableado en
  la igualdad de conjuntos de la nav (F-06) y en la estructura de landmarks
  (F-04). Enriquecerlo mantiene un único destino de ancla.
  - *Alternativa descartada:* crear una sección de contacto nueva. Generaría
    anclas huérfanas/duplicadas y rompería la puerta de anclas vivas de F-06.

- **D-3 · El email NO se muestra en la DEMO (se OMITE hasta confirmación del
  cliente).** `centroesteticarozas@gmail.com` aparece SOLO en el JSON-LD de la
  web actual, NUNCA visible, y está sin verificar (`datos-google.md` §4.3,
  bloqueado para publicar). La vía de contacto accesible ya queda cubierta por
  `tel:` + dirección + Instagram (+ WhatsApp cuando llegue F-13), así que la
  DEMO no necesita email. El email como **campo legal** pertenece además a F-16.
  - *Alternativa descartada:* introducir el email como placeholder cableado a la
    puerta F-01 (rompería el build de producción hasta confirmarlo). Añade
    superficie de F-01 por un dato que ni siquiera es visible hoy y cuyo hogar
    natural es F-16. → **Es una DECISIÓN PARA LA PUERTA.**
  - **NO se da el email por bueno sin confirmación del cliente** (regla dura).

- **D-4 · Facebook permanece en el pie sin peso visual; Instagram es la red del
  contacto.** Respeta el reparto del `acceptance` («Facebook en el pie sin peso
  visual») y no duplica enlaces. F-06 ya emite Facebook en el pie.
  - *Alternativa descartada:* llevar Facebook a la sección de contacto. Le daría
    peso visual que el requisito niega y duplicaría el enlace.

- **D-5 · «Prominente en móvil» y «sin peso visual» son CSS (criterio de
  proyecto), no puerta unitaria.** Stryker no ve SCSS. La existencia y
  derivación del `tel:`/IG SÍ se testean; la prominencia se verifica visualmente.
  - *Nota:* NO se atribuye a WCAG un umbral de tamaño de objetivo. SC 2.5.8
    (Target Size Minimum, AA en 2.2) existe y podría querer aplicarse al `tel:`,
    pero **no se cita como puerta** sin decisión explícita (el repo prohíbe la
    atribución normativa a la ligera). Ver Preguntas abiertas.

---

## Preguntas abiertas de esta feature — **PENDIENTE DE PUERTA HUMANA**

- **[ABIERTA · dato del cliente] Email de contacto.** Sin confirmar
  (`centroesteticarozas@gmail.com` no es visible en ninguna fuente pública y
  puede no ser el canal deseado). D-3 lo OMITE en la DEMO. *No se publica ni se
  da por bueno sin el cliente.* — *toca `bloqueada_para_publicar` de F-12.*
- **[ABIERTA · dato del cliente] Handle de Instagram.** Se usa
  `@nailslash.studio_` por ser el que el propio negocio declara en su GBP
  (`datos-google.md` §3.5), pero está **pendiente de confirmación** (login wall;
  circula también `@nail_lash_studio_`). La DERIVACIÓN es correcta sea cual sea
  el handle; el DATO lo confirma el cliente.
- **[ABIERTA · norma] Tamaño de objetivo táctil del `tel:` (SC 2.5.8).**
  ¿Se adopta como criterio explícito y testeable, o se deja como CSS verificado
  a ojo? D-5 propone lo segundo, sin atribuir umbral a WCAG. — *podría abrir un
  criterio de aceptación.*

---

## DECISIONES PARA LA PUERTA (recomendación del lead por cada una)

1. **`instagramHref` en site.ts (D-1).** ¿Se añade la derivación pura del handle
   a URL en el módulo de F-02 (done)?
   → **RECOMENDADO: SÍ.** Es la forma anti-hardcode que el propio `Pie.tsx`
   anticipa, da a F-12 su núcleo mutable y no altera el comportamiento de F-02.
   Alternativa (handle como texto) deja F-12 sin lógica y con IG no clicable.

2. **Email en la DEMO (D-3).** ¿Se OMITE hasta confirmar, o se muestra como
   placeholder bloqueado por F-01?
   → **RECOMENDADO: OMITIR.** No es visible ni verificado; el contacto accesible
   ya está cubierto; su hogar como campo legal es F-16. Cablearlo a F-01 añade
   superficie por un dato fantasma. **No se da por bueno sin el cliente.**

3. **Reutilizar el stub `#contacto-titulo` (D-2).** ¿F-12 enriquece la sección
   existente en `home.tsx`?
   → **RECOMENDADO: SÍ.** Un único destino de ancla; respeta las puertas de
   F-04 y F-06. Crear otra sección rompería la igualdad de conjuntos de la nav.

4. **Frontera con F-13 (alcance central).** ¿F-12 entrega SOLO la alternativa
   accesible (`tel:` + dirección + redes) y NO el botón de WhatsApp?
   → **RECOMENDADO: SÍ.** El botón/flujo es F-13 (XL, aplazado). F-12 deja la
   alternativa lista para que F-13 coloque su botón al lado.

5. **`@nailslash.studio_` como handle de la DEMO.** ¿Se acepta el handle del GBP
   a la espera de confirmación del cliente?
   → **RECOMENDADO: SÍ para la DEMO**, marcado `bloqueada_para_publicar` /
   pendiente de confirmación. La derivación es correcta con cualquier handle.
