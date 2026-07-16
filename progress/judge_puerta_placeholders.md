# Review — feature 1 puerta_placeholders

**Veredicto:** APPROVED

El review es el juego entero. Se juzga cobertura de los 26 escenarios contra el
contrato aprobado, disciplina TDD, fidelidad de los dobles y calidad de artesano.
La mutacion la valida despues el mutation_tester (C7).

Medido, no fiado de recuentos: pnpm test -> 46 passed (3 ficheros).
pnpm typecheck && pnpm lint -> 0 errores, 0 warnings. bin/harness init -> verde.
git diff -- features/ -> VACIO (el contrato no se toco). pnpm build (humilde real
contra dist/ real) -> exit 0, "el artefacto de produccion no tiene placeholders".

## Cobertura de escenarios (@s <-> test) — 26/26

Contados por titulo de it()/it.each(), no por comentario.

Capa pura — src/lib/placeholders.test.ts:
- @s1  [x] un registro marcado esPlaceholder produce violacion con via, ubicacion y valor
- @s2  [x] flag en false + contenido real -> sin violacion
- @s24 [x] registro de JSON que no declara el flag -> violacion que declara que FALTA
- @s3  [x] entrada vacia -> lista vacia
- @s4  [x] los seis patrones prohibidos (it.each x6)
- @s5  [x] el telefono no escapa por espaciado/guiones/prefijo (it.each x6)
- @s6  [x] el telefono real con espacios no dispara el patron
- @s7  [x] patrones de texto: otra caja y sin acentos (it.each x7)
- @s8  [x] tres infracciones -> tres violaciones
- @s23 [x] marcado + patron -> dos violaciones, una por via
- @s9  [x] determinismo: misma entrada, misma lista, mismo orden
- @s25 [x] orden por aparicion, no por orden de la lista de patrones
- @s10 [x] marcado con contenido real es violacion igual
- @s11 [x] dato inventado nuevo sin marcar y sin patron: la puerta NO lo caza

Capa puerta — src/lib/puerta.test.ts:
- @s12 [x] produccion con violacion -> codigo != 0  (+ engancho: build invoca la puerta)
- @s13 [x] artefacto limpio -> codigo 0
- @s14 [x] desarrollo con placeholders NO falla  (+ engancho: dev NO invoca la puerta)
- @s15 [x] el informe acusa: causa, ubicacion y valor
- @s16 [x] literal a mano en la plantilla ausente de los datos -> lo caza el artefacto
- @s17 [x] imagen inlinada como data: URI -> la caza la via por flag
- @s18 [x] excluye el codigo de la puerta (+ arista anti-coladero: en el artefacto SI se caza)
- @s19 [x] escanea el artefacto, no el repositorio
- @s20 [x] el directorio del artefacto no existe -> rompe
- @s21 [x] no ha inspeccionado ni un fichero -> rompe
- @s26 [x] no ha inspeccionado el HTML de entrada -> rompe
- @s22 [x] la puerta revienta -> falla cerrada

Ningun @s queda sin test.

## Verde por vacuidad (razon de ser de la feature) — cerrada

- @s20 (dir inexistente): codigo != 0, "no habia nada que inspeccionar", y no dice "limpio".
- @s21 (dir vacio que EXISTE, aseverado con existeDirectorio===true y listar===[]): != 0,
  lineas no vacias, no dice "limpio".
- @s26 (3 .css sin index.html, aseverado): != 0, "no se inspecciono", "dist/index.html".

## Fidelidad de los dobles — cerrada, sin engano

El puerto SistemaDeFicheros declara el contrato en la interfaz (puerta.ts:30-34):
existeDirectorio responde sin lanzar; listarFicheros LANZA si el directorio no existe
(como readdirSync). El doble (puerta.test.ts:44-52) lo honra: LANZA ENOENT para un
directorio inexistente, no devuelve []. La puerta pregunta existeDirectorio ANTES de
listar (puerta.ts:83), igual que el humilde real usa existsSync (tools/puerta-placeholders.ts:21).
Real y doble toman el MISMO camino en @s20. La condicion bloqueante del encargo
("el doble devuelve [] y el real revienta") NO se cumple: el doble revienta igual, y el
test lo asevera (puerta.test.ts:267, expect(...).toThrow()). No es decorado.

