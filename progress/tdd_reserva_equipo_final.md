# TDD — cierre de la sesión interrumpida: `#reserva` sin mini-calendario + monograma de `#equipo`

Retoma un árbol a medias (roto, no compilaba). Dos trabajos, cada uno sobre un contrato ya aprobado:
- `features/reserva_chat.feature` (@s1-@s22; @s21 es del build global, no se re-testea aquí).
- `features/equipo_reservas.feature` (@s26-@s31, la ampliación del monograma; @s1-@s25 ya estaban
  cerrados y con mutación 100% de una sesión previa — ver `progress/current.md`).

## Trabajo A — `#reserva`: fuera el mini-calendario, columna izquierda restaurada

### Estado de partida (medido)
- `Reserva.tsx` usaba `RESERVA_WHATSAPP_TEXTO` sin importarlo (no compilaba) y el mini-calendario
  (`SERVICIOS`/`HORAS`/`DOW`, `DiaReserva`, cuatro `useState`, un `useEffect`, `completo`,
  `enlaceWhatsApp`) seguía entero junto al copy ya restaurado del diseño.
- `estilos.reserva` no existía en `reserva.module.scss` (renderizaría `undefined` en el `className`,
  igual que `estilos.catalogo`/`estilos.contacto`/etc. en el resto del repo — se corrige aquí
  siguiendo el patrón `.equipo {}` que sí define un ancla vacía).
- `reserva.test.tsx` solo cubría @s1/@s2.

### Ciclos (Rojo→Verde→Refactor)
1. **Import + borrado del calendario** (VERDE directo: sin esto ni compilaba). `Reserva.tsx` queda con
   SOLO el copy del diseño + los dos enlaces + el chat de 4 pasos, sin ningún estado de
   servicio/día/hora.
2. **`reserva.module.scss`**: se borran `.paso`, `.pasoTitulo`, `.chip`, `.chipActivo`, `.dia`,
   `.diaActivo`, `.diaDow`, `.diaNum`, `.cargando`, `.deshabilitado` (verificado con grep antes de
   tocar: ninguno lo usaba fuera del calendario). Se conservan `.opciones` (lo usa el chat) y
   `.acciones` (los dos enlaces). Se añade `.reserva {}` vacío para que `estilos.reserva` deje de ser
   `undefined`.
3. **@s8 (RED→GREEN)**: el test exigía `aria-hidden="true"` en el avatar «nl» del chat — el código NO
   lo tenía. Se añadió el atributo (única línea de producción nueva motivada por un test rojo).
4. **@s19 (RED→GREEN)**: el test exigía `data-de="bot"|"usuario"` en cada burbuja y que la clase la
   decidiera una función PURA testeada por valor. Se creó `src/components/reserva-logica.ts`
   (`claveBurbuja(deBot): 'burbujaBot' | 'burbujaUsuario'`) y se cableó en `Reserva.tsx`
   (`estilos[claveBurbuja(m.deBot)]` + `data-de={...}`).
5. **@s3-@s22 restantes**: ya los satisfacía el chat existente (guion fijo, `trim()`, resumen, Enter,
   reinicio, scroll); se escribieron los tests que lo demuestran, todos verdes sin más cambios de
   producción (Ley 3: nada se tocó sin un test rojo que lo pidiera).

### Desviación declarada (instruida por el lead, no improvisada)
@s3, @s5, @s21, @s22 hablan de "HTML crudo prerenderizado de `dist/`" / "`pnpm build`". Esta sesión
tiene PROHIBIDO crear tests build-based nuevos (coste de build completo); se cubren con
`renderToString(<Reserva />)` — el mismo mecanismo de prerender que usa `vite-react-ssg` — igual que ya
hacía el propio `reserva.test.tsx` en @s1/@s2. @s21 (las cinco puertas del build) no se re-testea aquí:
lo cubren los tests build-based YA existentes del repo; el `pnpm build` real lo corre el lead.

### Fuera de alcance (respetado)
No se tocó `stryker.config.json` (prohibido en esta sesión): `Reserva.tsx` y `reserva-logica.ts`
quedan FUERA de `mutate` por ahora — su entrada a mutación es una decisión de una sesión futura, no de
esta.

## Trabajo B — monograma en las tarjetas de `#equipo`

### Ciclos
1. **`inicialDe` (RED→GREEN)**: tests por valor en `equipo.test.tsx` (@s27: mayúscula siempre, incluida
   la fila «ángela»→«Á»; @s28: cadena vacía sin guarda). Implementación mínima:
   `nombre.charAt(0).toUpperCase()` — SIN guarda `if (nombre.length === 0)` (sería un mutante
   equivalente inmatable, tal y como avisa el contrato).
