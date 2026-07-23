# Brief de diseño — Galería «Nuestros trabajos» → carrusel coverflow 3D en domo

> Síntesis del `craftsman_lead` sobre cuatro informes de reconocimiento (CSS 3D contra la spec del
> W3C, accesibilidad contra el APG y WCAG 2.2, auditoría de las cinco puertas del repo, y arte previo
> de Swiper). Los informes crudos viven en el scratchpad de la sesión; **este fichero es la fuente de
> verdad para `gherkin_author` y `tdd_craftsman`.**
>
> Fecha: 2026-07-22. Rama: `feat/galeria-coverflow-3d` (desde `origin/main` = 62df6ae).
> Línea base medida antes de tocar nada: **956 tests verdes en 33 ficheros**, `pnpm build` exit 0 con
> las cinco puertas.

---

## 1. Decisiones cerradas por el cliente (entrada, NO se cuestionan)

Pablo las eligió por `AskUserQuestion` el 2026-07-22:

1. **Silueta: DOMO (∩).** La tarjeta central se ELEVA; las laterales CAEN progresivamente. Las
   laterales llevan además `rotateY` hacia dentro, escala menor, opacidad menor y `translateZ` al fondo.
2. **Autoplay: 4 s por foto**, con transición de **0,8 s** y curva orgánica.
3. **Móvil: se mantiene el 3D pero SUAVIZADO** (menos giro, menos separación) y **asomando las vecinas**.
4. **Bucle infinito** por el camino corto.
5. Se conservan las flechas Anterior/Siguiente y **se añaden indicadores (puntos) clicables**.
6. Se conserva la paleta y el lenguaje visual actual.

Y dos consecuencias que NO estaban en el encargo y son obligatorias (§8):

7. **Botón de pausa/reanudar persistente y visible** — WCAG 2.2 SC 2.2.2, Nivel A. Bloqueante.
8. **Bajo `prefers-reduced-motion: reduce` el carrusel arranca PAUSADO** y sin transiciones.

---

## 2. Arquitectura — ficheros

| Fichero | Acción | Por qué |
|---|---|---|
| `src/components/galeria-logica.ts` | **NUEVO** | Toda la decisión de valor, PURA y con dependencias inyectadas. Obligatorio por `react-refresh/only-export-components` (`eslint.config.js:24`; el repo exige 0 warnings) y porque es lo único que Stryker puede morder. Patrón: `equipo-logica.ts`, `reserva-logica.ts`. |
| `src/components/Galeria.tsx` | reescribir | Solo CABLEA la lógica pura + JSX + ARIA. |
| `src/components/galeria.module.scss` | reescribir | Toda la estética (magnitudes del arco, perspectiva, media queries). |
| `src/components/galeria.test.tsx` | ampliar | Los 7 tests actuales se CONSERVAN intactos; se añaden los del contrato nuevo. |
| `src/components/galeria-estilos.test.ts` | **NUEVO** | Lee los BYTES del `.scss` (Stryker no ve SCSS). Patrón: `hero-estilos.test.ts`, `equipo-estilos.test.ts`. |
| `stryker.config.json` | añadir 2 rutas | `Galeria.tsx` y `galeria-logica.ts` entran en `mutate`. |
| `features/galeria_carrusel.feature` | reescribir | El borrador actual solo tiene @s1 (posición) y está obsoleto. |

**PROHIBIDO:** crear ningún `*-horneado.test.*` nuevo (7 builds reales ya por corrida; ver §10).

---

## 3. El núcleo PURO y MUTABLE (`galeria-logica.ts`)

Todo PURO, sin `Date.now()`, sin `window`, sin `matchMedia` dentro. Dependencias INYECTADAS.

```ts
/** Distancia circular CON SIGNO por el camino corto. n=6 ⇒ rango [-2, +3]. */
export function distanciaCircular(indice: number, activo: number, total: number): number

/** El índice que resulta de avanzar `pasos` (puede ser negativo), con envoltura. */
export function indiceCircular(indice: number, total: number): number

/** La CLAVE de posición, patrón `claveBurbuja` de reserva-logica.ts. */
export type ClaveDistancia = '0' | '1' | '2' | '3'
export function claveDistancia(distancia: number): ClaveDistancia

/** El signo del desplazamiento: -1 (izquierda), 0 (centro), +1 (derecha). */
export function signoDe(distancia: number): -1 | 0 | 1

/** La capa de pintado. DESCENDENTE con la distancia y SIEMPRE POSITIVA. */
export function capaDe(distancia: number, total: number): number

/** «3 de 6» — la etiqueta accesible de la diapositiva (APG). */
export function etiquetaDeDiapositiva(indice: number, total: number): string

/** ¿La rotación debe estar corriendo AHORA? Todo inyectado. */
export function debeRotar(estado: {
  readonly pausadoPorElUsuario: boolean
  readonly raton: boolean
  readonly foco: boolean
  readonly arranqueExplicito: boolean
}): boolean

/** El valor de aria-live del contenedor de diapositivas (APG). */
export function vozDeLaPista(rotando: boolean, foco: boolean): 'off' | 'polite'

/** La etiqueta del control de rotación, que CAMBIA con el estado (APG). */
export function etiquetaDeRotacion(rotando: boolean): string

/** El gesto de arrastre → pasos a avanzar. Umbral INYECTADO. */
export function pasosDelArrastre(desplazamientoX: number, umbral: number): -1 | 0 | 1

/** Constantes exportadas para que sean mutables y aseverables. */
export const MILISEGUNDOS_POR_FOTO = 4000
export const UMBRAL_DE_ARRASTRE = 48
```

