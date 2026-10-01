// @s9 [EN VIVO] sobre `vite preview` (el contrato lo pide porque SÍ da 404 fuera de la base, medido en
// s9.mjs), con un proxy HTTP delante que registra cada petición: Playwright no expone la petición del
// favicon (la hace el proceso del navegador), así que el registro del proxy es la prueba del lado servidor.
import { chromium } from 'playwright-core'
import { spawn, spawnSync } from 'node:child_process'
import http from 'node:http'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const V = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1')
const REPO = process.env.REPO,
  CHROME = process.env.CHROME,
  PREFIJO = '/NailsLashStudioWeb/'
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

function proxy(puerto, destino) {
  const registro = []
  const servidor = http.createServer((req, res) => {
    const p = http.request(
      { host: '127.0.0.1', port: destino, path: req.url, method: req.method, headers: req.headers },
      (r) => {
        registro.push({ t: Date.now(), metodo: req.method, ruta: req.url, estado: r.statusCode })
        res.writeHead(r.statusCode, r.headers)
        r.pipe(res)
      },
    )
    p.on('error', (e) => {
      registro.push({ ruta: req.url, estado: 'ERROR ' + e.message })
      res.writeHead(502)
      res.end()
    })
    req.pipe(p)
  })
  return new Promise((ok) => servidor.listen(puerto, '127.0.0.1', () => ok({ servidor, registro })))
}

async function visitar(nombre, outDir, puerto) {
  const vite = spawn(
    process.execPath,
    [
      path.join(REPO, 'node_modules/vite/bin/vite.js'),
      'preview',
      '--outDir',
      outDir,
      '--port',
      String(puerto + 10),
      '--strictPort',
      '--host',
      '127.0.0.1',
    ],
    { cwd: REPO },
  )
  let listo = false
  for (let i = 0; i < 60 && !listo; i++) {
    try {
      await fetch(`http://127.0.0.1:${puerto + 10}${PREFIJO}`)
      listo = true
    } catch {
      await espera(250)
    }
  }
  const { servidor, registro } = await proxy(puerto, puerto + 10)
  const perfil = mkdtempSync(path.join(os.tmpdir(), `perfil-s9p-${nombre}-`))
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: null,
    args: [
      '--window-position=0,0',
      '--window-size=1280,860',
      '--no-first-run',
      '--no-default-browser-check',
    ],
  })
  const consola = []
  const page = ctx.pages()[0] ?? (await ctx.newPage())
  page.on('console', (m) =>
    consola.push({ tipo: m.type(), texto: m.text(), url: m.location()?.url }),
  )
  page.on('pageerror', (e) => consola.push({ tipo: 'pageerror', texto: String(e) }))
  await page.goto(`http://127.0.0.1:${puerto}${PREFIJO}`, { waitUntil: 'load' })
  await page.waitForLoadState('networkidle')
  for (let i = 0; i < 40 && !registro.some((r) => /favicon|apple-touch/.test(r.ruta)); i++)
    await espera(250)
  await espera(2000)
  await page.bringToFront()
  const cdp = await ctx.newCDPSession(page)
  const { bounds } = await cdp.send('Browser.getWindowForTarget')
  const dpr = await page.evaluate(() => devicePixelRatio)
  const out = path.join(V, `s9p-${nombre}-pestana.png`)
  spawnSync('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    path.join(V, 'captura-ventana.ps1'),
    '-exe',
    CHROME,
    '-out',
    out.replace(/pestana\.png$/, 'ventana.png').replace(/-ventana\.png$/, '-ventanapw.png'),
    '-outRecorte',
    out,
    '-recorteW',
    String(Math.round(520 * dpr)),
    '-recorteH',
    String(Math.round(90 * dpr)),
  ])
  await ctx.close()
  servidor.close()
  vite.kill()
  return {
    listo,
    captura: out,
    peticionesIcono: registro
      .filter((r) => /favicon|apple-touch/.test(r.ruta))
      .map((r) => `${r.estado} ${r.ruta}`),
    svg200: registro.some((r) => r.ruta === PREFIJO + 'favicon.svg' && r.estado === 200),
    raizFaviconIco: registro.filter((r) => r.ruta === '/favicon.ico').map((r) => r.estado),
    proxy404: registro.filter((r) => r.estado === 404).map((r) => r.ruta),
    consola404: consola
      .filter((c) => /Failed to load resource/i.test(c.texto) && /404/.test(c.texto))
      .map((c) => `${c.texto} @ ${c.url}`),
    consolaErroresYAvisos: consola
      .filter((c) => ['error', 'warning', 'pageerror'].includes(c.tipo))
      .map((c) => `[${c.tipo}] ${c.texto}`),
    totalPeticiones: registro.length,
  }
}
const iconosContra = (
  readFileSync(
    path.join(V, process.env.DIR_CONTRA ?? 'dist-contraprueba', 'index.html'),
    'utf8',
  ).match(/rel="(?:icon|apple-touch-icon)"/g) ?? []
).length
const salida = {
  fecha: new Date().toISOString(),
  iconosEnContraprueba: iconosContra,
  real: await visitar('real', path.join(V, process.env.DIR_REAL ?? 'dist-real'), 4191),
  contraprueba: await visitar(
    'contraprueba',
    path.join(V, process.env.DIR_CONTRA ?? 'dist-contraprueba'),
    4192,
  ),
}
writeFileSync(path.join(V, 'resultado-s9-preview.json'), JSON.stringify(salida, null, 2))
console.log(JSON.stringify(salida, null, 2))
