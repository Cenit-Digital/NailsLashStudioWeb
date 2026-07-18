# Borrador de spec — `tipografia_global` (micro-feature NUEVA propuesta)

> Estado: **BORRADOR para la puerta humana**. Redacción DELEGADA (Pablo aprueba
> en lotes). NO es aún una sección de `project-spec.md` ni una entrada de
> `feature_list.json`: el `craftsman_lead` la formaliza SOLO si el humano la
> aprueba en la puerta. Objetivo del proyecto AHORA: prototipo DEMO con datos
> placeholder (no se publica en vivo).
>
> Origen: deuda DECLARADA en el cierre de F-07 (`feature_list.json` #7,
> `progress/verificacion_viva_hero_marca.md`): «el `body` global NO fija
> `font-family` → el cuerpo sale en la serif por defecto del UA (Times New
> Roman)». Medido: `grep font-family src/styles` = 0.

---

## 1. Propósito

Fijar la tipografía GLOBAL del documento (cuerpo y encabezados de sección) con
las fuentes ya horneadas por F-05, para que el texto deje de caer en la serif
por defecto del navegador y respete el sistema tipográfico MEDIDO del prototipo.

## 2. Comportamiento (alcance exacto)

Una única capa GLOBAL, en un partial nuevo `src/styles/_tipografia.scss`,
enganchado con `@use 'tipografia'` desde `src/styles/main.scss`. Dos reglas y
nada más:

| Selector  | `font-family`                          | Fuente MEDIDA (main.tsx:21-22)         |
| --------- | -------------------------------------- | -------------------------------------- |
| `body`    | `'Manrope', system-ui, sans-serif`     | Manrope = cuerpo, botones, nav         |
| `h2, h3`  | `'Gilda Display', serif`               | Gilda Display 400 = h2/h3 (y precios)  |

- `body` fija el **suelo heredable** del documento (idéntico al stack del
  eyebrow y de la cabecera, para coherencia literal).
- `h2, h3` fija el **suelo de tipo** de los encabezados de sección.
- El stack de `body` copia EXACTAMENTE el que ya usan `.eyebrow`,
  `.cabecera` y `.pie` (`'Manrope', system-ui, sans-serif`). El de los
  encabezados usa el genérico `serif` como fallback, en la misma línea de la
  casa que `.heroMarca` (`'Great Vibes', cursive`).

### Lo que esta feature NO toca (fronteras duras)

- El **`<h1>` del hero**: lo fija F-07 (`.titulo` pone el color; `.heroMarca`
  Great Vibes, `.heroStudio` Manrope, en los `<span>`). El selector `h2, h3`
  no matchea `h1`. NO se edita `hero.module.scss` (F-07 está `done`).
- **Cabecera, nav y pie**: F-06 ya declara su `Manrope`. NO se edita
  `cabecera.module.scss` (F-06 está `done`). Sus declaraciones explícitas
  ganan a la herencia del `body` (ver §5), así que quedan redundantes pero
  intactas: cada feature es dueña de su declaración.
- **Los precios**: main.tsx dice «Gilda Display 400 = h2/h3, precios», pero los
  precios son de F-09 (`catalogo_servicios`), que les pondrá Gilda Display con
  su propia clase. Esta feature NO adelanta precios.
- **`src/lib/`, tests de lógica, `features/`**: intactos.

## 3. Contrato de aserción

Stryker NO ve SCSS y `src/styles/` no está en `mutate` (igual que F-03, F-04 y
F-08). Por eso el contrato tiene DOS mitades, como estrenó F-07:

### 3.1. Se ASEVERA leyendo el SCSS — nuevo test `src/styles/tipografia-global.test.ts`

Patrón calcado de `cascara-global.test.ts` y `hero-estilos.test.ts`
(readFileSync + regex; ruta y literales escritos A MANO, anti-tautología):

1. La regla `body` declara `font-family` que matchea
   `/font-family\s*:\s*['"]Manrope['"]\s*,\s*system-ui\s*,\s*sans-serif/`.
2. La regla `h2, h3` (o dos reglas) declara `font-family` que matchea
   `/font-family\s*:\s*['"]Gilda Display['"]\s*,\s*serif/`.
