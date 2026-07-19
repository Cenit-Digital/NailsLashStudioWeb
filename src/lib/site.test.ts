import { detectarPlaceholders } from './placeholders'
import {
  DIRECCION,
  GEO,
  HORARIO,
  instagramHref,
  NOMBRE,
  REDES,
  registros,
  TELEFONO,
  telHref,
  waHref,
} from './site'

// Contrato: features/datos_negocio_fuente_unica.feature
//
// ANTI-TAUTOLOGÍA (regla del stack; precedente WebEmpresa useIsMobile/MOBILE_QUERY): cada
// salida esperada se escribe A MANO. Nunca se deriva de una constante de site.ts ni se
// re-llama a encodeURIComponent dentro del test. Si el test reflejara la constante o
// re-aplicara el encoder, un teléfono equivocado o un encoder mutado pasarían verdes.
//
// El HOST del enlace de WhatsApp NO se asevera (A-10: wa.me vs api.whatsapp.com se verifica a
// mano antes de F-13). Por eso estos helpers extraen el número y el parámetro text SIN conocer
// el host: el número es el último segmento de la ruta; el text es lo que sigue a "?text=" TAL
// CUAL (sin decodificar), para poder compararlo contra el literal escrito a mano.
function numeroDelEnlace(url: string): string {
  const sinParametros = url.split('?')[0]
  return sinParametros.slice(sinParametros.lastIndexOf('/') + 1)
}

function textoDelEnlace(url: string): string {
  const marca = '?text='
  const desde = url.indexOf(marca)
  return desde === -1 ? '' : url.slice(desde + marca.length)
}

describe('NAP verificado — constantes exactas y estructuradas', () => {
  it('@s1 el nombre es exactamente "Nails Lash Studio"', () => {
    expect(NOMBRE).toBe('Nails Lash Studio')
  })

  it('@s1 la dirección está estructurada por partes, no como una cadena suelta', () => {
    expect(typeof DIRECCION).toBe('object')
  })

  it('@s1 la dirección incluye cada parte verificada', () => {
    const partes = Object.values(DIRECCION)

    expect(partes).toContain('C.C. El Zoco')
    expect(partes).toContain('Av. de Atenas 75')
    expect(partes).toContain('Local 41')
    expect(partes).toContain('Planta 0')
    expect(partes).toContain('28232')
    expect(partes).toContain('Las Rozas de Madrid')
  })

  it('@s1 el teléfono en forma legible es exactamente "625 22 33 66"', () => {
    expect(TELEFONO.legible).toBe('625 22 33 66')
  })

  it('@s1 el horario es L-V "10:00-20:00", S "10:00-14:00" y D cerrado', () => {
    expect(HORARIO.lunesAViernes).toBe('10:00-20:00')
    expect(HORARIO.sabado).toBe('10:00-14:00')
    expect(HORARIO.domingo).toBe('cerrado')
  })

  it('@s2 la geolocalización es latitud 40.5179875 y longitud -3.9226688', () => {
    expect(GEO.latitud).toBe(40.5179875)
    expect(GEO.longitud).toBe(-3.9226688)
  })

  it('@s2 el usuario de Instagram es exactamente "@nailslash.studio_"', () => {
    expect(REDES.instagram).toBe('@nailslash.studio_')
  })

  it('@s2 el enlace de Facebook es exactamente "https://www.facebook.com/nailslashstudiorozas/"', () => {
    expect(REDES.facebook).toBe('https://www.facebook.com/nailslashstudiorozas/')
  })

  it('@s2 no se expone ningún usuario ni enlace de TikTok', () => {
    expect(REDES).not.toHaveProperty('tiktok')
    expect(Object.values(REDES).join(' ')).not.toContain('tiktok')
  })
})

