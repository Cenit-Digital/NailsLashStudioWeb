/**
 * Citas · Fase 7 (issue #39): si la vía de citas está encendida y con qué. Decisiones de Pablo del
 * 2026-10-30:
 * - `VITE_CITAS_API` es el host de la API (se monta en la Fase 8). Sin valor, la vía está apagada: el
 *   modal no se monta y los dos botones de D-13 siguen siendo enlaces a `#reserva-titulo` (@s4).
 * - `VITE_TURNSTILE_SITEKEY` es la clave PÚBLICA de Turnstile (@s28). Sin valor, la de pruebas de
 *   Cloudflare (widget visible que siempre pasa; su pareja de servidor es
 *   `1x0000000000000000000000000000000AA`).
 *
 * Recibe el entorno como argumento (en la app, `import.meta.env`) para probar los dos lados.
 */
export interface EntornoCitas {
  readonly VITE_CITAS_API?: string
  readonly VITE_TURNSTILE_SITEKEY?: string
}

export interface ConfigCitas {
  /** Sin barra final: las rutas se le añaden con `/dias`, `/horas`, `/reservas`. */
  readonly api: string
  readonly sitekey: string
}

export function configCitas(entorno: EntornoCitas): ConfigCitas | null {
  const api = (entorno.VITE_CITAS_API ?? '').trim().replace(/\/+$/, '')
  if (api === '') return null
  const sitekey = (entorno.VITE_TURNSTILE_SITEKEY ?? '').trim()
  return { api, sitekey: sitekey === '' ? '1x00000000000000000000AA' : sitekey }
}
