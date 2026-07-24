# Review — Retiro 1 (botón flotante de WhatsApp) + Retiro 2 (controles del carrusel, ENMIENDA 4)

> `judge`, 2026-07-24, rama `feature/last_fixes`. Sesión NO es una feature nueva: dos limpiezas que
> sincronizan `src/`+tests+contrato Gherkin con dos ediciones manuales de Pablo fuera del ciclo TDD
> (commits `479d541` y `9cf32a9`). Verificación independiente de este judge: `bin/harness init` →
> **VERDE** (`tsc --noEmit` 0, `eslint .` 0, `vitest run` **1299/1299 tests, 39 ficheros**, 163 s).
> Diarios: `progress/tdd_boton_whatsapp_retiro.md`, `progress/tdd_carrusel_enmienda4.md`,
> `progress/enmienda4_carrusel_sc222.md`.

**Veredicto Retiro 1 (botón flotante de WhatsApp): APPROVED**
**Veredicto Retiro 2 (controles del carrusel, ENMIENDA 4): CHANGES_REQUESTED**

---

## RETIRO 1 — botón flotante de WhatsApp

### Cobertura / naturaleza del cambio
No es una feature con `@s` vigentes: `features/boton_whatsapp_flotante.feature` nunca cruzó la
puerta humana (su propio encabezado histórico: «Estado: PROPUESTA hasta la puerta humana», sin
entrada en `feature_list.json`). Verificado: la id 13 (`solicitud_whatsapp`) sigue `"status":
"pending"` intacta (`feature_list.json:295`) — no hay contrato vivo cuya cobertura evaluar aquí. Lo
que este judge revisa es que el borrado sea completo y honesto.

### (a) Referencias rotas o huérfanas a `BotonWhatsApp`/`boton-whatsapp` en `src/`
Grep propio sobre `src/**/*.{ts,tsx,scss}` (case-insensitive): cero imports, cero símbolos, cero
ficheros huérfanos. `src/pages/home.tsx` ya no importa `BotonWhatsApp` (diff confirmado: solo se
retira esa línea, nada más del fichero se toca). Los 3 tests huérfanos y el `.module.scss` están
borrados y no quedan referenciados por ningún import vivo.

Sí quedan tres COMENTARIOS (prosa, no código; no rompen compilación ni tests) que citan artefactos ya
borrados de esta rebanada:
- `src/components/galeria.test.tsx:1120` — cita `boton-whatsapp-montaje.test.tsx` como el fichero que
  "también vigila" que la galería siga dentro de `<main>`. Ese fichero ya no existe.
- `features/galeria_carrusel.feature:241` — mismo patrón, en la nota de @s2 de OTRO contrato: "Que la
  galería siga dentro de `<main>` lo vigila `boton-whatsapp-montaje.test.tsx:50-63`."
- `src/lib/demo/reserva-demo.ts:4` — docblock que sigue nombrando `BOTON_WHATSAPP_FLOTANTE_TEXTO`
  ("para que los TRES puntos de entrada... sean DISTINGUIBLES") como si la constante existiera.

Los dos primeros ya estaban reconocidos como deuda menor en `progress/tdd_boton_whatsapp_retiro.md`
(sección "Deuda menor detectada, NO tocada") solo para el primero; el segundo (dentro de
`galeria_carrusel.feature`) y el tercero son hallazgos nuevos de esta revisión. Ninguno es
bloqueante: son comentarios/prosa, no imports ni aserciones.

### (b) Honestidad de la nota RETIRADA
`features/boton_whatsapp_flotante.feature:1-6` es honesta y no borra el registro histórico: dice
explícitamente que la propuesta "NUNCA cruzó la puerta humana", cita el motivo (Pablo eliminó el
componente que la habría implementado, commit `479d541`) y conserva el contrato íntegro debajo del
banner. No hay ninguna frase que finja que el botón sigue vigente.

### (c) `src/lib/demo/contacto-demo.ts` tras quitar la constante
Coherente: queda un único export (`CONTACTO_WHATSAPP_TEXTO`), su docblock (líneas 1-5) no menciona ya
`BOTON_WHATSAPP_FLOTANTE_TEXTO`, y no hay exports huérfanos ni referencias rotas al bloque borrado.

### Disciplina TDD
- ¿Producción sin test que la pida? NO — es retirado puro (borrar código/tests/constantes muertas),
  no se añade producción nueva.
