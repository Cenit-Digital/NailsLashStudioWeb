# Mutación — feature 25 `logo_acoplado`

**Veredicto:** PASS
**Score:** killed/total por fichero (umbral: 100 %, `harness.config.json` → `mutation.threshold` 1.0;
`stryker.config.json` → `thresholds.break` 100):

- `src/components/logo-acoplado-logica.ts` → 43/43 = **100,00 %**
- `src/components/LogoAcoplado.tsx` → 48/48 = **100,00 %** (49 instrumentados, 1 equivalente
  DEMOSTRADO y marcado; sin la marca daba 48/49 = 97,96 %)
- `src/components/Hero.tsx` (enmendado por F-25) → 50/50 = **100,00 %** (51 instrumentados, 1
  `Ignored` PREEXISTENTE, el de `:157`, anterior a F-25)
- `src/components/Cabecera.tsx` (enmendado por F-25) → 1/1 = **100,00 %**

Sobrevivientes no equivalentes: **ninguno**. No hay receta para el `tdd_craftsman`.

## Base de la medición

- `src/` y la configuración, tal como están en `bc9bd67` (judge APPROVED en la revisión delta).
  - A mitad de la sesión entró `e240154` (`docs(encargo)`), que solo toca
    `progress/brief_foto_logo_catalogo.md`. `src/` y `stryker.config.json` no cambiaron, así que las
    mediciones valen.
  - Esa enmienda del encargo (la cabecera móvil en una fila sin «Reservar») puede tocar
    `Cabecera.tsx` o `LogoAcoplado.tsx`. Si llega a producción, hay que volver a medir.
- Runner: StrykerJS 9.6.1, `@stryker-mutator/vitest-runner`, `coverageAnalysis: perTest`, con
  `vitest.stryker.config.ts` (los `*-horneado` quedan fuera de la mutación por diseño). Node v22.22.2.
- Acotado SIEMPRE con `--mutate <fichero>` a través de `tools/mutate.mjs`. **Nunca** `--testFiles`.
- Todo EN SERIE, un fichero cada vez. Antes de cada corrida comprobé con `ps` que no hubiera otro
  `vitest`, `stryker` ni `harness`: había 0 en todas las corridas desde las 08:24:44 (ver el incidente
  de concurrencia más abajo). No ejecuté `pnpm build` ni lo lancé aparte.

## Comandos exactos y duración (por orden)

| #   | Comando                                                                                               | Exit | Pared       | Stryker/Vitest | Resultado                                                    |
| --- | ----------------------------------------------------------------------------------------------------- | ---- | ----------- | -------------- | ------------------------------------------------------------ |
| 1   | `node tools/mutate.mjs src/components/logo-acoplado-logica.ts`                                        | 0    | 36 s        | Done in 33 s   | 43/43, 100 %                                                 |
| 2   | `node tools/mutate.mjs src/components/LogoAcoplado.tsx` (SIN marca)                                   | 1    | 53 s        | Done in 50 s   | 48/49, 97,96 %: 1 superviviente, `122:6 ArrayDeclaration`    |
| 3   | Mutante aplicado A MANO en `LogoAcoplado.tsx:122` y después `pnpm test` (suite COMPLETA)              | 0    | 84 s        | vitest 82,45 s | **51/51 ficheros, 1672/1672 tests VERDES**; restaurado       |
| 4   | Marca → `pnpm exec prettier --check` y `pnpm exec eslint` sobre `src/components/LogoAcoplado.tsx`     | 0/0  | —           | —              | limpio                                                       |
| 5   | `pnpm exec vitest run` de los 4 tests de F-25 (`logo-acoplado{,-estilos,-logica,-derivacion}.test.*`) | 0    | 7 s         | 4,71 s         | 111/111 (las guardas de bytes de @s17/@s26 leen esta fuente) |
| 6   | `node tools/mutate.mjs src/components/LogoAcoplado.tsx` (CON marca)                                   | 0    | 38 s        | Done in 35 s   | 48 killed + 1 Ignored, 100 %                                 |
| 7   | `node tools/mutate.mjs src/components/Hero.tsx`                                                       | 0    | 36 s        | Done in 34 s   | 50 killed + 1 Ignored (preexistente), 100 %                  |
| 8   | `node tools/mutate.mjs src/components/Cabecera.tsx`                                                   | 0    | 19 s        | Done in 16 s   | 1/1, 100 %                                                   |
| 9   | `pnpm test` (suite COMPLETA, árbol marcado) y después `pnpm format:check`                             | 0/0  | 86 s + 19 s | —              | 51/51, 1672/1672; Prettier limpio                            |

`tools/mutate.mjs <f>` ejecuta `pnpm exec stryker run --mutate <f>`. Los logs y los informes HTML de
cada corrida están en el scratchpad de la sesión:
`/tmp/claude-0/-home-user-NailsLashStudioWeb/dffbd73b-3f81-5e8b-8819-805db4e58549/scratchpad/`
(`m1_logica.*`, `m2_componente.*`, `m3_componente_marcado.*`, `m4_hero.*`, `m5_cabecera.*`,
`suite_mutante_122.log` y `suite_final_marcado.log`).

