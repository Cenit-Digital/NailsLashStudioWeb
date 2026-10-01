# TDD — F-27 `catalogo_fotos` (2026-09-30)

> Bitácora del `tdd_craftsman`. Contrato: `features/catalogo_fotos.feature` (aprobado por Pablo el
> 2026-09-29). Spec: `project-spec.md` §«Feature 27». Fotos: `progress/fotos_seleccion.md` (ya en
> `src/assets/servicios/`, 800 × 1000, sin EXIF): aquí NO se buscan, descargan ni cambian fotos, solo
> se cablean. Escritura INCREMENTAL: si esta sesión se corta, se continúa desde el último ciclo anotado.

## Alcance

- TDD de @s1-@s21. @s22-@s26 son `@verificacion-viva` (Chrome real): los hace el lead, no se fingen
  en jsdom.
- Producción tocada: `src/lib/demo/catalogo-demo.ts` (datos), `src/components/Catalogo.tsx` (render),
  `src/components/catalogo.module.scss` (hoja). Config: `stryker.config.json` (`mutate` += Catalogo.tsx).
- Tests nuevos: `src/components/catalogo.test.tsx` (@s1-@s13), `src/lib/demo/catalogo-demo.test.ts`
  (@s14-@s16), `src/components/catalogo-fuente.test.ts` (@s17-@s19),
  `src/components/catalogo-estilos.test.ts` (@s20, @s21).
- Recursos: el hook `PostToolUse` corre la suite completa tras cada `Edit`/`Write`. Durante el ciclo solo
  se lanzan tests ACOTADOS (`pnpm vitest run <ficheros>`), esperando a que no haya otra suite viva. Los
  sabotajes se aplican y revierten con un script de scratchpad (bytes restaurados y comprobados), para
  no disparar dos suites completas por sabotaje.

## Ciclos Rojo → Verde → Refactor

Comando de cada Rojo/Verde: `pnpm vitest run <fichero del ciclo>` (acotado), tras esperar a que el hook
termine su suite.

### @s1 — una `<img>` por categoría con el `alt` exacto (Outline ×3)

- **ROJO** — `catalogo.test.tsx` `@s1` (3 `it`, uno por `clave`): el bloque de cada categoría (de su
  `<h3>` al `<h3>` siguiente o a la leyenda de precios) en `renderToString`. Ancla positiva verde (el
  bloque existe); falla la cuenta: `AssertionError: expected [] to have a length of 1 but got +0`
  (×3). `Tests 3 failed (3)`.
- **VERDE** — `CategoriaDemo` gana `alt: string` (obligatorio) y los tres `alt` de la tabla en
  `CATALOGO_DEMO`; en `Catalogo.tsx`, `<img alt={categoria.alt} />` tras el hueco (el `<div>` rosa se
  QUEDA: ningún test pide aún retirarlo). `Tests 3 passed (3)`.
- **REFACTOR** — nada que limpiar.

### @s2 — tres `alt` no vacíos y distintos, tres `src` distintos

- **ROJO** — `@s2`: las `<img>` aún no tienen `src` (tres `''`): `AssertionError: expected 1 to be 3
// Object.is equality` (tamaño del conjunto de `src`). `Tests 1 failed | 3 passed (4)`.
- **VERDE** — `CategoriaDemo` gana `foto: string` (obligatorio); los tres `import` estáticos de
  `src/assets/servicios/*.jpg` viven en `catalogo-demo.ts` (CF-3) y cada categoría lleva su `foto`;
  la `<img>` gana `src={categoria.foto}`. `Tests 4 passed (4)`. Nota: ir directo a los `import` reales
  (y no a tres cadenas inventadas) hace que la parte «fichero de su categoría» de @s3 nazca verde; por
  eso @s3 se demuestra con sabotaje.
- **REFACTOR** — nada que limpiar.

### @s3 — `src` local de su fichero, sin terceros

- **Tests** — `@s3` (3 `it`): orden de ficheros + `.jpg`; ningún `src` con `http(s)://`, `//` ni
  `data:` (con ancla de 3 `src`); el horneado con ancla «Manos y pies de Revista» sin `http(s)://`.
- **Nace VERDE** (`Tests 7 passed (7)`): los `import` reales llegaron en el Verde de @s2. Que muerde se
  demuestra con SABOTAJES en `catalogo-demo.ts` (aplicados y revertidos por script, bytes restaurados):
  - (a) Uñas con `foto: servicioDepilacionPielSuave` → cae `@s3 … termina en ".jpg"`:
    `expected '/src/assets/servicios/servicio-depila…' to contain 'servicio-unas-manicura-nude'` (y
    `@s2`: `expected 2 to be 3`).
  - (b) Facial con `'https://images.pexels.com/photos/7479587/servicio-facial-pestanas.jpg'` → caen
    `@s3 ningún src…` (`not to match /^(?:https?:)?\/\//`) y `@s3 el horneado…` (`not to contain
'https://'`).
  - (c) Facial con `'data:image/jpeg;base64,servicio-facial-pestanas.jpg'` → cae `@s3 ningún src…`
    (`expected true to be false`, la rama `data:`), y SOLO ese.
- Hallazgo: sin `loading="lazy"`, React 19 antepone en SSR un `<link rel="preload" as="image">` por
  foto (se vio en el mensaje de (b)). Desde @s4 (`lazy`) React ya no lo emite en `renderToString`.

### @s4 — `width="800"`, `height="1000"`, `loading="lazy"`; ni `fetchpriority` ni `eager`

- **ROJO** — `@s4 las tres <img> declaran…`: `AssertionError: expected null to be '800' //
Object.is equality`. `Tests 1 failed | 8 passed (9)`. La negativa (`fetchpriority`/`eager`, con
  ancla de 3 `<img>`) nace verde: es la guarda de CF-6.
- **VERDE** — `ANCHO_FOTO = 800` y `ALTO_FOTO = 1000` (medidas reales, @s19) y `loading="lazy"` en la
  `<img>`. `Tests 9 passed (9)`.
