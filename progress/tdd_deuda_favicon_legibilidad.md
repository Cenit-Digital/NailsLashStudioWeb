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

| ID  | Línea sabotada (antes → después)                                                       | Qué cambia                                                                                                                                                               | Rojas                                     | `it` que caen                                                  |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | -------------------------------------------------------------- |
| S15 | `POSICION_EN_LA_CABECERA_ICO.reservado: 0` → `2`                                       | lee el tipo (1) como reservado                                                                                                                                           | 1/40                                      | 24                                                             |
| S16 | `POSICION_EN_LA_CABECERA_ICO.tipo: 2` → `4`                                            | lee el número de entradas (2) como tipo                                                                                                                                  | 1/40                                      | 24                                                             |
| S17 | `POSICION_EN_LA_CABECERA_ICO.entradas: 4` → `2`                                        | lee el tipo (1) como número de entradas: falta la de 32                                                                                                                  | 10/40                                     | 19, 22, 24-26, 28, 30, 32, 37, 39                              |
| S18 | `CANALES_RGB = 3` → `= 4`                                                              | el apple-touch-icon (RGB) se desfiltra con 4 canales: el IDAT no cuadra. Desde `58dc0e3` mueve también `POSICION_DEL_ALFA`: el alfa del ICO se lee un byte más allá (§8) | 5/40 en `884a66c`; **11/40** en `a48a296` | 20, 23, 36, 38, 40; en `a48a296`: 18-20, 23, 29-32, 36, 38, 40 |
| S19 | `CANALES_RGBA = 4` → `= 3`                                                             | los PNG del ICO se desfiltran con 3 canales, y `pixeles` cuenta de 3 en 3 también en el apple (it 20)                                                                    | 11/40                                     | 18-22, 29-32, 37, 39                                           |
| S20 | `FILTRO_NINGUNO = 0` → `= 5`                                                           | el filtro 0 cae en el `default` y lanza                                                                                                                                  | 15/40                                     | 18-23, 29-32, 36-40                                            |
| S21 | `FILTRO_IZQUIERDA = 1` → `= 5`                                                         | nada con ESTOS ficheros (nota 1)                                                                                                                                         | 0/40                                      | — (verde)                                                      |
| S22 | `FILTRO_ARRIBA = 2` → `= 5`                                                            | ídem                                                                                                                                                                     | 0/40                                      | — (verde)                                                      |
| S23 | `FILTRO_MEDIA = 3` → `= 5`                                                             | ídem                                                                                                                                                                     | 0/40                                      | — (verde)                                                      |
| S24 | `FILTRO_PAETH = 4` → `= 5`                                                             | ídem                                                                                                                                                                     | 0/40                                      | — (verde)                                                      |
| S25 | control: `POSICION_EN_EL_IHDR.ancho: 0` → `4`                                          | lee el alto como ancho, y los tres PNG son cuadrados (nota 2): equivalente                                                                                               | 0/40                                      | — (verde)                                                      |
| S26 | control: `POSICION_EN_EL_IHDR.entrelazado: 12` → `11`                                  | lee el byte de filtro, que también es 0 (nota 2): equivalente                                                                                                            | 0/40                                      | — (verde)                                                      |
| S27 | `POSICION_DEL_ALFA = CANALES_RGB` → `= 2` (nace en `58dc0e3`; no existía en `884a66c`) | el alfa se lee del canal B y, en el apple, se escribe encima de B                                                                                                        | **9/40** en `a48a296`                     | 18-20, 23, 29-32, 36                                           |

Las cifras de las dos tablas son de `884a66c`. En la ronda 2 (§10) se rehicieron los 27 sabotajes sobre
`a48a296`: S1-S17 y S19-S26 dan lo mismo que aquí; S18 cambia y S27 es nuevo, los dos por el menor 5 de la
ronda 1 (`58dc0e3`), como dicen sus filas.

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
- `git show --numstat 591ebab`: `tools/favicon/generar.mjs` +123 −72, y esta bitácora +58 −2. (Corregido en la
  ronda 1, §8: aquí decía «solo `generar.mjs`», medido antes de añadir la bitácora al commit.)

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
  - `glifoDe` en los **65 536** puntos de código del BMP: **65 536 iguales**. De ellos, 231 se resuelven
    sin error, pero U+FFFF (el segmento centinela del formato 4) da el glifo 0, `.notdef`: con glifo real
    son 230 (corregido en la ronda 2, §10).