## Tabla por fichero (clear-text de Stryker + JSON del informe HTML)

| Fichero                   | Instrumentados | Killed | Survived | Sin cobertura | Timeout | Errores | Equivalentes (Ignored) | Estáticos | Tests en dry run | Tests/mutante | Score        |
| ------------------------- | -------------: | -----: | -------: | ------------: | ------: | ------: | ---------------------: | --------: | ---------------: | ------------: | ------------ |
| `logo-acoplado-logica.ts` |             43 |     43 |        0 |             0 |       0 |       0 |                      0 |         0 |              182 |          5,86 | **100,00 %** |
| `LogoAcoplado.tsx`        |             49 |     48 |        0 |             0 |       0 |       0 |         1 (demostrado) |         8 |              182 |          7,92 | **100,00 %** |
| `Hero.tsx`                |             51 |     50 |        0 |             0 |       0 |       0 |       1 (preexistente) |        20 |              224 |             — | **100,00 %** |
| `Cabecera.tsx`            |              1 |      1 |        0 |             0 |       0 |       0 |                      0 |         1 |              182 |             — | **100,00 %** |

- `LogoAcoplado.tsx`, SIN la marca (corrida 2): 49 instrumentados, 48 killed, 1 survived y 0 sin
  cobertura, que dan **97,96 %** (exit 1, bajo `break` 100). Los 8 estáticos (el cuerpo del componente
  en render) están todos matados, salvo el equivalente.
- `Hero.tsx`:
  - El `Ignored` es el `ArrayDeclaration` de `:157`, marcado antes de F-25
    (`progress/mutation_hero_caligrafia_lenta.md`).
  - Los dos atributos que añadió F-25 (`data-acople="origen"` en `:210` y `data-acople="disparo"` en
    `:268`) **no generan mutantes**: StrykerJS no muta literales de atributo JSX. Tampoco hay mutantes en
    los `aria-hidden="true"` ni en los `focusable="false"` vecinos, ni en los de `LogoAcoplado.tsx`.
  - Lo que sí se mide son los selectores que los leen, `LogoAcoplado.tsx:31:41` (`'[data-acople="origen"]'`)
    y `:76:44` (`'[data-acople="disparo"]'`). Sus `StringLiteral` → `""` están **Killed**.
  - La mordida de los atributos mismos la midió el judge con sabotajes: Q (sin `origen`) dio 2 rojos,
    Q2 (`disparo` en el primer `<span>`) 1 rojo y Q3 (sin `disparo`) 2 rojos.
- `Cabecera.tsx` ha quedado en JSX puro. Su único mutante es el `BlockStatement` del cuerpo
  (`12:28`, estático), que está Killed. Antes de F-25 también tenía 1
  (`progress/mutation_header_nav_footer.md`).

## Mutantes sobrevivientes

Ninguno que no sea equivalente. El único que sobrevivió (corrida 2) es el equivalente previsto por
el judge (N6), demostrado a continuación.

## Equivalente DEMOSTRADO y marcado

- **Dónde:** `src/components/LogoAcoplado.tsx:122:6` antes de la marca. Tras la reindentación que
  exige Prettier queda en `:131:5`.
- **Mutador:** `ArrayDeclaration`. Original `}, [])` (las deps del efecto de montaje, el que crea el
  `IntersectionObserver`); mutado `}, ["Stryker was here"])`.
- **Qué dijo Stryker:** `Survived`, `static: true`. «Ran all tests for this mutant»: **182 tests
  completados** sobre él. Los cubren `logo-acoplado.test.tsx` (42), `cabecera.test.tsx` (3),
  `logo-acoplado-derivacion.test.tsx` (3), `resenas.test.tsx` (5), `nailbot-flotante.test.tsx` (2) y
  `home.test.tsx` (2). Ninguno lo mata.
- **Sabotaje a mano:**
  - Apliqué exactamente ese cambio sobre la fuente real, con copia byte a byte en el scratchpad.
  - `pnpm test` COMPLETO, con los horneados build-based que la mutación excluye: **51/51 ficheros,
    1672/1672 VERDES** (exit 0, 82,45 s).
  - Restauré desde la copia: `cmp` idéntico y `git diff` vacío.
- **Por qué es equivalente:**
  - React compara las deps de `useEffect` entre renders elemento a elemento con `Object.is`.
  - Con `[]` no hay elementos: el efecto no se vuelve a ejecutar nunca.
  - Con `["Stryker was here"]`, cada render crea un array nuevo, pero su único elemento es el MISMO
    primitivo (`Object.is` da `true`), así que tampoco se vuelve a ejecutar.
  - En las dos versiones el efecto corre EXACTAMENTE una vez al montar y limpia (`disconnect`) solo
    al desmontar. Bajo StrictMode, el doble montaje de desarrollo es idéntico en ambas.
  - La longitud de las deps no cambia entre renders de una misma versión, así que tampoco hay aviso
    de React que las distinga.
  - El cuerpo del efecto solo lee refs (`enlace` y `logo`), constantes de módulo y el DOM. No captura
    estado ni props que pudieran quedarse viejos de forma distinta.
