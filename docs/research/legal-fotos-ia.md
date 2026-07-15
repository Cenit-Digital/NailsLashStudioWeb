# Legal ES/UE — Fotos generadas por IA en la sección "Nuestro equipo"

> **Área:** Legal ES/UE
> **Pregunta:** ¿Puede la web publicar fotos de personas generadas por IA presentándolas
> como las profesionales reales del salón? ¿Qué norma lo prohíbe? ¿Obliga el AI Act a
> etiquetar contenido sintético y desde cuándo? ¿Y si se usan fotos de personas reales
> sin consentimiento?
> **Fecha de investigación:** 2026-07-15
> **Autor:** subagente investigador (Legal ES/UE)
> **Estado del repo al investigar:** Fase 0, plantilla virgen, sin código
> (`progress/current.md:9`, `feature_list.json:13-27`)

> ⚠️ **Aviso.** Este informe es investigación técnico-jurídica documentada con fuentes
> oficiales. **No es asesoramiento legal.** Las conclusiones marcadas como *inferencia*
> requieren validación por abogado antes de publicar. Ver §3.

---

## 1. Respuesta ejecutiva

**Qué hacemos: NO publicamos fotos generadas por IA presentándolas como las
profesionales reales del salón. La feature no se construye así.**

Cuatro razones, en orden de solidez jurídica:

1. **Es un acto de engaño (verificado).** Presentar caras inventadas por IA como
   "nuestro equipo" es información falsa sobre *la identidad y las cualificaciones del
   profesional* — exactamente el supuesto del **art. 5.1.g) de la Ley 3/1991 de
   Competencia Desleal**, y sobre *las características principales del servicio*
   (art. 5.1.b). Esto **no depende del AI Act**: la LCD lo prohíbe desde 2009, hoy,
   sin matices ni fechas de aplicación pendientes. Es la razón *load-bearing*.

2. **Es una infracción administrativa sancionable (verificado).** El TRLGDCU tipifica
   como infracción "el uso de prácticas comerciales desleales con los consumidores o
   usuarios" (**art. 47.m**), sancionable con multa. Calificada en principio como leve
   (150–10.000 €), puede subir a grave o muy grave si concurren agravantes
   (arts. 48.2.a y 49.1). El expediente lo abre la administración de consumo de la
   **Comunidad de Madrid** — jurisdicción del salón (Las Rozas).

3. **El AI Act probablemente NO nos obliga a etiquetar en este caso concreto — y da
   igual (verificado + inferencia).** La obligación de marcado legible por máquina
   (art. 50.2) recae sobre **el proveedor** del generador (Midjourney, OpenAI…), **no
   sobre el salón**. La obligación de *hacer público* que el contenido es artificial
   (art. 50.4) recae sobre el responsable del despliegue, pero **solo para
   "ultrasuplantaciones"**, definidas como contenido que "se asemeja a personas […]
   **reales**" (art. 3.60). Una cara *inventada* que no se parece a nadie existente
   probablemente **no encaja en la definición literal** *(inferencia — ver §3)*.
   **Conclusión práctica: no nos apoyemos en el AI Act para decidir esto.** Etiquetar
   "imagen generada por IA" **no sanaría el engaño** de la LCD: seguiríamos afirmando
   que esas son nuestras profesionales, que es la mentira. Un disclaimer no convierte
   en lícita una afirmación falsa sobre quién trabaja en el salón.

4. **Fechas (verificado):** el AI Act **es aplicable desde el 2 de agosto de 2026**
   con carácter general (art. 113), y el art. 50 (capítulo IV) **no está en ninguna de
   las excepciones** → aplicable **2026-08-02**. Hoy es 2026-07-15: **faltan 18 días**.
   Hay un "Digital Omnibus" que retrasaría el marcado al 2026-12-02, pero **NO está
   publicado en el DOUE** (§2.3.4) → **no podemos contar con ese retraso**.

**Sobre fotos de personas reales sin consentimiento: prohibido igualmente
(verificado).** La **LO 1/1982, art. 7.6** califica de intromisión ilegítima "la
utilización del nombre, de la voz o de la imagen de una persona para fines
publicitarios, comerciales o de naturaleza análoga". Una web comercial es fin
comercial. Requiere **consentimiento expreso** (art. 2.2), **revocable** (art. 2.3), y
el perjuicio **se presume** una vez probada la intromisión (art. 9.3). Las excepciones
de personas con notoriedad pública (art. 8.2) **no cubren** a las empleadas de un salón.

### Qué hacemos en su lugar (las tres opciones lícitas)

| Opción | Requisitos | Riesgo |
| ------ | ---------- | ------ |
| **A. Fotos reales del equipo real** (recomendada) | Consentimiento **expreso y por escrito** de cada profesional (LO 1/1982 art. 2.2), con cláusula de revocación y RGPD | Bajo. Es la opción por defecto |
| **B. Sin sección "equipo"** | Ninguno | Nulo |
| **C. Ilustración / stock manifiestamente NO identificativo** | Que **ningún usuario medio** pueda entender que son las profesionales del salón. Sin nombres, sin cargos, sin "nuestro equipo" | Medio: la frontera es difusa. Si induce a error → art. 5 LCD igualmente |

