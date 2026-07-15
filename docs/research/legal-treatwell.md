# Informe legal — Republicar reseñas de Treatwell en la web propia

- **Área:** Legal ES/UE (propiedad intelectual, condiciones contractuales, RGPD, competencia desleal)
- **Proyecto:** NailsLashStudioWeb (salón real, Las Rozas de Madrid — web que se publicará)
- **Fecha del informe:** 15 de julio de 2026
- **Estado:** investigación documental sobre fuentes oficiales. No es asesoramiento jurídico firmado por abogado.

> **Convención de este informe:**
> `[VERIFICADO]` = leído literalmente en fuente oficial citada.
> `[INFERENCIA]` = razonamiento propio a partir de fuentes verificadas.
> `[NO VERIFICADO]` = no he podido comprobarlo; requiere acción.

---

## 1. Respuesta ejecutiva

**Qué hacemos: NO republicamos las reseñas de Treatwell en la web propia.** Ni el texto, ni el nombre del reseñador, ni la nota media, ni mediante copia manual, ni mediante scraping, ni mediante captura de pantalla.

**Por qué — hay tres candados independientes, y basta con uno para bloquear:**

1. **Candado contractual (el más duro).** Los Términos Comerciales Treatwell/Empresa Asociada dicen literalmente que el salón **«no tiene ningún derecho sobre las reseñas y respuestas de los Clientes»** (cláusula 4.2) y que Treatwell **«tendrá en todo momento todos los derechos sobre […] el contenido (incluidas las reseñas de clientes)»** (cláusula 9.1). Si el salón tiene contrato con Treatwell, ha aceptado esto. `[VERIFICADO]`

2. **Candado de propiedad intelectual.** La licencia que el cliente otorga sobre su reseña se concede a **«Treatwell S.L. […] y a cualquiera de las sociedades de nuestro grupo y a sus afiliadas»** — el salón **no** está en esa lista. El salón no es cesionario. Y el derecho de cita del art. 32.1 LPI **no** cubre el uso comercial. `[VERIFICADO]`

3. **Candado RGPD.** El nombre del reseñador es dato personal. No tenemos base jurídica para republicarlo en nuestro dominio: no hay consentimiento prestado a nosotros, y el interés legítimo no supera la expectativa razonable del cliente, que escribió para Treatwell y no para nuestra web. `[INFERENCIA]` sobre base verificada.

**Qué hacemos en su lugar (ruta limpia y recomendada):** montar un **sistema propio de testimonios de primera parte**. Pedimos al cliente su testimonio directamente, con consentimiento explícito, informado y revocable, y lo publicamos como contenido nuestro. Esto **no toca Treatwell en absoluto** y elimina los tres candados de golpe: el cliente nos licencia a nosotros directamente, y la licencia que dio a Treatwell es **no exclusiva**, así que conserva derechos para autorizarnos por separado. `[INFERENCIA]` sobre base verificada.

**Enlazar** al perfil público de Treatwell (un `<a href>` de texto, sin copiar contenido) es la única vía de "aprovechar" las reseñas sin reproducirlas. `[INFERENCIA]` — ver §5, tiene matices no verificados.

**Aviso adicional que cambia una decisión técnica:** aunque montemos testimonios propios, **no podemos marcarlos con `aggregateRating`/`Review` de schema.org**. Google declara inelegibles las reseñas autorreferenciadas y prohíbe agregar valoraciones de otras webs. `[VERIFICADO]` — ver §6.

---

## 2. Desarrollo con evidencia

### 2.1 Qué dicen los ToS de Treatwell — los tres documentos que aplican

Treatwell no tiene un único documento. Aplican tres, y hay que leerlos juntos:

| Documento | URL | Última actualización | A quién obliga |
|---|---|---|---|
| Términos y condiciones del Sitio web | https://www.treatwell.es/info/terminos-y-condiciones/ | Abril 2024 `[VERIFICADO]` | A cualquier visitante de treatwell.es (nosotros incluidos) |
| Política de Contenido Generado por el Usuario (CGU) | https://www.treatwell.es/info/politica-contenido-generado-usuario/ | `[NO VERIFICADO]` | Al cliente que escribe la reseña |
| Términos Comerciales Treatwell/Empresa Asociada | https://www.treatwell.es/info/terminos-y-condiciones-para-profesionales/ | Abril 2024 `[VERIFICADO]` | **Al salón** |

**Entidad legal:** «Treatwell Spain s.l. (CIF B-87237293, domicilio: Magallanes 3, 28015 planta 10 - Madrid)».
Fuente: https://www.treatwell.es/info/terminos-y-condiciones/ `[VERIFICADO]`

