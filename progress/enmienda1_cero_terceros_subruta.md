# ENMIENDA 1 a `features/cero_terceros.feature` — subruta de despliegue (2026-07-25)

> Registro de decisión del `gherkin_author`. Amplía el contrato ya aprobado de F-05
> (`cero_terceros`, `feature_list.json` id 5, `status: done`, mutación 100 %) sin tocar
> `src/lib/puerta-terceros.ts`, `src/lib/terceros.test.ts` ni `vite.config.ts`. Esa implementación
> queda para un `tdd_craftsman` sobre este contrato ya amendado.

## 1. Caso de uso que lo motiva

Desplegar el sitio en la subcarpeta de un dominio ajeno al propio (GitHub Pages **DE PROYECTO**,
no de usuario/organización — Pages de usuario vive en la raíz de `usuario.github.io`, Pages de
proyecto vive en `usuario.github.io/<repo>/`), concretamente
`https://cenit-digital.github.io/NailsLashStudioWeb/`.

Ese despliegue exige `base: '/NailsLashStudioWeb/'` en `vite.config.ts`. Verificado el
2026-07-25 en `progress/tdd_subruta_github_pages.md` por un `tdd_craftsman` en una tarea directa
(fuera del pipeline de `feature_list.json`, tocando solo `src/main.tsx` y
`src/components/Cabecera.tsx`): es el **único** mecanismo real — el flag `--base` de la CLI de
`vite-react-ssg build` existe pero, inspeccionado el código fuente de la librería
(`node_modules/vite-react-ssg/dist/shared/vite-react-ssg.*.mjs`, función `build()`), solo alimenta
el `publicPath` de `beasties`/`critters` (CSS crítico inline); NO se propaga a
`import.meta.env.BASE_URL` ni al `basename` de react-router. El intento de fijar `base` dinámico
en `vite.config.ts` rompió el build normal (`pnpm build` sin `PAGES_BASE_PATH`) contra
`violacionesDeBase` en `src/lib/puerta-terceros.ts`, y se revirtió sin tocar la puerta — bloqueo
documentado, recomendación entregada al `craftsman_lead`/humano.

## 2. El bloqueo exacto en el contrato original

`@s27` (`Scenario Outline: la puerta asevera la config base de vite.config.ts, ADEMÁS de la
salida`) fijaba, en su tabla de `Examples` y en el comentario que la acompañaba: *"pasa `base` no
declarada o declarada EXACTAMENTE `'/'`; cualquier otra cosa es violación"*. La fila
`base es "/subcarpeta/"` daba código `1` (violación) — el mismo trato que
`base es "https://cdn.evil.example/x/"`.

## 3. Análisis: los dos invariantes reales, no el literal exacto

El comentario de cabecera de `@s26` (que `@s27` cita como "razón 1") da la razón EXACTA por la que
la puerta exige rutas root-absolutas: *"la ruta es root-absoluta (`url(/assets/…woff2)`), NO
relativa (...). Una puerta que exigiera `url(./…)` DA FALSO NEGATIVO."* — es decir, el invariante
real que `@s26`/`@s27` protegen son **dos**, y son **distintos**:

1. **Cero origen de terceros**: `base` no puede ser una URL absoluta con esquema/host
   (`https://cdn.evil.example/x/`) ni protocolo-relativa (`//cdn.tercero.com/`) — eso SÍ reescribe
   los `url()` del CSS hacia fuera del propio dominio (medido con un build real: `base:
   'https://cdn.evil.example/x/'` produce `url(https://cdn.evil.example/x/assets/…woff2)`).
2. **Ruta root-absoluta, no relativa**: `base` no puede ser una ruta relativa como `'./'` — eso
   rompe la propiedad de que los `url()` sean resolubles sin depender de dónde vive el documento
   que los referencia.

