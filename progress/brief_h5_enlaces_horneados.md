# Brief del lead — H-5: el `pnpm build` falla cerrado ante un `<link href>` horneado sin la base o sin fichero

> Lo escribe el `craftsman_lead` (2026-10-01). Lo leen el `spec_partner` (→ `project-spec.md`) y el
> `gherkin_author` (→ la ENMIENDA del `.feature` dueño). Medidas propias, sobre `main` en `2a49c14`.

## 1. El hallazgo (origen)

- H-5 de `progress/tdd_favicon_marca.md` §6 (ronda 2) y menor 8 de `progress/judge_favicon_marca.md`;
  registrado como «deuda de F-05» en el `cierre` de F-28 en `feature_list.json`.
- Si falta en `public/` un fichero que `index.html` enlaza como icono, `vite-react-ssg build` hornea el
  `href` SIN la base y sale con 0. Ninguna de las cinco puertas de `pnpm build` lo ve. En GitHub Pages DE
  PROYECTO ese `href` pide la raíz del origen: el 404 del H-2 que curó F-28. Hoy solo lo caza la suite
  (`src/pages/favicon-marca.test.ts` @s2-@s7 y `src/pages/home-horneado.test.ts` @s8): una publicación que
  se saltara la suite lo embarcaría.

## 2. Medidas del lead [V] (2026-10-01, Node 22, Windows; build en un temporal con `NLS_DIST_DIR`)

| Caso                                                                | `pnpm build`        | `href` horneado                                           | Fichero en el artefacto | Puertas          |
| ------------------------------------------------------------------- | ------------------- | --------------------------------------------------------- | ----------------------- | ---------------- |
| Árbol de `main` (control)                                           | 0                   | `/NailsLashStudioWeb/favicon.svg`                         | sí, 2244 B              | 5 ✓              |
| `public/favicon.svg` BORRADO                                        | **0**               | **`/favicon.svg`** (sin base)                             | **no existe**           | **5 ✓** (el H-5) |
| `public/favicon.svg` a **0 bytes**                                  | **0**               | `/NailsLashStudioWeb/favicon.svg` (con base)              | **sí, 0 B**             | **5 ✓**          |
| `index.html` con la base escrita a mano + sin fichero (H-6 de F-28) | 0 (medido por F-28) | `/NailsLashStudioWeb/favicon.svg` (Vite lo deja tal cual) | no existe               | 5 ✓              |

> **Errata (ronda 2 de revisión de la spec, 2026-10-01).** La última fila NO la midió F-28: su H-6 (sabotaje
> `2a-base-svg`) solo cambió el `href` de `index.html` y dejó el fichero en `public/`
> (`progress/tdd_favicon_marca.md:129` y :308-310). La midió la ronda 1 de revisión: el árbol de HEAD con ese `href` y
> sin `public/favicon.svg` sale con 0 en `vite-react-ssg build` y en las cinco puertas. La tabla se deja como estaba
> (es histórica); la procedencia está en `project-spec.md`, Enmienda 5 de F-04, «Las tres firmas del H-5».

Conclusión: hay TRES firmas distintas del mismo 404, y la puerta tiene que ver las tres: (a) `href` sin la
base; (b) con la base, pero sin fichero; (c) con la base y fichero, pero vacío.

Inventario de referencias root-absolutas en el HTML real de `dist/index.html` (única página prerenderizada):
`<link>` = 3 iconos (`icon` ×2, `apple-touch-icon`), 1 `stylesheet` y 6 `preload` de fuentes, todos con la
base; la `canonical` es absoluta (`https://example.invalid/`), no root-absoluta. Fuera de `<link>`: 1
`<script src>`, 17 `<img src>` (assets con hash, con la base) y un `<a href="/NailsLashStudioWeb/">` (la
marca, ya vigilado por la anti-404 de F-04). La fuente de los `<link>` de icono es `index.html` (literal,
reescrito por Vite solo si el fichero existe en `public/`); la del resto, Vite (siempre con la base).

## 3. Restricciones del encargo (del humano, 2026-10-01)

