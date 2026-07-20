# Spec visual — sección `#equipo`

> Transcripción **literal** de los `style="…"` inline de `Opcion-1-Rosa.dc.html` (líneas 162-246),
> mapeada a los tokens y utilidades del repo. Ningún valor está estimado.
> La consume el `tdd_craftsman` de la feature `equipo_reservas` para no calcular estilos a ojo.

## 1. `<section id="equipo">` (L162)

| Prop | Diseño | Repo |
| --- | --- | --- |
| padding | `94px 0` | `.demo-seccion` da 92px — diferencia sub-perceptible, **ceder a la utilidad** |
| scroll-margin-top | `66px` | ya se aplica globalmente por la cabecera sticky — **comprobar antes de duplicar** |
| background | ninguno (hereda `--bg`) | usar `.demo-seccion--plain` (`.demo-seccion` añade un `border-top` que el diseño NO tiene aquí) |

## 2. Contenedor y encabezado (L163-168)

| Elemento | Prop | Diseño | Repo |
| --- | --- | --- | --- |
| contenedor | max-width / padding | `1220px` / `0 40px` | `.demo-contenedor` = 1200px — ceder |
| encabezado | text-align / max-width / margin | `center` / `680px` / `0 auto 46px` | `.demo-encabezado--centro` = 620px / 38px — ceder |
| eyebrow | text-transform / letter-spacing / font-size / color / margin | `uppercase` / `.28em` / `12px` / `var(--accent)` / `0 0 14px` | `.demo-eyebrow` (usa `--accent-dark`, **correcto AA**) |
| `<h2>` | family / weight / size / line-height / margin / color | `'Gilda Display',serif` / `400` / `clamp(30px,4.4vw,50px)` / `1.04` / `0 0 14px` / `var(--ink)` | `.demo-titulo` = `clamp(1.875rem,4vw,2.875rem)`, lh 1.06 — ceder |
| intro | color / line-height / margin / font-size | `var(--text)` / `1.65` / `0` / `17px` | `.demo-intro` — **coincide exacto** |

Textos literales del diseño: eyebrow `Equipo`, h2 `Nuestro equipo de profesionales`,
intro `Elige a tu especialista, mira sus reseñas y reserva tu día y hora en segundos.`

## 3. Rejilla (L169)

`display:grid` · `grid-template-columns:repeat(auto-fit,minmax(320px,1fr))` · `gap:26px`.
En el repo, patrón de `ofertas.module.scss/.rejilla`: usar `minmax(min(320px,100%),1fr)` y `gap:1.625rem`
(el `min()` evita el desbordamiento horizontal por debajo de 320px).

## 4. Tarjeta (L171)

`background:var(--surface)` · `border:1px solid var(--line)` · `border-radius:22px` · `overflow:hidden`
· `display:flex` · `flex-direction:column`
· `box-shadow:0 16px 36px color-mix(in srgb, var(--accent) 9%, transparent)`

`.demo-card` = radius 20px, sombra `0 16px 34px … 10%` → difiere en 3 valores sub-perceptibles: **ceder a `.demo-card`**.

## 5-7. Foto, cuerpo, nombre y rol (L172-180)

| Prop | Valor |
| --- | --- |
| foto | `aspect-ratio:4/3` · `background:var(--accent-soft)` |
| cuerpo | `padding:22px 22px 24px` · `display:flex` · `flex-direction:column` · `gap:16px` |
| fila del nombre | `display:flex` · `align-items:baseline` · `justify-content:space-between` · `gap:10px` |
| `<h3>` nombre | `'Gilda Display',serif` · `400` · `23px` · `margin:0` · `color:var(--ink)` |
| rol | `color:var(--muted)` · `13px` |

## 8. Chips de especialidad (L181-184)

Contenedor: `display:flex` · `flex-wrap:wrap` · `gap:7px` · `margin-top:10px`.
Chip: `background:var(--accent-soft)` · `color:var(--accent-dark)` · `font-size:12px` · `font-weight:600`
· `padding:5px 11px` · `border-radius:30px`. **Ya cumple AA en el diseño.** Componente nuevo
(el `.chipChat` de `reserva.module.scss` tiene otra métrica: no reutilizable tal cual).

