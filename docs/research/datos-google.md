# Datos reales del negocio — Ficha de Google (Google Business Profile / Maps)

> **Área de investigación:** Datos reales del negocio en Google Maps / Google Business Profile (GBP).
> **Fecha de consulta:** 15 de julio de 2026.
> **Método:** lectura directa de la ficha de Google Maps con navegador real (el `fetch` plano
> de Google Maps redirige a `consent.google.com` y no devuelve datos), más contraste con
> Treatwell, Fresha, la web actual del salón y el directorio del centro comercial.
> **Regla aplicada:** todo dato lleva fuente. Lo no verificado se marca **NO VERIFICADO**.

---

## 1. Respuesta ejecutiva

**Qué hacemos.** Tomamos la **ficha de Google Business Profile como fuente canónica del NAP**
(Nombre, Dirección, Teléfono) y del horario del salón. Está reclamada y activa por el
propietario, y coincide exactamente con Treatwell en horario y con la web actual en teléfono.

**Por qué.** Es el único origen donde los tres datos aparecen juntos, completos (incluye
`Local 41` y `Piso 0`, que Treatwell omite) y mantenidos por el negocio (hay publicaciones del
propietario fechadas el 6 jun 2026 y respuestas del propietario a reseñas).

**Los cuatro hallazgos que condicionan el proyecto:**

1. **El campo "sitio web" del GBP NO apunta a la web del salón**, sino a Instagram
   (`instagram.com/nailslash.studio_/reels/`). La web existente (`nailslashlasrozas.es`,
   creada por la agencia Proximedia) **no está enlazada desde Google**. Publicar la web nueva
   exige actualizar ese campo, o el SEO local no se capitaliza.
2. **Las notas de Google y Treatwell NO son la misma cifra y no se pueden mezclar**:
   Google = **4,9 con 226 reseñas**; Treatwell = **4,9 con 1231 opiniones**. Coincide la media,
   no el volumen. Son plataformas distintas: ni sumar (≠1457) ni promediar.
3. **Falta la razón social y el CIF/NIF** en toda fuente pública consultada. Es **bloqueante
   legal**: sin ese dato no se puede redactar un aviso legal conforme a LSSI-CE. Hay que
   pedírselo al cliente.
4. **El canal de reserva real es Treatwell**, no Fresha. La propia Fresha declara en su página
   que el negocio *"is not currently affiliated with or partnered with Fresha"*. No enlazar Fresha.

