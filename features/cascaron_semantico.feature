# =============================================================================================
# 🟠 ENMIENDA 1 (2026-07-25): LA PUERTA ANTI-404 BAJO UNA BASE DE DESPLIEGUE DECLARADA — @s23/@s24
# SE PRESERVAN INTACTOS; SE AÑADEN @s36, @s37 Y @s38. CERO REGRESIÓN.
# =============================================================================================
# CASO DE USO NUEVO, NO ANTICIPADO EL 2026-07-16 (fecha de la puerta humana original de F-04):
# desplegar el sitio en GitHub Pages DE PROYECTO (`https://cenit-digital.github.io/NailsLashStudioWeb/`)
# exige `base: '/NailsLashStudioWeb/'` en `vite.config.ts` — ya ADMITIDO por `cero_terceros.feature`
# ENMIENDA 1 (mismo día, @s27). Con esa `base` activa, `Cabecera.tsx` hornea el ÚNICO href interno
# absoluto que el sitio emite hoy (el enlace de marca, vía `import.meta.env.BASE_URL`) como
# `href="/NailsLashStudioWeb/"`. Un `tdd_craftsman` MIDIÓ (`progress/tdd_subruta_github_pages.md`
# §Remate) que ESTA PUERTA (A-17, `src/lib/puerta-cascaron.ts`, `violacionesDeEnlaces`) lo marca
# como 404 — FALSO POSITIVO: `rutasDelArtefacto` (línea ~638/656) son las rutas LÓGICAS derivadas
# de los ficheros FÍSICOS de `dist/` (`rutaDelFichero`), que GitHub Pages sirve TAL CUAL bajo la
# subruta SIN que el build cree ninguna subcarpeta física — `dist/index.html` sigue siendo la ruta
# lógica `"/"`, nunca `"/NailsLashStudioWeb/"`.
#
# **QUÉ CAMBIA, Y QUÉ NO:** @s23 y @s24 NO SE TOCAN — ni una letra — porque su `Given` NUNCA declara
# una `base`: SON, por construcción, el caso de HOY (build servido en la raíz del dominio), y bajo
# ese caso el comportamiento tiene que seguir IDÉNTICO. Se AÑADEN tres escenarios nuevos, numerados
# a continuación del último tag usado en el fichero (`@s35`), porque introducen una precondición
# (`vite.config.ts` declara `base`) que NINGUNA fila de @s23/@s24 anticipaba, y mezclarla en sus
# tablas habría obligado a añadir una columna `base` retroactiva a filas YA APROBADAS por el humano
# — el mismo criterio que ya usó `cero_terceros.feature` para sus @s41-@s43 («3 escenarios nuevos, y
# SOLO porque no encajaban en ninguno de los ya aprobados»).
#
# LOS TRES CASOS QUE SE AÑADEN, Y POR QUÉ CADA UNO:
#   (b) @s36 — un href con el prefijo de la base pero cuyo RESTO no es una ruta lógica conocida
#       SIGUE siendo violación: la base NO debe convertirse en un comodín que oculte un 404 real.
#   (a) @s37 — un href con el prefijo de la base y cuyo RESTO SÍ es una ruta lógica conocida NO es
#       violación (el caso real: `/NailsLashStudioWeb/` → resto `""` → ruta lógica `"/"`, que
#       EXISTE). La MISMA tabla ancla también (c): un href SIN el prefijo de la base, cuando SÍ hay
#       una base declarada, NO es violación DE ESTA PUERTA — ver el porqué abajo, no es gratuito.
#   @s38 — ancla que el RESTO se resuelve como ruta lógica GENÉRICA (`/servicios`, no solo la home
#       `/`): sin este escenario, una implementación podría «aprobar» solo el caso trivial
#       `href === base` sin generalizar de verdad la resta del prefijo, y quedaría INERTE frente a
#       cualquier ruta interna que no sea la portada.
#
# 🔴 **LA DECISIÓN MÁS DELICADA — (c), UN HREF SIN EL PREFIJO DE LA BASE, CUANDO SÍ HAY BASE
# DECLARADA:** ¿es un 404 real (interno-roto) o queda fuera del ámbito de esta puerta? SE DECIDE
# QUE QUEDA FUERA, tratado como los externos (mismo trato que `https://…`), y NO como violación,
# por el mismo argumento que ya usa `esRutaInterna` para excluir lo que la puerta NO PUEDE
# VERIFICAR: bajo GitHub Pages **DE PROYECTO**, la raíz del origen (`cenit-digital.github.io/`, SIN
# el prefijo `/NailsLashStudioWeb/`) puede alojar un sitio DISTINTO Y LEGÍTIMO — GitHub Pages **DE
# USUARIO/ORGANIZACIÓN**, que vive exactamente ahí [V, citado y verificado por
# `progress/enmienda1_cero_terceros_subruta.md` §1, MISMO DÍA]. Esta puerta SOLO conoce `dist/`: NO
# tiene ninguna autoridad ni visibilidad sobre lo que existe en la raíz del origen cuando el propio
# despliegue declara que su sitio vive en una subcarpeta. Marcar `/otra-cosa` como «roto» sería
# ASEVERAR ALGO QUE ESTA PUERTA NO PUEDE SABER — exactamente el tipo de falso positivo que
# `esRutaInterna` ya evita a propósito para `https://…`, `tel:`, `mailto:` y `#ancla`. Es un hueco
# DECLARADO, no cerrado: un `href="/x"` escrito a mano por error (olvidando
# `import.meta.env.BASE_URL`) NO lo cazará esta puerta bajo una base declarada. Mismo tipo de límite
# que el `fetch()` de JS ya declarado y no cerrado en F-05 (`@s34` de `cero_terceros.feature`). Hoy
# el ÚNICO mecanismo del repo para emitir un href interno es `import.meta.env.BASE_URL`, que SIEMPRE
# incluye el prefijo por construcción — el hueco es teórico hasta que alguien lo contradiga a mano.
#
# **CÓMO SE COMUNICA `base` A LA PUERTA — recomendación de arquitectura para el `tdd_craftsman`:**
# reutilizar la MISMA función `baseDeclarada(config: string)` que `src/lib/puerta-terceros.ts` YA
# tiene (hoy privada) y que `cero_terceros.feature` ENMIENDA 1 ya validó (contrato + TDD + mutación
# 100 %) para distinguir una subcarpeta legítima de un origen de tercero — «no dupliques el
# razonamiento», mismo principio que F-14 heredando de F-22. `src/lib/puerta-cascaron.ts` corre
# ANTES que `src/lib/puerta-terceros.ts` en el pipeline de `pnpm build` [V: `package.json`], así que
# NO puede apoyarse en que F-05 ya validó `base` — pero CUALQUIER `base` que no sea root-absoluta
# legítima nunca produce un href que `esRutaInterna` reconozca como interno (el prefijo se hornea
# literalmente vía `BASE_URL`, y ningún esquema ni protocolo-relativo empieza por un solo `/`), así
# que esta puerta NO necesita revalidar la legitimidad de `base`: solo necesita el PREFIJO. Detalle
# completo, con la alternativa de un módulo compartido considerada y descartada, en
# `progress/enmienda_cascaron_base.md`.
#
# NO SE TOCA: `src/lib/puerta-cascaron.ts`, `src/lib/puerta-terceros.ts`, sus tests, `vite.config.ts`
# ni `feature_list.json` (F-04 sigue `done`; esta enmienda amplía su contrato sin reabrir el ciclo
# completo — mismo patrón que la ENMIENDA 1 de `cero_terceros.feature` y la ENMIENDA 4 de
# `resenas_agregado_enlace`/`galeria_carrusel`). El `tdd_craftsman` implementa por TDD sobre este
# contrato ya amendado.
# =============================================================================================

# =============================================================================================
# ENMIENDA 2 (2026-09-28): EL HORNEADO SE HIDRATA SOBRE EL DOCUMENTO COMPLETO, Y SIN PRECARGAS DE
# FOTO QUE EL `<img>` NO REUTILIZA. @s1-@s38 SE PRESERVAN INTACTOS; SE AÑADEN @s39 Y @s40.
# =============================================================================================
# ORIGEN: la verificación EN VIVO de F-24 (Nailbot) con Chromium real contra el build de producción
# (`vite preview`). Evidencia, sondas y cifras completas: `progress/hallazgo_hidratacion_ssg.md`. Fuente
# en la spec: `project-spec.md` §Feature 4 → «Enmienda 2 (2026-09-28)». Son dos defectos PREEXISTENTES
# del horneado (se reproducen igual en `92d6b70`, anterior a Nailbot):
#
#   1. El `<script type="module">` del bundle viaja con `async` (`ssgOptions.script: 'async'`). HTML
#      Living Standard §4.12.1, literal: «For module scripts, if the async attribute is present, then
#      the module script and all its dependencies will be fetched in parallel to parsing, and the
#      module script will be evaluated as soon as it is available (potentially before parsing
#      completes). Otherwise, the module script and its dependencies will be fetched in parallel to
#      parsing and evaluated when the page has finished parsing. (The defer attribute has no effect on
#      module scripts.)». vite-react-ssg hornea el snapshot del router
#      (`window.__staticRouterHydrationData`) al FINAL del `<body>` y el cliente lo lee ANTES de
#      hidratar: con `async`, el módulo puede arrancar sin él. MEDIDO (cargas en frío, CPU ×4): con
#      `async`, 3/20 · 4/20 · 1/24 en HEAD `3c171ff` y 6/20 en `92d6b70` lanzan el #418 de React y la
#      home queda SIN CONTENIDO (0 `<h1>`, 0 `<section>`, sin robot: rompe también @s2 de
#      `nailbot_flotante.feature`); sin `async`, 0/20 · 0/20 · 0/8. El bundle es byte a byte el mismo:
#      solo cambia el atributo. El «porqué» antiguo de `async` («el JS no bloquea el parseo»,
#      `docs/research/stack-ssg-seo.md`) era FALSO para módulos: un módulo nunca bloquea el parseo. → @s39
#   2. vite-react-ssg inyecta `<link rel="preload" as="image" crossorigin="">` por cada foto importada
#      por un módulo renderizado (hoy 13), y las 13 `<img>` son `loading="lazy"` y sin `crossorigin`:
#      el modo de credenciales no casa y la precarga no se reutiliza. MEDIDO por CDP en `vite preview`:
#      las 13 fotos se piden ANTES de desplazarse (≈ 509 KiB declarados perezosos, compitiendo con el
#      LCP), 26 respuestas en total (cada foto DOS veces) y dos avisos de consola por foto. Matiz
#      honesto: en GitHub Pages la segunda descarga podría salir de la caché HTTP, y eso NO se ha
#      medido; la precarga anticipada y los avisos ocurren en cualquier servidor. → @s40
#
# QUIÉN LO DECIDE: el `craftsman_lead`, con la autonomía que el humano delegó el 2026-09-28 («hazlo tú
# el 100 % de forma autónoma»), mismo precedente que las enmiendas de la galería.
#
# QUÉ NO CAMBIA: NINGÚN escenario anterior (@s1-@s38) se toca, ni una letra. Las precargas de FUENTE
# (`as="font"`) SIGUEN: son las de F-05 (`cero_terceros.feature`) y su número se fija allí, no aquí. Las
# fotos siguen `loading="lazy"`; la precarga de la imagen del LCP, si algún día la hay, es de F-17
# (`pipeline_imagenes`), con fotos reales. `feature_list.json` no se toca (F-04 sigue `done`; mismo
# patrón que la ENMIENDA 1).
#
# MUTABILIDAD, DECLARADA (no fingida; matizada tras el TDD, 2026-09-28). La corrección tiene dos partes:
#   - NO-MUTABLE: lo que vive en `vite.config.ts` (fuera de `mutate` de `stryker.config.json`): la
#     AUSENCIA de `ssgOptions.script` (@s39) y la línea que cablea `ssgOptions.onPageRendered` (@s40).
#     @s39/@s40 se aseveran en un test build-based (`*-horneado.test.*`), excluido de la mutación por
#     `vitest.stryker.config.ts`. Su defensa es el test por bytes sobre el artefacto real, el `judge` y
#     la sonda de hidratación repetida en vivo con más cargas (tiene que dar 0).
#   - MUTABLE: la lógica de @s40, `sinPrecargasDeImagen` (`src/lib/horneado.ts`), está en `mutate` y le
#     aplica el umbral del 100 % con sus tests unitarios (`src/lib/horneado.test.ts`).
# (Texto propuesto por el judge en `progress/judge_cascaron_enmienda2.md` §5; ningún escenario cambia.)
#
# OBSERVADO al verificar esta enmienda, FUERA DE SU ALCANCE (no se decide aquí; es de F-05): el
# artefacto de HEAD lleva 12 `<link rel="preload" as="font">` (6 fuentes × {`.woff2`, `.woff`}), y las 6
# que apuntan a un `.woff` declaran `type="font/woff2"`.
# =============================================================================================

# =============================================================================================
# ENMIENDA 3 (2026-09-28): SOLO SE PRECARGAN LAS FUENTES `.woff2`; EL `.woff` QUEDA DE RESPALDO EN
# `@font-face`. @s1-@s40 SE PRESERVAN INTACTOS; SE AÑADE @s41.
# =============================================================================================
# ORIGEN: lo OBSERVADO al final del banner ENMIENDA 2, medido por el `craftsman_lead` con Chromium (CDP)
# sobre el build de producción. Fuente en la spec: `project-spec.md` §Feature 4 → «Enmienda 3
# (2026-09-28)». vite-react-ssg (`renderPreloadLink`, rama `.woff/.woff2/.ttf`) inyecta un
# `<link rel="preload" as="font" type="font/woff2" crossorigin>` por CADA fichero de fuente del
# manifiesto: hoy 12 (6 `.woff2` + 6 `.woff`), y los 6 que apuntan a un `.woff` declaran además un
# `type` FALSO (`font/woff2`). MEDIDO (carga en frío, página recorrida entera): Chromium descarga los 12;
# retirando SOLO las 6 precargas `.woff`, pide 0 `.woff` y carga EXACTAMENTE las mismas caras (Manrope
# 400/600/700, Gilda Display 400, Great Vibes 400) desde los `.woff2`. Los 6 `.woff` pesan 124 440 bytes
# (más que los 6 `.woff2`, 119 540): se ahorran en CADA visita. WOFF2 lo soportan todos los navegadores
# del objetivo del build (`baseline-widely-available`: chrome107, edge107, firefox104, safari16;
# `caniuse-lite` 1.0.30001805: primera versión con soporte Chrome 36, Edge 14, Firefox 39, Safari 12). → @s41
#
# QUIÉN LO DECIDE: el HUMANO, no el `craftsman_lead`: AskUserQuestion del 2026-09-28, respuesta literal
# «Solo precargar .woff2». (Diferencia con la ENMIENDA 2, que fue autonomía delegada.)
#
# QUÉ NO CAMBIA: NINGÚN escenario anterior (@s1-@s40) se toca, ni una letra. @s40 sigue en pie tal cual
# (su ancla pide «al menos 1» `as="font"`, y quedan 6); su comentario «hoy son 12» es HISTÓRICO de la
# ENMIENDA 2. El CSS NO SE TOCA: el `.woff` sigue como RESPALDO en el `src` de cada `@font-face`; lo que se
# retira es la PRECARGA, nunca la fuente. F-05 (`cero_terceros.feature`) NO CAMBIA: su puerta cuenta los
# PARES `[familia, peso]` de los `@font-face` del CSS (6 pares), nunca las precargas, y ningún escenario
# suyo fija su número. Por eso esto es de F-04 y no de F-05, al contrario de lo que anticipaba el banner
# ENMIENDA 2: la precarga la inyecta el HORNEADO, y el horneado es de esta feature. `feature_list.json`
# no se toca (F-04 sigue `done`; mismo patrón que las ENMIENDAS 1 y 2).
#
# MUTABLE, AL CONTRARIO QUE LA ENMIENDA 2: la lógica vive en el retoque PURO del HTML de
# `src/lib/horneado.ts` (el mismo de la ENMIENDA 2, cableado en `ssgOptions.onPageRendered`), que SÍ está
# en `mutate`: TDD un test a la vez sobre fixtures escritos a mano y mutación al 100 %. El test sobre los
# bytes de `dist/` es build-based (`*-horneado.test.*`, excluido de Stryker): demuestra que el cableado
# llega al artefacto real, no sustituye a la mutación de la lógica.
#
# LÍMITE DECLARADO (judge, progress/judge_cascaron_enmienda3.md, recomendación 2): «termina en `.woff`» es
# literal. Una precarga hacia `/x.woff?v=1` o con espacios alrededor del `href` la descargaría el
# navegador y NO la retirarían ni la función ni el test: fallaría ABIERTO en los dos lados. Hoy no ocurre
# (Vite pone el hash en el nombre del fichero, sin query, y `jsdom.serialize()` no añade espacios); si
# algún día cambia, el criterio se amplía con su propio escenario.
#
# FUERA DE ALCANCE (anotado, NO decidido): Manrope 500 se precarga y se declara, pero tras recorrer la
# home entera a 1280 px `document.fonts` lo deja `unloaded`; no se ha auditado si alguna regla lo usa en
# otro estado o ancho. Es la lista de F-05 y la decide F-05.
# =============================================================================================

# =============================================================================================
# ENMIENDA 4 (2026-09-28): LOS TESTS QUE CONSTRUYEN EL SITIO LO CONSTRUYEN EN MODO PRODUCCIÓN.
# @s1-@s41 SE PRESERVAN INTACTOS; SE AÑADEN @s42, @s43 Y @s44 (Y @s45, AMPLIACIÓN DEL MISMO DÍA).
# =============================================================================================
# ORIGEN: lo «Observado, fuera del alcance» de `progress/tdd_cascaron_enmienda2.md`, confirmado por el
# judge (`progress/judge_cascaron_enmienda2.md` §4, «Punto 4»). Fuente en la spec: `project-spec.md`
# §Feature 4 → «Enmienda 4 (2026-09-28)». Los tres ficheros build-based (`src/pages/home-horneado.test.ts`,
# `src/pages/contacto-horneado.test.ts` y los experimentos de `src/lib/trampas-del-horneado.test.tsx`)
# lanzan el build desde Vitest con `execSync` y HEREDAN `NODE_ENV=test`; vite-react-ssg toma el modo de
# `process.env.MODE || process.env.NODE_ENV || … || 'production'` (`vite-react-ssg.DsKK_1op.mjs:704`).
# MEDIDO por el `craftsman_lead` (mismo commit, dos builds): el HTML sale igual salvo los hashes (del
# bundle y el aleatorio `__VITE_REACT_SSG_HASH__`), pero el JS NO:
#
#   Build                                      app-*.js    client-*.js   jsxDEV en app-*.js   fileName:"/…/src/…" del disco
#   NODE_ENV=test (lo que hoy ven los tests)   287 985 B   354 070 B     368                  sí
#   pnpm build directo (lo que se publica)     164 751 B   180 764 B     0                    no
#
# CONFIRMADO por el `gherkin_author` (2026-09-28) sobre los artefactos que dejó la suite en este repo:
# `dist/assets/app-*.js` con 368 `jsxDEV` y 365 `fileName:"/home/user/NailsLashStudioWeb/src/…"`; cada uno
# de los 5 experimentos de `trampas` con 13-14 `jsxDEV` y 10-11 `fileName:"…"`. El TAMAÑO en modo test
# depende de la ruta del disco, incrustada en cada `fileName` (el mismo experimento pesa 150 800 B
# construido bajo el repo y 151 251 B bajo una ruta más larga; en el repo, el `app-*.js` pesa 262 070 B):
# lo estable es el RECUENTO, no los bytes. Es decir: los tests que dicen aseverar «el artefacto REAL de
# producción» miran un bundle con React en modo DESARROLLO. Hoy no cambia ningún veredicto (todo lo
# aseverado vive en el HTML y en las puertas), pero es un hueco de fidelidad: cualquier aserción futura
# sobre el JS, o sobre código que dependa de `import.meta.env.PROD`/`MODE`, divergiría EN SILENCIO.
# → @s42 (home-horneado), @s43 (contacto-horneado), @s44 (los 5 experimentos de trampas)
#
# DECISIÓN: esos builds se lanzan con `NODE_ENV=production` explícito en el entorno del SUBPROCESO (el
# resto del entorno se hereda). QUIÉN LO DECIDE: el HUMANO, AskUserQuestion del 2026-09-28, respuesta
# literal «Sí, modo producción».
# AMPLIACIÓN (mismo día, tras el TDD de @s42-@s44; `progress/tdd_cascaron_enmienda4.md` «Observado»): el
# modo NO lo fijaba solo `NODE_ENV=test`. Vitest exporta también `MODE=test` y vite-react-ssg lee `MODE`
# ANTES que `NODE_ENV`: con solo `NODE_ENV=production` el bundle ya es idéntico al publicado, pero el modo de
# Vite sigue siendo `test` (su log: «building client environment for test»). Por eso los tres lanzamientos
# llevan también `MODE: 'production'`. → @s45
#
# QUÉ NO CAMBIA: NINGÚN escenario anterior (@s1-@s41) se toca, ni una letra, y lo que ya aseveran esos tres
# ficheros sigue en verde sobre el build en producción. El DESPLIEGUE NO ESTABA AFECTADO:
# `.github/workflows/deploy-pages.yml` ejecuta `pnpm build` en su propio paso, después de la suite, y eso
# es lo que se publica. `vitest.stryker.config.ts` SIGUE excluyendo `**/*-horneado.test.{ts,tsx}` de la
# mutación. `vite.config.ts` y `feature_list.json` no se tocan (F-04 sigue `done`; mismo patrón que las
# ENMIENDAS 1-3).
#
# NO-MUTABLE, DECLARADO (no fingido): lo que cambia es el LANZAMIENTO de los tests build-based (el entorno
# de su `execSync`): son ficheros de test, fuera de `mutate`, y Stryker los excluye. Su defensa: los tres
# escenarios por bytes nacen en ROJO sobre los artefactos de hoy (con sus anclas ya en VERDE), y el `judge`.
# =============================================================================================

# =============================================================================================
# ENMIENDA 5 (2026-10-01): TODO `<link>` ROOT-ABSOLUTO DEL ARTEFACTO RESUELVE, BAJO LA BASE, A UN
# FICHERO NO VACÍO Y QUE SE PUBLICA (H-5). @s1-@s45 SE PRESERVAN INTACTOS; SE AÑADEN @s46-@s72.
# ESTADO: PUERTA HUMANA APROBADA por Pablo el 2026-10-01 (~17:45, AskUserQuestion): el contrato tal cual
# (@s46-@s72); S-11 y S-12 RATIFICADOS, incluido el cambio de veredicto latente de S-12; aceptadas las dos
# excepciones (el ayudante `elementos` delega en `elementosDe`, y @s67, @s70, @s71 y @s72);
# `REGLA_RUTA_AUSENTE` NO entra en H-5 (queda declarada). Implementación: inmediata.
# =============================================================================================
# ORIGEN: el H-5 de `progress/tdd_favicon_marca.md` §6 (ronda 2) y la menor 8 de
# `progress/judge_favicon_marca.md`, que el `cierre` de F-28 anotó como «deuda de F-05»
# (`feature_list.json:549`). Fuente en la spec: `project-spec.md` §Feature 4 → «Enmienda 5
# (2026-10-01)». Brief: `progress/brief_h5_enlaces_horneados.md`; verificación previa, que lo corrige en
# 19 puntos y PREVALECE sobre sus §2-§6: `progress/verificacion_decisiones_h5.md`. Mapa escenario →
# spec → mutante y las revisiones adversariales (la ronda 1 añadió @s65-@s67 y rehízo @s52; la ronda 2,
# @s68-@s72; la pasada final de los revisores A y B, ningún escenario):
# `progress/gherkin_h5_enlaces_horneados.md`.
#
# EL HALLAZGO: si falta en `public/` un fichero que `index.html` enlaza en un `<link>` (hoy, los tres
# iconos de F-28, `index.html:6-8`), `vite-react-ssg build` hornea el `href` SIN la base y sale con 0, y
# ninguna de las cinco puertas de `pnpm build` lo ve: en GitHub Pages DE PROYECTO ese `href` pide fuera
# del sitio, el 404 del H-2 que curó F-28. Lo hace el CÓDIGO de Vite 7.3.6, no su documentación («asset
# references in your `.html` files are all automatically adjusted», sin condición): lee el `href` de
# todo `<link>` sea cual sea su `rel` (config.js:23280-23300), solo le pone la base si encuentra el
# fichero (:24037-24038) y, si no, devuelve la URL intacta (:23972-23978). TRES FIRMAS del H-5, DOS 404
# Y UN ICONO VACÍO, todas con `pnpm build` en 0 y las cinco puertas de hoy en ✓:
#
#   Caso                                            href horneado                    fichero    medida
#   (a) public/favicon.svg borrado                  /favicon.svg (SIN la base)       no existe  lead
#   (b) base escrita a mano en index.html, sin él   /NailsLashStudioWeb/favicon.svg  no existe  ronda 1
#   (c) public/favicon.svg a 0 bytes                /NailsLashStudioWeb/favicon.svg  0 B        lead
#
# (a) y (c), «lead»: brief §2, Node 22, Windows, build en un temporal con `NLS_DIST_DIR`. (b) NO la midió
# F-28 (spec, «Las tres firmas del H-5»; errata anotada en el brief §2): su H-6 cambió solo el `href` de
# `index.html` y DEJÓ el fichero en `public/` (`progress/tdd_favicon_marca.md:129` y :308-310). La midió
# la ronda 1 de revisión el 2026-10-01: el árbol de HEAD con ese `href` y sin `public/favicon.svg`,
# construido con `NLS_DIST_DIR` en un temporal, sale con 0 en `vite-react-ssg build` y en las cinco
# puertas, con el `href` tal cual y sin `favicon.svg` en el artefacto; su control, el árbol sin tocar, 0
# y 2244 B. (a) y (b) son un 404 en GitHub Pages; (c) es un icono VACÍO, roto aunque responda 200: Pages
# sirve un fichero de 0 B con 200 y `content-length: 0` (spec, medido en un sitio de Pages publicado desde
# una rama). La puerta falla cerrada ante las tres.
#
# Es DEFENSA EN PROFUNDIDAD: en el camino oficial la suite corre antes que `pnpm build`
# (`deploy-pages.yml:51` y `:68`) y ya lo caza (F-28 @s2-@s8); con esta enmienda lo para el propio build,
# también en una publicación que se salte la suite.
#
# QUIÉN LO DECIDE: el HUMANO (Pablo, AskUserQuestion, 2026-10-01 ~11:50; brief §8). H5-1 dueño F-04
# (FS-6 de F-28 NO era argumento); H5-2 alcance: TODO `<link>` con `href` root-absoluto, sea cual sea su
# `rel`, en todo HTML del artefacto, con «root-absoluto» definido tras la limpieza del navegador, y `/\`
# falla cerrado; H5-3 resolución ESTRICTA (solo la raíz del artefacto va a `index.html`); H5-4 `%` y `&`
# fallan cerrado con regla PROPIA, sin decodificar (falso positivo CONSCIENTE); H5-5 la lista de ficheros
# entra como campo OPCIONAL de la petición, que falla cerrado si falta y hay algo que resolver (precedente
# `base?`); H5-6 al terminar, fusionar, publicar y comprobar en la web publicada. Los huecos que §8 no
# cierra (S-1..S-12: S-7 a S-10 son de la ronda 1 de revisión de la spec, y S-11 y S-12, de la ronda 2) y
# los textos exactos de las reglas y las líneas los decidió el `spec_partner`, y SE RATIFICAN EN ESTA
# PUERTA. La spec recomienda ratificar S-11 y S-12 tal cual («Preguntas abiertas»), sabiendo que S-12,
# con la config en una línea, es un CAMBIO DE VEREDICTO latente (abajo).
#
# QUÉ CAMBIA: la puerta del cascarón extrae el `href` de TODOS los `<link>` de TODAS las HTML del
# artefacto, sobre el documento ENTERO y con el extractor de la canónica (`ENLACE` + `ATRIBUTO_HREF`,
# `src/lib/puerta-cascaron.ts:72-74`); lo limpia como el navegador; y resuelve cada root-absoluto contra
# la LISTA de ficheros del artefacto, por igualdad EXACTA y con su caja, nunca con `existsSync` (en
# Windows el disco no distingue la caja, y `/NailsLashStudioWeb/FAVICON.SVG` da 404 en GitHub Pages,
# medido). CINCO reglas nuevas (la 4 también, S-11, para los segmentos `.` y `..` de la ruta, el último
# incluido, que el navegador normaliza y la puerta no, y para el `//`, que el navegador CONSERVA y GitHub
# Pages sirve con 200, medido; la 5, para un `<link>` a un fichero OCULTO, que el despliegue no publica,
# S-8), una guarda anti-vacuidad del extractor nuevo y DOS cortes con su línea: lista de ficheros
# ausente (S-3) y base declarada NO UTILIZABLE (S-12). Textos EXACTOS al principio de
# la sección de @s46, al final de este fichero.
# CAMBIO DE VEREDICTO DECLARADO (se ratifica aquí): un artefacto que HOY pasa con 0 y cuya canónica no
# lleva `href` entre comillas dobles (sin `href`, con comillas simples o sin comillas), sin ningún otro
# `href` de `<link>`, pasa a FALLAR por la guarda nueva, con la lista y sin ella (@s59 filas 1-2) [V: la
# puerta de hoy, copia literal de `src/lib/puerta-cascaron.ts`, da `{"codigoSalida":0,"lineas":[]}` sobre
# la canónica sin `href` y sobre la de comillas simples]. Es la ÚNICA excepción a «sin ningún `<link>`
# root-absoluto, la puerta hace lo de hoy» (@s57).
# CAMBIO DE DIAGNÓSTICO, Y UNO DE VEREDICTO LATENTE, DECLARADOS (S-12; se ratifican aquí): con una
# `base` declarada que no empieza por `/`, empieza por `//` o no acaba en `/`, y algún `<link>`
# root-absoluto, el build lo para ya esta puerta, la 1.ª de `pnpm build` (`package.json:16`), con una
# línea que ENSEÑA la base. Sin S-12 serían 10 reglas 1 o 2 FALSAS sobre la home real (spec, S-12,
# medido). Casi siempre cambia solo el DIAGNÓSTICO: con la dinámica, `./`, la cadena vacía o
# `//cdn.tercero.com/`, que F-05 (la 4.ª) rechaza, su línea no llega a imprimirse; con
# `/NailsLashStudioWeb`, la puerta de hoy ya falla por la anti-404 de `<a>` (la marca). Pero si la base
# empieza por `/`, no por `//`, y no acaba en `/`, F-05 la ACEPTA (`esRutaPropiaRootAbsoluta`,
# `src/lib/puerta-terceros.ts:213-215`), y si además la anti-404 de `<a>` no salta, hoy la puerta sale
# con 0 y con H-5 corta: cambia el VEREDICTO. Es la config en UNA línea
# (`base: '/NailsLashStudioWeb/' })`): `BASE_DE_VITE` (:123) corta en la `,` o en el salto de línea, no
# en la `}`, así que `baseDeclarada` lee `"/NailsLashStudioWeb/ })"`, y la puerta de hoy da
# `{"codigoSalida":0,"lineas":[]}` sobre la home real, con la base REAL bien puesta, porque la config
# es JavaScript válido (spec, «La base», medido en su ronda final; re-medido en la pasada final del
# Gherkin). Un `pnpm build` que hoy pasa fallaría con la línea de la base, sola [I: sin build]. Es una
# falla cerrada CONSCIENTE del lector de TEXTO (el hueco de `baseDeclarada`, abajo), latente:
# `vite.config.ts:31` trae una sola `base:`, en su propia línea y acabada en `,`. Sin ningún candidato,
# lo de hoy: validar la base sigue siendo de F-05 (@s27). Lo fijan @s54, @s68 (su fila 4 es la config
# en una línea) y @s69.
#
# QUÉ NO CAMBIA: NINGÚN escenario anterior (@s1-@s45) se toca, ni una letra, ni ningún fixture de sus
# tests. Eso vale para la LETRA, con dos salvedades DECLARADAS. (1) @s59 fila 1 FIJA un comportamiento
# que @s13 nunca había decidido: un `<link rel="canonical">` sin `href` entre comillas dobles cuenta como
# canónica PRESENTE (S-9; ya es así hoy: `canonicaDeLaPagina` da "" y la regla solo acusa `null`, :491).
# Quien endurezca @s13 a «ausente o vacía» deja la guarda nueva sin ningún fixture que la mate: vuelve con
# ella a la puerta humana (otro fixture, o retirarla) y NUNCA excluye sus mutantes. (2) El ayudante
# `elementos` de `src/pages/home-horneado.test.ts` pasa a delegar en uno NUEVO que recibe el texto (@s62),
# sin cambiar su comportamiento ni ninguna de sus llamadas.
# LAS LLAMADAS DE HOY A LA PUERTA no traen ningún `<link>` root-absoluto (los dos de
# `puerta-cascaron.test.ts`, :1116 y :1706, van a `canonicaDeLaPagina`, no a la puerta) y ninguna cambia
# de veredicto, pero NO todas por la misma razón (spec, «Ausente, sin ninguno»). Las 11 de
# `src/lib/puerta-cascaron.test.ts` son 13 ejecuciones (la de :882 es un `it.each` de 3 filas): las 10
# con página llevan la canónica con `href` (la guarda nueva cuenta al menos 1) y las 3 sin página no
# llegan a ella. La de F-06 (`src/lib/puerta-anclas.test.ts:432-435`) NO lleva ninguna: `<head></head>`
# y 0 `<link>`; su veredicto (≠ 0) no cambia SOLO porque ya sale con 6 violaciones, que devuelven antes
# que cualquier guarda (`src/lib/puerta-cascaron.ts:830-832`): ese orden, sin ningún `href` de `<link>`
# y con violaciones, lo fija @s59 fila 4. Lo mismo los experimentos head-espacio, head-mayusculas y
# head-atributo de @s33, que corren el humilde: 0 `<link>` y ≠ 0 por otras violaciones.
# ACOPLAMIENTO DECLARADO: quien le quite a uno de ellos sus violaciones para que espere 0 tendrá que
# darle una canónica (si no, «canónica ausente»), y se la da con `href` ABSOLUTO (como la de
# `htmlCrudo`, "https://example.invalid/"), o, si la quiere root-absoluta, pasándole a la puerta una
# lista en la que resuelva: sin `href`, la guarda hablaría (la 1ª fila de @s59); y con un `href`
# root-absoluto ("/", p. ej.) y sin lista, el `<link>` es candidato y la puerta sale por el corte de S-3
# (@s57 filas 1-3), no con 0. Nunca se retira la guarda.
# Ninguna línea de hoy cambia: ni el `✓` del humilde, ni el `✗` final, ni las de @s26-@s29, ni `href
# interno sin fichero en dist/`. La anti-404 de `<a>` (A-17, @s23/@s24, @s36-@s38) sigue igual, @s37
# incluido. Las TRES ASIMETRÍAS entre `<a>` y `<link>` están DECLARADAS (spec, «Las tres asimetrías»).
# (1) Un `<a href="/otra-cosa">` bajo base sigue FUERA de esta puerta, y un `<link>` así es la regla 1
# (@s47): Vite procesa el `href` de todo `<link>` y lo deja sin la base cuando falta el fichero, así que
# en este stack un `<link>` root-absoluto sin la base es la firma (a), no un hiperenlace a otro sitio.
# (2) Para `<link>` la puerta mira FICHEROS, y para `<a>`, rutas LÓGICAS (@s51). (3) La limpieza del
# navegador, la barra invertida inicial (S-7) y la regla 4, con los segmentos de S-11, son SOLO de
# `<link>`: la anti-404 de `<a>` sigue aplicando `RUTA_INTERNA` (:561) al `href` CRUDO (:631), así que
# `<a href=" /NailsLashStudioWeb/aviso-legal">` y `<a href="\NailsLashStudioWeb/aviso-legal">` NO se
# acusan aunque el navegador pida esa ruta: un falso negativo de A-17, HEREDADO y no cerrado (cerrarlo es
# una enmienda de A-17, con su propia puerta humana; @s23/@s24 no se tocan). Tampoco cambian
# `inspeccionarSitio` (S-4), `ArtefactoDeProduccion` (F-06 no se toca), `tools/artefacto.ts`, F-05,
# `vite.config.ts`, `index.html` ni `public/`. `feature_list.json` no se toca (F-04 sigue `done`; mismo
# patrón que las ENMIENDAS 1-4); la «deuda de F-05» de su línea 549 la reetiqueta el lead como deuda de
# F-04 al cerrar (H5-1).
#
# MUTABLE: la lógica vive en `src/lib/puerta-cascaron.ts` (ya en `mutate`), que se re-muta ENTERO al 100 %
# y con 0 exclusiones; los tests unitarios de @s46-@s60, @s65, @s66, @s68 y @s69 lo matan SOLOS, guarda,
# lista y base incluidas.
# NO-MUTABLE, DECLARADO: el humilde `tools/puerta-cascaron.ts` (cablea la lista con `readdirSync`
# recursivo, solo ficheros, ocultos y HTML incluidos, y `statSync`, NUNCA `readFileSync`; y la lista solo
# se recorre cuando la puerta la pide) y el extremo a extremo de @s61, @s62, @s67 y @s70-@s72,
# build-based y fuera de Stryker (`vitest.stryker.config.ts`). Su defensa: ese extremo a extremo, la
# demostración del lead (@s63) y el `judge`.
#
# TAG NUEVO: `@demostracion-del-lead` (@s63): un rojo demostrado A MANO por el lead sobre el árbol; no es
# un test. @s64 lleva `@verificacion-viva` (precedente: @s9 de `favicon_marca.feature`): se hace sobre la
# web publicada, después de H5-6, y es un CONTROL de regresión, no evidencia de H-5. Los dos se anotan en
# `progress/verificacion_viva_h5_enlaces_horneados.md`.
#
# HUECOS DECLARADOS (spec, «Huecos DECLARADOS»; ningún escenario los cierra): `href` relativos (uno que
# EMPIEZA por barra invertida no lo es: es candidato y la regla 4 lo acusa, S-7, @s50); URL absolutas y
# `//host`: las de terceros son de F-05 SOLO con un `rel` de petición o contacto de sus listas
# (`src/lib/terceros.ts:92-99` y :109), y con `apple-touch-icon`, un `rel` desconocido o sin `rel` no las
# ve NINGUNA de las dos puertas: es la deuda de FS-6 de F-28 (`project-spec.md:4678`), que SIGUE ABIERTA y
# hoy solo cubren los tests de F-28 para los 3 iconos actuales; `<script src>`, `<img src|srcset>`,
# `<source>` y `url()` del CSS (hoy salen con hash y con la base); `fetch()` del JS; `<base href>`, que
# la puerta ignora; comillas simples o sin comillas (teórico: `jsdom.serialize()` emite dobles); el umbral
# de 0 bytes (un icono truncado a 1 B pasa); el atributo `vite-ignore`, que la puerta no lee (la regla 1
# acusa su efecto); otros controles C0 en los extremos del `href`, que el navegador recorta y la puerta
# no; `REGLAS_DEL_CASCARON`, que su comentario llama «TODAS las reglas» y hoy no trae la de @s26 (@s60);
# la anti-404 de `<a>`, que no limpia el `href` ni tiene regla 4 (la asimetría 3, de arriba);
# `baseDeclarada`, que lee TEXTO y no evalúa la config: un texto con forma de base utilizable que no es la
# base real (un comentario `// base: '/vieja/',` delante de la línea real) pasa el predicado de S-12, y
# cada `<link>` con la base real daría la regla 1: falla cerrada, con un mensaje inexacto (spec, medido;
# hoy `vite.config.ts` trae UNA sola aparición de `base:`), y al revés, la base REAL en una config de una
# línea da "/NailsLashStudioWeb/ })", que no pasa el predicado, y la puerta corta un build que hoy pasa
# (el CAMBIO DE VEREDICTO latente, arriba); y la caja en el build: en `vite build`, `checkPublicFile`
# acaba en `tryStatSync` (config.js:8096-8104), así que en Windows un `href` con la caja equivocada se
# hornearía CON la base (firma b) y en Linux SIN ella (firma a) [I: código de Vite, sin medir]; la
# comparación exacta caza las dos, y por eso el extremo a extremo no siembra un sabotaje de caja (la
# fijan @s47 y @s48). Lo que la guarda nueva NO certifica (que se resolviera algún root-absoluto) lo
# prueba el extremo a extremo (@s61, @s62).
# =============================================================================================

