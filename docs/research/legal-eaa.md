# Accesibilidad — EAA (Directiva UE 2019/882), Ley 11/2023 y RD 193/2023

> **Informe de investigación — área Legal ES/UE**
> Fecha: 2026-07-15 · Proyecto: NailsLashStudioWeb (salón real, Las Rozas de Madrid)
> Estado: investigación cerrada sobre fuentes oficiales (BOE + EUR-Lex, textos consolidados descargados y leídos literalmente).
>
> **Convención de este informe:**
> - ✅ **HECHO** = verificado en fuente oficial, con cita literal y localización exacta.
> - 🔶 **INFERENCIA** = razonamiento propio a partir de hechos verificados. No es una fuente. Discutible.
> - ❌ **NO VERIFICADO / DESCONOCIDO** = no lo he podido comprobar. Ver §5.

---

## 1. Respuesta ejecutiva

**Qué hacemos: construimos la web cumpliendo WCAG 2.1 nivel AA desde el primer commit, y lo tratamos como requisito no negociable, no como "nice to have".**

El porqué, en cuatro pasos:

1. **El EAA (Ley 11/2023) probablemente NO nos obliga hoy** — por dos vías independientes: (a) una web escaparate que no cierra contratos online 🔶 no encaja en la definición legal de «servicios de comercio electrónico», y (b) aunque encajara, las **microempresas que prestan servicios están exentas** (art. 3.3 Ley 11/2023). Un salón de belleza no aparece en la lista cerrada de servicios del art. 2.2.

2. **Pero hay una segunda norma, distinta, que sí muerde y que casi nadie mira: el RD 193/2023.** Su art. 14.2 obliga a **todo titular privado** de un sitio web cuyo contenido se refiera a bienes y servicios a disposición del público a cumplir **prioridad A y AA de la UNE 139803**. **No tiene exención de microempresas.** Un salón de belleza es un servicio a disposición del público (art. 2.c y 3 RD 193/2023). Fecha de exigibilidad para nuevos bienes/servicios privados: **1 de enero de 2029** (DF 6ª.b).

3. **Corrección de una premisa habitual:** el RD 193/2023 **no es** la transposición del EAA, y por tanto la pregunta "¿EAA o RD 193?" es un falso dilema — **son dos normas paralelas** con ámbitos, exenciones y calendarios distintos. La transposición del EAA es la **Ley 11/2023, Título I**. El RD 193/2023 desarrolla el RDL 1/2013 (LGDPD). Ver §2.

4. **Ninguna de las dos exenciones del EAA está verificada en nuestro caso**, y ambas dependen de datos que no tenemos: la condición de microempresa exige datos del titular (plantilla, facturación) que **no tenemos** porque no hay contacto con el cliente (`progress/current.md:78-83`). Y la reserva por WhatsApp (`progress/current.md:65`) es una **zona gris** deliberada (§3.3).

**Consecuencia de ingeniería:** el coste de construir accesible desde el inicio en una web de ~5 páginas estáticas es marginal; el de reformarla en 2028 con el diseño ya cerrado, no. Y si mañana se añade reserva online real (está previsto: "a futuro", `progress/current.md:65-67`), **la web entra en el EAA de golpe** y la exención de microempresa deja de ser un colchón fiable. **No apoyar la decisión de diseño en ninguna de las dos exenciones.**

> ⚠️ **Aviso:** esto es análisis técnico-normativo sobre fuentes primarias, **no asesoramiento jurídico**. Las dos cuestiones interpretativas (§3.3 y §4.3) merecen confirmación de un abogado antes de publicar, y son baratas de neutralizar cumpliendo AA.

---

## 2. Mapa normativo (y la premisa que hay que corregir)

Hay **tres** normas en juego, y se confunden constantemente entre sí:

| Norma | Qué es | Transpone | Exención microempresa | Fecha |
| ----- | ------ | --------- | --------------------- | ----- |
| **Directiva (UE) 2019/882** (EAA) | Norma UE de requisitos de accesibilidad de productos y servicios | — | ✅ Sí (art. 4.5) | Aplicación desde 28-06-2025 (art. 31.2) |
| **Ley 11/2023, Título I** | **La transposición española del EAA** | Dir. 2019/882 | ✅ Sí (art. 3.3) | Título I en vigor **28-06-2025** (DF 18ª.2) |
| **RD 193/2023** | Condiciones básicas de accesibilidad de **bienes y servicios a disposición del público** | ❌ **NO transpone el EAA** | ❌ **No existe** | Nuevos privados: **01-01-2029** (DF 6ª.b) |

