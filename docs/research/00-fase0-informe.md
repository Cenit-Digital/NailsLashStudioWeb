# Fase 0 — Informe maestro

> **Fecha:** 2026-07-16 · **Autor:** sintetizador de Fase 0 (`craftsman_lead`)
> **Entrada:** `01-hechos-verificados-lead.md` (prioritario) + 21 informes en bruto
> (`legal-*`, `datos-*`, `audit-*`, `stack-*`), de los que un verificador adversarial
> **refutó 22 afirmaciones**.
> **Salida:** este archivo es la única fuente destilada de la Fase 0. Lo que no está
> aquí, o está en §9 (no usar), o no está verificado.

## Convención de este informe

Cada afirmación va etiquetada. **No hay afirmaciones sin fuente.**

- **[V]** hecho verificado — con URL oficial o `archivo:línea`.
- **[V-LEAD]** verificado de primera mano por el lead en `01-hechos-verificados-lead.md`. **Prioritario.**
- **[V-SINT]** verificado de primera mano **por mí al escribir este informe** (fetch/lectura propia el 2026-07-16). Se indica el comando o el archivo.
- **[I]** inferencia razonada sobre hechos verificados. Discutible.
- **[NV]** NO VERIFICADO / desconocido.

> **Aviso.** Esto es investigación técnico-normativa, **no asesoramiento jurídico**. Antes
> de publicar, los textos legales y los puntos marcados «abogado» en §4 deben pasar por un
> profesional con los datos reales del titular delante.

---

## 1. Resumen ejecutivo — las 10 conclusiones que cambian el proyecto

**C-01. No es una web nueva: es un rediseño con migración.** El salón **ya tiene web
publicada**: <https://www.nailslashlasrozas.es/> (HTTP 200, 51.064 bytes) **[V-SINT: `curl` propio]**,
one-page antigua con `lastmod 2022-12-01` **[V-LEAD]**. El dominio real es
`nailslashlasrozas.es`, **no** `nailslashstudio.com` que inventó el prototipo **[V-LEAD]**.
→ Consecuencia: hay que decidir migración, 301 y qué pasa con el dominio. **Requiere cliente.**

**C-02. La web viva incumple la LSSI, y eso es a la vez argumento de venta y trampa a no repetir.**
El pie enlaza `href="/es/aviso-legal"` y esa URL devuelve **HTTP 404** **[V-SINT: `curl -o /dev/null -w %{http_code}` → `404`]**;
`/es/confidentiality_ws` responde 200 pero es una plantilla que **no identifica al responsable**
(«la persona a cargo del sitio web») **[V-LEAD]**. Tipo vigente: **art. 38.4.b) LSSI**, leve
(hasta 30.000 €) por los datos del art. 10.1 b)-e)-g); **art. 38.3.b)** grave si el
incumplimiento de a)/f) es *significativo* **[V: `legal-lssi.md` §2.5.1, API BOE bloque `a38`]**.

**C-03. El bloqueo de publicación es un hecho verificado, no una precaución — pero la web actual
regala dos datos que convierten «danos esto» en «confírmanos esto».** No hay razón social ni
NIF/CIF en ninguna fuente pública **[V-LEAD]**. **Hallazgo nuevo mío:** el JSON-LD de la home
actual (único bloque `application/ld+json`) contiene `"email": "centroesteticarozas@gmail.com"`,
`"vatID": "10656940"` y `"addressLocality": "Las Ceudas"` **[V-SINT: fetch + parseo propio]**.
Los tres son **inservibles tal cual**: el email **no se muestra en ninguna parte visible de la
página** (comprobado eliminando todos los `<script>`: 0 apariciones fuera de ellos) **[V-SINT]**,
el `vatID` tiene **8 caracteres** cuando un NIF español tiene 9 → **malformado** **[V: `datos-redes.md:61`]**,
y la localidad es errónea. → **No se usan.** Pero cambian dos preguntas al cliente de abiertas
a cerradas (§8).

**C-04. El prototipo se equivoca de CATEGORÍAS, no solo de datos — y las dos fuentes reales no
coinciden entre sí.** El titular declara en su propia web: **Uñas · Pestañas · Cejas** **[V-LEAD]**.
La «Facial» del prototipo **no existe** en el negocio **[V-LEAD]**. Pero **Treatwell no vende ni
un servicio de pestañas** y sí vende Pedicura (6) y Depilación (3) **[V: `datos-treatwell-ficha.md:69-79`]**.
→ La estructura de 3 categorías se conserva; su contenido es **Uñas · Pestañas · Cejas** (manda el
titular), y la contradicción Treatwell↔web propia **la cierra el cliente**, no nosotros.

**C-05. La paleta ya cerrada NO cumple WCAG AA, y no es un problema de estética sino de tokens.**
De **68 combinaciones reales, 32 fallan AA (47%)** **[V: `audit-a11y.md` §2.5, fórmula W3C G17
ejecutada en `contrast.py`]**. Fallan el **botón «Reservar»** (blanco sobre `#C05576` = **4,37:1** < 4,5),
el **precio** (4,37:1), la **nav** (`--muted` 3,35:1) y **todo el pie**. La causa raíz: la paleta
**confunde «color de marca para rellenos» con «color de texto»**. Se arregla **sin inventar
colores**: `--accent-dark #A23E5F` ya existe y pasa en los 4 fondos (mín. 4,86:1) **[V]**.
→ La decisión 5 (solo Rosa) **no se reabre**; se corrigen **7 tokens** (§4, §7 F-03).

**C-06. La exención de microempresa NO nos salva: la accesibilidad es obligatoria por otra vía.**
El EAA (Ley 11/2023) exime a las microempresas que prestan servicios (**art. 3.3**) **[V]**, pero
el **RD 193/2023 art. 14.2** obliga a **todo titular privado** de web cuyo contenido se refiera a
bienes y servicios a disposición del público a cumplir **prioridad A y AA de la UNE 139803**, y
**no tiene exención por tamaño** (exigible **01-01-2029**, DF 6ª.b) **[V: `legal-eaa.md` §4.1-4.3]**.
Refuerzo independiente: **art. 20.2 TRLGDCU** exige que la oferta comercial se facilite «en un
formato que garantice su accesibilidad» **[V]**. → **WCAG 2.1/2.2 AA es requisito, no «nice to have»**.
Ver §4 para el «¿aplica o no?» con todas las letras.

**C-07. La decisión 7 (reseñas) queda confirmada por el contrato de Treatwell — pero arrastra dos
obligaciones que nadie había contado.** Los Términos Comerciales Treatwell/Empresa Asociada
(abril 2024), **cláusula 4.2**: «*usted acepta que **no tiene ningún derecho sobre las reseñas** y
respuestas de los Clientes*»; **cláusula 9.1**: Treatwell «*tendrá en todo momento todos los
derechos sobre […] el contenido (incluidas las reseñas de clientes)*» **[V: `legal-treatwell.md` §2.2]**.
→ Republicar textos **no es opción legal** **[V-LEAD]**. Lo nuevo: (a) **art. 20.4 TRLGDCU** obliga a
declarar **si se garantiza o no** la autenticidad y **cómo se procesan** las reseñas **[V]**; (b)
Google **prohíbe** `aggregateRating` con notas de terceros («*Don't aggregate reviews or ratings
from other websites*») **[V: developers.google.com/search/.../review-snippet]**. Y **4,9·1.231 (Treatwell)
≠ 4,9·226 (Google)**: coinciden en nota, no en volumen; **ni sumar ni promediar** **[V-LEAD]**.

**C-08. El prototipo no es código: es una maqueta con runtime propietario, y sus tres bugs peores
son estructurales.** `<x-dc>`, `<sc-for>`, `<sc-if>`, `DCLogic` dependen de `support.js`+`image-slot.js`
(116 KB) que exigen un `window.React` que el HTML nunca carga **[V: `audit-perf.md` §2]**.
Los tres fallos que **sí se heredan si no se decide ahora**: **H-2** el texto del teléfono sale del dato
pero el `href` está a mano → *mostraría uno y marcaría otro* (7 apariciones) **[V: `audit-secciones.md` H-2]**;
**H-8** la reserva no reserva (solo `setState`) pero promete «Te confirmaremos por WhatsApp» **[V]**;
**H-7** reseñas inventadas, **rotadas** entre profesionales (Paula y Lucía muestran las mismas 5) y con
`stars:'★★★★★'` **fijo** **[V: `audit-logica.md` §2.5]**.

**C-09. El stack: dos premisas del encargo eran falsas, y el umbral real es más duro de lo que dice
el arnés.** (a) **`WebEmpresa/harness.config.json` NO EXISTE** — los comandos hay que derivarlos de
`package.json` **[V-SINT: listado propio del repo]**. (b) **El conflicto de pnpm no es el que se creía**:
pnpm 10.21.0 instalada **auto-descarga** la 11.9.0 declarada en `packageManager` (`managePackageManagerVersions`,
default `true`) → **no bloquea**; el conflicto **real** es `engines.node: ">=22.12.0"` **[V-SINT]** frente a
`pnpm@11.9.0` que exige `node >=22.13` → ventana de rotura Node ≥22.12.0 <22.13.0 **[V: `stack-config.md` §5.4]**.
(c) El umbral de mutación del stack es **`break: 100`** **[V-SINT: `stryker.config.json`]**, **no** el `0.8`
por defecto del arnés — y son **escalas distintas** (Stryker 0-100, arnés 0-1) → `threshold: 1.0`.

**C-10. Los dos patrones de memoria aplican, y aplican al camino crítico.** Raíz común: *bajo SSG el
HTML horneado congela el estado que el JS de cliente iba a corregir*. Encarnación 1: el hero del
prototipo anima `paintReveal` desde `clip-path:inset(0 100% 0 0)` (= **estado base oculto**) durante
**4,8 s + 0,5 s de retardo**, y «Studio» está en `opacity:0` hasta **t=4,4 s** **[V: `audit-perf.md` §3.6]**
→ bajo SSG y bajo `prefers-reduced-motion` **el nombre del salón se hornea invisible**; es exactamente
`estado-base-visible-ssg-reduced-motion.md`. Encarnación 2: las 7 rejillas `repeat(auto-fit,minmax(320px,1fr))`
**desbordan 40 px a 360 px** y `overflow-x:hidden` en la raíz **lo recorta en silencio** **[V: `audit-perf.md` §3.8]**
→ es `red-css-para-rama-solo-js-en-ssg.md`. **En ambos casos el test con `matchMedia` mockeado no lo caza:**
hace falta el test que **lee el SCSS** (precedente `@s4` en `HeaderNav.test.tsx` de WebEmpresa).

---

## 2. Semáforo de bloqueo — qué IMPIDE publicar hoy

> «Publicar» = poner la web en producción de cara al público. Recordatorio de la decisión 6:
> **el objetivo de este trabajo es «lista para publicar»**, no publicar.

| # | Qué impide publicar | Por qué (norma / hecho) | Quién lo desbloquea |
|---|---|---|---|
| **B-1** 🔴 | **No hay razón social / nombre del titular** | LSSI **art. 10.1.a)** — dato exigido; si es autónoma, es **dato personal de persona física**: no se investiga ni se deduce **[V-LEAD §3]** | **Cliente** (exacto, como en el modelo 036/037) |
| **B-2** 🔴 | **No hay NIF/CIF** | LSSI **art. 10.1.e)**. El `vatID: "10656940"` de la web actual está **malformado** (8 chars) **[V-SINT]** | **Cliente** |
| **B-3** 🔴 | **No hay email de contacto atendido** | LSSI **art. 10.1.a)** exige email; art. 97.1.c) TRLGDCU exige que permita contacto «rápido y eficaz» → **un buzón que nadie lee no cumple** **[V]**. Existe candidato en el JSON-LD (`centroesteticarozas@gmail.com`) pero **no es visible ni consta que se atienda** **[V-SINT]** | **Cliente** (confirmar ese email o dar otro) |
| **B-4** 🔴 | **Las páginas legales (aviso legal + privacidad) no se pueden redactar** | Consecuencia de B-1/B-2/B-3 + RGPD **art. 13.1.a** (identidad del responsable) **[V]** | **Cliente** → luego **abogado** |
| **B-5** 🔴 | **Los precios no están confirmados y no se sabe si llevan IVA** | **TRLGDCU art. 20.1.c)**: «precio final completo, **incluidos los impuestos**» (más estricto que el «indicando si incluye o no» del art. 10.1.f LSSI) **[V]**. El titular **no publica precios en su web** **[V-LEAD]**; los de Treatwell no dicen si llevan IVA **[V]** | **Cliente** (tarifa oficial + IVA sí/no) |
| **B-6** 🔴 | **Las fotos del equipo son IA** | Decisión 8: valen como placeholder de **desarrollo**, nunca en producción. Presentarlas como el equipo real = **acto de engaño, LCD art. 5.1.g)** («la identidad… sus cualificaciones») **[V]**. Un disclaimer «generado por IA» **no lo sana** **[V]** | **Cliente** (fotos reales + consentimiento escrito) |
| **B-7** 🔴 | **Las 3 ofertas del prototipo son inventadas** (`29 € antes 35 €`) | Un «antes» no realmente aplicado es engaño sobre «la existencia de una **ventaja específica con respecto al precio**» — **LCD art. 5.1.e)** **[V]**. *(Ojo: la regla tasada de los 30 días **NO aplica** aquí — ver §9)* | **Cliente** (ofertas vigentes + histórico con fechas) |
| **B-8** 🟠 | **No se sabe qué pasa con `nailslashlasrozas.es`** | Migración / 301 / SEO. Sin esto, cualquier trabajo de SEO se hace a ciegas **[V: `datos-redes.md` §4.1]** | **Cliente** (control del dominio y decisión) |
| **B-9** 🟠 | **El campo «sitio web» del GBP apunta a Instagram** | La web nueva **nacería invisible desde Google Maps** **[V: `datos-google.md` §2]** | **Cliente** (acceso al Google Business Profile) |
| **B-10** 🟠 | **Entregables no-web que el cliente necesita y nadie pidió**: RAT (RGPD **art. 30.5** — la excepción de <250 empleados **no aplica** porque el tratamiento **no es ocasional**) y **contrato de encargo con el hosting** (**art. 28**) | **[V: `legal-rgpd.md` §2.2.4]** | **Cliente** + nosotros |
| **B-11** 🟠 | **Sección «Equipo» con nombres** | Los 7 nombres de Treatwell son **datos personales** (RGPD art. 4.1); «está publicado en Treatwell» **no es base jurídica** (art. 6.1 es lista cerrada) y el **consentimiento laboral es frágil** (EDPB Guidelines 05/2020 §21-22; AEPD) **[V: `datos-equipo.md` §3]** | **Cliente** (por escrito: quiénes, cómo, y con qué base) |
| **B-12** 🟡 | **La paleta cerrada falla AA en 32 de 68 combos** | RD 193/2023 art. 14.2 + TRLGDCU art. 20.2 **[V]** | **Nosotros** — 7 cambios de token (§7 F-03). **No bloquea si se hace ya** |
| **B-13** 🟡 | **`harness.config.json` está vacío** → el arnés no verifica nada | `harness.config.json:6-12` todos los `commands: ""` **[V-SINT]** | **Nosotros** (§6) |

