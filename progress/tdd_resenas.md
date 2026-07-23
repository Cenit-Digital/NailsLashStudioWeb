# TDD — Feature 14 `resenas_agregado_enlace` (sección Reseñas)

> `tdd_craftsman`, 2026-07-23, rama `feat/galeria-v3-resenas`. Contrato:
> `features/resenas_agregado_enlace.feature` (@s1..@s9). Brief: `progress/galeria_v3_resenas_diseno.md`
> (§2 raíles legales, §5 arquitectura, §7 trampas). Herencia POR REFERENCIA del contrato
> `features/galeria_carrusel.feature` v3 (@s8 de este contrato), leyendo «foto» como «testimonio».

## Resultado

**142 tests NUEVOS en verde** (91 `resenas.test.tsx` + 11 `resenas-logica.test.ts` + 31
`resenas-estilos.test.ts` + 2 `resenas-agregado.test.ts` + 7 `resenas-demo.test.ts`), más
**4 tests añadidos a `home-horneado.test.ts`** (@s6, build-based: NO corridos aquí — ver Decisión 6).
Corrida dirigida final: **310 passed** en 10 ficheros (los 5 nuevos + `home.test.tsx`,
`boton-whatsapp-montaje.test.tsx`, `galeria.test.tsx`, `carrusel-logica.test.ts`,
`galeria-logica.test.ts` — cero regresión en los vecinos que renderizan la home).
`pnpm typecheck` → 0 · `pnpm lint` → 0 · prettier limpio.

### Ficheros nuevos (producción)

- `src/lib/resenas-agregado.ts` — el dato agregado LITERAL y fechado (4.9 · 1239 · Treatwell ·
  url · 2026-07-23). Sin derivaciones en la carga (trampa de estáticos, brief §7). ENTRA en mutate.
- `src/components/resenas-logica.ts` — puro: `estrellasDe`, `notaEnTexto`, `totalConMillar`,
  `fechaVisible`, `etiquetaDelPuntoDeTestimonio`. ENTRA en mutate.
- `src/lib/demo/resenas-demo.ts` — 6 testimonios PROPIOS de ejemplo + `LEYENDA_RESENAS`
  (patrón LEYENDA_EQUIPO). DATO demo: FUERA de mutate (precedente equipo-demo).
- `src/components/Resenas.tsx` — el carrusel coverflow (espejo estructural de Galeria.tsx,
  aritmética IMPORTADA de galeria-logica/carrusel-logica, cero duplicación). ENTRA en mutate.
- `src/components/resenas.module.scss` — el domo ∩ con tarjeta apaisada (8/5) de texto.

### Ficheros tocados

- `src/pages/home.tsx` — ÚNICO cambio: `<Resenas />` ENTRE `<Equipo />` y `<Reserva />` (@s1).
- `src/pages/home-horneado.test.ts` — AMPLIADO con el describe @s6 (sin crear un cuarto build-based).

## Ciclos Rojo → Verde → Refactor (con sabotajes por bloque)

1. **@s3** — `resenas-agregado.test.ts` ROJO (import inexistente) → módulo literal VERDE (2 tests).
2. **@s7 + formato @s2/@s8** — `resenas-logica.test.ts` ROJO → VERDE (11 tests). **Gotcha MEDIDO**:
   `toLocaleString('es-ES')` deja «1239» SIN punto de millar (CLDR es-ES declara
   `minimumGroupingDigits: 2`); el contrato exige «1.239» → `totalConMillar` agrupa A MANO
   (bucle puro, mordible por valor; tests 1239→«1.239» y 226→«226»).
3. **@s4/@s5 módulo demo** — `resenas-demo.test.ts` ROJO → VERDE (7 tests): 6 testimonios,
   forma contratada, ≥1 nota 4 (anti-vacuidad), disyunción de textos Y nombres de pila con el
   reviewPool (reunido desde las rotaciones de EQUIPO_DEMO, con ancla size=10 anti-vacuidad),
   leyenda byte a byte.
4. **@s1 cascarón + home** — ROJO (componente inexistente) → VERDE (7 tests).
   **Sabotaje**: `<Resenas />` movida detrás de `<Reserva />` → 2 rojos ✓ (restaurado).
5. **@s2 + @s3 componente** — ROJO (6) → VERDE: línea del agregado derivada del módulo en render.
   El test de bytes anti-segunda-copia cazó mis PROPIOS comentarios con «Treatwell» → reformulados
   (la prohibición es byte a byte y así se queda).
