// @s9 sobre la web PUBLICADA (GitHub Pages): Chromium real con ventana, perfil nuevo; consola registrada
// desde antes de navegar; sondas HTTP directas a las rutas de icono (sin caché).
import { chromium } from 'playwright-core'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const V = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1')
const URL_WEB = process.env.URL_WEB,
  CHROME = process.env.CHROME,
  ETIQUETA = process.env.ETIQUETA ?? 'web'
const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const origen = new URL(URL_WEB).origin
const sondas = {}
for (const r of [
  '/favicon.ico',
  new URL(URL_WEB).pathname + 'favicon.svg',
  new URL(URL_WEB).pathname + 'favicon.ico',
  new URL(URL_WEB).pathname + 'apple-touch-icon.png',
]) {
  const res = await fetch(origen + r, { cache: 'no-store', redirect: 'manual' })
  sondas[r] = { estado: res.status, tipo: res.headers.get('content-type') }
}
const perfil = mkdtempSync(path.join(os.tmpdir(), `perfil-s9w-${ETIQUETA}-`))
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
const consola = [],
  respuestas = []
ctx.on('response', (r) => respuestas.push({ url: r.url(), estado: r.status() }))
const page = ctx.pages()[0] ?? (await ctx.newPage())
page.on('console', (m) => consola.push({ tipo: m.type(), texto: m.text(), url: m.location()?.url }))
page.on('pageerror', (e) => consola.push({ tipo: 'pageerror', texto: String(e) }))
await page.goto(URL_WEB, { waitUntil: 'load' })
await page.waitForLoadState('networkidle')
await espera(5000)
await page.bringToFront()
const cdp = await ctx.newCDPSession(page)
const { bounds } = await cdp.send('Browser.getWindowForTarget')
const dpr = await page.evaluate(() => devicePixelRatio)
const dom = await page.evaluate(() =>
  [...document.querySelectorAll('link')]
    .filter((l) => /(^|\s)(icon|apple-touch-icon)(\s|$)/i.test(l.rel))
    .map((l) => `${l.rel} ${l.getAttribute('href')}`),
)
const out = path.join(V, `s9w-${ETIQUETA}-pestana.png`)
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
const salida = {
  fecha: new Date().toISOString(),
  url: URL_WEB,
  sondas,
  iconosEnDom: dom,
  captura: out,
  respuestas404: respuestas.filter((r) => r.estado === 404).map((r) => r.url),
  consola404: consola
    .filter((c) => /Failed to load resource/i.test(c.texto) && /404/.test(c.texto))
    .map((c) => `${c.texto} @ ${c.url}`),
  consolaErroresYAvisos: consola
    .filter((c) => ['error', 'warning', 'pageerror'].includes(c.tipo))
    .map((c) => `[${c.tipo}] ${c.texto} @ ${c.url ?? ''}`),
  totalRespuestas: respuestas.length,
}
writeFileSync(path.join(V, `resultado-s9w-${ETIQUETA}.json`), JSON.stringify(salida, null, 2))
console.log(JSON.stringify(salida, null, 2))
