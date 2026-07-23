# Diario TDD — `galeria_carrusel` (carrusel coverflow 3D en domo)

> Contrato: `features/galeria_carrusel.feature` (@s1..@s18).
> Fuente de verdad de diseño: `progress/galeria_coverflow_diseno.md`.
> Rama: `feat/galeria-coverflow-3d`. Fecha: 2026-07-22.

## Cifras finales (MEDIDAS por mí, no estimadas)

| Fichero | Tests |
|---|---|
| `src/components/galeria-logica.test.ts` (NUEVO) | **47** |
| `src/components/galeria.test.tsx` (ampliado: 7 viejos INTACTOS + 50 nuevos) | **57** |
| `src/components/galeria-estilos.test.ts` (NUEVO) | **21** |
| **Total galería** | **125 verdes** |

- `pnpm exec vitest run src/components src/pages` → **386 tests verdes en 18 ficheros** (147 s).
  Incluye los **build-based** (`home-horneado`, `contacto-horneado`, `boton-whatsapp-montaje`), que
  corren el `pnpm build` REAL con las cinco puertas: **la home no se ha roto**.
- `pnpm typecheck` → **exit 0**, sin salida.
- `pnpm lint` → **exit 0**, 0 errores y **0 warnings** (el repo exige 0).
- `npx prettier --write src/components/galeria*` → aplicado solo a los 5 ficheros de la galería.
- Los **7 tests vivos** de `galeria.test.tsx` no se tocaron: siguen siendo los 7 primeros del fichero.
- `pnpm test` completo y `pnpm build`: **los corre el lead** (yo no los lancé; ver «Lo que NO hice»).

## Ficheros tocados (la lista cerrada, ni uno más)

- `src/components/galeria-logica.ts` — NUEVO. Lógica pura, dependencias inyectadas.
- `src/components/galeria-logica.test.ts` — NUEVO.
- `src/components/Galeria.tsx` — reescrito: solo cablea + JSX + ARIA.
- `src/components/galeria.module.scss` — reescrito: toda la estética.
- `src/components/galeria.test.tsx` — ampliado.
- `src/components/galeria-estilos.test.ts` — NUEVO.
- `progress/tdd_galeria_carrusel.md` — este diario.

**NO** se tocó `stryker.config.json` (hay que añadirle `src/components/Galeria.tsx` y
`src/components/galeria-logica.ts`: **lo hace el lead**), ni `home.tsx`, ni `vitest.config.ts`, ni
`package.json`, ni ningún test ajeno.

---

## Mapa @s → test concreto (los 18)

