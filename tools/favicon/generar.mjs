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

// Un error que quien ejecuta el CLI puede corregir (argumentos, glifo o tokens). La capa de interfaz, al
// final del fichero, lo informa con su mensaje y sin traza.
class ErrorDelFavicon extends Error {}

// ── Argumentos ──────────────────────────────────────────────────────────────────────────
function directorioDeSalida(argv) {
  const i = argv.indexOf('--salida')
  if (i === -1) return join(RAIZ, 'public')
  const dir = argv[i + 1]
  if (!dir) throw new ErrorDelFavicon('--salida necesita un directorio')
  return resolve(dir)
}

// ── Fuente: WOFF1 → tablas sfnt ─────────────────────────────────────────────────────────
// La cabecera WOFF1 mide 44 bytes y lleva numTables en el byte 12. Detrás va el directorio: una entrada
// de 20 bytes por tabla, con su etiqueta (4 letras), su desplazamiento, su largo comprimido y su largo
// original.
const POSICION_DEL_NUMERO_DE_TABLAS_WOFF = 12
const LARGO_DE_LA_CABECERA_WOFF = 44
const LARGO_DE_LA_ENTRADA_WOFF = 20
const LARGO_DE_LA_ETIQUETA = 4
const POSICION_EN_LA_ENTRADA_WOFF = { desplazamiento: 4, largoComprimido: 8, largoOriginal: 12 }

function leerWoff(ruta) {
  const woff = readFileSync(ruta)
  const tablas = {}
  for (let i = 0; i < woff.readUInt16BE(POSICION_DEL_NUMERO_DE_TABLAS_WOFF); i++) {
    const entrada = LARGO_DE_LA_CABECERA_WOFF + i * LARGO_DE_LA_ENTRADA_WOFF
    const etiqueta = woff.toString('ascii', entrada, entrada + LARGO_DE_LA_ETIQUETA)
    const desde = woff.readUInt32BE(entrada + POSICION_EN_LA_ENTRADA_WOFF.desplazamiento)
    const comprimida = woff.readUInt32BE(entrada + POSICION_EN_LA_ENTRADA_WOFF.largoComprimido)
    const original = woff.readUInt32BE(entrada + POSICION_EN_LA_ENTRADA_WOFF.largoOriginal)
    const datos = woff.subarray(desde, desde + comprimida)
    tablas[etiqueta] = comprimida < original ? inflateSync(datos) : datos
  }
  return tablas
}

// cmap: numTables en el byte 2 y, desde el 4, un registro de 8 bytes por subtabla, con el desplazamiento
// de la subtabla (uint32) en el byte 4 del registro.
const POSICION_DEL_NUMERO_DE_SUBTABLAS = 2
const INICIO_DE_LOS_REGISTROS_CMAP = 4
const LARGO_DEL_REGISTRO_CMAP = 8
const POSICION_DE_LA_SUBTABLA_EN_EL_REGISTRO = 4
// Subtabla de formato 4: segCountX2 en el byte 6 y endCode[] desde el 14; tras él, 2 bytes de relleno
// (reservedPad) y luego startCode[], idDelta[] e idRangeOffset[], de segCountX2 bytes cada uno.
const FORMATO_POR_SEGMENTOS = 4
const POSICION_DEL_DOBLE_DE_SEGMENTOS = 6
const INICIO_DE_LOS_FINALES = 14
const LARGO_DEL_RELLENO = 2
const BYTES_POR_VALOR = 2 // los valores de esos arrays son uint16 (o int16)

// cmap de formato 4: del punto de código al índice de glifo.
function glifoDe(tablas, cp) {
  const cmap = tablas.cmap
  const subtablas = cmap.readUInt16BE(POSICION_DEL_NUMERO_DE_SUBTABLAS)
  for (let i = 0; i < subtablas; i++) {
    const registro = INICIO_DE_LOS_REGISTROS_CMAP + i * LARGO_DEL_REGISTRO_CMAP
    const subtabla = cmap.readUInt32BE(registro + POSICION_DE_LA_SUBTABLA_EN_EL_REGISTRO)
    if (cmap.readUInt16BE(subtabla) !== FORMATO_POR_SEGMENTOS) continue
    const dobleDeSegmentos = cmap.readUInt16BE(subtabla + POSICION_DEL_DOBLE_DE_SEGMENTOS)
    const finales = subtabla + INICIO_DE_LOS_FINALES
    const inicios = finales + dobleDeSegmentos + LARGO_DEL_RELLENO
    const deltas = inicios + dobleDeSegmentos
    const rangos = deltas + dobleDeSegmentos
    for (let s = 0; s < dobleDeSegmentos / BYTES_POR_VALOR; s++) {
      const desplazamiento = s * BYTES_POR_VALOR
      const fin = cmap.readUInt16BE(finales + desplazamiento)
      const inicio = cmap.readUInt16BE(inicios + desplazamiento)
      if (cp < inicio || cp > fin) continue
      const delta = cmap.readInt16BE(deltas + desplazamiento)
      const desplazamientoDelRango = cmap.readUInt16BE(rangos + desplazamiento)
      if (desplazamientoDelRango === 0) return (cp + delta) & 0xffff
      const glifo = cmap.readUInt16BE(
        rangos + desplazamiento + desplazamientoDelRango + (cp - inicio) * BYTES_POR_VALOR,
      )
      return glifo === 0 ? 0 : (glifo + delta) & 0xffff
    }
  }
  throw new ErrorDelFavicon(`la fuente no tiene glifo para U+${cp.toString(16)}`)
}

