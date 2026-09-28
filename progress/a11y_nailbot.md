<!-- Guardado por el craftsman_lead desde el registro del workflow wf_7b369228-ea2 (el revisor no tenía herramienta de escritura). Texto íntegro del informe del agente. -->

ISSUES_FOUND(1) -> progress/a11y_nailbot.md

# Auditoría a11y/SEO: Nailbot (F-23 chat compartido + F-24 robot flotante)

Solo lectura. No he ejecutado vitest, build ni Stryker. No he escrito el fichero: este texto es el contenido de `C:\Users\User\Desktop\CenitDigitalProyectosCodigo\NailsLashStudioWeb\progress\a11y_nailbot.md` y lo tiene que guardar el lead.
Base de la revisión: el código del árbol de trabajo (`git diff HEAD`), los contratos y resoluciones HS-1 a HS-17, y el CSS/HTML de `dist/`. Ese build es de hoy a las 03:17 y ya contiene `data-animacion` y `--nailbot-lanzador: 104px`, o sea, refleja este diff.
Contrastes calculados con la fórmula de luminancia relativa de WCAG sobre los hex de `src/styles/_tokens.scss`.

**Resultado: 1 bloqueante, 3 importantes (uno heredado) y varios menores. SEO sin problemas.**

## Bloqueante

### 1. La pausa no congela nada: SC 2.2.2 (A) y SC 4.1.2 (estado anunciado falso)
- `src/components/nailbot-arte.module.scss:96-98`: `.arte[data-animacion='pausada'] * { animation-play-state: paused; }` tiene especificidad **(0,2,0)**.
- `:36-93`: cada regla animada, por ejemplo `.arte[data-animacion] .flota { animation: flotar 3.2s ease-in-out infinite; }`, tiene **(0,3,0)**. El shorthand `animation` también fija `animation-play-state`, y lo deja en `running`. Como gana la especificidad más alta, **las 13 animaciones siguen corriendo con la pausa pulsada**.
- Confirmado en el CSS construido (`dist/assets/app-DpVG4Cmp.css`): `._arte_vi6nv_1[data-animacion=pausada] *{animation-play-state:paused}` frente a `._arte_vi6nv_1[data-animacion] ._flota_vi6nv_26{transform-origin:center;animation:_flotar_vi6nv_1 3.2s ease-in-out infinite}`.
- **Es una regresión de este diff.** En HEAD (302ddb4) el selector era `.arte[data-animado='si'][data-animacion='pausada'] *`, con (0,3,0) y colocado después, así que ganaba. El prototipo lo resolvía con `!important`, que HS-15 y @s12 prohíben con razón. Al quitar `data-animado` se perdió un atributo en el selector.
- Consecuencias:
  - El bucle infinito se queda sin un mecanismo de pausa que funcione (2.2.2 falla).
  - `aria-pressed="true"` anuncia «pausado» mientras el robot se mueve (4.1.2).
  - Al retirar «reduce» en caliente, la pausa reaparece pulsada pero el robot arranca solo, en contra de L10 y HS-8.
- Por qué los tests están verdes:
  - @s4 solo mira `data-animacion` y `aria-pressed`; jsdom no resuelve la cascada.
  - @s12 (`nailbot-flotante-estilos.test.ts:108-110`) solo comprueba que el cuerpo contiene el literal `animation-play-state: paused`.
- Corrección: dar a la pausa especificidad (0,3,0) o más y colocarla después de las reglas animadas, por ejemplo `.arte[data-animacion='pausada'] [class] { animation-play-state: paused; }`. La otra opción es declarar las animaciones con longhands (`animation-name`, `-duration`, …) en lugar del shorthand.
- Test que falta: en @s12, que la especificidad del selector de pausa sea mayor o igual que la de todo selector con `animation:` y que vaya después en la hoja.

## Importantes (no bloquean)

