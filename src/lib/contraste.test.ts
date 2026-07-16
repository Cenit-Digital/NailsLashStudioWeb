import { canalLineal, componer, hexARgb, luminancia, ratio } from './contraste'

// Contrato: features/tokens_paleta_contraste.feature — la capa PURA (@s1-@s9).
//
// ANTI-TAUTOLOGÍA (regla dura del stack, y la más importante aquí): los canales, las
// luminancias, los ratios y los umbrales esperados se escriben A MANO. NUNCA se recomputan
// con la función de producción que se vigila, ni re-llamando a `canalLineal`/`ratio` dentro
// del test. Si el test reflejara la fórmula, una fórmula rota pasaría verde y todos los
// mutantes de la acceptance 7 sobrevivirían.

describe('hexARgb — parseo del hex a canales 0-255', () => {
  // @s1. Escritos a mano: 162 = 0xA2, 62 = 0x3E, 95 = 0x5F; 24 = 0x18, 98 = 0x62, 55 = 0x37.
  // #A23E5F es --accent-dark y #186237 es «en línea»: tokens reales de la paleta corregida,
  // con aporte de los tres canales.
  it.each([
    ['#000000', [0, 0, 0]],
    ['#FFFFFF', [255, 255, 255]],
    ['#A23E5F', [162, 62, 95]],
    ['#186237', [24, 98, 55]],
  ])('@s1 convierte "%s" a tres enteros 0-255', (hex, esperado) => {
    expect(hexARgb(hex)).toEqual(esperado)
  })

  // @s2. "#123" expande a "#112233" → [17, 34, 51] (0x11=17, 0x22=34, 0x33=51). A mano.
  it.each([
    ['#fff', [255, 255, 255]],
    ['#000', [0, 0, 0]],
    ['#123', [17, 34, 51]],
  ])('@s2 expande la forma corta "%s"', (hex, esperado) => {
    expect(hexARgb(hex)).toEqual(esperado)
  })

  // @s3. Cierra el caso límite 6: el parser normaliza la caja. Los canales, a mano.
  it('@s3 es insensible a mayúsculas/minúsculas', () => {
    expect(hexARgb('#a23e5f')).toEqual([162, 62, 95])
    expect(hexARgb('#A23E5F')).toEqual([162, 62, 95])
  })

  // @s4. Falla cerrada (derivación de I-3, igual que F-01): ante un hex que el SCSS no
  // debería contener, lanzar en vez de devolver [0,0,0] a medias, que la puerta confundiría
  // con un color real y evaluaría un ratio falso.
  //
  // LA ÚLTIMA FILA ANCLA EL `^` de HEX_VALIDO. Es la única de las seis que lo hace: las otras
  // cinco se comportan IDÉNTICO con ancla y sin ella (verificado una a una), porque ninguna
  // TERMINA en un hex válido y el `$` ya las rechaza. Sin el `^`, "1px solid #AB5F79" casaría
  // por el final, hexARgb NO lanzaría, haría slice(1) = "px solid #AB5F79" y devolvería
  // [NaN, NaN, NaN] — «canales a medias», justo lo que este escenario prohíbe. Y no es
  // rebuscado: `--border: 1px solid #AB5F79` es un valor de token plausible, y la puerta lee
  // valores de token del SCSS (@s10, @s11).
  // Añadida por MUTACIÓN (superviviente real) con aprobación humana en la puerta el
  // 2026-07-16; mismo patrón que la fila `| 600  123  456 |` de @s5 en F-01. Hueco del
  // CONTRATO, no del código: la producción no cambió.
  it.each([
    ['', 'cadena vacía: no hay hex'],
    ['A23E5F', 'sin "#": el parser lo exige'],
    ['#GGGGGG', 'dígitos no hexadecimales'],
    ['#12', 'longitud inválida: ni 3 ni 6 dígitos'],
    ['#12345', 'longitud inválida: 5 dígitos'],
    ['1px solid #AB5F79', 'shorthand de borde: NO empieza por "#" pero TERMINA en un hex válido'],
  ])('@s4 lanza ante el hex malformado "%s" (%s)', (entrada) => {
    expect(() => hexARgb(entrada)).toThrow()
  })
})

describe('canalLineal — linealización sRGB y el umbral 0.04045', () => {
  // @s5. Dos anclas EXACTAS y hand-checkables. Matan los mutantes de condición de Stryker
  // que fuerzan la rama:
  //   - condición a `true` (siempre lineal)   → canalLineal(255) = 1/12.92 ≈ 0,077 ≠ 1
  //   - condición a `false` (siempre potencia) → canalLineal(0) = (0.055/1.055)^2.4 ≈ 0,000834 ≠ 0
  it.each([
    [0, 0, 'lineal: 0/12.92 = 0 exacto'],
    [255, 1, 'potencia: ((1+0.055)/1.055)^2.4 = 1^2.4 = 1 exacto'],
  ])('@s5 canalLineal(%i) es exactamente %i (%s)', (c8, esperado) => {
    expect(canalLineal(c8)).toBe(esperado)
  })

  // @s6 (A-14). El input es SINTÉTICO y está en el punto de corte EXACTO, no vía hex: ningún
  // canal entero c/255 cae ahí (vecinos 10/255 = 0,039216 y 11/255 = 0,043137), así que por
  // hex esta rama no se puede probar. 10.31475 / 255 === 0.04045 exacto (verificado).
  //
  // POR QUÉ `toBe` Y NO `toBeCloseTo`: en el corte las dos ramas difieren solo en ~2,3e-9
  // —la curva sRGB es casi continua ahí por diseño—, así que `toBeCloseTo` NO discrimina
  // (ni siquiera a precisión 8: el hueco es menor que la tolerancia) y dejaría VIVO el
  // mutante `<=` → `<`. Solo la igualdad exacta lo mata.
  //
  // Los esperados van A MANO (0.04045/12.92 = 0,00313080495356…; la rama de potencia en
  // 0.05 = 0,00393593950409…), NUNCA recomputados con canalLineal, que es lo vigilado.
  it('@s6 en el punto de corte 0.04045 usa la rama LINEAL, no la de potencia', () => {
    expect(canalLineal(10.31475)).toBe(0.0031308049535603713)
  })

  it('@s6 por encima del corte (normalizado 0.05) usa la rama de POTENCIA', () => {
    expect(canalLineal(12.75)).toBe(0.003935939504088967)
  })
})

