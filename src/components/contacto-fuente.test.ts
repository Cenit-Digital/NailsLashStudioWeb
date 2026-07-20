import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * F-12 @s15 (G3b) — la guarda a nivel de FUENTE: cierra el agujero de A1 que ni la igualdad de bytes
 * del artefacto (@s4) ni la mutación (@s13) muerden: un host HORNEADO en el `.tsx` y uno DERIVADO
 * producen el mismo `dist/`. Esta guarda LEE LA FUENTE (los bytes del `.tsx`), como F-06/F-07 leen el
 * `.module.scss` para lo no-mutable, y falla si reaparece un `href="https://www.instagram.com/…"`
 * literal en el componente. Es no-mutable (Stryker no muta la ausencia de un literal): la aseveran los
 * tests, no Stryker. Que MUERDE se comprueba por SABOTAJE (progress/tdd_contacto.md): meter
 * `instagram.com` en el `.tsx` la pone ROJA. Contrato: features/contacto.feature.
 */
const RUTA_TSX = 'src/components/Contacto.tsx'
const RUTA_SITE = 'src/lib/site.ts'
const HOST_INSTAGRAM = 'https://www.instagram.com/'

function ocurrencias(texto: string, sub: string): number {
  return texto.split(sub).length - 1
}

describe('@s15 el host de Instagram vive SOLO en instagramHref (site.ts), NUNCA horneado en el .tsx', () => {
  it('@s15 el .tsx de la sección de contacto NO contiene la subcadena "instagram.com" ni una sola vez', () => {
    // El componente NO hornea el host: lo deriva vía instagramHref. La comprobación concreta: .tsx en 0.
    expect(ocurrencias(readFileSync(RUTA_TSX, 'utf8'), 'instagram.com')).toBe(0)
  })

  it('@s15 site.ts SÍ contiene el host "https://www.instagram.com/", en la región de instagramHref', () => {
    const site = readFileSync(RUTA_SITE, 'utf8')

    // La otra comprobación concreta: site.ts en ≥1. El host vive en la derivación, no en el render.
    expect(ocurrencias(site, 'instagram.com')).toBeGreaterThanOrEqual(1)
    expect(site).toContain(HOST_INSTAGRAM)
    // …y aparece en la región de instagramHref (no suelto en otra parte del módulo).
    expect(site.slice(site.indexOf('instagramHref'))).toContain(HOST_INSTAGRAM)
  })
})