- **Sabotajes de la negativa** — (d) `fetchPriority="high"` → cae `@s4 ninguna <img>…` (`not to
contain 'fetchpriority'`); (e) `loading="eager"` → caen las dos de @s4 (`expected 'eager' to be
'lazy'` y `not to contain 'loading="eager"'`). Revertidos.
- **REFACTOR** — nada que limpiar.

### @s5 — la `<img>` ES el hueco: hija directa tras la carta, nada `aria-hidden`

- **ROJO** — `@s5` (3 `it`, uno por CTA, + 1 global) en jsdom: el contenedor de la carta aún tiene 3
  hijos (carta, `<div>` rosa, `<img>`): `AssertionError: expected [ <div …(1)>…(7)</div>, …(2) ] to have
a length of 2 but got 3` (×3); el global: `expected …(3) to have a length of +0 but got 3` (los tres
  `aria-hidden="true"` del hueco rosa). `Tests 4 failed | 9 passed (13)`.
- **VERDE** — se RETIRA el `<div className={estilos.foto} aria-hidden="true" />`: la `<img>` queda como
  segundo hijo del contenedor. `Tests 13 passed (13)`. (La clase del hueco en la `<img>` no es
  observable con `css: false`: la pide @s17.)
- **Sabotajes** — (f) `<div><img …/></div>` (alternativa (a) de CF-2, envoltorio) → caen los 3 de
  estructura: `expected 'DIV' to be 'IMG'`; (g) vuelve el `<div aria-hidden="true" />` junto a la
  `<img>` → caen los 4 (`… but got 3` y `expected <div aria-hidden="true"></div>` en la cuenta global);
  (h) `role="presentation"` en la `<img>` → cae el global: `expected 'presentation' not to be
'presentation'`. Revertidos.
- **REFACTOR** — nada que limpiar.

### @s6 — árbol de accesibilidad: 3 `img` con su `alt`, `<h3>` y enlaces limpios, región «Servicios»

- **Tests** — `@s6` (4 `it`): 3 `img` por rol y en orden por nombre; 3 `<h3>` por rol y nombre EXACTO
  en orden; ninguna `<img>` bajo `h3`/`a` y los tres enlaces por nombre; región «Servicios».
- **Nace VERDE** (`Tests 17 passed (17)`): el Verde de @s5 (retirar el `aria-hidden`) ya lo cumplía.
  Sabotajes (acotados con `-t @s6`):
  - (i) `aria-hidden="true"` en la `<img>` → caen 2 de @s6: `TestingLibraryElementError: Unable to find
an accessible element with the role "img"` (y @s5 global).
  - (j) la foto dentro del `<h3>` → caen 3 de @s6, entre ellas `Unable to find an accessible element
with the role "heading" and name "Manos y pies de Revista"` (el `alt` contamina el nombre).
  - (k2) la foto (con su `alt`) dentro del enlace y la de la rejilla con `alt=""` → cae `@s6 ninguna
<img> desciende…`: `expected <a …(2)><img …(2)></img></a> to be null`.
  - (l) el `<h2>` pasa a «Servicios y precios» → cae `Unable to find an accessible element with the
role "region" and name "Servicios"`.
- **REFACTOR** — nada que limpiar.

### @s7 — horneado SSR y orden de lectura (títulos, CTA, fotos, leyendas)

- **ROJO** — `@s7` (2 `it`): el de anclas + `alt` en orden nace verde; el de posiciones falla porque la
  leyenda de fotos no existe: `AssertionError: falta "Fotos de banco de imágenes, ilustrativas del
servicio · las fotos reales del salón se añaden antes de publicar" en el horneado: expected -1 to be
greater than or equal to 0`. `Tests 1 failed | 18 passed (19)`.
- **VERDE** — `LEYENDA_FOTOS` exportada en `catalogo-demo.ts` (CF-C1/CF-3) y un segundo
  `<p className={estilos.leyenda}>{LEYENDA_FOTOS}</p>` justo tras el de precios. `Tests 19 passed
(19)`. Nota de diseño: la clase `.leyenda` NO la pide ningún test (no es observable como
  comportamiento); se reutiliza por CONVENCIÓN del repo (todas las leyendas —Equipo, Ofertas, Reseñas,
  Nailbot, precios— llevan `estilos.leyenda`). Efecto visual a mirar en vivo (@s23): `.leyenda` trae
  `margin: 2.5rem 0 0`, así que entre las dos leyendas quedan 40 px. Si el lead las quiere pegadas, es
  un escenario nuevo + una regla SCSS; aquí no se inventa.
- **Sabotajes** — (m) leyendas intercambiadas → `… va tras "Precios de muestra …": expected 4433 to be
greater than 4574`; (n) la foto ANTES de la carta (y la de después con `alt=""`) → caen los 2 de
  @s7 (`expected [ …(6) ] to deeply equal [ …(3) ]` y `"Manos con manicura …" va tras "Reservar Uñas":
expected 870 to be greater than 1809`). Revertidos.
- **REFACTOR** — nada que limpiar.

### @s8 — la leyenda de fotos, UNA vez, en su `<p>`, hermano inmediato del de precios

- **Nace VERDE** (`Tests 20 passed (20)`): el Verde de @s7 ya pintó el `<p>` propio. Sabotajes
  (acotados con `-t @s8`):
  - (o) la leyenda dentro del `.map` (×3) → `expected [ <p></p>, <p></p>, <p></p> ] to have a length
of 1 but got 3`.
  - (p) las dos fundidas en un `<p>` (la de fotos en un `<span>`) → `expected 'SPAN' to be 'P'`.
  - (q) un `<p />` vacío entre las dos → `expected <p></p> to be <p class="_leyenda_173eaa"></p>`.
- Hallazgo (para el lead/judge, no cambia el contrato): con esta config de Vitest las clases del
  MÓDULO NO salen `undefined`: salen con nombre estable `_<clase>_<hash>` (se ve en el mensaje de
  (q)). La regla anti-`toHaveClass` del `.feature` se respeta igual; @s17 sigue leyendo la fuente.

### @s9 — `LEYENDA_PRECIOS` intacta byte a byte

