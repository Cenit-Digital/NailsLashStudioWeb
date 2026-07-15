# Datos reales del negocio — Ficha de Treatwell

**Fecha de consulta:** 2026-07-15
**Fuente primaria:** https://www.treatwell.es/establecimiento/nails-lash-studio/
**Autor:** subagente de investigación (área: datos reales del negocio)

---

## 1. Respuesta ejecutiva

He localizado y leído la ficha real del salón en Treatwell. **Existe y es la correcta**: nombre, dirección (Av. de Atenas, 75, 28232 Las Rozas de Madrid) y categoría coinciden con el encargo.

Qué hacemos y por qué:

1. **Tomamos Treatwell como fuente de datos de partida, NO como fuente de verdad definitiva.** Los datos están verificados contra la propia web de Treatwell, pero Treatwell es un catálogo gestionado por el salón que puede estar desactualizado o incompleto (de hecho, lo está: ver punto 3). Antes de publicar precios en una web real hay que **confirmarlos con la dueña del negocio**.
2. **He recuperado 39 de los 43 servicios** del catálogo. Los 4 restantes (pedicura) no son accesibles sin ejecutar JavaScript en la página; quedan marcados como NO VERIFICADO. **No los he inventado.**
3. **Hallazgo relevante: Treatwell NO vende servicios de pestañas** en esta ficha, pese a que el salón se llama "Nails **Lash** Studio" y su propia web sí anuncia extensiones y lifting de pestañas. Esto condiciona el catálogo de la web (ver punto 4).
4. **La nota media (4.9) y el nº de opiniones (1231) están verificados por triple fuente**, pero son un dato **vivo**: cambiarán. No deben hardcodearse.

> **Caveat metodológico honesto:** la extracción se ha hecho con `WebFetch`, que convierte la página y la resume con un modelo pequeño. Eso introduce riesgo de error de transcripción. Lo he mitigado **contrastando cada dato crítico contra URLs distintas e independientes de Treatwell** (ficha ES, ficha EN, y páginas de listado por tratamiento). Los datos que coinciden entre fuentes independientes se marcan "verificado"; los que provienen de una sola lectura se marcan como tal. **Aun así, antes de publicar precios de cara al consumidor, recomiendo una revisión humana visual de la ficha.**

---

## 2. Desarrollo con evidencia

### 2.1 Identidad y localización