// head.indexToLocFormat, en el byte 50: 1 si loca guarda los desplazamientos como uint32; 0 si como
// uint16, a la mitad.
const POSICION_DEL_FORMATO_DE_LOCA = 50
const LOCA_LARGA = 1

function rangoDelGlifo(tablas, glifo) {
  const loca = tablas.loca
  const locaLarga = tablas.head.readInt16BE(POSICION_DEL_FORMATO_DE_LOCA) === LOCA_LARGA
  return locaLarga
    ? [loca.readUInt32BE(glifo * 4), loca.readUInt32BE(glifo * 4 + 4)]
    : [loca.readUInt16BE(glifo * 2) * 2, loca.readUInt16BE(glifo * 2 + 2) * 2]
}

// ── Glifo: glyf → contornos ─────────────────────────────────────────────────────────────
// Cada glifo abre con una cabecera de 10 bytes: numberOfContours (int16, el primer campo) y su caja.
const LARGO_DE_LA_CABECERA_DEL_GLIFO = 10
const BYTES_POR_ENTERO_16 = 2
// Las banderas de cada punto (con su nombre en la especificación TrueType).
const BANDERA_EN_LA_CURVA = 1 // ON_CURVE_POINT
const BANDERA_X_CORTA = 2 // X_SHORT_VECTOR
const BANDERA_Y_CORTA = 4 // Y_SHORT_VECTOR
const BANDERA_REPETIR = 8 // REPEAT_FLAG
const BANDERA_X_IGUAL_O_POSITIVA = 16 // X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR
const BANDERA_Y_IGUAL_O_POSITIVA = 32 // Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR
// Las x y las y se leen igual; solo cambia la pareja de banderas de su eje.
const EJE_X = { corta: BANDERA_X_CORTA, igualOPositiva: BANDERA_X_IGUAL_O_POSITIVA }
const EJE_Y = { corta: BANDERA_Y_CORTA, igualOPositiva: BANDERA_Y_IGUAL_O_POSITIVA }

// Contornos del glifo simple: puntos { x, y, on } con la y ya invertida (y hacia abajo, como SVG).
// El glyf guarda seguidos los finales, las instrucciones, las banderas, las x y las y: un solo lector
// los recorre en ese orden.
function contornosDelGlifo(tablas, glifo) {
  const [desde, hasta] = rangoDelGlifo(tablas, glifo)
  if (desde === hasta) return []
  const datos = tablas.glyf.subarray(desde, hasta)
  const numeroDeContornos = datos.readInt16BE(0)
  if (numeroDeContornos < 0) throw new ErrorDelFavicon('glifo compuesto: no soportado')
  const lector = lectorDe(datos, LARGO_DE_LA_CABECERA_DEL_GLIFO)
  const finales = finalesDeContorno(lector, numeroDeContornos)
  lector.saltar(lector.uint16()) // las instrucciones de hinting: su largo y luego ellas
  const banderas = banderasDe(lector, finales.at(-1) + 1)
  const xs = coordenadasDelEje(lector, banderas, EJE_X)
  const ys = coordenadasDelEje(lector, banderas, EJE_Y)
  return agruparEnContornos(finales, banderas, xs, ys)
}

// Un cursor sobre los bytes del glifo: cada lectura avanza lo que lee.
function lectorDe(datos, inicio) {
  let posicion = inicio
  const avanzar = (bytes) => {
    const actual = posicion
    posicion += bytes
    return actual
  }
  return {
    byte: () => datos[avanzar(1)],
    uint16: () => datos.readUInt16BE(avanzar(BYTES_POR_ENTERO_16)),
    int16: () => datos.readInt16BE(avanzar(BYTES_POR_ENTERO_16)),
    saltar: avanzar,
  }
}

