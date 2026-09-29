# Selección de fotos — F-26 `hero_foto` y F-27 `catalogo_fotos` (2026-09-29)

> La hace el `craftsman_lead` (precedente `progress/tdd_fotos_equipo_galeria.md`: el lead busca,
> mira una a una y descarta rostros identificables; el `tdd_craftsman` solo las cablea). Decisión P1
> de Pablo: Pexels, selección autónoma.

## Cómo se buscó

- Red del entorno abierta por Pablo a «Completo» el 2026-09-29. `images.pexels.com` responde 200;
  `www.pexels.com` está tras el desafío anti-bots de Cloudflare («Just a moment…», 403 incluso con
  Chromium headless), así que las fichas NO se pudieron abrir. Los IDs salieron de búsquedas web
  sobre pexels.com y las fotos se descargaron del CDN oficial (`images.pexels.com/photos/<id>/…`).
- 32 candidatas descargadas a baja resolución, revisadas en hojas de contacto. Descartadas: caras
  identificables (19242406, 3762562, 4586739, 5128220, 20593111, 5619448), fondos fuera de paleta
  (17471377 azul, 5871831 azul, 939836 bokeh oscuro), duplicados de lo que ya hay en la página
  (21412169 ≈ `equipo-extension-pestanas.jpg`) y servicios que el salón NO ofrece (láser 35103880 /
  5619448; cuchilla doméstica 5240766 — el salón depila con cera tibia).

## Elegidas

| Uso               | Pexels ID | Autor (si consta)                                            | Original descargado | Qué muestra                                                                      | Rostro                          |
| ----------------- | --------- | ------------------------------------------------------------ | ------------------- | -------------------------------------------------------------------------------- | ------------------------------- |
| Hero (F-26)       | 939835    | Valeria Boltneva (según la búsqueda)                         | 2400×1600           | Mano con manicura rosa y una uña con brillo, sobre fondo rosa pastel desenfocado | Ninguno                         |
| Uñas (F-27)       | 34373403  | —                                                            | 1125×1500           | Manos con manicura nude y anillos dorados sobre pelo blanco                      | Ninguno                         |
| Facial (F-27)     | 7479587   | Angela Roma (según la búsqueda)                              | 1000×1500           | Primer plano de pestañas largas sobre un párpado cerrado, tonos rosados          | No identificable (solo párpado) |
| Depilación (F-27) | 5202459   | Karolina Grabowska (EXIF: «KAROLINA GRABOWSKA / KABOOMPICS») | 2250×1500           | Mano extendiendo crema sobre una pierna suave, sobre arena                       | Ninguno                         |

⚠️ **Depilación — declarado honestamente:** Pexels no devolvió por búsqueda web ninguna foto de
depilación CON CERA sin cara identificable; la elegida comunica «piel suave» (la promesa de la
card: «para una piel suave más tiempo») sin afirmar una técnica que el salón no usa. Si Pablo
prefiere otra, se cambia el fichero y el alt, sin tocar la mecánica.

## Medidas de la foto del hero (para la decisión de contraste)

Luminancia relativa WCAG por píxel (foto reducida a 600×400):

| Filtro    | L mínima | percentil 1 | percentil 5 | mediana | píxel más oscuro |
| --------- | -------- | ----------- | ----------- | ------- | ---------------- |
| sin blur  | 0,137    | 0,252       | 0,346       | 0,704   | rgb(179, 66, 49) |
| blur 2 px | 0,151    | 0,267       | 0,349       | 0,701   | rgb(151, 93, 85) |
| blur 6 px | 0,163    | 0,291       | 0,363       | 0,696   | rgb(155, 97, 90) |

La foto es MUY clara (mediana 0,70; el píxel más oscuro 0,137, lejos del negro 0). Modelar el peor
under como negro puro obligaría a un velo ≈ 80–90 % que lavaría la foto; modelarlo como el píxel
más oscuro REAL de la foto (vigilado por un test que decodifique el JPEG commiteado, para que la
declaración no pueda mentir si alguien cambia la foto) permitiría un velo mucho más ligero con la
misma garantía AA. Decisión para la spec (`project-spec.md` §F-26).

## Ficheros

Optimizados por el lead (Pillow, LANCZOS, JPEG progresivo, SIN metadatos EXIF) y colocados en el
repo — todavía NINGÚN componente los importa (Vite solo empaqueta lo importado); los cablea el
`tdd_craftsman` en F-26/F-27:

| Fichero                                                   | Tamaño    | Peso  | Origen                                                   |
| --------------------------------------------------------- | --------- | ----- | -------------------------------------------------------- |
| `src/assets/hero/hero-manicura-rosa-1920.jpg`             | 1920×1280 | 96 KB | 939835, reescalada (3:2 intacta), q74                    |
| `src/assets/hero/hero-manicura-rosa-1024.jpg`             | 1024×683  | 27 KB | 939835, reescalada (3:2 intacta), q74 — para `srcset`    |
| `src/assets/servicios/servicio-unas-manicura-nude.jpg`    | 800×1000  | 68 KB | 34373403, recorte 4:5 centrado vertical, q78             |
| `src/assets/servicios/servicio-facial-pestanas.jpg`       | 800×1000  | 59 KB | 7479587, recorte 4:5 centrado vertical, q78              |
| `src/assets/servicios/servicio-depilacion-piel-suave.jpg` | 800×1000  | 53 KB | 5202459, recorte 4:5 centrado en la crema y la mano, q78 |

Los recortes 4:5 coinciden con el `aspect-ratio: 4 / 5` del hueco `.foto` del catálogo.