**Restricción técnica dura:** la documentación oficial de Google prohíbe marcar con datos
estructurados valoraciones traídas de otros sitios (*"Don't aggregate reviews or ratings from
other websites"*). El "4,9" se puede **mostrar como texto**, pero **no** emitirse como
`aggregateRating`. Ver §5.

---

## 2. Ficha de Google Business Profile — datos verificados

**Fuente única de esta tabla:** ficha de Google Maps del negocio, leída el 15/07/2026 en
`https://www.google.com/maps/place/Nails+Lash+Studio/@40.5179875,-3.9226688,17z/data=!3m1!4b1!4m6!3m5!1s0xd419da0d11b02b3:0x71ef6da9667ea235!8m2!3d40.5179875!4d-3.9226688!16s%2Fg%2F11sz2y68zd`

| Campo | Valor exacto en Google | Confianza |
| --- | --- | --- |
| **Nombre exacto** | `Nails Lash Studio` | Verificado |
| **Categoría** | `Centro de estética` | Verificado |
| **Dirección** | `C.C. El Zoco, Av. de Atenas, 75, Loc 41, 28232 Las Rozas de Madrid, Madrid` | Verificado |
| **Ubicación interior** | `Piso 0 · Centro Comercial Zoco Monterozas` | Verificado |
| **Teléfono (público)** | `625 22 33 66` (enlace `tel:625223366`) | Verificado |
| **Horario L–V** | `De 10:00 a 20:00` | Verificado |
| **Horario Sábado** | `De 10:00 a 14:00` | Verificado |
| **Domingo** | `Cerrado` | Verificado |
| **Nota media** | `4,9` | Verificado |
| **Nº de reseñas** | `226 reseñas` | Verificado |
| **Sitio web declarado** | `https://www.instagram.com/nailslash.studio_/reels/` (Google lo etiqueta `Sitio web: instagram.com`) | Verificado |
| **Enlace "Servicios" / "Reservar en línea"** | `https://www.treatwell.es/establecimiento/nails-lash-studio/` | Verificado |
| **Plus Code** | `G39G+5W Las Rozas de Madrid` | Verificado |
| **Coordenadas** | `40.5179875, -3.9226688` | Verificado |
| **CID (hex : decimal)** | `0x71ef6da9667ea235` : `8209901220056179253` | Verificado (hex leído de la URL; decimal calculado) |
| **Feature ID / mid** | `/g/11sz2y68zd` | Verificado |
| **Atributo declarado** | `Se identifica como de propietarias mujeres` | Verificado |

### 2.1 Desglose de reseñas (Google) — cuadra internamente

| Estrellas | Reseñas |
| --- | --- |
| 5 ★ | 217 |
| 4 ★ | 1 |
| 3 ★ | 3 |
| 2 ★ | 1 |
| 1 ★ | 4 |
| **Total** | **226** |

**Comprobación propia (inferencia aritmética, no dato de Google):** 217+1+3+1+4 = 226 ✔ y la
media ponderada (217·5 + 1·4 + 3·3 + 1·2 + 4·1) / 226 = 1104/226 = **4,885 → 4,9** ✔.
La ficha es internamente coherente; el "4,9" no es un número suelto.

### 2.2 Señales de que la ficha está reclamada y gestionada

- Sección `Del propietario` con publicación local fechada **`6 jun 2026`**.
- `Respuesta del propietario` visible en al menos una reseña (fechada "Hace un mes").
- Aviso del propio Google en la ficha: `Las reseñas no se verifican`.

**Clasificación:** los tres elementos son **hechos verificados**; la conclusión "el GBP está
reclamado y alguien lo gestiona activamente" es una **inferencia** (fuerte) a partir de ellos.
Solo el cliente puede confirmar quién tiene el acceso.

---

## 3. Contraste con Treatwell y otras fuentes

### 3.1 Treatwell — verificado
Fuente: `https://www.treatwell.es/establecimiento/nails-lash-studio/` (leída 15/07/2026).

| Campo | Valor en Treatwell |
| --- | --- |
| Nombre | `Nails Lash Studio` |
| Dirección | `Av. de Atenas, 75, 28232 Las Rozas de Madrid, Madrid, España` (**sin** local ni C.C.) |
| Nota media | `4,9` |
| Nº de opiniones | `1231 opiniones` |
| Horario | L–V `10:00–20:00`, Sáb `10:00–14:00`, Dom `Cerrado` (idéntico a Google) |
| Teléfono | **No lo publica** |
| Equipo listado | Lady, Johana, Sandra, Katerine, Irene, Camila, Zaira |
| Marcas declaradas | `Neonail y Indigo Nails` |
| Transporte | `A un paseo a pie de la estación de tren Pinar de Las Rozas` |
| Pie legal | `© 2026 Treatwell Spain S.L` |

**Dominio antiguo:** `https://www.uala.es/nails-lash-studio_avenida-de-atenas-75-28232-las-rozas-de-madrid`
responde **301 Moved Permanently** → `https://www.treatwell.es/establecimiento/nails-lash-studio`.
Es el mismo negocio; Uala es el dominio heredado. Verificado por la redirección.

**Precios publicados en Treatwell (verificados en esa página, 15/07/2026):** Manicura Spa 20 €;
Manicura Semipermanente S/M/L 27/29/31 €; Manicura Shella S/M/L 27/29/31 €; Mantenimiento Uñas
de Gel S/M/L 36/42/48 €; Dual Form Gel 65 €; Relleno Dual Form 40 €; Uñas de gel (Press On /
Gel X / Soft Gel) S/M/L 38/40/45 €; Uñas de Gel (Esculpidas / Dual Form / Sándwich) S/M/L
52/64/74 €; Nail Art 4 €; Decoración elaborada 15 €; Retirar Gel 10 €; Retirar acrílico 15 €;
Limar y esmaltar tradicional manos 15 €.
⚠️ **Son los precios de Treatwell, no necesariamente la tarifa oficial del salón.** No publicarlos
en la web sin confirmación del cliente (ver §4).

### 3.2 Web actual del salón — verificado
Fuente: `https://www.nailslashlasrozas.es/`

- Nombre en la web: `NAILS LASH STUDIO`.
- Dirección: `C.C. El Zoco, Av Atenas, 75, Local 41, 28232 Las Rozas de Madrid` (coincide con Google).
- Teléfono: `+34 625 22 33 66` (coincide con Google).
- Horario: `Lunes a viernes: 10:00–20:00` / `Sábados: 10:00-14:00` (coincide con Google).
- Autoría en el pie: `Una creación [Proximedia]` enlazando a `http://www.topclic.es/`.
- Enlace social presente: Facebook `https://www.facebook.com/nailslashstudiorozas/`.
- **No** publica CIF ni razón social.
- `https://www.nailslashlasrozas.es/es/aviso-legal` → **HTTP 404** (el enlace del pie apunta a
  esa ruta pero no resuelve). *Hecho verificado; su interpretación legal queda en §5.*
- Afirmación de marketing en la web: el centro lleva `más de 15 años` ofreciendo tratamientos.
  **No contrastable** con fuente independiente → tratar como claim del cliente, no como hecho.

### 3.3 Fresha — listado NO afiliado (verificado)
Fuente: `https://www.fresha.com/lvp/nails-lash-studio-avenida-de-atenas-las-rozas-de-madrid-Evk6GW`

Texto literal de la propia Fresha en la ficha:
> "This page uses publicly available information to help people discover this venue. The business
> is not currently affiliated with or partnered with Fresha, get in touch with us to update the information."

Dirección y horario coinciden con Google. **No muestra nota media ni reseñas.** Es un listado
generado por agregación, no un canal del negocio.

### 3.4 Directorio del centro comercial — datos divergentes
Fuente: `https://zocomonterozas.com/comercios/nailslash-studio/`

- Nombre: `Nailslash Studio` (grafía distinta).
- Teléfono: `625223366` (coincide).
- Horario: `Lunes a Sábado de 08:00 a 22:00` / Domingos cerrado → **contradice** a Google, Treatwell,
  Fresha y a la propia web del salón. **Inferencia:** es el horario del centro comercial replicado
  en todas las fichas del directorio, no el del salón. No usar.
- Instagram: `@nail_lash_studio_` → **distinto** del declarado en Google (ver §3.5).
- Reservas: enlaza a `uala.es` (dominio antiguo que redirige a Treatwell).

### 3.5 Instagram — dos handles en circulación

| Handle | Origen | Estado |
| --- | --- | --- |
| `@nailslash.studio_` | **Declarado en el GBP** como sitio web | **Existe.** Título de la página: `𝑵𝒂𝒊𝒍𝒔𝑳𝒂𝒔𝒉 𝒔𝒕𝒖𝒅𝒊𝒐 (@nailslash.studio_) • Fotos y vídeos de Instagram` |
| `@nail_lash_studio_` | Directorio Zoco MonteRozas | **NO VERIFICADO.** La URL responde, pero el título sale sin nombre de perfil: `(@nail_lash_studio_) • Fotos y vídeos de Instagram`. No he podido confirmar que sea del salón ni que esté activo. |

Instagram exige login para el contenido del perfil: **no he podido verificar** biografía,
seguidores ni enlace de reservas de ninguno de los dos. El handle a usar es
`@nailslash.studio_` **por ser el que el propio negocio declara en su GBP** (inferencia razonada),
pendiente de confirmación del cliente.

### 3.6 Tabla de discrepancias

| # | Campo | Google (canónico) | Otra fuente | Lectura |
| --- | --- | --- | --- | --- |
| 1 | Nº reseñas | `226` | Treatwell `1231` | **No es contradicción**: plataformas distintas. Prohibido sumar o promediar. |
| 2 | Nota media | `4,9` | Treatwell `4,9` | Coinciden. Refuerza el claim de calidad. |
| 3 | Sitio web declarado | Instagram | Existe `nailslashlasrozas.es` no enlazada | **Acción**: actualizar GBP al publicar. |
| 4 | Dirección | Incluye `C.C. El Zoco` + `Loc 41` | Treatwell solo `Av. de Atenas, 75` | Usar la de Google (más completa). |
| 5 | Horario | L–V 10–20 / S 10–14 | Zoco `L–S 08:00–22:00` | Zoco = horario del centro comercial (inferencia). Ignorar. |
| 6 | Instagram | `@nailslash.studio_` | Zoco `@nail_lash_studio_` | Confirmar con cliente. |
| 7 | Canal de reserva | Treatwell | Fresha (no afiliado) | Enlazar solo Treatwell. |
| 8 | Grafía del nombre | `Nails Lash Studio` | `NAILS LASH STUDIO` (web), `Nailslash Studio` (Zoco), `NailsLash studio` (IG), `NAIL LASH STUDIO` (Wonderbox) | Estandarizar en `Nails Lash Studio`. |

**Nota sobre una inconsistencia interna de Treatwell:** su filtro por popularidad muestra
`980 / 27 / 6 / 0 / 1` (suma **1014**), que no cuadra con las `1231 opiniones` anunciadas.
**No sé** a qué responde la diferencia (probablemente opiniones sin texto o sin desglose). Es un
motivo más para **no** usar la cifra de Treatwell como dato duro en la web.

### 3.7 Ojo: otro salón en la misma dirección
`Acosta Nails Las Rozas` figura en `Avenida de Atenas 75, Local 1` (Fresha) y en Google con
`4,4 · 154 reseñas`. **Es un negocio distinto** en el mismo centro comercial. No confundir fichas
ni reseñas. El `Local 41` es lo que desambigua.

---

## 4. Lo que NO he podido verificar

| # | Dato ausente | Por qué importa | Qué haría falta |
| --- | --- | --- | --- |
| 1 | **Razón social y CIF/NIF** | **Bloqueante legal.** Sin ellos no hay aviso legal válido (LSSI-CE art. 10). | Preguntar al cliente. Alternativa: nota simple / consulta al Registro Mercantil. |
| 2 | **Domicilio social** (si difiere del local) | Aviso legal. | Cliente / Registro. |
| 3 | **Email de contacto** | LSSI-CE exige medio de contacto directo; ninguna fuente publica email. | Cliente. |
| 4 | **Titularidad y acceso al GBP** | Sin acceso no se puede cambiar el campo "sitio web" ni sale el SEO local. | Cliente. Verificable en `business.google.com`. |
| 5 | **Control del dominio `nailslashlasrozas.es`** | Decide si migramos, redirigimos 301 o usamos dominio nuevo. Lo creó Proximedia/topclic.es. | Cliente + WHOIS `.es` (NIC.es). |
| 6 | **Continuidad de Treatwell** | Define si la web enlaza reservas o integra otro sistema. | Cliente. |
| 7 | **Tarifa oficial del salón** | Los precios de §3.1 son de Treatwell; publicarlos sin confirmar es riesgo de precio incorrecto. | Cliente (lista de precios oficial). |
| 8 | **Instagram correcto y su bio/enlace** | Login wall. | Cliente. |
| 9 | **Datos de la página de Facebook** | La respuesta vino truncada; no pude leer horario/valoración. | Nueva lectura con navegador autenticado / cliente. |
| 10 | **Festivos y cierres vacacionales** | El horario semanal no cubre agosto/festivos. | Cliente. |
| 11 | **Nº real de empleadas y sus nombres/roles** | Treatwell lista 7 (Zaira sin datos); no es plantilla oficial. | Cliente. |
| 12 | **"Más de 15 años"** | Claim de marketing de la web; sin fuente independiente. | Cliente / fecha de constitución en Registro. |
| 13 | **Si el salón quiere mostrar el "4,9"** | Decisión de negocio + implicaciones de §5. | Cliente. |

---

## 5. Impacto en el proyecto

### 5.1 Lo que EXIGE

- **NAP idéntico al GBP, carácter a carácter**, en web, pie y datos estructurados:
  - Nombre: `Nails Lash Studio`
  - Dirección: `C.C. El Zoco, Av. de Atenas, 75, Local 41, 28232 Las Rozas de Madrid, Madrid`
  - Teléfono: `625 22 33 66` → `tel:+34625223366`
  - La inconsistencia NAP entre fuentes es el riesgo #1 de SEO local aquí (hay 4 grafías del
    nombre y un horario contradictorio circulando).
