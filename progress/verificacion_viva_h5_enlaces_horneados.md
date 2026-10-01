# Verificación en vivo — H-5 (ENMIENDA 5 de F-04): @s63 y @s64

> `craftsman_lead`, 2026-10-01. Rama `claude/amazing-montalcini-d6abb1` en `d73ce5a` (fases A y B del TDD en verde;
> `harness init` del worktree: 56 ficheros, 1955/1955). Contrato: `features/cascaron_semantico.feature` @s63 y @s64.

## @s63 — el rojo demostrado por el lead (firma (a), y solo la (a), S-10) ✓

- Partida: `git status --porcelain` vacío; copia de `public/favicon.svg` FUERA del repo (md5 `69ffa8c46fbeda00da75d0f40c277ca0`).
- **SABOTAJE** (18:46:42): `public/favicon.svg` borrado; `NLS_DIST_DIR=<temporal propio fuera del repo> pnpm build` → **exit 1**.
  Líneas de la puerta del cascarón:

```
  ✗ / — link root-absoluto sin el prefijo de la base: "/favicon.svg"
✗ Puerta del cascarón: el build de producción NO puede publicarse.
```

Es la ÚNICA línea que contiene « — link root-absoluto». `vite-react-ssg build` salió con 0 y la cadena se cortó en la
primera puerta, la del cascarón (`package.json:16`).

- **CONTROL** (18:46:47): fichero restaurado desde la copia; `NLS_DIST_DIR=<otro temporal propio> pnpm build` → **exit 0**:

```
✓ Puerta del cascarón: las 1 ruta(s) del artefacto llevan horneados el idioma, el title, la description, la canónica, un h1, los landmarks y el JSON-LD, y ningún enlace interno apunta a la nada.
✓ Puerta de placeholders: el artefacto de producción no tiene placeholders.
✓ Puerta de contraste: los 18 pares en uso cumplen su umbral WCAG 2.2 AA.
✓ Puerta de terceros: el artefacto no contiene ninguna construcción que provoque una petición automática a un origen externo, y hornea los 6 pares de fuente autohospedados esperados. Ningún tercero recibe la IP del visitante.
✓ Puerta de anclas vivas: cada href="#id" de la nav resuelve a un id presente en su página y cada sección navegable está enlazada por la nav (igualdad de conjuntos).
```

- Tras el CONTROL: `git status --porcelain` vacío y `public/favicon.svg` byte a byte igual a la copia (`cmp`). El `dist/` del
  proyecto no se tocó (los dos builds, en temporales).

## @s64 — en vivo tras publicar (control de regresión)

Se anota tras fusionar la PR y aprobar el despliegue (H5-6).
