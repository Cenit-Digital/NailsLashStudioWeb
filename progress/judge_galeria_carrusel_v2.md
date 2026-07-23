# Review v2 — feature 22 `galeria_coverflow_3d` (re-review tras el ciclo de remate; contrato v2.1, @s1..@s19)

**Veredicto: APROBADO**

Re-review tras `progress/judge_galeria_carrusel.md` (RECHAZADO, 4 cambios requeridos en §7) y la
Enmienda 1 del contrato (`features/galeria_carrusel.feature` v2.1: @s19 nuevo + @s12/@s15/@s17
ampliados). Se verifican los 4 cambios uno a uno, la Enmienda 1 contra el contrato, el hallazgo 8,
y los 8 tests matadores de Contacto/site ordenados por `progress/mutation_contacto.md`.

Corrida DIRIGIDA (instrucción del lead: suite completa, build y mutación corren en paralelo y no
se lanzan desde aquí): `pnpm exec vitest run` sobre los 5 ficheros tocados →
**203/203 verdes (4,9 s)** = 73 `galeria.test.tsx` (+16) + 47 `galeria-logica.test.ts` (=) +
25 `galeria-estilos.test.ts` (+4) + 46 `site.test.ts` (+2) + 12 `contacto.test.tsx` (+4).
Las cifras CUADRAN con los dos diarios de remate (`tdd_galeria_carrusel.md`, `tdd_contacto.md`).

## 1) Los 4 cambios requeridos de §7 — verificados uno a uno: CERRADOS

1. **`data-actual` — RESUELTO.** Test `galeria.test.tsx:365-376` (cuelga de @s17): asevera los
   SEIS valores (`['sí','no','no','no','no','no']`) ANTES y DESPUÉS de pulsar «Ver la foto 4 de 6»,
   arrays escritos a mano. Muerde: invertir el ternario de `Galeria.tsx:289` o vaciar los literales
   rompe el `toEqual` (sabotaje 1 del diario: 1 rojo).
2. **Glifo visible del control — RESUELTO.** Test `galeria.test.tsx:566-576` (cuelga de @s8):
   `textContent` del control `'❙❙'` rotando y `'▶'` pausado, glifos a mano. Mata el ternario de
   `Galeria.tsx:216` (sabotaje 2: 1 rojo con ambos glifos vaciados).
3. **Guarda muerta borrada — RESUELTO.** `typeof window === 'undefined' ||` ya no existe:
   `Galeria.tsx:100` guarda SOLO `typeof window.matchMedia !== 'function'` (precedente
   `reserva.test.tsx`). Además el helper `prefiereMovimientoReducido` desapareció: la lectura vive
   en el MISMO efecto que la escucha (Galeria.tsx:94-124), como exige @s12 ampliado. Deleción en
   verde (59/59 tras borrar, diario R3): correcta, no necesitaba test.
4. **`demo-seccion` horneada — RESUELTO.** Test `galeria.test.tsx:976-986`: extrae el atributo
   `class` de la raíz del `renderToString` por regex (patrón `equipo.test.tsx:128-138`, sin
   `toHaveClass`) y asevera `toContain('demo-seccion')`, con ancla anti-vacuidad (`not.toBeNull()`
   sobre el match). Mata el mutante de template literal de `Galeria.tsx:191` (sabotaje 3: 1 rojo).

## 2) Enmienda 1 contra el contrato v2.1 — FIEL

### @s19 (el arrastre, cableado)
- **Cableado donde el contrato lo fija:** `onPointerDown`/`onPointerUp` en el MARCO
  (`Galeria.tsx:238-240`, el ancestro con `overflow: hidden`), NO en cada tarjeta. La decisión
  sigue ÍNTEGRA en `pasosDelArrastre` (galeria-logica.ts:148-154, sin tocar): la subida llama a
  `desplazar(pasosDelArrastre(subida − bajada, UMBRAL_DE_ARRASTRE))` (Galeria.tsx:173-178),
  literal del contrato.
- **Semántica clic-vs-gesto:** `elegirFoto` (Galeria.tsx:184-188) solo centra si
  `pasosDelUltimoGesto.current === 0`. El test del gesto largo + click sintetizado a mano
  (galeria.test.tsx:481-494) asevera que DECIDE EL ARRASTRE (la tarjeta agarrada queda a
  distancia '1'), y el del toque corto (:496-505) es el contraejemplo anti-vacuidad que impide
  «resolverlo» matando el clic de @s18. Los puntos y flechas NO pasan por la puerta (viven fuera
  del marco): correcto, el contrato solo somete el clic de la tarjeta.
