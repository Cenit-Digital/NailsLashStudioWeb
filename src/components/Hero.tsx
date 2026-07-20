import aplicadorUrl from '../assets/aplicador.png'
import { partirNombre } from '../lib/partir-nombre'
import { NOMBRE } from '../lib/site'
import { GROSOR_TRAZO, TRAZO_MARCA, VISTA_MARCA } from '../lib/trazo-marca'
import estilos from './hero.module.scss'

/**
 * El hero de marca (F-07 + demo «CALIGRAFÍA»). Contrato: features/hero.feature.
 *
 * SIGUE HABIENDO EXACTAMENTE UN <h1>, con sus DOS <span> y el text node de espacio REAL entre
 * ellos → nombre accesible «Nails Lash Studio» (@s6/@s7 intactos). Lo que cambia es QUIÉN PINTA
 * «Nails Lash»: ya no el <span> de HTML, sino un <svg> con `viewBox`. Los dos motivos, los dos
 * MEDIDOS, están en `progress/hallazgos_hero_caligrafia.md`:
 *
 * 1. EL RECORTE. La tinta de «Nails Lash» va de x −15,6 a 3965,3 ‰ de em, pero la caja de texto
 *    solo mide 3895 ‰: la «N» se sale 15,6 ‰ por la izquierda y la «h» 70,3 ‰ por la derecha, y
 *    `clip-path: inset(0 0 0 0)` recorta AL BORDER-BOX, así que los seccionaba en vertical. Con un
 *    `viewBox` que encierra la tinta real con margen, **el recorte es imposible por construcción**.
 *
 * 2. LA INCOHERENCIA. Antes eran DOS RELOJES sobre DOS GEOMETRÍAS: la tinta se revelaba con una
 *    guillotina vertical (`clip-path`) mientras el pincel viajaba por otro sitio. Ahora la tinta se
 *    revela con una MÁSCARA que traza la línea central real de las letras (`stroke-dashoffset`) y
 *    el aplicador recorre ESE MISMO path (`offset-path: url(#…)`, sin duplicarlo). Con
 *    `pathLength="100"`, dasharray/dashoffset y `offset-distance` son AMBAS lineales en longitud de
 *    arco, así que con idénticos duration/delay/easing la punta cae EXACTAMENTE sobre el borde de
 *    lo recién pintado. La sincronía no se ajusta a ojo: es exacta por construcción.
 *
 * La animación vive en el SCSS module, NUNCA inline (@s5).
 */

/** El <path> de la línea central. Lo referencian la máscara y el `offset-path` del aplicador. */
const ID_TRAZO = 'trazo-marca'
/** La máscara que revela las letras a medida que el trazo se dibuja. */
const ID_MASCARA = 'tinta-marca'

/**
 * El aplicador, en unidades del viewBox (1000 = 1 em). `aplicador.png` mide 15×93 y lo genera
 * `tools/trazo-marca/aplicador.mjs` recortando `brush.png` a cerdas+varilla y volteándolo: la
 * punta queda en el centro del borde INFERIOR. Con `x = −ancho·0,4667` e `y = −alto`, esa punta
 * cae en el (0,0) local, que es el punto que `offset-path` coloca sobre el recorrido.
 * (Medido: el hero anterior lo anclaba al 86 % de la imagen, o sea DENTRO DEL FRASCO.)
 */
const APLICADOR_ALTO = 1100
const APLICADOR_ANCHO = (APLICADOR_ALTO * 15) / 93
const APLICADOR_PUNTA_X = APLICADOR_ANCHO * 0.4667

/**
 * La región del <mask>, DERIVADA del viewBox — no copiada.
 *
 * Antes iba escrita como cuatro literales al lado de `viewBox={VISTA_MARCA}`: dos copias del mismo
 * dato sin nada que las atara. El `judge` lo cazó saboteando `VISTA_MARCA` con la caja EXACTA que
 * seccionaba la «N» y la «h» ('0 -840 3895 1200') — y los 47 tests siguieron VERDES. Con una sola
 * fuente de verdad, encoger el viewBox mueve también la máscara, y el test que comprueba que el
 * viewBox ENCIERRA la tinta medida se pone rojo.
 */
const [VB_X, VB_Y, VB_ANCHO, VB_ALTO] = VISTA_MARCA.split(' ')

export function Hero() {
  const { marca, tipo } = partirNombre(NOMBRE)

  return (
    <>
      {/* El eyebrow: SOLO su estructura (<p>, nunca un heading). El CONTENIDO de categorías (Uñas ·
          Pestañas · Cejas) es F-09: site.ts no las tiene y «Facial» no existe aquí (C-7). */}
      <p className={estilos.eyebrow} />
      <div className={estilos.escena}>
        {/* El rótulo VISIBLE. Decorativo (`aria-hidden`): quien lo anuncia es el <h1> de abajo, así
            que un lector de pantalla NO oye «Nails Lash» dos veces. */}
        <svg className={estilos.rotulo} viewBox={VISTA_MARCA} aria-hidden="true" focusable="false">
          <defs>
            {/* `maskUnits`/`maskContentUnits` en userSpaceOnUse (el valor por defecto del
                contenido): así el trazo va en unidades del viewBox y NO se deforma con la relación
                de aspecto de la caja — que es justo lo que hacía inservible enmascarar el texto
                HTML (un trazo de 0,45 em de alto salía de 1,07 em de ancho y volvía a parecer un
                barrido). El <mask> honra el `stroke`, a diferencia de <clipPath>, que por
                especificación usa solo la geometría del relleno. */}
            <mask
              id={ID_MASCARA}
              maskUnits="userSpaceOnUse"
              x={VB_X}
              y={VB_Y}
              width={VB_ANCHO}
              height={VB_ALTO}
            >
              <path
                id={ID_TRAZO}
                className={estilos.trazo}
                d={TRAZO_MARCA}
                pathLength="100"
                fill="none"
                stroke="#fff"
                strokeWidth={GROSOR_TRAZO}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          </defs>
          {/* Great Vibes a 1000 unidades = 1 em, con la línea base en y = 0: el mismo sistema de
              coordenadas en el que está calculada la línea central. */}
          <text className={estilos.letras} mask={`url(#${ID_MASCARA})`} x="0" y="0" fontSize="1000">
            {marca}
          </text>
          {/* El <g> es quien recorre el path; el <image> de dentro se inclina 18° alrededor del
              (0,0) local —la punta— para que se sostenga como lo sostendría una mano. */}
          <g className={estilos.aplicador}>
            <image
              href={aplicadorUrl}
              transform="rotate(18)"
              x={-APLICADOR_PUNTA_X}
              y={-APLICADOR_ALTO}
              width={APLICADOR_ANCHO}
              height={APLICADOR_ALTO}
            />
          </g>
        </svg>
        <h1 className={estilos.titulo}>
          {/* PRESENTE en el DOM y en el HTML horneado, pero fuera de la vista: el rótulo visible es
              el <svg> de arriba. Se usa la técnica `clip`/1px que recomienda la WAI, NO
              `visibility: hidden` (borraría el nombre accesible) ni `color: transparent` (dejaría
              el texto en el árbol de accesibilidad pero fuera del cómputo de LCP). */}
          <span className={estilos.heroMarca}>{marca}</span>
          {/* Text node de espacio REAL, NO whitespace de salto de línea (que JSX borra): sin él, el
              nombre accesible sería «Nails LashStudio» (16, sin espacio) — MEDIDO en los dos motores. */}{' '}
          <span className={estilos.heroStudio}>{tipo}</span>
        </h1>
      </div>
    </>
  )
}
