import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { beforeAll, describe, expect, it } from 'vitest'

/**
 * F-04 @s32 y @s33 — LAS DOS TRAMPAS QUE ANCLAN EL PORQUÉ. Sin ellas, alguien las revierte.
 *
 * 🔴🔴 ESTE FICHERO NO IMPORTA NADA DE `src/lib/`, Y ES DELIBERADO. Corre BUILDS SSG REALES
 * (lentos) y ejecuta la puerta COMO SUBPROCESO. Si importara la puerta, Stryker lo contaría como
 * cobertura de `puerta-cascaron.ts` y lo re-ejecutaría POR CADA MUTANTE: ~200 builds → horas y
 * TIMEOUTS. Y «un informe de mutación con timeouts MIENTE» (docs/verification.md, regla dura del
 * arnés que ya mordió en F-01 y F-03). El veredicto de la puerta se obtiene por `exit code` y
 * `stdout/stderr` del subproceso, que es además la prueba MÁS FUERTE: es el build de verdad.
 */
const DIRECTORIO_DE_EXPERIMENTOS = '.experimentos-tmp'

const VITE_CONFIG = `import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({ plugins: [react()] })
`

const MAIN = `import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './App'

export const createRoot = ViteReactSSG({ routes })
`

const APP = `import type { RouteRecord } from 'vite-react-ssg'
import Home from './pages/home'

export const routes: RouteRecord[] = [{ path: '/', Component: Home, entry: 'src/pages/home.tsx' }]
`

/** La cáscara CORRECTA: el `<Head>` de vite-react-ssg. Es la de producción, en pequeño. */
const HOME_CON_HEAD = `import { Head } from 'vite-react-ssg'

export default function Home() {
  return (
    <>
      <Head>
        <title>Nails Lash Studio</title>
        <meta name="description" content="Estudio de uñas, pestañas y cejas." />
        <link rel="canonical" href="https://example.invalid/" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BeautySalon',
            name: 'Nails Lash Studio',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Av. de Atenas 75, Local 41',
              postalCode: '28232',
              addressLocality: 'Las Rozas de Madrid',
            },
            geo: { latitude: 40.5179875, longitude: -3.9226688 },
          })}
        </script>
      </Head>
      <nav><a href="/">Inicio</a></nav>
      <main><h1>Nails Lash Studio</h1></main>
      <footer>Nails Lash Studio</footer>
    </>
  )
}
`

/**
 * 🔴 LA CÁSCARA ENVENENADA: METADATA NATIVA DE REACT 19, SIN `<Head>`. Es EXACTAMENTE lo que
 * escribiría alguien que no conoce la trampa — y es lo que deja el `<head>` del build VACÍO.
 */
const HOME_CON_METADATA_NATIVA = `export default function Home() {
  return (
    <>
      <title>Nails Lash Studio</title>
      <meta name="description" content="Estudio de uñas, pestañas y cejas." />
      <link rel="canonical" href="https://example.invalid/" />
      <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BeautySalon',
            name: 'Nails Lash Studio',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Av. de Atenas 75, Local 41',
              postalCode: '28232',
              addressLocality: 'Las Rozas de Madrid',
            },
            geo: { latitude: 40.5179875, longitude: -3.9226688 },
          })}
        </script>
      <nav><a href="/">Inicio</a></nav>
      <main><h1>Nails Lash Studio</h1></main>
      <footer>Nails Lash Studio</footer>
    </>
  )
}
`

const indexHtmlCon = (head: string): string => `<!doctype html>
<html lang="es">
  ${head}
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`

interface Experimento {
  readonly html: string
  readonly salida: string
  readonly codigoSalida: number
}

const experimentos = new Map<string, Experimento>()

