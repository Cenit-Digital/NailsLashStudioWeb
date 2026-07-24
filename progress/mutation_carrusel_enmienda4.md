# Mutacion -- retiro de controles del carrusel (ENMIENDA 4)

> `mutation_tester`, 2026-07-24, rama `feature/last_fixes`. Alcance: SOLO los tres ficheros tocados
> por esta sesion (`judge` ya APPROVED en `progress/judge_retiro_whatsapp_y_carrusel.md`, veredicto
> final tras dos rondas). Comando: `node tools/mutate.mjs "src/components/Galeria.tsx,src/components/Resenas.tsx,src/components/galeria-logica.ts"`
> (== `pnpm exec stryker run --mutate <los-tres-ficheros>`, wrapper de `harness.config.json` ->
> `commands.mutate`). NUNCA `--testFiles` (0% falso con este stack, per comentario de
> `stryker.config.json`). Umbral: `harness.config.json` -> `mutation.threshold` = 1.0 /
> `stryker.config.json` -> `thresholds.break` = 100. Duracion real: 4 min 58 s, 292 mutantes
> instrumentados, 272 puntuados.

**Veredicto: FAIL**
**Score global (3 ficheros): killed+timeout 256 / puntuados 272 = 94.12% (umbral: 100%)**

## Score por fichero

| Fichero                            | % score | puntuados | killed | timeout | survived | no cov | errors |
| ----------------------------------- | ------: | --------: | -----: | ------: | -------: | -----: | -----: |
| `src/components/galeria-logica.ts` |  100.00 |        54 |     50 |       4 |      0   |      0 |      0 |
| `src/components/Galeria.tsx`       |   92.98 |       114 |    101 |       5 |      8   |      0 |      0 |
| `src/components/Resenas.tsx`       |   92.31 |       104 |     96 |       0 |      8   |      0 |      0 |

Nota: en la tabla de arriba, `galeria-logica.ts` cierra con **0 supervivientes**; `Galeria.tsx` y
`Resenas.tsx` cierran cada uno con **8 supervivientes** (16 en total).

## arranqueExplicito / debeRotar (galeria-logica.ts) -- verificado explicitamente, LIMPIO

Foco especial pedido por el encargo: **100.00%, 0 supervivientes** en `galeria-logica.ts`. Los
mutantes de la rama `if (estado.arranqueExplicito) return true` (linea 119) y de la interfaz
`EstadoDeRotacion.arranqueExplicito` mueren TODOS -- killed por `galeria-logica.test.ts` @s8
("la parada pedida por el usuario GANA sobre todo, incluso sobre el arranque explicito", killed 5)
y @s11 ("el arranque explicito GANA sobre el raton encima y sobre el foco dentro", killed 2), que
ejercitan `debeRotar({...arranqueExplicito: true})` directamente como funcion pura, sin pasar por
ningun componente. Esto CONFIRMA por mutacion, no solo por inspeccion, que la decision del
`tdd_craftsman` (conservar la capacidad pura con test dedicado, aunque hoy ningun componente la
invoque con `true`) no deja ningun agujero de asercion: la funcion tiene cobertura de mutacion total
como unidad reutilizable.

En `Galeria.tsx`/`Resenas.tsx`, el literal `arranqueExplicito: false` de la llamada a `debeRotar`
(`Galeria.tsx:118`, `Resenas.tsx:97`) NO aparece en la lista de supervivientes de abajo: el mutante
`BooleanLiteral` ahi (`false` -> `true`) SI murio (killed) -- cualquiera de los tests de `raton`/`foco`
que paran la rotacion lo mata, porque con `arranqueExplicito: true` fijo la rotacion nunca pararia con
el raton encima ni el foco dentro. **No hay senal de que la decision del `tdd_craftsman` merezca
revisarse.**

## Mutantes sobrevivientes (16) -- NINGUNO es equivalente, los dos ficheros comparten la MISMA causa

Los 16 supervivientes se agrupan en una unica familia: el efecto de `prefers-reduced-motion` (arranca
pausado + escucha en caliente). Ninguno toca codigo retirado por la ENMIENDA 4 en si
(`alternarRotacion`, `claveDeRotacion`, `etiquetaDeRotacion`, el cableado de `arranqueExplicito`) --
pero SI es una CONSECUENCIA DIRECTA de esa retirada: al borrar el boton "Iniciar"/"Parar" y su nombre
accesible (`ETIQUETA_INICIAR`/`ETIQUETA_PARAR`, `data-estado`), la suite perdio el UNICO observable
DIRECTO del estado `pausado` (antes: `expect(control()).toHaveAccessibleName(ETIQUETA_INICIAR)` justo
tras montar con la preferencia activa) y el unico test que verificaba la reanudacion con un intervalo
CORTO tras pulsar "Iniciar" (`avanzar(2000)`, no un multiplo del ciclo). Confirmado por diff contra
HEAD (`git diff HEAD -- src/components/galeria.test.tsx`): los dos tests retirados eran exactamente
`@s12 el control se anuncia "Iniciar...", NO expone disabled...` y `@s12 pulsar "Iniciar" bajo
movimiento reducido SI arranca la rotacion` (este ultimo con `avanzar(2000)`).

