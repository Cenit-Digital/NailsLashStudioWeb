# F-06 `header_nav_footer` — diario de TDD (Rojo-Verde-Refactor)

> El `tdd_craftsman` implementó los 20 escenarios de `features/header_nav_footer.feature` por TDD
> estricto. Puerta humana ABIERTA (contrato aprobado 2026-07-17; `feature_list.json` §6 `in_progress`
> + `puerta_humana`) — verificadas las dos condiciones antes de tocar `src/`.
> **NO marco `done`: esperan el `judge` y el `mutation_tester`.**

## Resultado

- **20/20 escenarios cubiertos** (@s18 es meta-mutación: lo mide el `mutation_tester`; sus 6 filas de
  sabotaje quedan mapeadas abajo a tests concretos).
- **617 tests** verdes (576 base + **41** de F-06), 16 ficheros.
- `pnpm typecheck` **0 errores** · `pnpm lint` **0 warnings** (añadido `.experimentos-tmp` a los
  `ignores` de ESLint: scratch gitignored que genera `trampas-del-horneado.test`).
- `pnpm build` **exit 0 con las CINCO puertas** (las 4 de F-01/F-03/F-04/F-05 + la de anclas nueva).
- **«Verde ≠ funciona»**: verificado sobre el HTML CRUDO de `dist/index.html` (readFileSync + string,
  jamás jsdom): nav horneada con `aria-label="Principal"`, menú horneado «cerrado»
  (`aria-expanded="false"`), cabecera con la marca, pie con Facebook + `tel:` (NO Instagram-URL, NO
  enlaces legales), enlaces `#servicios-titulo`/`#contacto-titulo` presentes, 0 restos de radix.
- **Sabotaje sobre el BUILD REAL**: nav con `#facial` (el bug concreto) → las 4 puertas pasan en
  verde y **solo la de anclas rompe el build** (exit 1, `ancla "#facial" → id "facial"`). Es
  exactamente el hueco que la anti-404 excluye por diseño (@s4).

## Arquitectura (patrón anti-404 de F-04, replicado)

- `src/lib/puerta-anclas.ts` — decisor PURO + ejecutor. Recibe los BYTES de `dist/`, NO lee ficheros
  ni el reloj. Reutiliza `idsDeHeadings` de F-04 (núcleo de `REGLA_SECTION`) para «sección navegable»,
  y las interfaces del puerto (`ArtefactoDeProduccion`/`FicheroHtml`/`rutaDelFichero`).
- `tools/puerta-anclas.ts` — el HUMILDE: cablea `node:fs`/`process`/`exit`. En `pnpm build` DESPUÉS
  de las otras cuatro puertas; `dev`/`dev:ssr` NO lo invocan.
- `src/components/{Cabecera,MenuNavegacion,Pie}.tsx` + `cabecera.module.scss` (breakpoint `820px`).
- `src/styles/_base.scss` — `scroll-padding-top: 6rem` (re-medido, sustituye el `5rem` de F-04).
- `src/pages/home.tsx` — usa `<Cabecera />` y `<Pie />` (sustituyen la nav y el pie inline).
- **Las DOS listas**: los `.tsx` se añadieron a `mutate` de `stryker.config.json` **Y** a
  `coverage.include` de `vitest.config.ts`. `puerta-anclas.ts` a `mutate`.
- **B-6**: `radix-ui` fuera de `dependencies` (0 usos en `src/` [V]); lockfile actualizado; 0 imports.

## Diario de ciclos (Rojo → Verde → Refactor)

