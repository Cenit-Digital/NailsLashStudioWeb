# Brief de diseño — La caligrafía LENTA del hero (≈90 s) con el rótulo como control

> Síntesis del `craftsman_lead` tras el encargo de Pablo (2026-07-23, noche) y sus 2 decisiones por
> `AskUserQuestion`. Fuente de verdad para `gherkin_author` y `tdd_craftsman`.
> Rama: `feat/hero-caligrafia-lenta` (desde `origin/main` tras el merge previo, o encima de
> `feat/galeria-v3-resenas` si aún no está mergeada — lo decide el lead al abrir la rama).
> Base: el hero «trazo de pluma» CSS puro (contrato `features/hero.feature`, reescrito 2026-07-20).

## 1. Las decisiones de Pablo (cerradas)

1. **≈10 s por letra → ≈90 s de caligrafía total.** La queja: la animación actual (3,6 s el trazo,
   ≈4,5 s total) va «completamente esquizofrénica». Quiere ceremonia extrema; acepta que casi nadie
   la vea terminar.
2. **Sin ningún botón visible** («como está ahora, se hace una vez la animación y sin nada de
   botones de parar ni historias»). CONCILIACIÓN LEGAL (comunicada a Pablo): a >5 s el mecanismo de
   parar es obligatorio (SC 2.2.2, nivel A) — pero será SIN CROMO: **el propio rótulo es el
   control** (§3). Cero chips, cero ⏸.
3. **El lead debe VIVIR la experiencia como usuario** en Chrome real (petición expresa) y calibrar:
   muestreo de fotogramas a lo largo de los 90 s + inspección visual, además de las mediciones.

## 2. El mecanismo actual (leído del código — no re-derivar)

- CSS puro, UN reloj sobre UNA geometría: `.trazo` (línea central como máscara, `pathLength=100`)
  anima `stroke-dashoffset` 100→0 (`escribir` **3.6s** cubic-bezier(0.45,0,0.25,1) 0.1s both);
  `.aplicador` recorre el MISMO path (`offset-path: url(#trazo-marca)`, `recorrer` **3.6s** misma
  curva y delay) + `aparecer` 0.3s + `retirarse` 0.5s a los **3.2s**; «Studio» aparece con
  `revelarStudio` 0.6s a los **3.7s**. Total ≈4,3-4,5 s (contrato @s4: ≤4,5 s).
- BASE = estado FINAL visible (dashoffset 0, aplicador retirado): sin animaciones el rótulo se ve
  entero. El estado oculto vive SOLO en el keyframe de arranque. Esta propiedad es ORO para el
  salto (§3): completar = desactivar animaciones.
- `prefers-reduced-motion: reduce` → `animation: none` en todo: rótulo completo estático. Intacto.
- Invariantes de F-07 que NO se tocan: UN `<h1>`, dos `<span>`, text node de espacio real, nombre
  accesible «Nails Lash Studio», animación en la HOJA (no inline), `--ink`, cero terceros.

## 3. Diseño del cambio

### 3a. La duración — un solo token
- Variable CSS `--duracion-caligrafia: 90s` en la regla raíz del módulo del hero; TODAS las piezas
  derivan con `calc()`: `escribir`/`recorrer` = `var(--duracion-caligrafia)`; `retirarse` empieza en
  `calc(var(--duracion-caligrafia) - 0.4s + 0.1s)`; `revelarStudio` empieza en
  `calc(var(--duracion-caligrafia) + 0.2s)` (conserva la coreografía relativa actual: el aplicador
  se retira al acabar y «Studio» entra justo después). Total ≈90,8 s.
- **La curva pasa a `linear`** en `escribir` y `recorrer` (las DOS, siguen siendo UN reloj): a 90 s,
  el cubic-bezier actual haría reptar los extremos y acelerar el centro; una pluma real escribe a
  velocidad constante — y a velocidad constante las letras complejas tardan más solas (el «≈10 s
  por letra» es el promedio: 9 letras × 10 s ≈ 90 s de trazo).
