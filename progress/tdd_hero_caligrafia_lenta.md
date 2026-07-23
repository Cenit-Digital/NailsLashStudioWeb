# TDD — La caligrafía LENTA del hero (≈90 s) con el rótulo como control

> `tdd_craftsman` · rama `feat/hero-caligrafia-lenta` · contrato `features/hero.feature`
> ENMENDADO 2026-07-23 (@s4 reescrito + @s10..@s14 nuevos) · brief
> `progress/hero_caligrafia_lenta_diseno.md`. Baseline al arrancar: **57 tests de hero en verde**
> (hero-estilos 30 + hero.test 27, medido con vitest dirigido).

## Escenarios a recorrer

- @s4 (reescrito) — token único `--duracion-caligrafia: 90s`, `escribir`/`recorrer` = el token con
  curva `linear` (UN reloj), `retirarse` en `calc(token − 0.4s + 0.1s)`, `revelarStudio` en
  `calc(token + 0.2s)`, total ≈90,8 s. Por BYTES del SCSS.
- @s10 — el botón transparente «Completar la firma», FUERA del `<h1>`, foco por anillo global.
- @s11 — activar (clic/Enter/Espacio) completa la firma al instante y desmonta el botón.
- @s12 — el control solo existe mientras corre: fin de reloj (setTimeout de la duración total).
- @s13 — bajo `prefers-reduced-motion` el control NO se monta jamás.
- @s14 — el control no roba clics fuera del área del rótulo.

@s1-@s3 y @s5-@s9: INTACTOS (sus tests no se tocan; deben seguir verdes tras cada ciclo).

## Mapa @s → test

| @s | Tests (fichero → describe/it) |
|---|---|
| @s4 token único | `hero-estilos.test.ts` → «@s4 un ÚNICO token…» (6 tests: token 90s/una vez, sin duración suelta ≤1 s, escribir+recorrer=var+linear, UN reloj, retirarse calc, revelarStudio calc + aparecer 0.3s) |
| @s4 orden/total | `hero-estilos.test.ts` → «@s4 «STUDIO» entra CUANDO…» (retardo ≥ fin del trazo; total = 90 800 ms EXACTOS) |
| @s4 un solo reloj (lógica↔hoja) | `hero-logica.test.ts` → «@s4/@s12 el reloj del timeout es EL MISMO…» (SEGUNDOS_DE_TRAZO=90=token por bytes; SEGUNDOS_DE_SALIDA=0.8 leído del calc+duración; ceremonia=90 800) |
| @s10 | `hero.test.tsx` → «@s10 el rótulo es el control…» (4 tests: botón nativo sin texto, FUERA del h1 con estructura F-07 intacta, foco por tab, NO viaja en el horneado) + `hero-estilos.test.ts` → «@s10/@s14 el control sin cromo…» (transparente, cursor pointer, sin outline) + `hero-logica.test.ts` tabla `debeMontarseElControl` |
| @s11 | `hero.test.tsx` → «@s11 activar el control…» (clic, Enter, Espacio → data-firma «cliente» + botón desmontado) + `hero-estilos.test.ts` → «@s11/@s12 la firma completada…» (bloque data-firma cliente/reloj → animation: none a las 3 piezas) + `hero-logica.test.ts` tabla `firmaCompletada` |
| @s12 | `hero.test.tsx` → «@s12 el control SOLO existe mientras…» (90 799 ms: vivo; 90 800: desmontado y fase «reloj»; anti-fuga: clic + avance NO re-etiqueta «cliente») + `hero-logica.test.ts` `milisegundosDeCeremonia()` |
| @s13 | `hero.test.tsx` → «@s13 con movimiento reducido…» (sin botón en ningún momento ni tras 90,8 s, fase sigue «corriendo», sin botón en el horneado) — el rótulo visible al instante lo protege la hoja (@s3/@s5, intactos) |
| @s14 | `hero.test.tsx` → «@s14 el control no roba clics…» (clic en el eyebrow NO completa; el botón es hijo directo de la escena) + `hero-estilos.test.ts` @s14 (absolute + inset 0 sobre escena relativa, nunca fixed) |

