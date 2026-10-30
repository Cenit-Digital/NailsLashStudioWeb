/**
 * Citas · Fase 6 (issue #37): la configuración del servidor, leída SOLO del entorno (@s28: ningún
 * secreto en el código, que es público). En el clúster llega por un Secret de K8s (Fase 8). Si falta
 * algo, el arranque falla nombrando las variables, nunca mostrando sus valores.
 */
export interface Config {
  readonly puerto: number
  /** Ids de los calendarios de las trabajadoras, en orden: «la primera libre» es la primera. */
  readonly calendarios: readonly string[]
  readonly google: {
    readonly clientId: string
    readonly clientSecret: string
    readonly refreshToken: string
    readonly remitente: string
  }
  readonly emailSalon: string
  readonly turnstileSecreto: string
  readonly databaseUrl: string
}

export function leerConfig(entorno: Record<string, string | undefined>): Config {
  const calendarios = (entorno.CITAS_CALENDARIOS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
  const obligatorias = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
    'CITAS_REMITENTE',
    'CITAS_EMAIL_SALON',
    'TURNSTILE_SECRETO',
    'DATABASE_URL',
  ]
  const faltan = [
    ...(calendarios.length === 0 ? ['CITAS_CALENDARIOS'] : []),
    ...obligatorias.filter((nombre) => (entorno[nombre] ?? '') === ''),
  ]
  if (faltan.length > 0) throw new Error(`Faltan variables de entorno: ${faltan.join(', ')}`)

  const puerto = Number(entorno.PORT ?? '8080')
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) throw new Error('PORT inválido')

  const v = entorno as Record<string, string>

  return {
    puerto,
    calendarios,
    google: {
      clientId: v.GOOGLE_CLIENT_ID,
      clientSecret: v.GOOGLE_CLIENT_SECRET,
      refreshToken: v.GOOGLE_REFRESH_TOKEN,
      remitente: v.CITAS_REMITENTE,
    },
    emailSalon: v.CITAS_EMAIL_SALON,
    turnstileSecreto: v.TURNSTILE_SECRETO,
    databaseUrl: v.DATABASE_URL,
  }
}
