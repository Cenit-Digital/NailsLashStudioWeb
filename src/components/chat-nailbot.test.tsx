import { readFileSync } from 'node:fs'

import { fireEvent, render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ChatNailbot } from './ChatNailbot'
import { Reserva } from './Reserva'

/**
 * Nailbot, el chat COMPARTIDO entre `#reserva` y el panel del robot flotante (F-23). Contrato:
 * features/nailbot_chat_compartido.feature (@s1-@s4, @s6-@s10, @s12; @s5/@s11 en
 * chat-nailbot-logica.test.ts, @s13 en chat-nailbot-estilos.test.ts, @s14 en nailbot-arte.test.tsx).
 *
 * REGLAS DURAS: lo HORNEADO se asevera con `renderToString`; ANTI-TAUTOLOGÍA (todo literal esperado
 * A MANO, jamás importado de `nailbot-demo.ts`, `TELEFONO`, `waHref`, `mensajeReserva`, `responder`
 * ni `HORARIO`); consultas por ROL, NOMBRE, TEXTO o `data-*`, JAMÁS `toHaveClass` (css:false).
 */
const NOMBRE = 'Nailbot'
const SUBTITULO = 'Asistente automático · demo'
const LEYENDA =
  'Demo · Nailbot responde con opciones predefinidas: no es una persona ni usa inteligencia artificial.'
const SALUDO =
  '¡Hola! Soy Nailbot 💅, el asistente automático de Nails Lash Studio. ¿Qué te apetece reservar?'
const PREGUNTA_DIA = '¡Me encanta! ¿Qué día te viene mejor?'
const PREGUNTA_FRANJA = '¿Prefieres alguna franja horaria?'
const PREGUNTA_NOMBRE =
  '¡Casi lo tenemos! ¿A qué nombre hago la solicitud? Si lo prefieres, puedes saltártelo.'
const FRASE_SABADO = 'Los sábados abrimos de 10:00 a 14:00, así que te busco hueco por la mañana.'
const AVISO =
  'Al pulsar se abrirá WhatsApp con este mensaje y tú decides si lo envías. El salón lo usará solo para gestionar tu cita.'
const ENLACE_FINAL = 'Enviar la reserva por WhatsApp'
const COLA =
  '. Envíasela al salón por WhatsApp con el enlace de abajo y allí te confirmarán la hora exacta.'

function pulsar(nombre: string, ambito: HTMLElement = document.body) {
  fireEvent.click(within(ambito).getByRole('button', { name: nombre }))
}

function burbujas(ambito: HTMLElement): HTMLElement[] {
  return [...ambito.querySelectorAll<HTMLElement>('[data-de]')]
}

function botones(ambito: HTMLElement): string[] {
  return within(ambito)
    .queryAllByRole('button')
    .map((b) => b.getAttribute('aria-label') ?? b.textContent ?? '')
}

function textoDelMensaje(href: string): string {
  return decodeURIComponent(href.slice(href.indexOf('?text=') + '?text='.length))
}

/** Los dos horneados de @s1: la sección entera y el chat montado solo. */
function horneados(): readonly (readonly [string, string])[] {
  return [
    ['<Reserva />', renderToString(<Reserva />)],
    ['<ChatNailbot />', renderToString(<ChatNailbot />)],
  ]
}

