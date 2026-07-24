import { describe, expect, it } from 'vitest'

import {
  capaDe,
  claveDistancia,
  debeRotar,
  distanciaCircular,
  etiquetaDeDiapositiva,
  etiquetaDelPunto,
  indiceCircular,
  pasosDelArrastre,
  signoDe,
  UMBRAL_DE_ARRASTRE,
  vozDeLaPista,
} from './galeria-logica'

/**
 * Núcleo PURO del carrusel coverflow de la galería. Contrato:
 * `features/galeria_carrusel.feature` (@s3, @s4, @s5, @s6, @s7, @s10, @s11, @s17, @s18).
 *
 * ANTI-TAUTOLOGÍA: los seis valores esperados, las etiquetas y las claves van ESCRITOS A MANO;
 * jamás se importa una constante de producción como valor esperado ni se re-ejecuta la función
 * bajo prueba para compararla consigo misma.
 */
const TOTAL = 6
/** Los seis índices, 0-based: la 1ª foto es el 0 y la 6ª el 5. */
const FOTOS = [0, 1, 2, 3, 4, 5]

describe('@s3 la distancia a la foto centrada va CON SIGNO y por el camino corto', () => {
  // La TERCERA centrada = índice 2 (0-based). Las seis distancias van escritas a mano.
  it.each([
    { foto: '1ª', indice: 0, distancia: -2 },
    { foto: '2ª', indice: 1, distancia: -1 },
    { foto: '3ª', indice: 2, distancia: 0 },
    { foto: '4ª', indice: 3, distancia: 1 },
    { foto: '5ª', indice: 4, distancia: 2 },
    { foto: '6ª', indice: 5, distancia: 3 },
  ])(
    '@s3 con la 3ª centrada, la foto $foto está a distancia $distancia',
    ({ indice, distancia }) => {
      expect(distanciaCircular(indice, 2, TOTAL)).toBe(distancia)
    },
  )

  it('@s3 EXACTAMENTE UNA de las seis está a distancia 0, sea cual sea la centrada', () => {
    for (let activo = 0; activo < TOTAL; activo++) {
      const centradas = FOTOS.filter((indice) => distanciaCircular(indice, activo, TOTAL) === 0)

      expect(centradas).toEqual([activo])
    }
  })

  it('@s3 NINGUNA de las seis está a distancia -3: con n par el rango es [-2, +3] y el -3 no existe', () => {
    for (let activo = 0; activo < TOTAL; activo++) {
      const distancias = FOTOS.map((indice) => distanciaCircular(indice, activo, TOTAL))

      // El -3 escrito A MANO: es el valor que produciría el comparador `>=` (rango [-3, +2]).
      expect(distancias).not.toContain(-3)
      // Y la opuesta SÍ existe, por la derecha: si no, el `not.toContain` sería vacuo.
      expect(distancias).toContain(3)
    }
  })
})

describe('@s4 retroceder desde una foto posterior NO cae fuera de rango (el doble módulo)', () => {
  it('@s4 con la QUINTA centrada, la PRIMERA está a distancia +2 (el camino corto va por la derecha)', () => {
    // MEDIDO: con un solo módulo `(0 - 4) % 6` vale -4 —el signo es el del DIVIDENDO—, cae fuera de
    // [-2, +3], no casa con ninguna clave de `data-distancia` y la foto DESAPARECE del arco.
    expect(distanciaCircular(0, 4, TOTAL)).toBe(2)
  })

  it('@s4 ninguna de las 36 combinaciones de (foto, centrada) cae fuera del rango [-2, +3]', () => {
    for (const activo of FOTOS) {
      for (const indice of FOTOS) {
        const distancia = distanciaCircular(indice, activo, TOTAL)

        expect(distancia).toBeGreaterThanOrEqual(-2)
        expect(distancia).toBeLessThanOrEqual(3)
      }
    }
  })

  it('@s4 avanzar seis posiciones desde cualquier foto vuelve a esa misma foto, y retroceder seis también', () => {
    for (const indice of FOTOS) {
      expect(indiceCircular(indice + TOTAL, TOTAL)).toBe(indice)
      expect(indiceCircular(indice - TOTAL, TOTAL)).toBe(indice)
    }
  })

  it('@s4 el índice circular da la vuelta por los DOS extremos: tras la última va la 1ª, antes de la 1ª va la última', () => {
    // Los dos valores van escritos A MANO: `6 % 6 === 0` y `(-1 + 6) % 6 === 5`.
    expect(indiceCircular(6, TOTAL)).toBe(0)
    expect(indiceCircular(-1, TOTAL)).toBe(5)
  })
})