Lo que queda para probar el efecto es UNICAMENTE temporal, y las aserciones vivas de `@s12`/`@s8 (@s12
de galeria)` que deberian matar estos mutantes usan **`avanzar(12000)`** -- que con `TOTAL = 6`
fotos/testimonios y `MILISEGUNDOS_POR_FOTO = 2000` es EXACTAMENTE **una vuelta completa**
(`6 x 2000 = 12000`). Si el efecto de pausa no hiciera nada (mutante vivo) el reloj rotaria igualmente
sin parar, pero tras una vuelta completa **vuelve a caer en el mismo indice** que si nunca se hubiera
movido -- la asercion `expect(centrada(container)).toBe(0)` (o `.toBe(1)` tras un desplazamiento
manual previo) es CIERTA en los dos mundos y no distingue "pausado" de "dio una vuelta entera". El
propio fichero demuestra que el equipo YA conocia este riesgo y lo evito en otro escenario vecino: el
test `@s10 el PUNTERO para... REANUDA sola al salir` usa a proposito `avanzar(8000)` (NO multiplo de
12000) con el comentario explicito "La media del Given: sin esta comprobacion el Then pasaria aunque
la pausa no existiera." -- exactamente el problema que aqui SI ocurre, sin ese resguardo, en `@s12`.

No son mutantes equivalentes: cambian comportamiento observable real (el carrusel gira cuando deberia
seguir parado por `prefers-reduced-motion`, o dispara `matchMedia` con una consulta vacia en vez de la
consulta real). Simplemente ningun test vivo hoy lo distingue por el motivo de arriba. Se documentan
para que el `tdd_craftsman` los mate -- probablemente ampliando `@s12`/`@s8 (@s12 de galeria)` con una
comprobacion a un tiempo NO multiplo del ciclo completo (p. ej. `avanzar(2000)` o `avanzar(8000)` tras
activar la preferencia, en vez de saltar directo a `avanzar(12000)`) y, para el `StringLiteral`, con
una asercion sobre el argumento exacto pasado a `matchMedia` (hoy el stub no lo comprueba).

### src/components/Galeria.tsx (8 supervivientes)

- **Galeria.tsx:84:38** `StringLiteral` -- `CONSULTA_MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)'` -> `""`.
  Falta: una asercion sobre la consulta EXACTA que recibe `window.matchMedia` (hoy el stub de test
  computa `matches` a partir de `consulta === '(prefers-reduced-motion: reduce)'`, pero ningun test
  falla si `Galeria.tsx` llamase a `matchMedia('')`: con la cadena vacia, `matches` da `false` con
  `conMovimientoReducido()` activo, y el unico test que deberia notarlo cae en el problema del ciclo
  completo de abajo).
- **Galeria.tsx:135:11** `ConditionalExpression` -- `if (preferencia.matches) {` -> `if (false) {`.
- **Galeria.tsx:135:32** `BlockStatement` -- `if (preferencia.matches) { setPausado(true) }` -> `if (preferencia.matches) {}`.
- **Galeria.tsx:136:20** `BooleanLiteral` -- `setPausado(true)` -> `setPausado(false)` (dentro del `if` de arranque).
  Falta para las tres de arriba: una comprobacion del arranque pausado a un `avanzar(N)` que NO sea
  multiplo de `TOTAL x MILISEGUNDOS_POR_FOTO` (12000 = 6x2000); hoy `@s12 a los 12000 ms sigue
  centrada la PRIMERA...` no distingue "arranco pausado" de "dio una vuelta entera sin parar".