| @s | Fichero | Test (título literal, abreviado) |
|---|---|---|
| **@s1** | `galeria.test.tsx` | los 7 originales (`seis <img>`, alts, srcs, `width/height/lazy`, `ph-woman`) + `@s1 el horneado trae EXACTAMENTE SEIS etiquetas <img>, ni una más` + `@s1 tras dar una vuelta entera siguen siendo seis <img>, con los mismos alt y en el mismo orden` |
| **@s2** | `galeria.test.tsx` | `@s2 su elemento raíz sigue siendo un <div>…` · `@s2 …no aporta ningún <h1> y aporta EXACTAMENTE UN <h2>…` · `@s2 los puntos NO son <a href="#…"> ni viven en un <nav>…` · `@s2 la nota honesta sigue horneada, carácter a carácter…` · `@s2 la galería sigue montada DENTRO de <main> en la home` |
| **@s3** | `galeria-logica.test.ts` | `@s3 con la 3ª centrada, la foto $foto está a distancia $distancia` (×6, tabla a mano) · `@s3 EXACTAMENTE UNA …a distancia 0` · `@s3 NINGUNA …a distancia -3` |
| **@s4** | `galeria-logica.test.ts` | `@s4 con la QUINTA centrada, la PRIMERA está a distancia +2` · `@s4 ninguna de las 36 combinaciones cae fuera del rango [-2, +3]` · `@s4 avanzar seis posiciones …vuelve a esa misma foto` · `@s4 el índice circular da la vuelta por los DOS extremos` |
| **@s5** | `galeria-logica.test.ts` (`claveDistancia`, `signoDe`, `capaDe`: 4 tests) + `galeria.test.tsx` | `@s5 recién montada, la tarjeta $foto expone data-distancia="$distancia" y --s: $s` (×6) · `@s5 …z-index inline MAYOR QUE CERO` · `@s5 EXACTAMENTE UNA …data-distancia="0"` · `@s5 el z-index DECRECE ESTRICTAMENTE…` |
| **@s6** | `galeria.test.tsx` | `@s6 el contenedor expone role="group" + aria-roledescription="carrusel"…` · `@s6 NO expone role="region"` · `@s6 hay SEIS diapositivas …nombres «n de 6»` · `@s6 NINGUNA diapositiva expone aria-hidden` · `@s6 «Anterior» y «Siguiente» apuntan con aria-controls…` (+ `@s6 las seis diapositivas se llaman «1 de 6» … «6 de 6»` en `galeria-logica.test.ts`) |
| **@s7** | `galeria-logica.test.ts` + `galeria.test.tsx` | `@s7 rotando=$rotando y foco=$foco ⇒ aria-live="$voz"` (la tabla de verdad COMPLETA, 4 filas) · `@s7 recién montada …aria-live="off" y aria-atomic="false"` · `@s7 parada por el usuario, pasa a aria-live="polite"` |
| **@s8** | `galeria.test.tsx` | 7 tests: etiqueta que cambia · sin `aria-pressed` en ninguno de los dos estados · `data-estado` · `12000 ms NO cambian la foto…` · `es el PRIMER tabulable …los NUEVE controles` · `se hornea en el SSR` · `NINGÚN enfocable dentro del contenedor con perspectiva` (+ `debeRotar` con `pausadoPorElUsuario` ganando, en `galeria-logica.test.ts`) |
| **@s9** | `galeria.test.tsx` | `@s9 a los 3999 ms sigue la PRIMERA; a los 4000 ms queda la SEGUNDA (y la 1ª a distancia -1)` · `@s9 otros 4000 ms centran la TERCERA, y a los 24000 ms …vuelve la PRIMERA` (+ `@s9 la cadencia del autoplay son 4000 milisegundos`) |
| **@s10** | `galeria.test.tsx` + `galeria-logica.test.ts` | `@s10 el PUNTERO para mientras está dentro y REANUDA sola al salir` · `@s10 el FOCO de teclado para, y al salir NO reanuda sola` · `@s10 el ratón encima PARA …y al salir REANUDA` · `@s10 el foco de teclado dentro PARA` |
| **@s11** | `galeria.test.tsx` + `galeria-logica.test.ts` | `@s11 con el puntero encima y el foco dentro, pulsar «Iniciar» avanza UNA posición a los 4000 ms` · `@s11 el arranque explícito GANA sobre el ratón encima y sobre el foco dentro` |
| **@s12** | `galeria.test.tsx` | `@s12 a los 12000 ms sigue centrada la PRIMERA` · `@s12 el control se anuncia «Iniciar…», NO expone disabled y las seis diapositivas siguen ahí` · `@s12 pulsar «Iniciar» …SÍ arranca la rotación` · `@s12 sin la preferencia …arranca ROTANDO` |
| **@s13** | `galeria-estilos.test.ts` | 5 tests: `perspective` propiedad y nunca función · sin `preserve-3d` · `overflow: hidden` fuera de la regla con perspectiva · `opacity` fuera de la tarjeta · sin `will-change` / sombra de filtro / `content-visibility: auto` |
| **@s14** | `galeria-estilos.test.ts` | 6 tests: EXACTAMENTE UNA `transform:` · orden traslación → `rotateY` → `scale` · nunca `transform: none` · los seis valores de reserva · magnitudes por `[data-distancia='N']` · `0.8s cubic-bezier(0.22, 1, 0.36, 1)` con x∈[0,1] · (+ el domo: `--y` negativo en la centrada y positivo en las laterales) |
| **@s15** | `galeria-estilos.test.ts` | 6 tests: el `@media (max-width: 640px)` suaviza giro/separación/profundidad · las vecinas asoman (opacidad > 0) · 640px es el ÚNICO breakpoint · ningún giro llega a 90° · `@media (prefers-reduced-motion: reduce)` con `transition: none` · la oculta declara `transition: none` FUERA del @media · sin `url(https://`, sin `@import url(`, sin `@font-face` |
| **@s16** | `galeria.test.tsx` | `@s16 «$boton» desde la foto $partida centra la $esperada` (las 4 filas del Outline, incluida la vuelta hacia ATRÁS) · `@s16 ninguna tarjeta se queda sin data-distancia ni expone un valor fuera de {0,1,2,3}` |
| **@s17** | `galeria.test.tsx` + `galeria-estilos.test.ts` | `@s17 pulsar «Ver la foto 5 de 6» centra la QUINTA foto` · `@s17 el punto pulsado pasa a aria-disabled="true"…` · `@s17 EXACTAMENTE UNO …en todo momento` · `@s17 los seis son <button type="button"> tabulables: NINGUNO usa el disabled nativo` · `@s17 el punto actual y el disponible usan DOS tokens distintos de fondo` · `@s17 los puntos NO se pintan con --accent …ni delimitan con --line` (+ `@s17 los seis puntos se llaman «Ver la foto n de 6»`) |
| **@s18** | `galeria.test.tsx` + `galeria-logica.test.ts` | `@s18 con la 1ª centrada, pulsar la TERCERA …la centra y manda la 1ª a "2" con --s "-1"` · `@s18 el orden del DOM …sigue siendo 1..6` · los 5 tests de `pasosDelArrastre` (dirección, umbral, frontera INCLUSIVA, umbral inyectado) |

---

## Ciclos Rojo → Verde → Refactor

Cada ciclo empieza escribiendo el test y **viendo el rojo** antes de tocar producción.

| # | @s | ROJO (qué falló) | VERDE (cambio mínimo) |
|---|---|---|---|
| 1 | @s3 | el import de `./galeria-logica` no compila | `distanciaCircular` con un solo módulo → 2 casos rojos → se añade el doble módulo y el comparador `>` |
| 2 | @s4 | `indiceCircular is not a function` | se EXPORTA `indiceCircular` (antes era privada) |
| 3 | @s5 | `claveDistancia/signoDe/capaDe is not a function` | tabla `CLAVES`, `Math.sign`, `total - Math.abs(d)` |
| 4 | @s6/@s17 | `etiquetaDeDiapositiva/etiquetaDelPunto/etiquetaDeRotacion/claveDeRotacion is not a function` | las cuatro etiquetas, `etiquetaDelPunto` compuesta sobre la de diapositiva |
| 5 | @s7/@s10/@s11 | `vozDeLaPista/debeRotar is not a function` | `rotando && !foco` y el predicado de 3 precedencias |
| 6 | @s9/@s18 | constantes `undefined`, `pasosDelArrastre is not a function` | `MILISEGUNDOS_POR_FOTO`, `UMBRAL_DE_ARRASTRE`, umbral inclusivo |
| 7 | @s5 (DOM) | 9 rojos: no hay `data-distancia`, ni `--s`, ni `z-index` | `Galeria.tsx` pasa a tarjetas con los tres atributos y `useState(0)` |
| 8 | @s6 | 3 rojos: sin `role="group"`, sin `aria-labelledby`, sin `aria-controls` | contenedor del carrusel + ids `galeria-titulo` / `galeria-pista` |
| 9 | @s16 | 4 rojos: las flechas no movían nada | `desplazar(pasos)` con `indiceCircular` |
| 10 | @s17/@s18 | 5 rojos: no hay puntos ni clic en la tarjeta | grupo de puntos + `onClick` de la tarjeta |
| 11 | @s7..@s12 | 15 rojos: no hay control de rotación, ni autoplay, ni pausas, ni `aria-live` | control de rotación (primer tabulable), `setInterval` en efecto, 4 estados, `matchMedia` guardada |
| 12 | @s1/@s2 | (regresión: verdes al escribirlos; su mordida se prueba con los sabotajes 10 y 11) | — |
| 13 | @s13..@s15/@s17 | 19 de 21 rojos sobre el SCSS viejo | `galeria.module.scss` reescrito entero |

