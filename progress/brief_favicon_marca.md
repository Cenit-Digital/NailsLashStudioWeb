# Brief — F-28 `favicon_marca`

> Lo escribe el `craftsman_lead` el 2026-09-30. Es la entrada de `spec_partner` (sección F-28 de
> `project-spec.md`) y de `gherkin_author` (`features/favicon_marca.feature`). Etiquetas: **[V]**
> verificado de primera mano en esta sesión · **[I]** inferencia razonada · **[NV]** no verificado.

## 1. Origen

Hallazgo **H-2** de la verificación en vivo de F-25 (`progress/verificacion_viva_logo_acoplado.md`,
en la rama `claude/hopeful-euler-jx0jq8` de PR #16, no en `main`). La web **no declara icono**, así que
Chrome pide `/favicon.ico` por su cuenta y la consola de la primera carga muestra
`Failed to load resource: the server responded with a status of 404 (Not Found)`. Es **previo a F-25** y
ajeno a él.

**Dónde cae ese 404 [I, se mide en vivo]:** sin `<link rel="icon">`, el navegador pide `/favicon.ico` en
la **raíz del origen**, no bajo la subruta. En GitHub Pages de proyecto eso es
`https://cenit-digital.github.io/favicon.ico`, **fuera de este repositorio**. Poner un `favicon.ico` en
`public/` no lo arregla: saldría en `/NailsLashStudioWeb/favicon.ico`, que nadie pide. **La única cura
bajo la subruta es DECLARAR el icono**, y entonces el navegador pide lo declarado y no la raíz.

## 2. Decisiones del humano (Pablo, AskUserQuestion, 2026-09-30)

Tomadas sobre una hoja con 4 candidatos renderizados a 16 y 32 px reales, 16 px ampliado por píxel y en
pestañas clara y oscura: `docs/research/favicon/candidatos.png`.

- **FM-1 · Diseño «B»**: la **«N» caligráfica de Great Vibes** (la letra del rótulo «Nails Lash» del hero)
  en **`--ink` `#8E3355`** sobre un **cuadrado de esquinas redondeadas `--accent-soft` `#F7DDE8`**. La
  referencia aprobada, byte a byte, es `docs/research/favicon/aprobado-B.svg`: glifo relleno **y** trazo
  del mismo color de **18 unidades** con `stroke-linejoin="round"` (engrosa las líneas finas), margen del
  13 % por lado, radio del 20 % del lado. Descartadas: A («N» blanca sobre tinta, la más legible, que se
  recomendaba), C («NL», se emborrona a 16 px) y D («N» blanca sobre `--accent`). **Contrapartida
  aceptada a sabiendas**: en una pestaña clara el borde del cuadrado rosa casi se funde con el blanco; la
  «N» se lee igual. No se «arregla» con un borde: sería otro diseño que Pablo no ha visto.
- **FM-2 · Juego de iconos**: **SVG + `.ico` de respaldo (16 + 32 px) + `apple-touch-icon` de 180 px**.

## 3. Hechos medidos en esta sesión

1. **[V] Vite reescribe la base en `index.html`.** Con `vite build --base /NailsLashStudioWeb/` sobre un
   `index.html` con `<link rel="icon" href="/favicon.ico" sizes="32x32">`,
   `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` y
   `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, y esos tres ficheros en `public/`, el
   `dist/index.html` sale con los tres `href` como `/NailsLashStudioWeb/…` y los tres ficheros se copian a
   la raíz de `dist/`. **Consecuencia**: la fuente escribe `/favicon.svg` **sin** el prefijo; el literal
   de la base vive solo en `vite.config.ts` (donde ya lo leen las puertas F-04/F-05) y no puede divergir.
2. **[V] Ninguna puerta vigila hoy un `<link rel="icon">`.** La anti-404 de F-04
   (`src/lib/puerta-cascaron.ts`, `extraerEnlaces`) solo mira `<a href>`. La de terceros (F-05) sí cuenta
   `rel="icon"` como petición (`KEYWORDS_DE_PETICION` de `src/lib/terceros.ts`), pero una ruta
   root-absoluta del mismo origen pasa, y **solo lee `.html` y `.css` de `dist/`** (`ES_HTML_O_CSS` de
   `tools/puerta-terceros.ts`): **un `.svg` no lo inspecciona nadie**. Por tanto, que los `href`
   declarados tengan fichero en `dist/` y que el SVG sea autocontenido lo tiene que asegurar **esta
   feature**, con sus tests.
3. **[V] La fuente es utilizable.** `@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff` es
   WOFF 1 con tablas TrueType (`glyf`), `unitsPerEm` 1000, licencia **SIL OFL 1.1**: convertir glifos en
   contorno para un logo está permitido. «N» = glifo 33, caja de tinta (−3, −795)–(1194, 148). Extractor
   de prototipo: `docs/research/favicon/prototipo-glifos.mjs`; compositor de candidatos:
   `docs/research/favicon/prototipo-candidatos.mjs` (el «B» es exactamente su salida).
4. **[V] El trazo de 18 importa.** Comparado en píxeles reales: sin trazo, la «N» a 16 px queda
   visiblemente más fina y floja. **El respaldo rasterizado tiene que reproducir el trazo**, no solo el
   relleno.
5. **[V] No hay `public/` en `main`**, y ningún rasterizador instalado (ni sharp ni resvg ni playwright en
   `node_modules`). Precedente de herramienta sin dependencias que codifica PNG a mano con `node:zlib`:
   `tools/trazo-marca/aplicador.mjs`.

## 4. Propuestas técnicas del lead (a ratificar en la puerta humana)

- **FM-3 · Se declara en `index.html`, no en el `<Head>` de `home.tsx`.** El icono es del SITIO, no de
  una página: toda ruta futura lo hereda sin acordarse de ponerlo; no depende de React ni de la
  hidratación; y Vite aplica la base con el mismo mecanismo que copia los ficheros (hecho 1). El `<Head>`
  sigue siendo obligatorio para la metadata **por página** (título, canónica, JSON-LD), y no cambia.
- **FM-4 · Los tres ficheros viven en `public/`** (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`):
  URLs estables y predecibles. El día que la base pase a `/` (dominio propio del cliente), el `.ico` queda
  además en `/favicon.ico`, que es la convención que algunos rastreadores piden a ciegas.