## 9. Bloque «Reserva tu cita» (L189-190)

Wrapper: `border-top:1px solid var(--line)` · `padding-top:16px`.
Rótulo: `font-size:12px` · `font-weight:700` · `letter-spacing:.1em` · `text-transform:uppercase`
· `color:var(--muted)` · `margin-bottom:10px` → **idéntico a `.pasoTitulo` de `reserva.module.scss`: reutilizar**.

## 10. Botones de DÍA (L194 activo · L197 inactivo)

Fila: `display:flex` · `gap:7px` · `flex-wrap:wrap`.
Comunes: `display:flex` · `flex-direction:column` · `align-items:center` · `min-width:44px`
· `padding:7px 8px` · `border-radius:12px` · `cursor:pointer` · `font-family:'Manrope',sans-serif`.

| | Activo | Inactivo |
| --- | --- | --- |
| border | `1px solid var(--accent)` | `1px solid var(--line)` |
| background | `var(--accent)` | `var(--bg)` |
| color | `var(--on-accent)` | `var(--text)` |
| hover | — | `border-color:var(--accent)` |
| span día-semana | `10px` · uppercase · `.04em` · `opacity:.85` | `10px` · uppercase · `.04em` · `color:var(--muted)` |
| span número | `16px` · `700` | `16px` · `700` |

**`.dia` / `.diaActivo` / `.diaDow` / `.diaNum` de `reserva.module.scss` son EXACTAMENTE esta spec**,
ya con la corrección AA aplicada (`--accent-dark` + `--border-interactive`). **Reutilizar íntegramente**
(extraer a un partial compartido en vez de copiar).

## 11. Botones de HORA (L205 activo · L208 inactivo)

Fila: `display:flex` · `gap:7px` · `flex-wrap:wrap` · `margin-top:12px`.
Comunes: `padding:8px 14px` · `border-radius:30px` · `font-size:13px` · `font-weight:600` · `cursor:pointer`.
Activo: `border:1px solid var(--accent)` · `background:var(--accent)` · `color:var(--on-accent)`.
Inactivo: `border:1px solid var(--line)` · `background:var(--bg)` · `color:var(--text)` · hover `border-color:var(--accent)`.
Casi idénticos a `.chip`/`.chipActivo` de `reserva.module.scss` (allí 9px 16px / 14px): **reutilizar con modificador de tamaño**.

## 12. Botón de reservar (L214 habilitado · L217 no habilitado)

Habilitado: `width:100%` · `margin-top:14px` · `background:var(--accent)` · `color:var(--on-accent)`
· `border:none` · `padding:12px` · `border-radius:40px` · `font-size:14px` · `font-weight:700`
· hover `background:var(--accent-dark)`.

No habilitado (en el diseño es un `<div>`, **aquí debe ser un `<button disabled>`**, ver aviso 9):
`width:100%` · `margin-top:14px` · `background:var(--bg)` · `color:var(--muted)`
· `border:1px dashed var(--line)` · `padding:12px` · `border-radius:40px` · `text-align:center` · `font-size:14px`.
`.deshabilitado` de `reserva.module.scss` ya usa ese mismo dashed + radius 40px: reutilizar.

## 13. Estado CONFIRMADO (L222-227)

Wrapper: `border-top:1px solid var(--line)` · `padding-top:16px` · `text-align:center`.
Círculo: `46px × 46px` · `border-radius:50%` · `background:var(--accent-soft)` · `color:var(--accent-dark)`
· centrado flex · `font-size:22px` · `margin:2px auto 12px` · contenido `✓`.
Mensaje: `color:var(--ink)` · `font-weight:600` · `line-height:1.4` · `margin:0 0 4px` · `font-size:15px`.
Subtexto: `color:var(--muted)` · `font-size:13px` · `margin:0 0 14px` · texto `Te confirmaremos por WhatsApp.`
Botón «Cambiar»: `background:none` · `border:none` · `color:var(--accent)` · `font-size:13px`
· `font-weight:600` · `text-decoration:underline`.

## 14. Bloque de RESEÑA (L230-240)

