import { NOMBRE } from '../lib/site'
import estilos from './cabecera.module.scss'
import { MenuNavegacion } from './MenuNavegacion'

/**
 * La cabecera sticky (F-06). La marca del salón + la navegación principal. Contrato:
 * features/header_nav_footer.feature.
 *
 * La marca enlaza a la home (que EXISTE en `dist/`): jamás a un `#ancla` que no exista, que
 * rompería la puerta de anclas vivas. El texto y la altura viven en `cabecera.module.scss`.
 *
 * El href es `import.meta.env.BASE_URL` (nativa de Vite), no el literal "/": `vite.config.ts`
 * fija `base: '/NailsLashStudioWeb/'` (ENMIENDA 1 a F-05/F-04, 2026-07-25), así que en producción
 * vale "/NailsLashStudioWeb/", no "/". Ver el porqué en progress/tdd_subruta_github_pages.md.
 */
export function Cabecera() {
  return (
    <header className={estilos.cabecera}>
      <a href={import.meta.env.BASE_URL} className={estilos.marca}>
        {NOMBRE}
      </a>
      <MenuNavegacion />
    </header>
  )
}
