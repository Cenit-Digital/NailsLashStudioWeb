# Verificación EN VIVO — Nailbot (F-23 + F-24), sesión de cierre 2026-09-28

> Autor: `craftsman_lead`. Navegador real: Chromium 141.0.7390.37 (Playwright 1.56.1, `chromium-1194`),
> headless, contra el build de producción servido con `vite preview` desde una COPIA exacta de `dist/`
> (hash del HTML servido = hash de `dist/index.html`). Build: HEAD `95e701e` (F-04 ENMIENDA 2 ya
> aplicada), `pnpm build` directo (no el de la suite: los builds de vitest heredan `NODE_ENV=test`).
> Scripts y capturas en el scratchpad de la sesión (`verificar-nailbot.mjs`, `sonda-*.mjs`, `vivo/`);
> aquí, los resultados. Complementa la verificación del 2026-09-28 por la mañana de `progress/current.md`
> (Chrome del panel a 375×812).

## 1. Resultado global

**88 comprobaciones: 87 OK y 1 caso previsto por el contrato, decidido y aceptado (§4).** Consola sin
errores ni avisos, cero errores de página y cero peticiones a terceros en todas las páginas abiertas.

La primera pasada (sobre el build de `3c171ff`) destapó el defecto preexistente de hidratación (la home
en blanco con React #418 en 1-6 de cada 20 cargas en frío): ver `progress/hallazgo_hidratacion_ssg.md`.
Se corrigió como ENMIENDA 2 de F-04 (`95e701e`, judge APPROVED en `progress/judge_cascaron_enmienda2.md`)
y todo lo de abajo se midió DESPUÉS de esa corrección.

## 2. Hidratación (sonda de cargas en frío, CPU ralentizada por CDP)

| Build                            | Cargas                | Rotas (#418 / sin robot / página vacía) |
| -------------------------------- | --------------------- | --------------------------------------- |
| Antes de la corrección (`async`) | 20 · 20 · 24 (CPU ×4) | 3 · 4 · 1                               |
| Después (`95e701e`)              | 40 (CPU ×4)           | **0**                                   |
| Después (`95e701e`)              | 20 (CPU ×6)           | **0**                                   |

## 3. Lo medido, por bloque

**HTML crudo servido (L7 y F-04 ENMIENDA 2):** sin rastro del flotante horneado; un solo `<h1>`; el chat
de `#reserva` horneado; el `<script type="module">` del bundle SIN `async`; 0 `<link rel="preload"
as="image">`.

**Escritorio 1280×800, `no-preference`:**

- Lanzador 104×104 y pausa 32×32. La pausa carga con `aria-pressed="false"`.
- Las 13 piezas animadas están en `running` y el robot se mueve.
- **Pausa:** las 13 pasan a `paused` y los fotogramas se quedan IDÉNTICOS durante 1,2 s (congela de verdad). Al reanudar vuelven a `running`.
- **Bocadillo:**
  - aparece a los 4 123 ms;
  - es la descripción del lanzador (`aria-describedby`) y NO es región viva;
  - su × mide 28×28;
  - Esc lo cierra sin mover el foco;
  - no vuelve en esa carga y sí al recargar.

**Diálogo (1280×800):**

- `<dialog>` `:modal`. El foco inicial cae en «Uñas», no en el hilo. Nombre accesible «Reserva con Nailbot» (`h2`).
- Panel dentro de la ventana. El backdrop cubre la cabecera sticky (top layer) y deja el lanzador detrás. El robot sigue animado tras el backdrop (caso límite 9) y la pausa queda inerte.
- Fondo inerte: 20 Tab y el foco nunca sale del diálogo. Un clic en el backdrop no cierra.
- **Guion por teclado.** El foco va al primer control de cada paso: «Entre semana», el campo tras «Un sábado» y el enlace final tras el nombre. Hay foco VISIBLE en el chip (3 px `--border-interactive`), en el campo y en el enlace. La regla del sábado sale con el dato real («10:00 a 14:00»).
- **Enlace final:**
  - host `wa.me`: es la única verificación posible (A-10);
  - ruta `/34625223366`;
  - mensaje EXACTO con nombre y sin nombre;
  - sin `target`;
  - el aviso de capa 1 es su descripción.
- **Árbol de accesibilidad** (`ariaSnapshot`): `dialog "Reserva con Nailbot"` > `heading [level=2]`, `log "Conversación con Nailbot"` y `link "Enviar la reserva por WhatsApp"`.
- **Cierre y reapertura:**
  - Esc con tecla real lo cierra y el foco VUELVE al lanzador;
  - al reabrir, la conversación se conserva (8 burbujas);
  - «Cerrar el chat» mide 36×36 y devuelve el foco al lanzador.

**Movimiento reducido:**

- **En frío** (`reducedMotion: 'reduce'`): sin control de pausa, 0 animaciones y pose FINAL visible (las 8 piezas rojas con opacidad 1). ←/→ con el panel abierto NO mueven los carruseles; el control positivo, sin el panel, sí los mueve.
- **En caliente:** al activar `reduce`, la pausa desaparece, el foco que estaba en ella pasa al lanzador y hay 0 animaciones. Al retirarlo NO se reanuda: la pausa reaparece PULSADA y las 13 piezas quedan `paused` y congeladas en el fotograma 0, consecuencia aceptada de HS-8. Pulsar la pausa reanuda.

**Móvil 320×640 (táctil):**

- Sin desborde horizontal. Lanzador 76×76, pausa 32×32 y × del bocadillo 28×28. El bocadillo queda dentro de la pantalla.
- El panel ocupa la pantalla completa (320×640) sin desbordar. «Cerrar el chat» queda dentro, en 272..308 × 12..48, y el título no se monta sobre él.
- En `#reserva`, un nombre de 300 caracteres sin espacios no desborda la página. Burbujas, aviso y enlace quedan dentro del chat, y el nombre se interpola ENTERO.

**F110 (SC 2.4.11, «not entirely hidden»), bocadillo visible y midiendo tras asentarse el desplazamiento suave (`scroll-behavior: smooth`):**

| Ancho    | Sentido          | Controles | Totalmente tapados | Parcialmente por el robot                                                          |
| -------- | ---------------- | --------- | ------------------ | ---------------------------------------------------------------------------------- |
| 320×640  | adelante / atrás | 114 / 113 | **0 / 0**          | «Ver servicios», «¿Cómo pido cita?», «@nailslash.studio_»: 5 de 49 puntos cada uno |
| 390×844  | adelante / atrás | 114 / 113 | **0 / 0**          | «Reservar oferta» 7/49, «¿Hay dónde aparcar?» 4/49                                 |
| 1280×800 | adelante / atrás | 120 / 119 | **0 / 0**          | ninguno                                                                            |

El último enlace del pie («Facebook») medido aparte a los 1,8 s del Shift+Tab: **0 de 49 puntos tapados** en
los tres anchos → NO hace falta relleno en `.pie` (HS-10 b). Lección de método: medir durante el
desplazamiento suave da falsos «totalmente tapado» (una primera pasada los dio); hay que esperar a que
`scrollY` se estabilice.

**Menú móvil en apaisado (740×360):** el menú desplegado (7 enlaces) no se cruza con el robot.

**Contraste REAL** (color computado sobre el fondo pintado; HS-5 b):

- el subtítulo sale a **4,86:1**, `--accent-dark` sobre `--accent-soft`;
- la leyenda y el aviso salen a **6,93:1**, `--muted` sobre `--surface`.

Son los pares que fija @s13 por bytes.

**Avatar de la cabecera del chat:** quieto (0 animaciones, sin `data-animacion`), `aria-hidden="true"`,
46×46 y encuadrado a la cara (captura revisada).

## 4. El caso previsto por el contrato: foco inicial al REABRIR con el hilo desbordado

`features/nailbot_flotante.feature` (lista EN VIVO): «OJO [I]: Chrome hace enfocables por teclado los
contenedores con scroll sin hijos enfocables; si el foco inicial cayera en el hilo, anotarlo y decidirlo».

**Medido (Chromium 141):** al abrir el panel, el foco inicial cae en el primer control mientras el hilo NO
desborda: 376 px de contenido en una caja de 376. En cuanto el hilo desborda (435/376 tras la franja y 596/376
al final), el foco inicial del `<dialog>` cae en el hilo (`role="log"`, sin `tabindex`), y un Tab lo lleva al
siguiente control, el enlace final. Es el comportamiento documentado por Chrome: los contenedores con
scroll y sin hijos enfocables son enfocables por teclado desde Chrome 130/132
([Keyboard focusable scrollers — Chrome for Developers](https://developer.chrome.com/blog/keyboard-focusable-scrollers),
[Chrome Platform Status](https://chromestatus.com/feature/5231964663578624)). Las páginas oficiales se
consultaron por búsqueda: el proxy de la sesión bloquea su descarga directa.

**Decisión del lead: se ACEPTA y no se cambia el código.**

- HS-12 prohíbe fijar el foco inicial con `autofocus`.
- El hilo es el primer elemento del diálogo en el orden del DOM (SC 2.4.3). Llegar a él es lo que permite desplazar el historial con el teclado (SC 2.1.1).
- `tabindex="-1"` en el hilo quitaría justo ese acceso.
- El siguiente control está a un Tab.

## 5. Lo que NO se ha podido verificar aquí (pendiente para el móvil real del humano)

- Lector de pantalla real: NVDA + Chrome y VoiceOver iOS. Qué anuncia el `role="log"` en cada turno y cómo nombra «💅» y «✨». Aquí solo se comprobó el árbol de accesibilidad que expone Chromium.
- El enlace final abierto en Android, iOS y WhatsApp Web, con y sin nombre. El host, la ruta y el texto EXACTO sí se verificaron.
- El gesto «atrás» de Android con el panel abierto.
- El área segura de iOS (indicador de inicio, apaisado con muesca).
