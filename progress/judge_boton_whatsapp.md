# Review - feature boton flotante de WhatsApp (rebanada de F-13)

**Veredicto:** CHANGES_REQUESTED

Contrato: features/boton_whatsapp_flotante.feature (14 escenarios).
Diario: progress/tdd_boton_whatsapp.md.
Suite: 883/883 verdes (full run), 37/37 de esta feature. tsc --noEmit exit 0, eslint . exit 0
(3 warnings ajenos en Equipo.tsx, ninguno en esta feature). NINGUN test rojo.

## Cobertura de escenarios (@s vs test)
- @s1: [x] boton-whatsapp.test.tsx:30-51 - href horneado contiene 34625223366 y el text urlencoded,
  literales A MANO; sin 625 22 33 66 ni coma/espacio crudos. Host NO aseverado.
- @s2: [x] boton-whatsapp.test.tsx:53-80 - bytes del .tsx: sin numero/host; con waHref e import de
  TELEFONO de ../lib/site; sin el texto literal. Ancla positiva presente.
- @s3: [x] boton-whatsapp.test.tsx:82-97 - un solo role=link con nombre accesible exacto; svg inline
  aria-hidden/focusable=false; sin img.
- @s4: [ ] SIN NINGUN TEST. El montaje es correcto en src/pages/home.tsx:136-138 (hermano de
  Pie, fuera del cierre de main linea 130, fuera de Contacto linea 126), pero NINGUN test lo fija:
  whatsapp-flotante NO aparece en src/pages/home-horneado.test.ts (grep confirmado). El diario lo
  declara DIFERIDO build+montaje pero el test nunca se escribio.
- @s5: [~] puertas 1 y 3 cubiertas in-process (test.tsx:99-110 a-no-section sin aria-labelledby;
  estilos.test.ts:81-93 sin color/background y MINIMO_DE_PARES===18). Exit-code del build NO testeado.
- @s6: [~] subrecursos cubiertos in-process (test.tsx:112-137; estilos.test.ts:95-106 sin url ni
  font-face + ancla .flotante). Exit-code del build NO testeado en repo.
- @s7: [x] estilos.test.ts:108-136 - position:fixed, bottom/right mayores que 0, sin left/top/inset:0,
  z-index numerico.
- @s8: [x] estilos.test.ts:138-161 - sin width 100%/100vw/inset:0; width/height acotados a 5rem.
  PROXY declarado (no mide F110); tab-through queda como verificacion manual.
- @s9: [x] estilos.test.ts:163-191 - width/height/min-height 3.5rem=56px, 44px o mas; SC 2.5.8
  (24x24 normativo) separado de la decision de proyecto (44x44).
- @s10: [x] estilos.test.ts:193-223 - focus-visible outline mayor que 0 + offset; media reduce con
  transition:none y animation:none; .tsx sin style/transicion/animacion inline.
- @s11: [x] test.tsx:139-153 - bytes del .tsx sin condicionales; ancla positiva export function
  BotonWhatsApp. NO-MUTABLE declarado.
- @s12: [~] instancia unica EN EL COMPONENTE cubierta (test.tsx:155-170) + sin onclick/data-href.
  El conteo global (exactamente 1 en TODO el documento) NO esta testeado: un doble montaje dentro
  de Contacto NO se cazaria.
- @s13: [x] test.tsx:172-189 - constante no vacia y mayor de 10 chars; href con text; docblock
  ENVIA el usuario (contacto-demo.ts:8-16).
- @s14: [x] test.tsx:191-210 - mensaje generico FIJO; sin servicio/fecha/hora/profesional; sin form.

## Los 9 controles duros encargados
1. Cada @sN tiene test -> NO: @s4 sin ningun test (bloqueante). @s5/@s6/@s12 con cobertura PARCIAL
   (falta build-exit-code y conteo global).
2. href DERIVA de waHref, sin numero/host hardcodeado -> OK. BotonWhatsApp.tsx:23 usa
   waHref(TELEFONO.legible, BOTON_WHATSAPP_FLOTANTE_TEXTO). @s2 prueba que la fuente no hornea el
   numero ni el host. NO bloqueante.
3. Ningun test asevera el HOST -> OK. Las unicas menciones a wa.me/api.whatsapp.com/whatsapp.com son
   NEGATIVAS sobre los bytes del .tsx (test.tsx:62-68, @s2): prohiben que aparezca, no lo aseveran.
   No hay ninguna asercion positiva del host. NO bloqueante.
4. Icono SVG inline aria-hidden, sin img src -> OK. BotonWhatsApp.tsx:26 svg aria-hidden=true
   focusable=false. @s3/@s6 lo verifican.
5. Nombre accesible -> OK. aria-label Abrir chat de WhatsApp con Nails Lash Studio
   (BotonWhatsApp.tsx:24), literal a mano en @s3.