describe('@s5 la CLAVE de posición usa el valor absoluto y el signo viaja aparte', () => {
  it.each([
    { distancia: 0, clave: '0' },
    { distancia: 1, clave: '1' },
    { distancia: -1, clave: '1' },
    { distancia: 2, clave: '2' },
    { distancia: -2, clave: '2' },
    { distancia: 3, clave: '3' },
  ])('@s5 la distancia $distancia publica data-distancia="$clave"', ({ distancia, clave }) => {
    // La caída del domo es una función PAR de la distancia: las dos vecinas caen lo mismo. Por eso
    // la clave es el VALOR ABSOLUTO y el lado lo dice `--s`.
    expect(claveDistancia(distancia)).toBe(clave)
  })

  it.each([
    { distancia: -2, signo: -1 },
    { distancia: -1, signo: -1 },
    { distancia: 0, signo: 0 },
    { distancia: 1, signo: 1 },
    { distancia: 3, signo: 1 },
  ])('@s5 la distancia $distancia tiene signo $signo', ({ distancia, signo }) => {
    expect(signoDe(distancia)).toBe(signo)
  })

  it('@s5 la capa (z-index) es SIEMPRE MAYOR QUE CERO, y entera', () => {
    // Un z-index NEGATIVO pinta la tarjeta POR DETRÁS del fondo del contenedor y la hace
    // desaparecer (gotcha real de Swiper, que genera -1 y -2). Y `z-index` exige un <integer>.
    for (const distancia of [-2, -1, 0, 1, 2, 3]) {
      expect(capaDe(distancia, TOTAL)).toBeGreaterThan(0)
      expect(Number.isInteger(capaDe(distancia, TOTAL))).toBe(true)
    }
  })

  it('@s5 la capa DECRECE ESTRICTAMENTE al crecer la distancia, y las dos que comparten distancia comparten capa', () => {
    for (const distancia of [0, 1, 2]) {
      expect(capaDe(distancia, TOTAL)).toBeGreaterThan(capaDe(distancia + 1, TOTAL))
    }
    // Simétrica: la vecina izquierda y la derecha se pintan en la misma capa.
    for (const distancia of [1, 2]) {
      expect(capaDe(-distancia, TOTAL)).toBe(capaDe(distancia, TOTAL))
    }
  })
})

describe('@s6 @s17 las etiquetas accesibles de la diapositiva y del punto se componen «n de N»', () => {
  it('@s6 las seis diapositivas se llaman «1 de 6» … «6 de 6» (índice 0-based, etiqueta 1-based)', () => {
    // Las seis cadenas van ESCRITAS A MANO, carácter a carácter.
    expect(FOTOS.map((indice) => etiquetaDeDiapositiva(indice, TOTAL))).toEqual([
      '1 de 6',
      '2 de 6',
      '3 de 6',
      '4 de 6',
      '5 de 6',
      '6 de 6',
    ])
  })

  it('@s6 la etiqueta NO repite el alt de la foto ni el total es un número fijo', () => {
    // Con otro total la etiqueta cambia: mata al mutante que hornea el 6.
    expect(etiquetaDeDiapositiva(0, 3)).toBe('1 de 3')
  })

  it('@s17 los seis puntos se llaman «Ver la foto 1 de 6» … «Ver la foto 6 de 6»', () => {
    expect(FOTOS.map((indice) => etiquetaDelPunto(indice, TOTAL))).toEqual([
      'Ver la foto 1 de 6',
      'Ver la foto 2 de 6',
      'Ver la foto 3 de 6',
      'Ver la foto 4 de 6',
      'Ver la foto 5 de 6',
      'Ver la foto 6 de 6',
    ])
  })
})

describe('@s7 la voz de la pista se calla mientras rota sola y habla cuando manda el usuario', () => {
  // La tabla de verdad COMPLETA: la 3ª fila mata al mutante que reduce `rotando && !foco` a
  // `rotando`, y la 2ª al que lo reduce a `!foco`.
  it.each([
    { rotando: true, foco: false, voz: 'off' },
    { rotando: false, foco: false, voz: 'polite' },
    { rotando: true, foco: true, voz: 'polite' },
    { rotando: false, foco: true, voz: 'polite' },
  ])('@s7 rotando=$rotando y foco=$foco ⇒ aria-live="$voz"', ({ rotando, foco, voz }) => {
    expect(vozDeLaPista(rotando, foco)).toBe(voz)
  })
})

