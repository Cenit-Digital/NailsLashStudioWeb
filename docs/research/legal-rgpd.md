# Informe: RGPD / LOPDGDD y criterio AEPD para una web de salón sin backend con contacto por WhatsApp + Google Fonts

> **Área:** Legal ES/UE. **Fecha:** 2026-07-15. **Autor:** subagente investigador.
> **Ámbito:** (1) ¿hace falta política de privacidad? ¿hay tratamiento por parte del titular?
> (2) Google Fonts vía `fonts.googleapis.com` frente a auto-hospedaje.
>
> **Convención de este informe** — cada afirmación va etiquetada:
> **[V]** hecho verificado contra fuente citada · **[I]** inferencia del autor (razonada, no verificada)
> · **[?]** desconocido / no verificado.
>
> **Aviso:** este informe es investigación técnica-normativa, **no asesoramiento jurídico**.
> Las páginas legales de una web que se publica deberían ser revisadas por un profesional
> con los datos reales del titular delante.

---

## 1. Respuesta ejecutiva

**Qué hacemos y por qué:**

1. **Sí hace falta política de privacidad. Sí hay tratamiento de datos por parte del titular.**
   "Sin backend" **no** significa "sin tratamiento". Hay tratamiento por **tres vías
   independientes**, y **cualquiera de ellas por sí sola** ya obliga:
   - **La solicitud por WhatsApp**: cuando el usuario envía el mensaje precompuesto, el salón
     **recibe y conserva** nombre, teléfono, servicio y fecha. Eso es "recogida" y "conservación"
     de datos personales (art. 4.2 RGPD) y el salón decide los fines y medios → es **responsable**
     (art. 4.7 RGPD). **[V]**
   - **Los logs del hosting** (Vercel, según el stack acordado): registran la IP del visitante.
     La IP es dato personal en los términos de *Breyer* (C-582/14) y del considerando 30 RGPD. **[V]**
   - **Google Fonts**, si se carga desde `fonts.googleapis.com`: el navegador del visitante
     transmite su IP a Google. Por analogía con *Fashion ID* (C-40/17), el titular de la web es
     **corresponsable de la recogida y transmisión**. **[V]** (la analogía es **[I]**, ver §2.4)

2. **Google Fonts: auto-hospedar las fuentes. Decisión cerrada, sin coste y sin debate.**
   Este es el punto donde conviene ser honesto: **no existe ningún pronunciamiento de la AEPD
   ni del EDPB específicamente sobre Google Fonts** — lo he buscado y no lo he encontrado **[?]**.
   La sentencia alemana de Múnich que todo el mundo cita (100 € de indemnización) es de un
   tribunal **de primera instancia alemán**, no vincula en España, y **su razonamiento principal
   está hoy erosionado**: se apoyaba en que EE. UU. no ofrecía nivel adecuado (post-*Schrems II*),
   y desde el **10 de julio de 2023** existe **decisión de adecuación** para el EU-US Data Privacy
   Framework, al que **Google LLC está adherido**. **[V]**
   → O sea: **el argumento del art. 44 RGPD ya no es el argumento fuerte.** El argumento que
   sigue en pie es más simple: cargar la fuente desde Google **comunica la IP del visitante a un
   tercero sin necesidad alguna**, obliga a justificar una base jurídica y a informar de ello,
   y **auto-hospedar elimina la pregunta entera por 0 € y con mejor rendimiento**.
   Recomendación: **auto-hospedar** — no porque sea seguro que lo contrario es ilegal, sino
   porque **el análisis jurídico cuesta más que la solución**.

3. **Lo que este informe NO puede cerrar.** La política de privacidad **no se puede redactar
   todavía**: exige la identidad del responsable (razón social, NIF, domicilio, contacto), que
   **no tenemos** porque no hay contacto con el cliente (`progress/current.md:78-83`). Esto
   **confirma** la decisión 6 ya tomada: las páginas legales están **bloqueadas** y la web **no
   se puede publicar** al final de este trabajo. Este informe define **la estructura y el
   contenido exigible** para que, en cuanto entren los datos, sea rellenar huecos.

4. **Extra no previsto en el encargo, pero obligatorio:** el salón necesita también
   **Registro de Actividades de Tratamiento (RAT)** — la excepción de "menos de 250 empleados"
   **no le salva**, porque el tratamiento **no es ocasional** (art. 30.5 RGPD). **[V]**
   Y necesita **contrato de encargo** con el hosting (art. 28 RGPD). **[V]**

---

## 2. Desarrollo con evidencia

### 2.1 ¿Hay tratamiento de datos por parte del titular de la web?

**Sí.** Y conviene desmontar primero el malentendido de partida.

#### 2.1.1 "Sin backend" ≠ "sin tratamiento" **[V]**

El RGPD no define el tratamiento por la existencia de un servidor propio, sino por la
**operación** sobre datos personales. Texto literal del **art. 4.2 RGPD**:

> «tratamiento»: cualquier operación o conjunto de operaciones realizadas sobre datos personales
> o conjuntos de datos personales, ya sea por procedimientos automatizados o no, como la
> **recogida**, registro, organización, estructuración, **conservación**, adaptación o modificación,
> extracción, consulta, utilización, **comunicación por transmisión**, difusión o cualquier otra
> forma de habilitación de acceso, cotejo o interconexión, limitación, supresión o destrucción;

