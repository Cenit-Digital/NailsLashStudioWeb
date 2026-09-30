# Bitácora TDD — F-25 `logo_acoplado` (tdd_craftsman, 2026-09-29)

Contrato: `features/logo_acoplado.feature` (34 escenarios, APROBADO por Pablo el 2026-09-29). Spec:
`project-spec.md` §Feature 25 (LA-C1..LA-C13, LA-1..LA-16, ENMIENDA D-1). Decisiones del lead:
`progress/gherkin_logo_acoplado.md` (D-1..D-8).

## Línea base (antes del primer test)

- `pnpm test` → **47 ficheros, 1556 tests, todo verde** (81 s).

## Orden de trabajo

Los escenarios se recorren en el orden del `.feature`: @s1 → @s27, y @s34 al final. @s28-@s33 son
`@verificacion-viva` y NO se fingen en jsdom: quedan para el lead (sección al final).

Comando de cada ciclo: `pnpm exec vitest run <fichero>` (un fichero, segundos). La suite completa
(`pnpm test`) se corre en los puntos de control marcados y al cierre.

## Ciclos Rojo → Verde → Refactor

### @s1 — el horneado nace en «texto»/«no», href "/", sin style (ciclo 1)

- ROJO: `logo-acoplado.test.tsx` «@s1 exactamente un <a> con data-logo…» → 1 falla («expected [] to
  have a length of 1»: no hay ningún `<a data-logo>`).
- VERDE: `LogoAcoplado.tsx` nuevo (`<a href={BASE_URL} data-logo="texto" data-vuelo="no">{NOMBRE}</a>`)
  y `Cabecera.tsx` lo monta en el sitio del antiguo `<a>`. `vitest run logo-acoplado + cabecera` → 12/12.
- REFACTOR: el comentario del `href` (BASE_URL, ENMIENDA 1) se muda de Cabecera.tsx a LogoAcoplado.tsx
  → 12/12.
- Nota: la aserción «document.querySelector no se llama durante renderToString» es una guarda de
  futuro: no hay querySelector todavía, así que no puede estar roja aún (morderá si alguien lo sube al
  render; `renderToString` no ejecuta efectos).

### @s2 — las dos representaciones horneadas (ciclo 2)

- ROJO: 3 tests de @s2 (orden span/span/svg y textos; atributos del `<svg>` y del `<text>`; sin
  ids/máscara/trazo) → 3 fallan (el `<a>` solo tenía texto).
- VERDE: los dos `<span>` (el segundo `aria-hidden`) y el `<svg aria-hidden focusable="false">` con UN
  `<text x=0 y=0 font-size=1000>`. **Fake-it deliberado:** la firma y el viewBox van como literales
  («Nails Lash» y el viewBox del rótulo) para que @s4 tenga un rojo auténtico: primero lo escribí con
  `partirNombre`/`VISTA_MARCA` (implementación obvia) y lo rebajé, porque dejaba @s4 verde a la primera.
  → 15/15.

### @s3 — nombre accesible exacto y clases constantes en los tres estados (ciclo 3)

- Arnés de jsdom (en el test): doble de `IntersectionObserver` (captura callback; constructor, observe
  y disconnect espiados), geometría de referencia por elemento con `getBoundingClientRect` espiado
  ANTES del montaje (cabecera 73,6; `<svg>` del logo 40/17/137,5/40; `<a>` señuelo; origen
  365/−58/550/100), `innerHeight` = 812 con `vi.stubGlobal`, entradas con `rootBounds.top` 73.
- ROJO: 3 filas del outline → la fila «texto» pasa (es invariante), las filas «caligrafia» sin y con
  vuelo fallan: «el logo no construyó ningún observador».
- VERDE mínimo (fake-it): efecto con `new IntersectionObserver(cb)`; el callback acopla SIEMPRE y
  vuela salvo en la primera entrega. La guarda `typeof IntersectionObserver !== 'function'` entra ya:
  sin ella `home.test.tsx` y `nailbot-flotante.test.tsx` (montan la home en jsdom) se ponen rojos con
  `ReferenceError: IntersectionObserver is not defined` (sabotaje medido: 2 fallan). →
  logo-acoplado + cabecera + home + flotante: 53/53.

### @s4 — la firma y el viewBox salen de la fuente única (ciclo 4)

- ROJO: `logo-acoplado-derivacion.test.tsx` (nuevo; el `vi.mock` de `../lib/site` → NOMBRE «Salón Uñas
  Bonitas» y de `../lib/trazo-marca` → VISTA_MARCA «0 -700 3000 900» vive SOLO ahí) → 3/3 fallan
  («expected 'Nails Lash' to be 'Salón Uñas'»; el viewBox; el fragmento aún trae «Nails Lash»).
- VERDE: `partirNombre(NOMBRE).marca` en el `<text>` y `viewBox={VISTA_MARCA}`. → 21/21 (logo +
  derivación + cabecera).

