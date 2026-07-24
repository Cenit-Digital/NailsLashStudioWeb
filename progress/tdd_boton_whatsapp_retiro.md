# Retiro — botón flotante de WhatsApp (limpieza mecánica, no TDD de feature nueva)

**Naturaleza de esta sesión:** NO es un ciclo Rojo-Verde-Refactor de una feature nueva. Es
la limpieza de los cabos sueltos que dejó el commit `479d541` ("eliminar el componente
BotonWhatsApp del archivo home.tsx", 2026-07-24), que borró `src/components/BotonWhatsApp.tsx`
y el `<BotonWhatsApp />` de `src/pages/home.tsx` pero dejó el import roto, 3 tests huérfanos,
un `.module.scss` sin consumidor y una constante de demo sin consumidor. No se ha escrito
ninguna línea de producción nueva: solo borrados y la retirada de un import roto.

## Por qué esto no viola la puerta humana ni la disciplina TDD

`features/boton_whatsapp_flotante.feature` es el contrato de ESTE botón. Su propio
encabezado dice «Estado: PROPUESTA hasta la puerta humana» y «🔴 NO TIENE ENTRADA PROPIA EN
feature_list.json»: es una rebanada de la feature id 13 (`solicitud_whatsapp`, XL,
`pending`), no F-13 entera. Verificado con `node -e` sobre `feature_list.json`: la entrada
13 sigue en `status: "pending"`, intacta — nunca se creó una entrada propia para el botón
flotante, así que nunca hubo puerta que cruzar para retirarlo.

Historial encontrado en `progress/`: `judge_boton_whatsapp.md` (v1, CHANGES_REQUESTED por
@s4 sin test), `judge_boton_whatsapp_v2.md` (v2, APPROVED tras corregir @s4), y
`mutation_boton_whatsapp.md` (mutación BLOQUEADA — la corrida no llega a medir sobre
`BotonWhatsApp.tsx`). La feature nunca cerró el pipeline (mutación pendiente); Pablo decidió
retirar el componente en vez de continuar la ronda de mutación. Decisión legítima del humano,
fuera del alcance de esta sesión de limpieza.

## Verificación previa (grep, antes de tocar nada)

- `boton-whatsapp.module.scss`: 0 imports desde código (`src/**/*.{ts,tsx}`) antes del borrado;
  solo lo referenciaban los 3 tests huérfanos y menciones en ficheros de `progress/` (histórico,
  no código).
- `BOTON_WHATSAPP_FLOTANTE_TEXTO` (`src/lib/demo/contacto-demo.ts:16`): el único IMPORT real
  era `src/components/boton-whatsapp.test.tsx:7` (huérfano, se borra). Otras dos apariciones
  son comentarios de docblock (`src/lib/demo/reserva-demo.ts:4` y
  `features/reserva_chat.feature:561`) que solo la MENCIONAN en prosa para distinguirla de
  `RESERVA_WHATSAPP_TEXTO`/`CONTACTO_WHATSAPP_TEXTO` — ningún `import` real. Confirmado: sin
  consumidores tras borrar el test huérfano.

## Qué se borró/tocó

1. `src/pages/home.tsx` — retirada la línea
   `import { BotonWhatsApp } from '../components/BotonWhatsApp'` (apuntaba a un fichero ya
   borrado por `479d541`). Nada más tocado en el fichero.
2. Borrados los 3 tests huérfanos que pineaban el componente ya inexistente:
   - `src/components/boton-whatsapp.test.tsx`
   - `src/components/boton-whatsapp-estilos.test.ts`
   - `src/pages/boton-whatsapp-montaje.test.tsx`
3. Borrado `src/components/boton-whatsapp.module.scss` (sin consumidores, confirmado por grep
   antes y después).
4. Borrada de `src/lib/demo/contacto-demo.ts` la constante `BOTON_WHATSAPP_FLOTANTE_TEXTO` y su
   docblock completo (líneas 8-16 del fichero original); `CONTACTO_WHATSAPP_TEXTO` intacta.
5. `features/boton_whatsapp_flotante.feature` — añadido un banner de retirada al principio del
   fichero (2026-07-24), el resto del fichero se conserva íntegro como registro histórico de la
   propuesta.

## Deuda menor detectada, NO tocada (fuera del alcance pedido)

- `src/lib/demo/reserva-demo.ts:4` conserva en su docblock la frase "y de
  `BOTON_WHATSAPP_FLOTANTE_TEXTO`, para que los TRES puntos de entrada..." — es prosa
  (comentario), no código; no rompe compilación ni tests. Queda como cabo suelto cosmético
  menor para quien retome F-13/reserva si quiere pulir el comentario. No lo toqué porque no
  estaba en la lista de 5 puntos encargada.
- `src/components/galeria.test.tsx:1341` menciona en un comentario
  `boton-whatsapp-montaje.test.tsx` (ya borrado). Es un comentario dentro de un fichero
  explícitamente fuera de mi alcance (galería está rota por otra tarea) — no lo toqué.

## Resultado typecheck / lint / test

### Antes (estado heredado, no medido por mí de forma aislada — se infiere de los cabos sueltos
descritos por quien encargó la tarea): `pnpm typecheck` fallaba por el import roto de
`../components/BotonWhatsApp` en `home.tsx`; `pnpm test` fallaba en los 3 ficheros huérfanos de
`boton-whatsapp*` (no podían importar el componente borrado).

