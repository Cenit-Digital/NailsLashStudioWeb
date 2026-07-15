# Cookies (AEPD / LSSI) — informe de investigación

- **Área:** Legal ES/UE — cookies y art. 22.2 LSSI
- **Fecha del informe:** 2026-07-15
- **Fuente normativa principal:** AEPD, *Guía sobre el uso de las cookies*, **versión MAYO 2024** (verificada descargando el PDF el 2026-07-15).
- **Estado:** las afirmaciones marcadas `[V]` están verificadas contra fuente oficial citada; `[I]` son inferencias mías; `[?]` es desconocido / no verificado.

---

## 1. Respuesta ejecutiva

**Una web estática sin analytics, sin píxeles y sin cookies de terceros NO necesita banner de cookies.** No es una interpretación laxa: es lo que dice literalmente la AEPD.

Dos caminos independientes llevan a la misma conclusión:

1. **Si no se usa ningún dispositivo de almacenamiento/recuperación de datos, el art. 22.2 LSSI ni siquiera se activa.** El precepto regula "utilizar dispositivos de almacenamiento y recuperación de datos en equipos terminales". Sin cookies ni equivalentes, no hay supuesto de hecho. `[I]` (inferencia directa del texto literal, ver §3).
2. **Aunque hubiera cookies, si TODAS son de finalidad exceptuada no hace falta ni informar ni pedir consentimiento** — y esto la AEPD lo dice con todas las letras, incluyendo cookies de terceros (§4.1 de la Guía, ver §4 de este informe). `[V]`

**Lo que sí recomendamos hacer** (y es barato):

- **No poner banner.** Un banner cuando no hay cookies no es "por si acaso": es ruido que daña UX y CLS, y **sugiere al usuario que le estamos rastreando cuando no es cierto**. La AEPD no lo exige. `[I]`
- **Sí poner una frase de transparencia** en la política de privacidad. La AEPD lo *recomienda* expresamente incluso para cookies excluidas del art. 22.2, y da un ejemplo literal de redacción (§4.3). `[V]`
- **Tratar "cero cookies" como un invariante testeable, no como una intención.** Es la decisión de diseño de mayor apalancamiento del informe: si se sostiene, desaparecen banner, CMP, política de cookies y toda una clase de riesgo. Ver §7.

**El punto crítico y contraintuitivo: Google Maps.** Incrustar un iframe de Google Maps **rompe el "sin cookies de terceros"** y, con la redacción actual de los términos de Google, **arrastra la obligación de consentimiento previo**, es decir, **obliga a poner el banner que estamos evitando** (ver §6). La recomendación es **no incrustar Maps por defecto**: usar imagen estática o enlace externo, o *click-to-load*. Esta es la única decisión de producto de este informe que cambia el resultado por sí sola.

**Aviso de alcance:** este informe cubre **cookies**. La web tendrá otras obligaciones (aviso legal LSSI art. 10, política de privacidad del formulario de contacto) que **no** se resuelven aquí y que dependen de datos que solo puede aportar el cliente (razón social, CIF), ya listados como riesgo abierto en `progress/current.md:128-129`.

---

## 2. Fuente vigente y su fecha (verificación)

| Dato | Valor | Cómo se ha verificado |
| --- | --- | --- |
| Documento | Guía sobre el uso de las cookies | AEPD |
| **Versión** | **MAYO 2024** | Portada del PDF: `"MAYO 2024"` / `"Guía actualizada en mayo 2024"` |
| URL oficial | <https://www.aepd.es/guias/guia-cookies.pdf> | Descargado el 2026-07-15 |

`[V]` La versión de mayo de 2024 es la que la AEPD sirve **hoy** en su URL canónica de guías. Verificado descargando el PDF en la fecha de este informe y leyendo la portada, no por búsqueda indirecta.

