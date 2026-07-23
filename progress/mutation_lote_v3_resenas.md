# Mutación — LOTE v3+reseñas (feature 22 `galeria_carrusel` v3 + feature 14 `resenas_agregado_enlace`)

**Veredicto:** ESCALADO (FAIL: 2 de 6 ficheros bajo el umbral 100 %; **5 supervivientes MATABLES**
+ **2 equivalentes por construcción VERIFICADOS y documentados SIN excluir** — la exclusión o el
refactor son decisión del lead)
**Score:** detectados/puntuados, en el orden del encargo:
  - `src/components/carrusel-logica.ts` → 41/41 = **100.00 %** (exit 0)
  - `src/components/galeria-logica.ts` → 60/60 = **100.00 %** (exit 0)
  - `src/components/Galeria.tsx` → 138/139 = **99.28 %** (exit 1, 1 superviviente)
  - `src/components/Resenas.tsx` → 123/129 = **95.35 %** (exit 1, 6 supervivientes)
  - `src/components/resenas-logica.ts` → 30/30 = **100.00 %** (29 killed + 1 timeout, exit 0)
  - `src/lib/resenas-agregado.ts` → 4/4 = **100.00 %** (exit 0)
**Comandos:** `bin/harness mutate <fichero>`, los SEIS SECUENCIALES en el orden de arriba, sin
`--testFiles` (prohibido por stryker.config.json).
**Runner:** StrykerJS 9.6.1 · `vitest.stryker.config.ts` · `thresholds.break = 100` ·
`coverageAnalysis: perTest`.

## Precondiciones (estado REAL al medir, 2026-07-23)

- **Judge del lote: NO existe.** El último veredicto es `progress/judge_galeria_carrusel_v2.md`
  (APROBADO, contrato v2.1 @s1..@s19, 11:25). Ni la Enmienda 3 (@s20..@s24) ni el contrato de
  reseñas (@s1..@s9) tienen judge en el expediente. La corrida la ordenó el `craftsman_lead`
  explícitamente como puerta del lote; lo dejo anotado: **el re-judge sigue pendiente**.
- **`bin/harness init`:** lint 0 · typecheck 0 · **1304/1304 tests en 41 ficheros** (los 4
  build-based @s6 de `home-horneado.test.ts` corrieron aquí POR PRIMERA VEZ — tdd_resenas.md
  Decisión 6 — y PASAN). El resumen sale **FAIL ADMINISTRATIVO**: «Hay 2 features en in_progress
  (máximo 1)» — estado inherente a un lote de dos features; no es un fallo técnico.

## Tabla (clear-text de Stryker, corrida por corrida)

| # | File                | % score | instrumentados | puntuados | # killed | # timeout | # survived | # no cov | # errors | # ignored | exit |
|---|---------------------|--------:|---------------:|----------:|---------:|----------:|-----------:|---------:|---------:|----------:|-----:|
| 1 | carrusel-logica.ts  |  100.00 |             41 |        41 |       41 |         0 |          0 |        0 |        0 |         0 |    0 |
| 2 | galeria-logica.ts   |  100.00 |             60 |        60 |       60 |         0 |          0 |        0 |        0 |         0 |    0 |
| 3 | Galeria.tsx         |   99.28 |            142 |       139 |      138 |         0 |          1 |        0 |        0 |         3 |    1 |
| 4 | Resenas.tsx         |   95.35 |            132 |       129 |      123 |         0 |          6 |        0 |        0 |         3 |    1 |
| 5 | resenas-logica.ts   |  100.00 |             30 |        30 |       29 |         1 |          0 |        0 |        0 |         0 |    0 |
| 6 | resenas-agregado.ts |  100.00 |              4 |         4 |        4 |         0 |          0 |        0 |        0 |         0 |    0 |

- Dry-runs verdes: 186 tests (Galeria.tsx) · 96 (Resenas.tsx) · 244 (galeria-logica) · 107
  (resenas-logica) · 98 (resenas-agregado). 0 errores y 0 sin-cobertura en las seis corridas.
- El timeout único de `resenas-logica.ts` es un mutante del bucle a mano de `totalConMillar`
  (bucle infinito al mutar el incremento): Stryker lo cuenta DETECTADO. Legítimo.
- **`resenas-agregado.ts`: el diseño anti-estáticos del brief §7 FUNCIONÓ.** 4/4 killed, **cero
  supervivientes «Ran all tests»** — no hizo falta el diagnóstico de
  `progress/tdd_deuda_mutacion_full.md` (sin sabotajes): el módulo exporta el literal y nada más,
  y todo el formateo muere en `resenas-logica.ts` (donde el runner SÍ activa).

## Mutantes supervivientes (7 = 5 matables + 2 equivalentes verificados)

### Matables con DOS tests (5) — deuda de aserción real en `Resenas.tsx`