**Lectura del semáforo:** de 13 bloqueos, **9 solo los abre el cliente**. Ninguna cantidad de
investigación los sustituye. Lo que **sí** podemos hacer sin cliente es todo lo de §7 marcado
«no bloqueada», que es **más de lo que parece** — porque la puerta de placeholders (F-01) hace
estructuralmente imposible publicar lo que falta.

---

## 3. Datos reales vs prototipo

Leyenda del veredicto: **BORRAR** = el dato del prototipo es falso y su categoría no existe ·
**SUSTITUIR** = hay dato real verificado · **BLOQUEADO** = solo lo da el cliente.

| Campo | Prototipo | Real verificado | Fuente | Veredicto |
|---|---|---|---|---|
| **Nombre** | `nails lash studio` | **Nails Lash Studio** (estandarizar; circulan 4 grafías) | `<title>` web oficial **[V-LEAD]**; GBP **[V]** | SUSTITUIR |
| **Dirección** | `Calle de la Belleza 24, 28010 Madrid` | **C.C. El Zoco, Av. de Atenas 75, Local 41, 28232 Las Rozas de Madrid** | web oficial **[V-LEAD]**; GBP añade `Piso 0` **[V]** | SUSTITUIR — **el `Local 41` es obligatorio**: desambigua de *Acosta Nails* (Local 1), otro salón del mismo centro **[V: `datos-redes.md` §2.8]** |
| **Teléfono** | `+34 600 123 456` | **625 22 33 66** → `tel:+34625223366` | web oficial (texto + `href`), GBP, Instagram, Zoco **[V-LEAD]** | SUSTITUIR |
| **Email** | `hola@nailslashstudio.com` (inventado) | **No visible en ninguna fuente.** En el JSON-LD de la home: `centroesteticarozas@gmail.com` — **no visible al usuario, vigencia desconocida** | **[V-SINT]** (fetch propio: presente en HTML, 0 apariciones fuera de `<script>`) + **[V-LEAD]** | **BLOQUEADO** — confirmar con cliente. **No publicar sin confirmar** |
| **Horario** | L-V 10:00–20:00 · **S 10:00–15:00** | **L-V 10:00–20:00 · S 10:00–14:00** · Dom cerrado | web oficial; concuerda con Treatwell y GBP **[V-LEAD]** | SUSTITUIR — **la hora del sábado es distinta** y el prototipo ofrece cita a las 16:00/17:30/19:00 en sábado **[V: `audit-secciones.md` H-9]** |
| **Categoría 1** | Uñas | **Uñas** (gel, manicura rusa, francesa, rellenos, nail art) | web oficial, literal **[V-LEAD]** | CONSERVAR |
| **Categoría 2** | **Facial** (limpieza, peeling, hidratante) | **Pestañas** (lifting, extensiones pelo a pelo, tinte) | web oficial, literal **[V-LEAD]** | **BORRAR y sustituir.** `ph-facial.png` queda desalineado |
| **Categoría 3** | **Depilación** (piernas, ingles, axilas) | **Cejas** (diseño, tinte, laminado) | web oficial, literal **[V-LEAD]** | **BORRAR y sustituir.** `ph-depil.png` queda desalineado |
| **Contradicción de catálogo** | — | **Treatwell NO vende pestañas** (0 servicios) y **sí** vende Pedicura (6) y Depilación (3) | `datos-treatwell-ficha.md:69-79` **[V]** | **BLOQUEADO** — el nombre del negocio promete lo que su ficha de reservas no vende. **Lo cierra el cliente** |
| **Precios** | 18 servicios con precio | **El titular NO publica precios en su web** **[V-LEAD]**. Treatwell publica 39/43 (p. ej. Manicura Semipermanente S/M/L **27/29/31 €**) | `datos-treatwell-ficha.md` §2.5 **[V como precio de Treatwell]** / **[NV como tarifa oficial]** | **BLOQUEADO** — + **IVA sin confirmar** (B-5). 4 de 43 no se pudieron leer (JS) |
| **Estructura de precios** | precio plano | **Tallas S/M/L** por longitud de uña; familias `Shella`, `Semipermanente`, `Dual Form`, `Press On/Gel X/Soft Gel`, `Esculpidas/Sándwich` | Treatwell **[V]** | El **modelo de datos debe soportar `servicio → variantes[]`**, no aplanar |
| **Equipo** | Lucía, Carla, Andrea, Nerea, Marta, Paula, Sara (7, inventados) | **7 nombres de pila** en Treatwell: Lady · Johana · Sandra · Katerine · Irene · Camila · Zaira. **Sin apellidos, sin fotos** (Treatwell muestra iniciales) | `datos-equipo.md` §2.2 (2 extracciones independientes coincidentes) **[V]**; **ningún humano lo ha visto** → §9 | **BLOQUEADO** — datos personales (B-11) |
| **Fotos del equipo** | `ph-woman0..6.png` (IA) | **No existen fotos reales públicas.** La web actual **no publica ningún nombre ni foto de persona** | `datos-equipo.md` §2.3 **[V]** | **BLOQUEADO** (B-6). Placeholder de desarrollo, puerta de build |
| **Reseñas** | 10 inventadas, rotadas, ★★★★★ fijo | **Treatwell 4,9 · 1.231** · **Google 4,9 · 226** (desglose 217/1/3/1/4, media ponderada 4,885→4,9 ✔) | `datos-google.md` §2.1 **[V]**; **[V-LEAD]** | **BORRAR las 10.** Nota agregada: ver §5 |
| **Ofertas** | 3 packs con precio tachado | **Ninguna verificada** | — | **BLOQUEADO** (B-7) |
| **Colores del probador** | 12 esmaltes con nombre y hex | **Ninguno verificado.** Marcas declaradas en Treatwell: `Neonail y Indigo Nails` | `datos-google.md` §3.1 **[V]** | **BLOQUEADO** — ¿son los esmaltes reales? |
| **FAQ** | 6 preguntas | **Formas de pago** y **política de cancelación 24 h** son **compromisos contractuales** de plantilla | `audit-secciones.md` V-2/V-3 **[V]** | **BLOQUEADO** — los confirma la propietaria |
| **Instagram** | `@nailslashstudio` (inventado) | **`@nailslash.studio_`** (877 seguidores, 302 posts; bio declara `C.C.Zoco. Las Rozas` y `625223366`) | `datos-redes.md` §2.2 **[V]** | SUSTITUIR. **`@nail_lash_studio_` (0 posts, 8 seguidores) NO es el bueno** |
| **Facebook** | no existe | `facebook.com/nailslashstudiorozas/` — **oficial pero muerto (13 «Me gusta»)** | enlace en la web oficial **[V-LEAD]** | Enlazar en el pie, **sin peso visual** |
| **TikTok** | no existe | **Sin evidencia de que exista** | `datos-redes.md` §2.6 **[V]** | **NO poner icono** |
| **Canal de reserva** | chat + agenda simulados | **Treatwell** (es lo que el propio GBP usa como «Reservar en línea») | `datos-google.md` §2 **[V]** | **Fresha NO**: declara «*is not currently affiliated with or partnered with Fresha*» **[V]** |
| **Antigüedad** | — | «**más de 15 años**» — **claim de marketing del propio salón**, sin fuente independiente | web oficial **[V como declaración]** / **[NV como hecho]** | Si se usa, es cita del titular; no dato |
| **JSON-LD** | — | La home actual declara `addressLocality: "Las Ceudas"` (**localidad errónea**) y `vatID` de 8 chars | **[V-SINT]** | **NO copiar el JSON-LD actual**: propaga los bugs |

---

## 4. Obligaciones legales

> **Regla de esta sección:** solo entra lo que puedo sostener con **cita verificable**. Lo demás
> está en §9. Cada fila dice **qué exige en la web** y **qué feature de §7 lo implementa**.

### 4.1 Identificación del prestador — LSSI

| Obligación | Norma y artículo EXACTO | Qué exige en la web | Feature |
|---|---|---|---|
| Datos identificativos accesibles | **Ley 34/2002 (LSSI-CE) art. 10.1**, encabezado: acceso «**permanente, fácil, directa y gratuita**» **[V: API BOE `a10`, vigente 2014-05-11]** | Enlace en el pie de **todas** las páginas; **sin** muro de cookies ni modal | `F-06`, `F-16` |
| Nombre/denominación, domicilio y **email** | **art. 10.1.a)** **[V]** | Aviso legal | **`F-16` BLOQUEADA** (B-1/B-3) |
| **NIF** | **art. 10.1.e)** **[V]** | Aviso legal | **`F-16` BLOQUEADA** (B-2) |
| Precios: impuestos | **art. 10.1.f)**: «información clara y exacta sobre el precio… **indicando si incluye o no los impuestos**» **[V]** | La mención va **donde están los precios**, no en el aviso legal **[I: literalidad de «cuando… haga referencia a precios»]** | **`F-09` BLOQUEADA** (B-5) |
| Registro Mercantil / autorización / profesión regulada / códigos de conducta | **art. 10.1.b), c), d), g)** — todos **condicionales** («en su caso») **[V]** | Solo si procede | §8 P-5, P-7 |
| **Régimen sancionador** | **art. 38.3.b)**: «El incumplimiento **significativo** de lo establecido en los párrafos **a) y f)** del art. 10.1» → **GRAVE**, **30.001–150.000 €** (art. 39.1.b). **art. 38.4.b)**: b), c), d), e), g) → **LEVE**, hasta 30.000 € (art. 39.1.c). Accesoria art. 39.4.a): publicación de la sanción **en la home del prestador** **[V: API BOE `a38`/`a39`, vigentes 2025-01-23]** | — | — |
| **Competencia** | **art. 43.1 LSSI**: graves y leves → Secretaría de Estado de Digitalización e IA (**estatal**) **[V]** | — | — |

> 🔴 **Corrección que debe propagarse a todo el proyecto.** El tipo **NO es el art. 38.3.a)** que citan
> las fuentes secundarias (redacción de 2002, sin el adverbio «significativo»). **En la versión
> vigente es el art. 38.3.b) y exige que el incumplimiento sea *significativo*** **[V: `legal-lssi.md` §2.5.1]**.
>
> ⚠️ **No aplica la letra c)** (autorización previa): la **Ley 12/2012 art. 3.1** prohíbe exigir licencia previa
> a las actividades de su Anexo, que incluye el **epígrafe 972.2 «Salones e institutos de belleza y
> gabinetes de estética»**, para establecimientos ≤750 m² (art. 2.1) **[V]**. Riesgo residual **[NV]**: si el
> salón hace **micropigmentación/tatuaje** puede haber autorización sanitaria autonómica → §8 P-7.

### 4.2 Información precontractual y precios — TRLGDCU y norma autonómica

| Obligación | Norma y artículo EXACTO | Qué exige en la web | Feature |
|---|---|---|---|
| **Publicar el precio de los servicios ofertados** | **Ley 11/1998 CM art. 14.2** (norma **autonómica aplicable en Las Rozas**): «Las **ofertas concretas** de servicios realizadas a través de soportes publicitarios y/o informativos **deben incorporar el precio**»; y la información «incluirá… el precio de cada uno de ellos, **con inclusión de toda carga o gravamen que les afecte**» **[V: BOE-A-1998-20651]** | Precio en cada servicio ofertado | `F-09` |
| **IVA incluido** | **TRLGDCU art. 20.1.c)**: «El **precio final completo, incluidos los impuestos**» **[V]** — **más estricto que LSSI 10.1.f)**: frente a consumidores **no basta** decir «IVA no incluido» | Precio final + leyenda «Precios con IVA incluido» | **`F-09` BLOQUEADA** (B-5) |
| **Suplementos** | **Ley 11/1998 CM art. 14.2**: «los **suplementos o incrementos eventuales** correspondientes a operaciones complementarias o especiales» **[V]** + **LCD art. 7** (omisiones engañosas) **[V]** | Junto al precio base, no en letra pequeña | `F-09` |
| **«Desde X €»** | **TRLGDCU art. 20.1.c)** párr. 2: informar de «la **base de cálculo**» **[V]** | Un «desde» debe corresponder a un servicio realmente disponible a ese precio | `F-09` |
| **Identidad + teléfono en la oferta comercial** | **art. 20.1.a)** («Nombre, razón social y **domicilio completo**») y **art. 60.2.b)** («su **número de teléfono**») **[V]** — la LSSI **no** exige teléfono; el TRLGDCU **sí** | No basta con tenerlo solo en el aviso legal | `F-02`, `F-06` |
| **Accesibilidad de la oferta** | **art. 20.2**: «en términos claros, comprensibles, veraces y **en un formato que garantice su accesibilidad**», con atención a **personas consumidoras vulnerables** **[V]** | **La accesibilidad es requisito legal del catálogo**, no solo buena práctica | `F-03`, `F-04` |
| **Castellano** | **art. 60.4**: la información precontractual «al menos en castellano» **[V]** | Relevante: la web actual está **parcialmente en inglés** **[V]** | `F-04` |
| **Carga de la prueba** | **arts. 20.5, 60.5 y 51.7** TRLGDCU: incumbe **al empresario**, y el 51.7 la extiende «**también al ámbito administrativo sancionador**» **[V]** | *Si no consta que se informó, se presume que no se informó.* **[I]** Argumento fuerte para que los textos legales y los precios vivan **versionados en git** | `F-01` |
| **Reclamaciones** | **art. 60.2.k)**: «El **procedimiento para atender las reclamaciones**… y, en su caso, el sistema extrajudicial» **[V]** | Bloque en aviso legal/contacto | **`F-16` BLOQUEADA** (¿adherida a arbitraje?) |
| **Sanción** | **art. 47.g)** y **47.m)** → **art. 48.2.a)**: **leves** por defecto, elevables a graves por el 48.3 → **art. 49.1.a): 150–10.000 €** (graves 10.001–100.000) **[V]**. **art. 48.4**: corregir **antes** de la incoación **rebaja un escalón** **[V]** | — | — |
| **Atenuante accionable** | **art. 48.4 TRLGDCU** **[V]** | *Avisar al cliente de que su web actual tiene el aviso legal roto **ya**, sin esperar al lanzamiento* | §8 |

> ⚠️ **NO invocar el RD 3423/2000 como base legal.** Su **art. 1.1** lo ciñe a «los **productos**» y su
> **art. 1.2** excluye «productos suministrados con ocasión de una **prestación de servicios**» **[V]**.
> Solo aplicaría si el salón **vende producto físico** (§8 P-6).

### 4.3 Reseñas

