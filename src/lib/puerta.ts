/**
 * La PUERTA — la capa que lee, invoca la inspección y decide el código de salida (F-01).
 *
 * Contrato: features/puerta_placeholders.feature.
 * La inspección (src/lib/placeholders.ts) es pura y no sabe de ficheros ni de exit codes.
 * Aquí vive lo que decide; en tools/puerta-placeholders.ts solo el cableado con node:fs.
 */
// La extensión .ts es explícita a propósito: este módulo lo carga Node directamente (vía el
// humilde de tools/, con --experimental-strip-types) y el type stripping no resuelve
// especificadores sin extensión. `tsconfig.json` ya trae `allowImportingTsExtensions`.
import {
  detectarPlaceholders,
  type FicheroArtefacto,
  type RegistroDatos,
  type Violacion,
} from './placeholders.ts'

export type ModoBuild = 'produccion' | 'desarrollo'

/** El único contacto de la puerta con el mundo. Lo cablea el humilde de tools/. */
export interface SistemaDeFicheros {
  listarFicheros(directorio: string): string[]
  leer(ruta: string): string
}

export interface PeticionPuerta {
  readonly modo: ModoBuild
  readonly registros: readonly RegistroDatos[]
  readonly ficheros: SistemaDeFicheros
}

export interface ResultadoPuerta {
  readonly codigoSalida: number
  readonly lineas: readonly string[]
}

/**
 * Se escanea el ARTEFACTO, no el repositorio (@s19): "project-spec.md" cita los patrones
 * legítimamente y no se despliega. De aquí sale además @s18 gratis: el módulo de la puerta
 * vive en src/, nunca en dist/, así que no hace falta lista de exclusión — y no hacerla es
 * lo que evita el coladero de excluir "todo lo que se parezca al módulo".
 */
const DIRECTORIO_ARTEFACTO = 'dist'

const CODIGO_EXITO = 0
const CODIGO_FALLO = 1

/** Acusar, no gruñir: cada línea dice QUÉ lo disparó, DÓNDE está y con QUÉ valor. */
function describirViolacion(violacion: Violacion): string {
  const causa =
    violacion.via === 'patron' ? `patrón "${violacion.patron}"` : 'flag esPlaceholder'

  return `${causa} en ${violacion.ubicacion}: "${violacion.valor}"`
}

function leerArtefacto(ficheros: SistemaDeFicheros): FicheroArtefacto[] {
  return ficheros
    .listarFicheros(DIRECTORIO_ARTEFACTO)
    .map((ruta) => ({ ubicacion: ruta, contenido: ficheros.leer(ruta) }))
}

function motivoDelReventon(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function ejecutarPuerta(peticion: PeticionPuerta): ResultadoPuerta {
  let violaciones: Violacion[]

  try {
    violaciones = detectarPlaceholders({
      registros: peticion.registros,
      ficheros: leerArtefacto(peticion.ficheros),
    })
  } catch (error: unknown) {
    // Falla cerrada: ante la duda, build roto, nunca build verde. Tragarse la excepción y
    // devolver [] sería peor que no tener puerta, porque además daría confianza (@s22).
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: [`la puerta no pudo completar la inspección: ${motivoDelReventon(error)}`],
    }
  }

  const rompeElBuild = peticion.modo === 'produccion' && violaciones.length > 0

  return {
    codigoSalida: rompeElBuild ? CODIGO_FALLO : CODIGO_EXITO,
    lineas: violaciones.map(describirViolacion),
  }
}