- **Galeria.tsx:142:71** `BlockStatement` -- vacia el cuerpo entero de `alCambiarLaPreferencia`.
- **Galeria.tsx:143:13** `ConditionalExpression` -- `if (cambio.matches) {` -> `if (false) {`.
- **Galeria.tsx:143:29** `BlockStatement` -- `if (cambio.matches) { setPausado(true) }` -> `if (cambio.matches) {}`.
- **Galeria.tsx:144:22** `BooleanLiteral` -- `setPausado(true)` -> `setPausado(false)` (dentro del listener `change`).
  Falta para las cuatro de arriba: mismo problema, en `@s12 activar la preferencia con la pagina
  abierta pausa la rotacion EN CURSO` -- arranca sin preferencia, avanza 2000 ms (activo=1), dispara el
  `change`, y comprueba con `avanzar(12000)` que sigue en 1: si el `change` NO pausara nada, 6 ticks
  mas devolverian el indice a 1 igualmente (vuelta completa desde 1). Un `avanzar` intermedio
  (p. ej. 2000 u 8000 antes de completar la vuelta) romperia la coincidencia.

### src/components/Resenas.tsx (8 supervivientes, misma familia -- el efecto es una copia hermana)

- **Resenas.tsx:68:38** `StringLiteral` -- misma mutacion que Galeria.tsx:84:38, mismo motivo.
- **Resenas.tsx:111:11** `ConditionalExpression` -- `if (preferencia.matches) {` -> `if (false) {`.
- **Resenas.tsx:111:32** `BlockStatement` -- vacia el `if` de arranque.
- **Resenas.tsx:112:20** `BooleanLiteral` -- `setPausado(true)` -> `setPausado(false)`.
- **Resenas.tsx:117:71** `BlockStatement` -- vacia `alCambiarLaPreferencia`.
- **Resenas.tsx:118:13** `ConditionalExpression` -- `if (cambio.matches) {` -> `if (false) {`.
- **Resenas.tsx:118:29** `BlockStatement` -- vacia el `if` del listener `change`.
- **Resenas.tsx:119:22** `BooleanLiteral` -- `setPausado(true)` -> `setPausado(false)` (listener `change`).

  Mismo motivo que en Galeria.tsx: `@s8 (@s12 de galeria) a los 12000 ms sigue centrado el PRIMERO...`
  y `@s8 (@s12 de galeria) activar la preferencia con la pagina abierta pausa la rotacion EN CURSO`
  (`resenas.test.tsx:875-923`) usan exclusivamente `avanzar(12000)` tras el `render`/`change`, la
  misma vuelta completa de 6x2000 ms.

## Mutantes NO declarados equivalentes

Ninguno de los 16 se declara equivalente: los 16 cambian comportamiento observable real (la rotacion
seguiria girando bajo `prefers-reduced-motion`, o `matchMedia` recibiria una consulta distinta a la
real). No se excluye ninguno -- es trabajo del `tdd_craftsman` ampliar `@s12`/`@s8 (@s12 de galeria)`
con un tiempo no multiplo del ciclo completo (patron ya usado correctamente en `@s10`, `avanzar(8000)`)
y, para el `StringLiteral`, una asercion sobre el argumento exacto de `matchMedia`.

## Timeouts (9, no bloqueantes)

9 mutantes de `Galeria.tsx` (5) y `galeria-logica.ts` (4) terminaron en `timeout`, no en `survived`:
Stryker los cuenta como matados a efectos de score (confirmado arriba: 100.00% en `galeria-logica.ts`
con 4 timeouts y 0 supervivientes). No requieren accion.

## Conclusion

- **`galeria-logica.ts` (con el foco en `arranqueExplicito`/`debeRotar`): 100%, sin hallazgos.** La
  decision del `tdd_craftsman` de conservar la funcion pura con su parametro queda validada por
  mutacion, no solo por revision.
- **`Galeria.tsx` (92.98%) y `Resenas.tsx` (92.31%): FAIL**, 8 supervivientes cada uno, los 16 de la
  MISMA familia (el efecto `prefers-reduced-motion`), causados por la perdida del observable directo
  del boton retirado + una eleccion de tiempo (`avanzar(12000)`) que coincide con una vuelta completa
  del carrusel. No es un hueco nuevo de diseno: es deuda de asercion, competencia del `tdd_craftsman`
  (escribir el test rojo que la mate, con el mismo patron que ya usa `@s10`), no del `mutation_tester`.
- **Veredicto global: FAIL.** Score 94.12% sobre el umbral 100% exigido por `harness.config.json` ->
  `mutation.threshold` / `stryker.config.json` -> `thresholds.break`. No se cierra la sesion (F-22/F-14)
  hasta que los 16 supervivientes mueran o se re-litiguen con justificacion de equivalencia explicita
  (ninguno cualifica hoy).

## Remate — mutantes matados (2026-07-24)

