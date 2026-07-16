import { readFileSync } from 'node:fs'

import {
  cumple,
  ejecutarPuertaDeContraste,
  evaluarMatriz,
  extraerTokens,
  MATRIZ_DE_USO,
  RUTA_DE_LOS_TOKENS,
  type EspecificacionColor,
  type ParDeUso,
  resolverColor,
} from './puerta-contraste'

// Contrato: features/tokens_paleta_contraste.feature — la capa PUERTA (@s10-@s18).
//
// ANTI-TAUTOLOGÍA (regla dura del stack): los ratios y los umbrales esperados se escriben
// A MANO, tomados del audit [V] o de progress/f03_verificacion_previa.md. NUNCA se
// recomputan con `ratio()`/`componer()`, que son las funciones vigiladas.
//
// @s10 lee el fichero REAL (precedente de F-01: puerta.test.ts lee package.json para @s12).
const RUTA_TOKENS = 'src/styles/_tokens.scss'

// TODO cálculo va DENTRO del it(), nunca en el cuerpo del describe. Stryker activa cada
// mutante POR TEST: lo que se computa en tiempo de recolección ya se ejecutó ANTES de que el
// mutante estuviera activo, así que el mutante nunca se ejecuta y SOBREVIVE. Con los cálculos
// en el cuerpo del describe este fichero puntuaba 19 % con 189 supervivientes falsos; con
// helpers perezosos, los tests muerden de verdad. Por eso son funciones, no constantes.
const scssReal = () => readFileSync(RUTA_TOKENS, 'utf8')
const tokensReales = () => extraerTokens(scssReal())
const evaluacionesReales = () => evaluarMatriz(scssReal(), MATRIZ_DE_USO)

describe('_tokens.scss — los 13 tokens en un :root real con los 7 cambios (A3, A4)', () => {
  // @s10 verbatim. Cada literal se escribe a mano. El :root es REAL, no un `style` inline
  // como el prototipo (Opcion-1-Rosa.dc.html:28). NO se copia _tokens.scss de WebEmpresa
  // (T-1): sus valores base arrastran 3 bloqueantes AA.
  it.each([
    ['--muted', '#6F525A', 'cambio 1: antes #9C7F89, inservible como texto'],
    ['--accent-2', '#B3316E', 'cambio 4: antes #E38AAE, 2,47:1 con blanco'],
    ['--border-interactive', '#AB5F79', 'cambio 5: token NUEVO para bordes de control'],
    ['--ink', '#8E3355', 'cambio 6: para el fondo del pie, antes #B0466A'],
    ['--accent-dark', '#A23E5F', 'usado como texto/borde por los cambios 2 y 3'],
    ['--accent', '#C05576', 'A4: se CONSERVA como color de marca en rellenos grandes'],
  ])('@s10 el token %s vale exactamente %s (%s)', (token, valor) => {
    expect(tokensReales().get(token)).toBe(valor)
  })
})

// @s10. El parser declara que tolera el espaciado OPCIONAL del CSS (`--a:#fff` y
// `--a  :  #fff` son la misma declaración) y que un token COMENTADO no cuenta como
// declarado. Eso es comportamiento, no adorno: `prettier`/`sass` reformatean, y un
// `// --muted: #9C7F89;` dejado a medias no debe resucitar el valor viejo. Sin estos dos
// casos, los cuantificadores `\s*` y el borrado de comentarios no están fijados por nada.
describe('extraerTokens — lee el :root real, con el espaciado que sea (@s10)', () => {
  it('@s10 tolera el espaciado mínimo y el generoso: los dos declaran el mismo token', () => {
    expect(extraerTokens('  --a:#fff;').get('--a')).toBe('#fff')
    expect(extraerTokens('--a  :  #fff  ;').get('--a')).toBe('#fff')
  })

  it('@s10 lee varios tokens declarados en la misma línea', () => {
    const tokens = extraerTokens(':root { --a: #fff; --b: #000; }')

    expect(tokens.get('--a')).toBe('#fff')
    expect(tokens.get('--b')).toBe('#000')
  })

  it('@s10 un token COMENTADO no cuenta como declarado', () => {
    expect(extraerTokens('  // --muted: #9C7F89;').has('--muted')).toBe(false)
    expect(extraerTokens('  --muted: #6F525A; // antes #9C7F89').get('--muted')).toBe('#6F525A')
  })
})