*Fuente:* [Texto consolidado del RGPD publicado por la AEPD](https://www.aepd.es/documento/reglamento-ue-2016-679-consolidado.pdf), art. 4.2.
(Verificado extrayendo el PDF oficial con `pdftotext`; el texto reproducido es literal.)

Y **art. 4.7 RGPD**, literal:

> «responsable del tratamiento» o «responsable»: la persona física o jurídica, autoridad pública,
> servicio u otro organismo que, **solo o junto con otros, determine los fines y medios del
> tratamiento**; […]

*Fuente:* ídem, art. 4.7.

→ La prueba no es "¿tengo servidor?", sino "¿decido yo para qué y cómo se tratan estos datos?".
El salón decide publicar la web, decide que el canal sea WhatsApp y decide qué se pregunta en el
mensaje precompuesto. **[I]** (la subsunción es mía; el texto legal es **[V]**)

#### 2.1.2 Vía 1 — La solicitud por WhatsApp (la determinante) **[V] + [I]**

Según `progress/current.md:65-66`, el diseño previsto es: *"el calendario compone la solicitud y
abre WhatsApp"*. Análisis:

| Momento | ¿Hay tratamiento por el titular? | Por qué |
| --- | --- | --- |
| El usuario rellena el calendario en el navegador | **No** (los datos no salen del dispositivo) **[I]** | No hay recogida por el titular; es procesamiento local del propio usuario |
| El usuario pulsa y se abre WhatsApp con el mensaje | **No, por parte del titular** **[I]** | Es navegación iniciada por el usuario hacia un tercero (ver §2.4.5) |
| **El usuario envía el mensaje y llega al salón** | **SÍ, inequívocamente** **[V]** | El salón **recoge y conserva** nombre, teléfono, servicio, fecha → art. 4.2 |

**El punto clave:** el tratamiento existe **aunque la web sea un HTML estático**. El tratamiento no
ocurre *en la web*, ocurre **en el teléfono del salón**, y la web es el canal que lo origina. **[I]**

**Consecuencia — art. 13.1 RGPD**, literal:

> 1. **Cuando se obtengan de un interesado datos personales relativos a él**, el responsable del
> tratamiento, **en el momento en que estos se obtengan**, le facilitará toda la información
> indicada a continuación: […]

*Fuente:* [RGPD consolidado AEPD](https://www.aepd.es/documento/reglamento-ue-2016-679-consolidado.pdf), art. 13.1.

**Matiz honesto y relevante para el diseño [I]:** en rigor, los datos se obtienen **cuando llega
el mensaje a WhatsApp**, no cuando el usuario está en la web. Un purista podría decir que basta
con informar en la primera respuesta de WhatsApp. **Pero:**
- El art. 13 exige informar **"en el momento en que estos se obtengan"** — informar *después* de
  tenerlos ya es tarde. **[V]**
- La única forma práctica de informar **antes o en el momento** es **en la web, junto al botón que
  abre WhatsApp**. **[I]**

→ **Diseño exigido:** enlace visible a la política de privacidad **en el punto donde se compone la
solicitud**, no solo enterrado en el pie. **[I]**

#### 2.1.3 Vía 2 — Los logs del hosting **[V] + [I]**

El stack acordado (`progress/current.md:52`, `progress/current.md:62`) despliega en **Vercel**.
Todo hosting web registra IPs para servir y proteger el sitio. **[I]** (que Vercel concretamente
lo haga y con qué retención: **[?]**, ver §3).

Que la IP es dato personal está resuelto por el TJUE en **Breyer (C-582/14)**, fallo:

> Una dirección de protocolo de Internet dinámica registrada por un proveedor de servicios de
> medios en línea […] constituye respecto a dicho proveedor un dato personal […] **cuando éste
> disponga de medios legales que le permitan identificar a la persona interesada** gracias a la
> información adicional de que dispone el proveedor de acceso a Internet.

*Fuente:* [TJUE, C-582/14, *Breyer*, 19/10/2016, EUR-Lex CELEX:62014CJ0582](https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:62014CJ0582), fallo y ap. 49.

Y el **considerando 30 RGPD**:

> Las personas físicas pueden ser asociadas a identificadores en línea facilitados por sus
> dispositivos, aplicaciones, herramientas y protocolos, como **direcciones de los protocolos de
> internet** […]

*Fuente:* [RGPD, considerando 30 (BOE, DOUE-L-2016-80807)](https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807).
Concordante con **art. 4.1 RGPD**, que incluye expresamente *"un identificador en línea"* entre
los identificadores que hacen identificable a una persona.

**Nota de rigor [I]:** *Breyer* es un criterio **relativo** — la IP es dato personal *para quien
tiene medios legales razonables de identificar*. No es "la IP siempre es dato personal para todos".
Para el salón, con logs de Vercel, la vía legal existiría (requerimiento a la operadora vía
autoridad). En la práctica, tratar la IP como dato personal es la postura prudente y la que asume
la propia AEPD en su guía de cookies. **[I]**

→ **Consecuencia:** Vercel trata datos **por cuenta del** salón → es **encargado del tratamiento**
(art. 4.8 RGPD) → hace falta **contrato de encargo** conforme al **art. 28 RGPD**. **[V]** en cuanto
a la norma; **[?]** en cuanto a si Vercel ofrece DPA y en qué términos (ver §3).

#### 2.1.4 Vía 3 — Google Fonts (si se usa)

Ver §2.4. Solo aplica si se decide cargar desde `fonts.googleapis.com` — que es justo lo que este
informe recomienda **no** hacer.

#### 2.1.5 Lo que NO exime: la excepción doméstica **[V]**

El **art. 2.2.c RGPD** excluye el tratamiento *"por una persona física en el curso de una actividad
exclusivamente personal o doméstica"*. Un salón de uñas y pestañas es **actividad económica** →
**la excepción no aplica**. **[V]** (texto del art. 2.2.c verificado en EUR-Lex;
la subsunción es trivial pero es **[I]**).

---

### 2.2 ¿Hace falta política de privacidad? — Sí

**Conclusión: sí, es obligatoria.** No por "costumbre de internet", sino porque el art. 13 RGPD
obliga a informar y la política de privacidad es el instrumento con el que se cumple.

Criterio de la **AEPD**, literal de su FAQ sobre el deber de información:

> La cláusula informativa de protección de datos (conocida habitualmente como política de
> privacidad) da cumplimiento al deber de información del responsable.

*Fuente:* [AEPD — 2.6 El deber de información](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/6-el-deber-de-informacion)
y [FAQ-0248](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/6-el-deber-de-informacion/FAQ-0248-sobre-si-el-usuario-tiene-que-dar-consentimiento-a-clausula-de-privacidad). **[V]**

La AEPD además aclara un punto que **evita un error de diseño frecuente**: la política de
privacidad **no se "acepta"**. Literal:

> Se debe diferenciar lo que es la prestación del consentimiento para un tratamiento de datos
> concreto, en aquellos casos en los que sea la base de licitud, de lo que es la información sobre
> las condiciones generales del tratamiento de datos que figuran en la cláusula informativa.

*Fuente:* [AEPD FAQ-0248](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/6-el-deber-de-informacion/FAQ-0248-sobre-si-el-usuario-tiene-que-dar-consentimiento-a-clausula-de-privacidad). **[V]**

→ **Prohibido**: casilla "acepto la política de privacidad" como si fuera un contrato. Se **informa**,
no se pide consentimiento a la información. **[I]** (derivado del criterio AEPD **[V]**)

#### 2.2.1 Contenido exigible — art. 13 RGPD **[V]**

Texto literal verificado ([RGPD consolidado AEPD](https://www.aepd.es/documento/reglamento-ue-2016-679-consolidado.pdf), art. 13):

**Apartado 1** — en el momento de obtener los datos:
| Letra | Contenido |
| --- | --- |
| a) | la identidad y los datos de contacto del responsable y, en su caso, de su representante |
| b) | los datos de contacto del delegado de protección de datos, en su caso |
| c) | los fines del tratamiento a que se destinan los datos personales **y la base jurídica** |
| d) | cuando el tratamiento se base en el art. 6.1.f), **los intereses legítimos** perseguidos |
| e) | los destinatarios o las categorías de destinatarios, en su caso |
| f) | en su caso, la **intención de transferir a un tercer país** y la existencia o ausencia de decisión de adecuación […] |

