# Convenciones del stack base WebEmpresa

> **Área investigada:** Stack base WebEmpresa
> **Objetivo:** que NailsLashStudioWeb (salón con paleta rosa) sea **indistinguible**
> en estilo de código de `WebEmpresa`.
> **Repo estudiado:** `C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/WebEmpresa`
> (rama local, commit más reciente que toca tokens: `988795e`).
> **Fecha del análisis:** 2026-07-15.

Todas las rutas `archivo:linea` de este informe son **relativas a la raíz de
`WebEmpresa`**, salvo indicación expresa.

---

## 1 · Respuesta ejecutiva

**Qué hacemos:** clonamos las convenciones de `WebEmpresa` tal cual, cambiando
**solo los valores de los tokens** (`_tokens.scss`) y los datos de negocio
(`lib/site.ts`). La arquitectura, el naming, el patrón de tests y la mecánica de
tema se copian sin variación.

Los 10 puntos que hacen que el código sea reconocible como "de este stack":

1. **Estructura fija de 5 zonas** en `src/`: `main.tsx`, `App.tsx`, `pages/`,
   `components/`, `lib/`, `styles/` (`docs/architecture.md:26-34`).
2. **Componentes planos** — `src/components/` **sin subcarpetas**, un componente
   por archivo, `PascalCase.tsx`, `export default function` (verificado sobre los
   23 archivos de `src/components/`).
3. **Sin barrels y sin alias.** No existe ni un `index.ts` en `src/`; los imports
   son **relativos** (`../lib/useReveal`, `./CheckIcon`). `tsconfig.json` no
   declara `paths` y `vite.config.ts` no declara `resolve.alias`.
4. **SCSS Modules por componente** (`Nombre.module.scss` junto al `.tsx`) +
   globales en `src/styles/` con `@use`, **nunca `@import`**
   (`docs/conventions.md:15-16`).
5. **Los tokens NO son variables SCSS: son CSS custom properties** en `:root` y
   `:root[data-theme='dark']` (`src/styles/_tokens.scss:16` y `:88`).
6. **Regla de oro: 0 hex en componentes.** Los colores se consumen siempre con
   `var(--color-…)` (`docs/conventions.md:16`, `docs/DESIGN_SYSTEM.md:19`).
   **Verificado empíricamente:** `grep` de hex sobre `src/components/*.module.scss`
   devuelve **cero coincidencias**.
7. **Tema por `data-theme` en `<html>`** + `localStorage` + script anti-FOUC
   inline en `index.html:10-28`.
8. **Tests co-locados** (`algo.test.tsx` junto a `algo.tsx`) cuyo `it()` **cita el
   escenario Gherkin**: `it('@s1 …')` (`docs/conventions.md:24-26`).
9. **Clases de CSS Module en `camelCase`** (`.cardTitle`, `.exampleLabel`) —
   inferido del código, no documentado (ver §3).
10. **Prettier sin punto y coma, comilla simple, `printWidth: 100`**
    (`.prettierrc.json:1-8`).

**Por qué:** `docs/conventions.md` existe y es explícito; el repo **cumple** lo que
predica (lo he verificado con `grep`, no solo leído). Desviarse no aporta nada y
rompe la "indistinguibilidad" que pide el encargo.

**Aviso importante (§3.9):** `docs/architecture.md:54-56` está **desactualizado** y
contradice al código. No lo uses como fuente de la paleta.

---

## 2 · Stack y versiones (verificado en `package.json`)

| Capa | Herramienta | Versión declarada | Fuente |
| --- | --- | --- | --- |
| Framework | React | `^19.2.0` | `package.json:35` |
| Lenguaje | TypeScript | `^5.9.0` | `package.json:58` |
| Bundler | Vite | `^7.3.0` | `package.json:61` |
| SSG | `vite-react-ssg` | `0.9.0` (pin exacto, sin `^`) | `package.json:62` |
| Rutas | `react-router-dom` | `^6.30.0` | `package.json:37` |
| Estilos | `sass` | `^1.80.0` | `package.json:58` |
| Primitivas UI | `radix-ui` | `^1.6.0` | `package.json:34` |
| Fuentes | `@fontsource/outfit`, `@fontsource/dm-sans` | `^5.0.0` | `package.json:30-31` |
| Tests | Vitest | `^4.0.0` | `package.json:63` |
| Testing Library | `@testing-library/react` | `^16.3.0` | `package.json:43` |
| Mutación | `@stryker-mutator/core` | `^9.6.0` | `package.json:42` |
| Lint | ESLint | `^9.39.0` (flat config) | `package.json:52` |
| Formato | Prettier | `^3.4.0` | `package.json:57` |
| Email | `resend` | `^6.17.1` | `package.json:38` |
| Gestor | pnpm | `pnpm@11.9.0` (`packageManager`) | `package.json:8` |
| Node | `>=22.12.0` (`.nvmrc` = `22`) | | `package.json:10`, `.nvmrc:1` |

> **Inferencia (no verificada):** `vite-react-ssg` está clavado en `0.9.0` sin
> caret mientras todo lo demás usa `^`. Parece deliberado (paquete sensible al
> SSG), pero **no he encontrado un comentario que lo justifique**. Copiar el pin.

**Scripts** (`package.json:13-28`): `dev`, `dev:ssr`, `build` (= `vite-react-ssg build`),
`preview`, `typecheck`, `lint`, `lint:fix`, `format`, `format:check`, `test`
(= `vitest run`), `test:watch`, `coverage`, `mutation` (= `stryker run`),
`verify` (= `bash ./init.sh`).

---

## 3 · Desarrollo con evidencia

### 3.1 · Estructura de carpetas

Mapa oficial, citado literal de `docs/architecture.md:26-34`:

```
src/
├── main.tsx          # entrada: ViteReactSSG(routes) + estilos + fuentes
├── App.tsx           # definición de rutas (RouteRecord[])
├── pages/            # una página por ruta; SEO con <Head>
├── components/       # componentes de UI reutilizables (PascalCase, 1 por archivo)
├── lib/              # lógica pura y utilidades (sin JSX, fácil de testear y mutar)
└── styles/           # tokens, reset y base globales (@use)
```

**Regla de dependencias** (`docs/architecture.md:36-39`, cita literal):

> `pages` usa `components` y `lib`; `components` usa `lib`; `lib` no importa de
> `components` ni de `pages` (lógica pura, aislada y testeable).

Esto es **direccional y estricto**: `lib/` no puede importar hacia arriba. El
motivo declarado: *"La lógica con valor de negocio vive en `lib/` para poder
testearla y mutarla sin renderizar"* (`docs/architecture.md:38-39`).

**`components/` es PLANO.** No hay `components/ui/`, ni `components/sections/`,
ni carpeta por componente. Los 23 archivos cuelgan directos de
`src/components/` (verificado con `find src -type f`). Ejemplos:
`src/components/Hero.tsx`, `src/components/Hero.module.scss`,
`src/components/Hero.test.tsx` — los tres hermanos, mismo directorio.

### 3.2 · Cómo se organiza un componente