| Obligación | Norma y artículo EXACTO | Qué exige en la web | Feature |
|---|---|---|---|
| **Prohibido inventar reseñas** | **LCD art. 27.8** («Añadan… reseñas… falsas, o **distorsionen** reseñas») + **art. 19.2**: las prácticas de los arts. 21-31 son desleales «**en todo caso y en cualquier circunstancia**» → **per se** **[V: BOE-A-1991-628, `a27` vigente 2025-12-28]**. Origen: **RDL 24/2021 art. 84.3**, vigor **28/05/2022** **[V]** | **Incluye los *placeholders* de maqueta que llegan a producción** | **`F-01` (puerta de build)** |
| **Prohibido filtrar solo las positivas** | **art. 27.8** («distorsionen») **[V]** + **considerando (49) Dir. (UE) 2019/2161**, literal: «*manipulen las reseñas…, por ejemplo, **publicando únicamente las reseñas positivas y eliminando las negativas***» **[V]** — *la subsunción del filtrado en «distorsionar» es **[I]**, no literal de ley española* | No filtrar por puntuación | `F-14` |
| **Prohibido decir «verificadas» sin serlo** | **art. 27.7 LCD** («sin tomar **medidas razonables y proporcionadas** para comprobar») **[V]** | **Es más seguro NO afirmar verificación que afirmarla sin poder probarla** **[V]** | `F-14` |
| **Obligación positiva de informar** | **TRLGDCU art. 20.4** párr. 1: «deberán contener información sobre el hecho de que el empresario **garantice o no**… A tales efectos… **sobre la manera en que se procesan las reseñas**» **[V]**. Incumplirlo = práctica desleal engañosa por mandato del **art. 20.6** **[V]** | Aviso **visible junto a la nota**, no en el pie | `F-14` |
| **Prohibido autorreseñarse** | **art. 27.5 LCD** **[V]** | — | — |
| **Sanción accesoria** | **art. 50.2 TRLGDCU**: publicidad de la sanción **con nombre y apellidos** si hay reincidencia o **acreditada intencionalidad** **[V]** | *Las reseñas inventadas son, por definición, intencionales* **[I]** | — |
| **Prescripción** | **art. 52.1**: leves **1 año**; pero el **52.2** no hace correr el plazo en infracciones **continuadas** → una reseña falsa publicada de forma permanente **[I]** | — | — |

### 4.4 RGPD / AEPD y cookies

| Obligación | Norma y artículo EXACTO | Qué exige en la web | Feature |
|---|---|---|---|
| **Hay tratamiento aunque no haya backend** | **RGPD art. 4.2** («recogida… conservación») y **4.7** (quien «determine los fines y medios») **[V: RGPD consolidado AEPD]** | La solicitud por WhatsApp la **recibe y conserva** el salón → es responsable | `F-13` |
| **Política de privacidad obligatoria** | **RGPD art. 13** + criterio **AEPD**: «La cláusula informativa de protección de datos (conocida habitualmente como política de privacidad) **da cumplimiento al deber de información**» **[V: AEPD, «2.6 El deber de información»]** | Página `/privacidad` con art. 13.1 y 13.2 | **`F-16` BLOQUEADA** (art. 13.1.a: identidad del responsable) |
| **Información en el momento de la recogida** | **art. 13.1**: «**en el momento en que estos se obtengan**» **[V]** | **Capa 1 junto al botón de WhatsApp** + enlace a capa 2 (**art. 11 LOPDGDD** permite información por capas: básica + «dirección electrónica… de forma sencilla e inmediata») **[V: BOE-A-2018-16673 art. 11]** | `F-13` |
| **La política NO se «acepta»** | **AEPD FAQ-0248**: distingue consentimiento de «la **información** sobre las condiciones generales» **[V]** | **Prohibida** la casilla «acepto la política de privacidad» **[I sobre criterio V]** | `F-13` |
| **Base jurídica de la solicitud de cita** | **art. 6.1.b)**: «medidas **precontractuales** a petición» **[I: subsunción propia; texto V]** | **No pedir consentimiento** para la reserva → sin casillas ni retirada | `F-13` |
| **RAT obligatorio** | **art. 30.5**: la excepción de <250 empleados decae si el tratamiento «**no sea ocasional**» — la condición es **disyuntiva («o»)**, basta una **[V: texto + AEPD FAQ-0249]** | Documento interno, **no web** | Entregable al cliente (B-10) |
| **Contrato de encargo con el hosting** | **art. 28 RGPD** **[V]** | — | Entregable (B-10) |
| **Google Fonts autohospedadas** | **No existe pronunciamiento de AEPD ni EDPB sobre Google Fonts** **[NV — buscado y no encontrado]**. Lo que sí hay: **TJUE C-40/17 *Fashion ID*** — quien inserta un recurso de tercero es **corresponsable de «la recogida y la transmisión»** (ap. 84-85) **[V]**; la analogía fuente↔botón social es **[I]** | **Autohospedar**: cero peticiones a `fonts.googleapis.com`/`fonts.gstatic.com`. **La decisión es de ingeniería, no de miedo legal**: elimina el análisis, mejora el rendimiento y cuesta ≈0 (`@fontsource`, que **ya usa WebEmpresa**) **[V-SINT: `@fontsource/dm-sans` y `@fontsource/outfit` en `package.json`]** | `F-05` |
| **Cookies: sin cookies, sin banner** | **AEPD, Guía de cookies, MAYO 2024, §4.1 (pág. 31)**, literal: «*…**todas las cookies**… se utilizan **exclusivamente** para las finalidades respecto de las que **no es necesario obtener el consentimiento**…, **tanto si son propias como de terceros, no será necesario que informe de su utilización ni que obtenga el consentimiento*» **[V: aepd.es/guias/guia-cookies.pdf]** | **No poner banner «por si acaso»**: es fricción y comunica algo falso **[I]** | `F-05` |
| **Frase de transparencia (recomendada)** | Guía AEPD §1 (pág. 10): «*por razones de transparencia **se recomienda** informar…*» con ejemplo literal **[V]** | Una frase en `/privacidad`. Coste: una frase | `F-16` |
| **Mapa: no incrustar Google Maps** | Los **Google Maps Platform ToS** («Last modified June 23, 2026») reconocen «*Services that **store and access Cookies** on End Users' devices*» y trasladan al cliente la **EU User Consent Policy** **[V]**. La responsabilidad **no es desplazable por contrato** (Guía AEPD §4.2, pág. 33) **[V]** | **Imagen estática + enlace «Cómo llegar»** → mantiene el invariante «cero terceros» y **evita el banner** | `F-11` |
| **Sanción** | **art. 38.4.g) LSSI** (leve) → **art. 39.1.c)**: hasta **30.000 €** **[V]** | — | — |

### 4.5 Accesibilidad — ¿aplica el EAA a este salón? (respuesta con todas las letras)

**Respuesta: el EAA probablemente NO nos obliga; el RD 193/2023 SÍ. Y por eso construimos AA igual.**

1. **El ámbito del EAA es una lista cerrada y los salones no están.** **Ley 11/2023 art. 2.2** enumera
   taxativamente los servicios cubiertos (comunicaciones electrónicas, audiovisual, transporte aéreo,
   **bancarios**, libros electrónicos, **comercio electrónico**, suministros, agencias de viajes, redes
   sociales) **[V]**. «Estética» no figura → la **única** puerta de entrada sería «**f) servicios de
   comercio electrónico**» **[I, alta confianza]**.
2. **Y esta web no es comercio electrónico** — probablemente. **Anexo VII, punto 32** define el concepto como
   servicios prestados a distancia «**al objeto de celebrar un contrato con el consumidor**» **[V]**, y el
   **considerando 43** de la Directiva ancla la obligación en «**la venta en línea**» **[V]**. Un escaparate que
   **no cierra contratos** no lo es **[I]**. ⚠️ **Zona gris real**: la decisión 3 prevé un calendario que compone
   la solicitud y abre WhatsApp; se puede argumentar que existe «al objeto de celebrar un contrato»
   **[I, los dos lados en `legal-eaa.md` §3.3]**. **[NV]**: no hay guía oficial que resuelva el flujo delegado.
3. **La exención de microempresa existe pero no nos sirve de red.** **Ley 11/2023 art. 3.3**, literal: «*Las
   **microempresas que presten servicios estarán exentas** de cumplir los requisitos de accesibilidad…*»
   **[V]**; microempresa = «**menos de 10 personas** **y** volumen ≤2 M€ **o** balance ≤2 M€» (Anexo VII.16) **[V]**.
   Pero: (a) **[NV] no sabemos si el salón lo es** — exige plantilla y facturación que no tenemos (decisión 6);
   (b) es un dato **dinámico** (crecer a 10 personas la evapora) **[I]**; y (c) **la ratio de la exención es
   ahorrar el papeleo de la evaluación, no declarar que la accesibilidad da igual** (considerando 70, literal:
   «*la exigencia de este tipo de evaluación a las microempresas… constituiría en sí misma una carga
   desproporcionada*») **[V]**.
4. **La vía que sí muerde y casi nadie mira: RD 193/2023, art. 14.2**, literal: «*Las personas titulares de
   sitios web… **no financiadas con fondos públicos** cuyo contenido se refiera a **bienes y servicios a
   disposición del público** incorporarán los criterios de accesibilidad establecidos en el Real Decreto
   1112/2018… deberán cumplir los **requisitos de prioridad A y AA de la norma UNE 139803**…*» **[V: BOE-A-2023-7417]**.
   Un salón es actividad **mercantil/profesional** «a disposición del público» (arts. 2.c, 2.d y 3) **[V]** →
   **dentro del ámbito** **[I, alta confianza]**. Y **no existe exención por tamaño en todo el RD** **[V]**.
   **Exigible el 1 de enero de 2029** para bienes y servicios privados nuevos (**DF 6ª.b**) **[V]**.
5. **Corrección de una premisa habitual:** el **RD 193/2023 NO es la transposición del EAA** — el propio
   preámbulo dice que «se verá necesariamente complementado por la norma de transposición» **[V]**. La
   transposición es la **Ley 11/2023, Título I** (en vigor **28-06-2025**, DF 18ª.2) **[V]**. Son **dos normas
   paralelas** con ámbitos, exenciones y calendarios distintos. «¿EAA o RD 193?» es un **falso dilema**.

**Conclusión operativa.** Las tres normas convergen en el mismo destino técnico — «prioridad A y AA de la
UNE 139803» (RD 193/2023 art. 14.2) ≈ «nivel medio» (**Ley 11/2023, DA 3ª**, literal) ≈ POUR del **RD 1112/2018 art. 5.1**
**[V]** — así que **un solo objetivo técnico (WCAG 2.1/2.2 AA) cierra las tres puertas** **[I]**, y hace que
las dos preguntas que no podemos responder (¿es microempresa?, ¿el calendario es comercio electrónico?)
**dejen de ser bloqueantes**. Ese es el argumento, no el miedo a la multa. Y hay un cuarto camino
independiente que **ya es exigible hoy**: **TRLGDCU art. 20.2** (formato accesible de la oferta comercial) **[V]**.

> **[NV] No cito cuantías de sanción de accesibilidad.** Tanto el RD 193/2023 (art. 15) como la Ley 11/2023
> (art. 30.1) remiten al **Título III del RDL 1/2013**, que **no se ha leído**. Los «30.001–150.000 €» que
> aparecen en el PDF de la Ley 11/2023 pertenecen a **otro título** (extranjería): importarlos aquí sería
> un error grave **[V: `legal-eaa.md` §4.4]**.
>
> **[NV] Equivalencia UNE 139803 ↔ WCAG**: la norma es **de pago (AENOR)** y no se ha leído. Que «prioridad
> A y AA» = WCAG AA es **[I]**.

### 4.6 Fotos IA y derecho a la imagen

| Obligación | Norma y artículo EXACTO | Qué exige en la web | Feature |
|---|---|---|---|
| **Prohibido presentar caras IA como el equipo real** | **LCD art. 5.1.g)**: información falsa sobre «La naturaleza, las características y los derechos del empresario o profesional…, tales como **su identidad**… **sus cualificaciones**» **[V: BOE-A-1991-628]**; y **5.1.b)** (características principales del servicio — quién presta un servicio personalísimo lo es) **[I]** | La sección se construye **solo** con personas reales | **B-6 · `F-01` lo hace imposible por build** |
| **Un disclaimer NO lo sana** | **[I sólida]**: el art. 5 castiga la **información falsa sobre la identidad**, no el medio de producción. Etiquetar la técnica no cura la falsedad del contenido **[V: `legal-fotos-ia.md` §1.3]** | — | — |
| **Infracción administrativa** | **TRLGDCU art. 47.m)** («uso de prácticas comerciales desleales») → **48.2.a)** leve → **49.1.a): 150–10.000 €** **[V]** | — | — |
| **El riesgo real no es la multa** | **LCD art. 32**: acción de **cesación** y **rectificación**, y el **32.2** permite «la **publicación total o parcial de la sentencia**» a cargo del demandado — legitimado **un competidor** (p. ej. *Acosta Nails*, mismo centro) **[V]** | — | — |
| **Fotos de personas reales sin consentimiento** | **LO 1/1982 art. 7.6**: es intromisión ilegítima «*La utilización del nombre, de la voz o de la imagen de una persona para **fines publicitarios, comerciales** o de naturaleza análoga*» **[V: BOE-A-1982-11196]**. Exige **consentimiento expreso** (art. 2.2) y es **revocable en cualquier momento** (art. 2.3) **[V]**. Las excepciones del **art. 8.2** (notoriedad pública, acto público, imagen accesoria) **no cubren** a una manicurista **[I]**. El **art. 9.3**: «*La existencia de perjuicio **se presumirá** siempre que se acredite la intromisión ilegítima*» **[V]** | **Requisito de arquitectura, no de papeleo**: revocar debe ser **un cambio de dato, no un despliegue de código** | `F-18` (bloqueada) |
| **AI Act: NO nos apoyamos en él** | **Reglamento (UE) 2024/1689 art. 50.2** obliga **al proveedor** del generador, no al salón **[V]**. El **art. 50.4** obliga al responsable del despliegue **solo** para «**ultrasuplantación**», definida en el **art. 3.60** como contenido que «*se asemeja a personas… **reales***» **[V]** — una cara **inventada** probablemente **no encaja en la letra** **[I, genuinamente discutible]**. **Aplicable desde el 2026-08-02** (art. 113: «Será aplicable a partir del 2 de agosto de 2026»; el cap. IV **no está en ninguna excepción**) **[V]** | **La prohibición viene de la LCD, no del AI Act.** El AI Act es aquí el argumento **débil** | — |
| **Riesgo cruzado** | **[I]**: una cara IA **puede parecerse involuntariamente a alguien real** → art. 7.6 LO 1/1982 **y** entonces sí sería ultrasuplantación (art. 3.60). **No es controlable** con un generador | Argumento adicional para descartar la opción | — |

