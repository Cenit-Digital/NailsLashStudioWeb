#!/usr/bin/env node
/**
 * Envoltorio de Stryker para el arnés.
 *
 * Existe por un motivo concreto: `harness.config.json` → `commands.mutate` recibe
 * el token `{{target}}` (docs/configuration.md:54), pero Stryker necesita que el
 * fichero llegue como `--mutate <fichero>`, no como argumento posicional
 * (`stryker run <x>` interpretaría `<x>` como fichero de configuración). Sin este
 * envoltorio, `bin/harness mutate src/lib/x.ts` descartaba el target EN SILENCIO
 * y mutaba el proyecto entero.
 *
 *   sin target  → usa la lista `mutate` de stryker.config.json (la de `verify`)
 *   con target  → acota con `--mutate <target>` (lo que hace el mutation_tester)
 *
 * PROHIBIDO acotar con `--testFiles`: con este stack da un 0% falso.
 * Ver docs/research/00-fase0-informe.md §6.3.
 */
import { spawnSync } from 'node:child_process'

const target = process.argv[2]

if (target && target.startsWith('-')) {
  console.error(
    `[mutate] "${target}" parece una opción, no un fichero.\n` +
      `         Uso: bin/harness mutate [ruta/al/fichero.ts]\n` +
      `         Sin argumento se usa la lista "mutate" de stryker.config.json.`,
  )
  process.exit(2)
}

const args = ['stryker', 'run', ...(target ? ['--mutate', target] : [])]

console.log(`[mutate] pnpm exec ${args.join(' ')}`)

// Una sola cadena de comando: pasar un array de argumentos con shell:true dispara el aviso DEP0190
// de Node, y sin shell 'pnpm' (un .cmd en Windows) no arranca. Lo que no sea un token seguro
// (letras, dígitos, . / : , - _) va entre comillas.
const comando = ['pnpm', 'exec', ...args]
  .map((a) => (/^[\w./:,-]+$/.test(a) ? a : JSON.stringify(a)))
  .join(' ')
const res = spawnSync(comando, { stdio: 'inherit', shell: true })
process.exit(res.status ?? 1)
