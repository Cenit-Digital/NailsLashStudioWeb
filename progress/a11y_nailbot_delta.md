# Auditoría a11y/SEO DELTA: Nailbot (F-23 `nailbot_chat_compartido` + F-24 `nailbot_flotante`)

Auditor: `a11y_seo_auditor`. Fecha: 2026-09-28. Solo lectura, salvo este informe.

**Veredicto: PASS. El único BLOQUEANTE (SC 2.2.2, la pausa que no congelaba) está curado, lo he medido en Chrome y tiene un test que muerde. Los menores que el lead declara atendidos también están bien. La ronda de correcciones deja 2 IMPORTANTES nuevos y 5 MENORES, ninguno bloqueante.**

## 0. Aviso de trazabilidad: el informe anterior NO está en disco

`progress/a11y_nailbot.md` no existe, y tampoco `progress/judge_nailbot_chat_compartido.md` ni `progress/security_nailbot.md`. Aun así, `progress/tdd_nailbot_chat_compartido.md:18` los cita como si existieran, y no hay rastro de ellos en `git log --all`.

He reconstruido «hallazgo a hallazgo» a partir de tres fuentes:
- `progress/judge_nailbot_flotante.md` (B1 = el mismo bloqueante 2.2.2);
- `progress/tdd_nailbot_flotante.md:45-57`;
- `progress/tdd_nailbot_chat_compartido.md:55`.

El lead tiene que persistir esos tres informes o dejar anotado que se perdieron (regla anti-teléfono-descompuesto). Este delta sirve como registro a11y a partir de ahora.

## Método (sin build, sin Stryker)

- Tests acotados: `pnpm exec vitest run` sobre `nailbot-flotante-estilos.test.ts`, `nailbot-flotante.test.tsx`, `nailbot-flotante-logica.test.ts` y `chat-nailbot-estilos.test.ts`. Resultado: **4/4 ficheros y 92/92 tests en verde**.
- He comprobado que la guarda nueva de @s12 detecta el fallo: su regex caza el shorthand en `git show HEAD:src/components/nailbot-arte.module.scss` y da limpio en el árbol actual.
- Medición en **Chrome headless real**:
  - Compilé con `sass` las hojas reales (`_tokens`, `_base`, `nailbot-arte`, `nailbot-flotante` y `chat-nailbot`, sin el hash de CSS Modules) y las cargué en páginas mínimas con el mismo DOM que el componente.
  - Headless no baja de ~500 px de ventana, así que los anchos de 320, 560 y 1000 px se midieron con iframes.
  - Evidencias en el scratchpad de la sesión (`.../scratchpad/a11y/`): `delta.html`, `panel.html`, `wrap.html`, `wrap2.html`, `raiz.html`, `panel.png` y `escritorio.png`.

---

## 1. Verificación de lo corregido

### 1.1 SC 2.2.2 Pause, Stop, Hide (A): la pausa CONGELA. RESUELTO (era el BLOQUEANTE)

**Qué se cambió.** `src/components/nailbot-arte.module.scss:36-132`: las 13 reglas animadas usan ahora longhands (`animation-name`, `-duration`, `-timing-function` y `-iteration-count`) y ninguna declara `animation-play-state`. La regla de pausa `.arte[data-animacion="pausada"] *` (`:139-141`) ya no compite en la cascada por esa propiedad, así que se aplica aunque su especificidad (0,2,0) sea menor que la de las reglas animadas (0,3,0). No hay `!important` (HS-15 respetado). No hay ninguna regla global de `animation` en `src/styles/` que pueda reponer el estado (grep: solo `hero.module.scss` y `nailbot-flotante.module.scss` usan el shorthand, y ninguna toca el arte).

**Medido en Chrome** (1280 px y ~500 px):
- Con `data-animacion="activa"`, las 13 piezas están en `running`.
- Con `data-animacion="pausada"`, las 13 dan `paused` tanto en `getAnimations()[0].playState` como en el `animation-play-state` calculado. El `currentTime` de las 13 no cambia en 700 ms, es decir, se congelan de verdad.
- Al volver a `activa`, las 13 pasan a `running`.

Esto coincide con la medición en vivo del lead (`progress/current.md:44-45`).

**Retirar «reduce» en caliente.** `nailbot-flotante-logica.ts:51-59` conserva `pausaPulsada: true` y `animacion: "pausada"`. Ahora que la pausa gana la cascada, el robot se queda quieto (L10 y HS-8 a). El test `nailbot-flotante.test.tsx:281-291` fija el atributo. El salto al fotograma 0 («uñas sin pintar») está declarado y aceptado en `features/nailbot_flotante.feature:436-438`; es un cambio discreto, no movimiento.

