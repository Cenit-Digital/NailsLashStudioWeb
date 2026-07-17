# Verificación — Cómo demostrar que el trabajo funciona

> Regla de oro: **el agente no dice "funciona", lo demuestra.** Toda feature
> termina con evidencia ejecutable, no con afirmaciones. Los comandos
> concretos salen de `harness.config.json`; aquí van los niveles.

## Niveles de verificación

### Nivel 1 — Tests unitarios (obligatorio)

Toda función pública en `src/` tiene al menos un test que (1) cubre el camino
feliz y (2) cubre al menos un camino de error si la función puede fallar.

```bash
bin/harness test
```

### Nivel 2 — Test de integración de la interfaz (obligatorio para features de UI/CLI)

Las features que añaden comandos/pantallas se verifican ejecutando la interfaz
real contra un entorno aislado (directorio temporal, base de datos efímera…),
nunca con mocks del sistema de ficheros.

### Nivel 3 — Smoke test manual (recomendado)

Antes de cerrar, ejecuta un flujo end-to-end con datos desechables y límpialo.

### Nivel 4 — Trazabilidad de escenarios (obligatorio para features `"sdd": true`)

Cada escenario `@s` de `features/<name>.feature` mapea a al menos un test
concreto. El `judge` rechaza si falta cobertura. El mapa vive en
`progress/tdd_<name>.md`:

```markdown
## Trazabilidad
- @s1 (archivo vacío → 0) → test_count_archivo_vacio
- @s2 (varias notas → 3)  → test_count_varias_notas
- @s3 (no muta el archivo) → test_count_no_muta_archivo
```

### Nivel 5 — Prueba de mutación (obligatorio para cerrar una feature sdd)

Una suite verde no basta: hay que demostrar que los tests **muerden**.

```bash
bin/harness mutate
```

Todo mutante sobreviviente se mata con un test nuevo o se justifica como
equivalente en `progress/mutation_<name>.md`.

#### ⚠️ Un informe de mutación con TIMEOUTS es un informe que MIENTE

**Regla dura del arnés. Ha mordido dos veces: F-01 y F-03.** Un mutante en
`Timeout` **cuenta como muerto** en el score. Si hay timeouts, el score está
inflado y **puede tapar supervivientes reales**.

**El síntoma que delata la mentira:** timeouts en código **sin bucles ni espera**.
Es imposible por construcción. Si los ves, el informe no es creíble.

En F-03, `contraste.ts` —aritmética pura, sin un solo bucle— cantó
**«100 %, 0 supervivientes» con 26 de 53 mutantes en timeout**. Al repetirlo a
concurrencia 1: **timeouts 26 → 0** y **apareció un superviviente real** (el `^` de
un regex). El 100 % era falso.

**Qué hacer, siempre:**

1. **Lee la columna `# timeout` antes que el score.** Si no es 0, el score **no
   vale**. No lo reportes, no lo commitees, no cierres con él.
2. **Repite con `--concurrency 1`** (y `--timeoutMS` generoso si hace falta). Es
   lento —minutos por tanda— y **no es negociable**: es lo único que hace el
   informe honesto. El coste en reloj es el precio de no mentir.
3. Un mutante solo se declara `Timeout` legítimo si el código **puede** colgarse
   (bucle cuya condición muta). En código puro, un timeout es ruido de
   concurrencia, no un mutante muerto.

#### ⚠️ Un informe cuyo `tests per mutant` se DESPLOMA también miente (score falso BAJO)

**Regla dura del arnés. Medida en F-04, 2026-07-17.** Es la **imagen especular** de la mentira de
los timeouts, y es **más peligrosa**:

| Síntoma | Score | Efecto |
| ------- | ----- | ------ |
| `# timeout` > 0 | falso **ALTO** | **esconde** supervivientes reales |
| `tests per mutant` desplomado | falso **BAJO** | **inventa** supervivientes que no existen |

**Por qué es peor la de abajo:** un 100 % te da confianza de más y lo cuestionas; **un 7 % no lo
cuestiona nadie**. Te empuja a «arreglar» código que ya está bien o —peor— a **añadir tests
basura hasta que el número suba**.

**Medido en F-04, sobre EL MISMO CÓDIGO y LOS MISMOS TESTS:**

| | tests/mutante | Dry run | Score |
| - | ------------- | ------- | ----- |
| Tanda sana | **19,68** | 242 tests en **11 s** | **98,97 %** |
| Tanda envenenada | **1,35** | 246 tests en **3 s** | **7,05 %** |

Tres señales que la delatan, y basta una:
1. **El score no es determinista** entre tandas del mismo código. Un score no determinista **no
   es un score**.
2. **`tests per mutant` cae en picado**: Stryker ejecuta el test EQUIVOCADO contra el mutante.
3. **El dry run tarda MENOS con MÁS tests**: no se están ejecutando de verdad.

