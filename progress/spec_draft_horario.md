# Borrador de spec — F-10 `horario`

> Feature `#10` de `feature_list.json`. Depende de F-02 (`datos_negocio_fuente_unica`, `done`).
> **DELEGADA**: Pablo aprueba el contrato en la puerta del `.feature`. Este borrador llega con
> todo resuelto y una recomendación por decisión abierta (ver **DECISIONES PARA LA PUERTA**).
> Objetivo AHORA: **prototipo DEMO con datos placeholder** — se CONSTRUYE con el horario
> semanal verificado; las **excepciones** (festivos, agosto) van **vacías** hasta que el cliente
> las confirme (`bloqueada_para_publicar`).

## Propósito

Convertir el horario del salón —hoy guardado como **dato** en `src/lib/site.ts` (F-02)— en
**comportamiento**: una capa **pura** que decide si está abierto en un instante dado, lo
**presenta** para la UI y lo emite como **`openingHoursSpecification`** (schema.org) coherente
con el JSON-LD de F-04. Modelado como **dato**, no como copy, porque tendrá **excepciones**
(festivos, cierre de agosto) que deben poder cambiar **sin tocar el copy** ni el código de vista.

## Por qué va aquí (y qué la hace difícil)

1. **Es la primera lógica de tiempo del repo.** Aplica el patrón de memoria repetido en el
   proyecto (y en el acceptance de F-13): la lógica de tiempo es **PURA** y recibe el **reloj
   inyectado**, **nunca llama a `new Date()`**. Igual que `generarDias(ahora, tz, festivos)` de
   F-13, que además **depende de F-10**: el `estaAbierto`/franjas que se diseñe aquí es el
   cimiento de la reserva por WhatsApp.
2. **El reloj y la zona son dos trampas distintas.** Un `Date` es un **instante** (epoch UTC),
   no una hora de pared. Decidir "abierto" exige convertir ese instante a la **hora local de
   Europe/Madrid** (día de la semana + hora:minuto), y hacerlo con `Intl` para que el **DST**
   (CET/CEST) lo resuelva la plataforma, no una resta de offset a mano. La zona del navegador
   del visitante es **irrelevante**: el instante es agnóstico a la zona y la conversión a Madrid
   vive **dentro** de la función.
3. **El SSG hornea el instante del build.** Un badge "Abierto ahora" horneado diría "Abierto"
   para siempre con la hora en que corrió el build → **mentira**. Y un badge que solo se calcula
   tras hidratar es justo la **rama-solo-JS-en-SSG** que la memoria del repo prohíbe. Por eso el
   **qué se renderiza** es una decisión de producto (D1), separada de **construir y testear**
   `estaAbierto` (que su consumidor real es F-13).

## Alcance — qué es F-10 y qué no

- **Entra (lógica pura, con TDD y mutación):** `estaAbierto(ahora)`, el **modelo estructurado**
  del horario semanal derivado de F-02, el **parseo** de las franjas, la **presentación** para la
  UI y el constructor de **`openingHoursSpecification`**. Vive en `src/lib/horario.ts` (+ su test
  co-locado). Es el único fichero de la lista `mutate` que aporta F-10.
- **No entra / no se reabre:** `src/lib/site.ts` (F-02, `done`) **no cambia de forma**: F-10 lo
  **lee** y **parsea**, no lo reescribe (D3). El artefacto que emite el JSON-LD ya existe (F-04);
  F-10 solo **añade** la propiedad `openingHoursSpecification` a esa emisión (D4), que F-04 dejó
  **reservada** (`seo.ts` §183: *"horario → A-19: es de F-10. Cuando entre, openingHoursSpecification (@s35)"*).
- **No se inventa:** los **festivos** y el **cierre de agosto** NO se escriben. Para la DEMO la
  lista de excepciones va **vacía** (estado honesto: no se anuncia ningún cierre especial). Es la
  parte `bloqueada_para_publicar` (D5).

