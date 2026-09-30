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
  .logoTexto y .logoCaligrafia a sus nodos; el `<text>` sin clase (D-8)». Lee la FUENTE. Motivo
  (corregido en la ronda del judge, N2): bajo `css: false` las clases del module son cadenas con hash
  (`_marca_0a3d44`, medido), NO `undefined`. Pero no son un literal estable, y el contrato prohíbe
  aseverar por clase en los renders (el estado vive en atributos), así que ningún render fija QUÉ
  clase lleva cada nodo. Sin este test, el cableado de `className` sería producción que ningún test
  pide (Ley 1) y podría perderse con la suite verde. No asevera ESTADO por clase: solo qué clase
  CONSTANTE lleva cada etiqueta.
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
- **DESVIACIÓN DECLARADA, ratificada por el lead el 2026-09-30 (7aa8ba9: ENMIENDA @s26 en el
  `.feature`).** El contrato ORIGINAL
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
  - La enmienda, ratificada por el lead el 2026-09-30 y escrita en `features/logo_acoplado.feature`
    @s26 (7aa8ba9): «…salvo el especificador del import de VISTA_MARCA, from '../lib/trazo-marca', que
    LogoAcoplado.tsx trae EXACTAMENTE una vez». La excepción es SOLO del componente: la ronda del judge
    (B1, abajo) corrigió el test, que la aplicaba también a la lógica.

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

