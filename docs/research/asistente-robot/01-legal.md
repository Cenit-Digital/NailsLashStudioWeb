# Asistente robot — Informe legal (01): AI Act art. 50, definición de «sistema de IA», RGPD/AEPD y condiciones de WhatsApp

> **Área:** Legal UE/ES. **Fecha:** 2026-09-27. **Autor:** subagente investigador.
> **Ámbito:** el botón flotante (robot animado) que abre un chat en la web y deriva a WhatsApp
> con un enlace `wa.me` y texto prellenado. **Hoy** el chat es un guion local, sin IA y sin red.
> **En el futuro** habrá un servidor que conecte el chat web y el WhatsApp del salón a un LLM
> (Claude API).
>
> **Convención** (la misma que `docs/research/legal-rgpd.md`):
> **[V]** verificado en la fuente oficial citada · **[I]** inferencia mía, razonada pero no verificada
> · **NO CONFIRMADO** cuando no he podido comprobarlo en fuente oficial (se indica el motivo).
>
> **Fuentes:** solo oficiales (EUR-Lex, Comisión Europea, TJUE/InfoCuria, AEPD, BOE, AGCM y las
> páginas legales o de desarrolladores de WhatsApp/Meta). **Todas se consultaron el 2026-09-27.**
> Las citas son literales y cortas (menos de 25 palabras). Cuando la fuente está en inglés, cito el
> original y añado la traducción mía entre corchetes.
>
> **Aviso:** esto es investigación normativa, **no asesoramiento jurídico**. Los textos legales
> que se publiquen deberían pasar por un profesional que tenga delante los datos reales del titular.

---

## 0. Resumen ejecutivo

1. **Art. 50.1 del AI Act.** Obliga al **proveedor** de un sistema de IA que interactúa con
   personas a informarles de que hablan con una IA. La excepción es que resulte «evidente»
   para una persona razonablemente informada. Se aplica **desde el 2-ago-2026**. **[V]**
2. **El Ómnibus digital sobre IA no ha tocado el art. 50.1.** Es el Reglamento (UE) 2026/1744,
   de 8-jul-2026, publicado en el DOUE el 24-jul-2026 y en vigor a los tres días. Solo sustituye
   el art. 50.7 y da una prórroga hasta el 2-dic-2026 para el **marcado** del art. 50.2, y solo a
   los sistemas generativos que ya estaban en el mercado. **[V]**
3. **Ya hay directrices de la Comisión sobre el art. 50:** C(2026) 5054, de 20-jul-2026, no
   vinculantes. Traen ejemplos concretos de chatbots. También hay un código de buenas prácticas
   sobre contenido generado por IA (10-jun-2026), pero cubre los apartados 50.2 y 50.4, no el
   50.1. **[V]**
4. **Un chatbot de guion no es un «sistema de IA».** Me refiero a un árbol de respuestas fijado
   por personas, sin aprendizaje ni inferencia. Lo excluyen de forma expresa el considerando 12
   del AI Act, las Directrices sobre la definición y las Directrices del art. 50 («rule-based quick
   message answers»). **Hoy, por tanto, el art. 50.1 no se aplica. [V]+[I]** Lo que no se
   puede hacer es **presentarlo como «IA»** si no lo es. **[I]**
5. **RGPD hoy.** El salón pasa a ser **responsable** en el momento en que recibe el WhatsApp con
   nombre y teléfono. Ya lo concluyó `docs/research/legal-rgpd.md`. Hay que informar en capas
   (art. 13 RGPD y art. 11 LOPDGDD), antes del botón de envío. También hay que minimizar: **no
   pedir el teléfono**, porque WhatsApp ya lo aporta. **[V]+[I]**
6. **RGPD con servidor y LLM.** Anthropic sería **encargado** (art. 28) y habría una
   **transferencia internacional** a EE. UU. (capítulo V). El DPF sigue vigente y el recurso
   C-703/25 P está **pendiente**. Pero al buscar «Anthropic» en la lista oficial del DPF el
   27-09-2026 **no aparece ningún resultado**. Por eso habría que apoyarse en garantías del
   art. 46, como las cláusulas contractuales tipo. **[V]+[I]**
7. **WhatsApp.** La cláusula **4.7 «AI Providers»** (condiciones de Meta para la plataforma de
   WhatsApp Business, última modificación 23-sep-2026) va contra quien ofrece **como
   funcionalidad principal** una IA de propósito general. No va contra el negocio que usa IA de
   forma **auxiliar**. La propia Comisión lo resume así: «Businesses may still use AI tools for
   ancillary or support functions, such as automated customer support offered via WhatsApp». **[V]**
   Un salón que atiende a sus clientes encaja en ese uso auxiliar. **[I]**
8. **Antimonopolio.** La Comisión (asunto AT.41034) impuso **medidas cautelares** a Meta el
   9-jun-2026. Le ordena restablecer el acceso gratuito de los asistentes de IA de terceros en las
   condiciones anteriores al 15-oct-2025. El fondo del asunto sigue abierto. Italia (AGCM) ya
   había ordenado suspender esas condiciones el 24-dic-2025, y desde el 15-abr-2026 la Comisión
   cubre también Italia. **[V]**

---

## 1. Reglamento (UE) 2024/1689 (AI Act), artículo 50.1

### 1.1 Texto literal de la obligación y de la excepción  **[V]**

Fuente: texto en español del Reglamento (UE) 2024/1689, DOUE L de 12-7-2024.
<https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32024R1689>

- **Obligación** (art. 50.1, primera frase): «Los proveedores garantizarán que los sistemas de IA
  destinados a interactuar directamente con personas físicas se diseñen y desarrollen de forma que…»
  sigue: «…las personas físicas de que se trate estén informadas de que están interactuando con
  un sistema de IA».
- **Excepción «obvio por el contexto»** (misma frase): «excepto cuando resulte evidente desde el
  punto de vista de una persona física razonablemente informada, atenta y perspicaz», y
  continúa: «teniendo en cuenta las circunstancias y el contexto de utilización».
  - La otra excepción del 50.1 es para los sistemas autorizados por ley para fines penales. No
    nos aplica.
- **Cómo y cuándo informar** (art. 50.5): la información se da «de manera clara y distinguible a
  más tardar con ocasión de la primera interacción o exposición». Además: «La información se
  ajustará a los requisitos de accesibilidad aplicables.»
