# Aprendizajes heredables del stack (WebEmpresa → NailsLashStudioWeb)

> **Área:** Stack base WebEmpresa.
> **Fecha del informe:** 2026-07-15.
> **Repos estudiados:**
> `C:/Users/vhurt/.../WebEmpresa` (HEAD en el momento del estudio: `e050917`) y
> `C:/Users/vhurt/.../SistemaDeMemoriaUncleBob` (HEAD: `9412921`).
> **Convención de este informe:** cada afirmación lleva `archivo:línea`, commit o
> URL oficial. Lo que no he podido verificar está en la tabla §3, marcado
> **NO VERIFICADO**. Distingo explícitamente **[HECHO]** (verificado en fuente),
> **[INFERENCIA]** (razonamiento mío sobre hechos) y **[DESCONOCIDO]**.

---

## 1. Respuesta ejecutiva

**Qué hacemos:** heredamos de WebEmpresa el **stack** (Vite 7 + React 19 + TS +
SCSS Modules + tokens CSS + Radix + `vite-react-ssg` + Vitest + Stryker + pnpm) y,
sobre todo, **el proceso y los patrones ya pagados en sangre**, no el código.
WebEmpresa es literalmente el "repositorio base del stack estándar de empresa"
(`WebEmpresa/docs/architecture.md:1-5`, `WebEmpresa/package.json:5`), y cerró 15
features con las tres puertas (TDD → judge → mutación 100%) verdes
(`WebEmpresa/feature_list.json:11-198`, `WebEmpresa/progress/history.md:1-249`).

**Por qué:** el valor heredable no es "otra web bonita". Es un conjunto de
**lecciones concretas con cicatriz**, que si no las importamos las volveremos a
pagar:

1. **Los tests verdes NO prueban que la web funcione.** La regresión más grave del
   proyecto (nav de escritorio desbordando el hero en móvil) pasó **todos** los
   tests y **dos** auditorías previas, y solo se cazó abriendo Chrome sobre el
   build de producción (`WebEmpresa/progress/history.md:113-153`). Exige
   verificación en vivo del **estado prerender**, antes de hidratar.
2. **El patrón R1 (estado base = estado final visible)** es la regla que hace
   compatibles SSG + animación + `prefers-reduced-motion` de una sola vez
   (`WebEmpresa/progress/history.md:170-175`, `:210-217`).
3. **Un formulario de contacto sin honeypot server-side y rate limit es un relé
   de correo abierto** que quema dinero (`WebEmpresa/progress/security_review.md:15-33`).
   Ya está resuelto y el código es copiable (`WebEmpresa/api/contact.ts:36-80`),
   **con una trampa operativa documentada** (§2.5.4).
4. **Hay deuda heredada que NO debemos copiar:** 3 bloqueantes de contraste WCAG AA
   siguen abiertos en el tema oscuro de los tokens. Lo he **recomputado yo mismo** y
   confirmo los números de la auditoría (§2.6). Si copiamos `_tokens.scss`,
   copiamos el incumplimiento.
5. **La memoria organizacional está VACÍA** (0 patrones): `patterns/` solo tiene
   el `README.md` (`SistemaDeMemoriaUncleBob/patterns/README.md`, `find` sin más
   ficheros). El paso 2bis del arranque no va a aportar nada todavía — y este
   proyecto es la primera oportunidad de **sembrarla**.

**Diferencia clave a tener en cuenta:** NailsLashStudioWeb usa el arnés **agnóstico
nuevo** (`bin/harness` + `harness.config.json`, hoy **sin rellenar**:
`"language": "generic"`, comandos vacíos, `mutation.threshold: 0.8`), mientras que
WebEmpresa usaba `init.sh` + scripts de `package.json` acoplados al stack
(`WebEmpresa/package.json:13-28`; en WebEmpresa **no existen** `harness.config.json`
ni `bin/`, verificado con `ls`). Nuestra primera tarea de infra es traducir el stack
de WebEmpresa a `harness.config.json` — y **subir el umbral de mutación de 0.8 a
1.0**, que es el estándar real que WebEmpresa sostuvo
(`WebEmpresa/stryker.config.json:31-35`, `"break": 100`).

---

## 2. Desarrollo con evidencia

### 2.1 El stack heredado (qué es exactamente)

**[HECHO]** Tabla declarada en `WebEmpresa/docs/architecture.md:9-21` y confirmada
contra las dependencias reales de `WebEmpresa/package.json:29-64`:

| Capa | Herramienta | Versión real (`package.json`) |
|---|---|---|
| Framework | React + TypeScript | `react ^19.2.0` (:34), `typescript ^5.9.0` (:59) |
| Bundler / dev | Vite | `vite ^7.3.0` (:61) |
| SSG / rutas | vite-react-ssg + react-router-dom | `vite-react-ssg 0.9.0` (:62, **pineada sin `^`**), `react-router-dom ^6.30.0` (:37) |
| Estilos | SCSS Modules + tokens CSS | `sass ^1.80.0` (:58) |
| Primitivas UI | Radix UI | `radix-ui ^1.6.0` (:33) |
| Fuentes | @fontsource | Outfit + DM Sans (:30-31) |
| Tests | Vitest + Testing Library + jsdom | `vitest ^4.0.0` (:63), `jsdom ^25.0.0` (:56) |
| Mutación | StrykerJS (vitest-runner) | `@stryker-mutator/core ^9.6.0` (:42) |
| Lint / formato | ESLint 9 flat + Prettier | `eslint ^9.39.0` (:51) |
| Gestor | pnpm | `packageManager: pnpm@11.9.0` (:8) |
| Email | Resend | `resend ^6.17.1` (:38) |
| Antiabuso | @vercel/firewall | `@vercel/firewall ^1.2.1` (:32) |

**[HECHO]** Node: `.nvmrc` = `22`; `engines.node: ">=22.12.0"`, `engines.pnpm: ">=10"`
(`WebEmpresa/package.json:9-12`).

**[INFERENCIA]** `vite-react-ssg` está **pineada exacta** (`0.9.0`, sin `^`) cuando
todo lo demás usa rango. Es la única dependencia así. Lo leo como una decisión
deliberada de estabilidad sobre la pieza más frágil (el prerender). **No he
encontrado el ADR que lo justifique** → §3.

