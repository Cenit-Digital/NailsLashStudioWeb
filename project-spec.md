# project-spec.md — Especificación conversada

> Este documento lo escribe y amplía el subagente `spec_partner` **debatiendo**
> con el humano (no de un dictado). Es el acuerdo razonado del proyecto:
> propósito, contrato de cada feature y las **decisiones** con su porqué.
> A partir de él, `gherkin_author` destila los `features/<name>.feature`.

**Estado:** acuerdo cerrado en la Fase 0 (2026-07-15/16). Entradas: las 9 decisiones
del humano (`progress/current.md`), los hechos verificados de primera mano
(`docs/research/01-hechos-verificados-lead.md`) y el informe maestro
(`docs/research/00-fase0-informe.md`). Los informes en bruto (`legal-*`, `datos-*`,
`audit-*`, `stack-*`) **no son fuente**: un verificador adversarial refutó 22 de sus
afirmaciones (§9 del informe maestro).

**Etiquetas de este documento** (mismas del informe maestro): **[V]** hecho verificado ·
**[I]** inferencia razonada sobre hechos verificados, discutible · **[NV]** no verificado
o desconocido. Sin etiqueta = decisión del proyecto (no es un hecho del mundo, es lo que
hemos acordado hacer).

---

## Propósito del proyecto

**Qué es.** El **rediseño** de la web de un salón **real**: **Nails Lash Studio**,
C.C. El Zoco, Av. de Atenas 75, Local 41, 28232 Las Rozas de Madrid **[V]**.

**No es una web nueva.** El salón **ya tiene web publicada** en
<https://www.nailslashlasrozas.es/> **[V: HTTP 200 verificado]**: una *one-page* con
`lastmod 2022-12-01` en su sitemap **[V]**. Nadie nos lo había dicho; lo destapó la
verificación adversarial. Esto cambia el encuadre entero: hay **contenido del propio
titular** ya publicado (la fuente más fiable para servicios y horario), hay un **dominio
real** (`nailslashlasrozas.es`, no el `nailslashstudio.com` que inventó el prototipo
**[V]**), y hay una **migración** que decidir (301, SEO, dominio) que **solo puede cerrar
el cliente**.

**Para quién.** Para quien busca manicura, pestañas o cejas en Las Rozas y llega desde
Google, Instagram o el propio centro comercial; y para la titular, que hoy tiene una web
que **enlaza un aviso legal inexistente (HTTP 404)** y una política de privacidad de
plantilla que **no identifica al responsable** **[V]**.

### El objetivo alcanzable: «lista para publicar», no «publicada»

**Este trabajo NO termina con la web publicada, y eso es una decisión, no un fracaso.**

No hay contacto con el cliente (decisión 6), y los datos que exige el **art. 10 LSSI**
—nombre o razón social, NIF/CIF y un email de contacto atendido— **solo los tiene él**.
No es una precaución prudente: es un **hecho verificado**. Se buscaron en la única fuente
que legalmente debería tenerlos —el aviso legal del propio titular— y **esa URL da 404**
**[V]**. El JSON-LD de su home actual contiene un `vatID` de 8 caracteres (un NIF español
tiene 9 → **malformado**) y una localidad errónea («Las Ceudas») **[V]**: son datos
**inservibles**, no atajos. Y si la titular es autónoma, el dato del art. 10.1.a) es su
nombre y NIF, **dato personal de una persona física**: no se investiga ni se deduce.

Por tanto el entregable es: **una web completa, honesta, accesible y verificada, a la que
solo le falten los datos del titular, y que sea incapaz de publicarse sin ellos**. Esa
última parte es la feature 1.

### Qué NO es objetivo

- **Publicar.** Ver arriba. La puerta de placeholders lo impide por construcción.
- **Redactar el aviso legal ni la política de privacidad con contenido real.** La
  estructura sí; el contenido está bloqueado (B-1..B-4) y debe pasar por un profesional
  con los datos delante. *Este documento no es asesoramiento jurídico.*
- **Reservar de verdad.** No hay backend. Sin backend no hay disponibilidad: dos clientas
  pueden «reservar» la misma hora **[V: es el bug H-10 del prototipo]**. Se compone una
  **solicitud** por WhatsApp y la envía la usuaria.
- **Portar el prototipo.** El prototipo (`.dc.html` + `salon-data.js`) **no es código**:
  es una maqueta con runtime propietario que exige un `window.React` que nunca carga
  **[V]**. Y su contenido está **inventado**: dirección, teléfono, email, precios, equipo,
  reseñas y hasta las **categorías** (vendía «Facial» y «Depilación»; el salón hace
  **Uñas · Pestañas · Cejas** **[V: lo declara el titular en su propia web]**). Es
  referencia visual, no fuente.
- **Republicar reseñas de terceros.** Prohibido por el contrato que el propio salón firmó
  con Treatwell **[V]**.
- **Sección de equipo, capa de temas, chat simulado, agenda por profesional, tienda.**
  Ver decisiones D-5, T-4 y `feature_list.json` → `no_se_construyen`.

---

## Contrato general

Los invariantes del proyecto. **Un invariante sin puerta mecánica es una intención**: por
eso cada uno dice quién lo verifica.

**I-1 · Ningún dato inventado llega a producción — lo garantiza una puerta de build, no la
buena voluntad.** El contenido no verificado vive en una capa explícita de *placeholders*
y el **build de producción falla** si sobrevive uno. Es la decisión 9 y la feature 1. El
motivo no es estético: publicar reseñas inventadas es desleal **per se** (LCD art. 27.8
vía art. 19.2) y presentar caras generadas por IA como el equipo real es un acto de engaño
sobre la identidad del prestador (LCD art. 5.1.g) **[V]**. La disciplina personal no
escala a las 3 de la mañana del día del despliegue; un `exit 1`, sí.

**I-2 · Cero peticiones a terceros, verificado en cada build.** Allowlist **vacía**:
ni `fonts.googleapis.com`, ni `fonts.gstatic.com`, ni iframe de Maps, ni widgets, ni
píxeles. Fuentes autohospedadas con `@fontsource` — que **ya es la práctica del repo base**
**[V]**, así que autohospedar no es desviarse del stack, es seguirlo. **Esto es lo que
sostiene el «sin cookies»**: mantenido en cada build, «no usamos cookies» deja de ser una
promesa y pasa a ser un hecho comprobable, y con él caen el banner, el CMP y la política de
cookies (AEPD, Guía de cookies mayo 2024 §4.1: si todas las cookies están exentas, **no hay
que informar ni pedir consentimiento**) **[V]**. Nótese el porqué correcto: se autohospeda
**por ingeniería** (elimina el análisis, mejora el LCP, cuesta ≈0), **no** porque Google
Fonts sea ilegal — no existe tal pronunciamiento de la AEPD ni del EDPB **[NV: buscado y no
encontrado]**.

**I-3 · WCAG 2.2 AA, con una puerta que recalcula el contraste desde el SCSS.** No es
«nice to have»: el **RD 193/2023 art. 14.2** obliga a todo titular privado de web sobre
bienes y servicios a disposición del público a cumplir prioridad A y AA, **sin exención por
tamaño** **[V]**, y el **TRLGDCU art. 20.2** ya exige hoy que la oferta comercial sea
accesible **[V]**. La puerta existe porque **una auditoría sin puerta no existe**: en
WebEmpresa hay **3 bloqueantes AA vivos en HEAD con las tres puertas verdes**, y su
checklist afirmaba «AA validado» siendo falso — se evaporaron porque **ninguna feature los
representaba** **[V]**.

**I-4 · El estado base en CSS es el estado final visible.** El estado oculto vive **solo**
dentro del ámbito de la animación (el `0%` del keyframe). Patrón de la memoria
organizacional (`estado-base-visible-ssg-reduced-motion`). Bajo SSG, **el HTML horneado
congela el estado que el JS de cliente iba a corregir**: el prototipo anima desde
`clip-path: inset(0 100% 0 0)` y «Studio» está en `opacity: 0` hasta t=4,4 s **[V]** → el
nombre del salón **se hornea invisible**, y bajo `prefers-reduced-motion` se queda
congelado invisible para siempre.

**I-5 · Toda bifurcación decidida en JS lleva red CSS en el mismo breakpoint literal.**
Patrón de la memoria (`red-css-para-rama-solo-js-en-ssg`), misma raíz que I-4: si
móvil/escritorio se decide con `useIsMobile`, **el SSG hornea la rama de escritorio** y en
móvil desborda hasta que hidrata. El test con `matchMedia` mockeado **no lo caza**: solo ve
el estado post-hidratación. Hace falta el **test que lee el SCSS** y asevera el `@media`
— que no es invención nuestra, es el patrón del stack (`src/styles/tokens.test.ts`) **[V]**.

**I-6 · Una feature no cierra si sobrevive un mutante.** Umbral **1.0** (proporción),
heredado del `thresholds.break: 100` de WebEmpresa **[V]**. Ojo: **son escalas distintas**
(Stryker 0-100, arnés 0-1); copiar el `100` tal cual sería un bug. Una suite verde solo dice
que el código no explota.

**I-7 · Los datos viven fuera del JSX, en una fuente única.** NAP, precios, textos legales,
`alt` de las imágenes, personas. Dos motivos: mata el bug más peligroso del prototipo (el
teléfono aparece 7 veces y **el texto sale del dato pero el `href` está a mano** → mostraría
uno y marcaría otro **[V]**); y convierte un derecho legal en un cambio de dato en vez de un
ticket de desarrollo — la LO 1/1982 art. 2.3 hace el consentimiento de imagen **revocable en
cualquier momento** y el RGPD art. 7.3 exige que retirarlo sea **tan fácil como darlo**
**[V]**. Si el array vive en el JSX, «quítame la foto» es un despliegue.

**I-8 · Verde ≠ funciona: en SSG hay dos estados.** Prerender e hidratado, y **jsdom solo ve
el segundo**. Para toda feature de UI la verificación es `pnpm build` → servir → **fetch del
HTML crudo** → medir a 320/360/375/390/414/768/1280. Precedente: el peor bug de WebEmpresa
**pasó todos los tests y dos auditorías** y solo se cazó abriendo Chrome sobre el build
**[V]**. Y `pnpm dev` **no ejercita el SSG** (es SPA plana): verificar en `dev` no demuestra
nada **[V]**.

**Fuentes de verdad, en orden.** (1) Lo que el **titular declara en su propia web**;
(2) hechos verificados de primera mano por el lead; (3) el informe maestro. Treatwell y
Google son terceros: se usan con atribución y **nunca** por encima del titular. Todo lo
demás es placeholder.

---

## Decisiones (con su porqué)

`D-n` = decisión del humano (`progress/current.md`). `T-n` = decisión técnica ya tomada.
**Lo que importa de esta tabla es la columna del motivo.**