- **Colectivos vulnerables** (considerando 132): «deben tenerse en cuenta las características de
  las personas físicas pertenecientes a colectivos vulnerables debido a su edad o discapacidad».
- **Quién está obligado.** El 50.1 obliga al **proveedor**, no al responsable del despliegue. El
  art. 3.3 define como proveedor a quien «desarrolle un sistema de IA […] o para el que se
  desarrolle» y lo ponga en servicio con su nombre. Las Directrices del art. 50 (§ 11) ponen este
  ejemplo de proveedor: quien «has developed an interactive AI system (e.g. chatbot) in-house and
  puts it into service in the Union for its own use» [ha desarrollado internamente un sistema de IA
  interactivo, p. ej. un chatbot, y lo pone en servicio en la Unión para uso propio].
  <https://ai-act-service-desk.ec.europa.eu/sites/default/files/2026-07/guidelines_on_the_implementation_of_the_transparency_obligations_for_certain_ai_systems_under_article_50_of_the_ai_act_bzptwqhk0ikg1dtlddap41psfy_131215.pdf>
  - **[I]** Si el salón encarga el chatbot y lo pone en servicio con su marca, el salón sería el
    **proveedor** del sistema a efectos del 50.1. Anthropic sería el proveedor del **modelo** de
    uso general, que es otra figura.
- **Sanciones** (art. 99.4.g): hasta 15 000 000 EUR o el 3 % del volumen de negocios. Para las
  pymes se aplica la menor de las dos cifras (art. 99.6). El Ómnibus no modifica esos dos
  apartados; añade un 99.6 bis para las pequeñas empresas de mediana capitalización. **[V]**

### 1.2 Fecha de aplicación (art. 113)  **[V]**

- El art. 113 dice: «Será aplicable a partir del 2 de agosto de 2026.» El art. 50 no está en
  ninguna de las excepciones de fecha de las letras a) a c). Por tanto, **el 50.1 se aplica desde
  el 2-ago-2026**.
- Las Directrices del art. 50 (§ 153) lo confirman tras el Ómnibus, incluso para los sistemas
  mixtos interactivos y generativos: «compliance with the disclosure obligation for AI systems
  directly interacting with natural persons must be ensured as of 2 August 2026» [el cumplimiento
  de la obligación de información de los sistemas que interactúan directamente con personas debe
  estar garantizado desde el 2 de agosto de 2026]. También precisan que el art. 50 se aplica a
  todos los sistemas afectados desde esa fecha, sea cual sea su fecha de introducción en el
  mercado.

### 1.3 «Ómnibus digital sobre IA»: ¿ha modificado o aplazado el art. 50.1?

- **Propuesta:** COM(2025) 836 final, de 19-11-2025, «Reglamento ómnibus digital sobre IA». **[V]**
  <https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:52025PC0836>
- **Adoptado y publicado.** Es el **Reglamento (UE) 2026/1744**, de 8 de julio de 2026, publicado
  en el DOUE serie L el **24-7-2026**. **[V]**
  <https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32026R1744>
  - Su art. 4 dice: «El presente Reglamento entrará en vigor a los tres días de su publicación en
    el Diario Oficial de la Unión Europea.» Eso da el **27-7-2026**. EUR-Lex publica una versión
    consolidada del AI Act con fecha 2026-07-27
    (<https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng>). **[V]**
- **Qué cambia en el art. 50** (cotejado en el texto adoptado, en español y en inglés). **[V]**
  - **Art. 50.1: sin cambios.** No hay ninguna modificación del apartado 1.
  - **Art. 50.7:** se sustituye. Los códigos de buenas prácticas sobre detección y etiquetado se
    evalúan ahora por el procedimiento del art. 56.6, sin acto de ejecución de aprobación.
  - **Art. 111.4 (nuevo):** los proveedores de sistemas generativos introducidos en el mercado antes
    del 2-8-2026 «adoptarán las medidas necesarias para cumplir lo dispuesto en el artículo 50,
    apartado 2, a más tardar el 2 de diciembre de 2026». Afecta **solo al marcado del 50.2**.
  - **Art. 113:** se modifican las letras a) y c) y se añade la d). Ninguno de esos cambios afecta
    al art. 50. La fecha general del 2-8-2026 se mantiene.
  - **Art. 4 (alfabetización en IA):** se sustituye. Ahora proveedores y responsables del
    despliegue «adoptarán medidas para apoyar la promoción de la alfabetización en materia de IA
    de su personal». Añade que eso no exige garantizar un nivel concreto. Tendrá relevancia el día
    del servidor.
- **Estado a septiembre de 2026:** **adoptado, publicado en el DOUE y en vigor.** **[V]**

### 1.4 Directrices y código de buenas prácticas de la Comisión sobre el art. 50  **[V]**

- **Directrices sobre las obligaciones de transparencia del art. 50**, Anexo de C(2026) 5054
  final, Bruselas, 20.7.2026. El § 5 dice: «These Guidelines are non-binding.» [Estas Directrices
  no son vinculantes.]
  - Página de la Comisión: <https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems>
    (hay versión en español).
  - PDF: el enlace de § 1.1.
  - Lo más útil para un chatbot:
    - **§ 36.** Un ejemplo válido es «a chatbot that starts a conversation by mentioning that it
      is based on AI technology» [un chatbot que empieza la conversación diciendo que funciona con
      IA].
    - **§ 37.** Recomienda «Prominent, plain-language labels or banners (e.g. "You are interacting
      with an AI system") and first-turn greetings in chatbots» [etiquetas o banners destacados y
      en lenguaje llano, y saludos en el primer turno]. También sugiere colocarlos cerca del campo
      de entrada y combinarlos con insignias persistentes.
    - **§ 38.** Estas técnicas son insuficientes por sí solas:
      - «Disclosures contained only in terms and conditions, URLs, or documentation» [avisos que
        solo están en condiciones, URL o documentación];
      - «Unclear or ambiguous signals (e.g. generic references to "assistant") or human-like
        representations that may mislead users» [señales ambiguas, como llamarlo solo
        «asistente», o representaciones con apariencia humana que puedan inducir a error].
    - **§ 40.** Suele bastar un aviso destacado antes de la primera interacción. Pero el sistema
      debe diseñarse para «ensure disclosure in all situations where the AI system is being asked
      questions relating to its nature» [informar siempre que se le pregunte por su naturaleza].
    - **§ 45.** La excepción de lo «obvio» se interpreta de forma restrictiva: «the "obviousness"
      exception should be limited to cases where there is almost no doubt left» [solo cuando casi
      no quede duda]. Entre los casos que **no** son obvios cita los «AI chatbots embedded in
      online platforms or assistance support tools (helpdesks)» [chatbots de IA integrados en
      plataformas o en herramientas de atención al cliente].
    - **§ 30.iii. Chat mixto IA + humano.** Se informa de los mensajes generados por IA
      «unless those AI outputs have been properly reviewed and sent by humans as the main
      interlocutors» [salvo que personas los hayan revisado y enviado como interlocutores
      principales].
    - **§ 143.** El aviso se da, como mínimo, al inicio de cada sesión interactiva y para cada
      persona nueva.
    - **§ 50 y § 52.** El 50.1 se aplica sin perjuicio del Derecho de consumo (Directiva de
      prácticas comerciales desleales) y de los deberes de información del RGPD, que siguen
      aplicándose.