3. **Anti-vacuidad — enganche al punto de entrada**: `main.scss` matchea
   `/@use\s+'tipografia'/`. Sin esto el partial cumpliría todo y NO llegaría al
   sitio (el verde por vacuidad de esta feature; misma guarda que
   `cascara-global.test.ts`).
4. **Anti-vacuidad — nadie se queda sin fuente**: ni `body` ni `h2, h3` quedan
   sin `font-family` (misma guarda que `@s17` de F-07: la AUSENCIA fue el fallo
   real cazado en vivo).
5. **Guarda de cero-terceros (protege F-05)**: toda familia CON COMILLAS que
   aparezca en `_tipografia.scss` está en la allowlist de familias YA horneadas
   `{Manrope, Gilda Display, Great Vibes}`. Ninguna familia nueva, ningún
   `@import` ni `@font-face` nuevo. Referenciar una familia no horneada caería
   al fallback EN SILENCIO (main.tsx:18-19); esta guarda lo caza en el test.

### 3.2. Se RE-VERIFICA EN VIVO con Chrome — tras el TDD (extensión de F-07)

Sobre `dist/` servido (build SSG real + CDP), NUNCA jsdom:

1. `getComputedStyle(document.body).fontFamily` resuelve al stack de Manrope y
   `document.fonts.check('16px Manrope')` = `true`.
2. `getComputedStyle($('h2')).fontFamily` resuelve al stack de Gilda Display y
   `document.fonts.check('24px Gilda Display')` = `true`. **Nota medida**: hoy
   hay DOS `<h2>` en el artefacto (`home.tsx`: «Servicios», «Contacto») y CERO
   `<h3>`, así que la verificación en vivo del h2 es posible YA; el h3 se
   verifica en vivo el día que exista uno (F-09/FAQ). El SCSS del h3 se asevera
   igual por §3.1.2.
3. **El woff2 de Gilda Display se descarga y es autohospedado**: esta feature
   es la PRIMERA que referencia Gilda Display (grep `Gilda Display` en `src/` =
   0 hoy), así que dispara su descarga por primera vez (main.tsx:33-34: sin
   referencia, el UA no la pedía). Se verifica que la petición del woff2 va a
   `/assets/…` sin esquema `http(s)` — NO a googleapis/gstatic. F-05 intacto.
4. **Regresión F-07**: el `<h1>` del hero SIGUE computando Great Vibes /
   Manrope en sus dos `<span>`.
5. **Regresión F-06**: cabecera, nav y pie SIGUEN en Manrope.
6. **Contraste (F-03) intacto**: cambiar `font-family` no cambia ningún color;
   los ratios los recalcula `puerta-contraste.ts` desde `_tokens.scss`, que no
   se toca. Se re-verifica que ningún color cambió.

### 3.3. Puertas de build

`pnpm build` termina en exit 0 con las CINCO puertas
(placeholders · contraste · terceros · anclas · cascarón anti-404). Esta
feature no añade puerta de build propia (es SCSS): su defensa es el test que
LEE el SCSS + la puerta de aprobación humana + la verificación en vivo.

## 4. Casos límite

1. **Documento sin `<h3>` (hoy)**: la regla `h3` es válida y aseverada por
   lectura del SCSS; la verificación en vivo cubre solo lo que existe en `dist`
   (≥1 `<h2>`). Declarado, en la línea de F-05 A-28 («latin-ext entrará el día
   que exista un nombre real que lo exija»).
2. **Nombre con `Ł`/`ř`/`ğ` → tofu**: heredado de la decisión A-28 de F-05
   (subset solo `latin`). NO es asunto de esta feature; solo se hace notar que
   el `body` ahora sí ejercita Manrope-latin en TODO el cuerpo (aunque Manrope
   ya se descargaba por el eyebrow/cabecera, el rango de uso crece).
3. **Familia mal escrita / no horneada**: caería al fallback sin error (Times
   New Roman para `body` vía `sans-serif`? no — al `system-ui`; para h-serif al
   `serif`). Lo caza la guarda §3.1.5 (allowlist) antes de llegar a `dist`.
4. **0 encabezados en una futura página**: la regla `body` sigue aplicando; la
   verificación en vivo solo comprueba el `body`.