// SC 1.4.3 pide «un ratio de contraste de AL MENOS 4,5:1»: el par que da exactamente el
// umbral CUMPLE. Ningún par real de la paleta cae justo en 4,5 ni en 3,0, así que la
// frontera solo se puede fijar con ratios sintéticos escritos a mano. Sin este test, `>=`
// pasaría por `>` sin que nada lo notara.
describe('cumple — la frontera del umbral es «al menos», no «más que»', () => {
  it.each([
    [4.5, 4.5, true, 'exactamente el umbral de texto: CUMPLE'],
    [3.0, 3.0, true, 'exactamente el umbral de componente: CUMPLE'],
    [4.4999, 4.5, false, 'por debajo por una milésima: NO cumple'],
    [21, 4.5, true, 'muy por encima: cumple'],
  ])('cumple(%s, %s) es %s (%s)', (ratioDelPar, umbral, esperado) => {
    expect(cumple(ratioDelPar, umbral)).toBe(esperado)
  })
})

describe('la matriz de uso — cada par corregido alcanza SU umbral (A2, A3, A7)', () => {
  // Busca el par en la matriz de PRODUCCIÓN. Si alguien borra una fila, el par deja de
  // encontrarse y el test se pone rojo: la matriz declarada no puede encoger en silencio.
  const evaluacionDe = (evaluaciones: ReturnType<typeof evaluarMatriz>, fg: string, bg: string) => {
    const encontrada = evaluaciones.find((una) => una.fg === fg && una.bg === bg)

    if (encontrada === undefined) {
      throw new Error(`la matriz de uso de producción no declara el par "${fg}" sobre "${bg}"`)
    }

    return encontrada
  }

  // @s11 verbatim (A2 + A3 + A7). Los ratios y los umbrales van A MANO: son [V] del audit y
  // NUNCA se recomputan con ratio(), que es la función vigilada.
  //
  // LAS 15 FILAS hex↔hex SE REPRODUCEN EXACTAS (verificado contra el audit antes de escribir
  // el SCSS). LA FILA DEL PIE ES 4.59, NO 4.60 (A-16): es la única compuesta —usa componer,
  // @s9— y con el componer FLOTANTE que manda el contrato el ratio real es 4,5913;
  // toBeCloseTo(4.60) FALLARÍA (precisión 2 exige desvío < 0,005; el desvío sería 0,0087).
  // El 4,60 es el valor CUANTIZADO a 8 bits que publicó el audit. No «corregir» de vuelta.
  //
  // Los colores del contrato escritos como hex (#FFFFFF, #186237) se alcanzan por su TOKEN
  // (--on-accent, --estado-en-linea): así la puerta los lee del SCSS y un cambio silencioso
  // en el :root rompe el build, que es el sentido de A2. El color es el mismo.
  it.each([
    ['--muted', '--bg', 'texto', 4.5, 6.42],
    ['--muted', '--surface', 'texto', 4.5, 6.93],
    ['--accent-dark', '--bg', 'texto', 4.5, 5.74],
    ['--accent-dark', '--surface', 'texto', 4.5, 6.19],
    ['--accent-dark', '--surface2', 'texto', 4.5, 5.24],
    ['--accent-dark', '--accent-soft', 'texto', 4.5, 4.86],
    ['--on-accent', '--accent-dark', 'texto', 4.5, 6.19],
    ['--on-accent', '--accent-2', 'texto/icono', 4.5, 5.86],
    ['--ink', '--bg', 'texto', 4.5, 7.06],
    ['--ink', '--surface2', 'texto', 4.5, 6.45],
    ['--ink', '--accent-soft', 'texto', 4.5, 5.98],
    ['--text', '--bg', 'texto', 4.5, 8.43],
    ['--text', '--surface2', 'texto', 4.5, 7.7],
    ['rgba(--on-accent,.70)', '--ink', 'texto', 4.5, 4.59],
    ['--border-interactive', '--accent-soft', 'componente', 3.0, 3.54],
    ['--estado-en-linea', '--accent-soft', 'texto', 4.5, 5.79],
  ])('@s11 "%s" sobre "%s" (%s) — umbral %s, ratio ~%s: pasa', (fg, bg, rol, umbral, ratio) => {
    const evaluacion = evaluacionDe(evaluacionesReales(), fg, bg)

    expect(evaluacion.ratio).toBeCloseTo(ratio, 2)
    expect(evaluacion.rol).toBe(rol)
    expect(evaluacion.umbral).toBe(umbral)
    expect(evaluacion.pasa).toBe(true)
  })

  it('@s11 ningún par de la matriz emite violación con los 7 cambios aplicados', () => {
    expect(evaluacionesReales().filter((una) => !una.pasa)).toEqual([])
  })

  // @s11 «no se emite ninguna violación» A TRAVÉS DE LA PUERTA, no solo de evaluarMatriz: es
  // lo que fija que la puerta SEPARA los pares que fallan de los que pasan y que devuelve
  // EXIT 0 cuando no hay ninguno. Sin esto sobreviven tres mutantes reales: quitar el
  // `.filter(!pasa)` (informaría también los pares buenos), y `lineas.length > 0` → `true` o
  // → `>= 0` (rompería el build siempre, incluso limpio).
  it('@s11 la puerta con la matriz real no emite ninguna línea y sale con código 0', () => {
    const resultado = ejecutarPuertaDeContraste({
      leerScss: scssReal,
      matriz: MATRIZ_DE_USO,
      minimoDePares: 18,
    })

    expect(resultado.lineas).toEqual([])
    expect(resultado.codigoSalida).toBe(0)
  })

  // A-13: la matriz es AUDITABLE o no es nada. Un par sin `uso` no se puede revisar («¿por
  // qué existe esta fila?») y un rol vacío no declara qué umbral le toca. Esta invariante
  // vale para las 18 filas a la vez.
  it('@s11 cada par de la matriz declara su rol y documenta su uso', () => {
    for (const par of MATRIZ_DE_USO) {
      expect(par.uso).not.toBe('')
      expect(['texto', 'texto/icono', 'componente']).toContain(par.rol)
    }
  })

  // La puerta tiene que apuntar al MISMO fichero que estos tests verifican; si el humilde
  // leyera otro, todo lo anterior no demostraría nada. La ruta se escribe a mano.
  it('@s11 la puerta vigila src/styles/_tokens.scss', () => {
    expect(RUTA_DE_LOS_TOKENS).toBe('src/styles/_tokens.scss')
  })
})