describe('telHref — normaliza a un tel: URI en E.164', () => {
  it('@s3 normaliza el teléfono legible a "tel:+34625223366"', () => {
    expect(telHref('625 22 33 66')).toBe('tel:+34625223366')
  })

  // @s4: MISMA salida sin importar separadores ni prefijo, e idempotente. Separadores dobles se
  // compactan; "+34"/"0034"/"34" (E.164 con y sin "+") NO duplican el prefijo. Salida a mano.
  it.each([
    ['625 22 33 66'],
    ['625-22-33-66'],
    ['625  22  33  66'],
    ['+34 625 223 366'],
    ['+34625223366'],
    ['34625223366'],
    ['0034625223366'],
    ['0034 625 22 33 66'],
  ])('@s4 telHref("%s") es "tel:+34625223366"', (entrada) => {
    expect(telHref(entrada)).toBe('tel:+34625223366')
  })
})

describe('waHref — número E.164 sin "+" y texto urlencoded', () => {
  it('@s5 lleva el número "34625223366" sin "+" y el texto "Hola%2C%20quiero%20cita"', () => {
    const url = waHref('625 22 33 66', 'Hola, quiero cita')

    expect(numeroDelEnlace(url)).toBe('34625223366')
    expect(url).not.toContain('+34625223366')
    expect(textoDelEnlace(url)).toBe('Hola%2C%20quiero%20cita')
  })

  // @s6: cada `esperado` se escribe A MANO. Las filas de "&" (%26) y "#" (%23) matan el
  // mutante encodeURIComponent → encodeURI (encodeURI NO escapa & ni #). Los acentos (%C3%B3,
  // %C3%B1), el punto medio · (%C2%B7) y el emoji 💅 (%F0%9F%92%85) fijan el UTF-8 percent-encoded.
  it.each([
    ['Hola & adiós', 'Hola%20%26%20adi%C3%B3s'],
    ['precio #1', 'precio%20%231'],
    ['uñas 💅', 'u%C3%B1as%20%F0%9F%92%85'],
    ['Cita · 10h', 'Cita%20%C2%B7%2010h'],
  ])('@s6 escapa "%s" con encodeURIComponent a "%s"', (texto, esperado) => {
    expect(textoDelEnlace(waHref('625 22 33 66', texto))).toBe(esperado)
  })

  it('@s7 con texto vacío OMITE el parámetro text y conserva el número', () => {
    const url = waHref('625 22 33 66', '')

    expect(numeroDelEnlace(url)).toBe('34625223366')
    expect(url).not.toContain('text=')
  })
})

describe('fuente única — texto visible, telHref y waHref no pueden divergir', () => {
  it('@s8 el texto y ambos href salen del mismo dato canónico TELEFONO.legible', () => {
    // El dato se declara UNA sola vez en site.ts; el texto visible y ambos href se derivan de
    // él. Los esperados se escriben A MANO (anti-tautología); solo la ENTRADA es la constante.
    const dato = TELEFONO.legible

    expect(dato).toBe('625 22 33 66')
    expect(telHref(dato)).toBe('tel:+34625223366')
    expect(numeroDelEnlace(waHref(dato, ''))).toBe('34625223366')

    // Los tres contienen el mismo número nacional: el visible compactado ES el nacional, y
    // ambos href lo terminan. Si un componente reescribiera el número a mano, esto rompería.
    const nacional = '625223366'
    expect(dato.replaceAll(' ', '')).toBe(nacional)
    expect(telHref(dato).endsWith(nacional)).toBe(true)
    expect(numeroDelEnlace(waHref(dato, '')).endsWith(nacional)).toBe(true)
  })
})

