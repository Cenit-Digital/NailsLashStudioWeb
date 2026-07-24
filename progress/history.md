# Historial de sesiones

> Bitácora **append-only**. Al cerrar cada sesión, añade aquí el resumen que
> estaba en `current.md` (feature, fases recorridas, veredictos, resultado).

<!-- Ejemplo de entrada:
## 2026-01-01 — feature `ejemplo_feature`
- spec_partner: decisiones cerradas (ver project-spec.md).
- gherkin_author: features/ejemplo_feature.feature (@s1..@s5), aprobado por el humano.
- tdd_craftsman: 5 ciclos Rojo-Verde-Refactor. Tests verdes.
- judge: APPROVED (ver progress/judge_ejemplo_feature.md).
- mutation_tester: score 0.92 > 0.80 (ver progress/mutation_ejemplo_feature.md).
- Resultado: done.
-->

## 2026-07-24 — CI roja (Arnés raíz init) por dos ediciones manuales de Pablo fuera del TDD: retiro del botón flotante de WhatsApp + ENMIENDA 4 del carrusel (SC 2.2.2) · CERRADA

- **Disparador**: el PR #11 (run #46) llegó con "Arnés raíz (init)" en rojo. Causa raíz: dos commits de
  Pablo, hechos a mano y fuera del ciclo TDD, dejaron cabos sueltos — `479d541` borró
  `BotonWhatsApp.tsx` sin terminar el borrado (import roto en `home.tsx` + 3 tests huérfanos + scss +
  constante muerta) y `9cf32a9` quitó los tres botones de mando del carrusel (rotación, «Anterior»,
  «Siguiente») de `Galeria.tsx`/`Resenas.tsx`, dejando ~60 tests rotos y 6 errores de `tsc`/`eslint`
  por código muerto (`alternarRotacion`, `claveDeRotacion`, `etiquetaDeRotacion`).
- **Retiro 1 — botón flotante de WhatsApp** (`tdd_craftsman`, sin puerta humana que cruzar: el
  contrato `features/boton_whatsapp_flotante.feature` NUNCA se aprobó — su propio encabezado decía
  "PROPUESTA hasta la puerta humana", sin entrada en `feature_list.json`; F-13 `solicitud_whatsapp`
  sigue `pending` intacta). Retirado el import roto, los 3 tests huérfanos, el `.module.scss` y la
  constante `BOTON_WHATSAPP_FLOTANTE_TEXTO` sin consumidor; banner RETIRADA en el `.feature` (cuerpo
  histórico conservado). Diario: `progress/tdd_boton_whatsapp_retiro.md`.
- **Retiro 2 — controles del carrusel, ENMIENDA 4** (el delicado: reabre un hueco legal en dos
  features `done` y mutadas al 100%). El `craftsman_lead` preguntó explícitamente a Pablo si
  restaurar al menos el botón de pausa, citando el propio contrato («SC 2.2.2 Pause, Stop, Hide,
  Nivel A, BLOQUEANTE»). Respuesta literal de Pablo: *"No lo soluciones para que todo pase, con los
  cambios que yo he hecho, que para eso los he hecho yo a mano, gracias, ultrathink."* — decisión
  INFORMADA de conservar su edición y aceptar el hueco. Pipeline completo:
  - `gherkin_author`: ENMIENDA 4 en `features/galeria_carrusel.feature` (y `resenas_agregado_enlace.feature`
    por herencia). RETIRADOS @s8/@s11/@s16/@s24 (cuerpo histórico intacto, tags nunca reutilizados);
    AJUSTADOS @s2/@s6/@s10/@s12/@s20/@s23; confirmados sin cambio @s7/@s9. Declara sin atenuantes que
    SC 2.2.2 ya NO se cumple para quien navega solo con ratón o solo con el dedo. Registro:
    `progress/enmienda4_carrusel_sc222.md`.
  - `tdd_craftsman`: sincronizó `Galeria.tsx`/`Resenas.tsx`/tests con el contrato — retiró
    `alternarRotacion` y `claveDeRotacion`/`etiquetaDeRotacion` (+ su describe dedicado en
    `galeria-logica.test.ts`, sin ningún llamador). 1299/1299 tests, typecheck/lint 0.
  - `judge`: CHANGES_REQUESTED (1 bloqueante) — `arranqueExplicito` sobrevivió a la misma poda que
    `alternarRotacion` por la misma causa de muerte (su único setter a `true` vivía dentro de esa
    función ya borrada); código de producción sin ningún test que lo exigiera.
  - `tdd_craftsman` (remate): retiró el cableado de `arranqueExplicito` de los dos componentes;
    CONSERVÓ `debeRotar`/`EstadoDeRotacion.arranqueExplicito` en `galeria-logica.ts` sin cambios (sí
    tiene llamador real y test dedicado legítimo de la función pura, `galeria-logica.test.ts` @s8/@s11) —
    decisión que la mutación posterior confirmó sin agujeros. También 3 menores de prosa (citas a
    ficheros/constantes ya borrados).
  - `judge` (delta): APPROVED.
  - `mutation_tester`: FAIL inicial 94,12% (16 supervivientes, 8+8 en Galeria.tsx/Resenas.tsx, UNA
    sola familia — deuda de aserción: `avanzar(12000)` coincide con una vuelta completa del carrusel
    [6×2000 ms] y no distingue "pausado" de "dio la vuelta entera"; `galeria-logica.ts` ya 100%,
    incluida la rama `arranqueExplicito`). Ninguno declarado equivalente.
  - `tdd_craftsman` (remate mutación): amplió `@s12`/`@s8 (@s12 de galería)` con un checkpoint a
    tiempo NO múltiplo del ciclo (`avanzar(2000)`/`avanzar(8000)`, mismo patrón que `@s10`) + una
    aserción sobre el argumento exacto de `matchMedia`. 1301/1301 tests (1299→1301). Mutación
    re-corrida: **100% en Galeria.tsx, Resenas.tsx y galeria-logica.ts, 0 supervivientes.**
  - Informes: `progress/judge_retiro_whatsapp_y_carrusel.md` (dos rondas), `progress/mutation_carrusel_enmienda4.md`,
    `progress/tdd_carrusel_enmienda4.md`.
- **Verificación final del `craftsman_lead`** (independiente, no solo confiada a los diarios):
  `pnpm typecheck` 0, `pnpm lint` 0, `pnpm test` 1301/1301 (39 ficheros), `pnpm build` exit 0 con las
  CINCO puertas (cascarón, placeholders, contraste, terceros, anclas vivas).