**Refactor en verde** (nunca en rojo): extracción de `indiceCircular` desde `distanciaCircular`;
`etiquetaDelPunto` compuesta sobre `etiquetaDeDiapositiva` en vez de duplicar el «n de N»;
`PASO_DE_FLECHA` como constante única para flechas y autoplay; eliminación de un `margin`
especulativo en `.marco` que dependía de una variable inexistente.

---

## Sabotajes (obligatorios) — 20, todos cazados

Cada uno se aplicó a mano sobre producción, se corrió la suite y se restauró.

| # | Sabotaje | Resultado |
|---|---|---|
| 1 | `bruta > total / 2` → `>=` (el empate sale por la izquierda, -3) | **3 rojos** (@s3 ×2, @s5) |
| 2 | doble módulo → un solo `%` | **5 rojos** (@s3, @s4) |
| 3 | `capaDe` → `Math.abs(d) - total` (z-index negativo) | **2 rojos** (@s5) |
| 4 | `CLAVES[Math.abs(d)]` → `CLAVES[d]` (la izquierda pierde su clave) | **2 rojos** (@s5) |
| 5 | `vozDeLaPista` deja de mirar el foco | **1 rojo** (@s7) |
| 6 | `debeRotar`: el arranque explícito gana a la parada del usuario | **1 rojo** (@s8) |
| 7 | `pasosDelArrastre` invertido | **4 rojos** (@s18) |
| 8 | `zIndex: -capaDe(...)` en el componente | **2 rojos** (@s5) |
| 9 | se quita `--s` del `style` inline | **8 rojos** (@s5, @s18) |
| 10 | se CLONA una diapositiva (la técnica de Swiper) | **20 rojos** (@s1, @s5, @s6, @s16, @s17) |
| 11 | se añade `aria-pressed` al control de rotación | **2 rojos** (@s8, @s11) |
| 12 | `onBlur` que devuelve la rotación (el foco REANUDA) | **1 rojo** (@s10) |
| 13 | `aria-live` fijo en `off` | **1 rojo** (@s7) |
| 14 | se ignora `prefers-reduced-motion` | **3 rojos** (@s12) |
| 15 | `disabled` nativo en los puntos en vez de `aria-disabled` | **3 rojos** (@s17) |
| 16 | `transform-style: preserve-3d` en el escenario | **1 rojo** (@s13) |
| 17 | `scale` ANTES de trasladar | **1 rojo** (@s14) |
| 18 | se quitan los valores de reserva de `var(--s)` / `var(--x)` | **1 rojo** (@s14) |
| 19 | `perspective` en el elemento que recorta (`.marco`) | **1 rojo** (@s13) |
| 20 | la tarjeta oculta pierde su `transition: none` (barrería la pantalla) | **1 rojo** (@s15) |

Ningún sabotaje se quedó verde: no hubo que reescribir ningún test por no morder.

---

## Decisiones que el brief NO cubría (y por qué)

1. **La etiqueta del control sigue a la VOLUNTAD del usuario, no a la pausa transitoria del ratón.**
   El brief da `etiquetaDeRotacion(rotando)` sin decir qué «rotando» se le pasa. Se le pasa
   `!pausado`, no el `rotando` efectivo. Si siguiera al efectivo, al acercar el puntero al carrusel
   —cosa obligatoria para pulsar el botón— la etiqueta cambiaría a «Iniciar…» justo antes del clic, y
   el usuario que quiere PARAR acabaría ARRANCANDO. El contrato (@s8, @s11, @s12) pasa igual con las
   dos lecturas; esta es la única sin ese fallo. El `aria-live`, en cambio, sí usa el `rotando`
   EFECTIVO, que es lo que @s7 describe.
2. **Cómo se implementa «el foco NO reanuda».** El estado `foco` **no se limpia nunca al salir**: no
   hay `onBlur`. Lo devuelve solo el botón, que pone `arranqueExplicito`. Es la lectura literal de la
   tabla del brief §8 con las cuatro entradas puras que pide.
3. **Un ratón o un foco NUEVOS cancelan el `arranqueExplicito`.** Si el arranque explícito fuera
   pegajoso para siempre, tras pulsar «Iniciar» el carrusel ya no volvería a pararse al pasar el ratón
   —una regresión de SC 2.2.2 en la práctica—. El APG solo pide ignorar los estados de ratón/foco
   VIGENTES en el momento del clic, que es exactamente lo que hace esta implementación (no llega
   ningún evento nuevo). @s11 lo fija y sigue verde.
4. **`indiceCircular` se duplica en `galeria-logica.ts`** en vez de importarse de `equipo-logica.ts`.
   El brief lo declara en la API de la galería; importarlo de otra feature acoplaría dos contratos.
   El sitio limpio sería `src/lib/`, pero crear ficheros ahí está fuera de mi lista cerrada.
   **Deuda declarada** para el lead: si un día hay un tercer usuario, subirlo a `src/lib/circular.ts`.
