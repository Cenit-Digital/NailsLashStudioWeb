# Destilación Gherkin de F-06 `header_nav_footer` — mapa y decisiones (gherkin_author, 2026-07-17)

> **Estado: `spec_ready`, ✅ APROBADO POR LA PUERTA HUMANA EL 2026-07-17.** B-1..B-7 cerradas por el
> humano (todas como proponía el lead); el `tdd_craftsman` puede implementar los 20 escenarios. El
> contrato vive en `features/header_nav_footer.feature`; esto es el mapa `acceptance → @s` y las
> decisiones de destilación. **Fuente de los hechos:** `progress/f06_verificacion_previa.md` (MANDA
> sobre el troceado). Destilado de `project-spec.md` §«Feature 6».

> **AMPLIADO EL 2026-07-18 → 27 escenarios, @s1..@s27** (tras la escalada de mutación). Los 20 de abajo
> quedan INTACTOS; @s21..@s27 + 7 filas en @s18 se detallan en §«Ampliación del contrato» al final.

## 20 escenarios, @s1..@s20  (18 originales + @s19/@s20 añadidos en la ronda de reparación)

> **Numeración:** @s19 y @s20 se DEFINEN físicamente junto a sus hermanos (@s19 tras @s7; @s20 tras
> @s3) pero conservan los números 19/20 para NO renumerar @s4..@s18, que la revisión adversarial ya
> cita por su tag. Tags monótonos como identificadores; el orden físico agrupa por tema.

| @s | Comportamiento | Grupo |
| --- | --- | --- |
| @s1 | ancla `#id` a id ausente → violación (ancla muerta); 4 filas incl. `#facial`, `#servicios`/`#contacto` vs id-de-`<h2>` | puerta de anclas (decisor puro) |
| @s2 | nav con todas las anclas resueltas → 0 violaciones (camino feliz = home.tsx hoy) | ídem |
| @s3 | sección navegable (`<section aria-labelledby>`→heading real) con id que la nav no enlaza → violación (inalcanzable) | ídem (otra mitad igualdad de conjuntos) |
| @s20 | heading con id que NINGUNA `<section>` referencia → NO navegable → 0 violaciones (DISTINGUE la regla de @s3) | ídem (hermano de @s3, reparación) |
| @s4 | la puerta de anclas (`#x`) es DISTINTA y COMPLEMENTARIA de la anti-404 (`/x`) | deslinde obligatorio |
| @s5 | informe: una línea por violación, determinista, mismo orden | ídem |
| @s6 | artefacto ausente / 0 páginas → exit ≠ 0 (vacuidad) | humilde / falla cerrada |
| @s7 | 0 anclas inspeccionadas → exit ≠ 0 (vacuidad OBLIGATORIA, patrón @s28 F-04) | ídem |
| @s19 | 0 SECCIONES navegables derivadas → exit ≠ 0 (vacuidad OBLIGATORIA del 2.º extractor, GEMELO de @s7) | ídem (reparación, BLOQUEANTE) |
| @s8 | la puerta revienta → falla cerrada, build roto | ídem |
| @s9 | nav consistente → exit 0 (camino feliz del build) | ídem |
| @s10 | `dev` NO invoca la puerta | ídem |
| @s11 | `scroll-padding-top` suelo ≥ altura máxima RE-MEDIDA, sustituye 5rem; SCSS | Capa 1 (B-2) |
| @s12 | HTML CRUDO de `dist/`: cabecera+marca, nav+aria-label, pie horneados (SSR-safe) | marcado |
| @s13 | el pie NO emite enlaces legales (rompería anti-404) | choque puertas (E1.a) |
| @s14 | `<a>` a Facebook (URL verbatim de site.ts:47) pasa las 3 puertas de enlaces; Instagram ELIDIDO (es handle, no URL) | choque puertas (E1.b) |
| @s15 | estado condicional en atributo consultable (`aria-expanded`), NO className condicional | menú móvil (E1.c) |
| @s16 | HTML CRUDO hornea el menú «cerrado» + enlaces presentes (mata trampa Radix/Portal) | menú móvil (SSR) |
| @s17 | breakpoint = literal `820px`, leído del SCSS, anclado al literal a mano | menú móvil (B-3) |
| @s18 | mutar el predicado/igualdad/vacuidad/breakpoint rompe un test | mutación (I-6) |