Trío co-locado con **el mismo nombre base**:

```
src/components/Servicios.tsx           # componente
src/components/Servicios.module.scss   # sus estilos
src/components/Servicios.test.tsx      # sus tests
```

Anatomía verificada en `src/components/Servicios.tsx`:

1. **Imports ordenados**: primero `lib` (`../lib/useReveal`, línea 1), luego
   componentes hermanos (`./CheckIcon`, `./ServiceMockup`, líneas 2-3), y
   **el `styles` siempre el último** (`./Servicios.module.scss`, línea 4). Este
   orden se repite en `src/components/ThemeToggle.tsx:1-11` (react → lib → styles)
   y `src/components/Logo.tsx:1-2`.
2. **`type` local** para los datos del componente (`Servicios.tsx:6-12`,
   `type Service = { … }`).
3. **Constante de datos en `SCREAMING_SNAKE_CASE`** justo debajo
   (`Servicios.tsx:14`, `const SERVICES: readonly Service[] = [...]`).
4. **`export default function Nombre()`** al final (`Servicios.tsx:65`).

**Contenido estático dentro del componente:** los 6 servicios viven en el propio
`Servicios.tsx:14-63`, no en `lib/`. Pero la navegación **sí** vive en
`src/lib/nav.ts:11`. **Inferencia:** el criterio es que a `lib/` va lo que
consumen ≥2 componentes (`NAV_LINKS` lo usan `HeaderNav` y `MobileMenu`) o lo que
tiene lógica testeable; el contenido de una sola sección se queda en su
componente. **No está escrito en ningún doc** — es mi lectura del patrón.

**Props tipadas con `type`, no `interface`** (`src/components/Logo.tsx:4-16`,
`type LogoProps = {…}`; `src/lib/nav.ts:5-8`, `type NavLink = {…}`). No he
encontrado **ni un solo `interface`** en `src/`. La regla no está en
`conventions.md` → **inferida**, pero es consistente al 100%.

**Props con valores por defecto en la firma** (`Logo.tsx:24`):

```tsx
export default function Logo({ withWordmark = true, size = 40, animated = false }: LogoProps)
```

**JSDoc en español sobre props y funciones exportadas** (`Logo.tsx:5-15`,
`lib/theme.ts:1-10`, `lib/useReveal.ts:6-13`). Los comentarios explican **el porqué**,
no el qué — a menudo citan el escenario Gherkin (`Servicios.tsx:66-67`:
*"Revelado en scroll (#15) … SSR-safe"*).

### 3.3 · SCSS: módulos, tokens y globales

**Regla oficial** (`docs/conventions.md:15-16`, cita literal):

> **Estilos:** **SCSS Modules** (`*.module.scss`) por componente; tokens y base
> globales en `src/styles/` con `@use` (nunca `@import`). Consumir colores vía
> `var(--color-…)`. Evitar CSS global suelto fuera de `styles/`.

**Globales — parciales con guion bajo, agregados en `main.scss`.**
`src/styles/main.scss` completo (4 líneas):

```scss
@use 'tokens'
@use 'reset'
@use 'base'
@use 'logo-draw'
```

(`src/styles/main.scss:1-4` — nótese: `@use 'tokens'`, **sin** el guion bajo ni la
extensión, aunque el archivo sea `_tokens.scss`.)

Los parciales existentes: `_tokens.scss`, `_reset.scss`, `_base.scss`,
`_logo-draw.scss`. `main.scss` **se importa una sola vez**, en el entry:
`src/main.tsx:11` (`import './styles/main.scss'`).

**El orden importa:** `tokens` → `reset` → `base`. `_base.scss` ya consume
`var(--font-sans)` y `var(--color-bg)` (`_base.scss:3-4`), así que depende de que
`_tokens.scss` se haya cargado antes.

**Qué va en global vs. en módulo:**
- `_reset.scss` — reset moderno mínimo: `box-sizing`, `margin: 0`, `img/svg
  display:block`, `button { font: inherit }`, `ul { list-style: none }`
  (`_reset.scss:1-38`).
- `_base.scss` — estilos de **elemento** (`body`, `h1,h2,h3`, `a`,
  `:focus-visible`) + **dos clases globales**: `.skip-link` (`_base.scss:47-60`) y
  `.prose` (`_base.scss:62-69`). Son la excepción documentada al "no CSS global
  suelto": las usa `Layout.tsx:24` (`className="skip-link"`, string plano, no
  `styles.`) y las páginas de texto.
- Todo lo demás → módulo del componente.

**Ni una variable SCSS (`$`) ni un mixin en todo `src/styles/`.** El sistema es
100% CSS custom properties. No hay `@mixin`, `@function`, `@each` ni mapas de
Sass. Sass se usa **solo** por `@use` y el anidado. Copiar esa sobriedad.

**Nesting: casi nulo.** En `Servicios.module.scss` las clases se declaran planas
una tras otra (`.services`, `.inner`, `.eyebrow`, `.title`…), no anidadas. El
anidado solo aparece como selectores compuestos escritos planos:
`.row:nth-child(even) .card` (`Servicios.module.scss:59`) y
`[data-reveal] .row:not([data-in-view]) .card` (`:207`). **No** se usa `&`.

**Media queries al final del archivo, agrupadas por breakpoint**, no junto a cada
clase (`Servicios.module.scss:151` `@media (max-width: 880px)`, `:162`
`@media (max-width: 560px)`, `:179` `@media (prefers-reduced-motion: no-preference)`,
`:237` combinada).

**Patrón de sección a sangre completa** — se repite en cada sección
(`docs/DESIGN_SYSTEM.md:147-151` lo documenta; `Servicios.module.scss:1-11` lo
implementa):

```scss
.services {
  background: var(--color-bg);
}

.inner {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: var(--section-y) var(--gutter);
}
```

El fondo llena el viewport; `.inner` centra y limita. **Alternancia de fondo:**
`--color-bg` ⇄ `--color-bg-2` (hero/servicios/paquetes usan `bg`; sectores/contacto
usan `bg-2`) — `docs/DESIGN_SYSTEM.md:150-151`.

Motivo documentado de por qué `main` no lleva `max-width` (`_base.scss:24-31`):
si lo llevara, *"duplicaría el gutter y recortaría las bandas de color de sección"*.

### 3.4 · Naming (tabla consolidada)

