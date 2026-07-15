# Auditoría de accesibilidad — prototipo "Opción 1 Rosa"

**Fecha:** 2026-07-15
**Artefacto auditado:** `Opcion-1-Rosa.dc.html` (462 líneas)
**Ruta completa (ubicación transitoria, scratchpad de sesión):**
`C:/Users/vhurt/AppData/Local/Temp/claude/C--Users-vhurt-OneDrive-Escritorio-Proyectos-CenitDigitalProyectosCodigo-NailsLashStudioWeb/d9bf86dc-79ce-4d29-aaec-eeb87ab57df6/scratchpad/design/sitio-web-sal-n-de-u-as/project/Opcion-1-Rosa.dc.html`
**Ficheros de apoyo auditados:** `salon-data.js` (119 líneas), `image-slot.js` (~1000 líneas), `support.js`
**Norma de referencia:** WCAG 2.2, nivel AA
**Método de cálculo:** fórmula normativa WCAG implementada en Python y ejecutada sobre la paleta real. Scripts reproducibles: `scratchpad/contrast.py`, `contrast2.py`, `contrast3.py`.

> ⚠️ **Aviso de alcance.** Todas las referencias `archivo:línea` de este informe apuntan al prototipo en el **scratchpad temporal de la sesión**, no a un fichero del repositorio. El prototipo está en formato propietario `.dc.html` (etiquetas `<x-dc>`, `<helmet>`, `<sc-for>`, `<sc-if>`, `image-slot`), que **no es HTML de producción**. Ver §5 para qué hallazgos son del prototipo y cuáles serán reales en producción.

---

## 1. Respuesta ejecutiva

**Qué hacemos: la paleta rosa NO se puede publicar tal cual. Se adopta con tres cambios de token obligatorios, y la maquetación se rehace con semántica real en la implementación de producción.**

De **68 combinaciones texto/fondo y componente/fondo** que la página usa realmente, **32 incumplen WCAG 2.2 AA** (47%). No son casos raros: fallan el color de la navegación, el color de los precios, el botón "Reservar" principal, las estrellas de las reseñas y todo el pie de página.

La buena noticia: **casi todos los fallos se concentran en 4 tokens**, y **3 de ellos se arreglan sin inventar colores nuevos**, reutilizando `--accent-dark #A23E5F`, que ya existe en la paleta y pasa en los cuatro fondos del sitio (mínimo 4.86:1). Es decir: el problema no es la estética rosa, es que la paleta **confunde "color de marca para rellenos" con "color de texto"**.

Prioridades, en orden:

1. **`--muted #9C7F89` es inservible como color de texto.** 3.35:1 sobre `--bg`, 3.61:1 sobre `--surface`. Causa **11 de los 32 fallos**. Se sustituye por `#6F525A` (6.42:1 / 6.93:1).
2. **`--accent #C05576` es inservible como texto pequeño y como relleno de botón con texto blanco.** 4.05:1 sobre `--bg`, y blanco sobre él da **4.37:1 < 4.5:1** — el botón "Reservar", la CTA principal del negocio, falla. Se sustituye por `--accent-dark #A23E5F` (ya existe).
3. **`--accent-2 #E38AAE` da 2.47:1 con blanco** (badges de oferta) y como color de las estrellas de reseña. Se sustituye por `#B3316E` (5.86:1) para esos usos.
4. **`--line rgba(176,70,106,.16)` da 1.26:1** — invisible. Formalmente solo incumple donde delimita **componentes interactivos** (borde del input de chat, botones de día/hora, swatches de color): SC 1.4.11 exige 3:1. Hay que **partir el token en dos**: uno decorativo (se queda) y uno interactivo (`#AB5F79`, 3.54:1 mínimo).
5. **El pie de página entero falla** (2.71:1 – 4.15:1): texto blanco con opacidad sobre `--ink #B0466A`. Con ese fondo, ni siquiera `rgba(255,255,255,.82)` pasa (4.15:1). Hay que oscurecer el fondo del pie.

Más allá del color, **el prototipo no tiene ni una sola línea de accesibilidad**: **0 atributos `aria-*`, 0 `role`, 0 `<label>`, 0 `<h1>`, 0 `<main>`, 0 `<title>`, sin `lang`, y 0 ocurrencias de `prefers-reduced-motion`** — todo verificado por conteo directo (§3.3). Hay además un fallo de **Nivel A** claro y objetivo: la animación `bob ... infinite` (L57) se mueve indefinidamente sin mecanismo de parada (SC 2.2.2).

**Dos hallazgos positivos que conviene preservar** (y que contradicen lo que suele asumirse de un prototipo):
- **No hay ni un solo `div` clicable.** Los 14 elementos con `onClick` son `<button>` reales (verificado, §3.4). El prototipo acierta aquí.
- **Los tamaños de destino cumplen SC 2.5.8** (24×24 px mínimo): el más pequeño son las flechas de reseña, 30×30 px.

**Recomendación:** aprobar la dirección estética rosa, **condicionada** a los cambios de token de §2.5, y tratar la implementación de producción como código nuevo con las puertas de §5 — no como una conversión mecánica del prototipo.

---

## 2. Contraste: cálculo real con la fórmula WCAG

### 2.1 Fórmula aplicada (fuente oficial)

Luminancia relativa (W3C, técnica **G17**, sección "Procedure"):

> "L = 0.2126 * R + 0.7152 * G + 0.0722 * B where R, G and B are defined as:
> if R sRGB <= 0.04045 then R = R sRGB /12.92 else R = ((R sRGB +0.055)/1.055) ^ 2.4 […]
> R sRGB = R 8bit /255"

— Fuente: <https://www.w3.org/WAI/WCAG22/Techniques/general/G17>

Ratio de contraste (mismo documento y SC 1.4.3):

> "(L1 + 0.05) / (L2 + 0.05), where L1 is the relative luminance of the lighter of the foreground or background colors, and L2 is the relative luminance of the darker of the foreground or background colors."

— Fuente: <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html>

**Nota sobre el umbral 0.03928 vs 0.04045 (importante para reproducir el cálculo):**
El glosario histórico de WCAG usa `0.03928`. El wiki oficial del W3C WAI publica una **errata**:

> "ERRATA: the correct threshold for the piecewise equation is 0.04045 and not the 0.03928 that is listed below" … "for 8 bit color values the difference is not significant."

— Fuente: <https://www.w3.org/WAI/GL/wiki/Relative_luminance>

