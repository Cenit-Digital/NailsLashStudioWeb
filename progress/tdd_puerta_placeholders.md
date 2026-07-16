# TDD — Feature 1 `puerta_placeholders`

> Bitácora del `tdd_craftsman`. Contrato: `features/puerta_placeholders.feature`
> (26 escenarios, aprobado en la puerta humana). **Un escenario = un ciclo
> Rojo → Verde → Refactor.** Se escribe según avanza, no al final.

## Decisiones de diseño (tomadas antes del ciclo 1, con el contrato en la mano)

1. **Dos módulos, porque el contrato fija dos capas** (cabecera del `.feature`):
   - `src/lib/placeholders.ts` — la INSPECCIÓN. Función pura
     `detectarPlaceholders(entrada) → Violacion[]`. No lee ficheros, ni el reloj,
     ni el entorno, ni decide exit codes.
   - `src/lib/puerta.ts` — la PUERTA. Lee (a través de un puerto de sistema de
     ficheros inyectado), invoca la inspección y devuelve `{ codigoSalida, lineas }`.
   - `tools/puerta-placeholders.ts` — el *humble object*: cablea `node:fs` real y
     `process.exit`. Sin decisiones: todo lo que decide vive en `puerta.ts`, que
     está testeado y mutado.
2. **Los tests conviven con el código** (`src/lib/*.test.ts`): `vitest.config.ts`
   tiene `include: ['src/**/*.{test,spec}.{ts,tsx}']`. Un test en `tests/` no se
   ejecutaría.
3. **Anti-tautología**: los 6 patrones se escriben **a mano** en los tests. No se
   importa `PATRONES_PROHIBIDOS`. Precedente WebEmpresa: el fake de `useIsMobile`
   usando `MOBILE_QUERY` en vez del literal → primer mutante superviviente.
4. **El `modo` es un parámetro de la puerta**, no una lectura de `process.env`:
   así `@s14` (dev no falla) es testeable y aparece el `&&` de «producción Y hay
   violaciones» que `feature_list.json` exige que muera.

## Ciclos

### Ciclo 1 — `@s1` (flag: violación con vía, ubicación y valor)

- **Rojo**: `@s1 un registro marcado esPlaceholder produce una violación con vía,
  ubicación y valor`. Falla por no compilar/importar: `src/lib/placeholders.ts` no
  existe (Ley 2: no importar cuenta como fallar).
- **Verde**: el módulo con `detectarPlaceholders` recorriendo `registros` y
  empujando una violación por registro. **Mínimo deliberado: ignora el flag.**
- **Refactor**: nada que limpiar todavía.

### Ciclo 2 — `@s2` (flag `false` + contenido real → sin violación)

- **Rojo**: `AssertionError: expected [ { via: 'flag', …(3) } ] to deeply equal []`.
  Rojo **por el motivo correcto**: el ciclo 1 no miraba el flag.
- **Verde**: `if (registro.esPlaceholder === true)`.
- **Refactor**: —

### Ciclo 3 — `@s24` (registro de JSON que no declara el flag → violación que dice que FALTA)

- **Rojo**: `expected [] to have a length of 1`. `=== true` no caza `undefined`.
- **Verde**: `motivoDelFlag()` con **falla cerrada**: solo un `false` explícito
  absuelve; `true` → `'marcado'`, ausente → `'sin_declarar'`. El motivo distingue
  «FALTA» de «false», que es justo lo que pide el Then.
- **Detalle**: el test construye el registro con `JSON.parse` de verdad, no con un
  cast. Es literalmente el Given («cargado desde JSON»): el tipo exige el flag en
  compilación, pero a los datos que llegan de un `.json` el tipo no los protege.
- **Refactor**: se extrae `motivoDelFlag` fuera del bucle (función corta, nombre
  revelador).

### Ciclo 4 — `@s3` (entrada vacía → lista vacía)

- **Rojo**: **no hubo**. El test pasó a la primera porque `entrada.registros ?? []`
  ya cubría el caso. `docs/tdd.md` dice: un test que pasa a la primera no demuestra
  nada → **se verificó a mano que muerde**, mutando `?? []` a `!`:
  `FAIL @s3 … Tests 1 failed | 3 passed`. Restaurado → verde. El mutante de Stryker
  sobre `??` morirá aquí.
- **Verde/Refactor**: sin cambios de producción (Ley 1: no había test rojo que los
  pidiera).

### Ciclo 5 — `@s4` (los seis patrones prohibidos, Scenario Outline ×6)

- **Rojo**: `Tests 6 failed | 4 passed`. No existía ni el campo `ficheros` ni la
  vía por patrón.
- **Verde**: `PATRONES_PROHIBIDOS` (los 6 literales) + `contenido.includes(patron)`.
  **Mínimo deliberado: comparación literal.** `@s5` forzará la familia TELÉFONO y
  `@s7` la familia TEXTO.
- **Refactor**: —
- **Nota para `@s25`**: hoy la lista de patrones está en el **bucle exterior**. Es
  el orden equivocado y `@s25` lo matará: ahí se invierte a «por posición en el
  contenido».

### Ciclo 6 — `@s5` (el teléfono no escapa por espaciado, guiones ni prefijo)

- **En curso.**

---

# Segunda sesión — la capa de la PUERTA (`@s12`–`@s19`, `@s22`)

> Retoma el artesano de la puerta. La capa PURA está commiteada y verde
> (31 tests). Alcance encargado: los 9 escenarios de la puerta.

## AVISO 0 — el encargo parte de un recuento equivocado (verificado)

El lead encarga 9 escenarios diciendo que hay **17 cubiertos** (`@s1`–`@s11`,
`@s20`, `@s21`, `@s23`, `@s24`, `@s25`, `@s26`). **Son 14**, no 17.

`@s20`, `@s21` y `@s26` **NO tienen test**: aparecen únicamente dentro de
*comentarios* de `placeholders.test.ts` (líneas 235 y 98: «Es la PUERTA (@s20,
@s21, @s26) quien se niega a pasar por vacuidad»). Un `grep '@s[0-9]'` sobre el
fichero los cuenta; un `grep` sobre los títulos de `it(...)` no. Comprobado:

```
todos los @s citados en el fichero : @s1..@s11 @s20 @s21 @s23 @s24 @s25 @s26  (17)
solo los de títulos de it(...)     : @s1..@s11 @s23 @s24 @s25                 (14)
```

Cuenta: 14 cubiertos + 9 encargados = 23. **Faltan 3 de 26**: `@s20`, `@s21`,
`@s26` — y son de **mi capa** (la puerta: «falla cerrada» / A-8). La capa pura no
puede cubrirlos por construcción; el propio contrato lo dice en `@s3`.

**Decisión: hago mis 9 y NO escribo los 3.** Escribir código de guarda sin un
test rojo que lo pida viola la Ley 1 y el encargo prohíbe adelantar escenarios.
Se lo reporto al lead: la feature **no puede cerrarse como completa** con 23/26.

