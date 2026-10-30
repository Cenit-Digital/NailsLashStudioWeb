import type { CategoriaCita } from './catalogo.ts'

/**
 * Datos del catálogo de citas (Fase 3, issue #30). Fuente: el catálogo de la web de presentación
 * `Cenit-Digital/WebNailsDisenosPresentacion` (`src/data/servicios.ts` en 6d77e18), que sale del Excel
 * «Propuestas diseños web». Solo se toma el PRIMER grupo de opciones de cada subservicio (decisión de
 * Pablo, 2026-10-30: una opción por subservicio; la retirada se pide aparte). Precios y tiempos
 * PROVISIONALES hasta que el salón los confirme (issue #25). `null` = «Consultar»: no se reserva en línea.
 *
 * Fichero de DATOS: fuera de la mutación (Stryker mutaría cada literal). La lógica vive en catalogo.ts.
 */
export const CATALOGO_CITAS: readonly CategoriaCita[] = [
  {
    id: 'manicura',
    nombre: 'Manicura',
    subservicios: [
      {
        id: 'manicura-rusa',
        nombre: 'Manicura Completa con Base Proteínica (Técnica Rusa)',
        pregunta: 'Selecciona el largo de tu uña:',
        opciones: [
          {
            id: 'manicura-rusa-s',
            clave: 'S',
            etiqueta: 'Uña Corta / Natural',
            precio: 27,
            minutos: 60,
          },
          { id: 'manicura-rusa-m', clave: 'M', etiqueta: 'Uña Mediana', precio: 29, minutos: 60 },
          { id: 'manicura-rusa-l', clave: 'L', etiqueta: 'Uña Larga', precio: 31, minutos: 60 },
          {
            id: 'manicura-rusa-xl-xxl',
            clave: 'XL / XXL',
            etiqueta: 'Uña Extra Larga',
            precio: null,
            minutos: null,
          },
        ],
      },
      {
        id: 'manicura-gel',
        nombre: 'Manicura Completa Gel / Soft Gel / Relleno / Esculpido',
        pregunta: 'Selecciona el largo de tu uña:',
        opciones: [
          {
            id: 'manicura-gel-s',
            clave: 'S',
            etiqueta: 'Uña Corta / Natural',
            precio: 27,
            minutos: 60,
          },
          { id: 'manicura-gel-m', clave: 'M', etiqueta: 'Uña Mediana', precio: 29, minutos: 60 },
          { id: 'manicura-gel-l', clave: 'L', etiqueta: 'Uña Larga', precio: 31, minutos: 60 },
          {
            id: 'manicura-gel-xl-xxl',
            clave: 'XL / XXL',
            etiqueta: 'Uña Extra Larga',
            precio: null,
            minutos: null,
          },
        ],
      },
      {
        id: 'manicura-spa-masglo',
        nombre: 'Manicura Completa Spa Masglo',
        pregunta: 'Selecciona el largo de tu uña:',
        opciones: [
          {
            id: 'manicura-spa-masglo-s',
            clave: 'S',
            etiqueta: 'Uña Corta / Natural',
            precio: 27,
            minutos: 60,
          },
          {
            id: 'manicura-spa-masglo-m',
            clave: 'M',
            etiqueta: 'Uña Mediana',
            precio: 29,
            minutos: 60,
          },
          {
            id: 'manicura-spa-masglo-l',
            clave: 'L',
            etiqueta: 'Uña Larga',
            precio: 31,
            minutos: 60,
          },
          {
            id: 'manicura-spa-masglo-xl-xxl',
            clave: 'XL / XXL',
            etiqueta: 'Uña Extra Larga',
            precio: null,
            minutos: null,
          },
        ],
      },
      {
        id: 'manicura-spa-nutritiva',
        nombre: 'Manicura Completa Spa Nutritiva sin Esmaltar',
        pregunta: 'Selecciona el largo de tu uña:',
        opciones: [
          {
            id: 'manicura-spa-nutritiva-s',
            clave: 'S',
            etiqueta: 'Uña Corta / Natural',
            precio: 27,
            minutos: 60,
          },
          {
            id: 'manicura-spa-nutritiva-m',
            clave: 'M',
            etiqueta: 'Uña Mediana',
            precio: 29,
            minutos: 60,
          },
          {
            id: 'manicura-spa-nutritiva-l',
            clave: 'L',
            etiqueta: 'Uña Larga',
            precio: 31,
            minutos: 60,
          },
          {
            id: 'manicura-spa-nutritiva-xl-xxl',
            clave: 'XL / XXL',
            etiqueta: 'Uña Extra Larga',
            precio: null,
            minutos: null,
          },
        ],
      },
      {
        id: 'manicura-express',
        nombre: 'Manicura Express (Limar y Cortar)',
        pregunta: 'Selecciona el largo de tu uña:',
        opciones: [
          {
            id: 'manicura-express-s',
            clave: 'S',
            etiqueta: 'Uña Corta / Natural',
            precio: 27,
            minutos: 60,
          },
          {
            id: 'manicura-express-m',
            clave: 'M',
            etiqueta: 'Uña Mediana',
            precio: 29,
            minutos: 60,
          },
          { id: 'manicura-express-l', clave: 'L', etiqueta: 'Uña Larga', precio: 31, minutos: 60 },
          {
            id: 'manicura-express-xl-xxl',
            clave: 'XL / XXL',
            etiqueta: 'Uña Extra Larga',
            precio: null,
            minutos: null,
          },
        ],
      },
      {
        id: 'manicura-reparacion',
        nombre: 'Reparación de Uña Rota',
        pregunta: 'Selecciona el largo de tu uña:',
        opciones: [
          {
            id: 'manicura-reparacion-s',
            clave: 'S',
            etiqueta: 'Uña Corta / Natural',
            precio: null,
            minutos: null,
          },
          {
            id: 'manicura-reparacion-m',
            clave: 'M',
            etiqueta: 'Uña Mediana',
            precio: null,
            minutos: null,
          },
          {
            id: 'manicura-reparacion-l',
            clave: 'L',
            etiqueta: 'Uña Larga',
            precio: null,
            minutos: null,
          },
          {
            id: 'manicura-reparacion-xl-xxl',
            clave: 'XL / XXL',
            etiqueta: 'Uña Extra Larga',
            precio: null,
            minutos: null,
          },
        ],
      },
      {
        id: 'nail-art',
        nombre: 'Decoración / Nail Art',
        pregunta: 'Selecciona color de las uñas:',
        opciones: [
          { id: 'nail-art-1', etiqueta: 'Rojo Carmín', precio: 27, minutos: 60 },
          { id: 'nail-art-2', etiqueta: 'Vino Tinto', precio: 29, minutos: 60 },
          { id: 'nail-art-3', etiqueta: 'Nude Rosado', precio: 31, minutos: 60 },
          { id: 'nail-art-4', etiqueta: 'Rosa Empolvado', precio: 31, minutos: 60 },
          { id: 'nail-art-5', etiqueta: 'Coral Suave', precio: 31, minutos: 60 },
          { id: 'nail-art-6', etiqueta: 'Malva', precio: 31, minutos: 60 },
          { id: 'nail-art-7', etiqueta: 'Champán', precio: 31, minutos: 60 },
          { id: 'nail-art-8', etiqueta: 'Fucsia', precio: 31, minutos: 60 },
          { id: 'nail-art-9', etiqueta: 'Azul Noche', precio: 31, minutos: 60 },
          { id: 'nail-art-10', etiqueta: 'Verde Salvia', precio: 31, minutos: 60 },
          { id: 'nail-art-11', etiqueta: 'Negro Ónix', precio: 31, minutos: 60 },
          { id: 'nail-art-12', etiqueta: 'Blanco Nácar', precio: 31, minutos: 60 },
        ],
      },
    ],
  },
  {
    id: 'pedicura',
    nombre: 'Pedicura',
    subservicios: [
      {
        id: 'pedicura-con-durezas',
        nombre: 'Pedicura Completa Spa (Con Durezas)',
        pregunta: 'Selecciona el tipo de esmaltado:',
        opciones: [
          { id: 'pedicura-con-durezas-1', etiqueta: 'Semipermanente', precio: 39, minutos: 45 },
          {
            id: 'pedicura-con-durezas-2',
            etiqueta: 'Tradicional (Masglo)',
            precio: 35,
            minutos: 30,
          },
        ],
      },
      {
        id: 'pedicura-sin-durezas',
        nombre: 'Pedicura Completa Spa (Sin Durezas)',
        pregunta: 'Selecciona el tipo de esmaltado:',
        opciones: [
          { id: 'pedicura-sin-durezas-1', etiqueta: 'Semipermanente', precio: 39, minutos: 45 },
          {
            id: 'pedicura-sin-durezas-2',
            etiqueta: 'Tradicional (Masglo)',
            precio: 35,
            minutos: 30,
          },
        ],
      },
      {
        id: 'pedicura-limar-cortar',
        nombre: 'Limar y Cortar Uñas de los Pies Spa',
        pregunta: 'Opciones de retirada:',
        opciones: [
          { id: 'pedicura-limar-cortar-1', etiqueta: 'Sin retiro', precio: 0, minutos: 45 },
          {
            id: 'pedicura-limar-cortar-2',
            etiqueta: 'Retirada de esmalte semipermanente',
            precio: 35,
            minutos: 30,
          },
        ],
      },
      {
        id: 'pedicura-construccion',
        nombre: 'Construcción de Uña del Pie',
        pregunta: 'Precio',
        opciones: [
          {
            id: 'pedicura-construccion-1',
            etiqueta: 'Construcción de Uña del Pie',
            precio: null,
            minutos: null,
          },
        ],
      },
      {
        id: 'pedicura-desenterrar',
        nombre: 'Tratamiento para Desenterrar',
        pregunta: 'Precio',
        opciones: [
          {
            id: 'pedicura-desenterrar-1',
            etiqueta: 'Tratamiento de Uña Encarnada / Desenterrar',
            precio: null,
            minutos: null,
          },
        ],
      },
    ],
  },
  {
    id: 'depilacion',
    nombre: 'Depilación',
    subservicios: [
      {
        id: 'depilacion-cejas',
        nombre: 'Depilación de Cejas con Hilo',
        pregunta: 'Precio',
        opciones: [
          {
            id: 'depilacion-cejas-1',
            etiqueta: 'Depilación de Cejas con Hilo',
            precio: 39,
            minutos: 45,
          },
        ],
      },
      {
        id: 'depilacion-labio',
        nombre: 'Depilación de Labio con Hilo',
        pregunta: 'Precio',
        opciones: [
          {
            id: 'depilacion-labio-1',
            etiqueta: 'Depilación de Labio Superior con Hilo',
            precio: 39,
            minutos: 45,
          },
        ],
      },
      {
        id: 'depilacion-cejas-labio',
        nombre: 'Pack Especial: Cejas + Labio',
        pregunta: 'Precio',
        opciones: [
          {
            id: 'depilacion-cejas-labio-1',
            etiqueta: 'Depilación de Cejas + Labio con Hilo',
            precio: 39,
            minutos: 45,
          },
        ],
      },
      {
        id: 'depilacion-facial-completa',
        nombre: 'Depilación Facial Completa con Hilo',
        pregunta: 'Precio',
        opciones: [
          {
            id: 'depilacion-facial-completa-1',
            etiqueta: 'Depilación Facial Completa con Hilo',
            precio: 39,
            minutos: 45,
          },
        ],
      },
    ],
  },
  {
    id: 'retirada',
    nombre: 'Retirada',
    subservicios: [
      {
        id: 'retirada-manos',
        nombre: 'Retiradas en Manos',
        pregunta: 'Selecciona tu retirada:',
        opciones: [
          {
            id: 'retirada-manos-1',
            etiqueta: 'Retirada Base Proteínica o Relleno Nails Studio',
            precio: 39,
            minutos: 45,
          },
          {
            id: 'retirada-manos-2',
            etiqueta: 'Retirada Base Rubber / Semipermanente (de otro centro)',
            precio: 39,
            minutos: 45,
          },
          {
            id: 'retirada-manos-3',
            etiqueta: 'Retirada Gel / Soft Gel (de otro centro)',
            precio: 39,
            minutos: 45,
          },
          { id: 'retirada-manos-4', etiqueta: 'Retirada de Acrílico', precio: 39, minutos: 45 },
        ],
      },
      {
        id: 'retirada-pies',
        nombre: 'Retiradas en Pies',
        pregunta: 'Selecciona tu retirada:',
        opciones: [
          {
            id: 'retirada-pies-1',
            etiqueta: 'Retirada Semipermanente en Pies (Spa)',
            precio: 39,
            minutos: 45,
          },
        ],
      },
    ],
  },
  {
    id: 'manipedi',
    nombre: 'Manipedi',
    subservicios: [
      {
        id: 'manipedi',
        nombre: 'Manipedí Express',
        pregunta: 'Precio',
        opciones: [{ id: 'manipedi-1', etiqueta: 'Manipedí Express', precio: 39, minutos: 45 }],
      },
    ],
  },
]
