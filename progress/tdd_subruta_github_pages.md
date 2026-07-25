# Subruta de GitHub Pages — informe (2026-07-25)

Tarea directa (fuera del pipeline de `feature_list.json`: no hay `subruta_github_pages` en la
lista ni `features/subruta_github_pages.feature`). No es una feature nueva con escenarios Gherkin,
es una preparación de despliegue. Se documenta aquí porque toca `src/`.

## Estado final: BLOQUEADO parcialmente

- ✅ `src/main.tsx` y `src/components/Cabecera.tsx`: cambiados, verificados, CERO regresión.
- ❌ `vite.config.ts`: el cambio pedido (`base: process.env.PAGES_BASE_PATH ?? '/'`) se implementó,
  se comprobó que rompe una puerta de build existente, y **se revirtió** para no dejar el build
  normal en rojo. La subruta de despliegue sigue sin mecanismo hoy.

## Qué se hizo

### 1. `src/main.tsx`
```diff
-export const createRoot = ViteReactSSG({ routes })
+export const createRoot = ViteReactSSG({ routes, basename: import.meta.env.BASE_URL })
```
`import.meta.env.BASE_URL` vale `'/'` en dev, build normal y todos los tests (default nativo de
Vite cuando `base` no se declara). Cero cambio de comportamiento.

### 2. `src/components/Cabecera.tsx`
```diff
-      <a href="/" className={estilos.marca}>
+      <a href={import.meta.env.BASE_URL} className={estilos.marca}>
```
Verificado: `src/components/cabecera.test.tsx` no asevera el `href` de la marca literalmente (solo
texto/rol), así que no hubo que tocar ningún test.

### 3. `vite.config.ts` — INTENTADO Y REVERTIDO
Se añadió `base: process.env.PAGES_BASE_PATH ?? '/'`, tal y como pide la documentación oficial de
`vite-react-ssg`. Al correr `pnpm build` (sin `PAGES_BASE_PATH`, el caso normal) el build terminó
en `exit 1`:

```
  ✗ vite.config.ts — base debe no declararse o ser exactamente "/": "process.env.PAGES_BASE_PATH ?? /"

✗ Puerta de terceros: el build de producción NO puede publicarse.
```

**Causa raíz**: `src/lib/puerta-terceros.ts` (feature F-05 `cero_terceros`, `status: done`,
mutación 100%, cerrada y aprobada por el humano) incluye una puerta de build
(`violacionesDeBase`) que **escanea como TEXTO** el fichero `vite.config.ts` con la regex
`BASE_DE_VITE = /\bbase:([^,\n]*)/` y exige — a propósito, según su propio comentario — que la
propiedad de base declarada sea **o bien ausente, o bien el literal exacto `'/'`**. Cualquier otra
cosa, aunque sea una expresión que en runtime resuelva a `'/'`, es una violación **por diseño**:
la puerta deliberadamente NO ejecuta/importa la config (para no depender de flags de CLI ni de
efectos secundarios), así que no puede "ver" que `process.env.PAGES_BASE_PATH ?? '/'` es inocuo
cuando la variable no está definida.

Esto NO es un fallo de mi cambio: es el comportamiento pretendido de la puerta. Su propósito es
impedir que `base` apunte a un origen de terceros (p. ej. un CDN externo), lo que dejaría TODAS
las URLs de assets absolutas apuntando fuera del propio dominio — justo el invariante que F-05
protege ("cero peticiones a terceros"). El diseño actual es más estricto de lo necesario para
ese propósito (exige el literal exacto en vez de "no es un origen externo"), pero es una pieza de
una feature cerrada, con mutación al 100 % y aprobada por el humano — no está en el alcance de
esta tarea (que enumeraba explícitamente `vite.config.ts`, `src/main.tsx` y `Cabecera.tsx`, no
`src/lib/puerta-terceros.ts` ni su test `src/lib/terceros.test.ts`).

Investigué una alternativa que NO tocara `vite.config.ts` en absoluto: el flag `--base` de la CLI
de `vite-react-ssg build` existe (`vite-react-ssg build --help` lo muestra), pero **inspeccionando
el código fuente de la librería** (`node_modules/vite-react-ssg/dist/shared/vite-react-ssg.*.mjs`,
función `build()`), ese flag SOLO alimenta el `publicPath` de `beasties`/`critters` (CSS crítico
inline); NO se propaga a la resolución de `base` de Vite ni a `import.meta.env.BASE_URL` ni al
`basename` de react-router. Confirmado leyendo el código: `resolveConfig(viteConfig, ...)` en la
librería solo recibe `{ configFile }`, nunca el `base` de `ssgOptions`. Es decir: el mecanismo
oficial y único para cambiar la subruta real es `base` en `vite.config.ts` (estático o dinámico),
exactamente como decía la documentación citada en la tarea — no hay atajo por CLI.