- `aparecer` (0.3s) queda igual.

### 3b. El rótulo como control (SC 2.2.2 sin cromo)
- Un `<button>` TRANSPARENTE superpuesto al área del rótulo (posicionado absoluto DENTRO del
  contenedor del h1, SIN tocar la estructura protegida del `<h1>`): sin fondo, sin borde, sin
  texto visible; `cursor: pointer`; `aria-label` «Completar la firma» (o la redacción del
  gherkin_author); el anillo de foco GLOBAL del repo lo hace visible al tabular (SC 2.4.7 ya
  resuelto por `_base.scss`). Es un mecanismo de PARAR (una de las tres vías válidas de 2.2.2).
- Al activarlo (clic, Enter o Espacio — es un button nativo): la firma se COMPLETA al instante.
  Implementación: estado `completada` → clase que pone `animation: none` a `.trazo`/`.aplicador`/
  la de «Studio» (la BASE ya es el estado final: §2). Sin reflow, sin banderas raras.
- El control SOLO existe MIENTRAS la animación corre: se desmonta al completarla (por clic o
  porque el reloj llegó al final — un `setTimeout` de la duración total, con el patrón del repo
  para `ReturnType<typeof setTimeout>` y limpieza) y NO se monta bajo `prefers-reduced-motion`
  (nada que saltar; usar el patrón matchMedia guardado de `reserva`/`galeria`).
- La DECISIÓN de si el control debe existir (reduce? completada? corriendo?) va en función PURA
  (`hero-logica.ts` nuevo o donde el craftsman decida con el contrato) — `Hero.tsx` está en
  `mutate` con break 100: cada rama matable.

### 3c. Trampas conocidas (no re-descubrir)
- jsdom: sin `matchMedia` (stub), `setTimeout` tipado, sin renderizado real de animaciones CSS —
  las DURACIONES se aseveran por BYTES del SCSS (patrón galeria-estilos) y el comportamiento del
  botón por DOM; la experiencia real, EN VIVO.
- Stryker: sin estáticos de módulo no-activables (constantes consumidas en render/test, no en
  derivaciones de carga).
- El `<button>` superpuesto NO debe robar clics fuera del rótulo ni taparlo bajo reduced-motion
  (no se monta) ni tras completar (se desmonta). `pointer-events` y tamaño ceñidos al rótulo.

## 4. Verificación EN VIVO (la petición expresa de Pablo: vivirlo como usuario)

- Sonda nueva o sección nueva: (1) medir con `getAnimations()` que `escribir` dura 90 s y va
  `linear`, y que tinta y aplicador comparten reloj (currentTime igual); (2) MUESTREO VISUAL:
  capturas a t≈0/5/15/30/45/60/75/90 s (con `setCurrentTime` para no esperar 90 s de reloj real en
  cada corrida, MÁS una ventana corta en tiempo real para validar el ritmo percibido) y el lead las
  INSPECCIONA a ojo; (3) el clic en el rótulo completa la firma al instante y el control desaparece
  del árbol; (4) tab → el botón recibe foco visible y Enter completa; (5) reduced-motion: rótulo
  completo, SIN botón; (6) **LCP re-medido** (el precedente F-07: el LCP era un `<p>`, no el
  titular — verificar que sigue así con la animación larga); (7) cero terceros intacto.

## 5. Contrato y features

- `features/hero.feature`: @s4 (duración ≤4,5 s) se REESCRIBE al nuevo régimen (≈90 s ± lo que el
  contrato fije, curva linear, coreografía relativa conservada) + escenarios NUEVOS del control sin
  cromo (existencia solo-mientras-corre, ARIA, teclado, completar=estado final, reduced-motion sin
  control) + la nota de atribución: a >5 s el mecanismo es (N) SC 2.2.2 nivel A — la decisión de
  90 s es del CLIENTE con la conciliación documentada.