## Mapa acceptance de `feature_list.json` §6 → @s  (✅ TRES reescritos y APROBADOS en la puerta, A-23 REDUX)

| Acceptance original | Veredicto verificación | Destilado (decisión aprobada 2026-07-17) → @s |
| --- | --- | --- |
| @1 «cubre TODAS las secciones, no 7 de 11» | **INSATISFACIBLE [V]** (hoy 2 secciones, ids en `<h2>`) | **B-4**: igualdad de conjuntos derivada del DOM + puerta de anclas → **@s1, @s2, @s3** (+@s4, @s5) |
| @2 «scroll-padding-top; scroll-margin NO actúa al tabular» | **FALSO [V]** (scroll al Tab es UA) | **B-2**: razón correcta (va en el CONTENEDOR) → **@s11** (nota) |
| @3 (implícito) «el foco no queda tapado por la cabecera sticky» | puerta_legal roza el AAA | **B-1**: listón AA «not entirely hidden», 0 números a la norma → **@s11** (nota) |
| @4 «se deriva de la altura REAL de la cabecera» | **INSOSTENIBLE bajo SSG [V]** | **B-2 Capa 1**: suelo estático RE-MEDIDO, sustituye 5rem → **@s11** |
| @5 «existe red CSS en el MISMO breakpoint literal que la query JS; mutar breakpoint/predicado rompe un test» | breakpoint 767 herencia muerta | **@s17** (literal 820px anclado al SCSS) + **@s18** (mutantes) |
| `puerta_legal` «WCAG SC 2.4.11 (foco no oscurecido)» | **ROZA EL AAA [V]** | **B-1**: reescrita → nota de **@s11** |

Comportamientos de la spec §Feature 6 «casos límite» → @s: caso 1 (0 secciones/anclas muertas)→@s1/@s6;
caso 2 (`#facial`)→@s1; caso 3 (`#contacto` vs `contacto-titulo`)→@s1; caso 4 (vacuidad)→@s6/@s7/@s8;
caso 5 (sección inalcanzable)→@s3; caso 6 (redes sociales)→@s14; caso 7 (enlaces legales)→@s13;
caso 8 (cabecera tapa el destino)→@s11; caso 9 (menú «cerrado» en SSR)→@s16.

## Decisiones de destilación

1. **La cifra del `scroll-padding` (@s11) es [NV]/RE-MEDIR por el TDD; el breakpoint `820px` (@s17) lo
   FIJÓ el humano (B-3).** El `Then` de @s11 asevera la RELACIÓN (suelo ≥ altura máxima), con el número
   escrito A MANO por el TDD tras RE-MEDIR sobre la nav definitiva; NO se hereda el 5rem ni se copia el
   231 del prototipo. @s17 fija el literal `820px` como criterio de proyecto medido, anclado al SCSS,
   nunca al símbolo.
2. **La regla DOM de «sección navegable» (@s3) — FIJADA POR LA PUERTA HUMANA el 2026-07-17 (B-4). Ya
   NO es [NV].** navegable = `<section>` con `aria-labelledby` que resuelve a un heading real (id de
   anclaje = id del heading), coherente con `REGLA_SECTION` de F-04; el TDD la implementa TAL CUAL, sin
   decisión posterior. @s20 conserva el Example que la DISTINGUE de «navegable = cualquier id».
3. **El menú móvil (@s15/@s16/@s17) — DECIDIDO por la puerta humana el 2026-07-17: CSS puro +
   `aria-expanded` + 820px, SIN Radix (B-5/B-6/B-3).** La mecánica es FIRME; el TDD la implementa tal
   cual. `radix-ui` sale de `dependencies` (lo ejecuta el TDD en `package.json`; el gherkin_author solo
   lo registra como decisión).
4. **No inventé mutadores concretos** (@s18 nombra sabotajes de comportamiento). El conjunto exacto se
   MIDE cuando el fichero exista (A-23, umbral 1.0, 0 exclusiones; si resiste uno, se ESCALA).
5. **Anti-tautología** en todo esperado (ids, 820px, suelo px): a mano, jamás importado de producción.

## Avisos que fueron a la puerta humana (6) — TODOS RESUELTOS el 2026-07-17

1. **A-23 REDUX:** @1/@2/@4 + `puerta_legal` de `feature_list.json` §6 NO se destilaron tal cual
   (insatisfacible/falso/insostenible/roza el AAA). Destilé la propuesta del lead. **RESUELTO: el
   humano APROBÓ la reescritura (B-1/B-2/B-4); `feature_list.json` §6 ya la lleva.**
