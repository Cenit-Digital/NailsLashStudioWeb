import { readFileSync } from 'node:fs'

import { fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Reserva } from './Reserva'
import { claveBurbuja } from './reserva-logica'

/**
 * Sección `#reserva` — la columna izquierda RESTAURADA al diseño (prototipo Opción-1-Rosa, L248-256)
 * y el chat guiado de la derecha, que se mantiene. Contrato: features/reserva_chat.feature.
 *
 * REGLAS DURAS aplicadas aquí:
 *  · Lo HORNEADO (contenido estático, SSR sin JS) se asevera sobre `renderToString(<Reserva />)` —EL
 *    MISMO mecanismo que usa vite-react-ssg para prerenderizar—; el estado POST-hidratación (chat en
 *    marcha, ausencia del calendario) sobre jsdom con `render` + `fireEvent`.
 *  · ANTI-TAUTOLOGÍA: todo literal esperado va ESCRITO A MANO. JAMÁS se importa `TELEFONO`, `waHref`,
 *    `telHref`, `FLUJO_CHAT` ni `RESERVA_WHATSAPP_TEXTO` como valor ESPERADO, ni se re-ejecuta
 *    `waHref(...)` para compararlo con su propio resultado.
 *  · El HOST de WhatsApp NO se asevera (A-10 de F-02): se verifica a mano en Android, iOS y Web.
 *  · Se consulta por ROL, NOMBRE accesible, TEXTO o `data-*` — JAMÁS con `toHaveClass` (css:false).
 *  · @s21 (las cinco puertas del build) NO se re-testea aquí: lo cubren los tests build-based ya
 *    existentes del repo (p. ej. `src/pages/home-horneado.test.ts`); esta sesión no añade otro build.
 */
const EYEBROW = 'Reserva rápida'
const TITULO = '¿Prefieres reservar por chat?'
const PARRAFO =
  'Elige servicio, día y franja horaria con nuestro asistente y te confirmamos la hora exacta por WhatsApp.'
const ENLACE_WA = 'WhatsApp'
const ENLACE_TEL = 'Llamar al estudio'
const SALUDO = '¡Hola! Soy el asistente de Nails Lash Studio ✨ ¿Qué te gustaría reservar?'
const RUTA_TSX = 'src/components/Reserva.tsx'

function bytesTsx(): string {
  return readFileSync(RUTA_TSX, 'utf8')
}

/** Las burbujas del hilo, en orden, por su atributo `data-de` (@s19). */
function burbujasDe(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[data-de]')]
}

