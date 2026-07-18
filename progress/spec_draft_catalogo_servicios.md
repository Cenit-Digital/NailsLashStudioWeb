# Borrador de spec — F-09 `catalogo_servicios`

> Borrador del `spec_partner` para la puerta humana (Pablo delegó la redacción:
> «yo preparo, tú apruebas en lotes»). NO es todavía la sección de
> `project-spec.md`: es el material que Pablo aprueba y que luego se pliega al
> spec. Objetivo AHORA: **prototipo DEMO con datos placeholder**. NO se inventan
> precios reales ni se presentan como verificados: los euros que entren son
> **placeholder que bloquean publicar**.
>
> Etiquetas (las del informe maestro): **[V]** verificado · **[I]** inferencia
> sobre hechos verificados · **[NV]** no verificado. Sin etiqueta = decisión del
> proyecto.

---

## Propósito

Las **tres secciones reales** del negocio —**Uñas · Pestañas · Cejas** **[V-LEAD]**—
renderizadas **desde una fuente de datos única**, con el patrón `servicio →
variantes[]` **sin aplanar**, el **precio final con IVA** como dato **canónico**
(nunca `precio_base + IVA` calculado en la vista), la leyenda **«Precios con IVA
incluido»**, y una UI que **se niega a renderizar** un «precio anterior» que no
tenga respaldo de un histórico con fechas.

La «**Facial**» y la «**Depilación**» del prototipo **NO existen** en este salón
**[V-LEAD]**: eran del prototipo. La estructura de 3 categorías se conserva; su
**contenido** cambia por completo.

---

## Por qué es la feature central de la demo (y la más peligrosa)

Es el contenido que la clienta viene a ver. Y es una **máquina de generar
infracciones** si se hace mal: un precio sin IVA, un «desde» sin base, o un
«antes 35 €» que nunca se cobró son, cada uno, una infracción tasada
(`TRLGDCU 20.1.c`, `LCD 5.1.e`). Por eso el diseño **prohíbe estructuralmente**
los tres, en vez de confiar en que quien edite los datos «tenga cuidado».

Tres hechos verificados fijan el marco:

- El titular **NO publica precios** en su propia web **[V-LEAD]**. Los de
  Treatwell existen **[V como precio de Treatwell]** pero **[NV como tarifa
  oficial]**: son los que el salón cargó, con **fecha desconocida** **[V]**, y
  **no dicen si llevan IVA** **[V]**.
- **Solo 39 de 43** servicios de Treatwell son legibles; **4 de pedicura** no se
  pudieron leer (JS) **[V]**. **Prohibido presentar el catálogo como completo.**
- **Contradicción de pestañas:** la web del titular anuncia lifting/extensiones/
  tinte de pestañas **[V-LEAD]**, pero **Treatwell no vende ni un servicio de
  pestañas** **[V]** — y sí vende pedicura y depilación. **La cierra el cliente**
  (P-4), no nosotros.

Conclusión: **la estructura es real y se construye ya; los precios y la lista de
servicios son placeholder que bloquean publicar.**

---

## El MODELO de datos (el núcleo testeable)

Vive en un **módulo de datos único** (propuesta: `src/lib/catalogo.ts`), patrón
I-7 igual que `src/lib/site.ts`: los datos **fuera del JSX**, el componente solo
los **importa y renderiza**. El módulo exporta la **estructura** y una
**proyección `registros`** (los precios placeholder) para la puerta de F-01.

```
Categoria {
  id: 'unas' | 'pestanas' | 'cejas'        // conjunto CERRADO (nunca 'facial')
  nombre: 'Uñas' | 'Pestañas' | 'Cejas'    // [V-LEAD], literal de la web del titular
  servicios: Servicio[]
}

Servicio {
  id: string
  nombre: string                 // real y verificado (web titular / Treatwell)
  variantes: Variante[]          // 🔴 NUNCA aplanado: S/M/L viven como HIJOS del servicio
  precioDesde?: boolean          // el precio mostrado es un «desde»
  baseDesde?: string             // la BASE de cálculo del «desde» (art. 20.1.c párr. 2)
  suplementos?: Suplemento[]     // incrementos eventuales (art. 14.2 Ley 11/1998 CM)
}

Variante {
  etiqueta: 'S' | 'M' | 'L' | '' // '' = servicio sin tallas → UNA sola variante (no se aplana igual)
  precioConIva: Precio           // 🔴 el DATO CANÓNICO. No existe precio_base ni cálculo en vista
}

Precio {
  euros: number                  // el importe final CON IVA incluido, por definición del dato
  esPlaceholder: boolean         // hoy SIEMPRE true: bloquea publicar (F-01)
}

Suplemento { concepto: string; precioConIva: Precio }
```