## Comportamiento esperado

1. **`src/lib/horario.ts`** expone la lógica; **no** duplica el dato: el horario semanal se
   **deriva** de `HORARIO` de `site.ts` (F-02), que es `{ lunesAViernes: '10:00-20:00',
   sabado: '10:00-14:00', domingo: 'cerrado' }` **[V, triple fuente]**.
2. **Modelo estructurado (dato, no copy):** un horario semanal = para cada uno de los 7 días,
   una lista de **franjas** `{ abre, cierra }` en minutos-desde-medianoche (Europe/Madrid).
   L-V → `[{600, 1200}]` (10:00–20:00); Sábado → `[{600, 840}]` (10:00–14:00); Domingo → `[]`
   (**lista vacía = cerrado**; el "Cerrado" es copy derivado, no un valor guardado).
3. **`estaAbierto(ahora)`** es **puro** y **determinista**: mismo `Date` → mismo booleano. No
   llama a `new Date()`, no lee el reloj, ni ficheros, ni entorno. Convierte `ahora` a la hora de
   pared de **Europe/Madrid** (día + minutos del día) con `Intl` (DST incluido) y devuelve `true`
   si y solo si esos minutos caen en **alguna** franja del día según el intervalo **semiabierto**
   `[abre, cierra)` (D2). Antes de mirar el día de la semana, **consulta las excepciones**: si la
   fecha coincide con una excepción, mandan las franjas de esa excepción (posiblemente vacías =
   cerrado ese día), sin tocar el horario semanal ni el copy.
4. **Presentación (`horarioParaUI`)**: proyecta el modelo a filas para la vista, en **castellano**,
   **3 filas** que reflejan las 3 claves de F-02: `Lunes a Viernes → 10:00–20:00`,
   `Sábado → 10:00–14:00`, `Domingo → Cerrado`. El copy ("Cerrado", el separador) vive en esta
   capa, no en el dato (acceptance 3).
5. **`openingHoursSpecification`**: array de objetos `OpeningHoursSpecification` de schema.org,
   con `dayOfWeek` en la **enumeración inglesa** de schema.org, agrupando L-V y con el Sábado
   solo; el Domingo (cerrado) **se omite** (D4). Se emite en el JSON-LD de F-04 y **jamás** como
   la clave `openingHours` (la puerta de F-04 ya rompe el build si aparece `openingHours`).

## Contrato (firmas puras)

| | |
| - | - |
| **`estaAbierto(ahora: Date): boolean`** | **Entrada:** un instante (`Date`, epoch UTC). **Salida:** `true` sii la hora de pared correspondiente en **Europe/Madrid** cae en `[abre, cierra)` de alguna franja del día (excepciones primero, luego semanal). **Puro**, determinista, DST-safe vía `Intl`. **No** invoca `new Date()`. Liga el horario semanal canónico (de F-02) y la lista de excepciones **vacía** de la DEMO |
| **núcleo puro** `abiertoEn(instanteMadrid, horarioSemanal, excepciones): boolean` | El motor testeable con horarios y excepciones **arbitrarios** (pasados como argumento). `estaAbierto` es el fino ligador sobre él. Necesario para **ejercitar y mutar la rama de excepciones sin inventar festivos** en producción (ver Casos límite y D5) |
| **`parsearFranjas(texto: string): Franja[]`** | **Entrada:** una cadena de F-02 (`'10:00-20:00'`, `'cerrado'`). **Salida:** `[{abre, cierra}]` o `[]` para `'cerrado'`. **Puro**. Traduce el dato-string de F-02 al modelo en minutos |
| **`aMinutos(hhmm: string): number`** | `'10:00' → 600`, `'20:00' → 1200`, `'14:00' → 840`. `hora*60 + minuto`. **Puro** |
| **`horarioParaUI(horarioSemanal): FilaHorario[]`** | 3 filas `{ dias, franja }` en castellano; franjas vacías → `'Cerrado'`. **Puro**. El copy vive aquí |
| **`openingHoursSpecification(horarioSemanal): OpeningHoursSpecification[]`** | El array schema.org: `dayOfWeek` (enum EN, L-V agrupado), `opens`/`closes` `'HH:MM'`, `@type: 'OpeningHoursSpecification'`; días cerrados omitidos. **Puro**. Se inyecta en el JSON-LD de F-04 |
| **Zona** | **Europe/Madrid** SIEMPRE, vía `Intl.DateTimeFormat`. Nunca la zona de la máquina/navegador. El DST lo resuelve `Intl` |
| **Determinismo** | Todo puro. Ningún acceso a reloj/fs/entorno. El reloj se **inyecta** como `Date` |