/** Avanza el chat hasta el cuarto paso (nombre) con Uñas · Entre semana · Por la mañana. */
function avanzarHastaElNombre(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Uñas' }))
  fireEvent.click(screen.getByRole('button', { name: 'Entre semana' }))
  fireEvent.click(screen.getByRole('button', { name: 'Por la mañana' }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('@s1 la columna izquierda hornea el eyebrow, el h2 con su id intacto y el párrafo del diseño', () => {
  it('@s1 hay UNA <section aria-labelledby="reserva-titulo"> y UN <h2 id="reserva-titulo"> con el texto del diseño', () => {
    const horneado = renderToString(<Reserva />)

    expect((horneado.match(/<section/g) ?? []).length).toBe(1)
    expect(horneado).toContain('aria-labelledby="reserva-titulo"')
    expect((horneado.match(/<h2[\s>]/g) ?? []).length).toBe(1)
    // 🔴 El id NO cambia (puerta 5: igualdad de conjuntos nav↔secciones); cambia el TEXTO.
    expect(horneado).toMatch(/<h2[^>]*id="reserva-titulo"[^>]*>¿Prefieres reservar por chat\?<\/h2>/)
  })

  it('@s1 sobre el h2 va el eyebrow «Reserva rápida» y bajo él el párrafo VERBATIM del prototipo', () => {
    const horneado = renderToString(<Reserva />)

    expect(horneado).toContain(`>${EYEBROW}<`)
    expect(horneado).toContain(PARRAFO)
  })

  it('@s1 la sección no aporta ningún <h1> y NO queda rastro del copy anterior', () => {
    const horneado = renderToString(<Reserva />)

    expect((horneado.match(/<h1[\s>]/g) ?? []).length).toBe(0)
    expect(horneado).not.toContain('Pide tu cita en un momento')
    expect(horneado).not.toContain(
      'Elige servicio, día y franja, y te llevamos a WhatsApp con el mensaje listo.',
    )
  })
})

describe('@s2 la sección ofrece EXACTAMENTE dos enlaces, en el orden del diseño', () => {
  it('@s2 hay dos role="link": «WhatsApp» primero y «Llamar al estudio» después', () => {
    render(<Reserva />)
    const enlaces = screen.getAllByRole('link')

    // «EXACTAMENTE dos» es lo que mata al mutante que resucita un tercer botón (el «Reservar por
    // WhatsApp» del mini-calendario). El chat de la derecha no aporta ningún enlace.
    expect(enlaces).toHaveLength(2)
    expect(enlaces[0]).toHaveAccessibleName(ENLACE_WA)
    expect(enlaces[1]).toHaveAccessibleName(ENLACE_TEL)
  })

  it('@s2 el texto VISIBLE de cada enlace coincide con su nombre accesible (SC 2.5.3 «Label in Name»)', () => {
    render(<Reserva />)
    const enlaces = screen.getAllByRole('link')

    expect(enlaces[0].textContent).toBe(ENLACE_WA)
    expect(enlaces[1].textContent).toBe(ENLACE_TEL)
  })

  it('@s2 ninguno de los dos abre pestaña nueva: sin target="_blank"', () => {
    render(<Reserva />)

    for (const enlace of screen.getAllByRole('link')) {
      expect(enlace).not.toHaveAttribute('target')
    }
  })
})

describe('@s3 el href de WhatsApp DERIVA de F-02 y lleva el texto demo urlencoded, sin aseverar el host', () => {
  it('@s3 el href contiene el E.164 sin "+" y el texto urlencoded exacto; nunca el formato legible ni el número falso', () => {
    const horneado = renderToString(<Reserva />)
    const enlace = /<a[^>]*href="([^"]*)"[^>]*>WhatsApp<\/a>/.exec(horneado)

    expect(enlace).not.toBeNull()
    const href = enlace?.[1] ?? ''

    expect(href).toContain('34625223366')
    expect(href).toContain('?text=Hola%2C%20quiero%20reservar%20por%20chat%20en%20Nails%20Lash%20Studio.')
    expect(href).not.toMatch(/\s/)
    expect(href).not.toContain(',')
    expect(href).not.toContain('625 22 33 66')
    expect(href).not.toContain('600123456')
    // A-10: el host NO se asevera aquí (ni wa.me ni api.whatsapp.com); se verifica a mano.
  })
})

describe('@s4 el .tsx NO hornea ni el número, ni el host, ni el texto demo — guarda a nivel de FUENTE', () => {
  it('@s4 el .tsx importa TELEFONO/waHref/telHref (ancla positiva) y NO contiene los literales prohibidos', () => {
    const bytes = bytesTsx()

    expect(bytes).toContain('export function Reserva')
    expect(bytes).toContain('waHref(')
    expect(bytes).toContain('telHref(')
    expect(bytes).toContain("from '../lib/site'")
    expect(bytes).toContain('TELEFONO')

    expect(bytes).not.toContain('625 22 33 66')
    expect(bytes).not.toContain('34625223366')
    expect(bytes).not.toContain('+34625223366')
    expect(bytes).not.toContain('600123456')
    expect(bytes).not.toContain('wa.me')
    expect(bytes).not.toContain('api.whatsapp.com')
    expect(bytes).not.toContain('whatsapp.com')
    expect(bytes).not.toContain('Hola, quiero reservar por chat en Nails Lash Studio.')
  })
})

describe('@s5 el href de llamar DERIVA de telHref y normaliza a E.164', () => {
  it('@s5 el href es exactamente "tel:+34625223366" (ancla positiva: el h2 del diseño está presente)', () => {
    const horneado = renderToString(<Reserva />)
    const enlace = /<a[^>]*href="([^"]*)"[^>]*>Llamar al estudio<\/a>/.exec(horneado)

    expect(horneado).toContain(TITULO)
    expect(enlace).not.toBeNull()
    expect(enlace?.[1]).toBe('tel:+34625223366')
    expect(enlace?.[1]).not.toContain(' ')
    expect(enlace?.[1]).not.toContain('-')
    expect(enlace?.[1]).not.toBe('tel:+34600123456')
  })
})