## Disciplina TDD

- Produccion sin test que la pida: NO en las capas testeadas. Cada guarda la exige un @s
  (existeDirectorio<-@s20, index.html<-@s26/@s21, try/catch<-@s22, && modo<-@s14, >0<-@s13).
  tools/puerta-placeholders.ts es humble object sin decisiones, sin tests y fuera de
  mutacion POR DISENO APROBADO (task + bitacora decision 7).
- Rojo->Verde->Refactor: SI, con evidencia por ciclo (P1 constante desmentida por P2;
  P3 hace aparecer el &&; T3 elimina el guarda de @s21 por mutante superviviente y lo
  consolida en el de @s26). "Verifica que muerde" documentado en @s3/@s16/@s17 y en el
  doble infiel cazado en P7-P8 y T1.

## Anti-tautologia — cumplida

Ningun test importa PATRONES_PROHIBIDOS. Los 6 patrones estan a mano en
placeholders.test.ts:55-60 y 100-106; el retrato del modulo en puerta.test.ts:174-183
es literal, no un import.

## Nadie debilito un test — verificado con git

git diff de puerta.test.ts: el unico cambio a tests existentes es en @s18-coladero,
que suma dist/index.html limpio al fixture (legitimo y autorizado; mas fiel). El
toEqual exacto se MANTIENE intacto. El doble gano fidelidad (lanza ENOENT). @s22 gano
existeDirectorio porque la interfaz crecio. Ninguna asercion se relajo.
git diff -- features/ esta VACIO.

## Calidad (lente de artesano)

Funciones cortas con un motivo para cambiar; sin numeros magicos (CODIGO_EXITO/FALLO,
DIRECTORIO_ARTEFACTO, FICHERO_HTML_DE_ENTRADA, PATRON_TELEFONO, PREFIJOS_INTERNACIONALES);
contrato de errores correcto (puerta devuelve {codigoSalida, lineas}; el humilde escribe
a console.error y process.exit(codigoSalida)); nombres reveladores; comentarios solo para
el porque no obvio; respeta architecture.md (IO separada por puerto inyectado, readonly, dos capas).

## Checkpoints

- C1 [x] arnes completo, bin/harness init exit 0.
- C2 [x] una sola feature in_progress (id 1); current.md describe la sesion.
- C3 [x] src/lib solo placeholders.ts + puerta.ts; sin deps nuevas, sin logs de debug ni TODOs.
- C4 [~] test por modulo de src/ y >0 tests verdes. SALVEDAD: la puerta se prueba con un
  doble en memoria del puerto, no con directorio temporal; el adaptador real node:fs no
  tiene test ejecutable (ver hallazgo menor). No bloquea.
- C5 [x] sin temporales sospechosos trackeados (dist/ gitignored).
- C6 [x] .feature con @s1..@s26 y Then medibles; mapa @s->test en la bitacora; sin
  produccion no pedida en las capas testeadas.
- C7 [ ] mutacion: la valida el mutation_tester (la bitacora reporta puerta.ts 100% como
  diligencia del artesano, no sustituye la puerta).

## Hallazgos

1. MENOR — src/lib/puerta.test.ts (suite de la puerta): la puerta se verifica con un doble
   en memoria del puerto SistemaDeFicheros; el adaptador real node:fs en
   tools/puerta-placeholders.ts:18-27 (recursion de readdirSync, normalizacion de separador
   de ruta para Windows, existsSync) no tiene prueba ejecutable. docs/verification.md Nivel 2
   y CHECKPOINTS C4 piden aislamiento real (directorio temporal), no dobles del filesystem,
   para features de interfaz. Mitigado: (a) el humble object esta mandado por el contrato
   aprobado y el encargo lo declara sin tests; (b) el doble es fiel (lanza ENOENT como el
   real, aseverado); (c) pnpm build ejecuta el adaptador real contra un dist/ real y sale
   VERDE (smoke, Nivel 3). Recomendacion antes de done: que el lead decida si Nivel 2 exige
   un test de integracion del adaptador contra un dist/ temporal, sobre todo por la ruta
   Windows. No bloquea el veredicto.

## Cambios requeridos

Ninguno bloqueante. La feature esta lista para la puerta de mutacion (mutation_tester, C7).
El hallazgo menor queda a criterio del lead antes de marcar done.
