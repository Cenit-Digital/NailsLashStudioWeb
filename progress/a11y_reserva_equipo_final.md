# Auditoría a11y/SEO — `#reserva` (enlaces WhatsApp/Llamar) y monograma de `#equipo`

Alcance: solo el diff de `src/components/Reserva.tsx` + `reserva.module.scss` y `Equipo.tsx` +
`equipo.module.scss`. Verificado contra `dist/index.html` (build ya generado) sin ejecutar build/tests.

**Veredicto: sin bloqueantes. Todo lo auditado pasa; dos observaciones menores (no bloqueantes).**

---

## 1. Nombre accesible de los dos enlaces nuevos — SC 2.4.4 (Link Purpose, In Context) — PASS 🔵

`src/components/Reserva.tsx:107-112`:
```
<a className="demo-btn demo-btn--wa" href={waHref(...)}>WhatsApp</a>
<a className="demo-btn demo-btn--ghost" href={telHref(...)}>Llamar al estudio</a>
```

- «Llamar al estudio»: autodescriptivo, pasa incluso SIN contexto (nivel AAA 2.4.9, no exigido). Nada
  que corregir.
- «WhatsApp» a secas: el criterio EXIGIDO es 2.4.4 (in-context), no 2.4.9 (link-only, AAA). El contexto
  lo salva: está dentro de `<section aria-labelledby="reserva-titulo">` cuyo `<h2>` es «¿Prefieres
  reservar por chat?» (Reserva.tsx:98-100) y el párrafo inmediatamente anterior menciona
  explícitamente «...te confirmamos la hora exacta por WhatsApp» (línea 101-104). Un lector de
  pantalla que navegue linealmente o por encabezados tiene contexto de sobra. PASA 2.4.4.
- 🔵 **Menor (no bloqueante):** para robustez ante navegación "por lista de enlaces" (rotor, que
  salta el contexto), un `aria-label="Reservar por WhatsApp"` sería más defensivo. NO es obligatorio:
  no hay otro enlace con texto idéntico «WhatsApp» en la página (Contacto.tsx:63-68 usa «Escríbenos
  por WhatsApp», distinto texto → no hay colisión de nombre-mismo-destino-distinto que haría fallar
  2.4.4 por la técnica F84). `reserva.test.tsx:96-102` ya fija `textContent === accessibleName`
  (SC 2.5.3 Label in Name), así que si algún día se añade `aria-label` debe mantenerse la subcadena.

## 2. Tamaño de objetivo — SC 2.5.8 (Target Size Minimum, AA, 24×24 CSS) — PASS

`.demo-btn` en `src/styles/_demo.scss:129-139`:
```
padding: 0.9375rem 2rem; // 15px 32px
font-size: 0.9375rem;    // 15px, line-height "normal" (sin override, ~1.15-1.2)
```
Altura renderizada ≈ 15px×2 + (~15×1.15-1.2) ≈ **47-48px**. Anchura (contenido + 64px de padding
horizontal): «WhatsApp» ≈ 125-135px, «Llamar al estudio» ≈ 205-215px. Ambos ejes superan
sobradamente el mínimo AA de 24×24 y **mantienen el suelo histórico de 44×44** que ya traía el
repo (mismo patrón que `.flotante` en `boton-whatsapp.module.scss:17`, 56×56). Nada que corregir.

## 3. Foco visible (SC 2.4.7) y foco no obstruido (SC 2.4.11) — PASS con una verificación manual sugerida

- **2.4.7**: no hay ninguna regla de foco propia en `reserva.module.scss` para `.acciones a`, así que
  aplica la regla GLOBAL `src/styles/_base.scss:18-22` (`outline: 3px solid var(--border-interactive);
  outline-offset: 2px;`), ya probada por `cascara-global.test.ts`. PASA.
- **2.4.11**: el botón flotante de WhatsApp (`src/components/boton-whatsapp.module.scss:10-24`) es
  `position: fixed; right/bottom: 1.25rem; z-index: 1000;` con caja de 56×56px, y **no existe
  `scroll-padding-bottom`** que lo compense (solo hay `scroll-padding-top: 6rem` en
  `src/styles/_base.scss:41`, pensado para la cabecera, no para este overlay). Dicho esto, el
  criterio AA exige que el componente NO quede **enteramente** oculto, y dado que cada `.demo-btn`
  mide ≥48px alto × ≥125px ancho (punto 2) frente a la caja de 56×56 del flotante, es geométricamente
  improbable que uno de los dos enlaces quede totalmente tapado — como mucho, un solape parcial en
  viewports muy bajos (móvil en horizontal). 🔵 **Menor:** verificar visualmente en un viewport corto
  (p. ej. 375×560) que al tabular hasta «Llamar al estudio» no quede el borde inferior bajo el
  flotante; si ocurriera, un `scroll-margin-bottom` en `.acciones a` (≈80px) lo resolvería. No es
  bloqueante porque no hay ocultación TOTAL previsible.

