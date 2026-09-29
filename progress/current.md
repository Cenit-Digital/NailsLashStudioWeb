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

### Fases

- [ ] spec_partner → `project-spec.md` §F-25/§F-27 (en curso; F-26 retirada del encargo)
- [ ] gherkin_author → `features/logo_acoplado.feature`, `features/catalogo_fotos.feature`
- [ ] ⏸ puerta humana sobre los `.feature`
- [ ] F-25: tdd_craftsman → judge → mutation_tester
- [x] ~~F-26 `hero_foto`~~ — DESCARTADA por Pablo el 2026-09-29 («no quiero imagen»); en `no_se_construyen`
- [ ] F-27: (fotos) tdd_craftsman → judge → mutation_tester
