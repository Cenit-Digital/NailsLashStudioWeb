import { readFileSync } from 'node:fs'

import { ejecutarPuerta, type SistemaDeFicheros } from './puerta'

// Contrato: features/puerta_placeholders.feature — la capa PUERTA (@s12-@s19, @s22).
//
// ANTI-TAUTOLOGÍA (regla del stack): los patrones prohibidos se escriben aquí A MANO.
// Importar PATRONES_PROHIBIDOS convertiría estos tests en un espejo del código que
// deberían vigilar.
//
// El doble del sistema de ficheros es FIEL: listar un directorio devuelve todo lo que
// cuelga de él, recursivamente, igual que el real. No sabe nada de "dist": QUÉ directorio
// se mira sigue siendo una decisión de producción, y por eso @s18/@s19 prueban algo.
//
// La raíz ("." o "") devuelve TODO. Sin este caso el doble mentía: apuntar el escaneo a la
// raíz del repositorio devolvía la lista vacía, y @s18/@s19 —los dos escenarios que existen
// justo para fijar la raíz— pasaban por vacuidad. Verificado: con este doble, mover la raíz
// a "." los pone rojos.
interface PaqueteNpm {
  readonly scripts: Record<string, string>
}

const NOMBRE_DE_LA_PUERTA = 'puerta-placeholders'
const GUION_DE_LA_PUERTA = `tools/${NOMBRE_DE_LA_PUERTA}.ts`

function sistemaDeFicherosFalso(
  contenidos: Record<string, string>,
  directoriosVacios: readonly string[] = [],
): SistemaDeFicheros {
  const esRaiz = (directorio: string) => directorio === '.' || directorio === ''

  const contenidoDe = (directorio: string) =>
    Object.keys(contenidos).filter(
      (ruta) => esRaiz(directorio) || ruta.startsWith(`${directorio}/`),
    )

  // Un directorio existe si cuelga algo de él o si se declara vacío a propósito: un
  // `dist/` vacío es un estado real del disco (@s21) y el doble tiene que saber decirlo.
  const existe = (directorio: string) =>
    esRaiz(directorio) || directoriosVacios.includes(directorio) || contenidoDe(directorio).length > 0

  return {
    existeDirectorio: existe,
    listarFicheros: (directorio) => {
      // Fiel al real: `readdirSync` sobre un directorio inexistente LANZA ENOENT, no
      // devuelve []. Un doble que devolviera [] haría pasar @s20 con producción rota.
      if (!existe(directorio)) {
        throw new Error(`ENOENT: no such file or directory, scandir '${directorio}'`)
      }

      return contenidoDe(directorio)
    },
    leer: (ruta) => contenidos[ruta],
  }
}

describe('la puerta — producción falla, desarrollo no', () => {
  it('@s12 el build de producción con una violación termina con código distinto de 0', () => {
    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [],
      ficheros: sistemaDeFicherosFalso({
        'dist/index.html': '<p>Escríbenos a hola@nailslashstudio.com</p>',
      }),
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('hola@nailslashstudio.com')
  })

  it('@s13 el build de producción con un artefacto limpio termina con código de salida 0', () => {
    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [
        { ubicacion: 'nap.telefono', valor: '+34 625 22 33 66', esPlaceholder: false },
        {
          ubicacion: 'nap.direccion',
          valor: 'C.C. El Zoco, Av. de Atenas 75, Local 41, 28232 Las Rozas de Madrid',
          esPlaceholder: false,
        },
      ],
      ficheros: sistemaDeFicherosFalso({
        'dist/index.html':
          '<p>+34 625 22 33 66</p>' +
          '<p>C.C. El Zoco, Av. de Atenas 75, Local 41, 28232 Las Rozas de Madrid</p>',
      }),
    })

    expect(resultado.codigoSalida).toBe(0)
    expect(resultado.lineas).toEqual([])
  })

  it('@s14 el build de desarrollo con datos placeholder NO falla y conserva la imagen', () => {
    // D-8: en local las fotos IA y los datos placeholder son legítimos; son para ver el
    // diseño. La puerta separa «ver» de «publicar».
    const artefacto = {
      'dist/index.html': '<p>IMAGEN TEMPORAL</p><img src="/assets/ph-woman0.png">',
    }

    const resultado = ejecutarPuerta({
      modo: 'desarrollo',
      registros: [{ ubicacion: 'equipo.0.foto', valor: 'ph-woman0.png', esPlaceholder: true }],
      ficheros: sistemaDeFicherosFalso(artefacto),
    })

    expect(resultado.codigoSalida).toBe(0)
    expect(artefacto['dist/index.html']).toContain('ph-woman0.png')
  })

  it('@s15 el informe acusa: una línea por violación con patrón o flag, ubicación y valor', () => {
    // La puerta debe acusar, no gruñir: «hay un placeholder» sin decir cuál obliga a
    // buscarlo a mano.
    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [{ ubicacion: 'legal.nif', valor: 'pendiente', esPlaceholder: true }],
      ficheros: sistemaDeFicherosFalso({
        'dist/index.html': '<p>Calle de la Belleza 24</p>',
      }),
    })

    expect(resultado.lineas).toHaveLength(2)

    const [lineaDelFlag, lineaDelPatron] = resultado.lineas

    expect(lineaDelFlag).toContain('esPlaceholder')
    expect(lineaDelFlag).toContain('legal.nif')
    expect(lineaDelFlag).toContain('pendiente')

    expect(lineaDelPatron).toContain('Calle de la Belleza')
    expect(lineaDelPatron).toContain('dist/index.html')

    expect(resultado.codigoSalida).not.toBe(0)
  })
})

