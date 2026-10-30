import { describe, expect, it } from 'vitest'

import type { OpcionCita } from './catalogo.ts'
import {
  estadoInicial,
  type EstadoReserva,
  etiquetaOpcion,
  precioLegible,
  type EventoReserva,
  numeroDePaso,
  peticionDe,
  puedeContinuar,
  reducirReserva,
  resumenDe,
  vistaServicio,
} from './flujo-reserva.ts'

/**
 * Citas · Fase 7 (issue #39): la máquina de pasos del modal. Literales a mano (anti-tautología).
 * Noviembre de 2026 es CET: las 10:00 de Madrid del martes 3 son las 09:00Z.
 */
const HUECO_10 = {
  hora: '10:00',
  inicio: '2026-11-03T09:00:00.000Z',
  fin: '2026-11-03T10:00:00.000Z',
}
const HUECO_11 = {
  hora: '11:00',
  inicio: '2026-11-03T10:00:00.000Z',
  fin: '2026-11-03T11:00:00.000Z',
}
const CLAVE_A = '0b8f9a52-6f1e-4c3a-9d2b-1a2b3c4d5e6f'
const CLAVE_B = '1c8f9a52-6f1e-4c3a-9d2b-1a2b3c4d5e6f'

function aplicar(estado: EstadoReserva, ...eventos: EventoReserva[]): EstadoReserva {
  return eventos.reduce(reducirReserva, estado)
}

const SERVICIO: EventoReserva[] = [
  { tipo: 'categoria', id: 'manicura' },
  { tipo: 'subservicio', id: 'manicura-rusa' },
  { tipo: 'opcion', id: 'manicura-rusa-m' },
]

/** Hasta el resumen de «Manicura · Uña Mediana», martes 3 a las 10:00, a nombre de Ana. */
function enResumen(): EstadoReserva {
  return aplicar(
    estadoInicial(),
    ...SERVICIO,
    { tipo: 'continuar' },
    { tipo: 'dia', fecha: '2026-11-03' },
    { tipo: 'continuar' },
    { tipo: 'hora', hueco: HUECO_10 },
    { tipo: 'continuar' },
    { tipo: 'escribir', campo: 'nombre', valor: ' Ana ' },
    { tipo: 'escribir', campo: 'telefono', valor: '625 22 33 66' },
    { tipo: 'escribir', campo: 'email', valor: 'ana@mail.es' },
    { tipo: 'revisar' },
  )
}

describe('estado inicial y números de paso (@s1, @s5)', () => {
  it('empieza en «Servicio» sin nada elegido', () => {
    expect(estadoInicial()).toEqual({
      paso: 'servicio',
      categoria: null,
      subservicio: null,
      opcion: null,
      fecha: null,
      hueco: null,
      datos: { nombre: '', telefono: '', email: '' },
      errores: {},
      clave: null,
      firma: null,
      enviando: false,
      aviso: null,
      fallo: null,
      cita: null,
    })
  })

  it('«Paso n de 4»: servicio 1, día 2, hora 3, datos 4; resumen y confirmada no cuentan', () => {
    expect(numeroDePaso('servicio')).toBe(1)
    expect(numeroDePaso('dia')).toBe(2)
    expect(numeroDePaso('hora')).toBe(3)
    expect(numeroDePaso('datos')).toBe(4)
    expect(numeroDePaso('resumen')).toBeNull()
    expect(numeroDePaso('confirmada')).toBeNull()
  })

  it('@s5 reiniciar vuelve al estado inicial desde cualquier punto', () => {
    expect(reducirReserva(enResumen(), { tipo: 'reiniciar' })).toEqual(estadoInicial())
  })
})