### @s5 — un observador, opciones exactas, observe del disparo y limpieza (ciclos 5a y 5b)

- 5a ROJO: «constructor una vez con { threshold: 0, rootMargin: "-73px 0px 0px 0px" } y sin root;
  observe una vez con el disparo; sin entrega sigue en texto y sin style» → falla («expected undefined
  to strictly equal { threshold: +0, … }»).
- 5a VERDE: en el efecto, `querySelector('[data-acople="disparo"]')`, la cabecera =
  `enlace.closest('header')` y `rootMargin: -${Math.floor(alto)}px 0px 0px 0px`. **Implementación
  obvia declarada:** la geometría de jsdom es única (73,6), así que el componente no se puede
  triangular; floor frente a round/ceil lo triangula @s25 sobre la función pura. → 22/22.
- 5b ROJO: «al desmontar sin haber acoplado, disconnect EXACTAMENTE una vez» → 0 llamadas.
- 5b VERDE: la limpieza del efecto `return () => observador.disconnect()`. → 23/23.

### @s6 — decide la geometría contra `rootBounds.top`, frontera `<=`, y desconecta al acoplar (ciclo 6)

- ROJO: 7 filas del outline → 7/7 fallan en la precondición (el fake-it de @s3 acoplaba en CUALQUIER
  entrega, también en la de 400).
- VERDE: el callback compara `entrada.boundingClientRect.bottom > entrada.rootBounds.top` → sale sin
  hacer nada; si no, `observador.disconnect()` y acopla. `isIntersecting` no se lee. → 30/30.

### @s7 — manda `rootBounds.top`; sin él, el borde medido EN el callback (ciclo 7)

- ROJO: 7 filas → las 3 filas con `rootBounds` null fallan («TypeError: Cannot read properties of null
  (reading 'top')»). Las 4 con `rootBounds` pasan a la primera: fijan la PRECEDENCIA que @s6 ya había
  implantado. **Sabotaje medido** (decidir siempre con el borde medido de la cabecera): 4 rojos (@s6
  fila 73,5 y @s7 filas 260/150, 73,6/73,4 y 70/72). Restaurado.
- VERDE: `lineaDeCorte = entrada.rootBounds?.top ?? cabecera.getBoundingClientRect().bottom`, medido
  dentro del callback. El constructor y observe siguen con UNA llamada (no se rehace). → 23/23.

### @s8 — monotonía P2 (ciclo 8)

- El test pasa a la primera: con la decisión de @s6, una entrega de 400 tras acoplar no hace nada.
  **Sabotaje medido** (volver a «texto» si `bottom > línea`): 1 rojo (@s8). Restaurado. La monotonía
  POR SÍ MISMA (desde «caligrafia» siempre «caligrafia») la muerde @s24 sobre la función pura. → 24/24.

### @s9 — sin persistencia (ciclo 9)

- El test pasa a la primera (no hay storage). **Sabotaje medido** (leer `sessionStorage.getItem` en el
  efecto): 1 rojo (@s9). Restaurado. → 25/25.

### @s10 — ¿vuelo o no? Primera entrega y «a menos de un viewport» (ciclo 10)

- ROJO: 6 filas → 4 fallan (las dos de entrega INICIAL ya pasaban por la regla de primera entrega de
  @s3): sin variables en el style y vuelo en −812/−2400.
- VERDE: `vuela = !primeraObservacion && origen.bottom > -window.innerHeight`. **Fake-it:** las tres
  variables con valores constantes (`0px`, `0px`, `1`); @s11 obliga al FLIP real. → 45/45.
- REFACTOR: el estado pasa a `{ logo, variables?: CSSProperties }`; `style={acople.variables}` y
  `data-vuelo` se derivan del mismo campo. Un `style={variables === null ? undefined : …}` habría
  fabricado un mutante equivalente (`style={null}` y `style={undefined}` pintan igual). → 45/45, tsc limpio.

### @s11 — valores FLIP exactos con señuelo (ciclo 11)

- ROJO: «en UNA sola entrega… 325px / -75px / 4» → falla («expected '0px' to be '325px'»: el fake-it
  de @s10). El segundo test (solo el `<a>` lleva style) pasa a la primera: guarda.
- VERDE: `ref` al `<svg>` del logo; x = origen.left − destino.left, y = origen.top − destino.top,
  escala = origen.width / destino.width. → 47/47.
- **Sabotajes medidos:** medir el `<a>` (señuelo) → «expected '341px' to be '325px'»; escala por el alto
  → «expected '2.5' to be '4'». Restaurado.

### @s12 — sin FLIP válido, acople sin vuelo y sin errores (ciclo 12)

- ROJO: 3 filas → 3 fallan («TypeError: Cannot read properties of null (reading
  'getBoundingClientRect')» sin origen; vuelo con escala 0 o ∞ con anchos 0).