| # | Decisión | Alternativas descartadas | Motivo |
| - | -------- | ------------------------ | ------ |
| **D-1** | **Destino: web real de un salón real**, calidad de producción; se publica cuando el cliente lo diga | Ejercicio de portfolio; demo desechable | Cambia todas las reglas: exige datos reales y páginas legales, y **prohíbe presentar contenido inventado como real**. Lo que en una demo es «relleno», en producción es una infracción |
| **D-2** | **Stack = el de `WebEmpresa`** (Vite 7 + React 19 + TS + SCSS + pnpm, SSG con `vite-react-ssg` 0.9.0, Vitest 4, Stryker 9.6) | Elegir stack a medida; Astro (el de `DocsTemplateSSDUncleBob`) | Es el repo base de la organización: lo aprendido aquí **vuelve** a la plantilla y a la memoria. Debe acabar en un **ADR** para no volver a preguntarlo. *Premisa corregida: `WebEmpresa/harness.config.json` **no existe** —es anterior al motor agnóstico—; los comandos se derivan de su `package.json`* **[V]** |
| **D-3** | **Reservas: solicitud por WhatsApp, sin backend.** El calendario compone el mensaje y lo abre; lo envía la usuaria | Reserva propia con backend; incrustar el widget de Treatwell; el chat del prototipo | Sin backend **no hay disponibilidad**: dos clientas pueden «reservar» la misma hora. Con `wa.me` **es honesto porque el mensaje lo envía el usuario**. Y una reserva propia nos traería entero el **art. 97 TRLGDCU** (21 extremos, desistimiento, confirmación en soporte duradero) **[V]** |
| **D-4** | **Reseñas: reales, de Treatwell.** Fotos del equipo: placeholder por ahora | Reseñas inventadas «de relleno» | *Refinada por D-7 y D-8 al conocerse el contrato de Treatwell y el riesgo de las caras IA* |
| **D-5** | **Paleta: solo `Opcion-1-Rosa`** (fondo `#FDF4F7`, acento `#C05576`). **Sin capa de temas, sin interruptor** | Azul (1b); Amarillo (1c); construir la capa de temas «que es barata» | Las 3 opciones eran **el mismo archivo byte a byte salvo las variables del `:root`** → **nunca fue una feature**. Era barata de construir y perpetua de mantener: el humano prefiere no cargar con esa superficie |
| **D-6** | **No hay contacto con el cliente** → se trabaja solo con lo verificable en fuentes públicas; **todo lo que exija datos del titular queda bloqueado, incluidas las páginas legales** | Inventar datos «provisionales»; deducir el CIF; usar el email del JSON-LD | El aviso legal necesita razón social + NIF + domicilio + email (**LSSI art. 10**) y **no existen en ninguna fuente pública** **[V]**. **Corolario duro: la web no se puede publicar al final de este trabajo** |
| **D-7** | **Reseñas: solo nota agregada + atribución de plataforma + enlace + sello de fecha + aviso del art. 20.4.** Ni un texto de tercero | Republicar los textos; scraping o capturas; widget de reseñas; testimonios propios; quitar la sección | No es solo lo prudente: **es lo único legal que no depende del cliente**. Los Términos Comerciales Treatwell (abril 2024) **cl. 4.2**: «*no tiene ningún derecho sobre las reseñas*»; **cl. 9.1**: Treatwell tiene «*todos los derechos sobre el contenido*» **[V]**. El scraping está **prohibido expresamente** en sus T&C **[V]**. El derecho de cita (art. 32.1 TRLPI) **no salva**: es solo para fines docentes o de investigación **[V]** |
| **D-8** | **Equipo: las fotos IA (`ph-woman*.png`) son placeholder de DESARROLLO**, marcadas como tales y **bloqueadas para producción** | Publicarlas como el equipo; publicarlas con un disclaimer «generado por IA» | Presentarlas como el equipo real es **acto de engaño sobre la identidad y las cualificaciones del prestador** (LCD art. 5.1.g) **[V]**, y **el disclaimer no lo sana**: la norma castiga la información falsa, no el medio de producción **[I sólida]**. Riesgo real: no la multa, sino la **acción de cesación con publicación de la sentencia** (LCD art. 32.2) que puede ejercer **un competidor** —p. ej. otro salón del mismo centro— **[V]**. Solo valen para ver el diseño en local |
| **D-9** | **Puerta de build** (consecuencia de D-6 y D-8): el contenido no verificado vive en una capa explícita y **el build de producción falla si queda uno** | Confiar en una checklist; un TODO; una revisión final | Es lo que hace **estructuralmente imposible** publicar datos inventados por accidente. **Es una feature del proyecto, no un apaño** |
| **T-1** | **NO copiar `_tokens.scss` de WebEmpresa** | Heredar los tokens del base y ajustar el color | El base **arrastra 3 bloqueantes AA sin cerrar en HEAD** (`--color-accent` 3,78:1, `--color-tag-ink` 2,64:1, `--color-text-faint` 2,78:1) **con las tres puertas verdes**, porque **ninguna feature los representaba** **[V]**. Se recalcula todo uno mismo; **no fiarse de la documentación del base** (que además afirmaba «AA validado» siendo falso, y describe una paleta que el código no usa) **[V]** |
| **T-2** | **Una sola vía de reserva, no dos** | Mantener las dos del prototipo (agenda en `#equipo` + chat en `#reserva`) | El prototipo tiene **dos vías y ninguna funciona**, y ambas prometen «Te confirmaremos por WhatsApp» **[V]**. Dos vías = el doble de superficie legal y de mantenimiento para el mismo trabajo. La composición del mensaje **no existe en el prototipo**: es una feature **a diseñar, no a portar** **[V]** |
| **T-3** | **Mapa: imagen estática autohospedada + enlace «Cómo llegar»** | `<iframe>` de Google Maps; API de Maps | **Es la decisión que por sí sola evita el banner de cookies.** El iframe rompe I-2 y arrastra la EU User Consent Policy de Google; los ToS de Maps reconocen que **almacenan y acceden a cookies** en el dispositivo, y la responsabilidad **no es desplazable por contrato** (Guía AEPD §4.2) **[V]**. Coste de la alternativa: una imagen |
| **T-4** | **Construir la web SIN sección de equipo**, con copy que funcione hablando de «nuestro equipo de esteticistas». Si el cliente la pide, es otra feature | Construirla con placeholders; construirla con los 7 nombres de Treatwell | Doble bloqueo: **no hay fotos reales** (D-8) y **los nombres son datos personales** — «está publicado en Treatwell» **no es base jurídica** (RGPD art. 6.1 es lista cerrada) y el consentimiento laboral es frágil (EDPB 05/2020) **[V]**. Es **~25 % del alto del prototipo** y es la parte **más bloqueada**: construirla sería trabajo tirado |
| **T-5** | **Umbral de mutación 1.0** (proporción), y **prohibido `--testFiles`** en Stryker: acotar con `--mutate <fichero>` | El `0.8` por defecto del arnés; copiar el `100` de Stryker | El base exige `break: 100` **[V]** → **este repo tiene la puerta más estricta que su propio repo base**. Y `--testFiles` da **0 % falso** con este stack exacto (16/16 supervivientes con él, 100 % sin él; reproducido 2 veces, causa raíz **[NV]**) **[V]** |
| **T-6** | **JSON-LD escrito de cero**: `LocalBusiness`/`BeautySalon` con el NAP y `geo` verificados, **sin `aggregateRating`** | Copiar el JSON-LD de la web actual; emitir `aggregateRating` con la nota de Treatwell | Copiarlo **propagaría sus bugs**: `addressLocality: "Las Ceudas"` y un `vatID` malformado **[V]**. Y Google **prohíbe** agregar notas de otros sitios («*Don't aggregate reviews or ratings from other websites*») → riesgo de acción manual **[V]**. Las estrellas se ganan por Google Business Profile, que es otro canal |
| **T-7** | **Los tests conviven con el código** (`paths.tests: "src"`) y **se consulta por rol, nombre accesible, texto o `data-*`, nunca por clase CSS** | El default `tests/` del arnés; consultar por `styles.card` | `vitest.config.ts` solo incluye `src/**/*.{test,spec}.{ts,tsx}` **[V]** → poner tests en `tests/` = **tests que no se ejecutan**. Y `css: false` es *load-bearing*: los CSS Modules no se procesan en test → `styles.card` es **`undefined`** **[V]**. Efecto secundario buscado: **el test solo ve lo que ve un lector de pantalla** |
| **N-1** | **Nailbot (F-23/F-24) es un asistente automático de DEMO y lo dice**: leyenda visible, nunca «IA», sin «en línea» (H6, L1 de `progress/nailbot_diseno.md`) | Anunciarlo como «ChatBot de IA», como decía el encargo; mantener el «en línea» | Un guion fijo **no es un sistema de IA** (AI Act art. 3.1 y cons. 12; Directrices del art. 50 §30.i: *«rule-based quick message answers»*) **[V: `docs/research/asistente-robot/01-legal.md` §2]**. El art. 50.1 no obliga hoy, pero llamarlo IA sería engañoso **[I]**. El día de la IA real, la leyenda se cambia por el aviso del art. 50 (`06` §4) |
| **N-2** | **Un solo cerebro, dos puertas**: `ChatNailbot` en `#reserva` y en el panel del robot, con estado independiente (H2, L5) | Un chat nuevo para el robot que no toque `Reserva.tsx` (la «vía barata» de `05` §5) | Lo pidió el humano, y dos guiones acaban divergiendo. **Matiza T-2** («una sola vía de reserva»): no añade una vía, añade una **puerta** a la misma lógica de composición (`mensajeReserva`) |
| **N-3** | **La costura del servidor futuro es la firma de una función PURA**, `responder(estado, entrada) → estado` (H1, H7, L4) | Un adaptador «remoto» especulativo; llamar a la API de Claude desde el navegador | Herencia sin uso = deuda muerta (memoria organizacional). Una clave en GitHub Pages es **pública** (`06` §0). Lo que la costura no garantiza (asincronía, texto libre, copy legal) está en F-23, HS-7 |
| **N-4** | **Datos mínimos y cero persistencia en Nailbot**: opciones cerradas, nombre opcional y nunca teléfono; cero `fetch`, storage y analítica (L2, L11, L15) | Pedir el teléfono; texto libre; recordar el bocadillo en `sessionStorage` | RGPD art. 5.1.c (WhatsApp ya aporta el número) y art. 9 (el texto libre invita a datos de salud) **[V: `01` §3.1]**. I-2: el «sin cookies» se mantiene por construcción |
| **N-5** | **El robot se anima en bucle con control de pausa**, y se queda quieto con `prefers-reduced-motion` (H3, L9, L10) | La «ráfaga» ≤ 5 s que termina en pose fija; un bucle sin control | Decisión del humano. Un bucle decorativo **cumple las tres condiciones de SC 2.2.2 (A)** y necesita un mecanismo; `prefers-reduced-motion` es criterio de proyecto y **no** sustituye a 2.2.2 **[V: `04` §1]** |
| **N-6** | **El lanzador solo existe en el cliente y el panel es un `<dialog>` modal nativo** (L7, L8) | Hornear el botón; un `role="dialog"` propio; un panel no modal | Sin JS, un botón horneado estaría muerto. El navegador da la inercia, Esc, la *top layer* y la vuelta del foco; jsdom no, así que hay stub protegido y verificación en vivo |
| **N-7** | **Nada de verde ni logo de WhatsApp en el lanzador** (H5) | Recuperar el botón verde retirado (commit 479d541) | Palabra del humano: un robot con la estética del negocio que **invite a reservar** por el chat. Su alcance dentro del panel está en A-25 |

---

## Preguntas abiertas

No están cerradas. **No se dan por resueltas** y ninguna se resuelve adivinando.

| # | Pregunta | Quién la cierra |
| - | -------- | --------------- |
| **A-1** | **¿Qué nota se muestra: Treatwell (4,9 · 1.231) o Google (4,9 · 226)?** Coinciden en nota pero **no en volumen**: **ni sumar ni promediar**, y siempre decir de cuál es y enlazarla **[V]**. Los dos informes no dicen lo mismo: la cl. 9.1 de Treatwell da a Treatwell «todos los derechos sobre el contenido» (¿alcanza a la **nota media**?), y su desglose tiene una **incoherencia sin explicar** (suma 1.014, no 1.231) **[V]** | Humano / cliente (P-9) |
| **A-2** | **¿Cuáles son las 3 categorías reales?** El titular anuncia **Pestañas** en su web, pero **su ficha de Treatwell no vende ni un servicio de pestañas**, y sí pedicura y depilación **[V]**. El nombre del negocio promete lo que su ficha de reservas no vende | **Cliente** (P-4) |
| **A-3** | **El formato `wa.me/<num>?text=<urlencoded>` NO está verificado contra fuente primaria [NV]** (el Help Center se renderiza con JS; la URL de Meta da 404). **Verificar a mano y probar en Android, iOS y WhatsApp Web ANTES de implementar F-13** | Nosotros, antes de F-13 |
| **A-4** | **¿Es «Nails Lash Studio» un logotipo** a efectos de SC 1.4.3? **[NV]** Si lo es, decae uno de los fallos de contraste. Es una decisión de negocio, no técnica | Humano |
| **A-5** | **Sintaxis de `stryker run --mutate <fichero>` en Stryker 9.6 [NV]** → comprobar antes de fijar `commands.mutate` con `{{target}}` | Nosotros, en F-00 |
| **A-6** | **¿Sobrevive la fuente Great Vibes?** Es **una familia entera para ~10 glifos**, justo en el camino crítico del LCP **[V]** | Humano (diseño) |
| **A-7** | **Festivos y horario de agosto [NV]** → F-10 los modela como dato, pero el dato no existe | **Cliente** (P-8) |
| **A-8** | **¿Cómo se protege la puerta de placeholders del «verde por vacuidad»?** Si el escáner apunta a un artefacto que no se generó, devuelve 0 violaciones y **el build pasa creyéndonos protegidos**. Ver F-01, caso límite 1 | Humano, en el Gherkin de F-01 |
| **A-9** | **¿La comparación de patrones es literal o normalizada?** El patrón acordado es `600123456` pero el prototipo escribe `+34 600 123 456` **[V]**: literal **no lo caza**. Hay que decidirlo patrón por patrón. Ver F-01, caso límite 2 | Humano, en el Gherkin de F-01 |
| **A-10** | **`waHref`: ¿host `wa.me` o `api.whatsapp.com/send`?** Ligada a **A-3**. Lo **testeable** de F-02 (número **E.164 sin `+`** + texto **`encodeURIComponent`**) es host-agnóstico; el host se **verifica a mano** (Android/iOS/WhatsApp Web) antes de F-13 y se trata como constante configurable. Ver F-02, contrato | Nosotros, ligado a A-3 |
| **A-11** | **¿El email entra en `site.ts` como registro `esPlaceholder: true` desde F-02** (rompiendo ya el build de producción, que es lo correcto por D-6) **o se difiere a F-12?** `centroesteticarozas@gmail.com` solo consta en el JSON-LD oculto de la web actual y **[NV]** si se atiende **[V]**. Ver F-02, alcance | Humano, en el Gherkin de F-02 |
| **A-12** | **¿F-02 cablea `registros` en `tools/puerta-placeholders.ts`** (hoy `never[] = []`) **o es paso posterior?** El TODO del humilde dice que F-02 alimenta la vía por flag **[V: código]**. Recomendación: sí, es de F-02 (cambio de una línea en el humilde, sin TDD ni mutación). Ver F-02, alcance | Humano/lead, en la puerta de aprobación de F-02 |
| **A-13** | ✅ **CERRADA (2026-07-16) en el Gherkin de F-03.** La matriz de uso es **declarada** (par fg/bg + rol + umbral + tamaño efectivo del `clamp`), **no** el producto cartesiano de tokens. Dos guardas anti-«verde por vacuidad», análogas a @s20/@s21 de F-01: (a) la puerta **exige** haber evaluado un mínimo conocido de pares — matriz vacía o regex que no casa → falla cerrada (@s14); (b) asevera el **negativo**: ningún par de rol texto/componente usa `#C05576` como fg (@s13). Ver F-03 | **Cerrada** |
| **A-14** | ✅ **CERRADA (2026-07-16), confirmada en doc oficial.** El mutante `0.04045 → 0.03928` es EQUIVALENTE en 8 bits — **verificado por cálculo exhaustivo**: de los 256 canales `c/255`, **ninguno** cae en el hueco `(0.03928, 0.04045]` (vecinos `10/255 = 0,039216` y `11/255 = 0,043137`). Pero **Stryker 9.6 NO genera ese mutante**: sus mutadores no sustituyen un literal numérico por otro concreto (doc oficial). El riesgo del umbral 1.0 **no existe**. La constante **sí** es mutable vía su entorno sintáctico (`c <= 0.04045`), y eso lo cubren @s5/@s6 con inputs sintéticos. **Ojo: la equivalencia depende ESTRICTAMENTE de los 8 bits** — a 10 bits `41/1023 = 0,040078` sí cae en el hueco. Usar `0.04045` cubre ambos casos. Ver `progress/f03_verificacion_previa.md` §2 | **Cerrada** |
| **A-15** | ✅ **CERRADA (2026-07-16) por el humano: cabecera translúcida al 88 %.** El default propuesto (82 %) **NO cumplía AA** — calculado, no estimado: la nav `--muted #6F525A` cae a **4,44** con «Negro Ónix» `#1B1B1D` debajo (color real de la carta, `salon-data.js:90`) y a **4,22** con negro puro. **El audit declaró como peor caso un `#303030` más claro que el negro de su propia carta de esmaltes.** Al **88 %** la cabecera es **incondicionalmente AA**: nav **4,89** · logo **5,38** contra el peor under posible (negro puro), conservando translucidez (12 % vs 18 %) y `blur(14px)`. **Desacopla F-03 de F-06 y F-17**: ya no hay que enumerar qué scrollea debajo ni limitar cómo de oscuras pueden ser las fotos. Ver `progress/f03_verificacion_previa.md` §1 | **Cerrada** |
| **A-16** | ✅ **CERRADA (2026-07-16) por el lead: `componer` devuelve flotantes, sin cuantizar.** Hallazgo propio: **el contrato se contradecía**. `@s9` fija `componer` en coma flotante (`[214.2,…]`, fraccionario y explícito) pero el esperado **4,60** de la fila del pie de `@s11` salía de un cálculo **cuantizado a 8 bits** (así lo hizo el audit). Con el `componer` que el propio contrato manda, el ratio real es **4,5913**, y `toBeCloseTo(4.60)` (precisión 2 → exige desvío < 0,005) **habría estrellado el TDD** por 0,0087. Esa fila vale **4.59**. La cuantización es un detalle de **render**, no del color especificado, y el delta de 0,01 **no cambia ningún veredicto** (ambos ≥ 4,5). **Afecta solo a las filas compuestas** (`rgba`/`color-mix`): las hex↔hex del audit se reproducen exactas. Ver `progress/f03_verificacion_previa.md` §3 | **Cerrada** |

| **A-17** | ✅ **CERRADA (2026-07-16) por el humano: F-04 = puerta anti-404 · F-16 = las páginas legales.** El troceado se contradecía consigo mismo: `00-fase0-informe.md:673` describe la entrega de F-04 como «el pie con los huecos de los enlaces legales (**aún sin destino**)» y `:683` exige que el destino **responda 200** — **incompatibles**. Y **[V]** F-04 **no puede prometer un aviso legal conforme**: no existen razón social ni NIF válido en fuente pública. Además **«responde 200» NO prueba conformidad**: `/es/confidentiality_ws` del cliente da **200 y es jurídicamente nulo** — F-04 habría cambiado un 404 por un **200 hueco** y el test lo habría bendecido. **F-04 entrega la puerta anti-404** (*ningún `href` interno apunta a una ruta inexistente en `dist/`*): testeable **hoy**, cubre **todos** los enlaces y **no promete nada**. **F-16** entrega rutas, enlaces y contenido. Decae también el acceptance «el enlace es permanente: aparece en todas las páginas»: **[V]** eso **NO está en la LSSI**. Ver `progress/f04_verificacion_previa.md` §2 y §4 | **Cerrada** |
| **A-18** | ✅ **CERRADA (2026-07-16) por el lead: `SC 2.4.11` es de F-06, NO de F-04.** Su *Understanding* **nombra literalmente los sticky headers** y su técnica suficiente es **`C43`** (`scroll-padding`) **[V]**. F-04 **no puede testear** que la cabecera no tape el foco cuando **la cabecera la monta F-06**, y el `feature_list` de F-06 ya lo contempla. **Reparto: F-04 pone el `scroll-padding-top`; F-06 vigila que funcione.** No estaba en la `puerta_legal` de ninguna de las dos: ahora sí, en F-06 | **Cerrada** |
| **A-19** | ✅ **CERRADA (2026-07-16) por el humano: el JSON-LD de F-04 NO emite horario.** Lo emitirá **F-10**, que es la dueña del horario como dato (con excepciones: festivos, agosto). Emitirlo en F-04 lo escribiría en dos sitios. **Pero F-04 SÍ fija la REGLA**, porque `openingHours` y `openingHoursSpecification` **coexisten y ambas son válidas por ramas distintas [V]**: cuando el horario entre, se emite **`openingHoursSpecification`** (la única que Google recomienda), **NUNCA `openingHours`**, y **jamás las dos**. Sin fijarlo, dos implementadores eligen distinto y **ambos pasan los tests** | **Cerrada** |
| **A-20** | ✅ **CERRADA (2026-07-16) por el humano: `priceRange` NO entra.** Es **Text, no número** (*«for example $$$»* **[V]**): un `"priceRange": 25` es **sintácticamente válido y basura semántica** — nadie lo rechaza y **degrada en silencio**. Y **los precios reales están bloqueados** (B-5, F-09: el titular no los publica): emitir un rango sin precios verificados **sería inventar**. Es **recomendada** por Google, nunca requerida: su ausencia no rompe nada | **Cerrada** |
| **A-21** | ✅ **CERRADA (2026-07-16) por el humano: el origen entra como PLACEHOLDER cubierto por la puerta de F-01.** El dominio final es **[NV]** — sigue abierto si se migra `nailslashlasrozas.es` con 301, y **lo decide el cliente**. El origen se registra en la capa de placeholders de F-01 → **el build de PRODUCCIÓN falla** mientras no se decida, y el de **desarrollo no**. Es la **decisión 9** aplicada literalmente: *el contenido no verificado vive en una capa explícita y es estructuralmente imposible publicarlo por accidente*. **F-04 se construye entera hoy**, con la canónica probada, y el dato real entra **sin tocar código**. F-04 **no duplica** la puerta de F-01: se apoya en ella | **Cerrada** |
| **A-22** | ✅ **CERRADA (2026-07-16) por el humano: `home → `${marca} · ${reclamo}`; resto → `${sección} · ${marca}`.** Home: **«Nails Lash Studio · Uñas, pestañas y cejas en Las Rozas de Madrid»**. Resto: **«Servicios · Nails Lash Studio»**. Contenido **[V]**: las categorías reales son **Uñas · Pestañas · Cejas** (*«Facial» NO existe en este negocio*) y la localidad es **Las Rozas de Madrid**. Marca al final en las interiores: lo distintivo primero (pestaña estrecha y SERP truncan por la derecha). **Es criterio de PROYECTO/SEO, jamás `SC 2.4.2`**, cuyo listón normativo es *«describe topic or purpose»* con **cero requisito de unicidad [V]**. **Sin este literal el acceptance «mutar la composición del title rompe un test» no tenía nada que mutar** y el mutante del orden sobrevivía | **Cerrada** |
| **A-23** | **La capa 1 de Nailbot está incompleta hasta F-16.** El aviso de F-23 cubre la finalidad y el control del envío, pero **no** la identidad del responsable, ni los derechos, ni el acceso a la política que pide el art. 11 LOPDGDD **[V: `docs/research/asistente-robot/01-legal.md` §3.1]**: esos datos no existen (D-6) y la política es F-16 (`blocked`). Mientras tanto, la demo se despliega en GitHub Pages con el teléfono real. ¿Se aprueba **cada** despliegue a sabiendas? Además, «El salón lo usará solo para gestionar tu cita» compromete al salón sin haberlo confirmado con él. Ver F-23, HS-1 | **Cliente** (datos del titular) + **humano** (cada aprobación de Pages) |
| **A-24** | **El servidor de Nailbot con IA real** (NO se construye hoy): proveedor y hosting, mismo número en la app y en la API (*Coexistence*), modelo y presupuesto, presupuesto de WhatsApp desde el 1-oct-2026 y residencia de datos (S1–S5), más las **puertas legales previas**: aviso del art. 50.1 en el primer turno, contratos de encargo, transferencia a EE. UU. y la cl. 4.7 de Meta. Todo en `docs/research/asistente-robot/06-diseno-servidor-futuro.md` §3–§4. Y **ya**: revocar la clave `sk-proj-…` que se pegó en una sesión (no es de Anthropic; `06` §0) | **El salón** (S1–S5) + **humano** (la clave y el arranque) |
| **A-25** | **¿«Nada de verde» (H5) alcanza al panel del robot?** El lanzador cumple, pero el `ChatNailbot` que abre trae el verde de `#reserva`: la burbuja de la persona, el botón de enviar y el enlace `demo-btn--wa` que exige `reserva_chat` @s24. Recomendación: H5 se refiere al lanzador. Ver F-24, HS-16 | **Humano** (Pablo) |
| **A-26** | **Dos literales que el brief no fija o que chocan con el rol del control:** el nombre accesible del hilo `role="log"` (F-23, HS-4; `04` sugiere «Conversación») y «Pulsa el botón», que nombra un enlace (F-23, HS-6). El spec_partner no escribe copy | **Lead/humano**, en la puerta de F-23 |

**Y lo que no es una pregunta sino un aviso con valor legal:** hay que decirle al cliente
**ya**, sin esperar a la web nueva, que **su aviso legal actual da 404** y que su política
de privacidad no identifica al responsable. El **art. 48.4 TRLGDCU** rebaja un escalón la
sanción si se corrige **antes** de que se incoe el procedimiento **[V]**.

---

## Especificación por feature

### Feature 1: `puerta_placeholders` — LA PRIMERA

> Feature `#1` de `feature_list.json`. Es la única especificada a fondo aquí: es la que se
> implementa ahora, y **todo lo demás se apoya en ella**.

#### Propósito

Hacer **estructuralmente imposible** que un dato inventado llegue a producción.

#### Por qué va primera

Porque convierte todas las líneas rojas legales en **una puerta mecánica**, y porque es
**lo que nos permite trabajar**: con la puerta puesta, podemos construir el catálogo, el
contacto y las páginas legales **con datos falsos y sin riesgo**, en vez de quedarnos
parados esperando al cliente. Sin ella, cada feature bloqueada bloquea a las demás. Invierte
la carga: en vez de «acuérdate de quitar los placeholders», el sistema **se niega a
construir** mientras quede uno.

Además es, con diferencia, la mejor lógica del proyecto para TDD y mutación: una función
**pura** sobre datos, con casos límite obvios y mutantes que deben morir.

#### Comportamiento esperado

1. Existe una **capa explícita de placeholders**: cada registro de datos del sitio expone un
   flag `esPlaceholder`. Marcar un dato como falso es **un acto deliberado y visible**, no un
   comentario `TODO` en el JSX.
2. Una función pura `detectarPlaceholders(entrada) → violaciones[]` en
   `src/lib/placeholders.ts` devuelve **una violación por cada infracción encontrada**.
3. Hay **dos vías independientes** de detección, y **ambas** producen violación:
   - **Por flag**: un registro con `esPlaceholder: true`. Cubre lo que sabemos que falta y
     **no tiene forma reconocible** — «razón social: pendiente» no coincide con ningún patrón.
     Es la vía que cubre F-16 (páginas legales), donde **todos** los campos son placeholder.
   - **Por patrón**: el contenido coincide con un patrón prohibido, **aunque nadie lo haya
     marcado**. Cubre lo que se coló hardcodeado. Patrones mínimos acordados:
     `IMAGEN TEMPORAL`, `Plantilla de demostración`, `600123456`,
     `hola@nailslashstudio.com`, `Calle de la Belleza`, `ph-woman`.
4. La puerta se ejecuta sobre **los datos** y sobre **el artefacto construido**. No es
   redundancia: los datos cazan lo declarado; el artefacto caza lo que **esquivó la capa de
   datos** (un literal escrito a mano en una plantilla, exactamente el bug H-2 del prototipo).
5. **El build de producción termina con exit code ≠ 0 si hay al menos una violación.**
6. **El build de desarrollo NO falla.** Las fotos IA y los datos placeholder son
   **legítimos en local** (D-8): son para ver el diseño. La puerta separa «ver» de «publicar».

#### Contrato

| | |
| - | - |
| **Entrada** | El árbol de datos del sitio (registros que pueden llevar `esPlaceholder`) y/o el texto de un artefacto construido (HTML/CSS/JS). La función **no lee ficheros, ni el reloj, ni `process.env`, ni el entorno**: recibe lo que tiene que examinar |
| **Salida** | `violaciones[]`. Vacío = pasa. Cada violación identifica **qué** la disparó (flag o patrón concreto), **dónde** (ruta del campo o del fichero) y **con qué valor**. Un mensaje que dice «hay un placeholder» y no dice cuál obliga a buscarlo a mano: la puerta debe **acusar**, no gruñir |
| **Determinismo** | Misma entrada → misma salida, **mismo orden**. El orden es parte del contrato: un informe estable es diffable y testeable |
| **Quién decide el exit code** | **No la función.** La lectura de ficheros y el `exit 1` viven en el script de puerta, enganchado **solo** al build de producción. Por eso la función es pura, testeable y mutable; y por eso `dev` no falla: **no la invoca** |

**Mutantes que deben morir** (I-6): `&&` → `||`, `>` → `>=`, la negación del predicado, y
cualquier cambio en la lista de patrones. Si mutar cualquiera de esos no rompe ningún test,
la puerta no vigila nada.

#### Casos límite debatidos

1. **Entrada vacía → `violaciones[]` vacío → pasa.** Correcto como función pura, **peligroso
   como puerta**: si el escáner apunta a una ruta que no existe o a un artefacto que no se
   generó, la puerta pasa **por vacuidad** y creemos estar protegidos. → **A-8 (abierta)**:
   el script debe exigir haber examinado algo (¿mínimo de ficheros/registros? ¿fallar si el
   directorio de build no existe?). Sin cerrarlo, la puerta es teatro.
2. **El teléfono inventado no está escrito como el patrón.** El patrón acordado es
   `600123456`, pero el prototipo escribe **`+34 600 123 456`, con espacios** **[V]** → la
   comparación literal **no lo caza**. O se normaliza la entrada antes de comparar (quitar
   espacios, guiones y prefijo), o el placeholder más peligroso pasa. Aplica igual a
   mayúsculas/acentos en `IMAGEN TEMPORAL` y `Plantilla de demostración`. **Hay que decidirlo
   en el Gherkin**, patrón por patrón: comparación literal o normalizada.
3. **El detector se detecta a sí mismo.** El módulo contiene los patrones prohibidos como
   literales; si acaba en el bundle de cliente, **el artefacto contendrá `ph-woman` y
   `Calle de la Belleza`** y la puerta fallará siempre, por su propia existencia. → La puerta
   vive en el build (Node), **no se empaqueta al cliente**; y el escaneo excluye explícitamente
   su propio código.
4. **El placeholder escondido en un `data:` URI.** Vite **inlina** los assets pequeños en
   base64: el nombre `ph-woman0.png` **desaparece** del artefacto y una foto IA podría cruzar
   la puerta invisible. Buscar por nombre de fichero **no basta** si el fichero deja de tener
   nombre. → Los `ph-*.png` deben quedar **fuera del inlining**, o la vía por flag debe cubrir
   toda imagen placeholder. La vía por flag es la robusta; el patrón es la red.
5. **Falso positivo legítimo.** Un texto real que contenga un patrón (una página legal, un
   comentario, este mismo documento). → La puerta escanea **el artefacto de producción**, no
   el repo. `project-spec.md` no se despliega.
6. **Marcado `esPlaceholder: true` pero con contenido real** (p. ej. el teléfono verificado
   marcado por precaución) → **es violación igual**. El flag manda: lo que dice es «esto no
   está confirmado», y publicar sin confirmar es exactamente lo que D-6 prohíbe.
7. **Contenido real que aún no está marcado ni coincide con ningún patrón** (p. ej. un precio
   inventado nuevo, `31 €`) → **la puerta NO lo caza, y no puede**. Ninguna puerta detecta una
   mentira bien escrita. La puerta cubre lo conocido; lo demás lo cubre I-7 (los datos viven en
   una fuente única, revisable) y la puerta humana. **Decirlo es parte de la spec**: una puerta
   que se cree infalible es peor que ninguna.

#### Modos de error

- **Violación encontrada** → exit ≠ 0 + informe legible: una línea por violación con patrón o
  flag, ubicación y valor.
- **Error de la propia puerta** (entrada malformada, ruta ilegible, excepción) → **falla
  cerrada**: build roto, nunca build verde. *Es derivación de D-9 **[I]**, no una decisión
  aparte del humano: si la puerta puede fallar en silencio y dejar pasar el build, D-9 es
  falsa.* Una puerta que se traga su propia excepción y devuelve `[]` es peor que no tener
  puerta, porque además da confianza.

#### Preguntas abiertas de esta feature

- **A-8**: ¿cómo se protege la puerta del **verde por vacuidad** (caso límite 1)?
- **A-9**: ¿comparación **literal o normalizada** por patrón (caso límite 2)? Afecta
  directamente a los escenarios Gherkin.

---

### Feature 2: `datos_negocio_fuente_unica` — el NAP canónico

> Feature `#2` de `feature_list.json`. Depende de F-01 (`puerta_placeholders`, ya `done`).
> Es la primera implementación de **I-7** («los datos viven fuera del JSX, en una fuente
> única»), aplicada al dato **más peligroso** del prototipo: el teléfono.

#### Propósito

Un **único módulo** `src/lib/site.ts`, fuente canónica del **NAP** (Nombre, Dirección,
Teléfono) y de los *href* que se derivan de él, tal que **cambiar un dato en un solo sitio lo
cambia en todas sus apariciones** y el texto visible y el `href` **no puedan divergir**.

#### Por qué va segunda (el bug que mata)

El prototipo escribe el teléfono **7 veces** y el `href` está **a mano**, aparte del texto que
se muestra **[V, I-7]**: bastaría un descuido para **enseñar `625 22 33 66` y marcar otro
número** — y nadie lo vería hasta que una clienta llama a quien no es. Si `telHref` y `waHref`
se **derivan** de una sola constante, texto y `href` salen del **mismo** dato y **no pueden**
desincronizarse. Es el caso de libro de I-7, y por eso F-02 va justo detrás de la puerta.

#### Alcance — qué es F-02 y qué no (decisión de troceado)

El `feature_list` describe F-02 como **«un solo módulo `src/lib/site.ts`»** y la regla del
arnés es **una feature a la vez**. De ahí tres decisiones de alcance a fijar:

- **La lógica testeable y mutada de F-02 = `telHref`, `waHref` y el array `registros`**, más
  las **constantes verificadas** del NAP. Es lo único que lleva TDD y mutación. El JSON-LD
  (`BeautySalon`) es **F-04** (T-6) y la **lógica de horario** (`estaAbierto`, franjas) es
  **F-10**: F-02 **no** los implementa, solo **custodia los datos** que ellos consumirán.
  *Recomendación:* sembrar ya en `site.ts` los datos **verificados** que otras features
  necesitarán —geo `40.5179875, −3.9226688` **[V]**, Instagram `@nailslash.studio_` **[V]**,
  Facebook **[V]**—, porque son la misma fuente única y están verificados; pero **la carga de
  test de F-02 recae solo en `telHref`/`waHref`/`registros`**. Marcarlo así impide que F-02
  crezca hacia F-04/F-10. **[ASUNCIÓN a confirmar]**

- **¿F-02 cablea los `registros` en la puerta?** Hoy `tools/puerta-placeholders.ts` tiene
  `const registros: never[] = []` con un TODO que dice, literalmente, que **F-02 alimentará la
  vía por FLAG** y que «inventar aquí un árbol de datos sería invadir F-02» **[V: código]**.
  → **Decisión propuesta: el cableado sí es de F-02.** Motivo: un array de `registros` que
  nadie consume es código muerto, y F-01 dejó la vía por flag **«cableada pero sin alimentar
  hasta F-02»** a propósito; **F-02 es la feature que cierra ese lazo**. El cambio en `tools/`
  es **una sola línea** (sustituir `never[] = []` por el `import` del array de `site.ts`) en el
  **humilde**, que por contrato **no lleva tests ni mutación** **[V: código]** — así que **no**
  añade superficie de TDD y **no** rompe «una feature a la vez»: toda la lógica nueva vive en
  `src/lib/site.ts`. *Alternativa descartada:* dejar el cableado para un paso posterior — deja
  F-02 sin efecto observable en la puerta y obliga a reabrir el humilde más tarde. **Queda como
  A-12 para la puerta de aprobación.**

- **Email y precios NO son NAP y NO son reales todavía.** Los **precios** son **F-09**
  (catálogo, `bloqueada_para_publicar`), no F-02. El **email**
  (`centroesteticarozas@gmail.com` aparece **solo** en el JSON-LD oculto de la web actual,
  nunca visible, y **[NV]** si se atiende **[V: datos-redes §2.1]**) entra —si entra— como
  **registro `esPlaceholder: true`**, no como valor real presentado como real: así la **puerta
  de F-01 bloquea el build de producción** hasta que el cliente lo confirme (D-6). Si ese
  registro placeholder vive **ya** en `site.ts` o se difiere a **F-12** (contacto, su
  consumidor) es **A-11**.

#### Comportamiento esperado

1. Existe **`src/lib/site.ts`** como **única** fuente del NAP. Ningún componente escribe el
   nombre, la dirección o el teléfono a mano: los **importa**.
2. Las **constantes verificadas [V]** que expone, al menos:
   - **Nombre**: `Nails Lash Studio`.
   - **Dirección**, estructurada (no una cadena suelta): `C.C. El Zoco` · `Av. de Atenas 75` ·
     `Local 41` · `Planta 0` · `28232` · `Las Rozas de Madrid`. *(El `Local 41` y la
     `Planta 0` desambiguan frente a **Acosta Nails**, otro salón en el mismo edificio,
     Local 1 **[V: datos-redes §2.8]**; F-11 los mostrará.)*
   - **Teléfono** (forma legible): `625 22 33 66`.
   - **Horario** (dato, no copy): L–V 10:00–20:00 · S 10:00–14:00 · D cerrado. *(La **lógica**
     que lo interpreta es F-10; F-02 solo lo guarda.)*
   - **Geo** `40.5179875, −3.9226688`; **Instagram** `@nailslash.studio_`; **Facebook**
     `https://www.facebook.com/nailslashstudiorozas/`. **TikTok: no existe** — no se expone
     handle alguno **[V]**.
3. **`telHref(tel)`** devuelve el `tel:` URI **normalizado a E.164**:
   `telHref('625 22 33 66') → 'tel:+34625223366'`. Es **puro** y **determinista**.
4. **`waHref(tel, texto)`** devuelve el enlace **click-to-chat** con el número en **E.164 sin
   el `+`** y el **texto `encodeURIComponent`-ado**:
   `waHref('625 22 33 66', 'Hola, quiero cita') → 'https://wa.me/34625223366?text=Hola%2C%20quiero%20cita'`.
   Es **puro**.
5. **Fuente única, comprobable:** el texto visible del teléfono, `telHref` y `waHref` derivan
   **todos** de la **misma** constante. Cambiarla en `site.ts` cambia el texto **y** ambos
   `href` en **todas** sus apariciones (criterio de aceptación 4).
6. **`registros`**: un `readonly RegistroDatos[]` (el tipo de `src/lib/placeholders.ts`,
   `{ ubicacion, valor, esPlaceholder }`) que la **puerta de F-01 consume por la vía por
   flag**. Los datos **verificados** van con `esPlaceholder: false`; lo **no confirmado**
   (email), con `esPlaceholder: true`.

#### Contrato

| | |
| - | - |
| **`telHref(tel: string): string`** | **Entrada:** un teléfono en cualquier forma humana (`625 22 33 66`, `625-22-33-66`, `+34 625 223 366`, `0034625223366`). **Salida:** `tel:` + número **E.164** (`tel:+34625223366`). **Puro**: no lee reloj, ficheros ni entorno. **Idempotente:** una entrada ya en E.164 sale igual, sin doble prefijo |
| **`waHref(tel: string, texto: string): string`** | **Entrada:** teléfono (como arriba) + texto libre ya compuesto. **Salida:** URL click-to-chat con el número **E.164 sin `+`** y `?text=` con `encodeURIComponent(texto)`. **Puro** |
| **`registros: readonly RegistroDatos[]`** | La proyección del NAP a la forma que consume la puerta de F-01. `ubicacion` = ruta del campo (p. ej. `site.telefono`); `valor` = la cadena; `esPlaceholder` = `false` para lo verificado, `true` para lo no confirmado |
| **Constantes** | Nombre, dirección estructurada, teléfono, horario, geo, redes. Inmutables (`as const`/`readonly`). Son **la** fuente; nadie las duplica |
| **Determinismo** | Misma entrada → misma salida. `telHref`/`waHref` son puras; las constantes son literales |

**Estándares que fijan el formato** (para el Gherkin):

- **`tel:` URI → RFC 3966** (*The tel URI for Telephone Numbers*, IETF): un número **global**
  se escribe con **`+` inicial** seguido del número en forma **E.164** **[V: estándar público;
  confirmar el § exacto en `datatracker.ietf.org/doc/html/rfc3966` antes de citarlo en el
  Gherkin — no consultado en esta sesión]**.
- **E.164 → ITU-T E.164**: número internacional = código de país + número nacional, **máx. 15
  dígitos**; **España = +34** **[V: estándar público]**.
- **WhatsApp click-to-chat → `https://wa.me/<E164_sin_+>?text=<urlencoded>`**, documentado en
  `faq.whatsapp.com` (*Cómo usar el enlace de clic para chatear*): número en formato
  internacional **completo, sin ceros, paréntesis, guiones ni `+`**, y `text` **urlencoded**.
  **⚠️ [NV] contra fuente primaria — es exactamente A-3**: el Help Center se renderiza con JS y
  no se pudo leer en crudo. **Consecuencia de diseño (A-10):** lo **testeable y mutable** de
  `waHref` es que el número va **en E.164 sin `+`** y el texto **`encodeURIComponent`-ado**; el
  **host/prefijo** (`wa.me` vs `api.whatsapp.com/send?phone=…&text=…`) se trata como una
  **constante configurable** que se **verifica a mano en Android, iOS y WhatsApp Web antes de
  F-13** (A-3). El test de F-02 asevera las dos propiedades, **no ata el host**.

**Mutantes que deben morir** (I-6, y criterio de aceptación 5):

- Quitar el `+` en `telHref` (`tel:34625223366`) → rompe.
- Quitar la anteposición de `+34` o el compactado de separadores (`tel:+34625 22 33 66`) →
  rompe.
- Dejar el `+` en el número de `waHref` (`wa.me/+34625223366`) → rompe.
- `encodeURIComponent` → `encodeURI` (deja `&` y `#` sin escapar) → rompe (ver caso límite 4).
- Perder la **idempotencia** del prefijo (doble `+34`) → rompe (caso límite 1).

#### Casos límite debatidos

1. **Teléfono ya en E.164** (`+34625223366` o `34625223366`): `telHref` es **idempotente** →
   `tel:+34625223366`, **nunca** `tel:+34+34625223366` ni `tel:+3434625223366`. La
   normalización detecta el prefijo ya presente. Conviene **alinear los prefijos con
   `placeholders.ts`**, que ya declara `PREFIJOS_INTERNACIONALES = ['+34', '0034']`
   **[V: código]**: una sola regla de normalización, no dos que puedan divergir.
2. **Separadores** (espacios, guiones): `625 22 33 66`, `625-22-33-66` → **misma** salida; se
   compactan. `placeholders.ts` usa `SEPARADORES_DE_TELEFONO = /[ -]/g` (solo espacio y guion,
   **deliberadamente estrecho**, para no unir dígitos de líneas distintas) **[V: código]**.
   **[PREGUNTA]** ¿F-02 acepta también el punto (`625.22.33.66`) o la barra? Por defecto,
   **solo espacio y guion**, como la puerta; decidir en el Gherkin.
3. **Prefijo `0034`** → `+34`. Cubierto por la regla anterior si se comparte con la puerta.
4. **`waHref` con texto de acentos, `·`, emoji, `&`, `#`**: `encodeURIComponent` los codifica
   **todos** (`á`→`%C3%A1`, `·`→`%C2%B7`, emoji→UTF-8 percent-encoded, `&`→`%26`, `#`→`%23`).
   **Por qué `encodeURIComponent` y no `encodeURI`:** `encodeURI` **no** escapa `&` ni `#`; un
   `#` crudo cortaría la URL en un *fragment* y un `&` crudo inyectaría un parámetro → mensaje
   roto. Es el **gemelo primitivo** de `componerMensajeWhatsApp` (F-13): **F-02 codifica un
   texto ya compuesto; F-13 compone el texto y llama a `waHref`** — sin solaparse.
5. **El teléfono real NO es el patrón placeholder.** `625223366` ≠ `600123456` (el número
   inventado del prototipo, patrón de F-01) **[V]**: el registro del teléfono real **pasa** la
   vía por patrón de la puerta sin falso positivo. Es la prueba de que F-02 y F-01 **encajan**.
6. **`waHref` con texto vacío**: **[PREGUNTA]** ¿`https://wa.me/34625223366` **sin** `?text`, o
   `…?text=`? Recomendación: **omitir `?text=`** con texto vacío (no pre-rellenar un mensaje en
   blanco). Decidir en el Gherkin.
7. **Anti-tautología (regla del arnés):** el test **no** compara la constante de producción
   contra sí misma; compara la salida contra el **literal escrito a mano** `'tel:+34625223366'`
   / `'34625223366'`. Si el test importara la constante y la reflejara, un teléfono equivocado
   pasaría verde.

#### Modos de error

- **Entrada sin dígitos suficientes para un número ES válido** (`''`, `'abc'`, `'625'`):
  **[PREGUNTA/ASUNCIÓN]** ¿`telHref`/`waHref` **lanzan** (falla ruidosa, coherente con «falla
  cerrada» del proyecto) o devuelven la mejor normalización posible? *Recomendación:* como el
  dato canónico **siempre** viene del single source verificado, la ruta normal nunca ve basura;
  aun así, ante una entrada inválida **conviene lanzar** antes que emitir un `tel:+34` a medias
  que parezca válido. Decidir en el Gherkin.
- **Número fuera del rango E.164** (>15 dígitos): mismo criterio que el anterior.
- **`site.ts` con un dato mal escrito** (p. ej. el teléfono con un dígito de más): F-02 **no**
  lo detecta —una mentira bien escrita no la caza ninguna puerta (ver F-01, caso límite 7)—; lo
  cubren I-7 (dato único, revisable) y la puerta humana sobre el `.feature`.

#### Preguntas abiertas de esta feature

- **A-10**: ¿host de `waHref` = `wa.me` o `api.whatsapp.com/send`? Ligada a **A-3 [NV]**. Lo
  testeable de F-02 (E.164 sin `+`, `encodeURIComponent`) es **host-agnóstico**; el host se
  confirma a mano antes de F-13.
- **A-11**: ¿el **email** entra en `site.ts` como registro `esPlaceholder: true` **desde F-02**
  —rompiendo ya el build de producción, que es lo correcto (D-6)— o se difiere a **F-12**?
- **A-12**: ¿F-02 **cablea** `registros` en `tools/puerta-placeholders.ts` (hoy `never[]`), o
  es un paso posterior? *(Recomendación en «Alcance»: sí, es de F-02.)*
- **[PREGUNTA]** separadores aceptados por la normalización (caso límite 2) y **texto vacío**
  en `waHref` (caso límite 6): se cierran en el Gherkin.

---

### Feature 3: `tokens_paleta_contraste` — la paleta accesible con puerta que recalcula

> Feature `#3` de `feature_list.json`. **No depende de F-01 ni F-02** (solo del arranque
> F-00): es autónoma y va tercera por ser cimiento visual de F-04/F-07/F-09/F-13. Es la
> primera implementación de **I-3** («WCAG 2.2 AA, con una puerta que recalcula el contraste
> desde el SCSS») y encarna **T-1** («NO copiar `_tokens.scss` de WebEmpresa»).

#### Propósito

Los **13 tokens de la paleta Rosa** viven en un **`:root` real** —no en un `style` inline,
como el prototipo (`Opcion-1-Rosa.dc.html:28`) **[V]**— con los **7 cambios obligatorios**
que la hacen cumplir **WCAG 2.2 AA**, y una **puerta mecánica** que **recalcula el contraste
desde el SCSS** y **rompe el build** si cualquier par en uso baja de su umbral.

#### Por qué la puerta va EN la misma feature que los tokens (I-3, T-1)

La paleta cerrada (decisión **D-5**, solo Rosa) **falla 32 de 68 combinaciones AA (47 %)**,
incluido el **botón «Reservar»** (blanco sobre `#C05576` = **4,37:1** < 4,5), el **precio**
(4,37:1), la **nav** (3,35:1) y **todo el pie** **[V: audit §2.5]**. Eso se arregla con 7
cambios de token. Pero **corregirlos sin una puerta que los vigile es exactamente el error
del stack base**: en WebEmpresa **3 bloqueantes de contraste AA vivían en HEAD con las tres
puertas verdes** (tests, judge, mutación) **porque ninguna feature los representaba**, y su
checklist afirmaba «AA validado» siendo falso **[V: `stack-aprendizajes.md`]**. **Una
auditoría sin puerta no existe.** Alguien retoca un token dentro de seis meses y el fallo
vuelve **en silencio**. Por eso `tokens` + `puerta_contraste` son **una sola feature**: los
tokens son el estado; la puerta es lo que lo sostiene.

Y por eso **NO se copia `_tokens.scss` de WebEmpresa** (T-1): su base arrastra
`--color-accent` 3,78:1, `--color-tag-ink` 2,64:1 y `--color-text-faint` 2,78:1 **[V]**. Se
recalcula todo uno mismo; **no se cree la documentación del base** —que además describe una
paleta («Teal/Coral») que su código no usa **[V]**. Hoy `_tokens.scss` **no existe** en este
repo: `src/styles/main.scss` deja escrito que «los parciales del sistema (`_tokens`,
`_reset`, `_base`) llegan con la feature de diseño» **[V: código]**. **Esta es esa feature.**

#### Alcance — qué es mutable y qué no

- **Los tokens (SCSS) NO son mutables.** Stryker no ve CSS/SCSS y `src/styles/` **no** está
  en la lista de `mutate` **[V]**. El `feature_list` marca la feature `mutable: true` **por
  `src/lib/contraste.ts`**, no por los tokens.
- **La lógica mutable = `src/lib/contraste.ts`** (parseo, linealización, luminancia, ratio,
  composición alfa) **más el predicado de la puerta** (comparar ratio contra umbral). Ahí
  muerden los mutantes de la acceptance 7.
- **La corrección de los 7 tokens es un cambio de valores en el SCSS**; lo que la convierte
  en feature verificable —no en una recomendación olvidable— es la puerta.

#### Los 7 cambios obligatorios (verbatim del audit §5.1 / feature_list, con su porqué)

Todos los ratios son **[V]** del audit (`contrast.py`/`contrast2.py`, fórmula W3C G17
ejecutada). «Antes» = paleta cerrada; «después» = corregida. Ojo a la distinción **valor**
(cambia el hex del token) vs **uso** (el token no cambia; cambia qué token se usa dónde):

| # | Cambio | Antes → Después | Por qué |
| - | ------ | --------------- | ------- |
| 1 | `--muted` **(valor)** | `#9C7F89` → **`#6F525A`** | `#9C7F89` es **inservible como texto**: 3,35:1 sobre `--bg`, 3,61:1 sobre `--surface` → causa **11 de los 32 fallos**. `#6F525A` da 6,42:1 / 6,93:1 |
| 2 | `--accent` **como texto/borde (uso)** | usar `#C05576` → usar **`--accent-dark #A23E5F`** | `#C05576` da 4,05:1 como texto sobre `--bg` (< 4,5). `--accent-dark` **ya existe** en la paleta y pasa en los 4 fondos (mín. **4,86:1**). No se cambia el token: se **cambia el uso** |
| 3 | `--accent` **como relleno con texto blanco (uso)** | `#C05576` → **`--accent-dark #A23E5F`** | Blanco sobre `#C05576` = **4,37:1** → **el botón «Reservar», la CTA del negocio, falla**. Blanco sobre `#A23E5F` = **6,19:1** |
| 4 | `--accent-2` **(valor: texto blanco/icono)** | `#E38AAE` → **`#B3316E`** | Blanco sobre `#E38AAE` = **2,47:1** (badges de oferta y **estrellas** de reseña). `#B3316E` da 5,86:1 |
| 5 | `--border-interactive` **(token NUEVO)** | — → **`#AB5F79`** | `--line rgba(176,70,106,.16)` da **1,26:1**: vale como decorativo, **no** para delimitar controles (SC 1.4.11, 3:1). Se **parte** el token: `--line` decorativo se queda; los bordes de swatch/día/input usan `#AB5F79` (peor caso **3,54:1** sobre `--accent-soft`) |
| 6 | `--ink` **como fondo del pie (valor)** | `#B0466A` → **`#8E3355`** | Con `#B0466A`, **ninguna** opacidad de blanco < 1.0 alcanza 4,5:1 (`.82` cae a 4,15:1) — **límite matemático [V]**. Con `#8E3355`, `rgba(255,255,255,.70)` = **4,60:1** y `.82` = 5,68:1. *(El 4,60 es el valor **cuantizado** del audit; en coma flotante es **4,59** — ver A-16. Pasa en ambos modelos, el cambio de token sigue justificado.)* |
| 7 | «en línea» del chat **(valor)** | `#2f9d5f` → **`#186237`** | `#2f9d5f` sobre `--accent-soft` = **2,69:1**. `#186237` = 5,79:1 |

**`#C05576` se CONSERVA** como color de marca en **rellenos grandes y decorativos**
(`--accent`, `--brush`): el problema **nunca fue la estética rosa**, sino que la paleta
**confundía «color de marca para rellenos» con «color de texto»** **[V, audit §2.7]**. La
regla dura (audit §5.2): **prohibido `#C05576` como texto pequeño o como relleno con texto
blanco** — «se reintroduce solo». Cómo asevera la puerta ese negativo es **A-13**.

#### Comportamiento esperado

1. Existe **`src/styles/_tokens.scss`** con un **`:root` real** que declara los 13 tokens de
   la paleta Rosa **con los 7 cambios aplicados**, más `--border-interactive #AB5F79` y el
   color de estado `#186237`. *(Inventario exacto de tokens en A-15.)*
2. Existe **`src/lib/contraste.ts`**: funciones **puras** que implementan W3C **G17** —parseo
   `#RRGGBB` → canales 0–255, **linealización** con umbral **0.04045**, **luminancia**
   `L = 0.2126·R + 0.7152·G + 0.0722·B`, **ratio** `(L1+0.05)/(L2+0.05)` con L1 el más
   claro— **y composición alfa** (para `--line` translúcido y para el `color-mix()` de la
   cabecera).
3. Existe una **puerta**: un test que **lee `_tokens.scss`**, extrae el hex de cada token, y
   para **cada par en uso** recalcula el ratio y lo compara con **su** umbral; si alguno
   baja, **el test falla y el build se rompe**. El molde ya existe en el base
   (`src/styles/tokens.test.ts`: `readFileSync` del SCSS + regex sobre `:root`) **[V]**; aquí
   se **sube un escalón**: en vez de asever*ar* un hex fijo, **se recalcula el ratio**.
4. La puerta cubre **los dos casos que un chequeo ingenuo de la paleta NO ve**: el `clamp()`
   («Studio») y el `color-mix()` de la cabecera (casos límite (a) y (b)).
5. La puerta aplica **tres umbrales** según el par: SC 1.4.3 → **texto normal 4,5:1**, **texto
   grande 3:1** (≥24 px, o ≥18,5 px negrita); SC 1.4.11 → **componente/borde de control 3:1**.
   **El umbral NO está en el SCSS**: viene de una **matriz de uso** declarada (Contrato, A-13).

#### Contrato

**`src/lib/contraste.ts` — funciones puras (mutables):**

| Función | Contrato |
| ------- | -------- |
| `hexARgb(hex): [r,g,b]` | `#RRGGBB` (y `#RGB`) → tres enteros 0–255. **Pura.** Entrada inválida → **lanza** (falla cerrada; ver Modos de error) |
| `canalLineal(c8: number): number` | `c = c8/255`; **si `c <= 0.04045` → `c/12.92`; si no → `((c+0.055)/1.055)^2.4`**. El umbral es **0.04045** (WCAG 2.2; el `0.03928` es el valor anterior, sin efecto práctico en 8 bits). **Pura** |
| `luminancia([r,g,b]): number` | `0.2126·canalLineal(r) + 0.7152·canalLineal(g) + 0.0722·canalLineal(b)`. **Pura** |
| `ratio(colorA, colorB): number` | `(L1 + 0.05) / (L2 + 0.05)`, con **L1 = max**, L2 = min de las dos luminancias. Simétrica: `ratio(a,b) === ratio(b,a)`. **Pura** |
| `componer(rgba, fondoRgb): [r,g,b]` | Composición sobre fondo opaco: `canal = α·fg + (1−α)·bg`. **Devuelve flotantes, sin cuantizar a 8 bits (A-16).** Cubre `--line` (α=.16) y el `color-mix(in srgb, --bg 88%, transparent)` de la cabecera (equivale a `--bg` con α=.88 sobre lo que scrollee debajo — **premultiplicada**, spec normativa; **precondición: `--bg` opaco**, la regla general es `α_resultante = α(--bg) × 0.88`). **Pura** |

Como en F-01: **la función es pura; el `exit ≠ 0` vive en la puerta** (test + hook de build),
no en la función. Por eso `contraste.ts` es testeable y mutable, y por eso `dev` no falla.

**La puerta (test que lee el SCSS) — pares comprobados y umbral de cada uno.** La lista de
pares es la **matriz de uso** (las combinaciones que la página **usa de verdad** — las 68 del
audit, no el producto cartesiano de tokens; ver A-13). Representativos **[V, audit §2.7]**:

| Par (fg / bg) | Rol | Umbral | Ratio corregido |
| ------------- | --- | ------ | --------------- |
| `--muted #6F525A` / `--bg`, `--surface` | texto | 4,5 | 6,42 · 6,93 |
| `--accent-dark #A23E5F` / `--bg`, `--surface`, `--surface2`, `--accent-soft` | texto | 4,5 | 5,74 · 6,19 · 5,24 · **4,86** |
| `#FFF` / `--accent-dark` (relleno botón «Reservar») | texto | 4,5 | 6,19 |
| `#FFF` / `--accent-2 #B3316E` (badge/icono estrellas) | texto/icono | 4,5 | 5,86 |
| `--ink #8E3355` / `--bg`, `--surface2`, `--accent-soft` | texto/grande | 4,5/3 | 7,06 · 6,45 · 5,98 |
| `--text #5E404A` / `--bg`, `--surface2` | texto | 4,5 | 8,43 · 7,70 |
| `rgba(#FFF,.70)` / `--ink #8E3355` (pie) | texto | 4,5 | **4,59** *(A-16: flotante. El 4,60 del audit es el valor cuantizado a 8 bits; con el `componer` flotante que fija @s9 el ratio es 4,5913 y `toBeCloseTo(4.60)` fallaría. **Única fila compuesta → única afectada**)* |
| `--border-interactive #AB5F79` / `--accent-soft` (peor fondo) | **componente** | **3** | 3,54 |
| `#186237` / `--accent-soft` («en línea») | texto | 4,5 | 5,79 |

**Determinismo:** misma entrada → misma salida, **mismo orden** de violaciones (informe
diffable, como F-01). **Anti-tautología (regla del arnés):** el test compara la salida contra
**ratios/veredictos escritos a mano** (`toBeCloseTo(6.19)`), **nunca** contra el resultado de
la misma función que vigila; y los umbrales (4,5 / 3,0) son **literales del test**. Si el test
recomputa el esperado con la función de producción, **un formula rota pasaría verde**.

#### Casos límite debatidos

1. **(a) La trampa de `clamp()` — el ratio no cambia, el UMBRAL sí.** «Studio»
   (`font-size: clamp(14px, 2.2vw, 24px)`, `--ink` sobre `--accent-soft`) da **4,19:1
   constante** **[V]**: a **24 px** (escritorio) es *texto grande* → umbral 3,0 → **pasa**; a
   **14 px** (móvil) es *texto normal* → umbral 4,5 → **falla**. Se detecta **sin navegador**
   porque es cálculo, no render: la matriz de uso registra el **tamaño efectivo mínimo** del
   `clamp` (14 px) y la puerta aplica el umbral del **peor caso** (4,5), no el del máximo. Con
   la paleta corregida el `--ink #8E3355` sube este par a **5,98:1**, que pasa **incluso a
   14 px** — la trampa queda cerrada por el cambio 6, pero la puerta debe **modelar el mínimo**
   para que la clase de bug no vuelva. *(Escape de negocio: si «Nails Lash Studio» es
   **logotipo**, SC 1.4.3 lo exime y este par decae — es **A-4**, decisión del humano; se
   construye AA igual, no se depende de esa exención.)*
2. **(b) La trampa de `color-mix()` — la cabecera translúcida cambia de contraste al hacer
   scroll. ✅ RESUELTA: A-15 → 88 %.** `background: color-mix(in srgb, var(--bg) 88%,
   transparent)` → el fondo real es **88 % `--bg` + 12 % de lo que pase por debajo**. Se testea
   **sin navegador** porque `color-mix` es composición determinista (**premultiplicada**, spec
   normativa; precondición: `--bg` opaco): `componer(--bg@.88, under)`.

   **El 82 % del prototipo NO cumplía AA, y se descubrió calculándolo, no estimándolo.** El
   audit dejó esta trampa explícitamente sin re-verificar con los tokens corregidos y se dio
   por buena de palabra («casi seguro pasan»). Los números reales al 82 %:

   | `under` | nav `--muted #6F525A` | logo `--ink #8E3355` |
   | ------- | --------------------- | -------------------- |
   | `#303030` — «peor caso» **declarado por el audit** | 4,61 ✅ | 5,07 ✅ |
   | **`#1B1B1D` «Negro Ónix»** — **color real de la carta** (`salon-data.js:90`) | **4,44 ❌** | 4,88 ✅ |
   | `#000000` negro puro | **4,22 ❌** | 4,64 ✅ |

   **El audit declaró como peor caso un `#303030` más claro que el negro de su propia carta de
   esmaltes.** Y el contrato tampoco lo habría cazado: declaraba «foto oscura» como `under`
   **solo para `--ink` (logo)**, no para `--muted` (nav) — y **la nav es la que falla**. Logo y
   nav viven en la **misma** cabecera: lo que scrollea bajo uno scrollea bajo el otro. La
   asimetría escondía la única combinación mala.

   **Al 88 % la cabecera es incondicionalmente AA**: nav **4,89** · logo **5,38** contra el
   **peor under posible** (negro puro). Conserva la translucidez (deja pasar 12 % frente al
   18 %) y el `backdrop-filter: blur(14px)`. Verificado que el redondeo a 8 bits no lo tumba.
   **Esto desacopla F-03 de F-06 y F-17**: `@s17` ya no valida una lista declarada de `under`s
   —que era frágil y es justo lo que falló— sino **el peor `under` posible**; si pasa con negro
   puro, pasa con cualquier cosa. No hay que enumerar qué secciones scrollean debajo ni
   restringir cómo de oscuras pueden ser las fotos reales. `@s18` ancla el 88 con el 4,22 del
   82 %, porque el 88 vive en el SCSS —que Stryker no muta— y el mutante real ahí es **humano**:
   alguien que dentro de seis meses lo baje «por fidelidad al prototipo».

   > `blur(14px)` no altera el análisis, y el audit ya lo decía: el desenfoque **promedia** el
   > color, no lo aclara. Región oscura grande → el centro sigue oscuro (peor caso intacto);
   > elemento oscuro pequeño → el blur solo **ayuda**.
3. **El umbral 4,5 vs 3,0 sale del ROL del par, no del SCSS.** El token file solo tiene
   colores; «esto es texto / esto es texto grande / esto es un borde de control» es
   información de **uso**. Por eso hace falta la matriz de uso (A-13): sin ella la puerta **no
   puede** elegir umbral y es teatro. Análogo al «verde por vacuidad» de F-01 (A-8).
4. **`--line` decorativo vs `--border-interactive`.** El mismo color de línea es **conforme**
   como separador decorativo (SC 1.4.11 **no** le aplica) y **no conforme** delimitando un
   control **[V, audit Nota A]**. La puerta **solo** exige 3:1 a los usos **interactivos**
   (swatch #11, botón de día #19, input #26); el `--line` decorativo **no entra en la
   matriz**. Meterlo daría un **falso fallo**.
5. **Par en gris puro (canales iguales).** Los coeficientes 0.2126/0.7152/0.0722 no se
   distinguen si `R=G=B`: un mutante de coeficiente **sobreviviría** a un test que solo use
   grises. La matriz debe incluir pares **cromáticos con aporte de los tres canales** (los
   rosas y el verde `#186237` lo garantizan) para que los mutantes de coeficiente mueran.
6. **Color de 3 dígitos / mayúsculas-minúsculas / con o sin `#`.** `hexARgb` normaliza; el
   Gherkin fija qué formas acepta el parser del SCSS (los tokens se escriben `#RRGGBB` en
   minúscula/mayúscula indistinta). **[PREGUNTA]** menor, se cierra en el Gherkin.

#### Modos de error

- **Par por debajo de su umbral** → la puerta devuelve una **violación** (qué par, qué ratio,
  qué umbral) → **exit ≠ 0** + informe legible, una línea por par. La puerta debe **acusar**
  el par exacto, no decir «hay un fallo de contraste».
- **`_tokens.scss` ilegible, token ausente, o hex malformado** → **falla cerrada**: build
  roto, nunca verde (derivación de I-3, igual que F-01). Una puerta que se traga la excepción
  y devuelve «0 fallos» es **peor que ninguna**, porque da confianza falsa — es literalmente
  cómo se evaporaron los 3 bloqueantes del base.
- **Matriz de uso apuntando a un token que ya no existe / regex que no casa nada** → **verde
  por vacuidad**: si la puerta no comprueba **ningún** par, pasa creyéndonos protegidos.
  Mismo peligro que A-8 en F-01. La puerta debe **exigir** haber evaluado un mínimo conocido
  de pares. Parte de **A-13**.

#### Mutantes que deben morir (acceptance 7, I-6 umbral 1.0)

- **Rama a trozos de `canalLineal` forzada** (Stryker: condición `<=` → `<`, o forzar la
  condición a `true`/`false`): un color vivo (p. ej. `--accent`) da luminancia muy distinta
  según la rama → **muere** con cualquier par cromático.
- **Coeficientes de luminancia** (`0.2126·R + 0.7152·G + 0.0722·B`): mutar el `+` que une los
  tres términos por `-`, o el `·` por `/` → **muere** con pares cromáticos (caso límite 5).
- **`4.5` vs `3.0`** (selección de umbral): mutar el umbral de un par **componente** (3,0 →
  4,5) hace fallar `--border-interactive` (3,54) → **muere**. Para matar el sentido inverso
  (4,5 → 3,0 en un par de texto) hace falta un **fixture de par malo conocido** con ratio en
  `(3,0 · 4,5)` —p. ej. el botón viejo `#FFF/#C05576` = **4,37**— y **asever que la puerta lo
  marca**. Sin fixtures negativos, este mutante y los de fórmula **sobreviven**.
- **`+0.05`** del numerador/denominador del ratio: mutarlo por `-0.05` o eliminarlo cambia
  todos los ratios → **muere**.
- **`/` del ratio → `·`** → **muere**.

> ⚠️ **Sutileza que hay que resolver ANTES del Gherkin (A-14): el mutante `0.04045 →
> 0.03928` es EQUIVALENTE para color de 8 bits.** No existe ningún canal entero `c/255` en el
> hueco `(0.03928, 0.04045)` (10/255 = 0,0392 queda por debajo; 11/255 = 0,0431, por
> encima), así que **ningún token hex distingue los dos umbrales** — lo dice el propio audit
> §2.1. Con umbral de mutación **1.0**, un superviviente inmatable **bloquea la feature para
> siempre**. Se resuelve por dos vías, a fijar en el Gherkin: (1) confirmar que **Stryker no
> genera** ese swap concreto (sus mutadores numéricos por defecto no cambian literal→literal;
> mutan operador/condición, que **sí** mueren, arriba); y (2) **testear `canalLineal` con
> inputs sintéticos** que straddlen el punto de corte, no solo a través de hex, para que la
> rama esté cubierta de verdad.

#### Preguntas abiertas de esta feature — TODAS CERRADAS (2026-07-16)

Ninguna queda abierta. El detalle razonado, con los cálculos y las citas oficiales, está en
**`progress/f03_verificacion_previa.md`**. Resumen:

- **A-13** ✅ — matriz de uso **declarada** (no producto cartesiano), con **mínimo de pares
  exigido** (@s14) y **aseveración del negativo** «`#C05576` nunca como texto» (@s13).
- **A-14** ✅ — **Stryker 9.6 no genera el mutante `0.04045 → 0.03928`** (doc oficial): el
  riesgo del umbral 1.0 **no existe**. La equivalencia en 8 bits se verificó por cálculo
  exhaustivo (0 canales de 256 en el hueco); **depende estrictamente de los 8 bits** (a 10 bits
  `41/1023` sí cae dentro). La constante sí es mutable vía su entorno sintáctico → @s5/@s6 con
  input sintético en el punto de corte.
- **A-15** ✅ — **cabecera translúcida al 88 %** (decisión del humano). El 82 % **no cumplía**:
  nav **4,44** con «Negro Ónix» `#1B1B1D`, **4,22** con negro puro. Al 88 % es
  **incondicionalmente AA** (nav 4,89 · logo 5,38 contra el peor under posible). `@s17` valida
  **el peor under POSIBLE**, no una lista declarada; `@s18` ancla el 88 con el 4,22 del 82 %.
- **A-16** ✅ *(nueva, del lead)* — **`componer` en coma flotante**; la fila del pie vale
  **4.59**, no 4.60 (que es el valor cuantizado del audit). Sin esto el TDD se estrellaba.
- **A-4** (ya abierta, **sigue abierta**) — si «Nails Lash Studio» es **logotipo**, SC 1.4.3
  exime el par del `clamp` (caso límite (a)). Decisión de negocio del humano; **no se depende**
  de ella: se construye AA igual.

**Correcciones de fuente y justificación aplicadas al contrato** (verificadas contra
documentación oficial por 14 subagentes, 7 afirmaciones × verificar + refutar):

- **La fuente citada estaba desactualizada.** `w3.org/WAI/GL/wiki/Relative_luminance` **sigue
  imprimiendo `0.03928`** con una errata encima. **No** contradice al contrato: lo respalda —
  pero un revisor futuro que lo cite «corregiría» la implementación hacia el valor obsoleto.
  **Fuente de verdad: el glosario de WCAG 2.2**, no el wiki.
- **«SC 1.4.11 exige 3:1 a los bordes de control» es falso como regla.** El eje normativo es
  **la información visual requerida para IDENTIFICAR el componente y su estado**. Partir
  `--line` de `--border-interactive` sigue siendo correcto; el porqué estaba mal escrito.
- **«WCAG exige el peor caso» es falso.** F83 lo trata como *Quickcheck*: condición
  **suficiente, no necesaria**. La exigencia real es ≥4,5:1 entre **cada letra y el fondo
  inmediatamente detrás**. Exigir el peor under es correcto porque **lo implica**.
- **«≥18,5 px negrita» es CORRECTO** y se queda: el lead sospechaba que debía ser 18,66 px y
  **se equivocaba** — «18.66px» **no existe en `w3.org`**. Solo se reformuló que lo normativo
  son los **puntos** y los px la aproximación oficial.
- **`color-mix(in srgb, X 88%, transparent)` ≡ `X` con α=0.88** está respaldado por spec
  normativa (interpolación **premultiplicada**). **Precondición: `--bg` debe ser OPACO**
  (`α_resultante = α(--bg) × 0.88`).

---

### Feature 4: `cascaron_semantico` — la cáscara HORNEADA, el JSON-LD de cero y la puerta que mira `dist/`

> Feature `#4` de `feature_list.json`. Depende de **F-02** (el NAP que consume el JSON-LD) y
> **F-03** (`:focus-visible` necesita tokens con contraste). Encarna **T-6** («JSON-LD escrito
> de cero, sin `aggregateRating`») y es la primera aplicación dura de **I-8** («verde ≠
> funciona: en SSG hay dos estados, y jsdom solo ve el segundo»).
>
> **Toda esta sección es coherente con `progress/f04_verificacion_previa.md`** (18 subagentes,
> 9 afirmaciones × verificar + refutar: **4 confirmadas, 5 matizadas, 0 refutadas de raíz**).
> Donde el troceado de `docs/research/00-fase0-informe.md` §7 y esa verificación se
> contradigan, **manda la verificación**. Aquí se contradicen en un punto grave: el acceptance
> 3 (ver «Alcance»).

#### Propósito

Que el HTML **que sale del build** —no el que se ve en `pnpm dev`, no el que ve jsdom— lleve
horneados el idioma, el `title`, la `description`, la canónica, un `h1`, los landmarks y un
JSON-LD **escrito de cero**; y que una **puerta mecánica** lea el **HTML crudo de `dist/`**,
**por cada ruta prerenderizada**, y rompa el build si algo de eso falta.

#### Por qué la puerta mira `dist/` y NO el DOM de jsdom — la bomba de F-04

**Esta feature entera vive o muere en un detalle del `vite-react-ssg` 0.9.0 que nadie había
verificado nunca.** La verificación previa lo destapó contra el **código realmente instalado**
(no contra el README ni contra `main`), y el lead lo reconfirmó de primera mano al escribir
este contrato:

`extractHelmet` lee **exclusivamente del contexto de Helmet**. El parámetro `html`
(= `appHTML`, el árbol de React ya renderizado) **solo** alimenta al `styleCollector`:
**nunca se parsea buscando metadata** **[V: `node_modules/vite-react-ssg/dist/shared/
vite-react-ssg.DsKK_1op.mjs:429-446`]**. Y `renderHTML` inyecta con
`indexHTML.replace('<head>', '<head>' + metaTags)` **[V: `:122-124`]**.

> **Si F-04 usa la metadata NATIVA de React 19 (`<title>`/`<meta>` hoisteados por el propio
> React), el `<head>` del build sale VACÍO. Y estaría VERDE en `pnpm dev` y VERDE en jsdom.
> SEO cero en producción, con toda la suite en verde.**

Es **el patrón de la memoria organizacional** (`red-css-para-rama-solo-js-en-ssg`): *bajo SSG
el HTML horneado congela el estado que el JS de cliente iba a corregir.* Ya ha mordido **3
veces** en WebEmpresa. Aquí mordería una cuarta — y esta vez en el `<head>`.

→ **Decisión: la única vía permitida es `<Head>` de `vite-react-ssg`** (`import { Head } from
'vite-react-ssg'` **[V: `dist/index.d.ts:3`]**), que es un wrapper de `react-helmet-async`
(dependencia **directa** `^1.3.0`, no *peer* → sin conflicto con React 19). **La metadata
nativa de React 19 queda PROHIBIDA en este proyecto.** No es preferencia de estilo: es la
diferencia entre tener SEO y no tenerlo.
*Alternativa descartada:* una propiedad `head` en las rutas — **no existe** **[V]**.

**Y de ahí la segunda mitad de la decisión: jsdom NO puede ser la entrada de la aserción.**
Conviene decir el porqué exacto, porque es más fino que «jsdom malo»: `react-helmet-async`
**también** hace efecto sobre `document.head` en cliente, y React
19 **también** hoistea su metadata al hidratar. **Los dos caminos dan VERDE en jsdom.** Es
decir: **jsdom es exactamente ciego al único bug que esta feature existe para prevenir.**
Testing Library aquí no es «insuficiente»: es **incapaz por construcción** **[I sólida, sobre
[V]]**.

→ **La aserción se hace sobre los bytes de `dist/**/*.html`.** Que el decisor los parsee con
regex o con un parser es detalle de implementación; lo que el contrato fija es **la entrada**:
el artefacto de producción, nunca un render del árbol de componentes.

> **Hallazgo propio del lead, que ACOTA la verificación previa (no la contradice).** En el
> mismo `dist` hay **una** ruta que sí mete HTML del `appHTML` en el `<head>`:
> `metaAttributes.unshift(headElements.innerHTML)` **[V: `:613-617`]**. **No nos aplica**:
> cuelga de `META_CONTAINER_ID = "__SSG_TANSTACK_META_CONTAINER__"` **[V:
> `vite-react-ssg.BqDzTpJh.mjs:3`]**, es decir, del adaptador de **TanStack Router**. Este
> repo usa el adaptador de **react-router** (`ViteReactSSG({ routes })` con `RouteRecord`
> **[V: `src/main.tsx`, `src/App.tsx`]**), cuyo `render` llama a `extractHelmet` **y a nada
> más** **[V: `:455-472`]**. → **T1 se sostiene íntegra para nuestra configuración**, y ahora
> además sabemos **por qué** existía esa aparente escapatoria. Se deja escrito para que quien
> re-verifique dentro de seis meses encuentre `:616`, crea haber refutado el contrato y **lea
> esta nota antes de revertirlo**.

> **Segundo hallazgo propio: el JSON-LD SÍ tiene vía.** `extractHelmet` incluye
> `helmet.script.toString()` en `metaStrings` **[V: `:437-442`]** → un
> `<Head><script type="application/ld+json">` **se hornea**. Sin este dato el contrato no
> podría prometer JSON-LD prerenderizado, que es justo lo que le pide el acceptance 2.

#### Alcance — qué entra, qué NO entra, y **el desacuerdo con el troceado**

**Entra en F-04:** la cáscara (`<Head>`, `lang`, `title`, `description`, canónica, `h1`,
`main`/`nav`/`footer`, `section aria-labelledby`, `:focus-visible` global,
`scroll-padding-top`), el **JSON-LD escrito de cero**, y la **puerta del cascarón** sobre
`dist/`.

**NO entra en F-04:**

- **Las páginas legales — ni su contenido, ni su estructura, ni «vacías». Son F-16**, y lo
  dice el **propio acceptance de F-16**: *«La estructura de ambas páginas existe y es
  navegable»* **[V: `feature_list.json` id 16]**. F-04 no las crea.
- **La cabecera sticky y el menú móvil**: son **F-06** (`header_nav_footer`). F-04 pone el
  `scroll-padding-top` porque es cáscara global; **quién es dueño de `SC 2.4.11` es A-18.**

##### 🔴 El desacuerdo: **el acceptance 3 de F-04 es insostenible y hay que reescribirlo**

Hoy dice: *«El enlace del aviso legal responde 200 (hoy, en la web del cliente, da 404: es el
test de regresión que previene el fallo real)»*. **Tres motivos por los que no se puede
destilar tal cual:**

1. **Se contradice con su propia entrega.** El troceado (§7) describe la entrega de F-04 como
   *«el pie con los huecos de los enlaces legales (**aún sin destino**)»* y, dos líneas
   después, exige que **el destino responda 200** **[V: `00-fase0-informe.md:673, 683-684`]**.
   Las dos cosas a la vez son imposibles.
2. **«Responde 200» es NECESARIO PERO NO SUFICIENTE, y hay prueba viva.**
   `/es/confidentiality_ws` del cliente **responde 200 y es jurídicamente nulo**: su art. 2
   dice que el responsable es *«la persona a cargo del sitio web»* — sin nombre, sin razón
   social, sin NIF, sin domicilio **[V]**. **Un escenario que solo compruebe `status == 200`
   bendeciría una página legalmente vacía.** F-04 cambiaría un 404 por un **200 hueco** y el
   test lo daría por bueno. Eso no es prevenir el fallo del cliente: es **reproducirlo un
   escalón más arriba**.
3. **F-04 no puede prometer un aviso legal conforme, y prometerlo sería mentir.** Faltan razón
   social y un NIF válido, y **eso está verificado** (D-6, B-1/B-2). *Ver abajo el `vatID`.*

**Reparto honesto propuesto** (es **A-17**, la cierra el humano/lead):

| Quién | Qué entrega |
| ----- | ----------- |
| **F-04** | La **puerta anti-404**: *ningún `href` interno del artefacto apunta a una ruta que no exista en `dist/`*. Se puede testear **HOY**, es **más fuerte** que «`/aviso-legal` responde 200» (cubre **todos** los enlaces, no uno), y **no promete** ningún aviso legal |
| **F-16** | Las rutas legales, **los enlaces del pie que apuntan a ellas**, y el contenido — con todos los campos como placeholder cubiertos por F-01 (`blocked`) |

Así, **el pie de F-04 no emite enlaces legales todavía**. Suena incómodo y es lo correcto: la
web **no se puede publicar** (D-6), y un pie que enlaza a la nada es **literalmente el bug del
cliente**. Cuando F-16 se desbloquee, los enlaces aparecen **con destino real**, y la puerta de
F-04 hace **estructuralmente imposible** que aparezcan sin él.
*Alternativa descartada:* que F-04 emita los enlaces y F-16 cree las rutas → deja la puerta de
F-04 en **rojo** hasta F-16, rompiendo «una feature a la vez».
*Alternativa descartada:* que F-04 cree las páginas legales **con todo placeholder** (F-01 ya
rompería el build de producción) → es coherente, pero **invade F-16** literalmente.

**Consecuencia:** el **acceptance 4** («*El enlace legal del pie es permanente: aparece en
todas las páginas*») **también decae para F-04** y se muda a F-16 — además de estar mal
fundado (ver «Los tres ejes»: *«en todas las páginas» no está en la LSSI*).

##### 🚨 El `vatID`: lo que apareció, y la prohibición que hay que escribir

La verificación encontró un dato que **nadie había visto**, escondido en el JSON-LD de la home
del cliente (no se renderiza como texto visible; por eso las búsquedas anteriores lo
perdieron): `"vatID": "10656940"` **[V]**.

**No desbloquea nada, porque no es un identificador válido** (contrastado contra boe.es):

- **Persona jurídica** — Orden EHA/451/2008 art. 2: el NIF *«estará compuesto por nueve
  caracteres»*. `10656940` son **8**, todos dígitos → **no es CIF** **[V]**.
- **Persona física** — RD 1065/2007 art. 19.1: el NIF es el número del DNI *«seguido del
  correspondiente código o carácter de verificación, constituido por una letra mayúscula»*.
  No la lleva → **NIF incompleto** **[V]**.
- **8 dígitos es exactamente un número de DNI sin su letra** → es verosímil que sea **el DNI
  del titular truncado**, es decir, **dato personal de una persona física** **[I sobre [V]]**.

→ **B-1/B-2 siguen bloqueadas.** Pero el contrato **deja de decir** que «no existe ningún
identificador en fuente pública»: **existe, y es inválido.**

> **PROHIBICIÓN EXPRESA, y es urgente escribirla.** **La letra del DNI es DETERMINISTA**
> (módulo 23 sobre una tabla). Cualquier agente de este pipeline —**incluido el lead, incluido
> quien escriba esto**— puede calcularla en un segundo y «arreglar» el dato publicando
> `10656940<letra>`. **ESO SERÍA INVENTAR UN NIF.** Derivar el carácter de verificación **no
> acredita** que el número pertenezca al titular, ni que el titular sea persona física, ni que
> ese sea su NIF a efectos del art. 10.1 LSSI; y **publicaría un dato personal**. El agente
> que lo encontró lo dejó escrito: *«YO NO HE CALCULADO LA LETRA Y EL CONTRATO DEBE
> PROHIBIRLO EXPLÍCITAMENTE.»* Queda prohibido **completar, corregir, inferir o derivar** el
> NIF/CIF. Un identificador que no cumple el formato legal **se RECHAZA y bloquea la
> publicación**; no se repara.

**Corolario limpio para el JSON-LD de F-04:** schema.org tiene propiedades para esto y las
**dejamos vacías a propósito** — **`legalName` NO se emite** (razón social desconocida) y
**`vatID` NO se emite** (no hay ninguno válido). Se emite `name: "Nails Lash Studio"`, que es
el **nombre comercial** **[V]**, no la razón social.

#### Los tres ejes — la regla que más cara ha salido, en una tabla

**Nunca se mezclan: letra de la norma ≠ técnica suficiente ≠ criterio de proyecto. Y
schema.org ≠ Google.** Cinco de las nueve afirmaciones que sostenían F-04 eran **decisiones
correctas con el porqué falso**. La decisión sobrevive; **la justificación se reescribe**.

| Lo que F-04 hace | **Letra de la norma [V]** | **Técnica suficiente** (no es requisito) | **Criterio de proyecto** (nuestro, legítimo, testeable) |
| ---------------- | ------------------------- | --------------------------------------- | ------------------------------------------------------ |
| `<html lang="es">` | **SC 3.1.1 (A)**: el idioma debe ser **determinable por código**. **No dice «lang»** | **H57** (`lang` en `<html>`) satisface el SC en HTML | Que un `lang` **incorrecto** falle es **[I]**, no frase citable |
| **Un solo `<h1>`** | **`SC 1.3.1` NO lo exige.** *Ninguna frase sobre el número de h1 existe en toda la norma* **[V: fetch de la página completa]** | `H101`, `ARIA11`, `ARIA20` son **técnicas suficientes en OR** | ✅ **Criterio de proyecto.** Buena regla, se testea igual. **Lo prohibido es la atribución normativa** |
| **Landmarks `main`/`nav`/`footer`** | **`SC 1.3.1` NO los exige** **[V]** | `ARIA11` | ✅ **Criterio de proyecto** |
| **`section aria-labelledby`** | **Esto SÍ es 1.3.1**: una relación que el diseño comunica **visualmente** debe existir **en el código** → título de sección = *heading real* + `aria-labelledby`, **no un `div` con `font-size`** | — | — |
| **Composición del `<title>`** | **`SC 2.4.2` (A)**: el listón es *«describe topic or purpose»*. **CERO requisito de unicidad** **[V]** | — | ✅ **Criterio de PROYECTO/SEO.** Legítimo, **nunca WCAG** (A-22) |
| **`:focus-visible` global** | **`SC 2.4.7` (AA)**: foco **visible**. **CERO requisito de contraste o grosor** **[V]** | `G165` (foco por defecto) y `C45` (`:focus-visible`) son **ambas suficientes** | El 3:1 / 2px es **`SC 2.4.13`, y es AAA**. → **PROHIBIDO atribuir cualquier umbral a 2.4.7.** *Es la trampa gemela del 1.4.11 de F-03* |
| **Enlace legal en el pie** | **LSSI art. 10.1**: acceso *«**permanente, fácil, directa y gratuita**»* **[V: los cuatro adverbios son literales]** | — | **«aparece en todas las páginas» NO ESTÁ EN LA LEY** (ver abajo) |

##### El eje que se confundía: **«permanente» es TEMPORAL, no espacial**

**Escaneo léxico del estatuto entero** (395.867 caracteres): `"pie de página"` = **0** ·
`"todas las páginas"` = **0** · `"cada página"` = **0** **[V]**. El dato que lo cierra:
*«página de inicio»* **sí** aparece 4 veces (art. 39.3.a) → **el legislador TIENE vocabulario
para localizar algo en una página concreta y eligió no usarlo en el art. 10** **[I sobre [V]]**.
**Contraindicio directo:** el art. 10.2 resuelve el cumplimiento con *«su página **o** sitio de
Internet»* — **contempla que la obligación se satisfaga en UNA página** **[V]**.

> *Permanente* = disponible siempre **en el tiempo**. *En todas las páginas* = presente en todo
> el **espacio** del sitio. **Son ejes distintos.** Un test que solo verifique «el enlace está
> en el pie de las N páginas» da **VERDE mientras se incumple de verdad** (destino 404, gateado
> tras login, caducado) y **ROJO en un caso lícito** (art. 10.2). **Es exactamente el 404 del
> cliente: el enlace está en el pie, y el destino no existe.**

→ **Redacción honesta, que es la que salva al contrato de mentir:** «LSSI art. 10.1 exige
acceso **permanente, fácil, directo y gratuito** **[V]**. **Decisión del proyecto**: enlace en
el pie de todas las páginas **como medio de cumplimiento** — el art. 10.2 admite «página o
sitio», luego el pie global es **SUFICIENTE, no NECESARIO**.» Y el eje **permanente** se
asevera contra **el destino**, no contra la presencia del enlace: es la puerta anti-404 de
F-04.

**Dos avisos más sobre la LSSI, para F-16 y F-09:**

- **Falta el art. 10.1.f) — precios.** Es un estudio de uñas/pestañas: **si la web muestra
  tarifas, f) se activa** y obliga a indicar si el precio incluye impuestos. Con a), es el
  único párrafo del 10.1 que puede escalar a **GRAVE** **[V]**. Riesgo real, **no cubierto por
  F-04**: es de **F-09** (que ya lo lleva) y **F-16**.
