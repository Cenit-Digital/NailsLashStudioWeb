/**
 * Un servicio del que depende la reserva (Google, Turnstile, PostgreSQL) falla o responde algo
 * inesperado. La API responde 503 sin crear nada (@s25: fallo cerrado) y la clienta puede reintentar.
 */
export class ErrorServicio extends Error {}
