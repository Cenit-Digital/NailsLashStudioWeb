# Review — feature 22 `galeria_coverflow_3d` (contrato `features/galeria_carrusel.feature`, @s1..@s18)

**Veredicto: RECHAZADO (CHANGES_REQUESTED)**

> Rechazo BARATO y acotado: la cobertura de los 18 escenarios es completa y fiel, las cinco
> decisiones críticas del brief están bien implementadas y la disciplina TDD está demostrada.
> Lo que bloquea es **producción que ningún test exige** en `Galeria.tsx` — exactamente lo que el
> `mutation_tester` (break: 100, `stryker.config.json:40`) va a hacer estallar después, pagando una
> corrida de mutación entera para descubrir lo que este review ya puede señalar con línea y número.
> Los cambios requeridos son 3 tests pequeños + 1 borrado de una línea.

---

## 1. Cobertura de escenarios (@s ↔ test) — los 18, verificados uno a uno

Corrida dirigida: `pnpm exec vitest run` sobre los 3 ficheros de galería → **125/125 verdes (2,2 s)**.
(La suite completa y `pnpm build` los corre el lead en paralelo, por instrucción expresa; no los lancé
para no pisarlos. El diario reporta 386 verdes en `src/components`+`src/pages`, build-based incluidos.)

- @s1: [x] `galeria.test.tsx` — 7 tests originales intactos (líneas 26-96) + «EXACTAMENTE SEIS `<img>`» (671-677) + «tras dar una vuelta entera…» (679-691). Sin clones: verificado también en `Galeria.tsx` (aritmética circular, sin duplicar nodos).
- @s2: [x] `galeria.test.tsx:693-752` — raíz `<div>`/sin `<section>`, 0×`<h1>`/1×`<h2>`, puntos sin `<a href="#">`/`<nav>`, nota carácter a carácter, «Anterior»/«Siguiente» singulares (`getByRole` lanza si hay dos), dentro de `<main>` (bytes de `home.tsx`).
- @s3: [x] `galeria-logica.test.ts:32-66` — tabla de 6 distancias A MANO con la 3ª centrada, «exactamente una a 0» para las 6 centradas, «-3 no existe» + `toContain(3)` anti-vacuidad.
- @s4: [x] `galeria-logica.test.ts:68-98` — 5ª centrada ⇒ 1ª a +2 (el doble módulo), 36 combinaciones en [-2,+3], ±6 vuelve, envoltura por los dos extremos con valores a mano.
- @s5: [x] `galeria.test.tsx:121-177` (tabla data-distancia/--s con la 1ª centrada, z-index>0, única a 0, capas estrictamente decrecientes y compartidas) + `galeria-logica.test.ts:100-141` (clave, signo, capa).
- @s6: [x] `galeria.test.tsx:180-247` — role/aria-roledescription/aria-labelledby→h2, sin `region`, 6 diapositivas «1 de 6»…«6 de 6», sin `aria-hidden`, `aria-controls`→`#galeria-pista`. El «orden del DOM siempre 1..6» lo cierran @s18 (382-393) y @s1 (679-691).
- @s7: [x] tabla de verdad COMPLETA por valor (`galeria-logica.test.ts:189-200`) + 2 estados en el DOM (`galeria.test.tsx:504-519`, `off` montada y `polite` parada). Las filas 3-4 son defensivas (con foco la rotación ya está parada): cubiertas por la función pura, como el propio contrato prevé.
- @s8: [x] `galeria.test.tsx:431-502` — etiqueta que cambia, sin `aria-pressed` en ambos estados, `data-estado`, 12000 ms sin cambio aunque el puntero salga, PRIMER tabulable de NUEVE, horneado en SSR, 0 enfocables dentro de la pista. + `debeRotar` pausado-gana (`galeria-logica.test.ts:225-235`).
- @s9: [x] `galeria.test.tsx:521-551` — frontera 3999/4000, 8000⇒3ª, 24000⇒1ª. Cadencia exportada = 4000 (`galeria-logica.test.ts:252-255`).
- @s10: [x] `galeria.test.tsx:553-586` — ratón para y REANUDA al salir; foco para y NO reanuda (blur + 4000 ⇒ sigue la 1ª). El Given del contrato (8000 ms sin cambio) está aseverado a mitad de test, como pide el `.feature`. + predicado puro (`galeria-logica.test.ts:202-248`).
- @s11: [x] `galeria.test.tsx:588-607` (con ratón encima Y foco dentro, «Iniciar» avanza a los 4000 ms) + precedencia pura (`galeria-logica.test.ts:237-248`).
- @s12: [x] `galeria.test.tsx:609-665` — stub de `matchMedia` a mano, 12000 ms parado, «Iniciar…» sin `disabled`, pulsar arranca, y el contraejemplo (sin preferencia arranca rotando).
- @s13: [x] `galeria-estilos.test.ts:102-145` — perspective propiedad (en `.escenario`) y jamás `perspective(`, sin `preserve-3d`, overflow fuera de la regla con perspectiva, opacity en `.lienzo`, sin will-change/drop-shadow/content-visibility, box-shadow presente.
- @s14: [x] `galeria-estilos.test.ts:147-243` — UNA sola `transform:`, orden translate3d→rotateY→scale, jamás `transform: none`, los 6 fallbacks, magnitudes por `[data-distancia='0..3']`, curva 0.8s con x∈[0,1], y el domo (--y<0 en la centrada, >0 y creciente en laterales).
- @s15: [x] `galeria-estilos.test.ts:246-309` — móvil suaviza giro/z/y, vecinas asoman (0.6>0), 640px único breakpoint, |giro|<90° en los ≥8 valores, `prefers-reduced-motion` con `transition: none`, la oculta con `transition: none` FUERA del @media, sin `url(https://`/`@import url(`/`@font-face`.
- @s16: [x] `galeria.test.tsx:249-293` — las 4 filas del Outline (incluida la vuelta hacia ATRÁS) + 7 pasos sin clave fuera de {0,1,2,3}.
- @s17: [x] `galeria.test.tsx:296-363` (punto 5 centra, aria-disabled migra, exactamente UNO, sin `disabled` nativo, grupo nombrado) + `galeria-estilos.test.ts:312-335` (dos tokens distintos, sin `--accent`/`--line`) + etiquetas puras (`galeria-logica.test.ts:162-171`).
- @s18: [x] `galeria.test.tsx:366-393` (clic en la 3ª ⇒ 0/--s 0, la 1ª ⇒ 2/--s -1, DOM sin reordenar) + `pasosDelArrastre` 5 tests con frontera INCLUSIVA y umbral inyectado (`galeria-logica.test.ts:262-286`).

