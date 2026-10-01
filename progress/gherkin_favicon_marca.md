# Gherkin — F-28 `favicon_marca`

> Lo escribe el `gherkin_author` el 2026-09-30. Contrato: `features/favicon_marca.feature` (**10
> escenarios, 2 `@verificacion-viva`**, justo en el techo del brief §5). Estado: **APROBADO por Pablo en la
> puerta humana (2026-09-30)**. Etiquetas: **[V]** verificado en esta sesión · **[I]** inferencia o sonda propia · **[NV]** no
> verificado.
>
> **`feature_list.json` NO se ha tocado** (instrucción expresa del lead): el paso a `spec_ready` queda en
> manos del `craftsman_lead`.

## 1. Reparto: de la spec al contrato

No se ha fundido ni añadido nada: los 10 del reparto orientativo de la spec, uno a uno, para que el mapa
del `judge` sea directo.

| Spec | Escenario        | Qué fija                                                                    | Fichero de test previsto                                         |
| ---- | ---------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| B1   | @s1              | los 3 `<link>` de `index.html`: orden, atributos, `href` sin base           | `src/pages/favicon-marca.test.ts` (nuevo)                        |
| B2   | @s2              | geometría del SVG contra `aprobado-B.svg`, por atributos                    | `src/pages/favicon-marca.test.ts`                                |
| B3   | @s3              | SVG autocontenido y cabecera «generado»                                     | `src/pages/favicon-marca.test.ts`                                |
| B4   | @s4              | colores contra `_tokens.scss`: SVG y paleta de los 3 raster                 | `src/pages/favicon-marca.test.ts`                                |
| B5   | @s5              | estructura del ICO (2 PNG RGBA 16/32) y transparencia                       | `src/pages/favicon-marca.test.ts`                                |
| B6   | @s6              | `apple-touch-icon`: 180×180, tipo 2, sin `tRNS`, a sangre                   | `src/pages/favicon-marca.test.ts`                                |
| B7   | @s7 (Outline ×2) | caja de tinta a 32 y 180 px, ±1 px                                          | `src/pages/favicon-marca.test.ts`                                |
| H1   | @s8              | `dist/index.html` con la base, uno por fila, bytes iguales a `public/`      | `src/pages/home-horneado.test.ts` (solo añadir; build existente) |
| V1   | @s9 viva         | cero 404, se pide el SVG, pestaña con la «N»; contraprueba sin los `<link>` | `progress/verificacion_viva_favicon_marca.md` (el lead)          |
| V2   | @s10 viva        | cobertura de tinta raster vs. Chromium ≤ 10 %, con calibración              | `progress/verificacion_viva_favicon_marca.md` (el lead)          |

## 2. Los nueve sabotajes → escenario que lo pone rojo

Cada uno se aplica, se ve el rojo, se anota en `progress/tdd_favicon_marca.md` (o en la verificación en
vivo para el 9) y se revierte.

| #   | Sabotaje (spec «Cómo se verifica»)                         | Rojo seguro                                                              | Rojo además                                                                                                 |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 1   | quitar un `<link>` de `index.html`                         | @s1 (ancla «EXACTAMENTE 3»)                                              | @s8 (ancla «EXACTAMENTE 3» en `dist/`)                                                                      |
| 2   | escribir la base a mano en un `href`                       | @s1 (`href` exacto y «ningún `href` empieza por la base»)                | @s8 solo si Vite la duplica o no copia el fichero **[I]**; no se cuenta con ello                            |
| 3   | cambiar un hex del SVG                                     | @s4 (fill del rect o fill/stroke del path contra el token)               | —                                                                                                           |
| 4   | meter un `<text>` o un `href` externo en el SVG            | @s3 (`<text` > 0; o `href` > 0 y `http` ≠ 1)                             | —                                                                                                           |
| 5   | cambiar el tamaño de una imagen del `.ico`                 | @s5 (medidas de las entradas o IHDR ≠ su entrada)                        | @s4 (ancho × alto ≠ 256/1 024) y @s7 fila 32 si desaparece el 32×32                                         |
| 6   | guardar el `apple-touch-icon` con canal alfa               | @s6 (tipo de color 6 ≠ 2)                                                | —                                                                                                           |
| 7   | borrar un fichero de `public/`                             | `.svg` → @s2, @s3, @s4 · `.ico` → @s4, @s5, @s7 · `.png` → @s4, @s6, @s7 | @s8 en los tres casos (el gemelo de `dist/` no existe)                                                      |
| 8   | desplazar la «N» en un raster (**2 px o más**, a 32 o 180) | @s7                                                                      | — (a 16 px no lo ve nada: ciego declarado, §4)                                                              |
| 9   | rasterizar sin trazo                                       | @s10 (sonda: la cobertura cae ≈ 28 %, el umbral es 10 %) **[I]**         | @s7 fila 180 **[I: sonda]**: sin trazo la caja da 23–156 × 38–142 y se sale 1,53 a la derecha y 1,51 arriba |

