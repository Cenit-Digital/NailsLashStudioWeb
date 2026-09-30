// Generador del favicon de la marca — F-28 `favicon_marca`.
//
// QUÉ HACE: dibuja la «N» caligráfica de Great Vibes —la letra del rótulo del hero— en --ink sobre
// un cuadrado de esquinas redondeadas --accent-soft (el diseño «B» que aprobó Pablo, FM-1) y escribe
// los tres iconos que declara `index.html`:
//   · favicon.svg            el CONTORNO real del glifo (nada de <text>: un SVG usado como imagen no
//                            carga fuentes web), relleno + trazo de 18 con unión redonda.
//   · favicon.ico            ICO con dos PNG RGBA dentro, 16×16 y 32×32, esquinas transparentes.
//   · apple-touch-icon.png   180×180, RGB SIN alfa y A SANGRE: iOS pone su propia máscara y pinta
//                            de negro lo transparente.
//
// DE DÓNDE SALE CADA DATO (una sola fuente por dato, FM-6 / FM-7 / FS-4):
//   · la «N»: de la fuente AUTOALOJADA en node_modules (WOFF1 → sfnt → glyf). Nada de red.
//   · los colores: de --accent-soft y --ink en src/styles/_tokens.scss. Ningún hex a mano: si cambia
//     un token, los tests de F-28 se ponen rojos hasta volver a ejecutar esto.
//   · la geometría: margen del 13 % y radio del 20 % del lado, calculados sobre la caja del glifo
//     como en docs/research/favicon/prototipo-candidatos.mjs. Debe coincidir, por atributos, con el
//     oráculo docs/research/favicon/aprobado-B.svg (el `d`, idéntico como cadena).
//   · los raster: un rasterizador propio (regla NONZERO + medio trazo + supermuestreo) sobre el
//     MISMO `d` que se escribe en el SVG; PNG e ICO codificados a mano con node:zlib + CRC32
//     (precedente: tools/trazo-marca/aplicador.mjs). Cero dependencias.
//
// Sin tests ni mutación propios (como aplicador.mjs): lo verifican sus SALIDAS, en
// src/pages/favicon-marca.test.ts.
//
// Uso:  node tools/favicon/generar.mjs [--salida <dir>]     (por defecto, public/ del repo)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync, inflateSync } from 'node:zlib'

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const FUENTE = join(
  RAIZ,
  'node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff',
)
const TOKENS = join(RAIZ, 'src/styles/_tokens.scss')
const LETRA = 'N'
const MARGEN = 0.13 // por lado, sobre el lado del cuadrado (FM-1)
const RADIO = 0.2 // radio de las esquinas, sobre el lado (FM-1)
const GROSOR_TRAZO = 18 // en unidades de la fuente: engrosa las líneas finas a 16 px (FM-1)
const PASOS_POR_CURVA = 16 // subdivisión de cada Q al aplanar el contorno
const MUESTRAS = 8 // supermuestreo por eje: 8×8 = 64 muestras por píxel
const LADOS_ICO = [16, 32]
const LADO_APPLE = 180
const PNG_RGB = 2
const PNG_RGBA = 6
const BITS_POR_PIXEL_ICO = 32

// ── Argumentos ──────────────────────────────────────────────────────────────────────────
function directorioDeSalida(argv) {
  const i = argv.indexOf('--salida')
  if (i === -1) return join(RAIZ, 'public')
  const dir = argv[i + 1]
  if (!dir) throw new Error('--salida necesita un directorio')
  return resolve(dir)
}

// ── Fuente: WOFF1 → tablas sfnt ─────────────────────────────────────────────────────────
function leerWoff(ruta) {
  const woff = readFileSync(ruta)
  const tablas = {}
  for (let i = 0; i < woff.readUInt16BE(12); i++) {
    const o = 44 + i * 20
    const etiqueta = woff.toString('ascii', o, o + 4)
    const desde = woff.readUInt32BE(o + 4)
    const comprimida = woff.readUInt32BE(o + 8)
    const original = woff.readUInt32BE(o + 12)
    const datos = woff.subarray(desde, desde + comprimida)
    tablas[etiqueta] = comprimida < original ? inflateSync(datos) : datos
  }
  return tablas
}