**Consecuencia de diseño que arrastra:** `@s21`/`@s26` son quienes definen qué es
un «fichero inspeccionable» (`@s26`: «3 hojas de estilo inspeccionables»;
`@s21`: «no contiene ningún fichero inspeccionable»). Sin esos escenarios NO
implemento filtro por extensión: la puerta lee todo lo que hay bajo `dist/`.
Hoy `dist/` no tiene binarios y funciona; con imágenes habría que cerrarlo.

## Decisiones de diseño de la puerta (heredo las 4 de la sesión 1)

Se respetan las decisiones 1-4 ya commiteadas (dos módulos, tests co-locados,
anti-tautología, `modo` como parámetro). Añado:

5. **La puerta no toca `node:fs`: recibe un puerto `SistemaDeFicheros`**
   (`listarFicheros(dir)`, `leer(ruta)`). El doble de test es un sistema de
   ficheros en memoria **fiel** (filtra por prefijo de directorio, como el real).
   Importa que la fidelidad esté en el doble y la **decisión de qué directorio
   mirar** en producción: si el doble filtrara «lo de dist» por su cuenta, `@s19`
   no probaría nada.
6. **`@s18` sin mecanismo de exclusión.** Ver AVISO 1 abajo.
7. **El humilde `tools/puerta-placeholders.ts`** cablea `node:fs` y `node:process`
   y se engancha a `pnpm build`. Se ejecuta con el *type stripping* de Node 22
   (`--experimental-strip-types`), verificado en esta máquina (v22.15.0).

## AVISO 1 — `@s18`: la respuesta a la trampa es NO tener mecanismo

`@s18` («el escaneo excluye el propio código de la puerta») + la advertencia
«que la exclusión no abra un agujero». **Comprobado en el repo**: nadie importa
`src/lib/placeholders.ts` desde la app (`grep` en `src/**`), así que el módulo
**no entra en el bundle** y `dist/` está limpio de los 6 literales (verificado).

Como la puerta escanea `dist/` (que es lo que exige `@s19`), el módulo de la
puerta —que vive en `src/`— **nunca está en el conjunto escaneado**. Por tanto:

- No hace falta lista de exclusión, ni por ruta, ni por patrón, ni por «se parece
  al módulo». **El agujero no se abre porque no se cava.**
- Un `if (ruta.includes('placeholders')) continue` sería justo el coladero que el
  encargo prohíbe: excluiría `dist/assets/placeholders-<hash>.js` real.

`@s18` y `@s19` son **dos caras de la misma decisión**: la raíz del escaneo. El
test de `@s18` monta el módulo de la puerta *con los 6 literales* en `src/lib/` y
exige 0 violaciones y salida 0. Muerde: si alguien mueve la raíz del escaneo a
`.`, `@s18` y `@s19` caen a la vez. Queda anotado en el ciclo correspondiente si
llega verde a la primera (precedente del ciclo 4 / `@s3`).

## Ciclos de la puerta

### Ciclo P1 — `@s12` (producción con una violación → código ≠ 0)

- **Rojo**: `Error: Failed to resolve import "./puerta"`. No compila/importa → cuenta
  como fallar (Ley 2).
- **Verde**: `ejecutarPuerta()` lista `dist/`, lee, invoca `detectarPlaceholders` y
  devuelve `{ codigoSalida, lineas }`. **Trampa deliberada: `codigoSalida: 1` constante**
  (`docs/tdd.md`: «está permitido devolver una constante si aún no hay test que lo
  desmienta»). `@s13` la desmiente en el ciclo siguiente.
- **Refactor**: —

### Ciclo P2 — `@s13` (artefacto limpio + datos todos `false` → código 0)

- **Rojo**: `AssertionError: expected 1 to be +0`. Rojo **por el motivo correcto**: cae
  justo la constante del ciclo P1.
- **Verde**: `violaciones.length > 0 ? CODIGO_FALLO : CODIGO_EXITO`. Sin números mágicos
  (`docs/conventions.md`). **Mínimo: todavía sin mirar el `modo`** — lo fuerza `@s14`.
- **Refactor**: —
- **Mutantes que este test mata**: el `> 0` (a `>= 0`) y la constante.

### Ciclo P3 — `@s14` (desarrollo con placeholders → código 0, y conserva la imagen)

- **Rojo**: `AssertionError: expected 1 to be +0`. El ciclo P2 rompía también en dev.
- **Verde**: aparece el `&&` que el contrato quiere muerto:
  `modo === 'produccion' && violaciones.length > 0`.
- **Refactor**: se extrae a `rompeElBuild`, que nombra la decisión.
- **Mutantes que mata**: `&&` → `||` (con `||`, dev con placeholders rompería y `@s14` cae).
- **Nota**: «conserva la imagen» se asevera sobre el contenido del artefacto tras la
  llamada. Hoy es estructural (el puerto `SistemaDeFicheros` es de solo lectura: no tiene
  `escribir`), pero codifica D-8 y muerde si alguien le diera a la puerta capacidad de
  «arreglar» el artefacto borrando placeholders.

### Ciclo P4 — `@s15` (el informe acusa: causa, ubicación y valor)

- **Rojo**: `AssertionError: expected 'flag esPlaceholder' to contain 'legal.nif'`. La línea
  **gruñía** en vez de acusar — exactamente lo que el comentario del escenario prohíbe.
- **Verde**: `describirViolacion` compone `<causa> en <ubicacion>: "<valor>"`.
- **Refactor**: —
- **Nota de diseño**: `lineas` = **una línea por violación**, ni una más. Lo fija `@s15`
  («la salida contiene exactamente **2 líneas de violación**»): si `lineas` llevara además
  un resumen, serían 3. Por eso el mensaje de «todo limpio» NO vive aquí (ver P9).

### Ciclo P5 — `@s16` (literal a mano en la plantilla, ausente de los datos)

- **Rojo**: **no hubo** — verde a la primera. La máquina ya existía (P1 inspecciona datos
  Y artefacto): `@s16` no pide maquinaria nueva, garantiza la **composición de las dos
  vías**. Precedente del ciclo 4 (`@s3`): se verifica a mano que muerde.
- **Comprobado que muerde**: mutando la llamada a `detectarPlaceholders({ registros })`
  (la puerta ignora el artefacto) → **3 rojos**: `@s12`, `@s15`, `@s16`. Restaurado → verde.
- **Corrección durante el ciclo**: la primera redacción metía `href` + texto y producía **2**
  violaciones, cuando el contrato dice «exactamente 1». Se ajustó el test al contrato, no
  el contrato al test.

### Ciclo P6 — `@s17` (data: URI inlinado → lo caza el flag)

- **Rojo**: **no hubo** — verde a la primera, misma razón que P5. `@s17` es la GARANTÍA de
  que la vía por flag no depende del empaquetador (D-5).
- **Comprobado que muerde**: mutando a `detectarPlaceholders({ ficheros })` (la puerta
  ignora los datos) → **2 rojos**: `@s15`, `@s17`. Restaurado → verde.
- **El Given, aseverado**: el test comprueba que la cadena `ph-woman` **no aparece** en el
  artefacto inlinado antes de nada. Sin esa aserción, el patrón podría estar cazando la
  violación y el test «pasaría» sin probar que el flag es la garantía.

