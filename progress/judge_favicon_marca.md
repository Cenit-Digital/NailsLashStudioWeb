# Review — feature 28 `favicon_marca`

**Veredicto:** APPROVED (condicionado a que la suite completa con el build real y `bin/harness init`, que
corre el lead en paralelo, terminen verdes; este juez NO los ha corrido por orden expresa del lead. Si esa
corrida sale roja, este veredicto queda anulado.)

**Bloqueantes: 0. Menores: 8.**

Alcance: `git diff 8b7c4c5 -- . ':!progress/current.md'` (commits `c94d23e`, `ddcc9cf`, `a5af21b`; `93796fa` es
la fusión de `main`) MÁS el árbol de trabajo: `src/pages/home-horneado.test.ts` (@s8),
`progress/tdd_favicon_marca.md`, `progress/verificacion_viva_favicon_marca.md` (+ capturas) y
`docs/research/favicon/verificacion-viva/`. Contrato APROBADO: `features/favicon_marca.feature` (10
escenarios), leído entero con sus cabeceras. Fuentes: `project-spec.md` §Feature 28, brief, gherkin, las dos
bitácoras TDD y el informe en vivo.

## Comprobaciones propias del juez (solo lectura: nada escrito en el repo salvo este fichero)

- `pnpm exec vitest run src/pages/favicon-marca.test.ts` → **40/40** (10:32).
- Generador, sin tocar `public/`: `node tools/favicon/generar.mjs --salida <scratchpad>/a` y `/b` → los tres
  ficheros son `cmp`-idénticos entre las dos pasadas (determinista) y a `public/` (coherente). `git status`
  sigue sin `public/` ni `index.html`.
- Copia del test y de sus entradas en el scratchpad (`judge-copia/`): control 40/40. Cinco sabotajes propios,
  cada uno revertido (control final 40/40 y `cmp` con el repo):
  - J1 · `--ink: #8E3355;` duplicada en `_tokens.scss` → 1 rojo: «@s4 ANCLA POSITIVA: _tokens.scss declara
    EXACTAMENTE una vez…». Era el único `it` que la bitácora (§4) dejó sin sabotaje. Con él, **47/47** `it`
    de F-28 caen con al menos un sabotaje.
  - J2 · `--ink` → `#8E3356` sin regenerar → 1 rojo (@s4, colores del SVG). FS-4 se cumple gracias al SVG.
    Con ±2 de tolerancia, los raster no ven un cambio de 1 unidad, y es lo esperado.
  - J3 · `--accent-soft` igual a `--ink` → 15 rojos, entre ellos el «DISTINTAS» del ancla de tokens.
  - J4 · los tres `<link>` movidos a `<body>` → 4 rojos: el ancla «3 en `<head>`» de @s1 y los tres
    posicionales.
  - J5 · `--ink: rgb(142 51 85);` → 15 rojos (ancla `#RRGGBB`).
- `prettier --check` de los ficheros tocados → limpio. El `.feature` queda fuera porque no tiene parser, como
  el resto de `features/`. `eslint` de `tools/favicon/generar.mjs`, de los dos tests y de
  `docs/research/favicon/` → exit 0.
- Grep: 0 hex en `favicon-marca.test.ts`. Sus imports son solo `node:fs`, `node:path`, `node:zlib` y
  `vitest`. `_tokens.scss` tiene 1 `--accent-soft:` y 1 `--ink:`.
- El `mutate` de `stryker.config.json` es una lista explícita de `src/lib/*` y componentes, sin `index.html`,
  `public/` ni `tools/`. Queda confirmado que la MUTACIÓN NO APLICA.
- Capturas vistas:
  - `pestana-real.png`: la «N» en tinta sobre el cuadrado rosa, en la pestaña de `127.0.0.1:4191`.
  - `pestana-contraprueba.png`: el globo genérico, en `:4192`.
  - Los puertos casan con `s9-preview.mjs:139-143` (`vite preview` + proxy).

## Cobertura de escenarios (@s ↔ test)

FM = `src/pages/favicon-marca.test.ts` · HH = `src/pages/home-horneado.test.ts`.