describe('@s1 horneado, el chat dice lo que es y su hilo es un registro con nombre', () => {
  it('@s1 la cabecera tiene un nodo cuyo texto es EXACTAMENTE «Nailbot» y otro «Asistente automático · demo»', () => {
    for (const [montaje, html] of horneados()) {
      expect(html, montaje).toContain(`>${NOMBRE}<`)
      expect(html, montaje).toContain(`>${SUBTITULO}<`)
    }
  })

  it('@s1 no queda ni «en línea» ni el avatar de letras «nl» (L1)', () => {
    for (const [montaje, html] of horneados()) {
      expect(html, montaje).toContain(`>${NOMBRE}<`)
      expect(html, montaje).not.toContain('en línea')
      expect(html, montaje).not.toMatch(/>\s*nl\s*</)
    }
  })

  it('@s1 el avatar de la cabecera es un <svg> aria-hidden y no enfocable, SIN data-animacion', () => {
    for (const [montaje, html] of horneados()) {
      const avatar = /<svg[^>]*>/.exec(html)

      expect(avatar, `${montaje}: la cabecera no trae ningún <svg>`).not.toBeNull()
      expect(html.indexOf('<svg'), montaje).toBeLessThan(html.indexOf(`>${NOMBRE}<`))
      expect(avatar?.[0], montaje).toContain('aria-hidden="true"')
      expect(avatar?.[0], montaje).toContain('focusable="false"')
      expect(avatar?.[0], montaje).not.toContain('data-animacion')
    }
  })

  it('@s1 la leyenda aparece EXACTAMENTE una vez y NO es una burbuja (sobre el DOM del horneado)', () => {
    for (const [montaje, html] of horneados()) {
      const raiz = document.createElement('div')
      raiz.innerHTML = html
      const nodos = [...raiz.querySelectorAll('*')].filter((e) => e.textContent === LEYENDA)

      expect(html.split(LEYENDA).length - 1, montaje).toBe(1)
      expect(raiz.querySelectorAll('[data-de]').length, montaje).toBeGreaterThan(0)
      expect(nodos.length, montaje).toBeGreaterThan(0)
      for (const nodo of nodos) {
        expect(nodo.closest('[data-de]'), montaje).toBeNull()
      }
    }
  })

  it('@s1 el hilo es role="log", aria-live="polite" y aria-label="Conversación con Nailbot", ya horneado', () => {
    for (const [montaje, html] of horneados()) {
      const hilo = /<div[^>]*role="log"[^>]*>/.exec(html)?.[0] ?? ''

      expect(hilo, montaje).toContain('role="log"')
      expect(hilo, montaje).toContain('aria-live="polite"')
      expect(hilo, montaje).toContain('aria-label="Conversación con Nailbot"')
    }
  })

  it('@s1 el orden es: subtítulo → leyenda → role="log" → el botón «Uñas»', () => {
    for (const [montaje, html] of horneados()) {
      const anclas = [SUBTITULO, LEYENDA, 'role="log"', '>Uñas<'].map((a) => html.indexOf(a))

      for (const posicion of anclas) {
        expect(posicion, montaje).toBeGreaterThanOrEqual(0)
      }
      expect(anclas, montaje).toEqual([...anclas].sort((a, b) => a - b))
    }
  })

  it('@s1 ChatNailbot horneado no trae headings, sección, nav ni enlace', () => {
    const html = renderToString(<ChatNailbot />)

    expect(html).toContain(`>${NOMBRE}<`)
    for (const prohibido of ['<h1', '<h2', '<h3', '<h4', '<h5', '<h6', '<section', '<nav', '<a ']) {
      expect(html, prohibido).not.toContain(prohibido)
    }
  })
})

describe('@s2 la leyenda se ve SIEMPRE', () => {
  const momentos: readonly (readonly [string, readonly string[]])[] = [
    ['al montar', []],
    ['a mitad', ['Uñas', 'Un sábado']],
    ['al terminar', ['Uñas', 'Un sábado', 'Prefiero no decirlo']],
    ['tras reiniciar', ['Uñas', 'Un sábado', 'Prefiero no decirlo', 'Reservar otra cita']],
  ]

  for (const [momento, pulsaciones] of momentos) {
    it(`@s2 ${momento}: exactamente una vez, fuera de burbujas y del log`, () => {
      render(<ChatNailbot />)
      for (const p of pulsaciones) pulsar(p)

      const leyendas = screen.getAllByText(LEYENDA)
      expect(leyendas).toHaveLength(1)
      expect(leyendas[0].closest('[data-de]')).toBeNull()
      expect(leyendas[0].closest('[role="log"]')).toBeNull()
    })
  }
})

