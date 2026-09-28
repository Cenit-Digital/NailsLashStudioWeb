# =============================================================================================
# CONTRATO — F-24 `nailbot_flotante`: el robot que se pinta las uñas en la esquina inferior derecha.
# Lanzador SOLO-CLIENTE, animación en bucle con control de pausa (SC 2.2.2), bocadillo descartable
# y un `<dialog>` modal NATIVO que monta su PROPIO ChatNailbot de F-23.
# Estado: APROBADO (gherkin_author, 2026-09-27). Entrada 24 de `feature_list.json` (ver su `puerta_humana`).
# DEPENDE de F-23. Implementación y revisiones: progress/tdd_nailbot_flotante.md.
# =============================================================================================
# FUENTES, EN ORDEN DE MANDO
#   1. `project-spec.md` → «Resolución del craftsman_lead a HS-8..HS-17 (2026-09-27)». MANDA sobre el
#      brief y sobre las propuestas del spec_partner. A-25 (HS-16) queda RESUELTO con la recomendación
#      del lead: «nada de verde ni logo de WhatsApp» (H5) aplica al LANZADOR; el panel monta el
#      ChatNailbot IDÉNTICO al de `#reserva`, con su verde (reserva_chat @s24 lo exige).
#   2. `progress/nailbot_diseno.md` (el brief): H3, H4, H5, L7–L14, bloque «Flotante» del §4, §5.
#   3. `project-spec.md` → «Feature 24».
#   4. `docs/research/asistente-robot/04-a11y-animacion.md` y `05-restricciones-repo.md`. Donde `05`
#      §«Reglas para el nuevo widget» choca con la spec, MANDA LA SPEC: aquí NO hay `aria-expanded`
#      ni `aria-controls`, el `z-index` es 40 y NO > 50 (HS-11), el panel es `<dialog>` nativo y NO un
#      `div role="dialog"`, y el reduced-motion va por el patrón B (animación como opt-in de
#      `no-preference`) y NO con `@media (reduce) { animation: none }`.
#   5. HS-15: del prototipo `nailbot-prototipo.html` se portan SOLO la geometría, los colores
#      decorativos y los tiempos de las `@keyframes`. Su copy («Abrir el chat DE Nailbot…», «Soy
#      Nailbot, te ayudo…», «Cerrar mensaje…»), sus tamaños (pausa de 30/26 px), su `z-index: 50`, su
#      `data-pausado` y su `!important` NO: los tests escriben los literales del BRIEF a mano, así que
#      un copia-pega del prototipo nace rojo.
#
# =============================================================================================
# ARTEFACTOS (brief §5 — fijados: el tdd_craftsman NO elige nombres)
# =============================================================================================
#   src/components/NailbotFlotante.tsx          NUEVO · `export function NailbotFlotante`
#   src/components/nailbot-flotante.module.scss NUEVO
#   src/components/nailbot-flotante-logica.ts   NUEVO · las tres decisiones PURAS de @s6
#   tests: nailbot-flotante.test.tsx · nailbot-flotante-logica.test.ts · nailbot-flotante-estilos.test.ts
#   TOCA: NailbotArte.tsx (pinta `data-animacion` SOLO en la instancia que se lo pide) ·
#         nailbot-arte.module.scss (las `@keyframes`) · src/pages/home.tsx (el montaje) ·
#         src/styles/_base.scss (`--nailbot-lanzador` + `scroll-padding-bottom`) · vitest.setup.ts
#         (doble PROTEGIDO de `showModal`/`close`) · stryker.config.json (+2 en `mutate`).
#   NO TOCA: ChatNailbot (se monta tal cual), los carruseles (F-22), la cabecera (F-06), ni
#         `cabecera.module.scss` (salvo que el lead lo decida tras medir F110 EN VIVO, HS-10 b).
#   FIJADOS AQUÍ (la spec no los nombraba):
#     · selectores de nailbot-flotante.module.scss: .flotante (el contenedor fijo del lanzador, la
#       pausa y el bocadillo) · .lanzador · .pausa · .bocadillo · .cerrarBocadillo · .dialogo ·
#       .cerrarDialogo;
#     · la custom property `--nailbot-lanzador` (en `:root` de `_base.scss`, HS-10 a);
#     · los valores de `data-animacion`: "activa" | "pausada". SIN el atributo = el arte ESTÁTICO de
#       F-23 (el avatar del chat), que no se mueve jamás.
#
# =============================================================================================
# «VERDE ≠ FUNCIONA» — DÓNDE SE ASEVERA CADA COSA
# =============================================================================================
#   · renderToString de la home con `<HelmetProvider>` (lo que hornea el SSG): @s1, NEGATIVA con
#     anclas positivas. El flotante NO viaja horneado (L7), así que el `indexOf` sobre el SSR del botón
#     retirado ya no ve nada: el montaje se prueba en el CLIENTE (@s2, HS-14).
#   · render en jsdom + fireEvent + relojes falsos (`vi.useFakeTimers`) + `matchMedia` espiado con la
#     consulta EXACTA (patrón `galeria.test.tsx:709-715`): @s2, @s3, @s4, @s5, @s7, @s8, @s9, @s10,
#     @s11 → nailbot-flotante.test.tsx. La home entera, con `<HelmetProvider>` (`home.test.tsx`).
#   · `<dialog>`: jsdom 25 NO implementa `showModal`/`close` [V: `05` §2.7]. El doble PROTEGIDO de
#     vitest.setup.ts (solo si faltan): `showModal` pone `open`; `close` lo quita y despacha "close".
#     Se ESPÍAN sobre `HTMLDialogElement.prototype`. Lo nativo NO se prueba en jsdom.
#   · Teclas: un escuchador REAL en `document` (React 17+ delega en la raíz, que cuelga de
#     `document` [I]: se asevera, no se supone): @s11.
#   · Función PURA por valor: @s6 → nailbot-flotante-logica.test.ts. Los 4 s, en 3 999 y 4 000 ms
#     (puntos que NO son múltiplos de ningún ciclo: trampa medida en la galería).
#   · BYTES (`cuerpoDelBloque`, ancla positiva SIEMPRE primero): @s12, @s13, @s14, @s15 →
#     nailbot-flotante-estilos.test.ts.
#   · Build (`pnpm build`): lo corre el LEAD. PROHIBIDO crear tests build-based (L16).
#   · SOLO EN NAVEGADOR REAL (Esc nativo, inercia del fondo, top layer, vuelta y posición real del
#     foco, F110, tamaños reales, gesto atrás, área segura) → lista «VERIFICACIÓN EN VIVO DEL LEAD»
#     al final. NO son escenarios.
#
# =============================================================================================
# ANTI-TAUTOLOGÍA Y PROHIBICIONES
# =============================================================================================
#   ✅ Literales A MANO: los cinco `aria-label`/títulos del brief, el bocadillo, "(prefers-reduced-motion:
#      reduce)", 3 999 / 4 000 ms, las duraciones de las `@keyframes`, 32px, 40, 44.
#   ❌ PROHIBIDO importar de producción el copy ni las constantes de tiempo como valor esperado.
#   ❌ PROHIBIDO `toHaveClass`, aseverar por clase de module y el estado en un `className` condicional:
#      el estado de la animación vive en `data-animacion` y en `aria-pressed` (`05` §2.1).
#   ❌ PROHIBIDO controlar el `<dialog>` con una prop `open` de React: quitar `open` a mano deja el
#      documento bloqueado [V: `04` §6.1]. Se abre con `showModal()` y se cierra con `close()`, siempre.
#   ❌ PROHIBIDO en ficheros de `mutate`: guardas de fuente contra `if (`, `?`, `&&` o `||` (lección del
#      botón retirado, `05` §7). Las de @s15 solo vetan literales que Stryker nunca inyecta.
#   ❌ PROHIBIDO storage de cualquier tipo: «no vuelve en esa visita» (H4) = «en esa CARGA» (L11).
#   ❌ PROHIBIDO pausar la animación automáticamente al abrir el panel: pisaría el estado que eligió
#      la persona (caso límite 9). Con el panel abierto, el robot sigue tras el `::backdrop` y la
#      pausa queda inerte hasta cerrar: conforme [I], el mecanismo de 2.2.2 está a un Esc.
#
# =============================================================================================
# MUTACIÓN (umbral 1.0)
# =============================================================================================
#   100 % en NailbotFlotante.tsx y nailbot-flotante-logica.ts (NUEVOS en `mutate`); RE-MEDIDA en
#   NailbotArte.tsx. Las dependencias `[]` de los efectos de solo-montaje son mutantes EQUIVALENTES
#   con precedente (`Hero.tsx:150-157`, `Galeria.tsx:154-159`): `// Stryker disable next-line` con la
#   justificación escrita en `progress/mutation_nailbot_flotante.md`, nunca a ciegas. `--mutate`,
#   jamás `--testFiles`. Con timeouts, `--concurrency 1`. El SCSS es NO-MUTABLE: lo cubren @s12-@s14.
#
# =============================================================================================
# TRAZA — decisiones, casos límite y huecos → escenario
# =============================================================================================
#   L7 solo cliente → @s1, @s2 · L14 montaje → @s2 (+ apoyo de bytes en @s15) · H5 sin verde → @s3, @s13, @s15
#   H3/L10 bucle + pausa → @s4, @s5, @s12 · L9 arte animado → @s12 · H4/L11 bocadillo → @s7, @s8
#   L8 diálogo nativo → @s9, @s10, @s15 · L13 teclas → @s11 · L12 C43 → @s14
#   HS-8 → @s5 (a), @s12 (b) · HS-9 → @s7, @s8 · HS-10 → @s13, @s14 (a); (b) EN VIVO · HS-11 → @s13
#   HS-12 → @s9, @s10 · HS-13 → @s9, @s10 · HS-14 → @s1, @s2 · HS-15 → cabecera + @s12
#   HS-16 (A-25) → cabecera + @s13 · HS-17 → @s13 (+ EN VIVO)
#   Casos límite: 1 → @s1 · 2 → @s7 · 3 → @s7, @s8 · 4 → @s8 · 5 → @s5 · 6 → @s11 · 7 → @s10 (+ EN
#   VIVO) · 8 → @s10 · 9 → @s9 (+ EN VIVO) · 10, 11, 12 → EN VIVO · 13 → @s2 · 14 → fuera de alcance,
#   declarado: ← y → sobre los chips del chat de `#reserva` pueden mover la galería si está a la vista;
#   es anterior a F-24 y F-24 no lo toca.
# =============================================================================================

