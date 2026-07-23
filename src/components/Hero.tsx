import { useEffect, useRef, useState } from 'react'

import aplicadorUrl from '../assets/aplicador.png'
import { partirNombre } from '../lib/partir-nombre'
import { NOMBRE } from '../lib/site'
import { GROSOR_TRAZO, TRAZO_MARCA, VISTA_MARCA } from '../lib/trazo-marca'
import { debeMontarseElControl, milisegundosDeCeremonia, type FaseDeLaFirma } from './hero-logica'
import estilos from './hero.module.scss'

/**
 * El hero de marca (F-07 + demo «CALIGRAFÍA»). Contrato: features/hero.feature.
 *
 * SIGUE HABIENDO EXACTAMENTE UN <h1>, con sus DOS <span> y el text node de espacio REAL entre
 * ellos → nombre accesible «Nails Lash Studio» (@s6/@s7 intactos). Lo que cambia es QUIÉN PINTA
 * «Nails Lash»: ya no el <span> de HTML, sino un <svg> con `viewBox`. Los dos motivos, los dos
 * MEDIDOS, están en `progress/hallazgos_hero_caligrafia.md`:
 *
 * 1. EL RECORTE. La tinta de «Nails Lash» va de x −15,6 a 3965,3 ‰ de em, pero la caja de texto
 *    solo mide 3895 ‰: la «N» se sale 15,6 ‰ por la izquierda y la «h» 70,3 ‰ por la derecha, y
 *    `clip-path: inset(0 0 0 0)` recorta AL BORDER-BOX, así que los seccionaba en vertical. Con un
 *    `viewBox` que encierra la tinta real con margen, **el recorte es imposible por construcción**.
 *
 * 2. LA INCOHERENCIA. Antes eran DOS RELOJES sobre DOS GEOMETRÍAS: la tinta se revelaba con una
 *    guillotina vertical (`clip-path`) mientras el pincel viajaba por otro sitio. Ahora la tinta se
 *    revela con una MÁSCARA que traza la línea central real de las letras (`stroke-dashoffset`) y
 *    el aplicador recorre ESE MISMO path (`offset-path: url(#…)`, sin duplicarlo). Con
 *    `pathLength="100"`, dasharray/dashoffset y `offset-distance` son AMBAS lineales en longitud de
 *    arco, así que con idénticos duration/delay/easing la punta cae EXACTAMENTE sobre el borde de
 *    lo recién pintado. La sincronía no se ajusta a ojo: es exacta por construcción.
 *
 * LA CALIGRAFÍA LENTA (enmienda 2026-07-23): el trazo dura ≈90 s (decisión de Pablo: ≈10 s por
 * letra), gobernado por el ÚNICO token `--duracion-caligrafia` del SCSS, cuyo espejo en lógica
 * (`SEGUNDOS_DE_TRAZO`) alimenta el timeout del fin de reloj. Por encima de 5 s, SC 2.2.2 (nivel
 * A) OBLIGA a un mecanismo para parar/saltar: aquí es el CONTROL SIN CROMO — el propio rótulo es
 * un <button> transparente «Completar la firma» (@s10-@s14) que solo existe mientras la caligrafía
 * corre y jamás bajo prefers-reduced-motion. Toda decisión vive en `hero-logica.ts` (pura).
 *
 * La animación vive en el SCSS module, NUNCA inline (@s5).
 */

/** El <path> de la línea central. Lo referencian la máscara y el `offset-path` del aplicador. */
const ID_TRAZO = 'trazo-marca'
/** La máscara que revela las letras a medida que el trazo se dibuja. */
const ID_MASCARA = 'tinta-marca'

/**
 * El aplicador, en unidades del viewBox (1000 = 1 em). `aplicador.png` mide 15×93 y lo genera
 * `tools/trazo-marca/aplicador.mjs` recortando `brush.png` a cerdas+varilla y volteándolo: la
 * punta queda en el centro del borde INFERIOR. Con `x = −ancho·0,4667` e `y = −alto`, esa punta
 * cae en el (0,0) local, que es el punto que `offset-path` coloca sobre el recorrido.
 * (Medido: el hero anterior lo anclaba al 86 % de la imagen, o sea DENTRO DEL FRASCO.)
 */
