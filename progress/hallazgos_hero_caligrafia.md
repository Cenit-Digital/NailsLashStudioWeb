# Hallazgos — rediseño del hero caligráfico (2026-07-20)

> Diagnóstico MEDIDO (no deducido) de las dos quejas de Pablo, más la investigación en
> documentación oficial que fija la arquitectura. Todo lo de aquí está verificado: o con una
> medición en Chrome sobre la página real, o con una cita a documentación oficial.

## 1. El recorte lateral — CAUSA ÚNICA, MEDIDA

`src/components/hero.module.scss:51` → `.heroMarca { clip-path: inset(0 0 0 0) }`.
`inset()` recorta **al border-box**. Los *swashes* de Great Vibes se salen de la caja de avance:

| medición | fuente | valor |
|---|---|---|
| caja de `.heroMarca` a 1440 px | `getBoundingClientRect` | 428,21 px |
| borde izq. de la tinta | `TextMetrics.actualBoundingBoxLeft` | **−4,00 px** (fuera) |
| borde der. de la tinta | `TextMetrics.actualBoundingBoxRight` | **439,28 px** (11,06 fuera) |
| desbordamiento en em (medido a 1000 px) | `measureText` | izq **0,0156 em** · der **0,0703 em** |
| desbordamiento según el fichero de fuente | opentype.js sobre el `.woff` | der **0,071 em** ✅ coincide |

La sesión anterior arregló el eje Y con `padding-top/bottom`; **nadie tocó el eje X**. El
`overflow: hidden` de `.demo-hero` (`_demo.scss:108`) es un segundo recortador latente, pero a los
anchos actuales no llega a morder (hero 940,8 px vs escena 428,2 px).

**Corolario**: el arreglo del recorte es dar caja horizontal, igual que se dio caja vertical.

## 2. La animación — POR QUÉ SE VE INCOHERENTE

Son **dos relojes sobre dos geometrías distintas**:

- La tinta se revela con `paintReveal`, un `clip-path: inset(0 100% 0 0) → inset(0 0 0 0)`: una
  **guillotina vertical** que barre de izquierda a derecha en 1,6 s.
- El pincel viaja por `TRAZO_MARCA` con `<animateMotion>` en 1,6 s.

Nada los ata. El pincel sube por la «N» mientras la tinta aparece como una columna recta.

Y hay un **segundo defecto, medido sobre el propio PNG** (`src/assets/brush.png`, 60×198,
decodificado canal alfa): la imagen es una **botella entera** — cerdas en `y 12–36`, varilla rosa en
`y 36–104`, frasco negro en `y 105–197`. El código ancla el punto del recorrido en
`y=-129` de `height=150` → **86 % de la imagen = dentro del frasco negro**. Lo que "pinta" las
letras hoy no es la punta: es el culo del bote.

## 3. Arquitectura elegida — y por qué (todo verificado EN VIVO en Chrome)

### Lo que se descartó, con la medición que lo descarta

- **Enmascarar el texto HTML con `mask-image: url(#id)`**: *funciona* (probado: el texto se revela
  siguiendo la curva y se re-evalúa al animar `stroke-dashoffset`), pero obliga a
  `maskContentUnits="objectBoundingBox"` para ser responsive, y ahí **el trazo se deforma con la
  relación de aspecto de la caja** (4,3 × 1,8 em): un trazo de 0,45 em de alto sale de **1,07 em de
  ancho** → revela una letra entera por delante y vuelve a parecer un barrido. **Descartado por
  medición, no por gusto.**
  Riesgo adicional confirmado en spec: si el navegador soporta `mask-image` pero **no resuelve**
  `url(#id)`, la spec obliga a tratarlo como *transparent black* → **elemento invisible**, no
  visible. <https://drafts.fxtf.org/css-masking-1/>
- **GSAP / Anime.js**: **ninguna de las dos resuelve el problema real.** Ni GSAP ni Anime.js generan
  la línea central de unas letras: exigen que tú les entregues el `<path>` ya hecho, porque las
  fuentes guardan **contornos**, no líneas centrales. Una vez tienes el path, CSS puro lo cubre
  entero. GSAP añadiría ~37 kB gzip **y licencia propietaria de Webflow** (no OSS) a un proyecto
  cuya regla nº 1 es cero terceros, a cambio de cero beneficio. **No se instala.**

### Lo que se hace

Todo dentro de **un `<svg>` con `viewBox`** — el único espacio de coordenadas **uniforme**, que es
justo lo que la vía HTML no podía dar:

1. `<mask>` con la línea central trazada gruesa + `stroke-dashoffset` animado por CSS → la tinta
   aparece **siguiendo el trazo**. Verificado en vivo: la máscara honra el `stroke` (a diferencia de
   `<clipPath>`, que por spec usa *"raw geometry … exclusive of … stroke"*).
2. El aplicador es un `<image>` movido por **CSS `offset-path`** sobre **el mismo path**.
   Verificado en vivo: opera en **unidades del viewBox** (desviación medida 0,1 u) → escala con el
   titular responsive.
