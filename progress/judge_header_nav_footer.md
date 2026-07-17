# Review — feature 6 (`header_nav_footer`)

**Veredicto:** APPROVED

> El review es el juego entero. No me fié de la bitácora: reconstruí dist/ desde cero, medí sus
> BYTES, y REPRODUJE los sabotajes centrales (el del 2º extractor entre ellos). bin/harness init
> VERDE (617 tests, lint 0). pnpm build VERDE con las CINCO puertas. Working tree limpio tras
> todos mis sabotajes (cada uno backup -> patch -> test -> restore).

## Cobertura de escenarios (@s <-> test, por título de it(), no por comentario)

- @s1: [x] puerta-anclas.test.ts «@s1 la nav enlaza %s y la página no tiene ese id -> 1 violación que declara el ancla y el id» (it.each: #facial,#colores,#servicios,#contacto). Asevera ancla E id.
- @s2: [x] «@s2 nav a #servicios-titulo y #contacto-titulo con ambos ids presentes -> 0 violaciones».
- @s3: [x] «@s3 la sección navegable "%s" sin enlace en la nav -> 1 violación de inalcanzable» (it.each: faq,contacto-titulo).
- @s4: [x] tres it: anclas acusa #facial y NO /servicios · anti-404 acusa /servicios y NO #facial · build != 0. Reproducido por mí sobre dist/ real (Sabotaje C).
- @s5: [x] tres it: exactamente 3 violaciones · cada línea nombra ruta/ancla o id/qué falta · dos pasadas -> listas idénticas y EN EL MISMO ORDEN.
- @s6: [x] dos it: dist/ ausente · dist/ sin HTML. Exit != 0 y NO declara «no hay anclas rotas».
- @s7: [x] «@s7 el extractor deriva 0 anclas de nav -> exit != 0» (vacuidad 1.er extractor).
- @s8: [x] «@s8 si listarHtml lanza -> exit != 0 con la causa».
- @s9: [x] «@s9 una home consistente -> codigoSalida 0 y ninguna violación».
- @s10: [x] «build invoca la puerta DESPUÉS de vite-react-ssg build y de la anti-404» + it.each(dev,dev:ssr) NO la invocan. Sobre package.json real.
- @s11: [x] scroll-padding-cabecera.test.ts, tres it: existe en html{} · valor px >= 76 (a mano) · NO 5rem.
- @s12: [x] cabecera.test.tsx: nav landmark «Principal» · marca en la cabecera · footer landmark.
- @s13: [x] puerta-anclas.test.ts (anti-404 caza /aviso-legal, anclas NO) + cabecera.test.tsx (el pie NO hornea enlace legal).
- @s14: [x] puerta-anclas.test.ts (terceros/anti-404/anclas NO acusan Facebook) + cabecera.test.tsx (hornea Facebook + tel:, NO Instagram).
- @s15: [x] «aria-expanded pasa de false a true y vuelve» + asevera que la CLASE NO cambia entre estados (no es cond?a:b).
- @s16: [x] «el botón declara aria-expanded=false» + «los enlaces están en el HTML horneado» (blindaje anti-Portal).
- @s17: [x] «la media query usa exactamente max-width: 820px, comparado contra el literal a mano» + not.toContain 767px.
- @s18: [x] META-mutación (la mide el mutation_tester). Sus 6 filas mapean a @s1/@s2/@s3/@s20/@s7/@s19/@s17. Yo reproduje 2 filas a mano (Sabotajes A y B).
- @s19: [x] «hay anclas vivas pero 0 secciones navegables -> exit != 0» (LA GUARDA QUE FALTABA, el bloqueante). Verificado por sabotaje: quitarla pone SOLO @s19 rojo.
- @s20: [x] «h2 id=promociones-titulo suelto, 0 violaciones de inalcanzable» (distingue navegable=section->heading de cualquier id).

20/20 cubiertos. Ningún @s sin test concreto.

## Mis sabotajes reproducidos (no me fié — MEDÍ)

### Sabotaje A — vaciar el 2º EXTRACTOR (seccionesNavegables -> [])
Parcheé el fichero, corrí la suite de la puerta, restauré. Resultado: 5 tests ROJOS (@s3 x2, @s5 x2, @s9). El extractor de secciones está genuinamente mordido por tests. Tree limpio tras restaurar.

### Sabotaje B — quitar la GUARDA de vacuidad del 2º extractor (if !seDerivoAlgunaSeccion)
Neutralicé la guarda (false && ...), corrí, restauré. Resultado: exactamente 1 test ROJO: @s19, y ningún otro. Confirma que la guarda del 2º extractor EXISTE y MUERDE, y que @s19 la cubre sin redundancia que tape un hueco. Es el BLOQUEANTE que la revisión del contrato cazó; está cerrado.

### Sabotaje C — pnpm build con una nav de ancla muerta (#noexiste)
Inyecté a href=#noexiste en la nav del dist/ construido y corrí las CINCO puertas por separado. Resultado: cascaron EXIT 0 · placeholders EXIT 0 · contraste EXIT 0 · terceros EXIT 0 · anclas EXIT 1, acusando: / — ancla de la nav sin destino en la página: ancla #noexiste -> id noexiste. Rompe SOLO la puerta de anclas, y ACUSA (no gruñe). Es @s4 sobre el artefacto real. dist/ restaurado.

### Verde != funciona — medido sobre los BYTES de dist/index.html (readFileSync, jamás jsdom)
nav horneada aria-label=Principal OK · botón aria-expanded=false (y CERO =true) OK · href #servicios-titulo y #contacto-titulo horneados OK · footer landmark OK · URL de Facebook + tel: OK · CERO instagram.com OK · CERO /aviso-legal y /privacidad OK · CERO resto de radix OK · ids servicios-titulo/contacto-titulo presentes OK · marca Nails Lash Studio OK.

## Disciplina TDD

- ¿Producción sin test que la pida? NO. Cada export de puerta-anclas.ts está ejercido: anclasDeNav/idsDeLaPagina/seccionesNavegables/inspeccionarAnclas (@s1-@s5,@s20), describir (@s5), ejecutarPuertaDeAnclas con sus 4 guardas (@s6/@s7/@s8/@s9/@s19), motivoDelReventon (@s8). Sin código muerto. tools/puerta-anclas.ts es el humilde (cableado sin lógica): fuera de mutate por diseño, cubierto por @s10 + el build real.
- ¿Evidencia de Rojo->Verde->Refactor? SÍ. progress/tdd_header_nav_footer.md documenta 17 ciclos con triangulación fake-it @s1->@s2 y guardas añadidas una a una, cada una con su rojo. Coherente con el código.

## Calidad (lente de artesano)

- Arquitectura del patrón anti-404 respetada: decisor PURO en src/lib/ (recibe bytes, no lee fs/reloj/env, determinista) + humilde en tools/. Reutiliza idsDeHeadings de puerta-cascaron.ts:505 para «sección navegable», coherente con REGLA_SECTION de F-04 (B-4). puerta-anclas.ts:84-97.
- Funciones cortas, un motivo de cambio, nombres reveladores. if INDEPENDIENTES (no else if) para acusarlas todas (@s5): puerta-anclas.ts:110-131. Falla cerrada con la causa (@s8): :170-181.
- Contrato de errores correcto: canal de error (lineas) + codigoSalida; el humilde hace process.exit (tools/puerta-anclas.ts:54). La puerta NUNCA declara «no hay anclas rotas» en un fallo (aseverado en @s6/@s7/@s8/@s19).
- className CONDICIONAL: ninguno. Grep de .tsx: el único match cond?a:b es un COMENTARIO en cabecera.test.tsx:71; todos los className reales son constantes (estilos.X). El estado va en aria-expanded. Invariante E1.c respetado.
- Las DOS listas: los 3 .tsx + puerta-anclas.ts están en mutate de stryker.config.json:28-31 Y en coverage.include (src/lib/**/*.ts, src/components/**/*.tsx) de vitest.config.ts:15. Sin esto la mutación daría 100% por vacuidad.
- radix-ui fuera de package.json (0 en dependencies) y 0 ocurrencias en pnpm-lock.yaml (B-6, lockfile actualizado). 0 imports de radix en src/.
- Anti-tautología: @s17 ancla contra el literal 820px escrito A MANO (no hay símbolo JS que importar); @s11 contra 76 px a mano; SERVICIOS/CONTACTO/FACEBOOK literales a mano. Ningún import de la constante vigilada para compararse contra ella.
- perTest: ningún cálculo en el cuerpo de un describe; los fixtures son funciones llamadas DENTRO del it; en los describe solo datos literales. Sin supervivientes falsos por recolección.
- Sin atribución normativa falsa (B-1): _base.scss:37 y scroll-padding-cabecera.test.ts:14-15 dicen CERO números atribuidos a SC 2.4.11; el 2.4.12 AAA se nombra solo para EXCLUIRLO; el 767 solo aparece en comentarios y en la guarda not.toContain 767px. Ningún número colgado del 2.4.11, ningún AAA bajo AA.

## Coherencia con el resto del repo

- pnpm build VERDE con las CINCO puertas (F-01/F-03/F-04/F-05 + anclas). F-06 no rompe F-01..F-05.
- A-27: el commit de F-06 (cb909e8) NO toca tools/puerta-placeholders.ts ni features/puerta_placeholders.feature (ausentes del git show --stat).
- Estado coherente: exactamente 1 feature in_progress (F-06); F-01..F-05 done. feature_list.json §6 lleva puerta_humana (APROBADO 2026-07-17) y puerta_legal reescrita a not entirely hidden AA.

## Hallazgos por gravedad

Bloqueantes: 0.

Menores: 1.
1. @s12 y @s16 aseveran sobre renderToString(Componente), no sobre readFileSync de dist/index.html, pese a que el contrato insiste sobre los BYTES de dist/. Mitigado y NO bloqueante: (a) renderToString es el MISMO motor de prerender que usa vite-react-ssg y NO es jsdom, así que honra el espíritu anti-jsdom (estado pre-hidratación); (b) la puerta de anclas verifica la nav horneada sobre los BYTES reales en cada build (0 anclas -> @s7 rompería); (c) yo medí los BYTES de dist/index.html a mano y cumplen todas las aserciones de @s12/@s16. Ningún @s queda descubierto. Recomendación para F-07+: un test que lea dist/index.html cerraría la LETRA del contrato además del espíritu.

## Checkpoints
- C1 — arnés completo, bin/harness init exit 0: [x]
- C2 — estado coherente, 1 in_progress, done con tests: [x]
- C3 — arquitectura respetada (decisor puro + humilde; radix REMOVIDO; sin logs/TODOs): [x]
- C4 — verificación real (>=1 test por módulo; aislamiento real vía puerto inyectado, no mocks de FS; 617 verdes): [x]
- C5 — sesión: working tree limpio, progress/ refleja el estado: [x]
- C6 — contrato Gherkin: 20 @s tagueados, cada uno con test, sin producción sin test: [x]
- C7 — prueba de mutación: PENDIENTE del mutation_tester (corre DESPUÉS de esta aprobación, él solo, sin otro Stryker vivo): [ ]

## Cambios requeridos
Ninguno. Se aprueba. La puerta C7 (mutación, umbral 1.0, 0 exclusiones) queda para el mutation_tester.
