# TDD — Sincronización de `src/` con la ENMIENDA 4 (2026-07-24)

> Feature: 22 — `galeria_carrusel` (F-22, `done`) y, por herencia, 14 — `resenas_agregado_enlace`
> (F-14, `done`). Encargo del `craftsman_lead` tras la ENMIENDA 4 del `gherkin_author`
> (`progress/enmienda4_carrusel_sc222.md`, bloque «Siguiente paso (fuera de esta sesión)»): dejar
> `Galeria.tsx`, `Resenas.tsx`, `galeria.test.tsx` y `resenas.test.tsx` sincronizados con el
> contrato ya amendado, por TDD. NO se re-litiga la decisión de Pablo (conservar su edición a mano,
> commit `9cf32a9`, WCAG 2.2 SC 2.2.2 ya no se cumple para quien navega solo con ratón o solo con
> el dedo): esa puerta humana ya está cerrada.

## Punto de partida (verificado antes de tocar nada)

- `pnpm typecheck`: 6 errores `TS6133` — `claveDeRotacion`/`etiquetaDeRotacion` (import no leído) y
  `alternarRotacion` (declarada, nunca leída) en `Galeria.tsx` y en `Resenas.tsx`.
- `pnpm lint`: los mismos 6, como `@typescript-eslint/no-unused-vars`.
- `pnpm vitest run src/components/galeria.test.tsx`: **30 de 90 fallando** — todos por
  `TestingLibraryElementError: Unable to find an accessible element with the role "button"` sobre
  «Anterior», «Siguiente» o el control de rotación (ya no existen en el DOM: Pablo los borró del
  JSX a mano en el commit `9cf32a9`, antes de esta sesión).
- `pnpm vitest run src/components/resenas.test.tsx`: **27 de 107 fallando**, mismo patrón.

## 1. Código muerto retirado (sin ciclo rojo-verde: es retirar, no implementar)

- `Galeria.tsx` / `Resenas.tsx`: borrados `alternarRotacion` (sin llamador: el `onClick` que lo
  invocaba ya no existe en el JSX) y los imports `claveDeRotacion`/`etiquetaDeRotacion` de
  `galeria-logica.ts`.
- Comprobado por grep que `claveDeRotacion`/`etiquetaDeRotacion` (las funciones EN SÍ, en
  `galeria-logica.ts`) se quedaban sin NINGÚN llamador en `src/` fuera de su propio describe
  dedicado en `galeria-logica.test.ts` (`@s8 @s11 @s12 la etiqueta del control de rotación CAMBIA
  con el estado`, 3 tests). Regla dura del repo: "código que nadie pidió no existe" — no hay razón
  de peso para conservar una etiqueta y un data-estado de un control que ya no se monta nunca, así
  que se retiraron las dos funciones de `galeria-logica.ts` y su describe dedicado (import +
  bloque) de `galeria-logica.test.ts`. Nada más de `galeria-logica.ts`/`carrusel-logica.ts` se
  tocó: `debeRotar` (que SÍ sigue con llamador real en producción, aunque su rama
  `arranqueExplicito` ya no sea alcanzable por UI) se dejó intacto, fuera de alcance del encargo.
- Efecto colateral: `control()` (el helper de test que buscaba el botón por su nombre accesible
  cambiante) y las constantes `ETIQUETA_PARAR`/`ETIQUETA_INICIAR` quedaron sin ningún llamador en
  `galeria.test.tsx` y en `resenas.test.tsx` una vez retirados los bloques @s8/@s11/@s24 (ver
  abajo): se retiraron también (mismo criterio anti-código-muerto, esta vez en tests).

## 2. Escenarios `[RETIRADO]` — bloques `describe` borrados enteros

Mismo criterio en `galeria.test.tsx` y en `resenas.test.tsx` (buscando el rótulo `(@sN de
galería)` en el segundo fichero):

