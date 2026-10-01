# Verificación en vivo — F-28 `favicon_marca` (@s9 y @s10)

> `craftsman_lead`, 2026-10-01. Rama `claude/favicon-marca` en `93796fa` (F-28 + `main` con las PR #16 y
> #17). Contrato: `features/favicon_marca.feature` @s9 y @s10 (Chromium REAL, nunca jsdom). Etiquetas:
> **[V]** medido en esta sesión · **[I]** inferencia · **[NV]** no verificado. Guiones reproducibles:
> `docs/research/favicon/verificacion-viva/` (con su README).

## 0. Entorno y artefacto

- **Navegador** [V]: Chromium **153.0.8010.12** (el de Playwright, `ms-playwright/chromium-1243`), Windows 11,
  `devicePixelRatio` 1,5, CON ventana (1280 × 860 en (0, 0)), conducido con `playwright-core` 1.63.0
  instalado FUERA del repo (`package.json` intacto).
- **Artefacto** [V]: `pnpm build` real sobre `93796fa` a las 10:13, exit 0 con las **5 puertas** en verde. Se
  sirve una **copia fija** de `dist/` fuera del repo (39 ficheros, con huella MD5), así que ningún build de la
  suite o de un hook puede reescribirla a mitad de medida (lección del H-3 de F-25). Los tres iconos de esa
  copia son idénticos byte a byte a los de `public/` (`cmp`) y a los del commit (MD5 de `favicon.svg`
  `69ffa8c4…`, `favicon.ico` `907b2317…`, `apple-touch-icon.png` `b8234317…`).
- **Contraprueba** [V]: una segunda copia del mismo `dist/` a la que se le quitan, del `index.html`, los
  **3** `<link>` de icono (quedan 0).
- **Lado servidor** [V]: Playwright **no expone** la petición del favicon (la hace el proceso del navegador,
  no la página): en la primera pasada su evento `response` no vio el `404 /favicon.ico` que el servidor sí
  registró. Por eso cada sitio se sirve detrás de un registro propio de peticiones, que es la prueba de @s9.
- **Perfil nuevo** por sitio y por pasada (sin caché de favicons).
- **Datos crudos** de las pasadas finales, saneados de rutas locales: `verificacion_viva_favicon_marca/datos/` (`s9-vite-preview.json`, `s9-servidor-tipo-pages-y-sonda-vite-preview.json`, `s10-cobertura-de-tinta.json`, `s9-web-publicada-antes.json` y `s9-web-publicada-despues.json`).

## 1. ¿`vite preview` da 404 fuera de la base? Sí [V]

| Ruta                                | `vite preview`         | GitHub Pages [I] |
| ----------------------------------- | ---------------------- | ---------------- |
| `/favicon.ico`                      | **404** (`text/plain`) | 404              |
| `/no-existe.png`                    | 404                    | 404              |
| `/NailsLashStudioWeb/`              | 200 (`text/html`)      | 200              |
| `/NailsLashStudioWeb/favicon.svg`   | 200 (`image/svg+xml`)  | 200 tras F-28    |
| `/NailsLashStudioWeb/favicon.ico`   | 200 (`image/x-icon`)   | 200 tras F-28    |
| `/NailsLashStudioWeb/no-existe.png` | 200 (`text/html`)      | 404              |

Por contrato, @s9 se mide con **`vite preview`** (detrás de un proxy que registra cada petición). Como su
reserva de SPA devuelve 200 a una ruta inexistente DENTRO de la base, @s9 se repite además con un **servidor
estático tipo GitHub Pages** (solo sirve bajo `/NailsLashStudioWeb/` y da 404 a todo lo que no existe). Los
dos dan el mismo resultado.

## 2. @s9 — la primera carga no deja ningún 404 y la pestaña muestra la «N» ✓

| `Then` de @s9                                                                             | `vite preview` + proxy | Servidor tipo Pages |
| ----------------------------------------------------------------------------------------- | ---------------------- | ------------------- |
| ANCLA: petición a `/NailsLashStudioWeb/favicon.svg` con respuesta 200                     | ✓                      | ✓                   |
| Ninguna respuesta 404 (de 13 peticiones, todas 200)                                       | ✓ 0                    | ✓ 0                 |
| Consola sin «Failed to load resource» con «404» (0 mensajes de consola en total)          | ✓ 0                    | ✓ 0                 |
| Ninguna petición a `/favicon.ico` de la RAÍZ del origen                                   | ✓ 0                    | ✓ 0                 |
| Captura de la pestaña con la «N» tinta sobre el cuadrado rosa                             | ✓ (archivada)          | ✓                   |
| CONTRAPRUEBA: `/favicon.ico` de la raíz con 404 y su «Failed to load resource» en consola | ✓ ROJO demostrado      | ✓ ROJO demostrado   |

- **Sitio real, las 13 peticiones** (servidor tipo Pages; con el proxy, las mismas 13): el documento, 1 CSS,
  2 JS, 6 fuentes WOFF2 autoalojadas, 2 fotos del catálogo y **`200 /NailsLashStudioWeb/favicon.svg`**.
  Consola: **vacía** (0 errores, 0 avisos).
- **Contraprueba**: las mismas 12 primeras y **`404 /favicon.ico`**; en consola, el error «Failed to load
  resource: the server responded with a status of 404 (Not Found)» en `http://127.0.0.1:4192/favicon.ico`.
- **FM-5 medido** [V]: Chromium 153 pide **solo el SVG** en la primera carga (ni el ICO ni el
  apple-touch-icon). El ICO queda de respaldo para navegadores sin SVG [I].
- **Capturas** (con `PrintWindow` de la ventana de este Chromium):
  `verificacion_viva_favicon_marca/pestana-real.png` (la «N») y
  `verificacion_viva_favicon_marca/pestana-contraprueba.png` (el globo genérico de Chrome).

## 3. @s10 — los raster reproducen la «N» CON su trazo ✓

Chromium dibuja `favicon.svg` (y una copia SIN `stroke`, `stroke-width` ni `stroke-linejoin`) en un canvas
transparente de N × N con `drawImage`; los raster se decodifican en Node (zlib, bytes exactos). En cada imagen,
C = Σ t·α/255, con t la proyección del RGB sobre `--accent-soft` (#F7DDE8) → `--ink` (#8E3355) de
`_tokens.scss`, recortada a [0, 1].

| Lado   | C Chromium con trazo | C Chromium sin trazo | C raster  | sin / con (≤ 80 %) | raster / con (±10 %) |
| ------ | -------------------- | -------------------- | --------- | ------------------ | -------------------- |
| 16 px  | 28,123               | 19,546               | 27,250    | **69,5 %** ✓       | **96,9 %** ✓         |
| 32 px  | 107,405              | 78,738               | 108,947   | **73,3 %** ✓       | **101,4 %** ✓        |
| 180 px | 3 439,260            | 2 480,532            | 3 448,371 | **72,1 %** ✓       | **100,3 %** ✓        |

- CALIBRACIÓN ✓ a los tres tamaños: la medida SÍ ve el trazo (la sonda de la redacción predijo ≈ 72 % [I];
  medido 69,5-73,3 %). Raster de 16 y 32: los del ICO; de 180: el apple-touch-icon.
- **Sabotaje 9 (rasterizar sin trazo) → @s10 ROJO** [V], con los raster sin trazo que generó el
  `tdd_craftsman` (ver `progress/tdd_favicon_marca.md`): 16 px 19,632 (**69,8 %**), 32 px 78,434
  (**73,0 %**), 180 px 2 482,250 (**72,2 %**), los tres fuera del ±10 %. Cubre su hallazgo H-2: un ICO sin
  trazo no lo ve ningún test de bytes; lo ve @s10 a 16 y 32 px.
- Determinista [V]: tres pasadas dan las mismas C al milésimo. Las de 09:51 y 10:04 midieron la copia del build de las 09:40 (`ddcc9cf`, antes de fusionar `main`); la de 10:13, la del build final (`93796fa`). Los tres iconos son los mismos bytes en las dos copias (mismo MD5), así que sus C no pueden cambiar; la tabla es la de la pasada final.

## 4. En la web PUBLICADA — antes y después

- **ANTES** [V, 09:53, `main` = `8b7c4c5`, sin F-28], en https://cenit-digital.github.io/NailsLashStudioWeb/:
  la consola muestra «Failed to load resource: the server responded with a status of 404 ()» en
  `https://cenit-digital.github.io/favicon.ico` (el H-2, reproducido en producción); el `/favicon.ico` de la
  raíz da 404, y las tres rutas del icono bajo la base también (aún no estaban publicadas).
- **DESPUÉS** [V, 10:51, `main` = `2a49c14`, PR #18 fusionada y desplegada; el lead aprobó el entorno
  `github-pages` con autorización de Pablo]: con Chromium 153 con ventana y perfil nuevo, la primera carga
  de https://cenit-digital.github.io/NailsLashStudioWeb/ deja la consola **vacía** (0 errores, 0 avisos, 0
  «Failed to load resource») y ninguna de las 13 respuestas que ve Playwright es un 404 (la petición del favicon la hace el navegador y no está entre ellas: su prueba es la consola vacía); el DOM declara los tres `<link>` con la base
  (`/NailsLashStudioWeb/favicon.ico`, `favicon.svg` y `apple-touch-icon.png`), y las tres rutas responden
  **200** (`image/vnd.microsoft.icon`, `image/svg+xml` e `image/png`). La pestaña muestra la «N»:
  `verificacion_viva_favicon_marca/pestana-web-publicada.png`. Datos: `datos/s9-web-publicada-despues.json`.
  El `/favicon.ico` de la RAÍZ del dominio de la organización sigue dando 404 si se pide a mano (fuera de
  alcance por contrato), pero Chrome ya no lo pide: **el H-2 queda cerrado en producción**.

## 5. Incidencias de la medida (corregidas y declaradas)

1. La primera captura de la pestaña en `vite preview` se hizo con una captura de PANTALLA y fotografió la
   ventana que estaba delante (el Chrome de Pablo), no este Chromium. Se cambió a `PrintWindow` de la ventana
   cuyo proceso es el `chrome.exe` de Playwright y se repitieron las dos pasadas; las capturas archivadas son
   de esa versión y se revisaron a ojo.
2. En una repetición, la contraprueba no quitó los `<link>`: apuntaba a la copia anterior, ya limpia, y el
   contador de quitados bajó de 3 a 0. Se detectó por ese contador, se corrigió y se repitió. Todas las cifras
   de este informe salen de las pasadas corregidas.

## 6. No verificado

- **[NV] iPhone real** (PA-28-1, decidido por Pablo: no bloquea). Los bytes del apple-touch-icon (180 × 180,
  RGB sin alfa, a sangre) los asevera @s6.
- **[NV] Otros navegadores** (Firefox, Safari): fuera del contrato.
