# Stack base WebEmpresa — SSG, SEO y despliegue en Vercel

> Investigación para **NailsLashStudioWeb** (web real de un salón real en Las Rozas de Madrid).
> Repo estudiado: `C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/WebEmpresa`
> Fecha del análisis: 2026-07-15.
> Convención de citas: `archivo:linea` (rutas relativas a la raíz de WebEmpresa) o URL oficial.
> Marcado explícito de **[HECHO]** / **[INFERENCIA]** / **[DESCONOCIDO]**.

---

## 1. Respuesta ejecutiva

**Qué hacemos: replicamos el patrón de WebEmpresa casi tal cual**, porque está verificado
en producción y es la norma de empresa (`RF-STACK-001`, citada en `docs/architecture.md:19`).
El patrón exacto es:

1. **SSG con `vite-react-ssg` 0.9.0** (`package.json:62`), entrada única
   `src/main.tsx:13` → `export const createRoot = ViteReactSSG({ routes })`, rutas
   declaradas como `RouteRecord[]` en `src/App.tsx:6-16`, y `ssgOptions` en
   `vite.config.ts:8-13` con **`dirStyle: 'nested'`** → cada ruta genera su propio
   `index.html` (`dist/index.html`, `dist/aviso-legal/index.html`, verificado en el build real).
2. **`<head>` por página con el componente `<Head>` de `vite-react-ssg`**
   (`src/pages/home.tsx:28-40`), NO Helmet importado a mano. Internamente **sí es
   react-helmet-async** (dependencia directa de la librería, y los atributos `data-rh="true"`
   aparecen en el HTML prerenderizado). `Layout` aporta los valores comunes por defecto
   (`src/components/Layout.tsx:16-23`).
3. **`robots.txt` y `sitemap.xml` son archivos ESTÁTICOS a mano** en `public/`
   (`public/robots.txt`, `public/sitemap.xml`). **No hay generación automática.**
   Esto es deuda técnica conocida: se desincroniza al añadir rutas → ver §4.
4. **JSON-LD schema.org**: solo `Organization`, inline en la home
   (`src/pages/home.tsx:15-21`), con escapado de `<` como defensa ante inyección.
   **Deliberadamente NO usan `LocalBusiness`** con este comentario literal
   (`src/pages/home.tsx:12`): *"JSON-LD Organization (no LocalBusiness: no inventamos
   dirección ni teléfono)"*.
5. **Vercel sin `vercel.json`**: **no existe** ese archivo en el repo (búsqueda
   exhaustiva: 0 resultados). Se apoya en la autodetección del preset Vite. Las funciones
   viven en `api/*.ts` con el formato **`export default { fetch }`**, que es exactamente
   el formato oficialmente documentado por Vercel para `framework=other`.

**Por qué**: cada pieza está verificada contra la fuente oficial (§2) y contra el output
real del build. Las tres desviaciones que SÍ recomiendo para nuestro proyecto están en §4:
(a) **sí necesitamos `LocalBusiness`/`BeautySalon`** porque el salón es un negocio local
real con dirección física —pero **solo cuando tengamos los datos verificados del negocio,
que hoy NO tenemos**—; (b) el sitemap manual es un riesgo que conviene automatizar; y
(c) `api/` no pasa por el typecheck del arnés (`tsconfig.json:22`), un agujero real.

**Aviso de versión importante**: WebEmpresa fija `vite-react-ssg` en **0.9.0 exacto** (sin
`^`), publicada el 2026-02-05. El `latest` del registro npm es hoy **0.9.2** (publicada
2026-07-15, el mismo día de este análisis). Ver §2.1 y §3.

---

## 2. Desarrollo con evidencia

### 2.1 La versión de vite-react-ssg y su estado oficial

**[HECHO]** El repo declara la versión **exacta, sin rango**:

```json
"vite-react-ssg": "0.9.0",
```
> Fuente: `package.json:62`. Nótese que el resto de devDependencies usan `^` — la fijación
> exacta aquí es deliberada. **[INFERENCIA]** El motivo no está documentado en el repo;
> probablemente por la sensibilidad del prerender a cambios de patch. No lo he verificado.

**[HECHO]** Versión realmente instalada: `0.9.0` (leída de
`node_modules/vite-react-ssg/package.json`).

**[HECHO]** Estado en el registro oficial npm (consulta a `https://registry.npmjs.org/vite-react-ssg`
el 2026-07-15):

