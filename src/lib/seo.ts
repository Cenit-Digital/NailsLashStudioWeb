/**
 * La capa PURA del SEO (F-04): compone el título, la canónica y el JSON-LD.
 *
 * Contrato: features/cascaron_semantico.feature.
 * No lee ficheros, ni el reloj, ni `process.env`, y no decide códigos de salida. Quien lee el
 * artefacto y decide es la puerta (src/lib/puerta-cascaron.ts); el cableado con node:fs vive
 * en tools/puerta-cascaron.ts. Mismo reparto que F-01 y F-03.
 */
import type { RegistroDatos } from './placeholders.ts'
import { NOMBRE, telHref } from './site.ts'

/**
 * El reclamo de la home. Las categorías reales del negocio son Uñas · Pestañas · Cejas [V]:
 * «Facial» NO EXISTE en este negocio, y la localidad es «Las Rozas de Madrid», NUNCA
 * «Las Ceudas» (el bug confirmado del JSON-LD del cliente).
 */
const RECLAMO = 'Uñas, pestañas y cejas en Las Rozas de Madrid'

const SEPARADOR = ' · '

/** El error de esta capa. Falla ruidosa: un mensaje que acusa, nunca un error mudo. */
export class ErrorDeSeo extends Error {}

/** @s3: acusa la causa, no gruñe. Exportado para que el test lo ancle sin recomponerlo. */
export const MOTIVO_SIN_NOMBRE = 'la página no tiene nombre: no hay título que componer'

/**
 * 🚨 @s10 — EL MOTIVO DEL RECHAZO DEL IDENTIFICADOR FISCAL.
 *
 * NO ECHA EL IDENTIFICADOR, Y ES DELIBERADO: 8 dígitos es exactamente un DNI sin su letra, o sea
 * verosímilmente DATO PERSONAL de una persona física [I sobre [V]]. Repetirlo aquí lo publicaría
 * en los logs del build. Es el 3er y el 4º `And` del escenario.
 */
export const MOTIVO_DEL_RECHAZO =
  'el identificador fiscal recibido no cumple el formato legal: se RECHAZA y bloquea la publicación. NO se completa, NO se corrige, NO se infiere — derivar el carácter de verificación NO acredita titularidad y publicaría un dato personal.'

/** La home no lleva sección: su forma es la INVERSA de las interiores. Son dos ramas. */
const PAGINA_HOME = 'home'

/**
 * La composición FIJADA por A-22 (cerrada por el humano 2026-07-16):
 *   home  → `${marca} · ${reclamo}`
 *   resto → `${sección} · ${marca}`  ← MARCA AL FINAL: lo distintivo primero.
 *
 * Es CRITERIO DE PROYECTO/SEO, JAMÁS `SC 2.4.2`: el listón normativo es «describe topic or
 * purpose», con CERO requisito de unicidad [V]. Fijar la composición es decisión NUESTRA.
 */
export function componerTitulo(pagina: string): string {
  if (pagina === '') {
    // Falla cerrada (@s3): ante la nada, lanzar. Devolver « · Nails Lash Studio» pasaría la
    // puerta (@s13 solo exige «no vacío») y sería basura en la SERP.
    throw new ErrorDeSeo(MOTIVO_SIN_NOMBRE)
  }

  return pagina === PAGINA_HOME
    ? `${NOMBRE}${SEPARADOR}${RECLAMO}`
    : `${pagina}${SEPARADOR}${NOMBRE}`
}

/**
 * Un origen es absoluto si es UNA URL VÁLIDA Y ES *SOLO* SU ORIGEN: esquema + autoridad, sin
 * ruta, sin query y sin fragmento.
 *
 * SE USA `URL` Y NO UN REGEX, Y ES UNA DECISIÓN TOMADA POR LA MUTACIÓN, NO POR GUSTO. El regex
 * `/^https?:\/\/[^/?#\s]+$/` dejaba TRES MUTANTES VIVOS que ningún escenario de @s6 podía matar
 * —quitar el `^`, quitar el `$` y quitar el `?`— porque su tabla fija «vacío», «relativo» y «sin
 * esquema», y ninguno de esos tres casos los distingue. Matarlos habría exigido FILAS NUEVAS en
 * el contrato (puerta humana). `URL` los elimina POR DISEÑO: no hay ancla que quitar.
 * (Precedente literal: el `^` de `HEX_VALIDO` fue el superviviente REAL de F-03, y F-03 zanjó que
 * los equivalentes se quitan CAMBIANDO EL DISEÑO, no excluyéndolos.)
 *
 * `new URL(x).origin === x` es la comprobación entera: `new URL` LANZA ante lo relativo y lo
 * desnudo, y `origin` NORMALIZA —«https://x/y» tiene origen «https://x» ≠ la entrada—, así que
 * una ruta pegada se rechaza sola. Sin ese `===`, «https://x/y» compondría «https://x/y/servicios».
 */