function construirExperimento(nombre: string, indexHtml: string, home: string): Experimento {
  const dir = resolve(DIRECTORIO_DE_EXPERIMENTOS, nombre)

  rmSync(dir, { recursive: true, force: true })
  mkdirSync(resolve(dir, 'src/pages'), { recursive: true })
  writeFileSync(resolve(dir, 'index.html'), indexHtml)
  writeFileSync(resolve(dir, 'vite.config.ts'), VITE_CONFIG)
  writeFileSync(resolve(dir, 'src/main.tsx'), MAIN)
  writeFileSync(resolve(dir, 'src/App.tsx'), APP)
  writeFileSync(resolve(dir, 'src/pages/home.tsx'), home)

  // El build SSG REAL. Si vite-react-ssg lanzara por sí mismo, @s33 sobraría: su 1er `Then` es
  // justo que NO SE QUEJA. Que esto no lance es parte de la aserción.
  execFileSync('pnpm', ['exec', 'vite-react-ssg', 'build'], {
    cwd: dir,
    stdio: 'pipe',
    shell: true,
  })

  const html = readFileSync(resolve(dir, 'dist/index.html'), 'utf8')

  // LA PUERTA, COMO SUBPROCESO: `cwd` en el experimento, así su `dist` relativo es el de aquí.
  let salida = ''
  let codigoSalida = 0

  try {
    salida = execFileSync(
      'node',
      [
        '--experimental-strip-types',
        '--disable-warning=ExperimentalWarning',
        resolve('tools/puerta-cascaron.ts'),
      ],
      { cwd: dir, stdio: 'pipe', shell: true },
    ).toString()
  } catch (error: unknown) {
    const fallo = error as { status: number; stdout: Buffer; stderr: Buffer }

    codigoSalida = fallo.status
    salida = `${fallo.stdout.toString()}${fallo.stderr.toString()}`
  }

  return { html, salida, codigoSalida }
}

beforeAll(() => {
  experimentos.set(
    'react19-nativa',
    construirExperimento('react19-nativa', indexHtmlCon('<head>'), HOME_CON_METADATA_NATIVA),
  )

  for (const [nombre, head] of [
    ['head-espacio', '<head >'],
    ['head-mayusculas', '<HEAD>'],
    ['head-atributo', '<head lang="es">'],
  ]) {
    experimentos.set(nombre, construirExperimento(nombre, indexHtmlCon(head), HOME_CON_HEAD))
  }

  experimentos.set(
    'head-correcto',
    construirExperimento('head-correcto', indexHtmlCon('<head>'), HOME_CON_HEAD),
  )
}, 300_000)

const experimento = (nombre: string): Experimento => experimentos.get(nombre) as Experimento

/**
 * 🔴🔴 ESTE ESCENARIO ES LA FEATURE ENTERA. NO LO BORRES «PORQUE ES RARO».
 *
 * EL MECANISMO, verificado contra el CÓDIGO REALMENTE INSTALADO (`vite-react-ssg` 0.9.0), no
 * contra el README ni contra `main`: `extractHelmet` lee EXCLUSIVAMENTE del contexto de Helmet;
 * el parámetro `html` (= `appHTML`) SOLO alimenta al `styleCollector` y NUNCA se parsea buscando
 * metadata [V: :429-446]. Auditados los DOS ÚNICOS escritores del `<head>` del dist
 * (`metaAttributes` :122-124 y `styleTag` :920): NO EXISTE NINGUNA RUTA DE CÓDIGO por la que un
 * `<title>`/`<meta>` hoisteado por React 19 entre en el `<head>` prerenderizado.
 *
 * Es el patrón de `.memoria-cache/patterns/` → `red-css-para-rama-solo-js-en-ssg`: bajo SSG el
 * HTML horneado CONGELA el estado que el JS de cliente iba a corregir. YA HA MORDIDO 3 VECES EN
 * WEBEMPRESA. AQUÍ MORDERÍA UNA CUARTA.
 */