**Guarda.** El test `nailbot-flotante-estilos.test.ts:127-134` prohíbe el shorthand en toda la hoja del arte y **habría fallado con HEAD** (comprobado).

### 1.2 SC 2.4.7 Focus Visible (AA): halo y forma redonda. RESUELTO

Estilos en `nailbot-flotante.module.scss`:
- `.lanzador:focus-visible` (`:54-61`) tiene especificidad (0,2,0) y gana a la regla global `:focus-visible` (0,1,0) de `_base.scss:18-22`, entre en el orden que entre.
- `.pausa`, `.cerrarBocadillo` y `.cerrarDialogo:focus-visible` (`:63-70`) siguen el mismo patrón.

Medido en Chrome (reglas globales cargadas DESPUÉS, como en el bundle):

| Control | `:focus-visible` | `border-radius` | outline | box-shadow |
|---|---|---|---|---|
| Lanzador | true | `50%` | 3px `rgb(162,62,95)` (`--accent-dark`), offset 6px | sombra + halo blanco de 12px |
| Pausa | true | `50%` | 3px, offset 2px | halo de 7px |
| «Cerrar el chat» | true | `50%` | 3px, offset 2px | halo de 7px |

El anillo del lanzador ocupa 6-9 px y queda entero sobre el halo, que ocupa 0-12 px. `--accent-dark` sobre blanco da **6,2:1** (cálculo propio). Así el foco se ve también sobre el pie oscuro (`--ink`).

### 1.3 Esc con el foco en la × del bocadillo. RESUELTO

`NailbotFlotante.tsx:104-111`: si `focoDentro(bocadilloRef.current, document.activeElement)`, el foco pasa al lanzador antes de desmontar el bocadillo. `nailbot-flotante-logica.ts:82-84` es una función pura.

El test `nailbot-flotante.test.tsx:437-447` detecta el fallo: sin esa rama, la × se desmonta y `activeElement` cae a `body`. Además, `:405-414` fija que un Esc con el foco FUERA no mueve el foco (HS-9).

### 1.4 `pointer-events`. RESUELTO

`nailbot-flotante.module.scss:18-23` pone `none` en la caja fija y `auto` en sus hijos directos: bocadillo, pausa, lanzador y `<dialog>`.

Medido con `elementFromPoint`: el hueco bajo el bocadillo y el hueco entre bocadillo y lanzador devuelven el enlace de la página que hay debajo, a 1280 px y a ~500 px. Los clics ya no se los traga la caja.

Nota: a 1280 px, un punto a 8 px a la izquierda del disco da el `<svg>` del arte, que desborda el botón un 8 % a propósito (`:42-48`). Es área del lanzador y amplía el objetivo, así que está bien.

### 1.5 `forced-colors`. RESUELTO para el lanzador

`nailbot-flotante.module.scss:217-222` pone `border: 2px solid ButtonText` en el lanzador, que en colores forzados se queda sin anillo `box-shadow` y sin degradado. Lo demás se sostiene solo:
- La pausa y «Cerrar el chat» ya tienen borde, que se fuerza a un color del sistema.
- Los iconos usan `currentColor`.
- El outline de foco sobrevive, porque `outline-color` se fuerza.

El único hueco que queda está en MENOR-2.

### 1.6 Placeholder legible y campo sin `outline: none`. RESUELTO

- `chat-nailbot.module.scss:155-158`: `::placeholder { color: var(--muted); opacity: 1 }` sobre `input { background: var(--bg) }` (`:146`).
- Medido: color calculado `rgb(111,82,90)` y opacidad 1.
- `--muted` sobre `--bg` da **6,4:1** (cálculo propio) y es fila vigilada de `MATRIZ_DE_USO` (`src/lib/puerta-contraste.ts:209`).
- El `outline: none` del campo que había en HEAD (`reserva.module.scss`, un fallo real de 2.4.7) ha desaparecido. Medido: el campo enfocado muestra `outline: solid 3px`.

### 1.7 Panel en móvil (`box-sizing`). RESUELTO, con el efecto colateral de IMPORTANTE-1 y MENOR-1

`nailbot-flotante.module.scss:138` tiene `box-sizing: border-box`. El panel mide lo que dice su `width`, y el test de bytes `nailbot-flotante-estilos.test.ts:150-155` lo vigila.

Medido a ~500 px y a 320 px: el `<dialog>` ocupa `[0,0,vw,alto]` y «Cerrar el chat» cae dentro, 12 px del borde en móvil con barras overlay.

### 1.8 Cambios fuera de la feature (con ojo a11y)

