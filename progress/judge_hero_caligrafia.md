# Review — feature DEMO hero caligrafico (contrato: features/hero.feature, 2026-07-20)

**Veredicto:** CHANGES_REQUESTED

Puertas mecanicas: typecheck 0 · lint 0 · `pnpm test` **783/783 verdes** · `bin/harness init`
exit 0. **La suite esta verde y aun asi RECHAZO**: tres escenarios del contrato no tienen ningun
test que los muerda, y dos de ellos los he roto a proposito dejando la suite entera en verde. El
tercero esta **incumplido en el codigo enviado**.

## Cobertura de escenarios (@s / test)

- @s1 @recorte: [ ] **SIN COBERTURA**. Solo existe el negativo «ya NO queda ningun clip-path»
  (`hero-estilos.test.ts:107`). Nada asevera que el viewBox encierre la tinta. Sabotaje probado -> B-1.
- @s2 @trazo: [x] `hero.test.tsx:229` (mask + `<text mask=...>` + prohibicion de `<clipPath>`),
  `:241` (`pathLength="100"`), `:250` (240 curvas `C`, exactamente 5 `M`).
- @s3 @punta: [x] `hero.test.tsx:274-314` — `y === -alto`, ratio 15/93, `-x/ancho ~ 0,4667`,
  `rotate(18)`. Ejemplar: el defecto del «86 % dentro del frasco» no puede volver en silencio.
- @s4 @duracion: [~] **PARCIAL**. La cota <= 4,5 s si muerde (`hero-estilos.test.ts:212`). La
  segunda clausula («STUDIO se revela al terminar la marca, no antes») no tiene test Y ESTA
  INCUMPLIDA -> B-3.
- @s5 @reducido: [x] `hero-estilos.test.ts:157` y `:317` (`animation:none` sobre las tres clases +
  `display:none` del aplicador).
- @s6 @accesibilidad: [x] `hero.test.tsx:49` (nombre accesible exacto), `:341` (`aria-hidden` del
  svg), `:205` (svg fuera del h1).
- @s7 @sin-js: [x] `hero.test.tsx:141-174` (nombre en los bytes; cero `animation`, `opacity:0` y
  `clip-path` inline).
- @s8 @cero-terceros: [x] `hero.test.tsx:217` (href local, no http), `hero-estilos.test.ts:346`
  (sin `url(https:` en la hoja). Verificado ademas A MANO: `package.json` y `pnpm-lock.yaml`
  INTACTOS en `git status` -> ninguna libreria nueva.
- @s9 @responsive: [ ] **SIN COBERTURA — CERO TESTS**. Ni `width`, ni `clamp()`, ni «no desborda
  en horizontal». Sabotaje probado -> B-2.

## Disciplina TDD

- Produccion sin test que la pida? **SI**. `VISTA_MARCA` (`src/lib/trazo-marca.ts:36`) y el
  `width: 4.12em` + `clamp()` de `.rotulo` (`hero.module.scss:58-59`) no los exige ningun test:
  se pueden cambiar a valores rotos con la suite en verde (B-1, B-2).
- Evidencia de Rojo->Verde->Refactor? **NO**. No existe `progress/tdd_hero_caligrafia.md` (B-4).

## Bloqueantes

### B-1 — @s1: el recorte de la N y la h puede volver con la suite en verde

El bug que Pablo ha reportado DOS VECES no tiene puerta.

`Hero.tsx:58` toma el viewBox de `VISTA_MARCA`, pero `Hero.tsx:69-72` lleva la region del `<mask>`
en LITERALES HARDCODEADOS (x="-80" y="-840" width="4120" height="1200"). El unico test que mira
esos numeros (`hero.test.tsx:316-328`) asevera los literales del mask, NO el viewBox. Son dos
copias del mismo dato sin nada que las ate.

SABOTAJE EJECUTADO Y REVERTIDO, en `src/lib/trazo-marca.ts:36`: sustituir
`'-80 -840 4120 1200'` por `'0 -840 3895 1200'` (la caja EXACTA que seccionaba los swashes, la
que mide el diagnostico). Resultado: 47/47 PASSED. El rotulo vuelve a recortarse por izquierda y
por derecha y ningun test se entera.