- **FM-5 · Orden y atributos** como en la vista previa que aprobó Pablo:
  `<link rel="icon" href="/favicon.ico" sizes="32x32">`, luego
  `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`, luego
  `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`. `sizes="32x32"` y no `"any"` en el
  `.ico` para que Chrome prefiera el SVG **[NV: guía pública conocida; se MIDE en vivo qué icono pide
  Chrome]**.
- **FM-6 · Los ficheros son DATO GENERADO**, con un generador `tools/favicon/generar.mjs` (Node puro, cero
  dependencias nuevas, `node:zlib`, como `aplicador.mjs`) que:
  1. lee la «N» de la woff autoalojada (no de internet);
  2. compone `public/favicon.svg` con la **misma geometría** que `aprobado-B.svg`;
  3. rasteriza esa misma geometría (relleno con regla nonzero **más** trazo de 18 como «a distancia ≤ 9 del
     contorno», con antialias por supermuestreo) a PNG de 16 y 32 px **RGBA con las esquinas
     transparentes** (el cuadrado redondeado), y los empaqueta en `public/favicon.ico` (PNG dentro de ICO);
  4. rasteriza el `apple-touch-icon.png` de **180×180 RGB, a sangre, SIN esquinas redondeadas y SIN canal
     alfa**: iOS aplica su propia máscara y pinta de negro lo transparente.
     El generador no lleva tests ni mutación propios (precedente `aplicador.mjs` y `derivar.html`); el
     contrato verifica sus **salidas**. Cabecera de cada salida editable: «generado, no se edita a mano».
- **FM-7 · Sin deriva de la paleta**: los dos colores del SVG se comparan contra `--accent-soft` e `--ink`
  leídos de `src/styles/_tokens.scss`. Si alguien cambia un token, el test se pone rojo y obliga a
  regenerar.

## 5. Techo de alcance (OBLIGATORIO; memoria del proyecto «acotar el alcance del arnés»)

- **Como mucho 10 escenarios** en total, de los que **como mucho 2** son `@verificacion-viva`.
- **Ningún fichero de test build-based NUEVO.** Lo horneado se añade al `beforeAll` del build que **ya**
  corre `src/pages/home-horneado.test.ts` (que no importa nada de `src/`, y así debe seguir).
- **Lista cerrada de ficheros** que la implementación puede tocar: `index.html`,
  `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`, `tools/favicon/generar.mjs`,
  `src/pages/home-horneado.test.ts` (solo añadir) y **un** test de bytes nuevo,
  `src/pages/favicon-marca.test.ts`. Más `progress/tdd_favicon_marca.md`.
- **Fuera de alcance, declarado**: manifest web y los iconos PWA 192/512, `mask-icon` de Safari,
  `theme-color`, variante de modo oscuro del SVG, y el `/favicon.ico` de la **raíz del origen** de GitHub
  Pages (es el sitio de la organización: esta puerta no lo ve ni lo controla).

## 6. Mutación

No se toca código que Stryker mute (`index.html`, `public/` y `tools/` están fuera de `mutate`): la
mutación de Stryker **no aplica** y se **declara**. Se compensa como en F-25 E-1/E-2 con **sabotajes
manuales demostrados**, cada uno debe poner rojo al menos un test: quitar un `<link>` de `index.html`;
escribir la base a mano en un `href`; cambiar un hex del SVG; meter un `<text>` o un `href` externo en el
SVG; cambiar el tamaño de una imagen del `.ico`; guardar el `apple-touch-icon` con canal alfa; borrar un
fichero de `public/`.

## 7. «Hecho» (lo pide el encargo)

`pnpm build` pasa las 5 puertas; `dist/index.html` declara los iconos con la base `/NailsLashStudioWeb/`;
y cargando el build servido en Chromium no aparece **ningún** 404 en la consola.
