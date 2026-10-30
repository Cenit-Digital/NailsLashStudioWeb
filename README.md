# Nails Lash Studio — web (entorno de pruebas)

Web del salón **Nails Lash Studio** (C.C. El Zoco, Las Rozas de Madrid), publicada en GitHub Pages:
**https://cenit-digital.github.io/NailsLashStudioWeb/**

- **Stack:** React 19, Vite 7 con `vite-react-ssg` (HTML horneado), TypeScript estricto, SCSS Modules y pnpm. Node ≥ 22.13.
- **Despliegue:** cada push a `main` construye el sitio, y el despliegue espera la aprobación manual de Pablo (entorno `github-pages`).
- **Método:** plantilla SSD de Cenit Digital, [`TemplateSSDUncleBob`](https://github.com/Cenit-Digital/TemplateSSDUncleBob), en la versión v0.4.2. Los agentes leen primero [`AGENTS.md`](AGENTS.md).

## Arranque

```bash
pnpm install
./init.sh            # o: bin/harness init
bin/harness test
pnpm build           # build + las 5 puertas sobre dist/
pnpm dev
```

| Comando                        | Qué hace                                                                    |
| ------------------------------ | --------------------------------------------------------------------------- |
| `bin/harness init`             | Verifica el entorno y el arnés: lint (typecheck, ESLint y Prettier) y tests |
| `bin/harness test`             | Suite de Vitest                                                             |
| `bin/harness mutate <fichero>` | Stryker sobre un fichero; el umbral del proyecto es 100 %                   |
| `pnpm build`                   | Genera el sitio y pasa las puertas de `tools/puerta-*.ts`                   |

## Al día con la plantilla

```bash
node scripts/harness-upgrade.mjs --check   # solo lectura
node scripts/harness-upgrade.mjs --diff
```

[`harness.manifest.json`](harness.manifest.json) separa lo que es de la plantilla y lo que es del proyecto.

## Mapa

- **[`AGENTS.md`](AGENTS.md):** instrucciones del proyecto y política de trabajo (bloque gestionado por la plantilla).
- **[`project-spec.md`](project-spec.md):** decisiones (`D-n`, `T-n`, `N-n`), preguntas abiertas (`A-n`) y specs históricas por feature.
- **`features/`:** specs vivas en Gherkin.
- **`src/`:** código y tests.
- **`tools/`:** puertas del build y mutación.
- **[`feature_list.json`](feature_list.json) y `progress/`:** historial del método anterior; se conservan como registro.