2. **Monograma en `Equipo.tsx` (RED→GREEN)**: el hueco `<div className={estilos.foto} aria-hidden>`
   pasa a envolver `<span className={estilos.monograma}>{inicialDe(profesional.nombre)}</span>`.
   Sigue decorativo (aria-hidden en el padre, sin `<img>`, sin `role`, sin `aria-label`, sin `title`).
3. **`equipo.module.scss` / `equipo-estilos.test.ts`**: `.foto` centra su contenido (flex); `.monograma`
   en `'Gilda Display', serif` sobre `--accent-dark` (D8, decisión ya tomada por el lead) — reutiliza
   el par YA declarado en `puerta-contraste.ts` (`MINIMO_DE_PARES` sigue en 18, no se toca nada a mano).

### Desviación declarada (misma razón que en Trabajo A)
@s30/@s31 hablan de `dist/index.html` tras `pnpm build`. Se cubren con `renderToString(<Equipo />)`
(mismo mecanismo de prerender); el resto de @s31 (conjunto de ids/nav, `MINIMO_DE_PARES`) ya lo vigilan
las puertas globales existentes, no específicas de esta ampliación.

## Trazabilidad

### `reserva_chat.feature`
| Escenario | Test |
|---|---|
| @s1 | `@s1 la columna izquierda hornea...` (3 tests, ya existían) |
| @s2 | `@s2 la sección ofrece EXACTAMENTE dos enlaces...` (3 tests, ya existían) |
| @s3 | `@s3 el href de WhatsApp DERIVA de F-02...` |
| @s4 | `@s4 el .tsx NO hornea ni el número...` |
| @s5 | `@s5 el href de llamar DERIVA de telHref...` |
| @s6 | `@s6 en la columna izquierda YA NO HAY mini-calendario` (2 tests) |
| @s7 | `@s7 la hoja de estilos pierde los bloques...` (3 tests) |
| @s8 | `@s8 la cabecera del chat identifica al estudio...` |
| @s9 | `@s9 el chat viaja HORNEADO...` |
| @s10 | `@s10 las opciones del primer paso son las categorías REALES...` (2 tests) |
| @s11 | `@s11 elegir una opción añade mi respuesta...` |
| @s12 | `@s12 el guion es FIJO y tiene cuatro pasos...` (4 tests, uno por paso) |
| @s13 | `@s13 el cuarto paso pide el nombre por texto libre...` |
| @s14 | `@s14 enviar el nombre vacío o solo espacios...` (2 tests, vacío + solo espacios) |
| @s15 | `@s15 completar el guion muestra el resumen interpolado...` |
| @s16 | `@s16 la tecla Enter equivale al botón de enviar...` (2 tests, Enter + Escape) |
| @s17 | `@s17 "Reservar otra cita" reinicia el guion...` |
| @s18 | `@s18 el hilo se desplaza automáticamente...` |
| @s19 | `@s19 quién habla en cada burbuja vive en un atributo CONSULTABLE...` (2 tests) |
| @s20 | `@s20 el nombre se interpola VERBATIM...` |
| @s21 | cubierto por los tests build-based YA existentes del repo (no se añade ninguno nuevo aquí) |
| @s22 | `@s22 la sección NO compone la solicitud ni envía nada...` (3 tests) |

### `equipo_reservas.feature` (ampliación @s26-@s31)
| Escenario | Test |
|---|---|
| @s26 | `@s26 cada una de las siete tarjetas muestra el monograma...` (7 tests, uno por profesional) |
| @s27 | `@s27 la inicial se devuelve SIEMPRE en mayúscula...` (4 tests, uno por fila) |
| @s28 | `@s28 CASO LÍMITE — un nombre vacío devuelve cadena vacía...` |
| @s29 | `@s29 el monograma es DECORATIVO...` |
| @s30 | `@s30 las siete iniciales viajan HORNEADAS (SSR)...` |
| @s31 | `@s31 el monograma NO reintroduce fotos ni rompe las puertas...` (2 tests) |

## Métricas medidas (esta sesión)
- `pnpm typecheck` → 0 errores.
- `pnpm lint` → 0 errores, 0 warnings.
- `pnpm test` (una sola corrida completa) → **943/943 verdes**, 32 ficheros de test.
- NO se corrió `pnpm build`: es tarea del lead al cierre.

## Bloqueantes / pendientes para el lead
- Ninguno de código. `judge` y `mutation_tester` quedan pendientes (no se marca `done`).
- `Reserva.tsx` y `reserva-logica.ts` NO están en `mutate` de `stryker.config.json` (prohibido tocarlo
  en esta sesión): si se quiere mutación 100% sobre `#reserva`, hace falta una sesión que añada esas
  dos líneas y cierre los supervivientes que aparezcan.