5. **Un futuro `h2` con clase propia (F-09)**: una clase (0,1,0) gana al
   selector de tipo `h2` (0,0,1); el global es un SUELO, no un techo. Sin
   colisión: es exactamente el comportamiento buscado.

## 5. Riesgos — especificidad vs. estilos existentes (el punto que pidió Pablo)

**Conclusión: la dirección de la cascada es SEGURA; nada existente se pisa.**

- **`body { font-family }` se propaga por HERENCIA, no por especificidad.** La
  herencia es lo más débil: solo rellena donde NINGUNA regla matchea el
  elemento. Cualquier descendiente con `font-family` PROPIA (`.eyebrow`,
  `.heroMarca`, `.heroStudio`, `.cabecera`, `.pie`) sobrescribe el valor
  heredado, tenga la especificidad que tenga. Por tanto el body NO puede
  derrotar al hero ni al header: es la dirección segura por construcción.
- **`h2, h3` es un selector de TIPO (0,0,1)**, el más débil tras la herencia.
  No matchea `h1` (hero intacto). Cualquier clase futura lo gana. Hoy no hay
  ningún `font-family` sobre `h2/h3` en `src/` (grep = 0) → aplica limpio.
- **F-03 (contraste)**: `font-family` no interviene en el cálculo de contraste
  (es color). Riesgo nulo; se re-verifica igual (§3.2.6).
- **F-05 (cero terceros)**: el único vector sería introducir una familia no
  horneada o un `@import`. La guarda §3.1.5 lo bloquea en el test y la puerta
  de terceros en el build. Un `font-family` a secas NO genera petición externa;
  solo dispara la descarga del woff2 YA autohospedado de Gilda Display (§3.2.3).

Riesgo residual: **redundancia declarativa** (body Manrope + cabecera Manrope +
eyebrow Manrope). Es deliberada: cada feature es dueña de su declaración y no se
tocan ficheros `done`. No es un bug; se deja anotado.

## 6. DECISIONES PARA LA PUERTA (preguntas abiertas + recomendación)

### D-1 — ¿`h2` y `h3`, o solo `h2`? → **RECOMIENDO h2 Y h3**

- **A favor (recomendada)**: es el diseño MEDIDO (main.tsx:22, «Gilda Display
  400 = h2/h3»). Un suelo global barato evita que cada feature futura
  (F-09/FAQ) re-declare Gilda Display en cada heading. El SCSS del h3 se
  asevera por lectura aunque hoy no haya ningún `<h3>` en `dist`.
- **Alternativa descartada (solo h2)**: YAGNI puro; hoy no hay h3 que verificar
  en vivo. Se descarta porque contradice el diseño medido y traslada la deuda a
  cada feature de encabezados. Mitigación adoptada: el h3 se verifica EN VIVO
  el día que exista uno (declarado en §3.2.2 y §4.1).

### D-2 — ¿Feature nueva, con qué `id` y `mutable`? → **RECOMIENDO feature nueva id 21, `mutable: false`**

- **A favor (recomendada)**: es una capa GLOBAL transversal (ni hero ni
  header); F-04/F-06/F-07 están `done` y la regla «una feature a la vez» impide
  colgarla de ellas. Es SCSS puro → `mutable: false` con `nota_mutacion`,
  EXACTAMENTE como F-08 `rejilla_responsive` (que ya está en la lista así). Va
  por el pipeline SDD (`sdd: true`): spec → gherkin → puerta → TDD de los tests
  que LEEN el SCSS → judge → verificación en vivo.
- **Bloque propuesto para `feature_list.json`** (que el `craftsman_lead`
  añadiría SOLO tras el visto bueno del humano; el `spec_partner` NO edita
  `feature_list.json`):