**Apartado 2** — además:
| Letra | Contenido |
| --- | --- |
| a) | el **plazo de conservación** o los criterios para determinarlo |
| b) | la existencia del derecho a **acceso, rectificación, supresión, limitación, oposición y portabilidad** |
| c) | cuando el tratamiento se base en consentimiento (6.1.a / 9.2.a), el derecho a **retirarlo** en cualquier momento |
| d) | el derecho a **presentar una reclamación ante una autoridad de control** |
| e) | si facilitar los datos es requisito legal/contractual y las **consecuencias de no facilitarlos** |
| f) | la existencia de **decisiones automatizadas**, incluida la elaboración de perfiles (art. 22) |

#### 2.2.2 Se puede (y conviene) hacerlo **por capas** — art. 11 LOPDGDD **[V]**

**Art. 11.1 LO 3/2018**, literal:

> […] facilitando al afectado la **información básica** a la que se refiere el apartado siguiente e
> indicándole **una dirección electrónica u otro medio que permita acceder de forma sencilla e
> inmediata a la restante información**.

**Art. 11.2** — la información básica (capa 1) mínima:
> a) La identidad del responsable del tratamiento y de su representante, en su caso.
> b) La finalidad del tratamiento.
> c) La posibilidad de ejercer los derechos establecidos en los artículos 15 a 22 del Reglamento (UE) 2016/679.

*Fuente:* [BOE — LO 3/2018 (LOPDGDD), art. 11](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673&p=20181206&tn=1#a11). **[V]**

Criterio AEPD sobre **cómo** redactarla — literal de la FAQ-0247:

> concisa, transparente, inteligible y de fácil acceso, con un lenguaje claro y sencillo

*Fuente:* [AEPD FAQ-0247](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/6-el-deber-de-informacion/FAQ-0247-como-debo-cumplir-con-el-deber-de-informar). **[V]**

→ **Diseño:** capa 1 breve junto al botón de WhatsApp; capa 2 = página `/privacidad` completa. **[I]**

#### 2.2.3 Base jurídica de la reserva por WhatsApp **[I]**

**Art. 6.1.b RGPD**: *"el tratamiento es necesario para la ejecución de un contrato […] o para la
aplicación a petición de este de medidas precontractuales"*. **[V]** (texto)

→ Una **solicitud de cita** es precisamente una **medida precontractual a petición del interesado**.
La base natural es el **art. 6.1.b**, **no el consentimiento**. **[I]**
Esto importa: si la base fuese el consentimiento, habría que poder **retirarlo** y gestionar
casillas. Con 6.1.b, no. **[I]**

**Recomendación:** no pedir consentimiento para la reserva. Informar y usar 6.1.b. **[I]**

#### 2.2.4 Obligaciones adicionales que aparecen (y que nadie encargó, pero existen)

**a) Registro de Actividades de Tratamiento (RAT) — SÍ es obligatorio. [V]**

Es un error muy extendido creer que un negocio pequeño está exento. **Art. 30.5 RGPD**, literal:

> 5. Las obligaciones indicadas en los apartados 1 y 2 no se aplicarán a ninguna empresa ni
> organización que emplee a menos de 250 personas, **a menos que** el tratamiento que realice pueda
> entrañar un riesgo para los derechos y libertades de los interesados, **no sea ocasional**, o
> incluya categorías especiales de datos personales indicadas en el artículo 9, apartado 1, o
> datos personales relativos a condenas e infracciones penales a que se refiere el artículo 10.

*Fuente:* [RGPD consolidado AEPD](https://www.aepd.es/documento/reglamento-ue-2016-679-consolidado.pdf), art. 30.5 (extraído literal del PDF oficial).

**La condición es disyuntiva ("o"), no acumulativa** — basta que se cumpla **una**. Lo verifiqué
expresamente porque una lectura automatizada me devolvió primero "tres condiciones simultáneamente",
lo cual es **incorrecto**. Confirmado por la AEPD:

> Organizations that employ fewer than 250 workers are exempt from maintaining a RAT, **unless**
> their processing could pose a risk to the rights and freedoms of data subjects, **is not
> occasional**, or includes special categories of data […]

*Fuente:* [AEPD FAQ-0249 — ¿Estoy obligado a elaborar un RAT?](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/7-registro-de-actividades-de-tratamiento/FAQ-0249-estoy-obligado-a-elaborar-un-rat). **[V]**

→ Gestionar citas de clientes es **la actividad ordinaria y continuada** del salón → **no es
ocasional** → **RAT obligatorio**. **[I]** (subsunción; la norma es **[V]**)

**b) Contrato de encargo con el hosting — art. 28 RGPD. [V]**

**c) Riesgo de categorías especiales (art. 9 RGPD) — atención. [I]**