describe('@s3 el guion: la pregunta de Nailbot y los botones de cada paso', () => {
  const filas: readonly {
    paso: string
    previas: readonly string[]
    mensaje: string
    botones: readonly string[]
    campo: boolean
  }[] = [
    {
      paso: 'servicio',
      previas: [],
      mensaje: SALUDO,
      botones: ['Uñas', 'Pestañas', 'Cejas'],
      campo: false,
    },
    {
      paso: 'día',
      previas: ['Uñas'],
      mensaje: PREGUNTA_DIA,
      botones: ['Entre semana', 'Un sábado', 'Lo antes posible'],
      campo: false,
    },
    {
      paso: 'franja',
      previas: ['Uñas', 'Entre semana'],
      mensaje: PREGUNTA_FRANJA,
      botones: ['Por la mañana', 'Por la tarde', 'Me es indiferente'],
      campo: false,
    },
    {
      paso: 'franja (lo antes posible)',
      previas: ['Pestañas', 'Lo antes posible'],
      mensaje: PREGUNTA_FRANJA,
      botones: ['Por la mañana', 'Por la tarde', 'Me es indiferente'],
      campo: false,
    },
    {
      paso: 'nombre',
      previas: ['Uñas', 'Entre semana', 'Por la mañana'],
      mensaje: PREGUNTA_NOMBRE,
      botones: ['Enviar', 'Prefiero no decirlo'],
      campo: true,
    },
  ]

  for (const fila of filas) {
    it(`@s3 paso ${fila.paso}`, () => {
      const { container } = render(<ChatNailbot />)
      for (const p of fila.previas) pulsar(p)

      const ultima = burbujas(container).at(-1)
      expect(ultima).toHaveAttribute('data-de', 'bot')
      expect(ultima).toHaveTextContent(fila.mensaje, { normalizeWhitespace: false })
      expect(ultima?.textContent).toBe(fila.mensaje)
      expect(botones(container)).toEqual(fila.botones)

      const campo = screen.queryByRole('textbox', { name: 'Tu nombre' })
      if (fila.campo) {
        expect(campo).not.toBeNull()
        expect(campo).not.toHaveAttribute('maxlength')
      } else {
        expect(campo).toBeNull()
      }

      expect(screen.queryByText('Este fin de semana')).toBeNull()
      const campos = [...container.querySelectorAll('input, textarea, select')]
      expect(campos.filter((c) => c.getAttribute('aria-label') !== 'Tu nombre')).toHaveLength(0)
    })
  }
})

describe('@s4 «Un sábado» NO pregunta la franja', () => {
  it('@s4 seis burbujas exactas, sin inventar una respuesta de la persona, y se pasa al nombre', () => {
    const { container } = render(<ChatNailbot />)
    pulsar('Uñas')
    pulsar('Un sábado')

    expect(burbujas(container).map((b) => [b.getAttribute('data-de'), b.textContent])).toEqual([
      ['bot', SALUDO],
      ['usuario', 'Uñas'],
      ['bot', PREGUNTA_DIA],
      ['usuario', 'Un sábado'],
      ['bot', FRASE_SABADO],
      ['bot', PREGUNTA_NOMBRE],
    ])
    expect(
      burbujas(container).filter(
        (b) => b.dataset.de === 'usuario' && b.textContent === 'Por la mañana',
      ),
    ).toHaveLength(0)
    expect(botones(container)).toEqual(['Enviar', 'Prefiero no decirlo'])
    expect(screen.getByRole('textbox', { name: 'Tu nombre' })).toBeInTheDocument()
  })
})

