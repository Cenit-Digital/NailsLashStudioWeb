/**
 * Citas · Fase 8 (issue #41): caché corta de la ocupación para `GET /dias` y `/horas`. Cada apertura
 * del modal pide días y horas; sin caché, cada una sería un `freeBusy` contra Google. La reserva NO
 * pasa por aquí: vuelve a consultar dentro del candado (T-8), así que un dato de hace unos segundos
 * nunca da una doble reserva, como mucho un 409.
 *
 * - Guarda la PROMESA: dos peticiones a la vez comparten un solo cálculo.
 * - Un fallo no se guarda, para que la siguiente petición lo reintente.
 * - Si el reloj va hacia atrás, no se fía de lo guardado.
 * - `invalidar` la vacía (tras crear una cita, para que la hora ocupada deje de ofrecerse).
 */
export interface CacheCorta<T> {
  obtener(ahora: Date): Promise<T>
  invalidar(): void
}

export function crearCacheCorta<T>(
  milisegundos: number,
  calcular: (ahora: Date) => Promise<T>,
): CacheCorta<T> {
  let guardado: { readonly desde: number; readonly valor: Promise<T> } | undefined

  return {
    obtener(ahora) {
      const t = ahora.getTime()
      if (guardado !== undefined && t >= guardado.desde && t - guardado.desde < milisegundos) {
        return guardado.valor
      }
      const entrada = { desde: t, valor: calcular(ahora) }
      guardado = entrada
      entrada.valor.catch(() => {
        if (guardado === entrada) guardado = undefined
      })
      return entrada.valor
    },
    invalidar() {
      guardado = undefined
    },
  }
}