- `tools/puerta-*.ts` pasan de `process.exit(c)` a `process.exitCode = c`. Es la última sentencia de cada script, así que el código de salida no cero se conserva y la puerta de contraste (la que protege 1.4.3 y 1.4.11), la del cascarón y la de anclas **no pierden dientes**.
- `vitest.setup.ts` (doble fiel de `close`), `stryker.config.json`, `.gitignore` y `feature_list.json` no tienen impacto a11y ni SEO.

### 1.9 SEO

Sin cambios de SEO:
- El flotante solo existe en cliente: `renderToString(<Home/>)` no contiene `<dialog` ni el lanzador (test `nailbot-flotante.test.tsx:87-107`).
- Sigue habiendo un solo `<h1>` (test `:115`).
- El `<h2>` del panel solo existe en cliente y dentro de un diálogo cerrado.
- El chat de `#reserva` sigue horneado.

---

## 2. Hallazgos nuevos (por impacto)

### BLOQUEANTES: ninguno

### IMPORTANTE-1: el panel tiene una barra de scroll horizontal (2 px) en todos los anchos con barras clásicas (Windows)

- **Dónde:** `src/components/chat-nailbot.module.scss:11-20`.
- **Causa:** `.chat` tiene `width: 100%` y `border: 1px` en `content-box`, y el repo no tiene reset global de `box-sizing` (grep). La tarjeta mide el 100 % más 2 px, y el relleno final del `<dialog>` (`overflow: auto`) la hace desbordar 2 px.
- **Medido:**
  - Escritorio (iframe de 1000 px): `scrollWidth 418` frente a `clientWidth 416`. Sale una barra horizontal visible bajo los chips (`escritorio.png`).
  - 320 px: `305` frente a `303`, más barra vertical propia.
- **Impacto:** no se pierde contenido, porque lo que desborda es relleno vacío. Por eso **no** es un fallo estricto de SC 1.4.10. Pero hay scroll en dos ejes dentro del panel, la barra se come 15 px de alto y en táctil el panel «baila» 2 px en horizontal. Es la misma familia de bug que el lead curó en `.dialogo`, pero en la tarjeta.
- **Corrección:** `box-sizing: border-box` en `.chat` (`chat-nailbot.module.scss:11`). Cura también el desborde de 2 px de la columna de `#reserva` en móvil. Conviene añadirle un test de bytes como el de `.dialogo`.

### IMPORTANTE-2: con texto ampliado, a 320 px el título del panel queda debajo de «Cerrar el chat» (SC 1.4.4)

- **Dónde:** `src/components/nailbot-flotante.module.scss:155-164` (`.titulo` absoluto, `left: 1.25rem`, sin límite a la derecha) y `:167-181` (la × absoluta de 36 px fijos arriba a la derecha).
- **Medido:** a 320 px con `html { font-size: 150% }` (equivale a la escala de texto de Chrome Android o al tamaño de letra «grande» del navegador), el título ocupa `[30..275]` y la × `[255..291]`. **Se solapan**: la «t» final de «Reserva con Nailbot» queda tapada (`panel.png`, panel central). A tamaño normal no se solapan, y a 360 px o más con 150 % tampoco.
- **Impacto:** se pierde una parte pequeña del contenido visible del encabezado, solo en el ancho mínimo y con texto ampliado. El nombre accesible del diálogo (`aria-labelledby`) no se ve afectado.
- **Corrección:** sacar `.titulo` del posicionamiento absoluto (en flujo, con `margin: 0 3rem 1rem 0`) y bajar el `padding-top` del `.dialogo`. Si no, como mínimo, `right: 3.5rem` en `.titulo` para que envuelva antes de la ×. Con un `padding-top` fijo, un título de dos líneas pisaría el chat, así que la opción en flujo es la robusta.

### MENOR-1: `width: 100vw` en el panel móvil se mete bajo la barra de scroll clásica

- **Dónde:** `nailbot-flotante.module.scss:189-196`.
- **Qué pasa:** `100vw` incluye la barra vertical de la página. En ventanas de escritorio de 600 px CSS o menos (zoom de 200-400 %, justo el escenario de reflow de SC 1.4.10) el panel mide 15 px más que el área visible (medido: `dlg 504` frente a `clientWidth 489`, y `318` frente a `303`).
- **Consecuencias:**
  - La barra de la página se pinta encima: tapa 3 px de «Cerrar el chat».
  - Cuando el panel desborda, tapa también **su propia barra vertical**, de modo que arrastrar la barra visible mueve la página de detrás.
  - En móviles reales (barras overlay) no ocurre.