Arreglo: derivar los cuatro atributos del `<mask>` de `VISTA_MARCA` (fuente unica) Y anadir un
test @s1 que compruebe que el viewBox contiene el bbox medido de la tinta (x_min <= -15,6 y
x_max >= 3965,3 en milesimas de em, escritos A MANO). Hoy esos dos numeros solo viven en un
comentario, que es justo donde no muerden.

### B-2 — @s9: escenario entero sin un solo test

SABOTAJE EJECUTADO Y REVERTIDO, en `hero.module.scss:59`: sustituir `width: 4.12em` por
`width: 40em` (unas 10 veces mas ancho: desborda la ventana en cualquier viewport).
Resultado: 47/47 PASSED. «La pagina NO desborda en horizontal» es hoy una promesa sin puerta.

Arreglo: test que lea del SCSS el `width: 4.12em` y el `clamp()` de `.rotulo`, con los numeros
escritos a mano, y que compruebe la aritmetica que el propio comentario declara
(10,85vw x 4,12 = 44,7vw, menor que 100vw). Ese calculo esta hoy en el comentario `:56-57`.

### B-3 — @s4: «STUDIO no antes que la marca» esta INCUMPLIDO en el codigo enviado

Leido del SCSS:

- `.trazo` (`:77`): 0.1s de espera + 3.9s de duracion -> la marca termina en 4,0 s.
- `.heroStudio` (`:155`): arranca en 3.7s.

STUDIO empieza a revelarse 0,3 s ANTES de que la marca este escrita. El contrato exige
«"STUDIO" se revela al terminar la marca, no antes» (`hero.feature:66`) y el comentario del SCSS
`:28` afirma «entra cuando la marca ya esta escrita»: el comentario es FALSO. Ningun test compara
los dos relojes; bajando el delay de STUDIO a 0.05s la suite sigue en 47/47.

Arreglo: llevar el delay de `.heroStudio` a >= 4,0 s y anadir el test
delay(heroStudio) >= delay(trazo) + duracion(trazo). OJO: 4,0 + 0,6 = 4,6 s REBASA la cota de
4,5 s -> hay que DECIDIR CON PABLO si se acorta el trazo o se sube el techo. Corregir tambien el
comentario mentiroso.

### B-4 — No existe `progress/tdd_hero_caligrafia.md`

Solo hay `hallazgos_hero_caligrafia.md`, que es un DIAGNOSTICO, no un diario. No hay mapa
@s -> test, ni evidencia de ciclos Rojo-Verde-Refactor, ni registro de sabotajes. `CHECKPOINTS.md`
C6 lo exige por escrito. Sin el no puedo distinguir TDD de «tests escritos despues», y los tres
huecos de B-1/B-2/B-3 son exactamente el patron que produce escribir los tests al final.

## Calidad — hallazgos menores (no bloquean)

**M-1 — El riesgo de Great Vibes es REAL y no esta documentado en ningun sitio.**
`@fontsource` emite `font-display: swap` (forma verificada en `puerta-terceros.test.ts:46`).
Durante la descarga —y PARA SIEMPRE si la fuente falla— el `<text>` cae a `cursive` mientras la
mascara sigue calculada para Great Vibes: la mascara revela REGIONES EQUIVOCADAS, no letras.
Gravedad: alta en lo visual, baja en lo funcional (el nombre accesible NO depende del SVG,
`.heroMarca` lo conserva; y el HTML horneado sigue trayendo el nombre). No aparece ni en
`hero.feature` ni en `hallazgos_hero_caligrafia.md`. Debe quedar documentado como riesgo asumido,
y conviene evaluar `font-display: block` u `optional` SOLO para Great Vibes. Revelar el SVG tras
`document.fonts.ready` meteria JS en el camino del rotulo: eso es decision humana, no la tomo yo.

**M-2 — `src/assets/brush.png` (5,8 kB) es un binario huerfano.** Ya no lo importa ningun modulo
de `src/`: solo lo lee `tools/trazo-marca/aplicador.mjs` como ENTRADA para generar
`aplicador.png`. No viaja a `dist/` (Vite no emite lo que nadie importa), pero engorda el repo y
alimenta la deuda de binarios de F-01. Decidir: conservarlo documentado como fuente de la
herramienta, o borrarlo.

