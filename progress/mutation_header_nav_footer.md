# Mutacion — feature 6 `header_nav_footer`

**Veredicto:** **PASS** — cierre limpio, 0 supervivientes, 0 exclusiones.
**Score feature:** killed/total = **157/157 = 100,00 %** (umbral `harness.config.json` ->
`mutation.threshold: 1.0` · `stryker.config.json` -> `break: 100`). Los **21 huecos** de la ronda de
escalada (20 Survived + 1 NoCoverage) **estan CERRADOS**: el humano eligio **refactorizar** el unico
equivalente (`?? ''` -> guard `if (coincidencia === null) continue`) en vez de excluirlo, y el
`tdd_craftsman` aniadio los escenarios @s21..@s27. **0 exclusiones, 0 `// Stryker disable`, 0
justificaciones de equivalencia** — como exige el umbral 1.0.

> El refactor **elimino el equivalente de raiz**: la tanda de cierre confirma que **no quedo ningun
> superviviente, ni siquiera otro equivalente**. Ni produccion ni tests se tocaron en esta tanda de
> medicion (`git status src/` limpio antes y despues).

---

## 0. TANDA DE CIERRE (2026-07-18) — la que vale

**Solo se re-midieron los DOS ficheros que cambiaron desde la ronda de escalada**
(`src/lib/puerta-anclas.ts` y `src/components/MenuNavegacion.tsx`). `Cabecera.tsx` y `Pie.tsx` **NO
se re-miden**: ya estaban **100 % sin supervivientes** y **ni produccion ni tests se tocaron** ->
aniadir tests nunca baja un score y aqui ni se rozaron. Baseline **629/629 verde** antes de medir.

### Salud del informe — SE LEE ANTES QUE EL SCORE

| Fichero | Concurrencia | `# timeout` | tests/mutante (vs ronda anterior) | dry run (tests que cubren) | `# errors` | Vale? |
| ------- | ------------ | ----------- | --------------------------------- | -------------------------- | ---------- | ----- |
| `src/lib/puerta-anclas.ts` | `--concurrency 1` | **0** | **4,17** (subio desde 3,64) | **39** (subio desde 28) | 0 | **si** |
| `src/components/MenuNavegacion.tsx` | `--concurrency 1` | **0** | **2,33** (bajo desde 3,00) | **12** (subio desde 11) | 0 | **si** |

1. **`# timeout` = 0 en los dos** -> el score se puede leer. `puerta-anclas.ts` es codigo puro sin
   bucles largos; `MenuNavegacion.tsx` renderiza con Testing Library. Ni un timeout -> no hay mentira
   de contencion (la de F-05: «100 %» con 152 timeouts, falsa).
2. **`tests/mutante` NO desplomado, en ninguna direccion peligrosa.**
   - `puerta-anclas.ts`: **4,17 (subio desde 3,64)** y el pool que lo cubre **crecio 28 -> 39** al
     aniadir @s21..@s26. Mas cobertura, no menos -> el desplome-que-inventa-supervivientes **no mordio**.
   - `MenuNavegacion.tsx`: **2,33 (bajo desde 3,00)** pero es el **descenso SANO**: el superviviente
     `:5 ID_LISTA` que en la ronda anterior corria TODOS sus tests de cobertura sin morir (inflando la
     media) ahora **muere pronto** con @s27 (bail-out al primer test que mata). El pool que cubre el
     fichero **crecio 11 -> 12** (el test @s27). Menos media = mas asesinos tempranos, **lo contrario**
     de un desplome que invente supervivientes. Confirmado: **dry run corrio 12 tests, 0 errores, 6/6
     muertos**.
3. **Cuantos tests corrieron (regla 6):** dry run **39** (anclas) y **12** (MenuNav), ambos > 0 y
   coherentes con el baseline crecido -> la suite corrio de verdad, no es el 0-tests-leido-como-sobrevive.

**Higiene:** baseline **629/629 verde** · `rm -rf .stryker-tmp` **entre las dos tandas** · **una sola
tanda viva a la vez** (0 procesos `stryker run` al arrancar) · acotado **solo** con `--mutate`,
**jamas** `--testFiles` · **sin sabotaje en esta tanda** (solo medicion; el `judge` ya reprodujo por
sabotaje los 4 mutantes del guard y el @s27) · `src/` **git-clean antes y despues**.

