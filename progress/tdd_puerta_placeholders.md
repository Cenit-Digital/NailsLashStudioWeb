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