> **[NV] El «Digital Omnibus»** (retrasaría el marcado al 2026-12-02) **NO está publicado en el DOUE**:
> EUR-Lex no registra ningún acto modificativo del Reglamento 2024/1689 **[V: ficha CELEX 32024R1689]**.
> **Planificar como si el art. 50 aplicara el 2026-08-02.** Igual da: la decisión no depende de él.
>
> **[NV] El Proyecto de Ley Orgánica de IA español** (AESIA) está **en tramitación**, no es Derecho vigente
> **[V: La Moncloa, Consejo de Ministros 26/05/2026]**.

---

## 5. Reseñas — la vía recomendada y por qué las demás se descartan

### La vía recomendada

**Mostrar la nota agregada de una sola plataforma, con atribución explícita, enlace al perfil real,
sello de fecha, aviso del art. 20.4 y SIN marcado `aggregateRating`.** Es la decisión 7 del humano,
y la investigación la confirma como **la única viable que no depende del cliente** **[V-LEAD §6]**.

**Su fuente:**

- Que **no podemos republicar los textos** lo dice el contrato que el propio salón firmó:
  **Términos Comerciales Treatwell/Empresa Asociada (Treatwell Spain S.L., abril 2024), cláusula 4.2**:
  «*usted acepta que **no tiene ningún derecho sobre las reseñas y respuestas de los Clientes** y que no
  tiene derecho a recibir copias en caso de cancelación*» **[V]**; y **cláusula 9.1**: Treatwell «*tendrá
  en todo momento **todos los derechos** sobre… el contenido (**incluidas las reseñas de clientes**)*» **[V]**.
- La **licencia de CGU (cláusula 2.1)** se otorga a «**Treatwell S.L.**… **y a cualquiera de las sociedades de
  nuestro grupo y a sus afiliadas**» — **lista cerrada en la que el salón no está** **[V]**.
- El **derecho de cita (art. 32.1 TRLPI)** no salva: «*Tal utilización solo podrá realizarse con **fines
  docentes o de investigación***» **[V: BOE-A-1996-8930]**. Marketing no lo es **[I]**.
- **Si se muestra la nota, hay obligación positiva**: **art. 20.4 TRLGDCU** — declarar si **se garantiza o no**
  y **cómo se procesan** **[V]**. Lo conforme y honesto: **decir que proceden de la plataforma X, que las
  verifica X y no el salón** **[I sobre norma V]**. *Declarar «no garantizamos la verificación» es
  perfectamente legal: lo ilegal es afirmarla sin tenerla (art. 27.7)* **[V]**.
- **Prohibido `aggregateRating`**: «*Don't aggregate reviews or ratings from other websites*» y «*If the
  entity that's being reviewed controls the reviews about itself, their pages that use `LocalBusiness`…
  are **ineligible** for star review feature*» **[V: Google Search Central, review snippet]**. → `LocalBusiness`/
  `BeautySalon` **sin** `aggregateRating`. Las estrellas en Google se ganan por **Google Business Profile**,
  que es otro canal **[I]**.

**Punto abierto que la investigación pone sobre la mesa (decisión del humano, no la reabro yo):**

| | **Treatwell 4,9 · 1.231** | **Google 4,9 · 226** |
|---|---|---|
| Volumen | 5,4× mayor — es el activo comercial fuerte | Menor |
| Contrato | **Cláusula 9.1 atribuye a Treatwell «todos los derechos» sobre el contenido** → `legal-treatwell.md` recomienda **no mostrar ni la nota media** **[I sobre cita V]** | Sin cláusula equivalente conocida **[NV]** |
| Coherencia interna | ⚠️ El desglose por popularidad suma **1.014**, no 1.231 **[V: `datos-google.md` §3.6]** — **no sé a qué responde** **[NV]** | ✔ 217+1+3+1+4 = **226** y media ponderada **4,885 → 4,9** **[V]** |
| Recomendación de su informe | No usarla | «Mostrar “4,9 en Google” como **texto visible con atribución y enlace** es viable» **[V: `datos-google.md` §5.2]** |

→ **Los dos informes no dicen lo mismo.** Lo que **sí** está cerrado: **nunca sumarlas (4,9 · 1.457 sería
falso), nunca promediarlas, y siempre decir de qué plataforma es y enlazarla** **[V-LEAD]**. Cuál de las dos
se muestra es una pregunta para la puerta humana (§8 P-9).

### Las vías descartadas y su motivo

| Vía | Motivo del descarte | Fuente |
|---|---|---|
| **Republicar los textos de Treatwell** | Incumplimiento **contractual** directo (cláusula 4.2) + **PI** (art. 17 TRLPI, sin autorización del autor) + **RGPD** (el nombre del reseñador es dato personal y no hay base: no consintió a **nosotros**, y el interés legítimo falla la **expectativa razonable**) **[V + I]** | `legal-treatwell.md` §2.2-2.6 |
| **Scraping / capturas de pantalla** | **Prohibición expresa** en los T&C del sitio: «*no deberá… utilizar **o instar a otros a utilizar** ningún sistema automatizado o software para extraer contenido… (“screen scraping”)*» **[V]**. Descarta también scrapers de terceros (Apify) | `legal-treatwell.md` §2.4 |
| **Widget/API oficial de reseñas de Treatwell** | **No existe.** El widget de Treatwell es **de reservas**, no de reseñas (cláusulas 2.2.2) **[V]**; la página de partners no menciona badge de reseñas **[V]**. *Coherente con su modelo: las reseñas son el activo que retiene a los salones* **[I]** | `legal-treatwell.md` §2.7 |
| **Widget embebido de reseñas (cualquiera)** | **Agrava**: activa a la vez el problema de **cookies/terceros** (§4.4) y el de PI/RGPD. No es vía de escape | `legal-cookies.md` §6.4 |
| **Testimonios propios con consentimiento** | Es **la vía limpia** *(el cliente conserva derechos: la licencia a Treatwell es **no exclusiva**)* **[I]**, pero **depende del cliente** → decisión 6 la bloquea. ⚠️ Trampa poco obvia: el contrato de socio prohíbe escribir a clientes de Treatwell sin **consentimiento expreso** → habría que captarlos **en el salón**, no minando su base **[V]** | `legal-treatwell.md` §5 |
| **Pedir sublicencia escrita a Treatwell** | Jurídicamente posible (la cláusula 2.1 incluye «derecho absoluto de sublicencia») **[V]**; **improbable** que la concedan **[I]**. Coste de preguntar: cero | `legal-treatwell.md` §3 #5 |
| **Quitar la sección** | Lícito, pero renuncia al activo comercial más fuerte del negocio | — |
| **`aggregateRating` en schema.org** | **Prohibido por Google** (arriba) → riesgo de acción manual por spam de datos estructurados **[I]** | Google Search Central |

---

## 6. Stack y convenciones

### 6.1 Los comandos EXACTOS para `harness.config.json`

> **Premisa del encargo corregida:** **`WebEmpresa/harness.config.json` no existe** **[V-SINT: listado propio]**.
> WebEmpresa es **anterior** al motor agnóstico: su puerta es `init.sh` + scripts de `package.json`.
> Los comandos hay que **derivarlos**. Todo lo de esta tabla lo he leído yo del `package.json` real
> **[V-SINT: parseo propio de `WebEmpresa/package.json`]**.

| Script en WebEmpresa | Comando exacto |
|---|---|
| `dev` | `vite` |
| `dev:ssr` | `vite-react-ssg dev` |
| **`build`** | **`vite-react-ssg build`** ← **no** `vite build` |
| `preview` | `vite preview` |
| `typecheck` | `tsc --noEmit` |
| `lint` | `eslint .` |
| `format:check` | `prettier --check .` |
| `test` | `vitest run` |
| `coverage` | `vitest run --coverage` |
| **`mutation`** | `stryker run` ← **se llama `mutation`, no `mutate`** |
| `verify` | `bash ./init.sh` |

**No existe script `install` ni `ci`** **[V-SINT]**.

**Bloque propuesto para `NailsLashStudioWeb/harness.config.json`** (hoy: `project: "mi-proyecto"`,
`language: "generic"`, **los 5 comandos vacíos**) **[V-SINT]**:

```json
{
  "$schema": "./harness.schema.json",
  "project": "nails-lash-studio-web",
  "language": "node",
  "commands": {
    "install": "pnpm install --frozen-lockfile",
    "lint": "pnpm typecheck && pnpm lint",
    "test": "pnpm test",
    "mutate": "pnpm mutation",
    "build": "pnpm build"
  },
  "paths": { "src": "src", "tests": "src", "features": "features", "progress": "progress",
             "spec": "project-spec.md", "feature_list": "feature_list.json" },
  "mutation": { "threshold": 1.0, "targets": [] }
}
```

Las **cuatro decisiones no obvias** y su porqué:

1. **`lint` = `pnpm typecheck && pnpm lint`.** El schema del arnés solo tiene 5 ranuras y **no hay ranura
   `typecheck`**, pero WebEmpresa lo trata como puerta obligatoria (`init.sh:59-60`). Si no se fusiona, **se pierde** **[I]**.
2. **`paths.tests: "src"`** (no el default `"tests"`): en este stack **los tests conviven con el código**
   (`vitest.config.ts:11` → `include: ['src/**/*.{test,spec}.{ts,tsx}']`) **[V]**. **Poner tests en `tests/` = tests que no se ejecutan.**
3. **`mutation.threshold: 1.0`, no `0.8` ni `100`.** WebEmpresa exige `thresholds.break: 100` **[V-SINT: `stryker.config.json`]**
   → una feature **no cierra si sobrevive un solo mutante** en sus archivos. Pero **son escalas distintas**:
   el arnés usa **proporción 0-1**, Stryker **porcentaje 0-100**. **Copiar el `100` tal cual sería un bug.**
4. **`install: --frozen-lockfile`** es **[I]** (no hay script `install`; `init.sh:22` solo sugiere `pnpm install`).
   Correcto en CI; en local, `pnpm install` a secas. **Decisión de equipo** (§8 P-10).

**Diferencia de puertas que hay que presupuestar:** `init.sh` de WebEmpresa **NO ejecuta mutación** (:58-61);
el arnés nuevo **sí** la mete en `verify` **[V]**. **Este repo tiene la puerta más estricta que su propio repo base.**

### 6.2 El conflicto de la versión de pnpm — confirmado, pero NO es el que se creía

| Hecho | Valor | Fuente |
|---|---|---|
| `packageManager` declarado | **`pnpm@11.9.0`** | **[V-SINT]** `WebEmpresa/package.json` |
| pnpm instalada en esta máquina | **10.21.0** | **[V-SINT]** `pnpm --version` |
| Node instalada | **v22.15.0** | **[V-SINT]** `node --version` |
| `engines` declarados | **`{node: ">=22.12.0", pnpm: ">=10"}`** | **[V-SINT]** |
| `engines` de `pnpm@11.9.0` | **`{node: ">=22.13"}`** | **[V]** registry.npmjs.org/pnpm/11.9.0 |

- ❌ **NO hay choque bloqueante entre 10.21.0 y 11.9.0.** pnpm 10 trae `managePackageManagerVersions` con
  default **`true`**: «*pnpm will automatically **download and run** the version of pnpm specified in the
  `packageManager` field*» **[V: pnpm.io/10.x/settings]**. La 10.21.0 actúa de *bootstrapper*. **No hay que hacer nada.**
- ✅ **El conflicto REAL es otro**: `engines.node: ">=22.12.0"` es **más laxo** que lo que exige la pnpm que el
  propio repo declara (`>=22.13`) → **ventana de rotura: Node ≥22.12.0 y <22.13.0** **[I sobre dos hechos V]**.
  Hoy no explota porque la Node local es 22.15.0, y `.nvmrc` dice `22` a secas. **Es una bomba de relojería en CI.**
  → **Para este repo: `"node": ">=22.13.0"` y `.nvmrc` con versión completa (`22.15.0`).**
