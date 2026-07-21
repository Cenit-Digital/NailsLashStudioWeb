import { readFileSync } from 'node:fs'

import { fireEvent, render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Equipo } from './Equipo'
import { diasOfrecidos, franjasDe, franjasOfrecibles, inicialDe, indiceCircular } from './equipo-logica'

/**
 * feature `equipo_reservas` — la sección de equipo con reserva por profesional y carrusel de reseñas.
 * Contrato: features/equipo_reservas.feature.
 *
 * REGLAS DURAS aplicadas aquí:
 *  · Lo HORNEADO (estructura estática, SSR, sin JS) se asevera sobre `renderToString(<Equipo />)`; el
 *    estado POST-hidratación (días, selección, carrusel) sobre jsdom con `render` + `fireEvent`.
 *  · ANTI-TAUTOLOGÍA: todo literal esperado va ESCRITO A MANO; NUNCA se importa `EQUIPO_DEMO` ni
 *    `LEYENDA_EQUIPO` como valor esperado. Solo se importan FUNCIONES (para llamarlas y medir su salida).
 *  · El estado vive en atributos CONSULTABLES (`disabled`, `aria-pressed`); se asevera por ROL, NOMBRE
 *    accesible, TEXTO o `data-*` — JAMÁS con `toHaveClass` (css:false: la clase es undefined en test).
 *  · El reloj se INYECTA con componentes locales `new Date(2026, 6, 16)` (jueves): determinista en
 *    cualquier zona horaria, porque `diasOfrecidos` opera con getDay()/getDate() locales (como Reserva.tsx).
 */

afterEach(() => {
  vi.useRealTimers()
})

/** El `<article>` de una profesional, localizado por su `<h3>` (nombre único). */
function tarjeta(nombre: string): HTMLElement {
  const encabezado = screen.getByRole('heading', { level: 3, name: nombre })
  const articulo = encabezado.closest('article')

  if (articulo === null) {
    throw new Error(`sin <article> para ${nombre}`)
  }

  return articulo
}

const PATRON_DIA = /^(dom|lun|mar|mié|jue|vie|sáb) \d{1,2}$/
const PATRON_HORA = /^\d{1,2}:\d{2}$/

/** Los chips de DÍA de una tarjeta (aria-label «mié 22»). */
function chipsDia(card: HTMLElement): HTMLElement[] {
  return within(card)
    .queryAllByRole('button')
    .filter((boton) => PATRON_DIA.test(boton.getAttribute('aria-label') ?? ''))
}

/** Los chips de HORA de una tarjeta (texto «16:00»). */
function chipsHora(card: HTMLElement): HTMLElement[] {
  return within(card)
    .queryAllByRole('button')
    .filter((boton) => PATRON_HORA.test(boton.textContent ?? ''))
}

/** El texto de la reseña visible de una tarjeta (el `<blockquote>` entrecomillado). */
function citaDe(card: HTMLElement): string {
  return card.querySelector('blockquote')?.textContent ?? ''
}

/** Fija el reloj a un jueves y renderiza la sección hidratada con sus seis días. */
function renderEnJueves(): void {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 16))
  render(<Equipo />)
}

const NOMBRES = ['Lucía', 'Carla', 'Andrea', 'Nerea', 'Marta', 'Paula', 'Sara']

// =============================================================================================
// LA CÁSCARA (@s1..@s4)
// =============================================================================================

describe('@s1 la sección se hornea navegable, con UNA <section>, siete <article> y el encabezado del diseño', () => {
  it('@s1 hay exactamente UNA <section> con aria-labelledby="equipo-titulo" y siete <article> (no <section>)', () => {
    const horneado = renderToString(<Equipo />)

    expect((horneado.match(/<section/g) ?? []).length).toBe(1)
    expect(horneado).toContain('aria-labelledby="equipo-titulo"')
    expect((horneado.match(/<article/g) ?? []).length).toBe(7)
  })

  it('@s1 hay UN <h2 id="equipo-titulo"> con el texto exacto, más el eyebrow y la intro del diseño', () => {
    const horneado = renderToString(<Equipo />)

    expect(horneado).toMatch(/<h2[^>]*id="equipo-titulo"[^>]*>Nuestro equipo de profesionales<\/h2>/)
    expect(horneado).toContain('>Equipo<')
    expect(horneado).toContain(
      'Elige a tu especialista, mira sus reseñas y reserva tu día y hora en segundos.',
    )
  })
})