**Ningún escenario sin test. Ningún test que no muerda su escenario** (los valores esperados van a
mano; comprobé los 6 de @s3, los 12 de @s5 y los 4 de @s16 contra la convención `>` del empate).

## 2. Decisiones críticas del brief — verificadas en el código

- (a) **Sin `transform-style: preserve-3d`**: confirmado en `galeria.module.scss` (0 apariciones; comentario deliberado en líneas 10-14) y blindado por `galeria-estilos.test.ts:111-118`. El orden de pintado viene del `z-index` inline (`Galeria.tsx:211`, `capaDe` = `total − |d|`, siempre > 0).
- (b) **Doble módulo**: `galeria-logica.ts:21` — `((indice % total) + total) % total` — y el empate con `>` estricto (`:37`). @s4 lo defiende con el caso `i < a` explícito.
- (c) **`transition: none` en la oculta**: `galeria.module.scss:138` (la tarjeta) **y** `:162-164` (su `.lienzo`, para que el fundido tampoco barra). Aseverado en `galeria-estilos.test.ts:295-300`.
- (d) **Control de pausa**: existe, se hornea en SSR, es el PRIMER tabulable de los nueve (`Galeria.tsx:161-169`, test `galeria.test.tsx:476-491`) y NO lleva `aria-pressed` en ningún estado (test :442-452). La etiqueta sigue a la voluntad (`!pausado`), no al `rotando` efectivo — decisión del diario nº 1, correcta: evita que el botón diga «Iniciar» justo cuando acercas el puntero para parar.
- (e) **Reduced-motion arranca pausado**: efecto en `Galeria.tsx:95-102` con la llamada guardada, tests @s12 con stub. Sin retirar la función (sin `disabled`).