6. SC 2.4.11 / F110 con valores REALES del SCSS -> boton position:fixed; right:1.25rem; bottom:1.25rem;
   z-index:1000; width/height:3.5rem (56x56px, esquina inferior derecha, por encima del contenido).
   NO puede tapar por completo un elemento a ancho de pagina, PERO SI podria tapar por completo un
   objetivo pequeno situado justo bajo la esquina (p. ej. el ultimo enlace del pie). El @s8 lo trata
   con honestidad: PROXY sobre bytes + verificacion manual con tabulador declarada. Correcto, pero la
   verificacion manual sigue PENDIENTE de registrar (puerta humana).
7. Area 44x44 o mas -> OK. 3.5rem = 56px en width/height/min-height (@s9).
8. Transiciones anuladas con prefers-reduced-motion -> OK. boton-whatsapp.module.scss:52-57 anula
   transition y animation bajo media prefers-reduced-motion reduce; sin estilo inline en el .tsx
   (@s10, leccion de F-07 respetada).
9. Montado FUERA de main y de Contacto -> montaje FISICO correcto (home.tsx:136-138), pero SIN test
   que lo pinne (ver @s4).

## Disciplina TDD
- Produccion sin test que la pida? NO. Componente a estatico; cada atributo lo exige un test
  (id/href @s1/@s12, aria-label @s3, svg @s3/@s6, .flotante posicion/foco @s7/@s9/@s10). El color via
  .demo-btn--wa global no se asevera por clase (css:false); el .module.scss sin color/background fuerza
  que venga de la utilidad global (@s5). Aceptado por contrato.
- Evidencia Rojo->Verde->Refactor? SI. tdd_boton_whatsapp.md:66-71 documenta sabotaje reversible:
  aria-label a Otra cosa => @s3 rojo; width/height 3.5rem a 1rem => @s9 rojo x2; restaurado -> 37/37
  verde. Anclas positivas presentes (no verde por vacuidad).

## Calidad (lente de artesano)
- BotonWhatsApp.tsx: funcion corta, un solo motivo de cambio, docblock que cita la feature, export
  nombrado, ID_BOTON_WHATSAPP como const arriba. Sin numeros magicos. Bien.
- boton-whatsapp.module.scss: solo posicion/forma/foco; icono dimensionado en selector aparte para que
  el cuerpo .flotante describa SOLO el objetivo tactil. Bien.
- Anti-tautologia respetada: literales a mano, MINIMO_DE_PARES importado como SUJETO y comparado contra
  18 escrito a mano.

## Checkpoints
- C1 (arnes/init): [x] typecheck 0, lint 0 (warnings ajenos), 883 tests verdes.
- C2 (estado coherente): [x] feature es rebanada de F-13, sin entrada propia en feature_list.json.
- C3 (arquitectura): [x] componente encaja, sin dependencias nuevas.
- C4 (verificacion real): [x] tests por modulo, aislamiento por readFileSync sobre fuentes reales.
- C5 (sesion cerrada): [ ] pendiente el test de integracion @s4 + verificaciones manuales.
- C6 (contrato Gherkin): [ ] @s4 SIN test -> falla cada escenario cubierto por al menos un test.
- C7 (mutacion): [ ] corre despues de la aprobacion; feature declarada NO-MUTABLE (@s11).

## Cambios requeridos
1. (Bloqueante) @s4 sin ningun test. Anadir un test sobre el HTML prerenderizado de la home (patron
   home-horneado.test.ts / SSR de Home): (a) el documento contiene el cierre de main e id
   whatsapp-flotante; (b) el indice del enlace es MAYOR que el del cierre de main; (c) la seccion
   contacto extraida contiene tel:+34625223366 y NO contiene id whatsapp-flotante. Hoy el montaje es
   correcto (home.tsx:136-138) pero una regresion que lo mueva a main/Contacto, lo duplique o lo
   elimine pasaria verde.
2. (Mayor) @s12 conteo global. Aseverar que id whatsapp-flotante aparece EXACTAMENTE 1 vez en TODO el
   documento prerenderizado (no solo en el render aislado del componente), para cazar un doble montaje.
3. (Mayor) @s5/@s6 exit-code del build. Registrar codigoSalida 0 de pnpm build con las 5 puertas (o
   declarar formalmente que fase lo cubre) antes de dar la feature por cerrada.
4. (Menor) Verificaciones manuales del contrato aun pendientes de registro en progress/: recorrido con
   tabulador (SC 2.4.11/F110, ultimos enlaces del pie bajo la esquina inferior derecha), apertura real
   en Android/iOS/WhatsApp Web (host wa.me, A-10), carga con JS deshabilitado y a 320px.

Nota: los dos controles marcados como BLOQUEANTES por el encargo (hardcodear numero/host; aseverar el
host) NO se disparan: el href deriva de waHref y ningun test asevera el host. El rechazo se debe
exclusivamente a la cobertura de escenarios (@s4) exigida por la regla dura del juez.
