/**
 * Citas · Fase 7 (issue #39): la carga perezosa de Cloudflare Turnstile (decisión 3, enmienda de F-05).
 * El script no está en el HTML horneado: se inyecta una sola vez, la primera vez que se pide, y la
 * promesa se reutiliza. Si falla, se olvida para poder reintentarlo. Fino y fuera de la mutación: lo
 * prueba reserva-citas.test.tsx.
 */
export interface OpcionesWidget {
  sitekey: string
  language: string
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
}

export interface TurnstileApi {
  render: (caja: HTMLElement, opciones: OpcionesWidget) => string
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let carga: Promise<TurnstileApi> | null = null

export function cargarTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  carga ??= new Promise<TurnstileApi>((resolver, rechazar) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => (window.turnstile ? resolver(window.turnstile) : rechazar(new Error()))
    script.onerror = () => {
      carga = null
      script.remove()
      rechazar(new Error('turnstile'))
    }
    document.head.append(script)
  })
  return carga
}
