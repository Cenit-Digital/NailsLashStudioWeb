# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **Feature en curso: 14 — `resenas_agregado_enlace`** · `tdd_craftsman` en rama
  `feat/galeria-v3-resenas`. **CICLO EN VERDE (2026-07-23): 142 tests nuevos (+4 en
  home-horneado, build-based, sin correr aquí), 7 sabotajes matados, typecheck/lint/prettier 0.**
  Nuevos: `Resenas.tsx`, `resenas-logica.ts`, `resenas.module.scss`, `resenas-agregado.ts`,
  `resenas-demo.ts`. home.tsx: solo el cableado ENTRE Equipo y Reserva. PENDIENTE del lead:
  añadir los 3 mutables a `stryker.config.json`, suite completa + build, judge, mutación,
  verificación en vivo. NO marcado done. Diario: `progress/tdd_resenas.md`.
- **Feature en curso: 22 — `galeria_carrusel` (v3, Enmienda 3)** · `tdd_craftsman` en rama
  `feat/galeria-v3-resenas`. **CICLO v3 EN VERDE (2026-07-23): 197 tests de galería (+49), eslint/
  tsc/prettier limpios, 16 sabotajes matados.** `carrusel-logica.ts` NUEVO (cadencia 2000, teclado
  @s21/@s22), reloj con generación (@s20), teclado cableado y guardado (@s23), mandos de cristal
  (@s24, `.mandos` fuera). Diario completo: `progress/tdd_galeria_carrusel.md` § Ciclo v3.
  PENDIENTE del lead: añadir `carrusel-logica.ts` a `stryker.config.json` → judge → mutación →
  verificación en vivo. NO marcado done.
  Anterior: sesión cerrada 2026-07-23 (features 22 y 12 → `done`; resumen en `history.md`).
- **Proyecto:** **12 done · 1 spec_ready (F-09 catálogo, contrato aprobado y abierto:
  `features/catalogo_servicios.feature`, 17 escenarios) · 5 pending · 4 blocked.**
- **Rama viva:** `feat/galeria-v3-resenas` (commiteada y empujada al cierre; PR pendiente de merge).

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