- `git show --numstat f401f39`: `tools/favicon/generar.mjs` +86 −42, y esta bitácora +44 −1 (corregido en la
  ronda 1, §8).

## 5. Paso 3 — los errores llegan al usuario del CLI sin traza (menor 4)

Mismo método (`parche-3.txt`).

- `class ErrorDelFavicon extends Error {}`, junto a las constantes. Los cuatro `throw` del brief pasan a ser
  `ErrorDelFavicon`, con el MISMO texto:
  - `--salida necesita un directorio`;
  - `la fuente no tiene glifo para U+…`;
  - `glifo compuesto: no soportado`;
  - `<token>: se esperaba UNA declaración #RRGGBB…`.
- El bloque «Principal» pasa a `generar(argv)` sin cambiar ni una sentencia ni su orden. Toda la validación
  (argumentos, glifo y tokens) sigue ANTES de `mkdirSync`, y un comentario lo dice.
- La nueva sección `── Interfaz ──`, al final del fichero, captura los errores y los informa. Hace un
  `try { generar(process.argv.slice(2)) }`, y si algo falla:
  - `ErrorDelFavicon` → `favicon: <mensaje>`;
  - cualquier otro → `favicon: error inesperado: <mensaje>`;
  - los dos, por `console.error`, sin traza y con `process.exitCode = CODIGO_DE_SALIDA_CON_ERROR` (1). NO
    `process.exit()`, por el precedente de Windows de `tools/puerta-anclas.ts`.
  - Corregido en la ronda 1 (§8): aquí decía que la Interfaz «es la única que habla con el usuario», y en el
    paso 3 no lo era, porque `generar` aún imprimía el resumen por stdout. Desde `e99f02a`, `generar` lo
    devuelve y lo imprime la Interfaz.

**Medido**: `comprobar.sh paso3`:

- **I-1**: exit 0, los tres md5 del brief §1, y `cmp` = `public/`;
- **I-2**: la misma línea; stderr, 0 bytes;
- **I-3**: **40/40**; `vitest list`, diff vacío.
- `git show --numstat f0a60fd`: `tools/favicon/generar.mjs` +58 −33, y esta bitácora +64 −1 (corregido en la
  ronda 1, §8).

### I-5 — la ruta de error del CLI

**Método**: `i5/i5.mjs`, un árbol de copia NUEVO por caso en `…/legibilidad/i5/<etiqueta>/cN/`. Replica
la disposición de `RAIZ`, con tres ficheros copiados:

- `tools/favicon/generar.mjs`;
- `src/styles/_tokens.scss`;
- `node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff`.

Los sabotajes se hacen sobre la COPIA, con una sustitución que exige haber cambiado algo; el repo no se
toca. Se ejecuta con `spawnSync(node …)`, y el directorio de salida que se mira es el `--salida` del caso,
o el `public/` del árbol en el caso 1.

El caso 4 es reproducible. Great Vibes tiene 111 glifos compuestos en `glyf` (de 330: 213 simples y 6
vacíos); recorriendo el BMP (`equiv/cmap.mjs`) se llega a uno compuesto desde 73 de los 230 puntos de
código con glifo real (precisión del verificador, ronda 3); la `i` (U+0069) es uno de ellos, y también `"`, `=`, `` ` ``, `j`, `¨`, `´` y `¸`.

El control `c0` es el árbol sin sabotear: exit 0 y los tres md5 del brief §1, antes y después. Eso
demuestra que la copia replica `RAIZ` y que los errores no vienen de la disposición.

**DESPUÉS** (`generar.mjs` del paso 3; `i5/despues/informe.json`):

| Caso | Sabotaje en la copia                                 | Exit | stderr literal (UNA línea)                                                                                                                                  | Líneas `at` | stdout | ¿Se creó la salida? |
| ---- | ---------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------ | ------------------- |
| 1    | `--salida` sin directorio                            | 1    | `favicon: --salida necesita un directorio`                                                                                                                  | 0           | vacío  | no                  |
| 2    | `--accent-soft: rosa;` en `_tokens.scss`             | 1    | `favicon: --accent-soft: se esperaba UNA declaración #RRGGBB en _tokens.scss (rosa)`                                                                        | 0           | vacío  | no                  |
| 3    | `LETRA = 'Ж'` (U+0416, fuera del subconjunto latino) | 1    | `favicon: la fuente no tiene glifo para U+416`                                                                                                              | 0           | vacío  | no                  |
| 4    | `LETRA = 'i'` (glifo compuesto)                      | 1    | `favicon: glifo compuesto: no soportado`                                                                                                                    | 0           | vacío  | no                  |
| 5    | sin la woff (como sin `pnpm install`)                | 1    | `favicon: error inesperado: ENOENT: no such file or directory, open '<copia>\node_modules\@fontsource\great-vibes\files\great-vibes-latin-400-normal.woff'` | 0           | vacío  | no                  |