- ¿Evidencia de Rojo→Verde→Refactor? No aplica (no es ciclo TDD: es limpieza mecánica declarada como
  tal en el propio diario, con verificación previa por grep de "cero consumidores" antes de borrar).

### Calidad
- `src/pages/home.tsx`: un solo `import` retirado, nada más tocado — cambio mínimo y quirúrgico.
- `src/lib/demo/contacto-demo.ts`: docblock y export coherentes tras el borrado (arriba).
- Verificación cruzada del propio autor documentada en el diario (typecheck/lint/test acotados a
  esta rebanada; `pnpm exec vitest run src/pages/home.test.tsx src/lib/demo` → 2/2 ficheros, 9/9
  tests).

### Hallazgos
- **[Menor]** `src/components/galeria.test.tsx:1120` — comentario cita un fichero de test borrado
  (`boton-whatsapp-montaje.test.tsx`). No rompe nada; pulir el comentario si se vuelve a tocar ese
  bloque.
- **[Menor]** `features/galeria_carrusel.feature:241` — mismo patrón: la nota de @s2 cita el mismo
  fichero borrado como si vigilase el `<main>`.
- **[Menor]** `src/lib/demo/reserva-demo.ts:4` — docblock nombra una constante que ya no existe
  (`BOTON_WHATSAPP_FLOTANTE_TEXTO`). Ya reconocido como deuda por el propio autor; no bloquea.

Ninguno de los tres hallazgos afecta comportamiento, tests ni cobertura: son prosa desactualizada.
Por eso el veredicto es **APPROVED** pese a los tres menores.

### Checkpoints (Retiro 1)
- C1: [x] `bin/harness init` verde.
- C2: [x] estado coherente — F-13 sigue `pending` intacta, no se tocó su `status`.
- C3: [x] sin dependencias nuevas, sin código muerto residual en `src/` (grep limpio).
- C4: [x] la suite pasa completa (1299/1299); no aplica "test por módulo nuevo" porque no hay módulo
  nuevo, solo borrado.
- C6: no aplica (sin contrato `sdd` vivo para esta rebanada).

---

## RETIRO 2 — controles del carrusel (ENMIENDA 4)

### Cobertura de escenarios (@s ↔ test), contrato AMENDADO
Contraste hecho leyendo `features/galeria_carrusel.feature` (866 líneas) contra el Then/And EXACTO
de cada escenario amendado y el/los `it(...)` reales en `galeria.test.tsx` / `resenas.test.tsx` (no
contra el diario del `tdd_craftsman`, que solo se usó como mapa de arranque).

- @s2 (AJUSTADO): [x] `galeria.test.tsx:1091-1105` — `queryByRole('button', {name:'Anterior'})` y
  `'Siguiente'` con `.toBeNull()`, misma precisión que antes exigía su existencia. Coincide con
  `.feature:234`. Reseñas no necesita espejo: el And de las flechas nunca formó parte del Then que
  `resenas_agregado_enlace.feature` @s8 promete heredar (ni antes ni después de la ENMIENDA 4).
- @s6 (AJUSTADO): [x] `galeria.test.tsx:171-223` — conserva `role=group`, `aria-roledescription`,
  `aria-labelledby`, las 6 diapositivas sin `aria-hidden` y el orden del DOM; el And de
  `aria-controls` de las flechas NO aparece en ningún `it` vivo (grep de `aria-controls` en ambos
  ficheros de test: cero apariciones fuera del comentario histórico `.feature:331`). Espejo en
  `resenas.test.tsx:382-424`.
- @s7 (CONFIRMADO, mecanismo de test ajustado): [x] `galeria.test.tsx:476-495` — la fila
  "rotando=no,foco=no" se alcanza con `fireEvent.mouseEnter(carruselDe(container))`, no con el botón
  retirado; el Then (`aria-live`) no cambió. Espejo `resenas.test.tsx:676-695`.
- @s9 (CONFIRMADO sin cambio): [x] `galeria.test.tsx:496-530`. Espejo `resenas.test.tsx:696-734`.
- @s10 (AJUSTADO): [x] `galeria.test.tsx:634-669` — fila del ratón reanuda sola
  (`mouseEnter`/`mouseLeave`), fila del foco es "pegajosa PERMANENTE" (`focus`/`blur`, posado en un
  punto indicador, no en "Siguiente"); el Then no cambia, solo el elemento que recibe el foco. Espejo
  `resenas.test.tsx:814-849`.
