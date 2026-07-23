# Review — hero CALIGRAFÍA LENTA (contrato `features/hero.feature`, enmienda 2026-07-23)

**Veredicto:** APPROVED (APROBADO)

> `judge` · rama `feat/hero-caligrafia-lenta` · 91/91 tests dirigidos en verde (1,68 s).
> Alcance revisado: `Hero.tsx`, `hero.module.scss`, `hero-logica.ts` (nuevo), `hero.test.tsx`,
> `hero-estilos.test.ts`, `hero-logica.test.ts`, `stryker.config.json`, contrato y diario.

## Cobertura de escenarios (@s ↔ test)

- @s1: [x] `hero-estilos.test.ts` «@s1 estado base VISIBLE» (4) + `hero.test.tsx` «@s1 el viewBox
  ENCIERRA la tinta real» (4). Intactos, verdes.
- @s2: [x] `hero.test.tsx` «@s2 a mitad de escritura…» (isPointInStroke) + un solo «M» + máscara.
  Intactos.
- @s3: [x] `hero.test.tsx` «@s3 la PUNTA del aplicador» (4: y=−alto, proporción 15/93, 0,4667,
  rotate(18)). Intactos.
- @s4: [x] REESCRITO — `hero-estilos.test.ts` 2 describes (8 tests) + `hero-logica.test.ts` (2).
  Token 90s ÚNICO (declaraciones contadas sin comentarios, `hero-estilos.test.ts:297-305`); cota
  «ningún literal restante > 1 s» (307-320) caza cualquier 90 duplicado; `escribir`+`recorrer` =
  `var(--duracion-caligrafia) linear 0.1s both` con prohibición explícita de cubic-bezier en las
  dos (322-338); UN reloj por NÚMEROS resueltos (misma dur/retardo, 340-350); `retirarse` =
  `calc(token − 0.4s + 0.1s)` → 89,7 (352-359); `revelarStudio` = `calc(token + 0.2s)` → 90,2 y
  `aparecer 0.3s` intacto (361-368); orden STUDIO ≥ fin del trazo en ms enteros (379-391); total
  90 800 ms EXACTOS (393-400).
- @s5: [x] `hero-estilos.test.ts` @s3 (`@media reduce` → animation none a las 3 piezas) + @demo
  (aplicador display:none). Intactos.
- @s6: [x] `hero.test.tsx` @s6 (1 h1, hijos span) + aria-hidden del svg. Intactos, y re-aseverados
  CON el control montado (`hero.test.tsx:522-539`).
- @s7: [x] `hero.test.tsx` @s5/@s7 (nombre en los bytes del prerender, cero animation inline,
  text node de espacio real, nombre accesible 17 car.). Intactos.
- @s8: [x] `hero.test.tsx` @demo autohospedado + `hero-estilos.test.ts` sin url(http). Intactos.
- @s9: [x] `hero-estilos.test.ts` @s9 (width 4.12em, clamp, sin max-width %, --ink). Intactos.
- @s10: [x] `hero.test.tsx:508-557` (botón nativo sin texto, nombre EXACTO «Completar la firma»,
  FUERA del h1 con la estructura F-07 re-aseverada, foco por tab, NO viaja en el horneado) +
  `hero-estilos.test.ts:410-437` (transparente de verdad: background/border/padding, cursor
  pointer, CERO outline en la hoja — el anillo lo pinta `_base.scss:18` `:focus-visible` global) +
  tabla `debeMontarseElControl` (6 filas por valor).
- @s11: [x] `hero.test.tsx:568-609` (clic, Enter y Espacio → `data-firma="cliente"` + botón
  desmontado, con el estado inicial «corriendo» aseverado ANTES) + `hero-estilos.test.ts:445-464`
  (bloque cliente/reloj → animation:none a `.trazo`/`.aplicador`/`.heroStudio`; la BASE ya es el
  final: @s1) + `firmaCompletada` (3 filas).