- **Nace VERDE** (`Tests 22 passed (22)`): es una guarda de regresión (F-27 no toca ese literal).
  Sabotajes en `catalogo-demo.ts` (acotados con `-t @s9`): (r) alargarla con «· Fotos de banco de
  imágenes» (alternativa (a) descartada de CF-4), (s) punto final, (t) el primer `·` (U+00B7) cambiado
  por `•` (U+2022): en los tres caen los 2 `it` de @s9 con `TestingLibraryElementError: Unable to find
an element with the text: Precios de muestra · IVA incluido · pendientes de confirmar con el salón`.
- **REFACTOR** — nada que limpiar.

### @s10 — sección, `id` único, `<h2>` oculto, 0/1/3 encabezados y rótulos

- **Nace VERDE** (`Tests 26 passed (26)`): F-27 no toca la estructura; son guardas de regresión y las
  primeras que protegen `Catalogo.tsx` (hasta hoy sin test). 4 `it` sobre `renderToString`: una
  `<section>` con `aria-labelledby` = `'servicios-titulo'` (a mano); `ids` = `['servicios-titulo']` y
  `<h2 … id="servicios-titulo">Servicios</h2>`; 0/1/3 y los tres `<h3>` en orden; los tres rótulos
  `demo-eyebrow` en orden. Sabotajes (acotados con `-t @s10`):
  - (u) MUTANTE `ID_SERVICIOS = ''` → caen 2: `expected '' to be 'servicios-titulo'` y `expected [ ''
] to deeply equal [ 'servicios-titulo' ]`.
  - (v) MUTANTE flecha del `.map` de categorías devolviendo `undefined` → caen 2: `expected [] to have
a length of 3 but got +0` (los `<h3>`) y `expected [] to deeply equal [ 'Servicio de Uñas', …(2) ]`.
  - (w) la foto con `id={categoria.clave}` → `expected [ 'servicios-titulo', 'unas', …(2) ] to deeply
equal [ 'servicios-titulo' ]` (protege la puerta de anclas de F-06).

### @s11 — 3 CTA a `#reserva-titulo` y 6 filas por carta

- **Nace VERDE** (`Tests 29 passed (29)`). 3 `it` en jsdom: textos y `href` de los 3 enlaces; 6 filas
  (2 celdas, nombre no vacío, precio `^\d+ €$`) antes del enlace, 18 en total; primera fila de cada
  carta a mano. Sabotajes (acotados con `-t @s11`):
  - (x) MUTANTE flecha del `.map` de servicios devolviendo `undefined` → caen 2: `expected [] to have
a length of 6 but got +0` y `expected [ [], [], [] ] to deeply equal [ [ …(2) ], … ]`.
  - (y) un `<span />` metido en la carta tras el enlace → `expected <span></span> to be <a …(2)></a>`.
  - (z5) `href="#reserva"` → `expected '#reserva' to be '#reserva-titulo'`.

### @s12 — clases GLOBALES en el horneado (sección, cartas, enlaces)

- **Nace VERDE** (`Tests 32 passed (32)`). 3 `it`: el horneado se parsea en un `<template>` (se leen SUS
  atributos `class`, sin hidratar ni `toHaveClass`). Sabotajes = los TRES mutantes de template literal
  (acotados con `-t @s12`):
  - (z1) `` `demo-seccion ${…}` `` → ` `` ` → `expected '' to contain 'demo-seccion'`.
  - (z2) `` `demo-card ${…}` `` → ` `` ` → `expected '' to contain 'demo-card'`.
  - (z3) `` `demo-btn demo-btn--solido ${…}` `` → ` `` ` → `expected [ '' ] to include 'demo-btn'`.
  - (z4) solo se pierde `demo-btn--solido` → `expected [ 'demo-btn', '_reservar_173eaa' ] to include
'demo-btn--solido'`.
- **REFACTOR** — nada que limpiar.

### @s13 — honestidad de los `alt` (sin «foto de», sin salón, sin nombres, Depilación sin técnica)

- **Nace VERDE** (`Tests 36 passed (36)`): los `alt` de la tabla ya cumplen. 4 `it`, comparando en
  minúsculas y sin acentos (`normalize('NFD')`); «contiene» se lee literal (subcadena, lo más estricto).
- **Ajuste del test (en verde, antes de darlo por bueno)** — el primer borrador anclaba el `alt` de
  Depilación con su literal EXACTO: el sabotaje (D) caía por esa ancla y NUNCA por la negativa (la
  negativa era redundante, y el día que Pablo cambie el `alt` dejaría de proteger). El ancla pasa a
  «el bloque de Depilación tiene UNA `<img>` con `alt` no vacío» (el literal ya lo fija @s1).
- **Sabotajes** en `catalogo-demo.ts` (acotados con `-t @s13`):
  - (A) «Foto de manos con manicura…» → `@s13 ninguno empieza por…`: `expected true to be false`.
  - (B) Facial + «, resultado del salón» → `expected 'primer plano de pestanas largas sobre…' not to
contain 'del salon'`.
  - (C) Uñas + « de Lucia» → `expected 'manos con manicura en tono nude y ani…' not to contain 'lucia'`.
  - (D) Depilación «Pierna suave tras la cera tibia» → `expected 'pierna suave tras la cera tibia' not
to contain 'cera'`.
  - (E) Depilación «Pierna recién DEPILADA con crema» → `expected 'pierna recien depilada con crema'
not to contain 'depil'`.
- **REFACTOR** — nada más que limpiar.

### @s14 — datos: `foto` y `alt` por `clave` (Outline ×3)

- **Nace VERDE** (`src/lib/demo/catalogo-demo.test.ts`, `Tests 3 passed (3)`): los campos llegaron
  en los Verdes de @s1 (`alt`) y @s2 (`foto`). Aquí `CATALOGO_DEMO` es el SUJETO; lo esperado va a mano.
  Sabotajes: (F) fotos de Facial y Depilación intercambiadas → caen 2: `expected
'/src/assets/servicios/servicio-depila…' to contain 'servicio-facial-pestanas.jpg'` (y su simétrico);
  (G) `alt` de Facial con punto final → `expected 'Primer plano de pestañas largas sobre…' to be …`;
  (H) `foto: ''` en Uñas → `expected 0 to be greater than 0`.

### @s15 — datos: `LEYENDA_FOTOS` exacta, `LEYENDA_PRECIOS` intacta, orden de claves

