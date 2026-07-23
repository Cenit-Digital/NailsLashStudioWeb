import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  debeMontarseElControl,
  firmaCompletada,
  milisegundosDeCeremonia,
  SEGUNDOS_DE_SALIDA,
  SEGUNDOS_DE_TRAZO,
} from './hero-logica'

/**
 * Núcleo PURO de la caligrafía lenta del hero (contrato `features/hero.feature`, enmienda
 * 2026-07-23, @s4 + @s10-@s13; brief `progress/hero_caligrafia_lenta_diseno.md` §3b). Patrón
 * `galeria-logica.test.ts`: la DECISIÓN se asevera POR VALOR — `Hero.tsx` está en `mutate` con
 * break 100 y un `className`/render condicional bajo `css: false` no mata mutantes.
 *
 * EL RELOJ ES UNO: el token `--duracion-caligrafia` del SCSS y `SEGUNDOS_DE_TRAZO` de la lógica
 * se comparan AQUÍ, leyendo los BYTES de la hoja (jsdom no anima; patrón hero-estilos). Si alguien
 * cambia los 15 s en un sitio y no en el otro, este fichero se pone rojo. (ENMIENDAS 3 y 4,
 * 2026-07-24: 90 s → 30 s → 15 s; solo cambia el VALOR, el espejo sigue mordiendo en las dos
 * direcciones.)
 */
const RUTA_SCSS = 'src/components/hero.module.scss'

function scss(): string {
  return readFileSync(RUTA_SCSS, 'utf8')
}

describe('@s4/@s12 el reloj del timeout es EL MISMO que el de la hoja: una sola fuente de verdad', () => {
  it('@s4 SEGUNDOS_DE_TRAZO es 15 y es el MISMO número que el token --duracion-caligrafia del SCSS', () => {
    // El 15 va ESCRITO A MANO (anti-tautología) y ADEMÁS se lee de los bytes de la hoja.
    expect(SEGUNDOS_DE_TRAZO).toBe(15)

    const token = /--duracion-caligrafia\s*:\s*(\d+(?:\.\d+)?)s\s*;/.exec(scss())

    expect(token, 'el SCSS debe declarar el token --duracion-caligrafia').not.toBeNull()
    expect(Number((token as RegExpExecArray)[1])).toBe(SEGUNDOS_DE_TRAZO)
  })

  it('@s4 SEGUNDOS_DE_SALIDA es 0.8 = 0.2 (el arranque de «revelarStudio» tras el token) + 0.6 (su duración), LEÍDOS del SCSS', () => {
    expect(SEGUNDOS_DE_SALIDA).toBe(0.8)

    // La coreografía de salida REAL, de los bytes: revelarStudio <duración>s … calc(token + <extra>s).
    const salida =
      /revelarStudio\s+(\d*\.?\d+)s\s+[^;]*calc\(var\(--duracion-caligrafia\)\s*\+\s*(\d*\.?\d+)s\)/.exec(
        scss(),
      )

    expect(salida, 'el SCSS debe derivar revelarStudio del token').not.toBeNull()

    const [, duracion, extra] = salida as RegExpExecArray

    expect(Number(duracion) + Number(extra)).toBe(SEGUNDOS_DE_SALIDA)
  })

  it('@s12 milisegundosDeCeremonia() devuelve 15 800 ms — el fin del reloj que desmonta el control', () => {
    // 15 + 0,8 = 15,8 s → 15 800 ms, ESCRITO A MANO: el mismo número que asevera hero-estilos
    // sobre la hoja (retardo + duración de revelarStudio). Se calcula EN LLAMADA, no en la carga
    // del módulo (estáticos no activables: progress/tdd_deuda_mutacion_full.md, familia B).
    expect(milisegundosDeCeremonia()).toBe(15_800)
  })
})

describe('@s11/@s12 firmaCompletada: la firma queda completa por el CLIENTE o por el RELOJ, nunca corriendo', () => {
  it.each([
    { fase: 'corriendo', completada: false },
    { fase: 'cliente', completada: true },
    { fase: 'reloj', completada: true },
  ] as const)('@s11 firmaCompletada($fase) → $completada', ({ fase, completada }) => {
    expect(firmaCompletada(fase)).toBe(completada)
  })
})

describe('@s10/@s13 debeMontarseElControl: solo con el movimiento PERMITIDO y la firma CORRIENDO', () => {
  // La tabla ENTERA, por valor: cada rama del predicado tiene una fila que la mata.
  // `movimientoReducido` es `null` mientras la preferencia no se ha leído (SSR/HTML horneado y
  // primer render de hidratación): SIN preferencia leída NO se monta nada — el botón no viaja en
  // los bytes del prerender (@s10) y bajo reduce no existe «en ningún momento» (@s13).
  it.each([
    { movimientoReducido: null, fase: 'corriendo', montado: false },
    { movimientoReducido: true, fase: 'corriendo', montado: false },
    { movimientoReducido: false, fase: 'corriendo', montado: true },
    { movimientoReducido: false, fase: 'cliente', montado: false },
    { movimientoReducido: false, fase: 'reloj', montado: false },
    { movimientoReducido: true, fase: 'cliente', montado: false },
  ] as const)(
    '@s10 debeMontarseElControl($movimientoReducido, $fase) → $montado',
    ({ movimientoReducido, fase, montado }) => {
      expect(debeMontarseElControl(movimientoReducido, fase)).toBe(montado)
    },
  )
})