También consideré (y **descarté explícitamente**) evadir la detección de la regex con un truco
sintáctico (p. ej. `['base']: ...` en vez de `base: ...`, que no matchea `\bbase:`). Lo descarto
porque sería deshonesto con el propio propósito de la puerta: dejaría de detectar el caso real que
sí debe bloquear (alguien fijando `base` a una URL de un tercero por error), reabriendo en
silencio el hueco que F-05 cerró. No es una solución, es una evasión.

**Acción tomada**: revertí `vite.config.ts` a su estado original (sin `base`), dejando una nota en
el propio fichero apuntando a este informe. Verificado que el `base:` no aparece ni siquiera en
comentarios (la regex no distingue código de comentarios: mi primer intento de nota SÍ lo hizo
fallar por accidente, porque escribí literalmente `base: process.env...` dentro de un comentario;
corregido parafraseándolo).

## Recomendación (una sola, para que decida el humano / craftsman_lead)

Para desbloquear la subruta de despliegue sin debilitar el invariante de F-05, la opción más
limpia es **ampliar `violacionesDeBase` en `src/lib/puerta-terceros.ts`** para aceptar cualquier
valor de `base` que sea una ruta **raíz-relativa same-origin** (empieza por `/`, no contiene
`://` ni un host), en vez de exigir el literal exacto `'/'` — eso preserva el invariante real
("ningún origen de terceros") y desbloquea una subruta legítima como `/NailsLashStudioWeb/`. Esto
implica reabrir F-05 (cerrada, mutación 100 %) con su propio ciclo TDD + test ampliado en
`src/lib/terceros.test.ts` + re-verificación de mutación en el fichero tocado — el patrón
"Enmienda" que ya usa este repo para tocar features cerradas (ver el cierre de
`resenas_agregado_enlace`, "ENMIENDA 4"). Está fuera del alcance que se me dio en esta tarea (los
tres ficheros listados no incluían `puerta-terceros.ts`), así que no lo he tocado.

Alternativa NO recomendada: seguir dejando `base` fija en `'/'` para siempre y resolver la subruta
de otro modo (p. ej. un `<base href>` inyectado a mano o reescritura de rutas en el propio
workflow de despliegue tras el build) — más frágil y no es lo que documenta `vite-react-ssg`.

## Verificación (estado final, con `vite.config.ts` revertido)

### Build normal (sin `PAGES_BASE_PATH`) — CERO regresión frente al `main` original
Las CINCO puertas en verde:
```
✓ Puerta del cascarón: ...
✓ Puerta de placeholders: ...
✓ Puerta de contraste: ...
✓ Puerta de terceros: ...
✓ Puerta de anclas vivas: ...
```
`dist/index.html`, extraído con `readFileSync` + regex (no jsdom):
```
marca link: <a href="/" class="_marca_1s54z_23">Nails Lash Studio</a>
scripts: [ '/assets/app-B1Dws2Nl.js' ]
asset links (primeros 5): [
  '/assets/app-7Fnp8UvN.css',
  '/assets/equipo-nail-art-rojo-D-scHKME.jpg',
  ...
]
```
Byte a byte idéntico al comportamiento anterior: `href="/"`, assets en `/assets/...`.

### Build bajo subruta (`PAGES_BASE_PATH=/NailsLashStudioWeb/`) — NO REALIZADO
No se pudo verificar porque el mecanismo que lo produciría (`base` dinámico en `vite.config.ts`)
está revertido por el bloqueo de arriba. Pendiente de la decisión del humano sobre la
recomendación.

### Suite completa, typecheck, lint
- `pnpm typecheck` → 0 errores.
- `pnpm lint` → 0 errores.
- `pnpm test` → **1301/1301** (mismo recuento que antes de empezar). Ningún test tuvo que
  cambiarse: el `href="/"` de la marca no estaba aseverado literalmente en ningún test de
  `Cabecera.tsx`, tal y como anticipaba la tarea.