| Elemento | Convención | Ejemplo verificado |
| --- | --- | --- |
| Componente (archivo) | `PascalCase.tsx` | `src/components/ThemeToggle.tsx` |
| Componente (export) | `export default function PascalCase` | `Servicios.tsx:65` |
| Página (archivo) | **`kebab-case.tsx`** | `src/pages/aviso-legal.tsx` |
| Página (export) | `PascalCase`, **puede diferir del archivo** | `App.tsx:4`: `import LegalNotice from './pages/aviso-legal'` |
| Módulo SCSS | `PascalCase.module.scss` | `src/components/Hero.module.scss` |
| Parcial SCSS global | `_kebab-case.scss` | `src/styles/_logo-draw.scss` |
| Clase CSS Module | **`camelCase`** | `.cardTitle` (`Servicios.module.scss:89`), `.exampleLabel` (`:136`) |
| Utilidad `lib/` (archivo) | `camelCase.ts` | `src/lib/seo.ts`, `src/lib/useIsMobile.ts` |
| Hook | `useAlgo` | `src/lib/useReveal.ts:14` |
| Función pura | `camelCase` | `resolveTheme` (`lib/theme.ts:34`) |
| Constante módulo | `SCREAMING_SNAKE_CASE` | `NAV_LINKS` (`nav.ts:11`), `SERVICES` (`Servicios.tsx:14`), `MODE_CYCLE` (`theme.ts:64`), `REVEAL_ROOT_MARGIN` (`useReveal.ts:4`) |
| Constante privada de archivo | `SCREAMING_SNAKE_CASE` | `STORAGE_KEY` (`theme.ts:8`) |
| Tipo | `type PascalCase` (nunca `interface`) | `ResolvedTheme` (`theme.ts:2`), `NavLink` (`nav.ts:5`) |

**Regla oficial** (`docs/conventions.md:9-12`, cita literal):

> - **Componentes:** funcionales con Hooks; **un componente por archivo**;
>   nombre en `PascalCase` (archivo `PascalCase.tsx`).
> - **Lógica:** en `src/lib/` como funciones puras (`camelCase`), sin JSX.
> - **Ficheros y carpetas:** `kebab-case` para rutas y páginas
>   (`aviso-legal.tsx`); `PascalCase` para componentes.

**El `camelCase` de las clases CSS Module NO está documentado** en
`conventions.md`. Lo infiero de su uso 100% consistente: `styles.cardTitle`
(`Servicios.tsx:87`) ↔ `.cardTitle` (`Servicios.module.scss:89`);
`styles.exampleLabel` (`Servicios.tsx:104`) ↔ `.exampleLabel` (`:136`). Tiene
sentido técnico: `kebab-case` obligaría a `styles['card-title']`. **Recomiendo
copiarlo y documentarlo explícitamente** en nuestro `conventions.md`.

**Excepción a documentar:** hay **un componente por archivo… salvo componentes
auxiliares privados**. `ThemeToggle.tsx:33` define `function ThemeIcon(...)` sin
exportar, en el mismo archivo que `ThemeToggle`. Es un helper de render privado,
no un componente reutilizable. La regla real es: *un componente **exportado** por
archivo*.

### 3.5 · Barrels e imports — VERIFICADO NEGATIVO

**No hay barrels.** `find src -name "index.ts*"` → **cero resultados**. No existe
`src/components/index.ts` ni equivalente.

**No hay alias.** `tsconfig.json` (23 líneas, leído entero) **no tiene `paths`**;
`vite.config.ts` (14 líneas, leído entero) **no tiene `resolve.alias`**;
`vitest.config.ts` (19 líneas) tampoco.

**Consecuencia: imports relativos siempre.** Evidencia:
- `src/components/Servicios.tsx:1` — `import { useReveal } from '../lib/useReveal'`
- `src/components/Servicios.tsx:2` — `import CheckIcon from './CheckIcon'`
- `src/pages/home.tsx:2` — `import Contacto from '../components/Contacto'`
- `src/components/ThemeToggle.tsx:11` — `import styles from './ThemeToggle.module.scss'`

La estructura plana hace que la profundidad relativa nunca pase de `../`, que es
probablemente **por qué** no necesitan alias. **Inferencia**, no documentado.

**Import con nombre + `type` inline** (`src/components/ThemeToggle.tsx:2-10`):

```tsx
import {
  applyTheme,
  getStoredMode,
  nextMode,
  resolveTheme,
  setMode,
  systemPrefersDark,
  type ThemeMode,
} from '../lib/theme'
```

Nótese `type ThemeMode` **inline dentro del import de valores**, no en un
`import type` separado. Cuando el import es **solo** de tipos, sí se usa
`import type` (`src/App.tsx:1`: `import type { RouteRecord } from 'vite-react-ssg'`).

### 3.6 · Tokens de color y temas — **el núcleo del encargo**

**Dónde vive la paleta:** `src/styles/_tokens.scss`, único archivo (126 líneas).

**Cómo se define un tema:** dos bloques, y solo dos:

| Bloque | Línea | Paleta |
| --- | --- | --- |
| `:root` | `_tokens.scss:16` | Claro — "Bosque & Limón" (por defecto) |
| `:root[data-theme='dark']` | `_tokens.scss:88` | Oscuro — "Noche & Oro" |

Cita literal de la cabecera (`_tokens.scss:11-13`):

> El tema se conmuta con `[data-theme]` en `<html>` (ver theme_selector):
> ausencia de atributo / `[data-theme='light']` -> Bosque & Limón (claro)
> `[data-theme='dark']` -> Noche & Oro (oscuro)

**Detalle crítico:** el tema claro se define en `:root` **a secas**, no en
`:root[data-theme='light']`. Es decir, **claro = defecto sin atributo**, y el
bloque `dark` solo sobrescribe. El selector `[data-theme='light']` **no existe en
el CSS** — funciona porque `:root` ya aplica. Copiar exactamente.

**Estructura interna del bloque de tokens** (orden y agrupación por comentario,
`_tokens.scss`):

1. `/* ---- Tipografía ---- */` → `--font-display`, `--font-sans` (`:17-19`)
2. `/* ---- Layout / medidas ---- */` → `--maxw`, `--gutter`, `--section-y` (`:21-27`)
3. Radios → `--radius`, `--radius-md`, `--radius-sm`, `--radius-pill` (`:29-32`)
4. `/* Marca / acción */` → `--color-primary`, `--color-on-primary`, `--color-secondary`, `--color-accent` (`:38-42`)
5. `/* Fondos y superficies */` → `--color-bg`, `--color-bg-2`, `--color-band`, `--color-band-border`, `--color-surface`, `--color-surface-2`, `--color-card-bg`, `--color-border` (`:44-52`)
6. `/* Texto */` → `--color-text`, `--color-text-soft`, `--color-text-faint` (`:54-57`)
7. `/* Etiquetas (tag pills) */` → `--color-tag-ink`, `--color-tag-bg` (`:59-61`)
8. `/* Logotipo */` → `--color-logo-ink`, `--color-logo-sub`, `--color-ring`, `--color-zenith` (`:63-67`)
9. `/* Estados de feedback */` → `--color-danger`, `--color-success` (`:69-71`)
10. `/* Sombra de elevación */` → `--shadow` (`:73-74`)
11. `/* ---- Alias heredados (DEPRECADOS) ---- */` (`:76-82`)

**Cada token lleva comentario en línea explicando su uso** (`_tokens.scss:39`):

```scss
--color-primary: #1e7a4f; /* verde bosque */
--color-bg: #f2f4ef; /* fondo base */
--color-surface-2: rgba(30, 122, 79, 0.1); /* superficie tintada de primary */
```

**Dos reglas de valor explícitas y llamativas:**