describe('@s6 al terminar, el resumen dice lo que de verdad pasa y el enlace lleva el mensaje exacto', () => {
  const casos = [
    {
      caso: 'con nombre, por el sábado',
      camino: ['Pestañas', 'Un sábado'],
      nombre: 'Lucía',
      n: 8,
      persona: 'Lucía',
      resumen: `¡Gracias, Lucía! ✨ Tu solicitud: Pestañas · Un sábado · Por la mañana${COLA}`,
      mensaje:
        'Hola, quiero reservar: Pestañas · Un sábado · Por la mañana. Me llamo Lucía y os escribo desde la web. ¿Podéis confirmarme la hora exacta?',
    },
    {
      caso: 'sin nombre',
      camino: ['Cejas', 'Lo antes posible', 'Por la tarde'],
      nombre: null,
      n: 9,
      persona: 'Prefiero no decirlo',
      resumen: `¡Gracias! ✨ Tu solicitud: Cejas · Lo antes posible · Por la tarde${COLA}`,
      mensaje:
        'Hola, quiero reservar: Cejas · Lo antes posible · Por la tarde. Os escribo desde la web. ¿Podéis confirmarme la hora exacta?',
    },
  ] as const

  for (const c of casos) {
    it(`@s6 ${c.caso}`, () => {
      const { container } = render(<ChatNailbot />)
      for (const p of c.camino) pulsar(p)
      if (c.nombre === null) {
        pulsar('Prefiero no decirlo')
      } else {
        fireEvent.change(screen.getByRole('textbox', { name: 'Tu nombre' }), {
          target: { value: c.nombre },
        })
        pulsar('Enviar')
      }

      const todas = burbujas(container)
      expect(todas).toHaveLength(c.n)
      expect(todas.at(-2)).toHaveAttribute('data-de', 'usuario')
      expect(todas.at(-2)?.textContent).toBe(c.persona)
      expect(todas.at(-1)).toHaveAttribute('data-de', 'bot')
      expect(todas.at(-1)?.textContent).toBe(c.resumen)

      const enlaces = screen.getAllByRole('link', { name: ENLACE_FINAL })
      expect(enlaces).toHaveLength(1)
      expect(enlaces[0]).not.toHaveAttribute('target')
      const href = enlaces[0].getAttribute('href') ?? ''
      expect(href).toContain('34625223366')
      expect(textoDelMensaje(href)).toBe(c.mensaje)

      expect(screen.queryByRole('textbox', { name: 'Tu nombre' })).toBeNull()
      expect(botones(container)).toEqual(['Reservar otra cita'])

      const hilo = container.querySelector('[role="log"]')?.textContent ?? ''
      for (const texto of [hilo, textoDelMensaje(href)]) {
        expect(texto).not.toContain('undefined')
        expect(texto).not.toContain('  ')
      }
    })
  }

  it('@s6 en el paso del nombre y al terminar, el pie no deja contenedores VACÍOS (cada uno añadiría un hueco del flex)', () => {
    const { container } = render(<ChatNailbot />)
    expect(container.querySelectorAll('div:empty')).toHaveLength(0)

    for (const p of ['Uñas', 'Entre semana', 'Por la mañana']) pulsar(p)
    expect(screen.getByRole('textbox', { name: 'Tu nombre' })).toBeInTheDocument()
    expect(container.querySelectorAll('div:empty')).toHaveLength(0)

    pulsar('Prefiero no decirlo')
    expect(screen.getByRole('link', { name: ENLACE_FINAL })).toBeInTheDocument()
    expect(container.querySelectorAll('div:empty')).toHaveLength(0)
  })
})

describe('@s7 el aviso de capa 1 va justo encima del enlace y lo describe', () => {
  it('@s7 no existe antes de terminar; al terminar es el hermano anterior del enlace, sin enlaces, y lo describe', () => {
    const { container } = render(<ChatNailbot />)
    expect(screen.queryByText(AVISO)).toBeNull()
    pulsar('Uñas')
    expect(screen.queryByText(AVISO)).toBeNull()
    pulsar('Entre semana')
    pulsar('Por la mañana')
    expect(screen.queryByText(AVISO)).toBeNull()

    pulsar('Prefiero no decirlo')

    const avisos = screen.getAllByText(AVISO)
    expect(avisos).toHaveLength(1)
    const aviso = avisos[0]
    const enlace = screen.getByRole('link', { name: ENLACE_FINAL })

    expect(enlace.previousElementSibling).toBe(aviso)
    expect(aviso.querySelector('a')).toBeNull()
    expect(aviso.querySelector('[href]')).toBeNull()
    expect(aviso.id).not.toBe('')
    expect(enlace).toHaveAttribute('aria-describedby', aviso.id)
    expect(enlace).toHaveAccessibleDescription(AVISO)
    expect(aviso).not.toHaveAttribute('data-de')
    expect(aviso.closest('[role="log"]')).toBeNull()
    expect(container.querySelectorAll(`[id="${aviso.id}"]`)).toHaveLength(1)
  })
})

