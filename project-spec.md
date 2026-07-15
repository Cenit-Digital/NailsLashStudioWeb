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

### Las 19 features restantes

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