**Cobertura: 9/9.** El 8 se concreta en «2 px o más» porque 1 px cabe en la tolerancia de ±1 de la spec
(un desplazamiento de 1 px a la izquierda a 32 px da 3–27, que pasa).

## 3. Cada `Then` → qué sabotaje lo mata (y cuáles no mata ninguno de los nueve)

«Nace rojo» (el fichero aún no existe) no cuenta: aquí solo cuenta el sabotaje sobre una implementación
verde. Los `Then` sin sabotaje entre los nueve llevan una **propuesta opcional** de sabotaje extra: la spec
no la exige; el `tdd_craftsman` o el `judge` deciden si la demuestran.

| Esc. | `Then`                                           | Lo mata                     | Si ninguno de los nueve: sabotaje propuesto (opcional)                      |
| ---- | ------------------------------------------------ | --------------------------- | --------------------------------------------------------------------------- |
| @s1  | ancla: 3 en `<head>` y 3 en el fichero           | 1                           | —                                                                           |
| @s1  | 1.º: `icon`, `/favicon.ico`, `32x32`             | 2 (si es ese `href`)        | `sizes="any"` o `sizes` quitado                                             |
| @s1  | 2.º: `icon`, `/favicon.svg`, `image/svg+xml`     | 2 (si es ese `href`)        | quitar `type`                                                               |
| @s1  | 3.º: `apple-touch-icon`, `/apple-touch-icon.png` | 2 (si es ese `href`)        | —                                                                           |
| @s1  | ningún `href` con base, `//` ni `:`              | 2                           | —                                                                           |
| @s2  | ancla: 1 `<svg>`, 1 `<rect>`, 1 `<path>`         | 7 (`.svg`)                  | un segundo `<path>`                                                         |
| @s2  | ancla a mano del oráculo                         | **ninguno**                 | tocar el `rx` de `aprobado-B.svg`                                           |
| @s2  | viewBox y rect idénticos al oráculo              | **ninguno**                 | cambiar `rx="324"` por `rx="0"` en `favicon.svg`                            |
| @s2  | `d` idéntico al oráculo                          | **ninguno**                 | cambiar un número del `d`                                                   |
| @s2  | `stroke-width="18"` y `stroke-linejoin="round"`  | **ninguno**                 | `stroke-width="0"` (la variante SVG del sabotaje 9)                         |
| @s3  | ancla: `xmlns` y `<path`                         | 7 (`.svg`)                  | —                                                                           |
| @s3  | 0 × `<text`, `<image`, `<use`, …                 | 4                           | —                                                                           |
| @s3  | 0 × `href`, `url(`, `@import`                    | 4 (`href` externo)          | —                                                                           |
| @s3  | exactamente 1 × `http`                           | 4 (`href` externo)          | —                                                                           |
| @s3  | comentario de cabecera antes de `<svg`           | **ninguno**                 | quitar el comentario                                                        |
| @s4  | ancla: 1 `--accent-soft:`, 1 `--ink:`, distintos | **ninguno**                 | duplicar la línea de `--ink` en `_tokens.scss`                              |
| @s4  | colores del SVG = tokens                         | 3                           | —                                                                           |
| @s4  | ancla: w×h, ≥1 rosa opaco, ≥1 de tinta           | 5, 7                        | —                                                                           |
| @s4  | todo píxel visible es mezcla (±2)                | **ninguno**                 | cambiar `--ink` en `_tokens.scss` sin regenerar (FM-7: mata también el SVG) |
| @s5  | ancla: reservado 0, tipo 1, 2 entradas           | 7 (`.ico`)                  | —                                                                           |
| @s5  | medidas 16×16 y 32×32                            | 5                           | —                                                                           |
| @s5  | desplazamiento + tamaño ≤ longitud               | **ninguno**                 | truncar el `.ico` 10 bytes                                                  |
| @s5  | PNG completo: firma, IHDR, tipo 6, IEND al final | 5 (IHDR ≠ entrada)          | —                                                                           |
| @s5  | píxel central superior rosa opaco (ancla)        | **ninguno**                 | —                                                                           |
| @s5  | esquinas con alfa ≤ 25                           | **ninguno**                 | pintar opacas las esquinas del 16                                           |
| @s6  | ancla: firma, IHDR primero, IEND al final        | 7 (`.png`)                  | —                                                                           |
| @s6  | 180×180, profundidad 8, tipo 2                   | 6                           | —                                                                           |
| @s6  | sin `tRNS`                                       | **ninguno**                 | añadir un `tRNS` con el rosa                                                |
| @s6  | esquinas = `--accent-soft` exacto                | **ninguno**                 | redondear las esquinas del 180 (fondo negro u otro)                         |
| @s7  | ancla: ≥ 1 píxel de tinta                        | **ninguno**                 | —                                                                           |
| @s7  | caja a ±1 px                                     | 8; 9 a 180 px **[I]**       | —                                                                           |
| @s8  | ancla: exactamente 3                             | 1                           | —                                                                           |
| @s8  | orden y `href` con la base                       | 1                           | —                                                                           |
| @s8  | mismos bytes que `public/`                       | 7                           | —                                                                           |
| @s9  | ancla: `favicon.svg` pedido con 200              | 7 (`.svg`)                  | —                                                                           |
| @s9  | cero 404 y nada a `/favicon.ico` de la raíz      | 1 (es la contraprueba)      | —                                                                           |
| @s9  | captura de la pestaña con la «N»                 | **ninguno** (juicio visual) | —                                                                           |
| @s9  | contraprueba: vuelve el 404                      | lleva su sabotaje dentro    | —                                                                           |
| @s10 | calibración: con trazo > 0, sin trazo ≤ 80 %     | lleva su sabotaje dentro    | —                                                                           |
| @s10 | raster vs Chromium ≤ 10 %                        | 9                           | —                                                                           |