- **Toda cita de la LSSI debe declarar VERSIÓN.** El art. 10 tiene **4 versiones** y el art. 38
  **10** (última 23-01-2025) **[V]**. Una cita sin versión es incomprobable. **Este contrato
  cita el art. 10.1 SIN versión declarada [NV] → verificar en `act.php`, sin pinear fecha, y
  NUNCA ordenando los bloques de la API del BOE por `fecha_vigencia`** (los ordena por
  **publicación**: es la trampa que documenta §9.4 de la verificación).
- **La calificación sancionadora NO es plana.** Ni «grave» ni «leve»: depende de
  *«significativo»* (art. 38.3.b), **concepto indeterminado** **[V]**. El contrato refleja el
  condicional o se calla.

##### schema.org ≠ Google — **y `name` era el hueco más caro**

La jerarquía real, **literal de schema.org**, con herencia **múltiple** **[V]**:

```
Thing > Organization > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
Thing > Place        > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
```

El padre **directo** es `HealthAndBeautyBusiness`; `LocalBusiness` es **ancestro**. Decir
«BeautySalon, subtipo de LocalBusiness» es cierto **transitivamente** y falso como jerarquía —
y **borra el mecanismo que justifica el contrato**: es la **ruta dual** lo que hace válidas a
la vez `address` (vía `Organization`) y `geo` (vía `Place`).

| | **schema.org** (validez de vocabulario) | **Google** (elegibilidad de *rich result*) |
| - | --------------------------------------- | ------------------------------------------ |
| **Obligatorio** | **NADA. Cero propiedades.** Un JSON-LD con solo `@type` es **válido** **[V: verificado por ausencia citable — en `schema.org/BeautySalon` y `/LocalBusiness` no existe ninguna frase que marque propiedad alguna como *required*]** | **`name`** (Text) y **`address`** (PostalAddress) **[V]** |
| **Recomendado** | — | `geo`, `openingHoursSpecification`, `telephone`, `priceRange`… **[V]** |

→ **PROHIBIDA en este contrato la palabra «obligatorio» sin sujeto explícito.** Todo
«obligatorio» se lee «obligatorio **para** \<schema.org|Google\>». **Ningún escenario puede
afirmar «falla porque schema.org obliga a X»: sería falso.**
→ **Se FIJA `name`.** El acceptance 2 actual **no lo menciona** y es requisito de Google:
**es el hueco más caro de la redacción de hoy.**
→ Exigir **`PostalAddress`** (y no `Text`) en `address` es **decisión de proyecto más estricta
que el vocabulario** — se declara, o el siguiente lector creerá que lo impone schema.org.
→ Google **respalda el subtipo**: *«Use the most specific LocalBusiness sub-type possible»*
**[V]**. Y **no garantiza nada**: *«Google does not guarantee that features that consume
structured data will show up in search results»* **[V]**.

##### `aggregateRating`: la decisión se queda, **el porqué era falso**

**❌ Google NO lo prohíbe por *self-serving*.** Es **INELEGIBILIDAD**, no prohibición. FAQ
oficial, literal: *«Do I need to remove self-serving reviews…? **No, you don't need to remove
them.** Google Search just won't display review snippets…»* y *«Will I get a manual action…?
**You won't get a manual action just for this.**»* **[V]**.
→ **PROHIBIDA** en el Gherkin y en el código la redacción «Google prohíbe `aggregateRating`
self-serving». **Es refutable con la FAQ oficial y hunde la credibilidad del contrato entero.**
*(Nota tranquilizadora: **T-6 ya cita la regla correcta** —«Don't aggregate reviews or ratings
from other websites»— **[V]**. No hay que corregir T-6; hay que **no degradarlo** al
destilarlo.)*

**El motivo se escribe en TRES capas, porque son tres hechos distintos:**

| | Fundamento | Fuerza |
| - | ---------- | ------ |
| **(a)** | Google, *Technical guidelines*: *«**Don't aggregate reviews or ratings from other websites**»*, bajo *«Warning: … Google may take **manual action** against it»* **[V]** | **Prohibición** |
| **(b)** | Google: una página con `LocalBusiness`/subtipo que puntúa sobre sí misma es *«ineligible for star review feature»* **[V]** | **Inutilidad** (cero *upside* en SERP) |
| **(c)** | Treatwell cl. 4.2.2: el salón **no tiene derecho** sobre las reseñas **[V]** | **Falta de título** — *no* es «prohibido republicar»: es que **no hay licencia**. Escribirlo como prohibición expresa **sería inventar** |

**(a) y (c) sostienen la decisión POR SEPARADO.** Si mañana Google derogase la regla
*self-serving*, **(a) y (c) siguen vivos**. Eso hace la decisión **robusta**, y hay que
escribirlo así. El 4,9 · 1.231 vive en **Treatwell — otro sitio**: **(a) es la cita que
aplica.**

**Aplicabilidad, sin escapatoria:** *«If the entity that's being reviewed controls the reviews
about itself, their pages that use **LocalBusiness or any other type of Organization**
structured data are ineligible…»* **[V]**. `BeautySalon` cae **por las dos ramas**. El contrato
dice **«LocalBusiness y cualquier subtipo, incluido BeautySalon»** — cerrando el *«es que yo
uso BeautySalon»*.

#### Comportamiento esperado

1. Toda la metadata del `<head>` se emite **exclusivamente** con **`<Head>` de
   `vite-react-ssg`**. **La metadata nativa de React 19 está PROHIBIDA** (ver «la bomba»).
2. `index.html` contiene el literal **exacto** `<head>`, en **minúsculas y sin atributos**
   (hoy lo cumple **[V: fichero real del repo]**), y **no** contiene `<title>` estático (hoy
   tampoco **[V]**).
3. **`src/lib/seo.ts`** — funciones **puras** que **componen**: el `title`, la **canónica** y
   el **objeto JSON-LD**. No leen ficheros, ni el reloj, ni `process.env`.
4. **El JSON-LD se escribe de cero** (T-6) y **por cada ruta prerenderizada** se emite dentro
   de `<Head>` como `<script type="application/ld+json">`. Contenido acordado:
   - `@type: "BeautySalon"` — el subtipo **más específico** que Google respalda **[V]**.
   - **`name: "Nails Lash Studio"`** — **requisito de Google**, nombre **comercial** **[V]**.
   - `address` como **`PostalAddress`** (decisión de proyecto **más estricta** que schema.org,
     que admite `Text`), con **`addressLocality: "Las Rozas de Madrid"`** — **nunca «Las
     Ceudas»**, que es el bug **confirmado** del cliente **[V]** — y `postalCode: "28232"`.
   - `geo` con **exactamente** `40.5179875, -3.9226688`.
   - `telephone` derivado de **F-02** (fuente única, I-7).
   - **SIN `aggregateRating`. SIN `Review`. SIN `legalName`. SIN `vatID`. SIN `email`**
     (A-11). `openingHoursSpecification` → **A-19**. `priceRange` → **A-20**.
5. **La canónica es POR PÁGINA.** El fallo típico es que **todas hereden la misma** (la de la
   home): la puerta lo asevera **entre páginas**, no dentro de una.
6. Existe **la puerta del cascarón**: recorre **`dist/**/*.html`**, **por CADA ruta
   prerenderizada** (no solo la home), sobre el **HTML crudo**, y **rompe el build de
   producción** si hay violaciones. Se engancha a `pnpm build` **después** de
   `vite-react-ssg build`, como F-01 y F-03 **[V: `package.json`]**.
7. `dev` **no** la invoca. Como en F-01 y F-03: **la función es pura; el `exit ≠ 0` vive en la
   puerta.**

#### Contrato

**`src/lib/seo.ts` — composición pura (mutable):**

| Función | Contrato |
| ------- | -------- |
| `componerTitulo(pagina): string` | **Pura.** La composición exacta es **criterio de proyecto/SEO, NUNCA `SC 2.4.2`** → **A-22**. Lo que sí fija ya el contrato: **no vacío**, y **distinto por página** (regla de proyecto) |
| `canonicaDe(ruta, origen): string` | **Pura.** **Una por página.** ⚠️ Necesita un **origen absoluto**, y el dominio final es **[NV]** (migración: la decide el cliente) → **A-21** |
| `construirJsonLd(datos): object` | **Pura.** Recibe el NAP de F-02 y devuelve el objeto. **No** serializa, **no** lee nada. `geo` **se copia de la constante**: jamás se recalcula |

**`src/lib/puerta-cascaron.ts` — el decisor puro (mutable):**

| | |
| - | - |
| **Entrada** | `inspeccionarSitio(paginas: readonly {ruta, html: string}[], rutasEsperadas)`. **`html` son los BYTES de `dist/`**, nunca un render del árbol de componentes. **No lee ficheros, ni el reloj, ni el entorno** |
| **Salida** | `violaciones[]`. Vacío = pasa. Cada violación identifica **qué** falta, **en qué ruta** y **con qué valor**. La puerta **acusa**, no gruñe (precedente F-01/F-03) |
| **Determinismo** | Misma entrada → misma salida, **mismo orden**. Informe diffable |
| **Quién decide el exit code** | **No la función.** `tools/puerta-cascaron.ts` es el **humilde**: cablea `node:fs` (recorre `dist/`), `node:process` y el `exit`. **Sin lógica, sin tests propios, fuera de `mutate`** — el contrato exacto de `tools/puerta-contraste.ts` **[V: código]** |

**Violaciones que emite** (una por ruta y por regla):

1. **`<title>` ausente o vacío** · 2. **`<meta name="description">` ausente o vacía** ·
3. **canónica ausente**, o **repetida entre rutas distintas** · 4. **`lang` ausente, duplicado
o distinto de `es`** · 5. **`<h1>` ausente o más de uno** · 6. **`main`/`nav`/`footer`
ausente** · 7. **JSON-LD ausente, no parseable, `@type` efectivo ≠ `BeautySalon`, sin `name`,
sin `address`, `geo` ≠ la constante** · 8. **`aggregateRating`/`Review`/`ratingValue`/
`reviewCount` presentes a CUALQUIER profundidad** · 9. **`href` interno sin fichero
correspondiente en `dist/`** (la puerta anti-404, A-17) · 10. **`section` con título visible
sin `aria-labelledby` apuntando a su heading real**.

> **La regla 10 se añadió el 2026-07-16 con aprobación humana**, y la enumeración tenía **nueve**
> por descuido de esta sección: la línea de «Los tres ejes» ya declaraba `section
> aria-labelledby` como **«esto SÍ es 1.3.1»**, y el `acceptance` 1 reescrito la nombra, pero no
> estaba en la lista. **Lo detectó el `gherkin_author` al destilar** (`@s18`) y **avisó en vez de
> colarla** — que es lo que hay que hacer.
>
> **Por qué importa**: es **la única de las diez que mide `SC 1.3.1` de verdad**: una relación que
> el diseño comunica **visualmente** (el título de una sección) tiene que existir **en el código**
> (heading real + `aria-labelledby`), no ser un `div` con `font-size`.
> Las otras nueve son **criterio de proyecto** o requisito de **Google** — legítimas,
> pero ninguna es letra de WCAG. **Sin la regla 10, el `acceptance` 1 no tiene escenario
> normativo detrás** y F-04 no mediría 1.3.1 en absoluto: solo «un h1 + landmarks», que **[V] la
> norma NO exige** (son técnicas suficientes ARIA11/H101/ARIA20, en OR).

**Guarda anti-«verde por vacuidad»** (A-8 en F-01, @s14 en F-03; **aquí es obligatoria**): la
puerta recibe **`RUTAS_ESPERADAS` declarada** y exige que `dist/` contenga **una HTML por cada
ruta esperada**, con `RUTAS_ESPERADAS` **no vacía**. Es **mejor que un mínimo mágico**: crece
con las rutas y no hay que acordarse de subir un número. *Sin esto, `dist/` vacío → 0
violaciones → build verde → «protegidos».*

#### Casos límite debatidos

1. **🔴 La trampa de React 19 — verde en `dev`, verde en jsdom, `<head>` VACÍO en producción.**
   Ya razonada arriba. **Escenario obligatorio:** la aserción se hace sobre los bytes de
   `dist/`, y **debe existir un escenario que demuestre que jsdom NO lo caza** — o el próximo
   agente «simplificará» la puerta a un test de Testing Library y **la desactivará sin
   enterarse**. *Esta es la clase de bug que ya ha matado 3 veces al stack base.*
2. **🔴 La trampa del `replace()` literal — falla EN SILENCIO.**
   `indexHTML.replace('<head>', …)` es **match de string exacto**, y `String.replace` con
   string **no lanza si no encuentra**: **devuelve el HTML intacto** **[V]**. Si alguien
   escribe `<head >`, `<HEAD>` o `<head lang="es">` en `index.html`, **la inyección no ocurre y
   el build sigue VERDE con el `<head>` vacío**. Verde por vacuidad, **un nivel más abajo**.
   → **Escenario obligatorio: pinchar el literal `<head>` de `index.html` y exigir ROJO.**
   → **Buena noticia de diseño:** la puerta ya lo caza **por construcción** — sin `<head>`
   inyectado, faltan a la vez `title`, `description`, canónica y JSON-LD. El escenario existe
   para **anclar el porqué**, igual que `@s18` ancla el 88 % en F-03.