describe('@s7-@s10 paso «Servicio»', () => {
  it('@s7 las categorías reservables, en orden', () => {
    expect(vistaServicio(estadoInicial()).categorias.map((c) => c.nombre)).toEqual([
      'Manicura',
      'Pedicura',
      'Depilación',
      'Retirada',
      'Manipedi',
    ])
    expect(vistaServicio(estadoInicial()).categoria).toBeNull()
    expect(vistaServicio(estadoInicial()).subservicio).toBeNull()
  })

  it('@s8 elegir categoría y subservicio los muestra; sin «Reparación de Uña Rota»', () => {
    const estado = aplicar(estadoInicial(), SERVICIO[0], SERVICIO[1])
    const vista = vistaServicio(estado)
    expect(vista.categoria?.id).toBe('manicura')
    const nombres = vista.categoria?.subservicios.map((s) => s.nombre)
    expect(nombres).toContain('Manicura Completa con Base Proteínica (Técnica Rusa)')
    expect(nombres).not.toContain('Reparación de Uña Rota')
    expect(vista.subservicio?.id).toBe('manicura-rusa')
    expect(vista.subservicio?.pregunta).toBe('Selecciona el largo de tu uña:')
    expect(vista.subservicio?.opciones.map((o) => o.etiqueta)).not.toContain('Uña Extra Larga')
  })

  it('cambiar de categoría borra subservicio y opción; cambiar de subservicio borra la opción', () => {
    const lleno = aplicar(estadoInicial(), ...SERVICIO)
    expect(reducirReserva(lleno, { tipo: 'categoria', id: 'pedicura' })).toMatchObject({
      categoria: 'pedicura',
      subservicio: null,
      opcion: null,
    })
    expect(reducirReserva(lleno, { tipo: 'subservicio', id: 'manicura-gel' })).toMatchObject({
      categoria: 'manicura',
      subservicio: 'manicura-gel',
      opcion: null,
    })
  })

  it('@s10 sin opción no se puede continuar; con opción pasa a «Día»', () => {
    const sinOpcion = aplicar(estadoInicial(), SERVICIO[0], SERVICIO[1])
    expect(puedeContinuar(sinOpcion)).toBe(false)
    expect(reducirReserva(sinOpcion, { tipo: 'continuar' })).toBe(sinOpcion)
    const conOpcion = reducirReserva(sinOpcion, SERVICIO[2])
    expect(puedeContinuar(conOpcion)).toBe(true)
    expect(reducirReserva(conOpcion, { tipo: 'continuar' }).paso).toBe('dia')
  })

  it('precioLegible: «29 €»; sin precio, «Consultar»', () => {
    expect(precioLegible(29)).toBe('29 €')
    expect(precioLegible(null)).toBe('Consultar')
  })

  it('elegir un subservicio que no es el primero lo muestra a él', () => {
    const estado = aplicar(estadoInicial(), SERVICIO[0], {
      tipo: 'subservicio',
      id: 'manicura-gel',
    })
    expect(vistaServicio(estado).subservicio?.id).toBe('manicura-gel')
  })

  it('@s9 etiquetaOpcion: «Uña Mediana · 29 € · 1 h»; sin precio, «Consultar»', () => {
    const opcion: OpcionCita = { id: 'x', etiqueta: 'Uña Mediana', precio: 29, minutos: 60 }
    expect(etiquetaOpcion(opcion)).toBe('Uña Mediana · 29 € · 1 h')
    expect(etiquetaOpcion({ ...opcion, precio: null, minutos: 45 })).toBe(
      'Uña Mediana · Consultar · 45 min',
    )
    expect(etiquetaOpcion({ ...opcion, minutos: null })).toBe('Uña Mediana · 29 € · 0 min')
  })
})

