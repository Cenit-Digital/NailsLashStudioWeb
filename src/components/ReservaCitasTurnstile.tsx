import { useEffect, useRef } from 'react'

import { cargarTurnstile } from '../lib/citas/turnstile'

/**
 * Citas · Fase 7 (issue #39): el widget de Cloudflare Turnstile del modal (@s26, @s28).
 *
 * Carga perezosa (decisión 3, enmienda de F-05): el script de challenges.cloudflare.com NO está en el
 * HTML horneado; se inyecta la primera vez que la clienta llega a «Tus datos» y se reutiliza después.
 * Para pedir un token nuevo (el token es de un solo uso) el modal remonta este componente con otra
 * `key`.
 */
export function ReservaCitasTurnstile({
  sitekey,
  alToken,
  alFallar,
}: {
  sitekey: string
  alToken: (token: string | null) => void
  alFallar: () => void
}) {
  const caja = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let vivo = true
    let id: string | undefined
    cargarTurnstile().then(
      (turnstile) => {
        if (!vivo || caja.current === null) return
        id = turnstile.render(caja.current, {
          sitekey,
          language: 'es',
          callback: (token) => alToken(token),
          'expired-callback': () => alToken(null),
          'error-callback': () => {
            alToken(null)
            alFallar()
          },
        })
      },
      () => {
        if (vivo) alFallar()
      },
    )
    return () => {
      vivo = false
      if (id !== undefined) window.turnstile?.remove(id)
      // Sin widget no hay `expired-callback`: el token que diera ya no vale (al volver, otro nuevo).
      alToken(null)
    }
  }, [sitekey, alToken, alFallar])

  return <div ref={caja} data-turnstile="" />
}
