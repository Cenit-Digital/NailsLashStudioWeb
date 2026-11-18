/**
 * Adaptador del chat de IA de Nailbot (issue #35, enmienda N-1bis/N-4bis de `project-spec.md`).
 *
 * Contrato REAL de `POST {url}/v1/chat` (Cenit-Digital/RAGchatbotIA, `apps/api/src/http/app.ts`):
 *   petición   { texto: string, conversacionId?: string }
 *   200        { conversacionId: string, respuesta: string,
 *                solicitud: null | { id, codigo, estado, enlaceWhatsApp } }
 *   400/404/413/429/500   { error: string }   (el cuerpo de un error NUNCA se lee ni se muestra)
 * El servidor antepone el aviso de IA del art. 50.1 (`AVISO_IA`) a la respuesta del primer turno.
 *
 * Todo fallo (red, estado no 2xx, tiempo agotado, cuerpo inválido) sale como el MISMO error saneado:
 * la vista vuelve entonces al guion local. Módulo sin React, sin storage y sin estado: el
 * identificador de conversación lo guarda la vista, solo en memoria (N-4bis).
 */

/** El entorno del build, como argumento (patrón de `configCitas`): se prueba por valor. */
export interface EntornoNailbotIA {
  readonly VITE_NAILBOT_API_URL?: string
}

export interface SolicitudNailbotIA {
  readonly codigo: string
  readonly enlaceWhatsApp: string
}

export interface RespuestaNailbotIA {
  readonly conversacionId: string
  readonly respuesta: string
  readonly solicitud: SolicitudNailbotIA | null
}

export interface OpcionesNailbotIA {
  /** Cancela la petición (la vista la dispara al desmontarse): sin fallback, nadie la espera. */
  readonly signal?: AbortSignal
  /** Para pruebas; por defecto `TIEMPO_MAXIMO_MS`. */
  readonly tiempoMs?: number
}

/** N-4bis: el texto libre se acota a 1000 caracteres. */
export const LIMITE_TEXTO = 1000

/**
 * Plazo de cada turno. El servidor corta el turno a los 60 s (`presupuestoMs` en
 * `packages/nucleo/src/agente/bucle.ts` de RAGchatbotIA): 75 s deja margen de red por encima.
 */
export const TIEMPO_MAXIMO_MS = 75_000

interface DatosRespuesta {
  readonly conversacionId?: unknown
  readonly respuesta?: unknown
  readonly solicitud?: { readonly codigo?: unknown; readonly enlaceWhatsApp?: unknown } | null
}

/**
 * La URL base de la API, sin barra final, o `null` si el build no la define (o está en blanco):
 * entonces no hay modo IA y rige el guion local de N-1/N-4.
 */
export function urlNailbotIA(entorno: EntornoNailbotIA): string | null {
  const url = (entorno.VITE_NAILBOT_API_URL ?? '').trim().replace(/\/+$/, '')
  return url === '' ? null : url
}

function errorDeContacto(): Error {
  return new Error('No se pudo contactar con el asistente.')
}

function textoNoVacio(valor: unknown): valor is string {
  return typeof valor === 'string' && valor.trim() !== ''
}

/** Un enlace de la API solo se pinta si empieza por `https://wa.me/` (criterio de la issue #35). */
function solicitudSegura(solicitud: DatosRespuesta['solicitud']): SolicitudNailbotIA | null {
  const codigo = solicitud?.codigo
  const enlace = solicitud?.enlaceWhatsApp
  if (!textoNoVacio(codigo) || !textoNoVacio(enlace)) return null
  return enlace.startsWith('https://wa.me/') ? { codigo, enlaceWhatsApp: enlace } : null
}

function interpretar(datos: DatosRespuesta): RespuestaNailbotIA {
  const { conversacionId, respuesta, solicitud } = datos
  if (!textoNoVacio(conversacionId) || !textoNoVacio(respuesta)) throw errorDeContacto()
  return { conversacionId, respuesta, solicitud: solicitudSegura(solicitud) }
}

/** El cuerpo JSON de la respuesta 2xx, o `{}` («sin datos») si el estado no es 2xx o el cuerpo es `null`. Lanza si falla la red. */
async function pedir(
  url: string,
  texto: string,
  conversacionId: string | undefined,
  opciones: OpcionesNailbotIA,
): Promise<DatosRespuesta> {
  // Un solo controlador para las dos causas de corte (plazo y cancelación de la vista); el plazo lo
  // gestiona un `setTimeout` (no `AbortSignal.timeout`) para que los temporizadores falsos lo manejen.
  const controlador = new AbortController()
  const cortar = () => controlador.abort()
  const temporizador = setTimeout(cortar, opciones.tiempoMs ?? TIEMPO_MAXIMO_MS)
  opciones.signal?.addEventListener('abort', cortar)
  try {
    const respuesta = await fetch(`${url}/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, conversacionId }),
      credentials: 'omit',
      redirect: 'error',
      signal: controlador.signal,
    })
    return respuesta.ok ? ((await respuesta.json()) ?? {}) : {}
  } finally {
    clearTimeout(temporizador)
    opciones.signal?.removeEventListener('abort', cortar)
  }
}

/**
 * Un turno de chat contra la API. `url` ya viene saneada por `urlNailbotIA`. Rechaza SIEMPRE con el
 * mismo error saneado (sin trazas ni cuerpos del servidor); el llamante decide el fallback.
 */
export async function responderIA(
  url: string,
  texto: string,
  conversacionId?: string,
  opciones: OpcionesNailbotIA = {},
): Promise<RespuestaNailbotIA> {
  let datos: DatosRespuesta
  try {
    datos = await pedir(url, texto, conversacionId, opciones)
  } catch {
    throw errorDeContacto()
  }
  return interpretar(datos)
}