1. **Nada de `color-mix()` ni derivados** (`_tokens.scss:7-9`, cita literal):
   > los colores se usan SIEMPRE con `var(--color-…)`. Los valores son literales
   > exactos del diseño (**no derivados con `color-mix`**) para garantizar
   > fidelidad 1:1.

   Las transparencias se escriben como `rgba()` literal, no como `color-mix`:
   `--color-text-soft: rgba(17, 32, 26, 0.66)` (`:56`).

2. **Hex en minúscula** en el SCSS (`#1e7a4f`, `:39`) aunque `DESIGN_SYSTEM.md`
   los tabule en mayúscula (`#1E7A4F`, `docs/DESIGN_SYSTEM.md:74`). El test los
   compara **case-insensitive** (`/i` en `tokens.test.ts:24`), así que ambos pasan.
   **Recomiendo minúscula en SCSS** por coherencia con el repo base.

**Fluidez con `clamp()`** en gutter y ritmo vertical (`_tokens.scss:26-27`), con
su justificación (`:23-25`): en escritorio conserva el valor exacto del diseño, en
móvil se reduce. Nótese que `DESIGN_SYSTEM.md:140-141` todavía lista `--gutter:
26px` y `--section-y: 84px` como valores planos — la tabla de la doc describe el
valor de escritorio, el SCSS ya es fluido. **Discrepancia menor doc↔código.**

**Alias deprecados** (`_tokens.scss:76-82`) — `--color-soft`, `--color-brand`,
`--color-brand-mint`. **NO los copies**: son deuda del scaffold previo de
WebEmpresa. Cita literal: *"No usar en código nuevo; migrar a los tokens de arriba
y eliminar cuando ya no queden referencias"*. Nuestro repo nace limpio.

#### 3.6.1 · Cómo se define un token de color NUEVO (procedimiento verificado)

