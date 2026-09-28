# TDD — F-04 `cascaron_semantico`, ENMIENDA 4 (@s42, @s43, @s44) — 2026-09-28

> Autor: `tdd_craftsman`. Contrato: `features/cascaron_semantico.feature` (banner «ENMIENDA 4» y
> escenarios @s42 `:1777`, @s43 `:1790` y @s44 `:1807`), `project-spec.md` §Feature 4 → «Enmienda 4
> (2026-09-28)». Precedentes: `progress/tdd_cascaron_enmienda2.md`, `progress/tdd_cascaron_enmienda3.md`
> y `progress/judge_cascaron_enmienda2.md` §4 («Punto 4»). Decisión del HUMANO (AskUserQuestion del
> 2026-09-28: «Sí, modo producción»). No he cambiado el contrato: se cumple tal cual.
>
> Precondición: F-04 sigue `done` en `feature_list.json` y NO se toca, igual que en las ENMIENDAS 1-3.
> Mientras trabajaba, el lead hizo dos commits: `d278666` (solo `feature_list.json`, Nailbot) y `36920d7`
> (judge de la ENMIENDA 3). Este último solo añade un comentario al banner de la ENMIENDA 3 del `.feature`:
> he comprobado que @s42-@s44 siguen idénticos a los que leí (solo se desplazan 6 líneas).

## Estado: VERDE

| Fichero                                 | Cambio                                                                                                                                                                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/pages/home-horneado.test.ts`       | `env: { ...process.env, NODE_ENV: 'production' }` en el `execSync` del `beforeAll`. 4 tests de bytes de @s42. `modulosDeLaApp` filtra la extracción de @s39, que se reutiliza; `bundleDeLaApp` y `apariciones`. Constante `PREFIJO_DE_ASSETS` (REFACTOR). Cabecera |
| `src/pages/contacto-horneado.test.ts`   | El mismo `env` en su `execSync`. 4 tests de bytes de @s43, con la extracción de `<script>` escrita AQUÍ (mismo criterio que @s39; el fichero no importa `src/` ni otro test). Cabecera                                                                             |
| `src/lib/trampas-del-horneado.test.tsx` | El mismo `env` en el `execSync` de `construirExperimento`, que es el único que construye. La medición del bundle va DENTRO de ese helper y viaja en `Experimento`. 4 `it.each` × 5 filas escritas a mano (`FILAS_DE_S44`). Cabecera                                |
| `progress/current.md`                   | Nota de arranque y resultado                                                                                                                                                                                                                                       |

No he tocado nada de producción (`src/` fuera de los tests), ni `vite.config.ts`, `vitest.config.ts`,
`vitest.stryker.config.ts`, `stryker.config.json`, `harness.config.json`, `feature_list.json`, el
`.feature`, la spec o Nailbot. No he hecho commit.

## Trazabilidad

- **@s42** (home-horneado; ancla «Lo que dicen nuestras clientas»):
  - 1er `Then`, exactamente 1 `<script type="module">` con `src` `/NailsLashStudioWeb/assets/app-….js` → `src/pages/home-horneado.test.ts:355`.
  - 2º `Then`, el fichero existe, pesa > 0 bytes y contiene el ancla → `src/pages/home-horneado.test.ts:359`.
  - 3er `Then`, 0 `jsxDEV` → `src/pages/home-horneado.test.ts:368`.
  - 4º `Then`, 0 `fileName:` seguido de `"`, `'` o `` ` `` → `src/pages/home-horneado.test.ts:372`.
  - La corrección que lo hace cumplir → `src/pages/home-horneado.test.ts:31`.
- **@s43** (contacto-horneado; ancla «625 22 33 66»):
  - 1er `Then` → `src/pages/contacto-horneado.test.ts:244`.
  - 2º `Then` → `src/pages/contacto-horneado.test.ts:248`.
  - 3er `Then` → `src/pages/contacto-horneado.test.ts:258`.
  - 4º `Then` → `src/pages/contacto-horneado.test.ts:262`.
  - La corrección → `src/pages/contacto-horneado.test.ts:37`.
