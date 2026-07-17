import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  ejecutarPuertaDeTerceros,
  PARES_DE_FUENTE_ESPERADOS,
  type ParDeFuente,
  type PeticionPuertaTerceros,
} from './puerta-terceros.ts'
import type { RecursoDeArtefacto } from './terceros.ts'

/**
 * F-05 — la PUERTA de terceros (decisor puro). Contrato: features/cero_terceros.feature.
 *
 * 🔴 LA ASERCIÓN ES NEGATIVA Y POR LISTA BLANCA DE ESQUEMAS. NO ES UN DETALLE DE ESTILO: ES LA
 * DECISIÓN DE DISEÑO CENTRAL DE LA PUERTA. Una LISTA NEGRA (`grep https?://`) es exactamente lo que
 * la verificación prohíbe: sobre `dist/assets/*.js` da falsos positivos garantizados (`fb.me`,
 * `react.dev`, `w3.org`) y sobre `dist/*.html` casa `example.invalid` [V].
 *
 * ⚠️ ANTI-TAUTOLOGÍA, REGLA DURA: la lista de pares del `Given` se escribe A MANO y JAMÁS se
 * importa `PARES_DE_FUENTE_ESPERADOS` para usarla como VALOR ESPERADO. La ÚNICA excepción es el
 * escenario-ancla @s38, que SÍ la importa para FIJARLA contra un literal escrito a mano — eso no
 * es tautología: es lo contrario.
 *
 * ⚠️ `coverageAnalysis: perTest`: TODO cálculo va DENTRO del `it`.
 */

/** Los 6 pares, ESCRITOS A MANO. Medidos sobre el prototipo (`Opcion-1-Rosa.dc.html`) [V]. */
function paresEscritosAMano(): readonly ParDeFuente[] {
  return [
    ['Manrope', 400],
    ['Manrope', 500],
    ['Manrope', 600],
    ['Manrope', 700],
    ['Gilda Display', 400],
    ['Great Vibes', 400],
  ]
}

/**
 * Un `@font-face` con la forma REAL que emite `@fontsource` 5.2.8 [V]: `font-display: swap`, y
 * `src: url(…woff2) format('woff2'), url(…woff) format('woff')`.
 */
function fontFace(familia: string, peso: number, url: string): string {
  return `@font-face { font-family: '${familia}'; font-style: normal; font-display: swap; font-weight: ${peso}; src: url(${url}) format('woff2'); }`
}

/** Un CSS que declara EXACTAMENTE los pares que se le pidan, todos con url(/assets/…woff2). */
function cssDePares(pares: readonly ParDeFuente[]): string {
  return pares
    .map(([familia, peso]) => fontFace(familia, peso, `/assets/${familia}-${String(peso)}-Bx.woff2`))
    .join('')
}

/** El CSS de producción: los 6 `@font-face` esperados. La primera url es la que se pone a prueba. */
function cssDeLasSeisFuentes(urlDeLaPrimera: string): string {
  return [
    fontFace('Manrope', 400, urlDeLaPrimera),
    fontFace('Manrope', 500, '/assets/manrope-latin-500-normal-Ck2Hn9Yo.woff2'),
    fontFace('Manrope', 600, '/assets/manrope-latin-600-normal-DpQr3sTu.woff2'),
    fontFace('Manrope', 700, '/assets/manrope-latin-700-normal-BvWx5yZa.woff2'),
    fontFace('Gilda Display', 400, '/assets/gilda-display-latin-400-normal-Dh7Kl2Mn.woff2'),
    fontFace('Great Vibes', 400, '/assets/great-vibes-latin-400-normal-Cx9Pq4Rs.woff2'),
  ].join('')
}

/** `vite.config.ts` REAL del repo: NO declara `base` [V, comprobado]. */
const CONFIG_SIN_BASE = `import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  ssgOptions: { script: 'async', entry: 'src/main.tsx' },
})
`

function configConBase(base: string): string {
  return CONFIG_SIN_BASE.replace('plugins: [react()],', `plugins: [react()],\n  base: '${base}',`)
}

interface OpcionesDePeticion {
  readonly recursos?: readonly RecursoDeArtefacto[]
  readonly config?: string
  readonly paresEsperados?: readonly ParDeFuente[]
  readonly allowlist?: readonly string[]
  readonly leerArtefacto?: () => readonly RecursoDeArtefacto[]
  readonly leerConfigVite?: () => string
}

/**
 * 🔴 EL DOBLE DEL PUERTO LANZA DONDE EL REAL LANZA (lección literal de @s20 de F-01). Los dos
 * campos —`leerArtefacto` y `leerConfigVite`— LANZAN si el fichero/directorio no existe, que es lo
 * que hacen `readdirSync`/`readFileSync`. Un doble que devolviera `[]` donde el real lanza testea
 * una puerta que no existe.
 */
function peticion(opciones: OpcionesDePeticion = {}): PeticionPuertaTerceros {
  const recursos = opciones.recursos ?? [
    { ubicacion: 'dist/assets/index-DiwrgTda.css', tipo: 'css', contenido: cssDeLasSeisFuentes('/assets/manrope-latin-400-normal-BGsTXAXT.woff2') },
    { ubicacion: 'dist/index.html', tipo: 'html', contenido: '<html lang="es"><body><h1>Nails Lash Studio</h1></body></html>' },
  ]

  return {
    leerArtefacto: opciones.leerArtefacto ?? (() => recursos),
    leerConfigVite: opciones.leerConfigVite ?? (() => opciones.config ?? CONFIG_SIN_BASE),
    allowlist: opciones.allowlist ?? [],
    paresEsperados: opciones.paresEsperados ?? paresEscritosAMano(),
  }
}