2. **B-5/B-6/B-3 (menú móvil):** destilé la propuesta CSS puro + `aria-expanded`, sin Radix. **RESUELTO:
   el humano FIJÓ CSS puro + `aria-expanded` + 820px, SIN Radix. La mecánica ya no es negociable.**
3. **B-7 (huérfanos `destacados`/`ofertas`):** 0 features los construyen; la igualdad de conjuntos los
   deja fuera solo. **RESUELTO (B-7): huérfanos — la nav NO los enlaza y quedan ANOTADOS COMO DEUDA,
   sin construirse ni descartarse formalmente por ahora.**
4. **Cifra del `scroll-padding` [NV]:** se RE-MIDE sobre la nav definitiva; el TDD no copia. El
   breakpoint `820px` lo FIJÓ el humano (B-3), ya no es [NV].
5. **Regla DOM de «sección navegable»: FIJADA por la puerta (B-4, 2026-07-17)** — `<section>` con
   `aria-labelledby` → heading real; el TDD la implementa tal cual, ya NO es [NV].
6. **Todo [NV] hasta el primer `pnpm build` real:** se midió contra funciones puras con fixtures, no
   contra un `dist/` real. El primer build manda sobre todo lo escrito. (Caveat técnico VIGENTE tras la
   puerta: no es una decisión pendiente, es verificación contra el artefacto real.)

## Lo que NO entró (por regla)

- El `767` (herencia muerta), números atribuidos a SC 2.4.11, «WCAG obliga a scroll-padding»,
  «scroll-margin no actúa al tabular», «AAA» bajo etiqueta AA, construir secciones (F-07/F-09/etc.),
  tocar la deuda de otras features. Capa 2 (afinado JS) queda OPCIONAL fuera del acceptance (B-2).

## Ronda de reparación (2026-07-17, tras revisión adversarial de 5 lentes)

La revisión (15 agentes, 1,18 M tokens) alegó 10 hallazgos; un verificador independiente confirmó 4
(1 BLOQUEANTE + 3 GRAVES; dos de los 3 GRAVES eran el MISMO defecto de @s14 escrito por dos agentes,
así que **3 defectos distintos**) y descartó 6 como falsos. Verifiqué los 3 distintos contra fuente
primaria y los **3 se sostienen** → 5 ediciones aplicadas, **0 rechazadas**. (En esa ronda B-1..B-7
seguían sin cerrar; el humano las CERRÓ el 2026-07-17 — ver §Puerta humana.)

1. 🔴 **BLOQUEANTE — vacuidad del extractor de SECCIONES sin guarda (@s3+@s7).** La puerta tiene DOS
   extractores (anclas de nav + secciones navegables) y solo el de anclas tenía guarda (@s7). Si el de
   secciones deriva 0, @s3 y @s9 son vacuamente ciertos → exit 0 sin mirar ninguna sección, y la
   mutación SIGUE dando 100% (invisible a la métrica). Confirmado contra `home.tsx:71-77` (dos
   `<section aria-labelledby>` = consulta DOM distinta de las anclas).
   - **Edición 1:** AÑADIDO **@s19**, gemelo de @s7 para el extractor de secciones (secciones
     presentes en el HTML pero 0 derivadas → exit ≠ 0, declara «no se inspeccionó ninguna sección
     navegable», NO declara ausencia de inalcanzables).
   - **Edición 2:** CORREGIDA la fila 3 de **@s18**: la vacuidad «@s6, @s7» se dividió en dos filas
     —vaciar el extractor de ANCLAS → @s7; vaciar el de SECCIONES → @s19— (se quitó @s6, que fira
     antes de extraer y NO caza un extractor mutado a `[]`).

2. **GRAVE — la regla de «sección navegable» de @s3 era [NV] y ningún Example la distinguía.** Los dos
   Examples colapsaban sobre la misma forma del DOM; un mutante «navegable = cualquier id» sobrevivía.
   `REGLA_SECTION` de F-04 (`puerta-cascaron.ts:118`, bucle `:507-519`) ya fija la forma → la regla es
   decidible YA. **Se lleva a la puerta como parte de B-4; NO se cierra.**
   - **Edición 3:** @s3 — Given hecho concreto (`<section aria-labelledby>` que resuelve a un heading
     real; id de anclaje = id del heading) y nota reescrita de «[NV], la FIJA el TDD» a **PROPUESTA
     MEDIDA coherente con `REGLA_SECTION`** (que el humano FIJÓ en la puerta del 2026-07-17).
   - **Edición 4:** AÑADIDO **@s20**, el Example que DISTINGUE la regla (heading con id que ninguna
     `<section>` referencia → NO navegable → 0 violaciones; mata el mutante «cualquier id», nombrado
     ahora en @s18).

