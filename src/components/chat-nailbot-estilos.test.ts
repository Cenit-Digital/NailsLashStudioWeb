import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { MATRIZ_DE_USO } from '../lib/puerta-contraste'

/**
 * @s13 de features/nailbot_chat_compartido.feature: las hojas del chat y del arte, por BYTES (Stryker no
 * ve SCSS). ANCLA POSITIVA siempre primero. La puerta de contraste es CIEGA a los .module.scss: por eso
 * el par de cada texto nuevo se escribe A MANO aquí y se comprueba que es una fila de MATRIZ_DE_USO.
 */
const CHAT = readFileSync('src/components/chat-nailbot.module.scss', 'utf8')
const ARTE = readFileSync('src/components/nailbot-arte.module.scss', 'utf8')
const TOKENS = readFileSync('src/styles/_tokens.scss', 'utf8')

function cuerpoDelBloque(fuente: string, encabezado: RegExp): string | null {
  const cabeza = encabezado.exec(fuente)

  if (cabeza === null) {
    return null
  }

  const apertura = fuente.indexOf('{', cabeza.index)
  let profundidad = 0

  for (let i = apertura; i < fuente.length; i++) {
    if (fuente[i] === '{') {
      profundidad += 1
    } else if (fuente[i] === '}') {
      profundidad -= 1

      if (profundidad === 0) {
        return fuente.slice(apertura + 1, i)
      }
    }
  }

  return null
}

function tokenDe(color: unknown): string | undefined {
  return (color as { clase?: string; token?: string }).clase === 'token'
    ? (color as { token: string }).token
    : undefined
}

function enLaMatriz(fg: string, bg: string): boolean {
  return MATRIZ_DE_USO.some((par) => tokenDe(par.fg) === fg && tokenDe(par.bg) === bg)
}

describe('@s13 la hoja del chat', () => {
  it('@s13 ANCLA POSITIVA: declara los selectores mudados y los tres nuevos', () => {
    for (const selector of [
      'chat',
      'chatCabecera',
      'subtitulo',
      'leyenda',
      'hilo',
      'burbujaBot',
      'burbujaUsuario',
      'opciones',
      'chipChat',
      'entrada',
      'aviso',
      'reiniciar',
    ]) {
      expect(CHAT, selector).toMatch(new RegExp(`\\.${selector}\\b`))
    }
  })

  // Pares elegidos A MANO: [bloque, token de color, fondo real sobre el que se pinta].
  const pares = [
    ['subtitulo', '--accent-dark', '--accent-soft'],
    ['leyenda', '--muted', '--surface'],
    ['aviso', '--muted', '--surface'],
  ] as const

  for (const [bloque, color, fondo] of pares) {
    it(`@s13 .${bloque} pinta var(${color}), sin hex, y (${color} sobre ${fondo}) es una fila vigilada`, () => {
      const cuerpo = cuerpoDelBloque(CHAT, new RegExp(`\\.${bloque}\\s*\\{`))

      expect(cuerpo, `.${bloque} no existe`).not.toBeNull()
      expect(cuerpo).toMatch(new RegExp(`(^|[\\s;])color:\\s*var\\(${color}\\)`))
      expect(cuerpo).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(enLaMatriz(color, fondo)).toBe(true)
    })
  }

  it('@s13 los fondos de esos pares son los reales: la cabecera es --accent-soft; la leyenda y el pie, --surface', () => {
    expect(cuerpoDelBloque(CHAT, /\.chatCabecera\s*\{/)).toMatch(
      /background:\s*var\(--accent-soft\)/,
    )
    expect(cuerpoDelBloque(CHAT, /\.leyenda\s*\{/)).toMatch(/background:\s*var\(--surface\)/)
    expect(cuerpoDelBloque(CHAT, /\.chatPie\s*\{/)).toMatch(/background:\s*var\(--surface\)/)
  })

  it('@s13 sin «en línea» y sin movimiento', () => {
    expect(CHAT).toMatch(/\.chat\b/)
    expect(CHAT).not.toMatch(/\.enLinea\b/)
    expect(CHAT).not.toContain('var(--estado-en-linea)')
    expect(CHAT).not.toContain('@keyframes')
    expect(CHAT).not.toContain('animation')
  })

  it('accesibilidad: el placeholder del nombre es legible (--muted a opacidad 1) y el campo no apaga el foco', () => {
    const entrada = cuerpoDelBloque(CHAT, /\.entrada\s*\{/) ?? ''
    const placeholder = cuerpoDelBloque(entrada, /&::placeholder\s*\{/) ?? ''

    expect(placeholder).toMatch(/color:\s*var\(--muted\)/)
    expect(placeholder).toMatch(/opacity:\s*1\s*;/)
    expect(CHAT).not.toMatch(/outline:\s*(none|0)\b/)
  })

  it('el chat usa border-box: su borde no se suma al 100 % y no desborda el panel', () => {
    expect(cuerpoDelBloque(CHAT, /\.chat\s*\{/)).toMatch(/(^|\s)box-sizing:\s*border-box/)
  })
})

describe('@s13 la paleta decorativa del arte', () => {
  it('@s13 vive en nailbot-arte.module.scss y NO entra en _tokens.scss', () => {
    expect(ARTE).toContain('--nb-rojo')
    expect(TOKENS).toContain('--accent-dark')
    expect(TOKENS).not.toContain('--nb-')
  })

  it('@s13 ninguna de las dos hojas descarga nada (puerta 4, F-05)', () => {
    for (const hoja of [CHAT, ARTE]) {
      expect(hoja).not.toContain('url(')
      expect(hoja).not.toContain('@font-face')
    }
  })
})