He usado **0.04045**, que es el valor que aparece en la técnica G17 vigente. Para color de 8 bits ambos umbrales producen resultados idénticos (el punto de corte cae entre los enteros 10/255 = 0.0392 y 11/255 = 0.0431), por lo que **ninguna conclusión de este informe depende de esa elección**.

### 2.2 Umbrales aplicados

| Caso | Umbral | Fuente |
|---|---|---|
| Texto normal | 4.5:1 | SC 1.4.3 (AA) |
| Texto grande | 3:1 | SC 1.4.3 (AA) |
| Componentes UI y estados | 3:1 | SC 1.4.11 (AA) |

Definición de "texto grande" — **matiz relevante**: la petición de trabajo menciona "≥18.66px bold". El texto oficial dice:

> "with at least 18 point or 14 point bold" … "18pt and 14pt are equivalent to approximately **24px and 18.5px**" (ratio "1pt = 1.333px")

— Fuente: <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html>

El 18.66px sale de 14 × 1.3333 = 18.667; el documento oficial redondea a ~18.5px. **La diferencia no afecta a ningún veredicto de este informe**: no hay texto en el rango 18.5–18.67px.

### 2.3 La paleta ROSA (`:root` real)

Declarada **inline** en el `<div>` contenedor, no en un `:root` real — `Opcion-1-Rosa.dc.html:28`:

| Token | Valor | Luminancia relativa L |
|---|---|---|
| `--bg` | `#FDF4F7` | 0.922994 |
| `--surface` | `#FFFFFF` | 1.000000 |
| `--surface2` | `#FBE7EF` | 0.838931 |
| `--ink` | `#B0466A` | 0.146510 |
| `--text` | `#5E404A` | 0.065409 |
| `--muted` | `#9C7F89` | 0.240528 |
| `--accent` | `#C05576` | 0.190115 |
| `--accent-dark` | `#A23E5F` | 0.119529 |
| `--accent-2` | `#E38AAE` | 0.375638 |
| `--accent-soft` | `#F7DDE8` | 0.773133 |
| `--on-accent` | `#FFFFFF` | 1.000000 |
| `--line` | `rgba(176,70,106,.16)` | (ver nota) |
| `--brush` | `#C05576` | 0.190115 |

**Nota sobre `--line`:** es semitransparente, así que su ratio depende del fondo. Compositado (`αC_fg + (1−α)C_bg`):
- sobre `--bg` → `#F1D8E0` (L=0.731943)
- sobre `--surface` → `#F2E1E7` (L=0.784972)
- sobre `--surface2` → `#EFCDDA` (L=0.670753)

### 2.4 Cálculo mostrado (casos load-bearing)

```
--muted / --bg      L(#9C7F89)=0.240528  L(#FDF4F7)=0.922994
                    -> (0.922994+0.05)/(0.240528+0.05) = 3.349:1   FALLA (necesita 4.5)

--accent / --bg     L(#C05576)=0.190115  L(#FDF4F7)=0.922994
                    -> (0.922994+0.05)/(0.190115+0.05) = 4.052:1   FALLA (necesita 4.5)

#FFF / --accent     L(#FFFFFF)=1.000000  L(#C05576)=0.190115
                    -> (1.000000+0.05)/(0.190115+0.05) = 4.373:1   FALLA (necesita 4.5)
                    ^^^ este es el boton "Reservar", la CTA principal

--ink / --bg        L(#B0466A)=0.146510  L(#FDF4F7)=0.922994
                    -> (0.922994+0.05)/(0.146510+0.05) = 4.951:1   pasa

--text / --bg       L(#5E404A)=0.065409  L(#FDF4F7)=0.922994
                    -> (0.922994+0.05)/(0.065409+0.05) = 8.431:1   pasa

--accent-dark / --bg L(#A23E5F)=0.119529 L(#FDF4F7)=0.922994
                    -> (0.922994+0.05)/(0.119529+0.05) = 5.739:1   pasa

--line / --surface  L(#F2E1E7)=0.784972  L(#FFFFFF)=1.000000
                    -> (1.000000+0.05)/(0.784972+0.05) = 1.258:1   FALLA (necesita 3.0)
```

### 2.5 Tabla completa: 32 fallos de 68 combinaciones

Umbral aplicado según tamaño/peso real declarado en el estilo inline.

