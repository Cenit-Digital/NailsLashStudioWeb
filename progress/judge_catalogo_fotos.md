# Review — feature 27 `catalogo_fotos`

**Veredicto:** CHANGES_REQUESTED — **1 bloqueante** (B1), 8 notas.

La producción es EXACTAMENTE la del contrato: el bloque `<img>` de CF-C2 byte a byte, los datos de CF-C1, la hoja de
CF-C3 y `mutate` += `Catalogo.tsx`. Nada queda fuera de alcance. Los tests muerden: lo he medido con **36 sabotajes**
en una COPIA del repo, y 34 caen. Los 6 mutantes esperados de la tabla mueren todos. La evidencia de @s20/@s21 tras el
relevo es REAL: la he reproducido con los mismos recuentos y los mismos mensajes, byte a byte.

El bloqueante es de fidelidad de UN test a la letra de dos `Then` («aparece EXACTAMENTE UNA VEZ en el catálogo», @s8 y
@s9): una segunda aparición de cualquiera de las dos leyendas, como fragmento de otro párrafo, deja la suite en verde.
El arreglo son dos aserciones en `catalogo.test.tsx`. **Producción no se toca.**

## Base de la revisión

- **Qué revisé:** `git diff 497e065 5482984` (10 ficheros), con el árbol real limpio antes y después.
- **Contra qué:**
  - `features/catalogo_fotos.feature` (26 escenarios: @s1-@s21 por TDD; @s22-@s26 `@verificacion-viva`, que aquí NO
    se exigen);
  - `project-spec.md` §Feature 27 (`:3932-4070`: CF-C1..CF-C6, CF-1..CF-7);
  - `progress/tdd_catalogo_fotos.md`;
  - `docs/tdd.md`, `docs/workflow.md` y `CHECKPOINTS.md`.
- **Qué ejecuté:**
  - Solo los 4 ficheros acotados, en el repo real: **66/66 verdes** (36 + 7 + 10 + 13, cuadra con la bitácora).
  - Por orden del lead (Stryker y Chrome corriendo a la vez) NO ejecuté la suite completa, `bin/harness init`, `pnpm
build` ni Stryker.
  - La evidencia de suite completa, typecheck, lint y format es la del cierre del TDD, en el scratchpad:
    - `snapshot_verde.log`: `tsc --noEmit`, `eslint .`, `vitest run` → 55 ficheros / 1760 tests;
    - `formato.log`: Prettier limpio.
- **Sabotajes:** en una COPIA (`scratchpad/judge27/`, con `node_modules` enlazado), con el script
  `scratchpad/judge27_sab.py`. Cada uno exige una sola coincidencia, se restaura y se comprueban los bytes
  (`restaurado=True` en todos). **En el árbol real solo he añadido este informe.**

## Bloqueantes

### B1 — @s8 y @s9: «aparece EXACTAMENTE UNA VEZ en el catálogo» se mide por elementos, no por apariciones

- **Dónde:**
  - `src/components/catalogo.test.tsx:286-288`: `screen.getAllByText(LEYENDA_FOTOS_A_MANO)` + `toHaveLength(1)`;
  - `src/components/catalogo.test.tsx:304-306`: lo mismo con `LEYENDA_PRECIOS_A_MANO`.
  - `getAllByText` con cadena casa SOLO los elementos cuyo texto COMPLETO es la leyenda. Un duplicado metido como
    fragmento de otro texto no cuenta.
- **Qué dice el contrato:**
  - `features/catalogo_fotos.feature:223`: «el texto "Fotos de banco de imágenes…" aparece EXACTAMENTE UNA VEZ en el
    catálogo»;
  - `features/catalogo_fotos.feature:235`: «ese texto aparece EXACTAMENTE UNA VEZ en el catálogo»;
  - CF-C2 (`project-spec.md:3983`): «un `<p>` con `LEYENDA_FOTOS`, **exactamente una vez**».
  - Son cláusulas DISTINTAS de «es el contenido COMPLETO de un `<p>`» (`:224`), que el test sí cubre.
