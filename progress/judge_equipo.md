# Review — feature 18 `equipo_reservas`

**Veredicto:** APPROVED (con observaciones menores; no bloquean la puerta de mutación)

## Cobertura de escenarios (@s ↔ test)
- @s1: [x] `equipo.test.tsx` describe('@s1 …') — 1 <section> aria-labelledby, 7 <article>, h2/eyebrow/intro literales.
- @s2: [x] describe('@s2 …') verifica el ancla `equipo-titulo` (parte de la feature). El 7º enlace de la nav y las 5 puertas los cablea otro agente: VERIFICADO por el juez → MenuNavegacion.tsx:50 `<a href="#equipo-titulo">Equipo</a>` (entre Ofertas y Reserva) + `pnpm build` exit 0 con las 5 puertas verdes (incl. anclas vivas).
- @s3: [x] describe('@s3 …') — siete <h3> en orden Lucía…Sara.
- @s4: [x] describe('@s4 …') — 0 <h1>, 1 <h2>, 7 <h3> en el horneado.
- @s5: [x] describe('@s5 …') outline con las 7 profesionales; rol + dos especialidades EN ORDEN, literales a mano.
- @s6: [x] describe('@s6 …') — ancla positiva (título + 7 nombres) PRIMERO, luego sin "facial" ni "depilaci".
- @s7: [x] describe('@s7 …') — 7 <div aria-hidden>, sin <img>/src, sin "ph-woman", sin URL externa ni url().
- @s8: [x] describe('@s8 …') — leyenda exacta en horneado, menciona perfiles y reseñas.
- @s9: [x] describe('@s9 …') — "Reserva tu cita" + botón disabled, "Cargando días…", sin aria-pressed horneado.
- @s10: [x] describe('@s10 …') — diasOfrecidos(jue 2026-07-16) = vie17…jue23, sin domingo, sin hoy, determinista.
- @s11: [x] describe('@s11 …') — 6 chips aria-pressed="false", 0 franjas, botón disabled.
- @s12: [x] describe('@s12 …') — mié 22 → 6 franjas en orden; solo ese chip pulsado.
- @s13: [x] describe('@s13 …') — sáb 18 → SOLO 10:00/11:30/13:00; 16/17:30/19 ausentes.
- @s14: [x] describe('@s14 …') — cambiar de día borra la hora; botón vuelve a disabled.
- @s15: [x] describe('@s15 …') — dos estados de partida: disabled + "Elige día y hora".
- @s16: [x] describe('@s16 …') — con día+hora: sin disabled, "Reservar · mié 22 · 16:00".
- @s17: [x] describe('@s17 …') — mensaje + subtexto + "Cambiar"; sin chips.
- @s18: [x] describe('@s18 …') — "Cambiar" restaura estado inicial.
- @s19: [x] describe('@s19 …') — elegir en Lucía no altera las otras seis.
- @s20: [x] describe('@s20 …') — reseña con autora, estrella "5 de 5 estrellas", Lucía≠Carla, ≥3 distintas.
- @s21: [x] describe('@s21 …') — avanzar tras la última → primera, sin undefined/vacío.
- @s22: [x] describe('@s22 …') — retroceder antes de la primera → última (índice −1), sin undefined/vacío.
- @s23: [x] describe('@s23 …') — mover Lucía no mueve Carla.
- @s24: [x] describe('@s24 …') — un pulsado por grupo, aria-pressed presente en todos.
- @s25: [x] describe('@s25 …') — "Reseña anterior/siguiente de <nombre>", 14 nombres accesibles distintos.
- Núcleo mutable por valor: indiceCircular(3,3)=0 / (-1,3)=2; franjasDe('Saturday')=[10,11:30,13] y ≠16/17:30/19; franjasDe('Sunday')=[].

## Disciplina TDD
- ¿Producción sin test que la pida? Prácticamente NO. Todo el JSX/estado se corresponde con escenarios cubiertos. Excepciones decorativas menores (el círculo "✓" de confirmación y los glifos ★/←/→ aria-hidden) no tienen aserción propia; son adorno aria-hidden dentro de estados sí testeados.
- ¿Evidencia de Rojo→Verde→Refactor? SÍ. `progress/tdd_equipo.md` documenta el ROJO real de `equipo-estilos.test.ts` (bloque `.diaActivo` standalone vs. encabezado agrupado) y su corrección a VERDE, más el núcleo mutable cubierto por valor.

## Calidad
- `Equipo.tsx`: funciones puras `diasOfrecidos` / `franjasDe` / `indiceCircular` bien extraídas, reloj INYECTADO (L55), reutiliza `HORARIO_SEMANAL`/`aMinutos` de F-10 (fuente única, no reimplementa). Nombres reveladores, constantes arriba, docblock citando la feature.
- Estado en atributo CONSULTABLE: `aria-pressed` en chips de día/hora, `disabled` en el botón de reserva. El estado no-habilitado es `<button disabled>` (spec §12/aviso 9), no un `<div>`.
- `equipo-demo.ts`: sigue la plantilla de datos demo (interface readonly + const + LEYENDA), datos FUERA del JSX. Sin "Facial"/"Depilación".
- SCSS fiel a `spec_visual_equipo.md`: `demo-seccion--plain`, foto 4/3 + accent-soft, rellenos/textos en `--accent-dark`, bordes de control en `--border-interactive`, estrellas `--accent-2`. Sin `--accent` a pelo bajo blanco.

## Checkpoints
- C1 [x] arnés completo (`bin/harness init` exit 0).
- C2 [x] estado coherente (una feature en curso).
- C3 [x] arquitectura respetada (5 ficheros previstos; sin deps nuevas).
- C4 [x] verificación real: 53 tests equipo verdes; suite completa 883/883 verde.
- C5 [ ] cierre de sesión: pendiente del `craftsman_lead` (no marca `done` sin mutación).
- C6 [x] Gherkin: 25 @s, todos cubiertos, cada Then medible.
- C7 [ ] mutación: la corre el `mutation_tester` DESPUÉS de esta aprobación.

## Observaciones menores (no bloquean; para el `mutation_tester` y el pulido)
1. `Equipo.tsx:160,177` el `className` condicional (`… ? estilos.diaActivo : estilos.dia`) DUPLICA la condición del `aria-pressed`. Con `css:false` ambas ramas son `undefined` en test, así que ese ternario podría dejar un mutante SUPERVIVIENTE en Stryker. El estado sí está en `aria-pressed` (matable), luego @s24 se cumple; que la puerta C7 vigile ese ternario.
2. `.circulo` (el "✓" de confirmación) no tiene test de bytes en `equipo-estilos.test.ts` ni aserción de comportamiento; es decorativo aria-hidden dentro de @s17.
3. 3 warnings `react-refresh/only-export-components` en `Equipo.tsx` por co-localizar las funciones puras; intencional (alcance de 5 ficheros, Stryker debe morderlas) y el gate es `warn`, no error.

## Cambios requeridos
Ninguno bloqueante. Se aprueba para pasar a la puerta de mutación.
