# TDD — deuda de legibilidad de F-28 (`favicon_marca`): menores 1-4 del judge

> `tdd_craftsman`, 2026-10-01: refactor SIN cambio de comportamiento. Contrato:
> `progress/brief_deuda_favicon_legibilidad.md` (invariantes I-1..I-7). Rama `claude/bold-liskov-c3323b`.
>
> **Interrumpido tras el paso 1 (≈11:19) y RETOMADO el mismo día** por un `tdd_craftsman` nuevo, en el
> worktree, desde `884a66c`. Los §0-§1 son de la sesión interrumpida (lo marcado **[lead]** lo midió el lead
> tras la parada). Desde el §2, todo lo medido sale de los ficheros de
> `…/scratchpad/legibilidad/` (`comprobar.sh`, `sabotear.sh`, `sabotajes.txt`, `sab-S*.json`, `i5/`), que
> no van al repo. Node v22.15.0.

## 0. Línea base (antes de tocar nada, HEAD `989d7d6`)

- Generador: `node tools/favicon/generar.mjs --salida <scratchpad>/tdd/antes`:
  - exit 0;
  - los tres md5 del brief §1;
  - `cmp` idéntico a `public/`.
- `pnpm exec vitest list src/pages/favicon-marca.test.ts`: 40 nombres, guardados en
  `<scratchpad>/tdd/vitest-list-antes.txt`.
- Error del CLI antes (`--salida` sin directorio):
  - exit 1;
  - la línea fuente con `^`;
  - `Error: --salida necesita un directorio`;
  - **5** líneas `    at …` y `Node.js v22.15.0`;
  - stdout vacío.

## 1. HECHO — paso 1: el test (menores 1 y 2), commit `7b7351a`

Toca solo `src/pages/favicon-marca.test.ts` (+81 −35).

**Obligatorio del brief** (§2.A), todo hecho:

- **Tipo del trozo:**
  - `LARGO_DEL_CAMPO_DE_LARGO = 4` y `LARGO_DEL_TIPO_DE_TROZO = 4`;
  - `LARGO_DE_LA_CABECERA_DE_TROZO` pasa a ser su suma (sigue valiendo 8);
  - `posicion + 4` → `posicion + LARGO_DEL_CAMPO_DE_LARGO`.
- **IHDR:** `POSICION_EN_EL_IHDR: Readonly<Record<keyof Cabecera, number>>` (ancho 0, alto 4, profundidad 8,
  tipoDeColor 9, entrelazado 12).
- **Profundidad:** `!== 8` → `!== PROFUNDIDAD_LEIDA` (8).
- **Entrada ICO:** `POSICION_EN_LA_ENTRADA_ICO: Readonly<Record<keyof EntradaIco, number>>` (ancho 0, alto 1,
  tamano 8, desplazamiento 12).
- **Menor 2:** la clave `pixeles` de `LOS_TRES_RASTER` → `totalDePixeles`. El marcador del título,
  `$pixeles` → `$totalDePixeles`, deja el título renderizado igual (I-3), y la desestructuración ya no
  renombra.

**De la lista «Permitido»**, todo hecho:

- `POSICION_EN_LA_CABECERA_ICO` (reservado 0, tipo 2, entradas 4), con su `interface CabeceraIco`, que
  sustituye al tipo literal en línea;
- `CANALES_RGB = 3` / `CANALES_RGBA = 4`, en `CANALES_POR_TIPO`, `aRgba`, `pixelEn` y `pixeles`;
- los filtros de `predictor`: `FILTRO_NINGUNO`, `FILTRO_IZQUIERDA`, `FILTRO_ARRIBA`, `FILTRO_MEDIA` y
  `FILTRO_PAETH`, con los nombres de la especificación en su comentario.

No cambian:

- ninguna aserción;
- ningún valor esperado;
- ningún título;
- ningún import;
- el número de `it`.

## 2. Paso 1 — invariantes medidos de nuevo (HEAD `884a66c`)

`comprobar.sh paso1`:

- **I-1**:
  - `node tools/favicon/generar.mjs --salida <scratch>/despues-paso1-…` sale con exit 0;
  - svg `69ffa8c46fbeda00da75d0f40c277ca0`, ico `907b23175ec72508a80af917023a6b2b`, png
    `b82343170913f7ef4a6fabbb2be072fc`, los tres del brief §1;
  - `cmp` idéntico a `public/` en los tres.
