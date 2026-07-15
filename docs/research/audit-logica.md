# Auditoría de la lógica del prototipo — `Opcion-1-Rosa.dc.html`

> **Área:** Auditoría del prototipo · **Fecha:** 2026-07-15
> **Objetivo:** inventariar toda la lógica con comportamiento testeable (no estilos)
> para alimentar el TDD (Gherkin → tests → implementación).

## Convenio de rutas (para no repetir rutas largas)

| Alias | Ruta real |
|---|---|
| `PROTO` | `C:/Users/vhurt/AppData/Local/Temp/claude/C--Users-vhurt-OneDrive-Escritorio-Proyectos-CenitDigitalProyectosCodigo-NailsLashStudioWeb/d9bf86dc-79ce-4d29-aaec-eeb87ab57df6/scratchpad/design/sitio-web-sal-n-de-u-as/project/Opcion-1-Rosa.dc.html` |
| `DATA` | `.../project/salon-data.js` |
| `SUPPORT` | `.../project/support.js` |

Las citas se dan como `PROTO:44` (archivo:línea). El prototipo tiene 462 líneas;
la lógica vive en el bloque `<script type="text/x-dc">` de `PROTO:371-460`.

## Convenio de confianza

- **[V]** Hecho verificado (fuente oficial o `archivo:línea` leído).
- **[I]** Inferencia mía a partir de hechos verificados.
- **[?]** Desconocido / NO VERIFICADO.

---

## 1. Respuesta ejecutiva

**Qué hacemos:** tratamos el prototipo como *especificación visual y de interacción*,
**no** como base de código. Se reimplementa desde cero con TDD. Y antes de escribir
un solo test hay que **cerrar tres decisiones de producto** que el prototipo deja
abiertas, porque condicionan todo el Gherkin.

Los cinco hallazgos que mandan sobre el resto:

1. **La reserva no reserva. [V]** Todo el flujo de cita (elegir día, elegir hora, pulsar
   "Reservar") sólo muta estado local de React: `empSet` → `this.setState` (`PROTO:399`,
   `PROTO:403`). No hay `fetch`, ni backend, ni persistencia. Pero la UI afirma
   *"Te confirmaremos por WhatsApp"* (`PROTO:225`). En una web real de un negocio real,
   eso es **prometer una cita que nadie recibe**. Es el riesgo nº1 del proyecto.
2. **El chat tampoco envía nada, y ni siquiera pide el teléfono. [V]** `chatFlow` recoge
   `service`, `day`, `time`, `name` (`DATA:112-117`) — **no hay campo de contacto**. El
   resumen promete *"Te confirmaremos la hora exacta por WhatsApp en unos minutos"*
   (`PROTO:406`). Aunque enviásemos los datos, el salón no tendría cómo responder.
3. **La "composición del mensaje de WhatsApp" NO EXISTE en el prototipo. [V]** El
   encargo la da por hecha, pero los dos enlaces son `https://wa.me/34600123456` **sin
   parámetro `?text=`** (`PROTO:255`, `PROTO:311`). No hay ninguna función que componga
   mensaje. Es una **feature a diseñar**, no a auditar (spec propuesta en §2.3).
4. **Reseñas inventadas, duplicadas y con 5★ codificadas a fuego. [V]** El `reviewPool`
   son 10 testimonios ficticios (`DATA:72-83`), las estrellas son la constante
   `'★★★★★'` (`PROTO:440`), y la rotación `rot()` (`PROTO:419`) hace que **Lucía y Paula
   muestren exactamente las mismas 5 reseñas**, igual que Carla y Sara (demostración en
   §2.5). Publicar esto en la web real de un salón real choca con la **Ley 3/1991 de
   Competencia Desleal, art. 27.7 y 27.8** [V, BOE, ver §4].
5. **Todos los datos del negocio son de relleno. [V]** Teléfono `+34 600 123 456`
   (`DATA:107`), dirección *"Calle de la Belleza 24, 28010 Madrid"* (`DATA:106`) — el
   salón real está en **Las Rozas de Madrid**, y 28010 es Madrid capital. Precios,
   equipo, horarios y ofertas: todo inventado. **Nada de `DATA` puede publicarse sin
   validación del cliente.**

**Por qué reimplementar y no adaptar:** el prototipo corre sobre un runtime propietario
de la herramienta de diseño. `<x-dc>`, `<sc-for>`, `<sc-if>`, `hint-placeholder-count`
y `class Component extends DCLogic` no son HTML estándar: los interpreta `SUPPORT`,
que es React por debajo (`SUPPORT:746-749`) y **evalúa el bloque de lógica con
`new Function`** (`SUPPORT:741-750`, con un `//! nosemgrep: eval-and-function-constructor`
en `SUPPORT:742`). `DCLogic` es sólo un alias de `StreamableLogic` (`SUPPORT:1674`).
No es desplegable, y además **se traga los errores**: los fallos de `componentDidMount`
van a un `try/catch` con `console.error` (`SUPPORT:894-898`), así que un bug de arranque
sería invisible en producción.

**Veredicto:** el prototipo es una **maqueta de alta fidelidad**. Su valor es la UX y el
inventario de estados. Su lógica de negocio es una simulación y hay que sustituirla por
un sistema real (o por un canal honesto: WhatsApp/teléfono).

---

## 2. Inventario de lógica con evidencia

### 2.0 Mapa de estado y ciclo de vida

Estado raíz (`PROTO:373`):

```js
state = { data:null, color:0, faq:-1, chat:null, emp:{}, days:[] };
```

| Campo | Tipo | Inicial | Quién lo muta |
|---|---|---|---|
| `data` | objeto `SALON` \| `null` | `null` | `componentDidMount` tras `import()` dinámico (`PROTO:376-379`) |
| `color` | índice | `0` | `colors[i].pick` (`PROTO:445`) |
| `faq` | índice \| `-1` | `-1` | `faq[i].toggle` (`PROTO:447`) |
| `chat` | objeto \| `null` | `null` | `chatPick`/`chatSend`/`chatDraft`/`chatRestart` |
| `emp` | mapa `i → {day,time,rev,booked}` | `{}` | `empSet` (`PROTO:399`) |
| `days` | array de 6 | `[]` | `componentDidMount` (`PROTO:384`) |

**Reglas [V]:**
- `renderVals()` es una función pura del estado → objeto plano que consume la plantilla
  (`PROTO:413-458`). **Es el punto de test ideal**: entra estado, sale vista.
- Guarda de carga: si `!d` devuelve un objeto "vacío" completo con `ready:false`
  (`PROTO:415`), evitando que la plantilla explote antes del `import()`.
- `componentWillUnmount` desconecta el IntersectionObserver (`PROTO:390`). Correcto, sin fuga.

