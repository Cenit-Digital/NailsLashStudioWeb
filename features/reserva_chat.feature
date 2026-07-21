# =============================================================================================
# CONTRATO — sección #reserva: columna izquierda RESTAURADA al diseño + chat guiado que SE MANTIENE
# y que ahora SÍ entrega lo contestado por WhatsApp.
# v2: REESCRITO ENTERO, aprobado por la puerta humana (@s1-@s21 implementados y en HEAD).
# v3 (2026-07-21): AMPLIACIÓN puntual con puerta humana YA ABIERTA (ver bloque "ACTUALIZACIÓN v3"
# más abajo) — `@s22` acotado + `@s23`/`@s24` nuevos. El resto de v2 NO se reabre.
#
# 🔴 POR QUÉ SE REESCRIBE: LA v1 MENTÍA. Contrastado contra `src/components/Reserva.tsx` (leído hoy):
#   · v1 @s1 decía que las opciones eran «Uñas», «Facial», «Depilación» y «Pestañas». FALSO por
#     partida doble: hoy son TRES («Uñas», «Pestañas», «Cejas», Reserva.tsx:40) y ESTE SALÓN NO
#     OFRECE FACIAL NI DEPILACIÓN (mismo deslinde que `equipo_reservas.feature` @s5/@s6 y que el
#     docblock de `src/lib/demo/catalogo-demo.ts`). Un test escrito sobre v1 nace ROJO.
#   · v1 @s1 escribía el saludo con el nombre en MINÚSCULAS («nails lash studio»). Hoy va con
#     capitales («Nails Lash Studio», Reserva.tsx:40), como el NOMBRE canónico de F-02.
#   · v1 @s6 daba un resumen final con «…por WhatsApp EN UNOS MINUTOS…». Ese «en unos minutos» NO
#     EXISTE en el código (Reserva.tsx:103) y además prometía un tiempo de respuesta que nadie ha
#     verificado con el salón.
#   · v1 NO cubría NADA de la columna izquierda, que es justo lo que esta sesión cambia.
#
# =============================================================================================
# DE DÓNDE SALE EL COPY (fuente de verdad del diseño)
# =============================================================================================
# El prototipo aprobado `Opcion-1-Rosa.dc.html` (extraído de `NailsLashStudioDiseño.zip`), sección
# `#reserva`, LÍNEAS 248-256. El copy de la columna izquierda se toma VERBATIM de ahí:
#     eyebrow  → «Reserva rápida»                       (L251)
#     h2       → «¿Prefieres reservar por chat?»        (L252)
#     párrafo  → «Elige servicio, día y franja horaria con nuestro asistente y te confirmamos la
#                 hora exacta por WhatsApp.»            (L253)
#     enlaces  → «WhatsApp» (verde) y «Llamar al estudio»  (L255-256)
# En el diseño esa columna NO TIENE CALENDARIO: es SOLO ese texto y esos dos botones. El calendario
# del prototipo vive DENTRO de las tarjetas de `#equipo`, y ahí YA ESTÁ IMPLEMENTADO
# (`features/equipo_reservas.feature`, `src/components/Equipo.tsx`). La columna derecha (el widget
# de chat, L259-287 del prototipo) SE MANTIENE tal y como funciona hoy.
#
# 🔴 DEL DISEÑO NO SE COPIA EL TELÉFONO. El prototipo trae el número FALSO `34600123456` /
# `+34600123456` (L255-256), que además es literal PROHIBIDO por la puerta de placeholders (F-01,
# «600123456»). Los dos href se DERIVAN de la fuente única F-02 (`src/lib/site.ts`): `waHref` y
# `telHref` sobre `TELEFONO.legible`. Copiarlo mataría el build.
#
# =============================================================================================
# 🔴 ACTUALIZACIÓN v3 (2026-07-21) — LA FRONTERA CON F-13 SE MUEVE: EL CHAT SÍ COMPONE LA SOLICITUD
# =============================================================================================
# v2 (más abajo) declaraba esta frontera "SIGUE INTACTA": el chat no componía nada, solo prometía
# "te confirmamos por WhatsApp" sin poder cumplirlo por sí mismo. El craftsman_lead preguntó a
# Pablo explícitamente (herramienta `AskUserQuestion`) qué debía pasar al terminar el chat, y Pablo
# eligió, literalmente:
#   «Que acabe abriendo WhatsApp — Al terminar las 4 preguntas, un botón abre WhatsApp con la
#   reserva ya escrita (servicio, día, franja y nombre) para que la clienta la envíe. Así la frase
#   deja de ser mentira y el chat funciona de verdad, sin backend.»
# ESTE CONTRATO SE REESCRIBE (`@s22` acotado + `@s23`/`@s24` nuevos) para reflejar esa decisión: la
# puerta humana YA ESTÁ ABIERTA para esta pieza concreta. NO reabre el resto de v2 (columna
# izquierda, copy verbatim, cinco puertas, guion fijo de 4 pasos): eso sigue exactamente igual.
#
# =============================================================================================
# FRONTERA CON F-13 (`solicitud_whatsapp`, id 13, `pending`) — SE ESTRECHA, NO DESAPARECE
# =============================================================================================
# Esta sección SÍ compone, desde este contrato en adelante, una solicitud: al terminar el guion de
# 4 pasos aparece un enlace ("Enviar la reserva por WhatsApp") cuyo texto lleva servicio, día,
# franja y nombre interpolados por la función PURA `mensajeReserva` (@s23). Sigue siendo "sin
# backend": el enlace SOLO abre WhatsApp con el texto puesto, y es LA CLIENTA quien pulsa enviar
# (@s24) — nadie en el estudio recibe nada hasta que ella lo hace. El enlace FIJO de la columna
# izquierda ("WhatsApp", @s2/@s3) NO cambia: sigue con `RESERVA_WHATSAPP_TEXTO`, un texto genérico
# que invita a escribir SIN pasar por el chat, para quien prefiere no rellenar el guion. Lo que
# SIGUE siendo F-13, íntegro: la disponibilidad REAL por profesional y franja
# (`franjasDisponibles`, que hoy el chat NO consulta: puede ofrecer "Por la tarde" un día que el
# salón cierra), la asignación de profesional, y la CONFIRMACIÓN real (de servidor, no un mensaje
# que la clienta puede no llegar a enviar). El chat sigue sin enviar NADA por sí mismo: no hay
# `fetch`, no hay navegación automática al terminar el guion (@s22).
#
# =============================================================================================
# FUENTES LEÍDAS (no inventadas)
# =============================================================================================
#  · `src/components/Reserva.tsx` COMPLETO — el guion de 4 pasos (L39-44), el resumen (L103), el
#    `trim()` que descarta el envío vacío (L111-112), el `Enter` (L245-250), el reinicio (L117-123),
#    el scroll del hilo (L85-91) y la cabecera «Nails Lash Studio» / «en línea» (L211-217).
#  · `src/lib/site.ts:100-108` — `telHref` y `waHref`: E.164, host SIN el «+», `?text=` con
#    `encodeURIComponent`, y `texto === '' ? enlace : …`. `site.ts:66-73`: el HOST está bajo
#    `Stryker disable` y el contrato de F-02 (A-10) ORDENA NO ASEVERARLO. ESTE contrato hereda esa
#    prohibición (@s3).
#  · `src/lib/demo/contacto-demo.ts` — el PRECEDENTE de dónde vive un texto prellenado (constante en
#    `src/lib/demo/`, nunca en el `.tsx`) y de su docblock honesto.
#  · `features/boton_whatsapp_flotante.feature` @s1/@s2 — el patrón de «href derivado + guarda de
#    FUENTE», que este contrato replica para los dos enlaces (@s3, @s4, @s5).
#  · `src/components/reserva.module.scss` — los bloques que hoy visten el mini-calendario y que se
#    quedan MUERTOS al restaurar el diseño (@s7).
#  · `src/components/contacto-estilos.test.ts` — el patrón de aseverar CSS por BYTES (`readFileSync`
#    + `cuerpoDelBloque`), NUNCA con `toHaveClass` (`vitest.config.ts` tiene `css:false`).
#  · `src/components/equipo-logica.ts` — el patrón F-09 de lógica pura hermana del `.tsx` (@s19).
#  · `Opcion-1-Rosa.dc.html` L248-287 — el diseño, citado arriba línea a línea.
#
# =============================================================================================
# 🔴 LAS 5 PUERTAS DE `pnpm build` QUE ESTA SECCIÓN TOCA
# =============================================================================================
#  1. CASCARÓN — la sección sigue siendo `<section aria-labelledby="reserva-titulo">` con UN `<h2
#     id="reserva-titulo">` REAL. Cambia SOLO EL TEXTO del h2, NUNCA su id. Ningún `<h1>` nuevo.
#  2. PLACEHOLDERS — prohibido el `600123456` del prototipo (y `ph-woman`, y los demás literales).
#  3. CONTRASTE — los dos enlaces reutilizan utilidades GLOBALES que YA existen (`demo-btn--wa`,
#     `demo-btn--ghost`, `src/styles/_demo.scss:153-173`). NO se estrena ninguna pareja de colores,
#     así que `MATRIZ_DE_USO` no gana filas y `MINIMO_DE_PARES` sigue valiendo EXACTAMENTE 18.
#  4. TERCEROS — cero subrecursos externos: ni `<img>`, ni `url(`, ni `@font-face` nuevos.
#  5. ANCLAS — 🔴 EL ID `reserva-titulo` NO SE TOCA. Hoy hay SIETE ids de sección y SIETE enlaces de
#     nav, y la puerta exige IGUALDAD DE CONJUNTOS. Renombrar el id (o quitarlo) MATA EL BUILD, y
#     además rompería los CTA de `Catalogo.tsx:46`, `Ofertas.tsx:33`, `PruebaColor.tsx:63`,
#     `home.tsx:94` y `MenuNavegacion.tsx:53,62`, que apuntan a `#reserva-titulo`.
#
# =============================================================================================
# 🔴 DÓNDE MUERDE LA MUTACIÓN (umbral 1.0) — y la trampa que HOY haría imposible cerrar
# =============================================================================================
#  · `src/components/Reserva.tsx` y el NUEVO `src/components/reserva-logica.ts` se AÑADEN a `mutate`
#    en `stryker.config.json` (hoy no están). Sin eso, la mutación de esta feature es 0% falso.
#  · 🔴 TRAMPA MEDIDA, Y ES BLOQUEANTE: `Reserva.tsx:222` tiene HOY
#        className={m.deBot ? estilos.burbujaBot : estilos.burbujaUsuario}
#    Con `css:false` (vitest.config.ts) las DOS ramas valen `undefined`, así que los mutantes de ese
#    ternario producen EXACTAMENTE EL MISMO DOM → SOBREVIVEN, y la feature NUNCA cerraría al 100%.
#    Es la regla anti-clase-CSS del repo, ya medida en `cabecera.test.tsx` @s15 (5 mutantes, 5
#    supervivientes). LA REPARACIÓN ES @s19: quién habla pasa a un ATRIBUTO CONSULTABLE
#    (`data-de="bot"|"usuario"`) y la elección de estilo la resuelve una función PURA de
#    `reserva-logica.ts` que devuelve una CLAVE («burbujaBot» / «burbujaUsuario») testeable POR
#    VALOR. El `.tsx` se queda sin ternario de clases.
#  · El resto del núcleo mutable, extraído a `reserva-logica.ts` (patrón F-09) para que Stryker lo
#    muerda por valor y para que el módulo del componente exporte SOLO el componente (si no, ESLint
#    `react-refresh` escupe warnings y el listón es 0 warnings):
#      (a) el avance del guion y su condición de fin `siguiente < FLUJO_CHAT.length` → @s12, @s15.
#      (b) la composición del resumen (interpolación de los 4 valores) → @s15.
#      (c) el descarte del envío vacío `borrador.trim() === ''` → @s14.
#      (d) la clave de burbuja → @s19.
#    La tecla `Enter` (`e.key === 'Enter'`) se queda en el `.tsx` y la muerde @s16 por sus DOS lados
#    (Enter envía / otra tecla NO envía).
#  · NO-MUTABLE, declarado: todo el SCSS (Stryker no ve SCSS) → @s7 lo asevera por BYTES.
#
# =============================================================================================
# ANTI-TAUTOLOGÍA (regla dura del arnés)
# =============================================================================================
# TODO esperado se escribe A MANO en el test: los 4 mensajes del bot, las 9 opciones, el resumen
# completo, «34625223366», «tel:+34625223366», la cadena urlencoded, los placeholders y los aria-label.
# ❌ PROHIBIDO importar `TELEFONO`, `waHref`, `telHref`, `FLUJO_CHAT` ni la constante del texto demo
# COMO VALOR ESPERADO, y PROHIBIDO re-ejecutar `waHref(...)` dentro del test para compararlo con su
# propio resultado (precedente WebEmpresa: el doble atado al SÍMBOLO fue el primer superviviente).
# ❌ PROHIBIDO ADEMÁS: aseverar el HOST de WhatsApp (A-10) · aseverar por clase CSS o `toHaveClass` ·
# meter estado en un `className` condicional · hornear el número o el host en el `.tsx` · emitir
# «Facial» o «Depilación» · tocar `#equipo` (su calendario ya está entregado) · tocar la galería
# «Nuestros trabajos» (decisión de Pablo: se queda donde está) · cambiar el id `reserva-titulo`.
# ❌ TAMBIÉN PROHIBIDO (v3, @s23/@s24) importar `mensajeReserva` como valor esperado o reejecutarla
# para comparar con su propio resultado: el mensaje completo se escribe A MANO. Por ser una frase
# más larga que el texto FIJO de @s3, @s24 decodifica el `href` con `decodeURIComponent` (el inverso
# NATIVO, que ningún código de producción llama) y compara el resultado con el literal escrito a
# mano — evita transcribir a mano un «%C3%B1»/«%C2%B7» propenso a error sin reintroducir la
# tautología (production solo llama a `encodeURIComponent`, nunca a su inverso).
#
# =============================================================================================
# ARTEFACTOS QUE ESTE CONTRATO TOCA (nombres fijados aquí para que el tdd_craftsman no elija)
# =============================================================================================
#   src/components/Reserva.tsx                 (MODIFICADO: fuera el mini-calendario, copy del diseño)
#   src/components/reserva-logica.ts           (guion, avance, resumen, clave de burbuja y, desde v3, mensajeReserva PUROS)
#   src/components/reserva.module.scss         (MODIFICADO: mueren los bloques del calendario)
#   src/components/reserva.test.tsx            (NUEVO: SSR + árbol de accesibilidad + interacción)
#   src/components/reserva-estilos.test.ts     (NUEVO: BYTES del .module.scss)
#   src/lib/demo/reserva-demo.ts               (NUEVO: el texto DEMO prellenado del enlace)
#   stryker.config.json                        (dos líneas: Reserva.tsx + reserva-logica.ts en mutate)
#
# =============================================================================================
# TRAZA
# =============================================================================================
#   copy verbatim del diseño (L248-256)          → @s1, @s2
#   href derivados de F-02, número NO hardcodeado → @s3, @s4, @s5
#   NO HAY mini-calendario (la regresión a impedir)→ @s6, @s7
#   el chat sigue funcionando al 100%             → @s8..@s20
#   las 5 puertas siguen verdes                   → @s21
#   frontera con F-13 (disponibilidad/confirmación real siguen siendo F-13) → @s22
#   mensajeReserva compone servicio+día+franja+nombre, función PURA         → @s23
#   el enlace "Enviar la reserva por WhatsApp" aparece SOLO al terminar,
#   antes de "Reservar otra cita", con href derivado de F-02               → @s24
# =============================================================================================