## 3. Disciplina TDD

- ¿Evidencia Rojo→Verde→Refactor? **SÍ** — 13 ciclos con el rojo descrito (`progress/tdd_galeria_carrusel.md:66-89`), refactors solo en verde, y 20 sabotajes aplicados y cazados (:93-120). El mapa @s→test del diario es fiel a lo que hay en disco (lo verifiqué test a test).
- ¿Producción sin test que la pida? **SÍ — y es lo que bloquea.** Ver hallazgos 1-4.

## 4. Hallazgos BLOQUEANTES (cambios requeridos)

1. **`data-actual` sin ningún test que lo exija** — `Galeria.tsx:237`
   (`data-actual={indice === activo ? 'sí' : 'no'}`). Es el gancho del que depende el ESTADO VISUAL
   del punto actual (`galeria.module.scss:183`, `[data-actual='sí']`), es decir, la distinción de
   estado que @s17 protege por SC 1.4.11. El test de estilos asevera que la REGLA existe, pero ningún
   test asevera que el ATRIBUTO se ponga en el punto correcto: invertir el `===`, fijar el ternario o
   vaciar `'sí'`/`'no'` deja los 125 tests verdes y el punto actual sin marcar, EN SILENCIO. Con
   `Galeria.tsx` en `mutate` y break:100, son ~4-5 supervivientes garantizados.
   **Cambio:** test (cuelga de @s17) que asevere `dataset.actual === 'sí'` SOLO en el punto actual y
   `'no'` en los otros cinco, antes y después de pulsar otro punto.

2. **El glifo visible del control de rotación sin test** — `Galeria.tsx:168`
   (`{pausado ? '▶' : '❙❙'}`). @s8 dice «siempre presente y VISIBLE»: lo visible para el usuario
   vidente es este ternario, y ni el ternario ni sus dos literales tienen test (solo se asevera el
   `aria-label`). Mutantes supervivientes seguros (ternario a rama fija, literales a '').
   **Cambio:** test (cuelga de @s8) que asevere el `textContent` del control en los dos estados.

3. **Guarda muerta `typeof window === 'undefined'`** — `Galeria.tsx:77`. La función solo se llama
   dentro de `useEffect` (nunca corre en SSR) y en jsdom/navegador `window` siempre existe: la
   cláusula es INALCANZABLE en todos los entornos, y su mutante de literal (`'undefined'` → `''`) es
   EQUIVALENTE e inmatable — forzaría una exclusión documentada en la mutación. El precedente medido
   del repo (`reserva.test.tsx:52,539`, brief §9) guarda SOLO `matchMedia`.
   **Cambio:** borrar `typeof window === 'undefined' ||` y dejar la guarda de `matchMedia` sola.

4. **`className={`demo-seccion ${estilos.galeria}`}` sin test** — `Galeria.tsx:143`. Stryker SÍ muta
   los template literals (a diferencia de los strings de atributo JSX): vaciarlo deja la sección sin
   la clase global de espaciado y ningún test lo nota. `Equipo.tsx` (100 % de mutación) mató este
   mismo mutante con un test que lee el atributo `class` del horneado (`equipo.test.tsx:128-138`) —
   patrón permitido (bytes del SSR, no `toHaveClass`).
   **Cambio:** test análogo que asevere que la raíz horneada contiene `demo-seccion`.

## 5. Hallazgos NO bloqueantes (para el lead y el `mutation_tester`)

5. **Dos features `in_progress`** — `feature_list.json`: `contacto` (línea 289) y
   `galeria_coverflow_3d` (línea 496). Viola C2 y `one_feature_at_a_time`. Preexistente y del lead,
   no del craftsman: hay que resolver el estado de `contacto` antes de cerrar sesión.
6. **C6 incompleto: `galeria_coverflow_3d` no tiene sección en `project-spec.md`** (grep de
   galería/coverflow = 0). El brief (`progress/galeria_coverflow_diseno.md`) hace de spec de facto y
   la puerta humana está registrada en `feature_list.json:497`, pero el checkpoint pide la sección.
