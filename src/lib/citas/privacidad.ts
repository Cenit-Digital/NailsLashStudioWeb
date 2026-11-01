/**
 * Citas · issue #41 (decisión 8): la política de privacidad de la vía de citas.
 *
 * Solo existe con la vía encendida (`VITE_CITAS_API`, la regla de `config.ts`). Los datos que solo
 * tiene el salón (A-29: razón social, NIF, email y plazo de conservación) son registros
 * `esPlaceholder: true` por la vía de F-16: con la vía encendida y sin rellenar, el build de
 * producción FALLA (D-9). Para rellenarlos: se cambia el valor y el flag a `false`, sin tocar más.
 *
 * Lo carga Node directamente (puerta de placeholders): imports con extensión y sin sintaxis que
 * el type stripping no borre. No lee el entorno: lo recibe (el humilde pasa el de Vite).
 */
import type { RegistroDatos } from '../placeholders.ts'
import { configCitas, type EntornoCitas } from './config.ts'

export interface DatosPrivacidad {
  readonly razonSocial: RegistroDatos
  readonly nif: RegistroDatos
  readonly email: RegistroDatos
  readonly conservacion: RegistroDatos
}

export function rutaPrivacidad(): string {
  return '/privacidad-citas'
}

/** `base` es `import.meta.env.BASE_URL` (acaba en barra); la página se hornea como carpeta (nested). */
export function urlPrivacidad(base: string): string {
  return `${base}privacidad-citas/`
}

export function hayPoliticaDePrivacidad(entorno: EntornoCitas): boolean {
  return configCitas(entorno) !== null
}

function pendiente(ubicacion: string, valor: string): RegistroDatos {
  return { ubicacion, valor, esPlaceholder: true }
}

export function datosPrivacidad(): DatosPrivacidad {
  return {
    razonSocial: pendiente('privacidad.razonSocial', '[PENDIENTE: razón social del salón]'),
    nif: pendiente('privacidad.nif', '[PENDIENTE: NIF del salón]'),
    email: pendiente('privacidad.email', '[PENDIENTE: email de contacto del salón]'),
    conservacion: pendiente(
      'privacidad.conservacion',
      '[PENDIENTE: plazo de conservación de los datos de la cita]',
    ),
  }
}

/** Lo que la puerta de placeholders añade a los registros de `site.ts`: nada si la vía está apagada. */
export function registrosDelBuild(entorno: EntornoCitas): readonly RegistroDatos[] {
  if (!hayPoliticaDePrivacidad(entorno)) return []
  const { razonSocial, nif, email, conservacion } = datosPrivacidad()
  return [razonSocial, nif, email, conservacion]
}

/**
 * El modo con el que vite-react-ssg carga la config y los `.env*`: `MODE || NODE_ENV || 'production'`
 * (cadena vacía cuenta como ausente, igual que `||`). La puerta de placeholders lo usa para leer el
 * mismo entorno que verá Vite; con otro modo podría hornearse la página sin que nadie la vigilara.
 */
export function modoDelBuild(entorno: Record<string, string | undefined>): string {
  return entorno.MODE || entorno.NODE_ENV || 'production'
}
