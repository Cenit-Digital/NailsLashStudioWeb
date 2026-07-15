# Legal ES/UE — LSSI-CE art. 10 e información precontractual (TRLGDCU)

**Fecha de investigación:** 2026-07-15
**Área:** Legal ES/UE
**Autor:** subagente de investigación
**Fuente primaria:** textos consolidados del BOE, obtenidos vía la **API oficial de datos abiertos del BOE**
(`https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/<ID>/texto/bloque/<bloque>`), que devuelve el
articulado versionado. **Todas las citas de este informe son de la versión VIGENTE**, no de la redacción original.

> **Nota metodológica.** Las páginas HTML del BOE se truncan al recuperarlas y devuelven articulado incompleto o
> desactualizado. Por eso he usado la API de datos abiertos, que expone cada artículo con sus `fecha_vigencia`.
> Para cada precepto he extraído **la última versión** y la indico expresamente. Esto importa: la letra concreta
> del tipo infractor de la LSSI **ha cambiado** respecto a la redacción de 2002 que sigue circulando en blogs
> jurídicos (ver §2.5.1).

---

## 1. Respuesta ejecutiva

**Qué hacemos:**

1. **La web necesita un aviso legal.** La web de un salón real es un "servicio de la sociedad de la información"
   (Anexo a) LSSI: el concepto alcanza a servicios *no remunerados por el destinatario* "en la medida en que
   constituyan una actividad económica para el prestador"). Por tanto **el art. 10 LSSI es de aplicación aunque la
   web sea un escaparate sin reservas online**.
2. **Enlace permanente en el pie de TODAS las páginas.** El art. 10.2 dice que la obligación se cumple incluyendo
   la información en el sitio web "en las condiciones señaladas en el apartado 1", y el apartado 1 exige acceso
   **"permanente, fácil, directa y gratuita"**. La ley **no** obliga a que la página se llame "Aviso legal"
   (eso es práctica de mercado, no norma).
3. **BLOQUEANTE DE PUBLICACIÓN: faltan el NIF y la denominación/nombre del titular, y un email de contacto.** El
   art. 10.1.a) y 10.1.e) los exige. **No son inventables ni deducibles.** Sin ellos la web no se puede publicar.
   Esto confirma y eleva el ítem 10 de `docs/research/datos-treatwell-ficha.md:186`.
4. **El riesgo económico grande está en los PRECIOS, no en el aviso legal.** Publicar precios sin indicar si
   incluyen impuestos incumple el art. 10.1.f), tipificado como infracción **GRAVE** (art. 38.3.b LSSI):
   **30.001 – 150.000 €**. Los demás datos identificativos son infracción **LEVE** (hasta 30.000 €). Como el
   proyecto va a publicar un catálogo de 43 servicios con precios, **este es el punto de mayor exposición**.
5. **Hallazgo sobre la web actual (verificado hoy):** el pie de `https://www.nailslashlasrozas.es/` enlaza a
   `/es/aviso-legal`, y esa URL **devuelve HTTP 404**. La web que hoy está publicada **no tiene aviso legal
   accesible**: es un incumplimiento vivo del art. 10 LSSI. La web nueva no debe heredarlo.

**Por qué importa más de lo que parece:** tanto el art. 60.5 como el art. 20.5 TRLGDCU ponen **la carga de la
prueba del cumplimiento informativo sobre el empresario**, y el art. 51.7 TRLGDCU extiende esa carga
**al procedimiento sancionador**. En la práctica: si no consta que se informó, se presume que no se informó.
Por eso la información no puede ser "obvia del contexto": tiene que estar escrita y ser demostrable.

---

## 2. Desarrollo con evidencia

### 2.1 ¿Aplica la LSSI a una web de salón que no vende online?

**Sí.** (a) Hecho verificado.

Anexo, letra a) LSSI — versión vigente desde **2025-01-23**
([API BOE, bloque `an`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2002-13758/texto/bloque/an)):

> a) "Servicios de la sociedad de la información" o "servicios": todo servicio prestado normalmente a título
> oneroso, a distancia, por vía electrónica y a petición individual del destinatario.
> **El concepto de servicio de la sociedad de la información comprende también los servicios no remunerados por
> sus destinatarios, en la medida en que constituyan una actividad económica para el prestador de servicios.**

Art. 2.1 LSSI — vigente desde **2002-10-12**
([API BOE, bloque `a2`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2002-13758/texto/bloque/a2)):

> 1. Esta Ley será de aplicación a los prestadores de servicios de la sociedad de la información establecidos en
> España y a los servicios prestados por ellos.

**(b) Inferencia mía:** una web que promociona el catálogo y los precios de un salón comercial en activo
constituye "una actividad económica para el prestador" aunque el visitante no pague por navegar. Es la lectura
literal del Anexo a). No he localizado jurisprudencia que la contradiga, pero **no la he buscado
sistemáticamente**: lo declaro como inferencia sólida, no como hecho verificado.

### 2.2 Art. 10.1 LSSI, letra por letra, aplicado a este proyecto

