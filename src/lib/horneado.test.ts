import { describe, expect, it } from 'vitest'

import { sinPrecargasDeImagen } from './horneado'

/**
 * F-04 @s40 (ENMIENDA 2 de `cascaron_semantico.feature`) — la parte PURA y MUTABLE de la corrección:
 * `vite.config.ts` la cablea en `ssgOptions.onPageRendered`, que recibe el HTML ya serializado por
 * vite-react-ssg (con sus `<link rel="preload" as="image" … crossorigin="">`) y devuelve el que se
 * escribe en `dist/`. El test de bytes del artefacto real vive en `src/pages/home-horneado.test.ts`.
 *
 * ANTI-TAUTOLOGÍA: entradas y esperados escritos A MANO, nunca derivados de producción.
 */
describe('@s40 sinPrecargasDeImagen retira del HTML horneado SOLO los <link rel="preload" as="image">', () => {
  it('@s40 retira la precarga de foto con la forma exacta que serializa vite-react-ssg', () => {
    const html = '<head><link rel="preload" as="image" href="/a.jpg" crossorigin=""></head>'

    expect(sinPrecargasDeImagen(html)).toBe('<head></head>')
  })

  it('@s40 retira TODAS las precargas de foto, no solo la primera (el artefacto de HEAD lleva 13)', () => {
    const html =
      '<head><link rel="preload" as="image" href="/a.jpg" crossorigin="">' +
      '<link rel="preload" as="image" href="/b.jpg" crossorigin=""></head>'

    expect(sinPrecargasDeImagen(html)).toBe('<head></head>')
  })

  it('@s40 deja INTACTAS las precargas de fuente (son de F-05) y el resto de <link>', () => {
    const html =
      '<head><link rel="stylesheet" crossorigin="" href="/app.css">' +
      '<link rel="preload" as="font" type="font/woff2" href="/f.woff2" crossorigin=""></head>'

    expect(sinPrecargasDeImagen(html)).toBe(html)
  })

  it('@s40 solo retira rel="preload": un <link rel="prefetch" as="image"> no es una precarga y se queda', () => {
    const html = '<head><link rel="prefetch" as="image" href="/a.jpg"></head>'

    expect(sinPrecargasDeImagen(html)).toBe(html)
  })

  it('@s40 retira la precarga de foto sea cual sea el orden de sus atributos', () => {
    const html = '<head><link as="image" href="/a.jpg" rel="preload"></head>'

    expect(sinPrecargasDeImagen(html)).toBe('<head></head>')
  })

  it('@s40 retira la precarga de foto sin distinguir mayúsculas en la etiqueta, los nombres ni los valores', () => {
    const html = '<head><LINK REL="PRELOAD" AS="IMAGE" HREF="/A.JPG"></head>'

    expect(sinPrecargasDeImagen(html)).toBe('<head></head>')
  })

  it('@s40 mira el NOMBRE del atributo as, no una subcadena: data-as="image" en una precarga de fuente no la retira', () => {
    const html = '<head><link rel="preload" data-as="image" as="font" href="/f.woff2"></head>'

    expect(sinPrecargasDeImagen(html)).toBe(html)
  })

  it('@s40 mira el NOMBRE del atributo rel, no una subcadena: data-rel="preload" en un rel="prefetch" no lo retira', () => {
    const html = '<head><link data-rel="preload" rel="prefetch" as="image" href="/a.jpg"></head>'

    expect(sinPrecargasDeImagen(html)).toBe(html)
  })
})
