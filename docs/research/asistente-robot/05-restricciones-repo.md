# 05 — Restricciones del repo para el widget «asistente robot»

> Investigación de SOLO LECTURA (2026-09-27). Cada hecho lleva `fichero:línea`. Nada de `src/` se ha
> tocado. Objetivo: que el botón flotante con robot SVG + panel de chat guionizado + salida a
> WhatsApp (`waHref`) nazca sin romper las 5 puertas, la suite, ni la mutación al 100 %.

---

## 0. Resumen ejecutivo

- Las 5 puertas corren SOLO en `pnpm build` (`package.json:16`), sobre `dist/`. **Ninguna mira la
  posición** del widget: montar fuera de `<main>` es criterio estructural, no exigencia de puerta.
- Lo que las haría saltar: una `<section>` (cualquiera), un `<nav>` con `#anclas`, un segundo `<h1>`,
  un subrecurso EXTERNO, un literal de la lista negra en CUALQUIER fichero de `dist/` (incl. JS).
- La puerta de contraste es CIEGA a colores fuera de `MATRIZ_DE_USO`: un rojo decorativo no la
  despierta, pero tampoco lo protege. Añadir fila = tocar un literal (18) y su test ancla.
- Tests: `css:false` ⇒ nada de clases de CSS module en aserciones ni en ternarios de `className`;
  CSS por bytes; lo horneado con `renderToString`; **cero tests build-based nuevos**.
- Mutación: añadir cada `.tsx`/`.ts` nuevo a `mutate`; nunca un guard de fuente que prohíba `if (`/`?`
  en un fichero mutado (mató la mutación del botón de WhatsApp).
- Extraer el chat de `Reserva.tsx` es CARO (≥7 tests acoplados a su DOM/SCSS/bytes y un contrato que
  fija nombres de ficheros). Reutilizar sus funciones PURAS ya exportadas es gratis.

---

## 1. Las 5 puertas del build

Orden fijo en `package.json:16`: `vite-react-ssg build` → cascarón → placeholders → contraste →
terceros → anclas. Cada `tools/puerta-*.ts` es un «humilde» sin lógica; decide `src/lib/puerta-*.ts`
(testeado y mutado) — p. ej. `tools/puerta-cascaron.ts:7-8`, `tools/puerta-anclas.ts:8-9`.

| # | Puerta | Qué lee | Qué comprueba | Qué la dispararía con el widget |
|---|---|---|---|---|
| 1 | Cascarón (F-04) `src/lib/puerta-cascaron.ts` | Solo `*.html` de `dist/` (`tools/puerta-cascaron.ts:27,37-44`) | `lang="es"` único (`:462-464`); title/description/canónica SOLO en `<head>` (`:466-485`); **exactamente 1 `<h1>` en todo el HTML** (`:83-88`, `:490-494`); landmarks `main`,`nav`,`footer` presentes (`:94`, `:498-502`); **toda `<section>` con `aria-labelledby` a un `h1-h6` con id** (`:118-129`, `:506-521`); JSON-LD BeautySalon (`:414-446`); anti-404 de href internos `/…` (`:553-557`, `:582-625`); guarda «≥1 enlace» (`:836-845`) | Un `<h1>` en el panel; cualquier `<section>` sin `aria-labelledby` resoluble a heading (aunque esté `hidden`: es regex sobre bytes crudos, `:120`, `:508`); un `href="/ruta-inexistente"`. **No mira** `aside`, `dialog`, `role="dialog"`, ni `#anclas` ni externos |
| 2 | Placeholders (F-01) `src/lib/puerta.ts` + `placeholders.ts` | **TODOS los ficheros** de `dist/`, sin filtro de extensión — HTML, CSS, **JS**, binarios (`tools/puerta-placeholders.ts:23-27`; deuda declarada en `tools/puerta-terceros.ts:53-56`) | 6 patrones: `IMAGEN TEMPORAL`, `Plantilla de demostración`, `600123456` (normalizado: `+34 600 123 456`, `600-123-456`…), `hola@nailslashstudio.com`, `Calle de la Belleza`, `ph-woman` (`placeholders.ts:27-34`, `:45-48`); texto sin acentos ni caja (`:65-87`) | Cualquiera de esos literales en el guion del robot (va al bundle JS aunque el panel no se hornee), en un id/clase SVG (`ph-woman`) o en un comentario que acabe en CSS. La palabra «placeholder» **no** está vetada (`Reserva.tsx:153` ya usa `placeholder=`) |
| 3 | Contraste (F-03) `src/lib/puerta-contraste.ts` | SOLO `src/styles/_tokens.scss` (`:306`; `tools/puerta-contraste.ts:26`) | Recalcula los pares de `MATRIZ_DE_USO` (`:208-303`) contra 4,5:1 texto / 3:1 componente (`:61-68`); exige ≥ `MINIMO_DE_PARES = 18` evaluados (`:316`, `:398-405`) | **Nada del widget la dispara**: ignora los `.module.scss` y los tokens que no estén en la matriz. Solo saltaría si se añade una fila que no cumpla, o si se añade una fila y NO se sube el 18 (no rompe) / se BORRA una (rompe) |
| 4 | Terceros (F-05) `src/lib/puerta-terceros.ts` + `terceros.ts` | Solo `*.html` y `*.css` (`tools/puerta-terceros.ts:58,63-77`); el JS NO se mira (hueco declarado `:47-51`) | Subrecursos a origen externo: `script/img/source/iframe/embed/object/video/audio/track/input[src]`, `srcset`, `svg <use href>` (`terceros.ts:67-79`), `<link rel=stylesheet|icon|preload|…|preconnect|dns-prefetch>` (`:92`, `:102`), `url()`/`@import` en CSS (`:167-173`); `<base href>` (`:230-235`). Mismo origen, relativos, `#x` y `data:` pasan (`:290-303`). Exige exactamente los 6 pares `@font-face` (`puerta-terceros.ts:56-63`, `:232-249`) | `<img src="https://…">`, `background: url(https://…)`, una fuente nueva o un peso nuevo (`sobra el par`), un `<link rel=preconnect>`. **No** la dispara un `<a href="https://wa.me/…">` (hiperenlace, no subrecurso) ni un `<img src>` propio |
| 5 | Anclas vivas (F-06) `src/lib/puerta-anclas.ts` | Solo `*.html` (`tools/puerta-anclas.ts:30-37`) | Todo `href="#id"` **dentro de un `<nav>`** resuelve a un `id` de la página (`:46-60`, `:121-130`) E igualdad de conjuntos: toda «sección navegable» (= `<section aria-labelledby>` que resuelve a heading, `:84-108`) está enlazada desde la nav (`:133-142`) | Una `<section aria-labelledby="x"><h2 id="x">` en el widget ⇒ **«sección navegable inalcanzable»** (la nav no la enlaza). Un `<nav>` dentro del widget con `#anclas`. Enlaces `#x` FUERA de `<nav>` no se comprueban |

