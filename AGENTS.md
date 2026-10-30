# AGENTS.md — instrucciones para agentes de IA

> Punto de entrada para cualquier agente (Claude Code, Codex, Copilot, OpenCode, Gemini). Corto a propósito:
> lo detallado vive en `docs/`. Las cinco secciones son del proyecto; el bloque final lo gestiona la plantilla
> `Cenit-Digital/TemplateSSDUncleBob` (v0.4.2) y lo reemplaza `scripts/harness-upgrade.mjs`.

## 1. Resumen del proyecto

Web del salón **Nails Lash Studio** (C.C. El Zoco, Las Rozas de Madrid): React 19 + Vite 7 + `vite-react-ssg`
(HTML horneado), TypeScript estricto, SCSS Modules y pnpm. Se despliega en **GitHub Pages** bajo
`/NailsLashStudioWeb/` y cada despliegue espera la aprobación manual de Pablo (entorno `github-pages`). Es el
**entorno de pruebas**: el repo de presentación al cliente (`WebNailsDisenosPresentacion`) no se toca desde aquí.

**Historial del método.** Hasta el 2026-10-30 el repo siguió la plantilla antigua (pipeline de 6 agentes,
`feature_list.json`, `project-spec.md`, `progress/`). Esos ficheros se conservan como **registro del proyecto**:
las decisiones (`D-n`, `T-n`, `N-n`) y preguntas abiertas (`A-n`) de `project-spec.md` siguen vigentes y se
enmiendan ahí, pero el trabajo nuevo se organiza por **issue y PR** según la política del bloque final, y el
contrato de cada capacidad es su `features/<capacidad>.feature`.

## 2. Ficheros clave

| Ruta | Qué contiene |
| --- | --- |
| `harness.config.json` | Comandos del stack (instalar, lint = typecheck + ESLint + Prettier, test, mutación, build) |
| `src/` | Código y tests co-ubicados (`*.test.ts(x)`); `src/lib/site.ts` es la fuente única de los datos del negocio |
| `api/` | Backend de citas (Hono + `pg`, T-8): reserva en Google Calendar, email, Turnstile y bloqueo en PostgreSQL; se arranca con `node api/src/servidor.ts` |
| `features/<capacidad>.feature` | Spec viva de cada capacidad (Given/When/Then con tags `@sN` estables) |
| `project-spec.md` | Registro de decisiones y preguntas abiertas del proyecto, y specs históricas por feature |
| `feature_list.json` · `progress/` | Historial de la plantilla antigua (estado y bitácoras por feature); no se reabren |
| `tools/puerta-*.ts` | Las 5 puertas que corre `pnpm build` sobre `dist/` (placeholders, contraste, terceros, anclas, cascarón) |
| `stryker.config.json` · `tools/mutate.mjs` | Mutación con Stryker; `mutate` es una lista explícita de ficheros |
| `docs/` | `tdd`, `gherkin`, `verification`, `mutation-testing`, `architecture`, `conventions`, `configuration`, `tooling`, `modelos` |
| `.claude/agents/` | Agentes de nivel (`worker_fast`, `worker_balanced`, `reviewer_frontier`) y especialistas opt-in de solo lectura |
| `.github/` | Plantillas de issue y PR, check «Cuerpo del PR», CI del arnés y despliegue a Pages |
| `harness.manifest.json` · `scripts/harness-upgrade.mjs` | Qué es de la plantilla y qué del proyecto; `--check` mira la deriva |

## 3. Desarrollo y validación

**Cómo se ejecuta.** `./init.sh` o `bin/harness init` primero; si falla, **para**. Después `bin/harness test`,
`bin/harness mutate <fichero>` y `pnpm build` (que corre las 5 puertas y falla cerrado).

**Flujo.** Rama nueva desde `main`, commits convencionales, issue con su plan y PR con la plantilla de `.github/`.
Antes de pedir revisión, revisa tu propio diff (`/code-review` o `reviewer_frontier`). Si el cambio es visual,
adjunta capturas de antes y después (móvil 390 px y tablet).

**Convenciones de tests que este repo exige (aprendidas en features anteriores):**
- Consultar por rol, nombre accesible, texto o `data-*`; **nunca por clase CSS** (`css:false` en Vitest).
- **Anti-tautología:** comparar contra un literal escrito a mano, nunca contra la constante importada de producción.
- **Verde ≠ funciona:** en UI, `pnpm build` y leer el HTML horneado de `dist/`; jsdom solo ve el estado hidratado.
- Stryker: **prohibido `--testFiles`** (da 0 % falso); acotar con `--mutate <fichero>`. Nunca dos Stryker a la vez;
  un `# timeout` > 0 invalida el score (repetir con `--concurrency 1`). Ver `docs/verification.md`.