> ⚠️ **Discrepancia detectada entre documentos oficiales.** Los T&C del sitio dicen «Treatwell Spain s.l.»; la política de CGU dice «Treatwell S.L.»; la política de privacidad dice «Treatwell Spain s.l.u.». Son tres denominaciones distintas. No he podido determinar cuál es la entidad correcta ni si son la misma persona jurídica. `[NO VERIFICADO]` — relevante si algún día hay que dirigir un requerimiento formal.

---

### 2.2 Candado 1 — El contrato de socio: el salón renuncia expresamente a las reseñas

Este es el hallazgo decisivo y el que cierra el debate.

**Cláusula 4.2 «Reseñas y clasificaciones»** — texto literal:

> «usted entiende que las reseñas de clientes pueden contener comentarios negativos sobre usted y sus servicios. **Usted acepta que no tiene ningún derecho sobre las reseñas y respuestas de los Clientes** y que no tiene derecho a recibir copias en caso de cancelación»

**Cláusula 9.1 «Propiedad Intelectual — Nuestra IP»** — texto literal:

> «**tendremos en todo momento todos los derechos** sobre el software, el mercado en línea, la página de asociados y su contenido (**incluidas las reseñas de clientes**)»

Fuente: https://www.treatwell.es/info/terminos-y-condiciones-para-profesionales/ `[VERIFICADO]`

**Lectura:** no es que republicar sea legalmente dudoso. Es que, **si el salón ha firmado el contrato de socio, ha aceptado por escrito que no tiene derecho alguno sobre esas reseñas.** Republicarlas sería un incumplimiento contractual directo, además de una eventual infracción de PI. Y «no tiene derecho a recibir copias en caso de cancelación» confirma que ni siquiera darse de baja de Treatwell libera el contenido. `[INFERENCIA]` sobre cita literal.

**La licencia que Treatwell concede al salón es únicamente sobre el software:**

> «le concedemos una licencia personal, no exclusiva, intransferible y totalmente revocable para utilizar el Software»

`[VERIFICADO]`. Nótese: **«intransferible»** y **«totalmente revocable»**, y su objeto es *el Software*, no el contenido ni las reseñas.

---

### 2.3 Candado 2 — La licencia de CGU no llega al salón

**Cláusula 2.1 de la Política de CGU (versión española)** — texto literal:

> «Por la presente otorga a **Treatwell S.L.** (denominación comercial: Treatwell) **y a cualquiera de las sociedades de nuestro grupo y a sus afiliadas** una licencia no exclusiva, perpetua, transferible y libre de cánones (que incluye el derecho absoluto de sublicencia), para el máximo período de duración de dichos derechos, a utilizar, reproducir y publicar su CGU (incluido, a título no exhaustivo, el derecho a adaptar, alterar, modificar o cambiar su CGU) en cualquier medio o formato (ya sea conocido actualmente o que se invente en el futuro) en todo el mundo sin restricción alguna.»

Fuente: https://www.treatwell.es/info/politica-contenido-generado-usuario/ `[VERIFICADO]`

Equivalente en la versión británica, cláusula 2.1:

> «You hereby grant to Treatwell Limited and any of our group companies and affiliates a non-exclusive, perpetual, irrevocable, transferable, royalty-free licence (including full rights to sub-license) to use, reproduce and publish your UGC […]»

Fuente: https://www.treatwell.co.uk/info/user-generated-content-policy/ `[VERIFICADO]`

**Los beneficiarios de la licencia son una lista cerrada:** Treatwell S.L. + sociedades del grupo + afiliadas. **El salón no aparece.** Un salón asociado es una contraparte comercial, no una «sociedad del grupo» ni una «afiliada» de Treatwell. `[INFERENCIA]` — pero es una inferencia de bajo riesgo: la propia cláusula 4.2 del contrato de socio lo confirma expresamente por la otra vía.

He buscado en los tres documentos una cláusula que permita a salones o terceros reutilizar reseñas fuera del sitio. **No existe.** `[VERIFICADO]` (ausencia comprobada en los tres textos).

**Matiz relevante — el derecho de sublicencia:** la licencia incluye «el derecho absoluto de sublicencia». Es decir, **Treatwell sí podría, si quisiera, sublicenciarnos las reseñas.** Ésa es la única vía contractual legítima para republicarlas: **pedírselo a Treatwell por escrito y obtener autorización escrita.** No es automática y no debe presumirse. `[INFERENCIA]` sobre cita literal.

**Cláusula 1.4 — «no confidencial y sin derechos de propiedad»:**

