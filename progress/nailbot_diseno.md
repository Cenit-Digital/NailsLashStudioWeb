# Brief de diseño — Nailbot (F-23 `nailbot_chat_compartido` + F-24 `nailbot_flotante`)

> Autor: `craftsman_lead`, 2026-09-27. Es la ENTRADA de `spec_partner` y `gherkin_author`. Todo lo que
> aquí es texto literal (entre comillas «») es DECISIÓN, no sugerencia: los agentes no inventan copy.
> Investigación de soporte (fuentes oficiales con URL y fecha): `docs/research/asistente-robot/`
> `01-legal.md` · `02-whatsapp.md` · `03-claude-api.md` · `04-a11y-animacion.md` ·
> `05-restricciones-repo.md` · `06-diseno-servidor-futuro.md` · ARTE: `nailbot-prototipo.html`.

## 1. Encargo literal de Pablo (2026-09-27)

- «Robot pintándose las uñas esperando a que pidan cita, como botón flotante en la esquina inferior
  derecha (que tenga una animación acorde a la temática de la web y lo que es la empresa)».
- Características: «Robot · Pestañas largas · Morros rojos, marcados y pintados».
- «Además tiene que ir enlazado con un ChatBot de IA, inteligente de WhatsApp, no lo implementes con
  servidor todavía. Que vamos a tener servidor por supuesto, pero todavía no.»
- Tras ver el prototipo del arte: «venga nos gusta, impleméntalo».

## 2. Decisiones del humano (AskUserQuestion, 2026-09-27)

| # | Pregunta | Respuesta |
|---|---|---|
| H1 | ¿Qué abre el robot? | **Panel de chat → WhatsApp** (guion local hoy; IA real con el servidor, sin rehacer la UI) |
| H2 | ¿Y el chat de #reserva? | **Un asistente compartido**: el mismo cerebro en la sección Reserva y en el panel del robot |
| H3 | Animación y SC 2.2.2 | **Bucle + mini control de pausa**; con reduced-motion, quieto |
| H4 | Bocadillo | **Sí, descartable**: aparece una vez, se cierra con × o Esc, no vuelve en esa visita |
| H5 | ¿Por qué se retiró el botón verde (commit 479d541)? | «Era un botón de WhatsApp flotante con el logo de WhatsApp, que no es lo que queremos. Queremos un robotito que pegue con la estética del negocio y además induzca al cliente a reservar una cita a través del ChatBot» → **nada de verde ni logo de WhatsApp en el flotante** |
| H6 | Nombre | **Nailbot** |
| H7 | IA futura | **Claude** (con API key propia de la Console en el servidor; NO se usa ni se guarda ninguna clave) |
| H8 | Publicación | **Push directo a main** (el deploy a Pages ya pide aprobación manual) |

## 3. Decisiones del lead (con su porqué)