const APLICADOR_ALTO = 1100
const APLICADOR_ANCHO = (APLICADOR_ALTO * 15) / 93
const APLICADOR_PUNTA_X = APLICADOR_ANCHO * 0.4667

/**
 * La región del <mask>, DERIVADA del viewBox — no copiada.
 *
 * Antes iba escrita como cuatro literales al lado de `viewBox={VISTA_MARCA}`: dos copias del mismo
 * dato sin nada que las atara. El `judge` lo cazó saboteando `VISTA_MARCA` con la caja EXACTA que
 * seccionaba la «N» y la «h» ('0 -840 3895 1200') — y los 47 tests siguieron VERDES. Con una sola
 * fuente de verdad, encoger el viewBox mueve también la máscara, y el test que comprueba que el
 * viewBox ENCIERRA la tinta medida se pone rojo.
 */
const [VB_X, VB_Y, VB_ANCHO, VB_ALTO] = VISTA_MARCA.split(' ')

const CONSULTA_MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)'

/**
 * El nombre accesible del control sin cromo (@s10). A ≈90 s el mecanismo para parar/saltar es
 * OBLIGATORIO (SC 2.2.2, nivel A): el propio rótulo es el control — cero chips, cero ⏸.
 */
const NOMBRE_DEL_CONTROL = 'Completar la firma'

/**
 * La clase de «lista» (ENMIENDA 2, @s15 — cierra A-3): el SCSS condiciona TODAS las animaciones
 * del rótulo a ella, así que la caligrafía arranca SOLO cuando el montaje la añade — nunca con el
 * CSS a secas ni en el HTML horneado (@s7). Va atada a `controlVivo`: clase y botón nacen en el
 * MISMO render y mueren juntos — por construcción no hay movimiento sin mecanismo para pararlo.
 * GLOBAL a propósito (no del CSS module): observable bajo `css: false`, precedente `data-firma`.
 */
const CLASE_LISTA = 'caligrafia-lista'

/**
 * @s16 (cierra A-2): si el foco está EN el botón cuando va a desmontarse (clic, Enter o fin del
 * reloj), se recoloca en la escena — `tabindex="-1"`: foco programático sí, parada de tabulador
 * no — y el siguiente Tab continúa hacia los CTAs de home.tsx. Si estaba en otro sitio, NO se
 * roba. Vive FUERA del componente (recibe los nodos) para no ser dependencia reactiva del efecto
 * del fin de reloj.
 */
function recolocarElFocoSiCaeAlVacio(escena: HTMLElement | null, boton: HTMLElement | null): void {
  if (document.activeElement === boton) {
    // El `!` es un HECHO del árbol, no una esperanza: si el foco está en el botón, el botón está
    // montado, y su escena (el padre que lo envuelve, @s14) también — un null aquí es INALCANZABLE.
    // A propósito NO es una guarda ejecutable: `escena !== null` fabricaba el mutante equivalente
    // `true && …` (ConditionalExpression 93:7, survived: ningún test puede montar el botón sin su
    // escena). El invariante se declara a nivel de TIPO, donde Stryker no muta.
    escena!.focus()
  }
}

