# Brief — foto bajo cabecera+hero, fotos del catálogo y logo caligráfico acoplado (2026-09-29)

> Lo escribe el `craftsman_lead` para el `spec_partner` y el `gherkin_author` (regla
> anti-teléfono-descompuesto). Recoge el encargo LITERAL de Pablo, sus decisiones por
> AskUserQuestion y el análisis técnico del lead. NO es la spec: la spec vive en `project-spec.md`.

## 1. El encargo literal (Word «NailLashStudio» + explicación de Pablo)

- «Foto debajo del nav bar y el header, y la línea divisoria»
- «Fotos en los cuadros rosas de los servicios»
- «Letras de Nail Lash, que suban para arriba, y que se quede de logo a la izquierda»
- «O sea la misma tipografía que el logo del medio: cuando ya no se vea, que [en la] esquina
  superior izquierda de la pantalla se quede la tipografía del de en medio»

Explicación de Pablo, punto por punto (resumida con sus palabras):

1. **Foto bajo nav + header.** La zona de la foto es TODO el nav (Servicios, Destacados, Ofertas,
   Equipo, Reserva, Contacto, FAQ, Reservar) y todo el header (rótulo «Nails Lash Studio», el
   subtítulo «Tu salón de belleza integral…», los CTAs «Reservar cita» / «Ver servicios») HASTA la
   línea divisoria fina que separa el hero del catálogo («es muy fina y no se aprecia mucho, por
   eso queda muy bonita»). Planteó dos opciones: (A) foto solo en el header, no en el nav; (B) la
   foto completa, con el nav en un color de poco contraste / transparencia / «gradación de la
   visibilidad» para que el foco del usuario sea la foto. **Pablo elige la B**: la foto ocupa nav +
   header hasta la línea divisoria. La foto debe estar relacionada con el negocio: «una mano con
   unas uñas muy bonitas o algo del estilo» — lo investiga el equipo.
2. **Fotos en las cards de servicios.** Una imagen que ocupe TODA la card rosa (el hueco `.foto`
   de 4:5 de cada categoría del catálogo), relacionada claramente con ESE servicio.
3. **Logo caligráfico acoplado.** La tipografía del rótulo del hero («Nails Lash», la que el
   aplicador pinta a mano) y la del logo del nav («nails lash studio» en Gilda Display) NO son
   iguales. Pablo quiere: al hacer scroll hacia abajo, una animación suave, que se aprecie y con
   el foco puesto en ella, en la que «Nails Lash» del header **suba hacia el nav**, haga un juego
   de **transparentarse / traslucirse** y **se quede como logo** en la esquina superior izquierda.
   **Disparo:** la animación se produce cuando el scroll deja de ver la palabra «STUDIO» del header.
   Referencia visual: la web actual del salón (imagen 5), con el logo caligráfico pequeño arriba a
   la izquierda sobre una foto de manos con uñas negras y doradas.

## 2. Decisiones de Pablo (AskUserQuestion, 2026-09-29)

| #   | Pregunta                                                                | Respuesta de Pablo                                                                                                                                                                                                                         |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1  | Origen de las fotos (Pexels/Unsplash bloqueados por la red del entorno) | «Abro Pexels, pero hazlo tú de forma autónoma» → fotos de **Pexels**, elegidas por el equipo de forma autónoma, con el mismo criterio que las 13 actuales (licencia Pexels, SIN rostro identificable, alojadas en el repo, cero terceros). |
| P2  | Al volver a subir y reaparecer «STUDIO», ¿qué hace el logo del nav?     | **«Se queda la caligrafía»**: una vez acoplada, permanece aunque se vuelva arriba del todo.                                                                                                                                                |
| P3  | ¿El logo acoplado lleva «STUDIO» pequeño debajo?                        | **«Solo "Nails Lash"»**: solo la caligrafía, sin la palabra STUDIO.                                                                                                                                                                        |

⚠️ **Bloqueo de entorno vigente:** a 2026-09-29 el proxy de salida devuelve 403 a
`www.pexels.com`, `images.pexels.com` y `api.pexels.com` (política de red del entorno). Pablo va a
abrirlo. Hasta entonces NO se pueden descargar las fotos nuevas → el orden de TDD pone primero la
feature que no necesita fotos (el logo acoplado).

## 3. Análisis técnico del lead (para debatir en la spec, no es contrato)

### 3.1 Estado actual medido

- `src/pages/home.tsx`: `<Cabecera/>` (fuera de `<main>`) + `<main>` → `div.demo-hero` (envuelve
  `<Hero/>` + `p.demo-hero-sub` + `div.demo-hero-cta`) → `<Catalogo/>` (`section.demo-seccion`,
  cuyo `border-top: 1px solid var(--line)` ES la «línea divisoria» de Pablo).
- `src/components/cabecera.module.scss`: `.cabecera` es `position: sticky; top: 0; z-index: 50`,
  fondo `--header-bg` (`color-mix(--bg 88%, transparent)`) + `--header-blur` (14px),
  `border-bottom: 1px solid var(--line)`. La marca `.marca` es un `<a>` con el texto `NOMBRE` en
  Gilda Display 19px, lowercase, color `--ink`.