7. **El arrastre táctil NO está cableado** (deuda declarada con honestidad, diario «Lo que NO
   hice»). `pasosDelArrastre` y `UMBRAL_DE_ARRASTRE` se exportan y testean pero NADIE los llama:
   hoy el móvil pierde el swipe que el `scroll-snap` daba gratis (brief §11.4 dice «se repone»).
   El contrato no tiene @s que lo exija (jsdom sin `PointerEvent`), así que no bloquea ESTE review,
   pero la «verificación EN VIVO del gesto» prometida por el contrato no puede pasar sin cablearlo.
   Decisión del lead ANTES de `done`: cablear `onPointerDown/Up` sobre `.marco` (asumiendo el coste
   en mutantes de `Galeria.tsx`) o dejarlo por escrito como recorte aceptado por el humano.
8. **La cancelación del arranque explícito en `entra()` no tiene test de comportamiento** —
   `Galeria.tsx:137-140` (decisión nº 3 del diario, razonada con SC 2.2.2). Ningún mutante de
   Stryker la aísla (el booleano `false→true` lo mata @s10 y el bloque vacío también), así que no
   romperá la mutación, pero el comportamiento «tras Iniciar, un ratón NUEVO vuelve a pausar» solo
   vive en el diario. Recomendado: un test DOM que lo fije.
9. **Aviso de mutante equivalente previsible** para el `mutation_tester`: `useState(false)` de
   `arranqueExplicito` (`Galeria.tsx:91`) mutado a `true` es inobservable POR CONSTRUCCIÓN (raton/
   foco solo se ponen a true vía `entra()`, que cancela el arranque; en estado neutro rota igual).
   Si aflora, es equivalente de libro: documentarlo, no perseguirlo con tests.
10. **@s15 «separación» en móvil**: `--x` a distancia 1 es 72 % en ambos tamaños (el test cubre
    giro/z/y). Es correcto igualmente: los % se resuelven contra el border-box de la tarjeta
    (62vw < 320px), así que la separación FÍSICA sí es menor — el propio contrato lo documenta
    (@s14, nota de porcentajes). Dejado por escrito para que nadie lo «arregle».

## 6. Checkpoints

- C1: [x] ficheros y docs base presentes · [~] `bin/harness init` NO lo lancé (instrucción del lead:
  corre en paralelo y nos pisaríamos); dirigidos 125/125 verdes, el diario reporta 386 verdes con
  los build-based. El init verde queda a cargo del lead antes del cierre.
- C2: [ ] **dos features `in_progress`** (hallazgo 5). `progress/current.md` describe la sesión
  activa, pero acumula bitácora de sesiones cerradas que debería vivir en `history.md`.
- C3: [x] arquitectura respetada: patrón del repo (componente que solo cablea + `*-logica.ts` puro y
  mutable + SCSS medible por bytes, precedente `equipo`/`reserva`), 0 dependencias nuevas, 0 logs.
- C4: [x] 125 tests > 0, todos verdes, deterministas (reloj falso, sin esperas reales).
- C5: [ ] pendiente de cierre de sesión (entrada en `history.md`; los untracked son los artefactos
  esperados de la feature).
- C6: [ ] sección en `project-spec.md` ausente (hallazgo 6) · [x] `.feature` con @s1..@s18 y Then
  medibles · [x] mapa @s→test completo y fiel · [ ] **producción sin test** (hallazgos 1-4).
- C7: [ ] pendiente (`mutation_tester`, tras corregir; ver avisos 3 y 9).

## 7. Cambios requeridos (lista cerrada)

1. Test DOM de `data-actual` en los seis puntos, en ambos momentos (cuelga de @s17). — `galeria.test.tsx`
2. Test del `textContent` visible del control de rotación en los dos estados (cuelga de @s8). — `galeria.test.tsx`
3. Borrar `typeof window === 'undefined' ||` de `Galeria.tsx:77` (guarda muerta; precedente reserva).
4. Test del `class` horneado de la raíz conteniendo `demo-seccion` (patrón `equipo.test.tsx:128-138`).

Con esos cuatro cerrados (y sin tocar nada más), este review pasa a APROBADO: la cobertura de
escenarios, el diseño 3D, el árbol ARIA y la disciplina TDD ya están al nivel que el contrato exige.
