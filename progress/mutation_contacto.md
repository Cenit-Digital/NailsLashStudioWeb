# Mutación — feature 12 `contacto`

**Veredicto:** ESCALADO (FAIL: 90.59 % < umbral 100 %; 0 exclusiones nuevas, tal como ordenó el judge)
**Score:** detectados/total = 77/85 = **90.59 %** (umbral: 100 %)
  - `src/lib/site.ts` → 74/76 = **97.37 %** (2 sobrevivientes)
  - `src/components/Contacto.tsx` → 3/9 = **33.33 %** (6 sobrevivientes)
**Comandos:** `bin/harness mutate src/lib/site.ts` y después `bin/harness mutate src/components/Contacto.tsx`
(secuencial, sin `--testFiles`, como manda stryker.config.json)
**Runner:** StrykerJS 9.6.1 · vitest.stryker.config.ts · site.ts Done in 40 s (exit 1) ·
Contacto.tsx Done in 11 s (exit 1) — `thresholds.break = 100`

## Tabla (clear-text de Stryker)

| File         | % score | total | # killed | # timeout | # survived | # no cov | # errors |
| ------------ | ------: | ----: | -------: | --------: | ---------: | -------: | -------: |
| site.ts      |   97.37 |    76 |       74 |         0 |          2 |        0 |        0 |
| Contacto.tsx |   33.33 |     9 |        3 |         0 |          6 |        0 |        0 |

- site.ts instrumentó **77** mutantes; el nº 77 es la exclusión PREEXISTENTE y documentada de F-02
  (`HOST_WHATSAPP`, `// Stryker disable next-line all`, site.ts:72-73, justificada en
  `progress/mutation_datos_negocio_fuente_unica.md`). **Exclusiones NUEVAS de esta puerta: NINGUNA.**
- Dry-runs: 325 tests (site.ts) · 13 tests (Contacto.tsx: `contacto.test.tsx` +
  `boton-whatsapp-montaje.test.tsx` + `home.test.tsx`). Los `*-horneado.test.*` quedan FUERA de la
  mutación por diseño (vitest.stryker.config.ts); corren en `pnpm test`/`bin/harness verify`.
- **0 timeouts en ambas corridas** → la puntuación no está inflada por contención de CPU.

## Mutantes sobrevivientes (8) — NINGUNO es equivalente; todos matables

### `src/lib/site.ts` (2) — los mensajes de error de `instagramHref` no se aseveran

- **src/lib/site.ts:125:21**  `StringLiteral`
  - original: `throw new Error('el handle de Instagram debe empezar por "@"')`
  - mutado:   `throw new Error("")`
  - Por qué sobrevive: @s2/@s3 usan el helper `resultadoODisparo` (site.test.ts:260), que colapsa
    CUALQUIER excepción en el valor `'LANZÓ'` sin mirar el mensaje. El error queda MUDO y ningún
    test lo nota — justo lo que el propio site.ts:89 («falla ruidosa, no un error mudo») y el judge
    («errores nombrados y ruidosos») declaran como parte del contrato de calidad.
  - Falta: aseverar el mensaje, con el MISMO patrón que F-02 usa en site.test.ts:219
    (`toThrow('teléfono')`): p. ej. `expect(() => instagramHref('nailslash.studio_')).toThrow('empezar por "@"')`.

- **src/lib/site.ts:133:21**  `StringLiteral`
  - original: `throw new Error('el handle de Instagram no es válido')`
  - mutado:   `throw new Error("")`
  - Por qué sobrevive: mismo motivo (los casos `solo_arroba` / `arroba_con_espacio` de @s2 solo
    comprueban `'LANZÓ'`).
  - Falta: `expect(() => instagramHref('@')).toThrow('no es válido')` (y/o el caso con espacio).

### `src/components/Contacto.tsx` (6) — TODO el hueco está en el código DEMO post-judge

Contexto para el lead: el judge aprobó F-12 sobre la forma original de `Contacto.tsx` (sin WhatsApp,
sin mapa, sin horario). Los PR de demo (#1/#5) EVOLUCIONARON el componente (horario de F-10, clases
`demo-*`, CTA WhatsApp, bloque mapa con `MAPS_HREF`) sin extender `contacto.test.tsx`, que es el
test que la mutación ve (los horneados están excluidos por diseño). Los 3 mutantes del código
original juzgado (tel/IG/dirección) MURIERON; los 6 vivos son todos de la capa demo.

