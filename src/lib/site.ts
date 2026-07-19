/**
 * La fuente ÚNICA del NAP (F-02). Nombre, dirección, teléfono, horario, geo y redes
 * verificados viven aquí y en ningún otro sitio; los enlaces tel: y de WhatsApp se DERIVAN
 * de este mismo dato para que el texto visible y el href no puedan divergir.
 *
 * Contrato: features/datos_negocio_fuente_unica.feature.
 */
// La extensión .ts es explícita porque este módulo lo carga Node directamente (vía el humilde
// tools/puerta-placeholders.ts, con --experimental-strip-types) al importar `registros`. El
// import es solo de tipo: el type stripping lo borra, así que no acopla a placeholders en runtime.
import type { RegistroDatos } from './placeholders.ts'

export const NOMBRE = 'Nails Lash Studio'

// Dirección ESTRUCTURADA (no una cadena suelta): F-04 (JSON-LD) y F-11 la consumen por partes.
// "Local 41" y "Planta 0" desambiguan frente a Acosta Nails (Local 1) en el mismo edificio.
export const DIRECCION = {
  centroComercial: 'C.C. El Zoco',
  via: 'Av. de Atenas 75',
  local: 'Local 41',
  planta: 'Planta 0',
  codigoPostal: '28232',
  localidad: 'Las Rozas de Madrid',
} as const

export const TELEFONO = {
  legible: '625 22 33 66',
} as const

// El horario es DATO guardado, no lógica: quien lo interpreta (estaAbierto, franjas) es F-10.
export const HORARIO = {
  lunesAViernes: '10:00-20:00',
  sabado: '10:00-14:00',
  domingo: 'cerrado',
} as const

// Coordenadas [V] sembradas para F-04 (JSON-LD) y F-11. Números: los consumidores geográficos
// los quieren numéricos, no como cadena.
export const GEO = {
  latitud: 40.5179875,
  longitud: -3.9226688,
} as const

// Redes VERIFICADAS. TikTok NO existe (no verificado): la fuente única no lo inventa (@s2).
export const REDES = {
  instagram: '@nailslash.studio_',
  facebook: 'https://www.facebook.com/nailslashstudiorozas/',
} as const

const CODIGO_PAIS_ESPANA = '+34'
const SEPARADORES = /[ -]/g

// El número nacional español son EXACTAMENTE 9 dígitos. Este ancla es toda la validación
// (@s11): rechaza la cadena vacía, lo que no son dígitos (letras, el punto que NO es separador),
// lo corto y lo que se pasa del rango E.164 (>15 dígitos). Falla cerrada: ante basura se lanza
// en vez de emitir un "tel:+34" a medias que parezca válido. La ruta normal nunca ve basura
// porque el dato canónico viene siempre de la fuente única verificada; esto es la red de seguridad.
const NUMERO_NACIONAL_VALIDO = /^\d{9}$/

// Prefijos internacionales que se reconocen y se descartan para quedarnos con el número
// nacional. Alineado con placeholders.ts (F-01: '+34', '0034') más el código de país desnudo
// '34' (E.164 SIN el "+"), que F-02 necesita para la idempotencia de un número ya en E.164
// (@s4: "34625223366" → "tel:+34625223366", nunca doble prefijo).
const PREFIJOS_INTERNACIONALES = ['+34', '0034', '34']

// El host de WhatsApp NO está atado por el contrato (A-10: wa.me vs api.whatsapp.com/send se
// verifica a mano en Android/iOS/WhatsApp Web antes de F-13). Lo testeable y mutable de waHref
// es el número (E.164 sin "+") y el texto (encodeURIComponent); el .feature ordena NO aseverar
// el host, así que mutar esta cadena no altera ninguna aserción del contrato → mutante
// equivalente respecto al contrato, excluido con justificación en
// progress/mutation_datos_negocio_fuente_unica.md (política docs/mutation-testing.md §78-80).
// Stryker disable next-line all
const HOST_WHATSAPP = 'https://wa.me/'

function sinPrefijoInternacional(compacta: string): string {
  for (const prefijo of PREFIJOS_INTERNACIONALES) {
    if (compacta.startsWith(prefijo)) {
      return compacta.slice(prefijo.length)
    }
  }

  return compacta
}

