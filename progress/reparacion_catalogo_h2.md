# Reparación — el `<h2 id="servicios-titulo">` del catálogo

Fecha: 2026-07-20 · Rama: `fix/titles`

## Qué rompía

`pnpm build` moría en la **puerta 1 (cascarón)**:

```
x / - section sin aria-labelledby a un heading real: servicios-titulo
```

Causa: el commit `9a8d28a` («Fix text that we will not use») borró el bloque
`.demo-encabezado` de `src/components/Catalogo.tsx`, que era donde vivía el
`<h2 id="servicios-titulo">Servicios</h2>`. La `<section>` seguía declarando
`aria-labelledby={ID_SERVICIOS}`, pero ya no existía ningún elemento con ese id
en la página: nombre accesible colgando de la nada.

El id no es decorativo, del él dependen tres cosas:

1. la puerta del cascarón (todo `aria-labelledby` debe resolver a un heading real);
2. la puerta de anclas vivas (igualdad de conjuntos nav ↔ secciones navegables);
3. el CTA «Ver servicios» del hero, `href="#servicios-titulo"` (`home.tsx:95`),
   más `MenuNavegacion.tsx:39` y `Pie.tsx:27`.

## Qué cambié

Orden de Pablo: **el catálogo no cambia ni un píxel de lo que se ve.** Él quitó
ese texto a mano y quiere que siga sin verse.

- `src/components/Catalogo.tsx` — devuelto el `<h2 id={ID_SERVICIOS}>Servicios</h2>`
  como primer hijo de `.demo-contenedor`, con `className={estilos.tituloOculto}`.
  Docblock de cabecera ampliado explicando por qué está oculto y por qué **no**
  puede usarse `display:none`/`visibility:hidden` (sacarían el heading del árbol
  de accesibilidad y la puerta volvería a caer, esta vez sin síntoma visible).
- `src/components/catalogo.module.scss` — nueva clase `.tituloOculto` con la
  técnica *visually hidden* estándar (`position:absolute` + `clip`/`clip-path` +
  1×1px). Comentario explicando el porqué.
- `src/lib/demo/catalogo-demo.ts` — renombrado el campo `titlebuttonfooter`
  (inglés pegado, viola la convención de español del repo) a **`textoBoton`**:
  en la interfaz `CategoriaDemo` y en los 3 objetos de datos. Actualizado su
  único uso, `Catalogo.tsx:34`. **Los valores del texto no se tocan.**

Comprobado que el orden visual no se altera: la regla `.categoria:first-of-type`
sigue casando con el primer `<div class="categoria">` (`:first-of-type` mira el
tipo de elemento, y el `<h2>` no es un `div`).

## Salida real de los comandos

Medido en un **árbol aislado** (`git worktree` en `HEAD` + SOLO mis tres ficheros
del catálogo), porque el árbol de trabajo vivo lo está editando otra sesión en
paralelo (ver más abajo). Es la única medición limpia de *mi* cambio:

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | **exit 0** — `tsc --noEmit`, sin salida |
| `pnpm lint` | **exit 0** — `eslint .`, sin salida |
| `pnpm build` | **exit 0** — las 5 puertas OK |
| `pnpm test` | **769 verdes / 0 rojos** (26 ficheros, 26 verdes) |

Las 5 puertas del build, literal:

```
✓ Puerta del cascarón: las 1 ruta(s) del artefacto llevan horneados el idioma, el title,
  la description, la canónica, un h1, los landmarks y el JSON-LD, y ningún enlace interno
  apunta a la nada.
✓ Puerta de placeholders: el artefacto de producción no tiene placeholders.
✓ Puerta de contraste: los 18 pares en uso cumplen su umbral WCAG 2.2 AA.
✓ Puerta de terceros: el artefacto no contiene ninguna construcción que provoque una
  petición automática a un origen externo, y hornea los 6 pares de fuente autohospedados
  esperados. Ningún tercero recibe la IP del visitante.
✓ Puerta de anclas vivas: cada href="#id" de la nav resuelve a un id presente en su página
  y cada sección navegable está enlazada por la nav (igualdad de conjuntos).
```

