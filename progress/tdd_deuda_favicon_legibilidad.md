# TDD — deuda de legibilidad de F-28 (`favicon_marca`): menores 1-4 del judge

> `tdd_craftsman`, 2026-10-01: refactor SIN cambio de comportamiento. Contrato:
> `progress/brief_deuda_favicon_legibilidad.md` (invariantes I-1..I-7). Rama `claude/bold-liskov-c3323b`.
>
> **INTERRUMPIDO tras el paso 1 (≈11:19).** Una sesión hermana trasladó a Pablo su decisión: la deuda se
> termina en la sesión principal. El lead paró al `tdd_craftsman` y cerró esta bitácora. Lo marcado
> **[lead]** lo midió el lead tras la parada; el resto sale de los ficheros del `tdd_craftsman` en el
> scratchpad de la sesión (`…/scratchpad/tdd/`), que no van al repo.

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

## 2. MEDIDO

- **I-1 (bytes)** del paso 1: `comprobar.sh paso1` → los tres md5 del brief y `cmp` = `public/`
  (`despues-paso1/`).
  - **[lead]** Recomprobado: svg `69ffa8c4…`, ico `907b2317…`, png `b8234317…`. Era de esperar, porque
    `git diff 989d7d6 HEAD -- tools/ public/ index.html` está vacío: el generador aún no se ha tocado.
- **I-2 (stdout)**: misma línea que en el brief §1 (`paso1.stdout.txt`; solo cambia la ruta).
- **I-3 (nombres)**, **[lead]**: `vitest list` en `7b7351a` es IDÉNTICO a `vitest-list-antes.txt`. Son 40
  nombres y el `diff` sale vacío. Además, `pnpm exec vitest run src/pages/favicon-marca.test.ts` da
  **40/40**.
- **I-4 (sabotajes del test)**: el `tdd_craftsman` dejó 16 registros (`sabotaje-S1..S16.log`), pero la
  bitácora NO llegó a anotar qué cambiaba cada uno. Lo que prueban los registros:

  | Sabotaje                            | Resultado      | Qué cae (muestras de los registros)                                     |
  | ----------------------------------- | -------------- | ----------------------------------------------------------------------- |
  | S1, S2                              | 20 de 40 rojas | @s4 ANCLA POSITIVA de los tres raster                                   |
  | S3, S4                              | 18 de 40 rojas | —                                                                       |
  | S5, S15                             | 15 de 40 rojas | —                                                                       |
  | S6, S8, S9                          | 13 de 40 rojas | —                                                                       |
  | S7                                  | 2 de 40 rojas  | @s5, las entradas de 16 y 32 px como PNG completo (profundidad 8…)      |
  | S10                                 | 1 de 40 roja   | @s4 «el PNG de 16×16 del ICO tiene **255** píxeles» (el total cambiado) |
  | S11                                 | 1 de 40 roja   | @s4 «el PNG de 32×32 … tiene **undefined** píxeles» (la clave rota)     |
  | S12, S13                            | 10 de 40 rojas | —                                                                       |
  | S14                                 | 5 de 40 rojas  | @s4 y @s6 del apple-touch-icon                                          |
  | S16 (y `S16-antes`, de control)     | 40/40 verde    | **no concluyente**: el agente se paró a mitad de ese sabotaje           |
  | **[lead]** `desplazamiento: 12 → 8` | rojo           | ≥ 8 `it` de @s4/@s5 del ICO (p. ej. «desplazamiento + tamaño ≤ …»)      |
  - El de `POSICION_EN_LA_ENTRADA_ICO.desplazamiento` era el que estaba sin commitear cuando paró el
    agente. El lead lo reprodujo con `sed` sobre `7b7351a`: en rojo. Restaurado con `git checkout --`, y
    el fichero vuelve a ser idéntico a HEAD.
  - Así que las cuatro regiones del brief (tipo del trozo, IHDR, entrada ICO y total de píxeles) tienen al
    menos un sabotaje en rojo. Pero los S1-S15 hay que REDOCUMENTARLOS (qué constante y qué valor) antes
    del judge.

## 3. PENDIENTE (lo retoma la sesión principal)

- **Paso 2**: nombres y constantes de `tools/favicon/generar.mjs` (menor 3, brief §2.B).
- **Paso 3**: partir `contornos` en funciones de un solo motivo; las coordenadas x/y, en UNA función por
  eje.
- **Paso 4**: errores (menor 4): tipo de dominio, `generar(argv)` y captura en la capa de interfaz con
  `process.exitCode = 1`, sin traza.
- **I-1/I-2** tras cada paso del generador (`comprobar.sh <paso>`).
- **I-5**: los 5 casos de la ruta de error, en un árbol del scratchpad.
- **I-4**: anotar qué sabotea cada S1-S15. Opcional: repetir S16.
- **I-6**: `node .harness/harness.mjs init` completo. La línea base de la sesión era 56 ficheros y
  1820/1820; tras el paso 1 solo se corrió el fichero (40/40), no la suite entera.
- Después: `judge` → `progress/judge_deuda_favicon_legibilidad.md`; el `cierre` de F-28 en
  `feature_list.json`; la PR a `main`.

## 4. Estado al cerrar

- Rama `claude/bold-liskov-c3323b`:
  - `989d7d6` (brief);
  - `7b7351a` (paso 1);
  - `bff2e96` (fusión de `origin/main` hecha por la sesión principal, solo documentación);
  - y el commit de esta bitácora.
- Sin push y sin PR.
- Árbol de trabajo limpio: ningún sabotaje vivo, y `src/pages/favicon-marca.test.ts` == `7b7351a`.