Feature: Nailbot flotante — un robot que se pinta las uñas en la esquina, invita a reservar sin nada de verde, se puede pausar, avisa una sola vez y abre el mismo Nailbot en un diálogo modal nativo
  Como visitante quiero, desde cualquier punto de la home, un robot con la estética del salón que me
  invite a reservar y me abra el asistente de F-23 en un diálogo, sin taparme lo que tengo enfocado,
  sin robarles las teclas a los carruseles y con su movimiento bajo mi control; y como responsable
  del proyecto quiero que no exista sin JavaScript, que no toque el HTML horneado ni las cinco
  puertas, y que no guarde nada.

  # ---------------------------------------------------------------------------------------------
  # SOLO CLIENTE Y MONTAJE (L7, L14, HS-14).
  # ---------------------------------------------------------------------------------------------

  @s1
  Scenario: Sin JavaScript no hay flotante — el HTML horneado de la home no trae lanzador, pausa, bocadillo ni diálogo
    Given la home renderizada con renderToString(<HelmetProvider><Home /></HelmetProvider>), como la hornea el SSG
    When se busca el flotante en ese HTML
    Then el HTML SÍ contiene 'id="reserva-titulo"' y contiene EXACTAMENTE una vez "Asistente automático · demo" (ANCLAS POSITIVAS: la home se renderizó y el chat de #reserva de F-23 sí viaja horneado)
    And NO contiene "Abrir el chat con Nailbot para reservar cita", ni "Pausar la animación de Nailbot", ni "¿Te pinto una cita?", ni "Reserva con Nailbot", ni "Cerrar el chat", ni "<dialog"
    And NO contiene "data-animacion": ningún arte animado viaja horneado
    # Sin JS no habría acción: un botón horneado sería un botón muerto (L7). El SSR y la primera
    # pasada de la hidratación devuelven `null` y un efecto de montaje enciende el widget; por eso el
    # HTML de `dist/` no cambia y las puertas 1, 4 y 5 no lo ven (la 2 sí lee el JS: @s15).

  @s2
  Scenario: Tras hidratar, el lanzador aparece DESPUÉS de <main> y ANTES del <footer>, fuera de ambos, y el widget no aporta sección, nav ni heading fuera del diálogo
    Given la home montada en jsdom con render(<HelmetProvider><Home /></HelmetProvider>), matchMedia sustituido (sin preferencia de movimiento reducido) y los efectos de montaje ya ejecutados
    When se localizan el <main>, el botón "Abrir el chat con Nailbot para reservar cita" y el <footer>
    Then existen EXACTAMENTE un <main>, EXACTAMENTE un <footer> y EXACTAMENTE un lanzador (ANCLAS POSITIVAS, antes de comparar posiciones)
    And main.compareDocumentPosition(lanzador) incluye DOCUMENT_POSITION_FOLLOWING y NO incluye DOCUMENT_POSITION_CONTAINED_BY: va después de <main> y fuera de él
    And lanzador.compareDocumentPosition(footer) incluye DOCUMENT_POSITION_FOLLOWING, y el <footer> no contiene al lanzador
    And la home sigue teniendo EXACTAMENTE un <h1>
    And ningún <svg> del arte de Nailbot del documento (el avatar de #reserva y el del lanzador) lleva atributo id, y ningún id que aporte el widget se repite en el documento
    And renderizado a solas, NailbotFlotante —tanto antes como después de pulsar el lanzador— no aporta ningún <section>, <nav>, <h1>, <h3>, <h4>, <h5> ni <h6>, y su único <h2> vive DENTRO del <dialog>
    # El juez rechazó la v1 del botón verde porque su montaje fuera de <main> no tenía test (`05` §7).
    # Aquí la prueba es de CLIENTE (`compareDocumentPosition`), no de build; la guarda de bytes sobre
    # home.tsx (@s15) es solo apoyo. Antes de <Pie />: el robot entra en el orden de tabulación antes
    # que los enlaces del pie (L14).

  # ---------------------------------------------------------------------------------------------
  # EL LANZADOR, LA PAUSA Y EL MOVIMIENTO REDUCIDO (H3, H5, L9, L10, HS-8).
  # ---------------------------------------------------------------------------------------------

  @s3
  Scenario: El lanzador es un botón con nombre propio que anuncia un diálogo — sin «WhatsApp» y sin aria-expanded — y lleva dentro el arte ANIMADO
    Given NailbotFlotante montado en jsdom sin preferencia de movimiento reducido, con los efectos ejecutados, junto a un ChatNailbot montado aparte (el papel de #reserva)
    When se consulta el botón por rol "button" y nombre accesible exacto "Abrir el chat con Nailbot para reservar cita"
    Then existe EXACTAMENTE uno, con type="button" y aria-haspopup="dialog"
    And NO lleva aria-expanded ni aria-controls: con un modal, el lanzador queda inerte mientras el diálogo está abierto
    And su nombre accesible no contiene "WhatsApp" (H5) y su textContent, sin espacios, es la cadena vacía: el nombre lo da el aria-label y su contenido es solo el arte
    And contiene un <svg> con aria-hidden="true", focusable="false" y data-animacion="activa"
    And el <svg> del avatar del ChatNailbot montado aparte NO lleva data-animacion: solo se anima la instancia del lanzador
    # aria-haspopup="dialog" casa con el rol del contenedor que abre (ARIA 1.2 [V: `04` §4.4]).
    # El área (≥ 44×44, criterio de proyecto; el listón AA de SC 2.5.8 es 24×24) la fijan los bytes
    # de @s13/@s14 y su tamaño real se mide EN VIVO.

  @s4
  Scenario Outline: La pausa alterna aria-pressed y data-animacion, su etiqueta NO cambia, va junto al robot y no se recuerda
    Given NailbotFlotante montado sin preferencia de movimiento reducido, con la pausa "Pausar la animación de Nailbot" en aria-pressed="false" y el arte del lanzador en data-animacion="activa"
    When pulso la pausa <pulsaciones>
    Then la pausa tiene aria-pressed="<aria-pressed>" y el arte del lanzador data-animacion="<data-animacion>"
    And el nombre accesible de la pausa sigue siendo exactamente "Pausar la animación de Nailbot" y su type es "button"
    And la pausa NO está dentro del lanzador (ni botón dentro de botón) y ambos son hijos del MISMO contenedor: adyacente al robot (G186)
    And desmontar y volver a montar NailbotFlotante la deja otra vez en aria-pressed="false" y data-animacion="activa": sin persistencia

    Examples:
      | pulsaciones           | aria-pressed | data-animacion |
      | una vez               | true         | pausada        |
      | dos veces seguidas    | false        | activa         |

    # APG Button: con `aria-pressed`, la etiqueta NO cambia (a diferencia del control del hero, que
    # cambia de nombre y NO lleva `aria-pressed`). «Pausar» = CONGELAR (HS-8 b): el CSS lo fija @s12.

  @s5
  Scenario Outline: Con movimiento reducido la pausa NO se monta y el robot queda quieto; activarlo en caliente pausa y recoloca el foco; retirarlo NUNCA reanuda (H3, L10, HS-8 a)
    Given matchMedia sustituido por un espía que devuelve matches=<reduce al montar> SOLO para la consulta exacta "(prefers-reduced-motion: reduce)", con su addEventListener y removeEventListener espiados
    And <preparación>
    When <evento>
    Then el botón "Pausar la animación de Nailbot" <pausa>
    And el arte del lanzador lleva data-animacion="<data-animacion>"
    And document.activeElement es <foco después>
    And matchMedia se llamó con el argumento EXACTO "(prefers-reduced-motion: reduce)", y al desmontar removeEventListener recibe, con "change", el MISMO manejador que registró addEventListener

    Examples:
      | reduce al montar | preparación                                                  | evento                                                              | pausa                                   | data-animacion | foco después                                  |
      | false            | el foco en el <body>                                         | se monta NailbotFlotante y corren sus efectos                       | existe, con aria-pressed="false"        | activa         | el <body>: montar NO roba el foco             |
      | true             | el foco en el <body>                                         | se monta NailbotFlotante y corren sus efectos                       | NO existe                               | pausada        | el <body>                                     |
      | false            | NailbotFlotante ya montado y el foco en el botón de pausa    | el sistema ACTIVA «reduce»: el manejador de "change" recibe matches=true | deja de existir                    | pausada        | el lanzador: el foco no cae al vacío          |
      | true             | NailbotFlotante ya montado y el foco en el lanzador          | el sistema RETIRA «reduce»: el manejador de "change" recibe matches=false | reaparece PULSADA: aria-pressed="true" | pausada        | el lanzador                                   |

    # Con «reduce» no existe ninguna animación (todas las `@keyframes` viven en `no-preference`,
    # @s12): una pausa que se despulsara anunciaría un movimiento que NO va a ocurrir. Por eso no se
    # monta (precedente: el control del hero, `hero-logica.ts:49-54`). La 4.ª fila es la de L10:
    # retirar «reduce» NO reanuda sola; la persona decide. `prefers-reduced-motion` es CRITERIO DE
    # PROYECTO, no técnica de 2.2.2 [V: `04` §1.3]: el mecanismo de 2.2.2 es la pausa. La consulta se
    # lee DENTRO de un efecto y guardada (`typeof window.matchMedia === 'function'`).

  @s6
  Scenario Outline: Las tres decisiones del flotante son PURAS —se calculan EN LA LLAMADA— y se muerden POR VALOR
    Given la decisión "<decisión>" de "src/components/nailbot-flotante-logica.ts"
    When se evalúa con <entrada>
    Then devuelve <salida>

    Examples: ¿se muestra el bocadillo? — entrada: ms desde el montaje · ¿se abrió el panel alguna vez? · ¿se descartó?
      | decisión  | entrada          | salida |
      | bocadillo | 3999 · no · no   | no     |
      | bocadillo | 4000 · no · no   | sí     |
      | bocadillo | 60000 · no · no  | sí     |
      | bocadillo | 4000 · sí · no   | no     |
      | bocadillo | 4000 · no · sí   | no     |

    Examples: el estado de la animación — entrada: estado previo + evento; salida: animación · ¿pausa montada? · ¿pausa pulsada?
      | decisión  | entrada                                                         | salida                          |
      | animación | sin leer + preferencia leída «no-preference»                    | activa · montada · no pulsada   |
      | animación | sin leer + preferencia leída «reduce»                           | pausada · no montada            |
      | animación | activa · montada · no pulsada + pulsar la pausa                 | pausada · montada · pulsada     |
      | animación | pausada · montada · pulsada + pulsar la pausa                   | activa · montada · no pulsada   |
      | animación | activa · montada · no pulsada + «reduce» activado en caliente   | pausada · no montada            |
      | animación | pausada · montada · pulsada + «reduce» activado en caliente     | pausada · no montada            |
      | animación | pausada · no montada + «reduce» retirado en caliente            | pausada · montada · pulsada     |

    Examples: ¿el diálogo detiene la propagación de la tecla? — entrada: event.key
      | decisión | entrada      | salida |
      | tecla    | "ArrowLeft"  | sí     |
      | tecla    | "ArrowRight" | sí     |
      | tecla    | "ArrowUp"    | no     |
      | tecla    | "Escape"     | no     |
      | tecla    | "Tab"        | no     |
      | tecla    | "a"          | no     |

    # 3 999 / 4 000 matan los mutantes de comparador sobre el umbral; 60 000 fija que el bocadillo no
    # caduca solo. «ArrowUp» mata al mutante que detiene cualquier tecla que empiece por «Arrow»; ←
    # y → son las ÚNICAS que escuchan los carruseles [V: `carrusel-logica.ts:27-30`]. Nada se deriva
    # en la carga del módulo.

  # ---------------------------------------------------------------------------------------------
  # EL BOCADILLO (H4, L11, HS-9).
  # ---------------------------------------------------------------------------------------------

  @s7
  Scenario Outline: El bocadillo aparece UNA vez, a los 4 000 ms y no a los 3 999, solo si el panel nunca se abrió — y mientras se ve, describe al lanzador sin ser región viva
    Given relojes falsos de Vitest y NailbotFlotante montado en el instante 0, con este antecedente: <antecedente>
    When el reloj avanza hasta los 3 999 ms y, después, hasta los 4 000 ms
    Then a los 3 999 ms no existe el texto "¿Te pinto una cita? 💅" y el lanzador no tiene atributo aria-describedby
    And a los 4 000 ms el bocadillo <a los 4 000 ms>
    And cuando está visible: un <strong> cuyo texto es exactamente "¿Te pinto una cita? 💅", seguido del texto "Soy Nailbot y te ayudo a reservar.", y un botón con nombre accesible exacto "Cerrar el mensaje de Nailbot"
    And cuando está visible: el aria-describedby del lanzador apunta a un id generado con useId, y su descripción accesible es EXACTAMENTE "¿Te pinto una cita? 💅 Soy Nailbot y te ayudo a reservar." — SIN el nombre del ×
    And cuando está visible: ni el bocadillo ni sus ancestros del widget llevan role="status", role="alert", role="log" ni aria-live

    Examples:
      | antecedente                                                                          | a los 4 000 ms                                                             |
      | ninguno                                                                              | está visible                                                               |
      | un Escape pulsado en el documento a los 2 000 ms                                     | está visible: un Esc ANTES de verse no lo descarta por adelantado (HS-9)   |
      | el panel abierto y cerrado a los 2 000 ms                                            | NO aparece, y tampoco a los 60 000 ms                                      |
      | un montaje ANTERIOR en el que se cerró con su ×, ya desmontado (lo que hace recargar) | está visible: sin storage, cada carga lo vuelve a ofrecer                 |

    # Copy del BRIEF, no del prototipo (HS-15): el 💅 va DENTRO del destacado. «Sin el nombre del ×»:
    # si el `aria-describedby` apuntara al bocadillo entero, la descripción arrastraría «Cerrar el
    # mensaje de Nailbot» (el cálculo del nombre recorre los hijos): debe apuntar al texto, no al ×.
    # No es región viva (L11): aparecer solo no debe interrumpir a un lector de pantalla.

  @s8
  Scenario Outline: El bocadillo se cierra con su ×, con Esc desde CUALQUIER foco o al abrir el panel — y no vuelve en esa carga
    Given relojes falsos, NailbotFlotante montado, el bocadillo ya visible a los 4 000 ms, document.addEventListener espiado desde antes del montaje, y el foco en <foco antes>
    When <acción>
    Then el texto "¿Te pinto una cita? 💅" ya no existe y el lanzador ya no tiene aria-describedby
    And document.activeElement es <foco después>
    And al avanzar el reloj hasta los 60 000 ms el bocadillo NO vuelve
    And document.removeEventListener ha recibido, con "keydown", el MISMO manejador que registró document.addEventListener cuando apareció el bocadillo: Esc se escucha en document SOLO mientras el bocadillo se ve

    Examples:
      | foco antes                                   | acción                                                        | foco después                                                             |
      | un botón de la página AJENO al widget        | se despacha sobre ese botón un keydown "Escape" que burbujea  | ese mismo botón: Esc NO mueve el foco                                    |
      | el botón "Cerrar el mensaje de Nailbot"      | se pulsa ese ×                                                | el lanzador: el × se desmonta y el foco no cae al <body>                 |
      | el lanzador                                  | se pulsa el lanzador (se abre el panel)                       | el lanzador en jsdom: dónde lo pone showModal() se verifica EN VIVO      |

    # SC 2.4.11 perdona que el bocadillo tape un control enfocado SOLO si se destapa sin mover el
    # foco (nota 2 [V: `04` §3]): por eso Esc se escucha en `document` y no solo con el foco dentro
    # (HS-9). No choca con ningún otro Esc: el menú móvil no escucha Esc [V: grep en src/components/].

  # ---------------------------------------------------------------------------------------------
  # EL DIÁLOGO (L8, L13, HS-12, HS-13).
  # ---------------------------------------------------------------------------------------------

  @s9
  Scenario: Pulsar el lanzador abre un <dialog> NATIVO con showModal() — «Reserva con Nailbot», su PROPIO ChatNailbot y «Cerrar el chat», en ese orden
    Given NailbotFlotante montado sin preferencia de movimiento reducido, showModal y close espiados sobre HTMLDialogElement.prototype, y el texto "Asistente automático · demo" todavía AUSENTE del documento (el chat del panel no existe hasta la primera apertura)
    When pulso el botón "Abrir el chat con Nailbot para reservar cita"
    Then showModal se ha llamado EXACTAMENTE una vez, sobre un elemento <dialog>, y ese <dialog> tiene ahora el atributo open
    And el <dialog> NO lleva atributo role, ni tabindex, ni closedby: Esc cierra y el clic fuera no (comportamiento por defecto)
    And su aria-labelledby apunta a un <h2> cuyo texto es exactamente "Reserva con Nailbot", y el nombre accesible del diálogo es exactamente "Reserva con Nailbot"
    And dentro del <dialog> hay un botón type="button" con nombre accesible exacto "Cerrar el chat" y un ChatNailbot: el texto "Asistente automático · demo" aparece ahora EXACTAMENTE una vez, dentro del <dialog>
    And dentro del <dialog>, el orden del DOM es: el <h2> → la leyenda del chat → el botón "Uñas" → el botón "Cerrar el chat"
    And el PRIMER elemento enfocable del <dialog>, en orden del DOM, es el botón "Uñas": sin autofocus ni código de foco, es donde showModal() pondrá el foco (HS-12)
    And abrir el panel NO cambia el data-animacion del arte del lanzador ni el aria-pressed de la pausa: nada se pausa solo
    And el avatar del ChatNailbot del panel no lleva data-animacion
    # «Cerrar el chat» va el ÚLTIMO en el DOM y se coloca arriba a la derecha por CSS (HS-12): así el
    # primer enfocable es el primer control del paso en curso, coherente con F-23 @s8 (y ChatNailbot
    # nunca se enfoca al montar, así que no compite con showModal). El panel monta el ChatNailbot
    # IDÉNTICO al de #reserva (A-25), con su enlace `demo-btn demo-btn--wa` al terminar.

  @s10
  Scenario Outline: Cerrar —con «Cerrar el chat» o por la vía nativa— deja el panel CERRADO, y al reabrir la conversación sigue donde estaba
    Given showModal y close espiados, un ChatNailbot montado FUERA del panel (el papel de #reserva) en su estado inicial, y el panel abierto con su chat llevado al paso del nombre por "Uñas", "Entre semana" y "Por la mañana" (siete burbujas)
    When se cierra por <vía> y, después, se vuelve a pulsar el lanzador
    Then justo tras el cierre el <dialog> no tenía el atributo open, y close sumaba EXACTAMENTE una llamada: <quién llamó a close>
    And showModal lleva EXACTAMENTE dos llamadas: el componente supo que estaba cerrado y vuelve a abrir
    And el chat del panel sigue con EXACTAMENTE siete burbujas y el campo "Tu nombre" presente: la conversación se conserva, en memoria y sin storage
    And el primer elemento enfocable del <dialog> es ahora el campo "Tu nombre" (HS-12: el primer control del paso en curso)
    And el ChatNailbot de fuera sigue con una única burbuja, el saludo: las instancias no se tocan

    Examples:
      | vía                                                                                                               | quién llamó a close                                                                        |
      | el botón "Cerrar el chat"                                                                                         | el componente, desde ese botón                                                             |
      | una llamada a close() AJENA al componente sobre el <dialog> (el doble despacha "close", como Esc o el gesto atrás) | la llamada ajena: el componente NO añade otra; el estado cerrado lo trae el evento "close" |

    # La 2.ª fila es cómo se prueba en jsdom lo que en el navegador hacen Esc y el gesto atrás de
    # Android: el `<dialog>` se cierra solo y dispara "close"; si el componente no lo escuchara, se
    # creería abierto y el lanzador no volvería a abrir. Un Esc accidental NO borra la conversación
    # (HS-13): el único reinicio es «Reservar otra cita».

  @s11
  Scenario Outline: Con el panel abierto, ← y → no salen del diálogo, NINGUNA otra tecla se retiene y nada se previene
    Given el panel abierto, un escuchador REAL de "keydown" añadido a document con addEventListener, y el foco en <foco>
    When se despacha sobre ese elemento un keydown "<tecla>" que burbujea
    Then el escuchador de document <llega>
    And event.defaultPrevented es false: no se llama a preventDefault, así que dentro del campo el cursor se sigue moviendo y Escape sigue llegando al cierre nativo

    Examples:
      | foco                                                          | tecla      | llega        |
      | el botón "Uñas" del chat del panel                            | ArrowLeft  | NO lo recibe |
      | el botón "Uñas" del chat del panel                            | ArrowRight | NO lo recibe |
      | el campo "Tu nombre" del chat del panel, llevado a ese paso   | ArrowLeft  | NO lo recibe |
      | el botón "Uñas" del chat del panel                            | Escape     | SÍ lo recibe |
      | el botón "Uñas" del chat del panel                            | Tab        | SÍ lo recibe |
      | el botón "Uñas" del chat del panel                            | a          | SÍ lo recibe |

    # Los carruseles escuchan ← y → en `document` y solo se inhiben en INPUT/TEXTAREA/SELECT/
    # contenteditable [V: `carrusel-logica.ts:47-55`]: sobre un chip, la galería de detrás se movería.
    # La cura es detener la propagación (L13), no tocar F-22, que está `done`. Lo que sí queda fuera
    # (caso límite 14): los chips del chat de `#reserva`, anterior a F-24.

  # ---------------------------------------------------------------------------------------------
  # BYTES: lo que ningún render ve. Ancla positiva SIEMPRE primero.
  # ---------------------------------------------------------------------------------------------

  @s12
  Scenario: La animación del arte vive TODA dentro de «no-preference», atada a [data-animacion], con los tiempos del prototipo y solo transform/opacity, y la pausa CONGELA
    Given los bytes de "src/components/nailbot-arte.module.scss"
    When se leen sus bloques con cuerpoDelBloque
    Then la hoja SÍ contiene "@media (prefers-reduced-motion: no-preference)", "[data-animacion", "transform-box: fill-box" y "animation-play-state: paused" (ANCLA POSITIVA)
    And contiene EXACTAMENTE trece "@keyframes" y TODAS dentro del bloque «no-preference»: quitado ese bloque, el resto de la hoja no contiene "@keyframes" ni "animation"
    And dentro de las @keyframes solo se declaran las propiedades "transform" y "opacity"
    And toda regla que declara "animation" o "animation-name" tiene un selector que incluye "[data-animacion": el arte SIN el atributo (el avatar del chat de F-23) no se mueve nunca
    And la regla cuyo selector incluye data-animacion con el valor "pausada" declara "animation-play-state: paused" y NO "animation: none": pausar es CONGELAR donde está (técnica G4, HS-8 b)
    And las duraciones de las animaciones son exactamente las del prototipo (nailbot-prototipo.html:72-85): "3.2s", "1.6s", "4.6s" y "7s", todas "infinite"
    And la hoja NO contiene "will-change", ni "url(", ni "!important", ni "prefers-reduced-motion: reduce": con el patrón B, bajo «reduce» no existe ninguna animación que apagar
    # Trece @keyframes = las del prototipo (flotar, latir, parpadeo, pintar, las cuatro uñas, lucir,
    # soplar, soplo, destello, destello-b), con tiempos y curvas VERBATIM (HS-15). Con el patrón B, el
    # HTML sale quieto para quien lo pidió sin depender de JS, y el estado base sigue siendo la pose
    # FINAL (I-4, F-23 @s14). Un fotograma congelado a medio pintar NO es fallo (HS-8 b).

  @s13
  Scenario: La hoja del flotante — fijo en la esquina con z-index 40 y áreas seguras, lanzador desde --nailbot-lanzador con anillo --accent-dark, pausa de 32 px, cierres de 24 px o más — y NADA de verde ni de WhatsApp
    Given los bytes de "src/components/nailbot-flotante.module.scss"
    When se leen sus bloques con cuerpoDelBloque
    Then la hoja SÍ declara ".flotante", ".lanzador", ".pausa", ".bocadillo", ".cerrarBocadillo", ".dialogo" y ".cerrarDialogo" (ANCLA POSITIVA)
    And el bloque ".flotante" declara "position: fixed", "z-index: 40", "env(safe-area-inset-bottom, 0px)" y "env(safe-area-inset-right, 0px)"
    And la hoja NO contiene "inset: 0" ni "width: 100%"
    And el bloque ".lanzador" usa "var(--nailbot-lanzador)" para su width y para su height (la MISMA fuente que el scroll-padding-bottom de @s14), contiene "var(--accent-dark)" y NO contiene "var(--accent-soft)"
    And el bloque ".pausa" declara "width: 32px" y "height: 32px", y ningún @media redeclara el tamaño de ".pausa"
    And los bloques ".cerrarBocadillo" y ".cerrarDialogo" declaran width y height de 24px o más
    And la hoja NO contiene, sin distinguir mayúsculas, "#25d366", "#1fb757", "#08130c", "demo-btn--wa" ni "whatsapp"
    And la hoja NO contiene "url(", "@font-face", "outline: none" ni "outline: 0"
    And toda declaración "animation" o "transition" de la hoja está dentro de "@media (prefers-reduced-motion: no-preference)" y dura 5s o menos
    # z-index 40 (HS-11): por encima de los carruseles (7 [V: galeria.module.scss:37]) y por debajo de
    # la cabecera sticky y su menú móvil (50 [V: cabecera.module.scss:15]); el diálogo no depende de
    # esto (top layer). Anillo `--accent-dark` (HS-17): sobre `--bg` es un par YA vigilado, sin fila
    # nueva; el disco sigue blanco. Sin verde (H5): el verde del chat del panel es de ChatNailbot, no
    # de esta hoja (A-25). La pausa mide 32 en TODOS los anchos (el prototipo la encogía a 26: HS-15).

  @s14
  Scenario: C43 al fondo — scroll-padding-bottom en html sale de la MISMA custom property que el tamaño del lanzador, más el área segura, y el «hueco al final» NO se pone a ciegas
    Given los bytes de "src/styles/_base.scss"
    When se leen sus bloques ":root" y "html" y sus @media
    Then un bloque ":root" declara "--nailbot-lanzador" con un valor en px de 44 o más (ANCLA POSITIVA; ≥ 44 es criterio de proyecto, el listón AA de SC 2.5.8 es 24)
    And dentro de un "@media" de anchura, un bloque ":root" redeclara "--nailbot-lanzador" con su valor móvil, también de 44 px o más
    And el bloque "html" declara "scroll-padding-bottom" y su valor contiene "var(--nailbot-lanzador)" y "env(safe-area-inset-bottom, 0px)"
    And el bloque "html" sigue declarando "scroll-padding-top: 6rem" (ancla; su vigilancia es de scroll-padding-cabecera.test.ts y no se duplica aquí)
    And ni "html" ni "body" declaran "padding-bottom" en _base.scss
    # HS-10 (a): una sola fuente (I-7) para el tamaño y el padding; que el número BASTE no lo puede
    # decir un test de bytes (el arte desborda el botón, ~141/108 px [I]): lo dice F110 EN VIVO.
    # HS-10 (b): un `padding-bottom` en `html` pintaría una franja rosa bajo el pie oscuro, también
    # sin JS; si F110 lo pide, el lead pondrá relleno en `.pie` y lo anotará en `progress/`.

  @s15
  Scenario: Guardas de FUENTE — sin red, sin storage, sin analítica, sin «WhatsApp», sin open controlado ni autofocus; y, como apoyo, el montaje en home.tsx y el doble protegido del setup
    Given los bytes de "src/components/NailbotFlotante.tsx", "src/components/nailbot-flotante-logica.ts", "src/pages/home.tsx" y "vitest.setup.ts"
    When se buscan en ellos los literales vigilados
    Then NailbotFlotante.tsx SÍ contiene "export function NailbotFlotante", "showModal(", ".close(", "ChatNailbot", "NailbotArte" y "matchMedia", y nailbot-flotante-logica.ts SÍ contiene "export function" (ANCLAS POSITIVAS, primero)
    And ni NailbotFlotante.tsx ni nailbot-flotante-logica.ts contienen "fetch(", "XMLHttpRequest", "localStorage", "sessionStorage", "document.cookie", "sendBeacon", "gtag" ni "dataLayer"
    And ni NailbotFlotante.tsx ni nailbot-flotante-logica.ts contienen, sin distinguir mayúsculas, "whatsapp" (H5; los comentarios también son bytes)
    And NailbotFlotante.tsx NO contiene "open={", ni "autoFocus", ni 'role="dialog"', ni "tabIndex"
    And ni NailbotFlotante.tsx ni nailbot-flotante-logica.ts contienen los literales de la lista negra de F-01: "600123456", "ph-woman", "IMAGEN TEMPORAL", "Plantilla de demostración", "hola@nailslashstudio.com" ni "Calle de la Belleza"
    And en home.tsx, "<NailbotFlotante" aparece DESPUÉS de "</main>" y ANTES de "<Pie" (apoyo: la prueba del montaje es @s2)
    And vitest.setup.ts contiene el doble de "showModal" y el de "close", cada uno dentro de una guarda que comprueba que HTMLDialogElement.prototype NO lo trae (p. ej. typeof … !== 'function'): con un jsdom que los implemente, no se pisan
    # NINGUNA guarda veta `if (`, `?`, `&&` ni `||` en NailbotFlotante.tsx ni en su lógica (están en
    # `mutate`; Stryker los lee instrumentados). vitest.setup.ts no está en `mutate`: su guarda con
    # `typeof` se puede leer sin riesgo. `.focus(` NO se prohíbe: @s5 y @s8 exigen llevar el foco al
    # lanzador; lo prohibido es el código de foco INICIAL del diálogo (HS-12: sin `autoFocus`).

  # =============================================================================================
  # VERIFICACIÓN EN VIVO DEL LEAD — Chrome real y un móvil; NO son escenarios; se anotan en `progress/`
  # =============================================================================================
  #  · Diálogo nativo: Esc lo cierra; el fondo queda INERTE (Tab no sale del diálogo; el clic fuera no
  #    cierra); va por encima de la cabecera sticky (top layer) con su `::backdrop`; al cerrar (botón,
  #    Esc) el foco VUELVE al lanzador.
  #  · Foco inicial (HS-12): cae en el primer control del paso («Uñas» / campo / enlace final). OJO [I]:
  #    Chrome hace enfocables por teclado los contenedores con scroll sin hijos enfocables; si el foco
  #    inicial cayera en el hilo, anotarlo y decidirlo.
  #  · F110 tabulando hacia ABAJO y hacia ARRIBA a 320, 390 y 1280 px: ningún control enfocado queda
  #    TOTALMENTE tapado por robot + pausa + bocadillo, en especial los últimos enlaces del pie. Si
  #    alguno lo queda, el lead decide el relleno de `.pie` (HS-10 b) y lo anota.
  #  · Menú móvil desplegado en un móvil en apaisado: el robot (z-index 40) queda por DEBAJO de sus
  #    enlaces (HS-11).
  #  · Animación: el bucle con `no-preference`; la pausa CONGELA y reanuda desde ahí (una uña a medio
  #    pintar o el pincel en el aire NO son fallo, HS-8 b); con «reduce» del sistema, quieto en su pose
  #    final; activar y retirar «reduce» con la página abierta. [I] Tras retirar «reduce» en caliente,
  #    la animación aparece congelada en su fotograma 0 (uñas aún sin pintar): consecuencia aceptada de
  #    HS-8 (a)+(b), anotarla.
  #  · Con el panel abierto, el robot sigue moviéndose tras el `::backdrop` y la pausa está inerte hasta
  #    cerrar (caso límite 9, conforme [I]).
  #  · Gesto atrás de Android con el panel abierto: lo cierra y la conversación sigue al reabrir.
  #  · Área segura de iOS (indicador de inicio, apaisado con muesca): el robot no queda bajo ella.
  #  · Tamaños reales: lanzador de 44×44 o más en escritorio y en móvil, pausa de 32×32, × del
  #    bocadillo y «Cerrar el chat» de 24×24 o más.
  #  · Contraste del anillo `--accent-dark` del lanzador sobre la página y de la pausa (HS-17, SC 1.4.11).
  #  · Bocadillo: aparece a los ~4 s; Esc desde cualquier punto lo cierra sin mover el foco; no vuelve
  #    en esa carga y sí al recargar; un lector de pantalla lo lee como descripción del lanzador y NO
  #    lo anuncia solo al aparecer.
  #  · El enlace final abierto en WhatsApp DESDE EL PANEL (Android, iOS, WhatsApp Web), con y sin nombre.
  #  · `pnpm build` (lo corre el lead): cinco puertas en verde y el HTML de `dist/` sin rastro del
  #    flotante (L7); ningún literal de la lista negra en el bundle JS.
