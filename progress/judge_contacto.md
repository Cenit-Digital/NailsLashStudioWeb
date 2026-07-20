# Review — feature 12 (contacto, LOTE A)

**Veredicto:** APPROVED
**Bloqueantes:** 0 · **Menores:** 2

Contrato: `features/contacto.feature` (15 escenarios, v2 tras revision adversarial,
APROBADO por la puerta humana el 2026-07-18). Bitacora: `progress/tdd_contacto.md`.
Baseline 729 -> **765 tests** verdes (+36). Verificado EN VIVO por el juez (no de fe).

## Puertas ejecutadas (medidas, no citadas)
- `pnpm typecheck` -> exit 0.
- `pnpm lint` (eslint) -> exit 0.
- `pnpm test` (vitest) -> **765 passed / 26 files**, exit 0.
- `pnpm build` -> exit 0 con las **CINCO puertas**: cascaron · placeholders · contraste ·
  terceros · **anclas vivas** (igualdad de conjuntos de F-06 INTACTA).

## Cobertura de escenarios (@s <-> test) — 15/15
- @s1: [x] `site.test.ts` (URL exacta · NO el handle alternativo @nail_lash_studio_ · host/sin-@/cierra barra)
- @s2: [x] `site.test.ts` it.each cadena-vacia / solo-arroba / arroba-con-espacio -> LANZA y no emite `...instagram.com//`
- @s3: [x] `site.test.ts` nailslash.studio_ sin @ -> LANZA (D-1a falla cerrada)
- @s4: [x] `contacto-horneado.test.ts` (bytes de dist/) + `contacto.test.tsx` (renderToString)
- @s5: [x] `contacto-horneado.test.ts` + `contacto.test.tsx` (href tel:+34625223366 <-> texto 625 22 33 66)
- @s6: [x] `contacto-estilos.test.ts` (@media que trata .telefono · sin atribucion WCAG/2.5.8)
- @s7: [x] `contacto-horneado.test.ts` (PAGINA ENTERA html, ancla positiva marca, sin tiktok)
- @s8: [x] `contacto-horneado.test.ts` (PAGINA ENTERA, ancla positiva, sin email centroesteticarozas@gmail.com ni mailto:)
- @s9: [x] `contacto-horneado.test.ts` (#contacto EXTRAIDA + ancla positiva h2+tel · Facebook NO aqui, SI en el pie)
- @s10: [x] `contacto-horneado.test.ts` (1 seccion + 1 id contacto-titulo + nav enlaza + exit 0) + `contacto.test.tsx`
- @s11: [x] `contacto-horneado.test.ts` (ancla positiva tel+dir+IG · sin wa.me / api.whatsapp.com)
- @s12: [x] `contacto-horneado.test.ts` (dir texto · sin iframe / Como llegar / Planta 0) + `contacto.test.tsx`
- @s13: [x] soporte por @s1/@s2/@s3 (los mutantes nombrados los MIDE el mutation_tester, puerta C7 aparte)
- @s14: [x] `contacto-horneado.test.ts` + `contacto.test.tsx` (regex: texto @nailslash.studio_ <-> href derivado)
- @s15: [x] `contacto-fuente.test.ts` (.tsx con 0 instagram.com · site.ts con el host en la region de instagramHref)

## Disciplina TDD
- Produccion sin test que la pida? **NO.** instagramHref (site.ts:121-137) la exigen @s1/@s2/@s3/@s4/@s14;
  render de Contacto.tsx lo exigen @s4/@s5/@s10/@s12/@s14; .module.scss .telefono+@media lo exige @s6.
  El horario visible (deuda F-10) NO se anadio: no esta en el contrato -> alcance NO inflado (bien).
- Evidencia de Rojo->Verde->Refactor? **SI.** Bitacora con 7 ciclos + 4 sabotajes revertidos.

## Verificacion de que los tests MUERDEN (2 sabotajes, reproducidos y revertidos por el juez)
1. Quitar la barra final de instagramHref (site.ts:136) -> **@s1 ROJO** (2 tests). Revertido byte-identico
   desde backup; repo limpio.
2. Hornear el host en Contacto.tsx:31 (href literal https://www.instagram.com/nailslash.studio_/) ->
   **@s15 ROJO**; y `contacto.test.tsx` (@s4/@s14) **SIGUE VERDE** porque los bytes de dist/ son IDENTICOS.
   Prueba que la guarda de FUENTE (G3) caza lo que ni la igualdad de bytes ni la mutacion muerden.
   Revertido byte-identico; repo limpio.

## Verificacion del checklist de la tarea
1. **F-02 NO reabierto:** git diff --numstat -> site.test.ts 70 insert / **0 del**; site.ts **0 del**.
   telHref / waHref / numeroNacional / NAP / registros y sus 37 tests INTACTOS. Aditivo puro. OK.
2. **instagramHref mutable + anti-tautologia:** derivacion pura (valida @, slice, regex de cuerpo,
   antepone host, cierra barra); falla cerrada ante vacia / solo-@ / espacio. Esperados A MANO, entrada
   literal, nunca re-ejecuta la produccion ni importa REDES como esperado. Distingue el handle alternativo. OK.
3. **B1 (vacuidad) resuelto:** @s7/@s8 aseveran sobre html (head+body) con ancla positiva MARCA;
   @s9/@s11/@s12 acotan a #contacto EXTRAIDA con ancla positiva (h2+tel: / dir / IG). Seccion vacia ->
   seccionContacto() vacia -> el ancla positiva CAE -> la negativa no pasa por vacuidad. OK.
4. **Guarda de FUENTE (G3):** .tsx en 0 instagram.com, site.ts en >=1 dentro de instagramHref.
   Sabotaje 2 lo confirma. OK.
5. **Anclas F-06 intactas:** reutiliza #contacto-titulo (no id/seccion nuevos); puerta de anclas vivas
   verde en pnpm build; @s10 exige exactamente 1 seccion + 1 id + exit 0. OK.
6. **Fronteras:** SIN WhatsApp (@s11), SIN mapa / Como llegar / Planta 0 (@s12), email OMITIDO / sin
   mailto: (@s8), TikTok ausente (@s7), Facebook solo en el pie (@s9). Contacto.tsx lo respeta. OK.
7. **fileParallelism: false:** justificado (dos tests build-based comparten dist/; en paralelo se pisan el
   artefacto -> flaky). Documentado. Ver MENOR 2. OK con salvedad.
8. **Los tests muerden:** 2 sabotajes reproducidos. OK.
9. **Sin regresion:** typecheck 0 · lint 0 · test 765 · build exit 0 con 5 puertas. OK.

## Calidad (lente de artesano)
- instagramHref (site.ts:121-137): funcion corta, un solo motivo de cambio; constantes con nombre
  (HOST_INSTAGRAM, PREFIJO_HANDLE, USUARIO_INSTAGRAM_VALIDO); sin numeros magicos
  (slice(PREFIJO_HANDLE.length)); errores nombrados y ruidosos (falla cerrada, hermana de numeroNacional).
- Contacto.tsx: corta, ID_CONTACTO con nombre, href DERIVADOS, sin IO en el dominio; co-locacion
  .module.scss homogenea con Hero/Pie (F-06/F-07). Respeta docs/architecture.md (capa dato -> UI).
- Tests: nombres con @s, helpers claros (seccionContacto, cuerpoDelBloque, resultadoODisparo, ocurrencias,
  textoPlano), anti-tautologia, autoritativo sobre bytes de dist/ (no jsdom).

## Checkpoints
- C1 (arnes completo, init verde): [x]
- C2 (estado coherente, 1 sola feature in_progress = F-12): [x]
- C3 (arquitectura, 0 deps nuevas, sin debug/TODO sueltos): [x]
- C4 (verificacion real, >=1 test por modulo, 765 verdes sobre bytes reales): [x]
- C5 (cierre de sesion: history/current) -> lo cierra el craftsman_lead al final: [ ] (fuera del juez)
- C6 (contrato Gherkin, 15/15 @s cubiertos, sin produccion sin test rojo): [x]
- C7 (mutacion >= umbral 1.0) -> puerta del mutation_tester, corre DESPUES de esta aprobacion: [ ] (pendiente)

## Menores (no bloqueantes)
1. **@s14, segunda asercion tautologica.** En contacto.test.tsx:82-83 y contacto-horneado.test.ts:163-164
   la asercion COMPARTEN el cuerpo comprueba que dos literales escritos A MANO contienen la subcadena
   nailslash.studio_ (expect(IG_URL).toContain(...) / expect(handle).toContain(...)): es siempre cierta y
   NO toca el artefacto. La consistencia texto<->href real la cubre la PRIMERA asercion (el regex del <a>
   con href derivado + texto = handle), que si muerde. Redundante e inofensiva; podria sustituirse por una
   comprobacion sobre el HTML del artefacto para que aporte cobertura.
2. **fileParallelism: false es un martillo amplio.** Serializa TODA la suite, no solo los dos ficheros
   build-based que comparten dist/. Justificado y documentado (determinismo), pero ralentiza el conjunto y,
   en teoria, podria enmascarar contaminacion de estado entre otros ficheros. Aceptable para la demo; si la
   suite crece, valorar aislar el dist/ por fichero build-based en vez de serializar todo.

## Cambios requeridos
Ninguno. Se aprueba. Siguiente puerta: mutation_tester (umbral 1.0 sobre src/lib/site.ts —instagramHref—
y src/components/Contacto.tsx; 0 exclusiones; si algun mutante resiste, se ESCALA, no se excluye).
