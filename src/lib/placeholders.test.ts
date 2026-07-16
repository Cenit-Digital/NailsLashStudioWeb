import { detectarPlaceholders, type RegistroDatos } from './placeholders'

// Contrato: features/puerta_placeholders.feature
//
// ANTI-TAUTOLOGÍA (regla del stack): los patrones prohibidos se escriben aquí A MANO.
// Importar la lista de producción convertiría estos tests en un espejo: mutar la lista
// no rompería nada y el test no vigilaría nada.

describe('detectarPlaceholders — la vía por flag', () => {
  it('@s1 un registro marcado esPlaceholder produce una violación con vía, ubicación y valor', () => {
    const violaciones = detectarPlaceholders({
      registros: [
        { ubicacion: 'legal.razonSocial', valor: 'pendiente de confirmar', esPlaceholder: true },
      ],
    })

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0]).toEqual({
      via: 'flag',
      motivo: 'marcado',
      ubicacion: 'legal.razonSocial',
      valor: 'pendiente de confirmar',
    })
  })

  it('@s2 un registro con el flag en false y contenido real no produce violación', () => {
    const violaciones = detectarPlaceholders({
      registros: [{ ubicacion: 'nap.telefono', valor: '625 22 33 66', esPlaceholder: false }],
    })

    expect(violaciones).toEqual([])
  })

  it('@s24 un registro cargado desde JSON que no declara el flag es violación, y declara que FALTA', () => {
    // Desde JSON de verdad: el tipo exige el flag en compilación, pero a los datos que
    // llegan de un .json el tipo no los protege. Omitir la marca no puede significar «es real».
    const registros = JSON.parse(
      '[{"ubicacion":"servicios.0.nombre","valor":"Manicura semipermanente"}]',
    ) as RegistroDatos[]

    const violaciones = detectarPlaceholders({ registros })

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0]).toEqual({
      via: 'flag',
      motivo: 'sin_declarar',
      ubicacion: 'servicios.0.nombre',
      valor: 'Manicura semipermanente',
    })
  })
})

describe('detectarPlaceholders — la vía por patrón', () => {
  it.each([
    ['IMAGEN TEMPORAL', 'IMAGEN TEMPORAL'],
    ['Plantilla de demostración', 'Plantilla de demostración — no publicar'],
    ['600123456', '600123456'],
    ['hola@nailslashstudio.com', 'Escríbenos a hola@nailslashstudio.com'],
    ['Calle de la Belleza', 'Calle de la Belleza 24, 28010 Madrid'],
    ['ph-woman', '/assets/ph-woman0.png'],
  ])('@s4 el patrón prohibido "%s" produce una violación', (patron, contenido) => {
    const violaciones = detectarPlaceholders({
      ficheros: [{ ubicacion: 'dist/index.html', contenido }],
    })

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0]).toMatchObject({ via: 'patron', patron })
  })

  it.each([
    ['600123456'],
    ['+34 600 123 456'],
    ['600 123 456'],
    ['600-123-456'],
    ['+34600123456'],
    ['0034 600 123 456'],
  ])('@s5 el teléfono inventado escrito "%s" no escapa', (contenido) => {
    const violaciones = detectarPlaceholders({
      ficheros: [{ ubicacion: 'dist/index.html', contenido }],
    })

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0]).toEqual({
      via: 'patron',
      patron: '600123456',
      ubicacion: 'dist/index.html',
      valor: contenido,
    })
  })

  it('@s6 el teléfono real escrito con espacios no dispara el patrón del inventado', () => {
    const violaciones = detectarPlaceholders({
      ficheros: [{ ubicacion: 'dist/index.html', contenido: '+34 625 22 33 66' }],
    })

    expect(violaciones).toEqual([])
  })

  it.each([
    ['IMAGEN TEMPORAL', 'imagen temporal', 'imagen temporal'],
    ['IMAGEN TEMPORAL', 'Imagen Temporal', 'Imagen Temporal'],
    ['Plantilla de demostración', 'plantilla de demostracion', 'plantilla de demostracion'],
    ['Plantilla de demostración', 'PLANTILLA DE DEMOSTRACIÓN', 'PLANTILLA DE DEMOSTRACIÓN'],
    ['Calle de la Belleza', 'calle de la belleza 24, 28010 Madrid', 'calle de la belleza'],
    ['hola@nailslashstudio.com', 'HOLA@NAILSLASHSTUDIO.COM', 'HOLA@NAILSLASHSTUDIO.COM'],
    ['ph-woman', '/assets/PH-Woman0.PNG', 'PH-Woman'],
  ])('@s7 el patrón "%s" se caza en "%s" (otra caja, sin acentos)', (patron, contenido, valor) => {
    const violaciones = detectarPlaceholders({
      ficheros: [{ ubicacion: 'dist/index.html', contenido }],
    })

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0]).toEqual({ via: 'patron', patron, ubicacion: 'dist/index.html', valor })
  })
})