### Ciclos P7-P8 — `@s18` y `@s19` (la raíz del escaneo, dos caras de lo mismo)

- **Rojo**: **no hubo** — verde a la primera: la decisión (`DIRECTORIO_ARTEFACTO = 'dist'`)
  ya estaba tomada en P1. Son escenarios de **regresión sobre la raíz del escaneo**.
- **⚠ El «verifica que muerde» cazó un fallo REAL en mi propio montaje.** Al mutar la raíz
  a `'.'`, `@s18` y `@s19` **seguían verdes**: el doble filtraba con
  `ruta.startsWith('./')` y para `'.'` devolvía **la lista vacía** → 0 ficheros → 0
  violaciones → salida 0. Los dos escenarios que existen justo para fijar la raíz **pasaban
  por vacuidad**. El doble mentía.
  - **Arreglado**: el doble trata la raíz (`'.'` o `''`) como «devuelve TODO», que es lo que
    hace un `readdir` recursivo real.
  - **Re-verificado**: con el doble fiel, mutar `'dist'` → `'.'` pone **rojos `@s18` y
    `@s19`**, y solo ellos. Restaurado → verde.
  - *Lección*: un doble infiel convierte un escenario en decorado. La regla «un test que
    pasa a la primera no demuestra nada» no es paranoia: aquí valía dos escenarios.
- **`@s18` tiene dos aristas** (dos tests, mismo escenario):
  1. el módulo de la puerta con los 6 literales, en `src/lib/`, **no se inspecciona**
     (0 violaciones, salida 0) — no por exclusión, sino porque no está en `dist/`;
  2. **anti-coladero**: un fichero empaquetado `dist/assets/placeholders-BYbDMLiU.js` que
     *se parece* al módulo **SÍ se caza**. Este test mata la implementación tramposa
     `if (ruta.includes('placeholders')) continue`, que es el agujero que el encargo
     advierte. Verificado: muere con la mutación de la raíz.

---

# Tercera sesión — los 3 de la falla cerrada (`@s20`, `@s21`, `@s26`)

> Cierra el bloque «La puerta: falla cerrada (A-8 y modos de error)». Alcance
> encargado: **exactamente 3 escenarios**. Los otros 23 están verdes (43 tests) y
> no se reimplementan. Punto de partida medido: `pnpm test` → **43 passed**.
>
> Confirmo el recuento del lead contra el AVISO 0 de la segunda sesión: coincide.
> `@s20`, `@s21` y `@s26` eran los 3 que la sesión 2 dejó fuera **a propósito**
> (Ley 1: no hay guarda sin test rojo que lo pida). Ahora sí hay encargo.

## Decisiones de diseño de esta sesión (tomadas antes del ciclo T1)

Heredo las 7 anteriores. Añado:

8. **El puerto `SistemaDeFicheros` gana `existeDirectorio(directorio)` y documenta
   qué hace `listarFicheros` con un directorio inexistente: LANZA.** Es la
   respuesta al AVISO 1 (ver abajo). El contrato del puerto se escribe en la
   interfaz, que es donde el doble y el real lo pueden leer los dos.
9. **Los guardas de falla cerrada NO miran el `modo`.** Ningún escenario describe
   «desarrollo con `dist/` ausente»: `@s20`/`@s21`/`@s26` dicen los tres «se
   ejecuta el build de producción». Un `modo === 'produccion' &&` en los guardas
   sería código que ningún test rojo pidió (Ley 1) **y** un mutante inmortal
   (AVISO 4). Se queda fuera. Límite declarado, no descuido.
10. **Sin filtro por extensión.** Ver AVISO 3 abajo: lo razono y lo dejo escrito.

## AVISO 1 (del lead) — resuelto: el doble mentiría, y se arregla en el PUERTO

El lead tiene razón y lo he verificado leyendo `tools/puerta-placeholders.ts`:
`readdirSync(dir, {recursive:true})` sobre un directorio inexistente **lanza
ENOENT**. Con el código de hoy esa excepción cae en el `catch` de `ejecutarPuerta`
y produce la línea de `@s22` («no pudo completar la inspección»), **no** la de
`@s20` («no había nada que inspeccionar»). Un doble que devolviera `[]` sin más
haría pasar `@s20` mientras producción se comporta distinto: el fallo de P7-P8
otra vez, que allí costó dos escenarios.

**Decisión: el puerto declara el caso en vez de dejarlo a la casualidad.**

- `existeDirectorio(directorio): boolean` — nuevo método. La puerta **pregunta
  antes** de listar, y por eso nunca provoca el ENOENT.
- `listarFicheros(directorio)` — se documenta en la interfaz que **lanza** si el
  directorio no existe, que es lo que hace `readdirSync` de verdad. No es un
  detalle del real: es el contrato del puerto, y el doble lo honra igual.
- El humilde de `tools/` implementa `existeDirectorio` con `existsSync`.

Por qué esto no es decoración: si alguien borra el guarda de `@s20`, la puerta
cae a `listarFicheros`, el doble **lanza igual que el real**, sale la línea de
`@s22` y `@s20` se pone **rojo**. El guarda es matable *porque* el doble no
miente. Se verifica a mano en el ciclo T1.

**`@s20` vs `@s22` siguen distinguibles**, que es lo que pide el contrato:
«no existe el directorio» → *no había nada que inspeccionar*; «revienta al leer»
→ *no pudo completar la inspección*. Dos modos de fallo, dos mensajes.

## AVISO 3 (del lead) — razonado: NO hay filtro por extensión, y por qué

`@s21` dice «no contiene ningún **fichero inspeccionable**» y `@s26` «3 hojas de
estilo **inspeccionables**». La pregunta es si eso obliga ya al filtro.

**No, y no lo escribo.** Un directorio **vacío** satisface el Given de `@s21` al
pie de la letra: no contiene ningún fichero inspeccionable porque no contiene
ninguno. Y `@s26` se satisface con 3 `.css` que **sí** se inspeccionan. Ninguno
de los dos escenarios distingue «fichero inspeccionable» de «fichero»: **ninguno
monta un binario y exige que se lo salten**. Sin ese escenario, un
`if (!esInspeccionable(ruta)) continue` sería producción que ningún test rojo
pidió (Ley 1) y un mutante inmortal (AVISO 4), porque nada lo mataría.

**Aviso al lead, para cuando entren las imágenes** (esto sí es riesgo real, no
teórico): hoy la puerta lee **todo** lo que cuelga de `dist/` con
`readFileSync(ruta, 'utf8')`. En cuanto `dist/` tenga `.png`/`.woff2`, un binario
se decodificará como UTF-8 y saldrá basura. No revienta (`utf8` no lanza:
sustituye por U+FFFD) y la inspección mira **contenido**, no ruta, así que un
`ph-woman0.png` no se autodelata por el nombre. Pero es un falso positivo en
potencia y, sobre todo, es trabajo perdido. **Eso necesita un escenario nuevo en
el contrato** («un binario del artefacto no se inspecciona» / «un binario no
cuenta como el HTML de entrada»). No me lo invento aquí: lo que no está escrito,
no está decidido. Queda reportado.

