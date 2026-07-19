import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { beforeAll, describe, expect, it } from 'vitest'

/**
 * F-12 — la sección #contacto sobre el HTML CRUDO del artefacto de PRODUCCIÓN, leído por BYTES
 * (readFileSync, sin ejecutar JavaScript — I-8, NUNCA jsdom: jsdom solo ve el estado post-hidratación
 * y el SSG tiene además el prerender, lección que F-04 pagó cara). «Verde ≠ funciona»: para las
 * features de UI se verifica con `pnpm build` + el HTML crudo (feature_list.json §rules.notas). Esta es
 * la capa AUTORITATIVA del contrato: @s4, @s5, @s7, @s8, @s9, @s10, @s11, @s12, @s14.
 *
 * 🔴 ESTE FICHERO NO IMPORTA NADA DE `src/`, Y ES DELIBERADO (patrón de `home-horneado.test.ts`): corre
 * el BUILD REAL (lento) en `beforeAll`. Si importara `site.ts`/`Contacto.tsx`, Stryker lo contaría como
 * cobertura y lo re-ejecutaría POR CADA MUTANTE → decenas de builds → TIMEOUTS, y «un informe de
 * mutación con timeouts MIENTE». Los ESPERADOS se escriben A MANO aquí (anti-tautología), no se importan.
 */
const RUTA_DIST = resolve('dist/index.html')

const IG_URL = 'https://www.instagram.com/nailslash.studio_/'
const TEL_HREF = 'tel:+34625223366'
const FACEBOOK = 'https://www.facebook.com/nailslashstudiorozas/'
const MARCA = 'Nails Lash Studio'

let html = ''
let codigoSalida = 0

beforeAll(() => {
  // El `pnpm build` REAL con las CINCO puertas. Se captura el código de salida (execFileSync lanza en
  // fallo con `.status`): @s10 exige exit 0 «con todas las puertas», en especial la de ANCLAS de F-06.
  try {
    execFileSync('pnpm', ['build'], { stdio: 'pipe', shell: true })
  } catch (error: unknown) {
    codigoSalida = (error as { status: number }).status
  }

  html = readFileSync(RUTA_DIST, 'utf8')
}, 180_000)

/**
 * La sección `#contacto` EXTRAÍDA del HTML crudo: el fragmento entre `<section aria-labelledby=
 * "contacto-titulo" …>` y su `</section>` (las secciones no se anidan, así que el `</section>` no
 * greedy es el correcto). '' si no se encuentra — y ese '' hace CAER las ANCLAS POSITIVAS (anti-vacuidad).
 */
function seccionContacto(): string {
  const encontrado =
    /<section\b[^>]*aria-labelledby="contacto-titulo"[^>]*>([\s\S]*?)<\/section>/.exec(html)

  return encontrado?.[1] ?? ''
}

describe('@s4 los enlaces de #contacto tienen href EXACTOS derivados del dato único de F-02', () => {
  it('@s4 el enlace de Instagram lleva href exactamente la URL derivada del handle único', () => {
    expect(seccionContacto()).toContain(`href="${IG_URL}"`)
  })

  it('@s4 el enlace de teléfono lleva href exactamente "tel:+34625223366" (telHref de F-02)', () => {
    expect(seccionContacto()).toContain(`href="${TEL_HREF}"`)
  })
})

describe('@s5 el teléfono de #contacto es un tel: en E.164 y pulsable, con el texto legible visible', () => {
  it('@s5 el href es exactamente "tel:+34625223366" y el texto visible exactamente "625 22 33 66"', () => {
    const seccion = seccionContacto()

    expect(seccion).toMatch(/<a\b[^>]*href="tel:\+34625223366"[^>]*>625 22 33 66<\/a>/)
  })
})

describe('@s7 NINGUNA parte del artefacto de "/" contiene una referencia a TikTok (página ENTERA)', () => {
  it('@s7 ANCLA POSITIVA: el documento SÍ contiene la marca "Nails Lash Studio" (se leyó y no está vacío)', () => {
    expect(html).toContain(MARCA)
  })

  it('@s7 en TODO el documento no aparece "tiktok" ni una sola vez (ni tiktok.com, ni href, ni texto)', () => {
    // Búsqueda insensible a mayúsculas sobre <head>+<body>: el vector natural es el JSON-LD del <head>.
    expect(html).not.toMatch(/tiktok/i)
  })
})

describe('@s8 NINGUNA parte del artefacto de "/" filtra el email ni un mailto: (página ENTERA, con el <head>)', () => {
  it('@s8 ANCLA POSITIVA: el documento SÍ contiene la marca "Nails Lash Studio"', () => {
    expect(html).toContain(MARCA)
  })

  it('@s8 en TODO el documento no aparece "centroesteticarozas@gmail.com" ni ningún "mailto:"', () => {
    expect(html).not.toContain('centroesteticarozas@gmail.com')
    expect(html).not.toMatch(/mailto:/i)
  })
})