@s1-@s3, @s5-@s9: tests preexistentes, 0 tocados, todos verdes tras cada ciclo.

## Ciclos

### Ciclo 1 — @s4: el token único y la coreografía derivada (BYTES del SCSS)

- **ROJO**: reescritos los 2 describes de @s4 en `hero-estilos.test.ts` (el viejo ≤4,5 s y el de
  orden) al nuevo contrato: 8 tests, **7 rojos** contra el SCSS viejo (el de «STUDIO nunca antes»
  ya era cierto: Then conservado, re-medido). Helpers nuevos: troceo por comas de primer nivel
  (los paréntesis ya LLEVAN tiempos: var/calc) + resolutor de `var()`/`calc()` a segundos.
- **VERDE**: `hero.module.scss` — token `--duracion-caligrafia: 90s` en `.escena` (regla raíz);
  `escribir`/`recorrer` = `var(--duracion-caligrafia) linear 0.1s both` (UN reloj); `retirarse` en
  `calc(token - 0.4s + 0.1s)`; `revelarStudio` en `calc(token + 0.2s)`; `aparecer 0.3s` intacto;
  `@media reduce` intacto. Ajuste del test contador: los comentarios citan el token con dos
  puntos → se cuenta sobre CSS sin comentarios.
- **REFACTOR**: comentarios de cabecera del SCSS reescritos al régimen nuevo (el bloque «4,5 s
  aprobado» era historia superada). 61/61 en verde.
- **SABOTAJES** (medidos, restaurados): token→`9s` = 6 rojos · `recorrer` de vuelta a
  cubic-bezier = 1 rojo · retardo de `retirarse` duplicado a mano (`89.7s` sin calc) = 2 rojos
  (la fórmula Y la cota «sin duración suelta ≤ 1 s»).

### Ciclo 2 — la lógica pura del reloj y del control (`hero-logica.ts` NUEVO)

- **ROJO**: `hero-logica.test.ts` nuevo — import inexistente (Ley 2): fichero entero rojo.
- **VERDE**: `hero-logica.ts` — `SEGUNDOS_DE_TRAZO = 90` (espejo del token, comparado contra los
  BYTES del SCSS en test), `SEGUNDOS_DE_SALIDA = 0.8` (leído del calc + duración de revelarStudio),
  `milisegundosDeCeremonia()` = 90 800 **calculado EN LLAMADA** (nada derivado en la carga:
  estáticos no activables, tdd_deuda_mutacion_full.md familia B), `firmaCompletada(fase)` y
  `debeMontarseElControl(movimientoReducido, fase)` con tabla de verdad COMPLETA por valor.
  `movimientoReducido: boolean | null` (null = sin leer) a propósito: el estado inicial del
  componente es `null` (literal que Stryker no muta) y no un string mutable a equivalente.
  `FaseDeLaFirma` distingue `cliente` de `reloj` a propósito: hace OBSERVABLE la limpieza del
  timeout (un reloj sin limpiar re-etiquetaría «cliente» como «reloj» en `data-firma`).
- **SABOTAJES** (los mutadores de Stryker a mano; medidos, restaurados): `+`→`−` en la ceremonia =
  1 rojo · `===`→`!==` en la guarda de reduce = 3 rojos · `!`caído en firmaCompletada = 3 rojos ·
  `!==`→`===` en firmaCompletada = 6 rojos. 12/12 en verde.

### Ciclo 3 — @s10: el control sin cromo (DOM + bytes)