| @s   | Dónde                                      | Test(s)                                                                                                                                                              |
| ---- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @s1  | `logo-acoplado.test.tsx`                   | «@s1 exactamente un <a> con data-logo, en "texto" y "no", href "/", sin style…»                                                                                      |
| @s2  | `logo-acoplado.test.tsx`                   | 3 `it` «@s2 …» (orden y textos; atributos del `<svg>`/`<text>`; sin ids, máscara, trazo, imagen)                                                                     |
| @s3  | `logo-acoplado.test.tsx`                   | 3 filas «@s3 {estado} → un solo enlace «Nails Lash Studio»…»                                                                                                         |
| @s4  | `logo-acoplado-derivacion.test.tsx`        | 3 `it` con `vi.mock` de NOMBRE y VISTA_MARCA                                                                                                                         |
| @s5  | `logo-acoplado.test.tsx`                   | «@s5 constructor una vez con { threshold: 0, rootMargin "-73px…" }…» y «@s5 al desmontar…»                                                                           |
| @s6  | `logo-acoplado.test.tsx`                   | 7 filas «@s6 bottom … → data-logo …»                                                                                                                                 |
| @s7  | `logo-acoplado.test.tsx`                   | 7 filas «@s7 rootBounds … · cabecera … · bottom …»                                                                                                                   |
| @s8  | `logo-acoplado.test.tsx`                   | «@s8 tras acoplar con vuelo, una entrega con «STUDIO» otra vez a la vista…»                                                                                          |
| @s9  | `logo-acoplado.test.tsx`                   | «@s9 una primera vida que acopló… la segunda nace en «texto»…»                                                                                                       |
| @s10 | `logo-acoplado.test.tsx`                   | 6 filas «@s10 … → data-vuelo …»                                                                                                                                      |
| @s11 | `logo-acoplado.test.tsx`                   | «@s11 en UNA sola entrega… 325px, -75px, 4», «@s11 ninguna otra etiqueta recibe style» y «@s11 la entrega que acopla hace EXACTAMENTE un commit…» (`<Profiler>`, N1) |
| @s12 | `logo-acoplado.test.tsx`                   | 3 filas «@s12 … → "caligrafia", "no", sin style, sin console.error»                                                                                                  |
| @s13 | `logo-acoplado.test.tsx`                   | «@s13 con matchMedia respondiendo «reduce»…»                                                                                                                         |
| @s14 | `logo-acoplado.test.tsx`                   | 3 filas «@s14 … → «texto» mientras está montada, sin errores»                                                                                                        |
| @s15 | `logo-acoplado-estilos.test.ts`            | 7 `it` «@s15 …»                                                                                                                                                      |
| @s16 | `logo-acoplado-estilos.test.ts`            | 5 `it` «@s16 …»                                                                                                                                                      |
| @s17 | `logo-acoplado-estilos.test.ts`            | 8 `it` «@s17 …», con el APOYO declarado del cableado de `className`                                                                                                  |
| @s18 | `logo-acoplado-estilos.test.ts`            | 3 `it` «@s18 …»                                                                                                                                                      |
| @s19 | `logo-acoplado-estilos.test.ts`            | 6 `it` «@s19 …»                                                                                                                                                      |
| @s20 | `cabecera.test.tsx`                        | 3 `it` «@s20 …»                                                                                                                                                      |
| @s21 | `hero.test.tsx`                            | 2 `it` «@s21 …»                                                                                                                                                      |
| @s22 | `logo-acoplado.test.tsx`                   | «@s22 con Cabecera y Hero REALES…»                                                                                                                                   |
| @s23 | `logo-acoplado.test.tsx`                   | 4 `it` «@s23 …»                                                                                                                                                      |
| @s24 | `logo-acoplado-logica.test.ts`             | 8 filas de `estadoTrasObservar` y 6 de `debeVolar`                                                                                                                   |
| @s25 | `logo-acoplado-logica.test.ts`             | 5 filas de `transformacionFlip`, 2 de `variablesDeVuelo` y 4 de `margenDeRaiz`                                                                                       |
| @s26 | `logo-acoplado-estilos.test.ts`            | 4 `it` «@s26 …» (con la ENMIENDA ratificada de `trazo-marca`, solo en el componente; B1)                                                                             |
| @s27 | `logo-acoplado-estilos.test.ts`            | «@s27 mutate trae EXACTAMENTE una vez…». La puntuación → `mutation_tester`                                                                                           |
| @s34 | `logo-acoplado.test.tsx`                   | 3 filas «@s34 … entradas … en UNA entrega → …»                                                                                                                       |
| @s28 | EN VIVO (lead, Chrome + CDP sobre `dist/`) | — (sin test jsdom a propósito)                                                                                                                                       |
| @s29 | EN VIVO                                    | —                                                                                                                                                                    |
| @s30 | EN VIVO                                    | —                                                                                                                                                                    |
| @s31 | EN VIVO                                    | —                                                                                                                                                                    |
| @s32 | EN VIVO                                    | —                                                                                                                                                                    |
| @s33 | EN VIVO                                    | —                                                                                                                                                                    |

Cubiertos por TDD en jsdom o por bytes: **28** (@s1-@s27 y @s34). En vivo, pendientes del lead: **6**
(@s28-@s33).

## Desviaciones y apoyos declarados

1. **@s26, cláusula «trazo-marca» → ratificada por el lead el 2026-09-30** (7aa8ba9: ENMIENDA @s26 en
   `features/logo_acoplado.feature`; detalle en el ciclo 26). El import de `VISTA_MARCA` desde el
   módulo generado `src/lib/trazo-marca.ts` hacía imposible la letra original. El test quita ese
   especificador SOLO de `LogoAcoplado.tsx`, donde exige que aparezca exactamente una vez. La lógica no
   puede nombrarlo de ninguna forma (B1 de la ronda del judge).
2. **@s17, APOYO derivado** (ciclo 17): un test de FUENTE fija qué clase constante lleva cada etiqueta.
   Bajo `css: false` las clases son cadenas con hash (`_marca_0a3d44`), no un literal estable, y el
   contrato prohíbe aseverar por clase en los renders, así que ningún render fija qué clase lleva cada
   nodo (porqué corregido en N2).
3. **Ciclo @s24 sin asiento previo**: tests y funciones ya estaban en `de08858`. No se rehízo el ciclo:
   se midió con 4 sabotajes que muerden.