- **Frontera INCLUSIVA y asimetría, por valor y en el DOM:** por valor ya estaban
  (galeria-logica.test.ts:277-280: ±48→∓1; :271-275: ±47→0; :282-285 umbral inyectado); en el DOM
  los 8 tests nuevos (galeria.test.tsx:427-506) cubren las SEIS cláusulas del escenario: 48 px ←
  (200→152) trae la SIGUIENTE, 48 px → (200→248) devuelve la PRIMERA, 47 px no mueve NADA,
  dirección no-frontera en AMBOS sentidos (200→140 avanza / 200→260 retrocede: mata la resta
  invertida — sabotaje 5: 6 rojos), y el gesto larguísimo (400→40) mueve EXACTAMENTE UNA.
- **Trampa MEDIDA respetada:** `MouseEvent` con type `pointerdown`/`pointerup` y `clientX`
  (galeria.test.tsx:422-425), exactamente la vía que el contrato documenta para jsdom 25.
- El GESTO FÍSICO (dedo real) queda para la verificación EN VIVO, como el propio contrato acota.

### @s12 ampliado (la preferencia EN CALIENTE)
- Producción: el MISMO efecto que lee `matches` al montar se suscribe con
  `addEventListener('change')` y devuelve su limpieza (Galeria.tsx:104-124); el manejador solo
  pausa con `cambio.matches === true` — `matches:false` es INERTE (no pausa, no arranca).
- Tests (galeria.test.tsx:845-899, con el stub espiado :767-793 que responde solo a la consulta
  EXACTA escrita a mano): activar EN CALIENTE pausa la rotación en curso (12000 ms quietos +
  control «Iniciar…»); `matches:false` NO pausa una rotación en curso (mata al mutante del pausado
  incondicional — sabotaje 8: 1 rojo) y NO arranca una pausada; al desmontar,
  `removeEventListener` recibe EXACTAMENTE el manejador capturado, con `'change'`
  (`toHaveBeenCalledWith('change', manejador)`). Las cuatro cláusulas del Then ampliado, cubiertas.

### @s15 ampliado (pointer-events por bytes)
- `galeria.module.scss:132-142`: `pointer-events: none` en la MISMA regla `[data-distancia='3']`
  que ya declara `transition: none`, como pide la letra («esa MISMA regla»). Test por bytes:
  `galeria-estilos.test.ts:302-307` (`porDistancia(reglaBase('tarjeta'), 3)` — el mismo cuerpo de
  bloque para ambas aserciones). El @media móvil (scss:250-257) solo redeclara custom properties:
  no anula ni la transición ni el pointer-events de la base. Rojo real acreditado (R8: 1 rojo).

### @s17 ampliado (diana de 24 px)
- **La vía elegida es la que el contrato NO descartó:** círculo de 0.75rem — ANILLO DE 1px
  INCLUIDO — en el `::before` (scss:193-200); la caja del `<button>` mide 1.5rem×1.5rem invisible
  (grid centrado, `border: 0`, `background: transparent`, scss:183-191); el estado actual pinta el
  `::before`, no la caja (scss:202-207). `background-clip` está PROHIBIDO por test
  (galeria-estilos.test.ts:367) — el sabotaje 9 (anillo a la caja + background-clip: content-box,
  la trampa literal del contrato) dio rojo.
- **Ambas medidas declaradas y aseveradas:** galeria-estilos.test.ts:344-359 (1.5rem caja,
  0.75rem círculo, border-radius 50%).
- **Sin solape con el gap elegido:** `gap: 0.125rem` (scss:174) — cajas de 24 px a 2 px, > 0. El
  test :380-388 exige gap en rem SIN signo (≥ 0 por construcción del regex) y prohíbe márgenes
  negativos en `.puntos` y `.punto`: el solape no puede reintroducirse por ninguna de las dos vías.
- SC 1.4.11 intacto: dos tokens distintos (`--surface` / `--accent-dark`), sin `--accent`/`--line`
  (tests :319-342, ya existentes, siguen verdes).

