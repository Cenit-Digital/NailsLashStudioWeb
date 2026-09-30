# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

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