- **Origen:** el cambio lo forzó la guarda de @s13 «la hoja NO contiene `width: 100%`» (`features/nailbot_flotante.feature:377`, `nailbot-flotante-estilos.test.ts:184-188`). Esa guarda mira la hoja ENTERA, aunque su intención era `.flotante`. Además, `max-width: 100%` también la dispara por subcadena.
- **Corrección:** `width: auto; max-width: none;` en el `@media`. El diálogo modal ya tiene `inset-inline: 0` del UA y se estira al bloque contenedor sin la barra. No toca la guarda. Si se prefiere, el `gherkin_author` puede acotar la cláusula a `.flotante`.

### MENOR-2: en colores forzados, el panel no tiene contorno

- **Dónde:** `nailbot-flotante.module.scss:143` (`border: 0`).
- **Qué pasa:** en `forced-colors` desaparece el `box-shadow`, y el `::backdrop` se fuerza a Canvas conservando el alfa. Queda un panel Canvas sobre una página Canvas, sin borde.
- **Corrección:** añadir `.dialogo { border: 2px solid CanvasText; }` en el `@media (forced-colors: active)` de `:218` (o un `outline: 1px solid transparent` base). No es un requisito de WCAG AA; es buena práctica.

### MENOR-3: faltan guardas de bytes para las curas a11y que no son de la pausa

Stryker no ve SCSS, y ninguna de estas curas tiene test:
- el `border-radius: 50%` y el halo de `:focus-visible` (`nailbot-flotante.module.scss:54-70`);
- `pointer-events` (`:18-23`);
- `forced-colors` (`:217-222`);
- el `::placeholder` con `opacity: 1` sobre `--bg` (`chat-nailbot.module.scss:155-158`);
- la ausencia de `outline: none|0` en `chat-nailbot.module.scss`. `nailbot-flotante-estilos.test.ts:232-233` solo vigila la hoja del flotante, y `outline: none` fue un fallo real de 2.4.7 en HEAD.

Precedente: `hero-estilos.test.ts:455-456`.

### MENOR-4: la guarda de @s12 prohíbe el shorthand, no el síntoma

Un `animation-play-state: running` dentro de una regla animada, o una regla de mayor especificidad en otra hoja, volvería a romper la pausa y la guarda seguiría en verde. Sería más robusto un test que exija que ninguna regla de `nailbot-arte.module.scss`, salvo la de pausa, declare `animation-play-state`.

### MENOR-5: detalles del panel (UX, no son fallos WCAG)

- «Cerrar el chat» es `position: absolute` dentro de un contenedor con scroll (`:167-181`): cuando el panel desborda (móvil bajo, apaisado, texto ampliado) se va con el contenido. Esc y el orden de tabulación lo compensan; `position: sticky` lo mantendría a la vista.
- `.hilo { height: 344px }` (`chat-nailbot.module.scss:73`) anida un scroll dentro del scroll del panel. En apaisado, el panel tiene como máximo 343 px de alto (`100dvh - 2rem`) y el hilo solo ya lo llena.
- La regla global `:focus-visible { border-radius: 2px }` sigue cuadrando al enfocarlos los chips, el campo, el botón de enviar y «Reservar otra cita» del chat. Viene de antes (`#reserva`) y es cosmético: el foco sigue visible.

### Informativo (sin acción)

El lanzador está fuera de todo landmark a propósito (L14, `features/nailbot_flotante.feature:99`). La regla *best-practice* `region` de axe lo marcará, pero no es un criterio WCAG (SC 1.3.1 no exige que todo esté en un landmark). Queda justificado.

---

## Resumen para el lead

| Hallazgo previo | Estado | Evidencia |
|---|---|---|
| BLOQUEANTE SC 2.2.2: la pausa no congelaba | RESUELTO | Chrome: 13/13 `paused` y `currentTime` fijo; guarda `estilos.test.ts:127-134` que muerde HEAD |
| Foco del lanzador cuadrado y sin halo | RESUELTO | Chrome: `50%`, halo de 12 px, anillo 6,2:1 |
| Esc con el foco en la × | RESUELTO | `NailbotFlotante.tsx:104-111` + test `:437-447` |
| `pointer-events` | RESUELTO | `elementFromPoint` en los huecos devuelve la página |
| `forced-colors` | RESUELTO (lanzador) | `module.scss:217-222`; el panel está en MENOR-2 |
| Placeholder y `outline: none` del campo | RESUELTO | Chrome: `#6F525A`, opacidad 1 (6,4:1); `outline` 3px |
| Panel móvil (`box-sizing`) | RESUELTO | Chrome: el panel cabe; efectos colaterales en IMPORTANTE-1 y MENOR-1 |

Nuevos: 0 bloqueantes, 2 importantes (IMPORTANTE-1 barra horizontal por `.chat` en `content-box`; IMPORTANTE-2 título tapado por la × a 320 px con texto ampliado) y 5 menores.