## AVISO 2 (del lead) — confirmado, y el fixture se arregla (no la aserción)

Verificado en `src/lib/puerta.test.ts:182`: `@s18 la exclusión del módulo no es un
coladero` monta **solo** `dist/assets/placeholders-BYbDMLiU.js`, sin
`dist/index.html`, y asevera `lineas` con `toEqual([...])` exacto. El guarda de
`@s26` lo pondrá rojo.

**Se arregla el doble, no la aserción.** El Given de `@s18` dice «un artefacto de
producción limpio», y `@s26` establece que un artefacto de producción **siempre**
tiene su `index.html` («en un sitio SSG el HTML de entrada existe SIEMPRE»).
Añadir `dist/index.html` a ese fixture lo hace **más fiel**, no más permisivo:
hoy describe un `dist/` que no puede existir. Debilitar el `toEqual` sí sería
hacer trampa, y no se toca. El `.feature` tampoco se toca.

Repaso del resto de dobles (todos en `puerta.test.ts`; `placeholders.test.ts` es
la capa pura y no usa el puerto): `@s12`, `@s13`, `@s14`, `@s15`, `@s16`, `@s17`,
`@s18`(1ª arista), `@s19` ya montan `dist/index.html`. El de `@s22` lista
`dist/index.html` y revienta al leer → intacto. **El único afectado es el
coladero de `@s18`.**

## Ciclos de la falla cerrada

### Ciclo T1 — `@s20` (el directorio del artefacto no existe)

Este ciclo tuvo **dos rojos**, y el segundo es el que importa.

- **Rojo 1 — el doble mentía, y el test lo cazó**: escribí el test con el *Given
  aseverado* (precedente P6) `expect(() => doble.listarFicheros('dist')).toThrow()`:

  ```
  AssertionError: expected [Function] to throw an error
   ❯ src/lib/puerta.test.ts:244  expect(() => artefactoInexistente.listarFicheros('dist')).toThrow()
  ```

  El doble devolvía `[]` tan tranquilo. **Sin esa línea, el test habría pasado a la
  primera y `@s20` habría sido decorado**: producción se iba por el `catch`.
- **Arreglo del doble (no de producción)**: `listarFicheros` lanza ENOENT si el
  directorio no existe, igual que `readdirSync`. Los otros 43 siguieron verdes.
- **Rojo 2 — el de verdad**, y dice literalmente lo que el lead predijo:

  ```
  AssertionError: expected 'la puerta no pudo completar la inspec…' to contain 'no había nada que inspeccionar'
  Expected: "no había nada que inspeccionar"
  Received: "la puerta no pudo completar la inspección: ENOENT: no such file or directory, scandir 'dist'"
  ```

  Con el doble fiel, producción toma el camino de `@s22`. **El doble y el real
  coinciden**: eso es lo que hacía falta antes de escribir una línea de guarda.
- **Verde**: el puerto gana `existeDirectorio` (contrato documentado en la interfaz),
  la puerta **pregunta antes de listar** y devuelve
  `no había nada que inspeccionar: no existe el directorio "dist"`. El humilde de
  `tools/` lo honra con `existsSync`. → **44 passed**.
- **Verificado que el guarda muerde — y sin tener que mutar nada a mano**: el Rojo 2
  *es* la prueba. Quitar el guarda = volver al Rojo 2 (sale la línea de `@s22` y
  `@s20` se pone rojo). El mutante `BlockStatement` que vacíe ese `if`, el
  `ConditionalExpression` a `false` y la negación quitada mueren todos ahí. El
  simétrico (`if (existeDirectorio(...))`, condición a `true`) muere en `@s13`, que
  pasaría a fallar con la línea de `@s20`.
- **`@s22` sigue verde y distinguible**: «no existe el directorio» → *no había nada
  que inspeccionar*; «revienta al leer» → *no pudo completar la inspección*. Su doble
  (objeto literal propio) recibió `existeDirectorio: () => true`: su Given es un
  directorio que **sí** existe y un fichero que revienta al leerse.
- **Refactor**: nada todavía. El guarda vive dentro del `try` a propósito: si
  `existeDirectorio` reventara, cae en falla cerrada (`@s22`) en vez de escaparse.

### Ciclo T2 — `@s21` (no ha inspeccionado ni un fichero)

- **Infraestructura de test primero**: el doble gana un parámetro `directoriosVacios`
  para poder montar un `dist/` que **existe pero está vacío** (estado real del disco).
  `existeDirectorio` lo tiene en cuenta; `listarFicheros` devuelve `[]`. El *Given
  aseverado* comprueba ambas cosas antes de nada: si el directorio no existiera, esto
  sería `@s20` y el test no probaría lo suyo.
- **Rojo**:

  ```
  AssertionError: expected +0 not to be +0 // Object.is equality
   ❯ src/lib/puerta.test.ts:302  expect(resultado.codigoSalida).not.toBe(0)
  ```

  La puerta reporta **éxito** sobre un `dist/` vacío: verde por vacuidad, justo lo que
  A-8 prohíbe. El test NO asevera un mensaje concreto: el contrato dice que no fija cuál
  de las dos razones se informa, solo que rompe y que no se reporta verde.
- **Verde (mínimo, intermedio)**: guarda `if (artefacto.length === 0)` con mensaje
  «directorio vacío». → **45 passed**. Mínimo para este ciclo: `@s26` aún no existía.
- **Refactor**: —. (La consolidación llega en T3, cuando `@s26` deja este guarda
  redundante.)

### Ciclo T3 — `@s26` (no ha inspeccionado el HTML de entrada)

- **Rojo**:

  ```
  AssertionError: expected +0 not to be +0 // Object.is equality
   ❯ src/lib/puerta.test.ts:332  expect(resultado.codigoSalida).not.toBe(0)
  ```

  3 hojas de estilo, ningún `dist/index.html`, y la puerta dice **0**: D-4 en carne y
  hueso. Inspeccionar «algo» no basta.
- **Verde**: constante `FICHERO_HTML_DE_ENTRADA = 'dist/index.html'` y guarda
  `if (!artefacto.some(f => f.ubicacion === FICHERO_HTML_DE_ENTRADA))` con mensaje
  `no se inspeccionó "dist/index.html": ...`.
- **AVISO 2 confirmado en vivo**: al añadir el guarda, `@s18-coladero` se puso rojo
  exactamente como el lead predijo —

  ```
  - "patrón \"Calle de la Belleza\" en dist/assets/placeholders-BYbDMLiU.js: ..."
  + "no se inspeccionó \"dist/index.html\": el artefacto no tiene HTML de entrada"
  ```

  **Arreglado el fixture, no la aserción**: añadido `dist/index.html` limpio al doble
  del coladero. El `toEqual` exacto se mantiene intacto; el `.feature` no se toca. Un
  artefacto de producción real siempre trae su HTML de entrada (`@s26`), así que el
  fixture ahora es **más fiel**. → **46 passed**.