5. **`capaDe` devuelve `total - |d|` (6, 5, 4, 3)** en vez de los 40/30/20/10 ilustrativos del brief.
   El contrato solo exige > 0, entero y estrictamente decreciente; menos aritmética = menos mutantes
   equivalentes (con `(total - |d|) * 10` el mutante `*` → `%` sobrevive: sigue siendo positivo,
   entero y decreciente).
6. **`claveDistancia` usa una tabla `CLAVES[Math.abs(d)]`** (patrón `diaSemanaDe` de
   `equipo-logica.ts`) en vez de un `clamp` con `>`: un `d > 3 ? 3 : d` produce un **mutante
   equivalente** (`>=` da el mismo resultado en el único punto alcanzable) que dejaría la mutación
   por debajo del 100 % sin que ningún test pudiera matarlo.
7. **El grupo de puntos usa `data-actual="sí"/"no"`** como gancho de estilo (el SCSS necesita un
   selector; `aria-disabled` habría servido, pero mezclar semántica ARIA y estilo hace frágil lo uno
   y lo otro). El estado accesible sigue siendo `aria-disabled`, y @s17 lo asevera por ahí.
8. **La galería centra el arco con `display: grid` + `grid-area: 1 / 1`**, no con `position:
   absolute` + márgenes negativos: evita añadir un `translate(-50%, -50%)` a la lista de funciones de
   la `transform`, que es justo lo que @s14 prohíbe tocar.
9. **`.galeria` lleva `overflow: hidden`** (además de `.marco`): las tarjetas a distancia 2 y 3 se
   salen del contenedor y, sin este seguro, el `<body>` podría ganar barra horizontal en móvil. NO
   está en el elemento con perspectiva, así que @s13 sigue verde.

## Lo que NO hice (y por qué)

- **No cableé el ARRASTRE con el dedo.** La función pura `pasosDelArrastre` existe y está testeada
  por valor (5 tests, frontera inclusiva incluida), tal y como el contrato @s18 declara. El
  CABLEADO con Pointer Events **no se puede cubrir en jsdom 25** (no implementa `PointerEvent`) y
  produciría mutantes inmatables en `Galeria.tsx` justo cuando el lead va a meter ese fichero en
  Stryker con umbral 100 %. Queda como **deuda declarada** para la verificación EN VIVO en Chrome:
  añadir `onPointerDown`/`onPointerUp` sobre `.marco` y llamar a `desplazar(pasosDelArrastre(...))`.
  Decisión consciente, no olvido; el gesto por teclado (flechas @s16 y puntos @s17) ya cubre
  SC 2.1.1.
- **No lancé `pnpm build`, ni `pnpm test` completo, ni `pnpm format`** (instrucción del lead).
- **No añadí ningún test build-based**: lo horneado se cubre con `renderToString`.
- **No toqué `stryker.config.json`.** ⚠️ Al terminar, `git status` lo daba como modificado con las
  dos rutas de la galería ya añadidas a `mutate` (`Galeria.tsx` y `galeria-logica.ts`): **ese cambio
  no es mío** —lo hizo el lead, o alguien, en paralelo—. Lo dejo tal cual, sin revertir. Es
  exactamente lo que pide el brief §2.

## Lo que el lead tiene que verificar EN VIVO en Chrome

1. Que la tarjeta que entra en `[data-distancia='3']` **no barra la pantalla** (la discontinuidad
   -2 → +3 con `transition: none`). Es la única trampa del brief §6 que ningún test puede probar.
2. Que el `z-index` manda **sin** `transform-style` (las laterales no se pintan por encima de la
   centrada).
3. Que el domo se lee como domo y no como abanico plano (palanca: subir `--y` de la distancia 2 de
   84 px a ~110 px, brief §5).

---

## Ciclo de remate (Enmienda 1 + judge + mutación) — 2026-07-23

> Contrato v2.1 (`features/galeria_carrusel.feature`, 19 escenarios). Cierra: los 4 cambios
> requeridos + el recomendado del hallazgo 8 (`progress/judge_galeria_carrusel.md` §7) y la
> Enmienda 1 (@s19 nuevo, @s12/@s15/@s17 ampliados, `progress/galeria_coverflow_diseno.md`).
> Solo vitest DIRIGIDO (instrucción del lead): las puertas completas las corre él.

### Cifras del remate (MEDIDAS)

| Fichero | Antes | Ahora | Nuevos |
|---|---|---|---|
| `galeria.test.tsx` | 57 | **73** | +16 |
| `galeria-estilos.test.ts` | 21 | **25** | +4 |
| `galeria-logica.test.ts` | 47 | 47 | 0 (sin cambios: las decisiones ya estaban) |
| **Total galería** | 125 | **145** | **+20** |

`pnpm exec tsc --noEmit` → 0 · `eslint` (5 ficheros tocados) → 0 · prettier aplicado.

### Mapa punto → test

