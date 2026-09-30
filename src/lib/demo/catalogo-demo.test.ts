import { describe, expect, it } from 'vitest'

import { CATALOGO_DEMO, type CategoriaDemo, LEYENDA_FOTOS, LEYENDA_PRECIOS } from './catalogo-demo'

/**
 * F-27 `catalogo_fotos` @s14-@s16 — los DATOS del catálogo del demo (CF-C1 / CF-3, I-7). Contrato:
 * features/catalogo_fotos.feature. Aquí las constantes exportadas son el SUJETO bajo prueba y se
 * comparan contra literales escritos A MANO (patrón `resenas-demo.test.ts`).
 */

/** clave → fichero → alt, de la tabla de @s14, escritos A MANO. */
const FOTOS_POR_CLAVE: readonly [string, string, string][] = [
  ['unas', 'servicio-unas-manicura-nude.jpg', 'Manos con manicura en tono nude y anillos dorados'],
  [
    'facial',
    'servicio-facial-pestanas.jpg',
    'Primer plano de pestañas largas sobre un párpado cerrado',
  ],
  [
    'depilacion',
    'servicio-depilacion-piel-suave.jpg',
    'Mano extendiendo crema sobre una pierna de piel suave',
  ],
]

describe('@s14 cada categoría de los datos del catálogo lleva su foto y su alt', () => {
  for (const [clave, fichero, alt] of FOTOS_POR_CLAVE) {
    it(`@s14 ${clave}: alt exactamente "${alt}" y una foto no vacía que contiene "${fichero}"`, () => {
      const categoria = CATALOGO_DEMO.find((candidata) => candidata.clave === clave)

      expect(categoria, `no hay categoría "${clave}"`).toBeDefined()
      expect(categoria?.alt).toBe(alt)
      expect(typeof categoria?.foto).toBe('string')
      expect(categoria?.foto.length).toBeGreaterThan(0)
      expect(categoria?.foto).toContain(fichero)
    })
  }
})

describe('@s15 los datos exportan la leyenda de las fotos, conservan la de precios y el orden de categorías', () => {
  it('@s15 LEYENDA_FOTOS es EXACTAMENTE el literal de CF-4, con su «·» y sin punto final', () => {
    expect(LEYENDA_FOTOS).toBe(
      'Fotos de banco de imágenes, ilustrativas del servicio · las fotos reales del salón se añaden antes de publicar',
    )
  })

  it('@s15 LEYENDA_PRECIOS sigue siendo EXACTAMENTE el literal de F-09 (Q-B)', () => {
    expect(LEYENDA_PRECIOS).toBe(
      'Precios de muestra · IVA incluido · pendientes de confirmar con el salón',
    )
  })

  it('@s15 las claves de las categorías son, en orden, exactamente "unas", "facial" y "depilacion"', () => {
    expect(CATALOGO_DEMO.map((categoria) => categoria.clave)).toEqual([
      'unas',
      'facial',
      'depilacion',
    ])
  })
})

/*
 * @s16 — una categoría sin `foto` o sin `alt` NO COMPILA. El juez es `pnpm typecheck` (parte de
 * `bin/harness init`; `tsconfig.json` incluye `src`, tests incluidos): cada directiva
 * `@ts-expect-error` exige que su línea tenga un error de tipos; si el campo pasara a ser opcional, la
 * directiva quedaría sin error que justificar y el comprobador fallaría con TS2578.
 *
 * Las dos categorías de prueba se declaran SIN anotación de tipo y se asignan después: así el literal
 * no pasa por la comprobación de propiedades de más, y el ÚNICO error posible en la línea de la
 * directiva es la ausencia del campo. Las variables se LEEN en el `it` de abajo: una variable sin leer
 * daría TS6133 en esa misma línea, y ese error taparía el que se quiere exigir.
 */
const SERVICIOS_DE_PRUEBA = [{ nombre: 'Servicio de prueba', precio: '10 €' }]

const completaSalvoFoto = {
  clave: 'prueba-sin-foto',
  eyebrow: 'Servicio de prueba',
  textoBoton: 'Reservar prueba',
  titulo: 'Categoría sin foto',
  intro: 'Categoría de prueba a la que solo le falta la foto.',
  servicios: SERVICIOS_DE_PRUEBA,
  alt: 'Texto alternativo de prueba',
}

const completaSalvoAlt = {
  clave: 'prueba-sin-alt',
  eyebrow: 'Servicio de prueba',
  textoBoton: 'Reservar prueba',
  titulo: 'Categoría sin alt',
  intro: 'Categoría de prueba a la que solo le falta el texto alternativo.',
  servicios: SERVICIOS_DE_PRUEBA,
  foto: '/src/assets/servicios/prueba.jpg',
}

// @ts-expect-error -- @s16: falta `foto`, campo OBLIGATORIO de CategoriaDemo (CF-C1)
const categoriaSinFoto: CategoriaDemo = completaSalvoFoto

// @ts-expect-error -- @s16: falta `alt`, campo OBLIGATORIO de CategoriaDemo (CF-C1)
const categoriaSinAlt: CategoriaDemo = completaSalvoAlt

describe('@s16 una categoría sin foto o sin alt NO compila: los dos campos son obligatorios', () => {
  it('@s16 cada categoría de prueba está COMPLETA salvo por UN campo: su ausencia es lo único que el tipo puede rechazar', () => {
    // Si a una le faltara otro campo más, la directiva quedaría satisfecha por ESE error y la prueba
    // de tipos dejaría de vigilar `foto`/`alt`. Esta aserción fija la forma exacta de cada una.
    const comunes = ['clave', 'eyebrow', 'textoBoton', 'titulo', 'intro', 'servicios']

    expect(Object.keys(categoriaSinFoto).sort()).toEqual([...comunes, 'alt'].sort())
    expect(Object.keys(categoriaSinAlt).sort()).toEqual([...comunes, 'foto'].sort())
  })
})