```json
{
  "id": 21,
  "name": "tipografia_global",
  "title": "Tipografía global del documento: cuerpo Manrope, encabezados Gilda Display",
  "description": "Deuda declarada en el cierre de F-07: el body global NO fija font-family (grep font-family src/styles = 0) y el cuerpo cae en la serif por defecto del UA (Times New Roman). Nuevo partial _tipografia.scss (@use desde main.scss): body = 'Manrope', system-ui, sans-serif (suelo heredable, idéntico al eyebrow/cabecera); h2, h3 = 'Gilda Display', serif (suelo de tipo). NO toca el <h1> del hero (F-07), ni cabecera/nav/pie (F-06), ni los precios (F-09). Usa SOLO fuentes ya horneadas por F-05.",
  "acceptance": [
    "_tipografia.scss declara body con font-family 'Manrope', system-ui, sans-serif y h2, h3 con 'Gilda Display', serif; se asevera leyendo el SCSS (Stryker no ve SCSS)",
    "main.scss engancha el partial con @use 'tipografia' (sin esto es verde por vacuidad), y ninguno de los dos selectores queda sin font-family",
    "Toda familia entrecomillada del partial está en la allowlist de familias ya horneadas {Manrope, Gilda Display, Great Vibes}: ninguna familia nueva, ningún @import ni @font-face (protege el cero-terceros de F-05)",
    "Verificación EN VIVO con Chrome tras el TDD: font-family computado del body resuelve a Manrope (document.fonts.check('16px Manrope')) y el de un <h2> a Gilda Display (document.fonts.check('24px Gilda Display')); el woff2 de Gilda Display se descarga de /assets sin esquema http(s)",
    "Regresión en vivo: el <h1> del hero sigue en Great Vibes/Manrope (F-07), cabecera/nav/pie siguen en Manrope (F-06), ningún color cambia (F-03) y no hay peticiones a googleapis/gstatic (F-05); pnpm build exit 0 con las CINCO puertas"
  ],
  "depends_on": ["cero_terceros", "cascaron_semantico", "hero_marca"],
  "mutable": false,
  "nota_mutacion": "Nada que mutar: es SCSS. Stryker no ve SCSS y src/styles/ no está en la lista mutate. No lleva mutate propio y se declara aquí en vez de fingir cobertura (igual que F-08).",
  "sdd": true,
  "status": "pending"
}
```

### D-3 — ¿Dónde vive el SCSS? → **RECOMIENDO un partial nuevo `_tipografia.scss`**

- **A favor (recomendada)**: ownership limpio (cada feature es dueña de sus
  ficheros; el repo es estricto en esto). Mismo patrón que `_tokens` (F-03) y
  `_base` (F-04) enganchados desde `main.scss`.
- **Alternativa descartada (meterlo en `_base.scss`)**: `_base.scss` es de F-04
  (`done`) y su contrato es `cascaron_semantico.feature`. Añadir reglas de otra
  feature ahí difumina qué línea es de quién y toca un fichero cerrado. Se
  descarta.

### D-4 (menor) — ¿fallback rico o genérico? → **RECOMIENDO genérico**

- `body`: `'Manrope', system-ui, sans-serif`; `h2, h3`: `'Gilda Display',
  serif`. Coherente con la casa (`.heroMarca` usa `'Great Vibes', cursive`, un
  solo genérico). **Alternativa descartada**: stack serif rico
  (`'Gilda Display', Georgia, 'Times New Roman', serif`) — más robusto ante el
  FOUT, pero rompe la coherencia establecida y no aporta en un prototipo demo.

### D-5 (menor) — ¿`body` o `html`? → **RECOMIENDO `body`**

- `body` es el objetivo convencional del «font del documento»; `html` ya lleva
  `scroll-padding-top` (F-04) y prefiero no mezclar dueños. Ambas heredan igual
  al cuerpo. **Alternativa descartada**: `html` (equivalente funcional, sin
  ventaja).

---

## 7. Comprobabilidad Given/When/Then (nota para el `gherkin_author`)

Cada afirmación de §2-§3 es un escenario:
`Dado _tipografia.scss / Cuando leo la regla body / Entonces font-family
matchea el stack Manrope`; `... la regla h2,h3 / ... el stack Gilda Display`;
`Dado dist servido en Chrome / Cuando computo el font-family del body / Entonces
resuelve a Manrope y su woff2 es autohospedado`; etc. Ninguna afirmación queda
sin forma comprobable. Las verificaciones en vivo (§3.2) son escenarios
`@verificacion-viva` fuera del test unitario, como en F-07.

## 8. PREGUNTAS ABIERTAS pendientes de cierre humano

- Ninguna bloqueante. D-1 a D-5 llevan recomendación; el humano solo confirma
  o corrige en la puerta. Si el humano rechaza formalizar la feature (D-2), la
  deuda de F-07 permanece DECLARADA sin resolver y esta spec queda archivada.