| Punto | Test (título literal, abreviado) | Fichero |
|---|---|---|
| Judge 1 (`data-actual`) | `@s17 data-actual marca «sí» SOLO en el punto actual y «no» en los otros cinco…` | `galeria.test.tsx` |
| Judge 2 (glifo visible) | `@s8 el glifo VISIBLE del control es «❙❙» rotando y «▶» pausado` | `galeria.test.tsx` |
| Judge 3 (guarda muerta) | — borrado de `typeof window === 'undefined' \|\|` (sin test: deleción en verde; la guarda de `matchMedia` queda sola y vive ahora en el efecto) | `Galeria.tsx` |
| Judge 4 (`demo-seccion`) | `@s2 la raíz horneada conserva la clase global demo-seccion…` (patrón `equipo.test.tsx:128-138`) | `galeria.test.tsx` |
| Judge 8 (recomendado) | `@s11 tras «Iniciar», un ratón NUEVO vuelve a pausar: el arranque explícito NO es pegajoso` | `galeria.test.tsx` |
| @s19 (frontera inclusiva ←) | `@s19 48 px a la IZQUIERDA (baja en 200, sube en 152)…traen la SIGUIENTE` | `galeria.test.tsx` |
| @s19 (frontera →) | `@s19 un segundo gesto de 48 px a la DERECHA (200 → 248) devuelve la PRIMERA…` | `galeria.test.tsx` |
| @s19 (bajo umbral) | `@s19 47 px (200 → 153) quedan POR DEBAJO del umbral: no se mueve NADA` | `galeria.test.tsx` |
| @s19 (dirección, no-frontera) | `@s19 la dirección de un carrusel táctil: …200 y 140 AVANZA` · `@s19 …200 y 260 RETROCEDE` | `galeria.test.tsx` |
| @s19 (una sola posición) | `@s19 un gesto larguísimo (400 → 40) mueve EXACTAMENTE UNA posición` | `galeria.test.tsx` |
| @s19 (clic-vs-gesto) | `@s19 el gesto largo sobre una tarjeta lateral GANA a su click sintetizado…` · `@s19 el toque corto…la sigue centrando (@s18)` (anti-vacuidad) | `galeria.test.tsx` |
| @s12 (pausa en caliente) | `@s12 activar la preferencia con la página abierta pausa la rotación EN CURSO…` | `galeria.test.tsx` |
| @s12 (matches:false, rotando) | `@s12 un cambio que DESACTIVA la preferencia NO pausa una rotación en curso` | `galeria.test.tsx` |
| @s12 (matches:false, pausada) | `@s12 un cambio que DESACTIVA la preferencia NO arranca una pausada…` | `galeria.test.tsx` |
| @s12 (limpieza) | `@s12 al desmontar, removeEventListener recibe EXACTAMENTE el manejador…con "change"` | `galeria.test.tsx` |
| @s15 (pointer-events) | `@s15 la tarjeta OCULTA declara pointer-events: none…` | `galeria-estilos.test.ts` |
| @s17 (diana 24 px) | `@s17 la caja interactiva del punto mide 1.5rem por lado y el círculo visible sigue en 0.75rem` · `@s17 el anillo de 1px viaja EN el pseudo-elemento…` · `@s17 las cajas de 24 px NO se solapan…` | `galeria-estilos.test.ts` |

### Ciclos Rojo → Verde (del remate)

| # | Punto | ROJO | VERDE |
|---|---|---|---|
| R1-R2, R4-R5 | judge 1/2/4/8 | tests de caracterización de producción EXISTENTE: nacen verdes; su mordida se demostró por SABOTAJE (tabla de abajo) | — |
| R3 | judge 3 | — (deleción en verde, 59/59 tras borrar) | guarda muerta fuera |
| R6 | @s19 | **6 rojos de 8** (los 2 verdes son los contraejemplos «no se mueve nada», anti-vacuidad por diseño; muerden vía sabotajes 3-5) | `useRef` de bajada + `onPointerDown/onPointerUp` en el MARCO llamando a `desplazar(pasosDelArrastre(subida − bajada, UMBRAL_DE_ARRASTRE))`; el clic de la tarjeta pasa por `elegirFoto` (solo actúa con `pasosDelUltimoGesto === 0`). SIN tocar `galeria-logica.ts`: la decisión ya existía |
| R7 | @s12 | refactor previo EN VERDE del stub (`stubDeMatchMedia` con listeners espiados, 73/73) → **4 rojos** | el MISMO efecto lee `matches`, se suscribe con `addEventListener('change')` y devuelve la limpieza con el MISMO manejador; `matches:false` no hace nada |
| R8 | @s15 | **1 rojo** (bytes) | `pointer-events: none` en `[data-distancia='3']`, junto a su `transition: none` |
| R9 | @s17 | **2 rojos de 3** (el del gap/solape es guardián y ya se cumplía; muerde vía sabotaje 7) | `.punto` pasa a caja 1.5rem invisible (grid centrado, `border: 0`, fondo transparente) con el círculo de 0.75rem — anillo INCLUIDO — en `::before`; `[data-actual='sí']` pinta el `::before`; gap 0.5rem → 0.125rem (cajas a 2 px, sin solape) |

### Sabotajes del remate — 8, todos cazados y revertidos

| # | Sabotaje (sobre producción) | Resultado |
|---|---|---|
| 1 | `data-actual` invertido (`'no' : 'sí'`) | **1 rojo** (judge 1) |
| 2 | los dos glifos vaciados (`'' : ''`) | **1 rojo** (judge 2) |
| 3 | `demo-seccion` fuera del template de la raíz | **1 rojo** (judge 4) |
| 4 | `entra()` sin `setArranqueExplicito(false)` (arranque pegajoso) | **1 rojo** (judge 8) |
| 5 | la resta del gesto invertida (`bajada − subida`) | **6 rojos** (@s19 dirección/frontera) |
| 6 | la puerta del clic invertida (`!== 0`) | **3 rojos** (@s18 + toque corto) |
| 7 | cuerpo de `alBajarElPuntero` vaciado (el mutante ArrowFunction) | **7 rojos** (@s19) |
| 8 | el manejador del change pausa INCONDICIONALMENTE | **1 rojo** (la rama matches:false) |
| 9 | el anillo movido a la caja + `background-clip: content-box` (la trampa del contrato) | **1 rojo** (@s17 diana) |