6. **@s5 leyenda** — ROJO (2) → VERDE: `LEYENDA_RESENAS` pintada desde el módulo demo.
7. **@s8 bloque A (árbol APG + tarjetas)** + @s4 HTML + @s7 DOM + @s9 sin-img — ROJO (14) → VERDE.
   **Sabotaje**: `distanciaCircular` → `indice - activo` → 6 rojos ✓.
8. **@s8 bloque B (flechas, puntos, clic lateral, arrastre)** — ROJO (14) → VERDE.
   **Sabotaje**: resta del arrastre invertida → 4 rojos ✓.
9. **@s8 bloque C (autoplay 2 s, chip, pausas ratón/foco, reduced-motion en caliente, reinicio
   del reloj, aria-live)** — ROJO (24) → VERDE. **Sabotaje**: `foco: false` en `debeRotar` →
   1 rojo (el de la asimetría foco-no-reanuda) ✓.
10. **@s8 bloque D (teclado global guardado + mandos DOM)** — ROJO (7) → VERDE.
    **Sabotaje**: `preventDefault` incondicional → 5 rojos ✓ (la línea roja heredada muerde).
11. **@s8 bloque E (convivencia DOS carruseles) + @s6 proxy** — VERDE a la primera (conducta
    emergente de lo ya construido) ⇒ **sabotaje obligado**: `ID_PISTA = 'galeria-pista'`
    (id compartido) → 11 rojos ✓.
12. **@s6 real** — describe añadido a `home-horneado.test.ts` (ancla positiva BeautySalon +
    openingHoursSpecification, sin `aggregateRating` ni `review` en claves, literal ausente del
    HTML entero, y el ancla de F-14: agregado visible horneado). NO corrido aquí (Decisión 6).
13. **@s9 estilos** — `resenas-estilos.test.ts` ROJO (27) → SCSS completo VERDE (31).
    Los regex de bytes cazaron un comentario mío con «transform: none» → reformulado.
    **Sabotaje**: `aspect-ratio: 4 / 3` → 1 rojo (la proporción propia muerde) ✓.
14. **REFACTOR final** — prettier sobre 2 tests (cosmético), typecheck/lint 0, re-corrida verde.

## Decisiones (para judge y mutation_tester)

1. **`resenas-logica.ts` separado del dato** (opción del encargo): @s3 exige que
   `resenas-agregado.ts` exporte «el objeto LITERAL y nada más» (test: único export runtime), así
   que el formateo vive en `src/components/resenas-logica.ts`, llamado en render — 100 % mutable.
2. **`totalConMillar` a mano** (no `toLocaleString`): gotcha CLDR medido (ciclo 2). Comentado en
   el propio módulo.
3. **Los textos demo** los redacté de cero (no son contrato): autoras Carmen/Silvia/Rocío/Teresa/
   Irene/Mónica — disjuntas de las 10 del reviewPool Y de los 7 nombres del equipo; notas 5,5,4,5,5,4;
   servicios reales (Uñas ×2, Pestañas, Cejas, Nail art, Pedicura).
4. **Colores de la tarjeta**: lámina sobre `--surface2` con `--text` (cita), `--ink` (autora) y
   `--accent-dark` (servicio/estrellas) — los TRES pares figuran en `MATRIZ_DE_USO` de
   `puerta-contraste.ts` (filas surface2). OJO: el brief §9 decía «--ink/--muted sobre --surface»,
   pero `--ink/--surface` NO está en la matriz — por eso elegí `--surface2`, cuyos pares SÍ están.
   Agregado y leyenda: `--muted` sobre el fondo (par auditado). Ni un color nuevo.
5. **Proporción propia**: `aspect-ratio: 8 / 5` (1,6 — apaisada, ≠ 4/3), `width: min(420px, 86vw)`
   escritorio / `80vw` móvil. Domo con separaciones algo menores que la galería (la tarjeta ancha
   ocupa más): 0/66/118/140 % · giros 0/-30/-44/-48deg (saturantes <90) · opacidades 1/.62/.28/0.
   **Pendiente de comprobación EN VIVO por el lead** (el contrato lo remite a ello).
6. **@s6 sin correr el build**: regla dura del encargo (nada de build/suite completa). El describe
   @s6 amplía el build-based EXISTENTE siguiendo su patrón exacto (`jsonLdHorneado()`, anclas
   positivas); su primera ejecución REAL será la del lead. Proxy runnable en `resenas.test.tsx`
   (@s6: la sección no emite `<script>`, ni `ld+json`, ni el literal `aggregateRating`).
