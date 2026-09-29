# =============================================================================================
# CONTRATO — F-25 `logo_acoplado`: «Nails Lash» sube del hero y se queda de logo en la cabecera.
# Dos estados en ATRIBUTOS del <a> (`data-logo`, `data-vuelo`), un vuelo FLIP que vive en la HOJA
# (`@keyframes` + tres custom properties; sin WAAPI) y la marca accesible «Nails Lash Studio» intacta.
# Estado: PROPUESTO (gherkin_author, 2026-09-29) — pendiente de la PUERTA HUMANA. Entrada 25 de
# `feature_list.json`. DEPENDE de F-06 `header_nav_footer` y F-07 `hero_marca`, que se ENMIENDAN sin
# romper (@s20-@s23). Implementación y revisiones: progress/tdd_logo_acoplado.md.
# Bitácora de esta destilación y dudas para la puerta: progress/gherkin_logo_acoplado.md.
# =============================================================================================
# FUENTES, EN ORDEN DE MANDO
#   1. Decisiones FIRMES de Pablo (AskUserQuestion, 2026-09-29; brief §2). NO SE REABREN en la puerta:
#      · P2 — «Se queda la caligrafía»: una vez acoplada, la caligrafía PERMANECE toda la visita,
#        aunque se vuelva arriba del todo (@s8, @s30). «La visita» = la vida del documento: recargar
#        arriba vuelve a «nails lash studio» (@s9, @s30). Sin storage.
#      · P3 — «Solo "Nails Lash"»: el logo acoplado es SOLO la firma, SIN «STUDIO» (@s2, @s4).
#   2. `project-spec.md` → «Feature 25: logo_acoplado» (LA-C1..LA-C13, casos límite 1-20, LA-1..LA-16,
#      enmiendas a F-06/F-07/F-03 y verificación en vivo).
#   3. `progress/brief_foto_logo_catalogo.md` §5 (F-26 DESCARTADA: la cabecera y el hero se quedan como
#      están) y §6 (cálculos del spec_partner: contraste 5,3809; viewBox 4120:1200; ≤ 76 px).
#
# PROPUESTAS DEL spec_partner, A RATIFICAR EN LA PUERTA (una a una; si una cae, caen sus escenarios):
#   LA-1  el vuelo es un @keyframes de la HOJA; JS solo pone el punto de salida en 3 custom properties
#         (no WAAPI, no View Transitions, no animation-timeline) ................ @s13, @s15, @s16
#   LA-2  vuela el PROPIO <svg> del logo (FLIP invertido), sin fantasma clonado ...... @s2, @s11, @s22
#   LA-3  dos atributos: data-logo (qué se ve) y data-vuelo (cómo llegó) ......... @s1, @s3, @s10
#   LA-4  las dos representaciones horneadas en la MISMA celda de rejilla (cero CLS) ... @s2, @s17, @s32
#   LA-5  nombre desde un <span> solo para lectores; lo visible, aria-hidden ...... @s2, @s3, @s33
#   LA-6  IntersectionObserver con rootMargin = −FLOOR(alto de la cabecera), y la decisión contra la
#         línea DEL PROPIO OBSERVADOR (rootBounds.top) [D-1 ACEPTADA por el lead] ... @s5, @s7, @s13, @s25, @s34
#   LA-7  frontera `<=` .......................................................... @s6, @s7, @s24
#   LA-8  atributos data-acople en Hero.tsx + querySelector DENTRO del efecto ....... @s1, @s14, @s21
#   LA-9  carga desplazada = acople SIN vuelo; y la regla «a menos de un viewport» .... @s10, @s24
#   LA-10 0,9 s · cubic-bezier(0.45, 0, 0.25, 1) · opacidad 0,35 → 1; el texto sale en 0,4 s linear . @s15
#   LA-11 reduced-motion = cambio INSTANTÁNEO, sin fundido ......................... @s16, @s31
#   LA-12 contraste con la fila A-15 existente + test de bytes que ata el fill a --ink ... @s19, @s33
#   LA-13 alto del logo 2,5 rem con tope duro de 2,75 rem ......................... @s18, @s32
#   LA-14 componente nuevo LogoAcoplado.tsx con su .module.scss .................. ARTEFACTOS, @s20
#   LA-15 partirNombre(NOMBRE).marca y VISTA_MARCA, nunca un literal ............... @s2, @s4, @s26
#   LA-16 el hero sigue su ceremonia sin enterarse del acople ...................... @s22
#
# =============================================================================================
# ARTEFACTOS (spec LA-C1, LA-C3, LA-C11, LA-14 — fijados: el tdd_craftsman NO elige nombres)
# =============================================================================================
#   src/components/LogoAcoplado.tsx            NUEVO · `export function LogoAcoplado` · lo monta
#                                              Cabecera.tsx en el sitio del antiguo <a>{NOMBRE}</a>
#   src/components/logo-acoplado.module.scss   NUEVO · selectores `.marca`, `.soloLectores`,
#                                              `.logoTexto`, `.logoCaligrafia`; @keyframes `acoplar`, `soltar`
#   src/components/logo-acoplado-logica.ts     NUEVO · las cinco funciones PURAS de @s24/@s25
#   tests: logo-acoplado.test.tsx · logo-acoplado-logica.test.ts · logo-acoplado-estilos.test.ts ·
#          logo-acoplado-derivacion.test.tsx (el vi.mock de @s4 vive SOLO ahí)
#   TOCA: Cabecera.tsx (monta <LogoAcoplado />) · cabecera.module.scss (las reglas de `.marca` se
#         MUDAN a la hoja nueva; el `@media (max-width: 820px)` se queda) · Hero.tsx (SOLO dos
#         atributos estáticos `data-acople`) · hero.test.tsx (aserciones nuevas de @s21) ·
#         cabecera.test.tsx (@s20) · stryker.config.json (+2 en `mutate`).
#   NO TOCA: data-firma, el control «Completar la firma» ni el reloj de 15 s del hero (LA-C8, LA-16);
#         `MATRIZ_DE_USO` ni `MINIMO_DE_PARES` (LA-12); `_tokens.scss` ni el 88 % de `--header-bg`;
#         `_base.scss` (el `scroll-padding-top: 6rem` y los 76 px que deriva a mano, F-06 @s11).
#
# =============================================================================================
# GEOMETRÍA DE REFERENCIA (la MISMA en todos los escenarios de jsdom; asimétrica y SIN ceros)
# =============================================================================================
#   · window.innerHeight = 812 (fijado a mano; NO el 768 por defecto de jsdom).
#   · La cabecera (el <header> que contiene el enlace), por getBoundingClientRect:
#       top 0 · bottom 73.6 · height 73.6  → rootMargin "-73px 0px 0px 0px" (Math.floor; Math.round y
#       Math.ceil darían "-74px": 73,6 los distingue a los dos a la vez).
#   · TODA entrada que entrega el doble del observador trae rootBounds con top 73 y bottom 812: la línea
#     DEL PROPIO OBSERVADOR (el viewport recortado por el rootMargin), como la fabrica el navegador.
#     La FRONTERA del disparo en la geometría de referencia es, por tanto, 73 (no el 73.6 de la cabecera).
#     Solo @s7 entrega entradas con rootBounds null, para fijar la caída al borde medido.
#   · El <svg> del LOGO (DESTINO del FLIP): left 40 · top 17 · width 137.5 · height 40.
#   · El <a> del logo, como SEÑUELO (caza medir el nodo equivocado): left 24 · top 22.4 · width 181 ·
#     height 28.8. Medirlo en vez del <svg> daría x 341 · y −80.4 · escala ≈ 3,04.
#   · [data-acople="origen"] (el <svg> del rótulo del hero, ORIGEN) en el instante del disparo:
#       left 365 · top −58 · width 550 · height 100 (bottom 42)
#       → FLIP: x = 365 − 40 = 325 · y = −58 − 17 = −75 · escala = 550 / 137.5 = 4.
#     El alto NO es proporcional A PROPÓSITO: por el alto saldría 100 / 40 = 2,5, así que una escala
#     tomada del alto se pone roja (en el navegador las dos coinciden: comparten VISTA_MARCA).
#   · [data-acople="disparo"] («STUDIO»): su borde inferior LO TRAE LA ENTRADA del observador
#     (entry.boundingClientRect.bottom). Su getBoundingClientRect se deja en los CEROS de jsdom: con
#     ceros, `0 <= 73` acoplaría siempre, así que decidir con otra medida que la de la entrada se pone
#     rojo en las filas que esperan «texto» (@s6).
#
# =============================================================================================
# «VERDE ≠ FUNCIONA» — DÓNDE SE ASEVERA CADA COSA
# =============================================================================================
#   · renderToString (lo que hornea el SSG, sin JS): @s1, @s2, @s4, @s20, @s21, @s23 (literales A MANO).
#   · jsdom + render + IntersectionObserver SUSTITUIDO (precedente `stubDeIntersectionObserver` de
#     galeria.test.tsx: captura callback y opciones; observe/disconnect espiados). Las entregas se
#     hacen A MANO dentro de act(), con geometría REAL y nunca ceros, y la cabecera, el origen y el
#     <svg> del logo con getBoundingClientRect fijado ANTES del montaje: @s3, @s5-@s14, @s22, @s34.
#   · Funciones PURAS por valor: @s24, @s25 → logo-acoplado-logica.test.ts.
#   · BYTES del SCSS (`cuerpoDelBloque`, ANCLA POSITIVA SIEMPRE primero; jsdom corre con `css: false` y
#     no ejecuta animaciones): @s15-@s20 → logo-acoplado-estilos.test.ts (@s20, en cabecera.test.tsx).
#   · BYTES de la fuente y de stryker.config.json: @s26, @s27. La PUNTUACIÓN de @s27 la mide el
#     mutation_tester, no un test.
#   · SOLO EN NAVEGADOR REAL (Chrome + CDP sobre `dist/` servido, I-8): @s28-@s33, con el tag
#     @verificacion-viva y el prefijo «[VERIFICACIÓN EN VIVO CON CHROME, NO jsdom]» (precedente
#     tipografia_global @s8/@s9). NO son puerta unitaria: PROHIBIDO fingirlos con jsdom (jsdom no pinta,
#     no hace layout, no anima y no trae IntersectionObserver). Los corre el LEAD tras el TDD y los
#     anota en progress/. PROHIBIDO crear tests build-based para ellos.
#
# =============================================================================================
# ANTI-TAUTOLOGÍA Y PROHIBICIONES
# =============================================================================================
#   ✅ Literales A MANO en los tests: "Nails Lash Studio", "Nails Lash", "-80 -840 4120 1200", "texto",
#      "caligrafia", "no", "si", "-73px 0px 0px 0px", "325px", "-75px", "4", "0.9s",
#      "cubic-bezier(0.45, 0, 0.25, 1)", "0.35", "0.4s", "2.5rem", "2.75rem", "var(--ink)".
#   ❌ PROHIBIDO importar de producción NOMBRE, partirNombre, VISTA_MARCA ni ninguna constante del logo
#      como VALOR ESPERADO (sí se sustituyen con vi.mock en @s4, que es lo contrario: prueba que se USAN).
#   ❌ PROHIBIDO `toHaveClass` y aseverar por clase de CSS module (bajo `css: false` es undefined): el
#      estado vive en `data-logo`/`data-vuelo`, nunca en un className condicional (F-06 @s15).
#   ❌ PROHIBIDO decidir el acople fuera del callback del observador (LA-C10): en jsdom todo mide 0.
#   ❌ PROHIBIDO `matchMedia`, `Element.animate`, escuchar "scroll"/"resize" y storage de cualquier tipo
#      en el componente (@s9, @s13, @s26).
#   ❌ PROHIBIDO en ficheros de `mutate` guardas de FUENTE contra `if (`, `?`, `&&` o `||` (lección del
#      botón retirado): las de @s26 solo vetan literales que Stryker nunca inyecta.
#
# =============================================================================================
# MUTACIÓN (umbral 1.0) — @s27
# =============================================================================================
#   100 % en LogoAcoplado.tsx y logo-acoplado-logica.ts (NUEVOS en `mutate`); RE-MEDIDA en Cabecera.tsx
#   y Hero.tsx (ya en `mutate`). El `[]` de dependencias del efecto de montaje es el mutante EQUIVALENTE
#   ya ratificado tres veces (Hero.tsx, Galeria.tsx, Equipo.tsx): `// Stryker disable next-line` con la
#   justificación en progress/mutation_logo_acoplado.md, nunca a ciegas. `--mutate`, jamás
#   `--testFiles`. El SCSS es NO-MUTABLE: lo cubren @s15-@s20 (su mutante es HUMANO; su defensa, la puerta).
#
# =============================================================================================
# DUDAS DE LA DESTILACIÓN → DECISIONES DEL craftsman_lead (2026-09-29; detalle en
# progress/gherkin_logo_acoplado.md). El lead enmienda LA-C4/LA-C11 en project-spec.md; este fichero
# ya refleja las decisiones.
# =============================================================================================
#   ✅ D-1 ACEPTADA y reforzada. El problema era que `Math.ceil` ponía la línea del observador POR DEBAJO
#     del borde de la cabecera: el aviso podía llegar con «STUDIO» asomando, la decisión devolvía «texto»
#     y el observador ya no volvía a avisar, así que el acople se PERDÍA con scroll lento. Queda así:
#     (a) `margenDeRaiz` = "-<FLOOR(alto)>px 0px 0px 0px". La línea queda en el borde de la cabecera o
#         por encima. Se elige floor y no el alto exacto porque el margen entero no depende de cómo
#         redondee cada motor un rootMargin fraccionario (@s5, @s25).
#     (b) La decisión compara el borde inferior de «STUDIO» con la línea DEL PROPIO OBSERVADOR,
#         `entry.rootBounds.top`, y no con un alto medido aparte. Si `rootBounds` es null, usa el borde
#         de la cabecera medido EN el callback (@s7). El aviso de salida llega cuando el borde ya está
#         por encima de esa misma línea, así que aviso y decisión son coherentes por construcción y el
#         acople nunca se pierde (@s6, @s7, EN VIVO @s29).
#   ✅ D-2 RESUELTA por D-1(b), caso límite ACEPTADO. Si la cabecera cambia de alto tras montar (al cruzar
#     820 px redimensionando: ≈ 74 px con hamburguesa y ≈ 70 px con la nav horizontal), el acople se
#     adelanta o se retrasa ≈ 4 px como mucho, pero nunca se pierde. El observador NO se rehace (fila de @s7).
#   ✅ D-3 ACEPTADA como caso límite documentado, NO contrato: si se acopla con «reduce» activo y la
#     persona lo retira después, el vuelo puede reproducirse UNA vez desde el origen antiguo. Es raro e
#     inofensivo. Solo queda como observación en @s31.
#   ✅ D-4 FIJADA: si una entrega trae varias entradas, decide la ÚLTIMA; «primera observación» es la
#     primera ENTREGA, no la primera entrada (@s34).
#   ✅ D-5 RATIFICADA: las reglas `text-transform: lowercase` y `letter-spacing: 0.06em` van a
#     `.logoTexto`; en `.marca` las heredaría el <text> de la firma (@s19; EN VIVO en @s28).
#   ✅ D-6, D-7 y D-8 RATIFICADAS tal cual (derivados menores, alcance de @s23 y nombres fijados aquí).
#
# =============================================================================================
# TRAZA — contrato, casos límite y decisiones → escenario
# =============================================================================================
#   LA-C1 → @s1, @s2, @s3, @s4, @s23 · LA-C2 → @s1, @s10, @s11 · LA-C3 → @s15-@s19
#   LA-C4 (enmendada por D-1) → @s5, @s6, @s7, @s34 · D-2 → @s7 · D-3 → @s31 · D-4 → @s34 · D-5 → @s19, @s28
#   LA-C5 → @s8, @s9 · LA-C6 → @s10, @s12, @s13 · LA-C7 → @s11, @s12, @s25 · LA-C8 → @s22 (+ @s29)
#   LA-C9 → @s1, @s14, @s21 · LA-C10 → @s5, @s14 · LA-C11 → @s24, @s25, @s27 · LA-C12 → @s19 (+ @s33)
#   LA-C13 → @s1, @s28, @s32 · Enmiendas: F-06 → @s20, @s23 · F-07 → @s21, @s22 · F-03 → @s19 ·
#   F-04/F-05/F-21 → @s23, @s33 · stryker → @s27.
#   Casos límite: 1 → @s6, @s28 · 2 → @s10, @s30 · 3 → @s10 · 4 → @s10, @s29 · 5 → @s10, @s30 ·
#   6 → @s6, @s10 · 7 → @s8, @s30 · 8 → @s29 (EN VIVO) · 9 → @s16, @s31 · 10 → @s14 · 11 → @s12, @s14 ·
#   12 → @s12 · 13 → @s7 · 14 → @s22, @s29 · 15 → @s18, @s32 · 16 → @s32 · 17 → @s30 · 18 → @s30 ·
#   19 → @s6, @s24 · 20 → @s19, @s29, @s33.
#   Acceptance de feature_list.json: «escenarios verdes por TDD» → @s1-@s26 y @s34 · «mutación al 100 %» → @s27 ·
#   «verificación en vivo: disparo, vuelo visible, se queda al volver arriba, reduce sin vuelo, 320 px
#   sin CLS» → @s29, @s29, @s30, @s31, @s32 (+ @s28, @s33) · «judge APROBADO» → fuera de este fichero.
# =============================================================================================