**[HECHO] Regla de dependencias** (`WebEmpresa/docs/architecture.md:36-39`):
`pages` → usa `components` y `lib`; `components` → usa `lib`; **`lib` no importa de
`components` ni de `pages`**. Motivo declarado: *"La lógica con valor de negocio vive
en `lib/` para poder testearla y mutarla sin renderizar."* Esto no es estética: es
lo que hace que la mutación al 100% sea alcanzable — la lista `mutate` de Stryker
está dominada por `src/lib/` (`WebEmpresa/stryker.config.json:12-30`).

### 2.2 Qué features se hicieron

**[HECHO]** 15 features, **todas `done`** (`WebEmpresa/feature_list.json:11-198`):

| # | Nombre | Qué es | Herencia para un salón |
|---|---|---|---|
| 1 | `infra_base` | Scaffolding del stack (:16) | Directa |
| 2 | `nav` | Nav escritorio + menú móvil Radix Dialog (:30) | Directa |
| 3 | `theme_selector` | 3 estados claro/oscuro/sistema, anti-FOUC (:42) | **Cuestionable** (§4) |
| 4 | `footer` | Copyright año dinámico, aviso legal (:54) | Directa |
| 5 | `layout_accesibilidad` | Skip-link + `<title>` por ruta (:66) | Directa |
| 6 | `hero` | Propuesta de valor + 2 CTA + 4 stats (:78) | Adaptable |
| 7 | `servicios` | 6 tarjetas de servicio (:90) | **Muy directa** (un salón tiene servicios) |
| 8 | `sectores` | 4 tarjetas de sector (:102) | No aplica |
| 9 | `paquetes` | 3 paquetes **sin precios** (:114) | Adaptable (§2.4.5) |
| 10 | `contacto_seccion` | Estructura del formulario (:126) | Directa |
| 11 | `contact_form` | Envío real con Resend + honeypot (:138) | **Muy directa** |
| 12 | `marca` | Logo "Órbita" + tokens de tema (:150) | Patrón sí, arte no |
| 13 | `fidelidad_referencia` | Reconciliar deriva vs diseño (:162) | Patrón de proceso |
| 14 | `logo_draw_animation` | Animación CSS de "dibujado" (:176) | Patrón R1 |
| 15 | `servicios_scroll_reveal` | Revelado en scroll con IntersectionObserver (:188) | **Directa** (hook reutilizable) |

**[HECHO]** Volumen final: **194 tests**, build SSG de 2 páginas, mutación 100%
(`WebEmpresa/progress/history.md:236-237`). Recuento propio: 24 ficheros de test
sobre 26 ficheros fuente no-test (`find src`).

### 2.3 Decisiones tomadas y por qué

**[HECHO] D1 — El pipeline SDD y su orden** (`WebEmpresa/docs/workflow.md:9-40`).
El razonamiento textual, que es el activo real:
- *"La puerta humana va sobre el contrato, no sobre el código. Aprobar el `.feature`
  es barato; aprobar tarde (con código hecho) es caro."* (`:32-33`)
- *"El review es el juego entero. Generar borradores es barato; el juicio que poda es
  el valor escaso. El `judge` no edita: poda."* (`:36-37`)
- *"Una suite verde solo dice que el código no explota. La mutación introduce defectos
  y exige que algún test falle... es la medida real de si la red atrapa peces."* (`:38-40`)

**[HECHO] D2 — Umbral de mutación = 100%, no 80%.** `WebEmpresa/stryker.config.json:31-35`:
`{"high": 100, "low": 90, "break": 100}`, comentado como *"Umbral: 100% sobre las
líneas tocadas por la feature"* (`:3`). **[HECHO]** Y se sostuvo de verdad: 100%
(356/356) en el design system (`history.md:50-51`), 100% (98/98) en #13 (`:75-76`),
100% (15/15) en #14 (`:180-181`), 100% (63 killed + 4 timeout / 67) en #15 (`:225-226`).

**[HECHO] D3 — Mutación acotada a los ficheros tocados, no al repo entero.** En #13
se acotó a los 4 ficheros tocados (`history.md:75-77`); en #14 a `Logo.tsx`+`Hero.tsx`
(`:180`); en #15 a `useReveal.ts`+`Servicios.tsx` (`:225`).
**[HECHO] Corolario honesto:** cuando un cambio es solo SCSS, la mutación es **N/A**
y se dice — no se finge: *"Mutación: **N/A** — ningún fichero de la lista `mutate` de
Stryker fue tocado"* (`:107-109`, y otra vez `:246-247`).
**[INFERENCIA]** Esto es una admisión implícita de que **Stryker no protege el CSS**.
Toda la fidelidad visual y el responsive quedan fuera de la red de mutación. De ahí
que el proyecto acabara inventando el idioma "leer el `.scss` y aseverar la regla"
(§2.5.2).

**[HECHO] D4 — Solo 3 agentes de apoyo, y se rechazaron 9.**
`WebEmpresa/docs/tooling.md:80-89`: no se adoptaron `architect`/`backend-dev`/`devops`/
`qa`/`code-reviewer`/`tech-writer` porque *"duplican o contradicen el arnés y el stack"*:
`code-reviewer ≈ judge`, `qa + dev ≈ tdd_craftsman`, y `backend-dev`/`devops-engineer`
*"asumen `src/server`, `prisma`, `Dockerfile`, CI… que este sitio estático (SSG) no
tiene"*. Los 9 agentes existentes están en `WebEmpresa/.claude/agents/` (verificado
con `ls`: los 6 del pipeline + `security_reviewer`, `a11y_seo_auditor`, `mentor`).

**[HECHO] D5 — Agent Teams se descartó con verificación adversarial contra la doc
oficial** (`WebEmpresa/docs/tooling.md:97-116`): `TeamCreate`/`TeamDelete` *"ya no
existen"*, sigue experimental y desactivado por defecto, y *"el multi-panel no funciona
en Windows"* (esta máquina es Windows 11). Fuente oficial citada allí:
`https://code.claude.com/docs/en/agent-teams`.
**[INFERENCIA]** El aprendizaje transferible no es "no uses Agent Teams", es: **la
plantilla de moda se contrasta contra la doc oficial y contra la máquina real antes de
adoptarla.** Ese hábito es exactamente el que este informe debe continuar.

**[HECHO] D6 — Ponytail vendorizado, no como plugin** (`docs/tooling.md:30-35`):
*"`/plugin marketplace add` es un comando interactivo del host que un agente no puede
ejecutar; en el repo queda versionado, portable y activo."*

### 2.4 Problemas que aparecieron y cómo se resolvieron

