# Review — LOTE v3+reseñas (feature 22 `galeria_carrusel` v3 · feature 14 `resenas_agregado_enlace`)

> `judge`, 2026-07-23, rama `feat/galeria-v3-resenas`. Contratos: `features/galeria_carrusel.feature`
> v3 (@s1..@s24) y `features/resenas_agregado_enlace.feature` (@s1..@s9). Diarios:
> `progress/tdd_galeria_carrusel.md` § Ciclo v3 y `progress/tdd_resenas.md`. Brief con los raíles:
> `progress/galeria_v3_resenas_diseno.md`. Corridas DIRIGIDAS por orden del lead (sin suite
> completa, sin build, sin mutación — corren en paralelo): **339/339 verdes** en los 9 ficheros de
> test del lote + `home.test.tsx` 2/2 + `boton-whatsapp-montaje.test.tsx` 3/3 · `tsc --noEmit` 0 ·
> `eslint .` 0.

**Veredicto feature 22 (galería v3): APPROVED**
**Veredicto feature 14 (reseñas): CHANGES_REQUESTED**

---

## Cobertura de escenarios — galería v3 (@s ↔ test)

- @s1: [x] `galeria.test.tsx` 7 tests vivos intactos + describe @s1 (seis `<img>` exactas tras vuelta entera)
- @s2: [x] describe @s2 (div raíz, un h2, puntos button, nota byte a byte, dentro de `<main>`)
- @s3: [x] `galeria-logica.test.ts` tabla a mano (rango [-2,+3], empate por `>`)
- @s4: [x] `galeria-logica.test.ts` doble módulo (`(-4)%6`), ida y vuelta de 6
- @s5: [x] `galeria.test.tsx` tabla data-distancia/`--s`/z-index inline >0, decreciente
- @s6: [x] árbol APG Grouped, sin aria-hidden, aria-controls → `galeria-pista`
- @s7: [x] tabla de verdad `vozDeLaPista` (lógica) + off/polite en DOM
- @s8: [x] primer tabulable, nombre cambia, sin aria-pressed, parada definitiva 12000 ms, 9 controles fuera de la pista
- @s9 (v3): [x] `carrusel-logica.test.ts` constante 2000 a mano + frontera 1999/2000 + vuelta 12000 ⇒ 1ª
- @s10/@s11/@s12: [x] re-medidos a tick de 2000 ms; sus Then NO cambiaron (diff del `.feature` verificado: solo números). matchMedia en caliente con captura y limpieza por identidad de manejador
- @s13/@s14/@s15: [x] `galeria-estilos.test.ts` por bytes; @s14 sigue siendo cierto TRAS el cristal: UNA sola declaración `transform:` en toda la hoja (los mandos centran con `top: calc(50% - 1.375rem)`, sin transform — verificado en `galeria.module.scss:57-70`)
- @s16/@s17/@s18/@s19: [x] intactos (flechas dos extremos, aria-disabled + diana 24px, clic lateral, arrastre 48 inclusivo + click sintetizado + draggable=false + touch-action)
- @s20: [x] ×5: flecha 1500→3499/3500, punto, clic lateral, arrastre, y PAUSADO+12000 (anti-regresión SC 2.2.2)
- @s21: [x] `carrusel-logica.test.ts` tabla de 8 filas a mano + `esCampoDeEscritura` ×7
- @s22: [x] tabla de 6 filas + umbral 0.6 inclusivo + empate estable + vacía + candidata única — **cobertura PURA; ver hallazgo 1: el cableado a dos carruseles queda para el ciclo de reseñas**
- @s23: [x] ×9: foco dentro sin IO, blur deja de atender, sin IO no revienta, stub con `{threshold:[0.6]}` a mano, ctrl no, 0.4 no (sin preventDefault), input real con `.focus()`, tecla reinicia reloj, limpieza por identidad + disconnect
- @s24: [x] bytes ×8 (sin `.mandos`, absolute, 2.75rem, color-mix+blur, tokens, z-index 7 > 6, anclajes, nada oculto en 640px) + DOM ×2 (hijos DIRECTOS de `.carrusel`, orden chip→flechas→escenario→puntos)

## Cobertura de escenarios — reseñas (@s ↔ test)