# Contrato de la feature 4 (`cascaron_semantico`) de feature_list.json.
# Destilado de project-spec.md → «Feature 4: cascaron_semantico — la cáscara HORNEADA, el JSON-LD
# de cero y la puerta que mira dist/». Encarna T-6 («JSON-LD escrito de cero, sin aggregateRating»)
# y es la primera aplicación dura de I-8 («verde ≠ funciona: en SSG hay dos estados, y jsdom solo
# ve el segundo»).
#
# Aprobado por el humano en la puerta de aprobación (2026-07-16, sobre los 35 escenarios).
# Cierra en su redacción:
#   - A-17 → F-04 = la PUERTA ANTI-404 (ningún href interno apunta a una ruta inexistente en
#            dist/); F-16 = las rutas, los enlaces y el contenido legal. El troceado se
#            contradecía (`:673` «aún sin destino» vs `:683` «responde 200») y F-04 NO puede
#            prometer un aviso legal conforme: no existen razón social ni NIF válido [V].
#            Y «responde 200» NO prueba conformidad: /es/confidentiality_ws del cliente da 200 y
#            es jurídicamente nulo (@s23, @s24)
#   - A-18 → SC 2.4.11 (foco no oscurecido) es de F-06, NO de F-04: no puede testear que la
#            cabecera tape el foco quien no monta la cabecera. F-04 PONE el scroll-padding-top,
#            F-06 VIGILA que funcione (@s11)
#   - A-19 → el JSON-LD de F-04 NO emite horario (es de F-10). Pero F-04 FIJA LA REGLA que F-10
#            hereda: openingHoursSpecification, NUNCA openingHours, y JAMÁS las dos — coexisten
#            y ambas son válidas por ramas distintas [V]; sin fijarlo, dos implementadores
#            eligen distinto y AMBOS pasan los tests (@s35)
#   - A-20 → priceRange NO entra. Es Text («for example $$$» [V]): un número es sintácticamente
#            válido y basura semántica, degrada en silencio. Y los precios están bloqueados
#            (B-5/F-09): emitir un rango sin precios verificados sería INVENTAR. Las dos razones
#            son independientes: la de los precios basta sola (@s9)
#   - A-21 → el origen de la canónica entra como PLACEHOLDER cubierto por la puerta de F-01: el
#            build de PRODUCCIÓN rompe hasta que el cliente decida el dominio, el de desarrollo
#            no. Es la decisión 9 aplicada literalmente. F-04 NO duplica la puerta de F-01: se
#            apoya en ella (@s34)
#   - A-22 → el title queda FIJADO: home → «Nails Lash Studio · Uñas, pestañas y cejas en Las
#            Rozas de Madrid»; resto → «<Sección> · Nails Lash Studio». Es criterio de
#            PROYECTO/SEO, JAMÁS SC 2.4.2 (cuyo listón es «describe topic or purpose», con CERO
#            requisito de unicidad [V]). Sin este literal el mutante del orden SOBREVIVÍA y el
#            acceptance «mutar la composición rompe un test» no tenía nada que mutar (@s1, @s2)
#   - @s18 → CONFIRMADA como DÉCIMA regla de violación (`section` con título visible sin
#            aria-labelledby). La enumeración del spec tenía nueve por descuido. Es LA ÚNICA de
#            las diez que mide SC 1.3.1 de verdad: las otras nueve son criterio de proyecto o
#            requisito de Google. Lo detectó el gherkin_author y AVISÓ en vez de colarla
#
# DOS CORRECCIONES QUIRÚRGICAS APLICADAS EL 2026-07-17, CON APROBACIÓN HUMANA EN LA PUERTA. Las
# levantó el `tdd_craftsman` implementando (`progress/tdd_cascaron_semantico.md` §2 y §3) y las dos
# eran REALES. El contrato SIGUE APROBADO y SIGUE TENIENDO 35 ESCENARIOS: son un `Then` y una fila,
# no escenarios nuevos.
#   - @s32 → su `Then` tenía un ERROR DE HECHO: decía que el HTML crudo de dist/ no contiene ningún
#            `<title>`, y SÍ LO CONTIENE — `renderToString` NO hoistea la metadata de React 19 al
#            `<head>`: LA EMITE EN EL `<body>`. Lo que sale vacío es el `<head>`, que es lo único
#            que importa. No es cosmético: una puerta que escanee el documento entero encuentra ese
#            `<title>` y NO ACUSA — casi cuesta la feature (§2)
#   - @s18 → le FALTABA la fila que prueba «a un heading real»: ninguna de las tres distinguía un
#            `<h2 id="x">` de un `<div id="x">`, así que el coladero que la propia prosa prohíbe
#            PASABA. Sin esa fila, la única regla del contrato que mide SC 1.3.1 de verdad no
#            protegía el acceptance 1 (§3)
# Razonamiento completo, con los cálculos y las citas: `progress/f04_verificacion_previa.md`.
# Aquí no hay nada que adivinar: lo que no está escrito, no está decidido.
#
# FUENTE DE VERDAD DE LOS HECHOS: `progress/f04_verificacion_previa.md` (18 subagentes, 9
# afirmaciones × verificar + refutar adversarialmente: 4 CONFIRMADAS, 5 MATIZADAS, 0 refutadas de
# raíz). Donde el troceado de `docs/research/00-fase0-informe.md` §7 y esa verificación se
# contradigan, MANDA LA VERIFICACIÓN. Ninguna decisión de F-04 cayó; CINCO justificaciones sí.
# El patrón del día, otra vez: *la decisión es correcta, el porqué escrito es falso.*
#
# Cierra en su redacción:
#   - A-17 (cerrada por el humano) → F-04 = cáscara + PUERTA ANTI-404 (@s23, @s24). F-04 NO crea
#           las páginas legales ni emite los enlaces legales del pie: eso es F-16. El acceptance 3
#           viejo («el enlace del aviso legal responde 200») NO se destila: era insostenible
#           (ver «El 200 hueco» más abajo). El acceptance 4 viejo («aparece en todas las páginas»)
#           decae con él y se muda a F-16.
#   - T1  → la metadata NATIVA de React 19 PIERDE en el prerender → PROHIBIDA. La única vía es
#           `<Head>` de vite-react-ssg (@s32)
#   - T2  → el `replace('<head>', …)` es literal y silencioso → escenario que lo pincha (@s33)
#   - T3  → un `<title>` vacío DESAPARECE del dist, no sale vacío → la violación es «ausente O
#           vacío», o el caso se escapa (@s13)
#   - El `vatID` «10656940» del cliente NO es válido y NO se repara: se RECHAZA (@s10)
#   - `geo` se FIJA a la constante y JAMÁS se recalcula desde OSM (@s8, @s21)
#   - A-18 (cerrada por el lead) → `SC 2.4.11` ES DE F-06, NO DE F-04: F-04 no puede testear que la
#           cabecera no tape el foco cuando LA CABECERA LA MONTA F-06. **F-04 PONE el
#           `scroll-padding-top`; F-06 VIGILA QUE FUNCIONE** (@s11)
#   - A-21 (cerrada) → el ORIGEN de la canónica entra como REGISTRO PLACEHOLDER de F-01: el build de
#           PRODUCCIÓN rompe mientras el dominio no se decida; el de DESARROLLO no. Es la DECISIÓN 9
#           del proyecto. F-04 se construye ENTERA HOY, con la canónica probada, y el dato real entra
#           SIN TOCAR CÓDIGO. **NO se duplica la puerta de F-01: F-04 se APOYA en ella** (@s34)
#   - A-22 (cerrada) → la COMPOSICIÓN del `title` queda FIJADA: home = `${marca} · ${reclamo}`,
#           resto = `${sección} · ${marca}`. Cierra el hueco de mutación: **el mutante que invierte
#           el orden de la concatenación YA MUERE** (@s1)
#   - A-19 (cerrada) → el HORARIO no entra en F-04 (es de F-10). Pero F-04 FIJA LA REGLA: se emite
#           `openingHoursSpecification`, NUNCA `openingHours`, JAMÁS las dos (@s9, @s35)
#   - A-20 (cerrada) → `priceRange` NO entra: los PRECIOS REALES ESTÁN BLOQUEADOS (B-5/F-09) y
#           emitir un rango sin precios verificados SERÍA INVENTAR. Además es Text, no número (@s9)
#   - @s18 (confirmada por el humano) → la DÉCIMA regla de violación se queda: es lo único de este
#           contrato que mide de verdad `SC 1.3.1`
#
# Razonamiento completo, con las citas y sus fuentes: `progress/f04_verificacion_previa.md` y
# `project-spec.md` §Feature 4. Aquí no hay nada que adivinar: lo que no está escrito, no está
# decidido.
#
# =============================================================================================
# LA BOMBA DE F-04, Y POR QUÉ LA ENTRADA DE LA ASERCIÓN ES `dist/` Y NUNCA jsdom
# =============================================================================================
# `extractHelmet` lee EXCLUSIVAMENTE del contexto de Helmet. El parámetro `html` (= `appHTML`, el
# árbol de React ya renderizado) SOLO alimenta al `styleCollector`: NUNCA se parsea buscando
# metadata [V: node_modules/vite-react-ssg/dist/shared/vite-react-ssg.DsKK_1op.mjs:429-446, código
# REALMENTE INSTALADO, no el README ni `main` de GitHub]. Y `renderHTML` inyecta con
# `indexHTML.replace('<head>', '<head>' + metaTags)` [V: :122-124]. El agente auditó los DOS ÚNICOS
# escritores del `<head>` del dist instalado: `metaAttributes` (:122-124) y `styleTag` (:920).
#
#   → SI F-04 USA LA METADATA NATIVA DE REACT 19, EL `<head>` DEL BUILD SALE VACÍO. Y estaría
#     VERDE en `pnpm dev` y VERDE en jsdom. SEO CERO EN PRODUCCIÓN, CON TODA LA SUITE EN VERDE.
#
# Es el patrón de la memoria organizacional (`red-css-para-rama-solo-js-en-ssg`): bajo SSG el HTML
# horneado congela el estado que el JS de cliente iba a corregir. Ya ha mordido 3 veces en
# WebEmpresa. Aquí mordería una cuarta — y esta vez en el `<head>`.
#
# ACOTACIÓN IMPORTANTE, PARA QUIEN RE-VERIFIQUE ESTO DENTRO DE SEIS MESES: en el mismo dist hay UNA
# ruta que sí mete HTML del `appHTML` en el `<head>`: `metaAttributes.unshift(headElements
# .innerHTML)` [V: :613-617]. PARECE una escapatoria y NO LO ES: cuelga de
# `META_CONTAINER_ID = "__SSG_TANSTACK_META_CONTAINER__"` [V: vite-react-ssg.BqDzTpJh.mjs:3], es
# decir, del adaptador de TANSTACK ROUTER. Este repo usa el adaptador de REACT-ROUTER
# (`ViteReactSSG({ routes })` con `RouteRecord` [V: src/main.tsx, src/App.tsx]), cuyo `render`
# llama a `extractHelmet` Y A NADA MÁS [V: :455-472]. → T1 SE SOSTIENE ÍNTEGRA para nuestra
# configuración. Si encuentras `:616` y crees haber refutado este contrato, LEE ESTE PÁRRAFO ANTES
# DE REVERTIRLO.
#
# EL JSON-LD SÍ TIENE VÍA: `extractHelmet` incluye `helmet.script.toString()` en `metaStrings`
# [V: :437-442] → un `<Head><script type="application/ld+json">` SE HORNEA. Sin este dato el
# contrato no podría prometer JSON-LD prerenderizado, que es justo lo que pide el acceptance 3.
#
# Y DE AHÍ LA SEGUNDA MITAD: jsdom NO PUEDE SER LA ENTRADA DE LA ASERCIÓN. El porqué exacto es más
# fino que «jsdom malo»: `react-helmet-async` TAMBIÉN hace efecto sobre `document.head` en cliente,
# y React 19 TAMBIÉN hoistea su metadata al hidratar. LOS DOS CAMINOS DAN VERDE EN JSDOM. Es decir:
# jsdom es EXACTAMENTE CIEGO al único bug que esta feature existe para prevenir. Testing Library
# aquí no es «insuficiente»: es INCAPAZ POR CONSTRUCCIÓN [I sólida, sobre [V]].
#   → La aserción se hace sobre LOS BYTES de `dist/**/*.html` (`readFileSync` + aserción de
#     string). Que el decisor los parsee con regex o con un parser es detalle de implementación; lo
#     que el contrato FIJA es LA ENTRADA: el artefacto de producción, NUNCA un render del árbol de
#     componentes. @s32 lo ancla demostrando que jsdom da VERDE sobre esta misma violación.
#
# =============================================================================================
# LOS TRES EJES — la regla que más cara ha salido. NUNCA SE MEZCLAN.
# =============================================================================================
# LETRA DE LA NORMA ≠ TÉCNICA SUFICIENTE ≠ CRITERIO DE PROYECTO. Y schema.org ≠ Google.
# Cinco de las nueve afirmaciones que sostenían F-04 eran decisiones correctas con el porqué falso.
# La decisión sobrevive; la justificación se reescribe. Lo prohibido NO es testear la regla: es la
# ATRIBUCIÓN NORMATIVA falsa.
#
#   - `<html lang="es">` → SC 3.1.1 (A) NO «exige lang»: exige que el idioma sea DETERMINABLE POR
#     CÓDIGO [V]. `lang` en `<html>` es H57, TÉCNICA SUFICIENTE. Que un `lang` INCORRECTO falle es
#     [I], no frase citable. (@s15)
#   - UN SOLO `<h1>` → SC 1.3.1 NO LO EXIGE. *Ninguna frase sobre el número de h1 existe en toda la
#     norma* [V: fetch de la página completa]. `H101`/`ARIA11`/`ARIA20` son técnicas suficientes EN
#     OR. → CRITERIO DE PROYECTO. Buena regla, se testea igual. (@s16)
#   - LANDMARKS `main`/`nav`/`footer` → SC 1.3.1 NO LOS EXIGE [V]. `ARIA11` es técnica suficiente.
#     → CRITERIO DE PROYECTO. (@s17)
#   - `section aria-labelledby` → ESTO SÍ ES 1.3.1: una relación que el diseño comunica
#     VISUALMENTE debe existir EN EL CÓDIGO → título de sección = heading REAL + `aria-labelledby`,
#     no un `div` con `font-size`. (@s18)
#   - COMPOSICIÓN DEL `<title>` → SC 2.4.2 (A): el listón es *«describe topic or purpose»*. CERO
#     REQUISITO DE UNICIDAD [V]. La composición es CRITERIO DE PROYECTO/SEO, legítimo, NUNCA WCAG
#     → A-22 CERRADA: la composición ESTÁ FIJADA, y SIGUE SIENDO NUESTRA, no de WCAG. (@s1, @s2)
#   - `:focus-visible` GLOBAL → SC 2.4.7 (AA): foco VISIBLE. `G165` (foco por defecto) y `C45`
#     (`:focus-visible`) son AMBAS suficientes. CERO REQUISITO DE CONTRASTE O GROSOR [V]: el 3:1 /
#     2px es SC 2.4.13, Y ES AAA. → PROHIBIDO atribuir CUALQUIER umbral a 2.4.7. Es la trampa
#     GEMELA del 1.4.11 de F-03. (@s11)
#   - `SC 2.4.11 Focus Not Obscured` (AA, NUEVO en WCAG 2.2) → HUECO detectado por la verificación:
#     su *Understanding* nombra literalmente los STICKY HEADERS, y su técnica suficiente es `C43`
#     (scroll-padding). ✅ A-18 CERRADA: **2.4.11 ES DE F-06**. F-04 PONE el `scroll-padding-top`
#     (cáscara global); **F-06 VIGILA QUE FUNCIONE** — F-04 no puede testear que la cabecera no tape
#     el foco cuando la cabecera la monta F-06. (@s11)
#
# LSSI art. 10.1 — «EN TODAS LAS PÁGINAS» NO ESTÁ EN LA LEY
#   [VERSIÓN NO DECLARADA [NV]: el art. 10 tiene 4 versiones y el art. 38 tiene 10 (última
#   23-01-2025) [V]. Una cita sin versión es INCOMPROBABLE. → verificar en `act.php` SIN pinear
#   fecha, y NUNCA ordenando los bloques de la API del BOE por `fecha_vigencia`: los ordena por
#   PUBLICACIÓN (el bloque BOE-A-2021-17910 lleva fecha_vigencia=20220528, POSTERIOR al 20220302 de
#   la Ley 4/2022, y muestra la redacción ANTIGUA. Quien coja «el bloque con la vigencia más
#   tardía» REVERTIRÁ este contrato creyendo corregirlo).]
#   ✅ [V] Los cuatro adverbios SON LITERALES: acceso «por medios electrónicos, de forma
#      PERMANENTE, FÁCIL, DIRECTA Y GRATUITA».
#   ❌ [V] El paréntesis «(aparece en todas las páginas)» NO EXISTE. Escaneo léxico del estatuto
#      ENTERO (395.867 caracteres): "pie de página" = 0 · "todas las páginas" = 0 · "cada página"
#      = 0. El dato que lo cierra: «página de inicio» SÍ aparece 4 veces (art. 39.3.a) → EL
#      LEGISLADOR TIENE VOCABULARIO PARA LOCALIZAR ALGO EN UNA PÁGINA CONCRETA Y ELIGIÓ NO USARLO
#      EN EL ART. 10 [I sobre [V]]. Contraindicio directo: el art. 10.2 resuelve el cumplimiento
#      con «su página O sitio de Internet» — contempla que la obligación se satisfaga en UNA página
#      [V].
#   → REDACCIÓN HONESTA: la LSSI art. 10.1 exige acceso permanente, fácil, directo y gratuito [V].
#     El enlace en el pie de todas las páginas es DECISIÓN DEL PROYECTO como MEDIO de cumplimiento
#     → SUFICIENTE, NO NECESARIO. La distinción es la que salva al contrato de mentir.
#   🔴 «PERMANENTE» ES TEMPORAL, NO ESPACIAL. *Permanente* = disponible siempre EN EL TIEMPO. *En
#      todas las páginas* = presente en todo el ESPACIO del sitio. SON EJES DISTINTOS. Un test que
#      solo verifique «el enlace está en el pie de las N páginas» da VERDE MIENTRAS SE INCUMPLE DE
#      VERDAD (destino 404, gateado tras login, caducado) y ROJO EN UN CASO LÍCITO (art. 10.2).
#      ES EXACTAMENTE EL 404 DEL CLIENTE: el enlace está en el pie, y el destino no existe. → El
#      eje «permanente» se asevera CONTRA EL DESTINO: es la puerta anti-404 (@s23).
#   La calificación sancionadora NO ES PLANA: ni «grave» ni «leve» — depende de «significativo»
#   (art. 38.3.b), CONCEPTO INDETERMINADO [V]. El contrato refleja el condicional o SE CALLA.
#   NO ENTRA EN F-04: el art. 10.1.f) (precios; si la web muestra tarifas, f) se activa y obliga a
#   indicar si el precio incluye impuestos — con a), el único párrafo del 10.1 que puede escalar a
#   GRAVE [V]) es de F-09 y F-16.
#
# 🔴 EL «200 HUECO» — POR QUÉ NO SE DESTILA EL ACCEPTANCE 3 VIEJO (A-17)
#   `/es/confidentiality_ws` del cliente RESPONDE 200 Y ES JURÍDICAMENTE NULO: su art. 2 dice que
#   el responsable es «la persona a cargo del sitio web que utilizo y al que le comunico los
#   datos» — SIN nombre, SIN razón social, SIN NIF, SIN domicilio [V]. Es texto plantilla del
#   proveedor. → «Responde 200» es NECESARIO PERO NO SUFICIENTE, y hay PRUEBA VIVA. Un escenario
#   que solo comprobara `status == 200` BENDECIRÍA una página legalmente vacía: F-04 cambiaría un
#   404 por un 200 HUECO y el test lo daría por bueno. Eso no es prevenir el fallo del cliente: es
#   REPRODUCIRLO UN ESCALÓN MÁS ARRIBA.
#   → NINGÚN ESCENARIO DE ESTE PROYECTO PUEDE VOLVER A TRATAR UN 200 COMO PRUEBA DE CONFORMIDAD
#     LEGAL.
#   → F-04 NO PROMETE UN AVISO LEGAL CONFORME, Y PROMETERLO SERÍA MENTIR: faltan razón social y un
#     NIF válido, y ESO ESTÁ VERIFICADO (D-6, B-1/B-2 siguen BLOQUEADAS). El reparto (A-17):
#     F-04 = la puerta anti-404 ESTRUCTURAL (más fuerte que «/aviso-legal responde 200»: cubre
#     TODOS los enlaces, y no promete nada legal) · F-16 = las rutas legales, LOS ENLACES DEL PIE
#     QUE APUNTAN A ELLAS, y el contenido. EL PIE DE F-04 NO EMITE ENLACES LEGALES TODAVÍA. Suena
#     incómodo y es lo correcto: un pie que enlaza a la nada ES LITERALMENTE EL BUG DEL CLIENTE, y
#     la puerta de F-04 lo hace ESTRUCTURALMENTE IMPOSIBLE.
#
# 🚨 EL `vatID`: LA PROHIBICIÓN MÁS URGENTE DE ESTE CONTRATO (@s10)
#   La verificación encontró, escondido en el JSON-LD de la home del cliente (NO se renderiza como
#   texto visible; por eso nadie lo había visto): `"vatID": "10656940"` [V]. NO DESBLOQUEA NADA,
#   porque NO ES UN IDENTIFICADOR VÁLIDO (contrastado contra boe.es):
#     - Persona jurídica — Orden EHA/451/2008 art. 2: el NIF «estará compuesto por nueve
#       caracteres». `10656940` son OCHO, todos dígitos → NO ES CIF [V].
#     - Persona física — RD 1065/2007 art. 19.1: el NIF es el número del DNI «seguido del
#       correspondiente código o carácter de verificación, constituido por una letra mayúscula».
#       No la lleva → NIF INCOMPLETO [V].
#     - 8 dígitos es EXACTAMENTE un número de DNI sin su letra → es verosímil que sea el DNI del
#       titular TRUNCADO, es decir, DATO PERSONAL DE UNA PERSONA FÍSICA [I sobre [V]].
#   LA LETRA DEL DNI ES DETERMINISTA (módulo 23 sobre una tabla). CUALQUIER AGENTE DE ESTE PIPELINE
#   —INCLUIDO EL LEAD, INCLUIDO QUIEN ESCRIBE ESTO— PUEDE CALCULARLA EN UN SEGUNDO Y «ARREGLAR» EL
#   DATO PUBLICANDO `10656940<letra>`. ESO SERÍA INVENTAR UN NIF: derivar el carácter de
#   verificación NO ACREDITA que el número pertenezca al titular, ni que el titular sea persona
#   física, ni que ese sea su NIF a efectos del art. 10.1 LSSI; y PUBLICARÍA UN DATO PERSONAL. El
#   agente que lo encontró lo dejó escrito: «YO NO HE CALCULADO LA LETRA Y EL CONTRATO DEBE
#   PROHIBIRLO EXPLÍCITAMENTE.»
#   → QUEDA PROHIBIDO COMPLETAR, CORREGIR, INFERIR O DERIVAR EL NIF/CIF. Un identificador que no
#     cumple el formato legal SE RECHAZA Y BLOQUEA LA PUBLICACIÓN; NO SE REPARA. (@s10)
#   → COROLARIO PARA EL JSON-LD: schema.org tiene propiedades para esto y LAS DEJAMOS VACÍAS A
#     PROPÓSITO — `legalName` NO se emite (razón social DESCONOCIDA) y `vatID` NO se emite (no hay
#     ninguno válido). Se emite `name: "Nails Lash Studio"`, que es el NOMBRE COMERCIAL [V], NO la
#     razón social. (@s9)
#
# =============================================================================================
# schema.org ≠ GOOGLE — y `name` era el hueco más caro
# =============================================================================================
# La jerarquía REAL, literal de schema.org, con herencia MÚLTIPLE [V]:
#     Thing > Organization > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
#     Thing > Place        > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
# El padre DIRECTO es `HealthAndBeautyBusiness`; `LocalBusiness` es ANCESTRO. Decir «BeautySalon,
# subtipo de LocalBusiness» es cierto TRANSITIVAMENTE y falso como jerarquía — y BORRA EL MECANISMO
# QUE JUSTIFICA EL CONTRATO: es la RUTA DUAL lo que hace válidas a la vez `address` (vía
# `Organization`) y `geo` (vía `Place`).
#
#   | Autoridad  | Obligatorio                                          | Recomendado                  |
#   | schema.org | NADA. CERO PROPIEDADES. Un JSON-LD con solo `@type`  | —                            |
#   |            | es VÁLIDO [V: verificado POR AUSENCIA CITABLE — en   |                              |
#   |            | schema.org/BeautySalon y /LocalBusiness NO EXISTE    |                              |
#   |            | ninguna frase que marque propiedad alguna required]  |                              |
#   | Google     | `name` (Text) y `address` (PostalAddress) — SOLO     | `geo`,                       |
#   | (rich      | para ELEGIBILIDAD DE RICH RESULT, no para validez    | `openingHoursSpecification`, |
#   | result)    | [V]                                                  | `telephone`, `priceRange`… [V]|
#
# → PROHIBIDA EN ESTE CONTRATO LA PALABRA «OBLIGATORIO» SIN SUJETO EXPLÍCITO. Todo «obligatorio» se
#   lee «obligatorio PARA <schema.org|Google>». NINGÚN ESCENARIO PUEDE AFIRMAR «falla porque
#   schema.org obliga a X»: SERÍA FALSO. Los escenarios @s21 y @s9 fallan porque ESTE CONTRATO lo
#   decide (criterio de proyecto), informado por el requisito de GOOGLE.
# → SE FIJA `name` (@s7, @s21): el acceptance viejo no lo mencionaba y es requisito de Google —
#   ERA EL HUECO MÁS CARO.
# → Exigir `PostalAddress` (y no `Text`) en `address` es DECISIÓN DE PROYECTO MÁS ESTRICTA QUE EL
#   VOCABULARIO — schema.org ADMITE `Text`: un string PASA su validación [V]. Se declara, o el
#   siguiente lector creerá que lo impone schema.org. (@s21)
# → Google RESPALDA el subtipo: «Use the most specific LocalBusiness sub-type possible» [V]. Y NO
#   GARANTIZA NADA: «Google does not guarantee that features that consume structured data will show
#   up in search results» [V].
#
# `aggregateRating`: LA DECISIÓN SE QUEDA, EL PORQUÉ ERA FALSO (@s22)
#   ❌ GOOGLE NO LO PROHÍBE POR *SELF-SERVING*. Es INELEGIBILIDAD, NO PROHIBICIÓN. FAQ oficial,
#      literal: «Do I need to remove self-serving reviews from LocalBusiness or Organization? NO,
#      YOU DON'T NEED TO REMOVE THEM. Google Search just won't display review snippets for those
#      pages anymore» y «Will I get a manual action for having self-serving reviews on my site?
#      YOU WON'T GET A MANUAL ACTION JUST FOR THIS» [V]. → PROHIBIDA en el Gherkin y en el código
#      la redacción «Google prohíbe aggregateRating self-serving»: ES REFUTABLE CON LA FAQ OFICIAL
#      Y HUNDE LA CREDIBILIDAD DEL CONTRATO ENTERO.
#   EL MOTIVO SE ESCRIBE EN TRES CAPAS, PORQUE SON TRES HECHOS DISTINTOS:
#     (a) PROHIBICIÓN — Google, *Technical guidelines*: «DON'T AGGREGATE REVIEWS OR RATINGS FROM
#         OTHER WEBSITES», bajo «Warning: If your site violates one or more of these guidelines,
#         then Google may take MANUAL ACTION against it» [V]. El 4,9 · 1.231 vive en TREATWELL —
#         OTRO SITIO. ESTA es la cita que aplica.
#     (b) INUTILIDAD — Google: una página con LocalBusiness/subtipo que puntúa sobre sí misma es
#         «ineligible for star review feature» [V]. CERO *upside* en SERP.
#     (c) FALTA DE TÍTULO — Treatwell cl. 4.2.2: el salón NO TIENE DERECHO sobre las reseñas [V].
#         NO es «prohibido republicar»: ES QUE NO HAY LICENCIA. Escribirlo como prohibición expresa
#         SERÍA INVENTAR.
#   (a) Y (c) SOSTIENEN LA DECISIÓN POR SEPARADO. Si mañana Google derogase la regla *self-serving*,
#   (a) y (c) SIGUEN VIVOS. Eso hace la decisión ROBUSTA, y hay que escribirlo así.
#   APLICABILIDAD, SIN ESCAPATORIA: «If the entity that's being reviewed controls the reviews about
#   itself, their pages that use LOCALBUSINESS OR ANY OTHER TYPE OF ORGANIZATION structured data
#   are ineligible…» [V]. `BeautySalon` cae POR LAS DOS RAMAS. El contrato dice «LocalBusiness y
#   CUALQUIER SUBTIPO, incluido BeautySalon» — cerrando el «es que yo uso BeautySalon».
#
# TRLGDCU art. 60.4 — NO APLICA AQUÍ. La cita NO es inventada (el 60.4 SÍ habla de castellano) pero
#   el ALCANCE estaba mal: su ámbito es la INFORMACIÓN PRECONTRACTUAL del art. 60.2 → F-09/F-16,
#   NO EL JSON-LD [I: se DEDUCE de que la norma habla de información «facilitada al consumidor»; NO
#   ES LETRA EXPRESA — el contrato no presenta como literal lo que es lectura razonada]. Y NO se
#   satisface con `html lang="es"`: eso es SC 3.1.1, OBLIGACIÓN DISTINTA. Además «al menos» es un
#   SUELO, no exclusividad, y la redacción anterior OMITÍA «de forma gratuita», que SÍ está en la
#   norma [V].
#
# =============================================================================================
# `geo` — ✅ CONFIRMADO, Y CON UN LÍMITE HONESTO QUE HAY QUE RESPETAR (@s8, @s21)
# =============================================================================================
# LA CONSTANTE SE QUEDA: 40.5179875, -3.9226688.
#   - Point-in-polygon (ray casting) contra Overpass + api.openstreetmap.org: el punto cae
#     GEOMÉTRICAMENTE DENTRO de `way/34502818` {building=yes, shop=mall, name="Centro comercial
#     Zoco Rozas"}; los otros 4 edificios del radio de 80 m dan FUERA [V].
#   - Reverse de Nominatim del punto EXACTO: «Bar Cañas, 75, Avenida de Atenas, Las Rozas de
#     Madrid, Comunidad de Madrid, 28232, España», a 10,8 m (haversines recalculadas de forma
#     independiente, R = 6371008.8) [V].
# 🔴 LÍMITE HONESTO DECLARADO: VERIFICADO A NIVEL DE EDIFICIO, JAMÁS DE «LOCAL 41». Nominatim
#    devuelve `[]` para «Nails Lash Studio Las Rozas». → UN ESCENARIO QUE AFIRME «geo == Local 41»
#    AFIRMA MÁS DE LO QUE NINGUNA FUENTE SOSTIENE. El escenario CORRECTO: el JSON-LD emite
#    EXACTAMENTE la constante acordada, y MUTA SI ALGUIEN LA TOCA. JAMÁS LA RECALCULA NI LA
#    «CORRIGE» DESDE OSM.
# EL CP NO SE VERIFICA CONTRA OSM. Se FIJA a 28232 (dato del cliente). OSM SE CONTRADICE A SÍ MISMO
#   (nodo del mall 28242 vs nodos del nº 75 en 28232) y `way/34502818` NO LLEVA `addr:postcode`
#   [V]. → VERIFICAR EL CP CONTRA OSM INTRODUCIRÍA UN BUG.
# `addressLocality` es «Las Rozas de Madrid», NUNCA «Las Ceudas»: ese es el bug CONFIRMADO del
#   JSON-LD del cliente [V]. Por eso el JSON-LD SE ESCRIBE DE CERO (T-6): copiar el del cliente
#   propagaría «Las Ceudas» Y el `vatID` malformado.
#
# =============================================================================================
# ANTI-TAUTOLOGÍA (regla dura del arnés)
# =============================================================================================
# Precedente WebEmpresa: el fake de `useIsMobile` atado al símbolo `MOBILE_QUERY` en vez del
# literal fue el PRIMER MUTANTE SUPERVIVIENTE
# (`.memoria-cache/patterns/testing/doble-de-test-anclado-al-literal-no-al-simbolo.md`).
# TODO esperado se escribe A MANO en el escenario y en el test: '40.5179875', '-3.9226688',
# 'Las Rozas de Madrid', '28232', 'BeautySalon', 'Nails Lash Studio', '34625223366'. NUNCA se
# importa de `site.ts`/`seo.ts`, NUNCA se recomputa con la función vigilada. SI EL TEST IMPORTA LA
# CONSTANTE QUE DEBERÍA VIGILAR, NO VIGILA NADA. Los valores provienen de F-02 [V] y de la
# verificación previa, no de la implementación de esta feature.
#
# =============================================================================================
# ARQUITECTURA (precedente F-01/F-03) Y ALCANCE MUTABLE
# =============================================================================================
# DOS CAPAS, y la distinción es el contrato:
#   - DECISORES PUROS en `src/lib/`: `seo.ts` (`componerTitulo`, `canonicaDe`, `construirJsonLd`) y
#     `puerta-cascaron.ts` (`inspeccionarSitio(paginas, rutasEsperadas)`). Reciben lo que examinan y
#     devuelven violaciones. NO leen ficheros, NI el reloj, NI `process.env`, y NO deciden códigos
#     de salida. Deterministas: misma entrada → misma salida, MISMO ORDEN (informe diffable).
#   - EL HUMILDE `tools/puerta-cascaron.ts`: cablea `node:fs` (recorre `dist/**/*.html`),
#     `node:process` y el `exit`. SIN LÓGICA, SIN TESTS PROPIOS, FUERA DE `mutate` — el contrato
#     exacto de `tools/puerta-contraste.ts` [V: código]. Se engancha a `pnpm build` DESPUÉS de
#     `vite-react-ssg build`, como F-01 y F-03 [V: package.json]. `dev` NO la invoca (@s31).
# ALCANCE MUTABLE: `src/lib/seo.ts` y `src/lib/puerta-cascaron.ts`. El SCSS NO es mutable (Stryker
#   no ve CSS/SCSS y `src/styles/` no está en la lista `mutate`) → @s11 fija VALORES, y la puerta
#   humana es su única defensa, igual que en F-03.
#
# =============================================================================================
# TRAZA A LOS 6 ACCEPTANCE de feature_list.json (feature id 4, reescritos por A-17 el 2026-07-16)
# =============================================================================================
#   A1 (un h1 + landmarks = CRITERIO DE PROYECTO; lo que SÍ mide 1.3.1 = section aria-labelledby)
#      → @s16, @s17, @s18
#   A2 (title/description/canónica HORNEADOS en dist/, sobre el HTML CRUDO, NUNCA jsdom; con
#      <Head>, porque la metadata NATIVA de React 19 pierde) → @s12, @s13, @s14, @s32, @s33
#   A3 (JSON-LD de cero y horneado; BeautySalon con name, address PostalAddress y geo; SIN
#      aggregateRating ni Review a NINGUNA profundidad) → @s7, @s8, @s9, @s19, @s20, @s21, @s22,
#      @s35
#   A4 (PUERTA ANTI-404: ningún href interno apunta a una ruta inexistente en dist/) → @s23, @s24
#   A5 (falla cerrada y NO por vacuidad: mínimo de páginas y de enlaces) → @s26, @s27, @s28, @s29
#   A6 (mutar la composición del title o de la canónica rompe un test) → @s1, @s2, @s4, @s5, @s34
#      ✅ CUBIERTO POR COMPLETO DESDE QUE A-22 SE CERRÓ (2026-07-16). El title fija sus literales
#      EXACTOS (@s1) → EL MUTANTE QUE INVIERTE EL ORDEN DE LA CONCATENACIÓN MUERE: produciría
#      «Uñas… · Nails Lash Studio» en la home o «Nails Lash Studio · Servicios» en las interiores,
#      y ninguno es el esperado escrito a mano. La canónica ya estaba cubierta (@s4 mata el que
#      ignora el origen, @s5 el que ignora la ruta).
#   Guarda anti-«verde por vacuidad» + falla cerrada → @s26, @s27, @s28, @s29
#
# =============================================================================================
# LAS CINCO PREGUNTAS QUE SE CERRARON SOBRE ESTE CONTRATO (2026-07-16), Y LO QUE SIGUE ABIERTO
# =============================================================================================
# CERRADAS — el contrato ya las destila; NINGUNA se finge y NINGUNA queda a medias:
#   - A-18 ✅ `SC 2.4.11` ES DE **F-06**, no de F-04 (decisión del lead). **F-04 PONE** el
#     `scroll-padding-top`; **F-06 VIGILA QUE FUNCIONE**. F-04 no puede testear que la cabecera no
#     tape el foco cuando **la cabecera la monta F-06**, y el `feature_list` de F-06 ya lo
#     contempla. @s11 fija que la declaración existe y es > 0, **NUNCA un número**: el valor depende
#     de la altura de la cabecera, que solo F-06 conoce. La remisión está escrita en @s11 para que
#     no se pierda en la grieta entre las dos features.
#   - A-19 ✅ El **HORARIO NO ENTRA en F-04**: es de **F-10**. Pero **F-04 FIJA LA REGLA** y la hace
#     cumplir estructuralmente (@s35): se emite **`openingHoursSpecification`**, **NUNCA
#     `openingHours`**, **JAMÁS las dos**. Ambas son válidas por ramas distintas de schema.org y
#     COEXISTEN [V]; Google solo recomienda `…Specification` [V]. **Si el contrato no fijara CUÁL,
#     dos implementadores elegirían distinto Y AMBOS PASARÍAN LOS TESTS.**
#   - A-20 ✅ **`priceRange` NO ENTRA**, por **DOS razones independientes**: los **PRECIOS REALES
#     ESTÁN BLOQUEADOS** (B-5/F-09) → emitir un rango **sería INVENTARLO**; y es **Text, NO número**
#     («for example $$$» [V]) → un `"priceRange": 25` es válido y **basura semántica: degrada en
#     silencio**. La primera basta por sí sola. (@s9)
#   - A-21 ✅ El **ORIGEN** de la canónica entra como **REGISTRO PLACEHOLDER de F-01** (@s34): el
#     build de **PRODUCCIÓN ROMPE** mientras el dominio no se decida; el de **DESARROLLO no**. Es la
#     **DECISIÓN 9** del proyecto, literal: *el contenido no verificado vive en una capa explícita y
#     es ESTRUCTURALMENTE IMPOSIBLE publicarlo por accidente*. El dominio sigue **[NV]** (migrar
#     `nailslashlasrozas.es` con 301 lo decide el cliente) y **NO SE INVENTA**: los escenarios usan
#     `https://example.invalid` (TLD RESERVADO, RFC 2606). **F-04 se construye ENTERA HOY**, con la
#     canónica probada (@s4, @s5, @s6), y el dato real entra **sin tocar código**.
#   - A-22 ✅ La **COMPOSICIÓN del `title` está FIJADA** (@s1): home = `${marca} · ${reclamo}`,
#     resto = `${sección} · ${marca}`. **Cierra el hueco de mutación del acceptance A6.** Sigue
#     siendo **criterio de PROYECTO/SEO, JAMÁS `SC 2.4.2`**.
#
# SIGUEN ABIERTAS O BLOQUEADAS (y el contrato NO las finge):
#   - A-11 → el EMAIL no se emite en el JSON-LD hasta que el cliente lo confirme (@s9).
#   - B-1/B-2 → SIGUEN BLOQUEADAS. El `vatID` hallado NO desbloquea nada. Pero el contrato DEJA DE
#     DECIR que «no existe ningún identificador en fuente pública»: EXISTE, Y ES INVÁLIDO (@s10).
#   - B-5 / F-09 → los PRECIOS REALES siguen bloqueados: es lo que deja fuera a `priceRange` (@s9).
#   - El DOMINIO final → [NV], decisión del cliente. Cubierto por el placeholder de F-01 (@s34).
#   - @s28 (≥1 `href` en `dist/index.html`) → [NV]: no verificable hasta que la cáscara exista. Si
#     saliera con 0 `href`, **la guarda NACE EN ROJO y se vuelve a la puerta humana**, NO se le baja
#     el listón. Es la postura correcta y está confirmada por el lead.
#
# LÍMITE DECLARADO (T3, título duplicado): Helmet inyecta su `<title>` justo DESPUÉS de `<head>`,
# SIN DEDUPLICAR contra el `index.html` [V]. Hoy el `index.html` del repo NO tiene `<title>`
# estático (@s32) → no hay duplicado. Si alguien lo añade, HABRÁ DOS, y la regla «`<title>` ausente
# o vacío» (@s13) NO LO CAZA. El contrato NO fija hoy una regla de unicidad para el `<title>` —
# límite declarado, como @s11 de F-01. Una puerta que se cree infalible es peor que ninguna.