function cssDeProduccion(urlDeLaPrimera: string): readonly RecursoDeArtefacto[] {
  return [
    {
      ubicacion: 'dist/assets/x.css',
      tipo: 'css',
      contenido: cssDeLasSeisFuentes(urlDeLaPrimera),
    },
  ]
}

/**
 * 🔴 REPARADO EN EL CONTRATO — ERA LA FORMA EXACTA DEL `4,60` DE F-03: el Given no declaraba
 * `paresEsperados` y el test NACÍA ROJO CONTRA UNA IMPLEMENTACIÓN CORRECTA. Ahora el artefacto
 * declara los 6 `@font-face` y la lista literal: las filas 1-2 dan 0 DE VERDAD, y las 3-6 dan 1 POR
 * EL ORIGEN EXTERNO —que es lo que este escenario mide— y no por la guarda de fuentes.
 * 🔴 El fixture declara `font-weight: 400` EXPLÍCITAMENTE: el par bajo prueba es ("Manrope", 400)
 * sin ambigüedad. NO se destila una regla de defaulting (`font-weight` ausente → 400) porque NINGÚN
 * escenario la exige y sería producción sin test rojo.
 * LA FILA `//cdn.tercero.com` ES EL HUECO CLÁSICO (@s8): una lista blanca escrita como «empieza por
 * http → malo» LA DEJA PASAR. LA ÚLTIMA es lo que `base: 'https://cdn.evil.example/x/'` produce en
 * el CSS real [V, medido con un build real]: la mitad de salida de la pinza de @s27.
 */
describe('el CSS de dist/ solo admite rutas /assets/… o data: — cualquier otro esquema es violación (@s26)', () => {
  it.each([
    ['/assets/manrope-latin-400-normal-BGsTXAXT.woff2', 0, null],
    ['data:font/woff2;base64,d09GMgABAAAAAA', 0, null],
    ['https://fonts.gstatic.com/s/manrope/v15/x.woff2', 1, 'fonts.gstatic.com'],
    ['http://cdn.tercero.com/x.woff2', 1, 'cdn.tercero.com'],
    ['//cdn.tercero.com/x.woff2', 1, 'cdn.tercero.com'],
    ['https://cdn.evil.example/x/assets/manrope-latin-400.woff2', 1, 'cdn.evil.example'],
  ])('@s26 url(%s) → código de salida %i', (url, codigo, origen) => {
    const resultado = ejecutarPuertaDeTerceros(peticion({ recursos: cssDeProduccion(url) }))

    expect(resultado.codigoSalida).toBe(codigo)

    if (origen === null) {
      expect(resultado.lineas).toEqual([])
    } else {
      expect(resultado.lineas).toHaveLength(1)
      expect(resultado.lineas[0]).toContain('dist/assets/x.css')
      expect(resultado.lineas[0]).toContain(origen)
    }
  })
})

/**
 * 🔴 `base` ES LA VÍA Nº1 POR LA QUE UN TERCERO ENTRA SIN QUE NADIE LO ESCRIBA [V, medido con un
 * build REAL]: `base: 'https://cdn.evil.example/x/'` reescribe TODOS los `url()`. UN SOLO CAMPO DE
 * CONFIG INVALIDA EL «NUNCA EXTERNO», Y NINGÚN GREP DEL CSS LO ANTICIPA.
 * 🔴 LAS DOS ASERCIONES SON COMPLEMENTARIAS Y NINGUNA SOBRA — hay que escribirlo o alguien borrará
 * una por «redundante» dentro de seis meses:
 *   - LA DE LA SALIDA (@s26) cubre `--base` por CLI y `experimental.renderBuiltUrl`, que NO VIVEN
 *     en `vite.config.ts`: la puerta corre DESPUÉS del build y ve el `url()` ya reescrito.
 *     @s27 sería CIEGA a esos dos.
 *   - LA DE LA CONFIG (aquí) cubre EL COMMIT: deja rastro en el diff y rompe el build EN EL SITIO
 *     DONDE ESTÁ LA CAUSA. @s26 sería MUDA sobre la causa.
 * EL 1er Given ES CRÍTICO: EL CSS ESTÁ LIMPIO. Aquí la puerta rompe SIN QUE HAYA NI UN ORIGEN
 * EXTERNO EN EL ARTEFACTO, y ESO es el escenario.
 * LAS FILAS `"./"` Y `"/subcarpeta/"` anclan la regla EXACTA: pasa `base` NO DECLARADA o declarada
 * EXACTAMENTE `'/'`; cualquier otra cosa es violación. NO es «pasa si no empieza por http»: `'./'`
 * no empieza por http y ROMPE EL INVARIANTE DE LA RUTA ROOT-ABSOLUTA.
 * ⚠️ `leerConfigVite()` devuelve EL TEXTO de `vite.config.ts` (forma F-03: `leerScss`) y una función
 * PURA decide. NO se importa la config: un `import` ejecutaría código y no vería `--base`.
 */
describe('la puerta asevera la config base de vite.config.ts, ADEMÁS de la salida (@s27)', () => {
  it('@s27 un vite.config.ts que no declara base no emite ninguna violación por base', () => {
    const resultado = ejecutarPuertaDeTerceros(peticion({ config: CONFIG_SIN_BASE }))

    expect(resultado.codigoSalida).toBe(0)
    expect(resultado.lineas).toEqual([])
  })

  it('@s27 base declarada exactamente "/" no emite ninguna violación por base', () => {
    const resultado = ejecutarPuertaDeTerceros(peticion({ config: configConBase('/') }))

    expect(resultado.codigoSalida).toBe(0)
    expect(resultado.lineas).toEqual([])
  })

  it.each([
    ['https://cdn.evil.example/x/'],
    ['https://cdn.tercero.com/'],
    ['./'],
    ['/subcarpeta/'],
  ])('@s27 base "%s" rompe el build con una línea propia que NOMBRA vite.config.ts', (base) => {
    const resultado = ejecutarPuertaDeTerceros(peticion({ config: configConBase(base) }))

    expect(resultado.codigoSalida).toBe(1)
    expect(resultado.lineas).toHaveLength(1)
    expect(resultado.lineas[0]).toContain('vite.config.ts')
    expect(resultado.lineas[0]).toContain(base)
  })
})