```
pnpm exec stryker run --mutate src/lib/puerta-anclas.ts          --concurrency 1   # EXIT 0
pnpm exec stryker run --mutate src/components/MenuNavegacion.tsx  --concurrency 1   # EXIT 0
```

### El score — ya con derecho a leerse

| Fichero | `# timeout` | tests/mut | Total | Killed | **Survived** | **NoCov** | `# errors` | Score |
| ------- | ----------- | --------- | ----- | ------ | ------------ | --------- | ---------- | ----- |
| `src/lib/puerta-anclas.ts` | **0** | 4,17 | **149** | 149 | **0** | **0** | 0 | **100,00 %** |
| `src/components/MenuNavegacion.tsx` | **0** | 2,33 | **6** | 6 | **0** | **0** | 0 | **100,00 %** |
| `src/components/Cabecera.tsx` (sin cambios) | — | — | **1** | 1 | **0** | 0 | 0 | **100,00 %** |
| `src/components/Pie.tsx` (sin cambios) | — | — | **1** | 1 | **0** | 0 | 0 | **100,00 %** |
| **Feature** | **0** | — | **157** | **157** | **0** | **0** | 0 | **100,00 %** |

Stryker salio con **codigo 0** en los dos ficheros re-medidos («Final mutation score of 100.00 is
greater than or equal to break threshold 100»). **Ni un superviviente, ni un equivalente**: el
refactor cerro el hueco sin abrir otro. **Nada que escalar.**

> Nota: el total de mutantes de `puerta-anclas.ts` paso de 148 a **149** por el refactor
> (`?? ''` fuera, guard `if (coincidencia === null) continue` dentro); el NoCoverage de `:89:69` que
> apuntaba al `?? ''` **desaparecio con la linea**. Feature total 156 -> **157** por esa misma razon.

---

## 1. Salud del informe — SE LEE ANTES QUE EL SCORE (ronda de ESCALADA, historico)

> «Un informe con timeouts MIENTE» (`docs/verification.md` s.52). «Un `tests per mutant` desplomado
> miente al reves e INVENTA supervivientes» (s.77). **Ninguna de las dos mordio aqui, y esta probado.**

| Fichero | Concurrencia | `# timeout` | tests/mutante | dry run (tests que cubren) | `# errors` | `# no cov` | Vale? |
| ------- | ------------ | ----------- | ------------- | -------------------------- | ---------- | ---------- | ----- |
| `puerta-anclas.ts` | `--concurrency 1` | **0** | **3,64** | **28** | 0 | 1 | **si** |
| `Cabecera.tsx` | `--concurrency 1` | **0** | **1,00** | **11** | 0 | 0 | **si** |
| `MenuNavegacion.tsx` | `--concurrency 1` | **0** | **3,00** | **11** | 0 | 0 | **si** |
| `Pie.tsx` | `--concurrency 1` | **0** | **1,00** | **11** | 0 | 0 | **si** |

1. **`# timeout` = 0 en los CUATRO.** `puerta-anclas.ts` es **codigo puro sin un solo bucle largo**:
   un timeout ahi seria imposible por construccion y contaria como MUERTO inflando el score (la
   mentira de F-01/F-03/F-05). **No hay ni uno.** Los `.tsx` renderizan React con Testing Library:
   tampoco hay bucles que se cuelguen. 0 timeouts -> el score se puede leer.
2. **`tests/mutante` NO esta desplomado — es genuino y coherente con el pool que cubre cada fichero.**
   El de F-04 se desplomo a **1,35 sobre una suite de 246** (ratio 0,5 %); aqui `puerta-anclas.ts`
   corre **3,64 sobre 28 tests que lo cubren** (ratio **13 %**), por encima del 8,5 % de la tanda
   HONESTA de F-05 (`terceros.ts` 10,85/118). Los `.tsx` con 1,00–3,00 sobre 11 es lo esperado en
   ficheros con **1 y 6 mutantes** (con 1 mutante, 1,00 es el unico valor posible).
3. **Verificado por SABOTAJE, que NO depende de Stryker** (reglas 5 y 6 de la sesion). Los
   supervivientes «que deberian morir obviamente» se aplicaron **a mano** al fichero real y se corrio
   la **suite COMPLETA (617 tests)**:

| Sabotaje (mutante aplicado a mano) | Tests corridos | Fallos | Veredicto |
| ---------------------------------- | -------------- | ------ | --------- |
| `puerta-anclas.ts:91` `if (headings.has(referencia))` -> `if (true)` | **617** | **0** | **SOBREVIVE (real)** |
| `puerta-anclas.ts:215` `.some(...)` -> `.every(...)` (guarda @s7) | **617** | **0** | **SOBREVIVE (real)** |
| `puerta-anclas.ts:53` `if (href !== undefined && ...)` -> `if (true && ...)` | **617** | **0** | **SOBREVIVE (real)** |
| `MenuNavegacion.tsx:5` `ID_LISTA = "menu-navegacion"` -> `""` | **617** | **0** | **SOBREVIVE (real)** |

**Los 4 dejan la suite en verde con el defecto dentro** -> son agujeros reales, no supervivientes
inventados por una medicion rota. Los **617 tests corridos** cuadran con el baseline (**617/617
verde** antes de medir) -> la suite corre de verdad.

**Higiene:** baseline **617/617 verde** antes de medir · `rm -rf .stryker-tmp` **entre cada tanda** ·
**una sola tanda viva a la vez** (comprobado: 0 procesos `stryker run` al arrancar) · acotado **solo**
con `--mutate`, **jamas** `--testFiles` · `src/` **git-clean antes y despues** de cada sabotaje
(revertido con `git checkout`, verificado) · `.experimentos-tmp` **gitignored** -> Stryker no lo copia
al sandbox (0 ENOENT de copyfile).

```
pnpm exec stryker run --mutate src/lib/puerta-anclas.ts         --concurrency 1
pnpm exec stryker run --mutate src/components/Cabecera.tsx       --concurrency 1
pnpm exec stryker run --mutate src/components/MenuNavegacion.tsx --concurrency 1
pnpm exec stryker run --mutate src/components/Pie.tsx            --concurrency 1
```

---

## 2. Informe por fichero — el score, ya con derecho a leerse

| Fichero | `# timeout` | tests/mut | Total | Killed | **Survived** | **NoCov** | Score |
| ------- | ----------- | --------- | ----- | ------ | ------------ | --------- | ----- |
| `src/lib/puerta-anclas.ts` | **0** | 3,64 | **148** | 128 | **19** | **1** | **86,49 %** |
| `src/components/Cabecera.tsx` | **0** | 1,00 | **1** | 1 | **0** | 0 | **100,00 %** |
| `src/components/MenuNavegacion.tsx` | **0** | 3,00 | **6** | 5 | **1** | 0 | **83,33 %** |
| `src/components/Pie.tsx` | **0** | 1,00 | **1** | 1 | **0** | 0 | **100,00 %** |
| **Feature** | **0** | — | **156** | **135** | **20** | **1** | **86,54 %** |

Stryker sale con **codigo 1** en `puerta-anclas.ts` y `MenuNavegacion.tsx` (break: 100). El
NoCoverage cuenta como no-matado (128/148, no 128/147).

**Nota sobre los `.tsx`:** los atributos JSX literales (`aria-label="Principal"`, `href="#..."`,
textos) **NO generan mutantes**: por eso Cabecera y Pie tienen **1 solo mutante** cada uno (el cuerpo
de la funcion), y ambos mueren. **NINGUN superviviente es un `className` condicional**: el craftsman
expreso el estado en `aria-expanded` (atributo consultable), no en clase CSS — la regla
anti-clase-CSS **se respeto** y no hay que rediseniar por esa via.

---

## 3. Mutantes sin matar — `src/lib/puerta-anclas.ts` (20)

**Ninguno es equivalente**: los 20 son distinguibles por una entrada que ningun fixture mete. Se
agrupan por el hueco de contrato que los deja vivos y por el test que los mataria.

### Grupo A — `<a>` de nav SIN `href` (2 mutantes, `anclasDeNav`)
- **`:51:20`** `OptionalChaining` — `ATRIBUTO_HREF.exec(etiqueta[0])?.[1]` -> `...[1]`
- **`:53:11`** `ConditionalExpression` — `if (href !== undefined && ...)` -> `if (true && ...)` [sabotaje]
  **Falta:** una `<nav>` con un `<a>` **sin atributo `href`** -> 0 anclas de esa etiqueta, **sin
  lanzar**. Con los mutantes, `null[1]` o `undefined.startsWith` -> **TypeError**. Hoy toda `<a>` de
  fixture lleva `href`.