### Decisiones del remate (lo que el contrato dejaba a mi elección)

1. **El gesto vive en dos refs, no en estado** (`bajadaDelPuntero`, `pasosDelUltimoGesto`): son
   memoria del gesto, no pintan nada; un estado provocaría re-renders por cada pointerdown.
2. **Sin guarda de «pointerup sin pointerdown»**: el contrato fija el cableado literal (guardar la
   bajada, decidir en la subida) y una guarda extra sería producción que ningún test exige, con
   mutantes de comparador difíciles de matar desde el contrato. La bajada arranca en 0 (ref
   inicial); el caso «suelta dentro habiendo bajado fuera» queda para la verificación EN VIVO.
3. **La diana de 24 px va por pseudo-elemento, no por `background-clip`**: el contrato mismo avisa
   de que `content-box` recorta el fondo pero NO el borde; el `::before` lleva el anillo consigo.
   El sabotaje 9 prueba que el test rechaza la vía descartada.
4. **El gap de los puntos baja a 0.125rem**: cajas de 24 px a 2 px (sin solapar); la separación
   visual de los círculos pasa de 8 px a 14 px — el cambio de aspecto lo valida el lead EN VIVO.
5. **La escucha del change y su limpieza viven en el MISMO efecto** que la lectura inicial (lo
   exige @s12 ampliado): el helper `prefiereMovimientoReducido` desaparece — su guarda de
   `matchMedia` (la única viva tras el cambio 3 del judge) se muda al efecto.

### Pendiente (NO lo hago yo)

- Re-judge + re-mutación (`Galeria.tsx` y `galeria-logica.ts` en `mutate`, break 100). Aviso al
  `mutation_tester`: sigue vigente el aviso nº 9 del judge (`arranqueExplicito` `false→true`
  equivalente de libro).
- Verificación EN VIVO en Chrome: el GESTO FÍSICO del arrastre (dedo real), el aspecto de los
  puntos con la caja de 24 px, y los 3 puntos ya listados arriba.
- `pnpm build`, suite completa y puertas: el lead.

## Micro-ciclo final (Enmienda 2 + mutación)

**Fecha:** 2026-07-23 · **Fuentes:** @s19 [ENMIENDA 2, MEDIDO] del `.feature`,
`progress/galeria_coverflow_diseno.md` § Enmienda 2 y `progress/mutation_galeria_carrusel.md`
(los 3 supervivientes). Vitest DIRIGIDO a los 3 ficheros de galería: **148 verdes** (145 + 3).

### Ciclos Rojo-Verde (3 tests nuevos)

| # | @s | Test (ROJO primero) | Cambio mínimo (VERDE) |
|---|---|---|---|
| 1 | @s19 (E2) | `galeria.test.tsx` «las SEIS `<img>` declaran draggable="false"» — rojo: `getAttribute` daba `null` | `draggable={false}` en la `<img>` de `Galeria.tsx` (con nota MEDIDO: el drag nativo se tragaba el `pointerup`) |
| 2 | @s19 (E2) | `galeria-estilos.test.ts` «la regla del MARCO declara touch-action: pan-y» (por BYTES) — rojo: la regla no lo tenía | `touch-action: pan-y;` en `.marco` de `galeria.module.scss` (en táctil, sin él: `pointercancel`) |
| 3 | @s19 (E2) | `galeria-logica.test.ts` «pasosDelArrastre(0, 0) devuelve 0» — rojo: el ternario devolvía `-1` | Rediseño por SIGNO en `pasosDelArrastre`: `return signoDe(0 - desplazamientoX)` — sin comparador, no queda mutante de igualdad que instrumentar (superviviente 153:10) |

- **El -0 acecha**: `-signoDe(0)` y `signoDe(-desplazamientoX)` devuelven `-0` en el caso
  degenerado, y `toBe` (Object.is) lo rechaza. Por eso la negación es `0 - Δ` (resta binaria:
  `0 - 0` es `+0`). Documentado en el comentario de la función.
- Los 6 tests preexistentes de `pasosDelArrastre` (dirección, frontera inclusiva 48/47, umbral
  inyectado) siguen verdes SIN tocarlos: conducta idéntica para todo |Δ| ≥ umbral con umbral > 0.

### Sabotajes de comprobación (aplicar → rojo → revertir)

| # | Sabotaje | Resultado |
|---|---|---|
| 1 | `draggable={true}` (el mutante BooleanLiteral false→true: el atributo horneado pasa a "true") | **1 rojo** |
| 2 | `signoDe(desplazamientoX)` sin la inversión (la dirección del gesto al revés) | **10 rojos** (dirección/frontera en lógica y DOM) |

### Exclusiones Stryker (decisión del lead, equivalentes VERIFICADOS del informe de mutación)

- `Galeria.tsx` `useState(false)` de `arranqueExplicito` (86:62, BooleanLiteral): inobservable POR
  CONSTRUCCIÓN — `entra()` cancela en el mismo lote. `// Stryker disable next-line all` con
  justificación + referencia al informe. Precedente `HOST_WHATSAPP` (`site.ts:72-73`).
- `Galeria.tsx` deps `[]` del efecto de `matchMedia` (124:6, ArrayDeclaration): deps CONSTANTES de
  un efecto solo-montaje. El efecto se reestructuró a la forma de `Equipo.tsx:205-212` (argumentos
  en líneas propias) para que el disable cubra SOLO la línea del array, no el bloque. Prettier y
  eslint verdes sobre los ficheros tocados.

### Trazabilidad @s19 (Enmienda 2) → tests