- **ROJO**: 4 tests DOM en `hero.test.tsx` (2 rojos: existencia+nombre y foco por tab; 2 Then de
  estructura verdes por construcción — mordida probada por sabotaje) + 4 de bytes en
  `hero-estilos.test.ts` (3 rojos; el «sin outline» es invariante negativo). Stub de `matchMedia`
  patrón galeria @s12 (consulta EXACTA a mano).
- **VERDE**: `Hero.tsx` — `movimientoReducido: boolean | null` (null=sin leer; el efecto guardado
  lee matchMedia), `controlVivo = debeMontarseElControl(...)`, `<button type="button">` transparente
  HERMANO del `<h1>` con `aria-label="Completar la firma"`. SCSS: regla `.control` (absolute,
  inset 0, padding/border 0, background transparent, cursor pointer, SIN outline: anillo global).
- **SABOTAJES** (medidos, restaurados): botón DENTRO del h1 = 3 rojos (incluido el Then de
  estructura) · montaje incondicional (`true &&`) = 1 rojo (el del horneado sin botón) ·
  `aria-label` vaciado (StringLiteral) = 2 rojos.

### Ciclo 4 — @s11: activar completa al instante

- **ROJO**: 3 tests DOM (clic / Enter / Espacio → `data-firma="cliente"` + botón desmontado; el
  estado inicial «corriendo» se asevera ANTES de activar) + 1 de bytes (bloque
  `.escena[data-firma='cliente'], .escena[data-firma='reloj'] { .trazo,.aplicador,.heroStudio
  { animation: none } }`).
- **VERDE**: `setFase` + `onClick={() => setFase('cliente')}` + `data-firma={fase}` en la escena +
  el bloque completada en la hoja (la BASE ya es el estado final: sin reflow).
- **DECISIÓN (desvío documentado del brief §3b)**: el gancho CSS es `data-firma` (selector de
  atributo, patrón `data-distancia` de galería), NO una clase condicional del module: bajo
  `css: false` las clases del module son `undefined` en test (regla del repo: JAMÁS `toHaveClass`)
  y el mutante que invirtiera el ternario de la clase sería inmatable. Mismo mecanismo
  («animation: none» por estado), observabilidad superior. El contrato no fija la forma.
- **SABOTAJES**: onClick vaciado (ArrowFunction) = 3 rojos · `'cliente'`→`'reloj'` = 3 rojos ·
  `.heroStudio` fuera del bloque completada = 1 rojo.

### Ciclo 5 — @s12: el fin de reloj

- **ROJO**: test de frontera con reloj falso (90 799 ms: botón vivo y «corriendo»; +1 ms: botón
  fuera y «reloj») — 1 rojo. El anti-fuga (clic + avance completo → sigue «cliente») nace verde
  (aún no había reloj): mordida probada por sabotaje.
- **VERDE**: efecto con `setTimeout(…, milisegundosDeCeremonia())` gated por `controlVivo`,
  identificador en const local (ReturnType<typeof setTimeout> inferido) y `clearTimeout` en la
  limpieza. El 90 800 va A MANO en el test (anti-tautología); la fuente única es la lógica.
- **SABOTAJES**: limpieza vaciada = 1 rojo (EXACTAMENTE el anti-fuga — por eso `FaseDeLaFirma`
  distingue cliente/reloj) · guarda invertida = 2 rojos · plazo hardcodeado 5000 = 1 rojo.

### Ciclo 6 — @s13: reduce no monta nada

- **ROJO→VERDE**: los 2 tests nacieron verdes (la decisión pura + guarda ya lo cubrían). Un test
  que pasa a la primera no demuestra nada → 3 sabotajes: ignorar la preferencia
  (`setMovimientoReducido(false)`) = 1 rojo · consulta vaciada (StringLiteral del media query) =
  1 rojo · guarda del reloj a `if (false)` = 2 rojos (bajo reduce el timeout NO debe ni armarse:
  la fase se asevera «corriendo» tras avanzar 90,8 s).

### Ciclo 7 — @s14: puntería