### Grupo B — un id vacio no identifica a nadie (3 mutantes, `idsDeLaPagina:71`)
- **`:71:5`** `MethodExpression` — elimina `.filter((id) => id !== '')`
- **`:71:83`** `ConditionalExpression` — `.filter((id) => true)`
- **`:71:90`** `StringLiteral` — `id !== "Stryker was here!"`
  **Falta:** una pagina con un `id=""` (vacio) que **NO** debe contar como destino de anclaje. El
  comentario de `:64-66` **promete** que se descarta, pero **ningun test lo fija** — promesa sin
  puerta, **identico al `:58` de F-05**.

### Grupo C — seccion con `aria-labelledby` que no resuelve (3, `seccionesNavegables:89-91`)
- **`:89:24`** `OptionalChaining` — `ATRIBUTO_LABELLEDBY.exec(seccion[1])?.[1]` -> `...[1]`
- **`:89:69`** `StringLiteral` **(NoCoverage)** — `?? ''` -> `?? "Stryker was here!"`
- **`:91:9`** `ConditionalExpression` — `if (headings.has(referencia))` -> `if (true)` [sabotaje]
  **Falta:** una `<section>` **sin `aria-labelledby`** (o con un `aria-labelledby` que **no resuelve
  a un heading**) -> **NO** navegable y **sin lanzar**. @s20 prueba el caso simetrico (heading suelto
  sin seccion); **falta el gemelo**: la seccion cuya referencia no resuelve. Es la linea que
  **distingue navegable=seccion-con-heading-real de navegable=cualquier-seccion**.

### Grupo D — el TEXTO de `describir()` y las constantes REGLA (5, `:30 :31 :127 :143`)
- **`:30:35`** `StringLiteral` — `REGLA_ANCLA_MUERTA = ''`
- **`:31:35`** `StringLiteral` — `REGLA_INALCANZABLE = ''`
- **`:127:16`** `StringLiteral` — `ancla: ''` -> `"Stryker was here!"` (violacion inalcanzable)
- **`:143:5`** `ConditionalExpression` — `violacion.ancla === ''` -> `false`
- **`:143:25`** `StringLiteral` — `violacion.ancla === ''` -> `=== "Stryker was here!"`
  **Falta:** un test que asevere el **texto EXACTO** que produce `describir()` para **ambas** reglas:
  el **nombre de la regla** (mata `:30`/`:31`) y el formato `id "x"` frente a `ancla "y" -> id "x"`
  (mata `:127`/`:143`). @s5 comprueba que nombra ruta/ancla/id y que-falta pero **no fija el literal**
  que separa estas dos ramas.

### Grupo E — guardas de vacuidad `.some` -> `.every` (2, `:215 @s7`, `:227 @s19`)
- **`:215:35`** `MethodExpression` — `paginas.some(...anclasDeNav...> 0)` -> `paginas.every(...)` [sabotaje]
- **`:227:33`** `MethodExpression` — `paginas.some(...seccionesNavegables...> 0)` -> `paginas.every(...)`
  **Falta:** un artefacto **MULTI-PAGINA** donde **algunas** paginas tienen anclas/secciones y
  **otras no**, y el conjunto **no** tiene violaciones -> **exit 0**. @s7/@s19 usan **una sola**
  pagina vacia, donde `.some` y `.every` dan **el mismo veredicto** y no se distinguen. (El comentario
  de `:212-214` si neutralizo el mutante `> 0 -> >= 0`; **este es OTRO**, sobre el cuantificador.)

### Grupo F — tolerancia de espacios alrededor del `=` en la extraccion (5, `:36 :67 :82`)
- **`:36:23`** `Regex` — `ATRIBUTO_HREF`: `\bhref\s*=\s*` -> `\bhref\S*=\s*`
- **`:36:23`** `Regex` — `ATRIBUTO_HREF`: `\bhref\s*=\s*` -> `\bhref\s*=\S*`
- **`:67:21`** `Regex` — `ATRIBUTO_ID`: `\sid\s*=\s*` -> `\sid\S*=\s*`
- **`:82:29`** `Regex` — `ATRIBUTO_LABELLEDBY`: `\baria-labelledby\s*=\s*` -> `\baria-labelledby\S*=\s*`
- **`:82:29`** `Regex` — `ATRIBUTO_LABELLEDBY`: `\baria-labelledby\s*=\s*` -> `\baria-labelledby\s*=\S*`
  **Falta:** fixtures con **ESPACIOS alrededor del `=`** en los tres atributos:
  `href = "#servicios-titulo"`, `id = "servicios-titulo"`, `aria-labelledby = "servicios-titulo"`
  (HTML valido). El `\s*=\s*` tolera ese espaciado y **ningun test lo ejerce**. **Es EXACTAMENTE el
  `:58` de F-05** replicado en tres regex. AVISO: solo se distinguen **CON** espacios; sin espacios el
  mutante es indistinguible -> el fixture DEBE llevar el espacio.

