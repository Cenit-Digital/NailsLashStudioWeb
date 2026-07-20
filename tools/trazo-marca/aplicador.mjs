// Deriva `src/assets/aplicador.png` a partir de `src/assets/brush.png`.
//
// POR QUÉ EXISTE: `brush.png` (60×198) no es un pincel, es una BOTELLA ENTERA. Medido sobre su
// canal alfa: cerdas en y 12–36, varilla rosa en y 36–104 y frasco negro en y 105–197. El hero
// anterior anclaba el punto del recorrido al 86 % de la imagen — o sea DENTRO DEL FRASCO—, así
// que lo que «pintaba» las letras era el culo del bote, no la punta.
//
// Esta herramienta recorta la parte útil (cerdas + varilla), la voltea en vertical para que las
// cerdas miren HACIA ABAJO —como se sostiene un pincel— y deja la PUNTA en el centro del borde
// inferior, que es el punto que el <image> del hero coloca sobre el recorrido.
//
// Uso:  node tools/trazo-marca/aplicador.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { deflateSync, inflateSync } from 'node:zlib'

const ORIGEN = 'src/assets/brush.png'
const DESTINO = 'src/assets/aplicador.png'
const FILA_PUNTA = 10 // la fila donde asoman las cerdas (medido)
const FILA_CORTE = 104 // donde empieza el frasco negro (medido)
const MARGEN = 2

// ── Decodificar PNG RGBA de 8 bits ──────────────────────────────────────────────────
function leerPng(ruta) {
  const png = readFileSync(ruta)
  let pos = 8
  let ihdr = null
  const idat = []
  while (pos < png.length) {
    const len = png.readUInt32BE(pos)
    const tipo = png.toString('ascii', pos + 4, pos + 8)
    const datos = png.subarray(pos + 8, pos + 8 + len)
    if (tipo === 'IHDR') {
      ihdr = { w: datos.readUInt32BE(0), h: datos.readUInt32BE(4), prof: datos[8], color: datos[9] }
    } else if (tipo === 'IDAT') idat.push(datos)
    else if (tipo === 'IEND') break
    pos += 12 + len
  }
  if (ihdr.prof !== 8 || ihdr.color !== 6) throw new Error('se esperaba PNG RGBA de 8 bits')
  const bpp = 4
  const anchoFila = ihdr.w * bpp
  const crudo = inflateSync(Buffer.concat(idat))
  const px = Buffer.alloc(ihdr.h * anchoFila)
  const paeth = (a, b, c) => {
    const p = a + b - c
    const pa = Math.abs(p - a)
    const pb = Math.abs(p - b)
    const pc = Math.abs(p - c)
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
  }
  for (let y = 0; y < ihdr.h; y++) {
    const filtro = crudo[y * (anchoFila + 1)]
    const linea = crudo.subarray(y * (anchoFila + 1) + 1, (y + 1) * (anchoFila + 1))
    for (let x = 0; x < anchoFila; x++) {
      const a = x >= bpp ? px[y * anchoFila + x - bpp] : 0
      const b = y > 0 ? px[(y - 1) * anchoFila + x] : 0
      const c = x >= bpp && y > 0 ? px[(y - 1) * anchoFila + x - bpp] : 0
      const v = linea[x]
      px[y * anchoFila + x] =
        (filtro === 0
          ? v
          : filtro === 1
            ? v + a
            : filtro === 2
              ? v + b
              : filtro === 3
                ? v + ((a + b) >> 1)
                : v + paeth(a, b, c)) & 0xff
    }
  }
  return { ...ihdr, px, anchoFila }
}

// ── Codificar PNG RGBA de 8 bits (sin filtro) ───────────────────────────────────────
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
  const len = Buffer.alloc(4)
  len.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo))
  return Buffer.concat([len, cuerpo, crc])
}
function escribirPng(ruta, w, h, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const crudo = Buffer.alloc(h * (w * 4 + 1))
  for (let y = 0; y < h; y++) {
    crudo[y * (w * 4 + 1)] = 0
    rgba.copy(crudo, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
  }
  writeFileSync(
    ruta,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      trozo('IHDR', ihdr),
      trozo('IDAT', deflateSync(crudo, { level: 9 })),
      trozo('IEND', Buffer.alloc(0)),
    ]),
  )
}

// ── Recortar a la parte útil, voltear y guardar ──────────────────────────────────────
const src = leerPng(ORIGEN)
const alfa = (x, y) => src.px[y * src.anchoFila + x * 4 + 3]
let x0 = src.w
let x1 = -1
let y0 = src.h
let y1 = -1
for (let y = FILA_PUNTA; y <= FILA_CORTE; y++)
  for (let x = 0; x < src.w; x++)
    if (alfa(x, y) > 24) {
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
x0 = Math.max(0, x0 - MARGEN)
x1 = Math.min(src.w - 1, x1 + MARGEN)
const w = x1 - x0 + 1
const h = y1 - y0 + 1
const out = Buffer.alloc(w * h * 4)
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const sy = y1 - y // VOLTEO vertical: las cerdas pasan a mirar hacia ABAJO
    const si = sy * src.anchoFila + (x0 + x) * 4
    src.px.copy(out, (y * w + x) * 4, si, si + 4)
  }
escribirPng(DESTINO, w, h, out)

// La punta queda en el centro del borde INFERIOR: es el punto que va sobre el recorrido.
let sumaX = 0
let n = 0
for (let x = 0; x < w; x++)
  if (out[((h - 1) * w + x) * 4 + 3] > 24) {
    sumaX += x
    n++
  }
console.log(
  JSON.stringify({
    origen: `${src.w}x${src.h}`,
    recorte: { x: [x0, x1], y: [y0, y1] },
    destino: `${w}x${h}`,
    puntaX: n ? +(sumaX / n).toFixed(1) : null,
    puntaXRelativa: n ? +(sumaX / n / w).toFixed(4) : null,
    nota: 'la punta va en el borde inferior; el <image> la ancla con x=-w/2, y=-h',
  }),
)