// El índice del último punto de cada contorno (endPtsOfContours).
function finalesDeContorno(lector, numeroDeContornos) {
  return Array.from({ length: numeroDeContornos }, () => lector.uint16())
}

// Una bandera por punto; con REPETIR, el byte siguiente dice cuántas veces más se repite.
function banderasDe(lector, numeroDePuntos) {
  const banderas = []
  while (banderas.length < numeroDePuntos) {
    const bandera = lector.byte()
    banderas.push(bandera)
    if (bandera & BANDERA_REPETIR) {
      let repeticiones = lector.byte()
      while (repeticiones--) banderas.push(bandera)
    }
  }
  return banderas
}

// Las coordenadas de un eje, acumuladas. Cada punto suma un byte con el signo en su bandera (corta),
// nada (repite la anterior) o un int16.
function coordenadasDelEje(lector, banderas, eje) {
  const coordenadas = []
  let valor = 0
  for (const bandera of banderas) {
    if (bandera & eje.corta) valor += bandera & eje.igualOPositiva ? lector.byte() : -lector.byte()
    else if (!(bandera & eje.igualOPositiva)) valor += lector.int16()
    coordenadas.push(valor)
  }
  return coordenadas
}

// Reparte los puntos entre los contornos según sus finales; la y se invierte (hacia abajo, como en SVG).
function agruparEnContornos(finales, banderas, xs, ys) {
  const contornos = []
  let inicio = 0
  for (const fin of finales) {
    const puntos = []
    for (let i = inicio; i <= fin; i++) {
      puntos.push({ x: xs[i], y: -ys[i], on: (banderas[i] & BANDERA_EN_LA_CURVA) !== 0 })
    }
    contornos.push(puntos)
    inicio = fin + 1
  }
  return contornos
}

// El `d` con EXACTAMENTE el formato de números de prototipo-glifos.mjs (un decimal, sin ceros de
// relleno: «890.5», «147»). Si cambia el formato, el `d` deja de ser idéntico al del oráculo (@s2).
const redondeo = (v) => Math.round(v * 10) / 10
function pathDe(contornos) {
  let s = ''
  for (const puntos of contornos) {
    // Empieza en un punto ON (o en el medio implícito de dos OFF).
    let k = puntos.findIndex((punto) => punto.on)
    let inicio
    if (k === -1) {
      inicio = { x: (puntos[0].x + puntos[1].x) / 2, y: (puntos[0].y + puntos[1].y) / 2 }
      k = 0
    } else inicio = puntos[k]
    const orden = [...puntos.slice(k), ...puntos.slice(0, k)]
    s += `M${redondeo(inicio.x)} ${redondeo(inicio.y)}`
    let ctrl = null
    for (let i = 1; i <= orden.length; i++) {
      const punto = orden[i % orden.length]
      if (punto.on) {
        s += ctrl
          ? `Q${redondeo(ctrl.x)} ${redondeo(ctrl.y)} ${redondeo(punto.x)} ${redondeo(punto.y)}`
          : `L${redondeo(punto.x)} ${redondeo(punto.y)}`
        ctrl = null
      } else if (ctrl) {
        const medio = { x: (ctrl.x + punto.x) / 2, y: (ctrl.y + punto.y) / 2 }
        s += `Q${redondeo(ctrl.x)} ${redondeo(ctrl.y)} ${redondeo(medio.x)} ${redondeo(medio.y)}`
        ctrl = punto
      } else ctrl = punto
    }
    if (ctrl)
      s += `Q${redondeo(ctrl.x)} ${redondeo(ctrl.y)} ${redondeo(inicio.x)} ${redondeo(inicio.y)}`
    s += 'Z'
  }
  return s
}