### Fronteras que los tests DEBEN morder

- **`distanciaCircular`** — la función con más mutantes vivos potenciales (`%`, `+`, `-`, `>`, `/`).
  - El **doble módulo NO es decorativo**: en JS `%` es *resto* y conserva el signo del dividendo.
    Medido: `(-4) % 6 === -4`, mientras `(((-4) % 6) + 6) % 6 === 2`. Con un solo `%` el carrusel se
    rompe en cuanto `i < a`. **Hay que testear el caso `i < a` explícitamente.**
  - **El empate con n PAR (=6): decisión arbitraria que hay que documentar y testear.** La foto
    opuesta está a 3 pasos por los dos lados. Con `d > n/2` el rango es **[-2, +3]** y la opuesta
    entra **por la derecha (+3)**; con `d >= n/2` sería [-3, +2] y entraría por la izquierda.
    **CONVENCIÓN ELEGIDA: `>` ⇒ rango [-2, +3]**, coherente con un autoplay que avanza +1.
- **`capaDe`** debe ser **siempre positiva**: un `z-index` negativo pinta la tarjeta *por detrás* del
  fondo del contenedor y la hace desaparecer (gotcha real de Swiper, que genera −1 y −2).
- **`debeRotar`**: el `arranqueExplicito` GANA sobre ratón y foco (literal APG-E1: *«If a user
  activates the rotation control button to start rotation it is assumed the user wants auto-rotation
  to start immediately, so focus and/or hover states within the carousel for pausing rotation are
  ignored»*). Y `pausadoPorElUsuario` gana sobre todo.

### Anti-tautología

Los tests **no importan** la tabla de parámetros ni las constantes como valor esperado. Se comprueban
**invariantes**: exactamente una tarjeta a distancia 0; `|distancia| ≤ 3` siempre; avanzar 6 veces
vuelve al inicio; la opuesta sale `+3` y no `−3`; `capaDe` estrictamente decreciente y > 0.

---

## 4. Reparto TypeScript / SCSS

| Vive en | Qué | Vigilado por |
|---|---|---|
| **TypeScript** (`galeria-logica.ts`) | distancia con signo, signo, clave de distancia, capa (z-index), etiquetas ARIA, predicado de rotación, cadencia, umbral de arrastre | **Stryker al 100 %** |
| **SCSS** (`galeria.module.scss`) | perspectiva, y las MAGNITUDES por distancia (`--x`, `--y`, `--z`, `--giro`, `--escala`, `--opacidad`), la curva, el `@media` de móvil y el de `prefers-reduced-motion` | **`galeria-estilos.test.ts`**, que lee los bytes (Stryker no ve SCSS) |

**El puente entre los dos**: el componente escribe en cada tarjeta
`style={{ '--s': signo, zIndex: capa }}` y `data-distancia={claveDistancia(d)}`.
El SCSS lee `[data-distancia='N']` para fijar las magnitudes.

Esto está **medido** como observable en los dos entornos que importan:
`renderToString` emite `style="--s:1"` y jsdom devuelve `el.style.getPropertyValue('--s') === "1"`.
Precedente de `style` inline: `PruebaColor.tsx:35,52`. Precedente de `data-*`: `Reserva.tsx:136`.

**Por qué NO `className` condicional:** con `css: false` (`vitest.config.ts:17`) `estilos.x` es
`undefined`, así que las dos ramas producen el MISMO DOM y el mutante que invierte la condición es
**inmatable**. Es la razón de ser de `reserva-logica.ts`.

---

## 5. Tabla de transforms

Una **única** declaración de `transform` en `.tarjeta`, parametrizada. Nunca transforms distintos por
estado: si las dos listas no tienen las mismas funciones en el mismo orden, el navegador cae en
descomposición de matriz + Slerp de cuaterniones y la trayectoria deja de ser la diseñada.

```scss
.tarjeta {
  --s: 0; --x: 0%; --y: 0px; --z: 0px; --giro: 0deg; --escala: 1; --opacidad: 1;
  transform:
    translate3d(calc(var(--s, 0) * var(--x, 0%)), var(--y, 0px), var(--z, 0px))
    rotateY(calc(var(--s, 0) * var(--giro, 0deg)))
    scale(var(--escala, 1));
}
```