3. **🔴 El `title` vacío DESAPARECE, no sale vacío.** *(Hallazgo propio del lead.)*
   `extractHelmet` hace `if (titleString.split(">")[1] === "</title") titleString = ""`
   **[V: `:434-436`]** → un `<Head><title>{''}</title>` **no produce un `<title>` vacío:
   produce NINGÚN `<title>`**. → La violación se formula **«`<title>` ausente o vacío»**, no
   «vacío»: si solo se buscara el vacío, **este caso se escaparía**.
4. **🔴 El `200` hueco.** `/es/confidentiality_ws` **responde 200 y es jurídicamente nulo**
   **[V]**. **Un escenario `status == 200` bendice una página legalmente vacía.** Por eso el
   acceptance 3 se reescribe (A-17) como **integridad referencial** en F-04 + **aserción de
   contenido del art. 10.1** en **F-16**. **Ningún escenario de este proyecto puede volver a
   tratar un `200` como prueba de conformidad legal.**
5. **🔴 El `@graph` anidado.** `aggregateRating` puede **reaparecer dentro de un
   `Service`/`Offer`** del `@graph`. → **Recorrido RECURSIVO**, nunca comprobación de primer
   nivel. Y la prohibición cubre **`Review` Y `AggregateRating`** (*«It applies to Review and
   AggregateRating»* **[V]**) **y la propiedad suelta** (`ratingValue`/`reviewCount` **sin** su
   envoltorio).
6. **🔴 El alias de tipo.** La aserción es sobre el **tipo EFECTIVO**, no sobre el string
   `"LocalBusiness"`. `@type` puede ser un **array**, o venir por `@context`/alias. **Un test
   que haga `json['@type'] === 'BeautySalon'` cierra los ojos ante media docena de formas
   válidas** y deja abierta la escapatoria *«es que yo uso otro tipo»*.
7. **La canónica heredada.** Todas las páginas con la canónica de la home es **el fallo típico**
   y **pasa cualquier test que mire una sola página**. → La puerta asevera **unicidad entre
   rutas**. *Hoy solo hay una ruta (`/` **[V: `App.tsx`]**), así que el escenario nace
   **inerte**: hay que escribirlo con un **fixture de dos rutas**, o es teatro.* Precedente
   directo: `@s14` de F-03 nació inerte y **lo cazó el judge**.
8. **El `lang` tiene DOS fuentes posibles.** Hoy sale de `index.html` (`<html lang="es">`
   **[V]**); `<Head>` **también** puede inyectarlo (`indexHTML.replace('<html', '<html ' +
   htmlAttributes)` **[V: `:127-128`]**). Si ambos existen → **`<html lang="xx" lang="es">`**,
   atributo **duplicado**. Cuál gana es **[NV]** y **no hace falta averiguarlo**: la decisión
   es **una sola fuente** (`index.html`) y **la puerta asevera exactamente un `lang`, con valor
   `es`**. *Resolver una ambigüedad prohibiéndola es más barato que verificarla.*
9. **`geo`: verificado a nivel de EDIFICIO, jamás de Local 41.** La constante **se queda**:
   `40.5179875, -3.9226688`. Prueba **[V]**: *point-in-polygon* (ray casting) contra Overpass +
   `api.openstreetmap.org` → el punto cae **geométricamente DENTRO** de `way/34502818`
   `{building=yes, shop=mall, name="Centro comercial Zoco Rozas"}`; los otros 4 edificios del
   radio de 80 m dan **fuera**. Reverse de Nominatim del punto exacto: *«Bar Cañas, 75, Avenida
   de Atenas, Las Rozas de Madrid…»*, a **10,8 m** (haversines recalculadas de forma
   independiente, R = 6371008.8). **Límite honesto declarado:** Nominatim devuelve `[]` para
   «Nails Lash Studio Las Rozas» → **un escenario que afirme «geo == Local 41» afirma más de lo
   que ninguna fuente sostiene**. → **El escenario correcto:** el JSON-LD emite **exactamente
   la constante acordada**, y **muta si alguien la toca**. **JAMÁS la recalcula ni la "corrige"
   desde OSM.**
10. **El CP no se verifica contra OSM.** Se fija a **28232** (dato del cliente). **OSM se
    contradice a sí mismo** (nodo del mall 28242 vs nodos del nº 75 en 28232) y `way/34502818`
    **no lleva `addr:postcode`** **[V]**. → *Verificar el CP contra OSM introduciría un bug.*
11. **`priceRange` es Text, no número.** Literal: *«for example $$$»* **[V]**. Un
    `"priceRange": 25` es **sintácticamente válido y basura semántica**: **nadie lo rechaza,
    degrada en silencio**. → **A-20**.
12. **`address` admite `Text`.** Un string **pasa** la validación de schema.org **[V]**. Exigir
    `PostalAddress` es **nuestro**, no del vocabulario: se declara como tal.

#### Modos de error

- **Violación encontrada** → **exit ≠ 0** + informe legible: **una línea por violación**, con
  ruta, regla y valor.
- **`dist/` inexistente, vacío, o sin una HTML por cada `RUTAS_ESPERADAS`** → **falla
  cerrada**. Es **el modo de fallo más probable de esta puerta**: se ejecuta **después** del
  build, y un build que no generó nada la dejaría escaneando el vacío.
- **JSON-LD no parseable** → **violación**, nunca excepción tragada. Una puerta que se traga su
  excepción y devuelve `[]` es **peor que ninguna**: es literalmente cómo se evaporaron los 3
  bloqueantes AA del stack base **[V]**.
- **Error de la propia puerta** → **build roto, nunca build verde** (derivación de D-9/I-8,
  **[I]**, igual que F-01 y F-03).

#### Mutantes que deben morir (I-6, umbral 1.0)

- **Negar cualquier predicado de presencia** (`title`, `description`, canónica, `h1`,
  landmarks, `name`, `address`) → rompe.
- **`&&` → `||`** en la conjunción de reglas y **`===` → `!==`** en la comparación de `@type`
  → rompe.
- **`> 1` → `>= 1`** en la cuenta de `h1` (la frontera exacta entre «uno» y «ninguno/varios»).
- **Cortar la RECURSIÓN** del buscador de `aggregateRating` (quedarse en el primer nivel) →
  **debe romper** → exige un **fixture de `@graph` con `aggregateRating` anidado** dentro de un
  `Service`. *Sin fixture negativo, este mutante sobrevive* (lección de F-03).
- **Tocar un dígito de `geo`** → rompe (el escenario 9).
- **Vaciar `RUTAS_ESPERADAS`** → **debe romper** (guarda de vacuidad).
- **Anti-tautología (regla dura del arnés):** el esperado se escribe **a mano** en el escenario
  (`'40.5179875'`, `'Las Rozas de Madrid'`, `'BeautySalon'`), **nunca** se importa de
  `site.ts`/`seo.ts` ni se recomputa con la función vigilada. Si el test importa la constante
  que debería vigilar, **no vigila nada** — es el primer mutante superviviente de WebEmpresa.

#### Preguntas abiertas de esta feature

- **A-17** — 🔴 **la que bloquea el Gherkin**: reparto F-04/F-16 de las páginas legales y
  reescritura de los **acceptance 3 y 4**. **NO destilar el acceptance 3 tal cual.**
- **A-18** — ¿`SC 2.4.11` es de F-04 o de F-06?
- **A-19** — `openingHoursSpecification` vs `openingHours`, y **¿F-04 o F-10?**
- **A-20** — `priceRange`: ¿entra ya, espera a F-09, o no entra?
- **A-21** — el **origen absoluto** de la canónica (dominio **[NV]**, migración).
- **A-22** — la **composición literal** del `<title>` (criterio de proyecto, **no** WCAG).
- **A-11** (ya abierta) — si el **email** entra como registro placeholder, **no** se emite en el
  JSON-LD hasta que el cliente lo confirme.

---

### Feature 5: `cero_terceros` — la petición que nunca sale, y la puerta que lo demuestra

> Feature `#5` de `feature_list.json`. `depends_on: []` **[V]** — no depende de nada y nada la
> bloquea. Entrega un **invariante** que **F-11** (mapa), **F-12** (contacto) y **F-14**
> (reseñas) **heredan** pero **cierran en su propia feature** (ver «Alcance»).
>
> **Toda esta sección es coherente con `progress/f05_verificacion_previa.md`** (16 subagentes,
> 8 afirmaciones × verificar + refutar: **0 refutadas de raíz, 8 de 8 con algo tumbado**).
> Donde `feature_list.json` §5, el troceado de `docs/research/00-fase0-informe.md` o esta
> sección contradigan a esa verificación, **manda la verificación**. Se contradicen en **tres
> puntos graves**: el **acceptance 2**, la **`puerta_legal`** y la **descripción** → **A-23** y
> **A-24**.
>
> Es el patrón de F-04, otra vez y más fuerte: **la decisión es correcta; el porqué escrito es
> falso.** Ninguna decisión de F-05 cae. Lo que cae son los porqués.

#### Cómo se acordó esta sección — **declarado por escrito, sin fingir nada**

**No hubo conversación de spec con el humano para F-05, y esta sección no la simula.** El humano
**delegó** esta fase en el `craftsman_lead` **hasta la puerta de aprobación del `.feature`**, que
sigue **en pie** y es donde entran las cuatro preguntas abiertas. La contraparte humana la
sostienen **decisiones ya registradas** —`progress/current.md` §«Decisiones tomadas con el
humano» (**6**: solo fuentes públicas; **9**: el build de producción falla si queda contenido no
verificado) y `docs/research/00-fase0-informe.md`— **más la verificación previa**, que es quien
ha hecho de adversario en lugar del humano: tumbó algo en las ocho afirmaciones.

**Lo que esta sección NO puede cerrar** —y no cierra— es lo que cambia los criterios de
aceptación o `feature_list.json`. Eso es la puerta.

#### Propósito

Que **el artefacto de producción no contenga ninguna construcción que provoque, sin acción del
usuario, una petición a un origen que no sea el propio sitio**; y que una **puerta mecánica** lo
demuestre en cada build sobre el **HTML y el CSS crudos de `dist/`**, con **allowlist vacía**.

#### Por qué existe — y **por qué la justificación heredada es una atribución normativa falsa**

`feature_list.json` §5 dice hoy `"puerta_legal": "RGPD (evita el análisis de corresponsabilidad
de Fashion ID) + art. 22.2 LSSI (sin cookies → sin banner)"`, y su descripción promete que
sostener el invariante «**elimina banner, CMP y política de cookies de un plumazo**». **Este
contrato no hereda ninguna de las dos frases.**

- **El art. 22.2 LSSI no dice «cookies»** **[V]**. Regula «**dispositivos de almacenamiento y
  recuperación** de datos en equipos terminales», y está redactado como **permiso condicionado**,
  no como prohibición.
- **«Google Fonts no almacena nada en el equipo» es FALSO como hecho** **[V, medido
  2026-07-17]**: ni `fonts.googleapis.com` ni `fonts.gstatic.com` devuelven `Set-Cookie` —
  **pero** el `.woff2` devuelve `Cache-Control: public, max-age=31536000`. **La caché es
  almacenamiento.**
- **Si ese cacheo activa el 22.2 es [NV], y en los DOS sentidos** (las dos ramas están **[V]**):
  a favor, CEPD *Directrices 2/2023* v2.0 párr. 50 («does constitute storage, at the very least
  through the caching mechanism») — dicho de *tracking pixels*, sobre el art. 5(3) ePD, cuya
  letra es **disyuntiva**; en contra, la transposición española y la **Guía de cookies de la
  AEPD (mayo 2024)** lo formulan en **conjuntivo y con finalidad** (§1 pág. 8: «…**para almacenar
  y recuperar datos** de un equipo terminal»), y **la caché de un `.woff2` almacena pero no
  recupera datos del terminal**. **No hay pronunciamiento de AEPD ni de CEPD sobre CDNs de
  fuentes** **[V]**.
- **Autoalojar ≠ cero almacenamiento.** El `.woff2` **propio también se cachea**. Lo que
  autoalojar da es **cero terceros**, que es otra cosa.
- Lo único que se sostiene sin inferencia: **el art. 22.2 no obliga a poner banner por cargar una
  fuente** — o porque no entra en su ámbito, o porque entraría en la excepción del párrafo 3.º.
  **En ninguna de las dos ramas justifica F-05.**

> **La justificación correcta de F-05 es un CRITERIO DE PROYECTO, no una norma:**
>
> **«Autoalojamos las fuentes para que el sitio no haga ninguna petición a dominios de terceros;
> así ningún tercero recibe la IP del visitante y no hace falta ningún análisis jurídico.»**
>
> Es **decisión del editor**, **es suficiente por sí sola**, y **no cuelga de ninguna cita**.

**Y por eso es «la decisión de mayor apalancamiento»** — pero no por lo que decía el troceado. No
deroga ninguna obligación (no puede). Lo que hace es **sustituir un análisis jurídico por un
hecho mecánico verificable en cada build**: un invariante que la puerta sostiene **no hay que
volver a discutirlo**, y **F-11, F-12 y F-14 lo heredan sin repetir el razonamiento**. El
apalancamiento es **de proceso**, no normativo.

**PROHIBIDO en este contrato, en el Gherkin y en el código** (§6 de la verificación): «art. 22.2
LSSI» como justificación · «sin cookies → sin banner» · «elimina banner, CMP y política de
cookies» · «lo exige la AEPD» · «Google Fonts no pone cookies → fuera del 22.2» · «autoalojar =
cero almacenamiento» · «Fashion ID obliga a autohospedar» · **«obligatorio» sin sujeto explícito**
(todo «obligatorio» se lee «obligatorio **para** \<quién\>»). *Es la misma regla que F-04 ya
tuvo que escribir para schema.org ≠ Google.*

##### Fashion ID: lo que sí se puede decir, y con qué marca

**[I] por analogía razonada — y NO se pudo re-verificar en fuente primaria el 2026-07-17.**
EUR-Lex devuelve **HTTP 202 / 2.035 B de challenge AWS-WAF** en las tres variantes,
`publications.europa.eu` da **404** sobre el `cellar:`, y curia sirve un shell SPA **[V: medido
hoy]**. *El repo ya lo tenía resuelto y marcado antes que nadie:* `docs/research/legal-rgpd.md:410-416`
dice literalmente que el salto **botón social → fuente tipográfica** es «**una analogía razonada,
no un pronunciamiento**… **Un tribunal podría distinguir ambos casos. [I]**», y `:575` lo tabula
como «discutible [I]». **Nadie puede ascender esa [I] a certeza.**

Cuando se pueda releer, el **ap. 85 afirma Y LUEGO limita**, y **quien lo cite debe reproducir
las dos frases**: «…**can be considered to be a controller** […] **That liability is, however,
limited to** the operation … in respect of which it **actually determines the purposes and
means**…». `jointly` (corresponsabilidad) aparece **solo en el ap. 84** **[V]**. Y
**`font`/`typeface` = 0 ocurrencias** en la sentencia (64.423 caracteres, EN y ES) **[V]** → **la
analogía es NUESTRA, no de la sentencia**.

→ Autohospedar es una **TÉCNICA SUFICIENTE** elegida por el proyecto, **nunca una obligación**.
→ **F-05 NO prohíbe ni condiciona el `<a href>` a Facebook de `site.ts:47`** invocando Fashion
ID: el predicado fáctico del ap. 27 es la transmisión **automática**, «regardless of whether or
not he or she … **has clicked**», y `hyperlink` = **0 ocurrencias** en la sentencia **[V]**.
→ No citar «art. 2(d) Directiva 95/46»: **derogada**; vigente **RGPD art. 26** **[V]**.

#### 🔴 La distinción técnica que ES la feature: **petición automática ≠ hiperenlace**

**Esta es la mitad de F-05, y el HTML Living Standard la nombra él mismo** (§4.6.1), clasificando
los `<link>` en **external resource link** frente a **hyperlink** **[V, literal]**:

> «These are links to resources that are to be used to augment the current document, generally
> automatically processed by the user agent. **All external resource links have a fetch and
> process the linked resource algorithm** which describes how the resource is obtained.»

> «These are links to other resources that are **generally exposed to the user** by the user
> agent **so that the user can cause the user agent to navigate** to those resources…»

**Sin esta distinción, F-05 es insatisfacible.** Medido sobre el `dist/` real de HEAD hay **diez
orígenes externos**, y **ni uno solo es una petición a un tercero** **[V, §0 de la
verificación]**: cuatro namespaces XML del bundle de React, dos URLs de mensajes de error de
React, `schema.org` del JSON-LD de **F-04** (feature **`done`**), `example.invalid` (la canónica,
TLD reservado RFC 2606, deliberado) y el `<a href>` a Facebook. **El acceptance 2 escrito como
«CUALQUIER origen externo» no se puede satisfacer jamás y rompería F-04** → **A-23**.

##### Qué DEBE detectarse (provoca una petición sin que el usuario haga nada)

| Construcción | Fundamento |
| --- | --- |
| `<link rel="stylesheet">`, **incluido `rel="alternate stylesheet"`** | §4.6.8.23: «stylesheet […] **creates an external resource link**» **[V]** |
| `<link rel="preload"/"modulepreload"/"prefetch"/"icon"/"manifest">` | *External resource links* **[V]** |
| `<script src>`, `<img src>`, `<img srcset>`, `<source src>`, `<source srcset>`, `<track src>`, `<iframe src>`, `<embed src>`, `<object data>`, `<use href>` | Subrecursos: se piden al procesar el documento **[V]** |
| `@import` y **cualquier `url()`** del CSS (incluido el `src` de `@font-face`) | El `url()` de `@font-face` es **letra normativa**: css-fonts-4 §4.8.1 **[V]** |
| `<link rel="preconnect">` y `<link rel="dns-prefetch">` | ⚠️ **CRITERIO DE PROYECTO, no letra** (ver abajo) |
| `url()` en reglas CSS **no aplicadas** (p. ej. `background-image`) | ⚠️ **CRITERIO DE PROYECTO, no letra** (ver abajo) |

##### Qué NO debe detectarse (y por qué marcarlo sería un **falso positivo sostenido por spec**)

| Construcción | Fundamento |
| --- | --- |
| `<a href="https://www.facebook.com/…">` | **NO pide nada antes del clic**: solo al *follow the hyperlink* — **acción del usuario** **[V]** |
| `<link rel="canonical">` | §4.6.8.4: «This keyword creates **a hyperlink**». Tabla normativa: `canonical — Effect on link: Hyperlink` **[V]** |
| `xmlns="http://www.w3.org/2000/svg"` | *Namespaces in XML* §3: «**It is not a goal that it be directly usable for retrieval** of a schema» **[V]** |
| `"https://schema.org"` en el JSON-LD de F-04 | HTML Standard: un `<script type="application/ld+json">` es «**a data block, which is not processed by the user agent**» **[V]**. **El navegador ni lo parsea** → no puede originar conexión alguna |
| `"https://react.dev/errors/"`, `"http://fb.me/…"` en un `.js` | Un **literal de cadena no es una construcción de fetch** **[V: `react.react-server.production.js:14` lo concatena en un mensaje de error]** |
| `<link rel="stylesheet" disabled>` | §4.6.8.23, *linked resource fetch setup steps*: «If el's disabled attribute is set, then **return false**» **[V]** |

> **Nota sobre `schema.org`:** quien **sí** puede dereferenciar el `@context` es un **procesador
> JSON-LD** (Googlebot, un validador, `jsonld.js`) — **nunca el navegador que renderiza**. La
> invariante complementaria **real** es prohibir cargar en cliente cualquier librería que ejecute
> el *Context Processing Algorithm*; **medido: este repo no carga ninguna** **[V]**. Y `schema.org`
> viaja en el bundle **por el grafo de imports** (`home.tsx:3` importa `construirJsonLd` con un
> import **estático** → Rollup inlinea `const Wi="https://schema.org"`), **no por la hidratación**
> **[V, medido]**.

##### 🔴 La regla del **conjunto tokenizado** de `rel` — el falso negativo que casi se cuela

Deducir «`rel="alternate"` es *Hyperlink*, luego no detectar» **de la fila-resumen de la tabla**
es **falso**, y habría dejado pasar **una petición real a un tercero**. La letra que la desarrolla
manda, §4.6.8.1 **[V, literal]**:

> «If the element is a link element and the rel attribute **also contains the keyword
> stylesheet** […] The alternate keyword **modifies the meaning of the stylesheet keyword** […]
> **The alternate keyword does not create a link of its own.**»

→ **`<link rel="alternate stylesheet" href="https://cdn.tercero.com/x.css">` SÍ SE PIDE.**

> **REGLA DURA de F-05:** la clasificación se hace sobre el **conjunto tokenizado** de `rel`
> (tokens separados por espacio, *ASCII case-insensitive*), **nunca sobre la cadena completa ni
> sobre un solo token**. **La tabla de §4.6.8 es un RESUMEN; cuando la sección del keyword
> desarrolla su significado, manda la sección.**

##### Los dos ejes que la spec NO decide → **criterio de proyecto, y se declara como tal**

1. **`preconnect` / `dns-prefetch` CUENTAN** como origen externo. Son *external resource links*
   pero **no descargan recurso**: abren TCP/TLS o resuelven DNS. **Ninguna spec decide el eje por
   nosotros; hay que elegir uno y no mezclarlos.** El eje de F-05 es **«contacto con un origen
   externo sin acción del usuario»** — porque **el tercero recibe la IP igual**, que es
   exactamente lo que esta feature previene. *Alternativa descartada:* el eje «petición HTTP de un
   recurso» → dejaría pasar un `preconnect` a un CDN, que entrega la IP sin descargar un byte.
2. **`url()` en reglas CSS no aplicadas SE MARCA.** **Solo `@font-face` tiene letra normativa**
   (css-fonts-4 §4.8.1: «user agents **must only download** those fonts that are referred to
   within the style rules **applicable** to a given page» **[V]**). Para `background-image`
   **ninguna spec dice CUÁNDO se pide** — css-values-4 §4.5.4 y css-images-4 §2.3 solo definen
   **CÓMO** **[V]**. Que Chrome no lo pida es **comportamiento observado, NO letra**. Y **un
   analizador estático no puede evaluar qué reglas aplican** → **criterio conservador**.
   *Alternativa descartada:* fiarse del comportamiento observado de un motor → convierte la puerta
   en rehén de una implementación no escrita.

##### `<base href>` es un **MODIFICADOR**, no un origen

`<base href="https://cdn.tercero.com/">` **no pide nada**, pero convierte `<img src="a.png">` en
una petición a un tercero **[V]**. → **Las URL se resuelven contra `base` ANTES de clasificarlas.**

#### Alcance — qué entra, qué NO entra, y **el hueco conocido**

**Entra en F-05:**

- Los **6 imports** de `@fontsource` autohospedados (abajo), y la **baja** de las dos
  dependencias muertas.
- **`src/lib/terceros.ts`** (detector puro) + **`src/lib/puerta-terceros.ts`** (decisor puro) +
  **`tools/puerta-terceros.ts`** (el humilde), encadenada en `pnpm build`.

**NO entra en F-05** (alcance mínimo; decisión del humano ya tomada: **una feature a la vez**):

| Feature | Qué hereda | Dónde cierra |
| --- | --- | --- |
| **F-11** `mapa_como_llegar` | «No hay iframe de Google Maps ni ninguna petición a un tercero» **[V: acceptance de F-11]** | **En F-11.** F-05 no crea el mapa ni lo prohíbe: cuando F-11 lo intente, **la puerta de F-05 ya estará ahí** y el `<iframe src>` externo romperá el build. *La descripción de F-11 arrastra la MISMA atribución falsa que A-24 («la decisión que por sí sola evita el banner de cookies»): al cerrar A-24 hay que corregirla también.* |
| **F-12** `contacto` | El `<a href>` a Facebook e Instagram | **En F-12.** F-05 **no los toca**: son **hiperenlaces**, no piden nada **[V]** |
| **F-14** `resenas_agregado_enlace` | El enlace a Treatwell, sin `aggregateRating` | **En F-14** |
| **F-06/F-07** | **Aplicar** las familias a los elementos | **En F-06/F-07.** F-05 **hornea los `@font-face`; no escribe ni un `font-family` de uso.** *Consecuencia declarada, no oculta:* mientras nada referencie una familia, **el navegador no descarga su woff2** (css-fonts-4 §4.8.1 **[V]**). **No afecta al invariante** —cero terceros se cumple igual— y la puerta sigue midiendo lo que debe: que los `@font-face` **horneados** no apuntan a ningún origen externo |

##### 🔴 El HUECO CONOCIDO — se declara, **no se cierra**

El acceptance dice **`(html|css)`**. Por tanto: **un `fetch('https://tercero…')` desde el JS del
bundle NO lo cazaría esta puerta.** **Hoy no existe ninguno** **[V, medido §0: las únicas URL de
los `.js` son literales de cadena de mensajes de error y namespaces XML]**. **Es deuda declarada,
no un problema resuelto.** *Alternativa descartada:* extender la puerta al JS de `dist/assets/` →
la verificación lo desaconseja expresamente (**«NO grepear `https?://` sobre `dist/assets/*.js`:
falsos positivos garantizados»** **[V]**), y distinguir un `fetch` real de un literal exige
analizar el AST de un bundle minificado. **Eso es otra feature, con sus escenarios.**

##### 🔴 La deuda de binarios es de **F-01**, no de F-05 → **A-27**

**F-05 es la primera feature que mete binarios en `dist/`.** Medido, sin suponer nada:

- **NO rompe** la puerta del cascarón (`tools/puerta-cascaron.ts:23` filtra `ES_HTML = /\.html$/i`,
  y su comentario **ya cita el riesgo `.woff2` por su nombre** **[V]**) ni la de contraste (solo
  lee `_tokens.scss`).
- **SÍ activa el camino de la deuda en `tools/puerta-placeholders.ts`**, que lista **todos** los
  ficheros **sin filtro de extensión** y hace `readFileSync(ruta, 'utf8')` **[V]**. Leyendo los
  108 `.woff`/`.woff2` reales de `@fontsource` con utf8: **no lanza**, **554.818 U+FFFD**,
  **0 violaciones HOY**, pero **50.100 secuencias candidatas** al regex del teléfono en ese ruido
  binario **[V]**. Comprobado además **end-to-end** inyectando un `.woff2` real en `dist/assets/`:
  **las tres puertas pasan, exit 0** **[V]**.

> **El falso positivo es POTENCIAL, no determinista, y no se ha observado un fallo real.** Pero
> «0 violaciones» **no significa que el hueco esté cerrado**: los ficheros que entran en `dist/`
> tras el pipeline de Vite **no son byte a byte** los de `node_modules`.
>
> 🔴 **F-05 NO TOCA `tools/puerta-placeholders.ts`.** La deuda es **de F-01**, y
> `progress/current.md:477-478` ya declara que cerrarla **exige un escenario nuevo en
> `features/puerta_placeholders.feature`** — feature **`done`**. Hacerlo dentro de F-05 sin ese
> escenario sería **producción sin test rojo: violación de la Ley 1**. → **A-27**.

**Lo que F-05 sí hace:** **su propio humilde filtra por extensión** (`/\.(html|css)$/i`), como
`ES_HTML` en `tools/puerta-cascaron.ts:23`. **Leer binarios sería un falso positivo esperando a
ocurrir**, y eso es justo lo que valida el alcance `(html|css)` del acceptance.

#### Las fuentes — **el diseño NO usa las del base**

**Medido sobre el prototipo (`Opcion-1-Rosa.dc.html`), no heredado** **[V]**:

| Familia | Uso real | Pesos | Import exacto |
| --- | --- | --- | --- |
| **Manrope** | cuerpo, botones, nav | 400, 500, 600, 700 | `@fontsource/manrope/latin-400.css` · `latin-500.css` · `latin-600.css` · `latin-700.css` |
| **Gilda Display** | todos los `h2`/`h3`, precios | 400 | `@fontsource/gilda-display/latin-400.css` |
| **Great Vibes** | el «Nails Lash» del hero | 400 | `@fontsource/great-vibes/latin-400.css` |

**6 imports, 6 woff2, 119.540 bytes** **[V, verificado instalando de verdad: `@fontsource` 5.2.8;
las tres familias existen; OFL-1.1 permite autohospedar — «to use, study, copy, merge, embed,
modify, redistribute»]**. **`font-weight: 300` → 0 ocurrencias** en el prototipo, que sin embargo
pide `Manrope:wght@300;400;500;600;700`: **el 300 no se usa jamás** **[V, medido]** → acceptance 4.

> 🔴 **`@fontsource/dm-sans` y `@fontsource/outfit` están en `package.json` y NO se importan en
> ningún sitio** **[V]**. Son **herencia muerta de WebEmpresa** — la lección «no copiar del base»
> mordiendo **por tercera vez**: F-03 los tokens, F-04 el JSON-LD, F-05 las fuentes. **F-05 les da
> de baja.** *(No es «producción sin test»: quitar una dependencia no es código. Lo ancla el
> escenario del conjunto exacto de `@font-face`, abajo.)*

**Por qué NO `index.css` ni `400.css`** — **es la TRAMPA INVERSA a la que sugiere el nombre**
**[V, medido]**: `import '@fontsource/manrope'` **no trae todos los pesos**: trae **solo el 400, en
los 6 subsets**. Faltarían 500/600/700 **en silencio** (faux-bold sintético, **sin error en
consola**). Y `400.css` **también** trae los 6 subsets. **Solo `latin-<peso>.css` trae uno**
(medido: 1 `@font-face`, 0 `unicode-range`).

**Por qué NO `@fontsource-variable`** **[V, medido]** — **el fallo silencioso más caro de la
lista**: (a) solo existe para **Manrope** (las otras dos dan **404**); (b) **no tiene `latin.css`**
→ en variable no se puede importar solo-latin y `dist` se comería los 6 subsets; (c) **renombra la
familia a `'Manrope Variable'`** → si el SCSS dice `'Manrope'`, **la fuente no carga y cae al
fallback sin ningún error**.

**Otros hechos medidos que el diseño tiene que respetar:**

- **`font-display: swap` sale por defecto: 176/176 `@font-face`**, y es el único valor presente —
  **pero es un hecho MEDIDO, no documentado** **[V]**: la doc oficial no lo menciona, y un bump de
  versión podría cambiarlo sin romper ninguna promesa escrita. → **si se vigila, se mide; no se
  fía.** *(No está en el acceptance: propuesta subordinada a **A-23**.)*
- **0 referencias a `googleapis`/`gstatic`** en todo el árbol de los paquetes **[V]** → acceptance 3.
- **Cada `@font-face` emite `woff2` Y `woff`** (`url(…woff2) format('woff2'), url(…woff)
  format('woff')`) y **Vite emite los dos** → **12 ficheros en `dist` para 6 usados** **[V]**.
  Coste de `dist`, **no de red**.

#### Contrato

**`src/lib/terceros.ts` — el detector PURO (mutable):**

| | |
| - | - |
| **Entrada** | `detectarOrigenesExternos(recursos, allowlist)`. `recursos` = `{ubicacion, tipo: 'html'\|'css', contenido: string}[]` — **los BYTES de `dist/`**. **No lee ficheros, ni el reloj, ni `process.env`** |
| **Salida** | `OrigenExterno[]`: `{ubicacion, construccion, origen, valor}`. Vacío = no se detectó ninguno. **La puerta ACUSA, no gruñe** (precedente F-01/F-03/F-04) |
| **`allowlist`** | 🔴 **PARÁMETRO. Es la única NECESIDAD del diseño** (ver «Mutantes»). **Sin `default`** |
| **Determinismo** | Misma entrada → misma salida, **mismo orden**. Informe diffable |

**La aserción del CSS es NEGATIVA y por LISTA BLANCA DE ESQUEMAS** **[V, §4]**: ningún `url()`
del CSS de `dist` puede tener esquema `http(s)` **ni ser protocol-relative (`//host/…`)** — solo
rutas **root-absolutas** `/assets/…` o `data:`. Tres razones medidas, y las tres importan:

1. **La ruta es ROOT-ABSOLUTA** (`url(/assets/…woff2)`), **no relativa** **[V]**. *Una puerta que
   exigiera `url(./…)` da falso negativo.* (`vite.config.ts` **no declara `base`** → `base = '/'`
   **[V]**.)
2. **Vite 7 NO exime a las fuentes del inlining** **[V]**: `build.assetsInlineLimit` = **4096 B**;
   el único opt-out por extensión es `.html` y `.svg` con `#`; **`grep -rn 'woff'` sobre la lógica
   de assets de Vite 7 → cero resultados**. Un `.woff2` de <4096 B se vuelve
   `data:font/woff2;base64,…` y **NO deja fichero en `dist/assets`**. Hoy no ocurre **solo porque
   el `.woff2` más pequeño mide 6.192 B**: es un **hecho de tamaño, no una garantía**. → **La
   puerta NO puede asumir que existe un fichero `.woff2` en disco.**
3. Una **lista negra** (`grep https?://`) es **exactamente lo que la verificación prohíbe**: sobre
   `dist/assets/*.js` da falsos positivos garantizados (`fb.me`, `react.dev`, `w3.org`) y sobre
   `dist/*.html` casa `example.invalid` **[V]**. *Alternativa descartada.*

**`src/lib/puerta-terceros.ts` — el decisor PURO (mutable):**

| | |
| - | - |
| **Entrada** | `ejecutarPuertaDeTerceros(peticion)` con `{leerArtefacto, leerConfigVite, allowlist, paresDeFuenteEsperados}` |
| **Salida** | `{codigoSalida, lineas}`. `CODIGO_EXITO = 0` / `CODIGO_FALLO = 1` |
| **Quién decide el exit code** | **No la función.** `tools/puerta-terceros.ts` es el **humilde**: cablea `node:fs`, `node:process` y el `exit`; **filtra por extensión** `/\.(html\|css)$/i`; **imprime `  ✗ <línea>` por stderr** y `✓ …` por stdout si exit 0; **sin lógica, sin fichero de test propio, fuera de `mutate`**. Se encadena en `pnpm build` **después** de `vite-react-ssg build`, como F-01/F-03/F-04 **[V: `package.json`]**. **`dev` no la invoca** |

##### 🔴 El puerto: **decidido a conciencia — F-05 NO lleva `existe*`**

**«Las tres puertas comparten un patrón exacto» es FALSO: es 2 de 3** **[V]**. **F-03 no tiene
interfaz de puerto ni ningún `existe*`**: su puerto es **un campo suelto** en la petición
(`readonly leerScss: () => string`) con contrato de **una sola mitad** («LANZA si el fichero no
existe, que es lo que hace `readFileSync`»).

> **El `existe*` es CONDICIONAL, no dogma:** solo hace falta cuando la puerta necesita
> **distinguir «el artefacto no está» de «el artefacto está y está mal»** para informar por la
> rama correcta. **F-04 lo necesita** (@s26 exige acusar **qué ruta falta**). **F-05 no**: si
> `dist/` no existe, `readdirSync` lanza, el `catch` **falla cerrada** con «la puerta de terceros
> no pudo completar la inspección: <motivo>», y **eso ya es informativo y correcto** — no hay
> ningún escenario que exija una línea distinta. **Y sin escenario que la exija, `existe*` sería
> producción sin test rojo y un mutante inmortal.** Prescribírselo a F-05 «porque las otras lo
> tienen» sería atribuir a un patrón algo que el patrón no dice.

→ **Puerto de F-05, forma F-03:** dos campos sueltos, **`leerArtefacto()`** y
**`leerConfigVite()`**, **los dos LANZAN si el fichero/directorio no existe** (es lo que hacen
`readdirSync`/`readFileSync`). **Lo INVARIANTE y lo único que se copia sin pensar:** el contrato
del puerto va **escrito junto al puerto**, y **el doble del test lo honra — lanza donde el real
lanza** (lección @s20 de F-01).

##### 🔴 La puerta asevera la **config `base`**, además de la salida

**`base` es la vía nº1 por la que un tercero entra sin que nadie lo escriba** **[V, medido con un
build real]**: `base: 'https://cdn.evil.example/x/'` reescribe **todos** los `url()` →
`url(https://cdn.evil.example/x/assets/…woff2)`. **Un solo campo de config invalida el «nunca
externo».**

→ **Regla:** `leerConfigVite()` devuelve **el texto** de `vite.config.ts` (forma F-03:
`leerScss`), y una función **pura** decide: **`base` no declarada** (hoy **[V]**) o declarada
**exactamente `'/'`** → pasa; cualquier otra cosa → **violación**.

**Las dos aserciones son complementarias, y ninguna sobra** — hay que escribirlo o alguien
borrará una por «redundante»:

- **La de la salida** cubre `--base` por CLI y `experimental.renderBuiltUrl`, que **no viven en
  `vite.config.ts`**: la puerta corre **después** del build y ve el `url()` ya reescrito, con
  esquema `http(s)` → lo caza.
- **La de la config** cubre el commit: deja **rastro en el diff** y rompe el build **en el sitio
  donde está la causa**, no tres capas más abajo. *Una puerta que solo dice «hay un origen
  externo en `dist/assets/x.css`» manda al siguiente a buscar el porqué.*

##### 🔴 La guarda anti-vacuidad: **lista declarada, no mínimo mágico**

*Sin guarda, `dist/` vacío → 0 orígenes → build verde → «protegidos».* Es A-8 en F-01, @s14/@s15
en F-03, @s26/@s27 en F-04. **Aquí es obligatoria.** Hay dos formas en el repo y **se elige la de
F-04**:

```
PARES_DE_FUENTE_ESPERADOS = [
  ['Manrope', 400], ['Manrope', 500], ['Manrope', 600], ['Manrope', 700],
  ['Gilda Display', 400], ['Great Vibes', 400],
]
```

La puerta exige que **el conjunto de `@font-face` del CSS de `dist` sea EXACTAMENTE éste** —
ni uno más, ni uno menos.