## Ficheros tocados (estado final)
- `src/main.tsx` — cambio aplicado y verificado (queda).
- `src/components/Cabecera.tsx` — cambio aplicado y verificado (queda).
- `vite.config.ts` — cambio aplicado, verificado que rompe F-05, **revertido**; solo queda un
  comentario explicativo apuntando a este informe.

## Remate — puerta ampliada y subruta desbloqueada a MEDIAS (2026-07-25)

Sesión de `tdd_craftsman` tras la ENMIENDA 1 de `features/cero_terceros.feature` (@s27, gherkin_author,
2026-07-25). Encargo en dos partes: (1) implementar por TDD la regla ampliada de `violacionesDeBase`
y (2) retomar el `base: process.env.PAGES_BASE_PATH ?? '/'` en `vite.config.ts` bajo el supuesto de
que la puerta ya ampliada lo dejaría pasar. **Parte 1 completa y verde. Parte 2 sigue BLOQUEADA — no
por lo que el bloqueo original decía, sino por dos causas nuevas, medidas, ninguna de las dos
arreglable dentro del alcance de esta tarea.**

### Parte 1 — `violacionesDeBase` ampliada por TDD (COMPLETA)

Dos ciclos Rojo-Verde-Refactor sobre `src/lib/puerta-terceros.ts`:

1. **Ciclo 1** — ROJO: se añadieron los casos `/subcarpeta/` y `/NailsLashStudioWeb/` esperando
   código 0 (antes daban 1). VERDE mínimo: `base !== BASE_PROPIA` → `!base.startsWith(BASE_PROPIA)`.
2. **Ciclo 2** — ROJO: se añadió el caso `//cdn.tercero.com/` esperando código 1; con el cambio del
   ciclo 1 (`startsWith('/')` a secas) ese caso pasaba por error (protocolo-relativo también empieza
   por `/`). VERDE: se añadió la exclusión `!base.startsWith('//')` (constante
   `PREFIJO_PROTOCOLO_RELATIVO`), extraída a la función nombrada `esRutaPropiaRootAbsoluta`.

**Trazabilidad — @s27 (8 filas de la tabla amendada) → test, en `src/lib/puerta-terceros.test.ts`**:
- fila 1 (`no declara base` → 0) → `it('@s27 un vite.config.ts que no declara base no emite...')`
- filas 2-4 (`/`, `/subcarpeta/`, `/NailsLashStudioWeb/` → 0) → `it.each` "es una ruta same-origin
  root-absoluta: no emite ninguna violación por base"
- filas 5-8 (`https://cdn.evil.example/x/`, `https://cdn.tercero.com/`, `//cdn.tercero.com/`, `./`
  → 1) → `it.each` "rompe el build con una línea propia que NOMBRA vite.config.ts"

No se implementó un tercer término `!base.includes('://')` (el que la prosa del `.feature` describe
como uno de "los tres literales"): con las 8 filas reales, ese término es lógicamente redundante con
`startsWith('/')` — ninguna URL con esquema explícito puede empezar por `/` (RFC 3986) — así que
añadirlo habría sido producción sin un test que lo exigiera (Ley 3). Queda razonado en el comentario
de `esRutaPropiaRootAbsoluta`. `pnpm typecheck`, `pnpm lint` y `pnpm test` (suite completa,
**1303/1303**) en verde con este cambio.

### Parte 2 — `base: process.env.PAGES_BASE_PATH ?? '/'` en `vite.config.ts` (SIGUE BLOQUEADA)

Se aplicó el cambio literalmente pedido y se midió con builds reales. **El build SIN
`PAGES_BASE_PATH` rompe igual que antes de la Parte 1** — la ampliación de @s27 NO lo arregla,
porque el problema nunca fue "qué valores literales de `base` se aceptan" (eso es lo que la
enmienda amplió), sino que `violacionesDeBase` lee el TEXTO CRUDO de `vite.config.ts` **sin
evaluarlo** (a propósito — está escrito así en el propio `.feature`, sin tocar por la enmienda:
*"No se importa la config: se lee como texto"*). El texto de una expresión dinámica
(`process.env.PAGES_BASE_PATH ?? '/'`) nunca empieza por `/` — SIEMPRE empieza por `process` —, así
que la puerta la marca como violación **sin importar el valor real de la variable de entorno**, esté
definida o no:

```
✗ vite.config.ts — base debe no declararse o ser una ruta same-origin root-absoluta:
  "process.env.PAGES_BASE_PATH ?? /"
```