### Escritorio (`perspective: 1200px`, tarjeta 320px)

| distancia | `--x` | `--y` | `--z` | `--giro` | `--escala` | `--opacidad` | z-index |
|---|---|---|---|---|---|---|---|
| **0** | 0% | **−18px** ↑ | 0 | 0° | **1.06** | 1 | 40 |
| **1** | 72% | +26px ↓ | −140px | −34° | 0.88 | 0.72 | 30 |
| **2** | 128% | +84px ↓ | −300px | −48° | 0.74 | 0.38 | 20 |
| **3** | 150% | +96px | −380px | −52° | 0.70 | **0** | 10 |

`--y` negativo sube (centro elevado) y positivo baja (laterales caen): eso es el domo ∩.
El `--giro` va NEGATIVO y se multiplica por `--s`, para que las tarjetas giren **hacia dentro**.

**El domo es deliberadamente APLANADO y hay que decirlo:** un domo circular exacto exigiría que la
caída creciera con el cuadrado de la distancia (~176 px en distancia 2); eso echaría la tarjeta fuera
del encuadre. La razón de caída elegida es ≈2,06 (sub-cuadrática). Es un compromiso, no un círculo.
Palanca si Pablo lo quiere más marcado: subir `--y` de la distancia 2 de 84 px a ~110 px.

**Los ángulos son saturantes (34→48), no lineales.** Los defectos de Swiper (`rotate: 50`) son
lineales y a distancia 2 dan 100°: la tarjeta pasa de perfil y se ve **espejada por detrás**. El
consenso comunitario para coverflow es ±45°. Manteniendo `|giro| ≤ 52°` nunca se cruzan los 90° y
`backface-visibility` deja de ser un problema (se pone igual, como seguro barato).

### Móvil (`@media (max-width: 640px)`, `perspective: 900px`, tarjeta ≈62vw)

| distancia | `--x` | `--y` | `--z` | `--giro` | `--escala` | `--opacidad` |
|---|---|---|---|---|---|---|
| **0** | 0% | −8px | 0 | 0° | 1.03 | 1 |
| **1** | 72% | +14px | −80px | −18° | 0.90 | 0.60 |
| **2** | 122% | +38px | −160px | −26° | 0.80 | 0.18 |
| **3** | 140% | +44px | −200px | −28° | 0.78 | 0 |

`640px` es el breakpoint que YA usa el repo (`_demo.scss:52`). No inventar otro.

### La curva

`transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)`

Arranque casi instantáneo y planeo largo: a 0,8 s es la que mejor lee como orgánica.
⚠️ `cubic-bezier` exige **x1 y x2 en [0,1]**; fuera de rango la declaración entera se descarta **en
silencio** y te quedas con `ease` sin saber por qué. (`y` sí puede salirse: es lo que da el rebote.)

---

## 6. Las trampas del CSS 3D — la sección más importante

Ordenadas por gravedad. Cada una hunde la implementación en silencio.

1. **`transform: none` para la central: PROHIBIDO.** Cambia la longitud de la lista de funciones
   (⇒ interpolación por matriz) **y** destruye el contexto de apilamiento, con lo que el `z-index`
   deja de aplicar. Escribe siempre la lista completa con `--s: 0`.
2. **`--s` ausente o vacío ⇒ `transform` cae a su valor INICIAL `none`** (regla de *invalid at
   computed-value time*), no a la declaración anterior de la cascada. Resultado: las seis tarjetas
   apiladas en el centro, **sin error en consola**. **Fallback `var(--s, 0)` obligatorio** en todas.