/** Un artefacto de un solo CSS con los pares que se le pidan, y sin ningún origen externo. */
function artefactoConPares(pares: readonly ParDeFuente[]): readonly RecursoDeArtefacto[] {
  return [{ ubicacion: 'dist/assets/x.css', tipo: 'css', contenido: cssDePares(pares) }]
}

/**
 * EL CAMINO FELIZ DE LA GUARDA. Sin él, una guarda que rompiera SIEMPRE pasaría @s29, @s30 y @s31.
 * LOS 6 PARES SON MEDIDOS SOBRE EL PROTOTIPO, NO HEREDADOS [V]: 6 imports, 6 woff2, 119.540 bytes
 * (verificado INSTALANDO DE VERDAD `@fontsource` 5.2.8; OFL-1.1 permite autohospedar).
 */
describe('el conjunto EXACTO de @font-face esperado deja el build en verde (@s28)', () => {
  it('@s28 los 6 @font-face esperados, sin origen externo y sin base: código 0 y ninguna violación', () => {
    const resultado = ejecutarPuertaDeTerceros(
      peticion({ recursos: artefactoConPares(paresEscritosAMano()) }),
    )

    expect(resultado.codigoSalida).toBe(0)
    expect(resultado.lineas).toEqual([])
  })
})

/**
 * 🔴 ES LA GUARDA ANTI-VACUIDAD Y EL ACCEPTANCE 4, A LA VEZ. MATA DOS PÁJAROS.
 * 1ª FILA — ACCEPTANCE 4: el prototipo pide `Manrope:wght@300;400;500;600;700` y `font-weight: 300`
 * → 0 OCURRENCIAS [V, medido]. Si alguien importara el 300, entraría como `@font-face` de peso 300
 * en `dist` → conjunto distinto → VIOLACIÓN.
 * ÚLTIMA FILA — LA GUARDA: sin ella, `dist/` sin ningún `@font-face` → 0 orígenes → build VERDE →
 * «protegidos». 0 FALLOS SOBRE 0 FUENTES NO ES ESTAR PROTEGIDO: ES NO HABER MIRADO.
 * FILAS 4 y 5 — LA BAJA DE LAS DEPENDENCIAS MUERTAS: `@fontsource/dm-sans` y `@fontsource/outfit`
 * están en `package.json` y NO se importan en ningún sitio [V]. Quitar una dependencia no es código
 * y no lleva test propio, pero si un `@font-face` suyo llegara a `dist`, el conjunto no coincide y
 * el build rompe. ESTE ESCENARIO ES LO QUE LO ANCLA.
 * FILA 6 — `@fontsource-variable`, EL FALLO SILENCIOSO MÁS CARO [V]: RENOMBRA LA FAMILIA a
 * `'Manrope Variable'` → si el SCSS dice `'Manrope'`, la fuente NO CARGA y cae al fallback SIN
 * NINGÚN ERROR. Aquí ROMPE EL BUILD, que es lo que queremos.
 */
describe('un conjunto de @font-face DISTINTO del declarado rompe el build, acusando el par (@s29)', () => {
  it.each([
    [
      'añade un @font-face ("Manrope", 300)',
      [...paresEscritosAMano(), ['Manrope', 300] as ParDeFuente],
      'sobra el par ("Manrope", 300)',
    ],
    [
      'no declara el @font-face ("Manrope", 700)',
      paresEscritosAMano().filter(([familia, peso]) => !(familia === 'Manrope' && peso === 700)),
      'falta el par ("Manrope", 700)',
    ],
    [
      'no declara ningún @font-face de "Great Vibes"',
      paresEscritosAMano().filter(([familia]) => familia !== 'Great Vibes'),
      'falta el par ("Great Vibes", 400)',
    ],
    [
      'añade un @font-face ("Outfit", 400)',
      [...paresEscritosAMano(), ['Outfit', 400] as ParDeFuente],
      'sobra el par ("Outfit", 400)',
    ],
    [
      'añade un @font-face ("DM Sans", 400)',
      [...paresEscritosAMano(), ['DM Sans', 400] as ParDeFuente],
      'sobra el par ("DM Sans", 400)',
    ],
    [
      'añade un @font-face ("Manrope Variable", 400)',
      [...paresEscritosAMano(), ['Manrope Variable', 400] as ParDeFuente],
      'sobra el par ("Manrope Variable", 400)',
    ],
  ])('@s29 el CSS %s → rompe el build y acusa "%s"', (_situacion, pares, acusacion) => {
    const resultado = ejecutarPuertaDeTerceros(peticion({ recursos: artefactoConPares(pares) }))

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas).toContain(acusacion)
    // «la salida NO declara que no haya violaciones»: hay líneas, y el humilde solo imprime el ✓
    // cuando el código de salida es 0.
    expect(resultado.lineas.length).toBeGreaterThan(0)
  })

  it('@s29 un CSS sin ningún @font-face acusa los 6 pares que faltan: dist/ vacío NO es dist/ limpio', () => {
    const resultado = ejecutarPuertaDeTerceros(peticion({ recursos: artefactoConPares([]) }))

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas).toEqual([
      'falta el par ("Manrope", 400)',
      'falta el par ("Manrope", 500)',
      'falta el par ("Manrope", 600)',
      'falta el par ("Manrope", 700)',
      'falta el par ("Gilda Display", 400)',
      'falta el par ("Great Vibes", 400)',
    ])
  })
})