**Texto vigente desde 2014-05-11** (última modificación: disposición final 2.1 de la Ley 9/2014, sobre la letra f)
([API BOE, bloque `a10`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2002-13758/texto/bloque/a10) ·
[versión navegable](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758#a10)).

Encabezado del apartado 1 (literal):

> 1. Sin perjuicio de los requisitos que en materia de información se establecen en la normativa vigente, el
> prestador de servicios de la sociedad de la información estará obligado a disponer de los medios que permitan,
> tanto a los destinatarios del servicio como a los órganos competentes, **acceder por medios electrónicos, de
> forma permanente, fácil, directa y gratuita**, a la siguiente información:

| Letra | Texto literal (extracto) | ¿Aplica a Nails Lash Studio? | Estado del dato |
|---|---|---|---|
| **a)** | "Su nombre o denominación social; su residencia o domicilio o, en su defecto, la dirección de uno de sus establecimientos permanentes en España; **su dirección de correo electrónico** y cualquier otro dato que permita establecer con él una comunicación directa y efectiva." | **SÍ — siempre** | ❌ **BLOQUEANTE.** No tenemos denominación ni email (`datos-treatwell-ficha.md:36`, `:181`). El domicilio del local sí (`Av. Atenas 75, C.C. El Zoco, Local 41, 28232 Las Rozas`), pero **no consta si coincide con el domicilio del titular** |
| **b)** | "Los datos de su inscripción en el Registro Mercantil en el que, **en su caso**, se encuentren inscritos o de aquel otro registro público en el que lo estuvieran para la adquisición de personalidad jurídica o a los solos efectos de publicidad." | **Condicional.** Solo si el titular está inscrito. Si es autónoma persona física, normalmente **no aplica** | ❓ Forma jurídica desconocida |
| **c)** | "En el caso de que su actividad estuviese sujeta a un régimen de **autorización administrativa previa**, los datos relativos a dicha autorización y los identificativos del órgano competente encargado de su supervisión." | **Probablemente NO** — ver §2.3 | ❓ Ver §2.3 |
| **d)** | "Si ejerce una **profesión regulada** deberá indicar: 1.º Los datos del Colegio profesional… 2.º El título académico oficial o profesional… 3.º El Estado de la UE o del EEE en el que se expidió dicho título… 4.º Las normas profesionales aplicables…" | **Probablemente NO** | ❓ **NO VERIFICADO**: no he comprobado si la estética/manicura es profesión regulada en España |
| **e)** | "**El número de identificación fiscal** que le corresponda." | **SÍ — siempre** | ❌ **BLOQUEANTE.** No lo tenemos |
| **f)** | "Cuando el servicio de la sociedad de la información **haga referencia a precios**, se facilitará información **clara y exacta sobre el precio** del producto o servicio, **indicando si incluye o no los impuestos aplicables** y, en su caso, sobre los gastos de envío." | **SÍ** — el catálogo lleva precios | ⚠️ **RIESGO ALTO.** Los 39 precios verificados de Treatwell **no indican si incluyen IVA**. Ver §2.5.1 |
| **g)** | "Los códigos de conducta a los que, **en su caso**, esté adherido y la manera de consultarlos electrónicamente." | **Condicional** | ❓ Desconocido |

Apartado 2 (literal) — **dónde ponerlo**:

> 2. La obligación de facilitar esta información se dará por cumplida si el prestador la incluye **en su página o
> sitio de Internet** en las condiciones señaladas en el apartado 1.

**(b) Inferencia mía sobre la ubicación:** la norma **no nombra** ninguna página "Aviso legal" ni obliga a un
formato concreto. Lo que obliga es a que el acceso sea *permanente, fácil, directo y gratuito*. De ahí deduzco:

- **Enlace en el pie de todas las páginas** (no solo en la home) → satisface "permanente" y "fácil".
- **Sin muro de cookies, registro ni pago** → satisface "gratuita" y "directa".
- **La letra f) NO se satisface metiendo el IVA en el aviso legal.** El precepto se activa "cuando el servicio…
  haga referencia a precios", así que la mención a impuestos debe ir **donde están los precios** (la página de
  catálogo), no escondida en un documento legal aparte. Esta es una inferencia mía de la literalidad del tipo,
  pero es la lectura conservadora y la que reduce el riesgo del art. 38.3.b).

### 2.3 ¿Está el salón sujeto a autorización administrativa previa? (art. 10.1.c)

**(a) Hecho verificado — probablemente NO**, lo que haría **inaplicable** la letra c).

Ley 12/2012, de 26 de diciembre, de medidas urgentes de liberalización del comercio y de determinados servicios
([BOE-A-2012-15595](https://www.boe.es/buscar/act.php?id=BOE-A-2012-15595)):

- **Anexo** — vigente desde **2022-10-19**
  ([API, bloque `an`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2012-15595/texto/bloque/an)):
  > Grupo 972. Salones de peluquería e institutos de belleza.
  > Epígrafe 972.1. Servicios de peluquería de señora y caballero.
  > **Epígrafe 972.2. Salones e institutos de belleza y gabinetes de estética.**
- **Art. 2.1** — vigente desde **2013-12-11**
  ([API, bloque `a2`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2012-15595/texto/bloque/a2)):
  > …realizados a través de establecimientos permanentes… y **cuya superficie útil de exposición y venta al
  > público no sea superior a 750 metros cuadrados**.
- **Art. 3.1** — vigente desde **2012-12-28**
  ([API, bloque `a3`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2012-15595/texto/bloque/a3)):
  > 1. Para el inicio y desarrollo de las actividades comerciales y servicios definidos en el artículo anterior,
  > **no podrá exigirse** por parte de las administraciones o entidades del sector público **la obtención de
  > licencia previa** de instalaciones, de funcionamiento o de actividad, ni otras de clase similar o análogas…

**(b) Inferencia:** un salón de uñas/pestañas encaja en el epígrafe 972.2 y un local en un centro comercial está
con casi total seguridad por debajo de 750 m² → régimen de **declaración responsable**, no de autorización previa
→ **art. 10.1.c) LSSI no aplicable**.

**(c) Desconocido / riesgo residual:** si el salón practica **micropigmentación, tatuaje o piercing**, puede haber
normativa sanitaria autonómica con autorización o registro previo que sí activaría la letra c). **NO VERIFICADO**:
no he comprobado la normativa sanitaria de la Comunidad de Madrid ni sé si el salón presta esos servicios.

