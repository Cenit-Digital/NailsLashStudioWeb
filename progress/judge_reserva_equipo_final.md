# Review - reserva restaurada + monograma equipo

**Veredicto:** APPROVED

Nota de metodo: por instruccion explicita del lead (mutation_tester corriendo en paralelo) NO se
ejecuto bin/harness init ni pnpm build/test/stryker en esta revision. Se confirma por lectura de
codigo/tests/diff y se toman como dadas las metricas ya medidas por el lead: typecheck 0, lint 0/0,
pnpm build exit 0 (5 puertas), pnpm test 943/943.

## A) Fidelidad al diseno (#reserva)

Comparado caracter a caracter contra Opcion-1-Rosa.dc.html L251-253:
- eyebrow "Reserva rapida" -- VERBATIM (Reserva.tsx:97).
- h2 "Prefieres reservar por chat?" -- VERBATIM, id reserva-titulo intacto (Reserva.tsx:98-100).
- parrafo "Elige servicio, dia y franja horaria con nuestro asistente y te confirmamos la hora exacta por WhatsApp." -- VERBATIM (Reserva.tsx:101-104).
- Enlaces "WhatsApp" / "Llamar al estudio", en ese orden -- VERBATIM (L255-256 del prototipo).
El telefono falso 34600123456 / +34600123456 del prototipo NO se copia: ambos href derivan de
TELEFONO.legible (F-02) via waHref/telHref. Confirmado por grep: cero apariciones de 600123456 en
Reserva.tsx, reserva-logica.ts, lib/demo/reserva-demo.ts.

## B) Alcance

git diff --stat toca exactamente: features/reserva_chat.feature, features/equipo_reservas.feature,
src/components/Reserva.tsx, Equipo.tsx, equipo-logica.ts, equipo.module.scss, equipo.test.tsx,
equipo-estilos.test.ts, reserva.module.scss, mas los nuevos reserva-logica.ts, reserva.test.tsx,
lib/demo/reserva-demo.ts. Confirmado con git status:
- src/pages/home.tsx y src/components/Galeria.tsx NO aparecen en el diff (galeria intacta).
- stryker.config.json y vitest.config.ts NO tocados en esta sesion.

## C) Trazabilidad @s <-> test

### reserva_chat.feature (22 escenarios, todos en src/components/reserva.test.tsx salvo lo dicho)
- @s1 [x] 3 tests (section/h2, eyebrow+parrafo, sin h1/sin copy viejo)
- @s2 [x] 3 tests (2 links exactos, texto=nombre accesible, sin target=_blank)
- @s3 [x] href WA contiene E.164 sin "+" y texto urlencoded a mano; NO asevera host (A-10 respetado)
- @s4 [x] guarda de FUENTE sobre bytes de Reserva.tsx (ancla positiva + 8 negativas)
- @s5 [x] href tel exacto tel:+34625223366
- @s6 [x] 2 tests: post-hidratacion sin aria-pressed/rotulos/horas + bytes sin DOW/HORAS/diaIdx/horaIdx
- @s7 [x] describe propio: selectores vivos, selectores muertos, sin url()/@font-face
- @s8..@s20 [x] uno a uno, verificados por lectura directa del test (no solo por el mapa del tdd)
- @s21 [x] cubierto por los tests build-based YA existentes del repo (puertas globales; el h2 cambia de texto pero no de id ni el conjunto de anclas)
- @s22 [x] 3 tests (mensaje fijo sin datos dinamicos, bytes sin fetch/XHR/location, fetch espiado no se llama)

Ningun @s queda sin test concreto.

### equipo_reservas.feature, ampliacion @s26-@s31 (equipo.test.tsx / equipo-estilos.test.ts)
- @s26 [x] 7 tests (uno por profesional, monograma unico + una sola letra)
- @s27 [x] 4 filas por valor (inicialDe), incluida "angela"->"A con tilde" y "lucia"->"L"
- @s28 [x] caso vacio: no lanza, devuelve cadena vacia, no "undefined"/"U"
- @s29 [x] decorativo: sin rol/nombre accesible, h3 sigue diciendo "Lucia", 1 h2 + 7 h3
- @s30 [x] SSR: 7 letras en orden L,C,A,N,M,P,S, todas distintas, ancla positiva primero
- @s31 [x] 2 tests: sin ph-woman/img/src/url externa; SCSS reutiliza --accent-dark/--accent-soft (par ya en la matriz, MINIMO_DE_PARES no se toca)

## D) Anti-tautologia -- el punto mas importante

Revisados literal por literal: los 4 mensajes del bot, las 9 opciones del guion, el resumen completo,
"34625223366", "tel:+34625223366", la cadena urlencoded, los 7 nombres/iniciales, van escritos A MANO
en los tests. Ningun test importa TELEFONO, waHref, telHref, FLUJO_CHAT, RESERVA_WHATSAPP_TEXTO ni
EQUIPO_DEMO como valor esperado. No se usa toHaveClass en ningun caso nuevo. No encontre ningun
expect que pasara igual revirtiendo la implementacion: cada asercion de literal-a-mano tiene su
contraparte negativa (p. ej. @s4 prueba ausencia de los literales prohibidos, @s6 prueba ausencia de
restos del calendario por BYTES, no solo por DOM).

## E) Regresion del mini-calendario