- **Medido** (copia, `catalogo.test.tsx`):

  | Sabotaje en `Catalogo.tsx`, tras el `<p>` de fotos                     | Resultado         |
  | ---------------------------------------------------------------------- | ----------------- |
  | `<p className={estilos.leyenda}>Nota: {LEYENDA_FOTOS}</p>`             | **VERDE** (36/36) |
  | `<p className={estilos.leyenda}>Nota: {LEYENDA_PRECIOS}</p>`           | **VERDE** (36/36) |
  | (control) leyenda de fotos dentro del `.map`, ×3: sabotaje (o) del TDD | rojo              |
  | (control) leyendas cruzadas: sabotaje (m) del TDD, reproducido         | rojo (2)          |

  El HTML horneado enseña DOS veces cada leyenda y @s8/@s9 siguen verdes.

- **Qué se pide** (solo el `tdd_craftsman`, solo el test):
  - En @s8 y en @s9, una aserción que cuente APARICIONES del literal escrito a mano en el texto del catálogo, p. ej.
    `container.textContent.split(LEYENDA_FOTOS_A_MANO).length - 1 === 1`, o lo mismo sobre `horneado()`. Se mantienen
    las aserciones actuales, que cubren «contenido completo de un `<p>`».
  - Hay que demostrar que los dos sabotajes de la tabla se ponen ROJOS y que la fuente actual sigue verde. Se anota en
    `progress/tdd_catalogo_fotos.md`.
  - **Impacto en la mutación:** ninguno sobre `Catalogo.tsx`. La corrección solo AÑADE aserciones, así que ningún
    mutante que hoy muere puede sobrevivir. Aun así, el `mutation_tester` debe dejar anotado contra qué versión de los
    tests midió.

## Cobertura de escenarios (@s ↔ test)

Todos los esperados van escritos a mano: los tests de render no importan `CATALOGO_DEMO` ni `LEYENDA_*`, y no hay ni un
`toHaveClass` (verificado con grep; solo aparecen en comentarios).