describe('encaje con la puerta de F-01 — el dato real no dispara el patrón placeholder', () => {
  // @s9: 625223366 ≠ 600123456. El dato real de F-02 pasa la vía por PATRÓN de F-01 sin falso
  // positivo en cualquiera de sus formas. Se usa la detectarPlaceholders REAL de F-01.
  it.each([['625 22 33 66'], ['+34 625 22 33 66'], ['625223366']])(
    '@s9 el teléfono real "%s" no produce ninguna violación',
    (forma) => {
      const violaciones = detectarPlaceholders({
        ficheros: [{ ubicacion: 'dist/index.html', contenido: forma }],
      })

      expect(violaciones).toEqual([])
    },
  )

  // @s10 (A-12): los `registros` reales de F-02 alimentan la vía por FLAG de F-01. El array se
  // escribe A MANO aquí como segunda declaración independiente (anti-tautología): mutar un dato o
  // el flag en site.ts rompe este toEqual. (A-11) El email queda DIFERIDO: no figura.
  it('@s10 registros proyecta el NAP verificado con esPlaceholder:false y sin el email', () => {
    expect(registros).toEqual([
      { ubicacion: 'site.nombre', valor: 'Nails Lash Studio', esPlaceholder: false },
      { ubicacion: 'site.direccion.centroComercial', valor: 'C.C. El Zoco', esPlaceholder: false },
      { ubicacion: 'site.direccion.via', valor: 'Av. de Atenas 75', esPlaceholder: false },
      { ubicacion: 'site.direccion.local', valor: 'Local 41', esPlaceholder: false },
      { ubicacion: 'site.direccion.planta', valor: 'Planta 0', esPlaceholder: false },
      { ubicacion: 'site.direccion.codigoPostal', valor: '28232', esPlaceholder: false },
      { ubicacion: 'site.direccion.localidad', valor: 'Las Rozas de Madrid', esPlaceholder: false },
      { ubicacion: 'site.telefono', valor: '625 22 33 66', esPlaceholder: false },
      { ubicacion: 'site.horario.lunesAViernes', valor: '10:00-20:00', esPlaceholder: false },
      { ubicacion: 'site.horario.sabado', valor: '10:00-14:00', esPlaceholder: false },
      { ubicacion: 'site.horario.domingo', valor: 'cerrado', esPlaceholder: false },
      { ubicacion: 'site.geo.latitud', valor: '40.5179875', esPlaceholder: false },
      { ubicacion: 'site.geo.longitud', valor: '-3.9226688', esPlaceholder: false },
      { ubicacion: 'site.redes.instagram', valor: '@nailslash.studio_', esPlaceholder: false },
      {
        ubicacion: 'site.redes.facebook',
        valor: 'https://www.facebook.com/nailslashstudiorozas/',
        esPlaceholder: false,
      },
    ])
  })

  it('@s10 la puerta de F-01 sobre esos registros no emite ninguna violación', () => {
    expect(detectarPlaceholders({ registros })).toEqual([])
  })

  it('@s10 el email NO figura entre los registros (A-11 diferido)', () => {
    expect(registros.map((registro) => registro.valor)).not.toContain(
      'centroesteticarozas@gmail.com',
    )
  })
})

describe('modos de error — entrada que no es un teléfono válido → falla cerrada', () => {
  // @s11: ante basura, lanzar en vez de emitir un "tel:+34" a medias. El punto NO es separador
  // (solo espacio y guion); fuera del rango E.164 (>15 dígitos) también lanza.
  it.each([
    ['', 'cadena vacía: ni un dígito'],
    ['abc', 'sin dígitos'],
    ['625', 'nacional incompleto: el español son 9'],
    ['625.22.33.66', 'el punto no es separador'],
    ['6252233661234567', 'más de 15 dígitos'],
  ])('@s11 telHref("%s") lanza (%s) y no devuelve un tel: a medias', (entrada) => {
    // "teléfono" es un fragmento del mensaje escrito A MANO (no se importa la constante de
    // producción): un error mudo (mensaje vacío) NO es la "falla ruidosa" que exige el contrato.
    expect(() => telHref(entrada)).toThrow('teléfono')
  })

  it('@s12 waHref lanza igual ante una entrada que no es un teléfono válido', () => {
    // waHref comparte el normalizador a E.164 de telHref: una sola regla, no dos que diverjan.
    expect(() => waHref('abc', 'Hola, quiero cita')).toThrow('teléfono')
  })
})