> Esta sección es, en mi opinión, el 80% del valor heredable. Son fallos que ya
> costaron tiempo una vez.

#### 2.4.1 ⚠️ La regresión que los tests no podían ver (la lección más cara)

**[HECHO]** `WebEmpresa/progress/history.md:113-153`, commit `0186643` /`7afda5d`.
Síntoma reportado por Pablo: en móvil (~390px) los enlaces de nav aparecían *"siempre
visibles"* superpuestos al hero.

**Causa raíz 1 [HECHO]** (`history.md:120-127`): la conmutación móvil/escritorio la
decide **solo JS** (`useIsMobile` → `useSyncExternalStore`, con
`getServerSnapshot() = false`). En SSG, el prerender **hornea la nav de ESCRITORIO**
en el HTML estático. En móvil, **antes de hidratar**, esa nav se muestra y **desborda
324px** (medido: 607px de contenido en 283px) sobre el hero.

**Por qué no lo cazó nadie [HECHO]** (`history.md:127-131`) — cito porque es el núcleo:
> *"Los tests no lo cazaban (mockean `matchMedia` → solo prueban el estado
> post-hidratación); la sesión responsive previa tampoco, porque midió por CDP el
> estado **ya hidratado**."*

**Causa raíz 2 [HECHO]** (`:131-135`): con el drawer abierto, `.overlay`/`.panel`
tenían `z-index:auto` vs cabecera sticky `z-index:50` → la cabecera pintaba sobre el
panel, ocultando el ✕. Se halló **al ir a verificar la causa 1**.

**Fix [HECHO]** (`:136-141`): solo CSS, aditivo — `@media (max-width:767px){ .nav{
display:none } }` con **breakpoint idéntico a `MOBILE_QUERY`**, y `z-index:100` en
overlay/panel. Y los tests de regresión son **no tautológicos**: *"`@s4` lee el SCSS
y aserta la media query; `@s5..@s8` compara los z-index numéricos contra el 50 real
de la cabecera"* (`:141-143`).

**[HECHO]** También se descartó explícitamente un **falso positivo** ("Dialog abierto
por defecto") midiendo sin clic (`:133-135`).

**Aprendizaje heredable [INFERENCIA]:** en un stack SSG, **existen dos estados
distintos** (prerender y post-hidratación) y jsdom **solo** puede ver el segundo.
Cualquier decisión de layout tomada en JS (`matchMedia`, `useIsMobile`) es invisible
en el HTML servido. → **Toda conmutación responsive debe decidirse por CSS**, y la
verificación debe incluir el HTML servido crudo.

#### 2.4.2 El `<main>` que duplicaba el gutter

**[HECHO]** `history.md:91-96` (commit `988795e`): *"la home iba envuelta en `<main>`
con `max-width`+`padding`, lo que **duplicaba el gutter** (hero estrecho, títulos
partidos en móvil) y **recortaba las bandas de color** en escritorio"*. Fix: `main` a
sangre completa, `.prose` autónomo para páginas de texto, y tokens `--gutter`/
`--section-y` fluidos con `clamp` (`:94-96`).

#### 2.4.3 El mutante superviviente por tautología en el fake

**[HECHO]** `history.md:28-33`: primera corrida 97.37% con 1 superviviente
(`useIsMobile.ts:4`, literal `MOBILE_QUERY`) *"por tautología en el fake de
`matchMedia`"*. El fake usaba la propia constante, así que mutarla no rompía nada.
Fix: anclar el fake **al literal** `'(max-width: 767px)'` → mutación 100% (38/38).

**[INFERENCIA]** Regla general: **un doble de test nunca debe importar la constante
que valida**; debe repetir el literal. Si no, el test es un espejo, no una red.

#### 2.4.4 El `judge` corrigiendo el contrato, no solo el código

**[HECHO]** `history.md:60-63`: en #13 *"El lead corrigió `@s7` del contrato (la
referencia usa `space-between` con 2 grupos; la corrección del hueco central es
estructural —2 hijos, no 3—, no de CSS)"*. **[HECHO]** Y en #2 la puerta humana
**cambió** el contrato: Pablo detectó que faltaba "Sectores" en el panel móvil, *"era
un olvido del diseño de referencia"* (`:14-17`).
**[INFERENCIA]** La puerta humana **funcionó**: cazó un defecto del diseño de
referencia antes de escribir código. Es el argumento empírico para no saltársela.

#### 2.4.5 Discrepancia Jira vs diseño: se señala, no se resuelve sola

**[HECHO]** Feature #9 `paquetes` (`feature_list.json:114-119`): *"Sin precios fijos:
el diseño final no los muestra (discrepancia con el texto de WEB-5 en Jira, señalada,
**no resuelta por mi cuenta**)"*, y se dejó en `acceptance`: *"Pendiente de decisión de
producto: si se muestran precios fijos, hay que ampliar este feature antes de darlo por
done"*.
**[INFERENCIA]** Patrón de conducta a heredar tal cual: ante un conflicto entre
fuentes de verdad, el agente **no elige**; lo hace explícito y lo eleva. Para un salón
con **precios reales**, esto es directamente aplicable (§4).

#### 2.4.6 Fallos de infraestructura del propio agente

**[HECHO]** Dos veces se cayó el `tdd_craftsman` a mitad: *"una corrida se cortó por
watchdog del stream y se completó con una continuación determinista"* (`history.md:166-167`)
y *"El `tdd_craftsman` cayó por un error transitorio de API tras dejar el test @s10
escrito; el lead completó el cambio de SCSS"* (`:246-248`).
**[INFERENCIA]** Esto valida la **regla anti-teléfono-descompuesto** del `CLAUDE.md`
(resultados en disco, no en el chat): los artefactos en `progress/` permitieron
retomar sin perder el trabajo.

### 2.5 Patrones que conviene reutilizar

#### 2.5.1 ⭐ Patrón R1 — "el estado base es el estado final visible"

