# Mutación — feature 22 `galeria_coverflow_3d` (primera medición, contrato v2.1)

**Veredicto:** ESCALADO (FAIL: 98.44 % y 97.87 % < umbral 100 %; 1 sobreviviente MATABLE +
2 equivalentes de libro DOCUMENTADOS SIN EXCLUIR — la exclusión es decisión del lead)
**Score:** detectados/total:
  - `src/components/galeria-logica.ts` → 63/64 = **98.44 %** (1 sobreviviente)
  - `src/components/Galeria.tsx` → 92/94 = **97.87 %** (2 sobrevivientes)
**Comandos:** `bin/harness mutate src/components/galeria-logica.ts` y después
`bin/harness mutate src/components/Galeria.tsx` (secuencial, sin `--testFiles`, como manda
stryker.config.json)
**Runner:** StrykerJS 9.6.1 · vitest.stryker.config.ts · galeria-logica.ts Done in 26 s (exit 1) ·
Galeria.tsx Done in 36 s (exit 1) — `thresholds.break = 100`

## Tabla (clear-text de Stryker)

| File              | % score | total | # killed | # timeout | # survived | # no cov | # errors |
| ----------------- | ------: | ----: | -------: | --------: | ---------: | -------: | -------: |
| galeria-logica.ts |   98.44 |    64 |       63 |         0 |          1 |        0 |        0 |
| Galeria.tsx       |   97.87 |    94 |       92 |         0 |          2 |        0 |        0 |

- Dry-runs verdes: 125 tests (galeria-logica.ts, 21.34 tests/mutante) · 78 tests (Galeria.tsx,
  18.59 tests/mutante). Los `*-horneado.test.*` quedan FUERA de la mutación por diseño
  (vitest.stryker.config.ts); corren en `pnpm test`/`bin/harness verify`.
- **0 timeouts, 0 sin cobertura y 0 errores en ambas corridas** → puntuación limpia, sin
  contención de CPU ni rastro del incidente ENOENT (los `ignorePatterns` añadidos tras
  `progress/mutation_contacto.md` funcionan).
- Contexto de puerta: `progress/judge_galeria_carrusel.md` sigue en CHANGES_REQUESTED; el
  «ciclo de remate» del `tdd_craftsman` (final de `progress/tdd_galeria_carrusel.md`, contrato
  v2.1, 145 tests de galería) cierra los 4 cambios requeridos, pero el **re-judge está pendiente**.
  Esta es la PRIMERA medición, ordenada por el lead.

## Mutantes sobrevivientes (3)

### Matable con UN test (1)

- **src/components/galeria-logica.ts:153:10**  `EqualityOperator`
  - original: `return desplazamientoX < 0 ? 1 : -1`
  - mutado:   `return desplazamientoX <= 0 ? 1 : -1`
  - Por qué sobrevive: `<` y `<=` solo difieren en `desplazamientoX === 0`, y ese valor solo
    ALCANZA el ternario si la guarda `Math.abs(desplazamientoX) < umbral` (línea 149) no dispara,
    es decir, con `umbral <= 0`. Todos los tests de `pasosDelArrastre` inyectan umbral > 0
    (48, 20, 200; `galeria-logica.test.ts:262-286`) y el caso `(0, 48)` sale por la guarda con 0.
    En el cableado de producción el umbral es la constante `UMBRAL_DE_ARRASTRE = 48`
    (`Galeria.tsx:174`), así que ALLÍ es inobservable — pero el umbral es un ARGUMENTO inyectado
    del API público (el propio contrato lo declara «inyectado para poder morder la frontera por
    valor»): `pasosDelArrastre(0, 0)` devuelve **-1** en el original y **1** en el mutante.
    **NO es un equivalente genuino**: hay diferencia observable a nivel de la función exportada.
  - Falta: `expect(pasosDelArrastre(0, 0)).toBe(-1)` — fija el caso degenerado (gesto de 0 px con
    umbral 0). Alternativa a valorar por el `tdd_craftsman` (no la decido yo): derivar el retorno
    del SIGNO (p. ej. `-signoDe(desplazamientoX)` con el retorno tipado), que elimina el comparador
    —sin mutante que instrumentar— y da 0 al gesto degenerado en vez de una dirección arbitraria.

### EQUIVALENTES genuinos (2) — documentados, NO excluidos (decisión del lead)