Reconstruido del commit `6e9a052` *"feat(marca): logo Órbita + tokens
Bosque&Limón/Noche&Oro por TDD (#12)"*, que tocó a la vez
`features/`, `src/styles/_tokens.scss`, `src/styles/tokens.test.ts` y
`stryker.config.json` (`git show --stat 6e9a052`). El flujo es **SDD → TDD**:

1. **Escenario Gherkin primero** en `features/marca.feature:45-55`:

   ```gherkin
   @s7
   Scenario: El tema claro aplica la paleta Bosque & Limón
     Given <html> sin data-theme (o data-theme="light")
     When leo la variable --color-primary calculada en :root
     Then su valor es "#1E7A4F"
   ```

2. **Test que cita el escenario**, en `src/styles/tokens.test.ts:23-25`:

   ```ts
   it('@s7 el tema claro (Bosque & Limón) define --color-primary: #1e7a4f', () => {
     expect(lightRoot()).toMatch(/--color-primary:\s*#1e7a4f/i)
   })
   ```

3. **Token en los DOS bloques** de `_tokens.scss` (claro `:39` + oscuro `:89`),
   con comentario de uso.

4. **Fila en la tabla** de `docs/DESIGN_SYSTEM.md:72-95` (token | claro | oscuro | uso).

**El truco del test de tokens** (`src/styles/tokens.test.ts:5-20`) merece copiarse
tal cual. Cita literal del comentario (`:5-7`):

> jsdom no resuelve custom properties de hojas de estilo con `getComputedStyle`,
> así que verificamos el contrato de tokens directamente sobre la fuente SCSS
> (mismo patrón que `Header.test` @s4).

Es decir: **lee el `.scss` como texto con `readFileSync` y aplica regex**, porque
jsdom no puede computarlos. Y para no confundir bloques, dos helpers que trocean
el archivo por índice de string (`tokens.test.ts:10-20`):

```ts
/** Devuelve el cuerpo del bloque `:root { … }` claro (sin el bloque dark). */
function lightRoot(): string {
  const start = tokens.indexOf(':root {')
  const dark = tokens.indexOf(":root[data-theme='dark']")
  return tokens.slice(start, dark === -1 ? undefined : dark)
}
```

> **Consecuencia para NailsLashStudioWeb:** `lightRoot()` depende de que el
> archivo contenga literalmente `:root {` y `:root[data-theme='dark']`. Si
> cambiamos el formato del selector, el test se rompe. **Otra razón para clonar
> la estructura exacta de `_tokens.scss`.**

#### 3.6.2 · Mecánica del tema (3 modos + anti-FOUC)

Lógica pura en `src/lib/theme.ts`, exports verificados:

| Export | Línea | Qué hace |
| --- | --- | --- |
| `type ResolvedTheme` | `:2` | `'light' \| 'dark'` |
| `type ThemeMode` | `:5` | `ResolvedTheme \| 'system'` |
| `systemPrefersDark()` | `:11` | `matchMedia('(prefers-color-scheme: dark)').matches` |
| `applyTheme(theme)` | `:16` | `document.documentElement.dataset.theme = theme` |
| `getStoredMode()` | `:21` | lee `localStorage`; inválido/ausente → `'system'` |
| `resolveTheme(mode, prefersDark)` | `:34` | función **pura** (sin tocar DOM) |
| `applyInitialTheme()` | `:42` | resuelve + aplica en carga |
| `setMode(mode)` | `:50` | persiste + aplica |
| `nextMode(mode)` | `:74` | cicla `light → dark → system → light` |
| `initialThemeAttribute(stored, prefersDark)` | `:83` | **réplica pura del script anti-FOUC** |

Claves de diseño a copiar:

- **`STORAGE_KEY` privado** (`theme.ts:8`): `const STORAGE_KEY = 'cenit-theme'`.
  → El nuestro será otro (p. ej. `nails-theme`). **Ojo: `index.html:16` hardcodea
  el string `'cenit-theme'`** — hay que cambiarlo en los dos sitios.
- **Ausencia de clave = "Sistema"** (`theme.ts:7`, `DESIGN_SYSTEM.md:60`). En
  `'system'` se hace `removeItem`, no se guarda `'system'` (`theme.ts:52`).
- **`localStorage` siempre en `try/catch`** (`theme.ts:22-30`, `:51-59`): si falla
  el almacenamiento, el tema **se aplica igual** en memoria (`:60`). Comentario
  literal: *"Almacenamiento no disponible: el tema se aplica solo en memoria."*
- **Ciclo por `Record`, no por `switch`** (`theme.ts:64-68`):
  ```ts
  const MODE_CYCLE: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'system', system: 'light' }
  ```
- **Duplicación deliberada y documentada** entre `index.html:14-27` (script inline
  anti-FOUC, en ES5 con `var`) y `theme.ts:83` (`initialThemeAttribute`). El
  comentario del HTML lo dice (`index.html:12-13`): *"Espeja `src/lib/theme.ts:initialThemeAttribute`"*.
  Se duplica **para poder testear la lógica del script inline** sin ejecutar el HTML.
- **`<meta name="theme-color">` por esquema** (`index.html:7-8`), con los hex de
  `--color-bg` de cada tema, + `<meta name="color-scheme" content="light dark">` (`:9`).
- El toggle registra listener de `prefers-color-scheme` **solo en modo `'system'`**
  y lo limpia al cambiar (`ThemeToggle.tsx:98-107`).

### 3.7 · Patrón de tests

**Regla oficial** (`docs/conventions.md:22-26`, cita literal):

> - Vitest, co-locados: `algo.test.ts(x)` junto a `algo.ts(x)`.
> - El nombre del test cita el escenario Gherkin: `it('@s1 …')`.
> - Componentes con Testing Library; lógica pura con asserts exactos.

**Config** (`vitest.config.ts:6-18`): `globals: true`, `environment: 'jsdom'`,
`setupFiles: ['./vitest.setup.ts']`, **`css: false`**, `include: ['src/**/*.{test,spec}.{ts,tsx}']`.

> **`css: false` (`vitest.config.ts:10`) es load-bearing:** los CSS Modules no se
> procesan en test, así que `styles.card` es `undefined` y **no se puede testear
> por clase CSS**. Eso explica que los tests consulten por **rol, texto o
> `data-*`**, nunca por clase. Cuando hace falta un gancho de test se añade un
> `data-*` explícito: `data-icon` en `ThemeToggle.tsx:37` — comentario literal
> (`:31`): *"El `data-icon` es el gancho testeable."*

`vitest.setup.ts` es **una línea** (`:1`): `import '@testing-library/jest-dom/vitest'`.

**Cobertura solo de `lib/`** (`vitest.config.ts:12-17`): `include: ['src/lib/**/*.ts']`.
Los componentes **no cuentan para coverage** — su garantía es la mutación.

**Convención de nombres de `it()`** — tres tipos coexisten, verificado con `grep`:

1. **Con `@sN`** = cubre un escenario Gherkin:
   `it('@s1 muestra los cuatro nombres en orden exacto', …)` (`Sectores.test.tsx:36`)
2. **Sin tag** = test de apoyo / regresión, no exigido por el contrato:
   `it('la sección expone id="sectores" como destino del nav', …)` (`Sectores.test.tsx:30`)
3. **Con `§N`** = cita una sección del Design System:
   `it('§6 muestra la marca "Órbita" (logo) a 38px en el pie', …)` (`Footer.test.tsx`)

**Un mismo `@sN` puede aparecer en varios `it()`** (`Contacto.test.tsx`: dos tests
con `@s4`). Y los `@sN` se **reinician por archivo** (cada `.feature` tiene su
numeración).

**Estructura del test** (`Sectores.test.tsx`):
- Constantes de datos esperados arriba, `SCREAMING_SNAKE_CASE` (`:5` `NAMES`,
  `:7` `DESCRIPTIONS`, `:14` `NOTE`).
- `describe('Sectores', …)` = nombre del componente, sin sufijo (`:16`).
- `render(<Sectores />)` **dentro de cada `it`**, no en `beforeEach`.
- **Línea en blanco entre el `render` (arrange/act) y los `expect`** (`:37-40`) —
  patrón AAA visual, consistente en todos los archivos.
- Queries por rol y texto: `screen.getByRole('heading', { level: 3 })` (`:39`),
  `screen.getByText(...)` (`:20`). `within(card)` para acotar (`:49`).
- Escape a `container.querySelector` solo cuando no hay rol posible:
  `expect(container.querySelector('section#sectores')).not.toBeNull()` (`:33`).

**Aserciones exactas, no laxas** — `toEqual` sobre el array completo en vez de
comprobar longitud (`nav.test.ts:6-11`):

```ts
expect(NAV_LINKS).toEqual([
  { label: 'Servicios', href: '#servicios' },
  …
])
```

Y en componentes, `expect(h2.textContent).toBe('Sectores con los que trabajamos')`
(`Sectores.test.tsx:22`) — el **texto literal completo**, no un `toContain`.

**Split `Componente.test.tsx` vs `Componente.behavior.test.tsx`.** Solo `Contacto`
y `Servicios` lo usan:
- `Contacto.test.tsx` — estructura estática (campos, etiquetas, textos), imports
  mínimos: `render, screen, within` + `describe, expect, it` (`:1-3`).
- `Contacto.behavior.test.tsx` — interacción y async: añade `userEvent`, `waitFor`,
  `vi`, `beforeEach/afterEach` (`:1-3`), mocks y un helper `deferred()` (`:18-21`)
  para observar estados durante un envío pendiente.
- `Servicios.test.tsx` / `Servicios.reveal.test.tsx` — mismo principio, sufijo
  descriptivo del aspecto (`reveal`).

**Inferencia:** el sufijo (`.behavior`, `.reveal`) separa lo que necesita
**mocks/temporizadores** de lo estático. No está documentado en `conventions.md`.

**Patrón de mock parcial** (`Contacto.behavior.test.tsx:7-12`) — mockea **solo** el
efecto de red, mantiene la validación real:

```ts
// Mockeamos SOLO el envío real (sendContactEmail); la validación pura
// (validateContact) se mantiene real para ejercitar el comportamiento completo.
vi.mock('../lib/contact', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/contact')>()
  return { ...actual, sendContactEmail: vi.fn() }
})
```

**Mutación** (`stryker.config.json`): `testRunner: 'vitest'`, `coverageAnalysis:
'perTest'`, y **`mutate` como lista EXPLÍCITA de 17 archivos** (`:12-30`) — no un
glob. Umbrales: `high: 100, low: 90, break: 100` (`:31-35`) → **el build rompe por
debajo del 100%**. Comentario literal (`:3`): *"Valida que los tests muerden.
Umbral: 100% sobre las líneas tocadas por la feature."*

Cuando un mutante es **equivalente** (no observable), se silencia con comentario
justificado, nunca en silencio (`Logo.tsx:26-28`):

```tsx
// React 19 useId() no incluye ':'; este replace es un no-op defensivo (para
// ids estilo React 18). Mutar su reemplazo es equivalente (no observable).
// Stryker disable next-line all
```

Mismo patrón en `useReveal.ts:18-19` (guarda `if (!root) return` inalcanzable).

### 3.8 · Otras convenciones transversales

**Prettier** (`.prettierrc.json:1-8`) — copiar **literal**:

```json
{ "semi": false, "singleQuote": true, "trailingComma": "all", "printWidth": 100, "tabWidth": 2, "endOfLine": "lf" }
```

**`.editorconfig`** (`:1-9`): `charset = utf-8`, `end_of_line = lf`,
`indent_style = space`, `indent_size = 2`, `insert_final_newline = true`,
`trim_trailing_whitespace = true`.

**ESLint 9 flat** (`eslint.config.js:7-24`): `js.configs.recommended` +
`tseslint.configs.recommended` + `react-hooks` + `react-refresh`. Ignora
`['dist', 'coverage', 'reports', '.stryker-tmp', 'node_modules', 'design']` (`:8`).
**No usa `eslint-plugin-jsx-a11y`** — la a11y se garantiza por tests y por el
agente `a11y_seo_auditor`, no por lint. (Verificado: no aparece en `package.json`.)

**Idioma:** **todo en español** — comentarios, JSDoc, `describe`/`it`, mensajes de
commit, docs. El **código** (identificadores) en inglés/español mixto según
dominio: `useReveal`, `applyTheme`, `resolveTheme` en inglés; `Servicios`,
`Paquetes`, `Sectores`, `Contacto` en español (son nombres de sección del negocio).
**Regla inferida:** infraestructura en inglés, dominio de negocio en español.

**SEO** — `src/lib/site.ts:1-7` centraliza los datos del sitio en un `as const`:

```ts
export const SITE = {
  name: 'Cénit Digital',
  tagline: 'Soluciones digitales para pymes',
  description: '…',
  url: 'https://www.cenitdigital.es',
} as const
```

`Layout.tsx:16-23` pone los `<Head>` por defecto; cada página los **sobrescribe**
(`pages/home.tsx:28-40`) con `<title>`, `description`, canonical, OG y
`twitter:card`.

**JSON-LD con escape defensivo** (`home.tsx:15-21`) — patrón a copiar:

```ts
const ORGANIZATION_LD = JSON.stringify({ … }).replace(/</g, '\\u003c')
```

Comentario literal (`home.tsx:12-14`): *"JSON-LD Organization (**no LocalBusiness:
no inventamos dirección ni teléfono**). Se escapa "<" para que un cierre de
`</script>` en los datos no pueda romper el documento"*.