reserva.module.scss: .paso, .pasoTitulo, .chip, .chipActivo, .dia, .diaActivo, .diaDow, .diaNum,
.cargando, .deshabilitado -- eliminados (confirmado por lectura completa del fichero resultante).
Todo estilos.X referenciado en Reserva.tsx (reserva, rejilla, acciones, chat, chatCabecera, avatar,
chatNombre, enLinea, hilo, burbujaBot/Usuario, chatPie, opciones, chipChat, entrada, reiniciar) existe
en el .scss. Cero huerfanas en ambos sentidos.

## F) Fuente unica (F-02)

grep de 600123456 / wa.me / api.whatsapp.com sobre los 5 ficheros nuevos/tocados: 0 resultados. El
host solo vive en src/lib/site.ts (no tocado, A-10 respetado).

## G) Mutabilidad

stryker.config.json no fue tocado en esta sesion (confirmado): Equipo.tsx/equipo-logica.ts YA estaban
en mutate; Reserva.tsx/reserva-logica.ts siguen FUERA (declarado y justificado: sesion con prohibido
tocar stryker.config.json). Equipo.tsx: el diff de esta sesion SOLO anade
<span className={estilos.monograma}> (className fijo, no condicional) -- ningun className
condicional nuevo. Nota no bloqueante: el ternario preexistente estilos.dia/estilos.diaActivo
(Equipo.tsx:111, chip de dia) NO es de este diff, pero conviene vigilarlo en la ronda de mutacion en
curso (mismo patron que hizo sobrevivir 3 mutantes en el chip de hora antes de su rediseno, segun
progress/mutation_equipo.md).

## H) El chat sigue entero

4 pasos (@s12, outline completo), Enter (@s16), envio vacio/solo-espacios ignorado (@s14, 2 filas),
reinicio (@s17), scroll al ultimo mensaje con scrollHeight fijado a mano (@s18). Los 5 estados del
reinicio (mensajes, paso, borrador, hecho, respuestas) se verifican indirectamente por el conteo
exacto de burbujas tras "Reservar otra cita".

## Disciplina TDD

- Produccion sin test que la pida? NO. claveBurbuja e inicialDe nacen de tests @s19/@s26-28; el resto
  del chat es codigo YA vivo, cubierto ahora por tests nuevos sin tocar produccion (Ley 3).
- Evidencia de Rojo->Verde->Refactor? SI, documentada en progress/tdd_reserva_equipo_final.md (ciclos
  numerados para @s8, @s19, inicialDe, monograma). progress/tdd_reserva_restaurada.md es un borrador
  previo interrumpido (log de ciclos vacio) -- housekeeping menor, no defecto: no contradice al
  fichero final, que es el que cierra la sesion.

## Observaciones no bloqueantes (para el lead, no cambian este veredicto de diseno/cobertura)

1. D1 sin resolver (features/reserva_chat.feature, la decision que el propio contrato marca como "LA
   MAS SERIA, Y ES DE HONESTIDAD"): ni se anadio @s23 (leyenda "asistente de demostracion") ni se
   registro un rechazo por escrito. La cabecera del fichero sigue diciendo "Estado: PROPUESTA hasta
   la puerta humana". No bloquea el demo interno que pidio Pablo, pero si el fichero se cierra en
   feature_list.json sin resolver D1/D3/D6, la puerta humana sobre el contrato queda pendiente.
2. C7 no evaluable todavia para #reserva: Reserva.tsx/reserva-logica.ts no estan en
   stryker.config.json -> mutate (decision de sesion, declarada). Hasta que entren, esta feature no
   puede alcanzar mutacion 100% aunque el resto de puertas pasen.
3. Artefactos de test consolidados en un unico reserva.test.tsx en vez de los 3 ficheros que el
   contrato nombraba (reserva.test.tsx / reserva-estilos.test.ts / reserva-fuente.test.ts) --
   organizacion, no cobertura: todos los @s estan cubiertos igual.

## Checkpoints

- C1 (arnes completo): [x] sin cambios de infraestructura en este diff
- C2 (estado coherente): [x] feature_list.json mantiene una sola in_progress (12, contacto); este
  trabajo es fuera de banda tipo DEMO, mismo patron que sesiones previas del repo
- C3 (arquitectura): [x] sin dependencias nuevas, capas respetadas (logica pura en -logica.ts)
- C4 (verificacion real): [x] un test por modulo tocado; nada de mocks de FS
- C5 (cierre de sesion): [ ] N/A, sesion en curso (no aplica a esta revision parcial)
- C6 (contrato Gherkin): [x] cobertura @s<->test completa en ambos ficheros; [ ] puerta humana formal
  sobre el .feature de reserva sigue sin cerrar (D1/D3/D6 abiertas, ver observacion 1)
- C7 (mutacion): [ ] pendiente -- equipo en curso (mutation_tester), reserva fuera de mutate aun

## Cambios requeridos (si aplica)

Ninguno bloqueante para esta revision de diseno/cobertura/calidad. Para cerrar la feature de verdad,
el lead deberia: (a) llevar D1/D3/D6/D8 a la puerta humana con Pablo y dejarlo por escrito en el
.feature; (b) programar una sesion que anada Reserva.tsx/reserva-logica.ts a mutate y cierre los
supervivientes que aparezcan.