1. **SC 2.4.3: Esc con el foco en la × del bocadillo pierde el foco.** En `NailbotFlotante.tsx:91-96`, `alPulsar` cierra sin mover el foco, que es lo correcto si el foco está fuera. Si está en la propia × (`:147-154`), el botón desaparece y el foco cae al `<body>`. Ni la tabla de @s8 ni los tests cubren ese caso. Corrección: si el bocadillo contiene `document.activeElement`, llamar a `lanzador.current?.focus()`, igual que hace la ×.
2. **El indicador de foco casi no se ve sobre el pie oscuro.**
   - El outline del lanzador (`nailbot-flotante.module.scss:45-48`, `--accent-dark`, 6 px de separación) sobre `--ink` #8E3355 da **1,23:1**.
   - El outline global `--border-interactive`, que usan la pausa y las ×, da **1,69:1** sobre `--ink`.
   - Al final de la página, el lanzador fijo queda encima del pie.
   - Según el criterio documentado del repo (`_base.scss:9-13`: 2.4.7 no pide contraste y 2.4.13 es AAA) no es bloqueante, pero el cambio de estado apenas se percibe.
   - Corrección: poner un halo blanco bajo el outline en `:focus-visible`, añadiendo `0 0 0 6px var(--surface)` al box-shadow. Así el outline queda pegado al blanco, con 6,19:1 y 7,62:1 contra `--ink`.
3. **SC 1.4.3 del placeholder: heredado, no es regresión.**
   - `chat-nailbot.module.scss:143-153` no define `::placeholder`.
   - Firefox lo pinta con el color del texto a opacidad 0,54: unos **2,67:1** sobre `--bg` (calculado). Chromium depende de su hoja de estilos del navegador; hay que medirlo en vivo.
   - Ya existía en reserva_chat, pero ahora aparece en dos instancias.
   - Corrección: `input::placeholder { color: var(--muted); opacity: 1; }` (6,42:1).

## Menores
- **Esquinas cuadradas al enfocar.** La regla global `:focus-visible { border-radius: 2px }` (`_base.scss:18-22`) entra en el bundle después de los módulos (`src/main.tsx:2` importa App antes que `main.scss` en `:43`; en el dist está en el byte 35832, frente al 24341 del lanzador). Con foco de teclado, el lanzador, la pausa, la × y «Cerrar el chat» pierden el círculo. Es visual, no de WCAG. Corrección: `border-radius: 50%` en sus `:focus-visible`.
- **Clics bloqueados junto al robot.** `.flotante` (`:10-18`) no lleva `pointer-events: none`. Con el bocadillo visible, los huecos de su caja (unos 350×163 px en escritorio) capturan los clics sobre la página que hay debajo, incluido el pie. Corrección: `pointer-events: none` en el contenedor y `auto` en los hijos.
- **Bocadillo en móvil.** Su borde superior (unos 150 px, estimado) supera el `scroll-padding-bottom` de 124 px. Es conforme por la Nota 2 de 2.4.11, porque Esc lo descarta sin mover el foco. Comprobar en la prueba F110 en vivo.
- **Colores forzados.** Con `border: 0`, el anillo (box-shadow) y el disco (gradiente) desaparecen en ese modo. No es AA. Corrección: `@media (forced-colors: active) { .lanzador { border: 2px solid ButtonText; } }`.
- **Autoría de las burbujas, SC 1.3.1 (heredado).** Quién dice cada burbuja solo se ve por color, alineación y `data-de`, que no llega a las tecnologías de apoyo (`ChatNailbot.tsx:90-98`). El texto permite deducirlo. Lo robusto sería un prefijo visualmente oculto, que obligaría a ajustar los textos exactos de los tests.
- **Para comprobar en vivo:**
  - Al reabrir el panel con el hilo desbordado, Chrome puede enfocar el hilo desplazable antes que el primer control.
  - En Safari, un clic de ratón no enfoca el lanzador, así que al cerrar el foco no vuelve a él.
  - Al abrir el panel, el lector anuncia el nombre del diálogo y «Uñas», pero no el saludo, que es contenido inicial del log. Opcional: `aria-describedby` del `<dialog>` a la leyenda o al primer mensaje.

## Lo que pasa

**1.4.3 Contraste de texto (calculado)**

| Elemento | Colores | Ratio |
|---|---|---|
| Subtítulo (12 px) | `--accent-dark` sobre `--accent-soft` | 4,86:1 (margen de solo 0,36) |
| Leyenda y aviso (12 px) | `--muted` sobre `--surface` | 6,93:1 |
| Bocadillo, texto | `--text` sobre `--surface` | 9,10:1 |
| Bocadillo, destacado | `--ink` sobre `--surface` | 7,62:1 |
| Título del diálogo | `--ink` sobre `--bg` | 7,06:1 |
| Nombre del chat | `--ink` sobre `--accent-soft` | 5,98:1 |

