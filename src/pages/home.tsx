import { Head } from 'vite-react-ssg'

import { BotonWhatsApp } from '../components/BotonWhatsApp'
import { Cabecera } from '../components/Cabecera'
import { Catalogo } from '../components/Catalogo'
import { Contacto } from '../components/Contacto'
import { Destacados } from '../components/Destacados'
import { Equipo } from '../components/Equipo'
import { Faq } from '../components/Faq'
import { Galeria } from '../components/Galeria'
import { Hero } from '../components/Hero'
import { Ofertas } from '../components/Ofertas'
import { Pie } from '../components/Pie'
import { PruebaColor } from '../components/PruebaColor'
import { Resenas } from '../components/Resenas'
import { Reserva } from '../components/Reserva'
import { HORARIO_SEMANAL, openingHoursSpecification } from '../lib/horario'
import { canonicaDe, componerTitulo, construirJsonLd, ORIGEN_CANONICA } from '../lib/seo'
import { DIRECCION, GEO, NOMBRE, TELEFONO } from '../lib/site'

/**
 * La CÁSCARA SEMÁNTICA de la home (F-04). Contrato: features/cascaron_semantico.feature.
 *
 * 🔴🔴 EL `<Head>` DE `vite-react-ssg` ES OBLIGATORIO, Y LA METADATA NATIVA DE REACT 19 ESTÁ
 * PROHIBIDA. NO ES PREFERENCIA DE ESTILO: ES LA DIFERENCIA ENTRE TENER SEO Y NO TENERLO.
 *
 * `extractHelmet` lee EXCLUSIVAMENTE del contexto de Helmet; el parámetro `html` (= `appHTML`,
 * el árbol de React ya renderizado) SOLO alimenta al `styleCollector` y NUNCA se parsea buscando
 * metadata [V: node_modules/vite-react-ssg/dist/shared/vite-react-ssg.DsKK_1op.mjs:429-446,
 * código REALMENTE INSTALADO, no el README]. Auditados los DOS ÚNICOS escritores del `<head>`
 * del dist (`metaAttributes` :122-124 y `styleTag` :920): NO EXISTE NINGUNA RUTA DE CÓDIGO por la
 * que un `<title>`/`<meta>` hoisteado por React 19 entre en el `<head>` prerenderizado.
 *   → SI ESTO USARA `<title>` NATIVO DE REACT 19, EL `<head>` DEL BUILD SALDRÍA VACÍO. Y estaría
 *     VERDE en `pnpm dev` y VERDE en jsdom. SEO CERO EN PRODUCCIÓN, CON TODA LA SUITE EN VERDE.
 *     La puerta de `tools/puerta-cascaron.ts` lo caza sobre los BYTES de `dist/` (@s32).
 *
 * SI ENCUENTRAS `metaAttributes.unshift(headElements.innerHTML)` en `:613-617` Y CREES HABER
 * REFUTADO ESTO: NO. Es del adaptador de TANSTACK ROUTER (`META_CONTAINER_ID =
 * "__SSG_TANSTACK_META_CONTAINER__"` [V]). Nosotros usamos react-router, cuyo `render` llama a
 * `extractHelmet` Y A NADA MÁS [V: :455-472].
 *
 * El JSON-LD SÍ tiene vía: `extractHelmet` incluye `helmet.script.toString()` en `metaStrings`
 * [V: :437-442] → un `<Head><script type="application/ld+json">` SE HORNEA.
 *
 * El CONTENIDO real (servicios, equipo, precios, reseñas) llega con sus features. Aquí solo hay
 * cáscara: lo que se ve es andamiaje, lo que importa es lo que viaja HORNEADO en el `<head>`.
 */
const RUTA = '/'

/** Solo datos [V]: las categorías son Uñas · Pestañas · Cejas — «Facial» NO EXISTE aquí. */
const DESCRIPCION = `Estudio de uñas, pestañas y cejas en ${DIRECCION.localidad}. ${DIRECCION.via}, ${DIRECCION.centroComercial}.`