**Casos límite [I]:**
- `data` llega por `import('./salon-data.js')` **sin `.catch()`** (`PROTO:376`). Si el
  módulo falla (red, 404), la promesa se rechaza en silencio y la web **se queda para
  siempre en el estado vacío** (`ready:false`), sin mensaje de error. En producción esto
  es una pantalla muerta. → **Test obligatorio: fallo de carga de datos.**
- No hay estado de "cargando": el usuario ve secciones vacías durante el `import()`.

---

### 2.1 Generación de días del calendario

**Código íntegro (`PROTO:380-384`):**

```js
const DOW=['dom','lun','mar','mié','jue','vie','sáb'];
const MON=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const days=[]; const dt=new Date();
while(days.length<6){ dt.setDate(dt.getDate()+1); if(dt.getDay()!==0){ days.push({dow:DOW[dt.getDay()], day:dt.getDate(), mon:MON[dt.getMonth()]}); } }
this.setState({days});
```

- **Entradas:** el reloj y la zona horaria **del navegador del cliente** (`new Date()`).
- **Salida:** array de exactamente 6 objetos `{dow, day, mon}`.
- **Consumo:** `days.map(...)` en `PROTO:433`; se renderizan `dd.dow` y `dd.day`
  (`PROTO:194`, `PROTO:197`).

**Reglas verificadas:**

| # | Regla | Evidencia |
|---|---|---|
| R1 | Incrementa **antes** de empujar → el primer día es **mañana**; hoy nunca es reservable | `PROTO:383` (`dt.setDate(...)` precede al `push`) [V] |
| R2 | Excluye domingos | `getDay()!==0` y `0 = Sunday` [V, [MDN getDay](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay): *"An integer, between 0 and 6 … 0 for Sunday"*] |
| R3 | R2 es coherente con el horario declarado (*Domingo: Cerrado*) | `DATA:103` [V] |
| R4 | Cruza fin de mes y fin de año correctamente | [V, [MDN setDate](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setDate): *"If you specify a number outside the expected range, the date information … is updated accordingly"*] |
| R5 | El bucle **siempre termina**: máximo 7 iteraciones para 6 no-domingos | [I] sobre R2 |

**Casos límite y defectos:**

| ID | Hallazgo | Gravedad | Evidencia |
|---|---|---|---|
| CAL-1 | **Sábado ofrece horas con el salón cerrado.** `days` puede incluir sábado, y `times` pinta **siempre los 6 `timeSlots`**, incluidos `16:00`, `17:30`, `19:00`. Pero el sábado cierra a las **15:00**. | **Alta** (negocio) | `DATA:71` vs `DATA:102`; `PROTO:435` no filtra por día [V] |
| CAL-2 | **`mon` es campo muerto.** Se calcula pero no se renderiza (`grep` de `dd.mon` en la plantilla: 0 coincidencias). | Baja | `PROTO:383` vs `PROTO:194,197` [V] |
| CAL-3 | **`days` se calcula una sola vez, en el montaje.** Una pestaña abierta al cruzar medianoche sigue mostrando los días de ayer: "mañana" pasa a ser hoy sin que nada se recalcule. | **Alta** | `PROTO:382-384` (sólo en `componentDidMount`) [V] |
| CAL-4 | **Depende del reloj y la zona horaria del cliente**, no de `Europe/Madrid`. Un cliente con el reloj mal, o de viaje, ve días distintos a la agenda real del salón. | **Alta** | `new Date()` sin zona (`PROTO:382`) [V] |
| CAL-5 | Sin año en el modelo. Al cruzar diciembre→enero, "vie 2" es ambiguo para el usuario. | Media | `PROTO:383` [V] |
| CAL-6 | No contempla **festivos ni vacaciones** (los de Las Rozas / Comunidad de Madrid). Ofrecerá el 25 de diciembre. | **Alta** (negocio) | ausencia en `PROTO:380-384` [V] |
| CAL-7 | Sin `try/catch`: `componentDidMount` está envuelto por el runtime, que silencia el error (`SUPPORT:894-898`). | Media | [V] |
| CAL-8 | Cambio de hora (DST peninsular): `setDate` opera sobre hora local; al preservarse la hora de pared, no debería haber desfase de día. Riesgo bajo pero **merece test**. | Baja | [I] |

**Gherkin sugerido:** reloj **inyectable** (nunca `new Date()` directo — es lo que hace
CAL-3/CAL-4 testeables). Escenarios: viernes→lista salta el domingo; sábado 31/12→cruza
año; sábado→no ofrece 16:00; festivo→excluido; medianoche→recalcula.

---

### 2.2 Selección de día/hora y reserva por profesional

**Código (`PROTO:398-404`):**

```js
empGet(i){ return this.state.emp[i] || {day:null,time:null,rev:0,booked:false}; }
empSet(i,patch){ this.setState(s=>({emp:{...s.emp, [i]:{...(s.emp[i]||{day:null,time:null,rev:0,booked:false}), ...patch}}})); }
empDay(i,di){ this.empSet(i,{day:di, time:null}); }
empTime(i,ti){ this.empSet(i,{time:ti}); }
empBook(i){ const st=this.empGet(i); if(st.day!=null && st.time!=null) this.empSet(i,{booked:true}); }
empReset(i){ this.empSet(i,{booked:false,day:null,time:null}); }
```

- **Entradas:** `i` (índice de profesional 0-6), `di` (índice de día 0-5), `ti` (índice de
  franja 0-5).
- **Salidas (derivadas en `PROTO:426-444`):** `days[]` con `active`/`idle`, `showTimes`,
  `times[]`, `canBook`/`notBook`, `booked`/`notBooked`, `bookLabel`, `confirmMsg`.

**Máquina de estados [V]:**

```
vacío ──empDay──> día elegido ──empTime──> día+hora ──empBook──> reservado
  ^                    │                       │                      │
  └────────────────────┴───────empReset────────┴──────────────────────┘
```

**Reglas verificadas:**

| # | Regla | Evidencia |
|---|---|---|
| B1 | Elegir día **resetea la hora** a `null` (evita franja obsoleta al cambiar de día) | `PROTO:400` [V] |
| B2 | Las franjas sólo se muestran con día elegido: `showTimes: st.day!=null` | `PROTO:434`, `PROTO:201` [V] |
| B3 | Sólo se puede reservar con día **y** hora: `has = st.day!=null && st.time!=null` | `PROTO:430`, `PROTO:403` [V] |
| B4 | **Uso correcto de `!=null`** en lugar de `!st.day`: el índice `0` es *falsy*, así que `!st.day` habría roto el día 0 y la franja de las 10:00. Está bien resuelto. | `PROTO:403`, `PROTO:430` [V] |
| B5 | `bookLabel` conmuta: `'Reservar · <dow> <day> · <hora>'` / `'Elige día y hora'` | `PROTO:438` [V] |
| B6 | `confirmMsg` exige `booked && has` → tras `empReset` vuelve a `''` | `PROTO:439` [V] |
| B7 | `canBook`/`notBook` y `booked`/`notBooked` son pares mutuamente excluyentes que gobiernan los `sc-if` | `PROTO:436-437` vs `PROTO:213,216,221,188` [V] |
| B8 | Estado **por profesional**, aislado en el mapa `emp` | `PROTO:399` [V] |