/**
 * 🔴🔴 ES LA GUARDA DE LA GUARDA: asevera EL COMPORTAMIENTO de la puerta ante una lista esperada
 * VACÍA — falla, no pasa vacuamente. Con la lista vacía, «el conjunto de @font-face coincide con el
 * esperado» SE SATISFACE VACUAMENTE y la puerta pasaría SIN VIGILAR NI UNA FUENTE: verde por
 * vacuidad DENTRO del escenario que persigue el verde por vacuidad. @s14 de F-03 tardó UN JUDGE en
 * descubrir esta trampa. No se descubre otra vez: se hereda escrita.
 * 🔴 ESTE ESCENARIO **NO** MATA A `ArrayDeclaration` sobre la constante de producción, y el contrato
 * lo afirmaba TRES VECES: inyecta SU PROPIO `[]` desde el Given y JAMÁS evalúa
 * PARES_DE_FUENTE_ESPERADOS. Quien lo mata es @s38. @s30 y @s38 son DISTINTOS Y LOS DOS HACEN
 * FALTA: @s38 fija EL VALOR; @s30 fija EL COMPORTAMIENTO ante una lista vacía VENGA DE DONDE VENGA.
 * EL 1er Given ES CRÍTICO: EL ARTEFACTO ESTÁ PERFECTO. La puerta rompe IGUAL, y por LA LISTA, no
 * por el artefacto. Es lo que lo distingue de @s29.
 */
describe('la puerta falla si la lista de pares de fuente esperados está VACÍA — la guarda de la guarda (@s30)', () => {
  it('@s30 con el artefacto PERFECTO y la lista vacía, la puerta rompe igual y lo declara', () => {
    const resultado = ejecutarPuertaDeTerceros(
      peticion({ recursos: artefactoConPares(paresEscritosAMano()), paresEsperados: [] }),
    )

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas).toEqual([
      'la lista de pares de fuente esperados está vacía: no hay ninguna fuente que exigirle al artefacto',
    ])
  })
})

/**
 * EL OBJETO VIGILADO NO ES EL SITIO: ES EL EXTRACTOR (precedente literal: @s28 de F-04). Que la
 * puerta informe «0 orígenes externos» habiendo mirado 0 recursos es el mismo verde por vacuidad de
 * @s29, UN NIVEL MÁS ABAJO: si el filtro de extensión (@s34) deja de casar, o `dist/` sale vacío, la
 * puerta pasa «protegidos» SIN HABER MIRADO NADA.
 * ES EL MODO DE FALLO MÁS PROBABLE DE ESTA PUERTA: se ejecuta DESPUÉS del build, y un build que no
 * generó nada la dejaría escaneando el vacío.
 * ⚠️ ES DISTINTO DE @s29 y @s30: @s29 vigila el conjunto de fuentes; @s30, la lista esperada; @s31,
 * QUE HAYA HABIDO ALGO QUE INSPECCIONAR. @s32 cubre que `dist/` NO EXISTA, que es otro caso: allí la
 * puerta NI LLEGA A CONTAR, porque el puerto LANZA.
 */
describe('la puerta falla si no ha inspeccionado ni un solo recurso (@s31)', () => {
  it('@s31 con 0 recursos html o css, la puerta rompe y declara que no inspeccionó nada', () => {
    const resultado = ejecutarPuertaDeTerceros(peticion({ recursos: [] }))

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas).toEqual([
      'no se inspeccionó ningún recurso html o css del artefacto: no hay nada sobre lo que concluir',
    ])
  })
})

/* ---------------------------------------------------------------------------
 * FALLA CERRADA — el puerto LANZA, y el doble del test LANZA donde el real lanza.
 * ------------------------------------------------------------------------- */

/**
 * Modos de error (derivación de D-9/I-8, [I], igual que F-01, F-03 y F-04). ANTE LA DUDA: BUILD
 * ROTO, NUNCA BUILD VERDE.
 * 🔴 UNA PUERTA QUE SE TRAGA SU PROPIA EXCEPCIÓN Y DEVUELVE `[]` ES PEOR QUE NO TENER PUERTA,
 * PORQUE ADEMÁS DA CONFIANZA. ES LITERALMENTE CÓMO SE EVAPORARON LOS 3 BLOQUEANTES AA DEL STACK
 * BASE [V]. Si la puerta puede fallar en silencio, D-9 es falsa.
 * 🔴 AQUÍ SE PAGA LA DECISIÓN DEL PUERTO: F-05 NO LLEVA `existe*`. «Las tres puertas comparten un
 * patrón exacto» es FALSO: es 2 de 3 [V] — F-03 no tiene interfaz de puerto ni ningún `existe*`.
 * El `existe*` es CONDICIONAL, NO DOGMA: F-04 lo necesita porque su @s26 exige acusar QUÉ RUTA
 * falta; F-05 NO, porque el `catch` con el motivo YA ES INFORMATIVO Y CORRECTO. Sin escenario que
 * exija una línea distinta, `existe*` sería PRODUCCIÓN SIN TEST ROJO Y UN MUTANTE INMORTAL.
 * 🔴 EL DOBLE LANZA DONDE EL REAL LANZA: un doble que devolviera `[]` donde `readdirSync` lanza
 * testea una puerta que no existe.
 */
describe('la puerta falla cerrada si la lectura del artefacto LANZA (@s32)', () => {
  it('@s32 si leerArtefacto LANZA, como readdirSync cuando dist/ no existe, la puerta rompe con el motivo', () => {
    const resultado = ejecutarPuertaDeTerceros(
      peticion({
        leerArtefacto: () => {
          throw new Error("ENOENT: no such file or directory, scandir 'dist'")
        },
      }),
    )

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas).toHaveLength(1)
    expect(resultado.lineas[0]).toContain('la puerta de terceros no pudo completar la inspección')
    expect(resultado.lineas[0]).toContain("ENOENT: no such file or directory, scandir 'dist'")
  })
})