**Por qué esta forma y no `MINIMO_DE_PARES = 18` (F-03):**

1. **Crece con el diseño**: nadie tiene que acordarse de subir un número. Es el argumento que ya
   ganó en F-04 (`RUTAS_ESPERADAS`).
2. **Un mínimo aquí sería frágil por una razón ajena a la feature**: el número de ficheros CSS de
   `dist` es un detalle de **chunking y hash de Vite**; subirlo o bajarlo por un cambio de
   bundler no dice nada sobre terceros.
3. 🔴 **Contra Stryker, el literal numérico no ancla nada.** **Medido hoy sobre el registro
   autoritativo `allMutators` (`mutate.js`) del instrumenter 9.6.1 instalado: 16 mutadores, y
   ninguno muta literales numéricos** **[V]**. `MINIMO_DE_PARES = 18` **no genera mutante**: su
   valor en F-03 es **anclar contra humanos** (borrar una fila rompe el build y hay que venir a
   bajar el número a mano), que es real pero es otra cosa. **`ArrayDeclaration`, en cambio, SÍ
   ataca la lista** (`['a','b']` → `[]` **[V: `array-declaration-mutator.js`]**) → y la **guarda
   de la guarda** (lista vacía → **FALLO**, precedente @s27) **lo mata**. **La forma elegida es la
   que se puede demostrar viva.**
4. **Mata dos pájaros**: es la guarda anti-vacuidad **y** es el escenario del **acceptance 4** (el
   `wght@300` entraría como un `@font-face` de peso 300 en `dist` → **conjunto distinto →
   violación**). *Y se asevera sobre el **artefacto**, no sobre los imports de `src/`: la
   filosofía de F-04.*

**Anti-tautología (regla dura del arnés):** la lista esperada del **escenario** se escribe **a
mano** (`'Manrope'`, `400`), **jamás** se importa `PARES_DE_FUENTE_ESPERADOS` de producción ni se
recomputa con la función vigilada. *Si el test importa la constante que debería vigilar, no
vigila nada.*

**[I] declarado, que el TDD debe medir en su primer test:** que el nombre de familia sobrevive al
CSS **minificado** de `dist` (Vite no renombra identificadores CSS, pero **puede quitar las
comillas**) → la comparación es sobre el nombre **destokenizado y sin comillas**, y **eso se mide,
no se supone**.

#### Casos límite debatidos

1. **`rel="alternate stylesheet"` a un tercero → SE DETECTA.** El falso negativo que la
   fila-resumen de la tabla induce. **Escenario obligatorio**, o la regla del conjunto tokenizado
   no está anclada en ningún sitio.
2. **`rel="stylesheet" disabled` → NO se detecta.** Marcarlo sería **falso positivo sostenido por
   spec** **[V]**. **Escenario obligatorio**: sin él, «detectar todo stylesheet» pasa igual.
3. **`<a href>` a Facebook → NO se detecta.** Es el dato real de `site.ts:47` **[V]** y es de
   **F-12**. Sin escenario, alguien «endurece» la puerta y **rompe el contacto del salón**.
4. **`<link rel="canonical" href="https://example.invalid/">` → NO se detecta.** Es la canónica
   **deliberada** de F-04 (feature **`done`**, TLD reservado RFC 2606) **[V]**. **Sin este
   escenario, F-05 rompe F-04.**
5. **`schema.org` en el JSON-LD → NO se detecta.** Idem: es F-04, `done`, y es un **data block**
   **[V]**.
6. **`xmlns="http://www.w3.org/2000/svg"` en un SVG en línea del HTML → NO se detecta** **[V]**.
7. **`<base href="https://cdn.tercero.com/">` + `<img src="a.png">` → SE DETECTA** (la petición
   es al tercero). **Resolver contra `base` antes de clasificar** **[V]**.
8. **`preconnect`/`dns-prefetch` a un tercero → SE DETECTA** (criterio de proyecto declarado).
9. **`url()` protocol-relative `//cdn.tercero.com/x.woff2` → SE DETECTA.** *Es el hueco clásico de
   toda lista blanca escrita como «empieza por `http`».*
10. **`url(data:font/woff2;base64,…)` → NO se detecta.** No es una petición: es el propio byte. Y
    **puede aparecer solo por el `assetsInlineLimit` de 4096 B** **[V]** — sin este escenario, un
    `.woff2` que adelgace por debajo del límite **rompería el build sin motivo**.
11. **`dist/` sin ningún `@font-face` → FALLO** (guarda anti-vacuidad), **no «0 orígenes, verde»**.
12. **`PARES_DE_FUENTE_ESPERADOS` vacío → FALLO** (la guarda de la guarda, @s27 de F-04): con la
    lista vacía, «el conjunto coincide» se satisface **vacuamente** y la guarda **se desactiva
    sola**.
13. **`base` declarada distinta de `/` → FALLO**, aunque el CSS de `dist` esté limpio.
14. **Allowlist NO vacía que tapa un origen realmente presente → NO se reporta.** Es el escenario
    que **mata a `FilterRemoval`** (ver abajo). **No es una concesión: es lo que hace medible el
    invariante «allowlist vacía».**
15. **`dist/` inexistente → falla cerrada** por el `catch`, con el motivo. **Nunca `[]` ni verde.**
    *Una puerta que se traga su excepción y devuelve «0 violaciones» es **peor que ninguna**: es
    literalmente cómo se evaporaron los 3 bloqueantes AA del stack base* **[V]**.

#### Modos de error

- **Origen externo detectado** → **exit ≠ 0** + informe legible: **una línea por origen**, con
  **ubicación, construcción, origen y valor**.
- **Conjunto de `@font-face` distinto del declarado** (incluido el vacío) → **exit ≠ 0**, acusando
  **qué par sobra o falta**.
- **`PARES_DE_FUENTE_ESPERADOS` vacío** → **exit ≠ 0** con línea propia.
- **`base` declarada distinta de `/`** → **exit ≠ 0** con línea propia, **nombrando `vite.config.ts`**.
- **Error de la propia puerta** (incluido `dist/` o `vite.config.ts` ausentes) → **build roto,
  nunca build verde** (derivación de D-9/I-8, **[I]**, igual que F-01, F-03 y F-04).

#### Mutantes que deben morir (I-6, umbral 1.0)

**Lo que es NECESIDAD y lo que es TÉCNICA SUFICIENTE — separado, porque soldarlos es la cadena
causal falsa que la verificación tumbó:**

- 🔴 **NECESIDAD, y es lo único necesario: la allowlist entra como PARÁMETRO.** Si se cablea
  (`const ALLOWLIST = []` dentro del fichero mutado), **ningún test puede pasar una no vacía** y
  **`FilterRemoval` es genuinamente inmatable** **[V, medido ejecutando node]**.
- **TÉCNICA SUFICIENTE (una entre varias, NO una necesidad): que no haya literal de array en el
  fichero mutado** → **parámetro sin `default`**, y **el `[]` lo pasan el humilde y los tests**
  (los tests **no se mutan**). *No es la única salida: `array-declaration-mutator.js` solo dispara
  sobre `isArrayExpression()` o un callee llamado exactamente `Array`, así que un default
  `new Set<string>()` **tampoco** genera el mutante* **[V]**. **Un default `= []` es la PEOR
  opción**: el literal sigue ahí, `ArrayDeclaration` lo **RELLENA** con `["Stryker was here"]`
  (🔴 **contraintuitivo: sobre array vacío rellena, sobre array no vacío quita** **[V]**), y el
  100 % **solo se alcanzaría con un fixture grotesco** cuyo origen sea el token literal `Stryker
  was here`. *No es «inalcanzable» — eso era demasiado fuerte —, es indefendible.*
- 🔴 **Lo que mata a `FilterRemoval` NO es el diseño del parámetro: es el ESCENARIO** (allowlist
  **no vacía** que tape un origen **realmente presente**, caso límite 14). **Son dos cosas
  independientes.**
- 🔴 **Quitar el `!` de `!allowlist.includes(o)` NO es equivalente** (devuelve `[]` en vez de la
  lista) **[V, medido]**. **Lo mata cualquier escenario con ≥1 origen detectado. Excluirlo sería
  FRAUDULENTO.**

**Mutantes que los escenarios tienen que matar:**

- **`ArrayDeclaration` sobre `PARES_DE_FUENTE_ESPERADOS`** (`[…]` → `[]`) → **muere en la guarda
  de la guarda** (caso 12).
- **`BooleanLiteral`** (el `!` del predicado de allowlist) → **muere en cualquier escenario con un
  origen detectado**.
- **`FilterRemoval`** (`.filter(p)` → `origenes`) → **muere solo en el caso 14**.
- **`EqualityOperator` y `StringLiteral`** en la comparación de origen/esquema → **mueren en el
  escenario de comparación exacta** (casos 9 y 10).
- **`MethodExpression`**: los únicos pares reales que aplican aquí son
  **`endsWith`⇄`startsWith`**, **`every`⇄`some`**, **`filter`→(eliminado)** y
  **`toLowerCase`⇄`toUpperCase`** **[V: `method-expression-mutator.js`, 22 claves]**.
- **`Regex`**: si la tokenización de `rel` o la extracción de `url()` usa anclas, **`^`/`$` se
  mutan** → escenario de anclas. *Precedente medido: en F-03 el `^` fue **el único superviviente
  real del repo**.*

> 🔴 **DOS AVISOS SOBRE EL ACCEPTANCE 5, que hoy es INMEDIBLE** → **A-23**:
> 1. **`.includes` NO es mutado por Stryker 9.6.1** **[V, por dos vías independientes: el mapa
>    `replacements` de `method-expression-mutator.js` tiene 22 claves y ninguna es `includes`; y
>    la página oficial no contiene la palabra «includes»]**. **`.some` solo** existe como destino
>    de `every`→`some`.
> 2. *«Mutar la comparación de origen **o el predicado de allowlist** rompe un test»* **nombra «el
>    predicado» sin decir qué mutador lo ataca** → **no se puede medir**. La redacción tiene que
>    **nombrar mutadores reales**.
>
> Y: **«exactamente dos equivalentes» sería una PREDICCIÓN, no una medición.** El fichero de F-05
> **no existe** (`grep -rln "allowlist|detectarOrigenes" src/` → nada **[V]**). **Otra
> implementación tendrá otro conjunto. Se mide cuando exista, no antes.**

**Higiene de medición, no negociable** (`docs/verification.md`): añadir **`src/lib/terceros.ts` y
`src/lib/puerta-terceros.ts`** a la lista `mutate` de `stryker.config.json` · **todo cálculo
dentro del `it`**, nunca en el `describe` (`perTest`) · leer **`# timeout` y `tests per mutant`
ANTES que el score** · **una sola tanda** de Stryker a la vez · acotar con `--mutate <fichero>`,
**JAMÁS con `--testFiles`**.

#### Preguntas abiertas de esta feature — **PENDIENTE DE PUERTA HUMANA**

**Las cuatro van a la puerta. El lead propone; NO cierra ninguna.**

- **A-23** — 🔴 **la que bloquea el Gherkin.** Los **acceptance 2 y 5** son insatisfacible e
  inmedible: *«el build falla si el artefacto contiene CUALQUIER origen externo»* (10 orígenes
  medidos hoy, **ninguno una petición**; borrarlos es imposible y **rompería F-04, que está
  `done`**) y *«mutar … el predicado de allowlist»* (pide **un mutante que no existe**).
  **Propuesta del lead:** reescribir el 2 como *«ninguna **PETICIÓN AUTOMÁTICA** a un origen
  externo»* y el 5 **nombrando mutadores reales** (`ArrayDeclaration`, `FilterRemoval`,
  `BooleanLiteral`, `EqualityOperator`). *Y, si el humano quiere, añadir la regla de
  `font-display: swap` (hoy fuera del acceptance).* **NO destilar los acceptance 2 y 5 tal cual.**
  **PENDIENTE DE PUERTA HUMANA** — *cambia los criterios de aceptación.*
- **A-24** — 🔴 La **`puerta_legal` de F-05 es una atribución normativa falsa**, y la descripción
  promete «elimina banner, CMP y política de cookies **de un plumazo**». **Propuesta del lead:**
  sustituirlas por el **criterio de proyecto** («ningún tercero recibe la IP del visitante → no
  hace falta análisis jurídico»), con **Fashion ID marcado `[I]` y declarado no re-verificado hoy
  (EUR-Lex 202 + AWS-WAF)**; **y corregir de paso la descripción de F-11**, que arrastra la misma
  atribución. **PENDIENTE DE PUERTA HUMANA** — *toca el contrato **y** `feature_list.json`.*
- **A-27** — 🔴 F-05 es la primera feature que mete **binarios** en `dist/` → **activa la deuda
  declarada de F-01** (**0 violaciones hoy**, **50.100 secuencias candidatas** **[V]**). ¿Se deja
  **declarada** (postura del lead: sí — F-05 **no toca** `tools/puerta-placeholders.ts`, Ley 1) o
  se abre **escenario nuevo** en `features/puerta_placeholders.feature`? **PENDIENTE DE PUERTA
  HUMANA** — *reabrir una feature `done` es decisión del humano.*
- **A-28** — `latin-400.css` **no tiene `unicode-range`** **[V]** → ese `@font-face` **aplica a
  TODO el rango**: un carácter fuera del subset latin **no cae al fallback**, pinta **tofu, sin
  error**. El latin cubre `U+0000-00FF` (ñ, vocales acentuadas, ¿, ¡) → **suficiente para
  español**; **un nombre con `Ł`, `ř`, `ğ` daría tofu**. ¿Se añade `latin-ext` (**+6 woff2**) o se
  acepta? **Propuesta del lead:** aceptar y declararlo, hasta que exista un nombre real que lo
  exija. **PENDIENTE DE PUERTA HUMANA** — *decisión de **producto**: ¿qué nombres de clienta se
  esperan?*

---

### Feature 6: `header_nav_footer` — la cabecera, la nav completa, el pie, y la PUERTA DE ANCLAS VIVAS que hoy no existe

> Feature `#6` de `feature_list.json`. `depends_on: ["cascaron_semantico"]` (F-04, `done`) **[V]**.
> Entrega la **cabecera sticky**, la **navegación**, el **pie**, una **puerta de anclas vivas
> nueva** y el **`scroll-padding-top` derivado de la cabecera** que F-04 dejó como suelo sin
> verificar.
>
> **Toda esta sección es coherente con `progress/f06_verificacion_previa.md`** (workflow
> adversarial, ~1,77 M tokens, 8 afirmaciones × verificar + refutar: **1 refutada de raíz, 6
> matizadas, 1 confirmada**). Donde `feature_list.json` §6, el troceado de
> `docs/research/00-fase0-informe.md` o esta sección contradigan a esa verificación, **manda la
> verificación**. Se contradicen en **cinco puntos graves**: la **`puerta_legal`** y **cuatro de
> los cinco acceptance** (@1, @2, @4 y la parte del breakpoint del @5) → **B-1..B-4**.
>
> Es el patrón de F-04 y F-05, **por tercera vez**: *la decisión de construir cabecera + nav + pie
> es correcta; casi todo el «cómo» escrito en el troceado es falso o insatisfacible.* **Ninguna
> decisión de fondo cae. Caen TRES acceptance y la puerta legal.**

#### Cómo se acordó esta sección — **declarado por escrito, sin fingir nada**

**No hubo conversación de spec con el humano para F-06, y esta sección no la simula.** El humano
**delegó** esta fase en el `craftsman_lead` **hasta la puerta de aprobación del `.feature`**, que
sigue **en pie** y es donde entran las **siete** preguntas abiertas. La contraparte humana la
sostienen **decisiones ya registradas** —`progress/current.md`, `docs/research/00-fase0-informe.md`
y las de este documento (A-17, A-18)— **más la verificación previa**, que hizo de adversario en
lugar del humano: tumbó algo en cada una de las ocho afirmaciones.

**Lo que esta sección NO puede cerrar** —y no cierra— es lo que cambia los criterios de aceptación,
la `puerta_legal` o `feature_list.json`. Eso es la puerta. Las siete preguntas llevan la **propuesta
del lead** y están marcadas **PENDIENTE DE PUERTA HUMANA**.

#### Propósito

Que la home tenga una **cabecera** con la marca y una **navegación** que enlace **exactamente a las
secciones que existen** en el artefacto de producción, un **pie** honesto, y que una **puerta
mecánica nueva** demuestre en cada build —sobre el **HTML crudo de `dist/`**— que **ningún ancla de
la nav apunta a un `id` que no exista en esa página**; más un **`scroll-padding-top`** que la
cabecera sticky no invalide.

#### Por qué existe — y **por qué la `puerta_legal` heredada roza el AAA** (B-1)

`feature_list.json` §6 declara `"puerta_legal": "WCAG SC 2.4.11 (foco no oscurecido)"`. Cuatro datos
duros son ciertos **[V]**: **2.4.11 es AA**, es **nuevo en WCAG 2.2**, **C43** (`scroll-padding`) es
**técnica suficiente** (no *advisory*), y su *Understanding* **nombra literalmente los sticky
headers**.

**🔴 Pero el listón de AA NO es «foco no oscurecido». Es «not entirely hidden».**

| SC | Nivel | Texto literal **[V]** |
| --- | --- | --- |
| **2.4.11** | **AA** | *«the component is **not entirely hidden** due to author-created content»* |
| **2.4.12** | **AAA** | *«**no part** of the component is hidden by author-created content»* |

**El oscurecimiento PARCIAL es CONFORME en AA.** Escribir *«el foco no queda oscurecido»* atribuye
de facto el listón del **AAA (2.4.12)** bajo etiqueta AA. **Es exactamente el fallo de F-03** (el
1.4.11 no iba de «bordes de control») **y de F-04** (el 2.4.7 no exige contraste ni grosor):
**tercera reincidencia si se copia tal cual.**

**Separación de los tres ejes, que soldarlos es EL fallo que este repo persigue** (mató 5 de 9
razones en F-04):

- **(a) LETRA de la norma** — SC 2.4.11 (AA): un componente que **recibe foco de teclado** no queda
  **enteramente** oculto por contenido del autor. **Alcance:** *«receives keyboard focus»* **[V]** —
  un ancla `#id` que aterriza bajo la cabecera **no viola 2.4.11 por sí solo** si el destino no
  recibe foco de teclado (eso es UX/proyecto). **Y no tiene NINGÚN umbral numérico [V].**
- **(b) TÉCNICA SUFICIENTE** — `C43` (`scroll-padding`). Es **una** técnica suficiente que **el
  proyecto elige**, no una imposición de la norma.
- **(c) CRITERIO DE PROYECTO** — que la cabecera no tape el destino de un salto de ancla, con el
  suelo de `scroll-padding-top` dimensionado por nosotros. **Los 66/70/80px/5rem son criterio de
  proyecto, JAMÁS WCAG.** Prohibido justificar un número citando 2.4.11.

> **Propuesta del lead (B-1), PENDIENTE DE PUERTA:** reescribir la `puerta_legal` a *«ningún
> componente que reciba foco de teclado queda **enteramente** oculto por la cabecera sticky (SC
> 2.4.11 AA, "not entirely hidden"); "no part hidden" es el 2.4.12 AAA y NO se persigue»*, con
> **C43 como técnica suficiente elegida por el proyecto** y **cero números atribuidos a la norma**.

**PROHIBIDO en este contrato, en el Gherkin y en el código:** «foco no oscurecido» a secas ·
atribuir a 2.4.11 un umbral en px o rem · llamar a C43 «obligatorio» sin sujeto (todo «obligatorio»
se lee «obligatorio **para** \<quién\>») · afirmar que 2.4.11 cubre el scroll con `Tab` (es UA, ver
abajo). *Es la misma regla que F-04 escribió para schema.org ≠ Google y F-05 para el art. 22.2.*

#### La distinción técnica que ES media feature: **el `scroll-padding` va en el CONTENEDOR, y en DOS CAPAS** (B-2)

Dos acceptance del troceado son insostenibles tal cual, y **por la misma razón de fondo**: se ha
atribuido a la norma —y a CSS— comportamientos que ni la norma fija ni CSS puro puede leer.

##### 🔴 @2 (*«scroll-margin NO actúa al tabular»*) es **FALSO** **[V]** — sin fuente primaria

**Ninguna fuente primaria lo sostiene** —ni CSSOM View, ni CSS Scroll Snap, ni el HTML Living
Standard—; al contrario, CSS Scroll Snap §1 describe las dos propiedades **simétricamente** para las
*scroll-into-view operations* **[V]**. La realidad medida:

- El scroll que dispara **`Tab`** es **comportamiento del UA, no normado**: los *focusing steps* del
  HTML **no contienen ningún paso de scroll**; el único sitio donde la spec ordena hacer scroll es
  el **método `focus()`** («*If preventScroll is false, then scroll a target into view*») **[V]**.
- **La razón CORRECTA de usar `scroll-padding-top` no es una asimetría de `Tab`**: es que
  `scroll-padding` se define **sobre el CONTENEDOR** de scroll como *«optimal viewing region … for
  ALL scroll containers»* **[V]** → **cubre TODAS las operaciones de scroll-into-view y paging**,
  mientras que `scroll-margin` es **por-elemento** y su expansión está normada **solo para
  `:target` y `scrollIntoView()`** **[V]**.

> **Propuesta del lead (B-2, primera mitad):** reescribir @2 con la razón correcta —**`scroll-padding-top`
> va en el `html`/contenedor y por eso cubre toda operación de scroll-into-view**— y **NO** atribuir
> a la norma ninguna asimetría de `scroll-margin` frente a `Tab`. Si el contrato quisiera afirmar
> algo de `Tab` + `scroll-margin`, es **[NV]** (el envío sintético de `Tab` fue no fiable) y exigiría
> medición multinavegador. **Mantener el `html { scroll-padding-top }` de F-04 es correcto, por la
> razón del contenedor, no por la de `Tab`.**

##### 🔴 @4 (*«se deriva de la altura REAL de la cabecera»*) es **INSOSTENIBLE bajo SSG** **[V]**

**En CSS puro NO existe forma de leer la altura de un elemento** **[V, verificado contra el CSSWG]**:
no hay función de tamaño-de-elemento en css-values-5; `anchor-size()` **no es válida** en
`scroll-padding-top` y exige caja absolutamente posicionada; las **container queries** solo
condicionan **descendientes** (`html` es **ancestro** del header); los **porcentajes** de
`scroll-padding` resuelven contra el **scrollport**, no contra un elemento. **La única vía es JS**
—es lo que hace el propio ejemplo de C43 con `offsetHeight`— **pero bajo SSG el HTML horneado no
lleva esa custom property hasta que hidrata**, y el usuario que llega desde un enlace con `#ancla`
aterriza **antes** de hidratar. **Y el consuelo «5rem escala con rem, luego cubre 1.4.4» es FALSO
medido**: a raíz 32px (200%) `5rem = 160px`, pero la cabecera en rem mide **590px** a 320w — la
envoltura flex es **no lineal**, el rem no la sigue **[V]**.

**Las cinco alturas medidas en Chrome real** (barrido 280–1600px al pixel, `document.fonts.ready`)
sobre el prototipo: **231 / 190 / 149 / 108 / 70px**, con saltos de envoltura en **282 / 385 / 647 /
821px** **[V]**. **66px no acierta a ningún ancho; 70px solo a ≥821px.** Los **5rem (80px) de F-04
solo bastan a ≥821px**; por debajo se quedan cortos **28 / 69 / 110 / 151px** **[V]**. 🔴 **Estas
cifras hay que RE-MEDIRLAS sobre la nav definitiva** —cambiar «Facial» por «Pestañas/Cejas» y
completar la nav mueve los saltos—: **no se copian, se vuelven a medir**.

> **Propuesta del lead (B-2, segunda mitad), en DOS CAPAS honestas:**
>
> - **Capa 1 — obligatoria PARA F-06, criterio de PROYECTO:** un `scroll-padding-top` **estático en
>   CSS, correcto por sí solo sin JS**, dimensionado como **suelo seguro ≥ la altura máxima medida**
>   en el rango soportado, **o** una **tabla `@media` con los saltos re-medidos**. **Sustituye los
>   5rem de F-04; no los hereda.** El SCSS de F-04 lo dice ya por escrito: *«F-06 es quien puede
>   ajustarlo, porque es quien conoce la altura»* (`_base.scss:32-35`) **[V]**.
> - **Capa 2 — OPCIONAL, [I]:** afinado JS (`ResizeObserver` → custom property) que **solo mejora**
>   post-hidratación. Si se añade, es SSR-safe y **no** es de lo que depende la conformidad: la Capa
>   1 basta por sí sola.

**El eje de F-06 es la Capa 1.** La Capa 2 no entra en el acceptance salvo que el humano lo decida
en B-2.

#### Alcance — qué construye F-06, qué NO, y **el acceptance @1 reescrito** (B-4)

##### 🔴 @1 (*«cubre TODAS las secciones, no 7 de 11»*) es **INSATISFACIBLE** **[V]** — es A-23 otra vez

Hoy `src/pages/home.tsx` tiene **2 secciones** y **sus ids viven en los `<h2>`** (`servicios-titulo`,
`contacto-titulo`), no en los `<section>` **[V: `home.tsx:38-39,72,77`]**. «TODAS las secciones» de
una página que **aún no existe** es la misma trampa que **A-23** (acceptance insatisfacible reescrito
como igualdad de conjuntos). El «7 de 11» y el «6» del troceado **miden cosas distintas y ambos son
correctos** —el prototipo tiene 11 secciones expandiendo el bucle, la nav 6 entradas, 7 destinos
distintos (`#equipo` duplicado)— pero **NINGUNA de esas 11 secciones existe en el artefacto real de
HEAD** **[V]**.

**Quién construye cada sección (cruzado con las 20 features) [V]:** `top`→F-07 · `unas`/`pestañas`/`cejas`→F-09
(**`facial` NO existe**; F-09 lo corrige) · `contacto`→F-12/F-10/F-11 · `faq`→F-15 · `colores`→F-19
(*blocked*) · `equipo`→F-18 (*blocked, «NO empezar spec»*) · `reserva`→**no se construye** (la
sustituye F-13) · **`destacados` y `ofertas`→NINGUNA feature: son HUÉRFANOS** (0 ocurrencias en
`feature_list.json`) → **B-7**. **F-06 depende solo de `cascaron_semantico` (`done`); CERO destinos
de F-06 existen o pueden existir hoy.**

> **Propuesta del lead (B-4):** reescribir @1 como **igualdad de conjuntos derivada del DOM**: *«la
> nav enlaza EXACTAMENTE a las secciones que EXISTEN en el artefacto de `dist/`: **ni una de más**
> (ancla muerta) **ni una de menos** (sección inalcanzable)»*. Hoy el conjunto es
> **`{servicios, contacto} = 2`**, y **crece solo** según cierran F-07/F-09/etc., **sin que nadie
> tenga que subir un número** —es el argumento que ya ganó en F-04 (`RUTAS_ESPERADAS`) y F-05
> (`PARES_DE_FUENTE_ESPERADOS`)—.

##### 🔴 EL ENTREGABLE DE MÁS VALOR: una **PUERTA DE ANCLAS VIVAS** nueva

**La anti-404 de F-04 EXCLUYE las anclas por diseño.** `RUTA_INTERNA = /^\/(?!\/)/`
(`puerta-cascaron.ts:552`) trata `#ancla` como *«un salto dentro de la misma página»* y **no la
comprueba** **[V]**. Consecuencia medida: **una nav con 7 anclas muertas pasaría las cuatro puertas
en verde** —incluida `#contacto`, porque el id real es `contacto-titulo`, no `contacto`—. Es un
hueco estructural: *la puerta de F-04 no miente, pero no mira aquí.*

> **F-06 entrega una PUERTA que HOY NO EXISTE:** aseverar sobre el **HTML crudo de cada página de
> `dist/`** que **todo `href="#id"` de la nav resuelve a un `id` presente en esa misma página**, y
> **fallar cerrada** (artefacto ausente, 0 páginas o **0 anclas inspeccionadas → exit ≠ 0**, nunca
> verde). Esa puerta **mata además el bug de `#facial`** (ancla a una sección que este negocio no
> tiene). **Sigue el patrón exacto de la anti-404 de F-04:** función pura decisora en `src/lib/`,
> humilde que cablea `fs`/`process`/`exit` en `tools/`, encadenada en `pnpm build` **después** de
> `vite-react-ssg build`. *No sustituye a la anti-404: es su gemela para el eje que aquella excluye.*

##### F-06 **NO construye secciones**

Su alcance es **cabecera + nav + pie + la puerta de anclas vivas + el `scroll-padding-top`
derivado**. Las secciones (`top`, `unas`, `faq`, …) las montan F-07/F-09/F-15/etc. La nav de F-06
crece **enlazando a las que van existiendo**, y la puerta impide que enlace a las que aún no.

#### El menú móvil — **PROPUESTA DEL LEAD (B-5, B-6, B-3), PENDIENTE DE PUERTA**

El troceado dice «Menú móvil» y el `feature_list.json` §6 advierte del patrón de memoria
`red-css-para-rama-solo-js-en-ssg`. **Hoy `src/` no tiene ni `useIsMobile`, ni `matchMedia`, ni
`useSyncExternalStore`, ni una sola `@media`** **[V]**; el prototipo resuelve el responsive con
`flex-wrap: wrap`. **La primera decisión de F-06 es una BIFURCACIÓN de diseño (B-5), y de ella
cuelgan B-3 y B-6.**

##### B-5 — ¿menú móvil sí o no, y con qué mecánica? · **propuesta: CSS puro + estado en atributo consultable**

- **CSS puro para el eje RESPONSIVE**: el `@media` decide botón-hamburguesa vs nav horizontal. **Más
  un estado abierto/cerrado mínimo** expresado en un **atributo CONSULTABLE** (`aria-expanded` en el
  botón; la nav visible por `data-*` o derivada del atributo, **nunca por una clase CSS**).
- **Esto EVITA el patrón `red-css-para-rama-solo-js-en-ssg`, y encaja con su propio «Cuándo NO
  aplica»:** el patrón muerde cuando **una rama de _viewport_** se decide en JS (`useIsMobile`) y el
  SSG **hornea la rama de escritorio** —el fallo de I-4/I-5 del contrato general—. Aquí **no hay rama
  de viewport en JS**: el CSS decide móvil/escritorio, y el único estado JS es abierto/cerrado, que
  **hornea «cerrado» correctamente en SSR** (el estado seguro de primera carga). *Citarlo como
  justificación del diseño sería honesto; citarlo como «prohíbe el menú móvil» sería falso —el
  patrón no lo dice.*
- **Trampas medidas SI, pese a esto, se metiera rama JS de viewport** (para que el Gherkin las cierre
  si el humano elige esa vía en B-5): el guard `typeof window === 'undefined'` **compila verde y
  hornea escritorio** (fallo mudo) **[V]**; `ssgOptions.mock: true` **empeora** el fallo (jsdom sin
  `matchMedia` y sin layout) **[V]** → **prohibido `ssgOptions.mock`**; los tests con `matchMedia`
  mockeado son **tautológicos** para esto (solo ven el estado post-hidratación) **[V]**. En ese caso
  aplican I-4/I-5: **red CSS en el MISMO breakpoint literal** que la query de JS, `getServerSnapshot`
  puro, y **test que lee el SCSS y ancla contra el literal a mano** (patrón
  `doble-de-test-anclado-al-literal-no-al-simbolo`).

##### B-6 — Radix `Dialog` vs `<button aria-expanded>` + `<nav>` · **propuesta: NO Radix**

- **`radix-ui` hoy tiene CERO usos en `src/`** **[V]** — es el caso `@fontsource/dm-sans`/`outfit`
  de F-05, herencia muerta que se da de baja. **Propuesta del lead: `radix-ui` SALE de
  `dependencies`.**
- **Motivos medidos:** (1) `Dialog.Portal` **emite CERO en prerender** —125 bytes, solo el
  `<button>` trigger; el enlace del menú **no está en el HTML**— porque `Portal` devuelve `null` en
  SSR **[V, `renderToString`]**, y eso **dejaría la puerta de anclas vivas (y la anti-404) CIEGAS**:
  *no se rompe, MIENTE POR OMISIÓN; es peor.* (2) La regla del repo es **dependencias mínimas**
  (I-2, D-2). (3) Un menú **no-modal** no necesita `Dialog`: la **letra de WCAG** (SC 2.1.2 sin
  trampa de teclado, 4.1.2 nombre/rol/estado) **no nombra Radix, ni Escape, ni `aria-expanded`** —un
  `<button aria-expanded>` + `<nav>` es **otra técnica suficiente [V]**.
- 🔴 **El humano puede preferir Radix (B-6).** Si lo elige, **debe decidir por escrito `Portal` sí/no**:
  con `Portal`, **escenario OBLIGATORIO** que asevere los enlaces del menú en el **HTML de `dist/`**
  (si no, la puerta de anclas queda ciega); sin `Portal`, el `Dialog` prerenderiza completo **[V]**.

##### B-3 — el breakpoint · **propuesta: `max-width: 820px`, criterio de proyecto MEDIDO** (solo si hay menú móvil)

- **NUNCA el `767` de WebEmpresa:** es **herencia muerta** —**0 ocurrencias de `767` en `src/`,
  `tests/`, `features/` y el prototipo** **[V]**; las 17 que existen viven en `.memoria-cache/`,
  `docs/research/` y scratch—. El `767 = 768−1` es el `md` de Bootstrap/Tailwind, **convención de
  framework, no una medida de este diseño**. Es «no copiar del base» **por cuarta vez** (F-03
  tokens, F-04 JSON-LD, F-05 fuentes, F-06 el breakpoint).
- **El breakpoint real, MEDIDO en Chrome** (barrido al pixel, `document.fonts.ready`): con fuentes
  cargadas la nav envuelve a **805→806px**; con la fallback `sans-serif` (el estado pre-swap del SSG)
  a **793px** → **banda 793–806px** **[V]**. El borde operativo para el HTML pre-hidratación es
  **793** (fallback). **Propuesta: `max-width: 820px`** —margen sobre toda la banda, porque el número
  se mueve ±12px según fuentes y se moverá otra vez al reetiquetar la nav (RE-MEDIR)—, **[criterio de
  proyecto, medido]**.
- **NUNCA atribuido a WCAG:** **SC 1.4.10 Reflow** solo exige *«a width equivalent to 320 CSS pixels»*
  sin scroll bidireccional —**cero menciones de breakpoint**— y **la cabecera del prototipo ya cumple
  1.4.10 hoy** (medido: sin desborde a 320px) **[V]**. **El menú móvil NO se justifica por Reflow.**
- 🔴 **Si hay rama JS con breakpoint** (vía B-5), **el `@media` del SCSS y la constante JS son EL
  MISMO LITERAL**, y **el test lee el SCSS y lo ancla contra el literal escrito a mano** (patrón
  `doble-de-test-anclado-al-literal-no-al-simbolo`; anti-tautología: jamás importar la constante de
  producción).

#### El choque con las cuatro puertas (E1) — **medido, y con un bloqueante nuevo**

Tres de las cuatro puertas **no se rompen** (medido con fixtures): F-05 terceros **ignora** los
`<a href>` a Facebook/Instagram (**@s12 existe justo para eso** → **NO se prohíben**, exit 0) **[V]**;
F-03 contraste **ya tiene** los pares de cabecera y pie en `MATRIZ_DE_USO`, y su guarda es `< minimo`
→ **añadir pares pasa, NO se toca `MINIMO_DE_PARES`** **[V]**; F-01 placeholders no dispara. **Pero:**

- 🔴 **El pie NO emite enlaces legales.** Un `<a href="/aviso-legal">` **ROMPE la anti-404** —2
  violaciones «href interno sin fichero en dist/», la fila 1 de la tabla del bug del cliente— **[V]**.
  Las rutas, enlaces y contenido legal son **F-16** (A-17, cerrada). La nota *«el pie con los huecos
  de los enlaces legales»* de `feature_list.json:101` es **troceado viejo que A-17 ya derogó** y que
  `home.tsx:86-90` ya declara resuelto **[V]**. **F-06 NO emite enlaces legales.** Los `<a>` a
  Facebook/Instagram del pie sí (son datos reales de `site.ts`, hiperenlaces, exit 0) **[V]**.
- 🔴 **Un `className={cond ? 'a' : 'b'}` en TSX es INMATABLE** bajo la regla anti-clase-CSS del propio
  repo. **Medido con Stryker real** (19 mutantes, tanda sana): genera **5 mutantes** (2
  ConditionalExpression, 1 EqualityOperator, 2 StringLiteral) y **los 5 sobreviven** a una suite que
  consulta por rol/nombre accesible/texto —todo lo que `feature_list.json:22` permite—; **solo mueren
  con `toHaveClass`, que esa misma línea PROHÍBE** **[V]**. Con umbral 1.0, **F-06 no cierra si
  escribe un className condicional.** Es una colisión entre dos reglas del repo, no un fallo de
  Stryker. **La salida está medida y es barata:** `aria-current={cond ? 'page' : undefined}` —misma
  forma, mismos mutadores— **muere 4/4 con consultas permitidas** **[V]**.
  > **INVARIANTE DE F-06:** el estado condicional se expresa en un **atributo consultable**
  > (`aria-current`, `aria-expanded`, `aria-pressed`, `data-*`); el `className` es **constante o
  > derivado**, **nunca** `cond ? 'a' : 'b'`. Es el mismo eje que I-5 (consultar por rol/nombre/texto/`data-*`,
  > nunca por clase CSS).