### 2.4 TRLGDCU (RDL 1/2007) — información precontractual

Norma: [BOE-A-2007-20555](https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555).

#### 2.4.1 Art. 20 — Información necesaria en la **oferta comercial** (el que más nos afecta)

**Vigente desde 2026-02-28.** Ojo a la volatilidad de este artículo: su apartado 1.c) fue modificado por el
RDL 4/2026, y esa modificación **se dejó sin efecto** por la Resolución de 26 de febrero de 2026 del Congreso que
derogó dicho RDL ([Ref. BOE-A-2026-4669](https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555#a20)). El texto
vigente es el de la Ley 10/2025.
([API, bloque `a20`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2007-20555/texto/bloque/a20))

Se activa cuando las prácticas comerciales "incluyan información sobre las características del bien o servicio y
su precio, posibilitando que el consumidor o usuario tome una decisión sobre la contratación" — **exactamente lo
que hará nuestra página de catálogo**. Exige al menos:

> a) **Nombre, razón social y domicilio completo** del empresario responsable de la oferta comercial…
> b) Las **características esenciales** del bien o servicio…
> c) El **precio final completo, incluidos los impuestos**, desglosando, en su caso, el importe de los incrementos
> o descuentos… y los gastos adicionales, incluidos los potenciales gastos de gestión…
> d) Los **procedimientos de pago y los plazos de entrega y ejecución** del contrato, cuando se aparten de las
> exigencias de la diligencia profesional…
> e) En su caso, **existencia del derecho de desistimiento**.
> f) En el caso de bienes y servicios ofrecidos en **mercados en línea**, si el tercero que ofrece el bien o
> servicio tiene la condición de empresario o no…

Y además:

> 2. …la información necesaria a incluir en la oferta comercial deberá facilitarse a los consumidores o usuarios,
> **principalmente cuando se trate de personas consumidoras vulnerables**, en términos claros, comprensibles,
> veraces y **en un formato que garantice su accesibilidad**…
> 5. **La carga de la prueba** en relación con el cumplimiento de los requisitos de información establecidos en
> este artículo **incumbirá al empresario**.
> 6. El incumplimiento de lo dispuesto en los apartados anteriores será considerado una **práctica desleal por
> engañosa** en el sentido del artículo 7 de la Ley 3/1991, de 10 de enero, de Competencia Desleal.

> ⚠️ **Diferencia con la LSSI que hay que entender bien.** El art. 10.1.f) LSSI permite decir *"si incluye o no"*
> los impuestos. El art. 20.1.c) TRLGDCU es **más estricto**: exige **"el precio final completo, incluidos los
> impuestos"**. Frente a consumidores, **no basta con declarar "IVA no incluido"**: el precio mostrado debe ser
> el final con impuestos. La norma más exigente manda.

**Art. 20.4 — reseñas (VIGENTE, y directamente relevante):**

> 4. Las prácticas comerciales en las que un empresario facilite el acceso a las reseñas de los consumidores y
> usuarios sobre bienes y servicios deberán contener información sobre el hecho de que el empresario **garantice o
> no que dichas reseñas publicadas han sido efectuadas por consumidores y usuarios que han utilizado o adquirido
> realmente** el bien o servicio. A tales efectos, el empresario deberá facilitar información clara a los
> consumidores y usuarios **sobre la manera en que se procesan las reseñas**.
> En cualquier caso… las reseñas emitidas deberán referirse a productos o servicios **adquiridos o utilizados en
> los treinta días naturales anteriores** a la fecha de la reseña…

**Impacto directo:** `datos-treatwell-ficha.md:220` propone usar "4,9 / 1231 opiniones" como prueba social. Si se
muestran reseñas o su agregado, **el art. 20.4 obliga a declarar si garantizamos o no su autenticidad y cómo se
procesan**. Como las reseñas son de Treatwell y nosotros no controlamos su verificación, lo honesto y conforme es
**declarar expresamente que proceden de Treatwell y que su verificación la realiza Treatwell, no el salón**.

#### 2.4.2 Art. 60 — Información previa al contrato

**Vigente desde 2022-03-02**
([API, bloque `a60`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2007-20555/texto/bloque/a60)).

> 1. **Antes de que el consumidor y usuario quede vinculado por un contrato y oferta correspondiente**, el
> empresario deberá facilitarle de forma clara, comprensible y accesible, la información relevante, veraz y
> suficiente sobre las características principales del contrato…