| # | @s | ROJO (test que falla) | VERDE (mínimo) |
| - | -- | --------------------- | -------------- |
| 1 | @s1 | módulo ausente → import falla | `anclasDeNav` real + predicado provisional «toda ancla es muerta» (fake it) |
| 2 | @s2 | el fake marca anclas vivas como muertas | `idsDeLaPagina` + predicado real `!idsPagina.has(id)` |
| 3 | @s3 | no existe `REGLA_INALCANZABLE` ni lazo | `seccionesNavegables` (reusa `idsDeHeadings`) + lazo de inalcanzables. Los headings sueltos de @s1 ya EXIGÍAN la regla real (un cheat «cualquier heading» rompía @s1) |
| 4 | @s20 | (verde de arranque: guard) — **verificado por SABOTAJE**: «navegable = cualquier id» mata 5 tests | — (regla real ya puesta en ciclo 3) |
| 5 | @s5 | no existe `describir` | `describir` (acusa, no gruñe) + `if` independientes (ya puestos) → determinismo |
| 6 | @s9 | no existe `ejecutarPuertaDeAnclas` | ejecutor mínimo: leer páginas → `inspeccionarAnclas` → exit 0/1 |
| 7 | @s6 | 0 páginas devolvía exit 0 | guarda `existe()` + guarda de 0 páginas (falla cerrada) |
| 8 | @s7 | 0 anclas devolvía exit 0 | guarda de vacuidad del 1.er extractor (`.some`, anti-equivalente) |
| 9 | @s19 | 0 secciones devolvía exit 0 | guarda gemela del 2.º extractor (el BLOQUEANTE de la revisión) |
| 10 | @s8 | `listarHtml` lanza → excepción sin capturar | try/catch en `ejecutarPuertaDeAnclas` (falla cerrada, con la causa) |
| 11 | @s10 | `package.json` no encadena la puerta | humilde `tools/puerta-anclas.ts` + `build` la invoca tras las otras 4 |
| 12 | @s12 | componentes ausentes | `Cabecera`+`MenuNavegacion`(nav aria-label)+`Pie` + `cabecera.module.scss` |
| 13 | @s16 | sin botón ni enlaces horneados | botón `aria-expanded={false}` (literal) + enlaces inline |
| 14 | @s15 | `aria-expanded` no cambia al pulsar | `useState(false)` + `aria-expanded={abierto}` + toggle en `onClick` |
| 15 | @s17 | sin `@media` en el SCSS | bloque `@media (max-width: 820px)`: botón vs nav horizontal, apertura por `aria-expanded` (CSS puro) |
| 16 | @s11 | `_base.scss` seguía en `5rem` | `scroll-padding-top: 6rem` (96px ≥ 76px re-medidos) |
| 17 | (pie) | pie sin Facebook/tel | pie deriva Facebook (REDES) + `tel:` de F-02 (instrucción del lead; @s13/@s14 realizados) |

### Sobre la Ley 3
No se rompió. Triangulación con «fake it» en @s1→@s2 (predicado provisional → real). En @s3→@s20 los
fixtures de @s1 (headings sueltos) YA forzaban la regla real de «sección navegable», así que la
implementación mínima que pasa @s1+@s2+@s3 ES la regla real; @s20 quedó como guarda y se **verificó
por sabotaje** que muerde el mutante «navegable = cualquier id» (mató 5 tests). Los guards del
ejecutor se añadieron uno a uno, cada uno con su escenario rojo.

## Trazabilidad `@s → test`

- **@s1** (ancla muerta declara ancla+id) → `puerta-anclas.test.ts` › `@s1 la nav enlaza %s y la
  página no tiene ese id …` (it.each: `#facial`, `#colores`, `#servicios`, `#contacto`)
- **@s2** (nav válida → 0) → `@s2 nav a #servicios-titulo y #contacto-titulo con ambos ids presentes …`
- **@s3** (inalcanzable) → `@s3 la sección navegable "%s" sin enlace en la nav …` (it.each: `faq`,
  `contacto-titulo`)
- **@s4** (distinta de la anti-404) → `@s4 la puerta de anclas acusa "#facial" … NO "/servicios"` +
  `@s4 la anti-404 de F-04 acusa "/servicios" … NO "#facial"` + `@s4 el build … distinto de 0`
- **@s5** (acusa/determinista) → `@s5 … exactamente 3 violaciones` + `@s5 … nombra su ruta, su ancla
  o id, y qué falta` + `@s5 … dos veces … listas idénticas y en el mismo orden`
- **@s6** (falla cerrada por vacuidad) → `@s6 el directorio dist/ no existe …` + `@s6 dist/ existe
  pero no contiene ningún fichero HTML …`
