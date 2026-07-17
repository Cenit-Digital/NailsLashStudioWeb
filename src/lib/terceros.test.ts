import { describe, expect, it } from 'vitest'

import {
  detectarOrigenesExternos,
  type OrigenExterno,
  type RecursoDeArtefacto,
} from './terceros.ts'

/**
 * F-05 — el DETECTOR de orígenes externos (decisor puro). Contrato:
 * features/cero_terceros.feature.
 *
 * 🔴 LA ENTRADA SON LOS BYTES DE `dist/`, NUNCA UN RENDER NI UN DOM. La distinción que ES la
 * feature: PETICIÓN AUTOMÁTICA ≠ HIPERENLACE (HTML Living Standard §4.6.1). Hoy `dist/` trae DIEZ
 * orígenes externos y NI UNO es una petición; prohibirlos rompería F-04 y F-02, que están `done`.
 *
 * ⚠️ ANTI-TAUTOLOGÍA: todo esperado se escribe A MANO. `cdn.tercero.com`, `cdn.jsdelivr.net` y
 * `cdn.ausente.example` son FIXTURES — no hay ningún CDN en este repo y no se inventa ninguno.
 *
 * ⚠️ `coverageAnalysis: perTest`: los fixtures son FUNCIONES llamadas DENTRO del `it`, jamás
 * constantes del `describe`. En F-03 calcular en el `describe` produjo 189 supervivientes FALSOS.
 */

function recursoHtml(contenido: string): RecursoDeArtefacto {
  return { ubicacion: 'dist/index.html', tipo: 'html', contenido }
}

function recursoCss(contenido: string): RecursoDeArtefacto {
  return { ubicacion: 'dist/assets/x.css', tipo: 'css', contenido }
}

describe('los subrecursos del HTML a un origen externo se detectan (@s1)', () => {
  // `marcado` es lo que el Given inyecta (HTML realista, con su cierre); `construccion` es LA
  // ETIQUETA DE APERTURA LITERAL, que es lo que el detector VE y lo que hace falta para
  // localizarla en el fichero. La puerta ACUSA, no gruñe (@s25).
  it.each([
    [
      '<script src="https://cdn.tercero.com/a.js"></script>',
      '<script src="https://cdn.tercero.com/a.js">',
      'https://cdn.tercero.com/a.js',
    ],
    [
      '<script src="http://cdn.tercero.com/a.js"></script>',
      '<script src="http://cdn.tercero.com/a.js">',
      'http://cdn.tercero.com/a.js',
    ],
    [
      '<img src="https://cdn.tercero.com/a.png">',
      '<img src="https://cdn.tercero.com/a.png">',
      'https://cdn.tercero.com/a.png',
    ],
    [
      '<img srcset="https://cdn.tercero.com/a.png 2x">',
      '<img srcset="https://cdn.tercero.com/a.png 2x">',
      'https://cdn.tercero.com/a.png',
    ],
    [
      '<source srcset="https://cdn.tercero.com/a.webp">',
      '<source srcset="https://cdn.tercero.com/a.webp">',
      'https://cdn.tercero.com/a.webp',
    ],
    [
      '<source src="https://cdn.tercero.com/a.mp4">',
      '<source src="https://cdn.tercero.com/a.mp4">',
      'https://cdn.tercero.com/a.mp4',
    ],
    [
      '<iframe src="https://cdn.tercero.com/m.html"></iframe>',
      '<iframe src="https://cdn.tercero.com/m.html">',
      'https://cdn.tercero.com/m.html',
    ],
    [
      '<embed src="https://cdn.tercero.com/a.swf">',
      '<embed src="https://cdn.tercero.com/a.swf">',
      'https://cdn.tercero.com/a.swf',
    ],
    [
      '<object data="https://cdn.tercero.com/a.pdf"></object>',
      '<object data="https://cdn.tercero.com/a.pdf">',
      'https://cdn.tercero.com/a.pdf',
    ],
    [
      '<video src="https://cdn.tercero.com/a.mp4"></video>',
      '<video src="https://cdn.tercero.com/a.mp4">',
      'https://cdn.tercero.com/a.mp4',
    ],
    [
      '<audio src="https://cdn.tercero.com/a.mp3"></audio>',
      '<audio src="https://cdn.tercero.com/a.mp3">',
      'https://cdn.tercero.com/a.mp3',
    ],
    [
      '<track src="https://cdn.tercero.com/a.vtt">',
      '<track src="https://cdn.tercero.com/a.vtt">',
      'https://cdn.tercero.com/a.vtt',
    ],
    [
      '<input type="image" src="https://cdn.tercero.com/b.png">',
      '<input type="image" src="https://cdn.tercero.com/b.png">',
      'https://cdn.tercero.com/b.png',
    ],
    [
      '<use href="https://cdn.tercero.com/s.svg#i"></use>',
      '<use href="https://cdn.tercero.com/s.svg#i">',
      'https://cdn.tercero.com/s.svg#i',
    ],
    // 🔴 LAS DOS ÚLTIMAS FILAS LAS AÑADE LA AMPLIACIÓN DEL 2026-07-17, Y LAS TRAE LA MUTACIÓN.
    // Precedente exacto: el `+` del regex del teléfono en @s5 de F-01. LA MUTACIÓN NO ENCONTRÓ
    // CÓDIGO DE MÁS: ENCONTRÓ CONTRATO DE MENOS.
    //
    // UN ESPACIO EN LA URL, Y NO ES `srcset`: mata el `ConditionalExpression` de terceros.ts:278
    // (`nombre === ATRIBUTO_SRCSET ? … : valor` → `true ? …`). Con el mutante se le aplica
    // `split(' ')[0]` a TODO atributo y el valor sale TRUNCADO (`…/a`). 🔴 EL ORIGEN SE DETECTA
    // IGUAL Y LA CUENTA NO SE MUEVE: SOLO LO CAZA EL ASERTO SOBRE `valor`, que este escenario YA
    // TIENE. Es la lección literal de la tanda: un `Then` que solo cuenta es ciego a las
    // mutaciones de VALOR. Sin espacio en la URL, `split(' ')[0] === valor` y el mutante es
    // INDISTINGUIBLE: por eso ninguna de las otras 14 filas lo mata.
    [
      '<img src="https://cdn.tercero.com/a b.png">',
      '<img src="https://cdn.tercero.com/a b.png">',
      'https://cdn.tercero.com/a%20b.png',
    ],
    // ESPACIOS ALREDEDOR DEL `=`: mata el `Regex` de terceros.ts:58 (`([a-z-]+)\s*=\s*"([^"]*)"` →
    // `([a-z-]+)\S*=\s*"([^"]*)"`). ✅ DECISIÓN 2 DEL HUMANO (2026-07-17): el espaciado alrededor
    // del `=` es OPCIONAL en HTML (`src="x"` ≡ `src = "x"`) [V], así que TOLERARLO ES CORRECTO y el
    // código se queda. El comentario de terceros.ts:57 ASEVERABA esa tolerancia y NINGÚN test la
    // sostenía: una PROMESA SIN PUERTA. Ahora es un HECHO VIGILADO.
    // ⚠️ NO CONFUNDIR con el `\s*`→`\S*` que @s24 nombra: aquél es de `URL_CSS`, y el diseño lo
    // EVITÓ eligiendo `url\(([^)]*)\)` — ése NO ha aparecido. Éste es OTRO, en OTRO regex.
    [
      '<img src = "https://cdn.tercero.com/a.png">',
      '<img src = "https://cdn.tercero.com/a.png">',
      'https://cdn.tercero.com/a.png',
    ],
  ])(
    '@s1 %s se detecta como petición automática a cdn.tercero.com',
    (marcado, construccion, valor) => {
      const detectados = detectarOrigenesExternos([recursoHtml(marcado)], [])

      expect(detectados).toHaveLength(1)
      expect(detectados[0]).toEqual({
        ubicacion: 'dist/index.html',
        construccion,
        origen: 'cdn.tercero.com',
        valor,
      })
    },
  )
})