Y el «antes» **NO es un campo**. Es una **derivación pura** de un histórico:

```
HistoricoPrecio {
  entradas: { euros: number; desde: FechaISO; hasta?: FechaISO }[]
}

precioAnteriorMostrable(historico, ahora) → number | null
  // Devuelve el precio anterior SOLO si hay una entrada con fechas que respalde
  // que el precio actual es una rebaja vigente. Sin histórico, o con la oferta
  // caducada (hasta < ahora), o con fecha futura (desde > ahora) → null.
  // La UI, ante null, NO RENDERIZA ningún «antes». (LCD 5.1.e; B-7)
```

**Puntos innegociables del modelo:**

1. **Sin aplanar.** «Manicura Semipermanente» con S/M/L es **un** servicio con
   **tres** variantes, **nunca** tres servicios hermanos. Un servicio sin tallas
   tiene `variantes: [{ etiqueta: '', precioConIva }]` — un solo hijo, misma
   forma.
2. **`precioConIva` es canónico.** La vista **muestra el número tal cual**;
   **no** hay `precio_base` ni aritmética de IVA en el render. La leyenda
   «Precios con IVA incluido» afirma un hecho sobre el dato, no lo calcula.
3. **`precioDesde` obliga a `baseDesde`.** Un «desde X €» sin base declarada es
   inválido (art. 20.1.c párr. 2). El «desde» debe corresponder a una variante
   **realmente disponible** a ese precio (= el mínimo de las variantes).
4. **`precioAnterior` no se puede escribir a mano.** No hay ranura para ello: el
   «antes» se **deriva** de `HistoricoPrecio` o **no existe**.

---

## Contrato de la UI

| | |
| --- | --- |
| **Entrada** | El catálogo importado de `src/lib/catalogo.ts` (fuente única). Ningún nombre, precio ni categoría escrito a mano en el JSX. |
| **Salida (render)** | La sección `#servicios` (ya presente, F-06) pasa de andamiaje a las **3 categorías**; cada una lista sus servicios; cada servicio muestra sus **variantes** con su `precioConIva`; **una** leyenda **«Precios con IVA incluido»**; un aviso visible **«Precios de muestra — pendientes de confirmar con el salón»** mientras los precios sean placeholder. |
| **Precio** | Se muestra el `precioConIva` **tal cual** + la leyenda. Un «desde» muestra además su **base**. |
| **«Antes»** | Se renderiza **solo si** `precioAnteriorMostrable(...)` devuelve un número. `null` → no aparece nada. |
| **Puerta F-01 (placeholder)** | Los precios placeholder producen **violación** en `detectarPlaceholders` (vía flag, `esPlaceholder: true` → `'marcado'`). Es el «precio placeholder que rompe el build» **a nivel de mecanismo** (probado por test unitario). El **cableado en vivo** al humilde queda **DIFERIDO + ANCLADO** — ver DECISIÓN Q-A. |
| **Accesibilidad** | El catálogo es **oferta precontractual**: `art. 20.2` exige formato accesible con atención a personas vulnerables → hereda las puertas de F-03 (contraste) y F-04 (semántica). El precio y su leyenda no pueden comunicarse solo por color. |
| **Modo de error** | Precio no numérico / negativo / `NaN`, categoría fuera del conjunto cerrado, `precioDesde` sin `baseDesde`, catálogo vacío → **falla cerrada** (lanza o excluye del render), como `numeroNacional` en `site.ts` y las puertas del proyecto. |

---

## Qué es PLACEHOLDER vs qué es ESTRUCTURA

