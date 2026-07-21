# Mutación — feature boton_whatsapp_flotante (rebanada de F-13)

**Veredicto:** FAIL (BLOQUEADO — la corrida no llega a medir)
**Score:** N/D — killed/total = ?/3 (umbral: 100%). La corrida ABORTA en el
dry-run inicial, antes de evaluar ni un solo mutante.

Comando: `node tools/mutate.mjs src/components/BotonWhatsApp.tsx`
(→ `pnpm exec stryker run --mutate src/components/BotonWhatsApp.tsx`)
Runner: Stryker 9.6.1 + `@stryker-mutator/vitest-runner`, `vitest.stryker.config.ts`.

## Nota de precondición
`progress/judge_boton_whatsapp.md` está en **CHANGES_REQUESTED** (bloqueante @s4
sin test), no en APPROVED. El protocolo pide `judge` aprobado ANTES de mutar;
esta RONDA 1 se corre por directiva expresa del `craftsman_lead` (medir, no cerrar).
Queda anotado: la feature NO puede cerrarse con este veredicto.

## Qué pasó (medición)
- Stryker encontró el fichero e **instrumentó 3 mutantes** ("Instrumented 1
  source file(s) with 3 mutant(s)"). Son mutantes de *string literal* del render
  estático (className / id / aria-label / atributos del `<svg>`), no de lógica:
  la feature es NO-MUTABLE por declaración (@s11, `<a>` estático sin predicados).
- El **initial test run (dry-run)** FALLÓ y Stryker abortó con
  `ConfigError: There were failed tests in the initial test run.`
  Ningún mutante llegó a correrse ⇒ no hay killed/survived ⇒ **no hay score**.

### Causa raíz (incompatibilidad arnés↔instrumentación, NO un mutante vivo)
El test que rompe es de la propia suite de la feature:

    boton-whatsapp.test.tsx  @s11  "el .tsx no contiene «if (», ni ternario «?», ni «&&», ni «||»"
    expected '// @ts-nocheck\nfunction stryNS_9fa48…' not to contain 'if ('

`@s11` lee los BYTES de `src/components/BotonWhatsApp.tsx` con `readFileSync` y
asevera que la fuente NO contiene `if (` / `&&` / `||` / `?`. Pero para mutar,
Stryker **instrumenta** ese mismo fichero en su sandbox: le añade el preámbulo
`// @ts-nocheck`, `function stryNS_9fa48…` y guardas `if (stryMutAct_9fa48(...))`.
El `readFileSync` del sandbox lee la copia INSTRUMENTADA (con `if (`), así que la
aserción de FUENTE de `@s11` cae ⇒ el baseline falla ⇒ Stryker no arranca los
mutantes. Es un choque estructural: un guard que lee su propia fuente y prohíbe
cierta sintaxis es, por construcción, incompatible con que Stryker instrumente
ese mismo fichero.

## Mutantes (3) — disposición
| # | Estado | Detalle |
|---|--------|---------|
| 1..3 | NO EVALUADO | 3 mutantes de string-literal instrumentados; la corrida abortó en el dry-run antes de ejecutarlos. Killed/Survived = desconocido. |

No hay mutantes SUPERVIVIENTES confirmados (ninguno se llegó a correr) y tampoco
KILLED confirmados. No se puede certificar el 100%.

## Esto NO lo arreglo yo (mido, no edito). Para el `craftsman_lead` / `tdd_craftsman`:
Dos vías legítimas (decisión del lead), documentadas para no ser trampa:
1. **Excluir `src/components/BotonWhatsApp.tsx` de la lista `mutate` de
   `stryker.config.json`.** La feature está DECLARADA NO-MUTABLE (@s11: `<a>`
   estático, sin lógica; los 3 mutantes son de string y su comportamiento lo
   guardan los tests SSR/a11y). Es la vía documentada de exclusión con
   justificación (docs/mutation-testing.md §umbral y equivalentes) para un
   fichero sin lógica mutable. NO es relajar la red: no hay predicados que medir.
2. **Hacer `@s11` (y cualquier guard de FUENTE del `.tsx`) robusto a la
   instrumentación**, p. ej. leyendo una copia PRISTINA fuera del sandbox de
   Stryker en vez del fichero instrumentado. Es tocar tests ⇒ `tdd_craftsman`.

Sea cual sea la vía: mientras `BotonWhatsApp.tsx` esté en `mutate` Y `@s11` lea
sus bytes prohibiendo `if (`, la mutación de ese fichero SIEMPRE abortará en el
dry-run. No se declara PASS por debajo del umbral (regla dura).

## Resolución (craftsman_lead — corrección final)

**Decisión:** `src/components/BotonWhatsApp.tsx` sale de la lista `mutate` de
`stryker.config.json`. Vía documentada de la opción 1 de arriba
(docs/mutation-testing.md, fichero declarado NO-MUTABLE con justificación).

### Por qué es legítimo (no es relajar la red)
1. **El componente es un `<a>` ESTÁTICO sin lógica.** No hay predicados,
   ramas ni operadores que medir. `@s11` lo ENFORCE leyendo los bytes del
   `.tsx` y prohibiendo `if (` / `&&` / `||` / `?`: si alguien introdujese una
   condición, ese test se pone rojo. La ausencia de lógica está guardada por
   test, no asumida.
2. **Los 3 mutantes instrumentados son de STRING-LITERAL** (className / id /
   `aria-label` / atributos del `<svg>`): presentacionales, no de comportamiento.
3. **El comportamiento observable queda cubierto** por los tests SSR/a11y
   `@s1..@s14` (`src/components/boton-whatsapp.test.tsx`) y el de montaje `@s4`
   (`src/pages/boton-whatsapp-montaje.test.tsx`).
4. **El choque es estructural, no un mutante vivo:** mientras el fichero esté en
   `mutate` Y `@s11` lea sus bytes prohibiendo `if (`, Stryker aborta en el
   dry-run al instrumentar (inyecta `if (stryMutAct…`). No hay score que medir.

Ningún mutante superviviente queda sin justificar: no había score porque la
corrida no arrancaba, y el fichero no tiene lógica mutable. La red de la feature
la sostienen los tests de comportamiento, no la mutación de un render estático.

### Contrapartida (la red mutable no se afloja)
En la misma corrección se EXTRAJO la lógica pura de Equipo a
`src/components/equipo-logica.ts` (para eliminar 4 warnings react-refresh). Ese
módulo —que alberga `diasOfrecidos`, `franjasOfrecibles`, `franjasDe`,
`indiceCircular`, la lógica REALMENTE mutable— se AÑADE a `mutate` en el mismo
commit. `Equipo.tsx` se MANTIENE en la lista. Balance: sale un render estático
sin lógica, entra el núcleo mutable que antes vivía dentro de `Equipo.tsx`.

## Ruido colateral (no bloqueante, ajeno a la feature)
Warning de `DisableTypeChecksPreprocessor` al parsear
`.experimentos-tmp/head-mayusculas/index.html` (HTML mal formado). No afecta a la
mutación de este fichero; es higiene del repo (candidato a `mutator.excludedMutations`/ignore).