**ANTES** (`generar.mjs` de `884a66c`, el mismo arnés; `i5/antes/informe.json`): en los cinco casos, exit 1,
stdout vacío y sin directorio de salida, pero con la traza cruda.

- Casos 1-4: 12 líneas de stderr cada uno (10 sin contar las 2 en blanco), de ellas **5** `at`, con la línea
  fuente y el `^`.
- Caso 5: 19 líneas (17 sin las 2 en blanco), de ellas **7** `at`, más el objeto del error (`errno`, `code`,
  `syscall` y `path`).
- Los «sin contar las en blanco» se añadieron en la ronda 1 (§8), recontados sobre `i5/antes/informe.json`.

El exit, el stdout y el «no se crea la salida» ya estaban bien. Lo que arregla el paso 3 es la traza: de 5-7
líneas `at` a 0, y de 12-19 líneas de stderr (10-17 sin las en blanco) a 1.

## 6. Paso 4 — formato y calidad de lo tocado (HEAD `f0a60fd`)

- **Prettier**: `pnpm exec prettier --check` sobre los 5 ficheros del diff contra `main` (`06742d3`) da
  «All matched files use Prettier code style!».
- **TypeScript**: `pnpm typecheck` (`tsc --noEmit`) sale con exit 0 y sin salida.
- **ESLint**:
  - `pnpm exec eslint src/pages/favicon-marca.test.ts` sale con exit 0: 0 errores y 0 avisos.
  - `generar.mjs` queda fuera del bloque `**/*.{ts,tsx}` de `eslint.config.js`, como dice el brief. Sus
    puertas son Prettier, `node --check` (exit 0) y ejecutarlo (I-1, I-2 e I-5).
- **I-7**: `git diff --stat 06742d3 HEAD`, medido en `f0a60fd`, toca 5 ficheros:
  - `src/pages/favicon-marca.test.ts` y `tools/favicon/generar.mjs`;
  - `progress/brief_deuda_favicon_legibilidad.md`, `progress/current.md` y esta bitácora.
  - Ni `public/`, ni `index.html`, ni `package.json`, ni `feature_list.json`: el `cierre` de F-28 es cosa
    del lead.
  - Desfasado desde `b7d3567` (corregido en la ronda 2, §10): se suman los dos informes del judge,
    `progress/judge_deuda_favicon_legibilidad.md` y `…_r2.md`. `git diff --name-only 06742d3` da 6 ficheros
    en `d5ed7af`, y 7 en `3a00169` y en `a48a296`, todos dentro de lo permitido.

## 7. Resumen de invariantes