3. **GRAVE — @s14, fila Instagram: CITA FABRICADA.** `site.ts:46` guarda un HANDLE
   (`instagram: '@nailslash.studio_'`), no una URL, y no hay `instagramHref`. La URL
   `https://www.instagram.com/nailslash.studio_/` era una construcción rotulada «dato real de la
   fuente única».
   - **Edición 5:** @s14 — eliminada la fila de Instagram (como F-05 en `cero_terceros.feature`),
     dejada SOLO la de Facebook (URL verbatim de `site.ts:47`), convertido de Scenario Outline a
     Scenario, y nota que explica la elisión (emitir Instagram es alcance de F-02/F-12, previo
     `instagramHref`).

**Los 6 hallazgos descartados NO se tocaron.** Al cierre de esa ronda el contrato seguía sin aprobar;
la regla de «sección navegable» (defecto 2) fue a la puerta humana como propuesta dentro de B-4, y el
humano la FIJÓ el 2026-07-17 (ver §Puerta humana).

## Puerta humana (2026-07-17)

**LA PUERTA SE ABRIÓ Y SE CERRÓ el 2026-07-17.** El humano decidió las SIETE preguntas B-1..B-7,
**todas como proponía el lead**. El `gherkin_author` NO cerró las preguntas: las cerró el humano; aquí
solo se registra el hecho y se retiran las marcas `⏸` del contrato. `feature_list.json` §6 ya lleva las
7 decisiones aplicadas por el lead (acceptance reescritos, `puerta_legal` corregida, campo
`puerta_humana`) y el contrato NO las contradice.

### Las 7 decisiones, literales

- **B-1 → APROBADA.** `puerta_legal` reescrita a **SC 2.4.11 AA «not entirely hidden»** (no «foco no
  oscurecido», que roza el 2.4.12 AAA). C43 técnica SUFICIENTE del proyecto. CERO números atribuidos a
  WCAG.
- **B-2 → APROBADA.** @s11 en DOS CAPAS: (1) suelo CSS estático RE-MEDIDO ≥ altura máxima; (2) afinado
  JS OPCIONAL, fuera del acceptance. La razón de `scroll-padding` (no `scroll-margin`) es que va en el
  CONTENEDOR; «scroll-margin no actúa al tabular» era FALSO.
- **B-3 → APROBADA.** Breakpoint **`820px`** [criterio de proyecto MEDIDO], NUNCA el 767.
- **B-4 → APROBADA.** @s1 como IGUALDAD DE CONJUNTOS + la PUERTA DE ANCLAS VIVAS. «Sección navegable» =
  `<section>` con `aria-labelledby` que resuelve a un heading real (reutiliza `REGLA_SECTION` de F-04).
  **Esa regla YA NO es [NV]: el humano la fijó** (@s3/@s20 conservan el Example que la distingue).
- **B-5 → APROBADA.** Menú móvil SÍ, mecánica CSS puro (`@media`) + `aria-expanded`, sin rama de
  viewport en JS. La nav viaja horneada; el menú hornea «cerrado».
- **B-6 → APROBADA. NO Radix.** `radix-ui` sale de `dependencies` (0 usos en `src/`). **Lo ejecuta el
  `tdd_craftsman` en `package.json`** (Ley 1: el gherkin_author no toca `package.json`); aquí solo
  queda REGISTRADO como decisión.
- **B-7 → APROBADA.** `destacados`/`ofertas` son HUÉRFANOS: la nav no los enlaza (igualdad de
  conjuntos) y quedan ANOTADOS COMO DEUDA, sin construirse ni descartarse formalmente.

### Qué se editó en el contrato (retirada de las marcas ⏸)

**6 marcas `⏸` retiradas**, **0 escenarios de comportamiento tocados** (los 20 Given/When/Then y sus
Examples quedan idénticos; solo cambiaron cabecera, comentarios y marcas):