- **Horario canónico**: L–V 10:00–20:00, Sáb 10:00–14:00, Dom cerrado. Modelado como dato, no
  hardcodeado en copy, porque tendrá excepciones (festivos, §4.10).
- **Aviso legal conforme** → requiere §4.1–4.3. **Puerta bloqueante antes de publicar.**
- **Actualizar el campo "sitio web" del GBP** al nuevo dominio en el momento del lanzamiento.
  Hoy apunta a Instagram: la web nueva nacería invisible desde Google Maps.
- **Enlace de reserva a Treatwell** (`https://www.treatwell.es/establecimiento/nails-lash-studio/`),
  que es lo que el propio GBP usa como "Reservar en línea".
- **Geo exacta** para el mapa: `40.5179875, -3.9226688`; mencionar `Planta 0, Local 41` y el
  Centro Comercial Zoco Monterozas (el usuario tiene que encontrar el local dentro del centro).

### 5.2 Lo que PROHÍBE

- ❌ **Emitir `aggregateRating` con el 4,9 de Google o de Treatwell.** Documentación oficial de
  Google (Review snippet): *"Don't aggregate reviews or ratings from other websites."* Además,
  *"If the entity that's being reviewed controls the reviews about itself, their pages that use
  `LocalBusiness` or any other type of `Organization` structured data are ineligible for star
  review feature"*, y *"Ratings must be sourced directly from users"*.
  → El `LocalBusiness`/`BeautySalon` se marca **sin** `aggregateRating`. Mostrar "4,9 en Google"
  como **texto visible con atribución y enlace** es otra cosa y sí es viable.
