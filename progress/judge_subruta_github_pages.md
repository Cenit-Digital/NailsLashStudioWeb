# Review — ENMIENDA 1 de F-05 (`cero_terceros`) y ENMIENDA 1 de F-04 (`cascaron_semantico`)
# Subruta de despliegue en GitHub Pages de proyecto

> `judge`, 2026-07-25, rama `feature/last_fixes`. No es una feature nueva: dos enmiendas a
> features `done` (mutación 100% previa) para desbloquear `base: '/NailsLashStudioWeb/'`.
> Verificación independiente de este judge (no solo los diarios): `bin/harness init` -> **VERDE**
> (`tsc --noEmit` 0, `eslint .` 0, `vitest run` **1310/1310 tests, 39 ficheros**, 132 s). Build
> propio (`rm -rf dist && pnpm build`) -> exit 0, CINCO puertas verdes; confirmado por grep directo
> sobre `dist/index.html`: `href="/NailsLashStudioWeb/"` en la marca, 1 sola ocurrencia, y los
> assets/scripts prefijados `/NailsLashStudioWeb/assets/...`.
> Diarios: `progress/enmienda1_cero_terceros_subruta.md`, `progress/enmienda_cascaron_base.md`,
> `progress/tdd_subruta_github_pages.md`.

**Veredicto F-05 (`cero_terceros`, ENMIENDA 1, @s27): APPROVED**
**Veredicto F-04 (`cascaron_semantico`, ENMIENDA 1, @s36/@s37/@s38): APPROVED**

Total: **0 bloqueantes, 2 graves, 2 menores** (todos transversales/infraestructura, ninguno en el
codigo de las dos puertas amendadas -- detalle en la seccion de hallazgos transversales).

---

## F-05 -- `cero_terceros`, ENMIENDA 1 (@s27 ampliado)

### Cobertura de escenarios (@s <-> test)
Contraste hecho leyendo la tabla EXACTA de `features/cero_terceros.feature:1815-1832` (8 filas)
contra el `it`/`it.each` real en `src/lib/puerta-terceros.test.ts:179-211` -- no contra el diario.

- @s27 fila 1 (no declara base -> 0): [x] `puerta-terceros.test.ts:180-185`.
- @s27 filas 2-4 (/, /subcarpeta/, /NailsLashStudioWeb/ -> 0): [x]
  `puerta-terceros.test.ts:187-196` (`it.each` con las 3 filas literales, mismo texto que la tabla).
- @s27 filas 5-8 (https://cdn.evil.example/x/, https://cdn.tercero.com/, //cdn.tercero.com/,
  ./ -> 1, NOMBRA vite.config.ts): [x] `puerta-terceros.test.ts:198-210` (`it.each` con las 4
  filas, aserta codigo de salida, longitud 1, y que la linea contiene tanto vite.config.ts
  como el valor literal de base -- no solo la cuenta).
- @s26 (hermano, NO tocado por la enmienda): [x] `puerta-terceros.test.ts:133-154`, 6 filas
  identicas a `features/cero_terceros.feature:1747-1765`.

Las 8 filas de la tabla tienen test propio, ni una fila de mas ni de menos. La asercion no es solo
de codigo de salida: para las filas de violacion se comprueba que el mensaje NOMBRA vite.config.ts
Y el valor literal de base -- evita que un mutante que cambie el texto del mensaje sobreviva por
falta de asercion de contenido.

