# Verificación EN VIVO — F-27 `catalogo_fotos` · 2026-09-30

> La hace el `craftsman_lead` (I-8: `pnpm build` → servir → navegador real). Cubre los escenarios
> `@verificacion-viva` de `features/catalogo_fotos.feature`: @s22-@s26.

## Montaje

- **Artefacto:** `pnpm build` sobre `5482984` (TDD de F-27, suite 1760/1760), exit 0 y las 5 puertas en verde.
- **Copia INMUTABLE** de `dist/` en el scratchpad (36 ficheros, huella MD5), servida con
  `vite preview --outDir <copia> --port 4176`. Al terminar, la copia seguía **intacta**. Motivo: el hallazgo H-3
  de F-25. Los hooks del arnés rehacen `dist/` al editar y al parar.
- **Navegador:** Chromium 141 (`/opt/pw-browsers/chromium`) con Playwright y CDP (`Network.setBlockedURLs`,
  `PerformanceObserver`), `deviceScaleFactor` 1. **Script:** `vivo_f27.mjs todos`, en el scratchpad de la sesión.
- **Resultado de la primera pasada:** 23 comprobaciones, **23 ✓**. Revisando los números salió el hallazgo
  H-1 (abajo), que el script no miraba.

## Resultados

| @s   | Resultado | Lo medido                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| @s22 | ✓ (5)     | En los bytes de `dist/index.html` hay EXACTAMENTE tres `<img>` en la sección, en orden: `/NailsLashStudioWeb/assets/servicio-unas-manicura-nude-1SL7l6RF.jpg`, `…facial-pestanas-BGNHbAat.jpg` y `…depilacion-piel-suave-DkKm7LKJ.jpg`. Cada una con el `alt` exacto, `width="800"`, `height="1000"` y `loading="lazy"`. Los tres `.jpg` tienen huella y no hay terceros. La leyenda de fotos aparece UNA vez, en el `<p>` justo después del de precios. Ningún `preload` de imagen. |
| @s23 | ✓ (7)     | A 320/360/375/390/414/768/1280: las tres con `complete`, 800 × 1000 naturales, alto = ancho × 1,25 (± 1 px), `object-fit: cover`, `border-radius: 22px`, la clase del hueco en exactamente 3 elementos, peticiones solo al propio origen y los tres `.jpg` con 200. A 320, una columna. Sin desbordamiento horizontal. **Ver H-1:** a 320 la caja mide 274 × 342, no 272 × 340.                                                                                                      |
| @s24 | ✓ (7)     | A los 7 anchos, tras «Ver servicios» y con las tres fotos cargadas: **CLS 0** (ningún `layout-shift`) y el `<h2 id="servicios-titulo">` en la misma posición antes y después (Δ 0 px). Para esperar a las tres, el script pone `loading="eager"` tras el salto. No cambia la caja, que ya está reservada por `width`/`height` y `aspect-ratio`.                                                                                                                                      |
| @s25 | ✓ (2)     | **CF-6 ratificada por medida.** La foto de Uñas tiene `top` 939,5 px con `innerHeight` 800 (a 1280 × 800) y 900 (a 1440 × 900): cae FUERA del primer viewport en los dos tamaños. El LCP es el `<text>` «Nails Lash» del hero (176 ms y 216 ms), no una foto del catálogo. `loading="lazy"` en las tres se queda.                                                                                                                                                                    |
| @s26 | ✓ (2)     | A 320 y 1280, con los tres `.jpg` bloqueados: `naturalWidth` 0, la caja igual que con la foto cargada, `background-image` con `linear-gradient` y sin desbordamiento. Capturas `vivo27_s26_*.png`: el hueco rosa enseña el `alt` dentro de la caja.                                                                                                                                                                                                                                  |

## Hallazgos

- **H-1 · La foto sobresale 2 px de su columna (defecto de F-27, dentro del contrato).** El `<img>` computa
  `box-sizing: content-box`. Con `width: 100%` y el borde de 1 px, la caja mide columna + 2 px: 274 × 342 a
  320 px, cuando la columna mide 272, y 580 a 1280, cuando mide 578. Su borde derecho queda 2 px más allá que el
  de la carta de encima (298 frente a 296 a 320 px) y que el del contenido del contenedor (1242 frente a 1240 a
  1280). No provoca scroll horizontal, porque lo absorbe el padding de la sección, pero la foto ya no «ocupa el
  sitio del antiguo bloque» (@s5): el `<div>` de antes, sin `width`, encajaba justo. Además, @s23 espera
  ≈ 272 × 340. **Remedio:** `box-sizing: border-box` en `.foto`, con su test de bytes, por TDD, y la
  re-medida en vivo.

## Re-verificación tras la ronda delta (34bc89a) · 2026-09-30

- **Artefacto:** `pnpm build` sobre `34bc89a`, exit 0 y las 5 puertas en verde. La copia inmutable se rehízo, se
  sirvió en 4176 y siguió intacta; el CSS horneado lleva `box-sizing:border-box`.
- **`vivo_f27.mjs todos`: 23/23 ✓** (@s22-@s26, todo igual que en la primera pasada salvo las cajas).
- **H-1 RESUELTO.** Ahora el `<img>` computa `box-sizing: border-box`:
  - a 320 px, la caja mide **272 × 340**, justo la cifra de la spec (@s23), y su borde derecho queda en 296,
    igual que el de la carta de encima (296);
  - a 1280 px mide 578 × 722,5 y su borde derecho queda en 1240, igual que el del contenido del contenedor (1240);
  - @s26 (foto bloqueada) conserva la misma caja, 272 × 340 a 320 px, con el degradado y el `alt`.
