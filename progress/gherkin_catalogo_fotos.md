# Gherkin — F-27 `catalogo_fotos` (2026-09-29)

`features/catalogo_fotos.feature`: **26 escenarios** (@s1-@s26). Hay 3 `Scenario Outline` (@s1, @s14 y @s20). @s1-@s21 son unitarios o de bytes y @s22-@s26 son `@verificacion-viva`. Fuente: `project-spec.md` §Feature 27. No se ha tocado `src/`, ningún test, `project-spec.md` ni `feature_list.json`. **El paso a `spec_ready` lo hace el lead**, porque así lo dice el encargo.

## Escenarios y mapa @s → contrato

| @s  | Qué fija                                                                                                                         | Spec                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| s1  | Exactamente una `<img>` por categoría con el `alt` exacto de la tabla (Outline por `clave`)                                      | CF-1, CF-C2, CF-C6            |
| s2  | Tres `alt` no vacíos y distintos, y tres `src` distintos                                                                         | Caso límite 8                 |
| s3  | `src` del fichero local de cada categoría, sin `http(s)`, `//` ni `data:`                                                        | CF-C4, F-05                   |
| s4  | `width="800"`, `height="1000"` y `loading="lazy"`, sin `fetchpriority` ni `eager`                                                | CF-C2, CF-6                   |
| s5  | La `<img>` ES el hueco: hija directa tras la carta, sin envoltorio y sin `aria-hidden`                                           | CF-2, CF-C2                   |
| s6  | Árbol de accesibilidad: 3 imágenes con su `alt`, los `<h3>` y los enlaces sin contaminar                                         | CF-1                          |
| s7  | Horneado por SSR y en orden (título, CTA, foto ×3, leyendas), con ancla positiva                                                 | CF-C4, caso límite 3          |
| s8  | `LEYENDA_FOTOS` una sola vez, en un `<p>` propio, justo tras el de precios                                                       | CF-4, CF-C2, CF-C5            |
| s9  | `LEYENDA_PRECIOS` no cambia ni un byte y no se funde con la de fotos                                                             | CF-C1, CF-4 (F-09 Q-B)        |
| s10 | `<section>`, `aria-labelledby`, id único `servicios-titulo`, 0/1/3 encabezados y eyebrows                                        | CF-C2, CF-C6 (mutante del id) |
| s11 | 3 CTA `#reserva-titulo` y 6 filas por carta                                                                                      | CF-C2, CF-C6 (flecha `.map`)  |
| s12 | `class` global: `demo-seccion`, `demo-card`, `demo-btn` y `demo-btn--solido`                                                     | CF-5, CF-C6                   |
| s13 | Honestidad de los `alt`: sin «foto de», sin «nuestro/del salón», sin nombres, Depilación sin «cera»/«depil»                      | CF-C5, CF-7                   |
| s14 | Datos: `foto` y `alt` por `clave` (Outline)                                                                                      | CF-C1, CF-3                   |
| s15 | Datos: `LEYENDA_FOTOS` literal, `LEYENDA_PRECIOS` intacta y orden de claves                                                      | CF-C1, CF-4                   |
| s16 | Sin `foto` o sin `alt` no compila (`@ts-expect-error` + `pnpm typecheck`)                                                        | Caso límite 7                 |
| s17 | Fuente de `Catalogo.tsx`: `estilos.foto` una vez y dentro de `<img`, sin `aria-hidden`, sin `.jpg`                               | CF-2, CF-3                    |
| s18 | Fuente de `catalogo-demo.ts`: exactamente 3 `import` estáticos de `assets/servicios/`                                            | CF-3                          |
| s19 | Los 3 JPEG miden 800 × 1000 (SOF) y no llevan EXIF                                                                               | CF-C2, CF-C4                  |
| s20 | Hoja `.foto`: `display`, `width`, `height: auto`, `aspect-ratio: 4 / 5`, `object-fit: cover`, radio, borde y degradado (Outline) | CF-C3                         |
| s21 | Hoja: sin `min-height`, `max-height`, `object-position` ni `transition`; rejilla de F-08 intacta                                 | CF-C3, casos límite 2/10      |
| s22 | En vivo: bytes de `dist/index.html`, build en exit 0, sin precarga de imagen                                                     | CF-C4, I-8                    |
| s23 | En vivo: cubren el hueco sin deformarse de 320 a 1280 px, 1 columna a 320 y sin peticiones a terceros                            | Aceptación #27, CF-2          |
| s24 | En vivo: CLS 0, también al saltar con «Ver servicios»                                                                            | Caso límite 4                 |
| s25 | En vivo: medida de CF-6 a 1280 × 800 y 1440 × 900, con las dos ramas escritas                                                    | CF-6, caso límite 5           |
| s26 | En vivo: si la foto falla, el hueco conserva el 4:5 y el degradado y enseña el `alt`                                             | Caso límite 1                 |

Casos límite sin escenario propio: el 6 (densidad 2×) queda aceptado y se remite a F-17; el 9 (cambiar una foto) va cubierto por @s1, @s14 y @s19; el 10 (movimiento reducido) va como negativa en @s21.

Mutantes de `Catalogo.tsx` previstos: unos 6, y el escenario que mata cada uno está en la cabecera del `.feature`.

Hechos comprobados al escribir: los tres `.jpg` son SOF2 (progresivos), miden 800 × 1000 y no tienen APP1/EXIF, así que @s19 se cumple hoy.

## Dudas para la puerta humana

1. **Ratificar CF-1..CF-7**, sobre todo el texto de `LEYENDA_FOTOS` (@s8, @s15) y los tres `alt` (@s1).
2. **@s16 no tiene precedente en el repo.** Usa `@ts-expect-error` y lo comprueba `pnpm typecheck`. La spec dice que en ejecución «no hay rama que probar», y este escenario prueba el tipo. Si no se quiere, se retira sin que cambie nada más.
3. **@s17 es una guarda sobre la fuente** (precedente: `contacto-fuente.test.ts`). Con `css: false` es la única prueba unitaria de que la clase `.foto` la lleva la `<img>`. Si se retira, CF-2 solo queda cubierta en vivo (@s23).
4. **@s19 lo propone este autor.** La spec no pide expresamente un test de ficheros, pero afirma «medidas reales» y «sin EXIF». Si se retira, `width`/`height` podrían mentir el día que Pablo cambie una foto.
5. **@s13 comprueba los nombres de las 7 profesionales** como indicador medible de «no identifica a una persona». Hay que confirmar que ese indicador vale.
6. **@s4 prohíbe `fetchpriority` y `eager`.** Si @s25 demuestra que la foto de Uñas cae en el primer viewport, el lead tendrá que enmendar @s4 y añadir un escenario propio.
7. **A-2 sigue abierta.** El docblock de `catalogo-demo.ts` dice que «Facial» y «Depilación» no existen en este salón (lo mismo recoge D6 en `equipo_reservas.feature`), y F-27 les pone foto, lo que les da más peso visual. La feature no ratifica esas categorías, pero conviene que Pablo lo sepa.
8. **Comentarios que quedarán desfasados.** La cabecera de `catalogo.module.scss` («placeholder rosa, sin fotos reales») y el comentario de `.foto` quedarán obsoletos. Es un retoque de `tdd_craftsman` y no tiene escenario.