// cmap de formato 4: del punto de código al índice de glifo.
function glifoDe(tablas, cp) {
  const cmap = tablas.cmap
  const subtablas = cmap.readUInt16BE(2)
  for (let i = 0; i < subtablas; i++) {
    const off = cmap.readUInt32BE(4 + i * 8 + 4)
    if (cmap.readUInt16BE(off) !== 4) continue
    const segX2 = cmap.readUInt16BE(off + 6)
    const finales = off + 14
    const inicios = finales + segX2 + 2
    const deltas = inicios + segX2
    const rangos = deltas + segX2
    for (let s = 0; s < segX2 / 2; s++) {
      const fin = cmap.readUInt16BE(finales + s * 2)
      const ini = cmap.readUInt16BE(inicios + s * 2)
      if (cp < ini || cp > fin) continue
      const delta = cmap.readInt16BE(deltas + s * 2)
      const ro = cmap.readUInt16BE(rangos + s * 2)
      if (ro === 0) return (cp + delta) & 0xffff
      const g = cmap.readUInt16BE(rangos + s * 2 + ro + (cp - ini) * 2)
      return g === 0 ? 0 : (g + delta) & 0xffff
    }
  }
  throw new Error(`la fuente no tiene glifo para U+${cp.toString(16)}`)
}

function rangoDelGlifo(tablas, g) {
  const loca = tablas.loca
  const locaLarga = tablas.head.readInt16BE(50) === 1
  return locaLarga
    ? [loca.readUInt32BE(g * 4), loca.readUInt32BE(g * 4 + 4)]
    : [loca.readUInt16BE(g * 2) * 2, loca.readUInt16BE(g * 2 + 2) * 2]
}