- **Nace VERDE** (`Tests 6 passed (6)`): `LEYENDA_FOTOS` llegó en el Verde de @s7. Sabotajes: (I)
  `LEYENDA_FOTOS` con punto final → caen `@s15 LEYENDA_FOTOS…` (`expected 'Fotos de banco de
imágenes, ilustrati…' to be …`) y también `@s8` (`Unable to find an element with the text: Fotos de
banco…`); (J) claves `unas`/`facial` intercambiadas → `expected [ 'facial', 'unas', 'depilacion' ]
to deeply equal [ 'unas', 'facial', 'depilacion' ]`. La de precios ya se saboteó en (r)-(t) de @s9.

### @s16 — sin `foto` o sin `alt` NO compila (`@ts-expect-error` + `pnpm typecheck`)

- **Test** — en `catalogo-demo.test.ts`: dos categorías de prueba declaradas SIN anotación y asignadas
  después a `CategoriaDemo` bajo `// @ts-expect-error -- …` (una sin `foto`, otra sin `alt`), más un
  `it` que fija que cada una está completa salvo UN campo (`Object.keys` exactas). Dos trampas
  evitadas a propósito, anotadas en el propio test: (1) si el literal se anotara directamente, la
  comprobación de propiedades de más (TS2353) daría un error ajeno a la ausencia y la directiva nunca
  sobraría; (2) si las variables no se leyeran, TS6133 (`noUnusedLocals`) caería en la misma línea y
  taparía el error exigido. `pnpm vitest run` → `Tests 7 passed (7)`; `pnpm typecheck` → exit 0 (7,9 s).
- **Nace VERDE**: por el orden @s1 → @s16, `foto` y `alt` ya eran obligatorios (Verdes de @s1/@s2). El
  ROJO se demuestra con el propio Then del escenario, por sabotaje del tipo (con `pnpm typecheck`):
  - (K) `readonly foto?: string` → exit 2: `catalogo-demo.test.ts(95,1): error TS2578: Unused
'@ts-expect-error' directive.` (y TS18048 en @s14, `categoria.foto` posiblemente `undefined`).
  - (L) `readonly alt?: string` → exit 2: `catalogo-demo.test.ts(98,1): error TS2578: Unused
'@ts-expect-error' directive.`
  - (M) la interfaz de ANTES de F-27 (sin las dos líneas) → exit 2 con TS2578 en las líneas 95 Y 98
    (el Rojo «antes del cambio» que describe el `.feature`), además de TS2339/TS2353 en el componente,
    los datos y @s14.

### @s17 — fuente del componente: `estilos.foto` una vez y DENTRO de `<img … />`, sin `aria-hidden`/`.jpg`/`assets/`

- **ROJO** — `src/components/catalogo-fuente.test.ts` `@s17` (2 `it`): desde el Verde de @s5 el `<div>`
  (que llevaba la clase) ya no existe y la `<img>` aún no la lleva: `AssertionError: expected +0 to be
1 // Object.is equality`. `Tests 1 failed | 1 passed (2)` (la negativa nace verde, con ancla
  `export function Catalogo`).
- **VERDE** — `className={estilos.foto}` en la `<img>` (CF-2: la `<img>` ES el hueco). `Tests 38 passed
(38)` junto con `catalogo.test.tsx`.
- **Sabotajes** — (N) envoltorio `<div className={estilos.foto}><img …/></div>` (alternativa (a) de
  CF-2) → `no hay ningún <img antes de la clase del hueco: expected -1 to be greater than or equal to
0`; (O) hueco duplicado (`<div className={estilos.foto} />` + la `<img>` con clase) → `expected 2 to
be 1`; (P) `aria-hidden="false"` en la `<img>` → `not to contain 'aria-hidden'`; (Q) el componente
  importa `../assets/servicios/servicio-unas-manicura-nude.jpg` → `not to contain '.jpg'`. Revertidos.
- **REFACTOR** — nada que limpiar.

### @s18 — los tres `import` `.jpg` en la fuente de datos, estáticos y locales

- **Nace VERDE** (`Tests 4 passed (4)`): los `import` llegaron en el Verde de @s2. 2 `it` (exactamente
  tres; una ruta por fichero esperado; ninguna `http(s)://` ni `//`, con ancla de 3). Sabotajes en
  `catalogo-demo.ts` (acotados con `-t @s18`):
  - (R) Facial como CADENA `'/src/assets/servicios/servicio-facial-pestanas.jpg'` en vez de `import`
    (alternativa (b) de CF-3: @s14 seguiría verde y `dist/` se quedaría sin la foto) → caen los 2:
    `expected [ …(2) ] to have a length of 3 but got 2`.
  - (S) el `import` de Facial apunta al fichero de Uñas → `assets/servicios/servicio-unas-manicura-nude.jpg:
expected [ …(2) ] to have a length of 1 but got 2`.
  - (T) `import` desde `https://cdn.example.com/assets/servicios/servicio-facial-pestanas.jpg` → `not to
match /^(?:https?:)?\/\//`.

### @s19 — los tres JPEG miden 800 × 1000 (SOF) y no llevan EXIF

- **Nace VERDE** (`Tests 10 passed (10)`): los ficheros ya estaban bien (lo midió el gherkin_author:
  SOF2, 800 × 1000, sin APP1). 6 `it` (2 por fichero) con un lector de cabecera JPEG propio del test
  (`segmentosJpeg`: de SOI a SOS, salta relleno `FF`); SOF0/SOF1/SOF2 aceptados; alto en el byte 1 y
  ancho en el 3 de los datos del SOF. Sabotajes sobre los BYTES del fichero (restaurados y comprobados;
  `git status` limpio en `src/assets/`):
  - (U) `servicio-unas-manicura-nude.jpg` sustituido por `trabajos/equipo-pedicura.jpg` (800 × 600) →
    `expected 600 to be 1000 // Object.is equality` y, además, `expected [ { marcador: 225, …(1) } ] to
have a length of +0 but got 1` (¡esa foto de equipo LLEVA EXIF!).
  - (V) APP1 `Exif\0\0MM…` insertado tras el SOI de `servicio-depilacion-piel-suave.jpg` → `expected [ {
marcador: 225, …(1) } ] to have a length of +0 but got 1`.
- **Hallazgo fuera de alcance (para el lead)**: comprobación de solo lectura con el mismo lector → los
  13 JPEG de `src/assets/trabajos/` (equipo y galería) llevan un segmento APP1 `Exif`. Los tres de
  `servicios/` no. F-27 no los toca; si importa (autor/cámara/ubicación publicados), es otra tarea.