/**
 * HTML Living Standard §4.6.1, literal [V]: «All external resource links have a fetch and process
 * the linked resource algorithm which describes how the resource is obtained.»
 * ES LA MITAD DE F-05, Y EL ESTÁNDAR LA NOMBRA ÉL MISMO. La clasificación se hace sobre el
 * CONJUNTO TOKENIZADO de `rel`, NUNCA sobre la cadena (@s6, @s7).
 */
describe('un <link> cuyo rel tokenizado contiene un keyword de external resource link se detecta (@s2)', () => {
  it.each([
    ['stylesheet', '§4.6.8.23: «stylesheet […] creates an external resource link»'],
    ['icon', 'external resource link'],
    ['preload', 'external resource link'],
    ['modulepreload', 'external resource link'],
    ['prefetch', 'external resource link'],
    ['manifest', 'external resource link'],
  ])('@s2 <link rel="%s"> a un tercero se detecta (%s)', (rel) => {
    const detectados = detectarOrigenesExternos(
      [recursoHtml(`<link rel="${rel}" href="https://cdn.tercero.com/r">`)],
      [],
    )

    expect(detectados).toHaveLength(1)
    expect(detectados[0].origen).toBe('cdn.tercero.com')
    expect(detectados[0].valor).toBe('https://cdn.tercero.com/r')
  })
})

/**
 * 🔴 CRITERIO DE PROYECTO DECLARADO, NO LETRA. SE ESCRIBE ASÍ O SE ESTÁ MINTIENDO.
 * `preconnect` y `dns-prefetch` son *external resource links* pero NO DESCARGAN RECURSO: abren
 * TCP/TLS o resuelven DNS [V]. NINGUNA SPEC DECIDE EL EJE POR NOSOTROS.
 * EL EJE DE F-05 ES «CONTACTO CON UN ORIGEN EXTERNO SIN ACCIÓN DEL USUARIO» — porque EL TERCERO
 * RECIBE LA IP IGUAL, que es literalmente la justificación entera de F-05. El eje alternativo
 * («petición HTTP de un recurso») dejaría pasar un `preconnect` a un CDN, que entrega la IP sin
 * descargar un byte: una puerta que cumple su letra y falla su propósito.
 */
describe('preconnect y dns-prefetch a un origen externo se detectan — CRITERIO DE PROYECTO (@s3)', () => {
  it.each([['preconnect'], ['dns-prefetch']])(
    '@s3 <link rel="%s"> a un tercero se detecta: el tercero recibe la IP igual',
    (rel) => {
      const detectados = detectarOrigenesExternos(
        [recursoHtml(`<link rel="${rel}" href="https://cdn.tercero.com">`)],
        [],
      )

      expect(detectados).toHaveLength(1)
      expect(detectados[0].origen).toBe('cdn.tercero.com')
    },
  )
})

/**
 * El `url()` de `@font-face` es LETRA NORMATIVA: css-fonts-4 §4.8.1 [V].
 * LA PRIMERA FILA ES EL ESTADO DEL PROTOTIPO, LITERAL Y MEDIDO [V]: pide
 * `Manrope:wght@300;400;500;600;700` y el 300 NO SE USA JAMÁS → es el acceptance 3 Y el 4 en la
 * misma fila, y es exactamente la petición que F-05 existe para que no salga nunca.
 * LA TERCERA es `fonts.gstatic.com`: `googleapis` sirve el CSS, `gstatic` sirve el `.woff2`. Son
 * DOS orígenes y el acceptance nombra los dos; una puerta que solo mire `googleapis` deja salir
 * el binario.
 * ⚠️ Anti-tautología: `'Manrope'` se escribe A MANO; JAMÁS se importa PARES_DE_FUENTE_ESPERADOS.
 */
describe('en el CSS, @import y cualquier url() a un origen externo se detectan (@s4)', () => {
  it.each([
    [
      '@import url(https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700);',
      'fonts.googleapis.com',
    ],
    ['@import "https://cdn.tercero.com/x.css";', 'cdn.tercero.com'],
    [
      "@font-face { font-family: 'Manrope'; src: url(https://fonts.gstatic.com/s/manrope/x.woff2); }",
      'fonts.gstatic.com',
    ],
    ['.h { background-image: url("https://cdn.tercero.com/b.png"); }', 'cdn.tercero.com'],
  ])('@s4 %s se detecta contra %s', (construccion, origen) => {
    const detectados = detectarOrigenesExternos([recursoCss(construccion)], [])

    expect(detectados).toHaveLength(1)
    expect(detectados[0].ubicacion).toBe('dist/assets/x.css')
    expect(detectados[0].origen).toBe(origen)
  })
})

/**
 * 🔴 LAS DOS FILAS DAN EL MISMO RESULTADO, Y *ESO* ES EL CRITERIO CONSERVADOR: LA APLICABILIDAD NO
 * INFLUYE. Ésa es la aserción — no una premisa. El HTML entra DE VERDAD por `recursos`, así que la
 * pinza mide lo que el escenario dice medir.
 * SOLO `@font-face` tiene letra normativa sobre CUÁNDO se pide (css-fonts-4 §4.8.1 [V]); para
 * `background-image` NINGUNA spec lo dice, y un analizador estático NO PUEDE evaluar qué reglas
 * aplican. CONSECUENCIA ACEPTADA Y DECLARADA: un `background-image` externo en una regla muerta
 * rompe el build y hay que venir a la puerta humana. Es el lado correcto en el que equivocarse.
 */
describe('un url() en una regla CSS que quizá no aplica SE MARCA IGUAL — CRITERIO CONSERVADOR (@s5)', () => {
  it.each([
    ['SÍ usa', '<div class="jamas-usada"></div>'],
    ['NO usa', '<div class="otra-clase"></div>'],
  ])('@s5 el artefacto %s la clase "jamas-usada": se marca igual', (_usa, marcado) => {
    const detectados = detectarOrigenesExternos(
      [
        recursoCss('.jamas-usada { background-image: url(https://cdn.tercero.com/b.png); }'),
        recursoHtml(marcado),
      ],
      [],
    )

    expect(detectados).toHaveLength(1)
    expect(detectados[0].ubicacion).toBe('dist/assets/x.css')
    expect(detectados[0].origen).toBe('cdn.tercero.com')
  })
})