- VERDE: guardas de origen ausente y de `width <= 0`.
- REFACTOR (en el mismo paso, en verde): el cálculo del vuelo sale del callback a `vueloHacia(destino,
primeraObservacion)` a nivel de módulo. → 50/50, tsc limpio.

### @s13 — ni matchMedia, ni animate, ni scroll/resize (ciclo 13)

- Pasa a la primera (guarda). **Sabotajes medidos:** decidir el vuelo con `matchMedia` → rojos
  (@s3/@s6…, jsdom no trae matchMedia); `window.addEventListener('scroll', …)` → 1 rojo (@s13).
  Restaurado. → 37/37.

### @s14 — degradación (ciclo 14)

- ROJO: 3 filas → la fila «sin disparo» falla (el constructor se llamaba: `observe(null)`); las filas
  «sin IntersectionObserver» y «sin origen» ya pasaban por las guardas de @s3 y @s12.
- VERDE: `if (disparo === null) return` antes de construir el observador. → 54/54.
- **Sabotaje medido** (buscar el disparo ANTES de la guarda `typeof`): 1 rojo (@s14 fila 1). Restaurado.

### Punto de control tras @s14

- `pnpm test` (suite completa) → **49 ficheros, 1599 tests, verde** (83 s).

### @s15 — el vuelo en la hoja (ciclo 15)

- Granularidad declarada: en los escenarios de BYTES, el ciclo es el escenario; sus `it` fallan juntos
  porque el fichero se lee al cargar el módulo de test (ENOENT) — igual que las filas de un outline.
- ROJO: `logo-acoplado-estilos.test.ts` (nuevo; ayudantes `cuerpoDelBloque`, `sinBloque`, `reglas` del
  precedente nailbot-flotante-estilos, más `sinComentarios`, `declaraciones` y `bloqueBase`) → «ENOENT:
  … logo-acoplado.module.scss».
- VERDE: `logo-acoplado.module.scss` nuevo con SOLO lo de @s15: base `.logoCaligrafia { transform-origin:
0 0 }`, las dos reglas `[data-vuelo='si']` y las dos `@keyframes`. → 7/7.
- **Sabotajes medidos** (cada uno, 1-2 rojos; restaurado): 0.9s → 0.6s; `100%` en acoplar; `both` en
  soltar; `animation` en un `.logoTexto` sin `[data-vuelo]`; `transform-origin: center`.

### @s16 — reduced-motion instantáneo, selector completo y después (ciclo 16)

- ROJO: 5 tests → 5 fallan (no hay `@media`).
- VERDE: `@media (prefers-reduced-motion: reduce)` al final con los dos selectores COMPLETOS del vuelo
  en `animation: none`. → 12/12.
- **Sabotajes medidos** (restaurado): selector corto dentro del @media → 2 rojos; @media antes de las
  reglas → 2 rojos; `transition` residual → 1 rojo.

### @s17 — hueco estable, base = horneado, `.soloLectores` (ciclo 17)

- ROJO: 8 tests → 7 fallan (sin `inline-grid`, `grid-area`, visibilidades, `.soloLectores`, cableado).
  La guarda «ninguna regla de las representaciones saca la caja del flujo» ya pasaba con las reglas de
  @s15/@s16.
- **APOYO DERIVADO, declarado:** «LogoAcoplado.tsx importa la hoja y aplica .marca, .soloLectores,
  .logoTexto y .logoCaligrafia a sus nodos; el `<text>` sin clase (D-8)». Lee la FUENTE. Motivo: bajo
  `css: false` las clases del module son undefined y ningún render las ve; sin este test, el cableado
  de `className` sería producción que ningún test pide (Ley 1) y podría perderse con la suite verde.
  No asevera ESTADO por clase (lo prohíbe el `.feature`): solo qué clase CONSTANTE lleva cada etiqueta.
- VERDE: `.marca { display: inline-grid }`; `.soloLectores` con la técnica clip/1 px COMPLETA del
  `.heroMarca` (incluye `margin: -1px; padding: 0; border: 0`, que el test no enumera: el `.feature`
  pide «la técnica del <h1> del hero»); `grid-area: 1 / 1` en las dos representaciones;
  `visibility: hidden` en la base de la caligrafía; las dos reglas `[data-logo='caligrafia']`; y las
  cuatro `className` en LogoAcoplado.tsx. → 63/63 (estilos + logo + derivación).
- **Sabotajes medidos** (restaurado): `display: none` en vez de visibility → 2 rojos; una regla sobre
  `data-logo='texto'` → 1; `.soloLectores` con `visibility: hidden` → 1; `.logoTexto` en otra celda
  → 1; clases de los dos `<span>` intercambiadas en la fuente → 1 (el apoyo).

### @s18 — 2,5 rem con tope de 2,75 rem (ciclo 18)

