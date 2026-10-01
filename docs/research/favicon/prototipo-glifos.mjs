// Extrae el contorno REAL de glifos de Great Vibes (WOFF1 → sfnt → glyf) como path SVG.
// Uso: node glifos.mjs <ruta.woff> <caracteres>
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

const [, , ruta, chars] = process.argv
const woff = readFileSync(ruta)
const tablas = {}
for (let i = 0; i < woff.readUInt16BE(12); i++) {
  const o = 44 + i * 20
  const tag = woff.toString('ascii', o, o + 4)
  const off = woff.readUInt32BE(o + 4)
  const comp = woff.readUInt32BE(o + 8)
  const orig = woff.readUInt32BE(o + 12)
  const datos = woff.subarray(off, off + comp)
  tablas[tag] = comp < orig ? inflateSync(datos) : datos
}

const head = tablas.head
const unidades = head.readUInt16BE(18)
const locaLarga = head.readInt16BE(50) === 1

// cmap formato 4
function glifoDe(cp) {
  const cmap = tablas.cmap
  const n = cmap.readUInt16BE(2)
  for (let i = 0; i < n; i++) {
    const off = cmap.readUInt32BE(4 + i * 8 + 4)
    if (cmap.readUInt16BE(off) !== 4) continue
    const segX2 = cmap.readUInt16BE(off + 6)
    const ends = off + 14
    const starts = ends + segX2 + 2
    const deltas = starts + segX2
    const rangos = deltas + segX2
    for (let s = 0; s < segX2 / 2; s++) {
      const fin = cmap.readUInt16BE(ends + s * 2)
      const ini = cmap.readUInt16BE(starts + s * 2)
      if (cp < ini || cp > fin) continue
      const delta = cmap.readInt16BE(deltas + s * 2)
      const ro = cmap.readUInt16BE(rangos + s * 2)
      if (ro === 0) return (cp + delta) & 0xffff
      const g = cmap.readUInt16BE(rangos + s * 2 + ro + (cp - ini) * 2)
      return g === 0 ? 0 : (g + delta) & 0xffff
    }
  }
  return 0
}

function offsetGlifo(g) {
  const loca = tablas.loca
  return locaLarga
    ? [loca.readUInt32BE(g * 4), loca.readUInt32BE(g * 4 + 4)]
    : [loca.readUInt16BE(g * 2) * 2, loca.readUInt16BE(g * 2 + 2) * 2]
}

function avance(g) {
  const nh = tablas.hhea.readUInt16BE(34)
  const i = Math.min(g, nh - 1)
  return tablas.hmtx.readUInt16BE(i * 4)
}

function contornos(g) {
  const [a, b] = offsetGlifo(g)
  if (a === b) return []
  const d = tablas.glyf.subarray(a, b)
  const nc = d.readInt16BE(0)
  if (nc < 0) throw new Error('glifo compuesto: no soportado')
  const finales = []
  for (let i = 0; i < nc; i++) finales.push(d.readUInt16BE(10 + i * 2))
  const np = finales[nc - 1] + 1
  let p = 10 + nc * 2
  p += 2 + d.readUInt16BE(p)
  const flags = []
  while (flags.length < np) {
    const f = d[p++]
    flags.push(f)
    if (f & 8) {
      let r = d[p++]
      while (r--) flags.push(f)
    }
  }
  const xs = []
  let x = 0
  for (const f of flags) {
    if (f & 2) x += f & 16 ? d[p++] : -d[p++]
    else if (!(f & 16)) {
      x += d.readInt16BE(p)
      p += 2
    }
    xs.push(x)
  }
  const ys = []
  let y = 0
  for (const f of flags) {
    if (f & 4) y += f & 32 ? d[p++] : -d[p++]
    else if (!(f & 32)) {
      y += d.readInt16BE(p)
      p += 2
    }
    ys.push(y)
  }
  const res = []
  let ini = 0
  for (const fin of finales) {
    const pts = []
    for (let i = ini; i <= fin; i++) pts.push({ x: xs[i], y: -ys[i], on: (flags[i] & 1) === 1 })
    res.push(pts)
    ini = fin + 1
  }
  return res
}

const r = (v) => Math.round(v * 10) / 10
function pathDe(cs, dx = 0) {
  let s = ''
  for (const pts of cs) {
    // Empieza en un punto ON (o en el medio implícito de dos OFF).
    let k = pts.findIndex((q) => q.on)
    let inicio
    if (k === -1) {
      inicio = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
      k = 0
    } else inicio = pts[k]
    const orden = [...pts.slice(k), ...pts.slice(0, k)]
    s += `M${r(inicio.x + dx)} ${r(inicio.y)}`
    let ctrl = null
    for (let i = 1; i <= orden.length; i++) {
      const q = orden[i % orden.length]
      if (q.on) {
        s += ctrl
          ? `Q${r(ctrl.x + dx)} ${r(ctrl.y)} ${r(q.x + dx)} ${r(q.y)}`
          : `L${r(q.x + dx)} ${r(q.y)}`
        ctrl = null
      } else if (ctrl) {
        const m = { x: (ctrl.x + q.x) / 2, y: (ctrl.y + q.y) / 2 }
        s += `Q${r(ctrl.x + dx)} ${r(ctrl.y)} ${r(m.x + dx)} ${r(m.y)}`
        ctrl = q
      } else ctrl = q
    }
    if (ctrl) s += `Q${r(ctrl.x + dx)} ${r(ctrl.y)} ${r(inicio.x + dx)} ${r(inicio.y)}`
    s += 'Z'
  }
  return s
}

const salida = { unidades, glifos: {} }
for (const c of chars) {
  const g = glifoDe(c.codePointAt(0))
  const cs = contornos(g)
  const todos = cs.flat()
  salida.glifos[c] = {
    g,
    avance: avance(g),
    caja: todos.length
      ? [
          Math.min(...todos.map((q) => q.x)),
          Math.min(...todos.map((q) => q.y)),
          Math.max(...todos.map((q) => q.x)),
          Math.max(...todos.map((q) => q.y)),
        ]
      : null,
    d: pathDe(cs),
  }
}
console.log(JSON.stringify(salida))