- @s1: [x] `resenas.test.tsx` ×7+1 (orden equipo→reseñas→reserva en SSR, carruseles separados por reserva, div raíz, un h2, sin nav/anclas, bytes de home.tsx, nav intacta con los 7 destinos a mano, único `<a>` externo)
- @s2: [x] línea del agregado: «4,9», «1.239 opiniones», «Treatwell», href EXACTO + `_blank` + `noopener`, «23/07/2026» visible, «4,9 de 5» + estrellas aria-hidden
- @s3: [x] `resenas-agregado.test.ts` (5 campos a mano, único export runtime) + horneado con los 5 valores + bytes de `Resenas.tsx` SIN literales (verificado también por grep propio: cero apariciones de 2000/4,9/1239/Treatwell/2026)
- @s4: [x] `resenas-demo.test.ts` (6 exactos, forma, ≥1 nota 4, disyunción con ancla size=10) + los 6 textos A MANO en el HTML + calas negativas del reviewPool. **Verificación ocular del raíl legal: los 6 textos son genéricos inventados (Carmen/Silvia/Rocío/Teresa/Irene/Mónica), disjuntos de las 10 autoras del reviewPool Y de los 7 nombres del equipo; ninguno coincide ni parafrasea las reseñas del pool**
- @s5: [x] leyenda byte a byte (con «·» y acentos), visible, exportada en el módulo demo
- @s6: [x] `home-horneado.test.ts` +4 (ancla positiva BeautySalon, claves ausentes, literal ausente del HTML entero, agregado horneado) — **build-based: NO corridos aquí por orden del lote; primera corrida real la del lead** — + proxy runnable (sin `<script>`/ld+json en la sección)
- @s7: [x] `resenas-logica.test.ts` tabla de 4 (5/4/4.9/4.4) a mano + aria-hidden y nota en texto por tarjeta a mano
- @s8: [~] los bloques espejo (@s3..@s5, @s6, @s7, @s8, @s9=2000ms, @s10, @s11, @s12, @s16..@s19, @s20, @s21..@s23, @s24 del padre) están TODOS replicados y verdes, con ids/etiquetas propios y convivencia (2× cada mando, singulares por ámbito, ids disjuntos en toda la home) — **PERO el And «la desambiguación del teclado entre los DOS carruseles es la de @s22» NO tiene test ni implementación que lo satisfaga: hallazgo 1, BLOQUEANTE**
- @s9: [x] `resenas-estilos.test.ts` ×31 (3D heredado, `aspect-ratio: 8 / 5` ≠ 4/3, central opacidad 1 con pares AA auditados —`--text`/`--ink`/`--accent-dark` sobre `--surface2`, desviación razonada del brief documentada en el diario (decisión 4) porque `--ink/--surface` NO está en la matriz de la puerta—, apagado en la lámina, oculta none+none, touch-action, 640 único breakpoint) + sin `<img>` en el HTML

## Disciplina TDD

- ¿Producción sin test que la pida? **Parcial** — todo lo nuevo tiene test que lo exige POR VALOR
  (constante 2000, `pasoDeTecla`, `esCampoDeEscritura`, `quienAtiendeElTeclado`, generación `{}`,
  guardas, limpiezas, bytes del cristal), con una salvedad: la rama de desempate por cercanía de
  `quienAtiendeElTeclado` (`carrusel-logica.ts:92`) está contratada (@s22) y testeada PURA, pero es
  INALCANZABLE desde producción — ningún cableado le pasa jamás ≥2 candidatas ni una distancia real
  (hallazgo 1). No es alcance inflado del módulo puro (el contrato la exige): es cableado que falta.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ, fuerte en ambos diarios**: galería 10 ciclos con rojo
  citado + 16 sabotajes aplicar→rojo→revertir (incluye los finos: deps sin generación, preventDefault
  antes de la guarda, `!==`→`===` NADIE, z-index 3, fondo sin color-mix); reseñas 14 ciclos +
  sabotajes por bloque, incluido el OBLIGADO del bloque que nació verde (id compartido → 11 rojos).
- Tautologías: no encontradas. Literales a mano en todos los esperados; la disyunción @s4 compara dos
  fuentes de producción entre sí (propiedad, no tautología) y lleva ancla anti-vacuidad (size=10).
- Conteos declarados = medidos: 197 (galería, 4 ficheros) + 142 (reseñas, 5 ficheros) = 339 ✓.

## Calidad

- `carrusel-logica.ts`, `resenas-logica.ts`, `resenas-agregado.ts`: funciones cortas, un motivo de
  cambio, nombres reveladores, cero números mágicos sin nombre. El gotcha CLDR de `totalConMillar`
  (es-ES deja «1239» sin punto) está MEDIDO y documentado en el propio módulo. Bien.