**La trampa de la `<section>` es de doble filo**: sin `aria-labelledby` rompe la puerta 1
(`puerta-cascaron.ts:518-520`); con él rompe la 5 (`puerta-anclas.ts:133-142`). Precedente escrito:
`Galeria.tsx:44-46` y el contrato retirado (`features/boton_whatsapp_flotante.feature:81-82`). Hoy
hay 7 secciones navegables y 7 enlaces de nav (`MenuNavegacion.tsx:40-61`;
`features/reserva_chat.feature:484`).

### Dónde montarlo

- Ninguna puerta depende de la posición: la 1 solo exige que `main/nav/footer` EXISTAN
  (`puerta-cascaron.ts:100-102`); la 5 solo mira `<nav>`.
- Punto de montaje actual: `src/pages/home.tsx:82` abre `<main>`, `:134` lo cierra, `:138` monta
  `<Pie />` (un `<footer>`, `Pie.tsx:18`). El contrato retirado fijó **fuera de `<main>`, hermano de
  `<Pie/>`** por razón ESTRUCTURAL («un `position: fixed` que acompaña a toda la página no pertenece
  a una sección», `boton_whatsapp_flotante.feature:173-190`); el judge lo verificó en esa posición
  (`progress/judge_boton_whatsapp_v2.md:22-24`).
- Recomendación: fragmento de `home.tsx`, tras `</main>`, junto a `<Pie />` (no dentro del
  `<footer>`, no dentro de `<Contacto/>`). Antes de `<Pie/>` ⇒ el disparador cae en el orden de
  tabulación antes de los enlaces del pie; después ⇒ es lo último. Decisión de producto, sin impacto
  en puertas.
- Contenedor del panel: `div role="dialog" aria-modal aria-labelledby` (o `<aside>`/`<dialog>`), con
  título `h2`/`h3` o `aria-label`. Nunca `<section>`, nunca `<nav>`, nunca `<h1>`.
- Si el panel se hornea oculto (`hidden`), sus bytes SÍ cuentan para las puertas 1, 2 y 5 (todas son
  regex sobre HTML crudo). Si solo se monta en cliente, las puertas 1/4/5 no lo ven, pero la 2 sigue
  leyendo el guion en el JS.

---

## 2. Patrones de test del repo

### 2.1 `css: false` y sus consecuencias
- `vitest.config.ts:15` (`css: false`), `:14` (`fileParallelism: false` por los builds reales),
  `:16` (`include: src/**/*.{test,spec}.{ts,tsx}`).
- En test, `estilos.x` de un CSS module vale `undefined` (`boton_whatsapp_flotante.feature:41-42`;
  `reserva-logica.ts:3-7`). Por tanto:
  - **Prohibido `toHaveClass`** y aseverar por clase de module (`reserva.test.tsx:22`;
    `features/reserva_chat.feature:144`).
  - Un `className={cond ? estilos.a : estilos.b}` genera 5 mutantes y **los 5 sobreviven**
    (`cabecera.test.tsx:69-76`). Curas del repo: estado en atributo consultable (`aria-expanded`,
    `MenuNavegacion.tsx:22-32`), clave por función pura (`claveBurbuja`, `reserva-logica.ts:9-13`
    usada en `Reserva.tsx:134` junto a `data-de`), o clase **GLOBAL** literal observable
    (`CLASE_LISTA`, `Hero.tsx:77-83`, `:196`).
  - Las clases globales (`demo-*`) SÍ son observables: se asevera el atributo `class` de
    `renderToString` (`reserva.test.tsx:73-87`).