- **@s7** (vacuidad 1.er extractor) → `@s7 el extractor deriva 0 anclas de nav …`
- **@s8** (falla cerrada si revienta) → `@s8 si listarHtml lanza … con la causa`
- **@s9** (camino feliz build) → `@s9 una home consistente → codigoSalida 0 y ninguna violación`
- **@s10** (dev no invoca) → `@s10 el script "build" invoca … DESPUÉS …` + `@s10 el script "%s" NO
  invoca …` (dev, dev:ssr)
- **@s11** (scroll-padding re-medido) → `scroll-padding-cabecera.test.ts` › `@s11 existe una
  declaración …` + `@s11 su valor resuelto a px es >= la altura máxima medida` + `@s11 NO es el 5rem …`
- **@s12** (cabecera/nav/pie horneados) → `cabecera.test.tsx` › `@s12 la nav es un landmark … "Principal"`
  + `@s12 la cabecera contiene la marca …` + `@s12 el pie es un landmark de footer`
- **@s13** (pie sin enlaces legales) → `puerta-anclas.test.ts` › `@s13 la anti-404 de F-04 emite
  violación por "/aviso-legal" …` + `@s13 la puerta de anclas NO acusa "/aviso-legal" …`; y en
  `cabecera.test.tsx` › `el pie NO hornea ningún enlace legal …`
- **@s14** (Facebook pasa las 3 puertas) → `@s14 la puerta de terceros (F-05) NO lo acusa …` + `@s14
  la anti-404 de F-04 NO lo acusa …` + `@s14 la puerta de anclas NO lo acusa …`; y `el pie hornea el
  enlace a Facebook … y el tel: …` / `… NO hornea una URL de Instagram …`
- **@s15** (estado en aria-expanded) → `cabecera.test.tsx` › `@s15 aria-expanded pasa de "false" …
  a "true" … y vuelve …`
- **@s16** (menú horneado cerrado) → `@s16 el botón del menú declara aria-expanded="false"` + `@s16
  los enlaces de la navegación están en el HTML horneado …`
- **@s17** (breakpoint 820px) → `@s17 la media query del menú móvil usa exactamente "max-width:
  820px" …`
- **@s18** (mutantes que mueren) → lo mide el `mutation_tester` sobre `puerta-anclas.ts` +
  `{Cabecera,MenuNavegacion,Pie}.tsx`. Mapa de sus filas a los tests que las matan:
  - «negar predicado id-presente» → @s1 y @s2
  - «invertir la igualdad de conjuntos» → @s3
  - «navegable = cualquier id» → @s20 (verificado por sabotaje: mata 5 tests)
  - «vaciar el extractor de ANCLAS» → @s7 (y @s1/@s9)
  - «vaciar el extractor de SECCIONES» → @s19 (y @s3/@s9)
  - «alterar el literal 820px» → @s17
- **@s19** (vacuidad 2.º extractor) → `@s19 hay anclas vivas pero 0 secciones navegables …`
- **@s20** (heading sin sección ≠ navegable) → `@s20 <h2 id="promociones-titulo"> suelto … 0
  violaciones de inalcanzable para ese id`

## Para el `mutation_tester`

- Ficheros nuevos en `mutate`: `src/lib/puerta-anclas.ts`, `src/components/Cabecera.tsx`,
  `src/components/MenuNavegacion.tsx`, `src/components/Pie.tsx`.
- El SCSS NO es mutable (Stryker no ve CSS): @s11 y @s17 son la red HUMANA (leen el fichero).
- Los atributos JSX literales (`aria-label="Principal"`, textos) NO los muta Stryker (E1.d, medido):
  los aseveran los tests de `cabecera.test.tsx`, no la mutación.
- Umbral 1.0, 0 exclusiones. Si un mutante resiste: **escalar al humano**, NO excluir, NO bajar el
  umbral (A-23). Si aparece un superviviente de extracción por un `^`/`$` de regex, se añade su
  escenario CON SU FILA (contrato de menos, no código de más), como en F-05.
