import { afterEach, describe, expect, it } from 'vitest'

import {
  atiendeLaCandidata,
  CANDIDATA_GALERIA,
  CANDIDATA_RESENAS,
  candidatasRegistradas,
  distanciaAlCentroDe,
  enfocarCandidata,
  esCampoDeEscritura,
  medirCandidata,
  MILISEGUNDOS_POR_FOTO,
  pasoDeTecla,
  PROPORCION_VISIBLE_MINIMA,
  quienAtiendeElTeclado,
  registrarCandidata,
  retirarCandidata,
} from './carrusel-logica'

/**
 * Núcleo PURO compartido por los dos carruseles (galería y, en su ciclo, reseñas). Contrato:
 * `features/galeria_carrusel.feature` v3 (@s9, @s21, @s22) y brief
 * `progress/galeria_v3_resenas_diseno.md` §3/§5.
 *
 * ANTI-TAUTOLOGÍA: todo valor esperado va ESCRITO A MANO; jamás se importa una constante de
 * producción como valor esperado ni se re-ejecuta la función bajo prueba para compararla consigo
 * misma.
 */
describe('@s9 la cadencia del autoplay vive aquí, compartida: NO hay una segunda copia del número', () => {
  it('@s9 la constante exportada vale exactamente 2000 milisegundos', () => {
    // El 2000 va ESCRITO A MANO: 2 s por foto, decisión del CLIENTE (Pablo, 2026-07-23).
    expect(MILISEGUNDOS_POR_FOTO).toBe(2000)
  })
})

describe('@s21 la tecla se convierte en paso por una decisión PURA: flechas mueven, el resto vale cero', () => {
  // La tabla COMPLETA del contrato, con los ocho pasos esperados ESCRITOS A MANO. Shift NO bloquea
  // a propósito: Shift+flecha no es un atajo del navegador y bloquearla sería cargo sin beneficio.
  it.each([
    { tecla: 'ArrowLeft', ctrl: false, alt: false, meta: false, campo: false, paso: -1 },
    { tecla: 'ArrowRight', ctrl: false, alt: false, meta: false, campo: false, paso: 1 },
    { tecla: 'ArrowDown', ctrl: false, alt: false, meta: false, campo: false, paso: 0 },
    { tecla: 'a', ctrl: false, alt: false, meta: false, campo: false, paso: 0 },
    { tecla: 'ArrowRight', ctrl: true, alt: false, meta: false, campo: false, paso: 0 },
    { tecla: 'ArrowLeft', ctrl: false, alt: true, meta: false, campo: false, paso: 0 },
    { tecla: 'ArrowRight', ctrl: false, alt: false, meta: true, campo: false, paso: 0 },
    { tecla: 'ArrowLeft', ctrl: false, alt: false, meta: false, campo: true, paso: 0 },
  ])(
    '@s21 "$tecla" con ctrl=$ctrl alt=$alt meta=$meta campo=$campo pide el paso $paso',
    ({ tecla, ctrl, alt, meta, campo, paso }) => {
      expect(pasoDeTecla({ tecla, ctrl, alt, meta, campoDeTextoActivo: campo })).toBe(paso)
    },
  )

  // Shift NO bloquea, a propósito: la `Pulsacion` no lleva shift — la firma pura no lo admite y el
  // cableado no lo mira. No hay test porque no hay rama: es la ausencia deliberada del contrato.
})

describe('@s21 @s23 qué cuenta como campo de escritura: input, textarea, select o contenteditable', () => {
  // La clasificación es PURA para que el cableado no lleve literales inmatables: se le pasa el
  // `tagName` del elemento activo (MAYÚSCULAS en documentos HTML) y su `isContentEditable`.
  it.each([
    { etiqueta: 'INPUT', editable: false, es: true },
    { etiqueta: 'TEXTAREA', editable: false, es: true },
    { etiqueta: 'SELECT', editable: false, es: true },
    { etiqueta: 'BUTTON', editable: false, es: false },
    { etiqueta: 'DIV', editable: false, es: false },
    { etiqueta: 'BODY', editable: false, es: false },
  ])('@s21 la etiqueta $etiqueta (sin contenteditable) → $es', ({ etiqueta, editable, es }) => {
    expect(esCampoDeEscritura(etiqueta, editable)).toBe(es)
  })

  it('@s21 un elemento contenteditable es campo de escritura sea cual sea su etiqueta', () => {
    expect(esCampoDeEscritura('DIV', true)).toBe(true)
  })
})

