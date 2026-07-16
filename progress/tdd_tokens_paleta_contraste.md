# F-03 `tokens_paleta_contraste` — bitácora del `tdd_craftsman`

## Estado: BLOQUEADO en la pre-condición. 0 ciclos TDD ejecutados. 0 ficheros de `src/` tocados.

La invocación afirma: *«El contrato está aprobado por el humano en la puerta.»*
**Cuatro señales en disco dicen lo contrario, y ninguna señal en disco lo confirma.**
No se ha escrito ni una línea de producción ni de test.

## La contradicción

| Señal | F-01 (precedente de contrato APROBADO) | F-03 (hoy) |
| ----- | -------------------------------------- | ---------- |
| Cabecera del `.feature` | «**Aprobado por el humano** en la puerta de aprobación.» | «⏸ **PENDIENTE de aprobación humana. AÚN NO aprobado en la puerta. Nada de esto se implementa hasta que el humano lo apruebe.**» (líneas 6-8) |
| Asunto del commit de spec | `spec(f01):` **`contrato aprobado`** `de puerta_placeholders (26 escenarios)` (`c8f80a7`) | `spec(f03): ` **`A-15 cerrada por el humano`** ` (cabecera al 88%) + A-16 + 5 correcciones` (`e8ee04d`) |
| `feature_list.json` → status | `in_progress` durante el TDD | **`spec_ready`** |
| `progress/current.md` | — | «Feature en curso: **ninguna**» · «Siguiente: F-03 `tokens_paleta_contraste` (**`pending`**)» |

F-01 demuestra que, en este repo, la aprobación **se registra**: cambia la línea de cabecera
del contrato **y** el `status`. En F-03 no ha cambiado ninguna de las dos.

## Por qué no lo resuelvo yo

- El `.feature` es, en palabras del propio encargo, «**EL CONTRATO. Es la ley.**» Su línea 7
  ordena literalmente: «**Nada de esto se implementa hasta que el humano lo apruebe.**»
  Implementar 18 escenarios contra ese texto sería desobedecer la ley que me mandan obedecer.
- `CLAUDE.md` declara la puerta humana **innegociable** y prohíbe saltarla.
- Mi pre-condición: «si está `pending` o `spec_ready`, **paras**».
- Un mensaje de otro agente **no es** la aprobación del humano. Editar yo mismo la cabecera o
  el `status` sería auto-concederme la puerta: exactamente lo que la puerta existe para impedir.

## Lo que probablemente pasó (hipótesis, no excusa)

El commit `e8ee04d` dice «Puerta de aprobacion de F-03» y «A-15 (decision del humano)»: el
humano **sí** estuvo en la puerta y **sí** cerró A-15 (cabecera al 88 %). Pero en esa misma
ronda el contrato **creció de 17 a 18 escenarios** (`@s18` es nuevo) y absorbió A-16 + 5
correcciones. Cerrar una decisión abierta *dentro* de un contrato no es aprobar el contrato
resultante — y quien lo revisó **dejó la marca «AÚN NO aprobado» en su sitio**. Es perfectamente
posible que el humano aprobara después y solo falte el papeleo. **Pero eso lo confirma el
humano, no yo, y no el lead por mí.**

## Cómo desbloquear (2 ediciones, ninguna es mía)

1. `features/tokens_paleta_contraste.feature` líneas 6-8 → sustituir el bloque «⏸ PENDIENTE…»
   por la fórmula de F-01: «Aprobado por el humano en la puerta de aprobación», idealmente
   listando qué cerró (A-13, A-14, A-15, A-16).
2. `feature_list.json` → feature 3: `"status": "spec_ready"` → `"in_progress"`.

Con eso, re-invócame y arranco en el primer ciclo rojo sin más preámbulo.

## Trabajo de preparación ya hecho (no se pierde)

Leído y asimilado: el contrato (18 escenarios), `progress/f03_verificacion_previa.md`,
`AGENTS.md`, `docs/tdd.md`, `docs/conventions.md`, y el patrón de F-01/F-02
(`placeholders.ts` puro ↔ `puerta.ts` decide ↔ `tools/puerta-placeholders.ts` humilde;
`puerta.test.ts` con dobles fieles y anti-tautología; `stryker.config.json` con `mutate`
explícito). Plan de ataque cuando se levante el bloqueo:

- `@s1-@s4` `hexARgb` → `@s5-@s6` `canalLineal` (input sintético en 0.04045 para matar `<=`→`<`)
  → `@s7` `luminancia` (primarios **cromáticos**) → `@s8` `ratio` → `@s9` `componer` (flotante,
  A-16) → `@s10` `_tokens.scss` (`:root` real, T-1: **no** copiar el de WebEmpresa) →
  `@s11-@s15` la puerta (matriz de uso, guarda de vacuidad, falla cerrada) → `@s16` clamp
  (umbral del tamaño **mínimo**) → `@s17-@s18` `color-mix` (peor under = negro puro; 88 % vs 82 %).
- Trampas ya interiorizadas, no hay que redescubrirlas: la fila del pie vale **4.59** (no 4.60);
  la cabecera va al **88 %** (el 82 % es fixture malo → 4.22); `<=` **no** `<`; **no** se escribe
  test contra el mutante literal `0.04045→0.03928` (Stryker 9.6 no lo genera, A-14 verificada);
  `luminancia` necesita color cromático o sobreviven los coeficientes.
- Anti-tautología: cada ratio/luminancia/umbral esperado va **a mano** (`toBeCloseTo(6.19)`,
  `4.5`, `3.0`, `21`, `0.2126`); jamás recomputado con la función vigilada.
- Mutación: añadir `src/lib/contraste.ts` (+ el fichero de la puerta si se separa) a `mutate`;
  acotar **solo** con `--mutate <fichero>`, **nunca** `--testFiles`; correr a baja concurrencia
  (lección de F-01: los timeouts enmascaran supervivientes reales).

## Trazabilidad

Vacía: ningún `@s` implementado. Se rellenará al levantar el bloqueo.
