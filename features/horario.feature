# Contrato de la feature 10 (`horario`) de feature_list.json — v2 (ronda de reparación tras revisión adversarial).
# Destilado de `progress/spec_draft_horario.md` (borrador con D1–D8) y de feature_list.json §10.
# Depende de F-02 (`datos_negocio_fuente_unica`, done): el horario semanal vive como DATO-string en
# `src/lib/site.ts` (`HORARIO`); F-10 lo LEE y lo PARSEA (D3), NO lo reescribe.
#
# =============================================================================================
# ⏸⏸ PENDIENTE DE PUERTA HUMANA (lote 2026-07-18). EL `tdd_craftsman` NO IMPLEMENTA NADA HASTA QUE
#    EL HUMANO APRUEBE ESTE `.feature`. Se respeta la puerta del `.feature` (memoria: «autonomía
#    hasta la puerta»): el borrador llega con TODO resuelto y una recomendación por decisión.
# =============================================================================================
#
# 🔧 QUÉ CAMBIÓ EN v2 (reparaciones de la revisión adversarial, sin tocar lo que ya estaba limpio):
#   · BLOQUEANTE @s14 + Alcance — F-10 NO toca `construirJsonLd` (rompería @s9 de F-04, done, que
#     asevera EXACTAMENTE 6 claves). Compone `openingHoursSpecification` en el SITIO DE EMISIÓN
#     (`src/pages/home.tsx`). @s14 reescrito sobre el JSON-LD horneado en dist/.
#   · GRAVE @s1 — reforzado con un discriminador de reloj falso (fake timers a un instante de
#     respuesta OPUESTA) que prueba que la salida sigue al ARGUMENTO, no al reloj del sistema.
#   · @s4 (DST) — corregida la nota del offset fijo y AÑADIDA una fila DST pegada al cierre (19:30).
#   · @s2/@s3/@s5/@s6 — instantes anclados como UTC con `Z` (Date.UTC/ISO-Z); prohibido `new Date`
#     por componentes locales. @s5/@s6 declaran fuera de alcance el borde fecha-Madrid-vs-UTC (F-13).
#   · @s9 — «se DERIVA, no se copia» declarado propiedad de REVISIÓN/puerta, no aseverable por valor.
#   · @s15 — retirada la fila «alterar el 840» (Stryker 9.6.1 no tiene mutador de literal numérico y
#     840 no es literal); el límite del sábado lo defienden @s7/@s8 + el comparador.
#   · @s12 — anclado PRIMERO a algo positivo presente en los bytes (falla cerrado); nota F-10 vs F-12.
#
# DECISIONES INCORPORADAS COMO DECIDIDAS (recomendaciones firmes del borrador; el humano puede
# REVOCARLAS en la aprobación, pero NO van con pregunta abierta):
#   · D2 — Franjas SEMIABIERTAS `[abre, cierra)`: la apertura es INCLUSIVA, el cierre EXCLUSIVO.
#          «Cierra a las 20:00» = cerrado a las 20:00:00. Da dos comparadores que la mutación
#          distingue: apertura `minutos >= abre`, cierre `minutos < cierra` (@s2, @s3, @s15).
#   · D3 — F-10 LEE y PARSEA `HORARIO` de F-02; `site.ts` NO cambia de forma (fuente única, I-7).
#          NO se duplica el dato en una constante propia de F-10 (@s8, @s9).
#   · D4 — `openingHoursSpecification` se COMPONE en el SITIO DE EMISIÓN del JSON-LD (`src/pages/home.tsx`,
#          F-04), NO dentro de `construirJsonLd`: home.tsx emite
#          `JSON.stringify({ ...construirJsonLd({…}), openingHoursSpecification: openingHoursSpecification(HORARIO_SEMANAL) })`.
#          `construirJsonLd` y su @s9 (EXACTAMENTE 6 claves, `openingHoursSpecification` ausente a toda
#          profundidad) quedan INTACTOS → F-04 (done) sigue VERDE. `dayOfWeek` en la enumeración INGLESA
#          de schema.org, L-V AGRUPADO, Sábado solo, Domingo (cerrado) OMITIDO. JAMÁS la clave
#          `openingHours` (la puerta de cascarón de F-04 ya rompe el build si aparece) (@s13, @s14).
#   · D7 — `estaAbierto` devuelve BOOLEANO (mínimo, cumple el acceptance 1). El estado rico («abre
#          en 2 h») linda con F-13 y NO entra en la DEMO.
#   · D8 — DST: la conversión a Europe/Madrid se hace con `Intl`, que resuelve CET/CEST; NUNCA se
#          resta un offset fijo. Hay casos que cruzan el cambio de hora (@s4).
#
# =============================================================================================
# 🚪 DECISIONES QUE VAN A LA PUERTA (las que el humano CONFIRMA — recomendación entre corchetes)
# =============================================================================================
#   · D1 — ¿La DEMO muestra un indicador «Abierto/Cerrado ahora», o SOLO el horario semanal?
#          [RECOMENDACIÓN: solo el horario semanal]. Se CONSTRUYE y TESTEA `estaAbierto` (puro, su
#          consumidor real es F-13), pero NO se hornea un badge en vivo: bajo SSG un badge horneado
#          congela el instante del build → MENTIRA, y uno que solo aparece tras hidratar es la
#          rama-solo-JS-en-SSG que la memoria del repo prohíbe (misma familia que el «horneado
#          invisible» que cazó F-07). Este contrato destila la recomendación como NEGATIVA (@s12).
#          Si el humano quiere badge: sería una isla client-only (prerender neutro), MEJORA
#          POSTERIOR, y haría falta un escenario NUEVO — no se implementa en esta DEMO.
#   · D5 — Excepciones en la DEMO: ¿lista VACÍA honesta (puerta manual), o marcador mecánico?
#          [RECOMENDACIÓN: lista vacía + puerta manual documentada]. La lista `[]` es HONESTA (no
#          anuncia cierres, no afirma nada falso) → no hay string inventado que la puerta de F-01
#          deba cazar; INVENTAR un festivo solo para disparar F-01 sería inventar dato (prohibido).
#          El bloqueo de publicación queda como puerta MANUAL (`bloqueada_para_publicar`), no
#          mecánica (@s10). Si el humano prefiere un flag mecánico (`excepcionesConfirmadas:false`
#          que un test de despliegue vigile), es un escenario NUEVO — se añade el día que exista el
#          dato real. La RAMA de excepciones se testea/muta igual, con excepciones a mano (@s5, @s6).
#   · D6 — Presentación: 3 filas fijas (L-V / S / D) y el COPY exacto + el separador.
#          [RECOMENDACIÓN: 3 filas fijas, menos superficie de mutación, sin agrupación dinámica].
#          Copy propuesto: «Lunes a Viernes» · «Sábado» · «Domingo»; franja «10:00–20:00» (guion
#          largo «–», NO el guion «-» del dato de F-02); cerrado → «Cerrado» (@s11). CONFIRMAR el
#          copy exacto y el separador: si el humano los cambia, cambian los literales de @s11.
#
# =============================================================================================
# ALCANCE — QUÉ ES F-10 Y QUÉ NO (spec_draft §Alcance) — CORREGIDO EN v2
# =============================================================================================
#   · ENTRA (lógica PURA, con TDD y mutación) en `src/lib/horario.ts` (+ su test co-locado):
#     `estaAbierto(ahora)`, el núcleo puro `abiertoEn(...)`, `parsearFranjas`, `aMinutos`, el
#     `HorarioSemanal` derivado de F-02, `horarioParaUI` y `openingHoursSpecification`. Es el ÚNICO
#     fichero que F-10 añade a la lista `mutate` de `stryker.config.json`; `coverage.include` de
#     `vitest.config.ts` YA lo cubre por glob (`src/lib/**/*.ts`) desde F-06 → NO hay que tocarlo.
#   · TOCA `src/pages/home.tsx` (el SITIO DE EMISIÓN del JSON-LD de F-04), ADITIVAMENTE: añade la
#     propiedad `openingHoursSpecification` al OBJETO que ya se serializa allí, poblada por la función
#     pura de `horario.ts` desde el `HORARIO` de F-02 (D4/@s14). La ESTRUCTURA JSX de home.tsx NO es
#     mutable (Stryker no saca mutantes útiles del JSX); la composición se asevera LEYENDO el JSON-LD
#     horneado en dist/ (@s14) + puerta humana. Mismo reparto que F-04: lógica pura en `seo.ts`,
#     cableado en `home.tsx`, artefacto verificado por la puerta.
#   · NO ENTRA / NO SE REABRE `src/lib/seo.ts` (F-04, done): NO se toca `construirJsonLd`. Su test @s9
#     (`seo.test.ts:214-238`) asevera EXACTAMENTE 6 claves de primer nivel y que
#     `openingHoursSpecification` NO aparece a NINGUNA profundidad — puesto ahí a propósito para que
#     nadie cuele propiedades sin puerta. Modificar `construirJsonLd` pondría `pnpm test` ROJO. Por
#     eso F-10 compone en el SITIO DE EMISIÓN, no en la capa pura de F-04.
#   · NO ENTRA / NO SE REABRE `src/lib/site.ts` (F-02): F-10 lo LEE y PARSEA, no cambia su forma (D3).
#   · NO SE INVENTA: festivos ni cierre de agosto. En la DEMO la lista de excepciones es `[]` (@s10).
#
# =============================================================================================
# NO-MUTABLE (declarado, no fingido — política del repo: si es CSS/estructura, se dice por escrito)
# =============================================================================================
#   · TODO `src/lib/horario.ts` es lógica PURA → Stryker LO MUTA (comparadores, aritmética de
#     minutos, parseo, los STRINGS de copy de `horarioParaUI`, el builder schema.org). El copy de la
#     presentación (@s11) VIVE en `horario.ts` y por tanto SÍ es mutable (StringLiteral), a
#     diferencia del SCSS de F-07. Umbral 1.0, 0 exclusiones (política del repo desde F-03).
#   · La COMPOSICIÓN del JSON-LD en `src/pages/home.tsx` (esparcir `construirJsonLd` y añadir la
#     clave, @s14) es JSX/cableado: NO es mutable útilmente y NO entra en `mutate`. Se asevera LEYENDO
#     el JSON-LD horneado en dist/ (bytes) + la puerta de cascarón de F-04 + la puerta humana.
#   · Si F-10 (o su consumidor F-12) RENDERIZA las 3 filas en un componente, la ESTRUCTURA JSX y el
#     SCSS de esa vista NO son mutables (Stryker no ve SCSS; los literales JSX no generan mutantes
#     útiles): se aseveran LEYENDO el artefacto + la puerta de aprobación humana (patrón F-07 @s6..@s11).
#     La DEMO NO hornea un badge en vivo (@s12, negativa sobre el HTML crudo de dist/, con ancla positiva).
#
# =============================================================================================
# ANTI-TAUTOLOGÍA (regla dura del arnés) — LOS LÍMITES A MANO, NUNCA IMPORTADOS
# =============================================================================================
# TODO esperado se escribe A MANO: los minutos 600 (10:00), 1200 (20:00), 840 (14:00), 0 (00:00),
# 839 (13:59); las horas de pared de Madrid 10:00 / 20:00 / 14:00; los booleanos abierto/cerrado; el
# copy «Cerrado» / «Lunes a Viernes» / «10:00–20:00»; y los `dayOfWeek` ingleses «Monday»…«Saturday».
# Los instantes `Date` de @s2/@s3/@s4/@s5/@s6 se anclan a esas horas de pared ESCRITAS A MANO, y se
# construyen SIEMPRE como UTC con `Z` (`Date.UTC(...)` o ISO con sufijo `Z`) — NUNCA con
# `new Date(2026,0,12,10,0)` por componentes LOCALES, que usarían la zona de la MÁQUINA de test (UTC
# en CI) y falsearían el ancla: ese es el mismo pecado que `estaAbierto` prohíbe. Jamás se anclan a la
# constante `HORARIO` de `site.ts` ni a un símbolo de `horario.ts` comparado contra sí mismo (patrón
# `doble-de-test-anclado-al-literal-no-al-simbolo`; precedente WebEmpresa). `HORARIO` (`site.ts`,
# fuente única F-02) es la ENTRADA legítima de la derivación (@s8/@s9); los ESPERADOS de la partición
# son a mano.
# ❌ PROHIBIDO: llamar a `new Date()` / leer el reloj/fs/entorno dentro de `estaAbierto` (@s1) ·
#    restar un offset fijo en vez de usar `Intl`/Europe/Madrid (@s4) · construir los instantes de test
#    con componentes LOCALES en vez de UTC-`Z` (@s2/@s3/@s4/@s5/@s6) · emitir la clave `openingHours`
#    (rompe la puerta de F-04, @s13/@s14) · MODIFICAR `construirJsonLd` de F-04 (rompe su @s9, done) ·
#    INVENTAR un festivo o el cierre de agosto para «rellenar» las excepciones (@s10) · comparar el
#    minuto esperado contra `HORARIO` importado (anti-tautología).
#
# =============================================================================================
# 🔴 «VERDE ≠ FUNCIONA» (I-8) y el PRIMER BUILD. La rama de excepciones se ejercita con excepciones
# PASADAS POR EL TEST (a mano), NUNCA con la lista vacía de producción: así NO es código muerto (Ley 1)
# ni mutante inmortal, y producción NO inventa festivos.
# El `openingHoursSpecification` COMPUESTO EN `home.tsx` (@s14) es [NV] hasta el primer `pnpm build`
# real de F-10 que lo hornee en dist/: ese build es OBLIGATORIO y MANDA sobre lo escrito aquí. NO se
# toca `construirJsonLd` (rompería @s9 de F-04, done); se compone en el sitio de emisión.
# =============================================================================================