- **I-2**: el stdout es la línea del brief §1 (solo cambia la ruta); stderr, 0 bytes.
- **I-3**:
  - `vitest run` da **40/40**;
  - `vitest list` da 40 nombres, con `diff` VACÍO contra la lista de `989d7d6`. Esa lista se tomó
    poniendo el test de `989d7d6` con `git show`, listando y restaurando con `git checkout --`.

### I-4 — los sabotajes del test, rehechos

Sustituyen a los registros S1..S16 de la sesión interrumpida, que no decían qué cambiaban.

**Método** (`sabotear.sh`):

1. Parte del test COMMITEADO (`git diff --quiet`; si no está limpio, aborta).
2. Aplica UNA expresión `sed` (está en `sabotajes.txt`) y exige `git diff --numstat` = `1 1`: una sola
   línea cambiada.
3. Corre `pnpm exec vitest run src/pages/favicon-marca.test.ts --reporter=json`.
4. Restaura con `git checkout --` y vuelve a exigir el árbol limpio.

Al terminar los 26: `git status` sin cambios.

**Numeración de las `it`**: su orden en `pnpm exec vitest list src/pages/favicon-marca.test.ts` (1-40). El
orden del informe JSON coincide con el de la lista en los 26 casos (se comprobó título a título).

- 1-5: @s1; 6-10: @s2; 11-15: @s3; 16-17: @s4 de tokens y SVG.
- 18-20: @s4 «ANCLA POSITIVA: $nombre tiene $totalDePixeles píxeles…» (16×16, 32×32 y apple).
- 21-23: @s4 «todo píxel con alfa > 0 es mezcla…» (16×16, 32×32 y apple).
- 24: @s5 cabecera ICO; 25: medidas; 26: desplazamiento + tamaño; 27-28: «la entrada de 16/32 px es un
  PNG completo… e IEND justo al final»; 29-30: borde superior soft; 31-32: esquinas.
- 33: @s6 firma/IHDR/IEND; 34: IHDR 180×180; 35: sin tRNS; 36: esquinas soft.
- 37-40: @s7.

**Las cuatro regiones obligatorias del brief**:

| ID  | Región               | Línea sabotada (antes → después)                                             | Qué rompe                                                                                 | Rojas | `it` que caen                   |
| --- | -------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----- | ------------------------------- |
| S1  | tipo del trozo       | `LARGO_DEL_CAMPO_DE_LARGO = 4` → `= 5`                                       | el tipo se lee desde el byte 5 y la cabecera del trozo pasa a 9: ningún trozo se lee bien | 20/40 | 18-23, 27-40                    |
| S2  | tipo del trozo       | `LARGO_DEL_TIPO_DE_TROZO = 4` → `= 5`                                        | tipo de 5 letras y cabecera de 9: ídem                                                    | 20/40 | 18-23, 27-40                    |
| S3  | IHDR                 | `POSICION_EN_EL_IHDR.ancho: 0` → `1`                                         | el ancho sale de los bytes 1-4 (×256): el IDAT inflado no cuadra                          | 18/40 | 18-23, 27-32, 34, 36-40         |
| S4  | IHDR                 | `POSICION_EN_EL_IHDR.alto: 4` → `5`                                          | ídem con el alto                                                                          | 18/40 | 18-23, 27-32, 34, 36-40         |
| S5  | IHDR (profundidad)   | `POSICION_EN_EL_IHDR.profundidad: 8` → `9`                                   | lee el tipo de color (6 o 2) como profundidad: el decodificador rechaza el PNG            | 18/40 | 18-23, 27-32, 34, 36-40         |
| S6  | IHDR (tipo de color) | `POSICION_EN_EL_IHDR.tipoDeColor: 9` → `8`                                   | lee la profundidad (8) como tipo de color: sin canales, lo rechaza                        | 18/40 | 18-23, 27-32, 34, 36-40         |
| S7  | IHDR                 | `POSICION_EN_EL_IHDR.entrelazado: 12` → `9`                                  | lee el tipo de color (≠ 0) como entrelazado: lo rechaza                                   | 18/40 | 18-23, 27-32, 34, 36-40         |
| S8  | IHDR (profundidad)   | `PROFUNDIDAD_LEIDA = 8` → `= 16`                                             | exige 16 bits: rechaza los tres PNG                                                       | 15/40 | 18-23, 29-32, 36-40             |
| S9  | entrada ICO          | `POSICION_EN_LA_ENTRADA_ICO.ancho: 0` → `2`                                  | lee el número de colores (0, o sea 256): no hay entrada de 16 ni de 32                    | 13/40 | 18-19, 21-22, 25, 27-32, 37, 39 |
| S10 | entrada ICO          | `POSICION_EN_LA_ENTRADA_ICO.alto: 1` → `2`                                   | ídem con el alto                                                                          | 13/40 | 18-19, 21-22, 25, 27-32, 37, 39 |
| S11 | entrada ICO          | `POSICION_EN_LA_ENTRADA_ICO.tamano: 8` → `12`                                | lee el desplazamiento como tamaño: el IEND ya no acaba donde dice la entrada              | 2/40  | 27-28                           |
| S12 | entrada ICO          | `POSICION_EN_LA_ENTRADA_ICO.desplazamiento: 12` → `8`                        | lee el tamaño como desplazamiento: ahí no hay firma PNG                                   | 13/40 | 18-19, 21-22, 26-32, 37, 39     |
| S13 | total de píxeles     | fila de 32×32 de `LOS_TRES_RASTER`: `totalDePixeles: 1024` → `pixeles: 1024` | `totalDePixeles` llega `undefined` (el título dice «tiene undefined píxeles»)             | 1/40  | 19                              |
| S14 | total de píxeles     | `({ leer, totalDePixeles })` → `({ leer, pixeles: totalDePixeles })`         | la desestructuración vuelve a leer la clave vieja: `undefined` en los tres                | 3/40  | 18-20                           |

