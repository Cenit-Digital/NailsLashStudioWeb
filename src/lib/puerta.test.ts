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

function sistemaDeFicherosFalso(contenidos: Record<string, string>): SistemaDeFicheros {
  const esRaiz = (directorio: string) => directorio === '.' || directorio === ''

  return {
    listarFicheros: (directorio) =>
      Object.keys(contenidos).filter(
        (ruta) => esRaiz(directorio) || ruta.startsWith(`${directorio}/`),
      ),
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
  it('@s22 la puerta falla cerrada si ella misma revienta', () => {
    // Una puerta que se traga su excepción y devuelve [] es PEOR que no tener puerta,
    // porque además da confianza. Si puede fallar en silencio, D-9 es falsa.
    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [],
      ficheros: {
        listarFicheros: () => ['dist/index.html'],
        leer: () => {
          throw new Error('EISDIR: illegal operation on a directory, read')
        },
      },
    })

    const salida = resultado.lineas.join('\n')

    expect(resultado.codigoSalida).not.toBe(0)
    expect(salida).toContain('no pudo completar la inspección')
    // Y no se felicita a sí misma: el modo de fallo que este escenario prohíbe es
    // reportar «0 violaciones» cuando lo que ha pasado es que no ha podido mirar.
    expect(resultado.lineas).not.toEqual([])
    expect(salida).not.toMatch(/sin violaciones|no hay violaciones|limpio/i)
  })
})