| | Placeholder (**bloquea publicar**) | Estructura (**se construye y testea YA**) |
| --- | --- | --- |
| **Precios** | **Todos** los `precioConIva` (`esPlaceholder: true`). Treatwell es [NV como tarifa]; el titular no publica precios | El **modelo** de precio, la leyenda de IVA, el «desde»+base, `suplementos[]` |
| **IVA sí/no** | **[NV]** si los precios lo incluyen (P-3). La leyenda «con IVA incluido» solo es verídica cuando el cliente lo confirme | La **exigencia** «precio final con impuestos» (art. 20.1.c) y su leyenda |
| **Lista de servicios** | Qué servicios concretos y sus nombres/duraciones exactas (39/43, [NV] como oficial; anomalías Treatwell ítems 21/28 **no se corrigen en silencio**) | Que hay **3 categorías**, con el patrón `servicio → variantes[]` |
| **Categorías** | — | **Uñas · Pestañas · Cejas** son reales **[V-LEAD]** y su conjunto es cerrado |
| **Pestañas** | **[NV]** si se siguen ofreciendo (P-4) + sin precios en ninguna fuente | La categoría existe en la web del titular → se construye con datos placeholder |
| **«Antes»/ofertas** | **Ninguna verificada** (B-7). Sin histórico con fechas, no se publica | La **lógica de negativa** (`precioAnteriorMostrable`) |

---

## Casos límite (para TDD/mutación)

1. **Variante sin aplanar.** Un servicio con S/M/L expone `variantes.length === 3`
   con tres `precioConIva` distintos; **no** aparecen tres servicios hermanos
   «Manicura S / M / L». Un servicio sin tallas → `variantes.length === 1`,
   `etiqueta: ''`. *Mutante:* aplanar / colapsar la anidación.
2. **Precio placeholder que rompe el build (mecanismo).**
   `detectarPlaceholders({ registros: registrosCatalogo })` devuelve **≥1
   violación** por flag mientras los precios sean placeholder; con todos a
   `esPlaceholder: false` devuelve `[]`. Es el `@s34`/`@s10` visto desde F-09.
   *Mutante:* invertir la guarda del flag, `=== false` → `!== false`.
3. **`precio_anterior` sin histórico → no renderiza.**
   `precioAnteriorMostrable(historicoVacío, ahora) === null`; con un histórico de
   fechas válido devuelve el número. La UI ante `null` no pinta «antes».
   *Mutante:* la guarda de existencia del histórico, el comparador de fechas
   (`hasta < ahora`, `desde > ahora`), el `< / <=`.
4. **Oferta caducada / futura.** `hasta` ya pasado → `null` (no «antes»); `desde`
   en el futuro → `null`. *Mutante:* los operadores de fecha.
5. **«Desde X €» declara su base.** `precioDesde: true` ⇒ `baseDesde` no vacío, y
   el «desde» = mínimo de las variantes disponibles. `precioDesde: true` sin
   `baseDesde` → falla cerrada. *Mutante:* quitar la exigencia de base;
   `min` → `max`.
6. **Precio final con IVA, sin cálculo en vista.** El número mostrado es
   idéntico a `precioConIva.euros`; no hay multiplicación por 1,21 ni por ningún
   tipo en el render. La leyenda «Precios con IVA incluido» aparece **exactamente
   una vez**. *Mutante:* introducir aritmética de IVA / duplicar o borrar la
   leyenda.
7. **Conjunto de categorías cerrado.** El conjunto es **exactamente**
   `{Uñas, Pestañas, Cejas}`; «Facial» y «Depilación» **no aparecen** (igualdad
   de conjuntos, como la puerta de anclas de F-06). *Mutante:* renombrar o añadir
   una categoría.
8. **Colección vacía.** Categoría con `servicios: []` → no se renderiza como una
   tarjeta rota (o muestra «próximamente»); catálogo con 0 categorías → la puerta
   de estructura **falla cerrada** (exige las 3 categorías), nunca verde por
   vacuidad. *Mutante:* el `length > 0`.
9. **Entrada inválida.** `euros` `NaN`/negativo/no numérico, `id` de categoría
   fuera del conjunto → rechazo. *Mutante:* la validación numérica.

---

## Puertas legales