- **@s44** (los 5 experimentos; ancla «Av. de Atenas 75, Local 41»): cada `it.each(FILAS_DE_S44)`
  recorre las 5 filas del `Examples:` (`react19-nativa`, `head-espacio`, `head-mayusculas`,
  `head-atributo`, `head-correcto`), escritas a mano en `src/lib/trampas-del-horneado.test.tsx:408`.
  - 1er `Then` → `src/lib/trampas-del-horneado.test.tsx:417`.
  - 2º `Then` → `src/lib/trampas-del-horneado.test.tsx:424`.
  - 3er `Then` → `src/lib/trampas-del-horneado.test.tsx:436`.
  - 4º `Then` → `src/lib/trampas-del-horneado.test.tsx:443`.
  - La medición, en el helper por el que pasa todo build → `src/lib/trampas-del-horneado.test.tsx:199-200`.
  - La corrección → `src/lib/trampas-del-horneado.test.tsx:190`.

Lo que ya aseveraban los tres ficheros sigue VERDE con el build en producción. Eso incluye @s32/@s33 (las
dos trampas), @s39-@s41, F-10, F-12 y F-14.

## Ciclos Rojo → Verde → Refactor

Línea base (artefacto de HEAD, `NODE_ENV=test` heredado): `dist/assets/app-C6U4pjd1.js`, 262 070 B, con
368 `jsxDEV` y 365 `fileName:"…"`, las cifras del contrato.

Orden por fichero: 1er ancla → 2º ancla → negativa `jsxDEV` → negativa `fileName:` → la línea del `env`.
Las anclas nacen VERDES en home y contacto, como exige el contrato («con sus dos anclas ya en verde»).
Para demostrar que no pasan en vacío saboteé cada una EN EL TEST y restauré desde copia después de cada
sabotaje. **Las dos negativas se vieron ROJAS ANTES de tocar el `env`**, como pedía el lead (ver
Decisión 1).

### @s42 — `src/pages/home-horneado.test.ts`

**Ciclo 1, 1er ancla (`:355`).** Añadí `modulosDeLaApp()` (la `modulosDelBundle()` de @s39 más el
filtro `app-`) y este test. Nace VERDE. Sabotaje: prefijo `app_` →
`AssertionError: expected [] to have a length of 1 but got +0`.

**Ciclo 2, 2º ancla (`:359`).** Añadí `bundleDeLaApp()`: quita el prefijo del `src` y lee bajo el
`dist/assets/` de este build, nunca por glob. Nace VERDE. Tres sabotajes, los tres en ROJO:

| Sabotaje (en el test)                                      | ROJO                                                                         |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| el literal de la app mínima (`Av. de Atenas 75, Local 41`) | `expected '…' to contain 'Av. de Atenas 75, Local 41'` (y volcaba el bundle) |
| leer bajo `dist/` en vez de `dist/assets/`                 | `ENOENT: no such file or directory, open '…/dist/app-C6U4pjd1.js'`           |
| resolver al `client-*.js` (otro chunk)                     | `expected 'import{r as LT,…' to contain 'Lo que dicen nuestras clientas'`    |

**Ciclo 3, 0 `jsxDEV` (`:368`).** ROJO sobre el artefacto `NODE_ENV=test`:

```
× @s42 esos mismos bytes contienen exactamente 0 apariciones de "jsxDEV"
AssertionError: expected 368 to be +0 // Object.is equality
 ❯ src/pages/home-horneado.test.ts:363:53
```

**Ciclo 4, 0 `fileName:` (`:372`).** ROJO, todavía sin tocar el `env`:

```
AssertionError: expected 368 to be +0 // Object.is equality
 ❯ src/pages/home-horneado.test.ts:363:53
AssertionError: expected 365 to be +0 // Object.is equality
 ❯ src/pages/home-horneado.test.ts:368:61
      Tests  2 failed | 20 passed (22)
```

(`fileName:"/home/user/NailsLashStudioWeb/src/components/MenuNavegacion.tsx"`, etc.)

**VERDE.** Una sola línea: `execSync('pnpm build', { stdio: 'pipe', env: { ...process.env, NODE_ENV:
'production' } })`. Resultado: 22/22 y bundle `app-CWmDYxle.js` de 164 751 B, el mismo nombre (hash de
contenido) que deja `pnpm build` directo.

**REFACTOR (en verde, 22/22 tras cada paso):**

