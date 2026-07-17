import { describe, expect, it } from 'vitest'

import {
  canonicaDe,
  componerTitulo,
  construirJsonLd,
  type DatosNegocio,
  ErrorDeSeo,
  ORIGEN_CANONICA,
  registrosSeo,
} from './seo.ts'
import { REGLAS_DEL_CASCARON } from './puerta-cascaron.ts'
import { ejecutarPuerta, type SistemaDeFicheros } from './puerta.ts'
import { DIRECCION, GEO, NOMBRE, registros, TELEFONO } from './site.ts'

/**
 * La ENTRADA es el NAP de la fuente única (F-02), como manda el Given de @s7/@s8/@s9: si
 * alguien revierte `addressLocality` a «Las Ceudas» (el bug CONFIRMADO del cliente), estos
 * tests se ponen ROJOS. Los ESPERADOS, en cambio, van escritos A MANO más abajo: importar el
 * valor que deberías vigilar es tautología y no vigila nada.
 *
 * Es una FUNCIÓN, no una constante del `describe`: lo que se calcula en el cuerpo del
 * `describe` corre en recolección, SIN mutante activo → supervivientes falsos
 * (docs/verification.md). Todo cálculo que deba ver el mutante va DENTRO del `it`.
 */
function napDeLaFuenteUnica(): DatosNegocio {
  return {
    nombre: NOMBRE,
    direccion: DIRECCION,
    telefono: TELEFONO.legible,
    geo: GEO,
  }
}

/**
 * ANTI-TAUTOLOGÍA (regla dura del contrato): TODO esperado se escribe A MANO, carácter a
 * carácter, incluido el separador «·». NUNCA se importa de `seo.ts`/`site.ts` ni se recompone
 * con la función vigilada. Si el test recompusiera el título con la misma plantilla que vigila,
 * una plantilla rota pasaría verde y el mutante del ORDEN de la concatenación resucitaría
 * —justo el hueco que A-22 se cerró para tapar—.
 */
describe('componerTitulo (@s1, @s2, @s3)', () => {
  // Los literales van en la tabla del `describe` como DATOS (permitido): lo prohibido es
  // CALCULAR en el cuerpo del describe (docs/verification.md → supervivientes falsos).
  it.each([
    ['home', 'Nails Lash Studio · Uñas, pestañas y cejas en Las Rozas de Madrid'],
    ['Servicios', 'Servicios · Nails Lash Studio'],
    ['Contacto', 'Contacto · Nails Lash Studio'],
  ])('@s1 componerTitulo("%s") es exactamente "%s"', (pagina, titulo) => {
    expect(componerTitulo(pagina)).toBe(titulo)
  })

  // Se conserva junto a @s1 porque asevera el INVARIANTE («distinto por página») además de los
  // literales: si mañana se añade una página, la regla sigue viva sin tocar la tabla de @s1.
  // Mata el mutante que ignora el argumento y devuelve siempre la marca — el fallo real que
  // produce un sitio entero con el mismo title.
  it('@s2 compone un título DISTINTO para "home" y para "Servicios"', () => {
    expect(componerTitulo('home')).not.toBe(componerTitulo('Servicios'))
  })

  it('@s2 ninguno de los dos títulos es la cadena vacía', () => {
    expect(componerTitulo('home')).not.toBe('')
    expect(componerTitulo('Servicios')).not.toBe('')
  })

  // Falla cerrada (derivación de I-3/D-9, igual que F-01 y F-03): un título compuesto a partir
  // de la nada pasaría la puerta (@s13 solo exige «no vacío») y sería basura en la SERP.
  it('@s3 lanza ante la página con el nombre vacío y no devuelve un título a medias', () => {
    expect(() => componerTitulo('')).toThrow(ErrorDeSeo)
  })

  // Ancla la CAUSA CONCRETA, no solo el tipo: en F-01, un `motivoDelReventon` VACIADO cumplía
  // «...contenga la frase» y SOBREVIVIÓ a la mutación. La puerta ACUSA, no gruñe.
  it('@s3 el error declara POR QUÉ, no gruñe', () => {
    expect(() => componerTitulo('')).toThrow('la página no tiene nombre')
  })
})