---

## 4. Mutante superviviente — `src/components/MenuNavegacion.tsx` (1)

- **`:5:18`** `StringLiteral` — `const ID_LISTA = 'menu-navegacion'` -> `const ID_LISTA = ''` [sabotaje]
  **Falta:** un test que asevere la **relacion a11y** entre el boton y la lista: `aria-controls` del
  `<button>` debe ser **igual** al `id` del `<ul>` **y no vacio** (o que ese id horneado sea
  exactamente `menu-navegacion`). Con `''`, `aria-controls=""` e `id=""`: el boton **deja de apuntar
  a la lista** (el disparador ya no anuncia que controla) y **ningun test se entera**.
  `cabecera.test.tsx` comprueba el toggle de `aria-expanded` pero **no** la asociacion
  `aria-controls` <-> `id`.

---

## 5. Lo que este agente NO ha hecho, a proposito

- **No ha tocado `src/` ni los tests.** Los 4 sabotajes se revirtieron con `git checkout`;
  **`git status src/` LIMPIO** al cierre y **suite 617/617 verde** de baseline.
- **No ha excluido ni justificado ningun mutante como equivalente.** La via existe
  (`docs/mutation-testing.md` s.74-80) pero **la decide el humano** y el umbral 1.0 no da licencia.
  **Ninguno de los 21 es equivalente**: todos son distinguibles por una entrada concreta (arriba).
- **No ha marcado nada `done`.** La feature **NO CIERRA** con 21 mutantes sin matar.
- **No ha bajado el umbral, no ha escrito `// Stryker disable`, no ha rediseniado nada.** El unico
  motivo legitimo de rediseño (un superviviente de `className`) **no se dio**.

## 6. Que pedirle al `tdd_craftsman` (escenarios que faltan, no codigo de mas)

| # | Escenario/test rojo que falta | Mata |
| - | ----------------------------- | ---- |
| 1 | `<nav>` con un `<a>` **sin `href`** -> 0 anclas de esa etiqueta, sin lanzar | Grupo A (`:51`,`:53`) |
| 2 | Pagina con un `id=""` -> **no** cuenta como destino de anclaje | Grupo B (`:71` x3) |
| 3 | `<section>` **sin `aria-labelledby`** / con labelledby que **no resuelve** -> **no** navegable, sin lanzar | Grupo C (`:89` x2, `:91`) |
| 4 | Aserto del **texto exacto** de `describir()` para ancla-muerta **e** inalcanzable (regla + formato) | Grupo D (`:30`,`:31`,`:127`,`:143`) |
| 5 | Artefacto **multi-pagina mixto** (unas con anclas/secciones, otras no) y 0 violaciones -> exit 0 | Grupo E (`:215`,`:227`) |
| 6 | Fixtures con **espacios alrededor del `=`** en `href`/`id`/`aria-labelledby` | Grupo F (`:36` x2,`:67`,`:82` x2) |
| 7 | `MenuNavegacion`: `aria-controls` del boton **== `id`** del `<ul>` y **no vacio** | `MenuNav:5` |

**Patron de los 21 (identico a F-05):** salvo el grupo F (regex de tolerancia, el mas grave: una
propiedad prometida en un comentario que ningun test sostiene), **todos son guardas y ramas
defensivas CORRECTAS contra entradas que NINGUN escenario mete** (`<a>` sin href, id vacio, seccion
que no resuelve, artefacto multi-pagina, texto del informe). El contrato cubre muy bien **lo que el
`dist/` real SI trae** y no fija **lo malformado ni lo raro**. **La prueba de mutacion encontro
contrato de menos, no codigo de mas** — la produccion no se toca.

**Despues de matarlos: vuelta al `judge` y REMEDICION a `--concurrency 1`** de los dos ficheros que
fallaron (aniadir tests no baja un score, pero el informe honesto hay que volver a emitirlo).