### 2.2 SCSS por bytes (`cuerpoDelBloque`)
- `readFileSync` del `.module.scss` + `cuerpoDelBloque(fuente, /regex/)` que cuenta llaves (robusto a
  prettier, respeta `@media`): `contacto-estilos.test.ts:21-45`. **Duplicado** (no hay helper común)
  en `equipo-estilos.test.ts:19`, `galeria-estilos.test.ts:24`, `hero-estilos.test.ts:30`,
  `resenas-estilos.test.ts:23`.
- Stryker no ve SCSS ⇒ lo CSS es NO-MUTABLE y lo cubren estos tests (`reserva_chat.feature:129`).
- Negativas sobre bytes SIEMPRE con **ancla positiva** (p. ej. el selector raíz existe) para no pasar
  por vacuidad (`boton_whatsapp_flotante.feature:233-238`). Ojo: los comentarios del SCSS también son
  bytes — un comentario con `url(` puso rojo un test (`progress/tdd_boton_whatsapp.md:73-76`).

### 2.3 `renderToString` para lo horneado
- Lo que viaja en el HTML del SSG se asevera sobre `renderToString(<X/>)` (mismo mecanismo que
  vite-react-ssg); lo post-hidratación con `render` + `fireEvent` en jsdom (`reserva.test.tsx:14-17`).
- La home entera necesita `<HelmetProvider>` (`src/pages/home.test.tsx:39-52`, que además asevera
  `cuantosH1 === 1` importando el decisor de la puerta).

### 2.4 Tests build-based: NO crear nuevos
- Son `src/pages/home-horneado.test.ts`, `src/pages/contacto-horneado.test.ts` y
  `src/lib/trampas-del-horneado.test.tsx`: lanzan `pnpm build` real en `beforeAll`
  (`home-horneado.test.ts:23-32`, timeout 180 s). Ya aseveran exit 0 de las 5 puertas
  (`home-horneado.test.ts:106-108`).
- Excluidos de la mutación por `**/*-horneado.test.{ts,tsx}` (`vitest.stryker.config.ts:37`); con
  ellos dentro la mutación tardaba **409 min** (`vitest.stryker.config.ts:12-13`).
- Precedente de «no añadir otro build»: `reserva.test.tsx:23-24` (su @s21 se apoya en los existentes).
- Suite completa actual ≈ 163 s para 1299 tests (`progress/judge_retiro_whatsapp_y_carrusel.md:6`).

### 2.5 `matchMedia` / `prefers-reduced-motion`
- jsdom 25 NO trae `matchMedia`: el componente lo **guarda** y lo lee **dentro de un efecto**, nunca en
  render (para que SSR e hidratación coincidan): `Galeria.tsx:121-133`, `Hero.tsx:120-130`.
- Escucha en caliente `change` en el MISMO efecto; activar reduce pausa/completa, desactivar no
  rearranca (`Galeria.tsx:138-152`, `Hero.tsx:132-148`).
- Stub en test: `vi.stubGlobal('matchMedia', vi.fn(consulta => ({ matches: pref && consulta === '(prefers-reduced-motion: reduce)', addEventListener: espía, … })))`
  (`galeria.test.tsx:679-694`, `hero.test.tsx:498-513`); se asevera la consulta EXACTA
  (`galeria.test.tsx:709-715`) y se captura el manejador del espía (`hero.test.tsx:521-527`).
- `prefers-reduced-motion` es **criterio de proyecto**, no WCAG A/AA (`hero-estilos.test.ts:152`).
  En CSS: `@media (prefers-reduced-motion: reduce) { animation: none }` aseverado por bytes
  (`hero-estilos.test.ts:157-170`).

### 2.6 Control de pausa SC 2.2.2
- **Hero**: `<button type="button" aria-label="Completar la firma">` transparente sobre el rótulo,
  **sin `aria-pressed`, sin texto visible** («el propio rótulo es el control — cero chips, cero ⏸»,
  `Hero.tsx:70-74`, `:264-272`). Solo se monta si la preferencia está LEÍDA y permite animar
  (`hero-logica.ts:49-54`); en SSR el estado es `null` ⇒ el botón **nunca viaja horneado**
  (`Hero.tsx:105-107`). Al pulsar: `data-firma="cliente"` y la hoja aplica `animation: none`
  (`Hero.tsx:189-197`). Recoloca el foco si iba a caer al vacío (`Hero.tsx:85-101`).
- **Galería/Reseñas**: el botón ❙❙/▶ se RETIRÓ a mano (ENMIENDA 4); hoy solo pausan hover, foco y
  reduced-motion, y **SC 2.2.2 queda incumplido a sabiendas** para ratón/táctil
  (`progress/enmienda4_carrusel_sc222.md:52-60`). No es un patrón a copiar.
