# Contrato de la feature 9 (`catalogo_servicios`) de feature_list.json.
# Destilado de `progress/spec_draft_catalogo_servicios.md` (borrador del `spec_partner`) →
# feature_list.json §9. Es la feature CENTRAL de la demo y la más peligrosa: el catálogo es
# oferta precontractual, y un precio sin IVA, un «desde» sin base o un «antes 35 €» que nunca se
# cobró son, cada uno, una infracción tasada. El diseño PROHÍBE ESTRUCTURALMENTE los tres, en vez
# de confiar en que quien edite los datos «tenga cuidado».
#
# =============================================================================================
# ⏸ PENDIENTE DE PUERTA HUMANA (lote 2026-07-18). EL `tdd_craftsman` NO IMPLEMENTA HASTA LA
#    APROBACIÓN. El `spec_partner` preparó el borrador y el `gherkin_author` lo destila con las
#    RECOMENDACIONES incorporadas como decididas (Pablo delega la redacción, aprueba en lotes:
#    «yo preparo, tú apruebas»). El humano puede REVOCAR cualquier decisión en la puerta.
#    v2: ronda de reparación adversarial — G1 (fronteras de fecha), G2 (corte DATO/LÓGICA) y 6
#    menores aplicados; lo limpio (Q-A DIFERIR+ANCLAR, mecanismo @s13, atribución normativa,
#    exclusión de la regla de los 30 días, leyenda «exactamente una vez») se conserva.
# =============================================================================================
#
# =============================================================================================
# DECISIONES QUE VAN A LA PUERTA (Q-A..Q-F). Las recomendaciones del borrador se destilan como
# DECIDIDAS; el humano confirma o revoca. Q-C/Q-D quedan como PREGUNTA ABIERTA que cierra el
# cliente (bloqueante de PRODUCTO, no de investigación).
# =============================================================================================
#   · Q-A — 🔴 LA COLISIÓN CON A-21: ¿cableado en vivo o DIFERIDO+ANCLADO?
#           RECOMENDACIÓN DESTILADA: **DIFERIR + ANCLAR**. Los precios se declaran
#           `esPlaceholder: true` en el DATO (`src/lib/catalogo.ts`); el MECANISMO de F-01 se prueba
#           por test unitario (`detectarPlaceholders` sobre la proyección REAL `registrosCatalogo`
#           de `src/lib/catalogo-logica.ts` → violación) = @s13; se añade `catalogo.precios` a
#           `DIFERIDOS_APROBADOS` en `src/lib/diferidos.test.ts` = @s14; y el humilde
#           `tools/puerta-placeholders.ts` **NO** cablea `registrosCatalogo` → `pnpm build` sigue
#           VERDE → F-10/F-11/F-12 conservan un verify verde.
#           MOTIVO load-bearing: `pnpm build` (producción) corre el humilde, y ese mismo build lo
#           corren `bin/harness init`, `verify`, la CI y la verificación de cada feature de UI. Si
#           se CABLEAN los precios placeholder EN VIVO, `pnpm build` se pone ROJO PERMANENTE y las
#           features siguientes se desarrollarían contra un rojo fijo — *un rojo que siempre está
#           rojo deja de ser señal*. Es el MISMO criterio con el que F-04 difirió `seo.origenCanonica`
#           (A-21) y F-02 dejó `site.email` fuera (A-11). ALTERNATIVA DESCARTADA: cablear en vivo
#           ahora. Es una EXCEPCIÓN EXPLÍCITA al patrón que el humano confirma en la puerta.
#   · Q-B — ¿precios placeholder visibles o genérico? RECOMENDACIÓN: números concretos placeholder,
#           VISIBLES, con la leyenda «Precios con IVA incluido» (@s3) Y un aviso visible «Precios de
#           muestra — pendientes de confirmar con el salón» (@s4). Es lo que DEMUESTRA la UI de
#           precios (leyenda, «desde»+base, variantes) siendo honestos. Los números son de MUESTRA,
#           no los euros de Treatwell presentados como confirmados.
#   · Q-C — ¿qué servicios/variantes placeholder por categoría? PREGUNTA ABIERTA (la cierra el
#           cliente). RECOMENDACIÓN: un conjunto pequeño y representativo con NOMBRES reales
#           [V-LEAD/V] y precios placeholder — Uñas con al menos un servicio S/M/L (ejercita el
#           modelo no aplanado) + uno de precio único + uno «desde» con base; Pestañas y Cejas con
#           lo que la web del titular anuncia sin precio. PROHIBIDO presentar el catálogo como
#           completo (39/43), inventar duraciones, «corregir» las anomalías de Treatwell (ítems
#           21/28) o copiar sus textos descriptivos.
#   · Q-D — ¿la contradicción de pestañas? PREGUNTA ABIERTA P-4 (la cierra el cliente). La web del
#           titular declara pestañas [V-LEAD]; Treatwell no vende ninguna. Se construye la categoría
#           con placeholder; NO se inventan precios de pestañas. Es un BLOQUEANTE DE PRODUCTO.
#   · Q-E — ¿se prohíbe «Facial»/«Depilación» por test? RECOMENDACIÓN: **sí** (@s10). El conjunto de
#           categorías es EXACTAMENTE {Uñas, Pestañas, Cejas} por igualdad de conjuntos (como la
#           puerta de anclas de F-06). El conjunto esperado va ESCRITO A MANO.
#   · Q-F — ¿dónde viven los datos? RECOMENDACIÓN: **DOS módulos que SEPARAN el DATO de la LÓGICA**
#           (patrón I-7, honrando «solo la LÓGICA es mutable»):
#             (1) `src/lib/catalogo.ts` = DATO PURO — la fuente única (categorías, servicios,
#                 variantes, precios placeholder, suplementos, con sus literales de `nombre` y
#                 `concepto`). **FUERA de `mutate`.**
#             (2) `src/lib/catalogo-logica.ts` = LÓGICA — `precioAnteriorMostrable`, la validación de
#                 entrada y de estructura, la derivación del «desde» = mínimo y la proyección
#                 `registrosCatalogo` para F-01. **EN `mutate`.**
#           El componente `src/components/Catalogo.tsx` es aparte: importa DATO de (1) y LÓGICA de
#           (2) y SOLO renderiza. **EN `mutate`.** MOTIVO del corte (G2): si el DATO puro entrara en
#           Stryker, el mutador StringLiteral vaciaría cada `nombre`/`concepto` (`→ ''`) y —al no
#           aseverarse a mano por anti-tautología— SOBREVIVIRÍA, bloqueando el cierre con umbral 1.0
#           (0 exclusiones). Sacando el DATO de `mutate`, solo la LÓGICA (comparaciones, guardas,
#           derivaciones) y el render (literales de leyenda/aviso, cubiertos por @s3/@s4) quedan
#           mutados. IVA NUNCA calculado en vista: `precioConIva` es canónico (@s2).
#
# =============================================================================================
# LAS PUERTAS LEGALES — SEPARANDO SIEMPRE LOS TRES EJES (regla del repo, como F-04/F-05/F-06):
# LETRA DE LA NORMA ≠ TÉCNICA SUFICIENTE ≠ CRITERIO DE PROYECTO. Los tests aseveran hechos de
# PROYECTO/TÉCNICA; la norma se cita como MOTIVO, jamás como «la ley obliga a este literal».
# =============================================================================================
#   · Ley 11/1998 CM art. 14.2 (NORMA autonómica, aplicable en Las Rozas [V: BOE-A-1998-20651]):
#     «las ofertas concretas… deben incorporar el precio» y «los suplementos o incrementos
#     eventuales». → TÉCNICA: precio en cada servicio ofertado (@s2) + `suplementos[]` JUNTO al
#     precio, no en letra pequeña (@s17).
#   · TRLGDCU art. 20.1.c) (NORMA [V]): «el precio final completo, incluidos los impuestos» — MÁS
#     ESTRICTO que LSSI 10.1.f): frente a consumidores NO basta decir «IVA no incluido». → TÉCNICA:
#     leyenda «Precios con IVA incluido» (@s3), exactamente una vez. Párr. 2: informar de la BASE
#     DE CÁLCULO del «desde» [V]. → TÉCNICA: `baseDesde` no vacío + el «desde» = mínimo de las
#     variantes disponibles (@s5). PROYECTO: los euros son placeholder de muestra + aviso (@s4).
#   · TRLGDCU art. 20.2 (NORMA [V]): «formato que garantice su accesibilidad», con atención a las
#     personas consumidoras vulnerables. → La accesibilidad del catálogo es REQUISITO LEGAL, no
#     adorno. Los TRES ejes de a11y se SEPARAN (no se funden en un genérico «hereda a11y»):
#       — CONTRASTE (SC 1.4.3 / 1.4.11): HEREDA la puerta de tokens de F-03 (done). NO se re-testea.
#       — SEMÁNTICA (SC 1.3.1, roles/encabezados): HEREDA las puertas de F-04 (done). NO se re-testea.
#       — USO DEL COLOR (SC 1.4.1): NO lo cubre ni F-03 (contraste 1.4.3/1.4.11) ni F-04 (semántica).
#         Se satisface por CRITERIO DE PROYECTO: el precio, la leyenda y el «desde» son TEXTO —no se
#         comunican SOLO por color— y las aserciones de @s16 consultan por ROL / TEXTO. Es un hecho
#         de PROYECTO afirmado aquí, NO una herencia de F-03/F-04.
#   · LSSI art. 10.1.f) (NORMA [V], el SUELO): precio indicando si incluye o no impuestos. El
#     20.1.c) es el TECHO aplicable frente a consumidor (por eso manda la leyenda de @s3).
#   · LCD art. 5.1.e) (NORMA [V]): engaño sobre «la existencia de una ventaja específica con
#     respecto al precio» → un «antes» no realmente aplicado es infracción. → TÉCNICA: el «antes»
#     NO es un campo editable; se DERIVA de un histórico con fechas o NO EXISTE (@s7, @s8, @s9). 🔴
#     LA REGLA DE LOS 30 DÍAS **NO APLICA** (LOCM art. 20 / Dir. 98/6 se ciñen a PRODUCTOS, no a
#     servicios; Directrices UE 2021/C 526/02 §1.1 [V]). B-7.
#   · LCD art. 7 (NORMA [V], omisiones engañosas): suplementos ocultos. → TÉCNICA: `suplementos[]`
#     visibles junto al precio (@s17).
#   Marco sancionador (NO cálculo): TRLGDCU 47.g)/47.m) → 48.2.a) leves, elevables → 49.1.a)
#   150–10.000 €; el 48.4 rebaja un escalón si se corrige antes de la incoación [V].
#
# =============================================================================================
# ANTI-TAUTOLOGÍA (regla dura) Y LO NO-MUTABLE
# =============================================================================================
# TODO esperado se escribe A MANO: los literales de categoría «Uñas»/«Pestañas»/«Cejas» [V-LEAD],
# la leyenda «Precios con IVA incluido», el aviso «Precios de muestra — pendientes de confirmar con
# el salón», los números placeholder de muestra, la ubicación «catalogo.precios» y el conjunto
# `DIFERIDOS_APROBADOS`. Los datos de `catalogo.ts` y la proyección `registrosCatalogo` se importan
# SOLO como ENTRADA (como `registros` en `diferidos.test.ts`), NUNCA como el esperado que se compara
# contra sí mismo.
#
# 🔴 EL CORTE DATO / LÓGICA (G2 — consecuencia de la regla «solo la LÓGICA es mutable», I-7):
#   · `src/lib/catalogo.ts` = DATO PURO (categorías, servicios, variantes, precios, suplementos, con
#     sus literales de `nombre` y `concepto`). **NO va a `mutate`.** Si entrara, el mutador
#     StringLiteral vaciaría cada `nombre`/`concepto` (`→ ''`) y —al no aseverarse carácter a
#     carácter (anti-tautología)— SOBREVIVIRÍA, bloqueando el cierre (umbral 1.0, 0 exclusiones). El
#     DATO se asevera por su ROL en el negocio (igualdad de conjuntos @s10, forma no aplanada @s1).
#   · `src/lib/catalogo-logica.ts` = LÓGICA (guardas de fecha de `precioAnteriorMostrable`, la
#     derivación del «desde» = mínimo, la validación de entrada y de estructura, la proyección
#     `registrosCatalogo` con su ubicación única `catalogo.precios`). **VA a `mutate`.**
#   · `src/components/Catalogo.tsx` = RENDER. **VA a `mutate`.** Sus literales (leyenda @s3, aviso
#     @s4) SÍ son mutables y SÍ mueren (StringLiteral → '' baja el conteo a 0). Los nombres/precios
#     que pinta vienen del DATO, no son literales del componente.
# 🔴 LO CSS/PRESENTACIÓN NO ES MUTABLE (Stryker no ve SCSS): el layout/estilo de las tarjetas del
# catálogo lo aseveran los tests que LEEN el SCSS (como `tokens.test.ts` de F-03) + la puerta
# humana. Las aserciones de RENDER van por ROL / TEXTO / data-* (NUNCA por clase CSS: `css:false`
# → `styles.card` es `undefined`; regla del repo).
# `catalogo-logica.ts` y `Catalogo.tsx` se añaden A MANO a `mutate` de `stryker.config.json` (lista
# explícita, SIN glob → riesgo de verde-por-vacuidad si falta); `catalogo.ts` (DATO) se deja FUERA
# a propósito. `coverage.include` de `vitest.config.ts` ya cubre `src/lib/**` y `src/components/**`
# por glob desde F-06 [V] → NO hay que tocarlo.
#
# =============================================================================================
# EL MODELO (el núcleo testeable). EL DATO en `src/lib/catalogo.ts` (fuente única, FUERA de mutate);
# LA LÓGICA en `src/lib/catalogo-logica.ts` (EN mutate). Patrón I-7, Q-F:
#   DATO (catalogo.ts):
#     Categoria { id: 'unas'|'pestanas'|'cejas' (CERRADO), nombre: 'Uñas'|'Pestañas'|'Cejas'
#                 [V-LEAD], servicios: Servicio[] }
#     Servicio  { id, nombre (real y verificado), variantes: Variante[]  ← 🔴 NUNCA aplanado,
#                 precioDesde?, baseDesde?, suplementos?: Suplemento[] }
#     Variante  { etiqueta: 'S'|'M'|'L'|'', precioConIva: Precio  ← 🔴 el DATO CANÓNICO }
#     Precio    { euros: number (final CON IVA, por definición), esPlaceholder: boolean (hoy true) }
#     Suplemento{ concepto, precioConIva: Precio }
#   LÓGICA (catalogo-logica.ts):
#     · precioAnteriorMostrable(historico, ahora) → number | null  (reloj `ahora` INYECTADO, como
#       `estaAbierto` de F-10 — nunca `new Date()` dentro). El «antes» NO es un campo: es DERIVACIÓN.
#     · desdeDe(servicio) → el mínimo de las variantes disponibles (@s5).
#     · validación de entrada (`euros > 0`, numérico, categoría del conjunto cerrado) y de estructura
#       (`length > 0`) — falla cerrada, con mensaje que acusa la causa.
#     · registrosCatalogo → proyección a RegistroDatos (ubicación única `catalogo.precios`) para F-01.
# =============================================================================================
#
# =============================================================================================
# LO QUE F-09 NO CONSTRUYE (una feature a la vez):
#   · La IMAGEN por categoría (`ph-facial.png`/`ph-depil.png` desalineados) es F-17 (blocked). F-09
#     NO trae fotos.
#   · El ENLACE de reserva (Treatwell vs WhatsApp) es F-13. F-09 no decide el canal.
#   · La NOTA de reseñas (4,9) es F-14.
# =============================================================================================