describe('@s10 @s11 el predicado de rotación: quién para y quién reanuda', () => {
  /** El estado neutro: nadie ha parado nada, ni ratón, ni foco, ni arranque explícito. */
  const NEUTRO = {
    pausadoPorElUsuario: false,
    raton: false,
    foco: false,
    arranqueExplicito: false,
  }

  it('@s10 sin ratón, sin foco y sin parada del usuario, el carrusel ROTA', () => {
    expect(debeRotar(NEUTRO)).toBe(true)
  })

  it('@s10 el ratón encima PARA la rotación, y al salir REANUDA sola', () => {
    expect(debeRotar({ ...NEUTRO, raton: true })).toBe(false)
    // Salir del carrusel devuelve el estado neutro: vuelve a rotar sin tocar el botón.
    expect(debeRotar({ ...NEUTRO, raton: false })).toBe(true)
  })

  it('@s10 el foco de teclado dentro PARA la rotación (y quien lo mantenga sigue parado)', () => {
    expect(debeRotar({ ...NEUTRO, foco: true })).toBe(false)
  })

  it('@s8 la parada pedida por el usuario GANA sobre todo, incluso sobre el arranque explícito', () => {
    expect(
      debeRotar({
        pausadoPorElUsuario: true,
        raton: false,
        foco: false,
        arranqueExplicito: true,
      }),
    ).toBe(false)
    expect(debeRotar({ ...NEUTRO, pausadoPorElUsuario: true })).toBe(false)
  })

  it('@s11 el arranque explícito GANA sobre el ratón encima y sobre el foco dentro', () => {
    // APG literal: «If a user activates the rotation control button to start rotation … focus
    // and/or hover states within the carousel for pausing rotation are ignored».
    expect(
      debeRotar({
        pausadoPorElUsuario: false,
        raton: true,
        foco: true,
        arranqueExplicito: true,
      }),
    ).toBe(true)
  })
})

describe('@s18 el umbral del arrastre es una constante EXPORTADA, no un número enterrado', () => {
  // [ENMIENDA 3] `MILISEGUNDOS_POR_FOTO` ya NO vive aquí: migró a `carrusel-logica.ts` (compartida
  // con el carrusel de reseñas) y la asevera `carrusel-logica.test.ts` @s9.
  it('@s18 el umbral de arrastre son 48 píxeles', () => {
    expect(UMBRAL_DE_ARRASTRE).toBe(48)
  })
})

describe('@s18 el gesto de arrastre decide cuántos pasos avanzar, con el umbral INYECTADO', () => {
  it('@s18 arrastrar a la IZQUIERDA (desplazamiento negativo) avanza a la SIGUIENTE', () => {
    expect(pasosDelArrastre(-120, 48)).toBe(1)
  })

  it('@s18 arrastrar a la DERECHA (desplazamiento positivo) vuelve a la ANTERIOR', () => {
    expect(pasosDelArrastre(120, 48)).toBe(-1)
  })

  it('@s18 por debajo del umbral no se mueve nada: un toque no es un arrastre', () => {
    expect(pasosDelArrastre(47, 48)).toBe(0)
    expect(pasosDelArrastre(-47, 48)).toBe(0)
    expect(pasosDelArrastre(0, 48)).toBe(0)
  })

  it('@s18 JUSTO en el umbral el gesto ya cuenta: la frontera es inclusiva', () => {
    expect(pasosDelArrastre(48, 48)).toBe(-1)
    expect(pasosDelArrastre(-48, 48)).toBe(1)
  })

  it('@s18 el umbral es un ARGUMENTO: con otro umbral el mismo gesto decide distinto', () => {
    expect(pasosDelArrastre(30, 20)).toBe(-1)
    expect(pasosDelArrastre(30, 200)).toBe(0)
  })

  it('@s19 [ENMIENDA 2] el caso degenerado — 0 píxeles con umbral 0 — no mueve NADA: devuelve 0', () => {
    // Un gesto de 0 px NO tiene dirección: devolver -1 (o +1) sería una dirección ARBITRARIA.
    // `toBe` usa Object.is: también rechaza el -0 que dejaría escapar un `-signoDe(0)` ingenuo.
    expect(pasosDelArrastre(0, 0)).toBe(0)
  })
})
