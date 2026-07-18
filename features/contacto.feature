# Contrato de la feature 12 (`contacto`) de feature_list.json.
# Destilado de `progress/spec_draft_contacto.md` (borrador del `spec_partner`, decisiones 1-5 con
# recomendación). AÚN NO vive en `project-spec.md`: se traslada allí cuando el humano cierre la puerta.
#
# =============================================================================================
# ⏸⏸ PENDIENTE DE PUERTA HUMANA (LOTE 2026-07-18). EL `tdd_craftsman` NO IMPLEMENTA NADA HASTA QUE
#    EL HUMANO APRUEBE ESTOS ESCENARIOS. ⏸⏸
#    A diferencia de F-05/F-06/F-07 (ya aprobadas), ESTE contrato llega a la puerta con TODO resuelto
#    y una recomendación por decisión (patrón «autonomía hasta la puerta»: Pablo prepara, el humano
#    aprueba en lotes). El lead PROPONE; el humano DECIDE. Mientras la puerta no cierre, este `.feature`
#    es una PROPUESTA, no un contrato firme. Las decisiones que van a la puerta están al final del
#    fichero, en «DECISIONES QUE VAN A LA PUERTA», cada una con su recomendación.
#
# =============================================================================================
# 🔧 RONDA DE REPARACIÓN — v2 (tras la revisión adversarial del contrato v1)
# =============================================================================================
#   Esta es la SEGUNDA versión, reparada. Cambios respecto de v1, por hallazgo (los tags de v1 se
#   CONSERVAN estables para no invalidar las citas de la revisión; se AÑADEN @s14 y @s15):
#   · B1 (BLOQUEANTE, vacuidad): cada negativa ACOTADA a `#contacto` (@s9, @s11) —y @s12— co-asevera
#     ahora, EN EL MISMO scope extraído, un ANCLA POSITIVA que prueba que la extracción NO devolvió ""
#     («la sección extraída SÍ contiene el <h2 Contacto y `tel:+34625223366`»). Sin ancla positiva una
#     sección vacía haría pasar la negativa por VACUIDAD. Doctrina del repo: `puerta-anclas.ts`
#     (seInspeccionoAlgunAncla / seDerivoAlgunaSeccion, «NUNCA verde por vacuidad»).
#   · G1/G2 (scope email/TikTok): @s8 (email) y @s7 (TikTok) YA NO se acotan a `#contacto`; aseveran
#     sobre el HTML CRUDO de TODA la página (`<head>`+`<body>`), porque el vector real (JSON-LD del
#     `<head>`) vive fuera de `#contacto`. CONTRASTE: @s9 (Facebook) SÍ sigue acotado (FB DEBE existir
#     en el pie).
#   · G3 (A1 sin test que muerda + texto IG sin fijar): @s14 NUEVO fija el TEXTO VISIBLE del enlace de
#     IG y su consistencia texto↔href (réplica del @s8 de F-02); @s15 NUEVO añade una guarda a nivel de
#     FUENTE: el `.tsx` del componente NO contiene ningún literal `instagram.com`.
#   · G4 (@s2 Examples): la cadena vacía se codifica SIN AMBIGÜEDAD (columna-marcador `<caso>` que el
#     step decodifica a la cadena literal; ya no hay celdas `""` ni comillas dobladas).
#   · Menores: @s4 explicita «compara contra el literal a mano, nunca reejecutando instagramHref»;
#     @s5/@s13 rebajan la cita RD 193/2023 art. 14.1 a NO-VERIFICADA (se confirma antes de trasladarla);
#     @s6 declara que leer el SCSS es un PROXY de existencia, NO prueba de prominencia.
#
# =============================================================================================
# FUENTES LEÍDAS (no inventadas)
# =============================================================================================
#   · `progress/spec_draft_contacto.md` — el borrador (propósito, comportamiento, contrato, casos
#     límite, decisiones D-1..D-5, D-1a, preguntas abiertas).
#   · `feature_list.json` §12 — los 4 acceptance y `bloqueada_para_publicar` (el email).
#   · `src/lib/site.ts` — la fuente única F-02: `TELEFONO.legible` («625 22 33 66»), `telHref`
#     (→ «tel:+34625223366»), `REDES.instagram` («@nailslash.studio_»), `REDES.facebook`
#     («https://www.facebook.com/nailslashstudiorozas/»), `DIRECCION`. NO existe `instagramHref`
#     todavía: F-12 la AÑADE (D-1) como derivación pura hermana de `telHref`/`waHref` [V: site.ts:45-48,
#     100-108; el comentario de `Pie.tsx:13-15` ya anticipa que hornear la URL «sería HARDCODEARLA»].
#   · `src/lib/seo.ts` — `construirJsonLd` (@s...): HOY OMITE deliberadamente el email («email → A-11
#     ABIERTA: no se emite», seo.ts:181) y NO emite redes; pero el JSON-LD del `<head>` es el SITIO
#     NATURAL de un email/red si alguien lo reintrodujese → por eso @s7/@s8 miran la página ENTERA.
#   · `src/lib/puerta-anclas.ts` — la doctrina anti-vacuidad que arma B1: guardas
#     `seInspeccionoAlgunAncla`/`seDerivoAlgunaSeccion` (líneas 226-249), «NUNCA verde por vacuidad».
#   · `src/pages/home.tsx` — el stub `#contacto-titulo` que F-12 ENRIQUECE, no recrea [V: home.tsx:79-86,
#     `<section aria-labelledby="contacto-titulo">` con `<h2 id="contacto-titulo">`, la dirección
#     derivada de `DIRECCION` y un `<a href={telHref(...)}>` con el teléfono]. ES el `.tsx` que vigila
#     @s15 (no debe hornear `instagram.com`).
#   · `src/components/Pie.tsx` — Facebook + `tel:` del pie (F-06) [V: Pie.tsx:21-22]. Su comentario
#     :13-15 declara que Instagram es un HANDLE (no una URL) y que hornear la URL «sería HARDCODEARLA».
#   · `docs/research/datos-google.md` §3.5 — el handle IG CORRECTO es `@nailslash.studio_` (declarado
#     en el GBP del propio negocio [V]); el `@nail_lash_studio_` del directorio del centro está NO
#     VERIFICADO y NO se usa. §4.3 — el email `centroesteticarozas@gmail.com` aparece SOLO en el
#     JSON-LD de la web actual, nunca visible, sin verificar → NO se publica.
#   · `features/hero_marca.feature`, `features/header_nav_footer.feature`,
#     `features/datos_negocio_fuente_unica.feature` — estilo del repo (SCSS/FUENTE no-mutable leídos
#     como bytes del `.module.scss`/`.tsx`; aserciones sobre el HTML CRUDO de `dist/`; anti-tautología;
#     la derivación pura hermana de `telHref`/`waHref`; texto↔href consistentes = @s8 de F-02).
#
# =============================================================================================
# 🔴 EL ÚNICO NÚCLEO MUTABLE: `instagramHref(handle)` — derivación pura en `src/lib/site.ts` (D-1)
# =============================================================================================
# El dato canónico de F-02 es el HANDLE `@nailslash.studio_`, NO una URL (decisión deliberada de F-02:
# guardar la URL «sería HARDCODEARLA» y reintroduciría la divergencia texto/href que F-02 existe para
# matar). Para enlazar Instagram SIN hardcodear, F-12 añade `instagramHref`, hermana de `telHref`/
# `waHref`: convierte el handle en la URL pública del perfil. Es la ÚNICA lógica que Stryker puede mutar
# en F-12 (@s13); el resto es render (@s4, @s5, @s9..@s12, @s14) + CSS (@s6) + bytes de FUENTE (@s15).
# Contrato de la derivación:
#   instagramHref('@nailslash.studio_')  → 'https://www.instagram.com/nailslash.studio_/'
#      (valida el handle, quita el '@' inicial, antepone el host, cierra con '/')
#   instagramHref('')  /  '@'  /  handle con espacios  → LANZA (falla cerrada, como `numeroNacional`)
#   instagramHref('nailslash.studio_')  (SIN '@')      → D-1a, DECISIÓN A LA PUERTA (recomendado: LANZA)
# 🔴 AÑADIR `instagramHref` EXTIENDE `site.ts` (F-02, done) con una función NUEVA; NO modifica el
#    comportamiento existente de F-02 ni rompe sus tests (tocar el módulo de una feature done es, por
#    sí mismo, una DECISIÓN A LA PUERTA — D-1). Lo implementa el `tdd_craftsman` de F-12 por TDD.
#
# =============================================================================================
# 🔴 «VERDE ≠ FUNCIONA» (I-8): DÓNDE SE ASEVERA CADA COSA
# =============================================================================================
#  · La DERIVACIÓN pura (`instagramHref`) se asevera por test unitario sobre la función (@s1..@s3, @s13).
#  · El ARTEFACTO ACOTADO a la sección `#contacto` (extraída del HTML CRUDO de `dist/` con `readFileSync`
#    + string, NUNCA jsdom —jsdom solo ve el estado post-hidratación; el SSG tiene además el prerender,
#    y F-04 pagó cara esa lección—) se asevera en @s4, @s5, @s9, @s11, @s12, @s14. Toda extracción de
#    `#contacto` co-asevera un ANCLA POSITIVA (anti-vacuidad B1).
#  · Los NEGATIVOS que deben vigilar la PÁGINA ENTERA (`<head>`+`<body>`, HTML crudo de `dist/`) son
#    @s7 (TikTok) y @s8 (email/`mailto:`): su vector natural es el JSON-LD del `<head>`, fuera de
#    `#contacto`. También co-aseveran un ancla positiva (la marca) contra la vacuidad del fichero.
#  · La guarda a nivel de FUENTE (bytes del `.tsx`, como el repo lee el `.module.scss`) es @s15: el
#    componente NO hornea `instagram.com`. No-mutable.
#  · La PROMINENCIA en móvil del `tel:` y el «SIN peso visual» de Facebook son CSS: Stryker NO ve SCSS
#    → se DECLARAN no-mutables (@s6). Leer una `@media` del SCSS es PROXY de EXISTENCIA, no prueba de
#    PROMINENCIA: eso se acredita con verificación visual + la puerta humana.
#
# =============================================================================================
# 🔴 FRONTERAS DE ALCANCE (declaradas, para que nadie invada ni deje huecos)
# =============================================================================================
#  · CON F-13 `solicitud_whatsapp` (XL, aplazado) — LA FRONTERA CENTRAL. El acceptance de F-12 dice
#    «junto al botón de WhatsApp hay una alternativa accesible (teléfono)»; pero EL BOTÓN/FLUJO DE
#    RESERVA POR WHATSAPP ES F-13, NO F-12. F-12 entrega la ALTERNATIVA ACCESIBLE (el `tel:` real, la
#    dirección, Instagram) como entregable autónomo, y NO construye el botón de WhatsApp (@s11). La
#    ADYACENCIA FÍSICA «junto al botón» (acceptance A2) la CIERRA F-13 cuando aterrice, colocando su
#    botón EN/JUNTO a esta misma sección `#contacto` con la alternativa ya a su lado. Reinterpretación
#    para la DEMO: «existe una alternativa de contacto accesible por un canal que NO requiere WhatsApp
#    (el `tel:`), presente y prominente en la sección de contacto».
#  · CON F-11 `mapa_como_llegar`. F-12 muestra la DIRECCIÓN COMO TEXTO (ya presente, derivada de
#    `DIRECCION`). El MAPA estático autohospedado, el enlace «Cómo llegar» (Maps en pestaña nueva) y la
#    mención «Planta 0, Local 41» son F-11: F-12 NO los construye (@s12).
#  · CON F-06 `header_nav_footer` (done). Facebook y el `tel:` DEL PIE ya existen (`Pie.tsx`) y F-12 NO
#    los toca ni los duplica: F-12 opera en la sección `#contacto` del `<main>`, no en el pie. Facebook
#    NO se cuela en `#contacto` (@s9). Reutilizar el stub `#contacto-titulo` mantiene UN único destino
#    de ancla y NO rompe la puerta de anclas vivas de F-06 (@s10).
#  · CON F-16 `paginas_legales` (blocked). El email como CAMPO LEGAL es de F-16; F-12 lo OMITE en la
#    DEMO (@s8, D-3) y NO lo cablea como placeholder a F-01.
#
# =============================================================================================
# ANTI-TAUTOLOGÍA (regla dura del arnés) Y LO PROHIBIDO EN ESTE FICHERO, LOS TESTS Y LOS MENSAJES
# =============================================================================================
# TODO esperado se escribe A MANO en el escenario y en el test: la URL `https://www.instagram.com/
# nailslash.studio_/`, la del handle alternativo que NO se usa, el `tel:+34625223366`, el texto legible
# `625 22 33 66`, el handle visible `@nailslash.studio_`. El handle `REDES.instagram` (`site.ts:46`) es
# la ENTRADA legítima de la derivación (fuente única F-02); los ESPERADOS jamás se importan de `site.ts`
# ni se obtienen re-ejecutando `instagramHref`/`telHref` dentro del test (precedente WebEmpresa: el fake
# atado al SÍMBOLO en vez del LITERAL fue el primer mutante superviviente; patrón
# `doble-de-test-anclado-al-literal-no-al-simbolo`).
# ❌ PROHIBIDO EN ESTE CONTRATO, EN LOS TESTS Y EN LOS MENSAJES:
#    · HARDCODEAR la URL de Instagram (ni la correcta ni la alternativa) en el componente `.tsx`: el
#      `href` DERIVA de `REDES.instagram` vía `instagramHref` (@s4), el texto visible es consistente con
#      él (@s14) y el host NO vive en el render (@s15). Hornearla rompería el invariante que F-02 existe
#      para matar y el acceptance «los href derivan del dato único de F-02, no están hardcodeados».
#    · atribuir a WCAG SC 2.5.8 (Target Size Minimum, AA en 2.2) un umbral de tamaño de objetivo como
#      PUERTA de la prominencia del `tel:`: la prominencia es CSS, verificada a ojo (D-5); NO se cita
#      la norma sin decisión explícita (el repo prohíbe la atribución normativa a la ligera).
#    · dar por VERIFICADA la cita legal «RD 193/2023 art. 14.1» sin confirmar su texto en la fuente
#      oficial: el PRINCIPIO (una alternativa de contacto que no dependa de un canal propietario) motiva
#      la feature, pero el artículo concreto se trata como SC 2.5.8 — no se cita como puerta sin
#      verificación (@s5, @s13).
#    · usar el handle `@nail_lash_studio_` del directorio del centro (NO VERIFICADO): el handle es
#      `@nailslash.studio_` (GBP del negocio) [V, datos-google.md §3.5].
#    · filtrar el email `centroesteticarozas@gmail.com` ni un `mailto:` a NINGUNA parte del artefacto
#      (`<head>` incluido, @s8; sin confirmar).
#    · emitir un `tiktok.com` ni el texto «TikTok» en NINGUNA parte del artefacto (@s7; no verificado;
#      F-02 no lo guarda).
#    · construir el botón/flujo de reserva por WhatsApp (es F-13) ni el mapa/«Cómo llegar»/«Planta 0,
#      Local 41» (es F-11).
#    · crear una sección de contacto NUEVA (rompería la igualdad de conjuntos de la nav y las anclas
#      vivas de F-06): F-12 enriquece el `<section aria-labelledby="contacto-titulo">` existente.
#
# =============================================================================================
# TRAZA A LOS 4 ACCEPTANCE de feature_list.json (feature id 12) y a los casos límite del borrador
# =============================================================================================
#   A1 (href derivan del dato único, no hardcodeados)        → @s1, @s4, @s13, @s14, @s15 · caso límite 1
#   A2 (junto al botón WhatsApp, alternativa accesible = tel) → @s5, @s11 (adyacencia física la cierra F-13)
#   A3 (teléfono pulsable con tel: en móvil)                  → @s5, @s6        · caso límite 2
#   A4 (no aparece TikTok — artefacto ENTERO)                → @s7             · caso límite 3
#   D-1a handle IG correcto, no el alternativo               → @s1, @s14       · caso límite 4
#   D-1a handle vacío/inválido → falla cerrada                → @s2, @s3        · caso límite 5
#   D-3 email no se filtra — página ENTERA (<head>+<body>)   → @s8             · caso límite 6
#   D-4 Facebook no se cuela en #contacto                     → @s9             · caso límite 7
#   D-2 reutiliza #contacto-titulo, no rompe anclas F-06      → @s10
#   Frontera F-11 (dirección texto, no mapa)                  → @s12
#   G3a texto visible IG ↔ href consistente                   → @s14
#   G3b sin literal instagram.com en el .tsx (guarda fuente)  → @s15
# =============================================================================================