/**
 * A-21 CERRADA: el origen entra como REGISTRO PLACEHOLDER de F-01 (@s34). El dominio final
 * sigue [NV] —migrar `nailslashlasrozas.es` con 301 es decisión del CLIENTE—, por eso
 * `canonicaDe` RECIBE el origen y queda PROBADA HOY, con el dato real entrando después sin
 * tocar código. `https://example.invalid` es TLD RESERVADO por RFC 2606: imposible de
 * confundir con una decisión de dominio. EL DOMINIO REAL NO SE INVENTA.
 */
describe('canonicaDe (@s4, @s5, @s6)', () => {
  // Los esperados se escriben A MANO. Mata el mutante que ignora el origen y devuelve una ruta
  // relativa — el fallo típico: una canónica relativa NO identifica la página.
  it.each([
    ['/', 'https://example.invalid/'],
    ['/servicios', 'https://example.invalid/servicios'],
  ])('@s4 canonicaDe("%s", origen) es exactamente "%s"', (ruta, canonica) => {
    expect(canonicaDe(ruta, 'https://example.invalid')).toBe(canonica)
  })

  // Mata el mutante que ignora la ruta y devuelve siempre el origen — que produce EXACTAMENTE
  // el fallo que @s14 persigue en el artefacto: todas las páginas con la canónica de la home.
  // Aquí se mata en la función pura; @s14 lo mata en la puerta.
  it('@s5 devuelve una canónica DISTINTA para "/" y para "/servicios"', () => {
    expect(canonicaDe('/', 'https://example.invalid')).not.toBe(
      canonicaDe('/servicios', 'https://example.invalid'),
    )
  })

  // Falla cerrada. Una canónica compuesta sobre un origen roto sale sintácticamente plausible y
  // semánticamente basura: la puerta vería «una canónica» y pasaría. Lanzar es lo único honesto.
  it.each([
    ['', 'cadena vacía: no hay origen'],
    ['/', 'ruta relativa: no es un origen'],
    ['example.invalid', 'sin esquema: no es absoluto'],
  ])('@s6 lanza ante el origen "%s" (%s) y no devuelve una canónica a medias', (origen) => {
    expect(() => canonicaDe('/', origen)).toThrow(ErrorDeSeo)
  })

  it('@s6 el error declara POR QUÉ y NOMBRA el origen que rechazó', () => {
    expect(() => canonicaDe('/', 'example.invalid')).toThrow(
      'el origen "example.invalid" no es una URL absoluta',
    )
  })

  // Mata al mutante que se come el `=== origen` de `esOrigenAbsoluto`: sin él, un origen CON RUTA
  // pegada pasaría y compondría «https://example.invalid/servicios/servicios».
  it('@s6 un origen con ruta pegada NO es un origen: se rechaza', () => {
    expect(() => canonicaDe('/', 'https://example.invalid/servicios')).toThrow(ErrorDeSeo)
  })
})

/**
 * A3 + T-6. El JSON-LD SE ESCRIBE DE CERO: copiar el del cliente propagaría «Las Ceudas» Y el
 * `vatID` malformado, que son los dos bugs [V] que esta feature existe para no heredar.
 *
 * SUJETO EXPLÍCITO (regla dura del contrato): `name` y `address` son obligatorios PARA GOOGLE,
 * y SOLO para la elegibilidad de rich result. schema.org NO OBLIGA A NADA: un JSON-LD con solo
 * `@type` es VÁLIDO [V, por ausencia citable]. Estos tests fallan porque ESTE CONTRATO lo
 * decide, jamás porque «schema.org obligue».
 */
