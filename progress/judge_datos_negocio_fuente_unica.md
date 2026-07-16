# Review — feature 2 (`datos_negocio_fuente_unica`)

**Veredicto:** APPROVED

Revisado contra el contrato APROBADO `features/datos_negocio_fuente_unica.feature`
(`@s1..@s12`), los 5 acceptance de `feature_list.json` (feature id 2), `CHECKPOINTS.md`,
`docs/tdd.md` y `docs/conventions.md`. El `.feature` NO se tocó salvo la cabecera de
aprobación (`git diff -- features/` solo muestra el bloque «Aprobado por el humano…»).

## Cobertura de escenarios (@s ↔ test) — todos en `src/lib/site.test.ts`
- @s1: [x] `@s1 el nombre…`, `@s1 la dirección está estructurada…`, `@s1 la dirección incluye cada parte…`, `@s1 el teléfono…`, `@s1 el horario…`
- @s2: [x] `@s2 la geolocalización…`, `@s2 Instagram…`, `@s2 Facebook…`, `@s2 no se expone ningún … TikTok`
- @s3: [x] `@s3 normaliza el teléfono legible a "tel:+34625223366"`
- @s4: [x] `it.each` `@s4 telHref("%s") es "tel:+34625223366"` (8 filas: separadores dobles, +34, 34, 0034)
- @s5: [x] `@s5 lleva el número "34625223366" sin "+" y el texto "Hola%2C%20quiero%20cita"`
- @s6: [x] `it.each` `@s6 escapa "%s" con encodeURIComponent a "%s"` (4 filas: %26, %23, %C3%B1/💅, %C2%B7)
- @s7: [x] `@s7 con texto vacío OMITE el parámetro text y conserva el número`
- @s8: [x] `@s8 el texto y ambos href salen del mismo dato canónico TELEFONO.legible`
- @s9: [x] `it.each` `@s9 el teléfono real "%s" no produce ninguna violación` (3 filas, `detectarPlaceholders` REAL de F-01)
- @s10: [x] `@s10 registros proyecta el NAP…`, `@s10 la puerta de F-01 … no emite ninguna violación`, `@s10 el email NO figura…`
- @s11: [x] `it.each` `@s11 telHref("%s") lanza … y no devuelve un tel: a medias` (5 filas)
- @s12: [x] `@s12 waHref lanza igual…`

Los 5 acceptance de feature_list quedan cubiertos:
A1 (NAP exacto) → @s1,@s2 · A2 (telHref E.164) → @s3,@s4 · A3 (waHref sin `+` + urlencoded) →
@s5,@s6,@s7 · A4 (fuente única) → @s8 · A5 (mutar normalización rompe test) → transversal @s3–@s7
(mutación de `site.ts` al 100 % reportada; se confirma en la puerta del `mutation_tester`).

## Anti-tautología (el hallazgo más buscado) — LIMPIO
- Cada literal esperado se escribe A MANO: `'tel:+34625223366'`, `'34625223366'`,
  `'Hola%2C%20quiero%20cita'` y cada `%XX` de @s6. Ninguno se deriva de una constante de
  `site.ts` ni se re-llama a `encodeURIComponent` dentro del test.
- `@s8`: la única aparición de una constante de producción (`TELEFONO.legible`) es como ENTRADA
  (el dato canónico bajo prueba), no como valor esperado. Correcto.
- `@s10`: `toEqual([...])` con array hand-written independiente (no `registros.map(...)` que
  reflejaría la constante). Mutar un dato o el flag en `site.ts` rompe este test.
- `@s11`/`@s12`: `toThrow('teléfono')` ancla un fragmento a mano, no la constante de producción.
- HOST de WhatsApp (A-10): ningún test asevera `'wa.me'`; los helpers `numeroDelEnlace`/
  `textoDelEnlace` extraen número y `text` sin conocer el host. EMAIL (A-11): `@s10` prueba que
  `centroesteticarozas@gmail.com` NO figura en `registros`.

