// @s9 [EN VIVO] — Chromium REAL con ventana, perfil NUEVO por sitio, red y consola registradas desde
// antes de navegar. Sitio REAL (copia fija de dist/) y CONTRAPRUEBA (la misma copia sin los 3 <link>).
import { chromium } from 'playwright-core'
import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { servir } from './servidor.mjs'

const V = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1')
const REPO = process.env.REPO
const CHROME = process.env.CHROME
const PREFIJO = '/NailsLashStudioWeb/'
const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const salida = { fecha: new Date().toISOString(), chrome: CHROME }

// 1) ¿`vite preview` da 404 fuera de la base? (la spec lo deja [I, se mide])
{
  const vite = spawn(
    process.execPath,
    [
      path.join(REPO, 'node_modules/vite/bin/vite.js'),
      'preview',
      '--outDir',
      path.join(V, process.env.DIR_REAL ?? 'dist-real'),
      '--port',
      '4180',
      '--strictPort',
      '--host',
      '127.0.0.1',
    ],
    { cwd: REPO },
  )
  let listo = false
  for (let i = 0; i < 60 && !listo; i++) {
    try {
      await fetch('http://127.0.0.1:4180/NailsLashStudioWeb/')
      listo = true
    } catch {
      await espera(250)
    }
  }
  const sondas = {}
  for (const r of [
    '/favicon.ico',
    '/NailsLashStudioWeb/favicon.svg',
    '/NailsLashStudioWeb/favicon.ico',
    '/NailsLashStudioWeb/',
    '/no-existe.png',
    '/NailsLashStudioWeb/no-existe.png',
  ]) {
    const res = await fetch('http://127.0.0.1:4180' + r, { redirect: 'manual' })
    sondas[r] = { estado: res.status, tipo: res.headers.get('content-type') }
  }
  vite.kill()
  salida.vitePreview = { listo, sondas }
}

// 2) Contraprueba: quitar EXACTAMENTE los 3 <link> de icono del index.html de la copia.
{
  const f = path.join(V, process.env.DIR_CONTRA ?? 'dist-contraprueba', 'index.html')
  const html = readFileSync(f, 'utf8')
  const re = /<link\b[^>]*\brel="(?:icon|apple-touch-icon)"[^>]*>/g
  const quitados = html.match(re) ?? []
  const nuevo = html.replace(re, '')
  writeFileSync(f, nuevo)
  salida.contraprueba = {
    quitados,
    quedan: (nuevo.match(/rel="(?:icon|apple-touch-icon)"/g) ?? []).length,
  }
}

async function visitar(nombre, raiz, puerto) {
  const { servidor, registro } = await servir({ montajes: [{ prefijo: PREFIJO, raiz }], puerto })
  const perfil = mkdtempSync(path.join(os.tmpdir(), `perfil-s9-${nombre}-`))
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
  const red = [],
    consola = [],
    fallos = []
  ctx.on('request', (q) => red.push({ fase: 'request', url: q.url() }))
  ctx.on('response', (r) => red.push({ fase: 'response', url: r.url(), estado: r.status() }))
  ctx.on('requestfailed', (q) => fallos.push({ url: q.url(), error: q.failure()?.errorText }))
  const page = ctx.pages()[0] ?? (await ctx.newPage())
  page.on('console', (m) =>
    consola.push({ tipo: m.type(), texto: m.text(), url: m.location()?.url }),
  )
  page.on('pageerror', (e) => consola.push({ tipo: 'pageerror', texto: String(e) }))
  const url = `http://127.0.0.1:${puerto}${PREFIJO}`
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForLoadState('networkidle')
  for (let i = 0; i < 40 && !registro.some((r) => /favicon|apple-touch/.test(r.ruta)); i++)
    await espera(250)
  await espera(2000)
  await page.bringToFront()
  const cdp = await ctx.newCDPSession(page)
  const { bounds } = await cdp.send('Browser.getWindowForTarget')
  const dpr = await page.evaluate(() => devicePixelRatio)
  const dom = await page.evaluate(() => ({
    titulo: document.title,
    iconos: [...document.querySelectorAll('link')]
      .filter((l) => /(^|\s)(icon|apple-touch-icon)(\s|$)/i.test(l.rel))
      .map((l) => ({ rel: l.rel, href: l.getAttribute('href') })),
  }))
  const capturas = (() => {
    const out = path.join(V, 's9-' + nombre + '-pestana.png')
    const r = spawnSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        path.join(V, 'captura-ventana.ps1'),
        '-exe',
        CHROME,
        '-out',
        path.join(V, 's9-' + nombre + '-ventana.png'),
        '-outRecorte',
        out,
        '-recorteW',
        String(Math.round(520 * dpr)),
        '-recorteH',
        String(Math.round(90 * dpr)),
      ],
      { encoding: 'utf8' },
    )
    return [{ out, ok: r.status === 0, salida: r.stdout?.trim(), err: r.stderr?.trim() }]
  })()
  await ctx.close()
  servidor.close()
  return { url, bounds, dpr, dom, registro, red, fallos, consola, capturas }
}

salida.real = await visitar('real', path.join(V, process.env.DIR_REAL ?? 'dist-real'), 4181)
salida.contraprueba.visita = await visitar(
  'contraprueba',
  path.join(V, process.env.DIR_CONTRA ?? 'dist-contraprueba'),
  4182,
)

const juicio = (v) => ({
  peticionesIcono: v.registro
    .filter((r) => /favicon|apple-touch/.test(r.ruta))
    .map((r) => `${r.estado} ${r.ruta}`),
  svg200: v.registro.some((r) => r.ruta === PREFIJO + 'favicon.svg' && r.estado === 200),
  raizFaviconIco: v.registro.filter((r) => r.ruta === '/favicon.ico').map((r) => r.estado),
  servidor404: v.registro.filter((r) => r.estado === 404).map((r) => r.ruta),
  red404: v.red.filter((x) => x.fase === 'response' && x.estado === 404).map((x) => x.url),
  consola404: v.consola
    .filter((c) => /Failed to load resource/i.test(c.texto) && /404/.test(c.texto))
    .map((c) => `${c.texto} @ ${c.url}`),
  consolaErroresYAvisos: v.consola
    .filter((c) => c.tipo === 'error' || c.tipo === 'warning' || c.tipo === 'pageerror')
    .map((c) => `[${c.tipo}] ${c.texto}`),
  totalPeticionesServidor: v.registro.length,
})
salida.juicio = { real: juicio(salida.real), contraprueba: juicio(salida.contraprueba.visita) }
writeFileSync(path.join(V, 'resultado-s9.json'), JSON.stringify(salida, null, 2))
console.log(
  JSON.stringify(
    {
      vitePreview: salida.vitePreview,
      contraprueba: {
        quitados: salida.contraprueba.quitados.length,
        quedan: salida.contraprueba.quedan,
      },
      juicio: salida.juicio,
      dom: salida.real.dom,
      dpr: salida.real.dpr,
      bounds: salida.real.bounds,
      capturas: salida.real.capturas,
    },
    null,
    2,
  ),
)
