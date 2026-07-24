# ENMIENDA 4 (2026-07-24) — `galeria_carrusel.feature` (F-22) y, por herencia, `resenas_agregado_enlace.feature` (F-14)

> Registro de decisión del `gherkin_author`. Ambas features están `done` (judge APROBADO, mutación
> 100%). Esta es una ENMIENDA formal al contrato ya cerrado, no una feature nueva: no cambia
> `status` en `feature_list.json`. El código de producción (`src/`) NO se toca aquí — eso es del
> `tdd_craftsman`, en una sesión posterior, sobre este contrato ya amendado.

## Qué pasó

El commit `9cf32a9` ("Eliminar botones de control del carrusel en Galeria y Resenas"), hecho **a
mano por Pablo** (dueño del producto), **fuera del ciclo TDD**, borró de `src/components/Galeria.tsx`
y `src/components/Resenas.tsx` los tres `<button>` de mando de cada carrusel:

- El control de rotación (❙❙/▶, `onClick={alternarRotacion}`, el `aria-label` que alternaba «Parar
  la reproducción automática» / «Iniciar la reproducción automática», `data-estado`).
- Las dos flechas («Anterior» / «Siguiente», `onClick={() => desplazar(±1)}`).

Consecuencia de código verificada por el `craftsman_lead` (`pnpm typecheck` / `pnpm lint`):
`alternarRotacion` se queda sin ningún llamador (código MUERTO, `TS6133`/`no-unused-vars`), igual
que sus imports `claveDeRotacion`/`etiquetaDeRotacion` de `galeria-logica.ts`/`carrusel-logica.ts`.
Un `tdd_craftsman` posterior lo retirará como parte de la limpieza, sobre este contrato ya
amendado.

Consecuencia de **comportamiento real** (no solo de compilación): al desaparecer `alternarRotacion`,
ya no existe ninguna vía en la UI para que un usuario **pare o reanude la rotación a propósito**.
Sobrevive:

- La pausa por `prefers-reduced-motion` (arranca pausado si el SO lo pide).
- La pausa TRANSITORIA al pasar el ratón por encima (reanuda sola al salir).
- La pausa al recibir el foco de teclado (ya era "pegajosa"; ahora es PERMANENTE, porque nada la
  revierte — antes lo hacía el botón «Iniciar»).

Ya NO existe: la pausa/reanudación explícita por click/tap, la navegación manual por flecha-botón
(el paso ±1 sigue por teclado/puntos/tarjeta/arrastre), y los mandos de cristal.

## La pregunta y la respuesta

El `craftsman_lead` preguntó explícitamente a Pablo (AskUserQuestion) si restaurar **al menos** el
botón de pausa, citando literalmente la línea 276 de `features/galeria_carrusel.feature` (antes de
esta enmienda): «(N) SC 2.2.2 Pause, Stop, Hide (Nivel A, BLOQUEANTE, y de No-Interferencia: un
fallo aquí contamina la conformidad de TODA la página)».

Respuesta literal de Pablo:

> «No lo soluciones para que todo pase, con los cambios que yo he hecho, que para eso los he hecho
> yo a mano, gracias, ultrathink.»

Es decisión INFORMADA de la puerta humana: Pablo, sabiendo del hueco WCAG 2.2 SC 2.2.2, decide
conservar su edición tal cual. El contrato se enmienda para reflejar la realidad del código, nunca
al revés.

## La consecuencia WCAG (declarada, no ocultada)

Para un usuario que navegue **solo con ratón** o **solo con el dedo** (sin teclado), el autoplay de
2 s ya no tiene ningún mecanismo de parada **persistente y bajo su control**: el hover pausa pero
se reanuda solo al levantar el puntero. WCAG 2.2 SC 2.2.2 (Pause, Stop, Hide, Nivel A) **ya no se
cumple** para esos usuarios, desde el 2026-07-24, por decisión de Pablo tomada a sabiendas.

Para el usuario de **teclado** la situación es la contraria y no incumple 2.2.2 (que exige poder
PARAR, no poder REINICIAR): tabular al carrusel lo detiene de forma permanente.

## Qué quedó RETIRADO / AJUSTADO en `features/galeria_carrusel.feature`

**RETIRADOS** (título `[RETIRADO 2026-07-24, ENMIENDA 4]`, cuerpo histórico conservado íntegro,
tag nunca reutilizado):

- **@s8** — El control de rotación (PRIMER tabulable, nombre cambia, sin aria-pressed). Sujeto
  inexistente.
- **@s11** — «Iniciar» arranca ignorando ratón/foco. Sujeto inexistente (`arranqueExplicito` ya
  nunca vuelve a `true`).
- **@s16** — Las flechas mueven una posición y dan la vuelta por los dos extremos. Sujeto
  inexistente. La aritmética que defendía (avance, y sobre todo la vuelta hacia atrás con índice
  negativo) sigue viva por otra vía: el avance hacia delante lo re-ejercita @s9 (autoplay) y la
  vuelta hacia atrás la re-ejercita @s23 (`ArrowLeft` desde la 1ª centra la 6ª, mismo call site de
  `indiceCircular` en el componente). No se abre un escenario nuevo porque ya está cubierta.
