# Verificación final — equipo + botón WhatsApp

> Medición, sin editar código. Rama `fix/titles`. Corrida única de puertas.

## Puertas (una corrida)
- **typecheck** `tsc --noEmit` → exit 0. VERDE.
- **lint** `eslint .` → 0 errores, 4 warnings `react-refresh/only-export-components`
  en `src/components/Equipo.tsx` (68,90,99,108): exporta 4 funciones PURAS
  (`diasOfrecidos`, `franjasOfrecibles`, `franjasDe`, `indiceCircular`) junto al
  componente. Es DELIBERADO (docblock L16-18: para que Stryker las muerda por valor).
  Warning, no error. VERDE.
- **build** `vite-react-ssg build` → exit 0. VERDE.
- **5 puertas** (todas VERDES):
  1. cascarón (idioma/title/description/canónica/1 h1/landmarks/JSON-LD/anti-404)
  2. placeholders (cero)
  3. contraste (18 pares AA)
  4. terceros (6 fuentes autohospedadas, cero llamadas externas)
  5. anclas vivas (igualdad de conjuntos nav ↔ secciones)

## Tests (`vitest run`, una corrida)
- **888 verdes / 1 rojo / 0 skipped** (889 casos, 31 ficheros).
- Rojo: `src/pages/home-horneado.test.ts` →
  `@s14 el build de producción con las CINCO puertas termina en código de salida 0`.
  - Causa: el test lanza `pnpm build` con `execFileSync` en `beforeAll`. El proceso
    hijo devolvió `3221226505` (0xC0000409, crash fatal de Windows) por contención
    de recursos al spawnear un build Vite completo DENTRO de la suite bajo carga.
  - **Es un FLAKE de infraestructura, NO un defecto de contenido**:
    - el fichero pasa **6/6 en aislamiento** (`vitest run src/pages/home-horneado.test.ts`);
    - el `pnpm build` en solitario sale **exit 0 con las 5 puertas verdes**.
  - **Clasificación**: NO es del hero. Es de F-10 (horario). **NO lo toca nuestro
    trabajo de equipo/whatsapp** (no importa ni Equipo ni BotonWhatsApp). Remedio:
    serializar/estabilizar ese test que spawnea build; nuestro código no cambia.
- **Rojos del hero: 0** (la sesión paralela del hero los dejó en verde).

## Verificación sobre `dist/index.html` REAL (bytes)
1. **Orden de `<h2>` por id** ✓: servicios-titulo → destacados-titulo → ofertas-titulo
   → **equipo-titulo** → **reserva-titulo** → contacto-titulo → faq-titulo.
   (Equipo tras Ofertas; Reserva tras Equipo.)
2. **Nav** ✓: hornea los 7 enlaces de sección (incluye `href="#equipo-titulo"`)
   + 1 CTA `#reserva-titulo` (Reservar). Igualdad de conjuntos confirmada por la puerta de anclas.
3. **Un solo `<h1>`** ✓ (exactamente 1).
4. **7 profesionales en orden** ✓: Lucía, Carla, Andrea, Nerea, Marta, Paula, Sara.
5. **Botón flotante FUERA de `<main>`** ✓: `#whatsapp-flotante` en offset 43532,
   `</main>` en 42606 (hermano de `<Pie/>`). Único. href
   `https://wa.me/34625223366?text=Hola%2C%20quiero%20reservar%20una%20cita%20en%20Nails%20Lash%20Studio.`
   (número 34625223366 + `?text=` urlencoded). ✓
6. **Cero `ph-woman`** ✓ (0 ocurrencias).
7. **Cero fechas horneadas en las tarjetas** ✓: la sección Equipo hornea 7
   «Cargando días…» (días diferidos a `useEffect`, cliente); ningún número de día
   ni botón «Reservar ·» horneado. (La 8ª «Cargando días…» del dist es de Reserva, ajena.)
8. **Leyenda visible horneada** ✓: «Equipo y reseñas de ejemplo · perfiles de muestra,
   pendientes de confirmar con el salón» dentro de la sección Equipo.
9. **«Facial»/«Depilación»** ✓: Facial×2, Depilación×3, **TODAS en el CATÁLOGO**
   (sección `#servicios-titulo`); **CERO en Equipo** (como se esperaba).

## Veredicto
**NO_LISTO** — estrictamente porque `pnpm test` (la puerta canónica) queda en ROJO
en la corrida completa. El rojo es un FLAKE de infra en F-10 (no del hero, no de
nuestro código): pasa 6/6 aislado y el build en solitario sale verde con las 5 puertas.
Nuestro trabajo de equipo + botón WhatsApp está limpio y las 9 verificaciones del dist
pasan. Para cerrar: re-correr la suite (o serializar el test que spawnea build); NUESTRO
CÓDIGO NO NECESITA CAMBIOS.