1. El 2º ancla pasa de `toContain` a `apariciones(bundle, /…/g) >= 1`, el mismo contador que las
   negativas. Un `toContain` fallido volcaba cientos de KB de bundle en el informe (se vio en el sabotaje
   A). Repetí el sabotaje A: `expected 0 to be greater than or equal to 1` en `:365`.
2. Constante `PREFIJO_DE_ASSETS = '/NailsLashStudioWeb/assets/'`. El literal se repetía 3 veces: en la
   `modulosDelBundle()` de @s39, en `modulosDeLaApp()` y en el `slice` de `bundleDeLaApp()`. Sigue siendo
   un literal escrito a mano.
3. Cabecera del fichero actualizada a @s39-@s42. `prettier --write` solo partió una línea.

### @s43 — `src/pages/contacto-horneado.test.ts`

**Ciclo 1, 1er ancla (`:244`).** Escribí aquí la extracción, con el mismo criterio que @s39: `ATRIBUTO`,
`atributosDe`, `scripts()` y `modulosDeLaApp()`. Nace VERDE sobre `app-C6U4pjd1.js`, que es modo test.
Dos sabotajes, ambos con `expected [] to have a length of 1 but got +0`: prefijo `app_` y `type`
comparado con `'Module'`.

**Ciclo 2, 2º ancla (`:248`).** `bundleDeLaApp()` y `apariciones()`. El ancla ya se escribe contando
(lo aprendido en el REFACTOR de @s42). Nace VERDE. Tres sabotajes, los tres en ROJO: el literal de la app
mínima (`expected 0 to be greater than or equal to 1`), leer bajo `dist/` (`ENOENT … dist/app-C6U4pjd1.js`)
y leer el `client-*.js` (`expected 0 to be greater than or equal to 1`).

**Ciclos 3 y 4 (`:258`, `:262`).** ROJO, todavía sin tocar el `env`:

```
× @s43 esos mismos bytes contienen exactamente 0 apariciones de "jsxDEV"
× @s43 esos mismos bytes contienen exactamente 0 apariciones de "fileName:" seguido de una comilla (", ' o `)
AssertionError: expected 368 to be +0 // Object.is equality
 ❯ src/pages/contacto-horneado.test.ts:255:53
AssertionError: expected 365 to be +0 // Object.is equality
 ❯ src/pages/contacto-horneado.test.ts:260:61
      Tests  2 failed | 19 passed (21)
```

**VERDE.** El mismo `env` en su `execSync` → 21/21, bundle `app-CWmDYxle.js`.

**REFACTOR.** Cabecera del fichero (F-12 más F-04 @s43). `prettier --write` no cambió nada.

### @s44 — `src/lib/trampas-del-horneado.test.tsx`

Aquí la medición va en el HELPER `construirExperimento`, como exige el contrato. Por eso los ROJOS de
las anclas son de verdad: el experimento todavía no traía la medición.

**Ciclo 1, 1er ancla (`:417`).** Escribí el `it.each` con las 5 filas escritas a mano. ROJO ×5:
`AssertionError: Target cannot be null or undefined.` (`:340`). VERDE: la extracción, escrita aquí con el
criterio de @s39 (`ATRIBUTO`, `atributosDe`, `modulosDeLaApp(html)`), y el campo
`Experimento.modulosDeLaApp` que rellena el helper. 15/15. Sabotaje: prefijo de la app real
`/NailsLashStudioWeb/assets/` en vez de `/assets/` → ROJO ×5,
`expected [] to have a length of 1 but got +0`.

**Ciclo 2, 2º ancla (`:424`).** ROJO ×5:
`TypeError: Cannot read properties of undefined (reading 'length')` (`:394`). VERDE:
`leerBundleDeLaApp(dir, modulos)` en el helper, justo después de leer el HTML de ESE build, y el campo
`Experimento.bundleDeLaApp`. 20/20. Tres sabotajes:

| Sabotaje (en el test)                                        | ROJO                                                                                                                                                             |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| el literal de la app real (`Lo que dicen nuestras clientas`) | ×5 `expected 0 to be greater than or equal to 1`                                                                                                                 |
| leer el `client-*.js` del experimento                        | ×5 `expected 0 to be greater than or equal to 1`                                                                                                                 |
| leer bajo `dist/` en vez de `dist/assets/`                   | `ENOENT … .experimentos-tmp/react19-nativa/dist/app-Ba7jxfaF.js` en el `beforeAll`: `Test Files 1 failed`, los 20 tests saltados (falla cerrada; ver Decisión 4) |

**Ciclos 3 y 4 (`:436`, `:443`).** ROJO ×10, todavía sin tocar el `env`. Son las cifras del contrato:

```
Tests  10 failed | 20 passed (30)
  react19-nativa jsxDEV    AssertionError: expected 13 to be +0
  head-espacio / head-mayusculas / head-atributo / head-correcto jsxDEV
                           AssertionError: expected 14 to be +0   (vitest agrupa los 4 errores iguales)
  react19-nativa fileName  AssertionError: expected 10 to be +0
  head-* (×4) fileName     AssertionError: expected 11 to be +0
 ❯ src/lib/trampas-del-horneado.test.tsx:417:73  (jsxDEV)  y  :425:81  (fileName)