- ROJO: 3 tests → 2 fallan (sin `height`). El de «sin width en px» ya pasaba (guarda).
- VERDE: `height: 2.5rem` en la base de `.logoCaligrafia`. → 23/23.
- **Sabotajes medidos** (restaurado): `height: 3rem` dentro de un @media → 1 rojo; `max-height: 44px`
  → 1; `width: 137px` → 1.

### @s19 — `--ink`, Great Vibes, `pointer-events`, sin opacity; D-5; matriz intacta (ciclo 19)

- ROJO: 6 tests → 4 fallan (sin fill, pointer-events, `var(--ink)`, tipografía de `.logoTexto`). Pasaban
  a la primera: «fuera de las @keyframes nadie declara opacity» (guarda) y «MINIMO_DE_PARES 18 y UNA
  fila A-15» (ancla de regresión).
- VERDE: `.logoCaligrafia` + `fill: var(--ink)`, `font-family: 'Great Vibes', cursive`,
  `pointer-events: none`; `.logoTexto` + `font-family: 'Gilda Display', serif`,
  `letter-spacing: 0.06em`, `text-transform: lowercase`. → 29/29.
- **Sabotajes medidos** (restaurado): `opacity: 0.9` en `.marca` → 1 rojo; `fill: var(--accent)` → 2;
  `letter-spacing` en `.marca` → 1; `MINIMO_DE_PARES = 19` en puerta-contraste.ts → 1.

### @s20 — ENMIENDA F-06: la mudanza de `.marca` (ciclo 20)

- ROJO: `cabecera.test.tsx` «@s20» (3 tests) → 2 fallan: `cabecera.module.scss` aún tiene el bloque
  `.marca`, y la hoja del logo no tiene color/subrayado/cuerpo/interlineado. El del horneado de F-06
  pasaba (regresión de @s12/@s16).
- La mitad positiva de «las reglas se MUDAN» (derivada del título del escenario): `color: var(--ink)`,
  `text-decoration: none`, `font-size: 1.1875rem` y `line-height: 1.4` deben estar en los bloques base
  `.marca` o `.logoTexto` de la hoja nueva (las otras tres ya las fijó @s19/D-5).
- VERDE: fuera el bloque `.marca` de `cabecera.module.scss` (queda un comentario de dónde vive ahora; el
  `@media (max-width: 820px)` intacto); `.marca` + color y subrayado; `.logoTexto` + cuerpo e
  interlineado. → cabecera + estilos + `src/styles`: 65/65.

### @s21 — ENMIENDA F-07: dos `data-acople` en Hero.tsx (ciclo 21)

- ROJO: `hero.test.tsx` «@s21» (2 tests) → 1 falla («expected +0 to be 2»); el de «h1 intacto, ids
  únicos, firma en marcha» pasaba (regresión).
- VERDE: `data-acople="origen"` en el `<svg>` del rótulo y `data-acople="disparo"` en el `<span>` de
  «Studio». Nada más en Hero.tsx. → hero + hero-estilos + hero-logica + home: 111/111.

### @s22 — el hero sigue su ceremonia; ningún nodo nuevo (ciclo 22)

- Pasa a la primera con Cabecera y Hero REALES (matchMedia sin reduce): la implementación no toca el
  hero. **Sabotajes medidos** (restaurado): clonar el rótulo (el fantasma de la alternativa (a) de LA-2)
  → rojo; `data-vuelo` en el rótulo → rojo. → 41/41.

### @s23 — la home horneada: un `<h1>`, ids únicos, anclas vivas (ciclo 23)

- Pasa a la primera (4 tests, regresión). **Sabotajes medidos** (restaurado): `id` en el `<svg>` del
  logo → 2 rojos (@s2 y @s23); `href="#inicio"` → rojos, entre ellos @s23 (anclas). → 45/45.

### Reanudación tras el reinicio del contenedor (2026-09-29)

- Punto de partida: `de08858` (verde; 1652 tests). El árbol traía 4 ficheros modificados SIN commitear
  (`logo-acoplado.test.tsx`, `logo-acoplado-estilos.test.ts`, esta bitácora y `progress/current.md`)
  con cambios SOLO de formato que NO cumplían Prettier (`prettier --check` → 4 avisos; las versiones de
  HEAD, comprobadas aparte, sí). Se restauraron a HEAD con `git checkout --`: ningún cambio de fondo.
- `logo-acoplado-logica.ts` (`estadoTrasObservar`, `debeVolar`) y su test (14 filas de @s24) ya
  estaban commiteados en `de08858` sin su asiento aquí. `vitest run logo-acoplado-logica.test.ts` →
  14/14. El ciclo NO se rehace: se mide que muerde (abajo).

### @s24 — decisiones PURAS en sus fronteras (ciclo 24)

- Tests (ya escritos antes del corte): `logo-acoplado-logica.test.ts`, 8 filas de `estadoTrasObservar`
  y 6 de `debeVolar`, literales a mano, como el outline.