> **Nota sobre la opción A y el RGPD:** las fotos del equipo real son datos personales.
> El consentimiento de la LO 1/1982 (derecho a la imagen) y la base jurídica del RGPD
> son **dos cosas distintas** y hacen falta las dos. El análisis RGPD **no está cubierto
> en este informe** — es otra área de investigación. Ver §3.

---

## 2. Desarrollo con evidencia

### 2.1 Ley 3/1991, de Competencia Desleal (LCD)

**Fuente:** BOE-A-1991-628, texto consolidado.
API oficial de datos abiertos del BOE:
`https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-1991-628/texto`
Consulta web: <https://www.boe.es/buscar/act.php?id=BOE-A-1991-628>
*(Todos los textos citados son la **versión vigente** — última `<version>` de cada
bloque en el XML consolidado. Se indica la norma modificativa.)*

#### Art. 5 — Actos de engaño ✅ VERIFICADO — **este es el artículo que nos prohíbe hacerlo**

Versión vigente (mod. por RDL 24/2021, vigor 2022-05-28; redacción base de la
Ley 29/2009):

> **Artículo 5. Actos de engaño.**
> 1. Se considera desleal por engañosa cualquier conducta que contenga **información
> falsa** o información que, aun siendo veraz, por su contenido o presentación **induzca
> o pueda inducir a error** a los destinatarios, siendo susceptible de alterar su
> comportamiento económico, siempre que incida sobre alguno de los siguientes aspectos:
> a) La existencia o la naturaleza del bien o servicio.
> b) **Las características principales del bien o servicio**, tales como su
> disponibilidad, sus beneficios, sus riesgos, su ejecución, su composición, sus
> accesorios, el procedimiento y la fecha de su fabricación o suministro, su entrega,
> su carácter apropiado, su utilización, su cantidad, sus especificaciones, su origen
> geográfico o comercial o los resultados que pueden esperarse de su utilización […]
> […]
> g) **La naturaleza, las características y los derechos del empresario o profesional o
> su agente, tales como su identidad y su solvencia, sus cualificaciones, su situación,
> su aprobación, su afiliación o sus conexiones** y sus derechos de propiedad
> industrial, comercial o intelectual, o los premios y distinciones que haya recibido.

**Subsunción (inferencia razonada):** publicar caras generadas por IA bajo el rótulo
"nuestro equipo" es *información falsa* que incide sobre:

- **la letra g)** — "la identidad" y "las cualificaciones" del profesional. Afirmamos
  que existen unas profesionales concretas que no existen.
- **la letra b)** — quién presta el servicio es característica principal de un servicio
  personalísimo como la manicura o las extensiones de pestañas.

El requisito de "susceptible de alterar su comportamiento económico" se cumple con
holgura: **el equipo es criterio de elección** en un salón de belleza — el cliente
elige por quién le atiende. Encaja además en el concepto de comportamiento económico
del art. 4.1.a) ("La selección de una oferta u oferente").

> ℹ️ **Ojo con la numeración.** El BOE mantiene el art. 5 original ("Cláusula general")
> y el vigente ("Actos de engaño") en el mismo bloque XML. Tras la Ley 29/2009 la
> cláusula general pasó al **art. 4** y los actos de engaño al **art. 5**. Verificado:
> el bloque `a4-2` del consolidado contiene "Artículo 4. Cláusula general" (vigente
> desde 2010-01-01) y el bloque `a4` contiene el antiguo "Ámbito territorial". La
> pregunta original citaba "arts. 5 y 7", y **es correcto en la numeración vigente**.

#### Art. 4 — Cláusula general ✅ VERIFICADO (refuerzo)

Vigente desde 2010-01-01 (Ley 29/2009):

> **Artículo 4. Cláusula general.**
> 1. Se reputa desleal todo comportamiento que resulte objetivamente contrario a las
> exigencias de la **buena fe**.
> En las relaciones con consumidores y usuarios se entenderá contrario a las exigencias
> de la buena fe el comportamiento de un empresario o profesional contrario a la
> **diligencia profesional** […] que distorsione o pueda distorsionar de manera
> significativa el comportamiento económico del **consumidor medio** […]
> A los efectos de esta ley se entiende por comportamiento económico del consumidor o
> usuario toda decisión por la que éste opta por actuar o por abstenerse de hacerlo en
> relación con:
> a) **La selección de una oferta u oferente.** […]

#### Art. 7 — Omisiones engañosas ✅ VERIFICADO — **aplicación matizada, leer con cuidado**

Vigente desde 2010-01-01 (Ley 29/2009):

> **Artículo 7. Omisiones engañosas.**
> 1. Se considera desleal la **omisión u ocultación de la información necesaria** para
> que el destinatario adopte o pueda adoptar una decisión relativa a su comportamiento
> económico con el debido conocimiento de causa. Es también desleal si la información
> que se ofrece es **poco clara, ininteligible, ambigua**, no se ofrece en el momento
> adecuado, o **no se da a conocer el propósito comercial** de esa práctica, cuando no
> resulte evidente por el contexto.
> 2. Para la determinación del carácter engañoso de los actos a que se refiere el
> apartado anterior, se atenderá al **contexto fáctico** en que se producen, teniendo en
> cuenta todas sus características y circunstancias y las **limitaciones del medio de
> comunicación utilizado**. […]