- Arquitectura respetada: decisión pura / componente que cablea / SCSS que mide; reutilización por
  IMPORT de `galeria-logica.ts` (cero duplicación de funciones puras); dato demo fuera de mutate y
  dato real fechado en su módulo sin derivaciones en carga (anti-estáticos verificado por test).
- Constante 2000: UNA sola puerta al número (`carrusel-logica.ts:13`), SIN re-export en
  `galeria-logica.ts` (solo un comentario de mudanza, líneas 134-136) — grep de producción limpio.
- Token de generación `{}` (identidad, no contador): elimina por construcción el mutante equivalente
  `g+1/g-1`; razonado en el diario y en el propio código. Correcto.
- Cristal: mandos hijos DIRECTOS de `.carrusel` (no de `.marco` con overflow), z-index 7, SIN
  transform (la única `transform:` de cada hoja sigue siendo la de la tarjeta — @s14 sigue cierto).
- Contrato de errores n/a (componente UI sin canal de error propio).

## Hallazgos numerados

1. **[BLOQUEANTE — reseñas @s8, co-afecta a galería @s22] La desambiguación del teclado entre los
   DOS carruseles no existe en la página.** Cada componente decide con UNA candidata propia y con la
   distancia FABRICADA a 0 (`Galeria.tsx:217-221`, `Resenas.tsx:183-187`), y hay DOS listeners
   independientes sobre `document` que no se conocen. Consecuencias medibles contra el contrato:
   (a) con ambos ≥ 0.6 visibles (la «pantalla altísima» para la que @s22 contrata el desempate por
   cercanía, filas 5-6), una sola tecla mueve LOS DOS carruseles y ambos hacen `preventDefault` —
   el Then de @s22 es «atiende X», singular; (b) caso alcanzable en pantalla NORMAL: foco dentro de
   la galería (la pausa de foco no se pierde al hacer scroll) + sección de reseñas ≥ 0.6 visible ⇒
   la galería atiende por `focoDentroAhora` y las reseñas por visibilidad: una tecla mueve los dos.
   Es exactamente la clase de interferencia que la línea roja de @s21..@s23 prohíbe. La rama de
   cercanía de `quienAtiendeElTeclado` (`carrusel-logica.ts:92`) queda inalcanzable desde
   producción: jamás recibe dos candidatas ni una `distanciaAlCentro` real (el callback del IO
   ignora `boundingClientRect`). El diario (`tdd_resenas.md` decisión 7) atribuye a @s22 que «la
   geometría impide el doble-visible»: @s22 NO fija eso — dice «casi imposible» y contrata el
   desempate PARA cuando ocurra. El And de @s8 («la desambiguación entre los DOS carruseles es la
   de @s22: la decisión es UNA y compartida, no dos copias») queda sin test y sin implementación:
   en runtime hay DOS decisiones independientes con entradas fingidas.
2. **[Menor — galería] Comentario incumplido en `Galeria.tsx:214-216`**: «cuando exista el carrusel
   de reseñas, cada uno aportará su proporción y su distancia al centro y decidirá la MISMA función
   pura». El carrusel de reseñas existe EN ESTE LOTE y ni la distancia se aporta (0 fijo) ni la
   decisión es una. Corregir el comentario (o cumplirlo) junto con el hallazgo 1.
3. **[Menor — galería] Sombreado de nombre en `Galeria.tsx:199`**: `const activo =
   document.activeElement` eclipsa el estado `activo` (índice centrado, línea 87) dentro del mismo
   componente. `Resenas.tsx:165` ya usa `enfocado`: igualar al corregir el hallazgo 1.
4. **[Observación — reseñas] ~180 líneas de cableado duplicadas** entre `Galeria.tsx` y
   `Resenas.tsx` (efectos de matchMedia/intervalo/teclado, handlers de gesto). El contrato solo
   obliga a compartir lo PURO (cumplido por import), así que no es fallo por la letra; pero un hook
   compartido habría hecho estructuralmente imposible el hallazgo 1 (un solo listener, una sola
   lista de candidatas). A valorar por el lead al diseñar la corrección.
5. **[Aviso al mutation_tester] Tres `Stryker disable` en `Resenas.tsx`** (líneas 78, 129, 231:
   `arranqueExplicito` inicial y deps `[]` de los dos efectos solo-montaje), preanunciados en el
   diario con precedente verificado (`mutation_galeria_carrusel.md` 86:62 y 124:6). Re-verificar,
   como pide el propio diario; si discrepa, retirar y litigar con mutantes vivos.