- **ROJO→VERDE**: 2 tests DOM nacidos verdes (inset 0 + jerarquía ya implementados) → sabotajes:
  eyebrow clicable = 1 rojo · botón movido FUERA de la escena (hermano del div) = 1 rojo. La
  geometría real del solape queda para EN VIVO (contrato, nota técnica).

## Remate

- **91 tests** en verde en los 3 ficheros de hero (34 estilos + 45 DOM + 12 lógica); baseline 57.
  `pnpm typecheck` 0 · `pnpm lint` 0 · prettier limpio en los 6 ficheros tocados.
- **Alcance tocado**: `src/components/hero.module.scss` (token + linear + calc + `.control` +
  bloque completada; `@media reduce` INTACTO), `src/components/Hero.tsx` (estado, 2 efectos,
  botón, data-firma), `src/components/hero-logica.ts` (NUEVO, puro), tests de los tres. ❌ NO
  tocados: Galeria*, Resenas*, carrusel-logica, contratos, feature_list.json, stryker.config.json,
  home.tsx, tests horneados.
- **Nota Stryker para el mutation_tester**: las deps `[]` del efecto de matchMedia son la familia
  de mutante EQUIVALENTE ya verificada DOS veces (ArrayDeclaration deps constantes de efecto
  solo-montaje: mutation_galeria_carrusel.md 124:6, Equipo.tsx 210). NO se ha puesto
  `// Stryker disable` preventivo: que lo ratifique la corrida, como manda el precedente.
- **PENDIENTE del lead**: alta de `src/components/hero-logica.ts` en `stryker.config.json` →
  suite completa + build → judge → mutación (Hero.tsx break 100) → verificación EN VIVO (§4 del
  brief: getAnimations 90 s linear, muestreo de fotogramas, clic/tab/Enter, reduce, LCP re-medido).

## Remate (Enmienda 2)

> 2026-07-23, tras la auditoría `a11y_hero_caligrafia_lenta.md` (A-2/A-3/A-5) y la primera
> mutación (`mutation_hero_caligrafia_lenta.md`). Contrato: `features/hero.feature` ENMIENDA 2 —
> @s15/@s16/@s17 nuevos, @s7 y @s13 ampliados. Baseline al arrancar: **91 tests en verde**
> (34 estilos + 45 DOM + 12 lógica). Al cerrar: **107 en verde** (38 + 57 + 12), **16 nuevos**.

### Mapa @s → test (delta)

| @s | Tests |
|---|---|
| @s15 bytes | `hero-estilos.test.ts` → «@s15 las animaciones viven condicionadas…» (4: bases de trazo/aplicador/heroStudio SIN `animation:`; bloque `:global(.caligrafia-lista)` anima las TRES piezas; las CINCO animaciones dentro del bloque; fuera de él todo `animation` restante es `none`) |
| @s15 DOM | `hero.test.tsx` → «@s15 la clase de «lista» y el botón nacen y mueren JUNTOS» (2: al montar con movimiento permitido clase+botón en el MISMO render; completar retira clase CON botón) |
| @s7 ampliado | `hero.test.tsx` → «@s7 sin JavaScript el rótulo nace COMPLETO y ESTÁTICO» (renderToString sin `caligrafia-lista`) |
| @s13 ampliado | `hero.test.tsx` → @s13 «la clase de «lista» NO se añade bajo reduce» (ni al montar ni tras 90,8 s) |
| @s16 | `hero.test.tsx` → «@s16 el foco no cae al vacío…» (4: clic con userEvent —que enfoca al pulsar—, Enter, fin de reloj con el foco puesto → la escena `tabindex="-1"` recibe el foco; NEGATIVA: sin foco en el botón el fin de reloj NO lo roba) |
| @s17 | `hero.test.tsx` → «@s17 activar reduce a MITAD de firma la completa…» (4: change matches:true → clase y botón fuera al instante; matches:false sobre firma en marcha NO la toca; desactivar tras completar NO rearranca nada y el reloj quedó limpio (90,8 s después sigue `corriendo`); unmount → removeEventListener con EXACTAMENTE el manejador registrado en «change») |

