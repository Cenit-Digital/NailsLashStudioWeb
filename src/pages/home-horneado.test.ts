import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { beforeAll, describe, expect, it } from 'vitest'

/**
 * F-10 @s12 y @s14 — sobre el HTML CRUDO del artefacto de PRODUCCIÓN, leído por BYTES (readFileSync,
 * sin ejecutar JavaScript — I-8, NUNCA jsdom). «Verde ≠ funciona»: para las features de UI se
 * verifica con `pnpm build` + fetch del HTML crudo (feature_list.json §rules.notas).
 *
 * 🔴 ESTE FICHERO NO IMPORTA NADA DE `src/lib/` NI DE `src/pages/`, Y ES DELIBERADO (patrón de
 * `trampas-del-horneado.test.tsx`): corre el BUILD REAL (lento) en `beforeAll`. Si importara
 * `horario.ts`, Stryker lo contaría como cobertura y lo re-ejecutaría POR CADA MUTANTE → decenas de
 * builds → TIMEOUTS, y «un informe de mutación con timeouts MIENTE» (docs/verification.md). Los
 * ESPERADOS se escriben A MANO aquí (anti-tautología), no se importan de producción.
 */
const RUTA_DIST = resolve('dist/index.html')

let html = ''
let codigoSalida = 0

beforeAll(() => {
  // El `pnpm build` REAL con las CINCO puertas. @s14 exige exit 0 «con todas las puertas»: se captura
  // el código de salida (execFileSync lanza en fallo con `.status`).
  try {
    execFileSync('pnpm', ['build'], { stdio: 'pipe', shell: true })
  } catch (error: unknown) {
    codigoSalida = (error as { status: number }).status
  }

  html = readFileSync(RUTA_DIST, 'utf8')
}, 180_000)

/**
 * El JSON-LD horneado, extraído del `<script … application/ld+json …>` de `dist/index.html`. Helmet
 * ordena los atributos con `data-rh="true"` ANTES de `type`, así que el patrón es tolerante a atributos.
 */
function jsonLdHorneado(): Record<string, unknown> {
  const encontrado = /<script[^>]*application\/ld\+json[^>]*>(.+?)<\/script>/s.exec(html)

  return JSON.parse(encontrado?.[1] ?? '{}')
}

/**
 * @s12 — la DEMO NO hornea un badge «Abierto/Cerrado ahora» en vivo (D1). Bajo SSG un badge horneado
 * congela el instante del build → mentira; uno que solo aparece tras hidratar es la rama-solo-JS-en-SSG
 * prohibida. `estaAbierto` se construye y testea (para F-13) pero NO alimenta ningún badge. El ANCLA
 * POSITIVA va PRIMERO (patrón F-04 @s34): sin ella, una negativa sobre bytes pasa VACUAMENTE si el
 * fichero estuviera vacío o fuese el equivocado.
 */
describe('@s12 la DEMO no hornea un badge «Abierto/Cerrado ahora» en el HTML crudo de /', () => {
  it('@s12 ANCLA POSITIVA: el HTML trae la cáscara de F-04 — el <title> «Nails Lash Studio · …» y un <script ld+json>', () => {
    expect(html).toMatch(/<title[^>]*>Nails Lash Studio.*Uñas, pestañas y cejas/i)
    expect(html).toMatch(/<script[^>]*application\/ld\+json/i)
  })

  it('@s12 el HTML NO contiene un indicador «Abierto ahora» / «Cerrado ahora» calculado del instante del build', () => {
    expect(html).not.toMatch(/Abierto ahora/i)
    expect(html).not.toMatch(/Cerrado ahora/i)
  })
})

/**
 * @s14 — `openingHoursSpecification` se COMPONE en el sitio de emisión (`home.tsx`), esparciendo el
 * objeto de `construirJsonLd` (F-04, INTACTO — su @s9 en seo.test.ts sigue verde) y AÑADIENDO la clave.
 * Se asevera sobre el JSON-LD HORNEADO en `dist/`. JAMÁS la clave `openingHours`: la puerta de cascarón
 * de F-04 compara igualdad EXACTA en minúsculas, así que `openinghoursspecification !== openinghours` y
 * no colisiona; si apareciese `openingHours`, el build habría roto (codigoSalida != 0).
 */
describe('@s14 openingHoursSpecification se hornea en el JSON-LD de dist/, sin la clave openingHours', () => {
  it('@s14 ANCLA POSITIVA: el JSON-LD horneado conserva la cáscara BeautySalon de F-04 (@type y name)', () => {
    const jsonLd = jsonLdHorneado()

    expect(jsonLd['@type']).toBe('BeautySalon')
    expect(jsonLd.name).toBe('Nails Lash Studio')
    for (const clave of ['@context', '@type', 'name', 'address', 'geo', 'telephone']) {
      expect(Object.keys(jsonLd)).toContain(clave)
    }
  })

  it('@s14 el JSON-LD horneado contiene «openingHoursSpecification» con el array de @s13 (escrito A MANO)', () => {
    expect(jsonLdHorneado().openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '14:00',
      },
    ])
  })

  it('@s14 el JSON-LD horneado NO contiene la clave «openingHours» (ni las dos a la vez)', () => {
    const claves = Object.keys(jsonLdHorneado())

    expect(claves).toContain('openingHoursSpecification')
    expect(claves).not.toContain('openingHours')
  })

  it('@s14 el build de producción con las CINCO puertas termina en código de salida 0', () => {
    expect(codigoSalida).toBe(0)
  })
})