✅ **HECHO — El RD 193/2023 no es la transposición del EAA; son normas complementarias.** El propio preámbulo del RD lo dice: se "verá necesariamente complementado por la norma de transposición" de la Directiva (UE) 2019/882. Su art. 1 fija otro objeto: "regular las condiciones básicas de accesibilidad y no discriminación de las personas con discapacidad para el acceso y utilización de los bienes y servicios a disposición del público".
> Fuente: [RD 193/2023, BOE-A-2023-7417, texto consolidado](https://www.boe.es/buscar/act.php?id=BOE-A-2023-7417) — art. 1. PDF: <https://www.boe.es/buscar/pdf/2023/BOE-A-2023-7417-consolidado.pdf>

✅ **HECHO — La transposición del EAA es la Ley 11/2023.** Título completo: "Ley 11/2023, de 8 de mayo, de trasposición de Directivas de la Unión Europea en materia de accesibilidad de determinados productos y servicios, migración de personas altamente cualificadas, tributaria y digitalización de actuaciones notariales y registrales…". Su art. 31.1 remite expresamente al informe de aplicación "de la Directiva (UE) 2019/882 […] a que se refiere su artículo 33".
> Fuente: [Ley 11/2023, BOE-A-2023-11022, texto consolidado](https://www.boe.es/buscar/act.php?id=BOE-A-2023-11022). PDF: <https://www.boe.es/buscar/pdf/2023/BOE-A-2023-11022-consolidado.pdf>
> Estado de consolidación en la descarga (2026-07-15): "Última modificación: **sin modificaciones**".

**Desarrollo posterior (2026):** el **RD 143/2026, de 25 de febrero** crea la Unidad técnica de apoyo y coordinación de las autoridades de vigilancia en materia de accesibilidad (desarrolla el art. 28 Ley 11/2023). ✅ **HECHO** que existe; 🔶 **INFERENCIA**: no impone obligaciones nuevas a prestadores — solo organiza la vigilancia — pero **señala que la maquinaria de supervisión se está montando**, lo que sube el riesgo práctico de inspección a futuro.
> Fuente: [RD 143/2026, BOE-A-2026-4520](https://www.boe.es/buscar/act.php?id=BOE-A-2026-4520)

---

## 3. ¿Aplica el EAA (Ley 11/2023) a la web de un salón de belleza pequeño?

### 3.1. El ámbito es una LISTA CERRADA, y los salones de belleza no están en ella

✅ **HECHO.** El art. 2.2 de la Ley 11/2023 enumera taxativamente los servicios cubiertos:

> "**2. Las disposiciones de este título se aplican a los siguientes servicios que se presten a los consumidores:**
> a) Servicios de comunicaciones electrónicas […]
> b) Servicios que proporcionan acceso a los servicios de comunicación audiovisual.
> c) Los siguientes elementos de los servicios de transporte aéreo de viajeros […]
> d) Servicios bancarios para consumidores.
> e) Libros electrónicos y sus programas especializados.
> **f) Servicios de comercio electrónico.**
> g) […] servicios de suministro eléctrico, de agua y gas […]
> h) […] servicios de agencia de viajes y turoperadores […]
> **i) Las redes sociales.**"

> Fuente: Ley 11/2023, **art. 2.2**, letras a) a i) (texto consolidado BOE-A-2023-11022, pág. ~34-35 del PDF).

🔶 **INFERENCIA (alta confianza):** "servicios de peluquería/estética" no figura en la lista. La **única** puerta de entrada posible para esta web es la letra **f) servicios de comercio electrónico**. Todo el análisis EAA se reduce, por tanto, a: *¿es esta web un servicio de comercio electrónico?*

> **Nota de interés:** la letra **i) Las redes sociales** es un **añadido español** que no figura en el art. 2.2 de la Directiva. Irrelevante para nosotros (no somos una red social), pero confirma que España amplió el ámbito por encima del mínimo UE — es decir, **no se puede razonar por analogía con la Directiva sin leer la ley española**.

### 3.2. Qué es exactamente «comercio electrónico» a efectos de la norma

✅ **HECHO — Definición española.** Anexo VII ("Definiciones", aplicable "a efectos de las disposiciones contempladas en el título I de esta ley"), punto **32**:

> "32) «**servicios de comercio electrónico**»: los servicios prestados a distancia a través de sitios web y servicios para dispositivos móviles, por medios electrónicos y a petición individual de un consumidor, **al objeto de celebrar un contrato con el consumidor**;"

> Fuente: Ley 11/2023, **Anexo VII, punto 32** (texto consolidado, pág. 151 del PDF).

✅ **HECHO — Definición idéntica en la Directiva**, art. 3, punto 30):
> "30) «servicios de comercio electrónico»: los servicios prestados a distancia a través de sitios web y servicios para dispositivos móviles, por medios electrónicos y a petición individual de un consumidor, al objeto de celebrar un contrato con el consumidor;"
> Fuente: [Directiva (UE) 2019/882, EUR-Lex CELEX:32019L0882](https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32019L0882), art. 3.30. PDF DOUE L 151 de 7.6.2019: <https://eur-lex.europa.eu/legal-content/ES/TXT/PDF/?uri=CELEX:32019L0882>

**Los cuatro elementos acumulativos** (el considerando 42 los desglosa uno a uno):

✅ **HECHO — Considerando 42, literal:**
> "(42) La presente Directiva define el concepto de «servicios de comercio electrónico» como los servicios prestados a distancia, a través de sitios web y servicios para dispositivos móviles, por medios electrónicos y a petición individual de un consumidor, al objeto de celebrar un contrato con el consumidor. A efectos de la definición anterior hay que entender por: «**a distancia**», un servicio prestado sin que las partes estén presentes de forma simultánea; «**por medios electrónicos**», un servicio enviado desde la fuente y recibido por el destinatario mediante equipos electrónicos de tratamiento […]; «**a petición individual de un consumidor**», un servicio prestado a petición individual. Dada la importancia creciente de los servicios de comercio electrónico y su carácter altamente tecnológico, es importante contar con requisitos armonizados en relación con su accesibilidad."

Nótese que el considerando 42 **define tres de los cuatro elementos pero NO define "al objeto de celebrar un contrato"** — que es justamente el que decide nuestro caso. Ese hueco lo rellena el considerando 43:

✅ **HECHO — Considerando 43, literal (clave para "escaparate"):**
> "(43) Las obligaciones de accesibilidad de los servicios de comercio electrónico de la presente Directiva **deben aplicarse a la venta en línea de cualquier producto o servicio** y, por tanto, también deben aplicarse a la venta de un producto o servicio sujeto por sí mismo a la presente Directiva."

> Fuente: Directiva (UE) 2019/882, considerandos 42 y 43 (DOUE L 151, 7.6.2019, pág. L 151/75-76).

### 3.3. ⚠️ La pregunta del millón: web escaparate que NO vende online — ¿dentro o fuera?

**Respuesta corta: 🔶 INFERENCIA de que queda FUERA del EAA, pero es una zona gris y NUESTRO caso concreto la pisa.**

**Argumento a favor de "fuera"** (el que yo sostengo):
- El elemento "**al objeto de celebrar un contrato con el consumidor**" es **constitutivo** de la definición (Anexo VII.32). Una web puramente informativa (servicios, precios, horarios, ubicación, galería) no tiene por objeto celebrar contrato alguno: informa.
- El considerando 43 ancla la obligación en "**la venta en línea**". Sin venta en línea, no hay servicio de comercio electrónico.
- 🔶 Por tanto: escaparate puro (sin carrito, sin reserva, sin formulario que perfeccione contrato) → **fuera del art. 2.2.f)**.

**Por qué NO me apoyo en esa conclusión en nuestro caso:**

✅ **HECHO (del repo).** La decisión de producto es: *"**Reservas:** de momento **solicitud por WhatsApp** (sin backend). El calendario compone la solicitud y abre WhatsApp. A futuro, la parte de frontend reutilizable debe subir a la memoria/plantillas."*
> Fuente: `progress/current.md:65-67`

Esto **no es un escaparate puro**. Es un escaparate **con un flujo de reserva parcial**: hay un calendario en la web que compone una solicitud. El contrato (la cita) se perfecciona en WhatsApp, fuera del sitio.

🔶 **INFERENCIA — los dos lados del argumento, honestamente:**
- *A favor de "fuera":* la web no celebra el contrato; solo compone un mensaje y delega en un canal de terceros. El servicio prestado "a distancia por medios electrónicos al objeto de celebrar un contrato" sería, en todo caso, WhatsApp — no nuestro sitio. Además, una cita de peluquería no es "venta en línea" (considerando 43): no hay pago ni perfección del contrato en el sitio.
- *A favor de "dentro":* el calendario existe **precisamente** "al objeto de celebrar un contrato con el consumidor" — esa es su finalidad literal, y la definición habla de *objeto/finalidad*, no de *perfección jurídica* del contrato en el propio sitio. Una autoridad de vigilancia podría leer el flujo completo (calendario → solicitud → cita) como un servicio de comercio electrónico troceado, y considerar que la delegación en WhatsApp es una elección técnica que no altera la finalidad.

❌ **NO VERIFICADO:** no he encontrado guía oficial (Comisión Europea ni autoridad española) que resuelva expresamente el caso "web informativa sin venta" ni el caso "reserva delegada a un canal externo". Busqué en `commission.europa.eu` y `ec.europa.eu` y la página oficial del EAA solo enumera "e-commerce" sin definir el borde; existe una *Guidance on legislation* de AccessibleEU y unas *Guidelines* del art. 21 que **no he leído** (ver §5). **Los considerandos 42-43 son lo más cerca que llega el Derecho positivo, y no cierran el caso del flujo delegado.**

**Conclusión operativa:** la ambigüedad es real y **el coste de resolverla a nuestro favor (cumplir AA) es menor que el coste de perder la apuesta**. Además, el punto 3 del repo dice explícitamente "a futuro" habrá más — cuando la reserva sea online de verdad, el debate se acaba y estamos **dentro**. Diseñar hoy asumiendo que estamos fuera es hipotecar el rediseño de mañana.

### 3.4. La exención de microempresas: existe, es potente, y no nos sirve de red

✅ **HECHO — La exención (Ley 11/2023, art. 3.3), literal:**
> "**3. Las microempresas que presten servicios estarán exentas de cumplir los requisitos de accesibilidad a que se refiere el párrafo tercero del apartado 1 y cualquier obligación relativa al cumplimiento de dichos requisitos.**"

> Fuente: Ley 11/2023, **art. 3.3** (Capítulo II, "Requisitos de accesibilidad y libre circulación").
> El "párrafo tercero del apartado 1" al que remite es el que dice: "Asimismo, todos los **servicios** deberán cumplir los requisitos de accesibilidad universal que figuran en las secciones III y IV del anexo I […]" (art. 3.1, párrafo 3º).

✅ **HECHO — Equivalente en la Directiva, art. 4.5:**
> "5. Las microempresas que presten servicios estarán exentas de cumplir los requisitos de accesibilidad a que se refiere el apartado 3 del presente artículo y cualquier obligación relativa al cumplimiento de dichos requisitos."

**Alcance exacto de la exención — dos matices que suelen contarse mal:**

