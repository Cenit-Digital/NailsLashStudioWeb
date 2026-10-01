# Verificación EN VIVO — F-25 `logo_acoplado` (+ ENMIENDAS E-1 y E-2) · 2026-09-30

> La hace el `craftsman_lead` (I-8: `pnpm build` → servir → navegador real). Cubre los escenarios
> `@verificacion-viva` de `features/logo_acoplado.feature`: @s28-@s33 y, de la ENMIENDA E-1, @s39-@s41.

## Montaje

- **Artefacto:** `pnpm build` sobre `4b6cb60`, exit 0, con las 5 puertas en verde (cascarón, placeholders,
  contraste con 18 pares, terceros y anclas vivas). Servido con `vite preview` en
  `http://localhost:4173/NailsLashStudioWeb/`.
- **Navegador:** Chromium 141 (`/opt/pw-browsers/chromium`) con Playwright y CDP (`Accessibility.getFullAXTree`,
  `emulateMedia`, `javaScriptEnabled: false`, `route` para bloquear Great Vibes). `deviceScaleFactor` 1.
- **Script:** `vivo_f25.mjs` del scratchpad de la sesión. Resultado: **56 comprobaciones, 54 ✓ y 2 ✗**. Los
  dos ✗ se explican abajo; ninguno es un defecto de F-25.
- **Corrección del propio arnés, declarada:** la primera pasada de @s29 con pasos de 100 px «falló» porque
  `html { scroll-behavior: smooth }` convierte `window.scrollTo(0, y)` en un desplazamiento suave: el bucle
  medía antes de llegar. Se instrumentó el `IntersectionObserver` para confirmarlo (y = 2, 10, 18… tras pedir 100) y se pasó a `scrollTo({ behavior: 'instant' })`, que es lo que pide el escenario. En @s33 el primer
  recuento de «Nails Lash» miraba TODO el árbol: los dos nodos eran del `<h1>` del hero, que es su sitio. Se
  acotó a los descendientes del enlace, que es lo que pide el `Then`.

## Resultados por escenario