- ⚠️ **Ajustes de pnpm en `pnpm-workspace.yaml`, NUNCA en el campo `pnpm` de `package.json`**: pnpm 11 ya no lo lee
  **[V: pnpm.io/blog/releases/11.0]**. Harán falta `allowBuilds` para `@swc/core`, `esbuild`, `@parcel/watcher`
  (**`allowBuilds` reemplaza a `onlyBuiltDependencies` et al.**) **[V: pnpm.io/settings#allowbuilds]**.

### 6.3 Convenciones para que este repo sea indistinguible del base

Estructura real de WebEmpresa **[V-SINT: `ls`/`find` propios]**:

```
src/
  main.tsx        ← entry del SSG: export const createRoot = ViteReactSSG({ routes })
  App.tsx         ← rutas como RouteRecord[], con `Component:` (no `element:`)
  vite-env.d.ts
  pages/          ← kebab-case.tsx + su test: home.tsx · aviso-legal.tsx
  components/     ← PLANO, sin subcarpetas: Componente.tsx + .module.scss + .test.tsx
  lib/            ← lógica pura y hooks: seo.ts · nav.ts · theme.ts · site.ts
                    useIsMobile.ts · useReveal.ts · contact.ts (+ su .test)
  styles/         ← _tokens.scss · _reset.scss · _base.scss · _logo-draw.scss · main.scss
                    **+ tokens.test.ts y logo-draw.test.ts**  ← ver §7, estrategia (b)
```

Reglas duras **[V-SINT salvo lo marcado]**:

- **Dependencia direccional:** `pages` → usa `components` y `lib`; `components` → usa `lib`; **`lib` no importa
  de `components` ni de `pages`** (`docs/architecture.md:36-39`).
- **`src/lib/*.ts` = lógica pura y hooks; `src/components/*.tsx` = vista.** Los 17 targets de mutación son
  exactamente esos dos conjuntos **[V-SINT]**; `mutate` es una **lista explícita de ficheros, no un glob** → hay
  que reconstruirla. **Quedan fuera de `mutate`: `App.tsx`, `main.tsx`, `lib/site.ts`, `pages/*`, `styles/*`**
  (motivo **[NV]**, no documentado).
- **Cero barrels, cero alias:** 0 `index.ts` en `src/`, `tsconfig.json` **sin `paths`**, `vite.config.ts` **sin
  `resolve.alias`** → **imports siempre relativos** (`../lib/useReveal`, `./CheckIcon`) **[V-SINT: verificado por conteo]**.
  Orden de imports: **lib → componentes hermanos → estilos (siempre el último)**.
- **SCSS:** Modules por componente; globales en `src/styles/` con **`@use`, NUNCA `@import`**
  (`docs/conventions.md:15-16`; **verificado: 0 ficheros con `@import`** **[V-SINT]**). **Cero variables SCSS (`$`),
  cero mixins**: el sistema es **100% CSS custom properties**. Media queries **agrupadas al final** del fichero.
- **Tokens:** en `src/styles/_tokens.scss`, dos bloques: `:root` (claro, **sin atributo**) y
  `:root[data-theme='dark']`. **Regla de oro: 0 hex en componentes**, siempre `var(--color-…)`
  (`docs/conventions.md:16`). *Aquí no habrá tema oscuro (decisión 5): un solo `:root`.*
- **Naming:** componente `PascalCase.tsx` (un solo componente **exportado** por fichero; helpers privados sí);
  página `kebab-case.tsx`; utilidad/hook `camelCase.ts` / `useAlgo`; constante de módulo `SCREAMING_SNAKE_CASE`.
  **[I]** (consistente al 100% pero **no escrito en ningún doc**): clases de CSS Module en `camelCase`, y
  **`type`, nunca `interface`** (0 `interface` en `src/`).
- **Tests colocados** junto al código, nunca en `tests/`. **`it()` cita el escenario Gherkin: `it('@sN …')`.**
  Test secundario por aspecto: `Componente.<aspecto>.test.tsx` (`Servicios.reveal.test.tsx`,
  `Contacto.behavior.test.tsx`) — **criterio [NV]**, inferido de 2 casos.
- 🔴 **`css: false` en `vitest.config.ts` es *load-bearing*** **[V-SINT: línea 10]**: los CSS Modules **no se
  procesan en test** → `styles.card` es `undefined` → **es imposible testear por clase CSS**. Se consulta por
  **rol ARIA, nombre accesible, texto o `data-*`**. Cuando hace falta un gancho, se añade un `data-*` explícito.
  *Esto empuja el diseño hacia la accesibilidad por construcción: el test solo ve lo que ve un lector de pantalla.*
- **Un solo `tsconfig.json`**, estricto total (`strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`) **[V]**.
- **Prettier** (copiar literal): `semi:false`, `singleQuote:true`, `trailingComma:"all"`, `printWidth:100`,
  `tabWidth:2`, `endOfLine:"lf"` **[V]**. ESLint 9 flat, **sin `eslint-plugin-jsx-a11y`** **[V]**.
- **Idioma:** todo en español (comentarios, JSDoc, `describe`/`it`, commits, docs) **[I]**.
- **Coverage solo mide `src/lib/**/*.ts`** (`vitest.config.ts:15`), pero **los `.tsx` sí entran en mutación**
  → **la cobertura no es la puerta; la mutación sí** **[I sobre dos hechos V]**.
- **Fuentes vía `@fontsource`** — ya es la práctica del base (`@fontsource/dm-sans`, `@fontsource/outfit`)
  **[V-SINT]** → autohospedar **no es una desviación del stack, es seguirlo**.
- **`vite-react-ssg` clavado a `0.9.0` exacto, sin `^`** — la única así **[V]**. Es 0.x. *(El porqué se repite en
  los 4 informes pero **no hay ADR ni comentario que lo justifique**: es **[NV]**.)*
- **Revisar antes de copiar**: `resend`, `@vercel/firewall`, `autoskills` son deps de producción de WebEmpresa
  **[V]**; **[NV]** si aplican aquí (§8 P-10). *Sin backend (decisión 3), probablemente no.*

### 6.4 SSG: lo que hay que heredar y las tres trampas del stack

- **Entry y rutas:** `export const createRoot = ViteReactSSG({ routes })` en `main.tsx` (el nombre `createRoot`
  **no es opcional**: es el export que la librería busca); rutas en `App.tsx` con `Component:` y campo `entry`
  **[V]**. **`ssgOptions.dirStyle: 'nested'`** (el default oficial es `'flat'`) → **un `index.html` por ruta**.
- 🔴 **Trampa 1 — `vercel.json`:** WebEmpresa **no tiene** `vercel.json` **[V]**. El rewrite SPA estándar
  (`"/(.*)" → "/index.html"`) **sería activamente dañino** con `dirStyle:'nested'`: **anularía el prerender por
  ruta** **[I, bien fundada; el repo no lo documenta]**.
- 🔴 **Trampa 2 — `pnpm dev` NO ejercita el SSG**: es SPA plana, sin prerender. **`pnpm dev:ssr` sí** **[V]**.
  → *Verificar el hero y la nav en `dev` no demuestra nada sobre el HTML horneado* (§7 `F-07`, `F-06`).
- 🔴 **Trampa 3 — `--testFiles` da 0% FALSO en Stryker** con este stack exacto: 16/16 supervivientes con
  `--testFiles`, **100% sin él**. Reproducido 2 veces; **causa raíz [NV]** (ni la doc de `testFiles` ni la del
  vitest-runner la mencionan) **[V: `stack-testing.md` §402-454]**. → **Regla operativa: prohibido `--testFiles`;
  acotar solo con `--mutate <fichero>` o `--mutate <fichero:línea-línea>`.**
- **`<ClientOnly>`** de `vite-react-ssg` envuelve **toda interactividad que dependa del navegador**, para evitar
  desajustes de hidratación (`docs/architecture.md:57-59`) **[V]**.
- **`<Head>`** para meta por página (Layout pone defaults, la página sobrescribe). **El SEO y el JSON-LD viajan
  en el HTML estático**, no dependen de JS **[V]**.
- **JSON-LD:** escape defensivo obligatorio `JSON.stringify(obj).replace(/</g, '\\u003c')` **[V]**.
  ⚠️ WebEmpresa usa **solo `Organization`, no `LocalBusiness`**, con el motivo escrito en el código:
  «*no inventamos dirección ni teléfono*» **[V]**. **Aquí sí tenemos NAP verificado** → procede
  `LocalBusiness`; y existe el tipo **`NailSalon`** (`Thing > Organization > LocalBusiness >
  HealthAndBeautyBusiness > NailSalon`), que encaja mejor **[V: `stack-aprendizajes.md`]**. **Sin `aggregateRating`** (§5).
- **`sitemap.xml` y `robots.txt` son ficheros estáticos escritos a mano** en `public/`, sin generación
  automática **[V]** → **duplican la lista de rutas de `App.tsx` y el dominio de `site.ts`**: riesgo de
  desincronización silenciosa al añadir páginas. *Debilidad que el propio informe del base señala.*
- **Falta `og:image` en WebEmpresa** (grep → 0) **[V]**. Para un salón (compartir en redes) **es valor de
  negocio, no cosmética** **[I]** → conviene no heredar la carencia.

---

## 7. Troceado propuesto en features

**Cómo leer esta sección.** Una feature a la vez (`rules.one_feature_at_a_time`). Cada una:
**qué entrega · qué lógica TESTEABLE tiene · puerta legal/a11y · dependencias · ¿bloqueada?**.

> 🔬 **El filtro que de verdad importa: la mutación al 100%.** Con `break: 100`, una feature **solo cierra si
> sus ficheros no dejan sobrevivir un mutante**. Eso obliga a decir la verdad sobre cada feature: **si es solo
> CSS, no hay nada que mutar y hay que declararlo** — **Stryker no ve CSS/SCSS** y `src/styles/` **no está en la
> lista `mutate`** del base **[V-SINT: 0 coincidencias de `styles` en `stryker.config.json`]**. Hay **tres estrategias**:
>
> - **(a) Extraer la lógica a `src/lib/*.ts`** → mutable de verdad. Es la vía preferente.
> - **(b) El test que LEE el fichero fuente y asevera la regla.** **No es una invención mía: es el patrón del
>   stack**, y existe con dos ejemplos reales — `src/styles/tokens.test.ts` y `src/styles/logo-draw.test.ts`
>   **[V-SINT]**. Su cabecera lo explica literalmente: *«jsdom no resuelve custom properties de hojas de estilo
>   con `getComputedStyle`, así que verificamos el contrato de tokens directamente sobre la fuente SCSS (mismo
>   patrón que `Header.test @s4`)»*, con `readFileSync(resolve(process.cwd(), 'src/styles/_tokens.scss'))` y
>   aserción por regex **[V-SINT]**. Es exactamente lo que cubre el estado **pre-hidratación** que el test con
>   `matchMedia` mockeado no alcanza (patrón `red-css-para-rama-solo-js-en-ssg`).
> - **(c) Si no hay ni una ni otra**, la feature **no lleva `mutate` propio y se dice por escrito** en su ficha
>   de `progress/`, en vez de fingir cobertura.
>
> **Tres reglas del stack que hay que respetar desde el primer test** (§6.3, §6.4):
> 1. **Prohibido `--testFiles`** en Stryker: da **0% falso**. Acotar con `--mutate <fichero>`.
> 2. **Prohibido testear por clase CSS** (`css:false` → `styles.card` es `undefined`): se consulta por **rol,
>    nombre accesible, texto o `data-*`**.
> 3. **Anti-tautología:** un doble de test **nunca** se compara contra la constante importada de producción, sino
>    contra **el literal escrito a mano**. Precedente real: el primer mutante superviviente de WebEmpresa fue
>    justo eso — el fake de `useIsMobile` usaba `MOBILE_QUERY` en vez de `'(max-width: 767px)'`; con el literal,
>    100% (38/38) **[V: `stack-aprendizajes.md`]**. *Si el test importa la constante que debería vigilar, no
>    vigila nada.*

### Camino crítico para tener algo enseñable

**`F-01` → `F-02` → `F-03` → `F-04` → `F-05` → `F-07` → `F-09`(placeholder) → `F-11`/`F-12`**

Es decir: **puerta de placeholders → datos → tokens accesibles → cascarón semántico → cero terceros →
hero → catálogo → contacto**. Con eso hay una **home real, honesta, accesible y enseñable**, sin un solo
dato del cliente y **sin poder publicarla por accidente**. Nótese que **ninguna de las primeras cinco es
maquetación**, y que la sección más grande del prototipo (`#equipo`, ~25% del alto) es la **más bloqueada**.

> 🔴 **Protocolo de verificación obligatorio para las features de UI: verde ≠ funciona.** El peor bug de
> WebEmpresa **pasó todos los tests y dos auditorías previas**; solo se cazó **abriendo Chrome sobre el build de
> producción**. Cita literal de su `history.md:127-131`: «*Los tests no lo cazaban (mockean matchMedia → solo
> prueban el estado post-hidratación); la sesión responsive previa tampoco, porque midió por CDP el estado ya
> hidratado*» **[V]**. → Para `F-06`, `F-07` y `F-08`: **`pnpm build` → servir → `fetch` del HTML crudo → medir
> a 320/360/375/390/414/768/1280**. Y recordar que **`pnpm dev` no ejercita el SSG** (§6.4): hay que usar
> `pnpm dev:ssr` o el build. *En un stack SSG hay **dos** estados —prerender y post-hidratación— y jsdom solo ve
> el segundo.*

### Bloque 0 — Cimientos

**`F-00` · Arranque del stack — NO es una feature del pipeline**
Rellenar `harness.config.json` (§6.1), crear `package.json` (`node >=22.13.0`, `packageManager` pnpm 11.x),
`.nvmrc`, `tsconfig.json`, `eslint.config.js`, `.prettierrc.json`, `vitest.config.ts`, `vitest.setup.ts`,
`pnpm-workspace.yaml` (`allowBuilds`), `stryker.config.json` (`break: 100`). Verificar con `bin\harness.ps1 init`.
→ **Todo esto está fuera de `src/` y de los tests: lo hace el `craftsman_lead` directamente** (CLAUDE.md,
«Cuándo NO aplica el rol de orquestador»). **Sin esto el arnés no verifica nada** (B-13). **Es lo primero.**

---

**`F-01` · `puerta_placeholders`** 🥇 **LA PRIMERA FEATURE REAL**
- **Entrega:** capa explícita de datos «placeholder» + **el build de producción falla si queda alguno**.
  Es la decisión 9 del humano, y es lo que hace **estructuralmente imposible** publicar por accidente
  las fotos IA (B-6), las reseñas inventadas (§4.3), los precios de plantilla o el `+34 600 123 456`.
- **Lógica testeable:** ★★★ **la mejor del proyecto para TDD y mutación.** Es una función pura
  `detectarPlaceholders(datos|artefactos) → violaciones[]` en `src/lib/placeholders.ts`. Casos de test
  obvios y mutantes que deben morir: lista de patrones prohibidos (`IMAGEN TEMPORAL`, `Plantilla de
  demostración`, `600123456`, `hola@nailslashstudio.com`, `Calle de la Belleza`, `ph-woman`), flag
  `esPlaceholder` por registro, y el **exit code ≠ 0**. Mutar `&&`→`||`, `>`→`>=` o negar el predicado
  **debe romper un test**.
- **Puerta legal:** LCD **art. 27.8** (per se, art. 19.2) para las reseñas *placeholder*; **LCD art. 5.1.g)**
  para las fotos IA; **art. 47.m TRLGDCU**.
- **Dependencias:** `F-00`. · **¿Bloqueada?** **No.**
- *Por qué primero: convierte todas las líneas rojas de §4 en una puerta mecánica, y permite trabajar con
  datos falsos sin riesgo. Todo lo demás se apoya en ella.*

**`F-02` · `datos_negocio_fuente_unica`**
- **Entrega:** `src/lib/site.ts` (el base ya tiene ese fichero **[V-SINT]**) con **el NAP canónico**:
  `Nails Lash Studio` · `C.C. El Zoco, Av. de Atenas 75, Local 41, 28232 Las Rozas de Madrid` ·
  `625 22 33 66` · L-V 10:00–20:00, S 10:00–14:00, D cerrado. **Un solo módulo. Nada hardcodeado en plantillas.**
- **Lógica testeable:** ★★★ **mata H-2, el bug más peligroso del prototipo.** Funciones puras:
  `telHref(tel) → "tel:+34625223366"`, `waHref(tel, texto)`, `formatoTelefono()`. **Criterio de aceptación
  verificable:** *cambiar el teléfono en un único sitio cambia el texto **y** el `href` en las 7 apariciones*
  (HTML:255, 256, 308, 309, 311, 359, 360). Mutantes: normalización E.164 (quitar `+`, ceros, espacios).
- **Puerta legal:** TRLGDCU **art. 20.1.a)** + **60.2.b)** (identidad y teléfono en la oferta comercial).
- **Dependencias:** `F-01`. · **¿Bloqueada?** **No** — el NAP está verificado por triple fuente.
- *Ojo: el email y los precios NO entran aquí; entran como placeholder (B-3, B-5).*

**`F-03` · `tokens_paleta` + `puerta_contraste`**
- **Entrega:** los 13 tokens en **`:root` real** (no `style` inline) con **los 7 cambios obligatorios**:
  `--muted #9C7F89 → #6F525A` · `--accent` **como texto o como relleno con texto blanco** → `--accent-dark #A23E5F`
  · `--accent-2 #E38AAE → #B3316E` · **nuevo `--border-interactive: #AB5F79`** · fondo del pie `--ink #B0466A → #8E3355`
  · «en línea» `#2f9d5f → #186237`. **`#C05576` se conserva como color de marca en rellenos grandes y decorativos.**
