import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  type ArtefactoDeProduccion,
  ejecutarPuertaDelCascaron,
  type FicheroHtml,
  inspeccionarSitio,
  REGLA_ENLACE_ROTO,
} from './puerta-cascaron.ts'
import { detectarOrigenesExternos } from './terceros.ts'
import {
  describir,
  ejecutarPuertaDeAnclas,
  inspeccionarAnclas,
  REGLA_ANCLA_MUERTA,
  REGLA_INALCANZABLE,
} from './puerta-anclas.ts'

/** Dato REAL de la fuente única de F-02, escrito A MANO (anti-tautología): site.ts:47 REDES.facebook. */
const FACEBOOK = 'https://www.facebook.com/nailslashstudiorozas/'

const SERVICIOS = 'servicios-titulo'
const CONTACTO = 'contacto-titulo'

/** El HTML de una home consistente HOY: nav a #servicios-titulo/#contacto-titulo con sus secciones. */
function homeConsistente(): string {
  return html({
    anclasNav: [`#${SERVICIOS}`, `#${CONTACTO}`],
    secciones: [
      { labelledby: SERVICIOS, headingId: SERVICIOS },
      { labelledby: CONTACTO, headingId: CONTACTO },
    ],
  })
}

/** Un artefacto de una sola página `dist/index.html` con el HTML que se le dé. */
function artefactoCon(contenido: string): ArtefactoDeProduccion {
  return {
    existe: () => true,
    listarHtml: (): readonly FicheroHtml[] => [{ ubicacion: 'dist/index.html', contenido }],
  }
}

/**
 * F-06 — la PUERTA DE ANCLAS VIVAS (decisor puro). Contrato:
 * features/header_nav_footer.feature.
 *
 * 🔴 LA ENTRADA SON LOS BYTES DE `dist/`, NUNCA UN RENDER DEL ÁRBOL DE COMPONENTES. Es la puerta
 * que HOY NO EXISTE: la anti-404 de F-04 EXCLUYE las anclas por diseño (`RUTA_INTERNA` no ve `#`),
 * así que una nav con 7 anclas muertas pasaría las cuatro puertas en verde. Ésta cierra ese hueco.
 *
 * Los fixtures se construyen con una FUNCIÓN llamada DENTRO del `it`, nunca como constante del
 * `describe`: lo calculado en el cuerpo del `describe` corre en recolección, SIN mutante activo →
 * supervivientes FALSOS (docs/verification.md; en F-03 produjeron 189).
 */

interface Seccion {
  readonly labelledby: string
  readonly headingId: string
}

interface OpcionesFixture {
  readonly anclasNav?: readonly string[]
  readonly secciones?: readonly Seccion[]
  readonly headingsSueltos?: readonly string[]
  readonly idsExtra?: readonly string[]
  readonly enlacesFuera?: readonly string[]
}

/** El HTML CRUDO de una página, con la nav, las secciones y los ids que se le pidan. */
function html(opciones: OpcionesFixture = {}): string {
  const {
    anclasNav = [],
    secciones = [],
    headingsSueltos = [],
    idsExtra = [],
    enlacesFuera = [],
  } = opciones

  const linksNav = anclasNav.map((href) => `<a href="${href}">enlace</a>`).join('')
  const bloquesSeccion = secciones
    .map(
      (seccion) =>
        `<section aria-labelledby="${seccion.labelledby}"><h2 id="${seccion.headingId}">Título</h2></section>`,
    )
    .join('')
  const sueltos = headingsSueltos.map((id) => `<h2 id="${id}">Suelto</h2>`).join('')
  const extras = idsExtra.map((id) => `<div id="${id}"></div>`).join('')
  const fuera = enlacesFuera.map((href) => `<a href="${href}">fuera</a>`).join('')

  return `<!doctype html>
<html lang="es">
  <head></head>
  <body>
    <nav aria-label="Principal">${linksNav}</nav>
    <main>${bloquesSeccion}${sueltos}${extras}</main>
    <footer>${fuera}</footer>
  </body>
</html>`
}

