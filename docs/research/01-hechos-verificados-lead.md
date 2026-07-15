# Hechos verificados por el lead (2026-07-15)

> Verificación de primera mano del `craftsman_lead`, no delegada. Cada línea
> lleva la fuente con la que se comprobó. Lo que no está aquí, no está
> verificado por mí.
>
> Este archivo tiene **prioridad** sobre los informes `legal-*`, `datos-*`,
> `audit-*` y `stack-*` de esta carpeta cuando se contradigan: aquéllos son
> material en bruto y el verificador adversarial **refutó 22 de sus
> afirmaciones**.

## 1. El hallazgo que cambia el encuadre: NO es una web nueva, es un REDISEÑO

El salón **ya tiene web publicada**: <https://www.nailslashlasrozas.es/>

- Es una *one-page* antigua: el sitemap declara `lastmod 2022-12-01` y solo 2
  URLs (ambas la home).
- Su propio texto declara que el negocio *"lleva más de 15 años ofreciéndote
  los tratamientos de belleza más demandados"*.
- Nadie nos había dicho que existía. Lo destapó la verificación adversarial.

**Consecuencias que hay que meter en la spec:**

1. Hay **contenido propio del titular** ya publicado → es la fuente más
   fiable para servicios y horario (lo dice el propio negocio, no un tercero).
2. Habrá que decidir **migración**: mismo dominio o no, redirecciones 301,
   qué pasa con `nailslashlasrozas.es`. **Requiere al cliente.**
3. El nombre de dominio real es `nailslashlasrozas.es`, no
   `nailslashstudio.com` (que es lo que el prototipo inventó en el email
   `hola@nailslashstudio.com`).

## 2. La web actual del cliente INCUMPLE la LSSI (verificado)

| Comprobación | Resultado | Fuente |
| --- | --- | --- |
| Enlace "Aviso Legal" → `/es/aviso-legal` | **HTTP 404** | fetch 2026-07-15 |
| Razón social en la web | **NO APARECE** | fetch de la home |
| NIF/CIF en la web | **NO APARECE** | fetch de la home |
| Email de contacto | **NO APARECE** | fetch de la home |
| Responsable en la política de privacidad | **NO APARECE** — solo *"la persona a cargo del sitio web"* | fetch `/es/confidentiality_ws` |

→ La web viva enlaza un aviso legal que **no existe** y su política de
privacidad es una plantilla sin responsable identificado. Según
`legal-lssi.md` (pendiente de destilar), el tipo vigente es el **art. 38.3.b)
LSSI: infracción GRAVE** por incumplimiento significativo del art. 10.1 a) y f).

→ **Esto es un argumento de venta del rediseño y una trampa a no repetir.**
No es un dato que podamos copiar: es un defecto que hay que corregir.

## 3. El CIF NO está disponible públicamente → la decisión 6 se confirma

Se buscó la razón social y el NIF/CIF en la única fuente que legalmente debería
tenerlos (el aviso legal del propio titular) y **no existen**. Por tanto:

- **No se puede redactar el aviso legal** ni la política de privacidad reales.
- El bloqueo de la decisión 6 **no era una suposición prudente: es un hecho
  verificado.**
- Nota: si el titular es **autónomo** y no sociedad, el dato exigido por el
  art. 10.1 a) es su nombre y NIF — **dato personal de una persona física**.
  No se investiga ni se deduce: **lo aporta el cliente o no se publica.**

## 4. Ficha real del negocio (datos concordantes)

| Campo | Valor verificado | Fuente |
| --- | --- | --- |
| Nombre | NAILS LASH STUDIO | `<title>` de la web oficial: *"Centro de estética en Las Rozas \| NAILS LASH STUDIO"* |
| Dirección | **C.C. El Zoco, Av. de Atenas 75, Local 41, 28232 Las Rozas de Madrid** | web oficial; concuerda con Fresha y con el directorio del C.C. |
| Teléfono | **625 22 33 66** (`tel:+34625223366`) | web oficial (texto + `href`), directorio `zocomonterozas.com`, Fresha |
| Horario | **L–V 10:00–20:00 · Sábado 10:00–14:00** · domingo no listado | web oficial; concuerda con Treatwell |
| Facebook | <https://www.facebook.com/nailslashstudiorozas/> | enlace en la web oficial |
| Instagram | `@nailslash.studio_` | `<title>` del perfil |
| Email | **NO EXISTE PÚBLICAMENTE** | ausente en la web oficial |
| Coordenadas | 40.5179875, −3.9226688 | Fresha (no verificado por mí) |

**Ojo con el `Local 41`**: el prototipo y la nota anterior decían solo
"Av. de Atenas 75". La dirección completa lleva local y centro comercial.

## 5. El prototipo se equivoca de CATEGORÍAS, no solo de datos