export function Hero() {
  const { marca, tipo } = partirNombre(NOMBRE)
  // `null` = preferencia AÚN SIN LEER (SSR y primera hidratación): el control no se monta, así el
  // HTML horneado y el primer render de cliente coinciden y el botón jamás viaja en los bytes.
  const [movimientoReducido, setMovimientoReducido] = useState<boolean | null>(null)
  const [fase, setFase] = useState<FaseDeLaFirma>('corriendo')
  const controlVivo = debeMontarseElControl(movimientoReducido, fase)
  // @s16: los nodos que necesita la recolocación del foco. La escena (tabindex -1) es el destino;
  // el botón, la condición — solo se recoloca si el foco iba a caer al vacío CON él.
  const escenaRef = useRef<HTMLDivElement | null>(null)
  const botonRef = useRef<HTMLButtonElement | null>(null)

  const completarPorElCliente = (): void => {
    recolocarElFocoSiCaeAlVacio(escenaRef.current, botonRef.current)
    setFase('cliente')
  }

  useEffect(
    () => {
      // La preferencia se lee DENTRO del efecto (nunca durante el render) y GUARDADA por un motivo
      // MEDIDO: jsdom 25 no implementa `matchMedia` (precedente Galeria.tsx / reserva.test.tsx).
      if (typeof window.matchMedia !== 'function') {
        return
      }

      const preferencia = window.matchMedia(CONSULTA_MOVIMIENTO_REDUCIDO)

      setMovimientoReducido(preferencia.matches)

      // [ENMIENDA 2, @s17 — cierra A-5] La preferencia se ESCUCHA en caliente, en este MISMO
      // efecto (patrón Galeria.tsx / galeria @s12): activarla a MITAD de firma la COMPLETA —
      // `reduce` es «páralo YA», y aquí parar = quedarse en la base, que ES el estado final — y
      // clase y botón caen juntos. Desactivarla NO rearranca nada (la rama contraria
      // re-escribiría el rótulo justo cuando el visitante retira la preferencia, y dejaría un
      // botón sobre nada).
      const alCambiarLaPreferencia = (cambio: MediaQueryListEvent) => {
        if (cambio.matches) {
          setMovimientoReducido(true)
        }
      }

      preferencia.addEventListener('change', alCambiarLaPreferencia)

      return () => {
        preferencia.removeEventListener('change', alCambiarLaPreferencia)
      }
    },
    // MUTANTE EQUIVALENTE (ArrayDeclaration, deps → ['Stryker was here']), RATIFICADO por la
    // corrida y el sabotaje de progress/mutation_hero_caligrafia_lenta.md (Hero.tsx 92:6,
    // survived con 54 tests encima; aplicado a mano, la suite COMPLETA siguió verde 1361/1361):
    // deps CONSTANTES de un efecto solo-montaje se comparan elemento a elemento con Object.is y
    // nunca difieren — el efecto corre EXACTAMENTE una vez al montar en ambas versiones. Tercera
    // aparición verificada de la familia (precedente Galeria.tsx:158-159, Equipo.tsx:210).
    // Stryker disable next-line all
    [],
  )

  useEffect(() => {
    // El fin de reloj (@s12): cuando la ceremonia termina por sí sola ya no queda nada que
    // completar y el control se desmonta sin intervención. Corre SOLO mientras el control vive
    // (bajo reduce o tras completar no hay reloj que esperar).
    if (!controlVivo) {
      return
    }

    // ⚠️ `setTimeout` NO devuelve `number` con `@types/node` cargado: el identificador se guarda
    // en una constante local (inferida como ReturnType<typeof setTimeout>) y lo limpia el propio
    // efecto. SIN la limpieza, un clic a mitad dejaría un reloj huérfano que pisaría «cliente»
    // con «reloj» — el test de @s12 lo caza por el data-firma.
    const reloj = setTimeout(() => {
      // @s16: si el visitante tenía el foco en el botón cuando el reloj lo desmonta, no cae al
      // <body> — se recoloca en la escena (las refs son estables: no son deps del efecto).
      recolocarElFocoSiCaeAlVacio(escenaRef.current, botonRef.current)
      setFase('reloj')
    }, milisegundosDeCeremonia())

    return () => {
      clearTimeout(reloj)
    }
  }, [controlVivo])

  return (
    <>
      {/* El eyebrow: SOLO su estructura (<p>, nunca un heading). El CONTENIDO de categorías (Uñas ·
          Pestañas · Cejas) es F-09: site.ts no las tiene y «Facial» no existe aquí (C-7). */}
      <p className={estilos.eyebrow} />
      {/* `data-firma` publica la fase («corriendo» → «cliente»/«reloj»): la hoja completa la firma
          con `[data-firma=…] { animation: none }` (la base YA es el estado final) y los tests la
          observan bajo css:false. Distinguir cliente/reloj hace observable la limpieza del timeout.
          La clase de «lista» (@s15) entra y sale CON el botón: mientras está, la caligrafía corre;
          al caer, la hoja vuelve a la base — que es el final — sin declarar animación alguna. */}
      <div
        ref={escenaRef}
        className={controlVivo ? `${estilos.escena} ${CLASE_LISTA}` : estilos.escena}
        data-firma={fase}
        // @s16: destino del foco cuando el botón se desmonta bajo él. -1 = foco programático SIN
        // parada de tabulador nueva: el siguiente Tab continúa hacia los CTAs de la home.
        tabIndex={-1}
      >
        {/* El rótulo VISIBLE. Decorativo (`aria-hidden`): quien lo anuncia es el <h1> de abajo, así
            que un lector de pantalla NO oye «Nails Lash» dos veces. */}
        <svg className={estilos.rotulo} viewBox={VISTA_MARCA} aria-hidden="true" focusable="false">
          <defs>
            {/* `maskUnits`/`maskContentUnits` en userSpaceOnUse (el valor por defecto del
                contenido): así el trazo va en unidades del viewBox y NO se deforma con la relación
                de aspecto de la caja — que es justo lo que hacía inservible enmascarar el texto
                HTML (un trazo de 0,45 em de alto salía de 1,07 em de ancho y volvía a parecer un
                barrido). El <mask> honra el `stroke`, a diferencia de <clipPath>, que por
                especificación usa solo la geometría del relleno. */}
            <mask
              id={ID_MASCARA}
              maskUnits="userSpaceOnUse"
              x={VB_X}
              y={VB_Y}
              width={VB_ANCHO}
              height={VB_ALTO}
            >
              <path
                id={ID_TRAZO}
                className={estilos.trazo}
                d={TRAZO_MARCA}
                pathLength="100"
                fill="none"
                stroke="#fff"
                strokeWidth={GROSOR_TRAZO}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          </defs>
          {/* Great Vibes a 1000 unidades = 1 em, con la línea base en y = 0: el mismo sistema de
              coordenadas en el que está calculada la línea central. */}
          <text className={estilos.letras} mask={`url(#${ID_MASCARA})`} x="0" y="0" fontSize="1000">
            {marca}
          </text>
          {/* El <g> es quien recorre el path; el <image> de dentro se inclina 18° alrededor del
              (0,0) local —la punta— para que se sostenga como lo sostendría una mano. */}
          <g className={estilos.aplicador}>
            <image
              href={aplicadorUrl}
              transform="rotate(18)"
              x={-APLICADOR_PUNTA_X}
              y={-APLICADOR_ALTO}
              width={APLICADOR_ANCHO}
              height={APLICADOR_ALTO}
            />
          </g>
        </svg>
        <h1 className={estilos.titulo}>
          {/* PRESENTE en el DOM y en el HTML horneado, pero fuera de la vista: el rótulo visible es
              el <svg> de arriba. Se usa la técnica `clip`/1px que recomienda la WAI, NO
              `visibility: hidden` (borraría el nombre accesible) ni `color: transparent` (dejaría
              el texto en el árbol de accesibilidad pero fuera del cómputo de LCP). */}
          <span className={estilos.heroMarca}>{marca}</span>
          {/* Text node de espacio REAL, NO whitespace de salto de línea (que JSX borra): sin él, el
              nombre accesible sería «Nails LashStudio» (16, sin espacio) — MEDIDO en los dos motores. */}{' '}
          <span className={estilos.heroStudio}>{tipo}</span>
        </h1>
        {/* El control sin cromo (@s10): un <button> NATIVO transparente superpuesto al rótulo,
            HERMANO del <h1> (la estructura protegida de F-07 no se toca). Solo existe mientras la
            caligrafía corre; la decisión es pura (hero-logica.ts). */}
        {controlVivo && (
          <button
            ref={botonRef}
            type="button"
            className={estilos.control}
            aria-label={NOMBRE_DEL_CONTROL}
            onClick={completarPorElCliente}
          />
        )}
      </div>
    </>
  )
}