function esOrigenAbsoluto(origen: string): boolean {
  // `URL.canParse` y NO un `try/catch`, y también lo decidió la mutación: con
  // `catch { return false }` el mutante `catch {}` es EQUIVALENTE —la función devuelve
  // `undefined`, que es falsy igual que `false`, así que NINGÚN test puede distinguirlos— y un
  // equivalente no se mata: solo se excluye. Sin `catch` no hay equivalente que excluir.
  // El `&&` es de cortocircuito A PROPÓSITO: `new URL` LANZA sobre lo impareseable, así que
  // invertirlo a `||` haría escapar un TypeError en vez del ErrorDeSeo del contrato — y por eso
  // el mutante `||` muere en @s6 en vez de sobrevivir.
  return URL.canParse(origen) && new URL(origen).origin === origen
}

/**
 * La canónica es POR PÁGINA (@s5, @s14): concatena el origen RECIBIDO con la ruta. El origen
 * se recibe —no se lee de una constante— porque el dominio final es decisión del CLIENTE
 * [NV]: así esta función queda probada HOY y el dato real entra sin tocar código (A-21).
 */
export function canonicaDe(ruta: string, origen: string): string {
  if (!esOrigenAbsoluto(origen)) {
    // Falla cerrada (@s6): una canónica sobre un origen roto es sintácticamente plausible y
    // semánticamente basura — la puerta vería «una canónica» y pasaría.
    throw new ErrorDeSeo(`el origen "${origen}" no es una URL absoluta: no hay canónica que componer`)
  }

  return `${origen}${ruta}`
}

/** El NAP que consume el JSON-LD. Lo provee la fuente única de F-02 (`src/lib/site.ts`). */
export interface DatosNegocio {
  readonly nombre: string
  readonly direccion: {
    readonly centroComercial: string
    readonly via: string
    readonly local: string
    readonly planta: string
    readonly codigoPostal: string
    readonly localidad: string
  }
  readonly telefono: string
  readonly geo: { readonly latitud: number; readonly longitud: number }
  /**
   * El identificador fiscal (NIF/CIF). OPCIONAL, y HOY NO EXISTE NINGUNO VÁLIDO: el
   * «10656940» del JSON-LD del cliente NO lo es [V] (@s10). Si llega, se RECHAZA.
   */
  readonly identificadorFiscal?: string
}

export interface DireccionPostal {
  readonly '@type': string
  readonly streetAddress: string
  readonly postalCode: string
  readonly addressLocality: string
}

export interface Coordenadas {
  readonly latitude: number
  readonly longitude: number
}

export interface JsonLdNegocio {
  readonly '@context': string
  readonly '@type': string
  readonly name: string
  readonly address: DireccionPostal
  readonly geo: Coordenadas
  readonly telephone: string
}

const CONTEXTO_SCHEMA_ORG = 'https://schema.org'

/**
 * El subtipo MÁS ESPECÍFICO, respaldado por Google: «Use the most specific LocalBusiness
 * sub-type possible» [V]. La jerarquía REAL de schema.org tiene HERENCIA MÚLTIPLE:
 *   Thing > Organization > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
 *   Thing > Place        > LocalBusiness > HealthAndBeautyBusiness > BeautySalon
 * El padre DIRECTO es HealthAndBeautyBusiness; LocalBusiness es ANCESTRO. Es esa RUTA DUAL lo
 * que hace válidas a la vez `address` (vía Organization) y `geo` (vía Place).
 */
const TIPO_ACORDADO = 'BeautySalon'

/**
 * DECISIÓN DE PROYECTO más estricta que el vocabulario: schema.org ADMITE `Text` en `address`
 * —un string PASARÍA su validación [V]—. Exigir PostalAddress es NUESTRO, informado por el
 * requisito de GOOGLE para la elegibilidad de rich result. schema.org NO OBLIGA A NADA.
 */
const TIPO_DIRECCION = 'PostalAddress'

const PREFIJO_TEL = 'tel:'

/** El teléfono en E.164, DERIVADO de la fuente única (I-7): el href y el JSON-LD no divergen. */
function telefonoE164(telefono: string): string {
  return telHref(telefono).slice(PREFIJO_TEL.length)
}

/** La calle, compuesta de las partes ESTRUCTURADAS de F-02. @s21 exige que no esté vacía. */
function calleDe(direccion: DatosNegocio['direccion']): string {
  return `${direccion.via}, ${direccion.local}, ${direccion.planta}, ${direccion.centroComercial}`
}

/**
 * El JSON-LD ESCRITO DE CERO (T-6). Copiar el del cliente propagaría sus DOS bugs [V]:
 * `addressLocality: "Las Ceudas"` y el `vatID` malformado.
 *
 * LAS PROPIEDADES AUSENTES LO ESTÁN A PROPÓSITO, y cada una por su razón (@s9):
 *   - `legalName`  → la RAZÓN SOCIAL es DESCONOCIDA [V]. Emitirla sería INVENTARLA.
 *   - `vatID`      → NO HAY NINGÚN NIF/CIF VÁLIDO [V] (@s10).
 *   - `email`      → A-11 ABIERTA: no se emite hasta que el cliente lo confirme.
 *   - reseñas      → T-6 (@s22).
 *   - horario      → A-19: es de F-10. Cuando entre, `openingHoursSpecification` (@s35).
 *   - `priceRange` → A-20: los precios REALES están BLOQUEADOS (B-5/F-09) → sería INVENTARLO.
 */