Una subcarpeta como `/NailsLashStudioWeb/` (empieza por `/`, no contiene `://`, no empieza por
`//`) **satisface los dos invariantes reales**: sigue siendo root-absoluta (no relativa) y sigue
siendo del MISMO origen (no hay ningún host ajeno). La regla anterior («debe ser el literal exacto
`/`») era una implementación MÁS CONSERVADORA que el invariante que dice proteger — escrita el
2026-07-17, cuando el único valor observado en el repo era `/` a secas y nadie necesitaba una
subcarpeta. La fila `/subcarpeta/` ya estaba en la tabla, pero el razonamiento citado ("rompe el
invariante de la ruta root-absoluta") en realidad solo aplica a `'./'` — nunca aplicó a
`/subcarpeta/`. El comentario original conflacionó dos casos distintos bajo una única regla "todo
menos `/` exacto es violación".

**Conclusión:** ampliar la regla a los dos invariantes reales (en vez del literal exacto) NO
debilita ninguna guarda existente: sigue rechazando exactamente los mismos casos peligrosos
(esquema/host de tercero, protocolo-relativo, ruta relativa) y amplía el conjunto de rutas que
pasan solo con subcarpetas same-origin root-absolutas.

## 4. Qué cambió en la tabla de `@s27`, y por qué

| Fila | Antes | Ahora | Motivo |
| --- | --- | --- | --- |
| `no se declara base` | `0` | `0` (sin cambio) | Estado real de hoy del repo; no depende del literal. |
| `base es exactamente "/"` | `0` | `0` (sin cambio) | Caso trivial de ruta root-absoluta same-origin. |
| `base es "/subcarpeta/"` | **`1`** | **`0`** (CAMBIA) | Empieza por `/`, no contiene `://`, no empieza por `//` → satisface los dos invariantes reales. Ancla la ampliación. |
| `base es "/NailsLashStudioWeb/"` | (no existía) | **`0`** (NUEVA) | El caso REAL de despliegue que motiva la enmienda (GitHub Pages de proyecto). Sin esta fila, la ampliación quedaría anclada solo por un nombre genérico y no por el caso de negocio real. |
| `base es "https://cdn.evil.example/x/"` | `1` | `1` (sin cambio) | Sigue conteniendo `://`: URL absoluta con esquema, origen de tercero. |
| `base es "https://cdn.tercero.com/"` | `1` | `1` (sin cambio) | Igual razón que la anterior. |
| `base es "//cdn.tercero.com/"` | (no existía) | **`1`** (NUEVA) | Ancla el caso protocolo-relativo específicamente para `base` (no para el CSS, que ya lo cubre `@s8`/`@s26`). Antes de la enmienda, este caso fallaba "porque no es el literal exacto"; con la regla nueva, expresada en tres condiciones independientes, hace falta una fila propia que obligue a que la condición "empieza por `//`" se implemente como rechazo explícito y no se confunda con "empieza por `/`" (que ahora SÍ pasa). Sin esta fila, una implementación que solo comprobara `startsWith('/')` pasaría erróneamente el protocolo-relativo. |
| `base es "./"` | `1` | `1` (sin cambio) | Sigue sin empezar por `/`: ruta relativa, rompe el invariante de la ruta root-absoluta. Es la única fila que ancla ese invariante en solitario tras la ampliación. |

Filas conservadas intactas (`no se declara base`, `base es exactamente "/"`,
`https://cdn.evil.example/x/"`, `https://cdn.tercero.com/"`, `./"`): ninguna de ellas depende del
literal exacto `/` para su resultado — cada una ya fallaba o pasaba por una de las dos razones
reales (esquema de tercero o ruta relativa), así que la reescritura de la regla no les afecta.

## 5. Otros escenarios de `cero_terceros.feature` revisados

Grep de `base es|declara base|BASE_PROPIA|literal exacto` sobre todo el fichero: además de
`@s27`, las únicas siete apariciones adicionales de una precondición de `base` son
`And un vite.config.ts que no declara base` (`@s26`, `@s28`, `@s31`, `@s34`, `@s35`, `@s38`) o su
variante `...que no declara base y un CSS sin ningún origen externo` (`@s28`, `@s29`). Ninguna de
ellas fija `base` a un valor concreto distinto de "no declarada": todas usan el estado neutro
(equivalente a `base` ausente), que pasa igual bajo la regla antigua y la nueva. **Ningún otro
escenario de este fichero queda inconsistente con la ampliación de `@s27`.** En particular, `@s26`
(el escenario "hermano" que la cabecera de `@s27` cita como "razón 1") ya usaba "no declara base"
como precondición fija desde su propio diseño — es AJENO al literal exacto del valor de `base`, y
no se toca.

## 6. Qué NO se tocó

- `src/lib/puerta-terceros.ts`, `src/lib/terceros.test.ts`, `vite.config.ts`: implementación,
  queda para el `tdd_craftsman`.
- `feature_list.json`: el `status` de F-05 sigue `done`; esta enmienda no reabre el ciclo completo
  de la feature, solo amplía su contrato — el mismo patrón que la ENMIENDA 4 de
  `resenas_agregado_enlace`/`galeria_carrusel`.
- Cualquier otro `.feature` del repo.
- El número total de escenarios de `cero_terceros.feature` (43, `@s1`..`@s43`): la enmienda amplía
  la tabla de un escenario existente, no añade ni retira escenarios.
