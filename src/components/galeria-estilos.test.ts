import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/**
 * El ESCENARIO 3D del carrusel de la galería, sobre los BYTES del SCSS module (@s13, @s14, @s15 y
 * el color de los puntos de @s17). El SCSS no es mutable —Stryker no ve CSS— y la puerta de
 * contraste solo lee `_tokens.scss`: estos tests son la ÚNICA red de lo visual. Patrón del repo:
 * `hero-estilos.test.ts`, `equipo-estilos.test.ts`.
 *
 * ANTI-TAUTOLOGÍA: cada valor esperado va ESCRITO A MANO y se LEE del SCSS; jamás se importa.
 * Las trampas que vigila cada aserción hunden la implementación EN SILENCIO, sin error en consola.
 */
const RUTA_SCSS = 'src/components/galeria.module.scss'

function scss(): string {
  return readFileSync(RUTA_SCSS, 'utf8')
}

/**
 * El cuerpo (entre llaves) del PRIMER bloque cuyo encabezado casa `encabezado`, contando llaves
 * para respetar el anidamiento. Robusto al reformateo de prettier.
 */
function cuerpoDelBloque(fuente: string, encabezado: RegExp): string | null {
  const cabeza = encabezado.exec(fuente)

  if (cabeza === null) {
    return null
  }

  const apertura = fuente.indexOf('{', cabeza.index)

  if (apertura < 0) {
    return null
  }

  let profundidad = 0

  for (let i = apertura; i < fuente.length; i++) {
    if (fuente[i] === '{') {
      profundidad += 1
    } else if (fuente[i] === '}') {
      profundidad -= 1

      if (profundidad === 0) {
        return fuente.slice(apertura + 1, i)
      }
    }
  }

  return null
}

/** El cuerpo de una regla, exigiendo que exista. */
function regla(fuente: string, encabezado: RegExp, nombre: string): string {
  const cuerpo = cuerpoDelBloque(fuente, encabezado)

  expect(cuerpo, `no se encontró la regla ${nombre}`).not.toBeNull()

  return cuerpo as string
}

/** La regla base de una clase del module (`.tarjeta {`), la PRIMERA del fichero. */
function reglaBase(clase: string): string {
  return regla(scss(), new RegExp(`\\.${clase}\\s*\\{`), `.${clase}`)
}

/** El cuerpo del bloque de una distancia (`[data-distancia='2']`) dentro de un ámbito dado. */
function porDistancia(ambito: string, distancia: number): string {
  return regla(
    ambito,
    new RegExp(`\\[data-distancia='${distancia}'\\]\\s*\\{`),
    `distancia ${distancia}`,
  )
}

/** El valor NUMÉRICO de una custom property (`--giro: -34deg` → -34). */
function magnitud(cuerpo: string, propiedad: string): number {
  const encontrado = new RegExp(`--${propiedad}\\s*:\\s*(-?[\\d.]+)`).exec(cuerpo)

  expect(encontrado, `falta --${propiedad}`).not.toBeNull()

  return Number((encontrado as RegExpExecArray)[1])
}

/** La única declaración `transform: …;` del fichero. */
function declaracionTransform(): string {
  const encontrada = /transform\s*:\s*([^;]+);/.exec(scss())

  expect(encontrada, 'falta la declaración transform').not.toBeNull()

  return (encontrada as RegExpExecArray)[1]
}