- **Sabotajes medidos sobre la lógica pura** (restaurado): `<=` → `<` → 1 rojo (fila 73, 73);
  sin `actual === 'caligrafia' ||` → 2 rojos (las dos filas desde «caligrafia»); `>` → `>=` en
  debeVolar → 1 rojo (−812); sin `!primeraObservacion &&` → 1 rojo (true, 42).
- REFACTOR (en verde): el componente deja de decidir por su cuenta. `LogoAcoplado.tsx` importa
  `estadoTrasObservar` y `debeVolar`; la constante de módulo `HORNEADO: EstadoLogo = 'texto'` es a la
  vez el estado inicial y el «actual» del callback (el observador solo escucha mientras la marca sigue
  en el horneado: al acoplar se desconecta). Se acopla si `estadoTrasObservar(HORNEADO, bottom,
línea) !== HORNEADO`, y se pinta el estado que devuelve. `vueloHacia` pregunta a `debeVolar` con
  `window.innerHeight`. → logo + lógica + derivación + estilos: 91/91, `tsc` limpio.
- Por qué `HORNEADO` y no el literal `'texto'` en la llamada: con el literal, el mutante `'texto'` → `""`
  sería EQUIVALENTE (`estadoTrasObservar` solo mira `=== 'caligrafia'`). Con la constante compartida, el
  mutante también cambia el `data-logo` horneado y lo matan @s1/@s3; y el `if` compara contra ella, así
  que `""` acoplaría con la entrega de 400 (lo matan las filas «texto» de @s6).
- **Sabotajes del cableado** (restaurado): `<` en la lógica pura → 15 rojos en `logo-acoplado.test.tsx`
  (@s3, @s6 fila 73, @s7 fronteras…); `>=` en debeVolar → 1 rojo (@s10 fila −812). El componente usa la
  función, no una copia.

### @s25 — geometría PURA por valor: FLIP, variables y margen (ciclos 25a-25d)

- 25a ROJO: `transformacionFlip`, filas 1 y 2 (`{ 365, -58, 550, 100 }, { 40, 17, 137.5, 40 }` →
  `{ 325, -75, 4 }` y la de escala 1,5) → 2/2 fallan («TypeError: transformacionFlip is not a
  function»). VERDE: `x`, `y` y `escala = origen.width / destino.width`, SIN guarda todavía. → 16/16.
- 25b ROJO: las tres filas `null` (destino 0, origen 0, destino −3) → 3/3 fallan («expected { …,
  escala: Infinity } to deeply equal null», escala +0, escala negativa). VERDE: `if (origen.width <= 0
|| destino.width <= 0) return null`. → 19/19.
  REFACTOR: `vueloHacia` delega en `transformacionFlip` (fuera la guarda de ancho y el cálculo inline).
  → logo + lógica: 64/64, `tsc` limpio.
  **Sabotajes** (restaurado): escala por el alto → 2 rojos (@s25 fila 1 y @s11; la fila 2 es
  proporcional a propósito, 60/40 = 1,5); `||` → `&&` en la guarda → 5 rojos (3 filas `null` de @s25
  y 2 filas de @s12).
- 25c ROJO: `variablesDeVuelo`, 2 filas → 2/2 fallan (not a function). VERDE: las tres propiedades con
  plantilla `${x}px`, `${y}px` y `${escala}`, sin redondear. → 21/21. REFACTOR: `vueloHacia` devuelve
  `variablesDeVuelo(flip) as CSSProperties` (la conversión hace falta: `CSSProperties` no declara
  custom properties). → 66/66, `tsc` limpio. **Sabotaje** (restaurado): sin `px` en `--vuelo-x` → 3 rojos
  (2 de @s25 y @s11).
- 25d ROJO: `margenDeRaiz`, 4 filas → 4/4 fallan (not a function). VERDE: `` `-${Math.floor(alto)}px 0px
0px 0px` ``. → 25/25. REFACTOR: el `rootMargin` del componente es
  `margenDeRaiz(cabecera.getBoundingClientRect().height)`. → 70/70, `tsc` limpio. **Sabotajes**
  (restaurado): `Math.round` → 3 rojos (73,6 y 70,99 de @s25, y @s5); `Math.ceil` → 4 rojos (73,6,
  73,2 y 70,99, y @s5). Queda triangulado floor frente a round y ceil, como pedía el ciclo 5a.
- Resultado: `LogoAcoplado.tsx` mide y cablea; las cinco funciones de LA-C11 deciden y calculan.

### @s26 — guardas de FUENTE (ciclo 26)

- Tests en `logo-acoplado-estilos.test.ts` (su cabecera ya reservaba @s26/@s27): 4 `it` (anclas
  positivas; APIs vetadas en los dos ficheros; marca, viewBox e ids del rótulo en los dos; `aria-label`,
  `animation` y `dangerouslySetInnerHTML` en el componente). Ninguna guarda veta `if (`, `?`, `&&` ni `||`.