- **Lógica testeable:** ★★★ **el candidato ideal del proyecto** (lo dice el propio informe de a11y, §5.4):
  la fórmula de contraste (W3C **G17**: `L = 0.2126R + 0.7152G + 0.0722B`, ratio `(L1+0.05)/(L2+0.05)`) es
  **matemática pura y determinista**, y **ya tiene implementación de referencia verificada** (`contrast.py`).
  → `src/lib/contraste.ts` (mutable) + test que **lee `_tokens.scss` y recalcula todos los pares**, fallando el
  build si alguno baja del umbral. Mutantes jugosos: el umbral `<= 0.04045`, los coeficientes, `4.5` vs `3.0`,
  el `+0.05`. **Los tokens en sí son CSS: no son mutables. La puerta sí.**
  **El molde ya existe en el base:** `src/styles/tokens.test.ts` hace exactamente esto (`readFileSync` del SCSS
  + regex sobre `:root`) **[V-SINT]** — aquí se sube un escalón: en vez de asever*ar* un hex, **se recalcula el ratio**.
- ⚠️ **NO copiar `_tokens.scss` de WebEmpresa tal cual.** El repo base **arrastra 3 bloqueantes de contraste AA
  sin cerrar en HEAD** (`--color-accent` 3,78:1, `--color-tag-ink` 2,64:1, `--color-text-faint` 2,78:1), y **su
  checklist de marca afirmaba «AA validado» siendo falso** **[V: `stack-aprendizajes.md`, ratios recomputados por
  el propio investigador]**. → **Recalcular siempre uno mismo; no fiarse de la documentación del base.**
- 🔴 **La lección que justifica que la puerta sea una feature y no una recomendación:** en WebEmpresa esos 3
  bloqueantes **se evaporaron porque ninguna feature de `feature_list.json` los representaba** — las tres puertas
  (tests, judge, mutación) siguieron **verdes con la web incumpliendo AA** **[V: `stack-aprendizajes.md`]**.
  *Una auditoría sin puerta no existe.* Por eso `puerta_contraste` va **en la misma feature que los tokens**.
- **Puerta a11y/legal:** WCAG 2.2 **SC 1.4.3** (4,5:1 / 3:1) y **SC 1.4.11** (3:1 en componentes) → **RD 193/2023
  art. 14.2** + **TRLGDCU art. 20.2**.
- **Dependencias:** `F-00`. · **¿Bloqueada?** **No.**
- *Dos trampas que un chequeo ingenuo de la paleta NO caza y hay que meter en el Gherkin:* **(a)** `clamp()`
  cambia el umbral con el viewport — «Studio» (`clamp(14px,2.2vw,24px)`, ratio 4,19:1) **pasa en escritorio y
  falla en móvil**; **(b)** la cabecera es `color-mix(... 82%, transparent)`, así que **su contraste cambia al
  hacer scroll**: el logo `--ink` falla cuando pasan por debajo el pie o un botón (3,88:1 / 3,96:1) **[V]**.
- *Y hay una decisión de negocio escondida:* **[NV]** si «Nails Lash Studio» es **logotipo**, SC 1.4.3 lo exime.

**`F-04` · `cascaron_semantico`**
- **Entrega:** `<html lang="es">`, `<title>`, `meta description`, **un `<h1>` real**, `<main>`, `<section
  aria-labelledby>`, `:focus-visible` global, `html{scroll-padding-top}`, y el **pie con los huecos de los
  enlaces legales** (aún sin destino). Mata H-3, H-15 y H-16 (**«Plantilla de demostración»**).
- **Lógica testeable:** ★★ `src/lib/seo.ts` (existe en el base y **es target de mutación allí** **[V-SINT]**):
  composición de `<title>`, canónica, JSON-LD. **El JSON-LD hay que escribirlo de cero** — copiar el de la web
  actual propagaría `addressLocality: "Las Ceudas"` y el `vatID` malformado **[V-SINT]**. `LocalBusiness`/
  `BeautySalon` con `geo: 40.5179875, -3.9226688`, **sin `aggregateRating`** (§5). Assertions de render con
  Testing Library para landmarks y jerarquía.
- **Puerta a11y/legal:** SC 3.1.1, 1.3.1, 2.4.2, 2.4.7 (todas A/AA) · **LSSI art. 10.1** (el enlace del pie
  debe ser **permanente** — en todas las páginas) · **TRLGDCU art. 60.4** (castellano).
- **Dependencias:** `F-02`, `F-03`. · **¿Bloqueada?** **No** (el *contenido* de las páginas legales sí: `F-16`).
- *Test de regresión barato que previene el fallo real de la web actual: **el enlace del aviso legal debe
  responder 200**. Hoy da 404 **[V-SINT]**.*

**`F-05` · `cero_terceros` (fuentes autohospedadas)**
- **Entrega:** `@fontsource` con woff2 subsetado a `latin`; **cero peticiones** a `fonts.googleapis.com`/
  `fonts.gstatic.com`; **sin `wght@300`** (el prototipo lo pide y **no lo usa ni una vez** **[V]**); `font-display:swap`.
  Decidir si **Great Vibes** sobrevive: es **una familia entera para ~10 glifos**, y justo en el camino crítico del LCP **[V]**.
- **Lógica testeable:** ★★★ **binaria y perfecta para TDD**: `src/lib/terceros.ts` → `detectarOrigenesExternos(html|css)
  → string[]` con **allowlist vacía**. Test que **falla si el build contiene cualquier origen externo**. Detecta
  de una vez Fonts, Maps, píxeles y **cualquier regresión futura**. Mutantes: la comparación de origen, el
  predicado de allowlist.
- **Puerta legal:** **RGPD** (evita el análisis de corresponsabilidad de *Fashion ID*) + **art. 22.2 LSSI**:
  mantener «cero cookies» **verificado en cada build** convierte «no usamos cookies» de promesa en hecho, y
  **elimina banner, CMP y política de cookies** de un plumazo (§4.4).
- **Dependencias:** `F-00`. · **¿Bloqueada?** **No.**
- *Es la decisión de mayor apalancamiento del proyecto: sostener este invariante borra una clase entera de riesgo.*

### Bloque 1 — Contenido visible (bajo riesgo, alto valor de demostración)

**`F-06` · `header_nav` + `footer`**
- **Entrega:** cabecera sticky + nav + pie. **Resuelve H-1**: la nav del prototipo **ignora 4 de las 11
  secciones** (`#colores`, `#reserva`, `#contacto`, `#faq`) — y `#contacto` (horario y dirección) es
  **información crítica de un salón físico** **[V]**. Menú móvil (7 elementos se envuelven hoy en varias filas).
- **Lógica testeable:** ★★ `src/lib/nav.ts` (target de mutación en el base **[V-SINT]**). **🔴 Aquí muerde el
  patrón de memoria `red-css-para-rama-solo-js-en-ssg`:** si la bifurcación móvil/escritorio se decide con
  `useIsMobile` (JS), **el SSG hornea la rama de escritorio** y en móvil desborda hasta que hidrata. **Obligatorio:
  red CSS en el MISMO breakpoint** + **test que lee el `.module.scss`** y asevera el `@media`. El test con
  `matchMedia` mockeado **no cubre el HTML pre-hidratación**.
- **Puerta a11y:** SC 2.4.11 (la cabecera sticky puede tapar el foco: `scroll-margin` **no** actúa al tabular;
  hace falta `scroll-padding-top`) **[V]**. `scroll-margin-top` fijo (66/70 px) se desincroniza con la cabecera
  envuelta → derivar de la altura real.
- **Dependencias:** `F-04`. · **¿Bloqueada?** **No.**

**`F-07` · `hero_marca`** 🔴 **la feature donde el patrón de memoria decide el diseño**
- **Entrega:** hero con `<h1>` real y la animación de pincel.
- **Lógica testeable:** ★★ el hook de replay/`IntersectionObserver` va a `src/lib/` (cf. `useReveal.ts`, target
  de mutación en el base) — **SSR-safe** (`if (typeof IntersectionObserver === 'undefined') return`) y armando
  el flag en `useEffect`, **no en render** (evita mismatch de hidratación). + **test que lee el SCSS**.
- **🔴 Patrón obligatorio (`estado-base-visible-ssg-reduced-motion`):** el prototipo hace **exactamente lo
  prohibido** — `paintReveal` va **desde `clip-path:inset(0 100% 0 0)`** (base **oculto**) y «Studio» está en
  `opacity:0` hasta t=4,4 s **[V]**. Bajo SSG **el nombre del salón se hornea invisible**, y bajo
  `prefers-reduced-motion` **se queda congelado invisible**. → **El estado base en CSS es SIEMPRE el estado
  final visible; el oculto vive solo en el `0%` del keyframe.**
- **Puerta a11y/perf:** **SC 2.2.2 Pause, Stop, Hide (Nivel A)** — `bob 2.4s infinite` (L57) **es un
  incumplimiento verificado**: arranca solo, dura >5 s e infinita, sin mecanismo de parada. **Quitar el
  `infinite`.** (El botón «↺ Repetir» es control de *repetición*, no de *parada*: no vale) **[V]**. **LCP ≤ 2,5 s
  p75** — hoy el hero tarda **~5,3 s** en ser legible **por decisión de diseño**; techo: **≤1,2 s** y **nada de
  `opacity:0` sobre el elemento LCP** («*Elements with an opacity of 0… are invisible to the user*» quedan
  excluidos del LCP **[V: web.dev/articles/lcp]**).
- **Dependencias:** `F-03`, `F-04`. · **¿Bloqueada?** **No.**

**`F-08` · `rejilla_responsive`** — **es una feature de CSS, y lo digo**
- **Entrega:** `repeat(auto-fit, minmax(min(320px,100%), 1fr))` en las 7 rejillas + **eliminar
  `overflow-x:hidden` de la raíz** (es un parche que **oculta** el desbordamiento en vez de arreglarlo).
- **Lógica testeable:** ★ **Nada que mutar: es CSS.** Su puerta es **(b)**, el test que lee el SCSS, más un
  criterio medible: **a 320/360/375/390/414 px, `document.documentElement.scrollWidth <= clientWidth`** y
  ninguna tarjeta recortada. → **`mutate` propio: ninguno. Declararlo en `progress/`.**
- **Por qué existe:** a **360 px** (Galaxy, ancho masivo) las tarjetas de equipo **desbordan 40 px** y el
  `overflow-x:hidden` **lo recorta en silencio** — se ve como tarjetas cortadas, no como un bug **[V]**.
  Spec CSS Grid: «*if any number of repetitions would overflow, then 1 repetition*» — pero esa pista **conserva
  su mínimo de 320 px** **[V: w3.org/TR/css-grid-1/]**.
- **Puerta a11y:** SC 1.4.10 Reflow. · **Dependencias:** `F-04`. · **¿Bloqueada?** **No.**

**`F-09` · `catalogo_servicios`** — **BLOQUEADA para publicar, construible ya**
- **Entrega:** las 3 secciones **Uñas · Pestañas · Cejas** (¡no Facial/Depilación!) desde datos, con
  **variantes S/M/L** (`servicio → variantes[]`, **no aplanar**) y leyenda **«Precios con IVA incluido»**.
- **Lógica testeable:** ★★ modelo de datos y render; `precio_con_iva` como **dato canónico** (no `precio_base`
  + IVA calculado en la vista); `precio_desde: bool` con base de cálculo; `suplementos[]`.
- **Puerta legal:** **Ley 11/1998 CM art. 14.2** (precio en las ofertas concretas) · **TRLGDCU art. 20.1.c)**
  (precio final **con impuestos**) · **art. 20.2** (accesible) · **LSSI art. 10.1.f)**.
- **Dependencias:** `F-01`, `F-02`, `F-03`. · **🔒 BLOQUEADA:** precios reales + **¿llevan IVA?** (B-5) +
  la contradicción Treatwell↔pestañas (C-04). **Se construye con datos placeholder tras la puerta `F-01`.**
- ⚠️ **Riesgo de diseño a evitar:** un campo libre `precio_anterior: number` editable a mano es **una máquina de
  generar infracciones**. Si hay descuentos, debe **derivarse de un histórico con fechas** y la UI **negarse a
  renderizar** el «antes» sin respaldo **[I]**.

**`F-10` · `horario`** — **entrega:** bloque de horario. **Lógica testeable:** ★★★ pura
(`estaAbierto(ahora)`, formateo, `openingHoursSpecification`). **Debe modelarse como dato, no como copy**,
porque tendrá excepciones (**festivos y agosto: [NV]**, §8 P-8). **Dependencias:** `F-02`. **No bloqueada**
(el horario semanal está verificado por triple fuente); **las excepciones sí**.

**`F-11` · `mapa_como_llegar`** — **entrega:** **imagen estática autohospedada + enlace «Cómo llegar»** que
abre Maps en pestaña nueva. **Lógica testeable:** ★ poca (construcción de la URL). **Puerta legal: es la
decisión que por sí sola evita el banner de cookies** (§4.4): incrustar el iframe **rompe «cero terceros»** y
arrastra la EU User Consent Policy de Google. Mencionar **Planta 0, Local 41**. **Dependencias:** `F-05`. **No bloqueada.**

**`F-12` · `contacto`** — **entrega:** dirección, teléfono (`tel:` prominente en móvil), Instagram
(`@nailslash.studio_`), Facebook en el pie sin peso visual, **TikTok NO**. **Lógica testeable:** ★★ vía `F-02`
(los `href` derivan del dato). **Puerta legal:** **RD 193/2023 art. 14.1** — información accesible
«**independientemente del canal**» → **alternativa accesible junto al botón de WhatsApp (teléfono/email)** **[V]**.
**Dependencias:** `F-02`. **No bloqueada** (email sí: B-3).

### Bloque 2 — Interacción (aquí está el riesgo)

**`F-13` · `solicitud_whatsapp`** ⚠️ **la feature con más lógica mutable y más carga legal**
- **Entrega:** el calendario compone la solicitud y abre WhatsApp (decisión 3). **Sustituye a H-8/H-11**:
  la reserva del prototipo **no reserva** y el chat **no envía**, pero ambos prometen «Te confirmaremos por
  WhatsApp» **[V]**. **La composición del mensaje NO EXISTE en el prototipo** (0 coincidencias de `?text=`):
  **es una feature a diseñar, no a portar** **[V]**.