- Implicación para el robot: una animación CSS en bucle que dure > 5 s en paralelo al contenido
  necesita mecanismo de parada (SC 2.2.2, nivel A) — o limitarla (≤ 5 s / iteraciones finitas / solo
  en hover-foco) y apagarla bajo reduce.

### 2.7 Otras carencias de jsdom 25.0.1 (medidas)
- `Element.scrollTo` no existe ⇒ se asigna `scrollTop` (`reserva-logica.ts:42-56`); `scrollHeight`
  hay que fijarlo a mano o el test pasa por vacuidad (`reserva.test.tsx:488-498`).
- `IntersectionObserver` no existe ⇒ guarda `typeof` (`Galeria.tsx:263-266`).
- `<dialog>`: `HTMLDialogElement-impl.js` está vacío (solo refleja `open`), **no hay `showModal()`
  ni `close()`** (`node_modules/jsdom/lib/jsdom/living/nodes/HTMLDialogElement-impl.js`, jsdom
  25.0.1). Usar `<dialog>.showModal()` exige guarda o un patrón `role="dialog"` propio.

### 2.8 Lógica pura en `*-logica.ts`
- Motivos: `react-refresh/only-export-components` (`eslint.config.js:24`) impide exportar otra cosa
  del `.tsx`, y bajo `css:false` las ramas se aseveran POR VALOR (`hero-logica.ts:1-8`).
- Nada derivado en la carga del módulo: calcular en llamada (`hero-logica.ts:10-12`, `:61-63`).
- `coverage.include` cubre `src/components/**/*.tsx` pero NO `src/components/**/*.ts`
  (`vitest.config.ts:20`; `reserva_chat.feature:574-580`): no afecta a la mutación.

### 2.9 Reglas de aserción transversales
- Anti-tautología: esperados A MANO; prohibido importar `TELEFONO`/`waHref`/constantes de demo como
  esperado o reejecutar `waHref` (`reserva.test.tsx:18-21`; `reserva_chat.feature:131-149`). Para
  mensajes largos, `decodeURIComponent` del href vs literal a mano (`reserva.test.tsx:644-651`).
- **Nunca aseverar el host de WhatsApp** (`wa.me`): `HOST_WHATSAPP` está `Stryker disable` y el
  contrato F-02 lo prohíbe (`src/lib/site.ts:66-73`). Solo negativas sobre bytes del `.tsx`
  (`reserva.test.tsx:147-165`).
- Consultas por rol/nombre/texto/`data-*` (`reserva.test.tsx:22`); comparaciones de `indexOf` con
  anclas positivas primero (`boton_whatsapp_flotante.feature:177-185`).

---

## 3. Stryker / mutación

- `stryker.config.json`: runner vitest con `configFile: vitest.stryker.config.ts` (`:14-17`);
  `coverageAnalysis: perTest` (`:14`); `mutate` = **lista EXPLÍCITA** de ficheros, «cada feature añade
  los suyos» (`:3`, `:18-47`; `Reserva.tsx` y `reserva-logica.ts` en `:38-39`); fuera por convención
  `App.tsx`, `main.tsx`, `pages/*`, `styles/*` (`:3`); ningún `src/lib/demo/*` está en la lista;
  `thresholds.break: 100` (`:48-52`); `ignorePatterns` `.experimentos-tmp`, `.vite-react-ssg-temp`,
  `dist` (`:53-58`).
- `vitest.stryker.config.ts:34-41`: hereda la config base, excluye `*-horneado` y activa
  `fileParallelism: true`.
- Acotar: `node tools/mutate.mjs <fichero>` ⇒ `stryker run --mutate <fichero>` (`tools/mutate.mjs:12-13`,
  `:31`); varios ficheros separados por comas (`progress/mutation_carrusel_enmienda4.md:5`).
  **PROHIBIDO `--testFiles`**: da 0 % falso (`tools/mutate.mjs:15`; `stryker.config.json:3`).
- Duraciones medidas: componente pequeño 9-40 s (`progress/mutation_contacto.md:122-123`;
  `progress/mutation_hero_caligrafia_lenta.md:14`); componente grande o trío 4-6 min
  (`progress/mutation_carrusel_enmienda4.md:9`; `progress/mutation_equipo.md:6`;
  `progress/mutation_subruta_github_pages.md:20`).
- Informe con timeouts MIENTE (cuentan como muertos): re-medir a `--concurrency 1`
  (`docs/verification.md:52-63`; `progress/mutation_cero_terceros.md:22-25`).
- Exclusión de un equivalente: solo con justificación escrita en `progress/mutation_<name>.md`
  (`docs/mutation-testing.md:78-80`) y comentario in situ `// Stryker disable next-line all`.

### Supervivientes típicos del repo y su cura