describe('detectarPlaceholders — contar, ordenar y no mentir', () => {
  it('@s8 tres infracciones distintas producen tres violaciones, no una', () => {
    const contenido =
      'Calle de la Belleza 24, 28010 Madrid | +34 600 123 456 | /assets/ph-woman0.png'

    const violaciones = detectarPlaceholders({
      ficheros: [{ ubicacion: 'dist/index.html', contenido }],
    })

    // Este escenario cuenta; el ORDEN es contrato de @s25 y se asevera allí.
    expect(violaciones).toHaveLength(3)
    expect(violaciones.map((violacion) => violacion.via === 'patron' && violacion.patron)).toEqual(
      expect.arrayContaining(['Calle de la Belleza', '600123456', 'ph-woman']),
    )
  })

  it('@s23 un registro marcado que además contiene un patrón produce dos violaciones, una por vía', () => {
    // Las dos vías son independientes: un "else if" en vez de dos "if" deja una sin acusar.
    const violaciones = detectarPlaceholders({
      registros: [
        { ubicacion: 'contacto.email', valor: 'hola@nailslashstudio.com', esPlaceholder: true },
      ],
    })

    expect(violaciones).toHaveLength(2)
    expect(violaciones).toEqual(
      expect.arrayContaining([
        {
          via: 'flag',
          motivo: 'marcado',
          ubicacion: 'contacto.email',
          valor: 'hola@nailslashstudio.com',
        },
        {
          via: 'patron',
          patron: 'hola@nailslashstudio.com',
          ubicacion: 'contacto.email',
          valor: 'hola@nailslashstudio.com',
        },
      ]),
    )
  })

  it('@s9 dos inspecciones de la misma entrada devuelven la misma lista en el mismo orden', () => {
    const entrada = {
      registros: [{ ubicacion: 'legal.nif', valor: 'pendiente', esPlaceholder: true }],
      ficheros: [
        {
          ubicacion: 'dist/index.html',
          contenido: 'IMAGEN TEMPORAL en /assets/ph-woman0.png',
        },
      ],
    }

    const primera = detectarPlaceholders(entrada)
    const segunda = detectarPlaceholders(entrada)

    expect(primera).toHaveLength(3)
    expect(segunda).toEqual(primera)
  })

  it('@s25 las violaciones se emiten en orden de aparición, no en el orden de la lista de patrones', () => {
    // Discriminante: "Calle de la Belleza" va ANTES que "ph-woman" en la lista de patrones
    // y DESPUÉS en el fichero. Manda el contenido.
    const violaciones = detectarPlaceholders({
      registros: [
        { ubicacion: 'legal.nif', valor: 'pendiente', esPlaceholder: true },
        { ubicacion: 'legal.razonSocial', valor: 'pendiente', esPlaceholder: true },
      ],
      ficheros: [
        {
          ubicacion: 'dist/index.html',
          contenido: '<img src="/assets/ph-woman0.png"> Calle de la Belleza 24',
        },
      ],
    })

    expect(violaciones).toEqual([
      { via: 'flag', motivo: 'marcado', ubicacion: 'legal.nif', valor: 'pendiente' },
      { via: 'flag', motivo: 'marcado', ubicacion: 'legal.razonSocial', valor: 'pendiente' },
      { via: 'patron', patron: 'ph-woman', ubicacion: 'dist/index.html', valor: 'ph-woman' },
      {
        via: 'patron',
        patron: 'Calle de la Belleza',
        ubicacion: 'dist/index.html',
        valor: 'Calle de la Belleza',
      },
    ])
  })

  it('@s10 un registro marcado como placeholder con contenido real es violación igual', () => {
    // El flag manda: dice «esto no está confirmado», y publicar sin confirmar es lo que D-6 prohíbe.
    const violaciones = detectarPlaceholders({
      registros: [{ ubicacion: 'nap.telefono', valor: '625 22 33 66', esPlaceholder: true }],
    })

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0]).toEqual({
      via: 'flag',
      motivo: 'marcado',
      ubicacion: 'nap.telefono',
      valor: '625 22 33 66',
    })
  })

  it('@s11 un dato inventado nuevo, sin marcar y sin patrón, la puerta NO lo caza', () => {
    // Límite declarado, no defecto: ninguna puerta detecta una mentira bien escrita.
    const violaciones = detectarPlaceholders({
      registros: [{ ubicacion: 'servicios.0.precio', valor: '31 €', esPlaceholder: false }],
    })

    expect(violaciones).toEqual([])
  })
})

describe('detectarPlaceholders — la entrada vacía', () => {
  it('@s3 una entrada sin registros y sin texto de artefacto devuelve la lista vacía', () => {
    // Correcto como función pura. Es la PUERTA (@s20, @s21, @s26) quien se niega a
    // pasar por vacuidad: 0 violaciones sobre 0 ficheros no es estar protegido.
    expect(detectarPlaceholders({})).toEqual([])
  })
})