### Ciclo A — @s15 + @s7/@s13 ampliados (A-3): el arranque en el montaje

- **ROJO**: 12 rojos medidos — 4 de @s15 bytes + 2 de @s15 DOM + los 6 de @s4 que pasan a leer la
  declaración `animation` del bloque condicionado (`reglaAnimada`, nuevo helper sobre
  `cuerpoDelBloque`; la ubicación cambia con el contrato, los TIEMPOS aseverados no). Los tests de
  @s7/@s13 ampliados nacieron verdes (la clase no existía): mordida probada por sabotaje.
- **VERDE**: `hero.module.scss` — las bases de `.trazo`/`.aplicador`/`.heroStudio` pierden su
  `animation`; bloque nuevo `.escena:global(.caligrafia-lista) { … }` con las CINCO animaciones
  (antes del bloque data-firma). El `@media reduce` repite la clase en sus selectores A PROPÓSITO:
  un @media no añade especificidad y con `.trazo` a secas PERDERÍA contra el bloque condicionado
  justo en el único caso en que ambos aplican. `Hero.tsx` — `CLASE_LISTA = 'caligrafia-lista'`
  (GLOBAL, observable bajo css:false; precedente data-firma) atada a `controlVivo`: clase y botón
  derivan del MISMO estado del efecto de montaje → nacen en el mismo render y mueren juntos, y el
  timeout (`[controlVivo]`) queda ALINEADO con la entrada de la clase por construcción (misma
  variable). Completar la firma = retirar la clase: la base ya ES el final.
- **SABOTAJES** (medidos, restaurados): clase horneada incondicionalmente = 3 rojos (@s7, @s13,
  @s15 mueren-juntos — los nacidos verdes muerden) · `revelarStudio` devuelto a la base del SCSS =
  2 rojos (base-no-anima y fuera-todo-none).

### Ciclo B — @s16 (A-2): el foco no cae al vacío

- **ROJO**: 3 rojos (clic/Enter/fin de reloj); la NEGATIVA nació verde → sabotaje.
- **VERDE**: `escenaRef` + `botonRef`, `tabIndex={-1}` en la escena y
  `recolocarElFocoSiCaeAlVacio(escena, boton)` a nivel de MÓDULO (recibe nodos: no es dependencia
  reactiva del efecto del reloj — exhaustive-deps limpio sin useCallback, cuyas deps `[]` serían
  OTRO equivalente). Llamada en `completarPorElCliente` (clic/Enter/Espacio) y en el callback del
  timeout, ANTES de `setFase`: el foco se muda con el botón aún montado.
- **SABOTAJES** (medidos, restaurados): recolocación incondicional (guarda caída) = 1 rojo (la
  negativa) · `tabIndex={+1}` (el mutante UnaryOperator) = 5 rojos (además de @s16, la escena se
  vuelve parada de tabulador y rompe el orden de @s10/@s11).

### Ciclo C — @s17 (A-5): la preferencia EN CALIENTE

- **ROJO**: 4 rojos. Stub de `hero.test.tsx` ampliado al patrón galería @s12 (espías
  `addEventListener`/`removeEventListener` + captura del manejador y disparo manual).
- **VERDE**: listener «change» en el MISMO efecto que lee la preferencia, con limpieza simétrica.
  El manejador solo actúa sobre `matches: true` → `setMovimientoReducido(true)`: `controlVivo` cae
  → clase y botón fuera EN EL MISMO render (completar = quedarse en la base, que es el final) y la
  limpieza del efecto del reloj desarma el timeout. `matches: false` NO hace nada: desactivar
  jamás rearranca (galería, misma rama contraria descartada por el mismo motivo).