/**
 * @s1 — un `href="#id"` de la nav a un id ausente en la página produce violación (ancla muerta).
 * El `Then` asevera EL ANCLA Y EL ID, no solo la cuenta: es la lección de F-05 (@s24 mataba CERO
 * porque su `Then` solo aseveraba conteos, ciego a las mutaciones de valor). Los esperados van A
 * MANO; jamás se importan del código de producción.
 */
describe('@s1 la puerta de anclas acusa un ancla muerta', () => {
  it.each([
    ['#facial', 'facial'],
    ['#colores', 'colores'],
    ['#servicios', 'servicios'],
    ['#contacto', 'contacto'],
  ])('@s1 la nav enlaza %s y la página no tiene ese id → 1 violación que declara el ancla y el id', (ancla, idBuscado) => {
    const violaciones = inspeccionarAnclas([
      { ruta: '/', html: html({ anclasNav: [ancla], headingsSueltos: [`${idBuscado}-titulo`] }) },
    ])

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0].regla).toBe(REGLA_ANCLA_MUERTA)
    expect(violaciones[0].ruta).toBe('/')
    expect(violaciones[0].ancla).toBe(ancla)
    expect(violaciones[0].id).toBe(idBuscado)
  })
})

/**
 * @s2 — el CAMINO FELIZ, y es el estado de `home.tsx` HOY: la nav apunta a `#servicios-titulo` y
 * `#contacto-titulo`, cuyos ids existen en los `<h2>`. Sin este escenario, una puerta que devolviera
 * una violación SIEMPRE pasaría todos los negativos y rompería el build para siempre. Mata además el
 * mutante que marque TODO ancla como muerta (@s1 lo dejaría vivo).
 */
describe('@s2 una nav cuyas anclas resuelven todas a un id presente no produce violación', () => {
  it('@s2 nav a #servicios-titulo y #contacto-titulo con ambos ids presentes → 0 violaciones', () => {
    const violaciones = inspeccionarAnclas([
      {
        ruta: '/',
        html: html({
          anclasNav: [`#${SERVICIOS}`, `#${CONTACTO}`],
          secciones: [
            { labelledby: SERVICIOS, headingId: SERVICIOS },
            { labelledby: CONTACTO, headingId: CONTACTO },
          ],
        }),
      },
    ])

    expect(violaciones).toEqual([])
  })
})

/**
 * @s3 — LA OTRA MITAD DE LA IGUALDAD DE CONJUNTOS (B-4): la nav enlaza EXACTAMENTE a las secciones
 * existentes —ni una de más (@s1: ancla muerta) NI UNA DE MENOS (aquí: sección inalcanzable)—.
 * «Sección navegable» = una `<section>` con `aria-labelledby` que RESUELVE a un heading real; su id
 * de anclaje es el del heading (regla FIJADA por la puerta humana, coherente con REGLA_SECTION de F-04).
 */
describe('@s3 una sección navegable que ninguna ancla enlaza es inalcanzable', () => {
  it.each([['faq'], [CONTACTO]])(
    '@s3 la sección navegable "%s" sin enlace en la nav → 1 violación de inalcanzable con su id',
    (idSeccion) => {
      const violaciones = inspeccionarAnclas([
        {
          ruta: '/',
          html: html({ secciones: [{ labelledby: idSeccion, headingId: idSeccion }], anclasNav: [] }),
        },
      ])

      expect(violaciones).toHaveLength(1)
      expect(violaciones[0].regla).toBe(REGLA_INALCANZABLE)
      expect(violaciones[0].ruta).toBe('/')
      expect(violaciones[0].id).toBe(idSeccion)
    },
  )
})

