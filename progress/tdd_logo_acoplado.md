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