- **Ley 11/1998 CM art. 14.2** (autonómica, aplicable en Las Rozas): «las ofertas
  concretas… deben incorporar el precio» y «los suplementos o incrementos
  eventuales» **[V: BOE-A-1998-20651]**. → precio en cada servicio ofertado +
  `suplementos[]` junto al precio, no en letra pequeña.
- **TRLGDCU art. 20.1.c)**: «el precio final completo, incluidos los impuestos»
  **[V]** — **más estricto que LSSI 10.1.f)**: frente a consumidores **no basta**
  decir «IVA no incluido». → leyenda «Precios con IVA incluido». Párr. 2: informar
  de la **base de cálculo** del «desde» **[V]**.
- **TRLGDCU art. 20.2**: «formato que garantice su accesibilidad», con atención a
  personas consumidoras vulnerables **[V]**. → la accesibilidad del catálogo es
  **requisito legal**, no adorno (hereda F-03/F-04).
- **LSSI art. 10.1.f)**: precio, indicando si incluye o no impuestos **[V]** (el
  suelo; el 20.1.c es el techo aplicable frente a consumidor).
- **LCD art. 5.1.e)**: engaño sobre «la existencia de una ventaja específica con
  respecto al precio» **[V]** → un «antes» no realmente aplicado es infracción.
  **La regla de los 30 días NO aplica** (LOCM art. 20 / Dir. 98/6 se ciñen a
  **productos**, no a servicios; Directrices UE 2021/C 526/02 §1.1 **[V]**). B-7.
- **LCD art. 7** (omisiones engañosas) **[V]** → suplementos ocultos.

Sanción: `TRLGDCU 47.g)/47.m)` → `48.2.a)` leves, elevables → `49.1.a) 150–10.000 €`;
el `48.4` rebaja un escalón si se corrige antes de la incoación **[V]**. (Marco,
no cálculo.)

---

## Preguntas abiertas (las cierra el cliente; no se dan por resueltas)

- **P-3 — ¿los precios llevan el IVA incluido?** **[NV]**. Es la pregunta de mayor
  riesgo económico. El tipo concreto es asunto de gestoría; la obligación es
  «precio final con impuestos» sea cual sea. Hasta que se confirme, la leyenda
  «con IVA incluido» **no es verídica** y los precios siguen placeholder.
- **P-4 — ¿se siguen ofreciendo pestañas? ¿cuáles son las 3 categorías reales?**
  **[NV]**. La web del titular dice sí; Treatwell no vende ninguna. Se construye
  la categoría con placeholder; la contradicción **la cierra el cliente**.
- **P-5 — ¿ofertas vigentes reales con histórico de fechas?** **[NV]** (B-7). Sin
  histórico, no se publica ningún «antes».
- **Tarifa oficial vigente y lista completa de servicios.** **[NV]**. 39/43 de
  Treatwell, ninguno como tarifa oficial; 4 de pedicura ilegibles; anomalías de
  duración (ítems 21/28) **no se corrigen en silencio**.

---

## DECISIONES PARA LA PUERTA (con recomendación)

### Q-A — 🔴 La colisión con A-21: ¿cableado en vivo o diferido+anclado?

**Hecho load-bearing:** `pnpm build` (producción) ejecuta
`tools/puerta-placeholders.ts`, y ese mismo build es el que corren
`bin/harness init`, `bin/harness verify`, la CI y la verificación de cada feature
de UI. Si se **cablean los precios placeholder en vivo** al humilde, `pnpm build`
se pone **ROJO** y **F-08/F-10/F-11/F-12 se desarrollarían contra un rojo fijo**.

Esto **colisiona con A-21** (F-04 se negó a cablear `seo.origenCanonica`) y con
A-11 (F-02 dejó `site.email` fuera): «un rojo que siempre está rojo deja de ser
señal». La máquina de `src/lib/diferidos.test.ts` existe justo para esto.

**RECOMENDACIÓN: DIFERIR + ANCLAR.**
- Los precios se declaran `esPlaceholder: true` en `catalogo.ts`.
- El **mecanismo** se prueba con un test unitario (`detectarPlaceholders` sobre
  los `registros` del catálogo devuelve violación) — eso **es** «precio
  placeholder que rompe el build», a nivel de mecanismo.