| Invariante                  | Resultado                                                                                                                                                                                    | Dónde           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| I-1 (bytes)                 | los tres md5 del brief §1 y `cmp` = `public/`, tras CADA paso (1, 2a, 2b y 3)                                                                                                                | §2, §3, §4 y §5 |
| I-2 (stdout)                | la misma línea tras cada paso; stderr, 0 bytes                                                                                                                                               | §2, §3, §4 y §5 |
| I-3 (nombres)               | 40/40 y `vitest list` con diff vacío contra `989d7d6`, tras cada paso                                                                                                                        | §2, §3, §4 y §5 |
| I-4 (sabotajes del test)    | las 4 regiones obligatorias en rojo (S1-S14). S21-S24 en verde, por los fixtures (nota 1); S25-S26, controles. Los 27, rehechos en `a48a296` (§10)                                           | §2              |
| I-5 (errores del CLI)       | los 5 casos: exit 1, una línea `favicon: …`, 0 líneas `at`, stdout vacío y sin directorio de salida                                                                                          | §5              |
| I-6 (`harness init`)        | NO medido aquí: lo mide el lead (suite completa)                                                                                                                                             | —               |
| I-7 (alcance del diff)      | solo los dos ficheros, más `progress/`: 5 ficheros en `f0a60fd`; 7 en `a48a296`, con los dos informes del judge                                                                              | §6              |
| Equivalencia (extra)        | `contornos`: 330/330 glifos iguales; `glifoDe`: 65 536/65 536 puntos de código                                                                                                               | §4              |
| Ronda 1 (menores del judge) | I-1, I-2 (byte a byte), I-3 e I-5 iguales tras cada commit; I-4 rehecho (27 sabotajes): S18 pasa de 5 a 11 rojas y S27, nuevo, da 9; `rangoDelGlifo` equivalente en los dos formatos de loca | §8              |
| Ronda 2 (menores del judge) | `a48a296`: I-1, I-2 (byte a byte), I-3 e I-5 iguales; I-4, 27/27 iguales a la ronda 1; `rangoDelGlifo`, `contornosDelGlifo`, `pathDe` y `glifoDe` equivalentes                               | §10             |
| Mutación                    | NO APLICA, declarado en el brief §4                                                                                                                                                          | —               |

## 8. Ronda de corrección 1 — los menores del judge

> `tdd_craftsman`, 2026-10-01. El texto de la tarea decía HEAD `884a66c`; el HEAD real de la rama era
> `b7d3567` (`32708c3`…`0b7cd62` y el commit del judge), y se trabajó sobre él. Mismo método que en los §3-§5:
> parches de reemplazo exacto (`ronda1/parche-r1a.txt`, `parche-r1b.txt` y `parche-r1c.txt`),
> `prettier --write` y `comprobar.sh` tras cada uno. Lo medido está en `…/scratchpad/legibilidad/ronda1/`.

**Partida** (`comprobar.sh r1-base`, en `b7d3567`): exit 0, los tres md5 del brief §1, `cmp` = `public/`,
stderr de 0 bytes, 40/40 y `vitest list` con diff vacío.

### Commit `e99f02a` — menores 1, 2 y 4 (`generar.mjs` +18 −17)

- **Menor 1.** `generar(argv)` devuelve la línea de resumen, y la Interfaz hace `console.log(generar(…))`.
  De los dos arreglos que proponía el judge, es el que hace cierto el comentario: la Interfaz es la única
  capa que habla con quien ejecuta el CLI, y su comentario dice ahora que imprime el resumen por stdout. El
  resumen sigue saliendo el último, tras las tres escrituras.
- **Menor 2.** En `generar`, `const glifo = contornosDelGlifo(…)` → `const contornos = …`, con
  `pathDe(contornos)` y `cajaDe(contornos)`. `glifo` queda solo para el índice de glifo.
- **Menor 4.** En `glifoDe`, `desplazamiento` → `posicionDelSegmento`, para no confundirlo con
  `desplazamientoDelRango` (el idRangeOffset), que entra en la misma suma.

### Commit `6109869` — menor 3 (`generar.mjs` +17 −11)

- `BYTES_POR_ENTERO_16` (2) y `BYTES_POR_ENTERO_32` (4) se declaran una vez, al abrir la sección de la fuente,
  y los usan cmap, loca y glyf. Desaparecen `BYTES_POR_VALOR` (cmap) y el `BYTES_POR_ENTERO_16` propio del
  glyf.
- `rangoDelGlifo`, sin literales:
  - `inicioEnGlyf(entrada)` lee la entrada de loca con el ancho de su formato; la del formato corto se
    multiplica por `DIVISOR_DE_LA_LOCA_CORTA` (2);
  - el rango es `[inicioEnGlyf(glifo), inicioEnGlyf(glifo + 1)]`;
  - el `glifo * 4 + 4` de antes pasa a ser `(glifo + 1) * 4`: aritmética entera, el mismo valor.