Wrapper: `border-top:1px solid var(--line)` · `padding-top:16px`.
Estrellas: `color:var(--accent-2)` · `font-size:14px` · `letter-spacing:2px` · `margin-bottom:8px`.
Texto: `color:var(--text)` · `line-height:1.55` · `margin:0 0 10px` · `font-size:14px` · `min-height:60px`
(comillas tipográficas `“ ”` en el markup — evitan el salto de altura al cambiar de reseña).
Pie: `display:flex` · `align-items:center` · `justify-content:space-between` · `gap:10px`;
autora `color:var(--muted)` · `13px` · `600`; grupo de flechas `display:flex` · `align-items:center` · `gap:8px`.
Flechas `←` / `→`: `30px × 30px` · `border-radius:50%` · `border:1px solid var(--line)`
· `background:var(--bg)` · `color:var(--accent)` · `font-size:13px` · hover `border-color:var(--accent)`.

## Mapeo de variables diseño → repo

| Var | Diseño (L28) | Repo `_tokens.scss` | ¿Coincide? |
| --- | --- | --- | --- |
| `--bg` | `#FDF4F7` | `#FDF4F7` | sí |
| `--surface` | `#FFFFFF` | `#FFFFFF` | sí |
| `--accent-soft` | `#F7DDE8` | `#F7DDE8` | sí |
| `--text` | `#5E404A` | `#5E404A` | sí |
| `--line` | `rgba(176,70,106,.16)` | igual | sí (solo decorativo) |
| `--on-accent` | `#FFFFFF` | `#FFFFFF` | sí |
| `--accent` | `#C05576` | `#C05576` | mismo hex, **uso restringido** |
| `--muted` | `#9C7F89` | `#6F525A` | **NO** — el repo lo oscurece por AA |
| `--ink` | `#B0466A` | `#8E3355` | **NO** — el repo lo oscurece por AA |
| `--accent-2` | `#E38AAE` | `#B3316E` | **NO** — cambio grande (afecta a las estrellas) |

## Avisos

1. **`--accent` está PROHIBIDO como texto pequeño y como relleno con blanco encima** (4,05 / 4,37:1).
   Afecta a: eyebrow (§2), día activo y hora activa (§10-11), botón de reservar (§12),
   botón «Cambiar» de 13px (§13) y flechas de reseña de 13px (§14).
   **Todos van a `--accent-dark`.** `--accent` solo sobrevive dentro del `color-mix` de la sombra.
2. **Bordes de controles**: el diseño usa `--line` para el borde de día/hora inactivos, pero `--line`
   es decorativo y no llega a 3:1 (SC 1.4.11). Para día / hora / flechas usar **`--border-interactive`**,
   como ya hace `reserva.module.scss`. `--line` sí vale para los `border-top` separadores (§9, §13, §14).
3. **Estrellas**: `--accent-2` pasa de `#E38AAE` a `#B3316E`; se verán más oscuras que el prototipo.
   Es intencional (F-03), no un error de implementación.
4. **`opacity:.85` del día-semana activo: NO aplicarlo.** Sobre `--accent-dark` deja un texto de 10px
   en ~4,6:1, al filo. `reserva.module.scss` ya lo omite.
5. **Divergencias métricas menores** con las utilidades ya existentes (sección 94 vs 92px; contenedor
   1220 vs 1200px; encabezado 680/46 vs 620/38px; h2 y card radius/sombra): **ceder a las utilidades**.
   Son sub-perceptibles y evitan duplicar tokens.
6. `.demo-seccion` añade un `border-top` que `#equipo` no tiene: usar **`.demo-seccion--plain`**.
7. Ojo con el fondo alterno: en la home, `Ofertas` usa `--alt` y `Reserva` también. Con `Equipo` en
   medio y sin fondo, la alternancia queda Ofertas(alt) → Equipo(plain) → Reserva(alt): **correcta**.
8. **Reutilización directa recomendada**: `.pasoTitulo`, `.dia` / `.diaActivo` / `.diaDow` / `.diaNum`
   y `.deshabilitado` de `reserva.module.scss` ya son la spec exacta con AA aplicado.
9. **El estado no habilitado debe ser `<button disabled>`, no un `<div>` como en el diseño**: el estado
   tiene que vivir en un atributo consultable (regla del repo) o el mutante sería inmatable.
