# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **Feature en curso:** ninguna. `1 — puerta_placeholders` cerrada como `done`.
- **Siguiente:** F-02 `datos_negocio_fuente_unica` (`pending`), la fuente única
  de datos que alimenta la vía por FLAG de la puerta ya construida.
- **Bitácora del ciclo cerrado:** `progress/tdd_puerta_placeholders.md`
  (+ `progress/judge_puerta_placeholders.md`, `progress/mutation_puerta_placeholders.md`)

## Bitácora

### 2026-07-15 — Arranque, Fase 0

**Protocolo de arranque.** Leídos `AGENTS.md`, `feature_list.json`,
`progress/current.md`, `docs/workflow.md`. `./init.sh` **no ejecutado todavía**:
`harness.config.json` está sin rellenar (`language: "generic"`, comandos vacíos),
así que el arnés no puede verificar nada hasta que se decida el stack. Es lo
primero que hay que cerrar.

**Paso 2bis (memoria organizacional) — INCIDENCIA con causa localizada.**
`scripts/sync-memoria.ps1` falla en esta máquina: *"Sin red, sin permiso o repo
inaccesible"*. Causa raíz identificada (no es falta de permisos):

- El script clona por **HTTPS** (`https://github.com/Cenit-Digital/SistemaDeMemoriaUncleBob.git`)
  y delega las credenciales en `gh auth git-credential`.
- En esta máquina **`gh` no estaba instalado** (ahora sí: winget, v2.96.0, pero
  **sin autenticar**), y el helper `manager` no resuelve sin interacción — que el
  script deshabilita a propósito (`GIT_TERMINAL_PROMPT=0`) para fallar rápido.
- **Pero el acceso existe por SSH**: `origin` de este repo es
  `git@github.com:Cenit-Digital/NailsLashStudioWeb.git` y el clon por SSH del
  repo privado de memoria **funciona**:
  `git -c core.sshCommand="ssh -o BatchMode=yes" clone --depth 1 git@github.com:Cenit-Digital/SistemaDeMemoriaUncleBob.git`

  → **Bug real del arnés**: el script no intenta SSH aunque el remoto del propio
  proyecto sea SSH. Afecta igual a `TemplateSSDUncleBob` (mismo script). Candidato
  a ADR + feature de arnés, y a patrón para la memoria organizacional.