describe('@s2 el ancla de la sección es exactamente "equipo-titulo" (destino del 7º enlace de la nav)', () => {
  it('@s2 el aria-labelledby de la <section> coincide con el id del <h2> y ese id es "equipo-titulo"', () => {
    // Escrito A MANO. El 7º enlace <a href="#equipo-titulo">Equipo</a> lo cablea MenuNavegacion.tsx
    // (otro agente): esta feature garantiza que EXISTE el ancla a la que ese enlace apuntará.
    const horneado = renderToString(<Equipo />)
    const labelledby = /<section[^>]*aria-labelledby="([^"]+)"/.exec(horneado)

    expect(labelledby?.[1]).toBe('equipo-titulo')
    expect(horneado).toMatch(/<h2[^>]*id="equipo-titulo"/)
  })
})

describe('@s3 se hornean las siete tarjetas, en el orden del diseño, cada nombre en un <h3>', () => {
  it('@s3 los <h3> son, en orden: Lucía, Carla, Andrea, Nerea, Marta, Paula, Sara', () => {
    const horneado = renderToString(<Equipo />)
    const nombres = [...horneado.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1])

    expect(nombres).toEqual(['Lucía', 'Carla', 'Andrea', 'Nerea', 'Marta', 'Paula', 'Sara'])
  })
})

describe('@s4 la sección no aporta ningún <h1>: aporta UN <h2> y SIETE <h3>', () => {
  it('@s4 en el horneado hay 0 <h1>, 1 <h2> y 7 <h3>', () => {
    const horneado = renderToString(<Equipo />)

    expect((horneado.match(/<h1[\s>]/g) ?? []).length).toBe(0)
    expect((horneado.match(/<h2[\s>]/g) ?? []).length).toBe(1)
    expect((horneado.match(/<h3[\s>]/g) ?? []).length).toBe(7)
  })
})

// =============================================================================================
// LOS DATOS: roles y especialidades REALES (@s5, @s6)
// =============================================================================================

describe('@s5 cada tarjeta muestra el rol y las DOS especialidades reales de esa profesional', () => {
  const casos: readonly { nombre: string; rol: string; especialidades: [string, string] }[] = [
    { nombre: 'Lucía', rol: 'Nail artist', especialidades: ['Uñas', 'Nail art'] },
    { nombre: 'Carla', rol: 'Esteticista', especialidades: ['Pestañas', 'Cejas'] },
    { nombre: 'Andrea', rol: 'Especialista en uñas', especialidades: ['Uñas', 'Pedicura'] },
    { nombre: 'Nerea', rol: 'Lash & brow', especialidades: ['Pestañas', 'Cejas'] },
    { nombre: 'Marta', rol: 'Esteticista', especialidades: ['Cejas', 'Pestañas'] },
    { nombre: 'Paula', rol: 'Nail artist', especialidades: ['Uñas', 'Nail art'] },
    { nombre: 'Sara', rol: 'Manicurista', especialidades: ['Uñas', 'Pedicura'] },
  ]

  for (const caso of casos) {
    it(`@s5 ${caso.nombre}: rol "${caso.rol}" y especialidades ${caso.especialidades.join(' + ')} en ese orden`, () => {
      render(<Equipo />)
      const card = tarjeta(caso.nombre)

      expect(within(card).getByText(caso.rol)).toBeInTheDocument()

      const lista = within(card).getByRole('list')
      const especialidades = within(lista)
        .getAllByRole('listitem')
        .map((item) => item.textContent)

      expect(especialidades).toEqual(caso.especialidades)
    })
  }
})

describe('@s6 ni "Facial" ni "Depilación" aparecen en la sección de equipo', () => {
  it('@s6 el horneado tiene el título y los siete nombres (ancla positiva) y NO "Facial" ni "Depilación"', () => {
    const horneado = renderToString(<Equipo />)
    const bajo = horneado.toLowerCase()

    // Ancla positiva PRIMERO (nunca verde por vacuidad).
    expect(horneado).toContain('Nuestro equipo de profesionales')
    for (const nombre of NOMBRES) {
      expect(horneado).toContain(nombre)
    }

    expect(bajo).not.toContain('facial')
    expect(bajo).not.toContain('depilaci')
  })
})

// =============================================================================================
// HUECO DE FOTO (@s7) y LEYENDA (@s8)
// =============================================================================================

