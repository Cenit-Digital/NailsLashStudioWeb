<!-- Guardado por el craftsman_lead desde el registro del workflow wf_7b369228-ea2 (el revisor no tenía herramienta de escritura). Texto íntegro del informe del agente. -->

# Review: feature 23 `nailbot_chat_compartido` (más la enmienda F-23 de `reserva_chat`)

**Veredicto:** CHANGES_REQUESTED

La cobertura del contrato es alta y los tests de verdad detectan errores. Aun así rechazo, por cuatro motivos: `bin/harness init` falla siempre, falta el diario TDD con la trazabilidad, hay código que ningún escenario pide con tests mal etiquetados, y una condición de reserva_chat @s24 no tiene ningún test.

## Cobertura de escenarios (cada @s y su test)

### features/nailbot_chat_compartido.feature (14 de 14 cubiertos)
- @s1: [x] cubierto por `chat-nailbot.test.tsx:62-131`, 7 tests sobre `renderToString(<Reserva/>)` y `<ChatNailbot/>`. Comprueban «Nailbot» y el subtítulo como nodos exactos, que no aparece «en línea» ni «nl», el `<svg>` con aria-hidden y focusable y sin data-animacion, la leyenda una sola vez, el log con su nombre, el orden de los 4 anclajes con los cuatro presentes y que no hay h1-h6, section, nav ni `<a `. Hay un punto débil en la regex de 90-100 (ver menores).
- @s2: [x] `chat-nailbot.test.tsx:133-152`: las 4 filas, con `closest('[data-de]')` y `closest('[role=log]')`.
- @s3: [x] `chat-nailbot.test.tsx:154-223`: las 5 filas, incluida «Lo antes posible → franja». Comprueba sin maxlength, que no existe «Este fin de semana» y que no hay más campo que «Tu nombre».
- @s4: [x] `chat-nailbot.test.tsx:225-247` comprueba las 6 burbujas exactas con `data-de`, los botones exactos y el campo. El test de alerta está en `chat-nailbot-logica.test.ts:46-58`, que lee `HORARIO.sabado` como condición previa, tal y como se declaró.
- @s5: [x] `chat-nailbot-logica.test.ts:60-103`: las 4 filas, rango leído en la llamada, que nada diga «abrimos de <rango>» y dos frases distintas en el mismo proceso. La guarda con anclaje por los dos lados está en `:123-144`.
- @s6: [x] `chat-nailbot.test.tsx:249-310`: las 2 filas. Comprueba n exacto, penúltima y última burbuja, un único enlace sin target, «34625223366», `decodeURIComponent` contra el texto escrito a mano, que ya no hay campo, que el único botón es «Reservar otra cita» y que no aparece «undefined» ni doble espacio.
- @s7: [x] `chat-nailbot.test.tsx:312-339`: ausencia antes de terminar en 3 momentos del mismo recorrido, `previousElementSibling`, sin a ni href, `toHaveAccessibleDescription`, id no vacío y único, sin data-de y fuera del log.
- @s8: [x] `chat-nailbot.test.tsx:341-407`: las 7 filas, cada una comprobando antes que el foco está en `body` al montar.
- @s9: [x] `chat-nailbot.test.tsx:425-460`.
- @s10: [x] `chat-nailbot.test.tsx:462-517`: la segunda instancia no se toca mientras avanza la primera, cada una con su resumen y su mensaje, ids únicos con anclaje ≥2, `aria-describedby` hacia el hermano de su propia instancia y sin headings.
- @s11: [x] `chat-nailbot-logica.test.ts:146-225`: congelado en profundidad con `structuredClone`, objetos nuevos, que no devuelve una Promise, determinismo, vacío o solo espacios igual en profundidad, 300 «a» completos y reinicio igual a `estadoInicial()`.
- @s12: [x] `chat-nailbot.test.tsx:519-612`: primero los anclajes positivos. No prohíbe `if (`, `?`, `&&` ni `||`.
- @s13: [x] `chat-nailbot-estilos.test.ts:51-119`: los pares escritos a mano están en `MATRIZ_DE_USO` (verificados: puerta-contraste.ts:211-212 y 230-231), fondos reales, sin keyframes ni animation, `--nb-` fuera de _tokens y sin url( ni @font-face.
- @s14: [x] `nailbot-arte.test.tsx:12-66`.

### Enmienda F-23 de features/reserva_chat.feature
- @s1-@s6 (sin cambios): [x] `reserva.test.tsx:60-221`
- @s7 (ajustado): [x] `:223-284`
- @s8 (retirado): [x] lo hereda F-23 @s1; anotado en `:286-287`
- @s9 (ajustado): [x] `:289-304`, con reparo: no comprueba que la burbuja sea `data-de="bot"`
- @s10: [x] `:306-323`
- @s11 (ajustado): [x] `:325-338`
- @s12 (retirado): [x] lo heredan F-23 @s3 y @s6
- @s13 (ajustado): [x] `:344-376`
- @s14: [x] `:378-399`
- @s15 (ajustado): [x] `:401-423`
- @s16: [x] `:425-449`
- @s17 (ajustado): [x] `:451-488`
- @s18: [x] `:490-520`
- @s19: [x] `:522-538`
- @s20 (ajustado): [x] `:540-564`
- @s21: [ ] no lo verifiqué aquí. Son los tests de build que ya existen (`home-horneado.test.ts`); los lanza el lead.
- @s22 (ajustado): [x] `:566-600` más F-23 @s12, con reparo: al código mudado no se le aplica la guarda de "form action".
- @s23 (ajustado): [x] `:602-636`, las 3 filas, incluido el caso sin nombre
- @s24: [ ] **parcial**. `:638-676` no comprueba «reutiliza la clase global demo-btn demo-btn--wa». Es el bloqueante 4.

Textos esperados escritos a mano (sin tautologías): se cumple. Los tests nuevos no importan `nailbot-demo`, `TELEFONO`, `waHref`, `mensajeReserva` ni `responder` como valor esperado. La única importación de datos es `HORARIO` en el test de alerta, que es la excepción declarada. No se usa `toHaveClass` en ninguno.

## Disciplina TDD
- ¿Hay código de producción que ningún test pida? **SÍ.**
  - `chat-nailbot-logica.ts:161-166`: la rama `nombre` condicional y el `return estado` para entradas desconocidas. Solo lo pide un test pensado para el futuro, mal etiquetado como @s11 (`chat-nailbot-logica.test.ts:227-236`).
  - `chat-nailbot-logica.ts:114`: `paso === 'dia' &&` no se puede alcanzar desde la UI. Su test está mal etiquetado como @s5 (`:105-110`).
- ¿Hay prueba de rojo-verde-refactor? **NO.** `progress/tdd_nailbot_chat_compartido.md` no existe, aunque `progress/current.md:28` lo cita. El lead declara que escribió el código primero y luego los tests contra el contrato.

## Calidad
- Lo bueno: `responder` es pura y corta, con la tabla `SIGUIENTE`, tipos `readonly`, `fraseSabado` calculada en la llamada, el texto centralizado y `useId` para el aviso. `mensajeReserva` cambia lo mínimo (`reserva-logica.ts:33-41`). Las guardas sobre el código fuente respetan las restricciones de Stryker. No hay logs de depuración ni TODOs.
- `ChatNailbot.tsx:69`: un cast `as SolicitudReserva` en cada render.
- `ChatNailbot.tsx:123-133`: envío del nombre duplicado.
- `ChatNailbot.tsx:37-169`: componente largo, con 3 estados del pie en un solo JSX.
- `ChatNailbot.tsx:120-121, 132, 135, 159, 162`: texto dentro del componente, que contradice `nailbot-demo.ts:1-2` («TODO el copy»).
- `chat-nailbot-logica.ts:18` («sin DOM») frente a `:180-198` (`enfocarPrimerControl`): un efecto de UI dentro del módulo del cerebro puro.
- `chat-nailbot-logica.ts:110`: con `elegir` fuera de su paso sale `paso: undefined`. La defensa es selectiva frente a `:165`.
- `Reserva.tsx:13` dice «4 pasos», pero con «Un sábado» son tres.
- Tests: la regex débil de `chat-nailbot.test.tsx:90-100`, la aserción de foco que no prueba nada en `:409-422`, y `nailbot-arte.test.tsx:50-55`, que no mira opacity en las bases.

## Checkpoints
- C1: [x] ficheros base · [x] docs · [ ] `bin/harness init` exit 0. Falla en el paso 3 (2 features en `in_progress`); lo confirmé con `harness status`.
- C2: [ ] como mucho una en `in_progress` (están la 23 y la 24) · [ ] features `done` con tests en verde (suite completa sin ejecutar) · [x] current.md describe la sesión activa.
- C3: [x] módulos (architecture.md sigue siendo una plantilla sin capas) · [x] sin dependencias nuevas · [x] sin logs ni TODOs.
- C4: [x] al menos un test por módulo · [x] aislamiento real (bytes reales, sin simular el FS) · [ ] `bin/harness test` completo sin verificar.
- C5: [ ] `.claude/launch.json` fuera de git · [ ] history.md sin entrada de Nailbot (la sesión sigue abierta) · [x] F-23 en `in_progress`.
- C6: [x] .feature y spec · [x] tags @s y Then medibles · [ ] mapa en `progress/tdd_nailbot_chat_compartido.md` · [ ] sin producción que no pida ningún test rojo.
- C7: [ ] pendiente del mutation_tester (mutación en curso).

## Cambios requeridos
1. F-24 → `spec_ready` mientras F-23 siga abierta. Cuando acabe la mutación, `bin/harness init` completo en verde, con la suite entera y los `*-horneado`.
2. Escribir `progress/tdd_nailbot_chat_compartido.md` con el mapa de cada @s a su test (el de arriba sirve) y con la desviación de haber escrito el código primero declarada con honestidad.
3. Quitar el código que nadie pidió: `chat-nailbot-logica.ts:161-166` (rama terminal o `switch` exhaustivo con `never`) y `:114` (`paso === 'dia' &&`), junto con sus tests `chat-nailbot-logica.test.ts:227-236` y `:105-110`. La otra opción es quitarles la etiqueta @s y justificar la decisión en el diario.
4. Comprobar la clase global `demo-btn demo-btn--wa` del enlace final (reserva_chat @s24), leyendo el atributo `class` y no con `toHaveClass`.
5. (Recomendado) Arreglar los menores. Sobre todo: añadir "form action" a la guarda de F-23 @s12 o corregir la remisión de reserva_chat @s22, anotar en F-16 la deuda de la capa 1 (HS-1) y hacer commit de las ediciones de `reserva_chat.feature`.

Nota: he trabajado en solo lectura. No he creado `progress/judge_nailbot_chat_compartido.md`: este bloque es su contenido y lo tiene que guardar el lead.

## Menores (lista devuelta)

- chat-nailbot.test.tsx:90-100 (@s1, «la leyenda no es una burbuja»): la regex `data-de="…"[^>]*>([^<]*)<` solo captura el texto hasta la primera etiqueta hija. Si la leyenda estuviera dentro de un hijo de una burbuja, el test pasaría igual. Lo compensa @s2 «al montar» (usa `closest`), pero lo horneado se comprueba de forma débil.
- chat-nailbot.test.tsx:409-422: la parte de «no mueve el foco» no prueba nada. En el paso del nombre el primer control del pie ya es el campo, así que aunque el efecto se disparara el foco acabaría en el mismo sitio. Lo único que sí detecta errores es el conteo de burbujas, y eso ya lo cubre reserva @s14.
- reserva.test.tsx:289-303 (@s9 ajustado): comprueba que bot + usuario suman 1, pero no que esa burbuja sea `data-de="bot"` como pide el ajuste. En jsdom sí lo cubren chat-nailbot @s3 (fila 1) y @s9; en el HTML horneado, no.
- chat-nailbot.test.tsx:557-570 frente a reserva_chat.feature:605-606: la remisión habla de «esa misma guarda», que incluye "form action", pero F-23 @s12 y su test no prohíben "form action" en ChatNailbot.tsx ni en chat-nailbot-logica.ts. Hay que añadirlo al test o corregir el texto de la remisión.
- nailbot-arte.test.tsx:50-55: «ninguno con atributo opacity» solo se comprueba en los cuatro esmaltes, no en las cuatro bases.
- ChatNailbot.tsx:69: `estado.respuestas as SolicitudReserva` se calcula en cada render, y el tipo miente antes de `hecho`. Sería mejor componer el href solo en la rama `hecho`.
- ChatNailbot.tsx:123-133: `actuar({ tipo: 'nombre', valor: borrador })` está duplicado en el Enter y en el botón. Conviene sacarlo a una función `enviarNombre`.
- ChatNailbot.tsx:37-169: unas 130 líneas con los tres estados del pie en un solo JSX. Es candidato a separar el pie por pasos.
- ChatNailbot.tsx:120-121, 132, 135, 159 y 162: parte del texto sigue dentro del componente, mientras nailbot-demo.ts:1-2 dice que ahí está «TODO el copy de Nailbot». O se muda ese texto o se corrige el comentario.
- chat-nailbot-logica.ts:18 dice «sin DOM», pero en :180-198 viven `enfocarPrimerControl` y `SELECTOR_CONTROLES`, que mueven el foco dentro del módulo de la lógica pura. docs/architecture.md dice «No mezclar IO con lógica de dominio». Hay precedente (`desplazarAlFinal` en reserva-logica.ts), pero el comentario del módulo queda falso.
- Reserva.tsx:13 dice «chat guiado de 4 pasos», pero con «Un sábado» son tres.
- HS-1 (project-spec.md:3007-3010; nailbot_chat_compartido.feature:91-94): F-16 `paginas_legales` (feature_list.json:364) no recoge «completar la capa 1 de Nailbot». La deuda A-23 no está registrada.
- features/reserva_chat.feature: los cuerpos de @s15, @s17, @s20, @s22 y @s23 están editados sin commit. Completan lo que el banner ya anunciaba en b7af7b0; hay que hacer commit junto al código. El humano canceló la puerta sobre los .feature (feature_list, `puerta_humana`) y queda constancia.
- .claude/launch.json no está en git: hay que decidir entre hacer commit o añadirlo a .gitignore (C5).