describe('@s6 en la columna izquierda YA NO HAY mini-calendario', () => {
  it('@s6 tras hidratar: el h2 y los dos enlaces siguen (ancla), CERO aria-pressed y sin rótulos ni horas del calendario', () => {
    render(<Reserva />)

    expect(screen.getByText(TITULO)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: ENLACE_WA })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: ENLACE_TEL })).toBeInTheDocument()

    expect(document.querySelectorAll('[aria-pressed]')).toHaveLength(0)
    expect(screen.queryByText('Servicio')).toBeNull()
    expect(screen.queryByText('Día')).toBeNull()
    expect(screen.queryByText('Hora')).toBeNull()
    expect(screen.queryByText('Cargando días…')).toBeNull()

    for (const hora of ['10:00', '11:30', '13:00', '16:00', '17:30', '19:00']) {
      expect(screen.queryByRole('button', { name: hora })).toBeNull()
    }
    expect(screen.queryByText('Elige servicio, día y hora')).toBeNull()
    expect(screen.queryByRole('link', { name: 'Reservar por WhatsApp' })).toBeNull()
  })

  it('@s6 los bytes de Reserva.tsx no contienen "Cargando días", ni "DOW", ni "HORAS", ni "diaIdx", ni "horaIdx"', () => {
    const bytes = bytesTsx()

    expect(bytes).not.toContain('Cargando días')
    expect(bytes).not.toContain('DOW')
    expect(bytes).not.toContain('HORAS')
    expect(bytes).not.toContain('diaIdx')
    expect(bytes).not.toContain('horaIdx')
  })
})

describe('@s7 la hoja de estilos pierde los bloques que solo vestían al calendario y conserva los vivos', () => {
  function scss(): string {
    return readFileSync('src/components/reserva.module.scss', 'utf8')
  }

  it('@s7 declara los selectores vivos del chat y de las acciones (ancla positiva)', () => {
    const hoja = scss()

    for (const selector of ['.rejilla', '.acciones', '.chat', '.chatCabecera', '.hilo', '.chipChat', '.entrada', '.reiniciar']) {
      expect(hoja).toMatch(new RegExp(`\\${selector}\\b`))
    }
  })

  it('@s7 NO declara ninguno de los selectores del mini-calendario retirado', () => {
    const hoja = scss()

    for (const selector of ['.paso', '.pasoTitulo', '.dia', '.diaActivo', '.diaDow', '.diaNum', '.cargando', '.chip', '.chipActivo', '.deshabilitado']) {
      expect(hoja).not.toMatch(new RegExp(`\\${selector}\\b`))
    }
  })

  it('@s7 no contiene "url(" ni "@font-face": no estrena ningún subrecurso', () => {
    const hoja = scss()

    expect(hoja).not.toContain('url(')
    expect(hoja).not.toContain('@font-face')
  })
})

describe('@s8 la cabecera del chat identifica al estudio con el nombre canónico y su estado', () => {
  it('@s8 muestra "Nails Lash Studio" y "en línea"; el avatar "nl" es aria-hidden y no aporta nombre accesible', () => {
    render(<Reserva />)

    expect(screen.getByText('Nails Lash Studio')).toBeInTheDocument()
    expect(screen.getByText('en línea')).toBeInTheDocument()
    expect(screen.queryByText('nails lash studio')).toBeNull()

    const avatar = screen.getByText('nl')
    expect(avatar).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img', { name: 'nl' })).toBeNull()
  })
})

describe('@s9 el chat viaja HORNEADO: sin JS ya se ve el primer mensaje y sus tres opciones', () => {
  it('@s9 el hilo horneado tiene EXACTAMENTE una burbuja con el saludo y se hornean las tres opciones; sin input ni "Reservar otra cita"', () => {
    const horneado = renderToString(<Reserva />)
    const totalBurbujas =
      (horneado.match(/data-de="bot"/g) ?? []).length + (horneado.match(/data-de="usuario"/g) ?? []).length

    expect(totalBurbujas).toBe(1)
    expect(horneado).toContain(SALUDO)
    expect(horneado).toContain('>Uñas<')
    expect(horneado).toContain('>Pestañas<')
    expect(horneado).toContain('>Cejas<')
    expect(horneado).not.toContain('placeholder="Escribe tu nombre…"')
    expect(horneado).not.toContain('Reservar otra cita')
  })
})