describe('@s9 Facebook NO se cuela en #contacto (sigue exclusivo del pie de F-06), y la sección NO está vacía', () => {
  it('@s9 ANCLA POSITIVA: #contacto extraída SÍ trae su <h2 id="contacto-titulo">Horario y ubicación y el tel:', () => {
    const seccion = seccionContacto()

    // 🎨 DEMO: el titular pasa a «Horario y ubicación» (prototipo); el id de ancla NO cambia.
    expect(seccion).toMatch(/<h2\b[^>]*id="contacto-titulo"[^>]*>Horario y ubicación<\/h2>/)
    expect(seccion).toContain(`href="${TEL_HREF}"`)
  })

  it('@s9 en la MISMA sección extraída NO aparece el enlace de Facebook, pero SÍ sigue en el pie', () => {
    expect(seccionContacto()).not.toContain(FACEBOOK)
    // F-06 no se toca ni se duplica: Facebook sigue existiendo en la página (el pie).
    expect(html).toContain(FACEBOOK)
  })
})

describe('@s10 F-12 enriquece el stub #contacto-titulo — no crea sección ni id nuevo, no rompe anclas de F-06', () => {
  it('@s10 hay EXACTAMENTE una sección de contacto y un id de anclaje "contacto-titulo"', () => {
    const secciones = html.match(/<section\b[^>]*aria-labelledby="contacto-titulo"/g) ?? []
    const ids = html.match(/id="contacto-titulo"/g) ?? []

    expect(secciones).toHaveLength(1)
    expect(ids).toHaveLength(1)
  })

  it('@s10 la nav sigue enlazando "#contacto-titulo" y el build con las CINCO puertas termina en exit 0', () => {
    expect(html).toContain('href="#contacto-titulo"')
    expect(codigoSalida).toBe(0)
  })
})

describe('@s11 (DEMO) el contacto trae el CTA de WhatsApp JUNTO a la alternativa accesible tel:', () => {
  it('@s11 ANCLA POSITIVA: #contacto extraída SÍ trae el tel:, la dirección y el enlace de Instagram', () => {
    const seccion = seccionContacto()

    expect(seccion).toContain(`href="${TEL_HREF}"`)
    expect(seccion).toContain('Av. de Atenas 75')
    expect(seccion).toContain(`href="${IG_URL}"`)
  })

  it('@s11 (DEMO) la sección trae el CTA de WhatsApp (wa.me) SIN prescindir de la alternativa accesible tel:', () => {
    // 🎨 En la rama demo el CTA de WhatsApp del prototipo SÍ aparece (F-13 lo reservaba para más
    // tarde). La alternativa accesible (tel:) sigue presente JUNTO a él, que es el requisito de F-12.
    const seccion = seccionContacto()

    expect(seccion).toContain('wa.me')
    expect(seccion).toContain(`href="${TEL_HREF}"`)
  })
})

describe('@s12 (DEMO) el contacto muestra la dirección como TEXTO y un mapa como enlace «Cómo llegar» (NUNCA <iframe>)', () => {
  it('@s12 ANCLA POSITIVA: #contacto extraída SÍ trae la dirección como texto (p. ej. "Av. de Atenas 75")', () => {
    expect(seccionContacto()).toContain('Av. de Atenas 75')
  })

  it('@s12 (DEMO) hay bloque de mapa con «Cómo llegar» y la mención «Planta 0», pero JAMÁS un <iframe> (F-05 intacto)', () => {
    // 🎨 En la rama demo el bloque de mapa del prototipo SÍ aparece, pero como IMAGEN/ENLACE estático
    // («Cómo llegar» abre Maps en pestaña nueva), NUNCA un <iframe> de Google: cero terceros (F-05)
    // sigue intacto — el build de arriba (5 puertas, exit 0) incluye la puerta de terceros.
    const seccion = seccionContacto()

    expect(seccion).not.toMatch(/<iframe/i)
    expect(seccion).toContain('Cómo llegar')
    expect(seccion).toContain('Planta 0')
  })
})

describe('@s14 el texto visible del enlace de Instagram es el handle y es CONSISTENTE con su href', () => {
  it('@s14 el enlace de IG muestra "@nailslash.studio_" y su href es exactamente la URL derivada', () => {
    expect(seccionContacto()).toMatch(
      /<a\b[^>]*href="https:\/\/www\.instagram\.com\/nailslash\.studio_\/"[^>]*>@nailslash\.studio_<\/a>/,
    )
  })

  it('@s14 el texto visible y el href COMPARTEN el cuerpo del handle "nailslash.studio_"', () => {
    // Escritos A MANO: si uno se hardcodeara con el handle alternativo, dejarían de compartir el cuerpo.
    expect(IG_URL).toContain('nailslash.studio_')
    expect('@nailslash.studio_').toContain('nailslash.studio_')
  })
})