**Matiz honesto (inferencia).** El art. 7 encaja **peor** que el art. 5 en nuestro caso.
El art. 7 castiga *callar* información debida; aquí el problema es *afirmar* algo falso,
que es art. 5. El art. 7 sería el aplicable en el escenario alternativo: usar imágenes
de IA **sin** presentarlas como el equipo real pero **sin aclarar** que son ilustración,
dejando la ambigüedad ("poco clara, ambigua"). **No conviene apoyar el argumento
principal en el art. 7** — el art. 5 es el que muerde. *(Requiere validación de abogado.)*

#### Art. 32 — Acciones ✅ VERIFICADO (consecuencias civiles)

> **Artículo 32. Acciones.**
> 1. Contra los actos de competencia desleal, incluida la publicidad ilícita, podrán
> ejercitarse las siguientes acciones:
> 1.ª Acción declarativa de deslealtad.
> 2.ª Acción de cesación de la conducta desleal o de prohibición de su reiteración
> futura. Asimismo, podrá ejercerse la **acción de prohibición, si la conducta todavía
> no se ha puesto en práctica**.
> 3.ª Acción de remoción de los efectos producidos por la conducta desleal.
> 4.ª Acción de rectificación de las informaciones engañosas, incorrectas o falsas.
> 5.ª Acción de resarcimiento de los daños y perjuicios ocasionados por la conducta
> desleal, si ha intervenido dolo o culpa del agente.
> 6.ª Acción de enriquecimiento injusto […]
> 2. En las sentencias estimatorias […] el tribunal, si lo estima procedente, y con
> cargo al demandado, podrá acordar la **publicación total o parcial de la sentencia** […]

**Relevancia:** un salón competidor de Las Rozas tiene legitimación para pedir cesación
**y publicación de la sentencia**. Para un negocio local, la publicación de una
sentencia por engaño sobre su propio equipo es un daño reputacional mayor que la multa.

---

### 2.2 RDL 1/2007 (TRLGDCU) — prácticas comerciales desleales

**Fuente:** BOE-A-2007-20555, texto consolidado.
API: `https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-2007-20555/texto`
Web: <https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555>

#### Art. 19.2 — la pasarela hacia la LCD ✅ VERIFICADO

> 2. Sin perjuicio de lo dispuesto en los apartados siguientes, para la protección de
> los legítimos intereses económicos y sociales de los consumidores y usuarios, **las
> prácticas comerciales de los empresarios dirigidas a ellos están sujetas a lo
> dispuesto en esta ley, en la Ley 3/1991, de 10 de enero, de Competencia Desleal**, y
> en la Ley 7/1996 […] A estos efectos, se consideran prácticas comerciales de los
> empresarios con los consumidores y usuarios **todo acto, omisión, conducta,
> manifestación o comunicación comercial, incluida la publicidad y la comercialización**,
> directamente relacionada con la promoción, la venta o el suministro de bienes o
> servicios […] con independencia de que sea realizada **antes**, durante o después de
> una operación comercial.

**Consecuencia:** la web del salón es "comunicación comercial […] antes de una operación
comercial" → es práctica comercial → le aplica la LCD. El puente está verificado.

#### Art. 47.m) — infracción administrativa ✅ VERIFICADO

> **Artículo 47. Infracciones en materia de defensa de los consumidores y usuarios.**
> Son infracciones en materia de defensa de los consumidores y usuarios las siguientes:
> […]
> m) **El uso de prácticas comerciales desleales con los consumidores o usuarios.**

#### Arts. 48 y 49 — calificación y sanción ✅ VERIFICADO

> **Artículo 48. Calificación y Graduación de las infracciones.**
> 2. […] a) Las infracciones de los apartados f), g), i), k), **m)**, n), ñ), p), q) y t)
> del artículo 47 se calificarán como **leves**, salvo que tengan la consideración de
> graves de acuerdo con el apartado tercero de este artículo.

> **Artículo 49. Sanciones.**
> 1. La imposición de sanciones deberá garantizar, en cualquier circunstancia, que **la
> comisión de una infracción no resulte más beneficiosa para la parte infractora que el
> incumplimiento** de las normas infringidas. […]
> a) Infracciones **leves: entre 150 y 10.000 euros**, pudiéndose sobrepasar esas
> cantidades hasta alcanzar entre dos y cuatro veces el beneficio ilícito obtenido.
> b) Infracciones **graves: entre 10.001 y 100.000 euros** […] entre cuatro y seis veces
> el beneficio ilícito […]
> c) Infracciones **muy graves: ente [sic] 100.001 y 1.000.000 de euros** […]

**Lectura realista (inferencia):** el escenario base para un salón pequeño es
**infracción leve, 150–10.000 €**. No es una multa que hunda el negocio. **El riesgo
real no es la multa** — es la acción de cesación + publicación de sentencia del art. 32
LCD, y el daño reputacional de que se sepa que el equipo era inventado. *(La calificación
concreta depende de los agravantes del art. 48.3, que no he analizado en detalle.)*

---

### 2.3 Reglamento (UE) 2024/1689 (AI Act)

**Fuente:** DOUE, texto auténtico.
<https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=OJ:L_202401689>
Versión consolidada (CELEX 02024R1689-20240712):
<https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:02024R1689-20240712>

#### 2.3.1 Art. 50.2 — obligación del PROVEEDOR, no nuestra ✅ VERIFICADO