- **REFACTOR — se elimina el guarda de `@s21` (duplicación), y aquí está el AVISO 4**:
  con la barra verde probé si el guarda `length === 0` de T2 seguía siendo matable
  vaciándolo a mano (mutante `BlockStatement`): **46 seguían verdes**. **Mutante
  superviviente.** El guarda de `@s26` ya cubre el caso del directorio vacío (vacío ⇒ sin
  `index.html`). Y el contrato **prohíbe** hacer el guarda de `@s21` matable por su propio
  mensaje: «El contrato NO fija cuál de las dos razones se informa —fijarlo ataría la
  implementación sin ganar nada». El propio comentario de `@s21` dice que ese estado
  «incumple también la regla de `@s26`». Conclusión: `@s21` nunca tuvo guarda propio; lo
  caza el mecanismo de `@s26`.
  - **Eliminado** el `if (artefacto.length === 0)`. `@s21` sigue verde por el guarda de
    `@s26` (mensaje «no se inspeccionó dist/index.html», que cumple sus tres aserciones:
    rompe, líneas no vacías, no dice «limpio»).
  - **Re-verificado que el guarda único muerde por partida doble**: vaciado el bloque del
    guarda de `@s26`, **`@s21` Y `@s26` caen a la vez** (`2 failed | 44 passed`).
    Restaurado → 46 verdes. El guarda es matable y no deja mutante vivo.
  - **Refactor de comentario**: la razón SSG se movió al punto de uso (el guarda) y el
    doc del const se acortó a nombrar qué ES la constante. Sin duplicación de comentario.

## Verificación de mutación (AVISO 4) — hecha por el artesano antes de entregar

`node tools/mutate.mjs src/lib/puerta.ts` →
**`puerta.ts | 100.00 | 0 survived`**, break threshold 100 cumplido. Los guardas nuevos
(`existeDirectorio`, el de `index.html`) no dejan mutante superviviente. (El
`mutation_tester` es quien tiene la última palabra; esto es diligencia del artesano,
no la sustituye.)

## Trazabilidad de los 3 encargados (`@s → test`)

- `@s20` (directorio inexistente → rompe, «no había nada que inspeccionar», no dice
  limpio) → `puerta.test.ts › @s20 la puerta falla si el directorio del artefacto de
  producción no existe`. Doble fiel: `listarFicheros` lanza ENOENT si no existe.
- `@s21` (dist/ vacío → rompe, líneas no vacías, no dice limpio) → `puerta.test.ts ›
  @s21 la puerta falla si no ha inspeccionado ni un fichero`. Lo caza el guarda de
  `@s26` (el contrato no fija el mensaje; el estado incumple la regla de `@s26`).
- `@s26` (3 hojas de estilo, sin index.html → rompe, «no se inspeccionó
  dist/index.html») → `puerta.test.ts › @s26 la puerta falla si no ha inspeccionado el
  HTML de entrada del artefacto`.

## Estado final de la sesión

- **46 tests verdes** (partía de 43; +3 escenarios). `pnpm test` limpio.
- `pnpm typecheck && pnpm lint` limpio, 0 warnings.
- `src/lib/puerta.ts` mutación **100%**, 0 supervivientes.
- Ficheros de producción tocados: `src/lib/puerta.ts` (puerto + 2 guardas),
  `tools/puerta-placeholders.ts` (cablea `existsSync`). Tests: `src/lib/puerta.test.ts`.
- **NO** commit, **NO** `feature_list.json`, **NO** `.feature`. Eso es del lead.

## Aviso al lead (reportado, no inventado)

Cuando entren las imágenes (F-0x), `dist/` tendrá binarios (`.png` de ph-woman,
`.woff2`). Hoy la puerta lee **todo** lo que cuelga de `dist/` con `readFileSync(ruta,
'utf8')`: un binario se decodifica como UTF-8 (no lanza, sustituye por U+FFFD) y es un
falso positivo en potencia además de trabajo perdido. **Ningún escenario actual monta un
binario y exige saltárselo**, así que NO he implementado filtro por extensión (Ley 1:
sería producción sin test rojo, y un mutante inmortal). Hace falta un escenario nuevo en
el contrato («un binario del artefacto no se inspecciona» / «un binario no cuenta como el
HTML de entrada») antes de cerrar ese hueco. Lo que no está escrito, no está decidido.

---

# Cuarta sesión — el superviviente de `motivoDelReventon` (`@s22`)

> Encargo del lead: **un único mutante superviviente** cerraba la puerta de mutación
> (100% exigido, medido 99.32% = 1 vivo en todo el proyecto). Alcance: matarlo por TDD
> estricto, sin tocar el `.feature`, sin exclusiones, sin bajar el umbral, sin debilitar
> aserciones. Punto de partida medido: `pnpm test` → **46 passed**.

## El superviviente y por qué vivía

```
[Survived] BlockStatement — src/lib/puerta.ts:75
  function motivoDelReventon(error: unknown): string {
-   return error instanceof Error ? error.message : String(error)
+   {}   // cuerpo vacío -> la función devuelve undefined
```

`ejecutarPuerta` compone la línea de fallo cerrado (`puerta.ts:113`):

```ts
`la puerta no pudo completar la inspección: ${motivoDelReventon(error)}`
```

El único test que cubre esa rama era `@s22`, y sus tres aserciones —código ≠ 0, la
salida contiene «no pudo completar la inspección», la salida no dice «limpio»— **pasan
todas con el cuerpo vaciado**: la línea queda `...inspección: undefined`, que sigue
conteniendo «no pudo completar la inspección». Ninguna aserción fijaba que la **causa
concreta** de la excepción aparezca. Laguna de test, no de producción.

## Decisión (heredada del lead, verificada contra el contrato)

**Se FIJA la causa en el test de `@s22`; NO se borra `motivoDelReventon`.** El
comportamiento de surfacer el motivo concreto es **deseado**, coherente con el ethos del
propio contrato: «acusar, no gruñir» (comentario de `@s15`) y «no fallar en silencio»
(D-9, comentario de `@s22`: «una puerta que puede fallar en silencio hace falsa a D-9»).
Una puerta que revienta y dice solo «no pude» —sin el porqué— obliga a buscar la causa a
mano, que es exactamente lo que la feature combate. El bullet Then de `@s22` no lo
deletrea, pero surfacer la razón concreta ES la intención del contrato. Por tanto la línea
de producción se queda como está y el test **añade** la aserción que faltaba.

Verificado que esta es la única salida legítima: borrar `motivoDelReventon` (hacer el
mutante «equivalente») haría la puerta silenciosa sobre su propia causa de fallo, en
contra de D-9. No procede. Se pinnea el comportamiento.

## ROJO real (demostrado, no supuesto)

Con el código de producción **original**, añadí a `@s22` (sin tocar el `.feature`):

- una constante `MOTIVO_DEL_REVENTON = 'EISDIR: illegal operation on a directory, read'`
  usada a la vez en el **Given** (lo que `leer()` lanza) y en el **Then** (lo que la
  salida debe surfacer): un solo literal, sin duplicación mágica (`docs/conventions.md`),
  y el Then anclado a la excepción exacta que provoca el Given;
