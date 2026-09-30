#!/usr/bin/env node
/**
 * Hook `PostToolUse` (Edit|Write) de `.claude/settings.json`: corre la suite del arnés tras cada
 * edición, SALVO cuando lo editado es un `.md`.
 *
 * Por qué la excepción (2026-09-30, decisión de Pablo): la suite completa tarda ~6 min (dos `pnpm
 * build` reales y cinco builds de experimento) y bloquea cada edición mientras corre. Ningún test lee
 * un `.md` (leen `package.json`, `index.html`, `tools/*.ts` y `src/`), así que correrla tras editar
 * `progress/` o `docs/` no verifica nada. Cualquier otro fichero, o un evento que no se pueda leer,
 * corre la suite: ante la duda, la guarda se queda puesta. El hook `Stop` no cambia.
 *
 * Claude Code pasa el evento como JSON por la entrada estándar (`tool_input.file_path`).
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'

function ficheroEditado() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'))?.tool_input?.file_path ?? ''
  } catch {
    return ''
  }
}

const fichero = ficheroEditado()

if (/\.md$/i.test(fichero)) {
  console.log(`[hook] ${fichero} es Markdown: ningún test lo lee, no se corre la suite.`)
} else {
  const { status } = spawnSync(process.execPath, ['.harness/harness.mjs', 'test'], {
    stdio: 'inherit',
  })

  // process.exitCode y NO process.exit(): mismo motivo que en las puertas de `tools/` (nodejs/node#56645).
  process.exitCode = status ?? 1
}