**[HECHO]** Nació en #14 (`history.md:170-173`): *"**R1**: estado BASE = DIBUJADO (el
oculto vive solo en el 0% de cada keyframe) → reduced-motion y prerender SSG muestran
el logo completo."* **[HECHO]** Y se reutilizó explícitamente en #15
(`feature_list.json:189`: *"SSG-safe (estado base = estado final visible, patrón R1 de
la feature #14)"*), donde el oculto vive **solo** bajo
`[data-reveal] .row:not([data-in-view])` dentro de
`@media (prefers-reduced-motion: no-preference)` (`history.md:210-215`).

**Por qué es potente [INFERENCIA]:** resuelve **tres** problemas con una sola decisión:
(a) SSG sin salto de layout, (b) `prefers-reduced-motion` gratis (no hay que "apagar"
nada: el oculto nunca existió), (c) sin JS el contenido se ve. Es el patrón #1 a
llevarse.

**[HECHO]** Está formalizado como contrato ejecutable en
`WebEmpresa/features/servicios_scroll_reveal.feature:67-79` (@s7 y @s8).

#### 2.5.2 El idioma "leer el `.scss` y aseverar la regla"

**[HECHO]** `WebEmpresa/features/servicios_scroll_reveal.feature:8-19` documenta el
porqué con una honestidad poco común:
> *"la interpolación de la animación NO es verificable en jsdom (no hay
> IntersectionObserver real, ni layout, ni transition). El contrato testeable se parte
> en DOS: (a) @s1..@s6 — la LÓGICA del hook... (b) @s7..@s13 — el CONTENIDO del SCSS
> module: se lee `Servicios.module.scss` y se asevera la regla... **Ningún escenario
> afirma la interpolación en el tiempo, solo la DEFINICIÓN de la regla en el fichero.**"*

**[INFERENCIA]** Es la respuesta pragmática al hueco de §2.3-D3 (Stryker no ve CSS).
Es un patrón útil **y** con un límite que hay que decir en voz alta: aserta que la
regla **está escrita**, no que **se ve bien**. Por eso no sustituye la verificación en
navegador; la complementa.

#### 2.5.3 Hook `useReveal` — genérico, SSR-safe, copiable tal cual

**[HECHO]** `WebEmpresa/src/lib/useReveal.ts:1-35`. Cualidades verificadas en el código:
- Guard SSR: `if (typeof IntersectionObserver === 'undefined') return` (`:20`).
- Limpieza: `return () => observer.disconnect()` (`:32`).
- Arma `data-reveal` en `useEffect`, **no en el render** — el comentario dice por qué:
  *"(imperativo, en `useEffect`, no en el render: sin mismatch de hidratación)"* (`:8-9`).
- **Genérico por `data-*`**: *"no conoce clases de estilo (cada sección decide su
  animación en su SCSS module)"* (`:10-11`).
- Banda central exportada como constante: `REVEAL_ROOT_MARGIN = '-40% 0px -40% 0px'` (`:4`).

**[HECHO]** Nota de mutación: lleva `// Stryker disable next-line all` sobre el guard
defensivo `if (!root)` (`:18-19`) — un guard inalcanzable en test es la excepción
legítima al 100%.

#### 2.5.4 ⭐ Formulario de contacto: la frontera de confianza, ya resuelta

**[HECHO] El fallo original** (`WebEmpresa/progress/security_review.md:15-33`): el
honeypot se comprobaba **solo en cliente**, así que `/api/contact` era *"un relé de
email abierto"*: un `curl` en bucle *"**consume cuota/dinero de Resend** sin límite"* y
*"puede usar tu dominio verificado para reenviar contenido arbitrario"*.

**[HECHO] El fix ya está en el código** (`WebEmpresa/api/contact.ts`), y es copiable:
- Honeypot **server-side** con **éxito silencioso**: `if (typeof body.empresa === 'string'
  && body.empresa.trim() !== '') return Response.json({ ok: true })` (`:55-58`).
  (Devolver 200 y no enviar: el bot no aprende que fue detectado.)
- Rate limit por IP: `checkRateLimit('contact-form', { request })` → 429 (`:42-46`).
- Revalidación de formato en servidor: `EMAIL_RE` (`:32`, `:69-71`).
- Topes de longitud: `MAX = { nombre: 120, email: 320, telefono: 40, sector: 60,
  mensaje: 5000 }` (`:30`, `:72-80`).
- Saneado CRLF **como defensa en profundidad**: `stripCrlf` (`:34`) con el motivo
  escrito: *"quita CR/LF por si algún día se migra a SMTP crudo"* (`:33`).
- Errores genéricos al cliente: `'No se pudo enviar'` (`:108`) — no filtra el objeto
  `error` de Resend.
- Method allow-list (`:38-40`), body malformado → 400 (`:48-53`).

**[HECHO] ⚠️ TRAMPA OPERATIVA — la más importante de este informe.**
`WebEmpresa/api/contact.ts:10-13` dice literalmente:
> *"El rate limit requiere una regla **"contact-form" en el Firewall de Vercel
> (dashboard)**; si no existe, **`checkRateLimit` es un no-op seguro**."*

**[INFERENCIA]** Traducción: **el código puede estar perfecto y el rate limit no
existir**, en silencio, porque depende de configuración manual en un panel web fuera
del repo. Es un fallo abierto por defecto ("no-op seguro" protege el despliegue, no la
factura). Para una web real que se publica, **hay que verificar la regla en el
dashboard de Vercel y probarlo contra el endpoint desplegado**; ningún test del repo lo
puede cubrir. → §3.

**[HECHO] Análisis de seguridad ya cerrado que NO hay que reabrir**
(`security_review.md:57-78`):
- **Inyección de cabeceras: no explotable** — *"el SDK de Resend usa su **API HTTP
  (JSON)**, no SMTP crudo... viaja como valor JSON y se codifica (RFC 2047)"*. Además
  `to`/`from` salen de env, no del usuario.
- **CSRF: no hace falta** — *"el endpoint no usa cookies ni sesión, así que no hay
  estado autenticado que un CSRF pueda abusar"*. Se dejó anotado explícitamente *"para
  que no se re-abra como hallazgo"*.

**[HECHO] Secretos** (`security_review.md:83-87`): `RESEND_API_KEY` solo se lee en
`api/contact.ts` vía `process.env`, **sin prefijo `VITE_`**, nunca entra al bundle. La
regla está escrita en `WebEmpresa/.env.example:6-8`: *"Vite solo expone al cliente las
variables con prefijo `VITE_`. El resto son de build/servidor y NUNCA deben llegar al
bundle del navegador."*

#### 2.5.5 Anti-FOUC: script inline + réplica pura testeable

**[HECHO]** El script bloqueante en `WebEmpresa/index.html:10-28` aplica `data-theme`
**antes del primer pintado**, con `try/catch` y fallback a `'light'` (`:24-26`).
**[HECHO]** El patrón fino: `WebEmpresa/src/lib/theme.ts:78-88` mantiene una **réplica
pura** de esa lógica, documentada como tal: *"Réplica pura de la lógica del script
anti-FOUC del `index.html` (@s8)"*, y el `index.html` lo declara en el otro sentido:
*"Espeja `src/lib/theme.ts:initialThemeAttribute`"* (`index.html:12-13`).