### Después (medido en esta sesión, rama `feature/last_fixes`):

- **`pnpm typecheck`** (`tsc --noEmit`): 6 errores, TODOS en `src/components/Galeria.tsx` y
  `src/components/Resenas.tsx` (`claveDeRotacion`/`etiquetaDeRotacion`/`alternarRotacion`
  declarados y sin usar) — **fuera de mi alcance** (otra tarea, commit de eliminación de
  botones de carrusel). CERO errores relacionados con `BotonWhatsApp`/`home.tsx`.
- **`pnpm lint`** (`eslint .`): mismos 6 errores, mismos 2 ficheros (`Galeria.tsx`,
  `Resenas.tsx`), `@typescript-eslint/no-unused-vars`. CERO relacionados con esta rebanada.
- **`pnpm test`** (`vitest run`): `Test Files 2 failed | 37 passed (39)` ·
  `Tests 57 failed | 1281 passed (1338)`. Los 2 ficheros que fallan son
  `src/components/galeria.test.tsx` y `src/components/resenas.test.tsx` (confirmado: la última
  línea de la corrida capturada apunta a `resenas.test.tsx:1567` buscando los botones
  «Anterior»/«Siguiente» que el commit `9cf32a9` retiró — es la tarea de OTRA sesión, tal y
  como advertía el encargo). Grep sobre el log completo capturado: **cero** ocurrencias de
  `boton-whatsapp`/`BotonWhatsApp` en fallos. Verificación dirigida adicional:
  `pnpm exec vitest run src/pages/home.test.tsx src/lib/demo` → `2 test files passed (2)`,
  `9 tests passed (9)`.
- `pnpm exec prettier --check src/pages/home.tsx src/lib/demo/contacto-demo.ts` → limpio.

**Conclusión sobre ESTA rebanada:** typecheck, lint y test quedan limpios de cualquier fallo
relacionado con el botón flotante de WhatsApp. Los ~57 fallos restantes (Galería/Reseñas) son
íntegramente de la otra tarea (carrusel), no se tocaron ni se intentaron arreglar, tal y como
se pidió.

## Trazabilidad

No aplica tabla `@s → test` (no es una feature nueva con contrato vigente): esta sesión no
añade tests ni escenarios. La cobertura de `features/boton_whatsapp_flotante.feature` queda
formalmente RETIRADA (banner al principio del fichero); el fichero se conserva íntegro como
registro histórico, sin describir código vigente.

## Ficheros tocados/borrados (rutas absolutas)

- `C:\Users\vhurt\...\NailsLashStudioWeb\src\pages\home.tsx` (editado)
- `C:\Users\vhurt\...\NailsLashStudioWeb\src\lib\demo\contacto-demo.ts` (editado)
- `C:\Users\vhurt\...\NailsLashStudioWeb\features\boton_whatsapp_flotante.feature` (banner añadido)
- `C:\Users\vhurt\...\NailsLashStudioWeb\src\components\boton-whatsapp.test.tsx` (borrado)
- `C:\Users\vhurt\...\NailsLashStudioWeb\src\components\boton-whatsapp-estilos.test.ts` (borrado)
- `C:\Users\vhurt\...\NailsLashStudioWeb\src\pages\boton-whatsapp-montaje.test.tsx` (borrado)
- `C:\Users\vhurt\...\NailsLashStudioWeb\src\components\boton-whatsapp.module.scss` (borrado)