/**
 * EL SEGUNDO PUERTO, Y NO SOBRA. El puerto de F-05 son DOS campos sueltos (forma F-03), y LOS DOS
 * LANZAN. @s32 ancla el primero; éste ancla el segundo.
 * EL 1er Given ES CRÍTICO: EL ARTEFACTO ESTÁ LIMPIO. Sin `vite.config.ts` la puerta NO PUEDE saber
 * si `base` es `/` (@s27) → NO PUEDE CONCLUIR QUE EL BUILD ESTÁ LIMPIO, aunque el CSS lo parezca.
 * UN `catch` QUE SOLO ENVOLVIERA LA LECTURA DEL ARTEFACTO DARÍA VERDE AQUÍ, y eso es exactamente el
 * agujero: LA MITAD DE LA PUERTA DESACTIVADA EN SILENCIO.
 */
describe('la puerta falla cerrada si la lectura de vite.config.ts LANZA (@s33)', () => {
  it('@s33 con el artefacto LIMPIO, si leerConfigVite LANZA la puerta rompe con el motivo', () => {
    const resultado = ejecutarPuertaDeTerceros(
      peticion({
        recursos: artefactoConPares(paresEscritosAMano()),
        leerConfigVite: () => {
          throw new Error("ENOENT: no such file or directory, open 'vite.config.ts'")
        },
      }),
    )

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas).toHaveLength(1)
    expect(resultado.lineas[0]).toContain('la puerta de terceros no pudo completar la inspección')
    expect(resultado.lineas[0]).toContain("ENOENT: no such file or directory, open 'vite.config.ts'")
  })
})

/**
 * A1: ES LO QUE VALIDA EL ALCANCE `(html|css)` DEL ACCEPTANCE. El humilde filtra por extensión
 * `/\.(html|css)$/i` — exactamente como `ES_HTML = /\.html$/i` en `tools/puerta-cascaron.ts:23`,
 * cuyo comentario YA CITA EL RIESGO `.woff2` POR SU NOMBRE [V].
 * 🔴 EL FIXTURE TIENE CONTENIDO QUE HARÍA INFLUIR AL FILTRO —el `.js` lleva literales `https://`
 * REALES del `dist/` de hoy y el `.woff2` lleva ruido binario—, así que CON EL FILTRO ROTO ESTO
 * NACE ROJO. La clase (c) es la que hace el filtro OBLIGATORIO y no meramente higiénico: son DATOS
 * DE FEATURES `done` (el Facebook de F-02) que un `grep https?://` sobre el `.js` marcaría como
 * orígenes externos y ROMPERÍA EL BUILD DE UN REPO CORRECTO. Por eso la verificación lo prohíbe
 * expresamente: «NO grepear `https?://` sobre `dist/assets/*.js`: FALSOS POSITIVOS GARANTIZADOS» [V].
 * 🔴 LA FILA DEL `.woff2` ES A-27: F-05 es la PRIMERA feature que mete BINARIOS en `dist/`. Leer
 * binarios sería un FALSO POSITIVO ESPERANDO A OCURRIR (medido: 554.818 U+FFFD y 50.100 secuencias
 * candidatas al regex del teléfono en los 108 .woff/.woff2 reales). La puerta de F-05 SE PROTEGE
 * SOLA con este filtro.
 * ✅ A-27, decidido por el humano: F-05 NO TOCA `tools/puerta-placeholders.ts`. La deuda es de F-01
 * (feature `done`) y cerrarla exige un escenario nuevo en `features/puerta_placeholders.feature`.
 * @s40 ancla LA DECISIÓN en el fichero donde vive; aquí se asevera EL COMPORTAMIENTO.
 */
describe('el humilde SOLO lee .html y .css — ni binarios, ni el JS del bundle (@s34)', () => {
  it('@s34 con .js y .woff2 presentes en dist/, la puerta que solo recibe html y css sale VERDE', () => {
    // El humilde ya ha filtrado: la pura recibe SOLO los recursos que casan /\.(html|css)$/i. Los
    // literales del .js y el ruido binario del .woff2 NUNCA le llegan — y eso es lo que @s40 ancla
    // leyendo el fichero del humilde.
    const resultado = ejecutarPuertaDeTerceros(
      peticion({
        recursos: [
          {
            ubicacion: 'dist/index.html',
            tipo: 'html',
            contenido:
              '<html lang="es"><head><link rel="canonical" href="https://example.invalid/"></head><body><h1>Nails Lash Studio</h1></body></html>',
          },
          {
            ubicacion: 'dist/assets/index-DiwrgTda.css',
            tipo: 'css',
            contenido: cssDePares(paresEscritosAMano()),
          },
        ],
      }),
    )

    expect(resultado.codigoSalida).toBe(0)
    expect(resultado.lineas).toEqual([])
  })
})


/**
 * EL CAMINO FELIZ. SIN ÉL, UNA PUERTA QUE ROMPIERA SIEMPRE PASARÍA TODOS LOS ESCENARIOS NEGATIVOS.
 * 🔴 EL 2º Given ES EL ESCENARIO ENTERO, Y ES LO QUE HACE SATISFACIBLE A-23: el artefacto LIMPIO de
 * F-05 CONTIENE, EN EL HTML QUE LA PUERTA SÍ LEE, la canónica `https://example.invalid` (F-04) y el
 * `@context` `https://schema.org` (F-04) —las DOS únicas URL externas del `dist/index.html` de hoy
 * [V, §0 remedido]— Y EL BUILD ES VERDE.
 * CON EL ACCEPTANCE 2 VIEJO («CUALQUIER origen externo») ESTE ESCENARIO ERA IMPOSIBLE Y F-04 Y F-02
 * —LAS DOS `done`— SE ROMPÍAN. Es exactamente el escenario que la reescritura de A-23 vino a salvar.
 * 🔴 EL `<a href>` A FACEBOOK: hoy `dist/index.html` NO lo trae [V, medido] — lo añadirá F-12. Se
 * queda MARCADO como lo que es: este escenario garantiza que, cuando F-12 lo pinte, EL BUILD SIGA
 * VERDE. PREVENTIVO, NO DESCRIPTIVO.
 */