describe('la puerta — un par bajo su umbral rompe el build (A2, A7)', () => {
  // El botón «Reservar» VIEJO: blanco sobre --accent #C05576 = 4,37 ([V] audit), que cae en
  // el hueco (3,0 · 4,5). Se evalúa contra el SCSS REAL: --accent sigue siendo #C05576 (A4
  // lo conserva como marca), lo prohibido es USARLO así. Por eso este par es un FIXTURE y
  // @s13 asevera que la matriz de producción no lo contiene.
  const PAR_MALO_CONOCIDO: ParDeUso = {
    fg: { clase: 'token', token: '--on-accent' },
    bg: { clase: 'token', token: '--accent' },
    rol: 'texto',
    uso: 'fixture: el botón «Reservar» viejo, el bloqueante que abrió esta feature',
  }

  // @s12 (A2 + A7). El 4.37 y el 4.5 van A MANO ([V] audit). Mata el mutante 4.5 → 3.0 en un
  // par de texto: con el umbral mutado a 3.0 este par pasaría (4,37 > 3,0) y la violación
  // desaparecería. La puerta debe ACUSAR el par exacto con su ratio y su umbral, no gruñir
  // «hay un fallo de contraste» (misma lección que F-01).
  it('@s12 emite exactamente 1 violación que nombra el par, el ratio 4.37 y el umbral 4.5', () => {
    const resultado = ejecutarPuertaDeContraste({
      leerScss: scssReal,
      matriz: [PAR_MALO_CONOCIDO],
      minimoDePares: 1,
    })

    expect(resultado.lineas).toHaveLength(1)
    expect(resultado.lineas[0]).toContain('--on-accent')
    expect(resultado.lineas[0]).toContain('--accent')
    expect(resultado.lineas[0]).toContain('4.37')
    expect(resultado.lineas[0]).toContain('4.5')
  })

  it('@s12 el código de salida del build es distinto de 0', () => {
    const resultado = ejecutarPuertaDeContraste({
      leerScss: scssReal,
      matriz: [PAR_MALO_CONOCIDO],
      minimoDePares: 1,
    })

    expect(resultado.codigoSalida).not.toBe(0)
  })

  // @s12 «el código de salida del BUILD es distinto de 0» solo significa algo si la puerta
  // está DENTRO del build. Se comprueba en package.json, como hace F-01 con su puerta.
  // El guion se escribe A MANO: importar la constante sería un espejo del propio script.
  it('@s12 la puerta está enganchada al build de producción, y NO al dev', () => {
    const paquete = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }

    expect(paquete.scripts.build).toContain('tools/puerta-contraste.ts')
    expect(paquete.scripts.dev).not.toContain('tools/puerta-contraste.ts')
  })

  it('@s12 el informe es determinista: misma entrada → misma salida, mismo orden', () => {
    const peticion = {
      leerScss: scssReal,
      matriz: [PAR_MALO_CONOCIDO, ...MATRIZ_DE_USO],
      minimoDePares: 1,
    }

    expect(ejecutarPuertaDeContraste(peticion)).toEqual(ejecutarPuertaDeContraste(peticion))
  })
})

