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
| **A-10** | **`waHref`: ¿host `wa.me` o `api.whatsapp.com/send`?** Ligada a **A-3**. Lo **testeable** de F-02 (número **E.164 sin `+`** + texto **`encodeURIComponent`**) es host-agnóstico; el host se **verifica a mano** (Android/iOS/WhatsApp Web) antes de F-13 y se trata como constante configurable. Ver F-02, contrato | Nosotros, ligado a A-3 |
| **A-11** | **¿El email entra en `site.ts` como registro `esPlaceholder: true` desde F-02** (rompiendo ya el build de producción, que es lo correcto por D-6) **o se difiere a F-12?** `centroesteticarozas@gmail.com` solo consta en el JSON-LD oculto de la web actual y **[NV]** si se atiende **[V]**. Ver F-02, alcance | Humano, en el Gherkin de F-02 |
| **A-12** | **¿F-02 cablea `registros` en `tools/puerta-placeholders.ts`** (hoy `never[] = []`) **o es paso posterior?** El TODO del humilde dice que F-02 alimenta la vía por flag **[V: código]**. Recomendación: sí, es de F-02 (cambio de una línea en el humilde, sin TDD ni mutación). Ver F-02, alcance | Humano/lead, en la puerta de aprobación de F-02 |
| **A-13** | **¿Dónde vive y cómo se mantiene honesta la «matriz de uso» de F-03?** (pares fg/bg + rol/umbral + tamaño efectivo del `clamp`). El SCSS solo tiene colores; el umbral 4,5/3,0 es información de **uso**, no de token. Incluye el **mínimo de pares exigido** (contra el verde por vacuidad) y **cómo asevera el negativo** «`#C05576` nunca como texto». Análogo a A-8/A-9. Ver F-03 | Humano, en el Gherkin de F-03 |
| **A-14** | **El mutante `0.04045 → 0.03928` es EQUIVALENTE para color de 8 bits [V: audit §2.1]**: ningún canal `c/255` cae en el hueco, así que ningún hex lo distingue. Con umbral de mutación **1.0** un superviviente inmatable bloquea la feature. Confirmar qué mutantes genera Stryker 9.6 sobre la rama a trozos y **cubrir `canalLineal` con inputs sintéticos**. Ver F-03 | Nosotros/lead, antes del Gherkin de F-03 |
| **A-15** | **¿La cabecera de F-03 se conserva translúcida (`color-mix 82%`) o se hace opaca?** El audit calculó la trampa `color-mix` con tokens **viejos** y **no** re-verificó la cabecera corregida; la decisión define qué pares (y qué peor `under`) entran en la matriz. Incluye el **inventario exacto de tokens** del `:root` (13 base + `--border-interactive` + estado `#186237`). Ver F-03 | Humano (diseño), en el Gherkin de F-03 |

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
| 6 | `--ink` **como fondo del pie (valor)** | `#B0466A` → **`#8E3355`** | Con `#B0466A`, **ninguna** opacidad de blanco < 1.0 alcanza 4,5:1 (`.82` cae a 4,15:1) — **límite matemático [V]**. Con `#8E3355`, `rgba(255,255,255,.70)` = **4,60:1** y `.82` = 5,68:1 |
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
| `componer(rgba, fondoRgb): [r,g,b]` | Composición sobre fondo opaco: `canal = α·fg + (1−α)·bg`. Cubre `--line` (α=.16) y el `color-mix(in srgb, --bg 82%, transparent)` de la cabecera (equivale a `--bg` con α=.82 sobre lo que scrollee debajo). **Pura** |

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
| `rgba(#FFF,.70)` / `--ink #8E3355` (pie) | texto | 4,5 | 4,60 |
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
   scroll.** `background: color-mix(in srgb, var(--bg) 82%, transparent)` → el fondo real es
   **82 % `--bg` + 18 % de lo que pase por debajo** **[V]**. Se testea **sin navegador**
   porque `color-mix` es composición determinista: `componer(--bg@.82, under)` para cada
   `under` posible (los fondos de sección que pueden scrollear bajo la cabecera, y el peor
   caso de foto oscura), y se recalculan `--muted` (nav) y `--ink` (logo) contra cada uno. Con
   los tokens **viejos** el logo `--ink` caía a **3,88:1 / 3,96:1** cuando el pie o un botón
   pasaban por debajo **[V, audit §2.6]**. **⚠️ El audit calculó esta trampa con los tokens
   ANTIGUOS y NO re-verificó la cabecera con la paleta corregida** → si la cabecera sigue
   translúcida en producción, **la puerta es quien decide** si los `--muted #6F525A` / `--ink
   #8E3355` sobreviven el peor `under`; la alternativa de diseño (cabecera **opaca**) elimina
   la trampa entera. Esto es **A-15**.
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

#### Preguntas abiertas de esta feature

- **A-13** — **¿Dónde vive y cómo se mantiene honesta la «matriz de uso»** (pares fg/bg +
  rol/umbral + tamaño efectivo del `clamp`)? El SCSS solo tiene colores; el umbral es
  información de uso. Recomendación: matriz **declarada en el test** (las combinaciones reales
  del audit) + un **mínimo de pares exigido** para evitar el verde por vacuidad + **cómo se
  asevera el negativo** «`#C05576` nunca como texto» (caso límite 3, regla dura). Es el
  análogo de F-03 a A-8/A-9 de F-01.
- **A-14** — **El mutante `0.04045 → 0.03928` es equivalente en 8 bits**: confirmar qué
  mutantes genera Stryker 9.6 sobre la rama a trozos y cubrir `canalLineal` con inputs
  sintéticos para que la puerta no herede un superviviente inmatable (umbral 1.0).
- **A-15** — **¿La cabecera se conserva translúcida (`color-mix 82%`) o se hace opaca?** El
  audit calculó la trampa (b) con tokens **viejos** y **no** re-verificó la cabecera
  corregida; la decisión de diseño define qué pares (y qué peor `under`) entran en la matriz.
  Incluye el **inventario exacto de tokens** del `:root` (13 base + `--border-interactive` +
  estado `#186237`).
- **A-4** (ya abierta) — si «Nails Lash Studio» es **logotipo**, SC 1.4.3 exime el par del
  `clamp` (caso límite (a)). Decisión de negocio del humano; **no se depende** de ella.

---

### Las 17 features restantes

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