- **Dos trampas de proceso, silenciosas** —ninguna puerta las vigila—: (1) los `.tsx` nuevos hay que
  añadirlos a **DOS listas**: `mutate` de `stryker.config.json` (lista explícita; hoy termina en
  `puerta-terceros.ts`, **sin ningún `.tsx`** **[V]**) **Y** `coverage.include` de `vitest.config.ts`
  (hoy `['src/lib/**/*.ts']`, que **excluye todo `.tsx`** **[V]**). Si el `.tsx` no está en `mutate`,
  Stryker **ni lo mira** y la tanda da 100% sin medir nada. (2) **Los atributos JSX literales NO
  generan mutantes** (`aria-label="Principal"` no está protegido por la mutación): los aseveran los
  tests o la puerta de anclas, **jamás Stryker** —no confundir «100% de mutación» con «el marcado
  está cubierto»—.
- 🔴 **El primer `pnpm build` real es OBLIGATORIO** **[NV]**: **todo lo anterior se midió contra las
  funciones puras con fixtures propios, NO contra un `dist/` real.** *«Verde ≠ funciona»* (I-8): el
  primer build de F-06 puede desmentir cualquier cosa —F-04 se llevó sus sustos justo ahí— y **manda
  sobre todo lo escrito aquí**.

#### Contrato

**`src/lib/`** — el/los decisor(es) PURO(s) de la **puerta de anclas vivas** (mutable):

| | |
| - | - |
| **Entrada** | El **HTML crudo de cada página de `dist/`** —los BYTES—, o el modelo derivado de él (anclas de la nav + `id`s presentes). **No lee ficheros, ni el reloj, ni `process.env`**: recibe lo que examina (precedente F-01/F-03/F-04/F-05) |
| **Salida** | `violaciones[]`: por cada `href="#id"` de la nav cuyo `id` **no exista** en esa página, una violación con **ruta de la página, ancla y el `id` ausente**. Vacío = pasa. **La puerta ACUSA, no gruñe** |
| **Igualdad de conjuntos (B-4)** | La nav enlaza **EXACTAMENTE** a las secciones existentes: **ancla sin destino** (muerta) → violación; **sección con `id` de nav-target que la nav no enlaza** → violación (inalcanzable). El conjunto se **deriva del DOM**, no de una lista fija |
| **Determinismo** | Misma entrada → misma salida, **mismo orden**. Informe diffable |
| **Quién decide el exit code** | **No la función.** `tools/` es el **humilde**: cablea `fs`/`process`/`exit`, encadenado en `pnpm build` tras el build. **`dev` no lo invoca.** Por eso la función es pura, testeable y mutable |

**Cabecera / nav / pie (marcado, `.tsx`):** presencia de los landmarks que F-04 ya exige
(`nav`/`footer` — I-5, criterio de proyecto, **no** «lo exige 1.3.1»), la marca en la cabecera, el
`aria-label` de la nav, y **el estado condicional SIEMPRE en atributo consultable** (invariante de
arriba). Lo aseveran los **tests** y la **puerta de anclas**, no Stryker (los atributos literales no
mutan).

**`scroll-padding-top` (SCSS, Capa 1):** un valor **estático, suelo seguro ≥ altura máxima re-medida**
(o tabla `@media`), que **sustituye** el `5rem` de `_base.scss`. No es mutable (Stryker no ve SCSS);
lo asevera un **test que lee el SCSS** (como `tokens.test.ts`), **no un número inventado hoy**.

#### Casos límite debatidos

1. **Página con 0 secciones y nav con anclas → violación por cada ancla muerta.** Es el estado del
   prototipo portado tal cual (7 de 7 muertas). **Escenario obligatorio.**
2. **`#facial` (sección que este negocio no tiene) → violación.** El bug concreto que la puerta mata.
3. **`#contacto` cuando el id real es `contacto-titulo` → violación.** El desajuste id-de-`<h2>` vs
   ancla; hoy `home.tsx` lo evita apuntando a `#contacto-titulo` **[V]**, y la puerta lo blinda.
4. **0 anclas inspeccionadas / 0 páginas / artefacto ausente → FALLO (exit ≠ 0), nunca verde.**
   Guarda anti-vacuidad (A-8 en F-01, @s14/@s15 en F-03, @s26/@s27 en F-04, casos 11-15 en F-05).
   **Sin ella la puerta es teatro.**
5. **Sección con `id` pero SIN entrada en la nav** (p. ej. `faq` cuando F-15 la monte y la nav no la
   enlace) → violación por **inalcanzable** (la otra mitad de la igualdad de conjuntos, B-4).
6. **`<a href="https://www.facebook.com/…">` en el pie → NO es asunto de esta puerta.** No es un
   ancla interna; F-05 ya lo ignora (@s12) y F-12 lo cierra. Sin escenario, alguien «endurece» la
   puerta y rompe el contacto del salón.
7. **`<a href="/privacidad">` en el pie → lo caza la anti-404 de F-04, NO esta puerta.** F-06 no
   emite enlaces legales; si aparecieran, es F-16. Deslinde declarado para no duplicar la anti-404.
8. **La cabecera sticky tapa el destino de un salto de ancla** → lo cubre la Capa 1 del
   `scroll-padding-top` (criterio de proyecto), **no** una aserción sobre 2.4.11 en px (B-1).
9. **Menú móvil «cerrado» en el HTML prerenderizado** → el estado horneado por SSR es «cerrado»
   (estado seguro), aseverado sobre el HTML crudo de `dist/` (I-8), no en jsdom. Aplica solo si B-5
   introduce menú móvil.

#### Modos de error

- **Ancla muerta / sección inalcanzable** → **exit ≠ 0** + informe legible: **una línea por
  violación**, con **página, ancla o `id`, y qué falta**.
- **0 anclas / 0 páginas / artefacto ausente** → **exit ≠ 0** (falla cerrada, guarda anti-vacuidad),
  **nunca `[]` ni verde**.
- **Error de la propia puerta** (HTML ilegible, excepción) → **build roto, nunca build verde**
  (derivación de D-9/I-8, **[I]**, igual que F-01/F-03/F-04/F-05).

#### Mutantes que deben morir (I-6, umbral 1.0)

- **El predicado «el `id` del ancla NO está en el conjunto de `id`s de la página»** → muere en el
  escenario del caso 1/2 (ancla muerta) **y** en el negativo (nav válida → 0 violaciones).
- **La guarda anti-vacuidad** (conjunto de páginas/anclas vacío → FALLO) → muere en el caso 4;
  precedente `ArrayDeclaration` de F-05 (lista → `[]` la mata la guarda de la guarda).
- **La extracción de anclas / `id`s** (si usa regex con anclas `^`/`$`, se mutan → escenario de
  anclas; en F-03 el `^` fue **el único superviviente real del repo**).
- 🔴 **NO se puede predecir el conjunto exacto de mutantes ni de equivalentes:** el fichero de F-06
  **no existe** todavía; **otra implementación tendrá otro conjunto. Se mide cuando exista, no
  antes** —la lección de F-05 con «exactamente dos equivalentes» sería una PREDICCIÓN, no una
  medición—. El `.feature` **nombra mutadores reales de Stryker 9.6.1**, jamás `.includes` (no
  existe ese mutador **[V]**).

**Higiene de medición, no negociable** (`docs/verification.md`): añadir los `.tsx`/`.ts` nuevos a
`mutate` de `stryker.config.json` **Y** a `coverage.include` de `vitest.config.ts` · todo cálculo
dentro del `it` (`perTest`) · leer `# timeout` y `tests per mutant` **antes** que el score · una sola
tanda de Stryker · acotar con `--mutate <fichero>`, **JAMÁS con `--testFiles`**.

#### Preguntas abiertas de esta feature — **PENDIENTE DE PUERTA HUMANA**

**Las SIETE van a la puerta. El lead propone; NO cierra ninguna.** *(Se etiquetan `B-1..B-7` como en
`progress/f06_verificacion_previa.md` §9; el reetiquetado a la serie `A-nn` del proyecto lo hace la
puerta, no esta sección.)*

- **B-1** — 🔴 La `puerta_legal` (*«SC 2.4.11 foco no oscurecido»*) **roza el AAA**. **Propuesta:**
  reescribir a *«not entirely hidden» (AA)*, con **C43 como técnica suficiente elegida por el
  proyecto** y **cero números atribuidos a la norma**; 2.4.11 solo aplica a **foco de teclado**.
  **PENDIENTE DE PUERTA** — *cambia la puerta legal declarada.*
- **B-2** — 🔴 El **acceptance @2** (*«scroll-margin no actúa al tabular»*) es **FALSO [V]** y el
  **@4** (*«se deriva de la altura REAL»*) es **INSOSTENIBLE bajo SSG [V]**. **Propuesta:** reescribir
  @2 con la razón correcta (**`scroll-padding` va en el contenedor**, cubre toda operación de
  scroll-into-view) y @4 en **dos capas** (Capa 1: suelo CSS estático **re-medido**, obligatoria;
  Capa 2: afinado JS opcional). **PENDIENTE DE PUERTA** — *cambia dos criterios de aceptación.*
- **B-3** — El **breakpoint `767`** es **herencia muerta** de WebEmpresa (**0 en `src/` [V]**); el
  medido es **793–806px**. **Propuesta:** **`max-width: 820px`** como **criterio de proyecto medido**,
  **NUNCA atribuido a WCAG** (1.4.10 solo exige 320px), **solo si hay menú móvil** (depende de B-5); y
  **RE-MEDIR** sobre la nav definitiva. **PENDIENTE DE PUERTA** — *cambia un criterio y un número.*
- **B-4** — 🔴 El **acceptance @1** (*«TODAS las secciones, no 7 de 11»*) es **INSATISFACIBLE [V]**
  (hoy 2 secciones, ids en los `<h2>`): **es A-23 otra vez**. **Propuesta:** reescribir como
  **igualdad de conjuntos derivada del DOM** (ni ancla de más, ni sección de menos) **+ una PUERTA DE
  ANCLAS VIVAS nueva** —el entregable de más valor de F-06—, que mata además el bug de `#facial` y
  cubre el hueco que la anti-404 de F-04 excluye por diseño. **PENDIENTE DE PUERTA** — *reescribe el
  criterio central y añade una puerta.*
- **B-5** — 🔴 **¿Menú móvil, sí o no, y con qué mecánica?** Es la **bifurcación de diseño** de la que
  cuelgan B-3, B-6 y el patrón de memoria. **Propuesta:** **CSS puro para el eje responsive** +
  **estado abierto/cerrado en atributo consultable** (`aria-expanded`), que **evita el patrón
  `red-css-para-rama-solo-js-en-ssg`** (no hay rama de viewport en JS, y hornea «cerrado» en SSR). Si
  el humano mete rama JS de viewport: red CSS en el **mismo literal**, `getServerSnapshot` puro,
  **prohibido `ssgOptions.mock`**. **PENDIENTE DE PUERTA** — *decisión de producto y arquitectura.*
- **B-6** — Si hay menú móvil: **¿Radix `Dialog` o `<button aria-expanded>` + `<nav>`?** **Propuesta:**
  **NO Radix** —**cero usos en `src/` [V]**, `Dialog.Portal` **emite cero en prerender** y dejaría las
  puertas de anclas **CIEGAS [V]**, un menú no-modal no lo necesita— → **`radix-ui` SALE de
  `dependencies`**. **El humano puede preferir Radix**: si lo elige, **decidir `Portal` sí/no** (con
  `Portal`, **escenario obligatorio** que asevere los enlaces del menú en el HTML de `dist/`).
  **PENDIENTE DE PUERTA** — *decisión de arquitectura + dependencia.*
- **B-7** — `destacados` y `ofertas` son **HUÉRFANOS**: **0 features los construyen** **[V]**. ¿La nav
  los **ignora** (la igualdad de conjuntos de B-4 los deja fuera solo), o se registran como features /
  entradas de `no_se_construyen`? **PENDIENTE DE PUERTA** — *decisión de alcance del producto.*

---

### Feature 7: `hero_marca` — el h1 real, el `paintReveal` de estado base visible, y el LCP que NO es puerta unitaria

> Feature `#7` de `feature_list.json`. `depends_on: ["tokens_paleta_contraste", "cascaron_semantico"]`
> (F-03 y F-04, ambas `done`) **[V]**. Reestiliza el `<h1>{NOMBRE}</h1>` que F-04 dejó horneado
> (`src/pages/home.tsx:65` **[V]**) en un titular animado con **estado base visible**, corrige el
> `bob infinite` del prototipo (que incumple **SC 2.2.2, nivel A**) y deja el **LCP** como
> **verificación en vivo**, no como puerta unitaria.
>
> **Toda esta sección es coherente con `progress/f07_verificacion_previa.md`** (workflow adversarial,
> ~1,1 M tokens, 8 afirmaciones × verificar + refutar, con **3 agentes de medición sobre build SSG
> real + motor Chrome/CDP**: **0 refutadas de raíz, 6 matizadas, 1 confirmada por vía adversarial
> —A1—, 1 con un punto NO_VERIFICABLE clave —A2—**). Donde `feature_list.json` §7, el troceado de
> `docs/research/00-fase0-informe.md` o esta sección contradigan a esa verificación, **manda la
> verificación**. Se contradicen en **cinco puntos**: el **acceptance 6** (observer, no aplica), la
> **mezcla ≤1,2s/≤2,5s** del acceptance 5, la **duración de la animación** del acceptance 4, el
> **alcance del `bob`** y el **contenido del eyebrow** → **C-1, C-2, C-3, C-5, C-7**.
>
> Es el patrón de F-04, F-05 y F-06, **por cuarta vez**: *la decisión de fondo —un hero con h1 real y
> un reveal que no rompe SSG ni accesibilidad— es correcta; el «cómo» del troceado arrastra un
> acceptance que no aplica, una mezcla de dos métricas y una duración que retrasa el LCP.* **Ninguna
> decisión de fondo cae.**

#### Cómo se acordó esta sección — **declarado por escrito, sin fingir nada**

**No hubo conversación de spec con el humano para F-07, y esta sección no la simula.** El humano
**delegó** esta fase en el `craftsman_lead` **hasta la puerta de aprobación del `.feature`**, que
sigue **en pie** y es donde entran las **cinco** preguntas abiertas. La contraparte humana la
sostienen **decisiones ya registradas** —`docs/research/00-fase0-informe.md`, el patrón de memoria
`animacion/estado-base-visible-ssg-reduced-motion.md` y las de este documento (A-22 sobre el título,
A-16 sobre el contraste)— **más la verificación previa `progress/f07_verificacion_previa.md`**, que
hizo de adversario en lugar del humano: matizó o tumbó algo en cada una de las ocho afirmaciones, con
**medición en build SSG real y motor Chrome vía CDP** (reproducible en `.experimentos-tmp/f07-a3/`).

**Lo que esta sección NO puede cerrar** —y no cierra— es lo que cambia los criterios de aceptación,
la `puerta_legal` o `feature_list.json`. Eso es la puerta. Las cinco preguntas llevan la **propuesta
del lead** y están marcadas **PENDIENTE DE PUERTA HUMANA**. *(Se etiquetan `C-1..C-8` como en
`progress/f07_verificacion_previa.md` §0/§9; el reetiquetado a la serie `A-nn` del proyecto lo hace la
puerta, no esta sección.)*

#### Propósito

Que el **nombre del salón** se presente como un **`<h1>` real, visible y legible** —horneado visible
en el HTML de `dist/`, visible sin JS, visible bajo `prefers-reduced-motion`— y con una **animación
de revelado (`paintReveal`, CSS puro)** cuyo estado de reposo sea siempre el estado **final visible**,
sin movimiento que incumpla **SC 2.2.2 (A)** ni que sabotee el LCP.

#### Por qué existe — la `puerta_legal` y la a11y, **separadas en los TRES EJES** (C-4, C-5)

`feature_list.json` §7 declara `"puerta_legal": "WCAG SC 2.2.2 (A) · LCP ≤ 2,5s p75"`. Los dos son
ciertos, pero **miden cosas distintas y solo uno es puerta unitaria**. Y como en F-03/F-04/F-06, hay
que **separar la letra de la norma, la técnica suficiente y el criterio de proyecto**, porque
soldarlos es el fallo que este repo persigue (la *trampa gemela* de WCAG ya mordió tres veces).

##### 🔴 SC 2.2.2 (nivel A) — el `bob infinite` lo incumple **LIMPIAMENTE** (C-5)

- **(a) LETRA de la norma** — **SC 2.2.2 Pause, Stop, Hide, nivel A** **[V: w3.org/TR/WCAG22/]**,
  bullet «Moving, blinking, scrolling», literal:
  > *«For any moving, blinking or scrolling information that (1) starts automatically, (2) lasts more
  > than five seconds, and (3) is presented in parallel with other content, there is a mechanism for
  > the user to pause, stop, or hide it unless the movement … is part of an activity where it is
  > essential.»*

  El indicador «desliza» del prototipo (`bob 2.4s ease-in-out infinite`) cumple **las tres**
  condiciones: (1) arranca automático en la carga, (2) **`infinite` → dura > 5s**, (3) va en paralelo
  con el resto del hero; no es esencial y no tiene mecanismo de pausa → **incumplimiento limpio de
  nivel A [V]**. El `<button>↺ Repetir` del prototipo es control de **repetición**, NO de parada.
- **(b) TÉCNICA SUFICIENTE** — **quitar `infinite`** (`animation-iteration-count` finito). Con
  iteración finita ≤ 5s el movimiento deja de disparar 2.2.2.
- **(c) CRITERIO DE PROYECTO** — si el `bob` se hornea en F-07 o se aplaza. **El `paintReveal`
  (4,8s < 5s) NO dispara 2.2.2 [V]:** el único gancho de nivel A es el `bob` infinito. *(Higiene:
  `docs/research/audit-a11y.md:386` dice «para cumplir SC 2.2.2 en AA» — **2.2.2 es nivel A, no AA**;
  error de nivel en ese doc, no en el troceado.)*

##### `prefers-reduced-motion` es **CRITERIO DE PROYECTO, no WCAG A/AA** (C-4, decidido y declarado)

Ningún SC de nivel A/AA obliga a respetar `prefers-reduced-motion` para la animación de **carga** del
hero **[V]**: **SC 2.2.2 (A)** solo aplica a movimiento que *«lasts more than five seconds»* (el
`paintReveal` no lo dispara), y su remedio es *«un mecanismo para pausar/parar/ocultar»* —**no nombra
`prefers-reduced-motion`** (es una forma de cumplirlo); **SC 2.3.3 Animation from Interactions es AAA**
y solo cubre animación *«triggered by interaction»*, **no la de carga** **[V]**; y
`prefers-reduced-motion` **no desactiva nada por sí solo** —es un detector de preferencia, **el autor
debe escribir la `@media`** **[V: Media Queries L5]**. El prototipo **no la tiene** (medido: sin JS y
bajo `reduce` se traga los 4,8s + 4,4s).

> **Redacción FIJA para el contrato, el Gherkin y el código (C-4):** *«Por CRITERIO DE PROYECTO, bajo
> `@media (prefers-reduced-motion: reduce)` el hero se presenta en su estado final visible y legible
> sin movimiento residual.»* **PROHIBIDO** *«WCAG obliga»* o *«obligatorio»* a secas (todo
> «obligatorio» se lee «obligatorio **para** \<quién\>»). *El comentario «OBLIGATORIO» del CSS medido
> en `A3-estado-base.md §6` describe la técnica del proyecto, no una cita normativa.*

##### El LCP ≤ 2,5s p75 es la **norma**, pero **NO es puerta unitaria** (C-2)

**LCP ≤ 2,5s p75** es el umbral «bueno» de Core Web Vitals **[V: web.dev/articles/lcp, doc oficial de
Google]**. Pero **Vitest+jsdom no tiene layout ni paint** [V]: el número LCP real **no es testeable en
un test unitario** — es **[NV]/verificación en vivo con Chrome**. Lo que sí es puerta unitaria es el
**CSS estático** que lo condiciona (ver «El LCP en dos ejes»). *No es conflicto con el ≤1,2s: son dos
cosas distintas (C-2), y el contrato debe separarlas.*

**PROHIBIDO en este contrato:** atribuir a SC 2.2.2 un umbral de duración distinto de los «cinco
segundos» literales · llamar a `prefers-reduced-motion` obligación WCAG · escribir un número de LCP
como si fuera una aserción de build · llamar «obligatorio» al `@media reduced-motion` sin decir *para
el criterio de proyecto*.

#### El corazón: el **estado base visible bajo SSG** — y la **trampa medida** (C-3)

El patrón de memoria `animacion/estado-base-visible-ssg-reduced-motion.md` **decide el diseño**, y su
**patrón A** (animación por `@keyframes` autónomos) **aplica al hero** —contenido semántico, casi
seguro el LCP; ninguna de las 3 exclusiones del memo se cumple **[V, A3 §1]**—. El prototipo hace
**exactamente lo prohibido**, y está **MEDIDO** (build `vite-react-ssg 0.9.0` real + motor Chrome vía
CDP; `.experimentos-tmp/f07-a3/`):

- **El prototipo pinta el hero INVISIBLE al cargar, incluso SIN JS** **[V, medido]**. La causa exacta
  **no** es un oculto horneado en la base: es `animation-fill-mode: both` (que incluye `backwards`),
  que **durante el `animation-delay` aplica el keyframe inicial (oculto)** **[V: CSS Animations L1,
  `backwards`]**. Medido: «Studio» en `opacity:0` durante **4,4s**; «Nails Lash» recortado por
  `clip-path` durante el delay. Con JS deshabilitado el HTML estático **ya pinta invisible**
  (`getAnimations()==1`: las `@keyframes` corren sin JS).
- **El prototipo NO tiene `@media (prefers-reduced-motion: reduce)`** → quien pide menos movimiento se
  queda congelado invisible.

**La forma correcta FUNCIONA, MEDIDA** (A3 §3, caso B: bajo `reduce`, `getAnimations()==0` y el
elemento computa su base visible `clip-path: inset(0px)`, `opacity: 1`). La **forma EXACTA del CSS**,
en un **SCSS module** (NUNCA inline como el prototipo — el inline no admite base-visible ni `@media`),
**sin IntersectionObserver** (el hero es above-the-fold; el observer dejaría el contenido invisible
sin JS — C-1):

```scss
.heroMarca {                        /* el <h1>/marca: contenido semántico, es el LCP */
  clip-path: inset(0 0 0 0);        /* BASE = estado final VISIBLE (== 100% del keyframe) */
  animation: paintReveal <DUR> cubic-bezier(.5, 0, .25, 1) <DELAY> both;
}
@keyframes paintReveal {
  0%   { clip-path: inset(0 100% 0 0); }   /* OCULTO: SOLO aquí, jamás en la base */
  100% { clip-path: inset(0 0 0 0); }
}

.heroStudio {
  opacity: 1;                       /* BASE = VISIBLE explícito (no confiar en el default) */
  animation: fadeUp <DUR> <DELAY> both;
}
@keyframes fadeUp {
  0%   { opacity: 0; transform: translateY(20px); }   /* OCULTO: SOLO aquí */
  100% { opacity: 1; transform: translateY(0); }
}

/* Por CRITERIO DE PROYECTO (C-4) — es justo lo que el prototipo NO tiene */
@media (prefers-reduced-motion: reduce) {
  .heroMarca, .heroStudio { animation: none; }   /* -> se quedan en su BASE visible */
}
```

##### 🔴 LA TRAMPA MAYOR, MEDIDA: el estado base visible **NO acorta el reveal** (C-3, decisión de producto)

El patrón A garantiza el **reposo** seguro (reduced-motion / sin-JS / sin-animación), pero **NO
elimina la ventana invisible *durante* la animación para quien acepta movimiento**: con `both`+delay
el elemento sigue mostrando el `0%` oculto **durante todo el delay** **[V, medido A3 §3 caso C]**. **Si
el hero es el LCP, con la animación del prototipo (delay 0,5s + duración 4,8s) el titular se retrasa a
~5,3s.** → **El estado base visible es NECESARIO pero NO SUFICIENTE para un LCP bueno; hay que ACORTAR
la animación.** Es un trade-off de producto (animación de marca larga ↔ LCP), no un bug.

> **Propuesta del lead (C-3), PENDIENTE DE PUERTA:** **ACORTAR la animación a ≤1,2s totales** (delay
> ~0,1s + duración ~1s), como recomienda `docs/research/audit-perf.md` §3.6 (*«La animación debe
> recortarse a ≤1,2s»* **[V]**), para un LCP bueno; `<DUR>`/`<DELAY>` del SCSS de arriba los fija esta
> decisión. La alternativa es **mantener el reveal largo de marca** (reduced-motion ya da contenido
> instantáneo a quien lo pide). **NO** «arreglar» el delay con `fill-mode: forwards` (produce un salto
> visible→oculto→reveal) ni con delay negativo (arranca ya en el oculto) **[V, trampas medidas A3 §7]**.

#### El h1 real: **UN `<h1>`, dos `<span>`, y un text node `{' '}` de verdad** (medido)

- **Un solo `<h1>` con dos `<span>`**, reestilizando el `<h1>{NOMBRE}</h1>` de F-04 —**no** añadir
  otro: la puerta de cascarón (F-04) exige exactamente uno **[V, medido: `cuantosH1` cuenta etiquetas
  `<h1>`; spans dentro siguen siendo 1 h1]**. El `<div>Studio</div>` del prototipo es **INVÁLIDO
  dentro de un `<h1>`** **[V: HTML LS — h1 admite *Phrasing content*; `div` es *Flow content* sin
  phrasing]** → **`<span>`**. 🔴 **Trampa medida:** `cuantosH1` **NO valida el anidamiento** — un
  `<div>` dentro del h1 **pasa la puerta de F-04** pero es HTML inválido; F-07 lo evita en origen.
- 🔴 **El nombre accesible es «Nails Lash Studio» (17 caracteres) SOLO con un text node `{' '}` REAL
  entre los spans** **[V, medido con `dom-accessibility-api@0.6.3`]**: spans pegados o con
  whitespace-JSX → **«Nails LashStudio»** (sin espacio); un espacio **dentro** de un span se recorta.
  Y **jsdom miente sobre `display`** (da `""`, no `"inline"`), así que el caso robusto (text node de
  espacio) es el que mide **17 en ambos motores**.
- **Derivar de `NOMBRE`** (`src/lib/site.ts:13` = `'Nails Lash Studio'`, fuente única de F-02) por
  **`lastIndexOf(' ')` con guarda** → marca `'Nails Lash'` (`slice(0, idx)`) + tipo `'Studio'`
  (`slice(idx + 1)`). **`split(' ')` da 3 partes y NO sirve** **[V]**. Es un split de **presentación**
  frágil pero suficiente; la alternativa limpia (estructurar `{marca, tipo}` en `site.ts`) tocaría
  F-02, **fuera de alcance**. **La guarda** protege el caso sin espacio (`lastIndexOf` → `-1`): falla
  cerrada o degrada a un solo span, **nunca** compone «Nails LashStudio».
- **El titular usa `--ink`, NUNCA `--accent` como texto.** El par `--ink`/`--bg` **ya está** en
  `MATRIZ_DE_USO` (`src/lib/puerta-contraste.ts:247`, *«titular sobre el fondo»*, ratio **7,06**)
  **[V]** → **no hace falta fila nueva ni subir `MINIMO_DE_PARES`**. 🔴 **PELIGRO medido:** pintar el
  titular con `--accent`/`--brush` #C05576 como **texto** da **4,05 < 4,5 → puerta de contraste ROJA**
  **[V]**. Y **NO** añadir una rama «texto grande 3:1» para colar un rosa: reintroduce el mutante
  inmortal que F-03 evitó a propósito.
- **El eyebrow es un `<p>`, NUNCA un heading** (no compite con el `<h1>`). **No tiene fuente de datos
  hoy** — las categorías (Uñas · Pestañas · Cejas) son **F-09 (pending)**; `site.ts` no las tiene.
  **NUNCA hardcodear «Facial»** (no existe en este negocio **[V]**). → **C-7.**
- **NO envolver el hero en `<section>`.** El hero como `h1 + p` **sin** `<section aria-labelledby>`
  **NO activa la puerta de anclas de F-06** **[V, medido con `seccionesNavegables`]** — ni con un `id`
  suelto. Envolverlo en `<section>` la activaría y exigiría una entrada en la nav.

#### El LCP, separado en **DOS EJES** (C-2)

El acceptance 5 del troceado (*«El elemento LCP … es legible en ≤1,2s»*) **mezcla** la **duración de
animación** (≤1,2s, testeable) con el **LCP** (≤2,5s, norma no unitaria). Se separan:

- **EJE TESTEABLE (puerta unitaria).** El **CSS estático del hero**: (1) el estado base del titular
  **no tiene `opacity:0` ni `clip-path` oculto** —la base es el estado final visible—; (2) la
  **duración de la animación** está **acotada ≤ el límite que fije C-3**; (3) el **HTML prerenderizado
  de `dist/` (crudo, sin JS)** muestra el nombre **visible**, verificado con `readFileSync` sobre los
  BYTES, **NUNCA con jsdom** (*«Verde ≠ funciona»*, la regla que F-04 pagó cara). Esto es lo que F-06
  hizo con el `scroll-padding` y F-03 con los tokens: **leer el CSS/HTML estático y aseverar**.
- **EJE [NV] / VERIFICACIÓN EN VIVO CON CHROME.** El **número LCP real**; y **si el `clip-path` deja
  el titular fuera del LCP**. Esto último es **NO_VERIFICABLE en fuente primaria [V, A2]**: web.dev
  solo documenta la exclusión de `opacity:0`; la spec de **Largest Contentful Paint / Element Timing
  del W3C mide el texto por su *border box ∩ viewport***, que **NO cambia con `clip-path`** — la LETRA
  de la spec más bien **refuta** la equivalencia. Chromium *podría* anular el área vía el clip del
  property tree, pero **depende de si la animación está compositada y del timing → solo medible en
  Chrome real**. **F-07 estrena una fase de verificación EN VIVO con Chrome** (extensión aportada por
  el humano) **tras el TDD**: medir el LCP real, el clip-path vs LCP, el hero bajo reduced-motion y el
  reflow a 320px (donde `clamp(50px,11.5vw,142px)` hace floor en 50px — SC 1.4.10, AA).

#### Alcance — qué construye F-07, qué NO, y las **deudas declaradas**

- **El corazón es el `paintReveal` (CSS puro), NO el `brush.png`** **[V, A6]**. La «animación de
  pincel» del título de F-07 es el **`paintReveal`** (el `clip-path` que revela el texto como una
  pincelada) — **efecto SOLO-CSS, cero asset**. El **`brush.png`** es un adorno físico separado
  (`alt=""`, `pointer-events:none`) y **se APLAZA fuera de F-07**: no es esencial y meterlo solo añade
  un binario a `dist/` que alimenta la **deuda de binarios declarada de F-01** (su puerta lee todos
  los ficheros utf8 sin filtro de extensión), sin ganar nada que F-07 exija. Candidato a **F-17** o a
  descartar; si algún día se quiere, **SVG inline, nunca PNG** (ni origen externo ni binario).
- **El indicador «desliza» (`bob`)** → **C-5**: si F-07 lo hornea, **sin `infinite`** (iteración
  finita); **o aplazarlo a F-08** (que sí introduce scroll). No es esencial para el hero.
- **El acceptance 6 (IntersectionObserver) NO aplica** → **C-1: retirarlo.** El hero es
  above-the-fold: no hay nada que «entre en vista». Medido: `grep -rin IntersectionObserver src/` =
  **0** **[V]**. Es **herencia del patrón B** (scroll-reveal de F-08+); meter un observer aquí sería
  **producción sin motivo (Ley 1)** y dejaría el hero invisible sin JS.
- **Deuda declarada (C-8):** el `dist` **preloadea 12 fuentes** (Manrope 400/500/600/700 + Gilda 400 +
  Great Vibes 400, cada una **woff2 Y woff**), todas con `type="font/woff2"` **incluso los 6 `.woff`**
  (el bug de `renderPreloadLink` de vite-react-ssg que F-06 documentó). *«Preload de todo = preload de
  nada»*: esa contienda por el ancho de banda crítico **puede dañar el propio LCP del titular**. Es
  territorio **F-05/F-20**, pero **impacta el presupuesto de LCP de F-07** → **deuda declarada**. *(A
  favor del LCP: `font-display: swap` **desbloquea** el LCP —el titular se pinta de inmediato en la
  fuente de fallback— **[V: web.dev/articles/optimize-lcp]**.)*

#### El choque con las cinco puertas `done` — **medido** (A8)

- **CASCARÓN (F-04):** `cuantosH1` cuenta `<h1>` → los spans dentro siguen siendo **1** h1 [medido];
  el `<Head>` (title/description/canónica/JSON-LD) queda **intacto**. 🔴 Pero `cuantosH1` **no valida
  el anidamiento** (un `<div>` en el h1 pasaría) → F-07 usa `<span>` en origen.
- **CONTRASTE (F-03):** el par `--ink`/`--bg` **YA ESTÁ** (línea 247, ratio 7,06) → **no tocar
  `MINIMO_DE_PARES`** si el titular usa `--ink`. 🔴 `--accent`/`--brush` como texto = **4,05 < 4,5 →
  ROJA** [medido].
- **TERCEROS (F-05):** Great Vibes ya está en `PARES_DE_FUENTE_ESPERADOS`; el hero no introduce
  origen externo (el brush se aplaza). **No toca.**
- **ANCLAS (F-06):** el hero `h1 + p` **sin** `<section>` no activa la igualdad de conjuntos [medido].
  **No toca.**
- **PLACEHOLDERS (F-01):** el hero no hornea patrón ni binario (el brush se aplaza). **No toca.**
- **STRYKER/VITEST:** si F-07 crea `src/components/Hero.tsx`, **añadirlo a mano a `mutate` de
  `stryker.config.json`** (lista explícita) **Y** a `coverage.include` de `vitest.config.ts` (hoy
  `['src/lib/**/*.ts']`, que excluye todo `.tsx`) — **dos listas**. El estado condicional (si lo hay)
  va en **atributo consultable, NUNCA en `className` condicional** (invariante heredado de F-06,
  medido inmatable). Los **atributos JSX literales NO generan mutantes**: los aseveran los tests, no
  Stryker. La **lógica** que sí muta es la **derivación de `NOMBRE`** (el `lastIndexOf` + la guarda).

#### Contrato

**`src/lib/`** — la derivación PURA marca/tipo (mutable):

| | |
| - | - |
| **Entrada** | `NOMBRE` (la cadena de la fuente única F-02). **No lee ficheros, ni el reloj, ni `process.env`**: recibe la cadena que examina (precedente F-01..F-06) |
| **Salida** | `{ marca, tipo }` por `lastIndexOf(' ')`: `marca = slice(0, idx)`, `tipo = slice(idx + 1)`. Para `'Nails Lash Studio'` → `{ 'Nails Lash', 'Studio' }` |
| **Guarda** | Sin espacio (`lastIndexOf` → `-1`) → **falla cerrada o degrada a un solo span**; **jamás** compone «Nails LashStudio» ni indexa con `-1` |
| **Determinismo** | Misma entrada → misma salida |

**Hero (marcado, `.tsx`):** un `<h1>` con dos `<span>` **y un text node `{' '}` REAL entre ellos**
(nombre accesible «Nails Lash Studio» = 17 car., medido en ambos motores); un **`<p>` eyebrow** (sin
contenido de datos hoy — C-7); **titular con `--ink`**; **sin `<section>`**; **sin
IntersectionObserver**. Lo aseveran los **tests** (nombre accesible, un solo h1, HTML crudo de
`dist/`), no Stryker (los atributos literales no mutan).

**`Hero.module.scss` (Capa CSS):** la forma EXACTA de arriba — **base visible explícita**, **oculto
solo en el `0%`**, **`@media (prefers-reduced-motion: reduce){ animation: none }` (criterio de
proyecto)**, **duración ≤ el límite de C-3**. No es mutable (Stryker no ve SCSS); lo asevera un **test
que lee el SCSS** (como `tokens.test.ts`), **no un número inventado hoy**.

**Puerta / verificación:** el eje testeable (base visible, sin `opacity:0`/`clip-path` oculto en la
base, duración acotada, HTML crudo de `dist/` con el nombre visible sin JS) es **puerta unitaria**; el
**número LCP y el clip-path vs LCP** son **[NV] / verificación EN VIVO con Chrome** tras el TDD.

#### Casos límite debatidos

1. **HTML prerenderizado sin JS → el nombre del salón VISIBLE.** Es el fallo central del prototipo
   (invisible al cargar, incluso sin JS). Se asevera sobre el **HTML crudo de `dist/`**, no jsdom.
   **Escenario obligatorio.**
2. **`prefers-reduced-motion: reduce` → hero completo y legible, sin movimiento residual.** El
   prototipo se queda congelado invisible (no tiene la `@media`). Criterio de proyecto (C-4).
3. **El estado base del titular NO tiene `opacity:0` ni `clip-path` oculto** — el oculto vive **solo**
   en el `0%` del keyframe. Aserción sobre el CSS estático.
4. **`NOMBRE` sin espacio → la guarda no compone «Nails LashStudio» ni indexa con `-1`.** El caso que
   mata el split de presentación frágil.
5. **Nombre accesible = «Nails Lash Studio» (17 car.)** con el text node `{' '}`; **spans pegados →
   «Nails LashStudio» (16 car., sin espacio) → FALLO.** El caso que la medición reveló.
6. **`bob infinite` → violación de SC 2.2.2 (A);** iteración finita → conforme. Aplica solo si C-5
   decide hornear el `bob` en F-07.
7. **Titular con `--accent` como texto → 4,05 < 4,5 → puerta de contraste ROJA.** El titular usa
   `--ink`. El caso que blinda contra reintroducir el mutante inmortal de F-03.
8. **Duración de animación por encima del límite de C-3 → FALLO del eje testeable.** El LCP real es
   [NV]/en vivo, pero la **duración** sí es puerta.
9. **El hero envuelto en `<section>` → activaría la puerta de anclas de F-06.** No se envuelve;
   deslinde declarado para que nadie «mejore» el marcado y rompa F-06.