Feature: Reserva rápida — la columna izquierda vuelve al diseño (texto + WhatsApp + llamar, SIN calendario) y el chat guiado de la derecha sigue funcionando igual, y ahora SÍ entrega lo contestado
  Como visitante quiero, en la sección de reserva, una invitación clara a escribir por WhatsApp o a
  llamar al estudio, y un asistente de chat que me pregunte servicio, día, franja y nombre en cuatro
  pasos y que, al terminar, me ofrezca un enlace con la reserva ya redactada para enviarla yo misma
  por WhatsApp; y como responsable del proyecto quiero que los enlaces deriven del teléfono único de
  F-02, que la columna izquierda NO vuelva a llenarse de un mini-calendario que el diseño no tiene y
  que sobrevive en `#equipo`, y que la sección siga pasando las cinco puertas del build.

  # ---------------------------------------------------------------------------
  # COLUMNA IZQUIERDA — el copy VERBATIM del prototipo Opción-1-Rosa (L248-256).
  # ---------------------------------------------------------------------------

  @s1
  Scenario: La columna izquierda hornea el eyebrow, el h2 con su id intacto y el párrafo del diseño
    Given la sección de reserva renderizada por SSR, sin ejecutar JavaScript
    When se leen los textos de su columna izquierda en el HTML horneado
    Then existe EXACTAMENTE UNA "<section>" con aria-labelledby="reserva-titulo"
    And existe EXACTAMENTE UN "<h2>" con id="reserva-titulo" y su texto es exactamente "¿Prefieres reservar por chat?"
    And sobre ese h2 se muestra el eyebrow con el texto exactamente "Reserva rápida"
    And bajo ese h2 se muestra un párrafo con el texto exactamente "Elige servicio, día y franja horaria con nuestro asistente y te confirmamos la hora exacta por WhatsApp."
    And la sección NO aporta ningún "<h1>": la home sigue teniendo exactamente uno (el del hero)
    And NO aparece el copy anterior "Pide tu cita en un momento" ni "Elige servicio, día y franja, y te llevamos a WhatsApp con el mensaje listo."
    # Los cuatro literales son VERBATIM del prototipo (L251-253) y se escriben A MANO en el test.
    # 🔴 EL id `reserva-titulo` NO SE TOCA (puerta 5: igualdad de conjuntos nav↔secciones, y cinco
    # CTA de la página apuntan a él). Cambia el TEXTO del h2, jamás su id. Se asevera sobre
    # `renderToString(<Reserva />)`, no con `screen`: es contenido estático horneado por el SSG.

  @s2
  Scenario: La columna izquierda ofrece exactamente DOS enlaces, en el orden del diseño
    Given la sección de reserva renderizada
    When se consulta el árbol de accesibilidad de la sección por ROL "link"
    Then hay EXACTAMENTE dos elementos de rol "link" en toda la sección
    And el primero tiene como nombre accesible exactamente "WhatsApp"
    And el segundo tiene como nombre accesible exactamente "Llamar al estudio"
    And el texto VISIBLE de cada uno coincide con su nombre accesible (SC 2.5.3 «Label in Name»)
    And ninguno de los dos abre pestaña nueva: no llevan target="_blank" (coherencia con el CTA de #contacto y con el botón flotante)
    # Verbatim del diseño (L255-256), en su orden: primero WhatsApp (verde), luego llamar. «EXACTAMENTE
    # dos» es lo que mata el mutante que resucita un tercer botón («Reservar por WhatsApp» del
    # calendario). El chat de la derecha no aporta ningún enlace, así que el conteo es de la sección
    # entera. Se consulta por ROL + NOMBRE ACCESIBLE, nunca por clase CSS.

  @s3
  Scenario: El href de WhatsApp DERIVA de la fuente única F-02 y lleva el texto demo urlencoded — sin aseverar el host
    Given el HTML CRUDO prerenderizado de la ruta "/" y la sección "#reserva-titulo" extraída de él
    When se lee el atributo href del enlace cuyo nombre accesible es "WhatsApp", sin ejecutar JavaScript
    Then el href contiene la subcadena "34625223366" (el E.164 SIN el "+", tal y como lo emite waHref)
    And el href contiene la subcadena "?text=Hola%2C%20quiero%20reservar%20por%20chat%20en%20Nails%20Lash%20Studio."
    And el href NO contiene ningún espacio en crudo ni la coma sin codificar: el texto viaja urlencoded
    And el href NO contiene "625 22 33 66" (el formato legible NO viaja en el enlace)
    And el href NO contiene "600123456": el número FALSO del prototipo (L255) no se copia jamás
    And ningún test de esta feature asevera el HOST del enlace ("wa.me" ni "api.whatsapp.com"): queda fuera del contrato por A-10 (F-02) y se verifica A MANO en Android, iOS y WhatsApp Web
    # El literal urlencoded se escribe A MANO; JAMÁS se compara contra `waHref(TELEFONO.legible, TEXTO)`
    # re-ejecutado (el test pasaría aunque waHref emitiera basura). El «600123456» es además literal
    # PROHIBIDO por la puerta 2: esta negativa es la primera línea de defensa antes del build.

  @s4
  Scenario: El .tsx NO hornea ni el número, ni el host, ni el texto demo — guarda a nivel de FUENTE
    Given los bytes de "src/components/Reserva.tsx" leídos como texto
    When se buscan en esos bytes los literales del teléfono, del host y del mensaje
    Then el .tsx SÍ contiene "export function Reserva", SÍ contiene "waHref(", SÍ contiene "telHref(" y SÍ importa "TELEFONO" desde "../lib/site" (ANCLA POSITIVA: prueba de que el fichero se leyó y NO está vacío)
    And el .tsx NO contiene "625 22 33 66", ni "34625223366", ni "+34625223366", ni "600123456"
    And el .tsx NO contiene "wa.me" ni "api.whatsapp.com" ni "whatsapp.com": el host vive SOLO en HOST_WHATSAPP de src/lib/site.ts
    And el .tsx NO contiene el texto demo literal "Hola, quiero reservar por chat en Nails Lash Studio.": ese texto vive en src/lib/demo/reserva-demo.ts
    # 🔴 EL AGUJERO QUE @s3 NO MUERDE: un href DERIVADO y uno HARDCODEADO producen BYTES IDÉNTICOS en
    # dist/. Solo una guarda de FUENTE obliga a derivar. Mismo patrón que @s2 de
    # `boton_whatsapp_flotante.feature` y @s15 de `contacto.feature`. El ANCLA POSITIVA VA PRIMERO:
    # sin ella, un fichero vacío o mal ruteado pasaría las cuatro negativas por VACUIDAD.

  @s5
  Scenario: El href de llamar DERIVA de telHref y normaliza a E.164
    Given el HTML CRUDO prerenderizado de la ruta "/" y la sección "#reserva-titulo" extraída de él
    When se lee el atributo href del enlace cuyo nombre accesible es "Llamar al estudio"
    Then el href es exactamente "tel:+34625223366"
    And el href NO es "tel:+34600123456" (el del prototipo) ni contiene espacios ni guiones
    And la sección SÍ contiene el h2 "¿Prefieres reservar por chat?" (ANCLA POSITIVA: la extracción del fragmento NO devolvió la cadena vacía)
    # Alternativa accesible al canal WhatsApp (F-12, RD 193/2023 art. 14.1): quien no usa WhatsApp
    # puede llamar. El literal «tel:+34625223366» se escribe A MANO, no se recompone con telHref.

  # ---------------------------------------------------------------------------
  # LA REGRESIÓN QUE ESTE CONTRATO EXISTE PARA IMPEDIR: el mini-calendario NO vuelve.
  # ---------------------------------------------------------------------------

  @s6
  Scenario: En la columna izquierda YA NO HAY mini-calendario — ni rótulos, ni chips, ni "Cargando días…"
    Given la sección de reserva renderizada en jsdom y CON LOS EFECTOS YA EJECUTADOS (hidratada)
    When se inspecciona la columna izquierda de la sección
    Then la sección SÍ muestra el h2 "¿Prefieres reservar por chat?" y sus dos enlaces (ANCLA POSITIVA: la sección se renderizó y no está vacía)
    And en TODA la sección hay CERO elementos con el atributo aria-pressed (hoy hay quince: tres de servicio, seis de día y seis de hora)
    And no existe ningún texto exactamente igual a "Servicio", ni a "Día", ni a "Hora" como rótulo de paso
    And no aparece el texto "Cargando días…" ni ningún otro aviso de carga
    And no existe ningún botón cuyo nombre accesible sea "10:00", "11:30", "13:00", "16:00", "17:30" ni "19:00"
    And no aparece el texto "Elige servicio, día y hora" ni ningún enlace llamado "Reservar por WhatsApp"
    And los bytes de "src/components/Reserva.tsx" NO contienen "Cargando días", ni "DOW", ni "HORAS", ni "diaIdx", ni "horaIdx": el código del calendario se BORRA, no se comenta ni se oculta
    # 🔴 EL ESCENARIO CENTRAL DE ESTA SESIÓN, y el que más fácil sería escribir MAL: si se aseverara
    # sobre el HTML HORNEADO (SSR) pasaría VACUAMENTE, porque HOY los días se calculan en `useEffect`
    # (Reserva.tsx:57-67) y el prerender NO hornea ni un chip de día. Hay que aseverarlo TRAS HIDRATAR,
    # que es el único estado en el que el calendario existe de verdad. Por eso el `Given` lo dice.
    # El calendario NO desaparece del producto: vive en las tarjetas de `#equipo`
    # (`features/equipo_reservas.feature` @s9-@s16), que es donde el diseño lo pone.
    # El último `Then` (bytes del .tsx) impide el «lo dejo por si acaso»: código muerto que un
    # refactor futuro reactiva sin querer, y que Stryker contaría como no cubierto.

  @s7
  Scenario: La hoja de estilos pierde los bloques que solo vestían al calendario y conserva los vivos
    Given los bytes de "src/components/reserva.module.scss"
    When se buscan en ellos los selectores de la hoja
    Then la hoja SÍ declara ".rejilla", ".acciones", ".chat", ".chatCabecera", ".hilo", ".chipChat", ".entrada" y ".reiniciar" (ANCLA POSITIVA: la hoja se leyó, NO está vacía y el chat sigue vestido)
    And la hoja NO declara ".paso", ni ".pasoTitulo", ni ".dia", ni ".diaActivo", ni ".diaDow", ni ".diaNum", ni ".cargando", ni ".chip", ni ".chipActivo", ni ".deshabilitado"
    And la hoja NO contiene "url(" ni "@font-face": no estrena ningún subrecurso (puerta 4)
    # CSS MUERTO = invitación a resucitar el calendario. `.opciones` SE CONSERVA: lo sigue usando la
    # botonera del chat (Reserva.tsx:230). `.chipChat` es del chat y NO es `.chip`. NO-MUTABLE por
    # declaración (Stryker no ve SCSS): lo aseveran estos BYTES, patrón `contacto-estilos.test.ts`.
    # PROHIBIDO `toHaveClass` (css:false → `estilos.x` es `undefined` en test).

  # ---------------------------------------------------------------------------
  # COLUMNA DERECHA — EL CHAT. Se mantiene y debe seguir funcionando al 100%.
  # Guion FIJO de 4 pasos: no es un chatbot con IA, ninguna respuesta del bot depende del texto
  # libre salvo el nombre, que solo se interpola en el resumen final.
  # ---------------------------------------------------------------------------

  @s8
  Scenario: La cabecera del chat identifica al estudio con el nombre canónico y su estado
    Given la sección de reserva renderizada
    When se lee la cabecera del widget de chat
    Then muestra el texto exactamente "Nails Lash Studio", con sus capitales (NO "nails lash studio")
    And muestra bajo él el texto exactamente "en línea"
    And el avatar con las letras "nl" es decorativo: lleva aria-hidden="true" y no aporta nada al nombre accesible
    # Copy del diseño (L262), CORREGIDO al nombre canónico de F-02 (`NOMBRE = 'Nails Lash Studio'`):
    # el prototipo lo escribía en minúsculas. El color de «en línea» ya lo fija F-03 con el token
    # `--estado-en-linea` (#186237, AA). El literal se escribe A MANO, jamás importando `NOMBRE`.

  @s9
  Scenario: El chat viaja HORNEADO: sin ejecutar JavaScript ya se ve el primer mensaje y sus tres opciones
    Given la sección de reserva renderizada por SSR, sin ejecutar JavaScript ni hidratar
    When se inspecciona el hilo del chat en el HTML horneado
    Then el hilo contiene EXACTAMENTE UNA burbuja, y su texto es exactamente "¡Hola! Soy el asistente de Nails Lash Studio ✨ ¿Qué te gustaría reservar?"
    And se hornean los TRES botones de opción "Uñas", "Pestañas" y "Cejas"
    And NO se hornea ningún campo de texto ni el botón "Reservar otra cita"
    # El estado inicial del chat es DETERMINISTA (no depende del reloj ni de nada calculado), así que
    # SÍ puede hornearse sin mentir — al revés que los días del calendario de `#equipo` (@s9 de
    # `equipo_reservas.feature`). Quien llega con el JS aún cargando ve un chat con contenido, no un
    # hueco. Se asevera sobre `renderToString(<Reserva />)`, NUNCA con jsdom.

  @s10
  Scenario: Las opciones del primer paso son las categorías REALES del salón — ni "Facial" ni "Depilación"
    Given la sección de reserva renderizada, con el chat en su primer paso
    When se leen los nombres accesibles de los botones de opción del chat
    Then son EXACTAMENTE tres y en este orden: "Uñas", "Pestañas" y "Cejas"
    And en el fragmento de la sección NO aparece "Facial" ni una sola vez, sin distinguir mayúsculas
    And en ese MISMO fragmento NO aparece "Depilación" ni una sola vez, sin distinguir mayúsculas
    # 🔴 LA REPARACIÓN DEL BLOQUEANTE DE v1, que ofrecía cuatro opciones incluyendo dos servicios que
    # ESTE SALÓN NO PRESTA. Categorías reales: Uñas · Pestañas · Cejas (F-09 y `catalogo-demo.ts`).
    # Anunciar un servicio inexistente es además riesgo legal blando (LCD art. 5.1.g). La negativa va
    # ACOTADA al fragmento de `#reserva` y DESPUÉS del ancla positiva (doctrina «nunca verde por
    # vacuidad»): a día de hoy `CATALOGO_DEMO` sigue publicando «Facial» en OTRA sección, y una
    # negativa de página entera nacería ROJA por culpa ajena.

  @s11
  Scenario: Elegir una opción añade mi respuesta y encadena la siguiente pregunta
    Given la sección de reserva renderizada, con el chat en su primer paso
    When pulso el botón de opción "Uñas"
    Then el hilo pasa a tener EXACTAMENTE tres burbujas
    And la segunda burbuja es mía y su texto es exactamente "Uñas"
    And la tercera es del bot y su texto es exactamente "¡Perfecto! ¿Qué día te viene mejor?"
    And los botones de opción visibles pasan a ser "Entre semana", "Este fin de semana" y "Lo antes posible"
    # El conteo EXACTO de burbujas mata al mutante que pierde el eco del usuario o que duplica la
    # pregunta. Los tres literales se escriben A MANO (jamás importando `FLUJO_CHAT`).

  @s12
  Scenario Outline: El guion es FIJO y tiene cuatro pasos, con las opciones de cada uno
    Given el chat situado en el paso "<paso>" tras haber respondido los anteriores
    When leo el último mensaje del bot y los botones de opción visibles
    Then el mensaje del bot es exactamente "<pregunta del bot>"
    And los botones de opción visibles son exactamente "<opciones>"

    Examples:
      | paso | pregunta del bot                                                          | opciones                                                 |
      | 1    | ¡Hola! Soy el asistente de Nails Lash Studio ✨ ¿Qué te gustaría reservar? | Uñas, Pestañas, Cejas                                    |
      | 2    | ¡Perfecto! ¿Qué día te viene mejor?                                       | Entre semana, Este fin de semana, Lo antes posible       |
      | 3    | Genial. ¿Prefieres alguna franja horaria?                                 | Por la mañana, Por la tarde, Me es indiferente           |
      | 4    | Casi listo. ¿A qué nombre hago la reserva?                                | (ninguna: el paso 4 se responde por texto libre, @s13)   |

    # Las cuatro preguntas y las nueve opciones son VERBATIM de `Reserva.tsx:39-44` y se escriben A
    # MANO en el test. La cuarta fila fija que el guion tiene CUATRO pasos y no cinco: es la que mata
    # al mutante del comparador `siguiente < FLUJO_CHAT.length` por el lado de «se pasa de largo».

  @s13
  Scenario: El cuarto paso pide el nombre por texto libre, y ahí no hay botones de opción
    Given el chat en su cuarto paso, con servicio, día y franja ya respondidos
    When se inspecciona el pie del chat
    Then existe un campo de texto cuyo placeholder es exactamente "Escribe tu nombre…" y cuyo nombre accesible es exactamente "Tu nombre"
    And existe un botón cuyo nombre accesible es exactamente "Enviar"
    And NO se muestra ningún botón de opción: los chips del guion han desaparecido
    And el glifo "→" del botón de enviar NO es su nombre accesible: el nombre lo pone un aria-label
    # El placeholder lleva PUNTOS SUSPENSIVOS TIPOGRÁFICOS («…», U+2026), no tres puntos: el literal
    # se copia tal cual (Reserva.tsx:242). Un botón llamado «→» se anunciaría como «flecha derecha,
    # botón» y no diría qué hace (mismo criterio que @s25 de `equipo_reservas.feature`). El
    # `aria-label="Tu nombre"` es lo que da nombre accesible al input: un `placeholder` NO es una
    # etiqueta accesible fiable.

  @s14
  Scenario Outline: Enviar el nombre vacío (o solo espacios) no añade NADA al hilo
    Given el chat en su cuarto paso, con el hilo mostrando siete burbujas y el campo de nombre con el valor "<lo escrito>"
    When pulso el botón "Enviar"
    Then el hilo sigue teniendo EXACTAMENTE siete burbujas: no se añade ninguna
    And no aparece ninguna burbuja vacía ni con el texto "undefined"
    And el chat sigue en su cuarto paso, con el campo de texto todavía visible

    Examples:
      | lo escrito        | qué fija                                                       |
      |                   | la cadena vacía: el caso obvio                                 |
      | "   "             | SOLO ESPACIOS: es el caso que mata al mutante que borra trim() |

    # 🔴 LA SEGUNDA FILA ES LA QUE IMPORTA. Sin ella, quitar el `.trim()` (Reserva.tsx:111) deja el
    # test verde y el chat acepta «   » como nombre, produciendo un resumen «¡Gracias,    !». La
    # comprobación vive en `reserva-logica.ts` como predicado PURO para que Stryker la muerda por valor.

  @s15
  Scenario: Completar el guion muestra el resumen interpolado y cierra el chat
    Given el chat con servicio "Uñas", día "Entre semana" y franja "Por la mañana" ya elegidos
    When escribo el nombre "Marta" y pulso el botón "Enviar"
    Then la última burbuja es del bot y su texto es exactamente "¡Gracias, Marta! ✨ Tu solicitud: Uñas · Entre semana · Por la mañana. Te confirmaremos la hora exacta por WhatsApp. ¡Te esperamos en Nails Lash Studio!"
    And el resumen contiene los TRES valores elegidos y el nombre, en ese orden, separados por " · "
    And ya NO se muestra el campo de texto ni ningún botón de opción
    And se muestra un botón cuyo nombre accesible es exactamente "Reservar otra cita"
    # El resumen es VERBATIM de `Reserva.tsx:103`. 🔴 NO dice «en unos minutos» (v1 se lo inventaba):
    # prometer un tiempo de respuesta que nadie ha verificado con el salón es exactamente el tipo de
    # promesa que este repo no hornea. La interpolación vive en `reserva-logica.ts` y se testea
    # también POR VALOR con otros cuatro valores distintos, para matar al mutante que fija uno.

  @s16
  Scenario Outline: La tecla Enter equivale al botón de enviar; cualquier otra tecla no envía nada
    Given el chat en su cuarto paso con el nombre "Marta" escrito en el campo
    When pulso la tecla "<tecla>" dentro del campo de texto
    Then el hilo "<qué pasa>"

    Examples:
      | tecla  | qué pasa                                                                  |
      | Enter  | gana la burbuja "Marta" y el resumen final, igual que con el botón Enviar |
      | Escape | NO cambia: sigue con las mismas burbujas y el campo sigue con "Marta"     |

    # 🔴 LAS DOS FILAS SON OBLIGATORIAS: sin la segunda, mutar `e.key === 'Enter'` a `true`
    # (cualquier tecla envía) deja el test verde y el chat envía al primer carácter tecleado.
    # El `preventDefault` (Reserva.tsx:247) evita además que un formulario ancestro se envíe.

  @s17
  Scenario: "Reservar otra cita" reinicia el guion sin rastro de las respuestas previas
    Given el chat con el resumen final ya mostrado
    When pulso el botón "Reservar otra cita"
    Then el hilo muestra EXACTAMENTE UNA burbuja, y es el saludo "¡Hola! Soy el asistente de Nails Lash Studio ✨ ¿Qué te gustaría reservar?"
    And vuelven a mostrarse los tres botones de opción "Uñas", "Pestañas" y "Cejas"
    And ya no se muestra el botón "Reservar otra cita" ni el campo de texto
    And en el hilo no queda ninguna burbuja con "Marta", ni con "Uñas", ni con el resumen anterior
    # Reservar no puede ser un callejón sin salida. El reinicio limpia LOS CINCO estados (mensajes,
    # paso, borrador, hecho, respuestas): si uno se olvidara, el siguiente resumen mezclaría datos de
    # dos personas distintas. El conteo EXACTO de UNA burbuja es lo que caza ese olvido.

  @s18
  Scenario: El hilo se desplaza automáticamente hasta el último mensaje
    Given el hilo del chat con su scrollHeight FIJADO A MANO en 500 y su scrollTop en 0
    When se añade un mensaje nuevo al hilo
    Then el scrollTop del contenedor del hilo pasa a valer 500
    # 🔴 SIN FIJAR scrollHeight A MANO ESTE ESCENARIO ES VERDE POR VACUIDAD: jsdom NO calcula layout,
    # así que `scrollHeight` vale 0 y una aserción «scrollTop === scrollHeight» compararía 0 con 0 y
    # pasaría aunque el efecto no existiera. Se fija con `Object.defineProperty` sobre el elemento.
    # Es también lo que mata al mutante que anula el `if (hilo.current)` (Reserva.tsx:88).
    # La asignación directa de `scrollTop` (en vez de `scrollTo`) es DELIBERADA: jsdom no implementa
    # `Element.scrollTo` y lanzaría.

  @s19
  Scenario: Quién habla en cada burbuja vive en un atributo CONSULTABLE, no en una clase CSS
    Given el chat con el saludo del bot y una respuesta mía ya en el hilo
    When se inspeccionan las burbujas del hilo
    Then cada burbuja expone un atributo data-de cuyo valor es "bot" o "usuario"
    And la burbuja del saludo expone data-de="bot" y la de mi respuesta expone data-de="usuario"
    And la clase visual de cada burbuja la decide una función PURA de "src/components/reserva-logica.ts" que devuelve la CLAVE "burbujaBot" o "burbujaUsuario", y esa función se testea POR VALOR con las dos entradas
    And ningún test de esta feature asevera la clase CSS de una burbuja
    # 🔴 ESTE ESCENARIO ES OBLIGATORIO PARA QUE LA FEATURE PUEDA CERRAR. Hoy Reserva.tsx:222 hace
    # `className={m.deBot ? estilos.burbujaBot : estilos.burbujaUsuario}`: con `css:false` las dos
    # ramas valen `undefined`, los mutantes del ternario dan EL MISMO DOM y SOBREVIVEN (medido en
    # `cabecera.test.tsx` @s15: 5 mutantes, 5 supervivientes) → umbral 1.0 inalcanzable. Sacando la
    # decisión a una función pura que devuelve una CLAVE, el mutante muere POR VALOR, y el
    # `data-de` da a los tests (y a quien inspeccione el DOM) una forma honesta de saber quién habla
    # sin mirar colores. Es la regla anti-clase-CSS del repo aplicada al pie de la letra.

  @s20
  Scenario: El nombre se interpola VERBATIM y ninguna burbuja emite "undefined"
    Given el chat con servicio "Cejas", día "Este fin de semana" y franja "Me es indiferente" elegidos
    When escribo el nombre "Mª Ángeles & Co." y pulso el botón "Enviar"
    Then la última burbuja contiene exactamente el fragmento "¡Gracias, Mª Ángeles & Co.! ✨"
    And contiene exactamente el fragmento "Tu solicitud: Cejas · Este fin de semana · Me es indiferente."
    And el texto se muestra tal cual, sin entidades HTML escapadas a la vista ("&amp;" NO aparece como texto visible)
    And en NINGUNA burbuja del hilo aparece la palabra "undefined"
    # Caso límite del texto libre: acentos, superíndice, «&» y punto final. React escapa al insertar,
    # así que el usuario ve «&» y el DOM está a salvo; aseverarlo impide que alguien «mejore» esto con
    # `dangerouslySetInnerHTML`. La caza de «undefined» es la red contra el mutante que pierde una de
    # las cuatro respuestas del `Record` (Reserva.tsx:95, 103): produciría «Tu solicitud: undefined ·
    # …» y hoy NADA lo detecta. El nombre NO se envía a ningún sitio (@s22).

  # ---------------------------------------------------------------------------
  # LAS CINCO PUERTAS Y LA FRONTERA CON F-13.
  # ---------------------------------------------------------------------------

  @s21
  Scenario: El build con las CINCO puertas sigue en verde y el conjunto de anclas no se mueve
    Given el proyecto construido con "pnpm build" y sus CINCO puertas
    When se inspeccionan el código de salida y el HTML crudo de la ruta "/"
    Then el código de salida del build es 0
    And el documento sigue conteniendo EXACTAMENTE UNA vez 'id="reserva-titulo"', y sigue habiendo SIETE ids de sección navegable y SIETE enlaces en la lista de navegación (puerta 5: igualdad de conjuntos INTACTA)
    And el enlace de la nav "Reserva" y el CTA "Reservar" de la cabecera siguen apuntando a "#reserva-titulo"
    And en TODA la página no aparece "600123456", ni "ph-woman", ni "IMAGEN TEMPORAL", ni "Calle de la Belleza", ni "hola@nailslashstudio.com" (puerta 2)
    And la sección no añade ningún subrecurso externo: ni "<img", ni "<iframe", ni "<script" nuevo, ni un "url(" apuntando fuera del sitio (puerta 4)
    And MINIMO_DE_PARES de src/lib/puerta-contraste.ts sigue valiendo EXACTAMENTE 18 y MATRIZ_DE_USO no gana ninguna fila: los dos enlaces reutilizan las utilidades globales demo-btn--wa y demo-btn--ghost, que YA existen (puerta 3)
    And la home sigue teniendo EXACTAMENTE UN "<h1>" (puerta 1)
    # 🔴 CAMBIAR EL TEXTO DEL h2 ES INOCUO; CAMBIAR SU id MATA EL BUILD Y CINCO CTA A LA VEZ. Este
    # escenario es el cinturón de seguridad de toda la sesión. Inventar un color propio para los
    # botones obligaría a añadir fila a la matriz y a subir A MANO `MINIMO_DE_PARES` (es un literal):
    # ese es justo el cambio que rompe el build en silencio, y por eso se reutilizan las utilidades.

  @s22
  Scenario: El enlace FIJO de la izquierda sigue siendo genérico y el chat sigue sin enviar nada por sí mismo — la frontera con F-13 se estrecha, no desaparece
    Given el HTML CRUDO prerenderizado de la ruta "/" con la sección "#reserva-titulo" y el chat completado en el navegador
    When se inspeccionan el href del enlace cuyo nombre accesible es exactamente "WhatsApp" y lo que hace el chat al terminar
    Then ese href SÍ contiene "?text=" con un mensaje genérico FIJO (ANCLA POSITIVA: el enlace lleva mensaje)
    And ese mensaje genérico NO contiene ningún nombre de servicio, ninguna fecha, ninguna hora ni ningún nombre de persona: sigue siendo la invitación fija a escribir, no una solicitud concreta
    And al completar el chat NO se abre WhatsApp automáticamente, NO se navega a ninguna URL y NO se hace ninguna petición de red: el enlace nuevo de la reserva (@s24) es para que LA CLIENTA lo pulse, el chat no lo dispara solo
    And los bytes de "src/components/Reserva.tsx" NO contienen "fetch(", ni "XMLHttpRequest", ni "window.location", ni "form action": nada sale del navegador sin que la clienta pulse un enlace
    # FRONTERA con la feature id 13 (`solicitud_whatsapp`, `pending`), que SIGUE siendo la única vía
    # con disponibilidad REAL (franjas por profesional, no las fijas de este guion) y confirmación de
    # servidor. Lo que este contrato YA NO hace es fingir que el chat "confirma": compone un mensaje
    # (@s23) y ofrece un enlace (@s24) para que la clienta lo envíe ella misma — decisión explícita de
    # Pablo (ver cabecera v3), no una mejora improvisada de F-13.

  @s23
  Scenario Outline: mensajeReserva compone, en castellano natural, los cuatro datos de la clienta — función PURA
    Given la función "mensajeReserva" de "src/components/reserva-logica.ts" llamada con servicio "<servicio>", día "<dia>", franja "<franja>" y nombre "<nombre>"
    When se lee el texto que devuelve
    Then el texto devuelto es exactamente "<mensaje>"

    Examples:
      | servicio | dia                | franja            | nombre           | mensaje                                                                                                                              |
      | Uñas     | Entre semana       | Por la mañana      | Marta            | Hola, quiero reservar: Uñas · Entre semana · Por la mañana. Me llamo Marta y os escribo desde la web. ¿Podéis confirmarme la hora exacta? |
      | Cejas    | Este fin de semana | Me es indiferente  | Mª Ángeles & Co. | Hola, quiero reservar: Cejas · Este fin de semana · Me es indiferente. Me llamo Mª Ángeles & Co. y os escribo desde la web. ¿Podéis confirmarme la hora exacta? |

    # La segunda fila (acentos, superíndice, «&») mata al mutante que fija UN valor o pierde un campo
    # del `Record`, mismo criterio que @s20 sobre el resumen del bot. `mensajeReserva` es PURA (sin
    # `Date`, sin `Math.random`, sin estado): mismos 4 argumentos, mismo texto siempre. Se testea en
    # `reserva.test.tsx` junto a `claveBurbuja` (@s19): mismo módulo, mismo patrón F-09. NUNCA se
    # importa como valor esperado ni se reejecuta contra su propio resultado.

  @s24
  Scenario: Al terminar el chat aparece, ANTES de "Reservar otra cita", un enlace que ya lleva la reserva escrita
    Given el chat con servicio "Uñas", día "Entre semana" y franja "Por la mañana" ya elegidos
    When escribo el nombre "Marta" y pulso el botón "Enviar"
    Then aparece, ANTES del botón "Reservar otra cita", un enlace cuyo nombre accesible es exactamente "Enviar la reserva por WhatsApp"
    And su href contiene la subcadena "34625223366" (el E.164 SIN el "+", derivado de TELEFONO de F-02, nunca hardcodeado)
    And su href, decodificado, es exactamente el texto que devuelve mensajeReserva para esos cuatro datos (@s23)
    And el enlace reutiliza la clase global "demo-btn demo-btn--wa" (el mismo par de contraste que YA existe: MINIMO_DE_PARES no gana ninguna fila)
    And el enlace NO lleva target="_blank" (coherente con @s2 y con el botón flotante)
    And ANTES de terminar el chat (recién montado, o a mitad del guion) este enlace NO existe: es exclusivo del resumen final
    # "ANTES" en el DOM: entre las burbujas y el botón de reinicio, el enlace de WhatsApp va primero
    # (acción PRIMARIA) y "Reservar otra cita" después, tal y como pidió Pablo. Mata al mutante que
    # invierte `hecho && (...)` a `hecho || (...)` (mostraría el enlace ANTES de terminar el guion) y
    # al que solo oculta el enlace en el HORNEADO pero lo deja en jsdom por una guarda distinta.

  # ---------------------------------------------------------------------------
  # DECISIONES QUE VAN A LA PUERTA — el autor PROPONE, el humano DECIDE
  # ---------------------------------------------------------------------------
  # D1 — ⚠️ LA MÁS SERIA, Y ES DE HONESTIDAD. `feature_list.json` → `no_se_construyen` dice
  #      literalmente del `#reserva` del prototipo: «Simula un agente "en línea" que no existe y no
  #      envía nada; recoge el nombre sin aviso de privacidad. Se sustituye por solicitud_whatsapp».
  #      ESTE CONTRATO MANTIENE ESE CHAT porque Pablo lo ha pedido explícitamente para la demo. Se
  #      cumple lo cumplible: el nombre NO sale del navegador (@s22) y el guion no pide ningún dato de
  #      salud. QUEDA VIVO el «en línea» (@s8), que afirma una disponibilidad que nadie ha verificado.
  #      → RECOMENDADO: aprobar SOLO para la DEMO y añadir una LEYENDA VISIBLE bajo el chat, del
  #      estilo «Asistente de demostración · no envía la reserva; escríbenos por WhatsApp para
  #      confirmarla», siguiendo el patrón `LEYENDA_OFERTAS`/`LEYENDA_EQUIPO` y la política de datos
  #      demo marcados. 🔴 ESA LEYENDA NO ESTÁ EN NINGÚN ESCENARIO DE ESTE FICHERO: si el humano la
  #      aprueba, es un escenario NUEVO (@s23) que hay que añadir ANTES del TDD. Si el humano la
  #      rechaza, queda por escrito que se rechazó.
  # D2 — El h2 pasa de «Pide tu cita en un momento» a «¿Prefieres reservar por chat?» (verbatim del
  #      diseño). Ningún test actual asevera el copy viejo [V: grep en `src/` = solo Reserva.tsx:135],
  #      así que no rompe nada. → RECOMENDADO: sí, es el copy aprobado del prototipo.
  # D3 — TEXTO DEMO del enlace de WhatsApp. PROPUESTO: constante PROPIA
  #      `RESERVA_WHATSAPP_TEXTO = 'Hola, quiero reservar por chat en Nails Lash Studio.'` en
  #      `src/lib/demo/reserva-demo.ts`, distinta de `CONTACTO_WHATSAPP_TEXTO` y de
  #      `BOTON_WHATSAPP_FLOTANTE_TEXTO`, para que los TRES puntos de entrada sean distinguibles
  #      cuando lleguen los mensajes al móvil del salón (mismo criterio que la D2 del contrato del
  #      botón flotante). Alternativa: reutilizar `CONTACTO_WHATSAPP_TEXTO` (menos duplicación, CTA
  #      indistinguibles). Si el humano cambia el literal, cambia @s3 y @s4.
  # D4 — NOMBRE ACCESIBLE del primer enlace: hoy sería solo «WhatsApp» (verbatim del diseño). Es
  #      escueto para quien navega por lista de enlaces, y en la página habrá TRES enlaces a WhatsApp
  #      (este, el CTA de `#contacto` y el flotante). → RECOMENDADO para la demo: dejarlo verbatim
  #      (@s2). Alternativa: `aria-label="Escribir al estudio por WhatsApp"`, que CONTIENE el texto
  #      visible y por tanto respeta SC 2.5.3 «Label in Name»; si se elige, cambia @s2.
  # D5 — El mini-calendario que se retira de `#reserva` NO se pierde: sigue vivo, y mejor, en las
  #      tarjetas de `#equipo` (con filtro de franjas por horario real, que este nunca tuvo: ofrecía
  #      las 19:00 un sábado con el salón cerrado). → RECOMENDADO: confirmar que esa es la intención
  #      («una sola vía de reserva, no dos», `feature_list.json` id 13).
  # D6 — `Reserva.tsx` y `reserva-logica.ts` entran en `mutate` de `stryker.config.json` (hoy NO
  #      están: la sección lleva viva varias sesiones SIN un solo test [V: no existe
  #      `reserva.test.tsx`]). → RECOMENDADO: sí, y con el umbral 1.0 del repo. NOTA MEDIDA: el
  #      `coverage.include` de `vitest.config.ts` cubre `src/lib/**/*.ts` y `src/components/**/*.tsx`,
  #      pero NO `src/components/**/*.ts`, así que `reserva-logica.ts` quedaría fuera de la COBERTURA
  #      (como ya le pasa a `equipo-logica.ts`). No afecta a la mutación, que es la puerta real; se
  #      declara para que nadie lo descubra tarde.
  #
  # VERIFICACIÓN MANUAL QUE ACOMPAÑA A LA PUERTA (no son tests verdes):
  #  · Abrir el enlace de WhatsApp en Android, iOS y WhatsApp Web y confirmar que el chat abre CON el
  #    texto puesto (el HOST `wa.me` no lo cubre ningún test, por A-10: esta es su única verificación).
  #  · Pulsar «Llamar al estudio» en un móvil real y confirmar que marca 625 22 33 66.
  #  · Recorrer el chat entero con teclado (Tab + Enter) y comprobar que el foco es visible en los
  #    chips, en el campo y en el botón de enviar, y que el hilo baja solo al último mensaje.
  #  · Ver la sección a 320px de ancho: las dos columnas apilan sin desbordar (F-08).