/**
 * @s20 — EL EXAMPLE QUE DISTINGUE LA REGLA de «sección navegable». Un heading con id que NINGUNA
 * `<section>` referencia por `aria-labelledby` NO es navegable → 0 violaciones de inalcanzable. Un
 * mutante «navegable = cualquier id» —que sobrevive a @s1/@s2/@s3— aquí acusa 1 y MUERE. Sin este
 * escenario, la mitad «ni una de menos» de B-4 queda anclada TAUTOLÓGICAMENTE a la implementación.
 */
describe('@s20 un heading que ninguna sección referencia no es navegable', () => {
  it('@s20 <h2 id="promociones-titulo"> suelto, nav que no lo enlaza → 0 violaciones de inalcanzable para ese id', () => {
    const violaciones = inspeccionarAnclas([
      { ruta: '/', html: html({ headingsSueltos: ['promociones-titulo'], anclasNav: [] }) },
    ])

    const inalcanzablesDelId = violaciones.filter(
      (violacion) =>
        violacion.regla === REGLA_INALCANZABLE && violacion.id === 'promociones-titulo',
    )

    expect(inalcanzablesDelId).toEqual([])
  })
})

/**
 * @s5 — LA PUERTA ACUSA, NO GRUÑE (precedente F-01/F-03/F-04). «Hay anclas rotas» sin decir cuáles
 * no se arregla a las 3 de la mañana. TRES violaciones y no una: cada infracción es independiente;
 * un `else if` en vez de `if` independientes deja una sin acusar. DETERMINISMO: misma entrada →
 * misma salida, MISMO ORDEN → informe DIFFABLE.
 */
describe('@s5 el informe acusa una línea por violación y es determinista', () => {
  function paginaConTresFallos() {
    return {
      ruta: '/',
      html: html({
        anclasNav: ['#facial', '#depilacion'],
        secciones: [{ labelledby: 'faq', headingId: 'faq' }],
      }),
    }
  }

  it('@s5 dos anclas muertas y una sección inalcanzable → exactamente 3 violaciones', () => {
    expect(inspeccionarAnclas([paginaConTresFallos()])).toHaveLength(3)
  })

  it('@s5 cada violación, descrita, nombra su ruta, su ancla o id, y qué falta', () => {
    const lineas = inspeccionarAnclas([paginaConTresFallos()]).map(describir)

    expect(lineas[0]).toContain('/')
    expect(lineas[0]).toContain('#facial')
    expect(lineas[0]).toContain('facial')
    expect(lineas[0]).toContain(REGLA_ANCLA_MUERTA)
    expect(lineas[1]).toContain('#depilacion')
    expect(lineas[2]).toContain('faq')
    expect(lineas[2]).toContain(REGLA_INALCANZABLE)
  })

  it('@s5 inspeccionar el mismo artefacto dos veces da listas idénticas y en el mismo orden', () => {
    const primera = inspeccionarAnclas([paginaConTresFallos()])
    const segunda = inspeccionarAnclas([paginaConTresFallos()])

    expect(segunda).toEqual(primera)
  })
})

/**
 * @s9 — EL CAMINO FELIZ DE LA PUERTA (el humilde). Sin él, una puerta que rompiera SIEMPRE pasaría
 * todos los escenarios negativos. `dist/` con una nav en la que cada `href="#id"` resuelve y cada
 * sección navegable está enlazada → exit 0, sin violaciones.
 */
describe('@s9 el build con una nav consistente termina con exit 0', () => {
  it('@s9 una home consistente → codigoSalida 0 y ninguna violación', () => {
    const resultado = ejecutarPuertaDeAnclas({ artefacto: artefactoCon(homeConsistente()) })

    expect(resultado.codigoSalida).toBe(0)
    expect(resultado.lineas).toEqual([])
  })
})

/**
 * @s6 — FALLA CERRADA, NUNCA VERDE POR VACUIDAD. `dist/` vacío → 0 páginas → 0 anclas → 0
 * violaciones → build VERDE → «protegidos». 0 fallos sobre 0 páginas NO ES ESTAR PROTEGIDO: ES NO
 * HABER MIRADO. La puerta corre DESPUÉS del build; uno que no generó nada la dejaría escaneando el
 * vacío. La salida declara POR QUÉ, y NO declara que esté todo bien.
 */