describe('@s22 con DOS carruseles atiende el suficientemente visible; si ambos lo están, el más cercano al centro', () => {
  // La tabla del contrato: candidata 0 = la galería, candidata 1 = las reseñas. El «atiende» va
  // como ÍNDICE, con -1 ESCRITO A MANO para «NINGUNO» (anti-tautología: jamás la constante).
  it.each([
    { visG: 0.8, visR: 0.2, cenG: 300, cenR: 900, atiende: 0, que: 'solo una supera el umbral' },
    { visG: 0.2, visR: 0.8, cenG: 900, cenR: 300, atiende: 1, que: 'y es simétrico' },
    { visG: 0.59, visR: 0.0, cenG: 100, cenR: 2000, atiende: -1, que: '0.59 queda BAJO el umbral' },
    {
      visG: 0.6,
      visR: 0.0,
      cenG: 800,
      cenR: 2000,
      atiende: 0,
      que: '0.6 EXACTO ya atiende (INCLUSIVO)',
    },
    {
      visG: 0.9,
      visR: 0.7,
      cenG: 600,
      cenR: 150,
      atiende: 1,
      que: 'las dos lo superan: manda la CERCANÍA',
    },
    {
      visG: 0.7,
      visR: 0.7,
      cenG: 150,
      cenR: 600,
      atiende: 0,
      que: 'a igual proporción decide la cercanía',
    },
  ])(
    '@s22 galería $visG a $cenG px y reseñas $visR a $cenR px ⇒ atiende $atiende — $que',
    ({ visG, visR, cenG, cenR, atiende }) => {
      expect(
        quienAtiendeElTeclado([
          { proporcionVisible: visG, distanciaAlCentro: cenG, focoDentro: false },
          { proporcionVisible: visR, distanciaAlCentro: cenR, focoDentro: false },
        ]),
      ).toBe(atiende)
    },
  )

  it('@s22 el umbral exportado es 0.6: el que usará el IntersectionObserver del cableado', () => {
    // El 0.6 va ESCRITO A MANO (brief v3 §3: «el usuario situado» = la sección en pantalla).
    expect(PROPORCION_VISIBLE_MINIMA).toBe(0.6)
  })

  it('@s22 el empate TOTAL (misma proporción y misma distancia) es estable: atiende la primera registrada', () => {
    // El caso degenerado que la tabla no cubre: sin él, el comparador estricto de la cercanía
    // podría relajarse a <= (quedándose con la ÚLTIMA) sin que ningún test lo viera.
    expect(
      quienAtiendeElTeclado([
        { proporcionVisible: 0.7, distanciaAlCentro: 300, focoDentro: false },
        { proporcionVisible: 0.7, distanciaAlCentro: 300, focoDentro: false },
      ]),
    ).toBe(0)
  })

  it('@s22 sin ninguna candidata registrada nadie atiende', () => {
    expect(quienAtiendeElTeclado([])).toBe(-1)
  })

  it('@s22 con UNA sola candidata: atiende si llega al umbral y no si se queda corta', () => {
    expect(
      quienAtiendeElTeclado([{ proporcionVisible: 0.8, distanciaAlCentro: 0, focoDentro: false }]),
    ).toBe(0)
    expect(
      quienAtiendeElTeclado([{ proporcionVisible: 0.4, distanciaAlCentro: 0, focoDentro: false }]),
    ).toBe(-1)
  })
})

describe('@s22 @s23 el foco dentro ASIGNA la tecla al carrusel enfocado y EXCLUYE al resto', () => {
  it('@s23 la candidata enfocada atiende aunque su visibilidad sea 0: el foco no necesita observador', () => {
    expect(
      quienAtiendeElTeclado([{ proporcionVisible: 0, distanciaAlCentro: 0, focoDentro: true }]),
    ).toBe(0)
  })

  it('@s22 foco en la galería + reseñas visible al 0.8 y MÁS CERCANA: atiende SOLO la galería', () => {
    // El caso (b) del judge (hallazgo 1), alcanzable en pantalla NORMAL: sin esta regla una
    // tecla movería los DOS carruseles a la vez.
    expect(
      quienAtiendeElTeclado([
        { proporcionVisible: 0.7, distanciaAlCentro: 400, focoDentro: true },
        { proporcionVisible: 0.8, distanciaAlCentro: 100, focoDentro: false },
      ]),
    ).toBe(0)
  })

  it('@s22 el foco gana aunque la OTRA esté más visible y más cercana, en cualquier posición del registro', () => {
    expect(
      quienAtiendeElTeclado([
        { proporcionVisible: 0.9, distanciaAlCentro: 50, focoDentro: false },
        { proporcionVisible: 0, distanciaAlCentro: 900, focoDentro: true },
      ]),
    ).toBe(1)
  })
})