1. ✅ **HECHO:** la exención es **solo para servicios**, no para productos. Las microempresas *que guarden relación con productos* **no** están exentas de los requisitos: solo se les exime de **documentar** la evaluación de carga desproporcionada (art. 8.4 Ley 11/2023: "las microempresas que guarden relación con los productos estarán exentas del requisito de documentar su evaluación"). Irrelevante aquí (no vendemos producto físico regulado), pero explica por qué "las microempresas están exentas del EAA" a secas es **falso**.
2. ✅ **HECHO — el porqué (considerando 70), literal:**
   > "(70) Las microempresas se distinguen de todas las demás empresas por sus recursos humanos limitados, su reducido volumen de negocios anual o balance anual total. […] si bien todos los agentes económicos a los que es aplicable la presente Directiva deben poder evaluar la proporcionalidad del cumplimiento de los requisitos de accesibilidad establecidos en ella y deben cumplirlos solo en la medida en que no sean desproporcionados, **la exigencia de este tipo de evaluación a las microempresas que presten servicios constituiría en sí misma una carga desproporcionada. Por consiguiente, los requisitos y obligaciones de la presente Directiva no deben aplicarse a las microempresas que presten servicios**."

   Es decir: la ratio de la exención es **ahorrarles el papeleo de la evaluación**, no declarar que la accesibilidad les da igual.

✅ **HECHO — Definición legal de microempresa (Ley 11/2023, Anexo VII, punto 16), literal:**
> "16) «**microempresa**»: una empresa que emplea a **menos de 10 personas** y cuyo **volumen de negocios anual no supera los 2 millones de euros** **o** cuyo **balance anual total no supera los 2 millones de euros**;"

**Cómo se lee esa definición** (importa, porque la conjunción es mixta):
- Requisito de plantilla: **< 10 personas** → **acumulativo** ("y").
- Requisito financiero: negocio ≤ 2 M€ **O** balance ≤ 2 M€ → **alternativo** ("o"): basta con cumplir **uno** de los dos.
- 🔶 **INFERENCIA:** en la práctica, la plantilla (<10) es el filtro que decide para un salón; el umbral de 2 M€ es inalcanzable para un negocio de este tamaño.

✅ **HECHO — Contraste:** la misma Ley define "pymes" en el punto 18) como "empresas que emplean a menos de 250 personas y cuyo volumen de negocios anual no supera los 50 millones de euros o cuyo balance anual total no supera los 43 millones de euros, **excluidas las microempresas**". Las **pymes no microempresas NO están exentas**.

❌ **NO VERIFICADO — y es determinante: no sabemos si el salón es microempresa.** No tenemos plantilla ni facturación porque **no hay contacto con el cliente** y se trabaja solo con fuentes públicas: *"**No hay contacto con el cliente todavía.** → Se trabaja **solo** con lo verificable en fuentes públicas (Treatwell/Google). Todo lo que exija datos del titular queda **bloqueado**"* (`progress/current.md:78-81`).

🔶 **INFERENCIA (probable pero NO verificada):** un salón de uñas y pestañas en Las Rozas casi con seguridad tiene <10 empleados y <2 M€ → sería microempresa. **Pero "casi con seguridad" no es una base sobre la que construir producto**, y además la exención puede evaporarse: la plantilla es un dato **dinámico** (si el salón crece a 10 personas, deja de ser microempresa y la exención decae — sin que nadie avise al equipo de la web).

### 3.5. Desde qué fecha aplica el EAA

✅ **HECHO — España, Ley 11/2023, DF 18ª.2, literal:**
> "2. El **título I entrará en vigor el 28 de junio de 2025**, a excepción del artículo 27.4, que entrará en vigor a los veinte días de su publicación en el «Boletín Oficial del Estado»."
> (DF 18ª.1: la ley entró en vigor al día siguiente de su publicación — BOE núm. 110, de 9 de mayo de 2023 — "con las excepciones señaladas en esta disposición".)

✅ **HECHO — UE, Directiva art. 31:**
> "1. Los Estados miembros adoptarán y publicarán, a más tardar el **28 de junio de 2022**, las disposiciones legales […] 2. **Aplicarán dichas disposiciones a partir del 28 de junio de 2025**."

✅ **HECHO — Medidas transitorias (Ley 11/2023, DT única.1), literal:**
> "1. **Hasta el 28 de junio de 2030**, los prestadores de servicios podrán seguir prestando sus servicios mediante los productos que habían estado utilizando legalmente para prestar servicios similares antes de dicha fecha.
> Los **contratos de servicios celebrados antes del 28 de junio de 2025** podrán continuar sin cambios hasta su expiración, pero **sin superar una duración de cinco años** a partir de dicha fecha."
> (Concuerda con el art. 32.1 de la Directiva.)

🔶 **INFERENCIA:** la DT única **no nos sirve de refugio**. Está pensada para productos/terminales ya en uso y contratos vivos anteriores a 2025 — no para una web nueva que se publica en 2026. **El plazo del EAA ya venció** (hace más de un año, a fecha de este informe).

✅ **HECHO — Exclusiones de contenido (art. 2.4 Ley 11/2023):** quedan fuera del ámbito, entre otros, "a) Contenidos multimedia pregrabados de base temporal **publicados antes del 28 de junio de 2025**"; "d) **Contenidos de terceros** que no estén financiados ni desarrollados por el agente económico en cuestión ni estén bajo su control"; "e) Contenidos […] considerados como **archivos** […] que no se actualizan ni editan después del 28 de junio de 2025".
🔶 **INFERENCIA:** la letra d) es relevante para el **widget/enlace de reseñas de Treatwell** (contenido de tercero fuera de nuestro control) y la a)/e) no nos aplican (todo nuestro contenido es nuevo, post-2025).

---

## 4. La vía que SÍ muerde: RD 193/2023, art. 14.2

**Esta es la parte que cambia la decisión de producto, y es la que se suele pasar por alto** porque todo el mundo mira al EAA.

