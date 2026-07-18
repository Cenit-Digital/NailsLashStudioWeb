# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **Feature en curso:** ninguna. `7 — hero_marca` cerrada **`done`** el 2026-07-18 (resumen en
  `history.md`).
- **Proyecto:** **7 done · 9 pending · 4 blocked.**
- **Siguiente en el camino crítico:** `8 — rejilla_responsive` (`pending`) — feature de CSS
  (`mutable: false`, se declara sin mutate propio); o `9 — catalogo_servicios`.

## Cierre de F-07 (para el siguiente, leer antes de abrir F-08)

- **F-07 estrenó la VERIFICACIÓN EN VIVO con Chrome** (extensión del humano) y se pagó sola: cazó que
  el titular salía en la fuente por defecto porque `hero.module.scss` no declaraba `font-family`
  («verde ≠ funciona», I-8). Se arregló DENTRO de F-07 (acceptance 7 / `@s17`, aprobado en la puerta):
  `.heroMarca` = Great Vibes + cursive, `.heroStudio` = Manrope + sans-serif. Re-verificado en vivo:
  `document.fonts.check` = true, LCP 136-216 ms, cero terceros. **Lección: para features de UI, una
  puerta unitaria + build NO sustituye a ver la página pintada en un navegador real.**

## 🟡 Deuda declarada por F-07 (NO reparada — una feature a la vez; decide el humano)

- **Error de app en re-navegación SUAVE de `vite-react-ssg` bajo `vite preview`:** la 2.ª navegación
  cliente a la misma URL dispara el fetch de loader-data y recibe `index.html` → `Unexpected token
  '<', "<!DOCTYPE "... is not valid JSON` (error boundary). **NO aparece en carga completa ni en
  recarga dura** (ambas renderizan perfecto), y **no lo causa F-07**. El sitio es de UNA ruta con nav
  por anclas, así que un usuario normal no dispara navegación de ruta cliente. **Revisar antes de
  publicar o al meter enrutado multipágina (F-16).**
- **El `body` global no fija `font-family`** (`grep font-family src/styles` = 0): todo el texto que no
  lo declare sale en la serif por defecto del UA (visible en la captura de F-07: «Servicios», el
  cuerpo). No hay feature/spec aprobada para la tipografía global del cuerpo → **candidato a su propia
  feature**.

## Pendiente del humano (heredado, no bloquea el código)

- **Dominio** (¿migrar con 301?), **plataforma de reseñas** (Treatwell 1.231 vs Google 226),
  **`destacados`/`ofertas`** (huérfanos, B-7), y las **deudas de higiene del judge de F-03**.
- **El corolario duro sigue:** sin razón social ni NIF válido en fuente pública, **la web no se puede
  publicar**. El objetivo es *lista para publicar*.