Las filas del subtítulo, la leyenda y el aviso existen en MATRIZ_DE_USO y se pintan sobre esos fondos de verdad (`.chatCabecera`, `.leyenda` y `.chatPie`).

**1.4.11 Contraste de componentes (calculado)**

| Elemento | Colores | Ratio |
|---|---|---|
| Anillo del lanzador | `--accent-dark` sobre `--bg` | 5,74:1 |
| Anillo del lanzador | frente al aro blanco interior | 6,19:1 |
| Disco del lanzador sobre el pie | blanco sobre `--ink` | 7,62:1 |
| Pausa, borde | frente a `--bg` | 4,19:1 |
| Pausa, icono | sobre blanco | 6,19:1 |
| × del bocadillo | `--muted` | 6,93:1 |
| «Cerrar el chat», borde | frente a `--bg` | 4,19:1 |
| «Cerrar el chat», glifo | | 6,19:1 |
| Borde del campo | | 4,52:1 |
| Foco global | sobre blanco / sobre `--bg` | 4,52:1 / 4,19:1 |

**2.2.2 y 2.3.3 (fuera del bloqueante)**
- Las 13 `@keyframes` y la animación de aparición del bocadillo están dentro de `no-preference` (patrón B).
- Con «reduce», la pausa no se monta y nada se mueve; este camino no depende de la regla rota.
- El chat y su avatar no se animan.

**2.4.3 Orden y foco**
- Tras cada acción, el foco va al primer control del paso nuevo y nunca al montar (`ChatNailbot.tsx:50-55`, `chat-nailbot-logica.ts:192-198`).
- Un nombre vacío deja el mismo estado, así que el foco se queda en el campo.
- La × lleva el foco al lanzador, y activar «reduce» en caliente también.
- En el DOM, el flotante va entre `</main>` y el pie. Dentro del diálogo, el orden es h2, chat y «Cerrar» al final, como fija HS-12.

**2.4.11 Foco no tapado**
- `scroll-padding-bottom` sale de la misma variable que el tamaño del lanzador.
- Da 152 px en escritorio frente a unos 141 px que ocupan el arte y la pausa, y 124 px en móvil frente a unos 108 px. En ambos casos suma el área segura.
- El final del pie a 1280 px no queda tapado según la geometría estimada; se confirma con la prueba F110 en vivo (HS-10 b).

**2.5.8 Tamaño de objetivo**

| Control | Tamaño |
|---|---|
| Lanzador | 104 px / 76 px |
| Pausa | 32 px |
| × del bocadillo | 28 px |
| «Cerrar el chat» | 36 px |
| «Enviar» | 44 px |
| Chips | unos 36 px de alto |

La pausa queda por encima del lanzador (z-index 1).

**1.4.13 Bocadillo**
- Fuera del alcance literal, porque lo lanza un temporizador y no el hover ni el foco.
- Aun así cumple: se descarta con la × y con Esc desde cualquier punto, no caduca solo y no es región viva.
- Describe al lanzador sin arrastrar el nombre de la ×.

**4.1.2 Nombre, rol y valor**
- Lanzador: `aria-haspopup="dialog"`, sin `aria-expanded` y el arte con `aria-hidden`.
- Pausa: `aria-pressed` con etiqueta estable (el estado es falso por el bloqueante).
- Las × tienen `aria-label` y el glifo oculto.
- El `<dialog>` es nativo, con `aria-labelledby` a un h2 con id de `useId`, sin role ni tabindex.
- El campo tiene `aria-label` y el enlace final, `aria-describedby` al aviso.

**4.1.3 Mensajes de estado**
- El hilo es `role="log"` con `aria-live="polite"` y `aria-label`, ya presente en el HTML horneado de #reserva.
- En el panel, el hilo nace con su contenido inicial y los mensajes nuevos solo se añaden al final.

**`<dialog>` nativo**
- Se abre con `showModal()` en un efecto, sin autofocus y sin controlar `open` desde React.
- `onClose` sincroniza el estado cuando se cierra con Esc o con el gesto atrás.
- ← y → no llegan a `document` (se corta la propagación) y no se llama a `preventDefault`.

**Mejoras de este diff**
- Se quitó `outline: none` del campo, así que ahora tiene foco visible.
- `overflow-wrap: anywhere` evita que un nombre de 300 caracteres desborde.