**Modelo de datos (tipos):**

- `Franja = { readonly abre: number; readonly cierra: number }` — minutos desde medianoche, hora
  de pared Europe/Madrid, intervalo semiabierto `[abre, cierra)`.
- `HorarioSemanal` — proyección de los 7 días a `Franja[]` (0 franjas = cerrado). Derivado de
  `HORARIO` de F-02: L-V se expande a los cinco días laborables.
- `ExcepcionHorario = { readonly fecha: 'YYYY-MM-DD'; readonly franjas: Franja[] }` — override por
  fecha concreta (Madrid). `franjas: []` = cerrado ese día. Para la DEMO la lista global de
  excepciones es **`[]`** (ver Placeholder vs verificado).

## Casos límite (para el TDD y la mutación)

Intervalo **semiabierto `[abre, cierra)`**: la apertura es **inclusiva**, el cierre **exclusivo**
(D2). Los tests fijan instantes `Date` reales que caen en la hora de pared de Madrid indicada
(anclados a **literales escritos a mano** —10:00, 20:00, 14:00—, nunca a la constante importada de
producción; regla anti-tautología del repo):

| Instante (hora de pared Madrid) | Esperado | Qué mutante mata |
| - | - | - |
| Lunes **09:59** | **cerrado** | comparador de apertura `minutos >= abre` (mutar a `>` → 09:59 seguiría cerrado pero 10:00 caería) |
| Lunes **10:00** exacto | **abierto** | apertura **inclusiva**: mutar `>=` → `>` lo rompe |
| Lunes **19:59** | **abierto** | — |
| Lunes **20:00** exacto | **cerrado** | cierre **exclusivo**: mutar `minutos < cierra` → `<=` lo rompe |
| Lunes **20:01** | **cerrado** | límite de la franja |
| Lunes **00:00** | **cerrado** | fuera de toda franja |
| Sábado **13:59** | **abierto** | franja corta del sábado |
| Sábado **14:00** exacto | **cerrado** | límite del sábado (10:00–**14:00**); mutar el `840` lo rompe |
| Sábado **14:30** | **cerrado** | — |
| Domingo (cualquier hora) | **cerrado** | día sin franjas (`[]`); mutar la lista vacía lo rompe |
| **Excepción** con `franjas: []` en una fecha que sería laborable, **10:30** | **cerrado** | la excepción **manda** sobre el semanal (rama de excepciones) |
| **Excepción** con franjas propias en un **domingo** | **abierto en esa franja** | la excepción **abre** un día normalmente cerrado |

**Notas de mutación (umbral 1.0, 0 exclusiones — política del repo desde F-03):**

- Objetivo de `mutate` de F-10 = **`src/lib/horario.ts`** (comparadores, aritmética de minutos,
  parseo, presentación, builder schema.org). Añadirlo a `stryker.config.json` **y** a
  `coverage.include` de `vitest.config.ts` (son dos listas).
- Los **valores límite** (10:00/20:00/14:00) viven como strings en `site.ts` y ya los **fijan los
  tests de F-02** (los `registros`); además F-10 los guarda **por comportamiento** (los casos de
  arriba), así que mutar el efecto de un límite rompe un test de F-10.