- @s12: [x] `hero.test.tsx:626-659` (frontera 90 799/90 800 ms con reloj falso; anti-fuga: clic +
  avance completo NO re-etiqueta «cliente» → la limpieza del timeout es observable) +
  `milisegundosDeCeremonia() === 90_800`.
- @s13: [x] `hero.test.tsx:661-682` (sin botón en ningún momento ni tras 90,8 s; bajo reduce el
  timeout NI SE ARMA — fase sigue «corriendo»; sin botón en el horneado) + filas null/true de la
  tabla.
- @s14: [x] `hero.test.tsx:684-709` (clic en el eyebrow NO completa; el botón es hijo directo de
  la escena) + `hero-estilos.test.ts:427-436` (absolute + inset 0 sobre `.escena` relative, nunca
  fixed). Geometría real diferida a EN VIVO, como fija la nota técnica del contrato.

## Disciplina TDD

- ¿Producción sin test que la pida? **NO.** Cada rama de `Hero.tsx` (guarda matchMedia, guarda
  `!controlVivo`, onClick, clearTimeout) y de `hero-logica.ts` tiene aserción que la mata; la
  guarda `typeof window.matchMedia !== 'function'` (Hero.tsx:87) la ejercitan además los renders
  SIN stub (jsdom 25 no trae matchMedia). El SCSS nuevo (`.control`, bloque completada, token) está
  aseverado por bytes línea a línea.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ.** 7 ciclos con conteos de rojos por ciclo, Ley 2 en el
  ciclo 2 (import inexistente), y los tests nacidos verdes (ciclos 6 y 7) validados por sabotaje
  (18 sabotajes documentados con su conteo de rojos, todos restaurados).
- Desvío documentado del brief §3b (clase condicional → `data-firma`): justificado con causa
  técnica real (`css: false` deja las clases undefined; mutante inmatable) y el contrato no fija la
  forma. Correcto.

## El reloj ÚNICO (la pregunta central del encargo)

- En el SCSS todo deriva del token por `calc()`; NO existe ninguna duración >1 s fuera del token
  (aseverado, no confiado).
- En producción NO hay ningún 90/90 000/90 800 duplicado: `Hero.tsx:108` usa
  `milisegundosDeCeremonia()`, que se calcula EN LLAMADA desde `SEGUNDOS_DE_TRAZO` +
  `SEGUNDOS_DE_SALIDA`.
- El espejo lógica↔hoja está ASEVERADO en las dos direcciones: `hero-logica.test.ts:30-38` compara
  `SEGUNDOS_DE_TRAZO` contra el token LEÍDO de los bytes del SCSS, y `:40-54` reconstruye
  `SEGUNDOS_DE_SALIDA` (0,2 del calc + 0,6 de duración) desde los bytes. Cambiar un lado sin el
  otro pone la suite roja. Los `90_800` de los tests van a mano (anti-tautología), con el mismo
  número vigilado desde la hoja (`hero-estilos.test.ts:393-400`) y desde la lógica.

## Calidad

- `hero-logica.ts`: puro, sin window/DOM; constantes de módulo = literales simples consumidos en
  llamada (nada derivado en la carga — la trampa familia B de `tdd_deuda_mutacion_full.md`
  esquivada). `FaseDeLaFirma` con «cliente»≠«reloj» hace observable la limpieza del timeout:
  decisión de diseño excelente.
- `Hero.tsx`: dos efectos de un solo motivo cada uno; `null` = preferencia sin leer mantiene el
  horneado idéntico al primer render de cliente (sin botón muerto en los bytes); botón nativo →
  Enter/Espacio gratis, sin listeners a mano.
- `stryker.config.json`: alta de `hero-logica.ts` hecha (era el PENDIENTE del lead). Correcta.
- `feature_list.json`: 0 features `in_progress` — F-07 NO reabierta, conforme al brief §5.
- Sin `toHaveClass`, sin terceros nuevos, convenciones del repo respetadas.

## Checkpoints