| @s   | Resultado                   | Lo medido                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @s28 | ✓                           | HTML crudo: `data-logo="texto"`, `data-vuelo="no"`, `href="/NailsLashStudioWeb/"`, 2 `<span>` + `<svg>`, sin `style`. Tras hidratar sigue en «texto» y sin avisos de hidratación. Sin JS se ve «nails lash studio» y la nav (8 enlaces). Firma: `text-transform: none`, `letter-spacing: normal`; horizontalmente cabe en el `viewBox` (x −30 → 3978,6 dentro de −80 → 4040). **Nota:** `getBBox()` de un `<text>` mide la caja de la FUENTE (ascendente + descendente ≈ 1,23 em = 1230 u), no la tinta, así que en vertical es imposible por construcción que quepa en 1200 u; el recorte vertical se juzgó con captura ampliada ×3: la firma está entera. Consola: un `404` que es `/favicon.ico` (ver hallazgos).                                                                                                                                                                                      |
| @s29 | ✓                           | A 1280 × 800 y 320 × 640, con pasos de 1, 2 y 100 px: el acople nunca se pierde (D-1). Mientras asoma «STUDIO», sigue en «texto». Acopla en el fotograma exacto (1280: borde 70,8 ≤ línea 71; 320: 74,63 ≤ 75), sin asomar bajo la cabecera. Animaciones: EXACTAMENTE `acoplar` 900 ms `cubic-bezier(0.45, 0, 0.25, 1)` en el `<svg>` y `soltar` 400 ms `linear` en el texto. Primer fotograma sobre el rótulo del hero (x 364 = x del rótulo; 320: 62,8 = 62,8) con opacidad 0,35; al final, `transform: none` y opacidad 1. Desbordamiento horizontal 0 en todos los fotogramas. Scroll durante el vuelo: el destino no cambia (40, 15, 137,3 × 40 en los dos casos) y las custom properties tampoco. Enlace de la nav con scroll suave: acopla en y = 778 y la página sigue bajando (1232) mientras vuela. Hero a medias: acopla con `data-firma="corriendo"` y el hero termina en «reloj» a los 16 s. |
| @s30 | ✓                           | Al volver arriba se queda la caligrafía y el rótulo está en su sitio (P2). Recargar arriba → «texto». Recargar a mitad (y = 1500) → «caligrafia», `data-vuelo="no"`, sin animaciones. Ancla `#contacto-titulo` → igual, sin vuelo. Clic en el logo → `/NailsLashStudioWeb/` en «texto». Atrás desde bfcache (`back_forward`) → conserva «caligrafia».                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| @s31 | ✓                           | Con `reduce`: acopla con `data-vuelo="si"`, SIN animaciones en el `<svg>` ni en el texto y opacidad 1 (instantáneo). `reduce` a mitad de vuelo → `transform: none`, opacidad 1, sin animaciones. **Observación D-3** (caso aceptado, no contrato): al retirar `reduce` con el logo ya acoplado, el vuelo `acoplar` se reproduce una vez, como se previó.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| @s32 | ✓                           | A 320/360/375/390/414/768/1280: alto de la cabecera IDÉNTICO en los dos estados (75, 75, 75, 75, 75, 75 y 71 px, todos ≤ 76), caja del `<a>` idéntica (158,3 × 40), `<svg>` de 40 px, CLS acumulado **0**, una sola fila (diferencia de centros 0). Con Great Vibes bloqueada, los mismos altos y anchos.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| @s33 | ✓                           | En los dos estados hay EXACTAMENTE un `link` «Nails Lash Studio», cuyo único texto accesible es el del `<span>` para lectores (1 StaticText); ningún descendiente aporta «Nails Lash». El `<svg>` computa `pointer-events: none` y `elementFromPoint` en su centro durante el vuelo no lo devuelve. `document.fonts.check('33px "Great Vibes"')` es true y hay 0 peticiones a otros orígenes. Legibilidad a 320 y 1280 px: los trazos finos se leen bien (juicio del lead con captura).                                                                                                                                                                                                                                                                                                                                                                                                                   |
| @s39 | ✓ salvo 821                 | 320, 360, 375, 392, 394, 414 y 430: 75 px en una fila, «Reservar» en el DOM con `display: none`, 0 × 0, 0 nodos «Reservar» en el árbol de accesibilidad, Tab desde «Menú» sale de la cabecera; igual sin JS. 431, 768 y 820: «Reservar» visible (99 × 39), dentro del viewport, 1 nodo accesible, Tab desde «Menú» → «Reservar»; una fila de 75 px. 1280: una fila de 71 px. **821: ✗, 126 px en DOS filas** (ver hallazgo H-1).                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| @s40 | ✓                           | A 320, 390 y 430 × 640: `scroll-padding-top` 96 px; en los 7 saltos de ancla y en «Reservar cita» la cabecera mide 75 px y el título queda por debajo de su borde (p. ej., top 96 ≥ 75).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| @s41 | ✓ (430) / ✓ funcional (320) | A 320 y 430: «Reservar cita» del hero → `#reserva-titulo`; «Menú» → `aria-expanded="true"` y «Reserva» → `#reserva-titulo`; el lanzador de Nailbot (76 px, dentro del viewport) abre el `<dialog>`. El ✗ de 320 es SOLO el 404 del favicon en la consola de la primera carga (hallazgo H-2).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Hallazgos