describe('la puerta — lo que esquiva a cada vía por separado', () => {
  it('@s16 un literal escrito a mano en la plantilla, ausente de los datos, lo caza el artefacto', () => {
    // Los datos cazan lo declarado; el artefacto caza lo que esquivó la capa de datos (H-2).
    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [{ ubicacion: 'nap.telefono', valor: '625 22 33 66', esPlaceholder: false }],
      ficheros: sistemaDeFicherosFalso({
        'dist/index.html': '<p>Llámanos al +34 600 123 456</p>',
      }),
    })

    expect(resultado.lineas).toEqual(['patrón "600123456" en dist/index.html: "+34 600 123 456"'])
    expect(resultado.codigoSalida).not.toBe(0)
  })

  it('@s17 una imagen placeholder inlinada como data: URI la caza la vía por flag', () => {
    // El empaquetador inlina los assets pequeños y el nombre del fichero desaparece:
    // buscar por nombre no basta cuando el fichero deja de tener nombre. El patrón es la
    // red; el flag es la puerta. Este escenario debe pasar CON el inlining activado.
    const artefactoInlinado =
      '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk">'

    // El Given, aseverado: si la cadena apareciera, cazaría el patrón y este test no
    // probaría que el flag es la garantía.
    expect(artefactoInlinado).not.toContain('ph-woman')

    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [{ ubicacion: 'equipo.0.foto', valor: 'ph-woman0.png', esPlaceholder: true }],
      ficheros: sistemaDeFicherosFalso({ 'dist/index.html': artefactoInlinado }),
    })

    expect(resultado.lineas).toContain('flag esPlaceholder en equipo.0.foto: "ph-woman0.png"')
    expect(resultado.codigoSalida).not.toBe(0)
  })

  // El módulo de la puerta declara los 6 patrones como literales. Se escriben aquí A MANO
  // (anti-tautología): este doble es un retrato del módulo, no un import suyo.
  const moduloDeLaPuerta = [
    "export const PATRONES_PROHIBIDOS = [",
    "  'IMAGEN TEMPORAL',",
    "  'Plantilla de demostración',",
    "  '600123456',",
    "  'hola@nailslashstudio.com',",
    "  'Calle de la Belleza',",
    "  'ph-woman',",
    '] as const',
  ].join('\n')

  it('@s18 el escaneo excluye el propio código de la puerta', () => {
    // Si no, la puerta fallaría siempre por su propia existencia. No hay lista de
    // exclusión: el módulo vive en src/ y el escaneo mira el artefacto (dist/).
    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [],
      ficheros: sistemaDeFicherosFalso({
        'src/lib/placeholders.ts': moduloDeLaPuerta,
        'dist/index.html': '<h1>Nails Lash Studio</h1>',
      }),
    })

    expect(resultado.lineas).toEqual([])
    expect(resultado.codigoSalida).toBe(0)
  })

  it('@s18 la exclusión del módulo no es un coladero: en el artefacto sí se caza', () => {
    // «Excluir todo lo que se parezca al módulo» abriría un agujero: un fichero empaquetado
    // con el nombre del módulo es artefacto desplegado y se inspecciona como cualquier otro.
    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [],
      ficheros: sistemaDeFicherosFalso({
        'dist/assets/placeholders-BYbDMLiU.js': 'const t="Calle de la Belleza 24"',
        // Un artefacto de producción real SIEMPRE trae su HTML de entrada (@s26): sin él,
        // este doble describía un dist/ que no puede existir. El Given dice «un artefacto
        // de producción limpio», y añadirlo lo hace más fiel, no más permisivo.
        'dist/index.html': '<h1>Nails Lash Studio</h1>',
      }),
    })

    expect(resultado.lineas).toEqual([
      'patrón "Calle de la Belleza" en dist/assets/placeholders-BYbDMLiU.js: "Calle de la Belleza"',
    ])
    expect(resultado.codigoSalida).not.toBe(0)
  })

  it('@s19 la puerta escanea el artefacto de producción, no el repositorio', () => {
    // "project-spec.md" cita los patrones legítimamente y NO se despliega: no es un falso
    // positivo, es que no se mira.
    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [],
      ficheros: sistemaDeFicherosFalso({
        'project-spec.md': 'La dirección del prototipo era "Calle de la Belleza 24" y las '
          + 'fotos IA son "ph-woman0.png". Ambos son placeholder y aquí se citan a propósito.',
        'dist/index.html': '<h1>Nails Lash Studio</h1>',
      }),
    })

    expect(resultado.lineas).toEqual([])
    expect(resultado.codigoSalida).toBe(0)
  })
})