- la aserción que faltaba: `expect(salida).toContain(MOTIVO_DEL_REVENTON)`.

Para demostrar que **muerde el mutante** (no que pasa por casualidad), apliqué el mutante
a mano —vacié el cuerpo de `motivoDelReventon` para que devuelva `undefined`— y corrí
`pnpm test`. **Solo `@s22` cae**, y por la aserción nueva:

```
FAIL  src/lib/puerta.test.ts > la puerta — falla cerrada > @s22 la puerta falla cerrada si ella misma revienta
AssertionError: expected 'la puerta no pudo completar la inspec…' to contain 'EISDIR: illegal operation on a direct…'
Expected: "EISDIR: illegal operation on a directory, read"
Received: "la puerta no pudo completar la inspección: undefined"
 Test Files  1 failed | 2 passed (3)
      Tests  1 failed | 45 passed (46)
```

Que **solo** `@s22` falle (1 failed | 45 passed) confirma que es la aserción nueva la que
mata a este mutante — las otras tres seguían pasando con `undefined`, que es justo por lo
que el mutante sobrevivía. Restaurado `motivoDelReventon` → `pnpm test` **46 passed**.

## VERDE

Código de producción **intacto** (`motivoDelReventon` como estaba) + la aserción nueva:
`pnpm test` → **46 passed**. Ninguna aserción existente debilitada; solo se añadió la que
faltaba y se extrajo el literal del Given a una constante compartida.

## Mutación — el superviviente muere, sin exclusiones ni bajar umbral

`node tools/mutate.mjs src/lib/puerta.ts` (comando oficial del arnés):

```
-----------|------------------|----------|-----------|------------|----------|----------|
           | % Mutation score |          |           |            |          |          |
File       |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------|--------|---------|----------|-----------|------------|----------|----------|
All files  | 100.00 |  100.00 |        4 |        46 |          0 |        0 |        0 |
 puerta.ts | 100.00 |  100.00 |        4 |        46 |          0 |        0 |        0 |
-----------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

**100.00%, 0 survived, break threshold cumplido.** Ese primer run, sin embargo, mató 46 de
50 mutantes por **timeout** en vez de por kill limpio (el dry-run mostró ~9.4 s de overhead
de arranque de vitest y corría con 11 procesos concurrentes: contención de arranque, no
bucles infinitos). Stryker cuenta el timeout como killed y el 100% es válido, pero un run
dominado por timeouts es justo el que podría enmascarar un vivo. Para dar un resultado
**de fiar** (el estándar que el propio encargo pide), lo reconfirmé con concurrencia baja:

`pnpm exec stryker run --mutate src/lib/puerta.ts --concurrency 2`:

```
-----------|------------------|----------|-----------|------------|----------|----------|
File       |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------|--------|---------|----------|-----------|------------|----------|----------|
All files  | 100.00 |  100.00 |       50 |         0 |          0 |        0 |        0 |
 puerta.ts | 100.00 |  100.00 |       50 |         0 |          0 |        0 |        0 |
-----------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

**Los 50 mutantes muertos por kill limpio, 0 timeout, 0 survived.** Confirmado que los
timeouts del primer run eran ambientales. En el desglose por test, `@s22` pasa a matar **5
mutantes** («@s22 … killed 5»), entre ellos el `BlockStatement` de `motivoDelReventon` que
antes vivía. Sin exclusiones en `stryker.config.json`, sin `// Stryker disable`, sin bajar
el umbral (sigue en 100), sin importar `PATRONES_PROHIBIDOS`.

## Checks finales

- `pnpm test` → **46 passed** (toda la suite verde, no solo `@s22`).
- `pnpm typecheck` → limpio. `pnpm lint` → **0 warnings**.
- `node tools/mutate.mjs src/lib/puerta.ts` → **puerta.ts 100.00%, 0 survived**
  (reconfirmado con `--concurrency 2`: 50 killed, 0 timeout).

## Trazabilidad (`@s → test`), actualizada

- `@s22` (la puerta revienta → rompe, «no pudo completar la inspección», surfacer la
  **causa concreta**, no dice «limpio») → `puerta.test.ts › @s22 la puerta falla cerrada
  si ella misma revienta`. Aserción nueva: `expect(salida).toContain(MOTIVO_DEL_REVENTON)`
  pinnea `motivoDelReventon`.

## Ficheros tocados

- **Test**: `src/lib/puerta.test.ts` — solo `@s22`: constante `MOTIVO_DEL_REVENTON`
  (compartida Given/Then) + una aserción añadida. Ninguna aserción existente debilitada.
- **Producción**: `src/lib/puerta.ts` — **sin cambios netos** (el vaciado de
  `motivoDelReventon` fue temporal, solo para demostrar el ROJO; restaurado).
- **NO** commit, **NO** `feature_list.json`, **NO** `.feature`, **NO** `stryker.config.json`.
  Eso es del lead / del `judge` / del `mutation_tester`.

---

# Quinta sesión — el superviviente del regex del teléfono (@s5, `[ -]+`)

> Encargo del lead: **un mutante superviviente CONFIRMADO** en `placeholders.ts:46`
> (el cuantificador `+` de `[ -]+`) cerraba la puerta de mutación (100% exigido). El
> arnés pide 100% y `placeholders.ts` NO lo cumplía: lo enmascaraban los timeouts a
> alta concurrencia. Alcance: cerrarlo por TDD estricto **sin tocar el `.feature`**
> (el humano ya aprobó la fila nueva de @s5 en la puerta), sin exclusiones, sin bajar
> umbral, sin debilitar aserciones. Punto de partida medido: `pnpm test` → **46 passed**.
>
> **RESULTADO DE LA SESIÓN: el `[ -]+` queda CERRADO, pero la corrida limpia de
> mutación destapó OTRO superviviente distinto** (`toLowerCase → toUpperCase`,
> línea 70). Por el protocolo del encargo («si aparece OTRO superviviente, PÁRATE
> y repórtalo ANTES de tocarlo: puede requerir decisión de contrato»), **NO lo he
> tocado** y se reporta al lead. Ver abajo.

## El superviviente encargado y por qué vivía

```
src/lib/placeholders.ts:46
-  const SECUENCIA_TELEFONICA = /\+?\d+(?:[ -]+\d+)*/g
+  const SECUENCIA_TELEFONICA = /\+?\d+(?:[ -]\d+)*/g   (mutante: `+` -> exactamente-uno)
```

El cuantificador `+` de `[ -]+` (uno-o-más separadores) no lo fijaba ningún test:
**ningún ejemplo de @s5 usaba separadores MÚLTIPLES** (espacios o guiones dobles).
Con `[ -]` (exactamente un separador), `"600  123  456"` (dos espacios) deja de
casar la secuencia entera y el teléfono inventado —el placeholder más peligroso de
la lista— escaparía con un doble espacio accidental del maquetado. El lead ya lo
confirmó a mano (con `[ -]` los 46 tests seguían verdes) y aprobó en la puerta
humana la fila nueva del contrato:

