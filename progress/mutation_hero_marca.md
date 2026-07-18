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