Los que quedan sin sabotaje y sin propuesta son **anclas** (@s5 píxel central, @s7 ≥ 1 píxel de tinta): su
trabajo es que otro `Then` no pase en vacío, y caen cuando cae la lectura del fichero (el 7). La excepción es
la captura de @s9, que es juicio visual.

## 4. Ciegos declarados (ningún escenario los ve, y la spec lo acepta)

- **El generador editado sin regenerar** (spec, «Modo de fallo»): se vigilan las salidas, no la
  herramienta. Mismo límite que `aplicador.mjs`.
- **La «N» desplazada en el raster de 16 px**: a 16 no hay caja (spec: «con el antialias, la caja no es
  fiable»), y la cobertura de @s10 no cambia al desplazar. La sonda da la caja a 16 bien centrada (2–14 ×
  4–12 frente a 1,99–14,00 × 3,24–12,75), pero con 0,25 de holgura en vertical: no se añade.
- **Un desplazamiento de 1 px** a 32 o 180: cabe en la tolerancia de ±1 px.
- **El sabotaje 2 en lo horneado**: qué hace Vite con un `href` que ya lleva la base **[I]**. Lo caza @s1
  siempre.

## 5. Revisión adversarial (y lo que se corrigió)

### 5.1 ¿Es satisfacible cada `Then` con el repo real?