**[INFERENCIA]** Es una **duplicación deliberada y bidireccionalmente documentada**:
el script inline no puede importar módulos (sería tarde), así que se duplica y se testea
la réplica. El riesgo (que diverjan) se mitiga con los comentarios cruzados. Es
aceptable, pero es deuda: **no hay test que compare el script real con la réplica** → §3.

**[HECHO]** `theme.ts` es un buen ejemplo de la regla `lib/` = lógica pura: `resolveTheme`
(`:34-39`) y `nextMode` (`:74-76`) son puras y testeables sin DOM; el `localStorage`
está envuelto en `try/catch` con degradación a memoria (`:50-61`).

#### 2.5.6 SEO para SSG: lo que ya está resuelto

**[HECHO]** Verificado en el repo actual: `public/robots.txt` (con `Sitemap:`),
`public/sitemap.xml` (2 URLs con `changefreq`/`priority`), `<link rel="canonical">` por
ruta (`src/pages/home.tsx:31`, `src/pages/aviso-legal.tsx:11`), OG por ruta
(`home.tsx:32-37`), `twitter:card` (`home.tsx:38`), JSON-LD (`home.tsx:39`), y
`theme-color` por esquema (`index.html:7-8`).

**[HECHO] ⭐ El comentario más relevante para NUESTRO proyecto**, en
`WebEmpresa/src/pages/home.tsx:12-14`:
> *"JSON-LD **Organization** (**no LocalBusiness: no inventamos dirección ni
> teléfono**). Se escapa `<` para que un cierre de `</script>` en los datos no pueda
> romper el documento (serialización segura, aunque hoy los datos sean estáticos)."*

Implementado con `.replace(/</g, '\\u003c')` (`home.tsx:21`).

**[INFERENCIA]** Dos aprendizajes de golpe: (1) la **serialización segura de JSON-LD**
es un patrón a copiar literalmente; (2) WebEmpresa **se abstuvo** de `LocalBusiness`
por no tener datos verificados. NailsLashStudio **sí es** un negocio local con
dirección real → ver §4.

#### 2.5.7 Convenciones (copiar tal cual)

**[HECHO]** `WebEmpresa/docs/conventions.md`: TS sin `any` salvo justificación (`:8`);
un componente por archivo, `PascalCase` (`:10-11`); lógica pura en `src/lib/` (`:13`);
`kebab-case` para rutas (`:14-15`); SCSS Modules + `@use` **nunca `@import`** (`:16-18`);
colores solo vía `var(--color-…)` (`:17`). Tests co-locados y **el nombre del test cita
el escenario Gherkin: `it('@s1 …')`** (`:24-26`). Ramas `tipo/CLAVE-descripcion` (`:31`);
Conventional Commits con clave de Jira al final (`:36-41`).

**[HECHO]** DoD (`WebEmpresa/docs/verification.md:24-29`) incluye cosas **fuera del
repo**: desplegado y preview de Vercel revisado, sin errores nuevos en Sentry, y doc en
Confluence enlazada al ticket.

### 2.6 ⚠️ Deuda heredada: lo que NO se arregló (no copiar a ciegas)

**[HECHO — verificado por mí, no solo por la auditoría]** La auditoría
`WebEmpresa/progress/audit_a11y_seo.md:16-48` declaró **3 bloqueantes** de contraste
(SC 1.4.3). He comprobado que **los valores de token siguen idénticos en HEAD**:

| ID | Token (HEAD) | Ratio auditoría | **Ratio recomputado por mí** | ¿Cumple 4.5:1? |
|---|---|---|---|---|
| B2 | `--color-accent: #7c5cbf` sobre `#12082a` (oscuro) — `_tokens.scss:93` | ≈3.8:1 (`:34`) | **3.78:1** | ❌ |
| B1 | `--color-tag-ink: #7c5cbf` sobre tag-bg compuesto (oscuro) — `_tokens.scss:111` | ≈2.6:1 (`:23`) | **2.64:1** | ❌ |
| B3 | `--color-text-faint` claro — `_tokens.scss:57` | ≈2.8:1 (`:42`) | **2.78:1** | ❌ |
| B3 | `--color-text-faint` oscuro — `_tokens.scss:108` | ≈3.5:1 (`:42`) | **3.51:1** | ❌ |
| — | `--color-accent: #1e7a4f` claro sobre `#f2f4ef` — `_tokens.scss:42` | ≈4.8:1 (`:35`) | **4.80:1** | ✅ (por poco) |

*Método de mi recomputación: fórmula de luminancia relativa y ratio de contraste de
WCAG 2.1, compositando los `rgba` sobre el fondo declarado. Mis cifras coinciden con la
auditoría en las 5 medidas → **la auditoría es fiable**.*

