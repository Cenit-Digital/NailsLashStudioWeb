# TDD — Botón flotante de WhatsApp

Feature en curso: rebanada de F-13 (`solicitud_whatsapp`) — `boton_whatsapp_flotante`
Contrato: `features/boton_whatsapp_flotante.feature` (14 escenarios).

## Reconciliación de nombres (directiva del `craftsman_lead` sobre el contrato)

El lead me ordenó nombres y ubicaciones distintos de los que fija el `.feature`;
sigo la directiva del lead (dirige mi trabajo) y adapto las ANCLAS de los tests a
los ficheros reales:

| Contrato | Real (directiva del lead) |
|---|---|
| `src/components/BotonWhatsappFlotante.tsx` | `src/components/BotonWhatsApp.tsx` |
| `boton-whatsapp-flotante.module.scss` | `boton-whatsapp.module.scss` |
| `boton-whatsapp-flotante.test.tsx` | `boton-whatsapp.test.tsx` |
| `boton-whatsapp-flotante-estilos.test.ts` | `boton-whatsapp-estilos.test.ts` |
| `src/lib/demo/boton-whatsapp-flotante-demo.ts` (fichero nuevo) | constante NUEVA en `src/lib/demo/contacto-demo.ts` |
| montaje en `src/pages/home.tsx` | **PROHIBIDO tocar home.tsx** (lo hace otra fase) |

Export nombrado real: `export function BotonWhatsApp`. `id="whatsapp-flotante"`.
Selector SCSS: `.flotante`. Constante: `BOTON_WHATSAPP_FLOTANTE_TEXTO`
= «Hola, quiero reservar una cita en Nails Lash Studio.».

## Alcance testeable en ESTA sesión (sin `pnpm build`, sin tocar home.tsx)

- Cubro por SSR (`renderToString(<BotonWhatsApp/>)`), árbol de accesibilidad
  (`render`+`screen`), BYTES del `.module.scss` y BYTES del `.tsx`.
- Los escenarios que exigen los BYTES de `dist/` y el montaje en la home
  (@s4 montaje/posición, exit-code del build de @s5/@s6, conteo global de @s12)
  se acreditan en la FASE DE MONTAJE + BUILD (otro agente), no aquí. Quedan
  DECLARADOS como verificación diferida al final.

## Mapa @s → test

| @s | Dónde | Qué asevera |
|---|---|---|
| @s1  | `boton-whatsapp.test.tsx`        | href horneado: contiene `34625223366` y `?text=Hola%2C%20…Studio.`; sin espacio/coma crudos; sin `625 22 33 66`. Host NO aseverado. |
| @s2  | `boton-whatsapp.test.tsx`        | BYTES del `.tsx`: sin nº ni host; con `waHref(` e import de `TELEFONO` de `../lib/site`; sin el texto literal. |
| @s3  | `boton-whatsapp.test.tsx`        | 1 solo `role=link` con nombre accesible exacto; svg inline `aria-hidden`/`focusable=false`; sin `<img>`. |
| @s5  | `boton-whatsapp.test.tsx` (`<a>` no `<section>`, sin `aria-labelledby`) + `boton-whatsapp-estilos.test.ts` (sin `color`/`background`, `MINIMO_DE_PARES===18`) | puertas 1 y 3. Exit-code → build (diferido). |
| @s6  | `boton-whatsapp.test.tsx` (sin `<img>/<iframe>/<script>/<link>`) + `boton-whatsapp-estilos.test.ts` (sin `url(`/`@font-face`, ancla `.flotante`) | puerta 4. Exit-code → build (diferido). |
| @s7  | `boton-whatsapp-estilos.test.ts` | `position:fixed`, `bottom`/`right`>0, sin `left`/`top`/`inset:0`, `z-index` numérico. |
| @s8  | `boton-whatsapp-estilos.test.ts` | sin `width:100%`/`100vw`/`inset:0`; `width`/`height` ≤ 5rem. + PROXY declarado (no mide F110). |
| @s9  | `boton-whatsapp-estilos.test.ts` | `width`/`height`/`min-height` ≥ 44px (3.5rem=56px). SC 2.5.8 mínimo real 24×24 declarado. |
| @s10 | `boton-whatsapp-estilos.test.ts` | `:focus-visible` con `outline`>0 + `outline-offset`; `@media reduce` con `transition:none`+`animation:none`; `.tsx` sin estilo inline. |
| @s11 | `boton-whatsapp.test.tsx`        | BYTES del `.tsx`: sin `if (`/`?`/`&&`/`||`; con `export function BotonWhatsApp`. NO-MUTABLE declarado. |
| @s12 | `boton-whatsapp.test.tsx`        | exactamente 1 `id="whatsapp-flotante"` en el horneado del componente; sin `onclick`/`data-href`. Conteo global → build (diferido). |
| @s13 | `boton-whatsapp.test.tsx`        | constante no vacía y >10 chars; href con `?text=`; docblock «lo ENVÍA el usuario». |
| @s14 | `boton-whatsapp.test.tsx`        | mensaje genérico FIJO; sin servicio/fecha/hora/profesional; sin `<form>`. |
| @s4  | DIFERIDO (build + montaje)       | posición fuera de `</main>`, hermano de `<Pie/>`, fuera de `#contacto`. |

