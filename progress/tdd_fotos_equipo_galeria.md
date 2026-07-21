# TDD — fotos reales en Equipo y Galería (2026-07-21)

> Encargo del `craftsman_lead`: cablear las 13 fotos de Pexels ya seleccionadas y commiteables en
> `src/assets/trabajos/` (el lead hizo la parte de criterio: buscó, miró una a una y descartó
> cualquier rostro identificable, licencia Pexels + LO 1/1982). Este diario NO vuelve a decidir la
> selección de fotos: solo las cablea por TDD.

## Alcance

- TRABAJO A: 7 tarjetas de `Equipo.tsx` — el monograma (inicial sobre rosa) se retira ENTERO y se
  sustituye por la foto real del trabajo de cada profesional.
- TRABAJO B: 6 huecos de `Galeria.tsx` (sin tests hasta hoy) — se sustituyen por las 6 fotos.
- Fuera de alcance (respetado): `Reserva.tsx`, `reserva*`, `Contacto.tsx`, `home.tsx`,
  `stryker.config.json`, `feature_list.json`. Nada de tests build-based nuevos (`pnpm build` solo lo
  corre el lead al cierre). No se buscó ni se descargó ninguna foto ni se cambió la selección.

## TRABAJO A — Equipo (contrato `features/equipo_reservas.feature`)

### Preparación del contrato (antes del ciclo)

- `@s7` reescrito: el hueco de foto deja de ser "sin `<img>`, aria-hidden" y pasa a "una `<img>` con
  alt útil, sin `ph-woman`, sin origen externo". Es un cambio de contrato NECESARIO: con fotos reales,
  la redacción anterior (compartida con el @s31 del monograma) es literalmente falsa. No estaba en la
  lista explícita del encargo (que solo citaba @s26-@s31), pero @s7 usa las MISMAS aserciones
  `not.toContain('src=')` / `not.toMatch(/<img\b/)` que el encargo señaló para @s31: dejarlo intacto
  habría dejado un escenario del contrato contradiciendo el código a propósito.
- `@s8` reescrito: la leyenda pasa de declarar 2 cosas (perfiles + reseñas) a declarar 3 (perfiles +
  fotos de banco de imágenes + reseñas). Copy propuesto (sin puerta humana formal en esta sesión,
  igual que D2/D3 del contrato original): *"Equipo, fotos y reseñas de ejemplo · perfiles de muestra y
  fotos de banco de imágenes, pendientes de confirmar con el salón"*.
- Bloque "AMPLIACIÓN — EL MONOGRAMA" (@s26-@s31) sustituido por "AMPLIACIÓN — FOTOS REALES": mismo
  rango de escenarios, ahora describen fotos en vez de iniciales.

### Ciclos Rojo-Verde-Refactor

1. **RED**: se borran los 4 describe de `equipo.test.tsx` que testeaban el monograma (`@s26`→inicial
   por tarjeta, `@s27`→mayúsculas de `inicialDe`, `@s28`→caso vacío, `@s29`→decorativo/no contamina
   nombre) y se reescribe `@s7` (ya no espera `aria-hidden`/ausencia de `<img>`) + `@s8` (nueva
   leyenda) + `@s26..@s31` nuevos (foto por tarjeta con alt exacto, distintas entre sí, dimensiones
   800×600 + `loading="lazy"`, entra en el árbol a11y con su alt sin contaminar el `<h3>`, horneado
   SSR, sin `ph-woman`/sin origen externo). Se quita el import de `inicialDe` (ya no existe ningún
   test que lo necesite). `pnpm exec vitest run src/components/equipo.test.tsx` → **14 fallos / 45
   verdes** (confirma ROJO: ni el monograma antiguo compila con el nuevo test, ni el código actual
   tiene fotos).
2. **GREEN**: `src/lib/demo/equipo-demo.ts` gana `foto: string` y `alt: string` en `ProfesionalDemo`
   + 7 imports de `src/assets/trabajos/*.jpg` + los 7 pares foto/alt del encargo, y `LEYENDA_EQUIPO`
   se actualiza. `Equipo.tsx`: el `<div className={estilos.foto} aria-hidden="true"><span
   className={estilos.monograma}>{inicialDe(...)}</span></div>` se sustituye por `<div
   className={estilos.foto}><img src={profesional.foto} alt={profesional.alt} width={800}
   height={600} loading="lazy" /></div>` (constantes `ANCHO_FOTO`/`ALTO_FOTO`, medidas de verdad de
   los 13 JPEG con un parser de cabecera JPEG — las 13 son 800×600). `pnpm exec vitest run
   src/components/equipo.test.tsx` → **59/59 verdes**.