```

**VERDE.** `env: { ...process.env, NODE_ENV: 'production' }` en el `execSync` que construye cada
experimento → 30/30, incluidas las 10 de @s32/@s33. Medido sobre los artefactos:

| Experimento       | `app-*.js`        | Bytes  | `jsxDEV` | `fileName:` | Ancla |
| ----------------- | ----------------- | ------ | -------- | ----------- | ----- |
| `react19-nativa`  | `app-D946Yd8C.js` | 83 684 | 0        | 0           | 1     |
| `head-espacio`    | `app-BYpc6tA3.js` | 95 213 | 0        | 0           | 1     |
| `head-mayusculas` | `app-BYpc6tA3.js` | 95 213 | 0        | 0           | 1     |
| `head-atributo`   | `app-BYpc6tA3.js` | 95 213 | 0        | 0           | 1     |
| `head-correcto`   | `app-BYpc6tA3.js` | 95 213 | 0        | 0           | 1     |

Las cuatro `head-*` pesan 95 213 B, la cifra que midió el lead fuera del repo, y comparten hash: en
producción el bundle ya no depende de la ruta del disco. El `execFileSync` de la puerta NO se toca,
porque no construye (y ninguna puerta lee `NODE_ENV`: lo comprobé con grep en `tools/` y en
`src/lib/puerta-*.ts`).

**REFACTOR (en verde, 30/30):**

1. La lista de 5 filas se repetía en los 4 `it.each`. La extraje a `FILAS_DE_S44`, una constante escrita
   a mano con un comentario que prohíbe `experimentos.keys()`. Sabotaje de «fila no construida»
   (`head-correcto` → `head-correcta`): ROJO en las 4 de esa fila con
   `TypeError: Cannot read properties of undefined (reading 'modulosDeLaApp')` y similares. Restaurado.
2. Cabecera del fichero con @s44. El comentario de `leerBundleDeLaApp` declara la falla cerrada a través
   del `beforeAll`. `prettier --write` no cambió nada.

## Decisiones y su porqué

1. **Las dos negativas de cada escenario se vieron ROJAS antes de la corrección. Declaro la desviación
   de «un test a la vez».** La corrección es UNA línea (el `env`) y pone en verde las dos negativas a la
   vez. Si hubiera hecho ROJO → VERDE con `jsxDEV`, la negativa de `fileName:` habría nacido verde, y para
   verla roja habría tenido que revertir el `env` (sabotaje). El lead pidió expresamente que cada
   negativa fallara ANTES de cambiar el `env`, y el contrato dice que «nacen en ROJO sobre los artefactos
   de hoy». Por eso escribí la 2ª negativa con la 1ª todavía roja. Cada test se escribió y se ejecutó
   solo, y ninguno se adelanta a otro escenario.
2. **Un contador (`apariciones`, `matchAll` con `g`) para las anclas y para las negativas.** El `Then`
   dice «exactamente 0 apariciones», así que se cuenta, y el fallo dice CUÁNTAS (368, 13…) sin volcar el
   bundle. `matchAll` lanza si la regex no lleva `g`, así que un olvido cae en ROJO, nunca en un recuento
   falso de 1. Las anclas «contiene el literal» son `>= 1` con el MISMO contador y sobre la misma lectura.
3. **«La misma cadena leída».**
   - En home y contacto, las anclas y las negativas llaman a la misma función (`bundleDeLaApp()`:
     extracción, resolución y lectura), que lee el mismo fichero del mismo `dist/`.
   - En trampas la lectura se hace UNA vez, en el helper, y viaja en `Experimento.bundleDeLaApp`. Los
     cuatro `it` leen ese mismo string.
   - En ningún caso hay glob: el fichero se resuelve siempre desde el `src` del `<script type="module">`
     del HTML que el propio fichero acaba de leer.
4. **Trampas: si falta el bundle, se cae el `beforeAll` entero.** `leerBundleDeLaApp` lanza si no hay
   módulo o fichero. Con 0 módulos, `src = ''` resuelve al directorio y da EISDIR. Así caen el fichero y
   sus 30 tests (vitest los marca saltados, con `Test Files 1 failed` y exit ≠ 0). Es falla CERRADA y
   coincide con lo que el fichero ya hacía si el build de un experimento lanzaba. No añadí un
   `existsSync` ni un «si no hay módulo, ''»: ningún test lo pedía (Ley 3), y los dos acabarían en ROJO
   igualmente.
5. **La extracción está escrita tres veces**: la de @s39 en home, que se reutiliza, y una copia en
   contacto y otra en trampas. El contrato lo exige: estos ficheros no importan `src/` ni otro test, y
   importar un test registraría su `beforeAll`. En las tres el criterio es el mismo: nombres en
   minúsculas, tres formas de comillas, gana el primer nombre repetido y nunca una subcadena de la
   etiqueta.
6. **Literales a mano.** Son `'module'`, `'/NailsLashStudioWeb/assets/'`, `'/assets/'`, `app-`, `'.js'`,
   `/jsxDEV/g`, ``/fileName:["'`]/g``, «Lo que dicen nuestras clientas», «625 22 33 66» y «Av. de Atenas
   75, Local 41». Ninguno se deriva de `vite.config.ts`, del manifiesto de Vite, de `import.meta.env` ni de
   `HOME_CON_HEAD`/`HOME_CON_METADATA_NATIVA`.