**Casos límite y defectos:**

| ID | Hallazgo | Gravedad | Evidencia |
|---|---|---|---|
| BOOK-1 | **No existe modelo de disponibilidad.** Los 6 `timeSlots` se ofrecen siempre, para toda profesional y todo día. Nada se marca como ocupado. | **Crítica** | `PROTO:435` [V] |
| BOOK-2 | **La reserva no sale del navegador.** `empBook` sólo hace `setState({booked:true})`. Cero red, cero persistencia. Un refresco lo borra todo. | **Crítica** | `PROTO:403` [V] |
| BOOK-3 | **La UI miente:** *"Te confirmaremos por WhatsApp"* (`PROTO:225`) sin que se envíe nada ni se pida teléfono. | **Crítica** (confianza/legal) | `PROTO:221-227` [V] |
| BOOK-4 | Sin duración de servicio: las franjas son fijas cada 90 min salvo el salto 13:00→16:00. Una manicura rusa y un tinte de pestañas ocupan lo mismo. | Alta | `DATA:71` vs `DATA:17-48` [V] |
| BOOK-5 | No se elige **servicio** al reservar con profesional: se reserva "con Lucía", sin decir a qué. La cita es inaccionable para el salón. | Alta | `PROTO:426-443` [V] |
| BOOK-6 | Las especialidades no filtran nada: Marta (`Depilación/Facial`, `DATA:67`) acepta igualmente una cita de uñas. | Media | `PROTO:435` [V] |
| BOOK-7 | Sin datos de contacto ni consentimiento RGPD en el flujo. | **Crítica** (legal) | ausencia en `PROTO:188-228` [V] |
| BOOK-8 | 7 tarjetas × 6 días × 6 horas = **84 botones** en la sección. Coste de navegación por teclado/lector de pantalla muy alto, sin `aria-pressed` ni agrupación. | Media | `PROTO:192-211` [V] |

**Nota de mutación:** `empBook` es un objetivo perfecto. Mutar `&&`→`||` o `!=null`→`!==undefined`
debe hacer fallar un test. Si no, el test es débil.

---

### 2.3 Composición del mensaje de WhatsApp — **NO EXISTE** [V]

**Hecho:** no hay lógica de composición. Los únicos dos enlaces son literales estáticos:

- `PROTO:255`: `<a href="https://wa.me/34600123456">WhatsApp</a>`
- `PROTO:311`: `<a href="https://wa.me/34600123456">Escríbenos por WhatsApp</a>`

Verificado por búsqueda: **0 coincidencias de `?text=`** en `PROTO`. El número
`34600123456` es de relleno y no coincide con ningún dato real del salón. Tampoco se
enlaza WhatsApp desde el resumen del chat ni desde la confirmación de reserva — es decir,
**los dos puntos donde el usuario acaba de dar sus datos no ofrecen ninguna salida**.

**Esto es una feature a construir.** Propuesta de contrato para el TDD:

```
componerMensajeWhatsApp(datos) -> URL
  entrada: { servicio, profesional?, dia, hora, nombre }
  salida:  https://wa.me/<E164_sin_+>?text=<encodeURIComponent(texto)>
  reglas:
    - número: código de país sin '+', sin ceros, sin espacios ni guiones
    - texto SIEMPRE encodeURIComponent (acentos, '·', emoji, saltos de línea)
    - campos ausentes se omiten, no imprimen 'undefined'
    - el nombre lo escribe el usuario: encodear, no concatenar en crudo
```

