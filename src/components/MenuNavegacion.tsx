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
 * Los enlaces se escriben inline y EXACTAMENTE a las secciones navegables que existen en la home
 * (`#servicios-titulo`, `#destacados-titulo`, `#ofertas-titulo`, `#equipo-titulo`, `#reserva-titulo`,
 * `#contacto-titulo`, `#faq-titulo`): la PUERTA DE ANCLAS VIVAS vigila en cada build que esa igualdad
 * de conjuntos se mantenga. El 7º enlace, «Equipo» → `#equipo-titulo`, cierra la igualdad con la
 * `<section>` de equipo que la home monta tras Ofertas. El botón «Reservar» apunta a `#reserva-titulo`,
 * un id que EXISTE.
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
          <a href="#destacados-titulo">Destacados</a>
        </li>
        <li>
          <a href="#ofertas-titulo">Ofertas</a>
        </li>
        <li>
          <a href="#equipo-titulo">Equipo</a>
        </li>
        <li>
          <a href="#reserva-titulo">Reserva</a>
        </li>
        <li>
          <a href="#contacto-titulo">Contacto</a>
        </li>
        <li>
          <a href="#faq-titulo">FAQ</a>
        </li>
      </ul>
      <a className={estilos.reservar} href="#reserva-titulo">
        Reservar
      </a>
    </nav>
  )
}