- La **rama de excepciones** se ejercita y muta a través del núcleo puro `abiertoEn(...)` con
  excepciones **pasadas por el test** (hechas a mano), no con la lista vacía de producción: así la
  rama **no es código muerto** (Ley 1) ni mutante inmortal, y producción **no inventa** festivos.
- Un caso **DST** barato: un instante en CET y otro en CEST que caigan a la misma hora de pared →
  ambos deben dar el mismo resultado (prueba que la conversión usa `Intl`/Madrid, no un offset
  fijo). Si algún mutante de conversión sobrevive, se **amplía el contrato**, no se excluye.

## Modelo de datos + excepciones (el corazón de la feature)

El horario **NO** es copy: es dato. Tres capas separadas:

1. **Fuente única (F-02):** las cadenas `HORARIO` en `site.ts`. F-10 **no las duplica**: las lee.
2. **Modelo semanal (F-10):** `HorarioSemanal` derivado por `parsearFranjas`, en minutos. Es lo
   que consumen `estaAbierto`, `horarioParaUI` y `openingHoursSpecification`.
3. **Excepciones (F-10):** `ExcepcionHorario[]`. **Overrides por fecha** que se consultan **antes**
   que el semanal. Cambiar un festivo = añadir/editar una entrada en esta lista; **no** se toca ni
   el copy, ni `estaAbierto`, ni la vista (acceptance 3). Para la DEMO: **`[]`**.

Un festivo se modela como `{ fecha: '2026-01-01', franjas: [] }` (cerrado) y una jornada especial
como `{ fecha: '...', franjas: [{abre, cierra}] }`. **Estos ejemplos son ilustrativos del modelo;
NO se escribe ninguna fecha real en producción** hasta la confirmación del cliente.

## Placeholder vs verificado (qué se puede publicar)

- **VERIFICADO [V] — se construye y se podría publicar:** el horario semanal **L-V 10:00-20:00,
  S 10:00-14:00, D cerrado** (triple fuente, F-02 §2). `estaAbierto`, la presentación y el
  `openingHoursSpecification` sobre este dato son correctos hoy.
- **PLACEHOLDER / `bloqueada_para_publicar` — se construye vacío, NO se publica como verdad
  completa:** las **excepciones** (festivos, cierre de agosto) "no están verificadas con el salón".
  Para la DEMO la lista es **`[]`**, que es un estado **honesto**: la web muestra el horario
  regular y **no anuncia** ningún cierre especial (no afirma nada falso). El bloqueo de publicación
  es que, sin las excepciones reales, la web diría "Abierto" un 15 de agosto o un 1 de enero si ese
  día el salón cierra. → Antes de publicar, el cliente confirma festivos + agosto y se **rellena la
  lista** (sin tocar código de vista).

## DECISIONES PARA LA PUERTA (preguntas abiertas + recomendación)

**D1 — ¿La DEMO muestra un indicador "Abierto/Cerrado ahora", o solo el horario semanal?**
Recomiendo: **solo el horario semanal** en la DEMO. Se **construye y testea** `estaAbierto` (puro,
para F-13), pero **no se renderiza** un badge en vivo. Razón: bajo SSG un badge horneado es una
**mentira** (congela el instante del build) y uno que solo aparece tras hidratar es la
**rama-solo-JS-en-SSG** que la memoria del repo prohíbe (misma familia que el "horneado invisible"
que cazó F-07). El consumidor real de `estaAbierto` es F-13 (franjas de reserva). *Alternativa:* un
badge en vivo como **isla client-only** (no horneada, con estado neutro en el prerender), que sería
una mejora **posterior** y cuidada, no parte de la DEMO de F-10.

**D2 — Intervalo de las franjas: ¿`[abre, cierra)` semiabierto (10:00 abierto, 20:00 cerrado)?**
Recomiendo: **sí**, semiabierto. "Cierra a las 20:00" significa cerrado a las 20:00:00; y da dos
comparadores limpios que la mutación distingue (apertura `>=`, cierre `<`). *Alternativa
descartada:* cerrado-cerrado `[abre, cierra]` (20:00 aún "abierto") — contradice el sentido de
"cierre" y ensucia el límite.