**M-3 — Deriva sobre F-07 (feature CERRADA) sin registrar.** Dos aserciones del contrato cerrado
se han retirado. Ambas son COHERENTES con el nuevo mecanismo, pero ninguna queda anotada:

- F-07 @s1 exigia `.heroMarca { clip-path: inset(0 0 0 0) }`. Ahora `.heroMarca` esta oculta con
  clip/1px y esa asercion ya no existe.
- F-07 @s17 exigia que `.heroMarca` declarase Great Vibes. Ahora no declara `font-family` y el
  test (`hero-estilos.test.ts:294`) itera solo sobre `['letras','heroStudio']`.

Hace falta una nota de deriva en `features/hero_marca.feature` o en un progress.

EL RESTO DE INVARIANTES DE F-07 LOS HE VERIFICADO UNO A UNO Y TODOS SIGUEN MORDIENDO — ninguno
ha quedado vacio: un solo `<h1>` (`hero.test.tsx:24`), hijos `<span>` nunca `<div>` (`:28`),
nombre accesible EXACTO «Nails Lash Studio» (`:49`), text node de espacio real (`:58`), eyebrow
`<p>` sin heading (`:110`), sin `<section>` (`:182`), sin ocultacion ni animacion HORNEADA INLINE
(`:141-174`), color `--ink` (`hero-estilos.test.ts:237`).

**M-4 — El veto a `clip-path` es mas ancho de lo que @s1 necesita.** `hero-estilos.test.ts:111`
prohibe `clip-path` en TODO el fichero, lo que obliga a `.heroMarca` a usar el `clip: rect()`
DEPRECADO en vez del `clip-path: inset(50%)` que la WAI recomienda hoy. Funciona en todos los
navegadores actuales, pero el veto deberia acotarse a `.rotulo`/`.letras`/`.trazo`, no a la hoja
entera.

**M-5 — Dos agujeros en la cota de @s4** (heredados de F-07, siguen abiertos): `segundosTotales`
solo lee la abreviatura `animation:`, asi que un `animation-duration: 10s` en linea aparte seria
invisible a la cota; y `.aplicador` —que tambien anima— queda FUERA de ella
(`hero-estilos.test.ts:212` solo itera `['trazo','heroStudio']`).

## Accesibilidad — respuesta directa

«Nails Lash» aparece dos veces en el DOM, pero SE ANUNCIA UNA SOLA VEZ y el marcado es correcto:

- El `<svg>` es `aria-hidden="true"` (`Hero.tsx:58`), asi que su `<text>` no entra en el arbol de
  accesibilidad. ES LO CORRECTO: el SVG es un rotulo decorativo; quien aporta el nombre es el `<h1>`.
- `.heroMarca` usa clip/1px (`position:absolute` + 1px + `clip: rect(0,0,0,0)` + `overflow:hidden`),
  la tecnica de la WAI que SI conserva el nombre accesible, a diferencia de `visibility:hidden` o
  `display:none`. `hero.test.tsx:49` confirma «Nails Lash Studio» (17 car.).
- Unica pega: la variante deprecada `clip: rect()` forzada por el veto global (M-4).

## Lo que esta BIEN hecho

- @s3 es ejemplar: `y === -alto`, ratio 15/93 y `-x/ancho ~ 0,4667` con los numeros ESCRITOS A
  MANO. El defecto del «86 % = dentro del frasco» no puede volver sin poner rojo un test.
- La sincronia POR CONSTRUCCION es la decision correcta y esta protegida donde importa:
  `pathLength="100"` en el marcado, `offset-path: url(#trazo-marca)` REFERENCIANDO el mismo path
  (no duplicandolo), y el test que prohibe `stroke-dasharray` en % (`hero-estilos.test.ts:338`),
  que caza una trampa real y sutil.
- Cero terceros INTACTO, verificado a mano y no solo por test.
- Ni CSS muerto ni reglas huerfanas: `paintReveal` y `pincelSvg` han desaparecido limpiamente.
- El dato generado esta bien aislado en `src/lib/trazo-marca.ts` (5 `M`, 240 `C`, solo comandos
  absolutos) y las herramientas de derivacion viven fuera de `src/`.

## Checkpoints

