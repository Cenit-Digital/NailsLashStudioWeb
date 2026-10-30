import type pg from 'pg'

import type { Candado } from './reservar.ts'

/**
 * Citas · Fase 6 (issue #37): el bloqueo de T-8 (enmendada) en PostgreSQL, un
 * `pg_advisory_xact_lock` por día de Madrid. Lo suelta el COMMIT o el ROLLBACK de la transacción, así
 * que una petición que muere a medias no deja el día bloqueado. No guarda ninguna fila ni dato
 * personal. Adaptador fino: lo cubre `candado-pg.integracion.test.ts` con un PostgreSQL real, no la
 * mutación (como los tests `*-horneado`).
 */
export function crearCandadoPg(pool: Pick<pg.Pool, 'connect'>): Candado {
  return {
    async conDia(fecha, trabajo) {
      const cliente = await pool.connect()
      try {
        await cliente.query('BEGIN')
        // Si otra reserva del mismo día se atasca, esta no espera para siempre: falla y la API da 503.
        await cliente.query("SET LOCAL lock_timeout = '20s'")
        await cliente.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`citas:${fecha}`])
        const resultado = await trabajo()
        await cliente.query('COMMIT')
        return resultado
      } catch (error) {
        await cliente.query('ROLLBACK').catch(() => undefined)
        throw error
      } finally {
        cliente.release()
      }
    },
  }
}