describe('construirJsonLd (@s7, @s8, @s9, @s10)', () => {
  it('@s7 el campo "@type" es exactamente "BeautySalon"', () => {
    // El subtipo MÁS ESPECÍFICO que Google respalda [V]: «Use the most specific LocalBusiness
    // sub-type possible». La jerarquía real tiene HERENCIA MÚLTIPLE y el padre DIRECTO es
    // HealthAndBeautyBusiness; LocalBusiness es ANCESTRO.
    expect(construirJsonLd(napDeLaFuenteUnica())['@type']).toBe('BeautySalon')
  })

  it('@s7 el campo "name" es exactamente "Nails Lash Studio"', () => {
    // Requisito de GOOGLE (elegibilidad), NO de schema.org. Es el NOMBRE COMERCIAL [V], NUNCA
    // la razón social — que es DESCONOCIDA y por eso `legalName` no se emite (@s9).
    expect(construirJsonLd(napDeLaFuenteUnica()).name).toBe('Nails Lash Studio')
  })

  it('@s7 el campo "address.@type" es exactamente "PostalAddress"', () => {
    // DECISIÓN DE PROYECTO más estricta que el vocabulario: schema.org ADMITE `Text` en
    // `address` — un string PASARÍA su validación [V]. Exigir PostalAddress es NUESTRO.
    expect(construirJsonLd(napDeLaFuenteUnica()).address['@type']).toBe('PostalAddress')
  })

  it('@s7 el campo "address.addressLocality" es exactamente "Las Rozas de Madrid"', () => {
    // NUNCA «Las Ceudas»: ese es el bug CONFIRMADO del JSON-LD del cliente [V].
    expect(construirJsonLd(napDeLaFuenteUnica()).address.addressLocality).toBe(
      'Las Rozas de Madrid',
    )
  })

  it('@s7 el campo "address.postalCode" es exactamente "28232"', () => {
    // Dato del CLIENTE. NO se verifica contra OSM: OSM SE CONTRADICE A SÍ MISMO (nodo del mall
    // 28242 vs nodos del nº 75 en 28232) [V]. Verificarlo contra OSM introduciría un bug.
    expect(construirJsonLd(napDeLaFuenteUnica()).address.postalCode).toBe('28232')
  })
})

/**
 * A3. LOS DOS NÚMEROS SE ESCRIBEN A MANO, DÍGITO A DÍGITO. Mutar UN SOLO DÍGITO rompe el test.
 *
 * 🔴 LÍMITE HONESTO, Y ES LA MITAD DEL ESCENARIO: la constante está verificada A NIVEL DE
 * EDIFICIO, JAMÁS DE «LOCAL 41» — point-in-polygon (ray casting) contra Overpass +
 * api.openstreetmap.org sitúa el punto DENTRO de `way/34502818` {building=yes, shop=mall,
 * name="Centro comercial Zoco Rozas"} y los otros 4 edificios del radio de 80 m dan FUERA [V];
 * el reverse de Nominatim del punto exacto da «Bar Cañas, 75, Avenida de Atenas, Las Rozas de
 * Madrid» a 10,8 m [V]. Pero Nominatim devuelve `[]` para «Nails Lash Studio Las Rozas» → UN
 * TEST QUE AFIRMARA «geo == Local 41» AFIRMARÍA MÁS DE LO QUE NINGUNA FUENTE SOSTIENE.
 * POR ESO ESTE TEST NO AFIRMA DÓNDE ESTÁ EL SALÓN: AFIRMA QUE SE EMITE LA CONSTANTE ACORDADA Y
 * QUE MUTA SI ALGUIEN LA TOCA. JAMÁS SE RECALCULA NI SE «CORRIGE» DESDE OSM.
 */
describe('construirJsonLd → geo (@s8)', () => {
  it('@s8 el campo "geo.latitude" es exactamente 40.5179875', () => {
    expect(construirJsonLd(napDeLaFuenteUnica()).geo.latitude).toBe(40.5179875)
  })

  it('@s8 el campo "geo.longitude" es exactamente -3.9226688', () => {
    expect(construirJsonLd(napDeLaFuenteUnica()).geo.longitude).toBe(-3.9226688)
  })
})

/**
 * Busca una clave a CUALQUIER profundidad, INSENSIBLE A LA CAJA (`review`/`Review`), como manda
 * @s9. Vive en el test —no en producción— porque aquí solo tiene que ACUSAR al constructor; la
 * versión de producción, la que recorre el JSON-LD del artefacto, es de la puerta (@s22).
 */
function tieneClaveAlgunaProfundidad(valor: unknown, clave: string): boolean {
  if (Array.isArray(valor)) {
    return valor.some((elemento) => tieneClaveAlgunaProfundidad(elemento, clave))
  }

  if (valor === null || typeof valor !== 'object') {
    return false
  }

  return Object.entries(valor).some(
    ([nombre, anidado]) =>
      nombre.toLowerCase() === clave.toLowerCase() || tieneClaveAlgunaProfundidad(anidado, clave),
  )
}