4. **Guardas que pasan a la primera**: @s8, @s9, @s13, @s22, @s23 y @s26. Cada una con su sabotaje
   medido y restaurado.

## Pendiente para el lead / siguientes agentes

- ~~Ratificar la desviación de @s26~~ → ratificada por el lead el 2026-09-30 (7aa8ba9), con el
  `.feature` ya enmendado.
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

## Ronda del judge (CHANGES_REQUESTED, `progress/judge_logo_acoplado.md`), 2026-09-30

Producción no se toca salvo que un test rojo lo pida. Tests acotados durante la ronda.

### B1 — @s26: la excepción del import vale SOLO para `LogoAcoplado.tsx`

- Hueco REPRODUCIDO antes de tocar el test: con la fuente saboteada en `logo-acoplado-logica.ts`,
  P (`export { VISTA_MARCA } from '../lib/trazo-marca'`) → 34/34 VERDE, y P3 (comentario
  `// VISTA_MARCA vive en from '../lib/trazo-marca'`) → 34/34 VERDE. El test quitaba el especificador de
  los DOS ficheros.
- Arreglo del TEST (ROJO contra la fuente saboteada): los bytes vigilados son `COMPONENTE` sin su ÚNICO
  especificador y `LOGICA` ENTERA. El docblock pasa a «ENMIENDA @s26, ratificada por el lead el
  2026-09-30 (7aa8ba9)».
- **Medido tras el arreglo** (cada sabotaje restaurado):
  - P → ROJO («logo-acoplado-logica.ts: trazo-marca: expected … not to contain 'trazo-marca'»);
  - P3 → ROJO (el mismo mensaje);
  - P4, control, `// ver trazo-marca` en la lógica → rojo;
  - P2, control, un 2.º especificador en un comentario del componente → rojo («expected [ …(3) ] to
    have a length of 2 but got 3»);
  - control, `// ver trazo-marca` en el componente → rojo;
  - fuente ACTUAL → **34/34 verde**. Producción intacta frente a HEAD.

### N1 — @s11: LA-C2 «en el MISMO render», contado con `<Profiler>`

- Hueco REPRODUCIDO: sabotaje S del informe (script `sabotaje_s.py` en el scratchpad). La entrega pone
  solo `{ logo }` y un `useEffect` añade las variables en un SEGUNDO commit. Contra los tests de
  entonces → 48/48 VERDE, porque `act()` vacía los efectos.
- Test nuevo en `logo-acoplado.test.tsx`: «@s11 la entrega que acopla hace EXACTAMENTE un commit: los
  atributos y las variables llegan en el MISMO render». Monta `<Profiler id="cabecera" onRender>`
  alrededor de `<Cabecera />`, entrega 400, `mockClear`, entrega 73. Anclas: `data-vuelo="si"` y las tres
  variables. Aserción: `onRender` EXACTAMENTE una vez.
- **Medido**: fuente ACTUAL → 49/49 verde (producción ya hacía un único `setAcople`, sin cambios). S →
  ROJO («expected "vi.fn()" to be called 1 times, but got 2 times»). Restaurado.

### N2 — el porqué de `css: false`, corregido

- Medido con un test temporal, ya borrado (en `src/__tmp_n2/`, fuera del árbol final): el `class` del
  `<a>` montado es `_marca_0a3d44`, NO `undefined`.
- Corregido en `logo-acoplado.test.tsx` (cabecera), en `logo-acoplado-estilos.test.ts` (docblock del
  apoyo de @s17) y en esta bitácora (ciclo 17 y desviaciones, punto 2). La prohibición de aseverar por
  clase sigue en pie: el hash no es un literal estable y el estado vive en atributos. El paréntesis de
  la línea 110 del `.feature` lo corrige el lead.

### N3 — textos caducados → «ratificada por el lead el 2026-09-30»