> **Relevo (2026-09-30).** El primer `tdd_craftsman` se cortó en mitad de @s20 (interrupción del
> humano) tras escribir `catalogo-estilos.test.ts` y el cambio de `.foto` en la hoja, sin dejar la
> evidencia. Un segundo `tdd_craftsman` retoma desde aquí: NO rehace nada; comprueba el verde, reproduce
> el Rojo contra la hoja de `HEAD` y demuestra que muerde con sabotajes. Todos los sabotajes de @s20 y
> @s21 los aplica y revierte un script de scratchpad (`sabotajes.mjs`, escritura por `node`, sin
> disparar el hook): copia previa de la hoja, restauración tras cada uno y `cmp` final contra la copia
> → IDÉNTICA; `git diff --stat` de la hoja = el mismo `4 insertions(+), 1 deletion(-)` de antes.

### @s20 — el bloque `.foto` declara lo que hace que la foto cubra el hueco 4:5 (Outline ×8)

- **Test** — `src/components/catalogo-estilos.test.ts`, `describe('@s20 …')`: un `it` por fila del
  Examples (8). Lee los BYTES de la hoja, extrae el cuerpo del PRIMER `.foto {` contando llaves
  (`cuerpoDelBloque`, patrón de `equipo-estilos.test.ts`) y casa la declaración con
  `patronDeDeclaracion` (propiedad completa, espacios libres alrededor de «:», «,» y «/», termina en
  «;»).
- **ROJO** (reproducido contra la hoja de `HEAD`, la de antes de F-27, `git show HEAD:…` escrita en su
  sitio y restaurada) — `pnpm vitest run src/components/catalogo-estilos.test.ts` → `Tests 7 failed | 6
passed (13)`. Caen los 4 `it` de @s20 cuyas declaraciones faltaban:
  - `"display: block"`: `AssertionError: expected '\n  aspect-ratio: 4 / 5;\n  border-ra…' to match
/(?:^|[\s;{])display\s*:\s*block\s*;/`
  - `"width: 100%"`: `… to match /(?:^|[\s;{])width\s*:\s*100%\s*;/`
  - `"height: auto"`: `… to match /(?:^|[\s;{])height\s*:\s*auto\s*;/`
  - `"object-fit: cover"`: `… to match /(?:^|[\s;{])object-fit\s*:\s*cover\s*;/`
  - (y 3 de @s21, abajo). Los otros 4 de @s20 (`aspect-ratio`, `border-radius`, `border`, `background`)
    nacen verdes: ya estaban antes de F-27 y son GUARDAS (que no se pierdan al tocar el bloque).
- **VERDE** — en `.foto`: `+ display: block; width: 100%; height: auto; object-fit: cover;` (CF-C3).
  `pnpm vitest run src/components/catalogo-estilos.test.ts` → `Test Files 1 passed (1)`, `Tests 13
passed (13)`.
- **Sabotajes** (acotados al fichero; cada uno sobre la hoja ACTUAL, revertido):
  - (b) quitar `object-fit: cover;` → `Tests 3 failed | 10 passed (13)`: `@s20 … declara "object-fit:
cover"` (`expected '\n  display: block;\n  width: 100%;\n…' to match
/(?:^|[\s;{])object-fit\s*:\s*cover\s*;/`) y, por su ANCLA positiva, los dos de @s21 que la usan
    (`@s21 .foto NO contiene "object-position"…` y `@s21 .foto NO contiene "transition"…`: `expected
'\n  display: block;\n  width: 100%;\n…' to contain 'object-fit'`).
  - (c) quitar `aspect-ratio: 4 / 5;` → `Tests 1 failed | 12 passed (13)`: `@s20 el cuerpo de .foto
declara "aspect-ratio: 4 / 5"` (`expected '\n  display: block;\n  width: 100%;\n…' to match
/(?:^|[\s;{])aspect-ratio\s*:\…/\s*5\s*;`).
  - (h) `height: auto` → `height: 400px` → `Tests 2 failed | 11 passed (13)`: `@s20 … "height: auto"`
    (`… to match /(?:^|[\s;{])height\s*:\s*auto\s*;/`) y `@s21 … su única declaración de alto es
"height: auto"` (`expected ' height: 400px;' to match /(?:^|[\s;{])height\s*:\s*auto\s*;/`).
- **REFACTOR** — nada que limpiar en el test. En la hoja, el comentario de encima de `.foto` (y el de
  cabecera) decían «placeholder rosa… sin fotos reales todavía», DESFASADO desde F-27: se reescriben
  (solo texto) para decir la verdad: la `<img>` ES el hueco y el degradado queda de fondo si la foto no
  carga (@s26). Se re-ejecuta el fichero tras el cambio (ver «Resultado final»).

### @s21 — `.foto` sin alto mínimo, sin mover el encuadre, sin animar; rejilla de F-08 intacta

- **Test** — `describe('@s21 …')`, 5 `it`: exactamente UN bloque `.foto` en la hoja (regex
  `\.foto\b[^{};]*\{`, cuenta también selectores anidados o en lista); `.foto` sin `min-height` ni
  `max-height` y con UNA sola declaración de alto, `height: auto`; sin `object-position` (ancla:
  `object-fit`); sin `transition` ni `animation` (misma ancla); `.rejilla` sigue declarando
  `grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr))`.
- **ROJO** (hoja de `HEAD`, misma pasada que @s20) — caen 3:
  - `@s21 .foto NO contiene "min-height" ni "max-height"…`: `AssertionError: expected '\n
aspect-ratio: 4 / 5;\n  border-ra…' not to contain 'min-height'` (el `min-height: 260px` de antes).
  - `@s21 .foto NO contiene "object-position"…` y `@s21 .foto NO contiene "transition"…`: `expected '\n
aspect-ratio: 4 / 5;\n  border-ra…' to contain 'object-fit'` (el ancla aún no existía).
  - Nacen verdes (guardas): «exactamente un bloque» y la rejilla de F-08.