- Se añade `catalogo.precios` (o el conjunto de ubicaciones) a
  `DIFERIDOS_APROBADOS` en `diferidos.test.ts`: si alguien difiere un dato que no
  esté en la lista, ese test se pone rojo. Anti-tautología intacta (lista escrita
  a mano).
- El humilde **NO** cablea los precios del catálogo → `pnpm build` sigue verde →
  F-10/F-11/F-12 conservan un verify verde. Cuando el cliente dé precios reales,
  se cambia el dato y el flag a `false` y se cablea con un cambio de una línea.

*Alternativa descartada:* cablear en vivo ahora → rojo permanente en
init/verify/CI, el mismo argumento con el que F-04 rechazó `seo.ts`. **Decide el
humano en la puerta** (es una excepción explícita al patrón, o su confirmación).

### Q-B — ¿precios placeholder visibles o genérico?

**RECOMENDACIÓN: números concretos placeholder, visibles, CON la leyenda «Precios
con IVA incluido» Y un aviso visible «Precios de muestra — pendientes de
confirmar».** Es lo que **demuestra de verdad** la UI de precios (el núcleo del
catálogo: leyenda, «desde»+base, variantes) siendo honestos. Los números son de
muestra, no los euros de Treatwell presentados como confirmados.
*Alternativa:* «Consultar / desde —» genérico — más seguro pero no ejercita la UI
de precios ni el «desde/base», que es lo testeable y lo que aporta la demo.

### Q-C — ¿qué servicios/variantes placeholder por categoría?

**RECOMENDACIÓN: un conjunto pequeño y representativo, con nombres reales
[V-LEAD/V] y precios placeholder:**
- **Uñas:** al menos un servicio con **variantes S/M/L** (p.ej. *Manicura
  Semipermanente* S/M/L — patrón real y verificado) para ejercitar el modelo no
  aplanado; + un servicio de **precio único** (p.ej. *Nail Art*); + un servicio
  **«desde» con base** (p.ej. *Uñas de gel, desde …*).
- **Pestañas:** los que la web del titular anuncia sin precio (*lifting*,
  *extensiones pelo a pelo*, *tinte*) → todos placeholder.
- **Cejas:** *diseño*, *tinte*, *laminado* [web del titular] → placeholder.

**Prohibido:** presentar el catálogo como completo (39/43); inventar duraciones o
«corregir» las anomalías de Treatwell (ítems 21/28); copiar textos descriptivos
de Treatwell (contenido de tercero + duplicado).

### Q-D — ¿la contradicción de pestañas?

**RECOMENDACIÓN:** construir la categoría **Pestañas** (la web del titular la
declara **[V-LEAD]**), con servicios/precios placeholder; dejar la pregunta
«¿seguís ofreciendo pestañas?» como **PREGUNTA ABIERTA P-4** que **cierra el
cliente**. No inventar precios de pestañas: es un **bloqueante de producto**, no de
investigación.

### Q-E — ¿se prohíbe «Facial»/«Depilación» por test?

**RECOMENDACIÓN: sí.** Un test asevera que el conjunto de categorías es
**exactamente** `{Uñas, Pestañas, Cejas}` (igualdad de conjuntos, como la puerta
de anclas de F-06); «Facial» y «Depilación» no aparecen. Mutar un nombre de
categoría rompe el test.

### Q-F — ¿dónde viven los datos?

**RECOMENDACIÓN:** módulo único `src/lib/catalogo.ts` (patrón I-7, como
`site.ts`), que exporta la estructura **y** la proyección `registros` para F-01.
El componente de render es aparte y solo importa. **IVA nunca calculado en vista:**
`precioConIva` es canónico.

---

## Nota de alcance (una feature a la vez)

- El **componente de render** del catálogo entra en F-09 (es su salida). La
  **imagen por categoría** (`ph-facial.png`/`ph-depil.png` quedan desalineados)
  es **F-17** (`pipeline_imagenes`, `blocked`): F-09 **no** trae fotos.
- El **enlace de reserva** (Treatwell vs WhatsApp) es **F-13**: F-09 no decide el
  canal de reserva.
- La **nota de reseñas** (4,9) es **F-14**: no entra aquí.
</content>
</invoke>