**Esto NO es un hueco que se pueda cerrar ampliando `violacionesDeBase` otra vez**: hacer que la
puerta "confíe" en un patrón `?? literal` sin evaluarlo reabriría exactamente el hueco que F-05
existe para cerrar (una variable de entorno controlada por el pipeline de CI podría apuntar a
cualquier origen, y la puerta —que por diseño NO lee `process.env`— no podría verlo). Evadir la
regex con un truco sintáctico ya se consideró y se **descartó** en el informe original de esta
tarea, por la misma razón: sería deshonesto con el propósito de la puerta.

🔴 **HALLAZGO NUEVO, más grave que el original**: incluso con un `base` que SÍ pasara la puerta de
terceros (ampliada aquí), medí `PAGES_BASE_PATH=/NailsLashStudioWeb/ pnpm build` (con
`MSYS_NO_PATHCONV=1` para evitar que Git Bash reescribiera la variable como ruta de Windows — sin
ese workaround, `PAGES_BASE_PATH` llega mutilada a un valor absurdo tipo
`/Program Files/Git/NailsLashStudioWeb/`) y el build rompe en una puerta **distinta y anterior en
el pipeline**:

```
✗ / — href interno sin fichero en dist/: "/NailsLashStudioWeb/"
✗ Puerta del cascarón: el build de producción NO puede publicarse.
```

Causa: `src/lib/puerta-cascaron.ts` (F-01, feature `done`, mutación 100%, fuera de todo alcance
autorizado en esta tarea) verifica que cada `href` interno del HTML horneado corresponda a un
fichero real dentro de `dist/`. Con `base` fijado a una subruta, `import.meta.env.BASE_URL` (usado
en `Cabecera.tsx` para el enlace de la marca, cambio de la sesión anterior) resuelve a
`/NailsLashStudioWeb/`, pero el fichero sigue físicamente en `dist/index.html` — GitHub Pages DE
PROYECTO resuelve esa subruta a nivel de SERVIDOR/hosting, no reorganizando `dist/` en una
subcarpeta. La puerta de F-01, tal y como está escrita, no conoce ese matiz y lo marca como enlace
roto. Arreglarlo exigiría tocar `puerta-cascaron.ts` (otra feature cerrada, sin escenario que lo
autorice aquí) — exactamente el mismo tipo de límite que ya declaró A-27 de F-05 para
`puerta-placeholders.ts`.

**Acción tomada**: `vite.config.ts` se dejó SIN el `base` dinámico (mismo estado que el bloqueo
original), con un comentario actualizado que apunta a este remate en vez de repetir el hallazgo
viejo. Verificado de nuevo con `dist/` limpio: **`pnpm build` normal → 0 errores, las CINCO puertas
en verde**, `dist/index.html` byte a byte igual (`href="/"` en la marca, scripts y assets en
`/assets/…`) — CERO regresión frente al estado antes de esta sesión.

### Recomendación (una sola, para que decida `craftsman_lead`/el humano)

El plan de despliegue ya en marcha (`progress/deploy_github_pages.md`: repo hecho público, GitHub
Pages activado por API, `.github/workflows/deploy-pages.yml` ya escrito asumiendo que
`PAGES_BASE_PATH` funciona) **no se puede completar solo con F-05**. Hacen falta, como mínimo, DOS
enmiendas más, cada una con su propio escenario aprobado por el humano:
1. Una forma de que `violacionesDeBase` reconozca el valor REAL que tomará `base` en el build de
   CI sin dejar de ser una función pura que no evalúa `process.env` arbitrariamente — por ejemplo,
   que el HUMILDE (`tools/puerta-terceros.ts`, sin lógica hoy) resuelva `process.env.PAGES_BASE_PATH`
   él mismo y pase el valor YA RESUELTO como si fuera el texto de `base`, en vez de que la pura lea
   el fichero fuente tal cual. Es un cambio de arquitectura, no una fila más en la tabla.
2. Una enmienda a `features/puerta_cascaron.feature` (F-01, `done`) que enseñe a
   `violacionesDeEnlaces` a resolver los `href` internos QUITÁNDOLES el prefijo de `base` antes de
   comprobar que el fichero existe en `dist/`.