## SEO
Sin problemas. En `dist/index.html`:
- Hay 0 apariciones de «Abrir el chat con Nailbot», `<dialog`, `data-animacion` y «Pausar la animación».
- Hay 1 `<h1`, 1 `<title` y 1 meta description.
- El chat de #reserva sale horneado con `role="log"`, «Asistente automático · demo» y la leyenda, una vez cada uno.

`NailbotFlotante` devuelve `null` en el SSR y en la primera pasada del cliente (`:116-118`), así que no hornea nada y no hay desajuste de hidratación. ChatNailbot no añade encabezados ni landmarks.

## Cobertura @s y tests
Todos los @s de los dos contratos tienen tests. Faltan dos:
- El efecto real de la pausa en la cascada: @s12 pasa sin probar nada, ver el bloqueante.
- Esc con el foco dentro del bocadillo.

## Menores (lista devuelta)

- [IMPORTANTE] SC 2.4.3. En src/components/NailbotFlotante.tsx:91-96, Esc cierra el bocadillo sin mover el foco. Si el foco está en su propia × (:147-154), el botón desaparece y el foco cae al <body>. Ni el contrato ni los tests de @s8 cubren ese caso. Corrección: en `alPulsar`, si el bocadillo contiene document.activeElement, llamar a lanzador.current?.focus(), el mismo destino que ya usa la ×.
- [IMPORTANTE] El indicador de foco casi no se ve sobre el pie oscuro. El outline del lanzador (--accent-dark, nailbot-flotante.module.scss:45-48) sobre --ink da 1,23:1, y el outline global (--border-interactive) de la pausa y las × da 1,69:1. Al final de la página el lanzador fijo queda encima del pie. No es bloqueante con el criterio del repo (2.4.7 no pide contraste y 2.4.13 es AAA). Corrección: poner un halo blanco bajo el outline en :focus-visible, por ejemplo añadir `0 0 0 6px var(--surface)` al box-shadow.
- [IMPORTANTE, heredado y sin regresión] SC 1.4.3 del placeholder «Escribe tu nombre…» (chat-nailbot.module.scss:143-153 no define ::placeholder). En Firefox se pinta el texto con opacidad 0,54, unos 2,67:1 sobre --bg, y ahora aparece en dos instancias. Corrección: `input::placeholder { color: var(--muted); opacity: 1; }` (6,42:1).
- [MENOR] La regla global `:focus-visible { border-radius: 2px }` (_base.scss:18-22) entra en el bundle DESPUÉS de los módulos (main.tsx:2 importa App antes que main.scss en :43; en el dist aparece en el byte 35832 frente al 24341 del lanzador). Con foco de teclado, el lanzador, la pausa, la × y «Cerrar el chat» se vuelven cuadrados. Es un fallo visual, no de WCAG. Corrección: `border-radius: 50%` en sus :focus-visible.
- [MENOR] `.flotante` (nailbot-flotante.module.scss:10-18) no lleva `pointer-events: none`. Con el bocadillo visible, los huecos de su caja capturan los clics sobre la página que hay debajo, incluido el pie al final. Corrección: `pointer-events: none` en .flotante y `auto` en sus hijos.
- [MENOR] En móvil, el borde superior del bocadillo (unos 150 px, estimado) supera el scroll-padding-bottom de 124 px. Es conforme por la Nota 2 de 2.4.11, porque Esc lo descarta sin mover el foco. Comprobar en la prueba F110 en vivo.
- [MENOR] En modo de colores forzados, el anillo (box-shadow) y el disco (gradiente) desaparecen porque el botón tiene `border: 0`. No es AA. Corrección: `@media (forced-colors: active) { .lanzador { border: 2px solid ButtonText; } }`.
- [MENOR] SC 1.3.1 (heredado): quién dice cada burbuja solo se ve por color, alineación y `data-de`, que no llega a las tecnologías de apoyo (ChatNailbot.tsx:90-98). El texto lo deja deducir, pero un prefijo visualmente oculto («Nailbot:»/«Tú:») sería lo robusto; implicaría ajustar los textos exactos de los tests.
- [MENOR, verificación en vivo] Al reabrir el panel con el hilo desbordado, Chrome puede enfocar el hilo (keyboard-focusable scrollers). En Safari, un clic de ratón no enfoca el lanzador, así que al cerrar el foco no vuelve a él. Al abrir el panel no se anuncia el saludo del log, solo el nombre del diálogo y «Uñas».