## Ciclos R-V-R

Ficheros creados/editados:
- `src/lib/demo/contacto-demo.ts` — constante NUEVA `BOTON_WHATSAPP_FLOTANTE_TEXTO` (+ docblock @s13).
- `src/components/boton-whatsapp.module.scss` — `.flotante` (posición/tamaño/foco/reduced-motion).
- `src/components/BotonWhatsApp.tsx` — `<a>` estático, svg inline decorativo, href derivado de waHref.
- `src/components/boton-whatsapp.test.tsx` — 22 tests (SSR + a11y + bytes .tsx + constante).
- `src/components/boton-whatsapp-estilos.test.ts` — 15 tests (bytes del .module.scss + bytes .tsx).

### VERDE
`pnpm exec vitest run src/components/boton-whatsapp.test.tsx src/components/boton-whatsapp-estilos.test.ts`
→ **37/37 verdes**. `tsc --noEmit` exit 0. `eslint` (mis 4 ficheros) exit 0.

### ROJO verificado (un test que pasa a la primera no demuestra nada)
Sabotaje puntual y reversible, confirmado en una pasada:
- `aria-label` → «Otra cosa»  ⇒ **@s3 ROJO** (nombre accesible no coincide).
- `width/height/min-height: 3.5rem → 1rem`  ⇒ **@s9 ROJO ×2** (16px < 44px).
Restaurados ambos ficheros → 37/37 verdes de nuevo. Los guardias de FUENTE (@s2, @s11)
llevan ANCLA POSITIVA (`waHref(`, `export function BotonWhatsApp`), así que no pasan por vacuidad.

### Incidencia menor durante el ciclo
El primer run puso @s6 ROJO: mi COMENTARIO del SCSS contenía la subcadena `url(`. El test
asevera sobre BYTES CRUDOS del `.module.scss` (como manda el contrato), así que reescribí el
comentario para no contener `url(` ni `@font-face`. Verde tras el arreglo.

## Verificación DIFERIDA (no es test verde en esta sesión)

Por directiva del lead (PROHIBIDO `pnpm build`, PROHIBIDO tocar `home.tsx`), estos quedan para la
FASE DE MONTAJE + BUILD y la PUERTA HUMANA:
- @s4: montaje fuera de `</main>`, hermano de `<Pie/>`, fuera de `#contacto` (BYTES de dist/).
- @s5/@s6: `codigoSalida === 0` de las 5 puertas del build.
- @s12: conteo global (exactamente 1) en el documento ENTERO de la home.
- @s8 (SC 2.4.11/F110): recorrer la home con TABULADOR y confirmar que ningún elemento enfocado
  queda oculto por completo tras el botón (atención a los últimos enlaces del pie).
- Abrir el `href` en Android, iOS y WhatsApp Web (el HOST `wa.me` NO lo cubre ningún test, A-10).
- Cargar con JavaScript DESHABILITADO y a 320px de ancho.

## Mutación
Feature NO-MUTABLE por declaración (@s11): `<a>` estático sin predicados. Toda la lógica que consume
(`waHref`, E.164, `encodeURIComponent`) es de F-02 y YA está al 100% en `src/lib/site.test.ts`; no se
re-testea aquí. Si la mutación sacara un mutante nuevo en el ámbito de esta feature → ESCALAR AL
HUMANO (no excluir, no bajar umbral, no declarar equivalente por cuenta propia).