## 3) Hallazgo 8 (recomendado) — AÑADIDO
`galeria.test.tsx:732-759` (@s11): tras «Iniciar» con el ratón encima, un ratón NUEVO
(leave + enter) vuelve a pausar (12000 ms quietos) Y al salir reanuda sola — fija la cancelación
de `entra()` (Galeria.tsx:159-162) y de paso re-verifica @s10. Sabotaje 4 (arranque pegajoso):
1 rojo. El comportamiento ya no vive solo en el diario.

## 4) Los 8 matadores de Contacto/site — CONFORMES, sin tocar producción
- **Producción intacta, verificado:** `git diff HEAD -- src/lib/site.ts src/components/Contacto.tsx
  src/components/contacto.module.scss` → VACÍO. Solo cambian los dos ficheros de test.
- **site.ts:125 y :133 (mensajes vaciados):** `site.test.ts:300-313` — `toThrow('empezar por "@"')`
  con `'nailslash.studio_'` y `toThrow('no es válido')` con `'@'` y `'@nails lash'`. Patrón F-02
  (`toThrow('teléfono')`), fragmentos a mano: el error deja de ser mudo. El otro hunk del diff es
  reformateo de prettier, sin cambio semántico.
- **Contacto.tsx:35 (`map(() => undefined)`):** `contacto.test.tsx:85-91` — las TRES filas con
  literales a mano Y emparejamiento día↔franja por adyacencia de spans en el horneado
  (`>Lunes a Viernes</span><span…>10:00–20:00<`), guion largo U+2013 incluido. Verifiqué el patrón
  contra el render real (spans hermanos, sin comentarios SSR intercalados).
- **Contacto.tsx:20 (`MAPS_HREF` vaciado, estático):** `contacto.test.tsx:98-102` — href EXACTO
  `?api=1&amp;query=40.5179875%2C-3.9226688` (coordenadas a mano, `&` escapado como `&amp;` —
  el gotcha MEDIDO del diario), anclado al texto `Cómo llegar`.
- **Contacto.tsx:26/:27 (clases raíz/rejilla):** `contacto.test.tsx:110-122` — atributo `class`
  del horneado por regex con anclas anti-vacuidad; el mutante deja `class=""` y el `toContain`
  cae. **:64/:77 (CTAs):** :124-133 — regex ancladas al TEXTO de cada enlace
  (`Escríbenos por WhatsApp` / `Cómo llegar`) con sus literales `demo-btn demo-btn--wa` y
  `demo-btn demo-btn--solido`. Clases GLOBALES estáticas: no choca con la regla anti-clase.
- Sabotajes del diario de Contacto: los 6 mutantes replicados a mano → 6 rojos, restauración por
  `git checkout` verificada. Cada test nuevo mata EXACTAMENTE al superviviente que el informe le
  asignó. 0 exclusiones nuevas, como ordenó el v1.

## 5) Cobertura @s ↔ test (v2.1)
- @s1..@s18: [x] sin regresión — los 125 tests del v1 siguen en disco y verdes (el detalle
  test a test está en `judge_galeria_carrusel.md` §1 y no se repite; los 20 nuevos solo AÑADEN).
- @s19: [x] 8 tests DOM (`galeria.test.tsx:427-506`) + 5 por valor preexistentes
  (`galeria-logica.test.ts:262-286`). Las seis cláusulas del Then, mapeadas arriba (§2).
- Producción nueva sin test que la pida: **NO** — cada línea nueva de `Galeria.tsx` (dos refs, dos
  handlers, la puerta del clic, el listener del change) tiene test que la exige y sabotaje que la
  acredita (tabla de 9 sabotajes del remate, todos con rojo).
- Tests nuevos que no muerden: **NO** encontré ninguno — los dos únicos que nacen verdes por
  diseño (47 px y toque corto) son contraejemplos exigidos por la letra del contrato y muerden vía
  los sabotajes 5-6 (resta invertida / puerta invertida).

## 6) Hallazgos NO bloqueantes (v2)
1. La invisibilidad de la CAJA del punto (`background: transparent`, `border: 0`, scss:189-190) no
   se asevera por bytes — el contrato remite el ASPECTO a la verificación EN VIVO (decisión 4 del
   remate) y las medidas + la vía del `::before` sí están testeadas. Dejarlo así.
