import brushUrl from '../assets/brush.png'
import { partirNombre } from '../lib/partir-nombre'
import { NOMBRE } from '../lib/site'
import estilos from './hero.module.scss'

/**
 * El hero de marca (F-07). Reestiliza el <h1>{NOMBRE} que F-04 dejó horneado (home.tsx): sigue
 * habiendo EXACTAMENTE un <h1>. Contrato: features/hero_marca.feature.
 *
 * El h1 son DOS <span> (phrasing content, nunca <div>) derivados de NOMBRE por `partirNombre`, con
 * un text node de espacio {' '} REAL entre ellos → nombre accesible «Nails Lash Studio» (MEDIDO en
 * los dos motores). La animación (paintReveal) vive en el SCSS module, NUNCA inline.
 *
 * 🎨 DEMO — «TRAZO DE PLUMA»: un aplicador de esmalte (brush.png, autohospedado → cero terceros)
 * ESCRIBE «Nails Lash» recorriendo el trazo real de cada letra (sube la N, la montaña, los lazos),
 * mientras Great Vibes se revela detrás de la punta. El aplicador es un HERMANO del <h1> (un <svg>
 * decorativo `aria-hidden`), NUNCA dentro del <h1> (los tests del titular no se tocan). Va en un
 * <svg> con viewBox para ESCALAR con el titular responsive; su recorrido lo mueve SMIL
 * `<animateMotion>` sobre TRAZO_MARCA (la centerline de la marca), NO un barrido horizontal.
 */

/**
 * La centerline de «Nails Lash» (unidades del viewBox del pincel), en ORDEN DE ESCRITURA: el punto
 * (M) de cada palabra levanta la pluma. La recorre la punta del aplicador; NUNCA se dibuja. Calibrada
 * EN VIVO con Chrome sobre las letras reales de Great Vibes (measureText por letra + ajuste visual).
 */
const TRAZO_MARCA =
  'M 58 214 C 50 150 76 58 106 64 C 126 68 100 175 110 214 C 118 150 166 60 198 58 ' +
  'C 216 58 204 165 210 210 C 216 226 262 150 300 140 C 282 138 274 206 298 208 ' +
  'C 320 210 330 150 342 140 C 352 132 354 190 356 208 C 362 216 384 150 402 148 ' +
  'C 412 150 404 190 408 208 C 414 216 430 60 452 52 C 466 58 442 180 452 208 ' +
  'C 458 216 500 214 508 178 C 512 156 486 158 492 180 C 498 202 528 200 528 208 ' +
  'M 690 56 C 664 48 632 70 636 150 C 640 210 690 214 748 206 C 748 206 780 150 812 140 ' +
  'C 794 138 786 206 810 208 C 832 210 842 150 854 140 C 864 132 866 190 868 208 ' +
  'C 874 216 906 214 912 182 C 916 160 892 162 898 182 C 902 202 930 200 930 208 ' +
  'C 936 216 952 58 974 50 C 988 56 964 180 972 208 C 978 176 1006 140 1028 150 ' +
  'C 1042 158 1034 190 1038 208'

export function Hero() {
  const { marca, tipo } = partirNombre(NOMBRE)

  return (
    <>
      {/* El eyebrow: SOLO su estructura (<p>, nunca un heading). El CONTENIDO de categorías (Uñas ·
          Pestañas · Cejas) es F-09: site.ts no las tiene y «Facial» no existe aquí (C-7). */}
      <p className={estilos.eyebrow} />
      <div className={estilos.escena}>
        <h1 className={estilos.titulo}>
          <span className={estilos.heroMarca}>{marca}</span>
          {/* Text node de espacio REAL, NO whitespace de salto de línea (que JSX borra): sin él, el
              nombre accesible sería «Nails LashStudio» (16, sin espacio) — MEDIDO en los dos motores. */}{' '}
          <span className={estilos.heroStudio}>{tipo}</span>
        </h1>
        {/* El aplicador de esmalte (DEMO): decorativo, fuera del <h1>, aria-hidden. Escribe «Nails
            Lash» siguiendo TRAZO_MARCA con <animateMotion>; su imagen se sitúa con la punta (abajo)
            sobre el punto del recorrido (x=-23 = -ancho/2; y=-129 = -alto·0,86). Bajo
            prefers-reduced-motion el <svg> se oculta (SCSS), sin movimiento residual. */}
        <svg
          className={estilos.pincelSvg}
          viewBox="56 0 986 330"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          <image href={brushUrl} width="46" height="150" x="-23" y="-129">
            <animateMotion
              dur="1.6s"
              begin="0.1s"
              path={TRAZO_MARCA}
              rotate="0"
              fill="freeze"
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.5 0 0.25 1"
            />
            <animate
              attributeName="opacity"
              dur="1.7s"
              values="0;1;1;1;0"
              keyTimes="0;0.05;0.5;0.92;1"
              fill="freeze"
            />
          </image>
        </svg>
      </div>
    </>
  )
}