export default function Home() {
  // El JSON-LD de la home (F-04) + el `openingHoursSpecification` de F-10, COMPUESTO AQUÍ, EN EL SITIO
  // DE EMISIÓN (D4): se esparce el objeto de `construirJsonLd` (INTACTO — su @s9 en seo.test.ts
  // asevera EXACTAMENTE 6 claves y quedaría ROJO si se tocara) y se AÑADE la propiedad poblada por la
  // función PURA de `horario.ts`. JAMÁS la clave `openingHours` (la puerta de cascarón de F-04 rompe
  // el build). El bake en `dist/` (@s14) lo asevera el test build-based + la verificación del lead.
  const jsonLd = {
    ...construirJsonLd({
      nombre: NOMBRE,
      direccion: DIRECCION,
      telefono: TELEFONO.legible,
      geo: GEO,
    }),
    openingHoursSpecification: openingHoursSpecification(HORARIO_SEMANAL),
  }

  return (
    <>
      <Head>
        <title>{componerTitulo('home')}</title>
        <meta name="description" content={DESCRIPCION} />
        <link rel="canonical" href={canonicaDe(RUTA, ORIGEN_CANONICA)} />
        {/* El JSON-LD ESCRITO DE CERO (T-6): copiar el del cliente propagaría «Las Ceudas» y su
            `vatID` malformado, que son los dos bugs [V] que F-04 existe para no heredar. F-10 añade
            aquí `openingHoursSpecification` (compuesto en este sitio de emisión, NO en construirJsonLd). */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>

      <Cabecera />

      <main>
        {/* 🎨 DEMO: el marco del hero (degradado, subtítulo, CTAs) envuelve el <Hero/> de F-07, que
            sigue aportando EXACTAMENTE un <h1> (dos <span> → «Nails Lash Studio»). La sección del
            hero NO lleva id ni aria-labelledby: no es «navegable», así que no entra en la igualdad
            de conjuntos de la nav (F-06). */}
        <div className="demo-hero">
          <Hero />
          <p className="demo-hero-sub">
            Tu salón de belleza integral. Uñas, pestañas y cejas de la mano de un equipo que cuida
            cada detalle.
          </p>
          <div className="demo-hero-cta">
            <a className="demo-btn demo-btn--solido" href="#reserva-titulo">
              Reservar cita
            </a>
            <a className="demo-btn demo-btn--ghost" href="#servicios-titulo">
              Ver servicios
            </a>
          </div>
        </div>

        {/* 🎨 DEMO: el catálogo real (Uñas · Pestañas · Cejas) reemplaza el stub «Servicios».
            Es la sección navegable #servicios-titulo (un solo <h2>, id que la nav espera). */}
        <Catalogo />

        {/* 🎨 DEMO: probador de color (12 tonos) — bloque NO navegable (div), como en el prototipo. */}
        <PruebaColor />

        {/* 🎨 DEMO: servicios destacados (#destacados-titulo) y ofertas (#ofertas-titulo). */}
        <Destacados />
        <Ofertas />

        {/* 🎨 DEMO: equipo (#equipo-titulo) — sección navegable justo tras Ofertas. Su <h2> con id
            equipo-titulo cierra la igualdad de conjuntos con el 7º enlace de la nav (F-06). */}
        <Equipo />

        {/* 🎨 DEMO: reseñas (F-14) — bloque NO navegable (div) ENTRE equipo y reserva: el agregado
            real de Treatwell (atribuido, enlazado, fechado) + carrusel de testimonios de EJEMPLO. */}
        <Resenas />

        {/* 🎨 DEMO: reserva rápida (#reserva-titulo) — mini-calendario + chat guiado, front-end. */}
        <Reserva />

        {/* 🎨 DEMO: galería de trabajos (carrusel) — bloque NO navegable (div), tras Reserva. */}
        <Galeria />

        {/* La sección de contacto (F-12) enriquecida para el DEMO: horario (F-10) + dirección +
            Instagram + CTA WhatsApp/tel + mapa. Reutiliza #contacto-titulo — no crea sección nueva. */}
        <Contacto />

        {/* 🎨 DEMO: la FAQ en acordeón (#faq-titulo), respuestas siempre en el DOM. */}
        <Faq />
      </main>

      {/* El pie de F-06: la marca, el `tel:` y Facebook (derivados de F-02). NO emite enlaces
          legales (los cazaría la anti-404 —el bug del cliente—; son F-16). Ver src/components/Pie.tsx. */}
      <Pie />
    </>
  )
}
