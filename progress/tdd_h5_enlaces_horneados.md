# TDD — F-04 `cascaron_semantico`, ENMIENDA 5 (H-5), FASE A: la puerta PURA — 2026-10-01

> Autor: `tdd_craftsman`. Worktree `.claude/worktrees/amazing-montalcini-d6abb1`, rama
> `claude/amazing-montalcini-d6abb1`, desde `df01310`. Contrato APROBADO por el humano
> (`features/cascaron_semantico.feature`, banner ENMIENDA 5; puerta humana en `57f39ab`): escenarios de
> puerta pura @s46-@s60, @s65, @s66, @s68 y @s69. Spec: `project-spec.md` §Feature 4 → «Enmienda 5
> (2026-10-01)». Mapa: `progress/gherkin_h5_enlaces_horneados.md` (forma E del cableado, §2 y §10-§11).
> Decisiones de Pablo: `progress/brief_h5_enlaces_horneados.md` §8-§9.
>
> Alcance de la FASE A: SOLO `src/lib/puerta-cascaron.ts` y `src/lib/puerta-cascaron.test.ts`. NO se
> tocan `tools/` ni `src/pages/` (FASE B: el humilde y el extremo a extremo @s61, @s62, @s67, @s70-@s72),
> ni `ArtefactoDeProduccion`, ni `inspeccionarSitio`, ni ningún ayudante, fixture o llamada de @s1-@s45.
> `feature_list.json` no se toca (F-04 sigue `done`, como en las ENMIENDAS 1-4).
>
> Entorno: Node 22.15.0, Windows. Ficheros modificados SOLO con Bash y scripts Node
> (`scratchpad/h5/tdd-a/aplicar.mjs` + un parche por paso; la barra invertida se genera con
> `String.fromCharCode(92)`). Durante el ciclo solo se corre `pnpm exec vitest run
> src/lib/puerta-cascaron.test.ts` (y `pnpm typecheck`). Línea base del fichero: 211 tests en verde.

## Ciclos Rojo → Verde → Refactor

### C1 · @s46 (CONTROL: un `<link>` de cada clase, todos resuelven; la lista se pidió)

- Test: `@s46 un <link> de cada clase del artefacto real…` (ANCLA de 6 valores en orden, «la lista se
  pidió ≥ 1 vez», exit 0, 0 líneas). Ayudantes NUEVOS: `listaDeReferencia`, `dobleDeLaLista`,
  `conElementos` (inserta antes de `</head>` o `</body>`), `puertaSobreLaHome`.
- ROJO visto: `TypeError: extraerLinks is not a function` (1 failed | 211 passed).
- VERDE mínimo: `extraerLinks` exportado (`ENLACE` + `ATRIBUTO_HREF` sobre el documento entero); el
  puerto `ListaDeFicheros` / `FicheroDelArtefacto` y el campo OPCIONAL `ficheros?` de
  `PeticionPuertaCascaron`; en `inspeccionarArtefacto`, `if (ficheros !== undefined) ficheros.listar()`
  (trampa deliberada: pedirla SIEMPRE que esté; la generalizan @s48 y @s58). 212 passed; `tsc` 0.
- REFACTOR: `extraerEnlaces` y `extraerLinks` compartían el cuerpo → `hrefsDe(html, etiquetas)`.
  212 passed; `tsc` 0.