> **Muy relevante para nosotros:** WebEmpresa usa `Organization` **porque no tenía
> dirección verificada**. NailsLashStudioWeb **sí es un local físico en Las Rozas**,
> así que `LocalBusiness` / `BeautySalon` sería lo correcto — **pero solo con
> dirección, teléfono y horario VERIFICADOS**. Ver §4.

**Accesibilidad** (`docs/conventions.md:19-20`, `Layout.tsx:24-30`):
skip-link "Saltar al contenido" + `<main id="contenido" tabIndex={-1}>` y foco
programático (`Layout.tsx:9-12`). `:focus-visible` global con
`outline: 2px solid var(--color-primary)` (`_base.scss:42-45`).

**Rutas** (`App.tsx:6-15`): `RouteRecord[]` con `Layout` como ruta padre y **el
campo `entry`** obligatorio por ruta (`entry: 'src/pages/home.tsx'`) — requisito de
`vite-react-ssg` para el prerender.

### 3.9 · ⚠️ Inconsistencia detectada en el repo base

**`docs/architecture.md:53-57` está DESACTUALIZADO.** Cita literal:

> Los colores y la tipografía salen de `RF-MARCA-001` (Confluence) y viven en
> `src/styles/_tokens.scss` como **CSS custom properties**: modo claro (**Teal
> Profundo**) en `:root`, modo oscuro (**Océano y Coral**) en
> `:root[data-theme='dark']`, y la marca (**Azul Noche y Menta**) común.

Esto **contradice** al código y al Design System, que dicen **Bosque & Limón**
(claro) y **Noche & Oro** (oscuro):
- `src/styles/_tokens.scss:4` — *"Paleta CLARA = Bosque & Limón · Paleta OSCURA = Noche & Oro"*
- `docs/DESIGN_SYSTEM.md:10` — *"Paleta **CLARA = Bosque & Limón** · Paleta **OSCURA = Noche & Oro**"*
- `src/styles/_tokens.scss:39` — `--color-primary: #1e7a4f` (verde, no teal)

`architecture.md` quedó sin actualizar tras el commit `6e9a052` (que cambió la
paleta). `DESIGN_SYSTEM.md:5-6` se declara ganador: *"Este documento manda sobre
cualquier valor suelto del scaffold previo"*.

**Consecuencia:** la **jerarquía de fuentes de verdad** es
`_tokens.scss` (código) > `DESIGN_SYSTEM.md` > `conventions.md` > `architecture.md`.
No copiar `architecture.md:53-57`; al portarlo, reescribir esa sección con nuestra
paleta rosa.

---

## 4 · Lo que NO he podido verificar

| # | Afirmación / dato | Por qué no está verificado | Qué haría falta |
| --- | --- | --- | --- |
| 1 | `RF-CODE-001`, `RF-MARCA-001`, `RF-STACK-001`, `RF-SISTEMA-001`, `DE-002`, `GU-HARNESS-001` | Son páginas de **Confluence** citadas desde `conventions.md:3`, `architecture.md:22`, `DESIGN_SYSTEM.md:5`, `stryker.config.json:3`. **No están en el repo.** No he accedido a Confluence. | Acceso al espacio de Confluence (hay MCP de Atlassian disponible), o export de esas páginas al repo. **Pueden contener normas de empresa que este informe no recoge.** |
| 2 | Diseño "Cenit Digital - Web (final)" (Claude Design) | Fuente de verdad citada en `_tokens.scss:3` y `DESIGN_SYSTEM.md:2-5`. Existe un HTML de 2,7 MB en la raíz (`Cenit Digital - Web (final) - Diseño - Final- Definitivo.html`) que **no he abierto** (tamaño). | Abrir el HTML o el proyecto de Claude Design. Solo necesario si queremos replicar *decisiones visuales*, no convenciones de código. |
| 3 | Contraste AA de la paleta **rosa** de NailsLashStudio | La paleta rosa **no existe todavía**. `DESIGN_SYSTEM.md:220` dice que el contraste de la verde *"validado en RF-MARCA-001"* — no he visto esa validación. | Definir la paleta rosa y validar cada par texto/fondo con una herramienta WCAG (ratio ≥ 4.5:1 texto normal, ≥ 3:1 texto grande y UI). **No asumir que un rosa de marca pasa AA — los rosas claros suelen fallar sobre blanco.** |
| 4 | Que `pnpm test` / `pnpm verify` pasen **hoy** en WebEmpresa | **No he ejecutado nada.** Todo el informe es análisis estático. | `pnpm install && pnpm test && pnpm mutation` en WebEmpresa. |
| 5 | La regla "clases CSS Module en `camelCase`" | **No está en ningún doc.** Inferida de uso 100% consistente (`Servicios.module.scss:89` ↔ `Servicios.tsx:87`). | Confirmar con el equipo y **documentarla explícitamente** en nuestro `conventions.md`. |
| 6 | La regla "`type` siempre, nunca `interface`" | **No documentada.** Inferida: cero `interface` en `src/`. | Ídem #5. Podría añadirse `@typescript-eslint/consistent-type-definitions` para forzarla. |
| 7 | Criterio "contenido en componente vs. en `lib/`" | Inferido: `SERVICES` vive en `Servicios.tsx:14` pero `NAV_LINKS` en `lib/nav.ts:11`. **No hay regla escrita.** | Preguntar al equipo. Mi hipótesis: a `lib/` lo compartido por ≥2 componentes o con lógica testeable. |
| 8 | Criterio del sufijo `.behavior.test.tsx` / `.reveal.test.tsx` | Inferido de 2 casos (`Contacto`, `Servicios`). No documentado. | Ídem #7. |
| 9 | Por qué `vite-react-ssg` está pinneado a `0.9.0` sin `^` | `package.json:62`. Sin comentario que lo explique. | `git log` sobre `package.json` o preguntar. Copiar el pin por defecto. |
| 10 | Datos del negocio real (dirección, teléfono, horario, NIF, servicios, precios) del salón de Las Rozas | **Fuera del alcance de esta investigación** y **no inventables**. | Facilitados por el cliente. Bloquean: `lib/site.ts`, JSON-LD `LocalBusiness`, aviso legal, y el `tel:` del formulario (`Contacto.test.tsx` `@s2` exige `href` que empiece por `tel:`). |
| 11 | Si `docs/architecture.md:53-57` es error o refleja una decisión revertida | Detecté la contradicción (§3.9) pero no su causa. | `git log -p docs/architecture.md`. Irrelevante para nosotros: reescribimos esa sección. |
| 12 | Contenido de `api/`, `design/`, `tools/`, `scripts/` de WebEmpresa | **No explorados** — fuera del área "convenciones de `src/`". `api/` probablemente tiene la función serverless de Resend (`package.json:38` + `@vercel/firewall:32`). | Explorar si vamos a implementar formulario de contacto con email. |