Extremos relevantes del apartado 2:

> b) La identidad del empresario, incluidos los datos correspondientes a **la razón social, el nombre comercial,
> su dirección completa y su número de teléfono**…
> c) **El precio total, incluidos todos los impuestos y tasas.** Si por la naturaleza de los bienes o servicios el
> precio no puede calcularse razonablemente de antemano o está sujeto a la elaboración de un presupuesto, **la
> forma en que se determina el precio**…
> f) La duración del contrato…
> h) **La existencia del derecho de desistimiento** que pueda corresponder al consumidor y usuario, el plazo y la
> forma de ejercitarlo.
> k) **El procedimiento para atender las reclamaciones** de los consumidores y usuarios, así como, en su caso, la
> información sobre el sistema extrajudicial de resolución de conflictos prevista en el artículo 21.4.
> 4. La información precontractual debe facilitarse al consumidor y usuario de forma gratuita y **al menos en
> castellano**…
> 5. **La carga de la prueba** en relación con el cumplimiento de los requisitos de información establecidos en
> este artículo **incumbirá al empresario**.

**Nota sobre el teléfono:** la LSSI **no** exige teléfono (art. 10.1.a) solo exige email + "cualquier otro dato").
El **art. 60.2.b) TRLGDCU sí exige "su número de teléfono"**. Tenemos el `625 22 33 66`
(`datos-treatwell-ficha.md:35`), pero **verificado solo contra la web propia** — hay que confirmarlo.

**Nota sobre el castellano (art. 60.4):** relevante porque la web propia actual está parcialmente en inglés
(`datos-treatwell-ficha.md:54`, `:77`). **La información precontractual debe estar al menos en castellano.**

#### 2.4.3 Art. 97 — Contratos a distancia (solo si hay reserva/contratación online)

**Vigente desde 2025-12-28**
([API, bloque `a97`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2007-20555/texto/bloque/a97)).
Lista de 21 extremos (a–u), notablemente más extensa que el art. 60. Entre ellos:

> c) **La dirección completa del establecimiento del empresario, número de teléfono y dirección de correo
> electrónico.** …Todos estos medios de comunicación facilitados por el empresario **permitirán al consumidor o
> usuario ponerse en contacto y comunicarse con el empresario de forma rápida y eficaz.**
> j) Cuando exista un derecho de desistimiento, **las condiciones, el plazo y los procedimientos** para ejercer ese
> derecho, así como **el modelo de formulario de desistimiento**.
> m) Cuando con arreglo al artículo 103 **no proceda el derecho de desistimiento, la indicación de que al
> consumidor o usuario no le asiste dicho derecho**…
> u) Cuando proceda, la posibilidad de recurrir a un **mecanismo extrajudicial de resolución de conflictos**…
> 5. La información a que se refiere el apartado 1 **formará parte integrante del contrato** a distancia… y no se
> alterará a menos que las partes dispongan expresamente lo contrario. **Corresponderá al empresario probar el
> correcto cumplimiento de sus deberes informativos**…

**(b) Inferencia — decisión de arquitectura con consecuencias legales:** `datos-treatwell-ficha.md:218` propone
**enlazar a Treatwell en lugar de construir un motor de reservas propio**. Desde el punto de vista legal esa
decisión es **claramente la más barata**: si la reserva se contrata en Treatwell, el art. 97 (21 extremos +
formulario de desistimiento + confirmación en soporte duradero) recae sobre ese flujo, no sobre nuestra web. Si
en cambio construimos reserva propia, **asumimos todo el art. 97 y el art. 98**. Recomiendo enlazar.

**(c) Desconocido:** el **art. 103.l)** (vigente desde 2022-05-28,
[API, bloque `a103`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2007-20555/texto/bloque/a103))
excepciona del desistimiento:

> l) El suministro de servicios de alojamiento para fines distintos del de servir de vivienda, transporte de
> bienes, alquiler de vehículos, comida **o servicios relacionados con actividades de esparcimiento, si los
> contratos prevén una fecha o un periodo de ejecución específicos**.

¿Es una cita de manicura un "servicio relacionado con actividades de esparcimiento" con fecha específica?
**NO VERIFICADO — no lo afirmo.** Es precisamente la clase de cuestión interpretativa que exige jurisprudencia
(TJUE/TS) que no he consultado. **Si se implanta reserva propia, esto debe resolverlo un abogado**, porque de ello
depende si hay que dar 14 días de desistimiento sobre una cita ya reservada.

### 2.5 Régimen sancionador

#### 2.5.1 LSSI — infracciones (art. 38) y sanciones (art. 39)

**Art. 38, versión VIGENTE desde 2025-01-23**
([API, bloque `a38`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2002-13758/texto/bloque/a38)):

> **3. Son infracciones graves:**
> …
> **b) El incumplimiento significativo de lo establecido en los párrafos a) y f) del artículo 10.1.**
>
> **4. Son infracciones leves:**
> …
> **b) No informar en la forma prescrita por el artículo 10.1 sobre los aspectos señalados en los párrafos b), c),
> d), e) y g) del mismo, o en los párrafos a) y f) cuando no constituya infracción grave.**