- **Equivalencia** (`ronda1/equiv/`), del generador de `b7d3567` contra el de este commit, cargados como
  módulos sin «Principal»:
  - `rangoDelGlifo`, en los DOS formatos de loca, sobre una loca sintética aleatoria de 5000 entradas:
    5000/5000 iguales en el formato 0 (uint16, dividido entre 2) y 5000/5000 en el 1 (uint32). La fuente real
    usa el formato 0 (`indexToLocFormat` = 0): 330/330 iguales.
  - `contornosDelGlifo`: 330/330 glifos iguales (213 simples, 6 vacíos y 111 compuestos que lanzan el mismo
    mensaje).
  - `glifoDe`: 65 536/65 536 puntos de código del BMP iguales (231 sin error; con glifo real, 230,
    porque U+FFFF da el glifo 0: corregido en la ronda 2, §10).

### Commit `58dc0e3` — menor 5 (`favicon-marca.test.ts` +5 −3)

- `POSICION_DEL_ALFA = CANALES_RGB`, con el comentario «en RGBA, el alfa va detrás de las tres muestras de
  color». En `aRgba`, `p * canales + 3` → `+ CANALES_RGB`, y `p * CANALES_RGBA + 3` → `+ POSICION_DEL_ALFA`.
- Fuera de lo que señaló el judge, se declara: `pixelEn` lee el alfa con `i + POSICION_DEL_ALFA` en vez de
  `i + 3`. Es el mismo número, en la misma sección que el brief marca como «Permitida». Los `i + 1` e `i + 2`
  de G y B se quedan.
- No cambian ni las aserciones, ni los valores esperados, ni los títulos, ni los imports, ni el número de `it`.

### Medido tras cada commit

| Commit    | I-1                                                  | I-2                                                                                                                                                                                           | I-3                              | I-5                                                                                                                                     |
| --------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `e99f02a` | exit 0; los tres md5 del brief §1; `cmp` = `public/` | la misma línea, igual byte a byte a la de `b7d3567` con la ruta sustituida por `<dir>` (`ronda1/i2.mjs`): 147 B con el salto de línea; sin la ruta, 141 B (142 con el salto); stderr, 0 bytes | 40/40; `vitest list`, diff vacío | `i5/r1a`: los 6 casos (c0-c5) iguales a los del paso 3 (`i5/despues`), normalizando solo la ruta de la copia (`ronda1/i5-comparar.mjs`) |
| `6109869` | ídem                                                 | ídem                                                                                                                                                                                          | ídem                             | `i5/r1b`: ídem                                                                                                                          |
| `58dc0e3` | ídem                                                 | ídem                                                                                                                                                                                          | ídem                             | no aplica: el commit solo toca el test                                                                                                  |

**Formato y calidad** (sobre `58dc0e3`):

- `prettier --check` de los dos ficheros, limpio;
- `pnpm typecheck`, exit 0;
- `pnpm exec eslint src/pages/favicon-marca.test.ts`, exit 0;
- `node --check tools/favicon/generar.mjs`, exit 0.

**I-4, rehecho entero sobre `58dc0e3`** (`ronda1/sabotear.sh`, el método del §2): 27 sabotajes, los 26 del §2
más S27. Al terminar, el árbol queda restaurado (0 cambios).

- S1-S17 y S19-S26 dan las mismas rojas y las mismas `it` que en el §2 (el diff de `indices.txt` contra el
  del §2 solo muestra S18 y S27).
- **S18** (`CANALES_RGB = 3` → `= 4`): pasa de 5/40 (20, 23, 36, 38, 40) a **11/40** (18-20, 23, 29-32, 36,
  38, 40). Ahora también mueve `POSICION_DEL_ALFA`, así que el alfa del ICO se lee un byte más allá: el
  sabotaje alcanza ya las líneas que, según el judge, no alcanzaba.
- **S27** (nuevo; `POSICION_DEL_ALFA = CANALES_RGB` → `= 2`): **9/40** (18-20, 23, 29-32, 36). El alfa se
  lee del canal B, y en el apple, además, se escribe encima de B.

**I-7**: `git diff --numstat b7d3567 58dc0e3` da `src/pages/favicon-marca.test.ts` +5 −3 y
`tools/favicon/generar.mjs` +33 −26; nada más. Esta bitácora y `progress/current.md` van en un commit aparte.