- Ciclo 26 (encabezado de la desviación y la enmienda), la lista de desviaciones (punto 1), la lista de
  pendientes y la fila @s26 del mapa. Además, el docblock del test de @s26 (B1).

### N4, N5, N6 — sin acción

- N4 (alineación vertical) → la mide el lead en vivo. N5 → constancia en el informe. N6 → del
  `mutation_tester`.

### Cierre de la ronda

- `prettier --write` sobre los ficheros tocados · `pnpm typecheck` limpio · `pnpm lint` limpio ·
  `pnpm format:check` → «All matched files use Prettier code style!».
- `pnpm test` (suite COMPLETA, UNA vez) → **51 ficheros, 1672 tests, todo verde** (76 s): 1671 + el
  test del `<Profiler>` de N1. F-25 acotado: 111/111.
- Producción NO se ha tocado en esta ronda (`LogoAcoplado.tsx` y `logo-acoplado-logica.ts`, intactos
  frente a HEAD). Ficheros tocados: `logo-acoplado-estilos.test.ts`, `logo-acoplado.test.tsx` y esta
  bitácora. Sin commits.
- Sabotajes medidos en la ronda, 8 en total, todos restaurados:
  - reproducción del hueco: P y P3 → verdes antes del arreglo; S → verde antes del test nuevo;
  - tras el arreglo: P, P3, P4, P2 y el control en el componente → ROJOS; S → ROJO;
  - fuente actual → verde.

## ENMIENDA E-1 — la cabecera en móvil, en una sola fila sin «Reservar» (tdd_craftsman, 2026-09-30)

Contrato: `features/logo_acoplado.feature` @s35-@s41 (APROBADA por Pablo el 2026-09-30, «Aprobado,
prográmalo»). Spec: `project-spec.md` §F-25 «ENMIENDA E-1» (E-1-C1..E-1-C4). Derivados (a)-(f) de
`progress/gherkin_logo_acoplado.md` §E-1, RATIFICADOS por el lead. Punto de partida: `1a5b49a`, suite
1672/1672.

- Por TDD: @s35 (bytes SCSS), @s36 (renderToString), @s37 (jsdom) y @s38 (bytes TSX), todos en
  `cabecera.test.tsx` con describe prefijados «F-25 E-1 @sN» (ARTEFACTOS del `.feature`).
- @s39-@s41 son `@verificacion-viva`: NO se fingen en jsdom. Los verifica el lead en Chrome.
- Por los reinicios del contenedor, durante los ciclos solo corre `pnpm exec vitest run
src/components/cabecera.test.tsx`. La suite completa corre UNA vez, al cierre.
- Línea base acotada: `cabecera.test.tsx` → 14/14 verde.

### Ciclos E-1

#### @s35 — un `@media (max-width: 430px)` que solo oculta «Reservar», detrás de su base (ciclos 35-1..35-6)

Tests en `cabecera.test.tsx`, describe «F-25 E-1 @s35 …». Helpers de la hoja al nivel del módulo
(`sinComentarios`, `vecesQueCasa`, `cuerpoDelBloque`, `reglas`, `declaraciones`, el patrón de
`logo-acoplado-estilos.test.ts`). «Contiene / no contiene» va sobre los BYTES CRUDOS y el troceo en
bloques, sobre la hoja SIN comentarios.

- **35-1 ROJO**: «la hoja contiene EXACTAMENTE un bloque @media (max-width: 430px), y ni "431px" ni
  "@media (min-width"» → `expected +0 to be 1`. **VERDE** mínimo: un `@media (max-width: 430px) {}`
  VACÍO detrás del `@media` de 820 px → 15/15. Sabotajes (restaurados): un segundo bloque de 430 px →
  ROJO («expected 2 to be 1»); `@media (min-width: 431px)` → ROJO (por `431px`); `@media (min-width:
500px)` → ROJO (por `@media (min-width`). **REFACTOR**: el patrón `MEDIA_MOVIL` pierde la bandera
  `g` (arrastraría `lastIndex` al usarlo con `exec`); `vecesQueCasa` la pone por su cuenta → 15/15.