> 🔴 **CORRECCIÓN IMPORTANTE — no citar la redacción de 2002.** En el texto original de la Ley 34/2002 este tipo
> era el **art. 38.3.a)** y decía "El incumplimiento de lo establecido en los párrafos a) y f) del artículo 10.1",
> **sin** el adverbio "significativo". Numerosas fuentes secundarias siguen citando "art. 38.3.a)". **En la
> versión vigente es el art. 38.3.b) y exige que el incumplimiento sea *significativo*.** Lo he verificado
> extrayendo la última `<version>` del bloque en la API del BOE. Cualquier documento del proyecto que cite este
> precepto debe usar la letra **b)**.

**Art. 39.1, versión VIGENTE desde 2025-01-23**
([API, bloque `a39`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2002-13758/texto/bloque/a39)):

> a) Por la comisión de infracciones **muy graves, multa de 150.001 hasta 600.000 euros**…
> b) [Por la] comisión de infracciones **graves, multa de 30.001 hasta 150.000 euros**.
> c) Por la comisión de infracciones **leves, multa de hasta 30.000 euros**.

*(El "[Por la]" refleja una errata del propio texto consolidado del BOE, que en la letra b) dice literalmente
"b) comisión de infracciones graves…". La transcribo tal cual para no falsear la fuente.)*

**Sanción accesoria — art. 39.4.a):**

> a) Las infracciones graves y muy graves podrán llevar aparejada **la publicación, a costa del sancionado, de la
> resolución sancionadora** en el "Boletín Oficial del Estado"… en dos periódicos… **o en la página de inicio del
> sitio de Internet del prestador**, una vez que aquélla tenga carácter firme.

**Cuadro de exposición LSSI para este proyecto:**

| Incumplimiento | Tipo (vigente) | Calificación | Multa |
|---|---|---|---|
| Precios sin indicar impuestos (art. 10.1.f), de forma **significativa** | art. 38.3.b) | **GRAVE** | **30.001 – 150.000 €** + posible publicación de la sanción en la home |
| Falta de nombre/domicilio/email (art. 10.1.a) de forma **significativa** | art. 38.3.b) | **GRAVE** | **30.001 – 150.000 €** |
| Falta de **NIF** (art. 10.1.e) | art. 38.4.b) | **LEVE** | hasta 30.000 € |
| Falta de datos registrales, autorización, profesión regulada, códigos de conducta (art. 10.1 b,c,d,g) | art. 38.4.b) | **LEVE** | hasta 30.000 € |
| Falta de nombre/domicilio/email o precios **cuando no sea significativo** | art. 38.4.b) | **LEVE** | hasta 30.000 € |

**Competencia sancionadora — art. 43.1, vigente desde 2025-01-23**
([API, bloque `a43`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2002-13758/texto/bloque/a43)):

> 1. La imposición de sanciones por el incumplimiento de lo previsto en esta Ley corresponderá, en el caso de
> infracciones muy graves, a la persona titular del **Ministerio de Asuntos Económicos y Transformación Digital**,
> y en el de **infracciones graves y leves, a la persona titular de la Secretaría de Estado de Digitalización e
> Inteligencia Artificial**.

*(Observación: el texto consolidado conserva la denominación ministerial "Ministerio de Asuntos Económicos y
Transformación Digital". **No he verificado** la denominación vigente del departamento en 2026 ni la norma de
reestructuración que la haya cambiado; cito el BOE tal cual.)*

#### 2.5.2 TRLGDCU — infracciones (art. 47), calificación (art. 48) y sanciones (art. 49)

**Art. 47, vigente desde 2025-12-28**
([API, bloque `a47`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2007-20555/texto/bloque/a47)):

> g) El incumplimiento de las normas relativas a registro, normalización o denominación de productos, etiquetado,
> envasado y **publicidad de bienes y servicios, incluidas las relativas a la información previa a la
> contratación**.
> m) **El uso de prácticas comerciales desleales** con los consumidores o usuarios.
> t) El incumplimiento de las obligaciones que la regulación de **contratos celebrados a distancia** impone en
> materias no recogidas en la letra anterior.

**Art. 48.2, vigente desde 2025-12-28**
([API, bloque `a48`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2007-20555/texto/bloque/a48)):

> a) Las infracciones de los apartados **f), g), i), k), m), n), ñ), p), q) y t) del artículo 47 se calificarán
> como leves**, salvo que tengan la consideración de graves de acuerdo con el apartado tercero de este artículo.

Y el apartado 3 eleva a **grave** lo que en principio es leve si concurre, entre otras:

> c) Cometerse con **incumplimiento total de los deberes impuestos** o con una **habitualidad**, duración u otras
> circunstancias cualitativas o cuantitativas que impliquen desprecio manifiesto de los intereses públicos…

**Art. 49.1, vigente desde 2022-11-04**
([API, bloque `a49`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2007-20555/texto/bloque/a49)):

> 1. La imposición de sanciones deberá garantizar, en cualquier circunstancia, que **la comisión de una infracción
> no resulte más beneficiosa para la parte infractora que el incumplimiento** de las normas infringidas. Sobre esta
> base, las infracciones serán sancionadas con multa comprendida entre los siguientes importes máximos y mínimos:
> a) **Infracciones leves: entre 150 y 10.000 euros**, pudiéndose sobrepasar esas cantidades hasta alcanzar entre
> **dos y cuatro veces el beneficio ilícito** obtenido.
> b) **Infracciones graves: entre 10.001 y 100.000 euros** pudiéndose sobrepasar… entre cuatro y seis veces el
> beneficio ilícito obtenido.
> c) **Infracciones muy graves: ent[r]e 100.001 y 1.000.000 de euros**, pudiéndose sobrepasar… entre seis y ocho
> veces el beneficio ilícito obtenido.