### Correcciones a esta bitácora (de la verificación de la primera ronda)

1. **§3, §4 y §5.** «`git diff --stat` del paso: solo `generar.mjs`» se midió antes de añadir la bitácora al
   commit. `git show --numstat` da también la bitácora: +58 −2 (`591ebab`), +44 −1 (`f401f39`) y +64 −1
   (`f0a60fd`). Las cifras del generador eran exactas. Corregido en su sitio.
2. **§5, ANTES.** Las 12 y 19 líneas de stderr cuentan las líneas en blanco; sin ellas son 10 y 17
   (recontado sobre `i5/antes/informe.json`). Las 5 y 7 líneas `at` no cambian. Corregido en su sitio.
3. **§5, la Interfaz.** «La única que habla con el usuario» no era cierto en el paso 3. Corregido en su
   sitio; es cierto desde `e99f02a`.
4. **Línea base de I-3.** La de esta bitácora es `989d7d6`, y la del verificador, `origin/main` `06742d3`.
   Son equivalentes: `git diff --quiet 989d7d6 06742d3` no ve diferencias ni en el test, ni en `public/`, ni
   en el generador.

## 9. Deuda registrada (menor 6 del judge)

**D-1. El decodificador PNG del test tiene ramas que ningún fixture ejecuta.**

- En `src/pages/favicon-marca.test.ts`, las ramas 1-4 de `predictor` (`FILTRO_IZQUIERDA`, `FILTRO_ARRIBA`,
  `FILTRO_MEDIA` y `FILTRO_PAETH`, más la función `paeth`) no corren nunca. Los tres PNG de `public/` llevan
  el filtro 0 en todas sus filas (16 de 16, 32 de 32 y 180 de 180; nota 1 del §2), porque el generador
  siempre escribe el filtro 0.
- La prueba: S21-S24 dan verde, aquí (§8) y en el judge. Esas constantes no tienen peso en ningún test. Si un
  PNG futuro usara otro filtro, entraría por ramas que nunca se han probado.
- Viene de F-28; este refactor no lo introduce.
- Queda fuera del alcance: arreglarlo pide un fixture nuevo y al menos un `it` más, y el brief prohíbe
  cambiar el número de `it`.
- Dos salidas posibles para quien la salde:
  - un PNG sintético construido en el propio test con `deflateSync` (cinco filas, una por filtro, con
    valores conocidos) y un `it` que compare el `rgba` decodificado con lo esperado;
  - o recortar `predictor` al filtro 0 y lanzar con cualquier otro, como ya hace el decodificador con lo que
    no sabe leer.
- **Para el lead**: anotarla como DEUDA REGISTRADA en el `cierre` de F-28.

## 10. Ronda de corrección 2 — los menores del judge de la ronda 2

> `tdd_craftsman`, 2026-10-01. El texto de la tarea decía HEAD `884a66c`; el HEAD real de la rama era
> `3a00169` (el commit del judge de la ronda 2, sobre `d5ed7af`), y se trabajó sobre él. Mismo método que en
> el §8: un parche de reemplazo exacto (`ronda2/parche-r2a.txt`), `prettier --write` y `comprobar.sh`. Lo
> medido está en `…/scratchpad/legibilidad/ronda2/`.

**Partida** (`comprobar.sh r2-base`, en `3a00169`): exit 0, los tres md5 del brief §1, `cmp` = `public/`,
stderr de 0 bytes, 40/40 y `vitest list` con diff vacío.

### Commit `a48a296` — menores 2 y 3 (`generar.mjs` +5 −6)

- **Menor 2.** En `pathDe`, el punto medio entre dos OFF seguidos pasa de `medio` a `puntoMedio`. `medio`
  queda con un solo sentido: el medio trazo (`GROSOR_TRAZO / 2`) de `bajoElTrazo` y `rasterizar`. La rama
  corre de verdad: la «N» (glifo 33) tiene 63 pares OFF-OFF, y 210 glifos de la fuente tienen al menos uno
  (`ronda2/equiv/dos-off.mjs`).
- **Menor 3** (opcional según el judge). `DIVISOR_DE_LA_LOCA_CORTA` → `FACTOR_DE_LA_LOCA_CORTA`, porque se
  usa para multiplicar. El comentario de `head` lo dice: «al leerlos, se multiplican por
  `FACTOR_DE_LA_LOCA_CORTA`». Prettier junta en una línea el lector del formato corto.

