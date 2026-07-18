# Mutación — feature 7 `hero_marca`

**Veredicto:** **PASS** — cierre limpio, 0 supervivientes, 0 exclusiones, 0 timeouts.
**Score feature:** killed/total = **15/15 = 100,00 %** (umbral `harness.config.json` ->
`mutation.threshold: 1.0` · `stryker.config.json` -> `break: 100`). Los DOS ficheros que F-07 añadió
a la lista `mutate` salieron a **100,00 %** con Stryker en **código 0**. **0 supervivientes (ni uno
equivalente) -> nada que escalar, nada que excluir.**

> Ni producción ni tests se tocaron en esta medición (`git status src/` LIMPIO antes y después).
> Solo se acotó con `--mutate`, **jamás** `--testFiles`. Una sola tanda de Stryker viva a la vez,
> `rm -rf .stryker-tmp` entre las dos. Baseline **661/661 verde** antes de medir.

---

## 0. Alcance y confirmación de la lista `mutate`

Los dos ficheros pedidos, medidos **por separado**, son exactamente los que F-07 añadió a
`stryker.config.json` (líneas 23 y 27 de la lista explícita):

- `src/lib/partir-nombre.ts` — la derivación PURA del nombre, **la única lógica de F-07** (@s12/@s13/@s16).
- `src/components/Hero.tsx` — el JSX que llama a `partirNombre`; casi sin lógica propia.

`src/components/hero.module.scss` **NO se muta** y **NO está** en la lista `mutate` (0 entradas
`*.module.scss` en `stryker.config.json`, verificado): Stryker no ve SCSS. El CSS/keyframes/duración
lo cubren los tests que leen el fichero (`hero-estilos.test.ts`, @s1..@s4/@s9) y los BYTES de `dist/`.

---

## 1. SALUD DEL INFORME — SE LEE ANTES QUE EL SCORE

> «Un informe con timeouts MIENTE» (un `Timeout` cuenta como MUERTO e infla el score — la mentira de
> F-05: «100 %» con 152 timeouts). «Un `tests per mutant` desplomado inventa supervivientes.» «Una
> medición con 0 tests corridos lee «sobrevive» donde no lo hay.» **Ninguna mordió aquí, y está medido.**

| Fichero | Concurrencia | `# timeout` | tests/mutante | dry run (tests que cubren) | `# errors` | `# no cov` | ¿Vale? |
| ------- | ------------ | ----------- | ------------- | -------------------------- | ---------- | ---------- | ------ |
| `src/lib/partir-nombre.ts` | `--concurrency 1` | **0** | **2,77** | **22** | **0** | **0** | **sí** |
| `src/components/Hero.tsx`  | `--concurrency 1` | **0** | **1,50** | **17** | **0** | **0** | **sí** |

1. **`# timeout` = 0 en los DOS.** `partir-nombre.ts` es **código PURO sin un solo bucle** -> un
   timeout ahí sería contención pura y contaría como MUERTO inflando el score; **no hay ni uno**.
   `Hero.tsx` renderiza con `renderToString`/Testing Library, sin bucles que se cuelguen; **cero**.
   -> el score se puede leer, no hay mentira de contención.
2. **`tests/mutante` NO desplomado — genuino y coherente con el pool que cubre cada fichero.**
   - `partir-nombre.ts`: **2,77 sobre 22 tests** que lo cubren (el pool = 5 de `partir-nombre.test.ts`
     + 15 de `hero.test.tsx` + 2 de `home.test.tsx`, que lo importan transitivamente vía `Hero`). 13
     mutantes, media 2,77 = asesinos tempranos con bail-out; **no es el desplome-que-inventa-supervivientes**.
   - `Hero.tsx`: **1,50 sobre 17 tests** (15 `hero.test.tsx` + 2 `home.test.tsx`). Con **solo 2
     mutantes** (JSX literal no se muta), 1,50 es lo esperado (ambos mueren pronto); es el mismo rango
     que los `.tsx` de 1-2 mutantes de F-06 (1,00). No hay desplome anómalo.
3. **Cuántos tests corrieron (regla 6):** dry run **22** (partir-nombre) y **17** (Hero), ambos > 0 y
   coherentes con el baseline 661/661 -> la suite corrió DE VERDAD, no es el 0-tests-leído-como-sobrevive
   (`--reporter=basic` de Vitest 4 no se usó; reporters = html/clear-text/progress). `# errors` = 0 en
   ambos -> ni un mutante quedó sin evaluar por fallo de arranque.

```
pnpm exec stryker run --mutate src/lib/partir-nombre.ts     --concurrency 1   # EXIT 0
pnpm exec stryker run --mutate src/components/Hero.tsx       --concurrency 1   # EXIT 0
```