function numeroNacional(tel: string): string {
  const nacional = sinPrefijoInternacional(tel.replace(SEPARADORES, ''))

  if (!NUMERO_NACIONAL_VALIDO.test(nacional)) {
    // Falla ruidosa (modo de error del contrato): un mensaje descriptivo, no un error mudo.
    throw new Error('la entrada no es un teléfono español válido')
  }

  return nacional
}

function numeroE164(tel: string): string {
  return `${CODIGO_PAIS_ESPANA}${numeroNacional(tel)}`
}

export function telHref(tel: string): string {
  return `tel:${numeroE164(tel)}`
}

export function waHref(tel: string, texto: string): string {
  const enlace = `${HOST_WHATSAPP}${numeroE164(tel).slice(1)}`

  return texto === '' ? enlace : `${enlace}?text=${encodeURIComponent(texto)}`
}

// F-12 (contacto): el host público de un perfil de Instagram. El dato canónico de F-02 es el HANDLE
// (@nailslash.studio_), NO una URL: guardar la URL «sería HARDCODEARLA» (Pie.tsx:13-15) y reintroduciría
// la divergencia texto/href que F-02 existe para matar. `instagramHref` deriva la URL desde el handle.
const HOST_INSTAGRAM = 'https://www.instagram.com/'
const PREFIJO_HANDLE = '@'

// El cuerpo del usuario de Instagram: letras, dígitos, punto y guion bajo (así es «nailslash.studio_»).
// El ancla ^…$ exige que TODO el cuerpo sea válido: un cuerpo vacío («@») o con un espacio en medio
// («@nails lash») NO es plausible y se rechaza. Falla cerrada, hermana de NUMERO_NACIONAL_VALIDO.
const USUARIO_INSTAGRAM_VALIDO = /^[a-zA-Z0-9._]+$/

export function instagramHref(handle: string): string {
  if (!handle.startsWith(PREFIJO_HANDLE)) {
    // D-1a: el dato canónico SIEMPRE trae el "@"; sin él NO se deriva (no emitir algo que no llegó en
    // su forma canónica). Es la exigencia del "@" inicial, un predicado propio y mutable (@s3, @s13).
    throw new Error('el handle de Instagram debe empezar por "@"')
  }

  const usuario = handle.slice(PREFIJO_HANDLE.length)

  if (!USUARIO_INSTAGRAM_VALIDO.test(usuario)) {
    // Falla ruidosa: ante un cuerpo vacío o inválido se lanza en vez de emitir un
    // "https://www.instagram.com//" a medias que parezca válido.
    throw new Error('el handle de Instagram no es válido')
  }

  return `${HOST_INSTAGRAM}${usuario}/`
}

/**
 * Proyección del NAP a la forma que consume la puerta de F-01 (A-12): la vía por FLAG, hoy
 * alimentada desde el humilde tools/puerta-placeholders.ts. SOLO datos verificados, todos con
 * esPlaceholder:false. El EMAIL NO entra (A-11 diferido): mientras no figure, la puerta no
 * rompe el build por flag y el build de producción sigue verde (@s10).
 */
function verificado(ubicacion: string, valor: string): RegistroDatos {
  return { ubicacion, valor, esPlaceholder: false }
}

export const registros: readonly RegistroDatos[] = [
  verificado('site.nombre', NOMBRE),
  verificado('site.direccion.centroComercial', DIRECCION.centroComercial),
  verificado('site.direccion.via', DIRECCION.via),
  verificado('site.direccion.local', DIRECCION.local),
  verificado('site.direccion.planta', DIRECCION.planta),
  verificado('site.direccion.codigoPostal', DIRECCION.codigoPostal),
  verificado('site.direccion.localidad', DIRECCION.localidad),
  verificado('site.telefono', TELEFONO.legible),
  verificado('site.horario.lunesAViernes', HORARIO.lunesAViernes),
  verificado('site.horario.sabado', HORARIO.sabado),
  verificado('site.horario.domingo', HORARIO.domingo),
  verificado('site.geo.latitud', String(GEO.latitud)),
  verificado('site.geo.longitud', String(GEO.longitud)),
  verificado('site.redes.instagram', REDES.instagram),
  verificado('site.redes.facebook', REDES.facebook),
]
