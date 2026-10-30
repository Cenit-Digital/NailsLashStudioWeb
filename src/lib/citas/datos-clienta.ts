/**
 * Citas · Fase 7 (issue #39): los datos del paso «Tus datos» (@s17-@s18). Las reglas son las MISMAS
 * que `api/src/validacion.ts` (la tabla de casos de datos-clienta.test.ts se ejecuta contra los dos):
 * un dato que el modal da por bueno no puede volver del servidor como 400.
 */
export type CampoClienta = 'nombre' | 'telefono' | 'email'

export interface DatosClienta {
  readonly nombre: string
  readonly telefono: string
  readonly email: string
}

export type ErroresDatos = Partial<Record<CampoClienta, string>>

export interface ResultadoDatos {
  readonly ok: boolean
  readonly errores: ErroresDatos
  /** Los datos con `trim`, tal como se envían. */
  readonly datos: DatosClienta
}

/** El mensaje de @s18 que va junto a cada campo. */
export function mensajeDeCampo(campo: CampoClienta): string {
  switch (campo) {
    case 'nombre':
      return 'Escribe tu nombre'
    case 'telefono':
      return 'Escribe un teléfono de al menos 9 cifras'
    default:
      return 'Escribe un email válido, como ana@mail.es'
  }
}

function sinControl(texto: string): boolean {
  return Array.from(texto).every((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) !== 127)
}

function nombreValido(nombre: string): boolean {
  return nombre.length > 0 && nombre.length <= 80 && sinControl(nombre)
}

function telefonoValido(telefono: string): boolean {
  return (
    telefono.length <= 20 &&
    /^[\d +()-]+$/.test(telefono) &&
    telefono.replace(/\D/g, '').length >= 9
  )
}

function emailValido(email: string): boolean {
  return email.length <= 254 && /^[\w.%+-]+@[\w.-]+\.[a-z]{2,}$/i.test(email)
}

export function validarDatos(entrada: DatosClienta): ResultadoDatos {
  const datos = {
    nombre: entrada.nombre.trim(),
    telefono: entrada.telefono.trim(),
    email: entrada.email.trim(),
  }
  const validos: Record<CampoClienta, boolean> = {
    nombre: nombreValido(datos.nombre),
    telefono: telefonoValido(datos.telefono),
    email: emailValido(datos.email),
  }
  const errores: ErroresDatos = Object.fromEntries(
    (Object.keys(validos) as CampoClienta[])
      .filter((campo) => !validos[campo])
      .map((campo) => [campo, mensajeDeCampo(campo)]),
  )
  return { ok: Object.keys(errores).length === 0, errores, datos }
}

/** El `campo` de un 400 del servidor, si es uno que la clienta puede corregir en «Tus datos». */
export function campoDeLaClienta(campo: unknown): CampoClienta | null {
  return campo === 'nombre' || campo === 'telefono' || campo === 'email' ? campo : null
}