export function construirJsonLd(datos: DatosNegocio): JsonLdNegocio {
  if (datos.identificadorFiscal !== undefined) {
    // 🚨 SE RECHAZA. NO SE COMPLETA, NO SE CORRIGE, NO SE INFIERE, NO SE DERIVA (@s10).
    //
    // POR QUÉ SE RECHAZA *CUALQUIER* IDENTIFICADOR Y NO SOLO EL MALFORMADO: porque HOY NO
    // EXISTE NINGUNO VÁLIDO. El único que hay en fuente pública es el «10656940» del JSON-LD
    // del cliente, y NO cumple el formato legal —ni CIF (Orden EHA/451/2008 art. 2: NUEVE
    // caracteres) ni NIF de persona física (RD 1065/2007 art. 19.1: DNI + letra de control)
    // [V]—. El contrato prohíbe expresamente el camino positivo: «NO HAY ESCENARIO DEL CAMINO
    // POSITIVO, Y ES DELIBERADO: no existe ningún identificador válido que probar. FINGIR UNO
    // SERÍA INVENTARLO». Implementar aquí una rama «válido» que ningún test rojo pide sería
    // producción sin test (Ley 1) y un mutante inmortal. B-1/B-2 SIGUEN BLOQUEADAS.
    //   → El día que el CLIENTE aporte un identificador verificado, hace falta un ESCENARIO
    //     NUEVO en el .feature (puerta humana), no un parche aquí.
    //
    // LA VALIDACIÓN ES FORMAL, y se declara: NO calcula el módulo 23 y NO acredita titularidad.
    // Pasar una comprobación de formato NO ES ACREDITACIÓN.
    //
    // EL MENSAJE NO ECHA EL IDENTIFICADOR, y es deliberado: 8 dígitos es exactamente un DNI sin
    // su letra, o sea, verosímilmente DATO PERSONAL de una persona física [I sobre [V]].
    // Repetirlo aquí lo publicaría en los logs del build.
    throw new ErrorDeSeo(MOTIVO_DEL_RECHAZO)
  }

  return {
    '@context': CONTEXTO_SCHEMA_ORG,
    '@type': TIPO_ACORDADO,
    name: datos.nombre,
    address: {
      '@type': TIPO_DIRECCION,
      streetAddress: calleDe(datos.direccion),
      postalCode: datos.direccion.codigoPostal,
      addressLocality: datos.direccion.localidad,
    },
    geo: { latitude: datos.geo.latitud, longitude: datos.geo.longitud },
    telephone: telefonoE164(datos.telefono),
  }
}

/**
 * 🔴 EL ORIGEN DE LA CANÓNICA — UN PLACEHOLDER, Y ESO ES LA FEATURE, NO UN APAÑO (@s34, A-21).
 *
 * EL DOMINIO FINAL NO ESTÁ DECIDIDO [NV]: migrar `nailslashlasrozas.es` con una 301 es DECISIÓN
 * DEL CLIENTE, y NO SE INVENTA. `https://example.invalid` es TLD RESERVADO por RFC 2606:
 * IMPOSIBLE de confundir con una decisión de dominio, y por tanto imposible de publicar por
 * descuido creyendo que es el bueno.
 *
 * Es LA DECISIÓN 9 DEL PROYECTO, LITERAL: *el contenido no verificado vive en una capa explícita
 * y es ESTRUCTURALMENTE IMPOSIBLE publicarlo por accidente*.
 *
 * CUANDO EL CLIENTE DECIDA EL DOMINIO: se cambia ESTE DATO y el flag a `false`. SIN TOCAR CÓDIGO.
 */
export const ORIGEN_CANONICA = 'https://example.invalid'

/**
 * La proyección de la capa de datos de F-04 a la forma que consume la puerta de F-01.
 *
 * 🔴 F-04 NO DUPLICA LA PUERTA DE F-01: SE APOYA EN ELLA (@s34). El origen entra aquí como
 * registro con `esPlaceholder: true` y la puerta de placeholders lo caza POR LA VÍA DEL FLAG,
 * rompiendo el build de PRODUCCIÓN. Una segunda puerta que comprobara lo mismo divergiría de la
 * primera en seis meses.
 *
 * VA SEPARADO de los `registros` de F-02 —y no dentro de ellos— porque el contrato de F-02
 * (@s10 de `datos_negocio_fuente_unica`) fija que SUS registros son TODOS `esPlaceholder:false`
 * y que su puerta no emite ninguna violación. Meter aquí el origen rompería ESE contrato. El
 * humilde los CONCATENA: cada feature declara los suyos.
 */
export const registrosSeo: readonly RegistroDatos[] = [
  { ubicacion: 'seo.origenCanonica', valor: ORIGEN_CANONICA, esPlaceholder: true },
]
