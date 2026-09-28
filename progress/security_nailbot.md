<!-- Guardado por el craftsman_lead desde el registro del workflow wf_7b369228-ea2 (el revisor no tenía herramienta de escritura). Texto íntegro del informe del agente. -->

# Revisión de seguridad: Nailbot (F-23 chat compartido + F-24 robot flotante)

Revisor: security_reviewer (solo lectura). Fecha: 2026-09-28.
Alcance: `git diff HEAD` más los ficheros sin seguimiento del working tree, y los commits ya publicados 6a59347, 302ddb4 y b7af7b0.
No se ha ejecutado vitest, pnpm test/build ni Stryker (hay una mutación en curso).

Resultado: SECURE. Crítico 0, alto 0, medio 0, bajo 2 (no bloqueantes).

## 1. Frontera de confianza: texto de la persona -> enlace wa.me

- **Recorrido del texto:** el `<input>` (ChatNailbot.tsx:118-129) pasa a `responder` y de ahí a `conNombre` (chat-nailbot-logica.ts:169-178, con `trim` y vacío = sin cambio). Después va a `mensajeReserva` (reserva-logica.ts:33-41, interpolación sin HTML) y a `waHref` (site.ts:104-108). El resultado solo se usa en `href` (ChatNailbot.tsx:156).
- **Inyección en el href:** no es posible.
  - El esquema y el host son una constante (`https://wa.me/`, site.ts:73). El número sale de la constante `TELEFONO`, validada con `^\d{9}$` (site.ts:58), y site.ts no se ha tocado.
  - El texto va por `encodeURIComponent`, que codifica `& # ? = / :` (comprobado: `a&text=b#c?d` -> `a%26text%3Db%23c%3Fd`). No se pueden inyectar parámetros (`&phone=`), ni fragmentos, ni `javascript:`.
- **XSS:** no hay `dangerouslySetInnerHTML`, `innerHTML`, `eval` ni `new Function` en el código nuevo. El nombre se pinta como nodo de texto de React (ChatNailbot.tsx:96), que lo escapa. Lo vigilan chat-nailbot.test.tsx:592-596 (@s12) y reserva_chat @s20 («Mª Ángeles & Co.» sin `&amp;` visible).
- **target/rel:** el enlace final no lleva `target` (ChatNailbot.tsx:154-160), así que no hay tabnabbing y `rel` no hace falta. El contrato @s6 lo exige y chat-nailbot.test.tsx:295 lo comprueba. En el diff no hay ningún otro enlace nuevo.
- **Longitud:** no hay `maxlength`, y es a propósito: el contrato lo fija (nailbot_chat_compartido.feature:201, 206-207; caso límite 6; @s11 con 300 caracteres). El texto solo sale del navegador cuando la propia persona pulsa. Un nombre enorme como mucho da un enlace que WhatsApp no abre, sin impacto sobre terceros. No es un riesgo de seguridad.
- **Envío automático:** el chat no envía nada solo. No hay `window.open` ni `location` (@s12, chat-nailbot.test.tsx:557-570), y el aviso de capa 1 describe el enlace (@s7).

### BAJO-1: URIError con un surrogate suelto que tumba el render (ya existía)

- **Dónde:** chat-nailbot-logica.ts:171 (`valor.trim()` conserva `\uD83D` suelto) -> ChatNailbot.tsx:156 -> site.ts:107 (`encodeURIComponent` lanza `URIError: URI malformed`, comprobado en Node).
- **Qué pasa:** la excepción ocurre dentro del render del paso 'hecho'. En `src/` no hay ningún error boundary, así que React 19 desmonta la raíz entera y la home se queda en blanco. Afecta a los dos puntos de montaje: Reserva.tsx:49 y NailbotFlotante.tsx:198.
- **Quién puede provocarlo:** solo la propia persona, pegando texto UTF-16 mal formado o partiendo un emoji. No hay vector de terceros: el estado del chat no lee URL, hash, storage ni red.
- **Origen:** la ruta ya existía en Reserva.tsx (92d6b70: `borrador.trim()` -> `waHref` en el render). F-23 no lo introduce, pero ahora se llega también desde el panel flotante.
- **Arreglo en una línea:** en `conNombre`, `valor.replace(/[\uD800-\uDFFF]/gu, '�').trim()` (con la bandera `u` solo casa surrogates sueltos; `toWellFormed` es ES2024 y el tsconfig usa lib ES2023). Necesita una fila de contrato, así que lo decide el lead. No bloquea.

### BAJO-2: prueba de extremo a extremo con un nombre de forma maliciosa (opcional)

- **Dónde:** chat-nailbot.test.tsx:274-298. El round-trip `decodeURIComponent(href)` con nombres inofensivos también pasaría con `encodeURI`.
- **Por qué no es un hueco hoy:** lo cubren de forma indirecta waHref @s6 (datos_negocio_fuente_unica, filas `&` y `#`) y el ancla `waHref(` de @s12.
- **Si se quiere blindar en el chat:** una fila con `Ana&text=x#y?z` que compruebe que el href crudo tiene un solo `?` y nada sin codificar después de `?text=`.

## 2. Secretos: ninguno