| # | Línea | Combinación | fg | bg | Ratio | Umbral | Veredicto |
|---|---|---|---|---|---|---|---|
| 1 | L34 | nav link `--muted` / `--bg` (14px) | `#9C7F89` | `#FDF4F7` | **3.35** | 4.5 | ❌ |
| 2 | L36 | **botón "Reservar"** `--on-accent` / `--accent` (14px 600) | `#FFFFFF` | `#C05576` | **4.37** | 4.5 | ❌ |
| 3 | L41 | eyebrow `--accent` / `--bg` (12px) | `#C05576` | `#FDF4F7` | **4.05** | 4.5 | ❌ |
| 4 | L41 | eyebrow `--accent` / `--accent-soft` (gradiente hero) | `#C05576` | `#F7DDE8` | **3.43** | 4.5 | ❌ |
| 5 | L55 | "↺ Repetir" `--muted` / `--bg` | `#9C7F89` | `#FDF4F7` | **3.35** | 4.5 | ❌ |
| 6 | L57 | "desliza" `--muted` / `--bg` (11px) | `#9C7F89` | `#FDF4F7` | **3.35** | 4.5 | ❌ |
| 7 | L71 | separador `--line` / `--surface` | `#F2E1E7` | `#FFFFFF` | **1.26** | 3.0 | ⚠️ (ver nota A) |
| 8 | L73 | **precio** `--accent` / `--surface` (15.5px 700) | `#C05576` | `#FFFFFF` | **4.37** | 4.5 | ❌ |
| 9 | L89 | eyebrow `--accent` / `--surface2` (12px) | `#C05576` | `#FBE7EF` | **3.70** | 4.5 | ❌ |
| 10 | L104 | hex del color `--accent` / `--surface2` (15px) | `#C05576` | `#FBE7EF` | **3.70** | 4.5 | ❌ |
| 11 | L108 | borde swatch `--line` / `--surface` (UI) | `#F2E1E7` | `#FFFFFF` | **1.26** | 3.0 | ❌ |
| 12 | L132 | desc `--muted` / `--surface` (14.5px) | `#9C7F89` | `#FFFFFF` | **3.61** | 4.5 | ❌ |
| 13 | L148 | badge oferta `#fff` / `--accent-2` (12px 700) | `#FFFFFF` | `#E38AAE` | **2.47** | 4.5 | ❌ |
| 14 | L153 | precio antiguo `--muted` / `--surface` (16px) | `#9C7F89` | `#FFFFFF` | **3.61** | 4.5 | ❌ |
| 15 | L179 | rol `--muted` / `--surface` (13px) | `#9C7F89` | `#FFFFFF` | **3.61** | 4.5 | ❌ |
| 16 | L190 | "Reserva tu cita" `--muted` / `--surface` (12px 700) | `#9C7F89` | `#FFFFFF` | **3.61** | 4.5 | ❌ |
| 17 | L194 | día activo `--on-accent` / `--accent` (16px 700) | `#FFFFFF` | `#C05576` | **4.37** | 4.5 | ❌ |
| 18 | L197 | día idle `dow` `--muted` / `--bg` (10px) | `#9C7F89` | `#FDF4F7` | **3.35** | 4.5 | ❌ |
| 19 | L197 | borde día idle `--line` / `--surface` (UI) | `#F2E1E7` | `#FFFFFF` | **1.26** | 3.0 | ❌ |
| 20 | L217 | placeholder reserva `--muted` / `--bg` (14px) | `#9C7F89` | `#FDF4F7` | **3.35** | 4.5 | ❌ |
| 21 | L226 | "Cambiar" `--accent` / `--surface` (13px 600) | `#C05576` | `#FFFFFF` | **4.37** | 4.5 | ❌ |
| 22 | L231 | **estrellas** `--accent-2` / `--surface` (14px) | `#E38AAE` | `#FFFFFF` | **2.47** | 4.5 | ❌ |
| 23 | L234 | autor reseña `--muted` / `--surface` (13px 600) | `#9C7F89` | `#FFFFFF` | **3.61** | 4.5 | ❌ |
| 24 | L236 | flecha reseña `--accent` / `--bg` (13px) | `#C05576` | `#FDF4F7` | **4.05** | 4.5 | ❌ |
| 25 | L262 | "en línea" `#2f9d5f` / `--accent-soft` (12px) | `#2F9D5F` | `#F7DDE8` | **2.69** | 4.5 | ❌ |
| 26 | L280 | borde input chat `--line` / `--surface` (UI) | `#F2E1E7` | `#FFFFFF` | **1.26** | 3.0 | ❌ |
| 27 | L301 | horario `--muted` / `--bg` (15.5px) | `#9C7F89` | `#FDF4F7` | **3.35** | 4.5 | ❌ |
| 28 | L306 | label "Dirección" `--muted` / `--bg` (11px) | `#9C7F89` | `#FDF4F7` | **3.35** | 4.5 | ❌ |
| 29 | L344 | pie párrafo `rgba(255,255,255,.7)` / `--ink` | `#E7C8D2` | `#B0466A` | **3.46** | 4.5 | ❌ |
| 30 | L348 | pie label `rgba(255,255,255,.55)` / `--ink` | `#DBACBC` | `#B0466A` | **2.71** | 4.5 | ❌ |
| 31 | L350 | pie enlace `rgba(255,255,255,.82)` / `--ink` | `#F1DEE4` | `#B0466A` | **4.15** | 4.5 | ❌ |
| 32 | L366 | pie copyright `rgba(255,255,255,.55)` / `--ink` | `#DBACBC` | `#B0466A` | **2.71** | 4.5 | ❌ |

