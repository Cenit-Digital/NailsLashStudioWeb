# Deuda — los precios del catálogo quedaron descolocados

Fecha: 2026-07-20 · Rama: `fix/titles` · **Estado: NO se corrige por decisión expresa de Pablo**

## Qué pasó

El commit `5a1345c` («feat(Catalogo): actualizar texto del botón de reserva y agregar propiedades
a la interfaz de categoría» — el mensaje no describe el cambio real) sustituyó en
`src/lib/demo/catalogo-demo.ts` las categorías **Pestañas** y **Cejas** por las del prototipo,
**Facial** y **Depilación**.

Los **nombres** de servicio se cambiaron a los del prototipo, pero los **precios se quedaron en su
posición del array**, emparejándose con el servicio que ocupara ese índice:

| Índice | Precio | Servicio ANTES (real) | Servicio AHORA | Precio en el prototipo |
| --- | --- | --- | --- | --- |
| cejas/depil 1 | `12 €` | Diseño de cejas | Cejas | `8 €` |
| cejas/depil 2 | `18 €` | Diseño + tinte | Labio superior | `6 €` |
| cejas/depil 3 | `30 €` | Laminado de cejas | Axilas | `12 €` |
| cejas/depil 4 | `35 €` | Laminado + tinte | **Medias piernas** | `18 €` |
| cejas/depil 5 | `10 €` | Depilación con hilo | **Piernas completas** | `28 €` |

## Las dos incoherencias visibles

1. **`Piernas completas` 10 € vs `Medias piernas` 35 €** — lo completo cuesta menos de un tercio
   que la mitad.
2. **`Relleno acrílico o gel` 38 € vs `Uñas acrílicas o gel` 35 €** — el relleno sale más caro que
   el juego completo.

Ninguna de las dos existe en el prototipo, donde los precios sí son coherentes.

## Por qué no se toca

Pablo, preguntado explícitamente el 2026-07-20, respondió: *«Que lo dejes como está, que lo he
tocado yo como estaba en el prototipo»*. Se respeta.

⚠️ Ojo al enseñar la demo: la web ofrece hoy **depilación de piernas completas por 10 €** y
anuncia categorías **Facial** y **Depilación** que, según el resto del código
(`src/components/Reserva.tsx:19`, `src/lib/demo/faq-demo.ts`, el comentario de
`src/pages/home.tsx:47` y el del propio `catalogo-demo.ts:5-6`), este salón **no ofrece**.

Si algún día se retoma: los precios reales anteriores están en `git show 5d24712 --
src/lib/demo/catalogo-demo.ts`.