Un salón de **pestañas** y **depilación** recibe, por WhatsApp y en texto libre, mensajes del tipo
*"soy alérgica al adhesivo"*, *"estoy embarazada"*, *"tengo la piel reactiva"*. Eso son **datos de
salud** → **categorías especiales (art. 9.1)** → régimen reforzado **y**, por sí solo, **otra** razón
que activa el RAT. **[I]**
No es hipotético en este sector, pero **no lo he verificado** contra los mensajes reales del salón
(no tenemos acceso) → **[?]**. Debe plantearse al cliente.

**d) Menores — art. 7 LOPDGDD. [V]**

> El tratamiento de los datos personales de un menor de edad únicamente podrá fundarse en su
> consentimiento **cuando sea mayor de catorce años**.

*Fuente:* [BOE — LO 3/2018, art. 7](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673). **[V]**
Relevancia: **[?]** — depende de si el salón atiende a menores; hay que preguntarlo.

#### 2.2.5 Lo que la política de privacidad **no** cubre: el aviso legal (LSSI) **[V]**

Son **documentos distintos** y ambos obligatorios. La **Ley 34/2002 (LSSI-CE), art. 10** obliga al
prestador a facilitar *"de forma permanente, fácil, directa y gratuita"*:

> a) Su nombre o denominación social; su residencia o domicilio o, en su defecto, la dirección de
> uno de sus establecimientos permanentes en España; su dirección de correo electrónico y cualquier
> otro dato que permita establecer con él una comunicación directa y efectiva.

…más datos registrales (b), autorización administrativa si procede (c), profesión regulada (d),
**NIF (e)**, precios (f) y códigos de conducta (g).

*Fuente:* [BOE — Ley 34/2002, art. 10](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758). **[V]**

Una web informativa de un negocio **sí** es "servicio de la sociedad de la información" aunque no
venda online, si representa actividad económica. **[V]** (según la exposición de motivos y el ámbito
de la propia LSSI, verificado en el texto consolidado del BOE).

→ **Esto confirma el bloqueo de `progress/current.md:78-83`**: sin razón social, NIF, domicilio y
email del titular, el aviso legal **no se puede escribir**, y la política de privacidad tampoco
(art. 13.1.a exige la identidad del responsable). **[I]**

---

### 2.3 ¿Y las cookies? (contexto necesario para entender Google Fonts)

**Art. 22.2 LSSI** (texto literal en la guía de la AEPD):

> Los prestadores de servicios podrán utilizar **dispositivos de almacenamiento y recuperación de
> datos** en equipos terminales de los destinatarios, a condición de que los mismos hayan dado su
> consentimiento después de que se les haya facilitado información clara y completa sobre su
> utilización […]
> Lo anterior no impedirá el posible almacenamiento o acceso de índole técnica al solo fin de
> efectuar la transmisión de una comunicación […] o, en la medida que resulte **estrictamente
> necesario, para la prestación de un servicio de la sociedad de la información expresamente
> solicitado por el destinatario**.

*Fuente:* [AEPD — Guía sobre el uso de las cookies, **mayo 2024**](https://www.aepd.es/guias/guia-cookies.pdf), pág. 8. **[V]**
(Versión verificada extrayendo el PDF: la portada dice *"MAYO 2024 — Guía actualizada en mayo 2024"*.)

Alcance según la propia AEPD, literal:

> […] el artículo 22 de la LSSI y la presente guía se refieren a la utilización de **cookies y
> tecnologías similares** utilizadas (tales como local shared objects o flash cookies, **web beacons
> o bugs**, etc.) **para almacenar y recuperar datos de un equipo terminal** […] La citada norma
> también resulta de aplicación al empleo de **técnicas de fingerprinting**.

*Fuente:* ídem. **[V]**

**Relevante:** la AEPD define *web beacon* como *"imágenes […] almacenadas en un segundo sitio y que
permiten al titular de ese segundo sitio registrar la visita del usuario mediante la información que
el navegador de éste proporciona al descargar la imagen (**dirección IP**, sistema operativo, versión
de navegador, etc.)"*. **[V]** — Es la figura **más cercana** a Google Fonts que la AEPD contempla,
pero **no es la misma** (ver §2.4.3).

**Consecuencia para este proyecto [I]:** si la web no usa cookies ni analítica —y el diseño previsto
no las necesita— **no hace falta banner de cookies**. Un banner innecesario es peor que no ponerlo:
añade fricción y sugiere tratamientos que no existen.
**[?]** — Pendiente de confirmar que el stack final (Vite/SSG en Vercel) no introduce cookies o
analítica por defecto. **Debe verificarse en el navegador antes de publicar.**

---

### 2.4 Google Fonts desde `fonts.googleapis.com` vs. auto-hospedaje

Aquí es donde hay más ruido en internet y menos fuente oficial. Voy por partes.

#### 2.4.1 El hecho técnico **[V] para el marco, [I] para el mecanismo**

Cargar `<link href="https://fonts.googleapis.com/...">` hace que **el navegador del visitante**
abra una conexión a un servidor de Google. Toda conexión HTTP transmite la **IP de origen** al
destino (es el funcionamiento de IP; sin IP de origen no hay respuesta posible). **[I]** — es
mecánica de red elemental, pero no la respaldo con una cita normativa porque no la necesita.

**Lo que NO he podido verificar [?]:** qué dice **Google oficialmente** sobre qué registra y cuánto
retiene la Google Fonts API. Intenté `developers.google.com/fonts/faq/privacy` (redirige) y
`fonts.google.com/faq#privacy` (es una SPA renderizada por JavaScript y no devuelve texto).
**No voy a reproducir de memoria las afirmaciones de Google sobre logging.** Queda como hueco (§3).
→ **Y es un hueco que no bloquea la decisión**, precisamente porque la recomendación es no depender
de la palabra de Google.

#### 2.4.2 El marco jurídico que sí está verificado: *Fashion ID* (C-40/17) **[V]**

Es **la** referencia aplicable, y es del **TJUE**, no de un juzgado local. Hechos: una web insertaba
el botón "Me gusta" de Facebook, lo que hacía que **el navegador del visitante transmitiera su IP y
user agent a Facebook**, sin que el visitante lo supiera ni interviniera.

Fallo, apartados clave:

> el administrador […] **puede ser considerado responsable** […] **de la recogida y transmisión** de
> datos personales de los visitantes (ap. 84)

> esa responsabilidad está **limitada a la operación** […] **cuyos fines y medios determina
> efectivamente**, a saber, la recogida y la transmisión de los datos (ap. 85)

- El administrador **debe recabar el consentimiento** previamente a la recogida (ap. 102) y
  **cumplir el deber de información** (ap. 105), pero **solo respecto de las operaciones que controla**.
- **Facebook responde en solitario** de los tratamientos posteriores.
- Tanto el administrador como el proveedor deben perseguir **un interés legítimo** con esas
  operaciones (ap. 97).

*Fuente:* [TJUE, C-40/17, *Fashion ID*, 29/07/2019, EUR-Lex CELEX:62017CJ0040](https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:62017CJ0040). **[V]**

**Aplicación a Google Fonts [I]:** la estructura es **idéntica** — recurso de un tercero incrustado,
carga **automática**, transmisión de la IP sin intervención del usuario. Por tanto: el titular de la
web sería **corresponsable de la recogida y transmisión** de la IP a Google, con las obligaciones de
**base jurídica** e **información** que ello conlleva.
**Esto es una analogía razonada, no un pronunciamiento**: *Fashion ID* trataba un botón social con
finalidad publicitaria, no una fuente tipográfica con finalidad de presentación. Un tribunal podría
distinguir ambos casos. **[I]**

#### 2.4.3 Qué dice el EDPB (y qué no) **[V]**

Documento: **Guidelines 2/2023 on Technical Scope of Art. 5(3) of ePrivacy Directive, Versión 2.0,
adoptadas el 7 de octubre de 2024.**
*Fuente:* [EDPB Guidelines 2/2023 v2.0 (PDF)](https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf).
(Verificado extrayendo el PDF con `pdftotext`; las citas son literales y se indica el nº de párrafo.)

**a) El instructor y el receptor pueden ser entidades distintas — ap. 34:**