- ❌ **Mezclar las dos notas** ("4,9 sobre 1457 reseñas" sería falso).
- ❌ **Enlazar Fresha** (no afiliado, por declaración de la propia Fresha).
- ❌ **Publicar el horario 08:00–22:00** del directorio del centro comercial.
- ❌ **Publicar los precios de Treatwell como tarifa oficial** sin confirmación (§4.7).
- ❌ **Inventar email, CIF o razón social** para "rellenar" el aviso legal.
- ❌ Reproducir textos de reseñas de Google/Treatwell en la web: son contenido de terceros con
  autoría y datos personales. Si se quieren testimonios, hay que decidirlo con el cliente
  (**NO VERIFICADO** el encaje concreto con los ToS de cada plataforma: revisar antes de implementar).

### 5.3 Features que implica

| Feature candidata | Datos que consume | Estado del dato |
| --- | --- | --- |
| `datos_negocio` (fuente única NAP + horario) | §2 | ✅ Verificado |
| `schema_local_business` (sin `aggregateRating`) | §2 + geo | ✅ Verificado |
| `bloque_horario` (con excepciones/festivos) | §2 + §4.10 | ⚠️ Parcial |
| `cta_reserva_treatwell` | §3.1 | ✅ Verificado |
| `contacto_telefono` (`tel:`) | §2 | ✅ Verificado |
| `mapa_como_llegar` (planta 0, local 41) | §2 | ✅ Verificado |
| `prueba_social_google` (texto "4,9 · 226 reseñas" + enlace) | §2 | ✅ Verificado (dato) / ⚠️ decisión de negocio |
| `aviso_legal` | §4.1–4.3 | ❌ **Bloqueado** |
| `enlaces_sociales` | §3.5 | ⚠️ Handle a confirmar |
| `tarifas` | §3.1 | ⚠️ A confirmar con cliente |