**Lo «Permitido» que se hizo en el paso 1, más dos sabotajes de control**:

| ID  | Línea sabotada (antes → después)                      | Qué cambia                                                                                            | Rojas | `it` que caen                     |
| --- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----- | --------------------------------- |
| S15 | `POSICION_EN_LA_CABECERA_ICO.reservado: 0` → `2`      | lee el tipo (1) como reservado                                                                        | 1/40  | 24                                |
| S16 | `POSICION_EN_LA_CABECERA_ICO.tipo: 2` → `4`           | lee el número de entradas (2) como tipo                                                               | 1/40  | 24                                |
| S17 | `POSICION_EN_LA_CABECERA_ICO.entradas: 4` → `2`       | lee el tipo (1) como número de entradas: falta la de 32                                               | 10/40 | 19, 22, 24-26, 28, 30, 32, 37, 39 |
| S18 | `CANALES_RGB = 3` → `= 4`                             | el apple-touch-icon (RGB) se desfiltra con 4 canales: el IDAT no cuadra                               | 5/40  | 20, 23, 36, 38, 40                |
| S19 | `CANALES_RGBA = 4` → `= 3`                            | los PNG del ICO se desfiltran con 3 canales, y `pixeles` cuenta de 3 en 3 también en el apple (it 20) | 11/40 | 18-22, 29-32, 37, 39              |
| S20 | `FILTRO_NINGUNO = 0` → `= 5`                          | el filtro 0 cae en el `default` y lanza                                                               | 15/40 | 18-23, 29-32, 36-40               |
| S21 | `FILTRO_IZQUIERDA = 1` → `= 5`                        | nada con ESTOS ficheros (nota 1)                                                                      | 0/40  | — (verde)                         |
| S22 | `FILTRO_ARRIBA = 2` → `= 5`                           | ídem                                                                                                  | 0/40  | — (verde)                         |
| S23 | `FILTRO_MEDIA = 3` → `= 5`                            | ídem                                                                                                  | 0/40  | — (verde)                         |
| S24 | `FILTRO_PAETH = 4` → `= 5`                            | ídem                                                                                                  | 0/40  | — (verde)                         |
| S25 | control: `POSICION_EN_EL_IHDR.ancho: 0` → `4`         | lee el alto como ancho, y los tres PNG son cuadrados (nota 2): equivalente                            | 0/40  | — (verde)                         |
| S26 | control: `POSICION_EN_EL_IHDR.entrelazado: 12` → `11` | lee el byte de filtro, que también es 0 (nota 2): equivalente                                         | 0/40  | — (verde)                         |

Notas, ambas medidas sobre los ficheros de `public/` (`filtros.mjs` y una lectura del IHDR):

1. Los tres PNG llevan el filtro 0 en TODAS sus filas: 16 de 16, 32 de 32 y 180 de 180. Las ramas 1-4 de
   `predictor` no se ejecutan con estos ficheros, así que sabotear sus constantes no puede dar rojo. No son
   regiones obligatorias del brief. **Hallazgo**: el decodificador del test lleva ramas que sus fixtures no
   ejercitan. Viene de F-28; este refactor no lo introduce.