- @s12 (AJUSTADO): [x] `galeria.test.tsx:672-813` — 8 tests: arranca pausado (705), diapositivas
  presentes (715), "YA NO EXISTE ninguna forma de arrancar" con reloj a 12000 ms tras un
  desplazamiento manual (729-744), sin preferencia rota (746), activar en caliente pausa en curso
  (758), desactivar NO pausa una en curso (773), "no reanuda nada: la pausa es DEFINITIVA por
  NINGUNA vía" (786-797), limpieza del listener (799). Ningún `it` menciona ya el nombre accesible
  del control retirado. Espejo `resenas.test.tsx:850-961`.
- @s20 (AJUSTADO): [x] `galeria.test.tsx:531-631` — el `When` usa el punto indicador «Ver la foto 2
  de 6» en vez del botón «Siguiente» retirado; la fila final usa un `matchMedia` que fuerza
  `prefers-reduced-motion` en vez de "parado por el usuario" (el mecanismo que retiró @s16). Espejo
  `resenas.test.tsx:735-813`.
- @s23 (AJUSTADO): [x] `galeria.test.tsx:832-1029` — el foco se posa sobre un punto indicador («Ver
  la foto 1 de 6»), no sobre «Siguiente»; el resto (preventDefault solo al atender, IO guardado,
  limpieza) no depende de los controles retirados. Espejo `resenas.test.tsx:980-1063,1064-`.

@s8 / @s11 / @s16 / @s24 — RETIRADOS, confirmado sin fugas. Grep de `alternarRotacion`,
`claveDeRotacion`, `etiquetaDeRotacion` en TODO `src/`: cero resultados (ni producción ni test). Grep
de los literales `Anterior`, `Siguiente`, "Iniciar la reproducción", "Parar la reproducción",
`data-estado`, `aria-pressed`, `mandos` en `galeria.test.tsx` y `resenas.test.tsx`: las únicas
apariciones vivas son la aserción de AUSENCIA de @s2 (arriba) y comentarios explícitamente marcados
`[RETIRADO ENMIENDA 4]`/`[ENMIENDA 4]`. Ningún test de otro escenario usa esos controles como atajo
(ningún `getByRole('button', {name:'Siguiente'})` sobrevive en el árbol vivo). La convivencia de los
dos carruseles (`resenas.test.tsx:1362-1399`) retiró correctamente el And "DOS Anterior, DOS
Siguiente, DOS controles de rotación" y lo sustituyó por lo que sigue siendo cierto (ningún id
compartido + grupos de puntos con nombre propio), sin dejar un hueco de cobertura: ese And retirado
nunca fue el ÚNICO test del hecho que lo sustituye.

### Disciplina TDD
- ¿Evidencia de Rojo→Verde→Refactor? SÍ — el diario documenta el punto de partida en rojo (30/90 y
  27/107 tests fallando por controles inexistentes, `progress/tdd_carrusel_enmienda4.md:16-20`) y el
  cierre en verde por fichero, escenario a escenario.
- ¿Producción sin test que la pida? SÍ — un caso, y es serio. Ver hallazgo BLOQUEANTE abajo.

### Calidad
- La retirada de `alternarRotacion`/`claveDeRotacion`/`etiquetaDeRotacion` es limpia, completa y
  simétrica en los dos componentes y en `galeria-logica.ts` (diff revisado línea por línea: imports,
  la función, el describe de test dedicado — todo fuera, nada a medias).
- Los tests AJUSTADOS no mienten: cada uno fue releído contra el Then/And exacto del `.feature`
  amendado (tabla arriba) y coincide literalmente, incluidos los matices "PERMANENTE"/"DEFINITIVA
  por NINGUNA vía" que distinguen el comportamiento anterior del actual.
- `features/galeria_carrusel.feature` (bloque ENMIENDA 4, líneas 1-192) es honesto y sin
  atenuantes: declara explícitamente que SC 2.2.2 YA NO se cumple para ratón/táctil sin teclado,
  cita la respuesta literal de Pablo, y la "LEYENDA DE ATRIBUCIÓN" (líneas 126-152) prohíbe
  expresamente citar SC 2.2.2 como cumplido desde esta fecha. No queda ninguna frase residual que
  afirme cumplimiento sin matizar.

