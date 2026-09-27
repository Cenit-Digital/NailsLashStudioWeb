# 04 · Accesibilidad y animación: botón-robot flotante + panel de chat

> **Investigación de solo lectura.** Fecha: **2026-09-27**. Objetivo: WCAG 2.2 AA.
> Stack: Vite + React 19 (instalado **19.2.7**) + TS + SCSS, SSG con `vite-react-ssg`, Vitest 4 + **jsdom 25.0.1** (instalado) + Testing Library.
> Solo fuentes oficiales: w3.org (WCAG 2.2, Understanding/Techniques, WAI-ARIA 1.2, APG), developer.mozilla.org, html.spec.whatwg.org, react.dev y los repos oficiales `facebook/react` y `jsdom/jsdom` en GitHub.
>
> Convenciones: cada dato lleva URL + fecha que muestra la propia página («Updated…», «Last modified…») y la fecha de consulta (2026-09-27 en todas). Las citas literales van entre comillas y en inglés (<25 palabras). Lo que no he podido verificar en una fuente oficial va marcado como **NO CONFIRMADO**. Lo que es deducción mía (no está escrito en la fuente) va marcado como **[inferencia]**.
>
> Citas de WCAG verificadas contra el HTML descargado de w3.org (no solo el resumen de WebFetch). Citas de HTML y ARIA 1.2 extraídas del texto de la especificación descargada.

---

## Resumen ejecutivo