describe('el build de producción con el artefacto limpio termina con código de salida 0 (@s35)', () => {
  it('@s35 con la canónica y el JSON-LD de F-04 y el <a href> a Facebook de F-12, el build es VERDE', () => {
    const html =
      '<html lang="es"><head>' +
      '<link rel="canonical" href="https://example.invalid/">' +
      '<script type="application/ld+json">{"@context":"https://schema.org","@type":"BeautySalon","name":"Nails Lash Studio"}</script>' +
      '</head><body><h1>Nails Lash Studio</h1>' +
      '<a href="https://www.facebook.com/nailslashstudiorozas/">Facebook</a>' +
      '<a href="tel:+34625223366">625 22 33 66</a>' +
      '<script type="module" src="/assets/app-ti4oL6dR.js"></script>' +
      '</body></html>'

    const resultado = ejecutarPuertaDeTerceros(
      peticion({
        recursos: [
          { ubicacion: 'dist/index.html', tipo: 'html', contenido: html },
          {
            ubicacion: 'dist/assets/index-DiwrgTda.css',
            tipo: 'css',
            contenido: cssDePares(paresEscritosAMano()),
          },
        ],
      }),
    )

    expect(resultado.codigoSalida).toBe(0)
    expect(resultado.lineas).toEqual([])
  })
})

/**
 * Precedente F-01/@s14, F-03 y F-04/@s31: la función es PURA; el `exit != 0` vive en LA PUERTA, y la
 * puerta se engancha SOLO a `pnpm build` de producción, DESPUÉS de `vite-react-ssg build`.
 * LA PUERTA SEPARA «VER» DE «PUBLICAR»: en local, mientras se porta el diseño, tener un rato el
 * `<link rel="stylesheet" href="https://fonts.googleapis.com/…">` del prototipo ES LEGÍTIMO. LO QUE
 * ES IMPOSIBLE ES PUBLICARLO.
 */
describe('el build de desarrollo NO invoca la puerta de terceros (@s36)', () => {
  function scripts(): Record<string, string> {
    return (JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> })
      .scripts
  }

  it('@s36 el script "build" invoca la puerta de terceros DESPUÉS de vite-react-ssg build', () => {
    const build = scripts().build

    expect(build).toContain('tools/puerta-terceros.ts')
    expect(build.indexOf('vite-react-ssg build')).toBeLessThan(
      build.indexOf('tools/puerta-terceros.ts'),
    )
  })

  it.each([['dev'], ['dev:ssr']])('@s36 el script "%s" NO invoca la puerta de terceros', (guion) => {
    expect(scripts()[guion]).not.toContain('puerta-terceros')
  })
})

/**
 * 🔴 EL [I] QUE EL CONTRATO MANDA MEDIR EN EL PRIMER TEST, Y SE HA MEDIDO — CONTRA UN BUILD REAL,
 * NO SUPUESTO. El resultado: **VITE SÍ QUITA LAS COMILLAS**. Forma REAL de `dist/assets/*.css`
 * [V, medido hoy sobre `pnpm build`]:
 *     @font-face{font-family:Manrope;font-style:normal;font-display:swap;font-weight:400;
 *                src:url(/assets/manrope-latin-400-normal-PaqtzbVb.woff2) format("woff2"),…}
 * y `font-family:Gilda Display` — SIN comillas y CON el espacio. El `@fontsource` de origen declara
 * `font-family: 'Manrope';` CON comillas: LAS DOS FORMAS SON REALES Y LAS DOS SE MIDEN.
 * → LA COMPARACIÓN ES SOBRE EL NOMBRE DESTOKENIZADO Y SIN COMILLAS. `'Gilda Display'` LLEVA UN
 *   ESPACIO, y por eso es la familia elegida: es donde una destokenización ingenua (partir por
 *   espacios) SE ROMPE. EL [I] ERA UN RIESGO REAL, NO TEÓRICO.
 */