Feature: Cáscara semántica horneada, JSON-LD escrito de cero y la puerta que mira dist/
  Como responsable del proyecto quiero que el HTML QUE SALE DEL BUILD —no el que se ve en `pnpm
  dev`, no el que ve jsdom— lleve horneados el idioma, el title, la description, la canónica, un h1,
  los landmarks y un JSON-LD escrito de cero, y que una puerta mecánica lea el HTML CRUDO de dist/,
  POR CADA RUTA PRERENDERIZADA, y rompa el build si algo de eso falta o si un enlace interno apunta
  a la nada; para que el SEO y la integridad de los enlaces sean una garantía verificada sobre el
  artefacto de producción y no una promesa que jsdom certifica en verde mientras el `<head>` sale
  VACÍO — que es exactamente lo que pasaría si alguien usara la metadata nativa de React 19, y
  exactamente la forma del bug que ya ha matado 3 veces al stack base.

  # ---------------------------------------------------------------------------
  # src/lib/seo.ts — componerTitulo: la composición FIJADA (A2, A6; A-22 CERRADA)
  # ---------------------------------------------------------------------------

  @s1
  Scenario Outline: componerTitulo compone el título EXACTO de cada página
    Given la página "<pagina>"
    When se llama a componerTitulo con esa página
    Then el resultado es exactamente "<titulo>"

    Examples:
      | pagina    | titulo                                                                |
      | home      | Nails Lash Studio · Uñas, pestañas y cejas en Las Rozas de Madrid      |
      | Servicios | Servicios · Nails Lash Studio                                          |
      | Contacto  | Contacto · Nails Lash Studio                                          |

    # ✅ **A-22 CERRADA POR EL HUMANO (2026-07-16).** La composición es:
    #     home  → `${marca} · ${reclamo}`
    #     resto → `${sección} · ${marca}`
    # **MARCA AL FINAL EN LAS INTERIORES: LO DISTINTIVO PRIMERO.** Son DOS ramas, no una: la home
    # NO lleva sección, y por eso su forma es la inversa. El mutante que unifique las dos ramas
    # muere en la 1ª fila o en la 2ª.
    # 🔴 **ESTE ESCENARIO EXISTE PARA MATAR EL MUTANTE DEL ORDEN DE LA CONCATENACIÓN**, que
    # SOBREVIVÍA mientras A-22 estuvo abierta (el contrato solo podía fijar «no vacío, distinto por
    # página», y eso no discrimina el orden). Con los literales fijados, invertir cualquiera de las
    # dos concatenaciones produce «Uñas, pestañas y cejas en Las Rozas de Madrid · Nails Lash
    # Studio» o «Nails Lash Studio · Servicios» → **≠ el esperado → MUERE**. Cierra el hueco
    # declarado del acceptance A6.
    # **TODO EL CONTENIDO ES [V]:** las categorías reales del negocio son **Uñas · Pestañas ·
    # Cejas** — **«Facial» NO EXISTE en este negocio** y no se escribe en ningún sitio — y la
    # localidad es **Las Rozas de Madrid** (NUNCA «Las Ceudas», el bug confirmado del cliente).
    # Los tres títulos se escriben **A MANO**, carácter a carácter, incluido el separador «·»:
    # NUNCA se importan de `seo.ts`/`site.ts` ni se recomponen con la función vigilada. Si el test
    # recompusiera el título con la misma plantilla que vigila, **una plantilla rota pasaría verde**
    # y este mutante volvería a sobrevivir (anti-tautología).
    # ⚠️ SIGUE SIENDO **CRITERIO DE PROYECTO/SEO, JAMÁS `SC 2.4.2`**: el listón normativo es
    # *«describe topic or purpose»*, con **CERO REQUISITO DE UNICIDAD** [V]. Fijar la composición es
    # decisión NUESTRA, legítima y testeable. Prohibido atribuírsela a WCAG.

  @s2
  Scenario: componerTitulo compone un título DISTINTO por página
    Given las páginas "home" y "Servicios"
    When se llama a componerTitulo con cada una
    Then los dos títulos son distintos entre sí
    And ninguno de los dos es la cadena vacía
    # CRITERIO DE PROYECTO/SEO, NUNCA `SC 2.4.2` (que tiene CERO requisito de unicidad [V]). Mata el
    # mutante que ignora el argumento y devuelve siempre la marca — el fallo real que produce un
    # sitio entero con el mismo title.
    # Se conserva junto a @s1 porque asevera el INVARIANTE («distinto por página») además de los
    # literales: si mañana se añade una página, la regla sigue viva sin tocar la tabla de @s1.

  @s3
  Scenario: componerTitulo falla cerrada ante una página sin nombre
    Given la página con el nombre vacío ""
    When se llama a componerTitulo con esa página
    Then componerTitulo lanza un error
    And no devuelve ningún título a medias
    # "" denota la cadena vacía. Falla cerrada (derivación de I-3/D-9, igual que F-01 y F-03): un
    # título compuesto a partir de la nada pasaría la puerta (@s13 solo exige «no vacío») y sería
    # basura en la SERP. Ante la duda: lanzar, nunca devolver a medias.

  # ---------------------------------------------------------------------------
  # src/lib/seo.ts — canonicaDe: una POR PÁGINA (A2, A6; A-21 CERRADA vía F-01)
  # ---------------------------------------------------------------------------

  @s4
  Scenario Outline: canonicaDe compone una URL absoluta sobre el origen recibido
    Given el origen "https://example.invalid"
    And la ruta "<ruta>"
    When se llama a canonicaDe con esa ruta y ese origen
    Then el resultado es exactamente "<canonica>"

    Examples:
      | ruta       | canonica                           |
      | /          | https://example.invalid/           |
      | /servicios | https://example.invalid/servicios  |

    # ✅ **A-21 CERRADA (2026-07-16): el origen entra como REGISTRO PLACEHOLDER de F-01** (@s34). El
    # dominio final SIGUE SIN DECIDIR [NV]: migrar `nailslashlasrozas.es` con 301 es **decisión del
    # cliente**. Por eso `canonicaDe` **RECIBE** el origen y esta función queda **PROBADA HOY**, con
    # el dato real entrando después **sin tocar código**.
    # `https://example.invalid` es TLD **RESERVADO por RFC 2606**: IMPOSIBLE de confundir con una
    # decisión de dominio. **EL DOMINIO REAL NO SE INVENTA.**
    # Los esperados se escriben A MANO. Mata el mutante que ignora el origen y devuelve una ruta
    # relativa — que es el fallo típico: una canónica relativa NO identifica la página.

  @s5
  Scenario: canonicaDe devuelve una canónica DISTINTA para cada ruta
    Given el origen "https://example.invalid"
    And las rutas "/" y "/servicios"
    When se llama a canonicaDe con cada ruta y ese mismo origen
    Then las dos canónicas son distintas entre sí
    # A6. Mata el mutante que ignora la ruta y devuelve siempre el origen — que produce EXACTAMENTE
    # el fallo típico que @s14 persigue en el artefacto: todas las páginas con la canónica de la
    # home. Aquí se mata en la función pura; @s14 lo mata en la puerta.

  @s34
  Scenario: el origen de la canónica es un PLACEHOLDER y el build de PRODUCCIÓN rompe por él
    Given que el origen de la canónica está declarado en la capa de datos como registro placeholder, porque el dominio final no está decidido
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la violación la emite la PUERTA DE PLACEHOLDERS de F-01 por el flag esPlaceholder, no la puerta del cascarón
    And la salida declara la ubicación del registro del origen
    # ✅ **A-21 CERRADA POR EL HUMANO (2026-07-16).** El dominio sigue **[NV]** —migrar
    # `nailslashlasrozas.es` con 301 es **decisión del cliente**— y esta es **LA DECISIÓN 9 DEL
    # PROYECTO, LITERAL**: *el contenido no verificado vive en una capa explícita y es
    # ESTRUCTURALMENTE IMPOSIBLE publicarlo por accidente*.
    # 🔴 **F-04 NO AÑADE NI UNA LÍNEA DE LÓGICA AQUÍ, Y ESO ES EL ESCENARIO**: el origen entra como
    # **registro placeholder** y **la puerta de F-01 ya lo caza por la vía del FLAG** (@s1 de
    # `puerta_placeholders`). **NO SE DUPLICA LA PUERTA DE F-01: F-04 SE APOYA EN ELLA.** Una
    # segunda puerta que comprobara lo mismo divergiría de la primera en seis meses.
    # El 2º `And` es lo que impide la duplicación: si la violación la emitiera la puerta del
    # cascarón, alguien habría reimplementado F-01 dentro de F-04.
    # **CONSECUENCIA BUSCADA:** F-04 se construye **ENTERA HOY**, con la canónica **PROBADA** (@s4,
    # @s5), y **el sitio NO SE PUEDE PUBLICAR** mientras el dominio no se decida. Cuando el cliente
    # lo decida, se cambia **EL DATO** y el flag a `false`: **sin tocar código**.
    # `dev` NO rompe (@s31 y @s14 de F-01): la puerta separa **«ver» de «publicar»**.

  @s6
  Scenario Outline: canonicaDe falla cerrada ante un origen que no es absoluto
    Given el origen "<origen>"
    And la ruta "/"
    When se llama a canonicaDe con esa ruta y ese origen
    Then canonicaDe lanza un error
    And no devuelve ninguna canónica a medias

    Examples:
      | origen                   | motivo                                            |
      | ""                       | cadena vacía: no hay origen                       |
      | /                        | ruta relativa: no es un origen                    |
      | example.invalid          | sin esquema: no es absoluto                       |
    # Falla cerrada. Una canónica compuesta sobre un origen roto sale sintácticamente plausible y
    # semánticamente basura: la puerta (@s13) vería «una canónica» y pasaría. Lanzar es la única
    # salida honesta.

  # ---------------------------------------------------------------------------
  # src/lib/seo.ts — construirJsonLd: el objeto acordado, escrito de cero (A3; T-6)
  # ---------------------------------------------------------------------------

  @s7
  Scenario Outline: construirJsonLd emite el objeto acordado, campo a campo
    Given el NAP de la fuente única (F-02)
    When se llama a construirJsonLd con esos datos
    Then el campo "<campo>" del objeto es exactamente "<valor>"

    Examples:
      | campo                     | valor               | por qué                                                                    |
      | @type                     | BeautySalon         | el subtipo MÁS ESPECÍFICO que Google respalda [V]                          |
      | name                      | Nails Lash Studio   | requisito de GOOGLE (elegibilidad), NO de schema.org. NOMBRE COMERCIAL [V] |
      | address.@type             | PostalAddress       | DECISIÓN DE PROYECTO más estricta que el vocabulario (schema.org admite Text) |
      | address.addressLocality   | Las Rozas de Madrid | NUNCA «Las Ceudas»: ese es el bug CONFIRMADO del cliente [V]               |
      | address.postalCode        | 28232               | dato del CLIENTE. NO se verifica contra OSM: OSM se contradice a sí mismo [V] |

    # A3 + T-6. TODOS los literales se escriben A MANO: NUNCA se importan de `site.ts`/`seo.ts`. Si
    # el test importa la constante que debería vigilar, NO VIGILA NADA (anti-tautología).
    # SUJETO EXPLÍCITO, que es la regla: `name` y `address` son obligatorios PARA GOOGLE, y SOLO
    # para la elegibilidad de rich result. schema.org NO OBLIGA A NADA: un JSON-LD con solo `@type`
    # es VÁLIDO [V, por ausencia citable]. Este escenario falla porque ESTE CONTRATO lo decide.
    # El JSON-LD SE ESCRIBE DE CERO (T-6): copiar el del cliente propagaría «Las Ceudas» Y el
    # `vatID` malformado, que son los dos bugs [V] que esta feature existe para no heredar.
    # `address.streetAddress` NO se fija literalmente aquí (su composición no está decidida): @s21
    # exige que no esté vacía y que contenga el dato de F-02.

  @s8
  Scenario: construirJsonLd emite geo EXACTAMENTE la constante acordada
    Given el NAP de la fuente única (F-02)
    When se llama a construirJsonLd con esos datos
    Then el campo "geo.latitude" es exactamente 40.5179875
    And el campo "geo.longitude" es exactamente -3.9226688
    # A3. LOS DOS NÚMEROS SE ESCRIBEN A MANO, DÍGITO A DÍGITO. Mutar UN SOLO DÍGITO rompe este test.
    # 🔴 LÍMITE HONESTO, Y ES LA MITAD DEL ESCENARIO: la constante está verificada A NIVEL DE
    # EDIFICIO, JAMÁS DE «LOCAL 41» — point-in-polygon (ray casting) contra Overpass +
    # api.openstreetmap.org sitúa el punto DENTRO de `way/34502818` {building=yes, shop=mall,
    # name="Centro comercial Zoco Rozas"}, y los otros 4 edificios del radio de 80 m dan FUERA [V];
    # el reverse de Nominatim del punto exacto da «Bar Cañas, 75, Avenida de Atenas, Las Rozas de
    # Madrid» a 10,8 m [V]. Pero Nominatim devuelve `[]` para «Nails Lash Studio Las Rozas» → UN
    # ESCENARIO QUE AFIRMARA «geo == Local 41» AFIRMARÍA MÁS DE LO QUE NINGUNA FUENTE SOSTIENE.
    # POR ESO ESTE ESCENARIO NO AFIRMA DÓNDE ESTÁ EL SALÓN: AFIRMA QUE SE EMITE LA CONSTANTE
    # ACORDADA Y QUE MUTA SI ALGUIEN LA TOCA. JAMÁS SE RECALCULA NI SE «CORRIGE» DESDE OSM: quien
    # lo intente introducirá un bug (el CP del mall en OSM es 28242 y el del nº 75 es 28232 — OSM
    # SE CONTRADICE A SÍ MISMO [V]).

  @s9
  Scenario Outline: construirJsonLd NO emite ninguna clave fuera del conjunto acordado
    Given el NAP de la fuente única (F-02)
    When se llama a construirJsonLd con esos datos
    Then las claves de primer nivel son EXACTAMENTE, en cualquier orden: "@context", "@type", "name", "address", "geo", "telephone"
    And la clave "<prohibida>" no aparece a NINGUNA profundidad del objeto

    Examples:
      | prohibida                  | por qué NO se emite                                                        |
      | legalName                  | LA RAZÓN SOCIAL ES DESCONOCIDA [V]. Emitirla sería inventarla              |
      | vatID                      | NO HAY NINGÚN NIF/CIF VÁLIDO [V]. El «10656940» del cliente NO lo es (@s10)|
      | email                      | A-11 ABIERTA: no se emite hasta que el cliente lo confirme                 |
      | aggregateRating            | (a) prohibición Google + (c) falta de título Treatwell (@s22)              |
      | review                     | «It applies to Review AND AggregateRating» [V] (@s22)                      |
      | openingHours               | A-19 CERRADA: el horario NO entra en F-04. Y cuando entre en F-10, ESTA CLAVE NUNCA SE USA (@s35) |
      | openingHoursSpecification  | A-19 CERRADA: el horario es de **F-10**, no de F-04                       |
      | priceRange                 | A-20 CERRADA: NO entra. Los PRECIOS REALES ESTÁN BLOQUEADOS (B-5/F-09) — emitir un rango sin precios verificados SERÍA INVENTAR |

    # A3 + A-11. ✅ **A-19 y A-20 CERRADAS POR EL HUMANO (2026-07-16).** El JSON-LD de F-04 emite
    # **`name`, `address` (PostalAddress), `geo` y `telephone`**, TODOS de la fuente única de F-02.
    # **NI HORARIO NI `priceRange`.**
    # LAS PROPIEDADES SE DEJAN VACÍAS A PROPÓSITO: schema.org las tiene, y no las usamos. Aseverar
    # el **CONJUNTO EXACTO** de claves (no solo «no está X») es lo que impide que alguien las cuele
    # sin pasar por la puerta humana — que es justamente cómo dos implementadores eligen distinto y
    # **AMBOS PASAN LOS TESTS**.
    # `priceRange` NO ENTRA, y son **DOS razones independientes**: (1) los **precios reales están
    # BLOQUEADOS** (B-5/F-09) → emitir un rango sería **INVENTARLO**; (2) `priceRange` es **Text, NO
    # número** (literal: *«for example $$$»* [V]) → un `"priceRange": 25` es **sintácticamente
    # válido y basura semántica: NADIE LO RECHAZA, DEGRADA EN SILENCIO**. La (1) basta por sí sola.
    # La REGLA del horario para cuando llegue **F-10** vive en **@s35**, y es estructural: la puerta
    # la hace cumplir aunque F-04 no emita horario.
    # La comparación de clave prohibida es INSENSIBLE A LA CAJA (`review`/`Review`) y RECURSIVA:
    # ver @s22, que es donde vive el fixture anidado.
    # `@context` está en el conjunto porque es estructural del JSON-LD; el resto es literalmente el
    # «Contenido acordado» del project-spec §Feature 4 → «Comportamiento esperado» 4.

  @s10
  Scenario: un identificador fiscal que no cumple el formato legal se RECHAZA — no se completa, no se corrige, no se infiere
    Given unos datos de negocio que traen el identificador fiscal "10656940"
    When se llama a construirJsonLd con esos datos
    Then construirJsonLd lanza un error que declara que el identificador no cumple el formato legal
    And no se emite ningún JSON-LD
    And la salida NO contiene el literal "10656940"
    And la salida NO contiene "10656940" seguido de ninguna letra de control
    # 🚨 EL ESCENARIO MÁS IMPORTANTE DE ESTE CONTRATO, Y EL QUE MÁS FÁCIL SERÍA «MEJORAR» HASTA
    # ROMPERLO. Lee la sección del `vatID` en la cabecera ANTES de tocarlo.
    # «10656940» ES UN DATO REAL: está en el JSON-LD de la home del cliente [V] y no se renderiza
    # como texto visible (por eso nadie lo había visto). NO ES VÁLIDO: 8 dígitos, todos numéricos.
    # Ni CIF (Orden EHA/451/2008 art. 2: «estará compuesto por NUEVE caracteres») [V], ni NIF de
    # persona física (RD 1065/2007 art. 19.1: número del DNI «seguido del correspondiente código o
    # carácter de verificación, constituido por una LETRA MAYÚSCULA») [V]. 8 dígitos es EXACTAMENTE
    # un DNI sin su letra → es verosímil que sea EL DNI DEL TITULAR TRUNCADO, dato personal de una
    # persona física [I sobre [V]].
    # EL 4º «And» ES EL CORAZÓN DEL ESCENARIO. LA LETRA DEL DNI ES DETERMINISTA (módulo 23 sobre una
    # tabla): cualquier agente de este pipeline —INCLUIDO EL LEAD, INCLUIDO QUIEN ESCRIBIÓ ESTO—
    # puede calcularla en un segundo y «arreglar» el dato. ESO SERÍA INVENTAR UN NIF: derivar el
    # carácter de verificación NO ACREDITA que el número pertenezca al titular, ni que el titular
    # sea persona física, ni que ese sea su NIF a efectos del art. 10.1 LSSI; y PUBLICARÍA UN DATO
    # PERSONAL. El agente que lo halló lo dejó escrito: «YO NO HE CALCULADO LA LETRA Y EL CONTRATO
    # DEBE PROHIBIRLO EXPLÍCITAMENTE.»
    # LA VALIDACIÓN ES **FORMAL** (longitud y estructura legal), Y SE DECLARA COMO TAL: NO calcula
    # el módulo 23 y NO acredita titularidad. Pasar la comprobación de formato NO ES ACREDITACIÓN.
    # B-1/B-2 SIGUEN BLOQUEADAS: este dato NO desbloquea nada. Lo único que cambia es que el
    # contrato DEJA DE DECIR «no existe ningún identificador en fuente pública»: EXISTE, Y ES
    # INVÁLIDO.
    # NO HAY ESCENARIO DEL CAMINO POSITIVO, Y ES DELIBERADO: no existe ningún identificador válido
    # que probar. Fingir uno sería inventarlo.

  # ---------------------------------------------------------------------------
  # La cáscara global: :focus-visible y scroll-padding-top (A-18 CERRADA → 2.4.11 es de F-06)
  # ---------------------------------------------------------------------------

  @s11
  Scenario: la hoja global declara un foco visible y un scroll-padding-top
    Given la hoja de estilos global del sitio
    When se leen sus reglas globales
    Then existe una regla ":focus-visible" que declara un indicador de foco visible
    And existe una declaración "scroll-padding-top" con un valor mayor que 0
    # SEPARACIÓN DE EJES, Y AQUÍ ES DONDE MÁS SE HA PAGADO:
    # `SC 2.4.7` (AA) exige foco **VISIBLE**. `G165` (foco por defecto) y `C45` (`:focus-visible`)
    # son AMBAS TÉCNICAS SUFICIENTES. TIENE **CERO REQUISITO DE CONTRASTE O GROSOR** [V]: el 3:1 /
    # 2px es `SC 2.4.13`, Y ES **AAA**. → ESTE ESCENARIO NO ASEVERA NINGÚN UMBRAL, Y NO PUEDE
    # HACERLO SIN MENTIR. PROHIBIDO ATRIBUIR CUALQUIER UMBRAL A 2.4.7. Es la TRAMPA GEMELA del
    # 1.4.11 de F-03, donde el audit ya se equivocó una vez.
    # ✅ **A-18 CERRADA POR EL LEAD (2026-07-16): `SC 2.4.11 Focus Not Obscured` (AA, NUEVO en WCAG
    # 2.2) ES DE F-06, NO DE F-04.** El razonamiento, para que no se pierda entre features:
    # **F-04 NO PUEDE TESTEAR QUE LA CABECERA NO TAPE EL FOCO CUANDO LA CABECERA LA MONTA F-06** —
    # no hay nada que pueda tapar nada todavía. El `feature_list.json` de F-06 ya lo contempla.
    # 🔁 **REPARTO, ESCRITO AQUÍ PARA QUE NO SE CAIGA POR LA GRIETA ENTRE LAS DOS FEATURES:**
    #     **F-04 PONE** el `scroll-padding-top` (es cáscara global, y este escenario lo fija).
    #     **F-06 VIGILA QUE FUNCIONE** (que el foco no quede oculto tras la cabecera sticky).
    # `scroll-padding-top` es la técnica **`C43`**, suficiente para 2.4.11, cuyo *Understanding*
    # nombra **LITERALMENTE los sticky headers** [V]. **EL VALOR DEPENDE DE LA ALTURA DE LA CABECERA
    # STICKY, QUE ES DE F-06** → este contrato fija que la declaración **EXISTE y es > 0**, **NUNCA
    # un número: fijarlo hoy sería INVENTARLO**. F-06 es quien puede fijarlo, porque es quien conoce
    # la altura.
    # El SCSS NO ES MUTABLE (Stryker no ve CSS/SCSS y `src/styles/` no está en `mutate`), igual que
    # en F-03: aquí el mutante es HUMANO y la puerta de aprobación es su única defensa.

  # ---------------------------------------------------------------------------
  # La puerta del cascarón (decisor puro): el HTML CRUDO de dist/, ruta por ruta
  # ---------------------------------------------------------------------------

  @s12
  Scenario: una página completa y correcta no produce ninguna violación
    Given el HTML CRUDO de la ruta "/" del artefacto de producción, con lang "es", un title no vacío, una meta description no vacía, una canónica, exactamente un h1, main, nav y footer, y un JSON-LD válido de tipo BeautySalon
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then la lista de violaciones está vacía
    # El camino feliz. `html` son LOS BYTES de `dist/`, NUNCA un render del árbol de componentes
    # (ver «la bomba» en la cabecera). Sin este escenario, una puerta que devolviera una violación
    # SIEMPRE pasaría todos los escenarios negativos y rompería el build para siempre.

  @s13
  Scenario Outline: el title y la description ausentes o VACÍOS, y la canónica ausente, producen violación
    Given el HTML CRUDO de la ruta "/" del artefacto de producción en el que "<situacion>"
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then hay exactamente 1 violación
    And la violación declara la ruta "/", la regla "<regla>" y el valor encontrado

    Examples:
      | situacion                                        | regla                |
      | no hay ningún <title>                            | title ausente o vacío |
      | el <title> está presente pero vacío              | title ausente o vacío |
      | no hay ninguna <meta name="description">         | description ausente o vacía |
      | la <meta name="description"> tiene content=""    | description ausente o vacía |
      | no hay ningún <link rel="canonical">             | canónica ausente      |

    # A2. 🔴 LA FILA DEL `<title>` VACÍO EXISTE POR UN HALLAZGO SOBRE EL DIST INSTALADO, y explica
    # por qué la regla se formula «ausente **O** vacío» y no «vacío»: `extractHelmet` hace
    # `if (titleString.split(">")[1] === "</title") titleString = ""` [V: :434-436] → un
    # `<Head><title>{''}</title>` **NO PRODUCE UN `<title>` VACÍO: PRODUCE NINGÚN `<title>`**. EL
    # DIST BORRA EL TITLE VACÍO. Si la regla solo buscara el vacío, ESTE CASO SE ESCAPARÍA. Las dos
    # filas del title son la MISMA regla por las DOS puertas por las que entra el fallo.
    # La puerta ACUSA, no gruñe (precedente F-01/F-03): ruta + regla + valor, no «hay un problema
    # de SEO».
    # LÍMITE DECLARADO (T3): un `<title>` DUPLICADO —posible si alguien añade uno estático a
    # `index.html`, que Helmet NO deduplica [V]— NO lo caza esta regla. Ver la cabecera.

  @s14
  Scenario: la misma canónica en dos rutas distintas produce violación
    Given el HTML CRUDO de la ruta "/" con la canónica "https://example.invalid/"
    And el HTML CRUDO de la ruta "/servicios" con la canónica "https://example.invalid/" (heredada de la home)
    When se inspecciona el sitio con la lista de rutas esperadas ["/", "/servicios"]
    Then hay exactamente 1 violación
    And la violación declara la regla "canónica repetida entre rutas distintas" y nombra las dos rutas "/" y "/servicios"
    # A2. LA CANÓNICA ES **POR PÁGINA**, y el fallo típico es que TODAS HEREDEN LA DE LA HOME. Ese
    # fallo **PASA CUALQUIER TEST QUE MIRE UNA SOLA PÁGINA**: la aserción es ENTRE rutas, no dentro
    # de una.
    # ⚠️ ESTE ESCENARIO NACERÍA **INERTE** SI SE ESCRIBIERA SOBRE EL `dist/` REAL: hoy solo hay UNA
    # ruta (`/` [V: src/App.tsx]) y dos rutas no pueden colisionar. POR ESO SE ESCRIBE CON UN
    # **FIXTURE DE DOS RUTAS** SOBRE EL DECISOR PURO — que es exactamente para lo que sirve un
    # decisor puro: los fixtures son gratis. Escrito de otra forma, ES TEATRO.
    # PRECEDENTE DIRECTO: `@s14` de F-03 NACIÓ INERTE Y LO CAZÓ EL JUDGE («un test verde por
    # vacuidad DENTRO del escenario que persigue el verde por vacuidad»). No repetirlo.

  @s15
  Scenario Outline: el lang ausente, duplicado o distinto de "es" produce violación
    Given el HTML CRUDO de la ruta "/" cuyo elemento html es "<elemento>"
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then hay exactamente 1 violación
    And la violación declara la ruta "/", la regla "lang ausente, duplicado o distinto de es" y el valor encontrado

    Examples:
      | elemento                  | motivo                                                      |
      | <html>                    | ausente: el idioma no es determinable por código            |
      | <html lang="en">          | distinto de "es"                                            |
      | <html lang="">            | vacío: no determina ningún idioma                           |
      | <html lang="xx" lang="es"> | DUPLICADO: dos fuentes escribieron el atributo             |

    # SEPARACIÓN DE EJES: `SC 3.1.1` (A) **NO «exige lang»**: exige que el idioma sea **DETERMINABLE
    # POR CÓDIGO** [V]. `lang` en `<html>` es **H57, TÉCNICA SUFICIENTE**, no la norma. Y que un
    # `lang` **INCORRECTO** falle es **[I], no frase citable**: se testea igual, pero NO se le
    # atribuye a la norma. Esa atribución es lo único prohibido.
    # 🔴 LA FILA DEL DUPLICADO NO ES HIPOTÉTICA: el `lang` tiene **DOS FUENTES POSIBLES**. Hoy sale
    # de `index.html` (`<html lang="es">` [V]); pero `<Head>` **TAMBIÉN** puede inyectarlo
    # (`indexHTML.replace('<html', '<html ' + htmlAttributes)` [V: :127-128]). Si ambos existen →
    # `<html lang="xx" lang="es">`, atributo DUPLICADO. **CUÁL GANA ES [NV] Y NO HACE FALTA
    # AVERIGUARLO**: la decisión es **UNA SOLA FUENTE** (`index.html`) y la puerta asevera
    # **EXACTAMENTE UN `lang`, con valor `es`**. RESOLVER UNA AMBIGÜEDAD PROHIBIÉNDOLA ES MÁS BARATO
    # QUE VERIFICARLA.

  @s16
  Scenario Outline: la cuenta de h1 — cero y dos son violación, uno pasa
    Given el HTML CRUDO de la ruta "/" con <cuantos> elementos h1, y correcto en todo lo demás
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then hay exactamente <violaciones> violación(es) por la regla "h1 ausente o más de uno"

    Examples:
      | cuantos | violaciones | frontera                                    |
      | 0       | 1           | ausente                                     |
      | 1       | 0           | el único caso que pasa                      |
      | 2       | 1           | más de uno                                  |

    # ⚠️ **CRITERIO DE PROYECTO, NO WCAG**, y la distinción es obligatoria: **`SC 1.3.1` NO EXIGE
    # «exactamente un h1». NINGUNA FRASE SOBRE EL NÚMERO DE h1 EXISTE EN TODA LA NORMA** [V: fetch
    # de la página completa]. `H101`/`ARIA11`/`ARIA20` son **TÉCNICAS SUFICIENTES, EN OR** — no
    # requisitos. Es una BUENA REGLA y se testea igual; **LO PROHIBIDO ES LA ATRIBUCIÓN NORMATIVA**.
    # Ningún test, mensaje de violación ni comentario puede decir «lo exige 1.3.1».
    # LAS TRES FILAS FIJAN LA FRONTERA EXACTA y matan el mutante `> 1` → `>= 1` (con él, la fila de
    # 1 h1 emitiría violación y el build se rompería siempre) y el mutante que solo mira la
    # presencia (con él, la fila de 2 pasaría).

  @s17
  Scenario Outline: un landmark ausente produce violación
    Given el HTML CRUDO de la ruta "/" al que le falta el landmark "<landmark>", y correcto en todo lo demás
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then hay exactamente 1 violación
    And la violación declara la ruta "/" y la regla "landmark <landmark> ausente"

    Examples:
      | landmark |
      | main     |
      | nav      |
      | footer   |

    # ⚠️ **CRITERIO DE PROYECTO, NO WCAG**: **`SC 1.3.1` NO EXIGE LANDMARKS** [V]. `ARIA11` es una
    # TÉCNICA SUFICIENTE. Buena regla, se testea igual; prohibida la atribución normativa.
    # Tres filas, no una: el mutante `&&` → `||` en la conjunción de las tres presencias muere aquí
    # (con `||`, faltar UN solo landmark dejaría de emitir violación).

  @s18
  Scenario Outline: una section cuyo título no está en el código produce violación
    Given el HTML CRUDO de la ruta "/" con "<situacion>"
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then hay exactamente <violaciones> violación(es) por la regla "section sin aria-labelledby a un heading real"

    Examples:
      | situacion                                                                                        | violaciones |
      | una <section aria-labelledby="x"> y un <h2 id="x">Servicios</h2> dentro                          | 0           |
      | una <section> sin aria-labelledby, titulada con un <div class="titulo">                          | 1           |
      | una <section aria-labelledby="x"> cuyo id "x" no existe en ningún elemento                       | 1           |
      | <section aria-labelledby="x"> con <div id="x">, id que resuelve a un elemento que NO es heading  | 1           |

    # ✅ **CUARTA FILA AÑADIDA EL 2026-07-17 (aprobación humana en la puerta).** Las tres filas
    # originales **prometían lo que ninguna probaba**: la regla se llama *«`section` sin
    # `aria-labelledby` A UN HEADING REAL»* y la prosa es enfática (*«NO un `div` con `font-size`»*),
    # pero solo distinguían **atributo ausente** (→1), **id que resuelve** (→0) e **id que no existe
    # en ningún elemento** (→1). **NINGUNA distinguía un `<h2 id="x">` de un `<div id="x">`** → el
    # coladero estaba abierto: `<section aria-labelledby="x">` + `<div id="x" class="titulo">`
    # **PASABA**, que es **JUSTO LA FORMA QUE LA PROSA QUIERE PROHIBIR**. La fila **LA EXIGE LA
    # PROPIA PROSA DE LA REGLA**, no un capricho: sin ella el nombre de la regla miente.
    # 🔴 **POR QUÉ IMPORTA MÁS QUE NINGUNA OTRA FILA DE ESTE CONTRATO:** `@s18` es **LA ÚNICA de las
    # DIEZ reglas que mide `SC 1.3.1` DE VERDAD** (las otras nueve son criterio de proyecto o
    # requisito de Google). Sin esta fila, **el `acceptance` 1 NO ESTÁ PROTEGIDO**: la única regla
    # normativa de la feature se cumplía en el papel y no en el código.
    # **QUÉ CUENTA COMO HEADING: `h1`…`h6`.** El spec **NO fija nada más** — ni `role="heading"`, ni
    # `aria-level`, ni ningún otro elemento — **y NO SE INVENTA**: lo que no está escrito, no está
    # decidido. Si mañana hace falta `role="heading"`, se vuelve a la puerta y se añade una fila.
    # ⚠️ El `tdd_craftsman` **NO lo implementó, Y CON RAZÓN**: sin esta fila sería **producción que
    # ningún test rojo pide (Ley 1)** y un **MUTANTE INMORTAL** (nada lo mataría) → rompería el
    # umbral de 1.0. **Cerrar el coladero exigía UNA FILA EN EL CONTRATO, no código a escondidas.**
    # Precedente literal del repo: la rama de «texto grande» que F-03 **no** implementó por esto
    # mismo. El craftsman avisó en vez de colarlo; el humano lo aprobó.

    # ✅ **ESTO SÍ ES `SC 1.3.1`**, y es lo único de esta feature que lo es: **una relación que el
    # diseño comunica VISUALMENTE debe existir EN EL CÓDIGO**. El título de sección tiene que ser un
    # **heading REAL** referenciado por `aria-labelledby` — **NO un `div` con `font-size`**, que
    # comunica «esto titula esta sección» solo a quien lo VE.
    # LA TERCERA FILA ES LA QUE MUERDE: un `aria-labelledby` que apunta a un id INEXISTENTE es
    # **peor que no ponerlo** (promete una relación que el árbol de accesibilidad no puede resolver)
    # y **pasa cualquier comprobación de mera presencia del atributo**.
    # ✅ **CONFIRMADA POR EL HUMANO (2026-07-16) COMO LA DÉCIMA REGLA DE VIOLACIÓN.** La lista del
    # `project-spec.md` §Feature 4 → «Contrato» enumeraba **NUEVE** y esta no estaba; se destiló
    # igualmente porque el **acceptance 1** de `feature_list.json` (reescrito el 2026-07-16) la
    # nombra explícitamente como «lo que SÍ mide 1.3.1», y se **AVISÓ en la puerta en vez de
    # colarla**. El humano la mantiene. **El desfase con `project-spec.md` lo corrige el lead**
    # añadiendo la décima a su enumeración — este contrato no toca el spec.
    # ⭐ **ES LO ÚNICO DE ESTE CONTRATO QUE MIDE DE VERDAD `SC 1.3.1`.** Las otras nueve reglas son
    # **criterio de proyecto** (@s16, @s17) o requisito de **Google**/decisión nuestra (@s21). Esta
    # es la norma.

  # ---------------------------------------------------------------------------
  # La puerta: el JSON-LD horneado (A3; T-6; el alias y el @graph anidado)
  # ---------------------------------------------------------------------------

  @s19
  Scenario Outline: el JSON-LD ausente o no parseable produce violación, nunca una excepción tragada
    Given el HTML CRUDO de la ruta "/" en el que "<situacion>"
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then hay exactamente 1 violación
    And la violación declara la ruta "/" y la regla "<regla>"
    And la inspección NO lanza ninguna excepción y NO devuelve la lista vacía

    Examples:
      | situacion                                                       | regla                 |
      | no hay ningún <script type="application/ld+json">               | JSON-LD ausente       |
      | el <script type="application/ld+json"> contiene "{ esto no es json" | JSON-LD no parseable |
      | el <script type="application/ld+json"> está vacío               | JSON-LD no parseable  |

    # A3. **UNA PUERTA QUE SE TRAGA SU EXCEPCIÓN Y DEVUELVE `[]` ES PEOR QUE NINGUNA**: es
    # LITERALMENTE cómo se evaporaron los 3 bloqueantes AA del stack base [V]. El JSON-LD roto es
    # **VIOLACIÓN**, con su línea en el informe; jamás un `catch` mudo.
    # Que el JSON-LD llegue al `dist/` está garantizado por la vía de `<Head>`: `extractHelmet`
    # incluye `helmet.script.toString()` en `metaStrings` [V: :437-442] → un
    # `<Head><script type="application/ld+json">` **SE HORNEA**. Sin ese hallazgo, el contrato no
    # podría prometer JSON-LD prerenderizado.

  @s20
  Scenario Outline: la aserción es sobre el tipo EFECTIVO, no sobre el string
    Given el HTML CRUDO de la ruta "/" con un JSON-LD cuyo @type es <tipo>
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then hay exactamente <violaciones> violación(es) por la regla "ningún nodo con tipo efectivo BeautySalon"

    Examples:
      | tipo                              | violaciones | por qué                                                        |
      | "BeautySalon"                     | 0           | forma canónica                                                  |
      | ["BeautySalon"]                   | 0           | @type ES UN ARRAY VÁLIDO de un elemento                          |
      | ["BeautySalon", "Organization"]   | 0           | array que INCLUYE el tipo acordado                               |
      | "LocalBusiness"                   | 1           | es ANCESTRO, no el subtipo acordado                              |
      | "HealthAndBeautyBusiness"         | 1           | es el padre DIRECTO, no el acordado                              |
      | "NailSalon"                       | 1           | otro subtipo: el contrato fija BeautySalon                       |
      | ["LocalBusiness", "Organization"] | 1           | array SIN el tipo acordado                                       |
      | ausente                           | 1           | sin @type no hay tipo efectivo                                   |

    # 🔴 **UN TEST QUE HAGA `json['@type'] === 'BeautySalon'` CIERRA LOS OJOS ANTE MEDIA DOCENA DE
    # FORMAS VÁLIDAS** y deja abierta la escapatoria «es que yo uso otro tipo». Ese test FALLARÍA
    # las filas 2 y 3 (un array nunca es igual a un string) → **las filas del array son las que
    # FUERZAN el tipo efectivo**. Mata también el mutante `===` → `!==`.
    # LA JERARQUÍA REAL, literal de schema.org, con **HERENCIA MÚLTIPLE** [V]:
    #   Thing > Organization > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
    #   Thing > Place        > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
    # El padre **DIRECTO** es `HealthAndBeautyBusiness`; `LocalBusiness` es **ANCESTRO**. Decir
    # «BeautySalon, subtipo de LocalBusiness» es cierto TRANSITIVAMENTE y falso como jerarquía — y
    # **BORRA EL MECANISMO QUE JUSTIFICA EL CONTRATO**: es la **RUTA DUAL** lo que hace válidas a la
    # vez `address` (vía `Organization`) y `geo` (vía `Place`).
    # Las filas de `LocalBusiness`/`HealthAndBeautyBusiness`/`NailSalon` fallan porque **ESTE
    # CONTRATO fija `BeautySalon`** (criterio de proyecto, respaldado por Google: «Use the most
    # specific LocalBusiness sub-type possible» [V]) — **NO** porque schema.org obligue: schema.org
    # NO OBLIGA A NADA [V]. Sujeto explícito, siempre.
    # El nodo puede estar en la raíz o dentro de un `@graph`: la regla es «EXISTE UN NODO cuyo tipo
    # efectivo incluye BeautySalon», y el recorrido es el mismo RECURSIVO de @s22.

  @s21
  Scenario Outline: el JSON-LD sin name, sin address, con address como Text, o con geo distinto de la constante produce violación
    Given el HTML CRUDO de la ruta "/" con un JSON-LD de tipo BeautySalon en el que "<situacion>"
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then hay exactamente 1 violación
    And la violación declara la ruta "/", la regla "<regla>" y el valor encontrado

    Examples:
      | situacion                                                       | regla                  |
      | no hay campo name                                               | JSON-LD sin name       |
      | name es la cadena vacía                                         | JSON-LD sin name       |
      | no hay campo address                                            | JSON-LD sin address    |
      | address es el Text "AV.ATENAS 75 LOCAL 41 C.C.ZOCO MONTE ROZAS" | address no es PostalAddress |
      | address.streetAddress es la cadena vacía                        | address incompleta     |
      | geo.latitude es 40.5179876                                      | geo distinto de la constante |
      | geo.longitude es -3.9226680                                     | geo distinto de la constante |
      | no hay campo geo                                                | geo ausente            |

    # A3. **SUJETO EXPLÍCITO, ES LA REGLA MÁS CARA DE ESTE CONTRATO:** `name` y `address` son
    # obligatorios **PARA GOOGLE**, y **solo** para la **ELEGIBILIDAD DE RICH RESULT**. **schema.org
    # NO OBLIGA A NINGUNA PROPIEDAD: un JSON-LD con solo `@type` es VÁLIDO** [V, verificado POR
    # AUSENCIA CITABLE: en schema.org/BeautySalon y /LocalBusiness NO EXISTE ninguna frase que marque
    # propiedad alguna como *required*]. Ningún mensaje de violación puede decir «schema.org obliga
    # a X»: sería FALSO. Y Google **no garantiza nada**: «Google does not guarantee that features
    # that consume structured data will show up in search results» [V].
    # LA FILA DEL `address` COMO **Text** ES DECISIÓN DE PROYECTO **MÁS ESTRICTA QUE EL
    # VOCABULARIO**, y se declara: **schema.org ADMITE `Text` en `address`** — ese string
    # **PASARÍA** su validación [V]. Exigir `PostalAddress` es NUESTRO. (El literal de esa fila es
    # la dirección REAL del JSON-LD del cliente [V]: es exactamente la forma que NO queremos.)
    # LAS DOS FILAS DE `geo` MUTAN **UN SOLO DÍGITO** de la constante (…875 → …876, …688 → …680):
    # anclan que el valor se compara EXACTO. La constante NUNCA se recalcula ni se «corrige» desde
    # OSM — ver @s8 y el límite honesto de la cabecera (verificada a nivel de EDIFICIO, jamás de
    # «Local 41»).
    # Los esperados se escriben A MANO; NUNCA se importan de `site.ts`/`seo.ts` (anti-tautología).

  @s22
  Scenario Outline: aggregateRating, Review y sus propiedades sueltas producen violación a CUALQUIER profundidad
    Given el HTML CRUDO de la ruta "/" con un JSON-LD en el que "<situacion>"
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then hay al menos 1 violación
    And una violación declara la ruta "/", la regla "reseñas prohibidas en el JSON-LD" y la ruta del nodo dentro del JSON-LD

    Examples:
      | situacion                                                                             |
      | el nodo raíz tiene aggregateRating { ratingValue: 4.9, reviewCount: 1231 }            |
      | el @graph contiene un Service que tiene aggregateRating                               |
      | el @graph contiene un Service con un Offer anidado que tiene aggregateRating          |
      | el nodo raíz tiene review: [ { "@type": "Review" } ]                                  |
      | el @graph contiene un Service que tiene review: [ { "@type": "Review" } ]             |
      | el nodo raíz tiene ratingValue: 4.9 SUELTO, sin envoltorio                            |
      | el nodo raíz tiene reviewCount: 1231 SUELTO, sin envoltorio                           |

    # 🔴 **T-6, Y SU PORQUÉ SE ESCRIBE EN TRES CAPAS PORQUE SON TRES HECHOS DISTINTOS:**
    #   (a) **PROHIBICIÓN** — Google, *Technical guidelines*: **«Don't aggregate reviews or ratings
    #       from other websites»**, encabezado por «Warning: If your site violates one or more of
    #       these guidelines, then Google may take **MANUAL ACTION** against it» [V]. El 4,9 · 1.231
    #       de las filas **vive en TREATWELL — OTRO SITIO**. ESTA es la cita que aplica.
    #   (b) **INUTILIDAD** — una página con LocalBusiness/subtipo que puntúa sobre sí misma es
    #       «ineligible for star review feature» [V]: CERO *upside* en SERP.
    #   (c) **FALTA DE TÍTULO** — Treatwell cl. 4.2.2: el salón **NO TIENE DERECHO** sobre las
    #       reseñas [V]. **NO es «prohibido republicar»: es que NO HAY LICENCIA.** Escribirlo como
    #       prohibición expresa **SERÍA INVENTAR**.
    # **(a) Y (c) SOSTIENEN LA DECISIÓN POR SEPARADO**: si mañana Google derogase la regla
    # *self-serving*, (a) y (c) siguen vivos. Eso hace la decisión **ROBUSTA**, y por eso se escribe
    # así.
    # ❌ **PROHIBIDA la redacción «Google prohíbe aggregateRating self-serving»**, en el Gherkin, en
    # el código y en los mensajes: **eso es INELEGIBILIDAD, NO PROHIBICIÓN**, y la **FAQ OFICIAL LO
    # REFUTA**: «Do I need to remove self-serving reviews…? **NO, YOU DON'T NEED TO REMOVE THEM**» y
    # «Will I get a manual action…? **YOU WON'T GET A MANUAL ACTION JUST FOR THIS**» [V]. Es
    # REFUTABLE CON UNA FUENTE OFICIAL Y HUNDIRÍA LA CREDIBILIDAD DEL CONTRATO ENTERO.
    # **SE PROHÍBEN AMBOS, `Review` Y `AggregateRating`**: «It applies to **Review AND
    # AggregateRating**» [V]. Y **la propiedad SUELTA** (`ratingValue`/`reviewCount` sin su
    # envoltorio), porque es la escapatoria trivial.
    # 🔴 **LAS FILAS ANIDADAS SON LA RAZÓN DE SER DE ESTE ESCENARIO**: `aggregateRating` puede
    # **REAPARECER DENTRO DE UN `Service`/`Offer` DEL `@graph`** → **RECORRIDO RECURSIVO, NUNCA
    # COMPROBACIÓN DE PRIMER NIVEL**. El mutante que **CORTA LA RECURSIÓN** (quedarse en el primer
    # nivel) **DEBE MORIR AQUÍ**, y **SIN FIXTURE NEGATIVO ANIDADO SOBREVIVE** — es la lección
    # literal de F-03.
    # SIN ESCAPATORIA POR EL TIPO: «If the entity that's being reviewed controls the reviews about
    # itself, their pages that use **LocalBusiness or any other type of Organization** structured
    # data are ineligible…» [V]. `BeautySalon` cae **POR LAS DOS RAMAS** de la herencia múltiple. La
    # regla es «LocalBusiness **y cualquier subtipo, incluido BeautySalon**»: cierra el «es que yo
    # uso BeautySalon».

  @s35
  Scenario Outline: la puerta prohíbe openingHours y prohíbe la MEZCLA — la regla que hereda F-10
    Given el HTML CRUDO de la ruta "/" con un JSON-LD BeautySalon en el que "<situacion>"
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then hay exactamente <violaciones> violación(es) por la regla "horario: solo openingHoursSpecification, nunca openingHours, jamás las dos"

    Examples:
      | situacion                                                        | violaciones | por qué                                                       |
      | no hay ni openingHours ni openingHoursSpecification              | 0           | ES EL ESTADO DE F-04 HOY: el horario es de F-10 (A-19)        |
      | hay openingHours                                                 | 1           | la clave PROHIBIDA: Google solo recomienda …Specification [V] |
      | hay openingHoursSpecification                                    | 0           | la forma ELEGIDA: la que F-10 deberá emitir                   |
      | hay openingHours Y openingHoursSpecification a la vez            | 1           | LA MEZCLA: dos fuentes de verdad para el mismo hecho          |

    # ✅ **A-19 CERRADA POR EL HUMANO (2026-07-16): el horario NO entra en F-04 — es de F-10.** Pero
    # **F-04 SÍ FIJA LA REGLA**, y este escenario es el mecanismo por el que la fija.
    # 🔴 **POR QUÉ ESTA REGLA EXISTE HOY, SI F-04 NO EMITE HORARIO:** `openingHours` y
    # `openingHoursSpecification` **COEXISTEN y AMBAS son válidas por ramas distintas de
    # schema.org** [V]. **SI EL CONTRATO NO FIJA CUÁL, DOS IMPLEMENTADORES ELIGEN DISTINTO Y AMBOS
    # PASAN LOS TESTS.** Google solo recomienda `openingHoursSpecification` [V] → **se fija ESA y se
    # PROHÍBE `openingHours`**.
    # **LA 4ª FILA ES LA QUE MÁS IMPORTA Y LA QUE MÁS FÁCIL SE OLVIDA: LA MEZCLA.** Emitir las dos
    # es «válido» para schema.org y es **dos fuentes de verdad para el mismo hecho**, que es
    # exactamente lo que I-7 (fuente única) existe para prohibir. Divergen en silencio.
    # **LA 1ª FILA ES EL ESTADO REAL DE F-04 HOY**, y no es decorativa: sin ella la regla nacería
    # rompiendo el build de F-04, que no emite horario. Y la 3ª fila **NACE INERTE respecto a la
    # producción de F-04** (nadie emite `…Specification` todavía) **a propósito**: es el contrato que
    # **F-10 HEREDA YA ESCRITO**, con su fixture, para que llegue a una decisión tomada en vez de
    # tomarla otra vez.
    # ⚠️ **PARA F-10:** esta regla es tuya y ya está en verde. Emite `openingHoursSpecification`
    # desde el `HORARIO` de la fuente única (F-02) y **nunca** `openingHours`.

  # ---------------------------------------------------------------------------
  # La puerta ANTI-404 (A4; A-17) — el eje «permanente» se asevera contra el DESTINO
  # ---------------------------------------------------------------------------

  @s23
  Scenario Outline: un href interno sin fichero correspondiente en dist/ produce violación
    Given el HTML CRUDO de la ruta "/" con un enlace a "<href>"
    And un artefacto de producción que contiene únicamente "dist/index.html"
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then hay exactamente 1 violación
    And la violación declara la ruta "/", la regla "href interno sin fichero en dist/" y el href "<href>"

    Examples:
      | href         | por qué                                                                 |
      | /aviso-legal | ES LITERALMENTE EL BUG DEL CLIENTE: hoy su /es/aviso-legal da 404 [V]   |
      | /servicios   | ruta no prerenderizada: el enlace apunta a la nada                      |
      | /Aviso-Legal | no existe: la resolución de rutas del artefacto no es un juego de cajas |

    # **A-17, CERRADA POR EL HUMANO. ES LA ENTREGA CENTRAL DE F-04 Y SUSTITUYE AL ACCEPTANCE 3
    # VIEJO**, que era insostenible por tres motivos (ver la cabecera: el troceado se contradecía
    # consigo mismo; «responde 200» es NECESARIO PERO NO SUFICIENTE —`/es/confidentiality_ws`
    # RESPONDE 200 Y ES JURÍDICAMENTE NULO [V]—; y F-04 NO PUEDE PROMETER UN AVISO LEGAL CONFORME
    # porque **NO EXISTEN RAZÓN SOCIAL NI NIF VÁLIDO** [V]).
    # ESTA PUERTA ES **MÁS FUERTE** que «/aviso-legal responde 200»: cubre **TODOS** los enlaces, no
    # uno; se puede testear **HOY**, sin red; y **NO PROMETE NADA LEGAL**.
    # **AQUÍ ES DONDE SE ASEVERA EL EJE «PERMANENTE» DE LA LSSI art. 10.1, Y ES LA MITAD DE LA
    # LECCIÓN**: *permanente* es **TEMPORAL** (disponible siempre en el tiempo), **NO ESPACIAL**
    # («en todas las páginas», que **NO ESTÁ EN LA LEY** [V: 0 ocurrencias en el estatuto entero]).
    # Un test que solo verificara «el enlace está en el pie de las N páginas» daría **VERDE MIENTRAS
    # SE INCUMPLE DE VERDAD** y **ROJO EN UN CASO LÍCITO** (art. 10.2: «su página **O** sitio»). **ES
    # EXACTAMENTE EL 404 DEL CLIENTE: EL ENLACE ESTÁ EN EL PIE, Y EL DESTINO NO EXISTE.** Por eso se
    # asevera **CONTRA EL DESTINO**.
    # **EL PIE DE F-04 NO EMITE ENLACES LEGALES TODAVÍA** (A-17): las rutas, los enlaces y el
    # contenido legal son **F-16**. Suena incómodo y es lo correcto — un pie que enlaza a la nada ES
    # el bug del cliente. Cuando F-16 se desbloquee, los enlaces aparecerán **CON DESTINO REAL**, y
    # esta puerta hace **ESTRUCTURALMENTE IMPOSIBLE** que aparezcan sin él.

  @s24
  Scenario Outline: los href que no son rutas internas no producen violación
    Given el HTML CRUDO de la ruta "/" con un enlace a "<href>"
    And un artefacto de producción que contiene únicamente "dist/index.html"
    When se inspecciona el sitio con la lista de rutas esperadas ["/"]
    Then no se emite ninguna violación por la regla "href interno sin fichero en dist/"

    Examples:
      | href                                                | por qué no es violación                       |
      | /                                                   | la home EXISTE: dist/index.html               |
      | https://www.facebook.com/nailslashstudiorozas/      | externo: fuera del artefacto (dato real, F-02) |
      | tel:+34625223366                                    | no es una ruta                                |
      | mailto:info@example.invalid                         | no es una ruta                                |
      | #servicios                                          | ancla dentro de la misma página               |

    # La aseveración del **NEGATIVO**, y no es decorativa: **sin ella, la puerta anti-404 nace rota
    # o nace laxa**. Rota si trata los externos como rutas internas (rompería el build por el enlace
    # REAL de Facebook, que la fuente única ya emite [V: src/lib/site.ts]). Laxa si «no es interno»
    # se implementa como «no empieza por `/`», que dejaría pasar cualquier cosa.
    # La fila de `/` mata al mutante que marca **todo** href como violación — con él, @s23 pasaría
    # por la razón equivocada.
    # `example.invalid` es TLD reservado (RFC 2606): el mailto NO es un dato del cliente, es un
    # fixture. **El email real NO se publica (A-11).**
    # 🟠 Ver también @s36-@s38 (ENMIENDA 1, 2026-07-25, al final de este fichero): la MISMA puerta
    # bajo una base de despliegue declarada (GitHub Pages DE PROYECTO). Este escenario NO cambia:
    # sigue siendo el caso «sin base declarada».

  @s25
  Scenario: el informe acusa una línea por violación y es determinista
    Given un artefacto de producción con la ruta "/" sin title y sin canónica, y la ruta "/servicios" sin h1
    When se inspecciona ese mismo sitio dos veces con la lista de rutas esperadas ["/", "/servicios"]
    Then hay exactamente 3 violaciones
    And cada violación nombra su ruta, su regla y el valor encontrado
    And las dos listas son idénticas, elemento a elemento y EN EL MISMO ORDEN
    # **LA PUERTA ACUSA, NO GRUÑE** (precedente F-01/F-03): «hay un problema de SEO» sin decir en qué
    # ruta ni qué regla obliga a buscarlo a mano — y a las 3 de la mañana nadie lo busca: lo salta.
    # DETERMINISMO: misma entrada → misma salida, **mismo orden**. El informe tiene que ser
    # **DIFFABLE**, o el ruido lo vuelve invisible.
    # TRES violaciones y no una: cada infracción es independiente y el informe las acusa TODAS. Un
    # `else if` en vez de dos `if` independientes deja una sin acusar (precedente F-01/@s23).

  # ---------------------------------------------------------------------------
  # La puerta (el humilde): vacuidad, falla cerrada y el exit code (A5)
  # ---------------------------------------------------------------------------

  @s26
  Scenario Outline: la puerta falla si dist/ no tiene una HTML por cada ruta esperada
    Given la lista de rutas esperadas ["/", "/servicios"] y que "<situacion>"
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida declara qué ruta esperada no encontró
    And la salida NO declara que no haya violaciones

    Examples:
      | situacion                                                        |
      | el directorio dist/ no existe                                    |
      | dist/ existe pero no contiene ningún fichero HTML                |
      | dist/ contiene index.html pero no contiene servicios/index.html  |

    # **A5 + la guarda anti-«verde por vacuidad» (A-8 en F-01, @s14 en F-03; AQUÍ ES OBLIGATORIA).**
    # SIN ESTO: `dist/` vacío → **0 páginas → 0 violaciones → build VERDE → «protegidos»**. 0 fallos
    # sobre 0 páginas **NO ES ESTAR PROTEGIDO: ES NO HABER MIRADO**.
    # **`RUTAS_ESPERADAS` DECLARADA ES MEJOR QUE UN MÍNIMO MÁGICO**: crece con las rutas y nadie
    # tiene que acordarse de subir un número.
    # **ES EL MODO DE FALLO MÁS PROBABLE DE ESTA PUERTA**: se ejecuta **DESPUÉS** del build (como
    # F-01 y F-03 [V: package.json]), y un build que no generó nada la dejaría escaneando el vacío.

  @s27
  Scenario: la puerta falla si la lista de rutas esperadas está vacía
    Given la lista de rutas esperadas [] y un dist/ con index.html correcto
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida declara que la lista de rutas esperadas está vacía
    And la salida NO declara que no haya violaciones
    # El mutante **«vaciar `RUTAS_ESPERADAS`»** DEBE ROMPER. Sin este escenario, la guarda de @s26
    # se desactiva sola: con la lista vacía, «una HTML por cada ruta esperada» se satisface
    # **VACUAMENTE** y la puerta pasa sin inspeccionar nada. **ES LA GUARDA DE LA GUARDA** — y es
    # exactamente la trampa que @s14 de F-03 tardó un judge en descubrir: un verde por vacuidad
    # DENTRO del escenario que persigue el verde por vacuidad.

  @s28
  Scenario: la puerta falla si no ha extraído ni un solo enlace del artefacto
    Given un dist/ con una index.html que contiene al menos un href
    And que la puerta extrae 0 enlaces de ese artefacto
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida declara que no se inspeccionó ningún enlace
    And la salida NO declara que no haya enlaces rotos
    # **A5, y el objeto vigilado NO ES EL SITIO: ES EL EXTRACTOR.** Que la puerta anti-404 (@s23)
    # informe «0 enlaces rotos» habiendo mirado **0 enlaces** es exactamente el mismo verde por
    # vacuidad de @s26, un nivel más abajo: un extractor que deja de casar hace que la puerta pase
    # «protegidos» sin haber mirado ni un enlace. La guarda cuenta **TODOS** los href extraídos
    # (internos, externos, `tel:`, anclas), porque lo que detecta es que **EL EXTRACTOR ESTÁ ROTO**,
    # no que el sitio tenga pocos enlaces.
    # ⚠️ **PARA EL tdd_craftsman**: esta guarda EXIGE que la cáscara de F-04 emita **al menos un
    # href** en `dist/index.html`. Es razonable (la `nav` y el `footer` de la cáscara emiten
    # enlaces o anclas), pero **NO ESTÁ VERIFICADO sobre un dist/ real, porque hoy la cáscara aún
    # no existe** [NV]. Si al implementarla resultara que el artefacto sale con 0 href, esta guarda
    # NACE EN ROJO y hay que **volver a la puerta humana**, no bajarle el listón en silencio.

  @s29
  Scenario: la puerta falla cerrada si ella misma revienta
    Given un fichero HTML del artefacto de producción cuya lectura lanza una excepción
    When se ejecuta el build de producción
    Then el código de salida es distinto de 0
    And la salida declara que la puerta no pudo completar la inspección
    And la salida NO declara que no haya violaciones
    # Modos de error (derivación de D-9/I-8, [I], igual que F-01 y F-03). **Una puerta que se traga
    # su propia excepción y devuelve `[]` es PEOR QUE NO TENER PUERTA, porque además da confianza.**
    # Es literalmente cómo se evaporaron los 3 bloqueantes AA del stack base [V]. **Ante la duda:
    # BUILD ROTO, NUNCA BUILD VERDE.** Si la puerta puede fallar en silencio, D-9 es falsa.

  @s30
  Scenario: el build de producción con una cáscara correcta termina con código de salida 0
    Given un dist/ con una HTML por cada ruta esperada, todas con lang "es", title, description, canónica propia, un h1, main/nav/footer, JSON-LD BeautySalon válido y ningún href interno roto
    When se ejecuta el build de producción
    Then el código de salida es 0
    And no se emite ninguna violación
    # Sin el camino feliz, una puerta que rompiera SIEMPRE pasaría todos los escenarios negativos.

  @s31
  Scenario: el build de desarrollo NO invoca la puerta del cascarón
    Given una cáscara con el title ausente y sin JSON-LD
    When se ejecuta el build de desarrollo
    Then el código de salida es 0
    # Precedente F-01/@s14 y F-03: **la función es PURA; el `exit ≠ 0` vive en la PUERTA**, y la
    # puerta se engancha SOLO a `pnpm build` de producción, DESPUÉS de `vite-react-ssg build`
    # [V: package.json]. La puerta separa **«ver» de «publicar»**: en local una cáscara a medias es
    # legítima — es para ver el diseño.

  # ---------------------------------------------------------------------------
  # Las dos trampas que anclan el porqué (T1 y T2). Sin ellas, alguien las revierte
  # ---------------------------------------------------------------------------

  @s32
  Scenario: la metadata NATIVA de React 19 deja el <head> de dist/ VACÍO, y jsdom da VERDE sobre ese mismo bug
    Given una página cuyo title y cuya description se declaran con la METADATA NATIVA DE REACT 19 (<title>/<meta> hoisteados por el propio React), sin <Head> de vite-react-ssg
    When se compara el <head> del HTML CRUDO de dist/ con el <head> que produce jsdom al renderizar ESA MISMA página
    Then el <head> del HTML CRUDO de dist/ no contiene ningún <title> ni ninguna <meta name="description"> — están en el <body>, donde no sirven para nada
    And la puerta emite violación por "title ausente o vacío" y por "description ausente o vacía"
    And el código de salida del build es distinto de 0
    And el <head> que produce jsdom SÍ contiene el title y la description, es decir, JSDOM DA VERDE SOBRE ESTA MISMA VIOLACIÓN
    # 🔴🔴 **ESTE ESCENARIO ES LA FEATURE ENTERA. NO LO BORRES «PORQUE ES RARO».**
    # ✅ **`Then` CORREGIDO EL 2026-07-17 (aprobación humana en la puerta).** Decía «el HTML CRUDO de
    # dist/ NO contiene ningún `<title>`». **ERA FALSO, Y ESTÁ MEDIDO** sobre un build SSG real
    # (`.experimentos-tmp/react19-nativa/dist/index.html`):
    #
    #   <head><meta charset="UTF-8"><script type="module" src="/assets/app-ti4oL6dR.js"></script></head>
    #   <body><div id="root" data-server-rendered="true"><title>Nails Lash Studio</title>
    #   <meta name="description" content="…"><link rel="canonical" href="…">…
    #
    # (a) **EL `<title>` SÍ ESTÁ EN EL ARTEFACTO** — `renderToString` **NO hoistea** la metadata de
    # React 19 al `<head>`: **LA EMITE DENTRO DEL `<body>`**, donde está el componente. Lo que sale
    # **VACÍO es el `<head>`**, que es exactamente lo que la verificación previa siempre dijo (*«el
    # `<head>` del build sale VACÍO»*, `f04_verificacion_previa.md` §1) y **LO ÚNICO QUE IMPORTA**:
    # un `<title>` en el `<body>` no es el título del documento para NADIE — ni buscador, ni pestaña,
    # ni lector de pantalla. La decisión era correcta; la letra del `Then`, falsa. El patrón del
    # proyecto, otra vez.
    # (b) **POR ESO LA PUERTA ACOTA LAS REGLAS DEL `<head>` AL `<head>`** (`cabezaDe(html)`), y no al
    # documento entero. **UNA PUERTA QUE ESCANEE EL DOCUMENTO ENTERO ES CIEGA A ESTE BUG**: encuentra
    # el `<title>` en el `<body>` y **NO ACUSA**.
    # (c) 🔴 **Y NO ES COSMÉTICO: @s32 SE PAGÓ A SÍ MISMO EN SU PRIMERA EJECUCIÓN.** La primera
    # puerta del craftsman buscaba el `<title>` con regex **en el documento entero**, lo encontraba
    # **en el `<body>` y NO acusaba**. Rompió **POR ACCIDENTE** (el JSON-LD del fixture estaba
    # incompleto); **con un JSON-LD completo, EL BUG DE REACT 19 HABRÍA PASADO LA PUERTA EN VERDE** —
    # o sea, la puerta habría sido **TAN CIEGA COMO JSDOM al único bug que F-04 existe para
    # prevenir**. El escenario cazó a su propia puerta.
    # (d) ⚠️ **QUE NADIE «SIMPLIFIQUE» `cabezaDe` DENTRO DE SEIS MESES.** Parece un envoltorio
    # tonto sobre un regex y **ES LA DIFERENCIA ENTRE UNA PUERTA QUE VE Y UNA QUE NO**. Si lo
    # borras, los tests siguen verdes y F-04 deja de existir. Lee (b) y (c) antes de tocarlo.
    # **EL PROJECT-SPEC LO EXIGE EXPLÍCITAMENTE** («debe existir un escenario que demuestre que
    # jsdom NO lo caza — o el próximo agente "simplificará" la puerta a un test de Testing Library
    # y LA DESACTIVARÁ SIN ENTERARSE»).
    # EL MECANISMO, verificado contra el **CÓDIGO REALMENTE INSTALADO** (`vite-react-ssg` 0.9.0), no
    # contra el README ni contra `main`: `extractHelmet` lee **EXCLUSIVAMENTE** del contexto de
    # Helmet; el parámetro `html` (= `appHTML`) **SOLO** alimenta al `styleCollector` y **NUNCA se
    # parsea buscando metadata** [V: :429-446]. Auditados los **DOS ÚNICOS** escritores del `<head>`
    # del dist (`metaAttributes` :122-124 y `styleTag` :920): **NO EXISTE NINGUNA RUTA DE CÓDIGO**
    # por la que un `<title>`/`<meta>` hoisteado por React 19 entre en el `<head>` prerenderizado.
    # **EL ÚLTIMO `And` ES EL QUE JUSTIFICA LA ARQUITECTURA ENTERA**: `react-helmet-async` TAMBIÉN
    # hace efecto sobre `document.head` en cliente, y React 19 TAMBIÉN hoistea al hidratar → **LOS
    # DOS CAMINOS DAN VERDE EN JSDOM**. jsdom es **EXACTAMENTE CIEGO** al único bug que esta feature
    # existe para prevenir. Testing Library aquí no es «insuficiente»: es **INCAPAZ POR
    # CONSTRUCCIÓN** [I sólida, sobre [V]]. **VERDE EN `dev`, VERDE EN JSDOM, SEO CERO EN
    # PRODUCCIÓN.**
    # Es el patrón de `.memoria-cache/patterns/` → `red-css-para-rama-solo-js-en-ssg`: bajo SSG el
    # HTML horneado **congela** el estado que el JS de cliente iba a corregir. **Ya ha mordido 3
    # veces en WebEmpresa. Aquí mordería una cuarta.**
    # SI ENCUENTRAS `metaAttributes.unshift(headElements.innerHTML)` en `:613-617` Y CREES HABER
    # REFUTADO ESTO: **NO. Es del adaptador de TANSTACK ROUTER** (`META_CONTAINER_ID =
    # "__SSG_TANSTACK_META_CONTAINER__"` [V: vite-react-ssg.BqDzTpJh.mjs:3]). **Nosotros usamos
    # react-router**, cuyo `render` llama a `extractHelmet` **y a nada más** [V: :455-472].

  @s33
  Scenario Outline: pinchar el literal <head> de index.html rompe la inyección EN SILENCIO, y la puerta lo caza
    Given un index.html cuyo elemento head se escribe "<literal>"
    When se ejecuta el build de producción
    Then el build de vite-react-ssg NO lanza ningún error por sí mismo
    And el HTML CRUDO de dist/ NO contiene ningún <title>, ninguna <meta name="description">, ninguna canónica ni ningún JSON-LD
    And la puerta emite violación por title, por description, por canónica y por JSON-LD ausentes
    And el código de salida es distinto de 0

    Examples:
      | literal          | por qué escapa al replace() literal      |
      | <head >          | un espacio de más                        |
      | <HEAD>           | otra caja                                |
      | <head lang="es"> | un atributo                              |

    # 🔴 **T2 — LA INYECCIÓN ES UN `replace()` LITERAL QUE FALLA EN SILENCIO.**
    # `indexHTML.replace('<head>', '<head>' + metaTags)` es **MATCH DE STRING EXACTO**, y
    # `String.replace` con un string **NO LANZA SI NO ENCUENTRA: devuelve el HTML INTACTO** [V:
    # :122-124]. Ninguno de los tres literales de la tabla casa → **la inyección NO OCURRE, EL BUILD
    # SIGUE VERDE Y EL `<head>` SALE VACÍO**. Verde por vacuidad, **un nivel más abajo** que @s26.
    # **EL 1er `Then` ES EL CORAZÓN DEL ESCENARIO**: el build **NO SE QUEJA**. Ese silencio es todo
    # el problema; si `vite-react-ssg` lanzara, este escenario sobraría.
    # → **EL CONTRATO FIJA que `index.html` contenga el literal EXACTO `<head>`, en MINÚSCULAS y SIN
    # ATRIBUTOS** — hoy lo cumple [V: fichero real del repo] — **y que NO contenga ningún `<title>`
    # estático** — hoy tampoco [V] (si alguien lo añadiera habría DOS, porque Helmet inyecta el suyo
    # justo DESPUÉS de `<head>` y **NO DEDUPLICA** [V]: es el límite T3 declarado en la cabecera).
    # ✅ **BUENA NOTICIA DE DISEÑO, Y HAY QUE ESCRIBIRLA**: la puerta ya lo caza **POR
    # CONSTRUCCIÓN** — sin `<head>` inyectado faltan **A LA VEZ** title, description, canónica y
    # JSON-LD, que es lo que dice el 3er `Then`. **Este escenario NO añade una regla nueva: ANCLA EL
    # PORQUÉ**, exactamente como `@s18` ancla el 88 % en F-03. Sin él, alguien «normaliza» el
    # `index.html` a `<head lang="es">` dentro de seis meses, ve los tests en rojo y **cambia los
    # tests**.

  # ---------------------------------------------------------------------------
  # La puerta ANTI-404 bajo una BASE DE DESPLIEGUE DECLARADA (ENMIENDA 1, 2026-07-25)
  # ---------------------------------------------------------------------------
  # @s23 y @s24 (arriba) NO SE TOCAN: su `Given` nunca declara `base`, así que SON el caso de HOY
  # (build servido en la raíz del dominio) y su comportamiento sigue IDÉNTICO. Los tres escenarios
  # de aquí abajo cubren el caso NUEVO: GitHub Pages DE PROYECTO, con `base` fijada a una subcarpeta
  # same-origin root-absoluta ya validada por `cero_terceros.feature` ENMIENDA 1 (@s27). Ver el
  # banner de cabecera de este fichero para el análisis completo, y
  # `progress/enmienda_cascaron_base.md` para el registro de decisión.

  @s36
  Scenario Outline: con una base declarada, un href con su prefijo pero SIN ruta lógica tras él sigue siendo violación
    Given un vite.config.ts que declara base "/NailsLashStudioWeb/"
    And el HTML CRUDO de la ruta "/" con un enlace a "<href>"
    And un artefacto de producción que contiene únicamente "dist/index.html"
    When se inspecciona el sitio con la lista de rutas esperadas ["/"] bajo esa base
    Then hay exactamente 1 violación
    And la violación declara la ruta "/", la regla "href interno sin fichero en dist/" y el href "<href>"

    Examples:
      | href                             | por qué sigue siendo violación                                                                                                    |
      | /NailsLashStudioWeb/inexistente  | el prefijo de la base coincide; el resto "/inexistente" no es NINGUNA ruta lógica del artefacto — 404 real, la base no lo esconde |
      | /NailsLashStudioWeb/Servicios    | el prefijo coincide; el resto "/Servicios" no es una ruta lógica — la resolución sigue sin ser un juego de cajas (mismo invariante que @s23) |

    # 🔴 LA RAZÓN DE SER DE ESTE ESCENARIO: sin él, una implementación podría «arreglar» @s37
    # aceptando CUALQUIER href que empiece por el prefijo de la base, sin comprobar el resto — y
    # ESO REABRIRÍA EXACTAMENTE EL 404 QUE A-17 EXISTE PARA CERRAR, ahora con un prefijo delante.
    # La base AMPLÍA lo que cuenta como «interno», NUNCA lo que cuenta como «existe».

  @s37
  Scenario Outline: con una base declarada, un href con su prefijo y una ruta lógica conocida NO es violación; sin el prefijo, queda fuera del ámbito de esta puerta
    Given un vite.config.ts que declara base "/NailsLashStudioWeb/"
    And el HTML CRUDO de la ruta "/" con un enlace a "<href>"
    And un artefacto de producción que contiene únicamente "dist/index.html"
    When se inspecciona el sitio con la lista de rutas esperadas ["/"] bajo esa base
    Then no se emite ninguna violación por la regla "href interno sin fichero en dist/"

    Examples:
      | href                                          | por qué no es violación                                                                                                                                                                          |
      | /NailsLashStudioWeb/                          | el prefijo coincide y el resto (vacío) es la ruta lógica "/", que EXISTE — es el enlace REAL que hornea Cabecera.tsx bajo esta base                                                             |
      | /otra-cosa                                    | NO tiene el prefijo de la base declarada: fuera del ámbito de esta puerta. Bajo GitHub Pages DE PROYECTO la raíz del origen puede alojar un sitio DISTINTO (Pages de usuario/organización) que esta puerta no puede ver ni verificar — tratarlo como roto sería un FALSO POSITIVO sobre un sitio ajeno |
      | /pagina-que-no-tiene-nada-que-ver-con-la-base | NO tiene el prefijo de la base declarada Y es MÁS LARGO que la base (a diferencia de "/otra-cosa", más corta): mismo razonamiento que la fila anterior, fuera del ámbito de esta puerta — ejercita el caso "sin prefijo" cuando `ruta.slice(base.length)` NO da la cadena vacía |

    # 🔴 LA FILA DE `/otra-cosa` ES LA DECISIÓN MÁS DELICADA DE ESTA ENMIENDA, Y ESTÁ RAZONADA EN EL
    # BANNER DE CABECERA DE ESTE FICHERO Y EN `progress/enmienda_cascaron_base.md`: es un HUECO
    # DECLARADO, no cerrado — un href interno escrito a mano SIN pasar por
    # `import.meta.env.BASE_URL` no lo cazará esta puerta bajo una base declarada. Mismo tipo de
    # límite que el `fetch()` de JS ya declarado y no cerrado en F-05 (@s34 de `cero_terceros.feature`).

  @s38
  Scenario: con una base declarada, el resto tras el prefijo se resuelve como CUALQUIER ruta lógica, no solo la home
    Given un vite.config.ts que declara base "/NailsLashStudioWeb/"
    And el HTML CRUDO de la ruta "/" con un enlace a "/NailsLashStudioWeb/servicios"
    And un artefacto de producción que contiene "dist/index.html" y "dist/servicios/index.html"
    When se inspecciona el sitio con la lista de rutas esperadas ["/", "/servicios"] bajo esa base
    Then no se emite ninguna violación por la regla "href interno sin fichero en dist/"
    # ANTI-VACUIDAD: sin este escenario, @s37 se satisface con una implementación que solo reconoce
    # el caso TRIVIAL `href === base` (resto vacío → home) sin generalizar de verdad «quitar el
    # prefijo y comparar el resto contra las rutas lógicas» — y quedaría INERTE frente a cualquier
    # ruta interna que no sea la portada. F-04 hoy solo emite la home [V: `RUTAS_ESPERADAS = ['/']`],
    # así que este escenario usa un FIXTURE de dos rutas sobre el decisor PURO — el mismo argumento
    # que ya usa @s14 para no nacer inerte: los fixtures son gratis, escrito de otra forma es teatro.

  # ---------------------------------------------------------------------------
  # El HTML CRUDO de producción: hidratación sobre el documento completo y sin precargas de foto
  # (ENMIENDA 2, 2026-09-28)
  # ---------------------------------------------------------------------------
  # @s1-@s38 (arriba) NO SE TOCAN. Ver el banner ENMIENDA 2 de la cabecera de este fichero y
  # `progress/hallazgo_hidratacion_ssg.md`.
  #
  # PARA EL `tdd_craftsman`, VALE PARA LOS DOS ESCENARIOS:
  #   - La entrada son los BYTES de `dist/index.html` que deja el `pnpm build` REAL que YA corre
  #     `src/pages/home-horneado.test.ts` en su `beforeAll`. Se AMPLÍA ese fichero. PROHIBIDO lanzar un
  #     build nuevo solo para esto y PROHIBIDO jsdom: jsdom no ve el HTML crudo, ve un árbol ya montado.
  #   - Los literales se escriben A MANO en el test ("module", "/NailsLashStudioWeb/assets/", "async",
  #     "preload", "font", "image", "lazy"). NUNCA se leen de `vite.config.ts` ni se deducen de
  #     `ssgOptions`: un esperado derivado de la configuración vigilada no vigila nada (anti-tautología).
  #   - El ANCLA POSITIVA va PRIMERO y se cuenta con LA MISMA extracción de elementos que la negativa.
  #     Si la extracción no casara nada (atributos en otro orden, otra caja, comillas distintas), el ancla
  #     cae en ROJO y la negativa ya no puede pasar en VACÍO. Un ancla medida con otro patrón no ancla nada.
  #   - Los dos nacen en ROJO sobre el artefacto de HEAD `3c171ff` (medido: `async=""` en el módulo y 13
  #     `<link rel="preload" as="image">`), con sus anclas ya en verde.

  @s39
  Scenario: el script de módulo del bundle viaja SIN async en el HTML crudo de producción
    Given el fichero "dist/index.html" que deja el build REAL de producción, con base "/NailsLashStudioWeb/"
    When se leen sus bytes y se extraen todos los elementos "<script" cuyo atributo "type" vale "module"
    Then hay exactamente 1 elemento así cuyo atributo "src" empieza por "/NailsLashStudioWeb/assets/" y termina en ".js"
    And ese elemento no lleva el atributo "async" en ninguna de sus formas: ni `async`, ni `async=""`, ni `async="async"`, en ninguna caja
    # ANCLA POSITIVA PRIMERO (1er `Then`): sin ella, una extracción que no casara ningún `<script`
    # dejaría el 2º `Then` en verde POR VACÍO. Hoy el ancla ya se cumple (un único módulo,
    # `app-<hash>.js`); el hash cambia en cada build y NO se fija.
    # El 2º `Then` mira el NOMBRE del atributo de ESE elemento, sin distinguir mayúsculas, NUNCA una
    # subcadena de la etiqueta: el hash del nombre del fichero es arbitrario y podría contener «async».
    # `defer` NI SE EXIGE NI SE PROHÍBE: la norma dice «The defer attribute has no effect on module
    # scripts» (HTML Living Standard §4.12.1). Un módulo sin `async` YA se evalúa «when the page has
    # finished parsing», es decir, después del `<script>` del final del `<body>` que lleva el snapshot
    # del router. Exigir `defer` sería exigir un atributo inerte; prohibirlo, prohibir uno inofensivo.
    # El «porqué» completo, con las cifras (con `async` entre 1 y 6 de cada 20 cargas en frío rompen;
    # sin él, 0 de 48), está en el banner ENMIENDA 2.

  @s40
  Scenario: el HTML crudo de producción no lleva ningún <link rel="preload" as="image">
    Given el fichero "dist/index.html" que deja el build REAL de producción, con base "/NailsLashStudioWeb/"
    When se leen sus bytes y se extraen todos los elementos "<link" cuyo atributo "rel" vale "preload" y todos los elementos "<img"
    Then al menos 1 de esos "<link" lleva as="font"
    And al menos 1 de esos "<img" lleva loading="lazy"
    And exactamente 0 de esos "<link" llevan as="image", sea cual sea el orden de sus atributos y sin distinguir mayúsculas
    # ANCLAS POSITIVAS PRIMERO, y cada una cierra una forma distinta de pasar en VACÍO:
    #   - `as="font"` (1er `Then`): demuestra que la extracción de `<link rel="preload">` SÍ encuentra
    #     precargas. Si no casara ninguna, el 3er `Then` daría 0 por construcción. Su NÚMERO NO SE FIJA
    #     AQUÍ: es de F-05 (`cero_terceros.feature`); hoy son 12 `<link>` (6 fuentes × `.woff2`/`.woff`),
    #     y un test que escribiera 6 o 12 aquí duplicaría y contradiría la puerta de F-05.
    #   - `<img loading="lazy">` (2º `Then`): las fotos SIGUEN horneadas. Cierra el atajo de «arreglar»
    #     el escenario quitando las fotos importadas: sin fotos no hay precargas, pero tampoco equipo ni
    #     galería. Lo que se retira es la PRECARGA, nunca la foto. Su número tampoco se fija (hoy 13): el
    #     contenido de la página no es de esta enmienda.
    # NO SATISFACE ESTE ESCENARIO (ni su porqué) añadir `crossorigin` a los `<img>` para que la precarga
    # se reutilice: el 3er `Then` sigue exigiendo cero, y las fotos seguirían pidiéndose ANTES de
    # desplazarse, contra su propio `loading="lazy"`. La precarga de la imagen del LCP, si algún día la
    # hay, es de F-17 (`pipeline_imagenes`) y entrará con su propia enmienda de este escenario.

  # ---------------------------------------------------------------------------
  # El HTML CRUDO de producción: solo se precargan las fuentes `.woff2` (ENMIENDA 3, 2026-09-28)
  # ---------------------------------------------------------------------------
  # @s1-@s40 (arriba) NO SE TOCAN. Ver el banner ENMIENDA 3 de la cabecera de este fichero.
  #
  # PARA EL `tdd_craftsman`:
  #   - La entrada son los BYTES de `dist/index.html` y de los ficheros `.css` de `dist/assets/` que deja
  #     el `pnpm build` REAL que YA corre `src/pages/home-horneado.test.ts` en su `beforeAll`. Se AMPLÍA
  #     ese fichero. PROHIBIDO lanzar un build nuevo y PROHIBIDO jsdom.
  #   - La extracción de `<link>` es LA MISMA de @s40 (reutilízala, no escribas otra): orden de atributos
  #     libre y sin distinguir mayúsculas en nombres ni valores.
  #   - Literales A MANO en el test ("preload", "font", ".woff2", ".woff", `format("woff")`, "@font-face").
  #     NUNCA se leen del manifiesto de Vite, de `@fontsource/*`, de `src/lib/horneado.ts` ni de la lista
  #     de pares de F-05: un esperado derivado de lo vigilado no vigila nada (anti-tautología).
  #   - La LÓGICA (retirar la precarga `.woff`, conservar la `.woff2` y todo lo demás) se hace por TDD en
  #     `src/lib/horneado.ts` con fixtures escritos a mano, un test a la vez, y cita este tag; esos fixtures
  #     SÍ cubren lo que el artefacto de hoy no trae (atributos en otro orden, `.WOFF` en mayúsculas, una
  #     precarga `.woff2` que debe sobrevivir, una precarga que no es `as="font"`). Mutación al 100 %.
  #   - Nace en ROJO sobre el artefacto de HEAD `95e701e` (medido: 6 precargas `as="font"` hacia `.woff`),
  #     con sus dos anclas ya en verde (6 precargas hacia `.woff2`; 6 `@font-face` con `format("woff")`).

  @s41
  Scenario: el HTML crudo de producción solo precarga fuentes .woff2, y el CSS conserva el .woff de respaldo
    Given el fichero "dist/index.html" y los ficheros ".css" de "dist/assets/" que deja el build REAL de producción, con base "/NailsLashStudioWeb/"
    When se leen sus bytes y se extraen, del HTML, todos los elementos "<link" cuyo atributo "rel" vale "preload" y cuyo atributo "as" vale "font", y, del CSS, todas las reglas "@font-face"
    Then al menos 1 de esos "<link" tiene un atributo "href" que termina en ".woff2"
    And al menos 1 de esas reglas "@font-face" lleva en su "src" una entrada "url(…)" cuya URL termina en ".woff" seguida de format("woff")
    And exactamente 0 de esos "<link" tienen un atributo "href" que termina en ".woff", sea cual sea el orden de sus atributos y sin distinguir mayúsculas
    # ANCLAS POSITIVAS PRIMERO, y cada una cierra una forma distinta de pasar en VACÍO:
    #   - 1er `Then` (precarga `.woff2`): MISMA extracción de `<link>` que el 3er `Then`. Si no casara
    #     ningún `<link rel="preload" as="font">`, o no leyera su `href`, el 3er `Then` daría 0 por
    #     construcción; aquí cae en ROJO. Su NÚMERO NO SE FIJA (hoy 6 tras la enmienda): la lista de
    #     fuentes es de F-05, y un test que escribiera 6 duplicaría su puerta.
    #   - 2º `Then` (respaldo `.woff` en el CSS): usa el MISMO criterio «la URL termina en `.woff`» que el
    #     3er `Then`. Si ese criterio no casara nunca (p. ej. comparase con mayúsculas o exigiera comillas),
    #     el 3er `Then` pasaría en VACÍO; aquí cae en ROJO. También cae si no se encuentra ningún `.css` en
    #     `dist/assets/` o ninguna regla `@font-face`. Hoy la URL va SIN comillas (`url(/…/x.woff)`): la
    #     extracción acepta `url(x)`, `url("x")` y `url('x')`. `format("woff")` es literal: si el minificador
    #     cambiara sus comillas, el ancla cae en ROJO (falla cerrada), nunca en verde. Su número tampoco se
    #     fija: los pares son de F-05.
    #   - 3er `Then`: «termina en `.woff`» es el FINAL del valor de `href`, NUNCA una subcadena: `x.woff2`
    #     no termina en `.woff`, y un hash de nombre de fichero podría contener «woff». Un criterio que
    #     confundiera `.woff2` con `.woff` deja este `Then` en ROJO (falla cerrada), no en falso verde.
    # El `type` y el `crossorigin` de las precargas `.woff2` que quedan NI SE EXIGEN NI SE PROHÍBEN aquí.
    # NO SATISFACEN ESTE ESCENARIO (ni su porqué):
    #   - quitar el `.woff` del `src` de los `@font-face` (o tocar el CSS): el 2º `Then` cae, y la decisión
    #     del humano es conservarlo de respaldo;
    #   - quitar TODAS las precargas de fuente: el 1er `Then` cae (y el ancla de @s40 con él);
    #   - dejar las precargas `.woff` corrigiendo su `type` a `font/woff`: el `type` deja de mentir, pero
    #     Chromium sigue descargando los 124 440 bytes, y el 3er `Then` sigue exigiendo 0;
    #   - filtrar las precargas en el TEST en vez de en el artefacto, o comprobarlo sobre jsdom.

  # ---------------------------------------------------------------------------
  # Los tests que construyen el sitio lo construyen en modo PRODUCCIÓN (ENMIENDA 4, 2026-09-28)
  # ---------------------------------------------------------------------------
  # @s1-@s41 (arriba) NO SE TOCAN. Ver el banner ENMIENDA 4 de la cabecera de este fichero.
  # Un escenario por fichero build-based, porque cada uno construye SU artefacto: @s42 → home-horneado,
  # @s43 → contacto-horneado, @s44 → trampas-del-horneado (una fila por cada build de experimento).
  #
  # PARA EL `tdd_craftsman`, VALE PARA LOS TRES ESCENARIOS:
  #   - SIN BUILD NUEVO: la entrada son los BYTES del artefacto que YA construye el `beforeAll` de CADA
  #     fichero, y se AMPLÍA ese mismo fichero. PROHIBIDO un `*-horneado.test.*` nuevo, un `execSync` extra
  #     o un build aparte «para comprobar el modo»: demostraría el modo de un build que NO es el que miran
  #     las demás aserciones del fichero. PROHIBIDO jsdom: son bytes.
  #   - EL BUNDLE SE RESUELVE DESDE EL HTML, NUNCA POR GLOB: es el fichero al que apunta el `src` del
  #     `<script type="module">` del `index.html` que ese mismo fichero de test acaba de leer (se quita el
  #     prefijo y se lee bajo el `dist/assets/` de ESE build). Un glob puede casar 0 ficheros (verde por
  #     vacío) o el chunk equivocado: MEDIDO, `client-*.js` tiene 0 `jsxDEV` y 0 `fileName:` TAMBIÉN en modo
  #     test (354 070 B de React de desarrollo sin un solo `jsxDEV`), así que una negativa sobre él pasa HOY
  #     en vacío. Por eso el 1er `Then` exige el nombre `app-…js`.
  #   - ANCLAS POSITIVAS PRIMERO (1er y 2º `Then`) y sobre LA MISMA cadena leída que las negativas: si la
  #     extracción no casara el `<script>`, o la resolución leyera otro fichero o una cadena vacía, el ancla
  #     cae en ROJO y las negativas ya no pueden pasar en VACÍO. Un ancla medida sobre otra lectura no ancla.
  #   - Cada ancla es un literal de ESA app que la OTRA app no tiene (medido hoy: "Lo que dicen nuestras
  #     clientas" y "625 22 33 66" están en el bundle de la app real y 0 veces en el de la app mínima; "Av.
  #     de Atenas 75, Local 41" está en los 5 experimentos y 0 veces en el de la app real). Si un fichero
  #     leyera por error el `dist/` del otro, su ancla cae.
  #   - Literales A MANO en el test ("module", los prefijos, "app-", ".js", el literal ancla, "jsxDEV",
  #     "fileName:"). NUNCA se derivan de `vite.config.ts`, del manifiesto de Vite, de `import.meta.env` ni,
  #     en @s44, de las constantes con las que el propio fichero escribe la app mínima (`HOME_CON_HEAD`,
  #     `HOME_CON_METADATA_NATIVA`): un esperado sacado de lo vigilado no vigila nada.
  #   - El 4º `Then` cuenta `fileName:` seguido de `"`, `'` o `` ` ``: hoy son todas `fileName:"/…"`, y aceptar
  #     las tres comillas impide que un cambio de minificador la deje pasar en vacío.
  #   - Ni el TAMAÑO ni el HASH se fijan: el tamaño depende de la ruta del disco (banner) y el hash de cada
  #     build. «Más de 0 bytes» es el único umbral de tamaño.
  #   - La corrección es la DECISIÓN del humano: `NODE_ENV=production` en el entorno del SUBPROCESO de cada
  #     `execSync` que construye, con el resto del entorno heredado.
  #   - Nacen en ROJO sobre los artefactos de hoy (cifras en cada escenario), con sus dos anclas ya en VERDE.
  #     Todo lo que ya aseveran estos tres ficheros tiene que seguir en VERDE con el build en producción.
  #   - COSTE: mide `bin/harness init` (tiempo total y nº de tests) ANTES y DESPUÉS, y déjalo en el diario
  #     (`progress/tdd_cascaron_enmienda4.md`). No es un `Then`: la spec no fija umbral, y un `Then` sin
  #     umbral sería un paso vago. Si sube de forma apreciable, se reporta al lead; NUNCA se abarata cambiando
  #     `pnpm build` por `vite-react-ssg build` en home/contacto (sus escenarios exigen las CINCO puertas).
  #
  # NO SATISFACEN @s42-@s44 (ni su porqué):
  #   - demostrar el modo con un build APARTE (test nuevo, `execSync` extra, un `pnpm build` en otro paso):
  #     no es el artefacto que miran las demás aserciones de cada fichero;
  #   - fijar `mode: 'production'` SOLO en `vite.config.ts`: MEDIDO en la app mínima (misma cadena
  #     vite-react-ssg + `@vitejs/plugin-react-swc`) con `NODE_ENV=test` heredado → sigue con 14 `jsxDEV` y
  #     11 `fileName:"…"`. Además, los experimentos de @s44 NO leen el `vite.config.ts` del repo (escriben el
  #     suyo), y la configuración que usa el despliegue no estaba rota;
  #   - poner `NODE_ENV=production` a TODA la suite (script `test`, `vitest.config.ts`, `harness.config.json`
  #     o la CI): la decisión es el entorno del SUBPROCESO, y eso cambiaría el modo de React de todos los
  #     tests de jsdom;
  #   - aseverar sobre `client-*.js`, sobre un glob de `dist/assets/` o sobre otro chunk: pasa HOY en vacío;
  #   - arreglar uno o dos ficheros y no el tercero, o en @s44 solo algunos experimentos: cada escenario
  #     exige SU artefacto, y @s44 cada uno de los 5 builds;
  #   - retocar el bundle a posteriori, o filtrar `jsxDEV`/`fileName` en el TEST antes de contar.

  @s42
  Scenario: el build que lanza home-horneado es de producción: su bundle app-*.js no trae JSX de desarrollo ni rutas del disco
    Given el fichero "dist/index.html" que deja el build REAL que YA lanza "src/pages/home-horneado.test.ts" en su beforeAll, con base "/NailsLashStudioWeb/"
    When se leen sus bytes, se extraen los elementos "<script" cuyo atributo "type" vale "module", y se leen los bytes del fichero de "dist/assets/" al que apunta su atributo "src"
    Then hay exactamente 1 elemento así cuyo "src" empieza por "/NailsLashStudioWeb/assets/app-" y termina en ".js"
    And ese fichero existe, pesa más de 0 bytes y contiene el literal "Lo que dicen nuestras clientas"
    And esos mismos bytes contienen exactamente 0 apariciones de "jsxDEV"
    And esos mismos bytes contienen exactamente 0 apariciones de "fileName:" seguido de una comilla (", ' o `)
    # Hoy (`NODE_ENV=test` heredado): 1er y 2º `Then` en VERDE; el 3º cuenta 368 y el 4º 365, todas
    # `fileName:"/home/user/NailsLashStudioWeb/src/…"`.
    # La extracción de elementos y atributos es LA MISMA que usa @s39 en este fichero (reutilízala, no
    # escribas otra); lo que se añade es el filtro del nombre `app-` y la lectura del fichero apuntado.

  @s43
  Scenario: el build que lanza contacto-horneado es de producción: su bundle app-*.js no trae JSX de desarrollo ni rutas del disco
    Given el fichero "dist/index.html" que deja el build REAL que YA lanza "src/pages/contacto-horneado.test.ts" en su beforeAll, con base "/NailsLashStudioWeb/"
    When se leen sus bytes, se extraen los elementos "<script" cuyo atributo "type" vale "module", y se leen los bytes del fichero de "dist/assets/" al que apunta su atributo "src"
    Then hay exactamente 1 elemento así cuyo "src" empieza por "/NailsLashStudioWeb/assets/app-" y termina en ".js"
    And ese fichero existe, pesa más de 0 bytes y contiene el literal "625 22 33 66"
    And esos mismos bytes contienen exactamente 0 apariciones de "jsxDEV"
    And esos mismos bytes contienen exactamente 0 apariciones de "fileName:" seguido de una comilla (", ' o `)
    # Mismo artefacto que @s42 (los dos ficheros construyen la app real en el mismo `dist/`, y corren en
    # serie: `fileParallelism: false`), pero lo construye OTRO `beforeAll`: sin este escenario, arreglar
    # solo `home-horneado` dejaría `contacto-horneado` aseverando sobre React de desarrollo. Su ancla es
    # OTRO literal a propósito (el teléfono legible que ya asevera @s5 de F-12).
    # Este fichero no importa nada de `src/` ni de otro test: la extracción se escribe AQUÍ, con el mismo
    # criterio que la de @s39 (nombres de atributo sin distinguir mayúsculas; comillas dobles, simples o
    # ninguna), nunca una subcadena de la etiqueta.
    # Hoy: anclas en VERDE; 368 `jsxDEV` y 365 `fileName:"…"`.

  @s44
  Scenario Outline: cada build de experimento de trampas-del-horneado es de producción: "<experimento>"
    Given el fichero ".experimentos-tmp/<experimento>/dist/index.html" que deja el build de la app MÍNIMA que YA construye "src/lib/trampas-del-horneado.test.tsx" en su beforeAll, sin base declarada
    When se leen sus bytes, se extraen los elementos "<script" cuyo atributo "type" vale "module", y se leen los bytes del fichero de ".experimentos-tmp/<experimento>/dist/assets/" al que apunta su atributo "src"
    Then hay exactamente 1 elemento así cuyo "src" empieza por "/assets/app-" y termina en ".js"
    And ese fichero existe, pesa más de 0 bytes y contiene el literal "Av. de Atenas 75, Local 41"
    And esos mismos bytes contienen exactamente 0 apariciones de "jsxDEV"
    And esos mismos bytes contienen exactamente 0 apariciones de "fileName:" seguido de una comilla (", ' o `)

    Examples:
      | experimento     |
      | react19-nativa  |
      | head-espacio    |
      | head-mayusculas |
      | head-atributo   |
      | head-correcto   |
    # La medición va EN EL HELPER que construye cada experimento: todo build del fichero pasa por él, así
    # que un experimento nuevo no puede escaparse. Se mide sobre los bytes que ESE build acaba de dejar y el
    # resultado viaja con el experimento. El `it` que cita @s44 recorre las 5 filas ESCRITAS A MANO por su
    # nombre: si alguna no se construyó o no se midió, cae en ROJO. PROHIBIDO un bucle sobre una colección
    # que podría estar vacía (verde por vacío).
    # Las 5 filas incluyen las que @s32/@s33 usan para ROMPER la cáscara (`react19-nativa` y las tres
    # `head-*` mal escritas): en ellas se rompe el `<head>`, no el bundle, y hoy las 5 llevan su módulo.
    # El prefijo es `/assets/` porque el `vite.config.ts` que el fichero escribe para la app mínima no
    # declara `base` (medido: `/assets/app-<hash>.js` en los 5). El ancla está en las dos cáscaras
    # (`HOME_CON_HEAD` y `HOME_CON_METADATA_NATIVA`), dentro del JSON-LD de la app mínima.
    # Hoy (`NODE_ENV=test` heredado): anclas en VERDE en las 5 filas; 13 `jsxDEV` en `react19-nativa` y 14
    # en las cuatro `head-*`; 10 y 11 `fileName:"…"`. MEDIDO en una copia de `head-correcto` fuera del
    # repo con `NODE_ENV=production`: 95 213 B, 0 `jsxDEV`, 0 `fileName:` y el ancla presente. Satisfacible.

  # ---------------------------------------------------------------------------
  # El MODO de Vite de esos builds también es producción (AMPLIACIÓN de la ENMIENDA 4, 2026-09-28)
  # ---------------------------------------------------------------------------
  # @s1-@s44 (arriba) NO SE TOCAN. Ver la línea AMPLIACIÓN del banner ENMIENDA 4 y `project-spec.md`
  # §Feature 4 → «Enmienda 4» → «Ampliación».
  #
  # PARA EL `tdd_craftsman`:
  #   - La corrección: `MODE: 'production'` en el entorno del SUBPROCESO de cada lanzamiento, ADEMÁS de
  #     `NODE_ENV: 'production'`, con el resto heredado. Es el valor que resuelve un `pnpm build` directo (sin
  #     `MODE` ni `NODE_ENV`, `mode = … || 'production'`). MEDIDO en una copia de la app mínima fuera del
  #     repo: `MODE=test NODE_ENV=production` → «building client environment for test»; `MODE=production
  #     NODE_ENV=production` → «… for production»; sin `MODE` ni `NODE_ENV` → «… for production».
  #   - La entrada es la SALIDA ESTÁNDAR del subproceso de build que el propio test YA lanza (medido: el log
  #     de Vite sale por stdout), tal cual, sin filtrar. SIN BUILD NUEVO. En home/contacto es la salida del
  #     mismo `execSync` de `pnpm build` del `beforeAll`, que hoy se descarta: se CONSERVA (si el build falla,
  #     la que trae el error). En `trampas` es la del `execSync` que construye cada experimento dentro del
  #     helper, NUNCA la `salida` que el helper ya guarda: esa es la de la PUERTA (`tools/puerta-cascaron.ts`),
  #     no la del build, y no lleva el log de Vite (si se confunden, el ancla cae).
  #   - ANCLA POSITIVA PRIMERO y sobre LA MISMA cadena capturada que la negativa: si la salida no se
  #     capturara, viniera vacía o fuera otra, el 1er `Then` cae en ROJO y la negativa ya no puede pasar en
  #     VACÍO.
  #   - Literales A MANO: "building client environment for", "production" y "building client environment for
  #     test". NUNCA se derivan de `process.env`, de `import.meta.env` ni de la config de Vite.
  #   - «Seguida de» es INMEDIATO, tras un espacio: el log es `vite v7.3.6 building client environment for
  #     production...`. MEDIDO con color forzado (`FORCE_COLOR=1`): el escape ANSI envuelve la frase entera, y
  #     `building client environment for production` sigue saliendo sin nada en medio.
  #   - La línea «building ssr environment for …» sale del MISMO modo (medido: cambia a la vez); ni se exige
  #     ni se prohíbe aquí, para no duplicar.
  #   - En `trampas`, como en @s44: se captura EN EL HELPER (todo build pasa por él), y el `it` que cita @s45
  #     recorre las 5 filas escritas a mano por su nombre; nunca un bucle sobre una colección que podría
  #     estar vacía.
  #   - Nace en ROJO en las 7 filas con el lanzamiento de hoy (`NODE_ENV=production` con `MODE=test`
  #     heredado: el log dice «for test»), con el ancla ya en VERDE. @s42-@s44 siguen en VERDE.
  #
  # NO SATISFACEN @s45 (ni su porqué):
  #   - borrar, silenciar o no capturar el log (un `customLogger`, `stdio: 'ignore'` o `'inherit'`, o
  #     redirigir la salida): la negativa pasaría en vacío, y el ancla lo impide (1er `Then` en ROJO).
  #     `logLevel: 'silent'` NO sirve de ejemplo: en vite-react-ssg 0.9.0 solo silencia la línea del SSR,
  #     porque el build del cliente usa su propio `customLogger` (judge, progress/judge_cascaron_enmienda4.md);
  #   - fijar `mode: 'production'` en `vite.config.ts`: MEDIDO, en la app que lo lee el log SÍ pasa a «for
  #     production» aun con `MODE=test`, pero los 5 experimentos NO leen el `vite.config.ts` del repo
  #     (escriben el suyo) y seguirían «for test»; además la decisión es el entorno del SUBPROCESO, y esa
  #     configuración es la que publica el despliegue, que no estaba roto;
  #   - cambiar el comando de build o el script `build` de `package.json`: es el que usa el despliegue;
  #   - QUITAR `MODE` del entorno heredado en vez de fijarlo: el log diría «production» por la vía de
  #     `NODE_ENV`, pero la decisión es el valor explícito con el resto del entorno heredado;
  #   - poner `MODE`/`NODE_ENV` de producción a TODA la suite (config de Vitest, script `test`, CI):
  #     cambiaría el modo de todos los tests de jsdom;
  #   - aseverarlo sobre un build APARTE, sobre la salida de la puerta, o normalizando/filtrando el log en
  #     el TEST antes de buscar.

  @s45
  Scenario Outline: el build <build> que lanza "<lanzador>" corre en modo de Vite "production", según su propio log
    Given la salida estándar del build <build> que "<lanzador>" YA lanza en su beforeAll, capturada por el propio test
    When se lee esa salida capturada, tal cual, sin filtrar
    Then contiene al menos 1 vez el literal "building client environment for"
    And cada una de esas apariciones va seguida, tras un espacio, del literal "production"
    And esa misma salida contiene exactamente 0 veces el literal "building client environment for test"

    Examples:
      | lanzador                              | build                             |
      | src/pages/home-horneado.test.ts       | "pnpm build"                      |
      | src/pages/contacto-horneado.test.ts   | "pnpm build"                      |
      | src/lib/trampas-del-horneado.test.tsx | del experimento "react19-nativa"  |
      | src/lib/trampas-del-horneado.test.tsx | del experimento "head-espacio"    |
      | src/lib/trampas-del-horneado.test.tsx | del experimento "head-mayusculas" |
      | src/lib/trampas-del-horneado.test.tsx | del experimento "head-atributo"   |
      | src/lib/trampas-del-horneado.test.tsx | del experimento "head-correcto"   |

  # ---------------------------------------------------------------------------
  # La puerta mira también los <link>: todo href root-absoluto del artefacto resuelve, bajo la base, a
  # un fichero no vacío y que se publica (ENMIENDA 5, 2026-10-01, H-5)
  # ---------------------------------------------------------------------------
  # @s1-@s45 (arriba) NO SE TOCAN. Ver el banner ENMIENDA 5 de la cabecera de este fichero y
  # `project-spec.md` §Feature 4 → «Enmienda 5 (2026-10-01)». Mapa escenario → spec → mutante, ciegos,
  # traza, las revisiones adversariales de las rondas 1 y 2 y la pasada final de los revisores A y B:
  # `progress/gherkin_h5_enlaces_horneados.md`.
  #
  # TRES GRUPOS, QUE NO SE MEZCLAN. @s65-@s67 los añadió la ronda 1 de revisión y @s68-@s72 la ronda 2;
  # cada uno va en SU grupo, así que el orden del fichero no es el de los números: así no se renumera
  # nada de lo que ya se cita.
  #   - @s46-@s60, @s65, @s66, @s68 y @s69 · PUERTA PURA. Tests UNITARIOS en
  #     `src/lib/puerta-cascaron.test.ts` sobre `ejecutarPuertaDelCascaron`, con dobles escritos A MANO:
  #     sin build, sin `node:fs`, sin jsdom. Son los ÚNICOS que cuentan para la mutación (D10): matan SOLOS
  #     el 100 %, guarda, lista y base incluidas.
  #   - @s61, @s62, @s67 y @s70-@s72 · EXTREMO A EXTREMO (D9). Build-based, en
  #     `src/pages/home-horneado.test.ts`, sobre el artefacto temporal que YA construye su `beforeAll`
  #     (H-3) y con su `correrPuerta` (:498-511). NINGÚN build nuevo; fuera de Stryker.
  #   - @s63 (`@demostracion-del-lead`) y @s64 (`@verificacion-viva`) · los hace el LEAD a mano y los
  #     anota en `progress/verificacion_viva_h5_enlaces_horneados.md`. NO son tests.
  #
  # LAS CINCO REGLAS NUEVAS, con su texto EXACTO (entran en `REGLAS_DEL_CASCARON`: @s60):
  #   regla 1 · link root-absoluto sin el prefijo de la base                                    firma (a)
  #   regla 2 · link root-absoluto sin fichero en dist/                                         firma (b)
  #   regla 3 · link root-absoluto a un fichero de 0 bytes en dist/                             firma (c)
  #   regla 4 · link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta
  #             (H5-4, S-1, S-2, S-7 y S-11)
  #   regla 5 · link root-absoluto a un fichero oculto, que el despliegue no publica            S-8
  # LAS TRES LÍNEAS NUEVAS QUE NO SON REGLAS (texto EXACTO; cada una sale SOLA, sin `<ruta> —`):
  #   corte por lista ausente (S-3):
  #     la puerta no recibió la lista de ficheros del artefacto y hay elementos link root-absolutos que resolver
  #   corte por base declarada NO UTILIZABLE (S-12; `<base>` va tal cual la recibe la puerta):
  #     la base declarada no es una ruta root-absoluta acabada en / y hay elementos link root-absolutos que resolver: "<base>"
  #   guarda del extractor nuevo:
  #     no se inspeccionó ningún elemento link del artefacto: el extractor de href de link no encontró nada
  # FORMATO de toda línea de regla, el de siempre (D8): `<ruta> — <regla>: "<valor>"`, con la raya
  # U+2014. `<ruta>` es la ruta LÓGICA de la página que trae el `<link>`; `<valor>`, el `href` CRUDO, sin
  # limpiar (S-6). Como mucho UNA línea por `<link>`: la de la primera regla que aplica, en el orden de la
  # resolución ESTRICTA: la 4 (primero `%`, `&` o la barra invertida en el `href` ENTERO; después `//`,
  # o un segmento EXACTAMENTE `.` o `..`, en la RUTA, sin `?query` ni `#fragmento`), luego la 1, la 2, la
  # 5 y la 3. ANTES de toda regla, y solo si hay algún candidato: el corte por lista ausente y, después, el
  # de la base no utilizable.
  #
  # PARA EL `tdd_craftsman` (vale para @s46-@s60, @s65, @s66, @s68 y @s69):
  #   - «LA PÁGINA CORRECTA» es la de @s12/@s30: la que hoy devuelve `htmlCrudo()` sin opciones (lang
  #     "es", title, description, la canónica "https://example.invalid/", un h1, main/nav/footer, el JSON-LD
  #     BeautySalon y un `<a href="/">`, que bajo la base queda fuera por @s37). El `<link>` de cada fila se
  #     le AÑADE en el `<head>`, salvo que la fila diga `<body>`. PROHIBIDO cambiar `htmlCrudo`,
  #     `paginaCompleta`, `artefactoCon` o `ficheroDe` (spec: ningún fixture, ayudante ni escenario de
  #     @s1-@s45 cambia): se inserta en el HTML que ya devuelven, o se escribe un ayudante NUEVO.
  #   - «LA LISTA DE REFERENCIA» la devuelve el doble de la lista de ficheros (campo OPCIONAL de la
  #     petición, H5-5; nombre orientativo `ficheros`), escrita A MANO, como `ubicación (bytes)`:
  #       dist/index.html (1500) · dist/favicon.ico (1148) · dist/favicon.svg (2244) ·
  #       dist/apple-touch-icon.png (3682) · dist/assets/app.css (5000) · dist/assets/manrope.woff2 (20000) ·
  #       dist/vacio.svg (0) · dist/uno.svg (1) · dist/x/index.html (900) ·
  #       dist/.vite/manifest.json (8719) · dist/assets/.oculto.css (300) · dist/.oculto-vacio.svg (0)
  #     SIN carpetas: ni `dist/x`, ni `dist/assets`, ni `dist/.vite` están en ella (la lista es de
  #     ficheros). CON ocultos, como la del humilde (S-8): `dist/.vite/manifest.json` lleva los bytes
  #     del artefacto real (spec, inventario) y los tres iconos los de `public/` [V: `ls -la public/`,
  #     2026-10-01]; el resto es fixture, y solo importa 0 frente a 1 o más. Tres filas de @s51 usan
  #     variantes: la misma lista SIN `dist/index.html`, o con `dist/index.html` de 0 bytes.
  #   - SALVO QUE EL ESCENARIO DIGA OTRA COSA: base "/NailsLashStudioWeb/", la lista de referencia
  #     PRESENTE, un único HTML ("dist/index.html", ruta "/") y la lista de rutas esperadas ["/"].
  #   - NOTACIÓN. `⟨U+XXXX⟩` dentro de un `href` es UN carácter con ese código (en el test, con su escape);
  #     el resto es literal. La barra invertida LITERAL (solo en dos filas de @s50) es UNA sola; las filas
  #     nuevas la escriben `⟨U+005C⟩`, porque en un literal de JavaScript la barra invertida seguida de "f"
  #     es un FF, no una barra, y seguida de "/" es solo la "/". `(ninguna)` = la lista de líneas está
  #     VACÍA; una línea en la columna `lineas` = la lista tiene EXACTAMENTE esa línea, y ninguna más.
  #   - ANCLA POSITIVA PRIMERO: el 1er `Then` aplica a ESA página el MISMO extractor de `href` de `<link>`
  #     que usan las reglas y la guarda (puro y exportado para los tests, como ya lo está `extraerEnlaces`;
  #     nombre orientativo `extraerLinks`) y exige el valor CRUDO de la fila. Sin él, una fila `(ninguna)`
  #     pasaría EN VACÍO con un extractor que solo viera la canónica: la guarda no salta (cuenta 1) y no
  #     queda ningún `<link>` que acusar. El ANCLA mira el EXTRACTOR, no la CLASIFICACIÓN: que la puerta
  #     tomó el `href` por root-absoluto lo delata «el doble registra que la puerta pidió la lista»
  #     (@s46, @s51, @s52 y @s68), porque la lista se pide SOLO si hay algún candidato (@s58 fila 2) y, con
  #     base declarada, solo si es utilizable (@s68).
  #   - EL EXTRACTOR que se reutiliza es el de la canónica, `ENLACE` + `ATRIBUTO_HREF`
  #     (`src/lib/puerta-cascaron.ts:72-74`), sobre el documento ENTERO, nunca sobre `cabezaDe`.
  #     `inspeccionarSitio` no cambia de firma ni de salida (S-4).
  #   - ESPERADOS A MANO: los textos de las reglas y de las líneas se escriben LITERALES en el test, NUNCA se
  #     importan de `src/lib/puerta-cascaron.ts` (anti-tautología: ver la cabecera de este fichero).
  #   - EL CABLEADO DE LA LISTA, SIN CÓDIGO MUERTO (revisión adversarial de la ronda 2; medido con el
  #     instrumentador de Stryker 9.6.1, mapa §10). Con `strict`, `ficheros` no se estrecha después de
  #     `if (hayCandidatos && ficheros === undefined) return …` (TS18048), y las dos salidas previsibles que
  #     compilan meten código muerto: «`hayCandidatos && ficheros !== undefined ? ficheros.listar() : []`,
  #     más un `if (hayCandidatos)` alrededor de las reglas» y «`hayCandidatos ? ficheros?.listar() ?? []
  #     : []`» dejan 3 mutantes EQUIVALENTES cada una, que con el 100 % y 0 exclusiones bloquean el cierre.
  #     La forma medida, sin ninguno:
  #       let ubicaciones = new Map<string, number>()
  #       if (hayCandidatos) {
  #         if (ficheros === undefined) return <el corte por lista ausente>
  #         if (<hay base declarada y no es utilizable>) return <el corte por la base>
  #         ubicaciones = new Map(ficheros.listar().map((f) => [f.ubicacion, f.bytes]))
  #       }
  #     y las reglas se evalúan SIEMPRE sobre los candidatos, sin `if (hayCandidatos)` alrededor.
  #     PROHIBIDOS sobre `ficheros` el `?.`, el `??` y el `!`, un `[]` literal como lista por defecto y
  #     volver a comprobar `ficheros !== undefined`.
  #   - CUATRO FORMAS DE ESCRIBIR LA SPEC QUE DEJAN UN MUTANTE VIVO (las tres primeras, de la ronda 2,
  #     EQUIVALENTES, medidas con `weapon-regex` 1.3.6 al nivel de Stryker 9.6.1, mapa §10; la cuarta, de
  #     la pasada final, revisor B, mapa §11). Se escriben de la otra forma desde el principio; si
  #     aparecen, se REFACTORIZAN, nunca se excluyen:
  #       · lo que se quita DENTRO del `href` (TAB, LF y CR), con una clase SIN el cuantificador `+`: con
  #         él y la bandera `g`, quitar el `+` no cambia nada;
  #       · el predicado de oculto, sobre TODOS los segmentos de `dist/<resto>` (o sobre `<resto>`), sin
  #         `slice(1)`: con él, quitarlo no cambia nada, porque `dist` nunca empieza por ".";
  #       · el "/" inicial que se quita sin base, con `slice(1)` y no con una regex anclada a `^`: quitar
  #         el `^` no cambia nada, porque todo candidato que llega ahí empieza por "/" (los que empiezan
  #         por barra invertida salen antes, por la 4);
  #       · la RUTA (el `href` limpio sin ?query ni #fragmento), con `rutaDelHref`
  #         (`src/lib/puerta-cascaron.ts:571-573`, el `split(/[?#]/)` de la anti-404 de `<a>`),
  #         REUTILIZADA, nunca con una regex `[?#].*` anclada a `$` (p. ej. `replace(/[?#].*$/, '')`):
  #         ninguna fila distingue su mutante «`$` quitado» [V: revisor B, Stryker 9.6.1: 179 mutantes,
  #         1 vivo], y la regex ni siquiera hace lo mismo: el `.` no cruza U+2028 ni U+2029, que la
  #         limpieza no quita, y con el `$` un `href` con U+2028 detrás del "?" se queda entero y daría
  #         la regla 2 de un fichero que está (spec, resolución, paso 2; re-medido en Node 22.15.0).
  #   - Nacen en ROJO con la puerta de hoy: toda fila que espera una línea nueva, todo ANCLA (el extractor
  #     nuevo aún no existe), todo «pidió la lista al menos 1 vez» y las filas 1-2 de @s59 (hoy, exit 0). Lo que
  #     esperan las demás filas `(ninguna)` ya se cumple hoy y se tiene que seguir cumpliendo: son los
  #     CONTROLES.

  @s46
  Scenario: CONTROL — una página con un <link> root-absoluto de cada clase que trae el artefacto real, todos con su fichero no vacío bajo la base, pasa la puerta
    Given la página correcta, que además trae en su <head>, en este orden, <link rel="icon" href="/NailsLashStudioWeb/favicon.ico" sizes="32x32">, <link rel="icon" href="/NailsLashStudioWeb/favicon.svg" type="image/svg+xml">, <link rel="apple-touch-icon" href="/NailsLashStudioWeb/apple-touch-icon.png">, <link rel="stylesheet" crossorigin href="/NailsLashStudioWeb/assets/app.css"> y <link rel="preload" as="font" type="font/woff2" crossorigin href="/NailsLashStudioWeb/assets/manrope.woff2">
    And la base declarada "/NailsLashStudioWeb/" y la lista de referencia, cuyo doble REGISTRA cada vez que la puerta la pide
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, exactamente 6 valores: "https://example.invalid/" y, en este orden, "/NailsLashStudioWeb/favicon.ico", "/NailsLashStudioWeb/favicon.svg", "/NailsLashStudioWeb/apple-touch-icon.png", "/NailsLashStudioWeb/assets/app.css" y "/NailsLashStudioWeb/assets/manrope.woff2"
    And el doble registra que la puerta pidió la lista de ficheros al menos 1 vez
    And el código de salida es 0
    And la lista de líneas del informe está vacía
    # EL CAMINO FELIZ DE LA ENMIENDA, y no es decorativo: sin él, una puerta que acusara TODO `<link>`
    # pasaría todos los escenarios negativos de aquí abajo y rompería el build para siempre. Es el control
    # en verde de las reglas 1, 2 y 3 a la vez. El artefacto real trae 11 `<link>`: 3 iconos, 1
    # `stylesheet`, 6 `preload` de fuente y la canónica absoluta (spec, inventario con la corrección 1 de la
    # verificación); aquí va UNO de cada clase, con nombres de fixture escritos a mano. El 2º `Then` ancla
    # que la puerta MIRÓ la lista: un «0 líneas» sin haberla pedido no es estar protegidos, es no mirar.

  @s47
  Scenario Outline: regla 1 — bajo una base declarada, un <link> root-absoluto SIN su prefijo falla cerrado, exista o no el fichero: "<href>"
    Given la página correcta, que además trae en su <head> <link rel="icon" href="<href>">
    And la base declarada "/NailsLashStudioWeb/" y la lista de referencia
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, el valor "<href>"
    And el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | href                            | codigo        | lineas                                                                              | por qué                                                                                                                                                                                                          |
      | /NailsLashStudioWeb/favicon.svg | 0             | (ninguna)                                                                           | CONTROL: con el prefijo y con su fichero (2244 B)                                                                                                                                                                |
      | /favicon.svg                    | distinto de 0 | / — link root-absoluto sin el prefijo de la base: "/favicon.svg"                    | LA FIRMA (a) DEL H-5, la que hornea Vite cuando falta el fichero. "dist/favicon.svg" SÍ está en la lista: la regla 1 habla del PREFIJO, no del fichero                                                           |
      | /no-existe.svg                  | distinto de 0 | / — link root-absoluto sin el prefijo de la base: "/no-existe.svg"                  | SOLO la 1, nunca además la 2: sin el prefijo, la puerta no busca ningún fichero                                                                                                                                  |
      | /vacio.svg                      | distinto de 0 | / — link root-absoluto sin el prefijo de la base: "/vacio.svg"                      | SOLO la 1, nunca la 3, aunque "dist/vacio.svg" tenga 0 B                                                                                                                                                         |
      | /NailsLashStudioWeb             | distinto de 0 | / — link root-absoluto sin el prefijo de la base: "/NailsLashStudioWeb"             | la base SIN su barra final: GitHub Pages la redirige con un 301 (medido), pero la puerta es estricta (caso límite 3)                                                                                             |
      | /nailslashstudioweb/favicon.svg | distinto de 0 | / — link root-absoluto sin el prefijo de la base: "/nailslashstudioweb/favicon.svg" | el prefijo se compara LITERAL y con su caja (caso límite 4)                                                                                                                                                      |
      | ⟨U+0020⟩/favicon.svg            | distinto de 0 | / — link root-absoluto sin el prefijo de la base: "⟨U+0020⟩/favicon.svg"            | limpio, es root-absoluto (caso límite 5); la línea lleva el valor CRUDO, con su espacio (S-6)                                                                                                                    |
      | /otra-cosa/x.css                | distinto de 0 | / — link root-absoluto sin el prefijo de la base: "/otra-cosa/x.css"                | LA ASIMETRÍA 1, DECLARADA: un <a href> así bajo base queda FUERA de esta puerta (@s37, que no cambia); un <link> así es la firma (a)                                                                             |
      | /                               | distinto de 0 | / — link root-absoluto sin el prefijo de la base: "/"                               | la raíz del DOMINIO bajo la base: "/" es root-absoluto (no tiene 2º carácter que sea "/") y pide FUERA del sitio. Mata un predicado de candidato que exija algo detrás de la barra inicial (ronda 2 de revisión) |
    # «Sin el prefijo de la base» dice SOLO lo que la puerta sabe: NUNCA «no existe» (corrección 12 de la
    # verificación). Por qué la asimetría con @s37 no es arbitraria: un `<a>` a la raíz del dominio puede
    # ser un hiperenlace legítimo a otro sitio (el Pages de la organización), pero Vite procesa el `href`
    # de TODO `<link>` y lo deja sin la base cuando falta el fichero (config.js:23280-23300 y
    # :23972-23978): en este stack, un `<link>` root-absoluto sin la base ES la firma (a). Quien de verdad
    # quiera apuntar fuera escribe una URL absoluta, y esa salida solo vale para los `rel` de hiperenlace
    # (`canonical`, `alternate`). Con un `rel` que F-05 trata como petición o contacto, token a token
    # (`KEYWORDS_DE_PETICION`: stylesheet, icon, preload, modulepreload, prefetch y manifest;
    # `KEYWORDS_DE_CONTACTO`: preconnect y dns-prefetch; `src/lib/terceros.ts:92-99` y :109), F-05 la
    # rechaza: su lista de permitidos es `[]` (`tools/puerta-terceros.ts:100`). Con cualquier OTRO `rel`
    # (`apple-touch-icon`, uno inventado) o sin `rel`, F-05 ni la mira, y una URL absoluta de un tercero ahí
    # no la ve NINGUNA de las dos puertas: hueco DECLARADO, la deuda de FS-6 (banner). Un
    # `<link vite-ignore href="/x">` bajo base cae aquí, en la regla 1: la puerta no lee ese atributo, y su
    # efecto es justo la firma (a).

  @s48
  Scenario Outline: regla 2 — con el prefijo, la ubicación que nombra la RUTA del href tiene que estar, LITERAL y con su caja, en la lista de ficheros; sus segmentos ".", ".." y vacíos no se normalizan: son la regla 4 (S-11): "<href>"
    Given la página correcta, que además trae en su <head> <link rel="stylesheet" href="<href>">
    And la base declarada "/NailsLashStudioWeb/" y la lista de referencia
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, el valor "<href>"
    And el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | href                                      | codigo        | lineas                                                                                                                                            | por qué                                                                                                                                                                                          |
      | /NailsLashStudioWeb/assets/app.css        | 0             | (ninguna)                                                                                                                                         | CONTROL: un fichero de una subcarpeta resuelve                                                                                                                                                   |
      | /NailsLashStudioWeb/favicon.svg?v=2       | 0             | (ninguna)                                                                                                                                         | CONTROL: la ?query se quita antes de buscar                                                                                                                                                      |
      | /NailsLashStudioWeb/favicon.svg#x         | 0             | (ninguna)                                                                                                                                         | CONTROL: el #fragmento también                                                                                                                                                                   |
      | /NailsLashStudioWeb/no-existe.svg         | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/no-existe.svg"                                                                  | LA FIRMA (b): con la base y sin fichero, un 404. La midió en un build real la ronda 1 de revisión, no F-28 (banner)                                                                              |
      | /NailsLashStudioWeb/FAVICON.SVG           | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/FAVICON.SVG"                                                                    | la caja cuenta: en GitHub Pages da 404 (medido con curl -I), y en Windows un existsSync lo daría por bueno (caso límite 4)                                                                       |
      | /NailsLashStudioWeb/assets                | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/assets"                                                                         | una CARPETA que existe no es un fichero (caso límite 2)                                                                                                                                          |
      | /NailsLashStudioWeb/./favicon.svg         | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/NailsLashStudioWeb/./favicon.svg"         | el navegador normaliza el segmento "." y GitHub Pages la sirve con 200 (medido): «sin fichero en dist/» sería FALSO. La 4, falso positivo CONSCIENTE como el "%" (S-11, caso límite 10)          |
      | /NailsLashStudioWeb/assets/../favicon.svg | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/NailsLashStudioWeb/assets/../favicon.svg" | ni el "..": Pages también la sirve con 200 (medido)                                                                                                                                              |
      | /NailsLashStudioWeb//favicon.svg          | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/NailsLashStudioWeb//favicon.svg"          | un segmento VACÍO ("//" dentro de la ruta): el navegador lo conserva y Pages también la sirve con 200 (medido)                                                                                   |
      | /./favicon.svg                            | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/./favicon.svg"                            | la 4 va ANTES que la 1: sin normalizar no empieza por la base, pero la puerta no dice «sin el prefijo» de una ruta que no interpreta                                                             |
      | /NailsLashStudioWeb/.../favicon.svg       | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/.../favicon.svg"                                                                | "..." no es "." ni "..": la ubicación no está en la lista, y es la 2 (Pages: 404, medido)                                                                                                        |
      | /NailsLashStudioWeb/favicon.svg?v=/../x   | 0             | (ninguna)                                                                                                                                         | CONTROL: los segmentos se miran en la RUTA; la ?query no cuenta, y el navegador no la toca (medido)                                                                                              |
      | /NailsLashStudioWeb/favicon.svg#/./x      | 0             | (ninguna)                                                                                                                                         | CONTROL: el #fragmento tampoco                                                                                                                                                                   |
      | /NailsLashStudioWeb/favicon.svg#//x       | 0             | (ninguna)                                                                                                                                         | CONTROL: ni el "//" del #fragmento                                                                                                                                                               |
      | /NailsLashStudioWeb/x/..                  | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/NailsLashStudioWeb/x/.."                  | el ÚLTIMO segmento también cuenta: el navegador pide la raíz, "/NailsLashStudioWeb/", que existe (medido), y la 2 sería FALSA. Mata mirar los segmentos sin el último (pasada final de revisión) |
      | /NailsLashStudioWeb/.                     | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/NailsLashStudioWeb/."                     | lo mismo con un "." al final: el navegador también pide la raíz (medido)                                                                                                                         |
    # Por qué una LISTA y nunca `existsSync`: en Windows el sistema de ficheros no distingue la caja y
    # escondería un 404 que GitHub Pages sí da (`/NailsLashStudioWeb/FAVICON.SVG` → 404, re-medido con
    # `curl -I` por la verificación el 2026-10-01). El porqué es la MEDIDA, no «Pages corre en Linux»
    # (corrección 8). La búsqueda es por igualdad EXACTA de cadenas sobre `dist/<resto>`.
    # LOS SEGMENTOS (S-11, caso límite 10; ronda 2 de revisión de la spec): el navegador normaliza "." y
    # ".." (https://url.spec.whatwg.org/#single-dot-path-segment y #double-dot-path-segment) y conserva el
    # "//", y GitHub Pages sirve las tres rutas de arriba con 200 y 2244 B (spec, `curl -s --path-as-is`,
    # 2026-10-01). Con la regla 2 la puerta diría «sin fichero en dist/» de un fichero que está y se sirve:
    # la acusación falsa que H5-4, S-2 y S-8 evitan. Por eso van a la 4, como el "%": un falso positivo
    # CONSCIENTE con un mensaje que dice solo lo que la puerta sabe (que no interpreta la ruta). Normalizar
    # iría contra S-1 y contra el criterio de Pablo para el "%" (H5-4). Se miran sobre la RUTA, sin ?query
    # ni #fragmento: mirarlos sobre el href entero rompe las tres filas de control con "/../", "/./" o "//"
    # detrás de "?" o "#"; compararlos con `startsWith(".")` y no por igualdad rompe la fila de "..." y
    # las cuatro de @s65 que no son el control [V: modelo de la spec, mapa §10].
    # EL ÚLTIMO SEGMENTO (pasada final de revisión; spec, resolución, paso 2, y caso límite 10): las dos
    # últimas filas son la 4, nunca la 2: el navegador lleva `/NailsLashStudioWeb/x/..` y
    # `/NailsLashStudioWeb/.` a la raíz, que existe, y `/NailsLashStudioWeb/..`, a "/" (`new URL` de Node
    # 22.15.0). Sin ellas, mirar los segmentos sin el último (`split('/').slice(0, -1)`), o con una regex
    # que cierre el segmento con «"/" o fin» a la que Stryker le quite el `$`, pasaba todo el contrato y
    # aquí daba la 2, la acusación falsa que S-11 evita. NO es un mutante equivalente: con 0 exclusiones
    # obligaría a reabrir el contrato en mitad del TDD [V: revisor B, re-medido en la pasada final, mapa
    # §11].

  @s49
  Scenario Outline: regla 3 — el fichero existe pero pesa 0 bytes: "<href>"
    Given la página correcta, que además trae en su <head> <link rel="icon" href="<href>">
    And la base declarada "/NailsLashStudioWeb/" y la lista de referencia
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, el valor "<href>"
    And el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | href                              | codigo        | lineas                                                                                       | por qué                                                                                                                                                                |
      | /NailsLashStudioWeb/uno.svg       | 0             | (ninguna)                                                                                    | CONTROL: 1 byte pasa. El umbral es DECLARADO arbitrario: un icono truncado a 1 B pasaría                                                                               |
      | /NailsLashStudioWeb/vacio.svg     | distinto de 0 | / — link root-absoluto a un fichero de 0 bytes en dist/: "/NailsLashStudioWeb/vacio.svg"     | LA FIRMA (c), un icono VACÍO (Pages sirve 0 B con 200): Vite le pone la base porque el fichero EXISTE (tryStatSync(…).isFile() es cierto con 0 B, config.js:8096-8104) |
      | /NailsLashStudioWeb/vacio.svg?v=2 | distinto de 0 | / — link root-absoluto a un fichero de 0 bytes en dist/: "/NailsLashStudioWeb/vacio.svg?v=2" | la ?query no cambia de fichero; la línea lleva el valor CRUDO                                                                                                          |
    # `.nojekyll` (0 B) no da falso positivo: el despliegue lo crea DESPUÉS de la puerta
    # (`deploy-pages.yml:74`) y nada lo enlaza; esta regla solo mira ficheros a los que apunta un `<link>`.
    # Y si uno lo enlazara, sería un fichero OCULTO: la regla 5, nunca la 3 (@s65).

  @s50
  Scenario Outline: regla 4 — un href con %, & o barra invertida, también AL PRINCIPIO, falla cerrado con su PROPIA regla, sin decodificar y antes que las otras cuatro: "<href>"
    Given la página correcta, que además trae en su <head> <link rel="icon" href="<href>">
    And la base declarada "/NailsLashStudioWeb/" y la lista de referencia
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, el valor "<href>"
    And el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | href                                        | codigo        | lineas                                                                                                                                              | por qué                                                                                                                                                                                                                                                               |
      | /NailsLashStudioWeb/favicon.svg?v=2#x       | 0             | (ninguna)                                                                                                                                           | CONTROL: "?" y "#" no son "%", "&" ni la barra invertida                                                                                                                                                                                                              |
      | /NailsLashStudioWeb/favicon%2Esvg           | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/NailsLashStudioWeb/favicon%2Esvg"           | FALSO POSITIVO CONSCIENTE (H5-4): GitHub Pages SÍ la sirve (200, medido) y "dist/favicon.svg" existe, pero la puerta no decodifica                                                                                                                                    |
      | /NailsLashStudioWeb/favicon.svg?a=1&amp;b=2 | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/NailsLashStudioWeb/favicon.svg?a=1&amp;b=2" | el "&" (jsdom.serialize() lo escribe "&amp;", medido) se busca en el href ENTERO, ?query incluida                                                                                                                                                                     |
      | /\cdn.ejemplo/x.css                         | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/\cdn.ejemplo/x.css"                         | el navegador lo lee como OTRO host, igual que "//" (WHATWG #relative-slash-state; medido con new URL de Node 22.15.0: host "cdn.ejemplo")                                                                                                                             |
      | /NailsLashStudioWeb\favicon.svg             | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/NailsLashStudioWeb\favicon.svg"             | en la ruta, el navegador la lee como "/" (medido, Node 22.15.0) y pediría el favicon que SÍ existe: falso positivo consciente, como el "%". Sin S-2 caería en la regla 1, una acusación falsa                                                                         |
      | /favicon%2Esvg                              | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/favicon%2Esvg"                              | SOLO la 4, nunca la 1: la 4 se mira PRIMERO                                                                                                                                                                                                                           |
      | /NailsLashStudioWeb/no%20existe.svg         | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "/NailsLashStudioWeb/no%20existe.svg"         | SOLO la 4, nunca la 2                                                                                                                                                                                                                                                 |
      | ⟨U+005C⟩favicon.svg                         | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "⟨U+005C⟩favicon.svg"                         | AL PRINCIPIO (S-7): no es relativo; el navegador lo pide como "/favicon.svg" del MISMO host (medido: new URL de Node 22.15.0), el 404 de la firma (a). Sin S-7 no sería candidato y saldría 0                                                                         |
      | ⟨U+005C⟩NailsLashStudioWeb/favicon.svg      | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "⟨U+005C⟩NailsLashStudioWeb/favicon.svg"      | el navegador pide "/NailsLashStudioWeb/favicon.svg", que existe: falso positivo CONSCIENTE, como el "%" (caso límite 17)                                                                                                                                              |
      | ⟨U+005C⟩⟨U+005C⟩cdn.ejemplo/x.css           | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "⟨U+005C⟩⟨U+005C⟩cdn.ejemplo/x.css"           | el navegador lo lee como OTRO host, "cdn.ejemplo" (medido), igual que "/⟨U+005C⟩cdn.ejemplo/x.css"                                                                                                                                                                    |
      | ⟨U+005C⟩/cdn.ejemplo/x.css                  | distinto de 0 | / — link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta: "⟨U+005C⟩/cdn.ejemplo/x.css"                  | barra invertida y luego "/", AL PRINCIPIO (punto 3 de la definición de la spec): el navegador lo lee como OTRO host, "cdn.ejemplo" (medido). Mata un candidato «compacto» que rechace la "/" detrás de la primera barra, sea cual sea esa barra (ronda 2 de revisión) |
    # Una sola regla para los tres caracteres (S-1): la misma causa, la puerta compara bytes y no
    # decodifica ni normaliza; el valor de la línea ya enseña el carácter. Una FILA por carácter, para que
    # quitar cualquiera de los tres de la regla rompa un test. La barra invertida cuenta en CUALQUIER
    # posición (S-2, [V]: https://url.spec.whatwg.org/#path-state y new URL de Node 22.15.0), también la
    # PRIMERA (S-7, https://url.spec.whatwg.org/#relative-state): un `href` limpio que EMPIEZA por ella es
    # candidato, y por eso la regla 4 lo acusa en vez de dejarlo fuera como un relativo. Sin esa rama,
    # las CUATRO filas del final saldrían con 0. La última, barra invertida y luego "/" (punto 3 de la
    # definición de la spec), la añadió la ronda 2 de revisión: un candidato «compacto», una sola regex que
    # acepte "/" o la barra invertida al principio y rechace una "/" detrás, pasaba todas las demás filas y
    # la dejaba FUERA, con 0 líneas, aunque el navegador la pida a otro host. El texto de la regla nombra
    # también "//" y los segmentos "." y ".." de la ruta (S-11): sus filas están en @s48. La única fuente
    # realista de "%" es un fichero de `public/` con "%" en el nombre (Vite decodifica el href antes de
    # buscarlo y al reescribirlo solo escapa "%" como "%25", config.js:2699-2711 y :24037-24038), y se
    # arregla renombrándolo. Hoy hay 0 "%", 0 "&" y 0 barras invertidas en los href de los `<link>` del
    # artefacto (verificación, pregunta 4; re-medido en la ronda 1 sobre un build real: 11 `<link>`,
    # ninguno con esos caracteres).

  @s51
  Scenario Outline: solo la RAÍZ del artefacto se resuelve a index.html, que se BUSCA en la lista como cualquier otro fichero; cualquier otro href acabado en / o que nombre una carpeta falla cerrado: "<href>"
    Given la página correcta, que además trae en su <head> <link rel="alternate" href="<href>">
    And la base <base> y <lista>, cuyo doble REGISTRA cada vez que la puerta la pide
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, el valor "<href>"
    And el doble registra que la puerta pidió la lista de ficheros al menos 1 vez
    And el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | base                             | lista                                                   | href                             | codigo        | lineas                                                                          | por qué                                                                                                                                                                                                                  |
      | declarada "/NailsLashStudioWeb/" | la lista de referencia                                  | /NailsLashStudioWeb/             | 0             | (ninguna)                                                                       | LA RAÍZ: el resto vacío va a "dist/index.html". Es lo único documentado («the entry file must be at the top level») y medido (/NailsLashStudioWeb/ → 200), y la misma URL que @s37 acepta en un <a> (caso límite 1)      |
      | ausente (sin base)               | la lista de referencia                                  | /                                | 0             | (ninguna)                                                                       | la raíz sin base (caso límite 1). "/" es candidato (no tiene 2º carácter que sea "/"): el 2º Then lo ancla                                                                                                               |
      | declarada "/NailsLashStudioWeb/" | la lista de referencia                                  | /NailsLashStudioWeb/x/index.html | 0             | (ninguna)                                                                       | CONTROL: el fichero nombrado ENTERO sí resuelve                                                                                                                                                                          |
      | declarada "/NailsLashStudioWeb/" | la lista de referencia                                  | /NailsLashStudioWeb/x/           | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/x/"           | acabado en "/" y NO es la raíz: falla cerrado AUNQUE "dist/x/index.html" exista. Que GitHub Pages sirva <carpeta>/index.html en subcarpetas no está documentado (28 artículos revisados) ni medido (H5-3, caso límite 2) |
      | ausente (sin base)               | la lista de referencia                                  | /x/                              | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/x/"                              | lo mismo sin base                                                                                                                                                                                                        |
      | declarada "/NailsLashStudioWeb/" | la lista de referencia                                  | /NailsLashStudioWeb/x            | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/x"            | una carpeta sin barra final. LA ASIMETRÍA 2, DECLARADA: en un <a>, con "dist/x/index.html", sería la ruta lógica "/x" y pasaría (@s38); en un <link>, la puerta mira FICHEROS                                            |
      | declarada "/NailsLashStudioWeb/" | la lista de referencia SIN "dist/index.html"            | /NailsLashStudioWeb/             | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/"             | la raíz se BUSCA en la lista (pasos 4 y 5 de la resolución): sin "dist/index.html", la 2. Mata «la raíz pasa sin mirar» (ronda 2 de revisión)                                                                            |
      | ausente (sin base)               | la lista de referencia SIN "dist/index.html"            | /                                | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/"                                | lo mismo sin base                                                                                                                                                                                                        |
      | declarada "/NailsLashStudioWeb/" | la lista de referencia con "dist/index.html" de 0 bytes | /NailsLashStudioWeb/             | distinto de 0 | / — link root-absoluto a un fichero de 0 bytes en dist/: "/NailsLashStudioWeb/" | y con 0 bytes, la 3: la spec promete un fichero NO VACÍO también en la raíz                                                                                                                                              |
    # Lo que el humano descartó (H5-3): «todo <carpeta>/ → <carpeta>/index.html», la del brief, que daría
    # por bueno en un `<link>` lo que la anti-404 de `<a>` ya marca como roto; y «todo href acabado en / es
    # violación», que contradiría a @s37. La asimetría 2 hoy es latente: `RUTAS_ESPERADAS = ['/']`.
    # LA RAÍZ SE BUSCA (pasos 4 y 5 de la resolución; ronda 2 de revisión): resto vacío → "dist/index.html",
    # y esa ubicación se busca en la lista como cualquier otra. Sin las tres filas de las listas variantes,
    # «la raíz pasa sin mirar» (`if (resto === '') return null`) pasaba el contrato entero y sus mutantes
    # morían todos: un 100 % de mutación incumpliendo la spec. En el artefacto real es latente (con
    # `RUTAS_ESPERADAS = ['/']`, un index.html ausente lo acusa @s26, y uno vacío, las reglas del head),
    # pero la spec promete un fichero NO VACÍO. El 2º `Then` ancla que "/" es candidato también SIN base:
    # sin él, un predicado de candidato que exigiera algo detrás de la barra inicial pasaba la fila 2.

  @s52
  Scenario Outline: antes de clasificarlo, el href se limpia como lo limpia el navegador, en los dos extremos y dentro, y la línea enseña el valor CRUDO: "<href>"
    Given la página correcta, que además trae en su <head> <link rel="icon" href="<href>">
    And la base declarada "/NailsLashStudioWeb/" y la lista de referencia, cuyo doble REGISTRA cada vez que la puerta la pide
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, el valor "<href>"
    And el doble registra que la puerta pidió la lista de ficheros al menos 1 vez
    And el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | href                                                                                      | codigo        | lineas                                                                                                                                   | por qué                                                                                                                                  |
      | ⟨U+0020⟩/NailsLashStudioWeb/favicon.svg⟨U+0020⟩                                           | 0             | (ninguna)                                                                                                                                | un espacio en cada extremo: jsdom 24.1.3 los conserva al serializar (medido) y el navegador los recorta                                  |
      | ⟨U+0020⟩⟨U+000C⟩/NailsLashStudioWeb/favicon.svg⟨U+000C⟩⟨U+0020⟩                           | 0             | (ninguna)                                                                                                                                | DOS por extremo: se recortan todos, no solo el primero                                                                                   |
      | ⟨U+0009⟩/NailsLashStudioWeb/favicon.svg                                                   | 0             | (ninguna)                                                                                                                                | tabulador en un extremo                                                                                                                  |
      | /NailsLashStudioWeb/favicon.svg⟨U+000A⟩                                                   | 0             | (ninguna)                                                                                                                                | salto de línea LF en un extremo                                                                                                          |
      | ⟨U+000C⟩/NailsLashStudioWeb/favicon.svg                                                   | 0             | (ninguna)                                                                                                                                | salto de página FF en un extremo                                                                                                         |
      | /NailsLashStudioWeb/favicon.svg⟨U+000D⟩                                                   | 0             | (ninguna)                                                                                                                                | retorno de carro CR en un extremo                                                                                                        |
      | /NailsLashStudioWeb/fav⟨U+0009⟩icon.svg                                                   | 0             | (ninguna)                                                                                                                                | un tabulador DENTRO también se quita                                                                                                     |
      | /NailsLashStudioWeb/fav⟨U+000A⟩icon.svg                                                   | 0             | (ninguna)                                                                                                                                | un LF dentro también                                                                                                                     |
      | /NailsLashStudioWeb/fav⟨U+000D⟩icon.svg                                                   | 0             | (ninguna)                                                                                                                                | un CR dentro también                                                                                                                     |
      | /NailsLashStudioWeb/favicon.svg⟨U+0020⟩⟨U+0009⟩⟨U+0020⟩⟨U+000A⟩⟨U+0020⟩⟨U+000D⟩⟨U+0020⟩   | 0             | (ninguna)                                                                                                                                | TAB, LF y CR ENTRE espacios, al final: también se RECORTAN, no solo se quitan; si solo se quitaran, quedarían tres espacios detrás       |
      | ⟨U+0020⟩/NailsLashStudioWeb/no-existe.svg                                                 | distinto de 0 | / — link root-absoluto sin fichero en dist/: "⟨U+0020⟩/NailsLashStudioWeb/no-existe.svg"                                                 | se limpia para DECIDIR; la línea lleva el valor CRUDO (S-6)                                                                              |
      | ⟨U+000C⟩/NailsLashStudioWeb/no-existe.svg                                                 | distinto de 0 | / — link root-absoluto sin fichero en dist/: "⟨U+000C⟩/NailsLashStudioWeb/no-existe.svg"                                                 | el FF del PRINCIPIO se recorta: si no, el href no empezaría por "/" y quedaría FUERA, sin línea (falla abierta)                          |
      | ⟨U+0020⟩⟨U+000C⟩/NailsLashStudioWeb/no-existe.svg                                         | distinto de 0 | / — link root-absoluto sin fichero en dist/: "⟨U+0020⟩⟨U+000C⟩/NailsLashStudioWeb/no-existe.svg"                                         | DOS al principio: recortar solo el primero lo dejaría fuera                                                                              |
      | ⟨U+0020⟩⟨U+0009⟩⟨U+0020⟩⟨U+000A⟩⟨U+0020⟩⟨U+000D⟩⟨U+0020⟩/NailsLashStudioWeb/no-existe.svg | distinto de 0 | / — link root-absoluto sin fichero en dist/: "⟨U+0020⟩⟨U+0009⟩⟨U+0020⟩⟨U+000A⟩⟨U+0020⟩⟨U+000D⟩⟨U+0020⟩/NailsLashStudioWeb/no-existe.svg" | TAB, LF y CR ENTRE espacios, al principio: también se RECORTAN; si solo se quitaran, quedarían tres espacios delante y lo dejarían fuera |
      | /NailsLashStudioWeb/fav⟨U+0020⟩icon.svg                                                   | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/fav⟨U+0020⟩icon.svg"                                                   | un espacio DENTRO no se quita: el navegador pide ".../fav%20icon.svg" (medido, Node 22.15.0)                                             |
      | /NailsLashStudioWeb/fav⟨U+000C⟩icon.svg                                                   | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/fav⟨U+000C⟩icon.svg"                                                   | un FF DENTRO tampoco: solo se recorta en los extremos (el navegador pide ".../fav%0Cicon.svg", medido)                                   |
    # LA LIMPIEZA (H5-2; spec, «Definición de root-absoluto», punto 1): se recortan de los extremos los
    # espacios ASCII (U+0009, U+000A, U+000C, U+000D y U+0020) y se quitan TODOS los tabuladores y saltos de
    # línea (U+0009, U+000A y U+000D), como el navegador (https://url.spec.whatwg.org/#concept-basic-url-parser).
    # Sin ella, " /favicon.svg" pasaría por relativo: un falso negativo.
    # POR QUÉ CADA FILA VE ALGO (ronda 1 de revisión). Un fallo del recorte del PRINCIPIO deja el `href` sin
    # su "/" inicial, FUERA de la puerta, y da «(ninguna)», lo mismo que si hubiera funcionado. Por eso el
    # 2º `Then` (la lista solo se pide con algún candidato) y las filas que esperan una línea con el
    # carácter al principio. Medido sobre un modelo de la spec montado en el código de hoy, con estas filas
    # (mapa del Gherkin, «Revisión adversarial»): dejar de recortar cualquiera de los cinco caracteres en
    # cualquiera de los dos extremos, o recortar solo uno por extremo, rompe al menos una fila, y lo hace
    # también SOLO por sus líneas; y los mutantes de nivel 1 de la regex del recorte (los que genera Stryker
    # 9.6.1) mueren todos, en las tres formas previsibles de escribirla. TAB, LF y CR solo cuentan en la
    # clase del recorte si se recorta ANTES de quitar (el orden de WHATWG); quitándolos antes, recortar
    # solo FF y espacio da el mismo resultado, y ahí esos tres sobran en la clase. Lo que se quita DENTRO,
    # con una clase SIN el cuantificador `+`: con él, quitarlo es un mutante EQUIVALENTE (ronda 2 de
    # revisión, medido; ver PARA EL `tdd_craftsman`). Lo que la puerta NO recorta (otros controles C0,
    # U+000B incluido) es un hueco DECLARADO por la spec y ningún escenario lo fija.

  @s53
  Scenario Outline: lo que NO es root-absoluto no es de esta puerta, y ni siquiera pide la lista de ficheros: <elemento>
    Given la página correcta, que además trae en su <head> el elemento <elemento>
    And la base declarada "/NailsLashStudioWeb/" y una petición que NO trae la lista de ficheros
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, exactamente: <extraidos>
    And el código de salida es 0
    And la lista de líneas del informe está vacía

    Examples:
      | elemento                                                     | extraidos                                                    | por qué                                                                                                                                                                                   |
      | <link rel="stylesheet" href="//cdn.ejemplo/x.css">           | "https://example.invalid/" y "//cdn.ejemplo/x.css"           | "//" es OTRO host (https://url.spec.whatwg.org/#scheme-relative-url-string): con un rel de petición o contacto, como este, es de F-05 (caso límite 6)                                     |
      | <link rel="stylesheet" href="https://example.invalid/x.css"> | "https://example.invalid/" y "https://example.invalid/x.css" | URL absoluta: fuera. Las propias no se resuelven contra el artefacto; las de terceros son de F-05 solo con un rel de petición o contacto, como este (con otro rel, hueco DECLARADO: FS-6) |
      | <link rel="icon" href="favicon.svg">                         | "https://example.invalid/" y "favicon.svg"                   | relativa: hueco DECLARADO (hoy ningún <link> del artefacto lo es). Una que EMPIEZA por barra invertida no es relativa: @s50 (S-7)                                                         |
      | <link rel="stylesheet" href="./x.css">                       | "https://example.invalid/" y "./x.css"                       | relativa                                                                                                                                                                                  |
      | <link rel="stylesheet" href="../x.css">                      | "https://example.invalid/" y "../x.css"                      | relativa                                                                                                                                                                                  |
      | <link rel="icon" href="">                                    | "https://example.invalid/" y ""                              | vacío: no es root-absoluto, pero SÍ cuenta para la guarda (@s59)                                                                                                                          |
      | <link rel="icon">                                            | solo "https://example.invalid/"                              | sin href: ni se clasifica ni cuenta                                                                                                                                                       |
    # Sin la lista de ficheros A PROPÓSITO: si alguno de estos se tomara por root-absoluto, la puerta
    # cortaría con la línea de la lista ausente (@s57) en vez de salir con 0. La fila de "//" mata el
    # criterio que aceptara "//" como root-absoluto (el de `RUTA_INTERNA`, :561, lo excluye).

  @s54
  Scenario Outline: sin base declarada la ruta entera se resuelve y la regla 1 no aplica nunca; una base sin barra final CORTA con la línea de la base (S-12), nunca da la regla 2: "<href>"
    Given la página correcta, que además trae en su <head> <link rel="icon" href="<href>">
    And la base <base> y la lista de referencia
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, el valor "<href>"
    And el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | base                                              | href                            | codigo        | lineas                                                                                                                              | por qué                                                                                                                                                                                                                                                                                                                                                                      |
      | ausente (campo ausente)                           | /favicon.svg                    | 0             | (ninguna)                                                                                                                           | CONTROL: sin base, "/favicon.svg" va a "dist/favicon.svg" (2244 B)                                                                                                                                                                                                                                                                                                           |
      | ausente (campo ausente)                           | /no-existe.svg                  | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/no-existe.svg"                                                                       | la 2 y NUNCA la 1: sin base no hay prefijo que exigir (caso límite 12)                                                                                                                                                                                                                                                                                                       |
      | ausente (campo a null)                            | /no-existe.svg                  | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/no-existe.svg"                                                                       | null significa lo mismo que el campo ausente (precedente `base?`)                                                                                                                                                                                                                                                                                                            |
      | ausente (campo ausente)                           | /vacio.svg                      | distinto de 0 | / — link root-absoluto a un fichero de 0 bytes en dist/: "/vacio.svg"                                                               | la 3 también sin base                                                                                                                                                                                                                                                                                                                                                        |
      | ausente (campo ausente)                           | /NailsLashStudioWeb/favicon.svg | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/favicon.svg"                                                      | sin base, el prefijo es una carpeta más: "dist/NailsLashStudioWeb/favicon.svg" no está                                                                                                                                                                                                                                                                                       |
      | declarada "/NailsLashStudioWeb" (sin barra final) | /NailsLashStudioWeb/favicon.svg | distinto de 0 | la base declarada no es una ruta root-absoluta acabada en / y hay elementos link root-absolutos que resolver: "/NailsLashStudioWeb" | NADIE valida la barra final de la base: F-05 solo exige "/" inicial y no "//" (esRutaPropiaRootAbsoluta, src/lib/puerta-terceros.ts:213-215), y @s27 de cero_terceros.feature no tiene ninguna fila sin ella. Con algún candidato, la puerta CORTA con la línea de la base (S-12, caso límite 16): la regla 2 acusaría a un fichero que está, por buscar "dist//favicon.svg" |
    # S-12 (spec, «La base: utilizable, o la puerta corta»): quitar el prefijo de la base solo tiene
    # sentido con una base que empieza por "/", no por "//", y acaba en "/". Sin base (campo ausente o
    # null) no se mira nada. Las demás bases no utilizables, el control "/" y el caso sin candidatos: @s68.

  @s55
  Scenario Outline: la puerta resuelve el href de TODO <link>, sea cual sea su rel, la caja de la etiqueta o su sitio en el documento: <elemento> en el <sitio>
    Given la página correcta, que además trae en su <sitio> el elemento <elemento>
    And la base declarada "/NailsLashStudioWeb/" y la lista de referencia
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, el valor "/NailsLashStudioWeb/no-existe"
    And (ANCLA DE SITIO) en el texto de esa página, "/NailsLashStudioWeb/no-existe" aparece <posicion> del único "</head>", medido A MANO sobre el texto, nunca con cabezaDe
    And el código de salida es distinto de 0
    And las líneas del informe son exactamente: / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/no-existe"

    Examples:
      | sitio  | posicion | elemento                                                                  | por qué                                                                                                                          |
      | <head> | ANTES    | <link rel="icon" href="/NailsLashStudioWeb/no-existe">                    | icono, como los de F-28                                                                                                          |
      | <head> | ANTES    | <link rel="apple-touch-icon" href="/NailsLashStudioWeb/no-existe">        | F-05 ni siquiera lo trata como petición: aquí sí se resuelve                                                                     |
      | <head> | ANTES    | <link rel="stylesheet" href="/NailsLashStudioWeb/no-existe">              | hoja de estilo                                                                                                                   |
      | <head> | ANTES    | <link rel="preload" as="font" href="/NailsLashStudioWeb/no-existe">       | precarga                                                                                                                         |
      | <head> | ANTES    | <link rel="modulepreload" href="/NailsLashStudioWeb/no-existe">           | precarga de módulo                                                                                                               |
      | <head> | ANTES    | <link rel="manifest" href="/NailsLashStudioWeb/no-existe">                | manifiesto                                                                                                                       |
      | <head> | ANTES    | <link rel="alternate" hreflang="en" href="/NailsLashStudioWeb/no-existe"> | rel de hiperenlace; "hreflang" va ANTES y no confunde al extractor                                                               |
      | <head> | ANTES    | <link rel="canonical" href="/NailsLashStudioWeb/no-existe">               | una SEGUNDA canónica, root-absoluta: rel de hiperenlace, se resuelve igual (para apuntar fuera, URL absoluta: asimetría 1, @s47) |
      | <head> | ANTES    | <link rel="x-nls-inventado" href="/NailsLashStudioWeb/no-existe">         | un rel que no existe                                                                                                             |
      | <head> | ANTES    | <link href="/NailsLashStudioWeb/no-existe">                               | sin rel                                                                                                                          |
      | <head> | ANTES    | <LINK REL="icon" HREF="/NailsLashStudioWeb/no-existe">                    | en mayúsculas: el extractor de la canónica no distingue la caja (ENLACE y ATRIBUTO_HREF llevan la bandera i, :72-74)             |
      | <body> | DESPUÉS  | <link rel="stylesheet" href="/NailsLashStudioWeb/no-existe">              | se lee el documento ENTERO, nunca solo cabezaDe (caso límite 14)                                                                 |
    # H5-2: Vite procesa el `href` de TODO `<link>` sin mirar su `rel` (config.js:23280-23300), así que
    # filtrar por `rel` no baja el riesgo y obligaría a tokenizarlo (más código, más mutantes). Lo
    # descartado: «solo iconos» y «todos los subrecursos». En la fila de la segunda canónica, la primera
    # (la absoluta de la página correcta) sigue siendo la que lee la regla «canónica ausente».
    # EL ANCLA DE SITIO (ronda 2 de revisión): la fila <body> es el ÚNICO testigo del caso límite 14, y el
    # ANCLA del extractor no distingue dónde está el `<link>` (mira la página entera). Sin el 2º `Then`, un
    # ayudante que ignorase la columna `sitio` lo pondría en el <head>, y una puerta que leyera solo
    # `cabezaDe` pasaría el contrato entero. Se mide A MANO sobre el texto (la página correcta trae un solo
    # "</head>" y el href solo aparece en el `<link>` de la fila), nunca con `cabezaDe`. Precedente: @s32
    # ancla que el <title> está en el <body> (`src/lib/trampas-del-horneado.test.tsx:289-295`). Y es
    # realista: con la metadata nativa de React 19, los `<link>` salen en el <body> (@s32, react19-nativa).

  @s56
  Scenario: el informe — primero las líneas de hoy, después una línea por <link> roto, en el orden de las páginas y, dentro de cada una, en el de aparición, con la ruta de la página que lo trae
    Given la base declarada "/NailsLashStudioWeb/" y la lista de referencia
    And un artefacto cuyo listado de HTML devuelve, EN ESTE ORDEN, "dist/servicios/index.html" y "dist/index.html"
    And en "dist/servicios/index.html" (ruta "/servicios"), la página correcta con la canónica "https://example.invalid/servicios" y un único <link> root-absoluto: <link rel="icon" href="/NailsLashStudioWeb/vacio.svg">
    And en "dist/index.html" (ruta "/"), la página correcta SIN su <title> y con, en este orden, <link rel="icon" href="/favicon.svg">, <link rel="icon" href="/NailsLashStudioWeb/favicon.svg">, <link rel="icon" href="/favicon.svg"> y <link rel="stylesheet" href="/NailsLashStudioWeb/no-existe.css">
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/", "/servicios"]
    Then el código de salida es distinto de 0
    And las líneas del informe son exactamente estas 5, en este orden:
      | / — title ausente o vacío: ""                                                                     |
      | /servicios — link root-absoluto a un fichero de 0 bytes en dist/: "/NailsLashStudioWeb/vacio.svg" |
      | / — link root-absoluto sin el prefijo de la base: "/favicon.svg"                                  |
      | / — link root-absoluto sin el prefijo de la base: "/favicon.svg"                                  |
      | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/no-existe.css"                  |
    # Spec, «Formato»: primero las violaciones de hoy, en su orden; detrás, las de los `<link>`, por el
    # orden de las páginas que da el listado y, dentro de cada una, por orden de aparición. La 1ª línea
    # (el title de "/") va ANTES que la de "/servicios" aunque "/servicios" se liste primero: así se ve que
    # las de hoy van todas delante. "/servicios" va antes que "/" entre las de `<link>` porque el listado
    # la da primero: un orden alfabético o invertido no casaría. El mismo href en dos `<link>` da DOS
    # líneas; el `<link>` válido de en medio no da ninguna. La ruta es la LÓGICA de la página
    # (`rutaDelFichero`): "/servicios", nunca "dist/servicios/index.html" (caso límite 15). Las canónicas
    # son distintas a propósito: si no, sobraría la línea «canónica repetida entre rutas distintas».

  @s57
  Scenario Outline: sin la lista de ficheros, la puerta CORTA con una sola línea si hay algún <link> root-absoluto que resolver; si no hay ninguno, hace lo de hoy, salvo la guarda nueva (@s59, fila 2)
    Given en "dist/index.html", <pagina>
    And la base declarada "/NailsLashStudioWeb/" y una petición que NO trae la lista de ficheros
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, exactamente: <extraidos>
    And el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | pagina                                                                                           | extraidos                                                      | codigo        | lineas                                                                                                   | por qué                                                                                                                                                                                                                                                                                       |
      | la página correcta con <link rel="icon" href="/NailsLashStudioWeb/favicon.svg">                  | "https://example.invalid/" y "/NailsLashStudioWeb/favicon.svg" | distinto de 0 | la puerta no recibió la lista de ficheros del artefacto y hay elementos link root-absolutos que resolver | un fallo de CABLEADO, no del sitio (S-3; precedente @s27)                                                                                                                                                                                                                                     |
      | la página correcta SIN su <title> y con <link rel="icon" href="/NailsLashStudioWeb/favicon.svg"> | "https://example.invalid/" y "/NailsLashStudioWeb/favicon.svg" | distinto de 0 | la puerta no recibió la lista de ficheros del artefacto y hay elementos link root-absolutos que resolver | y NO evalúa nada más, ni el title que falta: un informe parcial parecería completo (S-3)                                                                                                                                                                                                      |
      | la página correcta con <link rel="icon" href="/favicon.svg">                                     | "https://example.invalid/" y "/favicon.svg"                    | distinto de 0 | la puerta no recibió la lista de ficheros del artefacto y hay elementos link root-absolutos que resolver | el corte va ANTES de toda regla, también de la 1, que no necesitaría la lista                                                                                                                                                                                                                 |
      | la página correcta, sin ningún <link> root-absoluto                                              | solo "https://example.invalid/"                                | 0             | (ninguna)                                                                                                | lo de hoy: el caso de las 4 llamadas de puerta-cascaron.test.ts que esperan 0 (:936, :983, :1007 y :1730), con la canónica con href, que no cambian. La de F-06 NO es este caso (la protege @s59 fila 4). La ÚNICA excepción, la canónica sin href, es @s59 fila 2                            |
      | la página correcta SIN su <title>, sin ningún <link> root-absoluto                               | solo "https://example.invalid/"                                | distinto de 0 | / — title ausente o vacío: ""                                                                            | lo de hoy también cuando hay violaciones, que devuelven antes que cualquier guarda. NO es la de F-06 (puerta-anclas.test.ts:432-435: <head></head>, 0 <link> y 6 violaciones): esta lleva la canónica con href, y la fila que protege su veredicto, sin ningún href de <link>, es @s59 fila 4 |
      | la página correcta con <link rel="icon" href="⟨U+005C⟩favicon.svg">                              | "https://example.invalid/" y "⟨U+005C⟩favicon.svg"             | distinto de 0 | la puerta no recibió la lista de ficheros del artefacto y hay elementos link root-absolutos que resolver | una barra invertida AL PRINCIPIO también es candidato (S-7, caso límite 17): sin la lista, corta                                                                                                                                                                                              |
      | la página correcta con <link rel="icon" href="⟨U+005C⟩/cdn.ejemplo/x.css">                       | "https://example.invalid/" y "⟨U+005C⟩/cdn.ejemplo/x.css"      | distinto de 0 | la puerta no recibió la lista de ficheros del artefacto y hay elementos link root-absolutos que resolver | la gemela de la última fila de @s50: barra invertida y luego "/", AL PRINCIPIO, también es candidato (S-7, punto 3 de la definición): sin la lista, corta                                                                                                                                     |
    # H5-5: la lista entra como campo OPCIONAL (precedente `base?`, :756) para que ni las llamadas de hoy
    # ni la de F-06 cambien; «opcional = verde por vacuidad» es falso porque su ausencia falla CERRADA en
    # cuanto hay algo que resolver. Un campo obligatorio habría roto `tsc` (corre dentro de `lint`) en esas
    # 12 llamadas. «Lo de hoy, salvo la guarda»: la guarda nueva no depende de la lista, y una página cuya
    # canónica no lleva `href` entre comillas dobles, sin ningún otro `href` de `<link>`, hoy sale con 0 y
    # con la enmienda no (@s59 fila 2; el cambio de veredicto DECLARADO del banner). Con varias páginas,
    # basta un candidato en UNA para cortar: @s66. Con una base no utilizable y sin la lista, sale SOLO
    # esta línea: @s69.
    # LAS LLAMADAS DE HOY (ronda 2 de revisión; spec, «Ausente, sin ninguno»): ninguna trae un `<link>`
    # root-absoluto ni cambia de veredicto, pero no todas son la fila 4. Las 11 de `puerta-cascaron.test.ts`
    # son 13 ejecuciones: 10 con página, todas con la canónica con `href` (la de `htmlCrudo` por defecto,
    # :79 y :90, o una absoluta explícita), de las que 4 esperan 0 (las de la fila 4); 3 sin página
    # (@s26, :866-873, dos filas; @s29, :955), que no llegan a la guarda. La de F-06 tiene `<head></head>`
    # y 0 `<link>`, y sale con 6 violaciones, que devuelven antes que cualquier guarda. No es la fila 4, y
    # en rigor tampoco la 5, que lleva la canónica con `href`: una guarda nueva puesta por error ANTES de
    # las violaciones también pasaría la fila 5. La que protege su veredicto (una página SIN ningún `href`
    # de `<link>` y con violaciones: solo hablan ellas) es @s59 fila 4 [V: mapa §11]. Acoplamiento
    # DECLARADO en el banner: quien le quite las violaciones le da una canónica con `href` absoluto, o le
    # pasa a la puerta una lista en la que resuelva; con un `href` root-absoluto y sin lista, la puerta
    # sale por el corte de S-3 (filas 1-3), no con 0.

  @s58
  Scenario Outline: la lista de ficheros se pide SOLO si hay algún <link> root-absoluto que resolver, y si al pedirla revienta, la puerta falla cerrada por la rama de @s29
    Given <artefacto>
    And la base declarada "/NailsLashStudioWeb/" y una lista de ficheros cuyo método LANZA un Error con el mensaje "EACCES: lista de prueba"
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | artefacto                                                                                              | codigo        | lineas                                                                          | por qué                                                                                                                        |
      | un "dist/index.html" con la página correcta y <link rel="icon" href="/NailsLashStudioWeb/favicon.svg"> | distinto de 0 | la puerta del cascarón no pudo completar la inspección: EACCES: lista de prueba | la rama de @s29, con su línea de hoy y la causa CONCRETA                                                                       |
      | un "dist/index.html" con la página correcta, sin ningún <link> root-absoluto                           | 0             | (ninguna)                                                                       | sin nada que resolver la lista NO se pide: el doble que lanza no llega a lanzar                                                |
      | un dist/ que NO existe (el doble de @s26: existe() da false y el listado de HTML lanza)                | distinto de 0 | / — ruta esperada sin HTML en dist/: ""                                         | la lista es un MÉTODO y no un valor: con dist/ ausente no se pide, y la línea de @s26 no se pierde (con el humilde real: @s70) |
    # Spec, «El puerto nuevo»: es un método porque el humilde no puede listar antes de que la puerta pregunte
    # `existe()`: con `dist/` ausente, `readdirSync` lanzaría FUERA de la puerta y se perdería la línea de
    # @s26. Aquí se prueba con dobles; que el humilde REAL liste tarde lo atestigua @s70, extremo a extremo
    # (ronda 2 de revisión: un humilde ANSIOSO pasaba todo el contrato, también el «H-3 caso»). Nunca lee el
    # contenido de los ficheros (A-27: un binario leído como texto se decodifica a U+FFFD). Con varias
    # páginas, basta un candidato en CUALQUIERA de ellas para pedirla: @s66. Con una base declarada no
    # utilizable tampoco se pide: @s68.

  @s59
  Scenario Outline: la guarda del extractor nuevo — si en TODO el artefacto no sale ni un href de <link>, la puerta falla cerrada con su línea; la canónica cuenta, y cualquier href también
    Given un artefacto con <artefacto>
    And la base declarada "/NailsLashStudioWeb/" y la lista de referencia <lista>
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas <rutas>
    Then el extractor de href de <link> devuelve, del artefacto entero, exactamente: <extraidos>
    And el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | artefacto                                                                                          | lista    | rutas               | extraidos                                                 | codigo        | lineas                                                                                              | por qué                                                                                                                                                                       |
      | "dist/index.html" = la página correcta con <link rel="canonical"> SIN href en lugar de su canónica | PRESENTE | ["/"]               | nada                                                      | distinto de 0 | no se inspeccionó ningún elemento link del artefacto: el extractor de href de link no encontró nada | EL FIXTURE QUE MATA LA GUARDA, y FIJA el alcance de @s13 (S-9): la canónica sin href da "" y cuenta como PRESENTE, así que no salta «canónica ausente» y solo habla la guarda |
      | lo mismo                                                                                           | AUSENTE  | ["/"]               | nada                                                      | distinto de 0 | no se inspeccionó ningún elemento link del artefacto: el extractor de href de link no encontró nada | la guarda vigila el EXTRACTOR y no depende de la lista. Hoy este artefacto sale con 0: es el cambio de veredicto DECLARADO del banner, la excepción de @s57                   |
      | lo mismo, y SIN ningún <a href>                                                                    | PRESENTE | ["/"]               | nada                                                      | distinto de 0 | no se inspeccionó ningún enlace del artefacto: el extractor de href no encontró nada                | la guarda de @s28 va ANTES y habla SOLA                                                                                                                                       |
      | lo mismo, y SIN su <title>                                                                         | PRESENTE | ["/"]               | nada                                                      | distinto de 0 | / — title ausente o vacío: ""                                                                       | con violaciones, la guarda no corre                                                                                                                                           |
      | "dist/index.html" = la página correcta, tal cual                                                   | PRESENTE | ["/"]               | "https://example.invalid/"                                | 0             | (ninguna)                                                                                           | CONTROL: la canónica CUENTA. Es el caso del experimento head-correcto de @s33, cuyo único <link> es la canónica absoluta y exige exit 0                                       |
      | "dist/index.html" = la de la 1ª fila, más <link rel="stylesheet" href="">                          | PRESENTE | ["/"]               | ""                                                        | 0             | (ninguna)                                                                                           | CONTROL: un href VACÍO cuenta                                                                                                                                                 |
      | "dist/index.html" = la de la 1ª fila, más <link rel="icon" href="favicon.svg">                     | PRESENTE | ["/"]               | "favicon.svg"                                             | 0             | (ninguna)                                                                                           | CONTROL: un href RELATIVO cuenta. Se vigila el extractor, no que haya root-absolutos: tener 0 es LEGÍTIMO                                                                     |
      | "dist/index.html" = la página correcta, tal cual, y "dist/servicios/index.html" = la de la 1ª fila | PRESENTE | ["/", "/servicios"] | "https://example.invalid/" de "/", y nada de "/servicios" | 0             | (ninguna)                                                                                           | CONTROL: se cuenta en TODO el artefacto; basta UNA página con un href, no hace falta en cada una                                                                              |
    # Molde de @s28 (spec, «Guarda anti-vacuidad del extractor nuevo»): lo vigilado es el EXTRACTOR, no el
    # sitio. Cuenta TODOS los href que devuelve el MISMO extractor de las reglas, de cualquier forma y
    # `rel`, canónica incluida; va DESPUÉS de la guarda de @s28 y solo corre si no hubo violaciones. Por qué
    # no cuenta solo los root-absolutos: que haya 0 es un estado legítimo (el control head-correcto de
    # @s33 corre la puerta REAL sobre una app sin ninguno, `src/lib/trampas-del-horneado.test.tsx:393-399`).
    # La 1ª fila es la que la mutación necesita: `canonicaDeLaPagina` devuelve "" con un `<link
    # rel="canonical">` sin href (`atributoDeEtiqueta`, :387-401). La última, con `.some()` y no `.every()`,
    # por la misma razón que @s28.
    # QUÉ NO CERTIFICA (spec, «Guarda»): solo un fallo TOTAL de `ENLACE` + `ATRIBUTO_HREF`. En el artefacto
    # real la canónica absoluta es el PRIMER `<link>` de 11 y la satisface ella sola [V: build real]: que se
    # resolviera algún root-absoluto lo prueban @s61 y @s62, no la guarda.
    # SU ACOPLAMIENTO CON @s13 (S-9), DECLARADO: la 1ª fila existe porque una canónica sin href cuenta como
    # presente. Si @s13 pasara a acusar la canónica «ausente o vacía», la guarda quedaría inalcanzable,
    # esta fila se contradiría y sus mutantes (`.some` → `.every`, `> 0` → `>= 0`) serían equivalentes:
    # quien lo haga vuelve con la guarda a la puerta humana (otro fixture que la mate, o retirarla), y NUNCA
    # excluye sus mutantes. Con el código de hoy solo habla en artefactos de UNA página: con dos o más, todas
    # con la canónica vacía, habla antes «canónica repetida entre rutas distintas» (:643-668).

  @s60
  Scenario: las cinco reglas nuevas están en REGLAS_DEL_CASCARON, la lista que vigila @s34, y ninguna habla del origen ni de placeholders
    Given la lista "REGLAS_DEL_CASCARON" de la puerta del cascarón, la que vigila @s34
    When se busca en ella cada uno de los cinco textos de las reglas nuevas, escritos a mano
    Then (ANCLA) la lista sigue conteniendo "title ausente o vacío" y "href interno sin fichero en dist/"
    And contiene exactamente 1 vez cada uno de estos cinco: "link root-absoluto sin el prefijo de la base", "link root-absoluto sin fichero en dist/", "link root-absoluto a un fichero de 0 bytes en dist/", "link root-absoluto con %, &, barra invertida, // o segmentos . o .., que la puerta no interpreta" y "link root-absoluto a un fichero oculto, que el despliegue no publica"
    And ninguna regla de la lista contiene "origen" ni "placeholder"
    # La 3ª aserción ya la hace @s34 sobre la lista ENTERA (`src/lib/seo.test.ts:355-356`); lo nuevo es
    # que las cinco ESTÉN, porque una regla que faltara escaparía a @s34 en silencio. El texto de la 4 es el
    # de la ronda 2 de revisión de la spec (S-11: nombra también "//" y los segmentos "." y ".."). Esa lista
    # NO es la de «TODAS las reglas», aunque su comentario lo diga (`src/lib/puerta-cascaron.ts:857`): hoy
    # le falta «ruta esperada sin HTML en dist/» (`REGLA_RUTA_AUSENTE`, :670), que la puerta sí emite
    # (@s26; aquí, @s58 fila 3 y @s70) [V: sobre una copia literal del fichero, 22 entradas e
    # `includes(REGLA_RUTA_AUSENTE)` da false]. Hueco DECLARADO que esta enmienda no cierra (la regla es de
    # @s26, ajena a H-5; la spec lo dice ya, «Las cinco reglas nuevas»): hoy no esconde nada, porque ese
    # texto no contiene «origen» ni «placeholder». Las tres líneas que no son reglas (los dos cortes y la
    # guarda) no entran en ella, igual que las de @s27 y @s28.

  @s65
  Scenario Outline: regla 5 — un <link> a un fichero OCULTO (algún segmento de su ubicación empieza por ".") falla cerrado aunque esté en la lista y pese más de 0, porque el despliegue no lo publica: "<href>"
    Given la página correcta, que además trae en su <head> <link rel="icon" href="<href>">
    And la base declarada "/NailsLashStudioWeb/" y la lista de referencia
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, el valor "<href>"
    And el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | href                                     | codigo        | lineas                                                                                                              | por qué                                                                                                                                                                                                              |
      | /NailsLashStudioWeb/favicon.svg          | 0             | (ninguna)                                                                                                           | CONTROL: un punto que NO abre un segmento ("favicon.svg") no oculta nada                                                                                                                                             |
      | /NailsLashStudioWeb/.vite/manifest.json  | distinto de 0 | / — link root-absoluto a un fichero oculto, que el despliegue no publica: "/NailsLashStudioWeb/.vite/manifest.json" | una CARPETA oculta: "dist/.vite/manifest.json" ESTÁ en la lista, como en el dist/ real, pero GitHub Pages da 404 (medido con curl -I)                                                                                |
      | /NailsLashStudioWeb/assets/.oculto.css   | distinto de 0 | / — link root-absoluto a un fichero oculto, que el despliegue no publica: "/NailsLashStudioWeb/assets/.oculto.css"  | un fichero oculto en una carpeta VISIBLE: se mira CADA segmento, no solo el primero ni solo el último                                                                                                                |
      | /NailsLashStudioWeb/.oculto-vacio.svg    | distinto de 0 | / — link root-absoluto a un fichero oculto, que el despliegue no publica: "/NailsLashStudioWeb/.oculto-vacio.svg"   | oculto y de 0 B: la 5, NUNCA la 3 (la 5 se mira antes)                                                                                                                                                               |
      | /NailsLashStudioWeb/.vite/no-existe.json | distinto de 0 | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/.vite/no-existe.json"                             | NO está en la lista: la 2. La 5 solo mira ubicaciones que ESTÁN, y esta es la fila que mata mirar lo oculto ANTES de buscar en la lista (antes la mataban también "./" y "../" de @s48, que ya son la regla 4: S-11) |
    # S-8 (spec): la lista se justifica por lo que GitHub Pages SIRVE, y `actions/upload-pages-artifact@v4`
    # (`deploy-pages.yml:76-79`) empaqueta con `tar … --exclude=".[^/]*"`, que deja fuera los ocultos a
    # cualquier profundidad (spec, medido con GNU tar 1.35). Decir «sin fichero en dist/» de un fichero que
    # SÍ está sería la acusación falsa que H5-4 evita con su regla propia, y dejarlo pasar, un 404. El
    # humilde los lista (el dist/ real trae `.vite/manifest.json` y `.vite/ssr-manifest.json`) y no filtra
    # nada: lo decide la lógica pura, que se muta. Que el humilde REAL no los filtra lo atestigua @s71,
    # extremo a extremo (ronda 2 de revisión). La 5 nunca ve "." ni "..": la 4 los para antes (S-11).

  @s66
  Scenario Outline: basta UN <link> root-absoluto en CUALQUIER página del artefacto, aunque no sea la primera del listado ni estén en todas, para resolverlo, cortar sin la lista o caer en la rama de @s29: <lista>
    Given la base declarada "/NailsLashStudioWeb/" y <lista>
    And un artefacto cuyo listado de HTML devuelve, EN ESTE ORDEN, "dist/index.html" y "dist/servicios/index.html"
    And en "dist/index.html" (ruta "/"), la página correcta tal cual, sin ningún <link> root-absoluto
    And en "dist/servicios/index.html" (ruta "/servicios"), la página correcta con la canónica "https://example.invalid/servicios" y un único <link> root-absoluto: <link rel="stylesheet" href="/NailsLashStudioWeb/no-existe.css">
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/", "/servicios"]
    Then (ANCLA) el extractor de href de <link> devuelve, de "/", solo "https://example.invalid/", y de "/servicios", en este orden, "https://example.invalid/servicios" y "/NailsLashStudioWeb/no-existe.css"
    And el código de salida es distinto de 0
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | lista                                                                                     | lineas                                                                                                   | por qué                                                                         |
      | la lista de referencia                                                                    | /servicios — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/no-existe.css"                | con la lista: el <link> de la SEGUNDA página se resuelve y se acusa con SU ruta |
      | una petición que NO trae la lista de ficheros                                             | la puerta no recibió la lista de ficheros del artefacto y hay elementos link root-absolutos que resolver | sin ella, CORTA (S-3), aunque la primera página no tenga nada que resolver      |
      | una lista de ficheros cuyo método LANZA un Error con el mensaje "EACCES: lista de prueba" | la puerta del cascarón no pudo completar la inspección: EACCES: lista de prueba                          | y si al pedirla revienta, la rama de @s29                                       |
    # H5-2 dice «en todo HTML del artefacto», y la spec, que la lista se consulta «solo si hay al menos un
    # <link> root-absoluto que resolver» («El puerto nuevo»), en cualquier página. Las demás filas de
    # varias páginas no lo distinguen: @s56 trae candidatos en las dos y @s59 fila 8 en ninguna. Sin este
    # escenario, una puerta que mirase solo la 1ª página del listado, o que exigiera candidatos en TODAS
    # con el listado no vacío, pasaría el resto del contrato y aquí saldría con 0 en las tres filas: falla
    # ABIERTA (medido sobre el modelo de la spec; mapa, «Revisión adversarial»). El mutante `.some` →
    # `.every` sin más ya muere en @s58 fila 3, donde `[].every(…)` es cierto con `dist/` ausente. Hoy es
    # latente: `RUTAS_ESPERADAS = ['/']` (:892).

  @s68
  Scenario Outline: S-12 — con una base declarada NO UTILIZABLE (no empieza por "/", empieza por "//" o no acaba en "/") y algún <link> root-absoluto, la puerta CORTA con una sola línea que enseña la base, sin pedir la lista; sin ninguno, hace lo de hoy: base <base>
    Given en "dist/index.html", <pagina>
    And la base declarada <base> y la lista de referencia, cuyo doble REGISTRA cada vez que la puerta la pide
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, exactamente: <extraidos>
    And el doble registra que la puerta pidió la lista de ficheros <pedidas>
    And el código de salida es <codigo>
    And las líneas del informe son exactamente: <lineas>

    Examples:
      | base                               | pagina                                                                          | extraidos                                                      | pedidas        | codigo        | lineas                                                                                                                                           | por qué                                                                                                                                                                                                                                                                                                                                                                                     |
      | "./"                               | la página correcta con <link rel="icon" href="/NailsLashStudioWeb/favicon.svg"> | "https://example.invalid/" y "/NailsLashStudioWeb/favicon.svg" | 0 veces        | distinto de 0 | la base declarada no es una ruta root-absoluta acabada en / y hay elementos link root-absolutos que resolver: "./"                               | no empieza por "/": relativa. F-05 la rechaza (@s27), pero esta puerta es la 1.ª de pnpm build (package.json:16) y corta antes, con su propia línea                                                                                                                                                                                                                                         |
      | ""                                 | la página correcta con <link rel="icon" href="/NailsLashStudioWeb/favicon.svg"> | "https://example.invalid/" y "/NailsLashStudioWeb/favicon.svg" | 0 veces        | distinto de 0 | la base declarada no es una ruta root-absoluta acabada en / y hay elementos link root-absolutos que resolver: ""                                 | la cadena VACÍA es una base DECLARADA, no ausente: solo el campo ausente o null es «sin base». Mata un if (base) que la tome por ausente                                                                                                                                                                                                                                                    |
      | "//cdn.tercero.com/"               | la página correcta con <link rel="icon" href="/NailsLashStudioWeb/favicon.svg"> | "https://example.invalid/" y "/NailsLashStudioWeb/favicon.svg" | 0 veces        | distinto de 0 | la base declarada no es una ruta root-absoluta acabada en / y hay elementos link root-absolutos que resolver: "//cdn.tercero.com/"               | empieza por "//": otro host. Es el criterio de RUTA_INTERNA (:561), el mismo que el de los candidatos                                                                                                                                                                                                                                                                                       |
      | "/NailsLashStudioWeb/ })"          | la página correcta con <link rel="icon" href="/NailsLashStudioWeb/favicon.svg"> | "https://example.invalid/" y "/NailsLashStudioWeb/favicon.svg" | 0 veces        | distinto de 0 | la base declarada no es una ruta root-absoluta acabada en / y hay elementos link root-absolutos que resolver: "/NailsLashStudioWeb/ })"          | no acaba en "/": es lo que lee baseDeclarada de la config en UNA línea (src/lib/puerta-terceros.ts:123), y F-05 la ACEPTA (:213-215). CAMBIO DE VEREDICTO latente, DECLARADO en el banner: hoy sale con 0 (también la home real: spec, medido), y con H-5 un build que hoy pasa fallaría; falla cerrada consciente del lector de TEXTO. La base sin barra a secas es la última fila de @s54 |
      | "process.env.PAGES_BASE_PATH ?? /" | la página correcta con <link rel="icon" href="/NailsLashStudioWeb/favicon.svg"> | "https://example.invalid/" y "/NailsLashStudioWeb/favicon.svg" | 0 veces        | distinto de 0 | la base declarada no es una ruta root-absoluta acabada en / y hay elementos link root-absolutos que resolver: "process.env.PAGES_BASE_PATH ?? /" | la expresión DINÁMICA, que ya se intentó dos veces y se revirtió (vite.config.ts:13-16): es lo que lee baseDeclarada. Sin S-12, 10 reglas 1 falsas sobre la home real (spec, medido)                                                                                                                                                                                                        |
      | "https://cdn.ejemplo/"             | la página correcta con <link rel="icon" href="/NailsLashStudioWeb/favicon.svg"> | "https://example.invalid/" y "/NailsLashStudioWeb/favicon.svg" | 0 veces        | distinto de 0 | la base declarada no es una ruta root-absoluta acabada en / y hay elementos link root-absolutos que resolver: "https://cdn.ejemplo/"             | absoluta: tampoco empieza por "/" (caso límite 19)                                                                                                                                                                                                                                                                                                                                          |
      | "/"                                | la página correcta con <link rel="icon" href="/favicon.svg">                    | "https://example.invalid/" y "/favicon.svg"                    | al menos 1 vez | 0             | (ninguna)                                                                                                                                        | CONTROL: "/" es utilizable (empieza por "/", no por "//", y acaba en "/"), y "/favicon.svg" va a "dist/favicon.svg" y pasa. Mata un predicado que exija algo entre las dos barras                                                                                                                                                                                                           |
      | "./"                               | la página correcta, sin ningún <link> root-absoluto                             | solo "https://example.invalid/"                                | 0 veces        | 0             | (ninguna)                                                                                                                                        | SIN ningún candidato, lo de hoy, sea cual sea la base: validarla sigue siendo de F-05 (@s27). Mata mirar la base fuera de «hay algún candidato»                                                                                                                                                                                                                                             |
    # S-12 (spec, «La base: utilizable, o la puerta corta»; caso límite 19; ronda 2 de revisión). No es la
    # política de `base` (same-origin, de F-05, @s27): es la PRECONDICIÓN del cálculo de esta puerta,
    # quitar un prefijo acabado en "/", como la lista lo es en S-3. El humilde le pasa `baseDeclarada(…)`
    # sin validar (`tools/puerta-cascaron.ts:56`), y esta puerta va ANTES que F-05 en la cadena de
    # `pnpm build`. Sin S-12, con la dinámica, la config en una línea o "./", la puerta de hoy sale con 0 y
    # la resolución daría 10 reglas 1 sobre la home real; con "/NailsLashStudioWeb" o la cadena vacía, 10
    # reglas 2: de `href` que SÍ llevan el prefijo real, o de ficheros que SÍ están (spec, medido). La línea
    # enseña la base TAL CUAL, para que se vea qué leyó `baseDeclarada`. «Utilizable»: empieza por "/", su
    # 2º carácter no es "/" (el criterio de `RUTA_INTERNA`, :561) y acaba en "/"; la base ausente o null es
    # «sin base» y no se mira (@s54). El 2º `Then` ancla que la lista NO se pide con una base así; con la
    # lista ausente, gana el corte por lista ausente (@s69). La columna `base` lleva las comillas: la 2ª
    # fila es la cadena vacía. La 4ª es la única base de esta tabla con la que un build que hoy pasa
    # fallaría: F-05 la acepta y, sobre la home real, la puerta de hoy sale con 0. Es el CAMBIO DE
    # VEREDICTO latente que declara el banner (spec, «La base», medido en su ronda final): una falla
    # cerrada CONSCIENTE del lector de TEXTO, que se ratifica en esta puerta.

  @s69
  Scenario: S-12 va DESPUÉS del corte por lista ausente: con una base no utilizable, algún <link> root-absoluto y la petición SIN la lista, sale SOLO la línea de la lista
    Given en "dist/index.html", la página correcta con <link rel="icon" href="/NailsLashStudioWeb/favicon.svg">
    And la base declarada "./" y una petición que NO trae la lista de ficheros
    When se ejecuta la puerta del cascarón sobre ese artefacto, con la lista de rutas esperadas ["/"]
    Then (ANCLA) el extractor de href de <link> devuelve, de esa página, exactamente: "https://example.invalid/" y "/NailsLashStudioWeb/favicon.svg"
    And el código de salida es distinto de 0
    And las líneas del informe son exactamente: la puerta no recibió la lista de ficheros del artefacto y hay elementos link root-absolutos que resolver
    # Spec, «La base: utilizable, o la puerta corta»: el corte por la base va DESPUÉS del corte por lista
    # ausente (S-3), y con las dos cosas sale solo la de la lista. Sin este escenario, el orden de los dos
    # cortes no lo fija ninguna fila: @s57 lleva una base utilizable y @s68, la lista presente.

  # ---------------------------------------------------------------------------
  # Extremo a extremo (D9): la puerta REAL, como subproceso, sobre el artefacto REAL, sobre copias
  # saboteadas (una por firma, @s62; y las del humilde: una carpeta, @s67; un oculto, @s71; la raíz,
  # @s72) y sobre un dist/ ausente (@s70)
  # ---------------------------------------------------------------------------
  # PARA EL `tdd_craftsman` (vale para @s61, @s62, @s67 y @s70-@s72):
  #   - Se AMPLÍA `src/pages/home-horneado.test.ts` (precedente de las ENMIENDAS 2-4). La entrada es el
  #     artefacto temporal que deja el `pnpm build` de su `beforeAll` (H-3), y la puerta se corre con su
  #     `correrPuerta` (:498-511), que ya pasa `NLS_DIST_DIR` y, si sale con un código distinto de 0,
  #     devuelve la salida estándar y la de error. PROHIBIDO un build nuevo, un `execSync` de build extra o
  #     jsdom. Sigue fuera de Stryker (`*-horneado.test.*`) y sin importar nada de `src/`.
  #   - Cada sabotaje trabaja sobre su PROPIA copia del artefacto, dentro del temporal de ESE fichero;
  #     NUNCA sobre el `dist/` ni el `public/` del proyecto, ni sobre el artefacto original, que siguen
  #     leyendo F-28 @s8 y las demás aserciones del fichero. @s70 no copia nada: usa el MISMO directorio
  #     inexistente del «H-3 caso» (`join(temporal, 'no-existe')`, :535-541).
  #   - Literales A MANO ("/NailsLashStudioWeb/", "/NailsLashStudioWeb/favicon.svg", "/favicon.svg",
  #     "/NailsLashStudioWeb/assets", "/NailsLashStudioWeb/assets/", "/NailsLashStudioWeb/.vite/manifest.json",
  #     cada línea esperada, "✓ Puerta del cascarón", " — link root-absoluto" y "ENOENT").
  #   - LA EXTRACCIÓN DE `<link>` es la MISMA EXPRESIÓN que ya usan @s40 y F-28 @s8 en ese fichero (el
  #     patrón de apertura de `elementos` y su `atributosDe`, :215-238), aplicada al TEXTO que diga cada
  #     `Then`; y el `href` se lee TAL CUAL, con `.get('href')` como F-28 @s8, NUNCA con `valorDe`
  #     (:241-243), que lo pasa a minúsculas.
  #   - EXCEPCIÓN DECLARADA a «ningún ayudante de @s1-@s45 cambia» (banner): `elementos(etiqueta)` no
  #     recibe el HTML; lee la variable de módulo `html` (:57), que el `beforeAll` llena UNA vez desde el
  #     artefacto ORIGINAL (:85). Con ella, el ANCLA de una copia miraría el original, y el último `Then`,
  #     una foto anterior al sabotaje [V: sobre un build real y sus copias, `elementos('link')` sigue viendo
  #     1 `href` con la base en la copia (a) y en un original dañado tras la foto]. Se añade un ayudante
  #     NUEVO, `elementosDe(fuente, etiqueta)` (nombre orientativo), con el MISMO patrón y el MISMO
  #     `atributosDe`, y `elementos(etiqueta)` pasa a ser `elementosDe(html, etiqueta)`: mismo
  #     comportamiento, y ninguna llamada de @s39-@s42 ni de F-28 @s8 cambia. PROHIBIDO un segundo patrón y
  #     PROHIBIDO reasignar `html` para medir una copia (estado que comparten @s1-@s45 y F-28 @s8).
  #   - QUÉ TEXTO SE MIDE: todo `Then` sobre una copia lee los ficheros de ESA copia del DISCO
  #     (`readFileSync`, `statSync`), después del sabotaje. El último `Then` de @s62, @s67, @s71 y @s72
  #     RELEE del disco el `index.html` del artefacto ORIGINAL; `html` solo es ahí la referencia de lo que
  #     había ANTES.
  #   - NACEN EN ROJO con la puerta de hoy, que solo mira `<a href>` (las copias salen con 0): @s62, @s67 y
  #     @s71. Sus anclas, y todo @s61, ya están en VERDE. NACEN EN VERDE, y son CONTROLES del humilde que la
  #     enmienda no debe romper: @s70 (que liste DESPUÉS de que la puerta pregunte `existe()`) y @s72 (que
  #     liste también las HTML).
  #   - No se siembra un sabotaje de CAJA: en `vite build` la caja equivocada daría la firma (b) en Windows y
  #     la (a) en Linux [I: código de Vite, sin medir] (spec, «Huecos»). La caja la fijan @s47 y @s48.

  @s61
  Scenario: extremo a extremo, ANCLA y CONTROL — la puerta real sobre el artefacto real sale con 0, y ese artefacto SÍ trae lo que los sabotajes rompen
    Given el artefacto temporal que deja el "pnpm build" REAL del beforeAll de "src/pages/home-horneado.test.ts", con base "/NailsLashStudioWeb/"
    When se corre "tools/puerta-cascaron.ts" como subproceso, con NLS_DIST_DIR apuntando a ese artefacto
    Then (ANCLA) su "index.html" trae al menos 1 elemento "<link" cuyo "href" empieza por "/NailsLashStudioWeb/", al menos 1 cuyo "href" empieza por "/NailsLashStudioWeb/assets/", y exactamente 1 cuyo "href" es "/NailsLashStudioWeb/favicon.svg"
    And su "favicon.svg" existe y pesa más de 0 bytes
    And el código de salida es 0
    And la salida contiene "✓ Puerta del cascarón"
    # El código 0 es el «H-3 control» de `cascaron` que YA existe en ese fichero (:524-533): se cita, no
    # se duplica. Lo nuevo es el ancla: sin ella, los sabotajes de @s62 podrían «fallar» sobre un artefacto
    # sin nada que comprobar. Con la enmienda, este control prueba además PARTE del humilde: los 10
    # `<link>` root-absolutos del artefacto real (3 iconos en la raíz, 1 `stylesheet` y 6 `preload` en
    # `assets/`) solo resuelven si la lista trae los ficheros de la raíz Y de las subcarpetas, con su tamaño.
    # El ancla de `assets/` (ronda 2 de revisión) hace que eso dependa del contrato y no de lo que traiga
    # hoy el artefacto: sin ningún `<link>` a `assets/`, un humilde con `readdirSync` NO recursivo pasaría
    # @s61, @s62 y @s67. NO prueba que la lista traiga los OCULTOS ni las HTML (el artefacto real no enlaza
    # ninguno): lo atestiguan @s71 y @s72. NO se asevera «ninguna línea con " — link root-absoluto"» (la
    # ronda 1 de revisión la retiró por VACÍA): con código 0, `correrPuerta` devuelve solo la salida estándar
    # (:498-511) y el humilde escribe las líneas en la de error (`console.error`, `tools/puerta-cascaron.ts:60`),
    # así que no podría fallar [V: `execSync(…).toString()` de un proceso que escribe en las dos y sale con 0
    # devuelve solo la estándar]. Y sobra: toda salida de la puerta con líneas lleva el código 1
    # (`src/lib/puerta-cascaron.ts:785-854`), y las filas puras lo fijan (toda fila con línea espera
    # distinto de 0).

  @s62
  Scenario Outline: extremo a extremo, las TRES firmas del H-5 (dos 404 y un icono vacío) — la puerta real sobre una copia saboteada del artefacto real sale con un código distinto de 0 y su línea: <firma>
    Given una COPIA del artefacto temporal de @s61, hecha SOLO para este caso dentro del temporal del fichero
    And en esa copia, <sabotaje>
    When se corre "tools/puerta-cascaron.ts" como subproceso, con NLS_DIST_DIR apuntando a esa copia
    Then (ANCLA: el sabotaje está hecho, medido sobre los ficheros de la COPIA leídos del disco) <estado>
    And el código de salida es un número distinto de 0
    And la salida contiene la línea <linea>
    And esa es la ÚNICA línea de la salida que contiene " — link root-absoluto"
    And la salida no contiene "✓"
    And el "index.html" del artefacto ORIGINAL, RELEÍDO del disco después del sabotaje, es idéntico al texto que leyó el beforeAll, y su "favicon.svg" sigue existiendo con más de 0 bytes

    Examples:
      | firma                                   | sabotaje                                                                                                                                                | estado                                                                                                                                                 | linea                                                                                      |
      | (a) sin la base: 404                    | se borra "favicon.svg" y, en "index.html", el href "/NailsLashStudioWeb/favicon.svg" pasa a "/favicon.svg", como lo hornea Vite cuando falta el fichero | la copia NO tiene "favicon.svg", y su "index.html" trae exactamente 1 "<link" de "href" "/favicon.svg" y 0 de "href" "/NailsLashStudioWeb/favicon.svg" | / — link root-absoluto sin el prefijo de la base: "/favicon.svg"                           |
      | (b) con la base, sin fichero: 404       | se borra "favicon.svg" y el href se deja con la base                                                                                                    | la copia NO tiene "favicon.svg", y su "index.html" trae exactamente 1 "<link" de "href" "/NailsLashStudioWeb/favicon.svg"                              | / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/favicon.svg"             |
      | (c) con fichero de 0 bytes: icono vacío | "favicon.svg" se deja en 0 bytes                                                                                                                        | la copia tiene "favicon.svg" con 0 bytes, y su "index.html" trae exactamente 1 "<link" de "href" "/NailsLashStudioWeb/favicon.svg"                     | / — link root-absoluto a un fichero de 0 bytes en dist/: "/NailsLashStudioWeb/favicon.svg" |
    # «Un número distinto de 0», como el «H-3 caso»: un proceso matado por señal (`status` null) no cuenta
    # como fallo cerrado. Las copias pueden salir de UNA sola copia por sabotaje, hecha en el propio `it`.
    # El último `Then` mide bytes RELEÍDOS: con `elementos('link')` sobre `html` no podría fallar aunque un
    # sabotaje escribiera en el original (medido; ver las notas de arriba). La (b) la midió en un build
    # real la ronda 1 de revisión (banner), no F-28. La (c) solo se siembra aquí, sobre una copia y sin
    # pasar por Vite: el eslabón Vite → dist/ lo midió el lead (brief §2) y el rojo demostrado de @s63 es
    # solo la (a) (S-10). Sobre un modelo de la spec y las copias de un build real, las tres dan
    # exactamente su línea [V: mapa, «Revisión adversarial»].

  @s67
  Scenario: extremo a extremo — el humilde lista solo FICHEROS: un <link> a una CARPETA real de la copia sale por la regla 2, nunca por la 3 ni con 0
    Given una COPIA del artefacto temporal de @s61, hecha SOLO para este caso dentro del temporal del fichero
    And en esa copia, el href "/NailsLashStudioWeb/favicon.svg" de "index.html" pasa a "/NailsLashStudioWeb/assets", y la carpeta "assets" no se toca
    When se corre "tools/puerta-cascaron.ts" como subproceso, con NLS_DIST_DIR apuntando a esa copia
    Then (ANCLA: el sabotaje está hecho, medido sobre los ficheros de la COPIA leídos del disco) "assets" es una CARPETA de la copia, y su "index.html" trae exactamente 1 "<link" de "href" "/NailsLashStudioWeb/assets" y 0 de "href" "/NailsLashStudioWeb/favicon.svg"
    And el código de salida es un número distinto de 0
    And la salida contiene la línea / — link root-absoluto sin fichero en dist/: "/NailsLashStudioWeb/assets"
    And esa es la ÚNICA línea de la salida que contiene " — link root-absoluto"
    And la salida no contiene "✓"
    And el "index.html" del artefacto ORIGINAL, RELEÍDO del disco después del sabotaje, es idéntico al texto que leyó el beforeAll
    # Ancla el filtro «solo ficheros» del humilde (spec, «El puerto nuevo»: `readdirSync` recursivo con
    # `withFileTypes`, solo ficheros, y `statSync(…).size`), que ningún otro `Then` ve: las filas puras
    # usan una lista escrita a mano SIN carpetas, y los sabotajes de @s62 solo tocan `favicon.svg`.
    # `readdirSync(…, { recursive: true, withFileTypes: true })` devuelve también las carpetas (en un build
    # real, 42 entradas: 39 ficheros y 3 carpetas, `.vite`, `assets` y `static-loader-data`) y en Windows
    # `statSync` de una carpeta da 0 B [V: Node 22.15.0]. Un humilde sin `isFile()` daría aquí, en Windows,
    # la regla 3, una acusación falsa, y con una carpeta de más de 0 B [I: Linux, sin medir], exit 0: las
    # dos rompen este escenario [V: modelo de la spec sobre una copia de un build real]. Y en GitHub Pages
    # no hay nada ahí: con `curl -I`, `/NailsLashStudioWeb/assets` da 301 a `.../assets/`, y esa, 404
    # (2026-10-01). No es una cuarta FIRMA del H-5 (S-5 siembra tres): es la prueba del humilde.

  @s70
  Scenario: extremo a extremo, CONTROL — con dist/ AUSENTE, el humilde no lista antes de que la puerta pregunte existe(): sale la línea de @s26, nunca un ENOENT
    Given el directorio INEXISTENTE que ya usa el «H-3 caso» de "src/pages/home-horneado.test.ts" (:535-541), dentro del temporal del fichero
    When se corre "tools/puerta-cascaron.ts" como subproceso, con NLS_DIST_DIR apuntando a ese directorio
    Then (ANCLA) ese directorio NO existe en el disco
    And el código de salida es un número distinto de 0
    And la salida contiene la línea / — ruta esperada sin HTML en dist/: ""
    And la salida no contiene "ENOENT"
    And la salida no contiene "✓"
    # La spec («El puerto nuevo») justifica que la lista sea un MÉTODO con una propiedad del humilde REAL:
    # no puede listar antes de que la puerta pregunte `existe()`, o con `dist/` ausente `readdirSync`
    # lanzaría FUERA de la puerta y se perdería la línea de @s26. @s58 fila 3 lo prueba con dobles; esto, con
    # el humilde de verdad. El «H-3 caso» no basta: solo exige un número distinto de 0, y un humilde ANSIOSO,
    # que lista antes de llamar a la puerta, sale con 1 por un ENOENT no capturado y sin la línea de @s26
    # (ronda 2 de revisión; mapa §10, medido). Nace en VERDE: el humilde de hoy ya pregunta `existe()` antes
    # de `listarHtml` (`tools/puerta-cascaron.ts:35-37`). Es el CONTROL de que el cableado nuevo de la lista
    # sigue siendo perezoso.

  @s71
  Scenario: extremo a extremo — el humilde lista también los OCULTOS y no filtra nada: un <link> a ".vite/manifest.json" de la copia sale por la regla 5, nunca por la 2
    Given una COPIA del artefacto temporal de @s61, hecha SOLO para este caso dentro del temporal del fichero
    And en esa copia, el href "/NailsLashStudioWeb/favicon.svg" de "index.html" pasa a "/NailsLashStudioWeb/.vite/manifest.json", y la carpeta ".vite" no se toca
    When se corre "tools/puerta-cascaron.ts" como subproceso, con NLS_DIST_DIR apuntando a esa copia
    Then (ANCLA: el sabotaje está hecho, medido sobre los ficheros de la COPIA leídos del disco) la copia tiene ".vite/manifest.json" con más de 0 bytes, y su "index.html" trae exactamente 1 "<link" de "href" "/NailsLashStudioWeb/.vite/manifest.json" y 0 de "href" "/NailsLashStudioWeb/favicon.svg"
    And el código de salida es un número distinto de 0
    And la salida contiene la línea / — link root-absoluto a un fichero oculto, que el despliegue no publica: "/NailsLashStudioWeb/.vite/manifest.json"
    And esa es la ÚNICA línea de la salida que contiene " — link root-absoluto"
    And la salida no contiene "✓"
    And el "index.html" del artefacto ORIGINAL, RELEÍDO del disco después del sabotaje, es idéntico al texto que leyó el beforeAll
    # S-8 decide que el humilde lista también los ocultos y NO filtra nada: lo que el despliegue no publica
    # lo separa la regla 5, que es lógica pura y se muta. @s65 lo prueba con una lista escrita a mano que
    # ya los trae; ningún otro `Then` pone un `<link>` a un oculto delante del humilde REAL (el artefacto
    # real no enlaza ninguno). Un humilde que quitara las entradas con algún segmento que empieza por "."
    # pasaría @s61, @s62 y @s67, y aquí daría la regla 2, «sin fichero en dist/» de un fichero que SÍ está:
    # justo la acusación falsa que S-8 descartó (su alternativa (i)) (ronda 2 de revisión; mapa §10,
    # medido). Nace en ROJO: la puerta de hoy sale con 0 y "✓" sobre esta copia. No es una FIRMA del H-5
    # (S-5 siembra tres): es la prueba del humilde, como @s67.

  @s72
  Scenario: extremo a extremo, CONTROL — el humilde lista también las HTML: un <link> a la RAÍZ "/NailsLashStudioWeb/" de la copia resuelve a su "index.html" y la puerta sale con 0
    Given una COPIA del artefacto temporal de @s61, hecha SOLO para este caso dentro del temporal del fichero
    And en esa copia, el href "/NailsLashStudioWeb/favicon.svg" de "index.html" pasa a "/NailsLashStudioWeb/", y nada más cambia
    When se corre "tools/puerta-cascaron.ts" como subproceso, con NLS_DIST_DIR apuntando a esa copia
    Then (ANCLA: el sabotaje está hecho, medido sobre los ficheros de la COPIA leídos del disco) su "index.html" pesa más de 0 bytes y trae exactamente 1 "<link" de "href" "/NailsLashStudioWeb/" y 0 de "href" "/NailsLashStudioWeb/favicon.svg"
    And el código de salida es 0
    And la salida contiene "✓ Puerta del cascarón"
    And el "index.html" del artefacto ORIGINAL, RELEÍDO del disco después del sabotaje, es idéntico al texto que leyó el beforeAll
    # La spec exige que la lista traiga TODOS los ficheros, «de cualquier extensión y HTML incluidas» («El
    # puerto nuevo»), y la raíz se resuelve a "dist/index.html" (@s51). Ningún `<link>` del artefacto real
    # apunta a una HTML, así que un humilde que dejara fuera las `.html` pasaría @s61, @s62 y @s67; aquí
    # daría la regla 2 sobre la raíz, que existe (ronda 2 de revisión; mapa §10, medido). Nace en VERDE (la
    # puerta de hoy no mira `<link>`): es un CONTROL del humilde que la enmienda no debe romper. Con código 0
    # no se asevera ninguna línea, por la misma razón que en @s61.

  # ---------------------------------------------------------------------------
  # A mano, por el LEAD: el rojo demostrado sobre el árbol y la comprobación en la web publicada (H5-6)
  # ---------------------------------------------------------------------------
  # No son tests: el lead los hace y los anota en `progress/verificacion_viva_h5_enlaces_horneados.md`,
  # con los comandos, los códigos y las líneas.

  @s63 @demostracion-del-lead
  Scenario: [A MANO, EL LEAD, sobre el árbol] borrar public/favicon.svg hace que "pnpm build" falle por la regla 1; restaurarlo lo devuelve a 0 y deja el árbol limpio
    Given la rama con la ENMIENDA 5 ya implementada, "git status --porcelain" vacío y una copia de "public/favicon.svg" FUERA del repo
    And dos "pnpm build", cada uno con NLS_DIST_DIR en su PROPIO temporal fuera del repo: el SABOTAJE, con "public/favicon.svg" borrado, y después el CONTROL, con el fichero restaurado desde la copia
    When el lead los lanza, en ese orden
    Then el SABOTAJE sale con un código distinto de 0, y su salida contiene la línea / — link root-absoluto sin el prefijo de la base: "/favicon.svg" y ninguna otra que contenga " — link root-absoluto"
    And el CONTROL sale con 0 y su salida contiene "✓ Puerta del cascarón"
    And tras el CONTROL, "git status --porcelain" vuelve a estar vacío y "public/favicon.svg" es byte a byte igual a la copia
    And los dos comandos, sus códigos de salida y las líneas de la puerta quedan anotados en "progress/verificacion_viva_h5_enlaces_horneados.md"
    # Es el «rojo demostrado» de la definición de hecho (brief §3): la firma (a), y SOLO la (a) (S-10),
    # reproducida en el pipeline de verdad: `vite-react-ssg build` sale con 0 y la PRIMERA puerta de la
    # cadena de `pnpm build` (`package.json:16`) es la del cascarón, así que la cadena se corta ahí. La (b)
    # y la (c) las siembra @s62 sobre copias del artefacto real, con el humilde REAL: otra build no añade
    # ningún eslabón (S-10). Reproducción sin ensuciar el árbol: brief §7.

  @s64 @verificacion-viva
  Scenario: [EN VIVO, tras publicar; CONTROL de regresión] cada href root-absoluto de un <link> de la home publicada responde 200, y el mismo método ve el 404 de la firma (a)
    Given la PR fusionada en main y el despliegue de "github-pages" aprobado y terminado (H5-6)
    When el lead descarga el HTML de "https://cenit-digital.github.io/NailsLashStudioWeb/", le aplica el extractor de la puerta ("ENLACE" + "ATRIBUTO_HREF") y la definición de root-absoluto de la spec, limpieza incluida, y pide cada href resultante con "curl -I" al origen "https://cenit-digital.github.io"
    Then (ANCLA) hay al menos 1 de esos href, y entre ellos "/NailsLashStudioWeb/favicon.svg"
    And cada uno responde 200
    And (CONTRAPRUEBA: el método ve un 404) "curl -I https://cenit-digital.github.io/favicon.svg", la firma (a) del H-5, responde 404
    And en "progress/verificacion_viva_h5_enlaces_horneados.md" quedan el tamaño y el SHA-256 del HTML descargado, la lista de href con su código y la contraprueba
    # La propuesta de la spec («Prueba de extremo a extremo», punto 4) y la comprobación que H5-6 manda
    # repetir. Es un CONTROL DE REGRESIÓN del sitio vivo, NO evidencia de H-5: la enmienda no cambia ni un
    # byte de lo publicado. No toca `vite.config.ts`, `index.html` ni `public/`, y a
    # `src/lib/puerta-cascaron.ts` solo lo importan las puertas (`tools/puerta-cascaron.ts`,
    # `tools/puerta-anclas.ts` y `src/lib/puerta-anclas.ts`, que solo importa `tools/puerta-anclas.ts`)
    # [V: grep]. Así que pasa igual con H-5 que sin él: la ronda 1 de revisión lo corrió el 2026-10-01
    # sobre el sitio publicado SIN H-5, con 10 href, los 10 a 200, y la contraprueba a 404. La evidencia
    # de la enmienda es la puerta pura, @s61-@s63, @s67 y @s70-@s72. La contraprueba está porque, sin ella,
    # un método que no viera los 404 daría «todo 200» en vacío. Del HTML se anotan el tamaño y el SHA-256,
    # no los bytes: un `.html` en `progress/` lo revisaría `prettier --check .` (dentro de `lint`), y el
    # publicado no pasa [V: `prettier --check` sobre la home descargada avisa «Code style issues found»].