/** El cuerpo del @media del móvil, el ÚNICO breakpoint que la galería introduce. */
function mediaMovil(): string {
  return regla(scss(), /@media\s*\(\s*max-width:\s*640px\s*\)\s*\{/, '@media (max-width: 640px)')
}

const DISTANCIAS = [0, 1, 2, 3]

describe('@s13 la caja del escenario 3D: perspectiva sí, preserve-3d NO, y el recorte fuera', () => {
  it('@s13 declara la PROPIEDAD perspective y NUNCA la función perspective() dentro de una transform', () => {
    // `perspective()` dentro de la transform de la tarjeta daría SEIS puntos de fuga distintos: son
    // seis volteos independientes, no un coverflow. La perspectiva va en el CONTENEDOR.
    expect(scss()).toMatch(/[;{\s]perspective\s*:\s*\d+px/)
    expect(scss()).not.toContain('perspective(')
    expect(reglaBase('escenario')).toMatch(/perspective\s*:\s*\d+px/)
  })

  it('@s13 NO declara transform-style: preserve-3d en ninguna regla', () => {
    // CON `preserve-3d` el orden de pintado lo decide el algoritmo de Newell sobre la geometría y
    // `z-index` solo ordena elementos COPLANARES — las laterales están ROTADAS. SIN él, cada
    // tarjeta crea contexto de apilamiento por su propio `transform` y el z-index de @s5 es la
    // autoridad, determinista en todos los motores. ES DELIBERADO: quien lo «arregle» rompe @s5.
    expect(scss()).not.toMatch(/transform-style\s*:\s*preserve-3d/)
    expect(scss()).not.toContain('preserve-3d')
  })

  it('@s13 «overflow: hidden» NO vive en la misma regla que «perspective»: recorta un ancestro', () => {
    // `overflow` en el elemento con `perspective` APLANA el 3D. `overflow: clip` no es escapatoria
    // (csswg-drafts#6374, abierto desde 2021).
    expect(reglaBase('escenario')).not.toMatch(/overflow\s*:/)
    expect(reglaBase('marco')).toMatch(/overflow\s*:\s*hidden/)
    expect(reglaBase('marco')).not.toMatch(/perspective\s*:/)
  })

  it('@s13 la propiedad opacity NO aparece en la regla de la tarjeta: se aplica al hijo que envuelve la imagen', () => {
    // `opacity` es GROUPING PROPERTY de la spec: en la tarjeta aplanaría todo su subárbol.
    expect(reglaBase('tarjeta')).not.toMatch(/[;{\s]opacity\s*:/)
    expect(reglaBase('lienzo')).toMatch(/opacity\s*:\s*var\(--opacidad/)
  })

  it('@s13 no declara will-change, ni filter: drop-shadow(, ni content-visibility: auto', () => {
    // `filter` distinto de `none` aplana el 3D; `content-visibility: auto` aplica contención de
    // pintado y también; `will-change` en seis tarjetas lo desaconseja MDN expresamente.
    const hoja = scss()

    expect(hoja).not.toMatch(/will-change\s*:/)
    expect(hoja).not.toContain('drop-shadow(')
    expect(hoja).not.toMatch(/content-visibility\s*:\s*auto/)
    // La sombra de elevación va con box-shadow, que sí respeta el 3D.
    expect(reglaBase('tarjeta')).toMatch(/box-shadow\s*:/)
  })
})

describe('@s14 una ÚNICA declaración de transform, con las funciones en el orden que dibuja un coverflow', () => {
  it('@s14 hay EXACTAMENTE UNA declaración «transform:» en toda la hoja, y vive en la tarjeta', () => {
    // Si dos listas de `transform` no tienen las MISMAS funciones en el MISMO orden, el navegador
    // cae en descomposición de matriz + Slerp de cuaterniones y la trayectoria deja de ser la
    // diseñada. Por eso las reglas de posición SOLO tocan custom properties.
    expect((scss().match(/transform\s*:/g) ?? []).length).toBe(1)
    expect(reglaBase('tarjeta')).toMatch(/transform\s*:/)
  })

  it('@s14 el orden es traslación → rotateY → scale', () => {
    // `rotateY` ANTES de trasladar ⇒ anillo cilíndrico, no coverflow. `scale` ANTES de trasladar ⇒
    // la matriz es S·T y la separación queda MULTIPLICADA por la escala: el abanico deriva.
    const lista = declaracionTransform()

    expect(lista).toContain('translate3d(')
    expect(lista.indexOf('translate3d(')).toBeLessThan(lista.indexOf('rotateY('))
    expect(lista.indexOf('rotateY(')).toBeLessThan(lista.indexOf('scale('))
  })

  it('@s14 NINGUNA regla declara «transform: none» para la tarjeta centrada', () => {
    // Cambiaría la longitud de la lista de funciones Y destruiría el contexto de apilamiento, con
    // lo que el z-index de @s5 dejaría de aplicar. La central escribe la lista entera con --s: 0.
    expect(scss()).not.toMatch(/transform\s*:\s*none/)
    expect(porDistancia(reglaBase('tarjeta'), 0)).not.toMatch(/transform\s*:/)
  })

  it('@s14 cada custom property de la transform lleva su valor de RESERVA', () => {
    // [CRITICO] Si `--s` falta o llega vacía, `transform` cae a su valor INICIAL `none` (regla de
    // *invalid at computed-value time*), NO a la declaración anterior de la cascada: las seis
    // tarjetas se apilan en el centro SIN ningún error en consola. El fallback es el seguro.
    const lista = declaracionTransform()

    for (const reserva of [
      'var(--s, 0)',
      'var(--x, 0%)',
      'var(--y, 0px)',
      'var(--z, 0px)',
      'var(--giro, 0deg)',
      'var(--escala, 1)',
    ]) {
      expect(lista).toContain(reserva)
    }
  })

  it('@s14 las magnitudes por posición se fijan con selectores de atributo, de 0 a 3, nunca con una clase de estado', () => {
    const tarjeta = reglaBase('tarjeta')

    for (const distancia of DISTANCIAS) {
      const cuerpo = porDistancia(tarjeta, distancia)

      for (const propiedad of ['x', 'y', 'z', 'giro', 'escala', 'opacidad']) {
        expect(cuerpo, `distancia ${distancia} necesita --${propiedad}`).toMatch(
          new RegExp(`--${propiedad}\\s*:`),
        )
      }
    }
  })

  it('@s14 la transición dura 0.8s con la curva cubic-bezier(0.22, 1, 0.36, 1), con las dos x dentro de [0, 1]', () => {
    // ⚠️ `cubic-bezier` exige x1 y x2 en [0,1]; fuera de rango la declaración entera se descarta EN
    // SILENCIO y te quedas con `ease` sin saber por qué (la `y` sí puede salirse).
    const tarjeta = reglaBase('tarjeta')

    expect(tarjeta).toMatch(/transition\s*:\s*transform\s+0\.8s\s+cubic-bezier\(/)
    expect(tarjeta).toContain('cubic-bezier(0.22, 1, 0.36, 1)')

    const curva = /cubic-bezier\(([^)]+)\)/.exec(tarjeta) as RegExpExecArray
    const [x1, , x2] = curva[1].split(',').map((n) => Number(n.trim()))

    for (const x of [x1, x2]) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(1)
    }
  })

  it('@s14 el DOMO: la centrada se ELEVA (--y negativo) y las laterales CAEN (--y positivo)', () => {
    const tarjeta = reglaBase('tarjeta')

    expect(magnitud(porDistancia(tarjeta, 0), 'y')).toBeLessThan(0)
    for (const distancia of [1, 2, 3]) {
      expect(magnitud(porDistancia(tarjeta, distancia), 'y')).toBeGreaterThan(0)
    }
    // Y se alejan: la separación, la profundidad y el giro CRECEN con la distancia.
    for (const distancia of [1, 2]) {
      const cerca = porDistancia(tarjeta, distancia)
      const lejos = porDistancia(tarjeta, distancia + 1)

      expect(magnitud(lejos, 'x')).toBeGreaterThan(magnitud(cerca, 'x'))
      expect(Math.abs(magnitud(lejos, 'z'))).toBeGreaterThan(Math.abs(magnitud(cerca, 'z')))
      expect(Math.abs(magnitud(lejos, 'giro'))).toBeGreaterThan(Math.abs(magnitud(cerca, 'giro')))
      expect(magnitud(lejos, 'escala')).toBeLessThan(magnitud(cerca, 'escala'))
      expect(magnitud(lejos, 'opacidad')).toBeLessThan(magnitud(cerca, 'opacidad'))
    }
    // La oculta se apaga del todo y la centrada está entera.
    expect(magnitud(porDistancia(tarjeta, 3), 'opacidad')).toBe(0)
    expect(magnitud(porDistancia(tarjeta, 0), 'opacidad')).toBe(1)
  })
})

describe('@s15 el móvil suaviza el 3D, el movimiento reducido lo congela y la oculta no barre la pantalla', () => {
  it('@s15 en @media (max-width: 640px) el giro, la separación y la profundidad son MENORES que en escritorio', () => {
    const escritorio = reglaBase('tarjeta')
    const movil = mediaMovil()

    for (const distancia of [1, 2, 3]) {
      const grande = porDistancia(escritorio, distancia)
      const pequeno = porDistancia(movil, distancia)

      expect(Math.abs(magnitud(pequeno, 'giro'))).toBeLessThan(Math.abs(magnitud(grande, 'giro')))
      expect(Math.abs(magnitud(pequeno, 'z'))).toBeLessThan(Math.abs(magnitud(grande, 'z')))
      expect(Math.abs(magnitud(pequeno, 'y'))).toBeLessThan(Math.abs(magnitud(grande, 'y')))
    }
  })

  it('@s15 en el móvil las vecinas SIGUEN ASOMANDO: su opacidad a distancia 1 es mayor que cero', () => {
    expect(magnitud(porDistancia(mediaMovil(), 1), 'opacidad')).toBeGreaterThan(0)
  })

  it('@s15 640px es el ÚNICO breakpoint que la galería introduce', () => {
    // Es el que YA usa el repo (`_demo.scss`). No se inventa otro.
    const anchos = [...scss().matchAll(/@media[^{]*?(\d+)px/g)].map((m) => m[1])

    expect(anchos.length).toBeGreaterThan(0)
    expect([...new Set(anchos)]).toEqual(['640'])
  })

  it('@s15 ningún giro alcanza los 90 grados en valor absoluto, en ninguno de los dos tamaños', () => {
    // Los defectos de Swiper (`rotate: 50`) son LINEALES y a distancia 2 dan 100°: la tarjeta pasa
    // de perfil y se ve ESPEJADA POR DETRÁS. Los de aquí son SATURANTES.
    const giros = [...scss().matchAll(/--giro\s*:\s*(-?[\d.]+)deg/g)].map((m) => Number(m[1]))

    expect(giros.length).toBeGreaterThanOrEqual(8)
    for (const giro of giros) {
      expect(Math.abs(giro)).toBeLessThan(90)
    }
  })

  it('@s15 declara @media (prefers-reduced-motion: reduce) que anula las transiciones con transition: none', () => {
    const media = regla(
      scss(),
      /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/,
      '@media (prefers-reduced-motion: reduce)',
    )

    expect(media).toMatch(/\.tarjeta\b/)
    expect(media).toMatch(/transition\s*:\s*none/)
  })

  it('@s15 la tarjeta OCULTA declara transition: none TAMBIÉN fuera de ese @media', () => {
    // EL SALTO DEL BUCLE: cada tarjeta hace UNA discontinuidad por vuelta, de -2 a +3. Si ESA
    // transicionara, barrería todo el escenario de izquierda a derecha en 0,8 s. Entrar en oculta
    // es instantáneo e invisible; salir (+3 → +2) sí transiciona, desde el borde derecho.
    expect(porDistancia(reglaBase('tarjeta'), 3)).toMatch(/transition\s*:\s*none/)
  })

  it('@s15 la tarjeta OCULTA declara pointer-events: none: a opacidad 0 no puede seguir capturando clics', () => {
    // [ENMIENDA 1, aviso 🔵 eje 6] La oculta tiene opacidad 0 pero z-index 3 (> 0, por @s5) y el
    // clic de centrar de @s18 encima: sin esto queda una franja INVISIBLE junto al borde derecho
    // que roba el clic y cambia la foto «sola». Con él, el clic atraviesa hasta lo que SÍ se ve.
    expect(porDistancia(reglaBase('tarjeta'), 3)).toMatch(/pointer-events\s*:\s*none/)
  })

  it('@s15 no aparece ningún url(https:// ni @import url(, y no se añade ni se quita ninguna @font-face', () => {
    // La puerta de terceros: el conjunto de `@font-face` es EXACTO (6) y tocarlo mata el build.
    const hoja = scss()

    expect(hoja).not.toMatch(/url\(\s*['"]?https?:/i)
    expect(hoja).not.toContain('@import url(')
    expect(hoja).not.toContain('@font-face')
  })
})

describe('@s19 [ENMIENDA 2] el marco cede el gesto vertical al navegador y se queda el horizontal', () => {
  it('@s19 la regla del MARCO declara touch-action: pan-y', () => {
    // En pantalla táctil, SIN él, el navegador reclama el gesto horizontal para hacer scroll y
    // dispara pointercancel: el arrastre muere sin pointerup. jsdom no puede verlo (no hay táctil
    // ni scroll reales): se asevera por BYTES, como el resto del SCSS de este fichero.
    expect(reglaBase('marco')).toMatch(/touch-action\s*:\s*pan-y/)
  })
})

describe('@s24 [ENMIENDA 3] los mandos son círculos de cristal SOBRE el marco y la fila externa desaparece', () => {
  /**
   * La regla COMPARTIDA de los tres mandos: su encabezado es un grupo con coma
   * (`.rotacion, .flechaAnterior, .flechaSiguiente {`), así que se busca la clase en CUALQUIER
   * posición del encabezado — `reglaBase` solo casa la clase pegada a la llave.
   */
  function reglaDelMando(clase: string): string {
    return regla(scss(), new RegExp(`\\.${clase}[^{}]*\\{`), `.${clase}`)
  }

  const MANDOS = ['rotacion', 'flechaAnterior', 'flechaSiguiente']

  it('@s24 el SCSS ya NO contiene la regla de la fila .mandos', () => {
    expect(scss()).not.toMatch(/\.mandos\b/)
  })

  it('@s24 los tres mandos declaran position: absolute: viven SOBRE el marco, no en una fila', () => {
    for (const mando of MANDOS) {
      expect(reglaDelMando(mando), `.${mando}`).toMatch(/position\s*:\s*absolute/)
    }
  })

  it('@s24 la caja de los tres mide 2.75rem por lado (44 px CSS: SUPERA los 24 de SC 2.5.8)', () => {
    for (const mando of MANDOS) {
      expect(reglaDelMando(mando), `.${mando}`).toMatch(/width\s*:\s*2\.75rem/)
      expect(reglaDelMando(mando), `.${mando}`).toMatch(/height\s*:\s*2\.75rem/)
    }
  })

  it('@s24 el cristal: fondo color-mix( con var(--surface) y transparent, y backdrop-filter: blur(', () => {
    for (const mando of MANDOS) {
      const cuerpo = reglaDelMando(mando)

      expect(cuerpo, `.${mando}`).toMatch(/background\s*:\s*color-mix\(/)
      expect(cuerpo, `.${mando}`).toContain('var(--surface)')
      expect(cuerpo, `.${mando}`).toContain('transparent')
      expect(cuerpo, `.${mando}`).toMatch(/backdrop-filter\s*:\s*blur\(/)
      // La base al 85 % (auditoría a11y del lote, eje 1): con el 78 % el borde caía a 2,67:1
      // sobre un píxel casi negro; al 85 % el suelo del compuesto es #D9D9D9 — borde 3,20:1 y
      // glifo 4,39:1 INCONDICIONALES, sobre cualquier foto imaginable.
      expect(cuerpo, `.${mando}`).toContain('color-mix(in srgb, var(--surface) 85%, transparent)')
    }
  })

  it('@s24 borde var(--border-interactive) y glifo var(--accent-dark): NI UN color nuevo', () => {
    // La puerta de contraste solo lee `_tokens.scss`: un color inventado aquí sería INVISIBLE
    // para ella. Mismos tokens que los puntos de @s17.
    for (const mando of MANDOS) {
      const cuerpo = reglaDelMando(mando)

      expect(cuerpo, `.${mando}`).toMatch(/border\s*:\s*1px solid var\(--border-interactive\)/)
      expect(cuerpo, `.${mando}`).toMatch(/color\s*:\s*var\(--accent-dark\)/)
    }
  })

  it('@s24 su z-index es MAYOR QUE 6: por encima de la capa máxima de las tarjetas (capaDe(0, 6) = 6)', () => {
    for (const mando of MANDOS) {
      const capa = /z-index\s*:\s*(\d+)/.exec(reglaDelMando(mando))

      expect(capa, `.${mando} necesita z-index`).not.toBeNull()
      expect(Number((capa as RegExpExecArray)[1])).toBeGreaterThan(6)
    }
  })

  it('@s24 las flechas anclan cada una a SU lateral y el chip arriba: left, right y top declarados', () => {
    // La posición FINA se comprueba EN VIVO (contrato): aquí solo el anclaje de cada lado. El
    // regex busca la regla PROPIA (clase pegada a la llave, sin coma: el grupo compartido no casa
    // o no contiene el anclaje) con la declaración dentro de su cuerpo.
    expect(scss()).toMatch(/\.flechaAnterior\s*\{[^}]*left\s*:/)
    expect(scss()).toMatch(/\.flechaSiguiente\s*\{[^}]*right\s*:/)
    expect(scss()).toMatch(/\.rotacion\s*\{[^}]*top\s*:/)
  })

  it('@s24 NINGÚN mando se oculta en ningún tamaño: sin display: none, sin visibility: hidden, sin opacity', () => {
    // En táctil no hay hover que los revele: la hoja ENTERA queda sin display:none ni
    // visibility:hidden (hoy no los usa para nada), y los mandos sin opacity propia. El
    // lookbehind excluye `backface-visibility: hidden` (la de la tarjeta, legítima desde v2).
    expect(scss()).not.toMatch(/display\s*:\s*none/)
    expect(scss()).not.toMatch(/(?<![a-z-])visibility\s*:\s*hidden/)
    for (const mando of MANDOS) {
      expect(reglaDelMando(mando), `.${mando}`).not.toMatch(/[^-]opacity\s*:/)
    }
  })
})

describe('@s17 el punto ACTUAL se distingue del disponible por COLOR, no solo por opacidad', () => {
  it('@s17 el punto actual y el disponible usan DOS tokens distintos de fondo', () => {
    // (N) SC 1.4.11 Non-text Contrast (AA) — el texto del criterio dice «components AND STATES»: la
    // diferencia entre el punto actual y el disponible ES UN ESTADO ⇒ exige ≥ 3:1. Distinguirlos
    // con `opacity: .4` frente a `1` del MISMO rosa FALLA.
    const punto = reglaBase('punto')
    const actual = regla(punto, /\[data-actual='sí'\]\s*\{/, "[data-actual='sí']")
    const tokenDe = (cuerpo: string) =>
      (/background\s*:\s*var\((--[a-z0-9-]+)\)/.exec(cuerpo) as RegExpExecArray)[1]

    expect(tokenDe(punto)).not.toBe(tokenDe(actual))
    // Y el estado no se apoya en la opacidad para distinguirse.
    expect(actual).not.toMatch(/opacity\s*:/)
  })

  it('@s17 los puntos NO se pintan con --accent (4,37:1, falla AA) ni delimitan con --line', () => {
    // --accent-dark para el acento y --border-interactive para el borde: --line es el separador
    // DECORATIVO y no identifica un control.
    const punto = reglaBase('punto')

    expect(punto).not.toMatch(/var\(--accent\)/)
    expect(punto).not.toMatch(/var\(--line\)/)
    expect(punto).toMatch(/var\(--border-interactive\)/)
  })

  it('@s17 la caja interactiva del punto mide 1.5rem por lado y el círculo visible sigue en 0.75rem', () => {
    // [ENMIENDA 1, aviso 🟡 eje 4] (N) SC 2.5.8 Target Size (AA, WCAG 2.2): con dianas de 12 px y
    // hueco de 8 px los círculos de 24 px de la prueba del criterio se SOLAPAN. La CAJA del
    // <button> pasa a 1.5rem (24 px CSS) y el aspecto de 12 px se conserva: AMBAS medidas
    // declaradas, como exige el contrato.
    const punto = reglaBase('punto')

    expect(punto).toMatch(/width\s*:\s*1\.5rem/)
    expect(punto).toMatch(/height\s*:\s*1\.5rem/)

    const circulo = regla(punto, /&::before\s*\{/, '.punto::before')

    expect(circulo).toMatch(/width\s*:\s*0\.75rem/)
    expect(circulo).toMatch(/height\s*:\s*0\.75rem/)
    expect(circulo).toMatch(/border-radius\s*:\s*50%/)
  })

  it('@s17 el anillo de 1px viaja EN el pseudo-elemento y el estado actual pinta el círculo, no la caja', () => {
    // [OJO del contrato] `background-clip: content-box` recorta el FONDO pero NO el borde (que se
    // pinta siempre en el borde de la caja): el círculo entero — anillo incluido — vive en el
    // ::before, y la caja de 24 px queda invisible (sin borde ni fondo propios).
    const punto = reglaBase('punto')

    expect(punto).not.toMatch(/background-clip/)

    const circulo = regla(punto, /&::before\s*\{/, '.punto::before')

    expect(circulo).toMatch(/border\s*:\s*1px solid var\(--border-interactive\)/)

    const actual = regla(punto, /\[data-actual='sí'\]\s*\{/, "[data-actual='sí']")

    expect(regla(actual, /&::before\s*\{/, 'el ::before del punto actual')).toMatch(
      /background\s*:\s*var\(--accent-dark\)/,
    )
  })

  it('@s17 las cajas de 24 px NO se solapan: el hueco entre puntos se encoge, pero no baja de cero', () => {
    // El gap del grupo se declara en rem y es ≥ 0 por construcción del regex (sin signo): un
    // margen negativo que reintrodujera el solape tampoco aparece.
    const puntos = reglaBase('puntos')

    expect(puntos).toMatch(/gap\s*:\s*[\d.]+rem/)
    expect(puntos).not.toMatch(/margin[^:;]*:\s*-/)
    expect(reglaBase('punto')).not.toMatch(/margin[^:;]*:\s*-/)
  })
})