describe('pasos «Día» y «Hora»', () => {
  // Funciones, no constantes: un fallo aquí debe romper un test, no la recogida del fichero.
  const enDia = () => aplicar(estadoInicial(), ...SERVICIO, { tipo: 'continuar' })

  it('sin día no se continúa; con día pasa a «Hora»', () => {
    expect(puedeContinuar(enDia())).toBe(false)
    expect(reducirReserva(enDia(), { tipo: 'continuar' }).paso).toBe('dia')
    const conDia = reducirReserva(enDia(), { tipo: 'dia', fecha: '2026-11-03' })
    expect(puedeContinuar(conDia)).toBe(true)
    expect(reducirReserva(conDia, { tipo: 'continuar' }).paso).toBe('hora')
  })

  it('cambiar de día borra la hora; cambiar de opción borra día y hora', () => {
    const conHora = aplicar(
      enDia(),
      { tipo: 'dia', fecha: '2026-11-03' },
      { tipo: 'continuar' },
      { tipo: 'hora', hueco: HUECO_10 },
    )
    expect(reducirReserva(conHora, { tipo: 'dia', fecha: '2026-11-04' })).toMatchObject({
      fecha: '2026-11-04',
      hueco: null,
    })
    expect(reducirReserva(conHora, { tipo: 'opcion', id: 'manicura-rusa-l' })).toMatchObject({
      opcion: 'manicura-rusa-l',
      fecha: null,
      hueco: null,
    })
  })

  it('sin hora no se continúa; con hora pasa a «Tus datos»', () => {
    const enHora = aplicar(enDia(), { tipo: 'dia', fecha: '2026-11-03' }, { tipo: 'continuar' })
    expect(puedeContinuar(enHora)).toBe(false)
    expect(reducirReserva(enHora, { tipo: 'continuar' }).paso).toBe('hora')
    const conHora = reducirReserva(enHora, { tipo: 'hora', hueco: HUECO_10 })
    expect(puedeContinuar(conHora)).toBe(true)
    expect(reducirReserva(conHora, { tipo: 'continuar' }).paso).toBe('datos')
  })

  it('en «Tus datos», resumen y confirmada no hay «Continuar»', () => {
    const resumen = enResumen()
    expect(puedeContinuar({ ...resumen, paso: 'datos' })).toBe(false)
    expect(puedeContinuar(resumen)).toBe(false)
    expect(reducirReserva({ ...resumen, paso: 'datos' }, { tipo: 'continuar' }).paso).toBe('datos')
    expect(puedeContinuar({ ...resumen, paso: 'confirmada' })).toBe(false)
  })

  it('«Atrás» retrocede un paso y borra el aviso; en «Servicio» y en la confirmación no hace nada', () => {
    const resumen = { ...enResumen(), aviso: 'x', fallo: 'error' as const }
    expect(reducirReserva(resumen, { tipo: 'atras' })).toMatchObject({
      paso: 'datos',
      aviso: null,
      fallo: null,
    })
    expect(reducirReserva({ ...resumen, paso: 'datos' }, { tipo: 'atras' }).paso).toBe('hora')
    expect(reducirReserva({ ...resumen, paso: 'hora' }, { tipo: 'atras' }).paso).toBe('dia')
    expect(reducirReserva({ ...resumen, paso: 'dia' }, { tipo: 'atras' }).paso).toBe('servicio')
    const inicio = estadoInicial()
    expect(reducirReserva(inicio, { tipo: 'atras' })).toBe(inicio)
    const confirmada = { ...resumen, paso: 'confirmada' as const }
    expect(reducirReserva(confirmada, { tipo: 'atras' })).toBe(confirmada)
  })

  it('«Atrás» mientras se envía no hace nada', () => {
    const enviando = reducirReserva(enResumen(), { tipo: 'enviar', claveNueva: CLAVE_A })
    expect(reducirReserva(enviando, { tipo: 'atras' })).toBe(enviando)
  })

  it('«Continuar» y elegir hora borran el aviso del 409', () => {
    const conAviso = { ...aplicar(enDia(), { tipo: 'dia', fecha: '2026-11-03' }), aviso: 'x' }
    expect(reducirReserva(conAviso, { tipo: 'continuar' }).aviso).toBeNull()
    expect(reducirReserva(conAviso, { tipo: 'hora', hueco: HUECO_10 }).aviso).toBeNull()
  })
})