---

## 5 · Impacto en NailsLashStudioWeb

### 5.1 · Qué EXIGE (obligatorio para ser indistinguible)

| # | Exigencia | Fuente |
| --- | --- | --- |
| E1 | Estructura `src/{main.tsx, App.tsx, pages/, components/, lib/, styles/}` | `architecture.md:26-34` |
| E2 | `components/` **plano**, `PascalCase.tsx`, 1 componente exportado por archivo, `export default function` | `conventions.md:9-10` |
| E3 | Dirección de dependencias: `pages → components → lib`; **`lib` no importa hacia arriba** | `architecture.md:36-39` |
| E4 | Trío co-locado `X.tsx` + `X.module.scss` + `X.test.tsx` | `conventions.md:15,24` |
| E5 | Imports **relativos**. Sin barrels, sin alias | `tsconfig.json` (sin `paths`), `vite.config.ts` (sin `alias`) |
| E6 | Orden de imports: react → lib → componentes → **`styles` último** | `ThemeToggle.tsx:1-11`, `Servicios.tsx:1-4` |
| E7 | SCSS Modules por componente; globales en `styles/` con **`@use`, nunca `@import`** | `conventions.md:15-16`, `main.scss:1-4` |
| E8 | Parciales `_kebab-case.scss` agregados en `main.scss`, orden `tokens → reset → base` | `main.scss:1-4` |
| E9 | Tokens = **CSS custom properties** en `:root` + `:root[data-theme='dark']`. **Claro en `:root` a secas** | `_tokens.scss:16,88` |
| E10 | **0 hex en componentes** — siempre `var(--color-…)` | `conventions.md:16`, `DESIGN_SYSTEM.md:19,214` |
| E11 | Valores **literales**, sin `color-mix()`; transparencias con `rgba()` | `_tokens.scss:7-9` |
| E12 | Tokens agrupados por comentario, en el orden de `_tokens.scss` (tipografía → layout → radios → marca → fondos → texto → tags → logo → feedback → sombra), cada uno con comentario de uso | `_tokens.scss:17-74` |
| E13 | Clases CSS Module en `camelCase` | *inferido* — `Servicios.module.scss:89` |
| E14 | Tipos con `type`, nunca `interface` | *inferido* — `Logo.tsx:4`, `nav.ts:5` |
| E15 | Constantes de módulo en `SCREAMING_SNAKE_CASE` | `nav.ts:11`, `theme.ts:8,64` |
| E16 | Páginas `kebab-case.tsx`, export `PascalCase` | `conventions.md:12`, `App.tsx:4` |
| E17 | Tests co-locados con `it('@sN …')` citando el `.feature` | `conventions.md:24-26` |
| E18 | Queries por rol/texto/`data-*`, **nunca por clase** (`css: false`) | `vitest.config.ts:10`, `Sectores.test.tsx:39` |
| E19 | Aserciones **exactas** (`toEqual` del array completo, `toBe` del texto literal) | `nav.test.ts:6-11`, `Sectores.test.tsx:22` |
| E20 | `tokens.test.ts` leyendo el SCSS con `readFileSync` + regex `/i` | `tokens.test.ts:5-8,24` |
| E21 | Stryker con `mutate` **lista explícita** y `break: 100` | `stryker.config.json:12-35` |
| E22 | Prettier: `semi:false`, `singleQuote:true`, `trailingComma:'all'`, `printWidth:100` | `.prettierrc.json:1-8` |
| E23 | Tema: `data-theme` en `<html>` + `localStorage` + **anti-FOUC inline** en `index.html` | `DESIGN_SYSTEM.md:51-64`, `index.html:10-28` |
| E24 | `localStorage` siempre en `try/catch`, aplicando el tema aunque falle | `theme.ts:22-30,51-60` |
| E25 | Todo en **español**: comentarios, JSDoc, `describe`/`it`, commits, docs | todo el repo |
| E26 | `lib/site.ts` con `as const` como fuente única de datos del sitio | `site.ts:1-7` |
| E27 | Skip-link + `<main id="contenido" tabIndex={-1}>` + `:focus-visible` con outline de `primary` | `Layout.tsx:24-30`, `_base.scss:42-45` |
| E28 | Patrón sección a sangre completa + `.inner` con `--maxw`/`--gutter`/`--section-y` | `DESIGN_SYSTEM.md:147-151`, `Servicios.module.scss:1-11` |
| E29 | Mutantes equivalentes: `// Stryker disable next-line all` **con justificación escrita** | `Logo.tsx:26-28`, `useReveal.ts:18-19` |

### 5.2 · Qué PROHÍBE

| # | Prohibición | Fuente |
| --- | --- | --- |
| P1 | ❌ Hex sueltos en componentes o en `*.module.scss` | `conventions.md:16` — verificado: 0 coincidencias hoy |
| P2 | ❌ `@import` de Sass (usar `@use`) | `conventions.md:16` |
| P3 | ❌ Variables SCSS (`$color-…`), mixins, funciones, mapas para el sistema de color | *verificado negativo*: no existen en `src/styles/` |
| P4 | ❌ `color-mix()` o derivados de color | `_tokens.scss:7-9` |
| P5 | ❌ Barrels (`index.ts`) | *verificado negativo*: `find src -name "index.ts*"` → 0 |
| P6 | ❌ Alias de import (`@/…`) | *verificado negativo*: sin `paths`/`alias` |
| P7 | ❌ Subcarpetas en `components/` | *verificado*: 23 archivos planos |
| P8 | ❌ `lib/` importando de `components/` o `pages/` | `architecture.md:36-39` |
| P9 | ❌ JSX en `lib/` (salvo tests `.test.tsx` de hooks) | `conventions.md:11`, `architecture.md:32` |
| P10 | ❌ CSS global fuera de `styles/` (excepciones: `.skip-link`, `.prose`) | `conventions.md:16`, `_base.scss:47,62` |
| P11 | ❌ Copiar los alias **DEPRECADOS** `--color-soft`, `--color-brand`, `--color-brand-mint` | `_tokens.scss:76-82` |
| P12 | ❌ Copiar `architecture.md:53-57` (paleta obsoleta: "Teal Profundo"/"Océano y Coral") | §3.9 de este informe |
| P13 | ❌ `any` sin justificación | `conventions.md:8` |
| P14 | ❌ Testear por clase CSS (`css:false` las deja `undefined`) | `vitest.config.ts:10` |
| P15 | ❌ Punto y coma / comillas dobles (Prettier) | `.prettierrc.json:1-2` |
| P16 | ❌ Selector `:root[data-theme='light']` (el claro va en `:root` a secas) | `_tokens.scss:16` |
| P17 | ❌ `interface` (usar `type`) | *inferido* |
| P18 | ❌ Inventar dirección/teléfono/horario en JSON-LD | `home.tsx:12` — precedente explícito |