- **Código de buenas prácticas sobre transparencia del contenido generado por IA.** Se publicó el
  **10-jun-2026**: lo dice la nota 43 de las Directrices. La Comisión lo evaluó como adecuado para
  demostrar el cumplimiento de los apartados **50.2, 50.4 y 50.5** (§ 146 de las Directrices).
  **No cubre el 50.1.**
  <https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content>
- **Aviso para el día del servidor: el art. 50.2 también puede aplicarse.** Las Directrices
  (§ 56–58) lo aplican a cualquier sistema de IA que genere **texto** sintético, incluidos los
  sistemas de uso general. En ese caso el proveedor del sistema debe marcar sus salidas en un
  formato legible por máquina. El § 74 permite apoyarse en el marcado del proveedor del modelo,
  pero sin perjuicio de que responda el proveedor del sistema. Quedan fuera las salidas muy
  cortas, como palabras sueltas o etiquetas de interfaz (§ 68). **[V]**
  - Si Anthropic ofrece un marcado de texto que cumpla el 50.2: **NO CONFIRMADO.** No lo he
    investigado y `03-claude-api.md` no lo trata.

---

## 2. ¿Es un «sistema de IA» un chatbot de reglas o de guion?

### 2.1 La definición legal (art. 3.1)  **[V]**

Fuente: el mismo enlace de EUR-Lex del § 1.1.

- «Sistema de IA» es «un sistema basado en una máquina que está diseñado para funcionar con
  distintos niveles de autonomía». La definición sigue: que, para objetivos explícitos o
  implícitos, «infiere de la información de entrada que recibe la manera de generar resultados de
  salida».
- **Considerando 12:**
  - «Una característica principal de los sistemas de IA es su capacidad de inferencia.»
  - La definición «no debe incluir los sistemas basados en las normas definidas únicamente por
    personas físicas para ejecutar automáticamente operaciones».

### 2.2 Directrices de la Comisión sobre la definición de sistema de IA  **[V]**

- Página (publicada el 6-feb-2025):
  <https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-ai-system-definition-facilitate-first-ai-acts-rules-application>
- El PDF que sirve hoy el enlace oficial
  (<https://ec.europa.eu/newsroom/dae/redirection/document/112455>) lleva fecha **29.7.2025,
  C(2025) 5053 final**. Las Directrices del art. 50 (nota 18) citan esa misma referencia.
  - § 7: «The Guidelines are not binding.» [Las Directrices no son vinculantes.]
- **Sistemas basados en reglas fijadas por personas:**
  - **§ 26 y § 40.** Recogen el considerando 12: los sistemas de IA deben distinguirse del
    «simpler traditional software» y no cubren los sistemas «based on the rules defined solely by
    natural persons to automatically execute operations» [basados en reglas definidas únicamente
    por personas para ejecutar operaciones de forma automática].
  - **§ 46, «Basic data processing».** Estos sistemas «operate based on fixed human-programmed
    rules, without using AI techniques, such as machine learning or logic-based inference, to
    generate outputs» [funcionan con reglas fijas programadas por personas, sin técnicas de IA
    como el aprendizaje automático o la inferencia lógica]. Quedan fuera de la definición.
  - **Matiz importante (§ 39).** Los enfoques basados en lógica y conocimiento **sí** son técnicas
    de IA: «Instead of learning from data, these AI systems learn from knowledge including rules,
    facts and relationships encoded by human experts» [en lugar de aprender de datos, estos
    sistemas aprenden de conocimiento, incluidas reglas codificadas por expertos]. Es el caso de
    los sistemas expertos con **motor de inferencia**. La diferencia está en si el sistema
    **infiere**, es decir, si razona sobre las reglas, o si solo **ejecuta** reglas fijas.
  - **§ 6 y § 62. No hay listas automáticas.** Cada sistema se evalúa por sus características, y
    «No automatic determination or exhaustive lists of systems that either fall within or outside
    the definition of an AI system are possible» [no caben determinaciones automáticas ni listas
    exhaustivas].
- **Directrices del art. 50, § 30.i** (el enlace de § 1.1). Para estar en el ámbito del 50.1, el
  sistema debe cumplir la definición, lo que «excludes simple non-AI automated response mechanisms
  (e.g., traditional out-of-office emails, rule-based quick message answers)» [excluye los
  mecanismos de respuesta automática que no son IA, como los correos de fuera de la oficina o las
  respuestas rápidas basadas en reglas]. **[V]**

### 2.3 Conclusión para el robot de hoy

- **[I]** El guion local de hoy **no es un sistema de IA**: botones u opciones que llevan a
  respuestas redactadas por personas, sin modelo entrenado, sin clasificador aprendido y sin motor
  de inferencia. Por tanto, **el art. 50.1 no se aplica**. Encaja en «rule-based quick message
  answers» (§ 30.i) y en «basic data processing» (§ 46).
- **[I]** Esta conclusión cambia si el guion incorpora cualquiera de estas piezas:
  - un clasificador de intenciones entrenado;
  - *embeddings* o búsqueda semántica con un modelo;
  - una librería de NLU con modelo aprendido;
  - un motor de reglas que **infiera**, en lugar de solo ejecutar.
  El § 62 exige analizar cada caso. Recomiendo **documentar la arquitectura del guion**: árbol
  fijo, coincidencia literal y sin modelo.
- **[I]** Que el art. 50.1 no se aplique **no permite anunciarlo como «IA»**. Las Directrices
  (§ 50) recuerdan que la Directiva de prácticas comerciales desleales prohíbe las acciones
  engañosas sobre las características principales de un servicio. Llamar «IA» a un guion sería
  impreciso de cara al consumidor.

---

## 3. RGPD y AEPD

### 3.1 Hoy: el chat recoge el nombre (y quizá el teléfono) y el usuario lo envía por WhatsApp

**Flujo de datos.** El nombre se escribe en el navegador y el JavaScript compone el enlace
`wa.me/<número>?text=…`. Al pulsarlo se abre WhatsApp con el texto ya escrito. La ayuda oficial
de WhatsApp dice: «The pre-filled message will automatically appear in the text field of a chat.»
[El mensaje prellenado aparecerá automáticamente en el campo de texto del chat]
(<https://faq.whatsapp.com/5913398998672934>). **[V]** Es decir, **quien envía es el usuario**, y
puede editar el texto antes. **[I]**

- **¿Hay tratamiento por parte del salón?** Sí, en el momento en que recibe el mensaje. Ya lo
  concluyó `docs/research/legal-rgpd.md` §1. **[V en ese informe]**
  - Si hay tratamiento por parte del salón mientras el dato solo existe en el navegador del
    usuario, sin transmitirse a nadie: **NO CONFIRMADO.** No he encontrado un pronunciamiento de
    la AEPD sobre el procesamiento que ocurre solo en el dispositivo en un chat web.
  - **[I]** Lo prudente es tratar el envío por WhatsApp como el **punto de recogida** e informar
    **antes** de él.
- **Deber de informar (art. 13.1 RGPD).** El responsable informa «en el momento en que estos se
  obtengan, le facilitará toda la información indicada a continuación». Eso incluye la identidad
  y el contacto del responsable, los fines y la base jurídica, los destinatarios y, si las hay,
  las transferencias. **[V]**
  <https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32016R0679>
- **Información por capas (art. 11 LOPDGDD).** Basta con dar una información básica e indicar
  «una dirección electrónica u otro medio que permita acceder de forma sencilla e inmediata a la
  restante información». La capa básica debe contener, al menos:
  - «a) La identidad del responsable del tratamiento y de su representante, en su caso. b) La
    finalidad del tratamiento.»
  - «c) La posibilidad de ejercer los derechos establecidos en los artículos 15 a 22». **[V]**
  <https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673>