- **@s1**: `index.html` tiene hoy el literal `<head>`…`</head>` **[V]**; la extracción sale de ahí.
- **@s2**: anclas del oráculo **medidas [V]**: `viewBox="-213 -1132 1618 1618"`, rect `x="-213"`,
  `y="-1132"`, `width`/`height` `"1618"`, `rx="324"`, `d` empieza por `M1001 147Q` y acaba en `Z`, y hay
  exactamente 1 `<svg`, 1 `<rect` y 1 `<path` **[V: grep]**. **Condición**: el `d` idéntico obliga a que
  `generar.mjs` formatee los números como `prototipo-glifos.mjs`. **Riesgo real**:
  `docs/research/favicon/` está **sin versionar** **[V: `git status`]**. Sin commit, @s2 nace rojo en
  cualquier checkout limpio (FS-2 ya lo dice: hay que versionarlo).
- **@s3**: el oráculo tiene 1 `http`, 0 `href`, 0 `url(` y 0 `<text` **[V]**. El comentario de cabecera no
  debe contener `href`, `http` ni `<svg` (queda escrito en el `.feature`).
- **@s4**: `_tokens.scss` tiene exactamente un `--accent-soft:` (`#F7DDE8`) y un `--ink:` (`#8E3355`) en
  todo el fichero **[V: grep -o]**, y el oráculo ya usa esos hex **[V]**.
- **@s5/@s6/@s7**: **[I: sonda propia]**. Rasterizador desechable en el scratchpad (nonzero + «a distancia ≤
  9 del contorno», supersampling 8×8 a 16/32 y 4×4 a 180; **no es el generador**, que no existe):
  - caja con bordes: 32 px → 4–28 × 7–25; 180 px → 22–157 × 37–143. Desviación máxima 0,53 frente a la
    tolerancia de 1.
  - Con **centros** de píxel, la fila de arriba a 32 px se saldría 0,01 (7,5 frente a 6,49). **Corrección**:
    el `.feature` fija la convención de **BORDE** (mínimo, máximo + 1).
  - esquinas del ICO a 16 px con alfa ≈ 2 (cálculo del área); a 32 px, 0. La fila 0 no tiene tinta (la
    tinta empieza en la fila 4 a 16 px).
- **@s8**: Vite pone la base a los tres `href` con `vite build` **[V: brief, hecho 1]**. Con
  `vite-react-ssg build` no se ha medido: **[I]**. Justo para eso existe el escenario.
- **@s9**: dos **[NV]** que el `.feature` ya convierte en instrucción:
  - Un Chromium headless puede no pedir favicons: se exige Chromium **con ventana**, y el ancla (la
    petición a `favicon.svg` con 200) lo delata.
  - `vite preview` puede no dar 404 fuera de la base: en ese caso se usa un servidor estático que imite a
    GitHub Pages, y se anota.
- **@s10**: la calibración de la sonda da una cobertura sin trazo del **≈ 72 %** de la con trazo a 16, 32 y
  180 px. Es invariante de escala: el trazo está en unidades del `viewBox`. Pasa el ≤ 80 % con 8 puntos de
  margen **[I: no es Chromium]**. Si falla, se aplica la vía de la spec: la ampliación ×6 que juzga Pablo.

### 5.2 Extractores y anclas

Todo extractor lleva su ancla positiva antes de la negativa o del juicio de atributos:

- **@s1**: 3 en `<head>` y 3 en el fichero.
- **@s2**: 1/1/1 por fichero, más el ancla a mano del oráculo.
- **@s3**: `xmlns` y `<path`.
- **@s4**: los tokens (únicos y distintos) y los píxeles (w×h, ≥ 1 rosa opaco, ≥ 1 de tinta).
- **@s5**: 2 entradas, y el píxel central superior como ancla de la lectura de píxeles.
- **@s6**: la cadena de trozos IHDR…IEND.
- **@s7**: ≥ 1 píxel de tinta.
- **@s8**: exactamente 3, y cada fichero > 0 bytes.
- **@s9**: la petición a `favicon.svg` con 200, más la contraprueba que demuestra que el montaje ve los 404.
- **@s10**: la C con trazo > 0, más la calibración.