#### [BLOQUEANTE] arranqueExplicito es dead state que ningún test exige, y sobrevivió a la MISMA poda que sí se aplicó a alternarRotacion
`Galeria.tsx:101,117,281` y `Resenas.tsx:82,96,251`: el estado `arranqueExplicito`
(`useState(false)`) se sigue declarando, se sigue pasando a `debeRotar(...)`, y `entra()` lo sigue
reseteando a `false`. Pero su ÚNICO setter con valor `true` vivía dentro de `alternarRotacion` — la
función que este mismo retiro borró por "código MUERTO: sin llamador"
(`progress/tdd_carrusel_enmienda4.md:24-26`). Grep confirmado: `setArranqueExplicito` tiene
EXACTAMENTE 2 llamadas en todo `src/` (`Galeria.tsx:281`, `Resenas.tsx:251`), las dos con literal
`false`. Ningún test — ni de `galeria.test.tsx` ni de `resenas.test.tsx` — puede hacer que la rama
`if (estado.arranqueExplicito) return true` de `debeRotar` (`galeria-logica.ts:113-115`) se ejecute
a través del componente renderizado, porque ya no existe ningún gesto de UI que ponga ese estado a
`true`: si se sustituyera `arranqueExplicito` por el literal `false` en las dos llamadas a
`debeRotar` de los componentes y se borrara el `useState`/`setArranqueExplicito`, ningún test actual
notaría la diferencia (verificado por inspección: cero tests de `galeria.test.tsx`/`resenas.test.tsx`
fuerzan ese estado a `true`, y hoy es imposible hacerlo sin el botón retirado).