## Fuente única (I-7, @s8)
texto visible, `telHref` y `waHref` derivan todos de `TELEFONO.legible` (declarado una sola vez
en `site.ts`). Ningún sitio reescribe el número a mano; los tres href comparten el nacional
`625223366`. Confirmado.

## Encaje con F-01 (@s9, @s10, A-12)
- @s9: el teléfono real `625223366 ≠ 600123456`; en sus 3 formas pasa la vía por patrón de
  `detectarPlaceholders` (real) sin falso positivo.
- A-12 CABLEADO: `tools/puerta-placeholders.ts:17,36` importa `registros` de `src/lib/site.ts`
  y los pasa a `ejecutarPuerta` (ya NO es `never[] = []`). `pnpm build` corrido por mí:
  «✓ Puerta de placeholders: el artefacto de producción no tiene placeholders.» → build verde.

## Modos de error (@s11, @s12)
`numeroNacional` valida contra `/^\d{9}$/` y LANZA (`Error('la entrada no es un teléfono español
válido')`) ante cadena vacía, letras, número corto, el punto (no separador) y >15 dígitos. El
throw ocurre en `numeroNacional` ANTES de construir el string, así que `telHref`/`waHref` no
devuelven ningún `tel:`/URL a medias. `waHref` comparte el mismo normalizador (una sola regla).

## Disciplina TDD
- ¿Producción sin test que la pida? NO. Cada export está ejercido; el único punto no aseverado
  (`HOST_WHATSAPP`, `site.ts:73`) lo ordena el contrato (A-10) y está documentado/excluido con
  justificación en `progress/mutation_datos_negocio_fuente_unica.md`. Sin alcance inflado
  (nada de JSON-LD ni `estaAbierto`, que son F-04/F-10).
- ¿Evidencia de Rojo→Verde→Refactor? SÍ. `progress/tdd_datos_negocio_fuente_unica.md` traza 12
  ciclos; los «pasa a la primera» (@s6, @s8, @s9, @s12) se verificaron mordiendo la producción a
  mano (mutación manual → rojo → restaurar), como exige `docs/tdd.md`.

## Calidad (lente de artesano)
- Funciones cortas, un solo motivo de cambio (`sinPrefijoInternacional`, `numeroNacional`,
  `numeroE164`, `telHref`, `waHref`, `verificado`). Nombres reveladores; sin duplicación (un solo
  normalizador compartido); sin números mágicos sueltos (constantes nombradas).
- Contrato de errores correcto: la capa pura (`site.ts`) LANZA `Error` de dominio; el humilde
  (`tools/puerta-placeholders.ts`) informa por `console.error` y sale con exit code. Alineado con
  `docs/conventions.md`.
- Arquitectura respetada: `site.ts` en `src/lib/`, import de `RegistroDatos` SOLO de tipo (type
  stripping lo borra, no acopla en runtime). Sin logs de debug ni TODOs. Sin dependencias nuevas.

## Verificación ejecutada por el juez
- `pnpm test`: **84 passed** (47 F-01 + 37 F-02), 4 files.
- `pnpm typecheck && pnpm lint`: limpio, **0 warnings**.
- `pnpm build`: **verde** (puerta sobre `registros` → 0 violaciones).
- `bin/harness init`: **exit 0**, todo verde.
- `git diff -- features/`: solo la cabecera de aprobación; ningún escenario debilitado. Tests
  nuevos (untracked), nada que se haya aflojado.

## Checkpoints
- C1 (arnés completo, init verde): [x]
- C2 (estado coherente, una feature in_progress): [x]
- C3 (arquitectura, sin deps ni debug): [x]
- C4 (verificación real, >0 tests verdes por módulo): [x]
- C5 (sesión: `progress/` al día): [x]
- C6 (contrato Gherkin: cada @s con test, sin producción sin test): [x]
- C7 (mutación ≥ umbral): [ ] pendiente — lo valida el `mutation_tester` (puerta distinta).
  El `tdd_craftsman` reporta 100 % con 1 exclusión justificada (HOST_WHATSAPP, A-10).

## Cambios requeridos
Ninguno.