Con una válvula de escape relevante para un negocio pequeño:

> No obstante, cuando la aplicación de los rangos indicados anteriormente conlleve la imposición de una sanción
> **desproporcionada en relación con la capacidad económica del infractor** se podrá utilizar el rango asignado a
> la calificación de un menor nivel de gravedad para el cálculo de la sanción.

Y una regla que refuerza §1:

> **Art. 51.7** (vigente 2022-11-04): La atribución al empresario de la carga de probar el cumplimiento de las
> obligaciones que le competen… **también abarca el ámbito administrativo sancionador**…
> ([API, bloque `a51`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2007-20555/texto/bloque/a51))

**Atenuante muy accionable — art. 48.4:**

> 4. Las infracciones que… merezcan en principio la calificación de grave o muy grave se considerarán
> respectivamente como leve o grave **si antes de iniciarse el procedimiento sancionador el responsable corrigiera
> diligentemente las irregularidades** en que consista la infracción siempre que no haya causado perjuicios
> directos…

*(Es decir: corregir a tiempo rebaja un escalón. Argumento a favor de arreglar el aviso legal roto de la web
actual **ya**, sin esperar al lanzamiento de la web nueva.)*

#### 2.5.3 Competencia autonómica (Comunidad de Madrid)

La **Ley 11/1998, de 9 de julio, de Protección de los Consumidores de la Comunidad de Madrid**
([BOE-A-1998-20651](https://www.boe.es/buscar/act.php?id=BOE-A-1998-20651)) **está vigente** (sin nota de
derogación total; con artículos puntuales derogados). Su art. 53 fija cuantías **todavía expresadas en pesetas** y
su art. 56 reparte la competencia sancionadora por cuantía entre director general, consejero y Consejo de Gobierno.

> ⚠️ **NO VERIFICADO / requiere abogado:** la **articulación entre las cuantías del art. 49 TRLGDCU (estatal,
> básico, reformado en 2021-2022) y las del art. 53 de la Ley 11/1998 madrileña (en pesetas, muy anterior)** no la
> he podido resolver con fuentes oficiales en esta investigación. El art. 47.u) TRLGDCU remite expresamente lo
> residual "a la legislación autonómica que resulte de aplicación". **No afirmo qué cuantía se aplicaría en la
> práctica a un expediente de consumo en Madrid.** Lo que sí es seguro es que **la competencia sancionadora en
> consumo es autonómica** (Comunidad de Madrid), mientras que **la de la LSSI es estatal** (art. 43.1 LSSI).

### 2.6 Hallazgo verificado sobre la web actualmente publicada

Comprobado hoy (2026-07-15) con `curl`:

- El HTML del pie de `https://www.nailslashlasrozas.es/` contiene literalmente `href="/es/aviso-legal"`.
- `https://www.nailslashlasrozas.es/es/aviso-legal` → **HTTP 404**
- `https://www.nailslashlasrozas.es/aviso-legal` → **HTTP 404**
- `https://www.nailslashlasrozas.es/es/avisolegal` → **HTTP 404**
- `https://www.nailslashlasrozas.es/es/aboutcookies` → **HTTP 200**
- `https://www.nailslashlasrozas.es/` → **HTTP 200**

**Conclusión (a) verificada:** la web hoy publicada **enlaza un aviso legal que no existe**. No hay acceso
"permanente, fácil, directa y gratuita" a la información del art. 10.1 → **incumplimiento actual del art. 10
LSSI**, encuadrable como mínimo en el art. 38.4.b) (leve, hasta 30.000 €).

**Nota de alcance honesta:** he verificado la **ausencia del aviso legal**, no he auditado el resto de la web
actual (cookies, formularios, RGPD). No extiendo la conclusión más allá de lo comprobado.

---

## 3. Lo que NO he podido verificar