2. Los tests de @s19 corren con timers REALES: el Given «carrusel parado» queda neutro de facto
   (ningún tick de 4 s puede dispararse en la vida del test). Determinista; sin acción.
3. El borde «baja fuera del marco, suelta dentro» (ref inicial 0) queda sin guarda A PROPÓSITO
   (decisión 2 del remate): una guarda sería producción sin test. Para la verificación EN VIVO.
4. **Sigue abierto C2:** dos features `in_progress` (`feature_list.json:289` contacto, `:496`
   galería). Este ciclo de remate ataca las dos; el lead debe dejar UNA (o ninguna) antes de `done`.
5. Para el `mutation_tester`: sigue vigente el aviso 9 del v1 (`arranqueExplicito` `false→true`
   inobservable por construcción — equivalente de libro, documentar y no perseguir). Y los cuatro
   ficheros están ya en `mutate` (`stryker.config.json:15,29,34,35`) con los `ignorePatterns` de
   `.experimentos-tmp/`/`.vite-react-ssg-temp/` que inmunizan frente a suites concurrentes.
6. Cerrado el hallazgo 6 del v1: `project-spec.md:2612` ya tiene la sección de la Feature 22.

## 7) Checkpoints
- C1: [x] dirigidos 203/203 verdes · [~] `bin/harness init` a cargo del lead (corre en paralelo,
  instrucción expresa de no pisarlo).
- C2: [ ] dos `in_progress` (hallazgo 4 arriba; del lead, no del craftsman).
- C3: [x] arquitectura intacta: la decisión nueva del arrastre siguió en la capa pura, el
  componente solo cablea; 0 dependencias nuevas; producción de Contacto sin tocar.
- C4: [x] 203 > 0, verdes, deterministas (reloj falso donde hay tiempo, eventos a mano).
- C5: [ ] pendiente de cierre de sesión (entrada en `history.md`).
- C6: [x] contrato v2.1 con @s1..@s19 y Then medibles · [x] sección en `project-spec.md` · [x] mapa
  @s→test fiel · [x] sin producción huérfana de test.
- C7: [ ] pendiente: re-mutación (Galeria.tsx + galeria-logica.ts, y re-confirmar el 100 % de
  site.ts/Contacto.tsx) DESPUÉS de esta aprobación, más la verificación EN VIVO listada en los
  diarios.

## 8) Cambios requeridos
Ninguno. Los cuatro del v1 están cerrados con tests que muerden (sabotajes acreditados y
verificados aquí contra el código), la Enmienda 1 está implementada con fidelidad de letra, y el
remate de Contacto mata exactamente los 8 supervivientes sin tocar producción. Quedan las puertas
que NO son de este review: mutación ≥ umbral y verificación en vivo, ambas ya encargadas.

## Pase delta v3 (micro-ciclo final)

**Fecha:** 2026-07-23 · **Alcance:** SOLO el delta de la Enmienda 2 + exclusiones de mutación.
Lo anterior queda juzgado en las secciones 1-8 de este archivo y NO se re-litiga aquí.

**Veredicto del delta:** APROBADO

### Punto 1 — draggable={false} en las seis <img>
- Producción: `Galeria.tsx:290` (`draggable={false}`), con la nota MEDIDA en `:282-283`.
- Test: `galeria.test.tsx:508-520` — recorre los 6 pares fichero/alt ESCRITOS A MANO
  (`:17-24`, anti-tautología) y asevera `getAttribute('draggable') === 'false'` por nombre
  accesible. React hornea `draggable` como atributo enumerado («false» en texto), así que el
  mutante BooleanLiteral false→true lo cambia a «true» y el test muerde (sabotaje 1 del
  TDD log: 1 rojo). Cubre la fila del contrato @s19 «las seis "<img" … draggable="false"». [x]

### Punto 2 — touch-action: pan-y en el marco, por bytes
- Producción: `galeria.module.scss:58` (`touch-action: pan-y;`), DENTRO de la regla `.marco`
  (`:53-59`), con el porqué del `pointercancel` en `:55-57`.
- Test: `galeria-estilos.test.ts:319-326` — `reglaBase('marco')` sobre los BYTES del SCSS,
  como exige la fila del contrato («se asevera leyendo sus BYTES»). [x]