- @s1: [x] FM:96-132. Extrae por atributos del literal `<head>` (FM:70-79).
  - Ancla: 3 en `<head>` y 3 en el fichero entero (FM:97-100).
  - Posicionales: 1.º en 102-108, 2.º en 110-116 y 3.º en 118-123. El `href` se compara exacto (`get`) y
    `rel`/`type`/`sizes` sin mayúsculas (`valorDe`).
  - Ningún `href` lleva la base, `//` ni `:` (125-131). La base va a mano (FM:89).
  - `index.html:6-8` cumple FM-5: ICO con `sizes="32x32"`, luego SVG con `type`, luego Apple, todo sin la
    base. El literal `<head>` sigue intacto y no hay `<title>` estático (F-04 @s33).
- @s2: [x] FM:174-213.
  - Ancla 1/1/1 en los dos ficheros (175-181).
  - Ancla a mano del oráculo (183-191).
  - viewBox y rect idénticos (193-201).
  - `d` idéntico, sacado del oráculo y no escrito a mano (203-205).
  - `"18"` y `"round"` a mano (207-212).
- @s3: [x] FM:241-278.
  - Ancla xmlns + `<path` (242-247).
  - 0 etiquetas vigiladas (249-253).
  - 0 `href`/`url(`/`@import` (255-259).
  - 1 `http`, y por posición es la del xmlns (261-266).
  - Comentario antes de `<svg` (268-277).
- @s4: [x] FM:617-663. Los colores salen SOLO de `_tokens.scss` (FM:289-317).
  - Ancla de tokens (618-628).
  - fill y stroke del SVG contra los tokens (630-639).
  - Ancla de cada raster: w×h, ≥ 1 soft opaco y ≥ 1 de tinta (641-651, ×3).
  - Mezcla ±2 con t recortada (653-662, ×3).
- @s5: [x] FM:682-741.
  - Cabecera 0/1/2 (683-685).
  - Medidas 16/32 (687-694).
  - Desplazamiento + tamaño ≤ longitud (696-702).
  - PNG completo con el IHDR de SU entrada, tipo 6 e IEND exacto (704-724, ×2).
  - Ancla del píxel central superior, ANTES de las esquinas (726-734).
  - Esquinas con α ≤ 25 (736-740).
- @s6: [x] FM:745-780.
  - Ancla firma/IHDR/IEND en el último byte (746-754).
  - IHDR 180×180, profundidad 8, tipo 2, sin entrelazado (756-766).
  - Sin tRNS (768-773).
  - Esquinas = soft exacto (775-779).
- @s7: [x] FM:817-841.
  - Ancla ≥ 1 píxel de tinta (818-823, ×2).
  - Caja en coordenadas de BORDE (792-802) a ±1 de las cajas a mano (806-809), en 825-840 (×2).
- @s8: [x] HH:548-630. Es solo añadido (+84/−0): sin imports, sin `beforeAll` y sin build.
  - Ancla EXACTAMENTE 3 (579-584).
  - Posicionales con la base escrita a mano (586-607).
  - Bytes (609-629): guarda de prefijo, existe, > 0 y `equals` con `public/`. Lee `join(artefacto, nombre)`,
    el temporal de #17 (HH:56-65), y NO el `dist/` del proyecto.
  - Extracción: `elementos('link')` + `valorDe` de @s40 (HH:234-243) más un filtro (HH:558-567), igual que
    `precargasDe`. No es un segundo extractor.
- @s9: [x] en vivo, `progress/verificacion_viva_favicon_marca.md` §2.
  - Montaje: Chromium 153 con ventana y perfil nuevo por sitio; red y consola registradas antes de navegar
    (`s9.mjs:73-104`, `s9-preview.mjs`).
  - Ancla `200 …/favicon.svg` ✓.
  - 0 × 404 en la red (registro del servidor/proxy, 13 peticiones) y en la consola ✓.
  - 0 peticiones a `/favicon.ico` de la raíz ✓.
  - Captura archivada ✓ (vista).
  - Contraprueba con 404 y «Failed to load resource» ✓. Prueba además que la consola SÍ ve un 404 de favicon,
    así que «0 en consola» no es vacuo.
  - FM-5 medido: Chromium pide solo el SVG.
  - `vite preview` da 404 fuera de la base [V], y aun así se repite con un servidor tipo Pages.
- @s10: [x] en vivo, §3.
  - Calibración a 16/32/180: C con trazo > 0, y sin/con = 69,5/73,3/72,1 % (≤ 80 %) ✓.
  - raster/con = 96,9/101,4/100,3 % (±10 %) ✓.
  - Nueve C y seis cocientes anotados ✓.
  - Sabotaje 9: 69,8/73,0/72,2 %, ROJO a los TRES tamaños, también a 16 y 32 (lo que pedía H-2).
  - No afirma nada sin medida: las inferencias van marcadas [I] (columna Pages, ICO de respaldo).

