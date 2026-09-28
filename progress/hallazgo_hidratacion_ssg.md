# Hallazgo — la home se queda EN BLANCO en algunas cargas en frío (2026-09-28)

> Autor: `craftsman_lead`. Cazado en la verificación EN VIVO de Nailbot (F-24) con Chromium real
> (Playwright 1.56.1, `chromium-1194`) contra el build de producción servido con `vite preview`.
> Es un defecto PREEXISTENTE del cascarón SSG (F-04/F-05), NO del código de Nailbot: se reproduce
> igual en el build de `92d6b70`, anterior a Nailbot. Evidencia y sondas en el scratchpad de la sesión
> (`sonda-hidratacion.mjs`, `sonda-mecanismo.mjs`); los números, aquí.

## 1. Síntoma

En una fracción de las cargas en frío, React lanza el error minificado **#418** y la página pierde TODO
su contenido: 0 `<h1>`, 0 `<section>`, y el robot flotante no llega a montarse. Texto oficial del
código 418 (repo `facebook/react`, `scripts/error-codes/codes.json`, consultado 2026-09-28): «Hydration
failed because the server rendered %s didn't match the client. As a result this tree will be
regenerated on the client. This can happen if … External changing data without sending a snapshot of
it along with the HTML.» (React instalado: 19.2.7).

## 2. Medido (20 cargas en frío por fila, CPU ralentizada ×4 por CDP, 1280×800)

| Build | `<script type="module">` del bundle | Cargas rotas (#418 + página vacía) |
|---|---|---|
| HEAD `3c171ff` (actual) | `async` | 3/20 · 4/20 · 1/24 (tres tandas) |
| `92d6b70` (ANTES de Nailbot) | `async` | 6/20 |
| HEAD con `ssgOptions.script` retirado (por defecto `'sync'`) | sin atributo | **0/20 · 0/20 · 0/8** |

El bundle JS es BYTE A BYTE el mismo en las dos variantes de HEAD (`app-CWmDYxle.js`): solo cambia el
atributo del `<script>`.

## 3. Mecanismo (medido, no supuesto)

- `vite.config.ts` declara `ssgOptions.script: 'async'` → el HTML lleva
  `<script type="module" async src=".../app-*.js">` en el `<head>`.
- HTML Living Standard, §4.12.1 El elemento `script` (fuente `whatwg/html`, fichero `source`,
  consultado 2026-09-28): «For module scripts, if the async attribute is present, then the module
  script and all its dependencies will be fetched in parallel to parsing, and the module script will
  be evaluated as soon as it is available **(potentially before parsing completes)**. Otherwise, the
  module script and its dependencies will be fetched in parallel to parsing and evaluated when the page
  has finished parsing. (The defer attribute has no effect on module scripts.)». MDN (`mdn/content`,
  `script/index.md`) lo resume igual: «The defer attribute has no effect on module scripts — they
  defer by default.»
- vite-react-ssg 0.9.0 hornea el snapshot del router, `window.__staticRouterHydrationData`, en un
  `<script>` al FINAL del `<body>`, y el cliente lo lee al crear el router, ANTES de `hydrate()`:
  `createRoot(true)` llama a `createBrowserRouter(…)` sin `hydrationData`
  (`node_modules/vite-react-ssg/dist/index.mjs:89-96`), que cae en `parseHydrationData()` →
  `window.__staticRouterHydrationData` (`node_modules/react-router-dom/dist/index.js:230, 255-257`).
- Sonda con trampas en `document.querySelector('[data-server-rendered=true]')` y en
  `window.__VITE_REACT_SSG_CONTEXT__`: en TODAS las cargas rotas el módulo empezó a ejecutarse con
  `document.readyState === 'loading'`; en la tanda instrumentada, la única carga rota es la única en la
  que `window.__staticRouterHydrationData` aún era `undefined` al arrancar el módulo. Con el módulo
  diferido (sin `async`), `readyState` es siempre `interactive` al arrancar y no hay ningún #418.
- El «porqué» de `async` en el repo (`docs/research/stack-ssg-seo.md:188`: «El JS no bloquea el parseo
  del HTML») es FALSO para `type="module"`: un módulo NUNCA bloquea el parseo (ver la cita), así que
  `async` no aportaba nada y abría la carrera.

## 4. Segundo defecto del horneado, visto en la misma verificación

vite-react-ssg (`renderPreloadLink`, `dist/shared/vite-react-ssg.DsKK_1op.mjs:199-205`) inyecta
`<link rel="preload" as="image" crossorigin="">` para cada imagen importada por un módulo renderizado:
hoy **13 fotos** (7 de `#equipo` + 6 de la galería; 521 001 bytes medidos en `dist/assets`), y las 13
`<img>` de la página llevan `loading="lazy"` y NO llevan `crossorigin`. Chromium avisa en consola, por
imagen y por carga: «A preload for … is found, but is not used because the request credentials mode
does not match» y «… was preloaded using link preload but not used within a few seconds».

Medido por CDP (`Network.responseReceived`, `sonda-preload.mjs`, 3 tandas idénticas, `vite preview`):
**13 fotos pedidas por red ANTES de que la persona se desplace** (≈ 509 KiB que la página declara
PEREZOSAS, compitiendo con el LCP) y **26 respuestas de red en total** tras recorrer la página: cada
foto se descarga DOS veces, porque el `<img>` no puede reutilizar la precarga (el modo de credenciales
no casa). Matiz honesto: `vite preview` sirve `Cache-Control: no-cache`; en GitHub Pages la segunda
descarga podría salir de la caché HTTP según sus cabeceras — eso NO se ha medido. La precarga
anticipada de las 13 fotos y los avisos de consola sí ocurren en cualquier servidor. También
preexistente.

## 5. Decisión del lead (autonomía delegada por el humano el 2026-09-28: «hazlo tú el 100 % de forma autónoma»)

Se corrigen los dos por el pipeline, como **ENMIENDA 2 de `features/cascaron_semantico.feature`**
(F-04, el cascarón horneado), porque el primero rompe un contrato ya aprobado de F-24 (@s2: el
lanzador aparece tras hidratar) y deja la web vacía en móviles lentos:

1. `ssgOptions.script` deja de ser `'async'` (vuelve al valor por defecto de la librería): el módulo se
   evalúa cuando el documento está entero.
2. El artefacto no lleva `<link rel="preload" as="image">`: las fotos siguen `loading="lazy"` y la
   estrategia de precarga del LCP queda para F-17 (`pipeline_imagenes`) cuando haya fotos reales.

Tras la enmienda: `bin/harness init`, `pnpm build` y la verificación en vivo COMPLETA de Nailbot se
repiten, y la sonda de hidratación se repite con más cargas.
