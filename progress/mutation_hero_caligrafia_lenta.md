# Mutación — feature «hero caligrafía LENTA» (enmienda 2026-07-23, contrato features/hero.feature @s4+@s10-@s14)

**Veredicto:** ESCALADO (hero-logica.ts PASS 100 % · Hero.tsx FAIL 97.14 % < umbral 100 %;
el ÚNICO sobreviviente es el equivalente genuino ANTICIPADO por el diario del tdd_craftsman —
misma familia ya verificada DOS veces en este repo — documentado SIN excluir: la exclusión es
decisión del lead, como manda el precedente `mutation_galeria_carrusel.md`)
**Score:** detectados/total:
  - `src/components/hero-logica.ts` (NUEVO) → 16/16 = **100.00 %** (exit 0)
  - `src/components/Hero.tsx` → 34/35 = **97.14 %** (1 sobreviviente, exit 1)
**Comandos:** `bin/harness mutate src/components/hero-logica.ts` y después
`bin/harness mutate src/components/Hero.tsx` (SECUENCIAL, sin `--testFiles`, como manda
stryker.config.json)
**Runner:** StrykerJS 9.6.x · `vitest.stryker.config.ts` (horneados FUERA de la mutación por
diseño; corren en `pnpm test`/`verify`) · hero-logica.ts Done in 13 s · Hero.tsx Done in 24 s ·
`thresholds.break = 100`
**Precondiciones:** `bin/harness init` VERDE inmediatamente antes (1361/1361 tests, 42 ficheros).
⚠️ No existe `progress/judge_hero_caligrafia_lenta.md`: esta es la PRIMERA medición, ordenada por
el lead (el `judge_hero_caligrafia.md` en disco es del contrato viejo 2026-07-20). Mismo caso que
la primera medición de galería: la puerta del judge sigue pendiente en cualquier caso.

## Tabla (clear-text de Stryker)

| File           | % score | total | # killed | # timeout | # survived | # no cov | # errors |
| -------------- | ------: | ----: | -------: | --------: | ---------: | -------: | -------: |
| hero-logica.ts |  100.00 |    16 |       16 |         0 |          0 |        0 |        0 |
| Hero.tsx       |   97.14 |    35 |       34 |         0 |          1 |        0 |        0 |

- 15.69 tests/mutante (hero-logica.ts) · 15.91 tests/mutante (Hero.tsx). **0 timeouts, 0 sin
  cobertura, 0 errores en ambas corridas** → puntuación limpia, sin contención ni ENOENT.
- **Delta vs baseline**: `Hero.tsx` estaba en 100 % ANTES de esta feature… con **2 mutantes**
  (`mutation_hero_marca.md`: era casi JSX puro). Ahora instrumenta **35**: los +33 son el delta
  (estado `movimientoReducido`/`fase`, los 2 efectos, la guarda, el botón, `data-firma`). De esos
  33 nuevos, 32 MUERTOS. El único sobreviviente es del delta, y es EXACTAMENTE el previsto en la
  «Nota Stryker para el mutation_tester» del diario (`tdd_hero_caligrafia_lenta.md`).
- Las decisiones anti-mutante del diario FUNCIONARON: `milisegundosDeCeremonia()` calculado EN
  LLAMADA (0 estáticos no activables en hero-logica.ts — familia B de
  `tdd_deuda_mutacion_full.md` esquivada por construcción), `null` literal como estado inicial,
  tabla de verdad por valor, `FaseDeLaFirma` cliente/reloj distinguidos (el ArrayDeclaration del
  efecto del timeout MURIÓ gracias a eso, ver contraste abajo).

## Mutantes sobrevivientes (1)

### EQUIVALENTE genuino — documentado, NO excluido (decisión del lead)

- **src/components/Hero.tsx:92:6**  `ArrayDeclaration`
  - original: `}, [])`  (deps del efecto de LECTURA de `matchMedia`, Hero.tsx:84-92)
  - mutado:   `}, ["Stryker was here"])`
  - Estado Stryker: `Survived`, `static: false`, **54 tests completados** sobre él (cobertura
    perTest real: lo ejercitó toda la banda de hero + home; ningún assert puede distinguirlo).
  - Por qué es equivalente: React compara las deps elemento a elemento con `Object.is` entre
    renders. `[]` no re-ejecuta el efecto jamás; `["Stryker was here"]` compara el MISMO literal
    de string (primitivo idéntico) en cada render → nunca difiere → TAMPOCO re-ejecuta jamás. En
    ambas versiones el efecto corre exactamente una vez al montar. Categoría conocida: deps
    CONSTANTES en un efecto de solo-montaje. **Tercera aparición verificada en este repo**:
    `mutation_galeria_carrusel.md` (Galeria.tsx 124:6, excluido en 137:5 por decisión del lead) y
    Equipo.tsx 210.
  - **Contraste EN ESTA MISMA corrida** (la suite SÍ muerde deps de efecto cuando importan): el
    MISMO mutador sobre las deps del efecto del fin de reloj (`}, [controlVivo])` → `}, [])`,
    Hero.tsx:113:6) **MURIÓ** — killedBy el test de @s12: con deps constantes el timeout no se
    rearma y el assert `data-firma="reloj"` recibe `"corriendo"`. Exactamente el contraste que el
    precedente de galería exigió.
  - **Verificación con sabotaje** (método `tdd_deuda_mutacion_full.md`; aplicado y RESTAURADO):
    mutación aplicada A MANO a la línea 92 → `pnpm test` COMPLETO (con los horneados build-based
    que la mutación excluye por diseño): **1361/1361 VERDES**. Ni siquiera la suite entera lo
    distingue — coherente con inobservable por construcción. Restaurado desde copia byte-a-byte,
    `diff` vacío verificado (NO con `git checkout`: el árbol lleva el delta sin commitear).
  - Falta: **NINGÚN test puede matarlo** sin romper la construcción del componente. No hay receta.

## Exclusiones Stryker

NINGUNA. `grep "Stryker disable"` en `Hero.tsx` y `hero-logica.ts` devuelve 0 líneas: el
tdd_craftsman NO puso exclusión preventiva (a propósito, según su diario: «que lo ratifique la
corrida») y yo tampoco la pongo. `stryker.config.json` sin cambios.

## Escalado (decisión para el `craftsman_lead`)

1. **Hero.tsx:92:6** (equivalente genuino, ratificado por la corrida + sabotaje): decidir la
   exclusión documentada in-situ — precedente EXACTO ya ejecutado dos veces:
   `// Stryker disable next-line all` con referencia a este informe, patrón Galeria.tsx:136-137
   (deps en línea propia para que el disable cubra SOLO el array). Con él fuera, `Hero.tsx` daría
   **34/34 = 100 %** y la puerta cerraría.
2. Tras la exclusión: re-medición de `Hero.tsx` (una sola corrida) para confirmar `Ignored: 1` con
   razón «Ignored using a comment» y score 100, como en la re-medición de galería.
3. La puerta del judge de la enmienda sigue pendiente (no hay `judge_hero_caligrafia_lenta.md`).

## Nota de proceso

Solo mido y reporto: NO toqué tests, ni configuración, ni dejé rastro en `src/` (el sabotaje de
verificación se restauró con diff vacío; `git status src/` muestra solo el delta de la feature).
La feature NO cierra con estos números: el umbral es 100 % y la exclusión del equivalente no la
ejecuto yo.