**Correcciones hechas en esta revisión**:

1. **@s5**: el píxel central superior pasa **delante** de las esquinas y se marca como ancla. Un
   decodificado todo a cero pasaba «alfa ≤ 25» en vacío.
2. **@s10**: la calibración exige también **C con trazo > 0**. Si Chromium no llegaba a dibujar (canvas
   vacío), «0 ≤ 0,8 · 0» pasaba en vacío.
3. **@s9**: la contraprueba se pasa al `Given` (dos sitios servidos) para dejar **un solo `When`**
   (`docs/gherkin.md`).
4. **@s7**: se fija la convención de borde de píxel (ver 5.1).

### 5.3 Colisiones con lo `done`

- **F-04 `cascaron_semantico`**:
  - @s33 (límite T2) fija `<head>` en minúsculas, sin atributos y sin `<title>` estático. El
    `.feature` lo recuerda en ARTEFACTOS, y @s1 extrae justo de ese literal: se refuerzan.
  - @s40/@s41 filtran `rel="preload"`, y los iconos no lo son **[V]**.
  - `horneado.ts` solo retira precargas de imagen o de fuente **[V: spec]**.
  - La anti-404 solo lee `<a href>` **[V]**.
  - @s8 **reutiliza** `elementos('link')`/`valorDe` de @s40 sin tocarlos.
  - Un cambio de base pone rojo @s8 junto a @s39/@s42: es deliberado (caso límite 1).
- **F-05 `cero_terceros`**: `icon` cuenta como petición y la ruta root-absoluta propia pasa **[V]**. FS-6 no
  lo enmienda: sus cegueras (no lee `.svg`, y `apple-touch-icon` no es keyword) las cubren @s3 y @s8.
- **F-10 `horario`** (@s12/@s14) y **F-14** (@s6) en `home-horneado.test.ts` leen el JSON-LD y el exit 0 del
  **mismo** build. @s8 no añade `beforeAll` ni build, y no importa de `src/`. El exit 0 con los iconos lo
  sigue exigiendo F-10 @s14: no se duplica.
- **F-01**: lee también los binarios de `dist/`. Un PNG o un ICO que contuviera `600123456` tras quitar
  separadores lo delataría el exit 0 (probabilidad despreciable **[I]**).
- **`contacto-horneado.test.ts`**: construye el mismo `dist/` (en serie, `fileParallelism: false` **[V]**) y
  no cuenta `<link>` **[V: grep]**. Sin choque.

### 5.4 Precisiones que añade el contrato sobre la spec (no son escenarios nuevos)

- Profundidad 8 y sin entrelazado en los tres PNG: es lo que lee el decodificador escrito a mano del test,
  y lo que escribe el precedente `aplicador.mjs`.
- `sin trozo tRNS` en el `apple-touch-icon`: sin eso, el «sin alfa» de la spec tiene una puerta de atrás.
- Caja de tinta en coordenadas de borde de píxel (5.1).
- «Claramente más del 10 %» (V2) se concreta en **≤ 80 %** (el doble del umbral), más C con trazo > 0.
- V1: Chromium con ventana, la contraprueba en un perfil nuevo propio y el servidor alternativo si
  `vite preview` no da 404 fuera de la base.
- El sabotaje 8 se concreta en **2 px o más**.

## 6. Para la puerta humana (qué mira Pablo)

- FM-1 y FM-2 están tal como los decidió.
- Las propuestas FM-3..FM-7 del lead se ratifican aprobando el contrato.
- PA-28-1 (¿hay un iPhone?) sigue abierta y se recomienda que no bloquee.
- Mutación no aplicable, declarada, y compensada con los nueve sabotajes de la §2.