6. **[Pendiente declarado, no hallazgo] Los 4 tests build-based de @s6** en `home-horneado.test.ts`
   NO se han ejecutado en esta review (orden del lote: sin build). Primera corrida real: el
   `bin/harness init` del lead. Este veredicto queda CONDICIONADO a ese verde, como todo el lote.

## Raíles legales (verificación ocular, además de los tests)

- Ni un texto de Treatwell: los 6 testimonios de `resenas-demo.ts` son genéricos inventados, sin
  parecido con los 10 del reviewPool ni con patrón de reseña real (autoras de pila, sin inicial). ✓
- Disyunción total con `equipo-demo.ts` (textos y nombres; también contra los 7 nombres del equipo). ✓
- Agregado con plataforma + enlace exacto + fecha, los tres VISIBLES en una línea. ✓
- JSON-LD sin `aggregateRating` ni `review`, con ancla positiva (test build-based + proxy). ✓
- Leyenda art. 20.4 integrada, byte a byte, desde el módulo demo. ✓

## Checkpoints

- C1: [x] ficheros y docs presentes · [ ] `bin/harness init` — NO corrido aquí por orden del lote
  (corre en paralelo con el lead); veredicto condicionado a su verde.
- C2: [ ] hay DOS features `in_progress` (F-14 y F-22) — excepción de LOTE decidida por el lead y
  documentada en `progress/current.md`; se re-cierra a una al terminar. `current.md` describe la
  sesión activa. ✓ parcial.
- C3: [x] módulos en su sitio, cero dependencias nuevas, sin logs de debug ni TODOs huérfanos.
- C4: [x] tests por módulo nuevos (339 dirigidos verdes) · [ ] `bin/harness test` completo: del lead.
- C5: [ ] sesión abierta (history al cierre) — no aplica aún.
- C6: [x] galería: contratos, tags, mapa @s→test y disciplina completos · [ ] reseñas: el And de
  desambiguación de @s8 sin test ni implementación (hallazgo 1).
- C7: [ ] mutación pendiente (corre después de este veredicto; `stryker.config.json` ya ampliado por
  el lead con los 4 mutables nuevos).

## Cambios requeridos (reseñas — hallazgo 1)

1. Cablear la desambiguación REAL entre los dos carruseles con UNA decisión: registro compartido de
   candidatas (en `carrusel-logica.ts` o un coordinador cableado que ambos componentes alimenten)
   donde cada carrusel aporta `{ proporcionVisible, distanciaAlCentro }` MEDIDA de la entrada del
   IO (`boundingClientRect`/`rootBounds`, no un 0 fijo), y una sola llamada a
   `quienAtiendeElTeclado` arbitra quién mueve y quién hace `preventDefault`. El foco dentro debe
   asignar la tecla al carrusel enfocado y EXCLUIR al otro (hoy el otro puede atender por
   visibilidad a la vez).
2. Test de integración (Home + stub de IO con captura de AMBOS observadores, patrón ya existente)
   que fije: (a) ambos ≥ 0.6 ⇒ una tecla mueve SOLO el más cercano al centro y el otro no cambia;
   (b) foco dentro de la galería + reseñas visible ≥ 0.6 ⇒ mueve SOLO la galería; (c) el evento
   recibe UN preventDefault y el carrusel no atendido no reinicia su reloj.
3. La corrección tocará `Galeria.tsx` (su mitad del cableado) y de paso los hallazgos 2 y 3: ese
   delta de galería se re-revisa junto con el re-judge de reseñas (precedente: judge v1→v2→delta).

---

## Pase delta del remate

> `judge`, 2026-07-23, pase DELTA sobre `progress/tdd_resenas.md` § «Remate del lote». Alcance:
> SOLO el delta (hallazgo 1 + avisos a11y + 5 matables/2 exclusiones). Lo aprobado en el pase
> anterior NO se re-revisa. Corrida dirigida propia: **295/295 verdes** en los 5 ficheros tocados
> (`carrusel-logica.test.ts`, `galeria.test.tsx`, `resenas.test.tsx`, `galeria-estilos.test.ts`,
> `resenas-estilos.test.ts`). Sin suite completa, sin build, sin mutación (orden del lead).

**Veredicto delta: APPROVED** — el hallazgo 1 está resuelto de verdad, con los hallazgos 2 y 3
de propina, y los bloques B y C completos.