2. Los bytes 0-12 del IHDR son `0,0,0,16,0,0,0,16,8,6,0,0,0` (ICO de 16) y `0,0,0,32,0,0,0,32,8,6,0,0,0`
   (ICO de 32). En el apple, los bytes 8-12 son `8,2,0,0,0`. Es decir, ancho = alto y compresión = filtro =
   entrelazado = 0. Por eso S25 y S26 son equivalentes y solo sirven de control del método. Los S3, S4 y
   S7 se eligieron para leer un byte de valor DISTINTO.

**Veredicto I-4**: las cuatro regiones obligatorias dan rojo: tipo del trozo (S1-S2), IHDR (S3-S8),
entrada ICO (S9-S12) y total de píxeles (S13-S14).

## 3. Paso 2a — nombres y números de formato de `tools/favicon/generar.mjs` (menor 3)

Se hizo con un parche de reemplazos exactos (`parchear.mjs`, `parche-2a.txt`): cada bloque ANTES tiene que
aparecer UNA sola vez, o no se escribe nada. Después, `prettier --write`. Ninguna aritmética de coma
flotante cambia de orden: solo cambian nombres.

**Números de formato con nombre**, junto a su sección:

- **WOFF**: `POSICION_DEL_NUMERO_DE_TABLAS_WOFF` (12), `LARGO_DE_LA_CABECERA_WOFF` (44),
  `LARGO_DE_LA_ENTRADA_WOFF` (20), `LARGO_DE_LA_ETIQUETA` (4) y
  `POSICION_EN_LA_ENTRADA_WOFF { desplazamiento: 4, largoComprimido: 8, largoOriginal: 12 }`.
- **head**: `POSICION_DEL_FORMATO_DE_LOCA` (50, `indexToLocFormat`) y `LOCA_LARGA` (1).
- **cmap** (el brief lo recomienda):
  - `POSICION_DEL_NUMERO_DE_SUBTABLAS` (2), `INICIO_DE_LOS_REGISTROS_CMAP` (4),
    `LARGO_DEL_REGISTRO_CMAP` (8) y `POSICION_DE_LA_SUBTABLA_EN_EL_REGISTRO` (4);
  - `FORMATO_POR_SEGMENTOS` (4), `POSICION_DEL_DOBLE_DE_SEGMENTOS` (6), `INICIO_DE_LOS_FINALES` (14),
    `LARGO_DEL_RELLENO` (2) y `BYTES_POR_VALOR` (2).
- **ICO**:
  - `LARGO_DE_LA_CABECERA_ICO` (6) y `LARGO_DE_LA_ENTRADA_ICO` (16), con los nombres que ya usa el test;
  - `POSICION_EN_LA_CABECERA_ICO { reservado: 0, tipo: 2, entradas: 4 }` y
    `POSICION_EN_LA_ENTRADA_ICO { ancho: 0, alto: 1, planos: 4, bitsPorPixel: 6, tamano: 8, desplazamiento: 12 }`;
  - `TIPO_ICONO` (1), `PLANOS_DE_COLOR` (1) y `MEDIDA_CERO_DEL_ICO` (256).
- Lo del **glyf** (la cabecera de 10 y las banderas) va con el reparto de `contornos`, en el paso 2b.

**Nombres**:

- Obligatorios:
  - `o` → `entrada` (en `leerWoff` y en `componerIco`);
  - `g` → `glifo` (en `glifoDe`, `rangoDelGlifo` y `contornosDelGlifo`);
  - `ro` → `desplazamientoDelRango`;
  - `cs` → `contornos`, y `pts` → `puntos` (en `pathDe`, `cajaDe` y `tramosDe`);
  - `q` → `punto`;
  - `f` → `fraccion`, en `bajoElTrazo`.
  - Los `p`, `f`, `nc`, `np`, `pts` y el `d` buffer de `contornos` caen en el paso 2b.
- De la lista «Permitidos»:
  - `off` → `subtabla`, `segX2` → `dobleDeSegmentos` e `ini` → `inicio` (en `glifoDe`);
  - `m` → `medio` (en `pathDe`);
  - `s`/`k` → `rgbSoft`/`rgbInk` (en `rasterizar`).
- Fuera de la lista, se declara:
  - la función `contornos` pasa a `contornosDelGlifo`, para que el parámetro `contornos` de `pathDe` y
    `cajaDe` no la tape;
  - en `componerIco`, el índice `n` pasa a `indice`.