### 4.1. Nos aplica por ámbito, y no hay exención por tamaño

✅ **HECHO — Ámbito (art. 3 RD 193/2023), literal:**
> "Lo dispuesto en este real decreto se aplicará a las **relaciones entre personas físicas o jurídicas, públicas o privadas, que tengan por objeto la provisión de bienes o el suministro o la prestación de servicios disponibles para el público**.
> En todo caso, lo dispuesto en este real decreto resultará de aplicación a los bienes y servicios que, con arreglo a la legislación general para la defensa de las personas consumidoras y usuarias y normas concordantes, tengan la consideración de uso o consumo común, ordinario y generalizado y de bienes de naturaleza duradera."

✅ **HECHO — Definición de "servicios" (art. 2.c), literal:**
> "c) **Servicios**: Las prestaciones a disposición del público realizadas por una persona física o jurídica, de naturaleza pública o privada, medie o no una remuneración por ellas. Los servicios comprenderán, en particular: 1.º Actividades de carácter industrial. 2.º **Actividades de carácter mercantil**. 3.º **Actividades artesanales**. 4.º **Actividades profesionales**. 5.º Actividades artísticas y recreativas. 6.º Aquellas otras análogas a las anteriores."

✅ **HECHO — "A disposición del público" (art. 2.d), literal:**
> "d) **A disposición del público**: los bienes y servicios, ofrecidos fuera del ámbito de la vida privada y familiar, que se encuentran en situación de ser adquiridos, contratados, consumidos o usados por la ciudadanía, al ofrecerse con carácter genérico y estar en principio al alcance de cualquier persona, a cambio o no de remuneración […]"

✅ **HECHO — Exclusiones (art. 4):** solo se excluyen las prestaciones que "por constituir **servicios públicos, de utilidad pública o de interés general**, dispongan de una regulación específica en que quede suficientemente garantizada la no discriminación y la accesibilidad universal". **No hay exclusión por tamaño de empresa en todo el RD.**

🔶 **INFERENCIA (alta confianza):** un salón de uñas/pestañas es una **actividad mercantil/profesional** prestada **a disposición del público** → **dentro del ámbito del RD 193/2023**. Y como no existe exención de microempresa, **la condición de microempresa (§3.4) no nos protege aquí**. Este es el punto central del informe.

### 4.2. Qué exige exactamente el art. 14.2

✅ **HECHO — RD 193/2023, art. 14.2 ("Información y comunicación"), literal:**
> "2. **Las personas titulares de sitios web o aplicaciones móviles no financiadas con fondos públicos cuyo contenido se refiera a bienes y servicios a disposición del público incorporarán los criterios de accesibilidad establecidos en el Real Decreto 1112/2018**, de 7 de septiembre, sobre accesibilidad de los sitios web y aplicaciones para dispositivos móviles del sector público.
> En particular, **deberán cumplir los requisitos de prioridad A y AA de la norma UNE 139803** en la fecha en que las condiciones básicas de accesibilidad y no discriminación de este real decreto sean exigibles a los bienes y servicios que se ofrezcan en sus sitios web o aplicaciones."

Obsérvese la técnica legislativa: el RD 193/2023 **importa por referencia** el estándar del sector público (RD 1112/2018) y lo impone a titulares **privados**.

✅ **HECHO — obligación paralela, art. 14.1:** proporcionar a clientes con discapacidad "información sobre sus bienes y servicios **en soportes y formatos accesibles** […] **independientemente del canal que se utilice**", incorporando las medidas "que resulten **razonables y proporcionadas**".
🔶 **INFERENCIA:** "independientemente del canal" alcanza al **canal WhatsApp** de reservas, no solo a la web. Si el único modo de reservar fuera un canal inaccesible para una persona con discapacidad, el art. 14.1 estaría en juego con independencia del art. 14.2. **Conviene ofrecer siempre una alternativa (teléfono/email) junto al botón de WhatsApp.**

✅ **HECHO — art. 14.3 y 14.4:** la obligación reforzada (garantizar accesibilidad + consignar el grado de accesibilidad) se ciñe a Administraciones y a "empresas que presten servicios al público en general **de especial trascendencia económica**", definidas por remisión al **art. 2.2 de la Ley 56/2007**.
🔶 **INFERENCIA:** un salón **no** es empresa de especial trascendencia económica (esa categoría cubre banca, telecos, suministros, transporte, seguros, con umbrales de plantilla/facturación) → **el 14.3 no nos aplica; el 14.2 sí**. ❌ No he leído el art. 2.2 de la Ley 56/2007 (ver §5).