**Higiene:** baseline **661/661 verde** (Vitest 4.1.10, 19 ficheros) antes de medir · `rm -rf
.stryker-tmp` **entre las dos tandas** · **una sola tanda viva a la vez** (0 procesos `stryker run`
al arrancar; el único `node.exe` vivo era un servidor HTTP estático de experimentos en :8901, no
Stryker) · acotado **solo** con `--mutate`, **jamás** `--testFiles` · `.experimentos-tmp/` gitignored
(línea 51) -> Stryker no lo copia al sandbox (los WARN de `DisableTypeChecks` sobre `.experimentos-tmp/
head-*/index.html` son ruido inofensivo, NO `# errors`) · `src/` **git-clean antes y después**.

---

## 2. El score — ya con derecho a leerse

| Fichero | `# timeout` | tests/mut | Total | Killed | **Survived** | **NoCov** | `# errors` | Score |
| ------- | ----------- | --------- | ----- | ------ | ------------ | --------- | ---------- | ----- |
| `src/lib/partir-nombre.ts` | **0** | 2,77 | **13** | 13 | **0** | **0** | 0 | **100,00 %** |
| `src/components/Hero.tsx`  | **0** | 1,50 | **2**  | 2  | **0** | **0** | 0 | **100,00 %** |
| **Feature** | **0** | — | **15** | **15** | **0** | **0** | 0 | **100,00 %** |

Stryker salió con **código 0** en los dos ficheros («Final mutation score of 100.00 is greater than
or equal to break threshold 100»). **Ni un superviviente, ni un equivalente.** Nada que escalar.

### El mutante crítico previsto — MUERTO
El `EqualityOperator` `corte < 0 -> corte <= 0` (guarda de `partir-nombre.ts:22`) está entre los 13
mutantes y **murió**: en la traza de Stryker el escenario **@s16** («` Studio`», un NOMBRE que empieza
por espacio, corte===0) figura como **`killed 1`** — mató EXACTAMENTE ese mutante y ningún otro test lo
tocaba. Confirma la predicción del contrato y la reproducción del `judge`: sin la partición corte===0
sobreviviría; con @s16, cae. **El mutante crítico DEBE morir -> murió.**

### Hero.tsx — 2 mutantes, ambos muertos
JSX con atributos/estructura LITERALES: Stryker instrumentó **solo 2 mutantes** (el cuerpo de la
función `Hero`, no los literales `<span>`/`<p>`/`className`), como avisaba la lección F-06. Los dos
mueren con el pool de 17 tests (`hero.test.tsx` + `home.test.tsx` sobre el HTML de `renderToString`).
**Ningún superviviente -> no hay que escalar el «cualquier superviviente en Hero.tsx se escala».**

---

## 3. Mutantes sobrevivientes

**Ninguno.** 0 supervivientes en los dos ficheros. No hay lista.

## 4. Lo que este agente NO ha hecho, a propósito

- **No ha tocado `src/` ni los tests.** `git status src/` LIMPIO antes y después; baseline 661/661.
- **No ha excluido ni justificado ningún mutante como equivalente.** No hizo falta: 0 supervivientes.
  El umbral 1.0 con 0 exclusiones se cumple **con contrato**, no con licencia.
- **No ha escrito `// Stryker disable`, no ha bajado el umbral, no ha rediseñado nada.**
- **No ha marcado la feature `done`.** Eso lo decide el `craftsman_lead` (esta puerta PASA; queda la
  verificación EN VIVO con Chrome que el lead se reservó, C-2).

---

# APÉNDICE — RE-VALIDACIÓN tras `@s17` (acceptance 7, tipografía del titular) — 2026-07-18

> Ronda de mutación gatillada por la AMPLIACIÓN `@s17` (Great Vibes en `.heroMarca`, Manrope en
> `.heroStudio`). Objetivo doble: (1) declarar por escrito que `@s17` NO aporta lógica mutable, y
> (2) confirmar que los DOS ficheros mutables de F-07 **siguen en 100 %** (no hay regresión). No se
> tocó `src/` ni los tests en esta medición; acotado **solo** con `--mutate`, **jamás** `--testFiles`.

**Veredicto de la ronda:** **PASS** — umbral **1.0 (100 %) MANTENIDO**. 0 supervivientes, 0 timeouts,
0 errores, 0 exclusiones. Sin regresión frente al cierre previo (cifras idénticas).

## A. `@s17` es NO-MUTABLE (SCSS) — declarado, no fingido

El cambio de producción de `@s17` es **puramente SCSS**: dos declaraciones `font-family` en las reglas
base `.heroMarca` (`'Great Vibes', cursive`) y `.heroStudio` (`'Manrope', sans-serif`) de
`src/components/hero.module.scss`. **Stryker NO ve CSS/SCSS** (regla del repo:
`feature_list.json` líneas 19 y 21; nota §7-174: la tipografía «se asevera leyendo el .module.scss»).

Verificado en ESTA ronda:
- `stryker.config.json` → lista `mutate` (15 entradas explícitas, líneas 12-28): **0 entradas
  `*.module.scss`** y **0 ficheros de test**. `@s17` NO añade ningún fichero mutable nuevo. Los dos
  mutables de F-07 siguen siendo exactamente `src/lib/partir-nombre.ts` (línea 23) y
  `src/components/Hero.tsx` (línea 27).
