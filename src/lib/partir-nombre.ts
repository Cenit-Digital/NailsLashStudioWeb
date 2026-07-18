/**
 * La derivación PURA del titular del hero (F-07): parte NOMBRE en «marca» + «tipo».
 *
 * Contrato: features/hero_marca.feature (@s12/@s13/@s16). Es la ÚNICA lógica mutable de la feature
 * (@s15): el SCSS no lo ve Stryker y la estructura JSX del h1 son literales.
 *
 * Es un split de PRESENTACIÓN («la última palabra va en otra fuente»), no un split de datos:
 * `NOMBRE.split(' ')` daría 3 partes para el dato real [V, A5 §3]. `lastIndexOf(' ')` da
 * directamente «Nails Lash» | «Studio».
 */
export interface Titular {
  readonly marca: string
  readonly tipo: string
}

export function partirNombre(nombre: string): Titular {
  const corte = nombre.lastIndexOf(' ')

  // Guarda `corte < 0` (@s13): sin espacio, `lastIndexOf` da -1; `slice(0,-1)` recortaría el último
  // carácter y `slice(0)` duplicaría el nombre. Degrada a un solo trozo (sufijo vacío), FALLA
  // CERRADA. Es `< 0` y NO `<= 0` a propósito: con un espacio inicial (corte === 0, @s16) NO degrada.
  if (corte < 0) {
    return { marca: nombre, tipo: '' }
  }

  return { marca: nombre.slice(0, corte), tipo: nombre.slice(corte + 1) }
}