## NO-MUTABLE, declarado por escrito

No hay ningún fichero mutable nuevo ni se toca `stryker.config.json`. Lo que cambia es el LANZAMIENTO de
tres tests build-based (el `env` de su `execSync`) y sus aserciones de bytes. Son ficheros de test,
fuera de `mutate`, y **`vitest.stryker.config.ts` sigue excluyéndolos**. Lo comprobé con el propio
recolector de Vitest:

- `pnpm exec vitest list --filesOnly` (config base) → 47 ficheros, con `home-horneado`,
  `contacto-horneado` y `trampas-del-horneado`.
- `pnpm exec vitest list --filesOnly --config vitest.stryker.config.ts` → 44 ficheros, ninguno de los
  tres. `trampas-del-horneado.test.tsx` casa con `**/*-horneado.test.{ts,tsx}` (`*` = `trampas-del`).
  `src/lib/horneado.test.ts` (unitario, sin guion delante) sigue dentro, como debe.

Su defensa son los ROJOS de arriba (las tres negativas nacieron rojas sobre los artefactos de hoy, con
las anclas ya verdes y probadas con sabotajes) y el `judge`. No se lanza `mutate` para esta enmienda
porque no hay lógica mutable nueva.

## Coste medido (`bin/harness init`, una corrida antes y una después)

| Corrida                                       | Total (reloj) | `Duration` de vitest | `tests` de vitest | Ficheros | Tests |
| --------------------------------------------- | ------------- | -------------------- | ----------------- | -------- | ----- |
| ANTES (HEAD, sin cambios, `NODE_ENV=test`)    | 96,3 s        | 84,58 s              | 45,26 s           | 47/47    | 1507  |
| DESPUÉS (3 ficheros en producción, +28 tests) | 90,0 s        | 78,49 s              | 39,96 s           | 47/47    | 1535  |

No sube: baja unos 6 s. La explicación plausible es que el build de producción emite menos JS (164 751 B
frente a 262 070 B en la app real, y 95 213 B frente a ~150 800 B en cada experimento). Con una sola
corrida por lado no afirmo que sea más rápido; afirmo que **no es más caro**. Las corridas aisladas por
fichero apuntan a lo mismo: home pasa de 8,57 s a 7,39 s y trampas de 19,73 s a 16,65 s (`Duration` de
vitest, en modo test y en producción). 1535 = 1507 + 4 (@s42) + 4 (@s43) + 20 (@s44, 4 × 5 filas).