Los CINCO son el MISMO defecto: `StringLiteral` sobre los separadores explícitos de JSX
`{' '}` → `{""}`. Quitar ese espacio pega dos tramos de texto visibles («…Treatwell· dato…»,
«★★★★★4,9 de 5»): **NO son equivalentes** — `textContent` cambia. Sobreviven porque los tests de
@s2/@s7 aseveran los TROZOS por separado (`«4,9 de 5»`, `«1.239 opiniones»`…), nunca la línea
COMPLETA carácter a carácter.

- **src/components/Resenas.tsx:302:83** `{' '}` → `{""}` (entre las estrellas y la nota)
- **src/components/Resenas.tsx:303:66** `{' '}` → `{""}` (tras el «·» de la nota)
- **src/components/Resenas.tsx:304:68** `{' '}` → `{""}` (tras «opiniones en»)
- **src/components/Resenas.tsx:307:16** `{' '}` → `{""}` (tras el `</a>` de Treatwell)
  - Falta (UN test mata los CUATRO, cuelga de @s2 «en UNA línea»): localizar la línea del agregado
    SIN clase (regla del contrato): `screen.getByRole('link', { name: 'Treatwell' }).closest('p')`
    y aseverar su `textContent` EXACTO, escrito a mano:
    `'★★★★★ 4,9 de 5 · 1.239 opiniones en Treatwell · dato del 23/07/2026'` (con `toBe`, no
    `toContain`). La prohibición anti-segunda-copia de @s3 aplica a los BYTES de `Resenas.tsx`,
    no al test: los literales a mano en el test son justo el patrón del repo.
- **src/components/Resenas.tsx:389:88** `{' '}` → `{""}` (entre las estrellas y la nota de CADA tarjeta)
  - Falta (UN test, cuelga de @s7): la valoración de una tarjeta CONOCIDA del módulo demo
    (p. ej. localizar su cita a mano → `closest` de la lámina → el `<p>` de valoración) con
    `textContent` exacto a mano: `'★★★★★ 5 de 5'` (o `'★★★★☆ 4 de 5'` en una de nota 4 — mejor
    AMBAS, una por rama del redondeo).

### Equivalentes por construcción (2) — VERIFICADOS, documentados, NO excluidos (decisión del lead)