| Versión | Fecha de publicación |
| --- | --- |
| 0.8.9 | 2025-09-08 |
| **0.9.0** (la que usa WebEmpresa) | **2026-02-05** |
| 0.9.1-beta.1 | 2026-02-13 |
| 0.9.1 | 2026-07-08 |
| **0.9.2** (`dist-tags.latest`) | **2026-07-15** |

**[HECHO]** Dependencias de la 0.9.0 según el registro npm:
`react-helmet-async ^1.3.0`, `jsdom ^24.1.3`, `p-queue ^9.1.0`, `fs-extra ^11.3.3`,
`html5parser ^2.0.2`, `kolorist ^1.8.0`, `yargs ^17.7.2`.
→ **Esto confirma que `<Head>` se apoya en `react-helmet-async`**, no en el `react-helmet`
original (pese a lo que dice el README, ver §2.3).

**[HECHO] Aviso oficial sobre React Router v7** — cita textual del README oficial
(https://github.com/Daydreamer-riri/vite-react-ssg):

> "React Router v7 now has built-in SSG support. If you are using React Router v7, we
> recommend using its official SSG capabilities for better official support and integration.
> `vite-react-ssg` will continue to maintain SSG functionality for React Router v6 users."

**[HECHO]** WebEmpresa usa `react-router-dom: ^6.30.0` (`package.json:37`), es decir, **v6**,
que es exactamente el caso de uso que la librería declara que seguirá manteniendo.
**[INFERENCIA]** Por tanto, seguir con vite-react-ssg + RR v6 es coherente con la
recomendación oficial; migrar a RR v7 nos sacaría del stack de empresa y del patrón probado.
**No es una decisión que deba tomar yo**: la señalo como bifurcación estratégica en §4.

### 2.2 SSG: entry, rutas y prerenderizado

**[HECHO] Entry** — `src/main.tsx` completo en lo relevante:

```ts
import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './App'
import './styles/main.scss'

export const createRoot = ViteReactSSG({ routes })
```
> Fuente: `src/main.tsx:9-13`. Las fuentes `@fontsource` se importan arriba
> (`src/main.tsx:1-8`) y los estilos globales en `src/main.tsx:11`.

**[HECHO]** La firma `ViteReactSSG({ routes })` coincide con el ejemplo oficial del README:

```ts
import { ViteReactSSG } from 'vite-react-ssg'
import routes from './App.tsx'

export const createRoot = ViteReactSSG(
  { routes },
  ({ router, routes, isClient, initialState }) => { /* do something. */ },
)
```
> Fuente: README oficial (https://github.com/Daydreamer-riri/vite-react-ssg).
> WebEmpresa **omite el segundo argumento** (el callback de setup), que es opcional.

**[HECHO] Rutas** — `src/App.tsx` completo:

```tsx
import type { RouteRecord } from 'vite-react-ssg'
import Layout from './components/Layout'
import Home from './pages/home'
import LegalNotice from './pages/aviso-legal'

export const routes: RouteRecord[] = [
  {
    path: '/',
    Component: Layout,
    entry: 'src/components/Layout.tsx',
    children: [
      { index: true, Component: Home, entry: 'src/pages/home.tsx' },
      { path: 'aviso-legal', Component: LegalNotice, entry: 'src/pages/aviso-legal.tsx' },
    ],
  },
]
```
> Fuente: `src/App.tsx:1-16`.

Detalles del patrón, con su justificación oficial:

- **`RouteRecord`** extiende el `RouteObject` de react-router con `lazy`, `entry` y
  `getStaticPaths`. Fuente: README oficial.
- **El campo `entry`** — cita textual del README oficial:
  > "You are not required to use this field. It is only necessary when 'prehydration style
  > loss' occurs. It should be the path from root to the target file."

  **[HECHO]** WebEmpresa lo pone en **todas** las rutas (`src/App.tsx:10,12,13`), aunque
  sea opcional. **[INFERENCIA]** Lo hacen preventivamente contra la pérdida de estilos
  antes de la hidratación (el proyecto usa SCSS Modules por componente, justo el escenario
  del "prehydration style loss"). El repo no documenta el motivo explícitamente.
- **`Component:`** (no `element:`) y rutas **estáticas, sin `lazy`, sin `getStaticPaths`**:
  al no haber rutas dinámicas (`:param`), no hace falta `getStaticPaths` ni
  `includedRoutes`/`includeAllRoutes`.

**[HECHO] Opciones SSG** — `vite.config.ts` completo:

```ts
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  ssgOptions: {
    script: 'async',
    entry: 'src/main.tsx',
    dirStyle: 'nested',
    formatting: 'none',
  },
})
```
> Fuente: `vite.config.ts:1-14`.

**[HECHO]** Contraste con los valores por defecto documentados en el README oficial
(`ViteReactSSGOptions`):

| Opción | Default oficial | WebEmpresa | Efecto |
| --- | --- | --- | --- |
| `script` | `'sync'` | `'async'` | El JS no bloquea el parseo del HTML. |
| `entry` | `'src/main.ts'` | `'src/main.tsx'` | Necesario: el entry es `.tsx`, no `.ts`. |
| `dirStyle` | `'flat'` | `'nested'` | `/foo/index.html` en vez de `/foo.html` → **URLs limpias sin `.html` ni rewrites**. |
| `formatting` | `'none'` | `'none'` | Igual al default (redundante pero explícito). |

**[HECHO] El build es `vite-react-ssg build`**, no `vite build`:
```json
"dev": "vite",
"dev:ssr": "vite-react-ssg dev",
"build": "vite-react-ssg build",
```
> Fuente: `package.json:14-16`. **Ojo**: `pnpm dev` arranca Vite normal (SPA, sin
> prerender); `pnpm dev:ssr` es el modo que ejercita el SSG.

**[HECHO] Prueba del prerenderizado real** — archivos presentes en `dist/`:
- `dist/index.html` (ruta `/`)
- `dist/aviso-legal/index.html` (ruta `/aviso-legal`)

Esto confirma empíricamente el efecto de `dirStyle: 'nested'`: dos rutas → dos HTML
independientes en carpetas anidadas. **[INFERENCIA]** Es la razón por la que **no se
necesita ningún rewrite SPA en Vercel** (ver §2.6).

### 2.3 Gestión del `<head>` / meta / SEO

**[HECHO]** Se usa el componente `<Head>` **exportado por `vite-react-ssg`**. No se importa
`react-helmet` ni `react-helmet-async` en ningún punto de `src/`.

Uso oficial documentado (README):
```tsx
import { Head } from 'vite-react-ssg'
<Head>
  <title>My Title</title>
  <meta property="og:description" content="Description" />
</Head>
```

**[HECHO]** El README oficial describe `<Head/>` como *"a wrapper around React Helmet"* y
enlaza al `react-helmet` original (`github.com/nfl/react-helmet`).
**[HECHO] Pero eso es impreciso**: la dependencia real de la 0.9.0 es
**`react-helmet-async ^1.3.0`** (registro npm), y el HTML generado lleva los atributos
`data-rh="true"` característicos de react-helmet-async (verificado en `dist/index.html`).
**[INFERENCIA]** El README arrastra un enlace desactualizado. Lo que importa a efectos
prácticos: es react-helmet-async, que es SSR-safe (el original no lo es).

**Patrón de dos niveles** (verificado):

**Nivel 1 — Layout (defaults comunes)**, `src/components/Layout.tsx:16-23`:
```tsx
<Head>
  <html lang="es" />
  <meta name="description" content={SITE.description} />
  <meta property="og:title" content={SITE.name} />
  <meta property="og:description" content={SITE.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={SITE.url} />
</Head>
```
> Nótese `<html lang="es" />` dentro de `<Head>`: así se fija el atributo `lang` del `<html>`.

**Nivel 2 — Página (sobrescribe)**, `src/pages/home.tsx:28-40`:
```tsx
<Head>
  <title>{title}</title>
  <meta name="description" content={SITE.description} />
  <link rel="canonical" href={HOME_URL} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={SITE.name} />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={SITE.description} />
  <meta property="og:url" content={HOME_URL} />
  <meta name="twitter:card" content="summary" />
  <script type="application/ld+json">{ORGANIZATION_LD}</script>
</Head>
```

Y la página interior, más escueta (`src/pages/aviso-legal.tsx:8-13`): `title`,
`description`, `canonical` y `og:url`. **[INFERENCIA]** El resto lo hereda del Layout por
la semántica de sobrescritura de Helmet (el componente más profundo gana).

**[HECHO] Fuente única de la verdad del sitio** — `src/lib/site.ts:1-7`:
```ts
export const SITE = {
  name: 'Cénit Digital',
  tagline: 'Soluciones digitales para pymes',
  description: 'Estudio digital para pymes del noroeste de Madrid: webs rápidas, SEO y automatizaciones con IA.',
  url: 'https://www.cenitdigital.es',
} as const
```

**[HECHO] Lógica de títulos aislada y testeada** — `src/lib/seo.ts:9-24`:
```ts
export function buildPageTitle(pageTitle?: string): string {
  if (!pageTitle) return SITE.name
  return `${pageTitle} — ${SITE.name}`
}
export function buildHomeTitle(): string {
  return `${SITE.name} — ${SITE.tagline}`
}
```
Con la decisión de diseño documentada en el propio comentario (`src/lib/seo.ts:16-21`):
*"Título de la home: `<sitio> — <tagline>`. Orden inverso al de las páginas interiores (el
nombre va primero) para que la marca encabece el resultado de búsqueda de la portada."*

**[HECHO]** Y con tests unitarios que cubren los casos borde, incluido `''` (cadena vacía →
solo el nombre): `src/lib/seo.test.ts:6-17`. Esto es la aplicación de la regla de
arquitectura *"la lógica con valor de negocio vive en `lib/` para poder testearla y mutarla
sin renderizar"* (`docs/architecture.md:44-46`).

**[HECHO] Resultado real prerenderizado** en `dist/index.html` (extracto literal del `<head>`):
```html
<title data-rh="true">Cénit Digital — Soluciones digitales para pymes</title>
<meta data-rh="true" name="description" content="Estudio digital para pymes del noroeste de Madrid: …">
<meta data-rh="true" property="og:url" content="https://www.cenitdigital.es/">
<link data-rh="true" rel="canonical" href="https://www.cenitdigital.es/">
<script data-rh="true" type="application/ld+json">{"@context":"https://schema.org","@type":"Organization",…}</script>
```
→ **[HECHO]** El SEO y el JSON-LD **viajan en el HTML estático**, no dependen de JS.
Esto es lo que hace que el patrón sirva para SEO real.

### 2.4 Datos estructurados schema.org

**[HECHO]** Solo hay **un** bloque JSON-LD en todo el repo — `src/pages/home.tsx:12-21`:

```tsx
// JSON-LD Organization (no LocalBusiness: no inventamos dirección ni teléfono).
// Se escapa "<" para que un cierre de </script> en los datos no pueda romper el
// documento (serialización segura, aunque hoy los datos sean estáticos).
const ORGANIZATION_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
}).replace(/</g, '\\u003c')
```

Tres decisiones que **debemos copiar tal cual**:
1. **`JSON.stringify` sobre un objeto**, nunca un string JSON escrito a mano → imposible
   generar JSON inválido.
2. **`.replace(/</g, '\\u003c')`** → un `</script>` dentro de un dato no puede romper el
   documento (XSS por ruptura de contexto). Defensa en profundidad.
3. **`Organization` y no `LocalBusiness`**, con el motivo escrito en el código: *"no
   inventamos dirección ni teléfono"*. **[HECHO]** Es exactamente la misma disciplina
   antiinvención que rige nuestro proyecto.

**[HECHO]** No hay `BreadcrumbList`, ni `WebSite`/`SearchAction`, ni `FAQPage`, ni `Service`.

### 2.5 Sitemap y robots

**[HECHO]** Ambos son **archivos estáticos escritos a mano** en `public/`, servidos tal cual.
**No hay ningún generador, script ni plugin** (verificado: no aparece ningún hook
`onFinished` en `vite.config.ts`, que es donde vite-react-ssg permitiría generarlos).

`public/robots.txt` (contenido íntegro):
```
User-agent: *
Allow: /

Sitemap: https://www.cenitdigital.es/sitemap.xml
```

`public/sitemap.xml` (contenido íntegro):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.cenitdigital.es/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.cenitdigital.es/aviso-legal</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

**[HECHO]** Observaciones objetivas:
- El namespace `http://www.sitemaps.org/schemas/sitemap/0.9` es el correcto del protocolo.
- **No hay `<lastmod>`** en ninguna URL.
- Las URLs están **hardcodeadas**, duplicando `SITE.url` (`src/lib/site.ts:6`) → dos fuentes
  de verdad para el dominio.
- **La lista de rutas está duplicada** respecto a `src/App.tsx:6-16` → **[INFERENCIA]** al
  añadir una página, nada obliga a actualizar el sitemap; se desincronizará en silencio.
  Esta es, a mi juicio, la debilidad más clara del patrón heredado.

**[DESCONOCIDO]** Si `changefreq`/`priority` aportan algo hoy: **no he verificado** la
postura actual de Google al respecto. No afirmo nada sobre su utilidad.

### 2.6 Despliegue en Vercel

**[HECHO] NO existe `vercel.json`** en WebEmpresa. Búsqueda exhaustiva
(`find . -name "vercel.json"` excluyendo `node_modules/` y `.stryker-tmp/`): **0 resultados**.

**[INFERENCIA]** El despliegue se apoya en la **autodetección del preset Vite** de Vercel
(build `vite-react-ssg build` vía `package.json:16`, output `dist/`). **No he podido
verificar** la configuración real del proyecto en el dashboard de Vercel (§3).

**[HECHO] Por qué NO hace falta el rewrite SPA** — la doc oficial de Vercel para Vite
(https://vercel.com/docs/frameworks/frontend/vite) dice literalmente:

> "If your Vite app is configured to deploy as a Single Page Application (SPA), deep linking
> won't work out of the box. To enable deep linking in SPA Vite apps, create a `vercel.json`
> file at the root of your project, and add the following code: `{"rewrites": [{"source":
> "/(.*)", "destination": "/index.html"}]}`"

Y remata:
> "**Deploying your app in Multi-Page App mode is recommended for production builds**."

**[INFERENCIA] — y es un punto crítico para nosotros**: con `dirStyle: 'nested'` el build
produce un HTML por ruta (`dist/aviso-legal/index.html`), es decir, un **Multi-Page App**
de facto. El rewrite SPA no solo es innecesario: **sería activamente dañino**, porque
serviría `index.html` (la home) para *todas* las rutas y **anularía el prerender por página**
—el HTML de `/aviso-legal` nunca llegaría al buscador—. Por tanto, la **ausencia** de
`vercel.json` no es un olvido: es coherente con el diseño SSG.
*(Esto es razonamiento mío a partir de dos hechos verificados —el output real de `dist/` y
la doc de Vercel—; el repo no lo documenta explícitamente en ningún sitio.)*

**[HECHO] Formato de las funciones serverless** — `api/contact.ts:36-37`:
```ts
export default {
  async fetch(request: Request): Promise<Response> {
```

Esto coincide **exactamente** con el formato oficialmente documentado por Vercel para
proyectos sin framework. Cita literal de https://vercel.com/docs/functions/quickstart
(bloque etiquetado `filename="api/hello.ts" framework=other`):
```ts
export default {
  async fetch(request: Request) {
    const response = await fetch('https://api.vercel.app/products');
    const products = await response.json();
    return Response.json(products);
  },
};
```
> La misma doc añade: *"While using `fetch` is the recommended way to create a Vercel
> Function, you can still use HTTP methods like `GET` and `POST`."*

**[HECHO] El endpoint se consume desde el cliente** con `fetch('/api/contact', …)`
(`src/lib/contact.ts:42`) — ruta relativa, mismo origen.

**[HECHO] `api/` queda FUERA del typecheck del arnés.** `tsconfig.json:22`:
```json
"include": ["src", "vite.config.ts", "vitest.config.ts", "vitest.setup.ts"]
```
El propio código lo reconoce (`api/contact.ts:15-16`): *"NOTA: este archivo NO forma parte
del build SSG ni del typecheck del arnés (tsconfig solo incluye `src/`); Vercel lo compila
y sirve por separado."*
**[INFERENCIA]** Es un agujero real de calidad: el código con acceso a claves y a la
frontera de confianza es justo el que ningún gate verifica. Ver §4.

**[HECHO] Endurecimiento del endpoint** (`api/contact.ts`), útil como checklist a replicar:
- Rechaza no-POST → 405 (`api/contact.ts:38-40`).
- **Rate limit por IP** con `checkRateLimit('contact-form', { request })` de
  `@vercel/firewall` → 429 (`api/contact.ts:43-46`).
- **Honeypot server-side** (campo `empresa`): si viene relleno → **200 OK silencioso**, no
  error (`api/contact.ts:56-58`). Así el bot no aprende que ha sido detectado.
- Validación de formato de email y **topes de longitud** (`api/contact.ts:30-32,66-80`).
- **Saneado CRLF** `s.replace(/[\r\n]+/g, ' ')` como defensa en profundidad contra
  inyección de cabeceras (`api/contact.ts:34`).
- Si falta `RESEND_API_KEY` → 500 controlado, sin filtrar detalles (`api/contact.ts:82-85`).

**[HECHO] El rate limit exige configuración manual en el dashboard.** `README.md:128-131`:
*"Rate limiting: en el dashboard de Vercel → Firewall → nueva regla con Rate limit ID
`contact-form` (el que consume `checkRateLimit` en `api/contact.ts`). Sin esa regla,
`checkRateLimit` es un no-op seguro (no limita, pero no rompe)."*
→ **[INFERENCIA]** Riesgo operativo: el código "funciona" sin la regla, pero **sin
protección**. Es un fallo silencioso: nada en el build avisa.

**[HECHO] Las funciones NO corren en `pnpm dev`.** `README.md:133-134`: *"En local,
`pnpm dev` no ejecuta las funciones de `/api` (usa `vercel dev` para probarlas); los tests
cubren el comportamiento del formulario mockeando el envío."*

**[HECHO] Gestión de secretos** — regla `RF-STACK-001` (`.env.example:3-8`): *"NINGUNA clave
real se sube al repositorio"*; solo las variables con prefijo `VITE_` llegan al cliente. Las
privadas (`RESEND_API_KEY`, `CONTACT_TO`, `RESEND_FROM`) viven en las env vars de Vercel.

### 2.7 Hidratación: el patrón `ClientOnly`

**[HECHO]** Todo lo que depende del navegador se envuelve en `<ClientOnly>` de
`vite-react-ssg`, con la sintaxis **render-prop** (`src/components/HeaderNav.tsx:21,34`):
```tsx
<ClientOnly>{() => <ThemeToggle />}</ClientOnly>
```
> Motivo documentado en `src/components/HeaderNav.tsx:13`: *"envuelto en `ClientOnly` para
> no renderizar en el prerender SSG"*. Y en `docs/architecture.md:57-59`: *"La interactividad
> que depende del navegador (p. ej. el conmutador de tema) se envuelve en `<ClientOnly>`
> para evitar desajustes de hidratación."*

**[HECHO]** El tema se aplica **antes del primer pintado** con un script inline en
`index.html:10-28` que lee `localStorage['cenit-theme']` y cae a
`matchMedia('(prefers-color-scheme: dark)')`, para evitar FOUC. El comentario advierte que
**espeja** `src/lib/theme.ts:initialThemeAttribute` (`index.html:15-17`).
**[INFERENCIA]** Es duplicación deliberada (el script no puede importar del bundle), pero
es un acoplamiento frágil: dos sitios que deben cambiar a la vez.

**[HECHO]** Un commit del historial confirma que estos desajustes SSG son reales y costaron
trabajo: `7afda5d fix(nav): ocultar nav de escritorio en móvil (prerender SSG) y apilar el
drawer sobre la cabecera`.

---

## 3. Lo que NO he podido verificar

| # | Afirmación / dato | Por qué no está verificado | Qué haría falta para verificarlo |
| --- | --- | --- | --- |
| 1 | La configuración real del proyecto en **Vercel** (framework preset, build command, output dir, `cleanUrls`, dominio) | No hay `vercel.json` en el repo; esa config vive **solo en el dashboard**, al que no tengo acceso | Acceso al dashboard de Vercel del proyecto, o `vercel project inspect` / `vercel pull` autenticado |
| 2 | Que **cenitdigital.es esté realmente desplegado** con este patrón y que el HTML servido en producción coincida con `dist/` | No he hecho ninguna petición al dominio real | `curl -s https://www.cenitdigital.es/aviso-legal` y comprobar que devuelve HTML prerenderizado con 200 (no un rewrite a la home) |
| 3 | Si existe la **regla de Firewall `contact-form`** en Vercel | Es config de dashboard; el código es un no-op seguro sin ella (`README.md:130-131`) | Revisar Vercel → Firewall → Rate limiting del proyecto |
| 4 | Si `dist/` está **actualizado** respecto al código fuente actual | `dist/` está en el árbol de trabajo pero es un artefacto de build de fecha desconocida; no he ejecutado `pnpm build` | Ejecutar `pnpm install && pnpm build` en WebEmpresa y volver a comparar el HTML |
| 5 | Qué cambia entre **0.9.0 → 0.9.1 → 0.9.2** de vite-react-ssg y si romperían este patrón | No he leído el CHANGELOG ni los diffs de esas versiones | Leer `https://github.com/Daydreamer-riri/vite-react-ssg/releases` y el CHANGELOG.md del repo |
| 6 | El motivo de **fijar `0.9.0` exacto** (sin `^`) | No está documentado en el repo (ni en `package.json`, ni en `docs/`, ni en el historial que he revisado) | Preguntar al responsable del stack o buscar en Confluence (`RF-STACK-001`, `DE-002`) |
| 7 | Postura oficial actual de Google sobre **`changefreq`/`priority`** y sobre `<lastmod>` | No lo he consultado; no afirmo nada al respecto | Leer la doc oficial de Google Search Central sobre sitemaps |
| 8 | Los **datos del negocio real** de NailsLashStudio (nombre legal, NIF, dirección exacta en Las Rozas, teléfono, horarios, dominio) | **No están en ninguna fuente que yo haya visto.** Son de otra área de investigación | Aportación directa del cliente/propietario, documentada por escrito |
| 9 | El **vocabulario schema.org exacto** para un salón de uñas/pestañas (`BeautySalon` vs `NailSalon` vs `HealthAndBeautyBusiness`, propiedades obligatorias) | No he consultado schema.org en esta investigación — está fuera del alcance de mi pregunta y merece verificación propia | Consultar `https://schema.org/BeautySalon` y la doc de Google sobre datos estructurados de negocios locales |
| 10 | Si el proyecto NailsLashStudioWeb debe usar **RR v6 + vite-react-ssg** o **RR v7 con SSG nativo** | Es una decisión de arquitectura, no un hecho verificable. La doc oficial recomienda RR v7 nativo *si ya usas v7*; el stack de empresa está en v6 | Decisión humana explícita (`craftsman_lead` + norma de empresa `RF-STACK-001`) |

---

## 4. Impacto en el proyecto NailsLashStudioWeb

### 4.1 Qué EXIGE (replicar tal cual)

1. **Entry SSG idéntico**: `src/main.tsx` con `export const createRoot = ViteReactSSG({ routes })`
   (patrón de `src/main.tsx:13`). El nombre `createRoot` **no es opcional**: es el export que
   la librería busca.
2. **`ssgOptions` en `vite.config.ts`** con **`entry: 'src/main.tsx'`** (el default oficial
   es `src/main.ts`, sin la `x` → si no se pone, el build no encuentra la entrada) y
   **`dirStyle: 'nested'`** (default oficial `flat`) para URLs limpias.
3. **Rutas en `src/App.tsx` como `RouteRecord[]`** con `Component:` y campo `entry` en cada
   una (previene la pérdida de estilos en la prehidratación, dado que usaremos SCSS Modules).
4. **`src/lib/site.ts` como fuente única** de nombre, tagline, description y URL.
5. **`src/lib/seo.ts` con las funciones puras de título** + sus tests unitarios: la lógica de
   negocio vive en `lib/` para que el `tdd_craftsman` la pueda testear y el
   `mutation_tester` la pueda mutar **sin renderizar**. Es lo que hace que el SEO pase las
   puertas del arnés.
6. **`<Head>` de `vite-react-ssg`** (nunca importar Helmet directamente), en dos niveles:
   `Layout` = defaults comunes + `<html lang="es" />`; cada página = `title`, `description`,
   `canonical` y `og:url` propios.
7. **`<ClientOnly>{() => <X />}</ClientOnly>`** para todo lo que toque `window`,
   `localStorage` o `matchMedia`.
8. **Funciones en `api/*.ts` con `export default { fetch }`** (formato oficial `framework=other`)
   y el checklist de endurecimiento de §2.6 si hacemos formulario de contacto/reservas.
9. **`RF-STACK-001`**: ninguna clave real en el repo; `.env.example` con placeholders vacíos.

### 4.2 Qué PROHÍBE

1. **NO crear `vercel.json` con el rewrite SPA** `{"source": "/(.*)", "destination": "/index.html"}`.
   Con SSG `nested` **destruiría el prerender por ruta** (§2.6). Es la trampa más fácil de
   caer: aparece en la doc de Vercel y en mil tutoriales, pero aplica a SPAs, **no a nuestro caso**.
2. **NO inventar datos del negocio en el JSON-LD ni en el `<head>`.** WebEmpresa se
   autolimitó a `Organization` con el motivo escrito en el código (`src/pages/home.tsx:12`):
   *"no inventamos dirección ni teléfono"*. Nosotros tenemos la **misma regla dura** y
   **[DESCONOCIDO] #8**: hoy no tenemos NI dirección, NI teléfono, NI horarios, NI dominio
   verificados del salón.
3. **NO usar `pnpm dev` como prueba de que el SSG funciona**: `dev` es Vite plano (SPA). El
   prerender solo se ejercita con `pnpm build` o `pnpm dev:ssr` (`package.json:14-16`).
4. **NO escribir el JSON-LD como string a mano**: `JSON.stringify(obj).replace(/</g, '\\u003c')`,
   siempre (`src/pages/home.tsx:15-21`).
5. **NO asumir que el rate limit protege** por el mero hecho de estar el código: exige la
   regla `contact-form` en el dashboard de Vercel (`README.md:128-131`).

### 4.3 Qué features implica (candidatas a `feature_list.json`)

Ordenadas por dependencia. Las marco con el riesgo que mitigan:

1. **`stack_ssg_base`** — entry + rutas + `ssgOptions`. Gate: el build produce un
   `index.html` por ruta y el contenido viaja en el HTML (test verificable sobre `dist/`).
2. **`seo_head`** — `lib/site.ts` + `lib/seo.ts` + `<Head>` en Layout y páginas. `sdd: true`.
3. **`schema_local_business`** — **BLOQUEADA por [DESCONOCIDO] #8 y #9**. A diferencia de
   Cénit Digital (una consultora sin escaparate), **el salón SÍ es un negocio local físico
   en Las Rozas**, y ahí `LocalBusiness`/`BeautySalon` con dirección, teléfono, horarios y
   `geo` es exactamente el caso de uso que Google premia para búsquedas locales
   ("uñas Las Rozas"). **[INFERENCIA]** Es probablemente la mayor ganancia SEO del proyecto
   y la mayor desviación justificada respecto a WebEmpresa. **Pero no se escribe una sola
   línea hasta tener los datos del negocio por escrito y verificados**, y hasta haber
   verificado el vocabulario en schema.org. Mientras tanto: `Organization`, como WebEmpresa.
4. **`sitemap_robots`** — **recomiendo desviarse del patrón**: WebEmpresa los mantiene a mano
   (§2.5) y eso **duplica la lista de rutas** (`src/App.tsx`) y **el dominio** (`src/lib/site.ts:6`).
   Es un bug esperando a pasar: se añade una página y el sitemap miente en silencio.
   **[INFERENCIA]** La vía limpia es generarlos desde `routes` + `SITE.url` en el hook
   **`onFinished(dir)`** de `ssgOptions` (documentado en el README oficial). **No he
   verificado** que ese hook sirva bien para esto: requiere prueba antes de comprometerse.
   Alternativa conservadora: mantenerlos a mano **pero con un test que falle si
   `routes` y `sitemap.xml` divergen** — barato, y cierra el agujero sin tocar el build.
5. **`contacto_reservas`** — solo si hay formulario. Copiar el endurecimiento de §2.6 y
   **cerrar el agujero de `tsconfig.json:22`**: añadir `api` al `include` (o un
   `tsconfig.api.json`) para que el typecheck cubra el código de la frontera de confianza.
   **[INFERENCIA]** WebEmpresa deja `api/` sin typecheck, sin tests y sin mutación; heredar
   eso en una web real con claves de Resend sería heredar el defecto, no el patrón.

### 4.4 Decisiones que debe tomar un humano (no yo)

- **[#10]** ¿RR v6 + vite-react-ssg (stack de empresa, patrón probado, y el caso de uso que
  la librería declara que seguirá manteniendo) o RR v7 con SSG nativo (lo que la doc oficial
  recomienda a quien ya está en v7)? **Mi lectura**: quedarse en v6 + vite-react-ssg —
  coincide con la norma y con lo que la propia librería soporta. Pero es decisión de norma.
- **Versión de `vite-react-ssg`**: WebEmpresa fija `0.9.0` (2026-02-05); el `latest` es
  `0.9.2` (2026-07-15, **publicada hoy mismo**). **Mi lectura**: arrancar con `0.9.0`, la
  misma que el repo base —es lo que está probado y evita ser cobaya de una release del día—
  y evaluar la subida por separado con el CHANGELOG delante (**[DESCONOCIDO] #5**).
- **Dominio real del salón**: hace falta antes de escribir `SITE.url`, `canonical`,
  `robots.txt` y `sitemap.xml`. Hoy es **[DESCONOCIDO]**.
