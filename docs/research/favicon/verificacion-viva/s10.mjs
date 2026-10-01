// @s10 [EN VIVO] — Chromium REAL dibuja favicon.svg (con y sin trazo) en un canvas transparente de
// 16, 32 y 180 px; los raster del ICO y del apple-touch-icon se decodifican en Node (zlib, bytes
// exactos). C = Σ t·α/255, t = proyección del RGB sobre soft → ink (de _tokens.scss) en [0, 1].
import { chromium } from 'playwright-core'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { inflateSync } from 'node:zlib'

const V = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1')
const REPO = process.env.REPO
const CHROME = process.env.CHROME
const SABOTAJE = process.env.SIN_TRAZO_DIR // rasters SIN trazo del tdd_craftsman (sabotaje 9)

const tokens = readFileSync(path.join(REPO, 'src/styles/_tokens.scss'), 'utf8')
const hex = (n) => {
  const m = tokens.match(new RegExp('--' + n + ':[ 	]*(#[0-9a-fA-F]{6})[ 	]*;'))
  return m[1]
}
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const SOFT = rgb(hex('accent-soft')),
  INK = rgb(hex('ink'))

function cobertura(px) {
  // px: Uint8 RGBA
  const d = INK.map((v, i) => v - SOFT[i])
  const dd = d[0] ** 2 + d[1] ** 2 + d[2] ** 2
  let C = 0
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3]
    if (!a) continue
    let t =
      ((px[i] - SOFT[0]) * d[0] + (px[i + 1] - SOFT[1]) * d[1] + (px[i + 2] - SOFT[2]) * d[2]) / dd
    t = Math.min(1, Math.max(0, t))
    C += (t * a) / 255
  }
  return C
}

function png(buf) {
  // decodificador mínimo: profundidad 8, sin entrelazado, tipo 2 (RGB) o 6 (RGBA)
  let o = 8,
    w,
    h,
    tipo
  const idat = []
  while (o < buf.length) {
    const len = buf.readUInt32BE(o),
      t = buf.toString('latin1', o + 4, o + 8),
      d = buf.subarray(o + 8, o + 8 + len)
    if (t === 'IHDR') {
      w = d.readUInt32BE(0)
      h = d.readUInt32BE(4)
      if (d[8] !== 8 || d[12] !== 0) throw new Error('PNG no soportado')
      tipo = d[9]
    }
    if (t === 'IDAT') idat.push(d)
    o += 12 + len
  }
  const bpp = tipo === 6 ? 4 : 3,
    raw = inflateSync(Buffer.concat(idat)),
    linea = w * bpp
  const out = Buffer.alloc(w * h * 4),
    prev = Buffer.alloc(linea),
    cur = Buffer.alloc(linea)
  for (let y = 0; y < h; y++) {
    const f = raw[y * (linea + 1)]
    raw.copy(cur, 0, y * (linea + 1) + 1, (y + 1) * (linea + 1))
    for (let x = 0; x < linea; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0,
        b = prev[x],
        c = x >= bpp ? prev[x - bpp] : 0
      const p = a + b - c,
        pa = Math.abs(p - a),
        pb = Math.abs(p - b),
        pc = Math.abs(p - c)
      const pred =
        f === 0
          ? 0
          : f === 1
            ? a
            : f === 2
              ? b
              : f === 3
                ? (a + b) >> 1
                : pa <= pb && pa <= pc
                  ? a
                  : pb <= pc
                    ? b
                    : c
      cur[x] = (cur[x] + pred) & 255
    }
    for (let x = 0; x < w; x++)
      for (let k = 0; k < 4; k++)
        out[(y * w + x) * 4 + k] = k < 3 || bpp === 4 ? cur[x * bpp + k] : 255
    cur.copy(prev)
  }
  return { w, h, tipo, px: out }
}
function ico(buf) {
  // { lado: png }
  const n = buf.readUInt16LE(4),
    r = {}
  for (let i = 0; i < n; i++) {
    const e = 6 + 16 * i,
      w = buf[e] || 256,
      size = buf.readUInt32LE(e + 8),
      off = buf.readUInt32LE(e + 12)
    r[w] = png(buf.subarray(off, off + size))
  }
  return r
}