- **src/components/Contacto.tsx:35:26**  `ArrowFunction`
  - original: `horario.map((fila) => (<div …>{fila.dias}…{fila.franja}…</div>))`
  - mutado:   `horario.map(() => undefined)`
  - Por qué sobrevive: el bloque de horario visible desaparece ENTERO del render y ningún test lo
    asevera (@s6 de F-10 vive en otros ficheros/horneados).
  - Falta: en `contacto.test.tsx`, aseverar sobre el `renderToString` que las filas de
    `horarioParaUI(HORARIO_SEMANAL)` aparecen (esperados literales A MANO del horario verificado:
    días y franjas `10:00-20:00` / `10:00-14:00` / domingo cerrado, según el formato de `horarioParaUI`).

- **src/components/Contacto.tsx:20:19**  `StringLiteral` (mutante ESTÁTICO: corrió TODA la suite y nadie falló)
  - original: ``const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${GEO.latitud}%2C${GEO.longitud}` ``
  - mutado:   ``const MAPS_HREF = ` ` `` (vacío)
  - Por qué sobrevive: nadie asevera el href de «Cómo llegar». Un href vacío rompería el enlace de
    Maps en producción sin que la suite se entere.
  - Falta: aseverar el href EXACTO del enlace «Cómo llegar»
    (`https://www.google.com/maps/search/?api=1&query=40.5179875%2C-3.9226688`, esperado a mano
    desde las coordenadas [V] de F-02).

- **src/components/Contacto.tsx:26:25**  `StringLiteral`
  - original: ``<section className={`demo-seccion ${estilos.contacto}`} …>`` → mutado: `className={``}`
- **src/components/Contacto.tsx:27:23**  `StringLiteral`
  - original: ``<div className={`demo-contenedor ${estilos.rejilla}`}>`` → mutado: `className={``}`
- **src/components/Contacto.tsx:64:26**  `StringLiteral`
  - original: ``className={`demo-btn demo-btn--wa ${estilos.wa}`}`` (CTA WhatsApp) → mutado: `className={``}`
- **src/components/Contacto.tsx:77:24**  `StringLiteral`
  - original: ``className={`demo-btn demo-btn--solido ${estilos.comoLlegar}`}`` («Cómo llegar») → mutado: `className={``}`
  - Por qué sobreviven (los 4): ningún test asevera las clases. Bajo `css:false` los tokens de
    módulo (`estilos.*`) no son aseverables, pero los literales `demo-seccion` / `demo-contenedor` /
    `demo-btn demo-btn--wa` / `demo-btn demo-btn--solido` SÍ quedan en el HTML del render y el
    mutante los borra: perder esas clases destroza el layout/estilo demo sin que la suite se entere.
    NO son equivalentes (el atributo class del artefacto cambia de forma observable).
  - Falta: aserciones de clase en `contacto.test.tsx` sobre los literales `demo-*` (patrón estático,
    no condicional — no choca con la regla del repo contra `className` condicional).

## Equivalentes / exclusiones
- Equivalentes: **NINGUNO**. Los 8 sobrevivientes son matables con tests.
- Exclusiones nuevas: **NINGUNA** (orden explícita del judge: si resiste, se ESCALA, no se excluye).

## Escalado (decisión para el `craftsman_lead`)
1. Los 2 de `site.ts` son deuda directa de F-12: `tdd_craftsman` → 2 aserciones de mensaje
   (patrón F-02 `toThrow(...)`) → re-judge → re-mutación.
2. Los 6 de `Contacto.tsx` nacen del DEMO post-judge, no del F-12 juzgado. El lead decide el
   encuadre: (a) `tdd_craftsman` extiende `contacto.test.tsx` para cubrir horario/MAPS_HREF/clases
   demo (vía preferida: el fichero es objetivo de la puerta tal y como está en la rama), o
   (b) re-acotar la puerta al alcance juzgado — decisión que NO me corresponde; yo mido el fichero
   tal cual está en `feat/galeria-coverflow-3d`.

## Nota de proceso e incidente de infraestructura
- Solo mido y reporto: NO toqué `src/` ni tests ni configuración.
- La PRIMERA corrida de site.ts (01:10) se estrelló con `ENOENT copyfile` ANTES de medir: una sesión
  paralela lanzaba `bin/harness test` repetidamente y sus suites crean/borran `.experimentos-tmp/` y
  `.vite-react-ssg-temp/` en la raíz mientras Stryker copiaba su sandbox. Se re-ejecutó en ventana de
  calma (y se limpiaron los residuos gitignorados huérfanos): ambas corridas de medición salieron
  limpias (0 errores, 0 timeouts). Sugerencia para el lead (opcional): añadir esos dos directorios a
  `ignorePatterns` de stryker.config.json para inmunizar la mutación frente a suites concurrentes.