### Fidelidad contrato <-> produccion
`src/lib/puerta-terceros.ts:96-223` -- BASE_PROPIA = '/', PREFIJO_PROTOCOLO_RELATIVO = '//',
esRutaPropiaRootAbsoluta(base) = base.startsWith('/') && !base.startsWith('//'),
violacionesDeBase usa esa funcion. El contrato describe TRES condiciones (empieza por /, no
empieza por //, no contiene ://); la produccion solo implementa DOS. Verificado que la tercera
es logicamente redundante con las 8 filas reales: ninguna URL con esquema explicito puede empezar
por / (RFC 3986), asi que startsWith('/') ya excluye toda fila https://... Esta razonado por
escrito en el comentario de esRutaPropiaRootAbsoluta (lineas 208-215) y en
`progress/tdd_subruta_github_pages.md:169-174` (no se implemento un tercer termino porque habria
sido produccion sin un test que lo exigiera). Es la disciplina correcta: no anadir codigo que
ningun test exige.

`git diff` de `src/lib/puerta-terceros.ts` y `puerta-terceros.test.ts` revisado linea a linea: el
diff es minimo y quirurgico -- solo toca violacionesDeBase/esRutaPropiaRootAbsoluta y la tabla
de @s27; baseDeclarada cambia SOLO de visibilidad (export), sin tocar su cuerpo; @s26 y el
resto del fichero de test no tienen ni una linea de diff.

### Disciplina TDD
- Produccion sin test que la pida? NO.
- Evidencia de Rojo-Verde-Refactor? SI -- `progress/tdd_subruta_github_pages.md:151-174` documenta
  2 ciclos: ciclo 1 (rojo con /subcarpeta/ y /NailsLashStudioWeb/ esperando 0, verde con
  la exclusion de BASE_PROPIA), ciclo 2 (rojo con //cdn.tercero.com/ esperando 1 -- el cambio
  del ciclo 1 lo dejaba pasar por error --, verde con la exclusion de protocolo-relativo).

### Calidad
- Nombres reveladores (esRutaPropiaRootAbsoluta, PREFIJO_PROTOCOLO_RELATIVO), sin numeros
  magicos, funciones de una sola responsabilidad.
- Capas respetadas: `src/lib/puerta-terceros.ts` sigue sin leer ficheros/process.env;
  baseDeclarada se exporta para F-04 sin duplicar logica (mismo patron que A-21 de F-04,
  que "se apoya en" F-01).
- Contrato de errores correcto: violacionesDeBase es un generador puro; el codigo de
  salida/exit sigue viviendo en ejecutarPuertaDeTerceros/el humilde, sin mezclar capas.

### Hallazgos
Ninguno en `src/lib/puerta-terceros.ts` ni en su test. Ver la seccion de hallazgos transversales
para lo tocado fuera de esta puerta.

---

## F-04 -- `cascaron_semantico`, ENMIENDA 1 (@s36/@s37/@s38 nuevos)

### Cobertura de escenarios (@s <-> test)
Contraste hecho leyendo `features/cascaron_semantico.feature:1412-1463` (@s36/@s37/@s38) y
`:1143-1201` (@s23/@s24, el hermano NO tocado) contra `src/lib/puerta-cascaron.test.ts:655-742` y
`:917-942`.

- @s36 (prefijo + resto que NO es ruta logica -> sigue violacion, 2 filas
  /NailsLashStudioWeb/inexistente y /NailsLashStudioWeb/Servicios): [x]
  `puerta-cascaron.test.ts:700-713`, `it.each` con las 2 filas literales, asercion exacta de la
  violacion (ruta, regla, valor = el href completo con prefijo).
- @s37 (prefijo + resto SI ruta logica -> NO violacion, fila /NailsLashStudioWeb/; SIN prefijo con
  base declarada -> fuera de ambito, NO violacion, fila /otra-cosa): [x]
  `puerta-cascaron.test.ts:715-730`, `it.each` con las 2 filas. Ademas, un segundo nivel de test
  contra la funcion de mas alto nivel (ejecutarPuertaDelCascaron,
  `puerta-cascaron.test.ts:917-942`): un test con base en la peticion (exit 0, enlace real de la
  marca) y un test SIN base en la peticion (el MISMO href rompe el build) -- ancla el cableado real
  de PeticionPuertaCascaron.base y la cero regresion de @s23 al mismo tiempo. Es cobertura
  adicional legitima (necesaria para que @s37 sea cierto de punta a punta, no solo en el decisor
  puro), no produccion sin test.
- @s38 (resto generico, no solo la home, fixture de 2 rutas): [x] `puerta-cascaron.test.ts:732-741`,
  un `it` con fixture ['/', '/servicios'] y href BASE+'servicios'.
- @s23/@s24 (hermano, NO tocado): [x] `puerta-cascaron.test.ts:655-690`. `git diff` confirma
  CERO cambios en esas lineas -- el unico cambio adyacente es que violacionesPorRegla gana un 4o
  parametro OPCIONAL base = null, que no altera ninguna llamada existente de @s23/@s24.

Las filas de la tabla de cada escenario nuevo tienen test propio; ni una fila de mas ni de menos.

### Cero regresion -- verificado por lectura directa, no solo confiado
`git diff -- src/lib/puerta-cascaron.test.ts` muestra que el bloque describe de la puerta ANTI-404
(@s23, @s24) (lineas 655-690) no tiene ni una linea de diff: los `it.each` de @s23 y @s24, sus
fixtures y sus aserciones son BYTE A BYTE los mismos de antes de la enmienda. La unica funcion que
cambia de firma es violacionesPorRegla, con un 4o parametro opcional que por defecto reproduce el
comportamiento anterior.

### Fidelidad contrato <-> produccion
`src/lib/puerta-cascaron.ts:582-600` (esEnlaceRoto) implementa EXACTAMENTE los tres casos del
contrato: base === null -> comportamiento identico a hoy (delega en rutasDelArtefacto.has(ruta),
sin tocar); base declarada y el href empieza por su prefijo -> se compara el RESTO (con / prepuesta
si no esta vacio); base declarada y el href NO empieza por su prefijo -> return false (fuera de
ambito, nunca violacion). El threading de base con default null hasta inspeccionarSitio y
PeticionPuertaCascaron (opcional, default null) es exactamente lo que permite que los ~30 call
sites existentes sigan compilando sin tocarse -- verificado con el `git diff` completo del fichero:
el unico cambio de comportamiento vive en esEnlaceRoto.

`tools/puerta-cascaron.ts` importa baseDeclarada de puerta-terceros.ts (reutilizacion sin duplicar
razonamiento, tal y como recomienda `progress/enmienda_cascaron_base.md` seccion 6) y lee
vite.config.ts con el mismo patron (readFileSync, lanza si no existe) que ya usaba
tools/puerta-terceros.ts. Sin logica propia, sin test dedicado, fuera de mutate -- respeta el
contrato del humilde ya establecido por F-01/F-04.

### Disciplina TDD
- Produccion sin test que la pida? NO.
- Evidencia de Rojo-Verde-Refactor? SI -- `progress/tdd_subruta_github_pages.md:259-296` documenta
  2 ciclos: ciclo 1 (@s36 nace en verde-que-no-lo-era por como transpila Vitest un argumento de mas
  sin tsc estricto en runtime, pero @s37/@s38 si estaban en rojo real, 3/5 tests fallando;
  documentado como tal, no maquillado), ciclo 2 (el cableado de PeticionPuertaCascaron.base, rojo
  real con codigoSalida 1 en vez de 0).

### Calidad
- esEnlaceRoto es una funcion nueva, nombrada, de una sola responsabilidad, con guard clauses
  claras (base === null primero, luego !ruta.startsWith(base)).
- Capas respetadas: la pura no lee ficheros; el humilde cablea IO y no anade logica.
- Sin duplicacion: baseDeclarada se reutiliza de F-05 en vez de reimplementar la extraccion de
  base -- decision razonada y verificada (`progress/enmienda_cascaron_base.md` seccion 6, con la
  alternativa de un modulo compartido nuevo considerada y descartada).

### Punto 3 del encargo -- la decision "fuera de ambito" de @s37 (/otra-cosa)

Mi lectura: el argumento es razonable como trade-off arquitectonico y esta declarado con
honestidad (no oculto), pero encuentro un punto debil real en su justificacion que merece quedar
por escrito, no aceptado por inercia.

El argumento a favor (GitHub Pages DE PROYECTO puede convivir con un sitio DISTINTO y legitimo en
la raiz del origen -- Pages de usuario/organizacion, p. ej. cenit-digital.github.io/ o
cenit-digital.github.io/OtroProyecto/) es facticamente correcto y no es hipotetico: la propia
organizacion (Cenit-Digital, agencia con mas de un cliente) es un caso plausible de tener varios
proyectos de Pages bajo el mismo github.io. Marcar /otra-cosa como roto SI seria asegurar algo
que esta puerta, mirando solo dist/ de ESTE repo, no puede saber. Hasta aqui, convincente.

Donde el argumento se debilita es en el contraargumento descartado (registrado en
`progress/enmienda_cascaron_base.md` seccion 4): se rechaza tratar /otra-cosa como interno-roto
razonando que el coste de un falso negativo lo detecta un "code review" normal. Esa frase es la
que no me convence, y por una razon interna al propio contrato de F-04: la razon de ser de la
puerta anti-404 (A-17, citada en la cabecera del .feature y en @s23) es EXACTAMENTE que una
revision manual no es fiable -- el bug real del cliente (/es/aviso-legal da 404) llego a
produccion pese a cualquier revision humana que hubiera existido, y por eso F-04 construye una
puerta MECANICA en vez de confiar en que alguien lo revise a ojo. Invocar "el code review lo caza"
para justificar un hueco en la MISMA puerta que existe porque el code review no cazo el bug
original es una tension que el propio documento no resuelve -- solo la menciona de pasada.

Dicho esto, dos cosas atenuan la gravedad de la tension:
1. Hoy el hueco es teorico, no real: verificado por grep propio sobre src/ que el UNICO mecanismo
   del repo que emite un href interno absoluto es Cabecera.tsx via import.meta.env.BASE_URL, que
   SIEMPRE incluye el prefijo por construccion. Todo lo demas son anclas (#...), tel:, externos o
   mailto:.
2. El hueco queda declarado por escrito, en el banner de cabecera del .feature, en el registro de
   decision y en la fila /otra-cosa de @s37 misma -- sigue el patron ya establecido del proyecto
   (F-05 declara y no cierra el hueco del fetch() de JS; F-04 declara y no cierra T3, la
   duplicacion del title). No es una laxitud escondida.

Mi recomendacion, no bloqueante: cuando F-16 (paginas legales) anada los primeros <a href> reales
del pie, ese es el momento en que este hueco deja de ser teorico -- vale la pena que quien
implemente F-16 lea explicitamente `progress/enmienda_cascaron_base.md` seccion 4 antes de escribir
esos hrefs a mano, precisamente porque un error ahi (olvidar BASE_URL) reproduciria, bajo GitHub
Pages, el bug exacto del cliente que F-04 existe para prevenir -- y esta puerta, bajo base
declarada, NO lo cazaria. No pido reabrir la decision: la encuentro defendible y ya esta declarada
con honestidad; pido que la tension quede escrita tambien aqui, para que nadie la lea como "sin
coste".

### Hallazgos
Ninguno bloqueante ni grave en `src/lib/puerta-cascaron.ts`, su test, ni `tools/puerta-cascaron.ts`.
Ver la seccion de hallazgos transversales para lo tocado fuera de esta puerta, y el punto 3 arriba
como discusion no bloqueante.

---

## Hallazgos transversales (fuera de las dos puertas, dentro del alcance del encargo)

### [Grave] .github/workflows/deploy-pages.yml lineas 62-63 -- PAGES_BASE_PATH es ahora una
variable muerta que contradice su propio comentario
El workflow sigue pasando `PAGES_BASE_PATH: ${{ steps.pages.outputs.base_path }}` como variable de
entorno a `pnpm build` (linea 63), y su comentario (lineas 53-55) dice literalmente que
configure-pages "expone base_path... para no hardcodear el nombre del repo en el build". Eso ya no
es cierto: `vite.config.ts:20` fija `base: '/NailsLashStudioWeb/'` como LITERAL FIJO y no lee
process.env.PAGES_BASE_PATH en ningun punto (confirmado por lectura directa del fichero completo --
no hay ningun process.env en vite.config.ts). La variable de entorno del workflow no hace nada: no
rompe el build hoy (porque el base_path real de este repo coincide con el literal), pero es un
cabo suelto exacto de la categoria que el encargo pidio verificar (punto 5): el mecanismo
PAGES_BASE_PATH se intento, se revirtio DEL CODIGO, pero sobrevive en el workflow sin que nadie lo
haya limpiado ni haya actualizado el comentario que ahora describe un comportamiento que no ocurre.
Riesgo concreto: si el repo se renombra o se mueve a otra organizacion, base_path cambiaria pero el
build seguiria publicando bajo /NailsLashStudioWeb/ (el literal), rompiendo el despliegue en
silencio -- exactamente el escenario que el propio comentario del workflow dice estar evitando.
No bloquea esta revision (no toca src/ ni tests de las dos features bajo revision, y
`progress/tdd_subruta_github_pages.md:365-367` documenta explicitamente que el workflow "queda...
fuera del alcance de esta tarea y no tocado"), pero merece que el craftsman_lead decida: o quitar
la variable del workflow (ya no la necesita nadie), o volver a leerla desde el humilde de F-05/F-04
si algun dia se quiere volver a lo dinamico.

### [Grave] feature_list.json ids 4 y 5 -- el cierre/puerta_humana no reflejan la ENMIENDA
Ninguna de las dos entradas (id 4, id 5) menciona la ENMIENDA 1 de hoy: status sigue done en
ambas (correcto, no hace falta reabrir el ciclo -- mismo patron que la ENMIENDA 4 de
resenas_agregado_enlace/galeria_carrusel, que SI dejo nota en su campo cierre, visible en
`feature_list.json:341` y `:501`, con el formato "... | ENMIENDA N (fecha): descripcion...
Registro completo: progress/...md; review: progress/judge_...md; mutacion:
progress/mutation_...md."). Hoy falta el equivalente para F-05 (campo cierre en
`feature_list.json:138`) y para F-04 (que ni siquiera tiene campo cierre propio, solo
nota_alcance). Ver la recomendacion de feature_list.json abajo -- no bloquea este veredicto (el
craftsman_lead gestiona feature_list.json, no judge/tdd_craftsman, mismo criterio ya aplicado en
`progress/judge_retiro_whatsapp_y_carrusel.md` hallazgo 2).

### [Menor] src/main.tsx lineas 46-48 y src/components/Cabecera.tsx lineas 12-15 -- comentarios
desactualizados
Los dos ficheros conservan la frase "aunque hoy vite.config.ts no la expone" (y en Cabecera.tsx,
"bajo el base por defecto vale / (identico a antes)"), escrita cuando estos dos ficheros se
tocaron ANTES de que vite.config.ts fijara el literal /NailsLashStudioWeb/. Ya no es cierto:
vite.config.ts SI declara base ahora. No afecta comportamiento ni tests (son comentarios, no
codigo), pero induce a error a quien lea estos ficheros hoy pensando que la subruta sigue
bloqueada.

### [Menor] Punto 3 (arriba) -- no es un hallazgo de codigo, es una discusion que pido dejar por
escrito para quien implemente F-16 (ver recomendacion en la seccion F-04).

## Recomendacion feature_list.json (para el craftsman_lead, no para este judge)

Si aplica el mismo patron que F-22/F-14 (ENMIENDA 4, `feature_list.json:341` y `:501`): anadir a
la entrada 4 (id 4, campo cierre -- hoy no existe ese campo, solo nota_alcance) y a la entrada 5
(id 5, campo cierre en la linea 138) una nota "| ENMIENDA 1 (2026-07-25): ..." con el mismo
formato -- que cambio (@s27 ampliado / @s36-@s38 anadidos), por que (subruta de GitHub Pages de
proyecto), que status sigue done sin reabrir el ciclo, y las referencias a
`progress/enmienda1_cero_terceros_subruta.md`, `progress/enmienda_cascaron_base.md`,
`progress/tdd_subruta_github_pages.md` y este mismo veredicto. No lo hago yo: feature_list.json lo
gestiona el craftsman_lead, no el judge (regla dura del rol).

## Checkpoints
- C1: [x] `bin/harness init` verde, verificado por este judge de forma independiente
  (Node v22.15.0, tsc --noEmit 0, eslint . 0, vitest run 1310/1310, 39 ficheros).
- C2: [x] ninguna feature en in_progress -- F-04 y F-05 siguen done, coherente con que esto es
  una sincronizacion de contrato tras una enmienda, no una feature nueva.
- C3: [x] src/ respeta la arquitectura (decisor puro / humilde sin logica, sin capas nuevas);
  sin dependencias nuevas; sin logs de debug ni TODOs sueltos en el codigo tocado.
- C4: [x] hay test por cada fila de cada escenario tocado (tabla arriba); `bin/harness test` ->
  1310/1310 verdes.
- C5: [~] hay un archivo untracked de infraestructura (.github/workflows/deploy-pages.yml) con un
  cabo suelto declarado arriba (Grave, no bloqueante -- fuera del alcance de src/tests).
- C6: [x] cada @s nuevo o tocado (@s27, @s36, @s37, @s38) tiene su test; @s26/@s23/@s24 (los
  hermanos NO tocados) verificados sin regresion por git diff directo; [x] no hay produccion sin
  test que la exija en ninguna de las dos puertas.
- C7: no evaluado aqui -- la mutacion corre despues de este veredicto, como marca el proceso.

## Cambios requeridos
Ninguno bloqueante. Recomendaciones no bloqueantes (no impiden APPROVED):
1. .github/workflows/deploy-pages.yml -- decidir si retirar PAGES_BASE_PATH (ya no lo consume
   nadie) o volver a cablearlo; y corregir el comentario que dice evitar el hardcode del nombre del
   repo, que ya no es cierto.
2. feature_list.json ids 4 y 5 -- nota de ENMIENDA 1 en cierre, mismo formato que F-22/F-14
   (tarea del craftsman_lead, no de este judge).
3. src/main.tsx lineas 46-48 y src/components/Cabecera.tsx lineas 12-15 -- actualizar el
   comentario que dice que vite.config.ts no expone base todavia.
4. Dejar constancia, para quien implemente F-16, de la tension razonada en el punto 3 (arriba):
   un href interno escrito a mano sin import.meta.env.BASE_URL, bajo base declarada, no lo cazara
   la puerta anti-404 -- es el mismo tipo de bug que F-04 existe para prevenir.
