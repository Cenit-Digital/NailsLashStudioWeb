# Revisión de seguridad — Equipo + Botón WhatsApp (AppSec)

Alcance revisado (SOLO lo nuevo, sin tocar el hero):
`src/components/Equipo.tsx`, `src/components/BotonWhatsApp.tsx`,
`src/lib/demo/equipo-demo.ts`, `src/pages/home.tsx`,
`src/components/MenuNavegacion.tsx`. Verificada además la fuente de los href:
`src/lib/site.ts` (`waHref`) y `src/lib/demo/contacto-demo.ts`.

## Veredicto: SECURE (0 crítico / 0 alto)

## 🔴 Crítico
Ninguno.

## 🟡 Alto
Ninguno.

## 🟠 Medio
Ninguno.

## 🔵 Bajo / informativo (defensa en profundidad, NO accionable ahora)

- `src/pages/home.tsx:77` — El JSON-LD se emite con
  `<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>`.
  `JSON.stringify` NO escapa la secuencia `</script>`. Hoy NO hay vector: todo
  el objeto deriva de constantes estáticas verificadas (`NOMBRE`, `DIRECCION`,
  `TELEFONO`, `GEO`, `HORARIO`), sin entrada de usuario ni caracteres `<`.
  Corrección preventiva si algún día alimenta datos dinámicos: escapar `<`
  como `<` antes de hornear.
- `.env.example` no existe. Irrelevante para esta feature (front demo sin
  secretos), pero conviene crearlo si en el futuro entra alguna variable.

## Evidencia por ítem del checklist

- **Secretos:** `.gitignore` ignora `.env` y `.env.*` con excepción
  `!.env.example`; ningún `.env` versionado (`git ls-files`). Los componentes
  en alcance no leen ni exponen claves. El teléfono `625 22 33 66`
  (`site.ts:27`) es el NAP público del negocio, no un secreto. OK.
- **Entrada de usuario / XSS:** ningún `dangerouslySetInnerHTML` en el alcance
  (grep limpio). `Equipo.tsx` solo pinta texto de constantes demo vía JSX
  (auto-escapado por React). El estado de reserva (día/hora/reseña) vive en
  React state y JAMÁS se interpola en HTML crudo ni en URLs. OK.
- **Construcción de URL (BotonWhatsApp):** `BotonWhatsApp.tsx:23` usa
  `waHref(TELEFONO.legible, BOTON_WHATSAPP_FLOTANTE_TEXTO)`. En `site.ts:104-108`
  `waHref` aplica `encodeURIComponent(texto)` sobre el mensaje y valida el
  teléfono con `/^\d{9}$/` (falla cerrada). Ambos argumentos son constantes,
  no entrada de usuario → sin inyección de parámetros/cabeceras. OK.
- **window.opener / target:** `BotonWhatsApp.tsx:20-25` es un `<a>` SIN
  `target="_blank"` (confirmado; el único `target="_blank"` del fichero está en
  un comentario que explica que NO se usa). Sin pestaña nueva no hay fuga de
  `window.opener` y `rel="noopener"` no es necesario. Los `<a>` de
  `MenuNavegacion.tsx` y `home.tsx` son todos anclas internas `#...`
  (mismo documento): sin destino externo, sin `target`, sin fuga. OK.
- **Auth/Authz:** no aplica (demo estático sin backend, sesiones ni rutas
  privilegiadas). OK.
- **Errores/logs:** sin `console`/stack traces al usuario en el alcance. OK.
- **Red / peticiones a terceros:** cero `fetch`/`XMLHttpRequest`/`axios`/
  `window.open` en el alcance (grep limpio). El `useEffect` de `Equipo.tsx:233`
  solo calcula fechas locales (`diasOfrecidos(new Date())`); no hace red. OK.
- **Datos personales / RGPD:** los nombres y reseñas de `equipo-demo.ts` son
  perfiles de MUESTRA ficticios, con `LEYENDA_EQUIPO` visible
  (`Equipo.tsx:256`) advirtiendo que son de ejemplo. El flujo de reserva NO
  recoge nombre, email ni teléfono del usuario, y NO pide datos de salud
  (art. 9 RGPD): solo selección de día/hora que nunca sale del navegador. OK.

## Nota de proceso
No se editó ningún archivo de código ni test. No se abrió ni tocó nada de la
zona prohibida del hero.