| @s  | Test(s)                                                                      | ¿Cada `Then` cubierto?                                                                                                                   |
| --- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| s1  | `catalogo.test.tsx:60-74` (×3, bloque `<h3>`→`<h3>`/leyenda, ancla positiva) | [x] una `<img>` por bloque + `alt` exacto                                                                                                |
| s2  | `:76-89`                                                                     | [x] 3 alt no vacíos, distintos; 3 src distintos                                                                                          |
| s3  | `:91-127` (3 `it`)                                                           | [x] orden de ficheros + `.jpg`; sin `http(s)://`, `//`, `data:`; horneado sin `http(s)` con ancla                                        |
| s4  | `:129-151`                                                                   | [x] `800`/`1000`/`lazy`; ni `fetchpriority` ni `eager` (con ancla)                                                                       |
| s5  | `:167-197` (×3 + global)                                                     | [x] dos hijos, carta y luego `IMG`; 0 `aria-hidden="true"`; sin `role` ni `aria-hidden` en la `<img>`                                    |
| s6  | `:199-239` (4 `it`)                                                          | [x] 3 `img` por rol y nombre en orden; `<h3>` con nombre exacto; nada bajo `h3`/`a`; región «Servicios»                                  |
| s7  | `:241-281`                                                                   | [x] anclas; alts en orden; 11 hitos estrictamente crecientes                                                                             |
| s8  | `:283-299`                                                                   | **[ ] parcial → B1**: «contenido completo» y «hermano inmediato» sí; «EXACTAMENTE UNA VEZ en el catálogo» no muerde                      |
| s9  | `:301-323`                                                                   | **[ ] parcial → B1**: literal byte a byte, dos «·» U+00B7 (verificado C2 B7), sin punto, no fundida sí; «EXACTAMENTE UNA VEZ» no muerde  |
| s10 | `:325-364` (4 `it`)                                                          | [x] 1 `<section>` + `aria-labelledby` a mano; ids = `['servicios-titulo']` en `<h2>` «Servicios»; 0/1/3; rótulos                         |
| s11 | `:366-413` (3 `it`)                                                          | [x] 3 enlaces exactos a `#reserva-titulo`; 6 filas (2 celdas, precio `^\d+ €$`) ×3 = 18; primera fila                                    |
| s12 | `:424-458` (3 `it`, `<template>` sobre el horneado)                          | [x] `demo-seccion`; `demo-card` en el elemento con 7 hijos; `demo-btn` + `demo-btn--solido`                                              |
| s13 | `:465-519` (4 `it`, NFD sin acentos)                                         | [x] «foto de»/«imagen de»; «nuestro/a», «del salón», «resultado»; 7 nombres; Depilación sin «cera»/«depil»                               |
| s14 | `catalogo-demo.test.ts:26-38` (×3)                                           | [x] `alt` exacto; `foto` string no vacía que contiene el fichero                                                                         |
| s15 | `catalogo-demo.test.ts:40-60`                                                | [x] `LEYENDA_FOTOS`, `LEYENDA_PRECIOS` exactas; claves en orden                                                                          |
| s16 | `catalogo-demo.test.ts:95-110` (2 `@ts-expect-error` + `it` de forma)        | [x] reproducido en la copia: `foto?` → TS2578 en (95,1); `alt?` → TS2578 en (98,1)                                                       |
| s17 | `catalogo-fuente.test.ts:17-40`                                              | [x] `estilos.foto` ×1 dentro de `<img … />`; sin `aria-hidden`, `.jpg` ni `assets/` (con ancla)                                          |
| s18 | `catalogo-fuente.test.ts:44-80`                                              | [x] exactamente 3 `import` `.jpg`, uno por fichero; sin `http(s)`/`//`                                                                   |
| s19 | `catalogo-fuente.test.ts:141-169` (×3 ×2)                                    | [x] SOF 800 × 1000 (los tres son SOF2); ningún APP1 `Exif` (leí sus cabeceras: solo APP0/DQT/SOF2/DHT/SOS)                               |
| s20 | `catalogo-estilos.test.ts:61-81` (×8)                                        | [x] las 8 declaraciones, con regex tolerante y propiedad completa (no casa `max-width`)                                                  |
| s21 | `catalogo-estilos.test.ts:83-131` (5 `it`)                                   | [x] un solo `.foto`; sin `min/max-height` y un único `height: auto`; sin `object-position`, `transition` ni `animation`; `.rejilla` F-08 |

@s22-@s26: `@verificacion-viva`, del lead. No se exigen en jsdom y no se juzgan aquí.

## Disciplina TDD

- **¿Producción sin test que la pida?** NO, con una salvedad de convención (N5).
  - Cada línea nueva la pidió un Rojo:
    - `alt` e `<img>`: @s1;
    - `foto`, los `import` y `src`: @s2;
    - `ANCHO_FOTO`, `ALTO_FOTO` y `lazy`: @s4;
    - retirar el `<div aria-hidden>`: @s5;
    - `LEYENDA_FOTOS` y el 2.º `<p>`: @s7;
    - `className={estilos.foto}` en la `<img>`: @s17;
    - las 4 declaraciones nuevas y retirar `min-height`: @s20/@s21 (reproducido).
  - No hay `*-logica.ts` ni ninguna función de más (CF-C6, Ley 1).
- **¿Evidencia de Rojo → Verde → Refactor?** SÍ.
  - Los escenarios que nacen verdes (@s3, @s6, @s8-@s16, @s18, @s19) son guardas. Todos llevan sabotajes con su mensaje
    y he reproducido una muestra, con los mismos resultados:
    - @s3: el horneado sin `http(s)`;
    - @s5: (f);
    - @s7/@s8: (m);
    - @s10: (u), (v);
    - @s11: (x);
    - @s12: (z1)-(z3);
    - @s14: (F);
    - @s17: (N);
    - @s18: (R);
    - @s19: (U), (V);
    - @s16: (K), (L).
