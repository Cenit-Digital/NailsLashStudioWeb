import { Head } from 'vite-react-ssg'

import { Cabecera } from '../components/Cabecera'
import { Hero } from '../components/Hero'
import { Pie } from '../components/Pie'
import { HORARIO_SEMANAL, openingHoursSpecification } from '../lib/horario'
import { canonicaDe, componerTitulo, construirJsonLd, ORIGEN_CANONICA } from '../lib/seo'
import { DIRECCION, GEO, NOMBRE, TELEFONO, telHref } from '../lib/site'

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

const ID_SERVICIOS = 'servicios-titulo'
const ID_CONTACTO = 'contacto-titulo'

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
        {/* El HERO de F-07: reestiliza el <h1>{NOMBRE} que F-04 dejó horneado. Sigue habiendo UN
            <h1> (dos <span> + text node de espacio → «Nails Lash Studio»), con su paintReveal de
            estado base VISIBLE en el SCSS module. Ver src/components/Hero.tsx. */}
        <Hero />

        {/* El título de sección es un heading REAL referenciado por `aria-labelledby`, NUNCA un
            `div` con `font-size`: una relación que el diseño comunica VISUALMENTE tiene que
            existir EN EL CÓDIGO (@s18 — lo único de F-04 que mide `SC 1.3.1` de verdad). */}
        <section aria-labelledby={ID_SERVICIOS}>
          <h2 id={ID_SERVICIOS}>Servicios</h2>
          <p>Uñas, pestañas y cejas.</p>
        </section>

        <section aria-labelledby={ID_CONTACTO}>
          <h2 id={ID_CONTACTO}>Contacto</h2>
          <p>
            {DIRECCION.via}, {DIRECCION.local}, {DIRECCION.centroComercial},{' '}
            {DIRECCION.codigoPostal} {DIRECCION.localidad}
          </p>
          <a href={telHref(TELEFONO.legible)}>{TELEFONO.legible}</a>
        </section>
      </main>

      {/* El pie de F-06: la marca, el `tel:` y Facebook (derivados de F-02). NO emite enlaces
          legales (los cazaría la anti-404 —el bug del cliente—; son F-16). Ver src/components/Pie.tsx. */}
      <Pie />
    </>
  )
}