- C1: [x] ficheros presentes. `bin/harness init` NO ejecutado por este judge POR INSTRUCCIÓN del
  lead (vitest dirigido solamente; la mutación corre en paralelo) — lo cierra la puerta `verify`
  del lead. Vitest dirigido: 91/91 verde.
- C2: [x] 0 `in_progress` en feature_list.json; current.md describe la sesión activa.
- C3: [x] módulos conformes a la arquitectura (componente + module.scss + lógica pura hermana,
  patrón galeria/resenas); cero dependencias nuevas.
- C4: [x] test por módulo tocado; 91 > 0 verdes en los ficheros del alcance.
- C5: [—] cierre de sesión: no aplica aún (history.md lo remata el lead al cerrar).
- C6: [x] contrato con @s taggeados y Then medibles; mapa @s→test en el diario; sin producción
  huérfana.
- C7: [ ] mutación PENDIENTE (corre tras esta aprobación; Hero.tsx break 100 + hero-logica.ts
  recién dado de alta).

## Hallazgos (numerados, ninguno bloqueante)

1. **[Nota para EN VIVO]** La superficie del control (`inset: 0` sobre `.escena`) cubre el rótulo
   Y la caja del h1/«STUDIO» de debajo (la escena abraza ambos). El contrato habla del «área del
   rótulo»; la escena ES esa área a efectos del árbol, pero la geometría real del solape queda
   diferida a la verificación EN VIVO (§4 del brief) — confirmar allí que no sobra superficie.
2. **[Nota para EN VIVO]** La VISIBILIDAD del anillo de foco global sobre el botón transparente
   está aseverada solo por ausencia de outline en la hoja + foco por tab; que el anillo SE VEA
   sobre el hero es punto (4) de la verificación en vivo.
3. **[Nota para el mutation_tester]** Las deps `[]` del efecto de matchMedia son la familia de
   equivalentes ya ratificada dos veces (mutation_galeria_carrusel.md 124:6, Equipo.tsx 210); el
   diario pide ratificarla en corrida en vez de `// Stryker disable` preventivo — conforme al
   precedente.
4. **[Observación menor, sin acción]** `hero.test.tsx:617` y `hero-logica.test.ts:60` fijan
   90 800 a mano por anti-tautología; si algún día cambia la coreografía de salida habrá que
   tocar 3 ficheros de test — es el coste deliberado del candado, no una duplicación de
   producción.

## Cambios requeridos

Ninguno.

## Pase delta (Enmienda 2)

**Veredicto del delta:** APPROVED (APROBADO)

> `judge` · pase delta 2026-07-23 sobre el remate A-2/A-3/A-5 (diario
> `tdd_hero_caligrafia_lenta.md` § «Remate (Enmienda 2)»). Los 14 escenarios previos NO se
> re-revisan (aprobados arriba); aquí SOLO el delta: @s15/@s16/@s17 nuevos, @s7/@s13 ampliados,
> la exclusión ratificada y la ausencia de regresión. Vitest dirigido: **107/107 en verde**
> (38 estilos + 57 DOM + 12 lógica; 1,65 s), cuadra con el diario (16 nuevos sobre 91).

### Cobertura del delta (@s ↔ test)

- @s15 bytes: [x] `hero-estilos.test.ts:505-547` — bases de `.trazo`/`.aplicador`/`.heroStudio`
  SIN `animation:` (506-513); el bloque `.escena:global(.caligrafia-lista)` anima las tres
  (515-519); las CINCO animaciones dentro del bloque, nombradas a mano (521-531); fuera del
  bloque todo `animation` restante es `none` sobre CSS sin comentarios (533-546). El horneado
  SSR sale sin la clase → rótulo completo estático sin JS, y la hoja lo garantiza porque la
  base YA es el final (@s1 intacto, re-verificado en verde).