- **src/components/Galeria.tsx:86:62**  `BooleanLiteral` — **el previsto por el hallazgo 9 del judge**
  - original: `const [arranqueExplicito, setArranqueExplicito] = useState(false)`
  - mutado:   `const [arranqueExplicito, setArranqueExplicito] = useState(true)`
  - Verificación (razonada contra `debeRotar` y los flujos de `entra()`/`alternarRotacion`):
    1. El ÚNICO lector de `arranqueExplicito` es `debeRotar` (`Galeria.tsx:92`), con precedencias
       `pausadoPorElUsuario → false` · `arranqueExplicito → true` · si no `!raton && !foco`
       (`galeria-logica.ts:122-132`).
    2. Estado neutro inicial (`pausado=false, raton=false, foco=false`): el original rota por la
       3ª rama y el mutante por la 2ª — MISMO resultado (`rotando=true`), mismo SSR, mismo primer
       render, mismo `aria-live="off"`.
    3. `true` y `false` solo se distinguen cuando `pausado=false` **y** (`raton || foco`). Pero
       `raton`/`foco` SOLO pasan a `true` vía `entra()` (`onMouseEnter`/`onFocus`,
       `Galeria.tsx:204-206`), y `entra()` pone `arranqueExplicito=false` EN EL MISMO lote
       (`Galeria.tsx:159-162`): no existe render alcanzable donde `raton||foco` conviva con el
       valor INICIAL de `arranqueExplicito`. (`onMouseLeave` solo pone `raton=false`.)
    4. `alternarRotacion` desde el estado inicial pone `pausado=true` (1ª precedencia: enmascara) y
       `setArranqueExplicito(pausado)` con el `pausado` viejo = `false`. Bajo reduced-motion el
       efecto pone `pausado=true` (enmascara) y pulsar «Iniciar» pone `arranqueExplicito=true` en
       las DOS versiones.
  - Conclusión: **inobservable POR CONSTRUCCIÓN** — equivalente de libro, exactamente como
    anticipó el judge. No hay test que pueda matarlo sin romper la construcción del componente.
    NO añado exclusión al fichero (ni lo perseguiría con tests): lo reporto para decisión del lead.

- **src/components/Galeria.tsx:124:6**  `ArrayDeclaration`
  - original: `}, [])`  (deps del efecto de `matchMedia`, `Galeria.tsx:94-124`)
  - mutado:   `}, ["Stryker was here"])`
  - Por qué es equivalente: React compara las deps elemento a elemento con `Object.is` entre
    renders. `[]` no re-ejecuta nunca el efecto; `["Stryker was here"]` compara el MISMO literal de
    string en cada render → nunca difiere → TAMPOCO re-ejecuta nunca. En ambas versiones el efecto
    corre una vez al montar y su limpieza al desmontar: no existe estado alcanzable que los
    distinga (categoría conocida de Stryker: deps CONSTANTES en un efecto de solo-montaje).
  - Contraste que prueba que la suite SÍ muerde las deps: el MISMO mutador sobre el segundo efecto
    (`}, [rotando])`, `Galeria.tsx:140`) **MURIÓ** — con deps constantes el intervalo no se rearma
    al cambiar `rotando` y los tests de pausa/reanudación (@s9/@s10/@s11) caen.
  - NO añado exclusión: lo reporto para decisión del lead (exclusión documentada o rediseño).

## Exclusiones Stryker
NINGUNA nueva. No hay `// Stryker disable` en `galeria-logica.ts` ni en `Galeria.tsx`.

## Escalado (decisión para el `craftsman_lead`)
1. **153:10** (matable) → `tdd_craftsman`: test del caso degenerado `pasosDelArrastre(0, 0)` o
   rediseño por signo → re-judge → re-mutación de `galeria-logica.ts`.
2. **86:62 y 124:6** (equivalentes genuinos verificados) → decidir: exclusión documentada
   (`// Stryker disable next-line all` con referencia a este informe) o rediseño. Con ellos
   fuera, `Galeria.tsx` daría 92/92 = 100 %.
3. El re-judge del remate sigue pendiente en cualquier caso (`progress/judge_galeria_carrusel.md`
   está en CHANGES_REQUESTED; la resolución vive en el diario del `tdd_craftsman`).

## Nota de proceso
Solo mido y reporto: NO toqué `src/`, ni tests, ni configuración. La feature NO cierra con estos
números: el umbral es 100 % y hay un sobreviviente matable. Los dos equivalentes quedan verificados
y justificados aquí, pero su exclusión NO la ejecuto yo.

## Re-medición tras el micro-ciclo