describe('construirJsonLd → el conjunto EXACTO de claves (@s9)', () => {
  // Aseverar el CONJUNTO EXACTO (no solo «no está X») es lo que impide que alguien cuele una
  // propiedad sin pasar por la puerta humana — que es justamente cómo dos implementadores
  // eligen distinto y AMBOS PASAN LOS TESTS.
  it('@s9 las claves de primer nivel son EXACTAMENTE las acordadas', () => {
    expect(Object.keys(construirJsonLd(napDeLaFuenteUnica())).sort()).toEqual(
      ['@context', '@type', 'address', 'geo', 'name', 'telephone'].sort(),
    )
  })

  // LAS PROPIEDADES SE DEJAN VACÍAS A PROPÓSITO: schema.org las tiene, y NO LAS USAMOS.
  it.each([
    ['legalName', 'LA RAZÓN SOCIAL ES DESCONOCIDA [V]. Emitirla sería inventarla'],
    ['vatID', 'NO HAY NINGÚN NIF/CIF VÁLIDO [V]. El «10656940» del cliente NO lo es (@s10)'],
    ['email', 'A-11 ABIERTA: no se emite hasta que el cliente lo confirme'],
    ['aggregateRating', '(a) prohibición Google + (c) falta de título Treatwell (@s22)'],
    ['review', '«It applies to Review AND AggregateRating» [V] (@s22)'],
    ['openingHours', 'A-19: el horario NO entra en F-04. Y en F-10 esta clave NUNCA se usa (@s35)'],
    ['openingHoursSpecification', 'A-19 CERRADA: el horario es de F-10, no de F-04'],
    ['priceRange', 'A-20: los PRECIOS REALES están BLOQUEADOS (B-5/F-09) — sería INVENTAR'],
  ])('@s9 la clave "%s" no aparece a NINGUNA profundidad (%s)', (prohibida) => {
    expect(tieneClaveAlgunaProfundidad(construirJsonLd(napDeLaFuenteUnica()), prohibida)).toBe(
      false,
    )
  })
})

/**
 * 🚨 EL ESCENARIO MÁS IMPORTANTE DEL CONTRATO, Y EL QUE MÁS FÁCIL SERÍA «MEJORAR» HASTA
 * ROMPERLO. Lee la sección del `vatID` en la cabecera del .feature ANTES de tocarlo.
 *
 * «10656940» ES UN DATO REAL: está en el JSON-LD de la home del cliente [V] y no se renderiza
 * como texto visible (por eso nadie lo había visto). NO ES VÁLIDO: 8 dígitos, todos numéricos.
 * Ni CIF (Orden EHA/451/2008 art. 2: «estará compuesto por NUEVE caracteres») [V], ni NIF de
 * persona física (RD 1065/2007 art. 19.1: número del DNI «seguido del correspondiente código o
 * carácter de verificación, constituido por una LETRA MAYÚSCULA») [V]. 8 dígitos es EXACTAMENTE
 * un DNI sin su letra → es verosímil que sea EL DNI DEL TITULAR TRUNCADO, dato personal de una
 * persona física [I sobre [V]].
 *
 * LA VALIDACIÓN ES FORMAL, Y SE DECLARA COMO TAL: NO calcula el módulo 23 y NO acredita
 * titularidad. B-1/B-2 SIGUEN BLOQUEADAS: este dato NO desbloquea nada.
 */