3. **REFACTOR (verde)**: se borra `inicialDe` de `src/components/equipo-logica.ts` (sin referencias),
   se borra la regla `.monograma` de `equipo.module.scss` (queda `.foto { overflow:hidden; img {
   width/height:100%; object-fit:cover } }` para que la imagen rellene el hueco 4/3) y se borra su
   test en `equipo-estilos.test.ts`. Re-run → sigue verde.

## TRABAJO B — Galería (`src/components/Galeria.tsx`, sin tests hasta hoy)

1. **RED**: `src/components/galeria.test.tsx` nuevo — 6 `<img>` con alt exacto y en orden (SSR), cada
   una con nombre accesible = alt, 6 srcs reconocibles por fichero, dimensiones 800×600 +
   `loading="lazy"`, sin `ph-woman`/sin origen externo, la nota honesta con el nuevo texto, y los
   botones de flecha ("Anterior"/"Siguiente") con nombre accesible. `pnpm exec vitest run
   src/components/galeria.test.tsx` → **5 fallos / 2 verdes** (los 6 tiles de hoy están vacíos:
   `<div aria-hidden="true" />`, sin `<img>`).
2. **GREEN**: `Galeria.tsx` importa las 6 fotos de `src/assets/trabajos/`, cada tile pasa a `<div
   className={estilos.tile}><img src alt width={800} height={600} loading="lazy" /></div>` (se quita
   el `aria-hidden` del tile: la foto ya aporta información) y la nota pasa a *"Galería de muestra ·
   fotos de banco de imágenes, las fotos reales del salón se añaden antes de publicar."* — sigue
   siendo cierta, ahora también declara que son de banco. `galeria.module.scss`: `.tile` gana
   `overflow:hidden` + regla `img { object-fit:cover }`. → **7/7 verdes**.
- `Galeria.tsx` NO se añade a `stryker.config.json` (instrucción explícita del encargo): no tiene
  mutación propia, cubierto solo por estos 7 tests de comportamiento.

## Trazabilidad

- @s7 (hueco con foto real, alt útil, sin ph-woman/externo) → `equipo.test.tsx` describe `@s7`
- @s8 (leyenda de 3 cosas) → `equipo.test.tsx` describe `@s8`
- @s26 (foto+alt por tarjeta, outline 7 filas) → `equipo.test.tsx` describe `@s26`
- @s27 (7 fotos distintas) → `equipo.test.tsx` describe `@s27`
- @s28 (width/height/loading) → `equipo.test.tsx` describe `@s28`
- @s29 (a11y: alt como nombre accesible, no contamina `<h3>`) → `equipo.test.tsx` describe `@s29`
- @s30 (horneado SSR, orden) → `equipo.test.tsx` describe `@s30`
- @s31 (sin ph-woman, sin origen externo, sin par de contraste nuevo) → `equipo.test.tsx` describe
  `@s31`
- Galería (6 fotos, alt, dimensiones, nota honesta, botones accesibles) → `galeria.test.tsx` (fichero
  entero, sin `.feature` propio: el encargo lo especifica directamente)

## Cierre — medido a mano

- `pnpm typecheck` → **0 errores**.
- `pnpm lint` → **0 errores, 0 warnings**.
- `pnpm exec vitest run` (ficheros tocados) → **76/76 verdes**
  (`equipo.test.tsx` 59 + `equipo-estilos.test.ts` 10 + `galeria.test.tsx` 7).
- `pnpm test` (suite completa, UNA sola corrida) → **946/946 verdes, 33 ficheros**. `pnpm build`
  (las 5 puertas) y la mutación las corre el lead al cierre de la sesión, según el encargo.

## Deuda / notas para el lead

- `Reserva.tsx`, `reserva-logica.ts` y `reserva-demo.ts` NO se tocaron (fuera de alcance explícito).
- El copy de `LEYENDA_EQUIPO` (3 cosas) y de la nota de Galería son PROPUESTOS por el `tdd_craftsman`
  (mismo patrón D2/D3 que el contrato original): si el humano prefiere otra redacción, es un cambio de
  literal en `equipo-demo.ts`/`Galeria.tsx` + su test, sin tocar la mecánica.
- `equipo.module.scss` y `galeria.module.scss` ganan una regla `img { object-fit: cover }` sin test
  propio (Stryker no ve SCSS, patrón ya declarado en todo el repo); es la mínima necesaria para que la
  foto rellene el hueco 4/3 sin deformarse.
