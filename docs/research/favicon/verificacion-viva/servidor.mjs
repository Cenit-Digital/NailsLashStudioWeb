// Servidor estático que imita GitHub Pages DE PROYECTO: sirve `raiz` SOLO bajo `prefijo`
// (p. ej. /NailsLashStudioWeb/), 301 de "/NailsLashStudioWeb" a "/NailsLashStudioWeb/",
// directorio -> index.html y 404 a todo lo demás (incluido /favicon.ico de la raíz del origen).
// Registra CADA petición (método, ruta, estado): es la prueba del lado servidor, independiente de
// lo que Chromium decida exponer por CDP.
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
}

export function servir({ montajes, puerto }) {
  // montajes: [{ prefijo: '/NailsLashStudioWeb/', raiz: 'C:/...' }]
  const registro = []
  const servidor = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    const ruta = decodeURIComponent(url.pathname)
    let estado = 404
    let cuerpo = Buffer.from('<!doctype html><title>404</title><h1>404 Not Found</h1>')
    let tipo = 'text/html; charset=utf-8'
    const cabeceras = {}
    for (const { prefijo, raiz } of montajes) {
      if (ruta === prefijo.slice(0, -1)) {
        estado = 301
        cabeceras.Location = prefijo
        cuerpo = Buffer.alloc(0)
        break
      }
      if (!ruta.startsWith(prefijo)) continue
      let rel = ruta.slice(prefijo.length)
      if (rel === '' || rel.endsWith('/')) rel += 'index.html'
      const fichero = path.resolve(raiz, rel)
      if (!fichero.startsWith(path.resolve(raiz))) break
      try {
        const s = await stat(fichero)
        if (s.isFile()) {
          cuerpo = await readFile(fichero)
          estado = 200
          tipo = MIME[path.extname(fichero).toLowerCase()] ?? 'application/octet-stream'
        }
      } catch {}
      break
    }
    registro.push({ t: Date.now(), metodo: req.method, ruta: url.pathname + url.search, estado })
    res.writeHead(estado, { 'Content-Type': tipo, 'Cache-Control': 'no-store', ...cabeceras })
    res.end(req.method === 'HEAD' ? undefined : cuerpo)
  })
  return new Promise((ok) => servidor.listen(puerto, '127.0.0.1', () => ok({ servidor, registro })))
}