**Fecha:** 2026-07-23 · **Veredicto final:** PASS
**Score:** detectados/puntuados:
  - `src/components/galeria-logica.ts` → 60/60 = **100.00 %** (exit 0)
  - `src/components/Galeria.tsx` → 93/93 = **100.00 %** (exit 0)
**Comandos:** los MISMOS de la primera medición, secuencial: `bin/harness mutate
src/components/galeria-logica.ts` (Done in 32 s) y después `bin/harness mutate
src/components/Galeria.tsx` (Done in 36 s). StrykerJS 9.6.1 · `thresholds.break = 100` ·
«Final mutation score of 100.00 is greater than or equal to break threshold 100» en ambas.

### Tabla (clear-text de Stryker)

| File              | % score | puntuados | # killed | # timeout | # survived | # no cov | # errors | # ignored |
| ----------------- | ------: | --------: | -------: | --------: | ---------: | -------: | -------: | --------: |
| galeria-logica.ts |  100.00 |        60 |       60 |         0 |          0 |        0 |        0 |         0 |
| Galeria.tsx       |  100.00 |        93 |       93 |         0 |          0 |        0 |        0 |         2 |

- 22.87 tests/mutante (galeria-logica.ts) · 17.43 tests/mutante (Galeria.tsx). 0 timeouts,
  0 sin cobertura, 0 errores: puntuación limpia en ambas corridas.

### Los totales CAMBIARON — y cuadran con el micro-ciclo

- **galeria-logica.ts: 64 → 60 (−4).** El rediseño por signo (`return signoDe(0 - desplazamientoX)`,
  línea 157) ELIMINÓ el ternario con comparador `desplazamientoX < 0 ? 1 : -1`: los 4 mutantes de esa
  expresión (EqualityOperator ×2, ConditionalExpression ×2) ya NO existen — el superviviente 153:10
  se cerró por construcción, no con un test-parche, y además `(0, 0)` ahora devuelve `0` (test nuevo
  @s19 [ENMIENDA 2] en `galeria-logica.test.ts`). El resto de la superficie sigue mordida al 100 %.
- **Galeria.tsx: 94 → 95 instrumentados (93 puntuados + 2 ignorados; neto +1 puntuado sobre los
  92 comparables).** El +1 es el BooleanLiteral nuevo de `draggable={false}` en la `<img>`
  (micro-ciclo, @s19 Enmienda 2) — Stryker lo generó (`false→true`) y la suite lo MATÓ (el test de
  las seis `<img>` con `draggable="false"`, el mismo defecto que el sabotaje 1 del diario). Las
  líneas nuevas de touch-action viven en `galeria.module.scss` (fuera del alcance del mutador JS).

### Confirmación de exclusiones (contra el reporte de Stryker, no solo contra el fuente)

- `Galeria.tsx`: **EXACTAMENTE 2** mutantes `status: Ignored`, ambos con razón «Ignored using a
  comment», y son EXACTAMENTE los 2 equivalentes verificados de este informe (desplazados de línea
  porque el fichero ganó las líneas del micro-ciclo):
  1. `BooleanLiteral` `false→true` en **91:62** (antes 86:62) — `useState(false)` de
     `arranqueExplicito`. Comentario con justificación + referencia a este informe en
     `Galeria.tsx:86-90` (precedente HOST_WHATSAPP).
  2. `ArrayDeclaration` `[] → ["Stryker was here"]` en **137:5** (antes 124:6) — deps del efecto de
     `matchMedia`, reestructurado a argumentos-en-líneas-propias para que el
     `// Stryker disable next-line all` (línea 136) cubra SOLO el array.
- `galeria-logica.ts`: **0 exclusiones** (ningún `// Stryker disable` en el fichero; 60/60 sin
  ignorados) y `stryker.config.json` no añade exclusiones de mutadores.
- Ninguna otra exclusión en ninguno de los dos ficheros: `grep -n "Stryker disable"` devuelve solo
  las líneas 90 y 136 de `Galeria.tsx`.

### Mutantes sobrevivientes nuevos

**NINGUNO.** 0 sobrevivientes en las dos corridas.

### Cierre

Con el umbral en 100 % (`harness.config.json` → `mutation.threshold: 1.0`), la puerta de mutación de
la feature 22 queda **PASS: 100 % / 100 %**. El superviviente matable de la primera medición murió
por rediseño (mejor que por test-parche) y los 2 equivalentes están excluidos con justificación
in-situ por decisión del lead. No toqué `src/`, ni tests, ni configuración: solo medí y reporté.
