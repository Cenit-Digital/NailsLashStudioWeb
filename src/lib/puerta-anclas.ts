/**
 * La PUERTA DE ANCLAS VIVAS — el decisor PURO (F-06).
 *
 * Contrato: features/header_nav_footer.feature.
 * Recibe el HTML CRUDO de `dist/` y devuelve violaciones. NO lee ficheros, NI el reloj, NI
 * `process.env`, y NO decide códigos de salida: el cableado con node:fs vive en
 * tools/puerta-anclas.ts. Mismo reparto que la anti-404 de F-04.
 *
 * 🔴 ES UNA PUERTA QUE HOY NO EXISTE, DISTINTA Y COMPLEMENTARIA DE LA ANTI-404 DE F-04. Aquella
 * mira RUTAS `/x` (`RUTA_INTERNA` excluye `#` por diseño); ésta mira ANCLAS `#x`. Ninguna
 * sustituye a la otra (@s4). Sobre el HTML CRUDO de cada página: todo `href="#id"` de la nav
 * resuelve a un `id` presente (ancla muerta → violación), e IGUALDAD DE CONJUNTOS: una sección
 * navegable que la nav no enlaza es INALCANZABLE.
 */
import {
  type ArtefactoDeProduccion,
  idsDeHeadings,
  type PaginaArtefacto,
  rutaDelFichero,
} from './puerta-cascaron.ts'

/** La puerta ACUSA, no gruñe (precedente F-01/F-03/F-04): ruta + regla + ancla o id. */
export interface ViolacionAncla {
  readonly ruta: string
  readonly regla: string
  readonly ancla: string
  readonly id: string
}

export const REGLA_ANCLA_MUERTA = 'ancla de la nav sin destino en la página'
export const REGLA_INALCANZABLE = 'sección navegable inalcanzable desde la nav'

/** Un `<nav>` y su contenido crudo. Las anclas de la nav se extraen SOLO de aquí (@s1: «de la nav»). */
const NAV = /<nav\b[^>]*>([\s\S]*?)<\/nav>/gi
const ANCLA = /<a\b[^>]*>/gi
const ATRIBUTO_HREF = /\bhref\s*=\s*"([^"]*)"/i
const MARCA_DE_ANCLA = '#'

/** Un `href="#servicios-titulo"` de la nav: el ancla entera y el id al que apunta. */
interface AnclaDeNav {
  readonly ancla: string
  readonly id: string
}

/** Los `href="#id"` de TODAS las `<nav>` de la página. Un enlace que no empieza por `#` no es un ancla. */
export function anclasDeNav(html: string): AnclaDeNav[] {
  const anclas: AnclaDeNav[] = []

  for (const nav of html.matchAll(NAV)) {
    for (const etiqueta of nav[1].matchAll(ANCLA)) {
      const href = ATRIBUTO_HREF.exec(etiqueta[0])?.[1]

      if (href !== undefined && href.startsWith(MARCA_DE_ANCLA)) {
        anclas.push({ ancla: href, id: href.slice(MARCA_DE_ANCLA.length) })
      }
    }
  }

  return anclas
}

/**
 * TODOS los `id` de la página. `\sid` (con el espacio) y no `\bid`: el espacio exige que `id` sea
 * un atributo por sí mismo, así que `data-id="x"` o cualquier `…id="x"` pegado a otra palabra NO
 * cuenta como un id de anclaje. Un `id=""` no identifica a nadie: se descarta.
 */
const ATRIBUTO_ID = /\sid\s*=\s*"([^"]*)"/gi

export function idsDeLaPagina(html: string): Set<string> {
  return new Set(
    [...html.matchAll(ATRIBUTO_ID)].map((atributo) => atributo[1]).filter((id) => id !== ''),
  )
}

/**
 * SECCIÓN NAVEGABLE = una `<section>` con `aria-labelledby` que RESUELVE a un HEADING REAL (regla
 * FIJADA por la puerta humana, coherente con `REGLA_SECTION` de F-04). Su id de anclaje es el del
 * heading. Reutiliza `idsDeHeadings` de F-04, así que un heading con id que NINGUNA `<section>`
 * referencia NO es navegable (@s20): eso DISTINGUE la regla de «navegable = cualquier id».
 */
const SECCION = /<section\b([^>]*)>/gi
const ATRIBUTO_LABELLEDBY = /\baria-labelledby\s*=\s*"([^"]*)"/i

export function seccionesNavegables(html: string): string[] {
  const headings = idsDeHeadings(html)
  const navegables: string[] = []

  for (const seccion of html.matchAll(SECCION)) {
    // Una `<section>` sin `aria-labelledby` NO es navegable: se SALTA de raíz, no se normaliza a un
    // literal. Con `?? ''` (la forma vieja) el mutante `?? "Stryker was here!"` era EQUIVALENTE,
    // porque `idsDeHeadings` filtra `''` y `headings.has('')` es siempre false igual que
    // `headings.has('Stryker was here!')`. Aquí el guard PROTEGE UN THROW real (`coincidencia[1]`
    // sobre `null` revienta), así que quitarlo o debilitarlo LANZA y @s23 fila 1 lo MATA.
    const coincidencia = ATRIBUTO_LABELLEDBY.exec(seccion[1])

    if (coincidencia === null) {
      continue
    }

    const referencia = coincidencia[1]

    if (headings.has(referencia)) {
      navegables.push(referencia)
    }
  }

  return navegables
}

/**
 * `if` INDEPENDIENTES, NUNCA `else if`: cada infracción es independiente y el informe las acusa
 * TODAS (@s5). Ancla muerta e inalcanzable son las dos mitades de la igualdad de conjuntos (B-4).
 */