- Mutación al 100 % sin exclusiones (aprendido en #34): nada de cadenas ni `Intl.DateTimeFormat` a nivel de módulo
  (son mutantes estáticos que el runner no activa, como en `horario.ts`); créalos dentro de las funciones. Y bucles
  con `Array.from({ length })` en vez de `for`/`while` con `+=`, para que ningún mutante los cuelgue (timeout).
- Stryker (aprendido en #39): nada de estado calculado en el cuerpo de un `describe` (p. ej. `const x = aplicar(...)`).
  Si un mutante lo rompe, falla la RECOGIDA del fichero y Stryker cuenta el mutante como superviviente: usa funciones.
- `api/` (aprendido en #37): sus tests llevan `// @vitest-environment node` y usan los dobles de `api/src/dobles.ts`.
  Los que necesitan PostgreSQL real se llaman `*.integracion.test.ts` (con `embedded-postgres`, sin Docker ni root) y
  quedan fuera de Stryker, como los `*-horneado`. Ningún secreto en el código: todo llega por el entorno (`config.ts`).
- `base` de `vite.config.ts` es un literal (lo lee la puerta de terceros como texto); no reintroducir `script:'async'`.

## 4. Guardarraíles

- **No saltes la puerta humana:** plan aprobado antes de implementar y diff revisado en local antes de `git push`.
- **Umbral de mutación del proyecto: 1.0** en el nivel crítico (decisión heredada de WebEmpresa, `break: 100` en
  Stryker). Es la «excepción justificada» que prevé la plantilla; se mantiene salvo decisión de Pablo.
- **Ninguna clave en el cliente:** el sitio es público; cualquier secreto vive en un backend (decisión N-3).
- **No inventar datos del negocio:** lo no verificado va como placeholder detrás de la puerta de F-01 (decisión D-6).
- **Un tema por tarea y por PR**; si algo se sale del objetivo, propón otra sesión.
- **Si te bloqueas,** documenta el bloqueo en el issue o el PR y para.

## 5. Definición de hecho

- `bin/harness init`, `bin/harness test` y `pnpm build` en verde (typecheck, ESLint y Prettier a 0).
- Nivel crítico: mutación al 100 % sobre los módulos que fija el plan, sin timeouts.
- Cada criterio del issue tiene su test; si cambió una capacidad, su `.feature` se actualiza en el mismo diff.
- El PR rellena sus bloques y marca la casilla de revisión local; el issue tiene el plan marcado y los resultados.
- Si una decisión de `project-spec.md` cambia, se enmienda allí en el mismo PR.

<!-- harness:begin — bloque gestionado por la plantilla: no lo edites aquí; lo reemplaza scripts/harness-upgrade.mjs al aplicar -->
## Arnés SSD (gestionado por la plantilla)

- Entorno y arnés: `bin/harness init` · tests: `bin/harness test` · mutación: `bin/harness mutate [target]`.
- ¿Al día con la plantilla? `node scripts/harness-upgrade.mjs --check` (solo lectura); `--diff` enseña los cambios.
- Qué es de la plantilla y qué del proyecto: `harness.manifest.json`.

### Política de trabajo

**Niveles.** El planificador clasifica cada tarea por juicio (las pistas no son exhaustivas; ante la duda, el nivel superior) y escribe el nivel y su motivo en el plan; la persona lo corrige al aprobarlo.
- **trivial:** cambio local y evidente. Un solo contexto, sin subagentes obligatorios.
- **pequeño:** acotado a pocos ficheros y sin decisiones de diseño. Se planifica con `frontier` y se implementa con `balanced`, en la misma sesión.
- **estándar:** varias piezas o un comportamiento nuevo. Mismo mecanismo; el plan fija los artefactos que exige.
- **crítico:** seguridad, datos, dinero o un contrato público. El planificador sigue como orquestador y revisor: delega, puede reasignar y revisa. Exige además TDD estricto y mutación sobre los módulos que fija el plan (`docs/verification.md`); en los demás niveles no se corre mutación.

**Puerta humana (dos puntos, todos los niveles).** 1) La persona aprueba el plan antes de implementar (en trivial basta uno de 1-2 líneas con el nivel y el motivo). 2) La persona revisa el diff en local antes de cualquier `git push`; un agente interactivo no empuja sin esa revisión.

**Delegación.** Por capacidad, no por proveedor: `frontier` (planificar, revisar, lo crítico), `balanced` (implementar), `fast` (tareas mecánicas y exploración). Salvo en trivial, el plan lleva una tabla «Delegación»: ejecutor, nivel, esfuerzo, motivo, «escalar si…» y verificación automática. Qué modelo es cada nivel en cada herramienta: `docs/modelos.md`.

**Issues y PR.** Plantillas en `.github/`. Toda tarea tiene su issue (objetivo, nivel, criterios Given/When/Then, plan en casillas, tareas relacionadas, resultados); en trivial es mínimo: objetivo y plan de 1-2 líneas con el nivel y el motivo. El PR lo enlaza con `Closes #N`, lleva siempre cuatro bloques (qué, por qué, cómo se probó, pendiente), «Impacto en tareas anteriores» y la casilla de revisión local; el workflow «Plantilla del PR» comprueba esas secciones y la casilla (`node .harness/pr-body.mjs`).

**Bucle de aprendizaje (fase de cierre).** Una tarea nueva puede dejar obsoletas otras anteriores; el nivel trivial no ejecuta esta fase.
- Al planificar, anota en «Tareas relacionadas» del issue las anteriores que tocan lo mismo: `node .harness/impacto-tareas.mjs --files <rutas del plan>` da los candidatos.
- Al cerrar, `node .harness/impacto-tareas.mjs` sobre la rama lista, con tope fijo y sin LLM, los PR e issues previos que tocaron los mismos ficheros. Alimenta «Impacto en tareas anteriores»: cada candidato se marca «afecta» o «no afecta», con el motivo en una línea.
- Cada tarea afectada (su issue; si solo existe el PR, el PR) recibe la etiqueta `revisit` y un comentario con el motivo y el enlace al PR. Si el impacto exige cambiar algo, un agente en modo plan abre un issue `revisit` nuevo con el plan de enmienda ya redactado; se enlaza desde el comentario, desde «Resultados de la ejecución» y desde el bloque del PR, y la persona lo aprueba como cualquier plan. Comentar, etiquetar, crear la etiqueta si falta y abrir ese issue se hace con el OK de la persona; ningún issue se reabre por su cuenta.
- Lo aprendido que valga para tareas futuras va a `AGENTS.md` en el mismo PR. No hay bot retrospectivo.
- «Todo criterio de aceptación tiene un test» es la mitad determinista del bucle.
<!-- harness:end -->
