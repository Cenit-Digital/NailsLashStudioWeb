# Brief de diseño — Galería v3 (2 s · teclado · flechas de cristal) + sección Reseñas (F-14 re-encuadrada)

> Síntesis del `craftsman_lead` tras la conversación con Pablo del 2026-07-23 (4 decisiones por
> `AskUserQuestion` + 3 matices del encargo). Fuente de verdad para `gherkin_author` y
> `tdd_craftsman`. Rama: `feat/galeria-v3-resenas` (desde `origin/main` = 8e23c61, PR #6 mergeado).
> Base: la galería coverflow 3D cerrada ayer (feature 22, contrato v2.2, mutación repo 100 %).

## 1. Las decisiones de Pablo (cerradas, no reabrír)

1. **Cadencia de la galería: 2 s** (era 4 s). La vuelta del final al principio, al MISMO ritmo y sin
   frenazo en la costura (ya garantizado: intervalo fijo + `transition: none` en la oculta).
2. **La pausa al mirar SE QUEDA** (hover pausa, sale y reanuda; foco pausa y no reanuda; botón ⏸
   manda sobre todo — SC 2.2.2 intacto). El «que no se pare bajo ningún concepto» se refiere a la
   COSTURA del bucle, no al mecanismo de pausa (confirmado por pregunta explícita).
3. **Teclado**: flechas ← → pasan de foto «cuando el usuario está situado en la web» — ver §3.
4. **Flechas integradas: círculos de cristal flotantes** sobre los laterales del escenario, a media
   altura (mockup elegido). El botón ⏸ también se integra como chip de cristal (esquina superior
   derecha del escenario), PRIMERO en el DOM/tab-order (APG). Los puntos siguen debajo.
5. **Reseñas**: sección nueva ENTRE `<Equipo />` y `<Reserva />` (debajo de «Nuestro equipo de
   profesionales»). **Agregado real de Treatwell DISCRETO** (sin cabecera-aviso: una línea fina) +
   **carrusel coverflow de testimonios PROPIOS de ejemplo** con leyenda visible. Mismo ritmo de
   2 s y TODA la conducta de la galería (pausa, teclado, arrastre, flechas cristal, puntos,
   reduced-motion, a11y).

## 2. Raíles legales de la sección Reseñas (NO negociables — investigación [V] del repo)

`docs/research/legal-treatwell.md` + feature 14 (`resenas_agregado_enlace`):

- ❌ **NI UN texto de reseña de Treatwell** (cl. 4.2/9.1: el salón «no tiene ningún derecho sobre
  las reseñas»; PI art. 17 TRLPI; RGPD por los nombres). Los testimonios del carrusel son PROPIOS
  y de EJEMPLO, con leyenda visible (patrón `LEYENDA_EQUIPO`), sustituibles por reseñas reales de
  clientas captadas con consentimiento EN EL SALÓN.
- ✅ **La nota agregada SÍ**, siempre con: plataforma declarada + enlace a la fuente + fecha del
  dato. Línea discreta (no banner): `★ 4,9 · 1.239 opiniones en Treatwell` enlazada, con el sello
  de fecha del dato. **Medido en vivo el 2026-07-23**: 4,9 · 1.239 en
  `https://www.treatwell.es/establecimiento/nails-lash-studio/`.
- ✅ **Art. 20.4 TRLGDCU**: el aviso sobre el origen va integrado en la nota de honestidad de la
  sección (leyenda de ejemplo + «la nota agregada procede de Treatwell», enlazada) — sin banner.
- ❌ **Sin `aggregateRating` en el JSON-LD** (guidelines de Google: reseñas de terceros no marcables
  como propias; acceptance de F-14). La puerta del cascarón no se toca.
- **El dato agregado NO se hardcodea en el componente**: objeto tipado y FECHADO
  (`src/lib/resenas-agregado.ts`: `{ nota, total, plataforma, url, fechaDelDato }`), validado por
  tests por valor. Si el dato caduca, se actualiza el módulo de datos, no el componente.

## 3. El teclado global (matiz 2) — diseño técnico

- **Cuándo atiende**: cada carrusel atiende ← → cuando su sección está SUFICIENTEMENTE VISIBLE
  (IntersectionObserver, umbral 0,6) — «el usuario situado» = la sección en pantalla. Además,
  siempre que el foco esté DENTRO del carrusel (bubbling normal, sin IO).
- **Guardas** (todas puras, testables por valor): no atender si el elemento activo es
  input/textarea/select/contenteditable (el chat de Reserva usa un input), ni con
  Ctrl/Alt/Meta pulsados. `preventDefault()` solo cuando SE ATIENDE (no secuestrar el scroll).
- **Desambiguación entre los DOS carruseles**: umbral 0,6 de visibilidad propio; geometría real
  (secciones altas y separadas por Reserva) hace prácticamente imposible que ambos lo superen a la
  vez; si ocurriera (pantalla altísima), gana el más cercano al centro del viewport — decisión en
  función PURA compartida.
- **jsdom 25 NO implementa IntersectionObserver** (como matchMedia): cableado GUARDADO
  (`typeof IntersectionObserver`), decisión en lógica pura, comportamiento verificado EN VIVO.
- **Reinicio del reloj**: cualquier desplazamiento manual (flecha, tecla, punto, arrastre, clic en
  lateral) REINICIA el intervalo — a 2 s, mover y que 0,3 s después salte sola es un manotazo.
  Implementación: generación de reloj (estado) que entra en las deps del efecto del intervalo.

## 4. Flechas y pausa de cristal (matiz 3) — diseño visual

- Círculos de **44×44 px** (SC 2.5.8) absolutos sobre `.marco`: ← a la izquierda, → a la derecha,
  centrados verticalmente; ⏸/▶ arriba a la derecha. `background:
  color-mix(in srgb, var(--surface) 78%, transparent)` + `backdrop-filter: blur(8px)` + borde
  `var(--border-interactive)` + glifo `var(--accent-dark)`. Hover: borde `--accent-dark` y
  elevación sutil. El auditor a11y debe verificar 1.4.11 en el PEOR caso (glifo/borde sobre foto
  clara a través del cristal — el 78 % de `--surface` da base sólida).
- Se ELIMINA la fila `.mandos` externa (las flechas «feas»). El DOM queda: ⏸ primero, ← →, luego
  escenario, luego puntos (tab-order APG intacto). `aria-controls` se mantiene.
- z-index de los mandos > capa máxima de tarjetas (> 6). `pointer-events` correctos sobre la
  oculta (ya `none`).
- Móvil (≤640 px): siempre visibles (no hay hover), mismo tamaño táctil.

## 5. Reseñas — arquitectura

- **`src/components/Resenas.tsx`** (cablea) + **`resenas.module.scss`** (mide) +
  **`src/lib/demo/resenas-demo.ts`** (6 testimonios de EJEMPLO: autora nombre de pila + texto
  1-2 frases + nota 4-5 + servicio; NADA que se presente como real; leyenda obligatoria visible)
  + **`src/lib/resenas-agregado.ts`** (el dato fechado de §2).
- **Reutiliza la aritmética pura de `galeria-logica.ts`** (indiceCircular, distanciaCircular,
  claveDistancia, signoDe, capaDe, debeRotar, vozDeLaPista, pasosDelArrastre…): importa, NO
  duplica. Lo NUEVO compartido (teclado §3, reinicio de reloj, cadencia) vive en
  **`src/components/carrusel-logica.ts`** (puro, mutable) e importado por AMBOS componentes.
  `MILISEGUNDOS_POR_FOTO` pasa a `carrusel-logica.ts` con valor **2000** (la galería lo re-exporta
  o importa de ahí; decisión del craftsman con su contrato).
- Tarjetas de TEXTO sobre el MISMO domo ∩ (valores del SCSS de galería, adaptados a tarjetas más
  anchas y menos altas — proporción distinta, mismas claves `[data-distancia]`/`--s`). La tarjeta
  central SIEMPRE legible (opacidad 1, texto AA contra su fondo); las laterales se apagan igual
  que las fotos. Estrellas ★ pintadas por función PURA (`estrellasDe(nota)`) — decorativas con el
  número accesible en texto («4,9 de 5»).
- Bloque **NO navegable** (`<div>`, como la galería): no rompe la puerta de anclas ni exige tocar
  la nav. `<h2>` propio («Lo que dicen nuestras clientas» o similar del gherkin_author).
- Estructura ARIA idéntica al patrón carousel Grouped ya aprobado (roledescription, aria-live
  conmutando, ⏸ primero sin aria-pressed, puntos con aria-disabled y diana 24 px).
- Stryker: `Resenas.tsx`, `carrusel-logica.ts` y `resenas-agregado.ts` ENTRAN en `mutate`
  (`resenas-demo.ts` es DATO de demo: fuera, como `equipo-demo.ts`).

## 6. Impacto en contratos y features

- **`features/galeria_carrusel.feature` → v3** (Enmienda 3): @s9 reescrito a 2000 ms (fronteras
  1999/2000, vuelta completa 12000 ⇒ 1ª), reinicio del reloj tras desplazamiento manual, teclado
  (§3, escenarios de la decisión pura + cableado guardado), flechas/pausa de cristal (posición en
  el DOM, clases, glifos — el aspecto fino queda para la verificación en vivo), `.mandos` fuera.
  Feature 22 pasa a `in_progress` durante el trabajo y se re-cierra con TODAS las puertas.
- **`features/resenas_agregado_enlace.feature` NUEVO** (feature 14 → `in_progress`): el contrato
  hereda por referencia la conducta del carrusel (los escenarios de conducta común citan el
  contrato de galería como fuente y fijan solo las DIFERENCIAS: contenido de texto, agregado
  fechado con atribución+enlace, leyenda de ejemplo, aviso 20.4, posición en la home, ambos
  carruseles conviviendo con el teclado §3) — SIN duplicar los 19 escenarios de la galería.
  Techo orientativo: ≤14 escenarios nuevos.
- `feature_list.json` F-14: title/description/acceptance se actualizan al alcance decidido
  (agregado discreto + carrusel propio de ejemplo); la decisión de plataforma
  (`bloqueada_para_publicar`) queda RESUELTA: Treatwell, por decisión de Pablo 2026-07-23.

## 7. Trampas conocidas del entorno (medidas ayer — no re-descubrir)

- jsdom 25: sin `matchMedia` (stub `vi.stubGlobal`), sin `PointerEvent` (despachar
  `MouseEvent('pointerdown')`), sin `IntersectionObserver` (guardar + stub con captura del
  callback y disparo manual de entradas `{ isIntersecting, intersectionRatio, target }`).
- `setInterval` no devuelve `number` con `@types/node`.
- Drag nativo de `<img>`: `draggable={false}` + `touch-action: pan-y` (YA en galería; Reseñas no
  tiene <img> pero hereda `touch-action` para el gesto táctil).
- Stryker: estáticos de módulo no activables por el runner (ver `tdd_deuda_mutacion_full.md`) —
  los datos nuevos (`resenas-agregado.ts`) deben leerse EN tiempo de llamada/test, no derivar
  estructuras en la carga del módulo, para no fabricar más estáticos inmatables.
- Verificación en vivo: `scroll-behavior: smooth` global → medir coordenadas con
  `behavior: 'instant'`; `getBoundingClientRect` devuelve la caja transformada → `offsetWidth`.
- Dos corridas de vitest solapadas se pisan `dist/` (fileParallelism false): puertas en serie.

## Contratos v3 + F-14 (gherkin_author, 2026-07-23)

- `features/galeria_carrusel.feature` → **v3** (Enmienda 3, techo 19 → 24): @s9 reescrito a
  2000 ms (frontera 1999/2000, vuelta 12000 ⇒ 1ª, constante mudada a `carrusel-logica.ts`; el
  «sin frenazo» por referencia cruzada a @s15); @s10/@s11 re-medidos a UN tick de 2000 ms (solo
  números). NUEVOS: @s20 reinicio del reloj (acción en t=1500 ⇒ avance en t=3500, y en pausa NO
  arranca), @s21 tecla→paso puro (8 filas: flechas ±1, resto 0, guardas de campo y Ctrl/Alt/Meta),
  @s22 desambiguación (umbral 0,6 INCLUSIVO; empate → cercanía al centro, 6 filas), @s23 cableado
  guardado (sin IO no revienta; stub con captura; preventDefault SOLO al atender; foco dentro sin
  IO; limpieza) y @s24 mandos de cristal por bytes (sin `.mandos`, 2.75rem, color-mix+blur,
  tokens, z-index>6, visibles ≤640; posición fina EN VIVO). Atribución honesta en cabecera.
- `features/resenas_agregado_enlace.feature` **NUEVO**: 9 escenarios (≤14). @s1 posición
  equipo→reserva + cascarón (h2 «Lo que dicen nuestras clientas» — a aprobar), @s2 línea discreta
  (4,9 · 1.239 · Treatwell · enlace exacto · 23/07/2026), @s3 módulo fechado sin estáticos, @s4
  seis testimonios disjuntos del reviewPool, @s5 leyenda 20.4 byte a byte, @s6 sin aggregateRating
  (ampliando home-horneado), @s7 `estrellasDe` pura, @s8 herencia POR REFERENCIA (ids/etiquetas
  propios), @s9 SCSS diferencial (texto, proporción, central AA). El borrador
  `resenas_destacadas.feature` queda SUSTITUIDO (retirarlo del árbol es del lead). Status de
  F-14/F-22 sin tocar (los fijó el lead). PENDIENTE: puerta humana sobre AMBOS contratos.