- **Lógica testeable:** ★★★ **la joya del TDD y la mutación.** Tres módulos puros en `src/lib/`:
  1. `generarDias(ahora, tz, festivos)` — **reloj inyectable, nunca `new Date()` directo**: el prototipo lo
     calcula **una sola vez en el montaje** (una pestaña abierta al cruzar medianoche muestra los días de ayer)
     y **con la zona horaria del cliente**, no `Europe/Madrid` **[V]**. Mutantes obligados: `getDay()!==0`
     (domingo), `days.length<6`, el orden `setDate` antes del `push` (el primer día es **mañana**).
  2. `franjasDisponibles(dia, horario, duracion)` — **mata H-9/CAL-1**: el prototipo ofrece **16:00, 17:30 y
     19:00 un sábado con el salón cerrado a las 14:00** **[V]**. Las franjas **dependen del día**.
  3. `componerMensajeWhatsApp(datos) → URL` — **`encodeURIComponent` obligatorio** (acentos, `·`, emoji, `&`,
     `#`); campos ausentes se omiten (**nada de `undefined`**); número E.164 sin `+`.
  Mutantes que **deben** morir: `&&`↔`||` en `canBook` (`st.day!=null && st.time!=null`), el `+5` de
  `((rev%5)+5)%5` (solo rompe con negativos → **exige un test que pulse «←» desde 0**), `idx<flow.length`.
- **Puerta legal:** **RGPD art. 13.1** — informar «**en el momento en que estos se obtengan**» → **capa 1 junto
  al botón**, no solo en el pie (art. 11 LOPDGDD) · base **art. 6.1.b)**, **no consentimiento** ·
  **minimización art. 5.1.c)**: pedir **solo** servicio, fecha/hora y nombre; **no** pedir datos de salud
  («soy alérgica», «estoy embarazada» = **art. 9 RGPD**, categorías especiales) **[I, no verificado con el
  salón]**. **Prohibido** mantener «Te confirmaremos por WhatsApp» si no hay canal real: con `wa.me` **es honesto
  porque el mensaje lo envía el usuario**. **Prohibido** el «en línea» falso del chat.
- **Puerta a11y:** ⚠️ **el date-picker es el punto más difícil de hacer accesible** de todo el proyecto: partir
  de `<input type="date">` nativo o de un patrón ARIA probado, **nunca** de un calendario a medida. `aria-pressed`
  + **marca no cromática** (SC 1.4.1: hoy el día seleccionado se comunica **solo por color**), `aria-live` en la
  confirmación (SC 4.1.3), `<label>` real y **quitar `outline:none`** (SC 2.4.7) **[V]**.
- **Dependencias:** `F-02`, `F-03`, `F-04`, `F-10`. · **¿Bloqueada?** **No** para la lógica; **sí** el texto
  legal de la capa 1 (B-4). **Los festivos: [NV].**
- **[NV] importante:** el formato `wa.me/<num>?text=<urlencoded>` **no está verificado contra fuente primaria**
  (el Help Center de WhatsApp se renderiza con JS; la URL de Meta da 404) → **verificar a mano antes de
  implementar y probar en Android + iOS + WhatsApp Web** (§9).
- **Decisión de arquitectura que hay que cerrar antes del Gherkin:** el prototipo tiene **dos** vías de reserva
  (`#equipo` con agenda + `#reserva` con chat) **y ninguna funciona**. **[I] Recomendación: una sola vía honesta.**
  Nota: enlazar/derivar a Treatwell mantiene el **art. 97 TRLGDCU** (21 extremos + formulario de desistimiento
  + confirmación en soporte duradero) **fuera de nuestra web**; construir reserva propia **nos lo trae entero** **[V]**.

**`F-14` · `resenas_agregado_enlace`** — **entrega:** nota agregada + atribución + enlace + **sello de fecha**
+ **aviso del art. 20.4**. **Lógica testeable:** ★ poca (render + fecha). **Puerta legal:** **art. 20.4 TRLGDCU**
(declarar si se garantiza y cómo se procesan) · **sin `aggregateRating`** · **la nota no se hardcodea**: hoy 4,9,
mañana no → o dato con fecha, o no se muestra **[V]**. **Dependencias:** `F-04`. **No bloqueada** técnicamente;
**sí la elección de plataforma** (§5, P-9).

**`F-15` · `faq`** — **entrega:** acordeón de apertura única. **Lógica testeable:** ★★ toggle
(`s.faq===i?-1:i`) + `aria-expanded`/`aria-controls` (H-14). **Trampa SSG/SEO:** el prototipo **destruye y
recrea** la respuesta en el DOM (`sc-if`) → **invisible para Ctrl+F y para el rastreador**; con CSS o `<details>`
sí se indexa **[V]**. **Dependencias:** `F-04`. **🔒 BLOQUEADA en contenido:** «formas de pago» y «cancelación
24 h» son **compromisos contractuales** de plantilla (§8 P-4).

### Bloque 3 — Bloqueadas por el cliente / últimas

**`F-16` · `paginas_legales`** — **🔒 BLOQUEADA (B-1/B-2/B-3/B-4).** `/aviso-legal` y `/privacidad` generadas
desde **una fuente de datos única del titular**, con **todos los campos como placeholder** → **`F-01` debe
cubrirlas**. **Lógica testeable:** ★★★ *el test de que el build falla si algún campo legal es placeholder se
puede escribir **YA***, y la estructura también. **Nunca** copiar una plantilla genérica: un aviso legal con
datos de otro **equivale a no tenerlo** **[I]**.

**`F-17` · `pipeline_imagenes`** — **🔒 BLOQUEADA** (no hay fotos reales). `<picture>` AVIF→WebP→JPEG,
`width`/`height` (CLS), `loading="lazy"` **salvo el LCP**, `alt` **por imagen definido en la fuente de datos**
(el `<image-slot>` del prototipo **tiene `alt=""` hardcodeado y no admite `alt`** → hoy **no hay dónde
escribirlos**) **[V]**. Entrega de fotos en **proporción exacta**: equipo **4/3**, categorías **4/5**.
⚠️ **Los −99 % medidos sobre los `ph-*.png` NO son extrapolables a fotos reales** (son gráficos planos con el
texto «IMAGEN TEMPORAL» impreso) **[V]**.

**`F-18` · `equipo`** — **🔒 BLOQUEADA — no empezar spec** (B-6, B-11). **[I] Recomendación fuerte:** construir
la web **sin sección de equipo**, con copy que funcione hablando de «nuestro equipo de esteticistas», y tratarla
como feature aparte **si el cliente la pide**. Si algún día se publica: **datos externalizados, nunca
hardcodeados** — el art. 2.3 LO 1/1982 y el art. 7.3 RGPD («*Será tan fácil retirar el consentimiento como
darlo*») convierten un derecho legal en un ticket de desarrollo si el array vive en el JSX **[V]**.

**`F-19` · `probador_color`** — **la última.** Feature de deleite. **Lógica testeable:** ★★ selección única +
`aria-pressed` + `aria-label` (hoy los botones **no tienen nombre accesible**, solo `title`, y el estado activo
se comunica **solo con un anillo de color** → **SC 1.4.1**) **[V]**. Resolver **H-5**: «Reservar con este tono»
**no arrastra el tono** a ninguna parte. **🔒 Semi-bloqueada:** **[NV]** los 12 esmaltes son inventados
(marcas declaradas: `Neonail`, `Indigo Nails`). *Y el texto promete «descúbrelo sobre las uñas» cuando son 5
`<div>` con `border-radius`* **[V]**.

**`F-20` · `presupuesto_perf_ci`** — opcional. Lighthouse CI como puerta: **LCP ≤2,5 s, CLS ≤0,1 (p75)**
(umbrales oficiales **[V: web.dev]**). Los presupuestos por recurso de `audit-perf.md` §5.4 son **[I]** del
investigador, **no cifras de fuente**.

### Features del prototipo que NO se construyen

| Del prototipo | Decisión | Motivo |
|---|---|---|
| `#reserva` (chat simulado) | **NO se construye como chat** | Simula un agente «en línea» que no existe y **no envía nada**; recoge el nombre sin aviso de privacidad **[V]**. Se sustituye por `F-13` |
| Agenda con disponibilidad (`#equipo`) | **NO** | Sin backend no hay disponibilidad: **dos clientas pueden «reservar» la misma hora** (H-10) **[V]** |
| Reseñas por profesional | **NO** | H-7: inventadas, **rotadas** (Paula≡Lucía) y **★★★★★ fijo** **[V]** |
| Capa de temas (3 paletas) | **NO** | Decisión 5. *Las 3 opciones eran **el mismo archivo salvo 4 líneas*** **[V]** → nunca fue una feature |
| `cat.slot` | **NO migrar** | Campo muerto e incoherente (`s1-depil` vs `s1-depilacion`) **[V]** |

---

## 8. Preguntas para el cliente (lista cerrada y mínima)

> Ordenadas por lo que desbloquean. **P-1 a P-4 desbloquean la publicación.** Todo lo demás es contenido.

| # | Pregunta | Desbloquea |
|---|---|---|
| **P-1** | **Nombre y apellidos o denominación social exactos** (como en el modelo 036/037), **NIF/CIF**, y domicilio del titular si difiere del local. ¿Autónoma o sociedad? Si es sociedad: datos de inscripción (tomo, folio, hoja) | B-1, B-2, B-4 · **LSSI art. 10.1.a) y e)** |
| **P-2** | **¿Qué email atendéis?** ¿Es `centroesteticarozas@gmail.com`? *(aparece en el código de vuestra web actual pero no se muestra en ninguna parte)*. Debe ser **real y atendido** | B-3 · **LSSI art. 10.1.a)** |
| **P-3** | **Tarifa oficial vigente** — y la pregunta de mayor riesgo económico: **¿los precios llevan el IVA incluido?** | B-5 · **TRLGDCU art. 20.1.c)** |
| **P-4** | **¿Seguís ofreciendo pestañas?** Vuestra web las anuncia (lifting, pelo a pelo, tinte) pero **vuestra ficha de Treatwell no vende ni un servicio de pestañas** y sí vende pedicura y depilación. **¿Cuáles son las 3 categorías reales?** ¿Y micropigmentación / depilación con hilo / parafina (aparecen en la ficha del Zoco, no en vuestra web)? | C-04, `F-09` |
| **P-5** | **¿Ofertas vigentes reales?** Si hay «antes/ahora», necesitamos el **histórico de precios con fechas** — sin él, no se publica el «antes» | B-7 · **LCD art. 5.1.e)** |
| **P-6** | **¿Vendéis producto físico** (esmaltes, cosmética, kits)? ¿Y **cajas regalo** (Wonderbox/Cofre Vip, código `LAR121`)? | Cambia el alcance legal: activaría **RD 3423/2000** y **LOCM art. 20** (regla de 30 días, ahí sí obligatoria) |
| **P-7** | **¿Estáis adheridas a arbitraje de consumo** o a algún código de conducta? ¿Se presta **micropigmentación/tatuaje/piercing**? | **TRLGDCU art. 60.2.k)** · **LSSI art. 10.1.c) y g)** |
| **P-8** | **¿Controláis el dominio `nailslashlasrozas.es`** y tenéis acceso al **Google Business Profile**? ¿Reemplazamos con 301 o dominio nuevo? **Horario de festivos y agosto.** | B-8, B-9, `F-10` |
| **P-9** | **¿Sección «Equipo»?** Si sí: ¿quiénes, con qué nombre, con o sin foto? ¿Son **empleadas o autónomas**? ¿Han dicho que sí **sabiendo que pueden negarse sin consecuencias**? **Y: ¿mostramos la nota de Treatwell (4,9·1.231) o la de Google (4,9·226)?** | B-6, B-11, `F-14`, `F-18` |
| **P-10** | **¿Qué se recibe por WhatsApp?** (¿mensajes con alergias/embarazo → **datos de salud, art. 9 RGPD**?) · **¿Atendéis a menores de 14 años?** (art. 7 LOPDGDD) · **¿cuánto tiempo se conservan las solicitudes de cita?** (art. 13.2.a exige declarar el plazo) | `F-13`, `F-16` |

**Y un aviso que no es una pregunta, es un favor con valor legal:** decidle **ya** que **su web actual tiene el
aviso legal roto (404)** y que su política de privacidad no identifica al responsable. El **art. 48.4 TRLGDCU**
premia la corrección diligente **antes** de que se inicie un procedimiento sancionador **[V]**. No hay que
esperar a la web nueva.

---

## 9. Claims refutadas / no usar

> Un verificador adversarial **refutó 22 afirmaciones** de los informes en bruto **[V-LEAD §7]**. Aquí está lo
> que **NO debe darse por cierto**, agrupado por patrón de fallo, para que sirva de aprendizaje del arnés.

### 9.1 Normas mal elegidas o mal citadas

| ❌ No usar | Por qué | Qué usar |
|---|---|---|
| **«La regla de los 30 días obliga a nuestras ofertas»** (LOCM art. 20, red. RDL 24/2021) | **Norma mal elegida.** Su literal se ciñe a **artículos/productos**, y este negocio vende **servicios**. La **Comisión Europea** lo dice expresamente: «*la DIP, **incluido su artículo 6 bis, no se aplica a los servicios***» **[V: Directrices 2021/C 526/02 §1.1]**. La Directiva 98/6/CE art. 1 habla de «**productos**» y su art. 3.2 excluye los suministrados «con ocasión de una prestación de servicios» | **LCD art. 5.1.e)** (engaño sobre «la existencia de una **ventaja específica con respecto al precio**»), que **sí** cubre servicios. **[I] Adoptar los 30 días voluntariamente como puerto seguro**: no tenemos criterio tasado que nos proteja, así que el estándar nos **mejora** la posición probatoria |
| **«Art. 6 ter de la Directiva 98/6/CE»** | **No existe con esa numeración.** Es el **art. 6 bis** (*Article 6a*) **[V]** | art. 6 **bis** |
| **«Art. 38.3.a) LSSI»** | **Redacción derogada de 2002**, sin el adverbio «significativo». Numerosas fuentes secundarias la siguen citando **[V]** | **art. 38.3.b)**, vigente, que exige incumplimiento **significativo** |
| **«Art. 49 TRLGDCU es el catálogo de infracciones»** | **Desactualizado**: el RDL 24/2021 (art. 82.4) **reordenó el Título IV** **[V]** | **art. 47** = infracciones · **art. 48** = calificación · **art. 49** = sanciones |
| **«Multas del 4 % del volumen de negocio por reseñas falsas»** | **Descontextualización.** El **art. 49.5 TRLGDCU** solo opera cuando la sanción se impone «con arreglo al **art. 21 del Reglamento (UE) 2017/2394**» = **infracciones generalizadas con dimensión de la Unión**. Un salón de Las Rozas **no puede realistamente incurrir** en ese supuesto **[I sobre texto V]** | El marco real: **art. 49.1.a) — 150 a 10.000 €** |
| **«Multas de hasta 15 M€ por el AI Act»** | Titular irreal para un salón: el **art. 99.6** limita a las **pymes** al **menor** de los dos importes **[V]**. Y solo aplicaría **si** el art. 50.4 nos vinculara — **lo cual es dudoso** (§4.6) | **El riesgo es la LCD, no el AI Act** |
| **«Las cuantías de sanción de accesibilidad son 30.001–150.000 €»** | **Importadas de otro título** de la Ley 11/2023 (extranjería). El régimen real remite al **Título III del RDL 1/2013**, **no leído** **[V]** | **No citar importes** |
| **«Las microempresas están exentas del EAA»** (a secas) | **Falso como generalización**: la exención del art. 3.3 es **solo para servicios**; a las microempresas «que guarden relación con productos» solo se les exime de **documentar** la evaluación (art. 8.4) **[V]** | Y sobre todo: **el RD 193/2023 no tiene exención de microempresa** (§4.5) |
| **«El RD 193/2023 es la transposición del EAA»** | **Falso.** Su preámbulo dice que «se verá necesariamente complementado por la norma de transposición» **[V]** | La transposición es la **Ley 11/2023, Título I** |
| **«El RD 3423/2000 obliga a publicar nuestras tarifas»** | Regula **productos** y excluye los suministrados con ocasión de una prestación de servicios (arts. 1.1 y 1.2) **[V]**. **Citarlo en el aviso legal sería un error** | **Ley 11/1998 CM art. 14.2** |