describe('@s32 la metadata NATIVA de React 19 deja el <head> de dist/ VACÍO', () => {
  it('@s32 el <head> del HTML CRUDO de dist/ NO contiene ningún <title> ni ninguna description', () => {
    const { html } = experimento('react19-nativa')
    const cabeza = html.slice(html.indexOf('<head>'), html.indexOf('</head>'))

    expect(cabeza).not.toMatch(/<title/i)
    expect(cabeza).not.toMatch(/name="description"/i)
  })

  /**
   * 🔴 HALLAZGO MEDIDO SOBRE EL BUILD REAL, Y CORRIGE LA LETRA DE @s32.
   *
   * El `.feature` dice «el HTML CRUDO de dist/ NO contiene ningún <title>». **ES FALSO, Y LO
   * ACABAMOS DE MEDIR**: `renderToString` NO hoistea la metadata de React 19 al `<head>` —
   * LA EMITE DENTRO DEL `<body>`, donde está el componente. El artefacto SÍ contiene el
   * `<title>`; lo que está VACÍO es el `<head>`, que es lo que el mecanismo verificado siempre
   * dijo («el <head> del build sale VACÍO») y lo único que importa para el SEO.
   *
   * NO ES UN MATIZ COSMÉTICO: una puerta que buscara el `<title>` en el DOCUMENTO ENTERO lo
   * encontraría en el `<body>` y DARÍA EL BUILD POR BUENO — o sea, sería tan ciega como jsdom
   * al único bug que esta feature existe para prevenir. Esta aserción es la que obliga a que
   * `cabezaDe()` exista, y la que mata al mutante que la quite.
   */
  it('@s32 el <title> SÍ está en el artefacto, pero DENTRO DEL <body>: por eso la puerta mira el <head>', () => {
    const { html } = experimento('react19-nativa')
    const cuerpo = html.slice(html.indexOf('<body>'))

    expect(cuerpo).toMatch(/<title/i)
    expect(cuerpo).toMatch(/name="description"/i)
  })

  it('@s32 la puerta emite violación por "title ausente o vacío" y por "description ausente o vacía"', () => {
    const { salida } = experimento('react19-nativa')

    expect(salida).toContain('title ausente o vacío')
    expect(salida).toContain('description ausente o vacía')
  })

  it('@s32 el código de salida del build es distinto de 0', () => {
    expect(experimento('react19-nativa').codigoSalida).not.toBe(0)
  })

  /**
   * 🔴 EL `And` QUE JUSTIFICA LA ARQUITECTURA ENTERA. `react-helmet-async` TAMBIÉN hace efecto
   * sobre `document.head` en cliente, y React 19 TAMBIÉN hoistea al hidratar → LOS DOS CAMINOS
   * DAN VERDE EN JSDOM. jsdom es EXACTAMENTE CIEGO al único bug que esta feature existe para
   * prevenir. Testing Library aquí no es «insuficiente»: es INCAPAZ POR CONSTRUCCIÓN.
   * VERDE EN `dev`, VERDE EN JSDOM, SEO CERO EN PRODUCCIÓN.
   */
  it('@s32 jsdom SÍ ve el title y la description: DA VERDE SOBRE ESTA MISMA VIOLACIÓN', async () => {
    const { render } = await import('@testing-library/react')

    function PaginaConMetadataNativa() {
      return (
        <>
          <title>Nails Lash Studio</title>
          <meta name="description" content="Estudio de uñas, pestañas y cejas." />
          <main>
            <h1>Nails Lash Studio</h1>
          </main>
        </>
      )
    }

    render(<PaginaConMetadataNativa />)

    // React 19 hoistea su metadata al `document.head` en cliente. Esto es VERDE...
    expect(document.head.querySelector('title')?.textContent).toBe('Nails Lash Studio')
    expect(document.head.querySelector('meta[name="description"]')).not.toBeNull()

    // ...MIENTRAS EL `dist/` DE ESA MISMA PÁGINA SALE CON EL `<head>` VACÍO. Los dos asertos de
    // este `it` son la MISMA página y dan veredictos OPUESTOS: por eso la entrada de la puerta
    // son LOS BYTES de dist/, y jamás un render del árbol de componentes.
    const { html } = experimento('react19-nativa')

    expect(html.slice(html.indexOf('<head>'), html.indexOf('</head>'))).not.toMatch(/<title/i)
  })
})