> **Nota A (honestidad técnica, #7):** el separador de `--line` entre ítems de lista (L71) es **decorativo**: no es un componente de interfaz ni un objeto gráfico necesario para entender el contenido, así que **SC 1.4.11 no le aplica formalmente**. Lo listo como riesgo de diseño (a 1.26:1 es prácticamente invisible), no como incumplimiento. Sí son incumplimiento real los `--line` que delimitan controles: **#11 (swatch), #19 (botón día), #26 (input)**.

**Combinaciones que SÍ pasan** (36 de 68), destacando las no obvias:

| Línea | Combinación | Ratio | Umbral | Veredicto |
|---|---|---|---|---|
| L51 | hero párrafo `--text`/`--bg` | 8.43 | 4.5 | ✅ |
| L65 | H2 `--ink`/`--bg` (clamp min 30px → grande) | 4.95 | 3.0 | ✅ |
| L327 | FAQ pregunta `--ink`/`--surface2` (19px normal) | 4.52 | 4.5 | ✅ (por 0.02) |
| L54 | "Ver servicios" `--accent-dark`/`--bg` | 5.74 | 4.5 | ✅ |
| L130 | tag `--accent-dark`/`--accent-soft` | 4.86 | 4.5 | ✅ |
| L255 | WhatsApp `#08130c`/`#25D366` | 9.55 | 4.5 | ✅ |
| L267 | burbuja usuario `#1c3b28`/`#DCF6E3` | 10.75 | 4.5 | ✅ |
| L340 | pie `#fff`/`--ink` (sólido) | 5.34 | 4.5 | ✅ |

### 2.6 Dos fallos que solo aparecen en condiciones concretas

Estos **no se detectan con un chequeo ingenuo de la paleta** y son fáciles de pasar por alto:

**(a) `clamp()` cambia el umbral aplicable según el viewport — L49.**

```
L49: font-size:clamp(14px,2.2vw,24px); font-weight:600; color:var(--ink)
     sobre --accent-soft (gradiente del hero)
     ratio = 4.19:1  (constante)
     - a 24px (desktop) -> texto grande -> umbral 3.0 -> PASA
     - a 14px (movil)   -> texto normal -> umbral 4.5 -> FALLA
```

La palabra "Studio" del logotipo del hero **cumple en escritorio e incumple en móvil**, con el mismo color. Cualquier verificación hecha solo a 1440px lo da por bueno. *(Excepción posible: si se considera "logotipo", SC 1.4.3 lo exime — ver §4.)*

**(b) La cabecera translúcida cambia de contraste al hacer scroll — L30.**

`background:color-mix(in srgb, var(--bg) 82%, transparent)` significa que el fondo real de la cabecera es **82% `--bg` + 18% de lo que pase por debajo**:

| Contenido que scrollea debajo | Fondo efectivo | `--muted` (nav) | `--ink` (logo) |
|---|---|---|---|
| `--surface` `#FFFFFF` (tarjetas) | `#FDF6F8` | 3.39 ❌ | 5.02 ✅ |
| `--surface2` `#FBE7EF` | `#FDF2F6` | 3.31 ❌ | 4.89 ✅ |
| `--accent-soft` `#F7DDE8` | `#FCF0F4` | 3.25 ❌ | 4.81 ✅ |
| `--ink` `#B0466A` (pie) | `#EFD5DE` | 2.62 ❌ | **3.88 ❌** |
| `--accent` `#C05576` (botones) | `#F2D7E0` | 2.68 ❌ | **3.96 ❌** |
| foto oscura (peor caso) `#303030` | `#D8D1D3` | 2.41 ❌ | **3.56 ❌** |

El logo `--ink` pasa sobre fondo estático pero **falla cuando el pie o un botón pasan por debajo**. `backdrop-filter:blur(14px)` no lo salva: el desenfoque promedia el color, no lo aclara. **Es un fallo dependiente del scroll**, invisible en una captura estática.

### 2.7 Paleta corregida propuesta (verificada, no estimada)

**Estrategia: separar "color de marca para rellenos" de "color de texto".** El rosa `#C05576` se conserva como color de marca en rellenos grandes y decorativos; para texto y bordes se usa `--accent-dark #A23E5F`, **que ya existe en la paleta**.

| Token | Antes | Después | Justificación (ratio mínimo en los 4 fondos del sitio) |
|---|---|---|---|
| `--muted` | `#9C7F89` | **`#6F525A`** | 6.42:1 sobre `--bg`, 6.93:1 sobre `--surface` (antes 3.35 / 3.61) |
| `--accent` **como texto** | `#C05576` | **`#A23E5F`** (usar `--accent-dark`) | mín. **4.86:1** (sobre `--accent-soft`); 5.74 / 6.19 / 5.24 en el resto |
| `--accent` **como relleno con texto blanco** | `#C05576` | **`#A23E5F`** | blanco sobre `#A23E5F` = **6.19:1** (antes 4.37) |
| `--accent-2` **con texto blanco / como icono** | `#E38AAE` | **`#B3316E`** | blanco sobre él 5.86:1; como icono sobre `--surface` 5.86:1 (antes 2.47) |
| `--line` (decorativo) | `rgba(176,70,106,.16)` | *(se conserva)* | no le aplica 1.4.11 |
| **`--border-interactive`** (token **nuevo**) | — | **`#AB5F79`** | 4.19 / 4.52 / 3.83 / **3.54** (peor caso `--accent-soft`) ≥ 3:1 |
| `--ink` **como fondo del pie** | `#B0466A` | **`#8E3355`** | permite `rgba(255,255,255,.70)` = 4.60:1 y `.82` = 5.68:1 |
| "en línea" (chat) | `#2f9d5f` | **`#186237`** | 5.79:1 sobre `--accent-soft` (antes 2.69) |

**Verificación completa de la paleta corregida** (ejecutada, `contrast2.py` / `contrast3.py`):

```
--muted #6F525A / --bg           = 6.42:1  OK      --ink #8E3355 / --bg          = 7.06:1  OK
--muted #6F525A / --surface      = 6.93:1  OK      --ink #8E3355 / --surface2    = 6.45:1  OK
--accent-dark #A23E5F / --bg     = 5.74:1  OK      --ink #8E3355 / --accent-soft = 5.98:1  OK
--accent-dark #A23E5F / --surface = 6.19:1 OK      --text #5E404A / --bg         = 8.43:1  OK
--accent-dark #A23E5F / --surface2 = 5.24:1 OK     --text #5E404A / --surface2   = 7.70:1  OK
--accent-dark #A23E5F / --accent-soft = 4.86:1 OK  #FFF / --accent-dark          = 6.19:1  OK
#FFF / --accent-2 #B3316E        = 5.86:1  OK      --border-interactive #AB5F79 / --accent-soft = 3.54:1 OK
```

**Límite matemático del pie con `--ink #B0466A`** (por si se quiere conservar ese fondo): el máximo alcanzable con blanco **sólido** es 5.34:1, y `rgba(255,255,255,.82)` ya cae a 4.15:1. Es decir, **con `#B0466A` de fondo no existe ninguna opacidad de blanco < 1.0 que cumpla 4.5:1**. O se usa blanco sólido para todo el texto del pie, o se oscurece el fondo. Recomiendo oscurecer a `#8E3355`.

**Umbral de luminancia para bordes interactivos** (por si diseño quiere otro tono): el fondo más exigente es `--accent-soft #F7DDE8` (L=0.7731) → el borde necesita **L ≤ 0.2244**. `#C9899F` (L=0.328) y `#C07E96` (L=0.283) **no valen**; el más claro que cumple es `#B26982` (L=0.212, 3.14:1). Recomiendo `#AB5F79` por margen de seguridad.

---

## 3. Auditoría no-cromática

### 3.1 Conteos verificados (ejecutados sobre el fichero)

| Comprobación | Resultado | Implicación |
|---|---|---|
| `grep -c 'prefers-reduced-motion'` | **0** | §3.6 |
| `grep -n '<html'` | **`2:<html>`** (sin `lang`) | SC 3.1.1 (A) ❌ |
| `grep -c '<title>'` | **0** | SC 2.4.2 (A) ❌ |
| `grep -c '<h1'` | **0** | SC 1.3.1 (A) ❌ |
| `grep -c '<main'` | **0** | landmarks ❌ |
| `grep -c 'aria-'` | **0** | §3.5 |
| `grep -c 'role='` | **1** — y es `m.role==='bot'` en JS (L449), **no** un atributo | 0 roles ARIA reales |
| `grep -c '<label'` | **0** | SC 3.3.2 (A) ❌ |
| `grep -c '<form'` | **0** | §3.5 |
| `grep -c 'style-hover'` | **18** | §3.7 |
| `grep -c 'style-focus'` | **0** | **18 estados hover, 0 estados foco** |

### 3.2 Semántica y encabezados

**Problema 1 — No existe `<h1>`. El título del hero es un `<span>`.**
`Opcion-1-Rosa.dc.html:44`
```html
<span data-anim="paintReveal ..." style="...font-size:clamp(50px,11.5vw,142px)...">Nails Lash</span>
```
El texto más grande de la página (hasta 142px) es un `<span>`. La jerarquía de encabezados **empieza en `<h2>`** (L65). Presentación visual de encabezado sin marcado de encabezado → **SC 1.3.1 Info and Relationships (Nivel A)**.
**Arreglo:** `<h1>` que contenga "Nails Lash Studio" (uniendo L44 y L49, que hoy están partidos en dos elementos: el `<span>` y el `<div>` "Studio"). Si se parte visualmente, usar un solo `<h1>` con `<span>` internos.

**Problema 2 — Encabezados presentes:** h2 en L65, L90, L125, L143, L166, L252, L296, L323; h3 en L131, L149, L178. Sin `<h1>`, el orden es `h2 → h3`, correcto entre sí, pero **el documento arranca en nivel 2**.

**Problema 3 — No hay `<main>`.** `Opcion-1-Rosa.dc.html:28` — todo el contenido cuelga de un `<div>` con estilos inline.
**Arreglo:** envolver las `<section>` de contenido en `<main>`.

### 3.3 Landmarks

| Landmark | Estado | Referencia |
|---|---|---|
| `banner` | ⚠️ implícito vía `<header>` | L30 |
| `navigation` | ✅ `<nav>` | L32 |
| `main` | ❌ **ausente** | — |
| `contentinfo` | ⚠️ implícito vía `<footer>` | L340 |
| `region` | ❌ ninguna `<section>` tiene nombre accesible | L40, L61, L86, L121, L139, L162, L248, L292, L320 |

Las 9 `<section>` **no son landmarks**: una `<section>` solo expone `role="region"` si tiene nombre accesible (`aria-labelledby`). Hoy ninguna lo tiene, así que un usuario de lector de pantalla no puede saltar entre secciones.
**Arreglo:** `<section id="unas" aria-labelledby="unas-h">` + `<h2 id="unas-h">`.

> **Inferencia (no verificado con la spec):** doy `banner`/`contentinfo` por implícitos porque `<header>`/`<footer>` están dentro de un `<div>` (no de `<article>`/`<aside>`/`<main>`/`<nav>`/`<section>`), y el anidamiento en `<div>` no debería anular el mapeo. **No he verificado esto contra "ARIA in HTML"** — ver §4.

### 3.4 `div` clicable vs `button` — ✅ **el prototipo acierta**

**Verificado:** los **14** elementos con `onClick` son **todos `<button>`**: L55, L108, L194, L197, L205, L208, L214, L226, L236, L237, L274, L281, L285, L327. **No hay ni un `div` clicable, ni un `<a href="#">` usado como botón.** Los `<a href="#seccion">` (L31, L34, L36, L53, L54, L76, L115, L155, L285, L350-353) son navegación real por anclas — uso correcto de enlace.

**Único matiz** — `Opcion-1-Rosa.dc.html:217`:
```html
<div style="...background:var(--bg);color:var(--muted);border:1px dashed var(--line)...">{{ m.bookLabel }}</div>
```
Es el estado "deshabilitado" del botón de reserva ("Elige día y hora"), renderizado como `<div>` en lugar de `<button disabled>`. No es clicable, así que no es el antipatrón clásico, pero **el estado no se expone**: quien usa lector de pantalla no percibe que existe un botón bloqueado ni por qué.
**Arreglo:** `<button disabled aria-describedby="...">` o, mejor, botón habilitado que al pulsarlo explique qué falta (los `disabled` no reciben foco y son un callejón sin salida).

### 3.5 Formulario: el input del chat

`Opcion-1-Rosa.dc.html:280`
```html
<input value="{{ chatDraft }}" onChange="{{ onDraft }}" onKeyDown="{{ onKey }}"
       placeholder="{{ inputPlaceholder }}"
       style="...color:var(--text);font-family:'Manrope',sans-serif;font-size:14px;outline:none"/>
```

Cuatro problemas en una línea:

1. **Sin `<label>` ni `aria-label`.** El único texto es `placeholder` (valor real: `"Escribe tu nombre…"`, `salon-data.js:116`). El placeholder **desaparece al escribir** y no es sustituto de etiqueta → **SC 3.3.2 Labels or Instructions (A)** y **SC 4.1.2 Name, Role, Value (A)** (el control no tiene *name* accesible).
2. **`outline:none` sin reemplazo** → **SC 2.4.7 Focus Visible (AA)** ❌. Es el fallo de foco más claro del prototipo.
3. **Sin `type`** → por defecto `type="text"`; para el nombre debería ser `type="text"` + `autocomplete="name"`.
4. **Sin `<form>`** (0 en todo el fichero) → sin envío nativo; el `Enter` se maneja a mano en `chatKey()` (L409).

**Arreglo:**
```html
<form onSubmit="...">
  <label for="chat-nombre" class="sr-only">Tu nombre</label>
  <input id="chat-nombre" type="text" name="nombre" autocomplete="name"
         placeholder="Escribe tu nombre…" />
  <button type="submit"><span class="sr-only">Enviar mensaje</span><span aria-hidden="true">→</span></button>
</form>
```
y **eliminar `outline:none`**, sustituyéndolo por el `:focus-visible` de §3.7.

### 3.6 Movimiento y `prefers-reduced-motion`

**`prefers-reduced-motion` aparece 0 veces.** Fuentes de movimiento:

| Línea | Animación | Duración | Problema |
|---|---|---|---|
| L16 | `html{scroll-behavior:smooth}` | — | scroll animado no desactivable |
| L44 | `paintReveal 4.8s ... .5s both` | 4.8s + 0.5s retardo | automática al cargar |
| L45 | `brushSweep 4.8s ... .5s both` | 4.8s + 0.5s retardo | automática al cargar |
| L49 | `fadeUp .9s 4.4s both` | termina en 5.3s | automática |
| **L57** | **`bob 2.4s ease-in-out infinite`** | **infinita** | **ver abajo** |
| L385-388 | `IntersectionObserver` → `replayBrush()` | repite | se re-dispara al volver a ver el hero |

**Fallo de Nivel A — `Opcion-1-Rosa.dc.html:57`:**
```html
<div style="...animation:bob 2.4s ease-in-out infinite">desliza</div>
```
SC 2.2.2 Pause, Stop, Hide (**Nivel A**) exige mecanismo de pausa/parada/ocultación para contenido que **(1) arranca automáticamente, (2) dura más de cinco segundos y (3) se presenta en paralelo con otro contenido**:

> "For any moving, blinking or scrolling information that (1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or hide it unless the movement, blinking, or scrolling is part of an activity where it is essential"

— Fuente: <https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html>

El indicador "desliza" cumple las tres condiciones (infinito > 5s) y **no tiene mecanismo de parada** → **incumple Nivel A**. Es el fallo más grave en severidad normativa de todo el prototipo.

**Secuencia del hero (inferencia, borderline):** `paintReveal` 4.8s + 0.5s de retardo termina en 5.3s, y `fadeUp` (L49) también termina en 5.3s. Tomada como un bloque, la animación de entrada **supera los 5 segundos**, lo que la metería también en SC 2.2.2. Cada animación por separado dura 4.8s (< 5s) y no lo incumpliría. **Es interpretable**; el `<button>` "↺ Repetir" (L55) es un control de *repetición*, no de *parada*, así que no satisface el criterio.

**`prefers-reduced-motion`:** SC 2.3.3 Animation from Interactions es **Nivel AAA** (fuera de nuestro objetivo AA), y aplica a animación **disparada por interacción**, no por carga de página:

> "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed." — Nivel AAA
> Técnicas suficientes: "C39: Using the CSS prefers-reduced-motion query to prevent motion"

— Fuente: <https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html>

**Conclusión honesta:** implementar `prefers-reduced-motion` **no es obligatorio para AA**, pero (a) es la técnica oficial C39, (b) resuelve el `scroll-behavior:smooth` y el replay por `IntersectionObserver`, y (c) es coste casi nulo. **Lo recomiendo como obligatorio de proyecto**, no como requisito legal.

**Arreglo:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Y **aparte**, para cumplir SC 2.2.2 en AA: eliminar `infinite` de L57, o limitarlo (`animation-iteration-count: 2`), o añadir un control real de parada.

### 3.7 Foco visible y orden de tabulación

**Orden de tabulación: ✅ correcto.** El orden del DOM (cabecera → hero → categorías → colores → destacados → ofertas → equipo → reserva → contacto → FAQ → pie) coincide con el orden visual. **No hay `tabindex` positivos** ni reordenaciones CSS que rompan la secuencia. Los `grid`/`flex` no alteran el orden fuente.

**Foco visible: ❌ dos problemas.**

1. **`outline:none` en L280** sin reemplazo → SC 2.4.7 (AA) ❌.
2. **18 `style-hover`, 0 `style-focus`.** Todos los estados interactivos (L34, L36, L53, L54, L55, L76, L115, L155, L197, L208, L214, L236, L237, L256, L274, L285, L311) se comunican **solo al ratón**. Los demás controles heredan el anillo por defecto del navegador — que técnicamente existe, pero no está diseñado y sobre rellenos rosa puede quedar pobre.

**Arreglo verificado** — el anillo de foco también debe cumplir 3:1 (SC 1.4.11). **Un solo color no basta**: `#A8134B` da 6.80:1 sobre `--bg` pero **1.00:1 sobre el propio botón `--accent`**. Con `outline-offset` el anillo se separa del control y su color adyacente pasa a ser el fondo de página, lo que sí funciona:

```css
:focus-visible {
  outline: 3px solid #A23E5F;   /* 5.74:1 sobre --bg, 6.19:1 sobre --surface */
  outline-offset: 2px;
  border-radius: inherit;
}
footer :focus-visible { outline-color: #FFFFFF; }  /* 5.34:1 sobre --ink #B0466A */
```
(La regla del `footer` es necesaria porque un anillo oscuro sobre el pie oscuro fallaría.)

**Riesgo SC 2.4.11 Focus Not Obscured (AA, nuevo en WCAG 2.2)** — `Opcion-1-Rosa.dc.html:30`:
```html
<header style="position:sticky;top:0;z-index:50;...padding:15px 40px;...">
```
El criterio dice:

> "When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content."
> "Typical types of content that can overlap focused items are sticky footers, sticky headers, and non-modal dialogs."

— Fuente: <https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html>

Las secciones tienen `scroll-margin-top:66px`/`70px` (L40, L61, L86…), pero **`scroll-margin` solo actúa en la navegación por anclas, no cuando el navegador desplaza por foco de teclado**. Para eso hace falta `scroll-padding-top` en el contenedor de scroll, **que no existe en el fichero**. Un elemento enfocado con Tab justo bajo la cabecera pegajosa (~70px) puede quedar tapado.
**Arreglo:** `html { scroll-padding-top: 80px; }`.
**Estado: inferido — requiere prueba real con teclado** (§4). El criterio exige "entirely hidden", así que un tapado parcial pasaría AA.

### 3.8 Textos alternativos

**✅ Correcto** — `Opcion-1-Rosa.dc.html:46`: `<img src="./brush.png" alt="">`. Es decorativa (el pincel de la animación) y `alt=""` es exactamente lo debido.

**❌ Problema serio — el componente de imagen no tiene API de `alt`.**

Todas las imágenes **de contenido** se pintan con `<image-slot>`: fotos de servicios (L79), fotos del equipo (L173), mapa (L315). Verificado en el componente:

- `image-slot.js:463` → `'  <img part="image" alt="" draggable="false" style="display:none">'` — **`alt=""` está hardcodeado**.
- `image-slot.js:399-401` → `observedAttributes` = `['shape','radius','mask','fit','placeholder','src','id','credit','credit-href']` — **no incluye `alt`**.

O sea: **no hay forma de dar texto alternativo a ninguna imagen de contenido**. El atributo `placeholder="Foto de {{ m.name }}"` (L173) es solo el rótulo del estado vacío del editor (`image-slot.js:971`: `this._cap.textContent = this.getAttribute('placeholder')`), **no un `alt`**.

Resultado: las 7 fotos del equipo, las 3 de servicios y el mapa quedarían expuestas como imágenes sin nombre → **SC 1.1.1 Non-text Content (Nivel A)**.

**Matiz de alcance:** `<image-slot>` es utillaje del prototipo, no código de producción. **El fallo tal cual no llega a la web publicada**; lo que sí llega es el riesgo de que nadie decida los `alt`, porque el prototipo **no tiene dónde escribirlos**.
**Arreglo:** definir los `alt` en `salon-data.js` **ahora** (junto a `photo`/`img`), para que existan como contenido antes de implementar. El mapa (L315) además necesita alternativa textual real: la dirección en texto ya está en L306, así que el mapa puede ser decorativo **si** se marca como tal.

### 3.9 Nombres accesibles y estados (0 `aria-*`)

| Línea | Elemento | Problema | Arreglo |
|---|---|---|---|
| L327 | `<button onClick="{{ f.toggle }}">` FAQ | Acordeón **sin `aria-expanded`** ni `aria-controls`. No se anuncia si está abierto | `aria-expanded="{{ f.open }}"` + `aria-controls` + `id` en el `<p>` de L332 |
| L329 | `<span>{{ f.sign }}</span>` (`+` / `–`) | Se lee como texto ("signo más"); redundante con `aria-expanded` | `aria-hidden="true"` |
| L236 | `<button>←</button>` | Nombre accesible = "←" | `aria-label="Reseña anterior de {{ m.name }}"` |
| L237 | `<button>→</button>` | Nombre accesible = "→" | `aria-label="Reseña siguiente de {{ m.name }}"` |
| L281 | `<button>→</button>` enviar | Nombre accesible = "→" | `aria-label="Enviar mensaje"` |
| L231 | `{{ m.review.stars }}` = `'★★★★★'` (L440) | Se lee "estrella negra ×5" | `<span aria-hidden="true">★★★★★</span><span class="sr-only">5 de 5 estrellas</span>` |
| L108 | `<button title="{{ c.name }}">` swatch | Nombre vía `title`: no aparece en táctil ni con teclado. Estado activo **solo por color** (anillo L110) → **SC 1.4.1 Use of Color (A)** | `aria-label="{{ c.name }}"` + `aria-pressed="{{ c.active }}"`; considerar `radiogroup` |
| L194/L197 | botones de día | Día seleccionado **solo por color** de fondo → SC 1.4.1 | `aria-pressed` (o `radiogroup`) + marca no cromática (✓/subrayado) |
| L205/L208 | botones de hora | Ídem | Ídem |
| L55 | `<button>↺ Repetir</button>` | Nombre = "↺ Repetir" (el glifo se lee) | `<span aria-hidden="true">↺</span> Repetir` |
| L261 | `<div>nl</div>` avatar | Decorativo, se lee "nl" | `aria-hidden="true"` |
| L153 | `text-decoration:line-through` precio antiguo | Tachado **solo visual**: el lector lee "35 €" sin marcar que ya no aplica → SC 1.3.1 | `<s>` / `<del>` + `<span class="sr-only">antes</span>` |

### 3.10 Contenido dinámico sin anuncio — SC 4.1.3 Status Messages (AA)

Dos flujos cambian el DOM **sin mover el foco y sin región activa**:

1. **Chat** (L264-269): `chatPick()`/`chatSend()` (L407-408) añaden mensajes del bot. Sin `aria-live`, **un lector de pantalla no anuncia la respuesta**. El chat es una vía de reserva declarada del negocio.
   **Arreglo:** `<div role="log" aria-live="polite" aria-atomic="false">` en el contenedor de L264.
2. **Confirmación de reserva** (L221-228): al pulsar "Reservar" (L214) el bloque se sustituye por el mensaje de confirmación. Sin `aria-live` ni gestión de foco → el usuario no sabe si funcionó.
   **Arreglo:** `role="status"` en el contenedor de L222, o mover el foco al mensaje.

Además, `componentDidUpdate()` (L391) fuerza `scrollTop = scrollHeight` en el chat en **cada** actualización, lo que puede robar la posición de lectura.

### 3.11 Tamaño de destino — ✅ cumple

SC 2.5.8 Target Size (Minimum), **AA, nuevo en WCAG 2.2**:

> "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when: [Spacing, Equivalent, Inline, User Agent Control, Essential]"

— Fuente: <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>

| Control | Tamaño | Veredicto |
|---|---|---|
| Swatches de color (L108) | ~60×60px (`repeat(6,1fr)` en 440px con gap 16px) | ✅ |
| Flechas de reseña (L236/237) | 30×30px | ✅ (el más pequeño) |
| Botones de día (L194/197) | `min-width:44px`, alto ~40px | ✅ |
| Botón enviar chat (L281) | 44×44px | ✅ |
| Chips de hora (L205/208) | ~34px de alto | ✅ |

### 3.12 Otros

- **`overflow-x:hidden`** (L28) + **`white-space:nowrap`** en el hero a `11.5vw` (L44): a 320px el título mide ~37px de alto pero el `nowrap` puede desbordar y quedar **cortado en silencio** por el `overflow-x:hidden`. Riesgo **SC 1.4.10 Reflow (AA)**. *Inferido — requiere prueba a 320px.*
- **`::selection`** (L20): `background:var(--accent); color:#fff` → 4.37:1. No hay SC que lo exija explícitamente, pero es coherente arreglarlo con el cambio de `--accent`.
- **Tipografías por CDN** (L11-13, Google Fonts): implicación de **RGPD/transferencias**, fuera del alcance de esta auditoría (§4).
- **Idioma:** todo el contenido es español (`salon-data.js`) y `<html>` no declara `lang` → un lector de pantalla lo leería con fonética inglesa por defecto. **SC 3.1.1 (A)**. Verificado que `support.js` **no** fija `lang` ni `document.title` en ningún punto.

---

## 4. Lo que NO he podido verificar

| # | Afirmación / duda | Por qué no está verificado | Qué haría falta |
|---|---|---|---|
| 1 | El renderizado real coincide con lo calculado | He auditado el **código fuente**, no la página pintada. `support.js` interpreta `<sc-for>`/`<sc-if>`/`style-hover` y podría alterar estilos | Abrir el prototipo en navegador y pasar axe DevTools / Lighthouse; comprobar con cuentagotas |
| 2 | SC 2.4.11 (cabecera pegajosa tapa el foco) | Requiere tabular con la página renderizada | Prueba manual con Tab a varios anchos |
| 3 | SC 1.4.10 Reflow a 320px (`nowrap` + `overflow-x:hidden`) | Requiere renderizado | Probar a 320px y con zoom 400% |
| 4 | `<header>`/`<footer>` dentro de `<div>` exponen `banner`/`contentinfo` | No he consultado la spec "ARIA in HTML" | Verificar en <https://www.w3.org/TR/html-aria/> |
| 5 | Si "Nails Lash Studio" (L44/L49) es **logotipo** a efectos de SC 1.4.3 | SC 1.4.3 exime logotipos; es una decisión de negocio, no técnica | Decidir con el salón si es logotipo o titular. Si es logotipo, el fallo (b) de §2.6 decae |
| 6 | El contraste con **fotos reales** de fondo | Las imágenes son *placeholders* (`ph-woman0-6.png`, `ph-unas.png`…) generados | Recalcular cuando existan las fotos reales del salón |
| 7 | Si la web está sujeta al **European Accessibility Act** / EN 301 549 / RD 1112/2018 | **NO VERIFICADO.** No he consultado fuentes legales; hay exenciones (p. ej. microempresas) que desconozco si aplican | Investigación legal específica (área de otro investigador). **No dar por hecho que WCAG AA es legalmente obligatorio aquí** |
| 8 | Google Fonts por CDN (L11-13) y RGPD | Fuera de alcance | Área legal/privacidad |
| 9 | Si los datos de `salon-data.js` son reales | Son claramente **ficticios**: teléfono `+34 600 123 456`, dirección "Calle de la Belleza 24, 28010 Madrid" (Madrid capital, **no Las Rozas**), reseñas inventadas | Datos reales del negocio antes de publicar |
| 10 | Comportamiento con lector de pantalla real | No ejecutado | Prueba con NVDA/VoiceOver |
| 11 | Que las opciones **Azul** y **Amarillo** tengan los mismos fallos | Solo he auditado la Rosa. Los ficheros son casi idénticos en tamaño (40634 / 40634 / 40639 bytes) → **muy probablemente misma estructura, distinta paleta** | Ejecutar `contrast.py` con sus `:root` |

> **Sobre #9:** el prototipo dice "Madrid" pero el encargo dice **Las Rozas de Madrid**. No es un hallazgo de accesibilidad, pero es un dato de negocio incorrecto que no debe llegar a producción.

---

## 5. Impacto en el proyecto

### 5.1 Qué EXIGE

**Sobre la paleta (bloqueante para aprobar la Opción Rosa):**
1. `--muted` → `#6F525A`.
2. Todo texto y borde que hoy use `--accent` → `--accent-dark #A23E5F`.
3. Rellenos de botón con texto blanco → `--accent-dark #A23E5F` (no `#C05576`).
4. `--accent-2` con texto blanco o como icono → `#B3316E`.
5. Nuevo token `--border-interactive: #AB5F79` para bordes de controles.
6. Fondo del pie → `#8E3355`, y opacidad mínima `.70` para su texto.
7. "en línea" del chat → `#186237`.

**Sobre la implementación de producción:**
8. `<html lang="es">` y `<title>` únicos.
9. Un `<h1>`; `<main>`; `<section aria-labelledby>`.
10. `<label>` real para el input del chat; eliminar `outline:none`.
11. `:focus-visible` explícito y verificado a 3:1 (con la excepción del pie).
12. `aria-expanded` en el acordeón FAQ; `aria-label` en botones de solo icono; `aria-pressed` en día/hora/color.
13. `aria-live` en chat y en confirmación de reserva.
14. `alt` para las 11 imágenes de contenido → **decidir los textos ya, en `salon-data.js`**.
15. Quitar `infinite` de L57 (**Nivel A**).
16. `html { scroll-padding-top: 80px; }`.

### 5.2 Qué PROHÍBE

- ❌ **Publicar la paleta rosa tal cual.** 32 de 68 combinaciones fallan AA.
- ❌ **Usar `#C05576` como color de texto pequeño o como relleno con texto blanco.** Es el color de marca y es el fallo más repetido; conviene fijarlo por escrito porque se reintroducirá solo.
- ❌ **Usar `--muted #9C7F89` o `--accent-2 #E38AAE` para texto.** En ningún tamaño ni fondo.
- ❌ **Usar `--line rgba(176,70,106,.16)` para delimitar controles** (1.26:1).
- ❌ **Comunicar estado solo por color** (día/hora/swatch seleccionados) — SC 1.4.1.
- ❌ **`outline:none` sin reemplazo verificado.**
- ❌ **Texto blanco con opacidad < 1.0 sobre `#B0466A`** — matemáticamente imposible llegar a 4.5:1.
- ❌ **Convertir el prototipo a producción "tal cual".** No es HTML: es `.dc.html` con `<x-dc>`/`<sc-for>`/`image-slot` y ~200 atributos `style` inline.

### 5.3 Qué FEATURES implica

| Feature | Descripción | Prioridad |
|---|---|---|
| `design-tokens-a11y` | Tokens CSS en `:root` real (no inline) con los valores corregidos. **Separar tokens de "relleno de marca" y de "texto"** — es la causa raíz de 21 de los 32 fallos | Alta |
| `contrast-gate` | Test automático que recalcula los ratios de todos los pares de tokens y **falla el build** si alguno baja del umbral. La lógica ya existe: `contrast.py` | Alta |
| `semantic-shell` | `lang`, `<title>`, `<h1>`, `<main>`, landmarks, `aria-labelledby` en secciones | Alta |
| `focus-system` | `:focus-visible` global + `scroll-padding-top` + override del pie | Alta |
| `booking-a11y` | Selector de día/hora accesible: `aria-pressed`, marca no cromática, `aria-live` en la confirmación | Alta |
| `chat-a11y` | `<form>`, `<label>`, `role="log"`, `aria-live`, nombre del botón enviar | Alta |
| `motion-prefs` | `prefers-reduced-motion` + quitar `infinite` de L57 | Media (el `infinite` es **Alta**: Nivel A) |
| `image-alt-content` | Campo `alt` por imagen en la fuente de datos | Media |
| `a11y-ci` | axe-core en CI + checklist manual de teclado | Media |

### 5.4 Nota de proceso

Según `CLAUDE.md`, las features con `"sdd": true` requieren conversación de spec → Gherkin → TDD → judge → mutación. **`contrast-gate` es un candidato ideal**: la regla es puramente matemática, determinista y ya tiene implementación de referencia verificada en `contrast.py`. Es la forma de garantizar que estos 32 fallos **no vuelvan** cuando alguien retoque un token dentro de seis meses.

---

## 6. Fuentes

**Oficiales (W3C):**
- WCAG 2.2 (Recomendación): <https://www.w3.org/TR/WCAG22/>
- SC 1.4.3 Contrast (Minimum) + "large scale" + fórmula ratio: <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html>
- Técnica G17 — **fórmula de luminancia relativa con umbral 0.04045**: <https://www.w3.org/WAI/WCAG22/Techniques/general/G17>
- Errata del umbral 0.03928 → 0.04045: <https://www.w3.org/WAI/GL/wiki/Relative_luminance>
- SC 2.2.2 Pause, Stop, Hide (A): <https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html>
- SC 2.3.3 Animation from Interactions (AAA) + C39 `prefers-reduced-motion`: <https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html>
- SC 2.4.11 Focus Not Obscured (Minimum) (AA, nuevo en 2.2): <https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html>
- SC 2.5.8 Target Size (Minimum) (AA, nuevo en 2.2): <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>
- `prefers-reduced-motion` (Media Queries Level 5): <https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion> — *nota: la definición exacta de sus valores no pudo extraerse (página truncada en la consulta); la técnica C39 del W3C sí queda verificada arriba*

**Ficheros del prototipo:**
- `Opcion-1-Rosa.dc.html` (paleta L28; hallazgos por línea a lo largo del informe)
- `salon-data.js` (contenido: L84-91 colores, L116 placeholder, L105-111 contacto)
- `image-slot.js` (L399-401 `observedAttributes`; L463 `alt=""` hardcodeado; L971 uso de `placeholder`)
- `support.js` (L343-344 compilación de `<helmet>`; sin gestión de `lang`/`title`)

**Cálculo reproducible:**
- `scratchpad/contrast.py` — luminancias, 68 combinaciones, veredictos
- `scratchpad/contrast2.py` — cabecera translúcida, `clamp()`, paleta corregida
- `scratchpad/contrast3.py` — umbral de luminancia para bordes, anillo de foco