> **Artículo 50 — Obligaciones de transparencia de los proveedores y responsables del
> despliegue de determinados sistemas de IA**
> 2. **Los proveedores** de sistemas de IA, entre los que se incluyen los sistemas de IA
> de uso general, que generen contenido sintético de audio, imagen, vídeo o texto,
> velarán por que los resultados de salida del sistema de IA estén **marcados en un
> formato legible por máquina** y que sea posible detectar que han sido generados o
> manipulados de manera artificial. […] Esta obligación **no se aplicará** en la medida
> en que los sistemas de IA desempeñen una función de **apoyo a la edición estándar** o
> **no alteren sustancialmente los datos de entrada** facilitados por el responsable del
> despliegue o su semántica […]

**Clave:** el sujeto obligado es **el proveedor** (Midjourney, OpenAI, Adobe…). El salón
**no** es proveedor. **El art. 50.2 no impone al salón ninguna obligación de etiquetar.**
(Nota: la excepción de "apoyo a la edición estándar" implica que retocar una foto real
con herramientas normales no dispara la obligación.)

#### 2.3.2 Art. 50.4 — obligación del RESPONSABLE DEL DESPLIEGUE, solo para ultrasuplantaciones ✅ VERIFICADO (texto) / ⚠️ INFERENCIA (aplicación)

> 4. **Los responsables del despliegue** de un sistema de IA que genere o manipule
> imágenes o contenidos de audio o vídeo que constituyan una **ultrasuplantación** harán
> público que estos contenidos o imágenes han sido generados o manipulados de manera
> artificial. Esta obligación no se aplicará cuando la ley autorice su uso para detectar,
> prevenir, investigar o enjuiciar delitos. Cuando el contenido forme parte de una obra o
> programa **manifiestamente creativos, satíricos, artísticos, de ficción o análogos**,
> las obligaciones de transparencia […] se limitarán a la obligación de hacer pública la
> existencia de dicho contenido […] de una manera adecuada que no dificulte la exhibición
> o el disfrute de la obra.

> 5. La información a que se refieren los apartados 1 a 4 se facilitará a las personas
> físicas de que se trate **de manera clara y distinguible a más tardar con ocasión de la
> primera interacción o exposición**. La información se ajustará a los **requisitos de
> accesibilidad** aplicables.

**Definición de ultrasuplantación — art. 3, punto 60 ✅ VERIFICADO:**

> 60) **«ultrasuplantación»**: un contenido de imagen, audio o vídeo generado o
> manipulado por una IA que **se asemeja a personas, objetos, lugares, entidades o
> sucesos reales** y que puede inducir a una persona a pensar erróneamente que son
> auténticos o verídicos;

**Considerando 134 ✅ VERIFICADO** (refuerza el requisito de semejanza):

> Además de las soluciones técnicas utilizadas por los proveedores del sistema de IA,
> los responsables del despliegue que utilicen un sistema de IA para generar o manipular
> un contenido de imagen, audio o vídeo […] que **se asemeje notablemente a personas,
> objetos, lugares, entidades o sucesos reales** y que puede inducir a una persona a
> pensar erróneamente que son auténticos o verídicos (ultrasuplantaciones) deben también
> hacer público, **de manera clara y distinguible**, que este contenido ha sido creado o
> manipulado de manera artificial **etiquetando los resultados de salida** generados por
> la IA en consecuencia e indicando su origen artificial.

**⚠️ Análisis honesto (INFERENCIA — necesita abogado):**

El art. 50.4 tiene **dos requisitos acumulativos** que en nuestro caso son dudosos:

1. **¿Es "ultrasuplantación"?** La definición exige semejanza con personas **reales**, y
   el cdo. 134 dice "se asemeje **notablemente**". Una cara **totalmente inventada** que
   no se parece a ninguna persona existente **no encaja en la letra de la definición**.
   *Contraargumento posible:* podría sostenerse que el contenido "se asemeja a personas
   reales" en abstracto (parece una foto de una persona real) y que induce a pensar
   erróneamente que es auténtico — que es justo lo que haríamos. **La cuestión es
   genuinamente discutible y no la he podido resolver con fuente oficial** (no hay
   jurisprudencia ni directrices de la Comisión sobre el art. 50 que haya verificado).
2. **¿Somos "responsable del despliegue"?** El cdo. 13 lo define como quien "utilice un
   sistema de IA **bajo su propia autoridad**, salvo cuando su uso se enmarque en una
   **actividad personal de carácter no profesional**". Si el salón genera las imágenes,
   sí lo es (es actividad profesional). **Si las genera una agencia externa**, el
   responsable del despliegue sería la agencia — matiz que **no cambia la conclusión**
   porque la LCD sigue aplicando al salón como anunciante.

**Por eso la decisión NO se apoya en el AI Act.** Aunque el art. 50.4 no aplicara, la
conducta seguiría siendo ilícita por LCD art. 5. **El AI Act es el argumento débil aquí;
la LCD es el fuerte.** Y a la inversa: **cumplir el art. 50.4 (poner "generado por IA")
no legaliza la práctica**, porque el engaño no está en ocultar la técnica sino en
afirmar que esas son nuestras profesionales.

#### 2.3.3 ¿Desde cuándo? — Art. 113 ✅ VERIFICADO

Texto **idéntico** en el DOUE original y en la versión consolidada vigente
(02024R1689 — ES — 12.07.2024):