- **El relevo en @s20/@s21: la evidencia es real, no reconstruida sin demostrar.** Tres pruebas independientes:
  1. `scratchpad/sabotajes.mjs` (14:33) define exactamente `0-HEAD` y los sabotajes de (a) a (h) de la bitácora.
     `scratchpad/catalogo.module.scss.orig` es la hoja en ese momento y difiere de la del commit SOLO en los dos
     comentarios que el REFACTOR reescribió después, tal como cuenta la bitácora.
  2. Reproduje en la copia `0-HEAD` (la hoja de `497e065`): **`Tests 7 failed | 6 passed (13)`**, los mismos 7 `it` y
     los mismos mensajes (`expected '\n  aspect-ratio: 4 / 5;\n  border-ra…' …`).
  3. Reproduje (a), (b), (c), (d), (e), (f), (g) y (h): los mismos recuentos y los mismos mensajes. Incluso sale el
     artefacto de truncado de loupe en (c), `…aspect-ratio\s*:\…/\s*5\s*;`, que nadie escribe a mano.
  - **Lo que NO se puede demostrar:** que el PRIMER `tdd_craftsman` viera el rojo ANTES de escribir la hoja. Lo que SÍ
    queda demostrado: cada declaración añadida y la retirada de `min-height` las exige un test que cae sin ellas. Es la
    garantía que importa: no hay SCSS de más.
  - `prettier --write` del relevo: comparé `scratchpad/catalogo.bak` y `fuente.bak` con lo commiteado. Quitando blancos
    y comas son IDÉNTICOS; no cambia ninguna aserción.

## Sabotajes del judge (copia; todos restaurados)

Son 36 en total: 15 sobre `Catalogo.tsx`, 3 sobre datos, 14 sobre la hoja (5 propios, más `0-HEAD` y de (a) a (h) del relevo), 2 sobre los JPEG y 2 sobre el tipo. Caen 34; los 2 verdes son B1. En la tabla, «×1» es un solo sabotaje y «×n», n distintos.

| Fichero saboteado      | Sabotajes                                                                                                                                            | Resultado                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `Catalogo.tsx`         | 6 mutantes de la tabla: `ID_SERVICIOS=''`, los 3 template literals vaciados y las dos flechas del `.map` → `undefined`                               | rojos (3, 1, 1, 1, 29, 3)            |
| `Catalogo.tsx`         | envoltorio `<div>` ×1; `<div className={estilos.foto}>` envolviendo ×1; `<img>` antes de la carta ×1; `<img>` dentro de la carta ×1                  | rojos                                |
| `Catalogo.tsx`         | sin `loading` ×1; `width`/`height` cruzados ×1; leyendas cruzadas ×1                                                                                 | rojos                                |
| `Catalogo.tsx`         | leyenda de fotos o de precios repetida como fragmento, ×2                                                                                            | **VERDES → B1**                      |
| `catalogo-demo.ts`     | fotos Facial/Depilación cruzadas ×1; `alt` con espacio final ×1; foto de Facial como cadena sin `import` ×1                                          | rojos                                |
| `catalogo.module.scss` | `@media` con `.foto{min-height}` ×1; `max-width` en vez de `width` ×1; `height` doble ×1; `object-fit: contain` ×1; `.foto` anidada en `.rejilla` ×1 | rojos                                |
| `catalogo.module.scss` | `0-HEAD` y los sabotajes de (a) a (h) del relevo, ×9                                                                                                 | rojos, idénticos a la bitácora       |
| JPEG                   | (U) sustituto de 800 × 600, (V) APP1 `Exif` insertado                                                                                                | rojos, idénticos                     |
| `CategoriaDemo`        | (K) `foto?`, (L) `alt?` + `tsc --noEmit`                                                                                                             | exit 2, TS2578 en 95 / 98, idénticos |

## Calidad

**Producción.** Limpia y mínima.

