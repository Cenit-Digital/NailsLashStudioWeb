# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **Feature en curso:** _(ninguna todavía — Fase 0: investigación y spec)_
- **Fase:** spec (conversación previa a `project-spec.md`)
- **Estado:** repo en plantilla virgen. Investigación en curso. Sin código aún.

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

## Investigación lanzada (3 workflows en paralelo)

| Workflow | Qué produce | Salida |
| --- | --- | --- |
| `nls-fase0-investigacion` | Auditoría del prototipo (lógica testeable, contraste WCAG, a11y, responsive/perf) + legal ES/UE (LSSI, RGPD, cookies, reseñas falsas, EAA, Google Fonts, precios) + técnica (schema.org, WCAG movimiento, Stryker, WhatsApp, SEO). Cada afirmación verificada de forma adversarial contra su fuente. | `scratchpad/research/fase0-informe.md` |
| `nls-estudio-webempresa` | Manual de conformidad con el repo base: stack exacto, cómo meter la paleta rosa en los tokens, arquitectura/SSG/SEO, testing y mutación, formato del arnés y **troceado propuesto en features**, traspaso `.dc.html` → código, aprendizajes heredados. | `scratchpad/research/base-webempresa-manual.md` |
| `nls-datos-reales` | Ficha real del negocio, catálogo real, equipo real, vía legal/técnica para las reseñas, y la lista cerrada de lo que debe aportar el cliente. | `scratchpad/research/datos-reales-y-resenas.md` |

## Siguiente paso

Con los 3 informes: cerrar `project-spec.md` con el humano (`spec_partner`),
rellenar `harness.config.json` con los comandos del stack, ejecutar `init.sh`,
y trocear `feature_list.json`. Luego Gherkin y **puerta de aprobación humana**.