`[V]` Existe una versión anterior de **julio 2023** todavía accesible en una URL legacy (<https://www.aepd.es/sites/default/files/2020-07/guia-cookies.pdf>). **No usar esa URL**: la canónica y vigente es `/guias/guia-cookies.pdf`. Este es un error fácil de cometer porque la URL legacy sigue viva y posicionada en buscadores.

`[V]` La actualización de julio 2023 se debió a la adaptación a las Directrices 03/2022 del CEPD sobre patrones engañosos (nota de prensa AEPD de 11/07/2023: <https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-actualiza-guia-cookies-para-adaptarla-a-nuevas-directrices-cepd>), con plazo de adaptación hasta el 11/01/2024.

`[?]` **No he verificado por qué se actualizó en mayo 2024** (no he localizado nota de prensa específica de esa revisión). No afecta a las conclusiones de este informe, porque cito el texto literal de la versión de mayo 2024, no el resumen de una nota de prensa.

`[?]` **No puedo garantizar que no exista una versión posterior a mayo 2024** publicada en otra ubicación. Mitigación: la URL canónica servía la versión de mayo 2024 el 2026-07-15. Reverificar antes de publicar (ver §8).

---

## 3. El marco: art. 22.2 LSSI (texto literal vigente)

Fuente oficial: **BOE, Ley 34/2002, texto consolidado**, <https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758> (art. 22). Última modificación del art. 22: **disposición final 2.5 de la Ley 9/2014, de 9 de mayo** (en vigor desde 11/05/2014). `[V]`

> **Artículo 22.2** — "Los prestadores de servicios podrán utilizar dispositivos de almacenamiento y recuperación de datos en equipos terminales de los destinatarios, a condición de que los mismos hayan dado su consentimiento después de que se les haya facilitado información clara y completa sobre su utilización, en particular, sobre los fines del tratamiento de los datos, con arreglo a lo dispuesto en la Ley Orgánica 15/1999, de 13 de diciembre, de protección de datos de carácter personal.
>
> Cuando sea técnicamente posible y eficaz, el consentimiento del destinatario para aceptar el tratamiento de los datos podrá facilitarse mediante el uso de los parámetros adecuados del navegador o de otras aplicaciones.
>
> **Lo anterior no impedirá el posible almacenamiento o acceso de índole técnica al solo fin de efectuar la transmisión de una comunicación por una red de comunicaciones electrónicas o, en la medida que resulte estrictamente necesario, para la prestación de un servicio de la sociedad de la información expresamente solicitado por el destinatario.**"

Tres precisiones que importan al proyecto:

- `[V]` **La norma es neutra respecto a la tecnología.** No dice "cookies": dice *dispositivos de almacenamiento y recuperación de datos*. La Guía lo confirma: "La LSSI resulta aplicable a las cookies entendidas en el sentido señalado al comienzo de esta guía, esto es, como **cualquier tipo de dispositivo de almacenamiento y recuperación de datos** que se utilice en el equipo terminal de un usuario" (Guía, §2.1, pág. 11).
- `[V]` La Guía extiende expresamente el ámbito a "*local shared objects o flash cookies, web beacons o bugs, etc.*" y **al fingerprinting**: "La citada norma también resulta de aplicación al empleo de técnicas de fingerprinting" (Guía, §1, pág. 8).
- `[I]` **`localStorage` y `sessionStorage` están cubiertos** por esa definición neutra, aunque **la Guía no los nombra literalmente**. Es una inferencia, pero de bajo riesgo: son inequívocamente "dispositivos de almacenamiento y recuperación de datos en el equipo terminal". **Consecuencia práctica para el proyecto en §7.**
- `[V]` La remisión a la LO 15/1999 debe entenderse hecha hoy al **RGPD y a la LOPDGDD** (Guía, §1, pág. 9).

---

## 4. Las excepciones del art. 22.2 y la respuesta directa a "¿hace falta banner?"

### 4.1 Las dos excepciones legales

`[V]` Guía AEPD (§1 "Alcance de las normas", págs. 9-10), literal:

> "quedan exceptuadas del cumplimiento de las obligaciones establecidas en el artículo 22.2 de la LSSI las cookies utilizadas para alguna de las siguientes finalidades:
> - Permitir únicamente la comunicación entre el equipo del usuario y la red.
> - Estrictamente prestar un servicio expresamente solicitado por el usuario."

### 4.2 La lista del GT29 (Dictamen 4/2012)

`[V]` La Guía recoge que el GT29, en su **Dictamen 4/2012** (<https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2012/wp194_en.pdf>), interpretó que entre las cookies exceptuadas estarían las que tienen por finalidad (Guía, §1, pág. 10):

- Cookies de "entrada del usuario"
- Cookies de autenticación o identificación de usuario (**únicamente de sesión**)
- Cookies de seguridad del usuario
- Cookies de sesión de reproductor multimedia
- Cookies de sesión para equilibrar la carga
- **Cookies de personalización de la interfaz de usuario**
- Determinadas cookies de complemento (plug-in) para intercambiar contenidos sociales (nota 14 de la Guía: "*La excepción sólo se aplica para usuarios que han decidido mantener la sesión abierta*")

### 4.3 Respuesta literal a la pregunta del banner

`[V]` **Guía AEPD, §4.1 (pág. 31)** — esta es la cita decisiva, y es inequívoca:

> "En aquellos casos en que un editor ofrece a los usuarios un servicio y **todas las cookies utilizadas desde su página web se utilizan exclusivamente para las finalidades respecto de las que no es necesario obtener el consentimiento** enumeradas más arriba, **tanto si son propias como de terceros, no será necesario que informe de su utilización ni que obtenga el consentimiento**."

Y en §1 (pág. 10):

> "puede entenderse que estas cookies quedan excluidas del ámbito de aplicación del artículo 22.2 de la LSSI, y, por lo tanto, **no sería necesario informar ni obtener el consentimiento sobre su uso**. Por el contrario, será necesario informar y obtener el consentimiento para la utilización de cualquier otro tipo de cookies, **tanto de primera como de tercera parte, de sesión o persistentes**, que no queden fuera del ámbito de aplicación del artículo 22.2."

**→ Conclusión `[V]`: sin cookies, o solo con cookies exceptuadas, no hay obligación de banner ni de consentimiento.**

### 4.4 El matiz de transparencia (recomendación, no obligación)

`[V]` Guía, §1 (pág. 10), literal:

> "Dicho esto, **por razones de transparencia se recomienda informar, al menos con carácter genérico**, de aquellas cookies excluidas del ámbito de aplicación del artículo 22.2 de la LSSI, ya sea en la política de cookies o en la propia política de privacidad (ejemplo: '**Este sitio web utiliza cookies que permiten el funcionamiento y la prestación de los servicios ofrecidos en el mismo**')."

`[I]` Es una **recomendación** ("se recomienda"), no una obligación, y **no exige banner**: la propia AEPD la ubica en la política de privacidad. Cumplir esto cuesta una frase y elimina discusión.

### 4.5 Cookies polivalentes (relevante si algún día se añade algo)

`[V]` Guía, §1 (pág. 10): "una misma cookie puede tener más de una finalidad (cookies polivalentes), por lo que existe la posibilidad de que una cookie quede exceptuada [...] para una o varias de sus finalidades y no para otras". La AEPD cita al GT29: esto debería "*incitar a los propietarios de sitios web a utilizar una cookie diferente para cada finalidad*".

`[V]` Las cookies técnicas dejan de estar exentas si se reutilizan para fines no exentos: "si estas cookies se utilizan también para finalidades no exentas (por ejemplo, para fines publicitarios comportamentales), quedarán sujetas a dichas obligaciones" (Guía, §2.1.2.a, pág. 11).

---

## 5. Distinción crítica: art. 22.2 LSSI ≠ RGPD

Este es el error conceptual más caro de este dominio, y conviene dejarlo fijado porque condiciona §6:

| | **Art. 22.2 LSSI** | **RGPD** |
| --- | --- | --- |
| Qué regula | **Almacenar o acceder** a datos en el equipo terminal | **Tratar datos personales** |
| Se activa con | Cookies, localStorage, fingerprinting… | Cualquier dato personal, **incluida la IP** |
| ¿Depende de que haya dato personal? | **No** | Sí |

`[V]` La Guía es explícita en que ambos planos son distintos y acumulativos: "cuando la utilización de una cookie conlleve el tratamiento de datos personales, los responsables de tal tratamiento deberán asegurarse del cumplimiento de las **exigencias adicionales** establecidas por la normativa sobre protección de datos personales" (Guía, §1, pág. 9).

`[I]` **La consecuencia que importa:** un recurso de terceros que **no ponga ninguna cookie** puede quedar fuera del art. 22.2 y **aun así** implicar tratamiento de datos personales bajo RGPD, porque al cargarlo el navegador transmite la **IP del visitante** al tercero. **"No pone cookies" no equivale a "no hay problema legal".** Esto es exactamente lo que hace que §6 no se resuelva solo comprobando cookies.

`[V]` Base jurídica de esa consecuencia: **TJUE, asunto C-40/17 (Fashion ID), sentencia de 29 de julio de 2019** (<https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX%3A62017CJ0040>). El gestor de un sitio que **inserta un módulo de un tercero** es **corresponsable del tratamiento**, si bien su responsabilidad "se limita a la operación o al conjunto de las operaciones de tratamiento de datos personales cuyos fines y medios determina efectivamente": en concreto la **recogida** y la **comunicación por transmisión** al proveedor del módulo, y **no** las fases ulteriores del tercero. La sentencia atribuye al **gestor del sitio** la obligación de recabar el consentimiento, por ser quien desencadena el tratamiento al ser visitado.

`[V]` La AEPD alinea su Guía con ese reparto: "el alcance de las obligaciones de información y obtención del consentimiento por parte del editor respecto de las cookies de terceros **se circunscribe a los tratamientos de los que es responsable** [...] Dichas obligaciones no se extienden, en cambio, a las fases ulteriores del tratamiento en las que el editor no interviene" (Guía, §4.2, pág. 33).

---

## 6. Qué pasa si se incrusta Google Maps o un iframe de terceros

### 6.1 Lo que dice la AEPD sobre contenido de terceros

`[?]` **La Guía de la AEPD NO menciona Google Maps, ni "iframe", ni "contenido incrustado/embebido" como tales.** Lo he comprobado buscando esos términos en el texto completo del PDF. Quien afirme que "la AEPD dice que Maps necesita consentimiento" **está extrapolando**. Lo que sí hay es una regla general aplicable:

`[V]` Guía, §4.2 (pág. 31-32), literal:

> "Generalmente, **las cookies de terceros almacenan información en el equipo terminal del usuario o utilizan dicha información porque el editor, a la hora de diseñar la página web, plataforma o aplicación, previó la posibilidad de incluir contenidos de terceros que las utilizan** o porque emplea software de terceros que las requieren.
>
> Por ello, los editores, cuando no sean titulares de las cookies que se utilizan, **deberán asegurar que los interesados reciben la información necesaria y que están habilitados los mecanismos que permitan su consentimiento**, por ejemplo, a través de obligaciones o garantías contractuales que obliguen al tercero titular de las cookies o a través de la instalación de plataformas para la gestión del consentimiento."

`[V]` Y la responsabilidad **no se puede endosar por contrato**: "la responsabilidad administrativa exigible ante las autoridades de control por el cumplimiento de las obligaciones derivadas del uso de cookies **corresponde a cada parte obligada y no es desplazable contractualmente**" (Guía, §4.2, pág. 33).

`[V]` Si la información del tercero se ofrece por enlace, el editor "tendrá que asegurarse que los enlaces no estén rotos", y el tercero debe ofrecerla **en castellano** o lengua cooficial del sitio (Guía, §4.2, pág. 32).

### 6.2 Lo que dice Google (fuente oficial del propio tercero)

`[V]` **Google Maps Platform Terms of Service** (<https://cloud.google.com/maps-platform/terms/>, **"Last modified June 23, 2026"**, consultado 2026-07-15), cláusula *End User Requirements → End User Privacy*, literal:

> "Customer's use of the Services in the Customer Application will comply with applicable privacy laws, **including laws regarding Services that store and access Cookies on End Users' devices**. Customer will comply with the then-current Consent Policy at <https://www.google.com/about/company/user-consent-policy/>, if applicable."

`[V]` **EU User Consent Policy de Google** (<https://www.google.com/about/company/user-consent-policy/>): exige obtener consentimiento legalmente válido para "**the use of cookies or other local storage where legally required**" y para "the collection, sharing, and use of personal data for personalization of ads"; obliga además a conservar registro del consentimiento y a dar instrucciones para revocarlo. Aplica a usuarios del **EEE, Reino Unido y Suiza**.

`[I]` **Lectura:** el propio Google (a) reconoce que sus Services "**store and access Cookies on End Users' devices**" y (b) traslada contractualmente al cliente la obligación de cumplir su Consent Policy. Es decir: **el tercero afirma que hay cookies y que el consentimiento es del editor.** Contra ese reconocimiento del propio proveedor, sostener "Maps no necesita consentimiento" es una posición muy difícil de defender ante la AEPD.

### 6.3 Mi comprobación empírica (y por qué NO es concluyente)

Hice una petición `curl` al endpoint del iframe clásico (`https://www.google.com/maps/embed?pb=...`) el 2026-07-15: la respuesta inicial devolvió **HTTP 200 sin cabecera `Set-Cookie`**.

`[?]` **Esto NO permite concluir que el embed de Maps no ponga cookies**, y sería un error grave usarlo como prueba de que no hace falta banner. Motivos:

1. `curl` **no ejecuta JavaScript**: el iframe carga subrecursos que pueden fijar cookies o escribir en almacenamiento local después.
2. Las cookies pueden fijarse desde **otros dominios** (`google.com`, `gstatic.com`) y por script, no por cabecera de la respuesta inicial.
3. El comportamiento puede variar por región, versión y estado previo de consentimiento.

**Lo dejo explícitamente como no verificado.** Ver §8 para cómo cerrarlo.

### 6.4 Recomendación operativa

`[I]` Ordenadas de menor a mayor riesgo:

| Opción | Efecto | Banner |
| --- | --- | --- |
| **A. Imagen estática del mapa (self-hosted) + enlace "Cómo llegar" que abre Google Maps en pestaña nueva** | Ningún recurso de terceros se carga desde nuestra web. La IP se transmite a Google **solo** si el usuario **decide** pulsar. | **No** |
| **B. *Click-to-load*: placeholder local; el iframe se inyecta solo tras pulsar** | Nada de terceros hasta un acto libre e inequívoco del usuario. | Discutible `[?]` |
| **C. Iframe de Maps cargado directamente** | Terceros en cada visita, sin elección. | **Sí** `[I]` |

**Recomiendo A.** Razones: (i) mantiene el invariante "cero terceros" del §7 intacto y verificable; (ii) hace innecesarios banner y CMP; (iii) es **más rápida** (un iframe de Maps es pesado); (iv) para un salón local, el valor real de un mapa incrustado es bajo — lo que el usuario quiere es *cómo llegar*, y un enlace lo resuelve mejor desde el móvil, abriendo la app nativa con navegación.

`[?]` Sobre **B**: es la práctica habitual del sector y es defendible (el usuario solicita expresamente el contenido), pero **no he encontrado un pronunciamiento oficial de la AEPD que valide el patrón click-to-load** como consentimiento válido para este caso. **No lo presento como verificado.** Si el cliente exige mapa embebido, B es el mal menor, pero exige análisis específico antes de publicar.

`[I]` **Regla general para cualquier iframe de terceros** (YouTube, Instagram, widgets de reseñas, Treatwell): el mismo análisis. Y ojo — dado el riesgo ya identificado en `progress/current.md:125-127` sobre republicar reseñas de Treatwell, **un widget embebido de reseñas activaría a la vez el problema de cookies y el de propiedad intelectual/RGPD**. No es una vía de escape al problema de reseñas: lo agrava.

`[I]` **Google Fonts entra en la misma familia de problemas** (ya está en el radar del proyecto según `progress/current.md:135`). Matiz importante: Google Fonts servido desde `fonts.gstatic.com` **normalmente no fija cookies** → probablemente fuera del art. 22.2, **pero sí transmite la IP** → plano RGPD (§5). **Autoalojar las fuentes elimina el debate entero por construcción** y además mejora el rendimiento. Es la misma decisión que en §6.4: internalizar el recurso en vez de negociar con la norma.

---

## 7. Impacto en el proyecto

### 7.1 Qué EXIGE

| # | Exigencia | Fuente |
| --- | --- | --- |
| E1 | Si en algún momento se usa **una sola** cookie/almacenamiento no exceptuado → banner conforme (aceptar y rechazar **al mismo nivel**, mismo formato destacado) + política de cookies + gestión del consentimiento. | Guía §4.1 (pág. 31) `[V]`; nota de prensa AEPD 11/07/2023 `[V]` |
| E2 | Frase genérica de transparencia sobre cookies en la política de privacidad (**recomendado**, no obligatorio). | Guía §1 (pág. 10) `[V]` |
| E3 | Si se incrusta Maps/iframe de terceros → asegurar información y **mecanismo de consentimiento**; responsabilidad **no desplazable** por contrato. | Guía §4.2 (págs. 31-33) `[V]` |
| E4 | Si se incrusta cualquier módulo de terceros → somos **corresponsables** de recogida y transmisión (aunque no de las fases ulteriores). | TJUE C-40/17 `[V]`; Guía §4.2 pág. 33 `[V]` |
| E5 | Si se usa Maps Platform → cumplir la **EU User Consent Policy** de Google (obligación contractual, adicional a la legal). | Google Maps Platform ToS, 23/06/2026 `[V]` |

### 7.2 Qué PROHÍBE / desaconseja

- `[I]` **No poner banner "por si acaso"**: no lo exige la AEPD si no hay cookies no exentas, perjudica UX/CLS y comunica al usuario algo falso (que le rastreamos).
- `[V]` **No** usar cookies técnicas exentas para fines no exentos (perderían la exención — Guía §2.1.2.a, pág. 11).
- `[I]` **No** añadir Google Analytics, píxel de Meta, ni widgets de terceros "porque sí": cada uno destruye el invariante de §7.3 y **obliga al banner**.
- `[V]` **No** confiar en que una cláusula contractual con el tercero nos exonere ante la AEPD (Guía §4.2, pág. 33).

### 7.3 Features que implica

**F1 — Invariante "cero cookies / cero terceros" verificado en CI.** `[I]`
La decisión de mayor apalancamiento del informe. Encaja exactamente con el patrón que el proyecto ya adoptó para los placeholders — "el build de producción falla si queda alguno [...] Es lo que hace **estructuralmente imposible** publicar datos inventados por accidente" (`progress/current.md:94-97`). Aplicar el mismo razonamiento aquí:

- Test que carga cada página publicada en navegador real y **falla si `document.cookie` ≠ vacío o si `localStorage`/`sessionStorage` tienen entradas**.
- Test que **falla si se solicita cualquier dominio externo** (allowlist vacía). Esto detecta Maps, Fonts, píxeles y cualquier regresión futura.
- Valor: convierte "no usamos cookies" de promesa a **hecho verificado en cada build**, y traslada la conformidad de la vigilancia humana a la máquina. Sin esto, cualquier PR futuro puede romper la premisa legal del sitio en silencio.

**F2 — Página de privacidad con la frase de transparencia (E2).** `[I]` Coste: una frase. Usar la redacción ejemplo de la AEPD.

**F3 — Mapa sin terceros (§6.4 opción A).** `[I]` Imagen estática + enlace "Cómo llegar". Requiere decisión del humano en `project-spec.md`.

**F4 — Fuentes autoalojadas.** `[I]` Elimina el debate Google Fonts y mejora rendimiento.

**F5 — (Condicional) Si el cliente exige Maps embebido o analítica** → entonces sí: banner conforme + política de cookies + CMP. **Es una feature cara** (Gherkin, TDD, a11y del banner, gestión de rechazo, revocación). Debe entrar en `project-spec.md` como **decisión explícita con su coste**, no colarse como detalle de implementación.

### 7.4 Nota sobre `localStorage` (trampa técnica)

`[I]` Si el sitio usa `localStorage` para preferencias de UI (tema claro/oscuro, cerrar un aviso), **el art. 22.2 aplica igualmente** — es tecnología-neutro (§3). Ahora bien, **muy probablemente esté exceptuado**, porque la Guía trata como exentas las preferencias **elegidas por el usuario**:

`[V]` "Si es el propio usuario quien elige esas características (por ejemplo, si selecciona el idioma [...] el tamaño de fuente o el contraste de color entre el fondo y el contenido para mejorar la legibilidad), **las cookies estarán exceptuadas** de las obligaciones del artículo 22.2 de la LSSI por considerarse un servicio expresamente solicitado por el usuario, y ello **siempre y cuando las cookies obedezcan exclusivamente a la finalidad seleccionada**" (Guía §2.1.2.b, págs. 11-12).

`[V]` Condición: "su uso deberá limitarse al necesario para su propósito, y la información [...] **no podrá emplearse para otros fines** [...] ni para elaborar un perfil del usuario" (íd.).

`[I]` **Consecuencia de diseño:** una preferencia de tema elegida por el usuario y guardada solo para eso **no obliga a banner**. Pero el test de F1 la detectaría como fallo. **Decisión recomendada:** mantener la allowlist de almacenamiento **vacía por defecto**; si se necesita una preferencia, añadirla a una allowlist explícita y documentada con su justificación legal. Así el default es seguro y cada excepción es deliberada y auditable.

### 7.5 Si algún día se quiere analítica (guía específica)

`[V]` La AEPD tiene una guía separada: **"Uso de cookies para herramientas de medición de audiencia", v. enero de 2024** (<https://www.aepd.es/guias/guia-cookies-analiticas-externas.pdf>). Las cookies de medición **pueden estar exentas** de consentimiento si cumplen **todas** estas condiciones (literal de la guía, §II):

- Finalidad "estrictamente limitada a la **medición exclusiva de la audiencia**"; tratamiento "en nombre exclusivo del editor"; "datos estadísticos **anónimos** únicamente".
- "**no deben dar lugar a que los datos se cotejen con otras operaciones de tratamiento o a que los datos se transmitan a terceros**".
- "**no deben permitir el seguimiento agregado** de la navegación de la persona que utiliza diferentes aplicaciones o navega por diferentes sitios web".
- Garantías mínimas (§III.A): informar en la política de privacidad; vida útil limitada (p. ej. **13 meses**, sin prórroga automática en nuevas visitas); conservación máxima **25 meses**; revisión periódica.

`[V]` Y el aviso explícito de la AEPD: "**Algunos servicios de analítica y medición de audiencia [...] no entran en el ámbito de aplicación de la exención.** Esto sucede, en particular, cuando declaran que reutilizan los datos para otras finalidades, **como es el caso de varias ofertas de medición de audiencia disponibles en el mercado**".

`[I]` Traducción práctica: **Google Analytics no encaja en esta exención** (transmite a un tercero y reutiliza datos). Si se quiere analítica sin banner, la vía es analítica **sin cookies** y autoalojada, o **logs de servidor agregados**. `[?]` No he verificado producto concreto alguno contra estos criterios; hacerlo requiere análisis específico.

### 7.6 Riesgo si se incumple

`[V]` **Art. 38.4.g LSSI** (BOE, texto consolidado) tipifica como **infracción LEVE**: "Utilizar dispositivos de almacenamiento y recuperación de datos cuando no se hubiera facilitado la información u obtenido el consentimiento del destinatario del servicio en los términos exigidos por el artículo 22.2."

`[V]` **Art. 39.1.c LSSI**: infracciones leves → "**multa de hasta 30.000 euros**".

`[I]` Para un salón local el riesgo económico esperado es bajo, pero **el coste de cumplir aquí es prácticamente cero** (no poner cookies es gratis; poner banner sí cuesta). El argumento fuerte para "cero cookies" no es el miedo a la multa: es que **es la opción más barata, más rápida y más honesta a la vez**. Rara vez coinciden las tres.

---

## 8. Lo que NO he podido verificar

| # | Afirmación no verificada | Por qué importa | Qué haría falta |
| --- | --- | --- | --- |
| NV1 | **Si el iframe de Google Maps fija cookies o escribe almacenamiento local en la práctica**, y cuáles. | Determina si Maps obliga a banner (§6). Mi test `curl` **no es concluyente**. | Cargar una página con el iframe en **navegador real** (DevTools → Application → Cookies/Storage + panel Network), desde IP española y perfil limpio. Reproducible con `claude-in-chrome` o Playwright. |
| NV2 | Si existe una versión de la Guía AEPD **posterior a mayo 2024**. | Todo el informe se apoya en esa versión. | Reverificar <https://www.aepd.es/guias/guia-cookies.pdf> (portada) antes de publicar la web. Mitigado: verificado el 2026-07-15. |
| NV3 | Motivo/alcance exacto de la revisión de **mayo 2024** frente a la de julio 2023. | Podría haber matices no capturados. | Diff entre el PDF de julio 2023 (URL legacy) y el de mayo 2024. |
| NV4 | Si la AEPD acepta el patrón **click-to-load** como consentimiento válido (§6.4 opción B). | Es la alternativa si el cliente exige mapa embebido. | Buscar resoluciones sancionadoras de la AEPD o pronunciamiento del CEPD. **No lo he hecho.** |
| NV5 | Si los **términos de Google Maps Platform** aplican al iframe simple "compartir → insertar mapa" (sin API key) o solo a Maps Platform con clave. | Cambia la fuerza del argumento de §6.2 para el caso concreto del iframe. | Analizar los ToS de Google Maps/Google generales frente a los de Maps Platform. |
| NV6 | Estado del **Reglamento ePrivacy** (sustituto de la Directiva 2002/58). | Cambiaría el marco a medio plazo. | Consultar el registro legislativo de la UE. **No verificado: no afirmo nada al respecto.** |
| NV7 | Si el sitio final usará **Maps, analítica o widgets**. | Es la variable que decide banner sí/no. | **Decisión del humano** en `project-spec.md`. `feature_list.json` sigue siendo la plantilla (`"ejemplo_feature"`), así que aún no hay nada comprometido. |
| NV8 | Si algún producto de analítica concreto cumple los criterios de exención de §7.5. | Solo relevante si se quiere analítica. | Análisis del producto contra los 4 criterios de la guía de medición de audiencia. |
| NV9 | Obligaciones de **aviso legal (LSSI art. 10)** y política de privacidad del formulario. | Fuera del alcance de este informe (cookies). | Investigación aparte. Depende de razón social/CIF, ya listados como pendientes en `progress/current.md:128-129`. |

---

## 9. Fuentes

| Fuente | URL | Fecha/versión verificada |
| --- | --- | --- |
| AEPD — Guía sobre el uso de las cookies | <https://www.aepd.es/guias/guia-cookies.pdf> | **MAYO 2024** (descargada 2026-07-15) |
| AEPD — Guía uso de cookies para herramientas de medición de audiencia | <https://www.aepd.es/guias/guia-cookies-analiticas-externas.pdf> | **v. enero de 2024** |
| AEPD — Nota de prensa (adaptación a Directrices 03/2022 CEPD) | <https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-actualiza-guia-cookies-para-adaptarla-a-nuevas-directrices-cepd> | 11/07/2023 |
| BOE — Ley 34/2002 (LSSI), texto consolidado (arts. 22, 38, 39) | <https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758> | Art. 22 modificado por Ley 9/2014 (vigor 11/05/2014) |
| TJUE — C-40/17 (Fashion ID) | <https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX%3A62017CJ0040> | Sentencia de 29/07/2019 |
| GT29 — Dictamen 4/2012 (exención de consentimiento) | <https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2012/wp194_en.pdf> | WP194 |
| Google — Maps Platform Terms of Service | <https://cloud.google.com/maps-platform/terms/> | "Last modified **June 23, 2026**" (consultado 2026-07-15) |
| Google — EU User Consent Policy | <https://www.google.com/about/company/user-consent-policy/> | Sin fecha de vigencia declarada `[?]` |
| CEPD — Report of the Cookie Banner Taskforce | Citado en la **nota 10 de la Guía AEPD** (dominio `edpb.europa.eu`). **No reproduzco la URL**: el salto de línea del PDF la parte y no la he verificado abriéndola. | **No consultado directamente** `[?]` |