- **Por qué ningún test puede matarlo:**
  - No existe una salida observable (DOM, atributos, llamadas al observador, commits) que difiera.
  - Lo único distinto es el literal del segundo argumento de `useEffect`. Para verlo habría que
    interceptar React o leer los bytes de la fuente, y eso no es comportamiento.
  - Además, con el _mutant switching_ de Stryker, un test de bytes lee el MISMO fichero instrumentado
    para todos los mutantes, así que tampoco lo mataría.
  - Contraste de que la suite SÍ muerde este efecto: en la misma corrida murieron su `BlockStatement`
    (`71:19`), las dos guardas (`72:9` y `78:9`, con sus variantes), el `ObjectLiteral` de las opciones
    (`111:7`) y el `BlockStatement` del cleanup (`119:18`).
- **Familia:** es la misma que los precedentes ya verificados en `Hero.tsx:156-157`,
  `Galeria.tsx:158-159` y `:276-277`, `Equipo.tsx:214-215`, `Resenas.tsx` y `NailbotFlotante.tsx`.
- **Marca aplicada** (única edición en `src/`, solo comentarios más el formato que exige Prettier):
  - La línea `// Stryker disable next-line ArrayDeclaration: equivalente demostrado en progress/mutation_logo_acoplado.md`
    va sobre el `[]`, que queda en su propia línea.
  - Encima, un comentario con la justificación.
  - Uso el mutador concreto y no `all`: deja medido cualquier otro mutador que alguna vez caiga en
    esa línea.
  - La directiva se ubicó donde StrykerJS 9.6.1 la lee. `DirectiveBookkeeper` la toma de los
    `leadingComments` del nodo y la aplica a la línea donde empieza ese nodo, así que tiene que preceder
    al `[]`.
  - La corrida 6 lo confirma: `ArrayDeclaration 131:5 Ignored`, con la razón «equivalente demostrado
    en progress/mutation_logo_acoplado.md».
  - El comentario evita los tokens que vetan las guardas de bytes de @s26 y @s17 (`matchMedia`,
    `animation`, `aria-label`, «trazo-marca» fuera del import, el nombre de la marca y las etiquetas
    con `<`). Lo verifican las corridas 5 y 9.
- **Diff:** `git diff -w src/components/LogoAcoplado.tsx` muestra solo el paso de
  `useEffect(() => {…}, [])` a la forma multilínea, más el comentario. El resto del diff (61+/51−) es
  la reindentación de 2 espacios del cuerpo. **No está commiteado:** lo dejo en el árbol para que el
  lead lo commitee junto con este informe.

## Incidente de concurrencia (a conocimiento del lead)

- Entre ≈08:12:30 y ≈08:24 corrieron **dos `bin/harness init` que no eran míos**. Eran hijos del
  proceso principal (PID 2013 y, después, PID 3118).
  - El primero arrancó en los últimos ≈15 s de mi corrida 2. Esa corrida acabó limpia: 0 timeouts,
    0 errores y 0 sin cobertura.
- Al detectarlo, yo ya había aplicado el mutante del sabotaje, y estuvo en disco ≈20 s (≈08:13:50 →
  08:14:11) mientras corría la suite de ese `init`.
  - Lo restauré en el acto, con `cmp` idéntico, y esperé a que el contenedor quedara en reposo antes
    de repetir el sabotaje.
  - Es el equivalente que Stryker ya había pasado con 182 tests, así que no debería alterar ese
    resultado. Aun así, si ese `init` dio algo raro, este es el motivo a descartar.
- Desde las 08:24:44 todas mis corridas (3 a 9) fueron en solitario.

## Nota de proceso

- No escribí ni toqué ningún test.
- La única edición en `src/` es la marca del equivalente demostrado, que el lead autorizó para este
  caso. `stryker.config.json` no cambió.
- Los sabotajes se restauraron byte a byte. `git status --short` muestra solo
  `M src/components/LogoAcoplado.tsx` (la marca) y este informe.
- C7 (prueba de mutación) queda **cumplido** para F-25: los 4 ficheros están al 100 %. Siguen
  pendientes del lead la verificación en vivo (@s28-@s33) y el cierre.

## ENMIENDA E-1 (2026-09-30) — sin mutación propia, declarado

La ENMIENDA E-1 (cabecera móvil en una fila sin «Reservar», `ba65804`) solo toca
`src/components/cabecera.module.scss` y tests: **no hay TypeScript mutable nuevo** (Stryker no ve SCSS; el
`judge` lo confirma en `progress/judge_logo_acoplado_e1.md`). Su defensa son los tests de bytes de @s35-@s38,
medidos con 38 sabotajes (37 rojos + 1 equivalente) por el `judge`. Los ficheros mutables de F-25 no cambian
desde `117edd1`, así que su 100 % sigue vigente. Decisión del craftsman_lead, por escrito en vez de fingir
cobertura (regla de `feature_list.json`: «Stryker no ve CSS/SCSS»).