// Contornos del glifo simple: puntos { x, y, on } con la y ya invertida (y hacia abajo, como SVG).
function contornos(tablas, g) {
  const [a, b] = rangoDelGlifo(tablas, g)
  if (a === b) return []
  const d = tablas.glyf.subarray(a, b)
  const nc = d.readInt16BE(0)
  if (nc < 0) throw new Error('glifo compuesto: no soportado')
  const finales = []
  for (let i = 0; i < nc; i++) finales.push(d.readUInt16BE(10 + i * 2))
  const np = finales[nc - 1] + 1
  let p = 10 + nc * 2
  p += 2 + d.readUInt16BE(p) // salta las instrucciones de hinting
  const flags = []
  while (flags.length < np) {
    const f = d[p++]
    flags.push(f)
    if (f & 8) {
      let repeticiones = d[p++]
      while (repeticiones--) flags.push(f)
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

// El `d` con EXACTAMENTE el formato de números de prototipo-glifos.mjs (un decimal, sin ceros de
// relleno: «890.5», «147»). Si cambia el formato, el `d` deja de ser idéntico al del oráculo (@s2).
const redondeo = (v) => Math.round(v * 10) / 10
function pathDe(cs) {
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
    s += `M${redondeo(inicio.x)} ${redondeo(inicio.y)}`
    let ctrl = null
    for (let i = 1; i <= orden.length; i++) {
      const q = orden[i % orden.length]
      if (q.on) {
        s += ctrl
          ? `Q${redondeo(ctrl.x)} ${redondeo(ctrl.y)} ${redondeo(q.x)} ${redondeo(q.y)}`
          : `L${redondeo(q.x)} ${redondeo(q.y)}`
        ctrl = null
      } else if (ctrl) {
        const m = { x: (ctrl.x + q.x) / 2, y: (ctrl.y + q.y) / 2 }
        s += `Q${redondeo(ctrl.x)} ${redondeo(ctrl.y)} ${redondeo(m.x)} ${redondeo(m.y)}`
        ctrl = q
      } else ctrl = q
    }
    if (ctrl)
      s += `Q${redondeo(ctrl.x)} ${redondeo(ctrl.y)} ${redondeo(inicio.x)} ${redondeo(inicio.y)}`
    s += 'Z'
  }
  return s
}

// Caja de TODOS los puntos (ON y OFF), como el prototipo: de ella salen viewBox y rect.
function cajaDe(cs) {
  const todos = cs.flat()
  return [
    Math.min(...todos.map((q) => q.x)),
    Math.min(...todos.map((q) => q.y)),
    Math.max(...todos.map((q) => q.x)),
    Math.max(...todos.map((q) => q.y)),
  ]
}

// El cuadrado: el glifo centrado con MARGEN por lado; esquinas de RADIO · lado.
function geometria([x0, y0, x1, y1]) {
  const lado = Math.max(x1 - x0, y1 - y0) / (1 - 2 * MARGEN)
  const ladoEntero = Math.round(lado)
  return {
    x: Math.round((x0 + x1) / 2 - lado / 2),
    y: Math.round((y0 + y1) / 2 - lado / 2),
    lado: ladoEntero,
    rx: Math.round(ladoEntero * RADIO),
  }
}

// ── Colores: de _tokens.scss (FM-7) ─────────────────────────────────────────────────────
function leerColor(scss, nombre) {
  const declaracion = new RegExp(`(?<![\\w-])${nombre}\\s*:\\s*([^;]*);`, 'g')
  const halladas = [...scss.matchAll(declaracion)].map((m) => m[1].trim())
  if (halladas.length !== 1 || !/^#[0-9a-f]{6}$/i.test(halladas[0])) {
    throw new Error(`${nombre}: se esperaba UNA declaración #RRGGBB en _tokens.scss (${halladas})`)
  }
  return halladas[0]
}
const hexARgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

// ── SVG ─────────────────────────────────────────────────────────────────────────────────
// La cabecera no puede llevar «--» (prohibido dentro de un comentario XML), ni las cadenas
// vigiladas por @s3: ni «href», ni «http», ni «<svg».
const CABECERA_SVG =
  '<!-- Generado por tools/favicon/generar.mjs con la «N» de Great Vibes (fuente autoalojada) ' +
  'y los tokens accent-soft e ink de src/styles/_tokens.scss: no se edita a mano. -->'

function componerSvg({ d, geo, soft, ink }) {
  const { x, y, lado, rx } = geo
  const caja = `${x} ${y} ${lado} ${lado}`
  return (
    `${CABECERA_SVG}\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${caja}">` +
    `<rect x="${x}" y="${y}" width="${lado}" height="${lado}" rx="${rx}" fill="${soft}"/>` +
    `<path fill="${ink}" stroke="${ink}" stroke-width="${GROSOR_TRAZO}" stroke-linejoin="round" d="${d}"/>` +
    `</svg>\n`
  )
}

// ── Rasterizador ────────────────────────────────────────────────────────────────────────
// Aplana las Q (y L) del `d` —el MISMO que va en el SVG— en polilíneas cerradas.
function aplanar(d) {
  const polilineas = []
  let actual = null
  let px = 0
  let py = 0
  for (const [, orden, resto] of d.matchAll(/([MLQZ])([^MLQZ]*)/g)) {
    const n = resto.trim() ? resto.trim().split(/\s+/).map(Number) : []
    if (orden === 'M') {
      actual = [[n[0], n[1]]]
      polilineas.push(actual)
      ;[px, py] = n
    } else if (orden === 'L') {
      actual.push([n[0], n[1]])
      ;[px, py] = n
    } else if (orden === 'Q') {
      const [cx, cy, x, y] = n
      for (let k = 1; k <= PASOS_POR_CURVA; k++) {
        const t = k / PASOS_POR_CURVA
        const u = 1 - t
        actual.push([
          u * u * px + 2 * u * t * cx + t * t * x,
          u * u * py + 2 * u * t * cy + t * t * y,
        ])
      }
      px = x
      py = y
    }
    // «Z»: la polilínea se cierra sola (el último tramo vuelve al primer punto).
  }
  return polilineas
}

function tramosDe(polilineas) {
  const tramos = []
  for (const pts of polilineas) {
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i]
      const [x2, y2] = pts[(i + 1) % pts.length]
      tramos.push({
        x1,
        y1,
        x2,
        y2,
        xMin: Math.min(x1, x2),
        xMax: Math.max(x1, x2),
        yMin: Math.min(y1, y2),
        yMax: Math.max(y1, y2),
      })
    }
  }
  return tramos
}