- **H-1 · La franja de 821 a 891 px ya partía la cabecera en DOS filas ANTES de F-25.** Medido con la
  producción de `d07e4ea`, justo antes de F-25, construida y servida igual, con Gilda Display cargada:
  - 821–891 px → 113 px en dos filas;
  - una fila solo desde 892 px.

  Con F-25, la misma franja mide 126 px: son los mismos +13 px del logo de 2,5 rem que ya se vieron en móvil
  antes de E-1. La causa es la medida en la que F-06 basó el corte de 820 px («la nav envuelve en la banda
  793–806 px»): ya no es válida con 7 enlaces, «Reservar» y la marca con su fuente real (158 px de ancho).
  Es el mismo problema que E-1 resolvió en móvil. Hay que llevarlo a la puerta humana. La vía natural es
  subir el corte de la hamburguesa por encima de 891 px con margen; por ejemplo, 920 px.

- **H-2 · `/favicon.ico` da 404.** La web no declara icono y Chrome lo pide por su cuenta. Ya ocurría antes
  de F-25 y no tiene nada que ver con él. Solo ensucia la consola: no es un aviso de hidratación ni un error
  de la app. Se queda como tarea aparte.
- **Medición anterior corregida.** En la primera comparación con la versión anterior (servidor `vite` de
  desarrollo), la marca medía 142 px porque Gilda Display no había cargado (`fonts.check` false). Con la
  producción servida, las dos versiones miden 158,3 px. Las conclusiones de E-1 no cambian: los 118 → 131 px
  de móvil dependen del alto del logo, no de su ancho.

## Estado de F-25 tras la primera pasada (histórico)

- @s28-@s33 y @s40-@s41: verificados en vivo.
- @s39: cumplía en móvil (E-1) y en escritorio, pero NO a 821 px por H-1. Pablo decidió la ENMIENDA E-2
  («Menú hasta 920 px»), que se verifica abajo.

## Re-verificación final tras la ENMIENDA E-2 · 2026-09-30

### Montaje

- **Artefacto:** `pnpm build` sobre `dd5a248` (E-2 en `199ca7a`), exit 0 y las 5 puertas en verde. En el CSS
  horneado hay un solo `max-width:920px` (menú), un `max-width:430px` (E-1) y un `max-width:820px` (el `tel:` de
  contacto, que no se mueve).
- **Copia INMUTABLE:** `dist/` se copió al scratchpad y se sirvió con
  `vite preview --outDir <copia> --port 4175`. Se guardó la huella MD5 de sus 33 ficheros y, al terminar, la
  copia seguía **intacta**. La razón está en el hallazgo H-3.
- **Script:** `vivo_f25.mjs todos` (el mismo de la primera pasada, más @s43 y las filas nuevas de @s39).
  Resultado: **62 comprobaciones, 62 ✓ y 0 ✗**, más la observación D-3 de @s31, que sigue igual.

### Resultados