| Tag  | `galeria.test.tsx`                                                             | `resenas.test.tsx` (rótulo `(@sN de galería)`)                    |
|------|----------------------------------------------------------------------------------|---------------------------------------------------------------------|
| —    | `describe('Galería — los botones de flecha tienen nombre accesible', …)` (sin tag, el más antiguo, 1 test) | (no tenía equivalente propio)                                       |
| @s8  | `describe('@s8 el control de rotación es el PRIMER tabulable…', …)` (8 tests: 7 rojos + 1 huérfano) | `describe('@s8 (@s8 de galería) el control de rotación…', …)` (6 tests: 5 rojos + 1 huérfano) |
| @s11 | `describe('@s11 «Iniciar» arranca la rotación AHORA…', …)` (2 tests)              | `describe('@s8 (@s11 de galería) «Iniciar» arranca AHORA…', …)` (2 tests) |
| @s16 | `describe('@s16 las flechas mueven UNA posición…', …)` (it.each ×4 + 1 test = 5 tests) | `describe('@s8 (@s16 de galería) las flechas mueven UNA posición…', …)` (it.each ×4 + 1 test = 5 tests) |
| @s24 | `describe('@s24 los mandos flotan SOBRE el marco…', …)` (2 tests)                 | `describe('@s8 (@s24 de galería) los mandos de cristal flotan…', …)` (2 tests) |

"Huérfano" = test que YA pasaba (su aserción no dependía del control retirado) pero cuyo ÚNICO
sujeto (el describe entero) desapareció con el escenario: se retira junto al bloque, no se salva
suelto.

En `resenas.test.tsx` además: el And superviviente de "en la home conviven DOS «Anterior», DOS
«Siguiente» y DOS controles de rotación" (dentro del describe de convivencia de los dos carruseles)
se retiró — según fija el propio `features/resenas_agregado_enlace.feature` @s8 amendado, lo que
lo sustituye ("ningún id compartido y grupos de puntos con nombre propio") **ya estaba cubierto**
por los otros dos tests del mismo describe, así que no hizo falta escribir uno nuevo.

Cada bloque se borró y se corrió la suite del fichero: sin arrastres.

## 3. Escenarios `[AJUSTADO]` — TDD real, mecanismo nuevo, mismo Then

Por cada uno: edité el test, corrí `pnpm vitest run <fichero> -t "<tag>"` y confirmé verde antes de
seguir con el siguiente. Mapa `@s → qué cambió → test`:

- **@s2** (`galeria.test.tsx` + espejo en `resenas.test.tsx` vía @s1/@s2 propios) — donde antes se
  exigía `getByRole('button', { name: 'Anterior' })`/`'Siguiente'` (existencia), ahora se exige
  `queryByRole(...)).toBeNull()` (ausencia), con la misma precisión. Test:
  `'@s2 la nota honesta sigue horneada, carácter a carácter, y ya NO existe ningún «Anterior» ni
  «Siguiente»'`.
- **@s6** — se borró SOLO el `it` que aseveraba `aria-controls` de las flechas hacia la pista; el
  resto del describe (`role=group`, `aria-roledescription`, `aria-labelledby`, las seis
  diapositivas nunca ocultas, el orden del DOM) se dejó intacto, en los dos ficheros.
- **@s7** — CONFIRMADO sin cambio en el `.feature`, pero su segundo test (`'parada por el
  usuario'`) usaba `click(control())` para llegar al estado `rotando=no, foco=no`: ese control ya
  no existe. Se cambió el mecanismo a `fireEvent.mouseEnter(carruselDe(container))` (raton=true),
  que la propia ENMIENDA 4 señala como la vía que sobrevive para esa fila. El `Then`
  (`aria-live="polite"`) no cambió. Mismo arreglo en `resenas.test.tsx`.
