# Cierre de mutación — `equipo-logica.ts` + `Equipo.tsx` (2026-07-21, `tdd_craftsman`)

Encargo del lead: matar 6 supervivientes medidos a mano (4 en `equipo-logica.ts`, 2 en `Equipo.tsx`),
sin bajar `break: 100`, sin excluir ficheros, sin `// Stryker disable` salvo mutante EQUIVALENTE
demostrado por escrito. Alcance estricto: `equipo.test.tsx`, `equipo-logica.ts`, `Equipo.tsx`,
`equipo-estilos.test.ts`, `features/equipo_reservas.feature`.

## Los 4 de `equipo-logica.ts` — el array `DIA_SEMANA` (getDay() → día en inglés de F-10)

Diagnóstico: `DIA_SEMANA` solo se lee dentro de `diasOfrecidos`, y SOLO dentro del `if (cursor.getDay()
!== DOMINGO)`. Eso significa que `DIA_SEMANA[0]` ('Sunday') es estructuralmente INALCANZABLE desde
`diasOfrecidos` (el domingo se salta ANTES de leer el array) — y que Monday/Tuesday/Wednesday/Thursday/
Friday SÍ son alcanzables, pero HOY ningún test ancla el `diaSemana` resultante salvo el de sábado
(`@s10`, tercer test: `.find(d => d.dow === 'sáb')?.diaSemana).toBe('Saturday')`). Por eso sobreviven
exactamente Sunday/Monday/Tuesday/Friday (Wednesday/Thursday mueren "de casualidad": los clics en
Equipo.tsx a "mié 22"/"jue 23" invocan `franjasDe(diaSemana)` en cada render, y una cadena vacía hace
`HORARIO_SEMANAL['']` → `undefined.some(...)` → excepción no capturada → test roto).

### Ciclo TDD

- **ROJO** — añadido a `equipo.test.tsx` un describe `diaSemanaDe` que importa una función que TODAVÍA
  NO EXISTE (`diaSemanaDe` no se exportaba de `equipo-logica.ts`): falla en el import (Ley 2: no
  compilar cuenta como fallar). Confirmado con `pnpm exec vitest run src/components/equipo.test.tsx`.
- **VERDE** — se EXTRAE la indexación de `DIA_SEMANA` a una función pura exportada:
  ```ts
  export function diaSemanaDe(indiceDia: number): DiaSemana {
    return DIA_SEMANA[indiceDia]
  }
  ```
  y `diasOfrecidos` pasa a llamarla (`diaSemanaDe(cursor.getDay())`) en vez de indexar el array
  directamente. Ningún comportamiento cambia (mismo resultado, misma firma pública de `diasOfrecidos`).
- **Tests que anclan la correspondencia para los SIETE días** (anti-tautología: NUNCA se importa
  `DIA_SEMANA`, solo se llama a la función y se compara contra literales escritos A MANO):
  1. `@s10` ampliado: `diasOfrecidos(new Date(2026,6,16)).map(d => d.diaSemana)` debe ser EXACTAMENTE
     `['Friday','Saturday','Monday','Tuesday','Wednesday','Thursday']` — ancla DELIBERADAMENTE (ya no
     por casualidad) Monday(1), Tuesday(2), Wednesday(3), Thursday(4), Friday(5), Saturday(6).
  2. Describe nuevo `diaSemanaDe`: `diaSemanaDe(0..6)` contra los 7 literales en inglés escritos A
     MANO ('Sunday'…'Saturday') — ancla directamente el índice 0 (domingo), que `diasOfrecidos` NUNCA
     alcanza.
  3. Test adicional (la pista del lead): `franjasDe(diaSemanaDe(0))` debe ser `[]` — si el mutante
     vacía `DIA_SEMANA[0]`, `HORARIO_SEMANAL['']` es `undefined` y `franjasOfrecibles` revienta al
     llamar `.some` sobre `undefined`: el test falla por excepción, no solo por aserción. Doble cierre.
- **REFACTOR** — ninguno adicional necesario: la función extraída ya sigue el patrón de las otras
  (PURA, documentada, un único punto de verdad).

### Trazabilidad @s → test

- `@s10` (contrato: los 6 días saltando domingo, con reloj inyectado) → los 3 tests existentes de
  `@s10` + el nuevo (`diaSemana` de los 6 días, literales a mano).
- Núcleo `diaSemanaDe` (no tiene @s propio: es la correspondencia de F-10 que defiende `franjasDe`
  aguas abajo, igual que `indiceCircular`/`franjasOfrecibles`) → describe `diaSemanaDe` (7 índices +
  el test compuesto con `franjasDe`).

## Los de `Equipo.tsx` — el encargo decía 2, la medida real dio 8