// =============================================================================================
// F-12 (contacto) — instagramHref: derivación pura HERMANA de telHref/waHref. EXTIENDE site.ts sin
// tocar el comportamiento de F-02 (los tests de arriba siguen verdes). Contrato:
// features/contacto.feature @s1..@s3 (+ @s13 mutación). ANTI-TAUTOLOGÍA: cada URL esperada se escribe
// A MANO; "@nailslash.studio_" entra como ENTRADA (fuente única F-02), NUNCA se re-ejecuta
// instagramHref ni se importa su resultado como «esperado».
// =============================================================================================
describe('instagramHref — deriva la URL pública del perfil desde el handle canónico (F-12)', () => {
  it('@s1 instagramHref("@nailslash.studio_") es exactamente "https://www.instagram.com/nailslash.studio_/"', () => {
    // La URL esperada va ESCRITA A MANO. El handle correcto es el del GBP del negocio [V, §3.5].
    expect(instagramHref('@nailslash.studio_')).toBe('https://www.instagram.com/nailslash.studio_/')
  })

  it('@s1 el resultado NO es el del handle alternativo NO VERIFICADO "@nail_lash_studio_"', () => {
    // Blinda el handle correcto frente al `@nail_lash_studio_` del directorio del centro [V, §3.5].
    expect(instagramHref('@nailslash.studio_')).not.toBe(
      'https://www.instagram.com/nail_lash_studio_/',
    )
  })

  it('@s1 el resultado antepone el host, quita el "@" inicial y cierra con "/"', () => {
    const url = instagramHref('@nailslash.studio_')

    // Tres aserciones que matan tres mutantes: no anteponer el host, no quitar el "@", no cerrar «/».
    expect(url.startsWith('https://www.instagram.com/')).toBe(true)
    expect(url).not.toContain('@')
    expect(url.endsWith('/')).toBe(true)
  })
})

// Devuelve la URL derivada, o el centinela 'LANZÓ' si instagramHref lanza. Así un solo valor codifica
// a la vez «lanzó» (== 'LANZÓ') y «no emitió la URL a medias del perfil raíz» (!= '…instagram.com//').
function resultadoODisparo(entrada: string): string {
  try {
    return instagramHref(entrada)
  } catch {
    return 'LANZÓ'
  }
}

describe('@s2 instagramHref falla cerrada ante un handle vacío o inválido — no emite una URL a medias', () => {
  // La columna-marcador <caso> del Scenario Outline, DECODIFICADA a la cadena literal EXACTA (G4): sin
  // celdas vacías ni comillas dobladas. `cadena_vacia` → '' (cero caracteres, NO las dos comillas).
  const CASOS: ReadonlyArray<readonly [string, string]> = [
    ['cadena_vacia', ''],
    ['solo_arroba', '@'],
    ['arroba_con_espacio', '@nails lash'],
  ]

  it.each(CASOS)('@s2 el caso "%s" LANZA y no emite "https://www.instagram.com//"', (_caso, entrada) => {
    // «lanza un error»: si por regresión devolviera en vez de lanzar, el centinela dejaría de ser 'LANZÓ'.
    expect(resultadoODisparo(entrada)).toBe('LANZÓ')
    // El borde "//" (perfil raíz) escrito A MANO: ante basura, NUNCA un enlace roto que parezca válido.
    expect(resultadoODisparo(entrada)).not.toBe('https://www.instagram.com//')
  })
})

describe('@s3 instagramHref ante un handle SIN el "@" inicial — falla cerrada (D-1a, RECOMENDADO en la puerta)', () => {
  it('@s3 "nailslash.studio_" (sin "@") LANZA y NO deriva la URL de un handle no canónico', () => {
    // El dato canónico de F-02 SIEMPRE trae el "@" (site.ts:46); la variante sin "@" es basura para la
    // ruta real. Falla cerrada, coherente con numeroNacional: no derivar lo que no llegó en forma canónica.
    expect(resultadoODisparo('nailslash.studio_')).toBe('LANZÓ')
    // La URL derivada (escrita A MANO) es EXACTAMENTE lo que NO debe emitir a partir de un handle sin "@".
    expect(resultadoODisparo('nailslash.studio_')).not.toBe(
      'https://www.instagram.com/nailslash.studio_/',
    )
  })
})