**[HECHO] Requisito normativo oficial** (fuente: W3C, *Success Criterion 1.4.3 Contrast
(Minimum)*, https://www.w3.org/TR/WCAG21/#contrast-minimum): nivel **AA**; texto normal
**"at least 4.5:1"**; texto grande **"at least 3:1"**; "texto grande" = **≥18pt o ≥14pt
en negrita**. Excepciones: texto incidental/decorativo y logotipos.

**[HECHO]** Los usos afectados **no** caen en la excepción: la auditoría precisa que
`.tag` es 11px/700 y `.exampleLabel` 9.5px/700 (`audit_a11y_seo.md:21-22`), y las
`.eyebrow` 12px/600 *"no es 'texto grande'"* (`:36`) — todos por debajo del umbral de
texto grande. Y distingue bien: el uso de `faint` en `ServiceMockup.module.scss:74` *"es
decoración `aria-hidden`: no cuenta"* (`:43`).

**[HECHO]** `_tokens.scss` no se ha modificado desde `988795e` (2026-07-07)
(`git log -- src/styles/_tokens.scss`), y un `grep -rn "contraste" progress/` solo
encuentra las dos auditorías y `judge_contact_form.md` — **ningún registro de
remediación ni de aceptación de riesgo**. `progress/current.md` está vacío y
`history.md` no menciona ninguna corrección de contraste.

**[INFERENCIA]** Conclusión: **B1/B2/B3 siguen abiertos**. Es un fallo de proceso
identificable: **una auditoría de agente de apoyo no tiene puerta que la obligue a
cerrarse** — no hay `feature` ni `status` que la represente, así que sus bloqueantes se
evaporaron. Las tres puertas (judge/mutación/tests) siguieron en verde **con la web
incumpliendo WCAG AA**.

**[HECHO]** La propia auditoría avisó del riesgo de fiarse de la documentación
(`audit_a11y_seo.md:45-48`): *"la checklist del design system (§8) afirma 'contraste AA
validado en RF-MARCA-001'. Los valores calculados aquí lo contradicen"*.
**[INFERENCIA]** Lección: **la doc de marca puede mentir; recalcula los ratios tú mismo.**
(Es exactamente lo que he hecho arriba.)

**[HECHO] Mejoras SEO/a11y de esa auditoría — estado actual (verificado por mí):**

| Ítem | Estado hoy | Evidencia |
|---|---|---|
| M1 `og:image` | ❌ **sigue faltando** | `grep -rn "og:image" src/ index.html` → 0 resultados |
| M2 Twitter Card | ✅ resuelto (parcial) | `home.tsx:38` (`summary`; sin `twitter:title`) |
| M3 canonical | ✅ resuelto | `home.tsx:31`, `aviso-legal.tsx:11` |
| M5 sitemap.xml | ✅ resuelto | `public/sitemap.xml` |
| M6 robots.txt | ✅ resuelto | `public/robots.txt` |
| M7 JSON-LD | ✅ resuelto (Organization) | `home.tsx:15-21,39` |
| M9 `theme-color` obsoleto | ✅ resuelto | `index.html:7-8` (`#F2F4EF`/`#12082A`) |
| M12 target size ≥24px (WCAG 2.2) | **[DESCONOCIDO]** | no re-verificado en este estudio → §3 |

**[HECHO]** Del `a11y_seo_auditor` de #13 hay además dos hallazgos con doctrina útil
(`audit_a11y_seo_fidelidad.md:26-33`): para un botón que **cicla 3 estados**, el nombre
accesible dinámico basta; **NO** añadir `aria-pressed` (*"sería incorrecto: es booleano
para toggles de 2 estados, no para un ciclo de 3"*) y `aria-live` es innecesario (YAGNI).

### 2.7 SistemaDeMemoriaUncleBob — qué hay (spoiler: nada aún)

**[HECHO] La carpeta `patterns/` está VACÍA de patrones.** `find patterns -type f`
devuelve **exactamente un fichero**: `patterns/README.md`. El repo tiene 3 commits
(`97dd7f8` *"feat: sistema de memoria organizacional del arnés SDD"*, `ec6e2b2`,
`9412921`). **No hay ni un solo patrón validado.**

**[HECHO]** Y eso es **correcto por diseño**, según sus propias reglas
(`SistemaDeMemoriaUncleBob/patterns/README.md:55-58`):
> *"**Esta carpeta puede estar vacía**, y eso es correcto mientras no haya nada probado
> de verdad. No se rellena con contenido de relleno para que 'se vea completa'."*

**[HECHO] Estructura que impone** (`patterns/README.md:1-16`): un `.md` por patrón en
`patterns/<categoria>/<slug>.md`, con **6 categorías cerradas**: `responsive/`,
`tokens/`, `animacion/`, `testing/`, `arquitectura/`, `tooling/`. La carpeta **debe**
coincidir con el campo `Categoría` y lo comprueba `scripts/validate-patterns.sh`.

**[HECHO] Plantilla obligatoria** (`patterns/README.md:19-44`) con **4 títulos
literales** que el validador busca tal cual: `## El problema`, `## El patrón`,
`## Por qué esta y no otra alternativa`, `## Cuándo NO aplica`. Más cabecera con
`**Origen:**`, `**Validado en:**`, `**Categoría:**`.

**[HECHO] Reglas destacables** (`patterns/README.md:48-66`):
- *"**`Origen` es obligatorio y verificable.** Un repo, un archivo, una fecha real. No
  generalizaciones especulativas."*
- *"**`Validado en` empieza con un solo repo y crece con el tiempo.** ...es la señal de
  confianza del patrón, más fiable que cualquier afirmación en el texto."*
- *"**Sin datos sensibles.** Nada de secretos, claves, datos personales ni **precios de
  cliente**; el nombre del repo en `Origen` es el máximo nivel de identificación admitido."*
- *"Un patrón sin límites documentados es sospechoso."* (`:41`)
- *"prioriza los patrones de la categoría relevante... pero **no los apliques a ciegas**
  — revisa 'Cuándo NO aplica' primero."* (`:64-66`)

**[HECHO]** El consumo es vía `scripts/sync-memoria.sh`, que clona
`https://github.com/Cenit-Digital/SistemaDeMemoriaUncleBob.git` (`NailsLashStudioWeb/scripts/sync-memoria.sh:13`)
a `.memoria-cache/patterns/`. **[HECHO]** El `CLAUDE.md` de este proyecto lo declara
**no bloqueante**: *"si falla (sin red o sin acceso al repo privado), sigue sin memoria
y déjalo anotado en `progress/current.md`"*.

**Resumen [INFERENCIA]:** el paso 2bis **no nos va a dar nada** en este arranque, y no
es un fallo: es un sistema recién creado esperando su primer depósito. **Somos nosotros
quienes deberíamos hacerlo.** Los candidatos con mayor mérito, ya con `Origen` real y
"Cuándo NO aplica" conocido, son: **R1** (`animacion/`), **conmutación responsive por
CSS y no por JS en SSG** (`responsive/`), **fake anclado al literal** (`testing/`) y
**honeypot server + rate limit** (`arquitectura/`). Nota: el patrón de `paquetes` sobre
precios debe redactarse **sin precios reales** (regla de datos sensibles).

### 2.8 Diferencia de arnés: WebEmpresa vs. este proyecto

**[HECHO]** WebEmpresa **no tiene** `harness.config.json` ni `bin/` (`ls` →
*"No such file or directory"*). Sus comandos están **hardcodeados** en
`WebEmpresa/package.json:13-28` y `verify` es `bash ./init.sh` (`:27`).

**[HECHO]** NailsLashStudioWeb sí trae el motor agnóstico: `bin/`, `harness.config.json`,
`harness.schema.json`, `init.ps1`, `docs/configuration.md`, `examples/node-notes-cli`,
`examples/python-notes-cli`. Su `harness.config.json` está **sin rellenar**:
`"project": "mi-proyecto"`, `"language": "generic"`, todos los `commands` vacíos
(`install`/`lint`/`test`/`mutate`/`build`), `"mutation": { "threshold": 0.8, "targets": [] }`.

**[HECHO]** El `CLAUDE.md` de este repo obliga a invocar por el motor: *"Se invocan
siempre a través del motor agnóstico (no los hardcodees)"*, con `bin\harness.ps1` en
Windows.

**[INFERENCIA]** Hay un **desajuste de umbral que hay que decidir explícitamente**:
`threshold: 0.8` (plantilla nueva) vs `break: 100` (lo que WebEmpresa realmente sostuvo
en 15 features). Recomiendo **1.0 sobre los ficheros tocados**, replicando la práctica
probada, no el default de la plantilla.

---

## 3. Lo que NO he podido verificar

| # | Afirmación / hueco | Por qué no está verificado | Qué haría falta |
|---|---|---|---|
| 1 | Norma interna `RF-STACK-001`, `RF-CODE-001`, `RF-MARCA-001`, `RF-SISTEMA-001`, `GU-HARNESS-001`, `DE-002` | Se citan en `architecture.md:22`, `conventions.md:3`, `stryker.config.json:3`, `verification.md:24` pero **viven en Confluence**, fuera del repo. No he accedido. | Abrir el espacio de Confluence (hay MCP de Atlassian disponible) y leerlas antes de heredar reglas de marca/DoD. |
| 2 | Los tickets Jira `WEB-2/4/5/6` | Referenciados en `feature_list.json` como criterio de aceptación; no accedidos. | Leer los criterios en Jira; determinan qué se considera `done`. |
| 3 | **La regla "contact-form" del Firewall de Vercel existe** | `api/contact.ts:10-13` avisa de que si no existe, `checkRateLimit` es **no-op**. Es config de dashboard, fuera del repo. | Entrar al dashboard de Vercel y verificar la regla; luego probar 429 contra el endpoint desplegado con POSTs en bucle. **Bloqueante para publicar.** |
| 4 | Que B1/B2/B3 de contraste sean "no arreglados" y no "riesgo aceptado" | Verifiqué que los tokens no cambiaron y que no hay registro de remediación, pero **la ausencia de registro no es una decisión documentada**. | Preguntar a Pablo si se aceptó el riesgo o se olvidó. |
| 5 | Versiones **instaladas** reales (vs. rangos `^` del `package.json`) | Leí `package.json`, no `pnpm-lock.yaml` ni `node_modules`. `^` admite drift. | `pnpm list --depth 0` en el repo, o leer `pnpm-lock.yaml`. |
| 6 | Que las versiones del stack sean las **actuales** en julio 2026 | No he consultado los changelogs oficiales de React/Vite/Vitest/Stryker. Prohibido usar memoria para versiones. | Consultar releases oficiales de cada proyecto antes de fijar versiones. |
| 7 | Por qué `vite-react-ssg` está pineada a `0.9.0` exacta | Es la única dep sin `^`; no hay ADR que lo explique. | Buscar en el historial del PR o preguntar. |
| 8 | El script anti-FOUC y su réplica `initialThemeAttribute` **no divergen** | Ambos se declaran espejo mutuo (`index.html:12-13`, `theme.ts:78-81`) pero **no vi ningún test que compare el literal del HTML con la función**. | Revisar los tests de `theme_selector`; si no existe, es un test a escribir. |
| 9 | Estado de M12 (target size ≥24px, WCAG 2.2 SC 2.5.8) | Reportado en `audit_a11y_seo.md:82-87`; no re-verificado en HEAD. | Medir las áreas de nav de escritorio y del ✕ del drawer. |
| 10 | Ratios de contraste **percibidos en pantalla** | Mis cálculos son sobre los valores declarados en `_tokens.scss`; no rendericé. Opacidades/superposiciones podrían alterar el resultado real. | Ejecutar axe/Lighthouse sobre `dist/` renderizado. |
| 11 | Datos del negocio real (NAP: nombre/dirección/teléfono/horarios de Las Rozas), precios y servicios | **No están en ningún repo estudiado.** No los invento. | Pedírselos a Pablo / al salón; **imprescindible** para JSON-LD `NailSalon` (§4). |
| 12 | Contenido de `docs/DESIGN_SYSTEM.md` y del handoff de diseño de NailsLash (`NailsLashStudioDiseño.zip`) | Fuera del alcance de esta pregunta (stack/proceso); no abiertos. | Otro investigador debería destilar el diseño. |
| 13 | Que `pnpm verify`/`init.sh` de WebEmpresa siga verde hoy | No ejecuté nada en WebEmpresa (solo lectura). | `pnpm install && pnpm verify` allí, si hiciera falta. |

---

## 4. Impacto en el proyecto

### 4.1 Qué EXIGE

1. **Rellenar `harness.config.json` con el stack** (hoy `"language": "generic"` y
   comandos vacíos) traduciendo los scripts de `WebEmpresa/package.json:13-28`.
   **Y subir `mutation.threshold` de `0.8` → `1.0`**, que es lo que WebEmpresa sostuvo
   de verdad en 15 features (`stryker.config.json:31-35`).
2. **Verificación en vivo del estado PRERENDER**, no solo del hidratado, en cada
   feature con layout. Es la lección de `history.md:113-153`: los tests **y** una sesión
   previa de medición por CDP fallaron los dos. Protocolo mínimo: `build` → servir →
   `fetch` del HTML crudo → comprobar qué nav viene horneada → medir overflow a
   320/360/390/414/768/1280.
3. **Toda conmutación responsive por CSS** (media query), no por JS. Si se usa
   `useIsMobile`, el CSS debe ocultar la rama que el prerender hornea, **con el
   breakpoint idéntico a la constante JS** (`history.md:136-140`).
4. **Aplicar R1 a toda animación**: estado base = final visible; el oculto solo bajo
   `@media (prefers-reduced-motion: no-preference)` (`feature_list.json:189`,
   `history.md:210-215`).
5. **`lib/` puro, sin JSX** y la regla de dependencias unidireccional
   (`architecture.md:36-39`) — sin eso, el 100% de mutación no es alcanzable.
6. **Los fakes de test anclados al literal**, nunca a la constante que validan
   (`history.md:28-33`).
7. **Contraste: recalcular los ratios, no confiar en la doc de marca.** La checklist de
   marca de WebEmpresa afirmaba "AA validado" y era **falso** en 3 tokens
   (`audit_a11y_seo.md:45-48`; mis cálculos: 3.78 / 2.64 / 2.78 / 3.51 vs el
   **4.5:1** que exige el SC 1.4.3 AA — https://www.w3.org/TR/WCAG21/#contrast-minimum).
   Un salón de belleza tenderá a paletas **pastel de bajo contraste**: este es el riesgo
   #1 de a11y del proyecto.
8. **Si hay formulario de contacto: honeypot server-side + rate limit desde el día 1**,
   copiando `api/contact.ts:36-80`. **Y verificar la regla del Firewall en el dashboard
   de Vercel** — si no existe, `checkRateLimit` es un **no-op silencioso**
   (`api/contact.ts:10-13`). Sin esa verificación, publicar = relé de correo abierto.
9. **Cerrar las auditorías con una puerta.** El fallo de proceso de WebEmpresa (§2.6):
   los 3 bloqueantes de a11y quedaron huérfanos porque ninguna feature los representaba.
   → Cualquier bloqueante de `a11y_seo_auditor`/`security_reviewer` debe convertirse en
   **feature con `status`** en `feature_list.json`, o en riesgo aceptado **por escrito**.

### 4.2 Qué PROHÍBE

1. **Copiar `_tokens.scss` de WebEmpresa tal cual** — arrastra B1/B2/B3 (§2.6).
   Además la paleta (Bosque&Limón / Noche&Oro) es la marca de **Cénit Digital**, no la
   del salón.
2. **Hex sueltos en componentes**: solo `var(--color-…)` (`conventions.md:16-17`).
   (Nota: WebEmpresa tiene una excepción confesada — hex/rgba sueltos en
   `HeaderNav.module.scss`/`MobileMenu.module.scss` por falta de token para
   blanco-sobre-primario y scrim, `history.md:35-38`. **No heredar esa excepción:**
   definir los tokens desde el principio.)
3. **`@import` de SCSS** — solo `@use` (`conventions.md:16`).
4. **Claves con prefijo `VITE_`** para nada secreto: se hornean en el bundle
   (`.env.example:6-8`).
5. **Inventar datos del negocio.** Precedente explícito y ejemplar
   (`home.tsx:12`): *"no LocalBusiness: **no inventamos dirección ni teléfono**"*.
6. **Resolver por mi cuenta un conflicto entre fuentes de verdad.** Precedente de
   `paquetes` (`feature_list.json:114-119`): se señala y se eleva a decisión de producto.
7. **Marcar `done` con una auditoría de a11y en rojo**, aunque las tres puertas estén
   verdes. Es literalmente lo que pasó en WebEmpresa.
8. **Fiarse de la mutación para CSS**: Stryker no ve SCSS; sale **N/A**
   (`history.md:107-109`). La fidelidad visual se verifica en navegador.

### 4.3 Qué FEATURES implica

**Heredables casi directas:** `infra_base`, `nav` (+ el fix CSS ya incorporado desde el
inicio), `footer`, `layout_accesibilidad`, `hero`, `servicios` (un salón tiene
servicios: manicura, pestañas…), `contacto_seccion`, `contact_form`,
`servicios_scroll_reveal` (el hook `useReveal.ts:1-35` es copiable tal cual).

**Nuevas, propias de un salón local [INFERENCIA]:**

- **⭐ `seo_local` con JSON-LD `NailSalon`.** WebEmpresa se quedó en `Organization`
  **por falta de datos**, y su propia auditoría marcó M7 como *"**Alto valor** para SEO
  local"* (`audit_a11y_seo.md:66-67`). Nosotros **sí** somos un negocio local con sede
  en Las Rozas → aquí sí procede.
  **[HECHO, fuente oficial]** El tipo existe y encaja: `https://schema.org/NailSalon`
  — *"A nail salon"*, jerarquía `Thing > Organization > LocalBusiness >
  HealthAndBeautyBusiness > NailSalon` (y `Thing > Place > LocalBusiness > …`), con
  propiedades `address`, `telephone`, `openingHoursSpecification`, `geo`, `priceRange`,
  `aggregateRating`.
  **Bloqueado por [DESCONOCIDO]:** los datos NAP reales del salón → §3 ítem 11. **No se
  escribe ni un campo sin dato verificado.**
  Copiar de `home.tsx:15-21` el patrón de **serialización segura** (`.replace(/</g,
  '\\u003c')`).
- **`og:image`** — M1 sigue sin resolver en WebEmpresa (verificado: `grep` → 0
  resultados). Para un salón, la tarjeta al compartir en WhatsApp/Instagram es
  **negocio puro**, no cosmética.
- **Horarios / reserva de cita.** WebEmpresa tenía "Sistema de citas" como *servicio que
  vende*, no como funcionalidad propia. Si el salón quiere reservas online, es una
  frontera de confianza **nueva** (datos personales → RGPD) sin precedente heredable.
  **[DESCONOCIDO]** si entra en alcance.
- **Precios.** Precedente de `paquetes` (§2.4.5): WebEmpresa los omitió y **elevó la
  discrepancia**. Un salón normalmente **sí** publica tarifas → decisión de producto
  explícita, con datos verificados. Ojo: la regla de la memoria organizacional prohíbe
  **precios de cliente** en los patrones (`patterns/README.md:57-59`) — afecta a lo que
  publicamos como patrón, no a la web.

**Features de proceso [INFERENCIA]:**
- **Sembrar `SistemaDeMemoriaUncleBob`** con los 4 patrones de §2.7 (hoy: 0 patrones).
  Requiere PR al repo privado + `bash scripts/validate-patterns.sh` en verde
  (`patterns/README.md:60-62`).

### 4.4 Los 5 aprendizajes en una línea cada uno

1. **Verde ≠ funciona.** El peor bug pasó todos los tests: verifica el **prerender** en
   un navegador real (`history.md:113-153`).
2. **R1**: estado base = estado final visible → SSG + reduced-motion + no-JS resueltos de
   una vez (`history.md:170-175`).
3. **Responsive por CSS, no por JS** — el prerender no ejecuta tu `matchMedia`
   (`history.md:120-127`).
4. **El honeypot solo vale en el servidor**, y el rate limit puede ser un **no-op
   silencioso** si falta la regla del dashboard (`security_review.md:15-33`,
   `api/contact.ts:10-13`).
5. **Una auditoría sin puerta se evapora**: 3 bloqueantes WCAG AA siguen abiertos con
   todo en verde (§2.6).