**Medido** tras el commit:

- **I-1**: exit 0; los tres md5 del brief §1; `cmp` = `public/`.
- **I-2**: la misma línea, igual byte a byte a la de `3a00169` con la ruta sustituida por `<dir>` (147 B con
  el salto; 141 B sin la ruta); stderr, 0 bytes.
- **I-3**: 40/40; `vitest list`, diff vacío.
- **I-5** (`i5/r2a`): los 6 casos (c0-c5) iguales a los del paso 3 (`i5/despues`) y a los de `6109869`
  (`i5/r1b`), normalizando solo la ruta de la copia.
- **Equivalencia** (`ronda2/equiv/comparar.mjs`, el generador de `3a00169` contra el de `a48a296`, cargados
  como módulos sin «Principal»):
  - `rangoDelGlifo`: 5000/5000 en cada formato de loca (sintética aleatoria) y 330/330 en la fuente real;
  - `contornosDelGlifo`: 330/330;
  - `pathDe`: 219/219 glifos que no lanzan (213 simples y 6 vacíos); los 111 compuestos lanzan igual;
  - `glifoDe`: 65 536/65 536 puntos de código del BMP.
- `prettier --check` y `node --check` de `generar.mjs`, limpios.
- **I-4**, rehecho entero sobre `a48a296` (`ronda2/sabotear.sh`, el método del §2): 27/27 sabotajes aplicados
  (cada uno, una línea), con las mismas rojas y las mismas `it` que en el §8: el `diff` de `indices.txt`
  contra el de la ronda 1 sale vacío. El árbol queda restaurado (0 cambios). El test no cambia desde
  `58dc0e3` (`git diff --quiet 58dc0e3 HEAD -- src/pages/favicon-marca.test.ts`).

### Correcciones a esta bitácora (judge y verificador de la ronda 2)

1. **§2, tabla de I-4** (menor 1). La fila S18 daba 5/40, cierto en `884a66c` (el HEAD del §2); desde
   `58dc0e3` da 11/40 (§8), y S27 solo salía en prosa. Ahora la fila S18 lleva las dos cifras, S27 tiene
   fila y las dos se midieron de nuevo en `a48a296`.
2. **§4 y §8, «231 de ellos con glifo»** (menor 4). 231 puntos de código del BMP se resuelven sin error,
   pero U+FFFF da el glifo 0 (`.notdef`): es el segmento centinela del formato 4 (inicio = fin = 0xFFFF,
   delta 1, idRangeOffset 0; `ronda2/equiv/centinela.mjs`). Con glifo real son **230**
   (`ronda2/equiv/bmp.mjs`, el mismo resultado con el generador de `3a00169` y con el de `a48a296`). La
   equivalencia 65 536/65 536 no cambia.
3. **§8, I-2.** «147 bytes … quitando la ruta» describía mal la medida. 147 B es la línea con la ruta
   SUSTITUIDA por `<dir>` (5 B), más el salto de línea, que es lo que compara `ronda1/i2.mjs`. Sin la ruta, la
   línea mide 141 B (142 con el salto). Medido con `ronda2/i2-bytes.mjs` sobre los stdout de `b7d3567`,
   `e99f02a`, `6109869`, `58dc0e3`, `3a00169` y `a48a296`: las tres cifras, iguales en los seis. La igualdad
   byte a byte no cambia.
4. **§6, I-7.** Los 5 ficheros se midieron en `f0a60fd`. Luego se suman los dos informes del judge: 6 en
   `d5ed7af`, y 7 en `3a00169` y `a48a296`. Ninguno es `public/`, `index.html`, `package.json` ni
   `feature_list.json`. Corregido en su sitio y en el §7.
5. **«Estado al cerrar»** (menor 5). Decía «Sin push y sin PR». Lo de la PR es cierto; lo del push, no: ver
   el estado corregido abajo.

Ningún menor queda como deuda nueva: los 5 están resueltos.

## Hallazgos