> «Tenga en cuenta que cualquier CGU que usted remita a nuestro Sitio web será considerado no confidencial y sin derechos de propiedad.»

`[VERIFICADO]`. ⚠️ **Cuidado con malinterpretar esto como "es de dominio público".** No lo es. Es una cláusula de descargo frente a reclamaciones de confidencialidad del *autor* hacia *Treatwell*; no crea derechos a favor de terceros. `[INFERENCIA]`

---

### 2.4 Candado 2b — Los T&C del sitio web prohíben el uso comercial y el scraping

**Punto 7 «Propiedad intelectual»** de los T&C del sitio:

- Uso permitido: «Usted solamente podrá visualizar, imprimir, utilizar, citar y mencionar el Sitio web» — **para uso personal no comercial con atribución**.
- Uso prohibido: no «reproducir, modificar, mostrar, ejecutar, publicar, distribuir» **con fines comerciales sin consentimiento escrito**.
- «Nos reservamos expresamente todos los derechos de propiedad intelectual sobre el Sitio web y sobre los Materiales»

**Prohibición de scraping** — texto literal:

> «Usted no deberá… utilizar o instar a otros a utilizar ningún sistema automatizado o software para extraer contenido o datos de este Sitio web ("screen scraping"), salvo en aquellos casos en los que usted o cualquier tercero pertinente haya suscrito un acuerdo escrito de licencia directamente con nosotros que permita expresamente dicha actividad»

Fuente: https://www.treatwell.es/info/terminos-y-condiciones/ `[VERIFICADO]`

**Lectura:** una web comercial de salón es, por definición, un fin comercial. La licencia de «uso personal no comercial» no nos ampara. Y cualquier automatización para extraer las reseñas está expresamente prohibida salvo acuerdo escrito. Esto **descarta también** herramientas de scraping de terceros (existe, por ejemplo, un «Treatwell Search Scraper» en Apify — usarlo nos pondría en incumplimiento directo de esta cláusula). `[INFERENCIA]` sobre cita literal.

---

### 2.5 Candado 2c — Propiedad intelectual: el texto es del cliente, no de nadie más

**El autor es el cliente.** Art. 5 TRLPI (Real Decreto Legislativo 1/1996):

> «Se considera autor a la persona natural que crea alguna obra literaria, artística o científica.»

**La reseña puede ser obra protegida.** Art. 10 TRLPI:

> «Son objeto de propiedad intelectual todas las creaciones originales literarias, artísticas o científicas expresadas por cualquier medio o soporte, tangible o intangible, actualmente conocido o que se invente en el futuro, comprendiéndose entre ellas: a) Los libros, folletos, impresos, epistolarios, escritos, discursos y alocuciones, conferencias, informes forenses…»

**Reproducir requiere autorización.** Art. 17 TRLPI:

> «Corresponde al autor el ejercicio exclusivo de los derechos de explotación de su obra en cualquier forma y, en especial, los derechos de reproducción, distribución, comunicación pública y transformación, que no podrán ser realizadas sin su autorización…»

Fuente: https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930 `[VERIFICADO]`

**El derecho de cita NO nos salva.** Art. 32.1, párrafo primero, TRLPI — texto literal:

> «Es lícita la inclusión en una obra propia de fragmentos de otras ajenas de naturaleza escrita, sonora o audiovisual, así como la de obras aisladas de carácter plástico o fotográfico figurativo, siempre que se trate de obras ya divulgadas y su inclusión se realice a título de cita o para su análisis, comentario o juicio crítico. **Tal utilización solo podrá realizarse con fines docentes o de investigación**, en la medida justificada por el fin de esa incorporación e indicando la fuente y el nombre del autor de la obra utilizada.»

Fuente: https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930 `[VERIFICADO]`

**Éste es el punto clave y donde mucha gente se equivoca.** El derecho de cita español está limitado a **fines docentes o de investigación**. Publicar testimonios en la web comercial de un salón para atraer clientes es marketing, no docencia ni investigación. **El art. 32.1 no ampara la republicación.** `[INFERENCIA]` sobre texto literal — inferencia de bajo riesgo, la limitación es explícita.

**Matiz honesto a favor:** una reseña muy corta y banal («Muy bien, repetiré») probablemente **carece de originalidad** y por tanto no sería obra protegida por el art. 10. `[INFERENCIA]`. Pero esto **no desbloquea nada**, porque: (a) el candado contractual 4.2 sigue aplicando con independencia de la PI; (b) el candado RGPD sigue aplicando sobre el nombre; (c) determinar caso por caso si cada reseña alcanza el umbral de originalidad es un análisis jurídico que no podemos hacer a escala. No es una vía practicable.