Ninguna de las dos está autorizada por el `.feature` que esta sesión tenía en mano (`cero_terceros`,
@s27) ni por el alcance que se me dio (`puerta-terceros.ts`, su test y `vite.config.ts`). Quedan
declaradas, no resueltas — igual que la deuda de F-01 que A-27 ya declaró y no cerró.

## Remate final — subruta desbloqueada de verdad, 2026-07-25

Sesión de `tdd_craftsman` sobre las DOS enmiendas ya aprobadas y en disco: ENMIENDA 1 de
`features/cero_terceros.feature` (@s27, implementada por la sesión anterior, intacta) y ENMIENDA 1
de `features/cascaron_semantico.feature` (@s36/@s37/@s38, `gherkin_author`, 2026-07-25). Cierra las
DOS causas que el remate anterior dejó declaradas y no resueltas. **Estado final: DESBLOQUEADO.**

### 1. `baseDeclarada` exportada (`src/lib/puerta-terceros.ts`)
Solo visibilidad: `function baseDeclarada` → `export function baseDeclarada`. Cero cambio de lógica
(su cuerpo no se tocó). Sin test nuevo: es un cambio de visibilidad sobre una función ya cubierta al
100 % por `puerta-terceros.test.ts`, y ningún escenario nuevo la ejercita distinto.

### 2. La puerta anti-404 consciente de `base` (`src/lib/puerta-cascaron.ts`) — TDD estricto

Dos ciclos Rojo-Verde-Refactor sobre `violacionesDeEnlaces`:

**Ciclo 1 — @s36 (RED que resultó trivial, y quedó documentado como tal):** se añadió el
`describe('inspeccionarSitio → la puerta ANTI-404 bajo una base declarada (@s36, @s37, @s38)')`
completo (5 tests) llamando a `inspeccionarSitio(paginas, rutasEsperadas, base)` con un tercer
argumento que la firma de 2 parámetros no tenía. Al correr `vitest`, las DOS filas de @s36 pasaron
YA EN ROJO-QUE-NO-LO-ERA (el motor de tests de Vitest no aplica `tsc` estricto en runtime — solo
transpila —, así que un argumento de más no rompe la ejecución; y la regla de hoy ya marca cualquier
ruta desconocida como violación, con o sin `base`), pero @s37 (las dos filas) y @s38 fallaron de
verdad: 3/5 tests en rojo, confirmado con la salida de `vitest run` antes de tocar producción. VERDE
mínimo: se añadió `base: string | null` como TERCER parámetro con DEFAULT `null` a
`inspeccionarSitio`, threading hasta `violacionesDeLaPagina` y `violacionesDeEnlaces` (sin default
ahí — internas, siempre reciben el valor explícito), y una función nombrada nueva `esEnlaceRoto` que
implementa los 3 casos: sin `base` → comportamiento IDÉNTICO a hoy; con `base` y el href tiene su
prefijo → se compara el RESTO (tras quitarlo) contra `rutasDelArtefacto`, prependiendo `/` salvo que
el resto sea vacío (entonces es la home `/`); con `base` y el href NO tiene el prefijo → `false` (NO
es violación, fuera del ámbito de esta puerta). Este único cambio hizo pasar @s36 (por la razón
correcta ahora: el resto de un href con prefijo pero sin ruta lógica SIGUE fallando), @s37 (las dos
filas: el resto vacío resuelve a `/`, que existe; y el href sin prefijo queda fuera de ámbito) y @s38
(el resto genérico `/servicios`, no solo la home) — los 5 tests, verdes.

**Ciclo 2 — el cableado de `PeticionPuertaCascaron`/`ejecutarPuertaDelCascaron` (RED real):** se
añadió un segundo `describe('ejecutarPuertaDelCascaron → la base de despliegue se propaga a la
anti-404 (@s37)')` con 2 tests contra la función de MÁS ALTO NIVEL (la que cablea el humilde
`tools/puerta-cascaron.ts`), uno pasando `base: '/NailsLashStudioWeb/'` en la petición (esperando
exit 0 con el enlace de marca real `/NailsLashStudioWeb/`) y otro SIN el campo `base` (esperando que
el MISMO href siga rompiendo el build — ancla la cero regresión de @s23). El primero falló en rojo
(`codigoSalida` 1 en vez de 0, porque `PeticionPuertaCascaron` no tenía campo `base` y
`inspeccionarArtefacto` nunca lo pasaba a `inspeccionarSitio`). VERDE mínimo: se añadió el campo
OPCIONAL `readonly base?: string | null` a `PeticionPuertaCascaron` y `const { ..., base = null } =
peticion` en `inspeccionarArtefacto`, pasándolo a `inspeccionarSitio`. Sin tocar ningún llamador
existente (`ejecutarPuertaDelCascaron({ artefacto, rutasEsperadas })`, sin `base`, sigue compilando y
significa "sin base declarada").

