# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **Ninguna feature en curso.** Última sesión cerrada: 2026-07-23 (features 22 `galeria_carrusel`
  y 12 `contacto` → `done`; resumen completo en `history.md`).
- **Proyecto:** **11 done · 1 spec_ready (F-09 catálogo, contrato aprobado y abierto:
  `features/catalogo_servicios.feature`, 17 escenarios) · 6 pending · 4 blocked.**
- **Rama viva:** `feat/galeria-coverflow-3d` (commiteada y empujada al cierre de la sesión del 23).

## Deuda de mutación de la corrida completa (2026-07-23, tdd_craftsman)

- Cerrados 5/18 supervivientes huérfanos: **Reserva.tsx 100 %** (3 con tests + 1 refactor de guarda
  inobservable a `reserva-logica.ts`), **reserva-logica.ts 100 %**, **Equipo.tsx 100 %** (1 borrado
  de dato muerto). **horario.ts se queda en 85,56 % con 13 ESCALADOS**: son mutantes ESTÁTICOS que
  el `vitest-runner` de Stryker NO llega a activar in-process (verificado con sabotajes a mano —
  la suite los mata TODOS cuando la mutación es real — y con una sonda de módulo fresco que tampoco
  murió). NO es deuda de aserción: es límite del arnés. Menú de curas para el lead en
  `progress/tdd_deuda_mutacion_full.md` (§ escalado): refactor perezoso / `ignoreStatic` / aceptar
  documentado.

## 🟡 Deudas vivas (heredadas; decide el humano)

- **Re-navegación SUAVE de `vite-react-ssg` bajo `vite preview`** (de F-07): la 2.ª navegación
  cliente a la misma URL rompe con `Unexpected token '<'`. No aparece en carga completa ni recarga
  dura; el sitio es de una ruta con anclas. **Revisar antes de publicar o al meter multipágina (F-16).**
- **El chat de `#reserva` sigue sin decir en pantalla que es una demostración** (D1 de su contrato);
  entrega la solicitud real por WhatsApp, pero la leyenda visible merece su escenario.
- **Catálogo**: precios descolocados desde `5a1345c` y anuncia «Facial»/«Depilación» que el salón no
  ofrece (`progress/deuda_precios_catalogo.md`). **Pablo pidió expresamente no tocarlo.** Los huecos
  de foto del catálogo siguen vacíos.
- **`loading="lazy"` en las 6 fotos del coverflow** (aviso menor del a11y de la galería): casi todas
  están en viewport y el lazy retrasa el pintado. Cuando se renegocie el contrato: `eager`/
  `fetchpriority` para las 3 visibles.
- `features/contacto.feature` @s11/@s12 reservan el MAPA a F-11; el botón «Cómo llegar» ya existe y
  desde el 2026-07-23 su href y clases están aseverados (mutación 100 %). F-11 queda para el mapa.

## Pendiente del humano (heredado, no bloquea el código)

- **Dominio** (¿migrar con 301?), **plataforma de reseñas** (Treatwell 1.231 vs Google 226),
  **`destacados`/`ofertas`** (huérfanos, B-7), y las **deudas de higiene del judge de F-03**.
- **El corolario duro sigue:** sin razón social ni NIF válido en fuente pública, **la web no se puede
  publicar**. El objetivo es *lista para publicar*.