| Familia | Evidencia | Cura del repo |
|---|---|---|
| `className` condicional con claves de module | `cabecera.test.tsx:69-76` (5/5 vivos) | `aria-*`/`data-*`, clave pura, o clase global |
| Deps constantes `[]` de efecto solo-montaje (`ArrayDeclaration`) | `progress/mutation_hero_caligrafia_lenta.md:40-65` | Equivalente: `Stryker disable` con cita (`Hero.tsx:150-157`, `Galeria.tsx:154-159`). Deps que SÍ importan mueren (`Hero.tsx:182`) |
| Guarda de ref null inalcanzable (`if (hilo.current)`) | `progress/tdd_deuda_mutacion_full.md:61` | Extraer a función pura que recibe el nodo (`desplazarAlFinal`, `reserva-logica.ts:42-56`) o exclusión (`Galeria.tsx:258-266`) |
| Literal de la media query → `""` | `progress/mutation_carrusel_enmienda4.md:80-86` | Espiar `matchMedia` y aseverar el argumento (`galeria.test.tsx:709-715`) |
| Tiempo múltiplo del ciclo ⇒ verde falso | `progress/mutation_carrusel_enmienda4.md:48-78` | Checkpoint a tiempo NO múltiplo (`galeria.test.tsx:718-727`) |
| Estáticos en carga del módulo que la revientan (no se activan) | `progress/tdd_deuda_mutacion_full.md:17-49` | Calcular en llamada (`hero-logica.ts:10-12`) |
| Separadores JSX `{' '}` | `progress/mutation_lote_v3_resenas.md:51-72` | Aseverar `textContent` COMPLETO con `toBe` |
| `useState('')` inicial | `progress/tdd_deuda_mutacion_full.md:58` | Aseverar el valor inicial ANTES de escribir (`reserva.test.tsx:367-377`) |
| Clases globales vaciadas | `progress/tdd_deuda_mutacion_full.md:59-60` | Aseverar el atributo `class` del horneado (`reserva.test.tsx:73-87`) |
| **Guard de FUENTE que prohíbe `if (`/`?`/`&&` en un fichero mutado** | `progress/mutation_boton_whatsapp.md:26-40` | Stryker instrumenta el sandbox con `if (stryMutAct…)` ⇒ el dry-run falla y NO hay score. No escribir ese guard, o sacar el fichero de `mutate` justificándolo (`:66-97`) |

---

## 4. Tokens, utilidades y matriz de contraste

- Tokens (`src/styles/_tokens.scss`): `--bg #FDF4F7` (18), `--surface #FFF` (19), `--surface2` (20),
  `--accent-soft` (21), `--text` (24), `--muted` (26), `--ink #8E3355` (29), `--accent #C05576` (35,
  **solo rellenos grandes/decorativos**, 32-34), `--accent-dark #A23E5F` (37), `--accent-2 #B3316E`
  (39), `--brush #C05576` (40), `--on-accent #FFF` (41), `--line` decorativo (44-49),
  `--border-interactive #AB5F79` (50), `--header-bg` (66), `--estado-en-linea #186237` (74). Un solo
  esquema, sin tema oscuro (15; `main.scss:10-13`).
- Utilidades globales (`src/styles/_demo.scss`): `.demo-seccion(--alt|--plain)` (32-44),
  `.demo-contenedor` (46-56), `.demo-encabezado` (59-67), `.demo-eyebrow` (69-76), `.demo-titulo`
  (78-85), `.demo-intro` (87-92), `.demo-card` (95-100), `.demo-btn` (129-139), `--solido` (142-150),
  `--ghost` (153-162), **`--wa` `#25d366`/`#08130c`, hover `#1fb757`** (164-173).
- Foco global: `:focus-visible { outline: 3px solid var(--border-interactive); outline-offset: 2px }`
  (`_base.scss:18-22`); no apagarlo (`hero-estilos.test.ts:455`). Cabecera sticky `z-index: 50`
  (`cabecera.module.scss:13-15`); carruseles `z-index: 7` (`galeria.module.scss:37`). No hay ningún
  elemento `position: fixed` hoy.
- Matriz: 18 pares de TOKENS (`puerta-contraste.ts:208-303`), mínimo literal 18 (`:316`) anclado a
  mano en test (`puerta-contraste.test.ts:332`). Ya cubiertos, reutilizables para el botón:
  `--on-accent` sobre `--accent-dark` (texto, `:235-240`), `--accent-dark` sobre `--bg`/`--surface`
  (`:216-222`), `--border-interactive` sobre `--accent-soft` (componente, `:273-278`).
- Colores FUERA de la matriz ya en uso (invisibles para la puerta): `.demo-btn--wa` (`_demo.scss:164-173`),
  `.burbujaUsuario #dcf6e3/#1c3b28` (`reserva.module.scss:100-104`), el botón de enviar del chat
  `#25d366/#08130c` (`reserva.module.scss:147-154`). Advertencia escrita: «un color inventado aquí sería
  INVISIBLE para ella» (`galeria-estilos.test.ts:373-374`), por eso galería lo fija por bytes
  (`galeria-estilos.test.ts:372-381`).

### El rojo de los labios
- Decorativo (dentro de un `<svg aria-hidden="true" focusable="false">`, patrón `Hero.tsx:204`) ⇒ no
  es texto ni identifica el control ⇒ **fuera de la matriz**, como `--line` (`_tokens.scss:44-48`) y
  `--accent`/`--brush` (`puerta-contraste.test.ts:271-274`). Ningún test cuenta los tokens del
  `:root` (`puerta-contraste.test.ts:34-47` solo fija 6 valores), así que un token nuevo no rompe nada.