✅ **HECHO — Estándar técnico.** El RD 1112/2018 (art. 6.3) fija la presunción de conformidad por la norma **EN 301 549 V1.1.2 (2015-04)**; y su art. 6.4: "**Se aplicarán directamente las actualizaciones de referencias a la norma EN 301 549 V1.1.2 (2015-04) que la Comisión adopte** mediante actos delegados para hacer referencia a una versión más reciente de dicha norma o a una norma europea que la sustituya". Su art. 5.1 exige que los contenidos sean "**perceptibles, operables, comprensibles y robustos**" (los 4 principios POUR de WCAG).
> Fuente: [RD 1112/2018, BOE-A-2018-12699](https://www.boe.es/buscar/act.php?id=BOE-A-2018-12699), arts. 5 y 6 (consolidado; última modificación: 12 de agosto de 2019).

✅ **HECHO — Ley 11/2023, DA 3ª ("Accesibilidad de las páginas web"), literal:**
> "Los sitios web incluidos en el ámbito de aplicación del título I deberán satisfacer, como mínimo, el **nivel medio** de los criterios de accesibilidad al contenido generalmente reconocidos. Para ello servirá de referencia la **norma UNE 139803** o aquella que la sustituya, sin perjuicio de los criterios técnicos recogidos en el **Real Decreto 1112/2018**."

🔶 **INFERENCIA:** las tres normas convergen en el mismo destino técnico — **"nivel medio" / "prioridad A y AA" = WCAG nivel AA**. Construir a **WCAG 2.1 AA** (o 2.2 AA) satisface a la vez el art. 14.2 RD 193/2023, la DA 3ª Ley 11/2023 y, si algún día entramos en el EAA vía reserva online, el Anexo I. **Un solo objetivo técnico cierra las tres puertas.**

### 4.3. ⚠️ Desde cuándo: 1 de enero de 2029 (con una ambigüedad honesta)

✅ **HECHO — RD 193/2023, DF 6ª, literal:**
> "El presente real decreto entrará en vigor el día siguiente al de su publicación en el «Boletín Oficial del Estado».
> No obstante, **las condiciones básicas de accesibilidad y no discriminación establecidas en este real decreto resultarán obligatorias y exigibles según el calendario siguiente**:
> a) En los bienes y servicios **nuevos de titularidad pública** será de aplicación el **1 de enero de 2025**.
> b) En los bienes y servicios **nuevos de titularidad privada** que concierten o suministren las Administraciones públicas, el 1 de enero de 2025; **en el resto de bienes y servicios de titularidad privada que sean nuevos, el 1 de enero de 2029**.
> c) En los bienes y servicios **ya existentes** y que sean susceptibles de **ajustes razonables**, tales ajustes deberán realizarse antes del día 1 de enero de 2026, cuando sean […] de titularidad pública […]; **y antes del 1 de enero de 2030, cuando se trate del resto de bienes y servicios de titularidad privada**."
> (Firmado "Dado en Madrid, el 21 de marzo de 2023".)

🔶 **INFERENCIA — y aquí hay que ser honesto sobre la ambigüedad:** la web se publica en 2026 → es un **servicio nuevo de titularidad privada** no concertado con la Administración → letra **b)** → exigible el **1 de enero de 2029**. Pero el RD **no define "nuevo"**, y caben dos lecturas:
- *Lectura A (la que asumo):* "nuevo" = puesto en el mercado tras la entrada en vigor del RD → nuestra web es nueva → 01-01-2029.
- *Lectura B:* el calendario fija el momento en que la obligación **se hace exigible**, no una moratoria para diseñar hoy sin accesibilidad; una web publicada en 2026 y todavía viva en 2029 tendrá que cumplir en 2029 **sí o sí**, y si en 2029 sigue siendo la misma web, la letra c) (ajustes razonables antes de 2030) reforzaría lo mismo.

**Ambas lecturas llegan al mismo sitio operativo:** la web **tendrá** que ser AA a más tardar el **1 de enero de 2029**, y estará viva mucho antes de esa fecha. La única decisión real es **si pagamos la accesibilidad ahora (barata) o la retrofiteamos en 2028 (cara)**. No hay escenario en que se ahorre.

### 4.4. Régimen sancionador

✅ **HECHO — RD 193/2023, art. 15, literal:**
> "Las acciones y omisiones que supongan una vulneración de lo establecido en las condiciones básicas de accesibilidad y no discriminación […] previstas en este real decreto, **serán sancionadas de conformidad con lo previsto en el título III del texto refundido de la Ley General de derechos de las personas con discapacidad y de su inclusión social**." (RDL 1/2013)

✅ **HECHO — Ley 11/2023, art. 30.1, literal:**
> "1. Los incumplimientos de lo dispuesto en el presente título serán sancionados conforme al **régimen de infracciones y sanciones establecido en la legislación sectorial correspondiente**.
> En lo no previsto en la legislación sectorial, se aplicará de manera **supletoria el título III del Texto Refundido de la Ley General de derechos de las personas con discapacidad** […] aprobado por el Real Decreto Legislativo 1/2013, de 29 de noviembre."

❌ **NO VERIFICADO — las cuantías concretas.** Ambas normas remiten al **Título III del RDL 1/2013**, que **no he leído**. **No cito importes**: los "30.001 a 150.000 €" que aparecen en el PDF de la Ley 11/2023 pertenecen a un **título distinto** (modificaciones de otras leyes, en materia de extranjería), **no** al régimen de accesibilidad — sería un error grave importarlos aquí. Ver §5.

---

## 5. Lo que NO he podido verificar