- Se quedan, por estar fuera de la lista del brief:
  - `s`/`k` de `pathDe`, `cp`, el `t` (tramo) de `crucesDeFila`/`bajoElTrazo`, el `c` de
    `dentroPorNonzero`, los `t`/`c`/`n`/`k` de la tabla CRC y los `c`/`b` de `crc32`;
  - los números de `loca` (`* 4`, `* 2`: los anchos de uint32/uint16 y la mitad del formato corto, que
    ahora explica el comentario de `head`), los del IHDR del codificador PNG y los 3/4 de canales del
    rasterizador.

**Medido** (`comprobar.sh paso2a`):

- **I-1**: exit 0; svg `69ffa8c4…`, ico `907b2317…` y png `b8234317…`, los tres md5 completos del brief §1;
  `cmp` idéntico a `public/` en los tres.
- **I-2**: el stdout es la misma línea; stderr, 0 bytes.
- **I-3**: **40/40**; `vitest list`, diff vacío.
- `git diff --stat`: solo `tools/favicon/generar.mjs` (+123 −72).

## 4. Paso 2b — `contornos` partido en funciones de un solo motivo (menor 3)

Mismo método que en el 2a (`parche-2b.txt`). Se abre una sección `── Glifo: glyf → contornos ──` con:

- `LARGO_DE_LA_CABECERA_DEL_GLIFO` (10) y `BYTES_POR_ENTERO_16` (2);
- las seis banderas en castellano, con el nombre de la especificación TrueType citado UNA vez en su
  comentario: `BANDERA_EN_LA_CURVA` (1, ON_CURVE_POINT), `BANDERA_X_CORTA` (2), `BANDERA_Y_CORTA` (4),
  `BANDERA_REPETIR` (8), `BANDERA_X_IGUAL_O_POSITIVA` (16) y `BANDERA_Y_IGUAL_O_POSITIVA` (32);
- `EJE_X` y `EJE_Y`: la pareja de banderas de cada eje.

`contornosDelGlifo` queda como orquestador de 12 líneas de cuerpo sobre un lector explícito, `lectorDe(datos,
inicio)`: un cursor con `byte`, `uint16`, `int16` y `saltar`. Se pasa a cada función, en el orden en que el
glyf guarda los datos. Las cuatro responsabilidades del brief:

1. `finalesDeContorno(lector, numeroDeContornos)`;
2. `banderasDe(lector, numeroDePuntos)`, con la repetición;
3. `coordenadasDelEje(lector, banderas, eje)`: UNA función para las x y las y, parametrizada por `EJE_X` y
   `EJE_Y`, sin duplicar el bucle;
4. `agruparEnContornos(finales, banderas, xs, ys)`, con la y invertida.

**Renombrados**:

- Obligatorios: `d` (el buffer) → `datos`, `nc` → `numeroDeContornos`, `np` → el argumento
  `numeroDePuntos`, `p` → el lector, `f` → `bandera` y `pts` → `puntos`.
- Permitidos: `[a, b]` → `[desde, hasta]` e `ini` → `inicio`.
- Fuera de la lista, declarados: `flags` → `banderas` y `res` → `contornos`.
- Dos expresiones equivalentes:
  - `(flags[i] & 1) === 1` → `(banderas[i] & BANDERA_EN_LA_CURVA) !== 0`, porque el bit vale 0 o 1;
  - `finales[nc - 1] + 1` → `finales.at(-1) + 1`.
  - Las dos quedan cubiertas por la comparación de abajo.

**Medido**:

- `comprobar.sh paso2b`:
  - **I-1**: exit 0, los tres md5 del brief §1, y `cmp` = `public/`;
  - **I-2**: la misma línea; stderr, 0 bytes;
  - **I-3**: **40/40**; `vitest list`, diff vacío.
- **Equivalencia más allá de la «N»** (`equiv/`). Se cargan como módulos el generador de `884a66c` (antes
  del paso 2) y el actual, sin el bloque «Principal».
  - `contornos` contra `contornosDelGlifo`, sobre los **330** glifos de la fuente: **330 iguales**, 0
    distintos. Son 213 simples, 6 vacíos y 111 compuestos, que lanzan el mismo mensaje en los dos.
  - `glifoDe` en los **65 536** puntos de código del BMP: **65 536 iguales**, 231 de ellos con glifo.
- `git diff --stat` del paso: solo `tools/favicon/generar.mjs` (+86 −42).

## PENDIENTE

- **Paso 3**: los errores (menor 4) e I-5.
- **Paso 4**: formato y calidad de lo tocado.
- **I-6** (`node .harness/harness.mjs init` completo): lo mide el lead.
