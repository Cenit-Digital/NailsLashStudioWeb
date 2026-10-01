# F-28 `favicon_marca` — PARTE B: mapa @s → test, Rojo → Verde y sabotajes

> `tdd_craftsman`, 2026-10-01. Rama `claude/favicon-marca`, HEAD `ddcc9cf`. Contrato APROBADO:
> `features/favicon_marca.feature`. Generador (parte A): `progress/tdd_favicon_marca_generador.md`.
> Etiquetas: **[V]** medido por mí en esta ronda · **[L]** medido por el lead · **[I]** inferencia.
>
> Reglas de esta ronda: SOLO `pnpm exec vitest run src/pages/favicon-marca.test.ts` (ni suite completa,
> ni `pnpm build`, ni `harness`); ficheros creados solo por Bash; cada sabotaje se aplica, se mide, se
> revierte con git checkout -- (fichero) y se comprueba `git status --porcelain` SIN ningún fichero
> rastreado modificado antes del siguiente. Ningún test, `tools/`, `index.html` ni `public/` queda tocado.
>
> **Ronda 2 (@s8), 2026-10-01 10:16-10:24**, HEAD `93796fa` (lleva fusionado `origin/main` con #16 y #17/H-3).
> SOLO `pnpm exec vitest run src/pages/home-horneado.test.ts`: su `beforeAll` hace el `pnpm build` REAL en un
> temporal (`NLS_DIST_DIR`), nunca en `dist/`. Mismas reglas de reversión. Único fichero de código tocado:
> `src/pages/home-horneado.test.ts`, SOLO AÑADIDO al final (+84 líneas; sin imports nuevos).

## 0. Verde de partida y de llegada

- [V] Partida (2026-10-01 09:44): `pnpm exec vitest run src/pages/favicon-marca.test.ts` → **40/40**,
  `Duration 2.19s` (≈ 6,1 s de reloj con el arranque de pnpm).
- [V] Llegada, tras los 56 runs de esta ronda (09:57): **40/40**, `Duration 2.34s`; `git status --porcelain`
  vacío.
- [V] Ronda 2, `src/pages/home-horneado.test.ts` con @s8: partida (10:16) **42/42**, `Duration 12.52s`; llegada,
  tras los sabotajes (10:23), **42/42**, `Duration 10.29s` (≈ 13 s de reloj con el `pnpm build` real, no
  ~1 min). Después solo corrió 2a (10:24, §3.3: 42/42 con su sabotaje, revertido). En las 16 corridas de la
  ronda no cayó NADA fuera de @s8: H-3 y el exit 0 de @s14 en verde en todas.

## 1. Mapa @s → test

@s1-@s7: `src/pages/favicon-marca.test.ts` (no importa nada de `src/` ni el generador). @s8:
`src/pages/home-horneado.test.ts`, SOLO AÑADIDO al final, sobre el `html` y el `artefacto` (el `dist/`
temporal) de su `beforeAll` EXISTENTE y con la extracción de F-04 @s40 (`elementos('link')` + `valorDe`), sin
build, `beforeAll` ni extractor nuevos y sin importar de `src/`. A mano: el prefijo `"/NailsLashStudioWeb/"`
(`PREFIJO_DE_LA_BASE`, como `PREFIJO_DE_ASSETS`), los tres `href`, `"32x32"` e `"image/svg+xml"`. El esperado de
los bytes es el gemelo de `public/`: ningún byte ni hex escrito a mano.

| @s  | `describe` (líneas)                | `it` (nombre; en los `it.each`, la plantilla y sus casos)                                                                                        | nº     |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| @s1 | 96-132                             | ANCLA POSITIVA: EXACTAMENTE 3 `<link>` de icono en `<head>`, y EXACTAMENTE 3 en el fichero entero                                                | 1      |
|     |                                    | el 1.º: rel "icon", href exactamente "/favicon.ico" y sizes "32x32"                                                                              | 1      |
|     |                                    | el 2.º: rel "icon", href exactamente "/favicon.svg" y type "image/svg+xml"                                                                       | 1      |
|     |                                    | el 3.º: rel "apple-touch-icon" y href exactamente "/apple-touch-icon.png"                                                                        | 1      |
|     |                                    | ningún href empieza por "/NailsLashStudioWeb/" ni por "//", ni contiene ":"                                                                      | 1      |
| @s2 | 174-213                            | ANCLA POSITIVA: cada fichero tiene EXACTAMENTE un `<svg>`, un `<rect>` y un `<path>`                                                             | 1      |
|     |                                    | ANCLA A MANO del oráculo: viewBox, rect y el principio y el fin de su d                                                                          | 1      |
|     |                                    | el viewBox y los x, y, width, height y rx del `<rect>` son IDÉNTICOS, como cadena, a los del oráculo                                             | 1      |
|     |                                    | el d del `<path>` es IDÉNTICO, como cadena, al del oráculo                                                                                       | 1      |
|     |                                    | el `<path>` lleva stroke-width "18" y stroke-linejoin "round"                                                                                    | 1      |
| @s3 | 241-278                            | ANCLA POSITIVA: contiene el xmlns del SVG y un "<path"                                                                                           | 1      |
|     |                                    | contiene 0 veces <text, <image, <use, <style, <script y <foreignObject                                                                           | 1      |
|     |                                    | contiene 0 veces "href", "url(" y "@import"                                                                                                      | 1      |
|     |                                    | contiene EXACTAMENTE 1 vez "http", y es la del xmlns                                                                                             | 1      |
|     |                                    | antes de la primera "<svg" hay un comentario con "tools/favicon/generar.mjs" y "no se edita a mano"                                              | 1      |
| @s4 | 617-663                            | ANCLA POSITIVA: \_tokens.scss declara EXACTAMENTE una vez --accent-soft: y --ink:, cada una #RRGGBB, y son DISTINTAS                             | 1      |
|     |                                    | el fill del `<rect>` es --accent-soft y el fill y el stroke del `<path>` son --ink                                                               | 1      |
|     |                                    | ANCLA POSITIVA: $nombre tiene $pixeles píxeles, al menos uno --accent-soft opaco y al menos uno de tinta (16, 32, Apple)                         | 3      |
|     |                                    | en $nombre, todo píxel con alfa > 0 es mezcla de --accent-soft y --ink (±2 por canal) (16, 32, Apple)                                            | 3      |
| @s5 | 682-741                            | ANCLA POSITIVA: la cabecera tiene reservado 0, tipo 1 y EXACTAMENTE 2 entradas                                                                   | 1      |
|     |                                    | las medidas declaradas son una de 16×16 y otra de 32×32                                                                                          | 1      |
|     |                                    | en cada entrada, desplazamiento + tamaño ≤ la longitud del fichero                                                                               | 1      |
|     |                                    | la entrada de %i px es un PNG completo: firma, IHDR con SUS medidas, profundidad 8, tipo 6, … e IEND justo al final                              | 2      |
|     |                                    | ANCLA POSITIVA: en el PNG de %i px, el píxel central del borde superior es --accent-soft opaco                                                   | 2      |
|     |                                    | en el PNG de %i px, las cuatro esquinas tienen alfa ≤ 25                                                                                         | 2      |
| @s6 | 745-780                            | ANCLA POSITIVA: empieza por la firma PNG, su primer trozo es IHDR y el último es IEND, que acaba en el último byte                               | 1      |
|     |                                    | su IHDR declara 180×180, profundidad 8, tipo de color 2 (RGB) y sin entrelazado                                                                  | 1      |
|     |                                    | no contiene ningún trozo "tRNS"                                                                                                                  | 1      |
|     |                                    | los píxeles (0, 0), (179, 0), (0, 179) y (179, 179) tienen EXACTAMENTE el RGB de --accent-soft                                                   | 1      |
| @s7 | 817-841                            | ANCLA POSITIVA: el raster de $lado px tiene al menos un píxel de tinta (32, 180)                                                                 | 2      |
|     |                                    | a $lado px la caja de tinta está a ±1 px de ($x0, $y0)–($x1, $y1) (32, 180)                                                                      | 2      |
|     |                                    | **Total de `favicon-marca.test.ts`**                                                                                                             | **40** |
| @s8 | 578-630 de `home-horneado.test.ts` | ANCLA POSITIVA: EXACTAMENTE 3 `<link>` cuyo rel, en tokens y sin distinguir mayúsculas, contiene "icon" o "apple-touch-icon"                     | 1      |
|     |                                    | el 1.º: rel "icon", href exactamente "/NailsLashStudioWeb/favicon.ico" y sizes "32x32"                                                           | 1      |
|     |                                    | el 2.º: rel "icon", href exactamente "/NailsLashStudioWeb/favicon.svg" y type "image/svg+xml"                                                    | 1      |
|     |                                    | el 3.º: rel "apple-touch-icon" y href exactamente "/NailsLashStudioWeb/apple-touch-icon.png"                                                     | 1      |
|     |                                    | el href del %i.º, sin "/NailsLashStudioWeb/", es un fichero del artefacto de más de 0 bytes y byte a byte IGUAL a su gemelo de public/ (1, 2, 3) | 3      |
|     |                                    | **Total de @s8** (el fichero `home-horneado.test.ts` pasa de 35 a 42 `it`)                                                                       | **7**  |
|     |                                    | **Total F-28 en tests de bytes y de horneado** (@s9 y @s10 son en vivo)                                                                          | **47** |

Cada nombre de `it` lleva delante su etiqueta (`@s1 …`, `@s2 …`). @s9 y @s10 son EN VIVO (Chromium real):
los anota el lead en `progress/verificacion_viva_favicon_marca.md`.

## 2. Rojo → Verde

El TDD de @s1-@s7 lo avanzó otro actor antes de esta ronda (ver `progress/current.md`, corte de
2026-09-30 18:25); aquí se **re-demuestra** el Rojo de cada escenario sobre HEAD `ddcc9cf`.

- [L] El lead, 2026-09-30: 33 rojos / 7 verdes antes de generar los iconos → 40/40 tras
  `node tools/favicon/generar.mjs`.
- [V] **Rojo de @s2-@s7**: borrados a la vez los tres ficheros de `public/` → **33 rojos / 7 verdes**
  (coincide con el lead). Los 7 verdes son los que NO leen `public/`: los 5 de @s1 (leen `index.html`),
  «@s2 ANCLA A MANO del oráculo» y «@s4 ANCLA POSITIVA: \_tokens.scss …».
- [V] **Verde**: `node tools/favicon/generar.mjs` sobre ese árbol → `git status --porcelain` vacío (los
  tres ficheros salen **byte a byte idénticos** a los de HEAD) → **40/40**. Revertido igualmente.
- [V] **Rojo de @s1**: `index.html` sustituido temporalmente por el de `ba5b498` (antes de F-28, sin los tres
  `<link>`; `git diff ba5b498 HEAD -- index.html` = 3 inserciones) → **5 rojos** (los 5 de @s1), 35 verdes.
  Revertido.

### 2.1 Rojo → Verde de @s8 (ronda 2)

El código de @s8 (los tres `<link>` de `index.html`, los tres ficheros de `public/` y la base de
`vite.config.ts`) ya existía: el test se escribió primero y pasó a la primera (42/42, 10:16). Su Rojo se
DEMUESTRA saboteando (§3.3, §4.1) y con el árbol de antes de F-28:

- [V] **Rojo de partida** (`R-arbol-pre-F28`, 10:23): `index.html` de `ba5b498` (`git diff ba5b498 HEAD -- index.html`
  = exactamente los tres `<link>`) y SIN los tres ficheros de `public/` → **7 rojos / 35 verdes**. Caen los 7 de
  @s8 y SOLO ellos: el ancla («hallados: » vacío, 0 ≠ 3), los tres posicionales (no hay elemento) y los tres de
  bytes (`href del n.º: ""`). El exit 0 de @s14 sigue VERDE: ninguna de las cinco puertas echa de menos el icono.
  Revertido con git checkout -- index.html public/; `git status --porcelain` sin ellos.
- [V] **Verde**: HEAD con el test → **42/42** (10:16 y, tras todos los sabotajes, 10:23).
- [V] Cambios al test DURANTE la ronda, solo de mensaje (la aserción no cambia): el ancla lista los `href`
  hallados (Vitest trunca el array a `[ …(2) ]`) y el `> 0 bytes` dice qué fichero. Los sabotajes afectados (1a,
  E14) se REPITIERON con el texto final; las cifras de §3.3 y §4.1 son de esa repetición.

## 3. Sabotajes 1-8 (y el 9 para el lead)

**Comando de cada fila** (C): `pnpm exec vitest run src/pages/favicon-marca.test.ts --reporter=json
--outputFile=<scratchpad>/sabotajes/<etiqueta>.json` (el `--reporter=json` solo sirve para listar los `it`
caídos; es el mismo fichero de test y nada más). Reversión: git checkout -- (fichero) + `git status
--porcelain` sin rastreados modificados → **sí** en TODAS las filas. Los scripts de sabotaje (Node puro,
`node:zlib` + CRC32 a mano, sin importar el generador ni el test) viven en el scratchpad de la sesión,
`…/scratchpad/sabotajes/`: `quitar-linea.mjs`, `reemplazar.mjs`, `parchear-byte.mjs`, `png-lib.mjs`,
`s6-apple.mjs`, `s8-desplazar.mjs`, `cajas.mjs`, `pixel.mjs`, `hacer-copias.mjs`, `cobertura.mjs`.

| nº  | Etiqueta (C)                     | Qué se hizo exactamente                                                                                                                              | Rojos /40 | `it` en rojo                                                                                                                                                                                 | Revertido |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1a  | `1a-sin-ico`                     | `index.html`: quitada la línea `<link rel="icon" href="/favicon.ico" sizes="32x32" />`                                                               | 5         | @s1 ANCLA (2 ≠ 3), @s1 1.º, @s1 2.º, @s1 3.º, @s1 ningún href (2 ≠ 3)                                                                                                                        | sí        |
| 1b  | `1b-sin-svg`                     | `index.html`: quitada `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`                                                                 | 4         | @s1 ANCLA, @s1 2.º, @s1 3.º, @s1 ningún href                                                                                                                                                 | sí        |
| 1c  | `1c-sin-apple`                   | `index.html`: quitada `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`                                                                 | 3         | @s1 ANCLA, @s1 3.º, @s1 ningún href                                                                                                                                                          | sí        |
| 2a  | `2a-base-svg`                    | `index.html`: `href="/favicon.svg"` → `href="/NailsLashStudioWeb/favicon.svg"`                                                                       | 2         | @s1 2.º ("/NailsLashStudioWeb/favicon.svg" ≠ "/favicon.svg"), @s1 ningún href (lista el culpable)                                                                                            | sí        |
| 2b  | `2b-base-ico`                    | ídem en el `href` del ICO                                                                                                                            | 2         | @s1 1.º, @s1 ningún href                                                                                                                                                                     | sí        |
| 2c  | `2c-base-apple`                  | ídem en el `href` del apple-touch-icon                                                                                                               | 2         | @s1 3.º, @s1 ningún href                                                                                                                                                                     | sí        |
| 3a  | `3a-hex-rect`                    | `public/favicon.svg`: `fill="#F7DDE8"` (rect) → `fill="#F7DDE9"`                                                                                     | 1         | @s4 el fill del `<rect>` es --accent-soft y el fill y el stroke del `<path>` son --ink (#f7dde9 ≠ #f7dde8)                                                                                   | sí        |
| 3b  | `3b-hex-path-fill`               | `public/favicon.svg`: `fill="#8E3355"` (path) → `fill="#8E3356"`                                                                                     | 1         | el mismo `it` de @s4 (#8e3356 ≠ #8e3355)                                                                                                                                                     | sí        |
| 3c  | `3c-hex-path-stroke`             | `public/favicon.svg`: `stroke="#8E3355"` → `stroke="#8E3356"`                                                                                        | 1         | el mismo `it` de @s4 (#8e3356 ≠ #8e3355)                                                                                                                                                     | sí        |
| 4a  | `4a-text`                        | `public/favicon.svg`: `<text x="0" y="0">N</text>` antes de `</svg>`                                                                                 | 1         | @s3 contiene 0 veces <text, … (["<text"])                                                                                                                                                    | sí        |
| 4b  | `4b-href-externo`                | `public/favicon.svg`: `<a href="https://example.com/"/>` antes de `</svg>`                                                                           | 2         | @s3 contiene 0 veces "href", … (["href"]), @s3 EXACTAMENTE 1 vez "http" (2 ≠ 1)                                                                                                              | sí        |
| 4c  | `4c-image-href` (extra)          | `public/favicon.svg`: `<image href="https://example.com/n.png"/>` antes de `</svg>`                                                                  | 3         | @s3 0 veces <text… (["<image"]), @s3 0 veces "href"…, @s3 EXACTAMENTE 1 vez "http"                                                                                                           | sí        |
| 5a  | `5a-ico-ancho16a24`              | `public/favicon.ico`: byte 6 (ancho de la entrada 0) 16 → 24                                                                                         | 6         | @s4 ANCLA 16×16, @s4 mezcla 16×16, @s5 medidas ([24,16]), @s5 PNG completo 16, @s5 ANCLA central 16, @s5 esquinas 16 (los de 16 caen con «no trae una imagen de 16×16»)                      | sí        |
| 5b  | `5b-ico-32a48`                   | `public/favicon.ico`: bytes 22 y 23 (ancho y alto de la entrada 1) 32 → 48                                                                           | 8         | @s4 ANCLA 32×32, @s4 mezcla 32×32, @s5 medidas ([48,48]), @s5 PNG completo 32, @s5 ANCLA central 32, @s5 esquinas 32, @s7 ANCLA 32, @s7 caja 32                                              | sí        |
| 5c  | `5c-ico-alto16a17`               | `public/favicon.ico`: byte 7 (alto de la entrada 0) 16 → 17                                                                                          | 6         | los mismos 6 que 5a ([16,17])                                                                                                                                                                | sí        |
| 5d  | `5d-ico-intercambio` (extra)     | `public/favicon.ico`: bytes 6-7 16 → 32 y 22-23 32 → 16 (medidas intercambiadas; el inventario ordenado sigue siendo {16, 32})                       | 6         | @s4 ANCLA 16×16 (1024 ≠ 256), @s4 ANCLA 32×32 (256 ≠ 1024), @s5 PNG completo 16 (**IHDR 32 ≠ su entrada**), @s5 PNG completo 32 (IHDR 16 ≠ 32), @s5 ANCLA central 32 (alfa 120), @s7 caja 32 | sí        |
| 6a  | `6a-apple-tipo6`                 | `public/apple-touch-icon.png` recodificado como **tipo de color 6** (RGBA): mismos RGB, alfa 255 en todo píxel; trozos IHDR·IDAT·IEND                | 1         | @s6 su IHDR declara 180×180, profundidad 8, tipo de color 2 …                                                                                                                                | sí        |
| 6b  | `6b-apple-trns`                  | `public/apple-touch-icon.png` en tipo 2 con un trozo **tRNS** (R G B de 16 bits = el RGB de su esquina, --accent-soft) entre IHDR e IDAT             | 1         | @s6 no contiene ningún trozo "tRNS" (["IHDR","tRNS","IDAT","IEND"])                                                                                                                          | sí        |
| 7a  | `7a-borrar-favicon.svg`          | borrado (rm) de public/favicon.svg                                                                                                                   | 10        | @s2 ANCLA, @s2 viewBox/rect, @s2 d, @s2 stroke; los 5 de @s3; @s4 colores del SVG (ENOENT)                                                                                                   | sí        |
| 7b  | `7b-borrar-favicon.ico`          | borrado (rm) de public/favicon.ico                                                                                                                   | 15        | @s4 ANCLA 16 y 32, @s4 mezcla 16 y 32; los 9 de @s5; @s7 ANCLA 32, @s7 caja 32 (ENOENT)                                                                                                      | sí        |
| 7c  | `7c-borrar-apple-touch-icon.png` | borrado (rm) de public/apple-touch-icon.png                                                                                                          | 8         | @s4 ANCLA Apple, @s4 mezcla Apple; los 4 de @s6; @s7 ANCLA 180, @s7 caja 180 (ENOENT)                                                                                                        | sí        |
| 8a  | `8a-ico32_2_0`                   | ICO, PNG de 32: «N» **+2 px en x** (decodificar → mover el RGB → recodificar; el alfa se queda en su sitio y lo que entra de fuera es --accent-soft) | 1         | @s7 a 32 px la caja … (caja 6–30 × 7–25; desvíos izq 2,02 · der 2,00)                                                                                                                        | sí        |
| 8b  | `8b-apple180_2_0`                | apple-touch-icon: «N» **+2 px en x**                                                                                                                 | 1         | @s7 a 180 px la caja … (24–159 × 37–143; izq 1,64 · der 1,47)                                                                                                                                | sí        |
| 8c  | `8c-ico32_0_2` (extra)           | ICO 32: **+2 px en y**                                                                                                                               | 1         | @s7 a 32 px (4–28 × 9–27; arr 2,51 · abj 1,51)                                                                                                                                               | sí        |
| 8d  | `8d-apple180_0_2` (extra)        | apple 180: **+2 px en y**                                                                                                                            | 1         | @s7 a 180 px (22–157 × 39–145; arr 2,51 · abj 1,60)                                                                                                                                          | sí        |
| 8e  | `8e-ico32_-2_0` (extra)          | ICO 32: **−2 px en x**                                                                                                                               | 1         | @s7 a 32 px (2–26 × 7–25; izq 1,98 · der 2,00)                                                                                                                                               | sí        |
| 8f  | `8f-apple180_-2_0` (extra)       | apple 180: **−2 px en x**                                                                                                                            | 1         | @s7 a 180 px (20–155 × 37–143; izq 2,36 · der 2,53)                                                                                                                                          | sí        |

**Resultado: 8/8 sabotajes en rojo** (todas sus variantes: 27/27). El 8 queda AISLADO: en sus seis
variantes solo cae @s7; la paleta (@s4), las esquinas (@s5/@s6) y la estructura siguen verdes.

### 3.1 Controles del sabotaje 8 (no son sabotajes: validan la herramienta y el ciego de 1 px)

- [V] `8-ctrl-recodificar`: decodificar y recodificar SIN desplazar el PNG de 32 del ICO y el apple-touch-icon
  deja `git status --porcelain` vacío **antes** de correr el test, porque mi codificador reproduce los bytes
  del generador. 40/40. Así, el rojo de 6a/6b/8x es del sabotaje y no del re-codificado.
- [V] Caja de partida (misma definición que el contrato): 32 px → 4–28 × 7–25 (desvíos izq/der/arr/abj
  0,02 · 0,00 · 0,51 · 0,49); 180 px → 22–157 × 37–143 (0,36 · 0,53 · 0,51 · 0,40). Coincide con la
  bitácora del generador.
- [V] Desplazamientos de **1 px** (el contrato lo declara ciego):

  | raster | +1 x                        | −1 x                           | +1 y                | −1 y                |
  | ------ | --------------------------- | ------------------------------ | ------------------- | ------------------- |
  | 32     | **ROJO** (izq 1,02)         | verde (izq 0,98 · der 1,00)    | **ROJO** (arr 1,51) | **ROJO** (abj 1,49) |
  | 180    | verde (izq 0,64 · der 0,47) | **ROJO** (izq 1,36 · der 1,53) | **ROJO** (arr 1,51) | **ROJO** (abj 1,40) |

### 3.2 Sabotaje 9 — EXTRA para el lead (lo juzga @s10 en vivo)

- [V] `hacer-copias.mjs` copia `tools/favicon/generar.mjs` al scratchpad en dos variantes (cada reemplazo,
  exactamente una vez): **control** (solo `RAIZ` fija a la ruta del repo) y **sin trazo** (además,
  `if (dentroPorNonzero(x, cruces) || bajoElTrazo(x, y, cercanos, medio)) deTinta[i]++` →
  `if (dentroPorNonzero(x, cruces)) deTinta[i]++`). Las dos escriben con `--salida` en el scratchpad, NUNCA
  en `public/`.
- [V] Control: sus tres salidas son **byte a byte idénticas** a `public/` (`cmp`). Sin trazo: el SVG sale
  idéntico (el sabotaje es solo del raster); `favicon.ico` (1109 B) y `apple-touch-icon.png` (3683 B)
  difieren. Quedan en `…/scratchpad/sabotajes/sin-trazo/` para el lead.
- [V] Cobertura de tinta C = Σ t·α/255 (t = proyección sobre --accent-soft → --ink de `_tokens.scss`):

  | lado | C con trazo (`public/`) | C sin trazo | sin / con |
  | ---- | ----------------------- | ----------- | --------- |
  | 16   | 27,25                   | 19,63       | 72,0 %    |
  | 32   | 108,95                  | 78,43       | 72,0 %    |
  | 180  | 3448,37                 | 2482,25     | 72,0 %    |

| nº  | Etiqueta (C)              | Qué se copió temporalmente a `public/`                     | Rojos /40 | `it` en rojo                                                                                                   | Revertido |
| --- | ------------------------- | ---------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- | --------- |
| 9   | `9-sin-trazo-ambos`       | `sin-trazo/favicon.ico` y `sin-trazo/apple-touch-icon.png` | 1         | @s7 a 180 px (caja 23–156 × 38–142; der 1,53 · arr 1,51 · abj 1,40). A 32 px, 4–28 × 7–25: igual que con trazo | sí        |
| 9b  | `9b-sin-trazo-solo-ico`   | solo `sin-trazo/favicon.ico`                               | **0**     | — (**40/40 verde**: ver HALLAZGO H-2)                                                                          | sí        |
| 9c  | `9c-sin-trazo-solo-apple` | solo `sin-trazo/apple-touch-icon.png`                      | 1         | @s7 a 180 px                                                                                                   | sí        |

La caja sin trazo a 180 px (23–156 × 38–142) es exactamente la que predijo la sonda del gherkin_author [I → V].

### 3.3 Parte @s8 de los sabotajes 1 y 7 (ronda 2)

**Comando de cada fila** (C8): `pnpm exec vitest run src/pages/home-horneado.test.ts --reporter=default
--reporter=json --outputFile.json=<scratchpad>/s8/<etiqueta>.json`, que hace el `pnpm build` REAL de su
`beforeAll` en un temporal. Reversión: git checkout -- (fichero) + `git status --porcelain` sin rastreados
modificados → **sí** en TODAS. Scripts en `…/scratchpad/s8/`: `quitar-linea.mjs`, `revertir.sh`, `correr.sh`.

| nº     | Etiqueta (C8)                    | Qué se hizo exactamente                                                                | Rojos /42 | `it` de @s8 en rojo                                                                                                                                                                                                                     | ¿Cae algo fuera de @s8?   | Revertido |
| ------ | -------------------------------- | -------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------- |
| 1a-@s8 | `1a-sin-ico`                     | `index.html`: quitada la línea `<link rel="icon" href="/favicon.ico" sizes="32x32" />` | 5         | ANCLA («hallados: /NailsLashStudioWeb/favicon.svg · /NailsLashStudioWeb/apple-touch-icon.png», 2 ≠ 3), el 1.º (href …favicon.svg ≠ …favicon.ico), el 2.º (rel "apple-touch-icon" ≠ "icon"), el 3.º (no hay 3.º), el href del 3.º (`""`) | no (@s14 exit 0 en verde) | sí        |
| 1b-@s8 | `1b-sin-svg`                     | `index.html`: quitada `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`   | 4         | ANCLA (…favicon.ico · …apple-touch-icon.png), el 2.º, el 3.º, el href del 3.º                                                                                                                                                           | no                        | sí        |
| 1c-@s8 | `1c-sin-apple`                   | `index.html`: quitada `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`   | 3         | ANCLA (…favicon.ico · …favicon.svg), el 3.º, el href del 3.º                                                                                                                                                                            | no                        | sí        |
| 7a-@s8 | `7a-borrar-favicon.ico`          | borrado de public/favicon.ico                                                          | 2         | el 1.º (href **"/favicon.ico"** ≠ "/NailsLashStudioWeb/favicon.ico"), el href del 1.º («href del 1.º: "/favicon.ico"»)                                                                                                                  | no                        | sí        |
| 7b-@s8 | `7b-borrar-favicon.svg`          | borrado de public/favicon.svg                                                          | 2         | el 2.º (href "/favicon.svg"), el href del 2.º                                                                                                                                                                                           | no                        | sí        |
| 7c-@s8 | `7c-borrar-apple-touch-icon.png` | borrado de public/apple-touch-icon.png                                                 | 2         | el 3.º (href "/apple-touch-icon.png"), el href del 3.º                                                                                                                                                                                  | no                        | sí        |

**Resultado: la parte @s8 de los sabotajes 1 y 7 en rojo, 6/6.** Nada fuera de @s8 cayó en ninguna: el `pnpm
build` sale con 0 en las seis (las cinco puertas no ven ni un `<link>` de menos ni un icono que falta, H-5).

- [V] **Sabotaje 2 contra @s8** (el **[I]** del gherkin §2, «no se cuenta con ello»): `2a-base-svg`, `index.html`
  con `href="/favicon.svg"` → `href="/NailsLashStudioWeb/favicon.svg"` → **42/42 verde**. El 2 solo lo caza @s1
  (ronda 1, 2a-2c), H-6.

## 4. Sabotajes extra dirigidos (los opcionales del gherkin §3)

Sirven para que ningún `Then` dependa solo de un ENOENT o de un `throw`. Mismo comando C y misma reversión.

| nº  | Etiqueta                    | Qué se hizo exactamente                                                   | Rojos | `it` en rojo                                                                                                                              | Revertido |
| --- | --------------------------- | ------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| E1  | `E1-sizes-any`              | `index.html`: `sizes="32x32"` → `sizes="any"`                             | 1     | @s1 el 1.º                                                                                                                                | sí        |
| E2  | `E2-sin-type`               | `index.html`: quitado `type="image/svg+xml"`                              | 1     | @s1 el 2.º                                                                                                                                | sí        |
| E3  | `E3-rx0-favicon`            | `public/favicon.svg`: `rx="324"` → `rx="0"`                               | 1     | @s2 viewBox y rect IDÉNTICOS al oráculo                                                                                                   | sí        |
| E4  | `E4-d-numero`               | `public/favicon.svg`: `M1001 147Q` → `M1002 147Q` en el `d`               | 1     | @s2 el d IDÉNTICO al oráculo                                                                                                              | sí        |
| E5  | `E5-stroke0`                | `public/favicon.svg`: `stroke-width="18"` → `"0"` (la variante SVG del 9) | 1     | @s2 stroke-width "18" y stroke-linejoin "round"                                                                                           | sí        |
| E6  | `E6-sin-cabecera`           | `public/favicon.svg`: quitado todo lo anterior a `<svg` (el comentario)   | 1     | @s3 comentario con "tools/favicon/generar.mjs" y "no se edita a mano"                                                                     | sí        |
| E7  | `E7-segundo-path`           | `public/favicon.svg`: `<path d="M0 0Z"/>` antes de `</svg>`               | 1     | @s2 ANCLA: EXACTAMENTE un `<svg>`, un `<rect>` y un `<path>`                                                                              | sí        |
| E8  | `E8-rx0-oraculo`            | `docs/research/favicon/aprobado-B.svg`: `rx="324"` → `rx="0"`             | 2     | @s2 ANCLA A MANO del oráculo, @s2 viewBox y rect IDÉNTICOS                                                                                | sí        |
| E9  | `E9-ico-truncado`           | `public/favicon.ico` truncado 10 bytes (1148 → 1138)                      | 2     | @s5 desplazamiento + tamaño ≤ longitud, @s5 la entrada de 32 px es un PNG completo                                                        | sí        |
| E10 | `E10-esquinas16-opacas`     | ICO 16: las 4 esquinas a alfa 255 (RGB --accent-soft)                     | 1     | @s5 en el PNG de 16 px, las cuatro esquinas tienen alfa ≤ 25                                                                              | sí        |
| E11 | `E11-apple-esquinas-negras` | apple 180: las 4 esquinas a RGB (0, 0, 0)                                 | 3     | @s4 mezcla en el apple-touch-icon, @s6 esquinas = --accent-soft, @s7 a 180 px (el negro cuenta «de tinta» y la caja llega a las esquinas) | sí        |
| E12 | `E12-ico32-pixel-azul`      | ICO 32: píxel (16, 16) a (0, 0, 255), alfa 255                            | 1     | @s4 en el PNG de 32×32, todo píxel con alfa > 0 es mezcla                                                                                 | sí        |

**Cobertura por `it`** [V, calculada sobre los 56 informes JSON de esta ronda]: **39 de los 40** `it` caen con
al menos un sabotaje (sin contar los dos Rojos de §2). El único que no: **«@s4 ANCLA POSITIVA: \_tokens.scss
declara EXACTAMENTE una vez --accent-soft: y --ink: …»**. Su sabotaje propuesto (duplicar la línea de
`--ink` en `src/styles/_tokens.scss`) NO se ha demostrado A PROPÓSITO: toca `src/`, y el lead y el arnés
construyen en paralelo en este mismo directorio. Queda para el `judge` o el lead, si lo quieren.

### 4.1 Ronda 2 (@s8): extra dirigidos

Mismo comando C8 de §3.3. Existen porque en el sabotaje 7 el `it` de bytes cae en su GUARDA de prefijo (Vite deja
el `href` sin la base), nunca en «existe», «> 0 bytes» ni «byte a byte igual» (H-5). E13-E15 mutan SOLO el
artefacto TEMPORAL de la propia corrida (sin build nuevo, sin tocar el proyecto): un vigilante
(`…/scratchpad/s8/mutar-artefacto.mjs`) espera al `nls-horneado-*/dist` que crea el `beforeAll` después de
arrancar él (aborta si ve más de uno), aguarda a que el SSG haya escrito su `index.html` (con «ld+json») y muta
el fichero mientras corren las cinco puertas, antes de los `it`.

| nº  | Etiqueta (C8)                 | Qué se hizo exactamente                                                                             | Rojos /42 | `it` en rojo                                                                                                                                          | Revertido                               |
| --- | ----------------------------- | --------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| E13 | `E1-artefacto-sin-svg`        | artefacto temporal: quitado `favicon.svg` (10:21:13; 2244 B → no existe)                            | 1         | @s8 el href del 2.º («favicon.svg en el artefacto: expected undefined to be true»): **«existe»**                                                      | n/a: temporal (lo retira el `afterAll`) |
| E14 | `E2-artefacto-ico-vacio`      | artefacto temporal: `favicon.ico` a 0 bytes (10:22:13; 1148 B → 0)                                  | 1         | @s8 el href del 1.º («favicon.ico: bytes en el artefacto: expected 0 to be greater than 0»): **«> 0 bytes»**                                          | n/a: temporal                           |
| E15 | `E3-artefacto-apple-alterado` | artefacto temporal: último byte de `apple-touch-icon.png` XOR 0xFF (10:21:40; 3682 B → 3682 B)      | 1         | @s8 el href del 3.º («apple-touch-icon.png: artefacto ≠ public/»): **«byte a byte IGUAL»**                                                            | n/a: temporal                           |
| E16 | `E4-cuarto-icono`             | `index.html`: añadido, tras el apple-touch-icon, `<link rel="shortcut icon" href="/favicon.ico" />` | 1         | @s8 ANCLA («hallados: … · /NailsLashStudioWeb/favicon.ico», 4 ≠ 3): el `rel` se trocea en tokens; los posicionales siguen verdes (el 4.º va al final) | sí                                      |

**Cobertura por `it` de @s8** [V, sobre los 14 informes JSON conservados de la ronda 2]: **7 de 7** caen con al
menos un sabotaje: ANCLA (1a, 1b, 1c, E16) · el 1.º (1a, 7a) · el 2.º (1a, 1b, 7b) · el 3.º (1a, 1b, 1c, 7c) · el
href del 1.º (7a, E14) · del 2.º (7b, E13) · del 3.º (1a, 1b, 1c, 7c, E15). Con la ronda 1: **46 de los 47** `it`
de F-28 (sigue fuera el mismo de @s4).

## 5. PENDIENTE

- ~~@s8~~ HECHO en la ronda 2 (§1, §2.1, §3.3, §4.1), con la parte @s8 de los sabotajes 1 y 7.
- **Sabotaje 9 = @s10** (en vivo, del lead): los raster sin trazo están en
  `…/scratchpad/sabotajes/sin-trazo/`, y la copia del generador en `gen-sin-trazo.mjs`. En bytes, solo los
  caza @s7 a 180 px; el ICO sin trazo solo lo puede cazar @s10 (H-2).
- @s9 (en vivo, del lead).
- No marco `done`: faltan el `judge` y la verificación en vivo (@s9, @s10). La mutación de Stryker NO aplica
  (declarado en el contrato); la compensan estos sabotajes.

## 6. HALLAZGOS

Ninguno de los sabotajes 1-8 dejó la suite en verde: **no hay hallazgo bloqueante** y no se ha tocado ningún
test. Lo que sigue es información para el lead y el `judge`:

- **H-1 · El «ciego de 1 px» es más estrecho de lo declarado** (§3.1). El contrato y el gherkin dicen que 1 px
  cabe en la tolerancia de ±1. Medido: de 8 desplazamientos de 1 px, **6 caen en rojo**; solo pasan 32 px
  −1 x (el caso que cita el gherkin) y 180 px +1 x. No es un defecto: la caja medida es entera y la esperada
  no, así que un borde que ya se aparta d > 0 del esperado se sale con 1 + d al moverse 1 px hacia ese lado.
  Las holguras de partida (desvíos 0,00-0,53) dejan el resultado a merced del sentido, nada más.
- **H-2 · Un ICO sin trazo es invisible para los bytes** (9b: 40/40). Con el apple-touch-icon correcto,
  NINGÚN test de `favicon-marca.test.ts` ve que a 16 y 32 px falte el trazo: a 32 px la caja es idéntica con
  y sin él (4–28 × 7–25), y a 16 px no hay caja. Es el ciego que el contrato YA declara en @s7 («la caja …
  NO ve el trazo a 32 px … eso es @s10 (FS-3)»): queda **confirmado [V]**. Por tanto @s10 debe medirse
  **también sobre el ICO** (16 y 32), no solo sobre el 180; si no, ese caso queda sin guardia.
- **H-3 · «IHDR con SUS medidas» (@s5) solo cae de verdad con 5d.** En 5a-5c, la entrada con la medida rota
  deja de encontrarse y el `it` cae por el `throw` de `entradaDeLado` («no trae una imagen de 16×16»), no por
  la comparación del IHDR. Quien demuestra la aserción es 5d (medidas intercambiadas; el inventario sigue
  siendo {16, 32}): `{ ancho: 32 … }` ≠ `{ ancho: 16 … }`.
- **H-4 · Herramienta de sabotaje validada**: el re-codificado sin cambios da bytes idénticos a HEAD, y la
  copia de control del generador reproduce `public/` byte a byte. Los rojos de 6, 8 y 9 son, por tanto,
  del sabotaje y no del método.

### Ronda 2 (@s8)

- **H-5 · El sabotaje 7 reproduce el H-2 dentro del build, y las cinco puertas no lo ven** [V: 7a-7c]. Si el fichero
  falta en `public/`, `vite-react-ssg build` deja el `href` SIN la base (`/favicon.ico`, la raíz del origen: el
  404 del H-2 en GitHub Pages) y sale con 0: F-05 lo da por ruta propia y la anti-404 de F-04 solo lee los
  enlaces `<a>`. En el pipeline del build solo lo caza @s8 (y, en bytes, @s2-@s7 por el fichero que falta).
  Consecuencia para el test: en 7a-7c el `it` de bytes cae en su GUARDA de prefijo, no en «existe / > 0 /
  igual»; esas tres aserciones solo las demuestran E13-E15 (§4.1), sobre el artefacto temporal.
- **H-6 · El sabotaje 2 es invisible para @s8** [V: 2a-base-svg, 42/42]. Vite no reconoce
  `/NailsLashStudioWeb/favicon.svg` como fichero de `public/` y lo deja tal cual, que es justo el `href` esperado,
  y el fichero existe en el artefacto. Lo preveía el gherkin («no se cuenta con ello»): el 2 es de @s1.
- **H-7 · «Uno por fila» lo guarda SOLO el ancla** [V: E16]. Un 4.º icono añadido al final deja verdes los tres
  posicionales y los tres de bytes; cae el «EXACTAMENTE 3». Es lo que pide el contrato (caso límite 3).
- **H-8 · Concurrencia con la verificación en vivo del lead.** Durante la ronda aparecieron, sin rastrear,
  `docs/research/favicon/verificacion-viva/`, `progress/verificacion_viva_favicon_marca/` y
  `progress/verificacion_viva_favicon_marca.md` (del lead; no los he tocado). Ventanas en que un fichero
  RASTREADO estuvo saboteado (cada corrida dura 10-14 s): `index.html` ≈ 10:17:25-10:17:40 (1a, primera pasada),
  10:18:06-10:18:49 (1a, 1b, 1c), 10:22:18-10:22:31 (E16), 10:22:58-10:23:11 (R) y 10:24:12-10:24:25 (2a);
  `public/` 10:19:15-10:19:56 (7a, 7b, 7c) y 10:22:58-10:23:11 (R). Si alguna medida en vivo leyó `index.html` o
  `public/`, o construyó, dentro de esas ventanas, conviene repetirla. El `dist/` del proyecto no lo tocó ninguna
  corrida (H-3 en verde en las 16; `dist/index.html` sigue con mtime 10:12:48) y los ficheros restaurados son
  los de HEAD (`git status --porcelain` sin ellos).
