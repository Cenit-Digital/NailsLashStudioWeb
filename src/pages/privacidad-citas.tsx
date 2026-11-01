import { Head } from 'vite-react-ssg'

import { datosPrivacidad, rutaPrivacidad } from '../lib/citas/privacidad'
import { canonicaDe, componerTitulo, construirJsonLd, ORIGEN_CANONICA } from '../lib/seo'
import { DIRECCION, GEO, NOMBRE, TELEFONO, telHref } from '../lib/site'
import estilos from './privacidad-citas.module.scss'

/**
 * La política de privacidad de la vía de citas (issue #41, decisión 8; RGPD art. 13 y LOPDGDD art. 11).
 * Contrato: features/reserva_citas.feature @s31.
 *
 * Solo entra en las rutas con la vía encendida (`App.tsx`). Lo que solo tiene el salón (A-29) sale de
 * `datosPrivacidad()` como `[PENDIENTE: …]` visible, y la puerta de placeholders rompe el build de
 * producción mientras sea placeholder (D-9). Nada del negocio se inventa: lo verificado viene de `site.ts`.
 *
 * Sin `Cabecera` ni `Pie`: sus anclas (#servicios-titulo…) no existen aquí y romperían la puerta de anclas.
 * La `nav` es el índice de la propia página, y cada sección es alcanzable desde ella.
 */
const SECCIONES = [
  ['responsable-titulo', 'Responsable del tratamiento'],
  ['finalidad-titulo', 'Para qué usamos tus datos'],
  ['base-titulo', 'Por qué podemos usarlos'],
  ['datos-titulo', 'Qué datos tratamos'],
  ['destinatarios-titulo', 'Quién más los recibe'],
  ['conservacion-titulo', 'Cuánto tiempo los conservamos'],
  ['derechos-titulo', 'Tus derechos y cómo ejercerlos'],
] as const

const DESCRIPCION =
  'Cómo trata Nails Lash Studio los datos que das al reservar una cita en la web: responsable, finalidad, derechos y plazos.'

export default function PrivacidadCitas() {
  const { razonSocial, nif, email, conservacion } = datosPrivacidad()
  const tel = (
    <a href={telHref(TELEFONO.legible)} className={estilos.enlace}>
      {TELEFONO.legible}
    </a>
  )
  const jsonLd = construirJsonLd({
    nombre: NOMBRE,
    direccion: DIRECCION,
    telefono: TELEFONO.legible,
    geo: GEO,
  })

  return (
    <>
      <Head>
        <title>{componerTitulo('Política de privacidad de las citas')}</title>
        <meta name="description" content={DESCRIPCION} />
        <link rel="canonical" href={canonicaDe(`${rutaPrivacidad()}/`, ORIGEN_CANONICA)} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>

      <header className={estilos.cabecera}>
        <a href={import.meta.env.BASE_URL} className={estilos.enlace}>
          Volver al inicio
        </a>
      </header>

      <main className={estilos.pagina}>
        <h1 className={estilos.titulo}>Política de privacidad de las citas</h1>
        <p className={estilos.intro}>
          Esto es lo que hacemos con tus datos cuando reservas una cita en la web de {NOMBRE}.
        </p>

        <nav aria-label="Contenido de la política" className={estilos.indice}>
          <ul>
            {SECCIONES.map(([id, texto]) => (
              <li key={id}>
                <a href={`#${id}`} className={estilos.enlace}>
                  {texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="responsable-titulo" className={estilos.seccion}>
          <h2 id="responsable-titulo">Responsable del tratamiento</h2>
          <p>Razón social: {razonSocial.valor}</p>
          <p>NIF: {nif.valor}</p>
          <p>
            Dirección: {DIRECCION.via}, {DIRECCION.local}, {DIRECCION.planta},{' '}
            {DIRECCION.centroComercial}, {DIRECCION.codigoPostal} {DIRECCION.localidad}
          </p>
          <p>Teléfono: {tel}</p>
          <p>Email de contacto: {email.valor}</p>
        </section>

        <section aria-labelledby="finalidad-titulo" className={estilos.seccion}>
          <h2 id="finalidad-titulo">Para qué usamos tus datos</h2>
          <p>Gestionar tu cita y enviarte la confirmación por email.</p>
        </section>

        <section aria-labelledby="base-titulo" className={estilos.seccion}>
          <h2 id="base-titulo">Por qué podemos usarlos</h2>
          <p>
            Porque lo pides tú al reservar: el tratamiento es necesario para aplicar medidas
            precontractuales a petición tuya (artículo 6.1.b del RGPD).
          </p>
        </section>

        <section aria-labelledby="datos-titulo" className={estilos.seccion}>
          <h2 id="datos-titulo">Qué datos tratamos</h2>
          <ul>
            <li>Nombre</li>
            <li>Teléfono</li>
            <li>Email</li>
            <li>Servicio elegido</li>
            <li>Día y hora de la cita</li>
          </ul>
        </section>

        <section aria-labelledby="destinatarios-titulo" className={estilos.seccion}>
          <h2 id="destinatarios-titulo">Quién más los recibe</h2>
          <ul>
            <li>
              Google, como proveedor del calendario donde se apunta la cita y del correo con el que
              se envía la confirmación.
            </li>
            <li>
              Cloudflare Turnstile, para comprobar que quien reserva no es un programa automático.
            </li>
          </ul>
        </section>

        <section aria-labelledby="conservacion-titulo" className={estilos.seccion}>
          <h2 id="conservacion-titulo">Cuánto tiempo los conservamos</h2>
          <p>{conservacion.valor}</p>
        </section>

        <section aria-labelledby="derechos-titulo" className={estilos.seccion}>
          <h2 id="derechos-titulo">Tus derechos y cómo ejercerlos</h2>
          <p>Puedes pedirnos en cualquier momento:</p>
          <ul>
            <li>Acceso</li>
            <li>Rectificación</li>
            <li>Supresión</li>
            <li>Oposición</li>
            <li>Limitación del tratamiento</li>
            <li>Portabilidad</li>
          </ul>
          <p>
            Para ejercerlos, llama al {tel} o escribe a {email.valor}.
          </p>
          <p>
            Si crees que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española
            de Protección de Datos:{' '}
            <a href="https://www.aepd.es" className={estilos.enlace}>
              www.aepd.es
            </a>
            .
          </p>
        </section>
      </main>

      <footer className={estilos.pie}>© 2026 {NOMBRE}</footer>
    </>
  )
}