describe('@s17-@s19 «Tus datos» y el resumen', () => {
  const enDatos = () => ({ ...enResumen(), paso: 'datos' as const })

  it('@s18 con datos inválidos sigue en «Tus datos» con los mensajes', () => {
    const malo = aplicar(
      enDatos(),
      { tipo: 'escribir', campo: 'email', valor: 'ana@' },
      {
        tipo: 'revisar',
      },
    )
    expect(malo.paso).toBe('datos')
    expect(malo.errores).toEqual({ email: 'Escribe un email válido, como ana@mail.es' })
  })

  it('escribir en un campo borra su error, no los demás', () => {
    const conErrores = { ...enDatos(), errores: { nombre: 'a', email: 'b' } }
    const escrito = reducirReserva(conErrores, { tipo: 'escribir', campo: 'nombre', valor: 'B' })
    expect(escrito.datos.nombre).toBe('B')
    expect(escrito.datos.email).toBe('ana@mail.es')
    expect(escrito.errores.nombre).toBeUndefined()
    expect(escrito.errores.email).toBe('b')
  })

  it('@s19 con datos válidos pasa al resumen con los datos sin espacios', () => {
    const resumen = enResumen()
    expect(resumen.paso).toBe('resumen')
    expect(resumen.datos).toEqual({
      nombre: 'Ana',
      telefono: '625 22 33 66',
      email: 'ana@mail.es',
    })
    expect(resumen.errores).toEqual({})
  })

  it('«revisar» fuera de «Tus datos» no hace nada', () => {
    const inicio = estadoInicial()
    expect(reducirReserva(inicio, { tipo: 'revisar' })).toBe(inicio)
  })

  it('@s19 resumenDe: servicio, día, inicio, fin, duración y precio', () => {
    expect(resumenDe(enResumen())).toEqual({
      servicio: 'Manicura · Manicura Completa con Base Proteínica (Técnica Rusa) (Uña Mediana)',
      dia: 'martes 3 de noviembre',
      inicio: '10:00',
      fin: '11:00',
      duracion: '1 h',
      precio: '29 €',
    })
  })

  it('resumenDe es null si falta opción, día u hora, o si la opción no existe', () => {
    const r = enResumen()
    expect(resumenDe({ ...r, opcion: null })).toBeNull()
    expect(resumenDe({ ...r, opcion: 'no-existe' })).toBeNull()
    expect(resumenDe({ ...r, fecha: null })).toBeNull()
    expect(resumenDe({ ...r, hueco: null })).toBeNull()
  })
})