Feature: El horario del salón como DATO (no como copy) con lógica pura — estaAbierto con reloj inyectado, franjas semiabiertas Europe/Madrid, excepciones sin tocar el copy, presentación en 3 filas y openingHoursSpecification aditivo al JSON-LD de F-04
  Como responsable del proyecto quiero que el horario viva como un modelo estructurado de datos y
  que una capa PURA decida si el salón está abierto en un instante dado (con el reloj inyectado y la
  hora de pared de Europe/Madrid resuelta por Intl, DST incluido), lo presente para la vista en
  castellano y lo emita como openingHoursSpecification de schema.org compuesto en el JSON-LD de la
  home (sin tocar la capa pura de F-04), de modo que las excepciones (festivos, cierre de agosto)
  puedan cambiar sin tocar el copy ni el código de vista, y que la DEMO no anuncie ningún cierre
  especial que no esté verificado.

  # ---------------------------------------------------------------------------
  # estaAbierto — PURO, reloj inyectado, Europe/Madrid. Acceptance 1 de feature_list.json §10.
  # ---------------------------------------------------------------------------

  @s1
  Scenario: estaAbierto es PURO — sigue el Date INYECTADO, no el reloj del sistema (discriminador con reloj falso a un instante de respuesta OPUESTA)
    Given el reloj del sistema FALSEADO (fake timers) a un DOMINGO a las 03:00 de Madrid — un instante en el que el salón está CERRADO
    And un instante DISTINTO, inyectado como argumento: un LUNES a las 10:30 de pared en Madrid, anclado como UTC "2026-01-12T09:30:00Z" (dentro de la franja L-V → abierto)
    When se llama a estaAbierto con ese LUNES inyectado, con el reloj del sistema aún falseado al domingo
    Then el salón está "abierto": la salida sigue al ARGUMENTO (lunes 10:30), NO al reloj del sistema falseado (domingo 03:00, que daría "cerrado")
    And llamar a estaAbierto DOS veces con el mismo Date devuelve el MISMO booleano (determinista: mismo Date → misma salida)
    And por tanto estaAbierto NO invoca new Date() ni lee el reloj del sistema, ni ficheros, ni el entorno
    And la conversión a la hora de pared usa Europe/Madrid vía Intl, NUNCA la zona de la máquina o del navegador del visitante
    # 🔴 Acceptance 1 + spec_draft §Comportamiento 3. REPARACIÓN (GRAVE): el determinismo por sí solo NO
    # prueba «no new Date()» — una función que ignora el argumento y lee el reloj del sistema también es
    # determinista dentro de una llamada. El DISCRIMINADOR es el reloj falso puesto a una respuesta
    # OPUESTA a la del argumento (domingo 03:00 = cerrado vs lunes 10:30 = abierto): si la salida siguiera
    # al reloj falseado daría «cerrado» y el test se pondría ROJO; que dé «abierto» PRUEBA que la función
    # lee el ARGUMENTO, no el reloj. El reloj es una DEPENDENCIA INYECTADA (como `generarDias(ahora, tz,
    # festivos)` de F-13, que depende de esta feature). Un `Date` es un INSTANTE (epoch UTC), agnóstico a
    # la zona; la conversión a Madrid vive DENTRO de la función. El instante se ancla como UTC-`Z`.

  @s2
  Scenario Outline: L-V las franjas son SEMIABIERTAS [abre, cierra) — apertura inclusiva (10:00), cierre exclusivo (20:00)
    Given un instante anclado como UTC "<instante UTC>" que en Europe/Madrid (invierno, CET +1) es un LUNES a la hora de pared "<hora de pared>"
    And la lista de excepciones de producción está vacía (manda el horario semanal)
    When se llama a estaAbierto con ese instante
    Then el salón está "<estado>"

    Examples:
      | hora de pared | instante UTC          | estado  | qué fija                                                                                    |
      | 09:59         | 2026-01-12T08:59:00Z  | cerrado | antes de abrir; anclado a INVIERNO (08:59Z) → también mata el offset +2 FIJO (leería 10:59 → abierto) |
      | 10:00         | 2026-01-12T09:00:00Z  | abierto | apertura INCLUSIVA (minutos >= abre); mutar >= a > lo rompe                                  |
      | 19:59         | 2026-01-12T18:59:00Z  | abierto | dentro de la franja                                                                         |
      | 20:00         | 2026-01-12T19:00:00Z  | cerrado | cierre EXCLUSIVO (minutos < cierra); mutar < a <= lo rompe                                   |
      | 20:01         | 2026-01-12T19:01:00Z  | cerrado | pasado el cierre                                                                            |
      | 00:00         | 2026-01-11T23:00:00Z  | cerrado | 00:00 del lunes en Madrid = domingo 23:00Z; cerrado en cualquiera de las dos lecturas       |

    # 🔴 D2 + spec_draft §Casos límite (tabla). El intervalo `[abre, cierra)` da DOS comparadores que la
    # mutación distingue: apertura `minutos >= abre` (10:00 dentro) y cierre `minutos < cierra` (20:00
    # fuera). 10:00 → 600 y 20:00 → 1200 se escriben A MANO; el instante se ancla a la hora de pared de
    # Madrid como UTC con `Z` (lunes 12-ene-2026 es INVIERNO, CET +1: 10:00 Madrid = 09:00Z), NUNCA a
    # `HORARIO` ni con `new Date(...)` por componentes locales. La fila 09:59 va anclada a INVIERNO a
    # propósito (08:59Z): así, además de fijar la apertura, MATA el mutante de offset +2 FIJO, que la leería
    # como 10:59 → abierto ≠ cerrado (ver @s4). Las dos filas límite (10:00, 20:00) matan los mutantes de
    # comparador (@s15). El «Lunes» representa cualquier día laborable (L-V comparten la franja).

  @s3
  Scenario Outline: Sábado (franja corta 10:00–14:00) y Domingo (sin franjas = cerrado)
    Given un instante anclado como UTC "<instante UTC>" que en Europe/Madrid (invierno, CET +1) es un "<día>" a la hora de pared "<hora de pared>"
    And la lista de excepciones de producción está vacía (manda el horario semanal)
    When se llama a estaAbierto con ese instante
    Then el salón está "<estado>"

    Examples:
      | día     | hora de pared | instante UTC          | estado  | qué fija                                                                          |
      | Sábado  | 13:59         | 2026-01-17T12:59:00Z  | abierto | dentro de la franja corta del sábado                                              |
      | Sábado  | 14:00         | 2026-01-17T13:00:00Z  | cerrado | cierre del sábado EXCLUSIVO (minutos < cierra del sábado); mutar < a <= lo rompe   |
      | Sábado  | 14:30         | 2026-01-17T13:30:00Z  | cerrado | pasado el cierre del sábado                                                       |
      | Domingo | 10:30         | 2026-01-18T09:30:00Z  | cerrado | día SIN franjas (lista vacía [] = cerrado), aunque sea hora laborable              |
      | Domingo | 03:00         | 2026-01-18T02:00:00Z  | cerrado | domingo cerrado a cualquier hora                                                  |

    # 🔴 spec_draft §Casos límite. Instantes UTC fechados EXPLÍCITOS (sábado 17-ene-2026, domingo 18-ene-2026,
    # ambos INVIERNO CET +1), anclados con `Z`; ❌ PROHIBIDO construir el Date por componentes locales
    # (`new Date(2026,0,17,14,0)`), solo `Date.UTC`/ISO con `Z`. El sábado cierra a las 14:00 (franja parseada
    # `[{600, 840}]`) y el domingo es una lista de franjas VACÍA `[]`: «cerrado» es COPY derivado, NO un valor
    # guardado. La fila 14:00 fija el cierre EXCLUSIVO del sábado — lo defiende el comparador `minutos < cierra`
    # (@s15) junto al parseo (@s8) y la aritmética (@s7); NO un «mutar el 840»: 840 no es un literal, es
    # `aMinutos('14:00') = 14*60`, y Stryker 9.6.1 no tiene mutador de literal numérico. Las filas de domingo
    # fijan que un día sin franjas está cerrado a cualquier hora (y protegen «mutar la lista vacía lo rompe»
    # junto con @s11/@s13, donde el domingo se ve como «Cerrado» / se omite de schema.org — ahí SÍ muere ese mutante).

  @s4
  Scenario Outline: DST — instantes a la MISMA hora de pared de Madrid pero en periodos distintos (CET vs CEST) dan el MISMO resultado
    Given un instante anclado como UTC "<instante UTC>" que en Europe/Madrid, en "<periodo>", es un LUNES a la hora de pared "<hora de pared>"
    When se llama a estaAbierto con ese instante
    Then el salón está "abierto"

    Examples:
      | periodo            | hora de pared | instante UTC          | qué mutante de OFFSET FIJO mata                                          |
      | CET (invierno, +1) | 10:30         | 2026-01-12T09:30:00Z  | +1 FIJO NO lo caza aquí (lee 10:30 → abierto ✓)                          |
      | CEST (verano, +2)  | 10:30         | 2026-07-13T08:30:00Z  | +1 FIJO muere: leería 09:30 Madrid → cerrado ≠ abierto                   |
      | CET (invierno, +1) | 19:30         | 2026-01-12T18:30:00Z  | +2 FIJO muere: leería 20:30 Madrid → cerrado ≠ abierto                   |
      | CEST (verano, +2)  | 19:30         | 2026-07-13T17:30:00Z  | +2 FIJO NO lo caza aquí (lee 19:30 → abierto ✓)                          |

    # 🔴 D8 + spec_draft §Notas de mutación. REPARACIÓN (MENOR): la nota anterior era falsa. El OFFSET de
    # Madrid cambia con la estación: +1 (CET) en invierno, +2 (CEST) en verano. Las CUATRO filas son un
    # lunes a hora de PARED de Madrid dentro de la franja L-V (10:30 pegada a la apertura, 19:30 pegada al
    # cierre) → las cuatro ABIERTO. Contra un OFFSET FIJO (el mutante que ignora el DST):
    #   · +1 FIJO muere en la fila de VERANO 10:30: 08:30Z se leería como 09:30 Madrid → cerrado ≠ abierto.
    #   · +2 FIJO muere en la fila de INVIERNO 19:30: 18:30Z se leería como 20:30 Madrid → cerrado ≠ abierto.
    # ⚠️ Un +2 FIJO NO muere en 10:30 invierno (11:30 sigue abierto) ni en las de verano: POR ESO hizo falta
    # la fila 19:30 pegada al cierre. Como refuerzo, @s2 09:59 anclado a 08:59Z de INVIERNO también caza el
    # +2 FIJO. Solo `Intl`/Europe/Madrid acierta las cuatro. ❌ Los instantes se anclan A MANO como UTC con
    # `Z` (`Date.UTC`/ISO-Z), JAMÁS con `new Date(2026,0,12,10,30)` (componentes locales = zona de la máquina).

  # ---------------------------------------------------------------------------
  # El núcleo puro abiertoEn(...) y la RAMA de excepciones — con excepciones PASADAS POR EL TEST (a
  # mano), nunca con la lista vacía de producción. Acceptance 3: excepciones sin tocar el copy.
  # ---------------------------------------------------------------------------

  @s5
  Scenario: una excepción con franjas VACÍAS en una fecha que sería laborable CIERRA ese día — la excepción MANDA sobre el horario semanal
    Given el núcleo puro abiertoEn con un horario semanal en el que el lunes abre 10:00–20:00
    And una lista de excepciones (pasada por el test) con la entrada { fecha: "2026-01-12" (un lunes), franjas: [] }
    When se consulta abiertoEn para ese lunes a las 10:30 de la mañana en Madrid, anclado como UTC "2026-01-12T09:30:00Z"
    Then el salón está "cerrado" (la excepción de franjas vacías anula la franja semanal del lunes)
    And el horario semanal NO se modifica: la excepción es un OVERRIDE por fecha, consultado ANTES que el semanal
    # 🔴 spec_draft §Contrato + §Casos límite. `abiertoEn(instante, horarioSemanal, excepciones)` es el motor
    # testeable con horarios y excepciones ARBITRARIOS. Un festivo se modela como `{ fecha, franjas: [] }`
    # (cerrado). Las excepciones se consultan PRIMERO; si la fecha coincide, mandan sus franjas (aquí vacías =
    # cerrado) sin tocar el semanal ni el copy. La excepción la ESCRIBE el test (no existe en producción, @s10)
    # → la rama no es código muerto y se puede mutar. El instante (10:30 Madrid) cae de lleno en el mediodía,
    # así la fecha de Madrid y la de UTC COINCIDEN: el borde de emparejamiento de fecha Madrid-vs-UTC a
    # MEDIANOCHE (00:30 Madrid = 23:30 UTC del día anterior) queda FUERA del alcance de F-10 y se DIFIERE a
    # F-13, dueño de las fechas reales de festivos y de `generarDias(ahora, tz, festivos)`.

  @s6
  Scenario: una excepción con franjas PROPIAS en un domingo (normalmente cerrado) ABRE ese día en esa franja
    Given el núcleo puro abiertoEn con un horario semanal en el que el domingo NO tiene franjas (cerrado)
    And una lista de excepciones (pasada por el test) con la entrada { fecha: "2026-01-18" (un domingo), franjas: [{ abre: 11:00, cierra: 15:00 }] }
    When se consulta abiertoEn para ese domingo a las 12:00 en Madrid, anclado como UTC "2026-01-18T11:00:00Z"
    Then el salón está "abierto" (la excepción ABRE un día que el semanal deja cerrado)
    And para ese mismo domingo a las 16:00 en Madrid, anclado como UTC "2026-01-18T15:00:00Z" (fuera de la franja de la excepción), el salón está "cerrado"
    # 🔴 spec_draft §Casos límite (la excepción abre un día normalmente cerrado). Cierra la rama de excepciones
    # por el lado positivo: la excepción no solo cierra (@s5), también puede ABRIR. Las franjas de la excepción
    # son SEMIABIERTAS igual que el semanal (12:00 dentro, 16:00 fuera de [11:00,15:00)). Los límites 11:00/15:00
    # y las horas 12:00/16:00 se escriben A MANO; los instantes se anclan como UTC-`Z`, a mediodía (fecha Madrid =
    # fecha UTC). Igual que @s5, el borde de emparejamiento a MEDIANOCHE se DIFIERE a F-13 (fuera del alcance de F-10).

  # ---------------------------------------------------------------------------
  # El modelo como DATO derivado de F-02 — parseo y minutos. HORARIO (site.ts) es la ENTRADA; los
  # minutos esperados se escriben A MANO (anti-tautología). Acceptance 2 de feature_list.json §10.
  # ---------------------------------------------------------------------------

  @s7
  Scenario Outline: aMinutos convierte una hora "HH:MM" a minutos-desde-medianoche — hora*60 + minuto
    Given la hora de pared "<hhmm>"
    When se llama a aMinutos con esa cadena
    Then el resultado es exactamente <minutos>

    Examples:
      | hhmm  | minutos | por qué (escrito a mano)                                          |
      | 10:00 | 600     | 10*60 + 0 — el límite de apertura                                 |
      | 20:00 | 1200    | 20*60 + 0 — el límite de cierre L-V                              |
      | 14:00 | 840     | 14*60 + 0 — el límite de cierre del sábado                       |
      | 00:00 | 0       | medianoche                                                       |
      | 13:59 | 839     | 13*60 + 59 — con MINUTO no nulo: distingue hora*60+minuto de otras aritméticas |

    # 🔴 Anti-tautología: 600 / 1200 / 840 / 0 / 839 se escriben A MANO, JAMÁS derivados de `HORARIO` ni de
    # `aMinutos` re-llamado en el test. La fila «13:59 → 839» es la que MATA los mutantes de aritmética
    # (ArithmeticOperator de Stryker): con `hora*60 - minuto` daría 721 y con `hora*60` (ignorar el minuto)
    # daría 780; ambos ≠ 839 (las filas con minuto 0 no los distinguen). Es el núcleo que traduce el
    # dato-string de F-02 y el que defiende el límite del sábado (840) POR ARITMÉTICA, no por un literal.

  @s8
  Scenario Outline: parsearFranjas traduce las cadenas de HORARIO (F-02) al modelo de franjas en minutos
    Given una cadena de horario de F-02 "<cadena>"
    When se llama a parsearFranjas con esa cadena
    Then el resultado es exactamente "<franjas>"

    Examples:
      | cadena      | franjas                    | por qué                                             |
      | 10:00-20:00 | [{ abre: 600, cierra: 1200 }] | la franja L-V, en minutos                          |
      | 10:00-14:00 | [{ abre: 600, cierra: 840 }]  | la franja del sábado                               |
      | cerrado     | []                         | «cerrado» → lista VACÍA (no un valor «cerrado» guardado) |

    # 🔴 D3: F-10 LEE las cadenas `HORARIO` de F-02 y las PARSEA; NO duplica el dato. La entrada es el
    # guion «-» del dato de F-02 (`'10:00-20:00'`); el guion largo «–» de la presentación es de
    # `horarioParaUI` (@s11), no de aquí. `'cerrado'` → `[]` es la clave del modelo: la lista vacía ES
    # el «cerrado». Los minutos (600/1200/840) se escriben A MANO; la cadena de entrada viene de F-02.

  @s9
  Scenario: el HorarioSemanal derivado de HORARIO de F-02 modela los 7 días como listas de franjas (no duplica el dato, no cambia site.ts)
    Given el HorarioSemanal derivado de la constante HORARIO de F-02 (fuente única, sin reescribir site.ts)
    When se inspeccionan sus 7 días
    Then de lunes a viernes cada uno de los 5 días laborables tiene la franja [{ abre: 600, cierra: 1200 }] (10:00–20:00)
    And el sábado tiene la franja [{ abre: 600, cierra: 840 }] (10:00–14:00)
    And el domingo tiene una lista de franjas VACÍA [] (cerrado)
    # 🔴 spec_draft §Comportamiento 1-2 + §Modelo de datos. El horario semanal verificado (acceptance 2 de §10):
    # L-V 10:00-20:00, S 10:00-14:00, D cerrado (triple fuente, F-02). L-V se EXPANDE a los cinco días
    # laborables (misma franja). El domingo es `[]`, no un string. `HORARIO` es la ENTRADA (legítima de
    # importar); las franjas esperadas se escriben A MANO.
    #
    # 🔒 PROPIEDAD DE REVISIÓN / PUERTA (NO aseverable por VALOR): «el modelo se DERIVA de HORARIO (F-02) y
    # NO se copia en una constante propia de F-10» NO es un `Then` de test — una constante copiada a mano y
    # una derivada producen el MISMO valor en runtime; solo LEER el fuente los distingue. Se verifica por
    # REVISIÓN de código / puerta humana (como los no-mutables), NO por aserción de valor. El test SÍ asevera
    # las franjas (arriba); que la fuente sea `HORARIO` y no un duplicado lo garantiza el revisor + la puerta.
    # Refuerzo mecánico indirecto: si mañana `HORARIO` cambiara en `site.ts` y el modelo estuviera COPIADO (no
    # derivado), las franjas divergirían y @s2/@s3/@s9 se pondrían rojos — pero eso solo aparecería tras el
    # cambio; la garantía HOY es la revisión de la fuente.

  # ---------------------------------------------------------------------------
  # Excepciones VACÍAS en la DEMO = placeholder que BLOQUEA la publicación (D5). No se inventan
  # festivos. Acceptance 3: el modelo admite excepciones sin tocar el copy.
  # ---------------------------------------------------------------------------

  @s10
  Scenario: en la DEMO la lista global de excepciones es VACÍA — estado honesto que no anuncia cierres, y placeholder que bloquea la publicación completa
    Given la lista de excepciones de producción de F-10
    When se inspecciona su contenido
    Then la lista es exactamente [] (vacía): la DEMO no anuncia ningún cierre especial (no afirma nada falso)
    And NO contiene ninguna fecha de festivo ni el cierre de agosto INVENTADOS
    And con esa lista vacía, estaAbierto decide únicamente por el horario semanal (una fecha que fuese festivo, p. ej. un 1 de enero laborable, daría "abierto") — por eso la publicación queda BLOQUEADA (bloqueada_para_publicar) hasta que el cliente confirme los festivos y el cierre de agosto
    And añadir o editar una excepción en esa lista cambia el comportamiento de estaAbierto SIN tocar el copy de horarioParaUI ni site.ts (acceptance 3 de feature_list.json §10)
    # 🔴 D5 (RECOMENDACIÓN: lista vacía + puerta MANUAL). La lista `[]` es un estado HONESTO: no hay
    # string inventado, así que la puerta de F-01 no tiene nada que cazar; INVENTAR un festivo solo
    # para disparar F-01 sería inventar dato (prohibido). El bloqueo de publicación es una puerta
    # MANUAL documentada, no mecánica. Cambiar un festivo = añadir/editar una entrada en esta lista,
    # sin tocar copy ni código de vista (acceptance 3). Los EJEMPLOS de festivo del borrador son
    # ilustrativos del modelo (@s5/@s6); NO se escribe ninguna fecha real en producción. ← VA A LA PUERTA.

  # ---------------------------------------------------------------------------
  # Presentación (horarioParaUI) — 3 filas fijas en castellano. El COPY vive en esta capa (mutable),
  # NO en el dato. D6 → va a la puerta (confirmar copy + separador).
  # ---------------------------------------------------------------------------

  @s11
  Scenario: horarioParaUI proyecta el modelo a EXACTAMENTE 3 filas en castellano, con el copy («Cerrado», el separador «–») en la capa de presentación, no en el dato
    Given el HorarioSemanal derivado de F-02
    When se llama a horarioParaUI
    Then devuelve exactamente 3 filas, en este orden: «Lunes a Viernes», «Sábado», «Domingo»
    And la fila «Lunes a Viernes» muestra la franja "10:00–20:00" (con el guion largo «–» de la presentación)
    And la fila «Sábado» muestra la franja "10:00–14:00"
    And la fila «Domingo» muestra "Cerrado" (el copy «Cerrado» se deriva de la lista de franjas VACÍA, no es un valor guardado)
    And el copy («Cerrado», los rótulos de día, el separador) vive en horarioParaUI, no en el modelo de datos ni en site.ts
    # 🔴 D6 (RECOMENDACIÓN: 3 filas fijas). Reflejan las 3 claves de F-02 (menos superficie de mutación,
    # sin agrupación dinámica). El copy es mutable (StringLiteral en `horario.ts`): mutar «Cerrado» o el
    # separador rompe ESTE test. La fila «Domingo → Cerrado» es también donde muere el mutante de la
    # lista vacía del domingo (si el domingo dejara de ser `[]`, la fila no diría «Cerrado»). Los
    # literales («Lunes a Viernes», «Cerrado», «10:00–20:00») se escriben A MANO. ← EL COPY VA A LA PUERTA.

  @s12
  Scenario: la DEMO NO hornea un badge «Abierto/Cerrado ahora» en vivo en el HTML crudo de dist/ — estaAbierto se construye para F-13, pero no se renderiza (D1 recomendación)
    Given el HTML CRUDO prerenderizado de la ruta "/" del artefacto de producción, leído por bytes (readFileSync, sin ejecutar JavaScript — I-8, NUNCA jsdom)
    And como ANCLA POSITIVA que falla cerrado, ese HTML SÍ contiene la cáscara horneada de F-04: el <title> «Nails Lash Studio · …» y un <script type="application/ld+json"> — si el fichero estuviera vacío o fuese el equivocado, esta ancla lo delata en vez de un verde vacuo
    When se afirma sobre sus bytes (aserción de string)
    Then el HTML NO contiene un indicador «Abierto ahora» / «Cerrado ahora» calculado a partir del instante del build
    And estaAbierto está CONSTRUIDO y testeado (puro, su consumidor es F-13) pero NO alimenta ningún badge horneado en la DEMO
    And en F-10 el artefacto AÚN NO renderiza las filas de horario visibles (eso es F-12): esta negativa la HEREDA y RE-ASEVERA F-12 cuando las filas aterricen, que es donde un badge en vivo sería tentador
    # 🔴 D1 (RECOMENDACIÓN: solo horario semanal, sin badge en vivo). REPARACIÓN (MENOR): el ANCLA POSITIVA va
    # PRIMERO (patrón F-04 @s34 «el ancla va primero»): una negativa sobre los bytes pasa VACUAMENTE si el
    # fichero está vacío o es el equivocado; anclar antes al <title>/JSON-LD de F-04 la hace fallar CERRADO.
    # Bajo SSG un badge «Abierto ahora» HORNEADO congela el instante del build → mentira; uno que solo aparece
    # tras hidratar es la rama-solo-JS-en-SSG prohibida (familia del «horneado invisible» de F-07). Se separa
    # CONSTRUIR/TESTEAR `estaAbierto` (para F-13) de RENDERIZAR un badge (no se hace). ALCANCE: en F-10 dist/
    # todavía NO lleva las filas de horario (son F-12); esta negativa es de la DECISIÓN D1 de F-10 y F-12 la
    # RE-ASEVERA cuando renderice el horario. Si el humano quiere badge: isla client-only con prerender neutro,
    # MEJORA POSTERIOR, escenario NUEVO. ← VA A LA PUERTA.

  # ---------------------------------------------------------------------------
  # openingHoursSpecification — schema.org, ADITIVO al JSON-LD de F-04 (D4). dayOfWeek enum INGLÉS,
  # L-V agrupado, Domingo omitido. JAMÁS la clave openingHours.
  # ---------------------------------------------------------------------------

  @s13
  Scenario: openingHoursSpecification devuelve el array schema.org — dayOfWeek en enum INGLÉS, L-V agrupado, Sábado solo, Domingo (cerrado) OMITIDO
    Given el HorarioSemanal derivado de F-02
    When se llama a openingHoursSpecification
    Then devuelve un array de objetos con "@type" igual a "OpeningHoursSpecification"
    And un objeto agrupa L-V con "dayOfWeek" igual a ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens" "10:00" y "closes" "20:00"
    And otro objeto tiene "dayOfWeek" igual a ["Saturday"], "opens" "10:00" y "closes" "14:00"
    And NO hay ningún objeto para "Sunday": el domingo (cerrado) se OMITE
    And ningún objeto usa la clave "openingHours" (siempre "openingHoursSpecification")
    # 🔴 D4 + spec_draft §Comportamiento 5. `dayOfWeek` en la enumeración INGLESA de schema.org
    # («Monday»…«Saturday»); el copy español vive SOLO en la UI (@s11). L-V AGRUPADO en un array, Sábado
    # solo, Domingo OMITIDO (idiomático: no se representa el cerrado con opens===closes). `opens`/`closes`
    # en «HH:MM». Los nombres ingleses y las horas «10:00»/«20:00»/«14:00» se escriben A MANO. Aquí
    # también muere el mutante de la lista vacía del domingo (si el domingo dejara de ser `[]`, aparecería
    # un objeto «Sunday» y la aserción de omisión fallaría).

  @s14
  Scenario: openingHoursSpecification se COMPONE en el sitio de emisión (home.tsx) y se hornea en el JSON-LD de dist/ — SIN tocar construirJsonLd (F-04 sigue verde); jamás la clave openingHours
    Given el HTML CRUDO prerenderizado de "/" en dist/, con el <script type="application/ld+json"> que F-04 hornea (BeautySalon), leído por bytes
    And como ANCLA POSITIVA, ese JSON-LD horneado contiene "@type":"BeautySalon" y el "name" de F-04 (si no, el fichero es el equivocado y el test falla cerrado)
    When home.tsx compone JSON.stringify({ ...construirJsonLd({…}), openingHoursSpecification: openingHoursSpecification(<HorarioSemanal de F-02>) } ) — construirJsonLd NO se modifica
    Then el JSON-LD horneado en dist/ contiene la clave "openingHoursSpecification" con el array de @s13
    And NO contiene la clave "openingHours" (ni las dos a la vez): la puerta de cascarón de F-04 (REGLA_HORARIO) no emite ninguna violación de horario
    And construirJsonLd sigue devolviendo EXACTAMENTE sus 6 claves de primer nivel y su test @s9 (seo.test.ts) sigue VERDE: la composición vive en el sitio de emisión, no en la capa pura de F-04
    And el build de producción con todas las puertas termina en código de salida 0
    # 🔴 D4 — REPARACIÓN DEL BLOQUEANTE. F-04 dejó la propiedad RESERVADA (A-19, cerrada por el humano) y su
    # test @s9 (`seo.test.ts:214-238`) asevera que `construirJsonLd` tiene EXACTAMENTE 6 claves y que
    # `openingHoursSpecification` NO aparece a NINGUNA profundidad — puesto ahí para que nadie cuele
    # propiedades sin puerta. Modificar `construirJsonLd` pondría `pnpm test` ROJO. POR ESO F-10 NO lo toca:
    # COMPONE en el SITIO DE EMISIÓN (`src/pages/home.tsx`, la línea del `<script ld+json>`), esparciendo el
    # objeto de F-04 y AÑADIENDO la clave poblada por la función pura de `horario.ts`. La puerta de cascarón
    # (`REGLA_HORARIO`, `src/lib/puerta-cascaron.ts:221`; el filtro compara igualdad EXACTA en minúsculas,
    # `:243`) NO colisiona: `'openinghoursspecification' !== 'openinghours'`. [NV] hasta el primer `pnpm build`
    # real de F-10, que hornea y MANDA (I-8). NO tocar site.ts (D3) NI seo.ts/construirJsonLd (rompería @s9, done).

  # ---------------------------------------------------------------------------
  # Los mutantes que deben morir (I-6, umbral 1.0, 0 exclusiones). El conjunto EXACTO se MIDE cuando
  # `src/lib/horario.ts` exista; esta tabla es ILUSTRATIVA y mapea a mutadores REALES de Stryker 9.6.1.
  # ---------------------------------------------------------------------------

  @s15
  Scenario Outline: mutar los límites de las franjas o el comparador rompe al menos un test
    Given la implementación pura de horario en src/lib/horario.ts
    When se aplica la mutación "<mutación>"
    Then al menos un test pasa de verde a rojo

    Examples:
      | mutación                                                                      | dónde muere                                                                 |
      | comparador de apertura (EqualityOperator: minutos >= abre → minutos > abre)    | @s2 (lunes 10:00 exacto pasaría de abierto a cerrado)                        |
      | comparador de cierre (EqualityOperator: minutos < cierra → minutos <= cierra)  | @s2 (lunes 20:00 exacto pasaría de cerrado a abierto); @s3 (sábado 14:00 exacto)  |
      | aritmética de aMinutos (ArithmeticOperator: hora*60 + minuto → hora*60 - minuto) | @s7 (13:59 → 839 deja de cumplirse; también defiende el 840 del sábado)      |
      | cortar la rama de excepciones (ConditionalExpression: no consultar excepciones antes que el semanal) | @s5 y @s6 (la excepción deja de mandar sobre el semanal)     |
      | la lista de franjas VACÍA del domingo deja de ser [] (ArrayDeclaration)        | @s3 (domingo abriría), @s11 (fila «Domingo» no diría «Cerrado») y @s13 (aparecería «Sunday») |
      | el copy de presentación (StringLiteral: «Cerrado» → «») en horarioParaUI       | @s11 (la fila «Domingo» deja de decir «Cerrado»)                             |
      | la clave del JSON-LD (StringLiteral: «openingHoursSpecification» → otra)        | @s13 (el array deja de estar bajo la clave acordada); @s14 (el JSON-LD horneado también) |

    # 🔴 EL CONJUNTO EXACTO NO SE PUEDE PREDECIR: `horario.ts` NO EXISTE todavía; otra implementación tendrá
    # otro conjunto. SE MIDE CUANDO EXISTA, NO ANTES (la lección de F-05 con «exactamente dos equivalentes»
    # sería una PREDICCIÓN, no una medición). Los sabotajes mapean a mutadores REALES de Stryker 9.6.1
    # (EqualityOperator, ArithmeticOperator, ArrayDeclaration, StringLiteral, ConditionalExpression,
    # BooleanLiteral). ⚠️ REPARACIÓN (MENOR): RETIRADA la fila «alterar el 840» — Stryker 9.6.1 NO tiene
    # mutador de LITERAL NUMÉRICO, y además 840 NO es un literal: es `aMinutos('14:00') = 14*60`. El límite
    # del sábado lo defienden @s7 (ArithmeticOperator sobre `hora*60+minuto`), @s8 (parseo de '10:00-14:00') y
    # el comparador de cierre (EqualityOperator, fila 2 de esta tabla, que muere también en el sábado 14:00 de
    # @s3). ⚠️ AVISO al `tdd_craftsman`: la ArrayDeclaration sobre `[]` (domingo/excepciones) puede que NO
    # muera en `abiertoEn` (iterar `["Stryker was here"]` da `.abre` undefined → NaN → sigue cerrado): por eso
    # @s11 y @s13 aseveran el domingo por la CAPA de presentación y de schema.org, donde SÍ muere. Si un
    # mutante RESISTE, se AMPLÍA el contrato o se REFACTORIZA el equivalente (memoria: «ampliar y refactorizar»);
    # NUNCA se excluye, NO se baja el umbral, NO se declara equivalente por cuenta propia (umbral 1.0, 0
    # exclusiones desde F-03) → se ESCALA al humano. Cubre el acceptance 4 de feature_list.json §10 («mutar los
    # límites de las franjas o el comparador rompe un test»).