Feature: El catálogo real Uñas · Pestañas · Cejas desde una fuente de datos única, con variantes sin aplanar, el precio final con IVA como dato canónico y una UI que se niega estructuralmente a un «antes» sin histórico
  Como responsable del proyecto quiero que las tres secciones reales del negocio —Uñas, Pestañas y
  Cejas— se rendericen desde `src/lib/catalogo.ts` (DATO, fuente única) con la LÓGICA en
  `src/lib/catalogo-logica.ts`, con el patrón servicio → variantes[] SIN aplanar, con `precioConIva`
  como dato CANÓNICO (nunca `precio_base + IVA` calculado en la vista), con la leyenda «Precios con
  IVA incluido» exactamente una vez y un aviso de «precios de muestra», y con un modelo que HACE
  IMPOSIBLE un «precio anterior» sin respaldo de un histórico con fechas; para que el catálogo sea
  oferta precontractual honesta y no una máquina de generar infracciones, y para que los precios
  placeholder queden DIFERIDOS Y ANCLADOS (F-01) sin poner el build de producción en rojo permanente.

  # ---------------------------------------------------------------------------
  # EL MODELO — sin aplanar, precio canónico, «desde» con base. DATO en src/lib/catalogo.ts.
  # ---------------------------------------------------------------------------

  @s1
  Scenario: un servicio con tallas expone sus variantes como HIJOS (servicio → variantes[]), NUNCA como servicios hermanos; uno sin tallas tiene UNA sola variante de etiqueta vacía
    Given un servicio del catálogo con tallas S, M y L y otro servicio sin tallas
    When se inspecciona su estructura en la fuente única
    Then el servicio con tallas tiene exactamente 3 variantes con etiquetas "S", "M" y "L" y 3 `precioConIva` distintos, todas como HIJAS del mismo servicio
    And NO existen tres servicios hermanos "… S", "… M" y "… L" al mismo nivel (el modelo no está aplanado)
    And el servicio sin tallas tiene exactamente 1 variante con `etiqueta` igual a la cadena vacía "" (misma forma, un solo hijo)
    # 🔴 CASO LÍMITE 1 + acceptance 2. El punto innegociable del modelo: «Manicura Semipermanente»
    # con S/M/L es UN servicio con TRES variantes, jamás tres servicios hermanos. NO es un mutante de
    # Stryker (9.6.1 no tiene mutador de «aplanado» ni de la forma del dato, que además vive en
    # `catalogo.ts`, FUERA de `mutate`): es una GUARDA ESTRUCTURAL que este escenario asevera por
    # construcción, contando HIJOS (las `variantes[]` del servicio), no hermanos. Coherente con la
    # regla anti-fantasma de @s15.

  @s2
  Scenario: el importe mostrado es IDÉNTICO a `precioConIva.euros` — cero aritmética de IVA en la vista (no se multiplica por 1,21 ni por ningún tipo)
    Given un servicio cuyo `precioConIva.euros` de muestra es un número escrito A MANO en el test (por ejemplo 25)
    When el componente renderiza ese precio
    Then el número que aparece en el render es exactamente ese `precioConIva.euros` (por ejemplo "25"), sin transformación
    And NO aparece ningún importe derivado de multiplicarlo por un tipo de IVA (por ejemplo no aparece "30,25" resultado de ×1,21)
    And el modelo NO expone ningún `precio_base` ni ninguna función de cálculo de IVA que la vista pudiera invocar
    # 🔴 CASO LÍMITE 6 (parte 1) + acceptance 3 (Q-F). `precioConIva` es el DATO CANÓNICO: la vista
    # muestra el número tal cual; la leyenda (@s3) AFIRMA un hecho sobre el dato, no lo calcula. El
    # número esperado se escribe A MANO. NO es un mutante de Stryker (9.6.1 no INSERTA aritmética: no
    # existe un mutador que introduzca un `×1,21`): es un SABOTAJE CONCEPTUAL que el escenario cierra
    # por construcción —el número mostrado es idéntico al dato y el modelo NO expone `precio_base` ni
    # función de cálculo de IVA que la vista pudiera invocar—. Coherente con la regla anti-fantasma de @s15.

  @s3
  Scenario: la leyenda «Precios con IVA incluido» aparece EXACTAMENTE UNA vez en el catálogo
    Given el catálogo renderizado con sus tres categorías y sus servicios
    When se cuentan las apariciones del texto "Precios con IVA incluido"
    Then el texto "Precios con IVA incluido" aparece exactamente 1 vez (ni 0 ni 2)
    And el literal esperado "Precios con IVA incluido" está escrito A MANO en el test
    # 🔴 CASO LÍMITE 6 (parte 2) + acceptance 3 (TRLGDCU 20.1.c, TECHO frente a consumidor). NORMA:
    # precio final con impuestos → TÉCNICA: la leyenda. La leyenda es un literal del componente
    # (`Catalogo.tsx`, EN mutate): un StringLiteral → '' la borra (conteo 0 → muere). El «exactamente
    # una vez» distingue borrar (0) de una duplicación a mano (2).

  @s4
  Scenario: mientras los precios sean placeholder, el catálogo muestra el aviso «Precios de muestra — pendientes de confirmar con el salón»
    Given el catálogo con sus precios declarados placeholder (`esPlaceholder: true`)
    When se renderiza el catálogo
    Then aparece un aviso VISIBLE con el texto "Precios de muestra — pendientes de confirmar con el salón"
    And el literal esperado del aviso está escrito A MANO en el test
    # ✅ Q-B. Los números son de MUESTRA, no los euros de Treatwell presentados como confirmados. El
    # aviso es la honestidad visible que acompaña a la demo de la UI de precios (leyenda, «desde»,
    # variantes). Es presentación de CONTENIDO (texto del componente `Catalogo.tsx`, EN mutate): se
    # asevera por su TEXTO, y un StringLiteral → '' sobre el aviso lo hace desaparecer (muere).

  @s5
  Scenario: un «desde X €» DECLARA su base de cálculo, y el «desde» es el MÍNIMO de las variantes disponibles
    Given un servicio con `precioDesde: true` y varias variantes con `precioConIva` distintos
    When se inspecciona su oferta de precio
    Then su `baseDesde` NO está vacío (declara la base de cálculo del «desde»)
    And el importe del «desde» es exactamente el MÍNIMO de los `precioConIva.euros` de sus variantes disponibles
    And el render muestra, junto al «desde», esa base declarada
    # 🔴 CASO LÍMITE 5 (parte 1) + acceptance 4. NORMA: Ley 11/1998 CM 14.2 + TRLGDCU 20.1.c) párr. 2
    # (base de cálculo del «desde»). TÉCNICA: `baseDesde` no vacío + «desde» = mínimo real disponible.
    # Mutantes REALES de Stryker: quitar la exigencia de base (Conditional/BlockStatement); el mínimo
    # → máximo (`Math.min` ↔ `Math.max`, Method Expression), que muere: el «desde» dejaría de ser el
    # importe más bajo realmente ofertado.

  @s6
  Scenario: un servicio con `precioDesde: true` SIN `baseDesde` FALLA CERRADA — nunca se renderiza un «desde» sin base
    Given un servicio con `precioDesde: true` y `baseDesde` vacío o ausente
    When el catálogo procesa ese servicio
    Then falla cerrada: se lanza o se excluye del render, y NO se pinta ningún «desde» sin su base
    And el modo de error es explícito (mensaje que acusa la causa), como `numeroNacional` de F-02 y las puertas del proyecto
    # 🔴 CASO LÍMITE 5 (parte 2) + MODO DE ERROR. Un «desde X €» sin base declarada es inválido
    # (TRLGDCU 20.1.c párr. 2). El diseño lo hace IMPOSIBLE de renderizar: falla cerrada, jamás pinta
    # un «desde» huérfano. Mutante: negar la guarda que exige la base.

  # ---------------------------------------------------------------------------
  # EL «ANTES» — una DERIVACIÓN PURA de un histórico con fechas, o NO existe. Reloj `ahora`
  # INYECTADO (patrón F-10). NO hay ranura para escribir `precioAnterior` a mano.
  # ---------------------------------------------------------------------------

  @s7
  Scenario Outline: `precioAnteriorMostrable` devuelve el «antes» SOLO si un histórico con fechas lo respalda; sin histórico, null
    Given un histórico "<historico>" y un instante `ahora` INYECTADO
    When se llama a `precioAnteriorMostrable(historico, ahora)`
    Then devuelve "<resultado>"

    Examples:
      | historico                                              | resultado          |
      | vacío (sin entradas)                                   | null               |
      | una entrada vigente (desde en el pasado, sin `hasta`)  | el número anterior |

    # 🔴 CASO LÍMITE 3 + acceptance 5 (LCD 5.1.e). El «antes» se DERIVA o NO EXISTE: no hay campo
    # editable a mano (eso es la máquina de infracciones que el riesgo de §9 nombra). Sin histórico
    # → null; con un histórico de fechas que respalde que el precio actual es una rebaja vigente →
    # el número. El esperado se escribe A MANO. Mutante: la guarda de existencia del histórico.

  @s8
  Scenario Outline: una oferta CADUCADA o FUTURA no produce «antes» — solo la vigente lo hace; los BORDES se fijan EN LA TABLA (las guardas de fecha)
    Given un histórico con una entrada cuyo periodo es "<periodo>" respecto de `ahora`
    When se llama a `precioAnteriorMostrable(historico, ahora)`
    Then devuelve "<resultado>"

    Examples:
      | periodo                                                     | resultado          |
      | caducado (`hasta` estrictamente anterior a `ahora`)         | null               |
      | futuro (`desde` estrictamente posterior a `ahora`)          | null               |
      | vigente, interior (`desde` < `ahora` < `hasta`)             | el número anterior |
      | vigente, borde de CIERRE (`ahora` === `hasta`)              | el número anterior |
      | vigente, borde de APERTURA (`ahora` === `desde`)            | el número anterior |

    # 🔴 CASO LÍMITE 4 + acceptance 5. La LETRA de LCD 5.1.e): un «antes» no realmente aplicado (o ya
    # caducado, o aún futuro) es engaño sobre una ventaja de precio. 🔴 La REGLA DE LOS 30 DÍAS NO
    # APLICA (LOCM 20 / Dir. 98/6 se ciñen a PRODUCTOS, no a servicios; Directrices UE 2021/C
    # 526/02 §1.1 [V]) — B-7. G1 — LAS FRONTERAS SE FIJAN EN LA TABLA, NO SE DEJAN A LA MUTACIÓN:
    # `hasta < ahora` vs `hasta <= ahora` solo difieren en `ahora === hasta`, y `desde > ahora` vs
    # `desde >= ahora` solo en `ahora === desde`. Por eso las DOS filas de borde explícitas
    # —`ahora === hasta` (vigente → número) y `ahora === desde` (vigente → número)— matan los
    # mutantes de frontera `< / <=` y `> / >=`. La semántica es INCLUSIVA en ambos bordes (vigente =
    # `desde ≤ ahora ≤ hasta`). Mutantes REALES de Stryker (EqualityOperator): los cuatro operadores
    # de fecha y sus fronteras.

  @s9
  Scenario Outline: la UI OBEDECE a la derivación del «antes»: lo pinta si y SOLO si hay un número; ante `null` no pinta nada
    Given un servicio cuyo `precioAnteriorMostrable(...)` devuelve "<derivacion>"
    When el componente renderiza ese servicio
    Then en el render "<que pasa con el antes>"
    And en todo caso aparece el `precioConIva` vigente

    Examples:
      | derivacion                          | que pasa con el antes                                                                   |
      | null                                | NO aparece ningún «antes» (ni importe tachado, ni la palabra «antes», ni un porcentaje) |
      | un número escrito a mano (p.ej. 40) | aparece el «antes» con ese importe (por ejemplo "40")                                   |

    # 🔴 acceptance 5 (lado RENDER) + LCD 5.1.e). @s7/@s8 fijan la DERIVACIÓN; ESTE fija que la UI la
    # OBEDECE en LOS DOS sentidos: ante `null`, la negativa a pintar el «antes» es estructural; ante
    # un número, el «antes» SÍ aparece. La fila POSITIVA es load-bearing: sin ella, un mutante que
    # OCULTE SIEMPRE el «antes» sobreviviría (la fila `null` sola no lo mata). Mutante: pintar el
    # «antes» aunque la derivación diera `null`, u ocultarlo aunque diera número.

  # ---------------------------------------------------------------------------
  # LAS CATEGORÍAS — conjunto CERRADO. Y las colecciones vacías / entradas inválidas.
  # ---------------------------------------------------------------------------

  @s10
  Scenario: el conjunto de categorías es EXACTAMENTE {Uñas, Pestañas, Cejas} — «Facial» y «Depilación» NO aparecen (igualdad de conjuntos)
    Given el catálogo de la fuente única
    When se deriva el conjunto de nombres de categoría
    Then el conjunto de nombres es EXACTAMENTE, en cualquier orden, {"Uñas", "Pestañas", "Cejas"}
    And "Facial" NO aparece como categoría
    And "Depilación" NO aparece como categoría
    And el conjunto esperado {"Uñas", "Pestañas", "Cejas"} está escrito A MANO en el test, no derivado del catálogo
    # 🔴 CASO LÍMITE 7 + acceptance 1 (✅ Q-E). Las tres secciones reales del negocio son Uñas ·
    # Pestañas · Cejas [V-LEAD, literal de la web del titular]. «Facial» y «Depilación» eran del
    # prototipo y NO EXISTEN en este salón [V-LEAD]. NO es un mutante de Stryker (los nombres de
    # categoría son DATO, en `catalogo.ts`, FUERA de `mutate`): es una GUARDA de igualdad de conjuntos
    # —como la puerta de anclas de F-06— que caza el drift del dato o un renombrado a mano. El conjunto
    # esperado {Uñas, Pestañas, Cejas} va ESCRITO A MANO, nunca derivado del catálogo.

  @s11
  Scenario: una categoría SIN servicios no rompe el render; un catálogo con 0 categorías FALLA CERRADA (nunca verde por vacuidad)
    Given una categoría con `servicios: []` y, por otro lado, un catálogo con 0 categorías
    When se valida y se renderiza cada caso
    Then la categoría vacía NO se pinta como una tarjeta rota (se omite o muestra «próximamente»), sin lanzar
    And la validación de estructura de un catálogo con 0 categorías FALLA CERRADA: lanza con un mensaje que acusa la causa (nunca pasa en verde por VACUIDAD; 0 categorías no es «todo correcto»)
    And esa validación es una FUNCIÓN pura testeada por unidad —no una CLI nueva integrada en el build—: su guarda es la NO-VACUIDAD (`length > 0`), DISTINTA del «exactamente {Uñas, Pestañas, Cejas}» que asevera @s10
    # 🔴 CASO LÍMITE 8. Dos vacíos DISTINTOS: la colección de servicios vacía es un estado tolerable
    # (categoría en construcción), pero el catálogo entero vacío es un FALLO. Aquí la guarda es la
    # NO-VACUIDAD (`length > 0`), NO la cardinalidad exacta: «exactamente 3 = {Uñas, Pestañas, Cejas}»
    # es @s10 (igualdad de conjuntos). NO se introduce una CLI nueva en el build (fuera de alcance de
    # F-09): es una función de validación que falla cerrada, como `numeroNacional` de F-02. Es la
    # lección de la «falla cerrada y NO por vacuidad» de F-04/F-06. Mutante REAL de Stryker: el
    # `length > 0` de la guarda de estructura (`> 0` → `>= 0`), que muere aquí.

  @s12
  Scenario Outline: una entrada inválida se RECHAZA — precio no numérico, negativo, cero, o categoría fuera del conjunto cerrado
    Given una entrada de catálogo con "<entrada inválida>"
    When el catálogo la valida
    Then se RECHAZA (falla cerrada: lanza o la excluye del render), nunca se publica
    And el modo de error es explícito, con un mensaje que acusa la causa, como `numeroNacional` de F-02

    Examples:
      | entrada inválida                                  | por qué                                                            |
      | `euros` = NaN                                     | un importe no numérico no es un precio                             |
      | `euros` negativo                                  | un precio negativo es basura semántica                             |
      | `euros` = 0                                       | DECISIÓN de proyecto: 0 € no es un precio ofertado (frontera `> 0`)|
      | `euros` no numérico (cadena, undefined)           | falla cerrada ante lo que no es un número                          |
      | `id` de categoría fuera de {unas, pestanas, cejas}| el conjunto de categorías es CERRADO (@s10)                        |

    # 🔴 CASO LÍMITE 9 + MODO DE ERROR. La red de seguridad numérica (como el `NUMERO_NACIONAL_VALIDO`
    # de F-02): ante `NaN`/negativo/cero/no numérico, falla cerrada en vez de emitir un precio a
    # medias. DECISIÓN de proyecto: el precio ofertado es estrictamente positivo (`euros > 0`); `0 €`
    # NO es un precio de muestra válido (un «gratis» es otra afirmación que no se sostiene). La fila
    # `euros === 0` fija la FRONTERA que mata el mutante `> 0` → `>= 0`. Mutante REAL de Stryker: la
    # validación numérica (negarla, ampliar el rango, o mover la frontera `> 0` → `>= 0`).

  # ---------------------------------------------------------------------------
  # EL MECANISMO F-01 (DIFERIR) Y EL DIFERIDO ANCLADO (ANCLAR) — Q-A, la colisión con A-21.
  # ---------------------------------------------------------------------------

  @s13
  Scenario: el MECANISMO — `detectarPlaceholders` sobre la proyección REAL del catálogo da violación mientras los precios sean placeholder, y [] cuando dejan de serlo
    Given la proyección REAL `registrosCatalogo` (de `src/lib/catalogo-logica.ts`), importada SOLO como ENTRADA, con sus precios `esPlaceholder: true`
    When se llama a `detectarPlaceholders({ registros: registrosCatalogo })`
    Then `registrosCatalogo` NO está vacía: tiene al menos 1 registro (anti-vacío: hay precios que vigilar de verdad, no un fixture inventado)
    And devuelve al menos 1 violación, cada una por la VÍA DEL FLAG (via "flag", motivo "marcado"), una por cada precio placeholder
    And cada violación lleva la ubicación "catalogo.precios"
    And con TODOS los precios a `esPlaceholder: false`, `detectarPlaceholders` devuelve exactamente `[]`
    And `registrosCatalogo` se importa SOLO como ENTRADA de `detectarPlaceholders`, no como el esperado
    # 🔴 CASO LÍMITE 2 (el «precio placeholder que rompe el build», A NIVEL DE MECANISMO) + ✅ Q-A
    # (DIFERIR). Es el `@s34` de F-04 y el `@s10` de F-02 vistos desde F-09: F-09 NO duplica la
    # puerta de F-01, se APOYA en ella. La puerta caza el placeholder POR EL FLAG (`esPlaceholder`),
    # vía `motivoDelFlag` de `src/lib/placeholders.ts` (F-01, ya en `mutate` y mutado al 100%): @s13
    # lo VUELVE A EJERCITAR con la proyección REAL del catálogo, no con un fixture (anti-vacío). El
    # CABLEADO EN VIVO al humilde queda diferido — @s14. Mutante: invertir la guarda del flag
    # (`=== false` → `!== false`) en `motivoDelFlag`, que muere aquí.

  @s14
  Scenario: el DIFERIDO ANCLADO — los precios del catálogo NO se cablean al build (sigue verde) y su ubicación queda ANCLADA en `DIFERIDOS_APROBADOS`
    Given los precios del catálogo declarados placeholder en `registrosCatalogo` con la ubicación única "catalogo.precios", y el humilde `tools/puerta-placeholders.ts`
    When se inspecciona el ancla de lo diferido (`src/lib/diferidos.test.ts`): se lee el FICHERO real del humilde y se compara `DIFERIDOS_APROBADOS`
    Then el ANCLA DEL ANCLA a nivel de FICHERO: `tools/puerta-placeholders.ts` NO importa ni pasa `registrosCatalogo` — se asevera con `readFileSync('tools/puerta-placeholders.ts')` + `not.toMatch(/registrosCatalogo/)`, igual que `diferidos.test.ts` hace con `seo.origenCanonica` (líneas 89-96)
    And por tanto el build de producción sigue en código de salida 0 por lo que respecta al catálogo (el humilde NO cablea sus precios)
    And la ubicación "catalogo.precios" figura en `DIFERIDOS_APROBADOS`, escrita A MANO como un ÚNICO literal (para fijar el `toContain` sobre un valor pineado, no sobre un subconjunto)
    And si alguien difiere un precio del catálogo cuya ubicación NO esté en `DIFERIDOS_APROBADOS`, el ancla se pone en ROJO y hay que volver a la puerta humana
    And el conjunto `DIFERIDOS_APROBADOS` esperado se escribe A MANO, nunca derivado de `registrosCatalogo` (anti-tautología)
    # ✅ Q-A (ANCLAR), LA COLISIÓN CON A-21 RESUELTA. `pnpm build` (producción) corre el humilde, y
    # ese mismo build lo corren `init`, `verify`, la CI y la verificación de cada feature de UI. Si
    # se cablearan los precios placeholder EN VIVO, quedaría en ROJO PERMANENTE y F-10/F-11/F-12 se
    # desarrollarían contra un rojo fijo — MISMO argumento con el que F-04 difirió `seo.origenCanonica`
    # (A-21) y F-02 dejó fuera `site.email` (A-11). DIFERIR NO ES MUERTO: el mecanismo está PROBADO
    # (@s13) y el CONJUNTO de lo diferido está ANCLADO — con el ANCLA DEL ANCLA a nivel de fichero,
    # que mira EL HUMILDE que corre en el build (no solo los símbolos), como `diferidos.test.ts` ya
    # hace con `seo.origenCanonica`. `DIFERIDOS_APROBADOS` hoy es `['seo.origenCanonica', 'site.email']`
    # → se AÑADE `catalogo.precios` (literal único, para pinar el `toContain`). Sin el ancla,
    # «diferido» sería un cajón donde cabe todo. Cuando el cliente dé precios reales: se cambia el
    # DATO y el flag a `false` y se cablea con un cambio de UNA línea. Es una EXCEPCIÓN EXPLÍCITA al
    # patrón que el humano confirma en la puerta.

  # ---------------------------------------------------------------------------
  # EL RENDER desde la fuente única, y los suplementos (Ley 11/1998 14.2 + LCD 7).
  # ---------------------------------------------------------------------------

  @s16
  Scenario: el componente pinta las 3 categorías DESDE `src/lib/catalogo.ts` (fuente única) — ningún nombre, precio ni categoría escrito a mano en el JSX
    Given el catálogo importado de la fuente única `src/lib/catalogo.ts`
    When el componente `src/components/Catalogo.tsx` renderiza la sección "#servicios"
    Then aparecen las 3 categorías con sus nombres tomados de la fuente única, cada una listando sus servicios
    And cada servicio muestra sus VARIANTES (con su `etiqueta` y su `precioConIva`) como hijas suyas, reflejando el modelo no aplanado de @s1
    And el render se deriva ÍNTEGRAMENTE de la fuente única: ningún nombre de categoría/servicio ni ningún precio está escrito a mano en el JSX del componente
    And las aserciones consultan por ROL / TEXTO / data-*, NUNCA por clase CSS
    # ✅ Q-F + acceptance 1/2 (lado RENDER). La sección `#servicios` (ya presente desde F-06) pasa de
    # andamiaje a las 3 categorías reales. El CORTE DATO/LÓGICA (G2) es lo que hace SANA esta
    # aserción: los nombres de servicio/categoría viven en `catalogo.ts` (DATO, FUERA de `mutate`),
    # así que comparar render-contra-fuente no pelea con un superviviente StringLiteral → ''; la
    # LÓGICA de render (obedecer `null` @s9, pintar suplementos @s17, derivar la estructura) sí está
    # en `Catalogo.tsx` (EN `mutate`). Que la fuente sea única es lo que impide que un nombre o un
    # precio del JSX diverja del dato (misma lección que el teléfono 7 veces de F-02).

  @s17
  Scenario: los suplementos de un servicio se muestran JUNTO al precio, con su propio `precioConIva` — nunca ocultos ni en letra pequeña
    Given un servicio con `suplementos: [{ concepto, precioConIva }]`
    When se renderiza ese servicio
    Then cada suplemento aparece JUNTO al precio del servicio, con su `concepto` y su importe `precioConIva`
    And ningún suplemento queda oculto, colapsado o fuera de la vista del precio
    # 🔴 Ley 11/1998 CM 14.2 (NORMA: «los suplementos o incrementos eventuales» junto a la oferta) +
    # LCD art. 7 (NORMA: omisiones engañosas → suplementos ocultos). TÉCNICA: `suplementos[]` visibles
    # junto al precio. El `concepto` es DATO (en `catalogo.ts`, FUERA de mutate); lo MUTABLE aquí es
    # la LÓGICA de render de `Catalogo.tsx` que decide MOSTRARLOS. Mutante: ocultar u omitir los
    # suplementos del render.

  # ---------------------------------------------------------------------------
  # LOS MUTANTES QUE DEBEN MORIR (I-6, umbral 1.0). El conjunto EXACTO se MIDE cuando los ficheros
  # existan (lección de F-05/F-07: predecirlo sería una PREDICCIÓN, no una medición). 0 EXCLUSIONES.
  # ---------------------------------------------------------------------------

  @s15
  Scenario Outline: mutar la lógica del catálogo (guardas de fecha, «desde»=mínimo, validación, estructura, flag) rompe al menos un test
    Given la lógica MUTABLE de F-09 en `src/lib/catalogo-logica.ts` y en `src/components/Catalogo.tsx`, más `motivoDelFlag` de `src/lib/placeholders.ts` (F-01, ya en `mutate`) que @s13 vuelve a ejercitar con el catálogo
    When se aplica la mutación "<mutación>"
    Then al menos un test pasa de verde a rojo

    Examples:
      | mutación                                                                    | dónde muere                                                              |
      | invertir la guarda del flag en `motivoDelFlag` (`=== false` → `!== false`)  | @s13 (los registros del catálogo dejarían de producir violación)         |
      | alterar el operador de fecha de `hasta` (`hasta < ahora` → `<=` / `>`)      | @s8 (la fila `ahora === hasta` fija el borde: pasaría de número a null)   |
      | alterar el operador de fecha de `desde` (`desde > ahora` → `>=` / `<`)      | @s8 (la fila `ahora === desde` fija el borde: pasaría de número a null)   |
      | negar la guarda de existencia del histórico                                 | @s7 (sin histórico dejaría de dar `null`)                                |
      | el «desde» pasa de mínimo a máximo de las variantes (`Math.min` ↔ `Math.max`)| @s5 (el «desde» dejaría de ser el importe más bajo disponible)          |
      | quitar la exigencia de `baseDesde` cuando `precioDesde` es true             | @s6 (un «desde» sin base dejaría de fallar cerrada)                       |
      | ampliar/negar la validación numérica (`> 0` → `>= 0`: `0`/negativo pasaría)  | @s12 (una entrada inválida dejaría de rechazarse)                        |
      | alterar el `length > 0` de la guarda de estructura (`> 0` → `>= 0`)         | @s11 (0 categorías dejaría de fallar cerrada)                            |

    # 🔴 EL CONJUNTO EXACTO DE MUTANTES **NO SE PUEDE PREDECIR**: los ficheros de F-09 NO EXISTEN
    # todavía; otra implementación tendrá otro conjunto. **SE MIDE CUANDO EXISTAN, NO ANTES.** Los
    # sabotajes de esta tabla mapean a mutadores REALES de Stryker 9.6.1 (EqualityOperator `<`/`<=`,
    # `>`/`>=`, `===`/`!==`; Method Expression `Math.min`↔`Math.max`; negación de condicional/booleano;
    # ConditionalExpression). PROHIBIDO nombrar mutadores FANTASMA (ni de «aplanado», ni de INSERTAR
    # aritmética, ni `.includes`, ni `lastIndexOf→indexOf`: no existen en Stryker 9.6.1 [V] — por eso
    # @s1/@s2/@s10 se cierran por GUARDA/CONSTRUCCIÓN, no como mutantes). Si un mutante RESISTE, el
    # `tdd_craftsman` ESCALA AL HUMANO —NO lo excluye, NO baja el umbral, NO lo declara equivalente
    # por su cuenta— (umbral 1.0, 0 EXCLUSIONES desde F-03). Solo la LÓGICA es mutable: el DATO
    # (`catalogo.ts`: nombres, conceptos, números) queda FUERA de `mutate` (G2); el SCSS del catálogo
    # (layout/estilo) NO lo ve Stryker → lo aseveran los tests que leen el SCSS + la puerta humana; los
    # literales de render (leyenda @s3, aviso @s4) son literales del componente que aseveran los tests.