- Pasan a la primera, porque son guardas. **Sabotajes medidos** (cada uno 1 rojo en su `it`; restaurado):
  `// matchMedia` en la lógica; `// 'scroll'` en el componente; `// Nails Lash` en la lógica;
  `// trazo-marca` en el componente FUERA del import; `// aria-label` en el componente.
- **DESVIACIÓN DECLARADA, A RATIFICAR POR EL LEAD (enmienda de una cláusula de @s26).** El contrato
  pide que ninguno de los dos ficheros contenga «trazo-marca», «los comentarios también son bytes».
  Pero `VISTA_MARCA` solo existe en `src/lib/trazo-marca.ts`, un dato GENERADO («no se edita a mano»;
  ningún otro módulo la reexporta), y @s4/LA-15 exigen usarla. La línea
  `import { VISTA_MARCA } from '../lib/trazo-marca'` hace imposible la letra. **Medido**: con la letra
  exacta, el `it` de la marca e ids da 1 rojo por ese import y por nada más.
  - Lo que hice: el test quita el especificador `from '../lib/trazo-marca'`, SOLO ese, antes de buscar,
    y además exige que aparezca EXACTAMENTE una vez. El resto de bytes cuenta, comentarios incluidos:
    `// trazo-marca` fuera del import sigue en rojo (sabotaje de arriba). La intención de la cláusula,
    que el logo no copie los ids `tinta-marca`/`trazo-marca` del rótulo (LA-C1), queda intacta.
  - Alternativa que NO tomé: un módulo nuevo que solo reexporte `VISTA_MARCA` con otra ruta. Es un
    artefacto fuera de la lista fijada del `.feature` («el tdd_craftsman NO elige nombres») y solo
    serviría para esquivar la guarda.
  - Enmienda propuesta para `features/logo_acoplado.feature` @s26, 3.ª línea: «…ni "trazo-marca", salvo
    en el especificador del import de VISTA_MARCA (`from '../lib/trazo-marca'`), que el componente trae
    EXACTAMENTE una vez (los comentarios también son bytes)».

### @s27 — los dos ficheros nuevos entran en `mutate` (ciclo 27)

- ROJO: `logo-acoplado-estilos.test.ts` «@s27 mutate trae EXACTAMENTE una vez cada fichero nuevo…»
  (lee `stryker.config.json` con `JSON.parse`) → 1 falla («expected +0 to be 1»).
- VERDE: `"src/components/LogoAcoplado.tsx"` y `"src/components/logo-acoplado-logica.ts"` al final de
  `mutate`. Nada más cambia en `stryker.config.json`. → 34/34.
- **Sabotajes** (restaurado): `LogoAcoplado.tsx` duplicado en `mutate` → 1 rojo («expected 2 to be 1»);
  `"break": 90` → 1 rojo.
- La PUNTUACIÓN no es de este test: la mide el `mutation_tester` con `--mutate` (nunca `--testFiles`)
  sobre los dos ficheros nuevos, y re-mide Cabecera.tsx y Hero.tsx. El `[]` del efecto de montaje de
  `LogoAcoplado.tsx` queda SIN marcar: es el equivalente ratificado, y el contrato encarga su
  `// Stryker disable next-line all` y la justificación en `progress/mutation_logo_acoplado.md` a esa
  ronda (precedentes Hero.tsx:156, Galeria.tsx:158, Equipo.tsx:214, NailbotFlotante.tsx:80).
- Pre-revisión de mutantes, sin ejecutar Stryker. No veo más equivalentes. La constante `HORNEADO`
  evita el `'texto'` → `""` equivalente (ciclo 24). `?.` y `??` los matan las filas null y la fila
  73,4 de @s7. El objeto de `debeVolar` → `{}` no vuela nunca (@s10). Los bloques `return undefined`
  vaciados acaban en TypeError sobre null (@s12).

### @s34 — varias entradas: decide la ÚLTIMA; «primera» es la primera ENTREGA (ciclo 34)

- ROJO: `logo-acoplado.test.tsx` «@s34», 3 filas del outline (origen con borde inferior 42 por la
  geometría de referencia; `isIntersecting` realista, tocar la línea ya es intersecar, y no decide) →
  3/3 fallan: el callback decidía con `entradas[0]`.
- VERDE: `const entrada = entradas[entradas.length - 1]`. La primera observación ya se contaba por
  ENTREGA (`primeraEntrega` cambia una vez por llamada al callback). → logo + lógica: 73/73, `tsc`
  limpio.
- REFACTOR: comentario de una línea (≤ 100 columnas) con la regla D-4. → logo, lógica, estilos,
  derivación, cabecera y hero: 183/183.