/**
 * 🔴 T2 — LA INYECCIÓN ES UN `replace()` LITERAL QUE FALLA EN SILENCIO.
 * `indexHTML.replace('<head>', '<head>' + metaTags)` es MATCH DE STRING EXACTO, y
 * `String.replace` con un string NO LANZA SI NO ENCUENTRA: devuelve el HTML INTACTO [V:
 * :122-124]. Ninguno de los tres literales de la tabla casa → LA INYECCIÓN NO OCURRE, EL BUILD
 * SIGUE VERDE Y EL `<head>` SALE VACÍO. Verde por vacuidad, un nivel más abajo que @s26.
 *
 * ✅ BUENA NOTICIA DE DISEÑO: la puerta ya lo caza POR CONSTRUCCIÓN — sin `<head>` inyectado
 * faltan A LA VEZ title, description, canónica y JSON-LD. ESTE ESCENARIO NO AÑADE UNA REGLA
 * NUEVA: ANCLA EL PORQUÉ. Sin él, alguien «normaliza» el `index.html` a `<head lang="es">`
 * dentro de seis meses, ve los tests en rojo y CAMBIA LOS TESTS.
 */
describe('@s33 pinchar el literal <head> rompe la inyección EN SILENCIO, y la puerta lo caza', () => {
  it.each([
    ['head-espacio', '<head >', 'un espacio de más'],
    ['head-mayusculas', '<HEAD>', 'otra caja'],
    ['head-atributo', '<head lang="es">', 'un atributo'],
  ])('@s33 con %s el build NO se queja, el <head> sale vacío y la puerta rompe', (nombre) => {
    const { html, salida, codigoSalida } = experimento(nombre)

    // EL 1er `Then` ES EL CORAZÓN DEL ESCENARIO: el build NO LANZA por sí mismo. Ese silencio es
    // todo el problema; si `vite-react-ssg` lanzara, este escenario sobraría. (Que hayamos
    // llegado hasta aquí lo demuestra: `construirExperimento` habría lanzado en el build.)
    expect(html).not.toMatch(/<title/i)
    expect(html).not.toMatch(/name="description"/i)
    expect(html).not.toMatch(/rel="canonical"/i)
    expect(html).not.toMatch(/application\/ld\+json/i)

    // La puerta emite violación por title, por description, por canónica y por JSON-LD ausentes.
    expect(salida).toContain('title ausente o vacío')
    expect(salida).toContain('description ausente o vacía')
    expect(salida).toContain('canónica ausente')
    expect(salida).toContain('JSON-LD ausente')
    expect(codigoSalida).not.toBe(0)
  })

  // EL CONTRATO FIJA que `index.html` contenga el literal EXACTO `<head>`, en MINÚSCULAS y SIN
  // ATRIBUTOS — y que NO contenga ningún `<title>` estático (si alguien lo añadiera habría DOS,
  // porque Helmet inyecta el suyo justo DESPUÉS de `<head>` y NO DEDUPLICA [V]: es el límite T3).
  it('@s33 el index.html REAL del repo contiene el literal exacto "<head>" y ningún <title>', () => {
    const indexReal = readFileSync('index.html', 'utf8')

    expect(indexReal).toContain('<head>')
    expect(indexReal).not.toMatch(/<title/i)
  })

  // El control: con el `<head>` correcto, la MISMA cáscara SÍ hornea. Sin esta fila, las tres de
  // arriba pasarían aunque la cáscara estuviera rota por otra razón.
  it('@s33 con el literal "<head>" correcto la MISMA cáscara SÍ hornea, y la puerta pasa', () => {
    const { html, codigoSalida } = experimento('head-correcto')

    expect(html).toMatch(/<title/i)
    expect(html).toMatch(/name="description"/i)
    expect(codigoSalida).toBe(0)
  })
})