function violacionesDeLaPagina(pagina: PaginaArtefacto): ViolacionAncla[] {
  const idsPagina = idsDeLaPagina(pagina.html)
  const idsEnlazados = new Set(anclasDeNav(pagina.html).map((ancla) => ancla.id))
  const violaciones: ViolacionAncla[] = []

  // NI UNA DE MÁS: «el id del ancla NO está en el conjunto de ids de la página». Un `#servicios`
  // cae en el vacío aunque exista `servicios-titulo`, porque `servicios` no es un id de la página.
  for (const ancla of anclasDeNav(pagina.html)) {
    if (!idsPagina.has(ancla.id)) {
      violaciones.push({
        ruta: pagina.ruta,
        regla: REGLA_ANCLA_MUERTA,
        ancla: ancla.ancla,
        id: ancla.id,
      })
    }
  }

  // NI UNA DE MENOS: una sección navegable cuyo id ninguna ancla de la nav enlaza es inalcanzable.
  for (const idSeccion of seccionesNavegables(pagina.html)) {
    if (!idsEnlazados.has(idSeccion)) {
      violaciones.push({
        ruta: pagina.ruta,
        regla: REGLA_INALCANZABLE,
        ancla: '',
        id: idSeccion,
      })
    }
  }

  return violaciones
}

export function inspeccionarAnclas(paginas: readonly PaginaArtefacto[]): ViolacionAncla[] {
  return paginas.flatMap((pagina) => violacionesDeLaPagina(pagina))
}

/** Acusar, no gruñir: cada línea dice QUÉ ruta, QUÉ ancla o id, y QUÉ falta (la regla). */
export function describir(violacion: ViolacionAncla): string {
  const detalle =
    violacion.ancla === ''
      ? `id "${violacion.id}"`
      : `ancla "${violacion.ancla}" → id "${violacion.id}"`

  return `${violacion.ruta} — ${violacion.regla}: ${detalle}`
}

// =============================================================================================
// LA PUERTA: la que lee el artefacto, aplica las guardas y decide el código de salida.
// =============================================================================================

export interface PeticionPuertaAnclas {
  readonly artefacto: ArtefactoDeProduccion
}

export interface ResultadoPuertaAnclas {
  readonly codigoSalida: number
  readonly lineas: readonly string[]
}

const CODIGO_EXITO = 0
const CODIGO_FALLO = 1

function motivoDelReventon(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function ejecutarPuertaDeAnclas(peticion: PeticionPuertaAnclas): ResultadoPuertaAnclas {
  try {
    return inspeccionarArtefacto(peticion)
  } catch (error: unknown) {
    // @s8 FALLA CERRADA: ante la duda, BUILD ROTO, NUNCA BUILD VERDE. Tragarse la excepción y
    // devolver «0 violaciones» sería PEOR que no tener puerta, porque además daría confianza falsa.
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: [`la puerta de anclas no pudo completar la inspección: ${motivoDelReventon(error)}`],
    }
  }
}

function inspeccionarArtefacto(peticion: PeticionPuertaAnclas): ResultadoPuertaAnclas {
  // El artefacto se lee SOLO si existe: `listarHtml` LANZA si no (contrato del puerto de F-04).
  // @s6, fila 1: un dist/ ausente falla CERRADA declarando por qué, no escaneando el vacío.
  if (!peticion.artefacto.existe()) {
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: ['no se pudo inspeccionar el artefacto: el directorio dist/ no existe'],
    }
  }

  const paginas = peticion.artefacto.listarHtml().map((fichero) => ({
    ruta: rutaDelFichero(fichero.ubicacion),
    html: fichero.contenido,
  }))

  // @s6, fila 2: dist/ sin ningún HTML → NUNCA verde por vacuidad. 0 páginas no es «protegidos».
  if (paginas.length === 0) {
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: ['no se pudo inspeccionar el artefacto: dist/ no contiene ningún fichero HTML'],
    }
  }

  const violaciones = inspeccionarAnclas(paginas)

  if (violaciones.length > 0) {
    return { codigoSalida: CODIGO_FALLO, lineas: violaciones.map(describir) }
  }

  // GUARDA DEL PRIMER EXTRACTOR (@s7). EL OBJETO VIGILADO ES EL EXTRACTOR, NO EL SITIO. `.some()` y
  // NO una suma: con `total + …` el mutante `total - …` es EQUIVALENTE (restar de 0 nunca vuelve a
  // 0 salvo que todo sea 0, mismo veredicto). Así `> 0` → `>= 0` MUERE en @s7.
  const seInspeccionoAlgunAncla = paginas.some((pagina) => anclasDeNav(pagina.html).length > 0)

  if (!seInspeccionoAlgunAncla) {
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: ['no se inspeccionó ningún ancla de la nav: el extractor de anclas no encontró ninguna'],
    }
  }

  // GUARDA DEL SEGUNDO EXTRACTOR (@s19), el gemelo del anterior. Es el BLOQUEANTE que la revisión
  // adversarial cazó: sin ella, un extractor de secciones roto certifica verde SIN MIRAR la mitad
  // «ni una de menos» de B-4, y la mutación NO lo delata (sigue al 100%). Mismo `.some()` que @s7.
  const seDerivoAlgunaSeccion = paginas.some(
    (pagina) => seccionesNavegables(pagina.html).length > 0,
  )

  if (!seDerivoAlgunaSeccion) {
    return {
      codigoSalida: CODIGO_FALLO,
      lineas: [
        'no se inspeccionó ninguna sección navegable: el extractor de secciones no derivó ninguna',
      ],
    }
  }

  return { codigoSalida: CODIGO_EXITO, lineas: [] }
}