#### Modos de error

- **Nombre horneado invisible / oculto en la base / duración fuera de límite** → **fallo del eje
  testeable** (exit ≠ 0 en la puerta o rojo en el test), **nunca verde**.
- **`NOMBRE` sin espacio** → la derivación **falla cerrada o degrada a un solo span**, con mensaje que
  acusa; **jamás** un nombre accesible corrupto.
- **Titular sobre un par de contraste < mínimo** → lo caza la **puerta de F-03** (build roto), no F-07.
- El **número LCP** **no** produce un modo de error de build: es verificación **en vivo** (declarado).

#### Mutantes que deben morir (I-6, umbral 1.0)

- **El `lastIndexOf(' ')` y la guarda** (índice, `slice(0, idx)` vs `slice(idx + 1)`, la rama sin
  espacio) → mueren en el escenario del nombre accesible «Nails Lash Studio» **y** en el negativo (sin
  espacio). Es **la única lógica mutable** de F-07 (el resto es CSS + JSX literal).
- 🔴 **NO se puede predecir el conjunto exacto de mutantes ni de equivalentes:** el fichero de F-07
  **no existe** todavía; **otra implementación tendrá otro conjunto. Se mide cuando exista, no antes**
  (la lección de F-05 con «exactamente dos equivalentes» sería una PREDICCIÓN, no una medición). El
  `.feature` **nombra mutadores reales de Stryker 9.6.1**, jamás `.includes` (no existe ese mutador
  **[V]**).

**Higiene de medición, no negociable** (`docs/verification.md`): añadir `Hero.tsx` y la lógica de
derivación a `mutate` de `stryker.config.json` **Y** a `coverage.include` de `vitest.config.ts` · todo
cálculo dentro del `it` (`perTest`) · leer `# timeout` y `tests per mutant` **antes** que el score ·
una sola tanda de Stryker · acotar con `--mutate <fichero>`, **JAMÁS con `--testFiles`**. **Y el
primer `pnpm build` real es OBLIGATORIO** **[NV]**: todo lo anterior se midió sobre experimentos y
funciones puras, no contra el `dist/` de F-07 — *«Verde ≠ funciona»* (I-8) manda sobre todo lo escrito
aquí.

#### Preguntas abiertas de esta feature — **PENDIENTE DE PUERTA HUMANA**

**Las CINCO van a la puerta. El lead propone; NO cierra ninguna.** *(C-4 —reduced-motion como criterio
de proyecto— y C-8 —deuda del preload de fuentes— quedan **decididas y declaradas** arriba, no van a la
puerta; el resto de decisiones medidas —h1 con dos spans + `{' '}`, `--ink`, sin `<section>`, brush
aplazado, `Hero.tsx` a `mutate`— también.)*

- **C-1** — El **acceptance 6 (IntersectionObserver)** **NO aplica** al hero (above-the-fold; es del
  patrón B de F-08+; `grep` = 0 **[V]**). **Propuesta:** **retirarlo.** **PENDIENTE DE PUERTA** —
  *cambia un criterio de aceptación.*
- **C-2** — El **acceptance 5** **mezcla** ≤1,2s (duración de animación, testeable) con LCP ≤2,5s
  (norma). **Propuesta:** **separarlos** — el CSS estático (base visible + duración acotada + HTML
  crudo sin JS) es **puerta unitaria**; el **número LCP real y el clip-path vs LCP** son **[NV] /
  verificación EN VIVO con Chrome**. **PENDIENTE DE PUERTA** — *cambia el criterio y define qué es
  puerta vs en-vivo.*
- **C-3** — 🔴 **DECISIÓN DE PRODUCTO:** el estado base visible **no acorta el reveal**; con la
  animación del prototipo (delay 0,5s + 4,8s) el LCP del titular se retrasa a **~5,3s [V, medido]**.
  **¿Se ACORTA la animación a ≤1,2s totales** (delay ~0,1s + duración ~1s, como recomienda el audit,
  para un LCP bueno) **o se mantiene el reveal largo de marca?** **Propuesta:** acortar a ≤1,2s.
  **PENDIENTE DE PUERTA** — *trade-off de producto: animación de marca ↔ rendimiento.*
- **C-5** — El indicador **«desliza» (`bob infinite`)** incumple **SC 2.2.2 (A) [V]**. **Propuesta:**
  si F-07 lo hornea, **sin `infinite`** (iteración finita); **o aplazarlo a F-08** (depende de que
  haya scroll). **PENDIENTE DE PUERTA** — *alcance + decisión de a11y.*
- **C-7** — El **eyebrow** no tiene fuente de datos hoy (las categorías son **F-09**). **Propuesta:**
  **aplazar el contenido a F-09** y dejar en F-07 solo la estructura (`<p>`); alternativa, reutilizar
  `RECLAMO` (`src/lib/seo.ts:17` = *«Uñas, pestañas y cejas en Las Rozas de Madrid»*). **NUNCA
  hardcodear «Facial».** **PENDIENTE DE PUERTA** — *alcance/producto.*

---

### Las 13 features restantes

**No se especifican aquí a propósito.** Están troceadas, con sus criterios de aceptación,
sus dependencias, su puerta legal, su flag `mutable` y su estado, en **`feature_list.json`**;
y su razonamiento —qué entrega cada una, qué lógica testeable tiene, por qué está bloqueada
y en qué orden va— en **`docs/research/00-fase0-informe.md` §7** (troceado razonado, con
fuentes). Duplicarlo aquí solo garantiza que las dos copias se contradigan.

**Camino crítico** (§7): `F-01` → `F-02` → `F-03` → `F-04` → `F-05` → `F-07` →
`F-09`(placeholder) → `F-11`/`F-12`. Es decir: **puerta de placeholders → datos → tokens
accesibles → cascarón semántico → cero terceros → hero → catálogo → contacto**. Con eso hay
una home real, honesta, accesible y enseñable, **sin un solo dato del cliente y sin poder
publicarla por accidente**. Nótese que **ninguna de las cinco primeras es maquetación**.

Cada feature con `"sdd": true` pasa por su propia conversación de spec (este documento se
amplía con una sección por feature), su destilación Gherkin y **la puerta de aprobación
humana** antes de que se escriba una línea de producción. Las marcadas `blocked` —`F-16`
páginas legales, `F-17` pipeline de imágenes, `F-18` equipo, `F-19` probador— **no empiezan
spec** hasta que se desbloqueen; `F-18` por decisión expresa (T-4).

### Feature 22: `galeria_carrusel` — el carrusel en domo con autoplay accesible

