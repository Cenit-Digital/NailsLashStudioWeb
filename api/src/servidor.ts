import { serve } from '@hono/node-server'
import pg from 'pg'

import { crearApp } from './app.ts'
import { crearCandadoPg } from './candado-pg.ts'
import { leerConfig } from './config.ts'
import { crearClienteGoogle } from './google.ts'
import { verificarTurnstile } from './turnstile.ts'

/**
 * Arranque del backend de citas (Fase 6, issue #37): une la configuración del entorno con las piezas
 * reales. No tiene lógica propia; como `main.tsx`, queda fuera de la mutación. Despliegue: Fase 8.
 */
const config = leerConfig(process.env)
const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 5,
  connectionTimeoutMillis: 5_000,
  idle_in_transaction_session_timeout: 60_000,
})
// Sin este listener, el error de una conexión inactiva (PostgreSQL reiniciado) tumbaría el proceso.
pool.on('error', (error) => console.warn(`[citas-api] PostgreSQL: ${error.message}`))

const app = crearApp({
  google: crearClienteGoogle({ ...config.google, fetch, ahora: () => Date.now() }),
  candado: crearCandadoPg(pool),
  calendarios: config.calendarios,
  verificarTurnstile: (token, ip, clave) =>
    verificarTurnstile({ secreto: config.turnstileSecreto, token, ip, clave, fetch }),
  ahora: () => new Date(),
  emailSalon: config.emailSalon,
  avisar: (mensaje) => console.warn(`[citas-api] ${mensaje}`),
})

serve({ fetch: app.fetch, port: config.puerto }, ({ port }) => {
  console.log(`[citas-api] escuchando en el puerto ${port}`)
})
