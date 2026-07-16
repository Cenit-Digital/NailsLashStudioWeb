# Bitácora TDD — F-02 `datos_negocio_fuente_unica`

Feature en curso: **2 — datos_negocio_fuente_unica** (`in_progress`, APROBADA).
Contrato: `features/datos_negocio_fuente_unica.feature` (`@s1..@s12`).
Depende de F-01 (`done`): `src/lib/placeholders.ts`, `src/lib/puerta.ts`.

Artefactos que construyo:
- `src/lib/site.ts` (NUEVO): fuente única del NAP + `telHref` + `waHref` + `registros`.
- `src/lib/site.test.ts` (NUEVO): los 12 escenarios, co-locado.
- `tools/puerta-placeholders.ts`: cablea `registros` (A-12) — el humilde, sin tests.
- `stryker.config.json`: añade `src/lib/site.ts` a `mutate`.

## Decisión de diseño: el normalizador E.164 (justificación pedida por el lead)

`placeholders.ts` tiene `PREFIJOS_INTERNACIONALES=['+34','0034']` y
`SEPARADORES_DE_TELEFONO=/[ -]/g` pero **no los exporta**. Dos opciones:
reexportarlos (tocar F-01, ya `done`) o una regla propia alineada en `site.ts`.

**Elegido: regla propia en `site.ts`, alineada con el comportamiento observable
de F-01, SIN acoplarse a internos no exportados.** Motivos:
1. **No toco F-01 (`done`).** Exportar constantes de `placeholders.ts` es
   producción nueva en un módulo cerrado sin un test rojo de F-01 que lo pida
   (violaría la Ley 1 sobre otra feature) y abre superficie de mutación cruzada.
2. **Superficie de mutación contenida.** Si `site.ts` importara constantes de
   `placeholders.ts`, mutarlas afectaría a dos módulos y enturbiaría la corrida
   de `--mutate src/lib/site.ts`.
3. **Una sola regla OBSERVABLE, garantizada por tests, no por código
   compartido.** `@s4` fija los separadores (espacio y guion) y los prefijos
   (`+34`, `0034`, y `34` = E.164 sin `+`) de `site.ts`; `@s9` prueba que el
   teléfono real de `site.ts` **encaja** con la vía por patrón de `placeholders.ts`
   sin falso positivo. El comportamiento común queda fijado por ambos lados.

Diferencia deliberada con `placeholders.ts`: `site.ts` reconoce también el
prefijo desnudo `34` (E.164 sin `+`), porque `@s4` exige que `34625223366` →
`tel:+34625223366` (idempotencia del número ya en E.164). `placeholders.ts` no
lo necesita porque su patrón nacional es `600123456` (9 dígitos, sin código país).

Anti-tautología (patrón de memoria
`testing/doble-de-test-anclado-al-literal-no-al-simbolo.md`, precedente WebEmpresa
`useIsMobile`/`MOBILE_QUERY`): cada salida esperada se escribe **a mano** en el
test (`'tel:+34625223366'`, `'34625223366'`, `'Hola%2C%20quiero%20cita'`, `%26`,
`%23`, `u%C3%B1as`, `%F0%9F%92%85`, `%C2%B7`); nunca se deriva de la constante de
`site.ts` ni se re-llama a `encodeURIComponent` dentro del test.

## Orden de los ciclos

`@s3` (telHref núcleo) → `@s5`/`@s6`/`@s7` (waHref) → `@s4` (Outline: fuerza el
prefijo y la idempotencia en el normalizador compartido) → `@s1`/`@s2` (datos) →
`@s8` (fuente única) → `@s9`/`@s10` (encaje con F-01) → `@s11`/`@s12` (errores,
fuerzan la validación).

## Ciclos (Rojo → Verde → Refactor)

Cada ciclo se corrió con `pnpm exec vitest run src/lib/site.test.ts`. Los "pasa a
la primera" (@s6, @s8, @s9, @s12) se verificaron mordiendo la producción a mano
(mutación manual → rojo → restaurar), como exige `docs/tdd.md`.

1. **@s3** — ROJO: `import { telHref } from './site'` no resuelve (módulo
   inexistente = falla). VERDE: `site.ts` mínimo, `telHref` quita separadores y
   antepone `+34` (sin quitar prefijo aún).
2. **@s5** — ROJO: `waHref` no exportado (TypeError). VERDE: `waHref` reutiliza
   `numeroE164`; el número sin `+` sale de `numeroE164(tel).slice(1)`; texto con
   `encodeURIComponent`. Helpers de test `numeroDelEnlace`/`textoDelEnlace` que NO
   asumen el host (A-10).
3. **@s6** — pasa a la primera (misma `encodeURIComponent`). MORDIDA verificada:
   muté a `encodeURI` → rojo en filas `&` (`&` sin `%26`), `#` (`#` sin `%23`) y
   `,` (`,` sin `%2C`) → restaurado.
4. **@s7** — ROJO: `waHref('625 22 33 66','')` emitía `?text=` vacío
   (`expected 'https://wa.me/34625223366?text=' not to contain 'text='`). VERDE:
   ternario `texto === '' ? enlace : ...`.
5. **@s4** — ROJO: 5 filas con prefijo daban doble `+34`
   (`'tel:+34+34625223366'`, `'tel:+3434625223366'`, `'tel:+340034625223366'`).
   VERDE: `sinPrefijoInternacional` recorre `['+34','0034','34']` y hace `slice`.
