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
