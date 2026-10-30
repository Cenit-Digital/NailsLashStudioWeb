import { ErrorServicio } from './errores.ts'

/**
 * Citas · Fase 6 (issue #37): verificación de Cloudflare Turnstile en el servidor (@s26).
 * Referencia: developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * Cada token vale una sola vez, pero `idempotency_key` permite repetir la validación del mismo token.
 * Se usa la clave de la reserva, así el doble clic (@s24) no se rechaza como `timeout-or-duplicate`.
 */

export interface DatosTurnstile {
  readonly secreto: string
  readonly token: string
  readonly ip: string | undefined
  readonly clave: string
  readonly fetch: typeof fetch
}

/** `true` si Cloudflare da el token por bueno; lanza `ErrorServicio` si el fallo es suyo. */
export async function verificarTurnstile(datos: DatosTurnstile): Promise<boolean> {
  const respuesta = await datos.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      secret: datos.secreto,
      response: datos.token,
      // Sin IP conocida, `undefined` desaparece al serializar: no se envía remoteip.
      remoteip: datos.ip,
      idempotency_key: datos.clave,
    }),
  })
  if (!respuesta.ok) throw new ErrorServicio(`turnstile: HTTP ${respuesta.status}`)

  const cuerpo = (await respuesta.json()) as { success?: unknown; 'error-codes'?: string[] }
  if (cuerpo['error-codes']?.includes('internal-error')) {
    throw new ErrorServicio('turnstile: internal-error')
  }

  return cuerpo.success === true
}