Servicios que **el propio titular** declara en su web (literal):

> Uñas de gel · Manicura rusa · Manicura francesa · Rellenos y nail art ·
> Lifting de pestañas · Extensiones pelo a pelo · Tinte de pestañas ·
> Diseño de cejas · Tinte de cejas · Laminado de cejas

| | Prototipo (inventado) | Real (declarado por el titular) |
| --- | --- | --- |
| Categoría 1 | Uñas | **Uñas** ✓ |
| Categoría 2 | **Facial** (limpieza, peeling, hidratante) | **Pestañas** (lifting, pelo a pelo, tinte) |
| Categoría 3 | **Depilación** (piernas, ingles, axilas) | **Cejas** (diseño, tinte, laminado) |
| Precios en la web | 18 servicios con precio | **NO APARECE ninguno** |

→ La estructura de 3 categorías del diseño **se puede conservar**, pero su
contenido es **Uñas · Pestañas · Cejas**. La categoría "Facial" del prototipo
**no existe** en el negocio y hay que eliminarla; los assets `ph-facial.png` y
`ph-depil.png` quedan desalineados con la realidad.
→ Los **precios no los publica el titular en su web**. Treatwell sí publica
precios; usarlos exige decidir si son los vigentes (ver `datos-treatwell-ficha.md`
y la advertencia de que el verificador refutó parte de esa extracción).

## 6. Reseñas: la decisión 7 del humano queda CONFIRMADA por la norma

El verificador adversarial comprobó los términos reales de Treatwell:

- Los **Términos Comerciales Treatwell/Empresa Asociada** (Treatwell Spain S.L.,
  abril 2024), cláusula **4.2.2**, **niegan expresamente** al salón el derecho a
  reutilizar o republicar las reseñas fuera del sitio.
- La **Política de Contenido Generado por Usuarios** otorga la licencia **a
  Treatwell**, no al salón.
- Ningún documento de Treatwell da al salón un derecho autónomo de republicación.

→ **Republicar los textos de las reseñas de Treatwell no es una opción legal.**
La decisión 7 (nota agregada + enlace) no era solo la más prudente: es la única
viable de las que no dependen del cliente.

**Volumen de reseñas — NO son intercambiables:**

| Plataforma | Nota | Nº opiniones | Estado |
| --- | --- | --- | --- |
| Treatwell | 4,9 | **1.231** | verificado en la ficha |
| Google | 4,9 | **226** | leído con navegador real; el fetch plano cae en `consent.google.com` |

→ Coinciden en nota (4,9) pero **no** en volumen. Si se muestra «4,9 · 1.231
opiniones» hay que **decir de qué plataforma** y enlazarla, o el dato es
engañoso. Nunca sumarlas.

## 7. Calidad de la investigación delegada: leer con pinzas

El verificador adversarial **refutó 22 afirmaciones**. Patrones de fallo
detectados (útiles como aprendizaje del arnés):

1. **Mala atribución**: el dato era correcto pero la fuente citada no lo
   acreditaba (varios casos con URLs de Google Maps sin `place_id`/CID, que
   redirigen a `consent.google.com` y sirven un shell de JS sin datos).
2. **Truncamiento que invierte el sentido**: el considerando 43 de la Directiva
   (UE) 2019/882 citado a medias decía lo contrario de lo que dice entero.
3. **Universales negativas** ("no aparece en ninguno de los tres textos")
   contradichas por la propia fuente alegada.
4. **Fuente inventada/placeholder**: una claim citaba `https://example.com`.
5. **Norma mal elegida**: la regla de los 30 días de bajada de precio (LOCM
   art. 20, redacción del RDL 24/2021) se ciñe por su literal a **productos**;
   este negocio vende **servicios**.

→ Ningún informe `legal-*` / `datos-*` se da por bueno sin contrastar la
afirmación concreta que se vaya a usar.

## 8. Lo que sigue faltando y SOLO puede dar el cliente

| Dato | Por qué es imprescindible | Bloquea |
| --- | --- | --- |
| Razón social / nombre del titular | LSSI art. 10.1 a) | aviso legal → **publicar** |
| NIF / CIF | LSSI art. 10.1 a) | aviso legal → **publicar** |
| Email de contacto | LSSI art. 10.1 f) (medio de contacto directo y efectivo) | aviso legal → **publicar** |
| Precios vigentes | no los publica en su web; los de Treatwell hay que confirmarlos | sección de precios |
| Fotos reales del equipo + consentimiento | LO 1/1982 y RGPD | sección equipo |
| Ofertas vigentes reales | las 3 del prototipo son inventadas | sección ofertas |
| ¿Migramos `nailslashlasrozas.es`? | dominio, 301, SEO | despliegue |