**Sobre la nota media / número de reseñas:** los datos numéricos aislados no son obra protegida `[INFERENCIA]`, pero (a) la cláusula 9.1 del contrato de socio atribuye a Treatwell «todos los derechos» sobre el contenido, (b) podría existir un derecho *sui generis* de base de datos (arts. 133 y ss. TRLPI — **`[NO VERIFICADO]`**, no he leído el texto), y (c) Google prohíbe expresamente agregar valoraciones de otras webs (§6). **No mostramos la nota de Treatwell.**

---

### 2.6 Candado 3 — RGPD: el nombre del reseñador es dato personal

**Hecho de partida.** El nombre que acompaña a la reseña identifica a una persona física → es dato personal (art. 4.1 RGPD). Publicarlo en nuestro dominio es un **tratamiento nuevo**, con **nosotros como responsables**, distinto del tratamiento que hace Treatwell. `[INFERENCIA]` — inferencia de bajo riesgo.

**Qué dice la política de privacidad de Treatwell:**

> «Cualquier dato personal que cargues en áreas públicamente visibles de la Plataforma (como secciones de reseñas) puede ser recogido por terceros»

Fuente: https://www.treatwell.es/info/politica-de-privacidad/ `[VERIFICADO]`

⚠️ **Esto es una advertencia de riesgo al usuario, NO una autorización a terceros para tratar esos datos.** Que Treatwell avise al cliente de que terceros *pueden* recoger sus datos no legitima que nosotros lo hagamos. `[INFERENCIA]`

**Análisis de base jurídica (art. 6.1 RGPD) para republicar nombre + reseña:**

| Base | ¿Sirve? | Razonamiento |
|---|---|---|
| 6.1.a Consentimiento | ❌ hoy no | El cliente consintió publicar en *Treatwell*, no en *nuestra* web. El consentimiento debe ser específico e informado para cada finalidad. `[INFERENCIA]` |
| 6.1.b Contrato | ❌ | Republicar un testimonio no es necesario para ejecutar el contrato de servicio de manicura. `[INFERENCIA]` |
| 6.1.f Interés legítimo | ❌ (falla el test) | Nuestro interés (marketing) es real, pero **falla la expectativa razonable**: el cliente no espera que su nombre aparezca en la web comercial del salón. Además el tratamiento no es *necesario* — existe alternativa menos invasiva evidente: pedírselo. `[INFERENCIA]` |
| 6.1.a Consentimiento **recabado por nosotros** | ✅ | Es la vía. Explícito, informado, granular, revocable. `[INFERENCIA]` |

**Restricción adicional del contrato de socio sobre datos de clientes** — texto literal:

> «Al utilizar los Servicios, solo debe enviar comunicaciones a los Clientes que hayan dado su consentimiento expreso y estas deben cumplir con el RGPD»

Fuente: https://www.treatwell.es/info/terminos-y-condiciones-para-profesionales/ `[VERIFICADO]`

⚠️ **Consecuencia práctica poco obvia:** esto significa que **ni siquiera podemos escribir libremente a los clientes de Treatwell para pedirles su testimonio**, salvo que hayan dado consentimiento expreso de marketing. Si el cliente llegó vía Treatwell y no dio ese consentimiento, contactarle para pedirle un testimonio sería a su vez un incumplimiento. `[INFERENCIA]` — **relevante para el diseño de la captación de testimonios: hay que recabarlos en el salón, presencialmente o por un canal propio, no minando la base de Treatwell.**

**Derecho al olvido:** si publicamos testimonios propios, cualquier cliente puede ejercer supresión (art. 17 RGPD) y debemos poder retirar el testimonio. Esto **es un requisito de producto**, no un detalle. `[INFERENCIA]`

---

### 2.7 ¿Existe widget oficial, API o programa de partners para mostrar reseñas?

**Respuesta corta: no he encontrado ninguna herramienta oficial de Treatwell para mostrar reseñas en la web propia.**

**El widget de Treatwell existe, pero es de RESERVAS, no de reseñas.** Cláusula 2.2.2 «Widget» del contrato de socio describe dos tipos: `[VERIFICADO]`

1. Widget de reservas de prepago
2. Widget de reservas de pago posterior

Ambos permiten a clientes «reservar y pagar en línea» o «reservar en línea sin pagar por adelantado». **Ninguno muestra reseñas.**

Texto literal sobre el widget:

> «El widget y la página de asociados están "desarrollados por Treatwell" y contendrán nuestra marca (incluyendo logos, marcas registradas, imágenes)»