describe('el nombre de familia se compara DESTOKENIZADO y SIN COMILLAS, como sale del CSS minificado (@s37)', () => {
  /** Declara el @font-face de `familia` con la forma de comillas pedida; los otros 5, normales. */
  function cssConDeclaracion(familia: string, peso: number, declaracion: string): string {
    const otros = paresEscritosAMano().filter(
      ([nombre, valor]) => !(nombre === familia && valor === peso),
    )

    return (
      `@font-face { font-family: ${declaracion}; font-style: normal; font-display: swap; font-weight: ${String(peso)}; src: url(/assets/x-Bx.woff2) format('woff2'); }` +
      cssDePares(otros)
    )
  }

  it.each([
    ['Gilda Display', 400, '"Gilda Display"', 'comillas dobles: la forma de @fontsource [V]'],
    ['Gilda Display', 400, "'Gilda Display'", 'comillas simples'],
    ['Gilda Display', 400, 'Gilda Display', 'SIN comillas: es lo que Vite emite al minificar [V]'],
    ['Manrope', 400, '"Manrope"', 'con comillas: la forma de @fontsource [V]'],
  ])(
    '@s37 el @font-face de %s (%i) declarado como %s se reconoce (%s)',
    (familia, peso, declaracion) => {
      const resultado = ejecutarPuertaDeTerceros(
        peticion({
          recursos: [
            {
              ubicacion: 'dist/assets/x.css',
              tipo: 'css',
              contenido: cssConDeclaracion(familia, peso, declaracion),
            },
          ],
        }),
      )

      expect(resultado.codigoSalida).toBe(0)
      expect(resultado.lineas).toEqual([])
      expect(resultado.lineas).not.toContain(`sobra el par ("${familia}", ${String(peso)})`)
      expect(resultado.lineas).not.toContain(`falta el par ("${familia}", ${String(peso)})`)
    },
  )

  /**
   * LA FORMA REAL DEL ARTEFACTO, MEDIDA SOBRE `pnpm build` Y ESCRITA A MANO AQUÍ: minificada, sin
   * comillas, sin espacio antes del `{` ni después de los `:`. Si Vite cambiara de minificador y
   * esta forma dejara de reconocerse, LA GUARDA DE @s29 SE CAERÍA EN EL BUILD REAL CON LA SUITE
   * VERDE. Es el mismo eje que @s37 mide, con el byte exacto del `dist/` de hoy.
   */
  it('@s37 el CSS MINIFICADO REAL de dist/ (sin comillas, sin espacios) se reconoce igual', () => {
    const minificado =
      '@font-face{font-family:Manrope;font-style:normal;font-display:swap;font-weight:400;src:url(/assets/manrope-latin-400-normal-PaqtzbVb.woff2) format("woff2"),url(/assets/manrope-latin-400-normal-8tf8FM3T.woff) format("woff")}' +
      '@font-face{font-family:Manrope;font-style:normal;font-display:swap;font-weight:500;src:url(/assets/manrope-latin-500-normal-BYYD-dBL.woff2) format("woff2")}' +
      '@font-face{font-family:Manrope;font-style:normal;font-display:swap;font-weight:600;src:url(/assets/manrope-latin-600-normal-4f0koTD-.woff2) format("woff2")}' +
      '@font-face{font-family:Manrope;font-style:normal;font-display:swap;font-weight:700;src:url(/assets/manrope-latin-700-normal-BZp_XxE4.woff2) format("woff2")}' +
      '@font-face{font-family:Gilda Display;font-style:normal;font-display:swap;font-weight:400;src:url(/assets/gilda-display-latin-400-normal-gyfWcafy.woff2) format("woff2")}' +
      '@font-face{font-family:Great Vibes;font-style:normal;font-display:swap;font-weight:400;src:url(/assets/great-vibes-latin-400-normal-q5-78SH_.woff2) format("woff2")}'

    const resultado = ejecutarPuertaDeTerceros(
      peticion({
        recursos: [
          { ubicacion: 'dist/assets/index-DiwrgTda.css', tipo: 'css', contenido: minificado },
        ],
      }),
    )

    expect(resultado.codigoSalida).toBe(0)
    expect(resultado.lineas).toEqual([])
  })
})


/* ---------------------------------------------------------------------------
 * LAS DOS CONSTANTES DE PRODUCCIÓN — LO QUE NINGÚN ESCENARIO ASEVERABA.
 * 🔴 Los 34 pasos que mencionan la allowlist y la lista de pares las INYECTAN desde el test: sin
 *    estos escenarios, los valores REALES que corren en el build no los fija nadie. «Una allowlist
 *    que nadie puede rellenar no es una allowlist vacía: es una constante sin test» (@s20).
 * ------------------------------------------------------------------------- */

/**
 * 🔴🔴 SIN ESTE ESCENARIO LA FEATURE NO CIERRA. ES EL ÚNICO QUE MATA A `ArrayDeclaration` SOBRE LA
 * CONSTANTE DE PRODUCCIÓN.
 * EL MUTANTE: `['a','b']` → `[]` [V: `array-declaration-mutator.js:7`, `isArrayExpression()`].
 * Aplicado a `PARES_DE_FUENTE_ESPERADOS`, LA GUARDA DE @s29 SE DESACTIVA SOLA: con la lista vacía,
 * «el conjunto de @font-face coincide con el esperado» se satisface VACUAMENTE. @s30 NO lo mata
 * —inyecta su propio `[]` y jamás evalúa la constante—, y con `break: 100` el mutante sería
 * INMORTAL: la puerta de mutación rompe y NINGÚN escenario puede arreglarla.
 * 🔴 ESTO NO ES TAUTOLOGÍA — ES LO CONTRARIO: se ancla contra un LITERAL ESCRITO A MANO, NO contra
 * el símbolo importado. Importar la constante PARA COMPARARLA CONSIGO MISMA sería tautología;
 * importarla PARA FIJARLA contra seis pares escritos a mano es lo que impide que alguien la vacíe
 * sin que nada se ponga rojo. PRECEDENTE LITERAL, YA DESPLEGADO Y VERDE EN F-04:
 * `puerta-cascaron.test.ts:901` → `expect([...RUTAS_ESPERADAS]).toEqual(['/'])`.
 * ✅ A-28 CERRADA: SOLO `latin`. ESTA LISTA NO CAMBIA — los 6 pares se quedan, y este literal es el
 * DEFINITIVO. Si algún día entra `latin-ext` —solo cuando exista un nombre REAL que lo exija, y CON
 * SU PROPIO ESCENARIO— esta lista cambiaría y este escenario se actualizaría con ella. Que es
 * exactamente la gracia de anclarla: EL CAMBIO ES VISIBLE Y HAY QUE VENIR AQUÍ A ESCRIBIRLO.
 */
describe('PARES_DE_FUENTE_ESPERADOS está ANCLADA contra un literal escrito a mano (@s38)', () => {
  it('@s38 los pares de fuente del diseño real son exactamente los 6 medidos sobre el prototipo', () => {
    expect(PARES_DE_FUENTE_ESPERADOS.map((par) => [...par])).toEqual([
      ['Manrope', 400],
      ['Manrope', 500],
      ['Manrope', 600],
      ['Manrope', 700],
      ['Gilda Display', 400],
      ['Great Vibes', 400],
    ])
  })

  it('@s38 PARES_DE_FUENTE_ESPERADOS no está vacía: si lo estuviera, la guarda de @s29 se desactivaría', () => {
    expect(PARES_DE_FUENTE_ESPERADOS.length).toBeGreaterThan(0)
  })
})