/**
 * 🔴🔴 SIN ESTE ESCENARIO, LA REGLA DEL CONJUNTO TOKENIZADO NO ESTÁ ANCLADA Y F-05 DEJA PASAR UNA
 * PETICIÓN REAL A UN TERCERO. Lo cazó el refutador.
 * §4.6.8.1 [V, literal]: «If the element is a link element and the rel attribute also contains the
 * keyword stylesheet […] The alternate keyword modifies the meaning of the stylesheet keyword […]
 * The alternate keyword DOES NOT CREATE A LINK OF ITS OWN.» Y §4.6.8.23: «stylesheet […] creates
 * an external resource link» [V]. → LA HOJA SE PIDE.
 * Un detector que compare `rel === 'stylesheet'` falla aquí; uno que haga
 * `rel.includes('alternate') → no detectar` falla aquí; uno que mire SOLO EL PRIMER TOKEN falla
 * aquí. @s11 es su GEMELO: la diferencia NO está en la cadena, ESTÁ EN EL CONJUNTO.
 */
describe('rel="alternate stylesheet" a un tercero SÍ SE DETECTA — el falso negativo que casi se cuela (@s6)', () => {
  it('@s6 el conjunto tokenizado de rel contiene "stylesheet": la hoja se pide', () => {
    const detectados = detectarOrigenesExternos(
      [
        recursoHtml(
          '<link rel="alternate stylesheet" title="Alto contraste" href="https://cdn.tercero.com/c.css">',
        ),
      ],
      [],
    )

    expect(detectados).toHaveLength(1)
    expect(detectados[0].origen).toBe('cdn.tercero.com')
    expect(detectados[0].valor).toBe('https://cdn.tercero.com/c.css')
  })
})

/**
 * Los KEYWORDS de `rel` se COMPARAN ASCII case-insensitive [V, §4.6.8, literal: «Keywords are
 * always ASCII case-insensitive, and must be compared as such»]. La resolución de rel del
 * artefacto NO ES UN JUEGO DE CAJAS.
 * 🔴 LA FILA `<TAB>` ES LETRA DE NORMA, NO GUSTO: §4.6.8 dice «must be split on ASCII whitespace»
 * e *Infra* lo define como TAB, LF, FF, CR y SPACE. Un `rel.split(' ')` no ve
 * `rel="alternate<TAB>stylesheet"`, y esa hoja SE PIDE (@s6).
 * ⚠️ HONESTIDAD DE MEDICIÓN: esta fila NO se justifica por mutación, y no se finge que sí — el
 * doble espacio y el TAB NO matan `\s+`→`\s` (el mutante es equivalente para la pertenencia al
 * conjunto). Entra por LETRA DE NORMA, que basta.
 * 🔴 MUTANTE REAL QUE ESTE ESCENARIO MATA: `MethodExpression` `toLowerCase`⇄`toUpperCase`.
 */
describe('los keywords de rel se comparan ASCII case-insensitive, y rel se parte por ASCII whitespace (@s7)', () => {
  it.each([
    ['STYLESHEET', 'caja alta pura'],
    ['StyleSheet', 'caja mixta'],
    ['ALTERNATE STYLESHEET', 'caja alta sobre el conjunto de DOS tokens (@s6)'],
    ['Alternate StyleSheet', 'caja mixta sobre el conjunto de DOS tokens (@s6)'],
    // ⚠️ El separador es el carácter U+0009 REAL, no la cadena literal "<TAB>".
    ['alternate\tstylesheet', 'SEPARADOR TAB: ASCII whitespace, NO solo U+0020'],
  ])('@s7 rel=%j se resuelve igual (%s)', (rel) => {
    const detectados = detectarOrigenesExternos(
      [recursoHtml(`<link rel="${rel}" href="https://cdn.tercero.com/c.css">`)],
      [],
    )

    expect(detectados).toHaveLength(1)
    expect(detectados[0].origen).toBe('cdn.tercero.com')
  })
})

/**
 * 🔴 ES EL HUECO CLÁSICO DE TODA LISTA BLANCA ESCRITA COMO «EMPIEZA POR http» [V]. Una URL
 * protocol-relative HEREDA EL ESQUEMA DE LA PÁGINA y pide al tercero EXACTAMENTE IGUAL. Un
 * detector que busque `https?://` NO LA VE. Por eso la aserción de la puerta es por LISTA BLANCA
 * DE ESQUEMAS, negativa (@s26): UNA LISTA NEGRA AQUÍ ES EL BUG.
 */
describe('un url() protocol-relative a un tercero SE DETECTA (@s8)', () => {
  it.each([
    ['css', '@font-face { src: url(//cdn.tercero.com/x.woff2); }'],
    ['html', '<link rel="stylesheet" href="//cdn.tercero.com/x.css">'],
    ['html', '<script src="//cdn.tercero.com/a.js"></script>'],
  ])('@s8 en %s, %s se detecta', (tipo, construccion) => {
    const recurso = tipo === 'css' ? recursoCss(construccion) : recursoHtml(construccion)

    const detectados = detectarOrigenesExternos([recurso], [])

    expect(detectados).toHaveLength(1)
    expect(detectados[0].origen).toBe('cdn.tercero.com')
  })
})

/**
 * 🔴 `<base href>` ES UN MODIFICADOR, NO UN ORIGEN [V]. No pide nada por sí mismo —por eso la 1ª
 * fila detecta 1 Y NO 2: el origen es el `<img>`, no el `<base>`— pero convierte
 * `<img src="a.png">` en una petición a un tercero. → LAS URL SE RESUELVEN CONTRA `base` ANTES DE
 * CLASIFICARLAS. Un detector que clasifique "a.png" como «relativa, luego propia» es CIEGO A ESTA
 * VÍA ENTERA.
 * LA 2ª FILA (`base = "/"`) MATA AL MUTANTE QUE MARCA TODA URL RELATIVA: sin ella la 1ª pasaría
 * POR LA RAZÓN EQUIVOCADA (precedente: la fila `/` de @s24 en F-04).
 * LA 3ª FILA ASEVERA EL INFORME, y no es cosmética: acusar `a.png` manda al siguiente a buscar el
 * porqué. LA PUERTA ACUSA, NO GRUÑE (@s25).
 * ⚠️ ES LA HERMANA DE @s27: hay vías por las que un tercero entra SIN QUE NADIE ESCRIBA SU NOMBRE.
 */