> In some cases, the entity instructing the terminal equipment to send back the targeted data and
> the entity receiving information **might not be the same**. […] Instructing the device to send
> already stored information […] makes an intrusion into the terminal equipment possible, therefore
> **such an access triggers the applicability of Article 5(3) ePD**.

→ El hecho de que sea **nuestra web** la que instruye al navegador y **Google** quien recibe **no
excluye** la aplicación del art. 5(3). **[V]**

**b) Tracking basado solo en IP — aps. 54-56 (el más citado, y el más malinterpretado):**

> 54. Some providers are developing solutions that **only rely on the collection of one component,
> namely the IP address, in order to track the navigation of the user** […] In that context Article
> 5(3) ePD could apply even though the instruction to make the IP available has been made by a
> different entity than the receiving one.

> 55. However, gaining access to IP addresses would only trigger the application of Article 5(3) ePD
> in cases where **this information originates from the terminal equipment** of a subscriber or user.
> While it is not systematically the case (for example when CGNAT is activated), the static outbound
> IPv4 originating from a user's router would fall within that case, as well as IPv6 addresses […]
> **Unless the entity can ensure that the IP address does not originate from the terminal equipment
> of a user or subscriber, it has to take all the steps pursuant to the Article 5(3) ePD.**

> 56. […] it is important to once again recall that **the applicability of this article does not
> systematically mean that consent needs to be collected**. The EDPB thus reminds that in each case
> it would have to be assessed **if a consent is needed or whether an exemption** under Article 5(3)
> ePD could apply.

**Lectura honesta [I]:** el ap. 54 habla de soluciones cuyo **propósito es rastrear** ("in order to
track the navigation of the user"). **Google Fonts no se presenta como una solución de tracking.**
Y el ap. 56 avisa expresamente de que, incluso si el art. 5(3) aplicase, **no se sigue automáticamente
que haga falta consentimiento** — puede caber la excepción de "estrictamente necesario para el
servicio solicitado".
→ **Quien afirme "el EDPB dice que Google Fonts necesita consentimiento" está sobreleyendo el
documento.** El EDPB **no** ha dicho eso.

**c) Píxeles de tracking — ap. 47, y por qué una fuente NO es un píxel:**

> A tracking pixel is a hyperlink to a resource, usually an image file, embedded into a piece of
> content like a website or an email. **This pixel usually fulfils no purpose related to the
> requested content itself**; its sole purpose is to automatically establish a communication by the
> client to the host of the pixel, **which would otherwise not have occurred**. This is however not
> systematic and tracking pixels can also be created by adding additional information to hyperlink
> **loading images that are relevant to the content displayed to the user**.

**Diferencia material [I]:** una fuente tipográfica **sí cumple una finalidad relacionada con el
contenido** (renderizar el texto). No transporta ningún identificador. No es un beacon.
→ Este es **el mejor argumento a favor** de que Google Fonts **no** es equiparable a un píxel espía,
y es un argumento que la mayoría de artículos alarmistas omite. Lo dejo dicho aunque **debilite**
la recomendación que hago: la recomendación se sostiene igual, y por motivos mejores.

#### 2.4.4 La sentencia de Múnich: lo que realmente dice y por qué pesa menos de lo que se cree

**LG München I, sentencia de 20/01/2022, asunto 3 O 17493/20.** Condenó al titular de una web a
cesar en el uso de Google Fonts dinámico y a pagar **100 €** de indemnización, razonando que la IP se
transmitía a un servidor de Google en EE. UU. donde *"no se garantiza un nivel adecuado de protección
de datos"* (invocando *Schrems II*).

*Fuente:* referencia del asunto en [dejure.org — LG München I, 20.01.2022 - 3 O 17493/20](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=3+O+17493/20).
**[V] con reserva:** he verificado la existencia y el contenido esencial del fallo mediante fuentes
jurídicas secundarias alemanas; **no he accedido al texto oficial de la sentencia** → §3.

**Por qué NO es la carta ganadora que se suele presentar:**