**Memoria consumida (vía SSH).** `SistemaDeMemoriaUncleBob` tiene **1 patrón**:
`patterns/animacion/estado-base-visible-ssg-reduced-motion.md` (origen:
WebEmpresa #14 `logo_draw_animation` y #15 `servicios_scroll_reveal`, 2026-07-09).
**Aplica directamente** al hero de este diseño (animación de pincel + hero
`IntersectionObserver` + SSG). Regla: *el estado base en CSS es siempre el estado
final visible; el estado oculto vive solo dentro del ámbito de la animación*.
Su "Cuándo NO aplica" leído: no exime de respetar `prefers-reduced-motion`.

## Mapa de la organización (investigado)

| Repo | Qué es | Acceso |
| ---- | ------ | ------ |
| `TemplateSSDUncleBob` | El arnés de proceso, agnóstico. **Este repo es una instancia suya** (solo difieren `README.md`, `docs/autonomous.md`, `.github/workflows/autonomous-evolve.yml`, y aquí hay `.agents/` y `skills-lock.json`). | público |
| `WebEmpresa` | **La referencia del stack estándar** de Cénit Digital: Vite 7 + React 19 + TS + SCSS + pnpm, SSG con `vite-react-ssg` 0.9.0, Vitest 4 + Testing Library + jsdom, Stryker 9.6, ESLint 9 + Prettier, Vercel + funciones en `/api` (Resend). Node ≥22.12, pnpm 11.9. | público |
| `DocsTemplateSSDUncleBob` | Sitio de documentación: Astro 7 + Starlight 0.41. | público |
| `SistemaDeMemoriaUncleBob` | Memoria organizacional (patrones destilados). | privado — **solo por SSH** |
| `NailsLashStudioWeb` | Este proyecto. | privado |

## Decisiones tomadas con el humano (Fase 0)

1. **Destino:** web **real** de un salón real, calidad de producción, se publica
   cuando el cliente lo diga. → exige datos reales, páginas legales y prohíbe
   contenido inventado presentado como real.
2. **Stack:** el mismo que `WebEmpresa` (repo base de la organización). Queda
   registrado aquí y debe acabar en un ADR + en la memoria organizacional para
   no volver a preguntarlo en el futuro.
3. **Reservas:** de momento **solicitud por WhatsApp** (sin backend). El
   calendario compone la solicitud y abre WhatsApp. A futuro, la parte de
   frontend reutilizable debe subir a la memoria/plantillas.
4. **Reseñas:** son **reales** y salen de Treatwell. Fotos del equipo: el humano
   acepta placeholder de momento (pendiente de resolver, ver riesgo abajo).

### Decisiones cerradas el 2026-07-15 (segunda ronda, puerta humana)

5. **Paleta: solo `Opcion-1-Rosa`.** Fondo `#FDF4F7`, acento `#C05576`. Se
   descartan Azul (1b) y Amarillo (1c) y **no** se construye capa de temas: un
   solo tema, sin interruptor. (Las 3 opciones eran el mismo diseño byte a byte
   salvo las variables CSS del `:root`, así que la capa de temas era barata; el
   humano prefiere no cargar con esa superficie.)
6. **No hay contacto con el cliente todavía.** → Se trabaja **solo** con lo
   verificable en fuentes públicas (Treatwell/Google). Todo lo que exija datos
   del titular queda **bloqueado**, *incluidas las páginas legales*
   (aviso legal necesita razón social + NIF/CIF + domicilio, LSSI art. 10).
   → **Corolario duro: la web no se puede publicar al final de este trabajo.**
   El objetivo alcanzable es "lista para publicar en cuanto entren los datos".
7. **Reseñas: solo nota agregada + enlace a Treatwell.** Mostrar «4,9 · 1.231
   opiniones» enlazando al perfil real como fuente. **No** se republica el texto
   de terceros, **no** se tocan datos personales y **no** se filtran solo las
   positivas. Se descartan: republicar textos (salvo que la investigación
   demuestre vía legal), testimonios propios (dependen del cliente) y quitar la
   sección. Pendiente: confirmar ToS de Treatwell (informe `legal-treatwell.md`).
8. **Equipo: se mantienen las fotos IA (`ph-woman*.png`) como placeholder de
   desarrollo**, marcadas como tales y **bloqueadas para producción**. El humano
   asume el aviso: presentarlas como el equipo real sería práctica engañosa, así
   que solo valen para ver el diseño en local.
9. **Puerta de build (consecuencia de 6 y 8).** El contenido no verificado vive
   en una capa explícita de *placeholders* y **el build de producción falla** si
   queda alguno. Es lo que hace **estructuralmente imposible** publicar datos
   inventados por accidente. Es una feature del proyecto, no un apaño.

## Hallazgo crítico: el prototipo inventó el contenido

El salón **existe** (Treatwell, 4,9 · 1.231 opiniones). Los datos del prototipo
(`salon-data.js`) **no son los del salón real**:

| | Prototipo | Real (Treatwell) |
| --- | --- | --- |
| Dirección | Calle de la Belleza 24, 28010 Madrid | **Av. de Atenas 75, 28232 Las Rozas de Madrid** |
| Sábado | 10:00–15:00 | **10:00–14:00** |
| Equipo | Lucía, Carla, Andrea, Nerea, Marta, Paula, Sara | **Lady Johana, Sandra, Katerine, Irene, Camila, Zaira, Erika** |
| Manicura semiperm. | 25 € | **27/29/31 €** (tallas S/M/L) |
| Categoría "Facial" | limpieza, peeling, hidratante | **no existe**: el salón hace *depilación facial* y pestañas |
| Reseñas | 10 inventadas | **1.231 reales** |

→ Toda la estructura de contenido del diseño (3 categorías, precios, equipo)
hay que rehacerla contra la realidad. **Es el mayor riesgo del proyecto** y hay
que resolverlo en `project-spec.md` antes de escribir Gherkin.

## Riesgos abiertos (a cerrar en spec)

- **Fotos del equipo inventadas.** El humano autorizó "fotos inventadas de
  mujeres". En una web real publicada, presentar personas generadas como
  "nuestro equipo de profesionales" es una práctica engañosa sobre las
  características del prestador. Válido **como placeholder de desarrollo**;
  **no** para publicar. Hay que dejarlo estructuralmente imposible de publicar
  por accidente y avisarlo en la puerta de aprobación.
- **Reseñas de Treatwell**: pendiente de confirmar si se pueden republicar
  (ToS + propiedad intelectual + RGPD del nombre) y si mostrar solo las
  positivas es desleal. Investigación en curso.
- **Datos que solo puede dar el cliente**: teléfono, email, razón social y CIF
  (aviso legal, LSSI art. 10), ofertas vigentes, fotos reales.

## 2026-07-16 — Fase 0 CERRADA. Investigación rehecha y durable.

**La lección de la sesión anterior.** Los 3 workflows de investigación escribían
en `scratchpad/`, la sesión murió por límite y **se perdieron los 3 informes
enteros** (~45 min). Se rehízo la investigación escribiendo **en el repo**
(`docs/research/`) y **commiteando según salía**. Regla nueva: *si no está
commiteado, no existe.*

**Investigación v2 (hecha).** 20 investigadores + verificación adversarial:
21 informes, 820 KB, en `docs/research/`. El sintetizador **murió por límite** y
se relanzó a mano → `docs/research/00-fase0-informe.md` (994 líneas). Coste real:
**4,16 M tokens** de subagentes; agotó el límite de sesión dos veces.

**El verificador adversarial refutó 22 afirmaciones.** Los informes `legal-*`,
`datos-*`, `audit-*` y `stack-*` son **material en bruto**: no se dan por buenos.
Manda `docs/research/01-hechos-verificados-lead.md` y luego el informe maestro.

### Lo que cambió el proyecto

1. **Es un REDISEÑO, no una web nueva.** El salón ya tiene
   <https://www.nailslashlasrozas.es/> (one-page, `lastmod 2022-12-01`). Nadie lo
   había dicho; lo destapó la verificación. Abre la pregunta del dominio y las 301.
2. **La web viva del cliente incumple la LSSI**: su aviso legal da **404** y la
   política de privacidad no identifica responsable. Es el fallo a NO repetir.
3. **El CIF no está en ninguna fuente pública** → la decisión 6 es un **hecho
   verificado**, no prudencia. La web **no se puede publicar**: el objetivo es
   *lista para publicar*.
4. **El prototipo se equivoca de CATEGORÍAS**: son **Uñas · Pestañas · Cejas**,
   no Uñas/Facial/Depilación. "Facial" **no existe** en este negocio.
5. **La paleta Rosa elegida NO cumple AA**: 32/68 combinaciones fallan, incluido
   el botón «Reservar» (4,37:1). Se corrige con `--accent-dark #A23E5F`, que ya
   está en la paleta. Trampas: `clamp()` (pasa en escritorio, falla en móvil) y
   `color-mix()` (el contraste de la cabecera cambia al hacer scroll).
6. **WebEmpresa arrastra 3 bloqueantes AA en HEAD con las 3 puertas verdes**,
   porque ninguna feature los representaba, y su checklist decía «AA validado»
   siendo falso. → *Una auditoría sin puerta no existe.* **No copiar
   `_tokens.scss` del base.**
7. **Treatwell (cl. 4.2.2) niega al salón republicar reseñas** → la decisión 7
   queda confirmada por la norma. Treatwell 4,9·1.231 y Google 4,9·226 **no son
   sumables ni intercambiables**.
8. **Tres premisas del encargo eran falsas**: `WebEmpresa/harness.config.json`
   no existe; el choque de pnpm no bloquea (10.21.0 auto-descarga la 11.9.0); el
   umbral es **1.0** (proporción), no 0.8 — `break: 100` de Stryker es porcentaje.

### Estado del arnés

- `feature_list.json`: **20 features** (16 pending, 4 blocked). Camino crítico de
  9. Las **cinco primeras no son maquetación**.
- `harness.config.json`: relleno y validado. `paths.tests: "src"` (los tests
  conviven con el código), `lint` fusiona typecheck, `threshold: 1.0`.
- **F-00 (arranque del stack): HECHO y verde** — install, typecheck, lint, test y
  build; prerender SSG comprobado de verdad (el `<h1>` viaja horneado en
  `dist/index.html`). Ver `progress/f00_arranque_stack.md`.
- ⚠️ **`bin/harness verify` está ROJO** hasta la primera feature con lógica:
  `mutate: []` → Stryker sale 1. Es la verdad del esqueleto, no un fallo de
  config. **No se finge verde.** Se cura con F-01.

### Dos bugs DE LA PLANTILLA encontrados (deben subir aguas arriba)

1. **`bin/harness.ps1` no corría en Windows PowerShell 5.1** (`Join-Path`
   multi-segmento es firma de PS7). La ruta que CLAUDE.md documenta para Windows
   **nunca funcionó** sin `pwsh`. **Arreglado aquí** con `Join-Path` anidado.
2. **`scripts/sync-memoria.*` clona por HTTPS y no intenta SSH** aunque el remoto
   del propio proyecto sea SSH. Se destrabó autenticando `gh`; el bug sigue.
   → Ahora la memoria sincroniza: **2 patrones**, y **los dos aplican**
   (`estado-base-visible-ssg-reduced-motion`, `red-css-para-rama-solo-js-en-ssg`).
   Raíz común: *bajo SSG el HTML horneado congela el estado que el JS iba a
   corregir.* Ya ha mordido 3 veces en WebEmpresa.

Y un bug **propio**, cazado por el agente de F-00: el bloque de config que le pasé
omitía el token `{{target}}` de `docs/configuration.md:54`, así que
`bin/harness mutate <fichero>` **descartaba el target en silencio**. Arreglado con
`tools/mutate.mjs`.

## Siguiente paso

`project-spec.md` **cerrado**. En curso: `gherkin_author` destilando
`features/puerta_placeholders.feature` (feature #1). Después: **puerta de
aprobación humana** sobre el `.feature` (CLAUDE.md la declara innegociable) y solo
entonces `tdd_craftsman`.

**Dos agujeros de F-01 que levantó el `spec_partner` y que van al Gherkin sin
darse por resueltos:** la puerta puede dar **verde por vacuidad** (si apunta a un
artefacto que no se generó, devuelve 0 violaciones y el build pasa "protegido"), y
el patrón `600123456` **no caza** `+34 600 123 456` con espacios — el placeholder
más peligroso escaparía por comparación literal.

**Pendiente del humano (no bloquea el código):** elegir dominio (¿migrar
`nailslashlasrozas.es` con 301?) y plataforma de reseñas (Treatwell 1.231 vs
Google 226).

## 2026-07-16 — F-01 CERRADA. Las dos puertas del arnés en verde.

**Se completaron los 3 escenarios que faltaban** (`@s20`, `@s21`, `@s26` — el
bloque «falla cerrada / A-8»), por TDD estricto. La feature estaba a 23/26, no
«a medias»: faltaban justo los que impiden el *verde por vacuidad*. Ahora 26/26.

- **`judge`: APROBADO**, 26/26 cubiertos (contados por título de `it()`, no por
  comentario), 0 bloqueantes. Un único hallazgo **menor** no bloqueante: falta un
  test de integración del adaptador real `node:fs` contra un `dist/` temporal
  (CHECKPOINTS C4 / `verification.md` Nivel 2), mitigado por el smoke de
  `pnpm build` en verde. → candidato para una feature de arnés, no de esta.
- **Mutación: 100% con 0 supervivientes REALES y 1 equivalente excluido — pero NO a la
  primera, y la historia es la lección más importante de este cierre.** El primer informe
  del `mutation_tester` dijo «100%, 0 survived» y era **falso por enmascaramiento**: corrió
  bajo carga (los agentes del workflow competían por CPU), 134 de 147 mutantes hicieron
  *timeout*, y Stryker cuenta el timeout como muerto. Su razonamiento —«un superviviente
  real termina, no cuelga»— era **justo el error**: un superviviente que además hace timeout
  se cuenta como muerto y desaparece. Correr la mutación **a baja concurrencia** (tranquila)
  destapó **tres** hallazgos que tapaba:
  1. `puerta.ts` — superviviente real: `motivoDelReventon` vaciado sobrevivía porque `@s22`
     solo exigía «…contenga "no pudo completar la inspección"», y «…: undefined» lo cumple.
     Cerrado: `@s22` ancla ahora la **causa concreta** (`toContain(MOTIVO_DEL_REVENTON)`).
  2. `placeholders.ts` — superviviente real: el `+` de `[ -]+` (regex del teléfono) no estaba
     fijado; `[ -]` dejaba escapar `+34  600  123  456` con doble espacio. Cerrado **con tu
     aprobación**: `@s5` gana la fila `| 600  123  456 |` (contrato modificado, puerta humana).
  3. `placeholders.ts` — mutante **equivalente** `toLowerCase→toUpperCase`: el plegado se
     aplica a ambas caras de la comparación y el `valor` sale del contenido original; solo un
     carácter asimétrico (`ß`) los distinguiría y ningún patrón lo tiene. Excluido quirúrgica
     y justificadamente (política `docs/mutation-testing.md` §78-80). Detalle completo y
     reproducción en `progress/mutation_puerta_placeholders.md`.
  → Estado final, reconfirmado a `--concurrency 2`: `placeholders.ts` 100% (87 killed, 0
    survived, 1 ignored); `puerta.ts` 100% (0 survived).
  → **Lección: un informe de mutación con muchos timeouts NO es de fiar. La puerta se corre
    en tranquilo o a baja concurrencia; si no, enmascara supervivientes reales.**
- **Suite: 47 tests verdes** (43 → 46 con `@s20/@s21/@s26`, → 47 con el caso nuevo de `@s5`).
  `typecheck` + `lint` limpios, 0 warnings.
- **Build end-to-end verde en Node 24**: `pnpm build` compila la SSG y el *humble object*
  real (`node:fs`, `--experimental-strip-types`) escanea el `dist/` real → «✓ …no tiene
  placeholders», exit 0. Cubre por ejecución el hallazgo menor del `judge`.

### Decisiones de diseño de este cierre (para no volver a discutirlas)

1. **`@s20` se resolvió en el PUERTO, no con un doble mentiroso.** `SistemaDeFicheros`
   gana `existeDirectorio()` y **documenta que `listarFicheros` LANZA** sobre un
   directorio inexistente (como `readdirSync`). La puerta pregunta antes de listar;
   el humilde lo honra con `existsSync`; el doble de test lanza ENOENT igual que el
   real. Sin esto, `@s20` habría pasado con producción tomando el camino de `@s22`.
2. **`@s21` NO tiene guarda propio: lo subsume el guarda de `index.html` de `@s26`.**
   Un `dist/` vacío no tiene `index.html`, luego el mismo `if` lo caza. Un guarda
   `length===0` separado resultó **mutante inmortal** (el contrato prohíbe fijarle
   mensaje: «no fija cuál de las dos razones se informa»). Un solo guarda mata `@s21`
   y `@s26` a la vez.
3. **El fixture de `@s18-coladero` recibió un `dist/index.html` limpio** (no se tocó
   su `toEqual` ni el `.feature`): un artefacto de producción real siempre trae su
   HTML de entrada, así que el doble es ahora **más fiel**, no más permisivo.
4. **`@s5` gana una fila de separadores dobles (`600  123  456`) — ÚNICO cambio del
   `.feature`, aprobado en puerta humana.** Fija el `+` de `[ -]+`: el teléfono no
   escapa ni con espaciado irregular. Fue la mutación quien reveló que ese `+` no
   estaba probado. Es la única modificación del contrato en todo el cierre.
5. **Un mutante equivalente (`toLowerCase↔toUpperCase`) se excluye, no se «mata».** No
   es pereza: es genuinamente equivalente (verificado a concurrencia 1 y 2) y el repo
   lo permite con justificación escrita (`docs/mutation-testing.md` §78-80). Matarlo
   exigiría inventar un patrón con `ß`, que ensuciaría el contrato.

### Deuda anotada para una feature futura (NO se abrió aquí, Ley 1)

Cuando entren las imágenes, `dist/` tendrá binarios (`.png` de `ph-woman`, `.woff2`).
Hoy la puerta lee **todo** bajo `dist/` con `readFileSync utf8`; un binario se
decodifica a `U+FFFD` (no lanza) y es **falso positivo en potencia**. No se
implementó filtro por extensión porque ningún escenario actual monta un binario y
exige saltárselo (sería producción sin test rojo y mutante inmortal). **Hace falta
un escenario nuevo en el `.feature` antes de cerrar ese hueco.**

### Ruido fuera del commit

`autoskills` sincronizó 10 skills durante la sesión (`skills-lock.json` +
`.agents/skills/*`). No es de F-01; queda **fuera** de este commit.
