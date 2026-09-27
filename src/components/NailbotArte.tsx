import estilos from './nailbot-arte.module.scss'

/**
 * El ARTE de Nailbot: robot con pestañas largas y morros rojos que se pinta las uñas (encargo de
 * Pablo, 2026-09-27). Geometría y colores portados de `docs/research/asistente-robot/nailbot-prototipo.html`.
 *
 * SVG INLINE decorativo (`aria-hidden` + `focusable="false"`): el nombre accesible lo lleva el botón
 * que lo contiene. Sin `<defs>` ni ids (el arte puede aparecer varias veces en la página). Sin
 * subrecursos (puerta de terceros F-05).
 *
 * El ESTADO BASE es la pose final visible (uñas pintadas, pincel en el bote): sin animación
 * (prefers-reduced-motion, SSG o pausa) se ve completo. La animación solo corre con
 * `animado` y la PAUSA (SC 2.2.2) congela en su sitio vía el atributo `data-animacion`.
 */
interface NailbotArteProps {
  readonly animado?: boolean
  readonly pausado?: boolean
}

export function NailbotArte({ animado = false, pausado = false }: NailbotArteProps) {
  return (
    <svg
      className={estilos.arte}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      data-animado={animado ? 'si' : 'no'}
      data-animacion={pausado ? 'pausada' : 'en-marcha'}
    >
      <g className={estilos.flota}>
        {/* Antena con corazón */}
        <path
          d="M60 20 L60 11"
          stroke="var(--nb-oro-rosa-osc)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          className={estilos.corazon}
          d="M60 12 C 57.5 10 54.6 8 54.6 5.2 C 54.6 3.4 56 2.1 57.6 2.1 C 58.7 2.1 59.5 2.7 60 3.6 C 60.5 2.7 61.3 2.1 62.4 2.1 C 64 2.1 65.4 3.4 65.4 5.2 C 65.4 8 62.5 10 60 12 Z"
          fill="var(--accent-2)"
        />
        {/* Cuerpo */}
        <rect x="53.5" y="64" width="13" height="7" rx="2" fill="var(--nb-oro-rosa)" />
        <rect
          x="41"
          y="69"
          width="38"
          height="33"
          rx="14"
          fill="var(--nb-carcasa)"
          stroke="var(--nb-perfil)"
          strokeWidth="2"
        />
        <path
          d="M70 91.5 C 68.9 90.6 67.6 89.7 67.6 88.4 C 67.6 87.6 68.2 87 69 87 C 69.5 87 69.8 87.3 70 87.7 C 70.2 87.3 70.5 87 71 87 C 71.8 87 72.4 87.6 72.4 88.4 C 72.4 89.7 71.1 90.6 70 91.5 Z"
          fill="var(--accent)"
        />
        {/* Orejas (tornillos oro rosa) */}
        <circle
          cx="27.5"
          cy="42"
          r="5.2"
          fill="var(--nb-oro-rosa)"
          stroke="var(--nb-oro-rosa-osc)"
          strokeWidth="1.2"
        />
        <circle
          cx="92.5"
          cy="42"
          r="5.2"
          fill="var(--nb-oro-rosa)"
          stroke="var(--nb-oro-rosa-osc)"
          strokeWidth="1.2"
        />
        {/* Cabeza y cara */}
        <rect
          x="29"
          y="18"
          width="62"
          height="49"
          rx="22.5"
          fill="var(--nb-carcasa)"
          stroke="var(--nb-perfil)"
          strokeWidth="2"
        />
        <rect x="36.2" y="25.2" width="47.6" height="35.6" rx="16" fill="var(--nb-cara)" />
        {/* Ojos con pestañas largas y raya */}
        <g className={estilos.ojos}>
          <ellipse cx="50" cy="41" rx="4.1" ry="5" fill="var(--nb-ojo)" />
          <ellipse cx="70" cy="41" rx="4.1" ry="5" fill="var(--nb-ojo)" />
          <circle cx="51.4" cy="39.2" r="1.35" fill="#fff" />
          <circle cx="71.4" cy="39.2" r="1.35" fill="#fff" />
          <g stroke="var(--nb-ojo)" strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M45.4 39.6 Q 46.8 35.4 50.2 35.6 Q 53.2 35.9 54.4 38.4" />
            <path d="M46 38.2 Q 43.4 36.8 41.4 33.4" />
            <path d="M47.6 36.6 Q 45.8 33.8 45.3 29.9" />
            <path d="M49.9 35.8 Q 49.4 32.6 50.4 29.2" />
            <path d="M74.6 39.6 Q 73.2 35.4 69.8 35.6 Q 66.8 35.9 65.6 38.4" />
            <path d="M74 38.2 Q 76.6 36.8 78.6 33.4" />
            <path d="M72.4 36.6 Q 74.2 33.8 74.7 29.9" />
            <path d="M70.1 35.8 Q 70.6 32.6 69.6 29.2" />
          </g>
        </g>
        {/* Colorete */}
        <circle cx="42.8" cy="50.5" r="3.6" fill="var(--nb-colorete)" opacity="0.75" />
        <circle cx="77.2" cy="50.5" r="3.6" fill="var(--nb-colorete)" opacity="0.75" />
        {/* Morros rojos, marcados y pintados (con brillo) */}
        <g className={estilos.labios}>
          <path
            d="M51.2 52.6 C 53.6 49.4 57 48.8 60 51 C 63 48.8 66.4 49.4 68.8 52.6 C 65.4 53.9 54.6 53.9 51.2 52.6 Z"
            fill="var(--nb-rojo)"
            stroke="var(--nb-rojo-osc)"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          <path
            d="M51.2 52.6 C 54.6 54.2 65.4 54.2 68.8 52.6 C 67.2 58 52.8 58 51.2 52.6 Z"
            fill="var(--nb-rojo)"
            stroke="var(--nb-rojo-osc)"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          <path
            d="M52.3 52.7 C 55.8 53.6 64.2 53.6 67.7 52.7"
            stroke="var(--nb-rojo-osc)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="63.2" cy="55.3" rx="2.2" ry="0.9" fill="#fff" opacity="0.75" />
          <ellipse cx="56" cy="51" rx="1.2" ry="0.55" fill="#fff" opacity="0.6" />
        </g>
        {/* Bote de esmalte */}
        <rect
          x="93"
          y="95"
          width="15"
          height="16"
          rx="3.8"
          fill="var(--nb-rojo)"
          stroke="var(--nb-rojo-osc)"
          strokeWidth="1"
        />
        <rect x="96.8" y="91" width="7.4" height="5" rx="1" fill="var(--nb-rojo-osc)" />
        <rect x="95.3" y="97.8" width="2.4" height="8.5" rx="1.2" fill="#fff" opacity="0.55" />
        {/* Mano de las uñas (pose 💅) con pulsera oro rosa */}
        <g className={estilos.manoUnas}>
          <rect
            x="38.6"
            y="99.5"
            width="16"
            height="5.2"
            rx="2.6"
            fill="var(--nb-oro-rosa)"
            stroke="var(--nb-oro-rosa-osc)"
            strokeWidth="1"
          />
          <rect
            x="37.4"
            y="80"
            width="4.8"
            height="13"
            rx="2.4"
            fill="var(--nb-carcasa)"
            stroke="var(--nb-perfil)"
            strokeWidth="1.3"
          />
          <rect
            x="42.4"
            y="77.6"
            width="4.8"
            height="15"
            rx="2.4"
            fill="var(--nb-carcasa)"
            stroke="var(--nb-perfil)"
            strokeWidth="1.3"
          />
          <rect
            x="47.4"
            y="78.2"
            width="4.8"
            height="14.4"
            rx="2.4"
            fill="var(--nb-carcasa)"
            stroke="var(--nb-perfil)"
            strokeWidth="1.3"
          />
          <rect
            x="52.4"
            y="80.6"
            width="4.8"
            height="12"
            rx="2.4"
            fill="var(--nb-carcasa)"
            stroke="var(--nb-perfil)"
            strokeWidth="1.3"
          />
          <rect
            x="33.4"
            y="89"
            width="7.4"
            height="4.6"
            rx="2.3"
            transform="rotate(-40 37.1 91.3)"
            fill="var(--nb-carcasa)"
            stroke="var(--nb-perfil)"
            strokeWidth="1.3"
          />
          <path
            d="M36.4 90 H58.2 V95.5 C 58.2 99.2 55.4 101.2 51.8 101.2 H42.8 C 39.2 101.2 36.4 99.2 36.4 95.5 Z"
            fill="var(--nb-carcasa)"
            stroke="var(--nb-perfil)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Uñas almendra: base sin pintar + esmalte encima (BASE = pintada) */}
          <path
            d="M37.9 82.6 V79.4 C 37.9 76.4 39.8 74.4 39.8 74.4 C 39.8 74.4 41.7 76.4 41.7 79.4 V82.6 Z"
            fill="var(--nb-una-base)"
          />
          <path
            d="M42.9 80.2 V77 C 42.9 74 44.8 72 44.8 72 C 44.8 72 46.7 74 46.7 77 V80.2 Z"
            fill="var(--nb-una-base)"
          />
          <path
            d="M47.9 80.8 V77.6 C 47.9 74.6 49.8 72.6 49.8 72.6 C 49.8 72.6 51.7 74.6 51.7 77.6 V80.8 Z"
            fill="var(--nb-una-base)"
          />
          <path
            d="M52.9 83.2 V80 C 52.9 77 54.8 75 54.8 75 C 54.8 75 56.7 77 56.7 80 V83.2 Z"
            fill="var(--nb-una-base)"
          />
          <path
            className={estilos.esmalte1}
            d="M37.9 82.6 V79.4 C 37.9 76.4 39.8 74.4 39.8 74.4 C 39.8 74.4 41.7 76.4 41.7 79.4 V82.6 Z"
            fill="var(--nb-rojo)"
          />
          <path
            className={estilos.esmalte2}
            d="M42.9 80.2 V77 C 42.9 74 44.8 72 44.8 72 C 44.8 72 46.7 74 46.7 77 V80.2 Z"
            fill="var(--nb-rojo)"
          />
          <path
            className={estilos.esmalte3}
            d="M47.9 80.8 V77.6 C 47.9 74.6 49.8 72.6 49.8 72.6 C 49.8 72.6 51.7 74.6 51.7 77.6 V80.8 Z"
            fill="var(--nb-rojo)"
          />
          <path
            className={estilos.esmalte4}
            d="M52.9 83.2 V80 C 52.9 77 54.8 75 54.8 75 C 54.8 75 56.7 77 56.7 80 V83.2 Z"
            fill="var(--nb-rojo)"
          />
        </g>
        {/* Soplidos (de los morros hacia las uñas) */}
        <g
          className={estilos.soplido}
          stroke="var(--accent)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M52 60.5 Q 49.5 63 49 66.5" />
          <path d="M55 61.5 Q 53.6 64.5 54 68" />
        </g>
        {/* Destellos de «uñas perfectas» */}
        <path
          className={estilos.brillo}
          d="M33 69 l1.3 2.8 2.8 1.3 -2.8 1.3 -1.3 2.8 -1.3 -2.8 -2.8 -1.3 2.8 -1.3 Z"
          fill="var(--accent)"
        />
        <path
          className={estilos.brilloB}
          d="M59.5 70.5 l1 2.1 2.1 1 -2.1 1 -1 2.1 -1 -2.1 -2.1 -1 2.1 -1 Z"
          fill="var(--nb-oro-rosa-osc)"
        />
        {/* Mano del pincel — reposo: con la punta del pincel metida en el bote */}
        <g className={estilos.manoPincel}>
          <rect
            x="98.4"
            y="74.6"
            width="4.2"
            height="10.5"
            rx="1.6"
            fill="var(--nb-oro-rosa)"
            stroke="var(--nb-oro-rosa-osc)"
            strokeWidth="0.9"
          />
          <rect x="99.6" y="85" width="1.8" height="6.2" rx="0.9" fill="var(--nb-oro-rosa-osc)" />
          <path
            d="M99.3 90.8 L101.7 90.8 L101.1 94.8 Q 100.5 96 99.9 94.8 Z"
            fill="var(--nb-rojo)"
          />
          <rect
            x="103.6"
            y="70.4"
            width="4.6"
            height="10.4"
            rx="2.3"
            fill="var(--nb-oro-rosa)"
            stroke="var(--nb-oro-rosa-osc)"
            strokeWidth="1"
          />
          <circle
            cx="100.6"
            cy="75.6"
            r="5.6"
            fill="var(--nb-carcasa)"
            stroke="var(--nb-perfil)"
            strokeWidth="1.3"
          />
          <circle
            cx="96.4"
            cy="78.6"
            r="2.3"
            fill="var(--nb-carcasa)"
            stroke="var(--nb-perfil)"
            strokeWidth="1.2"
          />
        </g>
      </g>
    </svg>
  )
}