> **Artículo 113 — Entrada en vigor y aplicación**
> El presente Reglamento entrará en vigor a los veinte días de su publicación en el
> Diario Oficial de la Unión Europea.
> **Será aplicable a partir del 2 de agosto de 2026.**
> No obstante:
> a) los capítulos I y II serán aplicables a partir del **2 de febrero de 2025**;
> b) el capítulo III, sección 4, el capítulo V, el capítulo VII y el capítulo XII y el
> artículo 78 serán aplicables a partir del **2 de agosto de 2025**, a excepción del
> artículo 101;
> c) el artículo 6, apartado 1, y las obligaciones correspondientes […] serán aplicables
> a partir del **2 de agosto de 2027**.

**Ubicación del art. 50 ✅ VERIFICADO:** el art. 50 está en el **CAPÍTULO IV —
"OBLIGACIONES DE TRANSPARENCIA DE LOS PROVEEDORES Y RESPONSABLES DEL DESPLIEGUE DE
DETERMINADOS SISTEMAS DE IA"** (verificado por posición en el texto oficial: cap. IV
abre inmediatamente antes del art. 50 y cap. V abre con el art. 51).

**Deducción (verificada por eliminación):** el capítulo IV **no aparece en ninguna de las
excepciones a), b) ni c)** → le aplica la regla general → **el art. 50 es aplicable desde
el 2 de agosto de 2026**. Hoy, 2026-07-15, **aún no es aplicable: faltan 18 días.**

#### 2.3.4 ⚠️ Digital Omnibus — retrasaría el marcado, pero NO está en vigor

**Estado oficial verificado:**

- **EUR-Lex** (ficha CELEX 32024R1689, consultada 2026-07-15): la **única versión
  consolidada** es la de **12.07.2024**. En "Modificado por" **no consta ningún acto
  modificativo**; solo corrección de errores (32024R1689R(01) a R(04)). → **A día de hoy
  no hay ninguna modificación del art. 113 publicada en el DOUE.**
  <https://eur-lex.europa.eu/legal-content/ES/ALL/?uri=CELEX:32024R1689>
- **Parlamento Europeo — Legislative Train "Digital Omnibus on AI"** (actualizado
  2026-06-20): estado **"Close to adoption"**. El PE aprobó el acuerdo el **16 de junio
  de 2026** (423 a favor, 57 en contra, 174 abstenciones). Se pospondría la obligación de
  marcar contenido generado por IA al **2 de diciembre de 2026**.
  <https://www.europarl.europa.eu/legislative-train/package-digital-package/file-digital-omnibus-on-ai>

**Conclusión operativa:** el Omnibus **no es Derecho vigente** — falta adopción formal
del Consejo y publicación en el DOUE. **Planificar como si el art. 50 aplicara el
2026-08-02.** No he podido verificar en fuente oficial si el retraso afecta **solo al
art. 50.2** o **también al 50.4** (§3). **Es irrelevante para nuestra decisión**, porque
la prohibición viene de la LCD, no del AI Act.

#### 2.3.5 Sanciones — Art. 99.4.g) ✅ VERIFICADO (contexto, probablemente no aplicable)

> 4. El incumplimiento de cualquiera de las disposiciones que figuran a continuación […]
> estará sujeto a multas administrativas de **hasta 15 000 000 EUR** o, si el infractor
> es una empresa, de hasta el **3 % de su volumen de negocios mundial total** […] si esta
> cuantía fuese superior:
> […] g) **las obligaciones de transparencia de los proveedores y responsables del
> despliegue con arreglo al artículo 50.**

> 6. En el caso de las **pymes**, incluidas las empresas emergentes, cada una de las
> multas […] podrá ser por el **porcentaje o el importe […] según cuál de ellos sea
> menor**.

**Lectura (inferencia):** el titular "15 M€" **no es realista** para un salón. El art.
99.6 limita a las pymes al **menor** de los dos → 3 % de la facturación del salón. Y solo
aplicaría **si** el art. 50.4 nos vinculara (dudoso, §2.3.2) **y** desde el 2026-08-02.
**No es el riesgo principal. El riesgo principal es la LCD.**

#### 2.3.6 España — Proyecto de Ley Orgánica de IA: NO está en vigor ✅ VERIFICADO

**Fuente oficial (La Moncloa, referencia del Consejo de Ministros de 26/05/2026):**
<https://www.lamoncloa.gob.es/consejodeministros/resumenes/paginas/2026/260526-rueda-prensa-ministros.aspx>

> "El Consejo de Ministros ha aprobado el **proyecto de Ley Orgánica** para el buen uso y
> la gobernanza de la inteligencia artificial." — y "se remite a las Cortes para el
> **inicio de su tramitación**".
> "El organismo central es la **Agencia de Supervisión de Inteligencia Artificial
> (AESIA)**, con sede en A Coruña (Galicia)."

**Conclusión verificada:** es un **proyecto de ley en tramitación parlamentaria**, **no
Derecho vigente**. No genera obligaciones hoy. **Vigilar** — refuerza el marcado de
contenido IA y tipifica el no etiquetado como infracción, lo que endurecería el
escenario. *(Fuentes secundarias sitúan su publicación en el BOCD nº A-97-1 de
12/06/2026; no verificado en fuente oficial del Congreso — ver §3.)*

---

### 2.4 LO 1/1982 — Derecho a la propia imagen (fotos de personas reales)

**Fuente:** BOE-A-1982-11196, texto consolidado.
API: `https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-1982-11196/texto`
Web: <https://www.boe.es/buscar/act.php?id=BOE-A-1982-11196>