| Campo | Valor literal | Fuente | Confianza |
|---|---|---|---|
| Nombre (Treatwell) | `Nails Lash Studio` | [Ficha ES](https://www.treatwell.es/establecimiento/nails-lash-studio/) + [Ficha EN](https://www.treatwell.es/en/place/nails-lash-studio/) | Verificado (2 fuentes) |
| Nombre (web propia) | `NAILS LASH STUDIO` | https://www.nailslashlasrozas.es/ | Verificado |
| Dirección (Treatwell) | `Av. de Atenas, 75, 28232 Las Rozas de Madrid, Madrid, España` | [Ficha ES](https://www.treatwell.es/establecimiento/nails-lash-studio/) + [Ficha EN](https://www.treatwell.es/en/place/nails-lash-studio/) | Verificado (2 fuentes) |
| Dirección (web propia, más específica) | `C.C. El Zoco, Av Atenas, 75, Local 41, 28232 Las Rozas de Madrid, Madrid` | https://www.nailslashlasrozas.es/ | Verificado |
| Zona (Treatwell) | `Distrito Sur, Comunidad de Madrid` | [Listado uñas Las Rozas](https://www.treatwell.es/establecimientos/servicios-grupo-unas/oferta-tipo-local/en-las-rozas-es/) | Verificado |
| Teléfono | `625 22 33 66` | https://www.nailslashlasrozas.es/ | Verificado **en la web propia, NO en Treatwell** |
| Email | — | — | **NO VERIFICADO** (no aparece en ninguna fuente leída) |

**Discrepancia detectada (no es contradicción):** Treatwell da la dirección **incompleta** — omite `C.C. El Zoco` y `Local 41`. La web propia es más precisa. *(Inferencia mía: para la web nueva conviene usar la versión completa de la web propia, porque el local está dentro de un centro comercial y sin "Local 41" el cliente no lo encuentra. **A confirmar con el negocio.**)*

### 2.2 Horario

Verificado por **dos fuentes independientes** ([Ficha ES](https://www.treatwell.es/establecimiento/nails-lash-studio/) y [Ficha EN](https://www.treatwell.es/en/place/nails-lash-studio/)):

| Día | Horario |
|---|---|
| Lunes | 10:00–20:00 |
| Martes | 10:00–20:00 |
| Miércoles | 10:00–20:00 |
| Jueves | 10:00–20:00 |
| Viernes | 10:00–20:00 |
| Sábado | 10:00–14:00 |
| Domingo | Cerrado |

**Corroboración cruzada:** la web propia (https://www.nailslashlasrozas.es/) indica `Monday to Friday: 10:00–20:00` y `Saturday: 10:00–14:00` — **coincide**. La web propia no declara explícitamente el domingo; el "Cerrado" del domingo viene solo de Treatwell (verificado en 2 URLs de Treatwell).

### 2.3 Reputación

| Campo | Valor | Fuentes |
|---|---|---|
| Nota media | `4,9` | [Ficha ES](https://www.treatwell.es/establecimiento/nails-lash-studio/), [Ficha EN](https://www.treatwell.es/en/place/nails-lash-studio/), [Listado uñas Las Rozas](https://www.treatwell.es/establecimientos/servicios-grupo-unas/oferta-tipo-local/en-las-rozas-es/) |
| Nº de opiniones | `1231 opiniones` | Las mismas 3 URLs |

**Verificado por triple fuente independiente.** Dato válido **a fecha 2026-07-15**; es un valor que cambia con el tiempo.

### 2.4 Estructura del catálogo (categorías)

Literal de la ficha ([Ficha EN](https://www.treatwell.es/en/place/nails-lash-studio/), que expone los contadores):

| Categoría (literal) | Nº servicios | Precio cabecera (literal) |
|---|---|---|
| `Manicuras, Extensiones Y Tratamientos` | 32 | `from 2 €` |
| `Pedicuras Y Tratamientos Pies` | 6 | `from 15 €` |
| `Definición Y Depilación De Cejas` | 2 | `10 €` |
| `Depilación` | 3 | `from 6 €` |
| **TOTAL** | **43** | |

**Hallazgo importante — no hay categoría de pestañas.** El catálogo de Treatwell **no incluye ningún servicio de pestañas** (extensiones, lifting, tinte), pese al nombre comercial "Nails **Lash** Studio". En cambio, la web propia (https://www.nailslashlasrozas.es/) **sí** menciona `Eyelash lifting`, `Individual eyelash extensions`, `Eyelash tinting`, `Eyebrow lamination`, `Russian manicure`, entre otros — **sin precios**.

*(Inferencia mía, a confirmar con el negocio: o bien el salón no comercializa pestañas vía Treatwell, o bien la ficha de Treatwell está incompleta. Las dos hipótesis tienen consecuencias distintas para la web.)*

### 2.5 Catálogo completo verificado

#### Manicuras, Extensiones Y Tratamientos — 32/32 VERIFICADO

Verificado por **dos fuentes independientes** ([Ficha ES](https://www.treatwell.es/establecimiento/nails-lash-studio/) y [Ficha EN](https://www.treatwell.es/en/place/nails-lash-studio/)), que coinciden en los 32 registros. Transcripción **literal** (se respetan erratas y mayúsculas de origen):

| # | Servicio (literal) | Duración (literal) | Precio (literal) |
|---|---|---|---|
| 1 | Manicura Spa | 1 hora | 20 € |
| 2 | Manicura Spa Hombre | 30 minutos | 20 € |
| 3 | Decoración Uña | 15 minutos | 2 € |
| 4 | Nail Art | 15 minutos | 4 € |
| 5 | Arreglo de uña rota | 15 minutos | 3 € |
| 6 | Retirar Gel | 15 minutos | 10 € |
| 7 | Manicura Shella S | 1 hora | 27 € |
| 8 | Manicura Shella M | 1 hora | 29 € |
| 9 | Manicura Shella L | 1 hora | 31 € |
| 10 | Manicura Semipermanente S | 1 hora | 27 € |
| 11 | Manicura Semipermanente M | 1 hora | 29 € |
| 12 | Manicura semipermanente L | 1 hora | 31 € |
| 13 | Mantenimiento Uñas de Gel S | 1 hora | 36 € |
| 14 | Mantenimiento Uñas de Gel M | 1 hora | 42 € |
| 15 | Mantenimiento Uñas de Gel L | 1 hora | 48 € |
| 16 | Dual Form Gel | 1 hora 30 minutos | 65 € |
| 17 | Relleno Dual Form | 1 hora | 40 € |
| 18 | Decoracion Baby boomer | 15 minutos | 10 € |
| 19 | Decoración Sencilla Uñas | 15 minutos | 4 € |
| 20 | Decoración Elaborada Uñas | 15 minutos | 15 € |
| 21 | French Manicura Shella M-L | 15 minutos | 33 € |
| 22 | Decoración espejo-perla | 15 minutos | 4 € |
| 23 | Decoración ojo de gato | 15 minutos | 10 € |
| 24 | Decoración efecto carey | 15 minutos | 15 € |
| 25 | Retirar acrílico | 15 minutos | 15 € |
| 26 | Uñas de gel S (Press On / Gel X / Soft Gel) | 1 hora | 38 € |
| 27 | Uñas de Gel M (Press On / Gel X / Soft Gel) | 1 hora | 40 € |
| 28 | Uñas de Gel L (Press On / Gel X / Soft Gel) | **15 minutos** | 45 € |
| 29 | Limar y Esmaltar tradicional manos | 30 minutos | 15 € |
| 30 | Uñas de Gel S ( Esculpidas / Dual Form / Sándwich ) | 1 hora 15 minutos | 52 € |
| 31 | Uñas de Gel M ( Esculpidas / Dual Form / Sándwich ) | 1 hora 15 minutos | 64 € |
| 32 | Uñas de Gel L ( Esculpidas / Dual Form / Sándwich ) | 1 hora 15 minutos | 74 € |

**Erratas del origen que he copiado literalmente y NO he corregido:** `Decoracion Baby boomer` (sin tilde), `Manicura semipermanente L` (minúscula), espaciado irregular en los paréntesis de los ítems 30-32.

**Anomalías señaladas como INFERENCIA (no como hecho):**
- **Ítem 28** (`Uñas de Gel L (Press On / Gel X / Soft Gel)`): duración `15 minutos` cuando las variantes S y M del mismo servicio son `1 hora`. *Inferencia: casi con seguridad es un error de carga de datos en Treatwell.* **A confirmar con el negocio antes de publicar.**
- **Ítem 21** (`French Manicura Shella M-L`, 15 minutos / 33 €): duración incoherente con las manicuras Shella (1 hora). *Inferencia: mismo tipo de error.* **A confirmar.**
- Los precios cabecera coinciden con los datos: `from 2 €` = ítem 3 (2 €). **Consistente.**

#### Pedicuras Y Tratamientos Pies — 2/6 VERIFICADO ⚠️

| Servicio (literal) | Duración | Precio | Fuente |
|---|---|---|---|
| Pedicura Deluxe | 1 hora 15 minutos | 40 € | [Listado pedicura Las Rozas](https://www.treatwell.es/establecimientos/tratamiento-pedicura/oferta-tipo-local/en-las-rozas-es/) |
| Esmaltado semipermanente pies | 30 minutos | 29 € | [Listado uñas Las Rozas](https://www.treatwell.es/establecimientos/servicios-grupo-unas/oferta-tipo-local/en-las-rozas-es/) + [Listado pedicura spa](https://www.treatwell.es/establecimientos/tratamiento-pedicura-spa/oferta-tipo-local/en-las-rozas-es/) |

**FALTAN 4 SERVICIOS DE PEDICURA — NO VERIFICADO.** La cabecera dice `from 15 €`, y el precio más bajo que he verificado es 29 €, luego **existe al menos un servicio de pedicura de 15 € que no he podido leer**. Los ítems están cargados por JavaScript y no son accesibles vía `WebFetch`. Ver punto 3.

#### Definición Y Depilación De Cejas — 2/2 VERIFICADO

| Servicio (literal) | Duración | Precio | Fuente |
|---|---|---|---|
| Depilación con Hilo Cejas | 15 minutos | 10 € | [Listado cejas con hilo Las Rozas](https://www.treatwell.es/establecimientos/tratamiento-depilacion-de-cejas-con-hilo/oferta-tipo-local/en-las-rozas-es/) |
| Depilación Cejas con Pinzas | 15 minutos | 10 € | [Listado cejas con hilo Las Rozas](https://www.treatwell.es/establecimientos/tratamiento-depilacion-de-cejas-con-hilo/oferta-tipo-local/en-las-rozas-es/) |

**Prueba de completitud:** son 2 servicios, ambos a 10 €, y la cabecera de categoría dice exactamente `10 €` (precio único, no "desde"). **Cuadra: categoría completa.**

#### Depilación — 3/3 VERIFICADO

| Servicio (literal) | Duración | Precio | Fuente |
|---|---|---|---|
| Depilación De Labio Con Hilo | 15 minutos | 6 € | [Listado depilación Las Rozas](https://www.treatwell.es/establecimientos/servicios-grupo-depilacion/oferta-tipo-local/en-las-rozas-es/) |
| Depilación facial con hilo | 15 minutos | 20 € | [Listado depilación Las Rozas](https://www.treatwell.es/establecimientos/servicios-grupo-depilacion/oferta-tipo-local/en-las-rozas-es/) |
| Depilación co Hilo Cejas y Labio Superior | 15 minutos | 13 € | [Listado depilación cejas Las Rozas](https://www.treatwell.es/establecimientos/tratamiento-depilacion-de-cejas/oferta-tipo-local/en-las-rozas-es/) |

**Errata del origen copiada literalmente:** `Depilación co Hilo Cejas y Labio Superior` — dice "co", no "con".

**Prueba de completitud:** son 3 servicios y el mínimo es 6 €, que coincide con la cabecera `from 6 €`. **Cuadra: categoría completa.**

> **Nota sobre la asignación de categorías (INFERENCIA):** la adscripción de los 5 servicios de cejas/depilación a una u otra categoría la he **deducido** por el cuadre de contadores (2 y 3) y de precios cabecera (10 € y desde 6 €), no la he observado directamente agrupada en la ficha. Es una inferencia sólida pero es una inferencia.

### 2.6 Recuento final

| Categoría | Verificado | Total declarado |
|---|---|---|
| Manicuras, Extensiones Y Tratamientos | 32 | 32 ✅ |
| Pedicuras Y Tratamientos Pies | 2 | 6 ⚠️ |
| Definición Y Depilación De Cejas | 2 | 2 ✅ |
| Depilación | 3 | 3 ✅ |
| **TOTAL** | **39** | **43** |

---

## 3. Lo que NO he podido verificar

| # | Dato no verificado | Por qué ha fallado | Qué haría falta para verificarlo |
|---|---|---|---|
| 1 | **4 de los 6 servicios de `Pedicuras Y Tratamientos Pies`**, incluido el de `15 €` | Los ítems de las categorías colapsadas se cargan por JavaScript; `WebFetch` no ejecuta JS. Agotadas las páginas de listado por tratamiento de Treatwell | Abrir la ficha en navegador y desplegar la sección de pedicuras. Lo intenté: hay 2 navegadores Chrome conectados y la selección exige preguntar al usuario, cosa que no puedo hacer como subagente no interactivo. **Alternativa mejor: pedir el catálogo al negocio** |
| 2 | **Precios de los servicios de pestañas** (extensiones, lifting, tinte) | No existen en Treatwell; la web propia los anuncia sin precio | Preguntar al negocio. **Es un bloqueante de producto**, no solo de investigación |
| 3 | **Si el salón sigue ofreciendo pestañas** | Contradicción entre el nombre comercial + web propia (sí) y el catálogo de Treatwell (no) | Confirmación explícita del negocio |
| 4 | **Teléfono en Treatwell** | No aparece en la ficha | El `625 22 33 66` sale de la web propia. Confirmar con el negocio cuál es el de contacto público |
| 5 | **Email de contacto** | No aparece en ninguna fuente leída | Preguntar al negocio |
| 6 | **Dirección canónica** (con o sin `C.C. El Zoco` / `Local 41`) | Treatwell y la web propia difieren en el nivel de detalle | Confirmar con el negocio la dirección postal exacta |
| 7 | **Domingo cerrado** confirmado por el negocio | Solo consta en Treatwell; la web propia no menciona el domingo | Confirmación del negocio |
| 8 | **Vigencia de los precios** | Treatwell refleja lo que el salón cargó, con fecha desconocida | Confirmación del negocio. **Obligatorio antes de publicar precios** |
| 9 | **Si las anomalías de duración (ítems 21 y 28) son errores** | Solo puedo observar que son incoherentes, no por qué | Confirmación del negocio |
| 10 | **Datos fiscales** (razón social, NIF, domicilio social) para el aviso legal | Fuera del alcance de esta consulta; no están en Treatwell | Pedir al negocio. **Requisito legal para publicar** (LSSI-CE) — a verificar por el área legal |
| 11 | **Si Google permite marcar `aggregateRating` con reseñas de terceros** (Treatwell) en `schema.org` | No lo he verificado en la documentación oficial de Google; **no lo afirmo de memoria** | Leer la documentación oficial de Google Search Central sobre datos estructurados de reseñas. **Tarea pendiente antes de implementar SEO** |
| 12 | **Fidelidad literal 100% de la transcripción** | `WebFetch` resume con un modelo; mitigado con contraste entre URLs independientes, pero no es un volcado del DOM | Revisión visual humana de la ficha antes de publicar precios |

---

## 4. Impacto en el proyecto

### 4.1 Qué EXIGE

1. **Puerta de validación humana sobre los datos del negocio.** Nada de lo recogido aquí es publicable sin que la dueña confirme precios, duraciones, dirección, teléfono y horario. Treatwell es un punto de partida, no una fuente autorizada.
2. **Los precios y el catálogo deben vivir en una única fuente de datos** (p. ej. `data/servicios.json`), no incrustados en el marcado. Son datos volátiles y de cara al consumidor.
3. **La nota media y el nº de opiniones NO deben hardcodearse.** Hoy 4,9 / 1231; mañana no. Si se muestran: o se obtienen dinámicamente, o se sella con fecha ("valoración en Treatwell a fecha de X"), o no se muestran.
4. **Aviso legal / LSSI-CE.** Publicar la web de un negocio real exige datos identificativos del prestador. Faltan por completo (ítem 10). Bloqueante legal — **a verificar con fuente normativa oficial, no de memoria**.
5. **Resolver la contradicción de las pestañas antes de diseñar el catálogo.** El nombre del negocio promete un servicio que su ficha de reservas no vende.
6. **Dirección completa con `C.C. El Zoco, Local 41`** *(inferencia)*: es un local dentro de un centro comercial; sin esa referencia el cliente no lo localiza.

### 4.2 Qué PROHÍBE

1. **Prohibido inventar precios de pestañas** o de los 4 servicios de pedicura que faltan. Si se publican sin confirmar, es información comercial falsa en la web de un negocio real.
2. **Prohibido "corregir" en silencio las erratas y anomalías del origen** (`Decoracion Baby boomer`, `co Hilo`, el ítem 28 a 15 minutos). Hay que preguntar, no adivinar: si el ítem 28 realmente dura 1 hora, publicarlo como 15 minutos rompe la agenda real del salón.
3. **Prohibido presentar el catálogo como completo.** Solo tengo 39 de 43 servicios.
4. **Prohibido marcar `aggregateRating` en `schema.org` con las reseñas de Treatwell** hasta verificar la política oficial de Google (ítem 11). Un rich snippet mal marcado puede acarrear una penalización manual.
5. **Prohibido copiar textos descriptivos de Treatwell** a la web nueva: son contenido de un tercero y además generarían contenido duplicado.

### 4.3 Qué FEATURES implica

| Feature | Notas | Estado del dato |
|---|---|---|
| Catálogo de servicios | 4 categorías, 43 servicios, con variantes S/M/L y duraciones | 39/43 verificados; **bloqueado** por confirmación del negocio |
| Variantes S/M/L | Patrón dominante (Shella, Semipermanente, Mantenimiento, Uñas de Gel). El modelo de datos debe soportar `servicio → variantes[]`, no aplanar | Verificado |
| Ficha de contacto y horario | L-V 10:00–20:00, S 10:00–14:00, D cerrado | Verificado (doble fuente) + corroborado por web propia |
| Reserva online | Treatwell es el canal de reserva real y activo. *Inferencia: lo sensato es enlazar a Treatwell, no construir un motor de reservas propio* | Decisión de producto pendiente |
| Datos estructurados `LocalBusiness` / `BeautySalon` | `openingHours`, `address`, `telephone`. `aggregateRating` **en suspenso** hasta verificar la política de Google | Parcialmente bloqueado |
| Prueba social | 4,9 / 1231 opiniones es un activo comercial fuerte, pero es un dato vivo | Verificado a 2026-07-15 |
| Aviso legal / privacidad / cookies | Sin datos fiscales del titular | **Bloqueado** — faltan datos |
| Sección de pestañas | Sin precios y con contradicción de fuentes | **Bloqueado** |

### 4.4 Acción inmediata recomendada

Elaborar un **cuestionario único para la dueña** que cierre de golpe los ítems 1-10 de la tabla del punto 3. Es el camino crítico: **la mayor parte del contenido de la web está bloqueada por datos que solo el negocio tiene**, y ninguna cantidad de investigación web los sustituye.

---

## Anexo: fuentes consultadas

| # | URL | Uso |
|---|---|---|
| 1 | https://www.treatwell.es/establecimiento/nails-lash-studio/ | Ficha oficial ES — fuente primaria |
| 2 | https://www.treatwell.es/en/place/nails-lash-studio/ | Ficha oficial EN — contraste independiente + contadores de categoría |
| 3 | https://www.treatwell.es/establecimientos/servicios-grupo-unas/oferta-tipo-local/en-las-rozas-es/ | Contraste de nota/opiniones + esmaltado pies |
| 4 | https://www.treatwell.es/establecimientos/tratamiento-pedicura/oferta-tipo-local/en-las-rozas-es/ | Pedicura Deluxe |
| 5 | https://www.treatwell.es/establecimientos/tratamiento-pedicura-spa/oferta-tipo-local/en-las-rozas-es/ | Contraste esmaltado pies |
| 6 | https://www.treatwell.es/establecimientos/tratamiento-depilacion-de-cejas/oferta-tipo-local/en-las-rozas-es/ | Depilación cejas+labio |
| 7 | https://www.treatwell.es/establecimientos/tratamiento-depilacion-de-cejas-con-hilo/oferta-tipo-local/en-las-rozas-es/ | Las 2 de la categoría cejas |
| 8 | https://www.treatwell.es/establecimientos/servicios-grupo-depilacion/oferta-tipo-local/en-las-rozas-es/ | Depilación labio y facial |
| 9 | https://www.treatwell.es/establecimientos/tratamiento-tratamiento-de-parafina/oferta-tipo-local/en-las-rozas-es/ | Consultada; sin datos nuevos |
| 10 | https://www.nailslashlasrozas.es/ | Web propia — teléfono, dirección completa, servicios de pestañas |