**REFACTOR:** ninguno necesario más allá de nombrar `esEnlaceRoto` y `RAIZ_DEL_ARTEFACTO` desde el
principio (se escribieron ya con nombre revelador en el ciclo VERDE, sin números mágicos).

**Trazabilidad — @s → test:**
- @s36 (con prefijo, resto que NO es ruta lógica → sigue violación) →
  `it.each` "@s36 con base declarada, un href con su prefijo pero sin ruta lógica tras él sigue
  siendo violación" (2 filas: `/NailsLashStudioWeb/inexistente`, `/NailsLashStudioWeb/Servicios`)
- @s37 (con prefijo y resto = ruta lógica → NO violación; SIN prefijo con base declarada → fuera de
  ámbito, NO violación) → `it.each` "@s37 con base declarada, ... no produce violación anti-404" (2
  filas: `/NailsLashStudioWeb/`, `/otra-cosa`) + el par de tests de
  `ejecutarPuertaDelCascaron → la base de despliegue se propaga a la anti-404 (@s37)` (el enlace REAL
  de la marca, con y sin `base` en la petición — ancla el cableado de producción y la cero regresión)
- @s38 (resto genérico, no solo la home) → `it` "@s38 con base declarada, el resto tras el prefijo se
  resuelve como CUALQUIER ruta lógica, no solo la home" (fixture de dos rutas: `/` y `/servicios`)
- @s23/@s24 (sin `base`, el caso de hoy) → **NINGÚN test existente se tocó.** Los ~30 call sites de
  `inspeccionarSitio(paginas, rutasEsperadas)` y los de `ejecutarPuertaDelCascaron({ artefacto,
  rutasEsperadas })` sin `base` siguen compilando y pasando sin cambio de una sola línea — el default
  `null` en ambos niveles es exactamente lo que lo permite.

### 3. `tools/puerta-cascaron.ts` (el humilde)
Importa `baseDeclarada` de `../src/lib/puerta-terceros.ts` (mismo patrón de import relativo con
extensión `.ts` explícita que ya usa el resto del repo bajo el type-stripping de Node 22), lee
`vite.config.ts` con `readFileSync` (mismo patrón que `tools/puerta-terceros.ts`) y pasa
`base: baseDeclarada(readFileSync('vite.config.ts', 'utf8'))` a `ejecutarPuertaDelCascaron`. Sin
lógica propia, sin test propio, fuera de `mutate` — el mismo contrato que ya tenía este fichero.

### 4. `vite.config.ts` — `base` literal fija
`base: '/NailsLashStudioWeb/'` como literal simple, SIN condicional ni variable de entorno (decisión
del `craftsman_lead`: no hay dominio propio todavía, es temporal hasta que el cliente pague y se
despliegue en servidor propio). Confirmado que `vitest.config.ts` es un fichero separado sin `base`
declarado: los 1310 tests de la suite ven siempre `import.meta.env.BASE_URL === '/'`, sin excepción.

### 5. Verificación de build REAL bajo `/NailsLashStudioWeb/` (el ÚNICO build que existe ya)
`pnpm build` con `dist/` limpio → **exit 0, las CINCO puertas en verde**, incluida:
```
✓ Puerta del cascarón: las 1 ruta(s) del artefacto llevan horneados el idioma, el title, la
description, la canónica, un h1, los landmarks y el JSON-LD, y ningún enlace interno apunta a la
nada.
```
Inspección de `dist/index.html` con `readFileSync` + regex (nunca jsdom):
- Enlace de marca: `<a href="/NailsLashStudioWeb/" class="_marca_1s54z_23">Nails Lash Studio</a>`
- Script: `/NailsLashStudioWeb/assets/app-BTzMgq7U.js`
- Assets (primeros 5): todos prefijados `/NailsLashStudioWeb/assets/...`
La puerta anti-404 NO lo marca como roto — confirmado por la línea `✓ Puerta del cascarón` sin
ninguna línea `✗` en la salida del build.