| # | Afirmación / dato no verificado | Por qué importa | Qué haría falta para verificarlo |
| - | ------------------------------- | --------------- | -------------------------------- |
| 1 | **¿El salón es microempresa?** (<10 personas y ≤2 M€ negocio o balance) | Decide toda la exención del EAA (art. 3.3 Ley 11/2023) | Datos del titular: nº de empleados y volumen de negocio/balance. **Bloqueado**: no hay contacto con el cliente (`progress/current.md:78-83`). Alternativa parcial: cuentas depositadas en el Registro Mercantil si es sociedad (si es autónomo, no hay depósito) |
| 2 | **Razón social, NIF y forma jurídica del titular** | Sin saber si es persona física o sociedad no se puede aplicar el test de microempresa ni redactar el aviso legal | Datos del cliente. Ya identificado como bloqueante en `progress/current.md:78-83` |
| 3 | **¿Una web con calendario que delega la reserva en WhatsApp es «servicio de comercio electrónico»?** | Decide si el EAA aplica pese a no vender online (§3.3) | Guía oficial de la Comisión o de la autoridad española de vigilancia; o dictamen jurídico. Los considerandos 42-43 no lo resuelven |
| 4 | **Guías oficiales de interpretación del EAA** — *Guidance on legislation* (AccessibleEU) y las *Guidelines on the accessibility of services pursuant to Article 21* | Podrían aclarar el punto 3 y el borde "escaparate" | Leer <https://accessible-eu-centre.ec.europa.eu> (PDF de guidance) y la notificación TRIS de las Guidelines. **No leídas en esta investigación** |
| 5 | **Cuantías del régimen sancionador** (Título III RDL 1/2013) | Dimensiona el riesgo económico real del incumplimiento | Leer el Título III del RDL 1/2013 (BOE-A-2013-12632). **No leído — por eso no cito importes** |
| 6 | **Contenido exacto de la UNE 139803** y su equivalencia con WCAG 2.0/2.1/2.2 AA | El art. 14.2 RD 193/2023 exige "prioridad A y AA de la UNE 139803"; asumo = WCAG AA | Norma **de pago** (AENOR), no accesible libremente. La equivalencia UNE 139803:2012 ↔ WCAG 2.0 es 🔶 inferencia mía, no verificada |
| 7 | **Versión vigente de EN 301 549** aplicable hoy vía el art. 6.4 RD 1112/2018 | Determina el detalle técnico exacto exigible | Consultar la referencia publicada en el DOUE y el sitio del órgano de seguimiento (art. 6.5 RD 1112/2018) |
| 8 | **Art. 2.2 de la Ley 56/2007** (definición de "empresa de especial trascendencia económica") | Confirmaría que el art. 14.3 RD 193/2023 no nos aplica | Leer la Ley 56/2007, art. 2.2 (BOE-A-2007-22440) |
| 9 | **Normativa autonómica de la Comunidad de Madrid** en accesibilidad | Podría añadir obligaciones sobre el mínimo estatal | Buscar legislación de accesibilidad de la CM. **No investigado** — fuera del encargo, pero es un hueco real |
| 10 | **Si el calendario/reserva evolucionará a reserva online real** y cuándo | Si hay pago/reserva en el sitio → EAA aplica y la exención de microempresa protege menos | Decisión de producto pendiente (`progress/current.md:65-67`, "a futuro") |
| 11 | **Fecha exacta de publicación en BOE del RD 193/2023** | Fija su entrada en vigor (día siguiente) | Consultar el sumario del BOE. Irrelevante en la práctica: el calendario de exigibilidad de la DF 6ª es lo que manda |

---

## 6. Impacto en el proyecto

### 6.1. Qué EXIGE

| # | Exigencia | Fuente | Cuándo |
| - | --------- | ------ | ------ |
| E1 | **WCAG nivel AA** ("prioridad A y AA de la UNE 139803") en toda la web | RD 193/2023 art. 14.2 | Exigible 01-01-2029 (DF 6ª.b) → **construir ya** |
| E2 | Contenidos **perceptibles, operables, comprensibles y robustos** (POUR) | RD 1112/2018 art. 5.1 (vía art. 14.2 RD 193/2023) | Ídem |
| E3 | Accesibilidad **integral en diseño, gestión, mantenimiento y actualización** — no una auditoría final | RD 1112/2018 art. 5.2 | Desde el primer commit |
| E4 | Información de servicios en **formatos accesibles, "independientemente del canal"** → alternativa accesible al WhatsApp (teléfono/email visibles) | RD 193/2023 art. 14.1 | Desde el lanzamiento |
| E5 | Accesibilidad en **la información de protección de datos** y en el ejercicio de derechos RGPD | RD 193/2023 art. 14.5 | Al redactar las páginas legales |
| E6 | Si algún día hay **reserva/pago online** → EAA completo (Anexo I, secciones III y IV) salvo exención de microempresa | Ley 11/2023 art. 2.2.f) + Anexo VII.32 | Al añadir la feature |

### 6.2. Qué PROHÍBE (o desaconseja fuertemente)