Sobre el formato oficial `https://wa.me/<numero>?text=<texto_urlencoded>` con el número
en código de país sin `+`/`-` y el texto URL-encoded: **[?] NO VERIFICADO contra la
fuente primaria.** Los artículos oficiales del WhatsApp Help Center
([How to use click to chat](https://faq.whatsapp.com/5913398998672934/)) se renderizan
con JS y devolvieron contenido truncado en cuatro intentos de fetch; la URL de Meta
`developers.facebook.com/docs/whatsapp/business-management-api/click-to-chat/` responde
**404**. El formato descrito procede del resumen del buscador sobre esa página oficial,
no de su cuerpo leído. **Verificar a mano antes de implementar** (ver §3).

**Casos límite a testear:** nombre con `&`, `#`, `?`, `+`, emoji o salto de línea (si no
se encodea, el mensaje se corta o la URL se rompe); nombre vacío; nombre larguísimo
(límite práctico de longitud de URL); dispositivo sin WhatsApp instalado.

---

### 2.4 Chat guiado (`chatFlow`)

**Datos (`DATA:112-117`):** 4 pasos.

| idx | `key` | `type` | Opciones / placeholder |
|---|---|---|---|
| 0 | `service` | `options` | Uñas · Facial · Depilación · **Pestañas** |
| 1 | `day` | `options` | Entre semana · Este fin de semana · Lo antes posible |
| 2 | `time` | `options` | Por la mañana · Por la tarde · Me es indiferente |
| 3 | `name` | `input` | `Escribe tu nombre…` |

**Lógica (`PROTO:406-411`):**

```js
summary(a){ return '¡Gracias, ' + a.name + '! ✨ Tu solicitud: ' + a.service + ' · ' + a.day + ' · ' + a.time + '. Te confirmaremos la hora exacta por WhatsApp en unos minutos. ¡Te esperamos en nails lash studio!'; }
chatPick(v){ ... const step=flow[c.idx]; c.msgs=[...c.msgs,{role:'user',text:v}]; c.answers={...c.answers,[step.key]:v}; const idx=c.idx+1; if(idx<flow.length){ c.idx=idx; c.msgs=[...c.msgs,{role:'bot',text:flow[idx].bot}]; } else { c.idx=idx; c.done=true; c.msgs=[...c.msgs,{role:'bot',text:this.summary(c.answers)}]; } ... }
chatSend(){ const v=(this.state.chat.draft||'').trim(); if(!v) return; this.setState(s=>({chat:{...s.chat,draft:''}}), ()=>this.chatPick(v)); }
chatKey(e){ if(e.key==='Enter'){ e.preventDefault(); this.chatSend(); } }
```

- **Entradas:** clic en opción (`chatOptions[].pick`, `PROTO:418`), texto libre + Enter/botón.
- **Salidas:** `chatMsgs[]` (con `isBot`/`isUser`, `PROTO:449`), `chatOptions[]`,
  `hasOptions`, `isInput`, `inputPlaceholder`, `chatDone`, `chatDraft` (`PROTO:449-453`).

**Reglas verificadas:**

| # | Regla | Evidencia |
|---|---|---|
| C1 | Arranca con el mensaje bot del paso 0 | `PROTO:378` [V] |
| C2 | `step` es `null` cuando `done` → sin opciones ni input; sólo "Reservar otra cita" | `PROTO:417`, `PROTO:284-286` [V] |
| C3 | Opciones sólo si `type==='options'`; input sólo si `type==='input'` | `PROTO:418`, `PROTO:451` [V] |
| C4 | Enviar **vacío o sólo espacios** no hace nada (`trim()` + `if(!v) return`) | `PROTO:408` [V] |
| C5 | Limpia el borrador y **luego** avanza, vía callback de `setState` (`SUPPORT:724` acepta `cb`) | `PROTO:408`, `SUPPORT:724-726` [V] |
| C6 | Enter hace `preventDefault()` y envía | `PROTO:409` [V] |
| C7 | Reinicio total al estado inicial | `PROTO:411` [V] |
| C8 | Tras 4 respuestas → `done:true` + resumen | `PROTO:407` [V] |
| C9 | Autoscroll del chat al fondo en cada update | `PROTO:391` [V] |

**Casos límite y defectos:**

| ID | Hallazgo | Gravedad | Evidencia |
|---|---|---|---|
| CHAT-1 | **No pide teléfono ni email**, pero promete confirmación por WhatsApp. El salón no puede responder. | **Crítica** | `DATA:112-117` vs `PROTO:406` [V] |
| CHAT-2 | **Las respuestas nunca salen del navegador.** No hay envío. La "solicitud" no llega a nadie. | **Crítica** | `PROTO:407` [V] |
| CHAT-3 | `chatPick` **no está guardada contra `done`**: si se invocase con `c.idx === flow.length`, `flow[c.idx]` es `undefined` y `step.key` lanza `TypeError`. Hoy es inalcanzable por UI (C2), pero es un bug latente que el TDD debe blindar. | Media | `PROTO:407` [V] |
| CHAT-4 | `'Este fin de semana'` incluye **domingo**, día en que el salón cierra (`DATA:103`) y que el propio calendario excluye (`PROTO:383`). Contradicción interna. | Media | [V] |
| CHAT-5 | `'Pestañas'` se ofrece como servicio en el chat pero **no existe como categoría** (`nav`/`categories` sólo tienen Uñas/Facial/Depilación); está dentro de Facial (`DATA:33`). | Baja | `DATA:113` vs `DATA:5-12` [V] |
| CHAT-6 | El día y la hora del chat son **vagos** ("Lo antes posible", "Me es indiferente"): no producen una cita concreta. Es captación de lead, no reserva. | Media (producto) | `DATA:114-115` [V] |
| CHAT-7 | `name` **sin validación**: sin longitud máxima, sin sanear. Se concatena en `summary` (`PROTO:406`). Como React escapa el texto, **no hay XSS aquí** [I], pero al construir el `?text=` de WhatsApp habrá que `encodeURIComponent`. | Media | [V]+[I] |
| CHAT-8 | `componentDidUpdate` fuerza `scrollTop=scrollHeight` **en cada actualización de estado**, no sólo en mensajes nuevos: elegir un color o abrir una FAQ arrastra el chat al fondo aunque el usuario lo hubiese subido para releer. | Media | `PROTO:391` [V] |
| CHAT-9 | Sin `aria-live` en el contenedor: un lector de pantalla no anuncia los mensajes nuevos. | Media (a11y) | `PROTO:264-269` [V] |
| CHAT-10 | Sin persistencia: refrescar borra la conversación. | Baja | [I] |
| CHAT-11 | *"en línea"* (`PROTO:262`) es un adorno estático: no hay presencia real. | Baja | [V] |

---

### 2.5 Rotación/selección de reseñas — **el bug matemático**

**Código (`PROTO:419`, `PROTO:429`, `PROTO:440`):**

```js
const rot=(i)=>{ const p=d.reviewPool, n=p.length, out=[]; for(let k=0;k<5;k++){ out.push(p[(i*2+k)%n]); } return out; };
const ri=((st.rev%5)+5)%5;
review:{ ...revs[ri], stars:'★★★★★' },
revPrev:()=>this.empRev(i,-1), revNext:()=>this.empRev(i,1),
```

Con `empRev(i,dir){ ... this.empSet(i,{rev:st.rev+dir}); }` (`PROTO:402`).

- **Entradas:** índice de profesional `i` (0-6), contador `rev` (entero sin límites, ±).
- **Salida:** `{author, text, stars}`.
- **Datos:** `reviewPool` con **n = 10** (`DATA:72-83`); `team` con **7** miembros (`DATA:62-70`).

**Reglas verificadas:**

| # | Regla | Evidencia |
|---|---|---|
| R-1 | Cada profesional recibe **5** reseñas, empezando en el índice `2i` del pool | `PROTO:419` [V] |
| R-2 | `((rev%5)+5)%5` normaliza correctamente los negativos. En JS el resto **toma el signo del dividendo** (`-13 % 5 === -3`), así que el `+5` y el segundo `%5` son necesarios y están bien puestos: con `rev=-1` → `((-1)+5)%5 = 4`. | [V, [MDN Remainder](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder): *"It always takes the sign of the dividend"*] |
| R-3 | `rev` no tiene tope: crece indefinidamente, pero `%5` lo acota. `revs[ri]` siempre existe. | `PROTO:402`, `PROTO:429` [V] |

**REV-1 — Reseñas duplicadas entre profesionales. [V] Gravedad: alta.**

Desarrollando `rot(i)` con `n=10`, índices del pool por profesional:

| i | Profesional (`DATA:63-69`) | Índices `(2i+k) % 10`, k=0..4 |
|---|---|---|
| 0 | Lucía | 0, 1, 2, 3, 4 |
| 1 | Carla | 2, 3, 4, 5, 6 |
| 2 | Andrea | 4, 5, 6, 7, 8 |
| 3 | Nerea | 6, 7, 8, 9, 0 |
| 4 | Marta | 8, 9, 0, 1, 2 |
| 5 | **Paula** | **0, 1, 2, 3, 4** ← idéntico a Lucía (`10 % 10 = 0`) |
| 6 | **Sara** | **2, 3, 4, 5, 6** ← idéntico a Carla (`12 % 10 = 2`) |

Consecuencias: **Paula y Lucía muestran exactamente el mismo conjunto de 5 reseñas**, y
lo mismo Sara y Carla. Además, cada par adyacente comparte **3 de 5**. La misma clienta
("María L.") aparece elogiando a varias profesionales distintas con el mismo texto —
visible a simple vista para cualquier visitante que compare dos tarjetas.

**REV-2 — Estrellas falsas. [V] Gravedad: alta (legal).** `stars` es la constante
`'★★★★★'` (`PROTO:440`): **todas** las reseñas muestran 5/5 pase lo que pase. No hay
campo de puntuación en `reviewPool` (`DATA:72-83`).

**REV-3 — Testimonios inventados. [V] Gravedad: crítica (legal).** Los 10 textos y
autoras son ficción de plantilla. Ver §4 (Ley 3/1991 art. 27.7 y 27.8).

**REV-4 — Números mágicos acoplados. [V] Gravedad: media.** `rot` fija `5` y `ri` fija
`%5`. Si `reviewPool` cambiara de tamaño, `rot` seguiría devolviendo 5; si alguien tocara
el `5` de `rot` sin tocar el de `ri`, se produciría `undefined` en `revs[ri]` →
`{...undefined}` no lanza, pero `review.text` sería `undefined` y se pintaría vacío.
Fallo **silencioso**. Objetivo de mutación de primer nivel.

**REV-5 — Sin `aria-label` en ←/→. [V]** `PROTO:236-237`: los botones sólo contienen las
flechas, sin nombre accesible.

---

### 2.6 Prueba de color

**Código (`PROTO:445-446`):**

```js
colors:d.colors.map((col,i)=>({ ...col, active:i===S.color, pick:()=>this.setState({color:i}) })),
activeColor:d.colors[S.color],
```

- **Entradas:** clic en uno de los 12 esmaltes (`DATA:84-91`).
- **Salidas:** `activeColor.name` (`PROTO:103`), `activeColor.hex` (`PROTO:104`), y el
  `background` de las 5 uñas (`PROTO:95-99`).
- **Reglas [V]:** selección única (`i===S.color`); por defecto índice `0` = "Rojo Carmín";
  el anillo de selección se dibuja con `sc-if value="{{ c.active }}"` (`PROTO:109-111`);
  `title="{{ c.name }}"` da tooltip (`PROTO:108`).

**Casos límite y defectos:**

| ID | Hallazgo | Gravedad | Evidencia |
|---|---|---|---|
| COL-1 | **No es una "prueba" real**: no hay foto ni cámara. Son 5 `<div>` con `border-radius` que cambian de `background`. El texto dice *"descúbrelo sobre las uñas"* (`PROTO:91`) — expectativa por encima de lo entregado. | Media (producto) | `PROTO:95-99` [V] |
| COL-2 | `activeColor` no está guardado: si `S.color` saliera de rango, `activeColor` sería `undefined` y `activeColor.hex` lanzaría. Hoy inalcanzable (los índices salen del propio array), pero frágil. | Baja | `PROTO:446` [V] |
| COL-3 | El color elegido **no viaja a la reserva**. El CTA *"Reservar con este tono"* (`PROTO:115`) es un ancla `#equipo` que no lleva el tono. La promesa del botón no se cumple. | Media | `PROTO:115` [V] |
| COL-4 | Botones **sin nombre accesible**: sólo `title`, sin texto ni `aria-label`. Y el estado activo se comunica **sólo por un anillo visual**, sin `aria-pressed`. | Media (a11y) | `PROTO:108-112` [V] |
| COL-5 | "Blanco Nácar" `#F2ECE4` (`DATA:90`) sobre `--surface:#FFFFFF` (`PROTO:28`): la uña queda casi invisible. | Baja | [I] |
| COL-6 | Los 12 tonos son inventados: **[?]** ¿son los esmaltes que el salón tiene de verdad? | Media | `DATA:84-91` [?] |

---

### 2.7 FAQ acordeón

**Código (`PROTO:447`):**

```js
faq:d.faq.map((f,i)=>({ ...f, open:S.faq===i, sign:S.faq===i?'–':'+', toggle:()=>this.setState(s=>({faq:s.faq===i?-1:i})) })),
```

- **Entradas:** clic en la cabecera (`PROTO:327`). **Salidas:** `open` (bool), `sign`, `q`, `a`.
- **Reglas [V]:**
  - Estado inicial `faq:-1` → **todas cerradas** (`PROTO:373`).
  - **Acordeón de apertura única**: abrir una cierra la anterior (asigna `i`, no acumula).
  - Toggle sobre la abierta → `-1` (se cierra). Es un interruptor real.
  - Signo: `–` (en dash U+2013) si abierta, `+` si cerrada (`PROTO:329`).
  - La respuesta se monta/desmonta con `sc-if` (`PROTO:331-333`), no se oculta con CSS.

| ID | Hallazgo | Gravedad | Evidencia |
|---|---|---|---|
| FAQ-1 | Sin `aria-expanded` ni `aria-controls`. Es un `<button>` real, así que **el teclado funciona** [I], pero el lector de pantalla no anuncia el estado. | Media (a11y) | `PROTO:327-330` [V] |
| FAQ-2 | Al usar `sc-if`, el contenido **no está en el DOM** cuando está cerrado → invisible para Ctrl+F y **para el rastreador de Google** [I]. Con `<details>` o CSS sí se indexaría. | Media (SEO) | `PROTO:331` [V] |
| FAQ-3 | Sin datos estructurados `FAQPage`. Oportunidad de rich snippet perdida. | Baja (SEO) | ausencia [V] |
| FAQ-4 | Las 6 preguntas prometen cosas de negocio no validadas: *"Efectivo, tarjeta y pagos por móvil"*, *"avisar con 24 h"* (`DATA:97-98`). **[?]** ¿Son las políticas reales? | Alta (negocio) | `DATA:92-99` [?] |

---

### 2.8 Navegación y scroll-spy — **el scroll-spy NO EXISTE** [V]

**Hecho:** búsqueda de `scroll` en `PROTO` → sólo `scroll-behavior:smooth` (`PROTO:16`),
`scroll-margin-top` en las secciones (`PROTO:40,61,86,121,139,162,248,292,320`) y el
autoscroll del chat (`PROTO:391`). **No hay JS de scroll-spy**: ningún enlace se resalta
según la sección visible. La navegación es puramente anclas HTML + CSS.

| ID | Hallazgo | Gravedad | Evidencia |
|---|---|---|---|
| NAV-1 | **4 secciones no están en el menú.** `nav` sólo lista `unas, facial, depilacion, destacados, ofertas, equipo` (`DATA:5-12`), pero existen además `#colores`, `#reserva`, `#contacto` y `#faq`. Son inalcanzables salvo haciendo scroll. | Alta (UX) | `DATA:5-12` vs `PROTO:86,248,292,320` [V] |
| NAV-2 | **Todos los CTA apuntan a `#equipo`**, nunca a `#reserva`. El chat sólo se encuentra por casualidad. | Media | `PROTO:36,53,76,115,155` [V] |
| NAV-3 | Sin scroll-spy: en una landing de una sola página, el usuario no sabe dónde está. | Media (UX) | [V] |
| NAV-4 | `scroll-margin-top` es fijo (66px / 70px en `#top`) pero la cabecera es `sticky` con `flex-wrap:wrap` (`PROTO:30`): al envolverse el menú en móvil crece, y el ancla aterriza **debajo** de la cabecera, tapando el título. | Media | `PROTO:30` vs `PROTO:61` [I] |
| NAV-5 | Sin menú hamburguesa: 7 elementos se envuelven en varias filas en móvil. | Media | `PROTO:32-37` [I] |
| NAV-6 | `scroll-behavior:smooth` incondicional, sin respetar `prefers-reduced-motion`. | Media (a11y) | `PROTO:16` [V] |
| NAV-7 | Un único `<h1>`… **no existe**: el hero usa `<span>` (`PROTO:44`) y todas las secciones son `<h2>`. **La página no tiene H1.** | Alta (SEO/a11y) | `PROTO:44,65,90,…` [V] |

---

### 2.9 Animación de pincel e IntersectionObserver

**Código (`PROTO:385-396`):**

```js
if('IntersectionObserver' in window && this._brush){
  this._io = new IntersectionObserver((es)=>{ es.forEach(e=>{ if(e.isIntersecting) this.replayBrush(); }); }, {threshold:0.35});
  this._io.observe(this._brush);
}
replayBrush(){
  const w=this._brush; if(!w) return;
  w.querySelectorAll('[data-anim]').forEach(el=>{ const a=el.getAttribute('data-anim'); el.style.animation='none'; void el.offsetWidth; el.style.animation=a; });
}
```

- **Entradas:** entrada en viewport al 35%; clic en "↺ Repetir" (`PROTO:55`).
- **Salida:** reinicio de las animaciones CSS de los 3 elementos `[data-anim]`
  (`PROTO:44`, `PROTO:45`, `PROTO:49`).
- **Reglas [V]:**
  - Detección de característica (`'IntersectionObserver' in window`) + guarda de ref.
  - `threshold:0.35` → el callback dispara al cruzar el 35% de intersección
    [V, [MDN IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver)].
  - Truco estándar de reinicio: `animation='none'` → **forzar reflow** con
    `void el.offsetWidth` → restaurar. Sin el reflow el navegador agrupa los cambios y no
    reinicia. Correcto.
  - La animación se declara **dos veces**: en `style` (para el arranque) y en `data-anim`
    (para el replay) — hay que mantenerlas sincronizadas a mano (`PROTO:44-45,49`).
  - `_io.disconnect()` en unmount (`PROTO:390`).

| ID | Hallazgo | Gravedad | Evidencia |
|---|---|---|---|
| ANIM-1 | **Sin `prefers-reduced-motion` en ningún sitio** (0 coincidencias en `PROTO`). Hay animación de 4,8 s en el hero, `fadeUp`, `bob` infinito y scroll suave. | **Alta** (a11y) | [V] |
| ANIM-2 | **Incumple WCAG 2.2.2 (Pause, Stop, Hide, nivel A).** El indicador "desliza" usa `animation:bob 2.4s ease-in-out infinite` (`PROTO:57`): arranca solo, dura más de 5 s (infinita) y convive con otro contenido, **sin mecanismo de pausa**. Texto normativo: *"For any moving, blinking or scrolling information that (1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or hide it…"* | **Alta** (a11y) | `PROTO:57` [V] + [W3C](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) |
| ANIM-3 | El pincel **se rebobina cada vez que reentra** al viewport: subir y bajar lo re-dispara sin fin. No hay flag de "ya reproducido". | Media | `PROTO:386` [V] |
| ANIM-4 | Al montar, si el hero ya está visible, el IO dispara y **reinicia una animación que el CSS acababa de arrancar** — se solapan el arranque por `style` y el replay. | Media | `PROTO:44-45` vs `PROTO:386` [I] |
| ANIM-5 | El texto principal de marca ("Nails Lash") tarda **5,3 s** en estar completo (`paintReveal 4.8s` con `.5s` de retardo) y "Studio" aparece a los **4,4 s** (`PROTO:49`). Impacto en LCP y en la primera impresión. | Alta (rendimiento/UX) | `PROTO:44,49` [V]+[I] |
| ANIM-6 | El nombre de la marca es un `<span>` animado, no un `<h1>` (ver NAV-7). Con CSS deshabilitado o durante `paintReveal`, el `clip-path` lo oculta. | Alta (SEO) | `PROTO:44` [V] |
| ANIM-7 | `brush.png` decorativo lleva `alt=""` — **correcto** (es el único `alt` del documento). | — | `PROTO:46` [V] |
| ANIM-8 | Si el IO falla o no existe, no hay fallback: la animación arranca igual por CSS. Degradación aceptable. | — | [I] |

---

### 2.10 Filtros — **NO EXISTEN** [V]

Búsqueda de `filter`/`filtro` en `PROTO`: sólo dos usos **de estilo** — `backdrop-filter:blur(14px)`
en la cabecera (`PROTO:30`) y `filter:drop-shadow(...)` en el pincel (`PROTO:46`).

**No hay ninguna lógica de filtrado**: ni por categoría, ni por profesional, ni por
servicio, ni por precio. Las listas se pintan enteras con `sc-for` sin predicado
(`PROTO:60,70,107,128,146,170,182,192,203,265,273,298,325`). Si el encargo esperaba
filtros, son **feature nueva**, no auditable aquí.

---

### 2.11 Accesibilidad y semántica (transversal, testeable)

| ID | Hallazgo | Evidencia |
|---|---|---|
| A11Y-1 | **Cero atributos ARIA en todo el documento.** La búsqueda de `aria-*` y `role=` sólo devuelve `PROTO:449`, que es `m.role==='bot'` en JS (el campo de datos, no ARIA). | [V] |
| A11Y-2 | **Un solo `alt`** en el documento (`PROTO:46`, vacío y correcto). Las fotos van por el custom element `<image-slot>` (`PROTO:79,173,315`) con atributo `placeholder`, **no `alt`** → foto de equipo y mapa sin texto alternativo. | [V] |
| A11Y-3 | Sin `<main>`, `<h1>`, `lang` en `<html>` (`PROTO:2` es `<html>` a secas) ni `<title>`. Web en español sin `lang="es"`. | [V] |
| A11Y-4 | Sin estilos `:focus-visible` en ningún botón. Con 84+ botones, la navegación por teclado es a ciegas. | [V] |
| A11Y-5 | Estados activos (día/hora/color) comunicados **sólo por color/borde**, sin `aria-pressed`. | `PROTO:194,205,109` [V] |
| A11Y-6 | Sin `<noscript>`: sin JS no hay absolutamente nada (todo el contenido lo inyecta el runtime). | [V]+[I] |

---

## 3. Lo que NO he podido verificar

| # | Afirmación / dato | Por qué no está verificado | Qué haría falta |
|---|---|---|---|
| 1 | Formato oficial `wa.me/<num>?text=<urlencoded>` y reglas del número | El Help Center de WhatsApp se renderiza con JS: 4 fetches devolvieron contenido truncado; la URL de Meta Business Management API da **404**. El formato lo tengo del **resumen** del buscador sobre la página oficial, no de su cuerpo. | Abrir a mano <https://faq.whatsapp.com/5913398998672934/> en navegador y copiar el texto; validar con un enlace real en Android + iOS + WhatsApp Web |
| 2 | ¿IntersectionObserver dispara callback inicial al llamar `observe()` aunque no intersecte? | La página de MDN consultada no lo especifica ("*does not specify whether an initial callback fires*") | Leer la [spec del W3C](https://www.w3.org/TR/intersection-observer/) o test empírico en navegador (afecta a ANIM-4) |
| 3 | **Todos** los datos de negocio: teléfono, dirección, precios, horarios, ofertas, nombres del equipo, esmaltes, FAQ | `DATA` es contenido de plantilla; la dirección (28010 Madrid, `DATA:106`) **contradice** el brief (Las Rozas de Madrid) | Entrevista con la propietaria + ficha fiscal + Google Business Profile |
| 4 | ¿El salón quiere reserva **real** (con agenda) o sólo captación de lead a WhatsApp? | Decisión de producto no tomada; el prototipo simula reserva sin backend | Decisión explícita del cliente. **Bloquea el Gherkin de §2.2** |
| 5 | ¿Usa ya un software de citas (Booksy, Treatwell, Fresha, Google Reservas)? | Sin información | Preguntar. Si lo usa, integrar/enlazar en vez de construir |
| 6 | Reseñas reales: ¿existen en Google? ¿se pueden citar? ¿hay consentimiento de las autoras? | El pool es ficticio (`DATA:72-83`) | Exportar reseñas reales de Google Business Profile o quitar la sección |
| 7 | Fotos: las `ph-woman0..6.png` son de relleno. ¿Hay fotos reales del equipo y consentimiento de imagen (RGPD)? | Son placeholders del prototipo (`PROTO:432`) | Sesión de fotos + cesión de derechos de imagen firmada |
| 8 | Datos identificativos para el aviso legal (denominación, NIF, domicilio, registro) | Ninguno en el prototipo | Documentación fiscal del negocio |
| 9 | Festivos aplicables (nacionales, Comunidad de Madrid, Las Rozas) y vacaciones | No modelados (CAL-6) | Calendario laboral oficial del año + cierre por vacaciones del salón |
| 10 | Duración real de cada servicio y capacidad simultánea del salón | No modelado (BOOK-4) | Entrevista con la propietaria |
| 11 | Si `Ley 3/1991 art. 27` es exactamente el aplicable a un salón B2C y su régimen sancionador | Verifiqué el **texto** de los apartados 27.7 y 27.8 en BOE, pero no el encaje sancionador completo ni la vía (competencia desleal vs. consumo autonómico) | Revisión por asesoría legal antes de publicar reseñas |
| 12 | Stack de destino (Astro/Next/HTML+JS), hosting y dominio | Fuera del prototipo; `harness.config.json` aún no fijado para este proyecto | Decisión de arquitectura (afecta al SSR/SEO de FAQ-2 y A11Y-6) |
| 13 | ¿Habrá mapa embebido (Google Maps)? Hoy es un PNG estático (`PROTO:315`) | Decisión no tomada | Si se embebe, exige gestión de consentimiento de cookies |

---

## 4. Impacto en el proyecto

### 4.1 Lo que EXIGE

**Bloqueantes de producto (antes de escribir Gherkin):**

1. **Decidir el modelo de reserva** (item 4 de §3). Tres caminos:
   - (a) **Lead honesto**: quitar la simulación; el botón compone un `?text=` de WhatsApp
     con lo elegido. Barato, honesto, sin backend, sin RGPD complejo. **Recomendado para v1** [I].
   - (b) **Integrar** el software de citas que ya use el salón.
   - (c) **Agenda propia**: backend, disponibilidad, festivos, notificaciones, RGPD. Caro.
   - Mientras no se decida, **§2.2 no se puede especificar**.
2. **Sustituir `DATA` entero** por datos verificados con la propietaria.
3. **Decidir qué hacer con las reseñas**: reales (con origen demostrable) o fuera.

**Exigencias legales verificadas:**

- **Aviso legal (LSSI-CE).** La **Ley 34/2002, art. 10** obliga al prestador a facilitar
  *"de forma permanente, fácil, directa y gratuita"* su *"nombre o denominación social; su
  residencia o domicilio…"*, el *"número de identificación fiscal"*, correo electrónico e
  información clara de precios e impuestos.
  [V, [BOE-A-2002-13758 art. 10](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758&p=20220101&tn=1#a10)].
  → **El prototipo no tiene ni aviso legal ni política de privacidad ni de cookies**: el
  pie sólo lleva *"© 2026 nails lash studio · Plantilla de demostración"* (`PROTO:366`).
  **Feature obligatoria.**
- **Reseñas.** La **Ley 3/1991 de Competencia Desleal, art. 27.7 y 27.8** prohíbe
  *"Afirmen que las reseñas de un bien o servicio son añadidas por consumidores y usuarios
  que han utilizado o adquirido realmente el bien o servicio, sin tomar medidas razonables
  y proporcionadas para comprobar que dichas reseñas pertenezcan a tales consumidores y
  usuarios"* y *"Añadan o encarguen a otra persona … que incluya reseñas o aprobaciones de
  consumidores falsas, o distorsionen reseñas…"*
  [V, [BOE-A-1991-628](https://www.boe.es/buscar/act.php?id=BOE-A-1991-628)].
  → El `reviewPool` ficticio + `'★★★★★'` fijo + duplicación entre profesionales (REV-1/2/3)
  **no puede publicarse**. Encaje sancionador concreto: pendiente de asesoría (§3, item 11).
- **WCAG 2.2.2 (nivel A)**: ANIM-2 es un incumplimiento verificado que hay que corregir.

**Exigencias técnicas (para que el TDD sea posible):**

- **Reloj inyectable.** `new Date()` (`PROTO:382`) hace CAL-3/CAL-4 intestables.
  Contrato: `generarDias(ahora, opciones)` puro. Sin esto no hay mutation testing serio.
- **Zona horaria `Europe/Madrid`** explícita, no la del cliente (CAL-4).
- **Separar lógica de vista.** `renderVals()` (`PROTO:413-458`) ya apunta a la forma
  correcta: estado → objeto plano. Extraer como módulos puros:
  `generarDias`, `rotarReseñas`, `maquinaReserva`, `maquinaChat`, `componerMensajeWhatsApp`.
- **Escapado/encoding** en la frontera de WhatsApp: `encodeURIComponent` obligatorio (CHAT-7).

### 4.2 Lo que PROHÍBE

| # | Prohibición | Motivo |
|---|---|---|
| 1 | **Publicar el prototipo tal cual, ni "adaptarlo"** | Runtime propietario con `new Function` (`SUPPORT:741-750`), errores silenciados (`SUPPORT:894-898`), `sc-for`/`sc-if`/`x-dc` no estándar |
| 2 | **Copiar `salon-data.js` a producción** | Todo es relleno; dirección contradice el brief (§3, item 3) |
| 3 | **Publicar las reseñas y las estrellas del prototipo** | Ley 3/1991 art. 27.7/27.8 [V] |
| 4 | **Mantener "Te confirmaremos por WhatsApp"** (`PROTO:225`, `PROTO:406`) sin canal real | Promesa incumplible: nada se envía y no se pide teléfono (BOOK-2/3, CHAT-1/2) |
| 5 | **Reutilizar los teléfonos `+34 600 123 456` / `wa.me/34600123456`** | Números de relleno (`PROTO:255,256,308,311,359`; `DATA:107-108`) |
| 6 | **Dejar el pie "Plantilla de demostración"** (`PROTO:366`) y sin enlaces legales | LSSI-CE art. 10 [V] |
| 7 | **Ofrecer franjas de tarde en sábado** | Cierra a las 15:00 (CAL-1) |
| 8 | **Animaciones sin `prefers-reduced-motion` ni pausa** | WCAG 2.2.2 [V] (ANIM-1/2) |
| 9 | **Recoger nombre (o teléfono) sin base legal ni política de privacidad** | RGPD (BOOK-7) |
| 10 | **Usar las fotos `ph-woman*.png` como si fuese el equipo real** | Personas inventadas como plantilla de un negocio real |

### 4.3 Features que implica (candidatas a `feature_list.json`)

Ordenadas por dependencia. `sdd:true` = requiere conversación de spec + Gherkin.

| # | Feature | `sdd` | Origen |
|---|---|---|---|
| F-01 | **Datos reales del salón** (fuente única verificada: contacto, horario, precios, equipo) | sí | §3 items 3, 8 |
| F-02 | **Aviso legal + Privacidad + Cookies** | sí | LSSI-CE art. 10 [V] |
| F-03 | **`generarDias(ahora, tz, festivos)`** — puro, reloj inyectable, `Europe/Madrid`, sin domingos ni festivos, recálculo al cruzar medianoche | sí | CAL-1..CAL-8 |
| F-04 | **`franjasDisponibles(dia, horario, duracionServicio)`** — nada fuera de horario (mata CAL-1/BOOK-4) | sí | CAL-1, BOOK-4 |
| F-05 | **Máquina de reserva** (día → hora → confirmar → reset), invariantes B1-B7 preservados | sí | §2.2 |
| F-06 | **`componerMensajeWhatsApp(datos)`** con `encodeURIComponent` — **feature nueva** | sí | §2.3 |
| F-07 | **Chat guiado v2**: + paso de teléfono, guarda contra `done` (CHAT-3), coherencia domingo (CHAT-4), `aria-live`, autoscroll sólo con mensaje nuevo (CHAT-8) | sí | §2.4 |
| F-08 | **Envío real del lead** (WhatsApp prellenado o formulario + consentimiento RGPD) | sí | BOOK-2/3, CHAT-1/2 |
| F-09 | **Reseñas honestas**: origen real, puntuación como dato (no `'★★★★★'` fijo), **sin duplicar entre profesionales** (mata REV-1/2/3) | sí | §2.5 + Ley 3/1991 |
| F-10 | **Prueba de color** con nombre/hex y estado accesible; decidir si se mantiene la promesa "sobre las uñas" y si el tono viaja al mensaje (COL-3) | sí | §2.6 |
| F-11 | **FAQ acordeón accesible**: `aria-expanded`, contenido indexable (FAQ-2), `FAQPage` JSON-LD | no | §2.7 |
| F-12 | **Navegación**: menú móvil, todas las secciones enlazadas (NAV-1), scroll-spy (**nuevo**), offset dinámico (NAV-4) | no | §2.8 |
| F-13 | **Animación de marca**: `prefers-reduced-motion`, pausa para `bob` (WCAG 2.2.2), reproducir una sola vez (ANIM-3), acortar por LCP (ANIM-5) | no | §2.9 |
| F-14 | **Base semántica/SEO/a11y**: `lang="es"`, `<title>`, `<main>`, un `<h1>` real, `alt` en fotos, `:focus-visible` | no | §2.11 |
| F-15 | **Estado de carga y error de datos** (hoy: pantalla muerta silenciosa) | no | §2.0 |
| F-16 | Filtros — **sólo si el cliente los pide**; no existen hoy | ? | §2.10 |

### 4.4 Riesgo de mutación (dónde los tests serán débiles)

Objetivos prioritarios para `bin/harness mutate`, porque hoy fallarían en silencio:

1. `empBook`: `st.day!=null && st.time!=null` → mutar `&&`↔`||`, `!=null`↔`!==undefined`
   (`PROTO:403`). Debe romper un test.
2. `((st.rev%5)+5)%5` → quitar el `+5` rompe sólo con `rev` negativo: **exige un test que
   pulse "←" desde 0** (`PROTO:429`).
3. `getDay()!==0` → mutar a `!==6` o `===0` debe romper el test del domingo (`PROTO:383`).
4. `days.length<6` → mutar a `<=6`/`<5` (`PROTO:383`).
5. `rot`: el `5` y el `%n` (`PROTO:419`) — REV-4 demuestra que un cambio aquí no lanza,
   sólo pinta vacío. Necesita aserción sobre el contenido, no sobre "no explota".
6. `idx<flow.length` en `chatPick` → mutar a `<=` provoca el `TypeError` de CHAT-3
   (`PROTO:407`).
7. `if(!v) return` en `chatSend` (`PROTO:408`) — test de envío en blanco y sólo espacios.

---

## Apéndice — Fuentes oficiales consultadas

| Fuente | Uso |
|---|---|
| [MDN — `Date.prototype.getDay()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay) | 0 = domingo (regla R2) |
| [MDN — `Date.prototype.setDate()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setDate) | Desbordamiento de mes/año (regla R4) |
| [MDN — Remainder `%`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder) | Signo del dividendo (regla R-2) |
| [MDN — `IntersectionObserver()`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver) | Semántica de `threshold` (§2.9) |
| [W3C — Understanding SC 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | ANIM-2 |
| [BOE — Ley 34/2002 (LSSI-CE), art. 10](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758&p=20220101&tn=1#a10) | Aviso legal (F-02) |
| [BOE — Ley 3/1991 de Competencia Desleal, art. 27.7 y 27.8](https://www.boe.es/buscar/act.php?id=BOE-A-1991-628) | Reseñas falsas (F-09) |
| [WhatsApp Help Center — How to use click to chat](https://faq.whatsapp.com/5913398998672934/) | **NO VERIFICADO** (§3, item 1) |