1. **Un bucle decorativo infinito en el robot incumple SC 2.2.2 (A)** salvo que exista un mecanismo de pausa, parada u ocultación. Se cumplen las tres condiciones: arranca solo, dura más de 5 s y se muestra a la vez que el resto de la página. La única excepción es lo «esencial», y lo decorativo no lo es. **`prefers-reduced-motion` no figura como técnica de 2.2.2**: es técnica de 2.3.3.
2. **Salida limpia: una ráfaga de ≤5 s que termina en una pose estática.** La animación que arranca por hover o foco cuenta como «arranque automático» según la Understanding, así que cada repetición también debe durar ≤5 s. Qué pasa con las repeticiones encadenadas no lo trata ninguna fuente: **NO CONFIRMADO**.
3. **SC 2.4.11 (AA):** un botón fijo en la esquina puede **tapar por completo** un control que recibe el foco (fallo F110). Solución documentada: C43, que combina `padding-bottom` y `scroll-padding-bottom` en `html`. Un panel no modal que el usuario abre y cierra con Escape no incumple, según el ejemplo de chat de la propia Understanding.
4. **Hilo de mensajes:** usar `role="log"` (ARIA23). Su `aria-live` implícito es `polite` y `aria-atomic` es `false`. MDN aconseja añadir además `aria-live="polite"` de forma redundante y tener la región **en el DOM antes** de insertar mensajes.
5. **Modal o no modal.** La APG solo publica el patrón *Dialog (Modal)*. La Understanding de 2.4.11 pone de ejemplo un chat como «popover non-modal dialog». Ninguna fuente oficial prescribe cuál usar para un widget de chat: **NO CONFIRMADO**.
6. **`<dialog>.showModal()`** vuelve inerte el resto del documento, lo sube a la *top layer*, se cierra con Esc y devuelve el foco al cerrar. **jsdom 25.0.1 no implementa `show()`, `showModal()` ni `close()`**: el IDL los tiene comentados, sigue igual en v30.1.1 y el issue #3294 sigue abierto. **Tampoco implementa `inert` ni `matchMedia`.**
7. **React 19 trata `inert` como booleano** (CHANGELOG 19.0.0, PR #24730). react.dev no lo documenta en su página de props comunes. **`autoFocus` no funciona dentro de un `<dialog>` abierto con `showModal()`**: el issue #23301 sigue abierto y la PR #37328 sin fusionar. Hay que enfocar a mano.
8. **Rendimiento:** animar solo `transform` y `opacity`. En piezas SVG hay que poner `transform-box: fill-box` y un `transform-origin` explícito, porque el `transform-origin` inicial de los elementos SVG es `0 0`. `will-change` solo como último recurso. Para el borde inferior, `env(safe-area-inset-bottom, 0px)`.

---

## 1. SC 2.2.2 Pause, Stop, Hide (nivel A)

**Fuente principal:** https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html («Updated 10 August 2026»; consultado 2026-09-27). Norma: WCAG 2.2, W3C Recommendation 12 December 2024, https://www.w3.org/TR/WCAG22/.

### 1.1 Condiciones exactas (texto normativo)

- Moviéndose, parpadeando o desplazándose: «For any moving, blinking or scrolling information that (1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with other content…». En ese caso tiene que haber un mecanismo para pausar, detener u ocultar. **Única excepción:** que el movimiento sea «part of an activity where it is essential».
- Autoactualización: basta con que arranque sola y se muestre en paralelo con otro contenido, sin umbral de 5 s. Aquí no aplica, porque el robot no se autoactualiza.
- Glosario WCAG 2.2 (https://www.w3.org/TR/WCAG22/, 12 Dec 2024):
  - *essential*: «if removed, would fundamentally change the information or functionality of the content…»
  - *pure decoration*: «serving only an aesthetic purpose, providing no information, and having no functionality».
  - *blinking*: «switch back and forth between two visual states in a way that is meant to draw attention».

### 1.2 Qué significa «starts automatically», según la Understanding

- «…considered to start automatically either when it starts without direct user activation … or when it starts as a result of an indirect interaction (such as focusing/hovering over an element, or scrolling an element into view).»
- Frase siguiente: «Content that starts automatically from an indirect interaction also potentially fails 2.3.3 Animation from Interactions.»
- Por qué 5 s: «long enough to get a user's attention, but not so long that a user cannot wait out the distraction».
- Qué **no** cuenta como mecanismo de pausa: «Having an animation stop only so long as a user has focus on it … would not be considered a "mechanism for the user to pause"».
- El requisito de «en paralelo»: en el ejemplo del *preloader*, como el contenido en movimiento «is not presented in parallel with other content», no hace falta mecanismo aunque dure más de 5 s.
- Ejemplos que cumplen: un anuncio que «blinks to get viewers attention but stops after 5 seconds», y una animación con un botón «"freeze animation"» junto a ella.
- «Why it's important»: «Some people with cognitive disabilities and attention deficits are distracted by continuous movement.»

### 1.3 Técnicas suficientes y fallos (misma página)

- **Suficientes:**
  - G4: permitir pausar y reanudar desde el punto en que se pausó.
  - SCR33: desplazamiento por script con mecanismo de pausa.
  - **G11:** contenido que parpadea menos de 5 s.
  - **G152:** GIF animado que se detiene tras n ciclos, dentro de 5 s.
  - **SCR22:** script que detiene el parpadeo en 5 s o menos.
  - **G186:** un control en la página que detiene el contenido en movimiento, parpadeo o autoactualización.
  - G191: enlace o botón que recarga la página sin el contenido que parpadea.
- **Fallos:** F16 (desplazamiento sin pausa), F112 (parpadeo de más de 5 s sin mecanismo), F50 (script de parpadeo sin límite de 5 s), F7 (objeto o *applet* de más de 5 s).
- **G186** (https://www.w3.org/WAI/WCAG22/Techniques/general/G186, «Updated 15 July 2025»):
  - El control debe cumplir WCAG por sí mismo: «it has a name that identifies it, it is keyboard accessible».
  - Ubicación: «The control is either at the top of the page or adjacent to the moving content.»
- **G11** (https://www.w3.org/WAI/WCAG22/Techniques/general/G11, «Updated 15 July 2025»): la prueba mide si el intervalo entre el inicio y el final del parpadeo es menor de 5 s.
- **G152** (https://www.w3.org/WAI/WCAG22/Techniques/general/G152, «Updated 15 July 2025»): la duración total, es decir fotogramas × duración de cada fotograma × repeticiones, debe ser ≤5 s.
- **`prefers-reduced-motion` no aparece** ni en la Understanding de 2.2.2 ni en su lista de técnicas (búsqueda de «reduced» en el texto: 0 resultados). Que respetar esa preferencia baste para 2.2.2 es **NO CONFIRMADO**. Está documentado como técnica de 2.3.3 (C39, SCR40), no de 2.2.2.

### 1.4 Respuestas

**a) ¿Un bucle decorativo infinito en el botón flotante entra en el SC?** **Sí** **[inferencia directa del texto normativo]**:
- (1) arranca al cargar sin que nadie lo active;
- (2) dura más de 5 s;
- (3) convive con el resto de la página.

La excepción solo cubre lo «essential», y un adorno encaja en la definición de «pure decoration», no en la de «essential». La Understanding **no contiene** ninguna exención para animaciones decorativas (búsqueda de «decorat»: 0 resultados). Su ejemplo de conformidad para «An animation» es precisamente poner un botón para congelarla.

**b) ¿Una animación de ≤5 s que se detiene y solo se repite con hover o foco cumple?**
- **La ráfaga inicial de ≤5 s sí cumple:** no se da la condición (2), que la animación dure más de 5 s. Es el mismo principio que G11, G152, SCR22 y el ejemplo del anuncio que «stops after 5 seconds».
- **La repetición por hover o foco** es, según la Understanding, un «arranque automático» por interacción indirecta. Así que cada repetición sigue sujeta a las tres condiciones: si dura ≤5 s y se detiene aunque el puntero o el foco sigan encima, no supera el umbral **[inferencia]**.
- **Si la animación sigue en bucle mientras dura el hover o el foco**, puede superar los 5 s y entrar en el SC. Además, «parar al quitar el foco» no cuenta como mecanismo de pausa.
- Ni la Understanding ni G11 tratan las **repeticiones encadenadas**, por ejemplo relanzar la ráfaga cada 20 s con un temporizador → **NO CONFIRMADO**. Lectura prudente: no relanzarla por temporizador.
- La Understanding avisa de que el arranque por interacción indirecta «also potentially fails 2.3.3». Por eso la repetición por hover también debe respetar `prefers-reduced-motion`. Ver §2.

**c) Parpadeo de ojos y SC 2.3.1 (A)** (https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html, «Updated 17 September 2025»):
- Se incumple con más de 3 destellos por segundo **y** por encima del umbral de área.
- Referencia de área: «A 341 x 256 pixel rectangle anywhere on the displayed screen area when the content is viewed at 1024 x 768 pixels».
- Un parpadeo de ojos de pocos píxeles y a menos de 3 Hz queda muy por debajo **[inferencia]**.

---

## 2. SC 2.3.3 Animation from Interactions (AAA) y `prefers-reduced-motion`

**Fuente:** https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html («Updated 16 September 2025»).

- Texto normativo: «Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed.»
- Diferencia con 2.2.2: «"Animation from interactions" applies when a user's interaction initiates non-essential animation.» En cambio, 2.2.2 se aplica cuando la página arranca la animación «automatically».
- Técnicas suficientes:
  - **C39**: la media query `prefers-reduced-motion` en CSS.
  - **SCR40**: la misma media query consultada desde JavaScript.
  - Un ajuste propio para desactivar la animación (identificador provisional «Gx» en la página).

**C39** (https://www.w3.org/WAI/WCAG22/Techniques/css/C39, «Updated 12 January 2026») admite dos patrones equivalentes:

```css
/* A: el movimiento por defecto, anulado en reduce */
@media (prefers-reduced-motion: reduce) { /* CSS to disable motion goes here */ }

/* B (inverso): estilos estáticos por defecto, movimiento como opt-in */
/* "Static" CSS styles */
@media (prefers-reduced-motion: no-preference) { /* CSS for the motion effect goes here */ }
```

- Prueba de C39: activar la preferencia de movimiento reducido del sistema y comprobar que la animación es esencial o que queda suprimida.

**MDN** (https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion, «Last modified June 10, 2026»; Baseline *Widely available* desde enero de 2020):
- Valores: `no-preference` y `reduce`. `@media (prefers-reduced-motion)` equivale a `reduce`.
- El ejemplo de MDN **no elimina** la animación: **sustituye** un `pulse` basado en `scale` por un `dissolve` basado en `opacity` dentro del bloque `reduce`. Reducir no tiene por qué ser eliminar; lo que se quita es el movimiento.
- Ajustes del sistema:
  - Windows 11: Accessibility > Visual Effects > Animation Effects.
  - macOS: Accessibility > Display (o Motion) > Reduce motion.
  - iOS: Accessibility > Motion.
  - Android 9+: Accessibility > Remove animations.
  - Firefox: `ui.prefersReducedMotion`.

**Patrón recomendado para este proyecto** **[inferencia + práctica del repo]**:
- Usar el **patrón B (opt-in con `no-preference`)**. Por defecto el robot se pinta estático, en su pose final (uñas pintadas, ojos abiertos). Las `@keyframes` solo se aplican dentro de `@media (prefers-reduced-motion: no-preference)`.
- Así el HTML prerenderizado por SSG sale sin movimiento para quien lo pidió, sin depender de JS.
- El repo ya usa este patrón en `src/styles/_demo.scss` y el patrón A en `hero.module.scss` y `galeria.module.scss`.
- **Esto no sustituye al mecanismo de 2.2.2** (ver §1.3).

---

## 3. SC 2.4.11 Focus Not Obscured (Minimum) (AA), F110 y C43

**Understanding:** https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html («Updated 15 June 2026»).

- Texto normativo: «When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.»
- El nivel AA tolera que el componente quede tapado **en parte**: «this AA criterion allows for the component receiving focus to be partially obscured». Que no quede tapado nada es 2.4.12 (AAA).
- Contenidos típicos que tapan el foco: «sticky footers, sticky headers, and non-modal dialogs».
- Caso del banner: un banner de cookies fijo «will fail this success criterion if it entirely obscures a component receiving focus».
  - Formas de pasar: «making the banner modal … or using scroll padding».
- Contenido que abre el usuario (Nota 2): «If the user can reveal the focused component without advancing the keyboard focus, the component with focus is not considered visually hidden…».
- **Ejemplo literal de chat:** «A user opens a chat interface, which is a popover non-modal dialog.» El usuario tabula hasta un enlace tapado y «presses the Escape key to close the chat interface, which un-obscures the link». Según la Understanding, eso **no incumple**.

**F110** (https://www.w3.org/WAI/WCAG22/Techniques/failures/F110, «Updated 15 July 2025»):
- Objetivo: evitar que quien usa el teclado «cannot see where the indicator is due to other authored content».
- Procedimiento: tabular por la página «Both progressing down through the page, and back up» y comprobar si el elemento enfocado queda «completely obscured». Si queda tapado del todo, incumple.

**C43** (https://www.w3.org/WAI/WCAG22/Techniques/css/C43, «Updated 25 September 2025»; suficiente para 2.4.11 y 2.4.12):
- Objetivo: que los componentes «initially completely obscured by a fixed-position component can still be accessed».
- El ejemplo combina **`padding-bottom` y `scroll-padding-bottom` en `html`**: `html { padding-bottom: var(--height-dialog); scroll-padding-bottom: var(--scroll-padding); }`.
- Solo fija el componente por encima de `50rem`; por debajo, pasa a `position: relative`.

**MDN `scroll-padding`** (https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding, «Last modified September 16, 2026»; Baseline desde abril de 2021):
- Define insets de la zona óptima de visión «to make room for objects that might obscure the content, such as fixed-positioned toolbars».
- Se aplica al contenedor de desplazamiento; en la página, es `html`.

**Implicaciones para un botón fijo en la esquina** **[inferencia]**:
- Un botón de 56–64 px puede tapar **por completo** un enlace pequeño situado en la esquina inferior derecha del viewport. Por ejemplo, un icono social o un enlace legal del pie, o cualquier enlace que el desplazamiento del foco deje justo debajo. Eso es F110.
- Mitigación documentada (C43):
  - `scroll-padding-bottom` ≥ alto del botón + separación inferior + área segura;
  - más `padding-bottom` en `html` o al final del pie, para que el último elemento enfocable pueda quedar por encima del botón.
- El repo ya aplica C43 arriba: `html { scroll-padding-top: 6rem; }` en `src/styles/_base.scss`. Falta el equivalente inferior.
- **Panel abierto:**
  - Si es **modal**, el resto de la página es inerte y no puede recibir foco, así que no puede quedar tapado un foco que no existe **[inferencia]**.
  - Si es **no modal**, basta con que Esc lo cierre sin mover el foco (Nota 2 y ejemplo del chat).

---

## 4. Target Size, Content on Hover or Focus, Status Messages y Non-text Content

### 4.1 SC 2.5.8 Target Size (Minimum) (AA)

https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html («Updated 11 May 2026»).

- «The size of the target for pointer inputs is at least 24 by 24 CSS pixels», con cinco excepciones:
  - *Spacing*: un círculo de 24 px de diámetro centrado en cada objetivo pequeño no toca otros objetivos;
  - *Equivalent*: otro control de la misma página que cumple hace lo mismo;
  - *Inline*: el objetivo está dentro de una frase;
  - *User agent control*;
  - *Essential*.
- La misma página recomienda: «For important links/controls, consider aiming for the stricter 2.5.5 Target Size (Enhanced).»
- 2.5.5 (AAA, https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html, «Updated 11 May 2026»): «at least 44 by 44 CSS pixels».
- Para el botón del robot, el botón de cerrar el panel, el de enviar y la «X» del bocadillo, lo mínimo AA son 24×24. Para el robot, objetivo recomendado ≥44×44 **[inferencia]**.

### 4.2 SC 1.4.13 Content on Hover or Focus (AA), aplicado al bocadillo

https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html («Updated 12 July 2026»).

- **Alcance normativo:** «Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden…».
- **Dismissible:** hay un mecanismo para descartarlo «without moving pointer hover or keyboard focus». Dos salvedades: que comunique un error de entrada, o que no tape ni sustituya otro contenido.
  - La Understanding pone Esc como ejemplo: «such as pressing the Esc key».
- **Hoverable:** «the pointer can be moved over the additional content without the additional content disappearing».
- **Persistent:** permanece visible hasta que se retira el hover o el foco, el usuario lo descarta o la información deja de ser válida.
- **Excepción:** que su presentación la controle el agente de usuario. Ejemplo: los tooltips del atributo `title`.
- Nota 2: están cubiertos los «Custom tooltips, sub-menus, and other nonmodal popups that display on hover and focus».
- La APG tiene un patrón *Tooltip* («A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it»; https://www.w3.org/WAI/ARIA/apg/patterns/, sin fecha visible).

**Qué implica para el bocadillo** **[inferencia del texto normativo]**:
- Si **aparece al hacer hover o recibir foco** en el robot, debe cumplir las tres condiciones: descartable con Esc sin mover el foco, que se pueda pasar el puntero por encima sin que desaparezca, y persistente.
- Si **aparece solo** (por un temporizador tras cargar la página), **no** lo dispara ni hover ni foco. Queda fuera del alcance literal de 1.4.13, pero sigue sujeto a:
  - 2.2.2, si se mueve o rebota más de 5 s;
  - 2.4.11, si tapa por completo un control enfocado;
  - 2.5.8, para su botón de cerrar.

### 4.3 SC 4.1.3 Status Messages (AA)

https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html («Updated 11 May 2026»).

- Texto normativo: los mensajes de estado deben poder determinarse por programa, mediante rol o propiedades, para que las tecnologías de apoyo los presenten «without receiving focus».
- Técnicas:
  - **ARIA22** (`role=status`) para resultados y estado;
  - **ARIA19** (`alert`) para errores;
  - **ARIA23** (`role=log`) para información secuencial;
  - **G193** «Providing help by an assistant in the web page», suficiente junto con ARIA22. Describe un avatar que asiste al usuario (https://www.w3.org/WAI/WCAG22/Techniques/general/G193, «Updated 15 July 2025»).
  - Fallo: **F103**.
- **ARIA23** (https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA23, «Updated 01 June 2026»):
  - «The ARIA live region role of log has an implicit aria-live value of polite and aria-atomic value of false».
  - Su Ejemplo 1 es literalmente un chat: los mensajes se añaden al final de una región con `role="log"` «so that new additions are announced by ATs».
- **MDN Live regions** (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions, «Last modified September 11, 2026»):
  - «The most reliable way to ensure that live regions are registered is to include them in the initial markup.»
  - Para `role="log"`: «To maximize compatibility, add a redundant `aria-live="polite"`».
  - `aria-relevant` vale por defecto `additions text`.

### 4.4 SC 1.1.1 Non-text Content (A): SVG decorativo dentro de un botón con nombre

https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html («Updated 10 August 2026»).

- Controles: «If non-text content is a control or accepts user input, then it has a name that describes its purpose.»
- Decoración: «implemented in a way that it can be ignored by assistive technology».
- **MDN `aria-hidden`** (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden, «Last modified October 30, 2025»):
  - Úsalo para contenido «Purely decorative… such as icons or images».
  - «Do not use `aria-hidden="true"` on focusable elements», ni en sus ancestros.
  - El ejemplo es un icono con `aria-hidden="true"` dentro de un `<button>`.
- **W3C Design System, SVG icons** (https://design-system.w3.org/styles/svg-icons.html, «Generated 17 Oct 2025»):
  - Para iconos decorativos: `aria-hidden="true" focusable="false"`.
  - `focusable="false"` «prevents the Tab key from navigation inside the SVG in Internet Explorer». Es un atributo heredado de SVG Tiny 1.2, sin efecto en los navegadores actuales **[inferencia]**, pero inocuo.
- **APG Button** (https://www.w3.org/WAI/ARIA/apg/patterns/button/, sin fecha visible):
  - Se activa con Enter y con Espacio.
  - Nombre desde el contenido o con `aria-labelledby` o `aria-label`.
  - En un botón conmutador, la etiqueta no cambia; el estado lo comunica `aria-pressed`.
- **WAI-ARIA 1.2 `aria-haspopup`** (https://www.w3.org/TR/wai-aria-1.2/, W3C Recommendation 06 June 2023):
  - Valores posibles: `menu`, `listbox`, `tree`, `grid` o `dialog`.
  - Los autores «MUST ensure that the role of the element that serves as the container for the popup content is … dialog, and that the value of aria-haspopup matches». Por tanto: `aria-haspopup="dialog"`.
  - No he verificado en las fuentes consultadas que `aria-expanded` o `aria-controls` sean obligatorios en el disparador de un diálogo → **NO CONFIRMADO**.

### 4.5 Contraste (relevante con paleta rosa)

- SC 1.4.11 Non-text Contrast (AA) (https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html, «Updated 15 June 2026»): ≥3:1 frente a los colores adyacentes para la «Visual information required to identify user interface components and states».
  - El contorno o la silueta del robot sobre un fondo rosa debe llegar a 3:1 **[inferencia]**.
- SC 2.4.13 Focus Appearance (AAA, orientativo) (https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html, «Updated 10 August 2026»): el indicador ocupa al menos el área de un perímetro de 2 px y tiene 3:1 entre los estados enfocado y no enfocado.

---

## 5. Patrón *Dialog (Modal)* de la APG, rol `log` y la cuestión modal/no modal

### 5.1 Patrón APG Dialog (Modal)

https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (sin fecha visible).

- Definición: las ventanas bajo un diálogo modal son inertes. «Like non-modal dialogs, modal dialogs contain their tab sequence».
- **Teclado:**
  - al abrir, el foco pasa a un elemento dentro del diálogo;
  - **Tab** y **Shift+Tab** recorren sus elementos tabulables y dan la vuelta del último al primero y viceversa;
  - **Escape** cierra.
- **Foco inicial**, cuatro casos:
  - si el contenido es semántico o complejo, `tabindex="-1"` en un elemento estático al principio;
  - si hay mucho contenido y el inicio saldría de la vista, un elemento estático arriba, como el título;
  - en acciones irreversibles, el control menos destructivo;
  - en diálogos solo informativos o de continuar, el control más usado.
- **Al cerrar:** el foco vuelve al elemento que abrió el diálogo, salvo que ya no exista o que la lógica del flujo pida otro destino.
- Recomendación fuerte: «It is strongly recommended that the tab sequence of all dialogs include a visible element with role button that closes the dialog».
- **Roles y atributos:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (título visible) o `aria-label`, y `aria-describedby` opcional.
- Advertencia: si se marca `aria-modal` y el diálogo no se comporta como modal, los usuarios de algunas tecnologías de apoyo «will experience severe negative ramifications».

### 5.2 WAI-ARIA 1.2

https://www.w3.org/TR/wai-aria-1.2/, W3C Recommendation 06 June 2023. Texto extraído de la especificación descargada.

- **`dialog`:**
  - «Authors MUST provide an accessible name for a dialog».
  - «Authors SHOULD ensure that all dialogs (both modal and non-modal) have at least one focusable descendant element.»
  - *Accessible Name Required: True.*
- **`aria-modal`:**
  - Con un modal a la vista, los autores «MUST ensure the interface can be controlled using only descendants of the modal element».
  - Además «SHOULD mark all other contents as inert … if the ability to do so exists in the host language».
- **`log`:**
  - «A type of live region where new information is added in meaningful order and old information may disappear.»
  - Ejemplos: «chat logs, messaging history».
  - Lo nuevo se añade «only to the end of the log».
  - Implícito: `aria-live` = `polite`.
  - *Superclass Role: section*; *Name From: author*.
- **Discrepancia sobre el nombre de `log`:**
  - La tabla de ARIA 1.2 **no** incluye la fila «Accessible Name Required» para `log`.
  - MDN (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/log_role, «Last modified June 23, 2025») la marca como «Required».
  - Que sea obligatorio según ARIA 1.2 queda **NO CONFIRMADO**. Dárselo (`aria-label="Conversación"`) no cuesta nada.

### 5.3 ¿Modal o no modal para un widget de chat?

- **La APG solo publica *Dialog (Modal)*.** En el índice (https://www.w3.org/WAI/ARIA/apg/patterns/, sin fecha visible) aparecen *Dialog (Modal)* y *Alert and Message Dialogs*; no hay ninguno de diálogo no modal.
- **WCAG usa el chat como ejemplo de no modal:** «A user opens a chat interface, which is a popover non-modal dialog» (2.4.11, §3). Es un ejemplo descriptivo, no una recomendación.
- **MDN, rol `dialog`** (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/dialog_role, «Last modified May 12, 2025»):
  - En los no modales se puede seguir interactuando con la página.
  - Debería haber un atajo de teclado global para mover el foco entre el diálogo y la página principal.
  - Al cerrar, el foco vuelve a donde estaba.
- **SC 2.1.2 No Keyboard Trap** (https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html, «Updated 18 May 2026»): restringir el foco dentro de un modal o un popover «does not fail … as long as the user knows how to 'untrap' the focus».
- **Conclusión:** ninguna fuente oficial prescribe modal o no modal para un chat → **NO CONFIRMADO**. Comparación **[inferencia]**:

| | Modal (`showModal()`) | No modal |
|---|---|---|
| Inerte fuera, Esc y devolución del foco | Los da el navegador (§6) | Hay que programarlos |
| 2.4.11 con el panel abierto | No hay foco fuera del panel | Pasa si Esc lo cierra (Nota 2) |
| Consultar la web mientras se chatea | No | Sí |
| En móvil | El panel ocupa casi toda la pantalla, así que en la práctica ya es modal | Igual |
| Coste de test en jsdom 25 | Hay que simular `showModal` y `close`; el comportamiento del navegador no se puede verificar en unitarios | Todo es código propio: se puede testear con `user-event`, pero hay más superficie de mutación |

---

## 6. `<dialog>`, `showModal()`, `inert`, React 19 y jsdom 25

### 6.1 Especificación HTML

https://html.spec.whatwg.org/multipage/interactive-elements.html («Last Updated 25 September 2026»). Texto extraído de la especificación descargada.

- Qué es: «The dialog element represents a transitory part of an application, in the form of a small window ("dialog box")…».
- **`showModal()`:**
  - marca el diálogo como modal;
  - lo añade a la *top layer*;
  - «Set subject's node document to be blocked by the modal dialog subject», con lo que el resto del documento queda inerte;
  - guarda el foco previo: «Set subject's previously focused element to the focused element»;
  - ejecuta los pasos de foco del diálogo.
- **Al cerrar**, se ejecutan los pasos de enfocar el elemento que tenía el foco antes si el foco estaba dentro del diálogo **o si el diálogo era modal** («or wasModal is true»). En un diálogo modal, el navegador devuelve el foco al disparador.
- **Peticiones de cierre** (https://html.spec.whatwg.org/multipage/interaction.html):
  - «The Esc key on desktop platforms»;
  - el gesto o botón «atrás» en Android;
  - el gesto de descartar de las tecnologías de apoyo, por ejemplo el gesto «z» de VoiceOver.
- **`closedby`:**
  - valores `any` (petición de cierre o clic fuera), `closerequest` y `none`;
  - el estado *Auto* se comporta como *Close Request* con `showModal()` y como *None* en los demás casos.
- «The tabindex attribute must not be specified on dialog elements.»
- **No quitar `open` a mano:**
  - si se hace, no se dispara `close` y, si era modal, el documento sigue bloqueado;
  - «it is generally better to never remove the open attribute manually». Hay que usar `close()` o `requestClose()`.
- Foco inicial: «authors should use the autofocus attribute on the descendant element of the dialog that the user is expected to immediately interact with».

### 6.2 MDN `<dialog>`

https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog, «Last modified September 2, 2026».

- `showModal()`: top layer, `::backdrop`, el resto inerte, se cierra con Esc (salvo `closedby="none"`).
- `show()`: no modal, **no** se cierra con Esc y no vuelve nada inerte.
- `aria-modal` implícito: `true` con `showModal()`; `false` con `show()` o con el atributo `open`.
- Sin `autofocus`, `showModal()` enfoca el primer descendiente enfocable.
- Recomienda un botón de cerrar explícito y **no** poner `tabindex` en el `<dialog>`.

### 6.3 `inert`

- HTML: «The inert attribute is a boolean attribute that indicates, by its presence, that the element and all its flat tree descendants which don't otherwise escape inertness (such as modal dialogs) are to be made inert» (https://html.spec.whatwg.org/multipage/interaction.html).
- MDN (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert, «Last modified April 17, 2026»; Baseline desde abril de 2023):
  - un elemento inerte no recibe clics ni foco, no aparece en la búsqueda de la página, no admite selección ni edición y **sale del árbol de accesibilidad**;
  - no tiene indicación visual por defecto: el autor debe señalar qué parte está inerte;
  - un `<dialog>` modal escapa de la inercia de sus ancestros.

### 6.4 React 19 e `inert`

- **react.dev no documenta `inert`**: la página de props comunes (https://react.dev/reference/react-dom/components/common, consultada 2026-09-27) no lo menciona.
- **CHANGELOG oficial** (https://github.com/facebook/react/blob/main/CHANGELOG.md), sección «19.0.0 (December 5, 2024)», React DOM: «Add support for `inert` (#24730)».
- **PR #24730** (https://github.com/facebook/react/pull/24730, fusionada el 13-03-2024), «Support boolean values for `inert` prop»:
  - el truco anterior `inert=""` deja de funcionar porque la cadena vacía se trata como `false`;
  - con React 19: `inert={true}` / `inert={false}`.
- **Diálogo en React:**
  - CHANGELOG 19.1.0 (March 28, 2025): «Added support for beforetoggle and toggle events on the dialog element» (#32479).
  - Soporte de `onCancel` y `onClose` en `<dialog>`: **NO CONFIRMADO** en react.dev en esta investigación.
- **`autoFocus` dentro de `<dialog>` no funciona con `showModal()`:**
  - issue https://github.com/facebook/react/issues/23301 «Bug: autoFocus broken inside <dialog />», abierto desde 2022-02-15 y **abierto** a 2026-09-27;
  - la PR de arreglo https://github.com/facebook/react/pull/37328 (2026-08-20) está **abierta** y explica: «React implements autoFocus on client-created controls by calling focus() during commit and omitting the native autofocus attribute»;
  - → Hay que enfocar el campo **a mano con un `ref` justo después de `showModal()`**. La otra opción es aceptar el foco por defecto del navegador, que va al primer enfocable.

### 6.5 jsdom 25: ¿implementa `HTMLDialogElement.showModal()`? **No.**

Verificado en el código fuente del repo oficial `jsdom/jsdom`:

- **IDL en la etiqueta `v25.0.1`** (https://github.com/jsdom/jsdom/blob/v25.0.1/lib/jsdom/living/nodes/HTMLDialogElement.webidl):
  - solo refleja `attribute boolean open`;
  - `returnValue`, `show()`, **`showModal()`** y `close()` aparecen **comentados** con `//`;
  - la implementación (`HTMLDialogElement-impl.js`) es una clase vacía.
- **Igual en `v30.1.1`** (publicada 2026-09-22, la última) y en `main`. El último commit que tocó ese IDL es del 2021-10-06.
- **Issue #3294** «Implement `HTMLDialogElement`» (https://github.com/jsdom/jsdom/issues/3294): **abierto** desde 2021-11-23.
- **Notas de versión:**
  - el repo ya no tiene `Changelog.md` en la raíz (404 en `main`);
  - he revisado las notas de las *releases* de GitHub (API `releases`) desde v11.11.0 hasta v30.1.1, y **ninguna** menciona `dialog`, `showModal`, `inert`, `popover` ni `matchMedia`.
- **Hoja de estilos por defecto** (`lib/jsdom/browser/default-stylesheet.js` en v25.0.1): contiene `dialog:not([open]) { display: none }`. Un `<dialog>` cerrado tiene `display: none` en jsdom.
- **`inert`:**
  - `HTMLElement.webidl` de v25.0.1 no incluye la propiedad `inert`;
  - `lib/jsdom/living/helpers/focusing.js` no comprueba la inercia en ningún sitio;
  - → jsdom **no aplica la semántica de `inert`** a foco ni a clics **[inferencia a partir del código]**.
- **`matchMedia`:** no aparece en `lib/jsdom/browser/Window.js` de v25.0.1. El repo ya lo sustituye con un *stub* en `src/components/galeria.test.tsx`.
- **Layout:** el README dice que jsdom «does not do any layout or rendering». No sirve para probar tamaños de objetivo, solapes (2.4.11) ni animaciones.

**Consecuencias para los tests** **[inferencia]**:
- Si se usa `<dialog>` + `showModal()`:
  - en jsdom `dialog.showModal` es `undefined` y llamarlo lanza `TypeError`;
  - hay que añadir un *stub* protegido en el *setup* de Vitest, que solo actúe si falta el método: `showModal` pone `open` y `close` lo quita y despacha `close`;
  - los tests verifican **nuestro contrato**: que se llama a `showModal`, el nombre accesible, el foco explícito en el campo y la reacción al evento `close`;
  - **no** pueden verificar la inercia, Esc como petición de cierre, la *top layer* ni la devolución automática del foco. Eso lo garantiza la especificación y se comprueba en un navegador real.
- Si el panel es **no modal y lo gestiona React**, con `role="dialog"` en un contenedor: Esc, foco al abrir y foco de vuelta son código propio y se pueden testear con `user-event`.
- Que `getByRole('dialog')` de Testing Library no encuentre el `<dialog>` cerrado por su `display: none` es plausible, pero **NO CONFIRMADO** en fuentes oficiales de esta lista.

---

## 7. Rendimiento de la animación SVG con CSS

- **MDN, *Animation performance and frame rate*** (https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate, «Last modified November 7, 2025»):
  - el ciclo es estilo → layout → paint → composición;
  - `left`, `max-width`, `margin-left` o `font-size` fuerzan layout y repintado; `color` fuerza repintado;
  - **`transform` y `opacity`** solo necesitan recalcular estilo y componer;
  - objetivo: 60 fps, unos 16,7 ms por fotograma.
- **MDN, *CSS and JavaScript animation performance*** (https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance, «Last modified November 7, 2025»):
  - OMTA: si la propiedad no provoca reflow ni repaint, el muestreo sale del hilo principal, «The most common property is the CSS transform»;
  - «we should always try to create our animations using CSS transitions/animations where possible».
  - Si esto se aplica igual a los **elementos hijos de un SVG** en todos los motores: **NO CONFIRMADO**, MDN no lo precisa.
- **`transform-box`** (https://developer.mozilla.org/en-US/docs/Web/CSS/transform-box, «Last modified April 20, 2026»; Baseline desde enero de 2020):
  - valor inicial `view-box`;
  - con `fill-box` la caja de referencia es la *object bounding box*;
  - el ejemplo de MDN usa `transform-box: fill-box` + `transform-origin: 50% 50%` para que un `rect` gire sobre sí mismo; sin `fill-box`, el origen es el del lienzo SVG.
- **`transform-origin`** (https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin, «Last modified April 20, 2026»): «The initial value of `transform-origin` is `0 0` for all SVG elements except for root `<svg>` elements…».
  - Cada pieza animada (pestaña, párpado, brazo, pincel) necesita **`transform-box: fill-box` + un `transform-origin` explícito**, por ejemplo la bisagra del párpado arriba en el centro o el hombro del brazo.
- **`will-change`** (https://developer.mozilla.org/en-US/docs/Web/CSS/will-change, «Last modified August 4, 2026»):
  - «Use the `will-change` property as a last resort … Don't use it to anticipate performance problems»;
  - usarlo en exceso ralentiza;
  - en la hoja de estilos mantiene la optimización más tiempo; mejor activarlo y quitarlo con script;
  - con `opacity` crea el contexto de apilamiento por adelantado.
- **`env()` y áreas seguras** (https://developer.mozilla.org/en-US/docs/Web/CSS/env, «Last modified September 12, 2026»; Baseline desde enero de 2020):
  - `safe-area-inset-bottom` vale `0px` en un viewport rectangular y más de 0 si hay muesca o barras;
  - acepta un respaldo como segundo argumento, `env(safe-area-inset-bottom, 0px)`;
  - ejemplo de MDN: `padding: 1em 1em calc(1em + env(safe-area-inset-bottom))`.
- **`viewport-fit`** (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport, «Last modified Sep 23, 2026»):
  - con `cover`, «It's highly recommended to use the safe area inset variables»;
  - el `index.html` del repo tiene `width=device-width, initial-scale=1.0` **sin** `viewport-fit`;
  - qué valores devuelve `env(safe-area-inset-*)` sin `viewport-fit=cover`: **NO CONFIRMADO** en MDN.

---

## Implicaciones para el diseño

Reglas concretas. Entre corchetes, el SC o la fuente que motiva cada una. Si una regla es criterio de proyecto y no un requisito WCAG, se indica. Los SC **2.4.7, 3.3.2 y 4.1.2** se citan solo como referencia: sus páginas Understanding **no se consultaron** en esta investigación.

### Botón-robot

1. **Botón nativo con nombre.**
   - `<button type="button" aria-haspopup="dialog" aria-label="Abrir el asistente">`, con un texto definitivo que el equipo decida. [1.1.1, 4.1.2, APG Button, ARIA 1.2 `aria-haspopup`]
   - El `<svg>` inline lleva `aria-hidden="true" focusable="false"`, sin `<title>` ni `tabindex`, y no contiene nada enfocable. [MDN `aria-hidden`, W3C Design System]
2. **Tamaño ≥44×44 CSS px.** El mínimo AA es 24×24 [2.5.8]; 44 sigue la recomendación de la propia Understanding para controles importantes [2.5.5 AAA]. Es criterio de proyecto.
3. **Contraste:**
   - contorno o silueta ≥3:1 contra el fondo rosa adyacente [1.4.11];
   - anillo de foco visible, ≥3:1 y de 2 px o más de perímetro [2.4.7 y 2.4.13 como guía]. Reutilizar el `outline` global del repo.
4. **Animación en «ráfaga», sin bucle infinito** [2.2.2]:
   - al cargar, una sola secuencia de **≤5 s en total**, con la uña pintada y un parpadeo;
   - termina en una **pose final estática**: `animation-iteration-count` finito y `animation-fill-mode: forwards`;
   - puede **repetirse con `:hover` y `:focus-visible`**, cada vez ≤5 s, **sin bucle mientras dure el hover** y **sin relanzarse por temporizador**. Las repeticiones encadenadas son NO CONFIRMADO; esta es la lectura prudente.
   - Si el cliente exige bucle infinito: **control de pausa** visible, con nombre, accesible por teclado, ≥24×24 y **junto al robot** [G186], con la elección persistente. Pausar solo mientras el robot tiene el foco **no** vale [Understanding 2.2.2].
5. **Movimiento reducido** [2.3.3 / C39]:
   - todas las `@keyframes`, incluida la repetición por hover y la apertura del panel, **dentro de `@media (prefers-reduced-motion: no-preference)`**;
   - fuera de esa media query, el robot se pinta estático en su pose final;
   - esto **complementa** la regla 4, no la sustituye.
6. **Destellos:** parpadeos a menos de 3 por segundo y en un área minúscula [2.3.1].
7. **Posición:**
   - `position: fixed`, con `right` y `bottom` que sumen `env(safe-area-inset-right/bottom, 0px)` a la separación de diseño [MDN `env()`];
   - añadir `viewport-fit=cover` solo con una decisión explícita y comprobándolo en un dispositivo real (NO CONFIRMADO sin él).
8. **Sin tapar el foco** [2.4.11 / F110 / C43]:
   - junto al `scroll-padding-top: 6rem` actual de `_base.scss`, añadir **`scroll-padding-bottom`** ≥ alto del botón + separación + `env(safe-area-inset-bottom, 0px)`;
   - añadir un **`padding-bottom` equivalente** en `html`, o al final del pie, para que el último enlace pueda quedar por encima del robot;
   - no colocar enlaces del pie en la esquina inferior derecha;
   - comprobarlo con la prueba F110, tabulando hacia abajo y hacia arriba, en móvil y en escritorio.
9. **Rendimiento:**
   - animar solo `transform` y `opacity` de los grupos `<g>`;
   - `transform-box: fill-box` + `transform-origin` explícito en cada pieza;
   - no animar `d`, `fill`, `filter` ni propiedades geométricas;
   - sin `will-change` en la hoja de estilos [MDN];
   - todo con SVG + CSS propios, sin terceros (puerta `puerta-terceros`).

### Bocadillo de invitación

10. **Si aparece por hover o foco:** descartable con **Esc** sin mover el foco, se puede pasar el puntero por encima sin que desaparezca, persistente, y **nunca** con el atributo `title` [1.4.13].
11. **Si aparece solo:**
    - **estático**, o con una entrada de ≤5 s [2.2.2];
    - con **botón de cerrar** con nombre y ≥24×24 [2.5.8];
    - que no tape por completo controles enfocables [2.4.11];
    - que **no** sea una región viva, porque no es el resultado de ninguna acción del usuario [criterio de proyecto, 4.1.3];
    - si su texto aporta algo, vincularlo al robot con `aria-describedby` [criterio de proyecto].

### Panel de chat

12. **Recomendación [criterio de proyecto, inferencia]: modal nativo** con `<dialog>` + `showModal()`.
    - El navegador ya da la inercia exterior, Esc, la *top layer*, `::backdrop`, `aria-modal` implícito y la devolución del foco al robot [HTML, MDN].
    - En móvil el panel ocuparía casi toda la pantalla de todos modos.
    - Si se quiere consultar la web mientras se chatea, la alternativa es el no modal. En ese caso hay que programar Esc, el foco de entrada y el de vuelta, y valorar un atajo de teclado global [MDN, rol `dialog`; 2.4.11, Nota 2].
13. **Cómo construir el `<dialog>`:**
    - `aria-labelledby` apuntando a un **título visible**; sin `role` redundante; **sin `tabindex`** [HTML];
    - un **botón «Cerrar» visible** como primer o último tabulable, ≥24×24 [APG];
    - cerrar **siempre** con `dialog.close()` o `requestClose()`; **no** alternar `open` desde una prop de React [HTML];
    - dejar el `closedby` por defecto, para que Esc cierre;
    - con `::backdrop` semitransparente.
14. **Foco:**
    - justo después de `showModal()`, `inputRef.current?.focus()`, porque `autoFocus` de React falla dentro de `<dialog>` (#23301);
    - al cerrar, el navegador devuelve el foco al robot [HTML, pasos de cierre con `wasModal`]. Si el robot desapareciera, dirigir el foco explícitamente [APG].
15. **Hilo de mensajes:**
    - `<div role="log" aria-live="polite" aria-label="Conversación">`, **presente desde el primer render del panel** y antes de añadir mensajes;
    - mensajes **solo al final** [ARIA23, ARIA 1.2 `log`, MDN Live regions];
    - **no** mover el foco a cada mensaje nuevo [4.1.3].
16. **Indicador «escribiendo…»:** en un `role="status"` aparte, sin mezclarlo con el `log` [ARIA22].
17. **Campo de texto y botón «Enviar»:** etiqueta visible o `aria-label`; «Enviar» ≥24×24 [1.1.1, 2.5.8, 3.3.2].
18. **Animación de apertura y cierre del panel:** solo dentro de `no-preference`, y solo con `transform` y `opacity` [2.3.3, MDN].

### Tests (Vitest 4 + jsdom 25.0.1)

19. **`<dialog>`:** *stub* protegido de `showModal` y `close` en el *setup*, que solo actúe si faltan los métodos. Los tests afirman el contrato propio: llamada, nombre accesible, foco en el campo y reacción a `close`. Esc, inercia, *top layer* y devolución del foco se comprueban en un **navegador real** y se dejan anotados en `progress/`.
20. **`matchMedia`:** *stub*, como ya hace `galeria.test.tsx`, solo si la lógica lee la preferencia desde JavaScript. Si todo es CSS, un test estático del SCSS: que las `@keyframes` estén dentro de `no-preference` y que exista `scroll-padding-bottom`, siguiendo el patrón de `scroll-padding-cabecera.test.ts`.
21. **Fuera de los unitarios:** tamaños (2.5.8), solapes (2.4.11), duración real de la animación (2.2.2) y la semántica de `inert`. jsdom no hace layout ni aplica `inert`, así que se verifican en navegador o con una puerta de build, **acotando el alcance** según la memoria del proyecto.
