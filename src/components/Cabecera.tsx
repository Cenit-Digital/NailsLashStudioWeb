import estilos from './cabecera.module.scss'
import { LogoAcoplado } from './LogoAcoplado'
import { MenuNavegacion } from './MenuNavegacion'

/**
 * La cabecera sticky (F-06). La marca del salón + la navegación principal. Contrato:
 * features/header_nav_footer.feature.
 *
 * La marca es `<LogoAcoplado />` (F-25, features/logo_acoplado.feature): el enlace a la home con
 * sus dos representaciones. La cabecera solo la monta en su sitio.
 */
export function Cabecera() {
  return (
    <header className={estilos.cabecera}>
      <LogoAcoplado />
      <MenuNavegacion />
    </header>
  )
}