1. **Cabecera:** el bloque `⏸⏸ ESTE CONTRATO NO ESTÁ APROBADO` → bloque `✅ APROBADO POR LA PUERTA
   HUMANA EL 2026-07-17` con las 7 decisiones literales y la liberación del `tdd_craftsman`.
2. **@s3 (nota de la regla «sección navegable»):** `⏸ PROPUESTA MEDIDA, PENDIENTE DE PUERTA` → `✅
   FIJADA POR LA PUERTA HUMANA`; ya no es `[NV]` para el TDD. Se CONSERVA @s20 (el Example que la
   distingue).
3. **@s20 (nota):** `⏸ PENDIENTE DE PUERTA` → `✅ FIJADO POR LA PUERTA HUMANA`.
4. **@s15 (nota):** `⏸ PROPUESTA` → `✅ DECIDIDO`: CSS puro + `aria-expanded`, sin Radix, firme.
5. **@s16 (nota):** `⏸ PROPUESTA` → `✅ DECIDIDO`: hay menú móvil con botón; aplica entero. Radix
   descartado; la guarda del prerender persiste.
6. **@s17 (nota):** `⏸ PROPUESTA` → `✅ DECIDIDO`: breakpoint literal `820px`, nunca el 767.

Además se reescribió toda la prosa de cabecera que decía «pendiente de puerta / propuesta del lead / el
humano puede cambiar» sobre algo ya decidido, y la tabla de trazabilidad (§Mapa acceptance) marca los
tres criterios reescritos como APROBADOS. **NO se reintrodujo** ninguna atribución normativa falsa
(nada de números en SC 2.4.11, nada de «AAA» bajo AA, nada del 767).

### Lo que NO cambió y sigue vigente tras la puerta

- Los caveats `[NV] hasta el primer `pnpm build` real` (I-8) y `RE-MEDIR el número del scroll-padding`
  sobre la nav definitiva: NO son decisiones pendientes, son verificación contra el artefacto real. El
  primer build de F-06 manda sobre todo lo escrito.
- Las cláusulas de escalada («si el artefacto sale con 0 anclas/0 secciones, la guarda nace en ROJO y
  se VUELVE a la puerta humana, no se le baja el listón»): contingencias futuras legítimas, no las 7
  preguntas.

**El `tdd_craftsman` queda liberado: puede implementar los 20 escenarios por Rojo-Verde-Refactor.**

## Ampliación del contrato — APROBADA POR LA PUERTA HUMANA el 2026-07-18 (los 21 supervivientes)

**Total tras la ampliación: 27 escenarios, @s1..@s27** (20 previos INTACTOS + @s21..@s27 nuevos) **+ 7
filas nuevas en @s18** (el mapa de mutantes). El humano APROBÓ el 2026-07-18 AMPLIAR el contrato tras la
escalada de la prueba de mutación (`progress/mutation_header_nav_footer.md`: 135/156 = 86,54 %, 21
supervivientes REALES verificados por SABOTAJE MANUAL). Precedente EXACTO: **F-01** (la fila `600 123 456`
de @s5) y **F-05** (+3 escenarios) — *la mutación no encontró código de más, encontró CONTRATO DE MENOS*.
Las guardas defensivas y las extracciones son CORRECTAS y SE QUEDAN; faltaban los escenarios que las
EXIJAN. **La producción NO se tocó.**

### Mapa: los 6 grupos + 1 del informe → escenario nuevo → mutantes que mata

| Grupo (informe §3/§4) | Escenario nuevo | Mutantes de `puerta-anclas.ts` (o `.tsx`) que mata |
| --- | --- | --- |
| A — `<a>` de nav SIN href | **@s21** (Scenario) | `:51:20` OptionalChaining · `:53:11` ConditionalExpression |
| B — `id=""` no es destino | **@s22** (Scenario) | `:71:5` MethodExpression · `:71:83` ConditionalExpression · `:71:90` StringLiteral |
| C — `<section>` cuyo aria-labelledby no resuelve | **@s23** (Outline, 2 filas) | `:89:24` OptionalChaining · `:91:9` ConditionalExpression (+ CUBRE `:89:69` NoCoverage) |
| D — texto EXACTO de `describir()` | **@s24** (Outline, 2 filas) | `:30:35` · `:31:35` StringLiteral · `:127:16` StringLiteral · `:143:5` ConditionalExpression · `:143:25` StringLiteral |
| E — artefacto multi-página mixto | **@s25** (Scenario) | `:215:35` · `:227:33` MethodExpression (`.some`→`.every`) |
| F — espacios alrededor del `=` | **@s26** (Outline, 3 filas) | `:36:23` x2 · `:67:21` · `:82:29` x2 (todas `Regex`) |
| MenuNavegacion — `aria-controls` ↔ `id` | **@s27** (Scenario) | `MenuNavegacion.tsx:5:18` StringLiteral |