#### Art. 7.6 — el que nos aplica ✅ VERIFICADO

Versión vigente (mod. LO 5/2010, vigor 2010-12-23):

> **Artículo séptimo**
> Tendrán la consideración de **intromisiones ilegítimas** en el ámbito de protección
> delimitado por el artículo segundo de esta Ley:
> […]
> 5. La captación, reproducción o publicación por fotografía, filme, o cualquier otro
> procedimiento, de la imagen de una persona en lugares o momentos de su vida privada o
> fuera de ellos, salvo los casos previstos en el artículo octavo, dos.
> 6. **La utilización del nombre, de la voz o de la imagen de una persona para fines
> publicitarios, comerciales o de naturaleza análoga.**

**Subsunción (inferencia sólida):** una web comercial de un salón que publica la foto de
una persona en su sección "equipo" es uso de la imagen "para fines publicitarios,
comerciales o de naturaleza análoga" → **art. 7.6** si no hay consentimiento. Aplica
tanto a fotos de stock de personas reales sin licencia adecuada como a fotos de
ex-empleadas que ya no consienten.

#### Art. 2 — consentimiento expreso y revocable ✅ VERIFICADO

> **Artículo segundo**
> Uno. La protección civil del honor, de la intimidad y de la propia imagen quedará
> delimitada por las leyes y **por los usos sociales** atendiendo al ámbito que, por sus
> propios actos, mantenga cada persona reservado para sí misma o su familia.
> Dos. No se apreciará la existencia de intromisión ilegítima en el ámbito protegido
> cuando estuviere expresamente autorizada por Ley o cuando el titular del derecho
> hubiere otorgado al efecto su **consentimiento expreso** […]
> Tres. El consentimiento a que se refiere el párrafo anterior **será revocable en
> cualquier momento**, pero habrán de indemnizarse en su caso, los daños y perjuicios
> causados, incluyendo en ellos las expectativas justificadas.

**Consecuencia de diseño:** el consentimiento es **revocable en cualquier momento** →
**si una profesional se va del salón y revoca, hay que poder retirar su foto rápido.**
Esto es un **requisito de arquitectura**, no solo de papeleo (§4).

#### Art. 8.2 — las excepciones NO nos salvan ✅ VERIFICADO

> **Artículo octavo**
> Dos. En particular, el derecho a la propia imagen no impedirá:
> a) Su captación, reproducción o publicación por cualquier medio cuando se trate de
> personas que ejerzan un **cargo público o una profesión de notoriedad o proyección
> pública** y la imagen se capte durante un **acto público o en lugares abiertos al
> público**.
> b) La utilización de la **caricatura** de dichas personas, de acuerdo con el uso social.
> c) La **información gráfica sobre un suceso o acaecimiento público** cuando la imagen
> de una persona determinada aparezca como **meramente accesoria**.

**Análisis (inferencia):** ninguna cubre nuestro caso. Una manicurista **no ejerce cargo
público ni profesión de notoriedad pública**; y aunque lo fuera, la letra a) exige
**además** que la imagen se capte en acto público — una foto de equipo en la web
comercial no lo es. La letra c) exige que la persona sea "meramente accesoria": en una
sección "nuestro equipo" la persona es **el objeto principal**, no accesoria.

#### Art. 9 — el perjuicio se PRESUME ✅ VERIFICADO

Versión vigente (mod. LO 5/2010):

> **Artículo noveno**
> Dos. La tutela judicial comprenderá la adopción de todas las medidas necesarias para
> poner fin a la intromisión ilegítima […] y, en particular, las necesarias para:
> a) El restablecimiento del perjudicado en el pleno disfrute de sus derechos […] el
> **cese inmediato** de la misma y la reposición del estado anterior. […]
> b) **Prevenir intromisiones inminentes o ulteriores.**
> c) La **indemnización de los daños y perjuicios** causados.
> d) La **apropiación por el perjudicado del lucro obtenido** con la intromisión
> ilegítima en sus derechos.
> Tres. **La existencia de perjuicio se presumirá siempre que se acredite la intromisión
> ilegítima.** La indemnización se extenderá al **daño moral**, que se valorará
> atendiendo a las circunstancias del caso y a la gravedad de la lesión efectivamente
> producida, para lo que se tendrá en cuenta, en su caso, **la difusión o audiencia del
> medio** a través del que se haya producido.

**Lectura crítica:** el art. 9.3 invierte la carga en lo esencial — **probada la
intromisión, el daño no hay que probarlo, se presume**. La afectada no tiene que
demostrar que perdió dinero. Y el art. 9.2.d) permite reclamar **el lucro obtenido**.

**Plazo de prescripción:** ⚠️ **NO VERIFICADO** — el art. 9.5 quedó truncado en mi
extracción. Fuentes secundarias hablan de 4 años desde que pudo ejercitarse la acción;
**no lo doy por bueno** (§3).

#### Riesgo cruzado IA ↔ LO 1/1982 (inferencia)

Una cara generada por IA **puede parecerse involuntariamente a una persona real**. Si una
persona real se reconoce en la imagen sintética que usamos comercialmente, entra en juego
el art. 7.6 **y además** encajaría en la definición de ultrasuplantación del art. 3.60 AI
Act (ahí sí "se asemeja a personas reales"). **Es un riesgo no controlable** con
generadores de imagen: no podemos garantizar que una cara inventada no se parezca a
nadie. Argumento adicional para descartar la opción.