- `draggable="false"` en las seis → `galeria.test.tsx` @s19 [ENMIENDA 2] (DOM, las 6 por nombre accesible)
- `touch-action: pan-y` en el marco → `galeria-estilos.test.ts` @s19 [ENMIENDA 2] (bytes)
- caso degenerado `(0, 0) → 0` → `galeria-logica.test.ts` @s19 [ENMIENDA 2]

### Pendiente (NO lo hago yo)

- Re-mutación (`galeria-logica.ts` y `Galeria.tsx`, break 100: con el rediseño y las 2 exclusiones
  documentadas debería dar 100 %/100 %), re-judge, suite completa/build y la verificación EN VIVO
  del gesto físico en Chrome (dedo real): el lead.

## Ciclo v3

**Fecha:** 2026-07-23 · **Contrato:** `features/galeria_carrusel.feature` v3 (Enmienda 3, @s1..@s24)
· **Brief:** `progress/galeria_v3_resenas_diseno.md` (§1 decisiones de Pablo, §3 teclado, §4 cristal,
§5 módulo compartido, §7 trampas medidas) · **Rama:** `feat/galeria-v3-resenas`.
Vitest DIRIGIDO a los 4 ficheros de galería (orden del lead: nada de suite completa/build/mutación):
**197 verdes** — `galeria.test.tsx` 90 · `galeria-estilos.test.ts` 34 · `galeria-logica.test.ts` 47
· `carrusel-logica.test.ts` 26 (NUEVO). Partida: 148 → **+49 netos** (50 tests nuevos escritos,
1 retirado por mudanza). eslint 0 avisos · `tsc --noEmit` limpio · prettier limpio.

### Lo nuevo de producción

- **`src/components/carrusel-logica.ts` (NUEVO, puro, para mutar al 100 %)**: `MILISEGUNDOS_POR_FOTO
  = 2000` (MIGRADA desde `galeria-logica.ts` — decisión: los consumidores cambian el import, SIN
  re-export: el contrato dice «la galería NO guarda una segunda copia» y una re-exportación sería
  una segunda puerta al mismo número), `pasoDeTecla` + `Pulsacion` (@s21), `esCampoDeEscritura`
  (la clasificación del elemento activo, pura para que el cableado no lleve literales inmatables),
  `PROPORCION_VISIBLE_MINIMA = 0.6`, `NADIE = -1` y `quienAtiendeElTeclado` (@s22: umbral
  INCLUSIVO, desempate por cercanía al centro, empate total estable → primera registrada).
- **`Galeria.tsx`**: reloj con GENERACIÓN en las deps del efecto (@s20) — el token es `useState({})`
  + `setGeneracionDelReloj({})`: IDENTIDAD nueva por acción, no aritmética (un contador `g + 1`
  tendría a `g - 1` de mutante EQUIVALENTE; el `{}` vacío no tiene mutantes). `desplazar` y
  `mostrarFoto` (puntos + clic de tarjeta) son el camino manual único que reinicia. Teclado (@s23):
  efecto solo-montaje con listener de `keydown` en `document`, `focoDentroAhora` (ref, con
  onFocus/onBlur en el carrusel — distinto de `foco`, cuya pausa es pegajosa por @s10),
  IntersectionObserver GUARDADO por `typeof` con el MISMO umbral de la decisión pura y ratio en
  ref; `preventDefault()` SOLO al atender; limpieza de listener y `disconnect`. En el handler los
  desplazamientos van sobre los SETTERS ESTABLES de React (no sobre `desplazar` del render):
  exhaustive-deps sin avisos y UN solo registro del listener (la limpieza lo asevera).
- **`galeria.module.scss` (@s24)**: la fila `.mandos` DESAPARECE; grupo `.rotacion, .flechaAnterior,
  .flechaSiguiente` con `position: absolute`, `z-index: 7` (> capaDe(0,6)=6), caja `2.75rem`,
  cristal `color-mix(in srgb, var(--surface) 78%, transparent)` + `backdrop-filter: blur(8px)`,
  borde `var(--border-interactive)`, glifo `var(--accent-dark)`; anclajes propios (chip arriba-dcha,
  flechas en los laterales a media altura SIN transform — @s14 exige UNA sola declaración en la
  hoja: el centrado vertical va por `top: calc(50% - 1.375rem)`). Los mandos son hijos DIRECTOS de
  `.carrusel` (nunca de `.marco`: su overflow se comería el círculo). Sin hover-gating: visibles
  en todos los tamaños.

### Mapa @s → test (trazabilidad del ciclo v3)

| @s | Test(s) |
|---|---|
| @s9 (2000 ms) | `carrusel-logica.test.ts` «la constante exportada vale exactamente 2000» · `galeria.test.tsx` @s9 «1999/2000» y «otros 2000 → 3ª, 12000 → 1ª» |
| @s10/@s11/@s12 (re-medidos) | `galeria.test.tsx` @s10 (Given 8000 intacto, tick de salida 2000) · @s11 ×2 · @s12 ×4 — sus Then NO cambiaron |
| @s20 | `galeria.test.tsx` @s20 ×5: flecha 1500→3499/3500 · punto · clic lateral · arrastre ≥ umbral · pausado + 12000 (anti-regresión SC 2.2.2) + tecla en @s23 |
| @s21 | `carrusel-logica.test.ts` @s21: tabla de 8 filas (a mano) + `esCampoDeEscritura` ×7 |
| @s22 | `carrusel-logica.test.ts` @s22: tabla de 6 filas + umbral 0.6 + empate total estable + sin candidatas + candidata única (el consumo de HOY) |
| @s23 | `galeria.test.tsx` @s23 ×9: foco dentro sin IO · blur deja de atender · sin IO no revienta y sin foco no mueve · stub 0.8 + opciones `{threshold:[0.6]}` · ctrl no · 0.4 no (sin preventDefault) · campo de texto real (`input.focus()`) no · tecla reinicia reloj (=@s20) · limpieza (mismo manejador + disconnect) |
| @s24 | `galeria-estilos.test.ts` @s24 ×8 (bytes: sin `.mandos`, absolute, 2.75rem, color-mix+blur, tokens, z-index>6, anclajes, nada oculto) · `galeria.test.tsx` @s24 ×2 (hijos directos; chip→flechas→escenario→puntos) |

