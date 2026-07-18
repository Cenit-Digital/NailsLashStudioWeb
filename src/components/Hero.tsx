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
 */
export function Hero() {
  const { marca, tipo } = partirNombre(NOMBRE)

  return (
    <>
      {/* El eyebrow: SOLO su estructura (<p>, nunca un heading). El CONTENIDO de categorías (Uñas ·
          Pestañas · Cejas) es F-09 (pending): site.ts no las tiene y «Facial» no existe aquí (C-7).
          NO se hornea contenido; un <h2> rompería «un h1» y sembraría un heading sin <section>. */}
      <p className={estilos.eyebrow} />
      <h1 className={estilos.titulo}>
        <span className={estilos.heroMarca}>{marca}</span>
        {/* Text node de espacio REAL, NO whitespace de salto de línea (que JSX borra): sin él, el
            nombre accesible sería «Nails LashStudio» (16, sin espacio) — MEDIDO en los dos motores. */}{' '}
        <span className={estilos.heroStudio}>{tipo}</span>
      </h1>
    </>
  )
}