/**
 * 🔴🔴 ERA EL HUECO SOBRE EL INVARIANTE TITULAR DE LA FEATURE. NINGÚN escenario aseveraba que la
 * allowlist de PRODUCCIÓN fuera `[]`: los 34 pasos la INYECTAN desde el test con un literal en el
 * `When`. Como el contrato exige parámetro SIN `default`, el `[]` de producción SOLO existe en
 * `tools/puerta-terceros.ts` — que va sin fichero de test propio y fuera de `mutate`.
 * 🔴 CONSECUENCIA REAL, Y ES GRAVE: un `["fonts.googleapis.com"]` en el humilde dejaba los 40
 * escenarios VERDES y el build VERDE, y EMBARCABA GOOGLE FONTS — el acceptance 3 derrotado con la
 * puerta en verde, y el acceptance 1 («con allowlist vacía») SIN UN SOLO TEST.
 * MECANISMO — el mismo de @s40 y el único que el repo tiene [V, §8, literal: «cuando una DECISIÓN
 * vive en el humilde, se ancla desde un test que LEE EL FICHERO»]: forma `diferidos.test.ts:89-96`,
 * `readFileSync` + aserción CONTRA LITERAL ESCRITO A MANO + la referencia escrita en el humilde.
 * ⚠️ NO CONTRADICE A @s20: @s20 exige que la allowlist PUEDA ser no vacía (única necesidad del
 * diseño; sin ella `FilterRemoval` es inmatable). @s39 exige que EN PRODUCCIÓN SEA `[]`. Son LA
 * CAPACIDAD y EL VALOR: dos cosas distintas, y las dos hacen falta.
 */
describe('el humilde pasa la allowlist VACÍA, y lo declara por escrito (@s39)', () => {
  function humilde(): string {
    return readFileSync('tools/puerta-terceros.ts', 'utf8')
  }

  it('@s39 el humilde pasa a la puerta una allowlist exactamente vacía', () => {
    expect(humilde()).toContain('allowlist: [],')
  })

  /**
   * «No declara ningún origen permitido» se asevera sobre LA ALLOWLIST, no sobre el texto del
   * fichero: un `not.toContain('fonts.googleapis.com')` sobre todo el humilde sería MÁS FUERTE QUE
   * EL CONTRATO y PROHIBIRÍA EL COMENTARIO QUE @s39 EXIGE — el que nombra el peligro para que quien
   * rellene la allowlist tenga que leer por qué estaba vacía. Lo que importa es que el literal que
   * viaja a la puerta esté VACÍO.
   */
  it('@s39 el humilde no declara ningún origen permitido: el literal de la allowlist está vacío', () => {
    const allowlist = /allowlist: \[([^\]]*)\]/.exec(humilde())

    expect(allowlist).not.toBeNull()
    expect(allowlist?.[1]).toBe('')
  })

  it('@s39 el humilde declara por escrito la referencia A-23: quien la rellene tiene que leer por qué estaba vacía', () => {
    expect(humilde()).toContain('A-23')
  })
})

/**
 * 🔴 ES LA OTRA MITAD DE @s34, Y SIN ELLA LA DECISIÓN NO LA ASEVERA NADIE. @s34 mide el
 * COMPORTAMIENTO; @s40 ancla LA DECISIÓN donde vive. El filtro `/\.(html|css)$/i` vive SOLO en el
 * humilde, que está FUERA de `mutate` y SIN fichero de test propio: NINGÚN test contra la función
 * pura lo toca jamás — la pura recibe los recursos YA FILTRADOS.
 * ✅ A-27 CERRADA EL 2026-07-17, Y SE CERRÓ ASÍ: LA DEUDA SE QUEDA DECLARADA. Este escenario ancla
 * EL FILTRO DE F-05 —que es lo que F-05 SÍ hace— y NO la deuda de `tools/puerta-placeholders.ts`,
 * que es de F-01 (feature `done`) y exige un escenario nuevo en `features/puerta_placeholders.feature`.
 * EL HUMANO DECIDIÓ NO REABRIR F-01 HOY: la deuda sigue viva y declarada, y F-05 no la toca.
 */
describe('el filtro de extensión del humilde está ANCLADO en el fichero donde vive (@s40)', () => {
  function humilde(): string {
    return readFileSync('tools/puerta-terceros.ts', 'utf8')
  }

  it('@s40 el humilde declara el filtro de extensión /\\.(html|css)$/i', () => {
    expect(humilde()).toContain('/\\.(html|css)$/i')
  })

  it('@s40 el humilde no pasa a la puerta ningún fichero que no case ese filtro', () => {
    // El `filter` sobre las entradas del directorio es lo único que decide qué llega a la pura.
    expect(humilde()).toContain('ES_HTML_O_CSS.test(entrada.name)')
    expect(humilde()).toContain('entrada.isFile() && ES_HTML_O_CSS.test(entrada.name)')
  })

  it('@s40 el humilde declara por escrito la referencia A-27', () => {
    expect(humilde()).toContain('A-27')
  })

  /**
   * A-27, LA OTRA MITAD: F-05 NO TOCA la puerta de placeholders. Si alguien «arregla de paso» el
   * hueco de F-01 desde F-05, este test se lo recuerda: esa deuda es de OTRA feature y exige un
   * escenario nuevo en `features/puerta_placeholders.feature`. Hacerlo aquí sería producción sin
   * test rojo — violación de la Ley 1.
   */
  it('@s40 F-05 NO toca el humilde de F-01: la deuda de binarios sigue declarada, y es de otra feature', () => {
    expect(readFileSync('tools/puerta-placeholders.ts', 'utf8')).not.toContain('html|css')
  })
})