- `Catalogo.tsx:23-25`: `ANCHO_FOTO`/`ALTO_FOTO` con nombre y un comentario que dice POR QUÉ; no hay números mágicos.
- `Catalogo.tsx:57-64`: es el bloque de CF-C2 literal.
- `catalogo-demo.ts:1-3`: los tres `import` en datos (I-7, CF-3). `:91-93`: la JSDoc de `LEYENDA_FOTOS` cita su CF.
- `catalogo.module.scss:83-96`: el comentario del hueco dice la verdad nueva (la `<img>` ES el hueco, el degradado de
  fondo si falla la carga) y explica por qué sale `min-height`.

**Tests.** De buen oficio:

- helpers pequeños con nombre revelador (`bloqueDeCategoria`, `etiquetasImg`, `atributo`, `cartaDe`,
  `fragmentoHorneado`, `segmentosJpeg`, `patronDeDeclaracion`);
- ancla positiva en TODAS las negativas;
- un lector de cabecera JPEG que falla cerrado (lanza si no hay SOI, exige exactamente un SOF);
- en @s16, un comentario que explica las dos trampas de TypeScript (TS2353, TS6133) y un `it` que fija la forma de las
  dos categorías de prueba, para que la directiva no pueda satisfacerse con otro error. Es ejemplar.
- En @s13 hubo un ajuste honesto: se retiró el literal exacto como ancla porque tapaba la negativa.

### Notas (no bloquean; N1 conviene corregirla en la misma pasada que B1)

- **N1 — Comentario FALSO en la cabecera del test.**
  - `src/components/catalogo.test.tsx:14` dice «`css: false` deja las clases del módulo en `undefined`».
  - No es así: salen con nombre estable `_<clase>_<hash>`. La propia bitácora lo descubrió en (q), y mis sabotajes lo
    confirman (`<img class="_foto_173eaa" …>`, `<p class="_leyenda_173eaa">`).
  - La regla anti-`toHaveClass` sigue en pie por diseño (las clases del módulo no son comportamiento), no porque salgan
    `undefined`: el comentario debe decir eso.
  - La misma afirmación errónea vive en el contrato (`features/catalogo_fotos.feature:69-72` y `:274`, `project-spec.md:4015`)
    y en `contacto.test.tsx:117`, heredada. Para el lead: anotarlo como medida que contradice la spec (I-8), sin
    reabrir nada.
- **N2 — Aserción tautológica.** `catalogo.test.tsx:178` (`hijos[1].parentElement` es `contenedor`) no puede fallar:
  todo hijo de `contenedor.children` tiene a `contenedor` por padre. «Hija DIRECTA» ya lo prueban `:173` y `:177`.
  Sobra.
- **N3 — Caracteres invisibles en una regex.**
  - `catalogo.test.tsx:462`: `/[̀-ͯ]/g` lleva U+0300 y U+036F LITERALES (combinantes, invisibles en el editor; bytes
    `314 200`-`315 257`).
  - Funciona, pero no se puede leer ni revisar. Mejor `/[̀-ͯ]/g` o `/\p{Diacritic}/gu`, como
    `src/lib/placeholders.ts:58`.
- **N4 — Décima copia de `cuerpoDelBloque`.**
  - `catalogo-estilos.test.ts:17-41` repite el helper que ya está en 9 ficheros de test.
  - Es deuda PREVIA del repo y F-27 sigue el patrón que el contrato cita; no es de esta feature arreglarlo. Queda anotado
    para un refactor transversal de helpers de hoja.
- **N5 — `className={estilos.leyenda}` en el 2.º `<p>` (`Catalogo.tsx:70`): ningún test lo pide.**
  - Es convención del repo (todas las leyendas la llevan) y la bitácora lo declara (@s7). Lo acepto: las clases del
    módulo no se prueban en unidad por regla del contrato.
  - Efecto visual: `.leyenda` trae `margin: 2.5rem 0 0` (`catalogo.module.scss:99`), así que entre las dos leyendas
    quedan 40 px. Que el lead lo mire en la verificación en vivo; si las quiere juntas, es un escenario nuevo.