- C1 arnes completo: [x] (`bin/harness init` exit 0)
- C2 estado coherente: [x]
- C3 arquitectura, sin dependencias nuevas: [x] (`package.json` y lock intactos)
- C4 verificacion real: [x] mecanicamente (783/783), PERO ver B-1/B-2/B-3
- C5 sesion cerrada: [ ] falta el progress de esta feature
- C6 contrato Gherkin: [ ] @s1 y @s9 sin test; falta `progress/tdd_hero_caligrafia.md`
- C7 mutacion: [ ] no procede aun (corre despues de la aprobacion)

## Cambios requeridos

1. B-1 — Derivar los cuatro atributos del `<mask>` de `VISTA_MARCA` (fuente unica) y anadir un
   test @s1 que asevere que el viewBox contiene el bbox medido de la tinta (-15,6 -> 3965,3,
   escritos a mano). Comprobar con el sabotaje `'0 -840 3895 1200'`: DEBE QUEDAR ROJO.
2. B-2 — Anadir tests @s9 sobre `width: 4.12em` y el `clamp()` de `.rotulo`, incluida la cota
   10,85vw x 4,12 <= 100vw. Comprobar con el sabotaje `width: 40em`: DEBE QUEDAR ROJO.
3. B-3 — Llevar el arranque de `.heroStudio` a >= el final del trazo, DECIDIENDO ANTES CON PABLO
   si eso obliga a acortar el trazo o a subir el techo de 4,5 s. Anadir el test que compara los
   dos relojes. Corregir el comentario falso de `hero.module.scss:28`.
4. B-4 — Escribir `progress/tdd_hero_caligrafia.md` con el mapa @s -> test, los ciclos
   Rojo-Verde-Refactor y los sabotajes ejecutados con su resultado.
5. M-1 — Documentar el riesgo de Great Vibes y proponer mitigacion; la que toque JS va a la
   puerta humana.
6. M-3 — Anotar la deriva sobre F-07 (@s1 y @s17 de `hero_marca.feature`).
7. M-2 / M-4 / M-5 — A criterio del `craftsman_lead`; no bloquean esta ronda.

---

NOTA DE METODO: los tres sabotajes se ejecutaron sobre el arbol de trabajo y SE REVIRTIERON.
`git status` y `git diff --stat` verificados tras la reversion: `src/lib/trazo-marca.ts` y
`src/components/hero.module.scss` quedan EXACTAMENTE como estaban. No he editado codigo de
produccion como parte del veredicto. Los ficheros de la otra sesion (`Catalogo.tsx`,
`catalogo-demo.ts`, `equipo_reservas.feature`) no se han tocado ni revisado.

---

## ADENDA (durante la propia revision) — M-2 se ha convertido en un bloqueante blando

Mientras redactaba este veredicto, `src/assets/brush.png` ha sido BORRADO Y ESTAJADO
(`git status`: `D src/assets/brush.png`, 5857 -> 0 bytes). No lo he borrado yo; ocurrio de forma
concurrente (el fichero existia a las 13:58 y ya no existia a las 14:11).

Consecuencia MEDIDA: `tools/trazo-marca/aplicador.mjs:16` declara
`const ORIGEN = 'src/assets/brush.png'`. Con el origen borrado, **`aplicador.png` ya NO es
reproducible**: la herramienta que lo genera no puede volver a ejecutarse. Un artefacto generado
cuyo generador no puede correr deja de ser generado y pasa a ser un binario opaco commiteado a
mano — justo lo que la deuda de binarios de F-01 quiere evitar.

Hay que decidir una de estas dos, y dejarlo escrito:

1. **Restaurar `brush.png`** (`git restore --staged --worktree src/assets/brush.png`) y
   documentarlo como ENTRADA de la herramienta, no como asset de la web (no viaja a `dist/`
   porque ningun modulo de `src/` lo importa: eso ya lo verifique).
2. **Asumir que `aplicador.png` es un artefacto congelado** y, en ese caso, retirar o marcar como
   historico `tools/trazo-marca/aplicador.mjs`, para que nadie crea que puede regenerarlo.

Esto NO cambia el veredicto (ya era CHANGES_REQUESTED por B-1/B-2/B-3/B-4), pero se anade a la
lista como punto 8.