---

## Re-medición tras el remate (2026-07-23) — los 8 sobrevivientes, MUERTOS

**Veredicto:** PASS
**Score:** detectados/total = 85/85 = **100.00 %** (umbral: 100 %)
  - `src/lib/site.ts` → 76/76 = **100.00 %** (0 sobrevivientes)
  - `src/components/Contacto.tsx` → 9/9 = **100.00 %** (0 sobrevivientes)
**Comandos:** los mismos, en el mismo orden: `bin/harness mutate src/lib/site.ts` y después
`bin/harness mutate src/components/Contacto.tsx` (secuencial, sin `--testFiles`)
**Runner:** StrykerJS 9.6.1 · vitest.stryker.config.ts · site.ts Done in 31 s (**exit 0**) ·
Contacto.tsx Done in 9 s (**exit 0**) — «Final mutation score of 100.00 is greater than or
equal to break threshold 100» en ambas corridas

### Tabla (clear-text de Stryker)

| File         | % score | total | # killed | # timeout | # survived | # no cov | # errors |
| ------------ | ------: | ----: | -------: | --------: | ---------: | -------: | -------: |
| site.ts      |  100.00 |    76 |       76 |         0 |          0 |        0 |        0 |
| Contacto.tsx |  100.00 |     9 |        9 |         0 |          0 |        0 |        0 |

- site.ts instrumentó **77** mutantes, como en la Ronda 1: el 77º sigue siendo la exclusión
  PREEXISTENTE y documentada de F-02 (`HOST_WHATSAPP`, site.ts:72-73). **Exclusiones nuevas:
  NINGUNA.** Producción intacta: ni `site.ts` ni `Contacto.tsx` figuran modificados en `git
  status` — el remate fue SOLO tests, tal y como declara el diario (`progress/tdd_contacto.md`).
- Dry-runs verdes: 331 tests (site.ts) · 17 tests (Contacto.tsx; antes 13 — entran los 4 nuevos
  del remate). **0 timeouts, 0 sin cobertura, 0 errores** en ambas corridas; sin rastro del
  incidente ENOENT (los `ignorePatterns` de stryker.config.json hicieron su trabajo).

### Los 8, uno a uno — cada mutante cazado por SU matador (clear-text de Stryker)

| Mutante (Ronda 1) | Estado | Test que lo mató |
| --- | --- | --- |
| `site.ts:125:21` (mensaje «empezar por "@"» vaciado) | MUERTO | `@s3 el handle sin "@" lanza un error que nombra la regla: «empezar por "@"»` (killed 1) |
| `site.ts:133:21` (mensaje «no es válido» vaciado) | MUERTO | `@s2 el handle inválido lanza un error que nombra el problema: «no es válido»` (killed 1) |
| `Contacto.tsx:35:26` (`horario.map(() => undefined)`) | MUERTO | `cada fila empareja sus días con su franja: L-V 10:00–20:00, Sábado 10:00–14:00 y Domingo Cerrado` (killed 1) |
| `Contacto.tsx:20:19` (`MAPS_HREF` vaciado, ESTÁTICO) | MUERTO | `el href es EXACTAMENTE el formato oficial Maps URLs ?api=1&query=lat%2Clng` (killed 1) |
| `Contacto.tsx:26` (`demo-seccion …` vaciado) | MUERTO | `la <section> lleva demo-seccion y la rejilla demo-contenedor` (killed 2) |
| `Contacto.tsx:27` (`demo-contenedor …` vaciado) | MUERTO | el mismo (killed 2) |
| `Contacto.tsx:64` (`demo-btn demo-btn--wa …` vaciado) | MUERTO | `el CTA de WhatsApp viste demo-btn demo-btn--wa y «Cómo llegar» demo-btn demo-btn--solido` (killed 2) |
| `Contacto.tsx:77` (`demo-btn demo-btn--solido …` vaciado) | MUERTO | el mismo (killed 2) |

### Cierre
La puerta de mutación de la feature 12 `contacto` PASA: 100.00 % ≥ umbral 100 %, con 0
sobrevivientes, 0 equivalentes y 0 exclusiones nuevas. El escalado de la Ronda 1 queda resuelto
por la vía (a) que eligió el lead (extender los tests a la capa demo). Solo mido y reporto: NO
toqué `src/`, ni tests, ni configuración.