// Cruces de la horizontal `y` con el contorno, con su sentido (para la regla NONZERO).
function crucesDeFila(tramos, y) {
  const cruces = []
  for (const t of tramos) {
    const cruza = (t.y1 <= y && y < t.y2) || (t.y2 <= y && y < t.y1)
    if (!cruza) continue
    cruces.push({
      x: t.x1 + ((y - t.y1) * (t.x2 - t.x1)) / (t.y2 - t.y1),
      sentido: t.y2 > t.y1 ? 1 : -1,
    })
  }
  return cruces
}

function dentroPorNonzero(x, cruces) {
  let vueltas = 0
  for (const c of cruces) if (c.x < x) vueltas += c.sentido
  return vueltas !== 0
}

// ¿A distancia ≤ medio trazo de algún tramo? Equivale al trazo de 18 con unión redonda.
function bajoElTrazo(x, y, cercanos, medio) {
  const medio2 = medio * medio
  for (const t of cercanos) {
    if (x < t.xMin - medio || x > t.xMax + medio) continue
    const dx = t.x2 - t.x1
    const dy = t.y2 - t.y1
    const largo2 = dx * dx + dy * dy
    const f =
      largo2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - t.x1) * dx + (y - t.y1) * dy) / largo2))
    const ex = t.x1 + f * dx - x
    const ey = t.y1 + f * dy - y
    if (ex * ex + ey * ey <= medio2) return true
  }
  return false
}

function dentroDelCuadrado(x, y, { x: x0, y: y0, lado, rx }) {
  const mitad = lado / 2
  const dx = Math.abs(x - (x0 + mitad)) - (mitad - rx)
  const dy = Math.abs(y - (y0 + mitad)) - (mitad - rx)
  if (dx > rx || dy > rx) return false
  if (dx <= 0 || dy <= 0) return true
  return dx * dx + dy * dy <= rx * rx
}

// Rasteriza a `lado` px: viewBox → [0, lado]. Por píxel, α = fracción de muestras dentro del
// cuadrado (todas si `aSangre`) y RGB = soft + t·(ink − soft), con t = muestras de tinta / muestras
// del cuadrado: ALFA RECTO, nunca premultiplicado (si α = 0, el RGB se queda en soft).
function rasterizar({ tramos, geo, soft, ink, lado, aSangre }) {
  const escala = geo.lado / lado
  const medio = GROSOR_TRAZO / 2
  const enCuadrado = new Uint32Array(lado * lado)
  const deTinta = new Uint32Array(lado * lado)
  for (let fila = 0; fila < lado; fila++) {
    for (let sy = 0; sy < MUESTRAS; sy++) {
      const y = geo.y + (fila + (sy + 0.5) / MUESTRAS) * escala
      const cruces = crucesDeFila(tramos, y)
      const cercanos = tramos.filter((t) => y >= t.yMin - medio && y <= t.yMax + medio)
      for (let col = 0; col < lado; col++) {
        const i = fila * lado + col
        for (let sx = 0; sx < MUESTRAS; sx++) {
          const x = geo.x + (col + (sx + 0.5) / MUESTRAS) * escala
          if (!aSangre && !dentroDelCuadrado(x, y, geo)) continue
          enCuadrado[i]++
          if (dentroPorNonzero(x, cruces) || bajoElTrazo(x, y, cercanos, medio)) deTinta[i]++
        }
      }
    }
  }
  const [s, k] = [hexARgb(soft), hexARgb(ink)]
  const rgba = Buffer.alloc(lado * lado * 4)
  for (let i = 0; i < lado * lado; i++) {
    const t = enCuadrado[i] === 0 ? 0 : deTinta[i] / enCuadrado[i]
    for (let c = 0; c < 3; c++) rgba[i * 4 + c] = Math.round(s[c] + t * (k[c] - s[c]))
    rgba[i * 4 + 3] = Math.round((255 * enCuadrado[i]) / (MUESTRAS * MUESTRAS))
  }
  return rgba
}