describe('<base href> a un tercero convierte una URL relativa en una petición a un tercero (@s9)', () => {
  function conBase(base: string): RecursoDeArtefacto {
    return recursoHtml(`<base href="${base}"><img src="a.png">`)
  }

  it('@s9 con <base href="https://cdn.tercero.com/">, a.png es una petición al tercero — y es 1, no 2', () => {
    const detectados = detectarOrigenesExternos([conBase('https://cdn.tercero.com/')], [])

    expect(detectados).toHaveLength(1)
    expect(detectados[0].origen).toBe('cdn.tercero.com')
  })

  it('@s9 con <base href="/">, a.png resuelve al propio sitio: no se detecta ningún origen', () => {
    expect(detectarOrigenesExternos([conBase('/')], [])).toEqual([])
  })

  it('@s9 el valor declarado es la URL RESUELTA, no el "a.png" literal', () => {
    const detectados = detectarOrigenesExternos([conBase('https://cdn.tercero.com/')], [])

    expect(detectados[0].valor).toBe('https://cdn.tercero.com/a.png')
  })

  /**
   * 🔴 LA 4ª FILA LA AÑADE LA AMPLIACIÓN DEL 2026-07-17, Y LA TRAE LA MUTACIÓN. MATA EL
   * `OptionalChaining` de terceros.ts:241 (`URL.parse(href, RAIZ_PROPIA)?.href` → `.href`).
   * `http://[` es una URL INVÁLIDA —host IPv6 sin cerrar, la forma más corta que hace que el parser
   * WHATWG devuelva `null`— así que el `?.` + `?? RAIZ_PROPIA` cae con gracia en el propio sitio;
   * CON EL MUTANTE, `null.href` → TypeError y la puerta REVIENTA ante un HTML malformado.
   * ✅ DECISIÓN 1 DEL HUMANO: LA GUARDA ES CORRECTA Y SE QUEDA. LO QUE FALTABA ERA EL ESCENARIO,
   * NO EL CÓDIGO. NADA en la suite metía una URL QUE NO PARSEE.
   * Su HERMANO EXACTO es la 3ª fila de @s41 (`<img src="http://[">`): van juntos a propósito, y son
   * la misma lección por las dos ramas — la de la `base` y la del subrecurso.
   */
  it('@s9 con <base href="http://[">, la base NO PARSEA: se cae con gracia en la raíz propia y NO LANZA', () => {
    function detectar(): readonly OrigenExterno[] {
      return detectarOrigenesExternos([conBase('http://[')], [])
    }

    expect(detectar).not.toThrow()
    expect(detectar()).toEqual([])
  })
})

/**
 * 🔴🔴 ESCENARIO NUEVO — LA AMPLIACIÓN DEL 2026-07-17, Y LA TRAE LA MUTACIÓN.
 * EL PATRÓN DE LOS 10 SUPERVIVIENTES ES UNO SOLO: el contrato cubría muy bien LO QUE EL ARTEFACTO
 * SÍ TRAE, y NO FIJABA QUÉ PASA CON LO MALFORMADO. Estas 3 filas matan los 4 mutantes del grupo A
 * (terceros.ts:257-258) y el `ConditionalExpression` de :299.
 * ✅ DECISIÓN 1 DEL HUMANO: LAS GUARDAS SON CORRECTAS Y SE QUEDAN. Quien «mate» estos mutantes
 * BORRANDO las guardas ROMPE LA FEATURE: sin ellas el detector LANZA ante un HTML malformado
 * (filas 1 y 3) o INVENTA UN TERCERO QUE NADIE PIDE (fila 2). AQUÍ NO SOBRABA CÓDIGO: FALTABA
 * CONTRATO.
 * 🔴🔴 LA FILA 2 LLEVA EL `<base>` A UN TERCERO, Y NO ES DECORACIÓN: CON LA BASE PROPIA EL MUTANTE
 * ES INDISTINGUIBLE (ambos caen del lado propio → 0 = 0 → SOBREVIVE). MEDIDO, no deducido [V]:
 * `URL.parse(undefined, 'https://cdn.tercero.com/')` → host `cdn.tercero.com` (→ 1 ≠ 0 → MUERE),
 * frente a `URL.parse(undefined, 'https://propio.invalid/')` → host `propio.invalid` (→ 0 = 0 →
 * sobrevive). NADIE QUITE ESE `<base>` POR «SIMPLIFICAR EL FIXTURE»: LO DESACTIVA.
 * ⚠️ NO ENCAJABA EN NINGUNO DE LOS 40: @s2/@s3/@s7 fijan `rel` EN EL PROPIO Given (no hay forma de
 * quitarlo por una fila), @s18 es «las URL que RESUELVEN AL PROPIO SITIO» —y esto NO resuelve al
 * propio sitio: es un tercero QUE SENCILLAMENTE NO SE PIDE— y @s1 exige EXACTAMENTE 1 origen.
 */
describe('HTML malformado: la puerta NO lanza y NO inventa un origen que nadie pide (@s41)', () => {
  it.each([
    [
      '<link href="https://cdn.tercero.com/x.css">',
      '<link> SIN rel: no declara qué es, y NADA lo pide',
    ],
    [
      '<base href="https://cdn.tercero.com/"><link rel="stylesheet">',
      '<link rel> SIN href: no hay nada que pedir. LA BASE ES A UN TERCERO A PROPÓSITO',
    ],
    ['<img src="http://[">', 'URL INVÁLIDA en un subrecurso: URL.parse → null'],
  ])('@s41 %s no lanza y no detecta ningún origen (%s)', (marcado) => {
    function detectar(): readonly OrigenExterno[] {
      return detectarOrigenesExternos([recursoHtml(marcado)], [])
    }

    expect(detectar).not.toThrow()
    expect(detectar()).toEqual([])
  })
})

/**
 * 🔴🔴 ESCENARIO NUEVO — LA AMPLIACIÓN DEL 2026-07-17. MATA EL `ConditionalExpression` de
 * terceros.ts:240 (`if (href !== undefined)` → `if (true)`), Y ES EL PEOR DE LOS 10: EL MUTANTE
 * PRODUCE UN FALSO NEGATIVO. Con él, el primer `<base>` (el que NO tiene `href`) devuelve
 * `…/undefined` Y CORTA EL BUCLE: el `<base href>` del tercero NO SE CONSULTA JAMÁS, `a.png`
 * resuelve al sitio propio y LA PETICIÓN AL TERCERO SE VUELVE INVISIBLE. Un falso negativo es el
 * peor fallo posible para F-05: la puerta diría «limpio» mientras la visitante entrega su IP.
 * LA LETRA, Y ESTE TEST LA FIJA [V, HTML Living Standard §4.6.5]: GANA EL PRIMER `<base>` QUE
 * TENGA `href`, no el primer `<base>` a secas.
 * 🔴🔴 UN `<base>` SIN HREF A SECAS NO LO MATA, Y POR ESO ESTE FIXTURE LLEVA LOS DOS `<base>`
 * [V, medido: `<base><img src="a.png">` → 0 orígenes CON Y SIN mutante, porque `…/undefined` y
 * `…/` son AMBOS host propio → INDISTINGUIBLE]. Quien «simplifique» este fixture a un solo `<base>`
 * deja el mutante vivo y el falso negativo abierto.
 * ⚠️ NO ENCAJA EN @s9: su Given inyecta UN `<base href>` por plantilla — no hay fila que pueda meter
 * DOS elementos `<base>`, y uno de ellos SIN atributo. ES LA HERMANA DE @s9: las dos existen por lo
 * mismo — hay vías por las que un tercero entra SIN QUE NADIE ESCRIBA SU NOMBRE.
 */
describe('un <base> sin href NO corta la búsqueda: gana el primer <base href> VÁLIDO (@s42)', () => {
  it('@s42 con <base> seguido de <base href> a un tercero, a.png es una petición al tercero', () => {
    const detectados = detectarOrigenesExternos(
      [recursoHtml('<base><base href="https://cdn.tercero.com/"><img src="a.png">')],
      [],
    )

    expect(detectados).toHaveLength(1)
    expect(detectados[0].origen).toBe('cdn.tercero.com')
    expect(detectados[0].valor).toBe('https://cdn.tercero.com/a.png')
  })
})

