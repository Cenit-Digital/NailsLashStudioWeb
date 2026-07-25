# ENMIENDA 1 a `features/cascaron_semantico.feature` — puerta anti-404 bajo una base de despliegue
# declarada (2026-07-25)

> Registro de decisión del `gherkin_author`. Amplía el contrato ya aprobado de F-04
> (`cascaron_semantico`, `feature_list.json` id 4, `status: done`, mutación 100 %) sin tocar
> `src/lib/puerta-cascaron.ts`, `src/lib/puerta-cascaron.test.ts`, `tools/puerta-cascaron.ts` ni
> `vite.config.ts`. Esa implementación queda para un `tdd_craftsman` sobre este contrato ya
> amendado.

## 1. Caso de uso que lo motiva

El mismo que la ENMIENDA 1 de `cero_terceros.feature` (mismo día): desplegar el sitio en
`https://cenit-digital.github.io/NailsLashStudioWeb/` (GitHub Pages **DE PROYECTO**) exige
`base: '/NailsLashStudioWeb/'` en `vite.config.ts`. Esa parte del despliegue ya está desbloqueada:
`cero_terceros.feature` ENMIENDA 1 (@s27) amplió `violacionesDeBase` para aceptar cualquier ruta
same-origin root-absoluta, no solo el literal `/`, y `src/lib/puerta-terceros.ts` ya lo implementa
(`esRutaPropiaRootAbsoluta`, mutación 100 %, verificado en `progress/tdd_subruta_github_pages.md`
§Remate).

## 2. El bloqueo exacto (medido por un `tdd_craftsman` en la misma sesión)

Con `base: '/NailsLashStudioWeb/'` activa, `src/components/Cabecera.tsx` hornea el ÚNICO href
interno absoluto que el sitio emite hoy (el enlace de marca, vía `import.meta.env.BASE_URL`) como
`href="/NailsLashStudioWeb/"` en el HTML real de `dist/index.html`.

`src/lib/puerta-cascaron.ts` (F-04, PUERTA ANTI-404, A-17, `@s23`/`@s24`) compara cada href interno
(`esRutaInterna`, línea ~552: empieza por `/`, no por `//`) contra `rutasDelArtefacto`
(`violacionesDeRutasAusentes`/`inspeccionarSitio`, línea ~638/656: `new Set(paginas.map(pagina =>
pagina.ruta))`), un conjunto de rutas LÓGICAS derivadas de los ficheros FÍSICOS de `dist/`
(`rutaDelFichero`, línea ~706: `dist/index.html` → `/`). GitHub Pages sirve `dist/` **TAL CUAL**
bajo la subruta, **sin que el build cree ninguna subcarpeta física** — `dist/index.html` sigue
siendo la ruta lógica `"/"`, nunca `"/NailsLashStudioWeb/"`.

Resultado medido: `/NailsLashStudioWeb/` no está en `rutasDelArtefacto` → la puerta lo marca como
enlace roto (404). **FALSO POSITIVO**: el destino SÍ existe (es `dist/index.html`), la puerta solo
no sabe traducir la URL pública (con el prefijo de `base`) a la ruta lógica del artefacto.

## 3. Análisis: qué cuenta como «interno» y qué cuenta como «existe» cuando hay una `base`

Sin `base` declarada (el estado de HOY), «interno» = «empieza por `/`» y «existe» = «está
literalmente en `rutasDelArtefacto`». Con `base` declarada a una subcarpeta same-origin
root-absoluta legítima (p. ej. `/NailsLashStudioWeb/`), el invariante real que A-17 protege — *«el
destino de un enlace del propio sitio existe en el artefacto que este build produjo»* — exige
traducir la URL pública a la ruta lógica **quitando el prefijo de la base antes de comparar**:

- Un href que **empieza por el prefijo de `base`** → el **RESTO** (lo que queda tras quitar el
  prefijo, con `/` delante si no está vacío) es la ruta lógica candidata. Si esa ruta lógica **SÍ**
  está en `rutasDelArtefacto` → NO es violación (@s37, filas de prefijo). Si **NO** está →
  **SIGUE siendo violación** (@s36): la base NO debe convertirse en un comodín que oculte un 404
  real, ni en mayúsculas/minúsculas distintas (la resolución de rutas del artefacto no es un juego
  de cajas, mismo invariante que @s23).
- Un href que **NO empieza por el prefijo de `base`**, cuando SÍ hay una `base` declarada → ver §4.
- Sin `base` declarada → comportamiento IDÉNTICO al actual (@s23/@s24, sin tocar).

La generalización del «resto» (no solo el caso trivial `href === base` → home) se ancla aparte en
@s38, con un fixture de dos rutas sobre el decisor puro (`inspeccionarSitio`), porque F-04 hoy solo
emite la home (`RUTAS_ESPERADAS = ['/']`) y el escenario nacería inerte sobre el `dist/` real —
mismo argumento que ya usa @s14 de este mismo contrato.

## 4. La decisión más delicada: un href SIN el prefijo de la base, cuando SÍ hay base declarada