- **src/components/Galeria.tsx:257:9** `ConditionalExpression`
  - original: `raiz.current !== null && typeof IntersectionObserver === 'function'`
  - mutado:   `true && typeof IntersectionObserver === 'function'`
  - OJO: el mutante sustituye SOLO el operando IZQUIERDO (el diff del clear-text lo prueba); la
    guarda del `typeof` SIGUE en pie, así que en jsdom (sin IO) ambas versiones dan `false` y nada
    revienta. La diferencia solo sería observable si el efecto corriera con `raiz.current === null`
    **y** con `IntersectionObserver` definido — y ese estado NO es alcanzable: `ref={raiz}` va
    INCONDICIONAL en el `<div>` raíz que el componente siempre pinta (`Galeria.tsx:322`), y React
    fija los refs de host ANTES de ejecutar los efectos pasivos. El chequeo de null es defensa
    muerta DENTRO del componente: **misma familia exacta que `Reserva.tsx:61:9`**
    (`if (hilo.current)` → `if (true)`, mutante #4 de `progress/tdd_deuda_mutacion_full.md`).
  - Curas posibles (elige el lead): **(a) refactor por construcción** (el precedente de Reserva:
    extraer la decisión «¿observo este nodo?» a `carrusel-logica.ts` con el nodo como ARGUMENTO —
    el `null` pasa a ser entrada de test y el mutante muere por valor; cierra el par entero,
    ver el espejo de abajo), o **(b) exclusión documentada** in-situ con referencia a este informe
    (patrón terminal del repo). NO la ejecuto yo.
- **src/components/Resenas.tsx:220:9** `ConditionalExpression` — el ESPEJO exacto
  (`ref={raiz}` incondicional en `Resenas.tsx:290`; misma construcción, mismo veredicto,
  misma cura — una sola decisión debería cerrar los DOS).

## Exclusiones Stryker — auditoría contra el reporte (no solo contra el fuente)

- **`Galeria.tsx`: 3 ignorados, NO los «EXACTAMENTE 2» que esperaba el encargo.** Los tres, razón
  «Ignored using a comment»:
  1. `BooleanLiteral` 98:62 (`useState(false)` de `arranqueExplicito`) — el verificado del
     informe previo (`progress/mutation_galeria_carrusel.md`, antes 91:62).
  2. `ArrayDeclaration` 158:5 (deps `[]` del efecto de matchMedia) — el verificado del informe
     previo (antes 137:5).
  3. `ArrayDeclaration` 269:5 (deps `[]` del efecto de TECLADO @s23) — **NUEVO del Ciclo v3**,
     añadido por el `tdd_craftsman` (avisado en el diario § Ciclo v3, «Pendiente»), **jamás
     ratificado por una medición**. Lo RE-VERIFICO aquí: es la MISMA categoría ya verificada
     (deps CONSTANTES de un efecto solo-montaje: `["Stryker was here"]` compara el mismo literal
     con `Object.is` en cada render y nunca difiere → el efecto corre exactamente una vez en ambas
     versiones; el handler usa solo refs y setters estables). **Equivalente genuino** — pero la
     RATIFICACIÓN de la exclusión (o su retirada y litigio como superviviente) es del lead.
- **`Resenas.tsx`: 3 ignorados**, los PREANUNCIADOS en `progress/tdd_resenas.md` Decisión 8
  (anunciados como «dos exclusiones» por CATEGORÍA; son TRES comentarios): `BooleanLiteral` 79:62
  (`arranqueExplicito`) y `ArrayDeclaration` 130:5 y 232:5 (matchMedia y teclado). Re-verificados
  uno a uno como pedía la Decisión 8: el único lector de `arranqueExplicito` es `debeRotar`
  (`Resenas.tsx:96`) y `entra()` cancela en el mismo lote (251-253, cableado en 315/318) — la
  construcción verificada de Galeria, calcada; los dos efectos son solo-montaje. **No discrepo:
  válidas.** Su ratificación formal, con el lead.
- Ningún otro ignorado en ninguna de las seis corridas; los 4 módulos de lógica
  (`carrusel-logica`, `galeria-logica`, `resenas-logica`, `resenas-agregado`) tienen **0**
  comentarios `Stryker disable`.

## Incidentes de la corrida (dos, ambos cerrados y medidos)

1. **ENOENT en el sandbox por `dist/` — variante NUEVA del incidente de
   `progress/mutation_contacto.md`.** La primera corrida de `Galeria.tsx` reventó copiando
   `dist/static-loader-data-manifest-*.json`: el hash del manifest cambió entre el escaneo de
   Stryker y el copyfile (un hijo de build de los tests horneados del `init` aún coleaba).
   `ignorePatterns` cubre `.experimentos-tmp` y `.vite-react-ssg-temp` pero **no `dist/`**.
   Cura aplicada: borrar los ARTEFACTOS gitignorados `dist/` y `.stryker-tmp/` y relanzar
   (limpio a la primera). Sugerencia para el lead (config, vetada para mí): añadir `"dist"` a
   `ignorePatterns` de `stryker.config.json`.
2. **Incidente MÍO de restauración en `src/components/Galeria.tsx` — lo declaro entero.** Para
   diagnosticar el superviviente 257:9 apliqué un sabotaje a mano y lo restauré con
   `git checkout --`… que restaura a HEAD, y el fichero tenía el Ciclo v3 SIN COMMITEAR: borré
   el trabajo del `tdd_craftsman` del árbol. **Recuperado byte-exacto** del campo `source` del
   reporte HTML de Stryker (el fuente pre-mutación de la corrida sobre la versión v3) y validado
   por CUATRO vías: `git diff --stat` idéntico al previo (162+/36−), `prettier --check` limpio,
   `tsc --noEmit` limpio, **197/197** tests dirigidos de galería (la cifra exacta del diario v3), y
   la **re-medición Stryker calcó la original: 138 killed / 1 survived / 3 ignored (99.28 %)**.
   Lección operativa anotada: con trabajo sin commitear, la restauración de un sabotaje se hace
   desde COPIA del árbol de trabajo, nunca con `git checkout --`.
   (El propio sabotaje, además, era un instrumento ERRÓNEO: sustituí la condición ENTERA por
   `true` —75 rojos— cuando el mutante real solo muta el operando izquierdo; el diagnóstico bueno
   está arriba, en el análisis del clear-text.)

## Escalado (decisión para el `craftsman_lead`)

1. **Los 5 `{' '}` de `Resenas.tsx`** (matables) → `tdd_craftsman`: los DOS tests de arriba
   (línea del agregado completa por @s2; valoración de tarjeta por @s7) → re-mutación de
   `Resenas.tsx`. Con ellos muertos y el equivalente resuelto: 100 %.
2. **El par 257:9 / 220:9** (equivalentes verificados) → decidir UNA vía para ambos: refactor por
   construcción (precedente `desplazarAlFinal`) o exclusión documentada.
3. **La 3.ª exclusión de `Galeria.tsx` (269:5, teclado)** → ratificarla (verificada aquí) o
   retirarla y litigarla. Con el par resuelto, `Galeria.tsx` queda 100 %.
4. El **judge del lote** sigue pendiente en el expediente (v3 @s20..@s24 + reseñas @s1..@s9).

## Nota de proceso

Medí y reporté. NO toqué tests, ni configuración, ni `feature_list.json`; en `src/` solo el
sabotaje diagnóstico (restaurado byte-exacto, incidente 2 declarado arriba) y ningún cambio de
semántica queda en el árbol: el diff actual de `Galeria.tsx` vs HEAD es EXACTAMENTE el Ciclo v3
del craftsman. Las features NO cierran con estos números: umbral 100 %, y hay 5 matables.