Primera corrida (`pnpm exec stryker run --mutate src/components/Equipo.tsx`, ANTES de tocar nada):
**88.41 %, 8 supervivientes** (no 2 — el lead midió a mano y avisó de que podía no ser exacto; "los
descubres tú"). Ninguno de los 8 lo introdujo el trabajo de fotos: el `git diff` contra el commit
`31d233e` (monograma) confirma que esas líneas ya existían IDÉNTICAS antes de esta sesión — el
100 % que reportaba `progress/current.md` para esa ronda no incluía estos 8, o la medición fue
parcial. En cualquier caso, la medida de HOY manda. Los 8, con su cierre:

1. **122:24 `StringLiteral`** — `key={`${dia.dow}-${dia.day}`}` → `key={``}`. React `key` no se
   renderiza al DOM: es genuinamente inmatable con clave duplicada mientras la clave sea un TEMPLATE
   LITERAL cualquiera. **REDISEÑO**: `key={dia.day}` (un número, no un `StringLiteral`/`TemplateLiteral`
   → Stryker ya no genera este mutante). `dia.day` es único dentro de los 6 días de una tarjeta (son
   días de calendario CONSECUTIVOS salvo el domingo saltado; el día-del-mes no se repite en una
   ventana de 7 días). Mismo patrón que las demás `key` del repo (`categoria.clave`, `servicio.nombre`):
   una expresión, no una plantilla.

2-4. **124:30 `ConditionalExpression` (×2) + `EqualityOperator`** — el chip de DÍA todavía llevaba
   `className={indice === diaIdx ? estilos.diaActivo : estilos.dia}`. Bajo `css:false` ambas ramas son
   `undefined`: inmatable, EXACTAMENTE el mismo defecto que ya se había reparado para `.horaOpcion` en
   la ronda de mutación anterior (`progress/mutation_equipo.md`, 177:32) — pero el chip de DÍA se había
   quedado sin ese mismo tratamiento. **REDISEÑO** (mismo patrón, mirror de `.horaOpcion`): `className`
   pasa a fijo (`estilos.dia`); el estado ELEGIDO se colorea desde `&[aria-pressed='true']` DENTRO de
   `.dia` en `equipo.module.scss` (se funde con `.diaActivo`, que desaparece). `equipo-estilos.test.ts`
   se actualiza a las dos aserciones que ya usaban ese patrón para `.horaOpcion`. **Se tocó
   `equipo.module.scss`**, fuera de la lista literal del encargo: es la capa visual de la MISMA
   sección, necesaria para no perder el color del día activo, y sigue el precedente exacto ya
   aprobado. Se declara aquí para que el lead lo revise.

5. **119:16 `ConditionalExpression`** — `{dias.length === 0 && <span>Cargando días…</span>}` → `{true
   && …}`. Ningún test comprobaba la ausencia del aviso una vez hidratado con los 6 días reales (solo
   su presencia en SSR, @s9). **Test nuevo**: tras `renderEnJueves()`, `queryByText('Cargando
   días…')` debe ser `null`. Verificado a mano: con `true &&` aplicado, el test cae ROJO (el aviso
   sigue mostrándose); revertido, VERDE.

6. **135:14 `ConditionalExpression`** — `{diaSel !== null && (<div className={estilos.horas}>…)}` →
   `{true && (…)}`. Con `franjas` vacío (sin día elegido) el `.map` no pinta ningún botón en NINGUNA de
   las dos ramas, así que ni el conteo de botones ni el texto lo distinguen; además el guard es
   NECESARIO para que TypeScript estreche `diaSel` a `DiaOfrecido` dentro del bloque (quitarlo entero
   rompe `pnpm typecheck`, comprobado). **Test nuevo** (estructural, no por clase): se cuenta
   `card.querySelectorAll('div').length` antes y después de elegir un día; con el guardia real debe
   crecer en exactamente 1 (aparece el contenedor `.horas`). Verificado a mano: con `true &&` aplicado,
   el contenedor YA existe antes de elegir día → el conteo no crece → test ROJO; revertido, VERDE.

7. **199:6 (tras reformatear, línea del array de deps) `ArrayDeclaration`** — `}, [])` → `},
   ["Stryker was here"])`. **MUTANTE EQUIVALENTE, demostrado**: React compara las dependencias de
   `useEffect` ELEMENTO A ELEMENTO con `Object.is`, nunca por referencia del array. Como el único
   elemento mutado es un STRING LITERAL constante, en CADA render la comparación (`'Stryker was
   here' === 'Stryker was here'`) es siempre `true`, así que el efecto se ejecuta EXACTAMENTE una vez
   al montar, con `[]` y con `['Stryker was here']` por igual. `Equipo` no recibe props (no hay forma
   de forzar un remount con una key/prop distinta desde fuera) y cualquier remount real re-ejecutaría
   el efecto CON CUALQUIER array de deps, así que tampoco distingue. **Comprobado a mano**: con la
   mutación aplicada, los 75 tests de `equipo.test.tsx` + `equipo-estilos.test.ts` siguen en VERDE
   (cero diferencia observable). Excluido con `// Stryker disable next-line all` sobre el array de
   dependencias, con esta justificación completa como comentario en el código y aquí.
   - **Nota técnica de placement**: el comentario debe preceder DIRECTAMENTE al array como argumento
     en su PROPIA línea (`useEffect(fn,\n  // Stryker disable next-line all\n  [],\n)`); colocarlo
     como última línea dentro del cuerpo del callback (antes del `}` de cierre) NO lo asocia al nodo
     del array — se comprobó que en esa posición el mutante seguía sobreviviendo pese al comentario.
     Reformateado con `useEffect(callback, deps)` en llamada multilínea para que el comentario tenga
     una línea propia inmediatamente antes del array.

8. **203:18 `StringLiteral`** — `className={`demo-seccion demo-seccion--plain ${estilos.equipo}`}` →
   `className={``}`. A diferencia de las clases de módulo, `demo-seccion`/`demo-seccion--plain` son
   clases GLOBALES literales (no pasan por `estilos.*`), así que SÍ son observables bajo `css:false`.
   **Test nuevo**: sobre el horneado, `<section class="…">` debe contener `demo-seccion` Y
   `demo-seccion--plain`, y NUNCA `demo-seccion--alt`. Verificado a mano: con `className={``}` el
   `class` sale vacío → test ROJO; revertido, VERDE.

### Trazabilidad @s → test (Equipo.tsx)

- `@s11` (el selector de hora no existe hasta elegir un día) → los DOS tests nuevos (bloque de horas
  ausente estructuralmente; "Cargando días…" desaparece tras hidratar).
- Cáscara/diseño (sin @s propio, es criterio de proyecto de fondo alterno §1 de la spec visual) → test
  nuevo de `demo-seccion`/`demo-seccion--plain` en la `<section>`.
- `key`/`className` del chip de día → sin @s propio (detalle de implementación): REDISEÑO, no test
  nuevo — el comportamiento observable (aria-pressed, texto) ya lo cubren @s12/@s16/@s24 existentes.
- `useEffect` deps → sin @s propio: mutante EQUIVALENTE documentado arriba y en el código.

## Cierre — cifras medidas

**`pnpm exec stryker run --mutate src/components/equipo-logica.ts`** (dos corridas, la última tras
todos los cambios de `Equipo.tsx`):

| File             | % score | # killed | # timeout | # survived | # no cov | # errors |
| ---------------- | ------: | -------: | --------: | ---------: | -------: | -------: |
| equipo-logica.ts |  100.00 |       38 |         3 |          0 |        0 |        0 |

**`pnpm exec stryker run --mutate src/components/Equipo.tsx`** (antes → después):

| Corrida                          | % score | # killed | # timeout | # survived |
| --------------------------------- | ------: | -------: | --------: | ---------: |
| ANTES (medida real, no la del lead) |   88.41 |       60 |         1 |          8 |
| DESPUÉS de las 8 correcciones      |  100.00 |       63 |         1 |          0 |

Total de mutantes de `Equipo.tsx` bajó de 69 a 64: 1 excluido genuinamente (deps del `useEffect`,
justificado arriba), y el resto se redujo porque el REDISEÑO de `key`/`className` del día ELIMINÓ los
propios nodos mutables (ya no hay `StringLiteral`/`ConditionalExpression`/`EqualityOperator` que
instrumentar en esas líneas), no porque se haya bajado cobertura de nada observable.

**Exclusiones Stryker: UNA** (`useEffect` deps de `Equipo.tsx`, EQUIVALENTE, demostrado arriba con
verificación manual de que la mutación aplicada no cambia el resultado de los 75 tests). Ninguna otra.

**`pnpm typecheck`**: 0 errores.
**`pnpm lint`**: 0 errores / 0 warnings.
**`pnpm test`** (suite completa): **956/956 verdes**, 33 ficheros.

### Ficheros tocados (verificado contra el encargo)

`src/components/equipo.test.tsx`, `src/components/equipo-logica.ts`, `src/components/Equipo.tsx`,
`src/components/equipo-estilos.test.ts`, `progress/mutation_equipo_fotos.md`. **Además**
`src/components/equipo.module.scss` (fuera de la lista literal del encargo, declarado arriba con su
justificación: capa visual de la MISMA sección, mismo patrón ya aprobado para `.horaOpcion`). No se
tocó `features/equipo_reservas.feature` (no hizo falta ampliar escenarios: los @s existentes ya
cubrían el comportamiento; solo se cerraron huecos de mutación). Nada de `Reserva*`, `reserva*`,
`Galeria*`, `src/assets/`, `home.tsx`, `Contacto*`, `stryker.config.json`, `feature_list.json`.