describe('@s8 tras cada acción de la persona el foco pasa al PRIMER control del paso nuevo', () => {
  const casos: readonly {
    partida: readonly string[]
    nombre?: string
    accion: string
    foco: () => HTMLElement
  }[] = [
    {
      partida: [],
      accion: 'Uñas',
      foco: () => screen.getByRole('button', { name: 'Entre semana' }),
    },
    {
      partida: ['Uñas'],
      accion: 'Lo antes posible',
      foco: () => screen.getByRole('button', { name: 'Por la mañana' }),
    },
    {
      partida: ['Uñas'],
      accion: 'Un sábado',
      foco: () => screen.getByRole('textbox', { name: 'Tu nombre' }),
    },
    {
      partida: ['Uñas', 'Entre semana'],
      accion: 'Me es indiferente',
      foco: () => screen.getByRole('textbox', { name: 'Tu nombre' }),
    },
    {
      partida: ['Uñas', 'Entre semana', 'Por la mañana'],
      nombre: 'Marta',
      accion: 'Enviar',
      foco: () => screen.getByRole('link', { name: ENLACE_FINAL }),
    },
    {
      partida: ['Uñas', 'Entre semana', 'Por la mañana'],
      accion: 'Prefiero no decirlo',
      foco: () => screen.getByRole('link', { name: ENLACE_FINAL }),
    },
    {
      partida: ['Uñas', 'Entre semana', 'Por la mañana', 'Prefiero no decirlo'],
      accion: 'Reservar otra cita',
      foco: () => screen.getByRole('button', { name: 'Uñas' }),
    },
  ]

  for (const caso of casos) {
    it(`@s8 tras [${caso.partida.join(', ')}] pulsar «${caso.accion}» enfoca el primer control del paso nuevo`, () => {
      render(<ChatNailbot />)
      expect(document.activeElement).toBe(document.body)
      for (const p of caso.partida) pulsar(p)
      if (caso.nombre !== undefined) {
        fireEvent.change(screen.getByRole('textbox', { name: 'Tu nombre' }), {
          target: { value: caso.nombre },
        })
      }

      pulsar(caso.accion)

      expect(document.activeElement).toBe(caso.foco())
    })
  }

  it('@s8 al montar, el foco NO entra en el chat', () => {
    render(<ChatNailbot />)

    expect(document.activeElement).toBe(document.body)
  })

  it('@s8 enviar un nombre vacío no cambia nada y NO mueve el foco (si el efecto se disparara, iría al campo)', () => {
    const { container } = render(<ChatNailbot />)
    for (const p of ['Uñas', 'Entre semana', 'Por la mañana']) pulsar(p)
    const antes = burbujas(container).length
    const campo = screen.getByRole('textbox', { name: 'Tu nombre' })
    const saltar = screen.getByRole('button', { name: 'Prefiero no decirlo' })
    saltar.focus()

    fireEvent.change(campo, { target: { value: '   ' } })
    fireEvent.keyDown(campo, { key: 'Enter' })

    expect(burbujas(container)).toHaveLength(antes)
    expect(document.activeElement).toBe(saltar)
  })
})