- **SABOTAJES** (medidos, restaurados): manejador incondicional (`if (true)`) = 1 rojo (la rama
  contraria) · limpieza vaciada (`return () => {}`) = 1 rojo (el manejador EXACTO).

### Ciclo D — la exclusión RATIFICADA y el endurecimiento anti-equivalente

- **Exclusión** (decisión del lead, `mutation_hero_caligrafia_lenta.md` §Escalado): efecto de
  lectura de matchMedia reformateado al patrón Galeria.tsx:158-159 (deps en línea propia) con
  `// Stryker disable next-line all` SOLO sobre `[]`, motivo + referencia al informe in-situ.
  Confirmado en la corrida: `Ignored using a comment` (1).
- **Superviviente NUEVO cazado y CURADO por construcción** (1ª corrida del remate: 98,15 %,
  53/54): `Hero.tsx:93:7` ConditionalExpression `escena !== null && …` → `true && …`. Diagnóstico:
  la guarda de nulo era CÓDIGO MUERTO — si el foco está en el botón, el botón está montado y su
  escena también; ningún test puede fabricar el caso contrario → equivalente. Cura de artesano: se
  ELIMINA la rama muerta y el invariante se declara a nivel de TIPO (`escena!.focus()`, donde
  Stryker no muta), con el porqué comentado en el código. NO se añadió exclusión: el mutante ya no
  existe. Re-corrida: 100 %.
- **Mutación final** (`bin/harness mutate`, secuencial, sin `--testFiles`):
  `Hero.tsx` **50/50 = 100,00 %** (0 survived, 0 no-cov, 0 errores, Ignored 1 por el comentario) ·
  `hero-logica.ts` **16/16 = 100,00 %** (sin cambios en el fichero; re-medido como ordenó el lead).

### Estado

- **107 tests** en verde en los 3 ficheros de hero (38 estilos + 57 DOM + 12 lógica); 16 nuevos.
  `pnpm typecheck` 0 · `pnpm lint` 0 · prettier limpio. Suite completa y build NO ejecutados aquí
  (orden del lead: verificación dirigida; el `verify` global es su puerta).
- **Alcance tocado**: `Hero.tsx` (clase de lista atada a controlVivo, refs + tabindex −1 +
  recolocación del foco, listener change con limpieza, exclusión documentada),
  `hero.module.scss` (bases sin animación, bloque condicionado, @media reduce con especificidad
  igualada), `hero.test.tsx` y `hero-estilos.test.ts`. ❌ NO tocados: `hero-logica.ts` y su test,
  otros componentes, contratos, `feature_list.json`, `stryker.config.json`, `progress/current.md`.
- **PENDIENTE del lead**: judge de la enmienda 2 + verificación EN VIVO (arranque en el montaje
  real, foco tras Enter/reloj en Chrome, toggle de reduce en caliente) antes de cualquier `done`.

## Enmienda 3 (30 s)

Micro-ciclo del 2026-07-24 (decisión de Pablo tras vivir ambos ritmos: 90 s → 30 s). El diseño de
token único hizo que fueran DOS valores de producción y ni uno más.

- **ROJO**: los 3 ficheros de test re-medidos al contrato nuevo (30 / `30s` / 29,7 / 30,2 /
  30 800 ms, todos ESCRITOS A MANO). Los Then estructurales (token único, calc() derivados,
  `linear`, un reloj tinta+aplicador, orden de «STUDIO») intactos. Corrida dirigida:
  **11 fallos** en 3 ficheros contra la producción vieja — rojo demostrado.
- **VERDE**: `hero.module.scss` `--duracion-caligrafia: 90s → 30s` (línea 52) y `hero-logica.ts`
  `SEGUNDOS_DE_TRAZO = 90 → 30` (línea 19). **107/107** en verde.