Feature: La sección de contacto del salón —dirección, teléfono tel: prominente en móvil e Instagram— con todos los enlaces DERIVADOS de la fuente única F-02 (nunca hardcodeados), como vía de contacto accesible que NO depende de WhatsApp
  Como responsable del proyecto quiero que la sección #contacto de la home reúna la dirección, un
  teléfono pulsable con tel: prominente en móvil e Instagram, con todos los enlaces derivados del dato
  único de F-02 —sin hardcodear ninguna URL ni en el href ni en el texto ni en el .tsx—, sin TikTok en
  ninguna parte de la página, sin filtrar el email en ninguna parte de la página y sin que Facebook se
  cuele en la sección, reutilizando el stub #contacto-titulo existente para que exista una alternativa
  de contacto accesible que un usuario pueda usar sin tener WhatsApp instalado; y dejo el botón de
  reserva por WhatsApp para F-13 y el mapa para F-11.

  # ---------------------------------------------------------------------------
  # La derivación PURA `instagramHref` (D-1) — el ÚNICO núcleo mutable de F-12, en src/lib/site.ts.
  # `REDES.instagram` es la ENTRADA (fuente única F-02); los ESPERADOS se escriben A MANO.
  # ---------------------------------------------------------------------------

  @s1
  Scenario: instagramHref deriva del handle canónico la URL pública del perfil — el handle CORRECTO, no el alternativo
    Given el handle de Instagram verificado "@nailslash.studio_" (el que el propio negocio declara en su GBP)
    When se llama a instagramHref con ese handle
    Then el resultado es exactamente "https://www.instagram.com/nailslash.studio_/"
    And el resultado NO es "https://www.instagram.com/nail_lash_studio_/" (el handle NO VERIFICADO del directorio del centro)
    And el resultado antepone el host, quita el "@" inicial y cierra con "/"
    # A1 + caso límite 4. La URL esperada se escribe A MANO; "@nailslash.studio_" entra como ENTRADA
    # (fuente única F-02), NUNCA se re-ejecuta instagramHref en el test ni se importa el resultado.
    # La exactitud mata tres mutantes: no quitar el "@" daría ".../@nailslash.studio_/" (con "@"); no
    # anteponer el host daría "nailslash.studio_/"; no cerrar con "/" daría ".../nailslash.studio_".
    # La segunda aserción BLINDA el handle correcto frente al alternativo `@nail_lash_studio_` [V,
    # datos-google.md §3.5]: la DERIVACIÓN es correcta sea cual sea el handle; el DATO lo confirma el
    # cliente (pendiente), pero el que F-12 usa es el del GBP.

  @s2
  Scenario Outline: instagramHref falla cerrada ante un handle vacío o inválido — no emite una URL a medias que parezca válida
    Given el caso de entrada "<caso>", que el step DECODIFICA a la cadena literal exacta descrita en "significado"
    When se llama a instagramHref con esa cadena literal
    Then instagramHref lanza un error
    And no devuelve ninguna URL a medias del tipo "https://www.instagram.com//"

    Examples:
      | caso               | significado                                                                                   |
      | cadena_vacia       | la cadena vacía: CERO caracteres (NO las dos comillas «""», sino ''), el borde exacto del "//" |
      | solo_arroba        | un ÚNICO carácter, el "@": el cuerpo del usuario queda vacío                                   |
      | arroba_con_espacio | los caracteres @ n a i l s [espacio] l a s h : el usuario lleva un espacio, no es plausible    |
    # Caso límite 5 + REPARACIÓN G4. La columna `<caso>` es un MARCADOR sin comillas ni celdas vacías; el
    # step lo decodifica SIN AMBIGÜEDAD a la cadena literal: `cadena_vacia` → '' (la cadena VACÍA, cero
    # caracteres, NO la de dos comillas), `solo_arroba` → '@', `arroba_con_espacio` → '@nails lash'. Así
    # el borde "//" (perfil raíz) SÍ se ejercita de verdad. Falla cerrada, hermana de `numeroNacional`
    # de F-02 (@s11): ante basura LANZA en vez de emitir "https://www.instagram.com//" (un enlace roto
    # que parece válido). El `'@'` solo (cuerpo vacío) es el borde exacto que separa «hay usuario» de «no
    # lo hay». La ruta normal nunca ve basura (el dato canónico viene de la fuente única verificada).

  @s3
  Scenario: instagramHref ante un handle SIN el "@" inicial — decisión a la puerta (D-1a), recomendado falla cerrada
    Given una entrada "nailslash.studio_" que NO empieza por "@" (el dato canónico de F-02 SIEMPRE trae el "@")
    When se llama a instagramHref con esa entrada
    Then instagramHref lanza un error (comportamiento RECOMENDADO: falla cerrada, coherente con numeroNacional de F-02)
    And no devuelve una URL derivada de un handle que no llegó en su forma canónica
    # 🔴 DECISIÓN A LA PUERTA (D-1a). El borrador deja abierto: «aceptar y derivar igual» O «fallar
    # cerrado». RECOMENDACIÓN DEL LEAD: FALLAR CERRADO. Razón: (1) el dato canónico SIEMPRE trae el "@"
    # (`site.ts:46`), así que la ruta real nunca ve la variante sin "@"; (2) es la misma «falla cerrada»
    # que `numeroNacional` (no emitir a medias lo que no llegó en forma canónica); (3) da a Stryker un
    # predicado mutable (la exigencia del "@" inicial). Si el humano PREFIERE «aceptar y derivar igual»
    # (más robusto), este escenario se REESCRIBE a: instagramHref("nailslash.studio_") →
    # "https://www.instagram.com/nailslash.studio_/". El `tdd_craftsman` NO decide: espera la puerta.

  # ---------------------------------------------------------------------------
  # El artefacto (#contacto) — los href DERIVAN del dato único de F-02. Sobre el HTML CRUDO de dist/.
  # ---------------------------------------------------------------------------

  @s4
  Scenario: los enlaces de #contacto DERIVAN del dato único de F-02 — cambiar el dato cambia el href, ninguna URL hardcodeada
    Given el HTML CRUDO prerenderizado de la ruta "/" con la sección "#contacto" enriquecida por F-12
    When se inspeccionan los href de sus enlaces sin ejecutar JavaScript
    Then el enlace de Instagram tiene href exactamente "https://www.instagram.com/nailslash.studio_/", que es instagramHref aplicado al handle único REDES.instagram
    And el enlace de teléfono tiene href exactamente "tel:+34625223366", que es telHref aplicado al teléfono único TELEFONO.legible
    And ningún componente hornea esas URL como literal: ambos href se DERIVAN de la fuente única, de modo que cambiar REDES.instagram o TELEFONO.legible en site.ts cambia el href en el artefacto
    # A1 + caso límite 1. El invariante anti-hardcode heredado de F-02: el `href` no puede divergir del
    # dato único. Espejo del @s8 de F-02 (texto, telHref y waHref comparten el mismo número): aquí el
    # `href` de Instagram DERIVA del handle guardado y el `tel:` del teléfono guardado. Las dos URL se
    # escriben A MANO en el test y se comparan CONTRA ESE LITERAL A MANO, NUNCA contra una reejecución de
    # `instagramHref(REDES.instagram)` ni `telHref(TELEFONO.legible)` ni contra nada importado de
    # `site.ts` (anti-tautología: reejecutar la producción como «esperado» ocultaría el mutante). Un
    # componente que hornease la URL literal —o el handle alternativo— rompería la igualdad. Se asevera
    # sobre los BYTES de `dist/`, NUNCA jsdom. La otra mitad anti-hardcode (que la igualdad de bytes NO
    # obliga a derivar: un literal horneado da los mismos bytes) la cierran @s14 (texto↔href) y @s15
    # (sin literal en el .tsx).

  @s5
  Scenario: el teléfono de #contacto es un tel: en E.164 y pulsable, con el texto legible visible
    Given el HTML CRUDO prerenderizado de la ruta "/" con el teléfono en la sección "#contacto"
    When se inspecciona su enlace de teléfono sin ejecutar JavaScript
    Then el href es exactamente "tel:+34625223366" (E.164, ya normalizado por telHref de F-02)
    And el texto visible del enlace es exactamente "625 22 33 66"
    And es un enlace tel: pulsable (un usuario sin WhatsApp puede llamar): esta es la alternativa de contacto accesible que exige el acceptance
    # A3 + caso límite 2. F-12 NO reimplementa la normalización: reutiliza `telHref` de F-02 (que ya
    # falla cerrado ante un teléfono no español, @s11 de F-02). El literal "tel:+34625223366" y el texto
    # "625 22 33 66" se escriben A MANO. Este `tel:` es la ALTERNATIVA ACCESIBLE independiente del canal:
    # existe y es usable sin tener WhatsApp instalado. 🔴 NOTA NORMATIVA (ronda de reparación): la cita
    # «RD 193/2023 art. 14.1» que v1 daba por buena NO está verificada literal en su fuente oficial; se
    # trata como la atribución a WCAG SC 2.5.8 (@s6) —NO se cita como PUERTA sin verificar el texto— y se
    # confirma antes de trasladarla a project-spec.md. El PRINCIPIO (una vía de contacto que no dependa
    # de un canal propietario) SÍ motiva la feature. El botón de WhatsApp al que «acompaña» es F-13
    # (@s11); F-12 garantiza que la alternativa EXISTE y es prominente (@s6).

  # ---------------------------------------------------------------------------
  # La PROMINENCIA en móvil y el «SIN peso» de Facebook — CSS, NO-MUTABLE (Stryker no ve SCSS).
  # ---------------------------------------------------------------------------

  @s6
  Scenario: la prominencia del tel: en móvil y el «sin peso visual» de Facebook son CSS — declarados NO-MUTABLES, sin umbral de WCAG
    Given el SCSS module de la sección de contacto
    When un test lee sus reglas (bytes del .module.scss)
    Then existe una regla CSS (p. ej. una @media para móvil) que da tratamiento al enlace tel: en pantallas pequeñas, LEÍDA del SCSS
    And se DECLARA que leer esa regla es solo un PROXY de que el tratamiento móvil EXISTE, NO una prueba de PROMINENCIA (que el objetivo sea grande y cómodo de pulsar): el byte del SCSS no mide eso
    And la PROMINENCIA real se acredita SOLO con verificación VISUAL + la puerta humana, no con la lectura del SCSS ni con cobertura de mutación fingida
    And ese tratamiento NO atribuye a WCAG SC 2.5.8 ningún umbral numérico de tamaño de objetivo: la prominencia es CRITERIO DE PROYECTO verificado a ojo, no una puerta normativa
    And el «sin peso visual» de Facebook (que vive en el pie de F-06, no en #contacto) es igualmente CSS y NO-MUTABLE
    # D-4 + D-5 + MENOR de la reparación. La lógica mutable de F-12 es `instagramHref` (@s13); la
    # «prominencia en móvil» del `tel:` y el «sin peso» de Facebook son CSS → NO-MUTABLE, como F-08
    # declara sus rejillas y F-07 su tipografía (@s17). 🔴 REPARACIÓN: se explicita que leer la `@media`
    # del SCSS PRUEBA que la regla existe pero NO que el resultado sea prominente; la defensa real de la
    # prominencia es la verificación visual + la puerta. 🔴 PROHIBIDO atribuir a SC 2.5.8 (Target Size
    # Minimum, AA en 2.2) un umbral como PUERTA: existe y podría querer aplicarse, pero NO se cita sin
    # decisión explícita del humano (D-5, pregunta abierta que va a la puerta). Este escenario NO fija
    # ningún número.

  # ---------------------------------------------------------------------------
  # Aserciones NEGATIVAS de PÁGINA ENTERA — TikTok y el email NO deben aparecer en NINGUNA parte del
  # artefacto (su vector natural, el JSON-LD del <head>, cae fuera de #contacto). Sobre el HTML CRUDO.
  # ---------------------------------------------------------------------------

  @s7
  Scenario: NINGUNA parte del artefacto de la ruta "/" contiene una referencia a TikTok — página ENTERA, no solo #contacto (A4)
    Given el HTML CRUDO prerenderizado de la ruta "/" COMPLETO: <head> + <body>
    When se inspecciona TODO el documento sin ejecutar JavaScript (búsqueda insensible a mayúsculas)
    Then el documento SÍ contiene la marca "Nails Lash Studio" (ANCLA POSITIVA: prueba de que el fichero se leyó y NO está vacío — sin esto la negativa pasaría verde por VACUIDAD)
    And en TODO el documento no aparece "tiktok" ni una sola vez: ni "tiktok.com", ni un href de TikTok, ni el texto visible "TikTok"
    # A4 + caso límite 3 + REPARACIÓN G2. El acceptance dice «No aparece TikTok» = artefacto ENTERO, no
    # solo #contacto: un `tiktok.com` reintroducido en el JSON-LD del <head> (el sitio natural de las
    # redes; `construirJsonLd` hoy no las emite pero es donde vivirían) pasaría verde si solo mirásemos
    # #contacto. Por eso se asevera sobre el documento COMPLETO. TikTok NO existe (no verificado; F-02 no
    # lo guarda, @s2 de F-02): el estado base es 0 ocurrencias y ESTE escenario lo BLINDA. CONTRASTE con
    # @s9 (Facebook), que SÍ se acota a #contacto porque FB DEBE existir en el pie.

  @s8
  Scenario: NINGUNA parte del artefacto de la ruta "/" filtra el email ni un mailto: — página ENTERA, incluido el <head> (D-3)
    Given el HTML CRUDO prerenderizado de la ruta "/" COMPLETO: <head> + <body>
    When se inspecciona TODO el documento sin ejecutar JavaScript
    Then el documento SÍ contiene la marca "Nails Lash Studio" (ANCLA POSITIVA: prueba de que el fichero se leyó y NO está vacío — sin esto las negativas pasarían verde por VACUIDAD)
    And en TODO el documento no aparece "centroesteticarozas@gmail.com" (el email del JSON-LD de la web actual, nunca visible, sin verificar)
    And en TODO el documento no aparece ningún "mailto:"
    # Caso límite 6 + D-3 + REPARACIÓN G1. El vector REAL del email es el JSON-LD del <head>:
    # `construirJsonLd` hoy lo OMITE deliberadamente («email → A-11 ABIERTA: no se emite», seo.ts:181),
    # pero es su sitio natural, y un email reintroducido ahí NO lo vería una aserción acotada a
    # #contacto. Por eso se asevera sobre el documento COMPLETO (<head>+<body>). El email está
    # `bloqueada_para_publicar` (feature_list.json §12) y sin confirmar (datos-google.md §4.3); su hogar
    # como campo legal es F-16. NO se da por bueno sin el cliente (regla dura), ni se cablea como
    # placeholder a F-01 (D-3). Esta aserción NEGATIVA protege contra publicar un email no verificado.

  # ---------------------------------------------------------------------------
  # Aserciones NEGATIVAS ACOTADAS a #contacto — con ANCLA POSITIVA en el MISMO scope (anti-vacuidad B1).
  # ---------------------------------------------------------------------------

  @s9
  Scenario: Facebook NO se cuela en la sección #contacto — sigue siendo exclusivo del pie de F-06 (D-4), y la sección NO está vacía (B1)
    Given el HTML CRUDO prerenderizado de la ruta "/", con Facebook emitido por el pie (F-06, Pie.tsx) y con la sección "#contacto"
    When se EXTRAE la sección "#contacto" del HTML crudo (sin ejecutar JavaScript) y se inspecciona SOLO ese fragmento
    Then la sección "#contacto" extraída SÍ contiene su <h2 id="contacto-titulo">Contacto y el href "tel:+34625223366" (ANCLA POSITIVA: prueba de que la extracción NO devolvió "" — sin esto la negativa pasaría verde por VACUIDAD)
    And en esa MISMA sección extraída NO aparece el enlace de Facebook "https://www.facebook.com/nailslashstudiorozas/"
    And el enlace de Facebook sigue existiendo SOLO en el pie de la página (F-06 no se toca ni se duplica)
    # Caso límite 7 + D-4 + REPARACIÓN B1. Instagram es la red DESTACADA del contacto; Facebook, el
    # enlace DISCRETO del pie (sin peso, @s6). F-12 NO duplica Facebook en #contacto. 🔴 B1: la negativa
    # se acota a la sección EXTRAÍDA; si la extracción devolviera "" (sección no encontrada, mutación de
    # render), «no contiene Facebook» pasaría por VACUIDAD. El ANCLA POSITIVA (el <h2 Contacto y el
    # `tel:` en el MISMO fragmento) prueba que la extracción NO está vacía: sin ella la negativa no
    # distingue «limpia» de «no miré nada». Doctrina del repo: `puerta-anclas.ts`, «NUNCA verde por
    # vacuidad». Blinda además el deslinde con F-06 (que emite Facebook en Pie.tsx [V: Pie.tsx:22]).

  # ---------------------------------------------------------------------------
  # Deslindes / fronteras — reutilización del stub y las fronteras con F-13 y F-11.
  # ---------------------------------------------------------------------------

  @s10
  Scenario: F-12 enriquece el stub #contacto-titulo existente y NO crea una sección de contacto nueva — no rompe la puerta de anclas de F-06
    Given el HTML CRUDO prerenderizado de la ruta "/" con la sección de contacto que F-04 dejó como <section aria-labelledby="contacto-titulo"> y F-12 enriquece
    When la puerta de anclas vivas de F-06 y la de cascarón de F-04 inspeccionan esa página
    Then hay exactamente una sección de contacto, cuyo id de anclaje es "contacto-titulo" (F-12 no añade una segunda sección ni un id de contacto nuevo)
    And la dirección de esa sección sigue siendo TEXTO derivado de DIRECCION (fuente única F-02), no una cadena hardcodeada
    And la nav sigue enlazando "#contacto-titulo" a un id presente: la igualdad de conjuntos de F-06 se mantiene y el build con las puertas sigue en código de salida 0
    # D-2. El stub `#contacto-titulo` ya está cableado en la igualdad de conjuntos de la nav (F-06) y en
    # los landmarks (F-04) [V: home.tsx:79-86]. Enriquecerlo mantiene UN único destino de ancla. Crear
    # una sección de contacto NUEVA generaría anclas huérfanas/duplicadas y rompería la puerta de anclas
    # vivas de F-06 (que exige que cada `#id` de la nav resuelva y que cada sección navegable esté
    # enlazada). Este escenario DESLINDA: F-12 amplía el contenido, no la estructura de anclas.

  @s11
  Scenario: F-12 entrega la alternativa accesible pero NO construye el botón/flujo de reserva por WhatsApp — es F-13 (frontera central), y la sección NO está vacía (B1)
    Given el HTML CRUDO prerenderizado de la ruta "/" con la sección "#contacto" enriquecida por F-12
    When se EXTRAE la sección "#contacto" del HTML crudo (sin ejecutar JavaScript) y se inspecciona SOLO ese fragmento
    Then la sección "#contacto" extraída SÍ contiene la alternativa accesible: el href "tel:+34625223366" (@s5), la dirección y el enlace de Instagram (ANCLA POSITIVA: prueba de que la extracción NO devolvió "" — sin esto la negativa pasaría verde por VACUIDAD)
    And en esa MISMA sección extraída NO aparece un botón ni un flujo de reserva por WhatsApp: ni "wa.me", ni "api.whatsapp.com", ni un enlace derivado de waHref
    # 🔴 LA FRONTERA CENTRAL con F-13 (XL, aplazado) + REPARACIÓN B1. El acceptance dice «junto al botón
    # de WhatsApp hay una alternativa accesible (teléfono)», pero EL BOTÓN/FLUJO ES F-13, no F-12.
    # Decisión de alcance para la DEMO: F-12 construye la alternativa accesible (el `tel:` real, la
    # dirección, las redes) como entregable AUTÓNOMO y NO construye el botón de WhatsApp. La ADYACENCIA
    # física «junto al botón» (A2) la cierra F-13 al colocar su botón en/junto a esta sección con la
    # alternativa ya al lado. 🔴 B1: la negativa se acota a la sección EXTRAÍDA; el ANCLA POSITIVA (el
    # `tel:`, la dirección y el enlace de IG en el MISMO fragmento) prueba que la extracción NO está
    # vacía, así que «no hay wa.me / api.whatsapp.com» no pasa verde por vacuidad. NUNCA hornear waHref
    # aquí. NOTA sobre la cita RD 193/2023 art. 14.1: NO verificada, ver @s5.

  @s12
  Scenario: F-12 muestra la dirección como TEXTO y NO construye el mapa ni «Cómo llegar» ni «Planta 0, Local 41» — es F-11
    Given el HTML CRUDO prerenderizado de la ruta "/" con la dirección en la sección "#contacto"
    When se EXTRAE la sección "#contacto" del HTML crudo (sin ejecutar JavaScript) y se inspecciona SOLO ese fragmento
    Then la sección "#contacto" extraída SÍ contiene la dirección como texto legible derivado de DIRECCION (fuente única F-02) — p. ej. "Av. de Atenas 75" (ANCLA POSITIVA: prueba de que la extracción NO devolvió "")
    And en esa MISMA sección extraída NO se incrusta un mapa estático ni un iframe de mapa
    And en esa MISMA sección extraída NO aparece el enlace «Cómo llegar» ni la mención «Planta 0, Local 41» (esos son F-11)
    # Frontera con F-11 `mapa_como_llegar` + B1. La dirección postal es el dato de contacto de F-12; el
    # mapa estático autohospedado, el enlace «Cómo llegar» (Maps en pestaña nueva) y la mención «Planta
    # 0, Local 41» pertenecen a F-11. Este DESLINDE impide que F-12 invada F-11 «mejorando» la dirección
    # con un mapa. El ANCLA POSITIVA es la propia dirección como texto (ya presente en el stub [V:
    # home.tsx:81-84]): prueba que la extracción no está vacía antes de negar el mapa.

  # ---------------------------------------------------------------------------
  # Los mutantes que deben morir (I-6, umbral 1.0) — SOLO la derivación instagramHref es mutable.
  # El conjunto exacto se MIDE cuando el fichero exista, no antes.
  # ---------------------------------------------------------------------------

  @s13
  Scenario Outline: mutar la derivación de instagramHref rompe al menos un test
    Given la implementación de instagramHref en src/lib/site.ts
    When se aplica la mutación "<mutación>"
    Then al menos un test pasa de verde a rojo

    Examples:
      | mutación                                                                                 | dónde muere                                                                          |
      | vaciar el host (StringLiteral 'https://www.instagram.com/' → '')                          | @s1 (el resultado deja de empezar por el host → ≠ URL esperada)                      |
      | quitar la barra final (StringLiteral '/' → '' al cerrar la URL)                           | @s1 (".../nailslash.studio_" sin "/" final ≠ URL esperada)                            |
      | no quitar el "@" inicial (alterar el slice del handle: slice(1) → slice(0))               | @s1 (".../@nailslash.studio_/" con "@" ≠ URL esperada)                                |
      | negar o forzar la guarda de validez del handle (BooleanLiteral / condicional)            | @s2 (una entrada vacía/inválida dejaría de lanzar y emitiría una URL a medias)        |
      | debilitar el ancla o la clase de caracteres de la validación (Regex: quitar ^/$, negar clase) | @s2/@s3 (un handle sin "@" o con espacio pasaría la validación y no lanzaría)     |

    # 🔴 EL CONJUNTO EXACTO NO SE PUEDE PREDECIR: el `instagramHref` de F-12 NO EXISTE todavía; otra
    # implementación tendrá otro conjunto. SE MIDE CUANDO EXISTA, NO ANTES (la lección de F-05 con
    # «exactamente dos equivalentes» sería una PREDICCIÓN, no una medición). Los sabotajes de esta tabla
    # mapean a mutadores REALES de Stryker 9.6.1 (StringLiteral, BooleanLiteral, EqualityOperator sobre
    # el slice, y Regex vía weapon-regex nivel 1: quitar `^`/`$`, negación de clase de caracteres). El
    # conjunto COMPLETO se nombra al medir. PROHIBIDO nombrar mutadores FANTASMA (ni `.includes` ni
    # `lastIndexOf→indexOf` existen en Stryker 9.6.1 [V]). Si un mutante RESISTE, el `tdd_craftsman`
    # ESCALA AL HUMANO —NO lo excluye, NO baja el umbral, NO lo declara equivalente por su cuenta—
    # (umbral 1.0, 0 exclusiones desde F-03; patrón «escalada: ampliar y refactorizar»). Cubre el
    # acceptance «los href derivan del dato único, no están hardcodeados» por la vía de la derivación.
    # 🔴 SOLO `instagramHref` es mutable: el SCSS (@s6) NO lo ve Stryker; los atributos/estructura del
    # render (@s4, @s5, @s7..@s12, @s14) y la ausencia de un literal en el `.tsx` (@s15) son
    # LITERALES/aserciones sobre `dist/` o sobre los BYTES de la fuente que NO generan mutantes → los
    # aseveran los tests, no Stryker. `instagramHref` YA está en `coverage.include` (site.ts vía
    # `src/lib/**/*.ts`) y en `mutate` de Stryker (site.ts ya se mutaba en F-02) [V]: NO hay que tocar
    # esas listas; sí RE-VERIFICARLO en el primer `pnpm build`/mutate real de F-12 (I-8). La cita legal
    # RD 193/2023 art. 14.1 NO se da por verificada (ver @s5); no es objeto de mutación.

  # ---------------------------------------------------------------------------
  # REFUERZOS ANTI-HARDCODE de la RONDA DE REPARACIÓN (G3) — el eslabón que ni la igualdad de bytes del
  # artefacto ni la mutación muerden: un href/host DERIVADO y uno HORNEADO producen el MISMO dist/.
  # ---------------------------------------------------------------------------

  @s14
  Scenario: el texto visible del enlace de Instagram es el handle y es CONSISTENTE con su href — ni el texto ni el href se hardcodean por separado
    Given el HTML CRUDO prerenderizado de la ruta "/" con el enlace de Instagram en la sección "#contacto"
    When se inspecciona ese enlace sin ejecutar JavaScript
    Then el texto visible del enlace es exactamente "@nailslash.studio_" (el handle de REDES.instagram, fuente única F-02)
    And su href es exactamente "https://www.instagram.com/nailslash.studio_/"
    And el texto visible y el href COMPARTEN el cuerpo del handle: ambos contienen la subcadena "nailslash.studio_" (texto ↔ href CONSISTENTES, réplica del @s8 de F-02 donde texto, telHref y waHref comparten el mismo número)
    # G3a. El acceptance A1 exige que los href DERIVEN del dato único; pero un href derivado y uno
    # hardcodeado producen BYTES IDÉNTICOS, así que la igualdad de bytes de @s4 NO obliga a derivar. Este
    # escenario ata el TEXTO VISIBLE (el handle) al HREF por su cuerpo común "nailslash.studio_": si
    # alguien hardcodeara el texto o el href con el handle ALTERNATIVO `@nail_lash_studio_`, o hiciera
    # divergir texto y href, la consistencia se rompe. Los literales "@nailslash.studio_" y la URL se
    # escriben A MANO en el test; NUNCA se re-ejecuta instagramHref ni se importa REDES.instagram como
    # esperado (anti-tautología). El texto visible se FIJA aquí (v1 lo dejaba sin especificar). @s15
    # CIERRA la otra mitad: que el host no viva hardcodeado en el `.tsx`.

  @s15
  Scenario: NINGÚN literal de "instagram.com" vive en el componente .tsx — el único host está en instagramHref de site.ts (guarda a nivel de FUENTE)
    Given los bytes del fichero .tsx que emite la sección de contacto (src/pages/home.tsx, o el componente que F-12 extraiga), leídos como texto igual que el repo lee el .module.scss
    When se busca en esos bytes la subcadena "instagram.com"
    Then el .tsx NO contiene la subcadena "instagram.com" ni una sola vez: el componente NO hornea el host de Instagram
    And el literal del host "https://www.instagram.com/" SÍ aparece en src/lib/site.ts, DENTRO de instagramHref: el host vive en la derivación, no en el render
    # G3b. Cierra el agujero de A1 que ni la igualdad de bytes del artefacto (@s4) ni la mutación (@s13)
    # muerden: un host horneado en el `.tsx` y uno derivado producen el mismo `dist/`. Esta guarda LEE LA
    # FUENTE (los bytes del `.tsx`), como F-06/F-07 leen el `.module.scss` para lo no-mutable, y falla si
    # reaparece un `href="https://www.instagram.com/..."` literal en el componente. Es no-mutable
    # (Stryker no muta la ausencia de un literal en un fichero de texto): la aseveran los tests, no
    # Stryker. El comentario de `Pie.tsx:13-15` ya declara que hornear la URL «sería HARDCODEARLA»; esta
    # guarda lo CONVIERTE EN TEST. El host SOLO puede vivir en instagramHref (@s1); si migra al render,
    # esta guarda muerde. Dos comprobaciones de bytes concretas: el `.tsx` en 0, `site.ts` en ≥1.

  # ---------------------------------------------------------------------------
  # DECISIONES QUE VAN A LA PUERTA (lote 2026-07-18) — el lead PROPONE, el humano DECIDE
  # ---------------------------------------------------------------------------
  # 1. `instagramHref` en site.ts (D-1). ¿Se añade la derivación pura del handle a URL en el módulo de
  #    F-02 (done)?  → RECOMENDADO: SÍ. Es la forma anti-hardcode que el propio `Pie.tsx` anticipa, da a
  #    F-12 su núcleo mutable y NO altera el comportamiento existente de F-02. Alternativa (handle como
  #    texto sin enlace) deja F-12 sin lógica y con IG no clicable. → @s1, @s2, @s3, @s4, @s13, @s14, @s15.
  #
  # 1a. Handle SIN "@" (D-1a). ¿instagramHref("nailslash.studio_") falla cerrada o deriva igual?
  #    → RECOMENDADO: FALLA CERRADA (coherente con `numeroNacional` de F-02; el dato canónico siempre
  #    trae "@"; da a Stryker un predicado mutable). Si el humano prefiere «aceptar y derivar igual»,
  #    se reescribe @s3. → @s3.
  #
  # 2. Email en la DEMO (D-3). ¿Se OMITE hasta confirmar, o se muestra como placeholder bloqueado por
  #    F-01?  → RECOMENDADO: OMITIR. No es visible ni verificado; el contacto accesible ya está cubierto;
  #    su hogar como campo legal es F-16. Cablearlo a F-01 añade superficie por un dato fantasma. NO se
  #    da por bueno sin el cliente. La ausencia se BLINDA en la página ENTERA (@s8). → @s8.
  #
  # 3. Reutilizar el stub `#contacto-titulo` (D-2). ¿F-12 enriquece la sección existente en home.tsx?
  #    → RECOMENDADO: SÍ. Un único destino de ancla; respeta las puertas de F-04 y F-06. Crear otra
  #    sección rompería la igualdad de conjuntos de la nav. → @s10.
  #
  # 4. Frontera con F-13 (alcance central). ¿F-12 entrega SOLO la alternativa accesible (tel: +
  #    dirección + redes) y NO el botón de WhatsApp?  → RECOMENDADO: SÍ. El botón/flujo es F-13 (XL,
  #    aplazado). F-12 deja la alternativa lista para que F-13 coloque su botón al lado; la adyacencia
  #    física la cierra F-13. → @s5, @s11.
  #
  # 5. `@nailslash.studio_` como handle de la DEMO. ¿Se acepta el handle del GBP a la espera de
  #    confirmación del cliente?  → RECOMENDADO: SÍ para la DEMO, marcado `bloqueada_para_publicar` /
  #    pendiente de confirmación. La derivación es correcta con cualquier handle; el DATO lo confirma el
  #    cliente. El texto visible del enlace queda fijado como el propio handle (@s14). → @s1, @s14.
  #
  # PREGUNTAS ABIERTAS QUE ACOMPAÑAN A LA PUERTA (no bloquean la aprobación de los escenarios):
  #  · [norma] Tamaño de objetivo táctil del `tel:` (SC 2.5.8, AA en 2.2). ¿Se adopta como criterio
  #    explícito y testeable, o se deja como CSS verificado a ojo?  → RECOMENDADO: dejarlo como CSS
  #    verificado a ojo, SIN atribuir umbral a WCAG (D-5). Si el humano lo adopta, abre un criterio de
  #    aceptación nuevo y un escenario junto a @s6.
  #  · [norma] Cita legal de la alternativa accesible («RD 193/2023 art. 14.1»). NO verificada literal en
  #    su fuente oficial; se confirma antes de trasladarla a project-spec.md. La feature NO depende de la
  #    cita, solo del PRINCIPIO. → @s5, @s11, @s13.
  #  · [dato del cliente] Email de contacto y handle de Instagram: pendientes de confirmación; la DEMO
  #    procede con lo recomendado y NO publica ninguno de los dos sin el cliente.