**L1 · Demo honesta, sin decir «IA».** Un guion de reglas NO es un «sistema de IA» (AI Act art. 3.1 +
Directrices; `01` §2) → el art. 50.1 no obliga HOY, pero **no se puede anunciar como IA** (`01` §5.1).
Política del proyecto: dato demo con leyenda visible (memoria `politica-datos-demo-marcados`). Se
retira el «en línea» del chat actual (`feature_list.json` → `no_se_construyen`: «Simula un agente 'en
línea' que no existe»). El robot como avatar es correcto: no es figura humana (Directrices art. 50 §38).

**L2 · Datos mínimos (RGPD art. 5.1.c).** Solo opciones cerradas + nombre **opcional**. Nunca teléfono
(WhatsApp ya lo aporta), nunca texto libre que invite a datos de salud (art. 9). `01` §3.1.

**L3 · Aviso de capa 1 (art. 13 RGPD / art. 11 LOPDGDD) justo ENCIMA del enlace final.** Provisional:
la política de privacidad no existe (F-16 `blocked`), así que el aviso NO enlaza a ninguna ruta (la
puerta anti-404 de F-04 rompería el build). Dependencia anotada para antes de publicar.

**L4 · La costura del servidor futuro = una función PURA `responder(estado, entrada) → estado`.**
Hoy la implementa el guion local; mañana la sustituye un `fetch` al endpoint propio (`06` §1). Nada de
interfaz/adaptador remoto especulativo en el código (patrón de memoria organizacional «herencia… es
deuda muerta hasta que un uso la justifica»): la costura ES la firma de la función pura.

**L5 · Un solo componente de chat `ChatNailbot`**, montado por `Reserva.tsx` (columna derecha, horneado
en SSG como hoy) y por el panel del flotante (solo cliente). Instancias con estado INDEPENDIENTE.
Reutiliza las puras ya mutadas de `reserva-logica.ts` (`claveBurbuja`, `desplazarAlFinal`) SIN moverlas;
`mensajeReserva` se AMPLÍA (nombre opcional). La extracción ENMIENDA `features/reserva_chat.feature`
(los @s que cambian se marcan AJUSTADO/RETIRADO con la convención de la ENMIENDA 4 de la galería: tags
nunca reutilizados, cuerpo histórico íntegro). Riesgos medidos en `05` §5 (tabla de acoplamientos).

**L6 · «Inteligencia» de la demo acotada y con dato REAL:** si la clienta elige «Un sábado», Nailbot
NO pregunta la franja (el sábado solo abre por la mañana) y lo dice derivándolo de la fuente única
`HORARIO.sabado` de `src/lib/site.ts` (F-02) — nunca un literal «10:00-14:00» escrito a mano en el
guion. Nada más «listo» que eso hasta que llegue la IA.

**L7 · El lanzador se monta SOLO en cliente** (tras hidratar). Precedente: el control del hero «nunca
viaja horneado» (`05` §2.6). Sin JS no habría acción → no se hornea un botón muerto. `position: fixed`
no provoca CLS.

**L8 · Panel = `<dialog>` NATIVO modal con `showModal()`** (`04` §12-14): inercia del fondo, Esc,
top layer, `::backdrop` y devolución del foco los da el navegador. jsdom 25 no implementa
`showModal/close` (`05` §2.7) → stub PROTEGIDO en el setup de test (solo si faltan). Lo nativo (Esc,
inercia, vuelta del foco) se verifica en navegador real y se anota en `progress/`.

**L9 · Animación = arte del prototipo portado VERBATIM** (geometría y colores de
`nailbot-prototipo.html`), SVG inline `aria-hidden="true" focusable="false"`, sin `<defs>` ni ids
(el arte aparece varias veces en la página). Solo `transform`/`opacity`, `transform-box: fill-box`.
**Estado base = pose final visible** (uñas pintadas, pincel en el bote) — patrón de memoria
«estado-base-visible-ssg-reduced-motion». Todas las `@keyframes` dentro de
`@media (prefers-reduced-motion: no-preference)` (`04` §5). El avatar de la cabecera del chat usa el
MISMO arte ESTÁTICO (sin animación), encuadrado a la cara por CSS.

**L10 · Pausa (SC 2.2.2, nivel A).** Botón propio junto al robot, `aria-pressed`, ≥ 24×24 (se fija 32).
El estado vive en un ATRIBUTO del arte (`data-animacion`), nunca en `className` condicional (`05` §2.1).
Arranca en pausa si `prefers-reduced-motion: reduce` (consulta exacta, `matchMedia` guardado y leído en
efecto); activar reduce en caliente pausa; desactivarlo NO reanuda. Sin persistencia (cero storage).

**L11 · Bocadillo.** Aparece UNA vez por carga de página, a los 4 s de montar el lanzador, solo si el
panel nunca se abrió. No es región viva; se vincula al lanzador con `aria-describedby` mientras se ve.
Botón × con nombre, ≥ 24×24. Esc lo cierra sin mover el foco. Al abrir el panel desaparece y no vuelve.
Sin storage (L2/`01` §5.1.5).

**L12 · SC 2.4.11 (foco no tapado).** `scroll-padding-bottom` en `html` (junto al `scroll-padding-top`
existente) ≥ alto del lanzador + separación + `env(safe-area-inset-bottom, 0px)`, y el mismo hueco al
final del documento para que el último enlace del pie pueda quedar por encima del robot (`04` §8).

**L13 · Teclado con el panel abierto:** ←/→ dentro del diálogo NO deben mover los carruseles (escuchan
`keydown` en `document`, `05` Reglas «No hacer» último punto) → el diálogo detiene la propagación de
esas teclas.

**L14 · Montaje:** `src/pages/home.tsx`, tras `</main>` y antes de `<Pie />`, hermano (no dentro del
`<footer>`). El widget no trae `<section>`, `<nav>` ni `<h1>` (puertas 1 y 5, `05` §1). El título del
diálogo es un `<h2>`; como el diálogo solo existe en cliente, no altera el HTML horneado.

**L15 · WhatsApp:** solo vía `waHref(TELEFONO.legible, texto)` en un `<a>` que pulsa la persona, sin
`target`. Nunca se asevera el host (`wa.me`) en tests; nunca número ni host en `.tsx`. Cero `fetch`,
cero storage, cero analítica en el chat. Sin guards de fuente que prohíban `if (`/`?` en ficheros
mutados (mató la mutación del botón retirado, `05` §7).

**L16 · Techo de alcance (memoria `acotar-alcance-gherkin-arnes`).** F-23 ≤ 14 escenarios nuevos (+ las
enmiendas de `reserva_chat.feature`); F-24 ≤ 16. **Prohibido crear tests build-based nuevos** (lo
horneado con `renderToString`). Ficheros nuevos a `stryker.config.json` → `mutate`.

## 4. Copy LITERAL (fuente: este brief; vive en `src/lib/demo/nailbot-demo.ts`)

**Cabecera del chat:** nombre «Nailbot» · subtítulo «Asistente automático · demo».
**Leyenda (visible, dentro del chat, siempre):**
«Demo · Nailbot responde con opciones predefinidas: no es una persona ni usa inteligencia artificial.»

**Guion (4 pasos; el 3.º se salta con «Un sábado»):**

| Paso | Mensaje de Nailbot | Opciones |
|---|---|---|
| servicio | «¡Hola! Soy Nailbot 💅, el asistente automático de Nails Lash Studio. ¿Qué te apetece reservar?» | «Uñas» · «Pestañas» · «Cejas» |
| día | «¡Me encanta! ¿Qué día te viene mejor?» | «Entre semana» · «Un sábado» · «Lo antes posible» |
| franja | «¿Prefieres alguna franja horaria?» | «Por la mañana» · «Por la tarde» · «Me es indiferente» |
| (sábado) | en lugar del paso franja: «Los sábados abrimos de {HORARIO.sabado con « a » en vez de «-»}, así que te busco hueco por la mañana.» → franja = «Por la mañana» y se pasa al paso nombre en el MISMO turno | — |
| nombre | «¡Casi lo tenemos! ¿A qué nombre hago la solicitud? Si lo prefieres, puedes saltártelo.» | campo «Tu nombre» (placeholder «Escribe tu nombre…», botón «Enviar») + opción «Prefiero no decirlo» |

Ejemplo del sábado con el dato actual `'10:00-14:00'`: «Los sábados abrimos de 10:00 a 14:00, así que
te busco hueco por la mañana.»

**Resumen final (burbuja de Nailbot):**
- con nombre: «¡Gracias, {nombre}! ✨ Tu solicitud: {servicio} · {día} · {franja}. Pulsa el botón para
  enviársela al salón por WhatsApp y allí te confirmarán la hora exacta.»
- sin nombre: «¡Gracias! ✨ Tu solicitud: {servicio} · {día} · {franja}. Pulsa el botón para
  enviársela al salón por WhatsApp y allí te confirmarán la hora exacta.»

**Mensaje de WhatsApp (`mensajeReserva`, ampliada):**
- con nombre (IDÉNTICO al actual): «Hola, quiero reservar: {servicio} · {día} · {franja}. Me llamo
  {nombre} y os escribo desde la web. ¿Podéis confirmarme la hora exacta?»
- sin nombre: «Hola, quiero reservar: {servicio} · {día} · {franja}. Os escribo desde la web.
  ¿Podéis confirmarme la hora exacta?»

**Aviso de capa 1 (encima del enlace final):** «Al pulsar se abrirá WhatsApp con este mensaje y tú
decides si lo envías. El salón lo usará solo para gestionar tu cita.»
**Enlace final:** «Enviar la reserva por WhatsApp» (como hoy) · **Reinicio:** «Reservar otra cita» (como hoy).

**Flotante (F-24):**
- Lanzador `aria-label`: «Abrir el chat con Nailbot para reservar cita»
- Pausa `aria-label`: «Pausar la animación de Nailbot» (+ `aria-pressed`)
- Bocadillo: «¿Te pinto una cita? 💅» (destacado) + «Soy Nailbot y te ayudo a reservar.»;
  cerrar: `aria-label` «Cerrar el mensaje de Nailbot»
- Diálogo: título visible «Reserva con Nailbot» (`h2`); cerrar: «Cerrar el chat»

## 5. Artefactos (nombres fijados para que nadie elija)

F-23: `src/components/ChatNailbot.tsx` · `src/components/chat-nailbot.module.scss` ·
`src/components/chat-nailbot-logica.ts` · `src/components/NailbotArte.tsx` ·
`src/components/nailbot-arte.module.scss` · `src/lib/demo/nailbot-demo.ts` · tests
`chat-nailbot.test.tsx`, `chat-nailbot-logica.test.ts`, `chat-nailbot-estilos.test.ts`,
`nailbot-arte.test.tsx` · toca `Reserva.tsx`, `reserva.module.scss`, `reserva-logica.ts`
(`mensajeReserva`), `reserva.test.tsx`, `features/reserva_chat.feature` (enmienda).

F-24: `src/components/NailbotFlotante.tsx` · `src/components/nailbot-flotante.module.scss` ·
`src/components/nailbot-flotante-logica.ts` · tests `nailbot-flotante.test.tsx`,
`nailbot-flotante-logica.test.ts`, `nailbot-flotante-estilos.test.ts` · toca `NailbotArte.tsx` +
`nailbot-arte.module.scss` (la animación), `src/pages/home.tsx` (montaje), `src/styles/_base.scss`
(scroll-padding-bottom), `vitest.setup.ts` (stub protegido de `<dialog>`).

## 6. Fuera de alcance (explícito)

Servidor, IA real, WhatsApp Cloud API, preguntas en texto libre, persistencia, analítica, página de
privacidad (F-16), cambiar las otras secciones. El diseño del servidor futuro está en `06`.