Caso concreto: `base = '/NailsLashStudioWeb/'` y alguien escribe a mano `href="/otra-cosa"`. ¿Es un
404 real (interno-roto) o queda fuera del ámbito de esta puerta?

**Decisión: queda FUERA del ámbito de esta puerta — se trata como los externos (mismo trato que
`https://…`), NO como violación.**

Razón, por el mismo argumento que ya usa `esRutaInterna` para excluir lo que la puerta NO PUEDE
VERIFICAR (externos, `tel:`, `mailto:`, anclas): bajo GitHub Pages **DE PROYECTO**, la raíz del
origen (`cenit-digital.github.io/`, SIN el prefijo `/NailsLashStudioWeb/`) puede alojar un sitio
**DISTINTO Y LEGÍTIMO** — GitHub Pages **DE USUARIO/ORGANIZACIÓN**, que vive exactamente ahí [V,
citado y verificado el mismo día en `progress/enmienda1_cero_terceros_subruta.md` §1]. Esta puerta
SOLO conoce `dist/` — el artefacto que ESTE build produjo. No tiene ninguna autoridad ni
visibilidad sobre lo que existe en la raíz del origen cuando el propio despliegue declara que su
sitio vive en una subcarpeta. Marcar `/otra-cosa` como «roto» sería **ASEVERAR ALGO QUE ESTA PUERTA
NO PUEDE SABER** — podría apuntar a una página real de un sitio hermano, y el build rompería un
enlace que en producción SÍ funciona. Es exactamente el tipo de falso positivo que la puerta ya
evita a propósito para todo lo que cae fuera de `esRutaInterna`.

**Contraargumento considerado y descartado**: tratar `/otra-cosa` (sin prefijo) como interno-roto,
razonando que es casi seguro un error de autoría (alguien olvidó `import.meta.env.BASE_URL`). Se
descarta porque: (1) el coste de un falso positivo (romper el build de un enlace real a un sitio
hermano legítimo) es más grave y más difícil de diagnosticar que el coste de un falso negativo (un
bug de autoría que un `code review` normal detecta, porque HOY el único mecanismo del repo para
emitir un href interno es `import.meta.env.BASE_URL`, que SIEMPRE incluye el prefijo por
construcción — el hueco es teórico hasta que alguien lo contradiga a mano); (2) es exactamente la
misma filosofía que la puerta ya aplica a todo lo que no puede verificar (F-05 declara sin cerrar el
hueco del `fetch()` de JS, `@s34` de `cero_terceros.feature`; F-04 declara sin cerrar la unicidad
del `<title>`, T3 de este mismo fichero). Un hueco DECLARADO y honesto es mejor que una puerta que
se cree infalible y rompe builds legítimos.

Este hueco queda anclado explícitamente en @s37 (fila `/otra-cosa`) y en el banner de cabecera del
`.feature`, para que nadie lo «cierre» sin escenario ni lo pierda de vista.

## 5. Qué se añadió al contrato, y por qué NO se tocan @s23/@s24

@s23 y @s24 no declaran `base` en ningún punto de su `Given`: son, por construcción, el caso «sin
base declarada» (el build de hoy). Añadirles filas con una `base` habría exigido meter una columna
`base` retroactiva en tablas YA APROBADAS por el humano, diluyendo escenarios ya cerrados por un eje
que no tenían. Se sigue el mismo criterio que `cero_terceros.feature` ya usó para sus @s41-@s43
(«3 escenarios nuevos, y SOLO porque no encajaban en ninguno de los ya aprobados»): tres escenarios
nuevos, numerados a partir del último tag libre del fichero (`@s35` era el más alto → `@s36`,
`@s37`, `@s38`), en vez de sufijos tipo `@s23b` (sin precedente en este repo — grep de `@s\d+[a-z]`
sobre `features/` → 0 resultados).

| Escenario | Qué cubre | Resultado |
| --- | --- | --- |
| `@s36` | href con prefijo de `base` + resto que NO es ruta lógica (dos filas: ruta inexistente, mayúscula distinta) | 1 violación (sigue siendo 404 real) |
| `@s37` | href con prefijo de `base` + resto que SÍ es ruta lógica (fila `/NailsLashStudioWeb/` → home); href SIN prefijo cuando hay `base` (fila `/otra-cosa`) | 0 violaciones |
| `@s38` | el resto se resuelve como ruta lógica genérica (`/servicios`, no solo la home), con fixture de dos rutas sobre el decisor puro | 0 violaciones |

Se añadió también una línea-comentario (no un cambio de comportamiento) justo después de @s24,
señalando hacia @s36-@s38, para que quien lea el escenario del caso de hoy sepa que existe la
extensión — sin tocar su `Given`/`When`/`Then`.

## 6. Cómo se comunica `base` a la puerta — recomendación de arquitectura

**Recomendación: exportar `baseDeclarada` (hoy función privada) directamente desde
`src/lib/puerta-terceros.ts`, e importarla desde `src/lib/puerta-cascaron.ts`. NO crear un módulo
compartido nuevo (p. ej. `src/lib/vite-config.ts`).**