- **N6 — Comentario desfasado, PREVIO a F-27.**
  - `Catalogo.tsx:10` dice «Categorías REALES (Uñas · Pestañas · Cejas) … con leyenda», pero el componente pinta Uñas,
    Facial y Depilación y ahora lleva dos leyendas.
  - F-27 tocó el fichero y actualizó los comentarios de la hoja, pero no este. No bloquea (A-2 sigue abierta y
    `catalogo-demo.ts:9-12` lo advierte con 🔴). Conviene reescribirlo cuando se cierre A-2.
- **N7 — EXIF en `src/assets/trabajos/`, fuera de alcance.** El hallazgo del TDD en @s19 (los 13 JPEG de
  equipo/galería llevan APP1 `Exif`) lo confirma el sabotaje (U): `equipo-pedicura.jpg` cae por EXIF. Si esos
  metadatos publican autor, cámara o ubicación, es una tarea aparte para el lead (misma razón que CF-C4).
- **N8 — `bin/harness init` no lo re-ejecuté**, por orden expresa del lead (Stryker y Chrome en curso). La puerta se da
  por la evidencia del cierre del TDD (55/1760, `tsc`, `eslint` y Prettier limpios en `scratchpad/snapshot_verde.log` y
  `formato.log`). Mis 66/66 acotados son coherentes con ella.
  - **Tras B1 el lead debe correr `bin/harness init` una vez antes de `done`.**

## Checkpoints

- **C1:** [x].
  - Existen los ficheros base y los docs.
  - `bin/harness init` en verde según la evidencia del lead (N8); no lo re-ejecuté.
- **C2:** [x].
  - Una sola feature `in_progress` (27).
  - `progress/current.md` describe la sesión activa.
- **C3:** [x].
  - `src/` respeta la separación datos (`lib/demo`) / vista (`components`).
  - Sin dependencias nuevas: `package.json` y el lockfile no cambian.
  - Sin `console.*`, `TODO`, `debugger`, `.only` ni `.skip` en el diff.
- **C4:** [x].
  - `Catalogo.tsx` tiene por fin tests.
  - Guardas sobre bytes reales del disco, sin mocks de `fs`.
  - Suite > 0 y verde.
- **C5:** [ ] a medias.
  - Árbol limpio y estado correcto (`in_progress`).
  - `progress/history.md` no tiene entrada de F-25 ni de esta sesión (su última es de 2026-07-23). Es deuda del cierre
    de sesión, no de F-27.
- **C6:** [ ] mientras no se resuelva B1.
  - `.feature` y sección de spec presentes y `@s` tagueados.
  - El mapa @s → test está en la bitácora.
  - Sin producción de más.
  - PERO @s8 y @s9 tienen una cláusula sin morder.
- **C7:** [ ] pendiente, en manos del `mutation_tester`.
  - Mi medición manual: los 6 mutantes esperados mueren.

## Cambios requeridos

1. **B1** (`tdd_craftsman`, SOLO `src/components/catalogo.test.tsx`): en @s8 (`:283-299`) y en @s9 (`:301-323`),
   aseverar que el literal escrito a mano aparece EXACTAMENTE una vez en el texto del catálogo (o en el horneado).
   - Hay que demostrar que se ponen rojos con los dos sabotajes de B1 (`Nota: {LEYENDA_FOTOS}` y
     `Nota: {LEYENDA_PRECIOS}` en un `<p>` extra tras el de fotos), dejarlo anotado en la bitácora y NO tocar
     producción.
2. **En la misma pasada (recomendado): N1** (corregir el comentario de `:14`), **N2** (quitar `:178`) y **N3** (escapar
   la regex de `:462`).
3. Después, **re-judge acotado** del delta y `bin/harness init` una vez (lead).

## Re-judge del delta (34bc89a)

**Veredicto:** APPROVED — B1 resuelto, N1-N3 corregidos y H-1 con su test. Nada fuera de alcance.

- **Qué revisé:** `git diff 81a17c6 34bc89a -- src` (3 ficheros: `catalogo.test.tsx`, `catalogo-estilos.test.ts`,
  `catalogo.module.scss`). Árbol limpio antes y después (`git status --short` vacío).