3. **Sincronía exacta por construcción**: `pathLength="100"` + `stroke-dasharray="100"` +
   `stroke-dashoffset: 100→0` (unidades de usuario) contra `offset-distance: 0%→100%`. Ambas son
   lineales en **longitud de arco** y comparten *document timeline* con idénticos
   duration/delay/easing. ⚠️ Trampa evitada: los **porcentajes** en `stroke-dasharray` NO usan esa
   métrica (se resuelven contra la diagonal del viewport) — por eso van en unidades absolutas.
4. **El recorte deja de existir por construcción**: el `viewBox` se calcula del bbox real de la
   tinta (−15,6 → 3965,3 en ‰ de em) con margen.

### Grosor de la máscara — medido, no elegido a ojo

Transformada de distancia sobre el rasterizado real de «Nails Lash»: grosor de plumada
**mediana 24 ‰ de em, p90 51 ‰, máximo 75 ‰**. Una máscara de ~120 ‰ cubre la letra entera con
holgura y sigue siendo **~3× más estrecha que una letra** (≈350 ‰) → revela trazo, no barrido.

## 4. Puntos abiertos que decide la implementación

- **El `<h1>`**: la WAI recomienda dejar el texto real en el DOM con `visually-hidden`
  (clip/1px) y `aria-hidden="true"` en el SVG decorativo. **NO** `color: transparent` (sigue en el
  árbol de accesibilidad pero se excluye del LCP) ni `visibility: hidden` (borra el nombre
  accesible).
- **LCP**: un `<svg>` inline **no es candidato a LCP** (sí lo son `<img src=…svg>` y un `<image>`
  dentro del SVG) — <https://web.dev/articles/lcp>. Sustituir el titular por SVG inline mueve el
  candidato LCP a otro elemento de la página; conviene medirlo.
- **Duración 4,5 s**: pedida explícitamente por Pablo. **No** infringe WCAG 2.2.2 (exige *más de*
  cinco segundos) ni 2.3.3 (es AAA y solo cubre animación disparada por interacción). Obliga a
  subir el tope de `@s4`, hoy en 2,5 s → hay que reescribir el contrato, no saltárselo.
- **El aplicador**: hay que recortarlo a cerdas+varilla y voltearlo para que la punta mire hacia
  abajo y sea la punta —no el frasco— la que va sobre el recorrido.

## 5. Estado de la derivación de la línea central (EN CURSO)

La línea central se está derivando **de los glifos reales**, no a mano. Rig montado en Chrome sobre
`http://localhost:5199` (`window.__banco`). Lo conseguido:

1. Rasterizado de «Nails Lash» a 250 px/em + transformada de distancia (chamfer 3-4). ✅
2. Adelgazado **Zhang-Suen** → esqueleto conexo de 1 px. ✅
3. **Las componentes conexas SON las plumadas reales**: `N` (x 24→1156) · `ails` (1084→2108) ·
   punto de la `i` (1568→1576) · `L` (2224→3116) · `ash` (2984→3956). **5 levantamientos de pluma,
   salidos solos de la geometría.** ✅
4. Poda de barbas por número de cruce (umbral 45 ‰): **4078 px, 18 extremos, 28 nudos.** ✅
5. **Trazado de arcos — RESUELTO.** Historial, porque el callejón sin salida es informativo:
   - vecindad laxa sin corte → 106 arcos, 100 % cobertura, pero subtrazos de 5002/15092 px (se
     enrosca en los bucles; saltaba el guardián de 5000 iteraciones).
   - vecindad estricta (`!adj(k,ant)`) → arcos limpios pero **cobertura 24,4 %**: la condición
     rompe cadenas legítimas de un esqueleto de 1 px. **Callejón sin salida.**
   - ✅ **La buena**: vecindad **laxa** + corte por `dentro.has(act)` (visitados propios del arco).
     → **92 arcos**, longitud media 75 px, máxima 427.
   - ✅ **Ciclos puros** (el lazo de la «N», el de la «l», la floritura de la «L») no tienen ningún
     nudo del que partir, así que quedaban fuera: se siembran aparte desde cualquier píxel no
     cubierto. **+40 ciclos → 132 arcos, cobertura 96,7 %** (3942/4078 px; el 3,3 % restante son
     fragmentos sueltos irrelevantes).
6. ⏳ **SIGUIENTE**: recorrido euleriano por continuación más recta sobre los 132 arcos, agrupado
   por las 5 plumadas → remuestreo → suavizado → ajuste a Béziers → emitir `d` con
   `pathLength="100"`.
6. Puertas de calidad previstas (objetivas, automatizables): % de puntos muestreados del trazo que
   caen DENTRO de la tinta, y % de tinta cubierta por la máscara en t=1.

**Nada de esto se ha llevado todavía a `src/`.** El árbol de trabajo sigue limpio.
