# Destilación Gherkin de F-06 `header_nav_footer` — mapa y decisiones (gherkin_author, 2026-07-17)

> **Estado: `spec_ready`. ⏸ NO APROBADO.** B-1..B-7 esperan la puerta humana. El contrato vive en
> `features/header_nav_footer.feature`; esto es el mapa `acceptance → @s` y las decisiones de
> destilación. **Fuente de los hechos:** `progress/f06_verificacion_previa.md` (MANDA sobre el
> troceado). Destilado de `project-spec.md` §«Feature 6».

## 18 escenarios, @s1..@s18

| @s | Comportamiento | Grupo |
| --- | --- | --- |
| @s1 | ancla `#id` a id ausente → violación (ancla muerta); 4 filas incl. `#facial`, `#servicios`/`#contacto` vs id-de-`<h2>` | puerta de anclas (decisor puro) |
| @s2 | nav con todas las anclas resueltas → 0 violaciones (camino feliz = home.tsx hoy) | ídem |
| @s3 | sección navegable con id que la nav no enlaza → violación (inalcanzable) | ídem (otra mitad igualdad de conjuntos) |
| @s4 | la puerta de anclas (`#x`) es DISTINTA y COMPLEMENTARIA de la anti-404 (`/x`) | deslinde obligatorio |
| @s5 | informe: una línea por violación, determinista, mismo orden | ídem |
| @s6 | artefacto ausente / 0 páginas → exit ≠ 0 (vacuidad) | humilde / falla cerrada |
| @s7 | 0 anclas inspeccionadas → exit ≠ 0 (vacuidad OBLIGATORIA, patrón @s28 F-04) | ídem |
| @s8 | la puerta revienta → falla cerrada, build roto | ídem |
| @s9 | nav consistente → exit 0 (camino feliz del build) | ídem |
| @s10 | `dev` NO invoca la puerta | ídem |
| @s11 | `scroll-padding-top` suelo ≥ altura máxima RE-MEDIDA, sustituye 5rem; SCSS | Capa 1 (B-2) |
| @s12 | HTML CRUDO de `dist/`: cabecera+marca, nav+aria-label, pie horneados (SSR-safe) | marcado |
| @s13 | el pie NO emite enlaces legales (rompería anti-404) | choque puertas (E1.a) |
| @s14 | `<a>` a Facebook/Instagram pasan las 3 puertas de enlaces (2 filas) | choque puertas (E1.b) |
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