## Disciplina TDD

- ¿Producción sin test que la pida? **NO.**
  - `index.html:6-8`: lo exigen @s1 y @s8, atributo a atributo.
  - Los tres ficheros de `public/`: lo relevante lo exigen @s2-@s7, y su copia, @s8. Los campos del ICO que
    ningún test lee (planos 1 y bpp 32, `generar.mjs:443-444`) los impone el formato.
  - `tools/favicon/generar.mjs`: SIN tests por contrato (lista cerrada, Contrato 4, precedente
    `aplicador.mjs`). He comprobado que reproduce las salidas byte a byte. Ningún test pide su `--salida`
    (51-57), pero es ergonomía de una herramienta exenta, y es lo que permitió el sabotaje 9 y mi comprobación
    sin tocar `public/`.
- ¿Evidencia de Rojo→Verde→Refactor? **PARCIAL** (no bloquea, ver el menor 5). El Rojo→Verde está
  re-demostrado por escenario en `progress/tdd_favicon_marca.md` §2 y §2.1:
  - sin `public/`: 33 rojos / 7 verdes → 40/40 al generar, byte a byte igual a HEAD;
  - con el `index.html` de `ba5b498`: 5 rojos de @s1;
  - @s8 sobre el árbol de antes de F-28: 7 rojos / 35 verdes.
- Sabotajes:
  - 1-8 de bytes, con su rojo (27 variantes);
  - la parte @s8 de los sabotajes 1 y 7 (6/6);
  - el 9, en vivo;
  - los extra E1-E16 y los J1-J5 de este juez.

## Hallazgos H-1..H-8 de la bitácora: ¿esconden un bloqueante? No

- H-1 (el ciego de 1 px es más estrecho de lo declarado): es una buena noticia, no un defecto.
- H-2 (un ICO sin trazo no se ve en los bytes): lo cierra @s10, medido a 16 y 32 con el sabotaje 9 en ROJO.
- H-3 (la aserción del IHDR solo cae con 5d): demostrada con 5d.
- H-4 (validación de la herramienta de sabotaje): correcta.
- H-5: ver el menor 8.
- H-6 (el sabotaje 2 no se ve en @s8): ya previsto por el contrato, y lo caza @s1 (2a-2c).
- H-7 (el «uno por fila» lo guarda solo el ancla): es el diseño del contrato (caso límite 3); E16 lo demuestra.
- H-8 (concurrencia): sin efecto.
  - La medida en vivo sirve una copia fija de un `dist/` construido a las 10:12:48. Es anterior a la primera
    ventana saboteada (10:17:25), y ninguna corrida tocó `dist/` (H-3).
  - `s10.mjs` compara el MD5 contra `git show HEAD:public/…`, no contra el árbol de trabajo.
  - Hoy `index.html` y `public/` están limpios y el generador los reproduce.

## Lista cerrada

Todo lo tocado está en la lista del contrato:

- `index.html` (+3 líneas);
- `public/` ×3;
- `tools/favicon/generar.mjs`;
- `favicon-marca.test.ts`;
- `home-horneado.test.ts`, solo añadido.

A eso se suman `progress/`, `docs/research/favicon/`, los documentos de spec y contrato
(`project-spec.md`, `features/`, `feature_list.json`) y la fusión de `main`. Las dos excepciones,
`.gitignore` y `.prettierignore`, son higiene del lead (menor 6). `package.json` está intacto: ninguna
dependencia nueva.

## Calidad

- Test de bytes y @s8:
  - funciones cortas y de un solo motivo, con nombres de dominio;
  - anclas positivas siempre antes de las negativas;
  - mensajes de fallo que dicen QUÉ cae (FM:126-130, 659-660, 837-838; HH:582-583, 614-627);
  - respetan FS-3 y FS-5: no importan `src/` ni el generador, y no re-rasterizan.
- Generador: cumple FM-6 y FS-4.
  - Cero dependencias.
  - Lee la woff autoalojada (33-36).
  - Lee los tokens y exige UNA declaración `#RRGGBB` de cada uno (221-228).
  - Salidas deterministas.
- Los detalles van en los menores.

## Checkpoints

- C1: [x] ficheros y docs base presentes. `bin/harness init` NO lo ha corrido este juez (orden del lead):
  condicionado.
- C2: [x] una sola feature `in_progress` (F-28), y `progress/current.md` describe la sesión activa.
  «Toda `done` con tests que pasan» lo dirá la suite del lead: condicionado.