describe('@s10 las opciones del primer paso son las categorías REALES del salón', () => {
  it('@s10 son exactamente tres, en este orden: Uñas, Pestañas, Cejas', () => {
    render(<Reserva />)

    expect(screen.getAllByRole('button').map((boton) => boton.textContent)).toEqual([
      'Uñas',
      'Pestañas',
      'Cejas',
    ])
  })

  it('@s10 en el fragmento horneado no aparece "Facial" ni "Depilación", sin distinguir mayúsculas', () => {
    const horneado = renderToString(<Reserva />).toLowerCase()

    expect(horneado).not.toContain('facial')
    expect(horneado).not.toContain('depilaci')
  })
})

describe('@s11 elegir una opción añade mi respuesta y encadena la siguiente pregunta', () => {
  it('@s11 al pulsar "Uñas" el hilo pasa a tener EXACTAMENTE tres burbujas y cambian las opciones visibles', () => {
    const { container } = render(<Reserva />)

    fireEvent.click(screen.getByRole('button', { name: 'Uñas' }))

    expect(burbujasDe(container).map((b) => b.textContent)).toEqual([
      SALUDO,
      'Uñas',
      '¡Perfecto! ¿Qué día te viene mejor?',
    ])
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Entre semana',
      'Este fin de semana',
      'Lo antes posible',
    ])
  })
})

describe('@s12 el guion es FIJO y tiene cuatro pasos, con las opciones de cada uno', () => {
  it('@s12 paso 1: el mensaje es el saludo y las opciones son Uñas, Pestañas, Cejas', () => {
    render(<Reserva />)

    expect(screen.getByText(SALUDO)).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Uñas', 'Pestañas', 'Cejas'])
  })

  it('@s12 paso 2: tras el servicio, pregunta el día con sus tres opciones', () => {
    render(<Reserva />)
    fireEvent.click(screen.getByRole('button', { name: 'Uñas' }))

    expect(screen.getByText('¡Perfecto! ¿Qué día te viene mejor?')).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Entre semana',
      'Este fin de semana',
      'Lo antes posible',
    ])
  })

  it('@s12 paso 3: tras el día, pregunta la franja con sus tres opciones', () => {
    render(<Reserva />)
    fireEvent.click(screen.getByRole('button', { name: 'Uñas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Entre semana' }))

    expect(screen.getByText('Genial. ¿Prefieres alguna franja horaria?')).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Por la mañana',
      'Por la tarde',
      'Me es indiferente',
    ])
  })

  it('@s12 paso 4: tras la franja, pide el nombre y NO hay botones de opción (el guion no tiene un quinto paso)', () => {
    render(<Reserva />)
    avanzarHastaElNombre()

    expect(screen.getByText('Casi listo. ¿A qué nombre hago la reserva?')).toBeInTheDocument()
    // Solo queda el botón "Enviar" (glifo «→»): ningún chip de opción sobrevive al cuarto paso.
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['→'])
  })
})

describe('@s13 el cuarto paso pide el nombre por texto libre, sin botones de opción', () => {
  it('@s13 hay un campo con placeholder y nombre accesible correctos, y un botón "Enviar" cuyo nombre accesible NO es el glifo', () => {
    render(<Reserva />)
    avanzarHastaElNombre()

    const campo = screen.getByPlaceholderText('Escribe tu nombre…')
    expect(campo).toHaveAccessibleName('Tu nombre')

    const enviar = screen.getByRole('button', { name: 'Enviar' })
    expect(enviar.textContent).toBe('→')
    expect(screen.queryByRole('button', { name: '→' })).toBeNull()
  })
})