- **Sabotajes** (restaurado): volver a `entradas[0]` → 3 rojos; «acopla si ALGUNA entrada está sobre la
  línea» → 1 rojo (fila 2, la que el contrato dice que mata esa implementación); contar ENTRADAS en vez
  de entregas → 2 rojos (filas 1 y 3; la 3 es la que el contrato asigna a ese error).

## Cierre (2026-09-30)

- `pnpm typecheck` → limpio · `pnpm lint` → limpio · `pnpm exec prettier --write` sobre los ficheros
  tocados y `pnpm format:check` → «All matched files use Prettier code style!».
- `pnpm test` (suite COMPLETA, UNA vez) → **51 ficheros, 1671 tests, todo verde** (77 s). Son 1652
  de `de08858` más 19 nuevos: @s25 11, @s26 4, @s27 1 y @s34 3.
- `bin/harness init` NO se relanza. Por instrucción del lead, la suite completa corre UNA sola vez, e
  `init` = `pnpm typecheck && pnpm lint && pnpm format:check` + `pnpm test`, medidos uno a uno arriba.
- Ficheros tocados en esta sesión: `LogoAcoplado.tsx`, `logo-acoplado-logica.ts`,
  `logo-acoplado-logica.test.ts`, `logo-acoplado-estilos.test.ts`, `logo-acoplado.test.tsx` y
  `stryker.config.json`. Sin commits: los hace el lead. No toco `feature_list.json`, el status ni F-27.

## Trazabilidad @s → test

| @s   | Dónde                                      | Test(s)                                                                                          |
| ---- | ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| @s1  | `logo-acoplado.test.tsx`                   | «@s1 exactamente un <a> con data-logo, en "texto" y "no", href "/", sin style…»                  |
| @s2  | `logo-acoplado.test.tsx`                   | 3 `it` «@s2 …» (orden y textos; atributos del `<svg>`/`<text>`; sin ids, máscara, trazo, imagen) |
| @s3  | `logo-acoplado.test.tsx`                   | 3 filas «@s3 {estado} → un solo enlace «Nails Lash Studio»…»                                     |
| @s4  | `logo-acoplado-derivacion.test.tsx`        | 3 `it` con `vi.mock` de NOMBRE y VISTA_MARCA                                                     |
| @s5  | `logo-acoplado.test.tsx`                   | «@s5 constructor una vez con { threshold: 0, rootMargin "-73px…" }…» y «@s5 al desmontar…»       |
| @s6  | `logo-acoplado.test.tsx`                   | 7 filas «@s6 bottom … → data-logo …»                                                             |
| @s7  | `logo-acoplado.test.tsx`                   | 7 filas «@s7 rootBounds … · cabecera … · bottom …»                                               |
| @s8  | `logo-acoplado.test.tsx`                   | «@s8 tras acoplar con vuelo, una entrega con «STUDIO» otra vez a la vista…»                      |
| @s9  | `logo-acoplado.test.tsx`                   | «@s9 una primera vida que acopló… la segunda nace en «texto»…»                                   |
| @s10 | `logo-acoplado.test.tsx`                   | 6 filas «@s10 … → data-vuelo …»                                                                  |
| @s11 | `logo-acoplado.test.tsx`                   | «@s11 en UNA sola entrega… 325px, -75px, 4» y «@s11 ninguna otra etiqueta recibe style»          |
| @s12 | `logo-acoplado.test.tsx`                   | 3 filas «@s12 … → "caligrafia", "no", sin style, sin console.error»                              |
| @s13 | `logo-acoplado.test.tsx`                   | «@s13 con matchMedia respondiendo «reduce»…»                                                     |
| @s14 | `logo-acoplado.test.tsx`                   | 3 filas «@s14 … → «texto» mientras está montada, sin errores»                                    |
| @s15 | `logo-acoplado-estilos.test.ts`            | 7 `it` «@s15 …»                                                                                  |
| @s16 | `logo-acoplado-estilos.test.ts`            | 5 `it` «@s16 …»                                                                                  |
| @s17 | `logo-acoplado-estilos.test.ts`            | 8 `it` «@s17 …», con el APOYO declarado del cableado de `className`                              |
| @s18 | `logo-acoplado-estilos.test.ts`            | 3 `it` «@s18 …»                                                                                  |
| @s19 | `logo-acoplado-estilos.test.ts`            | 6 `it` «@s19 …»                                                                                  |
| @s20 | `cabecera.test.tsx`                        | 3 `it` «@s20 …»                                                                                  |
| @s21 | `hero.test.tsx`                            | 2 `it` «@s21 …»                                                                                  |
| @s22 | `logo-acoplado.test.tsx`                   | «@s22 con Cabecera y Hero REALES…»                                                               |
| @s23 | `logo-acoplado.test.tsx`                   | 4 `it` «@s23 …»                                                                                  |
| @s24 | `logo-acoplado-logica.test.ts`             | 8 filas de `estadoTrasObservar` y 6 de `debeVolar`                                               |
| @s25 | `logo-acoplado-logica.test.ts`             | 5 filas de `transformacionFlip`, 2 de `variablesDeVuelo` y 4 de `margenDeRaiz`                   |
| @s26 | `logo-acoplado-estilos.test.ts`            | 4 `it` «@s26 …» (con la DESVIACIÓN de `trazo-marca`, abajo)                                      |
| @s27 | `logo-acoplado-estilos.test.ts`            | «@s27 mutate trae EXACTAMENTE una vez…». La puntuación → `mutation_tester`                       |
| @s34 | `logo-acoplado.test.tsx`                   | 3 filas «@s34 … entradas … en UNA entrega → …»                                                   |
| @s28 | EN VIVO (lead, Chrome + CDP sobre `dist/`) | — (sin test jsdom a propósito)                                                                   |
| @s29 | EN VIVO                                    | —                                                                                                |
| @s30 | EN VIVO                                    | —                                                                                                |
| @s31 | EN VIVO                                    | —                                                                                                |
| @s32 | EN VIVO                                    | —                                                                                                |
| @s33 | EN VIVO                                    | —                                                                                                |