## 4. Monograma decorativo — ¿fuera del árbol de accesibilidad? — PASS

`src/components/Equipo.tsx:74-75`:
```
<div className={estilos.foto} aria-hidden="true">
  <span className={estilos.monograma}>{inicialDe(profesional.nombre)}</span>
</div>
```
Confirmado en `dist/index.html`: `aria-hidden="true"><span class="_monograma_1imbm_26">L</span>`
(y C/A/N/M/P/S para el resto). `aria-hidden="true"` en el contenedor saca TODO su subárbol
(incluido el `<span>` con la letra) del árbol de accesibilidad — un lector de pantalla NO
anunciará una «L» suelta. El nombre accesible de la tarjeta lo sigue aportando el
`<h3 className={estilos.nombre}>{profesional.nombre}</h3>` (Equipo.tsx:79), intacto y sin relación
con el monograma. PASA.

## 5. Contraste del monograma — SC 1.4.3 — PASS (≈4.86:1)

Valores reales de `src/styles/_tokens.scss:21,37`: `--accent-soft: #F7DDE8` (fondo, `.foto` en
`equipo.module.scss:33`) y `--accent-dark: #A23E5F` (texto, `.monograma` en
`equipo.module.scss:45`). Ratio de luminancia relativa calculado: **≈4.86:1**.
`.monograma` usa `font-size: 2.75rem` (44px) y `font-weight: 400` (equipo.module.scss:44) → 44px
regular supera el umbral de "texto grande" (≥24px/18pt regular), por lo que el umbral aplicable de
1.4.3 es **3:1**, no 4.5:1 — se cumple con margen amplio (4.86 > 3). Nota: aunque se aplicase el
umbral más estricto de 4.5:1 (por si en algún breakpoint el `clamp`/zoom lo redujera por debajo de
24px), también se cumpliría. Es el mismo par ya auditado para `.chipEspecialidad` (comentario en
`equipo.module.scss:39-40`). Nada que corregir.

## 6. Jerarquía de encabezados en `dist/index.html` — PASS

Un solo `<h1>` (recuento=1). Secuencia sin saltos alrededor de los cambios:
`<h2 id="equipo-titulo">` → 7×`<h3 class="_nombre_...">` (nombres del equipo) →
`<h2 id="reserva-titulo">¿Prefieres reservar por chat?</h2>` → siguiente `<h2>`. El cambio en
`#reserva` solo tocó el TEXTO del `<h2>` (antes «Pide tu cita en un momento»), no su nivel ni su
`id` (`reserva.test.tsx:56-64` lo ancla). El monograma no introduce ningún encabezado. Nada que
corregir.

## 7. SEO del `<head>` / JSON-LD — sin alteración — PASS

`dist/index.html:1`: `<title>` único, `<meta name="description">` único, `<link rel="canonical">`
y `<script type="application/ld+json">` (schema.org `BeautySalon`) — idénticos a lo esperado, el
diff de `Reserva`/`Equipo` no toca `<head>` (son componentes de `<body>`). No hay Open Graph ni
Twitter Card en el proyecto, pero es preexistente y fuera del alcance de este diff (no lo introdujo
ni lo rompió este cambio). Nada que corregir aquí.

## 8. `prefers-reduced-motion` — PASS (nada nuevo que gatear)

Ni `Reserva.tsx`/`reserva.module.scss` ni `Equipo.tsx`/`equipo.module.scss` añaden `transition`,
`animation` ni `@keyframes` nuevos: los `:hover` de `.dia`/`.horaOpcion`/`.flecha`
(`equipo.module.scss:136-138,182-184,324-326`) son cambios instantáneos de `border-color`/
`background`, sin propiedad `transition` declarada. No hay nada nuevo que requiera un guard de
`prefers-reduced-motion` en este diff.

---

### Resumen de hallazgos
- 🔴 Bloqueantes: **0**
- 🟡 Importantes: **0**
- 🔵 Menores: **2** — (a) `aria-label` opcional en «WhatsApp» para navegación fuera de contexto
  (no exigido por 2.4.4, sí por 2.4.9 AAA); (b) verificar manualmente en viewport bajo que el
  flotante de WhatsApp no solape parcialmente «Llamar al estudio» al enfocarlo (no hay ocultación
  TOTAL prevista, así que 2.4.11 AA no se incumple).
