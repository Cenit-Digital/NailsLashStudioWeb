# Review v2 — feature boton_whatsapp_flotante (rebanada de F-13)

**Veredicto:** APPROVED

Re-review tras la correccion del UNICO bloqueante de v1 (progress/judge_boton_whatsapp.md:
CHANGES_REQUESTED por «@s4 sin test»). Se re-verifican los 3 puntos encargados y se
reconfirma que no hay regresion en el resto del contrato.

Suite: `pnpm test` -> 31 files, 889 tests, 889 passed. `tsc --noEmit` exit 0.
`eslint` (ficheros de la feature + home.tsx) exit 0. Sin tests rojos. El flaky F-10
(home-horneado.test.ts @s14, contencion de `pnpm build` en Windows) NO aparecio en esta
corrida (paso dentro de la suite completa); queda CLASIFICADO como ajeno y no bloqueante.

Feature aislada: boton-whatsapp-montaje.test.tsx + boton-whatsapp.test.tsx +
boton-whatsapp-estilos.test.ts -> 40/40 verde.

## 1) @s4 — bloqueante de v1: RESUELTO
Test real y determinista NUEVO: src/pages/boton-whatsapp-montaje.test.tsx
(describe('@s4 ...'), 3 it, lineas 49-71):
- ANCLA POSITIVA PRIMERO (53-54): el prerender de <Home/> SI contiene "</main>" y
  'id="whatsapp-flotante"' -> la comparacion de indices no se hace contra -1.
- ORDEN (62): indexOf(id) > indexOf("</main>") -> el boton vive FUERA del landmark
  principal. Coincide con el montaje fisico home.tsx:138 (hermano de <Pie/>, tras el
  "</main>" de la linea 130).
- FUERA DE #contacto (65-70): la seccion extraida por regex aria-labelledby="contacto-titulo"
  SI trae href="tel:+34625223366" (ancla positiva anti-vacuidad: si la extraccion diera ''
  el test cae) y NO trae id="whatsapp-flotante" -> flotante y CTA de #contacto son enlaces
  distintos.
- Determinismo: renderToString(<HelmetProvider><Home/></HelmetProvider>), EL MISMO mecanismo
  del prerender SSG (v1 listo explicitamente «SSR de Home» como via aceptable), sin
  timing/red. Verificado verde 2x (run de 3 ficheros + suite completa).
- Anti-tautologia: literales A MANO; NO importa el id de BotonWhatsApp ni TELEFONO.
- Anti-vacuidad: anclas positivas PRIMERO. Rojo->Verde acreditado por sabotaje reversible
  (correccion_puertas.md:54-62: mover el boton dentro de <main> puso ROJO la asercion de
  orden con las anclas aun verdes -> rojo real).
- El HOST no se menciona (A-10 respetado).

## 2) Exclusion de BotonWhatsApp.tsx de la mutacion: LEGITIMA (no es trampa)
- Confirmado en stryker.config.json:12-32: src/components/BotonWhatsApp.tsx NO esta en `mutate`.
- Es un <a> ESTATICO sin predicados. @s11 (boton-whatsapp.test.tsx:139-153) lo ENFORCE
  leyendo los bytes del .tsx y prohibiendo `if (` / `?` / `&&` / `||`: si alguien mete una
  condicion, se pone rojo. Ausencia de logica guardada por test, no asumida.
- Los 3 mutantes instrumentados eran de STRING-LITERAL (className/id/aria-label/atributos del
  svg), presentacionales; el comportamiento observable lo cubren @s1..@s14 + el montaje @s4.
- El choque es ESTRUCTURAL, no un mutante vivo: Stryker instrumenta inyectando
  `if (stryMutAct...`, lo que hace fallar la asercion de FUENTE de @s11 en el dry-run ->
  aborta antes de medir. No hay score oculto.
- Contrapartida (la red mutable NO se afloja): en el mismo commit ENTRA
  src/components/equipo-logica.ts a `mutate` (linea 31) — el nucleo realmente mutable extraido
  de Equipo — y Equipo.tsx SIGUE en la lista (linea 30). Sale un render estatico sin logica,
  entra logica pura mutable. Balance neto: se endurece, no se relaja.
- La mutacion es una puerta SEPARADA que corre DESPUES de esta aprobacion; aqui juzgo diseno
  y cobertura. La exclusion esta documentada y es coherente con «mutable:false por escrito».

## 3) Contrato del enlace: OK
- Sin hardcodear numero/host: BotonWhatsApp.tsx:23 waHref(TELEFONO.legible,
  BOTON_WHATSAPP_FLOTANTE_TEXTO). @s2 prueba sobre bytes que la fuente NO contiene el numero
  (625 22 33 66 / 34625223366 / +34625223366) ni el host (wa.me / api.whatsapp.com /
  whatsapp.com), y SI importa TELEFONO de ../lib/site (ancla positiva).
