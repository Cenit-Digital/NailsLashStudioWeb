/**
 * Inspección de placeholders — la capa PURA de la puerta (F-01).
 *
 * Contrato: features/puerta_placeholders.feature.
 * No lee ficheros, ni el reloj, ni el entorno, y no decide códigos de salida:
 * recibe lo que tiene que examinar y devuelve la lista de violaciones. Quien lee,
 * decide el exit code y se engancha al build es la puerta (src/lib/puerta.ts).
 */

export interface RegistroDatos {
  readonly ubicacion: string
  readonly valor: string
  readonly esPlaceholder: boolean
}

export interface FicheroArtefacto {
  readonly ubicacion: string
  readonly contenido: string
}

export interface EntradaInspeccion {
  readonly registros?: readonly RegistroDatos[]
  readonly ficheros?: readonly FicheroArtefacto[]
}

/** Los seis patrones prohibidos acordados en el contrato (§ DOS VÍAS). */
export const PATRONES_PROHIBIDOS = [
  'IMAGEN TEMPORAL',
  'Plantilla de demostración',
  '600123456',
  'hola@nailslashstudio.com',
  'Calle de la Belleza',
  'ph-woman',
] as const

/**
 * Familia TELÉFONO (A-9): se comparan los dígitos ignorando espacios, guiones y prefijo
 * internacional. Sin esto, "+34 600 123 456" —que es exactamente lo que escribe el
 * prototipo— escapa, y es el placeholder más peligroso de la lista.
 *
 * El normalizador es deliberadamente estrecho: solo el espacio y el guion separan. Nada
 * de `\s`, que uniría "600" al final de una línea con "123456" al principio de la
 * siguiente e inventaría un teléfono que no está escrito.
 */
const PATRON_TELEFONO = '600123456'
const SECUENCIA_TELEFONICA = /\+?\d+(?:[ -]+\d+)*/g
const SEPARADORES_DE_TELEFONO = /[ -]/g
const PREFIJOS_INTERNACIONALES = ['+34', '0034']

/**
 * Familia TEXTO (A-9): comparación insensible a mayúsculas/minúsculas y a acentos.
 *
 * Se normaliza carácter a carácter y se guarda de qué índice del original salió cada
 * carácter normalizado. Así la violación puede devolver el texto **tal como aparece** en
 * el artefacto («PLANTILLA DE DEMOSTRACIÓN»), y no el patrón canónico: el informe tiene
 * que acusar lo que hay escrito, que es lo que alguien va a buscar para arreglarlo.
 */
const DIACRITICOS = /\p{Diacritic}/gu

interface TextoNormalizado {
  readonly normalizado: string
  readonly indiceOriginal: readonly number[]
}

function normalizarTexto(texto: string): TextoNormalizado {
  let normalizado = ''
  const indiceOriginal: number[] = []

  for (let i = 0; i < texto.length; i++) {
    // El sentido del plegado de caja es indiferente: se aplica a AMBAS caras de la
    // comparación (contenido y patrón pasan por esta misma función), así que toLowerCase
    // y toUpperCase dan el mismo match, y el `valor` se toma del contenido ORIGINAL, no del
    // normalizado. Solo un carácter de plegado asimétrico (ß→SS) los distinguiría, y ninguno
    // de los 6 patrones del contrato lo tiene: mutante equivalente. Justificado en
    // progress/mutation_puerta_placeholders.md (política docs/mutation-testing.md §78-80).
    // Stryker disable next-line all
    const enMinuscula = texto[i].toLowerCase()
    const equivalente = enMinuscula.normalize('NFD').replace(DIACRITICOS, '')

    for (const caracter of equivalente) {
      normalizado += caracter
      indiceOriginal.push(i)
    }
  }

  return { normalizado, indiceOriginal }
}

/** Una aparición concreta de un patrón: el texto tal cual está escrito y dónde está. */
interface Coincidencia {
  readonly texto: string
  readonly posicion: number
}