describe('@s20-@s25 enviar, la clave de idempotencia y las respuestas', () => {
  it('enviar marca «enviando» con la clave nueva y la petición es la del contrato', () => {
    const enviando = reducirReserva(
      { ...enResumen(), aviso: 'x', fallo: 'error' },
      { tipo: 'enviar', claveNueva: CLAVE_A },
    )
    expect(enviando).toMatchObject({ enviando: true, clave: CLAVE_A, aviso: null, fallo: null })
    expect(peticionDe(enviando, 'tok')).toEqual({
      opcion: 'manicura-rusa-m',
      inicio: '2026-11-03T09:00:00.000Z',
      nombre: 'Ana',
      telefono: '625 22 33 66',
      email: 'ana@mail.es',
      clave: CLAVE_A,
      turnstile: 'tok',
    })
  })

  it('@s24 el doble clic no cambia nada mientras se envía', () => {
    const enviando = reducirReserva(enResumen(), { tipo: 'enviar', claveNueva: CLAVE_A })
    expect(reducirReserva(enviando, { tipo: 'enviar', claveNueva: CLAVE_B })).toBe(enviando)
  })

  it('enviar fuera del resumen, o sin hora, no hace nada', () => {
    const datos = { ...enResumen(), paso: 'datos' as const }
    expect(reducirReserva(datos, { tipo: 'enviar', claveNueva: CLAVE_A })).toBe(datos)
    const sinHora = { ...enResumen(), hueco: null }
    expect(reducirReserva(sinHora, { tipo: 'enviar', claveNueva: CLAVE_A })).toBe(sinHora)
  })

  it('@s25 «Reintentar» tras un error conserva la clave', () => {
    const fallido = aplicar(
      enResumen(),
      { tipo: 'enviar', claveNueva: CLAVE_A },
      { tipo: 'respuesta', resultado: { tipo: 'error', mensaje: 'P5' } },
    )
    expect(fallido).toMatchObject({ paso: 'resumen', enviando: false, aviso: 'P5', fallo: 'error' })
    expect(reducirReserva(fallido, { tipo: 'enviar', claveNueva: CLAVE_B }).clave).toBe(CLAVE_A)
  })

  it('otra hora, otra opción u otros datos dan una clave nueva', () => {
    const fallido = aplicar(
      enResumen(),
      { tipo: 'enviar', claveNueva: CLAVE_A },
      { tipo: 'respuesta', resultado: { tipo: 'error', mensaje: 'P5' } },
    )
    const cambios: Partial<EstadoReserva>[] = [
      { hueco: HUECO_11 },
      { opcion: 'manicura-rusa-l' },
      { datos: { ...fallido.datos, nombre: 'Eva' } },
      { datos: { ...fallido.datos, telefono: '600000000' } },
      { datos: { ...fallido.datos, email: 'eva@mail.es' } },
    ]
    for (const cambio of cambios) {
      expect(
        reducirReserva({ ...fallido, ...cambio }, { tipo: 'enviar', claveNueva: CLAVE_B }).clave,
      ).toBe(CLAVE_B)
    }
  })

  it('@s20 201 → «confirmada» con la cita', () => {
    const cita = { opcion: 'manicura-rusa-m', inicio: 'i', fin: 'f' }
    const confirmada = aplicar(
      { ...enResumen(), aviso: 'x' },
      { tipo: 'enviar', claveNueva: CLAVE_A },
      { tipo: 'respuesta', resultado: { tipo: 'confirmada', cita } },
    )
    expect(confirmada).toMatchObject({
      paso: 'confirmada',
      cita,
      enviando: false,
      aviso: null,
      fallo: null,
    })
  })

  it('@s22 409 → vuelta a «Hora» sin hora elegida y con el aviso', () => {
    const ocupada = aplicar(
      enResumen(),
      { tipo: 'enviar', claveNueva: CLAVE_A },
      { tipo: 'respuesta', resultado: { tipo: 'hora-ocupada', mensaje: 'Ocupada' } },
    )
    expect(ocupada).toMatchObject({
      paso: 'hora',
      hueco: null,
      aviso: 'Ocupada',
      fallo: null,
      enviando: false,
      fecha: '2026-11-03',
    })
  })

  it('403 de verificación → sigue en el resumen con «Reintentar»', () => {
    const verif = aplicar(
      enResumen(),
      { tipo: 'enviar', claveNueva: CLAVE_A },
      { tipo: 'respuesta', resultado: { tipo: 'verificacion', mensaje: 'Robot' } },
    )
    expect(verif).toMatchObject({ paso: 'resumen', aviso: 'Robot', fallo: 'verificacion' })
  })

  it('400 de un campo → vuelta a «Tus datos» con su mensaje', () => {
    const campo = aplicar(
      { ...enResumen(), aviso: 'x', fallo: 'error' },
      { tipo: 'enviar', claveNueva: CLAVE_A },
      { tipo: 'respuesta', resultado: { tipo: 'campo', campo: 'telefono' } },
    )
    expect(campo).toMatchObject({
      paso: 'datos',
      errores: { telefono: 'Escribe un teléfono de al menos 9 cifras' },
      aviso: null,
      fallo: null,
      enviando: false,
    })
  })

  it('una respuesta sin envío en curso se ignora', () => {
    const resumen = enResumen()
    expect(
      reducirReserva(resumen, { tipo: 'respuesta', resultado: { tipo: 'error', mensaje: 'x' } }),
    ).toBe(resumen)
  })

  it('peticionDe es null si no se está enviando o falta algo', () => {
    const enviando = reducirReserva(enResumen(), { tipo: 'enviar', claveNueva: CLAVE_A })
    expect(peticionDe(enResumen(), 'tok')).toBeNull()
    expect(peticionDe({ ...enviando, opcion: null }, 'tok')).toBeNull()
    expect(peticionDe({ ...enviando, hueco: null }, 'tok')).toBeNull()
    expect(peticionDe({ ...enviando, clave: null }, 'tok')).toBeNull()
  })
})