| Objeción | Peso |
| --- | --- |
| Es un tribunal **alemán de primera instancia** (Landgericht) | **No vincula en España** ni crea doctrina. **[I]** |
| No es AEPD, ni EDPB, ni TJUE | El encargo pedía criterio AEPD/EDPB: **no existe sobre Google Fonts**. **[?]** |
| **Su razonamiento central ha caducado en parte** | Se apoyaba en la ausencia de nivel adecuado en EE. UU. Ver abajo. **[V]** |
| Generó una **ola de cartas extorsivas** en Alemania | El propio uso masivo del fallo por *Abmahner* le resta autoridad práctica. **[I]** |

**El cambio que casi nadie actualiza — la decisión de adecuación de 2023 [V]:**

La Comisión Europea adoptó el **10 de julio de 2023** la **Decisión de Ejecución (UE) 2023/1795**,
que declara que **EE. UU. garantiza un nivel adecuado de protección** para los datos transferidos a
entidades adheridas al **EU-U.S. Data Privacy Framework**. Literal de la Comisión:

> On the basis of the new adequacy decision, personal data can flow safely from the EU to US
> companies participating in the Framework, **without having to put in place additional data
> protection safeguards**.

*Fuentes:* [Decisión de Ejecución (UE) 2023/1795 — EUR-Lex](https://eur-lex.europa.eu/eli/dec_impl/2023/1795/oj/eng) ·
[Comisión Europea — nota de prensa IP/23/3721](https://ec.europa.eu/commission/presscorner/detail/en/ip_23_3721). **[V]**

Y **Google LLC está adherido**. Declaración oficial de Google:

> Google LLC (and Google's wholly owned U.S. subsidiary companies, unless explicitly excluded)
> comply with the EU-U.S. and Switzerland-U.S. Data Privacy Frameworks (DPFs) […]

*Fuentes:* [Google — Data transfer frameworks](https://policies.google.com/privacy/frameworks) ·
ficha de participante en [dataprivacyframework.gov](https://www.dataprivacyframework.gov/list). **[V]**
**[?]** — no he podido leer la ficha concreta de Google en `dataprivacyframework.gov` (el listado es
una app interactiva); la adhesión la verifico por la **declaración oficial del propio Google**, y el
estado "activo" a fecha de hoy queda **sin verificar**.

**Consecuencia [I]:** el **art. 44 RGPD** exige que las transferencias a terceros países cumplan el
capítulo V:

> Solo se realizarán transferencias de datos personales […] a un tercer país u organización
> internacional si […] el responsable y el encargado del tratamiento cumplen las condiciones
> establecidas en el presente capítulo […]

*Fuente:* [RGPD consolidado AEPD](https://www.aepd.es/documento/reglamento-ue-2016-679-consolidado.pdf), art. 44. **[V]**

→ Con la decisión de adecuación vigente, la transferencia a Google LLC **se ampara en el art. 45**
(adecuación) y **deja de ser el problema**. **[I]**
→ **Por tanto, el argumento "Google Fonts es ilegal por el art. 44" ya no se sostiene como antes.**
Digo esto aun sabiendo que refuerza la posición contraria a mi recomendación: es lo que dicen las
fuentes.

**Aviso de estabilidad [I]:** la adecuación es **revocable** y está bajo impugnación política y
judicial recurrente (precedentes: Safe Harbor anulado en 2015, Privacy Shield anulado en 2020).
Construir sobre una adecuación es construir sobre algo que **ya se ha caído dos veces**.
Esto es, en realidad, **un argumento a favor de auto-hospedar**: elimina la dependencia.

#### 2.4.5 Nota: el enlace a WhatsApp **no** es el mismo caso que Google Fonts **[I]**

Distinción importante y que evita una conclusión errónea:

| | Google Fonts | Enlace `wa.me` |
| --- | --- | --- |
| Cómo se produce la conexión al tercero | **Automática**, al cargar la página | **El usuario pulsa** deliberadamente |
| ¿Interviene la voluntad del usuario? | No | **Sí** |
| Analogía *Fashion ID* / píxel EDPB | Encaja | **No encaja** |

*Fashion ID* y el ap. 47 del EDPB giran sobre transmisiones **automáticas** que *"otherwise would not
have occurred"*. Un hipervínculo que el usuario decide pulsar es **navegación del propio usuario**
hacia un tercero, como cualquier enlace externo. **[I]**

→ **Conclusión [I]:** el botón de WhatsApp **no** convierte al salón en corresponsable de lo que Meta
haga. **Pero sí** hay que **informar** de que el canal de contacto es WhatsApp y de que Meta trata
datos como responsable propio (transparencia, art. 13.1.e destinatarios).
**[?]** — No he encontrado pronunciamiento AEPD/EDPB que confirme expresamente esta distinción
enlace-vs-recurso-incrustado. Es mi inferencia a partir del criterio de automaticidad.

#### 2.4.6 Veredicto sobre Google Fonts

**Recomendación: auto-hospedar las fuentes.** Razonamiento honesto:

**Lo que NO voy a afirmar:**
- ❌ "Google Fonts es ilegal" → **no verificado, y probablemente falso** con la adecuación vigente.
- ❌ "La AEPD prohíbe Google Fonts" → **NO EXISTE tal pronunciamiento** (§3).
- ❌ "El EDPB exige consentimiento para Google Fonts" → **sobrelectura** de las Guidelines (ap. 56).

**Lo que sí sostengo:**

| Criterio | Google Fonts (CDN) | Auto-hospedaje |
| --- | --- | --- |
| ¿Comunica la IP del visitante a un tercero? | Sí **[I]** | **No** |
| ¿Obliga a análisis de corresponsabilidad (*Fashion ID*)? | Sí, discutible **[I]** | **No aplica** |
| ¿Obliga a informar de transferencia internacional (art. 13.1.f)? | Sí **[I]** | **No** |
| ¿Depende de una decisión de adecuación revocable? | Sí **[V]** | **No** |
| ¿Expone a reclamaciones aunque se acabe ganando? | Sí **[I]** | **No** |
| Coste de implementarlo | — | **≈ 0** (`@fontsource` o descarga + `@font-face`) **[I]** |
| Rendimiento | Peor: DNS + TLS + conexión extra a otro origen **[I]** | **Mejor** |

**La decisión no se toma por miedo legal, se toma por ingeniería:** auto-hospedar es **más rápido,
más simple, elimina una dependencia externa y hace que toda esta sección del informe sea irrelevante**.
Cuando una duda jurídica cuesta más analizarla que eliminarla, se elimina. **[I]**

---

## 3. Tabla: lo que NO he podido verificar

| # | Afirmación / dato | Estado | Qué haría falta para verificarlo | ¿Bloquea? |
| --- | --- | --- | --- | --- |
| 1 | **Pronunciamiento de la AEPD sobre Google Fonts** | **No consta.** Búsquedas en `aepd.es` sin resultado | Búsqueda exhaustiva en el buscador de resoluciones AEPD; consulta directa a la AEPD | No — la recomendación no depende de él |
| 2 | **Pronunciamiento del EDPB sobre Google Fonts** | **No consta.** Las Guidelines 2/2023 **no** lo mencionan | Revisar todas las guidelines/opiniones del EDPB | No |
| 3 | **Qué registra y retiene Google en la Fonts API** (declaración oficial) | **[?]** `fonts.google.com/faq#privacy` es SPA JS; `developers.google.com/fonts/faq/privacy` redirige | Abrir la FAQ en navegador real (Chrome MCP) y leer la sección de privacidad | No — se resuelve auto-hospedando |
| 4 | **Texto oficial de la sentencia LG München I 3 O 17493/20** | **[V] parcial** — verificada vía fuentes jurídicas secundarias alemanas | Texto en `gesetze-bayern.de` o base oficial de jurisprudencia alemana | No |
| 5 | **Estado "activo" de la certificación DPF de Google LLC a día de hoy** | **[?]** — la adhesión la declara Google oficialmente; el estado actual no leído | Consultar ficha de participante en `dataprivacyframework.gov` con navegador | No |
| 6 | **Razón social, NIF, domicilio, email y teléfono del titular** | **[?] — NO TENEMOS** (`progress/current.md:78-83`, `:128-129`) | **Cliente**. Sin esto no hay art. 10 LSSI ni art. 13.1.a RGPD | **SÍ — BLOQUEA LA PUBLICACIÓN** |
| 7 | **¿Vercel ofrece DPA (art. 28) y en qué términos? ¿Retención de logs? ¿Subencargados?** | **[?]** | Leer el DPA y la lista de subencargados de Vercel; verificar su adhesión al DPF | **SÍ** — antes de publicar |
| 8 | **¿El stack Vite/SSG en Vercel introduce cookies o analítica por defecto?** | **[?]** | Cargar el build en un navegador y auditar cookies + peticiones de red | **SÍ** — determina si hace falta banner |
| 9 | **¿El salón usa WhatsApp Business o WhatsApp normal? ¿Con qué términos?** | **[?]** | Cliente + términos de WhatsApp Business aplicables | Parcial — afecta a la redacción |
| 10 | **¿Se reciben datos de salud (alergias, embarazo) por WhatsApp?** | **[?]** — muy probable en este sector **[I]** | Preguntar al cliente por el contenido real de los mensajes | Parcial — activa art. 9 |
| 11 | **¿El salón atiende a menores de 14 años?** | **[?]** | Cliente | Parcial — art. 7 LOPDGDD |
| 12 | **Plazos de conservación de las solicitudes de cita** | **[?]** | Decisión del cliente + criterio de prescripción aplicable | **SÍ** — art. 13.2.a lo exige |
| 13 | **Distinción enlace-pulsado vs. recurso-incrustado confirmada por autoridad** | **[I]** — inferencia propia (§2.4.5) | Pronunciamiento AEPD/EDPB específico sobre hipervínculos a terceros | No |
| 14 | **¿Existe obligación de DPD (art. 37 RGPD / art. 34 LOPDGDD)?** | **[?]** — presumiblemente **no** para un salón **[I]** | Contrastar art. 34 LOPDGDD contra la actividad real | No |

---

## 4. Impacto en el proyecto

### 4.1 Qué EXIGE

| # | Exigencia | Fuente | Momento |
| --- | --- | --- | --- |
| E1 | **Página de política de privacidad** (`/privacidad`) con todo el art. 13.1 y 13.2 | Art. 13 RGPD; art. 11 LOPDGDD; AEPD FAQ-0248 **[V]** | Antes de publicar |
| E2 | **Página de aviso legal** (`/aviso-legal`) con nombre/denominación, domicilio, email, **NIF**, datos registrales si procede | Art. 10 LSSI **[V]** | Antes de publicar |
| E3 | **Información en capa 1 junto al botón de WhatsApp** + enlace a capa 2 | Art. 13.1 ("en el momento en que estos se obtengan") + art. 11 LOPDGDD **[V]** | Feature de reservas |
| E4 | **Enlace a privacidad y aviso legal en el pie**, en todas las páginas ("permanente, fácil, directa y gratuita") | Art. 10 LSSI **[V]** | Layout base |
| E5 | **Auto-hospedar las fuentes**; cero peticiones a `fonts.googleapis.com` / `fonts.gstatic.com` | Decisión de ingeniería sobre base de §2.4 **[I]** | Feature de estilos |
| E6 | **RAT** (documento interno, no web) | Art. 30.5 RGPD; AEPD FAQ-0249 **[V]** | Entregable al cliente |
| E7 | **Contrato de encargo con el hosting** | Art. 28 RGPD **[V]** | Antes de publicar |
| E8 | Informar de que **el canal de contacto es WhatsApp (Meta)** como destinatario/canal | Art. 13.1.e **[V]** | Política de privacidad |

### 4.2 Qué PROHÍBE

| # | Prohibición | Motivo |
| --- | --- | --- |
| P1 | **Publicar la web sin los datos reales del titular** | Art. 10 LSSI + art. 13.1.a RGPD. Confirma `progress/current.md:82` **[V]** |
| P2 | **Casilla "acepto la política de privacidad"** | La información **no se consiente**; AEPD FAQ-0248 **[V]** |
| P3 | **Pedir consentimiento para la reserva** | La base correcta es art. 6.1.b (medidas precontractuales) **[I]** |
| P4 | **Inventar datos en las páginas legales** (NIF ficticio, domicilio de ejemplo) | Un aviso legal falso es peor que ninguno. Coherente con la puerta de build (`progress/current.md:94-97`) **[I]** |
| P5 | **Cargar Google Fonts desde CDN** | §2.4.6 **[I]** |
| P6 | **Banner de cookies "por si acaso"** | Si no hay cookies, un banner es fricción injustificada e informa de tratamientos inexistentes **[I]** |
| P7 | **Pedir más datos de los necesarios** en el mensaje precompuesto | Minimización, art. 5.1.c RGPD **[I]** |

### 4.3 Features que implica

| Feature propuesta | Descripción | Testeable |
| --- | --- | --- |
| `paginas_legales` | `/privacidad` y `/aviso-legal` generadas desde una **fuente de datos única** del titular. **Todo campo del titular es placeholder** → la puerta de build de `progress/current.md:94-97` **debe cubrir estas páginas**. | Sí: test de que el build falla si algún campo legal es placeholder |
| `fuentes_autohospedadas` | `@fontsource` o `@font-face` con WOFF2 locales. | **Sí: test que falla si el HTML/CSS construido contiene `fonts.googleapis.com` o `fonts.gstatic.com`** |
| `sin_terceros` | Verificar que el build no emite peticiones a orígenes externos. | Sí: test sobre el build que detecta URLs de terceros |
| `aviso_privacidad_reserva` | Capa 1 + enlace a `/privacidad` en el punto de composición de la solicitud. | Sí: test de presencia y de que enlaza a `/privacidad` |
| `footer_legal` | Enlaces permanentes en todas las páginas. | Sí: test por página |
| `minimizacion_mensaje_whatsapp` | El mensaje precompuesto pide solo: servicio, fecha/hora preferida y nombre. **No** pedir datos de salud. | Sí: test del *snapshot* del mensaje generado |

### 4.4 Recomendación sobre el orden de trabajo **[I]**

1. **`fuentes_autohospedadas` + `sin_terceros` se pueden hacer YA** — no dependen del cliente y son
   test-ables de forma binaria. Buen candidato a primera feature real.
2. **`paginas_legales` queda BLOQUEADA** hasta que entren los datos del titular, pero **la estructura
   y los tests se pueden escribir ya** (con placeholders que hagan fallar el build).
3. **Añadir a la lista de "lo que debe aportar el cliente"** (`progress/current.md:128-129`), que
   actualmente **está incompleta**: además de teléfono, email, razón social y CIF, faltan
   **plazos de conservación** (#12), **si atiende a menores** (#11) y **qué se recibe por WhatsApp**
   (#10). Y hay dos entregables **no-web** que nadie ha pedido pero que el cliente necesita:
   **RAT** (E6) y **contrato de encargo con el hosting** (E7).

### 4.5 Riesgo señalado al orquestador **[I]**

La decisión 3 (`progress/current.md:65-67`) prevé que *"a futuro"* haya backend para reservas.
**Cuando eso ocurra, este análisis cambia sustancialmente**: habrá recogida directa en servidor,
probablemente datos de salud estructurados (art. 9), posible necesidad de EIPD (art. 35) y de
cifrado. Conviene que quede escrito en el ADR para no repetir la investigación.

---

## 5. Fuentes citadas

**Normativa**
- [RGPD (Reglamento UE 2016/679) — texto consolidado publicado por la AEPD (PDF)](https://www.aepd.es/documento/reglamento-ue-2016-679-consolidado.pdf) — arts. 4.1, 4.2, 4.7, 4.8, 6.1, 13, 30.5, 44
- [RGPD — EUR-Lex CELEX:32016R0679](https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32016R0679) — arts. 2.2.c, 45
- [RGPD — considerandos, BOE DOUE-L-2016-80807](https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807) — considerando 30
- [LO 3/2018, LOPDGDD — BOE-A-2018-16673](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673) — arts. 6, 7, 9, 11, 31
- [Ley 34/2002, LSSI-CE — BOE-A-2002-13758](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758) — arts. 10, 22.2
- [Decisión de Ejecución (UE) 2023/1795 — EU-US Data Privacy Framework](https://eur-lex.europa.eu/eli/dec_impl/2023/1795/oj/eng)
- [Comisión Europea — nota de prensa IP/23/3721 (10/07/2023)](https://ec.europa.eu/commission/presscorner/detail/en/ip_23_3721)

**AEPD**
- [Guía sobre el uso de las cookies — mayo 2024 (PDF)](https://www.aepd.es/guias/guia-cookies.pdf)
- [2.6 El deber de información](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/6-el-deber-de-informacion)
- [FAQ-0247 — ¿Cómo debo cumplir con el deber de informar?](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/6-el-deber-de-informacion/FAQ-0247-como-debo-cumplir-con-el-deber-de-informar)
- [FAQ-0248 — ¿El usuario tiene que dar su consentimiento a la cláusula de privacidad?](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/6-el-deber-de-informacion/FAQ-0248-sobre-si-el-usuario-tiene-que-dar-consentimiento-a-clausula-de-privacidad)
- [FAQ-0249 — ¿Estoy obligado a elaborar un RAT?](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/7-registro-de-actividades-de-tratamiento/FAQ-0249-estoy-obligado-a-elaborar-un-rat)

**EDPB**
- [Guidelines 2/2023 on Technical Scope of Art. 5(3) of ePrivacy Directive, v2.0, adoptadas 07/10/2024 (PDF)](https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf) — aps. 34, 47, 50-51, 54-56

**Jurisprudencia**
- [TJUE, C-582/14, *Breyer*, 19/10/2016](https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:62014CJ0582)
- [TJUE, C-40/17, *Fashion ID*, 29/07/2019](https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:62017CJ0040)
- [LG München I, 20/01/2022, 3 O 17493/20 — referencia en dejure.org](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=3+O+17493/20) *(verificado vía fuentes secundarias; texto oficial no consultado)*

**Google**
- [Google — Data transfer frameworks](https://policies.google.com/privacy/frameworks)
- [Data Privacy Framework — listado de participantes](https://www.dataprivacyframework.gov/list) *(no legible sin navegador)*

**Archivos del proyecto**
- `progress/current.md:52,62,65-67,78-83,94-97,128-129`
- `project-spec.md` (plantilla sin rellenar a fecha de este informe)
