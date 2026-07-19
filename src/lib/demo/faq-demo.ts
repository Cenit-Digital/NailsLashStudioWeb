/**
 * DATOS DEMO de la FAQ (rama demo/lunes-prototipo). NO es la feature F-15. El contenido usa SOLO
 * hechos ya verificados (ubicación, horario, servicios reales y vía de reserva): NO inventa
 * compromisos de plantilla (formas de pago, política de cancelación), que F-15 marca como pendientes
 * de confirmar con el cliente.
 */
export interface PreguntaDemo {
  readonly pregunta: string
  readonly respuesta: string
}

export const FAQ_DEMO: readonly PreguntaDemo[] = [
  {
    pregunta: '¿Dónde estáis?',
    respuesta:
      'En el C.C. El Zoco de Las Rozas de Madrid (Av. de Atenas 75), en la Planta 0, Local 41.',
  },
  {
    pregunta: '¿Qué horario tenéis?',
    respuesta: 'De lunes a viernes de 10:00 a 20:00 y los sábados de 10:00 a 14:00. Domingos cerrado.',
  },
  {
    pregunta: '¿Qué servicios ofrecéis?',
    respuesta:
      'Uñas (manicura, esmaltado permanente y extensiones), pestañas (lifting y extensiones) y cejas (diseño, laminado y tinte).',
  },
  {
    pregunta: '¿Cómo pido cita?',
    respuesta:
      'Escríbenos por WhatsApp o llámanos al 625 22 33 66 y te confirmamos el día y la hora exacta.',
  },
  {
    pregunta: '¿Hay dónde aparcar?',
    respuesta:
      'Sí. El C.C. El Zoco cuenta con aparcamiento; el estudio está en la Planta 0, Local 41, con acceso a pie de calle.',
  },
]
