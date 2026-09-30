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
- [x] F-25 judge → mutation_tester → verificación en vivo del lead → `done` (ver ENMIENDAS E-1 y E-2 abajo)
- [x] ~~F-26 `hero_foto`~~ — DESCARTADA por Pablo el 2026-09-29 («no quiero imagen»); en `no_se_construyen`
- [ ] F-27: (fotos) tdd_craftsman → judge → mutation_tester

### Feature en curso: 25 — logo_acoplado, ENMIENDA E-1 (tdd_craftsman, 2026-09-30)

- Escenarios a recorrer por TDD: @s35 (bytes SCSS), @s36 (renderToString), @s37 (jsdom), @s38 (bytes
  TSX). @s39-@s41 son `@verificacion-viva`: los verifica el lead en Chrome, no se fingen en jsdom.
- Bitácora: `progress/tdd_logo_acoplado.md` §«ENMIENDA E-1».
- TDD de E-1 en VERDE: @s35-@s38 con 15 tests en `cabecera.test.tsx`. Suite 1687/1687 y
  typecheck, lint y format limpios. Judge E-1 APPROVED (4b6cb60); sin mutación propia (solo SCSS).
- Verificación en vivo (f8bf0cf, `progress/verificacion_viva_logo_acoplado.md`): 54/56 ✓. H-1: de 821 a
  890 px la nav horizontal no cabe y la cabecera va en dos filas (ya pasaba antes de F-25). H-2: favicon
  404, fuera de alcance.

### ENMIENDA E-2 de F-25 — el menú plegable hasta 920 px (Pablo, 2026-09-30)

- [x] Decisión de Pablo: «Menú hasta 920 px» (brief §8). Barrido del lead de 800 a 960 px: una fila
      desde 891 px con las fuentes cargadas y desde 908 px con las de respaldo.
- [x] Spec: `project-spec.md` §ENMIENDA E-2 (E-2-C1..C4), commit 6cf50b5.
- [x] gherkin_author: F-06 @s17 820→920; F-25 @s20/@s35/@s39, @s42 (bytes) y @s43 (en vivo); 43
      escenarios (1a9799a). El lead cerró sus dos dudas (acceptance de F-06 y nota de E-1-C4).
- [x] ⏸ puerta humana de E-2 APROBADA por Pablo el 2026-09-30 («Aprobado, prográmalo»)
- [x] tdd_craftsman: VERDE, suite 1694/1694 (+1 negativa en @s20, +6 de @s42), typecheck/lint/format
      limpios, sabotajes (a)-(e) demostrados → 199ca7a (instantánea en verde)
- [x] judge E-2 APPROVED, 0 bloqueantes y 7 notas; sabotajes reproducidos por el judge (2df3ae8/dd5a248)
- [x] Verificación en vivo final 62/62 ✓ sobre una copia INMUTABLE de `dist/` (H-3: los hooks del arnés
      rehacen `dist/` al editar y al parar) → `progress/verificacion_viva_logo_acoplado.md`
- [x] **F-25 `done`** (2026-09-30)
- [ ] F-27 `catalogo_fotos` → `in_progress` (2026-09-30): tdd_craftsman (en curso) → judge → mutation_tester → en vivo (@s22-@s26, lead)
