# F-28 `favicon_marca` — PARTE A: el generador

> `tdd_craftsman` (parte A), 2026-09-30. Contrato: `features/favicon_marca.feature` (aprobado).
> Etiquetas: **[V]** medido en esta sesión · **[I]** inferencia.

## Qué es

`tools/favicon/generar.mjs`: Node puro, cero dependencias (`node:fs`, `node:zlib`, `node:path`,
`node:url`). Sin tests ni mutación propios (Contrato 4, precedente `aplicador.mjs`): lo verifican sus
SALIDAS en `src/pages/favicon-marca.test.ts` (parte B).

1. Lee la «N» de `node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff`
   (WOFF1 → sfnt → cmap 4 → glyf) y compone el `d` con el formato de números de
   `prototipo-glifos.mjs` (lógica copiada y adaptada; no importa de `docs/`).
2. Lee `--accent-soft` y `--ink` de `src/styles/_tokens.scss` (exige UNA declaración `#RRGGBB` de
   cada una; si no, lanza). Ningún hex a mano.
3. Geometría como `prototipo-candidatos.mjs`: caja de todos los puntos del glifo, margen 13 %,
   `rx = round(0,2 · lado)`.
4. `favicon.svg`: comentario de cabecera (sin `--`, que XML prohíbe dentro de un comentario, y sin
   «href», «http» ni «<svg») + la estructura exacta de `aprobado-B.svg`.
5. Rasterizador propio sobre el MISMO `d`: Q aplanadas a 16 pasos, NONZERO o distancia ≤ 9 al
   contorno (trazo 18, unión redonda), cuadrado redondeado rx 324, supermuestreo 8×8 en los tres
   tamaños, alfa recto (`t = tinta / muestras del cuadrado`; si α = 0, RGB = soft).
6. `favicon.ico` (2 entradas, 16 y 32, planes 1, bpp 32, PNG RGBA dentro) y `apple-touch-icon.png`
   (180, RGB tipo 2, a sangre, sin tRNS). PNG a mano: IHDR · IDAT (filtro 0, deflate 9) · IEND, CRC32.

## Cómo se ejecuta

```
node tools/favicon/generar.mjs                  # escribe en public/ (paso Verde de la parte B)
node tools/favicon/generar.mjs --salida <dir>   # a otro directorio
```

Tarda ≈ 0,6 s [V]. **NO lo he ejecutado sobre `public/`** [V: `git status` sin `public/favicon*`]:
ese es el paso Verde de la parte B.

## Autocomprobación (scripts desechables en el scratchpad, salida en el scratchpad)

- [V] `d` IDÉNTICO como cadena al de `aprobado-B.svg`; y el SVG entero, quitada la cabecera, es
  idéntico al oráculo byte a byte (mismos hex porque los tokens coinciden).
- [V] SVG: 1 `<svg`, 1 `<rect`, 1 `<path`; 0 de `<text`/`<image`/`<use`/`<style`/`<script`/
  `<foreignObject`/`href`/`url(`/`@import`; «http» 1 vez. Cabecera antes de `<svg` con
  «tools/favicon/generar.mjs» y «no se edita a mano», sin «href»/«http»/«<svg» ni «--» interno.
- [V] ICO: reservado 0, tipo 1, 2 entradas (16×16 off 38 tam 372; 32×32 off 410 tam 738; fin 1148 =
  longitud), planes 1, bpp 32; cada PNG con firma, IHDR (tipo 6, prof 8, sin entrelazado) y IEND que
  acaba exactamente en desplazamiento + tamaño.
- [V] Esquinas del ICO: α = 0 en las 4 a 16 y a 32 px. Píxel (8,0) a 16 y (16,0) a 32: α 255 y RGB =
  soft exacto.
- [V] Apple: 180×180, tipo 2, prof 8, sin entrelazado, trozos IHDR·IDAT·IEND (sin tRNS), IEND acaba en
  el último byte; las 4 esquinas = soft exacto.
- [V] Paleta: desvío máximo al segmento soft→ink = 0,51 por canal en los tres raster (≤ 2).
- [V] Caja de tinta (bordes): 32 px → x 4–28, y 7–25 (esperado 3,98–28,00 × 6,49–25,49, ±1: pasa);
  180 px → x 22–157, y 37–143 (esperado 22,36–157,53 × 36,49–143,40, ±1: pasa). 16 px: 2–14 × 4–12
  (sin escenario).

### Cobertura de tinta C = Σ t·α/255 (para @s10, del lead)

| lado | con trazo | sin trazo | sin / con |
| ---- | --------- | --------- | --------- |
| 16   | 27,25     | 19,63     | 72,0 %    |
| 32   | 108,95    | 78,43     | 72,0 %    |
| 180  | 3448,37   | 2482,25   | 72,0 %    |

[V] sobre el raster de este generador (sin trazo = copia desechable con `GROSOR_TRAZO = 0`). Coincide
con el ≈ 72 % de la sonda del gherkin_author [I: no es Chromium; la calibración real es @s10].

## Calidad

- [V] `pnpm exec prettier --check tools/favicon/generar.mjs` → limpio (tras `--write`).
- [V] `pnpm exec eslint tools/favicon/generar.mjs` → exit 0.
- No he corrido `pnpm test` ni `pnpm build` (instrucción del lead).

ESTADO: LISTO