### 9.2 Truncamientos, sobrelecturas y mala atribución

| ❌ No usar | Por qué |
|---|---|
| **El considerando 43 de la Directiva (UE) 2019/882 citado a medias** | **Truncamiento que invierte el sentido** **[V-LEAD §7.2]**. El literal completo es: «*deben aplicarse a **la venta en línea** de cualquier producto o servicio y, por tanto, también deben aplicarse a la venta de un producto o servicio sujeto por sí mismo a la presente Directiva*» **[V]**. **Verificar el literal entero antes de apoyarse en él** |
| **«La AEPD prohíbe Google Fonts»** / **«El EDPB exige consentimiento para Google Fonts»** | **NO EXISTE tal pronunciamiento** — buscado y no encontrado **[NV]**. Lo segundo es **sobrelectura**: el ap. 56 de las Guidelines 2/2023 avisa de que «*the applicability of this article does **not systematically mean that consent needs to be collected**»* **[V]**. Y el ap. 47 distingue el píxel («*fulfils **no purpose related to the requested content** itself*») de un recurso que sí sirve al contenido — **una fuente renderiza texto: no es un beacon** **[V]**. → **Autohospedar es la decisión correcta, pero por ingeniería, no porque lo contrario sea ilegal** |
| **«Google Fonts es ilegal por el art. 44 RGPD»** | **El argumento ha caducado en parte**: desde el **10/07/2023** hay **decisión de adecuación** (UE) 2023/1795 para el **EU-US DPF**, al que **Google LLC declara estar adherido** **[V]** → la transferencia se ampara en el art. 45. *(La adecuación es revocable — y ya se cayó dos veces: Safe Harbor 2015, Privacy Shield 2020 — lo que es **[I]** un argumento a favor de autohospedar, pero por otro motivo)* |
| **La sentencia de Múnich (LG München I, 3 O 17493/20, 100 €)** | **Tribunal alemán de primera instancia: no vincula en España** y su razonamiento central se apoyaba en la ausencia de nivel adecuado post-*Schrems II* **[V]**. Además **el texto oficial no se ha leído** (solo fuentes secundarias alemanas) **[NV]** |
| **URLs de Google Maps sin `place_id`/CID** | **Mala atribución sistemática**: redirigen a `consent.google.com` (302) y sirven un shell de JS **sin datos** **[V-LEAD §7.1]**. Los datos del GBP **solo** se obtienen con **navegador real**; **un `curl` no sirve** **[V]** |
| **`https://example.com` como fuente** | **Fuente inventada/placeholder** en una claim **[V-LEAD §7.4]** |
| **Universales negativas** («no aparece en ninguno de los tres textos») | Contradichas por su propia fuente alegada **[V-LEAD §7.3]**. Este informe evita afirmar ausencias salvo cuando las he comprobado yo (y lo marco **[V-SINT]**) |

### 9.3 Datos del negocio que NO están verificados

| ❌ No dar por cierto | Estado real |
|---|---|
| **«El email del salón no existe»** (matiz sobre `01-hechos-verificados-lead.md` §4) | **Preciso, pero incompleto.** Es cierto que **no es accesible ni visible** — y por eso **no cumple el art. 10.1.a) LSSI**. Pero **sí está en el código**: `centroesteticarozas@gmail.com` en el único bloque JSON-LD, **0 apariciones fuera de `<script>`** **[V-SINT: fetch y parseo propios, 2026-07-16]**. **Vigencia [NV]** → P-2 |
| **El `vatID: "10656940"` de la web actual** | **Malformado** (8 caracteres; un NIF español tiene 9) **[V-SINT]**. **No es identidad fiscal válida. No usar, no completar, no deducir** |
| **«El equipo es Lady Johana, Sandra, Katerine, Irene, Camila, Zaira, **Erika**»** (`progress/current.md`) | **No cuadra con la fuente.** `datos-equipo.md` verifica **7 nombres**: Lady · **Johana** · Sandra · Katerine · Irene · Camila · Zaira — «Lady» y «Johana» son **dos personas distintas**, y **«Erika» no aparece en ninguna fuente**. Además **ningún humano ha visto la página** (extracción automática ×2 coincidentes) **[V]** → **confirmación visual pendiente** |
| **El apellido de Katerine** | La inicial «KP» sugiere apellido con P. **Prohibido deducirlo** **[V]** |
| **Los 43 servicios de Treatwell** | **Solo 39 verificados**; faltan 4 de pedicura, incluido el de 15 € (cargados por JS) **[V]**. **Prohibido presentar el catálogo como completo** |
| **Los precios de Treatwell como tarifa oficial** | **[NV]** — son los que el salón cargó en Treatwell, **con fecha desconocida** **[V]** |
| **Anomalías de Treatwell** (ítem 28 «Uñas de Gel L» = **15 minutos** cuando S y M son 1 hora; ítem 21 ídem) | **Prohibido «corregirlas» en silencio**: si realmente dura 1 hora, publicar 15 min **rompe la agenda real del salón** **[V]**. Se pregunta, no se adivina |
| **Horario `L-S 08:00–22:00`** y teléfono **`680 97 75 37`** (ficha del Zoco) | **Son del centro comercial, no del salón** **[V]**. Es el error más fácil de cometer leyendo esa ficha |
| **Fresha** | **No enlazar**: la propia Fresha declara «*The business **is not currently affiliated with or partnered with Fresha***» **[V]** |
| **«Más de 15 años»** | **[V] como declaración de marketing del propio salón; [NV] como hecho.** Sin fuente independiente |
| **El desglose de Treatwell** | **Incoherencia interna sin explicar**: su filtro por popularidad suma **1.014**, no las 1.231 anunciadas **[V]**. **No sé a qué responde [NV]** |
| **«Distrito Sur»** (título de Treatwell) | **Falso positivo**: es una etiqueta de su taxonomía de zonas, **no la ubicación** **[V]** |

### 9.4 Cuestiones abiertas que exigen abogado o verificación antes de implementar

| Cuestión | Estado |
|---|---|
| **El alcance real de la regla de los 30 días del art. 20.4 TRLGDCU** (reseñas) | **La mayor incertidumbre jurídica del expediente.** El párrafo dice «*a efectos del **apartado anterior**»* estando **dentro** del propio apartado 4 → **defecto de técnica legislativa**. No está claro si impide *publicar* reseñas de hace >30 días o solo condiciona la facultad de eliminación **[NV]** |
| **¿Un calendario que delega en WhatsApp es «comercio electrónico»?** | Zona gris real; los considerandos 42-43 **no la cierran**. **[NV]** — pero cumplir AA la hace irrelevante (§4.5) |
| **¿Un mero enlace a un perfil de reseñas activa el art. 20.4?** | **[NV]**. Por eso el enlace es la opción de **menor riesgo, no de riesgo cero** |
| **¿El art. 50.4 del AI Act cubre caras totalmente inventadas?** | Genuinamente discutible **[NV]**. No cambia la decisión: prohíbe la LCD |
| **¿Una cita de salón entra en el art. 103.l) TRLGDCU («esparcimiento»)?** | **[NV]** — solo bloqueante **si** se implanta reserva propia. Decide si hay 14 días de desistimiento sobre una cita |
| **Formato oficial de `wa.me/...?text=`** | **[NV]** contra fuente primaria (Help Center renderizado con JS; URL de Meta → 404). **Verificar a mano antes de `F-13`** |
| **Sintaxis `stryker run --mutate <fichero>`** en Stryker 9.6 | **[NV]** — hay que comprobarlo antes de fijar `commands.mutate` con `{{target}}` |
| **¿Sube pnpm 11 el `lockfileVersion` desde `9.0`?** | **[NV]** |
| **¿Es «Nails Lash Studio» un logotipo** a efectos de SC 1.4.3? | **[NV]** — decisión de negocio; si lo es, decae uno de los fallos de contraste |
| **Concurrencia art. 49 TRLGDCU (estatal) vs art. 53 Ley 11/1998 CM** (en **pesetas**) | **[NV]** — abogado de consumo. Lo seguro: consumo es **autonómico**, LSSI es **estatal** |
| **Ordenanzas del Ayuntamiento de Las Rozas** | **[NV]** — **no asumir que las de Madrid capital aplican**: es otro municipio |
| **Tipo de IVA de manicura/pestañas** | **[NV]** — no verificado en fuente primaria (el PDF de la AEAT no se pudo parsear). **No afecta al requisito**: la obligación es «precio final con impuestos», sea cual sea el tipo. Es asunto de la gestoría |

### 9.5 Claims del stack que no deben darse por buenas

| ❌ No dar por cierto | Estado real |
|---|---|
| **«`docs/architecture.md` del repo base describe el stack vigente»** | **Está desactualizado y contradice al código**: su §53-57 habla de paleta «Teal Profundo / Océano y Coral» cuando el código real es «Bosque & Limón / Noche & Oro» **[V]**. **No usar esa sección como fuente.** *Y es un aviso de método: la doc del base miente en al menos dos sitios (esto y el «AA validado» falso).* |
| **«`vite-react-ssg` está clavado a 0.9.0 por X motivo»** | **[NV]** — los 4 informes lo repiten como deliberado, pero **no hay ADR ni comentario que lo justifique**. Es inferencia repetida sin fuente nueva. *Mantener el pin, pero sin inventarle el porqué.* |
| **«RTL hace auto-cleanup sin `afterEach(cleanup)`»** | **[NV]** — el propio informe lo marca como inferencia no verificada en la doc oficial. `vitest.setup.ts` es **una sola línea** (`import '@testing-library/jest-dom/vitest'`). Comprobar antes de copiar el setup |
| **«jsdom hay que instalarlo aparte de Vitest»** | **[NV]** — no se encontró frase oficial que lo exija; solo se observa que WebEmpresa lo declara en devDependencies |
| **«El rewrite SPA de Vercel sería dañino con `dirStyle:'nested'`»** | **[I]** bien fundada, pero **el repo no lo documenta**. Es razonamiento, no hecho verificado |
| **«La config de Vercel (framework preset, regla de Firewall `contact-form`) es X»** | **[NV]** — vive **fuera del repo**, en un dashboard sin acceso |
| **«Clases CSS Module en camelCase» / «`type` nunca `interface`»** | **[I]** — consistentes al **100%** en el código pero **no escritas en ningún doc**. Conviene documentarlas, no darlas por norma de empresa todavía |
| **Criterio del sufijo `.behavior.test.tsx` / `.reveal.test.tsx`** y **criterio «contenido en componente vs. lib/»** | **[NV]** — inferidos de 1-2 casos, no documentados |
| **`coverageAnalysis: 'perTest'` en `stryker.config.json`** | **Redundante**: el vitest-runner **siempre** fuerza `perTest` **[V]**. Inofensivo |
| **«`checkRateLimit` protege el formulario»** | **Trampa operativa**: exige una **regla manual en el dashboard de Vercel**; si no existe, **es un no-op seguro y silencioso** — el código puede estar perfecto y no proteger nada **[V]**. *Solo relevante si algún día hay backend; con la decisión 3 (WhatsApp, sin backend) no aplica* |

---

## Anexo — Verificaciones de primera mano hechas al escribir este informe

| Qué | Cómo | Resultado |
|---|---|---|
| Web actual viva | `curl https://www.nailslashlasrozas.es/` | **HTTP 200, 51.064 bytes** |
| Aviso legal | `curl -o /dev/null -w %{http_code} .../es/aviso-legal` | **404** |
| Política de privacidad | ídem `/es/confidentiality_ws` | **200** |
| Email en la web actual | parseo del HTML quitando todos los `<script>` | `centroesteticarozas@gmail.com` **presente en el HTML, ausente fuera de `<script>`** (1 bloque `application/ld+json`) |
| `vatID` / `addressLocality` | ídem | `"10656940"` (8 chars) / `"Las Ceudas"` — **ambos solo dentro del JSON-LD** |
| Enlaces legales del HTML | `grep href` | `/es/aviso-legal` (404), `/es/confidentiality_ws`, `/es/aboutcookies`, **`business.safety.google/privacy/`** (tercero) |
| `WebEmpresa/package.json` | parseo propio | `packageManager: pnpm@11.9.0` · `engines: {node: ">=22.12.0", pnpm: ">=10"}` · 14 scripts (§6.1) |
| `WebEmpresa/harness.config.json` | listado del repo | **NO EXISTE** |
| `WebEmpresa/stryker.config.json` | parseo propio | `thresholds: {high:100, low:90, **break:100**}` · `testRunner: vitest` · **17 targets** |
| Estructura de `WebEmpresa/src` | `ls` (nivel 1 completo) | `main.tsx` · `App.tsx` · `vite-env.d.ts` · **`pages/`** · `components/` · `lib/` · **`styles/`** — tests **colocados** |
| Precedente del «test que lee el SCSS» | `head src/styles/tokens.test.ts` | **Existe y es el molde de `F-03`**: `readFileSync('src/styles/_tokens.scss')` + regex sobre `:root`, con el motivo escrito («*jsdom no resuelve custom properties… mismo patrón que `Header.test @s4`*») |
| Convenciones por conteo propio | `find` / `grep -c` | **0** barrels `index.ts` · **0** `paths` en tsconfig · **0** `alias` en vite · **0** ficheros con `@import` (2 con `@use`) · `css: false` en `vitest.config.ts:10` · **0** coincidencias de `styles` en `stryker.config.json` |
| Versiones locales | `pnpm --version` / `node --version` | **10.21.0** / **v22.15.0** |
| `NailsLashStudioWeb/harness.config.json` | lectura | `project: "mi-proyecto"`, `language: "generic"`, **5 comandos vacíos**, `threshold: 0.8` |
| Prototipo | listado | **Existe** en el scratchpad de sesión (`design/sitio-web-sal-n-de-u-as/project/`): 3 `.dc.html`, `salon-data.js`, `support.js`, `image-slot.js`, 11 `ph-*.png`. **Ubicación transitoria: se borrará** |