- **35-2 ROJO**: «ese @media contiene EXACTAMENTE un bloque, de selector ".reservar" a secas, con una
  sola declaración: "display: none"» (además, UNA sola `{` en el cuerpo: ni anidamiento ni segundo
  bloque) → `expected +0 to be 1`, porque el bloque estaba vacío. **VERDE**: `.reservar { display:
none; }` dentro → 16/16. Sabotajes (restaurados): `visibility: hidden` añadido → ROJO; un segundo
  bloque `.disparador { min-width: 2rem }`, la alternativa (a) de encoger → ROJO («expected 2 to be
  1»); selector `.nav .reservar` → ROJO. **REFACTOR**: el comentario del porqué encima del `@media`,
  sin los literales vetados → 16/16.
- **35-3**: «ese @media empieza DESPUÉS del bloque base ".reservar" de primer nivel», el derivado (a)
  ratificado. Es una guarda: pasa a la primera porque en 35-1 el bloque ya fue al final. Sabotaje:
  mover el `@media` delante de la base (tras el de 640 px) → ROJO («expected 470 to be greater than
  907»). Restaurado → 17/17.
- **35-4**: «fuera de ese @media, ningún bloque cuyo selector contiene ".reservar" declara "display:
  none" ni "visibility: hidden"». Helper nuevo, `sinElBloque`, que quita el `@media` entero
  (encabezado y cuerpo). Revisa el cuerpo ENTERO de cada bloque con `.reservar` en el selector,
  anidados incluidos, y lleva el ANCLA de que la base sigue fuera. Es una guarda: pasa a la primera
  (18/18). Sabotajes (restaurados): `display: none` en la base → ROJO; `visibility: hidden` en su
  `&:hover` → ROJO; un `@media (max-width: 500px) { .reservar { display: none } }` → ROJO.
- **35-5**: «el @media (max-width: 820px) de F-06 sigue declarando `.disparador` inline-flex, `.lista`
  none y `.disparador[aria-expanded='true'] + .lista` flex, NO contiene ".reservar", y la hoja sigue
  sin "767px"». Es una guarda: pasa a la primera (19/19). Sabotajes (restaurados): `.reservar {
padding }` dentro del de 820 px → ROJO; `.disparador` a `display: flex` → ROJO; la lista abierta a
  `display: block` → ROJO.
- **35-6**: las ANCLAS POSITIVAS, primer `it` del describe: `.cabecera`, `.reservar`, `.disparador` y
  EXACTAMENTE un `@media (max-width: 820px)`. Es una guarda: pasa a la primera (20/20). Sabotaje: un
  segundo bloque de 820 px → ROJO («expected 2 to be 1»); restaurado.
- **REFACTOR de cierre**: nada más que limpiar; los tests de F-06 @s17 y F-25 @s20, que leen esta
  hoja, siguen verdes sin tocar una línea. `cabecera.test.tsx` → **20/20**.
- **Producción de @s35**: `cabecera.module.scss` gana, detrás del `@media` de 820 px (y, por tanto,
  de la base `.reservar`), el comentario del porqué y `@media (max-width: 430px) { .reservar {
display: none; } }`. Nada más cambia en la hoja.

#### @s36 — «Reservar» sigue horneado, en la nav y fuera de la lista, sin nada que lo oculte (ciclos 36-1..36-4)

Tests en `cabecera.test.tsx`, describe «F-25 E-1 @s36 …», sobre `renderToString(<Cabecera />)`.
Helper `enlacesReservar(html)`: los `<a>` cuyo texto es EXACTAMENTE "Reservar", nunca «Reserva». Todo
el escenario dice «el marcado no cambia» (E-1-C1), así que los cuatro `it` son GUARDAS: pasan a la
primera. Producción no se toca: cada guarda se mide con sabotajes en `MenuNavegacion.tsx`, y todos
se restauran (`git diff` de `MenuNavegacion.tsx`, vacío).