- `src/styles/_tokens.scss`: el 88 % de `--header-bg` está DEFENDIDO por la puerta de contraste
  (`tools/puerta-contraste.ts`, pares «enlaces de la nav / logo sobre la cabecera translúcida» con
  el PEOR UNDER POSIBLE = negro puro #000000): nav 4,89 · logo 5,38. Bajarlo rompe el build.
- `src/components/Hero.tsx`: rótulo `<svg viewBox={VISTA_MARCA}>` con `<text>` Great Vibes
  (1000 u = 1 em, línea base y=0) enmascarado por el trazo; `<h1>` con `span.heroMarca` (visually
  hidden) + text node espacio + `span.heroStudio` («Studio», visible, Manrope 600 uppercase
  letter-spacing .52em). Nombre accesible del h1 = «Nails Lash Studio» (protegido por contrato).
- `src/components/catalogo.module.scss` → `.foto` = `div aria-hidden` 4:5, radio 22px, degradado
  rosa (placeholder). Categorías de `src/lib/demo/catalogo-demo.ts`: `unas`, `facial` (incluye
  lifting/tinte de pestañas y diseño de cejas), `depilacion`.
- Precedente de fotos: `progress/tdd_fotos_equipo_galeria.md` — 13 fotos Pexels 800×600 en
  `src/assets/trabajos/`, `<img>` con `alt` útil, `width`/`height`, `loading="lazy"`,
  `object-fit: cover`, sin rostro identificable, leyenda honesta «fotos de banco de imágenes».
- jsdom 25 NO implementa `matchMedia`, `IntersectionObserver` ni `Element.animate` (WAAPI):
  todo uso va guardado (precedente Hero.tsx / Galeria.tsx).

### 3.2 Foto bajo nav + hero (punto 1) — la tensión que la spec debe resolver

La foto tiene que empezar en y = 0 de la página (detrás de la cabecera sticky) y acabar en la línea
divisoria. La cabecera es sticky y hermana ANTERIOR de `<main>`: envolver cabecera+hero en un
contenedor común ROMPE el sticky (sticky se confina a su bloque contenedor). Vía probable: el hero
sube bajo la cabecera (margen negativo = alto de cabecera, con el alto como custom property única)
y la foto es una capa del hero.

**Contraste (el punto duro).** La puerta de F-03 garantiza AA de la nav contra CUALQUIER foto
porque modela el peor under (negro) con el 88 %. Si la nav se vuelve transparente sobre la foto,
esa garantía desaparece en cuanto se hace scroll (la parte menos velada de la foto pasa por debajo).
Opciones que el lead ve:

- **(i) Cristal esmerilado permanente (recomendada por el lead).** La cabecera conserva su 88 % +
  blur: la foto arranca detrás del nav y se ve a través del cristal difuminada (12 % + blur).
  Garantía AA intacta sin tocar la puerta. Para que el cristal no se lea como una franja dura
  («que no se aprecie tanto»), la foto se elige con la franja superior clara/aireada y lleva un
  degradado suave de `--bg` en su borde superior (gradación de la visibilidad).
- (ii) Nav transparente arriba del todo y cristal al hacer scroll (CSS scroll-driven o JS). Solo es
  AA si la franja superior de la foto está velada ≥ 88 % en (alto cabecera + distancia de
  transición) → visualmente casi igual que (i), con más maquinaria.
- (iii) Medir los píxeles REALES de la foto elegida y permitir un cristal más fino. Frágil: cambiar
  la foto invalida la medida; exigiría decodificar la imagen en la puerta.

**Texto del hero sobre la foto.** Rótulo (`--ink`, texto grande → 3:1), «STUDIO» (`--ink`, 14 px en
móvil → 4,5:1), subtítulo (`--text` → 4,5:1), CTA sólido (su propio fondo, sin cambio) y CTA
fantasma (`--accent-dark` sin fondo → 4,5:1). Propuesta: un VELO de `--bg` detrás del bloque de
texto (elíptico/radial, denso en el centro y que se abre hacia los lados y el borde inferior, donde
la foto se ve plena) + el CTA fantasma con fondo propio translúcido. La densidad del velo en el
núcleo va como token y la PUERTA DE CONTRASTE se amplía con los pares nuevos contra el peor under
(negro), igual que A-15. Cálculo orientativo del lead (a verificar con la función real de
`src/lib/contraste.ts`): `--text` necesita velo ≥ ~75 %, `--ink` a 14 px ≥ ~80 %, `--accent-dark`
≥ ~91 % (por eso el CTA fantasma lleva fondo propio).

**Imagen:** decorativa (`alt=""`: el mensaje ya lo llevan h1/subtítulo), candidata a LCP → NO
`lazy`, `fetchpriority="high"`, `width`/`height`, `object-fit: cover` con `object-position`
elegido para que el sujeto (la mano) quede fuera del núcleo de texto. Tamaño razonable (≈1920 px
de ancho, JPEG/WebP comprimido) — F-17 (`pipeline_imagenes`) sigue bloqueada; no se construye aquí
la tubería AVIF/WebP completa salvo que la spec lo decida.

### 3.3 Fotos del catálogo (punto 2)

Sustituir el `div.foto aria-hidden` de cada categoría por `<img>` con `alt` útil y específico del
servicio, `width`/`height` reales, `loading="lazy"`, `object-fit: cover`, sin rostro identificable,
alojada en `src/assets/` (cero terceros). Datos en `catalogo-demo.ts` (`foto`, `alt` por
categoría). Honestidad: la leyenda del catálogo declara «fotos de banco de imágenes» (precedente de
equipo/galería). Categorías: Uñas (manicura/esmalte), Facial (incluye pestañas y cejas: una foto de
tratamiento facial o de pestañas sin cara identificable), Depilación (cera tibia / piernas suaves,
sin cara).

### 3.4 Logo caligráfico acoplado (punto 3)

- **Dos estados de la marca de la cabecera**, publicados en un ATRIBUTO consultable (convención del
  repo: nunca className condicional), p. ej. `data-logo="texto" | "caligrafia"`:
  - `texto` — el actual «nails lash studio» en Gilda. Es lo que se HORNEA (SSR) y lo que se ve al
    cargar arriba del todo.
  - `caligrafia` — «Nails Lash» en Great Vibes (el MISMO `<text>`/escala del rótulo del hero, SIN
    máscara ni animación de pincel), SOLO «Nails Lash» (P3). Puede ir horneado pero oculto para no
    inyectar nada en cliente; `aria-hidden`.
  - El nombre accesible del enlace sigue siendo EXACTAMENTE «Nails Lash Studio» (`NOMBRE`) en ambos
    estados; el enlace sigue apuntando a `BASE_URL`. El hueco del logo tiene dimensiones estables:
    la nav NO salta al cambiar de estado (sin CLS).
- **Disparo:** cuando «STUDIO» (`span.heroStudio`) queda ENTERO por encima del borde inferior de la
  cabecera sticky (ya no se ve). `IntersectionObserver` sobre el span con `rootMargin` superior =
  −alto de cabecera; «ha pasado por arriba» ≠ «aún no ha llegado» (distinguir por la geometría del
  entry, no solo `isIntersecting`).
- **Monótono (P2):** una vez `caligrafia`, se queda así durante toda la visita, aunque se vuelva
  arriba. Recargar arriba del todo vuelve a empezar en `texto`.
- **Carga ya desplazada** (recarga a mitad de página, ancla): si al montar «STUDIO» ya está por
  encima, el estado pasa a `caligrafia` — a decidir en la spec si con vuelo o sin él (el lead
  propone sin vuelo: no hay nada que «subir» que el usuario haya visto).
- **La animación (el foco de Pablo):** un vuelo FLIP de ~0,8–0,9 s con curva suave: una copia
  fantasma de «Nails Lash» sale del rectángulo ACTUAL del rótulo del hero, SUBE encogiéndose hasta
  el hueco del logo en la esquina superior izquierda, pasando de translúcida (~0,3–0,4) a opaca
  (el «transparentarse/traslucirse» de Pablo); mientras, «nails lash studio» se desvanece. Al
  aterrizar, el fantasma se retira y queda el logo caligráfico. WAAPI (`element.animate`) con guarda
  (jsdom no lo tiene). La lógica pura (¿se acopla?, transición de estado monótona, cálculo de la
  transformación FLIP a partir de dos rectángulos) va en un `*-logica.ts` mutable al 100 %.
- **prefers-reduced-motion:** sin vuelo; el cambio de estado es instantáneo (criterio C-4 del repo).
- **Comunicación hero → cabecera:** la cabecera vive FUERA de `<main>`; el estado puede subir a
  `home.tsx` (dueño común) o la cabecera observar el span por un atributo estable. A decidir.
- Si la caligrafía del hero aún se está escribiendo (15 s) cuando se dispara el acople, el logo del
  nav muestra la firma COMPLETA (no hereda la máscara).

### 3.5 Orden propuesto (una feature a la vez)

1. **F-25 `logo_acoplado`** — no depende de fotos; se puede hacer ya.
2. **F-26 `hero_foto`** — necesita la foto panorámica (Pexels desbloqueado).
3. **F-27 `catalogo_fotos`** — necesita las 3 fotos verticales.

## 4. Actualización 2026-09-29 (tarde)

- Pablo abrió la red del entorno a «Completo»: `images.pexels.com` responde 200. `www.pexels.com`
  sigue tras el desafío anti-bots de Cloudflare, pero las fotos se descargan del CDN oficial.
- **Fotos elegidas y medidas por el lead:** `progress/fotos_seleccion.md` (hero 939835, Uñas
  34373403, Facial 7479587, Depilación 5202459) con la luminancia REAL de la foto del hero
  (mediana 0,70; píxel más oscuro 0,137). Abre un modelo de contraste alternativo al del negro
  puro: el peor under = el píxel más oscuro real de la foto, vigilado por un test que decodifica
  el JPEG commiteado.