- `git --no-pager diff [--cached] src/lib/partir-nombre.ts src/components/Hero.tsx` → **VACÍO**
  (antes y después de medir). `@s17` **no tocó** ninguno de los dos ficheros mutables.
- `git status --short src/` → SOLO `src/components/hero.module.scss` (SCSS, no mutable) y
  `src/components/hero-estilos.test.ts` (fichero de test, fuera de la lista `mutate`). Ni un fichero
  mutable modificado.
- El test nuevo (`hero-estilos.test.ts` › describe `@s17`, 3 `it`) LEE el SCSS y asevera las dos
  `font-family` + su presencia; el eje [NV] «qué fuente PINTA el navegador» lo re-verifica el lead
  EN VIVO con Chrome (`document.fonts.check`), NO jsdom. Es la misma vía de aseveración que
  `@s1`/`@s3`/`@s9` (CSS leído del fichero). **No se finge cobertura de mutación sobre CSS.**

**Conclusión A:** `@s17` es no-mutable (SCSS), como manda la nota del repo. Nada nuevo que mutar.

## B. RE-VALIDACIÓN de los DOS ficheros mutables — SIN REGRESIÓN

Medidos por separado, acotando **solo** con `--mutate` (`pnpm exec stryker run --mutate <fichero>
--concurrency 1`), `rm -rf .stryker-tmp` entre tandas, una sola tanda viva a la vez. Baseline de
apoyo: `pnpm test` = **654 passed | 10 skipped (664)**; la ÚNICA suite en rojo es
`src/lib/trampas-del-horneado.test.tsx` por un `EBUSY: resource busy or locked` sobre
`.experimentos-tmp/react19-nativa` (candado de FS de un servidor de experimentos residual, puerto
:8901/:8907; sus 10 tests están **skipped** y **no cubren** ningún fichero mutable). Ese EBUSY es del
working-tree real, **NO** del sandbox de Stryker: `.experimentos-tmp/` está gitignored (`.gitignore`
línea 51) → Stryker no lo copia; ambos dry-runs salieron **«Initial test run succeeded»**.

### Salud del informe (se lee ANTES que el score)

| Fichero | Concurrencia | dry-run | tests/mut | `# timeout` | `# errors` | `# no cov` | EXIT | ¿Vale? |
| ------- | ------------ | ------- | --------- | ----------- | ---------- | ---------- | ---- | ------ |
| `src/lib/partir-nombre.ts` | `--concurrency 1` | «Initial test run succeeded. Ran **22** tests» | **2,77** | **0** | **0** | **0** | **0** | **sí** |
| `src/components/Hero.tsx`  | `--concurrency 1` | «Initial test run succeeded. Ran **17** tests» | **1,50** | **0** | **0** | **0** | **0** | **sí** |

0 timeouts en los dos (ningún `Timeout` inflando el score como falso-muerto), 0 `# errors` (ningún
mutante sin evaluar), dry-run > 0 y coherente con el baseline → el score se puede leer, no hay mentira.

### El score — ya con derecho a leerse

| Fichero | Total | Killed | **Survived** | NoCov | Timeout | Errors | Score |
| ------- | ----- | ------ | ------------ | ----- | ------- | ------ | ----- |
| `src/lib/partir-nombre.ts` | **13** | 13 | **0** | 0 | 0 | 0 | **100,00 %** |
| `src/components/Hero.tsx`  | **2**  | 2  | **0** | 0 | 0 | 0 | **100,00 %** |
| **Feature (F-07)** | **15** | **15** | **0** | 0 | 0 | 0 | **100,00 %** |

Stryker salió con **código 0** en los dos («Final mutation score of 100.00 is greater than or equal
to break threshold 100»). Cifras **idénticas** a la ronda de cierre previa (13 + 2 mutantes, 2,77 y
1,50 tests/mut, dry-run 22 y 17) → **cero regresión**. El mutante crítico `< → <=` de
`partir-nombre.ts:22` sigue MUERTO por `@s16` (« Studio», corte===0), `killed 1`.

## C. Mutantes sobrevivientes

**Ninguno.** 0 supervivientes en los dos ficheros. Nada que escalar, nada que excluir (0 exclusiones,
como desde F-03). El umbral **1.0** se cumple **con contrato**.

## D. Lo que este agente NO ha hecho, a propósito (esta ronda)

- No tocó `src/` ni los tests: los dos ficheros mutables `git diff` = VACÍO antes y después; solo
  `@s17` (SCSS + test) queda en el working-tree, y no lo escribí yo.
- No excluyó ningún mutante ni escribió `// Stryker disable`; no bajó el umbral; no rediseñó nada.
- No fingió cobertura de mutación sobre el SCSS de `@s17`: lo DECLARÓ no-mutable (regla del repo).
- No marcó la feature `done`: lo decide el `craftsman_lead`. Esta puerta de mutación **PASA**.