Cubiertos por TDD en jsdom o por bytes: **28** (@s1-@s27 y @s34). En vivo, pendientes del lead: **6**
(@s28-@s33).

## Desviaciones y apoyos declarados

1. **@s26, cláusula «trazo-marca» → RATIFICADA por el lead el 2026-09-30** (enmienda escrita en `features/logo_acoplado.feature` @s26) (detalle en el ciclo 26). El import de
   `VISTA_MARCA` desde el módulo generado `src/lib/trazo-marca.ts` hace imposible la letra. El test quita
   ese especificador, y solo ese, y exige que aparezca exactamente una vez. Propongo enmendar esa
   línea del `.feature`. Si el lead la rechaza, la otra salida es un módulo que solo reexporte la
   constante (artefacto nuevo, no lo creo sin su permiso).
2. **@s17, APOYO derivado** (ciclo 17): un test de FUENTE fija qué clase constante lleva cada etiqueta,
   porque bajo `css: false` ningún render ve las clases del module.
3. **Ciclo @s24 sin asiento previo**: tests y funciones ya estaban en `de08858`. No se rehízo el ciclo:
   se midió con 4 sabotajes que muerden.
4. **Guardas que pasan a la primera**: @s8, @s9, @s13, @s22, @s23 y @s26. Cada una con su sabotaje
   medido y restaurado.

## Pendiente para el lead / siguientes agentes

- **Ratificar la desviación de @s26** (arriba) y, si procede, enmendar el `.feature`.
- **mutation_tester**: `--mutate src/components/LogoAcoplado.tsx` y `--mutate
src/components/logo-acoplado-logica.ts` (jamás `--testFiles`), y re-medir `Cabecera.tsx` y `Hero.tsx`.
  El `[]` del efecto de montaje de `LogoAcoplado.tsx` está SIN marcar: su `// Stryker disable
next-line all` y la justificación en `progress/mutation_logo_acoplado.md` son de esa ronda.
- **@verificacion-viva (@s28-@s33)**: NO se fingen en jsdom ni con tests build-based. Los corre el
  LEAD sobre `dist/` servido en Chrome real + CDP (I-8) y los anota en
  `progress/verificacion_viva_logo_acoplado.md`:
  - @s28 HTML crudo de `dist/` (texto/no, `href="/NailsLashStudioWeb/"`, sin style), hidratación sin
    avisos, sin JS se ve «nails lash studio», y el `<text>` computa `text-transform: none` y
    `letter-spacing: normal`, con su `getBBox()` dentro del viewBox (D-5).
  - @s29 el disparo en las tres pasadas (1, 2 y 100 px) sin perder el acople (D-1); `getAnimations()`:
    `acoplar` de 900 ms y `soltar` de 400 ms; sin destello; scroll durante el vuelo; sin desbordamiento;
    enlace de la nav; rótulo a medio escribir.
  - @s30 se queda al volver arriba (P2); recargar arriba → texto; recargar desplazada o con ancla →
    sin vuelo; clic en el logo; bfcache.
  - @s31 `reduce` emulado → sin animaciones; activarlo a mitad de vuelo lo corta; D-3 solo como
    observación.
  - @s32 a 320/360/375/390/414/768/1280 px: alto del `<header>` igual en los dos estados y ≤ 76 px,
    caja del `<a>` idéntica, `<svg>` de 40 px, CLS 0, una fila, Great Vibes bloqueada sin cambios.
  - @s33 árbol AX: un solo link «Nails Lash Studio» en los dos estados; `pointer-events: none` y el clic
    durante el vuelo cae en la nav; Great Vibes local y sin terceros; legibilidad a 320 y 1280 px.