```
features/puerta_placeholders.feature, @s5 Examples, última fila:
  | 600  123  456    |     (SEPARADORES DOBLES: dos espacios entre cada grupo)
```

## Decisión (del humano, en la puerta del `.feature`): se MANTIENE el `+`

Se conserva `[ -]+` (detección robusta ante espaciado irregular) y se **fija con un
ejemplo nuevo**. El código de producción NO cambia: ya era correcto; lo que faltaba
era el test. El `.feature` **no se toca** (ya venía con la fila aprobada).

## ROJO real (demostrado contra el mutante, no supuesto)

Añadí al `it.each` de @s5 en `src/lib/placeholders.test.ts` la fila del contrato —
contenido `'600  123  456'` (dos espacios), escrito a mano (anti-tautología: no se
importa `SECUENCIA_TELEFONICA` ni `PATRONES_PROHIBIDOS`). El Then de @s5 exige
exactamente **1 violación**, patrón `"600123456"` y `valor` = el contenido tal cual.

Para demostrar que **muerde el mutante** (no que pasa por casualidad), apliqué el
mutante a mano en `placeholders.ts:46` (`[ -]+` → `[ -]`) y corrí `pnpm test`.
**Solo el nuevo caso de @s5 cae**, y por su propio contenido:

```
FAIL  src/lib/placeholders.test.ts > detectarPlaceholders — la vía por patrón >
      @s5 el teléfono inventado escrito "600  123  456" no escapa
AssertionError: expected [] to have a length of 1 but got +0
- Expected
+ Received
- 1
+ 0
 ❯ src/lib/placeholders.test.ts:83:25

 Test Files  1 failed | 2 passed (3)
      Tests  1 failed | 46 passed (47)
```

Que **solo** el caso nuevo falle (`1 failed | 46 passed`, sobre 47) confirma que es
la fila nueva la que mata a este mutante: las otras seis filas de @s5 —todas con
separador simple o sin separador— seguían verdes con `[ -]`, que es justo por lo que
el mutante sobrevivía. Restaurado `placeholders.ts:46` → `[ -]+` → `pnpm test`
**47 passed**. Producción **sin cambios netos**.

## VERDE

Código de producción **intacto** (`[ -]+` como estaba) + la fila nueva de @s5:
`pnpm test` → **47 passed**. `pnpm typecheck && pnpm lint` → limpio, **0 warnings**.
Ninguna aserción existente debilitada; solo se AÑADIÓ la fila que faltaba.

## Mutación de `placeholders.ts` — el `[ -]+` MUERE, pero aparece OTRO superviviente

`pnpm exec stryker run --mutate src/lib/placeholders.ts --concurrency 2` (y
reconfirmado a `--concurrency 1` para descartar enmascaramiento por timeout: **mismo
resultado exacto**, así que los 9 timeouts son mutantes de bucle infinito reales, no
artefactos de concurrencia):

```
-----------------|--------|---------|----------|-----------|------------|----------|----------|
File             |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------------|--------|---------|----------|-----------|------------|----------|----------|
All files        |  98.97 |   98.97 |       87 |         9 |          1 |        0 |        0 |
 placeholders.ts |  98.97 |   98.97 |       87 |         9 |          1 |        0 |        0 |
-----------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score 98.97 under breaking threshold 100  (exit 1)
```

- **El `[ -]+` está entre los 87 killed**: la fila nueva de @s5 lo cerró. Encargo
  cumplido en su parte principal.
- **El único `[Survived]` es OTRO, distinto, previamente enmascarado:**

```
[Survived] MethodExpression
src/lib/placeholders.ts:70:25
-       const equivalente = texto[i].toLowerCase().normalize('NFD').replace(DIACRITICOS, '')
+       const equivalente = texto[i].toUpperCase().normalize('NFD').replace(DIACRITICOS, '')
```

### Por qué sobrevive el `toUpperCase` (análisis) — y por qué NO lo he tocado

`normalizarTexto` (línea 65) se aplica **a las DOS caras** de la comparación: al
contenido escaneado (línea 88) **y** al patrón (línea 89), y luego se comparan con
`normalizado.indexOf(patronNormalizado)` (línea 92). Cambiar `toLowerCase()` por
`toUpperCase()` pliega **ambas** caras a mayúsculas en vez de a minúsculas: el plegado
es **simétrico**, así que la coincidencia se conserva para los 6 patrones del contrato
y para todas las filas de @s7. Además el `valor` devuelto es `contenido.slice(...)` —
el texto original, ajeno a la dirección del plegado— y el mapa `indiceOriginal` es
idéntico para todo carácter cuyo plegado alto/bajo tenga la misma longitud (cierto
para todo el dato de test). **Es un mutante de plegado simétrico: efectivamente
EQUIVALENTE para los patrones del contrato.**

Matarlo exigiría una entrada con un carácter cuyo plegado a mayúsculas y a minúsculas
**diverja en longitud o forma** de un modo que el contrato distinga — p. ej. `ß`
(`'ß'.toUpperCase() === 'SS'`, longitud 2; en minúsculas sigue siendo `'ß'`, longitud
1). Ninguno de los 6 patrones prohibidos contiene tal carácter. Añadir ese caso sería
**inventar comportamiento fuera del `.feature`** (los patrones son literales fijos del
contrato, § DOS VÍAS). Por eso —y porque el encargo lo ordena explícitamente («si
aparece OTRO superviviente distinto del `[ -]+`, PÁRATE y repórtamelo … puede que su
arreglo también requiera decisión de contrato»)— **NO lo he tocado**. Queda para
decisión del lead / puerta humana:

1. **Declararlo equivalente** y excluirlo con justificación (decisión del
   `mutation_tester` / lead; yo no toco `stryker.config.json`), o
2. **Reforzar el contrato**: fijar en el `.feature` que la comparación es
   insensible-a-caja plegando SIEMPRE a minúsculas y añadir un @s (familia TEXTO)
   con un carácter tipo `ß` que distinga `toLowerCase` de `toUpperCase`. Esto SÍ es
   una decisión de contrato (comportamiento nuevo, no cubierto hoy), y por tanto
   requiere la puerta humana antes de que yo escriba el test.

**Este es el segundo mutante que los timeouts a alta concurrencia enmascaraban** (el
lead conocía el `[ -]+`; este estaba escondido detrás). Corridas a `--concurrency 2`
y `--concurrency 1` coinciden: `placeholders.ts` = **1 survived** (el `toUpperCase`).

## Resolución (decisión del lead): se EXCLUYE como equivalente verificado

El lead reverificó y lo declaró **mutante equivalente genuino**. El repo tiene política
para esto (`docs/mutation-testing.md` §78-80: un equivalente puede excluirse **solo con
justificación explícita escrita**, que el lead deja en
`progress/mutation_puerta_placeholders.md`). La prohibición previa de `// Stryker disable`
era para el caso general de no hacer trampa; para un equivalente verificado y justificado
es la herramienta correcta y en-política.