### 1. Hallazgo 1 — verificado con saña: RESUELTO

- **El arbitraje es ÚNICO.** Registro compartido de módulo (`carrusel-logica.ts:110-170`): ambos
  componentes se registran (`Galeria.tsx:200`, `Resenas.tsx:167`) y cada listener pregunta
  `atiendeLaCandidata(suId)` (`carrusel-logica.ts:161-165`), que hace UNA llamada a
  `quienAtiendeElTeclado` sobre TODO el registro — un solo índice ganador, un solo id iguala.
  El registro no cambia entre las dos invocaciones del mismo keydown (solo IO/foco/montaje lo
  tocan), así que las dos consultas ven el MISMO estado: determinista, una tecla → UN carrusel.
- **Todos los casos de @s22**: ambos ≥ 0.6 ⇒ cercanía (tabla pura filas 5-6,
  `carrusel-logica.test.ts:78-119`; integración con AMBOS montados,
  `resenas.test.tsx:1383-1415` — mueve SOLO reseñas, galería quieta); foco+visible ⇒ el foco
  ASIGNA y EXCLUYE (`quienAtiendeElTeclado:87-91`, findIndex ANTES del umbral; puro
  `carrusel-logica.test.ts:151-177` y `:227-241` ida y vuelta; integración caso (b) del judge
  `resenas.test.tsx:1417-1450`); empate total estable (primera registrada,
  `carrusel-logica.test.ts:126-135`, mata `<`→`<=` de la cercanía); vacío/única/0.59/0.6
  inclusivo intactos.
- **Medidas REALES del IO**: el callback pasa `entrada.intersectionRatio` y
  `distanciaAlCentroDe(entrada.boundingClientRect, entrada.rootBounds)` (`Galeria.tsx:242-246`,
  `Resenas.tsx:206-210`) — el cero fijo ha muerto. `distanciaAlCentroDe` testeada por valor con
  marco que NO empieza en 0 (`carrusel-logica.test.ts:265-290`); los stubs de test llevan rects
  reales con distancia 120 no-cero (`galeria.test.tsx:1099-1115`) y distancia parametrizada
  (`resenas.test.tsx:1355-1372`). El sabotaje 1 del diario (distancia 0 reintroducida → 1 rojo,
  exactamente el test (a)) confirma que la red muerde el bug EXACTO.
- **preventDefault solo del que atiende**: guarda `pasos === 0` → consulta al árbitro → SOLO
  entonces `preventDefault` (`Galeria.tsx:214-222`, `Resenas.tsx:181-189`). Aseverado con espía
  `toHaveBeenCalledTimes(1)` sobre el MISMO evento con los dos carruseles montados
  (`resenas.test.tsx:1413`, `:1449`) y `defaultPrevented === false` en todos los casos de «no
  atiende» (ctrl, ratio 0.4, campo de texto, sin foco).
- **El no atendido NO reinicia su reloj**: su tick original llega puntual en t=2000 y el del
  atendido cuenta desde la tecla (`resenas.test.tsx:1452-1495`) — el caso (c) de los cambios
  requeridos, completo.
- **Retirada limpia, sin candidaturas fantasma**: baja en la limpieza del efecto
  (`Galeria.tsx:271`, `Resenas.tsx:235`), registro 2 → 0 al desmontar ambos
  (`resenas.test.tsx:1497-1511`, esperados a mano); medir/enfocar un id NO registrado no lo crea
  (`carrusel-logica.ts:141-155` guardas + `carrusel-logica.test.ts:243-249`); `retirarCandidata`
  saca de la decisión (`:251-262`). No hay listener de módulo que sobreviva a los componentes:
  el diseño ratificado (opción B) mantiene un listener POR componente, y cada uno se da de baja
  por IDENTIDAD de manejador con su unmount (`galeria.test.tsx:1200-1224`,
  `resenas.test.tsx:1297-1318`) — no queda nadie que robar teclas pueda.
- **Hallazgos 2 y 3, cerrados de paso**: el comentario incumplido reescrito por la realidad
  (`Galeria.tsx:113-116`) y `const activo` → `const enfocado` (`Galeria.tsx:203`), igualado a
  `Resenas.tsx:170`.

### 2. Trampa de estáticos — limpio