- Opciones, de menor a mayor coste: (a) reutilizar un token existente (`--accent`/`--brush`/
  `--accent-2`) — cero colores nuevos; (b) hex crudo en el `.module.scss` del widget (precedente
  `reserva.module.scss:102-103`) fijado por un test de bytes; (c) fila nueva en la matriz — obliga a
  subir `MINIMO_DE_PARES` (`puerta-contraste.ts:316`), cambiar su ancla (`puerta-contraste.test.ts:332`),
  re-mutar `puerta-contraste.ts` (está en `mutate`) y contradice la letra de `reserva_chat.feature:487`
  («MINIMO_DE_PARES sigue valiendo EXACTAMENTE 18»). Solo tiene sentido si el rojo transmite
  información (SC 1.4.11).
- Lo que SÍ debe cumplir 3:1 (SC 1.4.11) es lo que identifica el botón: su borde/relleno frente al
  fondo. Usar `--accent-dark` de relleno + icono `--on-accent` reutiliza pares ya vigilados.

---

## 5. El chat de `Reserva.tsx`

### Estructura
- Guion a nivel de módulo `FLUJO_CHAT` (4 pasos: servicio, día, franja, nombre) en `Reserva.tsx:31-36`.
- Estado local: `mensajes`, `paso`, `borrador`, `hecho`, `respuestas` + ref `hilo` (`:51-56`);
  autoscroll por `desplazarAlFinal` (`:58-62`); `avanzar` con resumen inline (`:64-79`);
  `enviarNombre` con `trim()` (`:81-85`); `reiniciar` (`:87-93`).
- JSX del chat (`:121-179`): cabecera con avatar `nl` `aria-hidden`, «Nails Lash Studio», «en línea»;
  hilo con burbujas `data-de` y clase `estilos[claveBurbuja(...)]` (`:132-138`); chips `<button>`;
  input `aria-label="Tu nombre"` + botón `aria-label="Enviar"` con Enter (`:149-167`); al terminar,
  `<a class="demo-btn demo-btn--wa" href={hrefReservaWhatsapp(respuestas)}>` y «Reservar otra cita»
  (`:168-177`). `hrefReservaWhatsapp` = `waHref(TELEFONO.legible, mensajeReserva(...))` (`:44-48`).
- Lógica pura ya exportada y testeada por valor: `claveBurbuja`, `mensajeReserva`, `desplazarAlFinal`
  (`reserva-logica.ts:11-13`, `:32-34`, `:50-56`).
- Contrato: `features/reserva_chat.feature` @s1-@s24 (588 líneas), **sin entrada en
  `feature_list.json`**. Todos los @s tienen test en `reserva.test.tsx` salvo @s21 (build, cubierto por
  los horneados existentes, `reserva.test.tsx:23-24`).

### Acoplamientos que romperían una extracción (tests de `reserva.test.tsx`)
| @s | Qué exige | Riesgo al extraer |
|---|---|---|
| @s1 (`:56-64`, `:73-87`) | En `renderToString(<Reserva/>)`: 1 `<section`, 1 `<h2`, 0 `<h1`; el PRIMER `<div class=` es `demo-contenedor` | El chat compartido no puede traer headings ni ir antes de la rejilla |
| @s2 (`:100-127`) | EXACTAMENTE 2 `role=link` al montar | El chat no puede renderizar enlaces hasta terminar |
| @s4 (`:147-165`) | Bytes de `Reserva.tsx` con `waHref(`, `telHref(`, `from '../lib/site'`, `TELEFONO` | Se mantiene por la columna izquierda (`Reserva.tsx:112-117`) |
| @s7 (`:219-226`) | `reserva.module.scss` declara `.chat .chatCabecera .hilo .chipChat .entrada .reiniciar` | **Rojo** si los estilos se mudan a otro module sin enmendar el contrato |
| @s9 (`:257-270`) | Horneado: exactamente 1 `data-de`, 3 opciones, sin input ni reinicio | El chat debe seguir renderizando su estado inicial en SSR |
| @s10 (`:274-282`) | Todos los `button` de `<Reserva/>` = `['Uñas','Pestañas','Cejas']` | Ningún botón extra (cerrar/minimizar) cuando va dentro de Reserva |
| @s18 (`:488-498`) | `getByText(SALUDO).parentElement` ES el hilo con el ref | Las burbujas deben ser hijas DIRECTAS del hilo |
| @s19 (`:519-535`) | `data-de="bot|usuario"`; claves `burbujaBot/burbujaUsuario` | El module usado debe tener esas claves |
| @s22 (`:573-580`) | Bytes de **`Reserva.tsx`** sin `fetch(`, `XMLHttpRequest`, `window.location`, `form action` | El guard deja de cubrir el código movido: hay que extenderlo al fichero nuevo |
| @s24 (`:618-652`) | Tras terminar, botones = `['Reservar otra cita']`; enlace «Enviar la reserva por WhatsApp» ANTES del reinicio, sin `target` | Orden y conteo exactos |