7. **Teclado**: cableado ESPEJO del de Galeria.tsx — decisión compartida por IMPORT
   (`pasoDeTecla`, `quienAtiendeElTeclado`, `esCampoDeEscritura`, `NADIE`,
   `PROPORCION_VISIBLE_MINIMA`): «la decisión es UNA y compartida, no dos copias» (@s8). Cada
   carrusel aporta su candidata única; la geometría (separados por #reserva) impide el
   doble-visible, como fija @s22 del contrato padre.
8. **Dos exclusiones Stryker PREANUNCIADAS** en `Resenas.tsx`, por la MISMA construcción ya
   verificada en `progress/mutation_galeria_carrusel.md` sobre Galeria.tsx (86:62 y 124:6):
   `useState(false)` de `arranqueExplicito` (BooleanLiteral equivalente por construcción —
   `entra()` cancela en el mismo lote) y las deps `[]` de los DOS efectos solo-montaje
   (ArrayDeclaration sobre deps constantes). **El mutation_tester debe re-verificarlas** — si
   discrepa, se retiran y se litiga con mutantes vivos.
9. **`MILISEGUNDOS_POR_FOTO` importado**, y test de bytes: `Resenas.tsx` no contiene `2000`
   (ni «Treatwell», «4,9», «1239», «2026» — anti-segunda-copia de @s3).

## Trazabilidad (@s → tests)

- **@s1** → `resenas.test.tsx` describe «@s1 la sección vive ENTRE el equipo y la reserva» (7 tests:
  orden de h2 en la home SSR, separación de los dos carruseles por la reserva, raíz `<div>` +
  demo-seccion, un solo h2 sin h1, sin nav/anclas, bytes de home.tsx dentro de `<main>` entre
  Equipo y Reserva, conjunto de la nav intacto) + «el ÚNICO `<a>` es el enlace EXTERNO».
- **@s2** → `resenas.test.tsx` describe «@s2 el agregado es UNA LÍNEA» (4 tests: nota/total/
  plataforma en una línea, href exacto + target/rel/no-#, fecha visible, «4,9 de 5» + estrellas
  aria-hidden) + `resenas-logica.test.ts` (millar, fecha, coma).
- **@s3** → `resenas-agregado.test.ts` (objeto de 5 campos A MANO; único export runtime, sin
  derivaciones en carga) + `resenas.test.tsx` describe «@s3 el componente LEE el módulo» (horneado
  con los 5 valores; bytes del JSX sin segunda copia).
- **@s4** → `resenas-demo.test.ts` (6 exactos, forma, ≥1 nota 4, disyunción textos y nombres con
  ancla) + `resenas.test.tsx` «@s4 @s9 las tarjetas llevan TEXTO propio» (los 6 textos A MANO en
  el HTML, 6 diapositivas exactas, calas negativas del reviewPool).
- **@s5** → `resenas-demo.test.ts` (export byte a byte) + `resenas.test.tsx` describe «@s5»
  (horneado carácter a carácter; visible en el flujo, sin aria-hidden/hidden).
- **@s6** → `home-horneado.test.ts` describe «@s6 (F-14)» (4 tests build-based: ancla positiva,
  claves ausentes, literal ausente, agregado horneado) + `resenas.test.tsx` describe «@s6» (proxy:
  sin script/ld+json/aggregateRating en la sección).
- **@s7** → `resenas-logica.test.ts` (tabla de 4 ejemplos de `estrellasDe` A MANO; «4,9 de 5» /
  «4 de 5» / «5 de 5») + `resenas.test.tsx` (aria-hidden + texto en agregado y en cada tarjeta,
  esperados por tarjeta A MANO).
- **@s8** → `resenas.test.tsx`, bloques espejo del contrato padre: tabla data-distancia/--s +
  z-index (@s3..@s5), árbol APG con ids/etiquetas propios (@s6), aria-live (@s7), chip primero /
  sin aria-pressed / parada definitiva / 9 controles / glifos (@s8), cadencia 1999/2000/12000 +
  bytes de la constante compartida (@s9), pausas ratón/foco (@s10), Iniciar no pegajoso (@s11),
  reduced-motion frío y en caliente + limpieza (@s12), flechas por los dos extremos (@s16), puntos
  «Ver el testimonio N de 6» + aria-disabled + data-actual (@s17), clic lateral (@s18), arrastre
  umbral 48 inclusivo + click sintetizado (@s19), reinicio del reloj ×4 caminos (@s20), teclado:
  foco dentro / blur / sin IO / stub IO 0.8-0.4 / ctrl / campo de texto / reinicio / limpieza
  (@s21..@s23), mandos hijos directos y orden del DOM (@s24), convivencia (2×Anterior/Siguiente/
  rotación, singulares por ámbito, ids disjuntos, puntos con su idioma) + `resenas-logica.test.ts`
  (`etiquetaDelPuntoDeTestimonio`).
- **@s9** → `resenas-estilos.test.ts` (31 tests de bytes: reglas 3D heredadas @s13/@s14/@s15,
  proporción propia 8/5 ≠ 4/3, central opacidad 1 + pares AA con tokens auditados, apagado en la
  lámina, touch-action, 640 único breakpoint, mandos de cristal @s24, puntos @s17) +
  `resenas.test.tsx` (sin `<img>`).

## Para el lead (pendiente, fuera de mi alcance)

- Añadir `src/components/Resenas.tsx`, `src/components/resenas-logica.ts` y
  `src/lib/resenas-agregado.ts` a `stryker.config.json` → mutate (yo tengo vetado tocarlo).
- Correr `bin/harness init` / suite completa (incluye `home-horneado.test.ts` con el @s6 nuevo,
  que lanza el build real) → judge → mutación → verificación EN VIVO (domo, cristal sobre la
  tarjeta apaisada, teclado por visibilidad real, gesto táctil físico).
- NO marcado `done`: esperan judge + mutación (regla dura).

## Remate del lote

> `tdd_craftsman`, 2026-07-23 (3er ciclo del lote). Insumos: `progress/judge_lote_v3_resenas.md`
> (hallazgo 1 BLOQUEANTE + «Cambios requeridos», y de paso los hallazgos 2 y 3),
> `progress/a11y_lote_v3_resenas.md` (2 🟡 + guardia del enlace) y
> `progress/mutation_lote_v3_resenas.md` (5 matables + 2 equivalentes ratificados por el lead).
> Contratos SIN cambios: galería v3 @s21..@s23 y reseñas @s8.

### Resultado

**23 tests NUEVOS en verde** (16 `carrusel-logica.test.ts` + 6 `resenas.test.tsx` +
1 `resenas-estilos.test.ts`; `galeria-estilos.test.ts` gana una aserción dentro de un test
existente). Corrida dirigida final: **358 verdes** en 9 ficheros (los 7 del lote +
`home.test.tsx` + `boton-whatsapp-montaje.test.tsx`) + 51 en vecinos (demo/agregado/carrusel).
`tsc --noEmit` 0 · `eslint .` 0 · prettier limpio.

**Mutación (con las DOS exclusiones ratificadas): 100 % en los tres objetivos.**

| Fichero | Score | Detalle |
|---|---|---|
| `src/components/carrusel-logica.ts` | **100.00 %** | 80/80 killed |
| `src/components/Resenas.tsx` | **100.00 %** | 113/113 killed |
| `src/components/Galeria.tsx` | **100.00 %** | 123/123 killed |

### Bloque A — el coordinador del teclado (diseño elegido y por qué)

- **Registro de MÓDULO en `carrusel-logica.ts`** (`Map<string, SeccionCandidata>`) con funciones
  de consulta testables POR VALOR: `registrarCandidata` / `retirarCandidata` / `medirCandidata`
  (proporción + distancia MEDIDAS de la entrada real del IO) / `enfocarCandidata` /
  `atiendeLaCandidata` / `candidatasRegistradas`. Nada se deriva en la carga del módulo (trampa
  de estáticos, `tdd_deuda_mutacion_full.md`): el `new Map()` no fabrica mutantes.
- **`SeccionCandidata` gana `focoDentro`** y `quienAtiendeElTeclado` se EXTIENDE (no se duplica):
  el foco dentro ASIGNA (findIndex primero) y EXCLUYE al resto; sin foco, umbral 0.6 inclusivo
  con desempate por cercanía — las 6 filas de @s22 intactas.
- **Dos listeners donde SOLO el árbitro actúa** (la opción B del encargo): cada componente
  conserva su listener de documento y pregunta `atiendeLaCandidata(suId)` — elegida porque
  preserva ENTERO el contrato de limpieza ya testeado (@s23: UN registro y UNA baja por
  componente, por identidad de manejador) y deja el arbitraje 100 % en el módulo puro, donde
  Stryker muerde por valor. El Then singular de @s22 lo garantiza el registro compartido: una
  tecla, UN carrusel.
- **`distanciaAlCentroDe(caja, marco)`**: centro de `boundingClientRect` contra centro de
  `rootBounds` con `Math.abs`; `marco null` (solo iframes de otro origen, según spec) → 0
  documentado y testeado. Los ids estables `CANDIDATA_GALERIA`/`CANDIDATA_RESENAS` viven
  EXPORTADOS en el módulo (un literal en cada componente sería un StringLiteral equivalente
  inmatable: autoconsistente bajo renombrado).
- **Cableado**: alta en el efecto de teclado, medida en el callback del IO (nada de ceros
  fijos), foco por `enfocarCandidata(id, true/false)` en onFocus/onBlur, baja en la limpieza.
  De paso: hallazgo 2 (comentario incumplido, reescrito por la realidad) y hallazgo 3
  (`const activo` → `enfocado` en `Galeria.tsx`, igualado a Resenas).
- **Refactor anti-mutante en verde**: la primera corrida de mutación dejó UN superviviente
  (`elegida !== NADIE && …` → `true && …`, equivalente porque `ids[-1]` ya es `undefined`).
  Cura por CONSTRUCCIÓN, no por exclusión: se elimina el comparador redundante
  (`return ids[quienAtiendeElTeclado(…)] === id`, patrón `pasosDelArrastre`) → 80/80.

### Bloques B y C

- **B (a11y)**: cristal 78 % → **85 %** en `galeria.module.scss:45` y `resenas.module.scss:52`
  (rojo por bytes primero: 3 tests), con la aserción EXACTA
  `color-mix(in srgb, var(--surface) 85%, transparent)` en ambos ficheros de estilos; enlace del
  agregado con `text-decoration: underline` explícito + test de bytes (SC 1.4.1).
- **C (mutación)**: los 2 tests matadores de la receta literal del informe —
  la línea del agregado ENTERA con `toBe`
  (`'★★★★★ 4,9 de 5 · 1.239 opiniones en Treatwell · dato del 23/07/2026'`, mata los 4 `{' '}`)
  y la valoración COMPLETA de dos tarjetas conocidas, una por rama del redondeo
  (`'★★★★★ 5 de 5'` de Carmen y `'★★★★☆ 4 de 5'` de Rocío, mata el 5º). Las DOS exclusiones
  RATIFICADAS (`Galeria.tsx` 257:9 y su espejo en `Resenas.tsx`): `Stryker disable next-line all`
  sobre la guarda del IO con motivo y referencia al informe — SOLO esas dos líneas nuevas.

### Mapa punto → test

- Arbitraje puro multi-candidata (6 filas @s22 + foco-excluye + casos (a)/(b) del judge) →
  `carrusel-logica.test.ts` describes «@s22 con DOS carruseles…», «@s22 @s23 el foco dentro
  ASIGNA…» y «@s22 @s8 el registro COMPARTIDO…» (16 tests, esperados A MANO).
- Cableado con stub del IO y entradas con `boundingClientRect`/`rootBounds` → `galeria.test.tsx`
  y `resenas.test.tsx` (stubs actualizados: rects reales, distancia 120 no-cero) + describe NUEVO
  «@s8 la desambiguación del teclado entre los DOS carruseles»: (a) ambos ≥0.6 ⇒ mueve SOLO el
  más cercano con UN preventDefault (espiado, `toHaveBeenCalledTimes(1)`); (b) foco en galería +
  reseñas ≥0.6 ⇒ SOLO la galería; (c) el no atendido NO reinicia su reloj (su tick original en
  t=2000; el atendido en t=3500).
- Limpieza → «registro vacío al desmontar ambos» (2 → 0, a mano) + los tests de baja por
  identidad ya existentes en ambos componentes.
- Cristal 85 % → aserción exacta en `galeria-estilos.test.ts` (@s24) y `resenas-estilos.test.ts`
  (@s9). Subrayado → describe «@s2 el enlace a Treatwell se distingue por algo MÁS que el color».
- Línea del agregado completa → `resenas.test.tsx` «@s2 la línea COMPLETA, carácter a carácter»;
  valoración por tarjeta → «@s7 la línea de valoración COMPLETA de tarjetas CONOCIDAS».

### Sabotajes (aplicar → rojo → revertir, SIEMPRE desde copia del árbol, jamás `git checkout`)

1. **Bloque A** — el bug EXACTO del judge reintroducido: distancia fija `0` en el callback del IO
   de `Galeria.tsx` → 1 rojo, precisamente el test (a) del desempate por cercanía. ✓
2. **Bloque C** — los mutantes `{' '} → {''}` aplicados A MANO (el del «·» del agregado y el de
   las estrellas de tarjeta) → 2 rojos, exactamente los dos matadores nuevos. ✓
   (Los tests de B nacieron ROJOS por bytes — 3 rojos medidos — y no necesitaron sabotaje.)

### Estado

Pendiente del lead: re-judge del delta + verificación EN VIVO (teclado por visibilidad real,
cristal al 85 % sobre foto). Sigo SIN marcar `done`: regla dura.
