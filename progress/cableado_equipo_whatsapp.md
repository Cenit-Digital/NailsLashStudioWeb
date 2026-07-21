# Cableado — Equipo + BotonWhatsApp en la home

Tarea de CABLEADO (no TDD de feature nueva): montar dos componentes ya creados
por TDD (`src/components/Equipo.tsx`, `src/components/BotonWhatsApp.tsx`) en la
home, añadir el 7º enlace de la nav y ampliar la lista de mutación.

## Zona prohibida respetada
No se tocó ningún fichero del HERO (Hero.tsx, hero.module.scss, hero.test.tsx,
hero-estilos.test.ts, src/lib/trazo-marca.ts, src/assets/, tools/trazo-marca/,
features/hero*.feature). Los ~9 rojos del hero son AJENOS.

## Cambios
1. `src/pages/home.tsx`
   - Imports: `BotonWhatsApp` (antes de Cabecera) y `Equipo` (antes de Faq),
     orden alfabético por ruta.
   - Orden dentro de `<main>`: hero, Catalogo, PruebaColor, Destacados, Ofertas,
     **Equipo (NUEVO, tras Ofertas)**, **Reserva (SUBE, tras Equipo)**,
     **Galeria (BAJA, tras Reserva)**, Contacto, Faq. Comentarios de orden
     corregidos.
   - `<BotonWhatsApp/>` FUERA de `<main>`, hermano de `<Pie/>`.
2. `src/components/MenuNavegacion.tsx`
   - 7º `<li>` DENTRO del `<ul>` existente (no se creó otro `<ul>`: @s27 intacto),
     «Equipo» → `#equipo-titulo`, entre «Ofertas» y «Reserva». Docblock actualizado.
   - Necesario para la PUERTA DE ANCLAS VIVAS: `<Equipo/>` es `<section
     aria-labelledby="equipo-titulo">` (navegable) → sin el enlace, REGLA_INALCANZABLE
     rompería el build.
3. `stryker.config.json`
   - `mutate` += `src/components/Equipo.tsx`, `src/components/BotonWhatsApp.tsx`.
   - Verificado: `coverage.include` de vitest.config.ts ya cubre por glob
     (`src/components/**/*.tsx`).

## Verificación (cada una UNA vez)
- typecheck (`pnpm typecheck`): exit 0, 0 errores.
- lint (`pnpm lint`): exit 0, 0 errores, 3 warnings PRE-EXISTENTES en Equipo.tsx
  (`react-refresh/only-export-components` por exportar funciones puras junto al
  componente — fichero no editado por esta tarea; no rompen la puerta).
- build (`pnpm build`): exit 0. LAS 5 PUERTAS EN VERDE:
  1. Cascarón ✓  2. Placeholders ✓  3. Contraste (18 pares AA) ✓
  4. Terceros ✓  5. Anclas vivas ✓ (`#equipo-titulo` resuelve y la sección es
     alcanzable → igualdad de conjuntos con el 7º enlace).
- test (`pnpm test`): 30 ficheros, **883 passed, 0 failed**.
  - Rojos del hero (ajenos): 0 — la sesión paralela del hero los dejó en verde.
  - Rojos propios (fuera del hero): 0.

## Resultado
Cableado COMPLETO y VERDE de punta a punta. Ningún fichero del hero tocado.
El build no cayó por el cableado ni por el hero.
