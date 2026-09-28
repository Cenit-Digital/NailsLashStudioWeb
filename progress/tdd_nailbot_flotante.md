# Diario — F-24 `nailbot_flotante` (2026-09-27/28)

## Declaración honesta del proceso (léase primero)

- **VÍA RÁPIDA primero:** por petición explícita del humano («commit and push, que me voy en 20 mins»)
  el lead publicó el robot funcionando en `302ddb4` ANTES del contrato Gherkin y sin TDD (con typecheck,
  lint, suite completa, build de 5 puertas y prueba en Chrome).
- **Después**, contra `features/nailbot_flotante.feature` (15 escenarios), el lead (no un `tdd_craftsman`,
  ver el motivo en `progress/tdd_nailbot_chat_compartido.md`) transformó ese código y escribió los tests
  escenario a escenario. **El código precedió a los tests**: desviación de `docs/tdd.md`, declarada.
- **Lo que la compensa:** revisión independiente (judge F-24 + a11y + seguridad) y mutación. La revisión
  cazó el fallo más importante de toda la feature, que ningún test de jsdom podía ver (abajo).

## El hallazgo que justifica la revisión: la pausa NO congelaba en un navegador real

Las reglas animadas usaban el shorthand `animation:` con especificidad (0,3,0); el shorthand repone
`animation-play-state` a `running` y ganaba a la regla de pausa (0,2,0). Resultado: con
`aria-pressed="true"` el robot seguía moviéndose (SC 2.2.2, nivel A). jsdom no calcula la cascada, así
que la suite estaba en verde. **Cura:** longhands (`animation-name`, `-duration`, `-timing-function`,
`-iteration-count`), que no tocan el play-state; y un test de bytes que prohíbe el shorthand en la hoja
del arte (`nailbot-flotante-estilos.test.ts`, @s12). La verificación real es en Chrome (estilo calculado).

## Mapa @s → test (features/nailbot_flotante.feature)

| @s   | Test(s)                                                                                                                                                              |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @s1  | `nailbot-flotante.test.tsx` · «@s1 sin JavaScript no hay flotante» (home horneada + componente a solas)                                                              |
| @s2  | `nailbot-flotante.test.tsx` · «@s2 tras hidratar…» (compareDocumentPosition con anclas; ids únicos con el panel ABIERTO; sin headings fuera del diálogo)             |
| @s3  | `nailbot-flotante.test.tsx` · «@s3 el lanzador…»                                                                                                                     |
| @s4  | `nailbot-flotante.test.tsx` · «@s4 la pausa…» (2 filas + icono ❙❙/▶ + sin persistencia)                                                                              |
| @s5  | `nailbot-flotante.test.tsx` · «@s5 movimiento reducido…» (4 filas + foco fuera + sin matchMedia)                                                                     |
| @s6  | `nailbot-flotante-logica.test.ts` (bocadillo 5 filas, animación 7 filas + extremos, teclas 6 filas; `enfocar`/`focoDentro`)                                          |
| @s7  | `nailbot-flotante.test.tsx` · «@s7 el bocadillo aparece UNA vez…» (4 antecedentes)                                                                                   |
| @s8  | `nailbot-flotante.test.tsx` · «@s8 el bocadillo se cierra…» (Esc ajeno, otra tecla, ×, Esc con el foco en la ×, abrir el panel, temporizador cancelado al desmontar) |
| @s9  | `nailbot-flotante.test.tsx` · «@s9 pulsar el lanzador abre un <dialog> NATIVO…»                                                                                      |
| @s10 | `nailbot-flotante.test.tsx` · «@s10 cerrar deja el panel CERRADO…» (botón y close() ajeno)                                                                           |
| @s11 | `nailbot-flotante.test.tsx` · «@s11 con el panel abierto, ← y →…» (6 filas)                                                                                          |
| @s12 | `nailbot-flotante-estilos.test.ts` (13 keyframes dentro de no-preference, solo transform/opacity, longhands, duraciones, pausa que congela)                          |
| @s13 | `nailbot-flotante-estilos.test.ts` (fijo, z-index 40, áreas seguras, 32 px, cierres ≥ 24 px, sin verde, animación ≤ 5 s en no-preference)                            |
| @s14 | `nailbot-flotante-estilos.test.ts` (`--nailbot-lanzador` ≥ 44 px en escritorio y móvil; `scroll-padding-bottom`)                                                     |
| @s15 | `nailbot-flotante-estilos.test.ts` (sin red/storage/analítica/«whatsapp», sin open controlado ni ids literales, montaje en home, doble protegido del setup)          |

## Ronda de correcciones tras la revisión (2026-09-28)

judge F-24 (6 bloqueantes) y a11y (1 bloqueante) → atendidos:

- La pausa congela (arriba). Icono de la pausa con test. Sin escrituras muertas: el bocadillo es ahora
  DERIVADO de tres hechos con estado (tiempo cumplido, panel abierto alguna vez, descartado) a través de
  la decisión pura `mostrarBocadillo`. Este diario. Una sola feature en `in_progress`. `bin/harness init`
  completo en verde antes de cerrar.
- Mutantes supervivientes de la primera medición (10) → `siguienteAnimacion` con ramas explícitas (un
  evento desconocido no cambia nada), `enfocar`/`focoDentro` puros en vez de `?.focus()` equivalentes,
  el comentario `Stryker disable` de las deps `[]` en su propia línea (precedente Hero.tsx), y test de
  que el temporizador se cancela al desmontar.
- a11y menores atendidos: Esc con el foco en la × lo devuelve al robot; foco visible con halo blanco (se
  ve sobre el pie oscuro) y redondo (la regla global de :focus-visible lo volvía cuadrado);
  `pointer-events` para no capturar clics en los huecos; `forced-colors`.
- Doble de `close` fiel al nativo (no despacha «close» si ya estaba cerrado).

## Verificación en vivo del lead

Ver `progress/current.md` (sección de verificación en Chrome).

## Ronda delta y cierre (2026-09-28)

- **Cambio requerido del judge delta:** test de bytes del `pointer-events` del contenedor
  (`nailbot-flotante-estilos.test.ts:188-196`: `.flotante` declara `none` y su regla hija anidada `> *`
  devuelve `auto`). El judge de cierre demostró que MUERDE con 6 copias saboteadas de la hoja compiladas
  con sass (`progress/judge_nailbot_flotante_cierre.md`).
- **Deseables atendidos:** `animation-play-state` declarado UNA sola vez y en la regla `pausada`
  (`:132-137`); ancla de `@media (forced-colors: active)` con los bordes del lanzador y del diálogo
  (`:213-218`).
- **Cierre:** judge APPROVED; mutación de cierre 100 % sin timeouts (`NailbotFlotante.tsx` 97/97 + 2
  equivalentes justificados, `nailbot-flotante-logica.ts` 62/62). Verificación en vivo: ver
  `progress/verificacion_viva_nailbot.md`.