> Feature `#22` de `feature_list.json`, nacida de un encargo directo de Pablo (2026-07-22):
> transformar el carrusel plano de la demo (PR #5) en un **coverflow 3D** «como el de
> animmasterlib.dev/sliders», con **autoplay** y pausa al interactuar.

#### La conversación de spec (resumen; la puerta humana vive en `feature_list.json` §22)

Tres decisiones las tomó Pablo en conversación: **silueta domo ∩** (centro elevado, lados
caen), **4 s por foto**, y **móvil con 3D suavizado y vecinas asomando**. El resto quedó
**delegado explícitamente** («hazlo tú el 100 % de forma autónoma»). Dos consecuencias
técnicas se le comunicaron en el momento: el autoplay obliga a un **botón visible de
pausa** (SC 2.2.2, nivel A — pausar solo con hover no basta), y el paso a 3D pierde el
deslizamiento táctil del `scroll-snap`, que se repone con Pointer Events.

#### Dónde vive la especificación de verdad

La spec detallada —investigación W3C/APG/WCAG con fuentes, las cinco decisiones críticas
(sin `preserve-3d`, doble módulo, `transition: none` en la oculta, ángulos saturantes,
botón sin `aria-pressed`), las trampas medidas del entorno y el presupuesto de escenarios—
está en **`progress/galeria_coverflow_diseno.md`** (el brief que consumieron
`gherkin_author` y `tdd_craftsman`), y el contrato ejecutable en
**`features/galeria_carrusel.feature`**. Duplicarlos aquí garantizaría la contradicción;
esta sección existe para que el checkpoint C6 tenga su entrada y el lector sepa dónde
seguir leyendo.

---

### Feature 23: `nailbot_chat_compartido` — el chat de `#reserva` pasa a ser Nailbot: un solo cerebro PURO, honesto y sin red, para la sección y para el robot

> Feature `#23`. **Aún sin entrada en `feature_list.json`** (la crea el `craftsman_lead`; esta sección no
> toca ese fichero). Nace del encargo de Pablo del **2026-09-27** («Robot pintándose las uñas esperando a
> que pidan cita… enlazado con un ChatBot de IA… no lo implementes con servidor todavía») y es la mitad
> **sin robot** de ese encargo: el cerebro y la cara del chat. La otra mitad —el robot flotante— es
> **F-24**, que depende de esta.
>
> **Fuente de verdad del copy y de los nombres de artefacto: `progress/nailbot_diseno.md`** (el brief:
> §2 = decisiones del humano **H1–H8**, §3 = decisiones del lead **L1–L16**, §4 = copy **LITERAL**, §5 =
> ficheros, §6 = fuera de alcance). Investigación con fuentes oficiales y fecha:
> `docs/research/asistente-robot/01-legal.md` … `06-diseno-servidor-futuro.md`. **Esta sección no
> reescribe el copy**: cita los literales tal cual o remite al brief §4. Si un literal de aquí y uno del
> brief difieren, **manda el brief**; si esta sección señala un hueco del brief (HS-n), **manda la
> puerta humana**.

#### Cómo se acordó — declarado, sin fingir

La conversación con el humano **la condujo el `craftsman_lead`** con `AskUserQuestion` el 2026-09-27; sus
respuestas son **H1–H8** del brief, y las decisiones técnicas que el lead tomó con ellas, **L1–L16**. El
`spec_partner` **no simula** un debate que no tuvo: destila H/L en contrato comprobable y, donde el brief
deja algo sin cerrar o choca con el repo, lo escribe en **«Huecos detectados por spec_partner»** (HS-1 a
HS-7), cada uno con su propuesta y **PENDIENTE DE PUERTA HUMANA**. Nada de lo que va a la puerta se da
por resuelto aquí.

#### Propósito

Que quien quiere cita **componga su solicitud en cuatro pasos de opciones cerradas** (tres si elige
sábado) con un asistente que **dice lo que es** —automático, de demostración, ni persona ni IA—, que **pide
el mínimo** —nombre opcional, nunca teléfono— y que **no envía nada por sí mismo**: al terminar le entrega
un enlace de WhatsApp con el mensaje redactado, **que ella decide enviar**; y que **ese mismo cerebro**
sirva, sin duplicarse, en `#reserva` y en el panel del robot (F-24).

#### Qué cambia respecto al chat de hoy (`src/components/Reserva.tsx:31-179`)

| Hoy **[V]** | Con F-23 | Por qué |
| --- | --- | --- |
| Cabecera «Nails Lash Studio» + «en línea» + avatar de letras «nl» | «Nailbot» + «Asistente automático · demo» + avatar `NailbotArte` **estático** | **L1**: «en línea» afirma un agente que no existe (`feature_list.json` → `no_se_construyen`, «#reserva (chat simulado)») |
| Sin leyenda | Leyenda visible **siempre**, dentro del chat | **L1** + política de datos demo marcados. Cierra la **D1** que `reserva_chat.feature:543-554` dejó abierta |
| Día «Este fin de semana» | «Un sábado» | El domingo está cerrado **[V: `HORARIO.domingo = 'cerrado'`, `site.ts:34`]**: «fin de semana» ofrecía un día sin servicio |
| El sábado pregunta la franja, incluida «Por la tarde» | El sábado **no** pregunta la franja y lo explica con el dato de F-02 | **L6**. Es el defecto que `reserva_chat.feature:64-66` reconocía por escrito («puede ofrecer "Por la tarde" un día que el salón cierra») |
| Nombre obligatorio | Nombre **opcional** («Prefiero no decirlo») | **L2** (RGPD art. 5.1.c) |
| Resumen «Te confirmaremos la hora exacta por WhatsApp. ¡Te esperamos…!» | Resumen que dice lo que de verdad ocurre: pulsas, lo envías tú y allí te confirman | **L1** / **D-3**: el chat no confirma nada |
| Ningún aviso de datos | Aviso de **capa 1** justo encima del enlace final, **sin enlace** | **L3**; provisional hasta F-16 (HS-1, A-23) |
| Guion y avance dentro del `.tsx` | Cerebro **puro** `responder` en `chat-nailbot-logica.ts`; copy en `src/lib/demo/nailbot-demo.ts` | **L4** (la costura del servidor futuro) + `eslint.config.js:24` (un `.tsx` solo exporta el componente) |
| Un chat, en un sitio | **Un** componente `ChatNailbot`, **dos** instancias con estado independiente | **H2**, **L5** |

#### Contrato

**1. `ChatNailbot`: lo que ve y hace la persona.** Orden en el DOM, de arriba abajo:

| Zona | Contenido | Reglas |
| --- | --- | --- |
| Cabecera | `NailbotArte` estático + «Nailbot» + «Asistente automático · demo» | El avatar lleva `aria-hidden="true"` y no aporta nada al nombre accesible. **Ningún** `<h1>`–`<h6>`: el título del diálogo lo pone F-24 fuera de `ChatNailbot`, y en `#reserva` el `h2` ya existe |
| Leyenda | «Demo · Nailbot responde con opciones predefinidas: no es una persona ni usa inteligencia artificial.» | Visible **siempre**: al montar, a mitad, al terminar y tras reiniciar. Texto real. **No** es una burbuja (sin `data-de`) |
| Hilo | Burbujas con `data-de` = `bot` o `usuario`, **hijas directas** del nodo del autoscroll | Solo se añade al final. Estilo por `claveBurbuja` y autoscroll por `desplazarAlFinal`, **reutilizadas sin moverlas** de `reserva-logica.ts` (L5) |
| Pie | Según el paso: chips de opción · en el paso nombre, campo «Tu nombre» (placeholder «Escribe tu nombre…») + botón «Enviar» + chip «Prefiero no decirlo» · al terminar, aviso de capa 1 → enlace «Enviar la reserva por WhatsApp» → botón «Reservar otra cita» | Al montar: **0 enlaces y exactamente 3 botones** (lo exigen @s2 y @s10 de `reserva_chat`). `ChatNailbot` **nunca** trae botón de cerrar ni de minimizar: cerrar el panel es cosa de F-24 |

**2. El guion como máquina de estados.** Las frases están en el brief §4; aquí solo van las transiciones:

```
servicio ──opción──▶ día ──«Entre semana» o «Lo antes posible»──▶ franja ──opción──▶ nombre
                      └──«Un sábado»──▶ [regla del sábado: franja = «Por la mañana»] ──(mismo turno)──▶ nombre
nombre ──nombre válido (trim ≠ '') o «Prefiero no decirlo»──▶ final ──«Reservar otra cita»──▶ estado inicial EXACTO
```

- Cada opción elegida aparece como burbuja **de la persona** (como hoy, @s11). La franja que impone el
  sábado **no**, porque nadie la eligió (HS-2).
- Nombre vacío o de solo espacios → **nada cambia** (como hoy, @s14). Saltarse el nombre es **explícito**
  («Prefiero no decirlo»), nunca un «Enviar» vacío: así un Enter accidental no decide por ella.
- La frase del sábado **deriva de `HORARIO.sabado`** (F-02) sustituyendo «-» por « a ». Con el dato de hoy
  (`'10:00-14:00'` **[V]**) es «Los sábados abrimos de 10:00 a 14:00, así que te busco hueco por la
  mañana.» **Prohibido** el literal «10:00-14:00» o «10:00 a 14:00» en `nailbot-demo.ts`, en la lógica o en
  el `.tsx` (L6). La guarda del formato y el coste de la inferencia «solo mañana» están en HS-3.

**3. `responder`: la costura (L4)**, en `src/components/chat-nailbot-logica.ts`.

| | |
| - | - |
| **Entrada** | `estado` (dato plano: mensajes, paso, respuestas, fin) + `entrada` (lo que hizo la persona: elegir una opción, enviar un nombre, reiniciar) |
| **Salida** | El estado **siguiente**, como objeto nuevo. La entrada **no se muta** (se asevera con un estado congelado) |
| **Pureza** | Sin reloj, sin azar, sin red, sin storage, sin DOM. Mismo par → mismo resultado |
| **Horario** | La frase del sábado se calcula **en la llamada**, jamás en la carga del módulo: un derivado en la carga es un mutante estático que el runner no activa (trampa medida, `hero-logica.ts:10-12`, `05` §3) |
| **Copy** | Importa los literales de `nailbot-demo.ts`; no escribe copy propio |
| **Lo que NO es** | Ni interfaz, ni adaptador, ni `async`. La costura **es la firma** (L4). Qué garantiza y qué no el día del servidor: HS-7 |

El borrador del campo de nombre es estado **de UI** y se queda en el componente. La validación
(`trim() === ''` → el mismo estado) sí vive en la función pura, para que Stryker la muerda por valor.

**4. `mensajeReserva` ampliada** (`reserva-logica.ts`, **sin moverla**, L5):

- **Con nombre: byte a byte el texto actual.** Las dos filas de `reserva_chat.feature` @s23 siguen verdes
  sin tocarlas.
- **Sin nombre:** la variante literal del brief §4.
- «Sin nombre» = **campo ausente** (propuesta de spec_partner: `nombre` opcional en `SolicitudReserva`).
  Nunca «Me llamo undefined», nunca «Me llamo  y». Casa con el acceptance de F-13 «omite los campos
  ausentes sin escribir undefined».
- **Descartadas:** una segunda función `mensajeReservaSinNombre` (dos sitios donde divergir) y la cadena
  vacía como marca de «sin nombre» (confunde «no lo dijo» con «lo dejó en blanco», que la UI ya descarta).

**5. Salida a WhatsApp (L15).** `waHref(TELEFONO.legible, mensajeReserva(…))` en un `<a>` **sin
`target`**, presente **solo** en el estado final. `ChatNailbot.tsx` **no** contiene número ni host, y ningún
test asevera el host (A-10). Cero `fetch`, cero storage, cero analítica. El guion no navega ni abre nada
por sí solo.

**6. `NailbotArte`: la parte de F-23 (estática).**

- SVG inline con la **geometría y los colores** de `nailbot-prototipo.html:147-231` (nada más del
  prototipo: ni su copy ni su CSS de estado, HS-15), `aria-hidden="true"` y `focusable="false"`, **sin**
  `<title>`, **sin** `<defs>` y **sin ningún `id`**: el arte aparecerá varias veces en la misma página (L9).
- Pose = **estado final visible**: uñas pintadas, pincel en el bote (I-4).
- Su paleta decorativa (`--nb-*`: el rojo de labios y uñas, el oro rosa…) vive en
  `nailbot-arte.module.scss`, **no** en `_tokens.scss`. Es decoración dentro de un SVG oculto a la AT, no
  texto ni borde de control, y la puerta de contraste solo lee `_tokens.scss` (`05` §4, «El rojo de los
  labios»). La fijan tests de bytes.
- **Sin atributo de animación, nunca se mueve**, ni siquiera en `no-preference`. F-24 animará **solo** la
  instancia del lanzador. El avatar de la cabecera del chat, que viaja **horneado** en `#reserva`, no se
  mueve jamás: si se moviera en bucle, sería un SC 2.2.2 sin control de pausa en `#reserva`.

**7. Invariantes (se aseveran, no se suponen).**

- Ningún `<section>`, `<nav>` ni heading en `ChatNailbot` ni en `NailbotArte` (puertas 1 y 5, `05` §1).
- Estado inicial **determinista** → el SSG lo hornea como hoy (`reserva_chat` @s9).
- Si hace falta algún `id` (p. ej. para un `aria-describedby`), sale de `useId` y **nunca** de un literal:
  habrá dos instancias en la página.
- Ningún literal de la lista negra de F-01 en guion, SVG, SCSS ni comentarios (`05` §1, puerta 2: el guion
  viaja en el JS aunque el panel no se hornee).
- Ninguna fila nueva en `MATRIZ_DE_USO`; `MINIMO_DE_PARES` sigue en **18** (`reserva_chat` @s21, HS-5).

#### Casos límite

1. **«Un sábado»** → burbuja «Un sábado», frase del sábado y pregunta del nombre; **ninguna** burbuja de
   franja de la persona. El resumen y el mensaje dicen «Un sábado · Por la mañana» (HS-2).
2. **`HORARIO.sabado` que no es un rango `HH:MM-HH:MM`** (p. ej. `'cerrado'`) → jamás «Los sábados abrimos
   de cerrado» (HS-3).
3. **«Prefiero no decirlo»** → resumen y mensaje **sin nombre**, sin «undefined» y sin dobles espacios.
4. **Nombre vacío o de solo espacios** → el hilo no cambia (hoy, @s14).
5. **Nombre «Mª Ángeles & Co.»** → se interpola tal cual; React escapa; nunca `dangerouslySetInnerHTML`
   (hoy, @s20).
6. **Nombre muy largo** → se interpola entero, **sin** `maxlength` (como hoy). Declarado: no se trunca.
7. **Reiniciar** tras un recorrido con sábado y sin nombre → el estado inicial **exacto**: una burbuja, tres
   opciones, sin campo, sin aviso y sin enlace.
8. **Dos instancias en la misma página** → actuar en una no cambia la otra (L5).
9. **SSR sin JS** → cabecera, leyenda, **una** burbuja (el saludo nuevo) y tres opciones; ni campo, ni
   aviso, ni enlace.
10. **Antes de terminar** no existen ni el aviso ni el enlace final: el aviso acompaña al enlace (L3).
11. **Enter** en el campo envía; **cualquier otra tecla**, no (hoy, @s16).
12. **Emoji del copy** («💅», «✨») → el lector de pantalla los nombra. Es copy literal decidido: no se toca.

#### Decisiones (con su porqué)

| # | Decisión | Alternativa descartada | Porqué |
| - | --- | --- | --- |
| **H1 · L4** | Panel de chat → WhatsApp con guion local; la costura del servidor es la **firma** de `responder` | Un adaptador «remoto» especulativo; llamar a la API desde el navegador | Patrón de memoria: herencia sin uso = deuda muerta. Una clave en GitHub Pages **es pública** (`06` §0, `03` §A) |
| **H2 · L5** | **Un** componente, dos instancias **independientes** | La «vía barata» de `05` §5: un chat nuevo que no toca `Reserva.tsx` | El humano pidió **un** asistente. La vía barata duplicaría guion y copy, y acabarían divergiendo. El coste (enmendar `reserva_chat`) está medido en `05` §5 |
| **L1 · H6** | Se llama Nailbot, se presenta como «asistente automático» y **nunca** como IA; leyenda visible | Anunciarlo como «ChatBot de IA», como decía el encargo | Un guion fijo **no es sistema de IA** (AI Act art. 3.1, cons. 12; Directrices del art. 50 §30.i **[V: `01` §2]**) → el art. 50.1 no obliga hoy, pero llamarlo IA sería engañoso (Directrices §50 **[I: `01` §2.3]**). El robot como avatar es correcto porque no es figura humana (§38) |
| **L2** | Opciones cerradas + nombre opcional; **nunca** teléfono ni texto libre | Pedir el teléfono (el prototipo); una pregunta abierta «¿algo más?» | RGPD art. 5.1.c; WhatsApp ya aporta el número; el texto libre invita a datos de salud (art. 9) **[V: `01` §3.1]** |
| **L3** | Capa 1 encima del enlace final, **sin enlace** | Aviso con enlace a `/privacidad`; no poner aviso hasta F-16 | La ruta no existe → la anti-404 de F-04 rompería el build. No poner nada deja el statu quo: **cero** aviso. Queda incompleto: HS-1 |
| **L6** | Sábado sin franja, explicado **con el dato** de F-02 | Literal «10:00-14:00» en el guion; preguntar la franja igual | I-7, fuente única. Ofrecer «Por la tarde» un sábado es ofrecer lo que no hay |
| **L15** | Solo `waHref` en un `<a>` que pulsa ella; sin `target` | Abrir WhatsApp automáticamente al terminar; `fetch` | D-3: es honesto **porque lo envía ella** |
| **spec_partner** | «Un sábado» sustituye a «Este fin de semana» | Mantener «Este fin de semana» | El domingo está cerrado **[V]** |
| **spec_partner** | Saltarse el nombre solo con «Prefiero no decirlo», nunca con un «Enviar» vacío | Tratar el envío vacío como «sin nombre» | Un Enter accidental no debe decidir por ella, y @s14 sigue intacto |

#### La enmienda de `features/reserva_chat.feature` (L5)

Convención de la ENMIENDA 4 de la galería: **ningún tag se renumera ni se reutiliza**; un escenario
retirado conserva su cuerpo histórico con el título marcado `[RETIRADO <fecha>, F-23]`, y uno ajustado
marca qué `Then`/`And` cambia. Inventario contrastado contra el contrato vigente **[V]**:

| @s | Estado | Qué cambia |
| --- | --- | --- |
| @s1–@s6 | **INTACTOS** | `ChatNailbot` no trae headings ni enlaces al montar, y no va antes de la rejilla |
| @s7 | **AJUSTADO** | El ancla positiva pierde `.chat`, `.chatCabecera`, `.hilo`, `.chipChat`, `.entrada` y `.reiniciar`: se mudan a `chat-nailbot.module.scss`, que gana su propio test de bytes |
| @s8 | **RETIRADO** | «Nails Lash Studio» + «en línea» + avatar «nl». Lo sustituye el escenario de cabecera de F-23 |
| @s9 | **AJUSTADO** | El literal del saludo |
| @s10 | **INTACTO** | Siguen siendo exactamente «Uñas», «Pestañas» y «Cejas» |
| @s11 | **AJUSTADO** | La pregunta del paso 2 y la opción «Un sábado» |
| @s12 | **AJUSTADO** | Las cuatro preguntas; la fila 4 ya **tiene** una opción («Prefiero no decirlo») |
| @s13 | **AJUSTADO** | «NO se muestra ningún botón de opción» pasa a «se muestra **exactamente** "Prefiero no decirlo"» |
| @s14 | **INTACTO** | Las siete burbujas del `Given` valen en el camino sin sábado |
| @s15 | **AJUSTADO** | El literal del resumen |
| @s16 | **INTACTO** | |
| @s17 | **AJUSTADO** | El literal del saludo |
| @s18 | **INTACTO** (el `.feature`) | Su test busca el hilo por el texto del saludo: cambia el literal del test, no el escenario |
| @s19 | **INTACTO** | `claveBurbuja` sigue en `reserva-logica.ts` |
| @s20 | **AJUSTADO** | Su `Given` usa «Este fin de semana», que desaparece. Pasa a un día que no sea sábado: con «Un sábado», la franja «Me es indiferente» ya no se puede elegir |
| @s21 | **INTACTO** | Build existente; `MINIMO_DE_PARES` sigue en 18 (HS-5) |
| @s22 | **AJUSTADO** | La guarda de fuente (`fetch(`, `XMLHttpRequest`, `window.location`, `form action`) se **extiende** a `ChatNailbot.tsx` y `chat-nailbot-logica.ts`; si no, el código movido queda sin guarda (`05` §5) |
| @s23 | **AJUSTADO** | Gana la fila **sin nombre**. Las dos filas actuales se quedan: son entradas válidas de una función pura |
| @s24 | **INTACTO** | El orden enlace → reinicio se mantiene; el aviso es un escenario nuevo de F-23 |

La **D1** de ese contrato (la leyenda que nadie llegó a añadir) **queda cerrada** por F-23.

#### Dependencias

- **F-02** `datos_negocio_fuente_unica`: `TELEFONO`, `waHref` y `HORARIO.sabado`.
- **F-03** `tokens_paleta_contraste`: los textos nuevos usan pares **ya** vigilados (HS-5).
- **F-04** `cascaron_semantico`: puerta 1 (ni `<h1>` ni `<section>`) y anti-404 (por eso el aviso no enlaza).
- **F-05** `cero_terceros`: SVG inline, sin `url(` y sin fuentes nuevas.
- **F-06** `header_nav_footer`: puerta 5 (ni `<section>` ni `<nav>`).
- **`reserva_chat`**: contrato **enmendado** (tabla de arriba). Ojo: **no tiene entrada en
  `feature_list.json`** (`05` §5).
- **F-10** `horario`: solo si se reutiliza `parsearFranjas` para la guarda del sábado (HS-3).
- **F-13** `solicitud_whatsapp`, **frontera**: la disponibilidad real y la confirmación siguen siendo
  suyas. F-23 adelanta dos de sus acceptance («capa 1 junto al botón», provisional, y «solo servicio,
  fecha y nombre; nunca salud») sin cerrarlos.
- **F-16** `paginas_legales` (`blocked`), **para PUBLICAR**: la capa 1 completa necesita al responsable y
  el enlace a la política (HS-1, **A-23**).
- `feature_list.json` → `no_se_construyen`, «#reserva (chat simulado)»: F-23 responde a sus tres
  objeciones («en línea», no envía nada, pide el nombre sin aviso). Actualizar esa entrada es tarea del lead.

#### Criterios de aceptación verificables

**Horneado** (`renderToString(<Reserva/>)`, nunca jsdom):
1. La cabecera muestra «Nailbot» y «Asistente automático · demo»; **no** aparece «en línea»; el avatar es un
   `<svg>` con `aria-hidden="true"` y `focusable="false"`, sin `id`, sin `<defs>` y sin `<title>`.
2. La leyenda literal está presente.
3. Hay **una** burbuja (`data-de="bot"`, el saludo nuevo), **tres** botones, **cero** enlaces del chat y
   ningún campo.

**Interacción** (`render` + `fireEvent`, literales escritos a mano):
4. El guion: la pregunta y las opciones de cada paso (outline).
5. El sábado: número y orden exactos de burbujas, la franja impuesta en el resumen y la frase con «10:00 a
   14:00».
6. El paso nombre: campo + «Enviar» + «Prefiero no decirlo».
7. Final con y sin nombre: el resumen literal **y** `decodeURIComponent(href)` igual al mensaje literal
   (dos filas).
8. El aviso de capa 1 va **inmediatamente antes** del enlace final, no contiene ningún enlace y **no existe**
   antes de terminar.
9. Dos instancias independientes.
10. Reinicio exacto tras un recorrido con sábado y sin nombre.
11. Si la puerta acepta HS-4: el hilo es un `role="log"` horneado y, tras cada acción, el foco pasa al primer
    control del paso nuevo.

**Puras** (por valor):
12. `responder`: determinista y sin mutar la entrada congelada; la frase del sábado con **dos** rangos
    sintéticos (uno distinto del real, para matar al mutante que fija el valor) y la guarda de HS-3.
13. `mensajeReserva` sin nombre (fila nueva de @s23).

**Bytes:**
14. Guardas de fuente sobre `ChatNailbot.tsx` y `chat-nailbot-logica.ts`, **con el ancla positiva primero**
    (`waHref(` en el `.tsx`): sin número, sin host, sin `fetch(`, `XMLHttpRequest`, `window.location`,
    `localStorage`, `sessionStorage` ni `document.cookie`; y **ni `nailbot-demo.ts`, ni la lógica, ni el
    `.tsx` contienen «10:00»** (L6). Ninguna guarda contra `if (` o `?` (L15, `05` §7).
15. `chat-nailbot.module.scss` y `nailbot-arte.module.scss`: selectores ancla, sin `url(` ni `@font-face`, y
    colores de texto solo de pares vigilados (HS-5).

**Mutación:** 100 % en `ChatNailbot.tsx`, `chat-nailbot-logica.ts` y `NailbotArte.tsx` (nuevos en `mutate`),
y **re-medida** en `Reserva.tsx` y `reserva-logica.ts`. Se acota con `--mutate`, jamás con `--testFiles`.

**Build** (lo corre el lead; **ningún** test nuevo que lo lance): las cinco puertas en verde, un solo
`<h1>` y `MINIMO_DE_PARES` en 18.

**En vivo, anotado en `progress/`** (no son tests verdes): un lector de pantalla recorriendo el chat (qué se
anuncia en cada turno, HS-4), el chat solo con teclado, 320 px, y el enlace final abierto en Android, iOS y
WhatsApp Web **con y sin nombre**.

#### Techo de alcance (L16)

- **≤ 14 escenarios nuevos** en `features/nailbot_chat_compartido.feature`. Los criterios de arriba se
  agrupan en escenarios; los huecos que la puerta acepte **salen de esos 14**, no se suman.
- En `reserva_chat.feature`, **solo** las enmiendas de la tabla: ningún `@s` nuevo allí.
- **Prohibido** crear tests build-based (`*-horneado`): lo horneado se prueba con `renderToString`.
- `pnpm test` completo **una** vez al final; se itera con `pnpm exec vitest run <fichero>`; el `pnpm build`
  lo corre el lead.
- **Fuera de alcance** (brief §6): servidor, IA real, WhatsApp Cloud API, texto libre, persistencia,
  analítica, la página de privacidad (F-16), la columna izquierda de `#reserva`, las otras secciones y la
  disponibilidad real (F-13).

#### Huecos detectados por spec_partner — PENDIENTES DE PUERTA HUMANA

**HS-1 · La capa 1 está incompleta, y la demo es pública.** El art. 11 LOPDGDD pide en la información
básica **(a)** la identidad del responsable, **(b)** la finalidad y **(c)** la posibilidad de ejercer los
derechos de los arts. 15-22, más un medio para acceder al resto de la información **[V: `01` §3.1]**. El
literal de L3 cubre **(b)** y el control del envío; **no** cubre (a), ni (c), ni el medio de acceso. Y hoy
no puede: el nombre legal del responsable **no existe en fuente pública** (D-6) y la política es F-16
(`blocked`). Dos matices más. (i) La frase «El salón lo usará solo para gestionar tu cita» **compromete al
salón** a una limitación de finalidad que nadie ha confirmado con él (D-6: no hay contacto). (ii) La home se
despliega en GitHub Pages en cada push a `main`, tras la aprobación manual de Pablo (`deploy-pages.yml`), y
con el teléfono **real**: una persona real puede mandarle hoy su nombre al salón desde la demo. No es un
riesgo nuevo —el chat actual lo hace **sin ningún** aviso—, pero L3 lo llama «dependencia anotada», y este
documento sostiene que «un invariante sin puerta mecánica es una intención» (Contrato general).
**Propuesta:** (1) aceptar el literal como mejora provisional; (2) que el lead añada al acceptance de F-16
«completar la capa 1 de Nailbot con el responsable y el enlace a la política»; (3) llevar a la puerta
humana, como **A-23**, si cada aprobación del despliegue en Pages asume a sabiendas esa capa incompleta.
**No** se propone meterlo en la capa de placeholders de F-01: rompería el build de Pages, que es el mismo
`pnpm build`, y eso choca con H8.

**HS-2 · El turno del sábado no dice cuántas burbujas son.** El brief dice que la frase del sábado va «en
lugar del paso franja» y que «se pasa al paso nombre en el MISMO turno», pero no si la frase y la pregunta
del nombre son **una** burbuja o **dos**, ni si la franja impuesta aparece como burbuja de la persona. Los
tests cuentan burbujas exactas (patrón de @s11 y @s14), así que la ambigüedad los hace inescribibles.
**Propuesta:** **dos burbujas del bot**, cada una con su literal intacto (la frase del sábado y la pregunta
del nombre), y **ninguna** burbuja de la persona con «Por la mañana», porque ella no la eligió. Por el
camino del sábado se llega al paso nombre con **6** burbujas; por el normal, con 7.

**HS-3 · La regla del sábado lee un dato que no valida, y su conclusión no sale del dato.** (a)
**Formato:** si `HORARIO.sabado` pasara a `'cerrado'` (el formato que ya usa `domingo` **[V: `site.ts:34`]**),
sustituir «-» por « a » produciría «Los sábados abrimos de cerrado». (b) **Inferencia:** «así que te busco
hueco por la mañana» es verdad **porque** el sábado cierra a las 14:00. Si el dato cambia a `'10:00-20:00'`,
la frase se derivaría bien y **mentiría** igual. L6 quiere que la frase salga del dato, pero la
**decisión** de saltarse la franja sigue escrita a mano. **Propuesta:** (a) una guarda pura: si el rango no
casa con `HH:MM-HH:MM`, la regla **no** se aplica y la franja se pregunta como otro día cualquiera; mejor
**reutilizar** `parsearFranjas`/`aMinutos` de F-10 (`horario.ts:48-66`, ya mutados) que escribir otro
`split`. (b) **Acoplamiento declarado**, no inferencia: un test canario en `chat-nailbot-logica.test.ts`
que se pone rojo si el sábado real deja de cerrar a las 14:00, con un mensaje que obliga a revisar la frase.
Es una precondición, no un valor esperado importado. **Descartado por ahora:** derivar el salto de un
umbral de cierre («mañana» = cierra antes de X); exige un número que nadie ha decidido, y L6 pide «nada más
listo».

**HS-4 · Foco y anuncios entre turnos: el chat de hoy pierde el foco a cada paso.** Al pulsar un chip, ese
`<button>` se **desmonta** (cambian las opciones) y el foco cae al `<body>`; con «Reservar otra cita» pasa
lo mismo. Para quien usa teclado o lector de pantalla, cada turno lo expulsa del chat, y la respuesta nueva
del bot **no se anuncia**, porque el hilo no es una región viva. El brief no lo trata: L8 y `04` §14 solo
hablan del foco al abrir el panel, y proponen el **campo**, que en el paso 1 no existe. **Riesgo:** SC 2.4.3
y 4.1.3 en las **dos** instancias. Es heredado, pero F-23 reescribe justo esta pieza. **Propuesta:** (a) el
hilo con `role="log"` y un `aria-live="polite"` redundante, presente desde el primer render (horneado) y con
nombre accesible (ARIA23, `04` §4.3 y §15). **El literal de ese nombre no está en el brief**: `04` sugiere
«Conversación», pero lo fija el lead en la puerta, no el spec_partner (**A-26**). (b) Tras **cada acción de
la persona**, el foco pasa al primer control del paso nuevo: el primer chip, el campo en el paso nombre, el
enlace final al terminar y el primer chip tras reiniciar. **Nunca** al montar, porque en `#reserva` robaría
el foco al cargar la página. (c) Al terminar, el aviso de capa 1 describe al enlace final
(`aria-describedby`), para que quien llega a él por el foco no se salte el aviso. Coste: unos 2 escenarios,
**dentro** del techo de 14.

**HS-5 · Contraste: una fila se queda huérfana y los textos nuevos no tienen par declarado.** (a) Retirar
«en línea» deja sin uso el token `--estado-en-linea` y su fila de `MATRIZ_DE_USO` **[V:
`puerta-contraste.ts:279-283`]**. **La fila no se debe borrar:** bajaría el conteo de 18 y rompería la
guarda `MINIMO_DE_PARES` (puerta 3) y el literal «sigue valiendo EXACTAMENTE 18» de `reserva_chat` @s21.
**Propuesta:** fila y token se quedan, declarados como deuda viva (cero riesgo, cero trabajo). La clase
`.enLinea` sí desaparece con la mudanza a `chat-nailbot.module.scss`. (b) El brief no dice de qué color van
el subtítulo, la leyenda y el aviso, y la puerta es **ciega** a los `.module.scss` (`05` §1): un color
inventado pasaría el build sin que nadie lo mirase. **Propuesta:** solo pares **ya** vigilados, por ejemplo
`--ink` o `--accent-dark` sobre `--accent-soft` en la cabecera, y `--muted` sobre `--surface` o `--text`
sobre `--bg` en el pie y la leyenda. Se confirman contra los fondos reales en el TDD y se fijan por bytes.

**HS-6 · «Pulsa el botón» nombra un enlace.** Los dos resúmenes dicen «Pulsa el botón para
enviársela…», pero el control es un `<a>` (rol *link*, `reserva_chat` @s24) y un lector de pantalla lo
anuncia como «enlace». No incumple ningún SC por sí mismo **[I]**, pero es una incoherencia en el único
sitio donde se le dice qué hacer. El copy es **literal** y el spec_partner no lo reescribe. **Opciones para
la puerta (A-26):** dejarlo; cambiar el copy (p. ej., que nombre el enlace por su texto); **nunca**
convertir el enlace en `<button>`, porque rompería @s24 y la regla de que sea ella quien pulse un enlace.

**HS-7 · La costura del servidor está sobrevendida, y `06` no coincide con el brief.** (a) `06` §1 escribe
`responder(estado, entrada) → turno` en `src/components/nailbot-*.ts`; el brief (L4, §5) fija `→ estado`
en `chat-nailbot-logica.ts`. **Manda el brief**, y `06` debería corregirse (es un documento del lead). (b)
H1 y `06` prometen cambiar el guion por la IA «sin rehacer la UI» o «sin tocar la UI». No es del todo
cierto. Un `fetch` es **asíncrono y puede fallar**: hace falta un estado de espera («escribiendo…» en un
`role="status"` aparte, `04` §16) y una salida de error, p. ej. el WhatsApp directo. Una IA conversa en
**texto libre**, y hoy solo hay chips. Y el art. 50.1 obliga a **cambiar la leyenda** y a avisar en el primer
turno (`06` §4.1). **Propuesta:** que el contrato diga con honestidad lo que la costura garantiza —la
**forma** del estado que pinta la UI y un único punto de sustitución— y lo que **no** —la sincronía, el
texto libre y el copy legal—; y **no construir nada asíncrono hoy** (L4 lo prohíbe con razón).

#### Resolución del craftsman_lead a HS-1..HS-7 (2026-09-27) — MANDA SOBRE EL BRIEF

- **HS-1 → ACEPTADA la propuesta.** El literal de L3 va como capa 1 **provisional**; se añade al
  acceptance de F-16 «completar la capa 1 de Nailbot con la identidad del responsable, los derechos y el
  enlace a la política». A-23 se informa al humano en la puerta (es el statu quo mejorado: hoy el chat no
  lleva ningún aviso).
- **HS-2 → ACEPTADA.** Camino del sábado: **dos** burbujas del bot (frase del sábado + pregunta del nombre)
  y **ninguna** burbuja de la persona con «Por la mañana». 6 burbujas al llegar al paso nombre por ese
  camino, 7 por el normal.
- **HS-3 → ACEPTADA (a) y (b).** (a) Guarda pura: si `HORARIO.sabado` no casa con `HH:MM-HH:MM` la regla no
  se aplica y la franja se pregunta; se **reutiliza** lo ya mutado de `horario.ts` si su firma encaja (si no,
  una regex local mínima). (b) Test canario de acoplamiento declarado (el sábado real cierra a las 14:00).
- **HS-4 → ACEPTADA (a), (b) y (c).** Literal del nombre accesible del hilo: «Conversación con Nailbot».
  Foco tras cada acción de la persona al primer control del paso nuevo; **nunca** al montar. El aviso de
  capa 1 describe al enlace final con `aria-describedby`.
- **HS-5 → ACEPTADA (a) y (b).** Fila y token `--estado-en-linea` se quedan (deuda viva declarada); textos
  nuevos solo con pares ya vigilados, fijados por bytes.
- **HS-6 → COPY CORREGIDO por el lead** (sustituye a los dos resúmenes de §4 del brief):
  - con nombre: «¡Gracias, {nombre}! ✨ Tu solicitud: {servicio} · {día} · {franja}. Envíasela al salón por
    WhatsApp con el enlace de abajo y allí te confirmarán la hora exacta.»
  - sin nombre: «¡Gracias! ✨ Tu solicitud: {servicio} · {día} · {franja}. Envíasela al salón por WhatsApp
    con el enlace de abajo y allí te confirmarán la hora exacta.»
- **HS-7 → ACEPTADA.** El contrato dice lo que la costura garantiza (forma del estado + un único punto de
  sustitución) y lo que NO (sincronía, texto libre, copy legal). Nada asíncrono hoy. El lead corrige `06` §1.

---

### Feature 24: `nailbot_flotante` — el robot que se pinta las uñas en la esquina: lanzador solo-cliente, animación con pausa, bocadillo y `<dialog>` modal nativo

> Feature `#24`. **Aún sin entrada en `feature_list.json`** (la crea el lead). **Depende de F-23**: monta su
> `ChatNailbot` y **anima** su `NailbotArte`. Misma fuente de verdad que F-23 (`progress/nailbot_diseno.md`:
> H3, H4, H5, L7–L14 y el bloque «Flotante» del §4). La investigación de a11y y animación está en
> `docs/research/asistente-robot/04-a11y-animacion.md`, y las restricciones del repo en `05`. Los huecos,
> **HS-8** a **HS-17**, están pendientes de puerta.

#### Propósito

Una invitación **persistente**, con la estética del salón y **sin nada de verde ni logo de WhatsApp** (H5),
a reservar desde cualquier punto de la home: un robot de pestañas largas y morros rojos que se pinta las
uñas en la esquina inferior derecha y que abre **el mismo Nailbot de F-23** en un diálogo modal nativo. Sin
tapar el foco de nadie, sin robarles teclas a los carruseles y con su movimiento **bajo el control de la
persona** (SC 2.2.2, nivel A).

#### Qué ve y hace la persona

| Momento | Qué ve | Qué puede hacer |
| --- | --- | --- |
| HTML horneado, o sin JS | **Nada** del flotante (L7): sin JS no habría acción, y no se hornea un botón muerto | Reservar en `#reserva` (F-23), que sí viaja horneado |
| Tras hidratar | El robot en la esquina, animado en bucle si su sistema no pide menos movimiento, y a su lado el botón de pausa (32×32) | Abrir el chat; pausar o reanudar la animación |
| A los 4 s, si nunca abrió el panel | El bocadillo «¿Te pinto una cita? 💅» (destacado) + «Soy Nailbot y te ayudo a reservar.», con su × | Cerrarlo con × o con Esc; no vuelve en esa carga |
| Al abrir | Diálogo modal «Reserva con Nailbot» (`h2`), botón «Cerrar el chat» y el chat de F-23; el resto de la página, inerte bajo un `::backdrop` | Reservar; cerrar con «Cerrar el chat», con Esc o con el gesto atrás de Android. El foco vuelve al robot |
| Con el panel abierto | ← y → **no** mueven los carruseles de detrás | Usar el chat con teclado sin efectos colaterales |
| Con `prefers-reduced-motion: reduce` | El robot quieto en su pose final | Lo mismo, sin movimiento (qué pasa con el control de pausa: HS-8) |

#### Contrato

**Lanzador.** `<button type="button">` con `aria-label` «Abrir el chat con Nailbot para reservar cita» y
`aria-haspopup="dialog"` (ARIA 1.2 exige que el valor case con el rol del contenedor **[V: `04` §4.4]**).
`aria-expanded` y `aria-controls` no están confirmados como obligatorios, y con un modal el lanzador queda
inerte mientras está abierto: **no** se añaden. Dentro va la instancia **animada** de `NailbotArte`. Área
≥ 44×44 como criterio de proyecto (el listón AA de SC 2.5.8 es 24×24; el prototipo usa 104 px, y 76 px por
debajo de 600 px). `position: fixed` abajo a la derecha, sumando `env(safe-area-inset-*, 0px)`, con
`z-index` explícito (HS-11) y sin `inset: 0` ni `width: 100%`. **Sin verde, sin logo y sin «WhatsApp» en
su nombre** (H5).

**Pausa (L10).** `<button type="button">` con `aria-label` fijo «Pausar la animación de Nailbot» y
`aria-pressed`: la etiqueta no cambia y el estado lo dice `aria-pressed` (APG Button). Mide 32×32 y va
**adyacente** al robot (G186). El estado vive en el atributo `data-animacion` del arte y **nunca** en un
`className` condicional (`05` §2.1). Sin persistencia. El arranque, reduced-motion y qué significa «pausar»
están en HS-8.

**Arte animado (L9).** F-24 añade a `nailbot-arte.module.scss` los `@keyframes` del prototipo, con tiempos y
curvas **verbatim** (`nailbot-prototipo.html:71-113`):
- **todas** dentro de `@media (prefers-reduced-motion: no-preference)` (patrón B de C39, `04` §2);
- **solo** para la instancia con `data-animacion`: el avatar de la cabecera del chat, sin atributo, no se
  mueve nunca, ni en `#reserva` ni en el panel (contrato 6 de F-23);
- solo `transform` y `opacity`, con `transform-box: fill-box` y `transform-origin` explícito donde el
  prototipo lo pone, y sin `will-change`;
- el estado base sigue siendo la pose final visible (I-4).

**Bocadillo (L11, H4).** Aparece **una vez por carga de página**, a los **4 s** de montar el lanzador y
**solo si** el panel no se ha abierto nunca. **No** es región viva; mientras se ve, el lanzador lo
referencia con `aria-describedby` (id de `useId`). Su × lleva el `aria-label` «Cerrar el mensaje de
Nailbot» y mide ≥ 24×24. Esc lo cierra **sin mover el foco** (el ámbito de ese Esc y el foco tras el ×
están en HS-9). Al abrir el panel desaparece y no vuelve. Es estático, o con una entrada de ≤ 5 s solo en
`no-preference` (`04`, regla 11). Sin storage: el «no vuelve en esa visita» de H4 significa «en esa
**carga**» (L11).

**Diálogo (L8, L13).** `<dialog>` **nativo**, abierto con `showModal()` y cerrado **siempre** con `close()`;
**nunca** con una prop `open` controlada por React, porque quitar `open` a mano deja el documento bloqueado
**[V: `04` §6.1]**. Sin `role` redundante, sin `tabindex` y con `closedby` por defecto (Esc cierra; el clic
fuera, no). `aria-labelledby` apunta al `h2` visible «Reserva con Nailbot», y hay un botón visible «Cerrar
el chat» (≥ 24×24). Dentro va **su propia** instancia de `ChatNailbot` (su ciclo de vida, en HS-13). El
diálogo **detiene la propagación** de `ArrowLeft` y `ArrowRight`, las **únicas** teclas que escuchan los
carruseles **[V: `carrusel-logica.ts:27-30`]**, y de **ninguna** otra: Escape tiene que seguir llegando al
mecanismo nativo, y ← y → dentro del campo siguen moviendo el cursor (no se llama a `preventDefault`).
React 17+ delega los eventos en la raíz, que cuelga de `document` **[I]**, así que esto se asevera con un
escuchador real en `document` y no se da por supuesto. El foco inicial está en HS-12.

**Montaje (L7, L14).** En `src/pages/home.tsx`, **después de `</main>` y antes de `<Pie />`**, como
hermano (ni dentro del `<footer>` ni dentro de ninguna sección). **Solo en el cliente**: el SSR y la primera
pasada de la hidratación devuelven `null`, y un efecto de montaje lo enciende. Así el HTML de `dist/` no
cambia en nada y las puertas 1, 4 y 5 no lo ven (la 2 sí lee el JS: nada de la lista negra). El widget no
trae `<section>`, `<nav>` ni `<h1>`, y el `h2` del diálogo solo existe en el cliente. Cómo se verifica:
HS-14.

**C43 (L12).** `scroll-padding-bottom` en el bloque `html` de `_base.scss`, **junto** al
`scroll-padding-top: 6rem` que ya existe (no se toca; lo vigila `scroll-padding-cabecera.test.ts`), con
`env(safe-area-inset-bottom, 0px)`. Cuánto mide y dónde va el «hueco al final»: HS-10.

**Setup de test (L8).** Stub **protegido** de `showModal`/`close` en `vitest.setup.ts`, que solo actúa si
faltan (jsdom 25 no los implementa **[V: `04` §6.5]**): `showModal` pone `open`, y `close` lo quita y
despacha `close`. Lo nativo (inercia, Esc, *top layer*, vuelta del foco) **no** se prueba en jsdom: se
verifica en navegador.

**Lógica pura (`nailbot-flotante-logica.ts`), por valor:** si se muestra el bocadillo (ms desde el
montaje, si se abrió alguna vez, si se descartó); el estado de la animación ante cada evento (preferencia
leída, pulsación de pausa, cambio de `reduce` en caliente); y si una tecla se detiene en el diálogo. Todo se
calcula **en la llamada**. La consulta `'(prefers-reduced-motion: reduce)'` se asevera **exacta** espiando
`matchMedia` (`galeria.test.tsx:709-715`), y los 4 s se prueban en puntos que **no** son múltiplos del
ciclo, p. ej. a 3 999 y a 4 000 ms.

#### Casos límite

1. **Sin JS** → ni lanzador ni bocadillo: el `renderToString` de la home no contiene «Abrir el chat con
   Nailbot…».
2. **Abrir el panel antes de 4 s** → el bocadillo no aparece nunca en esa carga.
3. **Cerrar el bocadillo** (× o Esc) → no vuelve en esa carga; al recargar, vuelve (no hay storage).
4. **Abrir el panel con el bocadillo a la vista** → desaparece y no vuelve.
5. **`reduce` desde el principio, activado en caliente o desactivado en caliente** → quieto; se pausa; **no**
   se reanuda solo (L10). El control, en HS-8.
6. **← o → sobre un chip del panel con un carrusel visible detrás** → el carrusel no se mueve. **Escape, Tab
   o una letra** → sí se propagan.
7. **Escape en el campo del nombre, con el panel abierto** → cierra el diálogo (nativo); el chat no «envía»
   nada (`reserva_chat` @s16) y la conversación se conserva (HS-13).
8. **Cerrar y reabrir el panel** → la conversación sigue donde estaba (HS-13), y la de `#reserva`, intacta.
9. **Con el panel abierto**, el robot sigue moviéndose tras el `::backdrop` y la pausa queda inerte hasta
   cerrar. Conforme **[I]**: el mecanismo de 2.2.2 está a un Esc de distancia. Se declara para que nadie lo
   «arregle» con una pausa automática que pise el estado que eligió la persona.
10. **Tabulando hasta el final de la página** → el último enlace del pie no queda **totalmente** tapado
    (F110). En vivo (HS-10).
11. **Menú móvil desplegado en una pantalla baja** → el robot no tapa sus enlaces (HS-11). En vivo.
12. **Gesto atrás de Android con el panel abierto** → cierra el panel (petición de cierre nativa). En vivo.
13. **Varias copias del arte en la página** → cero `id`, ningún duplicado.
14. **Fuera de alcance, declarado:** ← y → sobre los chips del chat de **`#reserva`** pueden mover la galería
    si está a la vista en un 60 % o más. Es anterior a F-24 y F-24 no lo toca.

#### Decisiones (con su porqué)

| # | Decisión | Alternativa descartada | Porqué |
| - | --- | --- | --- |
| **H3 · L10** | Bucle + control de pausa; con reduced-motion, quieto | La «ráfaga» ≤ 5 s que termina en pose fija (la recomendación de `04`, regla 4) | La decidió el humano. Un bucle decorativo **cumple las tres condiciones** de 2.2.2 (arranca solo, dura más de 5 s y va en paralelo) **[V: `04` §1.4]**, así que necesita un mecanismo. `prefers-reduced-motion` **no** es técnica de 2.2.2 **[V: `04` §1.3]**: es criterio de proyecto y no lo sustituye |
| **H4 · L11** | Bocadillo una vez, descartable y sin storage | Que reaparezca en cada visita, recordándolo en `sessionStorage` | L2 e I-2: cero almacenamiento. «Visita» = carga |
| **H5** | Nada de verde ni logo de WhatsApp en el lanzador | Recuperar el botón verde retirado (commit 479d541) | Palabra del humano: «Queremos un robotito que pegue con la estética del negocio» |
| **L7** | El lanzador solo existe en el cliente | Hornearlo (como el botón verde retirado) | Sin JS no hay acción: un botón horneado sería un botón muerto. `position: fixed` no produce CLS. Precedente: el control del hero «nunca viaja horneado» (`05` §2.6) |
| **L8** | `<dialog>` nativo y modal | Un `div role="dialog"` propio; un diálogo no modal | El navegador da la inercia, Esc, la *top layer*, el `::backdrop` y la vuelta del foco; hacerlo a mano es más código y más mutantes. Con modal, el 2.4.11 del panel desaparece: fuera no hay foco posible (`04` §3). En móvil ocuparía casi toda la pantalla de todos modos. Coste: stub en jsdom y verificación en vivo |
| **L9** | El arte del prototipo, con la animación como opt-in de `no-preference` | Lottie, un GIF o un SVG animado por JS | Cero dependencias y cero terceros (F-05). Con el patrón B, el HTML ya sale quieto para quien lo pidió, sin depender de JS |
| **L12** | C43 con `scroll-padding-bottom` | Ninguna mitigación; una posición no fija | F110: un botón fijo puede tapar **por completo** un control enfocado **[V: `04` §3]** |
| **L13** | El diálogo detiene ← y → | Cambiar los carruseles para que comprueben si hay un diálogo abierto | Los carruseles escuchan en `document` **[V]**; cambiarlos es tocar F-22, que ya está `done` |
| **L14** | Tras `</main>` y antes de `<Pie />` | Dentro de `<main>`, dentro del `<footer>` o después de `<Pie />` | Un `position: fixed` que acompaña a toda la página no pertenece a una sección (contrato retirado del botón verde, `05` §1). Antes del pie, el robot entra en el orden de tabulación antes que los enlaces del pie |

#### Dependencias

- **F-23** `nailbot_chat_compartido`: `ChatNailbot` y `NailbotArte`. **F-24 no empieza su TDD hasta que F-23
  esté `done`.**
- **F-04**: puerta 1 (ni `<h1>` ni `<section>` en lo horneado; aquí no se hornea nada).
- **F-05**: cero terceros (ni `url(`, ni fuentes, ni Lottie).
- **F-06**: el `scroll-padding-top` que convive con el nuevo, la cabecera **sticky** con `z-index: 50` y su
  menú móvil (HS-11), y el `<footer>` junto al que se monta (HS-10).
- **F-07**: precedente del control de animación y de `matchMedia` leído en un efecto (`Hero.tsx:105-148`,
  según `05` §2.5-2.6).
- **F-22** `galeria_carrusel`: sus escuchas de ← y → en `document` (L13).
- **F-03**: ninguna fila nueva en la matriz (HS-17).
- **F-16**: hereda de F-23 la dependencia **para publicar** (A-23).

#### Criterios de aceptación verificables

**SSR y montaje:**
1. El `renderToString` de la home **no** contiene el lanzador; tras montar en jsdom, **sí**.
2. Tras montar, el lanzador queda **después** de `<main>` y **antes** del `<footer>`, con las anclas
   positivas primero, y el widget no aporta `<section>`, `<nav>` ni headings fuera del diálogo (HS-14).

**Lanzador, pausa y arte:**
3. Lanzador: `type="button"`, `aria-label` literal, `aria-haspopup="dialog"` y el arte con `aria-hidden`.
4. La pausa alterna `aria-pressed` y `data-animacion`, y su etiqueta no cambia.
5. Reduced-motion: la consulta exacta, el arranque y los dos sentidos del cambio en caliente (HS-8).

**Bocadillo:**
6. Aparece a los 4 000 ms y no a los 3 999, solo si el panel no se ha abierto, y el `aria-describedby` solo
   existe mientras se ve.
7. El × (con su nombre) y Esc lo cierran sin mover el foco, y no vuelve; al abrir el panel, desaparece
   (HS-9).

**Diálogo:**
8. Al pulsar el lanzador se llama a `showModal`; el diálogo se llama «Reserva con Nailbot» y contiene
   «Cerrar el chat» y el chat de F-23.
9. «Cerrar el chat» llama a `close`, y el evento `close` deja el estado en cerrado.
10. ← y → no llegan a un escuchador de `document`; Escape, Tab y una letra, sí.
11. El foco inicial (HS-12) y la conversación conservada al cerrar y reabrir (HS-13).

**Bytes:**
12. `nailbot-arte.module.scss`: **todas** las `@keyframes` y sus usos dentro de `no-preference`; solo
    `transform` y `opacity`; `transform-box: fill-box`; la animación atada a `[data-animacion]`; sin
    `will-change` ni `url(`.
13. `nailbot-flotante.module.scss`: `position: fixed`, `z-index` explícito (HS-11),
    `env(safe-area-inset-bottom`, pausa de 32 px y lanzador ≥ 44 px; sin `inset: 0` ni `width: 100%`; **sin
    verde** (`#25d366`, `demo-btn--wa`) y sin «whatsapp» en los ficheros propios del flotante (H5).
14. `_base.scss`: `scroll-padding-bottom` presente en `html`, ligado al tamaño del lanzador y a
    `env(safe-area-inset-bottom` (HS-10), y `scroll-padding-top` intacto.
15. Guardas de fuente sobre `NailbotFlotante.tsx` y su lógica, con ancla positiva: sin `fetch(`, sin
    storage y sin analítica. Ninguna guarda contra `if (` o `?`.

**Mutación:** 100 % en `NailbotFlotante.tsx` y `nailbot-flotante-logica.ts` (nuevos en `mutate`), y
re-medida en `NailbotArte.tsx`. Las dependencias `[]` de los efectos de solo-montaje son mutantes
**equivalentes** con precedente (`Hero.tsx:150-157`, `Galeria.tsx:154-159`): `Stryker disable` con la
justificación escrita en `progress/mutation_nailbot_flotante.md`, nunca a ciegas.

**En vivo (Chrome real y un móvil), anotado en `progress/`:** Esc, la inercia del fondo, la *top layer* y la
vuelta del foco; F110 tabulando hacia abajo **y** hacia arriba a 320, 390 y 1280 px; el menú móvil
desplegado en apaisado; la animación, la pausa y el reduced-motion del sistema; el gesto atrás de Android;
el área segura de iOS; el tamaño real de los objetivos; y el enlace final abierto en WhatsApp **desde el
panel**.

#### Techo de alcance (L16)

- **≤ 16 escenarios** en `features/nailbot_flotante.feature`. Los huecos que la puerta acepte **salen de
  esos 16**.
- **Prohibido** crear tests build-based. La home se prueba con `renderToString` (el SSR) y con `render` en
  jsdom (el cliente); el build lo corre el lead.
- Ficheros: los del brief §5 y ninguno más, **salvo** que la puerta acepte HS-10 (b), que añadiría la hoja
  del pie.
- **Fuera de alcance:** el brief §6, y tocar los carruseles (F-22) o la cabecera (F-06) más allá de lo que
  HS-10 y HS-11 lleven a la puerta.

#### Huecos detectados por spec_partner — PENDIENTES DE PUERTA HUMANA

**HS-8 · La pausa no dice qué hace con reduced-motion, ni si congela o reinicia.** (a) L10: «arranca en
pausa si reduce». Pero L9 pone **todas** las `@keyframes` dentro de `no-preference`: con `reduce` no hay
nada que reanudar, y si la persona despulsa el botón, `aria-pressed="false"` anuncia una animación que
**no** va a ocurrir. Es un control que miente. El precedente del repo va al revés: el control del hero **no
se monta** si la preferencia no permite animar (`hero-logica.ts:49-54`, `05` §2.6). **Propuesta:** con
`reduce`, el botón de pausa **no se monta**; no hay movimiento, así que 2.2.2 no aplica. Si `reduce` se
activa en caliente, `data-animacion` pasa a pausada y el botón desaparece, recolocando el foco si estaba en
él (precedente `Hero.tsx:85-101`). Si se desactiva, el botón reaparece **pulsado** y la animación **no** se
reanuda sola, como pide L10. (b) «Pausar» puede ser **congelar donde está** (`animation-play-state:
paused`, que reanuda desde ese punto: técnica G4) o **volver a la pose base** (`animation: none`, como el
`data-firma` del hero). **Propuesta:** congelar, porque cumple G4 y casa con «Pausar» + `aria-pressed`. A
cambio, un fotograma congelado puede enseñar una uña a medio pintar o el pincel en el aire: es aceptable, y
se anota para que no se reporte como fallo.

**HS-9 · El Esc del bocadillo solo sirve si escucha en todo el documento.** El bocadillo aparece solo, en la
esquina, y puede tapar un enlace que recibe el foco. SC 2.4.11 lo perdona **solo si** la persona puede
destaparlo **sin mover el foco** (Nota 2 **[V: `04` §3]**). Eso lo consigue el Esc de L11, **pero** solo si
se escucha en `document` mientras el bocadillo está a la vista, y no únicamente con el foco dentro de él. El
brief no fija ese ámbito. Además, al cerrarlo con su ×, ese botón se desmonta y el foco cae al `<body>`.
**Propuesta:** escuchar Esc en `document` **solo mientras el bocadillo está visible** (no hay otro Esc en la
página con el que choque: el menú móvil no escucha Esc **[V: `grep` en `src/components/`]**), y tras el ×,
mandar el foco al lanzador.

**HS-10 · El `scroll-padding-bottom` se queda corto, y el «hueco al final del documento» pinta una franja
rosa.** (a) L12 lo calcula como «alto del lanzador + separación + área segura», pero el arte **desborda** el
botón (`width: 116%`, `top: -16%` **[V: `nailbot-prototipo.html:49`]**) y la pausa va en la esquina
superior (`:51`). Lo que tapa mide unos 141 px en escritorio y unos 108 en móvil **[I]**, no 124 ni 96. Y un
test de bytes no puede comprobar que un número **baste**. **Propuesta:** que el tamaño del lanzador y el
`scroll-padding-bottom` salgan de **la misma custom property** (una sola fuente, I-7), y que el test de
bytes asevere ese vínculo más `env(safe-area-inset-bottom`; que baste, lo dice F110 en vivo. (b) «El mismo
hueco al final del documento»: si se hace con `padding-bottom` en `html`, sale una **franja de fondo rosa**
(`body { background: var(--bg) }` **[V: `_demo.scss:12-16`]**) **debajo del pie oscuro** (`.pie {
background: var(--ink) }` **[V: `cabecera.module.scss:130-135`]**), y también sin JS, donde no hay robot.
**Propuesta:** medir primero con F110 si el último enlace del pie llega a quedar tapado. El pie ya tiene 40
px de relleno inferior más la línea «©», y sus enlaces no están en la esquina derecha **[I]**. Si hace
falta, el hueco va en el relleno inferior de `.pie`, que es oscuro, y no en `html`; eso añade
`cabecera.module.scss` a la lista de ficheros (decisión del lead). Si no hace falta, no se pone: YAGNI.

**HS-11 · El `z-index` del lanzador frente al menú móvil desplegado.** El prototipo usa `z-index: 50` **[V:
`nailbot-prototipo.html:39`]** y `05` recomienda «> 50». La cabecera sticky también es 50 **[V:
`cabecera.module.scss:15`]**, y su menú móvil se despliega **dentro** de ella, hacia abajo (`:108-126`). En
una pantalla baja, como un móvil en apaisado, el menú abierto puede llegar a la esquina del robot. Con 50 y
el robot más tarde en el DOM, o con más de 50, **el robot tapa los últimos enlaces del menú**; y como el menú
es sticky, ningún `scroll-padding` lo arregla (F110). **Propuesta:** un `z-index` **entre 8 y 49**, por
encima de los carruseles (7 **[V: `galeria.module.scss:37`]**) y por debajo de la cabecera. El diálogo no
depende de esto, porque va en la *top layer*. Se verifica en vivo, en apaisado.

**HS-12 · El foco inicial al abrir no está fijado, y la recomendación de `04` no sirve en el paso 1.** `04`
§14 propone enfocar el **campo** tras `showModal()`, porque el `autoFocus` de React falla dentro de
`<dialog>` (issue #23301 **[V]**). Pero en el paso 1 no hay campo: hay chips. **Propuesta:** no escribir
código de foco. Sin `autofocus`, `showModal()` enfoca **el primer enfocable** del diálogo **[V: `04` §6.2]**,
así que basta con ordenar el DOM: `h2` → `ChatNailbot` → «Cerrar el chat» (colocado arriba por CSS). El
primer enfocable es entonces el primer control del paso en curso: el chip «Uñas» al estrenarlo, el campo en
el paso nombre y el enlace al terminar, coherente con HS-4. En jsdom se asevera el **orden** (el primer
enfocable del diálogo es el esperado); que el navegador lo enfoque, en vivo. Cero mutantes. Alternativa
igual de válida para la APG: «Cerrar el chat» el primero en el DOM, y entonces el foco inicial cae en él.

**HS-13 · ¿Qué vive dentro del diálogo cuando está cerrado?** El brief no dice si el `ChatNailbot` del panel
se monta siempre (con el diálogo cerrado) o solo al abrirlo, ni si la conversación sobrevive a cerrar y
reabrir. Importa por dos cosas. (i) Si se monta siempre, sus textos están **dos veces** en el DOM desde el
principio (la instancia de `#reserva` y la del panel), y cualquier `getByText` de los tests de la home falla
por duplicado. (ii) Si se desmonta al cerrar, un Esc accidental **borra** lo que la persona llevaba.
**Propuesta:** montarlo **la primera vez que se abre** y **conservarlo** después: al reabrir, la
conversación sigue donde estaba, y el único reinicio es «Reservar otra cita». En memoria, sin storage.

**HS-14 · Un lanzador que solo existe en el cliente no sale en `renderToString`, y el montaje (L14) se queda
sin test.** El juez **rechazó** la v1 del botón verde precisamente porque su montaje fuera de `<main>` no
tenía test (`05` §7). Con L7, el SSR de la home no contiene el flotante, así que la técnica de entonces
(comparar `indexOf` sobre `renderToString`) **no ve nada**. **Propuesta:** dos pruebas, ninguna de build.
(a) SSR, negativa: la home horneada **no** contiene el lanzador (L7). (b) Cliente: `render` de la home en
jsdom con su `HelmetProvider`, esperar al efecto y aseverar con `compareDocumentPosition` que el lanzador va
**después** de `<main>` y **antes** del `<footer>`, con las anclas positivas primero. Una guarda de bytes
sobre `home.tsx` sirve de apoyo, pero no es la prueba.

**HS-15 · «Portado VERBATIM» solo vale para la geometría: el prototipo discrepa del brief.** Diferencias
**[V]**: el `aria-label` del lanzador dice «Abrir el chat **de** Nailbot…» (`:243`), y el brief, «**con**
Nailbot»; el bocadillo dice «Soy Nailbot, te ayudo a reservar.», con el 💅 fuera del destacado (`:236`); la ×
dice «Cerrar mensaje de Nailbot» (`:237`), y el brief, «Cerrar **el** mensaje…»; la pausa mide 30 px, y 26
por debajo de 600 px (`:51`, `:122`), cuando el brief fija 32; el `z-index` es 50 (HS-11); el reduced-motion
va con el patrón **A** y `!important` (`:117`), y el brief manda el B; y el estado se llama `data-pausado`
(`:116`), y el brief, `data-animacion`. **Propuesta:** una regla escrita en el contrato: del prototipo se
portan **solo** la geometría (`viewBox` y trazados), los colores decorativos y los tiempos de las
`@keyframes`; el copy, los tamaños de los controles y el CSS de estado salen **del brief**. Los tests
escriben los literales del brief a mano, así que un copia-pega del prototipo los pone en rojo.

**HS-16 · ¿Hasta dónde llega «nada de verde» (H5)?** El lanzador cumple. Pero el panel monta `ChatNailbot`,
que trae verde: la burbuja de la persona (`#dcf6e3`/`#1c3b28`), el botón de enviar (`#25d366`) y el enlace
final (`demo-btn--wa`, que `reserva_chat` @s24 **exige**) **[V: `05` §4, `reserva.module.scss`]**.
**Propuesta:** H5 se refiere al **lanzador**, la pieza que sustituye al botón verde retirado; el panel usa
un `ChatNailbot` **idéntico** al de `#reserva` (H2), con su verde. Si Pablo quiere el panel sin verde, hay
que cambiar `ChatNailbot` en **las dos** instancias y enmendar @s24. Es decisión suya (**A-25**), no del
TDD.

**HS-17 · El contraste del lanzador (SC 1.4.11) no lo vigila nadie.** La puerta de contraste es ciega a los
`.module.scss` (`05` §1). El prototipo identifica el botón con un disco blanco y un anillo `--accent-soft`
sobre el fondo `--bg` (`:43-44`): un borde de ~1,1–1,2:1 **[I, cálculo propio]**. 1.4.11 pide 3:1 para la
información visual **necesaria para identificar** el control **[V: `04` §4.5]**. Aquí la identidad la dan
los rasgos del robot —ojos `#3A1D29`, labios `#D7263D` y el corazón en `--accent-2` sobre la cara clara,
todos muy por encima de 3:1 **[I]**—, así que probablemente cumple, pero **nadie lo ha medido**. La pausa
(borde `--border-interactive` sobre `--surface`, icono en `--accent-dark`) sale mejor por dominancia
**[I]**. **Propuesta:** o se deja el aspecto del prototipo y ese juicio **[I]** se verifica en vivo y se
anota en `progress/`, o el anillo pasa a `--accent-dark`, que sobre `--bg` ya está en la matriz (4,5:1 como
texto, de sobra para 3:1): sin fila nueva y vigilado. Decide el lead.

#### Resolución del craftsman_lead a HS-8..HS-17 (2026-09-27) — MANDA SOBRE EL BRIEF

- **HS-8 → ACEPTADA (a) y (b).** Con `reduce` el botón de pausa **no se monta** y el arte queda en su pose
  base. `reduce` en caliente → `data-animacion` pausada, el botón desaparece y, si tenía el foco, el foco va
  al lanzador. `reduce` desactivado → el botón reaparece **pulsado** y la animación NO se reanuda sola.
  «Pausar» = **congelar** (`animation-play-state: paused`, técnica G4); un fotograma a medio pintar no es fallo.
- **HS-9 → ACEPTADA.** Esc escuchado en `document` **solo** mientras el bocadillo está visible; tras la ×,
  el foco va al lanzador.
- **HS-10 → ACEPTADA.** (a) Tamaño del lanzador y `scroll-padding-bottom` salen de la MISMA custom property
  (declarada en `:root` desde `_base.scss`, con su valor móvil en el mismo breakpoint), más
  `env(safe-area-inset-bottom, 0px)`; el test de bytes asevera el vínculo. (b) El «hueco al final» NO se
  pone a ciegas: se mide F110 en vivo; solo si el último enlace del pie queda tapado, se añade relleno
  inferior a `.pie` (decisión del lead en la verificación, anotada en `progress/`).
- **HS-11 → ACEPTADA.** `z-index` del lanzador y del bocadillo = **40** (entre carruseles 7 y cabecera 50).
- **HS-12 → ACEPTADA la vía sin código de foco.** Orden del DOM del diálogo: `h2` → `ChatNailbot` → «Cerrar
  el chat» (situado arriba a la derecha por CSS). El primer enfocable es el primer control del paso en
  curso. En jsdom se asevera el orden; el foco real, en vivo.
- **HS-13 → ACEPTADA.** El `ChatNailbot` del panel se monta la primera vez que se abre y se conserva; solo
  «Reservar otra cita» reinicia. En memoria.
- **HS-14 → ACEPTADA (a) y (b).** SSR negativa + cliente con `compareDocumentPosition` y anclas positivas.
- **HS-15 → ACEPTADA.** Del prototipo se portan SOLO geometría (`viewBox`, trazados), colores decorativos y
  tiempos de `@keyframes`; copy, tamaños de controles y CSS de estado salen del brief.
- **HS-16 → A LA PUERTA HUMANA (A-25)** con la recomendación del lead: H5 se refiere al **lanzador**; el
  panel usa el `ChatNailbot` idéntico al de `#reserva`.
- **HS-17 → el anillo del lanzador pasa a `--accent-dark`** (par ya vigilado, sin fila nueva); el disco
  sigue blanco. Verificación visual en vivo.