const sinAlfa = (rgba) => Buffer.from(rgba.filter((_, i) => i % 4 !== 3))

// ── PNG e ICO a mano ────────────────────────────────────────────────────────────────────
const TABLA_CRC = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = TABLA_CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function trozo(tipo, datos) {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo))
  return Buffer.concat([largo, cuerpo, crc])
}

// PNG de 8 bits, sin entrelazado, filtro 0 en cada fila: IHDR · IDAT · IEND.
function codificarPng(lado, pixeles, tipoColor) {
  const canales = tipoColor === PNG_RGBA ? 4 : 3
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(lado, 0)
  ihdr.writeUInt32BE(lado, 4)
  ihdr[8] = 8 // profundidad
  ihdr[9] = tipoColor // compresión, filtro y entrelazado quedan a 0
  const anchoFila = lado * canales
  const crudo = Buffer.alloc(lado * (anchoFila + 1))
  for (let y = 0; y < lado; y++) {
    pixeles.copy(crudo, y * (anchoFila + 1) + 1, y * anchoFila, (y + 1) * anchoFila)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(crudo, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ])
}

// ICO (reservado 0, tipo 1) con los PNG DENTRO, uno por entrada de 16 bytes.
function componerIco(imagenes) {
  const cabecera = Buffer.alloc(6 + 16 * imagenes.length)
  cabecera.writeUInt16LE(0, 0)
  cabecera.writeUInt16LE(1, 2)
  cabecera.writeUInt16LE(imagenes.length, 4)
  let desplazamiento = cabecera.length
  imagenes.forEach(({ lado, png }, n) => {
    const o = 6 + n * 16
    cabecera[o] = lado % 256 // 256 se escribe como 0
    cabecera[o + 1] = lado % 256
    cabecera.writeUInt16LE(1, o + 4) // planos
    cabecera.writeUInt16LE(BITS_POR_PIXEL_ICO, o + 6)
    cabecera.writeUInt32LE(png.length, o + 8)
    cabecera.writeUInt32LE(desplazamiento, o + 12)
    desplazamiento += png.length
  })
  return Buffer.concat([cabecera, ...imagenes.map(({ png }) => png)])
}

// ── Principal ───────────────────────────────────────────────────────────────────────────
const salida = directorioDeSalida(process.argv.slice(2))
const tablas = leerWoff(FUENTE)
const glifo = contornos(tablas, glifoDe(tablas, LETRA.codePointAt(0)))
const d = pathDe(glifo)
const geo = geometria(cajaDe(glifo))
const scss = readFileSync(TOKENS, 'utf8')
const soft = leerColor(scss, '--accent-soft')
const ink = leerColor(scss, '--ink')
const tramos = tramosDe(aplanar(d))

mkdirSync(salida, { recursive: true })
writeFileSync(join(salida, 'favicon.svg'), componerSvg({ d, geo, soft, ink }))

const imagenesIco = LADOS_ICO.map((lado) => ({
  lado,
  png: codificarPng(lado, rasterizar({ tramos, geo, soft, ink, lado, aSangre: false }), PNG_RGBA),
}))
writeFileSync(join(salida, 'favicon.ico'), componerIco(imagenesIco))

const apple = rasterizar({ tramos, geo, soft, ink, lado: LADO_APPLE, aSangre: true })
writeFileSync(
  join(salida, 'apple-touch-icon.png'),
  codificarPng(LADO_APPLE, sinAlfa(apple), PNG_RGB),
)

console.log(
  `favicon: «${LETRA}» en ${ink} sobre ${soft}, viewBox ${geo.x} ${geo.y} ${geo.lado} ${geo.lado} ` +
    `→ favicon.svg, favicon.ico (${LADOS_ICO.join(' + ')}) y apple-touch-icon.png (${LADO_APPLE}) ` +
    `en ${salida}`,
)