describe('la matriz NUNCA usa #C05576 como fg de texto o componente (A-13, A4)', () => {
  // Los canales de #C05576 van a mano: 0xC0 = 192, 0x55 = 85, 0x76 = 118.
  // Se compara por VALOR RESUELTO, no por nombre de token: así la guarda caza igual a
  // `--accent`, a `--brush` (que es el mismo color) y al hex literal. Por nombre, un alias
  // nuevo la esquivaría.
  const ACCENT_PROHIBIDO_COMO_TEXTO = [192, 85, 118]

  // @s13 (regla dura del audit §5.2: «prohibido #C05576 como texto pequeño o como relleno
  // con texto blanco — se reintroduce solo»). El problema nunca fue la estética rosa, sino
  // confundir «color de marca para rellenos» con «color de texto».
  it('@s13 ningún par de rol texto o componente declara #C05576 como primer plano', () => {
    const primerosPlanosProhibidos = MATRIZ_DE_USO.filter((par) =>
      resolverColor(par.fg, tokensReales()).every(
        (canal, indice) => canal === ACCENT_PROHIBIDO_COMO_TEXTO[indice],
      ),
    )

    expect(primerosPlanosProhibidos).toEqual([])
  })

  it('@s13 el texto sobre fondo claro usa --accent-dark #A23E5F, no --accent', () => {
    expect(tokensReales().get('--accent-dark')).toBe('#A23E5F')

    const fondosClaros = ['--bg', '--surface', '--surface2', '--accent-soft']
    const paresDeAccentDark = MATRIZ_DE_USO.filter(
      (par) => par.fg.clase === 'token' && par.fg.token === '--accent-dark',
    ).map((par) => (par.bg.clase === 'token' ? par.bg.token : ''))

    expect(paresDeAccentDark).toEqual(fondosClaros)
  })

  it('@s13 #C05576 sigue existiendo como relleno de marca (--accent, --brush), fuera de la matriz', () => {
    expect(tokensReales().get('--accent')).toBe('#C05576')
    expect(tokensReales().get('--brush')).toBe('#C05576')
  })
})