// Caja de TODOS los puntos (ON y OFF), como el prototipo: de ella salen viewBox y rect.
function cajaDe(contornos) {
  const todos = contornos.flat()
  return [
    Math.min(...todos.map((punto) => punto.x)),
    Math.min(...todos.map((punto) => punto.y)),
    Math.max(...todos.map((punto) => punto.x)),
    Math.max(...todos.map((punto) => punto.y)),
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
    throw new ErrorDelFavicon(
      `${nombre}: se esperaba UNA declaración #RRGGBB en _tokens.scss (${halladas})`,
    )
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
  for (const puntos of polilineas) {
    for (let i = 0; i < puntos.length; i++) {
      const [x1, y1] = puntos[i]
      const [x2, y2] = puntos[(i + 1) % puntos.length]
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
    const fraccion =
      largo2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - t.x1) * dx + (y - t.y1) * dy) / largo2))
    const ex = t.x1 + fraccion * dx - x
    const ey = t.y1 + fraccion * dy - y
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
  const [rgbSoft, rgbInk] = [hexARgb(soft), hexARgb(ink)]
  const rgba = Buffer.alloc(lado * lado * 4)
  for (let i = 0; i < lado * lado; i++) {
    const t = enCuadrado[i] === 0 ? 0 : deTinta[i] / enCuadrado[i]
    for (let c = 0; c < 3; c++) {
      rgba[i * 4 + c] = Math.round(rgbSoft[c] + t * (rgbInk[c] - rgbSoft[c]))
    }
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

// ICO (reservado 0, tipo 1) con los PNG DENTRO: una cabecera de 6 bytes y una entrada de 16 por imagen.
const LARGO_DE_LA_CABECERA_ICO = 6
const LARGO_DE_LA_ENTRADA_ICO = 16
const POSICION_EN_LA_CABECERA_ICO = { reservado: 0, tipo: 2, entradas: 4 }
const POSICION_EN_LA_ENTRADA_ICO = {
  ancho: 0,
  alto: 1,
  planos: 4,
  bitsPorPixel: 6,
  tamano: 8,
  desplazamiento: 12,
}
const TIPO_ICONO = 1 // el 2 sería un cursor
const PLANOS_DE_COLOR = 1
const MEDIDA_CERO_DEL_ICO = 256 // una medida de 256 se escribe como 0

function componerIco(imagenes) {
  const cabecera = Buffer.alloc(
    LARGO_DE_LA_CABECERA_ICO + LARGO_DE_LA_ENTRADA_ICO * imagenes.length,
  )
  cabecera.writeUInt16LE(0, POSICION_EN_LA_CABECERA_ICO.reservado)
  cabecera.writeUInt16LE(TIPO_ICONO, POSICION_EN_LA_CABECERA_ICO.tipo)
  cabecera.writeUInt16LE(imagenes.length, POSICION_EN_LA_CABECERA_ICO.entradas)
  let desplazamiento = cabecera.length
  imagenes.forEach(({ lado, png }, indice) => {
    const entrada = LARGO_DE_LA_CABECERA_ICO + indice * LARGO_DE_LA_ENTRADA_ICO
    cabecera[entrada + POSICION_EN_LA_ENTRADA_ICO.ancho] = lado % MEDIDA_CERO_DEL_ICO
    cabecera[entrada + POSICION_EN_LA_ENTRADA_ICO.alto] = lado % MEDIDA_CERO_DEL_ICO
    cabecera.writeUInt16LE(PLANOS_DE_COLOR, entrada + POSICION_EN_LA_ENTRADA_ICO.planos)
    cabecera.writeUInt16LE(BITS_POR_PIXEL_ICO, entrada + POSICION_EN_LA_ENTRADA_ICO.bitsPorPixel)
    cabecera.writeUInt32LE(png.length, entrada + POSICION_EN_LA_ENTRADA_ICO.tamano)
    cabecera.writeUInt32LE(desplazamiento, entrada + POSICION_EN_LA_ENTRADA_ICO.desplazamiento)
    desplazamiento += png.length
  })
  return Buffer.concat([cabecera, ...imagenes.map(({ png }) => png)])
}

// ── Principal ───────────────────────────────────────────────────────────────────────────
// Toda la validación (argumentos, glifo y tokens) va ANTES de la primera escritura (`mkdirSync`): un
// error no deja iconos a medias.
function generar(argv) {
  const salida = directorioDeSalida(argv)
  const tablas = leerWoff(FUENTE)
  const glifo = contornosDelGlifo(tablas, glifoDe(tablas, LETRA.codePointAt(0)))
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
}

// ── Interfaz ────────────────────────────────────────────────────────────────────────────
// La única capa que habla con quien ejecuta el CLI: informa por stderr, sin traza, y sale con código
// distinto de 0. Con process.exitCode y NO con process.exit(): en Windows, salir a la fuerza con E/S
// pendiente tumba Node (el precedente está en tools/puerta-anclas.ts).
const CODIGO_DE_SALIDA_CON_ERROR = 1

try {
  generar(process.argv.slice(2))
} catch (error) {
  const motivo =
    error instanceof ErrorDelFavicon ? error.message : `error inesperado: ${error.message}`
  console.error(`favicon: ${motivo}`)
  process.exitCode = CODIGO_DE_SALIDA_CON_ERROR
}