describe('@s6 la puerta falla si el artefacto está ausente o no tiene páginas', () => {
  it('@s6 el directorio dist/ no existe → exit != 0 y declara por qué, sin dar por bueno nada', () => {
    const resultado = ejecutarPuertaDeAnclas({
      artefacto: {
        existe: () => false,
        listarHtml: () => {
          throw new Error('no debería listarse un dist/ que no existe')
        },
      },
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('no se pudo inspeccionar el artefacto')
    expect(resultado.lineas.join('\n')).not.toMatch(/ningún ancla rot|no hay anclas rot/i)
  })

  it('@s6 dist/ existe pero no contiene ningún fichero HTML → exit != 0 y declara por qué', () => {
    const resultado = ejecutarPuertaDeAnclas({
      artefacto: { existe: () => true, listarHtml: () => [] },
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('no se pudo inspeccionar el artefacto')
    expect(resultado.lineas.join('\n')).not.toMatch(/ningún ancla rot|no hay anclas rot/i)
  })
})

/**
 * @s7 — ESCENARIO DE VACUIDAD OBLIGATORIO (patrón @s28 de F-04). EL OBJETO VIGILADO NO ES EL SITIO:
 * ES EL EXTRACTOR. Que la puerta informe «0 anclas rotas» habiendo mirado 0 ANCLAS es el mismo verde
 * por vacuidad, un nivel más abajo. Un extractor que deja de casar hace pasar la puerta «protegidos»
 * sin mirar nada.
 */
describe('@s7 la puerta falla si no ha inspeccionado ni un solo ancla de nav', () => {
  it('@s7 el extractor deriva 0 anclas de nav → exit != 0 y declara que no inspeccionó ninguna', () => {
    const resultado = ejecutarPuertaDeAnclas({
      artefacto: artefactoCon(html({ anclasNav: [], secciones: [] })),
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('no se inspeccionó ningún ancla de la nav')
    expect(resultado.lineas.join('\n')).not.toMatch(/ningún ancla rot|no hay anclas rot/i)
  })
})

/**
 * @s19 — LA GUARDA QUE FALTABA (BLOQUEANTE de la revisión adversarial). La puerta tiene DOS
 * extractores: (1) anclas de nav (guardado por @s7) y (2) secciones navegables. Solo (1) tenía
 * guarda. Modo de fallo: si (2) deriva 0 mientras las anclas se extraen bien → @s7 verde, @s1/@s2
 * verdes, @s3 VACUO → exit 0 habiendo inspeccionado CERO secciones. Y la mutación SEGUIRÍA al 100%
 * (@s3 mata en su fixture al mutante que vacía el extractor): la brecha es INVISIBLE a la métrica.
 * Fixture: nav con ancla VIVA (pasa @s7) pero sin ninguna sección navegable.
 */
describe('@s19 la puerta falla si no ha derivado ni una sola sección navegable', () => {
  it('@s19 hay anclas vivas pero 0 secciones navegables → exit != 0 y declara que no derivó ninguna', () => {
    const resultado = ejecutarPuertaDeAnclas({
      artefacto: artefactoCon(html({ anclasNav: ['#top'], idsExtra: ['top'], secciones: [] })),
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('no se inspeccionó ninguna sección navegable')
    expect(resultado.lineas.join('\n')).not.toMatch(/inalcanzable|secciones? inalcanzabl/i)
  })
})

/**
 * @s8 — FALLA CERRADA SI ELLA MISMA REVIENTA (derivación de D-9/I-8, igual que F-01/F-03/F-04/F-05).
 * Una puerta que se traga su propia excepción y devuelve `[]` es PEOR QUE NO TENER PUERTA, porque
 * además da confianza. ANTE LA DUDA: BUILD ROTO, NUNCA BUILD VERDE. Ancla la CAUSA concreta, no solo
 * la frase (el superviviente REAL que la mutación destapó en `puerta.ts` de F-01).
 */
describe('@s8 la puerta falla cerrada si la lectura o el parseo revienta', () => {
  const MOTIVO = 'EACCES: permission denied'

  it('@s8 si listarHtml lanza → exit != 0 y declara que no pudo completar, con la causa', () => {
    const resultado = ejecutarPuertaDeAnclas({
      artefacto: {
        existe: () => true,
        listarHtml: () => {
          throw new Error(MOTIVO)
        },
      },
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('no pudo completar la inspección')
    expect(resultado.lineas.join('\n')).toContain(MOTIVO)
    expect(resultado.lineas.join('\n')).not.toMatch(/ningún ancla rot|no hay anclas rot/i)
  })
})

/**
 * @s4 — EL ESCENARIO QUE IMPIDE CONFUNDIR LAS DOS PUERTAS. La anti-404 IGNORA "#facial" por diseño
 * (`RUTA_INTERNA` excluye "#"); la puerta de anclas IGNORA "/servicios" (no es un ancla). SON
 * GEMELAS PARA EJES QUE LA OTRA EXCLUYE. Sin este escenario, alguien «funde» las dos puertas y
 * reabre el hueco de las 7 anclas muertas que HOY pasan las cuatro puertas en verde.
 */
describe('@s4 la puerta de anclas es distinta y complementaria de la anti-404 (#x vs /x)', () => {
  function paginaAnclaMuertaYRutaRota() {
    return { ruta: '/', html: html({ anclasNav: ['#facial', '/servicios'] }) }
  }

  it('@s4 la puerta de anclas acusa "#facial" como ancla muerta y NO acusa "/servicios"', () => {
    const violaciones = inspeccionarAnclas([paginaAnclaMuertaYRutaRota()])

    expect(violaciones).toHaveLength(1)
    expect(violaciones[0].regla).toBe(REGLA_ANCLA_MUERTA)
    expect(violaciones[0].ancla).toBe('#facial')
    expect(violaciones.some((violacion) => violacion.ancla.includes('/servicios'))).toBe(false)
  })

  it('@s4 la anti-404 de F-04 acusa "/servicios" como enlace roto y NO acusa "#facial"', () => {
    const rotos = inspeccionarSitio([paginaAnclaMuertaYRutaRota()], ['/']).filter(
      (violacion) => violacion.regla === REGLA_ENLACE_ROTO,
    )

    expect(rotos.map((violacion) => violacion.valor)).toContain('/servicios')
    expect(rotos.map((violacion) => violacion.valor)).not.toContain('#facial')
  })

  it('@s4 el build (puerta de anclas) sale con código distinto de 0 por el ancla muerta', () => {
    const resultado = ejecutarPuertaDeAnclas({
      artefacto: artefactoCon(paginaAnclaMuertaYRutaRota().html),
    })

    expect(resultado.codigoSalida).not.toBe(0)
    expect(resultado.lineas.join('\n')).toContain('#facial')
  })
})

/**
 * @s13 — F-06 NO EMITE ENLACES LEGALES (casos límite 7). Rutas, enlaces y contenido legal son F-16
 * (A-17, cerrada). Un pie que enlaza a la nada ES LITERALMENTE EL BUG DEL CLIENTE (su /es/aviso-legal
 * da 404). Este escenario DESLINDA: si aparecieran enlaces legales, los caza la anti-404 de F-04,
 * NO la puerta de anclas.
 */
describe('@s13 un href interno a una ruta legal inexistente lo caza la anti-404, no la de anclas', () => {
  function paginaConEnlaceLegal() {
    return { ruta: '/', html: html({ enlacesFuera: ['/aviso-legal'] }) }
  }

  it('@s13 la anti-404 de F-04 emite violación por "/aviso-legal" y el build sale != 0', () => {
    const rotos = inspeccionarSitio([paginaConEnlaceLegal()], ['/']).filter(
      (violacion) => violacion.regla === REGLA_ENLACE_ROTO,
    )
    expect(rotos.map((violacion) => violacion.valor)).toContain('/aviso-legal')

    const resultado = ejecutarPuertaDelCascaron({
      artefacto: artefactoCon(paginaConEnlaceLegal().html),
      rutasEsperadas: ['/'],
    })
    expect(resultado.codigoSalida).not.toBe(0)
  })

  it('@s13 la puerta de anclas NO acusa "/aviso-legal" (no es un ancla "#…")', () => {
    const violaciones = inspeccionarAnclas([paginaConEnlaceLegal()])

    expect(violaciones.some((violacion) => violacion.ancla.includes('/aviso-legal'))).toBe(false)
  })
})

/**
 * @s14 — COHERENCIA CON @s12 DE F-05 y @s24 DE F-04. Sin este escenario, alguien «endurece» una
 * puerta tratando el enlace de Facebook como interno o como petición, y ROMPE EL CONTACTO DEL SALÓN.
 * Facebook es un HIPERENLACE (lo pide el usuario), externo, y no es un ancla: NINGUNA puerta lo caza.
 * Instagram se ELIDE a propósito (site.ts guarda un HANDLE, no una URL: hornearla sería hardcodear).
 */
describe('@s14 el enlace del pie a Facebook pasa las tres puertas de enlaces', () => {
  function paginaConFacebook() {
    return { ruta: '/', html: html({ enlacesFuera: [FACEBOOK] }) }
  }

  it('@s14 la puerta de terceros (F-05) NO lo acusa: es un hiperenlace, no una petición automática', () => {
    const externos = detectarOrigenesExternos(
      [{ ubicacion: '/', tipo: 'html', contenido: paginaConFacebook().html }],
      [],
    )

    expect(externos).toEqual([])
  })

  it('@s14 la anti-404 de F-04 NO lo acusa: es externo, no una ruta interna', () => {
    const rotos = inspeccionarSitio([paginaConFacebook()], ['/']).filter(
      (violacion) => violacion.regla === REGLA_ENLACE_ROTO,
    )

    expect(rotos.map((violacion) => violacion.valor)).not.toContain(FACEBOOK)
  })

  it('@s14 la puerta de anclas NO lo acusa: no es un ancla "#…"', () => {
    const violaciones = inspeccionarAnclas([paginaConFacebook()])

    expect(violaciones.some((violacion) => violacion.ancla.includes('facebook'))).toBe(false)
  })
})

/**
 * @s10 — LA PUERTA SEPARA «VER» DE «PUBLICAR» (precedente F-01/F-03/F-04/F-05). La FUNCIÓN es pura;
 * el `exit != 0` vive en el HUMILDE, enganchado SOLO a `pnpm build` de producción, DESPUÉS de
 * `vite-react-ssg build` y DESPUÉS de las otras cuatro puertas. `dev` NO la invoca: en local una nav
 * a medias es legítima, es para ver el diseño.
 */
describe('@s10 la puerta de anclas está enganchada al build de PRODUCCIÓN, no al de desarrollo', () => {
  function scripts(): Record<string, string> {
    return (JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> })
      .scripts
  }

  it('@s10 el script "build" invoca la puerta de anclas DESPUÉS de vite-react-ssg build y de la anti-404', () => {
    const build = scripts().build

    expect(build).toContain('tools/puerta-anclas.ts')
    expect(build.indexOf('vite-react-ssg build')).toBeLessThan(build.indexOf('tools/puerta-anclas.ts'))
    expect(build.indexOf('tools/puerta-cascaron.ts')).toBeLessThan(
      build.indexOf('tools/puerta-anclas.ts'),
    )
  })

  it.each([['dev'], ['dev:ssr']])('@s10 el script "%s" NO invoca la puerta de anclas', (guion) => {
    expect(scripts()[guion]).not.toContain('puerta-anclas')
  })
})
