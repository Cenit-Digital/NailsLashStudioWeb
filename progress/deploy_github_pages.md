# Despliegue en GitHub Pages — decisión y configuración (2026-07-25)

> Registro de decisión del `craftsman_lead`. No es una feature `sdd` (no hay `features/*.feature`
> ni entrada en `feature_list.json`): es infraestructura de despliegue, análoga a `harness-ci.yml`.

## El encargo

Pablo pidió: "quiero que se despliegue en Github Pages, cuando se haga push al remoto de la rama
main", con investigación en documentación oficial y autonomía total, preguntando antes cualquier
duda real.

## Lo que la investigación encontró (documentación oficial de GitHub, verificada 2026-07-25)

1. **GitHub Pages exige repo público en plan Free.** Cita literal de la documentación oficial:
   *"If the account that owns the repository uses GitHub Free or GitHub Free for organizations,
   the repository must be public."* Verificado contra la API real: la organización `Cenit-Digital`
   estaba en plan `free` y el repo `NailsLashStudioWeb` era `private`. Con GitHub Team (~4$/mes),
   el CÓDIGO puede seguir privado, pero el SITIO publicado sigue siendo público para cualquiera con
   el enlace igualmente — un sitio de Pages con acceso restringido de verdad exige GitHub
   Enterprise Cloud (`Access control is available for project sites... GitHub Enterprise Cloud`).
2. **El proyecto declara, por escrito, que "sin razón social ni NIF válido en fuente pública, la
   web no se puede publicar"** (`progress/current.md`/`feature_list.json`, corolario duro de F-01).
   F-16 (páginas legales) sigue `blocked`. Nada en `pnpm build` lo impide técnicamente — es una
   decisión deliberada del proyecto (ver `puerta-placeholders.ts`: cablear `ORIGEN_CANONICA` a la
   puerta rompería la CI en rojo permanente mientras el dominio no se decide, así que NO se cablea
   a propósito).
3. **`ORIGEN_CANONICA = 'https://example.invalid'`** (`src/lib/seo.ts:238`) es un placeholder
   deliberado, "Decisión 9 del proyecto, literal": el dominio final es decisión del CLIENTE.

## Las tres decisiones de Pablo (AskUserQuestion, 2026-07-25)

1. **Visibilidad**: hacer el repo público. Acepta la consecuencia explícita (expone TODO el
   historial: informes legales internos, notas de negocio, deuda del catálogo, etc.).
2. **Puerta legal**: "pipeline listo pero con aprobación manual tuya por despliegue" — cada
   despliegue real queda pausado hasta que Pablo lo apruebe en la pestaña Actions.
3. **Dominio canónico**: "de momento no hay dominio, pero esto será temporal, hasta que el cliente
   pague y lo despleguemos en nuestro servidor, que pagaré y lo haré privado". Interpretación
   aplicada (la más técnicamente correcta dado el marco temporal que describe): la URL real de
   GitHub Pages se usa como origen canónico SOLO para este despliegue, inyectada por variable de
   entorno en el workflow — el placeholder `https://example.invalid` del código fuente NO se toca.

## Cambios de infraestructura aplicados (por API, 2026-07-25, por el `craftsman_lead`)

1. `gh repo edit Cenit-Digital/NailsLashStudioWeb --visibility public --accept-visibility-change-consequences`
   → repo público.
2. `POST /repos/Cenit-Digital/NailsLashStudioWeb/pages` con `build_type=workflow`,
   `source.branch=main` → Pages activado, `html_url: https://cenit-digital.github.io/NailsLashStudioWeb/`.
3. `PUT /repos/.../environments/github-pages` con `reviewers: [{type: User, id: 79223844}]`
   (PabloHurtadoGonzalo86) → regla de protección "revisor obligatorio" en el entorno `github-pages`.
   Confirmado con `GET .../deployment-branch-policies`: `main` ya queda permitido (GitHub lo
   añadió solo, al coincidir con `source.branch` de Pages).

## Cambios de código

- `vite.config.ts`: `base: process.env.PAGES_BASE_PATH ?? '/'` — sin la variable (build normal,
  dev, tests), CERO cambio de comportamiento.
- `src/main.tsx`: `basename: import.meta.env.BASE_URL` en `ViteReactSSG(...)`, patrón oficial de
  `vite-react-ssg` para subrutas.
- `src/components/Cabecera.tsx`: el enlace de la marca usa `import.meta.env.BASE_URL` en vez del
  literal `"/"`, para que apunte a la home real bajo la subruta de Pages.
- Detalle completo y verificación (dos builds, con y sin subruta): `progress/tdd_subruta_github_pages.md`.

## El workflow

`.github/workflows/deploy-pages.yml`: dispara en `push` a `main` y `workflow_dispatch`. Job
`build` corre `node .harness/harness.mjs init` (red de seguridad) + `pnpm build` (con
`PAGES_BASE_PATH` tomado de `actions/configure-pages`) + sube el artefacto. Job `deploy` vive en
el entorno `github-pages` (protegido, aprobación manual de Pablo) y publica con
`actions/deploy-pages@v4`. Versiones de acciones verificadas contra la documentación oficial de
GitHub el 2026-07-25 (`actions/checkout@v6`, `actions/configure-pages@v5`,
`actions/upload-pages-artifact@v4`, `actions/deploy-pages@v4`).

## Lo que NO se ha hecho (fuera de alcance de este encargo)

- No se ha hecho push a `main`: el workflow queda listo y disparará en el PRÓXIMO push real a esa
  rama (fusión de este PR o posterior). El primer despliegue de verdad seguirá pausado hasta la
  aprobación de Pablo, tal y como pidió.
- No se ha tocado `ORIGEN_CANONICA` en el código fuente, ni F-16 (páginas legales), ni ninguna
  feature de `feature_list.json`.
- No se ha configurado un dominio personalizado (CNAME): la URL de despliegue es la de GitHub
  Pages por defecto, `https://cenit-digital.github.io/NailsLashStudioWeb/`.
