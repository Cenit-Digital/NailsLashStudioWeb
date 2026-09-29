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
- [ ] gherkin_author ×2 en paralelo (uno por feature, ficheros distintos) — en curso
      → `features/logo_acoplado.feature`, `features/catalogo_fotos.feature`
- [ ] ⏸ puerta humana sobre los `.feature`
- [ ] F-25: tdd_craftsman → judge → mutation_tester
- [x] ~~F-26 `hero_foto`~~ — DESCARTADA por Pablo el 2026-09-29 («no quiero imagen»); en `no_se_construyen`
- [ ] F-27: (fotos) tdd_craftsman → judge → mutation_tester
