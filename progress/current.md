# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

## 2026-09-29 — Foto bajo cabecera+hero, fotos del catálogo y logo caligráfico acoplado

- **Encargo:** `progress/brief_foto_logo_catalogo.md` (literal de Pablo + P1/P2/P3 + análisis del lead).
- **Arranque:** `./init.sh` VERDE (lint + typecheck + format + suite completa). Memoria
  organizacional NO disponible (`scripts/sync-memoria.sh`: sin red/acceso al repo privado) → se
  sigue sin ella (paso no bloqueante).
- **Features registradas** en `feature_list.json`: F-25 `logo_acoplado`, F-26 `hero_foto`,
  F-27 `catalogo_fotos` (todas `pending`, orden de TDD 25 → 26 → 27).
- **Bloqueo de entorno (RESUELTO):** el proxy devolvía 403 a Pexels; Pablo subió el acceso a red
  del entorno a «Completo» y `images.pexels.com` responde 200 (`www.pexels.com` sigue tras el
  anti-bots de Cloudflare, sin importancia: las fotos salen del CDN).
- **Fotos elegidas por el lead** (P1): `progress/fotos_seleccion.md`, ya en `src/assets/hero/` y
  `src/assets/servicios/` sin importar aún (commit 3dd425b).
- El primer `spec_partner` se detuvo al interrumpir el humano la sesión sin escribir nada; se
  relanzó con las fotos y sus medidas.
- El segundo `spec_partner` murió también por una interrupción (20 min de lectura, 0 bytes escritos).
  Rescatado de su transcripción: 3 comprobaciones pendientes (mutabilidad de `Catalogo.tsx`, tests
  que lean `cabecera.module.scss`, reutilizar `partirNombre`). Tercer `spec_partner` lanzado con
  alcance recortado (F-25 + F-27) y ESCRITURA INCREMENTAL a disco para sobrevivir a interrupciones.
- Workflows de GitHub Actions de la rama revisados: Harness CI y Guardián de rutas sensibles en
  verde en los 5 commits del PR, ninguno encolado ni colgado.

### Fases

- [x] spec_partner → `project-spec.md` §F-25 (LA-1..LA-16) y §F-27 (CF-1..CF-7), commit edcc631; revisada por el lead
- [x] gherkin_author ×2: `logo_acoplado.feature` (34 escenarios, D-1..D-8 decididas por el lead; ENMIENDA D-1 en la spec) y `catalogo_fotos.feature` (26) → ambas `spec_ready`
      → `features/logo_acoplado.feature`, `features/catalogo_fotos.feature`
- [x] ⏸ puerta humana APROBADA por Pablo el 2026-09-29 («Aprobado, empieza»): F-25 → `in_progress`, F-27 espera turno
- [x] F-25 tdd_craftsman: 28 escenarios en jsdom/bytes (@s1-@s27, @s34), suite 1671/1671 (fff8588). El
      contenedor se reinició a mitad (probablemente dos suites concurrentes): se relanzó desde la bitácora
      sin perder nada (de08858). Desviación @s26 ratificada y enmendada en el `.feature` (7aa8ba9).
- [ ] F-25 judge (en curso) → mutation_tester → verificación en vivo del lead (@s28-@s33)
- [x] ~~F-26 `hero_foto`~~ — DESCARTADA por Pablo el 2026-09-29 («no quiero imagen»); en `no_se_construyen`
- [ ] F-27: (fotos) tdd_craftsman → judge → mutation_tester