| # | Dato no verificado | Por qué | Qué haría falta |
|---|---|---|---|
| 1 | **Denominación social / nombre y apellidos del titular** (art. 10.1.a) | No consta en Treatwell, ni en la web propia, ni en el repo | **Preguntar al negocio.** Alternativa: consulta al Registro Mercantil (solo si es sociedad) |
| 2 | **NIF/CIF** (art. 10.1.e) | Ídem | **Preguntar al negocio.** Dato no deducible |
| 3 | **Email de contacto** (art. 10.1.a — **exigido expresamente**) | No aparece en ninguna fuente (`datos-treatwell-ficha.md:36`) | **Preguntar al negocio.** Sin email no se cumple la letra a) |
| 4 | **Forma jurídica** (autónoma / SL) y si está **inscrita en Registro Mercantil** (art. 10.1.b) | Desconocida | Preguntar al negocio; verificar en Registro Mercantil si procede |
| 5 | **Si el domicilio del titular coincide con el local** (art. 10.1.a) | Solo consta la dirección del local | Preguntar al negocio |
| 6 | **Si los precios de Treatwell incluyen IVA** (art. 10.1.f / art. 20.1.c) | Treatwell muestra "20 €" sin más | **Preguntar al negocio. Bloqueante:** es el punto de riesgo GRAVE |
| 7 | **Si la estética/manicura es profesión regulada** en España (art. 10.1.d) | No he consultado la normativa de profesiones reguladas | Consultar el registro oficial de profesiones reguladas (Ministerio competente) |
| 8 | **Si el salón presta micropigmentación/tatuaje/piercing** y si eso activa autorización sanitaria previa (art. 10.1.c) | No sé qué servicios presta ni he leído la normativa sanitaria madrileña | Preguntar al negocio + consultar normativa sanitaria de la Comunidad de Madrid |
| 9 | **Superficie útil del local (<750 m²)** para la Ley 12/2012 | No consta | Preguntar al negocio (inferencia: obvio en un local de C.C., pero no verificado) |
| 10 | **Adhesión a códigos de conducta** (art. 10.1.g) y a **arbitraje de consumo** (art. 60.2.k) | Desconocido | Preguntar al negocio |
| 11 | **Si una cita de salón entra en el art. 103.l) TRLGDCU** ("esparcimiento") | Cuestión interpretativa; no he consultado jurisprudencia TJUE/TS | **Abogado.** Solo bloqueante si se implanta reserva propia |
| 12 | **Concurrencia de cuantías art. 49 TRLGDCU vs. art. 53 Ley 11/1998 Madrid** | Conflicto norma básica estatal / norma autonómica preconstitucional al euro | **Abogado** especialista en consumo |
| 13 | **Denominación vigente del ministerio competente** (art. 43.1 LSSI) | El texto consolidado del BOE conserva "Ministerio de Asuntos Económicos y Transformación Digital" | Verificar el RD de estructura ministerial vigente. *Impacto nulo en el producto* |
| 14 | **Obligaciones de hoja de reclamaciones y cartel informativo** (Madrid) | Fuera del alcance de la pregunta | Investigación aparte. Afecta al local físico, y potencialmente al art. 60.2.k) en la web |
| 15 | **Cookies / RGPD** | Fuera del alcance de esta pregunta | **Investigación aparte — es un bloqueante independiente.** Ver nota abajo |

> **Nota sobre cookies (fuera de alcance, pero señalado):** el **art. 22.2 LSSI** (vigente desde 2014-05-11,
> [API, bloque `a22`](https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2002-13758/texto/bloque/a22))
> exige consentimiento informado previo para dispositivos de almacenamiento y recuperación de datos. **Su texto
> vigente todavía se remite a la LO 15/1999, derogada por el RGPD/LOPDGDD** — desfase normativo que debe resolver
> quien investigue cookies. La web actual carga recursos de terceros (`business.safety.google`, verificado en el
> HTML). **No he investigado este bloque; no lo doy por resuelto.**

---

## 4. Impacto en el proyecto

### 4.1 Qué EXIGE

1. **Página de aviso legal + enlace en el pie de TODAS las páginas.** Acceso permanente, fácil, directo y
   gratuito (art. 10.1 LSSI). No detrás de un banner de cookies ni de un modal bloqueante.
2. **Contenido mínimo del aviso legal** (art. 10.1 LSSI): nombre/denominación · domicilio · **email** · **NIF** ·
   datos registrales *(si procede)* · autorización *(si procede)* · profesión regulada *(si procede)* · códigos de
   conducta *(si procede)*.
3. **Precios con impuestos incluidos, en la propia página de catálogo** (art. 20.1.c TRLGDCU: "precio final
   completo, incluidos los impuestos"). La fórmula "IVA incluido" junto al precio, no en el aviso legal.
4. **Identificación del empresario también en la oferta comercial** (art. 20.1.a: "Nombre, razón social y
   domicilio completo") y **teléfono** (art. 60.2.b). No basta con tenerlo solo en el aviso legal.
5. **Información precontractual al menos en castellano** (art. 60.4). Relevante: la web actual está parcialmente
   en inglés.
6. **Procedimiento de reclamaciones** (art. 60.2.k) y, si el salón está adherido, el sistema extrajudicial.
7. **Si se muestran reseñas o el "4,9 / 1231"**: declarar si se garantiza o no que provienen de clientes reales y
   cómo se procesan (art. 20.4). Lo conforme aquí es decir que **son de Treatwell y las verifica Treatwell**.
8. **Accesibilidad de la información** (art. 20.2: "un formato que garantice su accesibilidad", con atención a
   personas consumidoras vulnerables). Refuerza el trabajo del `a11y_seo_auditor`: **la accesibilidad no es solo
   buena práctica, es requisito legal para la oferta comercial.**
9. **Trazabilidad probatoria** (arts. 20.5, 60.5, 97.5 y 51.7 TRLGDCU: la carga de la prueba es del empresario).
   *(Inferencia mía:* mantener el aviso legal y los precios versionados en git ya nos da un rastro de auditoría
   con fecha. Es un argumento a favor de que los textos legales vivan en el repo y no en un CMS opaco.*)*

### 4.2 Qué PROHÍBE

1. **Prohibido publicar la web sin NIF y sin denominación del titular.** Art. 10.1.a) y e). **No inventables.**
   Bloqueante absoluto de lanzamiento.
2. **Prohibido inventar un email de contacto.** Si no hay, hay que crear uno **real y atendido** — el art. 97.1.c)
   exige que los medios permitan comunicarse "de forma rápida y eficaz". Un buzón que nadie lee no cumple.