- ❌ **No apoyar decisiones de diseño en "somos microempresa, estamos exentos".** Doble motivo: (a) no está verificado (§5 #1); (b) **la exención no existe en el RD 193/2023**, que es justamente la norma que nos aplica.
- ❌ **No apoyarse en "es solo un escaparate, no vendemos".** Sirve para el EAA (🔶 probablemente), **no** para el RD 193/2023, cuyo art. 14.2 se activa por "contenido referido a bienes y servicios a disposición del público" — exactamente lo que es un escaparate.
- ❌ **No dejar el WhatsApp como único canal de reserva.**  Art. 14.1 exige accesibilidad "independientemente del canal".
- ❌ **No tratar la accesibilidad como auditoría final** (choca con el art. 5.2 RD 1112/2018: proceso, no evento).
- ❌ **No declarar conformidad ni publicar un "grado de accesibilidad"** sin auditoría real: el art. 14.3 RD 193/2023 solo obliga a consignarlo a empresas de especial trascendencia económica (no somos), y una declaración falsa sería peor que ninguna.

### 6.3. Features / trabajo que esto implica

1. **Definición de "done" accesible** — que ninguna feature de UI se cierre sin: HTML semántico, foco visible, navegación completa por teclado, contraste AA, `alt` en imágenes con contenido, labels en formularios, jerarquía de encabezados correcta, `lang` en `<html>`.
2. **⚠️ Verificar el contraste de la paleta ya decidida.** Está cerrada: fondo `#FDF4F7`, acento `#C05576`, tema único sin interruptor (`progress/current.md:73-77`). **Hay que comprobar el ratio de contraste AA (4.5:1 texto normal, 3:1 texto grande y elementos de UI) antes de que la paleta se propague por todo el CSS.** Si `#C05576` sobre `#FDF4F7` no llega, es mucho más barato ajustarlo ahora que con la web construida. **No verificado en este informe** — es trabajo de la siguiente fase.
3. **El calendario de reserva es el punto caliente de accesibilidad.** Un date-picker custom es de lo más difícil de hacer accesible (foco, roles ARIA, teclado, anuncio de cambios). Recomendación 🔶: partir de `<input type="date">` nativo o de un patrón ARIA probado, **nunca** de un calendario a medida sin soporte de teclado. Además es la pieza que decide el debate del §3.3.
4. **Alternativa de contacto accesible** junto al botón de WhatsApp (teléfono con `tel:` + email) → cubre E4.
5. **Tests automáticos de a11y en el pipeline** (p. ej. axe-core con Vitest + Testing Library, que ya son el stack estándar de la organización según `progress/current.md:52`). Automatizable ≈ 30-40% 🔶 → hace falta también revisión manual de teclado y lector de pantalla.
6. **Página de accesibilidad**: no obligatoria para nosotros (🔶 el art. 14.3 no nos aplica), pero **sí** conviene un punto de contacto para reportar barreras. Decisión de producto pendiente.
7. **Convocar al `a11y_seo_auditor`** (agente de apoyo ya disponible en el harness, `.claude/agents/`) antes de cerrar el diseño, no después.
8. **ADR**: registrar "construimos a WCAG 2.1 AA por RD 193/2023 art. 14.2, no por el EAA" — con el porqué, para que nadie lo reabra en 2027 razonando (mal) desde la exención de microempresa. Debe subir a la memoria organizacional.

### 6.4. Riesgo residual

🔶 **INFERENCIA.** Con AA bien hecho, el riesgo regulatorio de accesibilidad tiende a cero **por las tres vías a la vez** (EAA, RD 193/2023 y DA 3ª Ley 11/2023), y deja de importar que no sepamos si el salón es microempresa (§5 #1) ni cómo se resuelve la zona gris del WhatsApp (§3.3). **Cumplir AA hace que las dos preguntas que no puedo responder dejen de ser bloqueantes** — que es exactamente por lo que la recomendación es cumplir y no litigar el borde.

El riesgo que **no** desaparece es el de **no verificar el contraste de la paleta ya cerrada** (§6.3 #2) y el de un **calendario custom inaccesible** (§6.3 #3). Son los dos puntos donde este proyecto, hoy, puede romper AA sin darse cuenta.

---

## 7. Fuentes

**Derecho positivo (leído literalmente en texto consolidado oficial):**
- [Directiva (UE) 2019/882 (EAA)](https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32019L0882) — considerandos 42, 43, 70; arts. 3.30, 4.5, 31, 32. PDF DOUE L 151 de 7.6.2019: <https://eur-lex.europa.eu/legal-content/ES/TXT/PDF/?uri=CELEX:32019L0882>
- [Ley 11/2023, de 8 de mayo (BOE-A-2023-11022)](https://www.boe.es/buscar/act.php?id=BOE-A-2023-11022) — arts. 2.2, 2.4, 3.1, 3.3, 8.4, 30, 31.1; DA 3ª; DT única; DF 18ª; Anexo VII puntos 6, 16, 18, 32. PDF consolidado: <https://www.boe.es/buscar/pdf/2023/BOE-A-2023-11022-consolidado.pdf>
- [Real Decreto 193/2023, de 21 de marzo (BOE-A-2023-7417)](https://www.boe.es/buscar/act.php?id=BOE-A-2023-7417) — arts. 1, 2.c), 2.d), 2.e), 3, 4, 14, 15; DF 6ª. PDF consolidado: <https://www.boe.es/buscar/pdf/2023/BOE-A-2023-7417-consolidado.pdf>
- [Real Decreto 1112/2018, de 7 de septiembre (BOE-A-2018-12699)](https://www.boe.es/buscar/act.php?id=BOE-A-2018-12699) — arts. 2, 5, 6.
- [Real Decreto 143/2026, de 25 de febrero (BOE-A-2026-4520)](https://www.boe.es/buscar/act.php?id=BOE-A-2026-4520) — Unidad técnica de vigilancia.

**Contexto del proyecto (repo):**
- `progress/current.md:65-67` — reservas por WhatsApp, sin backend; ampliación "a futuro".
- `progress/current.md:73-77` — paleta cerrada (`#FDF4F7` / `#C05576`), tema único.
- `progress/current.md:78-83` — sin contacto con el cliente; datos del titular bloqueados.
- `progress/current.md:52` — stack estándar (Vite + React + TS + Vitest + Testing Library).

**Consultadas sin resultado concluyente:**
- [Página oficial del EAA — Comisión Europea](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en) — enumera "e-commerce" sin definir el borde; no aborda la exención de microempresas.
- AccessibleEU *Guidance on legislation* y *Guidelines* del art. 21 — **localizadas pero no leídas** (§5 #4).