- Sin aseverar el host: las unicas menciones son NEGATIVAS (@s2, not.toContain). El montaje
  tampoco lo menciona. Ninguna asercion positiva del host (A-10 respetado).
- Icono SVG inline decorativo: BotonWhatsApp.tsx:26 <svg aria-hidden="true"
  focusable="false">, sin <img>. @s3/@s6 lo verifican.
- Nombre accesible: aria-label="Abrir chat de WhatsApp con Nails Lash Studio"
  (BotonWhatsApp.tsx:24), literal a mano en @s3.
- Fuera de #contacto: home.tsx:138 hermano de <Pie/>, fuera de <main> y de <Contacto/>;
  @s4 lo pinea.

## Cobertura de escenarios (@s <-> test) — 14/14
- @s1:  [x] boton-whatsapp.test.tsx:30-51
- @s2:  [x] boton-whatsapp.test.tsx:53-80
- @s3:  [x] boton-whatsapp.test.tsx:82-97
- @s4:  [x] boton-whatsapp-montaje.test.tsx:49-71  <- corregido (bloqueante de v1)
- @s5:  [x] boton-whatsapp.test.tsx:99-110 + boton-whatsapp-estilos.test.ts (exit-code -> fase build)
- @s6:  [x] boton-whatsapp.test.tsx:112-137 + boton-whatsapp-estilos.test.ts (exit-code -> fase build)
- @s7:  [x] boton-whatsapp-estilos.test.ts
- @s8:  [x] boton-whatsapp-estilos.test.ts (PROXY declarado; F110 = verificacion manual)
- @s9:  [x] boton-whatsapp-estilos.test.ts
- @s10: [x] boton-whatsapp-estilos.test.ts
- @s11: [x] boton-whatsapp.test.tsx:139-153
- @s12: [x] boton-whatsapp.test.tsx:155-170 (conteo GLOBAL en dist/ -> fase build)
- @s13: [x] boton-whatsapp.test.tsx:172-189
- @s14: [x] boton-whatsapp.test.tsx:191-210

Todos los @s tienen >=1 test. Ya no hay escenario sin cobertura (regla dura satisfecha).

## Disciplina TDD
- Produccion sin test que la pida? NO. <a> estatico; cada atributo lo exige un test.
- Rojo->Verde->Refactor? SI. tdd_boton_whatsapp.md:66-71 y correccion_puertas.md:54-62.

## Calidad
- BotonWhatsApp.tsx: funcion corta, un solo motivo de cambio, docblock que cita la feature,
  export nombrado, ID_BOTON_WHATSAPP como const. Sin numeros magicos.
- boton-whatsapp-montaje.test.tsx: helper seccionContacto con fallback '' que hace CAER la
  ancla positiva (anti-vacuidad correcta); literales a mano.
- Nombres: el contrato fija BotonWhatsappFlotante.tsx; el real es BotonWhatsApp.tsx por
  directiva del lead (tdd_boton_whatsapp.md:6-23). Divergencia ya aceptada en v1, no bloqueante.

## Checkpoints
- C1 (arnes/init): [x] tsc 0, eslint 0, 889/889 verde.
- C2 (estado): [x] rebanada de F-13, sin entrada propia en feature_list.json (@s14).
- C3 (arquitectura): [x] href deriva de F-02; sin dependencias nuevas.
- C4 (verificacion real): [x] SSR, a11y por rol/nombre, bytes de fuente/SCSS.
- C5 (sesion): [x] bloqueante @s4 corregido; deferidos = fase build + puerta humana.
- C6 (contrato Gherkin): [x] 14/14 escenarios con test.
- C7 (mutacion): [ ] corre DESPUES de esta aprobacion; NO-MUTABLE (@s11); exclusion justificada.

## Pendientes NO bloqueantes (fase build + puerta humana antes de PUBLICAR)
1. Capa autoritativa de BYTES de dist/ (home-horneado): exit-code 0 de las 5 puertas
   (@s5/@s6) y conteo GLOBAL == 1 (@s12). Hoy cubiertos por SSR/in-process.
2. Verificaciones manuales del contrato (no son tests): tab-through SC 2.4.11/F110, apertura
   real en Android/iOS/WhatsApp Web (host wa.me, A-10), JS deshabilitado y 320px.

## Conclusion
El unico bloqueante de v1 (@s4) esta resuelto con un test real, determinista y anti-vacuidad.
La exclusion de mutacion es legitima y compensada. Sin hardcodeo de numero/host, sin asercion
del host, icono SVG inline, aria-label correcto, montado fuera de #contacto. Suite verde
(889/889), tsc y eslint limpios. APPROVED.