3. **`opacity` NUNCA en `.tarjeta`.** Es *grouping property* de la spec. Va en un hijo `.lienzo`.
4. **`overflow: hidden` NUNCA en el elemento que lleva `perspective`.** Va en un `.marco` ancestro.
   (`overflow: clip` NO es escapatoria: el issue csswg-drafts#6374 lleva abierto desde 2021.)
5. **NO declarar `transform-style: preserve-3d` en el escenario.** Con `preserve-3d` el orden de
   pintado lo decide el algoritmo de Newell sobre la geometría y `z-index` solo ordena elementos
   **coplanares** — las laterales están rotadas, así que el arbitraje es geométrico y dependiente del
   motor. **Sin** `preserve-3d`, cada tarjeta crea contexto de apilamiento por su `transform` y el
   `z-index` es la autoridad, determinista en todos los navegadores. La `perspective` del padre sigue
   aplicando igual (spec §4.1.1: influye en el renderizado de sus hijos 3D-transformados, sin
   condicionarlo a `transform-style`). **Es una decisión deliberada, no un olvido.**
6. **`perspective` va en el contenedor como PROPIEDAD**, jamás `perspective()` dentro de la lista de
   transforms de la tarjeta: eso daría **seis puntos de fuga distintos**, uno por tarjeta, y son seis
   volteos independientes en vez de un coverflow.
7. **Orden de las funciones: traslaciones → `rotateY` → `scale`.**
   - `rotateY` ANTES de trasladar ⇒ anillo cilíndrico, no coverflow.
   - `scale` ANTES de trasladar ⇒ la matriz es `S·T` y **la separación queda multiplicada por la
     escala**, así que el abanico deriva durante toda la transición.
8. **La caída del domo necesita una función PAR de la distancia.** Se resuelve con `[data-distancia]`
   (que ya usa el valor absoluto) y no con `--s`, que es el signo.
9. **El salto del bucle.** Cada tarjeta hace exactamente UNA discontinuidad por vuelta: pasa de
   distancia **−2 a +3**. Si eso transiciona, la tarjeta **barre todo el escenario** de izquierda a
   derecha en 0,8 s. **Solución elegante y sin estado extra: `transition: none` en la tarjeta oculta**
   (`[data-distancia='3']`). Las transiciones se disparan leyendo la configuración del estado NUEVO:
   - entrar en oculta (−2 → +3): instantáneo, invisible. No hay barrido. ✓
   - salir de oculta (+3 → +2): sí transiciona, y +3 y +2 son **vecinas por la derecha**, así que es
     una aparición natural desde el borde derecho. ✓
   **Verificar este comportamiento EN VIVO en Chrome**, no darlo por bueno de memoria.
10. **Sombra con `box-shadow`, JAMÁS `filter: drop-shadow()`** — `filter` con cualquier valor distinto
    de `none` aplana el 3D.
11. **NO `will-change: transform`** en las seis tarjetas desde la hoja de estilos. MDN lo desaconseja
    expresamente («use it as a last resort», «excessive memory use … worse performance»).
12. **NO `content-visibility: auto`** en la sección: aplica contención de pintado ⇒ aplana.
13. **Nada enfocable dentro de las tarjetas.** Un focusable dentro de un `overflow: hidden` hace que
    el navegador desplace el contenedor al tabular y descoloca el carrusel.
14. **`calc()` con custom properties:** `número × ángulo → ángulo` y `número × longitud → longitud`
    son válidos. **`translateZ()` NO acepta porcentajes** (es `<length>` puro). Y los porcentajes de
    `translateX` se resuelven contra el **border-box de la propia tarjeta** — ventaja: la separación
    escala sola con el ancho.
15. **No registrar `--s` con `@property`.** La volvería interpolable por sí misma y tendrías dos
    motores animando lo mismo. `--s` cambia de golpe; la `transition` sobre `transform` interpola.

---

## 7. Cableado ARIA (variante **Grouped** del APG)

`{n}` = índice 1-based, `N = 6`.

| Elemento | Atributo | Valor / por estado |
|---|---|---|
| `div` raíz del carrusel | `role` | `"group"` — **NO `region`**: el bloque es no navegable por decisión ya escrita en `Galeria.tsx:12` |
| | `aria-roledescription` | `"carrusel"` (localizado; la página es `lang="es"`) |
| | `aria-labelledby` | `"galeria-titulo"` → el `<h2>` «Nuestros trabajos» (el nombre **no** lleva la palabra «carrusel») |
| **Control de rotación** — PRIMER tabulable dentro del carrusel | `type` | `"button"` |
| | `aria-label` | rotando → `"Parar la reproducción automática"` · pausado → `"Iniciar la reproducción automática"` |
| | `aria-pressed` | **AUSENTE SIEMPRE.** Literal APG: *«since the label changes, the rotation control does not have any states, e.g., `aria-pressed`, specified»* |
| | `data-estado` | `"rotando"` \| `"pausado"` (gancho de test) |
| Botones Anterior / Siguiente | `aria-label` | `"Anterior"` / `"Siguiente"` — **literales, no negociables** (`galeria.test.tsx:91-92`) |
| | `aria-controls` | `"galeria-pista"` |
| Contenedor de diapositivas | `id` | `"galeria-pista"` |
| | `aria-live` | `(rotando && !foco) ? "off" : "polite"` |
| | `aria-atomic` | `"false"` |
| Cada diapositiva (×6) | `role` | `"group"` |
| | `aria-roledescription` | `"diapositiva"` |
| | `aria-label` | `"{n} de 6"` (el `alt` descriptivo ya lo aporta el `<img>` hijo; duplicarlo lo haría sonar dos veces) |
| | `aria-hidden` | **NUNCA.** Ver §7-bis |
| | `data-distancia` | `"0"`\|`"1"`\|`"2"`\|`"3"` |
| Envoltorio de puntos | `role` / `aria-label` | `"group"` / `"Elegir la foto que se muestra"` |
| Cada punto (×6) | `aria-label` | `"Ver la foto {n} de 6"` |
| | `aria-disabled` | `"true"` **solo en el actual** |
| | `disabled` (HTML) | **NUNCA** — sacaría el punto del orden de tabulación; el APG prefiere `aria-disabled` justo por eso |

### Orden del DOM — no negociable

```
1. control de rotación   ← APG: «first element in the Tab sequence inside the carousel»
2. Anterior   3. Siguiente
4. div#galeria-pista → 6 × diapositiva, SIEMPRE en orden 1..6
5. grupo de puntos
6. nota honesta
```

El arco visual se construye **solo** con `transform` / `z-index`. **El DOM jamás se reordena** — es lo
que sostiene SC 2.4.3 (Focus Order).

### §7-bis — Por qué las laterales NO llevan `aria-hidden`

Son contenido **perceptible** (una foto al 38 % se ve). ARIA exige que quien oculte contenido visible
*«MUST ensure that identical or equivalent meaning and functionality is exposed»* — y aquí no lo está
en ningún otro sitio. Además el APG avisa expresamente de que *«the screen reader experience can be
confusing and disorienting if slides that are not visible on screen are incorrectly hidden»*, y un
`aria-label="3 de 6"` sobre un árbol donde solo existe 1 foto es una contradicción activa.
Y como efecto colateral verificable: `aria-hidden` rompería `galeria.test.tsx:32-38`, que busca las 6
`<img>` por rol. **La decisión correcta por accesibilidad es también la que no rompe la suite.**

---

## 8. Cumplimiento WCAG — con las tres capas separadas

El repo castiga la atribución normativa falsa. **(N)** = letra de la norma · **(T)** = técnica
suficiente / implementación de referencia · **(P)** = criterio de proyecto.

| SC | Nivel | ¿Aplica? | Veredicto |
|---|---|---|---|
| **2.2.2** Pause, Stop, Hide | **A** | **SÍ — BLOQUEANTE** | Exige un control **persistente y visible**. El Understanding es literal: *«Having an animation stop only so long as a user has focus on it … would not be considered a "mechanism for the user to pause"»*. Y **la excepción de 5 s NO salva**: un carrusel que auto-avanza es *auto-updating*, y *«there is no five second exception for auto-updating»*. Además es de **No-Interferencia**: un fallo aquí contamina la conformidad de TODA la página. **(N)** |
| 2.3.1 Three Flashes | A | Sí (No-Interferencia) | Se satisface trivialmente: 0,25 Hz frente al umbral de 3/s. **(N)** |
| 2.3.3 Animation from Interactions | **AAA** | Parcial | Cubre las transiciones **por clic**, NO el autoplay (que no está *triggered by interaction*). Es AAA ⇒ cumplirlo es **(P)**. **Prohibido citarlo como obligación AA.** |
| 1.4.13 Content on Hover/Focus | AA | **NO** | Pausar no revela contenido adicional. Aplicaría si se añadiera un pie de foto al hover. **(N)** |
| 2.1.1 Keyboard | A | SÍ | Cubierto con `<button>` nativos. El arrastre táctil debe tener equivalente por teclado: las flechas lo son. **(N)** |
| 2.1.2 No Keyboard Trap | A | Sí, riesgo nulo | **Precisión:** una tarjeta oculta pero tabulable NO es una trampa de teclado (con `Tab` se sale). Eso pertenece a 2.4.3/2.4.7/2.4.11. Atribuirlo a 2.1.2 es el error clásico. **(N)** |
| 2.4.3 Focus Order | A | SÍ | El orden lo da el DOM (1..6). ⚠️ «el control de rotación va primero» es **(T)** del APG, **NO** la letra de 2.4.3. |
| 2.4.7 Focus Visible | AA | SÍ | `overflow:hidden` + `transform` + `opacity` son los tres asesinos del anillo de foco ⇒ flechas, puntos y botón de rotación van **FUERA** del escenario 3D. **(N)** |
| 2.4.11 Focus Not Obscured (Min) | AA | SÍ | Palabra clave **«entirely»**. La central elevada podría tapar del todo un control que viviera en una lateral ⇒ por eso no hay ninguno. Restricción a preservar. **(N)** |
| **1.4.11** Non-text Contrast | AA | SÍ, **a los puntos** | ⚠️ **El fallo AA más probable de todo el componente.** El texto dice *«components **and states**»*: la diferencia visual entre punto actual y punto disponible **es un estado** ⇒ ≥ **3:1**. Distinguirlos solo por `opacity: .4` vs `1` del mismo rosa **FALLA**. Usar dos tokens distintos y comprobarlo. Las **fotos NO** entran: no son *«parts of graphics required to understand the content»*, así que su opacidad lateral es **(P)**. |
| 4.1.2 Name, Role, Value | A | SÍ | Lo cubre la tabla §7. |

### Arranque pausado bajo `prefers-reduced-motion` — atribución honesta

Es la **implementación de referencia del APG (T)** — literal: *«If operating system preferences have
been set for reduced motion or disabling animations, the auto-rotation is initially paused»* — y
**criterio de proyecto (P)** por precedente firme del repo (`hero.module.scss:169`,
`boton-whatsapp.module.scss:52`, aseverados por regex). **NO es la letra de ningún SC A/AA**: 2.2.2
exige *un mecanismo*, no honrar la preferencia del SO. No lo cites como requisito AA.

MDN describe además, literalmente, este componente: *«Animations such as scaling or panning large
objects can be vestibular motion triggers.»* Un coverflow es `scale` + `translateZ` + `rotateY` sobre
tarjetas grandes: caso de manual.

### Reglas de pausa y reanudación (decisión de proyecto, DEBE ir al Gherkin)

El APG **se contradice consigo mismo** sobre si el foco reanuda: el patrón y el ejemplo 2 dicen que
no; el ejemplo 1 y el código de **ambas** implementaciones de referencia dicen que sí. Se elige la
lectura **conservadora** (2 fuentes contra 1, y es el escenario que 2.2.2 castiga):

| Disparador | ¿Para? | ¿Reanuda sola al cesar? |
|---|---|---|
| Ratón encima | Sí | **SÍ**, al salir |
| Foco de teclado dentro | Sí | **NO** — solo con el botón |
| Botón → «Parar» | Sí | **NO**, nunca |
| Botón → «Iniciar» | — | Arranca ya, **ignorando** ratón y foco |
| `prefers-reduced-motion: reduce` | Arranca pausado | El usuario **puede** arrancarlo: no se le retira la función |

---

## 9. Lo que NO se puede romper (puertas y tests), con ruta:línea

| Riesgo | Dónde |
|---|---|
| **6 `<img>` exactas, mismos `alt`, mismo orden, `width=800`, `height=600`, `loading="lazy"`, `src` con el nombre de fichero** ⇒ **CERO clones de diapositiva** | `galeria.test.tsx:15-63` |
| Botones con nombre accesible literal **«Anterior»** y **«Siguiente»**, y `getByRole` es **singular** ⇒ no puede haber dos con ese nombre | `galeria.test.tsx:88-93` |
| La **nota literal** de honestidad, carácter a carácter (con el `·` y los acentos) | `galeria.test.tsx:78-84` |
| La home debe seguir teniendo **exactamente 1 `<h1>`** | `home.test.tsx:47` · `src/lib/puerta-cascaron.ts:489-493` |
| 🔴 Convertirlo en `<section aria-labelledby>` **rompe DOS puertas**: se volvería «sección navegable» y la nav no la enlaza (`REGLA_INALCANZABLE`) | `puerta-cascaron.ts:505-520` · `puerta-anclas.ts:132-142` |
| 🔴 Usar `<nav>` o `<a href="#…">` para los puntos ⇒ entran en la puerta de anclas como anclas de nav | `puerta-anclas.ts:34,46-60` |
| 🔴 `url(https://…)` o `@import url(...)` en el SCSS ⇒ rompe la puerta de terceros. Y el conjunto de `@font-face` es EXACTO (6): añadir o quitar uno rompe el build | `src/lib/terceros.ts:167,173` · `tools/puerta-terceros.ts:56-63` |
| Patrones de placeholder prohibidos, insensibles a mayúsculas **y acentos**: `IMAGEN TEMPORAL`, `Plantilla de demostración`, `600123456`, `hola@nailslashstudio.com`, `Calle de la Belleza`, `ph-woman` | `src/lib/placeholders.ts:27-34` |
| La galería vive **dentro de `<main>`**; no moverla | `boton-whatsapp-montaje.test.tsx:50-63` |
| La puerta de contraste **solo lee `_tokens.scss` y solo evalúa 18 pares escritos a mano**: un color nuevo en `galeria.module.scss` es INVISIBLE para ella. La red es el test de estilos. **⇒ no inventar color; usar tokens** | `src/lib/puerta-contraste.ts:208-303,306,316` |

### Trampas del entorno (MEDIDAS, no supuestas)

- 🔴 **`setInterval` NO devuelve `number`** con `@types/node` cargado: `error TS2322: Type 'Timeout' is
  not assignable to type 'number'`. **Usar `useRef<ReturnType<typeof setInterval> | null>(null)`.**
- 🔴 **jsdom 25.0.1 no implementa**: `window.matchMedia`, `Element.scrollTo/scrollBy/scrollIntoView`,
  `PointerEvent`, `setPointerCapture`, `IntersectionObserver`, `ResizeObserver`.
  ⇒ toda llamada a `matchMedia` va **guardada** (`typeof window.matchMedia === 'function'`) y
  stubeada en tests con `vi.stubGlobal` (precedente: `reserva.test.tsx:52,539`).
- `tsconfig` tiene `noUnusedLocals` y `noUnusedParameters` ⇒ cualquier variable sobrante rompe el typecheck.
- `react-hooks/rules-of-hooks` es **error**: nada de hooks dentro de `if`, del `map` de las
  diapositivas, ni del callback del `setInterval`. Usar el **updater funcional** `setActivo(i => …)`
  para que las deps queden `[]` sin warning de `exhaustive-deps`.
- 🔴 **`pnpm format:check` YA está en rojo** (158 ficheros, pre-existente, NO es puerta). **Prohibido
  `pnpm format`**: reformatearía ficheros ajenos. Solo `npx prettier --write src/components/galeria*`.
- Prettier: **sin `;`**, comillas simples, `trailingComma: all`, `printWidth: 100`, `endOfLine: lf`.

### Tokens a reutilizar (NO inventar color)

No existe token de sombra ni de radio. El idioma establecido es literal:
- Sombra de elevación fuerte: `0 30px 60px color-mix(in srgb, var(--accent) 14%, transparent)`
  (la de `reserva.module.scss:38`, la más fuerte que ya existe).
- Radio de tarjeta: **`20px`** (el que ya usa `galeria.module.scss:46`). Círculos: `50%`.
- Borde de control: **`--border-interactive`**, nunca `--line` (que es separador decorativo).
- Texto/relleno de acento: **`--accent-dark`**, NUNCA `--accent` (4,37:1, falla AA).
- Breakpoint: **640px**, el que ya existe.

---

## 10. Estrategia de test

| Qué | Cómo | Por qué |
|---|---|---|
| Las 6 fotos horneadas, alts, orden, dimensiones, nota, botones | `renderToString(<Galeria/>)` + regex | Es lo que YA hacen los 7 tests actuales. **Se conservan sin tocar.** |
| ARIA (roles, `aria-roledescription`, etiquetas, `aria-live`, `aria-disabled`) | `render` + `screen.getByRole` / `toHaveAttribute` | El árbol de accesibilidad es lo que importa |
| La lógica pura (distancias, signo, capa, predicado de rotación, etiquetas) | tests unitarios directos sobre `galeria-logica.ts` | **Es lo único que Stryker muerde**. Fronteras explícitas |
| Autoplay (avanza a los 4 s, para al pausar, para con el ratón, no reanuda tras el foco) | `vi.useFakeTimers()` + `act` | Determinista |
| `prefers-reduced-motion` arranca pausado | `vi.stubGlobal('matchMedia', …)` | jsdom no lo trae |
| Perspectiva, magnitudes por distancia, curva, media queries, `transition:none` de la oculta y de reduced-motion | **`galeria-estilos.test.ts` leyendo los BYTES del `.scss`** | Stryker no ve SCSS; es el patrón del repo (`hero-estilos.test.ts`) |

🔴 **PROHIBIDO crear un `galeria-horneado.test.ts`.** Ya hay 3 tests build-based que lanzan 7 builds
reales por corrida (`home-horneado`, `contacto-horneado`, `trampas-del-horneado`), y dos de ellos ya
aseveran `codigoSalida === 0` del build completo con las cinco puertas. Añadir otro sube el reloj sin
añadir información. Lo horneado se cubre con `renderToString`.

**Iterar con `pnpm exec vitest run <fichero>`** (segundos), no con `pnpm test` (≈9 min). La suite
completa se corre UNA vez al final, y el `pnpm build` lo lanza el lead.

---

## 11. Contradicciones entre informes — resueltas

1. **`transform-style: preserve-3d` ¿sí o no?** El informe de puertas lo daba por hecho en su
   checklist; el informe de CSS 3D demuestra con la spec que **con** `preserve-3d` el orden de pintado
   lo decide Newell y `z-index` deja de mandar. **RESUELTO: NO se declara `preserve-3d`.** Gana el
   argumento citado de la spec: necesitamos que `z-index` sea determinista, y la `perspective` del
   padre funciona igual sin él.
2. **¿El foco reanuda el autoplay?** El APG se contradice consigo mismo (§8). **RESUELTO: no reanuda**
   (lectura conservadora, 2 fuentes contra 1, y es la que no roza SC 2.2.2). Queda escrito en el
   Gherkin para que el `judge` sepa qué esperar.
3. **`loading="lazy"` en las 6 fotos.** El informe de CSS 3D recomienda `eager` para las primeras
   (en un coverflow casi todas están en viewport y una carga diferida produce un salto a los 4 s).
   Pero `galeria.test.tsx:60` **exige `lazy` en las seis**. **RESUELTO: se conserva `lazy`.** Cambiarlo
   rompería un test verde de una decisión ya tomada; la mejora de carga es **deuda declarada**, no
   parte de este encargo.
4. **Arrastre táctil (swipe).** Al pasar de `scroll-snap` nativo a transforms se **pierde** el
   deslizamiento con el dedo que hoy da el navegador gratis. Se repone con Pointer Events, con la
   decisión en una función pura (`pasosDelArrastre`). ⚠️ **jsdom no implementa `PointerEvent`**, así
   que el cableado NO es testeable en jsdom: se cubre la función pura por test y **el gesto se
   verifica EN VIVO en Chrome**. Declarado honestamente, no fingido.
5. **`aria-atomic="false"`** está en la prosa del patrón APG pero **ausente del HTML de sus dos
   ejemplos** (verificado por grep). Se pone: es inocuo y blinda contra un ancestro que lo ponga a
   `true`.

---

## 12. Lo que este encargo NO hace (deuda declarada)

- **No mueve la galería antes de `#reserva`**, aunque `features/galeria_carrusel.feature:21-25` (@s1,
  borrador) lo pida: hoy va después por decisión explícita de Pablo (`home.tsx:119-122`). No se
  «arregla» por cuenta propia.
- **No cambia `loading="lazy"`** (ver §11.3).
- **No añade la galería a la nav** ni la convierte en sección navegable: rompería dos puertas.
- **No toca `_tokens.scss`** ni la matriz de contraste: los 18 pares siguen siendo 18.

## Enmienda 1 (2026-07-23) — contrato v2.1, tras el review del judge y la auditoría a11y

Ordenada por el lead a la salida de `progress/judge_galeria_carrusel.md` (hallazgo 7) y de
`progress/a11y_galeria_carrusel.md` (avisos 🟡/🔵). Los Then de @s1..@s18 NO cambian. Total: **19 escenarios**.

- **@s19 NUEVO — el arrastre deja de ser deuda**: se exige el CABLEADO de `onPointerDown`/`onPointerUp`
  en el marco llamando a `desplazar(pasosDelArrastre(Δx, UMBRAL_DE_ARRASTRE))` — frontera INCLUSIVA en
  48 px, izquierda→siguiente, derecha→anterior, bajo umbral nada. Semántica del clic FIJADA: el marco es
  el dueño del gesto y el clic de centrar de la tarjeta (@s18) solo actúa si Δx quedó bajo el umbral.
  En jsdom se despacha `new MouseEvent('pointerdown', {bubbles, clientX})` (React registra los pointer
  events por NOMBRE, no por clase); el gesto FÍSICO se verifica en vivo en Chrome.
- **@s12 ampliado**: la preferencia de movimiento se escucha EN CALIENTE (`addEventListener('change')`
  del MediaQueryList, en el mismo efecto, con limpieza al desmontar): `matches: true` pausa la rotación
  en curso; `matches: false` no toca nada (mata al mutante que pausa incondicionalmente). Aviso 🔵 eje 5.
- **@s15 ampliado**: la tarjeta oculta (`[data-distancia='3']`, opacidad 0) declara
  `pointer-events: none` — deja de capturar clics desde una franja invisible. Aviso 🔵 eje 6.
- **@s17 ampliado**: (N) SC 2.5.8 Target Size (AA, WCAG 2.2) — caja interactiva del punto ≥ 1.5rem
  (24 px) conservando el círculo visible de 0.75rem (el borde NO se recorta con `background-clip`:
  si se usa esa vía, el anillo va en pseudo-elemento). Aseverado por bytes. Aviso 🟡 eje 4.
- **Cabecera actualizada**: techo 18→19 (por orden del lead), el arrastre sale de «LO QUE ESTE CONTRATO
  NO HACE» y la nota [OJO] de @s18 remite a @s19 en vez de a la «verificación en vivo».

## Enmienda 2 (2026-07-23) — el gesto MEDIDO en Chrome real, y el rediseño por signo

- **Bug medido en vivo (CDP, Chrome real)**: el arrastre de @s19 no funcionaba — el press+movimiento
  sobre una `<img>` arranca el drag NATIVO de imagen y el `pointerup` jamás llega al marco (espía:
  solo se registró `pointerdown`). jsdom no puede verlo: los eventos a mano no disparan el drag nativo.
- **Contraprueba**: con `draggable=false` puesto en caliente, el MISMO gesto real mueve la foto y el
  `pointerup` llega. @s19 exige ahora `draggable="false"` en las seis `<img>` y `touch-action: pan-y`
  en la regla del marco (por bytes): en táctil, sin él, el navegador roba el gesto con `pointercancel`.
- **Rediseño (superviviente 153:10 de `progress/mutation_galeria_carrusel.md`)**: el retorno de
  `pasosDelArrastre` se deriva del signo (`-signoDe(desplazamientoX)`), sin comparador — misma conducta
  para |Δ| ≥ umbral con umbral > 0, y `pasosDelArrastre(0, 0)` devuelve 0, no una dirección arbitraria.
- La exclusión DOCUMENTADA de los 2 equivalentes de ese informe (86:62 y 124:6) es decisión del lead,
  con precedente `HOST_WHATSAPP` (`site.ts:72-73`, `// Stryker disable next-line all`).