// Ficheros medidos: la copia fija de dist/ que indique DIR_REAL (ver el informe, §0 y §3), comprobada byte a
// byte contra los objetos de git de REF:public/ (no contra el árbol de trabajo).
const md5 = (b) => createHash('md5').update(b).digest('hex')
const fich = {}
for (const f of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) {
  const b = readFileSync(path.join(V, process.env.DIR_REAL ?? 'dist-real', f))
  const head = execFileSync('git', ['show', `${process.env.REF ?? 'HEAD'}:public/${f}`], {
    cwd: REPO,
    maxBuffer: 1 << 24,
  })
  fich[f] = { b, md5: md5(b), igualAlCommit: md5(b) === md5(head) }
}
const svg = fich['favicon.svg'].b.toString('utf8')
const svgSin = svg.replace(/\s(stroke|stroke-width|stroke-linejoin)="[^"]*"/g, '')
const LADOS = [16, 32, 180]

const navegador = await chromium.launch({ executablePath: CHROME, headless: false })
const page = await navegador.newPage()
await page.setContent('<!doctype html><title>s10</title><body></body>')
const chromiumC = await page.evaluate(
  async ({ svg, svgSin, LADOS, SOFT, INK }) => {
    const d = INK.map((v, i) => v - SOFT[i])
    const dd = d[0] ** 2 + d[1] ** 2 + d[2] ** 2
    const C = (px) => {
      let s = 0
      for (let i = 0; i < px.length; i += 4) {
        const a = px[i + 3]
        if (!a) continue
        let t =
          ((px[i] - SOFT[0]) * d[0] + (px[i + 1] - SOFT[1]) * d[1] + (px[i + 2] - SOFT[2]) * d[2]) /
          dd
        t = Math.min(1, Math.max(0, t))
        s += (t * a) / 255
      }
      return s
    }
    const dibuja = async (texto, n) => {
      const url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' }))
      const img = new Image()
      img.src = url
      await img.decode()
      const cv = document.createElement('canvas')
      cv.width = n
      cv.height = n
      const cx = cv.getContext('2d', { willReadFrequently: true })
      cx.clearRect(0, 0, n, n)
      cx.drawImage(img, 0, 0, n, n)
      const px = cx.getImageData(0, 0, n, n).data
      URL.revokeObjectURL(url)
      let pintados = 0
      for (let i = 3; i < px.length; i += 4) if (px[i]) pintados++
      return { C: C(px), pintados, natural: [img.naturalWidth, img.naturalHeight] }
    }
    const r = {}
    for (const n of LADOS) r[n] = { con: await dibuja(svg, n), sin: await dibuja(svgSin, n) }
    return { r, ua: navigator.userAgent }
  },
  { svg, svgSin, LADOS, SOFT, INK },
)
await navegador.close()

const raster = {
  16: ico(fich['favicon.ico'].b)[16],
  32: ico(fich['favicon.ico'].b)[32],
  180: png(fich['apple-touch-icon.png'].b),
}
const filas = LADOS.map((n) => {
  const con = chromiumC.r[n].con.C,
    sin = chromiumC.r[n].sin.C,
    ras = cobertura(raster[n].px)
  return {
    lado: n,
    C_chromium_con: +con.toFixed(3),
    C_chromium_sin: +sin.toFixed(3),
    C_raster: +ras.toFixed(3),
    sin_entre_con: +(sin / con).toFixed(4),
    raster_entre_con: +(ras / con).toFixed(4),
    calibracion_ok: con > 0 && sin <= 0.8 * con,
    raster_ok: Math.abs(ras - con) <= 0.1 * con,
    pintados: chromiumC.r[n].con.pintados,
    natural: chromiumC.r[n].con.natural,
  }
})
let sabotaje9 = null
if (SABOTAJE && existsSync(path.join(SABOTAJE, 'favicon.ico'))) {
  const i = ico(readFileSync(path.join(SABOTAJE, 'favicon.ico'))),
    a = png(readFileSync(path.join(SABOTAJE, 'apple-touch-icon.png')))
  const rs = { 16: i[16], 32: i[32], 180: a }
  sabotaje9 = LADOS.map((n) => {
    const con = chromiumC.r[n].con.C,
      c = cobertura(rs[n].px)
    return {
      lado: n,
      C_raster_sin_trazo: +c.toFixed(3),
      cociente: +(c / con).toFixed(4),
      cazado: Math.abs(c - con) > 0.1 * con,
    }
  })
}
const salida = {
  fecha: new Date().toISOString(),
  ua: chromiumC.ua,
  soft: hex('accent-soft'),
  ink: hex('ink'),
  ficheros: Object.fromEntries(
    Object.entries(fich).map(([k, v]) => [k, { md5: v.md5, igualAlCommit: v.igualAlCommit }]),
  ),
  filas,
  sabotaje9,
}
writeFileSync(path.join(V, 'resultado-s10.json'), JSON.stringify(salida, null, 2))
console.log(JSON.stringify(salida, null, 2))