- C3: [x]
  - `src/` solo gana un fichero de test.
  - Sin dependencias nuevas: `playwright-core` está fuera del repo.
  - Sin TODO ni logs de depuración: el `console.log` de `generar.mjs:478` es la salida del CLI.
- C4: [x] ficheros reales y el artefacto temporal real de #17, sin mocks de FS. `bin/harness test` verde:
  condicionado.
- C5: [ ] pendiente del lead. Los ficheros sin rastrear (informe, capturas, guiones) son legítimos y van al
  commit; falta la entrada de `progress/history.md`.
- C6: [x] `.feature` + §Feature 28, `@s1..@s10`, mapa @s→test (§1 de la bitácora), sin producción no pedida.
- C7: [x] N/A declarado y comprobado en `stryker.config.json`, compensado con sabotajes (47/47 `it`, + @s10).

## Cambios requeridos

Ninguno bloqueante.

## Menores (no bloquean; para el lead o una ronda futura)

1. Números de formato sin nombre al lado de otros que sí lo tienen, en `favicon-marca.test.ts`:
   - `:338`: `posicion + 4` (tipo del trozo), junto a `LARGO_DE_LA_CABECERA_DE_TROZO`;
   - `:370-374`: desplazamientos 0/4/8/9/12 del IHDR;
   - `:480`: `!== 8`;
   - `:520-523`: `base + 1/8/12` de la entrada ICO, junto a `LARGO_DE_LA_ENTRADA_ICO`.
2. `favicon-marca.test.ts:611-615`: la clave `pixeles` de `LOS_TRES_RASTER` se llama igual que la función
   `pixeles` (568) y obliga a renombrarla al desestructurar (643).
3. `tools/favicon/generar.mjs:60-159`: nombres de una letra o abreviados (`o`, `d`, `p`, `f`, `nc`, `np`, `g`,
   `ro`, `cs`, `pts`, `q`) y números de formato sin nombre (WOFF 12/44/20, `head` 50, bits de flags
   1/2/4/8/16/32). Además, `contornos` (110-159) hace cuatro cosas. Como la herramienta no tiene tests por
   contrato, los nombres son su única documentación. Mismo nivel que el precedente `aplicador.mjs`.
4. `tools/favicon/generar.mjs:55, 98, 115, 225`: los `throw` llegan sin capturar al usuario del CLI (traza
   cruda y exit 1). `docs/conventions.md` pide capturar en la capa de interfaz y salir ≠ 0 sin traza. Es
   igual que `aplicador.mjs:38`, y el contrato no lo pide.
5. TDD: las 40 `it` de @s1-@s7 se escribieron en batería antes del Verde (33/7 → 40/40).
   - Las escribió un actor distinto del `tdd_craftsman` (lo anota `progress/current.md`, corte de 2026-09-30
     18:25).
   - @s8 pasó a la primera porque la producción ya existía.
   - El Rojo se re-demostró por escenario y con sabotajes. Para artefactos estáticos generados por una
     herramienta exenta, basta; pero no es el «un test a la vez» de `docs/tdd.md`, y no debe volverse norma
     en `src/`.
6. Fuera de la lista cerrada: `.gitignore` y `.prettierignore` (`.claude/worktrees/`, commit `c94d23e`). Es
   higiene del arnés del lead, declarada en el commit y en `progress/current.md`, no producto. Conviene
   mencionarlo en la descripción de la PR.
7. Informe en vivo:
   - No se archivan los resultados crudos que escriben los guiones (`resultado-s9.json`,
     `resultado-s10.json`). Sin ellos, las cifras (13 peticiones, 0 mensajes de consola, las nueve C) solo se
     re-auditan repitiendo la medida.
   - `s10.mjs:115` dice «copia fija de dist/ (09:40)» y el informe §0 habla del build de las 10:13; dos de
     las tres pasadas (09:51 y 10:04) son anteriores a la fusión. Los iconos no cambiaron desde `ddcc9cf` y
     no altera ninguna cifra, pero el comentario y el informe deberían decir lo mismo.
8. H-5: si falta un fichero de `public/`, `vite-react-ssg build` deja el `href` sin la base (el 404 del H-2 en
   producción) y sale con 0, y ninguna de las cinco puertas lo ve; solo la suite (@s2-@s8). Es la deuda ya
   aceptada en FS-6. Conviene anotarla como deuda explícita de F-05, por si algún día se publica sin pasar
   la suite.
