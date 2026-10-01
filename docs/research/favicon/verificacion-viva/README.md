# Verificación en vivo de F-28 (`favicon_marca`) — guiones

Los guiones con los que el lead midió @s9 y @s10 de `features/favicon_marca.feature` el 2026-10-01. El
informe con las cifras está en `progress/verificacion_viva_favicon_marca.md`. **No forman parte del build
ni de la suite**: dependen de `playwright-core`, que NO está en `package.json`.

## Cómo se repite

1. Copia esta carpeta FUERA del repo (los guiones escriben resultados y capturas en su propia carpeta) y,
   dentro, `npm install playwright-core@1.63.0`.
2. `pnpm build` en el repo y copia `dist/` dos veces junto a los guiones: `final-real/` y
   `final-contraprueba/` (a esta `s9.mjs` le quita los tres `<link>` de icono).
3. Variables: `REPO` (ruta del repo), `CHROME` (un `chrome.exe` de Chromium; se usó el de Playwright,
   `%LOCALAPPDATA%/ms-playwright/chromium-1243/chrome-win64/chrome.exe`), `DIR_REAL=final-real`,
   `DIR_CONTRA=final-contraprueba`.
4. `node s9.mjs` (servidor tipo GitHub Pages + sonda de `vite preview` + contraprueba), `node s9-preview.mjs`
   (`vite preview` detrás de un proxy que registra las peticiones), `REF=HEAD node s10.mjs` (cobertura de
   tinta; con `SIN_TRAZO_DIR` mide además los raster sin trazo del sabotaje 9) y, sobre la web publicada,
   `URL_WEB=https://cenit-digital.github.io/NailsLashStudioWeb/ ETIQUETA=despues node s9-web.mjs`.

## Por qué así

- **Registro del lado servidor**: Playwright no expone la petición del favicon (la hace el proceso del
  navegador, no la página); el servidor o el proxy sí la ven.
- **Perfil nuevo por sitio y con ventana**: sin caché de favicons, y un Chromium sin ventana puede no
  pedirlos.
- **Captura con `PrintWindow`** (`captura-ventana.ps1`, solo Windows) de la ventana cuyo proceso es el
  `CHROME` indicado: una captura de pantalla normal fotografía la ventana que esté delante.
