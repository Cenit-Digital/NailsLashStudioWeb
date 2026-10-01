# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

## 2026-09-30 — H-3: los tests build-based construyen en un `dist/` temporal (infra, sin `.feature`)

- Worktree `.claude/worktrees/tests-build-aislado` (otra sesión trabajaba en el checkout principal),
  rama `claude/tests-build-aislado`, PR a `main`. Sin entrada en `feature_list.json`: es infraestructura
  de tests, sin comportamiento del sitio (mismo trato que las PR #14 y #15).
- Brief `progress/brief_tests_build_aislado.md`; TDD `progress/tdd_tests_build_aislado.md` (R1-R3 con
  sus rojos reales); judge `progress/judge_tests_build_aislado.md` (si no está, quedó PENDIENTE).
- `NLS_DIST_DIR` → `build.outDir` (`vite.config.ts`) y `tools/artefacto.ts` (las 4 puertas que leen el
  artefacto); sin la variable, todo es idéntico. `src/lib/` intacto.
- `fileParallelism: false` se queda: vite-react-ssg borra entera `.vite-react-ssg-temp/` al acabar cada
  build. Riesgos residuales: un `pnpm build` lanzado a la vez desde fuera de la suite, y
  `trampas-del-horneado` heredaría `NLS_DIST_DIR` si alguien la exportara en su shell.
- Hook `PostToolUse`: salta la suite si lo editado es `.md` (decisión de Pablo). Surte efecto en
  sesiones nuevas (Claude Code toma los hooks al arrancar).
- Mutación: N/A. `src/lib/` intacto, `tools/` fuera de `mutate`, los `*-horneado` excluidos de Stryker;
  en `vitest.stryker.config.ts` solo cambia un comentario.

## 2026-09-30 — F-28 `favicon_marca` (cura del H-2 de F-25: el 404 de `/favicon.ico`)

Rama `claude/favicon-marca` desde `origin/main` (ba5b498). **No** se toca la rama de PR #16
(`claude/hopeful-euler-jx0jq8`), donde F-27 está `in_progress`: el favicon no depende de F-25/F-27 y el
único solape al fusionar será el añadido al final de `feature_list.json`. Id 28 porque 25-27 ya existen allí.

- Protocolo de arranque: memoria organizacional NO sincronizada (paso 2bis, no bloqueante; no se ejecutó
  `scripts/sync-memoria.ps1` en esta sesión). `bin/harness init` pendiente de correr antes del TDD.
- Decisiones de Pablo (AskUserQuestion): FM-1 diseño «B» (la «N» de Great Vibes en `--ink` sobre
  `--accent-soft`), FM-2 SVG + ICO (16+32) + apple-touch-icon 180. Referencia: `docs/research/favicon/`.
- Brief: `progress/brief_favicon_marca.md` (hechos medidos, propuestas FM-3..FM-7, techo de alcance).
- Siguiente: `spec_partner` → sección F-28 de `project-spec.md`; `gherkin_author` → `features/favicon_marca.feature`
  (≤ 10 escenarios); puerta humana.
- Arranque medido (2026-09-30): memoria organizacional sincronizada (25 patrones; aplicado «revisión
  adversarial del contrato» a escala reducida: una sola pasada con lentes, por ser un contrato corto).
  `bin/harness init` (vía `node .harness/harness.mjs init`; `bin/harness` es el lanzador POSIX): typecheck 0,
  ESLint 0, **1556/1556 tests**; `format:check` en rojo por DOS causas: el brief sin formatear (corregido) y
  `.claude/worktrees/tests-build-aislado/`, el worktree LOCAL de otra sesión de Claude que trabaja en paralelo
  sobre este repo (no se toca). Cura: `.claude/worktrees/` a `.prettierignore` y a `.gitignore` (git NO lo
  ignoraba: salía como `??`). Tras ello `prettier --check .` verde.
- Spec F-28 escrita por `spec_partner` (`project-spec.md` §F-28, 152 líneas; PA-28-1: iPhone real para el
  apple-touch-icon, recomendado no bloqueante). Corregida por el lead una frase inexacta sobre PR #16.
- **Puerta humana APROBADA** (Pablo, AskUserQuestion, 2026-09-30): `features/favicon_marca.feature` tal cual, con
  FM-3..FM-7 ratificadas; PA-28-1: no hay iPhone, no bloquea ([NV]). F-28 pasa a `in_progress`.
- TDD en DOS partes en paralelo (presupuesto de la sesión: 45 min): A = `tools/favicon/generar.mjs` (sin tests
  propios, por spec; nota en `progress/tdd_favicon_marca_generador.md`), B = @s1-@s8 por TDD y sabotajes 1-8
  (`progress/tdd_favicon_marca.md`). @s9/@s10 en vivo: el lead (`progress/verificacion_viva_favicon_marca.md`).

### 2026-09-30 18:25 — corte (Pablo apaga el equipo): F-28 `in_progress`, NO `done`

- Hecho: puerta humana APROBADA (10 escenarios, PA-28-1 «No, que no bloquee»); generador
  `tools/favicon/generar.mjs` (parte A, `progress/tdd_favicon_marca_generador.md`); `public/` con los 3 iconos;
  `index.html` con los 3 `<link>`; `src/pages/favicon-marca.test.ts` **40/40 verde** (@s1-@s7); typecheck 0,
  ESLint 0, Prettier verde. ⚠️ El TDD (partes A/B) lo avanzó un actor distinto de este lead en este mismo
  directorio (commit c94d23e y ficheros de 17:51-18:14); el lead no lanzó el `tdd_craftsman`. Revisar su bitácora.
- PENDIENTE: @s8 (añadir lo horneado a `home-horneado.test.ts`) · suite completa + `pnpm build` 5 puertas ·
  `judge` · sabotajes manuales (brief §6, 9) · verificación en vivo @s9/@s10 en Chromium (`vite preview`) ·
  `progress/tdd_favicon_marca.md` con el mapa @s → test · PR a `main`.

### 2026-10-01 — F-28: cierre del pipeline (lead)

- Arranque: memoria organizacional sincronizada (25 patrones); aplicado
  `testing/medicion-de-verificacion-lleva-su-propio-control-y-cuenta-lo-ejecutado` a la medida en vivo (cazó
  una contraprueba ciega, ver `progress/verificacion_viva_favicon_marca.md` §5).
- Decisiones de Pablo (AskUserQuestion, 2026-10-01): fusionar #17 y luego #16 en `main` y continuar F-28
  encima; aprobar el despliegue de F-28 y repetir la prueba del 404 en la web publicada. Hecho: #17 →
  `ff4c5ed`, #16 (tras llevarle `main` y su CI en verde) → `8b7c4c5`; los dos despliegues los aprobó Pablo.
- `origin/main` fusionado en la rama (`93796fa`): 3 conflictos de documentación (`feature_list.json`,
  `project-spec.md`, este fichero) resueltos por unión, F-25..F-27 antes que F-28.
- `tdd_craftsman` ronda 1: 8/8 sabotajes de bytes en rojo (27 variantes, más 12 extra) y Rojo → Verde
  reproducido (`progress/tdd_favicon_marca.md`, commit `a5af21b`). Ronda 2: @s8 en `home-horneado.test.ts`
  sobre el artefacto TEMPORAL de #17 (7 `it`, 42/42 en el fichero), rojo con 6/6 sabotajes.
- Verificación en vivo del lead (@s9, @s10 y sabotaje 9): `progress/verificacion_viva_favicon_marca.md`, con
  capturas y guiones en `docs/research/favicon/verificacion-viva/`. `dist/` intacto tras 16 builds de tests
  (H-3 de #17 confirmado en uso real).
- Siguiente: `harness init` completo, `judge`, PR y CI, fusión, despliegue y medida DESPUÉS en la web.
- 10:50: `judge` APPROVED (0 bloqueantes, 8 menores: 1-5 quedan como deuda en el `cierre`; 6-8 resueltos en
  documentación: PR, datos crudos archivados, nota de las pasadas de @s10 y H-5 como deuda de F-05).
  `harness init` en verde (1820/1820, 0 avisos); un falso rojo LOCAL de Prettier en `package.json` (CRLF en la
  copia de trabajo desde julio, LF en git) se normalizó sin cambiar el contenido versionado. F-28 → `done`.
  En curso: `harness verify` completo (mutación de los 37 ficheros de `stryker.config.json`).
- 10:58: `harness verify` COMPLETO en verde: mutación de los 37 ficheros al **100 %** (2624 mutantes: 2611
  muertos + 13 por timeout, 0 supervivientes, 41 ignorados ya documentados). Aplicado
  `testing/informe-de-mutacion-con-timeouts-miente`: los 13 timeouts (`placeholders.ts` 9, `equipo-logica.ts`
  3, `resenas-logica.ts` 1) se repitieron a `--concurrency 1` y SIGUEN en timeout con 100 % (87+9, 38+3, 29+1):
  son bucles infinitos genuinos (condición o avance del bucle mutados), no ruido de CPU.
- 10:48-10:51: PR #18 fusionada (`2a49c14`), despliegue aprobado por el lead (autorización de Pablo) y el
  DESPUÉS medido en GitHub Pages: consola vacía, iconos en 200 y la «N» en la pestaña. H-2 cerrado.
- 11:08: los dos hallazgos fuera de alcance (deuda de legibilidad de F-28 y H-5) se propusieron como tareas
  aparte; Pablo prefiere hacerlo todo en ESTA sesión. Las dos sesiones abiertas estaban ya ociosas (brief
  escrito cada una); se continúan aquí, una a la vez, reutilizando sus briefs.
