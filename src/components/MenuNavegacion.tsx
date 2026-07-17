import { useState } from 'react'

import estilos from './cabecera.module.scss'

const ID_LISTA = 'menu-navegacion'

/**
 * La navegación principal (F-06). Contrato: features/header_nav_footer.feature.
 *
 * 🔴 LA NAV VIAJA HORNEADA EN EL HTML (SSR-safe): un usuario que llega antes de hidratar ve la
 * navegación. El eje móvil/escritorio lo decide CSS puro (`@media` de `cabecera.module.scss`), no
 * JS. El botón hornea «cerrado» (`aria-expanded="false"`, @s16); el toggle del estado llega en @s15.
 *
 * Los enlaces se escriben inline y EXACTAMENTE a las secciones que existen en la home
 * (`#servicios-titulo`, `#contacto-titulo`): la PUERTA DE ANCLAS VIVAS vigila en cada build que esa
 * igualdad de conjuntos se mantenga, así que la nav no puede enlazar a lo que no existe ni dejar de
 * enlazar una sección alcanzable.
 */
export function MenuNavegacion() {
  // El estado abierto/cerrado vive en `aria-expanded` (atributo CONSULTABLE), NUNCA en un className
  // condicional: medido INMATABLE bajo la regla anti-clase-CSS. Hornea «cerrado» por SSR (@s16).
  const [abierto, setAbierto] = useState(false)

  return (
    <nav aria-label="Principal" className={estilos.nav}>
      <button
        type="button"
        className={estilos.disparador}
        aria-controls={ID_LISTA}
        aria-expanded={abierto}
        onClick={() => {
          setAbierto((estaba) => !estaba)
        }}
      >
        Menú
      </button>
      <ul id={ID_LISTA} className={estilos.lista}>
        <li>
          <a href="#servicios-titulo">Servicios</a>
        </li>
        <li>
          <a href="#contacto-titulo">Contacto</a>
        </li>
      </ul>
    </nav>
  )
}