---

## 3. Lo que NO he podido verificar

| # | Afirmación / laguna | Por qué importa | Qué haría falta para verificarlo |
| - | ------------------- | --------------- | -------------------------------- |
| 1 | Si el art. 50.4 AI Act cubre caras **totalmente inventadas** (que no se parecen a nadie real) | Determina si el AI Act nos obliga a etiquetar. **No cambia la decisión** (la LCD prohíbe igual) | Directrices de la Comisión sobre el art. 50 (previstas pero no localizadas), o jurisprudencia TJUE. Consulta a abogado especialista |
| 2 | Si el Digital Omnibus retrasa **solo el art. 50.2** o **también el 50.4** | Fecha exacta de la obligación de etiquetar | Texto final publicado en el DOUE. Hoy no existe |
| 3 | Fecha de adopción formal por el Consejo y publicación en DOUE del Digital Omnibus | Confirmaría 2026-08-02 vs 2026-12-02 | Vigilar EUR-Lex CELEX 32024R1689 → "Modificado por" |
| 4 | Contenido literal del Proyecto de Ley Orgánica de IA (etiquetado, infracciones, cuantías) | Endurecería el marco nacional | BOCG nº A-97-1 de 12/06/2026 en congreso.es. **Solo tengo fuentes secundarias**; la nota de La Moncloa no detalla el etiquetado |
| 5 | Plazo de prescripción del art. 9.5 LO 1/1982 | Cuánto tiempo hay de exposición | Releer art. 9.5 completo en BOE-A-1982-11196 (mi extracción se truncó) |
| 6 | Calificación exacta (leve/grave/muy grave) del art. 47.m en nuestro caso | Horquilla real de la multa | Analizar agravantes del art. 48.3 TRLGDCU + criterio de la Dirección General de Consumo de la Comunidad de Madrid |
| 7 | Normativa **autonómica de consumo de la Comunidad de Madrid** | Es la administración que sancionaría | Buscar la ley de consumo de la CM vigente. **No investigado** |
| 8 | Si existe jurisprudencia española sobre fotos IA presentadas como personal real | Calibrar riesgo real | Búsqueda en CENDOJ. **No realizado** |
| 9 | **Análisis RGPD** de las fotos del equipo real (base jurídica, información, encargados) | Necesario para la opción A recomendada | **Área de investigación distinta.** No cubierto aquí |
| 10 | Licencias de bancos de imágenes para la opción C | Muchas licencias de stock **prohíben** sugerir que el modelo es empleado | Leer la licencia concreta del banco elegido |
| 11 | Si el salón tiene ya fotos reales del equipo y consentimientos firmados | Determina el esfuerzo de la opción A | **Preguntar al cliente.** Dato de negocio, no verificable por mí |

---

## 4. Impacto en el proyecto

> Contexto: el repo está en **Fase 0** (`progress/current.md:9` — "repo en plantilla
> virgen. Investigación en curso. Sin código aún."). No hay features reales todavía
> (`feature_list.json:13-27` es la feature de ejemplo). Estas conclusiones deben entrar
> en `project-spec.md` **antes** de destilar Gherkin.

### 4.1 Lo que PROHÍBE (restricciones duras del producto)

- ❌ **Prohibido** publicar imágenes generadas por IA de personas presentadas —
  explícita o implícitamente — como las profesionales del salón. *(LCD art. 5.1.g y
  5.1.b; TRLGDCU art. 47.m)*
- ❌ **Prohibido** publicar fotos de personas reales sin consentimiento **expreso**
  (stock sin licencia, fotos de terceros, ex-empleadas que revocaron). *(LO 1/1982
  art. 7.6)*
- ❌ **Un disclaimer "generado por IA" NO habilita** la opción prohibida. Etiquetar la
  técnica no cura la falsedad del contenido. *(Inferencia sólida: el art. 5 LCD castiga
  la información falsa sobre la identidad del profesional, no el medio de producción.)*
- ❌ **Prohibido** inventar nombres, biografías, años de experiencia o certificaciones
  de profesionales. Cae en la misma letra g) ("sus cualificaciones").

### 4.2 Lo que EXIGE (requisitos que entran en la spec)

| ID | Requisito | Fuente | Tipo |
| -- | --------- | ------ | ---- |
| L-01 | Toda persona mostrada en la web es una profesional **real** del salón | LCD art. 5.1.g | Invariante de contenido |
| L-02 | Consentimiento **expreso y por escrito** de cada profesional antes de publicar su imagen | LO 1/1982 art. 2.2 | Puerta de publicación |
| L-03 | **Retirada rápida** de la imagen ante revocación del consentimiento | LO 1/1982 art. 2.3 | **Requisito de arquitectura** |
| L-04 | Si en el futuro se usan imágenes IA **decorativas** (no personas del equipo), deben ser inequívocamente no identificativas y, si hay duda, etiquetadas | LCD art. 7.1 ("ambigua"); AI Act art. 50.4/50.5 | Regla de contenido |
| L-05 | Cualquier etiquetado de IA debe ser **"claro y distinguible […] con ocasión de la primera exposición"** y **accesible** | AI Act art. 50.5 | Requisito a11y + UI |

### 4.3 Features que implica