describe('@s22 @s8 (reseñas) el registro COMPARTIDO de candidatas: la decisión es UNA, no dos copias', () => {
  // El registro es estado de MÓDULO: cada test retira lo que registró (los componentes hacen lo
  // mismo al desmontar; la limpieza real se asevera en los tests de cableado).
  afterEach(() => {
    retirarCandidata(CANDIDATA_GALERIA)
    retirarCandidata(CANDIDATA_RESENAS)
    retirarCandidata('fantasma')
  })

  it('@s22 los identificadores ESTABLES de las dos candidatas de la página, escritos a mano', () => {
    expect(CANDIDATA_GALERIA).toBe('galeria')
    expect(CANDIDATA_RESENAS).toBe('resenas')
  })

  it('@s22 sin candidatas registradas nadie atiende y el registro está vacío', () => {
    expect(atiendeLaCandidata(CANDIDATA_GALERIA)).toBe(false)
    expect(candidatasRegistradas()).toBe(0)
  })

  it('@s22 una candidata recién registrada, SIN medida del observador, NO atiende (jsdom sin IO)', () => {
    registrarCandidata(CANDIDATA_GALERIA)

    expect(candidatasRegistradas()).toBe(1)
    expect(atiendeLaCandidata(CANDIDATA_GALERIA)).toBe(false)
  })

  it('@s22 con la medida del observador atiende al llegar al umbral y deja de atender por debajo', () => {
    registrarCandidata(CANDIDATA_GALERIA)
    medirCandidata(CANDIDATA_GALERIA, 0.9, 120)

    expect(atiendeLaCandidata(CANDIDATA_GALERIA)).toBe(true)

    medirCandidata(CANDIDATA_GALERIA, 0.4, 120)

    expect(atiendeLaCandidata(CANDIDATA_GALERIA)).toBe(false)
  })

  it('@s22 AMBAS ≥ 0.6 ⇒ atiende UNA sola, la más cercana al centro, y la otra queda EXCLUIDA', () => {
    // El caso (a) del judge: el Then de @s22 es SINGULAR — una tecla, UN carrusel.
    registrarCandidata(CANDIDATA_GALERIA)
    registrarCandidata(CANDIDATA_RESENAS)
    medirCandidata(CANDIDATA_GALERIA, 0.9, 600)
    medirCandidata(CANDIDATA_RESENAS, 0.7, 150)

    expect(atiendeLaCandidata(CANDIDATA_RESENAS)).toBe(true)
    expect(atiendeLaCandidata(CANDIDATA_GALERIA)).toBe(false)
  })

  it('@s22 el foco dentro de la galería EXCLUYE a las reseñas visibles; al salir, vuelve la visibilidad', () => {
    // El caso (b) del judge sobre el registro entero, ida y vuelta.
    registrarCandidata(CANDIDATA_GALERIA)
    registrarCandidata(CANDIDATA_RESENAS)
    medirCandidata(CANDIDATA_RESENAS, 0.8, 100)
    enfocarCandidata(CANDIDATA_GALERIA, true)

    expect(atiendeLaCandidata(CANDIDATA_GALERIA)).toBe(true)
    expect(atiendeLaCandidata(CANDIDATA_RESENAS)).toBe(false)

    enfocarCandidata(CANDIDATA_GALERIA, false)

    expect(atiendeLaCandidata(CANDIDATA_GALERIA)).toBe(false)
    expect(atiendeLaCandidata(CANDIDATA_RESENAS)).toBe(true)
  })

  it('@s22 medir o enfocar un id NO registrado no lo crea: el registro solo crece al registrar', () => {
    medirCandidata('fantasma', 0.9, 0)
    enfocarCandidata('fantasma', true)

    expect(candidatasRegistradas()).toBe(0)
    expect(atiendeLaCandidata('fantasma')).toBe(false)
  })

  it('@s22 retirar una candidata la saca de la decisión y deja el registro con las que queden', () => {
    registrarCandidata(CANDIDATA_GALERIA)
    registrarCandidata(CANDIDATA_RESENAS)
    medirCandidata(CANDIDATA_GALERIA, 0.9, 100)

    expect(atiendeLaCandidata(CANDIDATA_GALERIA)).toBe(true)

    retirarCandidata(CANDIDATA_GALERIA)

    expect(candidatasRegistradas()).toBe(1)
    expect(atiendeLaCandidata(CANDIDATA_GALERIA)).toBe(false)
  })
})

describe('@s22 la distancia al centro se MIDE de la entrada real del observador: nada de ceros fijos', () => {
  // El marco (rootBounds) mide 800 px con su centro en 400; los esperados van ESCRITOS A MANO.
  it.each([
    {
      top: 100,
      height: 200,
      distancia: 200,
      que: 'caja por ENCIMA del centro: el valor absoluto muerde',
    },
    { top: 700, height: 200, distancia: 400, que: 'caja por DEBAJO del centro' },
    { top: 300, height: 200, distancia: 0, que: 'centrada de verdad: 0 MEDIDO, no fijado' },
  ])(
    '@s22 caja en top $top de alto $height ⇒ distancia $distancia — $que',
    ({ top, height, distancia }) => {
      expect(distanciaAlCentroDe({ top, height }, { top: 0, height: 800 })).toBe(distancia)
    },
  )

  it('@s22 el marco no siempre empieza en 0: caja con centro 200 contra marco con centro 400 ⇒ 200', () => {
    expect(distanciaAlCentroDe({ top: 100, height: 200 }, { top: 100, height: 600 })).toBe(200)
  })

  it('@s22 sin rootBounds (marco de otro origen, según la spec) no hay medida: 0, y decide la visibilidad', () => {
    expect(distanciaAlCentroDe({ top: 100, height: 200 }, null)).toBe(0)
  })
})
