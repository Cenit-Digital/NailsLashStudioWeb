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
# @s1-@s41 SE PRESERVAN INTACTOS; SE AÑADEN @s42, @s43 Y @s44.
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