1. **`equipo_fotos_reales`** — sección "Nuestro equipo" alimentada **solo** con fotos
   reales con consentimiento registrado.
   - *Criterio de aceptación (Gherkin-able):* "Dado un miembro del equipo **sin**
     consentimiento registrado, cuando se renderiza la página de equipo, entonces su
     ficha **no** aparece."
   - Esto convierte L-02 en **test automatizable**, no en un post-it. Es la forma de que
     la puerta legal no dependa de que alguien se acuerde.
2. **`retirada_consentimiento`** (deriva de L-03) — mecanismo para despublicar a una
   persona sin necesidad de un despliegue de código completo.
   - *Decisión de arquitectura pendiente:* si el contenido del equipo va **hardcodeado**
     en el repo, revocar exige tocar código y desplegar. Un flag/dato editable
     (`consentimiento: true/false`) hace L-03 barato. **Esto hay que decidirlo en
     `project-spec.md` antes de elegir stack** — `harness.config.json` sigue sin
     rellenar (`progress/current.md:16-19`), así que estamos a tiempo.
3. **`aviso_legal`** — página de aviso legal / identificación del prestador.
   ⚠️ **Nota:** los requisitos de identificación del prestador de servicios (LSSI
   34/2002) y el TRLGDCU art. 20 (nombre, razón social, domicilio del empresario) **no
   están investigados en este informe**. Son otra área. Solo señalo que existe la
   necesidad.

### 4.4 Decisión para `project-spec.md` (tabla de Decisiones)

| Decisión | Alternativas descartadas | Motivo |
| -------- | ------------------------ | ------ |
| Las fotos del equipo son **reales, con consentimiento expreso por escrito** | (a) Fotos IA como equipo real → **ilícito**: LCD art. 5.1.g, TRLGDCU art. 47.m. (b) Fotos IA + disclaimer → **no sana el engaño**, sigue afirmando falsamente quién trabaja. (c) Stock de personas reales → LO 1/1982 art. 7.6 salvo licencia impecable. (d) Sin sección equipo → lícito, pero renuncia a valor comercial | Única opción sin riesgo de cesación (LCD art. 32.2ª), sanción de consumo (TRLGDCU art. 49) ni demanda por derecho a la imagen (LO 1/1982 art. 9). El equipo real **es** el activo comercial de un salón |

### 4.5 Acción inmediata recomendada

**Preguntar al cliente (dato de negocio, no verificable por mí — §3.11):**

1. ¿Tenéis fotos reales del equipo? ¿De calidad publicable?
2. ¿Todas las profesionales aceptan aparecer en la web? → hace falta **por escrito**.
3. ¿Con qué frecuencia rota el equipo? → dimensiona L-03.

Si la respuesta a (1) o (2) es "no", la salida correcta es **la opción B** (sección sin
fotos de personas: fotos del local, de trabajos realizados, del resultado) **hasta**
tener fotos reales con consentimiento. **Nunca la opción de IA.**

> **Nota de calendario:** el AI Act art. 50 pasa a ser aplicable el **2026-08-02**
> (18 días). No condiciona esta decisión — la LCD ya la resuelve hoy — pero conviene
> revisar el Digital Omnibus en EUR-Lex antes de publicar por si aparece algo relevante
> para el etiquetado de imágenes decorativas (L-04).

---

## Fuentes

**Oficiales (texto verificado directamente):**

- Ley 3/1991, de Competencia Desleal — BOE-A-1991-628, texto consolidado:
  <https://www.boe.es/buscar/act.php?id=BOE-A-1991-628>
  (API: `https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/BOE-A-1991-628/texto`)
- RDL 1/2007, TRLGDCU — BOE-A-2007-20555, texto consolidado:
  <https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555>
- LO 1/1982, protección civil del honor, intimidad y propia imagen — BOE-A-1982-11196:
  <https://www.boe.es/buscar/act.php?id=BOE-A-1982-11196>
- Reglamento (UE) 2024/1689 (AI Act) — DOUE, texto auténtico:
  <https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=OJ:L_202401689>
- Reglamento (UE) 2024/1689 — versión consolidada 12.07.2024 (CELEX 02024R1689-20240712):
  <https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:02024R1689-20240712>
- Ficha EUR-Lex CELEX 32024R1689 (actos modificativos — ninguno a 2026-07-15):
  <https://eur-lex.europa.eu/legal-content/ES/ALL/?uri=CELEX:32024R1689>
- Parlamento Europeo, Legislative Train — "Digital Omnibus on AI" (act. 2026-06-20):
  <https://www.europarl.europa.eu/legislative-train/package-digital-package/file-digital-omnibus-on-ai>
- La Moncloa — Consejo de Ministros 26/05/2026 (Proyecto de Ley Orgánica de IA):
  <https://www.lamoncloa.gob.es/consejodeministros/resumenes/paginas/2026/260526-rueda-prensa-ministros.aspx>

**Archivos del proyecto citados:**

- `progress/current.md:9` — estado Fase 0, repo en plantilla virgen
- `progress/current.md:16-19` — `harness.config.json` sin rellenar, stack sin decidir
- `feature_list.json:13-27` — feature de ejemplo, sin features reales

**Secundarias (NO oficiales — usadas solo como señal, marcadas como no verificadas):**

- Fuentes de despachos y blogs sobre el Digital Omnibus y el PLOIA español. Aparecen en
  §3 (filas 2, 4) como pendientes de verificación oficial. **No sostienen ninguna
  conclusión de este informe.**
