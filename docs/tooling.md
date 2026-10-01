# Tooling — agentes de apoyo y hooks

> Estos refuerzan el arnés, no lo reemplazan. Los 6 agentes del pipeline
> (`craftsman_lead`, `spec_partner`, `gherkin_author`, `tdd_craftsman`,
> `judge`, `mutation_tester`) son obligatorios. Los de apoyo son **opcionales
> y de solo lectura**: los convoca el `craftsman_lead` cuando aportan valor, y
> nunca sustituyen al `judge` ni al `mutation_tester`.

## Agentes de apoyo (`.claude/agents/`)

| Agente              | Cuándo usarlo                                              | Qué escribe                   |
| ------------------- | ---------------------------------------------------------- | ----------------------------- |
| `security_reviewer` | Features que tocan entrada de usuario, auth, IO, red       | `progress/security_review.md` |
| `a11y_seo_auditor`  | Features con UI web (accesibilidad y SEO)                  | `progress/audit_a11y_seo.md`  |
| `mentor`            | Cuando el humano quiere explicación didáctica de un cambio | Responde en chat (no bloquea) |

Son **de solo lectura**: revisan y reportan, no editan `src/`. Bórralos si tu
proyecto no los necesita (p. ej. `a11y_seo_auditor` en un proyecto sin UI web).

## Hooks (`.claude/settings.json`)

El arnés automatiza dos verificaciones que **el harness ejecuta, no el
agente**, así que no se pueden saltar:

- **PostToolUse (Edit|Write)** → corre `bin/harness test` (vía
  `.claude/hooks/suite-tras-editar.mjs`) y muestra el resumen. Feedback
  inmediato tras cada cambio de código. **Excepción:** si el fichero editado
  es un `.md`, no la corre: ningún test lee Markdown y la suite tarda ~6 min
  (dos `pnpm build` reales). Ante un evento que no se pueda leer, la corre.
- **Stop** → corre `bin/harness init` al terminar cada turno del agente y
  avisa si algo quedó rojo.

Ninguno de los dos toca el `dist/` del proyecto: los tests build-based
construyen en un `dist/` temporal (`NLS_DIST_DIR`), así que `vite preview`
puede servir `dist/` mientras corren (hallazgo H-3). Claude Code lee los hooks
al arrancar la sesión: un cambio aquí surte efecto en la sesión siguiente.

Los hooks usan el motor agnóstico, así que funcionan igual en cualquier stack
(los comandos concretos salen de `harness.config.json`).

## Permisos

`.claude/settings.json` incluye una allowlist mínima para que los comandos del
arnés (`bin/harness …`, `node .harness/harness.mjs …`) no pidan confirmación
en cada invocación. Amplíala con los comandos de tu stack si lo necesitas.

## Extensiones opcionales del ecosistema

En proyectos reales (como la web corporativa que inspiró esta plantilla) el
arnés convive con herramientas del stack: skills de Claude Code gestionadas
con **autoskills** (`skills-lock.json`), un asistente tipo "senior perezoso"
para escribir lo mínimo que funciona, etc. No son parte del núcleo del arnés;
añádelas si tu equipo las usa.