/* ---------------------------------------------------------------------------
 * EL DETECTOR — lo que NO debe detectar.
 * 🔴 CADA UNO DE ESTOS ES UN FALSO POSITIVO QUE ROMPERÍA LA FEATURE, F-04 O F-02. SIN ELLOS,
 *    «DETECTAR TODO LO QUE PAREZCA UNA URL» PASA LOS ESCENARIOS DE ARRIBA IGUAL DE BIEN.
 * ------------------------------------------------------------------------- */

/**
 * 🔴 SIN ESTE ESCENARIO, F-05 ROMPE F-04, QUE ESTÁ `done`.
 * §4.6.8.4 [V, literal]: «This keyword creates A HYPERLINK». (La tabla-resumen de §4.6.8 concuerda,
 * pero LA SPEC LA DECLARA LITERALMENTE NO NORMATIVA: «This table is non-normative». MANDA LA
 * SECCIÓN — es la regla dura que @s6 fija.) Un hyperlink NO PIDE NADA: solo al *follow the
 * hyperlink*, ACCIÓN DEL USUARIO (§4.6.1).
 * `https://example.invalid` es la canónica DELIBERADA de F-04 (A-21), TLD RESERVADO RFC 2606, y
 * aparece DOS VECES en el `dist/` de hoy. Una puerta que prohibiera «cualquier origen externo»
 * ROMPERÍA EL BUILD POR LA CANÓNICA DE UNA FEATURE CERRADA Y CORRECTA.
 */
describe('<link rel="canonical"> NO se detecta — es un HIPERENLACE, y es la canónica de F-04 (@s10)', () => {
  it('@s10 la canónica de F-04 no se detecta: un hyperlink no pide nada', () => {
    expect(
      detectarOrigenesExternos(
        [recursoHtml('<link rel="canonical" href="https://example.invalid/">')],
        [],
      ),
    ).toEqual([])
  })
})

/**
 * 🔴 ES EL GEMELO DE @s6. LOS DOS JUNTOS SON LA REGLA DEL CONJUNTO TOKENIZADO; CUALQUIERA DE LOS
 * DOS SOLO, LA DEJA A MEDIAS.
 *   - `rel="alternate stylesheet"` → el conjunto CONTIENE `stylesheet` → SE DETECTA (@s6).
 *   - `rel="alternate"` SOLO → el conjunto NO lo contiene → NO se detecta (aquí).
 * 🔴 LA DIFERENCIA NO ESTÁ EN LA CADENA — `"alternate"` ES PREFIJO DE `"alternate stylesheet"`.
 * ESTÁ EN EL CONJUNTO. Un detector que decida por `startsWith`/`includes` sobre la cadena acierta
 * uno y falla el otro, SIEMPRE. 🔴 MUTANTE REAL: `MethodExpression` `startsWith`⇄`endsWith`.
 */
describe('<link rel="alternate"> SOLO (sin stylesheet) NO se detecta — el gemelo de @s6 (@s11)', () => {
  it('@s11 un feed Atom es un hiperenlace a un recurso alternativo: el navegador no lo pide', () => {
    expect(
      detectarOrigenesExternos(
        [
          recursoHtml(
            '<link rel="alternate" type="application/atom+xml" href="https://tercero.com/f.xml">',
          ),
        ],
        [],
      ),
    ).toEqual([])
  })
})

/**
 * 🔴 SIN ESTE ESCENARIO, ALGUIEN «ENDURECE» LA PUERTA Y ROMPE EL CONTACTO DEL SALÓN.
 * Es el DATO REAL de la fuente única [V: `src/lib/site.ts`, `REDES.facebook`], emitido por F-02
 * (`done`). CIERRA EN F-12, no aquí. F-05 NO LO TOCA.
 * 🔴 HOY EL `<a href>` NO EXISTE en `dist/index.html` [V, medido]: la URL viaja como literal en
 * `dist/assets/app-*.js`, que esta puerta NO LEE (@s34). ESO NO LO VUELVE DECORATIVO: LO VUELVE
 * PREVENTIVO, y es el punto entero de la feature — el día que F-12 pinte el enlace, la puerta ya
 * estará ahí, y SIN ESTE ESCENARIO LA ROMPERÍA.
 * Fundamento [V]: NO PIDE NADA ANTES DEL CLIC. §4.6.1: «so that the user can cause the user agent
 * to navigate». Y NO se puede prohibir invocando Fashion ID: el predicado fáctico del ap. 27 es la
 * transmisión AUTOMÁTICA, «regardless of whether or not he or she … HAS CLICKED», y `hyperlink` =
 * 0 ocurrencias en toda la sentencia [V].
 * Si te parece contraintuitivo —un enlace a Facebook en una feature que se llama «cero
 * terceros»— lee el párrafo de arriba antes de tocarlo.
 */
describe('el <a href> a Facebook NO se detecta — es F-12, y romperlo rompe el contacto del salón (@s12)', () => {
  it('@s12 un hiperenlace a Facebook no transmite nada hasta que la usuaria decide ir', () => {
    expect(
      detectarOrigenesExternos(
        [recursoHtml('<a href="https://www.facebook.com/nailslashstudiorozas/">Facebook</a>')],
        [],
      ),
    ).toEqual([])
  })
})

/**
 * Fundamento, literal [V]: *Namespaces in XML* §3: «It is not a goal that it be directly usable
 * for retrieval of a schema». UN NAMESPACE ES UN IDENTIFICADOR, NO UNA DIRECCIÓN: el navegador NO
 * LO PIDE JAMÁS.
 * 🔴 ESTE ESCENARIO ES PREVENTIVO, Y ES CORRECTO QUE LO SEA: en cuanto un componente emita un SVG
 * en línea al HTML horneado —lo normal en cuanto haya un icono—, un detector que grepee `https?://`
 * lo marcaría y rompería el build de un repo correcto. Se tiende la red antes, no después.
 */
describe('xmlns de un SVG en línea NO se detecta (@s13)', () => {
  it('@s13 un namespace XML es un identificador, no una dirección', () => {
    expect(
      detectarOrigenesExternos(
        [recursoHtml('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>')],
        [],
      ),
    ).toEqual([])
  })
})

/**
 * Un `<meta>` NO tiene algoritmo de *fetch and process the linked resource*: es metadata
 * declarativa para consumidores EXTERNOS (el scraper de una red social al compartir el enlace), no
 * una construcción de subrecurso. El navegador que renderiza la página NO PIDE `og:image` NUNCA —
 * quien la pide es un servidor de terceros, DESDE SU PROPIA INFRAESTRUCTURA, y NO RECIBE LA IP DE
 * LA VISITANTE, que es el eje de F-05 (@s3).
 */
describe('<meta property="og:image"> NO se detecta (@s14)', () => {
  it('@s14 una URL que viaja como DATO no es una instrucción de carga', () => {
    expect(
      detectarOrigenesExternos(
        [recursoHtml('<meta property="og:image" content="https://cdn.tercero.com/og.png">')],
        [],
      ),
    ).toEqual([])
  })
})