| @s   | Resultado | Lo medido                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @s28 | ✓ (4)     | Igual que en la primera pasada: HTML crudo, hidratación sin avisos, firma entera, sin JS. En la consola sigue el `404` de `/favicon.ico` (H-2).                                                                                                                                                                                                                                                                                                 |
| @s29 | ✓ (9)     | 1280 y 320 con pasos de 1, 2 y 100 px: acopla en el fotograma exacto, `acoplar` 900 ms y `soltar` 400 ms, primer fotograma sobre el rótulo con opacidad 0,35, sin desbordamiento. El ✗ de 320/100 px de una pasada intermedia se debía a H-3 (página cargada con `dist/` a medio reescribir): con la copia inmutable, `acopla: true`.                                                                                                           |
| @s30 | ✓ (6)     | P2 (se queda al volver arriba), recarga arriba y a mitad, ancla sin vuelo, clic en el logo y bfcache.                                                                                                                                                                                                                                                                                                                                           |
| @s31 | ✓ (2)     | `reduce` instantáneo y `reduce` en caliente. D-3, igual que antes.                                                                                                                                                                                                                                                                                                                                                                              |
| @s32 | ✓ (14)    | 320/360/375/390/414/768/1280, con y sin Great Vibes: el mismo alto en los dos estados (75 px; 71 px a 1280), caja del `<a>` idéntica (158,3 × 40), CLS 0.                                                                                                                                                                                                                                                                                       |
| @s33 | ✓ (3)     | Un solo `link` «Nails Lash Studio» en los dos estados, `pointer-events: none`, fuente propia y 0 peticiones a terceros.                                                                                                                                                                                                                                                                                                                         |
| @s39 | ✓ (17)    | 320–430: 75 px sin «Reservar» (E-1). 431, 768, 820, **821, 860, 890, 907 y 920**: 75 px en UNA fila con «Menú» y «Reservar», y Tab de «Menú» a «Reservar». **921** y 1280: nav horizontal en una fila de 71 px, y Tab de «FAQ» a «Reservar». Todo igual sin JS. La franja 821–907, que antes iba en dos filas (126/123 px), queda en 75 px.                                                                                                     |
| @s40 | ✓ (3)     | 320, 390 y 430: `scroll-padding-top` 96 px, y en los 7 saltos de ancla y en «Reservar cita» el título queda por debajo de la cabecera de 75 px.                                                                                                                                                                                                                                                                                                 |
| @s41 | ✓ (2)     | 320 y 430: los tres caminos a la reserva (hero, «Reserva» del menú y Nailbot) y consola limpia en esos tres pasos. El ✗ de 320 de la primera pasada era el 404 del favicon en la primera carga. Aquí no apareció dentro de la ventana medida, porque depende de cuándo lo pide Chrome. H-2 sigue abierto.                                                                                                                                       |
| @s43 | ✓ (2)     | **Barrido de 800 a 960 px, de 1 en 1 (161 anchos), recargando en cada ancho, con el logo en «texto» y, tras el vuelo, en «caligrafia».** Fuentes cargadas (`fonts.check` de Gilda true) y bloqueadas con `Network.setBlockedURLs` (false, ancla de que el bloqueo funcionó). En los dos casos: 800–920 px → 75 px, una fila, «Menú» visible y lista plegada; 921–960 px → 71 px, una fila, nav horizontal. 0 anchos malos y sin desbordamiento. |

### Hallazgos

- **H-1 · RESUELTO por la ENMIENDA E-2.** Ver @s39 y @s43.
- **H-2 · `/favicon.ico` da 404.** Sigue abierto. Es previo a F-25 y queda como tarea aparte.
- **H-3 · Los hooks del arnés reescriben `dist/` (entorno, no producto).** `.claude/settings.json` declara
  un `PostToolUse` sobre `Edit|Write` que ejecuta `node .harness/harness.mjs test`, y un `Stop` que ejecuta
  `node .harness/harness.mjs init`. Los dos corren la suite completa, y sus tests de horneado
  (`home-horneado`, `contacto-horneado`, `trampas-del-horneado`) hacen un `pnpm build` REAL sobre `dist/`.
  Cada edición y cada fin de turno rehace `dist/` mientras `vite preview` lo sirve. Dos pasadas intermedias
  se ensuciaron así (`ERR_HTTP_RESPONSE_CODE_FAILURE` en @s39/@s40/@s41 y el acople perdido de @s29 a
  320/100 px). Un vigilante sobre `dist/index.html` lo pilló en el acto: `claude` → hook `Stop` →
  `harness.mjs init` → `pnpm test` → `vitest run` → `pnpm build` → `vite-react-ssg build`. **Remedio de la
  verificación:** servir una copia inmutable de `dist/` con su huella MD5, en un puerto aparte. Esto
  explica también, con mucha probabilidad, los reinicios del contenedor de la sesión: suites de los hooks
  que coincidían con las de los subagentes.

## Estado de F-25

**F-25 cumple su verificación en vivo completa** (@s28-@s33, @s39-@s41 y @s43), con las ENMIENDAS E-1 y E-2.
Con judge APPROVED (F-25, E-1 y E-2) y mutación al 100 %, pasa a `done`.
