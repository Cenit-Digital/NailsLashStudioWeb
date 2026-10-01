# F-28 `favicon_marca` — PARTE B: mapa @s → test, Rojo → Verde y sabotajes

> `tdd_craftsman`, 2026-10-01. Rama `claude/favicon-marca`, HEAD `ddcc9cf`. Contrato APROBADO:
> `features/favicon_marca.feature`. Generador (parte A): `progress/tdd_favicon_marca_generador.md`.
> Etiquetas: **[V]** medido por mí en esta ronda · **[L]** medido por el lead · **[I]** inferencia.
>
> Reglas de esta ronda: SOLO `pnpm exec vitest run src/pages/favicon-marca.test.ts` (ni suite completa,
> ni `pnpm build`, ni `harness`); ficheros creados solo por Bash; cada sabotaje se aplica, se mide, se
> revierte con git checkout -- (fichero) y se comprueba `git status --porcelain` SIN ningún fichero
> rastreado modificado antes del siguiente. Ningún test, `tools/`, `index.html` ni `public/` queda tocado.

## 0. Verde de partida y de llegada

- [V] Partida (2026-10-01 09:44): `pnpm exec vitest run src/pages/favicon-marca.test.ts` → **40/40**,
  `Duration 2.19s` (≈ 6,1 s de reloj con el arranque de pnpm).
- [V] Llegada, tras los 56 runs de esta ronda (09:57): **40/40**, `Duration 2.34s`; `git status --porcelain`
  vacío.

## 1. Mapa @s → test

Fichero único de @s1-@s7: `src/pages/favicon-marca.test.ts` (no importa nada de `src/` ni el generador).

| @s  | `describe` (líneas) | `it` (nombre; en los `it.each`, la plantilla y sus casos)                                                                | nº     |
| --- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------ |
| @s1 | 96-132              | ANCLA POSITIVA: EXACTAMENTE 3 `<link>` de icono en `<head>`, y EXACTAMENTE 3 en el fichero entero                        | 1      |
|     |                     | el 1.º: rel "icon", href exactamente "/favicon.ico" y sizes "32x32"                                                      | 1      |
|     |                     | el 2.º: rel "icon", href exactamente "/favicon.svg" y type "image/svg+xml"                                               | 1      |
|     |                     | el 3.º: rel "apple-touch-icon" y href exactamente "/apple-touch-icon.png"                                                | 1      |
|     |                     | ningún href empieza por "/NailsLashStudioWeb/" ni por "//", ni contiene ":"                                              | 1      |
| @s2 | 174-213             | ANCLA POSITIVA: cada fichero tiene EXACTAMENTE un `<svg>`, un `<rect>` y un `<path>`                                     | 1      |
|     |                     | ANCLA A MANO del oráculo: viewBox, rect y el principio y el fin de su d                                                  | 1      |
|     |                     | el viewBox y los x, y, width, height y rx del `<rect>` son IDÉNTICOS, como cadena, a los del oráculo                     | 1      |
|     |                     | el d del `<path>` es IDÉNTICO, como cadena, al del oráculo                                                               | 1      |
|     |                     | el `<path>` lleva stroke-width "18" y stroke-linejoin "round"                                                            | 1      |
| @s3 | 241-278             | ANCLA POSITIVA: contiene el xmlns del SVG y un "<path"                                                                   | 1      |
|     |                     | contiene 0 veces <text, <image, <use, <style, <script y <foreignObject                                                   | 1      |
|     |                     | contiene 0 veces "href", "url(" y "@import"                                                                              | 1      |
|     |                     | contiene EXACTAMENTE 1 vez "http", y es la del xmlns                                                                     | 1      |
|     |                     | antes de la primera "<svg" hay un comentario con "tools/favicon/generar.mjs" y "no se edita a mano"                      | 1      |
| @s4 | 617-663             | ANCLA POSITIVA: \_tokens.scss declara EXACTAMENTE una vez --accent-soft: y --ink:, cada una #RRGGBB, y son DISTINTAS     | 1      |
|     |                     | el fill del `<rect>` es --accent-soft y el fill y el stroke del `<path>` son --ink                                       | 1      |
|     |                     | ANCLA POSITIVA: $nombre tiene $pixeles píxeles, al menos uno --accent-soft opaco y al menos uno de tinta (16, 32, Apple) | 3      |
|     |                     | en $nombre, todo píxel con alfa > 0 es mezcla de --accent-soft y --ink (±2 por canal) (16, 32, Apple)                    | 3      |
| @s5 | 682-741             | ANCLA POSITIVA: la cabecera tiene reservado 0, tipo 1 y EXACTAMENTE 2 entradas                                           | 1      |
|     |                     | las medidas declaradas son una de 16×16 y otra de 32×32                                                                  | 1      |
|     |                     | en cada entrada, desplazamiento + tamaño ≤ la longitud del fichero                                                       | 1      |
|     |                     | la entrada de %i px es un PNG completo: firma, IHDR con SUS medidas, profundidad 8, tipo 6, … e IEND justo al final      | 2      |
|     |                     | ANCLA POSITIVA: en el PNG de %i px, el píxel central del borde superior es --accent-soft opaco                           | 2      |
|     |                     | en el PNG de %i px, las cuatro esquinas tienen alfa ≤ 25                                                                 | 2      |
| @s6 | 745-780             | ANCLA POSITIVA: empieza por la firma PNG, su primer trozo es IHDR y el último es IEND, que acaba en el último byte       | 1      |
|     |                     | su IHDR declara 180×180, profundidad 8, tipo de color 2 (RGB) y sin entrelazado                                          | 1      |
|     |                     | no contiene ningún trozo "tRNS"                                                                                          | 1      |
|     |                     | los píxeles (0, 0), (179, 0), (0, 179) y (179, 179) tienen EXACTAMENTE el RGB de --accent-soft                           | 1      |
| @s7 | 817-841             | ANCLA POSITIVA: el raster de $lado px tiene al menos un píxel de tinta (32, 180)                                         | 2      |
|     |                     | a $lado px la caja de tinta está a ±1 px de ($x0, $y0)–($x1, $y1) (32, 180)                                              | 2      |
| @s8 | —                   | **PENDIENTE** (§5): irá en `src/pages/home-horneado.test.ts`, sobre el `beforeAll` existente                             | 0      |
|     |                     | **Total del fichero**                                                                                                    | **40** |

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

## 5. PENDIENTE

- **@s8** (`src/pages/home-horneado.test.ts`, SOLO AÑADIR, sobre el `beforeAll` y el `dist/` existentes, con
  la extracción de F-04 @s40): NO existe aún; el lead decide su base (la PR #17 reescribe
  `home-horneado.test.ts`). Con él quedan pendientes:
  - la parte @s8 del **sabotaje 1** (quitar un `<link>` → @s8 «EXACTAMENTE 3» en `dist/index.html`);
  - la parte @s8 del **sabotaje 7** (borrar un fichero de `public/` → el gemelo de `dist/` no existe);
  - las dos exigen un `pnpm build` real, PROHIBIDO en esta ronda.
- **Sabotaje 9 = @s10** (en vivo, del lead): los raster sin trazo están en
  `…/scratchpad/sabotajes/sin-trazo/`, y la copia del generador en `gen-sin-trazo.mjs`. En bytes, solo los
  caza @s7 a 180 px; el ICO sin trazo solo lo puede cazar @s10 (H-2).
- @s9 (en vivo, del lead).
- No marco `done`: faltan @s8, el `judge` y la verificación en vivo. La mutación de Stryker NO aplica
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