### Ciclos Rojo-Verde (resumen)

| # | @s | ROJO (visto fallar) | VERDE (cambio mínimo) |
|---|---|---|---|
| 1 | @s9 | import de `carrusel-logica` inexistente | módulo nuevo con la constante 2000 |
| 2 | @s9 | frontera 1999/2000 (producción latía a 4000) | `Galeria.tsx` importa de `carrusel-logica`; re-medidos @s10/@s11/@s12 (mantenimiento del contrato, documentado) |
| 3 | @s21 | 8 filas sin `pasoDeTecla` | guardas `||` + mapa `ArrowLeft/Right` |
| 4 | @s21 | 7 casos sin `esCampoDeEscritura` | `editable \|\| ETIQUETAS.includes` |
| 5 | @s22 | 10 tests sin `quienAtiendeElTeclado` | bucle con umbral inclusivo + cercanía |
| 6 | @s20 | tick fantasma en t=2000 (esperaba 2ª a los 3499, había 3ª) | generación `{}` en deps + reset en `desplazar` |
| 7 | @s20 | punto no reiniciaba | `mostrarFoto` (punto + clic de tarjeta por el mismo camino) |
| 8 | @s23 | ArrowLeft con foco dentro no movía | listener + `focoDentroAhora` + decisión pura |
| 9 | @s23 | stub: sin observador construido | IO guardado + ratio en ref + `quienAtiendeElTeclado` |
| 10 | @s24 | 9 rojos de bytes/estructura | SCSS cristal + fila fuera del TSX |

(Los pines que nacieron verdes — lateral/arrastre/pausa de @s20, guardas de @s23, orden DOM de
@s24 — fijan conducta compartida con líneas ya exigidas por un rojo anterior; su capacidad de
morder quedó DEMOSTRADA con los sabotajes del bloque.)

### Sabotajes de comprobación (aplicar → rojo → revertir; todos matados)

| # | Sabotaje | Rojos |
|---|---|---|
| 1 | `MILISEGUNDOS_POR_FOTO = 4000` | 10 |
| 2 | `ctrl \|\| alt` → `ctrl && alt` en `pasoDeTecla` | 2 |
| 3 | `ArrowLeft: -1` → `1` | 1 |
| 4 | umbral `<` → `<=` (0.6 exacto dejaría de atender) | 1 (la fila del 0.6) |
| 5 | cercanía `<` → `<=` | 1 (el empate total) |
| 6 | quitar `reiniciarElReloj()` de `desplazar` | 2 |
| 7 | quitarlo de `mostrarFoto` | 2 |
| 8 | deps `[rotando]` sin la generación | 4 |
| 9 | `reiniciarElReloj` también des-pausa (reiniciar→arrancar) | 1 (anti-regresión) |
| 10 | `preventDefault()` antes de la guarda de atender | 3 |
| 11 | `!== NADIE` → `=== NADIE` | 5 |
| 12 | callback del observador vacío | 2 |
| 13 | quitar `observador?.disconnect()` | 1 |
| 14 | `z-index: 3` en los mandos | 1 |
| 15 | fondo `var(--surface)` sin color-mix | 1 |
| 16 | reintroducir la fila (wrapper `<div>`) | 1 |

### Decisiones del craftsman (dentro del contrato)

- **Sin re-export**: `galeria-logica.ts` NO re-exporta la cadencia; los consumidores importan de
  `carrusel-logica.ts` (una sola puerta al número; @s9 lo permite explícitamente).
- **Generación como `{}`**: identidad en vez de contador — elimina POR CONSTRUCCIÓN el mutante
  equivalente `+1/-1` (misma filosofía que el rediseño por signo de `pasosDelArrastre` en v2.2).
- **`NADIE` exportada** pero los tests escriben `-1` a mano (anti-tautología).
- **El handler de teclado usa setters estables** (no cierra sobre `desplazar`): exhaustive-deps a
  cero sin `useCallback` (sin precedente en el repo y añadiría deps-arrays con mutantes
  equivalentes) y sin re-suscripciones por render.
- Dos aserciones de estilo se afinaron durante el ROJO de @s24 (bugs del TEST, no de producción):
  el regex de regla propia vs. grupo con coma, y `visibility` con lookbehind para no casar
  `backface-visibility` (legítima desde v2).

### Pendiente (NO lo hago yo)

- **`stryker.config.json`**: añadir `src/components/carrusel-logica.ts` a `mutate` (prohibido
  tocarlo en este encargo) — el módulo nació para mutarse al 100 %.
- Re-judge + re-mutación (`Galeria.tsx`, `galeria-logica.ts`, `carrusel-logica.ts`, break 100).
  Avisos al mutation_tester: los DOS `Stryker disable` de deps constantes (matchMedia y teclado)
  y el de `arranqueExplicito` siguen documentados en el propio fichero.
- Suite completa + build + puertas: el lead.
- Verificación EN VIVO en Chrome: posición FINA de los mandos de cristal (contrato @s24), el
  teclado real con scroll (jsdom no sabe de visibilidad de verdad, @s23), el gesto físico del
  arrastre, y el PEOR caso de 1.4.11 del cristal (glifo/borde sobre foto clara) para el auditor
  a11y — el 78 % de `--surface` es el punto de partida del brief, no un byte aseverado.