function coincidenciasDeTexto(patron: string, contenido: string): Coincidencia[] {
  const { normalizado, indiceOriginal } = normalizarTexto(contenido)
  const patronNormalizado = normalizarTexto(patron).normalizado
  const encontradas: Coincidencia[] = []

  let desde = normalizado.indexOf(patronNormalizado)

  while (desde !== -1) {
    const inicio = indiceOriginal[desde]
    const fin = indiceOriginal[desde + patronNormalizado.length - 1] + 1

    encontradas.push({ texto: contenido.slice(inicio, fin), posicion: inicio })
    desde = normalizado.indexOf(patronNormalizado, desde + patronNormalizado.length)
  }

  return encontradas
}

function digitosDeTelefono(secuencia: string): string {
  const compacta = secuencia.replace(SEPARADORES_DE_TELEFONO, '')

  for (const prefijo of PREFIJOS_INTERNACIONALES) {
    if (compacta.startsWith(prefijo)) {
      return compacta.slice(prefijo.length)
    }
  }

  return compacta
}

function coincidenciasDeTelefono(contenido: string): Coincidencia[] {
  const encontradas: Coincidencia[] = []

  for (const secuencia of contenido.matchAll(SECUENCIA_TELEFONICA)) {
    if (digitosDeTelefono(secuencia[0]) === PATRON_TELEFONO) {
      encontradas.push({ texto: secuencia[0], posicion: secuencia.index })
    }
  }

  return encontradas
}

/** Cada patrón pertenece a una familia y se compara con las reglas de su familia (A-9). */
function coincidenciasDelPatron(patron: string, contenido: string): Coincidencia[] {
  return patron === PATRON_TELEFONO
    ? coincidenciasDeTelefono(contenido)
    : coincidenciasDeTexto(patron, contenido)
}

export type MotivoFlag = 'marcado' | 'sin_declarar'

export interface ViolacionPorFlag {
  readonly via: 'flag'
  readonly motivo: MotivoFlag
  readonly ubicacion: string
  readonly valor: string
}

export interface ViolacionPorPatron {
  readonly via: 'patron'
  readonly patron: string
  readonly ubicacion: string
  readonly valor: string
}

export type Violacion = ViolacionPorFlag | ViolacionPorPatron

/**
 * Falla cerrada: solo un `esPlaceholder: false` explícito absuelve al registro. El tipo
 * exige el flag en compilación, pero los datos que llegan de JSON esquivan al tipo, así
 * que aquí se lee como lo que realmente puede ser en tiempo de ejecución.
 */
function motivoDelFlag(registro: RegistroDatos): MotivoFlag | null {
  const flag: boolean | undefined = registro.esPlaceholder

  if (flag === false) {
    return null
  }

  return flag === true ? 'marcado' : 'sin_declarar'
}

/**
 * Dentro de un contenido manda la POSICIÓN, no el orden de la lista de patrones (D-3).
 * El `sort` de JS es estable, así que dos apariciones en la misma posición conservan el
 * orden de la lista y la salida sigue siendo determinista (@s9).
 */
function violacionesPorPatron(ubicacion: string, contenido: string): ViolacionPorPatron[] {
  const apariciones: { patron: string; coincidencia: Coincidencia }[] = []

  for (const patron of PATRONES_PROHIBIDOS) {
    for (const coincidencia of coincidenciasDelPatron(patron, contenido)) {
      apariciones.push({ patron, coincidencia })
    }
  }

  return apariciones
    .sort((una, otra) => una.coincidencia.posicion - otra.coincidencia.posicion)
    .map(({ patron, coincidencia }) => ({
      via: 'patron',
      patron,
      ubicacion,
      valor: coincidencia.texto,
    }))
}

export function detectarPlaceholders(entrada: EntradaInspeccion): Violacion[] {
  const violaciones: Violacion[] = []

  for (const registro of entrada.registros ?? []) {
    const motivo = motivoDelFlag(registro)

    if (motivo !== null) {
      violaciones.push({
        via: 'flag',
        motivo,
        ubicacion: registro.ubicacion,
        valor: registro.valor,
      })
    }

    // Vía independiente, no alternativa: si el registro dispara las dos, son DOS
    // infracciones y el informe acusa las dos.
    violaciones.push(...violacionesPorPatron(registro.ubicacion, registro.valor))
  }

  for (const fichero of entrada.ficheros ?? []) {
    violaciones.push(...violacionesPorPatron(fichero.ubicacion, fichero.contenido))
  }

  return violaciones
}
