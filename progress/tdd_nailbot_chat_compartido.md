# Diario — F-23 `nailbot_chat_compartido` (2026-09-27/28)

## Declaración honesta del proceso (léase primero)

- **Quién escribió el código:** el `craftsman_lead`, NO un `tdd_craftsman`. El primer `tdd_craftsman`
  lanzado en un workflow avanzó a ~1 escenario por hora (≈60 comandos en 90 min, @s1 de 14); el humano
  lo señaló («si en 2 horas no ha avanzado, no está funcionando») y el lead paró el workflow y siguió él,
  con todo el contexto de la sesión. Lo que el agente dejó en disco (tests de @s1, leyenda y avatar) se
  aprovechó.
- **Orden real:** por escenarios, pero **el código de producción de cada bloque se escribió antes que sus
  tests** (no hubo Rojo→Verde→Refactor de un test cada vez). Además existía la VÍA RÁPIDA publicada en
  `302ddb4` (el chat extraído de `Reserva.tsx` sin tocar su DOM). Esta es una desviación de `docs/tdd.md`
  que se declara aquí en vez de esconderla.
- **Qué compensa esa desviación** (las puertas que sí se pasaron, independientes del autor):
  1. Contrato Gherkin escrito ANTES del código por el `gherkin_author` (14 escenarios) y la enmienda de
     `reserva_chat.feature` (completada por el lead según su propio banner).
  2. **Revisión independiente** (`judge`, `a11y_seo_auditor`, `security_reviewer`) en paralelo:
     `progress/judge_nailbot_chat_compartido.md`, `progress/a11y_nailbot.md`, `progress/security_nailbot.md`.
     Sus hallazgos se corrigieron (sección «Ronda de correcciones»).
  3. **Mutación** sobre los ficheros de la feature (ver `progress/mutation_nailbot_chat_compartido.md`): la primera medición
     encontró 2 supervivientes reales (el `tipo` de la entrada «nombre» era la rama por defecto de
     `responder`); se corrigió y se volvió a medir.

## Mapa @s → test (features/nailbot_chat_compartido.feature)

| @s | Test(s) |
|---|---|
| @s1 | `chat-nailbot.test.tsx` · describe «@s1 horneado…» (7 tests sobre `renderToString(<Reserva/>)` y `<ChatNailbot/>`; la leyenda se comprueba sobre el DOM del horneado con `closest`) |
| @s2 | `chat-nailbot.test.tsx` · «@s2 la leyenda se ve SIEMPRE» (4 momentos) |
| @s3 | `chat-nailbot.test.tsx` · «@s3 el guion…» (5 filas, incluida «Lo antes posible → franja») |
| @s4 | `chat-nailbot.test.tsx` · «@s4 “Un sábado” NO pregunta la franja» (6 burbujas exactas) + canario en `chat-nailbot-logica.test.ts` (precondición `HORARIO.sabado` cierra a las 14:00) |
| @s5 | `chat-nailbot-logica.test.ts` · «@s5 la regla del sábado es PURA…» (4 rangos) + `fraseSabado` (guarda anclada) |
| @s6 | `chat-nailbot.test.tsx` · «@s6 al terminar…» (con nombre por el sábado; sin nombre) |
| @s7 | `chat-nailbot.test.tsx` · «@s7 el aviso de capa 1…» |
| @s8 | `chat-nailbot.test.tsx` · «@s8 tras cada acción…» (7 filas + «al montar no se mueve» + «nombre vacío no mueve el foco») |
| @s9 | `chat-nailbot.test.tsx` · «@s9 “Reservar otra cita”…» (+ el campo vuelve vacío) |
| @s10 | `chat-nailbot.test.tsx` · «@s10 dos instancias…» |
| @s11 | `chat-nailbot-logica.test.ts` · «@s11 responder es PURA…» (congelado, síncrono, determinista, nombre vacío, 300 caracteres, reinicio) |
| @s12 | `chat-nailbot.test.tsx` · «@s12 guardas de FUENTE» (incluye «form action», como remite reserva_chat @s22) |
| @s13 | `chat-nailbot-estilos.test.ts` (selectores, pares de la matriz escritos a mano, sin «en línea», sin animación) |
| @s14 | `nailbot-arte.test.tsx` (SVG estático, sin ids ni subrecursos, pose final, paleta) |

Enmienda de `reserva_chat.feature`: @s7, @s9, @s11, @s13, @s15, @s17, @s20, @s22, @s23 AJUSTADOS en
`reserva.test.tsx`; @s8 y @s12 RETIRADOS (tests borrados, comentario con el motivo); @s24 gana el test
de las clases globales `demo-btn demo-btn--wa` (hallazgo del judge).

## Decisiones del lead fuera del contrato (con su porqué)

- **`responder` tiene las cuatro ramas explícitas y un `return estado` final** para una entrada que no
  reconoce. Ningún escenario lo pide: sin ello, el último `tipo` era la rama por defecto y su literal en el
  componente era un mutante equivalente (2 supervivientes medidos). Su test NO lleva etiqueta @s.
- **`sinSurrogatesSueltos`**: un nombre con un surrogate UTF-16 suelto (emoji partido) hacía lanzar a
  `encodeURIComponent` y rompía el render del chat (hallazgo del `security_reviewer`). Se sanea a U+FFFD.
- **Se quitó la guarda `paso === 'dia'`** de la regla del sábado (inalcanzable desde la UI; hallazgo del judge).
- **Placeholder legible** (`--muted` sobre `--bg`, par vigilado) y sin `outline: none` en el campo (a11y).

## Ronda de correcciones tras la revisión (2026-09-28)

judge F-23 (4 bloqueantes) → todos atendidos: una sola feature `in_progress` (F-24 vuelta a `spec_ready`
hasta cerrar F-23), este diario, código no pedido quitado o justificado sin @s, test de la clase global
de @s24. Menores atendidos: leyenda sobre DOM, foco «no se mueve» con prueba que muerde, `form action`,
opacidad de las bases, href solo al terminar, `enviarNombre`, copy restante a `nailbot-demo.ts`,
comentarios corregidos, deuda A-23 añadida al acceptance de F-16, `.claude/launch.json` a `.gitignore`.
No atendido (declarado): prefijo oculto «Nailbot:/Tú:» por burbuja (SC 1.3.1, heredado del chat original;
cambiaría todos los literales del contrato).

## Lección medida: un test EN VACÍO que solo destapó la mutación (2026-09-28)

El test de `sinSurrogatesSueltos` se generó con un script y sus escapes `\uD83D` se guardaron como el
carácter U+FFFD crudo: comparaba U+FFFD con U+FFFD y estaba verde sin probar nada. Lo destaparon 4
mutantes `Regex` que el informe de concurrencia alta escondía como «timeout» (la regla del repo: «un
informe con timeouts miente»). Cura: escapes `\u` en el fichero y una CONTRAPRUEBA que exige que
`encodeURIComponent` lance `URIError` con la entrada sin sanear. Ver `progress/mutation_nailbot_chat_compartido.md` (#5).