- **36-1**: ANCLA POSITIVA. EXACTAMENTE un «Reservar», dentro de la `<nav>` «Principal», con `href`
  exactamente `#reserva-titulo` → 21/21. Sabotajes: `href="#reserva"` → ROJO; enlace duplicado → ROJO
  («expected [ …(2) ] to have a length of 1»).
- **36-2**: DESPUÉS del `</ul>` de `id="menu-navegacion"` y ANTES de `</nav>` → 22/22. Sabotaje:
  mudar «Reservar» a un `<li>` de la lista, la alternativa (b) → ROJO («expected 938 to be greater
  than 1006»).
- **36-3**: su etiqueta de apertura, con el ANCLA de que es la de `href="#reserva-titulo"`, no
  contiene `hidden`, `aria-hidden`, `style=`, `tabindex` ni `inert` (derivado (c)) → 23/23. Sabotajes:
  `hidden`, `aria-hidden="true"`, `style={{ opacity: 0 }}`, `tabIndex={-1}` e `inert` → los cinco ROJOS.
- **36-4**: `href="#reserva-titulo"` EXACTAMENTE dos veces en la cabecera → 24/24. Sabotajes: «Reserva»
  de la lista a otra ancla → ROJO (1); un tercer enlace a la reserva → ROJO (3). **REFACTOR**:
  `split(...).toHaveLength(3)` pasa a `vecesQueCasa(horneado, /href="#reserva-titulo"/)` con `toBe(2)`,
  que se lee mejor; re-medido el sabotaje del tercer enlace → ROJO («expected 3 to be 2»). → 24/24.

#### @s37 — ningún JS decide el ancho (ciclos 37-1..37-3)

Tests en `cabecera.test.tsx`, describe «F-25 E-1 @s37 …», con su propio `afterEach`
(`restoreAllMocks` + `unstubAllGlobals`). El montaje, `montarA320()`, fija `innerWidth` a 320, pone un
`matchMedia` espía que responde `matches: true` a todo, espía `window.addEventListener`, sustituye el
`IntersectionObserver` y fija la caja del `<header>` de la geometría de referencia (alto 73,6).

- **Apoyo derivado, declarado.** Monto `<Cabecera />` JUNTO al papel del hero (`<svg
data-acople="origen">` y `<span data-acople="disparo">`), igual que `montar()` de
  `logo-acoplado.test.tsx`. Sin el disparo, el efecto de `LogoAcoplado` vuelve antes de construir el
  observador, y «corren sus efectos» con el observador sustituido no probaría nada. El Given se ancla
  dentro de `montarA320`: `innerWidth` es 320, `window.matchMedia` es el espía, el observador se
  construye UNA vez y con `rootMargin "-73px 0px 0px 0px"` (literal a mano: la geometría llega).
- Los tres `it` son GUARDAS: producción no tiene JS de ancho, así que pasan a la primera. Se miden con
  sabotajes en `MenuNavegacion.tsx`, todos restaurados.
- **37-1**: ANCLA POSITIVA. `getAllByRole("link", { name: "Reservar" })` da EXACTAMENTE uno, dentro de
  la navegación «Principal», con `href` `#reserva-titulo` → 25/25. Sabotaje `useIsMobile` (un efecto que
  lee `matchMedia('(max-width: 430px)')` y condiciona el enlace) → ROJO («Unable to find … "Reservar"»).
  Caen también @s15 y @s27 de F-06: jsdom no trae `matchMedia`.
- **37-2**: el enlace no lleva `hidden`, `aria-hidden`, `style`, `tabindex` ni `inert`. Se consulta con
  `hidden: true`, para que un enlace sacado del árbol no escape por la consulta y lo que se mire sea el
  atributo → 26/26. Sabotajes `aria-hidden="true"`, `tabIndex={-1}` e `inert` → ROJO en los tres.