### 5.4 Acciones inmediatas recomendadas

1. **Pedir al cliente (bloqueante):** razón social, CIF, domicilio social, email de contacto.
2. **Pedir al cliente:** acceso al GBP, control del dominio, Instagram correcto, tarifa oficial,
   festivos, y si Treatwell continúa.
3. **Congelar** los datos de §2 como fuente única en el código (un solo módulo/JSON), para que el
   NAP no se duplique ni derive.
4. **Al publicar:** actualizar el campo "sitio web" del GBP y decidir el destino de
   `nailslashlasrozas.es` (301 al nuevo dominio si el cliente lo controla).

---

## 6. Fuentes consultadas

| Fuente | URL | Uso |
| --- | --- | --- |
| Google Maps / GBP | `https://www.google.com/maps/place/Nails+Lash+Studio/@40.5179875,-3.9226688,17z/data=!4m6!3m5!1s0xd419da0d11b02b3:0x71ef6da9667ea235!8m2!3d40.5179875!4d-3.9226688!16s%2Fg%2F11sz2y68zd` | Ficha canónica (§2) |
| Treatwell | `https://www.treatwell.es/establecimiento/nails-lash-studio/` | Contraste, precios, equipo (§3.1) |
| Uala (301 → Treatwell) | `https://www.uala.es/nails-lash-studio_avenida-de-atenas-75-28232-las-rozas-de-madrid` | Dominio heredado (§3.1) |
| Web actual del salón | `https://www.nailslashlasrozas.es/` | Autoría Proximedia, 404 aviso legal (§3.2) |
| Fresha | `https://www.fresha.com/lvp/nails-lash-studio-avenida-de-atenas-las-rozas-de-madrid-Evk6GW` | Declaración de no afiliación (§3.3) |
| Zoco MonteRozas | `https://zocomonterozas.com/comercios/nailslash-studio/` | Horario divergente, IG alternativo (§3.4) |
| Instagram | `https://www.instagram.com/nailslash.studio_/` y `https://www.instagram.com/nail_lash_studio_/` | Handles (§3.5) |
| Facebook | `https://www.facebook.com/nailslashstudiorozas/` | Enlazada desde la web; **contenido no leído** |
| Google Search Central — Review snippet | `https://developers.google.com/search/docs/appearance/structured-data/review-snippet` | Prohibición de agregar ratings de terceros (§5.2) |
| Google Maps — aviso de reseñas | `https://support.google.com/local-guides?p=maps_policies` | "Las reseñas no se verifican" (§2.2) |

---

## 7. Nota de método

- La ficha de Google **no es accesible por `fetch` plano**: `https://www.google.com/maps/search/...`
  devuelve **302** a `consent.google.com`. Los datos de §2 se obtuvieron leyendo el árbol de
  accesibilidad de la página ya renderizada en un navegador real. Quien quiera reproducirlo debe
  hacer lo mismo; un `curl` no sirve.
- Los valores de §2 son **transcripción literal** de la interfaz de Google en español
  (de ahí `4,9` con coma y `Loc 41` abreviado).
- El CID decimal (`8209901220056179253`) es **cálculo propio** a partir del hex `0x71ef6da9667ea235`
  leído en la URL: es una conversión determinista, no un dato publicado por Google.
- Todo dato de negocio (precios, plantilla, años de actividad) procede de **plataformas de terceros
  o del marketing del propio salón**, nunca de una fuente registral. Antes de publicarlo en una web
  real, lo confirma el cliente.