/**
 * 🔴 SIN ESTE ESCENARIO, F-05 ROMPE F-04, QUE ESTÁ `done`. `https://schema.org` aparece DOS VECES
 * en el `dist/` de hoy y es el `@context` del JSON-LD de F-04.
 * LA RAZÓN CORRECTA, Y LA ÚNICA QUE HACE FALTA — HTML Standard, literal [V]: «Setting the
 * attribute to any other value means that the script is A DATA BLOCK, WHICH IS NOT PROCESSED BY
 * THE USER AGENT, but instead by author script or other tools.» EL NAVEGADOR NI LO PARSEA.
 * ⚠️ OJO CON UNA CITA QUE CIRCULA Y ES FABRICADA: «Set context document to the RemoteDocument
 * obtained by dereferencing context…» NO EXISTE en la spec JSON-LD 1.1 API. El texto real (paso
 * 5.2.5) empieza con «Otherwise,» — es la rama ELSE de 5.2.4. Si alguien te la trae para refutar
 * este escenario, NO LA ACEPTES.
 */
describe('la URL del @context del JSON-LD NO se detecta — es un DATA BLOCK, y es F-04 (@s15)', () => {
  it('@s15 el @context de F-04 no se detecta: un data block no lo procesa el navegador', () => {
    expect(
      detectarOrigenesExternos(
        [
          recursoHtml(
            '<script type="application/ld+json">{"@context":"https://schema.org","@type":"BeautySalon"}</script>',
          ),
        ],
        [],
      ),
    ).toEqual([])
  })
})

/**
 * 🔴 ESCENARIO OBLIGATORIO: SIN ÉL, «DETECTAR TODO `stylesheet`» PASA @s2 y @s6 IGUAL DE BIEN y la
 * regla nace MÁS GORDA DE LO QUE LA LETRA PERMITE.
 * Fundamento, LETRA NORMATIVA [V, §4.6.8.23, *linked resource fetch setup steps*]: «If el's
 * disabled attribute is set, then RETURN FALSE.» → EL RECURSO NO SE PIDE. Marcarlo sería un FALSO
 * POSITIVO SOSTENIDO POR SPEC.
 * ⚠️ CONTRASTE DELIBERADO CON @s3 y @s5: allí F-05 ELIGE marcar donde la spec no decide (criterio
 * de proyecto, declarado). AQUÍ LA SPEC SÍ DECIDE, Y F-05 LA OBEDECE. La diferencia entre «no hay
 * letra, elijo» y «hay letra, la ignoro» es la credibilidad entera de este contrato.
 */
describe('<link rel="stylesheet" disabled> NO se detecta — falso positivo SOSTENIDO POR SPEC (@s16)', () => {
  it('@s16 con el atributo disabled puesto, el recurso no se pide', () => {
    expect(
      detectarOrigenesExternos(
        [recursoHtml('<link rel="stylesheet" disabled href="https://cdn.tercero.com/x.css">')],
        [],
      ),
    ).toEqual([])
  })
})

/**
 * NO ES UNA PETICIÓN: ES EL PROPIO BYTE. No hay origen, no hay red, no hay tercero.
 * 🔴 Y NO ES HIPOTÉTICO: VITE 7 NO EXIME A LAS FUENTES DEL INLINING [V]. `assetsInlineLimit` =
 * 4096 B; verificado en `shouldInline` del código instalado: el único opt-out por extensión es
 * `.html` y `.svg` con `#`. Un `.woff2` de <4096 B se convierte en `data:font/woff2;base64,…` y NO
 * DEJA FICHERO EN `dist/assets`. Hoy no ocurre porque el más pequeño de LAS SEIS FUENTES DE F-05
 * mide 14.044 B — HECHO DE TAMAÑO, NO GARANTÍA.
 * → SIN ESTE ESCENARIO, UN `.woff2` QUE ADELGACE POR DEBAJO DEL LÍMITE ROMPERÍA EL BUILD SIN
 *   NINGÚN MOTIVO, y el siguiente agente pasaría un día buscando un tercero que no existe.
 */
describe('url(data:…) NO se detecta — no es una petición, es el propio byte (@s17)', () => {
  it('@s17 un data: URL no contacta con nadie', () => {
    expect(
      detectarOrigenesExternos(
        [
          recursoCss(
            "@font-face { font-family: Manrope; src: url(data:font/woff2;base64,d09GMgABAAAAAA) format('woff2'); }",
          ),
        ],
        [],
      ),
    ).toEqual([])
  })
})

/**
 * LA ASEVERACIÓN DEL CAMINO NORMAL, Y NO ES DECORATIVA: MATA AL MUTANTE QUE MARCA TODO. Con él,
 * @s1..@s9 pasarían TODOS por la razón equivocada y la puerta rompería el build EN CADA EJECUCIÓN
 * (precedente: la fila `/` de @s24 en F-04).
 * 🔴 LA 1ª FILA ES UN HECHO MEDIDO [V]: la ruta que emite Vite es ROOT-ABSOLUTA (`url(/assets/…)`),
 * NO RELATIVA (`vite.config.ts` no declara `base` → `base = '/'`). UNA PUERTA QUE EXIGIERA
 * `url(./…)` DA FALSO NEGATIVO.
 * LA FILA DEL `tel:` usa el dato REAL de F-02 [V] y ancla que «no empieza por `/`» NO ES «es
 * externo»: si «no interno» se implementa así, la puerta se vuelve laxa o rota.
 */
describe('las URL que resuelven al propio sitio NO se detectan (@s18)', () => {
  it.each([
    [
      'css',
      '@font-face { src: url(/assets/manrope-latin-400-normal-BGsTXAXT.woff2); }',
      'ROOT-ABSOLUTA: es la forma REAL de Vite [V]',
    ],
    ['html', '<script type="module" src="/assets/app-ti4oL6dR.js"></script>', 'el propio artefacto'],
    ['html', '<img src="a.png">', 'relativa, sin <base>: el propio sitio'],
    ['html', '<a href="#servicios">Servicios</a>', 'ancla dentro de la misma página'],
    [
      'html',
      '<a href="tel:+34625223366">625 22 33 66</a>',
      'no es una URL de red (dato real de F-02 [V])',
    ],
  ])('@s18 en %s, %s no se detecta (%s)', (tipo, construccion) => {
    const recurso = tipo === 'css' ? recursoCss(construccion) : recursoHtml(construccion)

    expect(detectarOrigenesExternos([recurso], [])).toEqual([])
  })
})

/* ---------------------------------------------------------------------------
 * LA ALLOWLIST Y LOS MUTANTES.
 * 🔴 AQUÍ ESTÁ EL PELIGRO DE ESTA FEATURE.
 * ------------------------------------------------------------------------- */

/** Los dos orígenes de @s19/@s20/@s22, escritos A MANO. `cdn.jsdelivr.net` es un FIXTURE. */
function conDosOrigenes(): RecursoDeArtefacto {
  return recursoHtml(
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope">' +
      '<script src="https://cdn.jsdelivr.net/x.js"></script>',
  )
}

/**
 * A1 — ES EL CONTRATO BASE DE LA FEATURE, y es el estado real de producción: la allowlist de F-05
 * ES `[]`.
 * 🔴🔴 NECESARIO PERO **NO SUFICIENTE**, Y ES LO MÁS IMPORTANTE DE ESTA SECCIÓN: ESTE ESCENARIO
 * **NO MATA A `FilterRemoval`**. MEDIDO [V, §7]: con `allowlist = []` el filtro no quita nada, así
 * que `.filter(p)` y `origenes` devuelven LO MISMO → EL MUTANTE ES EQUIVALENTE Y SOBREVIVE. Quien
 * crea que «ya está cubierto porque la allowlist real es vacía» SE EQUIVOCA, y está medido.
 * → @s20 ES OBLIGATORIO.
 * DOS orígenes y no uno: el detector los acusa TODOS; un `else if` en vez de dos `if`
 * independientes deja uno sin acusar (precedente F-01/@s23, F-04/@s25).
 */