Feature: Logo acoplado — al dejar de verse «STUDIO», «Nails Lash» sube del hero, se encoge y se queda de logo en la esquina superior izquierda, sin mover la cabecera ni cambiar el nombre del enlace
  Como visitante quiero que la firma caligráfica del hero, cuando la dejo atrás al hacer scroll, suba
  con un vuelo suave hasta la esquina superior izquierda y se quede como logo, para reconocer la
  marca en toda la visita; y como responsable del proyecto quiero que el HTML horneado siga siendo
  correcto sin JavaScript, que el enlace se siga llamando «Nails Lash Studio», que la cabecera no
  cambie de tamaño, que quien pide menos movimiento no vea ningún vuelo y que nada se guarde.

  # ---------------------------------------------------------------------------------------------
  # EL HORNEADO: sin JavaScript, para siempre (LA-C1, LA-C2, LA-C13; LA-3, LA-4, LA-5, LA-15).
  # ---------------------------------------------------------------------------------------------

  @s1
  Scenario: El horneado de la marca nace en data-logo="texto" y data-vuelo="no", apunta a BASE_URL y no trae ningún style
    Given la cabecera renderizada con renderToString(<Cabecera />), como la hornea el SSG, con document.querySelector espiado
    When se localiza en ese HTML el <a> que lleva el atributo data-logo
    Then existe EXACTAMENTE un <a> con data-logo, y la nav con aria-label="Principal" sigue presente (ANCLAS POSITIVAS)
    And ese <a> lleva data-logo="texto" y data-vuelo="no"
    And su href es exactamente "/" (el import.meta.env.BASE_URL de la suite, que no declara base; el de dist/ lo comprueba @s28)
    And el fragmento del <a>, desde su apertura hasta su </a>, NO contiene "style=", ni "--vuelo-", ni "animation"
    And document.querySelector NO se ha llamado durante el renderToString: el hero se busca en el efecto, nunca en el render (LA-C9)
    # Sin JS la marca es «texto» para siempre (LA-C13) y es lo que se ve al cargar arriba (caso límite
    # 1). Las tres custom properties solo existen con data-vuelo="si" (LA-C2); en el horneado no hay
    # nada inline que pueda dejar la marca desplazada o translúcida si el JS no llega.

  @s2
  Scenario: Las DOS representaciones viajan horneadas dentro del enlace —«nails lash studio» y la firma «Nails Lash», las dos aria-hidden— sin ids, sin máscara y sin «Studio» en la firma (P3)
    Given el mismo renderToString(<Cabecera />)
    When se inspecciona el contenido del <a> con data-logo
    Then contiene EXACTAMENTE dos <span> y EXACTAMENTE un <svg>, en este orden: el <span> SIN aria-hidden, el <span> con aria-hidden="true" y el <svg>
    And el texto de cada uno de los dos <span> es exactamente "Nails Lash Studio"
    And el <svg> lleva aria-hidden="true", focusable="false" y viewBox="-80 -840 4120 1200"
    And el <svg> contiene EXACTAMENTE un <text>, con x="0", y="0" y font-size="1000", cuyo texto es exactamente "Nails Lash"
    And el <svg> NO contiene "Studio" ni "STUDIO" (P3: solo la firma)
    And el fragmento del <a> NO contiene " id=", "<mask", "mask=", "url(#", "<path" ni "<image"
    # Cero ids dentro del logo (LA-C1): `tinta-marca` y `trazo-marca` son del hero y deben seguir siendo
    # únicos (@s22). El logo muestra SIEMPRE la firma completa: sin máscara, sin trazo, sin aplicador.
    # La caligrafía viaja en los bytes pero OCULTA por la hoja (@s17): no es contenido pendiente de JS
    # (I-4), es la representación alternativa, aria-hidden, de una marca que ya se ve.

  @s3
  Scenario Outline: El nombre accesible del enlace es EXACTAMENTE «Nails Lash Studio» y su destino "/" en <estado> — y ninguna clase cambia con el estado
    Given la cabecera montada en jsdom con render(<Cabecera />), IntersectionObserver sustituido y la geometría de referencia
    And <preparación>
    When se consultan los enlaces por rol "link" con nombre accesible exacto "Nails Lash Studio"
    Then existe EXACTAMENTE uno, es el <a> con data-logo="<data-logo>" y data-vuelo="<data-vuelo>", y su href es exactamente "/"
    And ese <a> NO lleva aria-label, ni aria-labelledby, ni title: el nombre sale del <span> solo para lectores (LA-5)
    And el atributo class del <a>, de los dos <span>, del <svg> y del <text> es la MISMA cadena que tenían recién montados en «texto» (precedente F-06 @s15)

    Examples:
      | estado                  | preparación                                                                                        | data-logo  | data-vuelo |
      | «texto», recién montada | ninguna entrega del observador                                                                     | texto      | no         |
      | «caligrafia» sin vuelo  | una entrega INICIAL con «STUDIO» ya arriba (bottom 12.5): la carga desplazada                      | caligrafia | no         |
      | «caligrafia» con vuelo  | una entrega inicial con «STUDIO» a la vista (bottom 400) y otra con «STUDIO» en la frontera (73.2) | caligrafia | si         |

    # El nombre EXACTO muerde por los dos lados: si una representación visible perdiera su aria-hidden, el
    # nombre pasaría a "Nails Lash Studio Nails Lash Studio…" y la consulta exacta no encontraría nada.
    # Un aria-label (alternativa (a) de LA-5, descartada) sustituiría el contenido y algunos traductores
    # automáticos no traducen atributos. En el árbol de accesibilidad REAL de Chrome: @s33.

  @s4
  Scenario: La firma del logo y su viewBox salen de la MISMA fuente que el rótulo del hero —partirNombre(NOMBRE).marca y VISTA_MARCA—, nunca de un literal (LA-15, I-7)
    Given un fichero de test propio en el que vi.mock sustituye NOMBRE de "src/lib/site" por "Salón Uñas Bonitas" y VISTA_MARCA de "src/lib/trazo-marca" por "0 -700 3000 900" (literales A MANO)
    When se hornea renderToString(<Cabecera />)
    Then el <text> del <svg> del logo tiene como texto exactamente "Salón Uñas", y el <svg> NO contiene "Bonitas" (P3: la última palabra no va en la firma)
    And el <svg> del logo lleva viewBox="0 -700 3000 900"
    And el texto de cada uno de los dos <span> del <a> es exactamente "Salón Uñas Bonitas"
    And el fragmento del <a> NO contiene "Nails Lash" ni "-80 -840 4120 1200"
    # Si mañana cambia el nombre, cambian a la vez el rótulo y el logo. Es lo que ya hace el hero
    # (Hero.tsx: `partirNombre(NOMBRE)` y `viewBox={VISTA_MARCA}`), y compartir VISTA_MARCA es lo que hace
    # EXACTA la escala uniforme del FLIP (LA-C7). @s2 escribe «Nails Lash» A MANO (anti-tautología);
    # este escenario prueba que el componente USA la fuente.

  # ---------------------------------------------------------------------------------------------
  # EL DISPARO Y LA MONOTONÍA (LA-C4, LA-C5, LA-C10; LA-6, LA-7; P2).
  # ---------------------------------------------------------------------------------------------

  @s5
  Scenario: Tras montar, UN observador vigila a «STUDIO» con la línea de la cabecera como margen —threshold 0, sin root, rootMargin "-74px 0px 0px 0px"— y hasta su primera entrega nada cambia
    Given un documento con un elemento [data-acople="disparo"] y otro [data-acople="origen"] (el papel del hero), IntersectionObserver sustituido por un doble que captura el callback y las opciones y espía observe y disconnect, y la geometría de referencia (cabecera de 73.2 px de alto)
    When se monta <Cabecera /> con render() y corren sus efectos
    Then el constructor de IntersectionObserver se ha llamado EXACTAMENTE una vez, y sus opciones son exactamente { threshold: 0, rootMargin: "-74px 0px 0px 0px" }, sin root: la raíz es el viewport
    And observe se ha llamado EXACTAMENTE una vez, con el elemento [data-acople="disparo"] como argumento
    And sin ninguna entrega del callback el <a> sigue en data-logo="texto" y data-vuelo="no", sin atributo style, aunque en jsdom «STUDIO» mida 0 y "0 <= 73.2" acoplaría (LA-C10)
    And al desmontar el componente sin haber acoplado, disconnect se ha llamado EXACTAMENTE una vez
    # "-74px" = −ceil(73.2): Math.round daría "-73px" (LA-C11). ⚠ D-1: la spec elige ceil; ver la
    # cabecera y la bitácora. Con el rootMargin el navegador avisa al cruzar la línea de la cabecera, y
    # no un alto de cabecera tarde, cuando «STUDIO» ya sale del viewport bajo el cristal del 88 % con
    # blur (LA-6 b). Desconectar al desmontar es la limpieza del efecto [derivado: la spec solo nombra
    # la desconexión al acoplar; sin esta aserción el mutante que borra la limpieza sobrevive].

  @s6
  Scenario Outline: El disparo lo decide la GEOMETRÍA de la entrada, no isIntersecting —«ya pasó por arriba» acopla, «aún no ha llegado» no— y la frontera es "<=" (LA-C4, LA-7)
    Given la cabecera montada con IntersectionObserver sustituido, la geometría de referencia (borde inferior de la cabecera: 73.2) y una primera entrega ya hecha con «STUDIO» a la vista (bottom 400, isIntersecting true), que dejó data-logo="texto"
    When el observador entrega una entrada de «STUDIO» con boundingClientRect.bottom = <bottom> e isIntersecting = <isIntersecting>
    Then el <a> tiene data-logo="<data-logo>"
    And disconnect se ha llamado <desconexiones>

    Examples:
      | bottom | isIntersecting | data-logo  | desconexiones       | qué representa                                                                    |
      | 912    | false          | texto      | ninguna vez         | aún no ha llegado: por debajo del viewport, en una ventana muy baja               |
      | 400    | true           | texto      | ninguna vez         | «STUDIO» a la vista (caso límite 1)                                               |
      | 73.7   | false          | texto      | ninguna vez         | medio píxel de «STUDIO» asomando bajo la cabecera                                 |
      | 73.2   | false          | caligrafia | EXACTAMENTE una vez | frontera exacta: 0 px visibles ya es «no se ve» (caso límite 19)                  |
      | 12.5   | false          | caligrafia | EXACTAMENTE una vez | ya pasó por arriba                                                                |
      | -640   | false          | caligrafia | EXACTAMENTE una vez | muy por encima: un scroll rápido que el observador ve un fotograma tarde (caso 6) |

    # isIntersecting === false en las filas 912 y 12.5: es cierto en los DOS sentidos, así que NO decide.
    # Decide la CAJA, no la tinta ni la opacidad: durante la ceremonia de 15 s «STUDIO» está en opacity 0
    # con su caja ya en su sitio, y la entrada trae la misma caja. La fila 73.7 es, con el ceil de la
    # spec, una entrada que el navegador SÍ puede entregar al cruzar la línea de 74 px: es el caso de D-1.

  @s7
  Scenario Outline: El borde de la cabecera se mide EN EL CALLBACK, no al crear el observador —con el menú móvil abierto la cabecera es más alta— (caso límite 13)
    Given la cabecera montada con IntersectionObserver sustituido, creado cuando la cabecera medía 73.2 px (rootMargin "-74px 0px 0px 0px"), y una primera entrega con «STUDIO» a la vista (bottom 400)
    And la cabecera pasa a medir <borde de la cabecera> px de borde inferior antes de la siguiente entrega
    When el observador entrega una entrada de «STUDIO» con boundingClientRect.bottom = 150 e isIntersecting false
    Then el <a> tiene data-logo="<data-logo>"
    And el constructor de IntersectionObserver sigue con EXACTAMENTE una llamada: el observador no se rehace

    Examples:
      | borde de la cabecera | data-logo  | por qué                                                        |
      | 260                  | caligrafia | menú abierto: 150 <= 260, «STUDIO» ya está tapado por el menú  |
      | 73.2                 | texto      | menú cerrado: 150 > 73.2, «STUDIO» todavía se ve               |

    # Con el menú abierto la cabecera es más alta que al crear el observador: el aviso llega al cruzar la
    # línea de la cabecera CERRADA y la decisión usa el borde medido en ESE momento. Si «STUDIO» se esconde
    # antes bajo el menú abierto, el disparo espera a esa línea: el menú ya tapa el hero.

  @s8
  Scenario: Monótono (P2) — acoplada, desconecta el observador y NINGUNA entrega posterior la devuelve a «texto», aunque «STUDIO» vuelva a verse
    Given la cabecera montada con IntersectionObserver sustituido, la geometría de referencia y el logo ya acoplado con vuelo (una entrega inicial con «STUDIO» en bottom 400 y otra en 73.2), con el atributo style del <a> anotado
    When el observador entrega otra entrada con «STUDIO» de nuevo a la vista (bottom 400, isIntersecting true), como al volver arriba del todo
    Then el <a> sigue en data-logo="caligrafia" y data-vuelo="si", con el MISMO atributo style que tenía
    And disconnect se ha llamado EXACTAMENTE una vez (al acoplar) y el constructor de IntersectionObserver EXACTAMENTE una vez
    # En el navegador esa entrega ya no llega (el observador está desconectado); el test la fuerza para
    # probar que la monotonía no depende SOLO de desconectar: la transición pura es monótona por sí
    # misma (@s24). Volver arriba del todo en un navegador real: @s30.

  @s9
  Scenario: Sin persistencia — «la visita» es la vida del documento: montar de nuevo (lo que hace recargar arriba) vuelve a «texto», y nada se lee ni se escribe en storage (LA-C5, LA-9)
    Given Storage.prototype.getItem y Storage.prototype.setItem espiados, y una primera vida de la cabecera que acopló con vuelo y se desmontó
    When se monta de nuevo <Cabecera /> y todavía no hay ninguna entrega de su observador
    Then el <a> está en data-logo="texto" y data-vuelo="no", sin atributo style
    And el constructor de IntersectionObserver suma EXACTAMENTE dos llamadas, una por vida
    And ni getItem ni setItem se han llamado en ningún momento de las dos vidas: ni sessionStorage ni localStorage
    # Guardar el estado (alternativa (b) de LA-9) contradiría «recargar arriba vuelve a texto» y es
    # persistencia sin necesidad (I-2, N-4). La recarga real, arriba y a mitad de página: @s30.

  # ---------------------------------------------------------------------------------------------
  # ¿VUELO O CAMBIO INSTANTÁNEO? LA TRANSFORMACIÓN FLIP (LA-C2, LA-C6, LA-C7; LA-1, LA-2, LA-9).
  # ---------------------------------------------------------------------------------------------

  @s10
  Scenario Outline: Vuela SOLO si no es la primera entrega y el rótulo del hero está a menos de un viewport por encima; si no, acopla sin vuelo (LA-C6)
    Given la cabecera montada con IntersectionObserver sustituido y la geometría de referencia (window.innerHeight = 812), con el origen desplazado en vertical hasta que su borde inferior vale <borde del origen>
    And <antecedente>
    When el observador entrega una entrada de «STUDIO» con boundingClientRect.bottom = <bottom de STUDIO> e isIntersecting false
    Then el <a> tiene data-logo="caligrafia" y data-vuelo="<data-vuelo>"
    And el <a> <style del a>
    And disconnect se ha llamado EXACTAMENTE una vez

    Examples:
      | antecedente                                              | borde del origen | bottom de STUDIO | data-vuelo | style del a                                                   | caso                                                                    |
      | ninguno: es la entrega INICIAL                           | 42               | 73.2             | no         | NO lleva atributo style                                       | recarga ya desplazada, con el rótulo cerca: nada que haya visto subir   |
      | ninguno: es la entrega INICIAL                           | -2400            | -2369            | no         | NO lleva atributo style                                       | carga directa en un ancla lejana (caso límite 2)                        |
      | una entrega inicial con «STUDIO» a la vista (bottom 400) | 42               | 73.2             | si         | lleva "--vuelo-x", "--vuelo-y" y "--vuelo-escala" en su style | cruce por scroll o por un enlace de la nav (casos límite 4 y 6)         |
      | una entrega inicial con «STUDIO» a la vista (bottom 400) | -811             | -780             | si         | lleva "--vuelo-x", "--vuelo-y" y "--vuelo-escala" en su style | 1 px más cerca que un viewport: vuela                                   |
      | una entrega inicial con «STUDIO» a la vista (bottom 400) | -812             | -781             | no         | NO lleva atributo style                                       | exactamente un viewport por encima: frontera, sin vuelo                 |
      | una entrega inicial con «STUDIO» a la vista (bottom 400) | -2400            | -2369            | no         | NO lleva atributo style                                       | salto lejano instantáneo o scroll restaurado tarde (casos límite 3 y 5) |

    # Condición 1 (primera entrega): el observador entrega SIEMPRE una entrada inicial al observe(); si en
    # ella «STUDIO» ya está arriba, es una carga desplazada. Condición 2: bordeInferiorOrigen > −altoViewport,
    # con altoViewport = window.innerHeight (812, NO el 768 de jsdom ni el clientHeight 0 de jsdom: medir
    # otra cosa pone roja la fila −811). Condición 3 (FLIP válido): @s12. Desde el HTML horneado hasta la
    # primera entrega se ve «nails lash studio» un instante: inherente al SSG, y no es CLS (misma celda).

  @s11
  Scenario: El punto de salida del vuelo son tres custom properties en el style del <a>, calculadas con la caja del RÓTULO (origen) y la del <svg> del LOGO (destino), y llegan en la MISMA entrega que los dos atributos (LA-C2, LA-C7)
    Given la cabecera montada con IntersectionObserver sustituido y la geometría de referencia —origen left 365 · top -58 · width 550 · height 100; <svg> del logo left 40 · top 17 · width 137.5 · height 40; el <a> como SEÑUELO left 24 · top 22.4 · width 181 · height 28.8— y una entrega inicial con «STUDIO» a la vista (bottom 400)
    When el observador entrega, en UNA sola llamada al callback, una entrada con «STUDIO» en bottom 73.2
    Then tras esa misma llamada el <a> tiene data-logo="caligrafia" y data-vuelo="si", y su style declara EXACTAMENTE tres propiedades
    And style.getPropertyValue("--vuelo-x") es "325px", style.getPropertyValue("--vuelo-y") es "-75px" y style.getPropertyValue("--vuelo-escala") es "4"
    And ninguna otra etiqueta del documento ha recibido atributo style: ni el <svg> del logo, ni el <svg> del rótulo, ni «STUDIO»
    # x = origen.left − destino.left; y = origen.top − destino.top; escala = origen.width / destino.width,
    # con transform-origin 0 0 (@s15). Medir el <a> (señuelo) daría "341px" / "-80.4px"; escalar por el alto
    # daría "2.5". Las custom properties van en el <a> y el <svg> las HEREDA: así el primer fotograma
    # pintado de la caligrafía ya está en el punto de salida y no hay destello en la esquina. La cabecera
    # es sticky desde y = 0: el destino no se mueve durante el vuelo, y seguir haciendo scroll en cualquier
    # sentido no lo altera (caso límite 8, EN VIVO en @s29).

  @s12
  Scenario Outline: Sin una transformación FLIP válida el logo se acopla SIN vuelo y sin errores (LA-C6.3, LA-C7; casos límite 11 y 12)
    Given la cabecera montada con IntersectionObserver sustituido, la geometría de referencia salvo que <cambio>, console.error espiado y una entrega inicial con «STUDIO» a la vista (bottom 400)
    When el observador entrega una entrada con «STUDIO» en bottom 73.2
    Then el <a> tiene data-logo="caligrafia" y data-vuelo="no", y NO lleva atributo style
    And disconnect se ha llamado EXACTAMENTE una vez y console.error no se ha llamado

    Examples:
      | cambio                                                                        |
      | el documento NO tiene ningún [data-acople="origen"] (hero sin origen)         |
      | el origen mide width 0 (una caja sin layout)                                  |
      | el <svg> del logo mide width 0                                                |

  @s13
  Scenario: El componente NO consulta la preferencia de movimiento, NO anima con JS y NO escucha el scroll: con «reduce» activo marca data-vuelo="si" igual, porque lo resuelve la hoja (LA-1, LA-C6, LA-6)
    Given window.matchMedia sustituido por un espía que responde matches=true, Element.prototype.animate definido como espía, window.addEventListener y document.addEventListener espiados, IntersectionObserver sustituido y la geometría de referencia
    When se completa un acople con vuelo: montaje de <Cabecera />, entrega inicial con «STUDIO» en bottom 400 y entrega con «STUDIO» en 73.2
    Then el <a> tiene data-logo="caligrafia" y data-vuelo="si", con "--vuelo-x", "--vuelo-y" y "--vuelo-escala" en su style
    And matchMedia NO se ha llamado ninguna vez y animate NO se ha llamado ninguna vez
    And ni window.addEventListener ni document.addEventListener han recibido "scroll" ni "resize"
    # La preferencia NO entra en la decisión (LA-C6): la resuelve el `@media (prefers-reduced-motion:
    # reduce)` de la hoja (@s16), sin JS y en caliente. WAAPI (alternativa (a) de LA-1) obligaría a
    # leer matchMedia y dejaría la duración como literal de TS. Escuchar "scroll" con rAF (alternativa
    # (a) de LA-6) mediría en cada fotograma un evento que ocurre una vez.

  # ---------------------------------------------------------------------------------------------
  # DEGRADACIÓN: sin observador o sin hero (LA-C9, LA-C10; casos límite 10 y 11).
  # ---------------------------------------------------------------------------------------------

  @s14
  Scenario Outline: Sin IntersectionObserver o sin «STUDIO» en la página, la marca se queda en «texto» para siempre y sin errores
    Given console.error y document.querySelector espiados, y <situación>
    When se monta <Cabecera /> con render(), corren sus efectos y después se desmonta
    Then mientras estuvo montada, el <a> estuvo en data-logo="texto" y data-vuelo="no", sin atributo style
    And <observador>
    And console.error no se ha llamado y ni el montaje ni el desmontaje lanzan ninguna excepción

    Examples:
      | situación                                                                                                              | observador                                                                                                           |
      | window.IntersectionObserver AUSENTE (jsdom 25 tal cual, o un navegador antiguo) y un documento CON los dos data-acople | document.querySelector NO se ha llamado con ningún selector que contenga "data-acople": el efecto sale sin hacer nada |
      | IntersectionObserver sustituido y un documento SIN [data-acople="disparo"] (una página sin hero, p. ej. las legales)   | el constructor de IntersectionObserver NO se ha llamado, ni observe                                                  |
      | IntersectionObserver sustituido y un documento con [data-acople="disparo"] pero SIN [data-acople="origen"]             | el constructor se ha llamado EXACTAMENTE una vez: sin origen hay acople sin vuelo (@s12), no degradación             |

    # Una sola guarda (LA-C10): `typeof IntersectionObserver !== 'function'` → el efecto sale sin hacer nada
    # (precedente galeria.test.tsx @s23). La tercera fila es el contraste: el origen solo decide el vuelo.

  # ---------------------------------------------------------------------------------------------
  # LA HOJA: lo que ningún render ve (LA-C3; LA-1, LA-4, LA-10, LA-11, LA-12, LA-13). BYTES de
  # "src/components/logo-acoplado.module.scss" con cuerpoDelBloque. ANCLA POSITIVA SIEMPRE primero.
  # ---------------------------------------------------------------------------------------------

  @s15
  Scenario: El vuelo vive en la hoja —0,9 s con la curva de «STUDIO», de 0,35 a opaco desde el punto que marcan las custom properties— y el texto se desvanece en 0,4 s lineal (LA-1, LA-10)
    Given los bytes de "src/components/logo-acoplado.module.scss"
    When se leen sus bloques con cuerpoDelBloque
    Then la hoja SÍ contiene ".marca", ".logoTexto", ".logoCaligrafia", "@keyframes acoplar" y "@keyframes soltar" (ANCLA POSITIVA)
    And el bloque ".marca[data-vuelo='si'] .logoCaligrafia" declara "animation: acoplar 0.9s cubic-bezier(0.45, 0, 0.25, 1)"
    And el bloque ".marca[data-vuelo='si'] .logoTexto" declara "animation: soltar 0.4s linear"
    And el bloque "from" de "@keyframes acoplar" declara "transform: translate(var(--vuelo-x), var(--vuelo-y)) scale(var(--vuelo-escala))" y "opacity: 0.35", y "@keyframes acoplar" NO tiene bloque "to" ni "100%"
    And "@keyframes soltar" declara en "from" "opacity: 1" y "visibility: visible", y en "to" "opacity: 0" y "visibility: visible"
    And el bloque base ".logoCaligrafia" declara "transform-origin: 0 0"
    And la hoja contiene EXACTAMENTE dos "@keyframes", y toda declaración "animation" fuera del bloque "@media (prefers-reduced-motion: reduce)" está en un selector que incluye "[data-vuelo='si']"
    And la hoja NO contiene "animation-fill-mode", "will-change" ni "!important", y ninguna declaración "animation" contiene "forwards", "backwards" ni "both"
    # El `to` de `acoplar` es la BASE (transform none, opacity 1): lo translúcido y desplazado vive SOLO en
    # el `from` (I-4), así que al acabar no queda nada inline ni congelado. `soltar` fuerza visibility
    # visible mientras dura porque la base de «caligrafia» ya oculta el texto (@s17); al acabar vuelve a la
    # base. La curva es la de «STUDIO» (hero.module.scss: `revelarStudio 0.6s cubic-bezier(0.45, 0, 0.25,
    # 1)`): el sitio se mueve con una sola voz. 0,9 s < 5 s: fuera de SC 2.2.2. Lo que se VE: @s29.

  @s16
  Scenario: Con prefers-reduced-motion: reduce el cambio es INSTANTÁNEO —animation: none sobre el selector COMPLETO del vuelo, y DESPUÉS de él—, sin JS (LA-11, C-4)
    Given los bytes de "src/components/logo-acoplado.module.scss"
    When se lee su bloque "@media (prefers-reduced-motion: reduce)"
    Then la hoja SÍ contiene EXACTAMENTE un "@media (prefers-reduced-motion: reduce)" (ANCLA POSITIVA)
    And dentro de él, el bloque ".marca[data-vuelo='si'] .logoCaligrafia" declara "animation: none" y el bloque ".marca[data-vuelo='si'] .logoTexto" declara "animation: none"
    And dentro de él NO hay ningún bloque cuyo selector sea ".logoCaligrafia" o ".logoTexto" a secas
    And ese "@media" empieza en la hoja DESPUÉS de las dos reglas del vuelo de @s15
    And dentro de ese "@media" no se declara "opacity", ni "transition", ni ninguna "animation" distinta de "none": sin fundido residual
    # Un @media NO suma especificidad: con el selector corto (0,1,0) perdería contra la regla del vuelo
    # (0,3,0); con el completo empatan y gana el que va DESPUÉS (la misma trampa que documenta
    # hero.module.scss). Si «reduce» se activa a mitad de vuelo, la hoja lo corta en caliente y el logo
    # salta a su sitio (caso límite 9): EN VIVO en @s31. Un fundido (alternativa de LA-11) sería el único
    # caso del repo que anima bajo «reduce».

  @s17
  Scenario: El hueco es estable por construcción —las dos representaciones en la MISMA celda de una rejilla— y la base es el estado horneado: solo data-logo="caligrafia" invierte las visibilidades (LA-4, I-4)
    Given los bytes de "src/components/logo-acoplado.module.scss"
    When se leen sus bloques con cuerpoDelBloque
    Then el bloque ".marca" declara "display: inline-grid" (ANCLA POSITIVA)
    And los bloques base ".logoTexto" y ".logoCaligrafia" declaran, cada uno, "grid-area: 1 / 1"
    And el bloque base ".logoCaligrafia" declara "visibility: hidden", y el bloque base ".logoTexto" NO declara "visibility"
    And el bloque ".marca[data-logo='caligrafia'] .logoCaligrafia" declara "visibility: visible" y el bloque ".marca[data-logo='caligrafia'] .logoTexto" declara "visibility: hidden"
    And la hoja NO contiene "data-logo='texto'" ni 'data-logo="texto"'
    And ningún bloque cuyo selector contiene ".logoTexto" o ".logoCaligrafia" declara "display: none", "position: absolute" ni "position: fixed"
    And el bloque ".soloLectores" declara la técnica clip/1 px del <h1> del hero —"position: absolute", "width: 1px", "height: 1px", "overflow: hidden", "clip: rect(0, 0, 0, 0)" y "white-space: nowrap"— y NO declara "display: none" ni "visibility: hidden"
    # La caja del enlace mide el máximo de las dos representaciones en los DOS estados y desde el primer
    # pintado: cambiar de estado no mueve nada (cero CLS; medido EN VIVO en @s32). visibility: hidden no
    # altera el layout; display: none sí. Ninguna regla depende de [data-logo='texto']: si el atributo
    # faltara, se vería la marca. `display: none` o `visibility: hidden` en el <span> solo para lectores
    # vaciarían el nombre accesible en el navegador con toda la suite verde (motivo (b) de LA-5).

  @s18
  Scenario: El logo caligráfico mide 2,5 rem de alto declarados en la hoja, con un tope DURO de 2,75 rem: la cabecera no pasa de los 76 px que F-06 @s11 deriva a mano (LA-13)
    Given los bytes de "src/components/logo-acoplado.module.scss"
    When se leen todos los bloques cuyo selector contiene ".logoCaligrafia", incluidos los de dentro de cualquier "@media"
    Then el bloque base ".logoCaligrafia" declara "height: 2.5rem" (ANCLA POSITIVA)
    And ninguno de esos bloques declara "height", "min-height" ni "max-height" con un valor que no esté en rem o que supere 2.75rem
    And ninguno de esos bloques declara "width" en px
    # 2,5 rem = 40 px; el ancho sale de la relación del viewBox, 4120 : 1200 → ≈ 8,583 rem ≈ 137 px
    # (dimensiones declaradas en la hoja, no por la fuente: el hueco no cambia mientras Great Vibes carga,
    # caso límite 15). Tope 2,75 rem = 44 px, el min-height de la hamburguesa, que ya fija la fila en móvil:
    # un logo más alto haría crecer la cabecera y mentir en silencio al `scroll-padding-top` de
    # `_base.scss`, que deriva los 76 px SIN leer la hoja. El alto real, en los dos estados: @s32.

  @s19
  Scenario: La firma se pinta en --ink con Great Vibes, sin opacity en la base, sin --accent y sin capturar clics; y no hereda las minúsculas ni el espaciado de «nails lash studio» (LA-12, LA-C3, LA-C12)
    Given los bytes de "src/components/logo-acoplado.module.scss" y el módulo "src/lib/puerta-contraste.ts"
    When se leen los bloques de la hoja y la matriz de contraste
    Then un bloque cuyo selector empieza por ".logoCaligrafia" declara "fill: var(--ink)", y otro (o el mismo) "font-family: 'Great Vibes', cursive" (ANCLA POSITIVA)
    And el bloque base ".logoCaligrafia" declara "pointer-events: none"
    And fuera de los "@keyframes" ningún bloque de la hoja declara "opacity"
    And la hoja NO contiene "var(--accent)" ni, sin distinguir mayúsculas, "#c05576"
    And el bloque ".marca" NO declara "text-transform" ni "letter-spacing", y el bloque ".logoTexto" declara "font-family: 'Gilda Display', serif", "text-transform: lowercase" y "letter-spacing: 0.06em"
    And MINIMO_DE_PARES sigue valiendo 18 y MATRIZ_DE_USO conserva EXACTAMENTE una fila cuyo uso empieza por "logo sobre la cabecera translúcida" (A-15): sin fila nueva
    # Contraste (LA-12): --ink sobre --header-bg (88 %) con el peor under posible, negro puro: 5,3809 ≥ 4,5.
    # Ya lo vigila la fila A-15 «logo»: una fila se define por el PAR de colores, no por la tipografía. El
    # eslabón que faltaba —que el logo use DE VERDAD --ink— es este test de bytes (--accent daría 4,05 <
    # 4,5). El 0,35 del vuelo (≈ 1,70:1) existe solo en el `from` de un keyframe de 0,9 s, en un nodo
    # aria-hidden [I: WCAG no evalúa fotogramas intermedios]; A-4 (exención de logotipos) sigue ABIERTA.
    # pointer-events: none — durante el vuelo el <svg>, escalado, pasa por encima de la nav: un clic ahí
    # no debe caer en la marca (caso límite 20; EN VIVO en @s33).
    # [DERIVADO, D-5] Las reglas que se mudan de `.marca` (cabecera.module.scss) llevan `text-transform:
    # lowercase` y `letter-spacing: 0.06em`. Si se quedaran en `.marca`, el <text> del <svg> las HEREDARÍA:
    # la firma saldría en minúsculas y espaciada 60 unidades por letra, y la «h» se saldría del viewBox (el
    # recorte lateral que F-07 ya sufrió). Van en `.logoTexto`. Comprobación visual: @s28.

  # ---------------------------------------------------------------------------------------------
  # ENMIENDAS SIN ROMPER: F-06 (cabecera), F-07 (hero), F-03/F-04/F-05 (contraste, <h1>, anclas).
  # ---------------------------------------------------------------------------------------------

  @s20
  Scenario: ENMIENDA a F-06 — las reglas de .marca se MUDAN a la hoja nueva, el @media de 820 px se queda y el horneado de la cabecera conserva lo que F-06 protege (LA-14)
    Given los bytes de "src/components/cabecera.module.scss" y renderToString(<Cabecera />)
    When se comparan con lo que protegen F-06 @s12, @s16 y @s17
    Then cabecera.module.scss SÍ contiene ".cabecera" y "@media (max-width: 820px)", y NO contiene "767px" (ANCLAS: F-06 @s17 intacto)
    And cabecera.module.scss NO contiene ningún bloque ".marca": sus reglas viven ahora en logo-acoplado.module.scss
    And el horneado de la cabecera sigue conteniendo "Nails Lash Studio", una nav con aria-label="Principal", y el botón del menú con aria-expanded="false" junto a sus enlaces "#servicios-titulo" y "#contacto-titulo" (F-06 @s12 y @s16)
    # cabecera.test.tsx @s17 lee esta hoja con readFileSync: la mudanza no la rompe porque el @media se
    # queda. @s15 y @s27 de F-06 no se tocan.

  @s21
  Scenario: ENMIENDA a F-07 — Hero.tsx solo gana dos atributos estáticos, data-acople="origen" en el <svg> del rótulo y data-acople="disparo" en el <span> de «Studio», y el <h1> sigue intacto (LA-C9, LA-8)
    Given el hero renderizado con renderToString(<Hero />)
    When se buscan en ese HTML los atributos data-acople
    Then el HTML contiene EXACTAMENTE dos "data-acople=" (ANCLA POSITIVA sobre el recuento)
    And 'data-acople="origen"' está en la etiqueta de apertura del <svg> que lleva viewBox="-80 -840 4120 1200"
    And 'data-acople="disparo"' está en la etiqueta de apertura del SEGUNDO <span> del <h1>, cuyo texto es exactamente "Studio"
    And sigue habiendo EXACTAMENTE un "<h1", con EXACTAMENTE dos <span>, y el HTML sigue casando con /<\/span>\s<span\b/: el espacio real de F-07
    And 'id="tinta-marca"' e 'id="trazo-marca"' aparecen EXACTAMENTE una vez cada uno, y el HTML sigue conteniendo 'data-firma="corriendo"'
    # Stryker NO muta atributos JSX literales (E1.d): este test, con los literales escritos A MANO, es
    # su única defensa. Subir el estado a home.tsx (alternativa (a) de LA-8) cambiaría las firmas de Hero y
    # Cabecera y sacaría la lógica de `mutate`.

  @s22
  Scenario: El hero sigue su ceremonia sin enterarse del acople, y el vuelo no crea nodos ni toca el rótulo: vuela el propio <svg> del logo (LA-C8, LA-16, LA-2)
    Given <Cabecera /> y <Hero /> montados juntos en jsdom con render(), window.matchMedia sustituido SIN preferencia de movimiento reducido (la caligrafía del hero en marcha: data-firma="corriendo" y el botón "Completar la firma" presente), IntersectionObserver sustituido, la geometría de referencia aplicada a los data-acople REALES del hero y el número de elementos del documento anotado
    When el observador entrega una entrada inicial con «STUDIO» en bottom 400 y, después, otra en 73.2
    Then el <a> tiene data-logo="caligrafia" y data-vuelo="si" (ANCLA POSITIVA: hubo acople con vuelo)
    And el hero sigue con data-firma="corriendo" y el botón "Completar la firma" sigue existiendo
    And el documento tiene el MISMO número de elementos que antes del acople, EXACTAMENTE dos <svg> con viewBox="-80 -840 4120 1200" (el rótulo y el logo) y EXACTAMENTE un elemento con id "tinta-marca" y uno con id "trazo-marca"
    And el <svg> del rótulo del hero no tiene atributo style ni data-vuelo, y el <svg> del logo no lleva ningún atributo mask
    # El logo muestra la firma COMPLETA (no hereda la máscara). Durante 0,9 s la firma completa a 0,35
    # pasa sobre un rótulo a medio escribir que ya está bajo el cristal: aceptado (LA-C8). Un fantasma
    # clonado (alternativa (a) de LA-2) duplicaría los ids y dejaría un nodo huérfano si algo falla.

  @s23
  Scenario: En la home horneada sigue habiendo UN solo <h1>, el logo no es ni contiene un encabezado, los ids del rótulo siguen siendo únicos y la igualdad de anclas no cambia (F-04, F-05, F-06; LA-C1)
    Given la home renderizada con renderToString(<HelmetProvider><Home /></HelmetProvider>), como la hornea el SSG
    When se inspeccionan sus encabezados, sus ids y sus anclas
    Then el HTML contiene EXACTAMENTE un "<h1" y EXACTAMENTE un <a> con data-logo (ANCLAS POSITIVAS)
    And el fragmento del <a> con data-logo no contiene "<h1", "<h2", "<h3", "<h4", "<h5", "<h6" ni 'role="heading"'
    And 'id="tinta-marca"' e 'id="trazo-marca"' aparecen EXACTAMENTE una vez cada uno en el HTML, y el fragmento del <a> con data-logo no contiene " id="
    And inspeccionarAnclas sobre la ruta "/" con ese HTML devuelve 0 violaciones, y el <a> del logo no lleva 'href="#'
    # El logo no lleva href="#…" ni id: no cambia los conjuntos de la puerta de anclas vivas (F-06).
    # Cero terceros (F-05/F-21): Great Vibes ya está autohospedada; ninguna petición nueva (EN VIVO, @s33).

  # ---------------------------------------------------------------------------------------------
  # LA LÓGICA PURA (LA-C11): "src/components/logo-acoplado-logica.ts", sin DOM, mordida POR VALOR.
  # Geometría asimétrica y distinta de cero en todos los ejemplos (hallazgo del judge de la galería).
  # ---------------------------------------------------------------------------------------------

  @s24
  Scenario Outline: Las decisiones del acople son PURAS y se muerden en sus fronteras —transición monótona con "<="; vuelo solo si no es la primera entrega y el origen está a menos de un viewport—
    Given la función "<función>" de "src/components/logo-acoplado-logica.ts"
    When se evalúa con <entrada>
    Then devuelve <salida>

    Examples: estadoTrasObservar(actual, bordeInferiorDisparo, bordeInferiorCabecera)
      | función            | entrada                  | salida       |
      | estadoTrasObservar | "texto", 73.2, 73.2      | "caligrafia" |
      | estadoTrasObservar | "texto", 73.7, 73.2      | "texto"      |
      | estadoTrasObservar | "texto", 12.5, 73.2      | "caligrafia" |
      | estadoTrasObservar | "texto", -640, 73.2      | "caligrafia" |
      | estadoTrasObservar | "texto", 912, 73.2       | "texto"      |
      | estadoTrasObservar | "texto", 150, 260        | "caligrafia" |
      | estadoTrasObservar | "caligrafia", 912, 73.2  | "caligrafia" |
      | estadoTrasObservar | "caligrafia", 73.7, 73.2 | "caligrafia" |

    Examples: debeVolar({ primeraObservacion, bordeInferiorOrigen, altoViewport })
      | función   | entrada            | salida |
      | debeVolar | false, 42, 812     | true   |
      | debeVolar | true, 42, 812      | false  |
      | debeVolar | false, -811, 812   | true   |
      | debeVolar | false, -812, 812   | false  |
      | debeVolar | false, -2400, 812  | false  |
      | debeVolar | true, -2400, 812   | false  |

    # Fronteras (LA-C11): disparo IGUAL a la cabecera → «caligrafia», medio píxel por debajo → «texto»;
    # origen IGUAL a −altoViewport → sin vuelo, 1 px por encima → vuelo. Desde «caligrafia» siempre
    # «caligrafia» (P2): la monotonía no depende solo de desconectar. Nada se deriva en la carga del módulo.

  @s25
  Scenario Outline: La geometría del vuelo es PURA y se muerde por valor —FLIP con escala por el ANCHO y nula si alguna caja no tiene ancho; variables con su unidad; margen redondeado hacia ARRIBA—
    Given la función "<función>" de "src/components/logo-acoplado-logica.ts"
    When se evalúa con <entrada>
    Then devuelve <salida>

    Examples: transformacionFlip(origen, destino) — cajas { left, top, width, height }
      | función            | entrada                                        | salida                         |
      | transformacionFlip | { 365, -58, 550, 100 }, { 40, 17, 137.5, 40 }  | { x: 325, y: -75, escala: 4 }  |
      | transformacionFlip | { 60, -41, 206.25, 60 }, { 24, 16, 137.5, 40 } | { x: 36, y: -57, escala: 1.5 } |
      | transformacionFlip | { 365, -58, 550, 100 }, { 40, 17, 0, 40 }      | null                           |
      | transformacionFlip | { 365, -58, 0, 100 }, { 40, 17, 137.5, 40 }    | null                           |
      | transformacionFlip | { 365, -58, 550, 100 }, { 40, 17, -3, 40 }     | null                           |

    Examples: variablesDeVuelo(flip)
      | función          | entrada                            | salida                                                                     |
      | variablesDeVuelo | { x: 325, y: -75, escala: 4 }      | { "--vuelo-x": "325px", "--vuelo-y": "-75px", "--vuelo-escala": "4" }      |
      | variablesDeVuelo | { x: -12.5, y: 0.75, escala: 1.5 } | { "--vuelo-x": "-12.5px", "--vuelo-y": "0.75px", "--vuelo-escala": "1.5" } |

    Examples: margenDeRaiz(altoCabecera)
      | función      | entrada | salida              |
      | margenDeRaiz | 73.2    | "-74px 0px 0px 0px" |
      | margenDeRaiz | 74      | "-74px 0px 0px 0px" |
      | margenDeRaiz | 70.01   | "-71px 0px 0px 0px" |

    # La escala sale del ANCHO (la dimensión mayor, la más precisa); con alto 100 frente a 40 una escala por
    # el alto daría 2,5 y no 4. `variablesDeVuelo` no redondea: el navegador trabaja en fracciones de píxel.
    # ⚠ D-1: `margenDeRaiz` lleva hoy el ceil de la spec (73,2 → "-74px…", distinto de Math.round). Si la
    # puerta acepta D-1 (floor), las filas pasan a "-73px…", "-74px…" y "-70px…": cambia el valor, no la forma.

  # ---------------------------------------------------------------------------------------------
  # FUENTE Y MUTACIÓN (LA-C11, I-7).
  # ---------------------------------------------------------------------------------------------

  @s26
  Scenario: Guardas de FUENTE — sin matchMedia, sin WAAPI, sin scroll, sin storage, sin red y sin el literal de la marca en el componente ni en su lógica
    Given los bytes de "src/components/LogoAcoplado.tsx" y "src/components/logo-acoplado-logica.ts"
    When se buscan en ellos los literales vigilados
    Then LogoAcoplado.tsx SÍ contiene "export function LogoAcoplado", "IntersectionObserver", "data-logo", "data-vuelo", "partirNombre" y "VISTA_MARCA", y logo-acoplado-logica.ts SÍ contiene "export function" (ANCLAS POSITIVAS, primero)
    And ninguno de los dos contiene "matchMedia", ".animate(", "requestAnimationFrame", "startViewTransition", "animation-timeline", "'scroll'", '"scroll"', "localStorage", "sessionStorage", "document.cookie", "fetch(" ni "XMLHttpRequest"
    And ninguno de los dos contiene "Nails Lash", "-80 -840 4120 1200", "tinta-marca" ni "trazo-marca" (los comentarios también son bytes)
    And LogoAcoplado.tsx NO contiene "aria-label", "animation" ni "dangerouslySetInnerHTML"
    # NINGUNA guarda veta `if (`, `?`, `&&` ni `||`: los dos ficheros están en `mutate` y Stryker los lee
    # instrumentados. Las de aquí solo vetan literales que Stryker nunca inyecta. La prueba de que se USA
    # la fuente única es de comportamiento (@s4); esta es su apoyo.

  @s27
  Scenario: LogoAcoplado.tsx y logo-acoplado-logica.ts entran en `mutate` y la mutación los deja al 100 % (LA-C11)
    Given los bytes de "stryker.config.json"
    When se lee su lista "mutate" y el mutation_tester ejecuta la prueba de mutación acotada con --mutate a esos ficheros
    Then "mutate" contiene EXACTAMENTE una vez "src/components/LogoAcoplado.tsx" y EXACTAMENTE una vez "src/components/logo-acoplado-logica.ts", y sigue conteniendo "src/components/Cabecera.tsx" y "src/components/Hero.tsx"
    And "thresholds.break" sigue valiendo 100
    And la puntuación de LogoAcoplado.tsx y de logo-acoplado-logica.ts es 100 %, con como mucho el mutante equivalente del "[]" del efecto de montaje desactivado en su línea y justificado en progress/mutation_logo_acoplado.md
    And Cabecera.tsx y Hero.tsx, re-medidos con --mutate, siguen al 100 %

  # =============================================================================================
  # (B) VERIFICACIÓN EN VIVO CON CHROME. Se hace sobre `dist/` servido (pnpm build → servir → Chrome
  # real + CDP), NUNCA con jsdom (I-8). Eje [NV]: jsdom no hace layout, no pinta, no anima y no trae
  # IntersectionObserver. Los corre el LEAD tras el TDD y las cinco puertas verdes, y el resultado va a
  # progress/verificacion_viva_logo_acoplado.md. NO son puerta unitaria. PROHIBIDO fingirlos con jsdom
  # y PROHIBIDO crear tests build-based para ellos (precedente tipografia_global @s8/@s9).
  # =============================================================================================

  @s28 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] El HTML crudo de dist/ hornea la marca en «texto», con las dos representaciones y sin style; la hidratación no se queja y la firma se pinta entera
    Given el dist/ de producción (pnpm build con las cinco puertas verdes) servido y abierto en Chrome real vía CDP
    When se lee dist/index.html sin ejecutar JS y, después, se carga la página arriba del todo con la consola abierta
    Then el <a> de la marca del HTML crudo lleva data-logo="texto", data-vuelo="no" y href="/NailsLashStudioWeb/", contiene sus dos <span> y su <svg>, y no lleva atributo style
    And tras hidratar arriba del todo el <a> sigue en data-logo="texto", y la consola no muestra ningún aviso de hidratación ni ningún error
    And con JavaScript desactivado se ve «nails lash studio» y la nav horneada intacta
    And el <text> de la firma computa text-transform "none" y letter-spacing "normal", y su getBBox() cabe dentro del viewBox -80 -840 4120 1200: ni minúsculas, ni letras separadas, ni la «h» recortada (D-5)

  @s29 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] Al quedar «STUDIO» entero bajo el borde de la cabecera, «Nails Lash» sube encogiéndose desde el rótulo hasta la esquina en 0,9 s, de translúcido a opaco, mientras «nails lash studio» se desvanece
    Given el mismo dist/ servido en Chrome real a 1280 × 800 y a 320 × 640, sin preferencia de movimiento reducido y cargado arriba del todo
    When se hace scroll hacia abajo en pasos de 1 px, de 2 px y de 100 px (tres pasadas, recargando arriba entre ellas) hasta dejar «STUDIO» por encima del borde inferior de la cabecera
    Then mientras asoma 1 px de «STUDIO» bajo la cabecera, el <a> sigue en data-logo="texto"; y en las TRES pasadas pasa a data-logo="caligrafia" con data-vuelo="si" en cuanto el borde inferior de «STUDIO» es <= el de la cabecera, sin tener que volver a bajar (D-1)
    And en ese instante getAnimations() del <svg> del logo devuelve EXACTAMENTE una animación, "acoplar", de 900 ms con easing "cubic-bezier(0.45, 0, 0.25, 1)", y la del <span> «nails lash studio» EXACTAMENTE una, "soltar", de 400 ms "linear"
    And el primer fotograma pintado de la firma está sobre el rótulo del hero, no en la esquina (sin destello), con opacidad ≈ 0,35; al terminar queda en su sitio con opacidad 1 y transform "none"
    And si se sigue haciendo scroll durante el vuelo, en cualquier sentido, ni la trayectoria ni el destino cambian (caso límite 8), y la firma pasa POR ENCIMA del cristal de la cabecera, nítida
    And document.documentElement.scrollWidth no supera clientWidth en ningún fotograma del vuelo: no hay desbordamiento horizontal (caso límite 20)
    And con un enlace de la nav (scroll suave) el acople llega a mitad del scroll y el vuelo ocurre mientras la página baja (caso límite 4)
    And con la caligrafía del hero a medio escribir, la firma completa a 0,35 pasa sobre el rótulo a medias, que sigue escribiéndose y termina en su reloj de 15 s (LA-C8, caso límite 14)

  @s30 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] La caligrafía se queda al volver arriba (P2); recargar arriba vuelve a «texto»; recargar ya desplazada acopla al instante, sin vuelo
    Given el mismo dist/ en Chrome real, con el logo ya acoplado tras el vuelo de @s29
    When se recorren, en orden: volver arriba del todo, recargar arriba, recargar a mitad de página, cargar la URL con "#contacto-titulo", hacer clic en el logo, y seguir un enlace y volver con «Atrás»
    Then arriba del todo, con «STUDIO» otra vez a la vista, el <a> sigue en data-logo="caligrafia" y el rótulo del hero está en su sitio (P2, caso límite 7)
    And tras recargar arriba del todo, el <a> vuelve a data-logo="texto"
    And tras recargar a mitad de página o cargar el ancla, el <a> pasa a data-logo="caligrafia" con data-vuelo="no" y getAnimations() del <svg> del logo está vacío: sin vuelo (casos límite 2 y 5)
    And el clic en el logo navega a "/NailsLashStudioWeb/" y la página nueva arranca en «texto» (caso límite 18)
    And al volver con «Atrás» desde bfcache, la marca conserva el estado con el que se fue (caso límite 17)

  @s31 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] Con prefers-reduced-motion: reduce (emulado con CDP) el cambio es instantáneo, sin vuelo ni fundido; y activarlo a mitad de vuelo lo corta
    Given el mismo dist/ en Chrome real con Emulation.setEmulatedMedia y prefers-reduced-motion "reduce", cargado arriba del todo
    When se hace scroll hasta que «STUDIO» queda bajo la cabecera
    Then el <a> pasa a data-logo="caligrafia" y data-vuelo="si", y en ese mismo fotograma getAnimations() del <svg> del logo y del <span> «nails lash studio» está vacío: «Nails Lash» aparece en su sitio, opaca, y «nails lash studio» desaparece sin fundido
    And con "no-preference", activar "reduce" a mitad de un vuelo lo corta en caliente: el logo queda en su sitio con transform "none" y opacidad 1 (caso límite 9)
    And [OBSERVACIÓN D-3, NO contrato] con el logo acoplado bajo "reduce", se retira "reduce" y se anota en progress/ si el vuelo se reproduce desde el origen antiguo, para que decida el lead

  @s32 @verificacion-viva
  Scenario Outline: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] A <ancho> px la cabecera mide lo MISMO en los dos estados y no más de 76 px, la fila no envuelve y el acople no produce ningún desplazamiento de diseño
    Given el mismo dist/ en Chrome real con el viewport a <ancho> px de ancho, un PerformanceObserver de "layout-shift" con buffered true, y el alto del <header> y la caja del <a> anotados en «texto»
    When se hace scroll hasta el acople, se espera al final del vuelo y se vuelve arriba
    Then el alto del <header> en «caligrafia» es IDÉNTICO al de «texto», y los dos son <= 76 px
    And la caja del <a> (getBoundingClientRect) es idéntica en los dos estados, y el <svg> del logo mide 40 px de alto
    And la suma de los valores "layout-shift" registrados desde la carga es 0
    And la marca y la hamburguesa (o la nav horizontal) quedan en UNA fila: la cabecera no envuelve
    And con la petición de Great Vibes bloqueada (Network.setBlockedURLs) el alto del <header> y la caja del <a> no cambian (caso límite 15)

    Examples:
      | ancho |
      | 320   |
      | 360   |
      | 375   |
      | 390   |
      | 414   |
      | 768   |
      | 1280  |

    # 320 px cubre también el zoom de 200-400 % y el reflow a 320 px CSS (caso límite 16). Cálculo del
    # spec_partner: 320 − 2 × 24 = 272 px útiles; máx(«nails lash studio» ≈ 180 px [I, sin medir], 137 px)
    # + 16 px de gap + 44 px de hamburguesa ≈ 240 px. Si «nails lash studio» mide más de lo supuesto, se anota.

  @s33 @verificacion-viva
  Scenario: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] En el árbol de accesibilidad de Chrome el enlace se llama «Nails Lash Studio» en los dos estados, la firma no roba clics durante el vuelo y se lee a su tamaño, sin terceros
    Given el mismo dist/ en Chrome real, con Accessibility.getFullAXTree de CDP
    When se consulta el nodo del enlace de la marca en «texto» y en «caligrafia», y durante un vuelo se hace clic sobre un enlace de la nav que la firma escalada cubre
    Then en los dos estados hay EXACTAMENTE un nodo "link" con nombre "Nails Lash Studio", y ningún descendiente accesible suyo aporta «Nails Lash» ni un segundo «Nails Lash Studio»
    And el <svg> del logo computa pointer-events "none", y el clic navega al destino del enlace de la nav, no a "/NailsLashStudioWeb/" (caso límite 20)
    And document.fonts.check('33px "Great Vibes"') es true y la fuente se sirve desde el propio sitio: ninguna petición a otro origen (F-05, F-21)
    And la firma en Great Vibes a ≈ 33 px de em se lee con sus trazos finos a 320 y a 1280 px (criterio de proyecto: juicio del lead con captura, A-6)