- **Working tree** (sin node_modules/.git): buscados `sk-`, `sk-ant-`, `sk-proj-`, `api_key`, `ANTHROPIC`, `OPENAI`, `x-api-key`, `Bearer`, `ghp_`, `AKIA`, `AIza` y `PRIVATE KEY`, con patrón de valor largo (24 caracteres o más). Resultado: 0 valores. Las coincidencias son prosa: docs/research/asistente-robot/03-claude-api.md, 06-diseno-servidor-futuro.md:17-21 y :54, y project-spec.md:219, siempre con prefijo y elipsis (`sk-proj-…`, `sk-ant-api03-...`).
- **Historial:** `git log -p -8` da 0 valores largos. `git log --all -S sk-proj-` y `-S sk-ant-` solo encuentran 6a59347, y todas sus apariciones son prefijos con `…` o `...`. Sigue pendiente, fuera del repo, que el titular revoque la clave `sk-proj-…` que se pegó en una sesión (lo recoge project-spec.md:219).
- **dist/:** 0 coincidencias. dist/ está en .gitignore:6 y no tiene seguimiento.
- **.env:** hay `.env` y `.env.*` en .gitignore:36-38 (`!.env.example`) y ningún `.env` con seguimiento. No se ha leído ningún `.env`.
- **.claude/launch.json** (sin seguimiento): solo `pnpm exec vite --port 5199 --strictPort`, sin secretos. Vite escucha por defecto en localhost. Si se sube a un PR, `.claude/` activa la etiqueta `permissions-change` de guard-sensitive-paths.yml, que no bloquea. Un push directo a main no la activa.

## 3. Red, storage, analítica y terceros: ninguno en el código nuevo

- **Código de la app:** ChatNailbot.tsx, chat-nailbot-logica.ts, NailbotFlotante.tsx, nailbot-flotante-logica.ts, NailbotArte.tsx, nailbot-demo.ts y reserva-logica.ts. No hay fetch, XMLHttpRequest, sendBeacon, WebSocket, EventSource, local/sessionStorage, indexedDB, cookie, gtag, dataLayer, `import()` dinámico ni URLs `http(s)`.
- **SCSS nuevo:** no hay `url()`, `@import` externos ni `@font-face`.
- **SVG de NailbotArte:** no tiene `href`, `<image>`, `<use>` ni `foreignObject`, así que no carga subrecursos.
- **Guardas de bytes con anclas positivas:** chat-nailbot.test.tsx:527-570 (@s12) y nailbot-flotante-estilos.test.ts:272-301 (@s15, que además veta sendBeacon, gtag y dataLayer).
- **Dependencias:** package.json y pnpm-lock.yaml no cambian, ni en el working tree ni en los tres commits de Nailbot. No hay vulnerabilidades nuevas que auditar.

## 4. Revisado y descartado (sin riesgo real)

- **tools/mutate.mjs:36-40:** usa `spawnSync` con `shell:true` y cita con `JSON.stringify`, que no es un escape correcto para cmd.exe (`\"`, `%VAR%`). Pero `argv` solo lo pasa quien desarrolla, y la CI (harness-ci.yml:56-81) solo llama a `mutate` con rutas fijas de ejemplos. No hay entrada no confiable, y la versión anterior (array con `shell:true`) era igual o peor.
- **vitest.setup.ts:** el doble de `showModal`/`close` solo existe en tests y no llega al bundle.
- **Referer al pulsar wa.me:** con la política por defecto (`strict-origin-when-cross-origin`) solo sale el origen de GitHub Pages, sin datos personales.
- **Historial del navegador:** el nombre acaba en el historial al abrir wa.me. Es inherente a esa URL y lo explica el aviso de capa 1 (@s7).

SECURE -> progress/security_nailbot.md (contenido de este informe; el fichero no se ha escrito porque este run prohíbe ficheros de informe y el revisor no tiene herramienta de escritura: persístelo el lead si procede).

## Menores (lista devuelta)

- BAJO (ya existía; el tercero no puede explotarlo) - src/components/chat-nailbot-logica.ts:171 + src/components/ChatNailbot.tsx:156 + src/lib/site.ts:107: un nombre con un surrogate UTF-16 suelto (p. ej. un emoji partido al pegar o al borrar) sobrevive a `trim()`. Después `encodeURIComponent` lanza URIError DENTRO del render del paso 'hecho'. Como no hay ningún error boundary en src/, React 19 desmonta la raíz entera y la home se queda en blanco hasta recargar. Comprobado en Node: `encodeURIComponent('Lucía \uD83D')` -> URIError: URI malformed. Solo afecta a la propia persona: el chat no lee URL, storage ni red, así que no hay vector reflejado. La misma ruta ya existía en Reserva.tsx (92d6b70). Arreglo en una línea: en conNombre, `const nombre = valor.replace(/[\uD800-\uDFFF]/gu, '�').trim()` (con la bandera u la clase solo casa surrogates sueltos; `toWellFormed` es ES2024 y el tsconfig usa lib ES2023). Necesita una fila de contrato: lo decide el lead.
- BAJO (endurecimiento de tests, opcional) - src/components/chat-nailbot.test.tsx:274-298: la única prueba de extremo a extremo 'texto de la persona -> href' usa nombres inofensivos (Lucía) y compara con un round-trip de decodeURIComponent. Ese round-trip no distingue encodeURIComponent de encodeURI. Hoy lo cubren los tests propios de waHref (datos_negocio_fuente_unica @s6, filas & -> %26 y # -> %23), y @s12 exige 'waHref(' en ChatNailbot.tsx. Si se quiere blindar la frontera en el propio chat: una fila con nombre `Ana&text=x#y?z` que compruebe que el href crudo tiene un solo '?' y ningún '&', '#' ni '=' sin codificar después de '?text='.