describe('construirJsonLd → el identificador fiscal se RECHAZA (@s10)', () => {
  it('@s10 lanza un error que declara que el identificador no cumple el formato legal', () => {
    expect(() =>
      construirJsonLd({ ...napDeLaFuenteUnica(), identificadorFiscal: '10656940' }),
    ).toThrow(/no cumple el formato legal/)
  })

  it('@s10 lanza ErrorDeSeo y no emite ningún JSON-LD', () => {
    expect(() =>
      construirJsonLd({ ...napDeLaFuenteUnica(), identificadorFiscal: '10656940' }),
    ).toThrow(ErrorDeSeo)
  })

  it('@s10 la salida NO contiene el literal "10656940"', () => {
    // El mensaje NO ECHA el identificador: es verosímilmente un DNI truncado, dato personal.
    // Un error que lo repitiera lo publicaría en los logs del build.
    expect(() =>
      construirJsonLd({ ...napDeLaFuenteUnica(), identificadorFiscal: '10656940' }),
    ).toThrow(expect.not.stringContaining('10656940') as unknown as string)
  })

  // 🔴 EL CORAZÓN DEL ESCENARIO. LA LETRA DEL DNI ES DETERMINISTA (módulo 23 sobre una tabla):
  // cualquier agente de este pipeline puede calcularla en un segundo y «arreglar» el dato.
  // ESO SERÍA INVENTAR UN NIF: derivar el carácter de verificación NO ACREDITA que el número
  // pertenezca al titular, ni que el titular sea persona física, ni que ese sea su NIF a
  // efectos del art. 10.1 LSSI; y PUBLICARÍA UN DATO PERSONAL.
  // Se contrasta contra el ALFABETO ENTERO, no contra la tabla del módulo 23: así este test NI
  // SIQUIERA CODIFICA la tabla, y es MÁS FUERTE (cubre las 26 letras, no solo las 23).
  it('@s10 la salida NO contiene "10656940" seguido de ninguna letra de control', () => {
    let mensaje = ''

    try {
      construirJsonLd({ ...napDeLaFuenteUnica(), identificadorFiscal: '10656940' })
    } catch (error: unknown) {
      mensaje = error instanceof Error ? error.message : String(error)
    }

    expect(mensaje).not.toMatch(/10656940\s*[A-Za-z]/)
    expect(mensaje).not.toBe('')
  })
})

/**
 * ✅ A-21 CERRADA POR EL HUMANO (2026-07-16). El dominio sigue [NV] —migrar
 * `nailslashlasrozas.es` con 301 es DECISIÓN DEL CLIENTE— y esta es LA DECISIÓN 9 DEL PROYECTO,
 * LITERAL: *el contenido no verificado vive en una capa explícita y es ESTRUCTURALMENTE
 * IMPOSIBLE publicarlo por accidente*.
 *
 * 🔴 F-04 NO AÑADE NI UNA LÍNEA DE LÓGICA AQUÍ, Y ESO ES EL ESCENARIO: el origen entra como
 * REGISTRO PLACEHOLDER y LA PUERTA DE F-01 YA LO CAZA POR LA VÍA DEL FLAG. NO SE DUPLICA LA
 * PUERTA DE F-01: F-04 SE APOYA EN ELLA. Una segunda puerta que comprobara lo mismo divergiría
 * de la primera en seis meses.
 *
 * CONSECUENCIA BUSCADA: F-04 se construye ENTERA HOY, con la canónica PROBADA (@s4, @s5), y EL
 * SITIO NO SE PUEDE PUBLICAR mientras el dominio no se decida. Cuando el cliente lo decida, se
 * cambia EL DATO y el flag a `false`: SIN TOCAR CÓDIGO.
 */