### 6. `pnpm typecheck`, `pnpm lint`, `pnpm test` (suite completa)
- `pnpm typecheck` → 0 errores.
- `pnpm lint` (ESLint) → 0 errores.
- `pnpm test` → **1310/1310** (1303 de antes de esta sesión + 7 tests nuevos: 5 de
  `inspeccionarSitio` para @s36/@s37/@s38 + 2 de `ejecutarPuertaDelCascaron` para el cableado de
  `base`/cero regresión de @s37). Ningún test existente se modificó ni se borró.
- `pnpm format:check` (Prettier) sale con avisos en 183 ficheros del repo, la MAYORÍA nunca tocados
  por esta sesión (`README.md`, `project-spec.md`, decenas de `progress/*.md`, componentes ajenos a
  esta tarea): es ruido preexistente de terminaciones de línea CRLF/LF del checkout de Windows (`git
  diff` avisa "CRLF will be replaced by LF" incluso en ficheros que esta sesión NO editó), no una
  regresión introducida aquí. Fuera del checklist de esta tarea (`typecheck`/`lint`/`test`), y no se
  tocó ningún fichero ajeno para "arreglarlo".

### Ficheros tocados en este remate
- `src/lib/puerta-terceros.ts` — `baseDeclarada` exportada (sin cambio de lógica).
- `src/lib/puerta-cascaron.ts` — `esEnlaceRoto` (nueva), `violacionesDeEnlaces`,
  `violacionesDeLaPagina`, `inspeccionarSitio` y `PeticionPuertaCascaron`/`inspeccionarArtefacto`
  con el parámetro `base` threading, con default `null` en los dos niveles públicos para cero
  regresión.
- `src/lib/puerta-cascaron.test.ts` — 7 tests nuevos (@s36/@s37/@s38 + el cableado de `base` en
  `ejecutarPuertaDelCascaron`), `violacionesPorRegla` con un 4º parámetro opcional `base`.
- `tools/puerta-cascaron.ts` — importa `baseDeclarada`, lee `vite.config.ts`, pasa `base` resuelto.
- `vite.config.ts` — `base: '/NailsLashStudioWeb/'` literal.

### Estado final
**DESBLOQUEADO.** El plan de despliegue de GitHub Pages DE PROYECTO (`.github/workflows/deploy-pages.yml`,
ya escrito por una sesión anterior, fuera del alcance de esta tarea y no tocado) puede completarse:
`pnpm build` produce un artefacto autocontenido bajo `/NailsLashStudioWeb/`, con las cinco puertas —
incluida la anti-404 ahora consciente de `base` — verificando que ningún enlace interno real apunta
a la nada. `@s23`/`@s24` de `cascaron_semantico.feature` y `@s26` de `cero_terceros.feature` (el caso
"sin base declarada", que sigue siendo el comportamiento por defecto) quedan intactos y verificados
por la suite completa en verde.

## Remate — 4 supervivientes matados (2026-07-25)

Sesión de `tdd_craftsman` tras `progress/mutation_subruta_github_pages.md` (FAIL, 99.35% combinado,
4 supervivientes, todos dentro de `esEnlaceRoto`, `src/lib/puerta-cascaron.ts:582-600`). Tarea directa,
sin entrada en `feature_list.json`, sobre las mismas dos ENMIENDAs ya `done`/aprobadas por el `judge`.

### Ciclo 1 (mutantes 1 y 2, línea 593, la guarda) — fila nueva en `@s37`, sin cambio de producción

**ROJO/VERDE atípico, documentado como tal:** el hueco era de la SUITE, no del código — la puerta
ya se comportaba correctamente para el caso que faltaba. Se añadió una fila a la tabla `Examples` de
`@s37` en `features/cascaron_semantico.feature` (href `/pagina-que-no-tiene-nada-que-ver-con-la-base`,
45 caracteres, NO empieza por `base` = `/NailsLashStudioWeb/` Y es MÁS LARGA que `base`, a diferencia
de la fila existente `/otra-cosa`, 10 caracteres — más corta que `base`, por lo que
`"/otra-cosa".slice(20)` da `''` y no ejercitaba de verdad la guarda) y su fila correspondiente en el
`it.each` de `src/lib/puerta-cascaron.test.ts`. Corrida contra el código real: **VERDE de entrada**
(`pnpm exec vitest run src/lib/puerta-cascaron.test.ts` → 211/211).