## Resultados de la verificación final

- `pnpm typecheck` → exit 0. `pnpm lint` → exit 0, sin avisos.
- `pnpm exec prettier --check` pasa en los tres ficheros de test, en `progress/current.md` y en este
  diario.
- `bin/harness init` → **exit 0**: lint OK, **47/47 ficheros y 1535/1535 tests**.
- `pnpm build` directo → **exit 0**, con las 5 puertas en ✓ (cascarón, placeholders, contraste,
  terceros con «hornea los 6 pares de fuente», y anclas). Vite: «building client environment for
  production». `dist/` queda en PRODUCCIÓN: `app-CWmDYxle.js`, 164 751 B, 0 `jsxDEV` y 0 `fileName:`.
  - Una suite del lead (`bin/harness test`, en este mismo repo) volvió a escribir `dist/` a las 12:09:37.
    Esperé a que terminara, para no pisarle el `dist/` compartido a mitad de sus tests build-based, y
    relancé `pnpm build` directo a las 12:13:06. Resultado: exit 0, las 5 puertas en ✓, «for
    production», `app-CWmDYxle.js` de 164 751 B con 0/0. Ese es el `dist/` que dejo.
- **El artefacto de los tests es el de producción.** Reproduje fuera de vitest el entorno exacto que
  hereda el subproceso (ver abajo: `MODE=test`, `BASE_URL=/`, `DEV=1`, `PROD=`, `SSR=1`, `VITEST=true`)
  con `NODE_ENV=production`. Comparé por sha256 sus 32 ficheros de `dist/` (sin `index.html`) con los de
  `pnpm build` directo:
  - los 30 de código, CSS, fuentes e imágenes son **idénticos byte a byte**;
  - solo difieren los 2 `static-loader-data*`, que llevan en el nombre el hash aleatorio por build
    (`__VITE_REACT_SSG_HASH__`, `Math.random()`). El JSON de datos tiene el mismo sha256.
  - Dentro de vitest los dos `beforeAll` también dejaron `app-CWmDYxle.js`, el mismo hash de contenido.

## Observado, fuera del alcance (para el lead)

- **Vitest exporta también `MODE=test` al entorno, y vite-react-ssg lo lee ANTES que `NODE_ENV`.**
  - Vitest 4.1.10 (`cli-api.BK8pd4xc.js:14171-14173`) copia `viteConfig.env` a `process.env` con `??=`.
    Medido en un worker con una sonda desechable: `{"MODE":"test","NODE_ENV":"test","BASE_URL":"/",
"DEV":"1","PROD":"","SSR":"1","VITEST":"true"}`.
  - Como `mode = process.env.MODE || process.env.NODE_ENV || …` (`vite-react-ssg.DsKK_1op.mjs:704`),
    con la decisión del humano el modo de Vite de los builds de test sigue siendo `test` (su log dice
    «building client environment for test»). `import.meta.env.MODE` valdría `'test'` y se cargaría un
    `.env.test` si existiera (hoy no hay ningún `.env*`).
  - **No afecta a lo que miden @s42-@s44 ni al artefacto de hoy.**
    - El JSX de desarrollo lo decide `isProduction = process.env.NODE_ENV === 'production'` de Vite
      (`vite/dist/node/chunks/config.js:35614`, `jsxDev: !isProduction` en `:35692`), igual que
      `import.meta.env.PROD`/`DEV` y el `process.env.NODE_ENV` que se define para React.
    - Nada en `src/` lee `import.meta.env.MODE` (solo `BASE_URL`, que sale de `base`), y los bytes son
      idénticos a los de `pnpm build` directo (arriba).
  - No lo he «arreglado» quitando `MODE` del entorno: el contrato dice «con el resto del entorno
    heredado». El banner atribuye el modo solo a `NODE_ENV=test`, pero en realidad lo fijaba `MODE=test`.
    Si algún día algo depende de `import.meta.env.MODE`, divergiría en silencio. Cerrarlo (p. ej. con
    `MODE: 'production'` también) sería una enmienda del humano con su propio escenario.
- `progress/tdd_cascaron_enmienda3.md` aparecía modificado al empezar la sesión. No era mío: lo commiteó el
  lead en `36920d7`.