- **`feature_list.json`**: ids 22 (`galeria_carrusel`) y 14 (`resenas_agregado_enlace`) — status
  sigue `done` (no es una feature nueva, es una enmienda a un contrato ya cerrado); se añadió el
  bloque `| ENMIENDA 4 (2026-07-24)...` a su `cierre`, declarando sin ambigüedad que el
  `description`/`acceptance` originales ("autoplay con botón de pausa/inicio visible", "navegación
  por flechas") ya NO describen el comportamiento vigente — se conservan como registro histórico de
  lo aprobado en 2026-07-22/23, no como estado actual.
- **Nota de higiene** (hallazgo menor del `judge`, resuelto aquí): este mismo `current.md` arrastraba
  contenido de sesiones anteriores ya cerradas y registradas en `feature_list.json`/este mismo
  `history.md` (el ciclo v3 de `hero-caligrafia-lenta`, y los ciclos previos de F-14/F-22 camino a su
  cierre 2026-07-23) sin consolidar. Se archiva íntegro aquí abajo, tal cual estaba, para no perder
  ningún dato — la rama `feat/hero-caligrafia-lenta` y su PR pendiente de merge, si siguen abiertos,
  son responsabilidad de quien retome ese hilo; no se tocan en esta sesión.
- **Resultado**: 0 errores / 0 fallos / 0 warnings en typecheck, lint, tests y build. Commit y push a
  `feature/last_fixes` a continuación de este cierre.

### Contenido archivado de `progress/current.md` (sin consolidar hasta hoy, preservado íntegro)

- **Feature en curso: hero — CALIGRAFÍA LENTA (contrato demo `features/hero.feature`, enmienda
  2026-07-23)** · `tdd_craftsman` en rama `feat/hero-caligrafia-lenta`. **CICLO EN VERDE
  (2026-07-23): 91 tests de hero (34 estilos + 45 DOM + 12 lógica; baseline 57), 7 ciclos, 18
  sabotajes matados, typecheck/lint/prettier 0.** Nuevos: `hero-logica.ts` (+ su test). Tocados:
  `hero.module.scss` (token 90s + linear + calc + `.control` + bloque completada), `Hero.tsx`
  (control sin cromo, data-firma, fin de reloj), `hero.test.tsx`, `hero-estilos.test.ts`.
  @s1-@s3/@s5-@s9 intactos y verdes. PENDIENTE del lead: alta de `hero-logica.ts` en
  `stryker.config.json`, suite completa + build, judge, mutación (Hero.tsx break 100),
  verificación EN VIVO (brief §4). NO marcado done. Diario:
  `progress/tdd_hero_caligrafia_lenta.md`. F-07 NO se reabre (precedente 2026-07-20).
  [NOTA 2026-07-24: la entrada de arriba parece anterior al cierre ya registrado más arriba en este
  mismo fichero, "2026-07-23 (noche) — la caligrafía LENTA del hero (≈90 s)... CERRADA" — se archiva
  tal cual sin reconciliar, por si el "PR pendiente de merge" de `feat/hero-caligrafia-lenta` sigue
  abierto de verdad.]
- **Feature en curso: 14 — `resenas_agregado_enlace`** · `tdd_craftsman` en rama
  `feat/galeria-v3-resenas`. **CICLO EN VERDE (2026-07-23): 142 tests nuevos (+4 en
  home-horneado, build-based, sin correr aquí), 7 sabotajes matados, typecheck/lint/prettier 0.**
  Nuevos: `Resenas.tsx`, `resenas-logica.ts`, `resenas.module.scss`, `resenas-agregado.ts`,
  `resenas-demo.ts`. home.tsx: solo el cableado ENTRE Equipo y Reserva. PENDIENTE del lead:
  añadir los 3 mutables a `stryker.config.json`, suite completa + build, judge, mutación,
  verificación en vivo. NO marcado done. Diario: `progress/tdd_resenas.md`.
  [NOTA 2026-07-24: `feature_list.json` id 14 ya está `done` con cierre completo (mutación 100%,
  EN VIVO 50/50) — esta entrada quedó desactualizada tras ese cierre. `stryker.config.json` YA
  contiene `Resenas.tsx`/`resenas-logica.ts` (confirmado por inspección directa el 2026-07-24).]
- **Feature en curso: 22 — `galeria_carrusel` (v3, Enmienda 3)** · `tdd_craftsman` en rama
  `feat/galeria-v3-resenas`. **CICLO v3 EN VERDE (2026-07-23): 197 tests de galería (+49), eslint/
  tsc/prettier limpios, 16 sabotajes matados.** `carrusel-logica.ts` NUEVO (cadencia 2000, teclado
  @s21/@s22), reloj con generación (@s20), teclado cableado y guardado (@s23), mandos de cristal
  (@s24, `.mandos` fuera). Diario completo: `progress/tdd_galeria_carrusel.md` § Ciclo v3.
  PENDIENTE del lead: añadir `carrusel-logica.ts` a `stryker.config.json` → judge → mutación →
  verificación en vivo. NO marcado done.
  Anterior: sesión cerrada 2026-07-23 (features 22 y 12 → `done`; resumen en `history.md`).
  [NOTA 2026-07-24: `feature_list.json` id 22 ya está `done` con cierre v3 completo (mutación 100%,
  EN VIVO 50/50) — esta entrada quedó desactualizada tras ese cierre. `stryker.config.json` YA
  contiene `carrusel-logica.ts` (confirmado por inspección directa el 2026-07-24).]


## 2026-07-17 — feature `5 — cero_terceros` · **CERRADA `done`**

**Resultado: 43/43 escenarios · 576 tests · judge APROBADO · mutación 100 % en los dos ficheros
(183 + 110 mutantes), 0 timeouts, 0 exclusiones · `pnpm build` exit 0 con las CUATRO puertas.**

`src/lib/terceros.ts` (detector puro) · `src/lib/puerta-terceros.ts` (decisor +
`PARES_DE_FUENTE_ESPERADOS`) · `tools/puerta-terceros.ts` (el humilde). Fuentes autohospedadas por
los 6 imports `@fontsource/<familia>/latin-<peso>.css`.

### La feature en una frase

**«Cero terceros» no es «cero orígenes externos en el texto del artefacto»: es cero PETICIONES
AUTOMÁTICAS.** La distinción la da el HTML Living Standard (*external resource link* vs
*hyperlink*) y **es la feature entera**.

### Fases

- **Verificación previa** (`f05_verificacion_previa.md`): 16 subagentes contra fuente primaria,
  799k tokens. **8/8 afirmaciones con algo tumbado, 0 refutadas de raíz.**
- **Spec**: `project-spec.md` §Feature 5 (555 líneas).
- **Gherkin**: 37 → **40** escenarios tras una **revisión adversarial del contrato** (31 agentes,
  6 lentes, **2,14 M tokens**): **25 hallazgos alegados, 23 confirmados — 3 BLOQUEANTES.**
- **Puerta humana (2026-07-17)**: A-23, A-24, A-27, A-28 — **las cuatro como proponía el lead**.
- **TDD**: 40/40, 568 tests. **judge APROBADO** (30 sabotajes reproducidos).
- **Mutación**: **ESCALADA — 10 supervivientes reales.**
- **Puerta humana (2ª)**: ampliar el contrato **40 → 43**. **Producción NO se toca.**
- **TDD ronda 2**: 43/43, 576 tests, **0 líneas de producción tocadas**.
- **Mutación de cierre**: **100 % / 100 %**, 0 timeouts, 0 exclusiones. **judge delta APROBADO.**

### 🔴 Lo que esta feature enseña, y no estaba en ninguna otra

1. **Un criterio de aceptación puede ser INSATISFACIBLE, y nadie lo nota hasta que se mide.**
   *«El build falla si el artefacto contiene CUALQUIER origen externo»* era imposible: `dist/` ya
   traía **10 orígenes externos y ninguno era una petición** (4 namespaces XML de React,
   `react.dev/errors`, `fb.me`, el `@context` de F-04, la canónica). **Cumplirlo habría roto F-04,
   que estaba `done`.** → A-23.
2. **La `puerta_legal` era una ATRIBUCIÓN NORMATIVA FALSA**, y llevaba ahí desde el troceado.
   El art. 22.2 LSSI **no dice «cookies»**: dice «almacenamiento **Y recuperación**». **MEDIDO:**
   gstatic **no** manda `Set-Cookie` pero **sí** `Cache-Control: max-age=31536000` → *«no almacena
   nada»* es **falso**. Y **Fashion ID no se pudo abrir** (EUR-Lex: 202 + challenge AWS-WAF).
   → **La justificación correcta es CRITERIO DE PROYECTO y no cuelga de ninguna cita.** La
   decisión de autoalojar **no cambió**; cambió su fundamento. F-11 arrastraba lo mismo: corregida.
3. **«No copiar del base» mordió por TERCERA vez.** El diseño usa **Manrope + Gilda Display +
   Great Vibes**; `@fontsource/dm-sans` y `@fontsource/outfit` llevaban en `package.json`
   **sin un solo import**. (F-03: los tokens. F-04: el JSON-LD. F-05: las fuentes.)
4. **La regla del timeout mordió por TERCERA vez, y es la más cara del repo.** La tanda #1 dio
   **«100 %, 0 survived» con 152/183 en TIMEOUT**, en código **sin un solo bucle**. A
   `--concurrency 1`: **152 → 0 y aparecieron 9 supervivientes reales.**
5. 🔴 **LA LECCIÓN NUEVA — UNA MEDICIÓN ROTA NO ES UN RESULTADO, y siempre apunta a «aquí no hay
   nada que hacer».** Pasó **CUATRO veces en un día**, y las cuatro se cazaron *solo* porque el
   número era **imposible por construcción**:
   - La tanda #1 de Stryker: 152 timeouts en código sin bucles.
   - Un sabotaje del `judge` con error de sintaxis que imprimía «0 red».
   - El primer sabotaje del craftsman: **«0/10, los diez sobreviven»** — `--reporter=basic`
     **se eliminó en Vitest 4**, vitest salía ≠0 **sin correr un solo test**, y el script leía
     «0 fallos» como «sobrevive».
   - La sonda del `judge` en el delta: falló **uniformemente** en los 6 casos, que se habría leído
     como «indistinguible = decorado». **La cazó porque tenía controles SIN mutante.**
   > **Regla que se queda:** *una medición que coincide con tu hipótesis en TODOS los casos es más
   > probable que esté rota a que sea cierta.* **Y: comprueba cuántos tests corrieron de verdad.**
6. **El diff textual de Stryker MIENTE sobre la precedencia.** `a && b && c && d` parsea
   `((a&&b)&&c)&&d`; el mutante `LogicalOperator` se **imprime** `a || b && …` pero **es**
   `(a || b) && …`. **Copiar el diff literal da un mutante MÁS FUERTE que mata 5 tests** y
   «desmiente» un superviviente real. **Parentiza siempre.**
7. **`.includes` NO lo muta Stryker 9.6.1**, y **Stryker tiene 16 mutadores** (registro
   `allMutators`), no los 17 de la página oficial —que lista dos de Stryker.NET—. **Para decidir
   qué se muta, la fuente es el código instalado, no la doc.**
8. **`Regex` no va de anclas**: `regex-mutator.js` delega el patrón **entero** en weapon-regex.
   `/\s+/` **sin una sola ancla** da 2 mutantes.
9. **Vite 7 NO exime a las fuentes del inlining** (4096 B): hoy salva el tamaño (6.192 B) — **suerte,
   no garantía**. Y **`base` reescribe todos los `url()` a un origen externo**: es la vía nº1 y
   **ningún grep del CSS la anticipa** → la puerta asevera **la config**, no solo la salida.
10. 🔴 **LA PRUEBA DE MUTACIÓN ENCONTRÓ UN HUECO EN LA *SPEC*, NO EN LOS TESTS.** Los 10
    supervivientes eran **guardas defensivas CORRECTAS que ningún escenario ejercitaba**.
    **Producción quedó byte a byte idéntica mientras el contrato crecía de 40 a 43.**
    Y el `:58`: **un comentario que prometía tolerar `src = "x"` sin que ningún test lo fijara.**
    > **Una promesa en un comentario no es un contrato hasta que un test la muerde.**
11. **La revisión adversarial del contrato se pagó sola.** Cazó 3 bloqueantes **antes** de la
    puerta humana; el peor: `@s30` **no** mataba a `ArrayDeclaration` (recibe un `[]` literal, así
    que **nunca evalúa la constante de producción**) → con `break: 100` habría sido **INMORTAL y
    la feature no habría cerrado jamás**. **`@s38`, el escenario-ancla que la revisión obligó a
    añadir, es quien lo mata** — confirmado por la mutación **y** por 30 sabotajes del `judge`.

### Deuda declarada (NO cerrada aquí, a propósito)

- **El hueco de `(html|css)`**: un `fetch()` a un tercero desde el JS del bundle **no lo cazaría
  esta puerta**. **Hoy no existe ninguno [V, medido].** Declarado, no cerrado.
- **La deuda de binarios de F-01 sigue viva** (A-27): F-05 es la primera feature que mete
  `.woff2` en `dist/`. **Medido: 0 violaciones hoy**, pero **50.100 secuencias candidatas** al
  regex del teléfono. F-05 **no tocó** `tools/puerta-placeholders.ts` (Ley 1).
- **`latin-ext`** (A-28): un nombre con `Ł`/`ř`/`ğ` daría **tofu silencioso**. Entrará con su
  escenario el día que exista un nombre real que lo exija.
- **Ley 3**: el craftsman la rompió 3 veces en la ronda 1 y lo **declaró**; el `judge` lo aprobó
  tras probarlo por sabotaje, pero lo registró como **deuda GRAVE**: *«el sabotaje es un remedio a
  posteriori, no una licencia»*.
- **`prettier --check .` falla en 86 ficheros y ya fallaba antes de F-05.** Deuda preexistente;
  `format:check` **no** es puerta del arnés (`lint` = `typecheck + eslint`).
- **Los 2 menores del `judge`**, no bloqueantes.

## 2026-07-18 — feature `6 — header_nav_footer` · **CERRADA `done`**

**Resultado: 27/27 escenarios · 629 tests · judge APROBADO (2 rondas) · mutación 100 % en los cuatro
ficheros (`puerta-anclas.ts` 149 + `Cabecera.tsx` + `MenuNavegacion.tsx` + `Pie.tsx`), 0 timeouts,
0 EXCLUSIONES · `pnpm build` exit 0 con las CINCO puertas.**

`src/lib/puerta-anclas.ts` (decisor puro) + `tools/puerta-anclas.ts` (humilde) +
`src/components/{Cabecera,MenuNavegacion,Pie}.tsx` + `cabecera.module.scss`.

### La feature en una frase

**El entregable central no fue la nav, sino una PUERTA DE ANCLAS VIVAS** que no existía: la anti-404
de F-04 **excluye las anclas por diseño** (`RUTA_INTERNA = /^\/(?!\/)/`), así que una nav con 7
anclas muertas pasaba las cuatro puertas en verde. Ahora *«todo `href="#id"` de la nav resuelve a un
`id` presente Y cada sección navegable está enlazada (igualdad de conjuntos)»*, sobre el HTML crudo
de `dist/`, fallando cerrada para **los dos** extractores.

### Fases

- **Verificación previa** (`f06_verificacion_previa.md`): 8 afirmaciones × verificar+refutar,
  ~1,77 M tokens, **1 recuperación por sobrecarga 529**. 1 refutada de raíz, 6 matizadas, 1 confirmada.
- **Spec** (`project-spec.md` §Feature 6, 409 líneas) → **Gherkin** 20 escenarios tras **revisión
  adversarial del contrato** (5 lentes, 15 agentes, 1,18 M tokens → **10 alegados, 4 confirmados:
  1 BLOQUEANTE + 3 GRAVES**).
- **Puerta humana (2026-07-17)**: B-1..B-7, las siete como proponía el lead.
- **TDD** 20/20 (617 tests). **judge APROBADO.**
- **Mutación**: **ESCALADA — 21 supervivientes reales** (contrato de menos).
- **Puerta humana (2ª, 2026-07-18)**: ampliar el contrato **20 → 27**.
- **TDD ronda 2**: 20/21 muertos, producción intacta, **1 equivalente escalado**.
- **Puerta humana (3ª)**: refactorizar el equivalente (no excluir).
- **TDD ronda 3**: refactor de `seccionesNavegables`. **judge delta APROBADO.**
- **Mutación de cierre**: **100 % / 100 %**, 0 exclusiones.

### 🔴 Lo que esta feature enseña, y no estaba en ninguna otra

1. **«No copiar del base» mordió por CUARTA vez.** El breakpoint **`767` era herencia muerta de
   WebEmpresa** (0 ocurrencias en `src/`); el diseño no tiene ni una `@media`. El breakpoint real
   **medido en Chrome** es 793–806px → 820px con margen.
2. **La trampa gemela de WCAG, por TERCERA vez.** La `puerta_legal` (*«SC 2.4.11 foco no
   oscurecido»*) rozaba el AAA: el listón AA es *«not entirely hidden»*; *«no part hidden»* es el
   2.4.12, que es AAA. **Cero umbrales numéricos**: los 66/70/80px no son WCAG.
3. **Tres criterios de aceptación no se podían destilar tal cual** (A-23 redux): @1 *«TODAS las
   secciones, no 7 de 11»* insatisfacible (hoy 2 secciones, ids en los `<h2>`); @2 *«scroll-margin no
   actúa al tabular»* **falso** (el scroll al Tab es UA-defined); @4 *«se deriva de la altura real»*
   **insostenible bajo SSG** (en CSS puro no hay forma de leer la altura de un elemento).
4. 🔴 **Un `className={cond?'a':'b'}` en TSX es INMATABLE** bajo la regla anti-clase-CSS del repo
   (5 mutantes, solo mueren con `toHaveClass`, prohibido). **La salida medida: el estado va en un
   atributo consultable** (`aria-current`/`aria-expanded`, muere 4/4). Es una **colisión entre dos
   reglas del repo**, no un fallo de Stryker.
5. **`Dialog.Portal` de Radix emite CERO en prerender** → dejaría la anti-404 **ciega** («miente por
   omisión»). Y `radix-ui` tenía **cero usos en `src/`** → salió de `dependencies` (caso `dm-sans`).
6. 🔴 **VERDE POR VACUIDAD EN UN SEGUNDO EXTRACTOR, invisible a la mutación.** La revisión del
   contrato cazó que la puerta de anclas tiene **dos** extractores (anclas + secciones) y solo el de
   anclas tenía guarda de vacuidad. El de secciones podía derivar 0 y pasar en verde **con la
   mutación aún al 100 %** — la brecha no la caza la métrica de cierre, solo la puerta humana.
7. 🔴 **LA MUTACIÓN ENCONTRÓ UN HUECO EN LA SPEC, por tercera vez** (F-01, F-05, F-06). Los 21
   supervivientes eran **guardas defensivas correctas que ningún escenario ejercitaba**; producción
   quedó **intacta** mientras el contrato crecía 20 → 27. El grupo F era **el `:58` de F-05 otra
   vez**: un comentario que prometía tolerar `href = "#x"` con espacios sin que ningún test lo fijara.
8. 🔴 **UN «MUTANTE EQUIVALENTE» SE ELIMINA POR REFACTOR, NO SIEMPRE SE EXCLUYE — pero el refactor
   ingenuo RE-INTRODUCE el equivalente.** La forma orientativa del lead (`referencia !== undefined &&
   headings.has(...)`) habría vuelto a ser equivalente: `true && headings.has(...)` = `headings.has(
   undefined)` = siempre false (la trampa del `undefined` redundante). La forma correcta: **un guard
   que protege un THROW real** (`coincidencia[1]` sobre `null` revienta), así **debilitar el guard
   LANZA** y un test lo mata. El proyecto mantiene **0 exclusiones** desde F-03.
9. **La mutación sobre TSX es territorio nuevo y benigno**: los mismos 6 mutadores de cualquier
   `.ts`; los **atributos JSX literales NO se mutan** (`aria-label="Principal"` no está protegido por
   la mutación — lo aseveran los tests o la puerta del cascarón). Los `.tsx` van a **DOS listas**:
   `mutate` (Stryker) **y** `coverage.include` (Vitest).

### Deuda declarada (NO cerrada aquí)

- **El menor del judge** (`@s12`/`@s16` aseveran sobre `renderToString`, el motor de prerender, no
  sobre `readFileSync` de `dist/`): honra el espíritu anti-jsdom; para F-07+ un test que lea
  `dist/index.html` cerraría también la letra.
- **`destacados`/`ofertas` son huérfanos** (0 features): la nav no los enlaza; anotados como deuda,
  sin construirse ni descartarse (B-7).
- **El scroll-padding-top (`6rem`) y el breakpoint (`820px`) se RE-MIDEN** cuando la nav definitiva
  cambie las etiquetas (F-09 mete «Pestañas/Cejas»): mueven los saltos de envoltura.

## 2026-07-18 — feature `hero_marca` (F-07) → **`done`**

- **spec_partner + gherkin_author (fases previas):** verificación previa (`f07_verificacion_previa.md`,
  8 afirmaciones × verificar/refutar con build SSG real + Chrome/CDP), `project-spec.md §Feature 7`,
  contrato `features/hero_marca.feature` (16 escenarios), revisión adversarial (5 lentes/11 agentes).
- **Puerta humana (2026-07-18):** las 5 preguntas (C-1, C-2, C-3, C-5, C-7) cerradas por el humano.
- **tdd_craftsman (1.ª ronda):** 15/15 escenarios implementables por TDD (`@s14` aplazado a F-08).
  `partir-nombre.ts` (lógica mutable) + `Hero.tsx` (h1, dos `<span>` + text node `{' '}`) +
  `hero.module.scss` (base VISIBLE, oculto solo en el 0% del keyframe, `@media reduce`, duración
  ≤1,2 s). 661 tests.
- **judge (1.ª ronda):** APROBADO (15/15, 0 bloqueantes, 2 menores). **mutation_tester:** 100 %.
- **🔴 F-07 estrenó VERIFICACIÓN EN VIVO con Chrome** (extensión del humano): cazó lo que ninguna
  puerta unitaria podía ver — **el titular salía en la fuente por defecto («Times New Roman»), NO en
  Great Vibes**: `hero.module.scss` no declaraba `font-family` para el titular (heredaba la del
  cuerpo). «Verde ≠ funciona» (I-8) en estado puro. El `@font-face` de F-05 estaba, el hero no lo pedía.
- **AMPLIACIÓN aprobada en la puerta:** arreglar la tipografía DENTRO de F-07 → acceptance 7 + `@s17`.
  - **tdd_craftsman (2.ª ronda):** `@s17` por TDD (Rojo→Verde→Refactor + sabotaje A/B): 2 líneas
    `font-family` (`.heroMarca` `'Great Vibes', cursive`; `.heroStudio` `'Manrope', sans-serif`).
    **664 tests** (+3), typecheck/lint 0, `pnpm build` exit 0 (5 puertas).
  - **judge (2.ª ronda):** APROBADO `@s17` (0 bloqueantes, 2 menores no bloqueantes).
  - **mutation_tester (2.ª ronda):** 100 % — `partir-nombre.ts` (13/13), `Hero.tsx` (2/2), 0
    supervivientes; `@s17` es SCSS → no-mutable (declarado, no fingido).
  - **RE-VERIFICACIÓN EN VIVO con Chrome (extensión del humano + CDP headless):** `document.fonts.check
    ('142px Great Vibes')` = **true** (era `false`); titular computa `'Great Vibes', cursive` /
    `'Manrope', sans-serif`; Great Vibes 400 `loaded`; **LCP 136-216 ms** (`lcp_inH1: false`);
    reduced-motion sin movimiento; reflow 320 sin desborde; **0 peticiones a terceros** (F-05 intacto);
    consola limpia. Ver `progress/verificacion_viva_hero_marca.md`.
- **Resultado: `done`.** 17/17 escenarios (16 + `@s17`; `@s14` aplazado a F-08).
- **🟡 Deuda declarada (NO reparada — una feature a la vez):** (1) error de app en re-navegación SUAVE
  de `vite-react-ssg` bajo `vite preview` (`JSON.parse` de un HTML; **NO** en carga completa ni recarga
  dura; no lo causa `@s17`) — revisar antes de publicar / al meter enrutado multipágina (F-16). (2) el
  `body` global **no fija `font-family`** → el cuerpo sale en la serif por defecto del UA; candidato a
  su propia feature de tipografía global.

## 2026-07-18 — LOTE A (camino crítico enseñable para la DEMO). Puerta humana en LOTE.

**Contexto:** el humano pidió «toda la web con el prototipo antes del lunes». Investigación (3 agentes):
publicar EN VIVO es imposible (falta razón social/NIF del cliente, LSSI art. 10); objetivo real =
**prototipo DEMO con placeholders**. Decisiones: demo/placeholders · «yo preparo, tú apruebas en lotes»
(rigor completo) · camino crítico enseñable. **Lote A = tipografía + F-10 + F-09 + F-12.**

**Preparación (spec_partner → gherkin_author → revisión adversarial → reparación):** 4 contratos, 56
escenarios. La **revisión adversarial (5 lentes) cazó 2 BLOQUEANTES antes de escribir código**: (1)
`horario @s14` habría roto `seo.test.ts` de F-04 (`done`) → se compone en `home.tsx`, no en
`construirJsonLd`; (2) `contacto` tenía verde-por-vacuidad → ancla positiva. **Lote A APROBADO** el
2026-07-18. `feature_list.json`: F-09/F-10/F-12 → spec_ready; añadida #21 tipografia_global.

### feature `tipografia_global` (id 21, NUEVA) → **`done`**
- Nace de la deuda de F-07 (el `body` global no fijaba `font-family` → Times New Roman).
- **TDD @s1–@s7** (leen el SCSS): partial nuevo `src/styles/_tipografia.scss` (`body` Manrope; `h2, h3`
  Gilda Display, regla conjunta, selector de tipo que no toca el `h1` del hero) + `@use 'tipografia'` en
  `main.scss`. Test `tipografia-global.test.ts` (15 tests). 6 sabotajes muerden.
- **judge** APROBADO (0 bloqueantes, 2 menores). **Mutación** N/A (SCSS, `mutable:false`, declarado).
  **679 tests**, typecheck/lint 0, build 5 puertas (Gilda Display horneado sin romper terceros).
- **VERIFICACIÓN EN VIVO con Chrome:** `body` computed = Manrope (era Times New Roman), `h2` «Servicios»
  = Gilda Display, `document.fonts.check` = true + `loaded`; **regresión F-07 OK** (hero Great Vibes);
  **0 terceros**. Resultado: `done`. Cierra la deuda #2 de F-07.

### F-10 `horario` · F-09 `catalogo_servicios` · F-12 `contacto`
- Contratos aprobados y abiertos (✅). Se implementan uno a uno tras tipografía (orden: horario →
  contacto → catálogo). Estado al escribir esto: `spec_ready`.

## 2026-07-19..21 — Sesiones DEMO (bitácora movida desde `current.md` el 2026-07-23, C2 del judge)

- **🎨 DEMO hero «TRAZO DE PLUMA»** (2026-07-19, rama `demo/lunes-prototipo`, a petición de Pablo). Dos
  quejas resueltas sobre el hero: (1) **el recorte** de «Nails Lash» (la «L»/«N»/«h» seccionadas por
  arriba) — causa: `clip-path: inset(0 0 0 0)` (border-box) + `line-height:0.9` dejaban la caja más baja
  que las astas de Great Vibes; arreglado dando ALTURA a la caja (`padding-top:0.6em`, `line-height:0.98`)
  SIN tocar el valor del clip-path → **@s1 de F-07 intacto**. (2) **La animación**: Pablo eligió (puerta,
  `AskUserQuestion`) «Trazo de pluma (SVG)» frente a «contorno» y «barrido». Se sustituyó el `brush.png`
  que barría en horizontal por un **aplicador de esmalte que RECORRE el trazo real de cada letra**: un
  `<svg viewBox>` (escala con el titular responsive) con `<image href=brush.png>` movido por SMIL
  `<animateMotion>` sobre `TRAZO_MARCA` (centerline de «Nails Lash» calibrada en vivo con `measureText`),
  mientras Great Vibes se revela detrás con `paintReveal` (F-07). Ficheros: `Hero.tsx`, `hero.module.scss`.
  **F-07 (done) NO reabierto**: el `<h1>` (2 spans + text node), nombre accesible «Nails Lash Studio»,
  `paintReveal`, `--ink`, fuentes y ≤2,5s siguen igual (28 tests núcleo verdes). Los 3 tests `@demo` del
  mecanismo viejo (`brush.png`/`brushWrite`) se **reescribieron** al nuevo (5 tests: reduced-motion oculta
  `.pincelSvg`, `<svg aria-hidden>` fuera del `<h1>`, `brush` autohospedado, `<animateMotion>` con path de
  curvas y 2 subtrazos). **769 tests verdes**, typecheck/lint 0, `pnpm build` **5 puertas** (F-05 terceros
  OK: el `href` del aplicador es local). **VERIFICADO EN VIVO con Chrome** cuadro a cuadro (líneas CSS+SMIL
  conducidas por `getAnimations().currentTime` + `setCurrentTime`): el aplicador sube por la N, hace la
  montaña, recorre los lazos y termina en la «h»; sin recorte; «STUDIO» visible; reduced-motion sin pincel.
  Contrato en `features/hero.feature` (reescrito del viejo 4.8s/IntersectionObserver). 🟡 Sin commitear.

- **F-18 `equipo` — cierre de mutación (2026-07-21, `tdd_craftsman`):** los 8 supervivientes de
  `Equipo.tsx` (score 93.33 %) resueltos con **3 tests nuevos + 0 exclusiones**. (1) `franjasDe` divide
  su núcleo en `franjasOfrecibles(franjas)` PURA e inyectable → 2 tests de frontera matan `>= abre` y
  `< cierra` (81:37, 81:63). (2) El `className` condicional de la hora (177:32 ×3, inmatable con
  css:false) se BORRA: estado en `&[aria-pressed='true']` del SCSS. (3) La confirmación pasa a
  VALOR-OBJETO (`propuesta`/`reserva: Cita | null`): se van la bandera `reservado` (118:18) y la guarda
  redundante (140:23/140:42), sin `// Stryker disable`. **56 verdes** en los 2 ficheros de equipo,
  typecheck/lint 0. Detalle en `progress/mutation_equipo.md`.
- **🎨 DEMO Equipo + WhatsApp flotante — CERRADO Y VERIFICADO (2026-07-21).** A petición de Pablo (la
  página se había desviado del diseño Opción-1-Rosa): (a) se **restauró el orden del diseño** —
  `Ofertas → Equipo → Reserva → Galería` (la Galería, que se había colado en el hueco de Equipo, baja
  tras Reserva; NO se borra, decisión de Pablo); (b) **nueva sección `#equipo`** (`Equipo.tsx` +
  `equipo-logica.ts` + `equipo-demo.ts`), 7 tarjetas (Lucía…Sara) con especialidades REALES (Uñas ·
  Pestañas · Cejas · Nail art · Pedicura — NUNCA «Facial»/«Depilación», que no existen en el salón),
  calendario por profesional (sábado sin franjas de tarde por F-10), carrusel de reseñas circular, y
  **leyenda visible «datos de ejemplo»**; SIN fotos (placeholder de color; el literal `ph-woman` está
  prohibido por la puerta 2). (c) **Botón FLOTANTE de WhatsApp** (`BotonWhatsApp.tsx`), `<a>` estático
  fuera de `<main>`, `href` derivado de `waHref` de F-02 (formato `wa.me` VERIFICADO contra la doc
  oficial de WhatsApp), SVG inline accesible, WCAG 2.2 SC 2.4.11/2.5.8, `prefers-reduced-motion`.
  Contratos: `features/equipo_reservas.feature` (25) y `features/boton_whatsapp_flotante.feature` (14).
  **Puertas:** judge equipo APROBADO; judge botón APROBADO (v2, tras cerrar `@s4`); seguridad SECURE;
  a11y sin bloqueantes. **Mutación 100%** en `Equipo.tsx` y `equipo-logica.ts` (0 exclusiones);
  `BotonWhatsApp.tsx` EXCLUIDO de `mutate` por no-mutable (`<a>` estático, `@s11` lo enforce; ver
  `progress/mutation_boton_whatsapp.md`). **Verificación final (medida a mano):** typecheck 0, lint
  **0 errores/0 warnings** (las 4 funciones puras se extrajeron a `equipo-logica.ts`, patrón F-09),
  `pnpm build` exit 0 con las **5 puertas verdes**, `pnpm test` **889/889**. Reorden confirmado sobre
  `dist/index.html` real. De la sesión paralela: el hero se commiteó (`b2564e9`, `f192bad`); no se tocó.
  ⚠️ **`feature_list.json` F-18/F-13 NO se marcan `done`:** esto es un DEMO verificado, NO publicable.
  El bloqueo de F-18 «para publicar» (fotos reales + consentimiento, LO 1/1982 · RGPD art. 7.3) SIGUE
  vigente; los nombres son de ejemplo. F-13 (calendario que compone la solicitud) es otra feature.
- **🎨 `#reserva` RESTAURADA al diseño + MONOGRAMA en Equipo — CERRADO Y VERIFICADO (2026-07-21).**
  Pablo volvió a señalar secciones desviadas del prototipo. **Auditoría del lead contra los BYTES de
  `dist/index.html` vs `Opcion-1-Rosa.dc.html`:** de las 9 secciones, 7 coincidían; las desviaciones
  reales eran DOS, y solo dos. (a) `#reserva` tenía el titular «Pide tu cita en un momento» y una
  columna izquierda con un mini-calendario que el diseño NO pone ahí (el calendario del diseño vive en
  las tarjetas de `#equipo`, donde ya estaba: estaba DUPLICADO). (b) La galería «Nuestros trabajos» NO
  existe en el diseño — **decisión de Pablo por pregunta explícita: SE QUEDA donde está**, no se toca.
  - **`#reserva` restaurada** (`Reserva.tsx`, `reserva.module.scss`): columna izquierda = copy VERBATIM
    del prototipo (L248-256) —eyebrow, `<h2 id="reserva-titulo">¿Prefieres reservar por chat?</h2>`,
    párrafo— y DOS enlaces: «WhatsApp» (`waHref`) y «Llamar al estudio» (`telHref`), ambos DERIVADOS de
    F-02 (el `34600123456` del prototipo NO entra). Mini-calendario borrado entero (−130 líneas) y el
    SCSS podado: **16 clases declaradas ↔ 16 usadas**, 0 huérfanas. De paso se cazó que `estilos.reserva`
    NO existía en el módulo y rendía `undefined` en el className: arreglado. `RESERVA_WHATSAPP_TEXTO` en
    `src/lib/demo/reserva-demo.ts` (3.er punto de entrada DISTINGUIBLE en el móvil del salón).
  - 🔴 **CAUSA RAÍZ de la deriva, y la lección:** `#reserva` era la ÚNICA sección del proyecto con
    **CERO tests**; por eso fue la única que se desvió sin que nadie lo notara. Ahora tiene **36 tests**
    que cubren los **22 escenarios** del contrato reescrito. `features/reserva_chat.feature` v1 MENTÍA
    (ofrecía «Facial»/«Depilación», que el salón no ofrece): reescrito contra lo que el código hace.
    `claveBurbuja` sale a `reserva-logica.ts` (el ternario de className era inmatable bajo `css:false`).
  - **Monograma en Equipo** (@s26-@s31): donde había un rectángulo rosa VACÍO va la INICIAL de cada
    profesional. `inicialDe(nombre)` PURA en `equipo-logica.ts` (`charAt(0).toUpperCase()`: el caso
    vacío se resuelve SIN guarda, que sería mutante equivalente). Decorativo de verdad —`aria-hidden`
    en `.foto`, el nombre lo sigue dando el `<h3>`—. Gilda Display, `--accent-dark` sobre
    `--accent-soft`: par YA en la matriz, `MINIMO_DE_PARES` sigue en 18. **SIN fotos**: la norma de
    Pablo (nada de caras de IA) y la puerta 2 (`ph-woman` prohibido) siguen vigentes.
  - **Puertas (medidas a mano por el lead, no fiadas del informe del agente):** typecheck 0 · lint
    **0 errores / 0 warnings** · `pnpm build` exit 0 con las **5 puertas** · `pnpm test` **943/943** (32
    ficheros) · **mutación 100 % en `equipo-logica.ts` (36 muertos) y `Equipo.tsx` (55 muertos), 0
    supervivientes y 0 exclusiones nuevas** · judge **APROBADO** (0 bloqueantes) · a11y **0 bloqueantes**
    (monograma 4,86:1 sobre umbral 3:1 por texto grande; `.demo-btn` ≈48 px ≥ SC 2.5.8).
  - Verificado sobre `dist/index.html` REAL: orden Promociones → Equipo → «¿Prefieres reservar por
    chat?» → Galería → Contacto → FAQ; las 7 iniciales (L C A N M P S) HORNEADAS; «Pide tu cita» 0
    apariciones. Diarios: `tdd_reserva_equipo_final.md`, `judge_reserva_equipo_final.md`,
    `a11y_reserva_equipo_final.md`.
  - 🟡 **Deuda declarada (NO reparada, decide el humano):** (1) `Reserva.tsx` y `reserva-logica.ts`
    siguen FUERA de `stryker.config.json → mutate`: hoy tienen 36 tests pero su mutación no se mide.
    (2) D1 del contrato: el chat es un ASISTENTE DE DEMOSTRACIÓN y no lo dice en pantalla; sin leyenda
    visible, un visitante puede creer que ha reservado de verdad. Es honestidad, y merece su @s23.
    (3) `features/galeria_carrusel.feature` @s24 exige que la galería PRECEDA a «Reserva rápida», y hoy
    va DESPUÉS: el contrato quedó obsoleto cuando Pablo decidió dejarla ahí. Ningún test lo enforce.
- **Deuda anotada (`progress/deuda_precios_catalogo.md`):** los precios del catálogo quedaron
  descolocados en el commit `5a1345c` (p. ej. «Piernas completas 10 €» < «Medias piernas 35 €», y el
  catálogo anuncia «Facial»/«Depilación» que el salón no ofrece). Pablo pidió expresamente NO tocarlo.
- **Feature en curso: `reserva_chat` (columna WhatsApp) — sesión 2026-07-21 (`tdd_craftsman`).** Puerta
  humana abierta explícitamente (Pablo, vía `AskUserQuestion`): al terminar el chat, un enlace abre
  WhatsApp con la reserva YA REDACTADA (servicio, día, franja, nombre). `features/reserva_chat.feature`
  reescrito (v3): `@s22` restringido a la frontera con F-13 (disponibilidad/confirmación real), `@s23`
  (nuevo, `mensajeReserva` pura) y `@s24` (nuevo, el enlace "Enviar la reserva por WhatsApp" antes de
  "Reservar otra cita"). Diario: `progress/tdd_chat_whatsapp.md`. NO se marca `done` aquí.

### Lección de F-07 (verificación en vivo)

## Cierre de F-07 (para el siguiente, leer antes de abrir F-08)

- **F-07 estrenó la VERIFICACIÓN EN VIVO con Chrome** (extensión del humano) y se pagó sola: cazó que
  el titular salía en la fuente por defecto porque `hero.module.scss` no declaraba `font-family`
  («verde ≠ funciona», I-8). Se arregló DENTRO de F-07 (acceptance 7 / `@s17`, aprobado en la puerta):
  `.heroMarca` = Great Vibes + cursive, `.heroStudio` = Manrope + sans-serif. Re-verificado en vivo:
  `document.fonts.check` = true, LCP 136-216 ms, cero terceros. **Lección: para features de UI, una
  puerta unitaria + build NO sustituye a ver la página pintada en un navegador real.**

- **🎨 FOTOS REALES en Equipo y Galería — TDD VERDE (2026-07-21, `tdd_craftsman`), a la espera de
  `judge`/`mutation_tester` (no marcado `done`).** El lead ya seleccionó y commiteó 13 fotos de Pexels
  en `src/assets/trabajos/` (fotos de TRABAJOS, sin rostro identificable — licencia Pexels + LO
  1/1982); esta sesión solo las cablea. (A) `Equipo.tsx`: el monograma (inicial sobre rosa) se BORRA
  ENTERO (`inicialDe` de `equipo-logica.ts`, sus 4 tests, la regla `.monograma` del SCSS y su test) y
  cada una de las 7 tarjetas pasa a mostrar la foto real de su trabajo (`foto`+`alt` nuevos en
  `ProfesionalDemo`, `equipo-demo.ts`), 800×600 + `loading="lazy"`. `LEYENDA_EQUIPO` pasa a declarar
  también que las fotos son de banco de imágenes. `features/equipo_reservas.feature` @s7/@s8/@s26-@s31
  reescritos (el monograma se sustituye por las fotos). (B) `Galeria.tsx` (sin tests hasta hoy) gana
  las 6 fotos restantes + `src/components/galeria.test.tsx` nuevo (7 tests); NO se añade a
  `stryker.config.json` (instrucción del encargo). **76/76 verdes en los ficheros tocados, 946/946 en
  la suite completa (33 ficheros)**, typecheck 0, lint 0/0. `Reserva.tsx`/`reserva*`/`Contacto.tsx`/
  `home.tsx`/`stryker.config.json`/`feature_list.json` NO se tocaron (fuera de alcance). Diario:
  `progress/tdd_fotos_equipo_galeria.md`. 🟡 Pendiente: `pnpm build` (5 puertas) y mutación de
  `Equipo.tsx`/`equipo-logica.ts` los corre el lead al cierre.

- **✅ CIERRE DE SESIÓN — fotos + chat funcional + mutación (2026-07-21, verificado A MANO por el
  lead, NO fiado del informe de los agentes).** Los tres puntos que pidió Pablo, cerrados:
  1. **Fotos** (su punto 3). El lead buscó en Pexels, descargó y **MIRÓ una a una 24 candidatas**;
     descartó 4 por mostrar **rostros identificables**, otras por fondo turquesa/azul fuera de paleta,
     por navideña y por repetida. Quedaron **13** (7 equipo + 6 galería), 544 KB, ~42 KB de media.
     🔴 **Corrección a la bitácora anterior: el ZIP del prototipo NO trae caras de IA.** Las 11
     imágenes de `Opcion-1-Rosa` son placeholders grises con el literal «IMAGEN TEMPORAL» (por eso la
     puerta 2 prohíbe `ph-woman` Y ese literal). No había ninguna foto que reutilizar.
     🔴 **Por qué fotos de TRABAJOS y no retratos** (decisión con base legal, no estética): la
     licencia OFICIAL de Pexels (leída hoy, `https://www.pexels.com/license/`) dice *«Don't imply
     endorsement of your product by people or brands on the imagery»*. Una cara de banco en una
     tarjeta que dice «Lucía · Especialista en uñas» implica que esa persona trabaja aquí → va contra
     la licencia Y contra LO 1/1982. Con fotos de trabajo **el bloqueo de F-18 «para publicar» por
     imagen de terceros DECAE** (siguen bloqueando los nombres/reseñas de ejemplo, con su leyenda).
  2. **Chat funcional** (su punto 1). Pablo eligió por `AskUserQuestion` «que acabe abriendo
     WhatsApp». Un agente se NEGÓ citando @s22 del contrato; **hizo bien en pararse, pero el contrato
     lo había escrito otro agente esa misma mañana y la puerta humana es el humano**: se reabrió @s22
     y se implementó. `mensajeReserva()` PURA en `reserva-logica.ts` + CTA «Enviar la reserva por
     WhatsApp» con `waHref` de F-02.
  3. **Mutación de `#reserva`** (su punto 2): `Reserva.tsx` y `reserva-logica.ts` ENTRAN en `mutate`.
     Afloró **una línea muerta** (`setBorrador('')` redundante) que nadie había visto.
  - 🔴 **LA MUTACIÓN SE PAGÓ SOLA, OTRA VEZ.** Con typecheck 0, lint 0, 950/950 tests y las 5 puertas
    VERDES, la mutación destapó que meter las fotos (borrar el monograma y sus tests) había dejado
    **12 mutantes vivos**: 4 en `equipo-logica.ts` —se podía **VACIAR `'Monday'`/`'Friday'`… de
    `DIA_SEMANA`** sin que ningún test se enterara, y ese array traduce el día al horario de F-10— y
    8 en `Equipo.tsx` (el lead estimó 2 leyendo mal el informe; medidos eran 8). Los 12, cerrados.
  - **CIFRAS FINALES, medidas por el lead:** typecheck **0** · lint **0 errores / 0 warnings** ·
    `pnpm test` **956/956** (33 ficheros) · `pnpm build` **exit 0 con las 5 puertas** · mutación
    **100,00 %** en los CUATRO ficheros: `equipo-logica.ts` (38 muertos), `Equipo.tsx` (63),
    `reserva-logica.ts` (5), `Reserva.tsx` (97). **0 supervivientes.**
  - **1 exclusión NUEVA, revisada y aceptada por el lead** (3 en todo el repo): las deps `[]` del
    `useEffect` de `Equipo.tsx`. React compara las deps con `Object.is` elemento a elemento; un
    literal CONSTANTE (`[]` o `['Stryker was here']`) vale lo mismo en cada render → el efecto corre
    exactamente una vez al montar en AMBOS casos, y `Equipo` no tiene props con las que forzar otra
    cosa. Mutante EQUIVALENTE, no un test que falte. Verificado aplicando la mutación a mano.
  - **VERIFICACIÓN EN VIVO con Chrome** (la lección de F-07): las 13 imágenes cargan, natural 800×600,
    **pintadas 348×261 (4:3 exacto)**, 7 tarjetas, sección de 2637 px, todo `opacity:1`/`visible`.
    El **chat se condujo de punta a punta** (Uñas → Entre semana → Por la mañana → «Marta») y el CTA
    resultante es `wa.me/34625223366?text=Hola, quiero reservar: Uñas · Entre semana · Por la mañana.
    Me llamo Marta…` — los 4 datos y el número REAL. ⚠️ **El capturador de pantalla de Chrome devolvía
    fotogramas EN BLANCO** (y una vez timeout de CDP): NO era la página —se descartó midiendo el DOM—.
    Si alguien repite la verificación, que no confunda el bug del capturador con un fallo de la web.
  - 🟡 **Deuda viva:** (a) el chat sigue SIN decir en pantalla que es una demostración —ahora entrega
    la solicitud de verdad, así que el riesgo baja, pero la leyenda sigue sin escenario—; (b)
    `Galeria.tsx` tiene 7 tests pero NO está en `mutate`; (c) `features/galeria_carrusel.feature` @s24
    (galería ANTES de «Reserva rápida») quedó obsoleto al dejarla donde está; (d) `features/
    contacto.feature` @s11/@s12 reservan «Cómo llegar» a F-11 pero el botón YA existe en
    `Contacto.tsx`, sin test, desde antes de esta sesión; (e) los huecos de foto del CATÁLOGO siguen
    vacíos (Pablo no los marcó) y el catálogo sigue anunciando «Servicio facial» con precios, que el
    salón NO ofrece (deuda `progress/deuda_precios_catalogo.md`, Pablo pidió no tocarla).

## 2026-07-23 — features `22 — galeria_carrusel` y `12 — contacto` · **CERRADAS `done`**

- **Migración de entorno a mitad de sesión**: el trabajo del TDD (2026-07-22, checkout Windows) quedó
  SIN commitear y los agentes murieron con el entorno; se transfirió fielmente al checkout WSL
  (misma base `62df6ae`, 11 ficheros) y se reconstruyó el arnés nativo (`corepack enable`): la suite
  pasó de 9,3 min a **41 s** (~14×). Detalle en la memoria del proyecto (`entorno-dual-windows-wsl`).
- **`22 — galeria_carrusel`**: la galería «Nuestros trabajos» pasa de carril `scroll-snap` a
  **carrusel coverflow 3D en domo ∩** (decisiones de Pablo: domo, 4 s/foto, móvil suavizado).
  Contrato v2.2 con **19 escenarios** y DOS enmiendas: E1 (hallazgos de judge/a11y: @s19 arrastre,
  diana 24 px SC 2.5.8, `pointer-events: none` en la oculta, listener de reduced-motion EN CALIENTE)
  y E2 (bug MEDIDO en vivo). **148 tests** de galería. judge v1 RECHAZADO (4 cambios, todos anticipos
  de mutación) → v2 APROBADO → v3 delta APROBADO. a11y APTO (ratios reales 4,19–6,19:1). **Mutación
  100 %/100 %** (`galeria-logica.ts` + `Galeria.tsx`; 2 equivalentes verificados con exclusión
  documentada — 5 en todo el repo).
- 🔴 **EL BUG QUE SOLO LA VERIFICACIÓN EN VIVO PODÍA CAZAR** (la lección de F-07, otra vez): con los
  148 tests verdes y la mutación al 100 %, el arrastre @s19 **NO funcionaba en Chrome real** — un
  press+movimiento sobre una `<img>` arranca el **drag nativo de imagen** y el `pointerup` jamás
  llega al marco (espía CDP: solo se registró `pointerdown`). jsdom no puede verlo (los eventos
  fabricados no disparan el drag nativo). Contraprueba en caliente (`draggable=false` → el mismo
  gesto funciona) → Enmienda 2: `draggable={false}` en las 6 fotos + `touch-action: pan-y` en el
  marco (el equivalente táctil: sin él, el navegador reclama el gesto horizontal y dispara
  `pointercancel`). También cayó ahí el rediseño de `pasosDelArrastre` por signo (mutante 153:10).
- **VERIFICACIÓN EN VIVO** (Chrome real de Windows vía CDP desde WSL, red `mirrored`): **36/36** —
  domo medido en matrices computadas (ty −18→26→84→96, giros −34/−48/−52 saturantes, z-index 6..3),
  autoplay de 4 s cronometrado, pausa/Iniciar (SC 2.2.2), flechas con envoltura doble, puntos,
  clic-en-lateral, **arrastre físico en ambas direcciones + supresión del clic sintetizado + bajo
  umbral nada**, diana de 24 px medida, reduced-motion en frío Y en caliente, móvil 62vw con vecinas
  asomando, sin desborde a 375 px, **cero terceros** (92 peticiones, todas locales). Capturas
  escritorio/móvil inspeccionadas a ojo. ⚠️ 2 falsos rojos de la PROPIA sonda documentados para el
  siguiente: `scroll-behavior: smooth` global (usar `behavior: 'instant'` antes de medir coordenadas
  para gestos CDP) y `getBoundingClientRect` devuelve la caja YA transformada (usar `offsetWidth`).
- **`12 — contacto`**: cerrada la puerta de mutación que faltaba desde el 2026-07-19. Primera
  medición **90,59 %** con **8 supervivientes, todos matables** (2 mensajes de error mudos en
  `site.ts`; 6 de la capa demo post-judge en `Contacto.tsx`: el href de Maps VACÍO pasaba en
  silencio, el horario visible podía desaparecer entero, y 4 clases `demo-*`). Los 8 muertos con
  tests sin tocar producción → **100 %/100 %**. De paso queda ASEVERADO el horario visible
  (deuda de F-10) y el «Cómo llegar» de `Contacto.tsx` (deuda (d) del 21-jul).
- **Intendencia**: feature 22 registrada y especificada (`project-spec.md` §F22 + puerta humana en
  `feature_list.json`); `stryker.config.json` gana `ignorePatterns` (`.experimentos-tmp`,
  `.vite-react-ssg-temp`) tras un ENOENT medido con suites concurrentes; C2 restaurado (0 features
  `in_progress`). Diarios: `tdd_galeria_carrusel.md`, `judge_galeria_carrusel{,_v2}.md`,
  `a11y_galeria_carrusel.md`, `mutation_galeria_carrusel.md`, `mutation_contacto.md`,
  `tdd_contacto.md` (remate), `galeria_coverflow_diseno.md` (brief + enmiendas).
- **La primera corrida COMPLETA de mutación en semanas** (`bin/harness verify`, que nadie corría
  desde F-10) destapó **18 supervivientes huérfanos en features cerradas** (13+1 en `horario.ts`,
  4 en `Reserva.tsx`, 1 en `Equipo.tsx`) — idénticos en `main`, invisibles porque cada feature midió
  su mutación por-fichero y los estáticos «morían» por accidente vía timeouts de los tests build-based
  (excluidos de la mutación en F-12 por coste). Resolución (diario `tdd_deuda_mutacion_full.md`):
  **3 muertos con tests** (@s13 campo virgen y @s1 clases de Reserva, mismo patrón del remate de
  contacto), **2 por borrado de código muerto/inobservable en verde** (el brazo `[]` inerte de
  `Equipo.tsx`; la guarda del ref extraída a `desplazarAlFinal` en `reserva-logica.ts`, ejercitada
  por valor con `null` real), y **14 mutantes ESTÁTICOS de `horario.ts` con exclusión quirúrgica
  documentada** — límite medido del vitest-runner: la mutación rompería la CARGA del módulo y aun
  así «sobrevive a toda la suite» ⇒ nunca estuvo activa; el sabotaje a mano prueba que la suite
  muerde los 14. Decisión del lead: exclusión por línea (patrón HOST_WHATSAPP) y NO `ignoreStatic`
  global (apagaría estáticos legítimamente medidos en otros ficheros) NI aceptar la puerta roja.
  Corridas finales: `horario.ts` 100 % · `Reserva.tsx` 100 % · `reserva-logica.ts` 100 % ·
  `Equipo.tsx` 100 % — y `bin/harness verify` COMPLETO en verde como puerta de cierre.

## 2026-07-23 (tarde) — galería v3 + feature `14 — resenas_agregado_enlace` · **CERRADAS `done`**

- **Encargo directo de Pablo** (3 matices + sección nueva, 4 decisiones por `AskUserQuestion`):
  cadencia **2 s** con vuelta sin frenazo, **teclado ← →** «cuando el usuario está situado» ,
  **mandos integrados como círculos de cristal** (mockup elegido), y **carrusel de Reseñas** bajo
  «Nuestro equipo de profesionales» al mismo ritmo y con toda la conducta heredada.
- **El raíl legal mandó en Reseñas**: Pablo pidió «coger las reseñas de Treatwell» por ser
  públicas; la investigación [V] del repo (`legal-treatwell.md`, cl. 4.2/9.1 + TRLPI + RGPD)
  lo prohíbe y SE LE EXPLICÓ con las vías limpias. Eligió: **agregado real discreto**
  (4,9 · 1.239, medido en vivo, atribuido con enlace SUBRAYADO y fechado, dato tipado en
  `resenas-agregado.ts` sin estáticos) + **carrusel de testimonios propios de ejemplo** con
  leyenda 20.4 visible. Ni un texto de Treatwell en el árbol. Sin `aggregateRating` en el JSON-LD.
- **Galería v3** (contrato → 24 escenarios): @s20 reinicio del reloj tras acción manual (token de
  generación `{}` sin mutantes equivalentes), @s21-@s23 teclado global por visibilidad
  (IntersectionObserver GUARDADO — jsdom no lo trae), @s24 cristal por bytes. La constante de
  cadencia migró a `carrusel-logica.ts` (compartida, sin segunda copia).
- 🔴 **El bloqueante que cazó el judge del lote** (y el a11y en paralelo): la desambiguación del
  teclado entre los DOS carruseles era de mentira — dos listeners independientes con la distancia
  fabricada a 0; con foco en la galería y reseñas visible, una tecla movía AMBOS. Remate: 
  **coordinador compartido** en `carrusel-logica.ts` (registro de candidatas con medidas REALES
  del IO, arbitraje único, el foco excluye, limpieza al desmontar) → delta re-APROBADO y el caso
  verificado EN VIVO (sonda: `teclado-desambigua` y `teclado-foco-excluye`, verdes).
- **Puertas del lote**: judge lote (galería A / reseñas R→delta A) · a11y APTO (cristal 78→85 %
  por el peor caso 2,67:1; enlace subrayado; texto central ≥5,24:1) · mutación **100 % en los 6**
  (carrusel-logica 80/80 · galeria-logica · Galeria 123/123 · Resenas 113/113 · resenas-logica ·
  resenas-agregado 4/4 anti-estáticos verificado; 5 mutantes de espacios `{' '}` muertos con tests
  de línea completa; 2 equivalentes por construcción con exclusión ratificada) · build 5 puertas ·
  **verificación EN VIVO 50/50** con capturas inspeccionadas (galería con cristal + sección
  Reseñas completa).
- **Incidentes de proceso, declarados**: (a) dos lanzamientos del craftsman del remate no
  arrancaron (uno colgado real 2,5 h — matado; el otro matado por MI diagnóstico erróneo: el
  tamaño del transcript NO mide vida en turnos largos; la sonda de infraestructura respondió en
  4,7 s y el 3.er intento cerró limpio); (b) el mutation_tester borró sin querer el Ciclo v3 de
  `Galeria.tsx` con `git checkout --` y lo RECUPERÓ byte-exacto del source del informe de Stryker
  (validado independientemente: 197/197); (c) tercera variante del ENOENT de sandbox (por `dist/`)
  → `"dist"` añadido a `ignorePatterns` de stryker.config.json.

## 2026-07-23 (noche) — la caligrafía LENTA del hero (≈90 s) con el rótulo como control · CERRADA

- **Encargo de Pablo**: la firma «Nails Lash» iba «esquizofrénica» (3,6 s el trazo); pidió ≈10 s
  por letra → **90 s de caligrafía**, y probarla yo como usuario. Decidió además SIN NINGÚN botón
  visible — y a >5 s el mecanismo de parar es (N) SC 2.2.2 nivel A: conciliación comunicada y
  aplicada: **el rótulo ES el control** (botón transparente superpuesto, «Completar la firma»,
  cursor pointer, foco por el anillo global; cero cromo).
- **Diseño**: token único `--duracion-caligrafia: 90s` del que TODO deriva por `calc()` (tinta y
  aplicador en UN reloj, curva `linear`: a velocidad constante las letras complejas tardan más
  solas); `hero-logica.ts` nuevo con las decisiones puras. Invariantes de F-07 INTACTOS (h1, spans,
  text node, nombre accesible, base = estado final, cero terceros); F-07 NO se reabre (precedente
  de la reescritura demo).
- **Contrato** features/hero.feature: 14 → **17 escenarios** en dos enmiendas. La 2ª, salida de la
  auditoría a11y (APTO CON AVISOS, dictamen honesto del mecanismo sin cromo: «cumplimiento
  defendible», decisión del cliente documentada): **A-3** las animaciones arrancan SOLO al montar
  (clase de hidratación) ⇒ el mecanismo existe SIEMPRE que hay movimiento y sin JS el rótulo se ve
  COMPLETO y estático; **A-2** el foco se recoloca al desmontarse el botón (las tres vías);
  **A-5** reduce EN CALIENTE completa la firma y desmonta el control.
- **Puertas**: judge APROBADO (14/14, reloj único aseverado en ambas direcciones) + delta APROBADO
  (Enmienda 2) · mutación **100 %/100 %** (`hero-logica` 16/16; `Hero.tsx` 50/50 con 1 equivalente
  deps-[] ratificado — el anticipado por el diario, verificado por sabotaje con suite 1361/1361) ·
  build 5 puertas · **EN VIVO 13/13**: 90 000 ms exactos `linear` con delta de reloj 0 ms,
  fotogramas inspeccionados a ojo (t=5 s el rizo de la N; t=45 s «Nails» justo acabado; t=90 s
  firma completa), ritmo real medido (6 016 ms de avance en 6 s), clic y Enter completan, sin JS
  estático completo, reduce en caliente, **LCP 148 ms** (el titular sigue sin ser el elemento LCP),
  cero terceros.
- **Ajuste final del ritmo (2026-07-24)**: Pablo vio los 90 s en su navegador y pidió probar 30; el
  lead montó un BANCO DE VIVENCIAS (token pisado en caliente por CDP, sin tocar código: cualquier
  duración se ve en tiempo real con fotogramas en ~3 min) y el veredicto UI/UX coincidió — a 90 s
  la pluma parecía casi quieta; a 30 s (≈3,3 s/letra) siempre hay movimiento visible y sigue siendo
  ceremonial. Enmienda 3 del contrato + micro-ciclo (los DOS valores del diseño de token único),
  mutación 100 %/100 %, 30 000 ms exactos medidos en el build real. El banco queda en el scratchpad
  de la sesión (vivencia-hero.mjs) para futuros ajustes de ritmo.
  Iteración 2 del banco (2026-07-24): Pablo pidió probar 15 s; vivido en tiempo real por el lead
  (a 15 s ≈1,7 s/letra la pluma se ve escribir con claridad Y la mayoría de visitantes ve la firma
  completarse — el punto dulce frente al 30, más ceremonial pero cuyo final pocos veían). Enmienda 4
  + micro-ciclo con sabotaje del espejo, mutación 100 %/100 %, 15 000 ms exactos en el build real.
- **Incidente de herramienta, declarado**: el WebSocket nativo de Node (undici) contra el CDP
  murió repetidas veces en corridas largas con muchas capturas; el remedio fue trocear la sonda en
  sesiones cortas (mini-sonda para los 4 checks finales) y hacer ATÓMICOS los pares espera+acción
  (una espera y su clic en evaluaciones separadas pueden caer en documentos distintos al navegar).
