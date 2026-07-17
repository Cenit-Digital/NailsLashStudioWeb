# Destilación Gherkin de F-06 `header_nav_footer` — mapa y decisiones (gherkin_author, 2026-07-17)

> **Estado: `spec_ready`. ⏸ NO APROBADO.** B-1..B-7 esperan la puerta humana. El contrato vive en
> `features/header_nav_footer.feature`; esto es el mapa `acceptance → @s` y las decisiones de
> destilación. **Fuente de los hechos:** `progress/f06_verificacion_previa.md` (MANDA sobre el
> troceado). Destilado de `project-spec.md` §«Feature 6».

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

## Mapa acceptance de `feature_list.json` §6 → @s  (⏸ TRES reescritos, A-23 REDUX)

| Acceptance original | Veredicto verificación | Destilado (propuesta del lead) → @s |
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

1. **Las cifras del `scroll-padding` (@s11) y del breakpoint (@s17) son [NV]/RE-MEDIR.** El `Then`
   de @s11 asevera la RELACIÓN (suelo ≥ altura máxima), con el número escrito A MANO por el TDD tras
   RE-MEDIR sobre la nav definitiva; NO se hereda el 5rem ni se copia el 231 del prototipo. @s17 fija
   el literal `820px` como criterio de proyecto medido, anclado al SCSS, nunca al símbolo.
2. **La regla DOM exacta de «sección navegable» (@s3) es [NV], la FIJA el TDD.** El contrato fija el
   COMPORTAMIENTO (sección navegable con id que la nav no enlaza → violación), no si el id vive en el
   `<section>` o en el `<h2>` con `aria-labelledby`. Si resulta ambigua al implementar → puerta humana.
3. **El menú móvil (@s15/@s16/@s17) destila la PROPUESTA (CSS puro + `aria-expanded`, sin Radix).**
   Marcado con ⏸ en cada uno: el humano puede elegir Radix (→ decidir `Portal` sí/no; con Portal, @s16
   pasa a obligatorio) o «sin menú» (se retiran las aserciones de botón/breakpoint).
4. **No inventé mutadores concretos** (@s18 nombra sabotajes de comportamiento). El conjunto exacto se
   MIDE cuando el fichero exista (A-23, umbral 1.0, 0 exclusiones; si resiste uno, se ESCALA).
5. **Anti-tautología** en todo esperado (ids, 820px, suelo px): a mano, jamás importado de producción.

## Avisos de vuelta al lead (6)

1. **A-23 REDUX:** @1/@2/@4 + `puerta_legal` de `feature_list.json` §6 NO se destilaron tal cual
   (insatisfacible/falso/insostenible/roza el AAA). Destilé la propuesta del lead. **Requiere puerta.**
2. **B-5/B-6/B-3 (menú móvil):** destilé la propuesta CSS puro + `aria-expanded`, sin Radix. El humano
   puede cambiar la mecánica (Radix/sin menú) → @s15/@s16/@s17 se reescriben.
3. **B-7 (huérfanos `destacados`/`ofertas`):** 0 features los construyen; la igualdad de conjuntos los
   deja fuera solo. ¿Se registran como features / `no_se_construyen`? Decisión de alcance, pendiente.
4. **Cifras [NV]:** `scroll-padding` y breakpoint se RE-MIDEN sobre la nav definitiva; el TDD no copia.
5. **Regla DOM de «sección navegable» [NV]:** la fija el TDD sobre el primer `dist/` real.
6. **Todo [NV] hasta el primer `pnpm build` real:** se midió contra funciones puras con fixtures, no
   contra un `dist/` real. El primer build manda sobre todo lo escrito.

## Lo que NO entró (por regla)

- El `767` (herencia muerta), números atribuidos a SC 2.4.11, «WCAG obliga a scroll-padding»,
  «scroll-margin no actúa al tabular», «AAA» bajo etiqueta AA, construir secciones (F-07/F-09/etc.),
  tocar la deuda de otras features. Capa 2 (afinado JS) queda OPCIONAL fuera del acceptance (B-2).

## Ronda de reparación (2026-07-17, tras revisión adversarial de 5 lentes)

La revisión (15 agentes, 1,18 M tokens) alegó 10 hallazgos; un verificador independiente confirmó 4
(1 BLOQUEANTE + 3 GRAVES; dos de los 3 GRAVES eran el MISMO defecto de @s14 escrito por dos agentes,
así que **3 defectos distintos**) y descartó 6 como falsos. Verifiqué los 3 distintos contra fuente
primaria y los **3 se sostienen** → 5 ediciones aplicadas, **0 rechazadas**. B-1..B-7 SIGUEN ⏸ sin
cerrar.

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
     MEDIDA ⏸ coherente con `REGLA_SECTION`**.
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

**Los 6 hallazgos descartados NO se tocaron.** El contrato se mantiene ⏸ NO APROBADO; la regla de
«sección navegable» (defecto 2) va a la puerta humana como propuesta dentro de B-4.