Para cumplir la Ley 2 (un test que no demuestra nada no sirve) se verificó el mordisco a mano,
aplicando temporalmente los DOS mutantes exactos del informe sobre `esEnlaceRoto` y corriendo solo
`@s37`:
- `if (!ruta.startsWith(base))` → `if (false)`: la fila nueva pasó a ROJO
  (`expected [] but got [{ ruta: '/', regla: 'href interno sin fichero en dist/', valor:
  '/pagina-que-no-tiene-nada-que-ver-con-la-base' }]`); el resto de `@s37` (incluida `/otra-cosa`)
  siguió VERDE, confirmando que la fila nueva es la única que distingue este mutante.
- `if (!ruta.startsWith(base)) { return false }` → `if (!ruta.startsWith(base)) {}` (bloque vacío):
  mismo resultado, mismo mensaje de fallo.

Revertidos los dos cambios manuales inmediatamente después de confirmar el rojo — nunca quedaron en
el árbol de trabajo. **Ningún código de producción se tocó en este ciclo** (Ley 1 y Ley 3: no había
ningún test rojo contra el código real que lo pidiera).

### Ciclo 2 (mutantes 3 y 4, línea 599, el ternario) — REFACTOR puro, en verde

Con la suite en verde (1311/1311 tras el Ciclo 1), se simplificó la línea 599:

```diff
- return !rutasDelArtefacto.has(resto === '' ? RAIZ_DEL_ARTEFACTO : `${RAIZ_DEL_ARTEFACTO}${resto}`)
+ return !rutasDelArtefacto.has(`${RAIZ_DEL_ARTEFACTO}${resto}`)
```

Justificación (ya razonada por el `mutation_tester`, no reinventada aquí): la identidad de
JavaScript `X + '' === X` hace que `${RAIZ_DEL_ARTEFACTO}${resto}` sin condicional dé el mismo
resultado que el ternario para CUALQUIER `resto`, incluido `resto === ''`. Elimina estructuralmente
el `ConditionalExpression` y el `StringLiteral` de la condición — no queda nada ahí que Stryker
pueda mutar. Se añadió un comentario corto remitiendo a `progress/mutation_subruta_github_pages.md`.
Re-corrida la suite completa tras el cambio: **1311/1311**, sin roturas — confirma que ningún test
de `@s36`/`@s37`/`@s38` dependía del brazo literal `RAIZ_DEL_ARTEFACTO` como valor distinto de la
concatenación, tal y como predecía la identidad algebraica.

### Trazabilidad — @s → test (delta de este remate)

- @s37 (fila nueva: href sin prefijo Y más largo que `base` → fuera de ámbito, no violación) →
  fila `/pagina-que-no-tiene-nada-que-ver-con-la-base` en el `it.each` "@s37 con base declarada...".
  Mata los mutantes 1 y 2 (línea 593), confirmado por aplicación manual y reversión.
- @s36/@s37/@s38 (resto de filas, sin cambio) → sin tocar; siguen verdes tras el refactor de la
  línea 599 (prueba de que el refactor no alteró comportamiento).

### Verificación de cierre

- `pnpm test` (suite completa) → **1311/1311** (1310 previos + 1 fila nueva de `@s37`).
- `pnpm typecheck` → 0 errores. `pnpm lint` → 0 errores.
- `node tools/mutate.mjs src/lib/puerta-cascaron.ts` → **100.00%** (493 killed + 4 timeout / 497,
  **0 supervivientes**, 0 exclusiones). `src/lib/puerta-terceros.ts` no se tocó en este remate,
  sigue en 100% (117/117) desde la medición anterior. Detalle completo en
  `progress/mutation_subruta_github_pages.md` §Remate.
- `pnpm build` con `dist/` borrado primero → exit 0, CINCO puertas verdes. `dist/index.html`:
  marca `<a href="/NailsLashStudioWeb/" class="_marca_1s54z_23">Nails Lash Studio</a>`, script
  `/NailsLashStudioWeb/assets/app-BTzMgq7U.js` — byte a byte igual que antes de este remate, cero
  regresión del comportamiento real.

### Ficheros tocados en este remate
- `features/cascaron_semantico.feature` — 1 fila nueva en la tabla `Examples` de `@s37`.
- `src/lib/puerta-cascaron.test.ts` — 1 fila nueva en el `it.each` de `@s37`.
- `src/lib/puerta-cascaron.ts` — línea 599 refactorizada (ternario redundante eliminado), comentario
  añadido. Sin cambio de comportamiento (verificado: 1311/1311 tests intactos).