- El coordinador NO deriva nada en la carga: `new Map()` sin argumentos (`carrusel-logica.ts:123`,
  sin mutantes) y funciones de consulta puras por valor. Los únicos estáticos nuevos son los ids
  `CANDIDATA_GALERIA`/`CANDIDATA_RESENAS`, asertados POR VALOR a mano
  (`carrusel-logica.test.ts:188-191`) — el razonamiento del diario (literal por componente =
  StringLiteral autoconsistente inmatable) es correcto. Los literales del alta
  (`registrarCandidata:127`) están todos discriminados por tests (recién registrada NO atiende;
  ObjectLiteral→`{}` haría atender a `undefined < 0.6 === false` y los tests :198-213 lo cazan).
- La declaración de **100 % en los tres ficheros** (80/80, 113/113, 123/123) es del diario y es
  PLAUSIBLE contra el informe previo (los 5 `{' '}` tienen sus dos matadores nuevos:
  `resenas.test.tsx:188-194` línea del agregado ENTERA con `toBe` y `:485-507` valoración
  completa de las DOS ramas del redondeo, con los 2 sabotajes a mano medidos en rojo), pero su
  verificación es la puerta del `mutation_tester`, que corre DESPUÉS de este veredicto.

### 3. Cristal 85 % + subrayado — verificado por bytes

- `galeria.module.scss:45` y `resenas.module.scss:53`:
  `color-mix(in srgb, var(--surface) 85%, transparent)` en AMBOS, con la aserción EXACTA en
  `galeria-estilos.test.ts:368` y `resenas-estilos.test.ts:343` (nacidas ROJAS por bytes según
  el diario, 3 rojos medidos).
- Enlace del agregado: `text-decoration: underline` explícito con su porqué SC 1.4.1
  (`resenas.module.scss:25-30`) y test de bytes (`resenas-estilos.test.ts:412-418`).

### 4. Exclusiones — solo las dos ratificadas, con matiz para el mutation_tester

- Las ÚNICAS exclusiones nuevas del delta son las dos ratificadas: `Galeria.tsx:263` y
  `Resenas.tsx:227`, ambas sobre la guarda del IO, con motivo, referencia al informe
  (`mutation_lote_v3_resenas.md` 257:9 / 220:9) y la ratificación del lead citada. Verificado
  contra el diff (Galeria: exactamente esa + la de deps del teclado que ya venía del Ciclo v3
  re-verificada por el informe) y contra el fuente (Resenas: 3 preanunciadas + esta). Cero
  `Stryker disable` en los módulos de lógica.
- **[Observación, no bloqueante — para la re-corrida del `mutation_tester`]** `next-line all`
  sobre esa línea barre TAMBIÉN mutantes co-residentes MATABLES (`&&`→`||`, `'function'`→`""`,
  `!==`→`===`, condición entera→`true`/`false` — el propio informe midió 75 rojos al sabotear la
  condición entera). Es consecuencia de la exclusión POR LÍNEA que el lead ratificó (la cura
  quirúrgica era el refactor (a), descartado), pero la lección del propio repo
  (`tdd_deuda_mutacion_full.md`, barridos evitados en horario.ts) pedía por-MUTADOR cuando la
  línea aloja matables. Que el `mutation_tester` audite la lista de «Ignored» de la re-corrida y
  el lead decida si estrecha el comentario o asume el barrido documentado.

### 5. Corrida dirigida

- `carrusel-logica.test.ts` + `galeria.test.tsx` + `resenas.test.tsx` + `galeria-estilos.test.ts`
  + `resenas-estilos.test.ts` → **295/295 verdes** (5 ficheros, 5.1 s).

### Disciplina TDD del delta

- Rojo→Verde documentado: bloque B nació rojo por bytes (3 rojos); bloque A con el sabotaje del
  bug exacto del judge (1 rojo, el test del desempate); bloque C con los 2 mutantes aplicados a
  mano (2 rojos, los dos matadores). Producción nueva toda exigida por test por valor;
  `candidatasRegistradas` es observador del contrato de limpieza, no alcance inflado.

### Checkpoints (delta)

- C6 reseñas: [x] — el And de desambiguación de @s8 tiene ahora implementación (registro
  compartido) y tests de integración con los dos carruseles montados.
- C1/C4/C7: [ ] siguen CONDICIONADOS como todo el lote a `bin/harness init` completo del lead y
  a la re-mutación del `mutation_tester` (no corridos aquí, por orden).

**Con este delta, la feature 14 (reseñas) pasa a APPROVED y la aprobación de la feature 22
(galería v3) queda íntegra. Condicionado, como todo el lote, al verde del `bin/harness init` del
lead y a la puerta de mutación posterior.**
