# Datos reales del negocio: canales oficiales de Nails Lash Studio (Las Rozas)

> Investigación realizada el **2026-07-15**. Todas las afirmaciones llevan fuente.
> Clasificación usada en todo el documento:
> **[V] Verificado** (fuente citada y consultada) · **[I] Inferencia** (razonamiento propio sobre hechos verificados) · **[D] Desconocido / NO VERIFICADO**.
>
> Los datos de redes y precios cambian. Antes de publicar, **revalidar con el salón** (ver §5).

---

## 1. Respuesta ejecutiva

**Qué hacemos:**

1. **Canal social principal = Instagram [@nailslash.studio\_](https://www.instagram.com/nailslash.studio_/)** [V]. Es el único canal social vivo y está **confirmado como de ESTE salón**: su biografía declara literalmente la ubicación (`C.C.Zoco. Las Rozas. Madrid`) y el teléfono `625223366`, que coincide **exactamente** con el teléfono de la web oficial. No hay ambigüedad razonable en este punto.
2. **Teléfono público = 625 22 33 66** [V]. Es el dato más sólido del expediente: aparece idéntico en cuatro fuentes independientes (web oficial, bio de Instagram, ficha del centro comercial y ficha de Treatwell).
3. **Facebook [/nailslashstudiorozas](https://www.facebook.com/nailslashstudiorozas/) es oficial pero está muerto** (13 "Me gusta") [V]. Enlazar sí; darle peso visual, no.
4. **TikTok: NO VERIFICADO — no hay ninguna evidencia de que exista** [D]. No inventar un handle ni poner el icono "por si acaso".
5. **⚠️ Ya existe una web publicada: [nailslashlasrozas.es](https://www.nailslashlasrozas.es/)** [V]. **Esto es un hallazgo bloqueante de producto**: el proyecto no es un sitio nuevo en vacío, es un **reemplazo**. Hay que decidir con el cliente qué pasa con el dominio actual (migrar, redirigir 301 o convivir). Sin esa decisión, cualquier trabajo de SEO se hace a ciegas.
6. **⚠️ La web actual incumple**: el enlace "Aviso Legal" devuelve **HTTP 404** y la política de privacidad **no identifica al responsable del tratamiento** [V]. La web nueva **debe** corregir esto (art. 10 LSSI-CE / art. 13 RGPD). Es una obligación legal, no una mejora opcional.

**Por qué:** el salón es un negocio real, con reputación real (**4,9/5 sobre 1.231 reseñas** en Treatwell [V]) y una identidad digital dispersa entre cuatro plataformas con datos parcialmente contradictorios. La web nueva debe ser la **fuente canónica de verdad (NAP)** y arrastrar al resto, no añadir una quinta versión de los datos.

**Ambigüedad detectada y resuelta** (detalle en §2.3): la ficha del centro comercial enlaza a un Instagram **distinto** (`nail_lash_studio_`). Lo he comprobado: **es una cuenta vacía (0 publicaciones, 8 seguidores)** [V]. Es un enlace erróneo del centro comercial, **no** el perfil del salón. **No usar ese handle.**

---

## 2. Desarrollo con evidencia

### 2.1. Web oficial existente (hallazgo principal)

Fuente: `https://www.nailslashlasrozas.es/` (HTTP 200, HTML descargado y analizado el 2026-07-15).

| Dato | Valor declarado | Estado |
|---|---|---|
| Nombre | `NAILS LASH STUDIO` | [V] |
| Dirección | `C.C. El Zoco, Av Atenas, 75, Local 41 — 28232 Las Rozas de Madrid, Madrid` | [V] |
| Teléfono | `625 22 33 66` → `href="tel:+34625223366"` | [V] |
| Horario | `Lunes a viernes: 10:00–20:00` · `Sábados: 10:00-14:00` | [V] |
| Antigüedad | `Más de 15 años en el sector estético` (claim de marketing del propio salón) | [V] como *declaración*; [D] como hecho comprobado |

**Servicios declarados en la web oficial** (cita literal, texto desescapado) [V]:
- Uñas: `uñas de gel, manicura rusa, manicura francesa, rellenos y nail art`
- Pestañas: `lifting de pestañas, extensiones pelo a pelo y tinte`
- Cejas: `diseño, tinte y laminado de cejas`
- `Asesoramiento de imagen personalizado`

**Datos ocultos en el JSON-LD `LocalBusiness`** de la home (no visibles para el usuario) [V]:

```json
"streetAddress": "AV.ATENAS 75 LOCAL 41 C.C.ZOCO MONTE ROZAS ",
"postalCode": "28232",
"addressLocality": "Las Ceudas",
"telephone": "+34625223366",
"email": "centroesteticarozas@gmail.com",
"vatID": "10656940"
```

Tres defectos objetivos en ese bloque:
- `addressLocality: "Las Ceudas"` — **localidad errónea**; debería ser `Las Rozas de Madrid` [V, es un error de dato]. Google consume este campo.
- `vatID: "10656940"` — **8 caracteres**. Un NIF/CIF español tiene **9** (letra+8 dígitos u 8 dígitos+letra). Está **malformado o incompleto**; no lo tomo como identidad fiscal válida [V que está malformado; [D] cuál es el NIF real].
- `email: centroesteticarozas@gmail.com` — aparece **solo** en el JSON-LD, **no** se muestra en la web [V]. No sé si es un canal de atención vigente [D].

**Incumplimientos legales verificados de la web actual** [V]:
- El pie enlaza `Aviso Legal` → `https://www.nailslashlasrozas.es/es/aviso-legal` → **HTTP 404 "Page not found"**. No existe aviso legal.
- `https://www.nailslashlasrozas.es/es/confidentiality_ws` (HTTP 200) es una **plantilla genérica de RGPD**: dice literalmente `El responsable del tratamiento de sus datos personales es la persona a cargo del sitio web que utilizó` — es decir, **no identifica a nadie**. Sin razón social, sin NIF, sin domicilio, sin email de contacto.

**Proveedor actual** [V]: el pie enlaza `http://www.topclic.es/` (`- Una creación`) y los assets cargan desde `cdnnen.proxi.tools`. [I] Es un sitio de plantilla hecho por una agencia; el salón probablemente no controla el código.

**Ausencia notable** [V]: he buscado en todo el HTML (51.064 bytes) las cadenas `instagram`, `tiktok` y `whatsapp`: **cero coincidencias**. La web oficial **solo** enlaza a Facebook. Su canal social más activo no está enlazado desde su propia web.

### 2.2. Instagram — @nailslash.studio_ (CONFIRMADO como de este salón)

Fuente: `https://www.instagram.com/nailslash.studio_/` (metadatos Open Graph, consultados el 2026-07-15).

| Campo | Valor literal | Estado |
|---|---|---|
| Handle | `@nailslash.studio_` | [V] |
| Nombre mostrado | `𝑵𝒂𝒊𝒍𝒔𝑳𝒂𝒔𝒉 𝒔𝒕𝒖𝒅𝒊𝒐` (fuente unicode estilizada) | [V] |
| Seguidores / Seguidos / Posts | `877 Followers, 638 Following, 302 Posts` | [V] (a 2026-07-15) |

Biografía, cita literal [V]:

```
📍 • C.C.Zoco. Las Rozas. Madrid
✨ •Manicura Premium | Bases de gel Proteínicas
👩🏻‍💻 • Citas en el enlace o 📲625223366
```

**Prueba de identidad (por qué es ESTE salón y no otro)** [V] — dos coincidencias independientes y no genéricas:
1. La bio declara `C.C.Zoco. Las Rozas. Madrid` → coincide con el `C.C. El Zoco, Av Atenas 75` de la web oficial.
2. La bio declara `625223366` → **coincide dígito a dígito** con el `tel:+34625223366` de la web oficial.

[I] Un tercero con nombre parecido no publicaría el teléfono y el centro comercial exactos del salón. La identificación la considero **firme**.

Dato de negocio útil que solo aparece aquí [V]: `Manicura Premium | Bases de gel Proteínicas` — posicionamiento premium y término técnico ("base proteínica") que el salón usa también en su catálogo de Treatwell.

`Citas en el enlace` [V] implica que hay un enlace en bio, pero **no he podido extraer su destino** [D]: Instagram sirve una shell sin sesión y el campo `external_url` no viene en el HTML público. [I] Probablemente apunta a Treatwell (ver §2.4), pero **no está verificado**.

### 2.3. La ambigüedad del handle: `nail_lash_studio_` — NO usar

La ficha del centro comercial (`https://zocomonterozas.com/comercios/nailslash-studio/`) contiene una **contradicción interna verificada** [V]: el **texto** del enlace dice `nailslash.studio_` pero el **`href` apunta a otro sitio**:

```html
<div dir="auto">Número de contacto 625223366</div>
<div dir="auto">&nbsp;Instagram:
  <a href="https://www.instagram.com/nail_lash_studio_/" target="_blank" rel="noopener">nailslash.studio_</a>
</div>
```

Comprobación directa de la cuenta enlazada [V] — `https://www.instagram.com/nail_lash_studio_/`:

```
og:description => 8 Followers, 71 Following, 0 Posts - See Instagram photos and videos from (@nail_lash_studio_)
```

**Resolución** [V + I]: `nail_lash_studio_` tiene **0 publicaciones y 8 seguidores**, sin nombre ni biografía. Frente a `nailslash.studio_` con **302 publicaciones, 877 seguidores** y una bio que declara la dirección y el teléfono del salón. El handle bueno es **`nailslash.studio_`**; el `href` del centro comercial está **mal** (el texto visible sí es correcto).

[I] Hipótesis no confirmada [D]: `nail_lash_studio_` puede ser una cuenta antigua, abandonada o un intento de reserva de nombre. **Acción recomendada**: preguntar al salón si esa cuenta es suya (si lo es, conviene cerrarla o redirigirla: confunde a clientes y diluye el SEO de marca) y pedir al centro comercial que corrija el enlace.

### 2.4. Reservas: Treatwell (vía enlace del propio salón)

Cadena de evidencia [V]: la ficha del centro comercial dice `Enlace para solicitar cita: pulsa aquí` → `https://www.uala.es/nails-lash-studio_avenida-de-atenas-75-28232-las-rozas-de-madrid` → **HTTP 301** → `https://www.treatwell.es/establecimiento/nails-lash-studio/`.

[I] Como el enlace de reservas lo publica el propio salón en la ficha del centro comercial, esta ficha de Treatwell está **endosada por el negocio** (no es un directorio scrapeado). Es la fuente de mayor calidad después de la web oficial.

JSON-LD `HealthAndBeautyBusiness` de Treatwell, datos literales [V]:

| Campo | Valor |
|---|---|
| `name` | `Nails Lash Studio` |
| `address.streetAddress` | `Av. de Atenas, 75, 28232 Las Rozas de Madrid, Madrid, España` |
| `geo` | `latitude: 40.5179875`, `longitude: -3.9226688` |
| `openingHoursSpecification` | L-V `10:00`–`20:00`; Sáb `10:00`–`14:00`; Domingo **cerrado** |
| `aggregateRating` | `ratingValue: 4.9`, `reviewCount: 1231` |
| Teléfono en página | `625 22 33 66` |

**El horario coincide exactamente con el de la web oficial** [V]. **El teléfono coincide** [V]. Confirma que es el mismo salón.

**Catálogo de servicios y precios** (extraído del JSON-LD de Treatwell) [V *como precio publicado en Treatwell*; **[D] como precio oficial vigente**]:

Categorías: `Manicuras, Extensiones Y Tratamientos` · `Pedicuras Y Tratamientos Pies` (y más).

Muestra de precios literales: `Manicura Spa 20,00 €` · `Manicura Shella S 27,00 €` · `Manicura Semipermanente S 27,00 €` · `Uñas de Gel S 38,00 €` · `Dual Form Gel 65,00 €` (`A partir de 65,00 dependiendo del largo`) · `Decoración Uña 2,00 €` (`Desde 2 €`) · `Nail Art 4,00 €` (`Desde 4 €`) · `Retirar acrílico 15,00 €` · `French Manicura Shella M-L` (`M 33.00 / L 35.00`).

Nomenclatura propia del salón, útil para el modelo de datos [V]: tallas **S / M / L** por longitud de uña, y familias `Shella` (base proteínica), `Semipermanente`, `Uñas de Gel`, `Dual Form`, `Press On / Gel X / Soft Gel`, `Esculpidas / Sándwich`, `Baby boomer`, `ojo de gato`, `efecto carey`, `espejo-perla`.

**Aviso importante sobre estos precios** [D]: son los de **Treatwell**, no necesariamente la tarifa oficial del salón, y pueden estar desactualizados. **No publicarlos sin confirmación escrita del cliente** (§4).

**Falso positivo aclarado** [V]: el `<title>` de Treatwell dice `Nails Lash Studio | Salón de Belleza en Distrito Sur, Comunidad de Madrid`. "Distrito Sur" **no es la ubicación real**: es una etiqueta de la taxonomía de zonas de Treatwell. El `address` del JSON-LD y el mapa (`40.5179875, -3.9226688`) sitúan el salón en Las Rozas. No es otro salón.

### 2.5. Facebook — oficial pero inactivo

Fuente: `https://www.facebook.com/nailslashstudiorozas/` [V].

- Es **oficial**: [I] fuerte, porque es el **único** enlace social que la propia web del salón publica (`href="https://www.facebook.com/nailslashstudiorozas/"` en el HTML de la home) [V]. Un enlace desde el sitio propio es un endoso directo.
- `og:description` literal [V]: `Nails Lash Studio, Las Rozas de Madrid. 13 Me gusta · 1 personas están hablando de esto · 7 personas han estado aquí. Belleza, cosmética y cuidado personal`
- Categoría declarada [V]: `Belleza, cosmética y cuidado personal`.
- La página **no expone** teléfono ni dirección en sus metadatos públicos (0 coincidencias de `625223366`, `Atenas` o `Zoco` en el HTML servido) [V].

[I] Con 13 "Me gusta" frente a 877 seguidores en Instagram, Facebook es un canal residual. Recomendación: enlazarlo en el pie (consistencia de marca), nunca destacarlo.

### 2.6. TikTok — NO VERIFICADO / sin evidencia

[D] **No he encontrado ninguna cuenta de TikTok de este salón.** Búsquedas realizadas devolvieron únicamente:
- `La Rosa Nails Studio` (`tiktok.com/@larosa.nails.art`) — **negocio distinto**, en `361 Main Street E, Milton, ON` (Canadá).
- Páginas de descubrimiento genéricas de TikTok.

Ni la web oficial, ni la bio de Instagram, ni la ficha del centro comercial mencionan TikTok [V: cero coincidencias de `tiktok` en el HTML de la web oficial].

**Conclusión**: tratar TikTok como **inexistente** hasta que el cliente diga lo contrario. **Prohibido** poner un icono de TikTok con un enlace inventado o adivinado.

### 2.7. Fichas de terceros (baja fiabilidad — no usar como fuente)

| Fuente | Qué declara | Fiabilidad |
|---|---|---|
| **Fresha** (`fresha.com/lvp/nails-lash-studio-...-Evk6GW`) | Dirección y horario correctos; teléfono `+34625223366` | **Baja**: la propia página dice que el negocio `is not currently affiliated with or partnered with Fresha` [V] → ficha **scrapeada sin relación comercial**. Solo sirve como corroboración de NAP. |
| **Wonderbox / Cofre Vip / Vivabox** (código `LAR121`) | Fichas de caja regalo del salón | [D] No verificadas en detalle. Son marcas del mismo grupo reutilizando la misma ficha. [I] Implica que el salón **vende cajas regalo**, lo que sería relevante para la web — **pendiente de confirmar con el cliente**. |
| **Zoco MonteRozas** (ficha del comercio) | Catálogo de servicios amplio (incluye `Microblading / Micropigmentación`, `Depilación con hilo`, `Parafina`, `Manicura spa esmalte tradicional`) | **Media-alta** para servicios (redactada por el salón), pero el `href` de Instagram está **mal** (§2.3). ⚠️ Declara servicios que **NO aparecen en la web oficial**. |

**Discrepancia de servicios a resolver** [V]: la ficha del Zoco lista `Microblading / Micropigmentacion`, `Depilación con hilo` y `Parafina`; la web oficial **no los menciona**. [D] No sé si el salón sigue ofreciéndolos. **No publicar estos tres servicios sin confirmación** — la micropigmentación además tiene implicaciones sanitarias y publicitarias específicas.

**Contexto del centro comercial** (no confundir con datos del salón) [V]: `zocomonterozas.com` declara teléfono propio `680 97 75 37`, email `info@zocomonterozas.com` y horario del **centro** `Lunes a Sábado de 08:00 a 22:00, Domingos cerrado`. **Ese teléfono y ese horario NO son los del salón.** (Este es el dato que más fácilmente se copia por error.)

### 2.8. Riesgo de confusión con salones de nombre parecido

Búsqueda de colisiones de nombre realizada [V]. **No he encontrado otro salón llamado exactamente "Nails Lash Studio" en España.** Nombres parecidos pero **distintos** (no confundir):

| Nombre | Handle / URL | Por qué NO es este salón |
|---|---|---|
| Manifique Nail & Lash Studio | `instagram.com/manifique_nail_and_lash_studio` | Marca distinta |
| Nails y Lashes studio | `facebook.com/NailsyLashesstudio` | Marca distinta |
| Nails and Lashes CDMX | `instagram.com/nailsandlashescdmx` | Ciudad de México |
| La Rosa Nails Studio | `tiktok.com/@larosa.nails.art` | Milton, Ontario (Canadá) |
| **Acosta Nails Las Rozas** | `fresha.com/lvp/acosta-nails-las-rozas-...` | **⚠️ Misma calle** (`Avenida de Atenas 75, Local 1`) — es **otro negocio** en el **mismo centro comercial**, local distinto. Nuestro salón es el **Local 41**. |

[I] El riesgo real de confusión no es con otra ciudad, sino con **Acosta Nails**, un competidor en el mismo edificio. El número de local (**41**) es un dato diferenciador que conviene mantener visible en la dirección.

---

## 3. Tabla: lo que NO he podido verificar

| # | Dato | Estado | Qué haría falta para verificarlo |
|---|---|---|---|
| 1 | **TikTok** del salón | [D] Sin evidencia de que exista | Preguntar al cliente. Si no lo confirma, **no poner icono**. |
| 2 | **Razón social y NIF/CIF reales** | [D] El `vatID: "10656940"` de la web actual tiene 8 caracteres (un NIF español tiene 9) → malformado | Documento fiscal del cliente. **Bloqueante para el aviso legal** (art. 10 LSSI-CE). |
| 3 | **Domicilio social** (si difiere del local) | [D] | Datos fiscales del cliente. Necesario para el aviso legal. |
| 4 | **Titularidad del dominio `nailslashlasrozas.es`** | [D] Ni si el cliente controla el DNS/registrador | Preguntar al cliente + WHOIS de `.es` (NIC.es). **Bloqueante** para decidir migración vs. dominio nuevo. |
| 5 | **Qué se hace con la web actual** | [D] ¿Reemplazo con 301? ¿Dominio nuevo? ¿Convivencia? | Decisión explícita del cliente. Condiciona toda la estrategia SEO. |
| 6 | **Destino del enlace en bio de Instagram** | [D] La bio dice `Citas en el enlace` pero Instagram no expone `external_url` sin sesión | Mirar el perfil con sesión iniciada, o preguntar al cliente. |
| 7 | **Precios oficiales vigentes** | [D] Solo tengo los publicados en Treatwell, posiblemente desactualizados | Tarifa oficial firmada por el cliente. **No publicar precios sin esto.** |
| 8 | **Email de contacto vigente** | [D] `centroesteticarozas@gmail.com` solo aparece en el JSON-LD, no en la web visible | Confirmar con el cliente si se atiende. |
| 9 | **Servicios activos**: `Microblading/Micropigmentación`, `Depilación con hilo`, `Parafina` | [D] Aparecen en la ficha del Zoco pero **no** en la web oficial | Confirmar catálogo real con el cliente. |
| 10 | **Venta de cajas regalo** (Wonderbox/Cofre Vip/Vivabox, cód. `LAR121`) | [D] Fichas existen; vigencia no comprobada | Confirmar con el cliente si el acuerdo sigue activo. |
| 11 | **Google Business Profile** | [D] No verificado con fuente oficial | Acceso del cliente al panel de Google Business. Crítico para SEO local. |
| 12 | **Titularidad de `@nail_lash_studio_`** (cuenta vacía) | [D] | Preguntar al cliente si es suya. |
| 13 | **Reseñas 4,9/1.231** | [V] en Treatwell, pero [D] si se pueden **reutilizar** en la web | Condiciones de uso de Treatwell + permiso. Ver §4. |
| 14 | **"Más de 15 años"** | [V] como afirmación del salón; [D] como hecho | Confirmar año de apertura con el cliente. |
| 15 | **Nombre de la propietaria / equipo** | [D] Ninguna fuente lo declara | Preguntar al cliente. |
| 16 | **Horario en festivos / agosto** | [D] Ninguna fuente lo cubre | Preguntar al cliente. |

---

## 4. Impacto en el proyecto

### 4.1. Lo que este hallazgo EXIGE

1. **Tratar el proyecto como una migración, no como un sitio nuevo** [V: la web existe]. Exige decisión del cliente sobre `nailslashlasrozas.es` (ítem 4-5 de §3) **antes** de definir arquitectura de URLs. Es una **entrada bloqueante de spec**.
2. **Aviso legal real y accesible** — la web actual lo tiene **roto (404)** [V]. La nueva debe identificar titular, NIF, domicilio y contacto (art. 10 Ley 34/2002 LSSI-CE). **Bloqueado** por el ítem 2 de §3: sin NIF del cliente, no se puede redactar. *No he verificado el texto del articulado en el BOE en esta investigación; antes de redactar el aviso legal hay que contrastarlo con la fuente oficial (`boe.es`).*
3. **Política de privacidad que identifique al responsable del tratamiento** — la actual dice literalmente `la persona a cargo del sitio web`, que no identifica a nadie [V] (art. 13 RGPD). Mismo bloqueo.
4. **NAP canónico y único**, exactamente:
   - Nombre: `Nails Lash Studio`
   - Dirección: `C.C. Zoco Monte Rozas, Av. de Atenas 75, Local 41, 28232 Las Rozas de Madrid`
   - Teléfono: `625 22 33 66` (`tel:+34625223366`)
   - Horario: L-V 10:00–20:00 · Sáb 10:00–14:00 · Dom cerrado
   Los cuatro campos están **verificados y son consistentes** en web oficial + Treatwell (+ teléfono en Instagram y Zoco) [V].
5. **JSON-LD `LocalBusiness` correcto**, corrigiendo los errores heredados [V]: `addressLocality` debe ser `Las Rozas de Madrid` (**no** `Las Ceudas`) y el `vatID` debe llevar un NIF válido de 9 caracteres o **omitirse**. Copiar el JSON-LD actual propagaría los bugs.
6. **Enlazar Instagram desde la web** — hoy la web **no lo enlaza** pese a ser el canal con 877 seguidores [V]. Corregir es una victoria inmediata y barata.

### 4.2. Lo que este hallazgo PROHÍBE

- ❌ **Inventar o adivinar un TikTok** [D].
- ❌ **Usar el handle `nail_lash_studio_`** — cuenta vacía, 0 posts [V]. El handle correcto es **`nailslash.studio_`**.
- ❌ **Publicar precios** tomados de Treatwell sin confirmación escrita [D, ítem 7].
- ❌ **Publicar `Microblading`, `Depilación con hilo` o `Parafina`** sin confirmar que se siguen prestando [D, ítem 9].
- ❌ **Usar el teléfono `680 97 75 37` ni el horario `08:00–22:00`**: son **del centro comercial**, no del salón [V]. Error fácil de cometer al leer la ficha del Zoco.
- ❌ **Mostrar "4,9 ⭐ (1.231 reseñas)"** sin resolver derechos de uso y atribución a Treatwell [D, ítem 13]. Mostrar reseñas de terceros como propias sin atribución puede constituir práctica engañosa.
- ❌ **Publicar `centroesteticarozas@gmail.com`** sin confirmar que se atiende [D, ítem 8]. Está en el código de la web actual pero oculto al usuario; publicarlo cambia su exposición (y su carga de spam).
- ❌ **Copiar el JSON-LD de la web actual** — arrastra `Las Ceudas` y un `vatID` malformado [V].

### 4.3. Features que implica

| Feature | Justificación (fuente) | Prioridad |
|---|---|---|
| **Datos de negocio centralizados** (un solo módulo/JSON con NAP; nada hardcodeado en plantillas) | Cuatro plataformas ya divergen; hay que evitar la quinta versión | Alta |
| **`LocalBusiness` JSON-LD validado** con `geo: 40.5179875, -3.9226688` [V Treatwell] y `openingHoursSpecification` | Corrige los bugs de §4.1.5 | Alta |
| **Click-to-call** `tel:+34625223366` prominente en móvil | Teléfono verificado x4; el salón dirige citas al teléfono (`Citas en el enlace o 📲625223366`) [V] | Alta |
| **CTA de reserva → Treatwell** | El propio salón usa ese flujo [V §2.4]. Confirmar destino del enlace de bio (ítem 6) | Alta |
| **Aviso legal + política de privacidad + política de cookies** | Obligación legal; la actual está rota [V] | Alta (bloqueada por NIF) |
| **Enlaces sociales: Instagram + Facebook, TikTok NO** | Estado verificado de cada canal | Alta |
| **Catálogo de servicios con taxonomía S/M/L y familias del salón** (`Shella`, `Semipermanente`, `Gel`, `Dual Form`, `Press On/Gel X/Soft Gel`) | Nomenclatura real del negocio [V Treatwell] | Media |
| **Precios opcionales por servicio** (el modelo debe permitir ocultarlos y soportar "desde X €") | Muchos precios son `Desde`/`A partir de` [V]; y no están confirmados | Media |
| **Sección de cajas regalo** | Solo si se confirma el ítem 10 | Baja / condicional |
| **Ficha con `Local 41` visible** | Diferenciación frente a Acosta Nails, mismo edificio [V §2.8] | Media |
| **Plan de redirecciones 301** desde la web actual | Preserva el SEO existente | Alta (bloqueada por ítem 4-5) |

### 4.4. Preguntas para el cliente (bloqueantes, priorizadas)

1. **NIF/CIF y razón social** → sin esto no hay aviso legal ni RGPD → **no se puede publicar legalmente**.
2. **¿Controláis `nailslashlasrozas.es`?** ¿Reemplazamos con 301, o dominio nuevo?
3. **Tarifa oficial vigente** (¿publicamos precios, sí o no?).
4. **¿Existe TikTok?** ¿Es vuestra la cuenta `@nail_lash_studio_` (vacía)?
5. **¿Seguís ofreciendo micropigmentación, depilación con hilo y parafina?**
6. **¿Qué email atendéis?** ¿`centroesteticarozas@gmail.com`?
7. **¿Reservas por Treatwell, por teléfono, o ambas?** ¿A dónde apunta el enlace de la bio de Instagram?
8. **¿Tenéis acceso al Google Business Profile?**
9. **¿Cajas regalo (Wonderbox/Cofre Vip) siguen activas?**
10. **Horario en festivos y agosto.**

---

## 5. Fuentes consultadas

| Fuente | URL | Uso |
|---|---|---|
| Web oficial (home, HTML crudo) | `https://www.nailslashlasrozas.es/` | NAP, servicios, JSON-LD, enlaces sociales |
| Web oficial (aviso legal) | `https://www.nailslashlasrozas.es/es/aviso-legal` | **HTTP 404** |
| Web oficial (privacidad) | `https://www.nailslashlasrozas.es/es/confidentiality_ws` | Boilerplate sin responsable |
| Instagram (perfil activo) | `https://www.instagram.com/nailslash.studio_/` | Handle, bio, métricas |
| Instagram (cuenta vacía) | `https://www.instagram.com/nail_lash_studio_/` | Descarte |
| Facebook | `https://www.facebook.com/nailslashstudiorozas/` | Página oficial inactiva |
| Zoco Monte Rozas (ficha) | `https://zocomonterozas.com/comercios/nailslash-studio/` | Servicios, enlace de reservas, href erróneo |
| Treatwell (ficha endosada) | `https://www.treatwell.es/establecimiento/nails-lash-studio/` | JSON-LD, precios, horario, geo, rating |
| Uala (redirige a Treatwell) | `https://www.uala.es/nails-lash-studio_avenida-de-atenas-75-28232-las-rozas-de-madrid` | Cadena de reservas (301) |
| Fresha (no afiliada) | `https://www.fresha.com/lvp/nails-lash-studio-avenida-de-atenas-las-rozas-de-madrid-Evk6GW` | Corroboración NAP |
| Fresha (competidor) | `https://www.fresha.com/lvp/acosta-nails-las-rozas-las-rozas-de-madrid-jbqZLA` | Riesgo de confusión (Local 1) |

**Nota metodológica**: la web oficial, el Zoco, Instagram, Facebook y Treatwell se descargaron en crudo (`curl`) y se analizaron sobre el HTML/JSON-LD, no sobre resúmenes de buscador. Las métricas de Instagram y el rating de Treatwell son **instantáneas del 2026-07-15** y cambiarán.