### Punto 3 — rediseño de pasosDelArrastre (revisado con lupa adversarial)
- Código: `galeria-logica.ts:148-158`. La guarda del umbral (`Math.abs(Δ) < umbral`, `:149`)
  queda INTACTA — el «sin comparador» del contrato se refiere al comparador de DIRECCIÓN
  (el ternario `Δ < 0 ? 1 : -1` del superviviente 153:10), que desaparece: `:157` deriva
  la dirección con `signoDe(0 - Δ)`.
- **¿Conducta idéntica para |Δ| ≥ umbral (umbral > 0)?** SÍ, verificado por tabla:
  Δ negativo (izquierda) → `0 - Δ` positivo → **+1** (siguiente); Δ positivo (derecha) →
  **−1** (anterior). Frontera inclusiva intacta: (−48,48)→+1, (48,48)→−1, (±47,48)→0.
  Los 6 tests previos por valor (`galeria-logica.test.ts:264-284`) están SIN TOCAR y en
  verde: son exactamente las filas de dirección de @s19.
- **¿Tipo de retorno?** Sigue siendo `-1 | 0 | 1` (`:148`), garantizado por el retorno
  tipado de `signoDe` (`:56-58`). Sin casts nuevos.
- **Caso degenerado:** (0,0) → 0, test `galeria-logica.test.ts:287-291`. ÚNICA conducta que
  cambia respecto al original (que devolvía −1), y es EXACTAMENTE la que la Enmienda 2 del
  contrato ratifica («devuelve 0, no una dirección arbitraria»).
- **Nota de forma (no hallazgo):** el contrato ilustra con `-signoDe(Δ)`; el código usa
  `signoDe(0 - Δ)`. NO es desviación: `-signoDe(0)` devuelve `-0`, `toBe(0)` (Object.is) lo
  rechaza, y la forma binaria (`0 - 0` es `+0`) es la única que satisface el And normativo
  «devuelve 0». Documentado en `galeria-logica.ts:156` y en el TDD log («El -0 acecha»).
- Sabotaje 2 del TDD log (quitar la inversión → 10 rojos) acreditado y coherente: los tests
  de dirección muerden en lógica Y en DOM. [x]

### Punto 4 — las 2 exclusiones Stryker (y NO una tercera)
- `Galeria.tsx:90` (`useState(false)` de `arranqueExplicito`): la justificación (`:86-89`)
  cita `progress/mutation_galeria_carrusel.md` (86:62), razona la inobservabilidad POR
  CONSTRUCCIÓN (único lector `debeRotar`, `entra()` cancela en el mismo lote) y da el
  precedente `HOST_WHATSAPP` (`site.ts:72-73`). Coincide con el análisis del informe y con
  el aviso 9 de mi v1. [x]
- `Galeria.tsx:136` (deps `[]` del efecto de matchMedia): justificación (`:132-135`) cita el
  informe (124:6), la comparación Object.is de deps constantes y el precedente
  `Equipo.tsx:210`. El `next-line` cubre SOLO la línea del array (`:137`), no el bloque:
  la reestructuración prometida en el TDD log está hecha. [x]
- Recuento adversarial: `grep` sobre `src/` — en `Galeria.tsx` hay EXACTAMENTE 2 disables
  (líneas 90 y 136), en `galeria-logica.ts` CERO. Los demás (`site.ts:72`,
  `placeholders.ts:76`, `Equipo.tsx:210`) preceden a esta rama. NO hay tercera exclusión. [x]
- `stryker.config.json`: el diff AÑADE `Galeria.tsx` y `galeria-logica.ts` a `mutate`
  (los somete, no los esquiva); `break: 100` intacto; los `ignorePatterns` nuevos son de
  estabilidad del sandbox y citan su incidente medido. Ninguna exclusión encubierta. [x]

### Tests
`pnpm exec vitest run` dirigido a los 3 ficheros de galería: **3 files, 148/148 verdes**
(145 del v2 + los 3 del micro-ciclo, como declara el TDD log).

### Puertas que siguen abiertas (fuera de este pase, ya encargadas)
- Re-mutación de `galeria-logica.ts` y `Galeria.tsx` (con el rediseño y las 2 exclusiones
  debería dar 100 %) — `mutation_tester`.
- Verificación EN VIVO del gesto físico en Chrome (dedo real) — lead.
- C2 (dos features `in_progress`) sigue siendo del lead antes de cualquier `done`.
