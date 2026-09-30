import { readFileSync, writeFileSync } from 'node:fs'
const { glifos } = JSON.parse(readFileSync('glifos.json', 'utf8'))
const INK = '#8E3355',
  SOFT = '#F7DDE8',
  ACCENT = '#C05576',
  WHITE = '#FFFFFF'
// Un glifo (o dos) centrado en un cuadrado con esquinas redondeadas.
function icono({ d, caja, fondo, tinta, relleno = 0.13, radio = 0.2, grosor = 0 }) {
  const [x0, y0, x1, y1] = caja
  const lado = Math.max(x1 - x0, y1 - y0) / (1 - 2 * relleno)
  const cx = (x0 + x1) / 2,
    cy = (y0 + y1) / 2
  const vx = Math.round(cx - lado / 2),
    vy = Math.round(cy - lado / 2),
    L = Math.round(lado)
  const trazo = grosor ? ` stroke="${tinta}" stroke-width="${grosor}" stroke-linejoin="round"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${L} ${L}"><rect x="${vx}" y="${vy}" width="${L}" height="${L}" rx="${Math.round(L * radio)}" fill="${fondo}"/><path fill="${tinta}"${trazo} d="${d}"/></svg>`
}
const N = glifos.N
// «NL»: la L entra por debajo del remate de la N (solape medido a ojo sobre el avance de la N).
const DX = 820
const Lmov = glifos.L.d
  .replace(/([MLQ])(-?[\d.]+) /g, (_, c, x) => `${c}${Math.round((+x + DX) * 10) / 10} `)
  .replace(
    /(Q-?[\d.]+ -?[\d.]+ )(-?[\d.]+) /g,
    (_, a, x) => `${a}${Math.round((+x + DX) * 10) / 10} `,
  )
const cajaNL = [
  Math.min(N.caja[0], glifos.L.caja[0] + DX),
  Math.min(N.caja[1], glifos.L.caja[1]),
  Math.max(N.caja[2], glifos.L.caja[2] + DX),
  Math.max(N.caja[3], glifos.L.caja[3]),
]
const cands = {
  A: icono({ d: N.d, caja: N.caja, fondo: INK, tinta: WHITE, grosor: 18 }),
  B: icono({ d: N.d, caja: N.caja, fondo: SOFT, tinta: INK, grosor: 18 }),
  C: icono({ d: N.d + Lmov, caja: cajaNL, fondo: SOFT, tinta: INK, relleno: 0.08, grosor: 22 }),
  D: icono({ d: N.d, caja: N.caja, fondo: ACCENT, tinta: WHITE, grosor: 18 }),
}
for (const [k, v] of Object.entries(cands)) writeFileSync(`cand-${k}.svg`, v)
const nombres = {
  A: 'A · «N» blanca sobre tinta',
  B: 'B · «N» tinta sobre rosa suave',
  C: 'C · «NL» tinta sobre rosa suave',
  D: 'D · «N» blanca sobre rosa marca',
}
const fila = (k) => `<div class="c"><h3>${nombres[k]}</h3><div class="tam">
 <figure><img src="cand-${k}.svg" width="16" height="16"><figcaption>16</figcaption></figure>
 <figure><img src="cand-${k}.svg" width="32" height="32"><figcaption>32</figcaption></figure>
 <figure><canvas data-src="cand-${k}.svg" data-n="16" width="16" height="16" class="zoom"></canvas><figcaption>16 px ×6</figcaption></figure>
 <figure><img src="cand-${k}.svg" width="96" height="96"><figcaption>96 (grande)</figcaption></figure></div>
 <div class="tab claro"><img src="cand-${k}.svg" width="16" height="16"><span>Nails Lash Studio · Uñas, pestañas…</span></div>
 <div class="tab oscuro"><img src="cand-${k}.svg" width="16" height="16"><span>Nails Lash Studio · Uñas, pestañas…</span></div></div>`
writeFileSync(
  'hoja.html',
  `<!doctype html><meta charset=utf-8><style>
body{margin:0;padding:18px;font:13px system-ui;background:#fff;color:#333;width:1180px}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.c{border:1px solid #ddd;border-radius:10px;padding:10px}
h3{margin:0 0 8px;font-size:13px}.tam{display:flex;gap:10px;align-items:flex-end}figure{margin:0;text-align:center}
figcaption{font-size:10px;color:#777}.zoom{width:96px;height:96px;image-rendering:pixelated;border:1px solid #eee}
.tab{display:flex;gap:8px;align-items:center;margin-top:8px;padding:7px 10px;border-radius:8px 8px 0 0;width:220px;font-size:12px;white-space:nowrap;overflow:hidden}
.claro{background:#fff;box-shadow:0 0 0 1px #dadce0;color:#202124}.oscuro{background:#35363a;color:#e8eaed}
</style><div class=g>${Object.keys(cands).map(fila).join('')}</div>
<script>for(const c of document.querySelectorAll('canvas')){const i=new Image();i.onload=()=>c.getContext('2d').drawImage(i,0,0,16,16);i.src=c.dataset.src}</script>`,
)