- @s15 DOM: [x] `hero.test.tsx:876-899` — clase Y botón presentes tras el montaje (877-884) y
  retirados JUNTOS al completar (886-898). La atomicidad «mismo render» es POR CONSTRUCCIÓN:
  ambos derivan de la MISMA variable `controlVivo` (Hero.tsx:196 la clase, :264 el botón) — no
  existe render intermedio posible con una sin el otro. Sin ventana de movimiento sin mecanismo.
- @s7 ampliado: [x] `hero.test.tsx:730-734` — `renderToString` NO contiene `caligrafia-lista`
  (mordida probada por sabotaje «clase horneada incondicionalmente» = 3 rojos, diario Ciclo A).
- @s13 ampliado: [x] `hero.test.tsx:708-720` — la clase NO se añade bajo reduce, ni al montar
  ni tras avanzar 90,8 s.
- @s16: [x] `hero.test.tsx:814-868` — las TRES vías de desmontaje: clic con `userEvent` (que
  enfoca al pulsar, 815-827), Enter tras tab (829-839) y fin de reloj con el foco puesto
  (841-854); destino = la escena con `tabindex="-1"` (el que fija el contrato; aserción del
  atributo en :826 → sin parada de tabulador nueva). NEGATIVA en :856-867: sin foco en el
  botón, el fin de reloj NO lo roba (guarda `document.activeElement === boton`,
  Hero.tsx:93). La recolocación va ANTES de `setFase` en las dos rutas (Hero.tsx:116, :175):
  el foco se muda con el botón aún montado.
- @s17: [x] `hero.test.tsx:743-804` — change a `matches:true` a mitad de firma → clase y botón
  fuera al instante (744-758); `matches:false` sobre firma en marcha NO la toca (760-771, mata
  el manejador incondicional); desactivar tras completar NO rearranca y el reloj quedó LIMPIO
  (90,8 s después sigue `corriendo`, 773-788 — observable gracias a que la limpieza del efecto
  del reloj corre al caer `controlVivo`); unmount → `removeEventListener('change', manejador)`
  con EXACTAMENTE el manejador capturado del espía (790-803). Listener y limpieza en el MISMO
  efecto que lee la preferencia (Hero.tsx:138-148), patrón galería @s12 como manda el contrato.

### Las preguntas del encargo, una a una

1. **A-3, SSR sin clase**: `controlVivo` nace false (`movimientoReducido = null` hasta el
   efecto) → ni clase ni botón en `renderToString`; la hoja no declara NINGUNA animación fuera
   del bloque condicionado (aseverado por bytes, no confiado). ✓
2. **A-3, mismo montaje**: clase (Hero.tsx:196) y botón (:264) leen la MISMA `controlVivo`
   del mismo render. ✓
3. **A-3, timeout alineado**: el efecto del reloj depende de `[controlVivo]` y está gated por
   `if (!controlVivo) return` (Hero.tsx:164, :182): se arma en el MISMO commit en que la clase
   entra, y su limpieza lo desarma cuando la clase sale (por cliente, por reloj o por reduce en
   caliente). Misma variable = alineación por construcción, más la frontera 90 799/90 800
   re-verificada en verde. ✓
4. **A-3, reduced-motion intacto**: el `@media reduce` conserva `animation: none` a las tres
   piezas y `display: none` del aplicador (@s3/@demo en verde), y REPITE la clase en sus
   selectores (hero.module.scss:229-241) con motivo CORRECTO: un @media no añade especificidad
   y `.trazo` a secas (0,1,0) perdería contra el bloque condicionado (0,3,0) justo cuando
   reduce se activa con la firma en marcha — a igual especificidad gana el @media por orden.
   Defensa CSS pura para la ventana previa al re-render de React. Bien visto y bien comentado.
5. **La exclusión**: `grep "Stryker disable"` en `src/components/Hero.tsx` devuelve UNA línea
   (:156), `// Stryker disable next-line all` cubriendo SOLO el `[]` de :157 (deps en línea
   propia, patrón Galeria.tsx), con motivo y referencia explícita a
   `progress/mutation_hero_caligrafia_lenta.md` in-situ (:150-155). Es EXACTAMENTE la línea
   ratificada por el lead (contrato, ENMIENDA 2 :63-66; informe §Escalado punto 1). Ninguna
   exclusión más en el alcance. ✓