### 5.3 · Features que implica

**Portables casi 1:1** (cambiando textos y tokens):

| Feature | Origen | Nota |
| --- | --- | --- |
| Sistema de tokens + 2 temas | `_tokens.scss`, `features/marca.feature` | **Rosa** en claro; **falta decidir el oscuro** (ver riesgo R1) |
| Selector de tema 3 estados + anti-FOUC | `features/theme_selector.feature`, `ThemeToggle.tsx`, `index.html:10-28` | Cambiar `'cenit-theme'` → p. ej. `'nails-theme'` **en los 2 sitios** (`theme.ts:8`, `index.html:16`) |
| Layout + skip-link + Header/Footer | `features/layout_accesibilidad.feature`, `Layout.tsx` | Directo |
| Nav + menú móvil | `features/nav.feature`, `HeaderNav.tsx`, `MobileMenu.tsx` | Cambian las anclas (Servicios/Precios/Galería/Contacto…) |
| Hero | `features/hero.feature` | Copy nuevo |
| Sección tipo "Servicios" (zigzag) | `features/servicios.feature`, `Servicios.module.scss` | Encaja bien con tratamientos (uñas, pestañas) |
| Reveal en scroll | `features/servicios_scroll_reveal.feature`, `lib/useReveal.ts` | Genérico vía `data-*`: portable tal cual (`useReveal.ts:10-11`) |
| Formulario de contacto | `features/contact_form.feature`, `lib/contact.ts` + `api/` | Incluye honeypot (`@s8`). **`api/` sin explorar** |
| Footer + aviso legal | `features/footer.feature`, `pages/aviso-legal.tsx` | **Contenido legal real pendiente** |
| SEO por página | `lib/seo.ts`, `pages/home.tsx:28-40` | **Cambiar `Organization` → `LocalBusiness`/`BeautySalon`** — solo con datos verificados |

**Nuevas / divergentes:**

- **Logo propio del salón.** `Logo.tsx` es la "Órbita" de Cénit. Lo portable es el
  **patrón**: SVG inline, colores desde tokens (`--color-ring`, `--color-zenith`),
  `useId()` para ids de degradado únicos (`Logo.tsx:29-30`), `aria-hidden="true"` +
  `focusable="false"` (`Logo.tsx:41-42`), prop `size`. Los tokens `--color-ring` /
  `--color-zenith` son **específicos de la Órbita**: renombrar a los del nuestro.
- **Galería de trabajos** — no existe en WebEmpresa. Feature nueva. Requiere
  decidir formato de imagen y `alt` reales (`conventions.md:19-20` exige `alt`).
- **Reservas / citas** — WebEmpresa lo *vende* como servicio pero no lo implementa.
  Si el salón lo quiere, es feature nueva desde cero.
- **Precios** — `DESIGN_SYSTEM.md:182` dice *"**Sin precios** (decisión de producto
  pendiente)"*. Un salón normalmente **sí** los publica → divergencia esperable.
- **JSON-LD `LocalBusiness`** — ver §4 #10.

### 5.4 · Riesgos y decisiones abiertas

- **R1 — El tema oscuro de un salón rosa no es trivial.** WebEmpresa hace un giro
  de tono completo (verde/limón → oro/violeta), **no** un oscurecimiento mecánico
  (`_tokens.scss:88-125`). Para el rosa hay que **diseñar** la paleta oscura, no
  derivarla. **Decisión de producto pendiente:** ¿queremos modo oscuro? Si sí, hay
  que diseñarlo; si no, hay que quitar `ThemeToggle`, el bloque `dark`, el script
  anti-FOUC y sus features/tests — y eso **sí** nos alejaría del stack base.
- **R2 — Contraste del rosa (§4 #3).** Los rosas de marca fallan AA sobre blanco
  con frecuencia. Validar **antes** de fijar tokens, no después.
- **R3 — `--color-ring` / `--color-zenith`** son tokens de la Órbita. Renombrarlos
  a los de nuestro logo; no arrastrarlos vacíos.
- **R4 — Umbral de mutación `break: 100`** (`stryker.config.json:34`). Es exigente:
  cada línea de la lista `mutate` debe morir. Presupuestar el esfuerzo de TDD.
- **R5 — Normas de Confluence no leídas** (§4 #1). Podrían contener reglas de
  empresa que este informe no recoge. **Recomiendo leerlas antes de cerrar el
  `conventions.md` de este repo** (hay MCP de Atlassian disponible).
- **R6 — `conventions.md` incompleto.** Al portarlo, **añadir** las reglas
  inferidas (`camelCase` en CSS Modules, `type` vs `interface`, orden de imports,
  criterio `lib/` vs componente, sufijos de test) para que no se pierdan.

---

## 6 · Plan de arranque sugerido

1. Copiar **tal cual**: `.prettierrc.json`, `.editorconfig`, `.nvmrc`,
   `eslint.config.js`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`,
   `vitest.setup.ts`, `src/styles/_reset.scss`, `src/styles/main.scss`.
2. Copiar **adaptando**: `stryker.config.json` (vaciar `mutate`, mantener
   `break: 100`), `src/styles/_base.scss`, `src/lib/theme.ts` (cambiar
   `STORAGE_KEY`), `index.html` (cambiar clave y `theme-color`).
3. Escribir `docs/DESIGN_SYSTEM.md` **propio** con la paleta rosa, misma estructura
   de tablas que `docs/DESIGN_SYSTEM.md:72-95`. **Validar contraste AA primero (R2).**
4. Escribir `docs/conventions.md` = el de WebEmpresa **+ las reglas inferidas** (R6).
5. `features/marca.feature` con `@s7`/`@s8` para los `--color-primary` de cada tema
   → `src/styles/tokens.test.ts` (copiar los helpers `lightRoot`/`darkRoot`
   verbatim de `tokens.test.ts:10-20`) → `_tokens.scss`.
6. **NO** portar `architecture.md:53-57` (§3.9); reescribir esa sección.
7. Antes de tocar `lib/site.ts`, JSON-LD o aviso legal: **conseguir los datos reales
   del salón** (§4 #10). No inventar nada.

---

*Informe generado por análisis estático del repo. **No se ejecutó ningún comando
de build/test** en WebEmpresa (§4 #4). Todas las citas `archivo:linea` son
relativas a la raíz de `WebEmpresa` y verificables con `git show`/lectura directa.*