- **Minimización (art. 5.1.c RGPD).** Los datos deben ser «adecuados, pertinentes y limitados a lo
  necesario en relación con los fines para los que son tratados». **[V]**
  - **[I]** **No pedir el teléfono en el chat.** El mensaje de WhatsApp ya llega desde el número
    del usuario, así que pedirlo duplica el dato.
  - **[I]** No invitar a escribir datos de salud, como alergias al pegamento de pestañas. Serían
    categoría especial (art. 9 RGPD) y exigirían otra base jurídica.
- **Base jurídica.** **[I]** Encaja en el art. 6.1.b: medidas precontractuales a petición del
  interesado, porque pide información o cita. No lo he contrastado con un criterio específico de
  la AEPD. **NO CONFIRMADO.**
- **Si el chat guarda estado en el navegador** (localStorage, sessionStorage o cookies).
  - El art. 22.2 LSSI exige consentimiento informado para los «dispositivos de almacenamiento y
    recuperación de datos». La excepción es lo «estrictamente necesario, para la prestación de un
    servicio de la sociedad de la información expresamente solicitado por el destinatario». **[V]**
    <https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758>
  - La Guía de cookies de la AEPD (mayo 2024) extiende el art. 22.2 a «cookies y tecnologías
    similares utilizadas (tales como local shared objects o flash cookies, web beacons o bugs,
    etc.)». Entre las exceptuadas cita las «Cookies de "entrada del usuario"». **[V]**
    <https://www.aepd.es/guias/guia-cookies.pdf>
  - **[I]** Guardar la conversación en curso para el propio usuario encaja en «entrada del
    usuario» y no requiere banner. Lo más limpio es **no persistir nada**: estado en memoria o,
    como mucho, en sessionStorage.

**Guías de la AEPD sobre chatbots e IA** (no hay una específica para «chatbot de guion en una web»;
**NO CONFIRMADO** que exista):

- **Infografía «Recomendaciones para usuarios en la utilización de chatbots con inteligencia
  artificial»** (sin fecha visible): <https://www.aepd.es/infografias/info-recomendaciones-chatbots-ia.pdf>. **[V]**
  - Pide revisar que la política de privacidad incluya la «identificación clara y precisa del
    responsable del tratamiento».
  - Y la «información sobre si el chatbot continúa aprendiendo de las conversaciones mantenidas
    con los usuarios».
  - Sobre menores: «Un chatbot no es un juguete.»
- **«Adecuación al RGPD de tratamientos que incorporan Inteligencia Artificial. Una
  introducción»** (febrero de 2020): <https://www.aepd.es/guias/adecuacion-rgpd-ia.pdf>. **[V]**
- **«Inteligencia Artificial agéntica desde la perspectiva de protección de datos»** (V1.2,
  febrero de 2026; nota de prensa de 18-feb-2026): <https://www.aepd.es/guias/orientaciones-ia-agentica.pdf>
  y <https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/la-agencia-publica-unas-orientaciones-sobre-inteligencia>. **[V]**
  Es la más aplicable al escenario con servidor (§ 3.2).

### 3.2 El día del servidor, con un LLM de un proveedor de EE. UU.

- **Roles.** El salón seguiría siendo **responsable**.
  - La guía de IA agéntica de la AEPD dice que, si se envía información personal a servicios de
    terceros en el marco del tratamiento, «dichos servicios actuarían como encargados de ese
    tratamiento». **[V]**
  - **[I]** Anthropic, por la API, y el hosting del servidor serían **encargados**.