- `feature_list.json`: F-07 `hero_marca` NO se reabre (sus invariantes no se tocan — precedente de
  la reescritura demo del 2026-07-20); el cambio queda en el contrato demo del hero + history.md.

## Contrato

`features/hero.feature` ENMENDADO el 2026-07-23 — **14 escenarios totales** (9 previos + 5 nuevos).
- **@s4 REESCRITO**: token único `--duracion-caligrafia: 90s`; todo deriva por `calc()`;
  `escribir`/`recorrer` = el token con curva `linear` (las dos, UN reloj: misma duración/retardo/
  curva); `retirarse` en `calc(... - 0.4s + 0.1s)` y `revelarStudio` en `calc(... + 0.2s)`.
- **@s10–@s14 NUEVOS**: botón transparente FUERA del `<h1>` con nombre accesible «Completar la
  firma» (cursor pointer, foco por anillo global); activarlo completa al instante; se desmonta al
  acabar (clic o fin de reloj); NO se monta bajo reduced-motion; no roba clics fuera del rótulo.
- @s1–@s3 y @s5–@s9 intactos. Cabecera: aprobación de 4,5 s SUPERADA; SC 2.2.2 OBLIGATORIO (nivel
  A, prohibido citarlo como opcional); LCP re-verificado EN VIVO. Tests: BYTES del SCSS (tiempos/
  curvas/token) + DOM (control); el ritmo real de los 90 s se verifica EN VIVO (jsdom no anima).

### Enmienda 2 (2026-07-23) — avisos A-2/A-3/A-5 + ratificación de mutación → **17 escenarios**

- **@s15 (A-3)**: la caligrafía arranca SOLO al montar — el efecto añade la clase de «lista» y el
  SCSS condiciona a ella TODAS las animaciones; movimiento y mecanismo nacen JUNTOS. **@s7 ampliado**:
  el horneado no lleva la clase (sin JS, rótulo completo y estático). **@s13 ampliado**: bajo reduce, ni clase ni botón.
- **@s16 (A-2)**: al desmontarse el botón con el foco encima, el foco va al contenedor de la escena
  (tabindex -1), sin parada de tabulador nueva; el siguiente Tab sigue hacia los CTAs.
- **@s17 (A-5)**: preferencia EN CALIENTE (patrón galeria @s12) — reduce a mitad COMPLETA la firma y
  desmonta el botón; desactivarla no rearranca nada; escucha "change" con limpieza verificada.
- Mutación: exclusión in-situ del equivalente deps-[] RATIFICADA (`progress/mutation_hero_caligrafia_lenta.md`).

### Enmienda 3 (2026-07-24) — 90 s → 30 s, solo el VALOR

- Pablo vio los ≈90 s en su navegador y pidió probar 30; el lead lo vivió en Chrome real (banco de
  pruebas con el token pisado en caliente, sin tocar código) y el veredicto UI/UX coincide: a 90 s
  la pluma parece casi quieta; a 30 s (≈3,3 s/letra) siempre hay movimiento visible y sigue ceremonial.
- Token `--duracion-caligrafia: 30s`, espejo `SEGUNDOS_DE_TRAZO = 30`, total ≈30,8 s. Coreografía
  relativa, curva `linear`, reloj único y mecanismo SC 2.2.2 (sigue >5 s) INTACTOS. Contrato: @s4 y notas.

### Enmienda 4 (2026-07-24) — 30 s → 15 s, solo el VALOR (banco de vivencias, iteración 2)

- Decisión de Pablo; veredicto UI/UX del lead: a 15 s (≈1,7 s/letra) la pluma se ve escribir con claridad
  Y la mayoría de visitantes ve la firma completarse — el punto dulce. Token `15s`, espejo
  `SEGUNDOS_DE_TRAZO = 15`, total ≈15,8 s. Linear, reloj único y SC 2.2.2 (sigue >5 s) INTACTOS.
