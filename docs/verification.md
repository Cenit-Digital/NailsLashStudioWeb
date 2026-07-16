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