Fuente: https://www.treatwell.es/info/terminos-y-condiciones-para-profesionales/ `[VERIFICADO]`

**Sobre la API:** existen referencias a «Treatwell APIs» en agregadores de terceros (apitracker.io) y una integración con software de gestión de salones (Salonized), pero:
- La integración de Salonized es de **sincronización de agenda/reservas**, y su propia documentación indica que está disponible solo en Países Bajos, Bélgica, Alemania, Suiza y Reino Unido — **no España**. `[VERIFICADO]` vía https://help.salonized.com/en/articles/6287754-what-is-the-treatwell-integration
- **No he encontrado documentación oficial de Treatwell de una API pública de reseñas.** `[NO VERIFICADO]` — ausencia de evidencia, no evidencia de ausencia. Requiere preguntar al gestor de cuenta.

**Revisión de la página oficial de partners** (https://www.treatwell.co.uk/partners/): las funcionalidades listadas son gestión de citas, descubrimiento de clientes, pagos contactless, marketing y protección contra no-shows. **Ninguna mención a widget, API o badge de reseñas para web externa.** `[VERIFICADO]`

> ⚠️ **Contraste importante con la competencia:** Google Business Profile y Trustpilot **sí** ofrecen widgets oficiales de reseñas. Treatwell, por lo que he podido verificar, **no**. Esto no es un descuido nuestro en la búsqueda: es coherente con su modelo de negocio — las reseñas son el activo que retiene a los salones en su marketplace, y la cláusula 4.2 («no tiene ningún derecho sobre las reseñas») está deliberadamente redactada para que no salgan de ahí. `[INFERENCIA]`

**Restricción relacionada, en dirección contraria:**

> «no incluir datos de contacto, referencias directas o enlaces a su página web, aplicación o cualquier otra plataforma en la página de socio»
> «no solicitar a los Clientes que hagan reservas a través de otros medios que no sean el mercado en línea o el widget»

`[VERIFICADO]`. Es decir: Treatwell prohíbe enlazar **desde** su perfil **hacia** nuestra web, y prohíbe desviar reservas fuera de su canal. `[INFERENCIA]`: esto refuerza que el modelo de Treatwell es cerrado y que no debemos esperar cooperación para sacar contenido.

---

### 2.8 Competencia desleal: reglas sobre reseñas (aplican a nuestros testimonios propios)

Aunque montemos testimonios propios, quedamos sujetos a las reglas de reseñas introducidas por la Directiva Omnibus (UE) 2019/2161.

**Derecho español — Ley 3/1991 de Competencia Desleal, art. 27 «Otras prácticas engañosas»**, apartados añadidos por el art. 84.3 del Real Decreto-ley 24/2021, en vigor desde el **28 de mayo de 2022**:

> **Apartado 7:** «Afirmen que las reseñas de un bien o servicio son añadidas por consumidores y usuarios que han utilizado o adquirido realmente el bien o servicio, sin tomar medidas razonables y proporcionadas para comprobar que dichas reseñas pertenezcan a tales consumidores y usuarios.»

> **Apartado 8:** «Añadan o encarguen a otra persona física o jurídica que incluya reseñas o aprobaciones de consumidores falsas, o distorsionen reseñas de consumidores o usuarios o aprobaciones sociales con el fin de promocionar bienes o servicios.»

Fuente: https://www.boe.es/buscar/act.php?id=BOE-A-1991-628 `[VERIFICADO]`

**Derecho de la UE — Directiva 2005/29/CE, Anexo I** (prácticas desleales en cualquier circunstancia), versión consolidada tras la Omnibus:

> **Punto 23 ter:** «Afirmar que las reseñas de un producto son añadidas por consumidores que han utilizado o adquirido realmente el producto, sin tomar medidas razonables y proporcionadas para comprobar que dichas reseñas pertenezcan a tales consumidores.»

> **Punto 23 quater:** «Añadir o encargar a otra persona física o jurídica que añada reseñas o aprobaciones de consumidores falsas, o distorsionar reseñas de consumidores o aprobaciones sociales con el fin de promocionar productos.»

> **Art. 7, apartado 6:** «Cuando un comerciante facilite el acceso a las reseñas de los consumidores sobre los productos, se considerará esencial la información acerca de si el comerciante garantiza que las reseñas publicadas pertenezcan a consumidores que hayan realmente utilizado o adquirido el producto.»

Fuente: https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:02005L0029-20220528 `[VERIFICADO]`

**Consecuencias directas para nuestros testimonios propios** `[INFERENCIA]` sobre texto literal:

1. **Prohibido seleccionar solo los positivos si afirmamos que reflejan la opinión de los clientes** — «distorsionar reseñas […] con el fin de promocionar» (art. 27.8). Un carrusel curado de solo 5 estrellas presentado como "lo que dicen nuestros clientes" es terreno peligroso.
2. **Si afirmamos que son de clientes reales, debemos poder demostrarlo** con medidas razonables de verificación (art. 27.7). Hay que guardar la trazabilidad: quién, cuándo, qué servicio, prueba del consentimiento.
3. **Debemos informar** de si garantizamos que provienen de clientes reales y cómo lo verificamos (art. 7.6 de la Directiva). Esto es **una obligación de transparencia con contenido en la propia página**, no letra pequeña.
4. **Prohibido inventarlos o encargar a terceros que los inventen** (art. 27.8). Obvio, pero conviene dejarlo escrito: nada de testimonios de relleno, ni siquiera de placeholder, en la web publicada.

> ⚠️ **Riesgo concreto y muy real para este proyecto:** si durante el desarrollo ponemos testimonios de ejemplo («María G. — ¡Encantada!») y **se publican por olvido**, eso es literalmente el art. 27.8 LCD. **Los datos de ejemplo deben ser inequívocamente falsos en apariencia (p. ej. "Lorem Ipsum") o el build de producción debe fallar si el array de testimonios contiene fixtures.** Esto es una puerta de calidad, no una recomendación.

---

## 3. Lo que NO he podido verificar

| # | Afirmación / hueco | Por qué importa | Qué haría falta para verificarlo |
|---|---|---|---|
| 1 | **Si el salón tiene efectivamente contrato de socio con Treatwell y qué versión aceptó** | Todo el candado contractual (§2.2) depende de esto. Si no hay contrato, aplican solo los candados de PI y RGPD (que ya bastan para bloquear, pero el análisis cambia) | Preguntar al cliente/dueña; localizar el contrato firmado y su fecha; comparar con la versión de abril 2024 |
| 2 | **Fecha de última actualización de la Política de CGU (ES)** | Las cláusulas citadas podrían haber cambiado | Revisar el pie del documento en treatwell.es; guardar copia sellada con fecha |
| 3 | **Discrepancia de denominación social:** «Treatwell Spain s.l.» vs «Treatwell S.L.» vs «Treatwell Spain s.l.u.» | Determinar la entidad correcta si hay que dirigir un requerimiento o solicitud formal | Consulta al Registro Mercantil por CIF B-87237293; o vía https://www.treatwell.es/info/consultas-legales/ |
| 4 | **Si existe alguna API/widget/badge oficial de reseñas de Treatwell no documentado públicamente** | Si existiera, sería la vía legítima y cambiaría la recomendación | Preguntar por escrito al gestor de cuenta de Treatwell o a https://www.treatwell.es/info/consultas-legales/. Conservar la respuesta |
| 5 | **Si Treatwell concedería una sublicencia escrita para republicar reseñas** | La cláusula 2.1 CGU incluye «derecho absoluto de sublicencia» → es jurídicamente posible | Solicitud formal por escrito a Treatwell. `[INFERENCIA]`: improbable que la concedan, va contra su modelo, pero el coste de preguntar es cero |
| 6 | **Si enlazar desde nuestra web al perfil público de Treatwell está permitido** | Es la alternativa de mínimo riesgo que propongo en §5 | Releer T&C del sitio en busca de cláusula de enlaces/framing; consultar a Treatwell. `[INFERENCIA]`: el enlace de texto simple no reproduce obra y es práctica estándar, pero **no lo he verificado en los T&C** |
| 7 | **Texto del derecho *sui generis* de base de datos (arts. 133 y ss. TRLPI)** | Afectaría a extraer conjuntos de datos (notas, número de reseñas) aunque no sean obra | Leer el texto consolidado en BOE-A-1996-8930 |
| 8 | **Si la política de privacidad de Treatwell impone obligaciones al salón como corresponsable sobre datos de reseñas** | Podría añadir obligaciones nuestras | Lectura completa del DPA de socios de Treatwell (mencionado en la política de privacidad) |
| 9 | **Contenido íntegro de las «Directrices de reseñas» / Review Guidelines en versión española** | Solo he verificado la versión británica (https://www.treatwell.co.uk/info/community-guidelines/) | Localizar equivalente en treatwell.es |
| 10 | **Validación por abogado español colegiado** | Este informe es investigación documental, no dictamen | Revisión por abogado de PI/protección de datos antes de publicar la web |
| 11 | **Cifras concretas del salón** (nº de reseñas, nota media en Treatwell) | No las he consultado ni las necesito — no vamos a usarlas | N/A — deliberadamente fuera de alcance |

---

## 4. Impacto en el proyecto

### 4.1 Qué PROHÍBE (reglas duras — bloqueantes)

| ❌ Prohibido | Fundamento |
|---|---|
| Copiar/pegar texto de reseñas de Treatwell en la web | Contrato socio 4.2 + 9.1; art. 17 TRLPI |
| Publicar el nombre del reseñador de Treatwell | RGPD art. 6 (sin base jurídica) |
| Scraping o automatización de extracción de treatwell.es | T&C del sitio, punto de «screen scraping» |
| Usar scrapers de terceros (Apify u otros) sobre Treatwell | Ídem — «utilizar o instar a otros a utilizar» |
| Capturas de pantalla de reseñas de Treatwell | Reproducción de obra (art. 17 TRLPI) + marca + RGPD |
| Mostrar la nota media / nº de reseñas de Treatwell | Contrato socio 9.1; política de Google (§6) |
| Marcar con `aggregateRating`/`Review` de schema.org | Política de Google — inelegible y prohibido agregar de otras webs |
| Publicar testimonios inventados o de ejemplo | Art. 27.8 LCD — práctica desleal en cualquier circunstancia |
| Presentar una selección curada de positivos como "opinión de nuestros clientes" | Art. 27.8 LCD — «distorsionar reseñas» |
| Escribir a clientes de Treatwell sin consentimiento expreso para pedir testimonio | Contrato socio — comunicaciones solo con consentimiento expreso |

### 4.2 Qué EXIGE (si implementamos testimonios propios)

1. **Consentimiento explícito, informado y documentado** por cada testimonio, antes de publicar. Prueba conservada (fecha, medio, texto exacto de la cláusula aceptada).
2. **Nombre mostrado con minimización de datos:** preferible «María G.» o solo nombre de pila, y **solo** con la granularidad que el cliente autorizó expresamente. `[INFERENCIA]`
3. **Mecanismo de retirada operativo** (art. 17 RGPD). Un testimonio debe poder despublicarse rápido, sin desplegar código si es posible.
4. **Trazabilidad de autenticidad:** registro de que el testimonio corresponde a un cliente real de un servicio real (art. 27.7 LCD).
5. **Transparencia visible en la página:** declarar si garantizamos que son de clientes reales y cómo lo verificamos (art. 7.6 Directiva 2005/29/CE).
6. **Política de privacidad propia** que informe del tratamiento «publicación de testimonios» con su base jurídica (consentimiento) y el derecho de retirada.
7. **No mezclar** testimonios propios con contenido de Treatwell, ni sugerir visualmente que proceden de Treatwell (sería aprovechamiento indebido de su marca `[INFERENCIA]`).

### 4.3 Features que implica

| Feature | Descripción | Prioridad |
|---|---|---|
| `testimonios-propios` | Modelo de datos de testimonio: `id`, `nombre_mostrado`, `texto`, `servicio`, `fecha_servicio`, `fecha_consentimiento`, `prueba_consentimiento`, `publicado`, `fecha_retirada` | Alta |
| `consentimiento-testimonio` | Flujo de captación con texto de consentimiento explícito, informado, granular y revocable. **Captación presencial en salón o canal propio** — nunca sobre la base de Treatwell | Alta |
| `retirada-testimonio` | Despublicación inmediata a petición del cliente (art. 17 RGPD). Idealmente sin redeploy | Alta |
| `guard-testimonios-fixture` | **Puerta de build**: el build de producción falla si hay testimonios de ejemplo/fixture en el array publicado. Previene el riesgo del art. 27.8 LCD | Alta |
| `aviso-autenticidad-resenas` | Bloque visible que declara el origen y la verificación de los testimonios (art. 7.6 Directiva) | Media |
| `enlace-perfil-treatwell` | Enlace de texto simple al perfil público, sin copiar contenido. **Sujeto a verificar hueco #6** | Baja |
| `politica-privacidad` | Debe cubrir la finalidad «publicación de testimonios» | Alta (ya necesaria por otros motivos) |

### 4.4 Decisión sobre schema.org — importante y contraintuitiva `[VERIFICADO]`

Política de Google sobre review snippets:

> «If the entity that's being reviewed controls the reviews about itself, their pages that use `LocalBusiness` or any other type of `Organization` structured data are ineligible for star review feature.»

Aplica cuando «a review about entity A is placed on the website of entity A, either directly in their structured data or through an embedded third-party widget».

Y explícitamente:

> «Don't aggregate reviews or ratings from other websites.»

Fuente: https://developers.google.com/search/docs/appearance/structured-data/review-snippet `[VERIFICADO]`

**Conclusión:** los testimonios propios **se muestran como contenido visual normal, sin marcado `Review`/`aggregateRating`**. No obtendremos estrellas en resultados de búsqueda por esta vía — **y perseguirlo activamente sería contraproducente** (riesgo de acción manual por spam de datos estructurados `[INFERENCIA]`). Las estrellas en Google se ganan por **Google Business Profile**, que es un canal distinto y legítimo. `[INFERENCIA]`

> **Recomendación estratégica derivada:** si el objetivo real de negocio es "tener estrellas y prueba social visible en Google", la respuesta correcta **no es Treatwell** — es **Google Business Profile**, que sí tiene ficha propia, sí alimenta las estrellas en el buscador y sí tiene herramientas oficiales. Merece un informe aparte. `[INFERENCIA]`

---

## 5. Alternativas legítimas, ordenadas por riesgo

| Opción | Riesgo | Valoración |
|---|---|---|
| **A. Testimonios propios con consentimiento** | Bajo | ✅ **Recomendada.** Contenido nuestro, control total, sin dependencia de Treatwell. La licencia del cliente a Treatwell es **no exclusiva** → el cliente conserva derechos y puede autorizarnos por separado `[INFERENCIA]` |
| **B. Enlace de texto al perfil de Treatwell** | Bajo-medio | ✅ Complementaria. No reproduce contenido. **Sujeta al hueco #6** |
| **C. Pedir sublicencia escrita a Treatwell** | Bajo (si la conceden) | 🟡 Coste cero preguntar. `[INFERENCIA]`: improbable que la concedan |
| **D. Potenciar Google Business Profile** | Bajo | ✅ Vía correcta para estrellas en buscador. Requiere informe propio |
| **E. Republicar reseñas de Treatwell** | **Alto** | ❌ **Descartada.** Incumplimiento contractual + PI + RGPD |
| **F. Scraping** | **Muy alto** | ❌ **Descartada.** Prohibición expresa en T&C |

**Nota sobre la opción A y el candado del §2.6:** la captación de testimonios debe hacerse **en el salón** (presencialmente, QR en mostrador, o sobre clientes propios que no vinieron por Treatwell). **No** enviando comunicaciones a la base de clientes de Treatwell sin consentimiento expreso de marketing. Este matiz es fácil de pasar por alto y es la trampa más probable de este diseño. `[INFERENCIA]`

---

## 6. Fuentes consultadas

**Treatwell (oficiales):**
- https://www.treatwell.es/info/terminos-y-condiciones/ — T&C del sitio (abril 2024)
- https://www.treatwell.es/info/politica-contenido-generado-usuario/ — Política de CGU (ES)
- https://www.treatwell.es/info/terminos-y-condiciones-para-profesionales/ — Términos Comerciales Socio (abril 2024)
- https://www.treatwell.es/info/politica-de-privacidad/ — Política de privacidad y cookies
- https://www.treatwell.co.uk/info/user-generated-content-policy/ — UGC Policy (UK, contraste)
- https://www.treatwell.co.uk/partners/ — Página de partners
- https://www.treatwell.es/info/consultas-legales/ — Canal de consultas legales (no consultado aún)

**Normativa (oficiales):**
- https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930 — TRLPI (RDLeg 1/1996) — arts. 5, 10, 17, 32.1
- https://www.boe.es/buscar/act.php?id=BOE-A-1991-628 — Ley 3/1991 Competencia Desleal — art. 27.7 y 27.8
- https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:02005L0029-20220528 — Directiva 2005/29/CE consolidada — Anexo I 23 ter/quater, art. 7.6
- https://boe.es/buscar/act.php?id=BOE-A-2021-17910 — RDL 24/2021 (transposición Omnibus)

**Plataforma:**
- https://developers.google.com/search/docs/appearance/structured-data/review-snippet — Política de review snippets

**Terceros (contexto, no normativos):**
- https://help.salonized.com/en/articles/6287754-what-is-the-treatwell-integration — integración Treatwell/Salonized (no disponible en España)

---

## 7. Conclusión en una frase

Las reseñas de Treatwell **no son nuestras** — lo dice el propio contrato que el salón firmó con ellos (cláusula 4.2), lo confirma la licencia de CGU que no nos incluye, y lo rematan la LPI y el RGPD; **no hay widget ni API oficial** que lo resuelva; **la solución es construir testimonios propios con consentimiento**, sin marcado `Review` de schema.org, y llevar la ambición de "estrellas en Google" al canal que corresponde, que es Google Business Profile.