- **37-3**: `matchMedia` no se llama ninguna vez y `window.addEventListener` no recibe `"resize"` ni
  `"orientationchange"` → 27/27. Sabotajes: `useIsMobile` → ROJO (los tres `it` de @s37); un efecto con
  `addEventListener('resize')` → ROJO; y con `'orientationchange'` → ROJO.
- **REFACTOR**: `montarA320` se parte en `sustituirObservador`, `matchMediaQueDiceQueSi` y
  `fijarCajaDeLaCabecera`, y gana el ancla del `rootMargin`. → 27/27. Re-medido tras el refactor:
  `useIsMobile` → ROJO en los tres `it` de @s37.

#### @s38 — guardas de FUENTE sobre `MenuNavegacion.tsx` y `Cabecera.tsx` (ciclos 38-1 y 38-2)

Tests en `cabecera.test.tsx`, describe «F-25 E-1 @s38 …», sobre los BYTES CRUDOS (los comentarios
también cuentan). Antes de escribirlos comprobé que la letra se cumple hoy sin tocar producción:
`estilos.reservar` ×1, `href="#reserva-titulo"` ×2 y ningún vetado en los dos ficheros. Ninguna
guarda veta `if (`, `?`, `&&` ni `||`: los dos ficheros están en `mutate`. Los dos `it` son GUARDAS y
todos sus sabotajes se restauraron (`git diff` de los dos `.tsx`, vacío).

- **38-1**: ANCLAS POSITIVAS, `estilos.reservar` EXACTAMENTE una vez y `href="#reserva-titulo"`
  EXACTAMENTE dos (derivado (d)) → 28/28. Sabotajes: la clase de «Reservar» pasa a `estilos.nav` → ROJO
  («expected +0 to be 1»). Solo lo caza @s38: @s36 y @s37 no miran la clase, como anticipa el `.feature`.
  Y un comentario `// estilos.reservar` → ROJO («expected 2 to be 1»).
- **38-2**: ni `MenuNavegacion.tsx` ni `Cabecera.tsx` contienen `useIsMobile`, `matchMedia`,
  `innerWidth`, `outerWidth`, `screen.width`, `'resize'` ni `"resize"`. Cada fichero lleva el ANCLA
  `export function` → 29/29. Sabotajes, uno a uno como comentario: en `Cabecera.tsx`, `useIsMobile`,
  `window.innerWidth`, `window.outerWidth`, `screen.width`, `'resize'` y `"resize"`; en
  `MenuNavegacion.tsx`, `matchMedia`. Los siete, ROJOS, con el fichero y el literal en el mensaje.
- E-1-C3, «sin pares de contraste nuevos», ya lo cubre @s19 de F-25 («MINIMO_DE_PARES sigue en 18»,
  `logo-acoplado-estilos.test.ts`). E-1 no toca `puerta-contraste`.

### Trazabilidad E-1 @s → test

