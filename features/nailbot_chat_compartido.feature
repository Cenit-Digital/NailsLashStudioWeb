# =============================================================================================
# CONTRATO — F-23 `nailbot_chat_compartido`: el chat de `#reserva` pasa a ser NAILBOT. Un solo
# cerebro PURO (`responder`), honesto (dice lo que es: automático, de demo, ni persona ni IA), que
# pide el mínimo (nombre OPCIONAL, nunca teléfono) y que NO envía nada por sí mismo. Un componente,
# DOS instancias independientes: la de `#reserva` (horneada por el SSG) y la del panel del robot
# flotante (F-24, solo cliente).
# Estado: PROPUESTA hasta la puerta humana (gherkin_author, 2026-09-27). Sin entrada todavía en
# `feature_list.json`: la crea el craftsman_lead.
# =============================================================================================
# FUENTES, EN ORDEN DE MANDO
#   1. `project-spec.md` → «Resolución del craftsman_lead a HS-1..HS-7 (2026-09-27)». MANDA sobre el
#      brief y sobre las propuestas del spec_partner. En particular: el COPY CORREGIDO de HS-6
#      SUSTITUYE a los dos resúmenes del brief §4 («Pulsa el botón…» nombraba un ENLACE), y el nombre
#      accesible del hilo es «Conversación con Nailbot» (HS-4).
#   2. `progress/nailbot_diseno.md` (el brief): §4 = copy LITERAL, §5 = nombres de artefacto.
#   3. `project-spec.md` → «Feature 23»: contrato, casos límite y criterios de aceptación.
#   4. `docs/research/asistente-robot/05-restricciones-repo.md` §«Reglas para el nuevo widget».
#      Es ANTERIOR a L1–L16: donde choca con la spec, manda la spec.
#
# =============================================================================================
# ARTEFACTOS (brief §5 — fijados: el tdd_craftsman NO elige nombres)
# =============================================================================================
#   src/components/ChatNailbot.tsx           NUEVO · `export function ChatNailbot` (solo el componente, eslint.config.js:24)
#   src/components/chat-nailbot.module.scss  NUEVO · recibe los selectores del chat que salen de reserva.module.scss
#   src/components/chat-nailbot-logica.ts    NUEVO · `responder(estado, entrada) → estado`, PURA (la costura, L4)
#   src/components/NailbotArte.tsx           NUEVO · `export function NailbotArte`, SVG estático (F-24 lo animará)
#   src/components/nailbot-arte.module.scss  NUEVO · la paleta decorativa `--nb-*` (NO va en _tokens.scss)
#   src/lib/demo/nailbot-demo.ts             NUEVO · TODO el copy de Nailbot (brief §4 + HS-4 + HS-6)
#   tests: chat-nailbot.test.tsx · chat-nailbot-logica.test.ts · chat-nailbot-estilos.test.ts · nailbot-arte.test.tsx
#   TOCA: Reserva.tsx (monta <ChatNailbot/> en la columna derecha) · reserva.module.scss (pierde el
#         chat) · reserva-logica.ts (`mensajeReserva` AMPLIADA con `nombre` opcional, SIN moverla;
#         `claveBurbuja` y `desplazarAlFinal` se reutilizan SIN moverlas) · reserva.test.tsx ·
#         features/reserva_chat.feature (ENMIENDA F-23) · stryker.config.json (+3 en `mutate`).
#   SELECTORES FIJADOS de chat-nailbot.module.scss: los MUDADOS conservan su nombre (.chat,
#   .chatCabecera, .hilo, .burbujaBot, .burbujaUsuario, .opciones, .chipChat, .entrada, .reiniciar)
#   y los TRES NUEVOS se fijan aquí (.subtitulo, .leyenda, .aviso). `.burbujaBot`/`.burbujaUsuario`
#   no son negociables: son las claves que devuelve `claveBurbuja`.
#
# =============================================================================================
# «VERDE ≠ FUNCIONA» — DÓNDE SE ASEVERA CADA COSA
# =============================================================================================
#   · renderToString (lo HORNEADO; jamás jsdom): @s1 (sobre <Reserva/> y sobre <ChatNailbot/>) y
#     @s14 (<NailbotArte/>). El estado inicial horneado (una burbuja, tres opciones, sin campo) ya lo
#     fija reserva_chat @s9 (AJUSTADO): NO se duplica aquí.
#   · render + fireEvent en jsdom (interacción; literales A MANO): @s2, @s3, @s4, @s6, @s7, @s8,
#     @s9, @s10 → chat-nailbot.test.tsx.
#   · Función PURA por valor: @s5, @s11 y el canario de @s4 → chat-nailbot-logica.test.ts.
#     `mensajeReserva` sin nombre → reserva_chat @s23 (fila nueva): NO se duplica aquí.
#   · BYTES (readFileSync; SCSS con `cuerpoDelBloque`; ANCLA POSITIVA SIEMPRE PRIMERO): @s12
#     (fuentes .ts/.tsx) y @s13 (SCSS). Los comentarios también son bytes.
#   · Build (`pnpm build`, cinco puertas): lo corre el LEAD. NINGÚN test nuevo lo lanza (L16,
#     `05` §2.4). Su escenario sigue siendo reserva_chat @s21, INTACTO.
#   · SOLO EN NAVEGADOR/LECTOR REAL → lista «VERIFICACIÓN EN VIVO DEL LEAD» al final. NO son escenarios.
#
# =============================================================================================
# ANTI-TAUTOLOGÍA Y PROHIBICIONES (reglas duras del arnés)
# =============================================================================================
#   ✅ TODO esperado se escribe A MANO: cada frase del guion, el resumen, el mensaje, la leyenda, el
#      aviso, «34625223366». Para el mensaje largo, `decodeURIComponent` del href (inverso NATIVO que
#      ningún código de producción llama) contra el literal escrito a mano (precedente reserva_chat @s24).
#   ❌ PROHIBIDO importar como VALOR ESPERADO: nada de `nailbot-demo.ts`, `TELEFONO`, `waHref`,
#      `mensajeReserva`, `responder` ni `HORARIO`; y PROHIBIDO reejecutarlas para comparar con su
#      propio resultado. ÚNICA excepción declarada: el canario de @s4 LEE `HORARIO.sabado` como
#      PRECONDICIÓN (no como esperado), por decisión HS-3 (b).
#   ❌ PROHIBIDO aseverar el HOST de WhatsApp (A-10 de F-02): solo negativas sobre bytes (@s12).
#   ❌ PROHIBIDO `toHaveClass`, aseverar por clase de CSS module y meter estado en un `className`
#      condicional (`css:false`: 5 mutantes, 5 supervivientes, `cabecera.test.tsx`). Quién habla va
#      en `data-de`; el estado del arte, en atributos.
#   ❌ PROHIBIDO en un fichero que esté en `mutate`: guardas de fuente contra `if (`, `?`, `&&` o `||`
#      (Stryker instrumenta el sandbox con ellos y el dry-run muere: lección del botón retirado,
#      `05` §7). Las guardas de @s12 solo vetan literales que Stryker jamás inyecta.
#   ❌ PROHIBIDO derivar la frase del sábado en la CARGA del módulo (mutante estático que el runner no
#      activa, `hero-logica.ts:10-12`): se calcula EN LA LLAMADA (@s5).
#   ❌ PROHIBIDO `dangerouslySetInnerHTML`, cualquier `id` literal (dos instancias en la página: los
#      ids salen de `useId`), `<section>`, `<nav>` o `<h1>`–`<h6>` en ChatNailbot o NailbotArte.
#   ❌ PROHIBIDO crear tests build-based (`*-horneado`) y usar `--testFiles` en la mutación.
#
# =============================================================================================
# LA COSTURA DEL SERVIDOR FUTURO (L4 + HS-7, declarado con honestidad)
# =============================================================================================
#   `responder(estado, entrada) → estado` ES la costura: no hay interfaz, ni adaptador, ni `async`.
#   GARANTIZA: la FORMA del estado que pinta la UI y un ÚNICO punto de sustitución.
#   NO GARANTIZA: la sincronía (un `fetch` es asíncrono y puede fallar: hará falta un estado de espera
#   y una salida de error), el texto libre (hoy solo hay chips y el nombre) ni el copy legal (el día
#   que haya IA, el art. 50.1 del AI Act obliga a cambiar la leyenda y a avisar en el primer turno).
#   Nada asíncrono hoy: @s11 lo asevera.
#
# =============================================================================================
# DEUDAS DECLARADAS (no son fallos de este contrato; los ve la puerta)
# =============================================================================================
#   · A-23 / HS-1: el aviso de @s7 es capa 1 PROVISIONAL: cubre la finalidad y el control del envío,
#     NO la identidad del responsable, ni los derechos, ni el enlace a la política (F-16 `blocked`;
#     la anti-404 de F-04 rompería el build si enlazara). El lead añade a F-16 «completar la capa 1
#     de Nailbot». Cada aprobación del despliegue en Pages asume a sabiendas esa capa incompleta.
#   · HS-5 (a): el token `--estado-en-linea` y su fila de MATRIZ_DE_USO SE QUEDAN (deuda viva): borrar
#     la fila bajaría el 18 de MINIMO_DE_PARES y rompería la puerta 3 y reserva_chat @s21.
#   · Emoji del copy («💅», «✨»): copy literal decidido. Cómo los nombra el lector: EN VIVO.
#
# =============================================================================================
# TRAZA — casos límite y huecos de la spec → escenario
# =============================================================================================
#   1 «Un sábado»                           → @s4, @s6 (fila «con nombre, por el sábado»)
#   2 HORARIO.sabado que no es un rango     → @s5
#   3 «Prefiero no decirlo»                 → @s6 (fila «sin nombre»), reserva_chat @s23 (fila nueva)
#   4 nombre vacío o de solo espacios       → reserva_chat @s14 (INTACTO) + @s11 (por valor)
#   5 «Mª Ángeles & Co.»                    → reserva_chat @s20 (AJUSTADO) + @s12 (sin dangerouslySetInnerHTML)
#   6 nombre muy largo, sin maxlength       → @s3 (fila «nombre») + @s11 (llega ENTERO)
#   7 reiniciar tras sábado y sin nombre    → @s9 + @s11
#   8 dos instancias en la misma página     → @s10
#   9 SSR sin JS                            → @s1 + reserva_chat @s9
#  10 antes de terminar, ni aviso ni enlace → @s7 + reserva_chat @s24 (INTACTO)
#  11 Enter envía; otra tecla, no           → reserva_chat @s16 (INTACTO)
#  12 emoji del copy                        → EN VIVO (lector de pantalla)
#   HS-1 → @s7 · HS-2 → @s4 · HS-3 → @s5 (a) y @s4 (b, canario) · HS-4 → @s1 (a), @s8 (b), @s7 (c)
#   HS-5 → @s13 · HS-6 → @s6 · HS-7 → cabecera + @s11 · L2 (nunca teléfono ni texto libre) → @s3
#   L5 (dos instancias) → @s10 · L6 (sábado desde el dato) → @s4, @s5, @s12 · L15 (sin red) → @s12
#
# =============================================================================================
# MUTACIÓN (umbral 1.0 del repo)
# =============================================================================================
#   100 % en ChatNailbot.tsx, chat-nailbot-logica.ts y NailbotArte.tsx (NUEVOS en `mutate`) y
#   RE-MEDIDA en Reserva.tsx y reserva-logica.ts. Se acota con `node tools/mutate.mjs <ficheros>`
#   (`--mutate`), JAMÁS con `--testFiles` (0 % falso). Con timeouts, re-medir a `--concurrency 1`.
#   Todo el SCSS es NO-MUTABLE por declaración: lo cubren los bytes de @s13.
#
# =============================================================================================
# DECISIONES DEL gherkin_author QUE LA PUERTA DEBE VER (derivadas, no inventadas)
# =============================================================================================
#   G1 · «Prefiero no decirlo» se pinta como burbuja DE LA PERSONA (@s6): lo deriva la regla general
#        del contrato 2 de la spec («cada opción elegida aparece como burbuja de la persona»). Si la
#        puerta prefiere que no, solo cambia la fila «sin nombre» de @s6 (n = 8 y sin esa burbuja).
#   G2 · Nombres fijados que la spec no fijaba: `.subtitulo`, `.leyenda`, `.aviso` (@s13); el nombre
#        accesible del hilo va por `aria-label` (no hay título visible para `aria-labelledby`).
#   G3 · En reserva_chat, @s12 pasa a RETIRADO (la spec proponía AJUSTADO) para no duplicar el guion:
#        su contenido entero lo fija @s3 de aquí. Ver el banner de la ENMIENDA F-23 de ese fichero.
# =============================================================================================