describe('@s7 el hueco de foto es decorativo: sin imagen, sin literal prohibido, sin subrecurso externo', () => {
  it('@s7 hay siete <div aria-hidden> de foto, ningún <img>/src, ningún "ph-woman", ninguna URL externa', () => {
    const horneado = renderToString(<Equipo />)

    expect((horneado.match(/<div[^>]*aria-hidden="true"/g) ?? []).length).toBe(7)
    expect(horneado).not.toMatch(/<img\b/)
    expect(horneado).not.toContain('src=')
    expect(horneado.toLowerCase()).not.toContain('ph-woman')
    expect(horneado).not.toMatch(/https?:\/\//)
    expect(horneado).not.toContain('url(')
  })
})

describe('@s8 una leyenda visible declara que perfiles y reseñas son de ejemplo', () => {
  it('@s8 el horneado lleva la leyenda exacta y menciona AMBAS cosas: los perfiles y las reseñas', () => {
    const horneado = renderToString(<Equipo />)

    expect(horneado).toContain(
      'Equipo y reseñas de ejemplo · perfiles de muestra, pendientes de confirmar con el salón',
    )
    expect(horneado).toContain('reseñas de ejemplo')
    expect(horneado).toContain('perfiles de muestra')
  })
})

// =============================================================================================
// LOS DÍAS: horneado vacío (@s9) y generación pura saltando domingos (@s10)
// =============================================================================================

describe('@s9 el HTML horneado no lleva ninguna fecha: nace vacío y se puebla en cliente', () => {
  it('@s9 hay "Reserva tu cita" y botón disabled; "Cargando días…"; ningún chip (ningún aria-pressed)', () => {
    const horneado = renderToString(<Equipo />)

    // Ancla positiva: la tarjeta se horneó.
    expect(horneado).toContain('Reserva tu cita')
    expect(horneado).toContain('Elige día y hora')
    // Ni un chip de día ni de hora horneado → ningún aria-pressed en el HTML SSR.
    expect(horneado).not.toContain('aria-pressed')
    expect(horneado).toContain('Cargando días…')
    // El botón de reserva se hornea disabled.
    expect(horneado).toMatch(/<button[^>]*disabled/)
  })
})

describe('@s10 diasOfrecidos: seis días desde mañana, saltando domingos, con el reloj inyectado', () => {
  it('@s10 desde el jueves 2026-07-16 son: vie 17, sáb 18, lun 20, mar 21, mié 22, jue 23', () => {
    const dias = diasOfrecidos(new Date(2026, 6, 16))

    expect(dias.map((dia) => `${dia.dow} ${dia.day}`)).toEqual([
      'vie 17',
      'sáb 18',
      'lun 20',
      'mar 21',
      'mié 22',
      'jue 23',
    ])
    expect(dias).toHaveLength(6)
  })

  it('@s10 el domingo (día 19) se OMITE y "hoy" (16) no aparece: la serie empieza mañana', () => {
    const dias = diasOfrecidos(new Date(2026, 6, 16))

    expect(dias.some((dia) => dia.dow === 'dom')).toBe(false)
    expect(dias.some((dia) => dia.day === 19)).toBe(false)
    expect(dias.some((dia) => dia.day === 16)).toBe(false)
  })

  it('@s10 es determinista y mapea el día inglés para el filtro (sáb → Saturday)', () => {
    expect(diasOfrecidos(new Date(2026, 6, 16))).toEqual(diasOfrecidos(new Date(2026, 6, 16)))
    expect(diasOfrecidos(new Date(2026, 6, 16)).find((dia) => dia.dow === 'sáb')?.diaSemana).toBe(
      'Saturday',
    )
  })
})

// =============================================================================================
// LAS FRANJAS: dependientes del día, filtradas contra F-10 (@s11..@s14)
// =============================================================================================

describe('@s11 el selector de hora no existe hasta elegir un día', () => {
  it('@s11 tras hidratar: cero franjas, seis chips en aria-pressed="false", botón disabled', () => {
    renderEnJueves()
    const card = tarjeta('Lucía')

    expect(chipsHora(card)).toHaveLength(0)

    const dias = chipsDia(card)
    expect(dias).toHaveLength(6)
    for (const chip of dias) {
      expect(chip).toHaveAttribute('aria-pressed', 'false')
    }

    expect(within(card).getByRole('button', { name: 'Elige día y hora' })).toBeDisabled()
  })
})

describe('@s12 elegir un día laborable ofrece las seis franjas del salón', () => {
  it('@s12 al pulsar "mié 22" aparecen 10:00, 11:30, 13:00, 16:00, 17:30, 19:00 y solo ese chip queda pulsado', () => {
    renderEnJueves()
    const card = tarjeta('Lucía')

    fireEvent.click(within(card).getByRole('button', { name: 'mié 22' }))

    expect(chipsHora(card).map((chip) => chip.textContent)).toEqual([
      '10:00',
      '11:30',
      '13:00',
      '16:00',
      '17:30',
      '19:00',
    ])
    expect(within(card).getByRole('button', { name: 'mié 22' })).toHaveAttribute('aria-pressed', 'true')
    expect(
      chipsDia(card).filter((chip) => chip.getAttribute('aria-pressed') === 'true'),
    ).toHaveLength(1)
  })
})

describe('@s13 elegir el SÁBADO ofrece solo las franjas anteriores al cierre de las 14:00', () => {
  it('@s13 al pulsar "sáb 18" aparecen SOLO 10:00, 11:30 y 13:00; no 16:00/17:30/19:00', () => {
    renderEnJueves()
    const card = tarjeta('Lucía')

    fireEvent.click(within(card).getByRole('button', { name: 'sáb 18' }))

    expect(chipsHora(card).map((chip) => chip.textContent)).toEqual(['10:00', '11:30', '13:00'])
    expect(within(card).queryByRole('button', { name: '16:00' })).toBeNull()
    expect(within(card).queryByRole('button', { name: '17:30' })).toBeNull()
    expect(within(card).queryByRole('button', { name: '19:00' })).toBeNull()
  })
})

describe('@s14 cambiar de día deselecciona la hora ya elegida', () => {
  it('@s14 con mié 22 + 16:00 elegidos, pulsar "jue 23" borra la hora y el botón vuelve a disabled', () => {
    renderEnJueves()
    const card = tarjeta('Lucía')

    fireEvent.click(within(card).getByRole('button', { name: 'mié 22' }))
    fireEvent.click(within(card).getByRole('button', { name: '16:00' }))
    fireEvent.click(within(card).getByRole('button', { name: 'jue 23' }))

    expect(chipsHora(card).some((chip) => chip.getAttribute('aria-pressed') === 'true')).toBe(false)
    expect(within(card).getByRole('button', { name: 'jue 23' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(card).getByRole('button', { name: 'mié 22' })).toHaveAttribute('aria-pressed', 'false')
    expect(within(card).getByRole('button', { name: 'Elige día y hora' })).toBeDisabled()
  })
})

// =============================================================================================
// EL BOTÓN DE RESERVA y la confirmación (@s15..@s18)
// =============================================================================================

describe('@s15 mientras falte día u hora, el botón está disabled con la etiqueta fija', () => {
  it('@s15 sin día y sin hora: disabled con "Elige día y hora"', () => {
    renderEnJueves()
    const card = tarjeta('Lucía')

    const boton = within(card).getByRole('button', { name: 'Elige día y hora' })
    expect(boton).toBeDisabled()
    expect(boton).toHaveTextContent('Elige día y hora')
  })

  it('@s15 con el día "mié 22" y sin hora: sigue disabled con "Elige día y hora"', () => {
    renderEnJueves()
    const card = tarjeta('Lucía')

    fireEvent.click(within(card).getByRole('button', { name: 'mié 22' }))

    const boton = within(card).getByRole('button', { name: 'Elige día y hora' })
    expect(boton).toBeDisabled()
    expect(boton).toHaveTextContent('Elige día y hora')
  })
})

describe('@s16 con día y hora el botón se habilita y su etiqueta nombra la cita', () => {
  it('@s16 tras elegir mié 22 + 16:00 el botón NO está disabled y dice "Reservar · mié 22 · 16:00"', () => {
    renderEnJueves()
    const card = tarjeta('Lucía')

    fireEvent.click(within(card).getByRole('button', { name: 'mié 22' }))
    fireEvent.click(within(card).getByRole('button', { name: '16:00' }))

    const boton = within(card).getByRole('button', { name: 'Reservar · mié 22 · 16:00' })
    expect(boton).not.toBeDisabled()
    expect(boton).toHaveTextContent('Reservar · mié 22 · 16:00')

    const horas = chipsHora(card)
    expect(horas.filter((chip) => chip.getAttribute('aria-pressed') === 'true')).toHaveLength(1)
    expect(horas.find((chip) => chip.textContent === '16:00')).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('@s17 confirmar sustituye el calendario por el mensaje de confirmación', () => {
  it('@s17 al reservar aparece el mensaje, el subtexto y "Cambiar", y desaparecen los chips', () => {
    renderEnJueves()
    const card = tarjeta('Lucía')

    fireEvent.click(within(card).getByRole('button', { name: 'mié 22' }))
    fireEvent.click(within(card).getByRole('button', { name: '16:00' }))
    fireEvent.click(within(card).getByRole('button', { name: 'Reservar · mié 22 · 16:00' }))

    expect(within(card).getByText('Cita con Lucía el mié 22 a las 16:00')).toBeInTheDocument()
    expect(within(card).getByText('Te confirmaremos por WhatsApp.')).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: 'Cambiar' })).toBeInTheDocument()
    expect(chipsDia(card)).toHaveLength(0)
    expect(chipsHora(card)).toHaveLength(0)
  })
})

describe('@s18 "Cambiar" devuelve la tarjeta a su estado inicial', () => {
  it('@s18 tras confirmar, "Cambiar" restaura "Reserva tu cita", seis chips en false, botón disabled', () => {
    renderEnJueves()
    const card = tarjeta('Lucía')

    fireEvent.click(within(card).getByRole('button', { name: 'mié 22' }))
    fireEvent.click(within(card).getByRole('button', { name: '16:00' }))
    fireEvent.click(within(card).getByRole('button', { name: 'Reservar · mié 22 · 16:00' }))
    fireEvent.click(within(card).getByRole('button', { name: 'Cambiar' }))

    expect(within(card).getByText('Reserva tu cita')).toBeInTheDocument()
    const dias = chipsDia(card)
    expect(dias).toHaveLength(6)
    for (const chip of dias) {
      expect(chip).toHaveAttribute('aria-pressed', 'false')
    }
    expect(chipsHora(card)).toHaveLength(0)
    expect(within(card).getByRole('button', { name: 'Elige día y hora' })).toBeDisabled()
    expect(within(card).queryByText('Cita con Lucía el mié 22 a las 16:00')).toBeNull()
    expect(within(card).queryByRole('button', { name: 'Cambiar' })).toBeNull()
  })

  it('@s18 tras "Cambiar", re-elegir día y hora NO reconfirma sola: hace falta pulsar "Reservar" otra vez', () => {
    // `reiniciar` limpia la reserva confirmada. Que baste con reponer día+hora para que la
    // confirmación reaparezca (sin pulsar el botón) sería el defecto: la reserva se decide SOLO al
    // pulsar "Reservar", nunca por tener la selección completa.
    renderEnJueves()
    const card = tarjeta('Lucía')

    fireEvent.click(within(card).getByRole('button', { name: 'mié 22' }))
    fireEvent.click(within(card).getByRole('button', { name: '16:00' }))
    fireEvent.click(within(card).getByRole('button', { name: 'Reservar · mié 22 · 16:00' }))
    fireEvent.click(within(card).getByRole('button', { name: 'Cambiar' }))

    // Selección de nuevo COMPLETA, pero sin confirmar.
    fireEvent.click(within(card).getByRole('button', { name: 'mié 22' }))
    fireEvent.click(within(card).getByRole('button', { name: '16:00' }))

    expect(within(card).queryByText('Cita con Lucía el mié 22 a las 16:00')).toBeNull()
    expect(within(card).queryByRole('button', { name: 'Cambiar' })).toBeNull()

    const boton = within(card).getByRole('button', { name: 'Reservar · mié 22 · 16:00' })
    expect(boton).not.toBeDisabled()
    expect(boton).toHaveTextContent('Reservar · mié 22 · 16:00')
  })
})

// =============================================================================================
// ESTADO INDEPENDIENTE POR TARJETA (@s19)
// =============================================================================================

describe('@s19 elegir un día en una tarjeta no altera ninguna de las otras seis', () => {
  it('@s19 al pulsar "mié 22" en Lucía, las otras seis siguen sin selector, en false y con botón disabled', () => {
    renderEnJueves()
    const lucia = tarjeta('Lucía')

    fireEvent.click(within(lucia).getByRole('button', { name: 'mié 22' }))

    expect(chipsHora(lucia).length).toBeGreaterThan(0)
    expect(within(lucia).getByRole('button', { name: 'mié 22' })).toHaveAttribute('aria-pressed', 'true')

    for (const nombre of ['Carla', 'Andrea', 'Nerea', 'Marta', 'Paula', 'Sara']) {
      const card = tarjeta(nombre)
      expect(chipsHora(card)).toHaveLength(0)
      for (const chip of chipsDia(card)) {
        expect(chip).toHaveAttribute('aria-pressed', 'false')
      }
      expect(within(card).getByRole('button', { name: 'Elige día y hora' })).toBeDisabled()
    }
  })
})

// =============================================================================================
// EL CARRUSEL DE RESEÑAS (@s20..@s23)
// =============================================================================================

describe('@s20 cada tarjeta arranca mostrando la primera reseña de su rotación', () => {
  it('@s20 cada tarjeta muestra una reseña entrecomillada con autora y la estrella accesible "5 de 5 estrellas"', () => {
    render(<Equipo />)

    for (const nombre of NOMBRES) {
      const card = tarjeta(nombre)
      expect(within(card).getByRole('img', { name: '5 de 5 estrellas' })).toBeInTheDocument()
      expect(citaDe(card)).toMatch(/^“.+”$/)

      const pie = card.querySelector('figcaption')
      expect(pie).not.toBeNull()
      const autora = pie?.querySelector('span')?.textContent ?? ''
      expect(autora.length).toBeGreaterThan(0)
    }
  })

  it('@s20 la primera reseña de Lucía y la de Carla son distintas', () => {
    render(<Equipo />)

    expect(citaDe(tarjeta('Lucía'))).not.toBe(citaDe(tarjeta('Carla')))
  })

  it('@s20 la rotación de Lucía tiene al menos TRES reseñas distintas', () => {
    render(<Equipo />)
    const card = tarjeta('Lucía')
    const siguiente = within(card).getByRole('button', { name: 'Reseña siguiente de Lucía' })
    const textos = new Set<string>()

    textos.add(citaDe(card))
    fireEvent.click(siguiente)
    textos.add(citaDe(card))
    fireEvent.click(siguiente)
    textos.add(citaDe(card))

    expect(textos.size).toBe(3)
  })
})

describe('@s21 avanzar más allá de la última reseña vuelve a la primera (no a un hueco)', () => {
  it('@s21 desde la última, "siguiente" muestra la primera y nunca "undefined" ni vacío', () => {
    render(<Equipo />)
    const card = tarjeta('Lucía')
    const siguiente = within(card).getByRole('button', { name: 'Reseña siguiente de Lucía' })
    const primera = citaDe(card)

    // La rotación de Lucía tiene 3 reseñas: dos "siguiente" la dejan en la ÚLTIMA (índice 2).
    fireEvent.click(siguiente)
    fireEvent.click(siguiente)
    const ultima = citaDe(card)
    expect(ultima).not.toBe(primera)

    // Un "siguiente" más lleva el índice interno a n (=3) → debe volver a la PRIMERA, no a undefined.
    fireEvent.click(siguiente)
    expect(citaDe(card)).toBe(primera)
    expect(citaDe(card)).not.toContain('undefined')
    expect(citaDe(card)).not.toBe('')
  })
})

describe('@s22 retroceder antes de la primera reseña vuelve a la última (no a un índice negativo)', () => {
  it('@s22 desde la primera, "anterior" muestra la última y nunca "undefined" ni vacío', () => {
    render(<Equipo />)
    const card = tarjeta('Lucía')
    const anterior = within(card).getByRole('button', { name: 'Reseña anterior de Lucía' })
    const siguiente = within(card).getByRole('button', { name: 'Reseña siguiente de Lucía' })
    const primera = citaDe(card)

    // El índice interno pasa a −1 → la normalización ((i%n)+n)%n debe dar la ÚLTIMA, no undefined.
    fireEvent.click(anterior)
    const ultima = citaDe(card)
    expect(ultima).not.toBe(primera)
    expect(ultima).not.toContain('undefined')
    expect(ultima).not.toBe('')

    // Y avanzar desde ahí vuelve a la primera (coherencia del ciclo).
    fireEvent.click(siguiente)
    expect(citaDe(card)).toBe(primera)
  })
})

describe('@s23 mover el carrusel de una tarjeta no mueve el de las demás', () => {
  it('@s23 al avanzar la reseña de Lucía, Carla sigue en su primera reseña', () => {
    render(<Equipo />)
    const lucia = tarjeta('Lucía')
    const carla = tarjeta('Carla')
    const luciaPrimera = citaDe(lucia)
    const carlaPrimera = citaDe(carla)

    fireEvent.click(within(lucia).getByRole('button', { name: 'Reseña siguiente de Lucía' }))

    expect(citaDe(lucia)).not.toBe(luciaPrimera)
    expect(citaDe(carla)).toBe(carlaPrimera)
  })
})

// =============================================================================================
// ACCESIBILIDAD (@s24, @s25)
// =============================================================================================

describe('@s24 el estado de selección vive en aria-pressed, uno solo pulsado por grupo, presente en todos', () => {
  it('@s24 con mié 22 + 16:00: un día en true (cinco false) y una hora en true (cinco false), todos con el atributo', () => {
    renderEnJueves()
    const card = tarjeta('Lucía')

    fireEvent.click(within(card).getByRole('button', { name: 'mié 22' }))
    fireEvent.click(within(card).getByRole('button', { name: '16:00' }))

    const dias = chipsDia(card)
    const horas = chipsHora(card)

    expect(dias.filter((c) => c.getAttribute('aria-pressed') === 'true')).toHaveLength(1)
    expect(dias.filter((c) => c.getAttribute('aria-pressed') === 'false')).toHaveLength(5)
    expect(horas.filter((c) => c.getAttribute('aria-pressed') === 'true')).toHaveLength(1)
    expect(horas.filter((c) => c.getAttribute('aria-pressed') === 'false')).toHaveLength(5)

    for (const chip of [...dias, ...horas]) {
      expect(chip.getAttribute('aria-pressed')).not.toBeNull()
    }
  })
})

describe('@s25 las flechas del carrusel tienen nombre accesible descriptivo, no un glifo', () => {
  it('@s25 Lucía tiene "Reseña anterior de Lucía" y "Reseña siguiente de Lucía"; ningún botón se llama "←" ni "→"', () => {
    render(<Equipo />)
    const card = tarjeta('Lucía')

    expect(within(card).getByRole('button', { name: 'Reseña anterior de Lucía' })).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: 'Reseña siguiente de Lucía' })).toBeInTheDocument()
    expect(within(card).queryByRole('button', { name: '←' })).toBeNull()
    expect(within(card).queryByRole('button', { name: '→' })).toBeNull()
  })

  it('@s25 los catorce controles de carrusel (dos por tarjeta) tienen nombres accesibles DISTINTOS', () => {
    render(<Equipo />)
    const nombres: string[] = []

    for (const nombre of NOMBRES) {
      const card = tarjeta(nombre)
      nombres.push(
        within(card).getByRole('button', { name: `Reseña anterior de ${nombre}` }).getAttribute('aria-label') ??
          '',
      )
      nombres.push(
        within(card).getByRole('button', { name: `Reseña siguiente de ${nombre}` }).getAttribute('aria-label') ??
          '',
      )
    }

    expect(nombres).toHaveLength(14)
    expect(new Set(nombres).size).toBe(14)
  })
})

// =============================================================================================
// NÚCLEO MUTABLE PURO: indiceCircular y franjasDe por valor (donde muerde la mutación)
// =============================================================================================

describe('indiceCircular — vuelta circular en ambos sentidos: ((i % n) + n) % n', () => {
  it('avanzar dentro y más allá del rango normaliza al primero (i=n → 0)', () => {
    expect(indiceCircular(0, 3)).toBe(0)
    expect(indiceCircular(1, 3)).toBe(1)
    expect(indiceCircular(2, 3)).toBe(2)
    expect(indiceCircular(3, 3)).toBe(0)
    expect(indiceCircular(4, 3)).toBe(1)
  })

  it('retroceder por debajo de cero normaliza al último (i=-1 → n-1), nunca negativo', () => {
    expect(indiceCircular(-1, 3)).toBe(2)
    expect(indiceCircular(-2, 3)).toBe(1)
    expect(indiceCircular(-3, 3)).toBe(0)
  })
})

describe('franjasDe — filtra las franjas contra el horario real de F-10', () => {
  it('un día laborable ofrece las seis franjas', () => {
    expect(franjasDe('Wednesday')).toEqual(['10:00', '11:30', '13:00', '16:00', '17:30', '19:00'])
  })

  it('el sábado (cierre 14:00) ofrece solo tres y NUNCA 16:00/17:30/19:00', () => {
    expect(franjasDe('Saturday')).toEqual(['10:00', '11:30', '13:00'])
    expect(franjasDe('Saturday')).not.toContain('16:00')
    expect(franjasDe('Saturday')).not.toContain('17:30')
    expect(franjasDe('Saturday')).not.toContain('19:00')
  })

  it('el domingo (cerrado) no ofrece ninguna franja', () => {
    expect(franjasDe('Sunday')).toEqual([])
  })
})

describe('franjasOfrecibles — el intervalo semiabierto [abre, cierra) filtra por AMBAS cotas de frontera', () => {
  it('descarta la franja candidata ANTERIOR a la apertura (abre a las 11:00 → 10:00 NO se ofrece)', () => {
    // 11:00 = 660 min, 20:00 = 1200 min (literales A MANO). La cota INFERIOR `>= abre` es la única que
    // excluye las 10:00: sin ella, 10:00 (600 < 660) se colaría antes de que el salón abra.
    const ofrecidas = franjasOfrecibles([{ abre: 660, cierra: 1200 }])

    expect(ofrecidas).not.toContain('10:00')
    expect(ofrecidas).toEqual(['11:30', '13:00', '16:00', '17:30', '19:00'])
  })

  it('descarta la franja candidata que empieza JUSTO al cierre (cierra a las 13:00 → 13:00 NO se ofrece)', () => {
    // 10:00 = 600 min, 13:00 = 780 min (literales A MANO). El intervalo es SEMIABIERTO: `< cierra`
    // (no `<=`) excluye las 13:00 exactas; con `<=` se ofrecería una cita en el minuto del cierre.
    const ofrecidas = franjasOfrecibles([{ abre: 600, cierra: 780 }])

    expect(ofrecidas).not.toContain('13:00')
    expect(ofrecidas).toEqual(['10:00', '11:30'])
  })
})

// =============================================================================================
// AMPLIACIÓN (2026-07-21) — EL MONOGRAMA: la INICIAL de cada profesional sobre el hueco rosa
// (@s26..@s31). @s21/@s30/@s31 hablan de "pnpm build" y "dist/index.html": esta sesión tiene
// PROHIBIDO crear tests build-based nuevos (cada uno cuesta un build completo). Se cubren con
// `renderToString(<Equipo />)`, el MISMO mecanismo que usa vite-react-ssg para prerenderizar (igual
// que ya hace `reserva.test.tsx`); el `pnpm build` real con las cinco puertas lo corre el lead una
// vez al cierre de la sesión.
// =============================================================================================

/** El hueco de foto es SIEMPRE el primer hijo del <article> (antes de .cuerpo), aria-hidden. */
function huecoDeFoto(card: HTMLElement): HTMLElement {
  return card.children[0] as HTMLElement
}

describe('@s26 cada una de las siete tarjetas muestra el monograma con la inicial de SU profesional', () => {
  const casos: readonly [string, string][] = [
    ['Lucía', 'L'],
    ['Carla', 'C'],
    ['Andrea', 'A'],
    ['Nerea', 'N'],
    ['Marta', 'M'],
    ['Paula', 'P'],
    ['Sara', 'S'],
  ]

  for (const [nombre, inicial] of casos) {
    it(`@s26 la tarjeta de ${nombre} muestra EXACTAMENTE un monograma y su texto es exactamente "${inicial}"`, () => {
      render(<Equipo />)
      const hueco = huecoDeFoto(tarjeta(nombre))

      expect(hueco).toHaveAttribute('aria-hidden', 'true')
      expect(hueco.children).toHaveLength(1)
      expect(hueco.textContent).toBe(inicial)
      expect(hueco.textContent).toHaveLength(1)
    })
  }
})

describe('@s27 la inicial se devuelve SIEMPRE en mayúscula, venga el nombre como venga', () => {
  const casos: readonly [string, string][] = [
    ['Lucía', 'L'],
    ['lucía', 'L'],
    ['LUCÍA', 'L'],
    ['ángela', 'Á'],
  ]

  for (const [nombre, esperado] of casos) {
    it(`@s27 inicialDe("${nombre}") es exactamente "${esperado}"`, () => {
      expect(inicialDe(nombre)).toBe(esperado)
    })
  }
})

describe('@s28 CASO LÍMITE — un nombre vacío devuelve cadena vacía, sin reventar', () => {
  it('@s28 inicialDe("") no lanza, y devuelve "" (nunca "undefined" ni "U")', () => {
    expect(() => inicialDe('')).not.toThrow()

    const resultado = inicialDe('')
    expect(resultado).toBe('')
    expect(resultado).not.toBe('undefined')
    expect(resultado).not.toBe('U')
  })
})

describe('@s29 el monograma es DECORATIVO: no aporta nombre accesible ni contamina el de la tarjeta', () => {
  it('@s29 ninguna letra suelta se anuncia como botón, encabezado o imagen; el h3 sigue diciendo "Lucía"', () => {
    render(<Equipo />)

    for (const letra of ['L', 'C', 'A', 'N', 'M', 'P', 'S']) {
      expect(screen.queryByRole('button', { name: letra })).toBeNull()
      expect(screen.queryByRole('heading', { name: letra })).toBeNull()
      expect(screen.queryByRole('img', { name: letra })).toBeNull()
    }

    const hueco = huecoDeFoto(tarjeta('Lucía'))
    expect(hueco).toHaveAttribute('aria-hidden', 'true')
    expect(hueco.querySelector('img')).toBeNull()
    expect(hueco).not.toHaveAttribute('role')
    expect(hueco).not.toHaveAttribute('aria-label')
    expect(hueco).not.toHaveAttribute('title')

    expect(screen.getByRole('heading', { level: 3, name: 'Lucía' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(7)
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
  })
})

describe('@s30 las siete iniciales viajan HORNEADAS (SSR): no dependen de la hidratación', () => {
  it('@s30 el HTML horneado trae las siete letras, en orden, todas DISTINTAS, junto al ancla positiva', () => {
    const horneado = renderToString(<Equipo />)

    // Ancla positiva PRIMERO: la extracción no devolvió la cadena vacía.
    expect(horneado).toContain('Nuestro equipo de profesionales')
    for (const nombre of NOMBRES) {
      expect(horneado).toContain(nombre)
    }

    const monogramas = [...horneado.matchAll(/aria-hidden="true"><span[^>]*>([^<]+)<\/span>/g)].map(
      (coincidencia) => coincidencia[1],
    )

    expect(monogramas).toEqual(['L', 'C', 'A', 'N', 'M', 'P', 'S'])
    expect(new Set(monogramas).size).toBe(7)
  })
})

describe('@s31 el monograma NO reintroduce fotos ni rompe las puertas de placeholders/terceros', () => {
  it('@s31 en el horneado no aparece "ph-woman", ni ningún "<img", ni "src=", ni una url() externa', () => {
    const horneado = renderToString(<Equipo />)

    expect(horneado.toLowerCase()).not.toContain('ph-woman')
    expect(horneado).not.toMatch(/<img\b/)
    expect(horneado).not.toContain('src=')
    expect(horneado).not.toMatch(/https?:\/\//)
    expect(horneado).not.toContain('url(')
  })

  it('@s31 el bloque .monograma reutiliza el par YA declarado en la matriz de contraste (--accent-dark sobre --accent-soft)', () => {
    const scss = readFileSync('src/components/equipo.module.scss', 'utf8')

    expect(scss).toMatch(/\.monograma\s*\{[^}]*color:\s*var\(--accent-dark\)/)
    expect(scss).toMatch(/\.foto\s*\{[^}]*background:\s*var\(--accent-soft\)/)
  })
})
