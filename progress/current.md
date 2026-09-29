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
- **Bloqueo de entorno:** el proxy de salida del entorno cloud devuelve 403 (política de red) a
  `www.pexels.com`, `images.pexels.com`, `api.pexels.com` e `images.unsplash.com`. F-26/F-27 no
  pueden cerrar sin fotos; F-25 no depende de ellas.

### Fases

- [ ] spec_partner → `project-spec.md` §F-25/§F-26/§F-27
- [ ] gherkin_author → `features/logo_acoplado.feature`, `features/hero_foto.feature`, `features/catalogo_fotos.feature`
- [ ] ⏸ puerta humana sobre los `.feature`
- [ ] F-25: tdd_craftsman → judge → mutation_tester
- [ ] F-26: (fotos) tdd_craftsman → judge → mutation_tester
- [ ] F-27: (fotos) tdd_craftsman → judge → mutation_tester