- **@s24** — Los mandos de cristal (chip + flechas) sobre el marco. Sujeto inexistente entero.

**AJUSTADOS** (algún Then/And concreto retirado o reescrito; el resto de cada uno sigue vigente):

- **@s2** — Se retira el And que exigía existencia de "Anterior"/"Siguiente"; se sustituye por su
  contrario (ya NO existe ninguno de los dos), con la misma precisión que antes exigía su
  presencia.
- **@s6** — Se retira el And de `aria-controls` de las flechas (sin referente); el resto del árbol
  APG (role=group, aria-roledescription, aria-labelledby, las seis diapositivas nunca ocultas, el
  orden del DOM) sigue vigente sin cambio.
- **@s10** — El Then no cambia (la fila del foco sigue centrando la PRIMERA); se corrige la
  columna descriptiva "decisión": antes decía «solo el botón la devuelve» (vía real), ahora esa vía
  no existe y la pausa es PERMANENTE.
- **@s12** — Se retiran los dos And que mencionaban el nombre accesible del control retirado; se
  añade un And explícito declarando que bajo `prefers-reduced-motion` ya no hay NINGUNA forma de
  arrancar la rotación nunca; se ajusta el And de "desactivar la preferencia no arranca una
  pausada" para declarar que reanudar ya no es posible por ninguna vía.
- **@s20** — El `When` usaba el botón "Siguiente" (retirado): se sustituye por el punto indicador
  de la 2ª foto, mismo efecto observable por la misma vía de reinicio del reloj. El último And
  ("parado por el usuario") cambia de mecanismo: la única parada que sobrevive es
  `prefers-reduced-motion`.
- **@s23** — El And del foco dentro posaba el foco sobre el botón "Siguiente" (usado solo como
  cualquier elemento tabulable): se sustituye por "cualquier elemento tabulable, p. ej. un punto
  indicador". El resto del escenario (cableado de teclado/IntersectionObserver) no depende de los
  controles retirados.

**CONFIRMADOS SIN CAMBIO** (releídos contra el test real, no dependen de los botones retirados):

- **@s7** — La fila «rotando=no, foco=no» sigue alcanzable vía `raton=true` (el ratón dentro del
  carrusel ya para la rotación por sí solo, según `debeRotar` en `galeria-logica.ts`); ningún Then
  cambia.
- **@s9** — La cadencia de 2 s del autoplay no depende de ningún control; ningún Then cambia.

**NO tocados** por decisión explícita de alcance (no dependen de los botones retirados, releídos
solo por encima): @s1, @s3, @s4, @s5, @s13, @s14, @s15, @s17, @s18, @s19, @s21, @s22.

## Nota menor NO corregida (fuera de alcance, anotada para no improvisar)

`@s18` cita en su comentario, de pasada, «el teclado llega a cualquier foto por las flechas (@s16)
y por los puntos (@s17)» y «la tarjeta es CLICABLE pero NO ENFOCABLE (@s8)». Ambas citas apuntan
ahora a escenarios RETIRADOS. El HECHO subyacente (la tarjeta sigue sin ser enfocable; el teclado
sigue llegando a cualquier foto, hoy vía @s17 + @s21/@s23 en vez de @s16) sigue siendo cierto — solo
la cita al escenario está desactualizada. Es un comentario, no una aserción ejecutable, y @s18 está
fuera del alcance explícito de esta enmienda (no depende de los botones retirados): se deja
anotado aquí en vez de tocarlo sin mandato.

## `features/resenas_agregado_enlace.feature` (F-14, hereda por referencia)

Se actualizó **solo** el `Then` de @s8 que enumeraba la conducta heredada (para no seguir
prometiendo heredar @s8/@s11/@s16/@s24, RETIRADOS en el contrato padre) y el `And` que afirmaba
"DOS botones Anterior, DOS Siguiente y DOS controles de rotación" (ya falso en ambos carruseles: se
sustituyó por lo que sigue siendo cierto — ningún id compartido y grupos de puntos con nombre
propio). Se añadió una nota remitiendo a la ENMIENDA 4 de `galeria_carrusel.feature` como fuente de
verdad, siguiendo la regla de oro de F-14 ("hereda POR REFERENCIA, no por copia"): no se duplica el
razonamiento.

## Siguiente paso (fuera de esta sesión)

Un `tdd_craftsman` debe, sobre este contrato ya amendado: (a) retirar `alternarRotacion` y el
código muerto asociado en `Galeria.tsx`/`Resenas.tsx`; (b) actualizar `galeria.test.tsx` y
`resenas.test.tsx` para dejar de referenciar el control/flechas retirados, adaptando los tests de
@s7/@s10/@s12/@s20/@s23 a sus nuevos mecanismos (ratón/reduced-motion/punto indicador en vez de
botón); (c) retirar los tests que solo cubrían @s8/@s11/@s16/@s24 (o documentarlos como históricos,
según decida el `judge`); (d) re-correr mutación sobre `Galeria.tsx`/`Resenas.tsx`/`galeria-logica.ts`
para el umbral 1.0. Ninguno de estos pasos se ha hecho en esta sesión: es puramente una enmienda de
contrato Gherkin.