- **Qué ejecuté:** solo `pnpm vitest run src/components/catalogo.test.tsx src/components/catalogo-estilos.test.ts` →
  **50/50 verdes** (36 + 14). Sin suite completa, sin build, sin Stryker (orden del lead).

### (1) B1 — resuelto

- `catalogo.test.tsx:283-290`: el helper `apariciones(texto, literal)` cuenta APARICIONES
  (`split(literal).length - 1`), no elementos. Tiene un JSDoc que explica por qué `getAllByText` no basta.
- @s8 (`:297-300`) y @s9 (`:319-322`) aseveran `apariciones(container.textContent, *_A_MANO) === 1`, con mensaje.
  Los literales siguen escritos a mano (`:27`, `:30`) y no se importa `LEYENDA_*`. Se mantienen las aserciones previas
  («contenido completo de un `<p>`», «hermano inmediato»).
- **Sabotajes, reproducidos en el árbol real y restaurados con `git checkout --`:**

  | Sabotaje en `Catalogo.tsx`, tras el `<p>` de fotos           | Antes (5482984) | Ahora (34bc89a)                               |
  | ------------------------------------------------------------ | --------------- | --------------------------------------------- |
  | `<p className={estilos.leyenda}>Nota: {LEYENDA_FOTOS}</p>`   | VERDE           | **ROJO**: @s8, `expected 2 to be 1` (1 de 36) |
  | `<p className={estilos.leyenda}>Nota: {LEYENDA_PRECIOS}</p>` | VERDE           | **ROJO**: @s9, `expected 2 to be 1` (1 de 36) |

- Impacto en la mutación: ninguno sobre `Catalogo.tsx`. El delta solo AÑADE aserciones y quita una tautológica (N2),
  así que ningún mutante que moría puede sobrevivir.

### (2) N1-N3 — corregidos

- **N1:** `catalogo.test.tsx:14-15` ya dice la verdad: las clases del módulo salen `_<clase>_<hash>` y no se aseveran
  porque una clase no es comportamiento. La discrepancia en el contrato (`.feature`, spec, `contacto.test.tsx`) sigue
  siendo nota para el lead (I-8), fuera de este delta.
- **N2:** retirada la aserción tautológica `hijos[1].parentElement` (antigua `:178`). «Hija directa» sigue cubierta
  por `toHaveLength(2)` y `hijos[1].tagName === 'IMG'`.
- **N3:** `normalizado` (`:477-482`) usa `/\p{Diacritic}/gu`, legible y con el mismo patrón que
  `src/lib/placeholders.ts`. Sin caracteres invisibles.

### (3) H-1 — `box-sizing: border-box` en `.foto`

- `catalogo.module.scss:87-90`: la declaración va dentro de `.foto`, con un comentario que explica el POR QUÉ (2 px
  de desborde por el borde).
- `catalogo-estilos.test.ts:83-92`: el test lee los bytes del bloque `.foto` con `patronDeDeclaracion`.
- **Sabotaje:** quitar la línea `box-sizing: border-box;` → **ROJO** (1 de 14, el `it` de H-1). Restaurado.
- Trazado a @s5/@s23 (CF-2) y a la bitácora (`progress/tdd_catalogo_fotos.md:488-`). No hay producción sin test que la
  pida.

### (4) Alcance

- En `src/` solo cambian los 3 ficheros citados. `Catalogo.tsx` y `catalogo-demo.ts` no se tocan.
- Sin `.only`, `.skip`, `console.*` ni `toHaveClass` en el delta.

### Checkpoints tras el delta

- **C6:** [x]. Todos los `@s` (@s1-@s21) están cubiertos y @s8/@s9 muerden «EXACTAMENTE UNA VEZ».
- **C1:** [x] condicionado. Sigue pendiente que el lead corra `bin/harness init` una vez antes de `done` (N8). Aquí no
  lo ejecuté, por orden del lead.
- **C7:** [ ] en manos del `mutation_tester`. Tiene que anotar que midió contra los tests de `34bc89a`.