Razones:
1. `baseDeclarada(config: string)` es una función de una sola responsabilidad (extraer el valor de
   `base:` de un texto), ya escrita, ya con su regex (`BASE_DE_VITE`) acotada y ya validada con
   mutación 100 % por la ENMIENDA 1 de `cero_terceros.feature` — no hay razón para reescribirla ni
   para moverla de sitio.
2. Crear un módulo compartido nuevo obligaría a migrar el uso interno que `puerta-terceros.ts` ya
   hace de `baseDeclarada`/`BASE_DE_VITE`, tocando código de una feature `done` (F-05, mutación
   100 %) sin que ningún escenario de F-05 lo exija — trabajo y riesgo sin beneficio.
3. Este repo ya tiene el precedente exacto para «apoyarse en» una feature hermana vía import
   directo, sin extraer a un tercer módulo: A-21/@s34 de este mismo fichero («F-04 NO duplica la
   puerta de F-01: se apoya en ella», importando de la lib de F-01). «No dupliques el razonamiento»
   se satisface con un `export` y un `import`, no con una reestructuración.
4. `puerta-cascaron.ts` NO necesita revalidar la legitimidad de `base` (esquema, protocolo-relativo,
   relativa) — ver el argumento medido en el punto 4 más abajo —, así que NO necesita
   `esRutaPropiaRootAbsoluta` como dependencia dura, solo `baseDeclarada`. Si en el futuro SÍ la
   necesitara (defensa en profundidad, opcional, no exigida por ningún escenario de este contrato),
   el mismo argumento aplica: expórtala también desde `puerta-terceros.ts`, sin nuevo módulo.

**Por qué `puerta-cascaron.ts` no necesita revalidar que `base` sea legítima**: en el pipeline real
de `pnpm build` (`package.json`), `puerta-cascaron.ts` corre ANTES que `puerta-terceros.ts`
(orden: `vite-react-ssg build && puerta-cascaron && puerta-placeholders && puerta-contraste &&
puerta-terceros && puerta-anclas`), así que no puede apoyarse en que F-05 ya rechazó un `base`
ilegítimo en ESA misma ejecución. Pero medido: **cualquier `base` que NO sea root-absoluta legítima
nunca produce un href que `esRutaInterna` reconozca como interno**, porque el prefijo se hornea
literalmente en el href vía `import.meta.env.BASE_URL` (por ejemplo, `base = '//cdn.tercero.com/'`
hornea `href="//cdn.tercero.com/"`, que `esRutaInterna` YA excluye por el `(?!\/)`; `base =
'https://evil.com/'` hornea un href que ni siquiera empieza por `/`; `base = './'` hornea
`href="./"`, igual). Es decir: el conjunto de valores de `base` que `esRutaPropiaRootAbsoluta`
consideraría legítimos coincide exactamente con el conjunto de valores de `base` que, en la
práctica, pueden llegar a producir un href que esta puerta trata como «interno» — así que esta
puerta puede usar el prefijo de `base` sin validarlo aparte, sin abrir ningún hueco nuevo.

**Dónde entra `base` en el puerto de la pura**: se recomienda un campo `base: string | null` en
`PeticionPuertaCascaron` (paralelo a `rutasEsperadas`, no un puerto de lectura de fichero como el
`leerConfigVite` de F-05 — `PeticionPuertaCascaron` hoy no lee ningún texto crudo de config, y no
hay ninguna razón para que empiece aquí), resuelto por el humilde `tools/puerta-cascaron.ts` leyendo
`vite.config.ts` y llamando a `baseDeclarada` (importada de `puerta-terceros.ts`) — exactamente
como `tools/puerta-terceros.ts` ya hace con `PARES_DE_FUENTE_ESPERADOS`. Es una recomendación, no un
mandato del contrato: el `.feature` no menciona nombres de tipos ni de funciones a propósito (regla
dura de `docs/gherkin.md`: «sin detalles de implementación»); el `tdd_craftsman` decide la forma
exacta durante el TDD.

## 7. Qué NO se tocó

- `src/lib/puerta-cascaron.ts`, `src/lib/puerta-cascaron.test.ts`, `tools/puerta-cascaron.ts`,
  `src/lib/puerta-terceros.ts`, `vite.config.ts`: implementación, queda para el `tdd_craftsman`.
- `feature_list.json`: el `status` de F-04 sigue `done`; esta enmienda amplía su contrato sin
  reabrir el ciclo completo — mismo patrón que la ENMIENDA 1 de `cero_terceros.feature` y la
  ENMIENDA 4 de `resenas_agregado_enlace`/`galeria_carrusel`. El acceptance A-17 de F-04
  («ningún href interno del artefacto de producción apunta a una ruta que no exista en dist/») NO
  cambia de letra: sigue siendo cierto bajo la interpretación amendada, solo cambia CÓMO se calcula
  «existe» cuando hay una base declarada.
- `features/cero_terceros.feature`: esa ENMIENDA ya está cerrada y validada por TDD; no se toca.
- `@s1`-`@s35` de `cascaron_semantico.feature`: ninguno se reinterpreta. Solo se añade una línea de
  comentario (no de comportamiento) tras @s24.