Además: el contrato FIJA los nombres de artefactos (`reserva_chat.feature:151-158`) ⇒ extraer =
enmienda con puerta humana (reglas duras de `CLAUDE.md`); `Reserva.tsx` perdería sus mutantes de
estado y el fichero nuevo debe entrar en `mutate`; el guion no puede exportarse desde un `.tsx`
(`eslint.config.js:24`).

### Qué tocar, según la vía
- **Vía barata (recomendada para demo)**: componente nuevo e independiente que IMPORTA las puras ya
  mutadas al 100 % (`mensajeReserva`, `claveBurbuja`, `desplazarAlFinal`) y `waHref`; guion propio en
  `src/lib/demo/<x>-demo.ts`. Cero cambios en `Reserva.tsx` ⇒ cero riesgo para @s1-@s24.
- **Vía extracción (`ChatGuiado` compartido)**: mover `FLUJO_CHAT` a un módulo de datos, parametrizar el
  guion, conservar DOM idéntico (tabla de arriba), mantener los 6 selectores en `reserva.module.scss`
  (o enmendar @s7), extender el guard @s22 al fichero nuevo, añadirlo a `mutate`, y enmendar
  `reserva_chat.feature`.

---

## 6. Convenciones (docs y las reales)

- `docs/conventions.md:31-37` y `docs/architecture.md:30-47` son **plantillas sin rellenar**; lo único
  aplicable es: formateador y linter sin avisos (`conventions.md:9-10`), nombres consistentes
  (`:11-12`), tests co-locados (`:20-21`), dependencias mínimas y justificadas
  (`architecture.md:15-17`; `CHECKPOINTS.md:26`).
- `docs/research/stack-convenciones.md:27,254` describe el stack BASE (`export default`,
  `PascalCase.module.scss`), que **este repo NO sigue**. Convenciones reales observadas:
  - Componente `src/components/PascalCase.tsx` con **export NOMBRADO** `export function X` (todos:
    `Cabecera.tsx:16` … `Reserva.tsx:50`); solo la página usa `export default` (`home.tsx:52`).
  - Estilos `kebab-case.module.scss` importados como `estilos` (`Reserva.tsx:6`,
    `PruebaColor.tsx:4` → `prueba-color.module.scss`); clases en camelCase (`.chatCabecera`).
  - Lógica pura hermana `kebab-logica.ts` en `src/components/` (`reserva-logica.ts`, `hero-logica.ts`).
  - Tests `kebab.test.tsx` (DOM/SSR) y `kebab-estilos.test.ts` (bytes SCSS).
  - Textos/datos demo en `src/lib/demo/<x>-demo.ts` con docblock honesto (`reserva-demo.ts:1-13`,
    `contacto-demo.ts:1-6`) y leyendas `LEYENDA_*` visibles (`ofertas-demo.ts:21`,
    `equipo-demo.ts:125`); NAP solo desde `src/lib/site.ts`.
  - Docblock del componente cita su `.feature` (`Reserva.tsx:8-17`); ids como `const ID_… =`
    (`Reserva.tsx:18`).
- Honestidad: `feature_list.json:505-509` veta el chat del prototipo por simular un agente «en
  línea» y pedir el nombre sin aviso; `reserva_chat.feature:543-553` (D1) propone leyenda «Asistente
  de demostración · no envía la reserva». F-13 exige aviso de privacidad junto al botón y no pedir
  datos de salud (`feature_list.json:304-305`).

---

## 7. Lecciones del botón flotante de WhatsApp retirado

- Nunca cruzó la puerta humana ni tuvo entrada en `feature_list.json`; se borró componente, module,
  constante y 3 tests (`boton_whatsapp_flotante.feature:1-6`; `progress/tdd_boton_whatsapp_retiro.md:1-53`).
- **Judge v1 lo rechazó por @s4 sin test** (montaje fuera de `<main>`); v2 lo aprobó con un test
  `renderToString(<HelmetProvider><Home/></HelmetProvider>)` comparando `indexOf` tras anclas
  positivas (`progress/judge_boton_whatsapp.md:17-20`; `judge_boton_whatsapp_v2.md:17-36`).
- **La mutación nunca midió**: el guard @s11 leía los bytes del `.tsx` prohibiendo `if (`, y Stryker
  inyecta `if (stryMutAct…)` en el sandbox ⇒ dry-run rojo ⇒ sin score
  (`progress/mutation_boton_whatsapp.md:26-40`). Se resolvió SACANDO el fichero de `mutate` por ser un
  `<a>` estático (`:66-97`). Un widget CON estado (panel abierto/cerrado, guion) NO puede acogerse a
  eso: será mutable.
- Reglas de diseño que dejó escritas (`boton_whatsapp_flotante.feature`): href derivado de `waHref` y
  sin número/host en el `.tsx` (@s2, `:138-150`); nombre accesible por `aria-label` distinto de otros
  CTA de WhatsApp (@s3, `:156-167`; decisión 5, `:386-389`); SVG inline `aria-hidden`+`focusable="false"`,
  sin `<img>` (`:162`); no ser `<section>` ni añadir fila de contraste (@s5, `:196-224`); sin `url(` ni
  `@font-face` en su SCSS con ancla positiva (@s6, `:226-238`); `position: fixed` en una esquina,
  `z-index` explícito, sin `inset:0` ni `width:100%` (@s7-@s8, `:245-272`); área ≥ 44×44 como criterio
  de proyecto, citando que SC 2.5.8 exige 24×24 (@s9, `:274-284`); `:focus-visible` y reduce con
  `transition/animation: none`, sin estilos inline en el `.tsx` (@s10, `:286-297`).