describe('el origen de la canónica es un PLACEHOLDER (@s34)', () => {
  /** Un dist/ mínimo y limpio: lo que importa aquí es el REGISTRO, no el artefacto. */
  function distLimpio(): SistemaDeFicheros {
    return {
      existeDirectorio: () => true,
      listarFicheros: () => ['dist/index.html'],
      leer: () => '<!doctype html><html lang="es"><head></head><body></body></html>',
    }
  }

  it('@s34 el origen está declarado en la capa de datos como registro placeholder', () => {
    expect(registrosSeo).toContainEqual({
      ubicacion: 'seo.origenCanonica',
      valor: ORIGEN_CANONICA,
      esPlaceholder: true,
    })
  })

  it('@s34 el build de PRODUCCIÓN rompe por él: exit != 0, vía el FLAG de la puerta de F-01', () => {
    const resultado = ejecutarPuerta({
      modo: 'produccion',
      registros: [...registros, ...registrosSeo],
      ficheros: distLimpio(),
    })

    expect(resultado.codigoSalida).not.toBe(0)
    // La violación la emite la PUERTA DE PLACEHOLDERS de F-01 POR EL FLAG esPlaceholder...
    expect(resultado.lineas.join('\n')).toContain('flag esPlaceholder')
    // ...y la salida DECLARA LA UBICACIÓN del registro del origen.
    expect(resultado.lineas.join('\n')).toContain('seo.origenCanonica')
  })

  // El 2º `And` del escenario es lo que IMPIDE LA DUPLICACIÓN: si la violación la emitiera la
  // puerta del cascarón, alguien habría reimplementado F-01 dentro de F-04.
  it('@s34 la puerta del CASCARÓN no dice nada del origen: no duplica la de F-01', () => {
    // 🔴 EL ANCLA VA PRIMERO, Y NO ES ADORNO: con `REGLAS_DEL_CASCARON = []` los dos `not
    // .toContain` de abajo pasarían VACUAMENTE — un verde por vacuidad DENTRO del test que
    // persigue la duplicación. Lo destapó la mutación (el mutante `[]` sobrevivía).
    expect(REGLAS_DEL_CASCARON.length).toBeGreaterThanOrEqual(10)
    expect(REGLAS_DEL_CASCARON).toContain('title ausente o vacío')
    expect(REGLAS_DEL_CASCARON).toContain('href interno sin fichero en dist/')

    expect(REGLAS_DEL_CASCARON.join(' ')).not.toContain('placeholder')
    expect(REGLAS_DEL_CASCARON.join(' ')).not.toContain('origen')
  })

  // `dev` NO rompe (@s31 y @s14 de F-01): la puerta separa «VER» de «PUBLICAR». En local, una
  // cáscara con el dominio sin decidir es legítima — es para ver el diseño.
  it('@s34 el build de DESARROLLO no rompe por el placeholder: separa «ver» de «publicar»', () => {
    expect(
      ejecutarPuerta({
        modo: 'desarrollo',
        registros: [...registros, ...registrosSeo],
        ficheros: distLimpio(),
      }).codigoSalida,
    ).toBe(0)
  })
})

/**
 * LOS VALORES QUE EL CONTRATO NO FIJA EN NINGÚN `Then`, PERO QUE HAY QUE ANCLAR IGUAL.
 *
 * El umbral de mutación es 1.0: un valor que ningún test asevera deja su mutante VIVO, y un
 * mutante vivo aquí significa que ese dato puede cambiar a basura sin que nada se entere. Los
 * tres literales van escritos A MANO (anti-tautología); el del teléfono lo respalda la cabecera
 * del .feature, que lista «34625223366» entre los que van a mano.
 * DECLARADO en progress/tdd_cascaron_semantico.md §Interpretaciones: no es contrato, es lo
 * mínimo para que el umbral signifique algo.
 */
describe('los valores del JSON-LD que el contrato no fija, anclados igual', () => {
  it('el "@context" es exactamente "https://schema.org"', () => {
    expect(construirJsonLd(napDeLaFuenteUnica())['@context']).toBe('https://schema.org')
  })

  // DERIVADO de la fuente única (I-7): el href visible y el JSON-LD NO PUEDEN divergir. En E.164.
  it('el "telephone" es exactamente "+34625223366", en E.164', () => {
    expect(construirJsonLd(napDeLaFuenteUnica()).telephone).toBe('+34625223366')
  })

  // @s7 remite a @s21 para la calle: «no está vacía y contiene el dato de F-02». Su COMPOSICIÓN
  // no está decidida, así que se asevera lo que el contrato sí dice: que lleva el dato.
  it('el "address.streetAddress" no está vacío y contiene el dato de F-02', () => {
    const calle = construirJsonLd(napDeLaFuenteUnica()).address.streetAddress

    expect(calle).not.toBe('')
    expect(calle).toContain('Av. de Atenas 75')
    expect(calle).toContain('Local 41')
  })

  // @s10, 3er y 4º `And`: el mensaje entero, para que ningún trozo pueda vaciarse en silencio.
  it('@s10 el motivo del rechazo declara las TRES prohibiciones, y no echa el identificador', () => {
    let mensaje = ''

    try {
      construirJsonLd({ ...napDeLaFuenteUnica(), identificadorFiscal: '10656940' })
    } catch (error: unknown) {
      mensaje = error instanceof Error ? error.message : String(error)
    }

    expect(mensaje).toContain('no cumple el formato legal')
    expect(mensaje).toContain('NO se completa')
    expect(mensaje).toContain('NO se corrige')
    expect(mensaje).toContain('NO se infiere')
    expect(mensaje).toContain('NO acredita titularidad')
    expect(mensaje).not.toContain('10656940')
  })
})