describe('con allowlist vacía se devuelven TODOS los orígenes detectados (@s19)', () => {
  it('@s19 con allowlist [] se devuelven los dos orígenes detectados', () => {
    const detectados = detectarOrigenesExternos([conDosOrigenes()], [])

    expect(detectados).toHaveLength(2)
    expect(detectados.map((origen) => origen.origen)).toEqual([
      'fonts.googleapis.com',
      'cdn.jsdelivr.net',
    ])
  })
})

/**
 * 🔴🔴🔴 ESTE ESCENARIO EXISTE PARA MATAR A `FilterRemoval`. NO LO BORRES «PORQUE LA ALLOWLIST REAL
 * ES VACÍA»: ESE ES EXACTAMENTE EL RAZONAMIENTO QUE LO DEJA VIVO.
 * EL MUTANTE: `FilterRemoval` sustituye `origenes.filter(p)` por `origenes`. La ÚNICA forma de
 * distinguirlos es que EL FILTRO TENGA ALGO QUE QUITAR: una allowlist NO VACÍA que contenga un
 * origen REALMENTE PRESENTE. Aquí, con el mutante, el resultado sería los DOS → ≠ el esperado
 * escrito a mano → MUERE.
 * SON DOS COSAS INDEPENDIENTES: (1) que la allowlist entre como PARÁMETRO es la NECESIDAD del
 * diseño —cableada, `FilterRemoval` es GENUINAMENTE INMATABLE—; (2) lo que lo MATA es este
 * escenario. El diseño hace POSIBLE matarlo; el escenario lo MATA.
 * NO ES UNA PUERTA TRASERA: ES LO QUE HACE MEDIBLE EL INVARIANTE «ALLOWLIST VACÍA». Una allowlist
 * que nadie puede rellenar no es una allowlist vacía: es UNA CONSTANTE SIN TEST. La de PRODUCCIÓN
 * sigue siendo `[]` — la pasa el humilde, y la ancla @s39.
 */
describe('una allowlist NO VACÍA que tapa un origen REALMENTE PRESENTE lo excluye del informe (@s20)', () => {
  it('@s20 la allowlist tapa ESE origen y solo ESE', () => {
    const detectados = detectarOrigenesExternos([conDosOrigenes()], ['fonts.googleapis.com'])

    expect(detectados).toHaveLength(1)
    expect(detectados[0].origen).toBe('cdn.jsdelivr.net')
    expect(detectados.map((origen) => origen.origen)).not.toContain('fonts.googleapis.com')
  })
})

/**
 * 🔴 ESTE ESCENARIO MATA A `BooleanLiteral`: EL `!` DE `!allowlist.includes(o)`.
 * 🔴🔴 QUITAR EL `!` NO ES EQUIVALENTE, Y ESTÁ MEDIDO [V, §7]: el predicado pasa a ser
 * `allowlist.includes(o)` → con `allowlist = []` NADA CASA → devuelve `[]` en vez de la lista.
 * EXCLUIRLO DEL ANÁLISIS DE MUTACIÓN COMO «EQUIVALENTE» SERÍA FRAUDULENTO. Queda escrito aquí para
 * que nadie lo intente cuando el informe de Stryker apriete.
 * ❌ PROHIBIDO escribir «mutar `.includes`»: ESE MUTADOR NO EXISTE en Stryker 9.6.1 [V, por DOS
 * vías: el mapa `replacements` de `method-expression-mutator.js` tiene 22 claves y ninguna es
 * `includes`; y la página oficial no contiene la palabra]. Lo que se muta del predicado es el `!`
 * (`BooleanLiteral`) y el `.filter` (`FilterRemoval`) — NADA MÁS.
 */
describe('con allowlist vacía, un origen detectado se DEVUELVE — el resultado NO es la lista vacía (@s21)', () => {
  it('@s21 el resultado NO es la lista vacía', () => {
    const detectados = detectarOrigenesExternos(
      [recursoHtml('<script src="https://cdn.jsdelivr.net/x.js"></script>')],
      [],
    )

    expect(detectados).not.toEqual([])
    expect(detectados).toHaveLength(1)
    expect(detectados[0].origen).toBe('cdn.jsdelivr.net')
  })
})

/**
 * La aseveración del NEGATIVO DE LA ALLOWLIST: una allowlist NO VACÍA que no casa NO TAPA NADA.
 * Mata al mutante que, en cuanto la allowlist tiene algo, deja de reportar — o al que la trata
 * como un INTERRUPTOR en vez de como un conjunto de exclusión.
 * JUNTO A @s20 FORMA LA PINZA: @s20 = no vacía QUE SÍ CASA → tapa ESE y solo ESE; @s22 = no vacía
 * QUE NO CASA → no tapa NINGUNO. Ancla que LA PERTENENCIA SE DECIDE ORIGEN A ORIGEN.
 * `cdn.ausente.example` usa el TLD RESERVADO `.example` (RFC 2606): imposible de confundir con una
 * decisión del proyecto. Misma disciplina que `example.invalid` en F-04.
 */
describe('una allowlist que NO contiene ninguno de los orígenes presentes no tapa nada (@s22)', () => {
  it('@s22 una allowlist que no casa deja pasar los dos orígenes', () => {
    const detectados = detectarOrigenesExternos([conDosOrigenes()], ['cdn.ausente.example'])

    expect(detectados).toHaveLength(2)
    expect(detectados.map((origen) => origen.origen)).toEqual([
      'fonts.googleapis.com',
      'cdn.jsdelivr.net',
    ])
  })
})

/**
 * 🔴 ESTE ESCENARIO MATA A `EqualityOperator` Y A `StringLiteral` en la comparación de origen, y de
 * paso a `MethodExpression` `startsWith`⇄`endsWith`.
 * 🔴 LAS FILAS ATACANTES NO SON PARANOIA ACADÉMICA: SON EL BYPASS. Una allowlist con
 * `origen.includes(permitido)` deja pasar `evil-fonts.googleapis.com.attacker.net`; una con
 * `endsWith` deja pasar `evil-fonts.googleapis.com`; una con `startsWith` deja pasar
 * `fonts.googleapis.com.attacker.net`. LAS TRES FORMAS INGENUAS CAEN EN ALGUNA FILA DE ESTA TABLA.
 * Es la ironía de F-05: la allowlist existe para NO reportar, y UNA ALLOWLIST LAXA ES PEOR QUE
 * NINGUNA.
 * LA 1ª FILA (el positivo) MATA AL MUTANTE QUE NUNCA TAPA — y, MEDIDO POR SABOTAJE, mata TAMBIÉN a
 * `FilterRemoval` (el mapa decía «@s20 Y SOLO @s20», y era falso).
 * LA 7ª FILA ancla que la comparación es sobre el ORIGEN, no sobre la URL entera: el eje de F-05 es
 * QUIÉN RECIBE LA IP, y quien la recibe es `attacker.net`.
 */