6. **@s1** — ROJO: `NOMBRE/DIRECCION/TELEFONO/HORARIO` `undefined` (5 fallos).
   VERDE: constantes `as const`; `DIRECCION` estructurada por partes.
7. **@s2** — ROJO: `GEO/REDES` `undefined` (4 fallos). VERDE: `GEO` (números),
   `REDES` (instagram/facebook, sin `tiktok`).
8. **@s8** — pasa a la primera (propiedad del código ya existente). MORDIDA
   verificada: cambié `TELEFONO.legible` a `'625 22 33 67'` → `@s8` Y `@s1` rojos
   (el texto y ambos href cambian a la vez) → restaurado.
9. **@s9** — pasa a la primera (integración con `detectarPlaceholders` real de
   F-01). MONTAJE no vacuo verificado: puse `'600 123 456'` como forma → SÍ
   produce violación (`[ { via:'patron', … } ]`) → restaurado.
10. **@s10** — ROJO: `registros` `undefined` (`toEqual` y `.map` fallan). VERDE:
    `registros` proyecta el NAP (valores derivados de las constantes,
    `esPlaceholder:false`, sin email). Cableado del humilde
    `tools/puerta-placeholders.ts` (A-12) y `pnpm build` verde (0 violaciones).
11. **@s11** — ROJO: `telHref` no lanzaba (5 filas). VERDE: `numeroNacional`
    valida el nacional contra `/^\d{9}$/` (única regla: caza vacío, letras, el
    punto que NO es separador, lo corto y >15 dígitos) y lanza si no encaja.
12. **@s12** — pasa a la primera vía el normalizador compartido (`waHref` →
    `numeroE164` → `numeroNacional`, que ya lanza por @s11). Confirma "una sola
    regla, no dos que diverjan".

## Mutación (baja concurrencia, lección de F-01)

`pnpm exec stryker run --mutate src/lib/site.ts --concurrency 2`.

- **1ª corrida: 96.49 %, 2 supervivientes** (0 timeouts, corrida tranquila).
  1. `throw new Error(\`…\`)` → `Error(\`\`)`: `@s11` con `toThrow()` sin mensaje no
     lo veía. Un error MUDO viola la "falla RUIDOSA" que el propio contrato exige
     (sección modos de error). **MATADO**: simplifiqué el mensaje a un literal
     único y `@s11`/`@s12` anclan el fragmento `'teléfono'` escrito a mano
     (`toThrow('teléfono')`) — precedente F-01 `@s22` (anclar la causa). No se
     importa la constante de producción (anti-tautología).
  2. `HOST_WHATSAPP = 'https://wa.me/'` → `''`: **mutante equivalente respecto al
     contrato** (A-10: el `.feature` ordena NO aseverar el host). Excluido
     quirúrgicamente (`// Stryker disable next-line all`), justificado en
     `progress/mutation_datos_negocio_fuente_unica.md`.
- **2ª corrida: 100 %** — 56 killed, 0 survived, 0 timeouts, 1 excluido. Umbral
  `break:100` superado. Node huérfanos matados tras cada corrida.

## Verificación final

- `pnpm test`: **84 verdes** (47 de F-01 + 37 de F-02).
- `pnpm typecheck && pnpm lint`: limpio, 0 warnings.
- `pnpm build`: producción verde — la puerta sobre los `registros` verificados da
  0 violaciones (@s10, A-12).
- `bin/harness init`: verde de punta a punta.

## Trazabilidad @s → test (todos en `src/lib/site.test.ts`)

- **@s1** (NAP exacto y estructurado) → `NAP verificado` → `@s1 el nombre…`,
  `@s1 la dirección está estructurada…`, `@s1 la dirección incluye cada parte…`,
  `@s1 el teléfono en forma legible…`, `@s1 el horario…`.
- **@s2** (geo, redes, no TikTok) → `@s2 la geolocalización…`, `@s2 Instagram…`,
  `@s2 Facebook…`, `@s2 no se expone ningún … TikTok`.
- **@s3** (telHref legible) → `@s3 normaliza el teléfono legible a "tel:+34625223366"`.
- **@s4** (separadores/prefijo/idempotencia) → Outline `@s4 telHref("%s") es
  "tel:+34625223366"` (8 filas).
- **@s5** (waHref sin `+` + urlencoded) → `@s5 lleva el número "34625223366"…`.
- **@s6** (encodeURIComponent) → Outline `@s6 escapa "%s" … a "%s"` (4 filas).
- **@s7** (texto vacío omite `?text=`) → `@s7 con texto vacío OMITE el parámetro text…`.
- **@s8** (fuente única) → `@s8 el texto y ambos href salen del mismo dato canónico…`.
- **@s9** (encaje vía patrón) → Outline `@s9 el teléfono real "%s" no produce
  ninguna violación` (3 filas), sobre `detectarPlaceholders` real.
- **@s10** (registros → puerta, A-11/A-12) → `@s10 registros proyecta el NAP…`,
  `@s10 la puerta de F-01 … no emite ninguna violación`,
  `@s10 el email NO figura…`. Efecto observable: `pnpm build` verde.
- **@s11** (telHref rechaza basura) → Outline `@s11 telHref("%s") lanza (%s)…` (5 filas).
- **@s12** (waHref rechaza igual) → `@s12 waHref lanza igual…`.

## Estado

Verde de punta a punta y mutación de `site.ts` al 100 %. **No** marco `done`:
espera al `judge` y al `mutation_tester` (protocolo). No hice commit ni toqué
`feature_list.json` ni el `.feature`.