1. **Ramas muertas en el decodificador del test.** Los filtros PNG 1-4 de `predictor` no los ejercita
   ningún fixture: los tres PNG usan el filtro 0 en todas sus filas. Viene de F-28; no se ha tocado,
   porque añadir fixtures queda fuera del alcance. Registrado como deuda D-1 en el §9.
2. **Great Vibes tiene 111 glifos compuestos.** Entre ellos están la `i`, la `j`, `"` y `=`. Si algún día
   cambia `LETRA`, el generador puede negarse con `glifo compuesto: no soportado`, que ahora sale limpio.
3. **Números que siguen sin nombre en el generador**, fuera de la lista del brief:
   - los anchos de `loca` (`* 4`, `* 2`), que tienen nombre desde la ronda 1 (§8);
   - el IHDR del codificador PNG;
   - los 3/4 canales del rasterizador.
   - Están declarados en el §3, por si el judge los quiere en otra pasada.

## PENDIENTE (del lead)

- **I-6**: `node .harness/harness.mjs init` completo, sobre el HEAD de la ronda 2.
- Si el lead lo quiere, un `judge` de la ronda 2 de corrección. Los dos anteriores:
  `progress/judge_deuda_favicon_legibilidad.md` (`b7d3567`) y `…_r2.md` (`3a00169`).
- El `cierre` de F-28 en `feature_list.json`, con la deuda D-1 del §9, y la PR a `main`.

## Estado al cerrar

- Rama `claude/bold-liskov-c3323b`, con los commits de esta sesión:
  - `32708c3`: I-4;
  - `591ebab`: paso 2a;
  - `f401f39`: paso 2b;
  - `f0a60fd`: paso 3;
  - y el de esta bitácora (paso 4).
- Ronda 1 (§8):
  - `e99f02a`: menores 1, 2 y 4;
  - `6109869`: menor 3;
  - `58dc0e3`: menor 5;
  - y el de esta bitácora (§8 y §9, con la deuda del menor 6).
- Ronda 2 (§10):
  - `a48a296`: menores 2 y 3;
  - y el de esta bitácora (§10: menores 1, 4 y 5, y las discrepancias del verificador).
- Push y PR, medidos en la ronda 2 (aquí decía «Sin push y sin PR», y lo del push era falso):
  - el reflog de `origin/claude/bold-liskov-c3323b` registra cinco «update by push»: `0b7cd62` (11:57:38),
    `e99f02a` (12:07:29), `d5ed7af` (12:15:42), `3a00169` (12:29:42) y `a48a296` (12:49:46);
  - esta sesión no hizo ningún push: `a48a296` (creado a las 12:34:19) lo empujó otro actor mientras se
    escribía esta bitácora, y los commits de la bitácora (`d7a3233` y su corrección) los subió el lead a
    las 13:13 (`ca36722`). El «otro actor» de todos esos push es la sesión principal (el lead), que subía
    cada punto en verde;
  - PR, ninguna: `gh pr list --head claude/bold-liskov-c3323b --state all` da `[]`.
- Árbol de trabajo limpio; `public/` sin tocar.

## Cierre del lead (2026-10-01)

- **Ronda 3** (`progress/judge_deuda_favicon_legibilidad_r3.md`): judge APPROVED, 0 bloqueantes y 2 menores;
  verificador independiente con I-1, I-2, I-3, I-5 e I-7 en verde, medidos de nuevo sobre `ca36722`.
  - Menor 1 (el comentario de `generar` prometía que «un error no deja iconos a medias»): corregido por el
    lead; solo vale para los errores de validación (caso c8, fallo de E/S, idéntico en `main`).
  - Menor 2 (`generar.mjs:271`, 107 columnas en un literal de plantilla que Prettier no puede partir):
    ACEPTADO, cosmético; precedente en `main` (línea 332, 109 columnas) y `format:check` en verde.
  - Discrepancias de redacción del verificador (recuento de glifos compuestos, estado del push):
    corregidas arriba en esta bitácora.
- **I-6** (lead, 13:24-13:29, sobre los remates de arriba): `node .harness/harness.mjs init` en este worktree en
  VERDE: entorno, ficheros del arnés, `feature_list.json` (27), typecheck, ESLint y Prettier a 0, y la suite
  completa con el build real, 56 ficheros y **1820/1820**. Las tres salidas del generador, con los md5 del
  brief §1 tras el último cambio (el comentario).