describe('@s9 «Reservar otra cita» tras el camino del sábado y sin nombre vuelve al estado inicial EXACTO', () => {
  it('@s9 una sola burbuja, las tres opciones, y ni rastro de lo anterior', () => {
    const { container } = render(<ChatNailbot />)
    for (const p of ['Pestañas', 'Un sábado', 'Prefiero no decirlo', 'Reservar otra cita'])
      pulsar(p)

    const todas = burbujas(container)
    expect(todas).toHaveLength(1)
    expect(todas[0]).toHaveAttribute('data-de', 'bot')
    expect(todas[0].textContent).toBe(SALUDO)
    expect(botones(container)).toEqual(['Uñas', 'Pestañas', 'Cejas'])
    expect(screen.queryByRole('textbox', { name: 'Tu nombre' })).toBeNull()
    expect(screen.queryByText(AVISO)).toBeNull()
    expect(screen.queryByRole('link', { name: ENLACE_FINAL })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Reservar otra cita' })).toBeNull()
    for (const rastro of ['Un sábado', 'Prefiero no decirlo', 'Los sábados abrimos', '¡Gracias']) {
      expect(
        todas.some((b) => (b.textContent ?? '').includes(rastro)),
        rastro,
      ).toBe(false)
    }
  })

  it('@s9 tras reiniciar, el campo del nombre vuelve VACÍO', () => {
    render(<ChatNailbot />)
    for (const p of ['Uñas', 'Entre semana', 'Por la mañana']) pulsar(p)
    fireEvent.change(screen.getByRole('textbox', { name: 'Tu nombre' }), {
      target: { value: 'Marta' },
    })
    pulsar('Enviar')
    pulsar('Reservar otra cita')
    for (const p of ['Uñas', 'Entre semana', 'Por la mañana']) pulsar(p)

    expect(screen.getByRole('textbox', { name: 'Tu nombre' })).toHaveValue('')
  })
})

describe('@s10 dos instancias en la misma página son INDEPENDIENTES', () => {
  it('@s10 cada una lleva su conversación, su mensaje y sus ids', () => {
    const { container } = render(
      <>
        <div data-instancia="1">
          <ChatNailbot />
        </div>
        <div data-instancia="2">
          <ChatNailbot />
        </div>
      </>,
    )
    const primera = container.querySelector<HTMLElement>('[data-instancia="1"]') as HTMLElement
    const segunda = container.querySelector<HTMLElement>('[data-instancia="2"]') as HTMLElement

    for (const p of ['Cejas', 'Lo antes posible', 'Por la tarde', 'Prefiero no decirlo'])
      pulsar(p, primera)
    expect(burbujas(segunda)).toHaveLength(1)
    expect(botones(segunda)).toEqual(['Uñas', 'Pestañas', 'Cejas'])

    for (const p of ['Uñas', 'Entre semana', 'Por la mañana']) pulsar(p, segunda)
    fireEvent.change(within(segunda).getByRole('textbox', { name: 'Tu nombre' }), {
      target: { value: 'Marta' },
    })
    pulsar('Enviar', segunda)

    expect(burbujas(primera).at(-1)?.textContent).toBe(
      `¡Gracias! ✨ Tu solicitud: Cejas · Lo antes posible · Por la tarde${COLA}`,
    )
    expect(burbujas(segunda).at(-1)?.textContent).toBe(
      `¡Gracias, Marta! ✨ Tu solicitud: Uñas · Entre semana · Por la mañana${COLA}`,
    )

    const enlace1 = within(primera).getAllByRole('link', { name: ENLACE_FINAL })
    const enlace2 = within(segunda).getAllByRole('link', { name: ENLACE_FINAL })
    expect(enlace1).toHaveLength(1)
    expect(enlace2).toHaveLength(1)
    expect(textoDelMensaje(enlace1[0].getAttribute('href') ?? '')).toBe(
      'Hola, quiero reservar: Cejas · Lo antes posible · Por la tarde. Os escribo desde la web. ¿Podéis confirmarme la hora exacta?',
    )
    expect(textoDelMensaje(enlace2[0].getAttribute('href') ?? '')).toBe(
      'Hola, quiero reservar: Uñas · Entre semana · Por la mañana. Me llamo Marta y os escribo desde la web. ¿Podéis confirmarme la hora exacta?',
    )

    const ids = [...container.querySelectorAll('[id]')].map((e) => e.id)
    expect(ids.length).toBeGreaterThanOrEqual(2)
    expect(new Set(ids).size).toBe(ids.length)
    for (const enlace of [enlace1[0], enlace2[0]]) {
      expect(enlace.getAttribute('aria-describedby')).toBe(enlace.previousElementSibling?.id)
    }

    for (const instancia of [primera, segunda]) {
      expect(instancia.querySelector('h1, h2, h3, h4, h5, h6, section, nav')).toBeNull()
    }
  })
})

describe('@s12 guardas de FUENTE', () => {
  const fuentes = {
    chat: readFileSync('src/components/ChatNailbot.tsx', 'utf8'),
    logica: readFileSync('src/components/chat-nailbot-logica.ts', 'utf8'),
    demo: readFileSync('src/lib/demo/nailbot-demo.ts', 'utf8'),
    arte: readFileSync('src/components/NailbotArte.tsx', 'utf8'),
  }

  it('@s12 ANCLAS POSITIVAS: los ficheros se leyeron y dicen lo que tienen que decir', () => {
    for (const ancla of [
      'export function ChatNailbot',
      'waHref(',
      'TELEFONO',
      'useId',
      'nailbot-demo',
    ]) {
      expect(fuentes.chat, ancla).toContain(ancla)
    }
    expect(fuentes.logica).toContain('export function responder')
    expect(fuentes.demo).toContain('Asistente automático · demo')
    expect(fuentes.arte).toContain('export function NailbotArte')
  })

  it('@s12 el número y el host de WhatsApp viven SOLO en src/lib/site.ts', () => {
    for (const bytes of [fuentes.chat, fuentes.logica, fuentes.demo]) {
      for (const prohibido of [
        '625 22 33 66',
        '34625223366',
        '+34625223366',
        'wa.me',
        'api.whatsapp.com',
        'whatsapp.com',
      ]) {
        expect(bytes, prohibido).not.toContain(prohibido)
      }
    }
  })

  it('@s12 nada sale del navegador: ni red, ni storage, ni cookies', () => {
    for (const bytes of [fuentes.chat, fuentes.logica]) {
      for (const prohibido of [
        'fetch(',
        'XMLHttpRequest',
        'window.location',
        'form action',
        'localStorage',
        'sessionStorage',
        'document.cookie',
      ]) {
        expect(bytes, prohibido).not.toContain(prohibido)
      }
    }
  })

  it('@s12 el horario del sábado no se escribe a mano (L6)', () => {
    for (const bytes of [fuentes.demo, fuentes.logica, fuentes.chat]) {
      expect(bytes).not.toContain('10:00')
      expect(bytes).not.toContain('14:00')
    }
  })

  it('@s12 el copy vive en nailbot-demo.ts, no en el componente ni en la lógica', () => {
    for (const bytes of [fuentes.chat, fuentes.logica]) {
      for (const copy of [
        'Asistente automático',
        'inteligencia artificial',
        'Al pulsar se abrirá WhatsApp',
        '¿Qué te apetece reservar?',
      ]) {
        expect(bytes, copy).not.toContain(copy)
      }
    }
  })

  it('compatibilidad: sin aserciones lookbehind en el cerebro (Safari/iOS < 16.4 lanza SyntaxError al ejecutarlas)', () => {
    // Ancla positiva: el fichero sí sanea surrogates (con una expresión SIN mirada atrás).
    expect(fuentes.logica).toContain('export function sinSurrogatesSueltos')
    expect(fuentes.logica).not.toContain('(?<')
  })

  it('@s12 sin dangerouslySetInnerHTML y sin ningún id literal', () => {
    expect(fuentes.chat).not.toContain('dangerouslySetInnerHTML')
    expect(fuentes.chat).not.toContain('id="')
    expect(fuentes.arte).not.toContain('id="')
  })

  it('@s12 ninguno contiene los literales de la lista negra de F-01', () => {
    for (const bytes of Object.values(fuentes)) {
      for (const prohibido of [
        '600123456',
        'ph-woman',
        'IMAGEN TEMPORAL',
        'Plantilla de demostración',
        'hola@nailslashstudio.com',
        'Calle de la Belleza',
      ]) {
        expect(bytes, prohibido).not.toContain(prohibido)
      }
    }
  })
})