Además, **@s18 (mapa de mutantes, Scenario Outline) recibe 7 filas nuevas**, una por grupo, cada una
citando el escenario donde muere (honra su propia nota: «se añadirá CON SU FILA cuando la mutación lo
revele», como en F-05).

### Decisiones de destilación de la ampliación

1. **Filas vs escenarios.** Ningún grupo ENCAJABA como fila en un escenario de comportamiento existente:
   B no cabe en @s1 (@s1 exige que el id esté AUSENTE; grupo B exige que `id=""` esté PRESENTE pero no
   cuente); C no cabe en @s3 (@s3 espera secciones navegables → violación; C espera secciones NO
   navegables → 0); F no cabe en @s1 (el espaciado vive en el MARKUP, no en el valor `<ancla>` que @s1
   abstrae). Por eso **7 escenarios nuevos** (@s21..@s27) + **7 filas** en @s18 (el ÚNICO Outline donde
   encajan: es el mapa de mutantes). Se respetó «filas donde encajen, escenario nuevo si no».
2. **Grupo D — texto EXACTO por el PIPELINE.** El `Then` asevera la línea de `describir()` carácter a
   carácter (la lección: un `Then` que solo cuenta es ciego a mutaciones de valor). La inspección recorre
   `inspeccionarAnclas → describir` para que las constantes `REGLA_*` de producción se ejerzan (matar
   `:30`/`:31`); el ORÁCULO (el literal esperado) se escribe A MANO, jamás se importa `REGLA_*` para
   compararse contra sí misma. El `—` y el `→` son verbatim de `puerta-anclas.ts:147,145`.
3. **Grupo F — DECISIÓN 2 DEL HUMANO (2026-07-18):** el espaciado alrededor del `=` es OPCIONAL en HTML
   válido → tolerarlo es CORRECTO; `<a href = "#servicios">` DEBE reconocerse. El regex `\s*=\s*` se
   QUEDA; se añade el escenario que lo exige. Es EXACTAMENTE el `:58` de F-05 replicado en tres regex.
   Cada fila aísla UN atributo con observable DISTINTO (un fixture único «0 violaciones» enmascararía).
4. **Grupo E — SÍ REPRESENTABLE HOY, verificado.** La puerta de anclas NO importa ni consulta
   `RUTAS_ESPERADAS` (['/'] es de la anti-404 de F-04) [V: `grep` en `puerta-anclas.ts` → 0 usos];
   inspecciona lo que `listarHtml()` devuelva (`tools/puerta-anclas.ts:30-37`). Un artefacto de DOS
   páginas es un fixture (fake `ArtefactoDeProduccion`), IGUAL que @s6/@s7 usan uno de 0/1 páginas. **NO
   es deuda ni [NV] especial:** solo carga el mismo caveat [NV]-hasta-el-primer-build de @s6..@s9 (un
   `dist/` real trae hoy una ruta; F-16 añadirá más). No se fingió nada.
5. **Grupo C — nota honesta sobre `:89:69`.** La fila 1 de @s23 CUBRE el `?? ''` (hoy NoCoverage), pero
   su único input distinguidor sería un heading con id igual al literal de reemplazo de Stryker (porque
   `idsDeHeadings:139` filtra `''`). Registrado en el `.feature`: si al REMEDIR resiste, se ESCALA al
   humano (umbral 1.0, 0 exclusiones); NO se fabrica un fixture atado a la cadena de Stryker.
6. **20 escenarios previos INTACTOS.** Solo se añadieron filas a @s18 (permitido) y comentarios de
   cabecera/remedición. Ningún Given/When/Then de @s1..@s20 cambió.

### Después de que el `tdd_craftsman` los mate

Vuelta al `judge` y **REMEDICIÓN a `--concurrency 1`** de los dos ficheros que fallaron
(`puerta-anclas.ts`, `MenuNavegacion.tsx`). Añadir tests no baja un score, pero el informe honesto hay
que volver a emitirlo (lo pide el propio `progress/mutation_header_nav_footer.md` §6).