| @s   | Dónde                                      | Test(s)                                                                                                                                                                                                                          |
| ---- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @s35 | `cabecera.test.tsx`                        | 6 `it` «@s35 …»: anclas; EXACTAMENTE un `@media (max-width: 430px)` sin `431px` ni `@media (min-width`; un solo bloque `.reservar { display: none }`; después de la base; nada que lo oculte fuera; 820 px intacto y sin `767px` |
| @s36 | `cabecera.test.tsx`                        | 4 `it` «@s36 …» sobre `renderToString(<Cabecera />)`: uno, en la nav y con su href; fuera de la `<ul>`; sin atributos que lo oculten; `href="#reserva-titulo"` ×2                                                                |
| @s37 | `cabecera.test.tsx`                        | 3 `it` «@s37 …» en jsdom a 320 px con `matchMedia` que dice sí: el enlace sigue; sin atributos que lo oculten; ni `matchMedia` ni `resize`/`orientationchange`                                                                   |
| @s38 | `cabecera.test.tsx`                        | 2 `it` «@s38 …» sobre bytes: `estilos.reservar` ×1 y `href="#reserva-titulo"` ×2; ningún literal de ancho en `MenuNavegacion.tsx` ni en `Cabecera.tsx`                                                                           |
| @s32 | EN VIVO (lead)                             | — (enmendado por E-1: solo se cumple con ella; sin test jsdom a propósito)                                                                                                                                                       |
| @s39 | EN VIVO (lead, Chrome + CDP sobre `dist/`) | — (430 frente a 431 px, una fila, árbol AX, Tab y sin JS: NO se finge en jsdom)                                                                                                                                                  |
| @s40 | EN VIVO                                    | — (`scrollPaddingTop` 96 px y los ocho saltos a 320, 390 y 430 px)                                                                                                                                                               |
| @s41 | EN VIVO                                    | — (los tres caminos a la reserva a 320 y 430 px)                                                                                                                                                                                 |

E-1, cubiertos por TDD en bytes, `renderToString` o jsdom: **4** escenarios (@s35-@s38) con **15** tests
nuevos. En vivo, pendientes del lead: **3** (@s39-@s41), más @s32, que solo se cumple con E-1. Con E-1,
F-25 suma **32** escenarios cubiertos por TDD (@s1-@s27, @s34 y @s35-@s38) y **9** en vivo (@s28-@s33 y
@s39-@s41), **41** en total.

### Pendiente para el lead (E-1)

- **@s39-@s41 y @s32 EN VIVO** sobre `dist/` en Chrome + CDP, con resultados en
  `progress/verificacion_viva_logo_acoplado.md`. La frontera 430/431 px, «Reservar» en `display: none`
  con caja 0 × 0 y fuera del árbol AX y del Tab hasta 430 px, la misma medida sin JS, el
  `scroll-padding` de 96 px que vuelve a cubrir la cabecera y los tres caminos a la reserva.
- **mutation_tester**: E-1 no añade producción TS. `MenuNavegacion.tsx` y `Cabecera.tsx` no cambian
  (`git diff`, vacío). El SCSS no lo muta Stryker; su mutante es HUMANO y lo cubren los sabotajes de
  @s35 medidos arriba.
- `feature_list.json`: el acceptance ya dice 41 escenarios. No toco el status.

### Cierre E-1 (2026-09-30)

- Durante los ciclos solo corrió `pnpm exec vitest run src/components/cabecera.test.tsx`: de 14 a
  **29/29**.
- Al cierre, UNA vez cada uno: `prettier --write` sobre los cuatro ficheros tocados; `pnpm typecheck`
  limpio; `pnpm lint` limpio; `pnpm format:check` → «All matched files use Prettier code style!»; y
  `pnpm test` con la suite COMPLETA → **51 ficheros, 1687 tests, todo verde** (83 s). Son los 1672 de
  `1a5b49a` más los 15 nuevos de E-1: @s35 6, @s36 4, @s37 3 y @s38 2.
- Producción: SOLO `src/components/cabecera.module.scss`, que gana 10 líneas (el comentario y
  `@media (max-width: 430px) { .reservar { display: none; } }`, detrás del `@media` de 820 px).
  `MenuNavegacion.tsx`, `Cabecera.tsx`, `LogoAcoplado.tsx`, el hero, F-27 y `stryker.config.json`,
  intactos frente a HEAD.
- Ficheros tocados: `cabecera.module.scss`, `cabecera.test.tsx`, esta bitácora y `progress/current.md`.
  Sin commits: los hace el lead. No toco `feature_list.json` ni el status.
- `bin/harness init` no se relanza. Por instrucción del lead la suite completa corre una sola vez, e
  `init` = typecheck + lint + format:check + test, medidos uno a uno arriba.
