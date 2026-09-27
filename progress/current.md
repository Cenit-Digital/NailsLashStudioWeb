# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

## 2026-09-27 — Nailbot (F-23/F-24) · VÍA RÁPIDA publicada, pipeline completo EN CURSO

Por petición explícita de Pablo («commit and push, que me voy en 20 mins»), se publicó una primera
versión funcional ANTES de cerrar el pipeline SDD. **No está `done`.**

- Hecho y verificado: `ChatNailbot.tsx` (chat de #reserva extraído SIN cambiar DOM ni textos → el
  contrato `reserva_chat.feature` sigue verde), `NailbotArte.tsx` (arte del prototipo, base = pose
  final), `NailbotFlotante.tsx` (lanzador solo-cliente, pausa SC 2.2.2, bocadillo 4 s con Esc/×,
  `<dialog>` modal nativo, ←/→ aislados), `scroll-padding-bottom` ligado a `--nailbot-lanzador`.
  typecheck 0 · lint 0 · suite 1328/1328 (1 crash 0xC0000409 de proceso en `contacto-horneado`
  durante la corrida completa, re-ejecutado aislado 17/17) · `pnpm build` exit 0 con las 5 puertas ·
  en navegador real: modal nativo, foco inicial en «Uñas», Esc cierra y devuelve el foco al robot.
- PENDIENTE (pipeline): Gherkin F-23/F-24 + enmienda reserva_chat → TDD (copy Nailbot honesto, nombre
  opcional, regla del sábado, aviso capa 1, log/foco HS-4) → judge → mutación 100 % (ficheros nuevos a
  `stryker.config.json`) → a11y/seguridad → verificación en vivo (F110, móvil 320 px, reduced-motion).