- **@s10** — el `Then` de la fila del foco NO cambia (sigue centrando la PRIMERA); se cambió el
  elemento que recibe el foco (de «Siguiente», retirado, a un punto indicador «Ver la foto 1 de
  6» / «Ver el testimonio 1 de 6», que la ENMIENDA 4 nombra como sustituto de "cualquier tabulable
  del carrusel") y se actualizó el título/comentario a "pegajosa PERMANENTE, nada la devuelve".
- **@s12** — de las 8 (galería) / 8 (reseñas) aserciones del describe, 4 fallaban en cada fichero:
  - `'el control se anuncia «Iniciar…»…'` → reescrito a `'las seis diapositivas siguen presentes…'`
    (se quitan las 3 aserciones sobre el control retirado, se conserva la de las diapositivas).
  - `'pulsar «Iniciar» bajo movimiento reducido SÍ arranca la rotación'` → reemplazado por
    `'[ENMIENDA 4] bajo esta preferencia YA NO EXISTE ninguna forma de arrancar la rotación…'`: se
    pulsa un punto indicador (mueve la foto EN EL ACTO, acción manual legítima) y se avanza el
    reloj 12000 ms comprobando que el autoplay NO arranca.
  - `'activar la preferencia… y el control pasa a «Iniciar…»'` → se quita solo la aserción del
    control; el resto (pausa la rotación en curso) queda igual.
  - `'un cambio que DESACTIVA la preferencia NO arranca una pausada: reanudar es del usuario'` →
    renombrado `'[AJUSTADO ENMIENDA 4] … no reanuda nada: la pausa es DEFINITIVA por NINGUNA vía'`,
    se quita la aserción del control (ya no hay ninguna vía, ni siquiera esa).
- **@s20** — el `When` pasó de `click('Siguiente')` a `click('Ver la foto 2 de 6')` /
  `click('Ver el testimonio 2 de 6')` (mismo efecto observable, misma vía de reinicio del reloj
  `mostrarFoto`→`reiniciarElReloj`). El último test (antes "parado por el usuario") se reescribió
  para parar el carrusel con un stub de `matchMedia` (`prefers-reduced-motion: reduce`) en vez de
  con el control retirado — es la ÚNICA parada persistente que sobrevive tras la ENMIENDA 4 — y
  vuelve a comprobar que el desplazamiento manual no arranca nada tras ella.
- **@s23** — el foco se posaba sobre «Siguiente» solo como "cualquier tabulable del carrusel": se
  sustituyó por un punto indicador («Ver la foto 1 de 6» / «Ver el testimonio 1 de 6») en los DOS
  tests del describe de foco-sin-observador, y en el test de desambiguación con dos carruseles
  (`within(carruselGaleria).getByRole('button', { name: 'Ver la foto 1 de 6' })`).
- **@s1** (galería, `'tras dar una vuelta entera…'`) — no estaba en el alcance de la ENMIENDA 4,
  pero su implementación usaba `click('Siguiente')` para recorrer las seis fotos: se cambió a
  avanzar el reloj falso 12000 ms (autoplay, mismo patrón que @s9), sin tocar la aserción (seis
  `<img>`, mismo orden, mismos `alt`).

## Mapa `@s → test` (trazabilidad)

| `@s` (galería) | Estado tras ENMIENDA 4 | Cobertura en `galeria.test.tsx` | Cobertura en `resenas.test.tsx` |
|---|---|---|---|
| @s1  | sin cambio (implementación ajustada) | `describe('@s1 …')`, 2 tests | — (F-14 no lo hereda por separado) |
| @s2  | AJUSTADO | `describe('@s2 …')`, 5 tests | `describe('@s1 …')` @s1/@s2 propios de reseñas |
| @s3–@s5 | sin cambio | `galeria-logica.test.ts` | (importa `galeria-logica.ts`) |
| @s6  | AJUSTADO | `describe('@s6 …')`, 5 tests | `describe('@s8 (@s6 de galería) …')`, 4 tests |
| @s7  | CONFIRMADO (mecanismo de test ajustado) | `describe('@s7 …')`, 2 tests | `describe('@s8 (@s7 de galería) …')`, 2 tests |
| @s8  | **RETIRADO** | *(bloque borrado)* | *(bloque borrado)* |
| @s9  | CONFIRMADO sin cambio | `describe('@s9 …')`, 2 tests | `describe('@s8 (@s9 de galería) …')`, 3 tests |
| @s10 | AJUSTADO | `describe('@s10 …')`, 2 tests | `describe('@s8 (@s10 de galería) …')`, 2 tests |
| @s11 | **RETIRADO** | *(bloque borrado)* | *(bloque borrado)* |
| @s12 | AJUSTADO | `describe('@s12 …')`, 8 tests | `describe('@s8 (@s12 de galería) …')`, 8 tests |
| @s13–@s15 | sin cambio | `galeria-estilos.test.ts` (no tocado) | `resenas-estilos.test.ts` propio (no tocado) |
| @s16 | **RETIRADO** | *(bloque borrado)* | *(bloque borrado)* |
| @s17–@s19 | sin cambio | describes `@s17`/`@s18`/`@s19` intactos | describes `(@s17/@s18/@s19 de galería)` intactos |
| @s20 | AJUSTADO | `describe('@s20 …')`, 5 tests | `describe('@s8 (@s20 de galería) …')`, 4 tests |
| @s21–@s22 | sin cambio (puro, sin UI) | `carrusel-logica.test.ts` (no tocado) | ídem |
| @s23 | AJUSTADO | 2 describes `@s23`, 9 tests | describe `(@s23 de galería)` ×2, + desambiguación |
| @s24 | **RETIRADO** | *(bloque borrado)* | *(bloque borrado)* |

## Resultado final

- `pnpm typecheck`: **0 errores**.
- `pnpm lint`: **0 errores**.
- `pnpm vitest run src/components/galeria.test.tsx`: **71/71 verdes** (90 → 71: 19 tests de
  escenarios RETIRADOS borrados —incluidos los huérfanos que no fallaban pero perdieron su sujeto—,
  el resto ajustado o intacto).
- `pnpm vitest run src/components/resenas.test.tsx`: **80/80 verdes** (97 → 80: 17 borrados entre
  bloques RETIRADOS, sus huérfanos y el And superviviente ya cubierto por otro test).
- `pnpm vitest run src/components/galeria-logica.test.ts`: **44/44 verdes** (47 → 44: retirado el
  describe dedicado a `etiquetaDeRotacion`/`claveDeRotacion`).
- `pnpm test` (suite completa): **1299/1299 verdes, 39 ficheros, 0 fallos**.

## Pendiente (fuera de esta sesión, según el encargo)

- Re-correr mutación sobre `Galeria.tsx`, `Resenas.tsx`, `galeria-logica.ts` y `carrusel-logica.ts`
  para el umbral 1.0 (código eliminado puede haber dejado mutantes huérfanos o, al revés, cerrado
  ramas que antes hacía falta cubrir).
- `judge` sobre el contrato amendado.
- El `craftsman_lead` actualiza `feature_list.json` (no tocado en esta sesión).

## Remate tras judge (2026-07-24) — retirada de `arranqueExplicito` (hallazgo BLOQUEANTE)

El `judge` (`progress/judge_retiro_whatsapp_y_carrusel.md`, RETIRO 2, hallazgo 1) encontró que
`arranqueExplicito` sobrevivió a la MISMA poda que sí se aplicó a `alternarRotacion`: su único
`setArranqueExplicito(true)` vivía dentro de `alternarRotacion`, ya borrada; desde entonces el
`useState` solo se movía con literal `false` (dentro de `entra()`), así que ningún gesto de UI
podía alcanzar la rama `if (estado.arranqueExplicito) return true` de `debeRotar` a través de los
componentes reales. Código de producción sin ningún test rojo que lo pidiera — viola la Ley 1.

**Decisión (mismo criterio que `claveDeRotacion`/`etiquetaDeRotacion`, pero con un matiz):**
`claveDeRotacion`/`etiquetaDeRotacion` se retiraron ENTERAS (función pura + su describe dedicado)
porque no tenían NINGÚN llamador, ni en producción ni fuera de su propio test. `debeRotar` es
distinto: SÍ tiene un llamador real en producción (los dos componentes la invocan en cada render
para decidir `rotando`) y su parámetro `arranqueExplicito` SÍ está probado como capacidad general
de la función pura (`galeria-logica.test.ts` @s8 línea 207-217, @s11 línea 219-230: "el arranque
explícito GANA sobre el ratón encima y sobre el foco dentro", cita literal del APG). Retirar el
parámetro de `debeRotar` habría sido desproporcionado: habría que reescribir esos dos tests para
demostrar una regla que la función YA NO podría expresar, perdiendo documentación de una
precedencia real del patrón APG (arranque explícito > ratón/foco) sin que nada la pidiera retirar
— el problema no es la función pura, es el CABLEADO muerto en los componentes.

Por eso:
- **`galeria-logica.ts`**: `debeRotar`/`EstadoDeRotacion.arranqueExplicito` NO se tocan en su
  firma ni comportamiento; solo se amplía el docblock del campo para dejar explícito que HOY
  ningún componente lo alcanza con `true` (mismo patrón que las notas de "MUTANTE EQUIVALENTE" ya
  usadas en el repo para casos similares).
- **`galeria-logica.test.ts`**: SIN CAMBIOS. Los tests @s8 (línea ~207) y @s11 (línea ~219) se
  quedan: siguen demostrando una regla real de la función pura, no un cadáver.
- **`Galeria.tsx` / `Resenas.tsx`**: retirado el `useState(false)` de `arranqueExplicito` y su
  comentario de "mutante equivalente" (que documentaba precisamente la inobservabilidad ahora
  resuelta retirando el estado); la llamada a `debeRotar` pasa el literal `arranqueExplicito:
  false` con un comentario que explica por qué (el botón que lo activaba se retiró a mano, commit
  `9cf32a9`); `entra()` deja de resetear el estado retirado — queda como `(poner) => poner(true)`,
  con su docblock actualizado (ya no "cancela el arranque explícito": ese concepto no vive en el
  componente).
- Retirada sin ciclo rojo-verde (es retirar, no implementar — mismo criterio que
  `alternarRotacion` en la sección 1 de este diario): no había ningún test de componente que
  ejercitara la rama a través de la UI (confirmado por el propio `judge` por inspección y por grep
  de `setArranqueExplicito` antes del cambio: 2 llamadas en todo `src/`, las dos con literal
  `false`), así que no hacía falta un test rojo para retirar el estado — al revés, el hallazgo del
  `judge` ES la prueba de que ese cableado nunca tuvo un test que lo justificara.

**Hallazgos MENORES del mismo veredicto, corregidos de paso** (prosa, no afectan compilación ni
tests):
- `galeria.test.tsx:1119` (antes 1120) — el comentario citaba `boton-whatsapp-montaje.test.tsx`
  (ya borrado en otra rebanada) como el fichero que "también vigila" que la galería siga dentro de
  `<main>`. Corregido: ya no cita un fichero inexistente.
- `features/galeria_carrusel.feature:241` — mismo patrón en la nota de @s2: ahora cita
  `galeria.test.tsx:1119-1128` (el test real, verificado con la numeración final del fichero).
- `src/lib/demo/reserva-demo.ts:1-5` — el docblock nombraba `BOTON_WHATSAPP_FLOTANTE_TEXTO`
  (constante ya borrada en otra rebanada) como si existiera junto a un "tercer punto de entrada"
  que ya no existe. Corregido: ahora solo contrasta con `CONTACTO_WHATSAPP_TEXTO` y anota que el
  botón flotante se retiró (commit `479d541`).

**Verificación tras el cambio:**
- `pnpm typecheck`: **0 errores**.
- `pnpm lint`: **0 errores**.
- `pnpm test` (suite completa): **1299/1299 verdes, 39 ficheros** — MISMO recuento que antes del
  remate (no se retiró ni se añadió ningún test: la corrección fue puramente de cableado muerto en
  producción y de prosa en comentarios/docblocks).

### Trazabilidad del remate

| Hallazgo del judge | Fichero(s) | Acción | Verificación |
|---|---|---|---|
| 1 [BLOQUEANTE] `arranqueExplicito` cableado muerto | `Galeria.tsx`, `Resenas.tsx` | Retirado `useState`, su paso a `debeRotar` (ahora literal `false`) y el reseteo en `entra()` | grep `arranqueExplicito`/`setArranqueExplicito` en `src/` → solo `galeria-logica.ts` (función pura) y `galeria-logica.test.ts` (sus tests dedicados) |
| 4 [Menor] docblock de `arranqueExplicito` desactualizado | `galeria-logica.ts:98-104` | Ampliado el docblock: hoy sin consumidor real vía UI, capacidad reutilizable de la función pura | lectura directa |
| — [Menor, Retiro 1] cita a fichero borrado | `galeria.test.tsx:1119-1121` | Comentario corregido, sin cita a `boton-whatsapp-montaje.test.tsx` | lectura directa |
| — [Menor, Retiro 1] cita a fichero borrado | `features/galeria_carrusel.feature:241` | Nota corregida, cita `galeria.test.tsx:1119-1128` | lectura directa |
| — [Menor, Retiro 1] constante borrada nombrada en docblock | `reserva-demo.ts:1-5` | Docblock corregido, sin nombrar `BOTON_WHATSAPP_FLOTANTE_TEXTO` | lectura directa |

## Remate — mutantes de `prefers-reduced-motion` matados (2026-07-24)

Encargo del `craftsman_lead` tras el `mutation_tester` (`progress/mutation_carrusel_enmienda4.md`):
FAIL 94.12%, 16 supervivientes (8 `Galeria.tsx` + 8 `Resenas.tsx`), UNA sola familia diagnosticada
por el propio informe (no re-derivada aquí): al perder el botón «Iniciar»/«Parar» retirado
(ENMIENDA 4), el único observable directo del estado `pausado` desapareció, y las aserciones vivas
de `@s12`/`@s8 (@s12 de galería)` usan exclusivamente `avanzar(12000)` — exactamente una vuelta
completa del carrusel (`TOTAL=6 × MILISEGUNDOS_POR_FOTO=2000`), que no distingue "pausado" de "dio
una vuelta entera sin parar" (el propio fichero ya conoce y evita esta trampa en `@s10`, con
`avanzar(8000)` y el comentario "sin esta comprobación el Then pasaría aunque la pausa no
existiera").

**Ningún cambio de producción**: `Galeria.tsx`/`Resenas.tsx` ya hacían lo correcto; lo que faltaba
era la aserción que lo demostrara (Ley 1 respetada: cero código sin un test que lo pida, cero test
sin motivo). Ley 3 también: la mínima ampliación necesaria — ni un `it` nuevo por mutante, reutilizo
los describes de `@s12` ya existentes.

### Ciclo (idéntico en `galeria.test.tsx` y `resenas.test.tsx`, mismos nombres de test, «foto»↔«testimonio»)

Confirmado contra el código ACTUAL (no hay mutante instalado en el árbol de trabajo): cada test se
verificó en VERDE tras escribirlo, y se razonó/verificó por inspección qué mutante de la lista del
`mutation_tester` mataría cada aserción nueva (no se sabotea el código a mano: los 16 mutantes ya
están descritos línea:columna en el informe, y la re-corrida de Stryker al final es la prueba
definitiva).

1. **`stubDeMatchMedia` deja de ser una función suelta y pasa a `vi.fn(...)`** (variable
   `matchMedia`, devuelta junto a `escuchar`/`dejarDeEscuchar`): sin este cambio no hay forma de
   inspeccionar CON QUÉ argumento se llamó de verdad a `window.matchMedia`.
2. **Test nuevo** `'@s12 window.matchMedia se consulta con la media query EXACTA de movimiento
   reducido'` / `'@s8 window.matchMedia se consulta con la media query EXACTA de movimiento
   reducido'`: `expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')`, literal
   escrito a mano (anti-tautología: nunca se importa `CONSULTA_MOVIMIENTO_REDUCIDO` de producción).
   Mata **`StringLiteral`** `Galeria.tsx:84:38` / `Resenas.tsx:68:38`.
3. **Ampliado** `'@s12 a los 12000 ms sigue centrada la PRIMERA: arrancó pausado y no se movió ni
   una posición'` / `'@s8 a los 12000 ms sigue centrado el PRIMERO...'`: entre el `render` y el
   `avanzar(12000)` original se inserta un checkpoint `avanzar(2000)` + `expect(centrada(...)).toBe(0)`
   (mismo patrón que `@s10`, tiempo NO múltiplo de 12000) antes de completar los 10000 ms restantes
   con la aserción final intacta. Mata **`ConditionalExpression` 135:11, `BlockStatement` 135:32,
   `BooleanLiteral` 136:20** (Galeria) / **111:11, 111:32, 112:20** (Resenas) — el bloque de
   arranque (`if (preferencia.matches) { setPausado(true) }`).
4. **Ampliado** `'@s12 activar la preferencia con la página abierta pausa la rotación EN CURSO'` /
   `'@s8 activar la preferencia con la página abierta pausa la rotación EN CURSO'`: tras
   `act(() => manejadorDelCambio(escuchar)({ matches: true }))`, checkpoint `avanzar(8000)` +
   `expect(centrada(...)).toBe(1)` (NO múltiplo de 12000) antes de completar los 4000 ms restantes
   con la aserción final intacta. Mata **`BlockStatement` 142:71 (vacía `alCambiarLaPreferencia`
   entero), `ConditionalExpression` 143:13, `BlockStatement` 143:29, `BooleanLiteral` 144:22**
   (Galeria) / **117:71, 118:13, 118:29, 119:22** (Resenas) — el listener `change`.

Cada cambio se corrió con `pnpm vitest run src/components/galeria.test.tsx` /
`.../resenas.test.tsx` tras editarlo, confirmando VERDE antes de seguir con el siguiente (nunca los
dos ficheros a la vez sin correr).

### Trazabilidad (delta sobre la tabla `@s12` ya existente)

| Mutante superviviente (línea:col) | Fichero | Test que lo mata |
|---|---|---|
| `StringLiteral` 84:38 | `Galeria.tsx` | `@s12 window.matchMedia se consulta con la media query EXACTA...` |
| `ConditionalExpression`/`BlockStatement`/`BooleanLiteral` 135:11/135:32/136:20 | `Galeria.tsx` | `@s12 a los 12000 ms sigue centrada la PRIMERA...` (checkpoint `avanzar(2000)`) |
| `BlockStatement`/`ConditionalExpression`/`BlockStatement`/`BooleanLiteral` 142:71/143:13/143:29/144:22 | `Galeria.tsx` | `@s12 activar la preferencia con la página abierta pausa la rotación EN CURSO` (checkpoint `avanzar(8000)`) |
| `StringLiteral` 68:38 | `Resenas.tsx` | `@s8 window.matchMedia se consulta con la media query EXACTA...` |
| `ConditionalExpression`/`BlockStatement`/`BooleanLiteral` 111:11/111:32/112:20 | `Resenas.tsx` | `@s8 a los 12000 ms sigue centrado el PRIMERO...` (checkpoint `avanzar(2000)`) |
| `BlockStatement`/`ConditionalExpression`/`BlockStatement`/`BooleanLiteral` 117:71/118:13/118:29/119:22 | `Resenas.tsx` | `@s8 activar la preferencia con la página abierta pausa la rotación EN CURSO` (checkpoint `avanzar(8000)`) |

### Verificación de cierre

- `pnpm vitest run src/components/galeria.test.tsx`: **72/72 verdes** (71 → 72, +1 test nuevo; los
  otros 4 mutantes se matan con checkpoints DENTRO de tests ya existentes, sin tests nuevos).
- `pnpm vitest run src/components/resenas.test.tsx`: **81/81 verdes** (80 → 81, mismo patrón).
- `pnpm test` completo: **1301/1301 verdes, 39 ficheros** (1299 → 1301).
- `pnpm typecheck`: 0 errores. `pnpm lint`: 0 errores.
- `node tools/mutate.mjs "src/components/Galeria.tsx,src/components/Resenas.tsx"`: **100.00% en los
  DOS ficheros, 0 supervivientes, 0 no-cov, 0 errores** (Galeria.tsx 114 puntuados: 96 killed + 18
  timeout; Resenas.tsx 104 puntuados: 104 killed). Detalle completo en
  `progress/mutation_carrusel_enmienda4.md` § "Remate — mutantes matados (2026-07-24)".

No se tocó `feature_list.json` (lo hace el `craftsman_lead` al cierre) ni ningún `.feature`: es
deuda de aserción sobre un `Then` que ya existía en el contrato (`@s12`), no un cambio de contrato.
Pendiente: `judge` re-veredicto sobre el delta de tests, y el `craftsman_lead` cerrando F-22/F-14.