- **VERDE** — en `.foto`: `- min-height: 260px;` (y el `object-fit` de @s20). `Tests 13 passed (13)`.
- **Sabotajes** (sobre la hoja ACTUAL, revertidos):
  - (a) devolver `min-height: 260px;` al final de `.foto` → `Tests 1 failed | 12 passed (13)`: `@s21
.foto NO contiene "min-height" ni "max-height", y su única declaración de alto es "height: auto"`
    (`AssertionError: expected '\n  display: block;\n  width: 100%;\n…' not to contain 'min-height'`).
  - (d) añadir `object-position: top;` → `Tests 1 failed | 12 passed (13)`: `@s21 .foto NO contiene
"object-position" (encuadre centrado por defecto)` (`expected '\n  display: block;\n  width:
100%;\n…' not to contain 'object-position'`).
  - (e) tocar la rejilla de F-08: `minmax(min(300px, 100%), 1fr)` → `minmax(300px, 1fr)` (la de antes
    de F-08, que desborda a 320 px) → `Tests 1 failed | 12 passed (13)`: `@s21 .rejilla sigue
declarando "grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr))"` (`expected '\n
display: grid;\n  grid-template-c…' to match /(?:^|[\s;{])grid-template-columns\s*:…/`).
  - (f) segundo bloque `.carta + .foto { opacity: 0.95; }` antes de `.leyenda` → `Tests 1 failed | 12
passed (13)`: `@s21 la hoja contiene EXACTAMENTE un bloque .foto` (`expected [ '.foto {', '.foto {'
] to have a length of 1 but got 2`).
  - (g) `transition: transform 0.3s ease;` en `.foto` → `Tests 1 failed | 12 passed (13)`: `@s21 .foto
NO contiene "transition" ni "animation": nada se mueve` (`expected '\n  display: block;\n  width:
100%;\n…' not to contain 'transition'`).
  - Y (h) de @s20 (`height: 400px`) también cae aquí, en «su única declaración de alto».
- **REFACTOR** — nada que limpiar.

## Mapa de trazabilidad @s → test

| @s        | Fichero                                   | Tests (`it`)                                                                                                                            |
| --------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| @s1       | `src/components/catalogo.test.tsx`        | `@s1 <clave>: el bloque de "<título>" contiene exactamente una <img> …` (×3)                                                            |
| @s2       | `src/components/catalogo.test.tsx`        | `@s2 hay tres alt … y tres src distintos`                                                                                               |
| @s3       | `src/components/catalogo.test.tsx`        | `@s3 hay tres src…`, `@s3 ningún src empieza por…`, `@s3 el horneado…`                                                                  |
| @s4       | `src/components/catalogo.test.tsx`        | `@s4 las tres <img> declaran…`, `@s4 ninguna <img> declara "fetchpriority"…`                                                            |
| @s5       | `src/components/catalogo.test.tsx`        | `@s5 el contenedor de la carta de "<CTA>" tiene EXACTAMENTE dos hijos…` (×3), `@s5 en todo el catálogo no queda ningún aria-hidden…`    |
| @s6       | `src/components/catalogo.test.tsx`        | 4 `it` `@s6` (imágenes por rol, `<h3>` exactos, nada bajo `h3`/`a`, región «Servicios»)                                                 |
| @s7       | `src/components/catalogo.test.tsx`        | `@s7 el horneado trae…`, `@s7 título < CTA < alt…`                                                                                      |
| @s8       | `src/components/catalogo.test.tsx`        | `@s8 el texto es el contenido COMPLETO de un único <p>…`                                                                                |
| @s9       | `src/components/catalogo.test.tsx`        | `@s9 su <p> dice EXACTAMENTE el literal de F-09…`, `@s9 el párrafo de precios NO contiene…`                                             |
| @s10      | `src/components/catalogo.test.tsx`        | 4 `it` `@s10` (`<section>`, único `id`, 0/1/3 encabezados, rótulos)                                                                     |
| @s11      | `src/components/catalogo.test.tsx`        | 3 `it` `@s11` (3 CTA, 6 filas por carta, primera fila)                                                                                  |
| @s12      | `src/components/catalogo.test.tsx`        | 3 `it` `@s12` (`demo-seccion`, `demo-card`, `demo-btn`/`demo-btn--solido`)                                                              |
| @s13      | `src/components/catalogo.test.tsx`        | 4 `it` `@s13` («foto de», «del salón», nombres, Depilación sin técnica)                                                                 |
| @s14      | `src/lib/demo/catalogo-demo.test.ts`      | `@s14 <clave>: alt exactamente … y una foto no vacía …` (×3)                                                                            |
| @s15      | `src/lib/demo/catalogo-demo.test.ts`      | 3 `it` `@s15` (`LEYENDA_FOTOS`, `LEYENDA_PRECIOS`, orden de claves)                                                                     |
| @s16      | `src/lib/demo/catalogo-demo.test.ts`      | 2 `@ts-expect-error` (sin `foto`, sin `alt`) + `pnpm typecheck`; `it` `@s16 cada categoría de prueba está COMPLETA salvo por UN campo…` |
| @s17      | `src/components/catalogo-fuente.test.ts`  | `@s17 "estilos.foto" aparece EXACTAMENTE una vez…`, `@s17 la fuente NO contiene "aria-hidden"…`                                         |
| @s18      | `src/components/catalogo-fuente.test.ts`  | `@s18 hay EXACTAMENTE tres…`, `@s18 ninguna ruta de import empieza por…`                                                                |
| @s19      | `src/components/catalogo-fuente.test.ts`  | `@s19 <fichero>: su marcador SOF declara…` (×3), `@s19 <fichero>: ningún segmento APP1…` (×3)                                           |
| @s20      | `src/components/catalogo-estilos.test.ts` | `@s20 el cuerpo de .foto declara "<declaración>"` (×8)                                                                                  |
| @s21      | `src/components/catalogo-estilos.test.ts` | 5 `it` `@s21` (un solo `.foto`, alto, `object-position`, `transition`/`animation`, `.rejilla`)                                          |
| @s22-@s26 | — (`@verificacion-viva`)                  | Los hace el lead en Chrome real sobre `dist/`. No se fingen en jsdom.                                                                   |