describe('la puerta — enganchada SOLO al build de producción', () => {
  // La puerta que nadie invoca no es una puerta. Estos dos tests son lo único que verifica
  // el «enganchado SOLO al build de producción» de la cabecera del contrato: sin ellos,
  // ejecutarPuerta sería una biblioteca que no llama nadie y el build pasaría siempre.
  const guiones = (JSON.parse(readFileSync('package.json', 'utf8')) as PaqueteNpm).scripts

  it('@s12 el build de producción invoca la puerta', () => {
    expect(guiones.build).toContain(GUION_DE_LA_PUERTA)
  })

  it('@s14 el build de desarrollo NO invoca la puerta', () => {
    // D-8: en local las fotos IA y los datos placeholder son legítimos. La puerta separa
    // «ver» de «publicar», y para eso no puede estar enganchada al build de desarrollo.
    expect(guiones.dev).not.toContain(NOMBRE_DE_LA_PUERTA)
    expect(guiones['dev:ssr']).not.toContain(NOMBRE_DE_LA_PUERTA)
  })
})

describe('la puerta — falla cerrada', () => {
  it('@s20 la puerta falla si el directorio del artefacto de producción no existe', () => {
    // Un dist/ que no existe no es un dist/ limpio: es que el build no llegó a producir
    // nada. Falla cerrada: ante la duda, build roto, nunca build verde.
    const artefactoInexistente = sistemaDeFicherosFalso({})

    // El Given, aseverado — y aquí está el filo del escenario: `readdirSync` sobre un
    // directorio inexistente LANZA ENOENT. Si el doble devolviera [] tan tranquilo, este
    // test pasaría mientras producción se va por el camino de @s22. El doble mentiría.
    expect(() => artefactoInexistente.listarFicheros('dist')).toThrow()

    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [],
      ficheros: artefactoInexistente,
    })

    const salida = resultado.lineas.join('\n')

    expect(resultado.codigoSalida).not.toBe(0)
    expect(salida).toContain('no había nada que inspeccionar')
    // Y no se felicita a sí misma. «0 violaciones sobre 0 ficheros» no es estar
    // protegido: es no haber mirado.
    expect(resultado.lineas).not.toEqual([])
    expect(salida).not.toMatch(/sin violaciones|no hay violaciones|limpio/i)
  })

  it('@s21 la puerta falla si no ha inspeccionado ni un fichero', () => {
    // Verde por vacuidad: 0 violaciones sobre 0 ficheros no es estar protegido, es no
    // haber mirado.
    const artefactoVacio = sistemaDeFicherosFalso({}, ['dist'])

    // El Given, aseverado: el directorio EXISTE —si no, esto sería @s20 y este test no
    // probaría lo suyo— y está vacío.
    expect(artefactoVacio.existeDirectorio('dist')).toBe(true)
    expect(artefactoVacio.listarFicheros('dist')).toEqual([])

    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [],
      ficheros: artefactoVacio,
    })

    const salida = resultado.lineas.join('\n')

    // El contrato NO fija cuál de las dos razones se informa (este estado incumple
    // también la regla de @s26): fija que el build rompe y que NO se reporta verde.
    // Aseverar aquí un mensaje concreto ataría la implementación sin ganar nada.
    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas).not.toEqual([])
    expect(salida).not.toMatch(/sin violaciones|no hay violaciones|limpio/i)
  })

  it('@s26 la puerta falla si no ha inspeccionado el HTML de entrada del artefacto', () => {
    // Haber inspeccionado «algo» no basta: un dist/ con hojas de estilo y sin HTML
    // devuelve 0 violaciones y pasaría «protegido». En un sitio SSG el HTML de entrada
    // existe SIEMPRE; si falta, algo ha ido muy mal y el build debe romper en vez de
    // felicitarnos.
    const artefactoSinHtml = sistemaDeFicherosFalso({
      'dist/assets/base-DxQ1a2we.css': 'body{margin:0}',
      'dist/assets/tipografia-B7f3kd9s.css': "@font-face{font-family:'Cormorant Garamond'}",
      'dist/assets/tema-C9k2mn4p.css': ':root{--tinta:#1a1a1a}',
    })

    // El Given, aseverado: 3 hojas de estilo inspeccionables y ningún "dist/index.html".
    // Sin esto el test podría pasar por el guarda de @s21 (0 ficheros) y no probaría lo
    // suyo: que inspeccionar «algo» no basta.
    expect(artefactoSinHtml.listarFicheros('dist')).toHaveLength(3)
    expect(artefactoSinHtml.listarFicheros('dist')).not.toContain('dist/index.html')

    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [],
      ficheros: artefactoSinHtml,
    })

    const salida = resultado.lineas.join('\n')

    expect(resultado.codigoSalida).not.toBe(0)
    expect(salida).toContain('no se inspeccionó')
    expect(salida).toContain('dist/index.html')
    expect(salida).not.toMatch(/sin violaciones|no hay violaciones|limpio/i)
  })

  it('@s22 la puerta falla cerrada si ella misma revienta', () => {
    // Una puerta que se traga su excepción y devuelve [] es PEOR que no tener puerta,
    // porque además da confianza. Si puede fallar en silencio, D-9 es falsa.
    //
    // La causa concreta del reventón se nombra una sola vez y se usa en el Given (lo que
    // se lanza) y en el Then (lo que la salida debe surfacer): así no hay literal mágico
    // duplicado y el Then queda anclado a la excepción exacta que provoca el Given.
    const MOTIVO_DEL_REVENTON = 'EISDIR: illegal operation on a directory, read'

    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [],
      ficheros: {
        existeDirectorio: () => true,
        listarFicheros: () => ['dist/index.html'],
        leer: () => {
          throw new Error(MOTIVO_DEL_REVENTON)
        },
      },
    })

    const salida = resultado.lineas.join('\n')

    expect(resultado.codigoSalida).not.toBe(0)
    expect(salida).toContain('no pudo completar la inspección')
    // Acusar, no gruñir (@s15), también cuando la que revienta es la propia puerta: no
    // basta con decir «no pude», hay que decir POR QUÉ. Una puerta que oculta la causa
    // concreta obliga a buscarla a mano, que es justo lo que la feature combate (D-9).
    // Si el cuerpo de motivoDelReventon se vaciara, la causa se perdería en «undefined» y
    // la línea seguiría gruñendo «no pudo completar la inspección» sin acusar el porqué.
    expect(salida).toContain(MOTIVO_DEL_REVENTON)
    // Y no se felicita a sí misma: el modo de fallo que este escenario prohíbe es
    // reportar «0 violaciones» cuando lo que ha pasado es que no ha podido mirar.
    expect(resultado.lineas).not.toEqual([])
    expect(salida).not.toMatch(/sin violaciones|no hay violaciones|limpio/i)
  })
})