describe('@s14 enviar el nombre vacío o solo espacios no añade NADA al hilo', () => {
  const casos: readonly [string, string][] = [
    ['', 'la cadena vacía'],
    ['   ', 'solo espacios'],
  ]

  for (const [escrito, descripcion] of casos) {
    it(`@s14 con el campo en ${descripcion}, el hilo sigue en 7 burbujas y el paso 4 sigue activo`, () => {
      const { container } = render(<Reserva />)
      avanzarHastaElNombre()

      fireEvent.change(screen.getByPlaceholderText('Escribe tu nombre…'), { target: { value: escrito } })
      fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

      expect(burbujasDe(container)).toHaveLength(7)
      expect(screen.queryByText('undefined')).toBeNull()
      expect(screen.getByPlaceholderText('Escribe tu nombre…')).toBeInTheDocument()
    })
  }
})

describe('@s15 completar el guion muestra el resumen interpolado y cierra el chat', () => {
  it('@s15 con Uñas · Entre semana · Por la mañana · "Marta", la última burbuja es el resumen EXACTO y el chat se cierra', () => {
    render(<Reserva />)
    avanzarHastaElNombre()

    fireEvent.change(screen.getByPlaceholderText('Escribe tu nombre…'), { target: { value: 'Marta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(
      screen.getByText(
        '¡Gracias, Marta! ✨ Tu solicitud: Uñas · Entre semana · Por la mañana. Te confirmaremos la hora exacta por WhatsApp. ¡Te esperamos en Nails Lash Studio!',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Escribe tu nombre…')).toBeNull()
    // Solo el botón "Reservar otra cita" sigue en pie: ni chips ni input.
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Reservar otra cita' })).toBeInTheDocument()
  })
})

describe('@s16 la tecla Enter equivale al botón de enviar; cualquier otra tecla no envía nada', () => {
  it('@s16 Enter con "Marta" escrito hace ganar la burbuja "Marta" y el resumen final', () => {
    render(<Reserva />)
    avanzarHastaElNombre()

    const campo = screen.getByPlaceholderText('Escribe tu nombre…')
    fireEvent.change(campo, { target: { value: 'Marta' } })
    fireEvent.keyDown(campo, { key: 'Enter' })

    expect(screen.getByText('Marta')).toBeInTheDocument()
    expect(
      screen.getByText(
        '¡Gracias, Marta! ✨ Tu solicitud: Uñas · Entre semana · Por la mañana. Te confirmaremos la hora exacta por WhatsApp. ¡Te esperamos en Nails Lash Studio!',
      ),
    ).toBeInTheDocument()
  })

  it('@s16 Escape NO cambia nada: sigue con las mismas burbujas y el campo sigue con "Marta"', () => {
    const { container } = render(<Reserva />)
    avanzarHastaElNombre()

    const campo = screen.getByPlaceholderText('Escribe tu nombre…')
    fireEvent.change(campo, { target: { value: 'Marta' } })
    fireEvent.keyDown(campo, { key: 'Escape' })

    expect(burbujasDe(container)).toHaveLength(7)
    expect(screen.getByPlaceholderText('Escribe tu nombre…')).toHaveValue('Marta')
  })
})

describe('@s17 "Reservar otra cita" reinicia el guion sin rastro de las respuestas previas', () => {
  it('@s17 el hilo vuelve a tener EXACTAMENTE una burbuja (el saludo) y las tres opciones iniciales', () => {
    const { container } = render(<Reserva />)
    avanzarHastaElNombre()
    fireEvent.change(screen.getByPlaceholderText('Escribe tu nombre…'), { target: { value: 'Marta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    fireEvent.click(screen.getByRole('button', { name: 'Reservar otra cita' }))

    expect(burbujasDe(container).map((b) => b.textContent)).toEqual([SALUDO])
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Uñas', 'Pestañas', 'Cejas'])
    expect(screen.queryByRole('button', { name: 'Reservar otra cita' })).toBeNull()
    expect(screen.queryByPlaceholderText('Escribe tu nombre…')).toBeNull()
  })
})

describe('@s18 el hilo se desplaza automáticamente hasta el último mensaje', () => {
  it('@s18 con scrollHeight fijado a mano en 500, añadir un mensaje deja el scrollTop del hilo en 500', () => {
    render(<Reserva />)
    // 🔴 jsdom no calcula layout: sin fijar scrollHeight a mano, comparar 0 con 0 pasaría por vacuidad.
    const hilo = screen.getByText(SALUDO).parentElement as HTMLElement
    Object.defineProperty(hilo, 'scrollHeight', { value: 500, configurable: true })
    hilo.scrollTop = 0

    fireEvent.click(screen.getByRole('button', { name: 'Uñas' }))

    expect(hilo.scrollTop).toBe(500)
  })
})

describe('@s19 quién habla en cada burbuja vive en un atributo CONSULTABLE, no en una clase CSS', () => {
  it('@s19 la burbuja del saludo expone data-de="bot" y la de mi respuesta expone data-de="usuario"', () => {
    const { container } = render(<Reserva />)
    fireEvent.click(screen.getByRole('button', { name: 'Uñas' }))

    const burbujas = burbujasDe(container)
    expect(burbujas).toHaveLength(3)
    expect(burbujas[0]).toHaveAttribute('data-de', 'bot')
    expect(burbujas[1]).toHaveAttribute('data-de', 'usuario')
    expect(burbujas[2]).toHaveAttribute('data-de', 'bot')
  })

  it('@s19 la función pura claveBurbuja decide la clase por VALOR: true → burbujaBot, false → burbujaUsuario', () => {
    expect(claveBurbuja(true)).toBe('burbujaBot')
    expect(claveBurbuja(false)).toBe('burbujaUsuario')
  })
})

describe('@s20 el nombre se interpola VERBATIM y ninguna burbuja emite "undefined"', () => {
  it('@s20 con Cejas · Este fin de semana · Me es indiferente · "Mª Ángeles & Co.", el resumen contiene los fragmentos exactos', () => {
    const { container } = render(<Reserva />)

    fireEvent.click(screen.getByRole('button', { name: 'Cejas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Este fin de semana' }))
    fireEvent.click(screen.getByRole('button', { name: 'Me es indiferente' }))
    fireEvent.change(screen.getByPlaceholderText('Escribe tu nombre…'), { target: { value: 'Mª Ángeles & Co.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    const burbujas = burbujasDe(container)
    const ultima = burbujas[burbujas.length - 1].textContent ?? ''

    expect(ultima).toContain('¡Gracias, Mª Ángeles & Co.! ✨')
    expect(ultima).toContain('Tu solicitud: Cejas · Este fin de semana · Me es indiferente.')
    // El texto VISIBLE (textContent) muestra el «&» tal cual; «&amp;» es solo la representación en
    // el HTML fuente (React escapa al insertar), nunca el texto que lee la usuaria.
    expect(ultima).not.toContain('&amp;')
    for (const burbuja of burbujas) {
      expect(burbuja.textContent).not.toContain('undefined')
    }
  })
})

describe('@s22 la sección NO compone la solicitud ni envía nada — eso sigue siendo F-13', () => {
  it('@s22 el href de WhatsApp lleva un mensaje FIJO: sin servicio, sin fecha, sin hora ni nombre de persona', () => {
    const horneado = renderToString(<Reserva />)
    const enlace = /<a[^>]*href="([^"]*)"[^>]*>WhatsApp<\/a>/.exec(horneado)
    const href = enlace?.[1] ?? ''

    expect(href).toContain('?text=')
    expect(href).not.toMatch(/U%C3%B1as|Pesta%C3%B1as|Cejas/)
    expect(href).not.toMatch(/%3A\d{2}/)
    expect(href).not.toContain('Marta')
  })

  it('@s22 los bytes de Reserva.tsx no contienen "fetch(", ni "XMLHttpRequest", ni "window.location", ni "form action"', () => {
    const bytes = bytesTsx()

    expect(bytes).not.toContain('fetch(')
    expect(bytes).not.toContain('XMLHttpRequest')
    expect(bytes).not.toContain('window.location')
    expect(bytes).not.toContain('form action')
  })

  it('@s22 completar el chat no hace ninguna petición de red: el resumen es una burbuja LOCAL', () => {
    const fetchEspiado = vi.fn()
    vi.stubGlobal('fetch', fetchEspiado)

    render(<Reserva />)
    avanzarHastaElNombre()
    fireEvent.change(screen.getByPlaceholderText('Escribe tu nombre…'), { target: { value: 'Marta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(fetchEspiado).not.toHaveBeenCalled()
  })
})