Feature: Nailbot, el asistente de reserva compartido — un guion honesto de opciones cerradas, nombre opcional y salida a WhatsApp que envía ella, con un solo cerebro puro para #reserva y para el panel del robot
  Como visitante quiero componer mi solicitud de cita en cuatro pasos de opciones cerradas (tres si
  elijo sábado), con un asistente que me dice lo que es y no me pide más de lo necesario, y que al
  terminar me dé un enlace de WhatsApp con el mensaje escrito que decido yo si envío; y como
  responsable del proyecto quiero que ese mismo cerebro sirva, sin duplicarse, en #reserva y en el
  robot flotante, sin red, sin storage y sin romper ninguna de las cinco puertas.

  # ---------------------------------------------------------------------------------------------
  # LO HORNEADO: identidad honesta, leyenda y un hilo que es un registro con nombre.
  # ---------------------------------------------------------------------------------------------

  @s1
  Scenario: Horneado, el chat dice lo que es — «Nailbot», «Asistente automático · demo», la leyenda y un hilo role="log" con nombre — y no trae ningún heading, sección, nav ni enlace
    Given la sección de reserva renderizada con renderToString(<Reserva />) y, aparte, ChatNailbot solo con renderToString(<ChatNailbot />), sin ejecutar JavaScript
    When se lee el HTML horneado del chat
    Then la cabecera contiene un elemento cuyo texto es exactamente "Nailbot" y otro cuyo texto es exactamente "Asistente automático · demo"
    And en el fragmento de la sección NO aparece "en línea" ni ningún elemento cuyo texto sea exactamente "nl": el estado «en línea» y el avatar de letras se retiran (L1)
    And el avatar de la cabecera es un "<svg" con aria-hidden="true" y focusable="false", SIN atributo data-animacion (su marcado completo lo fija @s14)
    And el texto "Demo · Nailbot responde con opciones predefinidas: no es una persona ni usa inteligencia artificial." aparece EXACTAMENTE una vez, y no está dentro de ningún elemento con atributo data-de: la leyenda NO es una burbuja
    And el hilo es un elemento con role="log", aria-live="polite" y aria-label="Conversación con Nailbot", presente ya en el HTML horneado (HS-4 a)
    And en el HTML, con las cuatro anclas presentes ANTES de comparar, el orden es: "Asistente automático · demo" → la leyenda → role="log" → el botón "Uñas"
    And renderToString(<ChatNailbot />) NO contiene "<h1", "<h2", "<h3", "<h4", "<h5", "<h6", "<section", "<nav" ni "<a ": ni heading (el título lo pone quien lo monta), ni landmark (puertas 1 y 5), ni enlace al montar
    # En `#reserva` el único `<h2>` sigue siendo el de la sección (reserva_chat @s1, INTACTO); en el
    # panel, el `<h2>` «Reserva con Nailbot» lo pone F-24 FUERA de ChatNailbot. «Nailbot» se afirma
    # como texto EXACTO de un nodo (no como subcadena: el saludo también dice «Nailbot»).

  @s2
  Scenario Outline: La leyenda se ve SIEMPRE — al montar, a mitad, al terminar y tras reiniciar
    Given ChatNailbot montado en jsdom
    When llego al momento "<momento>" pulsando, en orden, "<pulsaciones>"
    Then el texto "Demo · Nailbot responde con opciones predefinidas: no es una persona ni usa inteligencia artificial." aparece EXACTAMENTE una vez
    And el elemento que lo contiene no tiene atributo data-de ni está dentro del elemento role="log"

    Examples:
      | momento        | pulsaciones                                              |
      | al montar      | (ninguna)                                                |
      | a mitad        | Uñas, Un sábado                                          |
      | al terminar    | Uñas, Un sábado, Prefiero no decirlo                     |
      | tras reiniciar | Uñas, Un sábado, Prefiero no decirlo, Reservar otra cita |

    # Cierra la D1 de reserva_chat. «Siempre» es la política de datos demo marcados: una leyenda que
    # desaparece al terminar deja el resumen sin marca justo cuando más parece una confirmación.

  # ---------------------------------------------------------------------------------------------
  # EL GUION: cuatro pasos de opciones cerradas; «Un sábado» se salta la franja con el DATO de F-02.
  # ---------------------------------------------------------------------------------------------

  @s3
  Scenario Outline: El guion — la pregunta de Nailbot y los botones de cada paso; «Un sábado» sustituye a «Este fin de semana» y el único campo es el nombre
    Given ChatNailbot montado en jsdom
    When respondo, en orden, "<respuestas previas>"
    Then la última burbuja es del bot (data-de="bot") y su texto es exactamente "<mensaje del bot>"
    And los botones del chat, por nombre accesible y en el orden del DOM, son exactamente "<botones>"
    And el campo "Tu nombre" <campo>
    And en ningún paso existe un botón ni una burbuja "Este fin de semana"
    And el chat no contiene ningún otro campo (input, textarea ni select) que "Tu nombre": nunca teléfono, nunca texto libre (L2)

    Examples:
      | paso     | respuestas previas                | mensaje del bot                                                                                 | botones                                        | campo                                  |
      | servicio | (ninguna: recién montado)         | ¡Hola! Soy Nailbot 💅, el asistente automático de Nails Lash Studio. ¿Qué te apetece reservar? | Uñas, Pestañas, Cejas                          | no existe                              |
      | día      | Uñas                              | ¡Me encanta! ¿Qué día te viene mejor?                                                           | Entre semana, Un sábado, Lo antes posible      | no existe                              |
      | franja   | Uñas, Entre semana                | ¿Prefieres alguna franja horaria?                                                               | Por la mañana, Por la tarde, Me es indiferente | no existe                              |
      | franja   | Pestañas, Lo antes posible        | ¿Prefieres alguna franja horaria?                                                               | Por la mañana, Por la tarde, Me es indiferente | no existe                              |
      | nombre   | Uñas, Entre semana, Por la mañana | ¡Casi lo tenemos! ¿A qué nombre hago la solicitud? Si lo prefieres, puedes saltártelo.          | Enviar, Prefiero no decirlo                    | existe y NO lleva el atributo maxlength |

    # Copy VERBATIM del brief §4, escrito A MANO. La 4.ª fila («Lo antes posible» también pregunta la
    # franja) mata al mutante que salta la franja para todo día distinto de «Entre semana». «Enviar» es
    # el `aria-label` del botón del glifo «→»; el placeholder «Escribe tu nombre…» y el `aria-label`
    # «Tu nombre» siguen siendo reserva_chat @s13. «Sin maxlength» (caso límite 6): un nombre largo se
    # interpola ENTERO, declarado, no se trunca (@s11). Que tras el nombre el chat TERMINA (no hay un
    # quinto paso) lo fija @s6. Sustituye a reserva_chat @s12 (RETIRADO).

  @s4
  Scenario: «Un sábado» NO pregunta la franja — Nailbot lo explica con el horario REAL de F-02 y pasa al nombre en el MISMO turno, sin inventar una respuesta de la persona
    Given ChatNailbot montado en jsdom con el dato real de F-02, tras pulsar "Uñas"
    When pulso el botón "Un sábado"
    Then el hilo tiene EXACTAMENTE seis burbujas, en este orden:
      | nº | data-de | texto                                                                                           |
      | 1  | bot     | ¡Hola! Soy Nailbot 💅, el asistente automático de Nails Lash Studio. ¿Qué te apetece reservar? |
      | 2  | usuario | Uñas                                                                                            |
      | 3  | bot     | ¡Me encanta! ¿Qué día te viene mejor?                                                           |
      | 4  | usuario | Un sábado                                                                                       |
      | 5  | bot     | Los sábados abrimos de 10:00 a 14:00, así que te busco hueco por la mañana.                     |
      | 6  | bot     | ¡Casi lo tenemos! ¿A qué nombre hago la solicitud? Si lo prefieres, puedes saltártelo.          |
    And NINGUNA burbuja de la persona dice "Por la mañana": la franja la impone el sábado y nadie la eligió (HS-2)
    And no existe ningún botón "Por la mañana", "Por la tarde" ni "Me es indiferente"; los botones son exactamente "Enviar" y "Prefiero no decirlo", y el campo "Tu nombre" está presente
    And (canario de acoplamiento declarado, HS-3 b, en chat-nailbot-logica.test.ts) el dato REAL `HORARIO.sabado` de "src/lib/site.ts" cierra exactamente a las "14:00"; si deja de hacerlo, el test falla con un mensaje que exige revisar la frase «así que te busco hueco por la mañana», que ya no saldría del dato
    # Seis burbujas por el camino del sábado, siete por el normal (HS-2): el conteo EXACTO mata al
    # mutante que pinta la franja impuesta como burbuja de la persona o que se come la pregunta del
    # nombre. El literal «10:00 a 14:00» se escribe A MANO aquí (y SOLO aquí y en los tests): en la
    # fuente está PROHIBIDO (@s12). El canario no es un valor esperado importado: es una PRECONDICIÓN
    # del copy. «así que… por la mañana» es verdad PORQUE el sábado cierra a las 14:00; si el dato
    # cambiara a '10:00-20:00', la frase se derivaría bien y mentiría igual (HS-3 b).

  @s5
  Scenario Outline: La regla del sábado es PURA y sale del DATO en la llamada — con un rango distinto del real, y con una guarda para lo que no es un rango HH:MM-HH:MM
    Given el estado del guion en el paso del día, con "Uñas" ya respondido, y la regla del sábado alimentada EN LA LLAMADA con el rango "<rango>", sin tocar "src/lib/site.ts"
    When responder recibe la entrada «elegir "Un sábado"»
    Then el primer mensaje nuevo del bot es exactamente "<primer mensaje nuevo>"
    And el segundo mensaje nuevo del bot es <segundo mensaje nuevo>
    And el estado siguiente está en el paso <paso siguiente>
    And ningún mensaje del estado contiene "abrimos de <rango>": ni el rango crudo con su guion, ni «abrimos de cerrado»

    Examples:
      | rango       | primer mensaje nuevo                                                         | segundo mensaje nuevo                                                                                     | paso siguiente                                                                   |
      | 10:00-14:00 | Los sábados abrimos de 10:00 a 14:00, así que te busco hueco por la mañana.  | exactamente "¡Casi lo tenemos! ¿A qué nombre hago la solicitud? Si lo prefieres, puedes saltártelo."      | «nombre», con la franja «Por la mañana» ya registrada (la que lee el resumen, @s6) |
      | 09:30-13:00 | Los sábados abrimos de 09:30 a 13:00, así que te busco hueco por la mañana.  | exactamente "¡Casi lo tenemos! ¿A qué nombre hago la solicitud? Si lo prefieres, puedes saltártelo."      | «nombre», con la franja «Por la mañana» ya registrada                            |
      | cerrado     | ¿Prefieres alguna franja horaria?                                            | inexistente: solo se añade uno                                                                            | «franja»: la regla NO se aplica y la franja se pregunta como otro día cualquiera |
      | 10-14       | ¿Prefieres alguna franja horaria?                                            | inexistente: solo se añade uno                                                                            | «franja»: la regla NO se aplica                                                  |

    # La 2.ª fila (distinta del dato real) mata al mutante que FIJA el valor; que dos llamadas en el
    # MISMO proceso den frases distintas prueba que se calcula en la llamada y no en la carga del
    # módulo. «cerrado» es el formato que ya usa `HORARIO.domingo` [V: site.ts:34]. Cómo viaja el rango
    # lo elige el tdd_craftsman SIN cambiar la firma `responder(estado, entrada) → estado` (p. ej.,
    # dentro del estado inicial, construido EN LA LLAMADA). OJO medido: `parsearFranjas` de F-10 NO
    # valida el formato ('10-14' produce `NaN`, horario.ts:48-66); si se reutiliza, la guarda
    # HH:MM-HH:MM hay que escribirla igual (HS-3 a: «si no encaja, una regex local mínima»).

  # ---------------------------------------------------------------------------------------------
  # EL FINAL: resumen honesto, mensaje exacto, aviso de capa 1 y foco que no se pierde.
  # ---------------------------------------------------------------------------------------------

  @s6
  Scenario Outline: Al terminar —con nombre o con «Prefiero no decirlo»— el resumen dice lo que de verdad pasa y el enlace lleva el mensaje exacto
    Given ChatNailbot montado en jsdom y recorrido por "<camino>"
    When <acción del nombre>
    Then el hilo tiene EXACTAMENTE <n> burbujas
    And la penúltima es de la persona (data-de="usuario") y su texto es exactamente "<burbuja de la persona>"
    And la última es del bot (data-de="bot") y su texto es exactamente "<resumen>"
    And hay EXACTAMENTE un enlace "Enviar la reserva por WhatsApp", sin atributo target; su href contiene "34625223366" y su texto tras "?text=", decodificado con decodeURIComponent, es exactamente "<mensaje>"
    And ya no existe el campo "Tu nombre" ni ningún botón de opción: el único botón del chat es "Reservar otra cita"
    And ni el hilo ni el mensaje decodificado contienen "undefined" ni dos espacios seguidos

    Examples:
      | caso                      | camino                                | acción del nombre                 | n | burbuja de la persona | resumen                                                                                                                                                  | mensaje                                                                                                                                   |
      | con nombre, por el sábado | Pestañas, Un sábado                   | escribo "Lucía" y pulso "Enviar"  | 8 | Lucía                 | ¡Gracias, Lucía! ✨ Tu solicitud: Pestañas · Un sábado · Por la mañana. Envíasela al salón por WhatsApp con el enlace de abajo y allí te confirmarán la hora exacta. | Hola, quiero reservar: Pestañas · Un sábado · Por la mañana. Me llamo Lucía y os escribo desde la web. ¿Podéis confirmarme la hora exacta? |
      | sin nombre                | Cejas, Lo antes posible, Por la tarde | pulso "Prefiero no decirlo"       | 9 | Prefiero no decirlo   | ¡Gracias! ✨ Tu solicitud: Cejas · Lo antes posible · Por la tarde. Envíasela al salón por WhatsApp con el enlace de abajo y allí te confirmarán la hora exacta.     | Hola, quiero reservar: Cejas · Lo antes posible · Por la tarde. Os escribo desde la web. ¿Podéis confirmarme la hora exacta?              |

    # Los resúmenes son el COPY CORREGIDO de HS-6 (manda sobre el brief §4: el control es un ENLACE,
    # no un botón); los mensajes, el brief §4 (con nombre, byte a byte el de hoy). La fila «por el
    # sábado» asevera la franja IMPUESTA en resumen y mensaje (caso límite 1). Los datos son distintos
    # de los de reserva_chat @s15/@s24 (Marta · Uñas · Entre semana · Por la mañana) a propósito: aquí
    # no se repite aquella prueba, se añaden dos casos nuevos. La burbuja «Prefiero no decirlo» es G1.
    # El «sin nombre» es CAMPO AUSENTE en `mensajeReserva` (reserva_chat @s23, fila nueva), nunca
    # «Me llamo undefined» ni «Me llamo  y».

  @s7
  Scenario: Al terminar, el aviso de capa 1 va JUSTO ENCIMA del enlace, sin ningún enlace dentro, y DESCRIBE al enlace — y antes de terminar no existe (L3, HS-1, HS-4 c)
    Given ChatNailbot montado en jsdom y recorrido por "Uñas", "Entre semana" y "Por la mañana"
    When pulso "Prefiero no decirlo"
    Then aparece EXACTAMENTE un elemento cuyo texto es exactamente "Al pulsar se abrirá WhatsApp con este mensaje y tú decides si lo envías. El salón lo usará solo para gestionar tu cita."
    And ese elemento es el hermano INMEDIATAMENTE anterior (previousElementSibling) del enlace "Enviar la reserva por WhatsApp"
    And el aviso no contiene ningún elemento <a> ni ningún atributo href: es provisional y no enlaza a ninguna ruta (la anti-404 de F-04 rompería el build)
    And la descripción accesible del enlace "Enviar la reserva por WhatsApp" es exactamente el texto del aviso: su aria-describedby apunta al id del aviso, generado con useId y nunca con un literal
    And el aviso no tiene atributo data-de ni está dentro del elemento role="log": no es una burbuja
    And ANTES de terminar —recién montado, tras "Uñas" y en el paso del nombre— ese texto NO existía en el documento (medido en el MISMO recorrido, patrón de reserva_chat @s24)
    # Literal del brief §4 (L3), aceptado como capa 1 PROVISIONAL por HS-1 (deuda A-23 en la
    # cabecera). El `aria-describedby` (HS-4 c) existe para que quien llega al enlace por el foco
    # (@s8 lo pone ahí) no se salte el aviso. Con dos instancias, sus ids no colisionan: @s10.

  @s8
  Scenario Outline: Tras cada acción de la persona el foco pasa al PRIMER control del paso nuevo — y al montar no se mueve (HS-4 b)
    Given ChatNailbot montado en jsdom y comprobado que, recién montado, el foco NO ha entrado en él (document.activeElement es el <body>: jamás se roba el foco al cargar la página)
    And el chat en el estado "<estado de partida>"
    When <acción>
    Then document.activeElement es <foco tras la acción>

    Examples:
      | estado de partida                                     | acción                             | foco tras la acción                          |
      | recién montado                                        | pulso "Uñas"                       | el botón "Entre semana"                      |
      | paso del día, tras "Uñas"                             | pulso "Lo antes posible"           | el botón "Por la mañana"                     |
      | paso del día, tras "Uñas"                             | pulso "Un sábado"                  | el campo "Tu nombre"                         |
      | paso de la franja, tras "Uñas" y "Entre semana"       | pulso "Me es indiferente"          | el campo "Tu nombre"                         |
      | paso del nombre, con "Marta" escrito en el campo      | pulso "Enviar"                     | el enlace "Enviar la reserva por WhatsApp"   |
      | paso del nombre                                       | pulso "Prefiero no decirlo"        | el enlace "Enviar la reserva por WhatsApp"   |
      | terminado                                             | pulso "Reservar otra cita"         | el botón "Uñas"                              |

    # El chat de hoy desmonta el chip pulsado y el foco cae al <body> (SC 2.4.3). «Nunca al montar»:
    # en `#reserva` robaría el foco al cargar la página. El orden del pie (campo → «Enviar» → «Prefiero
    # no decirlo»; aviso → enlace → «Reservar otra cita») es lo que hace que «el primero» sea el campo
    # y el enlace. F-24 (HS-12) se apoya en esta MISMA regla para el foco inicial del panel.

  @s9
  Scenario: «Reservar otra cita» tras el camino del sábado y sin nombre vuelve al estado inicial EXACTO
    Given ChatNailbot montado en jsdom y terminado por "Pestañas", "Un sábado" y "Prefiero no decirlo"
    When pulso el botón "Reservar otra cita"
    Then el hilo tiene EXACTAMENTE una burbuja, del bot, cuyo texto es exactamente "¡Hola! Soy Nailbot 💅, el asistente automático de Nails Lash Studio. ¿Qué te apetece reservar?"
    And los botones del chat son exactamente "Uñas", "Pestañas" y "Cejas"
    And no existe el campo "Tu nombre", ni el aviso "Al pulsar se abrirá WhatsApp…", ni el enlace "Enviar la reserva por WhatsApp", ni el botón "Reservar otra cita"
    And ninguna burbuja contiene "Un sábado", "Prefiero no decirlo", "Los sábados abrimos" ni "¡Gracias"
    # Es el camino que MÁS estado arrastra (franja impuesta + nombre ausente): si el reinicio olvidara
    # algo, la siguiente solicitud mezclaría datos de dos personas. El reinicio con nombre sigue siendo
    # reserva_chat @s17 (AJUSTADO). La igualdad EXACTA con el estado inicial se muerde por valor en @s11.

  @s10
  Scenario: Dos instancias en la misma página son INDEPENDIENTES y no comparten ningún id (L5)
    Given dos ChatNailbot montados a la vez en el mismo documento de jsdom (el papel de #reserva y el del panel del robot)
    When recorro la PRIMERA hasta el final por "Cejas", "Lo antes posible", "Por la tarde" y "Prefiero no decirlo", y DESPUÉS la SEGUNDA por "Uñas", "Entre semana", "Por la mañana" y el nombre "Marta" con "Enviar"
    Then mientras solo la primera avanzaba, la segunda seguía con una única burbuja (el saludo) y los botones "Uñas", "Pestañas" y "Cejas" (medido en el mismo recorrido, antes de tocarla)
    And la primera termina con el resumen exacto de la fila «sin nombre» de @s6 y la segunda con exactamente "¡Gracias, Marta! ✨ Tu solicitud: Uñas · Entre semana · Por la mañana. Envíasela al salón por WhatsApp con el enlace de abajo y allí te confirmarán la hora exacta."
    And cada instancia tiene EXACTAMENTE un enlace "Enviar la reserva por WhatsApp", y el de cada una, decodificado, lleva el mensaje de SUS datos, no los de la otra
    And en el documento ningún valor de atributo id aparece dos veces, y el aria-describedby del enlace de cada instancia apunta al aviso de ESA instancia (su hermano inmediatamente anterior)
    And ninguna de las dos instancias terminadas contiene "<h1>"…"<h6>", "<section>" ni "<nav>"
    # Un estado a nivel de módulo (o un id literal en el aviso) pasaría todas las pruebas de UNA
    # instancia y rompería aquí. Es exactamente lo que pasará en la home con el panel abierto (F-24).

  # ---------------------------------------------------------------------------------------------
  # EL CEREBRO PURO: la costura del servidor futuro, mordida por valor.
  # ---------------------------------------------------------------------------------------------

  @s11
  Scenario: responder es PURA —determinista, síncrona y sin mutar la entrada congelada— y sus reglas se muerden POR VALOR
    Given el estado inicial del guion y un estado a mitad (paso del día, con "Uñas" respondido), ambos congelados en profundidad con Object.freeze
    When se llama a responder con cada uno y la entrada «elegir "Entre semana"», dos veces con el mismo par
    Then las dos llamadas no lanzan y devuelven estados iguales en profundidad, que son objetos NUEVOS (distinta referencia que la entrada)
    And el estado de entrada queda igual en profundidad a una copia tomada antes de la llamada
    And el resultado no es una Promise: la costura es síncrona hoy, nada asíncrono (L4, HS-7)
    And dos construcciones seguidas del estado inicial son iguales en profundidad: es determinista, y por eso se hornea (reserva_chat @s9)
    And con la entrada «enviar el nombre» de valor "" o "   " (solo espacios), responder devuelve un estado igual en profundidad al de entrada: la regla de reserva_chat @s14, mordida aquí por valor
    And con la entrada «enviar el nombre» de valor una cadena de 300 caracteres "a", el resumen del estado siguiente la contiene ENTERA: no se trunca
    And con la entrada «reiniciar» desde el estado final del camino "Pestañas" · "Un sábado" · "Prefiero no decirlo", devuelve un estado igual en profundidad al estado inicial
    # Sin reloj, sin azar, sin red, sin storage, sin DOM (la guarda de bytes está en @s12). Con
    # módulos ES en modo estricto, escribir en un objeto congelado LANZA: «no lanza» prueba que no
    # muta. El borrador del campo es estado de UI y se queda en el componente; la validación
    # `trim() === ''` vive aquí, en la función pura, para que Stryker la muerda por valor.

  # ---------------------------------------------------------------------------------------------
  # BYTES: lo que ningún render ve (fuentes y SCSS). Ancla positiva SIEMPRE primero.
  # ---------------------------------------------------------------------------------------------

  @s12
  Scenario: Guardas de FUENTE — el href deriva de waHref, el copy vive en nailbot-demo.ts, nada sale del navegador y el horario no se escribe a mano (L6, L15)
    Given los bytes de "src/components/ChatNailbot.tsx", "src/components/chat-nailbot-logica.ts", "src/lib/demo/nailbot-demo.ts" y "src/components/NailbotArte.tsx"
    When se buscan en ellos los literales vigilados
    Then ChatNailbot.tsx SÍ contiene "export function ChatNailbot", "waHref(", "TELEFONO", "useId" y "nailbot-demo"; chat-nailbot-logica.ts SÍ contiene "export function responder"; nailbot-demo.ts SÍ contiene "Asistente automático · demo"; NailbotArte.tsx SÍ contiene "export function NailbotArte" (ANCLAS POSITIVAS: los ficheros se leyeron y no están vacíos)
    And ni ChatNailbot.tsx, ni chat-nailbot-logica.ts, ni nailbot-demo.ts contienen "625 22 33 66", "34625223366", "+34625223366", "wa.me", "api.whatsapp.com" ni "whatsapp.com": el número y el host viven SOLO en src/lib/site.ts
    And ni ChatNailbot.tsx ni chat-nailbot-logica.ts contienen "fetch(", "XMLHttpRequest", "window.location", "localStorage", "sessionStorage" ni "document.cookie" (extiende la guarda de reserva_chat @s22 al código movido)
    And ni nailbot-demo.ts, ni chat-nailbot-logica.ts, ni ChatNailbot.tsx contienen "10:00" ni "14:00": la frase del sábado sale de HORARIO.sabado (L6)
    And ni ChatNailbot.tsx ni chat-nailbot-logica.ts contienen "Asistente automático", "inteligencia artificial", "Al pulsar se abrirá WhatsApp" ni "¿Qué te apetece reservar?": el copy vive en nailbot-demo.ts
    And ChatNailbot.tsx NO contiene "dangerouslySetInnerHTML" (el nombre se interpola como texto: React escapa) y ni ChatNailbot.tsx ni NailbotArte.tsx contienen 'id="' (ningún id literal: dos instancias en la página)
    And ninguno de los cuatro contiene los literales de la lista negra de F-01: "600123456", "ph-woman", "IMAGEN TEMPORAL", "Plantilla de demostración", "hola@nailslashstudio.com" ni "Calle de la Belleza" (puerta 2: el guion viaja en el JS aunque el panel no se hornee)
    # NINGUNA de estas guardas veta `if (`, `?`, `&&` ni `||`: ChatNailbot.tsx, chat-nailbot-logica.ts
    # y NailbotArte.tsx están en `mutate`, y en el sandbox Stryker los lee INSTRUMENTADOS. Los
    # literales vetados aquí no los inyecta nunca. Los comentarios también son bytes: un docblock que
    # diga «no usa inteligencia artificial» en el .tsx pondría rojo el test (el copy va en nailbot-demo.ts).

  @s13
  Scenario: Las hojas del chat y del arte — los selectores mudados, los tres textos nuevos con pares YA vigilados, la paleta --nb-* fuera de _tokens.scss, y nada que se mueva ni se descargue (HS-5)
    Given los bytes de "src/components/chat-nailbot.module.scss", "src/components/nailbot-arte.module.scss" y "src/styles/_tokens.scss"
    When se leen sus bloques con cuerpoDelBloque
    Then chat-nailbot.module.scss SÍ declara ".chat", ".chatCabecera", ".subtitulo", ".leyenda", ".hilo", ".burbujaBot", ".burbujaUsuario", ".opciones", ".chipChat", ".entrada", ".aviso" y ".reiniciar" (ANCLA POSITIVA)
    And los bloques ".subtitulo", ".leyenda" y ".aviso" declaran su "color" con un "var(--…)" y SIN ningún hex, y el par (ese token, el fondo real sobre el que se pinta) es una fila EXISTENTE de MATRIZ_DE_USO de src/lib/puerta-contraste.ts: el test escribe A MANO el par elegido para cada bloque y comprueba que está en la matriz
    And chat-nailbot.module.scss NO declara ".enLinea", NO usa "var(--estado-en-linea)" y NO contiene "@keyframes" ni "animation": el chat y su avatar no se mueven nunca
    And nailbot-arte.module.scss SÍ declara "--nb-rojo" (ANCLA POSITIVA: la paleta decorativa vive aquí)
    And _tokens.scss SÍ contiene "--accent-dark" (ANCLA POSITIVA) y NO contiene "--nb-": la paleta decorativa del SVG oculto no entra en la puerta de contraste
    And ni chat-nailbot.module.scss ni nailbot-arte.module.scss contienen "url(" ni "@font-face" (puerta 4, F-05)
    # La puerta 3 es CIEGA a los .module.scss (`05` §1): un color inventado para el subtítulo, la
    # leyenda o el aviso pasaría el build sin que nadie lo mirase; por eso se fija aquí por bytes
    # contra un par que la matriz YA vigila (HS-5 b), y MATRIZ_DE_USO no gana filas (MINIMO_DE_PARES
    # sigue en 18: reserva_chat @s21). Los colores mudados del chat (la burbuja de la persona, el
    # botón de enviar, el enlace `demo-btn--wa`) se mudan tal cual: A-25 resuelto — «nada de verde»
    # es del LANZADOR de F-24, y el chat es IDÉNTICO en las dos instancias. Que nailbot-arte.module.scss
    # no se mueva fuera de `no-preference` ni sin `[data-animacion]` lo fija F-24 (nailbot_flotante @s12).

  @s14
  Scenario: NailbotArte, estático — el SVG del prototipo, inline y decorativo, sin ids ni subrecursos, en su pose FINAL (uñas pintadas) y sin atributo de animación
    Given NailbotArte renderizado con renderToString(<NailbotArte />), tal como lo usa la cabecera del chat
    When se inspecciona su marcado
    Then hay EXACTAMENTE un "<svg", raíz del marcado, con viewBox="0 0 120 120", aria-hidden="true" y focusable="false"
    And el marcado NO contiene " id=", "<defs", "<title", "<desc", "<text", "<image", "<use", "href=" ni "style=": ni ids que dupliquen (el arte sale varias veces en la página, L9), ni subrecursos, ni texto
    And el marcado NO contiene "data-animacion": sin atributo, el arte no se mueve jamás (F-24 animará SOLO la instancia del lanzador)
    And hay EXACTAMENTE cuatro trazos con fill="var(--nb-una-base)" y, para cada uno, un trazo con el MISMO atributo d y fill="var(--nb-rojo)", ninguno con atributo opacity: la pose base es la FINAL, con las cuatro uñas pintadas (I-4)
    And todo atributo fill o stroke del SVG vale "none", "#fff" o un "var(--…)" de la paleta --nb-* o de los tokens ya existentes --accent y --accent-2: ningún color inventado
    # HS-15: del prototipo (`nailbot-prototipo.html:147-231`) se portan SOLO la geometría (viewBox y
    # trazados) y los colores decorativos; ni su copy, ni sus tamaños, ni su CSS de estado. El
    # encuadre del avatar a la cara (L9) es CSS y visual: EN VIVO. «Pincel en el bote» es la pose
    # base del prototipo sin transformar: EN VIVO.

  # =============================================================================================
  # VERIFICACIÓN EN VIVO DEL LEAD — NO son escenarios ni tests verdes; se anotan en `progress/`
  # =============================================================================================
  #  · Lector de pantalla (NVDA + Chrome y VoiceOver iOS) recorriendo el chat en `#reserva` y en el
  #    panel: qué anuncia el `role="log"` «Conversación con Nailbot» en cada turno, que la leyenda se
  #    lee, que el aviso se lee como descripción del enlace final y cómo se nombran «💅» y «✨» (HS-4).
  #  · Solo teclado: el foco salta al primer control de cada paso nuevo (HS-4 b), es VISIBLE en chips,
  #    campo, «Enviar», enlace y reinicio, y NO entra en el chat al cargar la página.
  #  · 320 px de ancho: cabecera, leyenda, burbujas largas (un nombre de 300 caracteres) y aviso sin
  #    desbordar.
  #  · El enlace final abierto en Android, iOS y WhatsApp Web, CON y SIN nombre: el texto llega exacto
  #    (el host `wa.me` no lo cubre ningún test por A-10: esta es su única verificación).
  #  · Contraste real del subtítulo, la leyenda y el aviso contra sus fondos pintados (HS-5 b): el par
  #    fijado por bytes en @s13 tiene que ser el que de verdad se ve.
  #  · El avatar de la cabecera encuadrado a la cara y quieto; el arte a tamaño avatar, legible.
  #  · `pnpm build` (lo corre el lead): cinco puertas en verde, un solo `<h1>`, MINIMO_DE_PARES en 18
  #    y ningún literal de la lista negra en el bundle JS.
  #  · A-23: si se aprueba el despliegue a Pages, queda anotado que la capa 1 es provisional.
