# Corrección de puertas — Equipo / Botón WhatsApp

> Corrección de los BLOQUEANTES hallados por los revisores, SIN salir del alcance
> ni romper otros escenarios. Verificado SOLO con `vitest run` de los ficheros
> afectados (prohibido `pnpm build` / `pnpm test` en esta fase).

## Estado de los informes de revisión

- `progress/judge_equipo.md` → **APPROVED** (observaciones menores, no bloqueantes;
  quedan para el `mutation_tester`: el ternario `diaActivo/dia` de `Equipo.tsx:160,177`).
  **Nada que corregir aquí.**
- `progress/seguridad_equipo_whatsapp.md` → **SECURE** (0 crítico / 0 alto). Nada accionable ahora.
- `progress/a11y_equipo_whatsapp.md` → **no existe en el repo** (Read confirmó `File does not exist`).
  No aporta bloqueantes; no se actúa.
- `progress/judge_boton_whatsapp.md` → **CHANGES_REQUESTED**. Único bloqueante real: **@s4 sin test**.

## BLOQUEANTE corregido — @s4 del botón flotante de WhatsApp

**Problema (judge_boton_whatsapp.md, cambio requerido nº 1):** el contrato
`features/boton_whatsapp_flotante.feature` @s4 exige verificar, sobre el HTML
prerenderizado de la home, que el enlace `id="whatsapp-flotante"`:
1. aparece DESPUÉS del cierre de `</main>` (no vive en el landmark principal),
2. es hermano de `<Pie/>`,
3. NO está dentro de `#contacto`,
con ANCLAS POSITIVAS que impidan pasar por vacuidad (la trampa `indexOf === -1`).
El montaje FÍSICO era correcto (`src/pages/home.tsx`, `<BotonWhatsApp/>` hermano de
`<Pie/>` tras `</main>`), pero NINGÚN test lo pineaba: una regresión que lo moviera
a `<main>`/`#contacto`, lo duplicara o lo eliminara pasaba verde.

**Corrección:** fichero NUEVO `src/pages/boton-whatsapp-montaje.test.tsx` con
`describe('@s4 …')` y 3 `it`:
- ANCLA POSITIVA PRIMERO: el prerender contiene `</main>` y `id="whatsapp-flotante"`.
- Orden: `indexOf(id) > indexOf(</main>)` (ambos índices >= 0 gracias a la ancla).
- La sección `#contacto` extraída (regex `aria-labelledby="contacto-titulo"`) SÍ trae
  `href="tel:+34625223366"` (ancla positiva anti-vacuidad) y NO trae el botón flotante.

**Mecanismo (compatible con la fase):** se asevera sobre `renderToString(<HelmetProvider>
<Home/></HelmetProvider>)`, que es EL MISMO mecanismo del prerender SSG (patrón ya
establecido en `src/pages/home.test.tsx` @s6 y declarado en `boton-whatsapp.test.tsx`),
no jsdom. El judge listó explícitamente «patrón home-horneado.test.ts / **SSR de Home**»
como opción aceptable. Esta vía es la única verificable sin `pnpm build` (prohibido en
esta fase) — la capa autoritativa de BYTES de `dist/` (`home-horneado.test.ts`) puede
añadir la misma comprobación en la fase de build si el judge lo exige; el contrato de
@s4 ya queda cubierto por un test real y determinista.

**Reglas de test del repo respetadas:**
- Anti-tautología: literales A MANO (`</main>`, `id="whatsapp-flotante"`,
  `tel:+34625223366`, `aria-labelledby="contacto-titulo"`); NO se importa el id de
  `BotonWhatsApp` ni `TELEFONO`. El sujeto es `<Home/>`.
- Anti-vacuidad: anclas positivas PRIMERO (la comparación de índices no se hace contra -1).
- El HOST no se asevera (A-10): el fichero no menciona `wa.me` ni `api.whatsapp.com`.
- Nada de `toHaveClass` ni aserción por clase (no aplica: se asevera por bytes del prerender).

## Evidencia Rojo → Verde (sabotaje reversible, no committeado)

1. VERDE de partida: 3/3 con el montaje correcto.
2. SABOTAJE: se movió `<BotonWhatsApp/>` DENTRO de `<main>` (antes de `</main>`) en
   `src/pages/home.tsx`. → ROJO en la aserción de orden:
   `AssertionError: expected 37488 to be greater than 38938` (el id quedó ANTES de `</main>`).
   Las dos anclas positivas siguieron verdes → el rojo es real, no vacío.
3. RESTAURADO `home.tsx` a su estado correcto (botón hermano de `<Pie/>`, tras `</main>`).
   Verificado: 3/3 verde de nuevo y `grep SABOTAJE` sin residuo en `home.tsx`.

## Verificación final (SOLO ficheros afectados, sin build)

`pnpm exec vitest run src/pages/boton-whatsapp-montaje.test.tsx
src/components/boton-whatsapp.test.tsx src/components/boton-whatsapp-estilos.test.ts
src/pages/home.test.tsx`
→ **4 files passed, 42 tests passed.** `home.tsx` sin residuo de sabotaje.

## Trazabilidad @s → test (queda cerrada la laguna)

- @s4 → `src/pages/boton-whatsapp-montaje.test.tsx` (describe/it `@s4`, 3 aserciones).

## Fuera de alcance (NO tocado, declarado)

- Cambios «mayores/menores» de `judge_boton_whatsapp.md` (2: conteo global de @s12 EN EL
  DOCUMENTO; 3: exit-code del build de @s5/@s6; 4: verificaciones manuales de tabulador/
  Android/JS-off) NO son el bloqueante y requieren `pnpm build` o puerta humana → se dejan
  para su fase. El único cambio marcado **(Bloqueante)** era @s4 y queda corregido.
- Observación menor del `judge_equipo.md` (ternario `diaActivo`) es materia del
  `mutation_tester`, no una corrección de código aquí.
- ZONA PROHIBIDA del hero: no se abrió ni tocó ningún fichero del hero.