`tdd_craftsman`, mismo dia, tras este informe. Los 16 supervivientes de la unica familia
(`prefers-reduced-motion`) se matan AMPLIANDO el contrato de aserciones de `@s12`/`@s8 (@s12 de
galeria)` -- ninguna exclusion, ningun cambio de produccion (Ley 1: el codigo de `Galeria.tsx`/
`Resenas.tsx` ya hacia lo correcto; lo que faltaba era la asercion que lo demostrara). Detalle
completo del ciclo en `progress/tdd_carrusel_enmienda4.md` seccion "Remate — mutantes de
`prefers-reduced-motion` matados (2026-07-24)".

Dos cambios, por fichero (`galeria.test.tsx` y `resenas.test.tsx`, mismo patron en los dos):

1. **`StringLiteral` (84:38 / 68:38)**: el stub de `matchMedia` en el describe de `@s12`/`@s8 (@s12
   de galeria)` pasa de funcion suelta a `vi.fn(...)` (variable `matchMedia`, devuelta por
   `stubDeMatchMedia`). Test nuevo `'@s12 window.matchMedia se consulta con la media query EXACTA de
   movimiento reducido'` / `'@s8 window.matchMedia se consulta con la media query EXACTA de
   movimiento reducido'`: `expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion:
   reduce)')` (literal escrito a mano, nunca importado de produccion -- anti-tautologia).
2. **Los 7 mutantes de `if`/`BlockStatement`/`BooleanLiteral`** (arranque + listener `change`):
   ampliados los DOS tests que antes saltaban directo a `avanzar(12000)` (una vuelta completa,
   6×2000 ms) con un checkpoint intermedio a un tiempo NO multiplo del ciclo (mismo patron que
   `@s10`, `avanzar(8000)`):
   - `'@s12 a los 12000 ms sigue centrada la PRIMERA...'` / `'@s8 a los 12000 ms sigue centrado el
     PRIMERO...'`: `avanzar(2000)` + `expect(centrada(...)).toBe(0)` ANTES de completar los 12000 ms
     totales. Mata 135:11, 135:32, 136:20 (Galeria) / 111:11, 111:32, 112:20 (Resenas).
   - `'@s12 activar la preferencia con la pagina abierta pausa la rotacion EN CURSO'` / `'@s8 activar
     la preferencia con la pagina abierta pausa la rotacion EN CURSO'`: tras disparar el `change` a
     `matches: true`, `avanzar(8000)` + `expect(centrada(...)).toBe(1)` ANTES de completar el resto
     hasta 12000 ms. Mata 142:71, 143:13, 143:29, 144:22 (Galeria) / 117:71, 118:13, 118:29, 119:22
     (Resenas).

**Re-medicion** (`node tools/mutate.mjs "src/components/Galeria.tsx,src/components/Resenas.tsx"`,
mismo comando, `galeria-logica.ts` fuera de esta corrida por ya estar 100% limpio):

| Fichero                      | % score | puntuados | killed | timeout | survived |
| ----------------------------- | ------: | --------: | -----: | ------: | -------: |
| `src/components/Galeria.tsx` |  100.00 |       114 |     96 |      18 |        0 |
| `src/components/Resenas.tsx` |  100.00 |       104 |    104 |       0 |        0 |

**Score global (2 ficheros): 100.00%, 0 supervivientes, 0 no-cov, 0 errores.** Umbral 100% superado
(`Final mutation score of 100.00 is greater than or equal to break threshold 100`). Ningun
superviviente NUEVO ni distinto de los 16 ya diagnosticados: los 16 mueren exactamente por las
aserciones descritas arriba, sin exclusiones. Sube el numero de `timeout` en `Galeria.tsx` (5 -> 18)
por los tests nuevos/ampliados cronometrando el reloj falso mas veces -- Stryker los cuenta como
matados a efectos de score (igual que en la corrida original, sin accion requerida).

`pnpm test` completo tras el remate: **1301/1301 verdes, 39 ficheros** (1299 -> 1301, +2 tests: uno
nuevo por fichero para la asercion de `matchMedia`; los otros 4 checkpoints se añadieron DENTRO de
tests ya existentes, sin crear tests nuevos). `pnpm typecheck`/`pnpm lint`: 0 errores.

**Cierre de este informe**: `galeria-logica.ts` (100%, ya limpio antes del remate) + `Galeria.tsx`
(100%) + `Resenas.tsx` (100%) = **los tres ficheros del alcance de la ENMIENDA 4 en 100%, 0
supervivientes, 0 exclusiones.** Pendiente: `judge` re-veredicto sobre el delta de tests (no hay
cambio de contrato: la ampliacion es puramente de aserciones sobre un `Then` ya existente, @s12).