## Configuración de mutación (CF-5) — sin ejecutar Stryker

- `stryker.config.json` → `mutate` += `"src/components/Catalogo.tsx"` (al final de la lista explícita).
  `catalogo-demo.ts` es DATO y sigue FUERA (como `equipo-demo.ts`), según la cabecera del `.feature`.
- `vitest.config.ts` → `coverage.include` NO se toca: hoy es `['src/lib/**/*.ts',
'src/components/**/*.tsx']` (glob), que YA incluye `Catalogo.tsx`. El precedente «son dos listas» (F-06,
  `project-spec.md` §2621) es de cuando `coverage.include` era solo `['src/lib/**/*.ts']`.
- `vitest.stryker.config.ts` solo excluye `*-horneado.test.*`: los cuatro ficheros de test de F-27
  entran en la mutación.

### Mutantes esperados → test que los mata (tabla MUTACIÓN de la cabecera del `.feature`)

| Mutante esperado en `Catalogo.tsx`                                                                     | Test(s) que lo matan                                                                                                                                       | Evidencia                                  |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `ID_SERVICIOS = 'servicios-titulo'` → `""`                                                             | `@s10 hay EXACTAMENTE una <section> y declara aria-labelledby="servicios-titulo"`, `@s10 el ÚNICO id del catálogo es "servicios-titulo"…` (literal a mano) | sabotaje (u) de @s10                       |
| `` `demo-seccion ${…}` `` → ` `` `                                                                     | `@s12 el class de la <section> contiene "demo-seccion"`                                                                                                    | sabotaje (z1) de @s12                      |
| `` `demo-card ${…}` `` → ` `` `                                                                        | `@s12 el class de cada una de las tres cartas … contiene "demo-card"`                                                                                      | sabotaje (z2) de @s12                      |
| `` `demo-btn demo-btn--solido ${…}` `` → ` `` `                                                        | `@s12 el class de cada uno de los tres enlaces contiene "demo-btn" y "demo-btn--solido"`                                                                   | sabotajes (z3), (z4) de @s12               |
| flecha del `.map` de categorías → `() => undefined`                                                    | `@s1 …` (×3, recuento de `<img>`), `@s10 hay 0 <h1>, 1 <h2> y EXACTAMENTE 3 <h3>…`, `@s10 los tres rótulos…` (y, de rebote, @s5, @s6, @s7, @s11)           | sabotaje (v) de @s10                       |
| flecha del `.map` de servicios → `() => undefined`                                                     | `@s11 cada carta tiene EXACTAMENTE seis filas…`, `@s11 la primera fila de cada carta es…`                                                                  | sabotaje (x) de @s11                       |
| Lo nuevo de F-27 (`width`/`height` numéricos, `loading="lazy"`, `className`/`src`/`alt` de la `<img>`) | No crea mutantes (atributos JSX literales E1.d, literales numéricos A-14): lo protegen @s1, @s4, @s17 igualmente                                           | sabotajes (d), (e) de @s4; (N)-(Q) de @s17 |

La puntuación real (umbral 1.0) la mide el `mutation_tester`; aquí NO se ha ejecutado Stryker.

## Resultado final (2026-09-30) — VERDE

- `pnpm vitest run src/components/catalogo-estilos.test.ts` (tras reescribir los comentarios de la
  hoja) → `Tests 13 passed (13)`.
- `pnpm typecheck` → exit 0. `pnpm lint` → exit 0.
- `pnpm format:check` → en la primera pasada, exit 1: `catalogo-fuente.test.ts` y `catalogo.test.tsx`
  (del primer `tdd_craftsman`) no tenían el formato de Prettier. Se les pasa `prettier --write`: el
  `diff` contra la copia previa es SOLO de saltos de línea (6 sitios; ninguna aserción cambia). Segunda
  pasada → `All matched files use Prettier code style!`.
- Suite completa, UNA vez (`bin/harness test`) → exit 0, `Test Files 55 passed (55)`, `Tests 1760
passed (1760)` (98,8 s).
- Cambios de esta sesión de relevo: `catalogo.module.scss` (solo comentarios: cabecera y encima de
  `.foto`), `stryker.config.json` (`mutate` += `Catalogo.tsx`), formato de los dos tests citados, esta
  bitácora y `progress/current.md`. Sin commit (lo hace el lead). `vitest.config.ts` sin tocar (su glob
  ya cubre `Catalogo.tsx`).
- Siguiente: `judge` → `mutation_tester` (`--mutate src/components/Catalogo.tsx`) → en vivo @s22-@s26
  (lead). NO se marca `done`.

## Ronda delta (judge B1, N1-N3; en vivo H-1)

> 2026-09-30, `tdd_craftsman`. Entrada: `progress/judge_catalogo_fotos.md` (CHANGES_REQUESTED: B1 y
> N1-N3; N4-N8 se quedan como están) y `progress/verificacion_viva_catalogo_fotos.md` (H-1). Se
> empieza cuando ya no queda Stryker vivo (`pgrep -f stryker` vacío; el `mutation_tester` cerró con
> 7/7 contra `5482984`). Sabotajes por script de scratchpad (`delta_sab.mjs`: aplica UNO, exige una
> sola coincidencia, corre el test acotado, restaura y compara bytes → `restaurado=true`), sin
> disparar el hook.

### B1 — @s8/@s9: «aparece EXACTAMENTE UNA VEZ en el catálogo» (solo test)

- **ANTES (B1 reproducido, tests de `5482984`)** — con los dos sabotajes del judge en `Catalogo.tsx`,
  tras el `<p>` de fotos:
  - `b1-fotos`: `<p className={estilos.leyenda}>Nota: {LEYENDA_FOTOS}</p>` → `-t @s8`: `Tests 1
passed | 35 skipped (36)`; el fichero entero: `Tests 36 passed (36)`. `restaurado=true`.
  - `b1-precios`: `<p className={estilos.leyenda}>Nota: {LEYENDA_PRECIOS}</p>` → `-t @s9`: `Tests 2
passed | 34 skipped (36)`; el fichero entero: `Tests 36 passed (36)`. `restaurado=true`.
  - Confirmado: `getAllByText(<cadena>)` cuenta ELEMENTOS cuyo texto completo es la leyenda; un
    duplicado como fragmento de otro `<p>` no cuenta.