- Las puertas leen el artefacto vía `tools/artefacto.ts` (honra `NLS_DIST_DIR`, PR #17).
- Conservar el comportamiento y los mensajes de las puertas existentes.
- Decidir CON EL HUMANO qué contrato es el dueño: F-05 (`cero_terceros`) o F-04 (`cascaron_semantico`).
- Hecho = ENMIENDA aprobada en el `.feature`, TDD con rojo demostrado (p. ej. borrar
  `public/favicon.svg` → el build falla), mutación al 100 % de todo fichero de `src/lib/` tocado, `judge`
  APPROVED, `node .harness/harness.mjs init` en verde, PR a `main` sin fusionar.

## 4. Lo que dicen hoy los contratos [V, exploración 2026-10-01]

- **F-05** (`cero_terceros`): resuelve toda URL contra el sentinela `propio.invalid` y solo mira el HOST;
  `/favicon.ico` y `/NailsLashStudioWeb/favicon.ico` son «propias» por igual (@s18, `src/lib/terceros.ts`).
  No tiene noción del prefijo de la base salvo validar el VALOR de `base` en la config (ENMIENDA 1, @s27).
  Su puerto lee solo `(html|css)` por decisión A-27 (binarios → U+FFFD). `apple-touch-icon` NO es keyword
  de petición. Y F-28 ya decidió en FS-6 (`project-spec.md` §Feature 28) que «F-05 no se enmienda».
- **F-04** (`cascaron_semantico`): dueño de la anti-404 (A-17, `REGLA_ENLACE_ROTO = 'href interno sin
fichero en dist/'`, @s23/@s24) y de la resolución bajo `base` (ENMIENDA 1, @s36-@s38). Pero su extractor
  solo lee `<a href>` (`extraerEnlaces`), su puerto `ArtefactoDeProduccion` solo lista HTML, y @s37 declara
  FUERA DE ÁMBITO un `<a href>` sin el prefijo de la base («la raíz del origen puede alojar un sitio
  DISTINTO… tratarlo como roto sería un FALSO POSITIVO sobre un sitio ajeno»). Ya parsea `<link>` (regex
  `ENLACE`) pero solo para la canónica. Último tag: **@s45**; la siguiente es la **ENMIENDA 5**, desde
  **@s46**, con su banner arriba y sus escenarios al final («@s1-@s45 NO SE TOCAN»).
- `ArtefactoDeProduccion` lo comparten `tools/puerta-cascaron.ts`, `tools/puerta-anclas.ts`,
  `src/lib/puerta-anclas.ts` y los dobles de sus tests: un método obligatorio nuevo ahí obliga a tocar F-06.
- Ningún fixture actual de la puerta del cascarón trae un `<link>` root-absoluto (el `htmlCrudo` compartido
  solo trae la canónica absoluta).

## 5. Lo que el lead recomienda llevar a la puerta (el `spec_partner` lo debate y lo afina)

- **D1 · Dueño: F-04, ENMIENDA 5.** El invariante de H-5 es «una referencia interna horneada no apunta a la
  nada bajo la base de despliegue»: es la anti-404 (A-17) más la resolución bajo `base` de la ENMIENDA 1,
  ambas de F-04 (una sola razón para cambiar). F-05 es privacidad: un 404 en el propio origen no le da la
  IP a ningún tercero, y fallar la puerta de terceros por él daría un motivo falso; además FS-6 ya dijo
  «F-05 no se enmienda». Alternativas a debatir: F-05, o una feature nueva F-29 con una sexta puerta.
- **D2 · Alcance: todo `<link>` de todo HTML del artefacto cuyo `href` sea root-absoluto (`/`, no `//`),
  sea cual sea su `rel`** (el «idealmente» del encargo). Fuera, como huecos DECLARADOS: `href` relativos,
  URL absolutas (las de terceros son de F-05), `<script src>`, `<img src|srcset>`, `<source>`, `url()` del
  CSS, `fetch` del JS y el elemento `<base href>`. Alternativas: solo iconos (`rel` con el token `icon` o
  `apple-touch-icon`), o todos los subrecursos.
- **D3 · Tres violaciones**, una por firma medida (§2): sin la base; con la base pero sin fichero; con fichero
  de 0 bytes. Sin `base` declarada, la primera no aplica y la ruta entera se resuelve igual.
- **D4 · Resolución exacta y sensible a la caja contra la LISTA de ficheros del artefacto**, nunca un
  `existsSync`: en Windows el sistema de ficheros no distingue la caja y escondería un 404 que GitHub Pages
  (Linux) sí da. Sin `?query` ni `#fragmento`. Por decidir: un `href` acabado en `/` (¿`index.html`, como
  sirve Pages?) y el `%`-encoding (¿se decodifica o falla cerrado?).
- **D5 · La asimetría con @s37 se justifica por escrito y @s37 no cambia**: un `<a>` a la raíz del origen
  puede ser un hiperenlace legítimo a otro sitio; un `<link>` horneado sin la base, en este stack, es la
  firma del H-5 (Vite suelta la base cuando el fichero falta). Lo que de verdad apunte fuera se escribe
  como URL absoluta.
- **D6 · Puerto nuevo, OBLIGATORIO**: listar TODOS los ficheros del artefacto con su tamaño en bytes, sin
  leer su contenido (A-27). No en `ArtefactoDeProduccion` (tocaría F-06). Opcional sería verde por vacuidad.
- **D7 · Guarda anti-vacuidad del extractor nuevo** (patrón `verde-por-vacuidad-en-puerta-de-verificacion`):
  0 `<link href>` root-absolutos en todo el artefacto → falla cerrada con su motivo. Choca con los fixtures
  de @s1-@s45 (ninguno trae uno): hay que decidir cómo sin reescribir ni un escenario antiguo.
- **D8 · Mensajes**: ninguna línea ni el `✓` existentes cambian; las reglas nuevas usan el formato de línea
  que ya tiene la puerta (`<ruta> — <regla>: "<valor>"`).
- **D9 · Prueba de extremo a extremo**: un test build-based (estilo `src/pages/home-horneado.test.ts`,
  `correrPuerta` con `NLS_DIST_DIR`) sobre una COPIA saboteada del artefacto temporal (sin el fichero y con
  el `href` sin base, como lo deja Vite; fichero a 0 bytes) → `tools/puerta-cascaron.ts` sale ≠ 0 con su
  línea; y su control sobre el artefacto real → 0. Más la demostración manual del lead: borrar
  `public/favicon.svg` → `pnpm build` ≠ 0.
- **D10 · Mutación**: `src/lib/puerta-cascaron.ts` (ya en `mutate`) al 100 %, 0 exclusiones; si la lógica
  nueva vive en un módulo nuevo de `src/lib/`, entra en `mutate`.

## 6. Preguntas para la puerta humana (una sola interrupción; recomendación primero)

1. **Dueño** — F-04 ENMIENDA 5 (recomendada, D1) · F-05 · feature nueva F-29 con una sexta puerta.
2. **Alcance** — todo `<link>` con `href` root-absoluto, sea cual sea su `rel` (recomendada, D2) · solo
   iconos (`icon` y `apple-touch-icon`) · todos los subrecursos (`<script src>`, `<img src|srcset>`,
   `<source>`, `url()` del CSS).
3. **`href` acabado en `/`** — se resuelve a `<carpeta>/index.html`, como sirve GitHub Pages (recomendada:
   evita un falso positivo si algún día hay una canónica root-absoluta) · violación (falla cerrada).
4. **`%`-encoding** — no se decodifica y falla cerrado (recomendada: hoy no hay ningún caso; un falso
   positivo ruidoso es mejor que un falso negativo) · se decodifica antes de comparar.
5. **Guarda anti-vacuidad (D7)** — la decide el `spec_partner` leyendo `src/lib/puerta-cascaron.test.ts`;
   recomendación de partida: el fixture compartido de los tests hornea un `<link rel="stylesheet">` con su
   fichero (cambio de ayudante, declarado en el banner, sin tocar el texto de @s1-@s45).

## 7. Notas para quien continúe

- Exploración [V] de esta sesión: `ArtefactoDeProduccion` lo implementan también `tools/puerta-anclas.ts`,
  `src/lib/puerta-anclas.ts` (líneas ~166, 197, 204) y los dobles de `src/lib/puerta-anclas.test.ts`; en
  `src/lib/puerta-cascaron.test.ts` solo hay dos `<link>` root-absolutos (líneas ~1116 y ~1706) y ambos van
  a `canonicaDeLaPagina`, no a la puerta: no colisionan.
- Para la prueba de extremo a extremo (D9) ya existe `correrPuerta(puerta, directorio)` en
  `src/pages/home-horneado.test.ts` (~línea 497), que corre `tools/puerta-<x>.ts` con `NLS_DIST_DIR`.
- Reproducción manual de H-5 (sin ensuciar el árbol): copiar `public/favicon.svg` fuera, borrarlo,
  `NLS_DIST_DIR=<temporal> pnpm build`, restaurarlo y comprobar `git status` limpio.

## 8. Decisiones del humano (puerta de diseño, Pablo, AskUserQuestion, 2026-10-01 ~11:50)

Tomadas sobre las recomendaciones FINALES de `progress/verificacion_decisiones_h5.md` (que corrige este brief
en 19 puntos y prevalece sobre §2-§6 donde difieran):

1. **Dueño: F-04 `cascaron_semantico`, ENMIENDA 5** desde @s46. El puerto que lista los ficheros entra como
   campo OPCIONAL de `PeticionPuertaCascaron` que falla cerrado si falta y hay algún `<link>` que comprobar
   (precedente `base?`); no se toca F-06. FS-6 NO es argumento (era una decisión acotada a F-28); el texto
   «deuda de F-05» del cierre de F-28 se reetiqueta como deuda de F-04 al cerrar.
2. **Alcance: todo `<link>` con `href` root-absoluto**, sea cual sea su `rel`, en todo HTML del artefacto, con
   «root-absoluto» definido tras recortar espacios ASCII de los extremos y quitar tabuladores y saltos de línea
   (WHATWG); `/\` falla cerrado. La violación «sin la base» dice solo eso, nunca «no existe».
3. **Casos límite: ESTRICTO.** Solo la raíz del artefacto (`href` igual a la base declarada, o `/` sin base) se
   resuelve a `index.html`; cualquier otro `href` acabado en `/` o que apunte a una carpeta falla cerrado; un
   `href` con `%` o `&` falla cerrado con su PROPIA regla (falso positivo consciente: GitHub Pages sí decodifica
   los `%XX`, medido).
4. **Al terminar** (judge APPROVED, mutación al 100 %, CI verde): el lead fusiona la PR en `main` (squash),
   aprueba el despliegue de `github-pages` y repite la comprobación en la web publicada.

La guarda anti-vacuidad (pregunta 5) la resuelve el `spec_partner` con la alternativa VERIFICADA (guarda sobre
el extractor que cuenta todo `<link>` con `href`, canónica incluida, en `inspeccionarArtefacto` tras la de
@s28; ningún fixture ni escenario de @s1-@s45 cambia). La puerta humana sobre el `.feature` sigue pendiente.