- **REFACTOR** (en verde): comentarios de producción que citaban el régimen viejo alineados
  (cabecera del SCSS: ≈3,3 s por letra, total ≈30,8 s; doc de `milisegundosDeCeremonia`). Cero
  cambios de comportamiento; re-corrida verde.
- **Sabotaje del espejo, DOS direcciones**: lógica=90/SCSS=30 → 2 tests rojos; SCSS=90s/lógica=30
  → 1 test rojo (la aserción espejo `Number(token) === SEGUNDOS_DE_TRAZO`). Restaurado, verde.
- **NO tocados**: `Hero.tsx` (el reloj lo lee de `milisegundosDeCeremonia()`), el `.feature` (ya
  traía la Enmienda 3), y los `90` que NO son tiempo del régimen (el «90 %» del recorrido en
  hero.test.tsx:325 y la historia de la auditoría A-3 en :725, que era literalmente 90 s entonces).
- **Mutación dirigida**: `hero-logica.ts` **16/16 = 100 %** · `Hero.tsx` **50/50 = 100 %**
  (0 survived, 0 no-cov; 1 Ignored: la exclusión RATIFICADA existente, ninguna nueva).
  Prettier/ESLint limpios en los ficheros tocados. Sin suite completa ni build (orden del lead).
- **PENDIENTE del lead**: re-verificación EN VIVO del ritmo real (≈30 s, getAnimations() +
  muestreo) y del LCP con la animación larga, como fija el contrato.

## Enmienda 4 (15 s)

Micro-ciclo del 2026-07-24 (decisión de Pablo, banco de vivencias ITERACIÓN 2: 30 s → 15 s, el
punto dulce — ≈1,7 s por letra y la mayoría ve la firma completarse). Mismo cambio mecánico que la
Enmienda 3: DOS valores de producción y ni uno más.

- **ROJO**: los 3 ficheros de test re-medidos al contrato nuevo (15 / `15s` / 14,7 / 15,2 /
  15 800 ms, todos ESCRITOS A MANO). Then estructurales (token único, calc() derivados, `linear`,
  un reloj tinta+aplicador, orden de «STUDIO») intactos. Corrida dirigida: **11 fallos** en
  3 ficheros contra la producción vieja — rojo demostrado (mismo recuento que la Enmienda 3).
- **VERDE**: `hero.module.scss` `--duracion-caligrafia: 30s → 15s` y `hero-logica.ts`
  `SEGUNDOS_DE_TRAZO = 30 → 15`. **107/107** en verde.
- **REFACTOR** (en verde): comentarios de producción alineados (cabecera del SCSS: ≈1,7 s por
  letra, total ≈15,8 s; doc de `milisegundosDeCeremonia`). Re-corrida verde.
- **Sabotaje del espejo, DOS direcciones**: lógica=30/SCSS=15 → 2 tests rojos; SCSS=30s/lógica=15
  → 1 test rojo (la aserción espejo `Number(token) === SEGUNDOS_DE_TRAZO`). Restaurado, verde.
- **NO tocados**: `Hero.tsx` (el reloj lo lee de `milisegundosDeCeremonia()`), el `.feature` (ya
  traía la Enmienda 4), y los números que NO son tiempo del régimen (el «90 %» del recorrido y la
  historia de 90 s de la auditoría A-3 en hero.test.tsx; el «90 s → 30 s → 15 s» histórico de la
  cabecera del SCSS).
- **Mutación dirigida**: `hero-logica.ts` **16/16 = 100 %** · `Hero.tsx` **50/50 = 100 %**
  (0 survived, 0 no-cov; la exclusión RATIFICADA existente, ninguna nueva). Prettier/ESLint
  limpios en los 5 ficheros tocados. Sin suite completa ni build (orden del lead).
- **PENDIENTE del lead**: re-verificación EN VIVO del ritmo real (≈15 s, getAnimations() +
  muestreo) y del LCP, como fija el contrato.
