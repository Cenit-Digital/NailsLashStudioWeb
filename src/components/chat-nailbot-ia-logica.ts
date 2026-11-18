export interface RespuestaNailbotIA {
  readonly conversacionId: string
  readonly respuesta: string
  readonly solicitud: { readonly codigo: string; readonly enlaceWhatsApp: string } | null
}

interface DatosRespuesta {
  readonly conversacionId?: unknown
  readonly respuesta?: unknown
  readonly solicitud?: { readonly codigo?: unknown; readonly enlaceWhatsApp?: unknown } | null
}

function errorDeContacto(): Error {
  return new Error('No se pudo contactar con el asistente.')
}

function textoNoVacio(valor: unknown): valor is string {
  return typeof valor === 'string' && valor.trim().length > 0
}

function enlaceSeguro(valor: string): string | null {
  try {
    const enlace = new URL(valor)
    if (enlace.origin !== 'https://wa.me' || enlace.username !== '' || enlace.password !== '')
      return null
    return enlace.href
  } catch {
    return null
  }
}

/** Adapta el contrato de chat sin conservar la conversación ni exponer errores del servidor. */
export async function responderIA(
  url: string,
  texto: string,
  conversacionId?: string,
  signal?: AbortSignal,
): Promise<RespuestaNailbotIA> {
  let datos: DatosRespuesta | null
  try {
    const respuesta = await fetch(`${url.replace(/\/+$/, '')}/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, conversacionId }),
      credentials: 'omit',
      redirect: 'error',
      signal,
    })
    datos = respuesta.ok ? ((await respuesta.json()) as DatosRespuesta | null) : null
  } catch {
    if (signal?.aborted) throw new DOMException('Operación cancelada.', 'AbortError')
    throw errorDeContacto()
  }
  const id = datos?.conversacionId
  const respuesta = datos?.respuesta
  if (!textoNoVacio(id) || !textoNoVacio(respuesta)) throw errorDeContacto()

  const solicitud = datos?.solicitud
  if (solicitud === null) return { conversacionId: id, respuesta, solicitud: null }
  const codigo = solicitud?.codigo
  const enlace = solicitud?.enlaceWhatsApp
  if (!textoNoVacio(codigo) || !textoNoVacio(enlace)) throw errorDeContacto()
  const enlaceWhatsApp = enlaceSeguro(enlace)
  return {
    conversacionId: id,
    respuesta,
    solicitud: enlaceWhatsApp === null ? null : { codigo, enlaceWhatsApp },
  }
}
