# Diario TDD — feature `equipo_reservas`

Feature en curso: 18 — equipo_reservas
Escenarios a recorrer: @s1..@s25 (contrato `features/equipo_reservas.feature`).

Ficheros que creo (solo estos 5):
1. `src/lib/demo/equipo-demo.ts`
2. `src/components/equipo.module.scss`
3. `src/components/Equipo.tsx` (incluye las funciones PURAS exportadas: `diasOfrecidos`, `franjasDe`, `indiceCircular`)
4. `src/components/equipo.test.tsx`
5. `src/components/equipo-estilos.test.ts`

NO toco: `home.tsx`, `MenuNavegacion.tsx`, `stryker.config.json` (los cablea otro agente).
ZONA PROHIBIDA (hero, en paralelo): no toco Hero.* ni trazo-marca.*

## Núcleo mutable (funciones puras extraídas al componente)
- `diasOfrecidos(ahora)` — 6 días desde mañana saltando domingos, reloj INYECTADO (@s10).
- `franjasDe(diaSemana)` — filtra las franjas contra `HORARIO_SEMANAL` de F-10 (@s12/@s13).
- `indiceCircular(i, n)` = `((i % n) + n) % n` — vuelta circular del carrusel (@s21/@s22).

## Mapa @sN -> test (ver detalle abajo)

| @s | test |
| --- | --- |
| @s1 | seccion horneada: 1 <section> aria-labelledby, 7 <article>, h2 id + eyebrow + intro |
| @s2 | aria-labelledby del section == id del h2 == "equipo-titulo" (ancla del 7º enlace de la nav; el enlace lo cablea otro agente) |
| @s3 | siete <h3> en orden Lucía..Sara |
| @s4 | 0 <h1>, 1 <h2>, 7 <h3> en el horneado |
| @s5 | rol + dos especialidades (lista) por profesional |
| @s6 | fragmento con ancla positiva y sin "Facial" ni "Depilación" |
| @s7 | foto aria-hidden (7 divs), sin <img>/src, sin "ph-woman", sin subrecurso externo |
| @s8 | leyenda visible exacta menciona equipo y reseñas |
| @s9 | horneado SSR: "Reserva tu cita" + botón disabled, "Cargando días…", sin chips (sin aria-pressed) |
| @s10 | diasOfrecidos(jue 2026-07-16) -> vie17,sáb18,lun20,mar21,mié22,jue23; sin domingo; determinista |
| @s11 | tras hidratar: 6 chips aria-pressed=false, sin selector de hora, botón disabled |
| @s12 | día laborable -> 6 franjas en orden; chip elegido aria-pressed=true |
| @s13 | sábado -> 3 franjas (10/11:30/13); sin 16/17:30/19 |
| @s14 | cambiar de día deselecciona hora; botón vuelve a "Elige día y hora" |
| @s15 | disabled + "Elige día y hora" en los dos estados de partida |
| @s16 | con día+hora: botón sin disabled, "Reservar · mié 22 · 16:00", aria-pressed |
| @s17 | confirmar -> mensaje + subtexto + "Cambiar"; sin chips |
| @s18 | "Cambiar" -> estado inicial |
| @s19 | elegir día en Lucía no toca las otras seis |
| @s20 | cada tarjeta una reseña (blockquote+autora), estrella "5 de 5 estrellas", Lucía≠Carla, ≥3 distintas |
| @s21 | avanzar tras la última -> primera (i=n, no undefined) |
| @s22 | retroceder antes de la primera -> última (i=-1, no undefined) |
| @s23 | mover el carrusel de Lucía no mueve el de Carla |
| @s24 | aria-pressed exclusivo por grupo, presente en todos |
| @s25 | flechas con nombre accesible "Reseña anterior/siguiente de <nombre>", 14 distintos |
| puras | indiceCircular por valor; franjasDe por valor (mutación) |

## Ciclos (RED -> GREEN -> REFACTOR) — resumen de cierre

Orden de construcción: datos -> scss -> componente + funciones puras -> tests, verificando SOLO
`pnpm exec vitest run src/components/equipo.test.tsx src/components/equipo-estilos.test.ts`.

- ROJO real observado: `equipo-estilos.test.ts` nació con 2 fallos porque el bloque STANDALONE
  `.diaActivo`/`.horaActiva` (el que lleva `background: var(--accent-dark)`) NO es el encabezado
  agrupado `.dia, .diaActivo`. VERDE: se cambió la aserción a un regex directo
  `/\.diaActivo\s*\{\s*background:\s*var\(--accent-dark\)/` que ancla al bloque de relleno.
- Núcleo mutable cubierto por valor (además de por comportamiento):
  · `indiceCircular(3,3)=0`, `indiceCircular(-1,3)=2`, ... (mata `i%n` a secas y quitar el `+n`).
  · `franjasDe('Saturday')=['10:00','11:30','13:00']` y NO 16/17:30/19 (mata mutar el `< cierra`).
  · `diasOfrecidos(jue 16)` -> 6 días saltando el domingo 19 (mata quitar el salto de domingo).
- Comportamiento del carrusel: @s21 lleva el índice interno a n (=3) y @s22 a −1, cazando ambos
  lados de la vuelta circular.

## Estado
- 53 tests VERDES en MIS dos ficheros (equipo.test.tsx: 43 · equipo-estilos.test.ts: 10). 0 rojos.
- typecheck (`tsc --noEmit`): OK (exit 0).
- lint (`eslint`): OK (exit 0); 3 warnings `react-refresh/only-export-components` en Equipo.tsx por
  co-localizar las funciones puras (intencional: el arnés exige que Stryker las muerda y el alcance
  me limita a 5 ficheros, sin fichero lib propio). El gate es `warn`, no `--max-warnings 0`.

## Dependencias de cableado (otro agente, FUERA de mi alcance de ficheros)
- @s2: el 7º enlace `<a href="#equipo-titulo">Equipo</a>` en `MenuNavegacion.tsx` y el `pnpm build`
  con las 5 puertas. MI parte cumplida: la `<section>` expone el ancla `equipo-titulo` (h2 con ese
  id), destino al que ese enlace apuntará. Verificado en @s2.
- Montaje de `<Equipo />` en `home.tsx` y alta de `Equipo.tsx` en `stryker.config.json`.
- Partes de @s1/@s4 que miran la PÁGINA ENTERA (un solo `<h1>` global, una sola `<section>` añadida)
  se comprueban aquí sobre `<Equipo />` aislado; el recuento global lo cierra el build del cableador.

## Puerta
No marco `done`. Espero veredicto del `judge` y del `mutation_tester` vía el `craftsman_lead`.
</content>
</invoke>
