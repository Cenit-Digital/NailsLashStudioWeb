import { partirNombre } from '../lib/partir-nombre'
import { NOMBRE } from '../lib/site'
import estilos from './hero.module.scss'

/**
 * El hero de marca (F-07). Reestiliza el <h1>{NOMBRE} que F-04 dejó horneado (home.tsx): sigue
 * habiendo EXACTAMENTE un <h1>. Contrato: features/hero_marca.feature.
 *
 * El h1 son DOS <span> (phrasing content, nunca <div>) derivados de NOMBRE por `partirNombre`, con
 * un text node de espacio {' '} REAL entre ellos → nombre accesible «Nails Lash Studio» (MEDIDO en
 * los dos motores). La animación (paintReveal/fadeUp) vive en el SCSS module, NUNCA inline.
 *
 * 🎨 DEMO: el pincel de caligrafía va como un elemento HERMANO del <h1> (un <span> decorativo
 * `aria-hidden`, con `brush.png` de fondo), NO dentro del <h1> (los tests del titular no se tocan).
 * Recorre «Nails Lash» y luego «STUDIO» siguiendo el frente de la tinta (keyframes en la hoja). El
 * `<h1>` conserva su estructura EXACTA (dos spans + text node de espacio).
 */
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
        {/* El pincel de caligrafía (DEMO): decorativo, fuera del <h1>, aria-hidden. Su barrido de dos
            líneas vive en `brushWrite` (hoja). Bajo prefers-reduced-motion se oculta. */}
        <span className={estilos.pincel} aria-hidden="true" />
      </div>
    </>
  )
}