- Verificación manual que NO es test verde: recorrer la home con Tab (SC 2.4.11 / F110: el flotante
  puede tapar por completo los últimos enlaces del pie), abrir el enlace en Android/iOS/WhatsApp Web,
  JS deshabilitado, 320 px (`boton_whatsapp_flotante.feature:391-400`).
- Cabos sueltos que dejó el retiro, aún en prosa: `galeria.test.tsx` y `galeria_carrusel.feature:241`
  citan un test borrado (`progress/judge_retiro_whatsapp_y_carrusel.md:24-43`).

---

## Reglas para el nuevo widget

### Hacer
- Montarlo en `src/pages/home.tsx` fuera de `<main>` (tras `:134`), como hermano de `<Pie />`.
- Disparador `<button type="button">` con `aria-label` propio, `aria-expanded` + `aria-controls`
  (patrón `MenuNavegacion.tsx:28-36`), ≥ 44×44 px, `position: fixed` en esquina con `z-index` > 50.
- Panel como `div role="dialog"` (o `<aside>`) con `aria-labelledby` a un `h2`/`h3`, o `aria-label`.
- Robot en `<svg>` INLINE `aria-hidden="true" focusable="false"`, colores por `var(--token)`; ids
  internos del SVG únicos en la página.
- Estado visible en `aria-*`/`data-*`; decisiones (paso siguiente, fin del guion, texto final) en un
  `*-logica.ts` puro testeado por valor; reutilizar `mensajeReserva`/`claveBurbuja`/`desplazarAlFinal`.
- Guion y textos en `src/lib/demo/<x>-demo.ts`, con leyenda visible de asistente de demostración y el
  docblock «el mensaje lo ENVÍA el usuario».
- Salida a WhatsApp SOLO vía `waHref(TELEFONO.legible, texto)` en un `<a>` que pulse la usuaria; sin
  `target="_blank"` (coherencia con `reserva.test.tsx:120-126`).
- Animación CSS: finita o ≤ 5 s, o con control de parada (SC 2.2.2); `@media (prefers-reduced-motion:
  reduce) { animation: none; transition: none }`; `matchMedia` solo dentro de un efecto y guardado.
- Tests: `renderToString` para lo horneado, `render`+`fireEvent` para la interacción, bytes del SCSS
  con `cuerpoDelBloque` y ancla positiva, literales a mano, `matchMedia` espiado con consulta exacta.
- Añadir cada `.tsx`/`.ts` nuevo a `stryker.config.json` → `mutate` y medir con
  `node tools/mutate.mjs <fichero>` (a `--concurrency 1` si aparecen timeouts).
- Verificación manual con Tab (SC 2.4.11), en móvil 320 px y abriendo WhatsApp real; anotarla en
  `progress/`.

### No hacer
- Ninguna `<section>`, ningún `<nav>`, ningún `<h1>` en el widget (ni oculto).
- Ningún subrecurso externo (`<img src="https://…">`, `url(https://…)`, `<link rel=preconnect>`,
  fuentes o pesos nuevos); ninguna dependencia nueva (Lottie, librería de chat…).
- Ningún literal de la lista negra (`600123456`, `ph-woman`, `IMAGEN TEMPORAL`,
  `Plantilla de demostración`, `hola@nailslashstudio.com`, `Calle de la Belleza`) en guion, SVG,
  SCSS ni comentarios.
- No hardcodear número ni host de WhatsApp en el `.tsx`; no aseverar `wa.me` en tests.
- No `className` condicional con claves de CSS module; no `toHaveClass`; no estilos/animaciones
  inline en el `.tsx`.
- No escribir guards de fuente que prohíban `if (`/`?`/`&&`/`||` sobre un fichero que esté en `mutate`.
- No crear tests `*-horneado` (build-based) nuevos ni usar `--testFiles`.
- No añadir filas a `MATRIZ_DE_USO` por un color decorativo; si se hace, subir a mano el 18 y su test.
- No usar `<dialog>.showModal()` sin guarda (jsdom 25 no lo implementa).
- No tocar `Reserva.tsx`/`reserva.module.scss` salvo extracción aprobada con enmienda de
  `reserva_chat.feature` (@s1, @s2, @s7, @s9, @s10, @s18, @s22, @s24 se romperían).
- No presentar al robot como agente humano «en línea» ni pedir datos más allá de servicio/fecha/nombre
  sin aviso de privacidad (`feature_list.json:505-509`, `:304-305`).
- No robar las flechas: los carruseles escuchan `keydown` en `document` y solo se inhiben en
  INPUT/TEXTAREA/SELECT/contenteditable (`carrusel-logica.ts:47-55`, `Galeria.tsx:202-231`); con el
  panel abierto, ←/→ sobre un chip del robot moverían el carrusel visible si el panel no las captura.