describe('luminancia — los coeficientes 0.2126 / 0.7152 / 0.0722', () => {
  // @s7 (caso límite 5). Los PRIMARIOS PUROS aíslan cada coeficiente con un valor EXACTO
  // escrito a mano, porque canalLineal(255)=1 y canalLineal(0)=0. Un test SOLO con grises
  // (R=G=B) dejaría VIVOS todos estos mutantes:
  //   - mutar 0.2126 → cambia luminancia(#FF0000); 0.7152 → #00FF00; 0.0722 → #0000FF
  //   - mutar el `+` que une los tres términos por `-` → luminancia(#FFFFFF) ≠ 1
  //   - mutar `·` por `/` → cambia todas
  // Los canales se escriben literales (no vía hexARgb) para que ninguna función de
  // producción esté en el camino del input. Verificado: los cinco son exactos en IEEE-754.
  it.each([
    ['#000000 negro', [0, 0, 0], 0],
    ['#FFFFFF blanco (los coeficientes suman 1)', [255, 255, 255], 1],
    ['#FF0000 rojo puro', [255, 0, 0], 0.2126],
    ['#00FF00 verde puro', [0, 255, 0], 0.7152],
    ['#0000FF azul puro', [0, 0, 255], 0.0722],
  ])('@s7 la luminancia de %s es exactamente %s', (_nombre, rgb, esperado) => {
    expect(luminancia(rgb as [number, number, number])).toBe(esperado)
  })
})

describe('ratio — (L1+0.05)/(L2+0.05), con L1 el más claro', () => {
  const BLANCO: [number, number, number] = [255, 255, 255]
  const NEGRO: [number, number, number] = [0, 0, 0]

  // @s8. El 21 es el máximo teórico WCAG y va A MANO: 21 = (1 + 0.05) / (0 + 0.05).
  // Mata `+0.05` → `-0.05` (daría −19), la eliminación del `+0.05` (daría 1/0 = Infinity)
  // y `/` → `·` (daría 1.05·0.05 = 0.0525). Verificado: es exacto en IEEE-754.
  it('@s8 el ratio blanco/negro es exactamente 21', () => {
    expect(ratio(BLANCO, NEGRO)).toBe(21)
  })

  // La simetría fija que L1 es el MÁS CLARO con independencia del orden de los argumentos.
  // El esperado sigue siendo el 21 escrito a mano: no se compara ratio(a,b) con ratio(b,a)
  // —eso sería tautológico y una fórmula rota lo cumpliría—, se anclan LOS DOS al literal.
  it('@s8 ratio(negro, blanco) es igual a ratio(blanco, negro): también exactamente 21', () => {
    expect(ratio(NEGRO, BLANCO)).toBe(21)
  })
})

describe('componer — composición alfa α·fg + (1−α)·bg, en coma flotante (A-16)', () => {
  // @s9 (A-16). El resultado es FLOTANTE, SIN cuantizar a 8 bits: los esperados
  // fraccionarios lo fijan (0.84·255 = 214.2; 0.88·255 = 224.4), escritos a mano. La
  // cuantización es un detalle de RENDER, no del color especificado. De aquí sale que la
  // fila del pie de @s11 valga 4.59 (flotante) y no 4.60 (el valor cuantizado del audit).
  // Verificado: las cuatro filas son exactas en IEEE-754, así que `toEqual` es legítimo.
  it.each([
    ['α=1 → devuelve el fg opaco', [162, 62, 95], 1, [255, 255, 255], [162, 62, 95]],
    ['α=0 → devuelve el fondo', [162, 62, 95], 0, [255, 255, 255], [255, 255, 255]],
    [
      '--line α=.16: 0.16·0 + 0.84·255 = 214.2',
      [0, 0, 0],
      0.16,
      [255, 255, 255],
      [214.2, 214.2, 214.2],
    ],
    [
      'color-mix --bg@.88: 0.88·255 = 224.4',
      [255, 255, 255],
      0.88,
      [0, 0, 0],
      [224.4, 224.4, 224.4],
    ],
  ])('@s9 %s', (_caso, fg, alfa, bg, esperado) => {
    expect(
      componer(fg as [number, number, number], alfa as number, bg as [number, number, number]),
    ).toEqual(esperado)
  })
})