describe('la allowlist compara el origen EXACTO — ni subcadena, ni prefijo, ni sufijo (@s23)', () => {
  it.each([
    ['fonts.googleapis.com', 0, 'IGUAL al de la allowlist: se tapa'],
    ['evil-fonts.googleapis.com', 1, 'SUBDOMINIO ATACANTE: el permitido es SUFIJO. NO se tapa'],
    [
      'evil-fonts.googleapis.com.attacker.net',
      1,
      'SUPERCADENA: contiene el permitido y NO es él. NO se tapa',
    ],
    ['fonts.googleapis.co', 1, 'UN CARÁCTER de menos: NO se tapa'],
    ['fonts.googleapis.comm', 1, 'UN CARÁCTER de más: NO se tapa'],
    ['googleapis.com', 1, 'SUBCADENA del permitido: NO se tapa'],
    ['fonts.googleapis.com.attacker.net', 1, 'SUFIJO ATACANTE: el permitido es PREFIJO. NO se tapa'],
    ['attacker.net/fonts.googleapis.com', 1, 'el permitido va en la RUTA, no en el origen'],
  ])('@s23 con un <script src> a %s se detectan %i (%s)', (origen, detectados) => {
    expect(
      detectarOrigenesExternos(
        [recursoHtml(`<script src="https://${origen}/x.js"></script>`)],
        ['fonts.googleapis.com'],
      ),
    ).toHaveLength(detectados)
  })
})

/**
 * 🔴 EL `Then` ASEVERA EL ORIGEN, NO SOLO LA CUENTA, Y ESA ES LA LECCIÓN: la cuenta es CIEGA a las
 * mutaciones de valor. Con `[^']`→`[']`, `url('/assets/m.woff2')` extrae el valor CON las comillas
 * → sigue sin ser externo → cuenta 0 = esperado 0 → EL MUTANTE SOBREVIVE. La cuenta solo se mueve
 * si la fila es EXTERNA. Por eso las filas de comillas externas existen.
 * ⚠️ HONESTIDAD DE MEDICIÓN, heredada del contrato: `url('a"b')` NO mata `[^']`→`[']` (espera 0 y
 * la mutación no mueve la cuenta), y `url( … )` con espacios NO mata el `\s*`→`\S*` del CIERRE.
 * Por eso la extracción de esta implementación es `url\(([^)]*)\)` —DOS mutantes, los dos mortales
 * en cualquier fila externa— y NO una alternancia de comillas, que genera DIEZ.
 * LAS FILAS DE COMILLAS anclan que `url()` acepta las TRES formas — es la forma REAL que emite
 * `@fontsource`: `url(…woff2) format('woff2'), url(…woff) format('woff')` [V, medido].
 */
describe('la extracción de url() no se confunde — y ASEVERA EL ORIGEN, no solo la cuenta (@s24)', () => {
  // La tabla se tipa a mano: sin esto, `origen: string | null` produce una UNIÓN de tuplas que
  // `it.each` no sabe repartir, y el test no compila.
  const filas: [construccion: string, cuantos: number, origen: string | null, porQue: string][] = [
    ['@font-face { src: url(/assets/m.woff2); }', 0, null, 'root-absoluta: propia'],
    [
      '@font-face { src: url(https://cdn.tercero.com/m.woff2); }',
      1,
      'cdn.tercero.com',
      'externa, sin comillas',
    ],
    [
      '.a { --x: "url(https://cdn.tercero.com/m.woff2)"; }',
      1,
      'cdn.tercero.com',
      'criterio conservador (@s5): dentro de un valor, se marca',
    ],
    [
      '@font-face { src: url("/assets/m.woff2") format("woff2"); }',
      0,
      null,
      'comillas dobles: sigue siendo propia',
    ],
    [
      "@font-face { src: url('/assets/m.woff2') format('woff2'); }",
      0,
      null,
      'comillas simples: sigue siendo propia',
    ],
    [
      "@font-face { src: url('https://cdn.tercero.com/m.woff2'); }",
      1,
      'cdn.tercero.com',
      'EXTERNA CON COMILLAS SIMPLES',
    ],
    [
      '@font-face { src: url("https://cdn.tercero.com/m.woff2"); }',
      1,
      'cdn.tercero.com',
      'EXTERNA CON COMILLAS DOBLES',
    ],
    [
      '@font-face { src: url( https://cdn.tercero.com/m.woff2 ); }',
      1,
      'cdn.tercero.com',
      'ESPACIOS DENTRO',
    ],
  ]

  it.each(filas)('@s24 %s → %i orígenes (%s)', (construccion, cuantos, origen) => {
    const detectados = detectarOrigenesExternos([recursoCss(construccion)], [])

    expect(detectados).toHaveLength(cuantos)
    expect(detectados.map((detectado) => detectado.origen)).toEqual(origen === null ? [] : [origen])
  })
})

/**
 * LA PUERTA ACUSA, NO GRUÑE. «Hay un origen externo en el artefacto» sin decir en qué fichero, qué
 * construcción ni qué URL obliga a buscarlo a mano — y a las 3 de la mañana nadie lo busca: LO
 * SALTA. Los CUATRO campos son el contrato de salida.
 * DETERMINISMO: misma entrada → misma salida, MISMO ORDEN. El informe tiene que ser DIFFABLE, o el
 * ruido lo vuelve invisible.
 * DOS ficheros y dos tipos (html y css) a la vez: el detector recorre TODOS los recursos que
 * recibe, no el primero. UN `find`/`some` EN VEZ DE UN RECORRIDO COMPLETO MUERE AQUÍ.
 */
describe('el informe acusa una línea por origen, con los cuatro campos, y es determinista (@s25)', () => {
  function artefactoDeDosFicheros(): readonly RecursoDeArtefacto[] {
    return [
      recursoHtml('<script src="https://cdn.jsdelivr.net/x.js"></script>'),
      recursoCss('@import url(https://fonts.googleapis.com/css2?family=Manrope);'),
    ]
  }

  it('@s25 cada origen declara SU ubicación, SU construcción, SU origen y SU valor', () => {
    const detectados = detectarOrigenesExternos(artefactoDeDosFicheros(), [])

    expect(detectados).toHaveLength(2)
    expect(detectados[0]).toEqual({
      ubicacion: 'dist/index.html',
      construccion: '<script src="https://cdn.jsdelivr.net/x.js">',
      origen: 'cdn.jsdelivr.net',
      valor: 'https://cdn.jsdelivr.net/x.js',
    })
    expect(detectados[1]).toEqual({
      ubicacion: 'dist/assets/x.css',
      construccion: 'url(https://fonts.googleapis.com/css2?family=Manrope)',
      origen: 'fonts.googleapis.com',
      valor: 'https://fonts.googleapis.com/css2?family=Manrope',
    })
  })

  it('@s25 dos llamadas con los mismos recursos dan listas idénticas, elemento a elemento y EN EL MISMO ORDEN', () => {
    const primera = detectarOrigenesExternos(artefactoDeDosFicheros(), [])
    const segunda = detectarOrigenesExternos(artefactoDeDosFicheros(), [])

    expect(segunda).toEqual(primera)
  })
})