- **Cambio (solo `catalogo.test.tsx`)** — helper `apariciones(texto, literal)` (`split(literal).length
  - 1`: cuenta APARICIONES, también como fragmento) y, en el `it`de @s8 y en el primer`it`de @s9,`render`pasa a`const { container } = render(<Catalogo />)`y se añade, ANTES de las aserciones
que ya había (todas se conservan),`expect(apariciones(container.textContent ?? '',
    <LITERAL_A_MANO>), '<mensaje>').toBe(1)`. El número de `it` no cambia (36).
- **Fuente actual** → `pnpm vitest run src/components/catalogo.test.tsx`: `Tests 36 passed (36)`.
- **ROJO (con los mismos sabotajes, fichero entero)**:
  - `b1-fotos` → `Tests 1 failed | 35 passed (36)`: `@s8 el texto es el contenido COMPLETO de un
único <p>…`: `AssertionError: apariciones de la leyenda de fotos en el texto del catálogo: expected
2 to be 1 // Object.is equality`. `restaurado=true`.
  - `b1-precios` → `Tests 1 failed | 35 passed (36)`: `@s9 su <p> dice EXACTAMENTE el literal de F-09…`:
    `AssertionError: apariciones de la leyenda de precios en el texto del catálogo: expected 2 to be 1
// Object.is equality`. `restaurado=true`.
- Producción intacta: `git status` solo marca `catalogo.test.tsx` y esta bitácora; `git diff
src/components/Catalogo.tsx` vacío.

### N1-N3 — mismo fichero, sin cambiar lo que se asevera

- **N1** — cabecera: el comentario FALSO («`css: false` deja las clases del módulo en `undefined`») pasa
  a decir la verdad: con `css: false` salen `_<clase>_<hash>` (ya visto en (q) de @s8 y en (z4) de
  @s12); la regla anti-`toHaveClass` sigue POR DISEÑO, porque una clase no es comportamiento.
- **N2** — fuera `expect(hijos[1].parentElement).toBe(contenedor)` de @s5: tautológica (todo hijo de
  `contenedor.children` tiene a `contenedor` por padre). «Hija DIRECTA» la siguen probando
  `toHaveLength(2)`, `hijos[0]` = carta y `hijos[1].tagName` = `IMG`.
- **N3** — `normalizado`: la regex con U+0300 y U+036F LITERALES (invisibles; bytes `314 200`-`315
257`) pasa a `/\p{Diacritic}/gu`, como `src/lib/placeholders.ts:58`. (La forma `̀-ͯ` no
  se pudo escribir con la herramienta `Edit`: el escape se decodificaba al carácter.) Equivalencia
  comprobada con `node` sobre los 3 `alt`, las 4 prohibidas, los 7 nombres y los sabotajes de @s13:
  mismas salidas. Ya no queda ningún byte `CC 80` en el fichero. Que la normalización sigue
  MORDIENDO (solo caen si se quitan los diacríticos, porque la tilde está en un lado y no en el otro):
  - `n3-lucia` (Uñas + « de Lucia», sin tilde, contra `'Lucía'`) → `-t @s13`: `Tests 1 failed | 3
passed | 32 skipped (36)`: `expected 'manos con manicura en tono nude y ani…' not to contain
'lucia'`. `restaurado=true`.
  - `n3-salon` (Facial + « del salon», sin tilde, contra `'del salón'`) → `Tests 1 failed | 3 passed |
32 skipped (36)`: `expected 'primer plano de pestanas largas sobre…' not to contain 'del salon'`.
    `restaurado=true`.

### H-1 (en vivo) — la `<img>` computa `content-box` y sobresale 2 px de su columna (@s5, @s23)

Arreglo DENTRO del contrato aprobado: @s5 («ocupa el sitio del antiguo bloque») y la cifra de @s23
(≈ 272 × 340 a 320 px). No añade escenario.

- **ROJO** — `catalogo-estilos.test.ts`, `describe('@s5/@s23 H-1 (verificación en vivo): la caja del
hueco incluye el borde')`, un `it` con el mismo helper y patrón que @s20 (`cuerpoDelBloque` +
  `patronDeDeclaracion('box-sizing: border-box')`) → `pnpm vitest run
src/components/catalogo-estilos.test.ts`: `Tests 1 failed | 13 passed (14)`: `@s5/@s23 el cuerpo de
.foto declara "box-sizing: border-box"`: `AssertionError: expected '\n  display: block;\n  width:
100%;\n…' to match /(?:^|[\s;{])box-sizing\s*:\s*border-b…/`.
- **VERDE** — en `catalogo.module.scss`, `box-sizing: border-box;` en `.foto` (tras `display: block;`)
  y UNA línea más en el comentario de encima: «El borde va DENTRO del ancho (border-box): si no, la
  foto sobresale 2 px de su columna (H-1).» (sin `.foto` ni `;` en el comentario, para no tocar el
  recuento de bloques de @s21) → `Tests 14 passed (14)`.
- **Sabotajes** (sobre la hoja en verde; copia `scss_verde.bak` y `cmp` final → IDÉNTICA):
  - `h1-sin-border-box` (quitar la línea) → `Tests 1 failed | 13 passed (14)`, el mismo mensaje del
    ROJO. `restaurado=true`.
  - `h1-content-box` (`box-sizing: content-box;`, el valor que se midió en vivo) → `Tests 1 failed | 13
passed (14)`: `expected '\n  display: block;\n  box-sizing: co…' to match
/(?:^|[\s;{])box-sizing\s*:\s*border-b…/`. `restaurado=true`.
- **REFACTOR** — nada que limpiar. La RE-MEDIDA en vivo (272 × 340 a 320 px; borde derecho de la foto
  = el de la carta) queda para el lead (I-8): jsdom no calcula cajas.