**La prueba definitiva, y es aritmética:** con `--coverageAnalysis all` Stryker DEBE correr
**todos** los tests contra cada mutante. Si con `all` sigue diciendo «Ran 2,45 tests per mutant»
sobre una suite de 246, **el runner no está ejecutando nada** y el informe entero es basura.

**Qué hacer:**

1. **Lee `tests per mutant` junto a `# timeout`**, y **compáralo con la tanda anterior**.
2. **Verifica por SABOTAJE, que no depende de Stryker**: aplica a mano un mutante que el informe
   declare «Survived» y corre la suite. En F-04, `ausenteOVacio → false` figuraba como
   **«Survived» con 101 tests cubriéndolo** y **mataba 5 tests** a mano. El informe mentía.
3. **Control barato:** vuelve a medir un fichero que ya diera 100 % y no hayas tocado. Si sigue
   dando 100 %, la máquina está bien y el problema es de la tanda.

#### 🔴 NUNCA corras dos Stryker a la vez sobre el mismo repo

**Es la causa nº 1 de lo de arriba, y en F-04 costó ~2 h y seis tandas.** Comparten
`.stryker-tmp` (`tempDirName`, **global** en `stryker.config.json`) y **se envenenan en
silencio**: **0 timeouts, 0 errors** y un score inventado. No hay mensaje de error que te avise.

Si dos agentes trabajan sobre el repo, **la mutación la corre UNO SOLO**. Y antes de medir:
`rm -rf .stryker-tmp` — pero **solo si no hay otra tanda viva**, porque borrárselo a la de al lado
es exactamente cómo se produce el envenenamiento.

> ⚠️ **Corolario que costó una regla falsa:** en esa ventana se «midió» que **la extensión `.ts`
> en el import de un test rompía la cobertura** (42 % → 100 % al quitarla) y estuvo a punto de
> entrar aquí como regla. **Era FALSO**: con `.ts` y **sin contención** el mismo fichero da
> **10,04 tests/mutante y 100 %**, idéntico a sin `.ts`. La variable era la contención, no la
> extensión. **Y aplicar esa regla habría roto el build**: los humildes de `tools/` corren con
> `node --experimental-strip-types`, **que EXIGE la extensión explícita**.
> **Antes de convertir una medición en regla, reprodúcela sin contención.** Una regla falsa en el
> arnés es peor que ninguna regla.

#### ⚠️ Tests que calculan en el cuerpo del `describe` → supervivientes FALSOS

Stryker activa **un mutante por test** (`coverageAnalysis: perTest`). Lo que se
calcula en el **cuerpo del `describe`** corre en **tiempo de recolección**, cuando
todavía **no hay ningún mutante activo** → ese código **nunca ve el mutante** y el
mutante **sobrevive sin haber sido probado**.

Peor: si un mutante rompe algo evaluado en la recolección, **fallan 0 tests porque
no llega a correr ninguno**, y Stryker lo cuenta como **superviviente**.

En F-03 esto produjo **189 supervivientes falsos** (score real 19 %). Con helpers
**perezosos** (el cálculo dentro del `it`, no fuera): 19 → 66 → 91 → 98,7 → **100 %**,
**sin tocar producción**. El defecto estaba en los tests, no en el código.

→ **Todo cálculo que deba ver el mutante va DENTRO del `it`.** En el `describe`,
solo datos literales.

## Anti-patrones (no hacer)

- ❌ "He añadido el comando, debería funcionar." → falta test ejecutable.
- ❌ Test que solo verifica que la función no lanza excepción. → debe
  comprobar el resultado concreto.
- ❌ Mock del filesystem. → usa aislamiento real (directorio temporal).
- ❌ Marcar la feature como `done` sin pasar `bin/harness init`.
- ❌ **Dar por bueno un score de mutación con `# timeout` > 0.** → repite a
  `--concurrency 1`; el score está inflado y puede tapar supervivientes.
- ❌ **Calcular en el cuerpo del `describe` lo que el mutante debe romper.** →
  dentro del `it`, o el mutante sobrevive sin haberse probado.
- ❌ **Una constante que decide una guarda y que ningún test fija.** → si bajarla
  no pone rojo nada, la guarda se puede desactivar en silencio y el build seguirá
  «verde». Ánclala contra un **literal escrito a mano** (no contra el símbolo
  importado: eso es tautología). *Una auditoría sin puerta no existe.*

## Verificación final antes de cerrar

```bash
bin/harness verify     # init (entorno + tests) + prueba de mutación
```

Si `verify` está rojo o sobreviven mutantes sin justificar, **no** marques
nada como `done`. Anota el bloqueo en `progress/current.md` con estado
`blocked` en `feature_list.json`.