Esto es la MISMA categoría de "código que nadie pidió" que este mismo `tdd_craftsman` invocó para
retirar `claveDeRotacion`/`etiquetaDeRotacion` de `galeria-logica.ts` con su test dedicado
(`progress/tdd_carrusel_enmienda4.md:27-32`, regla citada ahí mismo: "código que nadie pidió no
existe"). La diferencia es que `debeRotar` en sí SÍ sigue teniendo un llamador real y su rama
`arranqueExplicito` SÍ sigue probada como función pura y general (`galeria-logica.test.ts:190,213,
227` — legítimo mantener la capacidad en la función reutilizable), pero el CABLEADO en los dos
componentes (el `useState`, el paso del valor, el reseteo en `entra()`) es vestigial: quedó huérfano
por la MISMA causa (el borrado del botón, commit `9cf32a9`) que dejó muerto a `alternarRotacion`, y
el propio diario lo reconoce sin resolverlo ("aunque su rama arranqueExplicito ya no sea alcanzable
por UI... fuera de alcance del encargo", `progress/tdd_carrusel_enmienda4.md:34-35`; también
anticipado por el `gherkin_author` en `features/galeria_carrusel.feature:461` y
`progress/enmienda4_carrusel_sc222.md`).

No es un hallazgo cosmético: es exactamente el tipo de superviviente que el `mutation_tester`
encontrará como mutante equivalente-o-no-verificable en `Galeria.tsx`/`Resenas.tsx` (mutar
`useState(false)`→`useState(true)`, o la rama `if (estado.arranqueExplicito)` dentro de la llamada
real del componente, no tiene ningún test de componente que lo mate — solo lo mata el test de la
función pura, que es un fichero distinto). Y viola la regla dura de este proceso: "Nunca apruebes
producción que ningún test exige."

No se pide re-litigar la decisión de Pablo (conservar su edición, aceptar el hueco WCAG): eso ya está
cerrado y este judge no lo reabre. Se pide una poda simétrica de un cadáver que comparte la misma
causa de muerte que el que sí se podó en esta misma sesión.

### Hallazgos numerados

1. **[BLOQUEANTE]** `arranqueExplicito` (estado + wiring) en `Galeria.tsx:101,117,281` y
   `Resenas.tsx:82,96,251` es código de producción que ningún test de componente exige desde que
   `alternarRotacion` fue retirado en esta misma sesión. Ver análisis completo arriba.
2. **[Grave — documentación, no bloquea el código]** `feature_list.json` — las entradas 22
   (`galeria_carrusel`) y 14 (`resenas_agregado_enlace`) siguen `"status": "done"` con `description`
   y `cierre` que NO reflejan la ENMIENDA 4: la 22 todavía dice "Autoplay de 4 s con botón de
   pausa/inicio visible (WCAG 2.2 SC 2.2.2)" y la 14 dice que el carrusel "hereda TODA la conducta
   de la galería v3 (2 s, pausa, teclado..., flechas de cristal..., reduced-motion)" — ambas frases
   son hoy falsas (ni hay botón de pausa, ni flechas, ni cadencia sin más matiz). Es exactamente lo
   que el encargo pidió reportar sin tocar: lo cierra el `craftsman_lead` al consolidar la sesión, no
   bloquea este veredicto porque `feature_list.json` no lo gestiona `tdd_craftsman`/`judge`.
3. **[Menor]** `progress/current.md:47-60` conserva una entrada de la ENMIENDA 4 (`gherkin_author`)
   que dice "PUERTA HUMANA: pendiente de aprobación de la enmienda antes de lanzar al
   `tdd_craftsman`" — pero la entrada de arriba (líneas 7-21) del MISMO fichero ya documenta que el
   `tdd_craftsman` ejecutó esa sincronización. Es contenido de sesiones distintas sin consolidar
   (regla del propio fichero: "no contiene basura de sesiones anteriores"); no afecta al código, se
   limpia al cerrar sesión.
4. **[Menor]** `galeria-logica.ts:98` — el docblock de `EstadoDeRotacion.arranqueExplicito` sigue
   describiendo "El usuario pulsó «Iniciar»" como si ese control existiera; coherente con que la
   función pura siga soportando el valor, pero la frase debería aclarar que hoy es una capacidad SIN
   consumidor real en los dos componentes (mismo origen que el hallazgo 1; se resuelve solo si se
   corrige el hallazgo 1).

### Checkpoints
- C1: [x] `bin/harness init` verde (verificado por este judge, no solo por el `craftsman_lead`).
- C2: [x] una sola feature `in_progress` en `feature_list.json` (ninguna, de hecho: F-22/F-14 siguen
  `done`, coherente con que esto es una sincronización de cabos sueltos, no una feature nueva) ·
  [~] `progress/current.md` tiene contenido de sesión ya superado sin consolidar (hallazgo 3, menor).
- C3: [x] módulos en su sitio, arquitectura respetada (decisión pura / componente que cablea / SCSS
  que mide, sin tocar) · [ ] hay código de producción sin uso real (hallazgo 1).
- C4: [x] `bin/harness test` → 1299/1299 verdes.
- C6: [x] cada `@s` vigente tiene su test (tabla arriba) · [x] los RETIRADOS no dejan fugas · [ ] SÍ
  hay código de producción que ningún test rojo pide (hallazgo 1) — este ítem, por su propia letra,
  impide el `APPROVED`.
- C7: no evaluado aquí (la mutación corre después de este veredicto, como marca el proceso).

### Cambios requeridos
1. Retirar `arranqueExplicito` (el `useState`, su paso a `debeRotar` en ambos componentes, y el
   reseteo en `entra()`) de `Galeria.tsx` y `Resenas.tsx`, sustituyendo la llamada por
   `debeRotar({ pausadoPorElUsuario: pausado, raton, foco, arranqueExplicito: false })` o,
   simplificando la firma de `debeRotar` si `galeria-logica.test.ts` deja de necesitar ejercitar esa
   rama sin un consumidor real — a decidir por el `tdd_craftsman` con el mismo criterio que ya aplicó
   a `claveDeRotacion`/`etiquetaDeRotacion`. Si se conserva la rama en la función pura por ser
   reutilizable a futuro, debe quedar explícito en el docblock que hoy NINGÚN componente la alcanza
   (mismo tipo de nota que ya usa el repo para mutantes equivalentes declarados).
2. Volver a correr `bin/harness init` tras el cambio y confirmar que la suite sigue en verde (con el
   recuento que corresponda tras el ajuste).
3. (No bloqueante, para consolidar al cierre) Actualizar `feature_list.json` ids 22 y 14 para
   reflejar la ENMIENDA 4 — hallazgo 2, lo hace el `craftsman_lead`.


---

## Re-revisión delta (2026-07-24, tras remate)

> Verificación independiente de ESTE judge, delta sobre el remate del `tdd_craftsman`
> (`progress/tdd_carrusel_enmienda4.md`, sección "Remate tras judge (2026-07-24)"). No se repite el
> análisis de cobertura @s↔test ni la tabla de trazabilidad de la sección RETIRO 2 de arriba: sigue
> válida sin cambios.

### 1. Bloqueante (arranqueExplicito cableado muerto) — RESUELTO

Grep propio de `arranqueExplicito`/`setArranqueExplicito` en TODO `src/`:
- `src/components/Galeria.tsx:111,118` y `src/components/Resenas.tsx:90,97` — solo quedan: (a) un
  comentario explicando por qué se pasa `false`, y (b) el literal `arranqueExplicito: false` dentro
  de la llamada a `debeRotar`. CERO `useState`, CERO `setArranqueExplicito` en ninguno de los dos
  componentes.
- Único resto vivo del identificador: `src/components/galeria-logica.ts:105,119` (la interfaz
  `EstadoDeRotacion` y la rama `if (estado.arranqueExplicito)` dentro de la función pura `debeRotar`)
  y `src/components/galeria-logica.test.ts:190,213,227` (sus tests dedicados @s8/@s11). Exactamente
  lo que el diario declara.

Diff real revisado línea por línea contra HEAD: coincide EXACTAMENTE con lo que el diario describe —
se retira el `useState(false)` de `arranqueExplicito`, su comentario "MUTANTE EQUIVALENTE" (que
documentaba precisamente la inobservabilidad ahora resuelta por construcción), el paso a `debeRotar`
cambia de la variable al literal `arranqueExplicito: false` con un comentario nuevo que explica la
causa (botón retirado a mano, commit 9cf32a9), y `entra()` deja de resetear el estado retirado — su
docblock pasa de explicar que un ratón o foco nuevos "cancelan el arranque explícito" a decir que solo
"marcan su fuente como activa (paran la rotación)", coherente con que ya no cancela nada. Nada más se
toca en ninguna otra rama de `debeRotar` ni en ningún otro sitio de los dos componentes.

Grep de "MUTANTE EQUIVALENTE" en todo el repo: las únicas apariciones que sobreviven en
`Galeria.tsx`/`Resenas.tsx` son OTRAS dos notas (deps de efectos de solo-montaje y el chequeo de
`raiz.current`), ninguna relacionada con `arranqueExplicito`. El comentario que colgaba del `useState`
retirado no quedó huérfano en ningún otro fichero (grep de `arranqueExplicito` en
`progress/history.md`: cero resultados).

**Sobre la decisión de CONSERVAR debeRotar/EstadoDeRotacion.arranqueExplicito en
galeria-logica.ts:** de acuerdo con el criterio del `tdd_craftsman`, verificado con criterio propio y
no solo leído del diario:
- `debeRotar` SÍ tiene un llamador real en producción: las dos únicas invocaciones vivas en todo
  `src/` son `Galeria.tsx:114` y `Resenas.tsx:93`, ambas dentro del render.
- El parámetro `arranqueExplicito` SÍ está probado como una regla de negocio legítima de la función
  PURA, no un cadáver disfrazado: `galeria-logica.test.ts:207-217` (@s8, "la parada pedida por el
  usuario GANA sobre todo, incluso sobre el arranque explícito") y `:219-230` (@s11, "el arranque
  explícito GANA sobre el ratón encima y sobre el foco dentro", con cita literal del APG en el
  comentario) ejercitan una precedencia de 3 niveles (pausadoPorElUsuario > arranqueExplicito >
  raton/foco) que sigue siendo verdad de la función aunque hoy ningún componente la dispare con
  `true`. Retirar el parámetro habría obligado a reescribir esos dos tests para demostrar una regla
  que la función ya no podría expresar, perdiendo documentación de una precedencia real del patrón
  APG sin que ningún test rojo lo pidiera — sería podar por podar, no por disciplina TDD.
- El docblock ampliado (`galeria-logica.ts:96-104`) es honesto: dice explícitamente que HOY ningún
  componente llama con `true` y que se conserva como capacidad reutilizable, con la misma prosa que
  el repo ya usa para mutantes/ramas documentadas y no alcanzables por UI actual. No hay atribución
  falsa de cobertura por UI.

Coherente con la distinción que este mismo judge trazó en el veredicto original entre
`alternarRotacion` (cero llamadores en ningún sitio → retiro total) y `debeRotar` (llamador real +
test legítimo de la función pura → conservar función, podar solo el cableado muerto en los
componentes). Hallazgo 1 (BLOQUEANTE): RESUELTO.

### 2. Los 3 hallazgos MENORES de prosa (Retiro 1) — RESUELTOS

Lectura directa, no solo el diario:
- `src/components/galeria.test.tsx:1119-1128` — el `it('@s2 la galería sigue montada DENTRO de
  <main> en la home', ...)` ya no tiene ningún comentario que cite `boton-whatsapp-montaje.test.tsx`
  (fichero borrado). Confirmado.
- `features/galeria_carrusel.feature:241` — la nota ahora dice que la galería dentro de `<main>` lo
  vigila `galeria.test.tsx:1119-1128` — cita el test REAL, con el rango de líneas correcto tras el
  remate (verificado: el `it` empieza en 1119 y su cierre está en 1128). Confirmado.
- `src/lib/demo/reserva-demo.ts:1-6` — el docblock ya no nombra `BOTON_WHATSAPP_FLOTANTE_TEXTO`;
  ahora dice "los DOS puntos de entrada" (antes "TRES") y anota que el botón flotante y su constante
  se retiraron (commit 479d541). Confirmado, coherente con el estado real del código.

### 3. Verificación propia de bin/harness init

Ejecutado por este judge (`bin/harness.ps1 init`), no delegado al diario del `tdd_craftsman`:
- Entorno: OK (Node v22.15.0).
- `pnpm typecheck`: 0 errores.
- `pnpm lint` (`eslint .`): 0 errores.
- `pnpm test` (`vitest run`): 1299/1299 tests, 39 ficheros, 0 fallos — MISMO recuento que el
  veredicto original (línea 6 de este documento) y que el remate del diario. Ningún test se perdió ni
  se ganó: consistente con que el cambio fue cableado muerto en producción + prosa en
  comentarios/docblocks, sin tocar ningún describe/it.

### 4. Efectos colaterales — ninguno detectado

Diff completo de `Galeria.tsx`, `Resenas.tsx`, `galeria-logica.ts` y `galeria-logica.test.ts`
revisado línea por línea contra HEAD: cada hunk coincide con lo que el diario declara (retiro de
claveDeRotacion/etiquetaDeRotacion, retiro de alternarRotacion, y ahora retiro de arranqueExplicito +
su comentario + su reseteo en entra()). No hay ningún cambio adicional no declarado: ninguna otra
rama de debeRotar tocada, ningún otro useState afectado, ningún comentario "MUTANTE EQUIVALENTE"
huérfano.

### Checkpoints (actualizados)
- C1: [x] `bin/harness init` verde, verificado por este judge de nuevo tras el remate.
- C3: [x] ya NO hay código de producción sin uso real — el hallazgo 1 queda cerrado; arquitectura
  respetada (capa pura conserva su generalidad documentada, capa de componente queda sin cableado
  muerto).
- C4: [x] `bin/harness test` → 1299/1299 verdes, mismo recuento.
- C6: [x] cada @s vigente sigue con su test (sin cambios respecto al análisis original) · [x] los
  RETIRADOS no dejan fugas · [x] ya NO hay código de producción que ningún test exija.
- C7: no evaluado aquí (mutación corre después de este veredicto).

Hallazgo 2 [Grave, feature_list.json desactualizado] — SIN CAMBIOS, sigue diferido al
`craftsman_lead`, no se re-evalúa aquí.

Hallazgo 3 [Menor, progress/current.md con contenido de sesión sin consolidar] — SIN CAMBIOS, no
tocado en este remate; sigue siendo limpieza de cierre de sesión, no bloqueante.

### Veredicto FINAL — RETIRO 2 (controles del carrusel, ENMIENDA 4)

**APPROVED.**

El único bloqueante (cableado muerto de arranqueExplicito en los dos componentes) está resuelto de
forma simétrica a como se resolvió alternarRotacion, con un matiz razonado y verificado
independientemente: se conserva la función pura debeRotar con su parámetro (llamador real + test
legítimo de una regla de negocio documentada del patrón APG), y se poda solo el cableado inalcanzable
en Galeria.tsx/Resenas.tsx. Los 3 hallazgos menores de prosa quedaron corregidos de paso. La suite
sigue verde con el mismo recuento (1299/1299, 39 ficheros), tsc/eslint en 0. Queda abierto, sin
bloquear este veredicto, el hallazgo 2 (grave, feature_list.json desactualizado — diferido al
`craftsman_lead`) y el hallazgo 3 (menor, progress/current.md — limpieza de cierre de sesión).