describe('la puerta falla cerrada (A-13 guarda (a); modos de error)', () => {
  const PAR_DE_CABECERA: ParDeUso = {
    fg: { clase: 'token', token: '--muted' },
    bg: { clase: 'cabecera', token: '--header-bg', sobre: { clase: 'hex', hex: '#000000' } },
    rol: 'texto',
    uso: 'nav sobre la cabecera translúcida, con el peor under posible debajo',
  }

  const UN_PAR_CUALQUIERA: ParDeUso = {
    fg: { clase: 'token', token: '--muted' },
    bg: { clase: 'token', token: '--bg' },
    rol: 'texto',
    uso: 'par de relleno para los fixtures de vacuidad',
  }

  // @s14. Verde por vacuidad: 0 fallos sobre 0 pares no es estar protegido, es no haber
  // mirado. La puerta EXIGE un mínimo CONOCIDO de pares evaluados.
  it.each([
    ['una matriz de uso vacía', scssReal, [] as ParDeUso[]],
    ['un SCSS cuyo :root no casa ningún token', () => 'body { color: red; }', [] as ParDeUso[]],
  ])('@s14 con %s el código de salida es distinto de 0', (_caso, leerScss, matriz) => {
    const resultado = ejecutarPuertaDeContraste({ leerScss, matriz, minimoDePares: 16 })

    expect(resultado.codigoSalida).not.toBe(0)
  })

  it('@s14 la salida declara que no se evaluó el mínimo, y NO que no haya fallos', () => {
    const resultado = ejecutarPuertaDeContraste({
      leerScss: scssReal,
      matriz: [],
      minimoDePares: 16,
    })

    expect(resultado.lineas.join('\n')).toContain('mínimo de pares')
    expect(resultado.lineas.join('\n')).not.toContain('sin fallos')
  })

  // @s15 (modos de error, derivación de I-3 igual que F-01). Una puerta que se traga la
  // excepción y devuelve «0 fallos» es PEOR que ninguna: da confianza falsa. Es literalmente
  // cómo se evaporaron los 3 bloqueantes AA del stack base.
  // Los fixtures son SCSS REAL, un token por línea, como el fichero de verdad: un fixture
  // que el parser no sabe leer haría pasar el test por la razón equivocada (la lección del
  // doble mentiroso de F-01, @s20).
  it.each([
    [
      'un token de la matriz no está declarado en el :root',
      ':root {\n  --bg: #FDF4F7;\n}',
      '--muted',
    ],
    [
      'un token está declarado con un hex malformado',
      ':root {\n  --bg: #FDF4F7;\n  --muted: #GGGGGG;\n}',
      'malformado',
    ],
  ])('@s15 con %s: exit != 0 y la salida declara la causa', (_caso, scss, causaEsperada) => {
    const resultado = ejecutarPuertaDeContraste({
      leerScss: () => scss,
      matriz: [UN_PAR_CUALQUIERA],
      minimoDePares: 1,
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain(causaEsperada)
    expect(resultado.lineas.join('\n')).not.toContain('sin fallos')
  })

  // @s15, fila 1: el fichero no existe o no se puede leer. Vive en la PUERTA, no en el
  // humilde: si el humilde reventara con un stack trace crudo, el build rompería —bien— pero
  // sin declarar la causa, y docs/conventions.md lo prohíbe. El puerto es fiel al real:
  // `readFileSync` LANZA ENOENT, no devuelve "".
  // @s15, «un token roto», sobre la CABECERA: --header-bg declarado pero con un valor que no
  // es un color-mix translúcido reconocible. La puerta no puede adivinar la opacidad, así que
  // falla cerrada declarando la causa. Sin este caso, el `throw` de leerCabecera y su mensaje
  // no los fija nada (misma lección que el `motivoDelReventon` de F-01: exigir la CAUSA
  // concreta, no un «no pudo completar» que cualquier cosa cumple).
  it('@s15 si --header-bg no declara un color-mix reconocible: exit != 0 y declara la causa', () => {
    const resultado = ejecutarPuertaDeContraste({
      leerScss: () => ':root {\n  --bg: #FDF4F7;\n  --muted: #6F525A;\n  --header-bg: rebeldia;\n}',
      matriz: [PAR_DE_CABECERA],
      minimoDePares: 1,
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('no declara un color-mix translúcido reconocible')
    expect(resultado.lineas.join('\n')).toContain('--header-bg')
  })

  it('@s15 si --header-bg no está declarado en el :root: exit != 0 y declara la causa', () => {
    const resultado = ejecutarPuertaDeContraste({
      leerScss: () => ':root {\n  --bg: #FDF4F7;\n  --muted: #6F525A;\n}',
      matriz: [PAR_DE_CABECERA],
      minimoDePares: 1,
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('--header-bg')
    expect(resultado.lineas.join('\n')).toContain('no está declarado en el :root')
  })

  // El color-mix se escribe con el espaciado que el autor quiera: CSS lo permite y `sass`
  // reformatea. La puerta lee la MISMA opacidad en los tres casos, o el 88 % dependería de
  // cómo esté escrito el fichero.
  it.each([
    ['espaciado canónico', 'color-mix(in srgb, var(--bg) 88%, transparent)'],
    ['sin espacios', 'color-mix(in srgb,var(--bg) 88%,transparent)'],
    ['espaciado generoso', 'color-mix( in  srgb , var( --bg )  88% , transparent )'],
    ['porcentaje con decimales', 'color-mix(in srgb, var(--bg) 88.00%, transparent)'],
  ])('@s17 lee la opacidad del color-mix con %s', (_caso, valorDelToken) => {
    const [evaluacion] = evaluarMatriz(
      `:root {\n  --bg: #FDF4F7;\n  --muted: #6F525A;\n  --header-bg: ${valorDelToken};\n}`,
      [PAR_DE_CABECERA],
    )

    // El mismo 4.89 escrito a mano de @s17: la opacidad leída es la misma se escriba como se
    // escriba.
    expect(evaluacion.ratio).toBeCloseTo(4.89, 2)
  })

  it('@s15 si _tokens.scss no existe o no se puede leer: exit != 0 y declara la causa', () => {
    const lectorQueRevienta = () => {
      throw new Error("ENOENT: no such file or directory, open 'src/styles/_tokens.scss'")
    }

    const resultado = ejecutarPuertaDeContraste({
      leerScss: lectorQueRevienta,
      matriz: [UN_PAR_CUALQUIERA],
      minimoDePares: 1,
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('ENOENT')
    expect(resultado.lineas.join('\n')).not.toContain('sin fallos')
  })
})

describe('trampa (a): clamp() — el ratio no cambia, el UMBRAL sí (A5, A7)', () => {
  // «Studio»: font-size clamp(14px, 2.2vw, 24px), --ink sobre --accent-soft. A 24 px
  // (escritorio) sería texto grande → umbral 3,0 → pasaría; a 14 px (móvil) es texto normal
  // → umbral 4,5 → falla. La matriz registra el rol al tamaño EFECTIVO MÍNIMO, que es el que
  // de verdad se renderiza en el peor viewport. Se detecta SIN navegador porque es cálculo,
  // no render.
  const parStudio = () =>
    MATRIZ_DE_USO.find(
      (par) =>
        par.fg.clase === 'token' &&
        par.fg.token === '--ink' &&
        par.bg.clase === 'token' &&
        par.bg.token === '--accent-soft',
    )

  // El fixture del --ink VIEJO: ratio constante 4,19 ([V] audit), que cae entre 3,0 y 4,5 —
  // exactamente el hueco donde la trampa vive.
  const SCSS_CON_INK_VIEJO = ':root {\n  --ink: #B0466A;\n  --accent-soft: #F7DDE8;\n}'

  it('@s16 la matriz declara el par «Studio» (--ink sobre --accent-soft)', () => {
    expect(parStudio()).toBeDefined()
  })

  it('@s16 aplica el umbral 4.5 (texto normal a 14 px), no 3.0 (texto grande a 24 px)', () => {
    const [evaluacion] = evaluarMatriz(SCSS_CON_INK_VIEJO, [parStudio()!])

    expect(evaluacion.umbral).toBe(4.5)
    expect(evaluacion.umbral).not.toBe(3.0)
  })

  it('@s16 marca el fixture 4.19 como violación, porque a 14 px «Studio» es texto normal', () => {
    const resultado = ejecutarPuertaDeContraste({
      leerScss: () => SCSS_CON_INK_VIEJO,
      matriz: [parStudio()!],
      minimoDePares: 1,
    })

    expect(resultado.lineas).toHaveLength(1)
    expect(resultado.lineas[0]).toContain('4.19')
    expect(resultado.lineas[0]).toContain('4.5')
    expect(resultado.codigoSalida).not.toBe(0)
  })

  it('@s16 con el --ink #8E3355 corregido «Studio» sube a 5.98 y pasa incluso a 14 px', () => {
    const [evaluacion] = evaluarMatriz(scssReal(), [parStudio()!])

    expect(evaluacion.ratio).toBeCloseTo(5.98, 2)
    expect(evaluacion.pasa).toBe(true)
  })
})

describe('trampa (b): color-mix() — la cabecera al 88 % (A6, A-15)', () => {
  // El fondo de la cabecera es `color-mix(in srgb, var(--bg) 88%, transparent)` sobre lo que
  // scrollee debajo. La puerta LEE LA OPACIDAD DEL SCSS y recalcula: por eso bajar el 88 a 82
  // pone @s17 en rojo (@s18). Si el 88 estuviera escrito aquí en la matriz, no se enteraría.
  const bajoLaCabecera = (under: EspecificacionColor): EspecificacionColor => ({
    clase: 'cabecera',
    token: '--header-bg',
    sobre: under,
  })

  const hex = (valor: string): EspecificacionColor => ({ clase: 'hex', hex: valor })
  const NEGRO_PURO = hex('#000000')

  // @s17 (A6 + A-15). LAS DOS PRIMERAS FILAS SON EL ESCENARIO CENTRAL: el PEOR UNDER POSIBLE.
  // Si pasa con negro puro, PASA CON CUALQUIER COSA — guarda más fuerte y más simple que una
  // lista declarada de unders, que es justo lo que falló (el contrato anterior declaraba
  // «foto oscura» solo para el logo y NO para la nav, que es la que fallaba).
  //
  // POR QUÉ EL PEOR UNDER, bien dicho (C7): NO porque «WCAG exija el peor caso» —eso es
  // falso; F83 lo trata como Quickcheck, condición SUFICIENTE, no necesaria—. La exigencia
  // real de SC 1.4.3 es ≥4,5:1 entre cada letra y el fondo INMEDIATAMENTE detrás de ella;
  // bajo un fondo que depende del scroll, CADA posición es un fondo inmediato posible, y el
  // peor de todos decide si existe alguna posición incumplidora. Es correcto porque LO IMPLICA.
  //
  // Los ratios 4.89 y 5.38 van A MANO (verificación previa §1), nunca recomputados.
  it.each([
    ['--muted', 'texto (nav)', 4.5, 4.89],
    ['--ink', 'logo', 4.5, 5.38],
  ])(
    '@s17 "%s" (%s) sobre la cabecera translúcida con NEGRO PURO debajo: umbral %s, ratio ~%s: pasa',
    (fg, _rol, umbral, ratioEsperado) => {
      const [evaluacion] = evaluarMatriz(scssReal(), [
        {
          fg: { clase: 'token', token: fg },
          bg: bajoLaCabecera(NEGRO_PURO),
          rol: 'texto',
          uso: 'cabecera translúcida contra el peor under posible',
        },
      ])

      expect(evaluacion.ratio).toBeCloseTo(ratioEsperado, 2)
      expect(evaluacion.umbral).toBe(umbral)
      expect(evaluacion.pasa).toBe(true)
    },
  )

  // El resto de la tabla de @s17: documenta EL MARGEN. Todos quedan subsumidos por el negro
  // puro, pero se comprueban porque el contrato los declara. Ratios a mano.
  it.each([
    ['--muted', '#FBE7EF', '--surface2', 6.35],
    ['--ink', '#FBE7EF', '--surface2', 6.99],
    ['--muted', '#C05576', '--accent', 5.55],
    ['--ink', '#C05576', '--accent', 6.11],
    ['--muted', '#8E3355', '--ink (pie)', 5.32],
    ['--ink', '#8E3355', '--ink (pie)', 5.86],
    ['--muted', '#303030', '«peor caso» del audit', 5.17],
    ['--ink', '#303030', '«peor caso» del audit', 5.69],
    ['--muted', '#1B1B1D', '«Negro Ónix» de la carta', 5.05],
    ['--ink', '#1B1B1D', '«Negro Ónix» de la carta', 5.55],
  ])(
    '@s17 "%s" sobre la cabecera con %s (%s) debajo: ratio ~%s y pasa',
    (fg, under, _n, esperado) => {
      const [evaluacion] = evaluarMatriz(scssReal(), [
        {
          fg: { clase: 'token', token: fg },
          bg: bajoLaCabecera(hex(under)),
          rol: 'texto',
          uso: 'margen documentado por @s17',
        },
      ])

      expect(evaluacion.ratio).toBeCloseTo(esperado, 2)
      expect(evaluacion.pasa).toBe(true)
    },
  )

  it('@s17 la matriz de producción vigila la cabecera contra el negro puro (nav Y logo)', () => {
    const paresDeCabecera = MATRIZ_DE_USO.filter((par) => par.bg.clase === 'cabecera')

    expect(paresDeCabecera.map((par) => (par.fg.clase === 'token' ? par.fg.token : ''))).toEqual([
      '--muted',
      '--ink',
    ])
  })

  // @s18 (A6 + A-15). EXISTE PARA QUE EL 88 % NO SEA UN NÚMERO MÁGICO SIN DEFENSA. El mutante
  // real aquí es HUMANO: alguien que dentro de seis meses baje el 88 a 82 «por fidelidad al
  // prototipo». El 4,22 va a mano (verificación previa §1: 0.82·253 = 207.46, 0.82·244 =
  // 200.08, 0.82·247 = 202.54). Es el dato que tumbó al 82 %: junto con el 4,44 contra «Negro
  // Ónix» —color real de la carta, salon-data.js:90— demuestra que la cabecera del prototipo
  // NO cumple AA en la nav. --ink (logo) aguanta el negro puro incluso al 82 % (4,64): esa
  // asimetría entre logo y nav es exactamente lo que escondía el fallo.
  it('@s18 bajar la cabecera al 82 % hace que la nav incumpla AA: violación con 4.22 y umbral 4.5', () => {
    const SCSS_AL_82 = scssReal().replace('var(--bg) 88%', 'var(--bg) 82%')

    const resultado = ejecutarPuertaDeContraste({
      leerScss: () => SCSS_AL_82,
      matriz: [
        {
          fg: { clase: 'token', token: '--muted' },
          bg: bajoLaCabecera(NEGRO_PURO),
          rol: 'texto',
          uso: 'nav de la cabecera al 82 % con negro puro debajo',
        },
      ],
      minimoDePares: 1,
    })

    expect(resultado.lineas).toHaveLength(1)
    expect(resultado.lineas[0]).toContain('--muted')
    expect(resultado.lineas[0]).toContain('--header-bg')
    expect(resultado.lineas[0]).toContain('#000000')
    expect(resultado.lineas[0]).toContain('4.22')
    expect(resultado.lineas[0]).toContain('4.5')
    expect(resultado.codigoSalida).not.toBe(0)
  })
})