6. **El segundo superviviente del remate** (Hero.tsx 93:7, diario Ciclo D): curado ELIMINANDO
   la rama muerta (`escena !== null`) y declarando el invariante a nivel de tipo
   (`escena!.focus()`, Hero.tsx:99) con el porqué comentado (:94-98). Cura de artesano
   correcta: menos código, mutante inexistente en vez de excluido, comportamiento idéntico y
   cubierto por @s16. Sin alcance inflado. ✓

### Disciplina TDD del delta

- ¿Producción sin test que la pida? **NO.** Cada pieza nueva de `Hero.tsx` (CLASE_LISTA,
  refs, tabIndex −1, `recolocarElFocoSiCaeAlVacio`, listener change, guarda `matches`) y del
  SCSS (bloque condicionado, especificidad del @media) tiene aserción que la mata.
- ¿Rojo→Verde? **SÍ.** Ciclos A-C con rojos contados (12/3/4); los nacidos-verdes validados
  por sabotaje (7 sabotajes del delta documentados con conteo, todos restaurados —
  destacan el `tabIndex={+1}` = 5 rojos y la limpieza vaciada = manejador exacto).
- Alcance declarado = alcance real: `hero-logica.ts` y su test intactos, `stryker.config.json`
  sin cambios en el delta (su alta es del pase anterior), 0 features reabiertas.

### Regresión

- 107/107 en verde en los 3 ficheros de hero (vitest dirigido, orden del lead: sin suite
  completa, sin build, sin mutación en este pase). Los invariantes de F-07 (@s6/@s7: un h1,
  dos span, text node real, nombre accesible, base visible, sin inline) y los 14 escenarios
  previos siguen verdes; los 6 tests de @s4 se movieron a leer `reglaAnimada` (la ubicación
  cambió con el contrato, los TIEMPOS aseverados no — verificado: token 90s, linear, calc,
  90 800 exactos intactos).

### Checkpoints (delta)

- C1: [x] parcial — ficheros presentes; `bin/harness init` NO ejecutado por instrucción del
  lead (lo cierra su puerta `verify`).
- C2: [x] estado coherente; C3: [x] sin dependencias nuevas, arquitectura respetada;
- C4: [x] 107 > 0 verdes en el alcance; C6: [x] @s15-@s17 taggeados, Then medibles, mapa al día.
- C7: [—] la mutación FORMAL (informe del mutation_tester actualizado) corre tras esta
  aprobación: `mutation_hero_caligrafia_lenta.md` en disco aún refleja la 1ª corrida (97,14 %,
  ESCALADO); los números finales del diario (Hero.tsx 50/50 = 100 %, Ignored 1;
  hero-logica.ts 16/16) deben quedar ratificados en informe propio antes del `done`.

### Hallazgos del delta (numerados, ninguno bloqueante)

1. **[Observación]** «Mueren juntos» está aseverado por DOM en la vía cliente (@s15) y reduce
   (@s13/@s17); en la vía fin-de-reloj el DOM asevera el botón fuera (@s12) y la clase cae por
   construcción (misma `controlVivo`). Aceptable: no hay rama que las separe.
2. **[Observación]** El candado de bytes de @s15 vigila el shorthand `animation:`; un longhand
   `animation-name` en la base lo esquivaría en teoría. No existe en la hoja y la puerta
   humana + este registro lo dejan cazado para el futuro. Sin acción.
3. **[Para el cierre]** Verificación EN VIVO pendiente (lista del diario: arranque en montaje
   real, foco tras Enter/reloj en Chrome, toggle de reduce en caliente, LCP) + informe de
   mutación actualizado (C7). Sin ellos, nada de `done`.

### Cambios requeridos (delta)

Ninguno.