**D3 — ¿F-10 reabre `site.ts` para estructurar el horario, o lo lee y parsea?**
Recomiendo: **lo lee y parsea**. F-10 deriva su `HorarioSemanal` de las cadenas `HORARIO` de F-02;
`site.ts` **no cambia de forma**. Mantiene la **fuente única** (I-7) y respeta "una feature a la
vez" + "no reabrir un módulo `done`". *Alternativa descartada:* subir `HORARIO` en `site.ts` a
estructura y derivar las cadenas — reabre F-02 (rompe sus `registros`/tests) por comodidad, y
duplicar el dato en un constante propia de F-10 es justo la divergencia que I-7 existe para evitar.

**D4 — `openingHoursSpecification`: ¿extender el JSON-LD de F-04 o componer aparte? ¿Formato?**
Recomiendo: F-10 aporta la función pura `openingHoursSpecification(horario)` y se **añade la
propiedad al JSON-LD** que emite F-04 (extensión **aditiva**: F-04 la dejó **reservada** —A-19,
@s35— y su puerta ya valida que sea esta clave y **nunca** `openingHours`). Formato: `dayOfWeek`
en la **enumeración inglesa** de schema.org (`Monday`…`Saturday`; el copy español vive solo en la
UI, D6), L-V **agrupado** en un array, Sábado solo, **Domingo omitido** (cerrado). *Alternativa:*
representar el cerrado con `opens===closes` — descartada por ruidosa; omitir es lo idiomático.

**D5 — Excepciones en la DEMO: ¿lista vacía honesta, o marcador placeholder que rompa F-01?**
Recomiendo: **lista vacía**. Es honesta (no anuncia cierres, no afirma nada falso), así que **no
hay string inventado** que la puerta de F-01 deba cazar; **inventar** un festivo solo para
disparar F-01 sería inventar dato (prohibido). El bloqueo de publicación queda como **puerta
manual documentada** (`bloqueada_para_publicar`), no mecánica. **Pregunta para Pablo:** ¿te vale
esa puerta manual, o quieres un marcador mecánico (p. ej. un flag `excepcionesConfirmadas:false`
que un test de despliegue vigile)? Recomiendo la manual para la DEMO; el flag mecánico se puede
añadir el día que exista el dato real. Nota de diseño: la **rama** de excepciones se testea/muta
igual, vía el núcleo puro con excepciones a mano (no queda código muerto).

**D6 — Presentación: ¿3 filas fijas (L-V / S / D) o agrupación dinámica de días iguales? Copy.**
Recomiendo: **3 filas fijas** que reflejan las 3 claves de F-02 (menos superficie de mutación, sin
lógica de agrupación que pruebe de más). Copy propuesto: `Lunes a Viernes` · `Sábado` · `Domingo`;
franja `10:00–20:00` (guion largo); cerrado → `Cerrado`. *Confirmar el copy exacto y el separador.*

**D7 — Tipo de retorno de `estaAbierto`: ¿booleano, o estado rico ("abre a las 10:00")?**
Recomiendo: **booleano** para F-10 (mínimo, cumple el acceptance 1). Un estado rico ("abre en 2 h",
"cierra a las 20:00") es alcance de una mejora posterior / linda con F-13; no lo meto en la DEMO.

**D8 (nota, no bloqueante) — DST.** La conversión a Europe/Madrid se hace con `Intl`, que resuelve
CET/CEST; **no** se resta un offset fijo. Se añade un caso de test que cruce el cambio de hora.

---

**Pendiente de la puerta humana:** D1 (badge sí/no), D5 (puerta manual vs marcador mecánico) y el
copy de D6 son las tres que quiero que Pablo confirme; el resto llevan recomendación firme y
alternativa descartada.