3. **Prohibido publicar precios sin resolver la cuestión del IVA.** Es el único punto con exposición **GRAVE**
   (30.001–150.000 €, art. 38.3.b + 39.1.b LSSI).
4. **Prohibido copiar el aviso legal de otra web o usar una plantilla genérica sin los datos reales.** Un aviso
   legal con datos de otro es equivalente a no tenerlo.
5. **Prohibido repetir el patrón de la web actual**: enlace "Aviso Legal" que apunta a un 404 (verificado en §2.6).
   *(Sugerencia: un test de enlaces del pie que falle si el aviso legal no responde 200.)*
6. **Prohibido presentar las reseñas de Treatwell como verificadas por el salón** (art. 20.4).
7. **Prohibido mostrar precios "desde" sin base de cálculo** cuando el precio no pueda fijarse con exactitud
   (art. 20.1.c, párrafo 2: "deberá informarse sobre la base de cálculo que permita al consumidor o usuario
   comprobar el precio").

### 4.3 Qué FEATURES implica

| Feature | Qué obliga | Estado |
|---|---|---|
| **Aviso legal** (página + enlace global en footer) | art. 10.1 LSSI | **BLOQUEADA** — faltan NIF, denominación, email |
| **Precio con IVA en catálogo** | art. 20.1.c TRLGDCU / art. 10.1.f LSSI | **BLOQUEADA** — falta confirmar si los precios de Treatwell llevan IVA |
| **Identidad + teléfono en la oferta comercial** | art. 20.1.a, art. 60.2.b | Parcial: teléfono verificado solo en web propia |
| **Contenido en castellano** | art. 60.4 | Decisión de producto. Si hay multiidioma, castellano obligatorio |
| **Bloque de reclamaciones / resolución de conflictos** | art. 60.2.k | **BLOQUEADA** — falta saber si está adherido a arbitraje de consumo |
| **Disclaimer de procedencia de reseñas** | art. 20.4 | Accionable ya *(si se muestran reseñas)* |
| **Accesibilidad del catálogo** | art. 20.2 | Accionable ya — y es requisito legal, no solo a11y |
| **Reserva online propia** | dispararía art. 97 (21 extremos) + art. 98 + análisis del art. 103.l) | **Recomendación: NO construirla.** Enlazar a Treatwell (coincide con `datos-treatwell-ficha.md:218`) |
| **Test automático del enlace de aviso legal** | Previene el fallo real de §2.6 | Accionable ya |
| **Cookies / RGPD** | art. 22.2 LSSI + RGPD | **Fuera de este informe.** Bloqueante independiente sin investigar |

### 4.4 Acción inmediata recomendada

**Añadir al cuestionario para la dueña** (`datos-treatwell-ficha.md:226`) estos campos, que son **bloqueantes de
publicación** y que ninguna investigación web puede sustituir:

1. Nombre y apellidos o denominación social del titular **(exacto, como en el modelo 036/037)**
2. **NIF/CIF**
3. Domicilio del titular (si difiere del local)
4. **Email de contacto real y atendido**
5. Forma jurídica; si es sociedad: datos de inscripción en el Registro Mercantil (tomo, folio, hoja)
6. **¿Los precios llevan IVA incluido?** ← *el de mayor riesgo económico*
7. ¿Adherida a arbitraje de consumo o a algún código de conducta?
8. ¿Se presta micropigmentación / tatuaje / piercing? (posible autorización sanitaria)

**Y, con independencia de la web nueva:** avisar al negocio de que **su web actual tiene el aviso legal roto
(404)**. El art. 48.4 TRLGDCU premia la corrección diligente **antes** de que se inicie un procedimiento.

---

## Anexo: fuentes

Todas las citas normativas proceden de textos **consolidados** del BOE vía su API de datos abiertos.

| # | Norma | ID BOE | Bloques consultados | URL |
|---|---|---|---|---|
| 1 | Ley 34/2002 (LSSI-CE) | BOE-A-2002-13758 | `an`, `a2`, `a10`, `a22`, `a38`, `a39`, `a43` | https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758 |
| 2 | RDL 1/2007 (TRLGDCU) | BOE-A-2007-20555 | `a20`, `a47`, `a48`, `a49`, `a51`, `a60`, `a97`, `a103` | https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555 |
| 3 | Ley 12/2012 (liberalización del comercio) | BOE-A-2012-15595 | `a2`, `a3`, `an` | https://www.boe.es/buscar/act.php?id=BOE-A-2012-15595 |
| 4 | Ley 11/1998 (Consumidores C. de Madrid) | BOE-A-1998-20651 | arts. 53, 56 (vía HTML) | https://www.boe.es/buscar/act.php?id=BOE-A-1998-20651 |
| 5 | Web actual del salón (comprobación de estado HTTP) | — | footer, `/es/aviso-legal` | https://www.nailslashlasrozas.es/ |

**Endpoint de la API usado** (reproducible):
`https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/<ID>/texto/bloque/<bloque>` con
`Accept: application/xml`. Devuelve todas las versiones históricas del precepto; **hay que tomar la última
`<version>` por `fecha_vigencia`** — es exactamente el paso que evita citar redacciones derogadas (§2.5.1).