- **Contrato de encargo (art. 28 RGPD).** **[V]**
  - El responsable «elegirá únicamente un encargado que ofrezca garantías suficientes para aplicar
    medidas técnicas y organizativas apropiados».
  - Además, «El tratamiento por el encargado se regirá por un contrato u otro acto jurídico», que
    debe regular también a los subencargados (art. 28.2).
  - La misma guía de la AEPD pide evaluar «el artículo 28 del RGPD, transferencias
    internacionales, conservación de datos».
  - El detalle del DPA de Anthropic está en `03-claude-api.md`: incorpora cláusulas
    contractuales tipo y conserva los datos 30 días. **No lo he verificado en fuente oficial de la
    lista**; es fuente del proveedor.
- **WhatsApp con API.** La cláusula 1.4 de las condiciones de Meta dice: «En la medida en que Meta
  actúe como Encargado del tratamiento de los Datos personales de los que tú eres Responsable».
  En ese caso se aplican las «Meta Global Processor Terms». Para los datos de los que el negocio y
  Meta son responsables independientes, se aplica otro documento. **[V]**
  <https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform>
- **Transferencias internacionales (capítulo V RGPD).**
  - **Adecuación (art. 45.1).** Con decisión de adecuación, «Dicha transferencia no requerirá
    ninguna autorización específica». **[V]**
  - **EU-US Data Privacy Framework.** Decisión de Ejecución (UE) 2023/1795, de 10-7-2023.
    - El Tribunal General la confirmó el 3-9-2025 (T-553/23, Latombe/Comisión). La AEPD lo
      valoró en su nota de 3-9-2025:
      <https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-valora-sentencia-tribunal-general-ue-que-confirma-marco-transferencias-datos-ue-eeuu>. **[V]**
    - Se recurrió en casación: «Appeal brought on 31 October 2025 by Philippe Latombe against the
      judgment of the General Court», asunto **C-703/25 P** (DO C/2025/6610, 22-12-2025).
      <https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:C_202506610> **[V]**
    - **Estado a 27-09-2026:** InfoCuria muestra el asunto C-703/25 P como **«Pendiente»**, con un
      auto de 04/06/2026 (ECLI:EU:C:2026:465) cuyo contenido **no he podido leer** (EUR-Lex no lo
      sirve). **[V]** estado / **NO CONFIRMADO** contenido del auto.
      <https://curia.europa.eu/juris/liste.jsf?num=C-703/25&language=en>
    - **Hoy, el DPF sigue siendo una decisión de adecuación vigente.** **[V]**
  - **¿Cubre el DPF a Anthropic?** En la lista oficial del Departamento de Comercio de EE. UU.
    (<https://www.dataprivacyframework.gov/list>) la búsqueda «Anthropic» dio **«Query returned no
    results»**. La misma búsqueda con «Microsoft» sí devolvió resultados, así que el buscador
    funcionaba. Es una fuente oficial, pero de fuera de la lista del encargo. **[V]**
    - **[I]** No se puede usar el DPF como base de la transferencia a Anthropic. Hace falta una
      garantía del art. 46, como las cláusulas contractuales tipo del DPA.
  - **Informar de la transferencia (art. 13.1.f).** Hay que informar de «la intención del
    responsable de transferir datos personales a un tercer país… y la existencia o ausencia de una
    decisión de adecuación». **[V]**
  - **AEPD, IA agéntica, apartado «Transferencias internacionales».**
    - Hay que asegurar «que se realizan con las garantías del Capítulo V del RGPD e informar
      adecuadamente».
    - Si no existen esas garantías, «habrá que plantearse el rediseño de los agentes o la elección
      de otro tipo de IA agéntica». **[V]**
- **Pendiente de verificar el día del servidor:**
  - El «Ómnibus Digital» de datos, COM(2025) 837, de 19-11-2025, propone modificar el RGPD y la
    Directiva 2002/58/CE (<https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:52025PC0837>).
    Su estado legislativo a septiembre de 2026: **NO CONFIRMADO** (no investigado).
  - Si el tratamiento requiere una EIPD (art. 35) según la lista de la AEPD: **NO CONFIRMADO**
    (no investigado).

---

## 4. WhatsApp: condiciones para proveedores de IA, uso por un negocio y antimonopolio

### 4.1 Dónde están hoy las condiciones  **[V]**

- `https://www.whatsapp.com/legal/business-solution-terms` responde con un **301** hacia
  **<https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform>**, titulada
  «Meta Terms for WhatsApp Business Platform». En inglés figura «Last Modified: September 23,
  2026» y en español «Última actualización: 23 de septiembre de 2026».
- La cláusula 7.2 dice: «Este Acuerdo se redactó en inglés.» Y añade que, frente a las
  traducciones, «prevalecerá la versión en inglés».
- **Ámbito.** Según la cláusula 1.1, se aplican a la **plataforma** (las API: Cloud API y
  similares). **[I]** No regulan el enlace `wa.me` que usa hoy la web, que solo abre un chat.
  Sí regularán la integración del servidor con WhatsApp.

### 4.2 Cláusula 4.7 «AI Providers»: texto literal relevante (versión inglesa, que prevalece)  **[V]**

- **Quién es «AI Provider».** «Providers and developers of artificial intelligence or machine
  learning technologies, including but not limited to large language models» [proveedores y
  desarrolladores de tecnologías de IA o aprendizaje automático, incluidos los modelos de lenguaje
  grandes]. La lista sigue con las plataformas generativas y los asistentes de propósito general.
- **Prohibición.** Esos proveedores «are strictly prohibited from accessing or using the WhatsApp
  Business Platform» [tienen terminantemente prohibido acceder a la plataforma o usarla]…
  - …pero solo «when such technologies are the primary (rather than incidental or ancillary)
    functionality being made available» [cuando esas tecnologías son la funcionalidad principal, y
    no incidental o auxiliar]…
  - …y siempre «as determined by Meta in its sole discretion» [según determine Meta a su exclusivo
    criterio].
- **Excepción por países.** «provided, however, that such technologies may be made available to
  businesses in certain countries as set forth here» [aunque esas tecnologías pueden ofrecerse en
  ciertos países, según se indica aquí]. El «here» enlaza a la página de desarrolladores de § 4.4.
- **Contratar a un proveedor de IA como proveedor de soluciones.** Está permitido: «you may retain
  an AI Provider as your Solution Provider». Con una condición: los datos de la plataforma no
  pueden usarse «to create, develop, train, or improve any machine learning or artificial
  intelligence systems» [para crear, desarrollar, entrenar o mejorar sistemas de IA]. Sí se permite
  ajustar un modelo de **uso exclusivo** del negocio.
- **Fecha de efecto.**
  - La página oficial de desarrolladores habla de las condiciones «updated on January 15, 2026» y
    dice que los proveedores de IA quedan «only permitted to offer general-purpose AI assistants on
    the WhatsApp Business Platform where Meta is legally required to permit this use case» [solo
    pueden ofrecer asistentes de propósito general donde Meta esté legalmente obligada a
    permitirlo].
    <https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ai-providers>
  - La Comisión precisa los plazos: «For AI providers already present on WhatsApp, the update will
    apply as of 15 January 2026». Para los proveedores nuevos se aplicaba desde el 15-10-2025.
    <https://ec.europa.eu/commission/presscorner/detail/en/ip_25_2896>

### 4.3 ¿Puede un negocio (el salón) usar IA para atender a sus propios clientes?

- **Comisión Europea, IP/25/2896 (4-dic-2025):** «Businesses may still use AI tools for ancillary
  or support functions, such as automated customer support offered via WhatsApp.» [Las empresas
  pueden seguir usando herramientas de IA para funciones auxiliares o de apoyo, como la atención
  al cliente automatizada por WhatsApp.] **[V]**
- **Meta, en la página de precios para proveedores de IA:** «This does NOT change how Meta charges
  all other businesses using the WhatsApp Business Platform.» [Esto NO cambia cómo cobra Meta al
  resto de empresas.] **[V]**
- **[I] Sí, está permitido.** El salón no desarrolla ni vende IA. Su servicio principal son las
  uñas y pestañas, y el asistente sería **auxiliar**, de atención al cliente.
  - Riesgo residual: la cláusula deja la calificación al «sole discretion» de Meta.
  - Mitigación: mantener el bot **acotado** a los temas del salón (servicios, horarios, citas) y no
    ofrecerlo como asistente general.
- **Otras normas de WhatsApp que aplicarán al servidor.** La WhatsApp Business Messaging Policy,
  «Last updated: September 23, 2026», está en <https://whatsappbusiness.com/policy/>, adonde
  redirige `whatsapp.com/legal/business-policy`. **[V]**
  - **Automatización con vía de escape a humanos:** «You may use automation when responding during
    the 24-hour window, but must also have available prompt, clear, and direct escalation paths.»
    [Puedes automatizar las respuestas dentro de la ventana de 24 h, pero debes ofrecer vías claras
    y directas para escalar el caso.] Cita como ejemplos el traspaso a un agente humano, el
    teléfono, el email, la web o la tienda.
  - **Consentimiento y política de privacidad.** Hace falta *opt-in* para iniciar conversaciones, y
    el negocio es responsable de los avisos y consentimientos, «including maintaining a published
    privacy policy» [incluido mantener publicada una política de privacidad].
- **Coste, para planificar.** La página oficial de precios (actualizada el 10-sep-2026) anuncia que
  desde el **1-oct-2026** se cobrarán los mensajes de servicio, con un tramo gratuito de **1 000
  mensajes de servicio al mes por número**. **[V]**
  <https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing>

### 4.4 Investigación antimonopolio (Comisión Europea e Italia): estado a septiembre de 2026

**Comisión Europea, asunto AT.41034 «Exclusion of AI competitors from WhatsApp»**
(<https://competition-cases.ec.europa.eu/cases/AT.41034>). **[V]**

| Fecha | Hito | Fuente oficial |
|---|---|---|
| 04-12-2025 | Apertura del procedimiento. Cubre el EEE salvo Italia. | IP/25/2896 |
| 09-02-2026 | Pliego de cargos sobre medidas cautelares. | IP/26/310 |
| 02-03-2026 | Respuesta de Meta. | Registro del asunto |
| 04-03-2026 | Meta revisa la política: readmite a los asistentes de terceros, pero de pago. | IP/26/805 |
| 15-04-2026 | Pliego complementario. La investigación se amplía a **Italia**. | IP/26/805 |
| 05-05-2026 | Audiencia. | Registro del asunto |
| **09-06-2026** | **Decisión de medidas cautelares.** | IP/26/1276 |

- **Qué ordena la decisión del 9-6-2026** (IP/26/1276):
  - Restablecer el acceso gratuito a la API de WhatsApp para los asistentes de IA de propósito
    general de terceros, «under the same terms and conditions that were in place before 15 October
    2025» [en las mismas condiciones que antes del 15 de octubre de 2025].
  - Mantenerlo hasta la decisión final.
  - Plazo: «Meta must comply with these measures within 5 working days.» [Meta debe cumplir en 5
    días hábiles.]
  - Además: «The substantive investigation on the merits of all parts of the case is still
    ongoing.» [La investigación sobre el fondo sigue en curso.]
  - Enlaces:
    - <https://ec.europa.eu/commission/presscorner/detail/en/ip_26_1276>
    - <https://ec.europa.eu/commission/presscorner/detail/en/ip_26_805>
    - <https://ec.europa.eu/commission/presscorner/detail/en/ip_26_310>
- **Texto de la decisión:** el registro dice «This text is not yet available» (27-09-2026). **[V]**
- **Recurso de Meta contra las cautelares ante el Tribunal General: NO CONFIRMADO.** No lo he
  encontrado en las fuentes oficiales consultadas.

**Italia, AGCM, asunto A576.** **[V]**

- **Julio de 2025:** abre la investigación.
- **25-11-2025:** la amplía y abre el procedimiento cautelar.
- **24-12-2025:** «ordered Meta to immediately suspend the WhatsApp Business Solution Terms»
  [ordenó a Meta suspender de inmediato las condiciones], con efecto en Italia.
  <https://en.agcm.it/en/media/press-releases/2025/12/A576>
- **15-4-2026:** la Comisión amplió su investigación a Italia «in cooperation with the Italian
  competition authority» (IP/26/805).
- **Estado actual del procedimiento A576** (cerrado, archivado o subsumido): **NO CONFIRMADO.** No
  he encontrado comunicados de la AGCM de 2026 sobre el asunto.

**Qué ha hecho Meta**, según su página oficial para proveedores de IA (actualizada el 1-sep-2026). **[V]**

- Cobró a los proveedores de IA por los mensajes sin plantilla en el EEE, **España incluida**,
  entre el 11-3-2026 y el 12-5-2026, y en Italia entre el 16-2-2026 y el 12-5-2026.
- Después dice: «Effective May 13, 2026 […] Meta will no longer charge "AI Providers" for
  non-template messages delivered to users in certain markets» [desde el 13 de mayo de 2026 Meta
  deja de cobrar a los proveedores de IA por esos mensajes en ciertos mercados].
- La cláusula 4.7 **sigue** en las condiciones actualizadas el 23-9-2026. **[V]**
- Cómo encaja esa redacción con las cautelares de la Comisión: **NO CONFIRMADO.** Meta no lo
  explica en las páginas consultadas.

**Relevancia para el salón.** **[I]** El litigio trata del acceso de los **asistentes de propósito
general** (tipo ChatGPT) a WhatsApp. No restringe al negocio que usa IA para su propia atención al
cliente, que la Comisión describe como uso permitido (§ 4.3).

---

## 5. Implicaciones para el diseño

### 5.1 HOY: modo demo, guion local, sin IA ni red

1. **Etiqueta honesta, sin decir «IA».**
   - El art. 50.1 no obliga (§ 2.3), pero no se debe presentar como IA. Texto propuesto, fijo en la
     cabecera del chat y en el primer mensaje:
     «Asistente automático con respuestas predefinidas · **demo**. No es una persona ni usa
     inteligencia artificial.»
   - Esto cumple también la política de datos demo con leyenda visible (memoria del proyecto).
   - **[I]** El robot animado como avatar está bien: no es una figura humana. Hay que evitar fotos
     o nombres de persona (Directrices del art. 50, § 38, § 45).
2. **Pedir solo lo necesario.**
   - **Nombre opcional** y **nunca el teléfono**: WhatsApp ya lo aporta.
   - Sin campos libres que inviten a contar datos de salud.
   - Mejor opciones cerradas (servicio y franja horaria) que texto libre.
3. **Primera capa de información justo encima del botón «Enviar por WhatsApp»** (art. 11
   LOPDGDD). Por ejemplo:
   «Al pulsar se abrirá WhatsApp con este mensaje; tú decides si lo envías. Responsable:
   [titular]. Finalidad: atender tu consulta o cita. Derechos: [enlace a Privacidad].»
   - **Bloqueante:** la web aún no tiene página de privacidad. En `src/` solo hay una coincidencia
     de «privacidad», en un test. `legal-rgpd.md` ya la exige, y necesita el nombre legal y el NIF
     del titular.
4. **Mostrar el texto final antes de enviar.** El usuario debe ver y poder editar el mensaje
   prellenado, y WhatsApp se lo muestra de nuevo en el campo de texto (§ 3.1).
5. **Cero red y cero persistencia.**
   - Nada de analítica, *fetch* ni `localStorage` en el chat. Estado en memoria.
   - Si algún día hace falta recordar algo, usar `sessionStorage` y solo para la conversación en
     curso («entrada del usuario», exceptuada por el art. 22.2 LSSI según la AEPD).
6. **Salidas directas siempre visibles:** teléfono y WhatsApp sin pasar por el guion. Es buena
   práctica y adelanta la «escalation path» que WhatsApp exigirá con el servidor.
7. **Accesibilidad del aviso.** El 50.5 exige que sea accesible cuando haya IA. Conviene hacerlo
   accesible ya: texto real (no imagen), foco gestionable y rol de diálogo. Ver
   `docs/research/legal-eaa.md`. **[I]**

### 5.2 El día del servidor: LLM (Claude API) en la web y en WhatsApp

1. **El art. 50.1 se aplica** a un chatbot de atención al cliente abierto al público, que las
   Directrices citan como ejemplo no obvio (§ 45).
   - **Aviso en el primer turno**, en la web y en WhatsApp, al inicio de cada sesión: «Soy un
     asistente de inteligencia artificial, no una persona».
   - **Insignia «IA» persistente** junto al campo de entrada, en la web.
   - **Nunca** solo en las condiciones o en la política de privacidad (§ 38).
   - **Diseñar el prompt** para que reconozca que es una IA siempre que se le pregunte (§ 40).
   - Texto sencillo y accesible, porque puede haber menores o personas mayores (considerando 132,
     § 34 de las Directrices).
   - Cambiar la etiqueta «demo» por la de IA y quitar la frase «no usa inteligencia artificial».
2. **Art. 50.2: marcado del texto generado.** Puede aplicarse al salón como proveedor del sistema
   (§ 1.4). Verificar si Anthropic ofrece un marcado conforme en el que apoyarse (**NO
   CONFIRMADO**).
3. **Papel del salón y alfabetización.**
   - **[I]** El salón sería **proveedor** del sistema (lo pone en servicio con su nombre) y
     **responsable del despliegue**.
   - Nuevo art. 4: adoptar medidas de alfabetización en IA para quien lo gestione, por ejemplo una
     nota interna de uso y límites.
4. **Traspaso a una persona.**
   - WhatsApp exige vías claras para escalar a humanos. En la web, ofrecer «Hablar con el salón».
   - Si una persona revisa y envía la respuesta, esa respuesta deja de ser «salida de IA» a
     efectos del aviso (§ 30.iii). Si la envía el LLM, se etiqueta como IA.
5. **RGPD.**
   - Firmar o aceptar contratos de encargo con Anthropic, el hosting y Meta (Meta Global
     Processor Terms).
   - Base de la transferencia a EE. UU.: cláusulas contractuales tipo. Anthropic **no aparece** en
     la lista DPF a 27-09-2026.
   - Actualizar la política de privacidad: destinatarios, transferencia y garantía, plazo de
     conservación, que **no se entrena** con los datos, y la base jurídica.
   - Minimizar lo que se envía al LLM: no mandar el teléfono ni el historial completo si no hace
     falta.
   - Seguir el asunto **C-703/25 P**.
6. **Condiciones de WhatsApp.**
   - Usar la plataforma (API) con el bot **acotado** a los temas del salón, para seguir siendo uso
     «auxiliar» (cláusula 4.7).
   - Garantizar por contrato que los datos de la plataforma **no se usan para entrenar** modelos.
   - Respetar el *opt-in* y la ventana de 24 h.
   - Presupuestar los mensajes de servicio: se cobran desde el 1-10-2026, con 1 000 al mes
     gratis por número.
7. **Revisar antes del lanzamiento**, porque todo esto cambia rápido:
   - la cláusula 4.7 (última modificación 23-9-2026);
   - el estado de AT.41034 y del procedimiento de la AGCM;
   - C-703/25 P;
   - COM(2025) 837;
   - una posible norma española sobre la autoridad de vigilancia de la IA (**no investigado**).

---

## 6. Fuentes (todas consultadas el 2026-09-27)

| # | Fuente oficial | URL |
|---|---|---|
| 1 | Reglamento (UE) 2024/1689, texto ES (arts. 3.1, 3.3, 50, 99, 113; cons. 12 y 132) | <https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32024R1689> |
| 2 | Reglamento (UE) 2026/1744, Ómnibus digital sobre IA (ES y EN) | <https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32026R1744> |
| 3 | Propuesta COM(2025) 836 | <https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:52025PC0836> |
| 4 | Versión consolidada del AI Act, 27-07-2026 | <https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng> |
| 5 | Directrices del art. 50, C(2026) 5054, 20-7-2026 (PDF) | <https://ai-act-service-desk.ec.europa.eu/sites/default/files/2026-07/guidelines_on_the_implementation_of_the_transparency_obligations_for_certain_ai_systems_under_article_50_of_the_ai_act_bzptwqhk0ikg1dtlddap41psfy_131215.pdf> |
| 6 | Página de las Directrices del art. 50 | <https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems> |
| 7 | Código de buenas prácticas sobre contenido generado por IA | <https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content> |
| 8 | Directrices sobre la definición de sistema de IA (página) | <https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-ai-system-definition-facilitate-first-ai-acts-rules-application> |
| 9 | Directrices sobre la definición, C(2025) 5053 (PDF EN) | <https://ec.europa.eu/newsroom/dae/redirection/document/112455> |
| 10 | RGPD, texto ES (arts. 5, 6, 13, 28, 45) | <https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32016R0679> |
| 11 | LOPDGDD, art. 11 (BOE) | <https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673> |
| 12 | LSSI, art. 22.2 (BOE) | <https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758> |
| 13 | AEPD, Guía de cookies (mayo 2024) | <https://www.aepd.es/guias/guia-cookies.pdf> |
| 14 | AEPD, infografía sobre chatbots con IA | <https://www.aepd.es/infografias/info-recomendaciones-chatbots-ia.pdf> |
| 15 | AEPD, Adecuación al RGPD de tratamientos con IA (2020) | <https://www.aepd.es/guias/adecuacion-rgpd-ia.pdf> |
| 16 | AEPD, IA agéntica (V1.2, feb-2026) y nota de prensa | <https://www.aepd.es/guias/orientaciones-ia-agentica.pdf> · <https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/la-agencia-publica-unas-orientaciones-sobre-inteligencia> |
| 17 | AEPD, nota sobre la sentencia del DPF (3-9-2025) | <https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-valora-sentencia-tribunal-general-ue-que-confirma-marco-transferencias-datos-ue-eeuu> |
| 18 | DO C/2025/6610, recurso C-703/25 P | <https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:C_202506610> |
| 19 | InfoCuria, ficha de C-703/25 P | <https://curia.europa.eu/juris/liste.jsf?num=C-703/25&language=en> |
| 20 | Comisión, página sobre transferencias UE-EE. UU. | <https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/eu-us-data-transfers_en> |
| 21 | Lista DPF (Dept. de Comercio de EE. UU.; fuera de la lista del encargo) | <https://www.dataprivacyframework.gov/list> |
| 22 | Meta Terms for WhatsApp Business Platform (EN y ES), cl. 1.4, 4.7 y 7.2 | <https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform> |
| 23 | Meta for Developers, precios para proveedores de IA | <https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ai-providers> |
| 24 | Meta for Developers, precios de la plataforma | <https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing> |
| 25 | WhatsApp Business Messaging Policy | <https://whatsappbusiness.com/policy/> (redirige desde whatsapp.com/legal/business-policy) |
| 26 | Ayuda de WhatsApp, «click to chat» | <https://faq.whatsapp.com/5913398998672934> |
| 27 | Comisión, IP/25/2896 (4-12-2025) | <https://ec.europa.eu/commission/presscorner/detail/en/ip_25_2896> |
| 28 | Comisión, IP/26/310 (9-2-2026) | <https://ec.europa.eu/commission/presscorner/detail/en/ip_26_310> |
| 29 | Comisión, IP/26/805 (15-4-2026) | <https://ec.europa.eu/commission/presscorner/detail/en/ip_26_805> |
| 30 | Comisión, IP/26/1276 (9-6-2026) | <https://ec.europa.eu/commission/presscorner/detail/en/ip_26_1276> |
| 31 | Registro del asunto AT.41034 | <https://competition-cases.ec.europa.eu/cases/AT.41034> |
| 32 | AGCM, A576, cautelares (24-12-2025) | <https://en.agcm.it/en/media/press-releases/2025/12/A576> |

**Notas de método.** EUR-Lex, el Press corner y InfoCuria no se dejan leer con un *fetch* simple
(devuelven un reto anti-bot o páginas vacías). Los leí con el navegador integrado y, para el Press
corner, con su API pública de documentos. Los PDF se convirtieron a texto con `pdftotext` para
citar de forma literal.

## 7. Lo que queda NO CONFIRMADO

- Si hay «tratamiento» por parte del salón mientras el dato vive solo en el navegador (§ 3.1).
- La base jurídica exacta según el criterio de la AEPD (§ 3.1).
- El contenido del auto del TJUE de 04-06-2026 en C-703/25 P (§ 3.2).
- El estado legislativo de COM(2025) 837 (Ómnibus de datos y RGPD) y si hace falta una EIPD (§ 3.2).
- Si Anthropic ofrece marcado de texto conforme al art. 50.2 (§ 1.4).
- Si Meta ha recurrido las cautelares, y cómo encaja la cláusula 4.7 vigente con ellas (§ 4.4).
- El estado actual del procedimiento A576 de la AGCM (§ 4.4).
- Si existe una guía de la AEPD específica sobre chatbots de guion en la web: no encontrada.