**Exclusión QUIRÚRGICA — solo el `toLowerCase↔toUpperCase`, sin tapar el resto de la
línea 70.** Como Stryker desactiva **por línea**, se aísla `.toLowerCase()` en su propia
sentencia y el `disable` cubre solo esa línea; `normalize('NFD')` y `replace(DIACRITICOS,
'')` (y sus StringLiteral) quedan en la línea siguiente, **sin** disable, y se siguen
mutando y muriendo. `src/lib/placeholders.ts:69-73` quedó así:

```ts
// El sentido del plegado de caja es indiferente: se aplica a AMBAS caras de la
// comparación (contenido y patrón pasan por esta misma función), así que toLowerCase
// y toUpperCase dan el mismo match, y el `valor` se toma del contenido ORIGINAL, no del
// normalizado. Solo un carácter de plegado asimétrico (ß→SS) los distinguiría, y ninguno
// de los 6 patrones del contrato lo tiene: mutante equivalente. Justificado en
// progress/mutation_puerta_placeholders.md (política docs/mutation-testing.md §78-80).
// Stryker disable next-line all
const enMinuscula = texto[i].toLowerCase()
const equivalente = enMinuscula.normalize('NFD').replace(DIACRITICOS, '')
```

**El split es un no-op funcional**: `pnpm test` → **47 passed**, `pnpm typecheck && pnpm
lint` limpio, 0 warnings. Comportamiento idéntico (solo se partió una sentencia en dos).

### Mutación FINAL de `placeholders.ts` (con la exclusión) — 100%, 0 survived

`pnpm exec stryker run --mutate src/lib/placeholders.ts --concurrency 2`:

```
-----------------|--------|---------|----------|-----------|------------|----------|----------|
File             |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------------|--------|---------|----------|-----------|------------|----------|----------|
All files        | 100.00 |  100.00 |       87 |         9 |          0 |        0 |        0 |
 placeholders.ts | 100.00 |  100.00 |       87 |         9 |          0 |        0 |        0 |
-----------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100  (exit 0)
```

**100.00%, 0 survived, break threshold cumplido, exit 0.** Sin ningún bloque
`[Survived]` en la corrida. **1 mutante ignored** (el `toLowerCase↔toUpperCase`): el pool
cubierto bajó de 97 (antes: 87 killed + 9 timeout + 1 survived) a 96 (87 killed + 9
timeout + 0 survived), es decir se retiró **exactamente uno**. **Prueba de que la
exclusión es quirúrgica**: `# killed` se mantiene en **87** — si el disable hubiese tapado
`normalize`/`replace`/StringLiteral de la línea, `killed` habría bajado; no bajó, así que
esos mutantes siguen generándose y muriendo. Los 9 timeout son los mismos mutantes de
bucle infinito reales (idénticos a `--concurrency 1`), no enmascaramiento.

## Mutación de `puerta.ts` (diligencia, paso 5) — sin cambios míos en ese fichero

`pnpm exec stryker run --mutate src/lib/puerta.ts --concurrency 2`:

```
-----------|--------|---------|----------|-----------|------------|----------|----------|
File       |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------|--------|---------|----------|-----------|------------|----------|----------|
All files  | 100.00 |  100.00 |       50 |         0 |          0 |        0 |        0 |
 puerta.ts | 100.00 |  100.00 |       50 |         0 |          0 |        0 |        0 |
-----------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

`puerta.ts` = **100.00%, 50 killed, 0 timeout, 0 survived**. Sigue a 100% (el
lead ya lo había confirmado en la 4ª sesión; reconfirmado aquí a `--concurrency 2`).
No lo he tocado en esta sesión.

## Estado de la suite

- `pnpm test` → **47 passed** (46 previos + la fila nueva de @s5).
- `pnpm typecheck && pnpm lint` → limpio, **0 warnings**.

## Trazabilidad (@s → test), actualizada

- `@s5` (el teléfono no escapa por espaciado/guiones/prefijo, **incluidos separadores
  DOBLES**) → `placeholders.test.ts › @s5 el teléfono inventado escrito "%s" no escapa`,
  `it.each` con 7 filas; la 7ª (`'600  123  456'`) fija el cuantificador `+` de `[ -]+`
  y mata el mutante de `placeholders.ts:46`.

## Reconfirmación de `puerta.ts` (paso 3 del cierre) — sigue a 100%

Reejecutada tras el split de `placeholders.ts` (los tests de la puerta importan
`detectarPlaceholders`, así que se re-mide con el código nuevo, aunque sea no-op).
`pnpm exec stryker run --mutate src/lib/puerta.ts --concurrency 2`:

```
-----------|--------|---------|----------|-----------|------------|----------|----------|
File       |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------|--------|---------|----------|-----------|------------|----------|----------|
All files  | 100.00 |  100.00 |       50 |         0 |          0 |        0 |        0 |
 puerta.ts | 100.00 |  100.00 |       50 |         0 |          0 |        0 |        0 |
-----------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

`puerta.ts` = **100.00%, 50 killed, 0 timeout, 0 survived**.

## Ficheros tocados (estado FINAL de la sesión)

- **Test**: `src/lib/placeholders.test.ts` — solo @s5: **una fila añadida** al
  `it.each` (`['600  123  456']`). Ninguna aserción existente debilitada; nada
  importado de producción (anti-tautología intacta).
- **Producción**: `src/lib/placeholders.ts` — dos cambios: (1) la fila de @s5 mata el
  `[ -]+` (la línea 46 no cambia de contenido; el mutante `[ -]` fue temporal solo para
  el ROJO, restaurado); (2) `normalizarTexto` **partió `.toLowerCase()` en su propia
  sentencia** con `// Stryker disable next-line all` + comentario justificativo, para
  excluir **solo** el equivalente `toLowerCase↔toUpperCase` sin tapar `normalize`/`replace`.
  Es un no-op funcional.
- **`// Stryker disable next-line all`**: aplicado UNA vez, sobre `const enMinuscula =
  texto[i].toLowerCase()`, por decisión del lead (equivalente verificado, política
  `docs/mutation-testing.md` §78-80). La justificación formal la escribe el lead en
  `progress/mutation_puerta_placeholders.md`; aquí queda la nota técnica.
- **NO** commit, **NO** `feature_list.json`, **NO** `.feature`, **NO**
  `stryker.config.json`, **NO** bajada de umbral (sigue en `break: 100`).

## Veredicto del artesano al lead — VERDE

El superviviente encargado (`[ -]+`, línea 46) **está cerrado y verificado** (ROJO real
demostrado + muerto en la mutación). El segundo superviviente que destapé
(`toLowerCase↔toUpperCase`, línea 70) resultó **equivalente verificado** y, por decisión
del lead y política del repo, **se excluyó quirúrgicamente** con justificación escrita.
Estado final: `placeholders.ts` **100.00% / 0 survived / 1 ignored**; `puerta.ts`
**100.00% / 0 survived**; `pnpm test` **47 passed**; `typecheck` + `lint` limpios, 0
warnings. La puerta de mutación de F-01 **pasa** (exit 0 en ambos ficheros).