## ⚠️ El árbol vivo está siendo editado por OTRA sesión en paralelo

Esto es lo importante del parte. Mientras yo trabajaba, **otro proceso estaba
escribiendo en el hero**. Cronología medida por `stat`:

- `12:42` — corro `pnpm build` en el árbol vivo con mi cambio: **exit 0, las 5
  puertas verdes**. Reparación confirmada.
- `12:55` — `hero.module.scss` cambia bajo mis pies (yo no lo toco).
- `12:57` — vuelvo a construir: **rojo**, `[sass] Undefined variable` en
  `hero.module.scss:77` → `animation: escribir $duracion $curva $espera both;`.
- `13:03` — el fichero cambia otra vez; el error **se mueve** a la línea 155
  → `animation: revelarStudio 0.6s $curva ($espera + $duracion - 0.35s) both;`.

Es decir: alguien está sustituyendo variables SCSS a mano y el fichero pasa por
estados intermedios que no compilan. **No lo he tocado**, por tres razones:

1. no es mi encargo (catálogo + build verde);
2. editarlo sería pisar trabajo en vuelo de otra sesión y mi arreglo quedaría
   machacado al segundo siguiente;
3. es una carrera: el error se mueve solo entre ejecuciones.

**Cómo verifiqué entonces mi cambio**: `git worktree` limpio en `HEAD`, copiados
encima SOLO mis tres ficheros del catálogo, `node_modules` enlazado por junction.
Resultado: typecheck 0, lint 0, build 0 con las 5 puertas, y **769/769 tests
verdes**. Worktree y junction eliminados después (la junction con `rmdir`, no con
`rm -rf`, para no borrar el `node_modules` real a través del enlace; comprobado
que sigue intacto).

Conclusión: **mi cambio deja el repo entero en verde.** El rojo del árbol vivo
es, al 100 %, la reescritura del hero a medio hacer de la otra sesión.

## Los 9 tests rojos que vi en el árbol vivo NO son míos

Todos caen en el **hero**, no en el catálogo:

- `src/components/hero-estilos.test.ts` — 7 rojos (`@s1`, `@s2`, `@s3`, `@s4`,
  `@s17` ×2, `@demo` de `prefers-reduced-motion`).
- `src/components/hero.test.tsx` — 2 rojos (`@demo` brush.png autohospedado,
  `@demo` `<animateMotion>`).

**Verificado empíricamente**, no supuesto: hice `git stash push` de mis tres
ficheros del catálogo y corrí esos dos ficheros de test sobre el árbol sin mis
cambios → **los mismos 9 rojos** (`Tests 9 failed | 24 passed`). Luego
`git stash pop`. Mis cambios no tocan nada del hero y no tienen camino causal
hacia él.

### La causa real (hallazgo, requiere decisión de Pablo)

El árbol de trabajo tiene una **reescritura del hero a medio hacer, sin
commitear**, que no venía en el parte de la tarea:

```
modified:   features/hero.feature           107 +-
modified:   src/components/Hero.tsx         155 +-
modified:   src/components/hero.module.scss 199 +-
untracked:  src/assets/aplicador.png
untracked:  src/lib/trazo-marca.ts
untracked:  tools/trazo-marca/
```

Producción y contrato avanzaron; **los tests se quedaron atrás**. Se ve nítido
en el fallo: el test exige `href` con `/brush/` y el DOM ya sirve
`/src/assets/aplicador.png` (`brush.png` → `aplicador.png`), y exige
`<animateMotion path="…">` donde el nuevo sistema `trazo-marca` ya no lo emite.

**No lo he tocado**, por dos razones: queda fuera de mi encargo (que era el
catálogo y dejar el build verde) y tocarlo me haría pisar trabajo en vuelo de
otra sesión. Además, arreglar el hero es una feature con su propio contrato
(`features/hero.feature`, también modificado), y por disciplina TDD eso va por
ciclo rojo-verde sobre el `.feature` aprobado, no a martillazos para poner la
barra en verde.

Pablo decide: o se retoma la feature del hero para realinear los tests con el
nuevo `trazo-marca`, o se revierte esa reescritura no commiteada.
